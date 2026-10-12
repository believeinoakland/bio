# case-authoring (T46)

**Status** · session_015ySFNDd18mdxT5E8Xsc9u6 · depth 2 · COMPLETE · handled B2

## Completion (CASE-AUTHORING #27)

**Entry applied.** T46-27 (N913; DEC-194): R73, with K2964's ruling of J1.
- **The words table.** `src/case-authoring/checks.mjs` gains a frozen `CASE_AUTHORING_WORDS`, re-exported by `index.mjs`. It holds `words.json`'s `en` verbatim for seven keys: `refusal.MACHINE_CANNOT_CARRY_OUTCOME`, `refusal.CARRY_NOT_A_PARTICIPANT`, `refusal.NO_SUCH_CARRIED_OUTCOME`, `refusal.CARRIED_OUTCOME_SETTLED`, `refusal.CARRY_NO_REASON`, `signing.openrequest.line` and `signing.openrequest.noreply`. A `fillWords` reader fills placeholders and throws for a key the table lacks, as extraction's does.
- **The rows.** C-136.3, .4, .6, .7 and .8 take their translations from the table by key. Codes, numbers, `where`s and behaviour are unmoved. C-136.4's text is byte-identical to what it was.
- **What is kept, as R73 says.** C-136.5 `BAD_CARRIED_OUTCOME`, `.nowindow` and `.unread` keep their present text and are not in the table. The other 17 rows of the module's three families are byte-identical: the canonical-JSON sha256 is the same before and after, and the test pins it.
- **The sign step's lines (R34, R70, R73).** `openRequestLine` reads `line` when a row has a window and `answers`. It reads `noreply` when a row has a window, `answers` null and `replied: false`. Every placeholder is filled from the row. Any other row keeps a plain sentence with `key: null`. The unread sentence is now also keyed null; it used to name the `.unread` key while showing a different, plain sentence.
- **`replied` (K2964).** R70's row takes an optional boolean `replied`. A non-boolean is malformed, and so is `replied: false` beside a layout: it contradicts itself, and I added that rule myself. `replied` is carried on the row only when the source states it, so action-replies' rows read byte-identically today (its `open.test.mjs` passes).

**The P8 flaw (B1), fixed.** "No reply is recorded" is now shown only when the source states `replied: false`. A reply whose claims are not laid out reads "a reply is recorded, and its claims are not yet laid out." when `replied: true`, and "no reply laid out claim by claim is recorded." when `replied` is unstated. Until action-replies R8 (T46-35, L9) states `replied`, no row from it reads `.noreply`.

**How the reading set was read (mechanics §17).**
- Read whole by this session: `build/requirements/case-authoring.md`; every file of `src/case-authoring/` (index, document, checks, schema, searched); my entry and the plan's opening rules in `build/plan/current.md`; `test/m/case-authoring/openrequests.test.mjs` and `outcomes.test.mjs` (lines 1–135).
- Read in full by three helpers in this session, each writing a digest citing sections and requirement ids (K2032); the sources stay binding:
  - all 28 files of `test/m/case-authoring/` (496,681 B);
  - the Public parts of all 41 used modules: one helper read 11 whole, and two more helpers read the other 30 whole (about 1 MB together).
- Layer 8's contract in `build/layers.md` was taken from the plan's L8 entries and rules; no layer tests are named in the manifest.

**Own code and tests read whole (P20).** Code read whole by me, tests by a helper in full. Flaws found and dealt with in this job:
- the P8 `.noreply` flaw (above);
- the unread step named a key whose sentence it did not show (fixed: keyed null);
- `openrequests.test.mjs` checked `says` against the exported function (tautological) and had no row with a window and no reply. Fixed: the step's own `says` is now checked, and that row was added.
- `outcomes.test.mjs`' `refused()` helper reads the expected translation from the table itself. Left as it is: the new `t46-words.test.mjs` checks every re-worded row against `words.json`, and against each act's answer.

Nothing deferred.

