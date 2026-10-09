# skills (T41)

**Status** · session_01KFVUg5QN5wuokvbEDMZgah · depth 2 · WORKING · handled B0

## J1 · QUESTION

R40's interface, and the same-layer seams, as I read them. I build on this reading unless you answer otherwise.

1. Where the guide enters. `renderPack` is pure and reads no viewer (R22, R35), and `published` is the plane's `op=affordances` answer passed in unchanged, so it cannot call `guideFor` itself. My reading: `renderPack(published, {reading_guides})`, a second, optional argument: a list of `reading-guides.guideFor` answers (its R5), one per document kind the run will read, supplied by the run's caller (agent-worker) when the run reads documents. With none, the `reading_guide` layer is a stated absence in R9's form and the pack is the same pack as today apart from the new layers. With them: `sourcing` `guide`; body `{guides: [{kind, guide, origin, items}]}`, the items only. Before rendering, each guide's items pass `reading-guides.checkGuide` (R4) and R16 runs on every item's text; a refusal from either throws, naming the guide and the item, and renders nothing. The version moves with the guide carried (R11): a run under a different guide ran under different instructions.
2. `guideFor`'s answer shape: I read it as `{guide: {id, kind, origin, items, …} | null, origin}`; I take whatever reading-guides merges and adjust at your CHANGE.
3. Registration (K2472): `skilldoctrine.mjs` calls `registerConductCheck(controlFlowAuthority)` once, at module load, importing reading-guides' entry `bio-plane/src/reading-guides/index.mjs`. A module that does not exist yet cannot be imported, so the registration, R40's `checkGuide` call, and the `uses` edge are wired when your CHANGE brings reading-guides in. The same holds for run-rules R24/R25: the `enquire` layer's mode (`ENQUIRE_MODE`), the `case_account`/`account_check` draft kinds (`DRAFT_KINDS`) and the explorer's origin (`RUN_ORIGINS`) are read from run-rules by key, never typed (R23), once it merges.
4. Order in `disclosed` (R5): after `interface_translation` and before `wizard_scripts`: `reading_guide`, `enquire`, `explore`, `reading`, `case_account`, `account_check`.
5. R41, R42 and R44's layers render always as `authored` (like `suggestions`, R35): no act of theirs is named by the requirements, so none is read from the catalogue and none throws for a missing one. Every clause is a span of `BIO_Investigation_v0_1.md` found by R21's normaliser (R43); `explore` names the investigate-mode layers it reuses by their keys (`judgementLayers()`), never copies them.
