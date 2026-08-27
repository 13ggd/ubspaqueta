# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, no-build, no-dependency website (`index.html` + `app.js` + `estilo.css`) that shows opening
hours, notices, staff and emergency contacts for a Brazilian public health clinic (UBS Paquetá, in
Brusque/SC). It is written as a **reusable template**: to stand up the site for a different clinic, copy
the whole folder and edit only `config.js`. The step-by-step replication checklist for a new UBS lives in
[`README.md`](README.md), not here.

Around that core sit four things that exist because the site is also a **first-semester intervention
research project**, not just a website — and a website nobody finds, nobody maintains, and nobody
measured is not an intervention:

- `sw.js` — makes the site open without internet (see "Offline" below).
- `cartaz.html` + `qr.js` — printable A4 poster and hand-out slips with a QR code, the physical bridge
  that gets people to the URL at all.
- `CONFIG.medicao` — optional, cookieless access counting, so the project can say whether the site was
  *used*, not merely that it exists.
- `pesquisa/` + `guia-da-planilha.md` — the evaluation instruments (baseline/post questionnaires, SUS,
  reception tally, staff interview) and the one-page operational guide for whoever keeps the
  spreadsheet alive after the semester ends.

None of these four are needed to serve hours to a resident, and each can be deleted without touching
the others.

## Commands

There is no build, package manager, linter, or test runner — it's plain HTML/CSS/JS loaded directly by
the browser. To preview locally, serve the folder with any static file server, e.g.:

```bash
python -m http.server 8000
```

then open `http://localhost:8000/?teste` (see "Manual time-travel testing" below).

Opening `index.html` straight from the folder (`file://`) still works, but service workers only exist
on `http`/`https`, so the offline behaviour can only be exercised through a server —
`registrarServiceWorker()` bails out early on any other protocol rather than throwing.

There are no automated tests in the repo. `qr.js` and `sw.js` were each verified once with a throwaway
harness page (QR matrices round-tripped through a real decoder; `sw.js` executed against mocked
`caches`/`fetch` to assert which strategy each request class takes). If you change either, rebuild a
similar throwaway page rather than trusting a read-through — both are the kind of code that looks right
and is wrong.

The offline path in particular cannot be judged by reading it. Exercising it end-to-end means: a local
static server, a second local server standing in for the Google Sheet (point `urlCSV()` and the `sw.js`
hostname test at it), a **second** page load so the service worker actually controls the page, and only
then killing the sheet server. Playwright's `context.setOffline()` and `context.route()` do **not**
apply to requests the service worker itself makes, so an offline test built on those alone will show
you a page that looks fine while proving nothing about the cache.

## Architecture

### Three files, one direction of data flow

