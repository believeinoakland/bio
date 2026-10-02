# provenance (T25)

**Status** · session_015S38x6eWCQ3i11cv9DGEP2 · depth 2 · RUNNING until 2026-10-02T18:30:16Z (node --test test/m/ (whole suite, per-test timeout 60s)) · handled B5

## J1 · QUESTION

**Option B and `attest`.** `acquisition/index.mjs`:30 and `capture/index.mjs`:28 import `attest` by name from provenance. With `attest` deleted (your START (2): it is not pure, since it fetches through an injected `fetch` and puts a token through an injected `put`, though it reads and writes no table), every module whose tests load capture or acquisition fails at import time: `test/m` goes from 0 fail to **520 fail** (497 files report `does not provide an export named 'attest'`), not only acquisition's and capture's own tests. That red lasts until acquisition's and capture's L3 merges.

**My reading, which I am following:** delete `attest` and `attestStatus` as your START says. The import red joins red 7 ("any user of a name moved"), and I list it in COMPLETE.

**The alternative, if you prefer it:** keep a stateless copy of `attest` (with its imports from `tsa.mjs` and `isPublicHttpsLocator`) under the N516 comment until acquisition and capture re-point. It writes no table, so the one-writer rule holds. All other moved names are already gone, and `routeFinding`, `instanceStatement`, `ROUTE_MARK_CHECKS` and `ATTEST_CHECKS` are kept as pure copies. Answer only if you want the alternative; until then I carry on with deletion.

## J2 · QUESTION

**B2–B4 applied** (7364e558fd): a stateless `attest` copy (K1226); no `ROUTE_MARK_CHECKS` or `ATTEST_CHECKS` copy (K1225); the three tables dropped from purge, `PROVENANCE_TABLES` and the schema; no `route` finding and no `routeMarks` figure registered; C-103.3's `where` names both sites (K1227).

**`attestOp`, the same case as J1.** `plane/door.mjs`:12 imports `attestOp` by name. With it deleted (red 9), the Worker cannot load, so `test/m/instance-setup/worker-page.test.mjs` and `worker-reports.test.mjs` **hang** instead of failing: `node --test test/m/` never finishes, even with `--test-timeout`. Any job's proof run would stall until plane's L11 merge.

**My reading, which I am following:** apply K1226's reason to it as well. I keep a stateless `attestOp` copy in `ops.mjs`, over the `attest` copy, with `attestStatus` private to it, under the N516 comment. It reads and writes no table. With it, both files pass (18/18). Answer only if you want it deleted instead; until then it stays, and I list it in COMPLETE.
