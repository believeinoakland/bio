# control-plane (T18)

**Status** · session_0186jCyJmRTyxZqB9kJXtScm · depth 2 · WORKING · handled B0

## J1 · QUESTION

Two points, each with my best reading; I carry on with the rest meanwhile (none blocks what I do next).

1. **Uses.** My entries make control-plane import modules it does not declare, which the architecture check refuses: `text-chain` (`textchain.mjs`' `TEXT_CHAIN_CHECKS`, N414), `acquisition` (its `checks.mjs`, the plan's "acquisition's and run-rules' tables"), `monitoring` (`MONITORING_CHECKS`, K717) in `CHECK_FAMILIES`; and in the tests, `agent-worker` (`PLANE_OPS`, `NAMESPACES`, `SUBSESSION_OPS`, K683) and `ocr-worker` (`contract.mjs`' `PLANE_OPS`, `NAMESPACES`, N413) for the N402 pin. All are earlier in the order. Best reading: you add the five to control-plane's `uses` in `modules.json` on `tranche/T18`; I merge it before my checks.

2. **K701 (filings' `communicationprepare`, `templatesave`, `templates`).** Since the split, an op's spec is `op-declarations`' (its R2), not mine, and its layer-11 entry names `communicationprepare` but not `templatesave` or `templates`. Best reading: op-declarations writes the three specs (its paths); I stamp them (R17, R29): `communicationprepare` `preparer` and `viewer` (filings R23), `templatesave` `author` and `viewer`, `templates` `viewer` (filings R26), by the action layer's expressions, and test them through the door once the specs exist. If op-declarations merges without the two, I report it and stamp what exists.

Also, for your record (K669, no answer needed unless you disagree): `op=linkproject`'s refusal reaches the caller at 200 because connections' handler answers it so (`json({ok: true, ...p.result})` in `connections/ops.mjs`, the route's own `{ok: false}` overriding the spread). The door keeps a handler's answer and its status (R21) and decorates a refusal at either level (R22); the store's envelope is `{ok: true, result}` for a route's answer (R26). So R21 and R26 hold it as it is; the status of a module's refusal is the module's handler's to choose (connections), not the door's.
