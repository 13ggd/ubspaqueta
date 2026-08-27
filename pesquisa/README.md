# Plano de avaliação — site de horários da UBS Paquetá

Este documento amarra a parte de pesquisa do projeto: o que queremos responder, como vamos medir,
em que ordem e com quais cuidados. É o guia do grupo de estudantes e o texto que o(a) professor(a)
orientador(a) usa para conferir o método antes de a coleta começar.
Quem usa: os integrantes do grupo e [nome do professor orientador]. Quando: ler e aprovar **antes**
da primeira coleta. Leitura: cerca de 15 minutos. Ciclo completo previsto: 12 semanas, mais uma
checagem rápida 4 semanas depois do fim do semestre.

---

## 1. Pergunta de avaliação e objetivos

**Problema.** Hoje, quem mora no bairro Paquetá não tem como saber, antes de sair de casa, se a UBS
está aberta e se o setor que ele procura (vacina, farmácia, dentista, coleta de exame) está
atendendo naquele momento. O horário muda por setor, muda em feriado e muda quando alguém falta.
O resultado são duas coisas que a equipe vê todo dia: pessoa que vem à toa e volta sem atendimento,
e telefone da recepção ocupado com ligação só para perguntar horário.

**Pergunta de avaliação.** Depois de colocar no ar um site que responde "posso ir agora?" e divulgá-lo
com cartaz com QR code e bilhetes na recepção, mudou alguma coisa em: (a) quanto as pessoas
conseguem descobrir o horário antes de vir, (b) quanto elas relatam ter vindo à toa, e (c) quantas
ligações a recepção recebe só para informar horário?

**Objetivo geral.**
Avaliar a implantação e os primeiros efeitos percebidos de um site público de horários e avisos da
UBS Paquetá sobre o acesso à informação de funcionamento da unidade, comparando a situação antes e
depois da divulgação.

**Objetivos específicos.**

1. Descrever, antes da intervenção, como os moradores que frequentam a UBS Paquetá descobrem o
   horário de funcionamento da unidade e de cada setor, e com que frequência relatam ter vindo sem
   conseguir atendimento por causa de horário.
2. Comparar, antes e depois da divulgação, a proporção de pessoas que sabem onde consultar o horário
   antes de sair de casa e a proporção que relata viagem perdida nos últimos 6 meses.
3. Descrever o alcance da divulgação em papel (cartaz e bilhetes) e o uso do site, a partir da
   contagem de acessos e da proporção de acessos que chegaram pelo papel. Atenção: o QR do cartaz e
   o do bilhete são gerados pelo mesmo `cartaz.html` e levam a mesma marca `?de=cartaz`, então os
   dois contam juntos na medição de acessos — quem separa cartaz de bilhete é a pergunta B2 do
   questionário de T1, por relato da própria pessoa.
4. Avaliar a usabilidade do site pelos próprios moradores que o utilizaram e verificar se a equipe da
   unidade mantém a planilha atualizada, como indício de sustentabilidade da intervenção depois do
   fim do semestre.

---

## 2. Desenho do estudo

**Estudo de intervenção, do tipo antes-e-depois (pré/pós), sem grupo controle, com amostra de
conveniência de pessoas na sala de espera da UBS Paquetá.** Duas rodadas de coleta transversal — uma
antes da divulgação (T0) e outra depois de um período de uso (T1) — complementadas por contagem
feita pela recepção, medição de acessos ao site e entrevista com a equipe.

Por que este desenho, e não outro:

- **Sem grupo controle** porque o site fica visível para todos os que entram na unidade. Não há como
  separar, dentro da mesma sala de espera, quem foi exposto ao cartaz de quem não foi. Usar outra UBS
  como controle exigiria autorização, deslocamento e uma segunda equipe de coleta — inviável em um
  semestre.
- **Amostra de conveniência** porque não existe lista de moradores adscritos disponível ao grupo para
  sorteio, e a coleta acontece no tempo em que os estudantes estão na unidade.
