# BOB to doorbell (T43)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T43), layer 3, doorbell: T43-7 (N851, then N864). Read also K2607, K2609, K2680, K2689 (their lines in `build/rulings.md`), `build/plan/draft-T43-cleanup.md` §0, §N851 and §N864, and the plan's rule 3.
Your job has **two merges** (rule 3). **First (now):** R21: C-85.1–C-85.5 and C-118.2, .3, .4, .7 defined in `src/doorbell/checks.mjs` alone, no longer re-exported from capture's `checks.mjs` (`rows.test.mjs`:22–36: drop the "one row, not a copy" arm and the identity with capture's `KNOCK_CHECKS`; add that your rows carry the same `code`, `check`, `translation` as today). R25's tests written to your own ownership; keep the `capture.declareTables()` call and the held arm in code for now. Post COMPLETE; BOB merges you first in L3. **Second (after capture's merge, by BOB's `CHANGE`):** R25's appended sentence: no `capture.declareTables()` call (`index.mjs`:168), no held arm (:170); `instance.test.mjs`:46, :53 expect `["doorbell", "exempt"]`, :48–53 assert capture's migrate then declares its own tables without throwing, :76–77's held case becomes a throw; COMPLETE again (clears rule 4 (5) with capture's delete). Test each marked id explicitly with a negative control (K874). Run your users' tests (sources, actions, answer-envelope, store-door, control-plane, plane) after each step and report reds by file and line; answer-envelope's R7 totality goes red at capture's delete and is accepted (rule 4 (9)).
Reading set (mechanics §17): measured at this START: 540 KB with your tests, under 600 KB (K2700): read it whole and state so in your record.
Merge order in L3: doorbell, capture, doorbell again.
Inherited reds: the plan's "Rules at the opening" rule 4 as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083).

## B2 · CHANGE

Capture's delete is merged (K2710). Your second merge now: merge `tranche/T43` into your branch, then R25's appended sentence (no `capture.declareTables()` call, `index.mjs`:168; no held arm, :170), `instance.test.mjs` as your START says (including the case CAPTURE #27 J3 reports red now: "a running store's inbox … capture's rows are doorbell's rows", whose ownership arm now holds). Run your users' tests; answer-envelope R7 (rule 4 (9)) and the rule 4 (12) reds are accepted. Then COMPLETE again; this clears rule 4 (5).
