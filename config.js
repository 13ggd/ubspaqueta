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
    subtitulo:'Posto de saúde do bairro Paquetá',
    endereco: 'Rua Waldemar Hoffmann, sem número',
    bairro:   'Bairro Paquetá — Brusque/SC',
    telefone: '(47) 2017-0548',
    telefoneLink: '+554720170548',
    secretaria:     '(47) 2017-0620',
    secretariaLink: '+554720170620',
    mapa: 'https://www.google.com/maps/search/?api=1&query=-27.141149,-48.923052'
  },

  /* ---- 2. PLANILHA DO GOOGLE ------------------------------------------- */
  /*
     Cole aqui só o ID da planilha (o pedaço do meio do endereço):

     https://docs.google.com/spreadsheets/d/ 1AbC...XyZ /edit#gid=0
                                             ^^^^^^^^^^ este pedaço

     A planilha precisa ter duas abas: "servicos" e "avisos"
     e estar compartilhada como "Qualquer pessoa com o link" → Leitor.

     Enquanto estiver como está, o site usa os dados de reserva do item 4.
  */
  planilhaId:  'COLE_O_ID_DA_PLANILHA_AQUI',
  abaServicos: 'servicos',
  abaAvisos:   'avisos',

  /* De quanto em quanto tempo o site relê a planilha (em minutos) */
  recarregarACada: 5,

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
        det:  'Rua Prefeito Germano Schaefer, 66 — Centro. Se a sala do posto estiver fechada, você pode vacinar aqui.',
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
  servicosReserva: [
    { id:'consulta',   nome:'Consulta com médico',
      para:'Para consultar quando está doente ou fazer acompanhamento.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'enfermagem', nome:'Enfermagem',
      para:'Para medir a pressão, tirar dúvidas e receber orientação.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'vacina',     nome:'Sala de vacina',
      para:'Para tomar vacina. Leve documento e a carteirinha de vacinação.',
      h:{seg:'08:00-17:00',ter:'08:00-17:00',qua:'08:00-17:00',qui:'08:00-17:00',sex:'08:00-17:00',sab:'',dom:''} },

    { id:'farmacia',   nome:'Farmácia',
      para:'Para pegar remédio. Leve a receita e o cartão do SUS.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'curativo',   nome:'Curativo e injeção',
      para:'Para fazer curativo, tomar injeção ou tirar pontos.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'exame',      nome:'Coleta de exame de sangue',
      para:'Venha em jejum, sem comer. Só de manhã cedo.',
      h:{seg:'07:00-09:30',ter:'07:00-09:30',qua:'07:00-09:30',qui:'07:00-09:30',sex:'07:00-09:30',sab:'',dom:''} },

    { id:'dentista',   nome:'Dentista',
      para:'Precisa marcar antes. Ligue ou venha até o posto.',
      h:{seg:'08:00-17:00',ter:'',qua:'08:00-17:00',qui:'',sex:'08:00-17:00',sab:'',dom:''} },

    { id:'mulher',     nome:'Saúde da mulher',
      para:'Preventivo, pré-natal e planejamento familiar.',
      h:{seg:'',ter:'13:00-17:00',qua:'',qui:'13:00-17:00',sex:'',sab:'',dom:''} }
  ],

  avisosReserva: [
    { tipo:'recado', servico:'',
      titulo:'Neste sábado o posto do Paquetá não abre',
      texto:'No sábado, dia 22 de agosto, tem Dia D de vacinação das 7 às 13 horas, mas só nos postos Águas Claras, Limeira Baixa, Dom Joaquim e São Luiz, e também na Policlínica. Leve documento e a carteirinha de vacinação. Não precisa marcar: é por ordem de chegada.',
      inicio:'2026-08-22', fim:'2026-08-22', novo:'', atualizado:'18/08 às 9h' },

    { tipo:'fechado', servico:'dentista',
      titulo:'O dentista não vai atender',
      texto:'A cadeira do dentista está quebrada e o conserto ainda não terminou. Se estiver com muita dor de dente, procure a Policlínica, no Centro.',
      inicio:'2026-08-19', fim:'2026-08-21', novo:'', atualizado:'19/08 às 7h15' },

    { tipo:'atencao', servico:'exame',
      titulo:'Exame de sangue termina mais cedo na quinta',
      texto:'Na quinta-feira a coleta encerra às 8 horas e 30 minutos, porque a equipe tem reunião. Chegue cedo.',
      inicio:'2026-08-20', fim:'2026-08-20', novo:'07:00-08:30', atualizado:'19/08 às 7h30' }
  ]
};
