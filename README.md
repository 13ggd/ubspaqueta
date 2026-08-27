# UBS Paquetá — site de horários e avisos

Site simples que mostra se a UBS está aberta agora, os horários de cada setor, avisos do dia,
a equipe e telefones de urgência — pensado para quem só quer saber "posso ir agora?" no celular.

Feito como projeto de intervenção do 1º semestre (grupo de UBS), com o objetivo de ser **reutilizável
por qualquer UBS de Brusque**: o mesmo código serve para todas, e cada unidade só precisa preencher
sua própria planilha do Google e um arquivo de configuração — sem escrever código.

## Como funciona (visão geral)

- O site é só HTML/CSS/JavaScript puro — não tem build, não tem instalação, não tem servidor próprio.
- Quem cuida do dia a dia (avisos, mudança de horário, equipe, faltas) edita uma **planilha do Google**,
  não o código.
- Se a planilha estiver fora do ar ou ainda não configurada, o site usa dados de reserva guardados no
  próprio código, para nunca aparecer vazio.
- Depois da primeira visita, o site **abre mesmo sem internet** — avisando na tela que a informação
  pode estar velha.
- Tem um **cartaz A4 com QR code** pronto para imprimir ([`cartaz.html`](cartaz.html)) — é o que faz as
  pessoas descobrirem que o site existe.
- Detalhes técnicos de como cada peça funciona estão em [`CLAUDE.md`](CLAUDE.md) — vale a leitura se for
  mexer na lógica do site.

## Editando o conteúdo do dia a dia (para quem não mexe em código)

Tudo isso é feito direto na planilha do Google da unidade, em 7 abas (só `setores` é obrigatória —
as outras são opcionais, e sem elas o site usa os dados de reserva do `config.js`):

| Aba | Serve para |
|---|---|
| `setores` | Horário padrão de cada setor (consulta, vacina, farmácia...) — a coluna que identifica cada um se chama `setor` |
| `mudancas-horario` | O que muda **hoje/nesta semana** em relação ao horário padrão (fechamento pontual ou horário diferente) |
| `recados` | Avisos gerais, sem ligação com um setor específico |
| `equipe` | Quem trabalha na unidade, sua função e (opcional) o horário de atendimento do time dela |
| `faltas` | Ausências da equipe (fecha o setor automaticamente se só houver uma pessoa responsável por ele) |
| `ruas` | Área de abrangência de cada equipe de saúde da família (qual rua cada time atende) |
| `reunioes` | Avisos recorrentes tipo "toda 2ª e 4ª quarta-feira do mês" — o site calcula as datas sozinho |

A planilha precisa estar compartilhada como **"Qualquer pessoa com o link → Leitor"** para o site
conseguir lê-la.

## Replicando para outra UBS

Nenhuma etapa abaixo exige mexer em `app.js` ou `estilo.css` — só copiar, criar uma planilha e editar
um arquivo.

