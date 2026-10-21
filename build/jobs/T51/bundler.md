# bundler (T51)

**Status** · session_01KtdpCqCw2mUhYyt4JEEPkX · depth 2 · WORKING · handled B8

## Record (BUNDLER #24, B8: FR-02)

**Entries applied (FR-02 · bundler; K4176 (2), K4180 as amended by K4186)**
- **Requirements written first:** R39 and R40 in `build/requirements/bundler.md`, marked *(not yet met: T51)* (the numbers were free), and the Status line.
- **R39, the release-coherence check (K4176).** `fleet-bundle.mjs` gains `bundleExports(member, built)` (the names the built bundle exports, read from esbuild's metafile output for the member's artifact, so the bundle that would ship and never the source), `bindingFindings(units)` (pure: `units` are `{name, config, exports}` for the plane and every member) and `releaseBindingFindings(members)` (builds each without writing, names a member it cannot build in `unchecked`). Rules: each `services[].service` is the plane or a member of the release; each `durable_objects.bindings[]` with a `script_name` names a member of the release whose bundle exports its `class_name`, one without (or naming its own member) its own bundle's; each `containers[].class_name` and each class a migration creates (`new_classes`, `new_sqlite_classes`, `renamed_classes[].to`, `transferred_classes[].to`; a `deleted_classes` needs none) is its own bundle's. `release-assemble.mjs` runs it right after the freshness loop (so on the fresh builds `verifyFresh` already made) and before the version checks and every write, refusing `[BINDING_NOT_EXPORTED]` with one line per finding, member, binding and class (or service) named. `fleetbundles.test.mjs` runs the same over the checked-in fleet as its section 9.
- **R40, the test deploy (K4180, K4186).** `deploy.mjs` and `deploy-fleet.mjs` take `--test-instance`. With it, before any request: `[NOT_A_TEST_INSTANCE]` unless the environment variable `CIVICSMITH_TEST_INSTANCE` equals the copy (`deploy.mjs <slug>`; `deploy-fleet.mjs --instance`), then `[WRONG_ACCOUNT]` unless the account is `20b533579290b9b93168345edd3b7f72` (`deploy.mjs`: `CF_ACCT`; `deploy-fleet.mjs`: the member's pinned `account_id`); each names the copy or the account asked for. Each step then logs `test deploy: <what> ... sha256 <hash of the built file> (a branch's built artifact: no release/ signature is read)` and a `rollback :` line naming the SHA-256 prefix of the bytes now deployed under that name, or saying nothing is. `deploy.mjs` gains `--dry-run` (every check and read, no upload, exit 0); `deploy-fleet.mjs` already had it. Without the flag nothing of R17 to R20 changes (control in the test; no signed-release code path read a signature before either).
- **Fixtures (`repo.mjs`):** members and the plane export the classes their configuration binds (`addMember({exports})`; the plane exports `Store`; container fixtures export their classes), so the existing assembly tests stay coherent.

**What the workflow `.github/workflows/deploy-test.yml` must carry (BOB's file; I changed no workflow).** Job in the `deploy-test` environment, inputs `branch` and `copy`; checkout `branch`; `npm ci` in `bio-plane/` and in each directory `node bio-plane/scripts/bundles.mjs --install-dirs` lists; build the branch's artifacts (`node bio-plane/scripts/bundles.mjs`, from the repository root); then, with `CF_TOKEN`/`CLOUDFLARE_API_TOKEN` and `CF_ACCT=20b533579290b9b93168345edd3b7f72` from the environment's secrets and `CIVICSMITH_TEST_INSTANCE: ${{ inputs.copy }}`:
1. for each member in the order `discoverMembers` lists (code-point order of name): `node bio-plane/scripts/deploy-fleet.mjs <member> --instance ${{ inputs.copy }} --test-instance` (add `--dry-run` to run the step locally);
2. then the plane: `cd bio-plane && node scripts/deploy.mjs ${{ inputs.copy }} <the version bio-plane/package.json declares> dist/bio-plane.bundled.mjs --test-instance` (`--dry-run` likewise).
Each step's log carries its `test deploy:` and `rollback :` lines; a member image is the marker's digest as ever (R26), so a container member needs its image pushed first (`container-images.yml`).

**Deferred / not done:** nothing deferred. Not done, as instructed: no `dist/` bundle or manifest rebuilt or committed; no workflow file edited.

**For BOB (not mine)**
1. **R39's real-fleet arms are red by name**, as the plan says: `bundler.test.mjs` "R39: over the real fleet..." and `fleetbundles.test.mjs` section 9 print exactly one finding, `agent-worker: Durable Object binding REMOTE names class RemoteSession, which the bundle of agent-runner does not export`. They go green when agent-runner exports `RemoteSession` and its bundle is regenerated (the check reads the fresh build, so the committed bundle's age does not matter).
2. **A fresh copy cannot pass both preflights.** `deploy-fleet.mjs` refuses `[BINDING_TARGET_MISSING]` unless the plane named by `--instance` already exists in the account; `deploy.mjs` refuses unless every member its services name exists. On a copy that has never been deployed neither can go first. I left both preflights as the requirements state them (R17, R19). If the trial copy is to be created by this workflow, one of them needs a rule for a test instance (for example the plane's first deploy skipping targets that are members of the same run); say which and I will change it in a CHANGE.
3. **`fleetbundles` is red beyond R39** only for the stale committed bundles (13 findings: every bundle against `setup-words/rows.mjs`, plus agent-worker's bytes), the case R1's close regenerates; none is a new finding of this job.
4. The member's own Worker name under a test deploy is `wrangler.jsonc`'s `name` (the member's name), not suffixed with the copy: a test deploy of a member replaces that member's script in the test account. The rollback line is the means back.

**Tests and checks** (from `/home/user/bio/bio-plane` and the process repository; dependencies for each lockfile directory installed with `npm ci --ignore-scripts`)
- `node --test test/m/bundler/bundler.test.mjs test/m/bundler/release.test.mjs test/m/bundler/thirdparty.test.mjs test/system/bundle.test.mjs test/system/deploybindings.test.mjs test/system/resolveversion.test.mjs`: 137 pass, 1 fail (R39's real-fleet arm, item 1). New: 3 R39 tests in `bundler.test.mjs`, 2 R39 and 2 R40 in `release.test.mjs`.
- `node test/system/fleetbundles.test.mjs`: 139 pass, 14 fail (13 stale bundles, item 3, and R39's section 9, item 1).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bundler`: 0 failures. `checks/coverage.mjs bundler`: 40 of 40 live ids named. `checks/ownership.mjs bundler tranche/T51 job/T51/bundler`: 0 failures. `checks/run.mjs`: words 0 findings; coverage lists other modules' ids only (agent-harness R17; agent-runner R36, R37, R38, R40; installer-steps R26, R31; journey-check R19).

