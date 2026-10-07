/* control-plane R57 (T35; N686, K1837, K1841, K2038; agent-worker R59, ai-runs R48, wizard-scripts R25): the two drafts, asked
   of the object's `draft` (plane's, which posts agent-worker's `POST /draft`) once every refusal is answered, their use
   counted as a draft and the draft checked at the door before the member sees it. Driven through `makeFetch(hooks)` over the
   harness's store, the object's `draft` a recorder answering as plane's does. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, world, call, opCalls, FORGED } from "./harness.mjs";
import { draftDue } from "../../../src/control-plane/draft.mjs";

const USE = { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, total_cost_usd: null };
const reply = (o, status = 200) => new Response(JSON.stringify(o), { status });

/* ---- the Worker's half ---- */

/* A world whose store answers the two drafts as their owners do past every refusal (or with `refusal`), and whose objects
   record what their `draft` is asked. */
function draftWorld(refusal = null, drafted = null, status = 200) {
  const asked = [];
  const w = world({ answer: (c) => (["writinghelp", "groupdescriptiondraft"].includes(c.route)
    ? reply({ ok: true, result: refusal ?? { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE", firsthand: c.route === "writinghelp" && c.body?.op === "observe" } })
    : null) });
  const get = w.env.STORE.get.bind(w.env.STORE);
  w.env.STORE.get = (id) => ({ ...get(id), async draft(args) {
    asked.push({ ns: id, ...args });
    return reply(drafted ?? { ok: true, task: { op: args.op }, draft: { text: "The lift was out.", focus: "Tenants.", purpose: "Tenants." },
                              label: { kind: "machine" }, usage: USE, calls: 2, grant: "GRANT-SECRET", suggestions: false, read: [] }, status);
  } });
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
  assert.deepEqual([help.status, help.json.result.text, help.json.store, help.json.tokenClass], [200, "The lift was out.", "bio", "member"], help.text.slice(0, 300));
  assert.equal(help.text.includes("GRANT-SECRET"), false, "the grant is never answered");
  const gdd = await call(env, { op: "groupdescriptiondraft", token: S.founder, method: "POST", hooks: packHooks(seen),
                                body: { answers: [{ question: "Who?", text: "Tenants" }] } });
  assert.deepEqual([gdd.json.result.focus.text, gdd.json.result.purpose.text, gdd.json.result.focus.label.kind], ["Tenants.", "Tenants.", "machine"]);
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

test("R57 (ai-runs R48): a draft that reached the model is counted to the member's day as a draft through the store's `askusage`, the member its viewer, whatever the check answers; an ending is not counted and is relayed as given, as is plane's AGENT_WORKER_UNBOUND, and the grant is never answered", async () => {
  const counted = (env) => env.calls.filter((c) => c.route === "askusage").map((c) => [c.params.viewer, c.body.mode, c.body.calls, c.url.href.includes("GRANT")]);
  const ok = draftWorld();
  await call(ok.env, { op: "writinghelp", token: ok.S.ann, method: "POST", hooks: packHooks(), body: { op: "notewrite", field: "text", told: "the lift was out" } });
  assert.deepEqual(counted(ok.env), [["member:ann", "draft", 2, false]]);
  const end = draftWorld(null, { ok: false, code: "exhausted", detail: "the turns ran out", grant: "GRANT-SECRET" }, 502);
  const e = await call(end.env, { op: "writinghelp", token: end.S.ann, method: "POST", hooks: packHooks(), body: { told: "x" } });
  assert.deepEqual([e.status, e.json.code, e.json.detail, e.text.includes("GRANT-SECRET")], [502, "exhausted", "the turns ran out", false]);
  assert.deepEqual(counted(end.env), []);
  const unbound = draftWorld(null, { ok: false, reason: "AGENT_WORKER_UNBOUND", detail: "no assistant" }, 503);
  const u = await call(unbound.env, { op: "groupdescriptiondraft", token: unbound.S.founder, method: "POST", hooks: packHooks(), body: { answers: [] } });
  assert.deepEqual([u.status, u.json.reason], [503, "AGENT_WORKER_UNBOUND"]);
});

test("R57 (wizard-scripts R25; DEC-153 (2)): the door checks the draft before the member sees it — a sentence stating a fact neither told nor read is withheld whole, the same fact read under the grant (`read`) is kept, a read while the switch is off or in a firsthand field is refused by name — and a description over its field's limit is not answered", async () => {
  const draft = { text: "The lift was out. Rent rose to 1,250 in May." };
  const run = async (extra, body = { op: "notewrite", field: "text", told: "the lift was out" }) => {
    const w = draftWorld(null, { ok: true, draft, usage: USE, calls: 1, grant: "G", suggestions: false, read: [], ...extra });
    return call(w.env, { op: "writinghelp", token: w.S.ann, method: "POST", hooks: packHooks(), body });
  };
  const bare = await run({});
  assert.deepEqual([bare.json.result.text, bare.json.result.withheld.map((x) => x.sentence)], ["The lift was out.", ["Rent rose to 1,250 in May."]]);
  const read = await run({ suggestions: true, read: ["Rent rose to 1,250 in May, the notice says."] });
  assert.deepEqual([read.json.result.text, read.json.result.withheld], ["The lift was out. Rent rose to 1,250 in May.", []]);
  const off = await run({ suggestions: false, read: ["something read"] });
  assert.deepEqual([off.status, off.json.reason], [409, "WRITING_HELP_SUGGESTIONS_OFF"]);
  const first = await run({ suggestions: true, read: ["something read"] }, { op: "observe", field: "text", told: "x" });
  assert.deepEqual([first.status, first.json.reason], [409, "WRITING_HELP_FIRSTHAND_READ"]);
  const long = draftWorld(null, { ok: true, draft: { focus: "Tenants. ".repeat(200), purpose: "Tenants." }, usage: USE, calls: 1, read: [] });
  const l = await call(long.env, { op: "groupdescriptiondraft", token: long.S.founder, method: "POST", hooks: packHooks(),
                                   body: { answers: [{ question: "Who?", text: "Tenants" }] } });
  assert.deepEqual([l.status, l.json.reason], [409, "ASSISTANT_DRAFT_UNAVAILABLE"]);
});