1. **Crie um repositório novo no GitHub** a partir deste (copie a pasta inteira, ou use "Use this
   template" se este repositório virar um template do GitHub).
2. **Crie uma planilha do Google nova** para a unidade, com a aba `setores` (obrigatória) e as que
   fizerem sentido entre `mudancas-horario`, `recados`, `equipe`, `faltas`, `ruas` e `reunioes` (veja a
   tabela acima), e compartilhe como "Qualquer pessoa com o link → Leitor".
3. **Edite só o [`config.js`](config.js)** da cópia nova:
   - Seção 1 — nome, endereço, telefones, link do mapa e do Instagram, foto da unidade.
   - Seção 2 — cole o ID da nova planilha em `planilhaId` (o pedaço do meio do link do Google Sheets).
   - Seções 3 a 6 — atualize os dados de reserva (`setoresReserva`, `avisosReserva`, `equipeReserva`,
     `areasEquipeReserva`, `notasRecorrentesReserva`) com informações reais da nova unidade, para que o
     site nunca fique vazio caso a planilha falhe.
4. **Publique o site** (Vercel ou GitHub Pages funcionam bem para esse tipo de site estático e são
   gratuitos).
5. **Volte no `config.js` e preencha `site`** com o endereço publicado (ex:
   `https://ubspaqueta.vercel.app`). É desse campo que sai o QR code do cartaz impresso.

## Imprimindo o cartaz com QR code

O site pode estar perfeito e ninguém descobrir que ele existe. O cartaz é o que liga um ao outro.

Abra **[`cartaz.html`](cartaz.html)** no navegador (é só dar dois cliques no arquivo). Aparece uma barra
no topo com o endereço do site, a escolha entre dois formatos e um botão de imprimir:

- **Cartaz A4** — para colar na porta da unidade, no balcão e na sala de espera. Tem o QR grande, o
  endereço escrito por extenso e **os horários impressos** — de propósito: quem não tem celular precisa
  conseguir a informação do mesmo papel.
- **Bilhetes (8 por folha)** — para recortar e entregar na recepção.

A barra do topo não sai na impressão. O QR é gerado no próprio navegador, sem internet e sem site de
terceiros, então dá para imprimir mesmo com o wi-fi fora do ar.

> Confira o endereço escrito embaixo do QR **antes** de imprimir 40 cópias. Se `site` não estiver
> preenchido no `config.js`, o cartaz chuta o endereço da janela — e pode sair um QR apontando para
> `localhost`, que não funciona no celular de ninguém.

A opção "Marcar como vindo do cartaz" acrescenta `?de=cartaz` no endereço do cartaz e `?de=bilhete` no
dos bilhetes. Serve só para a medição de acessos (abaixo) saber quantas pessoas chegaram por cada um
dos dois — colar na parede e entregar na mão são coisas diferentes, e essa é a única forma de descobrir
qual vale a pena reimprimir. Se você não vai medir nada, pode desmarcar.

## O site funciona sem internet

Depois da primeira visita, o site fica guardado no celular e **abre mesmo sem conexão**, mostrando a
última informação que ele viu. Isso importa aqui: muita gente fica sem dados no fim do mês, e o sinal
no bairro é irregular.

Quando está sem internet, aparece uma tarja amarela em cima avisando que a informação pode estar velha,
com o telefone da UBS do lado — porque ligar funciona sem internet. Assim que a conexão volta, o site
busca a planilha na hora, sem esperar.

Os horários que aparecem nessa hora são os últimos que o site conseguiu ler da planilha, e a linha
cinza no fim da página diz de quando eles são ("guardados no aparelho ontem às 16h"). Só se a pessoa
nunca tiver conseguido abrir o site com internet é que ele cai nos dados de reserva do `config.js` —
e a mesma linha avisa isso também, com todas as letras.

Quem cuida disso é o arquivo [`sw.js`](sw.js). **Se você mexer em qualquer arquivo do site, troque o
número em `VERSAO`, na primeira linha dele** (`'ubs-v2'` → `'ubs-v3'`) — é isso que faz o celular das
pessoas jogar fora a versão antiga. Sem trocar, quem já visitou pode continuar vendo o site velho.

## Medindo os acessos (opcional)

Desligado por padrão. Serve para o projeto de pesquisa: sem isso não dá para dizer se o site foi
*usado*, só que ele existe.

Na **seção 8 do [`config.js`](config.js)** dá para ligar uma de duas opções gratuitas: `goatcounter`
(funciona em qualquer hospedagem) ou `vercel` (só se o site estiver na Vercel). Nenhuma das duas usa
cookie nem guarda nada que identifique a pessoa — por isso o site não precisa de aviso de cookies, e é
essa a resposta se o comitê de ética perguntar.

Ligado, você passa a ver quantas pessoas abriram o site, quantas chegaram pelo cartaz e pelos bilhetes,
e quais botões foram mais tocados — saber que "ver no mapa" foi o mais usado já é um resultado.

Abrir o site com `?teste` **não conta acesso**, de propósito: as visitas de vocês conferindo horário de
sábado ficariam misturadas com as dos moradores.

## A pasta `pesquisa/`

Não tem nada a ver com o funcionamento do site: são os documentos para **avaliar** se ele funcionou —
questionário de antes, questionário de depois com a escala de usabilidade, folha de contagem da
recepção, roteiro de entrevista com a equipe e o plano que amarra tudo. Comece pelo
[`pesquisa/README.md`](pesquisa/README.md).

O [`guia-da-planilha.md`](guia-da-planilha.md), na raiz, é o guia de uma página para imprimir e deixar
do lado do computador de quem atualiza a planilha na unidade. É ele que decide se o site continua certo
depois que o semestre acabar.

## Testando horários sem esperar o relógio

Abrindo o site com `?teste` no final do endereço (ex: `seusite.vercel.app/?teste`) aparece uma barra
escondida com data e hora para simular "como o site fica no sábado às 8h" sem precisar esperar o dia
chegar. Só aparece com esse parâmetro — no site normal fica invisível.
