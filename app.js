/* ======================================================================
   FIM DA PARTE QUE VOCE EDITA
   Daqui para baixo e a logica do site.
   ====================================================================== */

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
var MESES = ['janeiro','fevereiro','março','abril','maio','junho','julho',
             'agosto','setembro','outubro','novembro','dezembro'];

var SETORES  = CONFIG.setoresReserva;
var AVISOS   = CONFIG.avisosReserva;
var EQUIPE   = CONFIG.equipeReserva;
var FALTAS   = CONFIG.faltasReserva;
var RUAS     = CONFIG.areasEquipeReserva;   /* ruas atendidas por equipe — [{equipe, ruas:[...]}] */
var REUNIOES = CONFIG.notasRecorrentesReserva;   /* regras "toda 2ª/4ª quarta..." — [{setores, dia, ocorrencias, texto}] */
var ORIGEM   = 'reserva';   /* 'planilha' | 'reserva' | 'erro' */
var AVISOS_DA_PLANILHA = false;   /* true só quando horarios ou recados vieram da planilha de verdade */
var painelPessoa = null;   /* preenchido em iniciar(); abre o detalhe de quem foi clicado na equipe */

/* --------------------------------------------------------- favicon -- */
/* Troca o ícone da aba do navegador por um emoji. Desenha o emoji num
   canvas (uma área de desenho que fica invisível na página) e exporta
   como PNG — isso funciona de forma bem mais confiável entre navegadores
   diferentes (inclusive Safari do iPhone) do que gerar um SVG direto. */
function definirFavicon(emoji){
  try{
    var canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    var ctx = canvas.getContext('2d');
    if(!ctx) return;
    ctx.clearRect(0, 0, 64, 64);
    ctx.font = '52px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 32, 36);
    var url = canvas.toDataURL('image/png');

    var link = document.getElementById('favicon-dinamico');
    if(!link){
      link = document.createElement('link');
      link.id = 'favicon-dinamico';
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = url;
  } catch(e){
    /* Se o navegador não suportar, o site continua funcionando
       normalmente — só não troca o ícone da aba. */
  }
}

/* --------------------------------------------- ícone de instalação -- */
/* Desenha um ícone simples (cruz de saúde) num canvas e usa como ícone
   de "adicionar à tela inicial" — tanto para iPhone (apple-touch-icon)
   quanto para Android (manifest, gerado na hora via Blob, sem precisar
   de um arquivo manifest.json separado). Roda uma vez só, ao carregar. */
function prepararInstalacao(){
  try{
    var canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 180;
    var ctx = canvas.getContext('2d');
    if(!ctx) return;
    ctx.fillStyle = '#02301A';
    ctx.fillRect(0, 0, 180, 180);
    ctx.fillStyle = '#fff';
    ctx.fillRect(76, 34, 28, 112);   /* cruz — traço vertical */
    ctx.fillRect(34, 76, 112, 28);   /* cruz — traço horizontal */
    var url = canvas.toDataURL('image/png');

    var iconeApple = document.createElement('link');
    iconeApple.rel = 'apple-touch-icon';
    iconeApple.href = url;
    document.head.appendChild(iconeApple);

    var manifest = {
      name: CONFIG.unidade.nome,
      short_name: CONFIG.unidade.nome,
      description: 'Horários, avisos e telefones da ' + CONFIG.unidade.nome,
      start_url: '.',
      display: 'standalone',
      background_color: '#F0F3F0',
      theme_color: '#02301A',
      icons: [{src: url, sizes: '180x180', type: 'image/png'}]
    };
    var blob = new Blob([JSON.stringify(manifest)], {type: 'application/manifest+json'});
    var linkManifest = document.createElement('link');
    linkManifest.rel = 'manifest';
    linkManifest.href = URL.createObjectURL(blob);
    document.head.appendChild(linkManifest);
  } catch(e){
    /* Sem suporte a isso, o site funciona normal — só não vai dar pra
       "instalar" com esse ícone específico. */
  }
}

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
  if(!f) return 'Fechado';
  /* Um setor pode ter mais de um bloco no dia (ex: fecha pro almoço).
     Cada bloco vem separado por vírgula: "07:00-12:00,13:00-19:00". */
  return f.split(',').map(function(bloco){
    var p = bloco.split('-');
    return 'das ' + hf(p[0]) + ' às ' + hf(p[1]);
  }).join(' e ');
}
function iso(d){
  return d.getFullYear() + '-' +
         String(d.getMonth()+1).padStart(2,'0') + '-' +
         String(d.getDate()).padStart(2,'0');
}
function brData(s){ return s.split('-').reverse().join('/'); }

/* Lista os dias do mês (ano/mes) em que um dia da semana (chave de K, ex:
   'qua') cai na 1ª, 2ª, 3ª... ocorrência daquele mês — a base pra
   transformar "2ª e 4ª quarta-feira" numa data de verdade, sem ninguém
   ter que contar no calendário. */
function diasDoMesPorOcorrencia(ano, mes, diaSemana, ocorrencias){
  var alvo = K.indexOf(diaSemana);
  var dias = [], ocorrencia = 0;
  var d = new Date(ano, mes, 1);
  while(d.getMonth() === mes){
    if(d.getDay() === alvo){
      ocorrencia++;
      if(ocorrencias.indexOf(ocorrencia) !== -1) dias.push(d.getDate());
    }
    d.setDate(d.getDate() + 1);
  }
  return dias;
}

/* Mesma coisa, mas pulando pro mês seguinte se todas as datas deste mês
   já passaram — assim o aviso nunca mostra uma data que já ficou pra
   trás, sempre aponta pra próxima ocorrência de verdade. */
function proximasDatas(data, diaSemana, ocorrencias){
  var dias = diasDoMesPorOcorrencia(data.getFullYear(), data.getMonth(), diaSemana, ocorrencias)
    .filter(function(dia){ return dia >= data.getDate(); });
  var mes = data.getMonth();
  if(!dias.length){
    var prox = new Date(data.getFullYear(), data.getMonth() + 1, 1);
    dias = diasDoMesPorOcorrencia(prox.getFullYear(), prox.getMonth(), diaSemana, ocorrencias);
    mes = prox.getMonth();
  }
  return {dias: dias, mes: mes};
}

function formatarDatas(dias, mes){
  if(!dias.length) return '';
  var nomeMes = MESES[mes];
  var rotulo = dias.length === 1
    ? 'No dia ' + dias[0]
    : 'Nos dias ' + dias.slice(0, -1).join(', ') + ' e ' + dias[dias.length - 1];
  return rotulo + ' de ' + nomeMes;
}

/* Junta as regras de REUNIOES que valem pra esse setor, já com a data de
   verdade calculada em cima da data mostrada na tela (respeita a barra
   de teste "?teste", não usa o relógio real direto). */
function notasRecorrentesDoSetor(setorId, data){
  return (REUNIOES || [])
    .filter(function(r){ return r.setores.indexOf(setorId) !== -1; })
    .map(function(r){
      var p = proximasDatas(data, r.dia, r.ocorrencias);
      var datas = formatarDatas(p.dias, p.mes);
      return datas ? datas + ', ' + r.texto : '';
    })
    .filter(Boolean);
}

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

