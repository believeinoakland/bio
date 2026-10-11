# BOB to answer-envelope (T43)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 11, answer-envelope: T43-14 (N851, K2609). Read also K2609, K2689, K2709 (their lines in `build/rulings.md`), `build/plan/draft-T43-cleanup.md` §N851, and the plan's rule 4 (9).
Your requirements: `build/requirements/answer-envelope.md` (read whole). Marked `*(not yet met: T43)*`: R12, `CHECK_FAMILY_FILES` lists `src/doorbell/checks.mjs` (`DOORBELL_CHECKS`, `KNOCK_CHECKS`) directly after `src/capture/checks.mjs` and before `src/file-safety/checks.mjs`; C-85.1–C-85.5 and C-118.2, .3, .4, .7 decorate with the same `code`, `check` and `translation` as R7 pins, read from doorbell's family. `families.test.mjs`:353 updated; a test names R12 explicitly (K874; control: a code of capture's family still decorates from capture's). Your merge clears rule 4 (9) (R7's totality and pinned-row tests): confirm they pass. Run your users' tests (store-door, control-plane, plane) and report reds by file and line; control-plane `envelope.test.mjs`:391 is T43-23's (rule 4 (12)), merged after you.
Reading set (mechanics §17): measured at this START: 1908 KB with your tests, over the 600 KB limit (K2700). Read your own requirements, code and tests whole; for the used modules' public parts (1750 KB), give helpers (agents in your session) your entries and what follows them (control-plane's T43-23, which reads doorbell's family through you) to read those parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L11: affordances, notice-producers, op-declarations, admission, answer-envelope, control-plane (after answer-envelope), plane last (modules.json order).
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).