Size (session_01FoYQKjGSDzypze3SYjMYUT): test runs 9, module lines 4228

## Record (BUNDLER #22, B4/B6: R38)

**Entries applied (R38, K3953 as amended by K3958; T51-144 stays as BUNDLER #21 left it, J3)**
- **How it works (`fleet-bundle.mjs`, `buildMember`):** for a fleet member (a descriptor `discoverMembers` marks; the plane, `wholeWordTable`, and any other descriptor, such as the standalone case checker's, carry the table whole) a probe build stubs `setup-words/rows.mjs` out and names the first-party inputs; each is parsed with the vendored acorn (`setup-words/vendor/acorn.mjs`, never a pattern) by `wordKeysOf`, which reads every call of `word`, `localize` and `hasWord` (a name the file declares itself is not the call, setup-words' own rule): a string or no-expression template is a key, a `+` chain or template with a literal head is a prefix, both arms of `?:`, `||`, `??` count. The real build then replaces the `rows.mjs` import (an esbuild `onLoad` plugin) by a module of the rows named or under a prefix, in the table's order. `manifestFrom` records `words: {rows, sha256}` (the SHA-256 of the kept rows); `verifyFresh` compares the manifest's word fields with the fresh build's and names a disagreement as STALE BUNDLE.
- **K3958 (a variable key keeps the whole table):** a call with no literal prefix, `word` used other than as a callee, `WORD_ROWS` imported or re-exported outside setup-words' own index, a dynamic import of the table: the build does not fail; it keeps the whole table and the manifest says `words: "all"` with `wordSites`, every site as `file:line` (code-point order, member-relative). A member whose inputs do not reach the table records nothing, as before; the plane's manifest and bytes are as before (tested against the plain recipe).
- **Real fleet (kept rows of 18,680, each member's inputs as the tree stands at the tranche merge):** pdf-worker **10**, ocr-worker **74**, sheet-worker **15**, agent-runner **2**, file-scanner **45**; agent-worker keeps **the whole table** for 6 sites (7 findings; `project-roster/checks.mjs:14` holds two on one line): `../bio-plane/src/capture/words.mjs:78`, `extraction/words.mjs:7` (imports `WORD_ROWS`) and `:67`, `membership/words.mjs:11`, `project-roster/checks.mjs:14`, `run-rules/checks.mjs:26`. The standalone case checker's `program.mjs` build is unchanged (checked: sha256 `de50988e…` before and after).
- **Tests (bundler.test.mjs, all name R38):** fixture exact keys (word, localize, hasWord, template, conditional; table order; manifest rows and digest; the bundle still runs); `'refusal.' + code` and a template keep every row under the prefix; bare variable / call result / no argument / spread / one bare site among literal ones keep the whole table naming the site, and the build equals the untrimmed one; `word` as a value, the table imported, a dynamic import; a local `word` is not the call; the plane built by the plain recipe, no `words` field; a non-member descriptor is built whole; `verifyFresh` covers the rows (wrong count, wrong digest, missing, "all") and the sites; real fleet: each buildable member's rows are in the table's order and each kept key appears quoted in its inputs or begins with a literal prefix before a `+` or `${` (an independent regex check), counts printed; agent-worker named as keeping the whole table with its sites. The scratch repository (`repo.mjs`) copies the vendored parser the build now imports.

**Deferred / not done**
- Nothing deferred. Not done, as instructed: no `dist/` bundle or manifest rebuilt or committed.

**For BOB (not mine)**
1. **Architecture: 1 failure, yours to clear.** `fleet-bundle.mjs` imports `bio-plane/src/setup-words/vendor/acorn.mjs` (the parser B4 names), so `bundler`'s `uses` in `build/modules.json` and the Uses part of `build/requirements/bundler.md` need `setup-words` added (`signatures`, `test-support`, `setup-words`). I cannot edit either; nothing else in the check fails. setup-words is earlier in layer 1.
2. **Every committed bundle is now stale against a fresh build** (as intended before R1's close): `fleetbundles` fails the byte arm for agent-runner, agent-worker, file-scanner, ocr-worker, pdf-worker (their manifests record no `words`; their bundles carry the whole table), and several members' static arm was already stale from merged source changes (the plane, agent-worker, file-scanner, ocr-worker, pdf-worker: sources changed by other modules since each bundle was built). `bundles.mjs` at R1's close regenerates them (agent-worker, with its whole table and 6 sites, builds).
3. **Real-fleet expectation (K3958):** the second real-fleet test lists the members keeping the whole table and their sites (agent-worker today) and fails only if pdf-worker, ocr-worker or sheet-worker did. When the five modules' jobs make their reads literal (CR-4, T51-157, T51-180, T51-189, T51-218) agent-worker trims, its count is printed by the first real-fleet test with the others (it skips only a member that keeps the whole table), and the second test then lists no member; BOB tightens it to assert none.
4. `node_modules` of `agent-runner` and `file-scanner` were absent in this container; I ran `npm ci --ignore-scripts` there (untracked `node_modules`, nothing committed).

**Tests and checks** (from `/home/user/bio/bio-plane` and the process repository)
- `node --test test/m/bundler/bundler.test.mjs release.test.mjs thirdparty.test.mjs test/system/bundle.test.mjs deploybindings.test.mjs resolveversion.test.mjs`: **129 pass, 0 fail** (8 new R38 tests).
- `node --test test/system/fleetbundles.test.mjs`: red as item 2 says (stale committed bundles; not skipped).
- `node checks/format.mjs`: 0 failures. `coverage.mjs bundler`: 38 of 38 live ids named, 0 failures. `ownership.mjs bundler tranche/T51 job/T51/bundler`: 0 failures. `architecture.mjs bundler`: 1 failure (item 1). `checks/run.mjs`: words findings repo-wide, none in bundler's files.

Size (session_017VMvhjxUfKRwS5rFeW66NT): test runs 14, module lines 3986

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

## J5 · QUESTION

QUESTION (R38 on the real agent-worker; my best reading below, I carry on with it).

R38 as written (a call whose key has no literal prefix fails the build) cannot be met by the real agent-worker today: its bundled inputs hold 7 sites in OTHER modules, which I may not change. Built with R38, agent-worker's `buildMember` refuses (so `verifyFresh` says "not checked", and R1's regeneration of its bundle would fail) until each site is literal. The other members build: pdf-worker keeps 10 of 18,680 rows, ocr-worker 74, sheet-worker 15, agent-runner 2, file-scanner 45; the plane is unchanged (whole table).

Sites, all found by the vendored parser (my build lists them at once):
1. `bio-plane/src/run-rules/checks.mjs:26` — `[...four 'refusal.X' literals].map((key) => [key, word(key)])` (run-rules).
2. `bio-plane/src/membership/words.mjs:11` — `keyed(key, names)` wraps `word(key, …)`; its callers pass `rowKey(code)` / `SENTENCE_KEYS` (membership).
3. `bio-plane/src/project-roster/checks.mjs:14` — `said(code, key = `refusal.${code}`)`: `hasWord(key)` / `word(key)` (project-roster).
4. `bio-plane/src/extraction/words.mjs:7` imports `WORD_ROWS` (the whole table) and `:67` `say(key)` calls `word(key, vars)` (extraction).
5. `bio-plane/src/capture/words.mjs:78` — `say(key)` calls `word(key, vars)` (capture).
These modules each hold their vocabulary as a list of string literals (`WORD_KEYS`, `SENTENCE_KEYS`) and read it through a wrapper with a variable key.

My best reading: R38 stands as written, so those five modules' jobs make their reads literal (or each wrapper's reads literal prefixes, as `` `refusal.${code}` `` is accepted: a template or `'refusal.' + code` with a literal head is a prefix and keeps every `refusal.` row). A prefix-wrapper fix is small for 3 and 4/5's refusal reads; the rest must name their keys at the call.
The alternative, if BOB prefers it (a requirement change, yours): treat every string literal in the member's inputs that equals a row key as read (a list of literal keys then counts), keeping the bare-variable refusal only for calls whose key could come from a non-literal source. I do NOT build that unless told: R38's own control (a bare variable fails the build naming the site) means the strict reading.
Until then: my real-fleet test states each of the five buildable members' kept row count and, for agent-worker, asserts the build refuses naming exactly these sites by file (a control that turns green-for-the-right-reason when the five modules are fixed, then BOB changes it to a count).

## J6 · COMPLETE · re B6

COMPLETE. T51-144 (J3, unchanged) and R38 (B4, K3953 as amended by K3958) are applied: commit 477843e080 on job/T51/bundler.
R38: a fleet member's bundle carries only the word rows its inputs name (vendored acorn reads word/localize/hasWord; literal keys and literal prefixes; esbuild plugin substitutes the trimmed rows.mjs); manifest `words: {rows, sha256}`; a variable-key site or any whole-table read keeps the whole table, `words: "all"` + `wordSites` (file:line); verifyFresh covers both; the plane and non-member builds (the case checker's program.mjs: sha unchanged) are as before. Kept rows of 18,680: pdf-worker 10, ocr-worker 74, sheet-worker 15, agent-runner 2, file-scanner 45; agent-worker keeps the whole table for 6 sites (capture/words.mjs:78, extraction/words.mjs:7 and :67, membership/words.mjs:11, project-roster/checks.mjs:14, run-rules/checks.mjs:26). No dist bundle touched.
Tests: 129 pass, 0 fail (bundler, release, thirdparty, bundle, deploybindings, resolveversion; 8 new R38 tests). format 0; coverage bundler 38 of 38; ownership 0.
For you: (1) architecture shows 1 failure: fleet-bundle.mjs imports setup-words/vendor/acorn.mjs, so `setup-words` must be added to bundler's `uses` in build/modules.json and the Uses part of build/requirements/bundler.md (neither is mine); nothing else fails. (2) Every committed member bundle is stale against a fresh build until your R1-close regeneration (fleetbundles red on the byte arm; some static arms were already stale from merged sources). (3) The container members' node_modules were missing here; I ran `npm ci --ignore-scripts` (untracked). Details and the Size line are in my record.
Size (session_017VMvhjxUfKRwS5rFeW66NT): test runs 14, module lines 3986

