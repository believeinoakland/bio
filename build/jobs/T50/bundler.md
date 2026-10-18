# bundler (T50)

**Status** · session_0113McfBYeb5TMfMs7CF8GJq · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Installer change owed for R33 (N1170), for BOB; its job is T50-78 (layer 11).

`release-assemble.mjs` now writes `instance_type` into each class's `container` part (inside the signed bytes), read from the member's `wrangler.jsonc` `containers` block. The installer does not pass it on, in two places in `newgroup/src/index.mjs`:
1. `containerDescriptor(bytes)` (line 880) returns only `{class_name, image, max_instances, bind}`, so a part's `instance_type` is dropped on reading.
2. `placeContainer` (line 977) creates the Containers application with `configuration: { image: d.image }` alone, so a team's container runs at the platform's default size (1/16 vCPU, 256 MiB; agent-runner's first start took 27 s at that size, per its wrangler comment), not the declared `standard-1`. The create body wants `configuration: { image, instance_type }` where the part states one, and nothing where it states none. A rollout of an existing application (`target_configuration`) should carry the same field.
The value is a size name string (`standard-1`) or the platform's custom size block, copied as stated. The installer's tests (`newgroup/test/requirements.test.mjs` around lines 929 and 1046) pin the create body and will need the field in a case that states one.

## J2 · COMPLETE

COMPLETE · bundler, T50-1 (entries R33, R34; fleetbundles hand list; N1107, N1156, N1171, N1170, N1153).

Entries applied
- `fleetbundles.test.mjs` (K3353, K3568): "agent-worker's 28 inputs are all recorded" is gone with its hand roster and its re-pin history. Two assertions in its place: the committed manifest records exactly the first-party files a fresh build of agent-worker reaches (esbuild's metafile, `buildMember` with `write: false`), none missing and none extra; and each carries the size the build read, the member's entry among them. A non-empty control follows. That test no longer fails, which clears plan rule 5 (4).
- R33 (amends R25): `fleet-bundle.mjs` `containerInstanceTypes(member)` reads each class's `instance_type` from the member's `wrangler.jsonc` `containers` block by `class_name`; `containerParts` writes it into that class's part after `max_instances`, for agent-runner (one class) and file-scanner (each class its own). A block that states none is emitted without the field. A stated value that is neither a non-empty string nor a non-empty size block, or a configuration that does not parse, is refused `CONTAINER_UNDESCRIBED` naming `instance_type`, before anything is written. Tests: the sized member inside the signed part, one case with per-class sizes and a custom block; control, none stated (same bytes as before); control, six malformed values refused, writing nothing. The test helper `expectedPayload` now states the sized part by hand.
- R34 (amends R18): `deploy.mjs` reads the script's bindings before the PUT (`bindingsNow`: 404 is a new script with none; an unreadable answer refuses `[BINDINGS_UNREADABLE]`, exit 1, before any upload). It compares each derived `plain_text`, `service`, `r2_bucket` and `browser` binding with the script's (a `secret_text`'s value cannot be read back, so it is not compared) and skips only when bytes, served version, limits and bindings all match; otherwise it is a metadata deploy, reported as such with each difference named. Every `plain_text` on the script that R13 does not derive is sent again unchanged (the PUT replaces the bindings and `keep_bindings` does not carry that class; a name R13 derives wins). `keep_bindings` is unchanged. The line saying the instance "serves" another version is now printed only when it does. Tests: five differences (missing service, service elsewhere, plain_text of another value, bucket of another name, bucket missing) each give one metadata upload adding R13's bindings and keeping an undeclared `plain_text`; different bytes keep the undeclared ones and R13's value of MODE wins; control, everything present and matching uploads nothing; control, unreadable settings refuse. The R18 "nothing to do" test now holds the derived bindings on the script; the stub account (`stubfetch.mjs`) now stores a PUT's bindings in the script's settings.

Deferred: none.

Found in another module
- installer (newgroup), against its requirements for the container part: see J1. If the installer does not carry `instance_type`, R33's field is signed and published but a team's container still runs at the default size.
- The requirements file `build/requirements/bundler.md` still marks R33 and R34 `*(not yet met: T50)*`: BOB's to clear (not my file).
- `checks/format.mjs` reports 2 failures in `build/rulings.md` (K3441, K3597, standing-list decisions): BOB's file, not mine.
- `fleetbundles.test.mjs` still reds on the plane bundle (4 assertions, "bio-plane: … byte-identical", D-298 arm): the accepted rule 5 (12), regenerated at the layer close.

Tests and checks (from the repository root and the process repository)
- `node --test bio-plane/test/m/bundler/*.test.mjs`: bundler 31 pass 0 fail; release 59 pass 0 fail; thirdparty 15 pass 0 fail.
- `node --test bio-plane/test/system/bundle.test.mjs`, `deploybindings.test.mjs`, `resolveversion.test.mjs`: 1 pass each, 0 fail. `bio-plane/test/fleetbundles.control.mjs`: ran to its end, every restore verified.
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: 4 FAIL, all the plane bundle (accepted red, above); no other.
- `node checks/architecture.mjs <bio> bundler`: 24 product files, 59 relative imports; 0 failures. `node checks/coverage.mjs <bio> bundler`: 34 of 34 live requirement ids named by a test; 0 failures. `node checks/ownership.mjs <bio> bundler tranche/T50`: 0 failures. `node checks/format.mjs <bio>`: 2 failures, both in `build/rulings.md`.

Size (session_0113McfBYeb5TMfMs7CF8GJq): test runs 12, module lines 3577

## J3 · COMPLETE

COMPLETE · bundler, T50-1, CHANGE B2/B3 (ocr-worker's cross-tree inputs).

Merged tranche/T50 (with job/T50/ocr-worker) into the job branch. `fleetbundles.test.mjs` no longer hand-lists ocr-worker's cross-tree inputs: it asserts the manifest's `../` inputs equal exactly those a fresh build of ocr-worker reaches (metafile, nothing written), and that they still span the renderer's tree and the plane's. Both pass; ocr-worker's static arm is green on the merged tree.

Tests and checks: `fleetbundles.test.mjs` 4 FAIL, all the plane bundle (accepted rule 5 (12)); architecture, coverage (34 of 34), ownership: 0 failures. The earlier COMPLETE (J2) otherwise stands.

Size (session_0113McfBYeb5TMfMs7CF8GJq): test runs 14, module lines 3577
