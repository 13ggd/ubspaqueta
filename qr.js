/* ===========================================================================
   qr.js — gerador de QR code, sem depender de nada externo
   ---------------------------------------------------------------------------
   Usado só pelo cartaz.html (o cartaz impresso com o QR pra colar na parede
   da UBS). O site em si não carrega este arquivo.

   Por que escrever o gerador aqui em vez de usar uma biblioteca pronta de
   CDN ou uma API de imagem tipo "api.qrserver.com": o cartaz precisa poder
   ser gerado e impresso mesmo sem internet (o wi-fi da unidade cai), e o
   projeto inteiro tem como regra não ter build nem dependência externa.
   Um QR de URL curta é pequeno o bastante pra caber num arquivo assim.

   Uso:  QR.matriz('https://exemplo.com', 'M')  ->  [[0,1,0...],[...], ...]
         (1 = quadradinho preto, 0 = branco; sem a margem branca em volta —
          quem desenha é que adiciona a margem)
         QR.svg('https://exemplo.com')  ->  string com um <svg> pronto

   Suporta versões 1 a 10 (dá pra URLs de até ~270 caracteres no nível M),
   modo "byte" (UTF-8), níveis de correção de erro L, M, Q e H.
   =========================================================================== */

(function(global){
'use strict';

/* ---------------------------------------------------------------- tabelas --
   Para cada versão e nível: [codewords de correção por bloco,
   blocos do grupo 1, dados por bloco do grupo 1,
   blocos do grupo 2, dados por bloco do grupo 2].
   Vem da norma ISO/IEC 18004. */
var EC = {
  1:  { L:[7,1,19,0,0],   M:[10,1,16,0,0],  Q:[13,1,13,0,0],  H:[17,1,9,0,0]   },
  2:  { L:[10,1,34,0,0],  M:[16,1,28,0,0],  Q:[22,1,22,0,0],  H:[28,1,16,0,0]  },
  3:  { L:[15,1,55,0,0],  M:[26,1,44,0,0],  Q:[18,2,17,0,0],  H:[22,2,13,0,0]  },
  4:  { L:[20,1,80,0,0],  M:[18,2,32,0,0],  Q:[26,2,24,0,0],  H:[16,4,9,0,0]   },
  5:  { L:[26,1,108,0,0], M:[24,2,43,0,0],  Q:[18,2,15,2,16], H:[22,2,11,2,12] },
  6:  { L:[18,2,68,0,0],  M:[16,4,27,0,0],  Q:[24,4,19,0,0],  H:[28,4,15,0,0]  },
  7:  { L:[20,2,78,0,0],  M:[18,4,31,0,0],  Q:[18,2,14,4,15], H:[26,4,13,1,14] },
  8:  { L:[24,2,97,0,0],  M:[22,2,38,2,39], Q:[22,4,18,2,19], H:[26,4,14,2,15] },
  9:  { L:[30,2,116,0,0], M:[22,3,36,2,37], Q:[20,4,16,4,17], H:[24,4,12,4,13] },
  10: { L:[18,2,68,2,69], M:[26,4,43,1,44], Q:[24,6,19,2,20], H:[28,6,15,2,16] }
};

/* Onde ficam os quadradinhos de alinhamento (os menores, além dos 3 cantos) */
var ALINHAMENTO = {
  1:[], 2:[6,18], 3:[6,22], 4:[6,26], 5:[6,30],
  6:[6,34], 7:[6,22,38], 8:[6,24,42], 9:[6,26,46], 10:[6,28,50]
};

/* Bits que identificam a versão — só entram no desenho da versão 7 em diante */
var VERSAO_INFO = { 7:0x07C94, 8:0x085BC, 9:0x09A99, 10:0x0A4D3 };

/* Bits que representam o nível de correção dentro do "format info" */
var NIVEL_BITS = { L:1, M:0, Q:3, H:2 };

/* Bits sobrando no fim, que não formam um codeword completo */
function bitsSobrando(versao){
  return (versao >= 2 && versao <= 6) ? 7 : 0;
}

/* ------------------------------------------------ aritmética de Galois --
   A correção de erro do QR usa Reed-Solomon sobre GF(256). Estas duas
   tabelas transformam multiplicação em soma de expoentes. */
var EXP = new Array(512), LOG = new Array(256);
(function(){
  var x = 1;
  for(var i = 0; i < 255; i++){
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if(x & 0x100) x ^= 0x11D;
  }
  for(var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
})();

function mult(a, b){
  if(a === 0 || b === 0) return 0;
  return EXP[LOG[a] + LOG[b]];
}

/* Polinômio gerador de grau "grau" */
function gerador(grau){
  var p = [1];
  for(var i = 0; i < grau; i++){
    var novo = p.slice();
    novo.push(0);                                   /* multiplica por x */
    for(var j = 0; j < p.length; j++){
      novo[j + 1] ^= mult(p[j], EXP[i]);            /* ...e por (x + a^i) */
    }
    p = novo;
  }
  return p;
}

/* Os codewords de correção de erro de um bloco de dados */
function correcao(dados, quantos){
  var g = gerador(quantos);
  var r = dados.slice();
  var i, j;
  for(i = 0; i < quantos; i++) r.push(0);
  for(i = 0; i < dados.length; i++){
    var coef = r[i];
    if(coef !== 0){
      for(j = 0; j < g.length; j++) r[i + j] ^= mult(g[j], coef);
    }
  }
  return r.slice(dados.length);
}

/* --------------------------------------------------------- texto -> bytes --
   TextEncoder existe em todo navegador atual; o caminho de baixo é só uma
   rede de segurança pra navegador antigo. */
function paraBytes(texto){
  if(typeof TextEncoder !== 'undefined'){
    return Array.prototype.slice.call(new TextEncoder().encode(texto));
  }
  var s = unescape(encodeURIComponent(texto)), b = [];
  for(var i = 0; i < s.length; i++) b.push(s.charCodeAt(i));
  return b;
}

/* Quantos codewords de DADOS cabem numa versão/nível */
function dadosTotais(versao, nivel){
  var t = EC[versao][nivel];
  return t[1] * t[2] + t[3] * t[4];
}

/* A menor versão que comporta o texto */
function escolherVersao(bytes, nivel){
  for(var v = 1; v <= 10; v++){
    var contador = (v <= 9) ? 8 : 16;
    var precisa = 4 + contador + bytes.length * 8;
    if(precisa <= dadosTotais(v, nivel) * 8) return v;
  }
  throw new Error('Texto grande demais para um QR code ate a versao 10.');
}

/* ------------------------------------------------------- montar os bits -- */
function montarCodewords(bytes, versao, nivel){
  var bits = [];
  var i, j;
  function push(valor, quantos){
    for(var k = quantos - 1; k >= 0; k--) bits.push((valor >> k) & 1);
  }

  push(4, 4);                                       /* modo "byte" */
  push(bytes.length, versao <= 9 ? 8 : 16);
  for(i = 0; i < bytes.length; i++) push(bytes[i], 8);

  var capacidade = dadosTotais(versao, nivel) * 8;
  var terminador = Math.min(4, capacidade - bits.length);
  for(i = 0; i < terminador; i++) bits.push(0);
  while(bits.length % 8 !== 0) bits.push(0);

  var enchimento = [0xEC, 0x11], k = 0;
  while(bits.length < capacidade){
    push(enchimento[k % 2], 8);
    k++;
  }

  /* bits -> codewords (bytes) */
  var codewords = [];
  for(i = 0; i < bits.length; i += 8){
    var b = 0;
    for(j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    codewords.push(b);
  }

  /* separar em blocos, calcular a correção de cada um e intercalar */
  var t = EC[versao][nivel];
  var blocos = [], correcoes = [], pos = 0, listaBlocos = [];
  for(i = 0; i < t[1]; i++) listaBlocos.push(t[2]);
  for(i = 0; i < t[3]; i++) listaBlocos.push(t[4]);

  listaBlocos.forEach(function(tamanho){
    var bloco = codewords.slice(pos, pos + tamanho);
    pos += tamanho;
    blocos.push(bloco);
    correcoes.push(correcao(bloco, t[0]));
  });

  var saida = [], maiorDados = Math.max.apply(null, listaBlocos);
  for(i = 0; i < maiorDados; i++){
    for(j = 0; j < blocos.length; j++){
      if(i < blocos[j].length) saida.push(blocos[j][i]);
    }
  }
  for(i = 0; i < t[0]; i++){
    for(j = 0; j < correcoes.length; j++) saida.push(correcoes[j][i]);
  }

  /* de volta para bits, mais os bits sobrando da versão */
  var finais = [];
  saida.forEach(function(b){
    for(var k2 = 7; k2 >= 0; k2--) finais.push((b >> k2) & 1);
  });
  for(i = 0; i < bitsSobrando(versao); i++) finais.push(0);
  return finais;
}

/* ------------------------------------------------- desenhar os padrões -- */
function novaMatriz(tamanho){
  var m = [];
  for(var i = 0; i < tamanho; i++){
    m.push([]);
    for(var j = 0; j < tamanho; j++) m[i].push(0);
  }
  return m;
}

function desenharFuncoes(m, reservado, versao){
  var tam = m.length, i;

  function quadradoDeBusca(linha, coluna){
    for(var r = -1; r <= 7; r++){
      for(var c = -1; c <= 7; c++){
        var y = linha + r, x = coluna + c;
        if(y < 0 || y >= tam || x < 0 || x >= tam) continue;
        var borda = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                    (c >= 0 && c <= 6 && (r === 0 || r === 6));
        var miolo = (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        m[y][x] = (borda || miolo) ? 1 : 0;
        reservado[y][x] = 1;
      }
    }
  }
  quadradoDeBusca(0, 0);
  quadradoDeBusca(0, tam - 7);
  quadradoDeBusca(tam - 7, 0);

  /* linhas de tempo (a tracejada que liga os cantos) */
  for(i = 8; i < tam - 8; i++){
    var v = (i % 2 === 0) ? 1 : 0;
    m[6][i] = v; reservado[6][i] = 1;
    m[i][6] = v; reservado[i][6] = 1;
  }

  /* quadradinhos de alinhamento */
  var pontos = ALINHAMENTO[versao];
  var ultimo = pontos.length ? pontos[pontos.length - 1] : 0;
  pontos.forEach(function(linha){
    pontos.forEach(function(coluna){
      var ehCantoDeBusca = (linha === 6 && coluna === 6) ||
                           (linha === 6 && coluna === ultimo) ||
                           (linha === ultimo && coluna === 6);
      if(ehCantoDeBusca) return;
      for(var r = -2; r <= 2; r++){
        for(var c = -2; c <= 2; c++){
          var vale = (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0));
          m[linha + r][coluna + c] = vale ? 1 : 0;
          reservado[linha + r][coluna + c] = 1;
        }
      }
    });
  });

  /* módulo que é sempre preto */
  m[tam - 8][8] = 1;
  reservado[tam - 8][8] = 1;

  /* espaço do "format info" — preenchido depois, já com a máscara escolhida */
  for(i = 0; i < 9; i++){
    reservado[8][i] = 1;
    reservado[i][8] = 1;
  }
  for(i = 0; i < 8; i++){
    reservado[8][tam - 1 - i] = 1;
    reservado[tam - 1 - i][8] = 1;
  }

  /* espaço do "version info", só da versão 7 pra cima */
  if(versao >= 7){
    for(i = 0; i < 18; i++){
      var linha2 = Math.floor(i / 3), coluna2 = tam - 11 + (i % 3);
      reservado[linha2][coluna2] = 1;
      reservado[coluna2][linha2] = 1;
    }
  }
}

function escreverVersao(m, versao){
  if(versao < 7) return;
  var tam = m.length, info = VERSAO_INFO[versao];
  for(var i = 0; i < 18; i++){
    var bit = (info >> i) & 1;
    var linha = Math.floor(i / 3), coluna = tam - 11 + (i % 3);
    m[linha][coluna] = bit;
    m[coluna][linha] = bit;
  }
}

function escreverFormato(m, nivel, mascara){
  var tam = m.length;
  var dados = (NIVEL_BITS[nivel] << 3) | mascara;
  var resto = dados << 10;
  var i;
  for(i = 14; i >= 10; i--){
    if(resto & (1 << i)) resto ^= 0x537 << (i - 10);
  }
  var bits = ((dados << 10) | resto) ^ 0x5412;

  for(i = 0; i < 15; i++){
    var bit = (bits >> i) & 1;
    /* cópia vertical, na coluna 8 */
    if(i < 6)        m[i][8] = bit;
    else if(i < 8)   m[i + 1][8] = bit;
    else             m[tam - 15 + i][8] = bit;
    /* cópia horizontal, na linha 8 */
    if(i < 8)        m[8][tam - 1 - i] = bit;
    else if(i === 8) m[8][7] = bit;
    else             m[8][14 - i] = bit;
  }
  m[tam - 8][8] = 1;
}

/* As 8 máscaras previstas na norma */
function mascarar(mascara, linha, coluna){
  switch(mascara){
    case 0: return (linha + coluna) % 2 === 0;
    case 1: return linha % 2 === 0;
    case 2: return coluna % 3 === 0;
    case 3: return (linha + coluna) % 3 === 0;
    case 4: return (Math.floor(linha / 2) + Math.floor(coluna / 3)) % 2 === 0;
    case 5: return ((linha * coluna) % 2) + ((linha * coluna) % 3) === 0;
    case 6: return ((((linha * coluna) % 2) + ((linha * coluna) % 3)) % 2) === 0;
    default: return ((((linha + coluna) % 2) + ((linha * coluna) % 3)) % 2) === 0;
  }
}

/* Coloca os bits de dados no zigue-zague: de baixo pra cima, da direita
   pra esquerda, duas colunas por vez, pulando a coluna 6 (linha de tempo). */
function colocarDados(m, reservado, bits){
  var tam = m.length, idx = 0, subindo = true;
  for(var coluna = tam - 1; coluna > 0; coluna -= 2){
    if(coluna === 6) coluna = 5;
    for(var passo = 0; passo < tam; passo++){
      var linha = subindo ? (tam - 1 - passo) : passo;
      for(var lado = 0; lado < 2; lado++){
        var c = coluna - lado;
        if(reservado[linha][c]) continue;
        m[linha][c] = (idx < bits.length) ? bits[idx++] : 0;
      }
    }
    subindo = !subindo;
  }
}

/* ------------------------------------------------- escolher a máscara --
   A norma manda testar as 8 máscaras e ficar com a de menor "penalidade" —
   quanto menor, mais fácil pro leitor do celular acertar a leitura. */
function penalidade(m){
  var tam = m.length, total = 0, i, j, r, c;

  function naLinha(a, b){ return m[a][b]; }
  function naColuna(a, b){ return m[b][a]; }

  /* regra 1 — sequências de 5 ou mais quadradinhos iguais seguidos */
  function corridas(pegar){
    var soma = 0;
    for(var a = 0; a < tam; a++){
      var atual = pegar(a, 0), conta = 1;
      for(var b = 1; b < tam; b++){
        var v = pegar(a, b);
        if(v === atual) conta++;
        else {
          if(conta >= 5) soma += 3 + (conta - 5);
          atual = v; conta = 1;
        }
      }
      if(conta >= 5) soma += 3 + (conta - 5);
    }
    return soma;
  }
  total += corridas(naLinha);
  total += corridas(naColuna);

  /* regra 2 — blocos 2x2 da mesma cor */
  for(r = 0; r < tam - 1; r++){
    for(c = 0; c < tam - 1; c++){
      var v0 = m[r][c];
      if(v0 === m[r][c+1] && v0 === m[r+1][c] && v0 === m[r+1][c+1]) total += 3;
    }
  }

  /* regra 3 — o padrão que imita o quadrado de busca e confunde o leitor */
  var alvo1 = [1,0,1,1,1,0,1,0,0,0,0];
  var alvo2 = [0,0,0,0,1,0,1,1,1,0,1];
  function combina(pegar, a, b, alvo){
    for(var k = 0; k < 11; k++){
      if(pegar(a, b + k) !== alvo[k]) return false;
    }
    return true;
  }
  for(i = 0; i < tam; i++){
    for(j = 0; j <= tam - 11; j++){
      if(combina(naLinha, i, j, alvo1) || combina(naLinha, i, j, alvo2)) total += 40;
      if(combina(naColuna, i, j, alvo1) || combina(naColuna, i, j, alvo2)) total += 40;
    }
  }

  /* regra 4 — desequilíbrio entre preto e branco */
  var pretos = 0;
  for(r = 0; r < tam; r++){
    for(c = 0; c < tam; c++) pretos += m[r][c];
  }
  var proporcao = (pretos * 100) / (tam * tam);
  total += Math.floor(Math.abs(proporcao - 50) / 5) * 10;

  return total;
}

/* ------------------------------------------------------------- público -- */
function matriz(texto, nivel){
  nivel = nivel || 'M';
  if(!NIVEL_BITS.hasOwnProperty(nivel)) nivel = 'M';

  var bytes  = paraBytes(String(texto));
  var versao = escolherVersao(bytes, nivel);
  var bits   = montarCodewords(bytes, versao, nivel);
  var tam    = 17 + 4 * versao;

  var base = novaMatriz(tam);
  var reservado = novaMatriz(tam);
  desenharFuncoes(base, reservado, versao);
  escreverVersao(base, versao);
  colocarDados(base, reservado, bits);

  var melhor = null, melhorNota = Infinity;
  for(var mascara = 0; mascara < 8; mascara++){
    var tentativa = base.map(function(linha){ return linha.slice(); });
    for(var r = 0; r < tam; r++){
      for(var c = 0; c < tam; c++){
        if(!reservado[r][c] && mascarar(mascara, r, c)) tentativa[r][c] ^= 1;
      }
    }
    escreverFormato(tentativa, nivel, mascara);
    var nota = penalidade(tentativa);
    if(nota < melhorNota){ melhorNota = nota; melhor = tentativa; }
  }
  return melhor;
}

/* Desenha a matriz como SVG — melhor que canvas pra imprimir, porque não
   perde nitidez por mais que a impressora amplie. */
function svg(texto, opcoes){
  opcoes = opcoes || {};
  var m       = matriz(texto, opcoes.nivel);
  var margem  = (opcoes.margem === undefined) ? 4 : opcoes.margem;
  var tam     = m.length + margem * 2;
  var caminho = [];

  for(var r = 0; r < m.length; r++){
    for(var c = 0; c < m.length; c++){
      if(m[r][c]) caminho.push('M' + (c + margem) + ' ' + (r + margem) + 'h1v1h-1z');
    }
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + tam + ' ' + tam + '" ' +
         'shape-rendering="crispEdges" role="img" aria-label="' +
         (opcoes.descricao || 'QR code do site da unidade') + '">' +
         '<rect width="' + tam + '" height="' + tam + '" fill="#ffffff"/>' +
         '<path d="' + caminho.join('') + '" fill="#000000"/>' +
         '</svg>';
}

global.QR = { matriz: matriz, svg: svg };

})(window);
