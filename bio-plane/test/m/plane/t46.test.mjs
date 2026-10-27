/* plane T46's composition (T46-62; N897 (2), (3), N886, N920, N935; K2816, K2940, K2946, K2950, K2960): the ask and
   draft doors and the transcriber gated by `ai-runs.partAdmitted`, the test-instance label on their outputs, the status
   report's draft (R40); the serving account's suggestions switch (R33) and, since T47, a sign-in's held token on the
   wire and dropped when refused (R47); agent-worker's HTTP
   status relayed by the transcriber (R36); case-account's and local-facts' ops maps spread (R39); the route map re-pinned
   to T46's ops (R5); and the plane's own `Store` booted on workerd over a store holding notes (R42). Each test drives
   the plane at its interface (construction over a storage, the object's RPC and door, the transcriber it registers, the
   Worker under Miniflare) and carries a negative control (K874). */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { Miniflare } from "miniflare";
import { store, deployed, GATE_FLAGS, GATE_SET, GATE_PARTS, disclosed } from "./fixture.mjs";
import { MODULE_MAPS, ownMaps, servedThroughDoor } from "./maps.mjs";
import { assistantGateOf, draftOnObject, DRAFT_KIND_OF } from "../../../src/store-assembly/ask.mjs";
import { transcriberOf } from "../../../src/store-assembly/transcribe.mjs";
import { credentialsOf } from "../../../src/credentials/index.mjs";
import { aiAccountsOf } from "../../../src/ai-accounts/index.mjs";
import { answersOf } from "../../../src/answers/index.mjs";
import { aiRunsOf } from "../../../src/ai-runs/index.mjs";
import { extractionOf } from "../../../src/extraction/index.mjs";
import { caseAccountOf, caseAccountOps } from "../../../src/case-account/index.mjs";
import { localFactsOf, localFactsOps } from "../../../src/local-facts/index.mjs";
import { untestedLabel, partRefusal } from "../../../src/run-rules/index.mjs";

const SESSION = "s".repeat(64);
const SEAL = "a-long-seal-secret-for-the-t46-test";
/* R47: a sentinel held token, to be found in the binding's request and nowhere else */
const SIGNIN_TOKEN = "sk-ant-oat01-SENTINEL-held-token-t47";
const DRAFT_ANSWER = { ok: true, draft: { text: "t" }, label: { kind: "machine" } };

/* ann and an administrator, ann's live session, the group's keep-away off; `account`: ann's API-key reference
   (`apikey`), her sign-in alone (`signin`), or none. agent-worker records every post. The gate deps (`gate`) are handed
   before construction (K61), the bar recorded for `parts` on the gate's set. */
