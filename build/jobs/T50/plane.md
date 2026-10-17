# plane (T50)

**Status** · session_01LZmcDAZpAJWu2TSJCHfiRc · depth 2 · WAITING ON BOB (J2) · handled B1

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
