# control-plane (T47)

**Status** · session_01M87yGfszMDMfmEwotYyttN · depth 2 · WORKING · handled B6

## J1 · QUESTION

Three readings I am building on; each is my best reading, and I carry on with it unless you answer otherwise.

1. **R83's `background=1` "passed to the session read".** The session read is admission's (`sessionPresented` → the store's `session` route, token in `x-bio-session`, no query; `admission/index.mjs`:313), and credentials' `session` arm reads `background=1` from that route's query (credentials J4 item 7). The door cannot add it there without changing admission. My reading: admission's job (T47-77) carries the session-read half (its `admit` reads `background=1` from the `url` the door already hands it, and adds it to its `session` lookup); the door's half is that `background=1` reaches the store's forward in the query (it does: the forward copies the caller's query) and is never stripped. I test the door's half; I add a test of the session-read half once admission provides it. If you want the door to pass it differently (e.g. a `background` argument to `admit`), say which.

2. **R84's logo at `GET /app/assets/group-logo`.** instance-setup R84 stores it (T47-75, not yet merged) and names no store route for the door's read. My reading: the door asks the `bio` store's store-internal route `grouplogo` (no spec, R2: no caller reaches it by name), which answers the bytes with their `content-type` (PNG or JPEG), and the door serves them `cache-control: no-store`, or 404 when the route answers none, refused or silent. Please tell me instance-setup's route name and answer shape once its job names them (a CHANGE is fine).

3. **`recover` takes `handle` (credentials R67, amending R47).** R83 names only `login`; R58 passes `recover`'s `role`, `code`, `password` from the body. Without `handle` a member cannot recover by handle through the door. My reading: the door passes `recover`'s `handle` from the body too (body only, never logged or echoed), as a flaw fixed in this job. Say if you want it left out.

Also for the record: R78 and R85–R87 are signin-door's (T47-91). I leave my copy as it is until your CHANGE announces signin-door's merge, then delete `signin.mjs` and route `subscriptionsignin`, `subscriptiondisconnect`, the revocation sign-out and `signintrace` to signin-door's exports. R81 waits on the five new screen modules (none exists on `tranche/T47` yet); `peopledirectory`, the T47 ops and the K3084/DEC-205 ops wait on op-declarations' specs (T47-53) for their tests to go green.