/* Aceita "7h às 19h", "07:00-19:00", "7-19", "Fechado" — devolve "07:00-19:00".
   Também aceita mais de um bloco no mesmo dia — útil pra representar horário
   de almoço. Vírgula OU espaço separam os blocos, então "7h às 12h, 13h às 19h"
   e "7-12 13-19" viram os dois "07:00-12:00,13:00-19:00" — isso evita que
   esquecer a vírgula faça o dia inteiro sumir como "não atende".
   Minuto com só 1 dígito (ex: "18:3") é rejeitado em vez de virar "18:03"
   por engano — mais seguro mostrar "não atende" do que um horário errado. */
function normalizaHorario(s){
  s = (s || '').trim();
  if(!s) return '';
  if(/^fechado|^n[aã]o|^-$/i.test(s)) return '';

  function arruma(t){
    var q = t.split(':');
    var h = Number(q[0]);
    var mTexto = q[1];
    if(mTexto !== undefined && mTexto.length !== 2) return null;
    var m = Number(mTexto || 0);
    if(isNaN(h) || h > 23 || isNaN(m) || m > 59) return null;
    return String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
  }

  var limpo = s
    .replace(/h(?!\s*\d)/gi, ':00')
    .replace(/h/gi, ':')
    .replace(/\s*(às|as|até|ate|–|—|a)\s*/gi, '-')
    .replace(/,/g, ' ')
    .replace(/[^\d: \-]/g, '');

  var blocos = limpo.match(/\d{1,2}(?::\d{1,2})?-\d{1,2}(?::\d{1,2})?/g) || [];
  return blocos.map(function(bloco){
    var p = bloco.split('-');
    var a = arruma(p[0]), b = arruma(p[1]);
    return (a && b) ? a + '-' + b : '';
  }).filter(Boolean).join(',');
}

/* -------------------------------------------------- buscar a planilha -- */
function urlCSV(aba){
  return 'https://docs.google.com/spreadsheets/d/' + CONFIG.planilhaId +
         '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(aba) +
         '&t=' + Date.now();
}

/* Busca com um limite de tempo. Sem isso, numa rede lenta ou instável,
   a página podia ficar presa em "Carregando horários" para sempre —
   depois de 8 segundos, desiste e segue com os dados que já tem. */
function buscarComLimite(url, segundos){
  var controle = ('AbortController' in window) ? new AbortController() : null;
  var timer = controle ? setTimeout(function(){ controle.abort(); }, (segundos || 8) * 1000) : null;
  return fetch(url, controle ? {signal: controle.signal} : undefined)
    .finally(function(){ if(timer) clearTimeout(timer); });
}

function planilhaConfigurada(){
  return CONFIG.planilhaId &&
         CONFIG.planilhaId.indexOf('COLE_O_ID') !== 0 &&
         CONFIG.planilhaId.length > 20;
}

/* Lê a caixinha de marcar (checkbox) da planilha. O Google Sheets exporta
   como TRUE/FALSE ou, em planilhas em português, VERDADEIRO/FALSO —
   aceitamos os dois. Se a coluna estiver vazia ou não existir, considera
   ativo (assim planilhas antigas, sem essa coluna, continuam funcionando). */
function paraBooleano(v){
  if(v === undefined || v === null) return true;
  var s = String(v).trim().toLowerCase();
  if(s === '') return true;
  return !(s === 'false' || s === 'falso' || s === '0' || s === 'nao' || s === 'não');
}