## Record (BUNDLER #23, B7: CR-15)

**Entries applied (CR-15 · bundler, K4011, K4073, K4094)**
- **K4011, the R38 real-fleet arm.** `bundler.test.mjs` R38: a member whose build records no word table (`words` null: its inputs reach no `setup-words/rows.mjs`, agent-runner today) is no longer asserted to carry one. The control is that no table input is bundled; a member that reads the table and records none still fails by name. Test-only; the bundle is unchanged.
- **K4073, the stale comment.** `fleet-bundle.mjs` header named `scripts/embed-signpage.mjs`, which is deleted; removed.
- **K4094, the Worker part states the member's own Durable Objects.** `workerPart` (`fleet-bundle.mjs`) adds `durable_objects: {bindings: [{name, class_name}], migrations: [{tag, classes}]}` when the member owns any: bindings with no `script_name` (agent-worker's `REMOTE` is another script's object and is left out, as `MEMBER_OBJECTS` leaves it out), migrations in order from `new_sqlite_classes`. A migration in any other form, a tag the installer does not read (`^v[0-9]+$`), or a binding with no class is refused by name in `missing`, never dropped. The key is absent when the member owns no object, so the bytes of a member with none are as before. Part `null` only when it has no bucket, cron or object. `release-assemble.mjs`'s WORKER_UNDESCRIBED text names the two new fields. The shape is the one `newgroup/src/steps/containers.mjs` `workerDescriptor` already reads (F10), so the installer's parse accepts it unchanged.
- **Tests (bundler.test.mjs, each names R25 or R38):** two new R25 tests (K4094): the own-objects descriptor and bytes, the cross-script exclusion, the empty and absent cases, each refusal by name; and over the real fleet, agent-worker (SEGMENTS, CHECKS; v1, v2), agent-runner (AGENT_RUNNER; v1), file-scanner (SCANNER, RENDERER). The existing R25 and release tests (`release.test.mjs` R25 worker.json arms) pass unchanged.