- **Antes-e-depois** porque é o desenho mais simples que ainda permite alguma comparação. As duas
  rodadas são **amostras independentes** (cortes transversais repetidos): não seguimos as mesmas
  pessoas, e a mesma pessoa pode cair nas duas rodadas por acaso. Isso é aceitável, mas precisa
  estar escrito no relatório — não é um estudo de coorte e não deve ser descrito como tal.

Consequência que o grupo assume desde já: os resultados serão **descritivos**. Ver o item 8
(Limitações) e o item 9 (Como analisar).

---

## 3. Linha do tempo

| Semana | O que acontece | Quem faz | Cuidado |
|---|---|---|---|
| 1 | Autorizações, pendências de ética, conferência palavra por palavra do T1 contra o T0 (ver item 4), impressão dos questionários, treino dos entrevistadores, teste-piloto com 5 pessoas, ligar a medição de acessos no `config.js` | Grupo + [nome do professor orientador] | O piloto serve para ajustar palavras confusas; essas 5 respostas **não** entram na análise. Imprimir o cartaz só depois de preencher `unidade.site` no `config.js` |
| 2 e 3 | **T0 — coleta de linha de base**: questionário na sala de espera + folha de contagem na recepção | Grupo (2 pessoas por turno) + recepção | Nenhum cartaz, nenhum bilhete, nenhuma menção ao site nesse período |
| 4 | **Intervenção**: treinamento da equipe (30 min), cartazes colados na porta, no balcão e na sala de espera, início da entrega dos bilhetes | Grupo + equipe da unidade | Anotar a data exata em que o primeiro cartaz subiu. Decidir antes se o Instagram da UBS vai divulgar o site: se for, isso faz parte da intervenção e a data precisa ser anotada também (o questionário de T1 pergunta se a pessoa soube do site pelo Instagram) |
| 5 a 9 | **Período de uso** (5 semanas aqui; do cartaz subir até o T1 começar dá 6 semanas, dentro das "4 a 6 semanas" previstas no questionário de T1): equipe atualiza a planilha, grupo acompanha os acessos uma vez por semana e repõe cartazes/bilhetes que sumirem | Equipe da unidade; grupo acompanha | Não corrigir o comportamento das pessoas nem "ensinar" o site durante a coleta de T1 |
| 10 e 11 | **T1 — coleta pós**: questionário pós + escala de usabilidade + folha de contagem na recepção (mesmos dias da semana e turnos de T0) + entrevista com a equipe | Grupo + recepção | Manter o mesmo horário de abordagem de T0, senão a comparação fica torta |
| 12 | Análise, relatório, pôster e devolutiva para a equipe e para a coordenação da unidade | Grupo | Devolutiva é compromisso com quem cedeu o tempo, não item opcional |
| +4 semanas após o fim do semestre ([data]) | Checagem de sustentabilidade: a planilha continua sendo atualizada? | Grupo (1 pessoa) | Registrar a data da verificação |

**A coleta de T0 tem que acontecer antes de qualquer divulgação.** Se o cartaz subir na porta antes
de as duas semanas de T0 terminarem, a linha de base morre: as respostas passam a refletir uma
unidade que já tem cartaz, e não há como voltar atrás nem reconstruir o "antes". Isso vale também
para conversas informais — enquanto T0 estiver rodando, ninguém do grupo divulga o site na sala de
espera, no balcão ou em grupo de WhatsApp do bairro. Combine isso explicitamente com a equipe na
semana 1, porque quem trabalha na unidade tende a querer ajudar contando a novidade.

---

## 4. Indicadores

Primários (respondem diretamente à pergunta de avaliação):

