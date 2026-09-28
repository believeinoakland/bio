/* contradiction's factory and its two ops (K61, K3): one instance per storage, and the routes read the control
   plane's stamps from the query and only `run`, `proposals` and `at` from the body. The behaviour behind them is
   R5–R16's, tested in pairs.test.mjs and propose.test.mjs; here R5, R6 and R13 are driven through the route. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, MEMBER } from "./fixture.mjs";
import { contradictionOf, contradictionOps } from "../../../src/contradiction/index.mjs";

test("K61: contradictionOf answers one instance per storage, reading its options on the first call only", () => {
  const w = world();
  const a = contradictionOf(w.host, { record: w.record, extraction: w.x });
  assert.equal(contradictionOf(w.host), a);
  assert.equal(contradictionOf(w.host.storage), a);
  assert.notEqual(contradictionOf(world().host, { record: w.record, extraction: w.x }), a);
});

test("R5, R6, R13 through the routes: key and limit are the caller's; proposedBy, viewer and principal are the stamps, never the body's", () => {
  const w = world();
  w.runs.set("RUN-1", { status: "running", principal: "member:m1" });
  w.inquiry("INQ-2026-0001", { subject: "E1" }); w.version("INQ-2026-0001", "v1");
  w.inquiry("INQ-2026-0002", { subject: "E1" }); w.version("INQ-2026-0002", "v1");
  const url = (q) => new URL(`https://plane/?${new URLSearchParams(q)}`);
  const pairs = contradictionOps(w.c, url({ key: " k2 ", limit: "7", viewer: MEMBER }), null).contradictionpairs();
  assert.deepEqual([pairs.ok, pairs.limit, pairs.pairs_formed], [true, 7, 1]);
  assert.deepEqual(pairs.keys.filter((k) => k.ran).map((k) => k.key), ["K2"]);
  const p = pairs.pairs[0];
  const body = { run: "RUN-1", at: "2026-09-28T02:00:00Z", proposedBy: "forged", viewer: "class:admin", principal: "member:m1",
                 proposals: [{ key: "K2", a: p.a, b: p.b, label: "record", reason: "both held" }] };
  const unstamped = contradictionOps(w.c, url({}), body).contradictionpropose();
  assert.equal(unstamped.code, "CANDIDATE_NO_PROPOSER");
  const wrongCaller = contradictionOps(w.c, url({ proposedBy: "class:ai/t", viewer: MEMBER, principal: "member:x" }), body).contradictionpropose();
  assert.equal(wrongCaller.code, "AI_RUN_NOT_PRINCIPAL");
  assert.deepEqual(w.gateCalls.at(-1), { run: "RUN-1", viewer: MEMBER, caller: "member:x" });
  const r = contradictionOps(w.c, url({ proposedBy: "class:ai/t", viewer: MEMBER, principal: "member:m1" }), body).contradictionpropose();
  assert.deepEqual([r.ok, r.written, r.candidates[0].proposed_by, r.candidates[0].at], [true, 1, "class:ai/t", "2026-09-28T02:00:00Z"]);
  assert.equal(contradictionOps(w.c, url({ proposedBy: "class:ai/t", viewer: MEMBER, principal: "member:m1" }), "x").contradictionpropose().code,
               "CANDIDATE_NO_RUN");
});
