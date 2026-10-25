/* store-request R16, R19 (K5163, INTERFACE-SHELL #22 J30): an active administrator by the real acts, however many there are; the password a sign-in
   returns; a queue made by real acts. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";

const call = (w, as, op, query = "") => w.door({ url: `/api/?op=${op}${query}`, init: { method: "GET" } }, as);

test("R16: signIn({admin: true}) makes an active administrator by the real acts, the third and the fourth too (every administrator endorses); the second is refused by nothing", async () => {
  const w = await storeWorld();
  const names = ["bea", "cy", "dot"];
  const made = [];
  for (const n of names) made.push(await w.signIn(n, { admin: true }));
  const rows = w.sql.exec("SELECT member_id, role, status FROM members ORDER BY member_id").toArray();
  assert.deepEqual(rows.filter((r) => r.role === "admin").map((r) => [r.member_id, r.status]), names.map((n) => [n, "active"]));
  for (const as of made) {
    assert.equal((await call(w, as, "whoami")).json.result.administer, true, as.handle);
    assert.equal((await call(w, as, "translations", "&language=es")).json.result.ok, true, `${as.handle}: translations' admin-only read answers`);
    assert.notEqual((await as.act("translationgrant", { body: { member: "admin", language: "es" } })).reason, "NOT_AN_ADMIN", as.handle);
  }
  const ruth = await w.signIn("ruth");
  assert.equal((await call(w, ruth, "translations", "&language=es")).json.result.reason, "TRANSLATION_NOT_GRANTED", "control: a member is not an administrator");
});

test("R16: signIn answers the member's password: the claim's for the founder, the chosen one for any other, and it is the one that signs in again", async () => {
  const w = await storeWorld();
  const founder = await w.signIn("admin");
  const ruth = await w.signIn("ruth");
  assert.equal(founder.password, w.password);
  assert.equal(typeof ruth.password, "string"); assert.ok(ruth.password.length >= 8); assert.notEqual(ruth.password, founder.password);
  const again = await w.door({ url: "/api/?op=login", init: { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "ruth", password: ruth.password, device: "own" }) } });
  assert.ok(again.json.result.token, JSON.stringify(again.json).slice(0, 200));
  assert.equal((await w.signIn("ruth")).password, ruth.password, "a second sign-in of the same member");
});

test("R19: recipes.queue({obligations}) makes the founder's queue hold that many obligations by real acts; findings or conditions are refused naming them", async () => {
  const w = await storeWorld();
  const founder = await w.signIn("admin");
  const empty = (await call(w, founder, "queue")).json.result;
  assert.deepEqual(empty.items, []);
  const made = await w.recipes.queue({ obligations: 3 });
  assert.equal(made.obligations.length, 3);
  const items = (await call(w, founder, "queue")).json.result.items;
  assert.deepEqual(items.map((i) => i.id).sort(), [...made.obligations].sort());
  assert.ok(items.every((i) => i.class === "OBLIGATION"));
  await assert.rejects(() => w.recipes.queue({ findings: 1 }), /1 findings/);
  await assert.rejects(() => w.recipes.queue({ conditions: 2 }), /2 conditions/);
});