| Indicador | Como mede | Onde vem o dado | Quando |
|---|---|---|---|
| Sabe onde consultar o horário antes de vir | Nº de pessoas que marcaram pelo menos uma fonte consultável **antes de sair de casa** ÷ total de respondentes válidos × 100. **Contam:** ligo para a UBS; pergunto para um vizinho, parente ou conhecido; olho o Instagram da UBS; procuro na internet, sem ser o Instagram da UBS. **Não contam:** já sei o horário de cabeça; venho até aqui e vejo na hora; olho o cartaz ou papel colado na porta/no balcão; pergunto para alguém da equipe quando estou aqui; não sei como fazer isso — todas essas ou dependem de já estar na unidade, ou não são uma fonte que a pessoa consulte. Para "outro", decidam a regra uma vez, escrevam a regra num papel e apliquem igual em T0 e T1. As opções são as mesmas nas duas rodadas: nenhuma delas cita o site, nem no T1 | Questionário: pergunta 4, no T0 e na Parte A do T1 | T0 e T1 |
| Relato de viagem perdida | Nº que responde "sim" ÷ total de respondentes válidos × 100. Entre quem respondeu "sim", descrever também a distribuição de quantas vezes (pergunta 5b) | Questionário: pergunta 5 (e 5b), no T0 e na Parte A do T1 | T0 e T1 |
| Ligações só para perguntar horário | Nº de riscos da coluna A ÷ nº de dias úteis efetivamente contados = média por dia útil | Folha de contagem da recepção, contador A | 2 semanas em T0 e as mesmas 2 semanas equivalentes em T1 |
| Veio e o setor estava fechado (visto pela recepção) | Nº de riscos da coluna B ÷ nº de dias úteis efetivamente contados = média por dia útil | Folha de contagem da recepção, contador B | 2 semanas em T0 e as mesmas 2 semanas equivalentes em T1 |
| Perguntou o horário no balcão | Nº de riscos da coluna C ÷ nº de dias úteis efetivamente contados = média por dia útil | Folha de contagem da recepção, contador C | 2 semanas em T0 e as mesmas 2 semanas equivalentes em T1 |
| Conhece o site / já entrou no site | Duas proporções separadas: conhece ou acha que já ouviu falar (%) e já entrou pelo menos uma vez (%) | Questionário T1, perguntas B1 e B3 | Só T1 — em T0 nenhuma pergunta cita o site, de propósito |

Secundários (descrevem alcance, qualidade e sustentabilidade):

