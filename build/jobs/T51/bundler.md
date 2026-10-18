# bundler (T51)

**Status** · session_01Tfsgwbtwh4oCYrrgbCtzBG · depth 2 · WAITING ON BOB (J4) · handled B4

## Record (BUNDLER #21, B3: T51-144)

**Entries applied (T51-144, R36 second half: the two digests agree)**
- **Real fleet (`bundler.test.mjs`, R36 · T51-144):** `digestDisagreements(members)` compares, for each container class, the marker's `image.digest` with the digest the `wrangler.jsonc` `containers[]` entry of the same `class_name` names; it returns the disagreeing classes as text naming the member and the class. The real-fleet test holds it empty over `discoverMembers()` and counts the three classes (agent-runner's `AgentRunner`, file-scanner's `FileScanner` and `SafeViewRenderer`). Today the real pairs agree: agent-runner `954ac088…`, file-scanner `38d314ed…` and `27941d2a…`, the same in `fleet-member.json` and `wrangler.jsonc`. The test reads those files and never edits them.
- **Control (fixture, R36 · T51-144):** a fixture member whose `wrangler.jsonc` digest is rewritten to a second digest fails the test with exactly `runner Runner: fleet-member.json names <digest>, wrangler.jsonc names <other>`; the same fixture with the digests equal passes.
- **`--record-image` writes both (B3 note 2):** no change was needed. `recordContainerDigest` already writes `fleet-member.json` and `wrangler.jsonc` in one call, both or neither (refusals run before either write). The CLI test `release.test.mjs` R36 (the `--record-image` subprocess test) already asserts both files name the new digest and agree, so I did not duplicate it.

**Deferred / not done**
- Nothing deferred. `recordContainerDigest` still writes `fleet-member.json` before `wrangler.jsonc`, so a failure of the second write would leave the first written; both writes follow the refusal checks, so no refusal leaves one file changed. Not in T51-144's words; noted for BOB.

**Reports (not my module, or for BOB)**
1. The three real-fleet reds recorded at BUNDLER #20 (R24 and R35 real-fleet tests, and `fleetbundles` "agent-runner and file-scanner are listed as container members") are green on this tree: the members' markers now name `docker.io/civicsmith/…` (file-scanner T51-9 and agent-runner T51-64 have merged). Nothing for BOB to do there.
2. The real markers still record no `source_sha256`, so the assembly refuses `CONTAINER_IMAGE_STALE` until the cut's `--record-image` runs (BOB's act at the cut, per the plan's BOB's acts; the workflow is not edited). Unchanged from #20.

**Tests and checks** (from `/home/user/bio/bio-plane`, and the process repository)
- `node --test --test-name-pattern='T51-144' test/m/bundler/bundler.test.mjs`: 2 pass.
- `node --test` over `test/m/bundler/bundler.test.mjs`, `release.test.mjs`, `thirdparty.test.mjs`, `test/system/bundle.test.mjs`, `deploybindings.test.mjs`, `resolveversion.test.mjs`, `fleetbundles.test.mjs`: 122 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 33 failures, none in bundler (`coverage.mjs bundler`: 37 of 37 live ids named, 0 failures); words 2,821 failures repo-wide, none in bundler's files (T51's words pass and the R1 re-run carry them).
- `node checks/ownership.mjs /home/user/bio bundler tranche/T51 job/T51/bundler`: 0 failures (one file changed by bundler: `bio-plane/test/m/bundler/bundler.test.mjs`).

Size (session_01Tfsgwbtwh4oCYrrgbCtzBG): test runs 4, module lines 3802

## Record (BUNDLER #20)

