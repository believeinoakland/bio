# leg-earning (T41)

**Status** · session_018Dq5y3nwTnhZrikpr65p7D · depth 2 · WORKING · handled B2

## J1 · QUESTION

My readings of T41-14, on which I am building now (answer only if one is wrong):
1. R16 `route_basis`: kept as today, the provenance bases of the authored routes, sorted, unique (`CAPTURE_RECEIVED_NOT_FETCHED`, `CAPTURE_ROUTE_UNRECORDED`); the `why` names each route in words from provenance's answered `route` (`doorbell` "received through the doorbell", `upload` "uploaded by a member", none "no fetch route recorded"), in that order, joined by "; ".
2. R15: a "passage of an AI transcription" is a content row asked through `earned`'s `contentIds` whose chain holds an `ai_transcription` step covering the row's extent (text-chain `stepCovers`; a whole-document row, any such step). Its `earned.content[<cid>].capture` becomes a passage-grain ceiling `{grain: "passage", mode: "ceiling", grade, ...}`: when content's standing finds a covering attestation made against the row's chain (`transcription.determinant: "attestation"`, from `attestText`), the grade is the capture's own byte grade from its route (provenance `captureGrade`; an authored route stated as authored; an unruled route undetermined); otherwise grade null, `undetermined_because: "CAPTURE_FIDELITY_UNMEASURED"`, naming the AI reading and the remedy. Every other row keeps content's document pointer. The document-grain `earned.capture` is unchanged (already undetermined through `captureBound`, text-chain R104).
3. R13 answers `{ok, id, projects: [ids], limit, cursor}`: ids ascending after `after`, severed citers skipped, `cursor` the last id when more remain else null; `limit` a positive integer clamped to 500, default 100; `NO_ID` without an id.
4. R14 answers `{ok, id, projects: [{id, name}], truncated}`; a question the viewer cannot see answers `NO_SUCH_BUNDLE` as an absent one (R11); a project is listed only when not hidden (`visibilityOf`) and R44's `sight` is FULL or EXISTENCE for the viewer, `name` its `bundles.title`; hidden projects take no slot.

## Completion (LEG-EARNING #4)

**Reading set** (mechanics §17): measured as §3 asks, about 230 KB (requirements 10 KB; code 90 KB; tests 82 KB; each used module's Purpose, about 8 KB; the services the Uses and the new requirements name: membership R43, R44, R80, R85, R120; text-chain R25–R31, R56–R60, R100, R104; provenance R26, R51, R63 and `captureGrade` in code; content `attestText`, `standings` and its standing in code; record-core R37; layer 6's row of `build/layers.md`; K2448, K2457, K2472). Under 300 KB: read whole myself, no worker.

**Entries applied (T41-14), on the readings of J1, which BOB confirmed (B2, K2479).**
- **R13** `projectsDrawingOnPaged({id, after, limit})` → `{ok, id, projects, limit, cursor}`: R7's test (a `cites` reference from a project's document, not severed) over every project, ids ascending after `after`, `limit` a positive integer clamped to `PROJECTS_PAGE_MAX` (500), default `PROJECTS_PAGE_DEFAULT` (100); `cursor` the last id when more remain, else null; `NO_ID`. In-process only (no op). R7 and its 32 bound are unchanged.
- **R14** `projectsShownOn({id, viewer})` → `{ok, id, projects: [{id, name}], truncated}`: a question the viewer cannot see answers `NO_SUCH_BUNDLE` exactly as an absent one (R11); a project is shown only when not hidden (membership R85) and its R44 `sight` for the viewer is FULL or EXISTENCE, `name` its `bundles.title`; at most `PROJECTS_SHOWN_MAX` (200), the first by id. A hidden project takes no slot and never sets `truncated`, even for its own participants. It reads R13's pages, so every drawing project is considered.
- **R15** `earned` with content ids: a row cited as text whose chain holds an `ai_transcription` step covering the row's page (any such step for a row with no page) gets `earned.content[<cid>].capture` at passage grain `{grain: "passage", mode: "ceiling", …}`. It is undetermined (`CAPTURE_FIDELITY_UNMEASURED`, the empty level and the remedy named) unless content's standing finds a covering attestation made against the row's chain (`attestText`). In that case it carries the capture's own byte grade from its route: an authored route is stated as authored, and an unruled route stays undetermined (`CAPTURE_GRADE_VIA_UNRULED`). Every other row keeps content's document pointer. The document-grain `earned.capture` is unchanged; it was already undetermined through `captureBound` (text-chain R104).
- **R16** The authored note's `why` names each route in words from provenance's answered `route`. `AUTHORED_ROUTE_WORDS` is exported: doorbell "received through the doorbell", upload "uploaded by a member", unrecorded "no fetch route recorded", in that order, joined by "; ". A received route the table does not know is named by its own spelling, never as the doorbell. `route_basis` is unchanged: the bases, sorted.
- Header comment updated. Nothing deferred.

**Found in another module (REPORT to BOB).** `build/requirements/leg-earning.md` Uses names no `provenance`, but the code has used `provenance.captureGrade` since the split (R1, R8), and now also `DOORBELL_VIA` and `UPLOAD_VIA` (R16). `modules.json` already carries the edge. Wording only; BOB's to add.

**Tests.** New `t41.test.mjs`, 10 tests, each id named, each with a negative control (K874):
- R13: pages with cursor; severed and non-project citers skipped; an exact last page has no cursor; the limit clamp and default; R7's bound kept beside it.
- R14: hidden projects never shown or named, even to their participants; the same answer with and without hidden citers; NO_SUCH_BUNDLE for an unseen question equals an absent one; the 200 bound, where hidden projects never set `truncated`.
- R15: an unattested AI passage is undetermined, and `legCapped` refuses every letter against it; an attested page earns the capture's own grade (a replay earns its route's letter, not the ceiling); an unattested page stays undetermined; an upload earns the ceiling stated as authored; an unruled route stays undetermined; rows no AI step covers keep the pointer; no content ids leaves the answer unchanged.
- R16: the doorbell, upload, unrecorded and mixed wordings; an upload is never worded as the doorbell; a direct fetch removes the authored note.

Mutation check: each of six mutations (hidden filter, attestation test, page coverage, capture's own grade, upload words, severed skip) turns tests red.

**Runs.**
- `node --test test/m/leg-earning/`: 57/57 pass.
- Users of leg-earning: strength 143/143. inquiry 172/176: 3 fail, 1 cancelled (R52 (1), R53 ×2). basis-versions 129/131: 2 fail (R47 ×2). The failing set is identical with this change stashed, so none is caused here. These are inherited reds (the plan's rule 4) and not this job's. steps, question-explorer and investigation have no tests yet.
- No layer tests are named in the manifest.
- Checks: format 0 failures; architecture 0; coverage 16 of 16 ids, 0 failures; ownership 0.
- No generated artifact edited. The plane bundle is staled as by any merge (rule 4 (14)).

Size (session_018Dq5y3nwTnhZrikpr65p7D): test runs 16, module lines 1470

## J2 · REPORT

leg-earning requirements, Uses: names no `provenance`, though the code has used `provenance.captureGrade` since the split (R1, R8) and now also `DOORBELL_VIA` and `UPLOAD_VIA` (R16). `modules.json` already carries the edge. Wording only, BOB's to add.