| Indicador | Como mede | Onde vem o dado | Quando |
|---|---|---|---|
| Acessos ao site | Contagem de visitas por semana | Painel do serviço de medição escolhido (GoatCounter ou Web Analytics da Vercel — ver item 8 do `config.js`) | Semanal, da semana 4 até a 11 |
| Proporção vinda do papel | Nº de eventos `veio-de-cartaz` ÷ total de visitas × 100 | Mesmo painel. O site não filtra endereço: quando alguém abre com `?de=cartaz`, o `app.js` registra um evento chamado `veio-de-cartaz`. Cartaz e bilhete usam a mesma marca, então esse número é "papel", sem separar os dois | Semanal, da semana 4 até a 11 |
| Por onde o site chegou até a pessoa | % de cada canal marcado, entre quem conhece o site. É a **única** medida que separa cartaz de bilhete: a marca `?de=cartaz` junta os dois | Questionário T1, pergunta B2 | T1 |
| Achou no site a informação que procurava | % de cada resposta (sim / em parte / não estava / não lembro), entre quem já entrou no site | Questionário T1, pergunta C1 | T1 |
| Deixou de vir por ter visto no site | % que responde "sim", entre quem já entrou no site, e a distribuição de quantas vezes | Questionário T1, perguntas C2 e C2b | T1 |
| Nota de usabilidade (escala SUS) | 10 itens de 1 a 5 → nota de 0 a 100 por pessoa, pela regra descrita em `questionario-pos-e-sus.md`. Quem responder "NS" em qualquer um dos 10 itens fica de fora da nota: informe quantas pessoas ficaram de fora e por quê | Questionário de T1, parte C3, aplicada **só** a quem diz já ter entrado no site | T1 |
| Já ligou só para perguntar horário (relato da pessoa) | % que responde "sim, já liguei". **Cuidado:** a pergunta é "já ligou alguma vez", sem período — esse número só pode subir ou ficar igual entre T0 e T1, nunca cair. Serve para descrever o hábito, **não** para medir efeito do site. Quem mede queda de ligação é o contador A da recepção | Questionário: pergunta 6, no T0 e na Parte A do T1 | T0 e T1 |
| Que informação falta mais antes de sair de casa | % de cada opção marcada (cada pessoa marca até 2) | Questionário T0, pergunta 7. Não é repetida no T1 — serve para descrever a necessidade, não para comparar | T0 |
| Tem celular com internet e mexe nele sozinho | Nº que responde "sim" na pergunta 3 **e** "sozinho(a)" ou "mexo, mas às vezes peço ajuda" na 3b ÷ total × 100 | Questionário, perguntas 3 e 3b, nas duas rodadas | T0 e T1 |
| Consegue ler QR code sozinho | Nº que responde "sim, consigo sozinho(a)" na 3c ÷ nº de quem tem celular com internet × 100. Interessa porque o cartaz depende disso | Questionário, pergunta 3c, nas duas rodadas | T0 e T1 |
| Quanto a recepção acha que deixou de marcar | Resposta única por rodada (nada / um pouco / bastante / não sei), registrada ao lado dos totais. Não corrige o número: mostra a quem lê o tamanho da subnotificação | Folha de contagem da recepção, seção "Para o grupo" | T0 e T1 |
| Planilha continua sendo atualizada | Do histórico de versões da planilha: data da edição mais recente, quantas edições nos últimos 30 dias, quantas pessoas diferentes editaram, maior intervalo sem nenhuma edição | Seção "Verificação objetiva" do roteiro de entrevista, feita direto na planilha do Google (Arquivo → Histórico de versões) | T1 e +4 semanas após o fim do semestre |
| Quem mantém a planilha depois do semestre | Descrever em palavras o que apareceu nas entrevistas, **sem porcentagem** — o próprio roteiro proíbe transformar 3 a 5 entrevistas em número | Entrevista com a equipe, blocos 2 e 5 | T1 |

Observações que evitam erro na hora de tabular:

- **A Parte A do T1 repete o T0 palavra por palavra.** As perguntas 1, 2, 3, 3b, 3c, 4, 5, 5b e 6 são
  as mesmas nos dois arquivos: mesma redação, mesmas opções, mesma ordem, mesma numeração e os mesmos
  nomes de coluna na hora de digitar. As perguntas 5c, 7 e 8 ficaram só no T0, para o T1 não ficar
  longo demais — deixar uma pergunta de fora não atrapalha a comparação das que ficaram. Ainda assim,
  **na semana 1 alguém confere os dois arquivos lado a lado antes de mandar imprimir**. Se aparecer
  qualquer diferença, vale a redação do T0, que é aplicado primeiro: corrija o T1, nunca o T0.
- Os números de pergunta desta tabela valem para a versão atual dos arquivos. Se alguém mudar a ordem
  ou acrescentar pergunta, **atualize a tabela na mesma hora** — senão quem digita os dados dois meses
  depois não sabe qual coluna é qual.
- Respostas "não sei" e "prefiro não responder" entram no relatório como categoria própria. Não
  jogue essas pessoas no "não" e não as apague do denominador em silêncio: diga quantas foram.
- A medição de acessos **já existe no código, mas está desligada**. O `app.js` tem o trecho que carrega
  o GoatCounter ou o Web Analytics da Vercel, e ele só liga se `medicao.tipo` estiver preenchido no
  `config.js` — hoje está vazio. Tarefa da semana 1: escolher o serviço, criar a conta, preencher
  `medicao.tipo` e `medicao.codigo`, e preencher também `unidade.site` (sem isso, o QR do cartaz aponta
  para o endereço de onde o `cartaz.html` foi aberto, e não para o site publicado). Se isso não estiver
  no ar antes de o cartaz subir, os dois indicadores de acesso ficam sem numerador e devem ser
  retirados do relatório, não estimados de cabeça.