function buscarPlanilha(){
  if(!planilhaConfigurada()){
    ORIGEM = 'reserva';
    return Promise.resolve();
  }

  /* setores é a única aba obrigatória — sem ela o site não sabe nada
     sobre horários, então um erro aqui marca ORIGEM como 'erro'. */
  var principal = buscarComLimite(urlCSV(CONFIG.abaSetores)).then(function(r){
    if(!r.ok) throw new Error('planilha não respondeu');
    return r.text();
  }).then(function(txt){
    var listaS = paraObjetos(txt).map(function(r){
      return {
        id:   r.setor || r.id || r.nome,
        nome: r.nome,
        para: r.para || r.descricao || '',
        levar: r.levar || r.trazer || '',
        h: {
          seg:normalizaHorario(r.seg), ter:normalizaHorario(r.ter),
          qua:normalizaHorario(r.qua), qui:normalizaHorario(r.qui),
          sex:normalizaHorario(r.sex), sab:normalizaHorario(r.sab),
          dom:normalizaHorario(r.dom)
        }
      };
    }).filter(function(s){ return s.nome; });

    /* Só troca se a planilha realmente trouxe setores.
       Assim uma planilha vazia por engano não apaga o site. */
    if(listaS.length) SETORES = listaS;
    ORIGEM = 'planilha';
  }).catch(function(e){
    console.error('Não consegui ler setores da planilha:', e);
    ORIGEM = 'erro';
  });

  /* Aba "mudancas-horario": cada linha é sobre UM setor específico. Se a coluna
     "novo" tiver um horário, é mudança de horário; se estiver vazia, é
     fechamento do dia todo. Não existe coluna "tipo" aqui de propósito —
     tira a chance de escolher a opção errada. */
  var horarios = buscarComLimite(urlCSV(CONFIG.abaHorarios)).then(function(r){
    if(!r.ok) throw new Error('sem aba horarios');
    return r.text();
  }).then(function(txt){
    return paraObjetos(txt).map(function(r){
      var ini  = normalizaData(r.inicio || r.data_inicio);
      var novo = normalizaHorario(r.novo || r.novo_horario);
      return {
        tipo:       novo ? 'atencao' : 'fechado',
        setor:      (r.setor || r.setor_id || '').trim(),
        titulo:     r.titulo || '',
        texto:      r.texto || '',
        inicio:     ini,
        fim:        normalizaData(r.fim || r.data_fim) || ini,
        novo:       novo,
        ativo:      paraBooleano(r.ativo)
      };
    }).filter(function(a){ return a.setor; });
  }).catch(function(e){
    console.error('Não consegui ler horarios da planilha:', e);
    return null;   /* null = "não deu pra ler", diferente de [] = "leu e está vazia" */
  });

  /* Aba "recados": avisos gerais, sem ligação com nenhum setor. */
  var recados = buscarComLimite(urlCSV(CONFIG.abaRecados)).then(function(r){
    if(!r.ok) throw new Error('sem aba recados');
    return r.text();
  }).then(function(txt){
    return paraObjetos(txt).map(function(r){
      var ini = normalizaData(r.inicio || r.data_inicio);
      return {
        tipo:       'recado',
        setor:      '',
        titulo:     r.titulo || '',
        texto:      r.texto || '',
        inicio:     ini,
        fim:        normalizaData(r.fim || r.data_fim) || ini,
        novo:       '',
        ativo:      paraBooleano(r.ativo)
      };
    }).filter(function(a){ return a.titulo; });
  }).catch(function(e){
    console.error('Não consegui ler recados da planilha:', e);
    return null;
  });

  /* A aba "equipe" é buscada à parte: se ela ainda não existir, isso não
     pode derrubar horários e avisos, que são mais importantes. */
  var equipe = buscarComLimite(urlCSV(CONFIG.abaEquipe)).then(function(r){
    if(!r.ok) throw new Error('sem aba equipe');
    return r.text();
  }).then(function(txt){
    var lista = paraObjetos(txt).map(function(r){
      return {
        nome:   r.nome || '',
        funcao: r.funcao || r['função'] || '',
        equipe: r.equipe || r.time || r.grupo || '',
        setor:  r.setor || '',
        foto:   r.foto || r.imagem || r.foto_url || '',
        obs:    r.obs || r.observacao || r['observação'] || '',
        /* Horário do TIME, não da pessoa — só precisa preencher numa linha
           por equipe (ex: só na médica) que o site acha sozinho, olhando
           quem tiver esse campo preenchido dentro do mesmo grupo "equipe". */
        horario: r.horario || r['horário'] || ''
      };
    }).filter(function(p){ return p.nome; });
    /* Diferente de setores: aqui uma planilha vazia É um resultado válido
       (equipe ainda não cadastrada). Por isso troca mesmo que venha vazia —
       só mantém os dados de exemplo se a aba "equipe" nem existir ainda. */
    EQUIPE = lista;
  }).catch(function(){
    /* Sem aba equipe ainda — mantém os dados de reserva, sem barulho. */
  });

  /* Aba "faltas": pessoa, motivo, inicio, fim, ativo. Serve pra
     duas coisas — mostrar "ausente hoje" no card da pessoa, e (só quando
     ela for a ÚNICA pessoa ligada àquele setor) fechar o setor sozinho. */
  var faltas = buscarComLimite(urlCSV(CONFIG.abaFaltas)).then(function(r){
    if(!r.ok) throw new Error('sem aba faltas');
    return r.text();
  }).then(function(txt){
    var lista = paraObjetos(txt).map(function(r){
      var ini = normalizaData(r.inicio || r.data_inicio);
      return {
        pessoa:     (r.pessoa || r.nome || '').trim(),
        motivo:     r.motivo || '',
        inicio:     ini,
        fim:        normalizaData(r.fim || r.data_fim) || ini,
        ativo:      paraBooleano(r.ativo)
      };
    }).filter(function(f){ return f.pessoa && f.inicio; });
    FALTAS = lista;
  }).catch(function(){
    /* Sem aba faltas ainda — mantém os dados de reserva (vazio), sem barulho. */
  });

  /* Aba "ruas": equipe, rua — uma linha por rua atendida por cada equipe
     (área de abrangência). Igual a "equipe"/"faltas": opcional, e troca
     mesmo que venha vazia (só mantém a reserva se a aba nem existir). */
  var ruas = buscarComLimite(urlCSV(CONFIG.abaRuas)).then(function(r){
    if(!r.ok) throw new Error('sem aba ruas');
    return r.text();
  }).then(function(txt){
    var linhas = paraObjetos(txt).map(function(r){
      return {
        equipe: r.equipe || r.time || r.grupo || '',
        rua:    r.rua || r.endereco || r['endereço'] || ''
      };
    }).filter(function(x){ return x.equipe && x.rua; });
    var mapa = {}, ordem = [];
    linhas.forEach(function(x){
      if(!mapa[x.equipe]){ mapa[x.equipe] = []; ordem.push(x.equipe); }
      mapa[x.equipe].push(x.rua);
    });
    RUAS = ordem.map(function(equipe){ return { equipe: equipe, ruas: mapa[equipe] }; });
  }).catch(function(){
    /* Sem aba ruas ainda — mantém os dados de reserva, sem barulho. */
  });

  /* Aba "reunioes": setores, dia, ocorrencias, texto — regra tipo "toda
     2ª e 4ª quarta-feira do mês", em vez de uma linha nova a cada
     ocorrência: o site calcula as datas de verdade sozinho (mesma ideia
     de equipe/faltas/ruas — opcional, falha silenciosa). */
  var reunioes = buscarComLimite(urlCSV(CONFIG.abaReunioes)).then(function(r){
    if(!r.ok) throw new Error('sem aba reunioes');
    return r.text();
  }).then(function(txt){
    REUNIOES = paraObjetos(txt).map(function(r){
      return {
        setores: String(r.setores || '').split(',').map(function(s){ return s.trim(); }).filter(Boolean),
        dia: (r.dia || '').trim().toLowerCase(),
        ocorrencias: String(r.ocorrencias || '').split(',')
          .map(function(n){ return parseInt(n.trim(), 10); }).filter(function(n){ return !isNaN(n); }),
        texto: r.texto || ''
      };
    }).filter(function(r){
      return r.setores.length && K.indexOf(r.dia) !== -1 && r.ocorrencias.length && r.texto;
    });
  }).catch(function(){
    /* Sem aba reunioes ainda — mantém os dados de reserva, sem barulho. */
  });

  return Promise.all([principal, horarios, recados, equipe, faltas, ruas, reunioes]).then(function(res){
    var h = res[1], r = res[2];
    /* Só substitui os avisos de reserva se pelo menos uma das duas abas
       (horarios ou recados) respondeu de verdade. Se as duas ainda não
       existirem, mantém os avisos de exemplo, sem apagar nada. */
    if(h !== null || r !== null){
      AVISOS = (h || []).concat(r || []);
      /* Setor/datas preenchidos, mas título esquecido: em vez de descartar
         o aviso inteiro (perdendo o fechamento que a pessoa quis registrar),
         gera um título a partir do nome do setor. Só se aplica a avisos
         ligados a um setor — "recados" sem título continuam sendo
         ignorados, porque aí não sobra nenhuma pista do que se trata. */
      AVISOS.forEach(function(a){
        if(a.titulo || a.tipo === 'recado') return;
        if(a.setor === 'todos'){
          /* Sem "hoje" de propósito: esse título é gerado uma vez e reaproveitado
             em qualquer dia que o aviso for exibido — inclusive antes de começar
             a valer, na seção "Avisos futuros". A data certa já aparece embaixo,
             na linha "Quando:". */
          a.titulo = a.tipo === 'atencao' ? 'A UBS muda de horário' : 'A UBS não vai abrir';
          return;
        }
        var setor = SETORES.filter(function(s){ return s.id === a.setor; })[0];
        var nome = setor ? setor.nome : a.setor;
        a.titulo = a.tipo === 'atencao' ? nome + ' com horário alterado' : nome + ' não vai atender';
      });
      AVISOS_DA_PLANILHA = true;
    } else {
      AVISOS_DA_PLANILHA = false;
    }
    /* Depois de já ter AVISOS, EQUIPE e FALTAS todos atualizados, gera os
       fechamentos automáticos de setor com uma só pessoa responsável. */
    AVISOS = AVISOS.concat(sintetizarFechamentosPorFalta());
  });
}

/* --------------------------------------------------- regras de horário -- */
/* --------------------------------------------------------- feriados -- */
/* Calcula a data da Páscoa de um ano (algoritmo de Gauss/Meeus) — a
   partir dela dá pra achar Carnaval, Sexta-feira Santa e Corpus Christi,
   que mudam de data todo ano. Funciona pra qualquer ano, sem precisar
   atualizar nada. */
function calcularPascoa(ano){
  var a = ano % 19, b = Math.floor(ano/100), c = ano % 100;
  var d = Math.floor(b/4), e = b % 4;
  var f = Math.floor((b+8)/25), g = Math.floor((b-f+1)/3);
  var h = (19*a + b - d - g + 15) % 30;
  var i = Math.floor(c/4), k = c % 4;
  var l = (32 + 2*e + 2*i - h - k) % 7;
  var m = Math.floor((a + 11*h + 22*l) / 451);
  var mes = Math.floor((h + l - 7*m + 114) / 31);
  var dia = ((h + l - 7*m + 114) % 31) + 1;
  return new Date(ano, mes-1, dia);
}
function somaDias(data, n){
  var r = new Date(data.getTime());
  r.setDate(r.getDate() + n);
  return r;
}
/* Lista dos feriados de um ano específico — junta os fixos (mesmo dia
   todo ano) com os móveis (calculados a partir da Páscoa daquele ano). */
