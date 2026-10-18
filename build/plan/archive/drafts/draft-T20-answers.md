# Draft: T20 placements for Bob's answers (K899: Q1, Q3, Q7)

**Status** · DRAFT, written by a worker for BOB, 2026-10-01, for BOB's review. Read on `tranche/T20` @ 0164b19219 (K900: layer 6 closed; layers 7–11 not started). Every `file:line` below was read at that commit. Nothing here is committed to a START or a requirement file until BOB folds it.

Placement rule (K899): each answer joins T20 in every layer not yet started (7–11); a share in a closed layer (1–6) is a next-tranche entry (order, P4). New refusal rows and changed translations are `awaiting stamp` for the next tranche's promotion job (P8).

---

## A. Q1: "record" replaces "bundle" in text members read

### A.1 How the scan was made

Every `.mjs`/`.js` file in a module's `paths` (`build/modules.json`) was parsed (acorn), less its tests. Every string literal and template part was scanned for the word *bundle* / *bundles* / *bundled* / *bundling* (any case), standing as a word. Comments are excluded, including comments inside an embedded `<script>`. So are SQL strings and identifiers: `bundle_id`, `bundleId=`, `bundle.md`, `_history/bundle_…`, `bias_manifest_bundles`, the codes `NO_SUCH_BUNDLE`/`NO_BUNDLE`, and the 38 one-word strings `"bundle"`/`"bundles"` (subject kinds and keys such as `kind: "bundle"`). Each hit was then sorted into one of four classes:

| class | count | what | action |
| --- | --- | --- | --- |
| **outward** | **144** | refusal `detail`s, check findings and repairs, `note`/`why`/`basis` text in answers, op argument help, rendered HTML | re-word |
| internal | 58 | text no op serves: affordances' `NON_ACTS` and `RUNG_ABSENT.is` reasons (39; only keys and `.ground` are served, `affordances.mjs`:2726, :2744); control-plane's `PROJECT_NAMING_READS_NOT` reasons (9, read only by tests); the developer assertion `"REFUSED: the D-15 bundle gate needs a QUALIFIED column"` thrown on a coding error (10: provenance 2, connections 1, contradiction 2, ai-runs 1, queue-producers 2, tasks 2) | leave (BOB: see A.5) |
| build sense | 47 | *bundle* meaning a JavaScript build artifact, not the record: bundler 37, pdf-worker 1, ocr-worker 1, agent-worker `scripts/build.mjs` 1, installer 1, legacy-tests' `civicos-ui/check-refusal-codes.mjs` 6 (that file is deleted by LEGACY-TESTS in L11, N444) | out of scope |
| SQL | 12 | the `bundles` table in queries and DDL | identifiers; leave |

