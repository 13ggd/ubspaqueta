# Site da UBS Paquetá — Brusque/SC

Site informativo com horários, avisos e telefones da Unidade Básica de Saúde
do bairro Paquetá. Feito para ser lido no celular, por pessoas de todas as
idades, inclusive quem tem dificuldade com tecnologia.

Site estático: sem servidor, sem banco de dados, sem custo de hospedagem.
Os horários e avisos vêm de uma planilha do Google Sheets.

---

## Como está organizado

```
ubs-paqueta/
├── index.html          estrutura da página
├── css/estilo.css      aparência (escrito mobile-first)
├── js/config.js        ← O ÚNICO ARQUIVO QUE VOCÊ PRECISA EDITAR
├── js/app.js           lógica (não precisa mexer)
├── manifest.json       permite "adicionar à tela de início" no celular
├── vercel.json         configuração da hospedagem
└── planilha/           modelos CSV para importar no Google Sheets
    ├── servicos.csv
    └── avisos.csv
```

**Regra de ouro:** para mudar qualquer coisa do dia a dia, use a **planilha**.
Para mudar endereço, telefone ou nome da unidade, edite **`js/config.js`**.
Ninguém precisa abrir `app.js`.

---

## Etapa 1 — Subir para o GitHub

Não precisa de terminal nem saber Git.

1. Crie uma conta em `github.com` (gratuita).
2. Clique no **+** no canto superior direito → **New repository**.
3. Nome: `ubs-paqueta`. Deixe **Public**. Clique em **Create repository**.
4. Na tela seguinte, clique em **uploading an existing file**.
5. Arraste a pasta `ubs-paqueta` inteira para a área de upload.
6. Clique em **Commit changes**.

Pronto. Seu código está versionado — todo histórico de mudanças fica salvo,
e dá para desfazer qualquer alteração.

---

## Etapa 2 — Publicar no Vercel

1. Acesse `vercel.com` e clique em **Sign up** → **Continue with GitHub**.
2. Depois de entrar, clique em **Add New** → **Project**.
3. Encontre o repositório `ubs-paqueta` na lista e clique em **Import**.
4. Não mexa em nenhuma configuração. Clique em **Deploy**.

Em cerca de 30 segundos o site está no ar, num endereço tipo
`ubs-paqueta.vercel.app`.

**A partir daqui, qualquer alteração que você fizer no GitHub vai para o ar
sozinha, em segundos.** Não precisa republicar nada.

### Como alterar o site depois

1. Abra o arquivo no GitHub (ex: `js/config.js`).
2. Clique no ícone de lápis (**Edit this file**).
3. Faça a mudança.
4. Clique em **Commit changes**.
5. Espere uns 30 segundos e recarregue o site.

---

## Etapa 3 — Criar a planilha

1. Em `sheets.google.com`, crie uma planilha nova chamada **Dados UBS Paquetá**.
2. Crie **duas abas** com estes nomes exatos, em minúsculas, sem acento:
   - `servicos`
   - `avisos`
3. Importe os modelos que estão na pasta `planilha/`:
   **Arquivo → Importar → Fazer upload** → escolha o CSV →
   em "Local de importação" escolha **Substituir planilha atual** e a aba certa.
4. Clique em **Compartilhar** → em "Acesso geral" mude para
   **Qualquer pessoa com o link** → papel **Leitor**.

   *Este passo é obrigatório. Sem ele o site não consegue ler a planilha.*

5. Copie o **ID da planilha** do endereço do navegador:

   ```
   https://docs.google.com/spreadsheets/d/1AbC2DeF3GhI4JkL5MnO/edit#gid=0
                                           └────── este pedaço ──────┘
   ```

6. No GitHub, edite `js/config.js` e substitua:

   ```js
   planilhaId: 'COLE_O_ID_DA_PLANILHA_AQUI',
   ```

   por:

   ```js
   planilhaId: '1AbC2DeF3GhI4JkL5MnO',
   ```

   Commit. Em 30 segundos o site já está lendo a planilha.

---

## Como a equipe usa no dia a dia

Tudo é feito na planilha. Nada de código.

