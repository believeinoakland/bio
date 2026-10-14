# control-plane (T47)

**Status** · session_01M87yGfszMDMfmEwotYyttN · depth 2 · WORKING · handled B18

## J1 · QUESTION

Three readings I am building on; each is my best reading, and I carry on with it unless you answer otherwise.

1. **R83's `background=1` "passed to the session read".** The session read is admission's (`sessionPresented` → the store's `session` route, token in `x-bio-session`, no query; `admission/index.mjs`:313), and credentials' `session` arm reads `background=1` from that route's query (credentials J4 item 7). The door cannot add it there without changing admission. My reading: admission's job (T47-77) carries the session-read half (its `admit` reads `background=1` from the `url` the door already hands it, and adds it to its `session` lookup); the door's half is that `background=1` reaches the store's forward in the query (it does: the forward copies the caller's query) and is never stripped. I test the door's half; I add a test of the session-read half once admission provides it. If you want the door to pass it differently (e.g. a `background` argument to `admit`), say which.

2. **R84's logo at `GET /app/assets/group-logo`.** instance-setup R84 stores it (T47-75, not yet merged) and names no store route for the door's read. My reading: the door asks the `bio` store's store-internal route `grouplogo` (no spec, R2: no caller reaches it by name), which answers the bytes with their `content-type` (PNG or JPEG), and the door serves them `cache-control: no-store`, or 404 when the route answers none, refused or silent. Please tell me instance-setup's route name and answer shape once its job names them (a CHANGE is fine).

3. **`recover` takes `handle` (credentials R67, amending R47).** R83 names only `login`; R58 passes `recover`'s `role`, `code`, `password` from the body. Without `handle` a member cannot recover by handle through the door. My reading: the door passes `recover`'s `handle` from the body too (body only, never logged or echoed), as a flaw fixed in this job. Say if you want it left out.

Also for the record: R78 and R85–R87 are signin-door's (T47-91). I leave my copy as it is until your CHANGE announces signin-door's merge, then delete `signin.mjs` and route `subscriptionsignin`, `subscriptiondisconnect`, the revocation sign-out and `signintrace` to signin-door's exports. R81 waits on the five new screen modules (none exists on `tranche/T47` yet); `peopledirectory`, the T47 ops and the K3084/DEC-205 ops wait on op-declarations' specs (T47-53) for their tests to go green.

## J2 · REPORT

Progress, and four findings in other modules (none changed by me).

**Done on `job/T47/control-plane` (42ef4088a9, `tranche/T47` merged at 04ebca954f):** R80 (no page credential), R82 (`/` answers `interfacePage`, no `setupPage` route), R83 (`login` by `handle`/`password`/`device`, no `role`; `recover`'s `handle` per K3144; `passwordresetlook`/`passwordreset` credential-free, pinned to `bio`, body only; `background: true` and `body` handed to `admit`, `{background}` to `readerOf`, the query kept), R84 (`/app/assets/group-logo` from `grouplogo`, PNG/JPEG only, `no-store`, `nosniff`, else 404), R88 (`projectbarset` in `IDENTITY_READS`, its `author` by `DECLARATION_ACTIONS`' expression), K3145 (`clockpropose` through the door's own map, `of.actionClocks().clockPropose`), the R20 ×3, R45, R64 ×2 reds cleared (tests on `caseInputsOps`), B2 (1)'s imports dropped (the e2e signs in through the real `login` by handle).

**Module tests:** 255, 246 pass, 9 red, each waiting on another merge: R79 ×2, R83 ×2, R88, R89 and R53 on op-declarations' specs (T47-53); R83's background test on ADMISSION #10's `admit`/`readerOf` (T47-77); totality R2/R41 (K3147, accepted).

**Findings:**
1. **plane (T47-66):** `src/plane/store.mjs` spreads `caseAuthoringOps` but not `caseInputsOps` (lines 56, 712), so in the real plane `statementack`, `whatchangedpropose` and `whatchangeddrafts` have no store route since K3116. My tests drive `caseInputsOps` directly; the composed plane needs the spread.
2. **plane (T47-66):** `clockpropose` (K3145) is served by `controlPlaneOwnerOps`, which now asks `of.actionClocks()`; plane's `of` (store.mjs:790) must add `actionClocks: () => <action-clocks' instance>`, else the composed route throws.
3. **op-declarations R56's control** ("an `ai` credential is not admitted to `sourceof`") does not hold through the door: admission's member reach admits a member-scoped `ai` credential to an op whose classes are `admin`, `member`, `probe` (as it admits one to `airundispatch`). I test R79's half (a member's session reads it, `viewer` stamped) and leave that control to op-declarations/admission.
4. **instance-setup:** `setup.mjs` also exports `groupLogoAsset` (a silence answered 502). I serve the logo with my own read in `app.mjs`, because R84 says "or 404" and its module was unmerged; say if you want me to call instance-setup's helper after its merge instead.

Next: I wait for op-declarations, admission, signin-door (its CHANGE) and the five screen modules (R81).

## J3 · QUESTION

B8 (K3149) says "serve the logo through `groupLogoAsset`", and B9 (K3150) says "(4) your own logo read stands". After B8 I switched to `groupLogoAsset` (commit 2f864f073a's parent; a silence, a refusal or a non-image type answers 502 `STORE_DID_NOT_ANSWER`, none set 404). My best reading is that B9's "stands" answers J2 as asked before B8, and B8's instruction governs: I keep `groupLogoAsset`. If you meant my own read (every failure 404), say so and I revert it; either is one small change with its test.

Also done: B9's two re-pins (envelope R22 pinned to C-138.1–.17; doorbell R2 with `sourceof`/`sourcerung` in both session sets), each red until tasks (T47-?) and op-declarations (T47-53) merge.

## J4 · REPORT

B10–B12 done: `tranche/T47` merged (op-declarations, admission, tasks, action-producers in), the 20 reds K3157 names fixed. Branch at 2e044be1b2's parent (pushed).

**Module tests:** 256, 255 pass, 1 red. What fixed the reds: my harness's store now answers admission's `reauthdue` (`{due: null}`, the window open; a test that wants it shut answers it itself), and `opCalls` leaves that read out; the T47 tests re-pinned to op-declarations' specs (`grouplanguages` a public read pinned to `bio`; K3041's four publish reads in both session sets in doorbell R2). One flaw fixed in the door: a body's `session` is now stripped for an op whose `session` the door carries (`signout`, `unlock`, `reauth`), as its `by` and `viewer` already were (R29, R59).

**The one red is not this module's:** totality R2/R41 (`totality.test.mjs`:20): affordances' `unaccounted` names `statementack` and `reviewcomment` unpublished. op-declarations (K3041) gave the publish screen's four ops `NEEDS` rows, and affordances neither publishes those two nor lists them in `NON_ACTS`. Fix belongs to affordances (or op-declarations); nothing in the door changes it.

**Checks:** format 0 failures; ownership 0 failures (17 files). Architecture 8 failures, all `modules.json` edges my tests need (my requirements' Uses names each, T47 entry): control-plane → `case-inputs` (tests only: statementack, digest-channel, r45-routes, N908 §5), `project-roster`, `citation`, `strength`, `people` (t47-door's owner-map checks for R79, R88, R89). Please add the five edges. Coverage: R78 and R87 named by no test: both move to signin-door (T47-91); I expect your CHANGE at its merge to retire them here when I delete my copy.

**Still open:** signin-door's CHANGE (delete my copy, route to it); R81 (the five new screen modules); plane's tests against my branch are running now (P11), result in my COMPLETE.

## J5 · COMPLETE

T47-65 complete as far as the merged providers allow; two items stay open on other jobs' merges (below), each to be done on your CHANGE.

**Reading set (mechanics §17; K2032).** I read whole: `build/requirements/control-plane.md` (public and private), every file of `bio-plane/src/control-plane/` (`index.mjs`, `app.mjs`, `signin.mjs`, `owner-ops.mjs`, `draft.mjs`, `archive.mjs`, 3,792 lines), my entry T47-65 and T47-91 in `build/plan/current.md` and its opening rules; and of each used module the services my entry names: op-declarations R55–R61, credentials R64–R71 and its map arms, admission's `admit`/`readerOf`/`reauthdue` (its T47 job), interface-shell R1, R9, R21, R28, R30–R38, instance-setup R84–R86 and `groupLogoAsset`, strength R40 and its map, the owners' arms of `projectlist`, `projectquestions`, `drawquestion`, `monitorset`, `peopledirectory`, `sourceof`/`sourcerung`, `capturerequest`, `heldcaptures`, action-clocks' `clockPropose`, signin-door's requirements. My 49 test files (≈595 KB, over the limit) were read in full by two helpers who wrote digests citing each file and line (`harness`/`record`/doorbell/envelope/t34/t36/t37/t41/t46-door/t46-e2e/t46-app/statementack/r45-routes/digest-channel/door-routes; and the other 35); I read whole every test I changed. I read my own code whole (P20) and fixed the one flaw I found (below).

**Entries applied.**
- R79: T47's new ops routed through their owners' maps with the declared stamps (`projectlist`, `projectquestions`, `drawquestion` as `cite`, `projectbarset` as `strengthbar`, `monitorset`; `sourceof`/`sourcerung` for a member's session; a member's own `capturerequest` with `principal` `member:<id>`; `heldcaptures`' `state`); K3145 `clockpropose` through the door's own map (`of.actionClocks().clockPropose`).
- R80: `airundispatch` takes no credential from the page: `dispatchMemberRun({run, by, viewer, at})`, `by`/`viewer` the session's member; any presented credential reaches nothing.
- R82: `/` answers `interfacePage` (the page `/app` answers), no route serves the setup page.
- R83: `login` passes `handle`, `password`, `device` from the body, no `role`; `recover` its `handle` too (K3144); `passwordresetlook`/`passwordreset` credential-free, pinned to `bio`, body only, `source`/`country` the door's; `unlock`/`reauth`/`passwordresetlink` through the general path with `session`/`by` stamped; `background=1` handed to admission as `background: true` (`admit`, `readerOf`) and kept in the store's query; `admit` also gets the request's parsed `body` (admission R23, R25).
- R84: `GET /app/assets/group-logo` through instance-setup's `groupLogoAsset` (K3153); `grouplanguages` relayed credential-free from `bio`; `grouplogoset`/`grouplanguagesset` through the general path, `by` stamped.
- R88: `projectbarset` in `IDENTITY_READS` (and so in the viewer block), its `author` by `DECLARATION_ACTIONS`' expression.
- R89: `peopledirectory` through people's map, `viewer` stamped (op-declarations R61's spec).
- Tests re-pointed to `caseInputsOps` and its checks (statementack, digest-channel, r45-routes; N908 §5), clearing K3116's R20 ×3, R45, R64 ×2; K3150 and K3164 re-pins (C-138.1–.17; `sourceof`/`sourcerung` and K3041's publish reads in both session sets; DISCLOSURE_DUE C-29.40; `blob:` in `img-src` alone); B2 (1) the e2e's setup-page imports dropped (it signs in through the real plane's `login` by handle); K3157's 20 reds fixed (the harness answers admission's `reauthdue`, `{due: null}`).
- Flaw fixed: a body's `session` is now stripped for an op whose `session` the door carries (`signout`, `unlock`, `reauth`), as its `by` and `viewer` were (R29, R59).

**Open, waiting on other merges (your CHANGEs):**
- signin-door (T47-91): delete `signin.mjs` and route `subscriptionsignin`, `subscriptiondisconnect`, the revocation sign-out and `signintrace` to it; R78 and R85–R87 retire here then. Until then my copy stands (R65), and envelope's R32/R39/R46 wire check is red on C-69.7 `SIGNINTRACE_NOT_TEST` (answer-envelope's row for signin-door's `signintrace`, which the door raises only once routed); coverage misses R87.
- R81: the five new screen modules (`screens-entry`, `-wizards`, `-investigate`, `-publish`, `-action`) are not yet on `tranche/T47`; `APP_SCREENS` still holds the four T46 modules, and R81's e2e additions wait with them.

**Found in other modules (reported in J2, J4):** plane `store.mjs` spreads no `caseInputsOps` and needs an `actionClocks` getter for `clockpropose` (sent to plane, K3150); op-declarations R56's `ai` control vs admission's member reach (N1045); affordances: `statementack` and `reviewcomment` unpublished in totality R2/R41 (forwarded, K3163). No generated artifact read by this module was changed; the plane bundle is staled as by any merge (rule 5 (4)).

**Tests and checks** (on `job/T47/control-plane`, `tranche/T47` merged at K3164):
- `node --test test/m/control-plane/`: ℹ tests 256, ℹ pass 254, ℹ fail 2 — totality R2/R41 (affordances', K3163) and the wire check's C-69.7 (signin-door's merge).
- Users' tests (P11), `node --test test/m/plane/ test/system/migrate-released.test.mjs`: ℹ tests 224, ℹ pass 217, ℹ fail 7 — plane's own composition (accepted.test R1/R5 instance-setup's 40 routes, R17 build order, R19 registration, R33, R38, R39 case-authoring's `registerOpenRequests`, R5/R9 project-roster's map; plane T47-66's and rule 5's windows); none reaches the door.
- `node checks/format.mjs`: 0 failures. `node checks/architecture.mjs … control-plane`: 0 failures (after K3163's edges). `node checks/coverage.mjs … control-plane`: 61 of 62, R87 (signin-door's). `node checks/ownership.mjs … control-plane tranche/T47`: 18 files, 0 failures. `node checks/run.mjs /home/user/bio`: format 0, architecture 0 failures (3,144 files), coverage 13 failures (control-plane's R87; the rest unmerged L11 modules), channels 0.

Size (session_01M87yGfszMDMfmEwotYyttN): test runs 34, module lines 3792

## J6 · COMPLETE

T47-65 complete, every entry applied (B15–B18 included). Branch `job/T47/control-plane` @ 9160703366, `tranche/T47` merged at K3169.

**Since J5:**
- B16 (K3167): `signin.mjs` deleted; the door routes `subscriptionsignin`, `subscriptiondisconnect` and `signintrace` to signin-door's `subscriptionSignin`, `subscriptionDisconnect`, `signintrace` with `by` the session's member, the request's parsed body and an ask of the store addressed; a revocation's sign-out through its `leaverOf`/`signoutLeaver`; an ask (plane's arm) or a draft (the draft path, `textcheck`) answered `SIGNIN_TOKEN_REFUSED` through its `tokenRefusedSeen`. My tests of the moved ids are gone (they are signin-door's); the door's routing is tested under R2 (t37-door: start, state, disconnect, revocation, signintrace with C-69.7), and the sweeps skip signin-door's three ops as they skipped `subscriptionsignin`.
- B17/B18 (K3168, K3169): R81: `/app`, `/app/<path>` and `/` answer `interfacePage` over the nine screen modules' `SCREENS` (entry, settings, intake, daily, inquiry, wizards, investigate, publish, action) with screens-wizards' `GUIDE` as `options.guide` (interface-shell R31); the public frame's addresses (`/app/doorbell`, `/app/published/<case>`) served alike, nothing read. R81's end-to-end suite (`t47-e2e.test.mjs`, Miniflare and the real plane): Home's projects from `projectlist` with their counts from `projectquestions`; a wizard ("Check a claim") started from a Home front door through `startfrom`, `wizardread`, `wizardprogress`, the guide running in the dock; `/app/doorbell` with no session handing a file and a note over through `knock` with no Authorization header, read back in the founder's inbox. A helper drafted it; I read it whole and ran it.

**Tests and checks:**
- `node --test test/m/control-plane/`: ℹ tests 257, ℹ pass 257, ℹ fail 0.
- Users' tests (P11), `node --test test/m/plane/ test/system/migrate-released.test.mjs`: ℹ tests 224, ℹ pass 217, ℹ fail 7: the same seven as at J5 (plane's composition: instance-setup's 40 routes, case-import/case-account build order, R19 registration, R33, R39 `registerOpenRequests`, project-roster's map; plane T47-66's), none reaching the door.
- format 0 failures; coverage 57 of 57; ownership 24 files, 0 failures; `checks/run.mjs`: format 0, channels 0, coverage 2 failures (other modules').
- architecture: **1 failure, an edge for you**: `control-plane/index.mjs` imports `signin-door` (B16's routing), which `modules.json` does not list in control-plane's uses (signin-door is earlier in L11, so the edge points back). Please add control-plane → signin-door.

**Found in other modules:** none new. Still open elsewhere from J2/J4: plane's `caseInputsOps` spread and `actionClocks` getter (T47-66); op-declarations R56's `ai` control (N1045). The helper noticed `startfrom` offers "Get a record" behind no door on a fresh instance (wizard-scripts' `startFrom` shows only scripts offered to the viewer), likely by design; not a finding.

Size (session_01M87yGfszMDMfmEwotYyttN): test runs 46, module lines 3,736
