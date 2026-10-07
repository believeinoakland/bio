# bundler (T36)

**Status** · session_01AVSxAcVVnwvGFa9niTqNUo · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings I am building on now; none blocks me, but (A) is the contract file-scanner's job (T36-5) must write, so please relay or confirm.

**(A) The two-class marker (R24, R25, R26; file-scanner R10).** No requirement fixes its shape, so bundler defines it and reads it:
- `kind: "container"`, `bundle` as today, and `containers: [ {class_name, image: {repository, digest, platform?, port?, schedulingPolicy?, base: {repository, digest}, packages: "<member-relative path of the package statement>"}, max_instances?, bind?}, … ]`, one entry per class.
- `max_instances` and `bind` are read from the class entry, else from the member's top level (the marker stating them once for every class). Nothing is defaulted; a class that ends up without one is `[CONTAINER_UNDESCRIBED]` naming the class and the field.
- A member with a top-level `image` and no `containers` is a one-class member exactly as today (agent-runner unchanged). R24's "an `image` block" reads as: a top-level `image`, or a `containers` list whose every entry has one.
- Parts: one class keeps `container.json`; two or more are `container/<class_name>.json`, each type `Container`. The installer (not mine) will need to read more than one `Container` part: I will REPORT it.
- R26: `deploy-fleet.mjs` pulls, tags and pushes each class's image and points each `containers[]` entry of the member's wrangler.jsonc at its class's pushed copy by `class_name`; a wrangler container naming no marker class is refused `[CONTAINER_UNDESCRIBED]`.

**(B) The package statement (R27, R28 (b)).** A committed JSON file named by `image.packages`: `{ "ecosystem": "<OSV ecosystem, e.g. Debian:12>", "base": {"repository": "…", "digest": "sha256:<64 hex>"}, "packages": [{"name", "version"}, …] }`. Its `base.digest` must equal the class's `image.base.digest`, else `[CONTAINER_PACKAGES_UNREAD]` naming the digest. A class with no `image.packages` keeps reading the member's `package-lock.json` (npm). R28 lists those entries under the statement's `ecosystem`, and R29 asks OSV in that ecosystem.

