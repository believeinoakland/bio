/* store-request R19, R17 (STORE-REQUEST #5, B9 2 (c); SCREENS-SETTINGS #19 J36): the model counts its own call under an ask's grant, by the real acts and the door
   admitting the grant as the Worker's door does (control-plane R53). */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "./fixtures.mjs";

const caps = { capabilities: ["contribute"] };
const get = (w, as, op) => w.door({ url: `/api/?op=${op}`, init: { method: "GET" } }, as);

test("R19 recipes.grantAdmit: the grant is minted under the member's own session and the model's count of its call is recorded for that member, shown in that member's own use", async () => {
  const w = await storeWorld({ ai: true });
  const founder = await w.signIn("admin");
  const ruth = await w.signIn("ruth", caps);
  await w.recipes.assistant(founder, { readers: [ruth] });
  const before = (await get(w, ruth, "aiusage")).json.result;
  assert.equal(before.ok, true);
  const used = (r) => r.payers.flatMap((p) => p.uses).filter((u) => u.use === "ask").reduce((n, u) => n + u.calls, 0);
  const made = await w.recipes.grantAdmit(ruth, { calls: 2 });
  assert.match(made.grant, /^[0-9a-f]{64}$/);
  assert.equal(made.counted.ok, true);
  assert.equal(made.counted.member, "ruth");
  assert.equal(made.counted.calls, 2);
  const after = (await get(w, ruth, "aiusage")).json.result;
  assert.equal(used(after) - used(before), 2);
});

test("R17: the door admits an ask's grant for the ask's own calls and its listed reads, and keeps admission's NOT_AUTHENTICATED for any other op and for a token that is no live grant (control)", async () => {
  const w = await storeWorld({ ai: true });
  const founder = await w.signIn("admin");
  await w.recipes.assistant(founder);
  const { grant } = await w.recipes.grantAdmit(founder);
  const as = { token: grant };
  assert.equal((await get(w, as, "askcheck")).json.result?.reason === "NOT_AUTHENTICATED", false);
  assert.notEqual((await get(w, as, "money")).status, 401);
  const off = await get(w, as, "memberlist");
  assert.equal(off.status, 401); assert.equal(off.json.reason, "NOT_AUTHENTICATED");
  const dead = await get(w, { token: "0".repeat(64) }, "askcheck");
  assert.equal(dead.status, 401); assert.equal(dead.json.reason, "NOT_AUTHENTICATED");
});
