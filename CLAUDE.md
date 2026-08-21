# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, no-build, no-dependency website (`index.html` + `app.js` + `estilo.css`) that shows opening
hours, notices, staff and emergency contacts for a Brazilian public health clinic (UBS Paquetá, in
Brusque/SC). It is written as a **reusable template**: to stand up the site for a different clinic, copy
the whole folder and edit only `config.js`. The step-by-step replication checklist for a new UBS lives in
[`README.md`](README.md), not here.

## Commands

There is no build, package manager, linter, or test runner — it's plain HTML/CSS/JS loaded directly by
the browser. To preview locally, serve the folder with any static file server, e.g.:

```bash
python -m http.server 8000
```

then open `http://localhost:8000/?teste` (see "Manual time-travel testing" below).

## Architecture

### Three files, one direction of data flow

- **`config.js`** — the only file a non-developer is expected to edit. Holds clinic identity (name,
  address, phones, map link), the Google Sheet ID + tab names, and `*Reserva` fallback data
  (`setoresReserva`, `avisosReserva`, `equipeReserva`, `faltasReserva`) used whenever the sheet is
  unreachable or not yet configured.
- **`app.js`** — a single IIFE (`(function(){ ... })()`), no modules/bundler. On load it tries to fetch
  the Google Sheet as CSV (via the `gviz/tq?tqx=out:csv` endpoint, no API key needed since the sheet is
  shared as "anyone with the link"); on any failure it silently keeps using the `config.js` reserve data.
  It re-renders by generating HTML strings and assigning them to `innerHTML` on fixed container ids in
  `index.html` — there is no templating engine or virtual DOM.
- **`index.html`** — mostly empty containers (`id="status"`, `id="avisos"`, `id="setores"`,
  `id="equipe"`, etc.) that `app.js` fills in at runtime.

### The Google Sheet contract

The spreadsheet must have tabs `setores`, `mudancas-horario`, `recados`, `equipe`, `faltas` (names
configurable in `config.js`). Each is fetched and parsed independently in `buscarPlanilha()`:
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
  "closed" the same way it always does (no setor contributing an open time block).
- `recados` are general notices not tied to a setor. Unlike `mudancas-horario`, a blank `titulo` here
  *does* drop the row — there's no setor name to fall back on, so an untitled recado carries no
  recoverable signal of what it's about.
- `equipe`/`faltas` are optional and fail silently, keeping reserve data, since a clinic may not have
  set them up yet.
- `faltas` (staff absences) feeds `sintetizarFechamentosPorFalta()`, which auto-generates a "closed"
  notice for a setor **only** when exactly one staff member is linked to that `setor` — with 2+ people
  covering it, the app can't infer coverage and leaves it to a manual `mudancas-horario` entry instead.

Dates/times coming from the sheet are free-text and normalized by `normalizaData()` /
`normalizaHorario()` before anything else touches them. `normalizaData()` accepts `19/08/2026`,
`19-08-2026`, or `2026-08-19`. `normalizaHorario()` accepts `7h às 19h`, `07:00-19:00`, `7-19`, and
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
in a separate "Já sabemos que vai mudar" block that only appears when non-empty (`#avisos-futuros-bloco`,
toggled via its `hidden` attribute in `desenhar()`). Both lists render through the shared `cartaoAviso()`
card builder — the existing `av-quando` line ("Dia 28/08" / "De X até Y") already communicates a future
date correctly, so no separate "starts in N days" phrasing was needed.

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
