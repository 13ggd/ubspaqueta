# Guia rápido da planilha — UBS Paquetá

Serve para quem atualiza os horários e avisos do site na planilha do Google.
Use quando algo mudar: setor fechado, horário diferente, recado para o bairro.
Cada mudança leva menos de 2 minutos. Imprima e deixe do lado do computador.
Este guia é entregue no treinamento da equipe, junto com os cartazes e os bilhetes.

## Comece por aqui

- **Planilha (é onde você escreve):** [cole o link da planilha aqui]
- **Site (é onde a pessoa vê):** [cole o link do site aqui]
- **Você salvou? Então já está feito.** O site se atualiza sozinho a cada 5 minutos.
  Não precisa avisar ninguém, não precisa publicar nada, não precisa apertar nenhum botão.

## Qual aba eu uso?

| Aba | Use quando... |
|---|---|
| `setores` | O horário **normal** de um setor mudou para sempre (ex: a farmácia passou a abrir às 7h) |
| `mudancas-horario` | Um setor vai **fechar** ou **atender em outro horário** em dias certos (ex: o dentista não vem na sexta) |
| `recados` | Você precisa avisar algo que **não é sobre horário** (ex: acabou a vacina da gripe) |
| `equipe` | Entrou ou saiu alguém da equipe, ou mudou a função de alguém |
| `faltas` | Alguém da equipe vai faltar em dias certos (férias, atestado, curso) |
| `ruas` | Mudou a lista de ruas que uma equipe atende |
| `reunioes` | A equipe tem reunião fixa que se repete (ex: toda 2ª e 4ª quarta-feira do mês) |

Nas abas `setores`, `mudancas-horario` e `equipe`, a coluna que diz de qual setor você está
falando se chama **`setor`**. Escreva nela o mesmo código curto que está na coluna `setor`
da aba `setores`: `consulta`, `enfermagem`, `vacina`, `farmacia`, `curativo`, `exame`,
`dentista`, `mulher`, `gestantes`, `diabeticos`. (Só na aba `reunioes` a coluna se chama
`setores`, no plural, e aceita mais de um código separado por vírgula.)

Na aba `setores`, o horário de cada dia da semana fica em uma coluna: `seg`, `ter`, `qua`,
`qui`, `sex`, `sab`, `dom`. Dia sem atendimento: deixe a coluna vazia.

Na aba `faltas` é diferente: **não existe coluna de setor**. Você escreve o nome da pessoa na
coluna `pessoa` — igual ao nome dela na aba `equipe`, letra por letra — e a data em `inicio`.
Sem essa data a linha não conta. As colunas `fim` e `motivo` são opcionais. Se ela for a única
pessoa ligada àquele setor na aba `equipe`, o site fecha o setor sozinho nesses dias. Se tiver duas ou mais pessoas
no setor, o site só escreve "Ausente hoje" no nome dela — se o setor precisar fechar mesmo
assim, faça uma linha na aba `mudancas-horario`.

## As coisas que você mais vai fazer

### 1. O dentista não vai atender na sexta (setor fechado)

Aba `mudancas-horario`. Escreva uma linha nova e **deixe a coluna `novo` vazia** — vazia
quer dizer "fechado o dia todo".

| setor | titulo | texto | inicio | fim | novo |
|---|---|---|---|---|---|
| dentista | (pode deixar vazio) | O dentista está de atestado. Se estiver com muita dor, procure a Policlínica, no Centro. | 04/09/2026 | 04/09/2026 | (vazio) |

Se você deixar o `titulo` vazio, o site escreve sozinho "Dentista não vai atender".
Se é só um dia, pode repetir a mesma data no `inicio` e no `fim`, ou deixar o `fim` vazio.

### 2. A farmácia vai atender em horário diferente na sexta

Mesma aba `mudancas-horario`, mas agora **escreva o horário novo na coluna `novo`** — com a
coluna `novo` preenchida, o site entende que não fechou, só mudou.

| setor | titulo | texto | inicio | fim | novo |
|---|---|---|---|---|---|
| farmacia | (pode deixar vazio) | A farmácia fecha mais cedo por causa de um curso da equipe. | 28/08/2026 | 28/08/2026 | 8h às 12h |

### 3. Um recado geral, que não é sobre horário

Aba `recados`. Aqui **o `titulo` é obrigatório**: se ficar em branco, o recado não aparece
no site (nesta aba não existe nome de setor para o site inventar um título).

| titulo | texto | inicio | fim |
|---|---|---|---|
| Chegou vacina da gripe | Já tem vacina da gripe na sala de vacina. Traga documento e a carteirinha. Não precisa marcar. | 26/08/2026 | 30/09/2026 |

### 4. A UBS inteira não vai abrir

Aba `mudancas-horario`, uma linha só: escreva **`todos`** na coluna `setor` e deixe a coluna
`novo` vazia. Isso fecha a unidade inteira sem precisar de uma linha para cada setor.

| setor | titulo | texto | inicio | fim | novo |
|---|---|---|---|---|---|
| todos | (pode deixar vazio) | A UBS não abre por falta de energia. | 02/09/2026 | 02/09/2026 | (vazio) |

## Como escrever data e hora

| | Pode escrever assim | Não funciona |
|---|---|---|
| **Data** | `27/08/2026` · `27-08-2026` · `2026-08-27` | `27/08` (sem o ano) · `27 de agosto` |
| **Hora** | `8h às 12h` · `08:00-12:00` · `8-12` | `8 da manhã` · `manhã` · `das 8` (sem o fim) |
| **Com pausa de almoço** | `8h às 12h, 14h às 18h` · `8-12 14-18` | — |
| **Fechado** | escreva `Fechado`, ou deixe vazio | — |

**Minuto sempre com dois números.** Escreva `18:30`, nunca `18:3`. Isso é de propósito:
o site prefere mostrar "não atende" a mostrar um horário errado que parece certo.

## O que você NÃO precisa fazer

- **Não precisa apagar aviso vencido na hora.** Passou a data do `fim`, ele some sozinho do site.
  Apague quando sobrar tempo, só para a planilha não ficar bagunçada.
- **Não precisa esperar o dia chegar para escrever o aviso.** Pode escrever hoje um aviso que só
  começa a valer semana que vem: até lá ele aparece no site num quadro separado, "Avisos futuros".
- **Não precisa cadastrar feriado nacional.** Nesses dias o site já fecha a unidade sozinho.
- **Não precisa mexer no código do site.** Nada do dia a dia exige isso.
- **Não precisa avisar ninguém.** Salvou na planilha, o site pega em até 5 minutos.
- **Não precisa preencher todas as colunas.** Só o essencial de cada tarefa acima.

## Deu problema?

| O que você vê | O que fazer |
|---|---|
| O site mostra "Não foi possível carregar a planilha" | Abra a planilha, clique em **Compartilhar** e confira se está como **"Qualquer pessoa com o link" → Leitor**. Se estiver "Restrito", mude para essa opção. |
| Um horário aparece errado no site | Se é o horário **normal**, corrija na aba `setores`. Se é só de alguns dias, ache a linha na aba `mudancas-horario` e veja as datas e a coluna `novo`. |
| Um aviso não aparece no site | Confira: as datas de `inicio` e `fim` cobrem o dia de hoje? Se a sua planilha tiver a coluna `ativo`, a caixinha dessa linha está marcada? (Se a planilha não tiver essa coluna, tudo bem: sem ela o site conta a linha como ativa.) Na aba `recados`, o `titulo` está preenchido? Na aba `mudancas-horario`, a coluna `setor` está preenchida? |

Se nada resolver, fale com [nome e contato do responsável].
