# public-read (T46)

**Status** · session_01SvLLNk2gSBYe3EG6QavHFX · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R19 says project_reference is null when the document "is not /5". case-grammar R1 makes /6 and /7 carry every /5 field (its predicates hold for /6 and /7 as for /5), and workingOnOf answers working_on for /5, /6 and /7, null before /5. My best reading, on which I am deepening R19's test: "is not /5" means a format before /5 (/1–/4 answer null; /5, /6 and /7 answer the notice id they name). Code unchanged. If you agree, R19's text could say "a format before /5"; if you mean /6 and /7 to answer null, say so and I change the code.

## J2 · COMPLETE

**T46-22 applied on `job/T46/public-read`** (merged `tranche/T46` after B2; head pushed).

**How the reading set was read (mechanics §17; B1).** Read whole by me: `build/requirements/public-read.md` and all module code (`src/public-read/*.mjs`, `src/publication/worker.mjs`, `src/container.mjs`, `src/inband.mjs`), plus `group-fields.test.mjs` and `worker.test.mjs`' R5 arms. For the rest of the set, two helpers in this session read in full and wrote digests citing each section, given my entry: (a) every file under `test/m/public-read/` (40 files); (b) the Public parts of record-grammar, signatures, ooxml, case-grammar, publication, docket, case-carriage and record-core, and layer 8's contract in `build/layers.md`. The sources stay binding.

**Entries applied**
- **R34 (N904).** `groupFields()` reads `declared_stake` through record-core's strict `getSetting(name, {strict: true})` (R83). `SETTING_UNREADABLE`, compared by identity, answers `stake: "undetermined"` with `STAKE_UNDETERMINED_SENTENCE`, never null. A setting never set still answers null.
  - Tests: real record-core with six planted non-JSON values and a non-text value; the stand-in is handed `{strict: true}`. Controls: never set answers null; an object merely shaped like the marker is a value as held. A published case's `group_fields` carries the same.
  - Both new arms fail on the old code and pass on the new.
- **R5 (N906).** The Worker already lowercased. The store now does too, by the method as well as through the op: `verifySha` and `publishedCase` lowercase a 64-hex argument (`lowerSha`); `withheldOf` already did.
  - `lowercase.test.mjs`: upper and two mixed-case forms of each hash give answers equal, status, headers and bytes, to the lowercase form's. Covered: published bytes, never-existed, container form, a case-file zip, and the store's verify, publishedcase and withheld (op and method).
  - Controls: 63 or 65 digits, non-hex and blank are still the required-argument refusal at the Worker; the store rewrites nothing that is not 64 hex.
  - The store-method arm fails on the old code.
- **Sampling tests deepened** (`sampling.test.mjs`, 16 tests; each case the text names; store, Worker, door and the downloaded case file as they apply):
  - **R13:** all three cases.
    - The citation version (case 3) had no surface at all: `publishedCase` never stated a citation's version. `document` now carries `citations`, `case-grammar.signedCitations` over the signed text: `/1`–`/3` answer `undetermined`, with no rows and its sentence, even when the text carries `case_citations`; `/4`–`/7` answer the rows as signed. This is an additive key on R3's answer.
    - Acknowledgements: null stays null, `[]` stays `[]`, a list stays a list (publishedCase, publishedEditions, Worker).
    - An unrecorded deliverer is undetermined on list, editions, case and Worker, with a recorded control.
  - **R15:** a whole-word, case-insensitive scan for every US state, the places the record has been used in, and place-shaped words. It covers every store answer, Worker answer, refusal and header, door answer, every file of every case-file part, and every exported sentence and row of the module.
    - Behaviour: `jurisdiction_profiles` set to three values changes no public read, byte for byte.
    - The stylesheet of case-grammar's complete edition, which names the font "Georgia", is not scanned, as stated in the test.
  - **R19:** every format `/1`–`/7`, store and Worker. With K2966's wording (B2): `/5`–`/7` answer the notice; `/1`–`/4` carrying the same line answer null; none, or malformed, answers null. A never-live control.
  - **R22:** `/1`–`/7`, store and Worker. Also a one-axis bar, no bar, a missing pair axis, and a member that meets the bar. A never-live control: the roster role, the live bar and the published pair changed after signing change nothing.
  - **R27:** both lanes with day, month and year precision, undetermined order with bounds, and placed-nowhere, rows written out of order, store and Worker.
    - Spy: publication is asked nothing named event or timeline, and emptying any events table changes nothing.
    - With no block, at every format, and for the loose record, both lanes are empty.
  - **R29:**
    - Neither instant is in any byte of the built case file (manifest and every entry of every part), for a `/6` case file and a pre-T28 container.
    - Two editions with four distinct instants answer their own on publishedCase, `edition_index` (store and Worker), publishedList and publishedEditions; finding rows carry neither. A swap control.
    - A waiting edition (publish-schedule R1) is answered by publication as unsigned (its R77), which `dates.test.mjs:87` covers at this interface.
  - **R30:** the same credit bytes across three groups (different slugs, identities, stakes, a published case) and four callers. DEC-146's lines appear nowhere on the public path but the credit page and its own constants, and no narrower or wider wording appears anywhere, with a counter control.