### Mudou um horário fixo
Aba `servicos` → ache a linha do serviço → mude a célula do dia.

Pode escrever de vários jeitos, o site entende todos:
`07:00-19:00` · `7h às 19h` · `7-19`
Para fechado, deixe a célula vazia ou escreva `Fechado`.

### Fechou alguma coisa hoje
Aba `avisos` → crie uma linha nova:

| coluna | o que colocar |
|---|---|
| `tipo` | `fechado` |
| `servico` | o `id` do serviço (ex: `dentista`) — igual ao da aba servicos |
| `titulo` | frase curta: "O dentista não vai atender" |
| `texto` | explicação e o que a pessoa deve fazer no lugar |
| `inicio` | `19/08/2026` |
| `fim` | `19/08/2026` (mesma data, se for só hoje) |
| `novo` | deixe vazio |
| `atualizado` | `19/08 às 7h15` |

### Só mudou o horário de um serviço
Igual acima, mas `tipo` = `atencao` e preencha `novo` com o horário novo.

### Recado geral, sem fechar nada
`tipo` = `recado` e deixe a coluna `servico` vazia.

### Acabou o problema
Apague a linha, ou mude o `fim` para uma data que já passou.

O site relê a planilha a cada 5 minutos, e também toda vez que alguém abre
ou volta para a página.

---

## Testar outros dias e horários

Adicione `?teste` no fim do endereço:

```
ubs-paqueta.vercel.app/?teste
```

Aparece uma barra embaixo onde você escolhe data e hora, para conferir como a
página fica no sábado, de madrugada, num feriado etc. No endereço normal essa
barra não aparece.

---

## Usar o domínio da prefeitura

1. No Vercel: projeto → **Settings** → **Domains**.
2. Digite o subdomínio, por exemplo `ubspaqueta.brusque.sc.gov.br`.
3. O Vercel mostra um registro **CNAME**.
4. Entregue esse registro para quem administra o DNS da prefeitura.

Configuração de uma vez só. Depois o site fica sob o domínio oficial, de graça.

---

## Fazer o site de outra UBS

Copie a pasta inteira, edite **só** o `js/config.js` (nome, endereço, telefone,
mapa e ID de uma nova planilha) e publique. O resto funciona igual.

---

## Se a planilha sair do ar

O site não quebra e não fica vazio. Ele mostra os dados de reserva que estão
em `js/config.js` e avisa a pessoa para ligar no posto em caso de dúvida.
Por isso vale manter esses dados de reserva razoavelmente atualizados.

---

## ⚠ Antes de divulgar para a população

Confirme os horários por setor com a coordenação da unidade.

Só o horário geral (segunda a sexta, das 7h às 19h) foi confirmado no site
oficial da Secretaria de Saúde de Brusque. Os horários de **sala de vacina,
coleta de exames, dentista e saúde da mulher** que estão nos modelos são
estimativas e precisam ser corrigidos.

Também há uma divergência de cadastro a resolver: o site da Secretaria informa
**Rua Waldemar Hoffmann, s/n** e telefone **(47) 2017-0548**; o Portal da
Cidade Brusque lista a mesma unidade na **Rua Padre Antônio Eising, s/n**
(Azambuja) com telefone **(47) 3351-7243**. Vale checar qual está correto.

---

## Fontes dos dados

- Secretaria de Saúde de Brusque — ficha da UBS Paquetá
  (endereço, telefone e localização)
- Portal da Cidade Brusque e OCP News — ampliação do horário das UBSs para 7h às 19h
- O Município — Pronto Atendimento 24h do bairro Santa Terezinha
- Rádio Diplomata FM — Dia D da multivacinação de agosto de 2026

---

## Acessibilidade

- Fonte Atkinson Hyperlegible, criada pelo Braille Institute para baixa visão
- Botões A A A para aumentar a letra de toda a página
- Estado sempre indicado por **símbolo + cor + palavra** (funciona para
  daltônicos e em impressão preto e branco)
- Área de toque mínima de 56 pixels
- Contraste alto em todos os textos
- Linguagem simples, sem jargão administrativo
- Funciona impresso: dá para imprimir e colar na porta da unidade
