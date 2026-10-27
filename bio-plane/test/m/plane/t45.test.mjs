/* plane R111 (was R41; K2824, K2881; op-declarations R49): the Worker's door arm for `infractiondraft` and `bearingdraft`
   asks the `bio` object's draft RPC with the member's session and the task's own fields, checked through the real `Store`
   with a negative control (K874). The composition of the T45 modules is `store-assembly`'s (its R34). */
import "../../../src/store-assembly/register.mjs";   /* R68: the start's registration before any op table is read */
import { test } from "node:test";
import assert from "node:assert/strict";

import { store, disclosed } from "./fixture.mjs";

/* ===== R40 (K2853): the two doors' deploy gate ===== */
import { createHash } from "node:crypto";
import { deployed } from "./fixture.mjs";
import { assistantGateOf } from "../../../src/store-assembly/ask.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { partRefusal } from "../../../src/run-rules/index.mjs";

const SESSION = "s".repeat(64);
/* ann with her own account and a live session, the assistant's keep-away off, agent-worker recording every post; the
   gate deps (`gate`) handed before construction, the bar recorded for `parts`. */
async function doors({ gate = null, parts = [] } = {}) {
  const asks = [];
  const env = { ACCOUNT_SEAL_SECRET: "a-long-seal-secret-for-the-t45-test", AGENT_WORKER: { fetch: async (u, init) => {
    asks.push([u, JSON.parse(init.body)]);
    if (u === "https://agent-worker/draft")
      return new Response(JSON.stringify({ ok: true, draft: { text: "t" }, label: { kind: "machine" } }), { status: 200, headers: { "content-type": "application/json" } });
    return new Response('{"event":"answer","ok":true}\n', { status: 200, headers: { "content-type": "application/x-ndjson" } }); } } };
  const x = await store({ env, before: gate ? (ctx) => assistantGateOf(ctx, gate) : null });
  if (parts.length) await deployed(x.ctx, parts);
  const sql = x.ctx.storage.sql;
  sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
            VALUES ('ada', 'Cover ada', 'h_ada', 'admin', 'active', '["contribute"]', 't', 't')`);
  assert.equal(credentialsOf(x.ctx).aiKeepAwaySet({ on: false, by: "ada" }).ok, true);
  sql.exec(`INSERT INTO members (member_id, cover, handle, role, status, capabilities, created, updated)
            VALUES ('ann', 'Cover ann', 'h_ann', 'member', 'active', '["contribute"]', 't', 't')`);
  sql.exec(`INSERT INTO sessions (token_sha, role, expires, created) VALUES (?, 'member:ann', ?, 'x')`,
           createHash("sha256").update(SESSION).digest("hex"), Date.now() + 3600e3);
  await disclosed(x.ctx);   /* R44 (T47): the disclosure first, as the assembled plane asks */
  assert.equal((await credentialsOf(x.ctx).accountReferenceSet({ member: "member:ann", kind: "apikey", secret: "sk-ant-zz-ann",
                                                                 by: "member:ann" })).ok, true);
  const grants = () => [...sql.exec(`SELECT count(*) c FROM ai_grants`)][0].c;
  const ask = async () => { const r = await x.s.ask({ member: "member:ann", session: SESSION, question: "q" }); return { status: r.status, r }; };
  const draft = async (a) => { const r = await x.s.draft({ member: "ann", session: SESSION, pack: { layers: [] }, ...a }); return { status: r.status, body: await r.json() }; };
  return { ...x, asks, grants, ask, draft };
}
/* R40 (T46; run-rules R30): a part its flag deploys and `ai-runs.partAdmitted` does not admit, refused as run-rules'
   `partRefusal(part)` answers it, unchanged. */

/* ===== R41 (K2824): the action drafts ===== */

import { gatedOp } from "../../../src/plane/door.mjs";

test("R41 (K2824, K2881; op-declarations R49): the door's arm for infractiondraft and bearingdraft asks the bio object's draft with the member's session and the task's own fields, counts a drafted conversation to her day, and answers the draft without its grant or read log; any caller but a member's session is refused, nothing asked", async () => {
  const seen = [], counted = [];
  let answer = { ok: true, draft: { text: "an account" }, label: { kind: "machine" }, usage: { input_tokens: 1 }, calls: 1,
                 grant: "g".repeat(64), suggestions: false, read: ["x"] };
  const env = { STORE: { idFromName: (n) => n, get: (id) => ({
    draft: async (a) => { seen.push([id, a]); return new Response(JSON.stringify(answer), { status: answer.ok ? 200 : 409 }); },
    fetch: async (r) => { counted.push([new URL(r.url).pathname + new URL(r.url).search, await r.json()]); return new Response("{}"); } }) } };
  const call = (op, body, extra = {}) => gatedOp({ req: new Request(`http://plane/${op}`, { method: "POST",
    headers: { authorization: `Bearer ${SESSION}` }, body: JSON.stringify(body) }), url: new URL(`http://plane/${op}`), env, op,
    cls: "member", viaSession: true, sessMember: "ann", sessViewer: "member:ann", storeName: "bio", ...extra });
  const r1 = await call("infractiondraft", { matter: { plan: "PLN-2026-0001-x" }, audience: "members", told: "ignored" });
  assert.equal(r1.status, 200);
  assert.deepEqual(await r1.json(), { ok: true, result: { ok: true, draft: { text: "an account" }, label: { kind: "machine" },
                                                          usage: { input_tokens: 1 }, calls: 1, suggestions: false } });
  assert.deepEqual(seen[0], ["bio", { op: "infractiondraft", member: "ann", session: SESSION, matter: { plan: "PLN-2026-0001-x" }, audience: "members" }]);
  assert.deepEqual(counted[0], ["/askusage?viewer=member%3Aann", { mode: "draft", usage: { input_tokens: 1 }, calls: 1 }]);
  await call("bearingdraft", { action: "ACTN-2026-0001-rfc", reply: 2 });
  assert.deepEqual(seen[1][1], { op: "bearingdraft", member: "ann", session: SESSION, action: "ACTN-2026-0001-rfc", reply: 2 });
  /* a refusal is answered at its status, its grant withheld, and nothing is counted */
  answer = { ok: false, reason: "AI_RUN_MODE_NOT_DEPLOYED", grant: null, read: [] };
  const r3 = await call("bearingdraft", { action: "A", reply: 1 });
  assert.equal(r3.status, 409);
  assert.deepEqual(await r3.json(), { ok: false, reason: "AI_RUN_MODE_NOT_DEPLOYED" });
  assert.equal(counted.length, 2);
  /* control: a machine credential is no member's session; nothing asked */
  const r4 = await call("infractiondraft", { matter: "PLN-x" }, { viaSession: false, sessMember: null, cls: "ai", aiCred: { principal: "member:ann", tokenId: "t1" } });
  assert.equal(r4.status, 403);
  assert.equal(seen.length, 3);
});