async function doors({ gate = null, parts = [], env: extra = {}, account = "apikey", worker = null } = {}) {
  const asks = [];
  const env = { ACCOUNT_SEAL_SECRET: SEAL, ...extra, AGENT_WORKER: worker || { fetch: async (u, init) => {
    asks.push([u, JSON.parse(init.body)]);
    if (u === "https://agent-worker/draft") {
      const b = JSON.parse(init.body);
      return new Response(JSON.stringify({ ...DRAFT_ANSWER, ...(b.untested ? { untested: b.untested } : {}) }),
                          { status: 200, headers: { "content-type": "application/json" } });
    }
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
  const c = credentialsOf(x.ctx);
  if (account === "apikey") {
    await disclosed(x.ctx);   /* R44 (T47): the disclosure first, as the assembled plane asks */
    assert.equal((await c.accountReferenceSet({ member: "member:ann", kind: "apikey", secret: "sk-ant-zz-ann", by: "member:ann" })).ok, true);
  }
  /* R47 (T47; credentials R70): a sign-in serves only while its token is held */
  if (account === "signin") assert.equal((await c.subscriptionTokenHold({ member: "member:ann", token: SIGNIN_TOKEN })).ok, true);
  const grants = () => [...sql.exec(`SELECT count(*) c FROM ai_grants`)][0].c;
  const ask = async () => { const r = await x.s.ask({ member: "member:ann", session: SESSION, question: "q" }); return { status: r.status, r }; };
  const draft = async (a) => { const r = await x.s.draft({ member: "ann", session: SESSION, pack: { layers: [] }, ...a }); return { status: r.status, body: await r.json() }; };
  return { ...x, asks, grants, ask, draft };
}
const held = (x) => credentialsOf(x.ctx).accountReferenceState({ member: "member:ann", viewer: "member:ann" }).subscription.held;



/* ===== R42 (T46; K2950; hypotheses R23 at the plane's shape) ===== */

const ENTRY = fileURLToPath(new URL("./r42-entry.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: ENTRY, script: readFileSync(ENTRY, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Seeded", useSQLite: true }, TEMPBOOT: { className: "TempBoot", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"], bindings: { INSTANCE_NAME: "t46-r42", VERSION: "test" },
  durableObjectsPersist: mkdtempSync(join(tmpdir(), "plane-r42-")),
});
after(() => mf.dispose());
const stubOf = async (binding) => { const ns = await mf.getDurableObjectNamespace(binding); return ns.get(ns.idFromName("bio")); };

test("R42 (T46; K2950; hypotheses R23, R14): the plane's own Store, booted on workerd over a store numbered from the shared sequence and holding notes and turns, runs hypotheses' renumbering and every boot migration without a TEMP table and answers its first request; the notes and turns read back renumbered. Negative control: a boot migration that makes a TEMP table is refused there, and that object does not answer", async () => {
  const s = await stubOf("STORE");
  const first = await s.fetch("http://do/notes?viewer=member:ann");
  const text = await first.text();
  assert.equal(first.status, 200, text);
  const ann = JSON.parse(text).result.notes.map((n) => [n.note, n.text]);
  assert.deepEqual(ann, [[3, "ann third"], [2, "ann second"], [1, "ann first"]], "her notes from 1, in their order");
  const held = await (await s.fetch("http://do/r42")).json();
  assert.deepEqual(held.keyed, ["member", "note_id"], "renumbered: keyed by (member, note_id)");
  assert.deepEqual(held.notes.map((n) => [n.member, n.note_id, n.text]),
    [["ann", 1, "ann first"], ["ann", 2, "ann second"], ["ann", 3, "ann third"], ["outsider", 1, "outsider first"], ["outsider", 2, "outsider second"]]);
  assert.deepEqual(held.turns.map((t) => [t.note_id, t.member, t.made_id]), [[2, "ann", "INQ-2026-0002-q"], [1, "outsider", "INFO-2026-0001-doc"],
    [3, "ann", "INFO-2026-0002-doc"], [2, "ann", "HYP-2026-0001"], [2, "outsider", "INQ-2026-0003-q"]], "turns follow their notes");
  assert.match(held.temp, /SQLITE_AUTH|not authorized/i, "workerd refuses a TEMP table");
  /* negative control: the same Store with one more boot migration making a TEMP table */
  let answered;
  try { answered = (await (await stubOf("TEMPBOOT")).fetch("http://do/notes?viewer=member:ann")).status; } catch (e) { answered = String(e && e.message || e); }
  assert.notEqual(answered, 200, `a TEMP table at boot: ${answered}`);
});

/* ===== R40 (T46; K2999; control-plane R77, R20): the Store's two RPC methods for control-plane's door ===== */

test("R114 (was R40), R46 (T46; K2999; T47: N955; ai-runs R18; control-plane R77): the Store's RPC `dispatchMemberRun(args)` is ai-runs' dispatchMemberRun in the object addressed, handed the args as given but for a credential, which R46 retires (t47.test.mjs); a run nobody holds answers {found: false}; control: no args is ai-runs' own answer to none", async () => {
  const x = await store();
  const ai = aiRunsOf(x.ctx), was = ai.dispatchMemberRun.bind(ai), seen = [];
  ai.dispatchMemberRun = async (a) => { seen.push(a); return was(a); };
  try {
    const args = { run: "RUN-2026-0009-none", by: "member:ann", viewer: "member:ann", credential: "aik-secret-t46", at: "2026-10-12T00:00:00Z" };
    const r = await x.s.dispatchMemberRun(args);
    const { credential: _c, ...given } = args;
    assert.deepEqual(seen, [given], "ai-runs reached once, with the args as given but the credential (R46)");
    assert.deepEqual(r, await was(args));
    assert.equal(r.found, false, JSON.stringify(r));
    assert.equal(JSON.stringify(r).includes("aik-secret-t46"), false, "the credential is never answered");
    const none = await x.s.dispatchMemberRun();
    assert.deepEqual(seen.at(-1), {});
    assert.deepEqual(none, await was({}));
  } finally { ai.dispatchMemberRun = was; }
  /* negative control: another object's ai-runs is not reached */
  const y = await store();
  assert.notEqual(aiRunsOf(y.ctx), ai);
});

test("R114 (was R40) (T46; K2999; public-read R34; control-plane R20): the Store's RPC `groupFields()` answers public-read's groupFields() of the object addressed, the group's fields and nothing else; control: once a group identity is registered, its fields are answered", async () => {
  const { publicReadOf } = await import("../../../src/public-read/index.mjs");
  const x = await store();
  const f = await x.s.groupFields();
  assert.deepEqual(f, publicReadOf(x.ctx).groupFields());
  assert.deepEqual(Object.keys(f).sort(), ["detail", "domain", "domain_verified_at", "group", "matter_stake", "name", "stake"]);
  /* control: a spy on public-read shows the RPC is its answer, not a copy */
  const pr = publicReadOf(x.ctx), was = pr.groupFields.bind(pr);
  pr.groupFields = () => ({ ...was(), name: "Spied Group" });
  try { assert.equal((await x.s.groupFields()).name, "Spied Group"); } finally { pr.groupFields = was; }
});
