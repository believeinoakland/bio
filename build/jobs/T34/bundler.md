# bundler (T34)

**Status** · session_01FJffd6B15P17amC4kMWkAK · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Four readings for T34-6 (R24–R26). I am building on them now; answer only where you differ.

(1) **R25's fields in the marker.** `class_name`, `max_instances` and `bind` are top-level keys of the member's `fleet-member.json`, beside `image`. The descriptor's `image` is `image.repository + "@" + image.digest`, with the digest in agent-runner R7's own form `sha256:<64 hex>`. `scheduling_policy` is always written `"default"`; a marker whose `image.schedulingPolicy` says anything else is refused `[CONTAINER_UNDESCRIBED]` naming it. Checks: `class_name` a JS identifier; `max_instances` a positive integer; `bind` a non-empty list of `{member, binding}`, each `member` a discovered fleet member. The descriptor bytes are `JSON.stringify({class_name, image, scheduling_policy, max_instances, bind}, null, 2) + "\n"`. They are made at assembly, published as `release/<member>/container.json` and never written into the member's tree.

(2) **The container member's fleet entry.** signatures' `fleetStatement` member line needs an asset's sha256 and bytes and a compatibility date. Reading K1678 (1), the entry is the member's Worker bundle plus the `container.json` part. A container member that declares a `bundle` is guarded like any member; one that declares none (agent-runner today, until T34-74) is listed and not guarded (R24). The release refuses a container member with no `bundle` as `[CONTAINER_UNDESCRIBED]` naming `bundle`, and does not leave it out, because leaving it out would let an instance quietly do less. So a release cut from today's tree refuses: agent-runner's marker has `digest: null` and no `bundle`, `class_name`, `max_instances` or `bind`. Those are owed by T34-74 or the release (T33-D1); I am sending them in a REPORT. If you would rather the release left out, by name, a container member with no bundle (as 0.80.0 did), say so.

(3) **R26's mechanics** for a member of `kind: "container"`, after R19's checks:
- Preflight: `GET /accounts/<id>/containers/applications`. Any answer that is not OK, or no answer, is `[CONTAINERS_UNREACHABLE]`, naming the account and saying that the token needs Containers access (`containers.write`). This happens before any push and before `--dry-run` exits.
- A marker with no pinned digest is `[CONTAINER_UNDESCRIBED]`.
- Push: `docker pull <repository>@<digest>`, `docker tag` it `<member>:<first 12 hex of the digest>`, then `wrangler containers push` that tag with the account's token. A failed pull or push exits with its status, and nothing is deployed.
- Then R20's `wrangler deploy`, with the generated config's `containers[].image` set to the pushed `registry.cloudflare.com/<account>/<tag>`. The tracked config is never written.

(4) **R1's listed shape.** Each member gains `kind` (`"worker"` when the marker states none) and `image` (`null` for a worker). The ARM 7b red is agent-runner's `package.json` version, an 11th version site, and I re-pin it to 11. R12 already reads every discovered member.

## J2 · REPORT

REPORT for T34-74's START (agent-runner), per B2. Nothing here is mine to change.

(1) **agent-runner's marker (`agent-runner/fleet-member.json`) does not yet carry what R25 reads.** A container member's `container.json` part is written only from its marker, and the marker today has none of these:
- `bundle`: the Worker that hosts the `AgentRunner` class. Until the marker declares one, the release leaves agent-runner out by name (K1730).
- `class_name` (for example `"AgentRunner"`).
- `max_instances` (a positive integer).
- `bind`, such as `[{"member": "agent-worker", "binding": "RUNNER"}]`.
- `image.digest` in the form `sha256:<64 hex>` (it is `null` today; the release writes it when it first publishes the image, T33-D1).

Once agent-runner declares a `bundle`, a release refuses `[CONTAINER_UNDESCRIBED]`, naming the field, until every one of these is stated. For R26, agent-runner's `wrangler.jsonc` must also declare `containers`.

(2) **The fleet gate needs nothing from T34-74.** `fleetbundles.test.mjs` asserts that every member with no bundle is a container member, and `resolveversion` ARM 7b is now a floor (at least 11 sites) with a per-directory arm (7c). So adding a bundle, or a `wrangler.jsonc` with `vars.VERSION`, to agent-runner leaves both green with no edit to bundler's tests. A bundle added to agent-runner is guarded like any member's (R24).

(3) **A finding for the release, not for this job.** `release-assemble.mjs --dry-run` on this tree gets past every freshness proof: 5 assets are fresh, and agent-runner is left out by name. It then refuses `[VERSION_ALREADY_RELEASED]`, because `release/RELEASE.json` holds 0.79.0 with a different plane while the tree still declares 0.79.0. 0.80.1's cut bumps the version, as usual.