function feriadosDoAno(ano){
  var lista = CONFIG.feriadosFixos.map(function(f){
    return {data: ano + '-' + f.data, nome: f.nome};
  });
  var pascoa = calcularPascoa(ano);
  CONFIG.feriadosMoveis.forEach(function(f){
    lista.push({data: iso(somaDias(pascoa, f.deslocamento)), nome: f.nome});
  });
  return lista;
}
/* Diz se uma data (formato AAAA-MM-DD) é feriado, e qual — ou null. */
function feriadoInfo(dataISO){
  var ano = Number(dataISO.slice(0,4));
  var achado = feriadosDoAno(ano).filter(function(f){ return f.data === dataISO; });
  return achado.length ? achado[0] : null;
}

function avisosDoDia(dataISO){
  var lista = AVISOS.filter(function(a){
    if(a.ativo === false) return false;      /* checkbox desmarcado = nunca aparece */
    if(!a.inicio) return true;                /* sem data = fica ativo enquanto marcado */
    return a.inicio <= dataISO && dataISO <= (a.fim || a.inicio);
  });
  var fer = feriadoInfo(dataISO);
  if(fer){
    lista = [{
      tipo:'recado', setor:'', titulo:'Hoje é feriado',
      texto: fer.nome + '. A unidade não abre hoje.',
      inicio: dataISO, fim: dataISO, novo:'', ativo:true
    }].concat(lista);
  }
  return lista;
}

/* Avisos que já foram cadastrados mas ainda não começaram a valer —
   pra alguém não ser pego de surpresa chegando na unidade, ou só saber
   ao abrir o site bem em cima da hora. Ordenados pelo mais próximo primeiro. */
function avisosFuturos(dataISO){
  return AVISOS.filter(function(a){
    if(a.ativo === false) return false;
    return a.inicio && a.inicio > dataISO;
  }).sort(function(a, b){ return a.inicio < b.inicio ? -1 : (a.inicio > b.inicio ? 1 : 0); });
}

/* "todos" na coluna "setor" de mudancas-horario fecha a UBS inteira com
   uma linha só, em vez de precisar repetir o fechamento pra cada setor —
   útil pra um imprevisto (falta de energia, problema estrutural) que
   afeta a unidade toda de uma vez. */
function avisoDe(id, dataISO){
  var fer = feriadoInfo(dataISO);
  if(fer) return {tipo:'fechado', setor:id, titulo:'Fechado — feriado',
                  texto: fer.nome + '. A unidade não abre em feriados.', ativo:true};
  var r = avisosDoDia(dataISO).filter(function(a){ return a.setor === id || a.setor === 'todos'; });
  return r.length ? r[0] : null;
}

/* Mesma ideia de avisosDoDia, mas para a aba "faltas". */
function faltasDoDia(dataISO){
  return FALTAS.filter(function(f){
    if(f.ativo === false) return false;
    return f.inicio <= dataISO && dataISO <= (f.fim || f.inicio);
  });
}
function faltaDe(nomePessoa, dataISO){
  var r = faltasDoDia(dataISO).filter(function(f){ return f.pessoa === nomePessoa; });
  return r.length ? r[0] : null;
}

/* Lista os ids de setor de uma pessoa (o campo aceita mais de um,
   separado por vírgula). */
function setoresDe(pessoa){
  return String(pessoa.setor || '').split(',')
    .map(function(s){ return s.trim(); }).filter(Boolean);
}

/* O coração do fechamento automático por falta.
   Regra: só fecha um setor sozinho quando ele tem EXATAMENTE uma pessoa
   da equipe ligada a ele. Com duas ou mais, o site não tem como saber se
   as outras estão cobrindo o dia — nesse caso só mostra "ausente hoje"
   no card da pessoa, sem mexer no horário do setor (fica por conta de
   alguém confirmar e, se for o caso, fechar manualmente pela aba
   "mudancas-horario"). */
function sintetizarFechamentosPorFalta(){
  var sinteticos = [];

  FALTAS.forEach(function(f){
    if(f.ativo === false) return;

    var pessoa = EQUIPE.filter(function(p){ return p.nome.trim() === f.pessoa; })[0];
    if(!pessoa) return;

    setoresDe(pessoa).forEach(function(setorId){
      var cobertura = EQUIPE.filter(function(p){
        return setoresDe(p).indexOf(setorId) !== -1;
      });
      if(cobertura.length !== 1) return;   /* mais de uma pessoa cobre esse setor */

      /* já existe um aviso manual pro mesmo setor no mesmo período? não duplica */
      var jaTem = AVISOS.some(function(a){
        return a.setor === setorId && a.inicio === f.inicio && (a.fim || a.inicio) === (f.fim || f.inicio);
      });
      if(jaTem) return;

      var setor = SETORES.filter(function(s){ return s.id === setorId; })[0];
      var nomeSetor = setor ? setor.nome : setorId;

      sinteticos.push({
        tipo:'fechado', setor:setorId,
        titulo: nomeSetor + ' não vai atender',
        texto: pessoa.nome + ' está ausente hoje' + (f.motivo ? ' (' + f.motivo + ')' : '') +
               '. Como é a única pessoa responsável por esse setor, não há atendimento.',
        inicio: f.inicio, fim: f.fim || f.inicio,
        novo:'', ativo:true
      });
    });
  });

  return sinteticos;
}

