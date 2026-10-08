# bundler (T37)

**Status** · session_01XAuQvFSnT4Qjvv3ReZ1VHj · depth 2 · COMPLETE · handled B0

## Completion

**Read whole** (mechanics §17, N739): `build/requirements/bundler.md`; the public parts of `signatures` and `test-support`; `build/layers.md`'s layer-1 contract and helper-module section; the plan's entry T37-3, its rules at the opening and K2155; every file of the module's `paths` and `tests`; and, for the part's reader, `newgroup/src/index.mjs`'s R38/R44 section (`workerDescriptor`, its upload). BOB's START measured the set at 221 KB, under the 300 KB limit.

**Entries applied (T37-3).**
- (N772; K2155; R25) A member whose `wrangler.jsonc` binds R2 buckets or states crons carries one more part, type `Worker`, path `worker.json`: `{r2_buckets: [{binding, bucket}], crons}`, copied from its config. `bucket` is the role, from the bucket name the project's configs use (`bio-captures` → `captures`, `bio-published` → `published`), never an account's bucket name; `crons` are `triggers.crons` as stated. A member with neither (both empty) gets no part. `fleet-bundle.mjs` exports `workerPart(cfg)`, `WORKER_PART_PATH` and `BUCKET_ROLES`; `release-assemble.mjs` checks every carried member before any build or write, adds the part beside its others (so the fleet signature covers it; `bio-release-fleet/2` unchanged), writes it under `release/<member>/worker.json` and lists it in `RELEASE.json`. A bucket with any other name, or no binding name, is refused `[WORKER_UNDESCRIBED]` naming each binding; `r2_buckets` or `triggers.crons` that is not a list (of non-empty strings) is refused the same way, naming it (copy-never-default, as for the container part); a member's own upload part at `worker.json` is refused too.
- In the real tree the part goes to four members: `file-scanner` (`CAPTURES` and `17 4 * * *`), and `pdf-worker`, `ocr-worker`, `sheet-worker` (`CAPTURES` each). Every real bucket has a role (tested).
- (N767) `system/fleetbundles.test.mjs`:219's comment now says agent-worker read `op=affordances` until T36-24 and reads `op=agentpack` since (K2135).

**Improvements in my own module.**
- `system/bundle.test.mjs` was red on this tree before any change of mine (it crashed on `lf.assertions`): it sent the probe token in the query, which the plane refuses since C-38.10 (`CREDENTIAL_IN_ADDRESS`). It now sends it in the Authorization header: livefire 19/19, confinement refused, exit 0. Nothing weakened: the same three asks, the same exit rule.
- `m/bundler/thirdparty.test.mjs` carried one R28 test twice, verbatim; the copy is removed.

**Deferred:** none.

**Found in other modules** (in my COMPLETE):
- `installer` (R44): no installer test turns red or green. Its tests build their releases in the test and read the committed `release/RELEASE.json`, which no job changes; the part reaches a group at the next release cut. Then `pdf-worker`, `ocr-worker` and `sheet-worker` are also installed with their `CAPTURES` binding (they carry the part too); today the installer installs them without it. `newgroup`'s `workerDescriptor` accepts the part as written (tested from bundler's side).
- The real `release-assemble.mjs --dry-run` still stops at `[CONTAINER_UNDESCRIBED]`: `agent-runner`'s marker states no `image.digest` (written when the release first publishes the image, T33-D1). That is not new, and not this job's.

**Tests and checks** (from the repository root, then from the process repository):
- `node --test bio-plane/test/m/bundler/*.test.mjs` → 91 pass, 0 fail.
- `node bio-plane/test/system/fleetbundles.test.mjs` → 129 pass, 0 fail, no SKIP (after `npm ci` in `sheet-worker/`, `agent-runner/`, `file-scanner/`).
- `node bio-plane/test/system/deploybindings.test.mjs` → 37 passed, 0 failed; `resolveversion.test.mjs` → 12 pass, 0 fail; `bundle.test.mjs` → exit 0 (livefire 19/19); `newgroup-bundle-fresh.test.mjs` → 4 passed, 0 failed; `node bio-plane/scripts/bundles.mjs --check` → every guarded bundle fresh (no generated artifact staled).
- `newgroup`: `node --test test/requirements.test.mjs` → 49 pass, 0 fail, 3 todo (as at K2164).
- `format`: 0 failures; `architecture … bundler`: 0 failures; `coverage … bundler`: 30 of 30 live ids named, 0 failures; `ownership … bundler tranche/T37`: 0 failures (re-run after the commit).

Size (session_01XAuQvFSnT4Qjvv3ReZ1VHj): test runs 12, module lines 8073