- No texto final, escreva "escala SUS (*System Usability Scale*)" na primeira menção. Em um trabalho
  da área da saúde no Brasil, "SUS" sozinho vai ser lido como Sistema Único de Saúde.
- O valor de 68 pontos costuma ser citado na literatura como ponto médio de comparação da escala.
  Confirme a referência bibliográfica com [nome do professor orientador] antes de usar esse número
  no relatório — não cite de memória.

---

## 5. Instrumentos

| Arquivo | Para que serve |
|---|---|
| [`questionario-linha-de-base.md`](questionario-linha-de-base.md) | Questionário aplicado na sala de espera em T0: como a pessoa descobre o horário hoje, se já veio à toa, se tem celular com internet e se lê QR code. É a **redação de referência**: em qualquer divergência, é ele que vale |
| [`questionario-pos-e-sus.md`](questionario-pos-e-sus.md) | Questionário de T1: a Parte A repete o T0 palavra por palavra; a Parte B pergunta se o site chegou até a pessoa e por onde; a Parte C, só para quem entrou no site, mede utilidade e usabilidade. **Antes de mandar imprimir, confira a Parte A contra o T0** (ver item 4) |
| [`contagem-recepcao.md`](contagem-recepcao.md) | Folha de papel que fica no balcão, com três contadores: A — ligou pra perguntar horário; B — veio e o setor estava fechado; C — perguntou no balcão. A recepção só faz um risquinho na coluna certa |
| [`roteiro-entrevista-equipe.md`](roteiro-entrevista-equipe.md) | Roteiro curto de entrevista com quem trabalha na unidade, sobre manutenção da planilha e sustentabilidade |
| [`../guia-da-planilha.md`](../guia-da-planilha.md) | Guia de uso da planilha do Google, entregue à equipe no treinamento da semana 4 — é material da intervenção, não instrumento de coleta |

Todos os instrumentos devem passar pelo teste-piloto da semana 1 antes de irem a campo.

---

## 6. Amostra

**Meta.** 50 respostas por rodada (mínimo aceitável: 40; se render mais que 60, ótimo). Total previsto:
de 80 a 120 questionários somando T0 e T1. Esse número não vem de cálculo de poder estatístico — vem
do que um grupo de estudantes consegue coletar em duas semanas de turnos na sala de espera. Diga
isso com essas palavras no relatório.

**Critérios de inclusão.**

- 18 anos ou mais.
- Estar na sala de espera da UBS Paquetá como paciente ou como acompanhante.
- Aceitar participar depois de ouvir a explicação do estudo.

**Critérios de exclusão.**

- Pessoa em sofrimento agudo, com dor, febre ou visivelmente abalada — não abordar.
- Pessoa que está sendo chamada para o atendimento (não interromper o fluxo da unidade).
- Pessoa que não consegue responder por conta própria. Ninguém responde no lugar de outra pessoa: o
  questionário é sobre a experiência de quem está respondendo. Se quem acompanha quiser responder por
  si mesmo, tudo bem — aí ele é o respondente, e a folha é dele.
- Funcionário da unidade, estagiário e integrante do próprio grupo.

**Como abordar.**

- Dois estudantes por turno, cobrindo manhã e tarde e espalhando os turnos pelos cinco dias da semana.
  Coletar só de manhã enviesa a amostra para quem faz exame de sangue em jejum.
- Abordar em ordem de chegada, não escolhendo "quem parece que vai responder bem".
- A aplicação leva de 3 a 5 minutos no T0 e de 5 a 10 minutos no T1 (quem nunca entrou no site termina
  antes, porque pula a Parte C inteira). Ler as perguntas em voz alta para quem tiver dificuldade
  de leitura e marcar a resposta pela pessoa, sem sugerir alternativa.
- Registrar também quantas pessoas foram abordadas e recusaram — só o número, sem qualquer dado da
  pessoa. Isso vira uma linha honesta no relatório ("foram abordadas N pessoas, das quais R recusaram").

**Como evitar abordar a mesma pessoa duas vezes.**