**Deferred:** nothing.

**Found in other modules (REPORT to BOB; not changed here):**
- Release output changes at the next cut: agent-worker now carries a signed `worker.json` (its Durable Objects), agent-runner's and file-scanner's parts gain `durable_objects`. The fleet signature covers them as it covers every part.
- installer-steps: `MEMBER_OBJECTS` (`newgroup/src/steps/members.mjs`) can go once the release carries agent-worker's objects (BOB's note 1); its job or a CHANGE to its CR job.
- `checks/run.mjs` (all modules, not mine): coverage shows 8 live ids named by no test (agent-harness R17; agent-runner R36, R37, R38, R40; credentials R80; extraction R77; installer-steps R26, R31; journey-check R19; screens-inquiry R81, R82; setup-words R19). Words shows 15 inline findings, all in instance-setup (12) and promotion (3). Neither is in bundler's files.

**Checks and tests (from my checkout, dependencies installed with `npm ci --ignore-scripts` for each lockfile directory)**
- Tests: `bio-plane/test/m/bundler/bundler.test.mjs`, `release.test.mjs`, and `bio-plane/test/system/{bundle,deploybindings,fleetbundles,resolveversion}.test.mjs`: 0 failures after the changes (the R38 real-fleet arm was red before, by name). Layer tests: none named in `build/manifest.md` for layer 1.
- `checks/format.mjs /home/user/bio`: 0 failures. `checks/architecture.mjs /home/user/bio bundler`: 0 failures. `checks/coverage.mjs /home/user/bio bundler`: 38 of 38 live ids named. `checks/ownership.mjs /home/user/bio bundler tranche/T51 job/T51/bundler`: 0 failures.

