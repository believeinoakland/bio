/* capture-sources R72 (T51 fix round 10; SCREENS-INTAKE #26 J56 (1); K5184): the credential ops through the world's real door,
   whose stamps `by` and `viewer` are the session's viewer form (`member:<id>`, store-request R4), never a bare member id. A member
   who is not the founder supplies, lists and withdraws a credential; the founder's session does as before; a machine credential
   is refused. Each test names R72 in its title. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { storeWorld, WORLD_TOKENS } from "../store-request/fixtures.mjs";

const SECRET = "door-s3cret-Pa55word-for-the-source";
const HOST = "records.example.gov";
const post = (op, body) => ({ url: `/api/?op=${op}`, init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } });
const get = (op, query = "") => ({ url: `/api/?op=${op}${query}`, init: { method: "GET" } });
const supply = (over = {}) => ({ kind: "login", host: HOST, secret: SECRET, scope: "member", ...over });
const world = () => storeWorld({ group: null, env: { CAPTURE_CREDENTIALS_KEY: "door-instance-secret-not-a-real-one" } });
const result = (r) => (r.json && r.json.result !== undefined ? r.json.result : r.json);

test("R72 a member who is not the founder supplies, lists and withdraws a credential through the door", async () => {
  const w = await world();
  const ann = await w.signIn("ann", { capabilities: ["contribute"] });
  const supplied = result(await w.door(post("capturecredentialsupply", supply()), ann));
  assert.equal(supplied.ok, true, JSON.stringify(supplied));
  assert.equal(supplied.credential.supplied_by, "ann");
  assert.equal(supplied.credential.scope, "member");
  assert.equal(JSON.stringify(supplied).includes(SECRET), false);
  const listed = result(await w.door(get("capturecredentiallist"), ann));
  assert.deepEqual(listed.entries.map((e) => e.credential), [supplied.credential.credential]);
  assert.equal(JSON.stringify(listed).includes(SECRET), false);
  const withdrawn = result(await w.door(post("capturecredentialwithdraw", { credential: supplied.credential.credential }), ann));
  assert.equal(withdrawn.ok, true, JSON.stringify(withdrawn));
  assert.equal(withdrawn.already, false);
  assert.equal(withdrawn.withdrawn.withdrawn_by, "ann");
  const after = result(await w.door(get("capturecredentiallist"), ann));
  assert.equal(after.entries.length, 1);
  assert.notEqual(after.entries[0].withdrawn_at, null);
});

test("R72 a member sees their own member credentials and another member's are not seen or withdrawn through the door", async () => {
  const w = await world();
  const ann = await w.signIn("ann", { capabilities: ["contribute"] });
  const bob = await w.signIn("bob", { capabilities: ["contribute"] });
  const a = result(await w.door(post("capturecredentialsupply", supply()), ann));
  assert.equal(a.ok, true, JSON.stringify(a));
  const b = result(await w.door(post("capturecredentialsupply", supply({ host: "other.example.gov" })), bob));
  assert.equal(b.ok, true, JSON.stringify(b));
  const bobSees = result(await w.door(get("capturecredentiallist"), bob));
  assert.deepEqual(bobSees.entries.map((e) => e.credential), [b.credential.credential]);
  const refused = result(await w.door(post("capturecredentialwithdraw", { credential: a.credential.credential }), bob));
  assert.equal(refused.ok, false);
  assert.equal(refused.code, "CAPTURE_CREDENTIAL_NO_SUCH");
});

test("R72 control: the founder's session supplies, lists and withdraws as before", async () => {
  const w = await world();
  const founder = await w.signIn("admin");
  const supplied = result(await w.door(post("capturecredentialsupply", supply({ scope: "group" })), founder));
  assert.equal(supplied.ok, true, JSON.stringify(supplied));
  const listed = result(await w.door(get("capturecredentiallist"), founder));
  assert.deepEqual(listed.entries.map((e) => e.credential), [supplied.credential.credential]);
  const withdrawn = result(await w.door(post("capturecredentialwithdraw", { credential: supplied.credential.credential }), founder));
  assert.equal(withdrawn.ok, true, JSON.stringify(withdrawn));
});

test("R72 control: a machine credential is refused at the door and nothing is stored", async () => {
  const w = await world();
  for (const token of [WORLD_TOKENS.PROBE_TOKEN, WORLD_TOKENS.DAEMON_TOKEN]) {
    await assert.rejects(async () => w.admitted(token, "capturecredentialsupply"), /CLASS_FORBIDDEN/);
    const r = await w.door(post("capturecredentialsupply", supply()), { token });
    assert.ok(r.status >= 400, `${r.status} ${JSON.stringify(r.json)}`);
    assert.equal(JSON.stringify(r.json).includes(SECRET), false);
  }
  const founder = await w.signIn("admin");
  assert.deepEqual(result(await w.door(get("capturecredentiallist"), founder)).entries, []);
});
