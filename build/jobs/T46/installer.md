# installer (T46)

**Status** · session_01JbscthhJabkciTjspMmhzL · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R49 'the bundled source hold no such name': my reading is the installer's own code. The test checks newgroup/src (index.mjs, ui.mjs, signers.mjs and the new images module) and newgroup/dist/newgroup.bundled.mjs with the embedded plane release's RELEASE_SOURCE literal taken out. From 0.83.0 the plane itself (ai-runs R78) reads CIVICSMITH_TEST_INSTANCE, so the signed release the installer embeds will carry the name, and that is the plane's text, not the installer's. I am going ahead on this reading; it does not block the rest of the job.

## Completion (INSTALLER #11)

**Read.** I read these whole myself: my requirements (`build/requirements/installer.md`) and my START (B1). I read all of my own code: `newgroup/src/index.mjs`, `ui.mjs`, `signers.mjs`, `scripts/embed-release.mjs`, and the head of the generated `release.mjs`; the release payload itself is generated, so it was not read. I read all of my tests: `newgroup/test/fixture.mjs`, `requirements.test.mjs`, `wizard.test.mjs`, `embed.test.mjs` and `bio-plane/test/system/newgroup-bundle-fresh.test.mjs` (P20). I also read the plan entry T46-60 and `draft-T46-trial.md` §0 (finding 7), §1.1–§1.2 and §3.1–§3.3.

For the rest of the set (mechanics §17 (3)), one helper in this session read whole the public parts of the modules I use: `bundler`, `signatures`, `instance-setup`, `jurisdictions` and `test-support`. It also read layer 11's contract in `build/layers.md` and found where `CIVICSMITH_TEST_INSTANCE` and `PUBLIC_IMAGE` appear in the tree. It gave me a digest citing each id. The sources stay binding.

**Entries applied (T46-60).**
- **R38 (T46).** The fleet step's image check now lives in a new `newgroup/src/images.mjs`, held once for the fleet step and the pages.
  - An image pinned by digest in a registry the default policy cannot pull (GitHub's registry, today) is left out with "this release's image is not yet published where your Cloudflare account can pull it", beside R38's words for what your group's Civicsmith then lacks.
  - An image not pinned by digest is named "this release does not pin its image to one exact build (a sha256 digest), so it cannot be checked".
  - "not a public registry image" is said nowhere.
  - `CONTAINER_LACKS` moved into `images.mjs`, unchanged.
- **R23 (T46).** The embed (R26) now also writes `RELEASE_CONTAINERS` into `release.mjs`: `[{member, class_name, image}]`, read only from the release's signed fleet statement. The embed refuses if the fleet signature does not verify against `ARMED_SIGNERS`, if a `Container` part is missing or its bytes differ from what was signed, or if a description names no class and image. A release naming no signed fleet yields `[]`.
  - The install page (in "What you need") and the update page (in "What happens") carry `LEFT_OUT`, before the act that begins the install. It is one line per member: what the part provides, why it is left out, and what your group's Civicsmith then lacks.
  - With today's embed (0.82.0, GHCR images), both pages name `agent-runner` and `file-scanner`.
  - The pages add that a newer repository release, if one is used, is reported again part by part on the progress page.
- **R49.** The installer already wrote, read and named no such binding. It is now tested:
  - no install or update upload (the plane's or a member's) carries it;
  - `/begin` keeps none;
  - no page names it;
  - an update leaves a secret its deployer set exactly as it was, and deletes nothing;
  - `newgroup/src/*.mjs` and the bundle hold no such name, with the embedded plane release's `RELEASE_SOURCE` excluded, as accepted in B2 (K2998).
- **R48.** Left out, as B1 directs: Bob had not named the address by L11's START. A `test.todo` names it and its cause, so coverage names the id while it stays not met (carried to T47).

**Files.**
- `newgroup/src/images.mjs` (new), `src/index.mjs`, `src/ui.mjs`, `scripts/embed-release.mjs`.
- Regenerated: `src/release.mjs` (embed re-run; the same signed 0.82.0 plus the `RELEASE_CONTAINERS` line) and `dist/newgroup.bundled.mjs` (`npm run build`).
- `test/requirements.test.mjs`: new R38 (T46), R23 (T46) ×2, R49 and R48-todo tests. The three older R38 assertions that pinned the retired words now read the new ones.
- The GATE line of `newgroup-bundle-fresh.test.mjs` names `images.mjs`.

**Controls (run, then restored).**
- `IMAGE_UNPULLABLE` set back to the old words: 4 tests fail (R23 (T46), R38, R38 (T36), R38 (T46)).
- `CIVICSMITH_TEST_INSTANCE` added to `uploadUpdate`'s bindings: 2 fail (R49, and R17's exact binding list).

**Flaws in my own module.** None found beyond the retired wording this entry replaces. Nothing is deferred.

**Other modules.**
- No module's generated artifact is made stale. The installer's own bundle is regenerated and fresh.
- `release.mjs` now carries one more export. Only the installer reads it, and the bundle-fresh guard's arms (A)–(C) hold.
- Nothing new found against another module's requirements: draft-T46-trial §0 finding 7's in-copy gaps are already other L11 entries.

**Tests and checks.**
- `npm test` in `newgroup/`: embed 23 passed, 0 failed; wizard 209 passed, 0 failed; requirements 57 tests, 53 pass, 0 fail, 4 todo (R13, R24, R43's shipped keys, R48).
- `node --test bio-plane/test/system/newgroup-bundle-fresh.test.mjs`: 4 passed, 0 failed.
- Process checks for this module, all with 0 failures:
  - `format`: 159 modules.
  - `architecture installer`: 18 product files.
  - `coverage installer`: 49 of 49 live ids named.
  - `ownership installer tranche/T46`: 9 files.
- `node checks/run.mjs` over the product: format 0 failures, architecture 0 failures, channels 0 failures. Coverage has 15 failures, all in other L11 modules whose jobs have not merged (action-producers, answer-envelope, control-plane, instance-setup, interface-*, screens-*, notice-producers, op-grades, setup-page, setup-words, wizard-scripts). None is installer's.

Size (session_01JbscthhJabkciTjspMmhzL): test runs 7, module lines 2626

## J2 · COMPLETE

T46-60 is done on job/T46/installer.
- R38: a container image the account cannot pull (GHCR) is named per part: 'this release's image is not yet published where your Cloudflare account can pull it', with what your group's Civicsmith then lacks.
- R23: the embed records the signed fleet's container classes (RELEASE_CONTAINERS); the install and update pages name each member that cannot install before the install begins. Today's 0.82.0 embed names agent-runner and file-scanner.
- R49: tested on the installer's own source and bundle, as accepted in K2998.
- R48: left out as B1 directs; a test.todo names it, carried to T47.
Results: npm test passes (embed 23/0, wizard 209/0, requirements 53 pass, 0 fail, 4 todo); bundle-fresh 4/0; format, architecture, coverage and ownership 0 failures for installer. The installer bundle and release.mjs were regenerated by me (both mine). The record has the details. Installer uses no unmerged L11 service, so it can merge whenever its turn comes.
