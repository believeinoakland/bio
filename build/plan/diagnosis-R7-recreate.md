# Diagnosis R7: re-creating biosmoke8's room (new generation, `--store-location wnam --store-generation 2`)

**Status** · diagnosis worker for BOB, local only (Miniflare and node). Nothing was contacted (no biosmoke8, no workers.dev host, no Cloudflare API). No secret value was read, printed or used; environment variables are named only. No tracked file was edited. Tree: `tranche/T51` @ 367361d6e4 (the G83 helper `bio-plane/src/store-place.mjs`, R95 in `plane/store.mjs`, T2 are merged here).

## Answers

### 1. How the new empty room gets its founder

- **The path.** The new room starts unclaimed: the claim state is a row `bootstrap` inside the room's own storage (`credentials/index.mjs:331-352`, `claim()` and `bootstrapState()`), and a fresh `bio~g2` has none. The claim is `op=claim` (`control-plane/index.mjs:1062-1075`): it refuses when `ADMIN_TOKEN` is unset (409), when it is a published value (409) and unless `body.bootstrapToken === env.ADMIN_TOKEN` (403, `:1068-1070`); then `credentials.claim` stores the founder's password (12 characters or more) and optionally a handle (`credentials/index.mjs:344-367`). Member-facing form: `/app/setup`, which fills the one-time password from the URL fragment `#boot=...` and asks for a handle and a password twice (`screens-entry/setup.mjs:395-404`; walk side `journey-check/journeys.mjs:180-215`, `walkFounder`).
- **The secret it spends:** `ADMIN_TOKEN` (the one-time password, the installer's `out-boot`). **The deployed Worker already holds it:** it is a `secret_text` binding, and `deploy.mjs` sends `keep_bindings: ["secret_text","durable_object_namespace","service"]` (`scripts/deploy.mjs:282`), so every upload keeps it; the generation flags only add or remove the `plain_text` bindings `STORE_LOCATION` and `STORE_GENERATION` (`derive-bindings.mjs:247-267`). So the new room checks the same token as the old one. The group's producing name is recorded at the new room's first boot from `INSTANCE_NAME` (`setup.mjs:799-801`; `newgroup/src/index.mjs:994-1000`), so no seeding act is needed.
- **Can a session complete the claim without ever holding the secret? No.** The claim compares a value the *caller sends* with the Worker's secret; whoever sends the request holds the value. No op, route or workflow does it on the session's behalf (`instancegroupseed` and every other root act also need the `ADMIN_TOKEN` bearer). The session's `BIO_ADMIN_TOKEN` is not biosmoke8's: it answers NOT_AUTHENTICATED there (rulings K3519). A secret cannot be read back from Cloudflare. Setting a fresh value through the API from a session would make the session hold it; that route is not taken.
- **The one act only Bob can do** (his browser and his hosting account; he has the deploy-workflow-independent dashboard):
  1. In the Cloudflare dashboard (account `20b5...7f72`), Workers, `biosmoke8`, Settings, Variables and Secrets: if he still has the install's one-time password, nothing to do here. Otherwise **replace `ADMIN_TOKEN` with a new random value of his own making (32 or more random characters) and keep it for step 2.** (The claim's own refusal text names this route, `control-plane/index.mjs:1067`; a different value merely arms the claim, which is anyway open in a room that has no claim row.) Later deploys keep it.
  2. After the deploy, open `https://biosmoke8.believeinoakland.workers.dev/app/setup#boot=<that value>`, type the founder handle and password **equal to the values already in the session's environment as `JOURNEY_ADMIN_HANDLE` / `JOURNEY_ADMIN_PASSWORD`** (he set those; the password must be 12 or more characters), press claim, and **store the ten recovery codes** shown once (or ignore them: the copy is for walking).
  That is the only secret-touching act. Everything after it uses only the sign-ins already in the environment.

### 2. The walkers' members in the new room