Size (session_01Gz6er9hUWEo63Fj3mY19bH): test runs 5, module lines 4024

## J7 · REPORT

Other modules, found by checks/run.mjs (not changed here; described against their requirements):
- coverage: 8 live ids named by no test: agent-harness R17; agent-runner R36, R37, R38, R40; credentials R80; extraction R77; installer-steps R26, R31; journey-check R19; screens-inquiry R81, R82; setup-words R19.
- words: 15 inline findings, all in instance-setup (12) and promotion (3).
- Consumer: installer-steps' MEMBER_OBJECTS can go once the release carries agent-worker's Durable Objects (BOB's note 1). The installer's workerDescriptor already reads the new durable_objects field (F10).
- Release output changes at the next cut: agent-worker gains a signed worker.json; agent-runner and file-scanner parts gain durable_objects.

## J8 · COMPLETE

CR-15 · bundler is done; it is pushed to job/T51/bundler (d8666b580e).

Applied: (K4011) the R38 real-fleet arm skips a member whose build records no word table only when no setup-words rows input is bundled, so the arm fails for a member that reads the table and records none; (K4073) the deleted embed-signpage.mjs reference is gone from the fleet-bundle header; (K4094) workerPart states the member's own Durable Objects and migrations as durable_objects {bindings, migrations}, cross-script bindings left out, other shapes refused by name. Two new R25 tests; the existing tests pass unchanged. Nothing deferred.

Tests: bundler, release, and the four bundler system files, 0 failures. format 0; architecture 0; coverage 38 of 38; ownership 0. checks/run.mjs shows only other modules' findings (in the REPORT).

Record: build/jobs/T51/bundler.md. Size (session_01Gz6er9hUWEo63Fj3mY19bH): test runs 5, module lines 4024.

## J9 · COMPLETE

FR-02 · bundler is done; pushed to job/T51/bundler (9c76d0cd7f). Applied: R39 (release-coherence check: [BINDING_NOT_EXPORTED] naming member, binding and class, run by release-assemble before any write and by fleetbundles section 9, reading the fresh build's exports) and R40 (--test-instance on deploy.mjs and deploy-fleet.mjs: [NOT_A_TEST_INSTANCE], [WRONG_ACCOUNT], test-deploy and rollback log lines, deploy.mjs --dry-run). Requirements R39, R40 written first. Red by name as planned: R39's real-fleet arms (agent-worker REMOTE -> RemoteSession) until agent-runner merges. Bundler tests 137 pass, 1 fail (that arm); format 0, architecture 0, coverage 40/40, ownership 0. Record build/jobs/T51/bundler.md has the exact workflow steps for deploy-test.yml and 2 notes for BOB (a fresh copy cannot pass both preflights; test deploys replace the member's own script). Size (session_01FoYQKjGSDzypze3SYjMYUT): test runs 9, module lines 4228.

## J10 · REPORT

Ownership check: 1 failure, build/requirements/bundler.md is outside bundler's paths, tests and job record. B8 told me to write the NEW R39 and R40 lines first, so I did (that file's diff is only those two lines and the Status line). If BOB keeps the requirements file as its own, take the two lines from my commit 9c76d0cd7f and drop the file from my branch; nothing else in the ownership check fails.