**Entries applied (T51-5)**
- **R16, R17, R19 (K3807, K3814):** `deploy.mjs`' `NOT_A_PLANE.civicos` and its comment removed (the old Worker is an ordinary slug now); `deploy-fleet.mjs`' `NOT_A_FLEET_MEMBER` message and two comments no longer name `civicos` or `civicos-ui/deploy-ui.mjs`; `build-plane.mjs`, `fleet-bundle.mjs`, `bundles.mjs` and `provenance.mjs`:14 comments no longer describe `embed:sign` or `civicos-ui/test/`. `build-plane.mjs` itself never called `embed-signpage.mjs`; only the package script chained it (see Reports).
- **R35 (N1242):** explicit tests of the new R35 (`bundler.test.mjs`): the real-fleet-image test (K2266) reads the three markers and holds each `image` to `docker.io/civicsmith/<repository>@sha256:<64 hex>`, with the control (a marker naming another registry is emitted as written by R25 and the real-fleet test fails on it). `fleetbundles.test.mjs`' pinned list and R24's real-fleet test re-pointed to `docker.io/civicsmith/…`. R24/R26's fixtures already name `docker.io/<org>/…@sha256`. The only other file that spelled the token (`deploybindings.test.mjs`'s comment "subresources R35") is reworded so the old naming cannot mask the new id.
- **R36, R37 (N1210, K3674):** the field is `image.source_sha256` in each class's `image` block, beside `digest`: the SHA-256 of the files the image is built from — the class's Dockerfile (`build.dockerfile`, on the class or the member) and every file or directory it `COPY`s/`ADD`s from the member's directory, each hashed with its member-relative path, in path order (`fleet-bundle.mjs`: `containerSourceHash`). `containerImageStates`/`containerImageFindings` compare it with the files now (states `current`, `stale`, `unrecorded`, `unread`; a wildcard, an address or a path outside the context is `unread`, never skipped). `release-assemble.mjs` refuses `[CONTAINER_IMAGE_STALE]` naming the member and the class, before anything is built or written, for any state but `current`.
- **How the step and the workflow meet (R36):** the image is built by the workflow `container-images.yml` (BOB's), never in a session. The workflow asks `node bio-plane/scripts/bundles.mjs --containers` which classes the code has outrun (it prints `STALE|UNRECORDED|UNREAD <member> <class>`, exit 1 when any), builds and pushes those images, and gives each class's resulting digest to `node bio-plane/scripts/bundles.mjs --record-image <member> <class> <digest>`. That writes, in one step and both-or-neither, `image.digest` and `image.source_sha256` into the member's `fleet-member.json` and the digest into the image its `wrangler.jsonc` container block names (its repository and comments kept). Non-container members are never touched (control tested). The assembly then accepts exactly the classes whose digest was recorded after their last code change.

**Deferred / not done**
- `recordContainerDigest` does not check that the `fleet-member.json` digest and the `wrangler.jsonc` image digest already agree before it records (it only rewrites both); a disagreement left by hand is not a refusal of the assembly. Not in R36/R37's words; BOB may want a requirement.

**Reports (also posted as REPORT)**
1. `bio-plane/package.json` is `plane`'s (layer 11), not mine: the ownership check refuses my edit, so I reverted it. The change R16 needs there: `"build": "node scripts/build-plane.mjs"` and delete the `"embed:sign"` script. Until it is made, `npm run build` in the real tree still renders the signing page first. My R16 test drives the fixture's build script and `build-plane.mjs`, so it holds either way.
2. The three real-fleet tests are RED until the members' own jobs merge: `bundler.test.mjs` R24 (real fleet) and R35 (real fleet), `fleetbundles.test.mjs` "agent-runner and file-scanner are listed as container members" — each expects `docker.io/civicsmith/…`, the markers still name `ghcr.io/believeinoakland/…` (file-scanner T51-9 in this layer, agent-runner T51-64 in L6).
3. The real markers record no `source_sha256` yet: `bundles.mjs --containers` on the tree prints `UNRECORDED` for agent-runner `AgentRunner`, file-scanner `FileScanner` and `SafeViewRenderer`, and the real release assembly will refuse `[CONTAINER_IMAGE_STALE]` until the workflow's `--record-image` has run for each (the images must be rebuilt/pushed to Docker Hub then anyway). Workflow change for `container-images.yml` (BOB's): after each image build+push, run `node bio-plane/scripts/bundles.mjs --record-image <member> <class> sha256:<digest>`, and commit the two files it names; it may use `--containers` first to build only what it lists.
4. Nothing generated of another module's was made stale.

**Tests and checks** (run from /home/user/bio/bio-plane unless noted)
- `node --test test/m/bundler/bundler.test.mjs`: 36 pass, 2 fail (the two real-fleet tests above).
- `node --test test/m/bundler/release.test.mjs`: 63 pass. `thirdparty.test.mjs`, `bundle`, `deploybindings`, `resolveversion` system tests: 18 pass.
- `node --test test/system/fleetbundles.test.mjs`: one FAIL line (the marker list above); all other arms pass.
- process repo: `format.mjs`: 0 failures; `architecture.mjs bundler`: 0 failures; `coverage.mjs bundler`: 37 of 37 live ids named, 0 failures.

