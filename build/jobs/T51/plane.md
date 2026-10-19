# plane (T51)

**Status** · session_01LkcRK7mT8LTN4K87RmmRdp · depth 2 · WORKING · handled B1

## Record (PLANE #41, T51-125)

**Entries applied**
- R24: `plane/screens.mjs` deleted (the 21 legacy entries); `store.mjs` hands `answers` `wizard-scripts`' `SCREEN_REGISTRY` (no copy); `wizards.mjs`' `screenFailures` defaults to it, reads `name` for `title`, and leaves `owed` apart. `t43`, `release`, `words` follow; `release` reads the screen count from the design's `registry.json` (71 in the file today, 73 after BOB's regeneration; the test accepts 71 up to the file's count).
- R64: `package.json` `build` is `node scripts/build-plane.mjs`; `embed:sign` deleted; `worker.test.mjs` pins both; its stale comment/title at :43 now says the interface page at the root.
- R65, R66 (new `t51.test.mjs`): the T51 reads are in the route map through their owners' maps and answer through the door as the owners' maps do; ops are read from `maps.mjs` (`opsServedBy`, `servedThroughDoor`: new helpers over `ownMaps`), never listed.
- K3997 `compose.test.mjs`:84 (the inherited red) cleared; `accepted`, `docket`, `t46`, `t47`, `t48`, `t50` hand-lists replaced by the owners' maps.
- K4051: `filingsOf` is handed `env` (`store.mjs`), so filings R64's registration with case-inputs runs in production; `t51.test.mjs` pins it with a bare-host control (checked red without the change).
- Words: 9 findings and the 6 test copies cleared (`release` keys, `hosts`/`t36` name the refusal by its declaration `CAPTURE_CREDENTIAL_CHECKS`, `disclosures`/`t39` assertion messages). `words.mjs plane`: 0 failures; over the whole product no line names the plane.

**Deferred:** none.

**Found in other modules (for BOB)**
- `bio-plane/src/setup-words/rows.mjs` still holds the `plane.screens.*` rows (stale until BOB regenerates; `build.mjs --check` names one).
- `docs/development/ux-substrate/screens/words-reads.json` still lists the 26 `screen.*` keys for plane (the design lane's file); `words.test.mjs` no longer asserts them.
- `screen-registry.mjs` holds 71 screens; R24 expects 73 after regeneration (`glossary`, `actionnew`).
- `op-declarations` does not yet declare R77's reads or `holdsdue`, `templatebyhandle`, `rulefields` (`OPS`); the plane's tests do not depend on it.
- `scripts/embed-signpage.mjs` and the comment in `scripts/fleet-bundle.mjs`:24 remain (control-plane's / bundler's).
- `answers` reads no `deps.screens` (as the requirement already notes).

**Tests and checks**
- `node --test "bio-plane/test/m/plane/*.test.mjs"`: tests 264, pass 264, fail 0 (before: 258, 1 red inherited).
- `bio-plane/test/system/migrate-released.test.mjs`: pass 1, fail 0.
- format 0 failures; architecture 0 failures; coverage 66 of 66; ownership 22 files, 0 failures; words (plane) 0 failures; `setup-words build --check`: stale rows, expected.

Size (session_01LkcRK7mT8LTN4K87RmmRdp): test runs 5, module lines 2295
