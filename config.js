/* ============================================================================
   CONFIGURACAO DA UNIDADE
   ----------------------------------------------------------------------------
   ESTE É O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR.

   Aqui ficam: o nome da unidade, endereço, telefones, o link da planilha
   e os dados de reserva (usados se a planilha estiver fora do ar).

   Para fazer o site de OUTRA UBS: copie a pasta inteira e mude só este arquivo.
   ========================================================================== */

const CONFIG = {

  /* ---- 1. IDENTIFICAÇÃO DA UNIDADE ------------------------------------- */
  unidade: {
    orgao:    'Prefeitura de Brusque · Secretaria de Saúde',
    nome:     'UBS Paquetá',
    subtitulo:'Unidade Básica de Saúde do bairro Paquetá',
    endereco: 'Rua Waldemar Hoffmann, sem número',
    bairro:   'Bairro Paquetá — Brusque/SC',
    telefone: '(47) 2017-0548',
    telefoneLink: '+554720170548',
    secretaria:     '(47) 2017-0620',
    secretariaLink: '+554720170620',
    mapa: 'https://www.google.com/maps/place/?q=place_id:ChIJV2DuZfVG35QRRnPgxVVeE5M',
    instagram: 'https://www.instagram.com/ubspaqueta/',

    /* Foto do prédio (fachada). Deixe vazio ('') para não mostrar nada.
       Mesma regra das fotos da equipe: coloque o arquivo na pasta "fotos"
       do repositório e escreva só o nome aqui — ex: 'fachada.jpg' —
       ou cole um link completo (https://...). */
    foto: 'https://www.diplomatafm.com.br/wp-content/uploads/2025/02/002d20b5-8586-415f-bbdc-37c70fcf6c35-UNII.png'
  },

  /* ---- 2. PLANILHA DO GOOGLE ------------------------------------------- */
  /*
     Cole aqui só o ID da planilha (o pedaço do meio do endereço):

     https://docs.google.com/spreadsheets/d/ 1AbC...XyZ /edit#gid=0
                                             ^^^^^^^^^^ este pedaço

     A planilha precisa ter quatro abas: "setores", "mudancas-horario",
     "recados" e "equipe" — e estar compartilhada como "Qualquer pessoa
     com o link" → Leitor.

     Por que "mudancas-horario" e "recados" são abas separadas (em vez de
     uma única aba "avisos" com um tipo pra escolher): assim ninguém
     precisa decidir entre palavras parecidas tipo "atenção" e "recado" —
     cada aba já diz pra que serve. E o nome "mudancas-horario" (em vez de
     só "horarios") é de propósito: o horário padrão de cada dia mora na
     aba "setores" — esta aqui é só sobre o que muda hoje em relação a
     ele. Na aba "mudancas-horario", nem precisa escolher se é fechamento
     ou mudança de horário: se a coluna "novo" tiver um horário, mudou;
     se estiver vazia, fechou o dia todo.

     Precisa fechar a UBS INTEIRA por algum imprevisto (falta de energia,
     problema estrutural)? Em vez de criar uma linha pra cada setor,
     escreva "todos" na coluna "setor" — uma linha só fecha tudo.

     Enquanto estiver como está, o site usa os dados de reserva do item 4.
  */
  planilhaId:  '1-RLhGWQlNl64BDa4kfpCRz1dgagQgoZB9cSce8Ob0jU',
  abaSetores:  'setores',
  abaHorarios: 'mudancas-horario',
  abaRecados:  'recados',
  abaEquipe:   'equipe',
  abaFaltas:   'faltas',

  /* De quanto em quanto tempo o site relê a planilha (em minutos) */
  recarregarACada: 5,

  /* Onde ficam as fotos da equipe. Coloque os arquivos de foto numa pasta
     chamada "fotos" no mesmo repositório do GitHub (instruções no guia).
     Na planilha, a coluna "foto" pode ter só o nome do arquivo
     (ex: cleber.jpg) ou um link completo (https://...) — os dois funcionam. */
  pastaFotos: 'fotos/',

  /* ---- 3. ONDE IR EM CASO DE URGÊNCIA ---------------------------------- */
  urgencia: {
    telefone: '192',
    chamada:  'Ligue para o SAMU<br>em caso grave',
    lugares: [
      {
        nome: 'Pronto Atendimento 24 horas',
        det:  'Rua Vendelino Maffezzolli, 215 — bairro Santa Terezinha. Tem farmácia no local.',
        hora: 'Aberto todos os dias, 24 horas'
      },
      {
        nome: 'Hospital Azambuja e Hospital Dom Joaquim',
        det:  'Atendem pelo SUS.',
        hora: 'Aberto todos os dias, 24 horas'
      },
      {
        nome: 'Sala de vacina da Policlínica',
        det:  'Rua Prefeito Germano Schaefer, 66 — Centro. Se a sala da UBS estiver fechada, você pode vacinar aqui.',
        hora: 'Das 8 às 19 horas'
      }
    ]
  },

  /* ---- 4. DADOS DE RESERVA --------------------------------------------- */
  /*
     Usados quando a planilha ainda não foi configurada ou está fora do ar.
     Mantenha estes dados razoavelmente atualizados: eles são a rede de
     segurança para o site nunca aparecer vazio.
  */
  setoresReserva: [
    { id:'consulta',   nome:'Consulta com médico',
      para:'Para consultar quando está doente ou fazer acompanhamento.',
      levar:'Documento com foto e cartão do SUS.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'enfermagem', nome:'Enfermagem',
      para:'Para medir a pressão, tirar dúvidas e receber orientação.',
      levar:'Documento com foto.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'vacina',     nome:'Sala de vacina',
      para:'Para tomar vacina.',
      levar:'Documento e a carteirinha de vacinação.',
      h:{seg:'08:00-17:00',ter:'08:00-17:00',qua:'08:00-17:00',qui:'08:00-17:00',sex:'08:00-17:00',sab:'',dom:''} },

    { id:'farmacia',   nome:'Farmácia',
      para:'Para pegar remédio.',
      levar:'Receita e o cartão do SUS.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'curativo',   nome:'Curativo e injeção',
      para:'Para fazer curativo, tomar injeção ou tirar pontos.',
      levar:'Documento e, se tiver, o pedido do médico.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'exame',      nome:'Coleta de exame de sangue',
      para:'Coleta de sangue para exames.',
      levar:'Documento, cartão do SUS e o pedido do médico. Venha em jejum, sem comer.',
      h:{seg:'07:00-09:30',ter:'07:00-09:30',qua:'07:00-09:30',qui:'07:00-09:30',sex:'07:00-09:30',sab:'',dom:''} },

    { id:'dentista',   nome:'Dentista',
      para:'Precisa marcar antes.',
      levar:'Documento e cartão do SUS. Ligue ou venha até a UBS pra marcar.',
      h:{seg:'08:00-17:00',ter:'',qua:'08:00-17:00',qui:'',sex:'08:00-17:00',sab:'',dom:''} },

    { id:'mulher',     nome:'Saúde da mulher',
      para:'Preventivo, pré-natal e planejamento familiar.',
      levar:'Documento e cartão do SUS.',
      h:{seg:'',ter:'13:00-17:00',qua:'',qui:'13:00-17:00',sex:'',sab:'',dom:''} }
  ],

  avisosReserva: [
    { tipo:'recado', setor:'', ativo:true,
      titulo:'Neste sábado a UBS Paquetá não abre',
      texto:'No sábado, dia 22 de agosto, tem Dia D de vacinação das 7 às 13 horas, mas só nas UBS Águas Claras, Limeira Baixa, Dom Joaquim e São Luiz, e também na Policlínica. Leve documento e a carteirinha de vacinação. Não precisa marcar: é por ordem de chegada.',
      inicio:'2026-08-22', fim:'2026-08-22', novo:'' },

    { tipo:'fechado', setor:'dentista', ativo:true,
      titulo:'O dentista não vai atender',
      texto:'A cadeira do dentista está quebrada e o conserto ainda não terminou. Se estiver com muita dor de dente, procure a Policlínica, no Centro.',
      inicio:'2026-08-19', fim:'2026-08-21', novo:'' },

    { tipo:'atencao', setor:'exame', ativo:true,
      titulo:'Exame de sangue termina mais cedo na quinta',
      texto:'Na quinta-feira a coleta encerra às 8 horas e 30 minutos, porque a equipe tem reunião. Chegue cedo.',
      inicio:'2026-08-20', fim:'2026-08-20', novo:'07:00-08:30' }
  ],


  /* ---- 5. EQUIPE (EXEMPLO) --------------------------------------------- */
  /*
     ESTES NOMES SÃO EXEMPLO — troque pelos nomes e funções reais da equipe,
     de preferência editando a aba "equipe" na planilha (assim como setores
     e avisos). Isso aqui só é usado se a planilha estiver fora do ar.

     O campo "equipe" agrupa as pessoas por time (Equipe 1, Equipe 2...).
     Se você deixar esse campo vazio para todo mundo, o site mostra uma
     lista única, sem separar por time.

     O campo "setor" liga a pessoa ao mesmo código usado na coluna "setor"
     da aba "setores" (o mesmo código usado em "mudancas-horario"). É o
     que permite o fechamento automático quando alguém falta — veja a aba
     "faltas" logo abaixo. Pode ter mais de um setor, separado por
     vírgula. Deixe vazio se a pessoa não estiver ligada a nenhum setor
     específico (ex: recepção).
  */
  equipeReserva: [
    { nome:'(nome de exemplo)', funcao:'Médica de família', equipe:'Equipe 1', setor:'consulta',   foto:'', obs:'' },
    { nome:'(nome de exemplo)', funcao:'Enfermeira',        equipe:'Equipe 1', setor:'enfermagem', foto:'', obs:'' },
    { nome:'(nome de exemplo)', funcao:'Técnica de enfermagem', equipe:'Equipe 1', setor:'enfermagem', foto:'', obs:'' },

    { nome:'(nome de exemplo)', funcao:'Médico de família', equipe:'Equipe 2', setor:'consulta', foto:'', obs:'' },
    { nome:'(nome de exemplo)', funcao:'Enfermeiro',        equipe:'Equipe 2', setor:'',          foto:'', obs:'' },

    { nome:'(nome de exemplo)', funcao:'Dentista', equipe:'Equipe 3', setor:'dentista', foto:'', obs:'Atende às segundas, quartas e sextas' },
    { nome:'(nome de exemplo)', funcao:'Recepção e acolhimento', equipe:'', setor:'', foto:'', obs:'' }
  ],

  /* ---- 6. FALTAS (EXEMPLO) ----------------------------------------------
     Vazio por padrão — só é usado se a planilha estiver fora do ar.
     Veja a aba "faltas" na planilha para o uso real.
  */
  faltasReserva: [],

  /* ---- 7. FERIADOS ------------------------------------------------------
     A unidade fecha sozinha nessas datas, sem precisar cadastrar nada na
     planilha todo ano. São os feriados nacionais brasileiros + o
     aniversário de Brusque (veja o aviso logo abaixo sobre essa última).

     Se a unidade NÃO fechar em algum feriado móvel (ligado à Páscoa —
     Carnaval, Sexta-feira Santa, Corpus Christi), apague a linha
     correspondente em "feriadosMoveis".
  */
  feriadosFixos: [
    {data:'01-01', nome:'Confraternização Universal'},
    {data:'04-21', nome:'Tiradentes'},
    {data:'05-01', nome:'Dia do Trabalho'},
    {data:'09-07', nome:'Independência do Brasil'},
    {data:'10-12', nome:'Nossa Senhora Aparecida'},
    {data:'11-02', nome:'Finados'},
    {data:'11-15', nome:'Proclamação da República'},
    {data:'11-20', nome:'Consciência Negra'},
    {data:'12-25', nome:'Natal'},

    /* PRECISA CONFIRMAR: o site da prefeitura tem uma página chamada
       "Feriado Municipal do Aniversário de Brusque" (4 de agosto), mas
       pelo menos uma fonte externa dizia que falta lei municipal
       regulamentando a data como feriado — e mesmo que seja oficial pra
       repartições administrativas, unidades de saúde às vezes não
       fecham nesse tipo de data ("ponto facultativo"). Confirme com a
       Secretaria de Saúde se a UBS realmente fecha em 4 de agosto —
       se não fechar, apague esta linha. */
    {data:'08-04', nome:'Aniversário de Brusque'}
  ],
  feriadosMoveis: [
    {deslocamento:-48, nome:'Carnaval'},
    {deslocamento:-47, nome:'Carnaval'},
    {deslocamento:-2,  nome:'Sexta-feira Santa'},
    {deslocamento:60,  nome:'Corpus Christi'}
  ]
};

