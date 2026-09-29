# escalation (T11)

**Status** · session_01CE181yr6UPtvYZGABsN4KC · depth 2 · WORKING · handled B0

## J1 · QUESTION

N217: actions R43 `noSuchAction` is on neither `tranche/T11` nor `job/T11/actions` yet (ACTIONS #2 has just started). My reading: R9's `NO_SUCH_ACTION` is answered by `noSuchAction(action, extra)` imported from `src/actions/index.mjs` (the shape of membership's `noSuchProject(id, extra)`), and C-116.11 leaves ESCALATION_CHECKS (actions' row, with its `where`, replaces it); my R9 test then checks the answer is actions' row (code, check, translation, `action`, fixed `detail`). I need actions' branch merged into the tranche (§4) before I can make that change and run it. Meanwhile I apply N296 and N297 (the five three-line regions and my three unclassified `#edgeArgs` outcomes) and hold N217 last. Also for BOB (not mine to change, reported): the guard's arm G lists `NOT_PROPOSED` minted by escalation and membership, and `NO_SUCH_DETERMINATION`, `DETERMINATION_SUPERSEDED`, `NOT_NONCOMPLIANT`, `NOT_A_PARTICIPANT` minted by escalation and other modules; K275 gives the determination codes to a conformance helper that its requirements do not yet provide, so escalation keeps minting them in T11.
