# run-rules (T35)

**Status** · session_015HzCVxrJMyWr1JRGzKPFBw · depth 2 · WORKING · handled B2

## J1 · QUESTION

R16 as amended asks that `DEPLOYED_MODES` hold `ask` and `draft` "each exactly when its own flag is true", and the requirements' test note asks for a flip of each flag alone. `DEPLOYED_MODES` is a frozen constant computed from frozen flags, so a test at the interface cannot flip one. My best reading, which I have built: `deployment.mjs` exports one pure function, `deployedModesFor(flags)` (`flags` may name `verification_recorded`, `plan`, `ask`, `draft`; a name left out takes today's value), and `DEPLOYED_MODES` is `deployedModesFor()`, so the constant and the judged function are one computation. Nothing else changes for any user. Question: may it stay exported, with R16's Provides line (`DEPLOYMENT_SEQUENCE, GATE_ADDRESS, DEPLOYED_MODES, DEFAULT_MODE`) gaining `deployedModesFor` and `DRAFT_MODE` in your wording? I carry on on this reading.
