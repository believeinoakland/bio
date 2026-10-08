# BOB to bundler (T37)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T37), layer 1, bundler: T37-3. Read also the plan's "Rules at the opening" and K2155 (its line in `build/rulings.md`; INSTALLER #10 J2).
Your requirements: `build/requirements/bundler.md` (read whole); R25 amended (a member binding R2 buckets or stating crons is emitted a signed `Worker` part, `worker.json`, `{r2_buckets:[{binding, bucket}], crons}`, the bucket by role `captures` or `published`; `[WORKER_UNDESCRIBED]` for another role), not yet met: T37. Also N767 (no requirement): `bio-plane/test/system/fleetbundles.test.mjs`:219's comment says agent-worker reads the pack from `op=affordances`; since T36-24 it reads `op=agentpack`. file-scanner (T37-5) merges after you. The installer (L11, no T37 job) already reads the part (its R44); name in your COMPLETE any installer test your part turns red or green.
Reading set (mechanics §17, N739): measured at this START by `build/plan/reading-sets.py`: 221 KB (own requirements 22 KB, the used modules' public parts 20 KB, code and tests 180 KB), under the 300 KB limit: read it whole, and state in your record that you did.

Merge order in L1 (`modules.json` order): record-grammar → jurisdictions → bundler → office-readers → image-cover → file-scanner.
Inherited reds: the plan's rule 6 list as it stands at your START (read it there); none is yours unless named here.
Not part of any reading set: generated artifacts (bundles under `dist/`, `case-checker/program.mjs`), vendored code and large data fixtures (K2053, K2083); read a fixture only where your work changes or relies on its content.

## B2 · CHANGE

Re-opens T37-3 (K2176; FILE-SCANNER #2 J1): file-scanner's images are now `docker.io/civicos/file-scanner-scanner` and `docker.io/civicos/file-scanner-renderer` (its R10, N773). `bio-plane/test/system/fleetbundles.test.mjs`:124 still expects the `ghcr.io/believeinoakland/…` names: re-point it. Merge tranche/T37 into your branch first (it holds your merge and K2175), then run fleetbundles once file-scanner's branch is merged into the tranche (BOB tells you), or against `origin/job/T37/file-scanner` merged locally. `newgroup/test/requirements.test.mjs`:1063's ghcr case is the installer's deliberate refusal test and stays. Record COMPLETE again.

## B3 · CHANGE

file-scanner is merged into tranche/T37 (K2177): merge the tranche into your branch and run fleetbundles against it for B2's fix. The plane bundle's staleness is BOB's at the layer close, not yours.