**(C) R30's commands (no new file: `release-sign.yml`'s steps call existing paths).** My reading: the workflow re-runs assembly itself on the commit it signs, so it signs only what it proved fresh, never a payload a session handed it. In order:
1. `npm ci` in `bio-plane/` and in each member directory with a `package-lock.json` (the byte arm needs the installs; I add `node bio-plane/scripts/bundles.mjs --install-dirs`, printing those directories, one per line, so the workflow does not hand-list them).
2. `node bio-plane/scripts/release-assemble.mjs --version <V> --dry-run` (every R22 check, no seed, nothing written).
3. `node bio-plane/scripts/release-assemble.mjs --version <V> --sign` (in the environment holding `BIO_RELEASE_SEED`; signs both, R23's stock-ssh-keygen checks, writes `release/`).
Sessions run only (2) and `--emit-payload`. `--sign` stays (R23) but refuses `[NOT_SIGNING_ENVIRONMENT]` before reading the seed unless `GITHUB_ACTIONS` is `true`, so no session command reads `BIO_RELEASE_SEED`. I also add `--plane-sig <file>` beside `--fleet-sig`, so a release can be completed from signatures made elsewhere (R30's "completed from those signatures") without the previous `RELEASE.json`'s `sig`. Committing `release/` after step 3 is the workflow's (yours).

## Completion

**Read whole** (mechanics §17, N739): `build/requirements/bundler.md`; the public parts of `signatures`, `test-support` and `file-scanner`; `build/layers.md`'s helper-module contract; the plan's entry T36-2 and rules 5, 6; every file of the module's `paths` and `tests`. The set measured 205 KB at the START, under the 300 KB limit.

**Entries applied (T36-2).**
- (N733) `system/fleetbundles.test.mjs`'s agent-worker list re-pinned to its 22 inputs (`src/draft.mjs`, `src/reads.mjs`): T35's red 32 / T36's red 6 cleared.
- (rev. 2 §2 R10) R24, R25: a container member may state its classes as `containers: [{class_name, image, max_instances?, bind?}]` (B2, K2077), each with its own image; `max_instances`/`bind` from the class, else the member's top level, never defaulted. Two or more classes are emitted one `Container` part per class, `container/<class_name>.json`; one class (either form) stays `container.json`, byte-identical to before. A class lacking a field is refused `[CONTAINER_UNDESCRIBED]` naming the class and every field; a duplicated class name, or a top-level `image` beside a `containers` list, likewise.
- R26: `deploy-fleet.mjs` pulls, tags (`<member>-<class>:<12 hex>`) and pushes each class's image and points each `containers[]` entry of the member's config at its own class's copy by `class_name`; a config container naming no marker class, or a class with no config container, is refused `[CONTAINER_UNDESCRIBED]` before any request.
- R27, R28 (b), R29: an image whose packages are not npm's is read from the committed package statement its class names (`image.packages`): `{ecosystem, base: {repository, digest}, packages: [{name, version}]}`, sorted; a statement missing, not parsing, naming no ecosystem, a package without a version, no base digest, or another base than the marker's `image.base.digest` is `[CONTAINER_PACKAGES_UNREAD]` naming the file, package or digest. The inventory lists those under the statement's ecosystem, and the advisory report asks OSV in it.
- R30: assembling apart from signing. `--sign` refuses `[NOT_SIGNING_ENVIRONMENT]` unless `GITHUB_ACTIONS` is `true`, before the seed is read and before any build; `--emit-plane <file>` writes the plane asset beside `--emit-payload`'s payload; `--plane-sig <file>` completes a release from a plane signature made elsewhere (R23's checks unchanged). No command a session runs asks for `BIO_RELEASE_SEED` (tested with an environment spy over assembly, emission, completion, the refused `--sign`, `bundles.mjs --check`/`--install-dirs` and the advisory report).
- `fleetbundles.test.mjs`:116 names `file-scanner` (red 9) and `deploybindings.test.mjs`:165 names `FILE_SCANNER` (red 10), as accepted by name.

**R30: the commands `release-sign.yml` calls, in order, by usage line** (also in `release-assemble.mjs`'s header), from the repository root of the commit being released:
1. `npm ci` in `bio-plane/` (the library's esbuild).
2. `node bio-plane/scripts/bundles.mjs --install-dirs` — prints the directories the byte guard needs installed, the plane's first; then `npm ci` in each it printed after `bio-plane`.
3. `node bio-plane/scripts/release-assemble.mjs --version <V> --dry-run` — every R22 check, nothing written, no seed.
4. `node bio-plane/scripts/release-assemble.mjs --version <V> --sign` — in the environment holding `BIO_RELEASE_SEED`, behind Bob's approval: re-assembles this commit, signs the plane (`bio-release`) and payload (`bio-release-fleet`), refuses unless stock `ssh-keygen` accepts both for `RELEASE.json`'s `signer`, then writes `release/`. Committing `release/` is the workflow's.
5. (for the operator, refuses nothing; exits 1 when any entry could not be checked) `node bio-plane/scripts/release-advisories.mjs --out <file>`.
Signatures made elsewhere complete a release with `node bio-plane/scripts/release-assemble.mjs --version <V> --fleet-sig <file> --plane-sig <file>`.

**Deferred:** none.

**Found in other modules** (sent as a REPORT):
1. `installer` (newgroup): its `containerDescriptor` reads one `container.json` part. A member with two classes now carries `container/FileScanner.json` and `container/SafeViewRenderer.json` (type `Container`); the installer must read every `Container` part of a member to install `file-scanner`'s two classes.
2. Red 10 covers two assertions in `deploybindings.test.mjs` (the binding list at :165 and the pre-flight target list beside it, which gains `file-scanner`): one cause, cleared together when T36-49 adds the binding.
3. `file-scanner` (T36-5): its marker follows B2's contract (`containers`, each class's `image.base` and `image.packages`, `bind` naming `FILE_SCANNER`), and its config's `containers[]` entries name each class by `class_name`, or deploy-fleet refuses it.
4. `build/requirements/bundler.md`: R21 states `bundles.mjs`' survey and rebuild; `--install-dirs` (R30's install list) is not stated there. BOB's wording, if wanted.

**Tests and checks** (from `bio-plane/`, then from the process repository):
- `node --test test/m/bundler/` → 88 pass, 0 fail.
- `node test/system/fleetbundles.test.mjs` → 119 pass, 1 fail (red 9, `file-scanner` named), no SKIP (after `npm ci` in `agent-runner/`).
- `node test/system/deploybindings.test.mjs` → 35 passed, 2 failed (red 10).
- `node test/system/resolveversion.test.mjs` → 12 pass, 0 fail; `node test/system/bundle.test.mjs` → exit 0; `node test/system/newgroup-bundle-fresh.test.mjs` → 4 passed, 0 failed; `node scripts/bundles.mjs --check` → every guarded bundle fresh (no generated artifact staled).
- `format`: 0 failures; `architecture … bundler`: 0 failures; `coverage … bundler`: 30 of 30 live ids named, 0 failures; `ownership … bundler tranche/T36`: 0 failures (re-run after the commit below).

Size (session_01AVSxAcVVnwvGFa9niTqNUo): test runs 11, module lines 7856

## J2 · REPORT

Found in other modules (also in my record's Completion):
1. **installer** (newgroup): its `containerDescriptor` reads one `container.json` part. A member with two or more classes now carries one `Container` part per class, `container/<class_name>.json` (file-scanner: `container/FileScanner.json`, `container/SafeViewRenderer.json`). To install file-scanner the installer must read every `Container` part of a member. One-class members (agent-runner) are unchanged, byte for byte.
2. **Red 10** covers two assertions in `deploybindings.test.mjs`: the service-binding list (:165) and the pre-flight target list beside it, which now names `file-scanner`. One cause; both clear when T36-49 adds `FILE_SCANNER`.
3. **file-scanner** (T36-5): beyond B2's marker contract, its wrangler.jsonc `containers[]` entries must each name their class by `class_name` (`FileScanner`, `SafeViewRenderer`), or `deploy-fleet.mjs` refuses `[CONTAINER_UNDESCRIBED]` (config and marker classes disagree).
4. **bundler's requirements** (yours to word, if wanted): `bundles.mjs --install-dirs` (R30's install list, B2) is not stated in R21.

## J3 · COMPLETE

T36-2 complete on `job/T36/bundler`: R24–R30 as B2 confirmed (two-class members with `container/<class>.json` parts and per-class deploy; system package statements pinned by base digest, listed and asked of OSV under their ecosystem; `--sign` refused outside GitHub Actions before the seed is read, `--emit-plane`, `--plane-sig`, `bundles.mjs --install-dirs`). N733 applied: red 6 cleared. Reds 9 and 10 named as accepted.
The commands `release-sign.yml` calls, by usage line and in order, are in my record (Completion, "R30") and in `release-assemble.mjs`'s header.
Tests: module 88/88; fleetbundles 119 pass, 1 fail (red 9), no SKIP; deploybindings 35/2 (red 10, both assertions, see J2); resolveversion, bundle, newgroup-bundle-fresh green; every bundle fresh. Checks format, architecture, coverage (30/30), ownership: 0 failures.
