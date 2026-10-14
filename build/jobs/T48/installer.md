# installer (T48)

**Status** · session_01FJwBuMxzVKopTjwTCEXYxZ · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

R55 is clear except two points in the words; I read them as below and carry on (no stop needed):

1. `installer.update.chosen` carries `{date}`, but R55's address carries only `?version=<V>` and the release manifest (`RELEASE.json`) holds no date (only the release notice, bundler T48-4, does). Best reading: the update page draws the chosen line without the date clause ("This update: release V, the release chosen in your group's Settings › Updates"), fetching nothing when the page is drawn. If you want the date, either the address must carry it (it is then unsigned display text) or the installer must fetch and verify the notice (a new check R55 does not list).
2. "a link back to Settings › Updates" on the no-release page: the installer does not know the group's address before Cloudflare. Best reading: the page names Settings › Updates in words and links back to the page the reader came from (the group's own address, from the referrer's origin, set by the page's script), with no link when there is none.

Also, unrequested but safe, I add: an update refuses V older than the release the group's Civicsmith runs (read before the upload), as a stop with nothing changed.

## J2 · COMPLETE

**T48-79 applied: R55 met; R43 amended and met.** Answers B2 followed (dateless chosen line; back link by the referrer's origin, none when there is none; no older-version refusal, a roll-back installs). B3 followed: `newgroup/dist/newgroup.bundled.mjs` not regenerated.

**Read, whole:** `build/requirements/installer.md`; `newgroup/src/index.mjs`, `ui.mjs`, `signers.mjs`, `release.mjs` (head); `newgroup/test/fixture.mjs`; the tests naming R1, R2, R17, R43, R52, R54 (their parts that changed); of `signatures` `RELEASE_KEYS` and `verifyReleaseNotice`'s requirement lines (R45–R48); of `instance-setup` R90; `words-t48.json` (`installer.update.*`).

**Entries applied (T48-79):**
- `GET /update?version=<V>`: V of `signatures` R47's form draws the chosen page (chosen line without the date, "this page installs that release and no other", the checked line, "Continue to Cloudflare to update"); anything else draws "No release was chosen." with Settings › Updates named and a link back (referrer's origin). Only `version` is read from the address.
- `POST /begin` (update): V required, else 400 "No release was chosen."; V rides in the cookie (`r`); a cookie without it draws the same page at the callback. An install takes no version.
- `selectChosen`: the repository's release when its manifest names exactly V, else the built-in when V is its version, else a stop; bytes hashed to the manifest, `sig` verified in `NS_RELEASE` against `ARMED_SIGNERS`, plane limits stated (R20); no keys armed is a stop. R8's newer-than-built-in rule no longer chooses for an update.
- Progress states in the design stream's words: updating (`progress.title`, `says`, `verified`, `read`, `placing`, `answers`), a stop (`stopped` in three parts, "Try again" link to `/update?version=V`), finished (`done.*`, "Back to your group's Civicsmith"). Buckets are now created after every check that can stop the update, so a stop changes nothing (no non-GET call).
- R43: `signers.mjs` now builds `ARMED_SIGNERS` from `signatures`' `RELEASE_KEYS` (no key literal in the installer); still an array of its own so tests arm a key.

**Tests:** new `newgroup/test/t48.test.mjs` (9 tests: R55 words compared with `words-t48.json`; page and invalid-V controls; `/begin`; install and finish; not found; V decides over the newest; each failed check (stranger key, unsigned, wrong namespace, changed byte, limits unstated, no keys, repository down) and a refused upload; R43). Existing tests adjusted for R55 (update arms name a V; finished and stop words). Negative controls run: dropping the exact-version test, the no-keys stop, each fails a named test.
- `node test/wizard.test.mjs`: 209 passed, 0 failed. `node --test test/requirements.test.mjs test/t47.test.mjs test/t48.test.mjs test/embed.test.mjs`: 71 tests, 68 pass, 3 todo (R13, R24, R48), 0 fail before the merge of `tranche/T48`; after it, 1 fail: t47 R53 (`civicsmith.css` stale in the committed bundle, accepted by name in B3) plus `bio-plane/test/system/newgroup-bundle-fresh.test.mjs` (same cause, the committed bundle).
- Checks: format 168 modules, 0 failures; architecture installer: 19 product files, 46 relative imports, 0 failures (whole product 0 failures); coverage installer: 55 of 55 live ids named; ownership: 10 files, 0 failures. `checks/run.mjs` coverage shows 21 failures, none in installer (op-grades R38, plane R52, queue R54 and the screens modules: not mine).

**Deferred:** the date in `installer.update.chosen` (waits for the dateless key; the manifest carries none). The Settings link goes to the group's address, not the Updates screen (the installer knows no screen route).

**Found in other modules:** none. `newgroup/dist/newgroup.bundled.mjs` is stale against my change and against `interface-assets`: BOB regenerates at L11's close (`npm run build` in `newgroup/`).

Size (session_01FJwBuMxzVKopTjwTCEXYxZ): test runs 14, module lines 2681
