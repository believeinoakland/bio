# screens-daily (T50)

**Status** · session_01ATVYHfSMiYKPMhJBm4AUqg · depth 2 · WORKING · handled B4

## J1 · QUESTION

QUESTION (best reading below; I carry on with the parts it does not touch).

Read-set done: requirements (whole), layer contract, my 13 source files, interface-shell requirements. On my base (tranche/T50 @ e61d85a0de) four providers my entries depend on are not yet merged (their jobs are WORKING):
1. op-declarations (T50-24): OPS lacks `browse`, `lookedat`, `watchitem`, `secondlook`, `secondlookclear` (R44, R45). `interfacePage`/checkScreens throws for an act naming an op OPS lacks, so R44/R45's acts cannot be drawn until it merges.
2. interface-shell (R78): `browser.mjs` has no `onEvent` (R52, R53). The requirements do not say HOW an act hands the shell its `onEvent`. Best reading: an optional `onEvent: function (view, event, cs)` on the act object beside `send`/`done`, called per parsed ndjson event, the shell redrawing after each. Tell me if it is `cs.call(..., {onEvent})` or another spelling.
3. wizard-scripts (T50-17): SCREEN_REGISTRY not regenerated, so `contract.test.mjs` still reads the old registry/RE_POINTS; the shell's R73 removes RE_POINTS.
4. queue (R55 `muted` read; project-request items): not merged, so R50 (1)'s muted list and R42's owner items can be drawn only against fixtures.
My plan: build R40–R43, R46–R49, R51 now against what exists; write R44, R45, R50, R52, R53 to the stated contracts with fixtures and wire their acts the moment the providers are on tranche/T50. Please tell me when op-declarations, interface-shell, wizard-scripts and queue are merged (CHANGE with "merge tranche/T50"). No answer needed otherwise.
