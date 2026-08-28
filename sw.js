/* ===========================================================================
   sw.js — service worker: faz o site abrir mesmo sem internet
   ---------------------------------------------------------------------------
   Por que isso importa aqui, e não é só enfeite técnico:

   - Boa parte de quem usa a UBS tem plano de dados pré-pago e fica sem
     internet no fim do mês, justo quando mais precisa saber se pode vir.
   - O sinal dentro da unidade e no bairro é irregular.
   - Sem service worker, o site sem internet não abre nada: tela de dinossauro.
     Com ele, abre a última versão que a pessoa já viu, com o último horário
     conhecido da planilha.

   O cuidado que isso exige: mostrar horário velho como se fosse de agora seria
   pior do que não mostrar nada — a pessoa viaja à toa confiando na tela. Por
   isso o app.js mostra uma tarja "você está sem internet" quando é o caso, e
   a planilha nunca é servida do cache quando dá pra buscar da rede.

   Estratégias, por tipo de pedido:
   - páginas e arquivos do próprio site: cache primeiro, atualizando por trás
     (abre instantâneo; a versão nova entra na visita seguinte)
   - planilha do Google (os horários de verdade): rede primeiro, cache só como
     rede de segurança quando a rede falhar
   - fontes do Google: cache primeiro, atualizando por trás
   - VLibras e qualquer outro domínio: passa direto, sem cache

   Ao mudar qualquer arquivo do site, troque o número em VERSAO — é isso que
   faz o navegador de todo mundo descartar o cache antigo.
   =========================================================================== */

var VERSAO       = 'ubs-v9';
var CACHE_SITE   = VERSAO + '-site';
var CACHE_DADOS  = VERSAO + '-dados';
var CACHE_FONTES = VERSAO + '-fontes';

/* O mínimo pro site abrir sozinho. config.js entra porque é dele que vêm os
   dados de reserva — sem ele a página abre vazia. */
var ESSENCIAIS = [
  './',
  './index.html',
  './estilo.css',
  './app.js',
  './config.js'
];

self.addEventListener('install', function(evento){
  evento.waitUntil(
    caches.open(CACHE_SITE).then(function(cache){
      /* addAll falha inteiro se um arquivo falhar; aqui cada um é
         independente, pra uma falha boba não derrubar a instalação. */
      return Promise.all(ESSENCIAIS.map(function(caminho){
        return cache.add(new Request(caminho, {cache: 'reload'}))['catch'](function(){});
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(evento){
  evento.waitUntil(
    caches.keys().then(function(nomes){
      return Promise.all(nomes.map(function(nome){
        if(nome.indexOf(VERSAO) !== 0) return caches['delete'](nome);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

/* -------------------------------------------------------------- estratégias -- */

/* Cache primeiro, buscando a versão nova por trás para a próxima visita. */
function cachePrimeiro(pedido, nomeCache){
  return caches.open(nomeCache).then(function(cache){
    return cache.match(pedido).then(function(guardado){
      var daRede = fetch(pedido).then(function(resposta){
        if(resposta && (resposta.ok || resposta.type === 'opaque')){
          cache.put(pedido, resposta.clone());
        }
        return resposta;
      });

      if(guardado){
        /* Já temos o arquivo: entrega na hora e deixa a busca correr por
           trás. Se ela falhar (sem internet), não faz diferença nenhuma —
           mas a rejeição precisa ser recolhida, senão vira erro solto. */
        daRede['catch'](function(){});
        return guardado;
      }
      /* Nada guardado ainda: aí depende da rede mesmo. Se ela falhar, esta
         promessa é rejeitada — e é isso que faz o desvio para a página
         principal funcionar, lá embaixo, em vez de a tela ficar em branco. */
      return daRede;
    });
  });
}

/* A página principal é sempre a mesma, com ou sem "?" no endereço: "?teste"
   (barra de teste) e "?de=cartaz" (o QR do cartaz impresso) são a mesma
   página. Guardar e procurar sempre pela mesma chave evita encher o cache
   com uma cópia por endereço e faz o site abrir sem internet em qualquer
   um deles. */
function paginaPrincipal(pedido){
  var chave = './index.html';
  return caches.open(CACHE_SITE).then(function(cache){
    return cache.match(chave).then(function(guardado){
      var daRede = fetch(pedido).then(function(resposta){
        if(resposta && resposta.ok) cache.put(chave, resposta.clone());
        return resposta;
      });
      if(guardado){ daRede['catch'](function(){}); return guardado; }
      return daRede;
    });
  });
}

/* O endereço da planilha leva um "&t=" com a hora do pedido, pra o navegador
   nunca entregar uma cópia velha dele mesmo. Só que isso faz cada busca virar
   um endereço diferente — e guardar por endereço tem duas consequências
   ruins: o cache junta uma cópia nova a cada 5 minutos, para sempre, e a
   busca de amanhã nunca encontra a de hoje, que é justamente a que salvaria
   quem está sem internet. Por isso a chave do cache é o endereço SEM o "t":
   uma entrada por aba, sempre a mais recente, e ela é achável depois. */
function chaveDaPlanilha(pedido){
  var url = new URL(pedido.url);
  url.searchParams['delete']('t');
  return url.href;
}

/* Carimba na resposta a hora em que ela foi guardada, pra o site poder dizer
   "isto é de ontem às 16h" em vez de deixar parecer que acabou de chegar da
   planilha. Mostrar horário velho como se fosse de agora é o pior erro que
   este site pode cometer. */
function carimbar(resposta, quando){
  var cabecalhos = new Headers(resposta.headers);
  cabecalhos.set('X-UBS-Guardado', quando);
  return resposta.blob().then(function(corpo){
    return new Response(corpo, {status: resposta.status,
                                statusText: resposta.statusText,
                                headers: cabecalhos});
  });
}

/* Rede primeiro; o cache só entra se a rede falhar. */
function redePrimeiro(pedido, nomeCache){
  var chave = chaveDaPlanilha(pedido);
  return caches.open(nomeCache).then(function(cache){
    return fetch(pedido).then(function(resposta){
      if(resposta && resposta.ok){
        carimbar(resposta.clone(), new Date().toISOString()).then(function(guardavel){
          return cache.put(chave, guardavel);
        })['catch'](function(){});
      }
      return resposta;
    })['catch'](function(erro){
      return cache.match(chave).then(function(guardado){
        if(guardado) return guardado;
        throw erro;   /* nem rede nem cache: o app.js cai nos dados de reserva */
      });
    });
  });
}

self.addEventListener('fetch', function(evento){
  var pedido = evento.request;
  if(pedido.method !== 'GET') return;

  var url;
  try { url = new URL(pedido.url); } catch(e){ return; }

  /* A planilha da unidade — o dado que muda todo dia. Rede sempre que der. */
  if(url.hostname === 'docs.google.com'){
    evento.respondWith(redePrimeiro(pedido, CACHE_DADOS));
    return;
  }

  /* Fontes do Google. */
  if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    evento.respondWith(cachePrimeiro(pedido, CACHE_FONTES));
    return;
  }

  /* Do próprio site. */
  if(url.origin === self.location.origin){
    if(pedido.mode === 'navigate'){
      evento.respondWith(paginaPrincipal(pedido));
      return;
    }
    evento.respondWith(cachePrimeiro(pedido, CACHE_SITE));
    return;
  }

  /* Qualquer outro domínio (VLibras, medição de acessos): passa direto. */
});