Nothing carries over (members, sign-ins and invitations live in the old room's storage). Order, by whom:

1. Founder = `JOURNEY_ADMIN_*`: made by Bob's claim (above), same handle and password, so the session's environment needs no change.
2. Member = `JOURNEY_MEMBER_*`: by **a session, with no new secret act**: sign in as the administrator (`journey-check/journeys.mjs:262-272` `signInBy`, handle and password read from the environment, never printed), open `/app/members`, `act(p, "memberadd", {fields: {"mi-id": ..., "mi-cover": ...}})` (`inviteMember`, `journeys.mjs:273-292`) which shows an invitation link `...#invite=...` (a secret: masked by `walk.keepSecret`); then in a second browser context open the link (`/app/join`), `handlecheck` with `JOURNEY_MEMBER_HANDLE`, `enroll` with `JOURNEY_MEMBER_PASSWORD` (`walkMember`, `journeys.mjs:294-303`; ten recovery codes shown once, not needed). The `runLive` arm (`run.mjs:277-`) only signs in, so these steps need a small script that calls `signInBy`, `inviteMember` and the first two steps of `walkMember`; the `install` arm's `walkFounder`/`walkMember` do them plus a full walk. The invite and the link never leave the script. Both passwords already in the environment are used by name only.
3. Check `whoami` answers each role (R9 step 1), then continue with the smoke.
- The old room's invitations and sessions stay in the old room; none is valid in the new one.

### 3. G2: shared R2, do remembered `head` answers skip the new room's row?

**No, the row is recorded.** `head` only gates the *byte put*, never the filing.
- Upload (`capture/index.mjs` `uploadCapture`, `:704-760`, `:788-840`): per part `if (!(await ev.head(psha))) await ev.put(psha, buf)` (`:731`), then whether the record holds the document is decided by **provenance's register** (`registerHolds`, `:788-794`), not by R2; the code comment is explicit: bytes "merely in the evidence store, content-addressed and named by nothing" are filed, "its retry must file them". Only `registered` makes it a second sighting with no document.
- Fetch/acquire (`acquisition/index.mjs:1328-1336`, `:1427-1442`, `:1519`, `:1822`): `head` yields `partHeldBefore` / `existed`, which is only **reported** on the answer (`:1786`); the receipt (`:1568-1574`) and the document (`:1700-1790`) are filed unconditionally. For several parts, `existed` is decided by the register (`registerHolds`, `:1436`).
- `readThrough` (`acquisition/unpack.mjs:51-60`) is a per-call memo of `head` answers only; nothing persists between calls or rooms.
- Cosmetic consequence (not a missing row): in the new room a re-captured single-part document answers `existed: true` (the object was in R2), and the monitoring gather labels it "a capture the record already holds" (`monitoring/index.mjs:2490-2493`) even though that room's record did not. Also `capture/index.mjs:1217-1225` `#holds` and `reattest` (`:1107`) count R2 bytes alone as held for a read by sha, which is harmless here. Capture `op=capture` PUT (`capture/ops.mjs:89`) answers `existed: true` for bytes already in R2 and writes none, but it stores bytes only; the row is filed by the later act.
- **Reproduction (two rooms on one R2 bucket, workerd under Miniflare, persisted DOs and R2 shared across a restart that sets `STORE_GENERATION=2`):** `bio` filed document A (upload: `r2HeldBefore:false, existed:false, documentFiled:true`). After the restart with generation 2, `bio~g2`'s `head(A)` was `true` (R2 is shared), and its first upload of A answered `r2HeldBefore:true, existed:false, ok:true, documentFiled:true, hasReceipt:true` (so a re-captured document appears), the second upload of A `existed:true` (second sighting, as designed). Script: `/tmp/claude-0/-home-user-bio/04e4e6df-d9f4-57e8-b7fc-97162c5ea1d5/scratchpad/r7-entry.mjs` (a `Store` subclass with debug routes plus the plane's real default export) run by `r7-run.mjs` in the same folder: `cd /home/user/bio/bio-plane && node <scratchpad>/r7-run.mjs`. Not reproduced: the fetch (`acquire`) path, which needs a governed outbound fetch; read from code only.

### 4. Does the old inert room, its alarm or the 5-minute cron touch anything after the generation changes?

