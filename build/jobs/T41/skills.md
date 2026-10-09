# skills (T41)

**Status** · session_01KFVUg5QN5wuokvbEDMZgah · depth 2 · COMPLETE · handled B5

## J1 · QUESTION

R40's interface, and the same-layer seams, as I read them. I build on this reading unless you answer otherwise.

1. Where the guide enters. `renderPack` is pure and reads no viewer (R22, R35), and `published` is the plane's `op=affordances` answer passed in unchanged, so it cannot call `guideFor` itself. My reading: `renderPack(published, {reading_guides})`, a second, optional argument: a list of `reading-guides.guideFor` answers (its R5), one per document kind the run will read, supplied by the run's caller (agent-worker) when the run reads documents. With none, the `reading_guide` layer is a stated absence in R9's form and the pack is the same pack as today apart from the new layers. With them: `sourcing` `guide`; body `{guides: [{kind, guide, origin, items}]}`, the items only. Before rendering, each guide's items pass `reading-guides.checkGuide` (R4) and R16 runs on every item's text; a refusal from either throws, naming the guide and the item, and renders nothing. The version moves with the guide carried (R11): a run under a different guide ran under different instructions.
2. `guideFor`'s answer shape: I read it as `{guide: {id, kind, origin, items, …} | null, origin}`; I take whatever reading-guides merges and adjust at your CHANGE.
3. Registration (K2472): `skilldoctrine.mjs` calls `registerConductCheck(controlFlowAuthority)` once, at module load, importing reading-guides' entry `bio-plane/src/reading-guides/index.mjs`. A module that does not exist yet cannot be imported, so the registration, R40's `checkGuide` call, and the `uses` edge are wired when your CHANGE brings reading-guides in. The same holds for run-rules R24/R25: the `enquire` layer's mode (`ENQUIRE_MODE`), the `case_account`/`account_check` draft kinds (`DRAFT_KINDS`) and the explorer's origin (`RUN_ORIGINS`) are read from run-rules by key, never typed (R23), once it merges.
4. Order in `disclosed` (R5): after `interface_translation` and before `wizard_scripts`: `reading_guide`, `enquire`, `explore`, `reading`, `case_account`, `account_check`.
5. R41, R42 and R44's layers render always as `authored` (like `suggestions`, R35): no act of theirs is named by the requirements, so none is read from the catalogue and none throws for a missing one. Every clause is a span of `BIO_Investigation_v0_1.md` found by R21's normaliser (R43); `explore` names the investigate-mode layers it reuses by their keys (`judgementLayers()`), never copies them.

## Progress (before the same-layer CHANGEs)

Built on J1's reading, with one change to its item 4: the six new layers follow `wizard_scripts` rather than precede it, so R39's existing order pin (`interface_translation`, then `wizard_scripts`) stands; R5's key list test is extended at the end.

- **R40** `readingGuideLayer(answers)`, rendered through `renderPack(published, {reading_guides})`: a stated absence in R9's form with no guide; with guides, `sourcing` `guide`, body `{guides: [{kind, guide, origin, items}]}`, the items only. Every item's text is scanned by R16, and a find throws, naming the guide and the item. **Waiting on reading-guides' merge:** `registerConductCheck(controlFlowAuthority)` at load, `checkGuide` (R4) run beside R16, the `uses` edge to `reading-guides`.
- **R41** `INTAKE_QUESTIONS`, frozen and exported, plus the `enquire` layer (§6's interview, §8's narrative, §10's planning, §7's leads, §9's warning, §5's accepting act). **R42** the `explore` layer (reuses `judgementLayers()` by key) and the `reading` layer. **R44** the `case_account` and `account_check` layers. **R43:** every clause is a span of `BIO_Investigation_v0_1.md` found in the section it names. No clause the requirements name was missing from canon ("quote-bound" is R42's own description of §6's quote rule, not a clause). **Waiting on run-rules' merge:** the `enquire` mode (`ENQUIRE_MODE`, R24), the `case_account`/`account_check` draft kinds (`DRAFT_KINDS`, R25), the explorer's origin (`RUN_ORIGINS`, R23) and the `pages` bound (R26), each read by key.
- **A flaw fixed in this module: R38 (b) was red at START.** K2420 amended Roles §3 rule 11: the reading limit now sits inside the file sentence, and the active list is a sentence of its own. So `FILES_AS_EXTRACTED_TEXT` no longer matched. (b) is now carried as the two spans the rule holds, `FILES_AS_EXTRACTED_TEXT` and the new `ACTIVE_LIST_IS_A_FACT`. The resident boundary holds five clauses; `renderPack`'s R37/R38 guard checks all five; `boundary.test.mjs` follows, with a negative control for the new span. Every pack's version moves (R11).
- Tests: `investigation.test.mjs` (new, 8 tests: R40–R44, R16, R22, R24, R26, each with a negative control). `node --test bio-plane/test/m/skills/`: 102 pass, 0 fail. Checks: format 0, architecture 0, coverage 44/44 0, ownership 0.

