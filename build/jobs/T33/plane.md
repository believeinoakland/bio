# plane (T33)

**Status** · session_017zKzx7PmN8FK2VvvFACCgN · depth 2 · WORKING · handled B2

## J1 · QUESTION

T33-90 readings. I am building on each reading now; please answer any you rule differently.

1. **officeOf / officeEntityOf (K1563, K1654).** instance-setup R50 is not built yet. jurisdictions' counterparty entries carry no identifier field, so there is no spelling the plane could resolve an office through. Reading: instance-setup (T33-87) exports the seeded offices' two reads on its instance: `officeOf(entityId, profile)` → `{role, body}` | `{venue}` | null, and `officeEntityOf({role, body})` → entity id | null. plane hands each as a port that calls `instanceSetupOf(ctx)`'s method when present and otherwise answers null, which fails closed: local-facts falls back to the profile, and conformance answers `entity_id: null` with why. If you agree, this needs a CHANGE to INSTANCE-SETUP.

2. **roster-reader into people (R23, K1505 (6)).** roster-reader holds no store and exports no source; it has only `rosterColumns`, the types and `directoryPersonRefs`. people's `registerRosterSource` needs a function `({organisation, at, viewer})`. Building one in the plane would put a construct in the plane (R9). Reading: plane registers under `roster-reader` a source over roster-reader's export that answers "held as a table, not read" (no rows, with why) until roster-reader exports a store-reading source. That later source is a next-tranche entry for roster-reader.

3. **court-doctypes' capture origin (R22's second sentence, K1511).** The plane hands no per-document reading context. The context comes from reading-pipeline (`read`, `doctypeFor`) and from acquisition's intake `doctypeFor`. The only thing plane gives them is the instance's `view`. Reading: the origin must be derived by reading-pipeline and acquisition from `capture.actor_class === "member"`. That is their entry (next tranche); `ecourt_roa` meanwhile is refused at detect with its why, which fails closed. R22's second sentence is deferred.

4. **"generic last" (R22).** docprofile's `registerDoctype` appends each new key after its seeded `generic` and replaces a held key in place, so the plane cannot move `generic` to the end. Recognition is unchanged: `generic` is the fallback by its flag and never matches by detection. Reading: R22 is met by registering in the stated order with `generic` registered last (it replaces its own seed). The slot order is docprofile's (N549).

5. **SHEET_WORKER (K1531, R21).** Binding it in `wrangler.jsonc` turns bundler's `deploybindings.test.mjs` live arms red (the services and preflight targets) and changes R7's "bindings unchanged". Reading: plane wires workbooks' `recompute` over `env.SHEET_WORKER` when bound (POST `/recompute {capture_sha, store}`), and records "not recomputed here: no engine bound" when not. `wrangler.jsonc` gains no binding in this job. The binding and K1531's three pins go with the release/installer (sheet-worker ships inactive).

6. **notice-producers → queue (R21, queue R51).** No code exists yet, and queue names no deps key. Reading: plane hands `noticeProducers: noticeProducersOf(ctx, {people, moneyChecks, duties, answers, inquiry})` once both have merged (they merge before plane). Until then the plane test codes against its R1. I will re-point it at the real module before COMPLETE.

7. **answers' `relations` (K1609).** retrieval keeps its relation object private (`#relations()`); only `PROJECTION_RELATION` is exported. Reading: plane passes `relations: () => ({projection: PROJECTION_RELATION})`, so a standing question naming a T33 field is refused `SAVED_QUERY_DROPS` as answers states. Exposing retrieval's live relation for answers is a next-tranche entry for retrieval.

8. **hypotheses' `calculationInputs`.** calculations offers no synchronous input read (N576). Reading: plane wires none, as hypotheses' record says; the calculation arm asks nothing.

9. **duties' `view`.** duties' default is already the active combined view. Reading: plane passes `factOf` (local-facts through action-clocks' `factReader`, with a closure-list entry answered `profile_list`) and leaves `view` to that default.

10. **B2 (op=ask).** Taken; built with T33-90.

## J2 · QUESTION

B2 (K1674, op=ask): my readings. I am building on them now.

1. **Where the secret is handled.** The door runs in the Worker. Credentials' `accountReferenceFor` (the unseal) is in-plane only and deliberately unrouted, and the plane holds no route (R5, R9). Reading:
   - `gatedOp`'s `ask` arm calls one Durable Object RPC method on the plane's class, `ask({member, session, question, conversation, store})`, on the `bio` object, which is where credentials live. It is a method, not a route, like `schedAlarmAt`.
   - In-process, it mints the member's grant (`credentials.aiGrantMint({member, by, session})`, R27), unseals the account (`accountReferenceFor({member, act: {kind: "ask", member}})`) and reads the suggestions switch (`accountReferenceState`).
   - It then POSTs `{question, conversation?, store?, grant, account: {kind, secret, member, suggestions}}` to `AGENT_WORKER /ask` and hands back agent-worker's answer (an NDJSON stream or a plain refusal) unchanged. The secret never leaves the object except in that one call, as ai-runs' `/run` dispatch does.
   - Refusals come in the owners' words: `NO_ACCOUNT` and the seal refusals from credentials. Without the binding it answers 503 `AGENT_WORKER_UNBOUND`, ai-runs' word. The ceiling is agent-worker's `askceiling`, so the plane does not check it.
2. **"Or a presented ai grant."** `gatedOp` today gets no field saying a grant was presented. Reading: when control-plane hands `gatedOp` the grant's member (I code against `grantMember`, a `member:<id>` stamp; please confirm control-plane's name), the arm forwards the presented token as `grant` and mints none. Every other caller is refused 403 `ASK_NOT_A_MEMBER` before anything is read.
3. **Not mine.** Who answers `askceiling`, `askcheck` and `askusage`, and in which namespace an ask's reads and its check land, is control-plane's and op-declarations' (their J1). The read log is answers' in-memory map on one object.