- **Own flaws fixed (P8):**
  - two mislabelled assertions (`convert-publishedcase.test.mjs` said `/4` about a `/5` document; `published.test.mjs` said `/4` about a `/6` one);
  - `group-fields.test.mjs` no longer asserts record-core's lenient read (coupling to another module's behaviour).
- I read my own code and tests whole (via the helpers for the tests, as above).

**Deferred, with why**
- The required-argument shape `"<64 lowercase hex>"` at `verify`, `publishedbytes` and `publishedcase` is kept: it is the plane-wide spelling (about 20 modules) and the wire bytes `door.test.mjs` holds. It is now loose, since mixed case is accepted. Rewording it is a cross-module words change, not this entry.
- Remaining sample-shaped arms the helper named, outside this entry's ids: R11 (`published.test.mjs:200`), R10/R14 (`:178`), DEC-149 (`dec149.test.mjs`), K899 (`record-word.test.mjs`), R28's "wherever served". Also `checks.test.mjs` pins each row's `where` (source text, by DEC-49's design) and `relay.test.mjs` names Worker line numbers. These are for a later entry if you want them deepened.

**Found in other modules / for BOB's text (REPORT)**
1. **public-read Uses:** names neither `case-grammar.signedCitations` (now used, R13) nor the dropping of `calculations`. The open `calculations` use is dropped: every input byte comes from the published projection (publication R22, K1632) and `modules.json` has no edge.
2. **case-grammar R10's Provides:** does not name `workingOnOf`, which R19 relies on.
3. **docket R12:** does not list `entry`, which R20's link reads (docket's code returns it).
4. **publication R53's field list:** omits `criteria`, `signed_at`/`published_at` (in `document`) and the timeline that its R70, R72 and R62 attribute to it.
5. **case-carriage R15 against public-read R3:** R15 lets the design stream re-word `COPY_CLEANED_LABEL`, but R3's `label_key` tells a cleaned document copy from a photo's only by that label's exact words. Editions signed with old words would key as a photo after a re-wording. It needs a stored marker (case-grammar R12) or a list of past wordings.
6. **R3's answer gained `document.citations`** (R13's case 3). Additive. Users' tests below are unchanged by it.

**Tests and checks run**
- `node --test test/m/public-read/`: 186 tests, 186 pass, 0 fail.
- Users of public-read on this head:
  - all pass: network-notices 73/0, ratification 233/0, case-checker 77/0, filings 92/0, instance-setup 147/0, answer-envelope 32/0, `test/system/migrate-released` 1/0;
  - red: op-declarations 134/6, control-plane 221/2, plane 210/1. The same 9 tests fail identically on `origin/tranche/T46` (a worktree of the base), so they are inherited (op-registry declarations), none from this job.
- `checks/format.mjs` 0 failures; `architecture.mjs bio public-read` 0; `coverage.mjs bio public-read` 34 of 34 live ids, 0 failures; `ownership.mjs bio public-read tranche/T46` 0 failures.
- `checks/run.mjs`: format 0, architecture 0 (2952 files), channels 0; coverage 32 failures, all other modules' (none public-read).

Size (session_01SvLLNk2gSBYe3EG6QavHFX): test runs 16, module lines 3659