- Primeira frase da abordagem: "você já respondeu esta pesquisa aqui na UBS nas últimas semanas?".
  Se sim, agradecer e não aplicar.
- Dentro do mesmo turno, os dois estudantes trabalham em lados opostos da sala e avisam um ao outro
  quem já foi abordado.
- Não criar lista de nomes para controlar repetição — isso quebraria o anonimato. A pergunta inicial é
  suficiente para o nível de rigor deste estudo, e a limitação fica registrada no item 8.
- Entre T0 e T1 a repetição é esperada e aceitável: são amostras independentes, e a mesma pessoa pode
  aparecer nas duas. Isso é limitação declarada, não erro a esconder.

---

## 7. Ética — pendências a resolver ANTES de coletar

Nada nesta lista está resolvido. Cada item precisa ser fechado com [nome do professor orientador]
e registrado com data antes de a primeira pessoa ser abordada.

- [ ] **Enquadramento.** Perguntar a [nome do professor orientador] e à coordenação do curso se este
      trabalho é considerado pesquisa com seres humanos. Se for, é preciso submissão ao CEP pela
      Plataforma Brasil, com projeto e TCLE, e **aguardar o parecer antes de coletar**.
- [ ] **Consentimento.** Definir com a orientação o formato: TCLE assinado em duas vias ou consentimento
      verbal registrado pelo entrevistador. Seja qual for, a pessoa precisa ouvir antes: quem somos, para
      que serve, que é voluntário, que pode parar a qualquer momento e que isso não muda em nada o
      atendimento dela na unidade.
- [ ] **Autorizações institucionais.** Carta de anuência da coordenação da UBS Paquetá e autorização da
      Secretaria de Saúde de Brusque para coletar dentro da unidade e para usar as contagens da recepção.
- [ ] **Anonimato.** Não coletar nome, CPF, cartão do SUS, telefone, endereço, e-mail nem foto.
      Os questionários são numerados (01, 02, 03...) e nada mais. Não existe lista que ligue número
      a pessoa.
- [ ] **Idade.** Só maiores de 18 anos. Menor de idade exigiria assentimento e autorização do
      responsável — fora do escopo deste projeto.
- [ ] **Guarda dos dados.** Definir onde ficam os papéis (envelope fechado, sob responsabilidade de
      [nome do integrante responsável]) e a planilha digitada (pasta com acesso restrito ao grupo e à
      orientação), por quanto tempo, e o que é feito com os papéis no fim.
- [ ] **Publicação.** Confirmar o que pode ser divulgado (relatório, pôster, apresentação) e se a
      unidade pode ser nomeada. Combinar a devolutiva dos resultados para a equipe.

**Enquanto estes itens não estiverem fechados, este projeto não tem aprovação ética e não deve ser
descrito como tendo.** Não escreva número de parecer, nome de comitê ou data de aprovação em lugar
nenhum antes de existir o documento.

---

## 8. Limitações e vieses esperados

Escrever isto no relatório, com estas palavras, é o que separa um trabalho honesto de um panfleto.

- **Viés de seleção grave.** Só entrevistamos quem está na sala de espera — ou seja, quem **conseguiu
  chegar**. As pessoas que a intervenção mais deveria ajudar (quem veio à toa e desistiu, quem não vem
  mais por não saber o horário, quem não tem transporte) estão fora da amostra por definição. Nosso
  denominador é o mais favorável possível.
- **Ausência de grupo controle.** Qualquer diferença entre T0 e T1 pode vir de outra coisa que
  aconteceu no meio: mudança na escala da equipe, chegada de profissional novo, campanha da Secretaria,
  reportagem local, mudança no horário real de algum setor.
- **Sazonalidade e eventos.** Feriado, campanha de vacinação, surto de gripe ou dengue e período de
  férias mudam quem está na sala de espera e quantas ligações a recepção recebe. Registrar em diário
  de campo tudo o que sair do normal em cada semana de coleta, e citar isso na discussão.