Also `bio-plane/src/sign-release.html` (signatures; the source `signpage.mjs`' `SIGN_HTML` is generated from by `scripts/embed-signpage.mjs`) holds 6 outward hits: lines 138, 142, 144, 397, 398, 403. Line 123's `bio-plane.bundled.mjs` is a file name.

**Rows (the row census).** Exactly **one** outward hit is a refusal row's translation: provenance's `TESTIMONY_CHECKS.CAPTURE_HELD_BY_ANOTHER_BUNDLE`, **C-53.13** (`src/provenance/checks.mjs`:363–:365). provenance is in L3, which is closed. No `*_CHECKS` row in layers 7–11 holds the word. Every other hit is a finding message or an answer's text, which no row carries (`test/system/row-census.mjs` digests `[check, code, where, translation]` only), so nothing else awaits a stamp.

**legacy-ui** (`civicos-ui/`, Bob's UX, untouched, K633): `app.html` 148 word occurrences (raw count, code and text together), `README.md` 1, `NEXT_SESSION_PROMPT.md` 1. Counts only; no entry.

### A.2 Layers 7–11: 44 hits in 11 modules (T20 STARTs below)

| L | module | n | where |
| --- | --- | --- | --- |
| 8 | public-read | 5 | `src/public-read/index.mjs`:775; `src/publication/worker.mjs`:526, :527, :528, :714 |
| 8 | publication | 1 | `src/publication/index.mjs`:1974 |
| 8 | ratification | 9 | `src/ratification/checks.mjs`:311, :522, :686, :693; `ops.mjs`:375, :774, :776, :826; `release.mjs`:149 |
| 9 | action-grammar | 2 | `src/action-grammar/checks.mjs`:435 (a repair); `grammar.mjs`:155 |
| 9 | actions | 1 | `src/actions/index.mjs`:958 |
| 10 | monitoring | 3 | `src/monitoring/index.mjs`:485, :1040, :1056 |
| 11 | affordances | 3 | `src/affordances/door.mjs`:21, :26; `src/affordances/facts.mjs`:148 |
| 11 | control-plane | 2 | `src/control-plane/index.mjs`:1756; `src/control-plane/pull.mjs`:114 |
| 11 | queue-producers | 1 | `src/queue-producers/index.mjs`:1470 (export-performed `summary`) |
| 11 | instance-setup | 13 | `src/setup.mjs` (`SETUP_HTML`, the instance page): :317, :320, :329, :440, :444, :706, :711, :764, :845, :873, :876, :879, :1303 |
| 11 | tasks | 4 | `src/tasks/checks.mjs`:149, :152; `src/tasks/index.mjs`:178, :304 |

No row is touched, so none of these awaits a stamp.

### A.3 Layers 1–6, closed: 100 hits in 22 modules (next-tranche entries, order P4)

| L | module | n | where |
| --- | --- | --- | --- |
| 1 | record-grammar | 2 | `src/record-grammar/bundle.mjs`:250, :341 |
| 1 | signatures | 6 | `src/sign-release.html`:138, :142, :144, :397, :398, :403 (then re-render `signpage.mjs`) |
| 1 | subresources | 2 | `src/subresources.mjs`:1378, :1381 |
| 2 | promotion | 15 | `src/gate.mjs`:743; `promotion/history.mjs`:95, :203; `promotion/index.mjs`:328, :562, :579, :640; `promotion/names.mjs`:71, :75; `promotion/release.mjs`:105, :115, :116, :118, :143, :168 |
| 2 | record-core | 2 | `src/record-core/index.mjs`:801, :802 |
| 3 | acquisition | 1 | `src/acquisition/index.mjs`:667 |
| 3 | capture | 1 | `src/capture/index.mjs`:1690 |
| 3 | provenance | 30 | `checks.mjs`:363–:365 (**row C-53.13: `awaiting stamp`**); `index.mjs`:343, :624, :659, :731, :1127, :1130, :1190, :1191, :1313, :1522, :1814, :2017, :2021, :2385, :2447, :2448; `register-checks.mjs`:144, :149, :193, :278, :293, :294, :422, :433, :457, :460, :480 |
| 4 | extraction | 2 | `src/extraction/index.mjs`:866, :1283 |
| 5 | bias | 5 | `src/bias/checks.mjs`:120, :142; `index.mjs`:302, :562, :617 |
| 5 | connections | 7 | `src/connections/index.mjs`:899, :955, :983, :984, :996; `themes.mjs`:98, :100 |
| 5 | observation-log | 2 | `src/observation-log/index.mjs`:633; `vocabulary.mjs`:1504 |
| 5 | query-language | 3 | `src/query.mjs`:555, :558 (`MEANING` grain text), :1864 |
| 5 | retrieval | 6 | `src/retrieval/frontier.mjs`:179, :182; `index.mjs`:530, :716, :737, :759 |
| 6 | basis-versions | 2 | `src/basis-versions/grammar.mjs`:327; `index.mjs`:936 |
| 6 | capture-requests | 1 | `src/capture-requests/index.mjs`:266 |
| 6 | citation | 2 | `src/citation/index.mjs`:241, :440 |
| 6 | contradiction | 1 | `src/contradiction/index.mjs`:1338 |
| 6 | inquiry | 2 | `src/inquiry/index.mjs`:887, :1341 |
| 6 | inquiry-grammar | 5 | `src/inquiry-grammar/grammar.mjs`:76, :144, :397, :606, :1060 |
| 6 | strength | 1 | `src/strength/index.mjs`:320 |
| 6 | agent-worker | 2 | `agent-worker/src/harness.mjs`:291 (`PLANE_OPS` why); `src/index.mjs`:950 (text an assistant reads; see A.5) |

**Proposed `next.md` entry (N-new, K899 (1)):** re-word the outward hits above in each module's next job, one job per module (P8). Each job re-scans its own `paths` first, because lines move. The one row change, provenance C-53.13's translation, is `awaiting stamp` for that tranche's promotion job. The signatures job re-renders `signpage.mjs`. The jobs for agent-worker and signatures stale the agent-worker, plane and installer bundles, which are regenerated at the close (§14).

### A.4 STARTs (layers 7–11)

Every one ends with the same tail. Each new START is Depth 2. On an existing START, the text is appended as an `Also (K899 (1)):` line.

The shared sentence, named **[Q1]** below: *Bob ruled (K899 (1)) that text members read says "record" where it says "bundle". Identifiers stay: `bundle_id`, `bundleId=`, `bundle.md`, the `bundles` table, the codes, the kind values and every field name. Re-word only the human text at the lines named, keeping each sentence's meaning (for example "a bundle" becomes "a record", and "bundle id" becomes "record id"). Re-scan your `paths` first for any other string a member reads that holds the word, comments, SQL and identifiers aside, and name what you found. Re-key any of your tests that pins the old words. No refusal row changes (no translation holds the word), so nothing awaits a stamp. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).*

- **public-read** (new, L8): `Depth 2. Your entry: build/plan/current.md (T20) layer 8, public-read (K899 (1)): src/public-read/index.mjs:775 ("this is a RATIFIED BUNDLE …"); src/publication/worker.mjs:526, :527, :528 (publishedcase's argument help, "<bundle id>", "the bundle sha of an edition"), :714 ("own bundle sha"). [Q1]`
- **publication** (new, L8): `… layer 8, publication (K899 (1)): src/publication/index.mjs:1974 (verify: "every bundle its history chain"). [Q1]`
- **ratification** (append): `Also (K899 (1)): src/ratification/checks.mjs:311 (a repair), :522, :686, :693 (finding messages; keep the field name bias_manifest_bundles, re-word "no bias bundle was in force"); ops.mjs:375, :774, :776, :826; release.mjs:149. [Q1]`
- **action-grammar** (new, L9; it also carries C.3): `… layer 9, action-grammar (K899 (1)): src/action-grammar/checks.mjs:435 (a repair, "the ACTN- bundle"); grammar.mjs:155 ("not a canonical bundle id"). [Q1]`
- **actions** (append): `Also (K899 (1)): src/actions/index.mjs:958 ("would produce a bundle the catalog rejects"). [Q1]`
- **monitoring** (new, L10): `… layer 10, monitoring (K899 (1)): src/monitoring/index.mjs:485 (NOT_MONITORED detail), :1040 (why), :1056 (uncapturedWhy). [Q1]`
- **affordances** (new, L11; it also carries C.5): `… layer 11, affordances (K899 (1)): src/affordances/door.mjs:21, :26 (CATALOGUE_DETAIL); src/affordances/facts.mjs:148. NON_ACTS' and RUNG_ABSENT's reason text (affordances.mjs:914, :2167–:2639) is served by no op, so it is not in scope. [Q1]`
- **control-plane** (append): `Also (K899 (1)): src/control-plane/index.mjs:1756 (a drive-provenance refusal; keep "bundle.md"); src/control-plane/pull.mjs:114. PROJECT_NAMING_READS_NOT's reasons (dispatch.mjs:70–:110) are read only by tests: leave them. [Q1]`
- **queue-producers** (new, L11; it also carries C.4): `… layer 11, queue-producers (K899 (1)): src/queue-producers/index.mjs:1470 (export-performed summary "${r.bundles} bundles"; r.bundles stays). [Q1]`
- **instance-setup** (append): `Also (K899 (1)): the instance page src/setup.mjs (SETUP_HTML): :317, :320, :329 (headings and hints), :440, :444, :845 (the "Bundle" crumb and labels), :706, :711 (the browse summary and the table header), :764, :873, :876, :879, :1303 (messages). Inline-script comments and "bundle.md" stay. [Q1]`
- **tasks** (new, L11): `… layer 11, tasks (K899 (1)): src/tasks/checks.mjs:149 (C-19.1's message), :152 (a repair); src/tasks/index.mjs:178 (an assignment basis), :304. [Q1]`

**Size:** about 1 to 15 lines each, plus pinned tests. **Merge:** no ordering among these.

### A.5 For BOB

1. Agent-read text (agent-worker, L6, closed) counts as "text members read": an assistant relays it to a member. Proposed: in scope, placed next tranche.
2. Internal reason tables (`NON_ACTS`, `RUNG_ABSENT.is`, `PROJECT_NAMING_READS_NOT`) and the D-15 developer assertion: no member reads them. Proposed: leave them, record it as a ruling, and re-word them only if a later surface serves them.
3. The instance page (`setup.mjs`) is UI text in a product module, not legacy-ui. It is in scope under Bob's "all text members read"; no UX design changes.

---

## B. Q3 (N317): the hand-written project state

### B.1 What exists (verified)

- **intent is L7** (`modules.json`), not started: its share joins T20.
- C-2.9's legacy arms and C-9.1 are intent's grammar (R29): `src/intent/grammar.mjs`. `WORKPRODUCT_STATES` is at :21–:22. The `workproduct_state` arm is :32–:34; the `evaluations` arm :35–:44; the `closed_reason` arm :45–:47; C-9.1, the readiness ladder over evaluations, :48–:66. `PROJECT_GRAMMAR` (:72–:73) claims the slot's ids `["C-2.9", "C-9.1"]`. `src/intent/index.mjs`:50 re-exports `WORKPRODUCT_STATES` (no importer outside intent). The objective arm is R1 (`intent/checks.mjs`:29, `index.mjs`:216–:219) and is not touched. Tests: `test/m/intent/grammar.test.mjs`:75 (workproduct), :96 (evaluations), :128 (closed_reason), :141 (C-9.1), :167 (finding order).
- **`STATES.project` edges** are record-grammar's (**L1, closed**): `src/record-grammar/document.mjs`:291–:299, legal `forming, investigating, matured, closed`, with edges `forming→investigating|closed`, `investigating→matured|closed`, `matured→closed`, `closed→investigating`. They are read by promotion R15 (`promotion/index.mjs`:755–:776, region `is-state-move-undeclared`, `STATE_MOVE_UNDECLARED` C-86.6), by C-4.2 (`promotion/history.mjs`:256, with fences at :217), by C-4.1 (`record-grammar/bundle.mjs`:203–:221), and by instance-setup's `FIRST_STATE` (`setup.mjs`:46–:47, `legal[0]`).
- Other readers of `workproduct_state`: record-grammar's **C-6.3** arm (`bundle.mjs`:520–:523, "workproduct_state is distributed but distributions/ is empty", L1). record-grammar's slot `EXTENSION_ARMS` (`bundle.mjs`:685) lists `C-2.9` and `C-9.1`. reevaluation (L7) at `src/reevaluation/index.mjs`:309–:313 reads `workproduct_state` `retracted`/`redistributed` as the `wp_retraction` cause (R16, *not yet met*). C-2.9's enum never allowed those two values, so this arm has never fired.
- project-stage (L8) already ignores a stored non-`closed` state (`project-stage/index.mjs`:166; its R2). legacy-ui writes `project:"forming"` at creation (`civicos-ui/app.html`:1797) and draws the old edges (:1840).

### B.2 What retires (Bob: yes)

| retires | file:line | layer |
| --- | --- | --- |
| C-2.9 `workproduct_state` arm | `intent/grammar.mjs`:32–:34 (and `WORKPRODUCT_STATES` :21–:22, re-export `index.mjs`:50) | 7 (T20) |
| C-2.9 `evaluations` arm | `intent/grammar.mjs`:35–:44 | 7 (T20) |
| C-9.1, the readiness ladder (it reads only `workproduct_state` and `evaluations`) | `intent/grammar.mjs`:48–:66 | 7 (T20) |
| C-6.3's `workproduct_state` arm | `record-grammar/bundle.mjs`:520–:523 | 1 (next) |
| `C-9.1` in the slot's ids | `record-grammar/bundle.mjs`:685 | 1 (next) |
| the `STATES.project` edges to `investigating`/`matured` | `record-grammar/document.mjs`:291–:299 | 1 (next) |

**Kept:** C-2.9's objective arm (intent R1) and its `closed_reason` arm (`grammar.mjs`:45–:47). project-stage R2 reads `closed` only with a valid `closed_reason`, so the arm guards the one state that is still written. *(BOB: confirm that "C-2.9's legacy arms" means the workproduct, evaluations and ladder arms only.)*

### B.3 How "refuse a hand-written state other than `closed`" is written (BOB, possibly Bob)

- **(a) Literal.** A project document carries no `current_state` except `closed`. This needs: promotion R11 to exempt a project's creation from `PROMOTED_FIELD_UNSTATED`; R44's fork to stop writing `current_state: forming`; C-4.1 to accept an absent state for a project; instance-setup's `FIRST_STATE` to change; and a way to write a reopening. **legacy-ui's project creation (`app.html`:1797) would then be refused**, and legacy-ui is untouched (K633).
- **(b) Recommended, least change.** `forming`, the stage every project with no inputs is in, may be written at creation and on a reopening; `closed` is the owner's act; nothing else is written. `STATES.project` becomes legal `['forming', 'closed']`, `legacy: ['investigating', 'matured']` (read, never produced: DEC-72's CASE-4 key, which only C-4.1 reads). The edges become `forming→closed`, `investigating→closed`, `matured→closed`, `closed→forming`. R15 then refuses every hand-written move to another state (`STATE_MOVE_UNDECLARED`). One new promotion clause refuses a creation that states a legacy state. Stored values stay readable, as the Q3 recommendation Bob approved said. legacy-ui still creates projects; its old "advance stage" moves are refused by name. This narrows Bob's literal words ("other than `closed`") by allowing `forming`, so **Bob's nod is needed** if BOB prefers (b).

### B.4 intent's share: START (L7, T20)

**Requirement wording (P18; BOB folds before L7).** intent **R29** is replaced by:

> **R29** (K653 BOB-4; K899 (3), N317) C-2.9's `closed_reason` arm is this module's grammar, registered once at start through record-core's grammar seam (`registerGrammar`, record-core R67) in record-grammar R28's `checkProjectExtension` slot, which it claims whole (`C-2.9`, `C-9.1`) so that `checkBundle` runs it at that slot's place. For a document whose `object_type` is `project` (any other: nothing), at `closed`, a `closed_reason` not one of `resolved`, `superseded`, `abandoned` is one C-2.9 error. `workproduct_state`, `evaluations` and the readiness ladder (C-9.1) are not read (Bob, K899 (3): a project's stage and its work products' readiness are computed, `project-stage` R2–R4); a document carrying them is neither refused nor corrected for them. The slot keeps the id `C-9.1` until record-grammar's slot drops it.

R22: "C-2.9's other arms and C-9.1 (R29; K653 BOB-4)" becomes "C-2.9's `closed_reason` arm (R29)". Open for Bob, Decided by BOB: the last bullet of "Decided by BOB" gains "(K899 (3): `workproduct_state`, `evaluations` and C-9.1 retired)".

**START (intent, new):**
`Depth 2. Your entry: build/plan/current.md (T20) layer 7, intent (K899 (3), N317; K379): Bob ruled that the project fields workproduct_state and evaluations, and C-2.9's arms over them, retire; a project's stage and readiness are computed (project-stage R2–R4). Your R29 and R22 were re-worded before L7. In bio-plane/src/intent/grammar.mjs delete the workproduct_state arm (:32–:34), the evaluations arm (:35–:44), the C-9.1 readiness ladder (:48–:66) and WORKPRODUCT_STATES (:21–:22, with its re-export at src/intent/index.mjs:50; re-scan bio-plane/src, agent-worker/ and civicos-ui/ first: an importer outside your paths names itself in a REPORT and the export waits, P4). Keep the closed_reason arm (:45–:47), CLOSED_REASONS, R1's objective arm, and PROJECT_GRAMMAR's claimed ids ["C-2.9", "C-9.1"] (:72): record-grammar's slot (src/record-grammar/bundle.mjs:685, closed L1) still lists both, and drops C-9.1 next tranche. Re-key test/m/intent/grammar.test.mjs to the new R29: :75 and :96 become "a project carrying any workproduct_state or evaluations, well-formed or not, draws no finding from this grammar"; :141's ladder test becomes the same for C-9.1 (no C-9.1 finding at any rung); :128 stays; :167's order test keeps closed_reason alone. Proof: test/m/intent/ green; the whole test/m with no new red. Any other module's test that expects a C-2.9 or C-9.1 finding over workproduct_state or evaluations (re-scan bio-plane/test/m: record-grammar's fixtures/expected.json, bundle.test.mjs and record-core.test.mjs hold such documents) is named in a REPORT, not edited (one file, one editor, §12.2), and BOB accepts that red by name until its owner's next job. No row changes (findings, not rows), but a check's behaviour changes: your record says "awaiting stamp (behaviour, no row)" for the next promotion job. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).`

**Size:** about −45 code lines and −60 test lines, re-keyed.

### B.5 reevaluation (L7): no T20 job (for BOB)

`wp_retraction` (`reevaluation/index.mjs`:309–:313; `checks.mjs`:27 `REEVAL_SOURCES`) is State Rules §5.4's cascade event, "a work product retracted or re-distributed", and R16 is *not yet met*. Its only source was `workproduct_state`, whose values C-2.9 never admitted. Retiring the field leaves the event unproduced, not wrong. Proposed `next.md` entry: re-source the event from the work product as DEC-72 has it, a case edition withdrawn or superseded (publication or project-stage), and delete the field read. This is a design question; no T20 job.

### B.6 Next-tranche entries (closed layers; order P4)

- **record-grammar (L1)** · K899 (3): `STATES.project` as BOB chose in B.3 (`document.mjs`:291–:299); C-6.3's `workproduct_state` arm deleted (`bundle.mjs`:520–:523); `EXTENSION_ARMS`' `checkProjectExtension` ids become `['C-2.9']` (`bundle.mjs`:685), with R28's wording. In the same tranche intent drops `C-9.1` from `PROJECT_GRAMMAR` (merge record-grammar early). Its fixtures (`test/m/record-grammar/fixtures/expected.json`, `bundles.mjs`, `bundle.test.mjs`) are re-keyed.
- **promotion (L2)** · K899 (3): (i) new **R56** (free: R56 is named by no test in `test/m/promotion/`):
  > **R56** (K899 (3), N317) A project's stage is computed (`project-stage` R2), never written by hand: a creation of a project whose document states a `current_state` other than `forming` or `closed` is refused `PROJECT_STAGE_COMPUTED` (C-86.15); a revision's move is R15's, over the declared table, whose only project moves are to `closed` and, from `closed`, to `forming`. A revision that leaves a stored `investigating` or `matured` where it stands is not a move, and is accepted. [Under B.3 (a): "a `current_state` other than `closed`", with R11's and R44's changes.]

  New row in `PROMOTION_CHECKS` (`src/promotion/checks.mjs`, family C-86, the next free number):
  > `PROJECT_STAGE_COMPUTED: { check: "C-86.15", where: "src/promotion/index.mjs #promote > is-project-stage-computed", translation: "A project's stage is worked out from its record (the questions it holds, what it has concluded and what it has published), so it is never written by hand. Only closing a project, with its reason, or reopening it is written. Nothing was written." }`

  (ii) Fence the old project moves: `STATE_MOVE_FENCED_SINCE` (`history.mjs`:217) gains `project: "<the change's date>"`. Otherwise C-4.2 reads every recorded `forming→investigating`, `investigating→matured` and `closed→investigating` as undeclared. Merge it with record-grammar's change in one tranche, and accept a C-4.2 red by name between their merges. (iii) Stamp: the new row and the behaviour of C-2.9, C-9.1, C-6.3 and C-4.1.
- **instance-setup** (L11, T20 or next): none under B.3 (b) (`FIRST_STATE` is still `forming`). Under (a), `setup.mjs`:46–:47 and :941 stop writing a project state.

---

## C. Q7 (N-A19, DEC-61): the litigation-hold reminder and its door

### C.1 What exists (verified)

- Pressure marks are **actions'** (L9): R48 (`build/requirements/actions.md`:78). `PRESSURE_KINDS` is at `src/actions/index.mjs`:77; `#pressureRefusal` :1340–:1354; `actionPressure` :1358–:1389 (`op=actionpressure`, its op map :2297). The table `action_pressure` (`schema.mjs`:201–:210; in `ACTIONS_TABLES` :213–:214) is keyed `(bundle_id, ord)` and never rewritten. The read (R25) answers `pressure` (:2045).
- The rows are **action-grammar's** (L9): `ACTION_CATALOGUE_CHECKS` (`src/action-grammar/checks.mjs`:1114). Pressure rows C-117.14–.18 are at :1246–:1274; the highest in the family is C-117.19 (:1213). action-grammar R9 names "C-117.6–C-117.19".
- **queue** R12 (K607) names each OBLIGATION's door; the door map is `src/queue/index.mjs`:487–:489 (`OBLIGATION_DOORS`) and :491–:508 (`OBLIGATION_DOOR_DETAIL`); the kind catalogue is `src/queuestate.mjs`:109–:118. R28's bridge names the same door. **queue-producers** R14–R18 are the pattern (R18 `action-reminder`: `index.mjs`:2490–:2526, option `REMINDER_ANSWER` :2316). The design's reminder kind is in `build/plan/action-fold/t18-entries.md`:60 and `docs/development/action-design/deltas.md` §4 ("a fifth … an OBLIGATION for an administrator to consider a litigation hold … clearing is its disposing door", K613 (2)).
- An op is wired in **op-declarations** (`src/op-declarations/index.mjs`: the declaration at :603, `ACTIONS_ACTIONS` :1132, capability :2151) and **affordances** (`RUNG_ABSENT` :1190, `NON_ACTS` :2640), which hold the totalities over the op table (affordances R12).
- queue-producers' Uses do not include `actions` (`modules.json`). The edge L11→L9 is legal.

### C.2 actions (L9): new clauses

Free ids: **R52, R54** (R53 is named by a test in `test/m/actions/`).

> **R52** (K899 (7), DEC-61; N-A19) A received entry marked pressure of kind `legal` (R48) may carry a litigation hold, stated by a member through `actionHold({target, ord, hold, reason, author, viewer})` (`op=actionhold`): `hold` is `in_place` (the group is preserving what the matter may reach) or `released` (it no longer is, or never needed to), with `reason` (1 to 500 characters, R22's text rule). Each statement is appended to a table of this module's own (`action_holds`: the action, the entry, `hold`, `reason`, `by`, `at`, a sequence), keyed to the action (record-core R21) and never rewritten; the latest statement for an entry is its hold. Refusals in order: `MACHINE_CANNOT_SET_HOLD` (C-117.20; an empty or machine author); `NO_TARGET`; `HOLD_REFUSED` (C-117.21; `hold` not one of the two, or the reason not as above); `NO_SUCH_BUNDLE` (absent and invisible alike); `NOT_AN_ACTION`; `HOLD_NO_LEGAL_MARK` (C-117.22; no `legal` pressure mark at that entry). Otherwise it answers `{ok, target, ord, hold, reason, by, at}`. The read (R25) shows each `legal` mark with its holds, oldest first, and its current `hold` (null while none is stated). Nothing here suspends a purge: the hold is the group's recorded statement (DEC-61's suspension of the transcript purge is device-local and not this module's).

> **R54** (K899 (7)) `holdsDue({after?, limit?, viewer})` lists every `legal` pressure mark on an action the viewer may see on which no hold is stated: the action, the entry's position, the mark's note, who marked it and when, and the action's project. Results are at most 500 per page, in (action id, position) order, with `cursor` and `truncated` as `action-clocks` R5's. The action's state is not asked: a legal matter outlives the action. It is the one read `queue-producers` uses for its litigation-hold reminder (its R19). Writes nothing.

R48 gains a sentence: "A `legal` mark may carry a litigation hold (R52)." Its table joins `ACTIONS_TABLES` (purge, R24).

### C.3 action-grammar (L9): three rows (no new R)

R9's list becomes "C-117.6–C-117.22 (`actions`' own refusals: R33, R43, R3, R13, R8, R9, R45, R46, R48, R52)". The new rows go in `ACTION_CATALOGUE_CHECKS` after :1275 and are `awaiting stamp` for the next tranche's promotion job:

> `MACHINE_CANNOT_SET_HOLD: { check: 'C-117.20', where: 'src/actions/index.mjs actionHold > is-hold', translation: 'Saying whether a litigation hold is in place is a member\'s judgement, and somebody answers for it. The credential that asked here is an automated one, so it cannot say. Sign in to record it yourself.' }`
> `HOLD_REFUSED: { check: 'C-117.21', where: 'src/actions/index.mjs actionHold > is-hold', translation: 'A litigation hold is recorded as in place or released, with a reason of up to 500 characters and no quotation mark, backslash or line break. This one was not, so nothing was written.' }`
> `HOLD_NO_LEGAL_MARK: { check: 'C-117.22', where: 'src/actions/index.mjs actionHold > is-hold-legal-mark', translation: 'A litigation hold is recorded on something the group received and marked as legal pressure. The entry named carries no such mark, so nothing was written.' }`

### C.4 queue-producers and queue (L11)

Free id for queue-producers: **R19**.

> **R19** (K899 (7), DEC-61; N-A19; `actions` R52, R54) OBLIGATIONs `litigation-hold`: one per mark `actions.holdsDue` answers the viewer (its R54), keyed `OBLIGATION::litigation-hold::<action>::<position>`, to every administrator member (`membership` R64), or the `admin` machine credential as R14's, and to the member who marked it; its subject the action, naming the entry's position and the mark's note; its `age` from the mark's instant. It leaves when a member states a hold on that mark, `in_place` or `released` (`actions` R52, the item's door). It is raised once and never repeated unless a member asks (DEC-69, DEC-70).

queue-producers' **R8** list gains "R19"; its Uses gain "`actions`: `holdsDue` (its R54; R19)" (BOB: `modules.json` `uses` edge `queue-producers → actions`).

**queue (no new R):** **R1**'s OBLIGATION list gains "litigation-hold (a reply the group marked as legal pressure: consider whether to place a litigation hold, and record it in place or released with a reason; `queue-producers` R19, DEC-61)". **R12**'s `instead` list gains "`actionhold` for `litigation-hold` (`actions` R52)" before "and `taskresolve` otherwise". R28 follows R12 unchanged.

### C.5 STARTs (Part C; Q1's lines join the same STARTs, A.4)

- **action-grammar** (new, L9, **merge early**, before actions): `Depth 2. Your entry: build/plan/current.md (T20) layer 9, action-grammar (K899 (7), DEC-61): add the three rows of your R9 (re-worded before L9), C-117.20 MACHINE_CANNOT_SET_HOLD, C-117.21 HOLD_REFUSED, C-117.22 HOLD_NO_LEGAL_MARK, to ACTION_CATALOGUE_CHECKS (src/action-grammar/checks.mjs, after PRESSURE_NO_ENTRY at :1270–:1275), each {check, where, translation} as drafted, the where naming actions' regions (actions' L9 job mints them). Proof: test/m/action-grammar/ pins the three rows (numbers, codes, wheres, translations); families and row census still green. The rows are awaiting stamp for T21's promotion job (P8). <A.4's Q1 lines>. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).`
- **actions** (append): `Also (K899 (7), DEC-61; N-A19): your R52 and R54 (new, worded before L9), after action-grammar merges. actionHold (op=actionhold, in the op map beside actionpressure, :2297) and holdsDue, as R52 and R54 say, following actionPressure's shape (:1358–:1389): the refusals in R52's order, the shape refusals under one DEC-49 region is-hold and the mark refusal under is-hold-legal-mark, each minted with action-grammar's row; the table action_holds (schema.mjs, after action_pressure :201–:210; in ACTIONS_TABLES :213–:214); the read (R25, :2045) gains each legal mark's holds and its current hold. Tests: each refusal with a negative control; in_place then released (the latest stands, both kept); holdsDue lists a legal mark until a hold is stated, never a non-legal mark, never an invisible action, and pages at 500. op=actionhold is not reachable through the door until op-declarations' L11 job declares it.`
- **op-declarations** (new, L11, **merge early**): `Depth 2. Your entry: build/plan/current.md (T20) layer 11, op-declarations (K899 (7)): declare actions' new op actionhold (actions R52) as actionpressure is declared: classes ["admin", "member", "probe"], mutating (src/op-declarations/index.mjs beside :603); in ACTIONS_ACTIONS (:1132), so its author is query-stamped; capability "contribute" (beside :2151). Proof: test/m/op-declarations/ totality green with the op present. Report the generated artifact your change stales (the plane bundle). Do not delete old suites (K619).`
- **affordances** (new, L11, merge early): `… layer 11, affordances (K899 (7)): name actions' new op actionhold in RUNG_ABSENT (src/affordances.mjs, beside actionpressure :1190, ground "undetermined": "a member states whether a litigation hold is in place on a reply marked as legal pressure, appended and never rewritten (actions R52)") and in NON_ACTS (beside :2640: "entry-directed: keyed by (action, entry ordinal); appends a hold statement and never rewrites the entry or its mark"). Proof: R12's totality test green. <A.4's Q1 lines>. Report …; Do not delete old suites (K619).`
- **queue-producers** (new, L11, before queue): `… layer 11, queue-producers (K899 (7), DEC-61; N-A19): your R19 (new; R8 and Uses re-worded before L11). Build the litigation-hold OBLIGATION from actions.holdsDue (its R54) as R18 builds action-reminder from action-clocks (src/queue-producers/index.mjs:2490–:2526): reach actions as #actionClocks reaches action-clocks (:85), page with #actionPages, key OBLIGATION::litigation-hold::<action>::<position>, recipients every administrator (as R14) and the marker, the option {id: "actionhold", label: "Record whether a litigation hold is in place", weight: "single"} (beside REMINDER_ANSWER :2316), then #optionsOf([action]). Tests: one item per unanswered legal mark; gone once any hold is stated; never to a member who is neither an administrator nor the marker; never for an invisible action. <A.4's Q1 lines>. Report …; Do not delete old suites (K619).`
- **queue** (new, L11, after queue-producers): `… layer 11, queue (K899 (7), DEC-61): your R1 and R12 (re-worded before L11). Catalogue the OBLIGATION kind litigation-hold in src/queuestate.mjs's obligation kinds (after action-reminder, :117–:118, "— LIVE: queue-producers R19"); OBLIGATION_DOORS gains "litigation-hold": "actionhold" (src/queue/index.mjs:487–:489) and OBLIGATION_DOOR_DETAIL a sentence (after :505–:507): keyed by the action and the entry rather than by a task, it leaves when a member records the hold in place or released, with a reason (op=actionhold). Tests: the item's class OBLIGATION, disposition available false with instead actionhold, and R28's bridge answering CLASS_NOT_DISPOSED with the same instead. Report …; Do not delete old suites (K619).`

**Rows:** C-117.20–.22 are new and `awaiting stamp` (T21). **Accepted red by name:** none expected. Until L11, `actionhold` exists in actions' op map but is not declared: if a control-plane or affordances totality fails on that between the L9 and L11 merges, BOB accepts it by name until op-declarations and affordances merge.

### C.6 For BOB or Bob

1. **Who may state the hold** (Bob's, a requirement). K899 says "an attributed member act"; the design (`deltas.md` §4) says the reminder is "for an administrator to consider". Drafted: any member may state it and the administrators are told. If Bob means administrators only, R52 adds `NOT_AN_ADMIN` through `membership.notAnAdmin` (its R84) after the machine refusal.
2. Drafted: either statement clears the reminder (K899's "that act is the reminder's door"); a later `released` after `in_place` is a further statement, with no new item. K613 (2)'s "if not cleared the item stays open until it is" is read the same way.
3. Kind name `litigation-hold` and op name `actionhold`: BOB's (detail).
4. No `HOLD_UNCHANGED` refusal (a repeated statement is appended); BOB may add one in PRESSURE_MARKED's pattern.

---

## Counts

- **A:** 144 outward hits in 33 modules: 44 in 11 modules of L7–11 (T20 STARTs), 100 in 22 modules of L1–6 (next tranche). One is a row (provenance C-53.13, L3, awaiting stamp). legacy-ui: 150 raw occurrences, untouched. Excluded: 58 internal, 47 build-sense, 12 SQL, 38 one-word kinds.
- **B:** intent (L7) re-words R29 and R22 and drops 3 arms in a T20 START. The next tranche carries record-grammar (L1: STATES.project, C-6.3, the slot ids) and promotion (L2: R56, C-86.15, the project fence, the stamp). reevaluation's `wp_retraction` source goes to next.md.
- **C:** actions R52 and R54, action-grammar R9 with C-117.20–.22, queue-producers R19, queue R1 and R12; op-declarations and affordances wire the op. That is six T20 jobs (L9: 2; L11: 4) and a new `uses` edge `queue-producers → actions`.