## J3 · COMPLETE

T34-6 is applied, on `job/T34/bundler` at 2588a7276a. It changes only bundler's own paths and tests.

**Entries applied**
- **N578 / R24.** `discoverMembers` gives each member a `kind` (`worker` unless its marker says otherwise), an `image`, and its `marker`. The new `isContainer` and `isGuarded` say which members the bundle guard covers. A container member with no Worker bundle is listed and not bundle-guarded:
  - `verifyStatic` returns no findings, with `guarded: false`.
  - `verifyFresh` returns `checked: false` with a reason, and never calls the member fresh.
  - `bundles.mjs` lists it as not guarded.
  - A container member that declares a `bundle` is guarded like any member.
- **N610 / R25.** `containerDescriptor` and `imageReference` live in `fleet-bundle.mjs`.
  - The release gives a container member that has a `bundle` its `container.json` part, type `Container`. The part is made from the marker, carried in the fleet payload and written to `release/<member>/container.json`.
  - A field it lacks is refused `[CONTAINER_UNDESCRIBED]` naming the field, before any build runs or anything is written. `bind` must name a member that ships.
  - A container member with no `bundle` is left out by name (K1730).
- **N624 / R26.** `deploy-fleet.mjs` with a container member runs these steps in order, stopping at the first refusal or failure:
  1. `[CONTAINER_UNDESCRIBED]` for an image with no pinned digest, or for a config with no `containers`, before any request.
  2. A Containers preflight. A token that cannot reach Containers is refused `[CONTAINERS_UNREACHABLE]`, naming the account and saying what it lacks, before anything is pulled, pushed or deployed. `--dry-run` stops after this step.
  3. `docker pull` the image by digest, `docker tag` it `<member>:<12 hex of the digest>`, then `wrangler containers push` with the account's token. A failed step exits with its own status, and nothing is deployed.
  4. R20's deploy, with `containers[].image` set to `registry.cloudflare.com/<account>/<tag>`. The tracked config is never written.
- **N575.** `fleetbundles.test.mjs` re-pins agent-worker to the 20 inputs its committed manifest records, and lists agent-runner (5 members). The guard counts any member with no `bundle` that is not a container member. `resolveversion` ARM 7b is now a floor of at least 11 sites, and a new ARM 7c checks the sites directory by directory.
- **N586 (bundler's share).** Arm 1 of `fleetbundles.control.mjs` now appends to `agent-harness/src/harness.mjs`. Run alone: 111 pass, 1 FAIL, exit 1, naming agent-worker and `../agent-harness/src/harness.mjs` with STALE BUNDLE; restored by content and sha256.
- **The inherited reds K1708 named as bundler's are now green:** fleetbundles ×4 and resolveversion ARM 7b.

**A flaw fixed in my own module.** `release-assemble.mjs` used to filter members to those with a `bundle`. A worker member whose `bundle` block was deleted therefore dropped out of a signed release without a word. It now refuses `[NO_ARTIFACT]` (R22), and the R22 test covers it.

**Deferred.** None.

**Found in other modules.** agent-runner's marker fields, for T34-74's START: J2 REPORT. `requirements/bundler.md` R24–R26 still carry "not yet met: T34"; that wording is BOB's.

**Tests and checks run**
- Module set (`test/m/bundler/` with `bundle`, `deploybindings`, `fleetbundles` and `resolveversion`): `# tests 63 # pass 63 # fail 0 # skipped 0`. Inside it, `fleetbundles: 112 pass, 0 fail` and `resolve-version: 12 pass, 0 fail`.
- Users of the changed functions: agent-worker `requirements.test.mjs` pass 1 fail 0; ocr-worker `ocr-worker.test.mjs` pass 1 fail 0; case-checker `program.test.mjs` pass 5 fail 0; newgroup `requirements.test.mjs` pass 37 fail 0.
- Real tree: `bundles.mjs --check` exit 0 (5 guarded, agent-runner listed and not guarded). `release-assemble.mjs --dry-run` proves 5 assets fresh and leaves agent-runner out, then refuses `[VERSION_ALREADY_RELEASED]` (J2 (3)).
- Checks:
  - `format: 126 modules, 125 requirements files; 0 failures`
  - `architecture: 19 product files, 48 relative imports (8 naming no tracked file, not judged); 0 failures`
  - `coverage: 1 modules, 26 of 26 live requirement ids named by a test; 0 failures`
  - `ownership: 12 files changed by bundler between tranche/T34 and HEAD; 0 failures`
- Layer tests: `build/manifest.md` names none.

Size (session_01FJffd6B15P17amC4kMWkAK): test runs 16, module lines 2666
