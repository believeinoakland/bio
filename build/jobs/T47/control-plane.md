# control-plane (T47)

**Status** · session_01M87yGfszMDMfmEwotYyttN · depth 2 · WAITING ON BOB (J2) · handled B9

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
