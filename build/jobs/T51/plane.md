# plane (T51)

**Status** · session_011vKkDz3Fp8T8FuWAfs336Z · depth 2 · RUNNING until 2026-10-19T20:19:30Z (bio-plane npm test (plane suite)) · handled B4

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

## J1 · COMPLETE

T51-125 applied; plane suite 264/264, migrate-released 1/1; format, architecture, coverage (66/66), ownership and words checks 0 failures. Details and findings for other modules in the record.

## Record: CHANGE B2 (K4076, instance-setup R95)
- `door.mjs` `publicOp`: the bootstrap report is handed `caller` as the control plane resolves it (`caseReader`, admission's `readerOf`): `{cls: "admin"}` for an admin-class token or an administrator's session, none otherwise (no credential, a member or unknown token, a store silence).
- `worker.test.mjs`: an admin token is told the seven facts; no credential, a member token and an unknown token are not (key set read from `BOOTSTRAP_FACT_KEYS`). `door.test.mjs`: 45 routes, `bootstrapfacts` driven.
- Verified with instance-setup's branch merged without committing (`git merge --no-commit`, then aborted): plane suite 265/265. `tranche/T51` does not yet hold instance-setup's change, so the two new assertions need it to merge first; on the tranche alone the admin assertion fails and the route count is 44.
- Checks: format, architecture, coverage (66/66), words, ownership: 0 failures.
- Size (session_01LkcRK7mT8LTN4K87RmmRdp): test runs 7, module lines 2306

## J2 · COMPLETE

CHANGE B2 applied: publicOp hands bootstrapOp the resolved admin caller; door.test counts 45 routes. Suite 265/265 with instance-setup's branch merged uncommitted; tranche/T51 alone needs instance-setup merged first for those two assertions. Checks 0 failures.

## Record: CHANGE B3 (K4098, control-plane R110)
- `store.mjs`: `controlPlaneOwnerOps` is handed `filings` and `actionPlans` getters. `t51.test.mjs`: `approvedunsent` and `checkpointsdue` answer through the plane (checked red without the getters). `door.test.mjs`: affordances' ops read from its map (its `affordancevocab` is new from the merged tranche), no pin.
- Merged `tranche/T51`. control-plane's change (the owner arms) is not on the tranche yet: with `origin/job/T51/control-plane` merged uncommitted (then aborted) the suite is 266/266 after the door.test fix; on the tranche alone two tests fail until it merges (the new one, and `op=sweeps` link-sweep R5, which control-plane's change also fixes). You merge plane after control-plane.
- Checks: format, architecture, coverage 66/66, words: 0 failures.
- Size (session_01LkcRK7mT8LTN4K87RmmRdp): test runs 10, module lines 2308

## J3 · COMPLETE

CHANGE B3 applied: filings and actionPlans getters handed to controlPlaneOwnerOps; both ops answer through the plane. 266/266 with control-plane's branch merged uncommitted; on the tranche alone 2 tests wait for control-plane to merge (merge it first).

## Record: CHANGE B4 (K4100, t50 R63 `groupidentity` 502)
- Diagnosis: not a route or wiring flaw. `groupIdentityOp` (and `instanceGroupOp`) ask the store stub `fetch("http://do/groupidentity")` with an address string, as a Durable Object stub accepts; `t50.test.mjs`' `askWorld` bound `env.STORE.get` to the bare `Store`, whose `fetch(req)` needs a Request, so the call threw and the door answered 502 `STORE_DID_NOT_ANSWER`. Screens-daily's Home reading is the first widest-screen read to go that way. Directly (`/groupidentity` through the store door) the route answers 200.
- Fix (test world, as the host builds it): `askWorld`'s stub wraps `fetch` to accept an address or a Request and delegates every other method. t50 8/8; plane suite 266/266; format, architecture, coverage 66/66, words: 0 failures. Nothing deferred; no other module affected.
- Size (session_01LkcRK7mT8LTN4K87RmmRdp): test runs 12, module lines 2308

## J4 · COMPLETE

CHANGE B4: the t50 R63 502 was the test world's store stub (a bare Store whose fetch needs a Request, asked with an address as a Durable Object stub accepts); fixed in the world, no plane flaw. Suite 266/266, checks 0 failures.

## J5 · COMPLETE

CR-24 (R67) applied: the ask's reading language is read from `translations` (`translationsOf(ctx).readingLanguage`, its R10) at `plane/ask.mjs`; instance-setup's delegate is no longer asked by the plane.
- `test/m/plane/door.test.mjs` (R1, R5, R67): instance-setup's routes are 36; translations' nine are compared against `translationsOps` and driven through the door; route set equals instance-setup's 36 plus translations' 9.
- `test/m/plane/t48.test.mjs` (R50, R67): the spy moves to `translations.readingLanguage`; controls unchanged (no language set answers LANGUAGE_NOT_SET; a malformed tag answers LANGUAGE_MALFORMED).
Deferred: none.

Found in other modules (for BOB, not fixed here):
- `checks/coverage.mjs` over all modules reports 7 modules with ids named by no test: agent-harness R17, agent-runner R36 R37 R38 R40, installer-steps R26 R31, instance-setup R99 (CHANGE after this merges, per CR-24), journey-check R19, screens-inquiry R83, screens-settings R62.
- Full `npm test` in bio-plane (all test/m, not only plane) shows 107 failures in other modules: journey-check (12 files), case-checker program R13/R25, doc-clean R4 (workerd memory). Plane's suite is green.

Tests and checks:
- `node --test "test/m/plane/*.test.mjs" test/system/migrate-released.test.mjs`: tests 267, pass 267, fail 0.
- door.test.mjs 6/6; t48.test.mjs 13/13.
- format 0 failures; architecture 0 failures; coverage (plane) 67 of 67; ownership (plane, tranche/T51, job/T51/plane) 0 failures; words 0 failures; `checks/run.mjs` ran: coverage fails only in other modules listed above.

Size (session_011vKkDz3Fp8T8FuWAfs336Z): test runs 4, module lines 2307