- **`config.js`** — the only file a non-developer is expected to edit. Holds clinic identity (name,
  address, phones, map link), the Google Sheet ID + tab names, `urgencia.lugares` (emergency
  alternatives), `telefonesUteis` (municipal numbers unrelated to the clinic itself — police, CAPS,
  Conselho Tutelar), and `*Reserva` fallback data (`setoresReserva`, `avisosReserva`, `equipeReserva`,
  `faltasReserva`, `areasEquipeReserva`, `notasRecorrentesReserva`) used whenever the sheet is
  unreachable or not yet configured. `telefonesUteis`, like `urgencia.lugares`, is hardcoded here rather
  than sheet-driven — both are near-static reference lists unrelated to day-to-day clinic operation, so
  a spreadsheet tab for them would add fetch/parse complexity without a real editing-frequency payoff.
  Rendered collapsed behind "Outros telefones úteis ▾" (`#tel-uteis-bloco`, only unhidden in
  `montarFixos()` if the list is non-empty) at the bottom of the "Onde fica e telefones" card,
  deliberately kept out of the way of the clinic's own info. `areasEquipeReserva` is different from
  those two — it's real operational data (which streets each saúde-da-família team covers) that changes
  with normal neighborhood/team-assignment churn, so unlike `telefonesUteis` it *is* sheet-driven (the
  `ruas` tab, see below); the config.js array is only the reserve fallback, same role as
  `equipeReserva`/`faltasReserva`. `notasRecorrentesReserva` (setores, weekday, month-occurrence
  indices, tail text) covers "every 2nd/4th Wednesday"-style facts — `proximasDatas()`/
  `diasDoMesPorOcorrencia()` in `app.js` compute the actual calendar dates for the currently-viewed
  month (rolling to next month once this month's dates have all passed, `dia >= data.getDate()`),
  appended to the setor's `para` text on every render. This was deliberately chosen over two more
  obvious designs: (1) a static sentence baked into `para` — works but forces the reader to do calendar
  math ("which Wednesday is the 2nd one?"); (2) a same-day-only banner (mirroring `mudancas-horario`'s
  `avisoDe()`) — worse, since it stays invisible to someone planning a visit until the affected day
  itself, the same failure mode `avisosFuturos()` exists to avoid. Computing real dates and always
  showing them keeps the info visible in advance *and* removes the mental math, with zero planilha
  upkeep going forward *per occurrence* — the RULE itself (which weekday, which occurrences, which
  setores, the text) is also sheet-driven (the `reunioes` tab, see below), same reserve-fallback role as
  `areasEquipeReserva`/`ruas`, so replicating the template for another UBS never requires editing this
  file's rule to match a different meeting schedule.
- **`app.js`** — a single IIFE (`(function(){ ... })()`), no modules/bundler. On load it tries to fetch
  the Google Sheet as CSV (via the `gviz/tq?tqx=out:csv` endpoint, no API key needed since the sheet is
  shared as "anyone with the link"); on any failure it silently keeps using the `config.js` reserve data.
  The `#fonte-dados` footer distinguishes all three provenances rather than blurring them: live sheet,
  service-worker cache (`GUARDADO_EM`, with the time it was saved), and `config.js` reserve — the last
  split further by `JA_LEU_A_PLANILHA`, since "the last hours we know of" is only true if the sheet was
  read at least once this session; otherwise the screen is showing template data that may never have
  matched this clinic.
  It re-renders by generating HTML strings and assigning them to `innerHTML` on fixed container ids in
  `index.html` — there is no templating engine or virtual DOM.
- **`index.html`** — mostly empty containers (`id="status"`, `id="avisos"`, `id="setores"`,
  `id="equipe"`, etc.) that `app.js` fills in at runtime.

### The Google Sheet contract

The spreadsheet must have tabs `setores`, `mudancas-horario`, `recados`, `equipe`, `faltas`, `ruas`,
`reunioes` (names configurable in `config.js`). Each is fetched and parsed independently in
`buscarPlanilha()`:
- `setores` is the only required tab — if it fails, `ORIGEM` is set to `'erro'` and the UI shows a
  "couldn't load" banner while still displaying the last known data. Its identifying column is itself
  called `setor` (e.g. `dentista`, `vacina`) — the same short code that `mudancas-horario`'s `setor`
  column and `equipe`'s `setor` column both reference, so one word/column name is used consistently
  across every tab that points at "which part of the clinic is this about" (internally this is
  normalized to a `.id` property on the objects in the `SETORES` array — a plain JS naming choice,
  unrelated to what the sheet column is called).
- `mudancas-horario` rows are per-setor overrides for specific date ranges: a filled `novo` column
  means "hours changed", an empty one means "closed all day" — there's deliberately no separate "type"
  column for this. `titulo` is technically optional here: if left blank but `setor` is filled, a title
  is auto-generated from the setor's name (`"<nome> não vai atender"` / `"<nome> com horário
  alterado"`) rather than silently dropping a row that clearly signals real intent to close/change
  something — see the `.forEach` right after `AVISOS = (h || []).concat(r || [])` in `buscarPlanilha()`.
  The literal value `todos` in the `setor` column is a reserved wildcard meaning "every setor" — used
  for whole-clinic closures without needing one row per setor. `avisoDe()` matches it against any
  queried setor id (`a.setor === id || a.setor === 'todos'`), so `situacao()`/`statusGeral()` need no
  special-casing: every setor naturally reports `cls:'alerta'` that day, and the top status card derives
  "closed" the same way it always does (no setor contributing an open time block). None of the
  auto-generated títulos (including `todos`'s) bake in words like "hoje" — a título is generated once at
  fetch time and reused for however many days the notice stays relevant, including before it starts (see
  `avisosFuturos()` below), so a hardcoded "hoje" would read as false on any day that isn't literally
  today. The actual date is left to the (now bold) "Quando:" line in `cartaoAviso()` instead.
- `recados` are general notices not tied to a setor. Unlike `mudancas-horario`, a blank `titulo` here
  *does* drop the row — there's no setor name to fall back on, so an untitled recado carries no
  recoverable signal of what it's about.
- `equipe`/`faltas`/`ruas`/`reunioes` are optional and fail silently, keeping reserve data, since a
  clinic may not have set them up yet.
- `faltas` (staff absences) feeds `sintetizarFechamentosPorFalta()`, which auto-generates a "closed"
  notice for a setor **only** when exactly one staff member is linked to that `setor` — with 2+ people
  covering it, the app can't infer coverage and leaves it to a manual `mudancas-horario` entry instead.
- `equipe` also carries an optional `horario` column — the team's shift (e.g. "7h às 13h"), not a
  per-person fact. It only needs to be filled on one row per `equipe` group (by convention, the médica's
  row); `desenhar()` derives each group's badge/detail-panel horário by taking the first non-empty
  `horario` found among that group's people (`g.pessoas.filter(...)[0]`), so every other person in the
  same team inherits it without repeating the value on every row.
- `ruas` is a flat `equipe, rua` table (one row per street) — grouped client-side in `buscarPlanilha()`
  into the same `{equipe, ruas:[...]}` shape as the `areasEquipeReserva` fallback, and stored in the
  `RUAS` global. Rendered as a collapsed "Ruas atendidas ▾" under each team in `desenhar()`. The `equipe`
  value in each row must match the `equipe` field used in the `equipe` tab/`equipeReserva` — a mismatch
  means the streets just don't show up for any team, no error.
- `reunioes` holds the recurring-meeting rules described above for `notasRecorrentesReserva` — columns
  `setores` (comma-separated codes), `dia` (`seg`/`ter`/.../`dom`), `ocorrencias` (comma-separated
  1-indexed week numbers, e.g. `2,4`) and `texto`. Rows failing basic shape validation (unknown weekday,
  no setores, no occurrences, no texto) are dropped silently rather than crashing `proximasDatas()` on
  bad input. Stored in the `REUNIOES` global, read by `notasRecorrentesDoSetor()`.

Dates/times coming from the sheet are free-text and normalized by `normalizaData()` /
`normalizaHorario()` before anything else touches them. `normalizaData()` accepts `19/08/2026`,
`19-08-2026`, or `2026-08-19`, and checks the result against the calendar (`dataExiste()`) instead of
just reshaping the digits — `32/13/2026` used to become the ISO-shaped string `2026-13-32`, which
matches no real day and sorts after every real one, so the notice sat in "Avisos futuros" forever
without ever firing (a day/month swap landing in the past disappeared with no trace at all). A field
left blank and a field filled with garbage both yield `null`, but they mean different things, so
`dataIlegivel()` separates them at the parse sites: blank keeps the documented "no date = active while
checked" behaviour, while an unparseable date drops the row (with a `console.error`), on the grounds
that treating a typo as "no date" would close the setor every single day rather than just the one the
staffer meant. `normalizaHorario()` accepts `7h às 19h`, `07:00-19:00`, `7-19`, and
multi-block hours for lunch breaks separated by comma *or* space (`7h às 12h, 13h às 19h` and
`7-12 13-19` both work) — it deliberately rejects a single-digit minute (`18:3`) instead of guessing
`18:03`: for free-text input from non-technical staff, failing a block back to "não atende" is safer
than silently displaying a plausible-but-wrong time as if it were correct.

### Open/closed logic

`situacao()` computes a single setor's state for a given day/time from: its weekly schedule in
`config.js`/sheet, any active `mudancas-horario` override, and any synthesized absence closure.
`statusGeral()` aggregates all setores to decide the clinic-wide "open"/"closed" banner (open if *any*
setor is open; closes at the latest closing time among setores). Holidays are computed at runtime,
not hardcoded per year — `calcularPascoa()` implements the Gauss/Meeus algorithm to derive Easter, from
which movable holidays (Carnaval, Sexta-feira Santa, Corpus Christi) are offset; fixed holidays live in
`config.js`.

`avisosDoDia()` only surfaces notices whose `inicio`–`fim` window covers *today* — a notice scheduled to
start next week is invisible until that day arrives. `avisosFuturos()` complements this by listing
active (`ativo !== false`) notices whose `inicio` is still in the future, sorted soonest-first, rendered
in a separate "Avisos futuros" block that only appears when non-empty (`#avisos-futuros-bloco`, toggled
via its `hidden` attribute in `desenhar()`). Both lists render through the shared `cartaoAviso(a, futuro)`
card builder — the `futuro` boolean only changes the tarja's verb tense ("Mudou o horário" / "✕ Fechado"
vs "Vai mudar o horário" / "✕ Vai fechar"), since a not-yet-active notice claiming something already
happened is misleading; the actual date is left to the (bold) `av-quando` line, which already reads
correctly either way ("Dia 28/08" / "De X até Y"). Always pass `futuro` explicitly at both call sites
(`ativos.map(function(a){ return cartaoAviso(a, false); })` etc.) — `array.map(cartaoAviso)` directly
would leak the array index into `futuro` as a truthy number for every item past the first.

### Manual time-travel testing

Appending `?teste` to the URL reveals a hidden bar (`.teste`, normally `hidden`) with a date picker and
hour slider that call `desenhar(data, agora)` directly, bypassing the real clock. This is the intended
way to check "what does the page look like at 3pm next Saturday" without waiting or editing code —
prefer it over adding temporary date-mocking code when testing schedule/holiday logic.

### Accessibility panel (`a11y-*` ids) and nav panel (`nav-*` ids)

Both are floating buttons opening a dialog-like panel, built through the shared `criarPainel()` helper
in `iniciar()` — opening one closes the other. Font-scale and high-contrast preferences persist via
`localStorage` (`guardar`/`lerGuardado`, wrapped in try/catch since Safari private mode can throw).
Text-to-speech uses the browser's `SpeechSynthesisUtterance` API directly (no external service).
Language switching just opens Google Translate in a new tab (`linkTraducao()`) rather than embedding a
translate widget. VLibras (Brazilian Sign Language) is a third-party government script loaded at the
bottom of `index.html`; the comment above it notes it can be deleted wholesale if not wanted.

### Offline (`sw.js`) and the stale-data problem

`registrarServiceWorker()` (in `app.js`) registers `sw.js`, which caches the app shell so the page opens
with no connection. The reason is not polish: a lot of the clinic's public is on prepaid data that runs
out near the end of the month, and signal in the neighbourhood is uneven — exactly the people most
likely to want to check before walking there.

The strategies are deliberately *not* uniform, and the split is the whole design:

- **Site's own files** (`./`, `index.html`, `estilo.css`, `app.js`, `config.js`) and **Google Fonts** —
  cache-first, revalidating in the background. Opens instantly; a code change reaches a returning
  visitor on their *next* load, which is why `VERSAO` at the top of `sw.js` must be bumped when
  shipping (that string is what evicts every old cache in `activate`).
- **The Google Sheet CSV** — network-first, cache only as a fallback. Serving yesterday's hours from
  cache while the network was available would be the worst possible failure for this site. The cache
  key is the request URL **minus the `t=Date.now()` cache-buster** (`chaveDaPlanilha()`): keying by
  the full URL stored one entry per fetch forever and — worse — meant the offline lookup never found
  the copy saved earlier, so the fallback silently reached `config.js`'s reserve data instead of the
  last known sheet. Do not swap this for `{ignoreSearch:true}`: the tabs differ only by the `sheet=`
  query param, so ignoring the whole query string would serve `setores` for a `recados` request.
  A cached CSV is served with an `X-UBS-Guardado` header (`carimbar()`) holding the ISO time it was
  stored; `buscarPlanilha()` reads it into `GUARDADO_EM` so the `#fonte-dados` line can say "guardados
  no aparelho ontem às 16h" instead of "carregados agora", which would be a lie of exactly the kind
  this whole file exists to prevent.
- **Everything else** (VLibras, the measurement script) — not intercepted at all.

`cachePrimeiro()` deliberately **rejects** when there is neither a cached copy nor a network, instead of
resolving with `undefined`. Resolving with undefined makes `respondWith` fail as a network error but
silently, which would swallow the navigation fallback; rejecting is what lets the `navigate` branch fall
through to the cached page. Same reasoning on the data side: a rejected CSV fetch is what makes
`buscarPlanilha()` drop to `config.js`'s reserve data, which is the behaviour that already existed.

Navigations do not go through `cachePrimeiro()` — they use `paginaPrincipal()`, which reads and writes
one fixed key (`./index.html`) regardless of query string. `?teste` and `?de=cartaz` (the address the
printed QR points at) are the same page; keying by full URL would both miss the cache offline and
accumulate a copy per query string. An earlier version passed `{ignoreSearch: true}` to `cache.match`,
which fixed the read but not the write.

Because the page can now show data captured at an unknown earlier time, `atualizarAvisoDeInternet()`
renders `#sem-internet` — an amber band above the status card saying the information may be old, with
the clinic's phone number as a `tel:` link (which works with no data connection). It uses the "atenção"
palette rather than "alerta": being offline is a caveat about the age of what's on screen, not an
emergency. On the `online` event the sheet is refetched immediately instead of waiting for the polling
interval, since that is precisely the moment someone is staring at the screen deciding whether to trust
it.

### Printed material: `cartaz.html` + `qr.js`

`cartaz.html` is not part of the site a resident sees; it is a generator for the paper that sends them
there. Two formats behind a radio button: an A4 wall poster and a sheet of 8 hand-out slips. It reads
`config.js` for identity and `setoresReserva` for the hours table, so it never drifts from the site.

The poster **repeats the opening hours in print on purpose**. The QR is a shortcut, not the only door —
someone without a smartphone has to get the information from the same sheet of paper.

`qr.js` is a from-scratch QR encoder (byte mode, versions 1–10, all four EC levels, ~440 lines) rather
than a CDN library or an image API such as `api.qrserver.com`. Two reasons: the poster has to be
printable when the clinic's wifi is down, and the whole project's constraint is no build step and no
external dependency. It was verified by decoding its own output with a real decoder across every
version/level combination — a QR that *looks* like a QR but does not scan is the obvious failure mode.
Text past a version-10 capacity throws, and `cartaz.html` catches that and asks for a shorter URL.

`CONFIG.unidade.site` holds the published address. Left empty, the poster derives the URL from
`location`, which silently yields a `localhost` QR if someone opens the poster before deploying —
hence the checkbox and the visible URL text under the code, so a wrong address is caught by eye before
it is printed 40 times.

`resumoSemana()` groups weekdays by identical hours rather than by consecutive runs: the dentist works
Monday, Wednesday and Friday, and a consecutive-run grouping would print the same time three times and
eat a line of a poster meant to be read from across a waiting room.

### Access measurement (`CONFIG.medicao`)

Off by default (`tipo: ''`), in which case every function in the block — including `registrarEvento()`,
which is called from several places — is a no-op. Two backends are supported: `goatcounter` (works on
any host) and `vercel` (Vercel-hosted only; page views are free but click events need a paid plan,
which is why `cliques` can be turned off independently).

Neither uses cookies nor stores anything identifying, which is both why the site needs no cookie banner
and the answer to give an ethics committee. Events are queued in `MEDICAO_FILA` until the third-party
script fires `load`, otherwise the first click of each visit — the most interesting one — would be lost.
Click tracking is a single delegated listener on `document`: the page is rebuilt via `innerHTML` every
minute, so per-element listeners would die on the next redraw.

`registrarOrigemDoAcesso()` reads `?de=` and records it as its own event, sanitised to `[a-z0-9-]` and
24 chars. The poster appends `?de=cartaz` and the hand-out slips `?de=bilhete` — deliberately different,
since a sheet taped to a wall and a slip handed over at reception are different distribution channels and
collapsing them would erase the only thing this measurement could tell you.

`MEDICAO` is additionally forced to `null` when the URL contains `teste`, so the group's own
time-travel testing does not inflate the very number the project is trying to measure.

### The research side (`pesquisa/`, `guia-da-planilha.md`)

`pesquisa/` holds the evaluation instruments — plan, baseline questionnaire, post questionnaire with the
SUS usability scale, reception tally sheet, staff interview script. They are Markdown meant to be pasted
into a document and **printed**, not read in a terminal. Two constraints run through all of them and are
worth preserving on any edit: instructions to whoever administers the questionnaire are kept visually
separate from text read aloud to a resident, and nothing is pre-filled with invented numbers,
institutions, or ethics approvals — those are bracketed placeholders.

The baseline and post questionnaires share a block of behaviour questions that **must stay identical in
wording**; if someone improves the phrasing in one, the before/after comparison stops meaning anything.

`guia-da-planilha.md` is the one-page card for whoever edits the spreadsheet at the clinic. It is the
highest-leverage document here and the one most likely to rot: it names actual tab and column names, so
any change to the Google Sheet contract above has to be mirrored there. A site showing confidently wrong
hours is worse than no site, and that failure mode is a staffing problem, not a code problem.