- **Efeito de novidade.** Um cartaz recém-colado é olhado; o mesmo cartaz depois de dois meses vira
  parede. Medir com 4 a 6 semanas de uso capta o melhor momento da intervenção, não o patamar
  estável. O que medirmos é provavelmente um teto, não a média.
- **Desejabilidade social e efeito do entrevistador.** Quem pergunta é o mesmo grupo que fez o site e
  colou o cartaz. A pessoa tende a dizer que gostou, que achou útil e que usou. Reduza o efeito assim:
  não dizer na abordagem que o site foi feito pelo grupo, ler as opções sempre até o fim, e deixar
  claro que "não conheço" é uma resposta perfeitamente aceitável. Mesmo assim, o viés continua — e
  fica declarado.
- **Autorrelato e memória.** "Viagem perdida nos últimos 6 meses" depende da memória de cada um, e
  seis meses é bastante tempo. O número serve para comparar T0 com T1 sob a mesma pergunta, não como
  medida absoluta de quantas viagens perdidas acontecem no bairro.
- **Contagem da recepção depende de rotina humana.** Em dia cheio, a recepção esquece de marcar. A
  subcontagem provavelmente é maior nos dias movimentados, e não é igual entre T0 e T1.
- **Medição de acessos não identifica pessoas.** Um acesso não é uma pessoa: a mesma pessoa pode abrir
  o site cinco vezes, e o grupo testando o site também gera acesso. Cuidado com uma armadilha: abrir o
  site com `?teste` **não** tira o acesso da contagem — esse parâmetro só mostra a barra de simular
  data e hora. Para não sujar o número, teste numa cópia local com `medicao.tipo` vazio e anote as
  vezes em que alguém do grupo abriu o site publicado. E há uma subcontagem embutida: o site abre sem
  internet (fica guardado no celular), e nessas horas a contagem não chega a ser enviada. No relatório,
  diga que os números são de visitas, não de pessoas.
- **Amostra pequena e por conveniência.** Com cerca de 50 respostas por rodada, diferenças pequenas
  entre T0 e T1 não se distinguem do acaso, e a amostra não representa a população do bairro.
- **Exclusão digital como limite da própria intervenção.** Parte do público não tem celular com
  internet. Para essas pessoas, o site não resolve nada — o cartaz impresso com os horários é a única
  parte da intervenção que as alcança. Isso é achado, não desculpa: vale ser dito na conclusão.

---

## 9. Como analisar

O básico, bem feito, é suficiente. Tudo cabe em uma planilha.

1. **Digitação.** Uma linha por questionário, uma coluna por pergunta, com o número do questionário na
   primeira coluna. Digitar em dupla (uma pessoa lê, outra digita) e conferir 10 questionários
   sorteados no fim.
2. **Proporções.** Para cada indicador do item 4, calcular `n/N` e a porcentagem, **sempre mostrando o
   n e o N**, não só o "%". Apresentar T0 e T1 lado a lado e a diferença em pontos percentuais.
   O formato é este (os números abaixo são inventados, só para mostrar como se escreve — não use
   nenhum deles no relatório): "de 22% para 41%, diferença de 19 pontos percentuais". Nunca escrever
   "aumentou 19%" quando o que mudou foram 19 pontos percentuais.
3. **Escala de usabilidade.** Calcular a nota de 0 a 100 de cada respondente conforme a regra
   descrita em [`questionario-pos-e-sus.md`](questionario-pos-e-sus.md), e reportar média, menor nota,
   maior nota, quantas pessoas responderam a escala e quantas ficaram de fora por terem respondido "NS"
   em algum item. Se pouca gente tiver entrado no site, a média sai de uma base minúscula — nesse caso,
   mostre as notas uma a uma em vez de esconder um n pequeno atrás de uma média.
4. **Contagem da recepção.** Somar os riscos **de cada contador separadamente** (A, B e C — não some
   os três num número só) e dividir pelo número de dias úteis efetivamente contados, não pelo número
   de dias previstos. Comparar a média por dia útil de T0 com a de T1, contador por contador, e
   informar quantos dias entraram em cada período. Ler junto a coluna Observação: um Dia D ou uma
   semana de feriado explica mais do que qualquer conta. Publicar junto a resposta de quem preencheu
   sobre o quanto acha que deixou de marcar (nada / um pouco / bastante / não sei), em cada rodada — é
   o que dá a quem lê o tamanho da subnotificação.
