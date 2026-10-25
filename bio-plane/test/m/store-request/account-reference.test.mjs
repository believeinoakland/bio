/* store-request R7 door case for ai-accounts R38 (STORE-REQUEST #5, B14; AI-ACCOUNTS #7 J7 report 3): the member is the stamp. A member sets, reads and removes their own AI account
   reference through the world's door with a body naming no member; a body naming another member acts on the caller's own reference only. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld, WORLD_TOKENS } from "./fixtures.mjs";

const caps = { capabilities: ["contribute"] };
const KEY = "sk-ant-api03-" + "k".repeat(40);

async function ready(as) {
  const d = await as.read("disclosureof", { query: { member: "member:" + as.member } });
  await as.act("disclosureshown", { body: { member: "member:" + as.member, version: d.version } });
  await as.act("reauth", { body: { password: as.password } });
}

test("R7 (ai-accounts R38): a member sets, reads and removes their own reference with a body naming no member; control: a body naming another member acts on the caller's own reference only", async () => {
  const w = await storeWorld({ ai: true });
  const ann = await w.signIn("ann", caps);
  const bo = await w.signIn("bo", caps);
  await ready(ann); await ready(bo);
  assert.equal((await ann.read("accountreference")).held, false);
  const set = await ann.act("accountreferenceset", { body: { kind: "apikey", secret: KEY } });
  assert.equal(set.ok, true);
  assert.equal((await ann.read("accountreference")).held, true, "ann's reference is held");
  assert.equal((await bo.read("accountreference")).held, false, "bo's is not");
  /* control: bo names ann; it is bo's own reference that is set, and ann's is untouched */
  await bo.act("accountreferenceset", { body: { member: "member:ann", kind: "apikey", secret: KEY + "2" } });
  assert.equal((await bo.read("accountreference")).held, true, "bo's own reference is set");
  const removed = await bo.act("accountreferenceremove", { body: { member: "member:ann" } });
  assert.equal(removed.ok, true);
  assert.equal((await bo.read("accountreference")).held, false, "bo's own is removed");
  assert.equal((await ann.read("accountreference")).held, true, "ann's is not touched by bo");
  assert.equal((await ann.act("accountreferenceremove", { body: {} })).ok, true);
  assert.equal((await ann.read("accountreference")).held, false);
  /* control: a machine credential is still refused (the door's class gate answers before the owner's MACHINE_CANNOT_HOLD_ACCOUNT, which ai-accounts' own test holds) */
  const machine = await w.door({ url: "/api/?op=accountreferenceset", init: { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "apikey", secret: KEY }) } }, { token: WORLD_TOKENS.ADMIN_TOKEN });
  assert.equal(machine.json.reason, "CLASS_FORBIDDEN", JSON.stringify(machine.json));
  assert.equal((await ann.read("accountreference")).held, false, "nothing was set for anyone");
});
