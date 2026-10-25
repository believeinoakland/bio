/* store-assembly's copy of plane's test of this name (K624: by copy). store-assembly R9 (DEC-113; control-plane R46; T45, K2781 (1)): the composition root hands control-plane's `dispatch` the object's
   namespace (R2's own name) and `action-holds`' `purgeHeld` (its R9, was `actions` R60) on the one instance R39 builds, so the store's door refuses a purge of
   held material in `bio` before record-core's `purge` arm runs; `scratch`'s door is handed its namespace too and never
   refuses for a hold. Driven through the object's own door (its `fetch`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { storage, assembleStore } from "./fixture.mjs";
import { actionHoldsOf } from "../../../src/action-holds/index.mjs";
import { actionsOf } from "../../../src/actions/index.mjs";

/* One object named `name` (`bio`, `scratch`, or null for an object of no known name), constructed and settled. */
async function named(name) {
  const st = storage();
  st.ctx.id = { equals: (other) => name !== null && other === name, toString: () => String(name) };
  const s = assembleStore(st.ctx, { STORE: { idFromName: (n) => n } });
  for (const p of st.blocked) await p;
  const fetch = async (path) => { const r = await s.dispatch(new Request("http://do" + path, { method: "POST" })); return { status: r.status, body: await r.json() }; };
  const count = (t) => [...st.ctx.storage.sql.exec(`SELECT count(*) c FROM ${t}`)][0].c;
  return { ctx: st.ctx, fetch, count };
}

/* action-holds' own reader on this object's storage (the one instance R39 builds), answering `held`, recording each
   question. */
function hold(x, held) {
  const asked = [];
  actionHoldsOf(x.ctx).purgeHeld = (q) => { asked.push(q); if (held instanceof Error) throw held; return held; };
  return asked;
}

test("R9: in `bio`, a purge that action-holds' purgeHeld answers held is refused PURGE_HOLD_IN_PLACE before record-core's arm runs, nothing cleared", async () => {
  for (const name of ["bio", null]) {
    const x = await named(name);
    x.ctx.storage.sql.exec(`INSERT INTO docket_marks (entry_id, kind, by_member, at) VALUES ('DKT-1', 'pressure', 'bob', 't')`);
    const asked = hold(x, true);
    for (const path of ["/purge", "/purge?bundleId=PROJ-2026-x"]) {
      const r = await x.fetch(path);
      assert.equal(r.status, 409, `${name} ${path}: ${JSON.stringify(r.body)}`);
      assert.equal(r.body.reason ?? r.body.result?.reason, "PURGE_HOLD_IN_PLACE", `${name} ${path}`);
    }
    assert.deepEqual(asked.map((q) => q.bundleId || ""), ["", "PROJ-2026-x"], `${name}: the plane's action-holds was asked, with the bundle`);
    assert.equal(x.count("docket_marks"), 1, `${name}: nothing cleared`);
  }
});

test("R9: a failure to ask purgeHeld refuses in `bio` too", async () => {
  const x = await named("bio");
  hold(x, new Error("unreadable"));
  const r = await x.fetch("/purge");
  assert.equal(r.status, 409, JSON.stringify(r.body));
});

test("R9: `scratch` is never refused for a hold, and `bio` with no hold purges (negative controls)", async () => {
  for (const [name, held] of [["scratch", true], ["bio", false]]) {
    const x = await named(name);
    x.ctx.storage.sql.exec(`INSERT INTO docket_marks (entry_id, kind, by_member, at) VALUES ('DKT-1', 'pressure', 'bob', 't')`);
    hold(x, held);
    const r = await x.fetch("/purge");
    assert.equal(r.status, 200, `${name}: ${JSON.stringify(r.body)}`);
    assert.equal(r.body.ok, true, name);
    assert.equal(r.body.result.ok, true, name);
    assert.equal(x.count("docket_marks"), 0, `${name}: the whole-store purge ran`);
  }
});

test("R9 (T45; K2781 (1)), R34: the reader handed is action-holds' one instance, never actions'; with no hold placed, `bio` purges (control: an actions reader answering held is never asked)", async () => {
  const x = await named("bio");
  x.ctx.storage.sql.exec(`INSERT INTO docket_marks (entry_id, kind, by_member, at) VALUES ('DKT-1', 'pressure', 'bob', 't')`);
  const asked = [];
  actionsOf(x.ctx).purgeHeld = (q) => { asked.push(q); return true; };
  const r = await x.fetch("/purge");
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.result.ok, true);
  assert.deepEqual(asked, [], "actions is not asked");
  assert.equal(x.count("docket_marks"), 0, "action-holds' real reader holds nothing, so the whole-store purge ran");
  assert.equal(typeof actionHoldsOf(x.ctx).purgeHeld, "function");
});
