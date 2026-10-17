# plane (T50)

**Status** · session_01LZmcDAZpAJWu2TSJCHfiRc · depth 2 · COMPLETE · handled B3

## J1 · REPORT

REPORT 1 (PLANE #40, depth 2). Four things; the first is another module's.

**1. R59 (the ask stream): the buffering is in `control-plane`, not in the plane.** Diagnosed by test, as R59 asks, before changing anything; the plane's `ask.mjs` is unchanged.
- At the plane's own interface the stream passes as written: a producer that writes its first line and waits 2 s is read at the first chunk in under a second, through the Store's RPC `ask` and through the door's arm `askOp` (`t50.test.mjs`, R59, passing).
- Through the whole Worker (`default.fetch`, which is `control-plane`'s `makeFetch`) the response's headers arrive only when the producer has finished (2,038 ms for the same 2 s producer, run as a scratch script with a signed-in member).
- Cause, `bio-plane/src/control-plane/index.mjs` about lines 2187–2191 (signin-door R4's `tokenRefusedSeen`): for `op === "ask"` from a session the door awaits `armed.clone().json()` before returning `armed`, which reads the whole stream to its end first; and an NDJSON body is never one JSON value, so `asked` is always null and the call can never see a refusal in a stream. This is `control-plane` R108 (T50-35, "the ask stream passes the door as written"), that job's to fix; I have not touched it. The fix there is to look at the stream's lines as they pass (as `ask.mjs`'s `watched()` does) rather than read a clone to its end.
- Once `control-plane` has merged I add the whole-Worker form of the test (first line before the wait ends, through `worker.fetch`) to `t50.test.mjs`.

**2. R63 (the 503): interim finding, the burst I could send, and what it cannot show.**
- Measured on biosmoke8 with no credential (this job holds no session for it, and plan rule 9 keeps remote cells out of a Claude session's own tools): `groupidentity`, `whoami`, `assistantstate`, `subscriptionsignin` at 1, 2, 4, 8 and 16 in flight: every answer 200 or the named 401 `NOT_AUTHENTICATED`, none 503, 16 in flight finishing in about 2.2 s; and after 240 s idle, 16 `groupidentity`/`bootstrap` at once on a cold Worker: all 200, 2.4–2.9 s each (the cold start is about 2.4 s). The authenticated reads of Home, the Inbox and `/app/notes` need a member's session, which only BOB or Bob can hand to the walk.
- No code of the door, admission, store-door, answer-envelope or the plane mints a 503 for `assistantstate`, `groupidentity`, the Inbox's reads or `/app/notes`: the only 503s in that code are `AGENT_WORKER_UNBOUND` (ask, draft, and the sign-in door's `subscriptionsignin` when the binding is absent). A store silence is a 502. So the walks' 503 on those reads was not made by Civicsmith's code. The remaining layer is the platform's (a Worker or Durable Object reset or overload at a redeploy or a cold start; the finding says overlapping walks, one at a time clean, not reproduced since: `browser/FINDINGS.md:100`).
- The assembled plane at the widest screen's reads plus four (Connect, 14 reads, so 18 in flight) answers all 18 with no 503 and no silence, and a gate-refused read answers its own refusal (`NOT_AN_ADMIN`) at every count (`t50.test.mjs`, R63; the numbers are printed beside the biosmoke8 figure). I propose to close R63 as "cause reported: not in Civicsmith's code; the authenticated burst on biosmoke8 with `wrangler tail` open is the remaining proof, for the remote-proof lane", unless you want it run another way.

**3. Inherited reds that were this module's, now green** (all test-side): the archive-unpack tests awaited a consumer's `due`/`wake` as plain values (scheduler R27 now returns promises) and counted the scheduler wrapper's own wake reads as the drain's; the infraction/bearing draft tests expected `NO_SUCH_BUNDLE` where action-records' own `NO_SUCH_ACTION` is now what an unseen action answers; `roster.test.mjs` and `t47.test.mjs` now read project-roster's and action-records' ops from their own maps (K3729, K3746); `t46`'s groupFields pin is replaced by `t50`'s R62 test (K3731, K3747).

**4. Waiting on others.** `translations` (R61), `op-declarations`' `t50.mjs` and the L11 modules my route-list tests read are not on my branch yet (the tranche head is "L11 started"); R61 and the final checks wait for them and `control-plane` (T50-35). I merge `tranche/T50` as each lands.

## J2 · QUESTION

QUESTION 1 (PLANE #40). R58's provenance reach reader, my best reading and the doubt.

R58 says: for `provenance`, "the home bundles (`provenance.homeOf`) of the captures (`provenance.capturesOf`, per bundle) that the project's own bundles hold". As provenance defines them, `capturesOf(b)` lists the register rows whose home is `b`, and `homeOf(sha)` answers that same `b`; so over the project's own bundles (its bundle and `record.listBundles({project})`) the reader as worded answers only those own bundles again, which membership R149 already reaches. I built it exactly as worded (it is registered, bounded, refuses nothing, and tested), and the `connections` reader (the targets of the project's document's `cites` references not severed, by `connections.edgeSevered`) is not in doubt.

What I think the intent is: the captures that a project's bundles hold as FILES (the live file digests of its own bundles, `files.sha256`, which the plane could read as record-core R37 states) whose home is another bundle, since a capture first registered in one bundle is held by later bundles under the same digest. Best reading, if you want it: add those digests to the ones `capturesOf` gives, each through `homeOf`. Say "as worded" or "add the file digests" and I will do that one; until then it stays as worded.

## Completion (PLANE #40)

**Entries applied.** R58: `following` handed the one `retrieval`; the provenance reader (capturesOf plus live file digests, K3771) and the connections reader registered once each with membership R150; the 15 ops proven in their owners' maps through the door. R59: diagnosed (the plane streams as written; the buffering is `control-plane`'s, `armed.clone().json()`, forwarded under its R108, K3771). R60: `stepOrderFrom` exported; the order laws read `build/modules.json` and hold after a module is added or moved. R61: `translations` built before instance-setup, migrated in R3's pass, its nine routes spread with instance-setup's copies dropped; `door.test.mjs` compares those nine to translations' own map. R62: `groupFields({project})`. R63: closed on the diagnosis (cause not in Civicsmith's code; BOB runs the authenticated burst on biosmoke8 in T50's release walk, K3771); `t50.test.mjs` bursts the widest screen's reads plus four (Connect, 18) with none a 503, the figures printed (M-T50-7).

**Inherited reds fixed** (test-side): unpack/t36 R25 (scheduler R27 promises; the drain's own reads), t45 R41 (`NO_SUCH_ACTION`), roster R5/R9/R45 and t47 R45 (ops read from owners' maps), t46 groupFields pin (matter_stake), wizards R57 (names read from wizard-scripts).

**Still red, not this module's:** `wizards.test.mjs` R19 (`secondlookclear`, until op-declarations merges); `t47` R48 and `worker.test.mjs` R6 (the page answers 500: interface-shell's `checkScreens` throws "screen members's act groupkeyset is not the registry's for it", screens-settings / registry, until those jobs merge). To add after `control-plane` merges: the whole-Worker form of R59's test.

**Deferred:** none in this module. Nothing found in another module beyond the above (R59 cause, and the page's `groupkeyset` mismatch).

**Tests and checks:** plane suite 261 tests (before the last test fixes): 256 pass, 5 fail (the three above, plus `door` R1/R5 and t46 R40, both since fixed: door 6/6, t46 green). format 0 failures; architecture 0 failures; coverage 63 of 63 ids named, 0 failures; ownership 0 failures.

Size (session_01LZmcDAZpAJWu2TSJCHfiRc): test runs 14, module lines 2373

## J3 · COMPLETE

COMPLETE (PLANE #40). R58, R59 (plane side; cause in control-plane R108), R60, R61, R62 met; R63 closed on the diagnosis (your authenticated burst in the release walk). Record: build/jobs/T50/plane.md, Completion. Still red, not mine: wizards R19 (until op-declarations), t47 R48 and worker R6 (the page 500s: interface-shell checkScreens, "screens-settings members act groupkeyset is not the registry's"). Owed after control-plane merges: the whole-Worker R59 test. I stay available for CHANGE.

## J4 · COMPLETE

COMPLETE (PLANE #40) after CHANGE B3. Merged tranche/T50 (interface-shell, instance-setup); no stand-in in my tests. Plane suite: 258 of 260 pass; wizards R19 is now green. Two reds remain, both the page answering 500 with the same cause, interface-shell checkScreens: "screen members act groupkeyset is not the registry's for it" (t47 R48, worker R6): the Members screen is screens-settings', which merges next; I rerun them then. Owed after control-plane merges: the whole-Worker R59 test.
