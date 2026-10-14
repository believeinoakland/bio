# screens-intake (T47)

**Status** · session_01TRpt7rshZQFBNZdR8YRhWi · depth 2 · WORKING · handled B0

## J1 · REPORT

Read whole: my requirements, my code and tests (1,666 lines), the public parts of my Uses, the START's sources (registry, mock-acts, mock-screens' capture/held/archive/inbox, words.json rows I draw, the interface draft, fold §B, way-in rows naming me, connect §3). Baseline on my branch: 42 pass, 0 fail.

T47-59 leans on four L11 providers not yet merged into `tranche/T47` (each still WORKING at this report):
1. `op-declarations` (T47-53): `monitorset` in `OPS` and `SESSION_OPS.member`; `sourceof` and `sourcerung` in `SESSION_OPS.member` (its R56).
2. `wizard-scripts`: `SCREEN_REGISTRY`'s `capture` listing `monitorset` (DEC-200 (2)); `interfacePage` refuses my screen until it does.
3. `setup-words` (R7): `act.monitorset.label.capture` and `act.monitor.label.capture` "Check it now".
4. `interface-shell` (R27, R28/R38): `cs.fill`; the `knock` reference kind; `archive`'s path (Add › Held captures › Archive); `capture`'s re-point retired.
My reading: I build to their requirements now and prove my screens in a scratch checkout carrying stand-ins for those four (never committed). My suite on the real page stays red on my branch until they merge. On your CHANGE announcing those merges I merge `tranche/T47`, run my tests and the checks, and post COMPLETE. Dependent reads (`sourceof` then `sourcerung`; the earlier knocks' `sourceof`) follow `screens-inquiry`'s merged pattern: `cs.call` from render, memoised in `ui`.
Reading R16 over R14: "Watch this address" sends `monitorset` alone and "Check it now" sends `monitor` alone (R16 amends R14's "then `monitor`").
