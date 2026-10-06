/* plane T34-76 (K1683, K1705, K1788, K1803, K1806, K1832): the T34 wiring, driven on the Durable Object class and its
   exported adapters: ratification handed the Worker's reach (its R42, R39, R6) by the plane, before any other factory
   builds it; answers reading retrieval's relations and zone itself, the plane handing it no relation of its own. The
   account an ask carries (agent-worker R6, K1806) is `ask.test.mjs`'; R19's registration `wizards.test.mjs`'; the
   `SHEET_WORKER` binding `worker.test.mjs`'; R2's step order `store.test.mjs`'. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { ratificationWorker } from "../../../src/plane/wiring.mjs";
import { answersOf } from "../../../src/answers/index.mjs";
import { retrievalOf } from "../../../src/retrieval/index.mjs";

test("K1832 (ratification R42, R39, R6): the Worker's reach the plane hands ratification is the environment, a stub over this object's own door answering as a stub of the object answers, and the object's namespace read when asked", async () => {
  const x = await store();
  let ns = "bio";
  const env = { PUBLISHED: {}, CAPTURES: {} };
  const w = ratificationWorker({ env, door: (req) => x.s.fetch(req), namespace: () => ns });
  assert.equal(w.env, env);
  assert.equal(w.storeName, "bio");
  ns = "scratch";
  assert.equal(w.storeName, "scratch", "the namespace is read when asked, never remembered");
  /* the stub takes a URL and an init, as a Durable Object stub does, and answers through control-plane's frame */
  for (const path of ["/instancegrouppublic", "/casefilefacts?caseId=CASE-2026-none&edition=1", "/no-such-op"]) {
    const via = await w.stub.fetch(`http://do${path}`);
    const door = await x.fetch(path);
    assert.equal(via.status, door.status, path);
    assert.deepEqual(await via.json(), await door.json(), path);
  }
  const posted = await w.stub.fetch("http://do/instancegroupseed", { method: "POST", body: "{not json" });
  assert.equal((await posted.json()).reason, "BAD_JSON", "the init is carried");
  /* a Request is carried as given */
  assert.equal((await w.stub.fetch(new Request("http://do/no-such-op"))).status, 400);
});

test("K1788, K1803 (answers R15; retrieval R72): answers reads retrieval's relations and zone itself; the plane hands it no relation of its own", async () => {
  const x = await store();
  const a = answersOf(x.ctx), r = retrievalOf(x.ctx);
  assert.equal(a.deps.relations, undefined, "no relations dep");
  assert.equal(a.deps.retrieval, r, "retrieval's one instance");
  assert.deepEqual(a.relations(), r.relations());
  assert.equal(a.zone(), r.zone());
});

test("K1868 (2) (queue-producers R38; instance-setup R62): the queue's producers are the one instance the plane builds with the providers it hands queue, and instance-setup's start registers its place arrivals through that same instance", async () => {
  const { queueProducersOf } = await import("../../../src/queue-producers/index.mjs");
  const x = await store();
  const qp = queueProducersOf(x.ctx);
  /* the registration instance-setup's start made is held on that instance: a second is refused */
  const again = qp.registerPlaceArrivals(() => ({ arrivals: [] }));
  assert.equal(again.ok, false, JSON.stringify(again));
  assert.equal(again.reason, "PLACE_ARRIVALS_REGISTERED");
  /* and it is the instance queue reads: a later caller asking for it with other deps gets the same one */
  assert.equal(queueProducersOf(x.ctx, { docket: {} }), qp);
  /* negative control: a bare instance on another storage holds no registration */
  const { storage } = await import("./fixture.mjs");
  assert.equal(queueProducersOf(storage().ctx).registerPlaceArrivals(() => ({ arrivals: [] })).ok, true);
});
