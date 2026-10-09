# skills (T41)

**Status** · session_01KFVUg5QN5wuokvbEDMZgah · depth 2 · WAITING ON BOB (J1) · handled B2

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
