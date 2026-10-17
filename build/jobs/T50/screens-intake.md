# screens-intake (T50)

**Status** · session_01B1kqymq5KT8JWusgDebuhd · depth 2 · COMPLETE · handled B2

## Completion (SCREENS-INTAKE #7)

**Entries applied** (T50-30, requirements R29–R37; each named by tests in `bio-plane/test/m/screens-intake/`):
- **R29** "For which question" on the address tab only, opened from a question: `cs.choice` over the questions the member may see (`search` `type:inquiry`, as find-in reads them), preset to the routed one (kept chosen though the list omits it); sent as `acquire`'s `for`; no `capturerequest`; `BAD_FOR` drawn by `refusal.BAD_FOR` in an open fold titled `capture.forquestion.refused.summary`. The file tab draws none and sends no `for`.
- **R30** `already_held` rows draw `screen.archive.alreadyheld` with the earlier capture's name (`held_name`, else the entry's name) and `held_at`; with either missing, the row's name and state only.
- **R31** Add's "Unfinished": `opencaptures` and `heldcaptures` read on the address tab; each open capture draws `capture.unfinished` (title from the held row holding `primary_sha`, else the address) and "Finish it" (`capture.finish`) sending `acquire` with `continue`; none, no section; a failed read drawn failed; a continuation files nothing new and the reads are made again.
- **R32** the inbox: a discard asks `inbox.discard.why` in its own field and sends it as `reason` (none: `refusal.RESOLVE_NO_REASON`, nothing sent); a pull answering `existed` with a `holder` key draws `screen.inbox.alreadyheld` (the holder a reference to the document by its title) or `.other` when the holder is null; no `SRC-`/`KNOCK-` id in a heading or sentence (a knock is named by what was handed in and when, source choices by the day), the ids only in a folded `reference.label` line.
- **R33** `titleOf`: `reading.title`, else what the document states, else `document.untitled.web` for a host-only address, else the last segment; an upload by its file's name, or `reading.title` for a page.
- **R34** the upload keeps the name (and type) as the act is sent (`sent` in page memory) and `doneUpload` uses it, not the input read afterwards (the harness's redraw empties the input, so the old code did lose it: the test fails on the old code); an unanswered or non-JSON `acquire` is drawn beside the act and the act is usable again (the shell draws it, see below).
- **R35** the cite link opens `find-in` by the capture's fingerprint (`doc.capture.sha256`); a held upload reads `document.uploaded.by` then `size.kb|mb|small`, never `upload:<hex>`.
- **R36** `open-file` for a file the viewer added (her member id among `captureaccounts`' actors and `source_not_fetched` among the reasons): `screen.open-file.high.yours`, `.next.head`, `.next.yours`, `.check.notyet`; no raw `NOT_SCANNED` sentence, no scanner counts; the plain-text safe view (`kind: "text"`) drawn line by line in `.mk-passage` with `.safetext` / `.safetext.cut`; a refusal of "Read the safe view" is `refusal.NO_SAFE_VIEW`, its own words, or `shell.unread`. Add opened from a question says `screen.capture.forq` first (the question in quotation marks); the how-choices sit in their own `.cs-field` block.
- **R37** a held row carrying `archive` draws `screen.held.archive` (each part above zero) and a door `screen.held.archivefiles`, a reference of kind `archive` for the archive's digest; a row with no `archive.entries`, or with `files` null, draws no door / no count.

**Words**: every key is read through `word(key, vars)`; `SCREEN_KEYS` gains the keys above and drops `screen.inbox.source`, `.link.choice`, `.link.samechoice` and `.refusal.RESOLVE_NO_REASON` (no longer drawn). A state the design draws in a fold is a `<details class="mk-details" open>` with its `.summary` key (BAD_FOR) or folded (the reference line).

**Deferred / waiting, and why**
1. R37's link test (`R37 the door opens archive …`) is red until `interface-shell` R81 (T50-27) merges: `REF_SCREENS` has no `archive` kind yet, so the door is drawn as a card without a link. Everything else of R37 is green. Merge `tranche/T50` after the shell and it passes with no change of mine.
2. R34's "one timed live `acquire` at START" is the remote proof (plan rule 9; BOB's note 4): not run from this session's tools, stays unbuilt, accepted red by name. Whatever it finds in the door is control-plane's (REPORT then).
3. R35's `{member}` and size for a held upload: see Found below.

**Found in other modules** (also in the REPORT):
- `capture` R77: a held row answers `capture: {sha256, grade}` only, so neither the uploader nor the byte count of an upload is on the row. The screen draws them from `capture.actor` / `capture.bytes` (or `uploaded_by` / `bytes`) when the row answers them and draws neither otherwise (never the raw `upload:<hex>`). Closed layer: T51, or BOB names another source.
- `interface-shell`: for a silent or non-JSON act answer the shell draws `shell.noanswer` ("did not answer") beside the act, not `shell.unread` as R34 words it; the act stays usable. R34's control is met in effect; the key is the shell's.
- `interface-shell` R81 must carry `archive` (see Deferred 1).
- Not mine, unchanged by this job: `plane/t47.test.mjs` 1 fail and `answer-envelope/catalogue-end.test.mjs` 2 fails, the same before and after my changes.

**Tests and checks run**
- `node --test bio-plane/test/m/screens-intake/*.test.mjs`: tests 112, pass 111, fail 1 (the R37 link test, Deferred 1).
- Users of `SCREENS` (`control-plane` t46-e2e, r100-upload, t46-app: 13 pass, 0 fail; `plane` t47 and `answer-envelope` catalogue-end: failures as before my changes).
- From the process repository: `format`: 171 modules, 170 requirements files; 0 failures. `architecture screens-intake`: 14 product files, 37 relative imports; 0 failures. `coverage screens-intake`: 37 of 37 live requirement ids named by a test; 0 failures.

Size (session_01B1kqymq5KT8JWusgDebuhd): test runs 16, module lines 1301

## J1 · REPORT

FOUND IN OTHER MODULES (details in my record, build/jobs/T50/screens-intake.md):
1. capture R77 (closed layer, T51 or name another source): a held row answers capture {sha256, grade} only, so neither an upload's uploader nor its byte count is on the row. R35 draws "uploaded by <member>, <date>" and the size from capture.actor / capture.bytes when the row answers them, and draws neither otherwise (never upload:<hex>). Needs an answer or a ruling on where the uploader and size come from.
2. interface-shell: R81 must carry the kind "archive" for R37's door to link; until it merges, one test of mine (R37's link) is red and passes with no change of mine once tranche/T50 holds R81.
3. interface-shell: a silent or non-JSON act answer is drawn "shell.noanswer" beside the act, not shell.unread as R34 words it; the act stays usable. I left it as the shell draws it.
4. R34's one timed live acquire is the remote proof (plan rule 9, your note 4): not run from my tools, left unbuilt. A cause found in the door is control-plane's REPORT after biosmoke8 runs it.
5. Not mine, unchanged by this job: plane t47.test.mjs 1 fail and answer-envelope catalogue-end.test.mjs 2 fails (same before and after).

## J2 · COMPLETE

T50-30 applied: R29–R37 met. Module tests 112, pass 111, fail 1 (R37's link test, red until interface-shell R81's archive kind merges; no change of mine needed). format, architecture, coverage (37 of 37 ids), ownership: 0 failures. Pushed to job/T50/screens-intake. Open points are in the REPORT (held rows lack the uploader and size; shell.noanswer vs shell.unread; R34's live acquire left to the remote proof). Record: build/jobs/T50/screens-intake.md.

## After B2 (CHANGE)

`tranche/T50` merged (interface-shell and instance-setup in). Module tests against the real shell: tests 112, pass 112, fail 0; the R37 link test now passes (Deferred 1 cleared). format, architecture, coverage (37 of 37), ownership: 0 failures.

## J3 · COMPLETE

B2 applied: tranche/T50 merged; module tests 112 pass, 0 fail against the real shell (R37's link test now green). format, architecture, coverage, ownership: 0 failures. Pushed.