- **The cron does not reach the old room.** `watchdog.mjs:11-30` asks `storeStub(env, "bio")` and `"scratch"`, which name `bio~g2` and `scratch~g2` under generation 2. Reproduction: `plane.scheduled` called with a recording `idFromName` answered names `["bio","scratch"]` at generation 1 and `["bio~g2","scratch~g2"]` at generation 2.
- **The old room is inert** (R95): `#isRetired()` (`plane/store.mjs:195-199`) is true for an object named `bio`/`scratch` that is not the current room; the constructor then builds nothing and writes nothing (`:175`), `alarm()`, `onAlarm()` and `watchdog()` delete the alarm and return (`:726-731`), the RPCs return `ROOM_RETIRED`. Unit proof exists (`test/m/plane/g83-location.test.mjs:76-95`: no table, 410, alarm deleted). Reproduction under workerd: with generation 2, a request to the old `bio` answered `410 ROOM_RETIRED`, so `ctx.id.name` is available there; my debug routes in the old room saw no evidence store (nothing built).
- **Its pending alarm:** the old room's alarm is already set (reproduction: persisted, ~13 hours ahead on Miniflare's clock). When it fires, the retired room runs the constructor (no write) and deletes it; that happens once, in Frankfurt, and touches no R2 object. Not observed firing locally (the instant is hours away); proven only by the unit test.
- Other callers (agent-worker's `PLANE`, SELF service binding) go through the plane's door and so through `storeStub`, i.e. to the new room.

## Reproduction commands and outcomes (all local)

- `cd /home/user/bio/bio-plane && node /tmp/claude-0/-home-user-bio/04e4e6df-d9f4-57e8-b7fc-97162c5ea1d5/scratchpad/r7-run.mjs`: ran to the end. Outcomes as stated in 3 and 4. Side finding of the script itself: the old room has no debug route (500 from my route, `evidenceStore()` null), which is the inertness seen from inside.
- Not run: the plane's own whole suites (`node --test`), the fetch path of `acquire`, anything that signs in (no member screens exist locally).

## Recommended route for BOB

1. Merge and regenerate as planned; nothing in the code needs to change for the claim or for G2.
2. Ask Bob for **one act (before the deploy or after it, either order):** in the Cloudflare dashboard replace biosmoke8's `ADMIN_TOKEN` with a fresh random value that only he keeps (or find the install's original one-time password), and tell the session "done". The session must not be told the value.
3. Deploy once: workflow `deploy-test.yml`, push to `deploy-test/biosmoke8/wnam-g2/deploy` (or the dispatch inputs `store_location=wnam`, `store_generation=2`), after a `.../wnam-g2/dry-run` whose log shows both flags. Read the log's `test deploy:` line (flags, kept secrets).
4. P read: `op=bootstrap` answers claimed `false` (new room, unclaimed); `op=selftest` states `store_location: "wnam"`, `store_generation: 2` (configured hint, not placement); the GraphQL colo read of the new object.
5. Bob's second act (same sitting): open `/app/setup#boot=<his value>` and claim with the handle and password already held in the environment as `JOURNEY_ADMIN_*`; he stores or ignores the recovery codes. Tell the session "claimed".
6. A session runs the small member script (section 2) with the environment sign-ins; check `whoami` for both roles; then the smoke and the walk from the empty copy.
7. Rollback: deploy with `--store-generation 1` (removes the binding): the old Frankfurt room, whole, answers again with its own claim and members; the `~g2` room becomes inert.

## Open unknowns

- Whether Bob still has the install's one-time password (then he skips the dashboard step). The session cannot tell, and must not try.
- Whether Cloudflare production exposes `ctx.id.name` as workerd 1.20260722 under Miniflare does. If it did not, `#isRetired()` is false for the old room (`store.mjs:197-199`), and the old room would not be inert: its alarm and construction would run with `ownNamespace()` null (evidence prefix falls back to `"bio"`, a shared-R2 double actor). The deploy's P read should include a check that the old object's alarm is gone / no invocations on it after the first day (GraphQL `durableObjectsInvocationsAdaptiveGroups`, as in `do-first.graphql`).
- Whether `wnam` is honoured by Cloudflare for the first `get()` of `bio~g2` (best effort; P read decides).
- The old room's alarm firing was not observed (unit-tested only).
- Fetch-path `existed:true`-with-no-row labelling in the new room (cosmetic, not blocking; a re-capture of an existing R2 object reports "the record already holds it").
