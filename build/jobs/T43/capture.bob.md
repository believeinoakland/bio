# BOB to capture (T43)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 3, capture: T43-8 (N849, N863, N864). Read also K625, K2607, K2672, K2680, K2689 (their lines in `build/rulings.md`), `build/plan/draft-T43-cleanup.md` §0, §N849, §N863, §N864, and the plan's rule 3.
Your requirements: `build/requirements/capture.md` (read whole). Marked `*(not yet met: T43)*`: R37 (the doorbell rows no longer defined here), R58 (a repeat `captureOf` supplying no option reaches no other instance and creates no table: compare `acquisition` only when supplied, `index.mjs`:264–265) and R87 (`declareTables()` declares only when every one of its tables exists, `declared: false` before). And N849: delete the doorbell copy capture kept after T42-7 (its doorbell code, `KNOCK_CHECKS`, the nine rows in `checks.mjs`; every user re-pointed to `doorbell` in T42: check none still imports it, `git grep` over `bio-plane/src`). Tests: `knocker.test.mjs`:210–250 (R37: the moved rows absent; control: capture's own rows present), `evidence-absent.test.mjs`:26–27, `t42.test.mjs`:23–35 and :41–43 (R87: before migrate none declared; after, every table; a table still capture's), a new `t43.test.mjs` for R58 (twice `captureOf(ctx)` on a host whose acquisition was never reached: the table list unchanged, `archive_entries` and `unpack_days` absent; control: a different `acquisition` supplied still throws R58) (K874). Your merge clears rule 4 (8) (action-clocks `overdue`:151, action-plans `invariants`:50: confirm they pass) and, with doorbell's second merge, rule 4 (5); from your merge answer-envelope's R7 totality is red until T43-14 (rule 4 (9), accepted). Run your users' tests and report reds by file and line.
Reading set (mechanics §17): measured at this START: 1,046 KB with your tests, over the 600 KB limit (K2700). Read your own requirements, code and tests whole; for the used modules' public parts (400 KB), give helpers (agents in your session) your entries and what follows them (doorbell's second merge, answer-envelope's T43-14) to read those parts in full and write you a digest of what your entries need, each statement citing its section (K2032, mechanics §17 (3)); the sources stay binding. State in your record how the set was read.
Merge order in L3: doorbell first; you second, after doorbell's first merge is on `tranche/T43` (merge it into your branch before you complete); then doorbell again.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · ANSWER · re J1

(b) adopted (K2708): keep `sourceFingerprint` and `#knockKey` as a named held copy answering no requirement (a comment naming K2708 and N870), declaring no table; delete everything else of the copy. Admission re-points in T43-21 (L11), and your next job deletes the held copy (N870, T44). Say in your record which lines stay and why.

## B3 · CHANGE

Doorbell's first merge is on `tranche/T43` (K2709): merge it into your branch, run your users' tests (answer-envelope R7's totality is accepted red, rule 4 (9)), and post COMPLETE.