function situacao(s, diaKey, dataISO, agora){
  var av = avisoDe(s.id, dataISO);
  var padrao = s.h[diaKey];

  if(av && av.tipo === 'fechado')
    return {cls:'alerta', sinal:'✕', palavra:'Fechado hoje', faixa:padrao, nova:null, av:av};

  var f = (av && av.tipo === 'atencao' && av.novo) ? av.novo : padrao;
  if(!f)
    return {cls:'off', sinal:'✕', palavra:'Não atende hoje', faixa:null, nova:null, av:null};

  /* f pode ter mais de um bloco no dia (ex: fecha pro almoço) — olha
     todos pra saber se está aberto agora, e qual é o próximo horário
     de abertura (pode ser depois do almoço, não só amanhã). */
  var blocos = f.split(',').map(function(b){
    var p = b.split('-');
    return {ini: mm(p[0]), fim: mm(p[1])};
  });
  var aberto = blocos.some(function(b){ return agora >= b.ini && agora < b.fim; });
  var proximaAbertura = null;
  blocos.forEach(function(b){
    if(agora < b.ini && (proximaAbertura === null || b.ini < proximaAbertura)) proximaAbertura = b.ini;
  });

  if(av && av.tipo === 'atencao' && av.novo)
    return {
      cls: aberto ? 'atencao' : 'off',
      sinal: aberto ? '!' : '✕',
      palavra: aberto ? 'Aberto, com horário diferente hoje'
                      : (proximaAbertura !== null ? 'Abre às ' + hf(hh(proximaAbertura)) : 'Já fechou hoje'),
      faixa:padrao, nova:f, av:av
    };

  return {
    cls: aberto ? 'on' : 'off',
    sinal: aberto ? '✓' : '✕',
    palavra: aberto ? 'Aberto agora' : (proximaAbertura !== null ? 'Abre às ' + hf(hh(proximaAbertura)) : 'Já fechou hoje'),
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

/* Olha TODOS os setores (não só o primeiro da planilha) para decidir se
   a unidade está aberta. Fica aberta enquanto qualquer setor estiver
   funcionando, e "fecha" no horário do último setor a fechar no dia. */
function statusGeral(diaKey, dataISO, agora){
  var abertoAgora = false, fechaAs = null, abreAs = null;

  SETORES.forEach(function(s){
    var t = situacao(s, diaKey, dataISO, agora);
    if(t.cls === 'alerta') return;           /* setor fechado por aviso hoje */
    var faixa = t.nova || t.faixa;
    if(!faixa) return;                       /* setor não atende hoje */

    /* pode ter mais de um bloco no dia (ex: fecha pro almoço) */
    faixa.split(',').forEach(function(bloco){
      var partes = bloco.split('-');
      var ini = mm(partes[0]), fim = mm(partes[1]);

      if(agora >= ini && agora < fim){
        abertoAgora = true;
        if(fechaAs === null || fim > fechaAs) fechaAs = fim;
      } else if(agora < ini){
        if(abreAs === null || ini < abreAs) abreAs = ini;
      }
    });
  });

  return {abertoAgora:abertoAgora, fechaAs:fechaAs, abreAs:abreAs};
}

/* Mesma ideia do proximoDia, mas somando todos os setores — usada quando
   nenhum setor abre mais hoje, para saber a hora mais cedo entre todos
   no próximo dia que tiver algo funcionando. */
function proximaAberturaGeral(data){
  for(var k = 1; k <= 7; k++){
    var d = new Date(data.getTime());
    d.setDate(d.getDate() + k);
    var key = K[d.getDay()];
    var dISO = iso(d);
    var menor = null;

    SETORES.forEach(function(s){
      var av = avisoDe(s.id, dISO);
      if(av && av.tipo === 'fechado') return;
      var faixa = (av && av.tipo === 'atencao' && av.novo) ? av.novo : s.h[key];
      if(!faixa) return;
      faixa.split(',').forEach(function(bloco){
        var ini = mm(bloco.split('-')[0]);
        if(menor === null || ini < menor) menor = ini;
      });
    });

    if(menor !== null) return {key:key, minutos:menor, amanha:(k === 1)};
  }
  return null;
}

/* ------------------------------------------- partes fixas (do config) -- */
function montarFixos(){
  var u = CONFIG.unidade;

  document.getElementById('orgao').textContent     = u.orgao;
  document.getElementById('nome-unidade').textContent = u.nome;
  document.getElementById('subtitulo').textContent = u.subtitulo;
  document.title = u.nome; /* desenhar() troca por "— Aberto agora" / "— Fechado agora" assim que carrega */

  var bt = document.getElementById('bt-ligar');
  bt.href = 'tel:' + u.telefoneLink;
  document.getElementById('bt-mapa').href = u.mapa;

  /* Foto do prédio — só aparece se CONFIG.unidade.foto estiver preenchido.
     Igual às fotos da equipe: nome de arquivo (na pasta fotos/) ou link
     completo. Se o arquivo não carregar, o quadro some sozinho. */
  var fotoEl = document.getElementById('foto-unidade');
  if(u.foto){
    fotoEl.src = urlFoto(u.foto);
    fotoEl.alt = 'Foto da ' + u.nome;
    fotoEl.hidden = false;
  }

  document.getElementById('info-endereco').innerHTML =
    limpo(u.endereco) + '<br>' + limpo(u.bairro);
  document.getElementById('info-telefone').innerHTML =
    (u.telefoneEncaminhamentos
      ? '<span class="tel-sub">Recepção: </span><a href="tel:' + limpo(u.telefoneLink) + '">' + limpo(u.telefone) + '</a>' +
        '<br><span class="tel-sub">Encaminhamentos: </span><a href="tel:' + limpo(u.telefoneEncaminhamentosLink) + '">' + limpo(u.telefoneEncaminhamentos) + '</a>'
      : '<a href="tel:' + limpo(u.telefoneLink) + '">' + limpo(u.telefone) + '</a>') +
    (u.avisoLigacao ? '<br><small style="font-weight:400">' + limpo(u.avisoLigacao) + '</small>' : '');
  document.getElementById('info-secretaria').innerHTML =
    '<a href="tel:' + limpo(u.secretariaLink) + '">' + limpo(u.secretaria) + '</a>';
  document.getElementById('info-mapa').innerHTML =
    '<a href="' + limpo(u.mapa) + '" target="_blank" rel="noopener">Abrir o mapa no celular</a>';

  /* Instagram — só aparece se CONFIG.unidade.instagram estiver preenchido. */
  if(u.instagram){
    document.getElementById('info-instagram').innerHTML =
      '<a href="' + limpo(u.instagram) + '" target="_blank" rel="noopener">Ver no Instagram</a>';
    document.getElementById('info-instagram-linha').hidden = false;
  }

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

  /* Telefones úteis (Polícia, CAPS, etc.) — fica escondido atrás de um
     "Outros telefones úteis ▾" pra não competir por atenção com o que
     realmente importa: os telefones e horário da própria UBS. */
  var telUteis = CONFIG.telefonesUteis || [];
  if(telUteis.length){
    document.getElementById('tel-uteis-lista').innerHTML = telUteis.map(function(t){
      return '<div class="tel-uteis-item">' +
        '<span>' + limpo(t.nome) + '</span>' +
        '<a href="tel:' + limpo(t.telefoneLink) + '">' + limpo(t.telefone) + '</a>' +
      '</div>';
    }).join('');
    document.getElementById('tel-uteis-bloco').hidden = false;
  }

  document.getElementById('rodape').textContent =
    'Página cuidada pela equipe da ' + u.nome + '.';
}

/* --------------------------------------------------- desenhar a página -- */
var ULTIMA_DATA = null, ULTIMA_AGORA = null;

/* Monta o card de um aviso — usado tanto na lista de hoje quanto na de
   avisos futuros. "futuro" ajusta o tempo verbal da tarja ("Mudou" vs
   "Vai mudar") — sem isso, um aviso que ainda não começou ficaria
   dizendo que algo já aconteceu, o que é falso e pode confundir. */
function cartaoAviso(a, futuro){
  var cls  = a.tipo === 'atencao' ? 'atencao' : (a.tipo === 'recado' ? 'recado' : '');
  var selo = a.tipo === 'atencao' ? (futuro ? '⚠ Vai mudar o horário' : '⚠ Mudou o horário')
           : (a.tipo === 'recado' ? 'ⓘ Recado' : (futuro ? '✕ Vai fechar' : '✕ Fechado'));
  var per = a.inicio
    ? ((a.fim && a.fim !== a.inicio) ? 'De ' + brData(a.inicio) + ' até ' + brData(a.fim) : 'Dia ' + brData(a.inicio))
    : '';
  var rodape = [];
  if(per) rodape.push('Quando: ' + per);
  var quandoHtml = rodape.length ? '<p class="av-quando">' + rodape.join(' · ') + '</p>' : '';
  var textoHtml = (a.texto || a.novo)
    ? '<p class="av-texto">' +
        (a.texto ? limpo(a.texto) + (a.novo ? '<br>' : '') : '') +
        (a.novo ? 'Novo horário: <strong>' + fala(a.novo) + '</strong>.' : '') +
      '</p>'
    : '';
  return '<div class="aviso ' + cls + '">' +
    '<span class="av-tarja">' + selo + '</span>' +
    '<p class="av-titulo">' + limpo(a.titulo) + '</p>' +
    textoHtml +
    quandoHtml +
  '</div>';
}

/* ------------------------------------------------------------- EQUIPE -- */
function iniciaisDe(nome){
  return String(nome || '').trim().split(/\s+/).filter(Boolean).slice(0,2)
    .map(function(w){ var m = w.match(/[A-Za-zÀ-ÿ]/); return m ? m[0] : ''; })
    .join('').toUpperCase();
}

/* Aceita tanto um link completo (https://...) quanto só o nome do arquivo,
   caso em que a foto é procurada na pasta configurada em CONFIG.pastaFotos. */
function urlFoto(f){
  f = String(f || '').trim();
  if(!f) return '';
  if(/^https?:\/\//i.test(f)) return f;
  return (CONFIG.pastaFotos || 'fotos/') + f;
}

function cartaoPessoa(p, dataISO){
  var iniciais = iniciaisDe(p.nome);
  var src = urlFoto(p.foto);
  var fotoHtml;
  if(src){
    /* Mostra a foto; se o arquivo não existir ou o link estiver quebrado,
       o onerror troca pela bolinha com as iniciais, sem deixar buraco. */
    fotoHtml =
      '<img class="pessoa-foto" src="' + limpo(src) + '" alt="" loading="lazy" ' +
        'onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
      '<div class="pessoa-foto" aria-hidden="true" style="display:none">' + limpo(iniciais || '?') + '</div>';
  } else {
    fotoHtml = '<div class="pessoa-foto" aria-hidden="true">' + limpo(iniciais || '?') + '</div>';
  }

  var falta = dataISO ? faltaDe(p.nome.trim(), dataISO) : null;
  var faltaHtml = falta
    ? '<p class="pessoa-ausente">🔴 Ausente hoje' + (falta.motivo ? ': ' + limpo(falta.motivo) : '') + '</p>'
    : '';

  return '<div class="pessoa' + (falta ? ' pessoa-com-falta' : '') + '" ' +
      'role="button" tabindex="0" aria-haspopup="dialog">' + fotoHtml +
    '<div class="pessoa-txt">' +
      '<p class="pessoa-nome">' + limpo(p.nome) + '</p>' +
      '<p class="pessoa-funcao">' + limpo(p.funcao) + '</p>' +
      (p.obs ? '<p class="pessoa-obs">' + limpo(p.obs) + '</p>' : '') +
      faltaHtml +
    '</div>' +
  '</div>';
}

/* Abre o painel de detalhe com a foto grande e as informações completas
   da pessoa clicada — chamado pelos listeners ligados nos cards depois
   que #equipe é (re)desenhado, em desenhar(). "horario" é o turno do
   TIME dela (achado entre as pessoas do mesmo grupo "equipe" — só
   costuma vir preenchido numa pessoa por time), não um campo dela
   mesma — por isso é passado à parte. */
function abrirPessoaPainel(p, horario, dataISO){
  var iniciais = iniciaisDe(p.nome);
  var src = urlFoto(p.foto);
  var fotoHtml = src
    ? '<img class="pessoa-foto-grande" src="' + limpo(src) + '" alt="" ' +
        'onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
      '<div class="pessoa-foto-grande" aria-hidden="true" style="display:none">' + limpo(iniciais || '?') + '</div>'
    : '<div class="pessoa-foto-grande" aria-hidden="true">' + limpo(iniciais || '?') + '</div>';

  var linhas = [];
  if(p.funcao) linhas.push(p.funcao);
  if(p.equipe) linhas.push(p.equipe);
  if(horario)  linhas.push('Atendimento: ' + horario);

  var falta = dataISO ? faltaDe(p.nome.trim(), dataISO) : null;
  var faltaHtml = falta
    ? '<p class="pessoa-ausente">🔴 Ausente hoje' + (falta.motivo ? ': ' + limpo(falta.motivo) : '') + '</p>'
    : '';

  document.getElementById('pessoa-nome').textContent = p.nome;
  document.getElementById('pessoa-detalhe').innerHTML = fotoHtml +
    '<ul class="pessoa-detalhe-lista">' +
      linhas.map(function(l){ return '<li>' + limpo(l) + '</li>'; }).join('') +
    '</ul>' +
    (p.obs ? '<p class="pessoa-detalhe-obs">' + limpo(p.obs) + '</p>' : '') +
    faltaHtml;

  if(painelPessoa) painelPessoa.abrir();
}

/* Agrupa por equipe só se pelo menos uma pessoa tiver o campo preenchido.
   Assim, quem ainda não usa times vê a lista simples de sempre — o número
   de pessoas em cada equipe nunca é fixo, é sempre o que está na planilha. */
function agruparPorEquipe(lista){
  var temEquipes = lista.some(function(p){ return p.equipe && p.equipe.trim(); });
  if(!temEquipes) return [{ nome: null, pessoas: lista }];

  var mapa = {}, ordem = [];
  lista.forEach(function(p){
    var chave = (p.equipe && p.equipe.trim()) || 'Sem equipe definida';
    if(!mapa[chave]){ mapa[chave] = []; ordem.push(chave); }
    mapa[chave].push(p);
  });
  return ordem.map(function(nome){ return { nome: nome, pessoas: mapa[nome] }; });
}

function desenhar(data, agora){
  ULTIMA_DATA = data; ULTIMA_AGORA = agora;
  var diaKey  = K[data.getDay()];
  var dataISO = iso(data);
  if(!SETORES.length) return;

  var geral = statusGeral(diaKey, dataISO, agora);
  var aberta = geral.abertoAgora;
  var cx = document.getElementById('status');

  /* calculado aqui em cima porque o próprio card de status precisa saber
     se tem aviso hoje, para avisar isso já na primeira tela — sem isso,
     alguém podia ver "ABERTO" e nunca rolar a página até "Avisos de hoje" */
  var ativos = avisosDoDia(dataISO);
  var avisoResumo = ativos.length
    ? '<a href="#avisos-secao" class="status-aviso-link">⚠ ' +
        (ativos.length === 1 ? '1 aviso hoje' : ativos.length + ' avisos hoje') +
        ' — toque para ver</a>'
    : '';

  /* título da aba: sempre com o nome da unidade, junto com o status atual */
  document.title = CONFIG.unidade.nome + ' — ' + (aberta ? 'Aberto agora' : 'Fechado agora');

  if(aberta){
    cx.innerHTML =
      '<div class="cartao-status sim">' +
        '<div class="marca" aria-hidden="true">✓</div>' +
        '<p class="status-palavra">A UBS está aberta</p>' +
        '<p class="status-detalhe">Fecha hoje às ' + hf(hh(geral.fechaAs)) + '</p>' +
        '<p class="status-hoje">Hoje é ' + NOME[diaKey].toLowerCase() + ', ' + hf(hh(agora)) + '</p>' +
        avisoResumo +
      '</div>';
  } else {
    var quando = '';
    if(geral.abreAs !== null){
      quando = 'Abre hoje às ' + hf(hh(geral.abreAs));
    } else {
      var p = proximaAberturaGeral(data);
      if(p) quando = 'Abre ' + (p.amanha ? 'amanhã' : 'na ' + CURTO[p.key]) +
                     ' às ' + hf(hh(p.minutos));
    }
    cx.innerHTML =
      '<div class="cartao-status nao">' +
        '<div class="marca" aria-hidden="true">✕</div>' +
        '<p class="status-palavra">A UBS está fechada</p>' +
        '<p class="status-detalhe">' + quando + '</p>' +
        '<p class="status-hoje">Hoje é ' + NOME[diaKey].toLowerCase() + ', ' + hf(hh(agora)) +
        '. Se for urgente, ligue ' + CONFIG.urgencia.telefone + '.</p>' +
        avisoResumo +
      '</div>';
  }

  /* ícone da aba: verde = tudo certo, amarelo = aberto mas com algum
     aviso hoje, vermelho = fechado agora (o mais urgente de saber) */
  definirFavicon(!aberta ? '🔴' : (ativos.length ? '🟡' : '🟢'));

  var box = document.getElementById('avisos');
  if(!ativos.length){
    box.innerHTML =
      '<div class="tudo-certo"><span class="ok" aria-hidden="true">✓</span>' +
      '<p>Hoje está tudo funcionando no horário de sempre. Nenhum setor fechado.</p></div>';
  } else {
    box.innerHTML = ativos.map(function(a){ return cartaoAviso(a, false); }).join('');
  }

  /* avisos futuros: coisas já cadastradas mas que ainda não começaram a
     valer — só aparece a seção se tiver algo, pra não sobrar um título
     "Avisos futuros" com nada embaixo. */
  var futuros = avisosFuturos(dataISO);
  var blocoFuturos = document.getElementById('avisos-futuros-bloco');
  if(futuros.length){
    blocoFuturos.hidden = false;
    document.getElementById('avisos-futuros').innerHTML = futuros.map(function(a){ return cartaoAviso(a, true); }).join('');
  } else {
    blocoFuturos.hidden = true;
  }

  /* setores */
  document.getElementById('setores').innerHTML = SETORES.map(function(s){
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

    var paraCompleto = [s.para].concat(notasRecorrentesDoSetor(s.id, data)).filter(Boolean).join(' ');

    return '<article class="setor ' + (t.cls === 'alerta' ? 'fechado-hoje' : '') + '">' +
      '<div class="sv-topo">' +
        '<h3 class="sv-nome">' + limpo(s.nome) + '</h3>' +
        '<p class="sv-para">' + limpo(paraCompleto) + '</p>' +
        (s.levar ? '<p class="sv-levar">🎒 Leve: ' + limpo(s.levar) + '</p>' : '') +
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

  /* equipe */
  var equipeEl = document.getElementById('equipe');
  if(!EQUIPE || !EQUIPE.length){
    equipeEl.innerHTML = '<p class="ajuda">Em breve, informações da equipe.</p>';
  } else {
    var grupos = agruparPorEquipe(EQUIPE);
    var ruasPorEquipe = {};
    (RUAS || []).forEach(function(a){ ruasPorEquipe[a.equipe] = a.ruas; });
    /* Lista paralela, na mesma ordem em que os cards saem no HTML — depois
       de desenhar, zippa com os elementos .pessoa de verdade pra saber
       qual card abre qual pessoa (ver abaixo). */
    var pessoasFlat = [];
    equipeEl.innerHTML = grupos.map(function(g){
      /* O horário é do time, não de uma pessoa só — pega o primeiro que
         aparecer preenchido dentro do grupo (normalmente só a médica tem). */
      var horario = (g.pessoas.filter(function(p){ return p.horario; })[0] || {}).horario || '';
      var cartoes = g.pessoas.map(function(p){
        pessoasFlat.push({ pessoa:p, horario: horario });
        return cartaoPessoa(p, dataISO);
      }).join('');
      if(g.nome === null) return '<div class="pessoas">' + cartoes + '</div>';
      var conta = g.pessoas.length === 1 ? '1 pessoa' : g.pessoas.length + ' pessoas';
      var horarioHtml = horario
        ? '<span class="time-conta time-horario">' + limpo(horario) + '</span>' : '';
      var ruas = ruasPorEquipe[g.nome];
      var ruasHtml = (ruas && ruas.length)
        ? '<details class="ruas-equipe"><summary>Ruas atendidas</summary>' +
            '<ul class="ruas-lista">' + ruas.map(function(r){ return '<li>' + limpo(r) + '</li>'; }).join('') + '</ul>' +
          '</details>'
        : '';
      return '<div class="time">' +
        '<h3 class="time-nome">' + limpo(g.nome) + '<span class="time-conta">' + conta + '</span>' + horarioHtml + '</h3>' +
        '<div class="pessoas">' + cartoes + '</div>' +
        ruasHtml +
      '</div>';
    }).join('');

    /* Cada card de pessoa abre o painel de detalhe — no clique ou com
       Enter/espaço (o card já tem role="button" tabindex="0"). Precisa
       ser refeito a cada desenhar(), porque o innerHTML acima troca os
       elementos toda vez. */
    var elsPessoa = equipeEl.querySelectorAll('.pessoa');
    Array.prototype.forEach.call(elsPessoa, function(el, i){
      var item = pessoasFlat[i];
      if(!item) return;
      el.addEventListener('click', function(){
        abrirPessoaPainel(item.pessoa, item.horario, dataISO);
      });
      el.addEventListener('keydown', function(e){
        if(e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        abrirPessoaPainel(item.pessoa, item.horario, dataISO);
      });
    });
  }

  /* de onde vieram os dados */
  var fd = document.getElementById('fonte-dados');
  var agoraTxt = new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  if(ORIGEM === 'planilha'){
    fd.className = 'fonte-dados';
    fd.textContent = (AVISOS_DA_PLANILHA
      ? 'Horários e avisos carregados da planilha da unidade às '
      : 'Horários carregados da planilha da unidade às ') + agoraTxt +
      (AVISOS_DA_PLANILHA ? '.' : '. As abas "mudancas-horario" e "recados" ainda não foram criadas.');
    fd.textContent += ' ' + textoContadorMudanca();
  } else if(ORIGEM === 'erro'){
    fd.className = 'fonte-dados erro';
    fd.textContent = 'Não foi possível carregar a planilha agora. A página está mostrando os ' +
      'últimos horários conhecidos. Em caso de dúvida, ligue para a UBS: ' +
      CONFIG.unidade.telefone + '.';
  } else {
    fd.className = 'fonte-dados';
    fd.textContent = 'Esta página está usando os dados internos do site. ' +
      'A planilha da unidade ainda não foi configurada.';
  }
}

/* ----------------------------------------------------- ouvir a página -- */
function textoParaOuvir(){
  if(ULTIMA_DATA == null) return '';
  var diaKey  = K[ULTIMA_DATA.getDay()];
  var dataISO = iso(ULTIMA_DATA);
  var partes = [CONFIG.unidade.nome + '.'];

  var geral = statusGeral(diaKey, dataISO, ULTIMA_AGORA);
  if(geral.abertoAgora){
    partes.push('A UBS está aberta agora. Fecha hoje às ' + hf(hh(geral.fechaAs)) + '.');
  } else {
    partes.push('A UBS está fechada agora.');
  }

  var ativos = avisosDoDia(dataISO);
  if(!ativos.length){
    partes.push('Não há nenhum aviso hoje. Todos os setores funcionam no horário de sempre.');
  } else {
    partes.push(ativos.length === 1 ? 'Há um aviso hoje.' : 'Há ' + ativos.length + ' avisos hoje.');
    ativos.forEach(function(a){
      partes.push(a.titulo + '. ' + a.texto);
    });
  }

  partes.push('Em caso de urgência, ligue ' + CONFIG.urgencia.telefone.split('').join(' ') + '.');
  return partes.join(' ');
}

/* Monta o link que abre a página traduzida numa aba nova, pelo tradutor
   do Google — mais simples e confiável do que tentar controlar o widget
   deles na própria página, que muda de estrutura sem avisar. */
function linkTraducao(idiomaDestino){
  return 'https://translate.google.com/translate?sl=pt&tl=' + idiomaDestino +
    '&u=' + encodeURIComponent(location.href);
}

var falando = false;
function alternarOuvir(botao){
  if(!('speechSynthesis' in window)){
    botao.disabled = true;
    botao.querySelector('.ic').nextSibling.textContent = ' Leitura não é possível neste navegador';
    return;
  }
  if(falando){
    window.speechSynthesis.cancel();
    falando = false;
    botao.setAttribute('aria-pressed','false');
    return;
  }
  var texto = textoParaOuvir();
  if(!texto) return;
  var fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = 0.95;
  var vozes = window.speechSynthesis.getVoices();
  var voz = vozes.find(function(v){ return v.lang === 'pt-BR'; }) ||
            vozes.find(function(v){ return v.lang && v.lang.indexOf('pt') === 0; });
  if(voz) fala.voice = voz;

  fala.onend = function(){ falando = false; botao.setAttribute('aria-pressed','false'); };
  fala.onerror = function(){ falando = false; botao.setAttribute('aria-pressed','false'); };

  falando = true;
  botao.setAttribute('aria-pressed','true');
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(fala);
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

/* Guarda uma preferência no aparelho da pessoa, sem quebrar se o navegador
   bloquear (modo anônimo, por exemplo). */
function guardar(chave, valor){
  try { localStorage.setItem(chave, valor); } catch(e){}
}
function lerGuardado(chave){
  try { return localStorage.getItem(chave); } catch(e){ return null; }
}

/* Compara os dados que acabaram de chegar da planilha com os que estavam
   guardados da última vez que este mesmo aparelho visitou o site. Se
   mudou algo (horário, aviso, equipe, falta), marca hoje como a "última
   mudança". Serve como um lembrete simples pra equipe perceber se
   ninguém mexe na planilha há muito tempo. */
function textoContadorMudanca(){
  try{
    var atual = JSON.stringify({s:SETORES, a:AVISOS, e:EQUIPE, f:FALTAS, r:RUAS, m:REUNIOES});
    var anterior = lerGuardado('ubs-conteudo-anterior');
    var hojeISO = iso(new Date());
    var dataMudanca = lerGuardado('ubs-data-mudanca');

    if(atual !== anterior){
      guardar('ubs-conteudo-anterior', atual);
      guardar('ubs-data-mudanca', hojeISO);
      dataMudanca = hojeISO;
    }
    if(!dataMudanca) return '';

    var d1 = new Date(dataMudanca + 'T00:00:00');
    var d2 = new Date(hojeISO + 'T00:00:00');
    var dias = Math.round((d2 - d1) / 86400000);

    if(dias <= 0) return 'Última mudança detectada neste aparelho: hoje.';
    if(dias === 1) return 'Última mudança detectada neste aparelho: ontem.';
    return 'Última mudança detectada neste aparelho: há ' + dias + ' dias.';
  } catch(e){
    return '';
  }
}

function iniciar(){
  montarFixos();
  prepararInstalacao();

  /* ---- tamanho da letra (dentro do painel de acessibilidade) ---- */
  var botoesLetra = document.querySelectorAll('.a11y-letra-btns button');
  function aplicarLetra(botao, salvar){
    Array.prototype.forEach.call(botoesLetra, function(o){
      o.setAttribute('aria-pressed','false');
    });
    botao.setAttribute('aria-pressed','true');
    document.documentElement.style.setProperty('--esc', botao.dataset.esc);
    if(salvar) guardar('ubs-letra', botao.dataset.esc);
  }
  Array.prototype.forEach.call(botoesLetra, function(b){
    b.addEventListener('click', function(){ aplicarLetra(b, true); });
  });
  var letraSalva = lerGuardado('ubs-letra');
  if(letraSalva){
    var alvo = Array.prototype.find.call(botoesLetra, function(b){
      return b.dataset.esc === letraSalva;
    });
    if(alvo) aplicarLetra(alvo, false);
  }

  /* ---- alto contraste ---- */
  var btContraste = document.getElementById('a11y-contraste');
  function aplicarContraste(ligado, salvar){
    document.body.classList.toggle('alto-contraste', ligado);
    btContraste.setAttribute('aria-pressed', ligado ? 'true' : 'false');
    btContraste.lastChild.textContent = ligado ? ' Desativar alto contraste' : ' Ativar alto contraste';
    if(salvar) guardar('ubs-contraste', ligado ? '1' : '0');
  }
  btContraste.addEventListener('click', function(){
    aplicarContraste(!document.body.classList.contains('alto-contraste'), true);
  });
  if(lerGuardado('ubs-contraste') === '1') aplicarContraste(true, false);

  /* ---- ouvir a página ---- */
  var btOuvir = document.getElementById('a11y-ouvir');
  btOuvir.addEventListener('click', function(){ alternarOuvir(btOuvir); });

  /* ---- idioma (links diretos pro tradutor do Google, numa aba nova) ---- */
  document.getElementById('idioma-en').href = linkTraducao('en');
  document.getElementById('idioma-es').href = linkTraducao('es');

  /* ---- abre/fecha painéis flutuantes — mesmo código serve para o de
     acessibilidade e para o menu "ir para"; abrir um fecha o outro. ---- */
  var outrosPaineis = [];
  /* idBotao é opcional — o painel de detalhe da pessoa não tem um botão
     fixo de abrir (quem abre é o card clicado, que muda a cada render),
     então esse painel é aberto de fora, chamando controle.abrir()
     diretamente, em vez de por um clique de botão aqui dentro. */
  function criarPainel(idBotao, idPainel, idFundo, idFechar){
    var botao  = idBotao ? document.getElementById(idBotao) : null;
    var painel = document.getElementById(idPainel);
    var fundo  = document.getElementById(idFundo);
    var fechar = document.getElementById(idFechar);

    function aoTeclar(e){ if(e.key === 'Escape') fecharEste(); }

    function abrirEste(){
      outrosPaineis.forEach(function(p){ if(p !== controle) p.fechar(); });
      painel.hidden = false;
      fundo.hidden  = false;
      if(botao) botao.setAttribute('aria-expanded','true');
      fechar.focus();
      document.addEventListener('keydown', aoTeclar);
    }
    function fecharEste(){
      if(painel.hidden) return;
      painel.hidden = true;
      fundo.hidden  = true;
      if(botao) botao.setAttribute('aria-expanded','false');
      document.removeEventListener('keydown', aoTeclar);
    }

    if(botao) botao.addEventListener('click', abrirEste);
    fechar.addEventListener('click', function(){ fecharEste(); if(botao) botao.focus(); });
    fundo.addEventListener('click', function(){ fecharEste(); if(botao) botao.focus(); });

    var controle = { abrir:abrirEste, fechar:fecharEste };
    outrosPaineis.push(controle);
    return controle;
  }

  criarPainel('a11y-fab', 'a11y-painel', 'a11y-fundo', 'a11y-fechar');
  var painelNav = criarPainel('nav-fab', 'nav-painel', 'nav-fundo', 'nav-fechar');
  painelPessoa  = criarPainel(null, 'pessoa-painel', 'pessoa-fundo', 'pessoa-fechar');

  /* cada link do menu fecha o painel ao ser clicado — a rolagem suave até
     a seção acontece sozinha, via CSS (scroll-behavior), sem precisar de JS */
  var linksMenu = document.querySelectorAll('.nav-item');
  Array.prototype.forEach.call(linksMenu, function(link){
    link.addEventListener('click', function(){ painelNav.fechar(); });
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

