# Guia — publicar o site no domínio da Secretaria de Saúde

Objetivo: quando alguém clicar em **UBS Paquetá** no site da Secretaria
(`smsbrusque.sc.gov.br/unidade`), abrir este site, **continuando no domínio da
Secretaria** — o endereço na barra fica `paqueta.smsbrusque.sc.gov.br`, com
cadeado (HTTPS), e o conteúdo é este site.

Como isso é feito: um **subdomínio** (`paqueta.smsbrusque.sc.gov.br`) apontado,
via um único registro de DNS (CNAME), para a Vercel, onde o site está hospedado.
Não é redirecionamento para outro endereço, não é `<iframe>`, não é cópia do
código para o servidor da Secretaria.

São duas partes:

- **Parte A** — o que a equipe do projeto faz (na Vercel e no código).
- **Parte B** — o que o setor de TI da Secretaria faz (um registro de DNS).
  Essa parte está escrita para ser recortada e enviada ao TI.

---

## Parte A — Equipe do projeto

### A1. Ter o site publicado na Vercel

Se já está publicado (ex: `ubspaqueta.vercel.app` abre), pule para A2.

1. Conta em [vercel.com](https://vercel.com) — entre com o GitHub.
2. **Add New → Project** e importe o repositório `13ggd/ubspaqueta`.
3. Em *Framework Preset* escolha **Other**. Não preencha *Build Command* nem
   *Output Directory* — é site estático, não tem build.
4. **Deploy**. Ao terminar, confira que `https://<algum-nome>.vercel.app` abre
   e mostra o site.

### A2. Adicionar o subdomínio da Secretaria na Vercel

1. No projeto: **Settings → Domains**.
2. No campo, escreva `paqueta.smsbrusque.sc.gov.br` e clique **Add**.
3. A Vercel vai mostrar um aviso de *"Invalid Configuration"* e, junto, **o
   registro DNS que precisa ser criado** — algo como:

   > Type: `CNAME`  ·  Name: `paqueta`  ·  Value: `cname.vercel-dns.com`

   O `Value` às vezes vem com um nome mais específico (ex:
   `xxxxxxxx.vercel-dns-017.com`). **Copie exatamente o que o painel mostrar** —
   é isso que vai no e-mail para o TI (Parte B).

### A3. Enviar a Parte B para o setor de TI da Secretaria

Copie a Parte B deste guia num e-mail ou chamado, **substituindo o valor do
CNAME** pelo que a Vercel mostrou no passo A2.

### A4. Esperar ficar verde

Depois que o TI criar o registro (pode levar de alguns minutos a algumas horas):

- Na Vercel, **Settings → Domains**, o domínio passa a **"Valid Configuration"**.
- A Vercel emite sozinha o certificado HTTPS (Let's Encrypt) — sem ninguém pedir.
- Teste: abra `https://paqueta.smsbrusque.sc.gov.br`
  - o cadeado aparece e não dá aviso de segurança;
  - `https://paqueta.smsbrusque.sc.gov.br/?teste` abre a barra de teste;
  - desligue a internet e recarregue — o site ainda abre (modo offline).

### A5. Ajustar o código para o endereço definitivo

Com o `paqueta.smsbrusque.sc.gov.br` funcionando, edite no repositório:

| Arquivo | O que mudar |
|---|---|
| `config.js` | Em `unidade.site`, escreva `'https://paqueta.smsbrusque.sc.gov.br'`. É de onde sai o QR code do cartaz impresso. |
| `index.html` | No bloco *Open Graph* (topo do arquivo), troque `https://ubspaqueta.vercel.app` por `https://paqueta.smsbrusque.sc.gov.br` nas linhas `og:url`, `og:image` e `twitter:image`. É o que aparece quando colam o link no WhatsApp. |
| `sw.js` | Troque o número em `VERSAO` (ex: `ubs-v3` → `ubs-v4`). É o que faz o navegador de quem já visitou baixar a versão nova. |

Depois: `git commit` + `git push`. A Vercel republica sozinha.

### A6. Fechar o ciclo

- **Reimprima o cartaz** (`cartaz.html`) — o QR agora aponta para o endereço
  definitivo. Jogue fora os cartazes antigos com o endereço `.vercel.app`.
- **Peça ao pessoal da Secretaria** que, no link do site deles para esta
  unidade, deixe o endereço assim:
  `https://paqueta.smsbrusque.sc.gov.br/?de=sms`
  O `?de=sms` faz a medição de acessos contar quantas pessoas chegaram por ali,
  separado de quem chegou pelo cartaz (`?de=cartaz`) ou pelo bilhete (`?de=bilhete`).

### A7. Continuidade (quando o semestre acabar)

O site fica no ar de graça na Vercel enquanto a conta existir e o repositório
no GitHub existir. Se o projeto for entregue para a Secretaria manter, o TI pode:

- criar uma conta própria na Vercel e importar o mesmo repositório
  (`13ggd/ubspaqueta`), ou um *fork* dele; e
- refazer o passo A2 nessa conta nova.

O registro de DNS da Parte B continua valendo — só troca para qual conta da
Vercel ele aponta, se o `Value` do CNAME mudar.

---

## Parte B — Setor de TI da Secretaria de Saúde

*(Esta parte pode ser recortada e enviada ao TI.)*

### O que é

O site de horários e avisos da **UBS Paquetá** é uma página estática (só
HTML/CSS/JavaScript), hospedada na **Vercel**, mantida pela equipe do projeto.
O código-fonte é público: `https://github.com/13ggd/ubspaqueta`

Queremos que ele seja servido no endereço
**`paqueta.smsbrusque.sc.gov.br`**, dentro do domínio da Secretaria.

### O que precisamos de vocês: **um registro de DNS**

Na zona DNS de `smsbrusque.sc.gov.br`, criar:

| Campo | Valor |
|---|---|
| **Tipo** | `CNAME` |
| **Nome / Host** | `paqueta` *(alguns painéis pedem o nome completo: `paqueta.smsbrusque.sc.gov.br`)* |
| **Aponta para / Destino / Target** | `cname.vercel-dns.com` *(← confirmar com a equipe do projeto: a Vercel pode fornecer um valor um pouco diferente para este projeto)* |
| **TTL** | padrão / automático (3600) |
| **Proxy** | se o DNS estiver na Cloudflare: **desligado** ("DNS only", nuvem cinza) — pelo menos até o certificado HTTPS ser emitido |

Só isso. Depois de criado, avisem a equipe do projeto — a emissão do
certificado HTTPS é automática (Let's Encrypt, feita pela Vercel) e leva de
minutos a poucas horas.

### O que **não** é necessário

- **Não** precisa registro `A` nem `AAAA` — é subdomínio, CNAME resolve.
- **Não** precisa configurar proxy reverso, `rewrite` ou `redirect` no servidor
  de vocês.
- **Não** precisa emitir nem instalar certificado do lado de vocês.
- **Não** encosta no site principal `smsbrusque.sc.gov.br` — é um subdomínio
  novo e isolado.

### Como verificar do lado de vocês

```
nslookup -type=CNAME paqueta.smsbrusque.sc.gov.br
```

Deve retornar o destino `...vercel-dns...`. Propagação costuma ser rápida
(minutos), mas pode levar algumas horas.

### Como desfazer

Basta **apagar o registro CNAME**. O subdomínio para de resolver e nada mais é
afetado — o domínio principal e os outros subdomínios continuam iguais.

### Privacidade / conformidade

O site não usa cookies e não coleta nenhum dado pessoal (sem nome, telefone,
IP salvo ou rastreamento entre sites) — por isso não tem aviso de cookies. A
contagem de acessos, quando ligada, é anônima e agregada. Código aberto para
auditoria no GitHub acima.

---

## Resumo em uma linha

**Vocês (projeto):** publicam na Vercel e adicionam o domínio
`paqueta.smsbrusque.sc.gov.br` no painel.
**TI da Secretaria:** cria **um** registro `CNAME` `paqueta` → `cname.vercel-dns.com`.
**Resultado:** o site abre em `paqueta.smsbrusque.sc.gov.br`, com HTTPS, no
domínio da Secretaria.
