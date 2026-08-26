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

## Testando horários sem esperar o relógio

Abrindo o site com `?teste` no final do endereço (ex: `seusite.vercel.app/?teste`) aparece uma barra
escondida com data e hora para simular "como o site fica no sábado às 8h" sem precisar esperar o dia
chegar. Só aparece com esse parâmetro — no site normal fica invisível.
