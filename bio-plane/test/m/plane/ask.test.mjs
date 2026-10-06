/* plane B2 (K1674, K1684; control-plane R53; agent-worker R54, R56; credentials R24, R25, R27): `op=ask`'s handler. The
   door's arm admits only a member's own session or a presented grant's member and asks the `bio` object; there the
   member's grant is minted at their act, their own account unsealed for this ask, their suggestions switch read, and
   the question posted to agent-worker's `/ask`, whose answer comes back unchanged. Driven on the Durable Object class. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { store } from "./fixture.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { askOp } from "../../../src/plane/ask.mjs";

const SEAL = "a-long-seal-secret-for-the-test-only";
const SESSION = "s".repeat(64);

/* A plane whose agent-worker records each ask and answers a two-line stream; ann holds a session and an account. */
async function world({ account = true, worker = true } = {}) {
  const asks = [];
  const env = { ACCOUNT_SEAL_SECRET: SEAL };
  if (worker) env.AGENT_WORKER = { fetch: async (u, init) => { asks.push([u, JSON.parse(init.body)]);
    return new Response('{"event":"step","step":"interpreting"}\n{"event":"answer","ok":true}\n',
                        { status: 200, headers: { "content-type": "application/x-ndjson" } }); } };
  const x = await store({ env });
  const sql = x.ctx.storage.sql;
  sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
            VALUES ('ann', 'Cover ann', 'h_ann', 'member', 'active', '["contribute"]', 't', 't')`);
  sql.exec(`INSERT INTO sessions (token, role, expires, created) VALUES (?, 'member:ann', ?, 'x')`, SESSION, Date.now() + 3600e3);
  if (account) {
    const r = await credentialsOf(x.ctx).accountReferenceSet({ member: "member:ann", kind: "apikey", secret: "sk-ant-zz-ann", by: "member:ann" });
    assert.equal(r.ok, true, JSON.stringify(r));
  }
  return { ...x, asks };
}

test("B2 (K1674): a member's ask mints their grant, unseals their own account and carries both to agent-worker's /ask, whose stream comes back unchanged", async () => {
  const x = await world();
  const res = await x.s.ask({ member: "member:ann", session: SESSION, question: "Who holds the clerk's office?",
                              conversation: [], store: null });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "application/x-ndjson");
  assert.equal(await res.text(), '{"event":"step","step":"interpreting"}\n{"event":"answer","ok":true}\n');
  assert.equal(x.asks.length, 1);
  const [u, body] = x.asks[0];
  assert.equal(u, "https://agent-worker/ask");
  assert.deepEqual(Object.keys(body).sort(), ["account", "conversation", "grant", "question"], "no store unless one was named");
  assert.equal(body.question, "Who holds the clerk's office?");
  assert.match(body.grant, /^[0-9a-f]{64}$/, "the grant minted at the member's act");
  assert.deepEqual(body.account, { kind: "apikey", secret: "sk-ant-zz-ann", member: "member:ann", suggestions: false });
  /* the grant is the member's: credentials admits it for an ask read, as that member */
  const admit = await credentialsOf(x.ctx).aiGrantAdmit({ token: body.grant, op: "search", write: false });
  assert.equal(admit.ok, true, JSON.stringify(admit));
  assert.equal(admit.viewer, "member:ann");
});

test("B2 (agent-worker R56): the member's suggestions switch is carried as they set it", async () => {
  const x = await world();
  assert.equal(credentialsOf(x.ctx).accountSwitchSet({ member: "member:ann", switch: "suggestions", on: true, by: "member:ann" }).ok, true);
  await x.s.ask({ member: "member:ann", session: SESSION, question: "q", store: "scratch" });
  assert.equal(x.asks[0][1].account.suggestions, true);
  assert.equal(x.asks[0][1].store, "scratch", "a named store is carried");
});

test("B2 (K1684): a presented grant is carried as given and no grant is minted", async () => {
  const x = await world();
  await x.s.ask({ member: "member:ann", grant: "g".repeat(64), question: "q" });
  assert.equal(x.asks[0][1].grant, "g".repeat(64));
});

test("B2 negative controls: no account, another's session, and no assistant member are each refused in their owner's words, and nothing is asked", async () => {
  const none = await world({ account: false });
  const r1 = await none.s.ask({ member: "member:ann", session: SESSION, question: "q" });
  assert.equal(r1.ok, false);
  assert.match(JSON.stringify(await r1.json()), /NO_ACCOUNT/);
  const x = await world();
  const r2 = await x.s.ask({ member: "member:ann", session: "t".repeat(64), question: "q" });
  assert.equal(r2.status, 403);
  assert.match(JSON.stringify(await r2.json()), /NOT_YOUR_ACCOUNT/);
  const unbound = await world({ worker: false });
  const r3 = await unbound.s.ask({ member: "member:ann", session: SESSION, question: "q" });
  assert.equal(r3.status, 503);
  assert.equal((await r3.json()).reason, "AGENT_WORKER_UNBOUND");
  assert.equal(none.asks.length + x.asks.length + unbound.asks.length, 0, "nothing reached agent-worker");
});

test("B2 (control-plane R53): the door's arm asks the bio object only for a member's own session or a presented grant's member; any other caller is refused", async () => {
  const seen = [];
  const env = { STORE: { idFromName: (n) => n, get: (id) => ({ ask: async (a) => { seen.push([id, a]); return new Response("{}"); } }) } };
  const req = () => new Request("http://plane/ask", { method: "POST", body: JSON.stringify({ question: "q", conversation: [] }) });
  const url = new URL(`http://plane/ask?token=${SESSION}`);
  await askOp({ req: req(), url, env, viaSession: true, sessMember: "ann" });
  assert.deepEqual(seen[0], ["bio", { member: "member:ann", question: "q", conversation: [], store: null, session: SESSION, grant: null }]);
  await askOp({ req: req(), url, env, viaSession: false, grantMember: "member:bob" });
  assert.deepEqual(seen[1][1], { member: "member:bob", question: "q", conversation: [], store: null, session: null, grant: SESSION });
  /* a binding class or an ai credential is no member: refused before anything is read */
  const r = await askOp({ req: req(), url, env, viaSession: false });
  assert.equal(r.status, 403);
  assert.equal((await r.json()).reason, "ASK_NOT_A_MEMBER");
  assert.equal(seen.length, 2);
  const bad = await askOp({ req: new Request("http://plane/ask", { method: "POST", body: "{x" }), url, env, viaSession: true, sessMember: "ann" });
  assert.equal(bad.status, 400);
});
