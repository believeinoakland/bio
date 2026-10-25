/* store-request R7 (STORE-REQUEST #5, B9 2 (a); SCREENS-SETTINGS #19 J36): the member-roster acts that ask whether the actor is an
   administrator are stamped `by` with the bare member id, as membership reads it. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";
import { innerRequest, ADMIN_ASKING_OPS } from "../../../src/store-request/index.mjs";

const post = (w, as, op, b) => w.door({ url: `/api/?op=${op}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) } }, as);

test("R7: adminremovalsopen and expertisewithdraw carry `by` as the session's bare member id, a forged one dropped", async () => {
  const w = await storeWorld();
  const rosa = await w.signIn("rosa", { admin: true });
  const caller = await w.admitted(rosa.token);
  assert.deepEqual([...ADMIN_ASKING_OPS], ["adminremovalsopen", "expertisewithdraw"]);
  for (const op of ADMIN_ASKING_OPS) {
    const r = innerRequest({ op, url: `http://h/?op=${op}&by=FORGED`, method: "POST", body: JSON.stringify({ by: "FORGED" }), caller });
    assert.equal(new URL(r.url).searchParams.get("by"), "rosa", op);
    assert.equal("by" in JSON.parse(r.body), false, op);
  }
});

test("R7 (door): a non-founder administrator, active by the real acts, is answered by adminremovalsopen and expertisewithdraw, never NOT_AN_ADMIN; a member who is no administrator is refused it (control)", async () => {
  const w = await storeWorld();
  const founder = await w.signIn("admin");
  const rosa = await w.signIn("rosa", { admin: true });
  const dev = await w.signIn("dev", { capabilities: ["contribute"] });
  await post(w, dev, "expertisedeclare", { label: "CPA" });
  await post(w, founder, "expertiseconfirm", { memberId: "dev", label: "CPA" });
  const open = (await post(w, rosa, "adminremovalsopen", {})).json.result;
  assert.equal(open.ok, true, JSON.stringify(open));
  const gone = (await post(w, rosa, "expertisewithdraw", { memberId: "dev", label: "CPA", reason: "no longer holds it" })).json.result;
  assert.equal(gone.ok, true, JSON.stringify(gone));
  assert.equal(gone.by, "rosa");
  for (const [op, b] of [["adminremovalsopen", {}], ["expertisewithdraw", { memberId: "dev", label: "CPA", reason: "x" }]])
    assert.equal((await post(w, dev, op, b)).json.result.reason, "NOT_AN_ADMIN", op);
});

test("R16: after the world's clock moves a day, signIn of a new member works by a fresh founder session, and the session read before the tick is refused as lapsed, as the real door refuses it", async () => {
  const w = await storeWorld();
  const founder = await w.signIn("admin");
  await w.signIn("first", { capabilities: ["contribute"] });
  assert.equal((await post(w, founder, "adminremovalsopen", {})).json.result.ok, true);
  await w.tick(24 * 60 * 60 * 1000);
  const late = await w.signIn("late", { capabilities: ["contribute"] });
  assert.notEqual(late.token, founder.token);
  const lapsed = await post(w, founder, "adminremovalsopen", {});
  assert.notEqual(lapsed.json?.result?.ok, true, JSON.stringify(lapsed.json));
  const fresh = await w.signIn("admin");
  assert.equal((await post(w, fresh, "adminremovalsopen", {})).json.result.ok, true);
});
