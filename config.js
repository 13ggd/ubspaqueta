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
    /* Número separado para encaminhamentos (exames e consultas) — se receber
       uma ligação de um destes dois números, é a própria UBS ligando. */
    telefoneEncaminhamentos: '(47) 2017-0549',
    telefoneEncaminhamentosLink: '+554720170549',
    avisoLigacao: 'Caso receba uma ligação de um destes números, por favor atenda: será sobre seus exames e consultas.',
    secretaria:     '(47) 3255-6800',
    secretariaLink: '+554732556800',
    /* Link "Abrir o mapa no celular". Use o formato oficial do Google
       ("Maps URLs"): search/?api=1&query=<nome ou endereço>&query_place_id=<ID>.
       O "query" é obrigatório e é o que aparece caso o celular não reconheça
       o ID; o "query_place_id" é o que crava o ponto exato. O formato antigo
       maps/place/?q=place_id:<ID> não é documentado e, no APP do Google Maps
       do celular, às vezes cai numa busca pelo texto literal "place_id:ChIJ…"
       em vez de abrir a unidade. */
    mapa: 'https://www.google.com/maps/search/?api=1&query=UBS%20Paquet%C3%A1%2C%20Rua%20Waldemar%20Hoffmann%2C%20Brusque%20-%20SC&query_place_id=ChIJV2DuZfVG35QRRnPgxVVeE5M',
    instagram: 'https://www.instagram.com/ubspaqueta/',

    /* Endereço do site depois de publicado (ex: 'https://ubspaqueta.vercel.app').
       Só é usado pelo cartaz.html, para gerar o QR code impresso. Se deixar
       vazio, o cartaz deduz o endereço da própria janela do navegador — o que
       funciona, mas gera um QR apontando para "localhost" se você abrir o
       cartaz antes de publicar o site. Preencha assim que publicar. */
    site: '',

    /* Endereço da página que lista TODAS as unidades de saúde, no site da
       Secretaria. Vira um link "Ver todas as unidades de saúde" no card
       "Onde fica e telefones", logo abaixo do telefone da Secretaria.
       Serve principalmente quando este site é publicado sob o domínio da
       Secretaria (ex: paqueta.smsbrusque.sc.gov.br): ali não existe o menu
       do portal em volta, então quem chega direto (QR, link, favorito)
       precisa de um caminho de volta para achar outra unidade. NÃO é
       redirecionamento automático — é só um link visível. Deixe vazio ('')
       para não mostrar nada. */
    paginaUnidades: 'https://www.smsbrusque.sc.gov.br/unidade',

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

     A planilha precisa ter a aba "setores" (obrigatória) e pode ter também
     "mudancas-horario", "recados", "equipe", "faltas", "ruas" e
     "reunioes" (todas opcionais — sem elas o site usa os dados de
     reserva do item 4) — e estar compartilhada como "Qualquer pessoa com
     o link" → Leitor.

     A aba "ruas" é a área de abrangência de cada equipe (quais ruas cada
     time atende), pra ficar editável na planilha em vez de precisar
     mexer em código pra atualizar — mesma lógica de "equipe": duas
     colunas, "equipe" (precisa ser igual ao nome usado na coluna
     "equipe" da aba "equipe") e "rua" (uma rua por linha, repetindo o
     nome da equipe em cada linha dela). O horário de atendimento de cada
     equipe (ex: "7h às 13h") não tem aba própria — é só mais uma coluna
     opcional, "horario", na aba "equipe": preencha numa linha por time
     (normalmente a da médica) que o site acha sozinho, olhando quem tem
     esse campo preenchido dentro do mesmo grupo.

     A aba "reunioes" é pra avisos tipo "toda 2ª e 4ª quarta-feira do mês
     a equipe está em reunião" — o site calcula sozinho as datas de
     verdade daquele mês, sem precisar de uma linha nova a cada
     ocorrência. Colunas: "setores" (um ou mais códigos separados por
     vírgula, ex: "consulta,enfermagem"), "dia" (seg/ter/qua/qui/sex/
     sab/dom), "ocorrencias" (quais dessas semanas no mês contam —
     1=primeira, 2=segunda... ex: "2,4") e "texto" (o que aparece depois
     da data, ex: "a equipe está em reunião das 13h às 15h.").

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
  abaRuas:     'ruas',
  abaReunioes: 'reunioes',

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

  /* ---- 3b. OUTROS TELEFONES ÚTEIS --------------------------------------- */
  /* Aparecem escondidos atrás de "Outros telefones úteis ▾", no fim do
     cartão "Onde fica e telefones" — não são sobre a UBS em si (por isso
     ficam fora da seção de urgência e do cartão principal), mas é útil
     ter à mão. Números de emergência (SAMU, hospitais) já aparecem em
     outro lugar da página, não precisa repetir aqui. */
  telefonesUteis: [
    { nome:'Polícia',                                          telefone:'190', telefoneLink:'190' },
    { nome:'Bombeiros',                                        telefone:'193', telefoneLink:'193' },
    { nome:'Conselho Tutelar (Criança e Adolescente)',         telefone:'(47) 3351-0113', telefoneLink:'+554733510113' },
    { nome:'Vigilância Sanitária',                             telefone:'(47) 3351-2424', telefoneLink:'+554733512424' },
    { nome:'CAPS Álcool e Drogas',                              telefone:'(47) 3306-9305', telefoneLink:'+554733069305' },
    { nome:'CAPS 2 (Centro de Atenção Psicossocial)',          telefone:'(47) 3304-4710', telefoneLink:'+554733044710' },
    { nome:'CAPS Infanto-Juvenil',                              telefone:'(47) 3396-8182', telefoneLink:'+554733968182' },
    { nome:'Delegacia da Criança, Mulher, Adolescente e Idoso', telefone:'(47) 3251-8303', telefoneLink:'+554732518303' }
  ],

  /* ---- 3c-2. RUAS ATENDIDAS POR EQUIPE (RESERVA) ------------------------ */
  /* Igual a equipeReserva/faltasReserva: só usado enquanto a aba "ruas" da
     planilha não existir (ou estiver fora do ar) — assim que ela existir,
     o site troca por essa aba mesmo que venha vazia. Área de abrangência
     de cada equipe de saúde da família, copiada dos murais impressos na
     própria unidade. Aparece embaixo de cada time no card "Quem trabalha
     aqui", atrás de "Ruas atendidas ▾". O nome em "equipe" precisa ser
     igual ao campo "equipe" da pessoa (em equipeReserva ou na aba
     "equipe" da planilha) pra ligar a lista ao time certo — se não bater
     com nenhum time, a lista simplesmente não aparece. Fica de fora se a
     equipe não tiver rua cadastrada ainda. */
  areasEquipeReserva: [
    { equipe:'Equipe 1', ruas:[
      '13 de março','Abelardo Joaquim Nazário','Ana Klabunde','AZ 026','AZ 027','AZ 030','AZ 060',
      'Carlos Antonio Campos de Souza','Carmelina Groh','Carola Dias','Dr Euclides Cardeal',
      'Dr Ivo Szpoganicz','Eduarda R Antunes','Elisa Klabunde','Elsa Popper','Emma Jeske',
      'Flor-de-lis','Gardênia','Girassol','Hilda Wegner','Ilza Jeske Dias de Oliveira',
      'Inacio Gullini','João Alves Cabral','José Adriano','José João Wanatt',
      'José Venancio Pinheiro','Leopoldo Klabunde','Orquídeas','Odemar de Melo','PA 006',
      'Padre Antônio Eising (semáforo do Colzani até esquina do mercado Rainha)',
      'Reinoldo Wegner','Travessa Lagoa Dourada (até nº 413)','Tulipa','Vitória-régia',
      'Waldemar Hoffmann'
    ] },
    { equipe:'Equipe 2', ruas:[
      '23 de setembro','Abraão Alfredo Maçaneiro','Alfredo Carlos Klabunde','Alma Klann',
      'Jacob Schmidt','Jaison Knihs','Jorge Teixeira','Luiz Eccel','Ramiro Cabral e Silva'
    ] },
    { equipe:'Equipe 3', ruas:[
      '17 de julho','AC 032','AC 033','AC 039','Alberto Klabunde','Alvin Augusto Klann',
      'Andrino Leopoldo de Souza','Augusto Klabunde','Carlos Jeske','Celso Arthur de Oliveira',
      'CD 001','CD 002','CD 003','Ervin Kreidlow','Guilherme Kreidlow',
      'Loteamento Independencia','Luiz Mafra','Messina','Ovidio Boni','PA 001',
      'Paulina Gelatti de Oliveira','Pinheiros','Roma',
      'Santa Cruz (Semáforo Colzani até Agropecuária Mistura)','Sebastião Raiser',
      'Sem nome - Rua do Ferro Velho','Veneza','Wanda Kreidlow'
    ] }
  ],

  /* ---- 3c. REUNIÕES RECORRENTES DA EQUIPE (RESERVA) --------------------- */
  /* Igual a faltasReserva: vazio por padrão — só é usado se a planilha
     estiver fora do ar. Veja a aba "reunioes" pra uso real. Serve pra
     avisos tipo "toda 2ª e 4ª quarta-feira do mês" — em vez de escrever
     essa regra por extenso (obrigando quem lê a contar no calendário
     qual quarta é a 2ª), o site CALCULA as datas de verdade do mês
     atual e escreve na descrição do setor, tipo "Nos dias 12 e 26 de
     agosto...". "ocorrencias": 1=primeira, 2=segunda, 3=terceira...
     daquele dia da semana no mês. Deixado vazio de propósito (em vez de
     um exemplo preenchido): essa regra é específica de cada unidade, e
     ao replicar o template pra outra UBS ninguém deveria herdar sem
     querer um horário de reunião que não é o dela. Exemplo de como
     preencher (uma linha, igual à da aba "reunioes"):
     { setores:['consulta','enfermagem'], dia:'qua', ocorrencias:[2,4],
       texto:'a equipe está em reunião das 13h às 15h.' } */
  notasRecorrentesReserva: [],

  /* ---- 4. DADOS DE RESERVA --------------------------------------------- */
  /*
     Usados quando a planilha ainda não foi configurada ou está fora do ar.
     Mantenha estes dados razoavelmente atualizados: eles são a rede de
     segurança para o site nunca aparecer vazio.
  */
  setoresReserva: [
    { id:'consulta',   nome:'Consulta com médico',
      para:'Para consultar quando está doente ou fazer acompanhamento. Visita domiciliar, ' +
           'acompanhamento de crianças até 6 anos e teste rápido são agendados com ' +
           'antecedência — ligue ou venha até a UBS pra marcar.',
      levar:'Documento com foto e cartão do SUS.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'enfermagem', nome:'Enfermagem',
      para:'Para medir a pressão, tirar dúvidas e receber orientação.',
      levar:'Documento com foto.',
      h:{seg:'07:00-19:00',ter:'07:00-19:00',qua:'07:00-19:00',qui:'07:00-19:00',sex:'07:00-19:00',sab:'',dom:''} },

    { id:'vacina',     nome:'Sala de vacina',
      para:'Para tomar vacina.',
      levar:'Documento e a carteirinha de vacinação.',
      h:{seg:'08:00-11:30,13:00-16:30',ter:'08:00-11:30,13:00-16:30',qua:'08:00-11:30,13:00-16:30',
         qui:'08:00-11:30,13:00-16:30',sex:'08:00-11:30,13:00-16:30',sab:'',dom:''} },

    { id:'farmacia',   nome:'Farmácia',
      para:'Para pegar remédio.',
      levar:'Receita e o cartão do SUS.',
      h:{seg:'08:00-12:00,14:00-18:00',ter:'08:00-12:00,14:00-18:00',qua:'08:00-12:00,14:00-18:00',
         qui:'08:00-12:00,14:00-18:00',sex:'08:00-12:00,14:00-18:00',sab:'',dom:''} },

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
      h:{seg:'',ter:'13:00-17:00',qua:'',qui:'13:00-17:00',sex:'',sab:'',dom:''} },

    { id:'gestantes',  nome:'Grupo de gestantes',
      para:'Encontro em grupo para quem está grávida.',
      levar:'',
      h:{seg:'',ter:'08:00-12:00',qua:'',qui:'',sex:'',sab:'',dom:''} },

    { id:'diabeticos', nome:'Grupo de diabéticos e hipertensos',
      para:'Encontro em grupo para quem tem diabetes ou pressão alta.',
      levar:'',
      h:{seg:'',ter:'',qua:'',qui:'',sex:'08:00-12:00',sab:'',dom:''} }
  ],

  avisosReserva: [
    { tipo:'recado', setor:'', ativo:true,
      titulo:'Atenção, beneficiários do Bolsa Família: acompanhamento obrigatório de saúde',
      texto:'Venha até a UBS Paquetá para pesar, medir e atualizar as informações de saúde da sua família. Para manter o benefício, é obrigatório que crianças estejam com a caderneta de vacinação atualizada e gestantes estejam com o pré-natal em dia. Não precisa agendar horário — a não realização do acompanhamento pode resultar em perda do benefício.',
      inicio:'2026-08-26', fim:'2027-12-31', novo:'' },

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

     O campo "horario" é opcional e é do TIME, não da pessoa — vira um
     selo ao lado do nome da equipe (ex: "Equipe 1 · 7h às 13h") e some
     no card de detalhe de qualquer pessoa daquele time. Só precisa
     preencher numa pessoa por equipe (por convenção, a médica); o site
     usa o primeiro valor que encontrar dentro do grupo.
  */
  equipeReserva: [
    /* Equipe 1 — atendimento das 7h às 13h. Técnicos de enfermagem e
       Agentes Comunitárias de Saúde deste time ainda não confirmados
       (não apareciam completos no mural da unidade). */
    { nome:'Débora Aguiar',  funcao:'Médica de família', equipe:'Equipe 1', setor:'consulta',
      foto:'', obs:'', horario:'7h às 13h' },
    { nome:'Cleber Mossini', funcao:'Enfermeiro', equipe:'Equipe 1', setor:'enfermagem', foto:'', obs:'' },

    /* Equipe 2 — atendimento das 7h às 13h. */
    { nome:'Marcela Athayde', funcao:'Médica de família', equipe:'Equipe 2', setor:'consulta',
      foto:'', obs:'', horario:'7h às 13h' },
    { nome:'Thaila Ploêncio',  funcao:'Enfermeira', equipe:'Equipe 2', setor:'enfermagem', foto:'', obs:'' },
    { nome:'Ildonilso Mendes', funcao:'Técnico de enfermagem', equipe:'Equipe 2', setor:'enfermagem', foto:'', obs:'' },
    { nome:'Lindaura Merchol', funcao:'Técnica de enfermagem', equipe:'Equipe 2', setor:'enfermagem', foto:'', obs:'' },
    { nome:'Simara Marques',   funcao:'Agente Comunitária de Saúde', equipe:'Equipe 2', setor:'', foto:'', obs:'' },
    { nome:'Suely Kuhnen',     funcao:'Agente Comunitária de Saúde', equipe:'Equipe 2', setor:'', foto:'', obs:'' },

    /* Equipe 3 — atendimento das 13h às 19h. */
    { nome:'Aline Magalhães',       funcao:'Médica de família', equipe:'Equipe 3', setor:'consulta',
      foto:'', obs:'', horario:'13h às 19h' },
    { nome:'Alessandra Nunes',      funcao:'Enfermeira', equipe:'Equipe 3', setor:'enfermagem', foto:'', obs:'' },
    { nome:'Claudete Scarsanella',  funcao:'Técnica de enfermagem', equipe:'Equipe 3', setor:'enfermagem', foto:'', obs:'' },
    { nome:'Maria Dinair Costa',    funcao:'Técnica de enfermagem', equipe:'Equipe 3', setor:'enfermagem', foto:'', obs:'' },
    { nome:'Glacia Klabunde',       funcao:'Agente Comunitária de Saúde', equipe:'Equipe 3', setor:'', foto:'', obs:'' },
    { nome:'Iran Mariano',          funcao:'Agente Comunitária de Saúde', equipe:'Equipe 3', setor:'', foto:'', obs:'' },

    /* Demais profissionais — não ligados a um único time. */
    { nome:'Elisa Remor',         funcao:'Dentista', equipe:'Demais profissionais', setor:'dentista', foto:'', obs:'' },
    { nome:'Gisele dos Santos',   funcao:'Auxiliar de Saúde Bucal', equipe:'Demais profissionais', setor:'dentista', foto:'', obs:'' },
    { nome:'Ana Maria Lorena',    funcao:'Vacinadora', equipe:'Demais profissionais', setor:'vacina', foto:'', obs:'' },
    { nome:'Juliana Pering',      funcao:'Vacinadora', equipe:'Demais profissionais', setor:'vacina', foto:'', obs:'' },
    { nome:'Camila Grisa',        funcao:'Regulação', equipe:'Demais profissionais', setor:'', foto:'', obs:'' },
    { nome:'Raquel Betinelli',    funcao:'Regulação', equipe:'Demais profissionais', setor:'', foto:'', obs:'' },
    { nome:'Adriana Veber',       funcao:'Higienização', equipe:'Demais profissionais', setor:'', foto:'', obs:'' },
    { nome:'Lurdes Ortiz',        funcao:'Higienização', equipe:'Demais profissionais', setor:'', foto:'', obs:'' },
    { nome:'Ana Cláudia Fischer', funcao:'Estagiária de farmácia', equipe:'Demais profissionais', setor:'farmacia', foto:'', obs:'' }
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
  ],

  /* ---- 8. MEDIÇÃO DE ACESSOS (opcional) ---------------------------------
     Conta quantas pessoas abrem a página e quais botões são mais usados.
     Existe por causa do projeto de pesquisa: sem isso não dá pra dizer se o
     site foi usado — só que ele existe. Saber que "ver no mapa" foi o botão
     mais tocado, por exemplo, já é resultado: mostra qual informação estava
     faltando pra quem procurava a unidade.

     Nenhuma das duas opções abaixo usa cookie nem guarda nada que identifique
     a pessoa (sem nome, sem telefone, sem IP salvo, sem rastreamento entre
     sites). É por isso que o site não precisa de aviso de cookies — e é isso
     que você responde se o comitê de ética perguntar. Deixe tipo:'' para não
     medir nada; o site funciona igual, só não conta nada.

     Opções:
     'goatcounter' — funciona em qualquer hospedagem e é gratuito para uso
        não comercial. Crie a conta em goatcounter.com e cole em "codigo" o
        endereço de contagem, no formato https://SEUNOME.goatcounter.com/count
     'vercel' — só funciona se o site estiver hospedado na Vercel, com o Web
        Analytics ligado no painel do projeto; não precisa preencher "codigo".
        Atenção: a contagem de páginas funciona no plano gratuito, mas os
        eventos de clique exigem plano pago — nesse caso deixe cliques:false
        para não gerar chamada que vai ser descartada.

     O cartaz impresso (cartaz.html) gera o QR apontando para o site com
     ?de=cartaz no fim, e os bilhetes de recepção com ?de=bilhete. Com a
     medição ligada, cada um vira um evento próprio — é assim que se sabe
     quantas pessoas chegaram pelo papel na parede e quantas pelo papel
     entregue na mão, que são canais bem diferentes.

     Abrir o site com ?teste no fim NÃO conta acesso nenhum: as visitas do
     próprio grupo, conferindo como fica o site no sábado, ficariam
     misturadas com as dos moradores e inflariam o número medido.
     ---------------------------------------------------------------------- */
  medicao: {
    tipo:    '',
    codigo:  '',
    /* Registrar também os cliques nos botões principais (ligar, mapa,
       Instagram, abrir os horários de um setor, recursos de acessibilidade). */
    cliques: true
  }
};