**Found in other modules.**
- action-replies: R3's rows should state `replied` (K2964; BOB placed it as action-replies R8 in T46-35). Until then its null-`answers` rows read the neutral sentence.
- Accepted reds opened, nothing for another module to do:
  - `test/system/row-census.test.mjs` names exactly C-136.3, .6, .7 and .8 as "changed with no record" (C-136.4's text did not move). These are awaiting stamp under rule 5 (2), until T47's stamp.
  - The plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`) holds this module's source and is stale (rule 5 (4)); none was touched.

**Tests and checks.**
- `node --test test/m/case-authoring/*.test.mjs`: tests 210, pass 210, fail 0. The baseline at START was 204, with 3 open-request tests red after my first edit.
- New: `t46-words.test.mjs`, 6 tests naming R73. `openrequests.test.mjs` was amended to R73 and K2964.
- Negative control: with C-136.3 and .6 restored to T45's words, 2 of the 6 R73 tests fail; restored, all 6 pass.
- Users of the changed service and rows, together with this module: `action-replies/*`, `consequences/*` and `plane/t45` give tests 295, pass 295, fail 0. `promotion/*`: 137, all pass.
- `format`: 0 failures. `architecture case-authoring`: 0 failures. `coverage case-authoring`: 55 of 55 live ids named; 0 failures. `ownership case-authoring tranche/T46`: 5 files; 0 failures.
- `checks/run.mjs` over the product: architecture 0 failures (2,950 files); format 0; channels 0. Coverage has 32 failures, all other modules' ids not yet met (rule 5 (1)), none of case-authoring's.

Size (session_015ySFNDd18mdxT5E8Xsc9u6): test runs 16, module lines 4132

## J1 · QUESTION

The P8 flaw in B1 (`.noreply` read when a reply exists but no claims are laid out) cannot be fixed inside this module alone: R70 lets the source answer `answers: null` both for "no reply recorded" and for "a reply recorded, no claims laid out", and action-replies R3 (`#openRow`, index.mjs 392-401) answers null for both. Nothing in the row tells them apart.

My best reading, which I am building now (wording only, no capability):
1. R70's row gains an optional `replied` (boolean): `true` when a reply is recorded, `false` when none is. Absent is legal (today's source), and a malformed `replied` makes the row malformed (read `undetermined`, as now).
2. R73's sentence choice: `signing.openrequest.line` when `answers` is non-null; `signing.openrequest.noreply` only when `answers` is null AND `replied === false`; when `answers` is null and `replied` is `true` or absent, a plain sentence true in both cases ("…; a reply is recorded, and its claims are not yet laid out." for `true`; "…; no reply laid out claim by claim is recorded." for absent), keyed null, until the design stream gives a word. So "no reply is recorded" is never shown for a recorded reply.
3. Owed elsewhere (not mine): action-replies R3 states `replied` (true when any `received` entry exists); I suggest folding it into T46-35 (L9). Until then every null-`answers` row reads the neutral plain sentence, never `.noreply`.

Requirement changes this needs (BOB's): R70's row shape (`replied?`), R73's second bullet (the condition for `.noreply`), action-replies R3. Answer with a different rule if you prefer (e.g. `answers: {answered: 0, claims: 0}` for a recorded reply); I carry on with the rest of T46-27 meanwhile.

## J2 · COMPLETE

T46-27 (N913; R73; K2964) applied. C-136.3, .4, .6, .7 and .8 read words.json's refusal.<CODE> by key from a frozen CASE_AUTHORING_WORDS (checks.mjs, re-exported). C-136.5, .nowindow and .unread are kept. The other 17 rows of the three families are byte-identical (sha pinned). The sign step reads signing.openrequest.line and .noreply with the row's facts filled; .noreply is shown only for replied:false (the P8 flaw is fixed), and any other row gets a plain sentence keyed null. R70's optional replied is carried only when the source states it, so action-replies' rows are unchanged. New t46-words.test.mjs (6 tests, R73, negative control shown); openrequests.test.mjs amended. Module tests 210/210; with action-replies, consequences and plane/t45, 295/295; promotion 137/137. Checks: format, architecture, coverage (55/55) and ownership (5 files) all 0 failures; run.mjs architecture 0. Reds opened, both accepted: the row census names exactly C-136.3/.6/.7/.8 (rule 5 (2), awaiting T47's stamp), and the plane bundle is stale (rule 5 (4)). Owed elsewhere: action-replies R8 states replied (T46-35). Own code read whole; tests and all 41 Uses' public parts read in full by helpers. Nothing deferred. Details in my record.
