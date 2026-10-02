# intent (T22)

**Status** · session_016UvGqHeQmeB5Sdj9mw2LCb · depth 2 · WORKING · handled B2

## J1 · QUESTION

R18's "the reason is recorded on the run's opening and shown with its budget and scope": ai-runs' `open` (R9, R10) offers two places that its `read` (R19) shows beside `budget` and `context`: `label` (stored at open, never changed by a tick; `bio-plane/src/ai-runs/index.mjs`:985–990, read at :1727) and `state` (shown, but replaced by any tick that sends one, R12, so it is not a durable record of the opening). Neither needs an ai-runs change.

My best reading, which I am building now: `workObjective` passes the member's reason (trimmed) as the run's `label`, which wins over any `label` the caller put in `run`, so `read` and `listInContext` answer it as `session.label` with `budget` and `context` for the run's life; it also carries `reason` inside `state.instructions` beside the objective, condition, gaps and authority, so the assistant reads it, and in its own answer. If you want it elsewhere (e.g. state only, or a field ai-runs adds), answer and I will bring it in line.

## J2 · REPORT

For acceptance or routing (P4), before my merge. (1) Stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product) are stale from src/intent/index.mjs (fleetbundles §8: STALE BUNDLE, and a fresh build is not byte-identical); not regenerated (manifest, "Generated artifacts"). (2) Callers: re-grepped `setCondition(`, `workObjective(`, `objectivecondition`, `workobjective` over bio-plane/, agent-worker/, civicos-ui/ on job/T22/intent: no caller in another module. Only names: affordances (src/affordances.mjs:1176, :1181 the `is` sentences, :2622, :2645; RUNG_ABSENT, L11) and op-declarations (src/op-declarations/index.mjs:536, :552, :1134–1135, :2165, :2174), and test/m/affordances/catalogue.test.mjs:407–408. No red from this change. (3) An improvement in another module, for affordances' L11 job: its `is` sentences for `objectivecondition` (:1176) and `workobjective` (:1181) do not say the act now takes the member's reason (intent R2, R18; DEC-88), which its `reasoned` rung would name. (4) Reds in the whole test/m (4871 tests, 9 fail): all accepted by name, none new: actions t18.test.mjs:299; scheduler plane.test.mjs:85; queue-producers proposals.test.mjs:39 (4 tests); case-authoring members.test.mjs:129; control-plane doorbell.test.mjs:310 and catalogue-end.test.mjs:15. Cleared: intent's fixture (all intent tests) and affordances backing.test.mjs R19. row-census red as accepted (red 3); it lists no intent row: no row changed.
