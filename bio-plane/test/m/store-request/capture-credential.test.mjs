/* store-request R4, R7 door case for capture-sources R72 (STORE-REQUEST #6, B15 (1); CAPTURE-SOURCES #20): the door stamps `by` and `viewer` as `member:<id>`. A member who is not the
   founder supplies, lists and withdraws a capture credential through the world's door; another member neither sees nor withdraws it; the founder and a machine credential are the controls. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld, WORLD_TOKENS } from "./fixtures.mjs";

const caps = { capabilities: ["contribute"] };
// fixtures-own: the secret is an input the test feeds the door and then looks for in every answer; the key is the instance's own secret, which no call ever sends
const SECRET = "tok-world-capture-secret-5d1a9e07c3b8";
const KEY = "world-capture-credentials-key-7e2b4f90a1c6d385";

async function team() {
  const w = await storeWorld({ env: { CAPTURE_CREDENTIALS_KEY: KEY } });
  return { w, ann: await w.signIn("ann", caps), bo: await w.signIn("bo", caps) };
}
const supply = (as, host = "records.example.gov") => as.act("capturecredentialsupply", { body: { kind: "login", host, secret: SECRET, scope: "member" } });
const mine = async (as) => (await as.read("capturecredentiallist")).entries;

test("R4 (capture-sources R72): a member who is not the founder supplies, lists and withdraws a capture credential through the door; the secret is never in an answer", async () => {
  const { ann } = await team();
  const made = await supply(ann);
  assert.equal(made.ok, true, JSON.stringify(made));
  const seen = await mine(ann);
  assert.equal(seen.length, 1);
  assert.equal(seen[0].host, "records.example.gov");
  assert.equal(seen[0].scope, "member");
  assert.ok(String(seen[0].supplied_by).endsWith("ann"), `supplied by the member: ${seen[0].supplied_by}`);
  assert.ok(!JSON.stringify([made, seen]).includes(SECRET), "no answer carries the secret");
  const gone = await ann.act("capturecredentialwithdraw", { body: { credential: seen[0].credential } });
  assert.equal(gone.ok, true, JSON.stringify(gone));
  const after = await mine(ann);
  assert.equal(after.length, 1, "the secretless entry stays");
  assert.ok(after[0].withdrawn_at, "and says it is withdrawn");
  assert.equal((await ann.act("capturecredentialwithdraw", { body: { credential: seen[0].credential } })).already, true, "withdrawing twice writes nothing");
});

test("R7 (capture-sources R72): another member neither sees nor withdraws a member's credential; a body naming a supplier is not read", async () => {
  const { w, ann, bo } = await team();
  assert.equal((await supply(ann)).ok, true);
  assert.deepEqual(await mine(bo), [], "bo sees none of ann's");
  const refused = await w.door({ url: "/api/?op=capturecredentialwithdraw", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ credential: (await mine(ann))[0].credential }) } }, bo);
  assert.equal(refused.json.result?.reason ?? refused.json.reason, "CAPTURE_CREDENTIAL_NO_SUCH", JSON.stringify(refused.json));
  assert.equal((await mine(ann))[0].withdrawn_at ?? null, null, "ann's credential still holds");
  /* control: bo's body names ann as the supplier; the credential is bo's own */
  await bo.act("capturecredentialsupply", { body: { by: "member:ann", kind: "login", host: "other.example.gov", secret: SECRET, scope: "member" } });
  const bos = await mine(bo);
  assert.equal(bos.length, 1);
  assert.ok(String(bos[0].supplied_by).endsWith("bo"), `bo's own: ${bos[0].supplied_by}`);
  assert.equal((await mine(ann)).length, 1, "ann's list is still her one");
});

test("R7 (capture-sources R72): the founder supplies and lists as before; a machine credential is refused at the door", async () => {
  const { w, ann } = await team();
  const founder = await w.signIn("founder");
  assert.equal((await supply(founder, "founder.example.gov")).ok, true);
  assert.equal((await mine(founder)).length, 1);
  assert.deepEqual(await mine(ann), [], "a member does not see the founder's member credential");
  const machine = await w.door({ url: "/api/?op=capturecredentialsupply", init: { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "login", host: "m.example.gov", secret: SECRET, scope: "member" }) } }, { token: WORLD_TOKENS.ADMIN_TOKEN });
  assert.notEqual(machine.json.ok, true, JSON.stringify(machine.json));
  assert.ok(!JSON.stringify(machine.json).includes(SECRET));
});
