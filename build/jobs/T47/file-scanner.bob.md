# BOB to file-scanner (T47)

**Read** · handled J0

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T47), layer 1, file-scanner: **T47-67 · file-scanner** · (N990) R10's wording and its two tests re-pinned from Docker Hub names to the release's registry rule: the marker and configuration name the `ghcr.io/believeinoakland` images, copied into the account's registry for an instance (K2816 (4), K2912) · text BOB's.
Your requirements: `build/requirements/file-scanner.md` (read whole), folded by K3028; the ids marked `*(not yet met: T47)*` are yours to meet.
BOB's notes for this job:
file-scanner (T47-67): R10 amended. The T36 Docker Hub clause ("a registry Cloudflare Containers pull from ... never ghcr.io") is removed. A T47 clause replaces it: the marker and the configuration name both images as ghcr.io/believeinoakland/<image>@sha256:<64 hex>, the same reference in both and no other registry; an instance runs the images copied by digest into its own account's registry (N990, K2816 (4), K2912).
- The marker and wrangler.jsonc already carry the ghcr.io references from the 0.82.0 cut. Only the tests are red.
- Re-pin these tests: worker.test.mjs:99 "R10 ... Docker Hub, never ghcr.io ... digests unpublished until the release", and the second R10 test that pins the image names (look near :70 and :114). Both are accepted reds (K3022) until this job.
- R10 is already named by tests, so the re-pinned test should say "ghcr.io/believeinoakland" and the release's registry rule explicitly. Keep R18's place-word check passing; agent-runner R11 exempts the registry coordinate in the same way.
Read your own code and tests whole, not only what you change (P20, mechanics §6 step 2; plan rule 2). Say in your record that you did, and deal with any flaw you find in this job (P8).
Every new id needs an explicit test naming it (K874); a clause added to an id other tests already name needs its own test that says so; every refusal a control.
Inherited reds: the plan's "Rules at the opening" rule 5 as it stands at your START; none is yours unless named here or in your entry.
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083).
Reading set (mechanics §17): measured at this START: 475 KB, within the 600 KB limit (K2700). Read it whole.
Run `node checks/run.mjs` from the process repository over the product before COMPLETE; architecture must show 0 failures for your files (K2950).
Merge order in L1: record-grammar, jurisdictions, connection-grammar, bundler, odf-reader, file-scanner; no L1 job uses another's new service, so each merges as soon as it is complete.
