/* control-plane R57 (T35; N686, K1837, K1841; agent-worker R59, ai-runs R48, wizard-scripts R25, credentials R27, R35): the two
   drafts asked of agent-worker's `POST /draft` once every refusal is answered. The Worker's half is driven through
   `makeFetch(hooks)` over the harness's store; the object's half (`draftOnObject`) over a record with a seal secret, an
   `AGENT_WORKER` binding that records what it was sent, and credentials, ai-runs and answers as they are. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, opCalls, FORGED } from "./harness.mjs";
import { draftOnObject, draftDue } from "../../../src/control-plane/draft.mjs";
const { record } = await import("./record.mjs");
const { credentialsOf } = await import("../../../src/credentials/index.mjs");
const { membershipOf } = await import("../../../src/membership/index.mjs");
const { answersOf } = await import("../../../src/answers/index.mjs");

const USE = { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, total_cost_usd: null };
const reply = (o, status = 200) => new Response(JSON.stringify(o), { status });

/* ---- the Worker's half ---- */

/* A world whose store answers the two drafts as their owners do past every refusal (or with `refusal`), and whose objects
   record what their `draft` is asked. */
function draftWorld(refusal = null) {
  const asked = [];
  const w = world({ answer: (c) => (["writinghelp", "groupdescriptiondraft"].includes(c.route)
    ? reply({ ok: true, result: refusal ?? { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE", firsthand: c.route === "writinghelp" && c.body?.op === "observe" } })
    : null) });
  const get = w.env.STORE.get.bind(w.env.STORE);
  w.env.STORE.get = (id) => ({ ...get(id), async draft(args) { asked.push({ ns: id, ...args }); return reply({ ok: true, result: { ok: true, text: "drafted" } }); } });
  return { ...w, asked };
}
const packHooks = (seen = []) => ({
  publicOp: async () => M.json({ ok: true }), publicInstanceGroup: async () => ({ answered: true, result: {} }),
  gatedOp: async (ctx) => { seen.push(ctx.op); return ctx.op === "affordances" ? M.json({ ok: true, result: { catalog: [], vocabularies: {} } }) : undefined; },
});

test("R57 (N686, K1983): past every refusal (the owner's ASSISTANT_DRAFT_UNAVAILABLE), the door asks the object's draft with the session's member and token, the request's own words, the field's firsthand as the owner stated it and the pack it holds, and answers the draft with `store` and `tokenClass`; whatever the caller forged, no stamp of theirs reaches it", async () => {
  const { env, S, asked } = draftWorld();
  const seen = [];
  const help = await call(env, { op: "writinghelp", token: S.ann, method: "POST", hooks: packHooks(seen),
                                 params: { by: FORGED, viewer: FORGED },
                                 body: { op: "notewrite", field: "text", told: "the lift was out", by: FORGED, member: FORGED } });
  assert.deepEqual([help.status, help.json.result.text, help.json.store, help.json.tokenClass], [200, "drafted", "bio", "member"], help.text.slice(0, 300));
  const gdd = await call(env, { op: "groupdescriptiondraft", token: S.founder, method: "POST", hooks: packHooks(seen),
                                body: { answers: [{ question: "Who?", text: "Tenants" }] } });
  assert.equal(gdd.status, 200, gdd.text.slice(0, 300));
  const [a, b] = asked;
  assert.deepEqual({ ...a, pack: undefined }, { ns: "bio", op: "writinghelp", member: "ann", session: S.ann, told: "the lift was out",
                                                act: "notewrite", field: "text", firsthand: false, pack: undefined });
  assert.deepEqual({ ...b, pack: undefined }, { ns: "bio", op: "groupdescriptiondraft", member: "admin", session: S.founder,
                                                told: [{ question: "Who?", text: "Tenants" }], act: null, field: null, firsthand: false, pack: undefined });
  /* the pack is the untargeted affordances answer's, rendered (R41): the hook was asked for it */
  assert.ok(seen.includes("affordances"));
  for (const x of asked) assert.ok(x.pack === null || typeof x.pack.version === "string", JSON.stringify(x.pack).slice(0, 200));
  /* the owner's firsthand reaches the object */
  await call(env, { op: "writinghelp", token: S.ann, method: "POST", hooks: packHooks(), body: { op: "observe", field: "text", told: "x" } });
  assert.equal(asked.at(-1).firsthand, true);
});

test("R57: an owner's refusal, and every answer that is not the owner's ASSISTANT_DRAFT_UNAVAILABLE, is answered as given and asks no draft; a machine credential is refused before the store (negative control: `draftDue` reads only that code, under `result`)", async () => {
  for (const refusal of [{ ok: false, reason: "WRITING_HELP_NOTHING_TOLD" }, { ok: false, reason: "ASSISTANT_OFF" }, { ok: true, text: "x" }]) {
    const { env, S, asked } = draftWorld(refusal);
    const r = await call(env, { op: "writinghelp", token: S.ann, method: "POST", hooks: packHooks(), body: { told: "x" } });
    assert.deepEqual([r.status, r.json.result.reason ?? null, asked.length], [200, refusal.reason ?? null, 0], JSON.stringify(refusal));
  }
  const { env, asked } = draftWorld();
  const m = await call(env, { op: "writinghelp", token: env.MEMBER_TOKEN, method: "POST", hooks: packHooks(), body: { told: "x" } });
  assert.equal(m.status, 403);
  assert.deepEqual([asked.length, opCalls(env).length], [0, 0]);
  assert.equal(draftDue("writinghelp", { result: { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE" } }), true);
  assert.equal(draftDue("writinghelp", { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE" }), false);
  assert.equal(draftDue("index", { result: { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE" } }), false);
});

/* ---- the object's half ---- */

/* A record with members `ann` (an administrator) and `bea`, each signed in; bea holding her own account, the group key
   held and on for ann; and an AGENT_WORKER that records each body and answers `draft`. */
async function objectWorld(draft = { text: "The lift was out." }, status = 200, extra = {}) {
  const r = await record({ sealSecret: "control-plane-test-seal-secret-0003" });
  const C = credentialsOf(r.ctx), mb = membershipOf(r.ctx);
  await C.claim({ password: "founder-passphrase-1", tokenFp: "fp-1" });
  const sessions = {};
  for (const [id, role] of [["ann", "admin"], ["bea", "member"]]) {
    const a = await mb.memberAdd({ memberId: id, cover: `cover of ${id}`, role, capabilities: null, by: "admin" });
    await mb.enroll({ invite: a.invite, handle: id, password: `${id}-passphrase-x` });
    const s = await C.login({ role: `member:${id}`, password: `${id}-passphrase-x` });
    assert.equal(s.ok, true, JSON.stringify(s));
    sessions[id] = s.token;
  }
  assert.equal((await C.accountReferenceSet({ member: "member:bea", kind: "apikey", secret: "sk-bea-own-secret", by: "member:bea" })).ok, true);
  assert.equal((await C.groupKeySet({ key: "sk-group-key-secret", by: "admin" })).ok, true);
  assert.equal(C.groupKeySwitch({ on: true, by: "admin" }).ok, true);
  assert.equal(C.groupKeyNoticeSeen({ member: "member:ann", by: "member:ann" }).ok, true);
  const sent = [];
  const env = { ...r.env, AGENT_WORKER: { async fetch(url, init) {
    sent.push({ url, body: JSON.parse(init.body) });
    if (extra.throws) throw new Error("down");
    return reply(extra.ending ?? { ok: true, task: {}, draft, label: { kind: "machine" }, usage: USE, calls: 2 }, status);
  } } };
  const used = () => r.db.prepare("SELECT member, mode, calls FROM ai_usage").all().map((x) => ({ ...x }));
  return { r, C, env, sent, sessions, used };
}
const answered = async (res) => ({ status: res.status, json: await res.json() });

test("R57 (agent-worker R59, R6; credentials R35; ai-runs R48): the object posts `{task, told, account, firsthand, pack}` to /draft — the account the member's own act is served by in R6's wire shape, `pack` with no grant while the switch is off — counts the use to the member's day as a draft, and answers the checked draft in its owner's shape, labelled machine work; no key is in the answer (negative control: a sentence stating a fact neither told nor read is withheld whole)", async () => {
  const { r, env, sent, sessions, used } = await objectWorld({ text: "The lift was out. It broke on 12 March." });
  const pack = { version: "p1" };
  const a = await answered(await draftOnObject(r.ctx, env, { op: "writinghelp", member: "bea", session: sessions.bea,
                                                            told: "the lift was out", act: "notewrite", field: "text", pack }));
  assert.equal(a.status, 200, JSON.stringify(a.json).slice(0, 300));
  assert.deepEqual(sent[0].body, { task: { op: "writinghelp", act: "notewrite", field: "text" }, told: "the lift was out",
    account: { kind: "apikey", level: "member", secret: "sk-bea-own-secret", member: "member:bea", suggestions: false },
    firsthand: false, pack });
  assert.equal(sent[0].url, "https://agent-worker/draft");
  assert.deepEqual([a.json.result.text, a.json.result.label.kind], ["The lift was out.", "machine"]);
  assert.deepEqual(a.json.result.withheld.map((x) => [x.sentence, x.code]), [["It broke on 12 March.", "WRITING_HELP_FACT_ADDED"]]);
  assert.deepEqual(used(), [{ member: "bea", mode: "draft", calls: 2 }]);
  assert.equal(JSON.stringify(a.json).includes("sk-"), false);
  /* the group's description, for ann on the group's key: `{focus, purpose}` within their limits */
  const g = await objectWorld({ focus: "Tenants of Elm Court.", purpose: "We keep the landlord to the lease." });
  const b = await answered(await draftOnObject(g.r.ctx, g.env, { op: "groupdescriptiondraft", member: "ann", session: g.sessions.ann,
    told: [{ question: "Who?", text: "Tenants of Elm Court" }, { question: "Why?", text: "We keep the landlord to the lease" }], pack }));
  assert.equal(b.status, 200, JSON.stringify(b.json).slice(0, 300));
  assert.deepEqual(g.sent[0].body.task, { op: "groupdescriptiondraft" });
  assert.deepEqual(g.sent[0].body.account, { kind: "apikey", level: "group", secret: "sk-group-key-secret", member: "member:ann", suggestions: false });
  assert.deepEqual([b.json.result.focus.text, b.json.result.purpose.text, b.json.result.focus.label.kind],
                   ["Tenants of Elm Court.", "We keep the landlord to the lease.", "machine"]);
});

test("R57 (DEC-153 (2), K1841 (2); credentials R27; answers R1): with the serving account's suggestions switch on and a field that is not firsthand, a grant is minted under the member's own session and sent instead of the pack, and the draft is checked against that grant's read log; a firsthand field, or the switch off, mints and sends none (negative control: a read the grant made is what admits its fact)", async () => {
  const { r, C, env, sent, sessions } = await objectWorld({ text: "Rent rose to 1,250 in May." });
  assert.equal(C.accountSwitchSet({ member: "member:bea", switch: "suggestions", on: true, by: "member:bea" }).ok, true);
  const args = { op: "writinghelp", member: "bea", session: sessions.bea, told: "rent went up", act: "notewrite", field: "text", pack: { version: "p" } };
  const before = await answered(await draftOnObject(r.ctx, env, args));
  const grant = sent[0].body.grant;
  assert.equal(typeof grant, "string");
  assert.deepEqual([sent[0].body.account.suggestions, "pack" in sent[0].body], [true, false]);
  assert.deepEqual(before.json.result.withheld.map((x) => x.code), ["WRITING_HELP_FACT_ADDED"]);
  /* the grant's read log holds the figure: the same draft now keeps it */
  const a = answersOf(r.ctx);
  const log = a.readLog(grant);
  log.add("search", {}, { rows: [{ text: "Rent rose to 1,250 in May." }] });
  a.holdLog(log);
  sent.length = 0;
  const again = await answered(await draftOnObject(r.ctx, { ...env, AGENT_WORKER: { async fetch(u, init) {
    const body = JSON.parse(init.body); sent.push({ body });
    a.holdLog(Object.assign(a.readLog(body.grant), { entries: log.entries, index: log.index }));
    return reply({ ok: true, draft: { text: "Rent rose to 1,250 in May." }, usage: USE, calls: 1 }); } } }, args));
  assert.deepEqual(again.json.result.withheld, [], JSON.stringify(again.json).slice(0, 300));
  /* firsthand: no grant, the pack instead */
  sent.length = 0;
  await draftOnObject(r.ctx, env, { ...args, firsthand: true });
  assert.deepEqual(["grant" in sent[0].body, sent[0].body.firsthand, "pack" in sent[0].body], [false, true, true]);
});

test("R57: no AGENT_WORKER binding is 503 AGENT_WORKER_UNBOUND, a member that does not answer 502 AGENT_WORKER_SILENT, an ending agent-worker names is relayed as given, and a member no account serves is credentials' own refusal; in each, nothing is counted and nothing is kept", async () => {
  const w = await objectWorld();
  const args = { op: "writinghelp", member: "bea", session: w.sessions.bea, told: "x", act: "notewrite", field: "text", pack: null };
  const { AGENT_WORKER: _, ...unbound } = w.env;
  const u = await answered(await draftOnObject(w.r.ctx, unbound, args));
  assert.deepEqual([u.status, u.json.reason], [503, "AGENT_WORKER_UNBOUND"]);
  const s = await objectWorld(undefined, 200, { throws: true });
  const sl = await answered(await draftOnObject(s.r.ctx, s.env, { ...args, session: s.sessions.bea }));
  assert.deepEqual([sl.status, sl.json.reason], [502, "AGENT_WORKER_SILENT"]);
  const e = await objectWorld(undefined, 200, { ending: { ok: false, code: "exhausted", detail: "the turns ran out" } });
  const en = await answered(await draftOnObject(e.r.ctx, e.env, { ...args, session: e.sessions.bea }));
  assert.deepEqual([en.status, en.json], [502, { ok: false, code: "exhausted", detail: "the turns ran out" }]);
  const none = await answered(await draftOnObject(w.r.ctx, w.env, { ...args, member: "nobody" }));
  assert.equal(none.json.ok, false);
  for (const x of [w, s, e]) assert.deepEqual(x.used(), []);
});
