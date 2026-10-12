# file-scanner (T47)

**Status** · session_012TNzbQZh8FxASdHwTPhvby · depth 2 · WORKING · handled B1

## Completion (FILE-SCANNER #4)

**Entry applied** · T47-67 (N990; K2816 (4), K2912): R10 met. The marker and `wrangler.jsonc` already named both images `ghcr.io/believeinoakland/<image>@sha256:<64 hex>` from the 0.82.0 cut; the two accepted reds (K3022) were the tests still pinned to T36's Docker Hub clause. Re-pinned in `test/worker.test.mjs`:
- "R10 the release's registry rule …" (replaces the Docker Hub test): each image matches `ghcr.io/believeinoakland/<image>@sha256:<64 hex>`, as agent-runner's does; each its own digest; the configuration names exactly the marker's references; no image named under another registry; no `docker.io/civicos`, `registry.cloudflare.com` or `UNPUBLISHED` in the marker, configuration or Dockerfiles.
- "R10 an instance runs each image copied by its digest …" (new, for R10's copy clause): the release's container parts (bundler `containerParts`, R25), what the deploy pulls and copies into the account's registry (bundler R26), name each class by exactly that digest reference, never a tag.
- "R10 the configuration …": the image is `<repository>@<digest>` from the marker (was `@sha256:UNPUBLISHED`); "R10 the marker …": the digest is now required (was null-or-digest).
- Control: with one configuration reference switched to `docker.io/civicos/…`, both the rule test and the configuration test fail (run, then restored).
- R18's place-word check passes: the new comments name the rule, not the namespace (agent-runner R11's exemption covers the repository values only).

**Flaws fixed in my module** · `wrangler.jsonc`'s containers comment still said the images read `UNPUBLISHED` until the release and that bundler's deploy refuses the member; it now states the rule and that the deploy copies each image by digest into the account's registry. Both Dockerfiles' build comment tagged `<repository>-scanner`/`-renderer`, disagreeing with the marker's `build.command` (`<repository>:<version>`); aligned. `fleet-member.json`'s `note` (still "digest null until then") is a bundle input, so it is left as is rather than stale the committed bundle; deferred to the next job that rebuilds the bundle.

**Read** · whole: `build/requirements/file-scanner.md`; the public parts of runtime-limits, bundler, test-support; layer 1's contract in `build/layers.md`; my entry in `build/plan/current.md`; every source file (`src/`, `src/providers/`, `container/`, `scripts/build.mjs`, marker, configuration, Dockerfiles, package statements) and every test file (`test/*.test.mjs`, `helpers.mjs`, `vendors.mjs`, `stubs/`). Reading set 475 KB at START, within the limit. No other flaw found that affects a requirement.

**Found in other modules** · none.

**Tests and checks**
- `node --test file-scanner/test/` (ClamAV 1.5.4 installed in this session so R1–R4, R6, R14, R17's ClamAV tests ran; LibreOffice and Poppler present): tests 64, pass 64, fail 0, skipped 0. Before the change: 63 tests, 51 pass, 2 fail (the two accepted R10 reds), 10 skipped (no ClamAV).
- `checks/format.mjs`: 0 failures; `architecture.mjs … file-scanner`: 0 failures; `coverage.mjs … file-scanner`: 31 of 31 live ids named, 0 failures; `ownership.mjs … tranche/T47`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures (3057 files), channels 0; coverage 3 failures, none file-scanner's (connection-grammar R21, jurisdictions R88, record-grammar R61 R62: other L1 jobs' new ids).

Size (session_012TNzbQZh8FxASdHwTPhvby): test runs 5, module lines 2510
