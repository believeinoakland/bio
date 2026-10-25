/* plane R78, R96 (T51 fix round 5, E10; fix round 8): the object states its own I/O time and its age on every route it serves,
   driven through the real `Store`'s `fetch`. The ledger's own behaviour (store-assembly R62, R64) is tested there. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { bucketStandIn } from "../case-carriage/fixture.mjs";

test("R78 (E10): every route the object serves answers `server-timing: object;dur=<ms>`, the time it spent on the route, on two routes; the body is the route's own and a value carried in is replaced", async () => {
  const x = await store({ env: { CAPTURES: bucketStandIn() } });
  const shape = /^object;dur=\d{1,7}, object-age;dur=\d{1,9}$/;   /* R96: the object states its age beside it */
  for (const path of ["/owedwork?cls=member&viewer=member:ann", "/owedwork?cls=admin&viewer=member:ann&sha=" + "d".repeat(64)]) {
    const res = await x.s.fetch(new Request("http://do" + path, { headers: { "server-timing": "object;dur=999999" } }));
    assert.match(res.headers.get("server-timing"), shape, path);
    assert.ok(!res.headers.get("server-timing").includes("999999"));
    assert.equal((await res.json()).result.ok, true, "the body is the route's own");
  }
  const other = await x.fetch("/ailimits?cls=member&viewer=member:ann");
  assert.match(other.headers.get("server-timing"), shape, "a second kind of route");
});