Size (session_01X7jKAKCTDrVKXvoacZ8mWN): test runs 14, module lines 3768

## J1 · COMPLETE

COMPLETE. T51-5 applied: R16/R17/R19 text and comments (K3807), R35 tests, R36/R37 (field `image.source_sha256`; `bundles.mjs --containers` lists classes the code outran, `--record-image <member> <class> <digest>` writes digest + source into the marker and wrangler.jsonc; release assembly refuses CONTAINER_IMAGE_STALE). Details and the Size line are in my record.
For BOB (exact changes, not mine):
1. bio-plane/package.json is plane's: set "build": "node scripts/build-plane.mjs" and delete "embed:sign" (ownership refused my edit; reverted).
2. container-images.yml (BOB's): after each image build+push run `node bio-plane/scripts/bundles.mjs --record-image <member> <class> sha256:<digest>` and commit the two files; `--containers` first lists what to build. The real markers record no source yet, so the real assembly refuses CONTAINER_IMAGE_STALE until then.
3. Three real-fleet tests are red until file-scanner (T51-9) and agent-runner (T51-64) merge docker.io/civicsmith markers: bundler.test R24 (real fleet) and R35 (real fleet), fleetbundles "agent-runner and file-scanner are listed as container members".

**B2 CHANGE (K3835) applied:** `fleetbundles.test.mjs` no longer imports `embed-signpage.mjs` (the generated-input assertion and header note (7) removed); `fleetbundles.control.mjs` control (7) removed, the others kept; `repo.mjs` no longer copies `embed-signpage.mjs` or `sign-release.html`; R16's test keeps a stale committed `signpage.mjs` as a plain file, importing nothing. Reran: bundler tests 114 pass, 2 fail (the same two real-fleet tests, awaiting the members' markers); `fleetbundles`: only the same marker-list FAIL; format, architecture (0), coverage (37 of 37) and ownership (0 failures) clean.
Size (session_01X7jKAKCTDrVKXvoacZ8mWN): test runs 18, module lines 3768

## J2 · COMPLETE

COMPLETE (B2, K3835 applied): the signing page is out of my tests and fixture; details in my record. Remaining reds unchanged: the two real-fleet marker tests and fleetbundles' marker list, until file-scanner and agent-runner merge.

## J3 · COMPLETE

COMPLETE. T51-144 applied in commit 616cc3718f (job/T51/bundler): a real-fleet test that each container class's fleet-member.json image.digest equals the digest its wrangler.jsonc containers[] entry names (agent-runner's AgentRunner, file-scanner's FileScanner and SafeViewRenderer), with a fixture control whose two digests differ. Today the real pairs agree. --record-image already writes both files, both or neither, and release.test.mjs R36 tests it through the CLI, so no code change was needed. Tests: bundler, release, thirdparty and the four system tests named in the record, 122 pass, 0 fail (the three real-fleet reds from #20 are green now that the markers name docker.io). checks: format 0, architecture 0, coverage bundler 37 of 37, ownership 0. Repo-wide coverage (33) and words (2,821) findings are none in bundler's files. Nothing for you to do; the cut's --record-image act is yours, as before. Size: test runs 4, module lines 3802. Full detail in build/jobs/T51/bundler.md.

## J4 · BLOCKED

BLOCKED (cause: tests). B4 (CHANGE, R38: a member's bundle carries only the word rows its inputs read) is more than I can do at my model, as B4 itself allows. Why: R38 changes what every fleet member's bundle contains and how the byte-freshness guard sees it. It needs a parser pass over every bundled input to collect the literal keys at word/localize/hasWord calls and the literal prefixes of built keys, a refusal for a bare variable key, an esbuild substitution of the trimmed rows, manifest fields for the kept rows (count and digest) that verifyFresh checks, and real-fleet count tests with fixture controls. Getting every member's test suite green on that is a Sonnet-level pass, and I have not started writing code for it. Merged: tranche/T51 is merged into job/T51/bundler (b7f9585831, pushed), no conflicts. Nothing else changed. Next step for BOB: restart this job one model up (sonnet) to take B4; the merge is already on the branch. Size is unchanged from COMPLETE.
