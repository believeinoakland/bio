# money-checks (T34)

**Status** · session_01MpQBTQK1viDrQCcALeRFUX · depth 2 · RUNNING until 2026-10-06T18:25:10Z (users' tests (scheduler, notice-producers, affordances, op-declarations, control-plane, plane)) · handled B1

## J1 · QUESTION

R6 (N607) and R5/R9: what "switched on" means for a detector with no switch act in a project. Today `#switchedOn` reads "on unless the latest act switched it off" (`detectors` answers `default_switch: "on"`), so every project has every detector on by default, and R6's "a detector switched on in no project is skipped ... an instance where no project switches a detector on keeps no detector work" could never hold while any project exists (the shipped detector would keep the daily alarm N607 is about).

My reading, which I am building on: a detector is switched on for a project only when the latest `switchDetector` act for that project switched it on; with no act it is off. So: R6 runs only detectors with at least one project whose latest act is on (a detector switched on nowhere is skipped, its held results dropped as a derived cache with nothing to run over, and `rebuild` agrees); R9 `noticed` shows a gated detector's results only in a project that switched it on; `detectors` answers `default_switch: "off"`; R16 notifies on an act that turns a detector on where it was off (no act, or latest off), and on nothing else. No requirement text changes under this reading; if you read it the other way (default on), R6's N607 clause needs other wording and I would apply it.