5. **Perguntas abertas dos questionários.** Agrupar respostas parecidas em 3 a 5 categorias, contar
   quantas caíram em cada uma e trazer duas ou três frases curtas como ilustração, sem qualquer
   identificação. Isso vale para os questionários, que têm dezenas de respostas. As **entrevistas com
   a equipe** seguem a regra do próprio roteiro: temas descritos em palavras, nunca em porcentagem.
6. **Testes estatísticos.** Não são necessários para o objetivo deste trabalho. Se [nome do professor
   orientador] pedir, dá para aplicar um teste de comparação de proporções — mas com este tamanho de
   amostra o poder é baixo, e um resultado "não significativo" não vai significar "não funcionou".
   Decidir isso com a orientação **antes** de olhar os dados, não depois.

**Sobre causalidade: não afirmar.** Este desenho não permite dizer que o site causou qualquer mudança.
Escreva "após a intervenção, observou-se que..." e não "o site reduziu...". Vocabulário aceitável:
observou-se, foi relatado, houve variação de, os participantes que usaram o site relataram.
Vocabulário proibido: causou, reduziu, provou, comprovou, garantiu, teve impacto de.

---

## 10. Esqueleto do relatório e do pôster

**Nenhum número deve ser escrito nestas seções antes de ter sido coletado.** Monte as tabelas com as
células vazias ou com `[ ]` e preencha só depois da digitação. Número "de exemplo" colocado para ver
como fica o texto tem uma chance real de sobreviver até a versão final e virar dado falso.

### Relatório

1. Título, autores, [nome da instituição], [nome do professor orientador], [data]
2. Resumo (escrever por último)
3. Introdução e justificativa — o problema do horário, o contexto da atenção básica, a UBS Paquetá
4. Objetivos — geral e específicos (copiar do item 1 deste plano)
5. Método
   - 5.1 Local e período
   - 5.2 Desenho do estudo (antes-e-depois, sem controle, amostra de conveniência)
   - 5.3 Participantes: inclusão, exclusão, tamanho alcançado, recusas
   - 5.4 A intervenção: site, cartaz com QR code, bilhetes, treinamento da equipe, planilha
   - 5.5 Instrumentos e variáveis
   - 5.6 Coleta de dados
   - 5.7 Análise
   - 5.8 Aspectos éticos
6. Resultados
   - 6.1 Perfil dos participantes (T0 e T1), incluindo celular com internet e leitura de QR code
   - 6.2 Como as pessoas descobrem o horário — antes e depois — e o que sentem falta de saber (T0)
   - 6.3 Relato de viagem perdida — antes e depois
   - 6.4 Contagem da recepção: ligações, gente que veio e achou o setor fechado, perguntas no balcão
   - 6.5 Alcance: acessos ao site, quantos chegaram pelo papel e por onde as pessoas dizem ter sabido
   - 6.6 Uso e usabilidade do site: achou a informação, deixou de vir, escala SUS
   - 6.7 Manutenção da planilha e visão da equipe
7. Discussão — o que os dados sugerem, o que não sustentam, comparação com o que se esperava
8. Limitações (copiar e adaptar do item 8 deste plano)
9. Conclusão e recomendações à unidade
10. Sustentabilidade e próximos passos — quem mantém a planilha, o que acontece quando o semestre acabar
11. Referências
12. Apêndices — instrumentos aplicados, TCLE ou registro de consentimento, autorizações

### Pôster

Título · Problema e justificativa · Objetivo · Método (uma caixa curta) · Resultados (2 ou 3 gráficos
ou tabelas simples) · Conclusão · Limitações em uma linha · [nome da instituição] e agradecimento à
equipe da UBS Paquetá · QR code do site em tamanho legível a um metro de distância.