## J2 · REPORT

Thank you for B2. Two things: one departure from J1 as you confirmed it, and one red found and fixed.

1. Item 4, the order. The six new layers follow `wizard_scripts` instead of preceding it. `translation.test.mjs` pins `wizard_scripts` directly after `interface_translation` (R39's test), and appending keeps that pin untouched. If you want them before `wizard_scripts`, say so in a CHANGE and I will move them and re-word that test.
2. R38 (b) was red at START, before any change of mine. K2420's amendment to Roles §3 rule 11 split the quoted sentence. (b) is now carried as rule 11's two spans (`FILES_AS_EXTRACTED_TEXT`, and a new `ACTIVE_LIST_IS_A_FACT`), and the resident boundary holds five clauses. It is fixed in this module, and nothing outside skills reads these constants.

Everything else is built and pushed: R40–R44 (R40 short of reading-guides' wiring), 102 tests pass, 0 fail, and all four checks pass. I now wait on the reading-guides and run-rules CHANGEs.

## Completion

**Entries applied** (T41-27; B1, B2 = K2479, B3 = K2485, B4 = K2487):
- **R40** `reading_guide`: `renderPack(published, {reading_guides})` takes `reading-guides.guideFor` answers (`{ok, kind, guide, origin, withheld}`). For each guide, reading-guides' `checkGuide` (R4) runs first and its refusal throws, naming the guide and the item. Then R16 runs again on every item's text, whatever is registered. The items render as the check normalised them, with `sourcing` `guide`, the kind, the guide id and the origin. With no guide passed, the layer is a stated absence in R9's form. `skilldoctrine.mjs` registers R16 once, at load: `CONDUCT_CHECK_REGISTRATION = registerConductCheck(controlFlowAuthority, "skills")` (K2472).
- **R41** `INTAKE_QUESTIONS` (frozen, the six questions of §6's sentence, in its order) and the `enquire` layer. Its `mode` is `ENQUIRE_MODE.mode` (run-rules R24). Its clauses come from §6, §8, §10 (planning: "find the record" steps), §7, §9 and §5.
- **R42** `explore`: `origin` is read from `RUN_ORIGINS` (R23), `mode` is the investigate mode read from the order, and `reuses` names `judgementLayers()` by key. `reading`: `bound` is `RUN_BOUNDS.pages` (R26).
- **R44** `case_account` and `account_check`: each in `DRAFT_MODE.mode`, with `reach` set to `DRAFT_REACH.case_account` and `DRAFT_REACH.account_check` (R25), and §11's clauses.
- **R43**: every clause of R40–R44 is a span of `BIO_Investigation_v0_1.md` found by R21's normaliser in the section it names. No clause was missing from canon, so none is reported.
- The six layers follow `wizard_scripts` (K2485).

**Fixed in this module:** R38 (b) was red at START. K2420 amended Roles rule 11, so (b) is now carried as the rule's two spans (`FILES_AS_EXTRACTED_TEXT`, `ACTIVE_LIST_IS_A_FACT`), and the resident boundary holds five clauses. Every pack's version moves (R11).

**`uses` edge for BOB to apply at merge:** `skills` → `reading-guides` (§3.6). `checks/architecture.mjs skills` fails only on this edge (2 imports: `skilldoctrine.mjs` and `investigation.test.mjs`). With the edge added locally and not committed, it gives 0 failures.

**Deferred:** none.

**Found in other modules (for BOB):**
- `answer-envelope` `families.test.mjs` and `catalogue-end.test.mjs`: 4 tests are red. The same 4 are red on `origin/tranche/T41` without my changes: the catalogue's totality tests (C-120, C-141, CHECK_FAMILIES).
- `agent-worker/test/requirements.test.mjs` fails at file level both here and on the base. `node_modules` is absent in this container.
- Neither is this module's. The agent-worker bundle (`agent-worker/dist`) reads no skills input since T18 (manifest), so no generated artifact is staled. `release/bio-plane.bundled.mjs` and `newgroup/src/release.mjs` mention the research boundary but are generated (not part of the reading set); BOB regenerates them at the layer's close.

**Reading set (mechanics §17):** I measured it as over 300 KB: my code 153 KB, my tests 159 KB, requirements 41 KB.
- **Read whole myself:** `build/requirements/skills.md`; `skillpack.mjs` and `skilldoctrine.mjs`; `BIO_Investigation_v0_1.md` (the canon R43 quotes); reading-guides' requirements, `check.mjs` and `guideFor`; run-rules R14–R26 and `deployment.mjs` (`DRAFT_KINDS`, `DRAFT_REACH`, `DRAFT_MODE`, `ENQUIRE_MODE`, `deployedModesFor`); `fixture.mjs`; the tests I changed (`boundary.test.mjs` R37/R38 parts, `pack.test.mjs` R4/R5); the draft §3.6 lines for skills; the K2420, K2448 and K2472 rulings.
- **Read by a worker in full and summarised (about 12 KB, every statement citing file:line):** the other 12 test files under `test/m/skills/`. The summary named the R5 key list, R39's adjacency pin, the sourcing set, the `decides` clause count and the R23/R24 sweeps. Those are the pins that mattered. Nothing it left out mattered.

**Tests and checks:**
- `node --test bio-plane/test/m/skills/`: 105 pass, 0 fail. This includes `investigation.test.mjs`, 11 tests on R40–R44, R16, R22, R24 and R26, each with a negative control (one is a child process with `checkGuide` stubbed, which shows R40's own R16 pass fires).
- `test/m/reading-guides/` and `test/m/run-rules/`: 83 pass, 0 fail.
- `test/m/control-plane/affordances-pack.test.mjs`: 4 pass, 0 fail.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs skills`: 2 failures, the `uses` edge above. `checks/coverage.mjs skills`: 44 of 44, 0 failures. `checks/ownership.mjs skills tranche/T41`: 0 failures.

Size (session_01KFVUg5QN5wuokvbEDMZgah): test runs 20, module lines 2,816

## J3 · COMPLETE

T41-27 complete, B4 applied. reading-guides is wired: R16 is registered at load, checkGuide runs at every render, and R16 runs again after it. run-rules R23–R26 are read by key in the investigation layers (it came in with the tranche merge). Tests: skills 105/0, reading-guides and run-rules 83/0. Checks: format, coverage (44/44) and ownership 0. Architecture fails only on the uses edge skills → reading-guides, for you to apply at merge (0 with it). Inherited reds noted for you: answer-envelope's 4 catalogue-totality tests, the same on the tranche base. Details are in my record's Completion section.

## B5 (CHANGE: run-rules merged @ 753d8164cd)

My branch already held 753d8164cd: the tranche merge for B4 brought run-rules in, and my second commit wired it. There was never a stand-in. `RUN_ORIGINS`, `DRAFT_KINDS`/`DRAFT_REACH`, `ENQUIRE_MODE` and `RUN_BOUNDS.pages` are read by key. `checkPagesRead` and the test bar (run-rules R19, R26) are not services skills' requirements name: the pack carries the reading bound's description, and judging pages read or the bar is the plane's, not this pack's (R24). So neither is imported. Re-run on the merged branch: skills 105/0, run-rules and reading-guides 83/0.

## J4 · COMPLETE

B5 applied: my branch already held run-rules @ 753d8164cd from B4's merge, and every run-rules name I use is read by key, with no stand-in. checkPagesRead and the test bar are not mine to call (R24), and my record says why. skills 105/0, run-rules and reading-guides 83/0. The uses edge skills → reading-guides is still yours at merge.
