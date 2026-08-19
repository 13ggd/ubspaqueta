/* ===========================================================================
   UBS Paquetá — lógica do site
   ---------------------------------------------------------------------------
   Você normalmente NÃO precisa mexer neste arquivo.
   Para mudar textos, endereço, telefone ou a planilha, edite js/config.js
   =========================================================================== */

(function(){
'use strict';

/* --------------------------------------------------------- constantes -- */
var K     = ['dom','seg','ter','qua','qui','sex','sab'];
var NOME  = {seg:'Segunda-feira',ter:'Terça-feira',qua:'Quarta-feira',
             qui:'Quinta-feira',sex:'Sexta-feira',sab:'Sábado',dom:'Domingo'};
var CURTO = {seg:'segunda',ter:'terça',qua:'quarta',qui:'quinta',
             sex:'sexta',sab:'sábado',dom:'domingo'};
var ORD   = ['seg','ter','qua','qui','sex','sab','dom'];

var SERVICOS = CONFIG.servicosReserva;
var AVISOS   = CONFIG.avisosReserva;
var ORIGEM   = 'reserva';   /* 'planilha' | 'reserva' | 'erro' */

/* ------------------------------------------------------------ ajudas -- */
function mm(t){ var p = t.split(':'); return Number(p[0])*60 + Number(p[1]); }
function hh(v){
  return String(Math.floor(v/60)).padStart(2,'0') + ':' + String(v%60).padStart(2,'0');
}
/* "07:00" vira "7h"; "08:30" vira "8h30" — jeito que as pessoas falam */
function hf(t){
  var p = t.split(':');
  return p[1] === '00' ? Number(p[0]) + 'h' : Number(p[0]) + 'h' + p[1];
}
function fala(f){
  return f ? 'das ' + hf(f.split('-')[0]) + ' às ' + hf(f.split('-')[1]) : 'Fechado';
}
function iso(d){
  return d.getFullYear() + '-' +
         String(d.getMonth()+1).padStart(2,'0') + '-' +
         String(d.getDate()).padStart(2,'0');
}
function brData(s){ return s.split('-').reverse().join('/'); }

/* Evita que texto vindo da planilha quebre a página */
function limpo(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/* ------------------------------------------------------- leitor de CSV -- */
/* Respeita vírgulas dentro de aspas, para os textos longos dos avisos. */
function lerCSV(txt){
  var linhas = [], campo = '', linha = [], aspas = false, i, c;
  for(i = 0; i < txt.length; i++){
    c = txt[i];
    if(aspas){
      if(c === '"'){
        if(txt[i+1] === '"'){ campo += '"'; i++; } else { aspas = false; }
      } else { campo += c; }
    } else {
      if(c === '"'){ aspas = true; }
      else if(c === ','){ linha.push(campo); campo = ''; }
      else if(c === '\n'){ linha.push(campo); linhas.push(linha); linha = []; campo = ''; }
      else if(c !== '\r'){ campo += c; }
    }
  }
  if(campo !== '' || linha.length){ linha.push(campo); linhas.push(linha); }
  return linhas;
}

/* Primeira linha do CSV vira o nome das colunas */
function paraObjetos(txt){
  var l = lerCSV(txt).filter(function(x){
    return x.some(function(c){ return c.trim() !== ''; });
  });
  if(l.length < 2) return [];
  var cab = l[0].map(function(c){ return c.trim().toLowerCase(); });
  return l.slice(1).map(function(linha){
    var o = {};
    cab.forEach(function(nome, i){ o[nome] = (linha[i] || '').trim(); });
    return o;
  });
}

/* Aceita 19/08/2026, 19-08-2026 ou 2026-08-19 e devolve sempre 2026-08-19 */
function normalizaData(s){
  s = (s || '').trim();
  if(!s) return null;
  if(/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  var m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if(m) return m[3] + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0');
  var d = new Date(s);
  return isNaN(d.getTime()) ? null : iso(d);
}

/* Aceita "7h às 19h", "07:00-19:00", "7-19", "Fechado" — devolve "07:00-19:00" */
function normalizaHorario(s){
  s = (s || '').trim();
  if(!s) return '';
  if(/^fechado|^n[aã]o|^-$/i.test(s)) return '';
  var n = s.replace(/h(?!\s*\d)/gi, ':00')
           .replace(/h/gi, ':')
           .replace(/\s*(às|as|até|ate|–|—|a)\s*/gi, '-')
           .replace(/[^\d:\-]/g, '');
  var p = n.split('-').filter(Boolean);
  if(p.length < 2) return '';
  function arruma(t){
    var q = t.split(':');
    var h = Number(q[0]), m = Number(q[1] || 0);
    if(isNaN(h) || h > 23 || isNaN(m) || m > 59) return null;
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
  }
  var a = arruma(p[0]), b = arruma(p[1]);
  return (a && b) ? a + '-' + b : '';
}

/* -------------------------------------------------- buscar a planilha -- */
function urlCSV(aba){
  return 'https://docs.google.com/spreadsheets/d/' + CONFIG.planilhaId +
         '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(aba) +
         '&t=' + Date.now();
}

function planilhaConfigurada(){
  return CONFIG.planilhaId &&
         CONFIG.planilhaId.indexOf('COLE_O_ID') !== 0 &&
         CONFIG.planilhaId.length > 20;
}

function buscarPlanilha(){
  if(!planilhaConfigurada()){
    ORIGEM = 'reserva';
    return Promise.resolve();
  }
  return Promise.all([
    fetch(urlCSV(CONFIG.abaServicos)),
    fetch(urlCSV(CONFIG.abaAvisos))
  ]).then(function(r){
    if(!r[0].ok || !r[1].ok) throw new Error('planilha não respondeu');
    return Promise.all([r[0].text(), r[1].text()]);
  }).then(function(t){
    var servicos = paraObjetos(t[0]);
    var avisos   = paraObjetos(t[1]);

    var listaS = servicos.map(function(r){
      return {
        id:   r.id || r.nome,
        nome: r.nome,
        para: r.para || r.descricao || '',
        h: {
          seg:normalizaHorario(r.seg), ter:normalizaHorario(r.ter),
          qua:normalizaHorario(r.qua), qui:normalizaHorario(r.qui),
          sex:normalizaHorario(r.sex), sab:normalizaHorario(r.sab),
          dom:normalizaHorario(r.dom)
        }
      };
    }).filter(function(s){ return s.nome; });

    /* Só troca se a planilha realmente trouxe serviços.
       Assim uma planilha vazia por engano não apaga o site. */
    if(listaS.length) SERVICOS = listaS;

    AVISOS = avisos.map(function(r){
      var ini = normalizaData(r.inicio || r.data_inicio);
      return {
        tipo:       (r.tipo || 'recado').toLowerCase().trim(),
        servico:    (r.servico || r.servico_id || '').trim(),
        titulo:     r.titulo || '',
        texto:      r.texto || '',
        inicio:     ini,
        fim:        normalizaData(r.fim || r.data_fim) || ini,
        novo:       normalizaHorario(r.novo || r.novo_horario),
        atualizado: r.atualizado || ''
      };
    }).filter(function(a){ return a.titulo && a.inicio; });

    ORIGEM = 'planilha';
  }).catch(function(e){
    console.error('Não consegui ler a planilha:', e);
    ORIGEM = 'erro';
  });
}

/* --------------------------------------------------- regras de horário -- */
function avisosDoDia(dataISO){
  return AVISOS.filter(function(a){
    return a.inicio <= dataISO && dataISO <= (a.fim || a.inicio);
  });
}
function avisoDe(id, dataISO){
  var r = avisosDoDia(dataISO).filter(function(a){ return a.servico === id; });
  return r.length ? r[0] : null;
}

function situacao(s, diaKey, dataISO, agora){
  var av = avisoDe(s.id, dataISO);
  var padrao = s.h[diaKey];

  if(av && av.tipo === 'fechado')
    return {cls:'alerta', sinal:'✕', palavra:'Fechado hoje', faixa:padrao, nova:null, av:av};

  var f = (av && av.tipo === 'atencao' && av.novo) ? av.novo : padrao;
  if(!f)
    return {cls:'off', sinal:'✕', palavra:'Não atende hoje', faixa:null, nova:null, av:null};

  var p = f.split('-');
  var ini = mm(p[0]), fim = mm(p[1]);
  var aberto = agora >= ini && agora < fim;
  var antes  = agora < ini;

  if(av && av.tipo === 'atencao' && av.novo)
    return {
      cls: aberto ? 'atencao' : 'off',
      sinal: aberto ? '!' : '✕',
      palavra: aberto ? 'Aberto, mas fecha mais cedo'
                      : (antes ? 'Abre às ' + hf(p[0]) : 'Já fechou hoje'),
      faixa:padrao, nova:f, av:av
    };

  return {
    cls: aberto ? 'on' : 'off',
    sinal: aberto ? '✓' : '✕',
    palavra: aberto ? 'Aberto agora' : (antes ? 'Abre às ' + hf(p[0]) : 'Já fechou hoje'),
    faixa:f, nova:null, av:null
  };
}

function proximoDia(s, data){
  for(var k = 1; k <= 7; k++){
    var d = new Date(data.getTime());
    d.setDate(d.getDate() + k);
    var key = K[d.getDay()];
    var a = avisoDe(s.id, iso(d));
    if(s.h[key] && (!a || a.tipo !== 'fechado'))
      return {key:key, faixa:s.h[key], amanha:(k === 1)};
  }
  return null;
}

/* ------------------------------------------- partes fixas (do config) -- */
function montarFixos(){
  var u = CONFIG.unidade;

  document.getElementById('orgao').textContent     = u.orgao;
  document.getElementById('nome-unidade').textContent = u.nome;
  document.getElementById('subtitulo').textContent = u.subtitulo;
  document.title = u.nome + ' — Está aberta agora?';

  var bt = document.getElementById('bt-ligar');
  bt.href = 'tel:' + u.telefoneLink;
  document.getElementById('bt-mapa').href = u.mapa;

  document.getElementById('info-endereco').innerHTML =
    limpo(u.endereco) + '<br>' + limpo(u.bairro);
  document.getElementById('info-telefone').innerHTML =
    '<a href="tel:' + limpo(u.telefoneLink) + '">' + limpo(u.telefone) + '</a>';
  document.getElementById('info-secretaria').innerHTML =
    '<a href="tel:' + limpo(u.secretariaLink) + '">' + limpo(u.secretaria) + '</a>';
  document.getElementById('info-mapa').innerHTML =
    '<a href="' + limpo(u.mapa) + '" target="_blank" rel="noopener">Abrir o mapa no celular</a>';

  var ur = CONFIG.urgencia;
  document.getElementById('samu').href = 'tel:' + ur.telefone;
  document.getElementById('samu-num').textContent = ur.telefone;
  document.getElementById('samu-lab').innerHTML = ur.chamada;

  document.getElementById('lugares').innerHTML = ur.lugares.map(function(l){
    return '<div class="lugar">' +
      '<p class="lugar-nome">' + limpo(l.nome) + '</p>' +
      '<p class="lugar-det">' + limpo(l.det) + '</p>' +
      '<span class="lugar-hora">' + limpo(l.hora) + '</span></div>';
  }).join('');

  document.getElementById('rodape').textContent =
    'Página cuidada pela equipe da ' + u.nome + '.';
}

/* --------------------------------------------------- desenhar a página -- */
function desenhar(data, agora){
  var diaKey  = K[data.getDay()];
  var dataISO = iso(data);
  var base = SERVICOS[0];
  if(!base) return;

  var st = situacao(base, diaKey, dataISO, agora);
  var aberta = (st.cls === 'on');
  var cx = document.getElementById('status');

  if(aberta){
    cx.innerHTML =
      '<div class="cartao-status sim">' +
        '<div class="marca" aria-hidden="true">✓</div>' +
        '<p class="status-palavra">O posto está aberto</p>' +
        '<p class="status-detalhe">Fecha hoje às ' + hf(st.faixa.split('-')[1]) + '</p>' +
        '<p class="status-hoje">Hoje é ' + NOME[diaKey].toLowerCase() + ', ' + hf(hh(agora)) + '</p>' +
      '</div>';
  } else {
    var p = proximoDia(base, data);
    var antes = st.faixa && agora < mm(st.faixa.split('-')[0]);
    var quando = '';
    if(antes) quando = 'Abre hoje às ' + hf(st.faixa.split('-')[0]);
    else if(p) quando = 'Abre ' + (p.amanha ? 'amanhã' : 'na ' + CURTO[p.key]) +
                        ' às ' + hf(p.faixa.split('-')[0]);
    cx.innerHTML =
      '<div class="cartao-status nao">' +
        '<div class="marca" aria-hidden="true">✕</div>' +
        '<p class="status-palavra">O posto está fechado</p>' +
        '<p class="status-detalhe">' + quando + '</p>' +
        '<p class="status-hoje">Hoje é ' + NOME[diaKey].toLowerCase() + ', ' + hf(hh(agora)) +
        '. Se for urgente, ligue ' + CONFIG.urgencia.telefone + '.</p>' +
      '</div>';
  }

  /* avisos */
  var ativos = avisosDoDia(dataISO);
  var box = document.getElementById('avisos');
  if(!ativos.length){
    box.innerHTML =
      '<div class="tudo-certo"><span class="ok" aria-hidden="true">✓</span>' +
      '<p>Hoje está tudo funcionando no horário de sempre. Nenhum serviço fechado.</p></div>';
  } else {
    box.innerHTML = ativos.map(function(a){
      var cls  = a.tipo === 'atencao' ? 'atencao' : (a.tipo === 'recado' ? 'recado' : '');
      var selo = a.tipo === 'atencao' ? '⚠ Mudou o horário'
               : (a.tipo === 'recado' ? 'ⓘ Recado' : '✕ Fechado');
      var per  = (a.fim && a.fim !== a.inicio)
               ? 'De ' + brData(a.inicio) + ' até ' + brData(a.fim)
               : 'Dia ' + brData(a.inicio);
      return '<div class="aviso ' + cls + '">' +
        '<span class="av-tarja">' + selo + '</span>' +
        '<p class="av-titulo">' + limpo(a.titulo) + '</p>' +
        '<p class="av-texto">' + limpo(a.texto) +
          (a.novo ? ' Novo horário: <strong>' + fala(a.novo) + '</strong>.' : '') + '</p>' +
        '<p class="av-quando">Quando: ' + per +
          (a.atualizado ? ' · Avisado em ' + limpo(a.atualizado) : '') + '</p>' +
      '</div>';
    }).join('');
  }

  /* serviços */
  document.getElementById('servicos').innerHTML = SERVICOS.map(function(s){
    var t = situacao(s, diaKey, dataISO, agora);
    var hora;
    if(t.cls === 'alerta')      hora = '<s>' + fala(t.faixa) + '</s>';
    else if(t.nova)             hora = '<s>' + fala(t.faixa) + '</s> → <strong>' + fala(t.nova) + '</strong>';
    else if(t.faixa)            hora = 'Hoje ' + fala(t.faixa);
    else {
      var pr = proximoDia(s, data);
      hora = pr ? 'Volta a atender ' + (pr.amanha ? 'amanhã' : 'na ' + CURTO[pr.key]) : '';
    }

    var motivo = t.av
      ? '<div class="sv-motivo ' + (t.av.tipo === 'atencao' ? 'atencao' : '') + '">' +
        limpo(t.av.texto) + '</div>'
      : '';

    var semana = ORD.map(function(k){
      var v = s.h[k] ? fala(s.h[k]) : 'Não atende';
      return '<div class="semana-l ' + (k === diaKey ? 'hoje' : '') + '">' +
        '<span class="dia">' + NOME[k] + (k === diaKey ? ' — hoje' : '') + '</span>' +
        '<span class="val">' + v + '</span></div>';
    }).join('');

    return '<article class="servico ' + (t.cls === 'alerta' ? 'fechado-hoje' : '') + '">' +
      '<div class="sv-topo">' +
        '<h3 class="sv-nome">' + limpo(s.nome) + '</h3>' +
        '<p class="sv-para">' + limpo(s.para) + '</p>' +
        '<div class="sv-estado ' + t.cls + '">' +
          '<span class="sv-sinal" aria-hidden="true">' + t.sinal + '</span>' +
          '<span class="sv-txt">' +
            '<span class="sv-palavra">' + t.palavra + '</span>' +
            '<span class="sv-hora">' + hora + '</span>' +
          '</span>' +
        '</div>' +
      '</div>' + motivo +
      '<details class="semana"><summary>Ver os dias da semana</summary>' +
        '<div class="semana-lista">' + semana + '</div></details>' +
    '</article>';
  }).join('');

  /* de onde vieram os dados */
  var fd = document.getElementById('fonte-dados');
  var agoraTxt = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  if(ORIGEM === 'planilha'){
    fd.className = 'fonte-dados';
    fd.textContent = 'Horários e avisos carregados da planilha da unidade às ' + agoraTxt + '.';
  } else if(ORIGEM === 'erro'){
    fd.className = 'fonte-dados erro';
    fd.textContent = 'Não foi possível carregar a planilha agora. A página está mostrando os ' +
      'últimos horários conhecidos. Em caso de dúvida, ligue para o posto: ' +
      CONFIG.unidade.telefone + '.';
  } else {
    fd.className = 'fonte-dados';
    fd.textContent = 'Esta página está usando os dados internos do site. ' +
      'A planilha da unidade ainda não foi configurada.';
  }
}

/* ------------------------------------------------------- os controles -- */
var campoData, campoHora, lbl;

function atualiza(){
  var v = Number(campoHora.value);
  lbl.textContent = hh(v);
  var p = campoData.value.split('-').map(Number);
  desenhar(new Date(p[0], p[1]-1, p[2]), v);
}

function usarAgora(){
  var d = new Date();
  campoData.value = iso(d);
  campoHora.value = Math.round((d.getHours()*60 + d.getMinutes())/15)*15;
  atualiza();
}

function iniciar(){
  montarFixos();

  /* botões de tamanho de letra */
  var botoes = document.querySelectorAll('.letra button');
  Array.prototype.forEach.call(botoes, function(b){
    b.addEventListener('click', function(){
      Array.prototype.forEach.call(botoes, function(o){
        o.setAttribute('aria-pressed','false');
      });
      b.setAttribute('aria-pressed','true');
      document.documentElement.style.setProperty('--esc', b.dataset.esc);
    });
  });

  campoData = document.getElementById('data');
  campoHora = document.getElementById('hora');
  lbl       = document.getElementById('lbl');

  /* A barra de teste só aparece se o endereço terminar com ?teste */
  if(location.search.indexOf('teste') !== -1){
    document.body.classList.add('com-teste');
    campoData.addEventListener('input', atualiza);
    campoHora.addEventListener('input', atualiza);
    document.getElementById('bt-agora').addEventListener('click', usarAgora);
  }

  document.getElementById('status').innerHTML =
    '<div class="cartao-status carregando">' +
      '<div class="marca" aria-hidden="true">…</div>' +
      '<p class="status-palavra">Carregando horários</p>' +
      '<p class="status-detalhe">Um momento, por favor.</p>' +
    '</div>';

  buscarPlanilha().then(function(){
    usarAgora();

    /* relê a planilha de tempos em tempos, para pegar avisos novos */
    setInterval(function(){
      buscarPlanilha().then(atualiza);
    }, (CONFIG.recarregarACada || 5) * 60 * 1000);

    /* atualiza o relógio na virada de cada minuto, se não estiver testando */
    setInterval(function(){
      if(!document.body.classList.contains('com-teste')) usarAgora();
    }, 60 * 1000);

    /* quando a pessoa volta para a aba, recalcula na hora */
    document.addEventListener('visibilitychange', function(){
      if(!document.hidden && !document.body.classList.contains('com-teste')){
        buscarPlanilha().then(usarAgora);
      }
    });
  });
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}

})();
