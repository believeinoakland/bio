/* control-plane T46 (T46-59): R65's disclosure before a sign-in's `start` and the runner's absence in member words; R57's
   status report (`statusreportassist`), its text check (`textcheck`) and the `untested` label every draft passes; R20's group
   fields in the review copy's in-band quartet; R77's member-run door (`airundispatch`); R54's `joindoors`; R76's
   explanation level (`infolevelset`, `infolevel`). Driven through `makeFetch(hooks)` over the harness's store, which records
   every request the plane makes, with stand-in objects for plane's RPC methods (`draft`, `groupFields`,
   `dispatchMemberRun`) and a stand-in `AGENT_WORKER` binding for the sign-in. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, refused, aik, cred, FORGED } from "./harness.mjs";
import { ok, callers, routesForSessions } from "./door-routes.mjs";
import { DRAFT_OPS, draftDue, draftAsk, untestedOf } from "../../../src/control-plane/draft.mjs";
import { SIGNIN_WORDS } from "../../../src/control-plane/signin.mjs";
const { inbandQuartet } = await import("../../../src/inband.mjs");

const { OPS, OP_STAMPS } = O;
const reply = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const USE = { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, total_cost_usd: null };
/* `run-rules`' `untestedLabel` shape, as the plane's draft door carries it on the test-instance exception */
const UNTESTED = Object.freeze({ kind: "untested", part: "draft:writinghelp", set: "GT-1", set_version: 1, words: "ai.label.untested" });
const packHooks = () => ({
  publicOp: async () => M.json({ ok: true }), publicInstanceGroup: async () => ({ answered: true, result: {} }),
  gatedOp: async (ctx) => (ctx.op === "affordances" ? M.json({ ok: true, result: { catalog: [], vocabularies: {} } }) : undefined),
});
/* A store whose objects carry the RPC methods `methods` names (each a recorder), beside the harness's routes. */
function withObject(w, methods) {
  const get = w.env.STORE.get.bind(w.env.STORE);
  w.env.STORE.get = (id) => ({ ...get(id), ...Object.fromEntries(Object.entries(methods).map(([k, f]) => [k, (args) => f(args, id)])) });
  return w;
}

/* ================================================================ R65 */

function agentWorker(answer) {
  const sent = [];
  return { sent, fetch: async (url, init) => {
    const body = JSON.parse(init.body);
    sent.push({ path: new URL(String(url)).pathname, body });
    return answer(body);
  } };
}
const signinRunner = (body) => reply(body.step === "start" ? { ok: true, address: "https://claude.ai/oauth/x" }
  : { ok: true, connected: body.step === "code" || body.step === "state", member: body.member });
function disclosureWorld({ shown = false, away = false, silent = false, runner = signinRunner } = {}) {
  const asked = [];
  const c = callers({ answer: (q) => {
    if (q.route === "aikeptaway") return ok(away ? { ok: false, reason: "AI_KEPT_AWAY", code: "AI_KEPT_AWAY", detail: "kept away" } : { ok: true });
    if (q.route === "disclosureof") { asked.push(q.params.member); return silent ? new Response("not json") : ok({ ok: true, member: q.params.member, shown }); }
    if (q.route === "subscriptionconnected") return ok({ ok: true, connected: true });
    return null;
  } });
  const aw = agentWorker(runner);
  c.w.env.AGENT_WORKER = aw;
  return { ...c, aw, asked };
}

test("R65 (T46; N897 (3); instance-setup R54; C-69.6): `start` is refused DISCLOSURE_DUE while `disclosureOf` answers `shown: false` for the member the door stamps, nothing sent to the runner; `state`, `signout` and `code` are never refused for it and never ask it; once shown, the same `start` is sent (negative control); a store that does not answer the question sends nothing; the keep-away refusal comes first", async () => {
  const due = disclosureWorld({ shown: false });
  for (const s of due.sessions) {
    due.aw.sent.length = 0;
    const r = await call(due.w.env, { op: "subscriptionsignin", token: s.token, method: "POST", body: { step: "start", member: FORGED } });
    refused(r, 409, "DISCLOSURE_DUE", "C-69.6");
    assert.equal(r.json.translation, M.DOOR_WORDS?.["refusal.DISCLOSURE_DUE"] ?? r.json.translation);
    assert.match(r.json.translation, /Read what connecting means first/);
    assert.deepEqual(due.aw.sent, [], `${s.name}: nothing sent`);
    assert.equal(due.asked.at(-1), s.by, `${s.name}: asked for the member the door stamps, never the caller's`);
  }
  for (const step of ["state", "signout", "code"]) {
    due.aw.sent.length = 0; due.asked.length = 0;
    const r = await call(due.w.env, { op: "subscriptionsignin", token: due.w.S.ann, method: "POST", body: { step, code: "C" } });
    assert.equal(r.status, 200, `${step}: ${r.text.slice(0, 200)}`);
    assert.deepEqual([due.aw.sent.length, due.asked.length], [1, 0], `${step}: sent, the disclosure not asked`);
  }
  /* negative control: after `disclosureshown`, the same start is sent */
  const shown = disclosureWorld({ shown: true });
  const r = await call(shown.w.env, { op: "subscriptionsignin", token: shown.w.S.ann, method: "POST", body: { step: "start" } });
  assert.deepEqual([r.status, r.json.address, shown.aw.sent.map((x) => x.body)], [200, "https://claude.ai/oauth/x",
    [{ member: "member:ann", step: "start" }]]);
  /* fail closed */
  const silent = disclosureWorld({ silent: true });
  const s = await call(silent.w.env, { op: "subscriptionsignin", token: silent.w.S.ann, method: "POST", body: { step: "start" } });
  refused(s, 502, "STORE_DID_NOT_ANSWER", "C-69.2");
  assert.deepEqual(silent.aw.sent, []);
  /* keep-away first: a group keeping its material away answers AI_KEPT_AWAY, and the disclosure is not asked */
  const away = disclosureWorld({ away: true });
  const a = await call(away.w.env, { op: "subscriptionsignin", token: away.w.S.ann, method: "POST", body: { step: "start" } });
  assert.deepEqual([a.status, a.json.reason, away.asked, away.aw.sent], [403, "AI_KEPT_AWAY", [], []]);
});

test("R65 (T46; N897 (4)): agent-worker's RUNNER_NOT_CONFIGURED (503) is relayed with its code and status unchanged, carrying the translation read by key `ai.refused.signinabsent`; any other refusal of the runner is relayed with no translation of the door's (negative control)", async () => {
  const absent = { ok: false, reason: "RUNNER_NOT_CONFIGURED", code: "RUNNER_NOT_CONFIGURED", worker: "agent-worker",
                   detail: "no runner is bound" };
  const x = disclosureWorld({ shown: true, runner: () => reply(absent, 503) });
  for (const step of ["start", "state", "code", "signout"]) {
    const r = await call(x.w.env, { op: "subscriptionsignin", token: x.w.S.ann, method: "POST", body: { step, code: "C" } });
    assert.deepEqual([r.status, r.json.ok, r.json.reason, r.json.code, r.json.detail, r.json.worker],
                     [503, false, "RUNNER_NOT_CONFIGURED", "RUNNER_NOT_CONFIGURED", "no runner is bound", "agent-worker"], step);
    assert.equal(r.json.translation, SIGNIN_WORDS["ai.refused.signinabsent"], step);
    assert.equal(r.json.translation, "Signing in with Claude is not installed in your group's Civicsmith yet. Whoever installed "
      + "your group's Civicsmith can add it.");
  }
  const other = disclosureWorld({ shown: true, runner: () => reply({ ok: false, reason: "SIGNIN_REFUSED", code: "SIGNIN_REFUSED", detail: "no" }, 409) });
  const r = await call(other.w.env, { op: "subscriptionsignin", token: other.w.S.ann, method: "POST", body: { step: "state" } });
  assert.deepEqual([r.status, r.json.reason], [409, "SIGNIN_REFUSED"]);
  assert.notEqual(r.json.translation, SIGNIN_WORDS["ai.refused.signinabsent"]);
});

/* ================================================================ R57 */

function draftWorld({ owner = null, drafted = null, status = 200 } = {}) {
  const asked = [];
  const w = world({ answer: (c) => {
    if (["writinghelp", "groupdescriptiondraft"].includes(c.route))
      return reply({ ok: true, result: { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE" } });
    if (c.route === "translationdraft")
      return reply({ ok: true, result: { ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE", direction: "from", language: "es", words: [{ key: "k", en: "x" }] } });
    if (c.route === "translationdraftrecord") return reply({ ok: true, result: { ok: true, recorded: 1 } });
    if (c.route === "statusreportassist")
      return reply({ ok: true, result: owner ?? { ok: true, plan: "PLAN-1", as_of: "2026-10-12T00:00:00Z",
                                                   items: [{ section: "holds", none: true }, { section: "watches", none: true }] } });
    return null;
  } });
  withObject(w, { draft: async (args, id) => {
    asked.push({ ns: id, ...args });
    const base = drafted ?? { ok: true, task: { op: args.op }, label: { kind: "machine" }, usage: USE, calls: 1, grant: null,
      suggestions: false, read: [],
      draft: args.op === "statusreportdraft" ? { text: "Where it stands.", sources: [0, 1] }
        : args.op === "textcheck" ? { sentences: [] }
        : args.op === "translationdraft" ? [{ key: "k", text: "y" }]
        : { text: "The lift was out.", focus: "Tenants.", purpose: "Tenants." } };
    return reply(typeof base === "function" ? base(args) : base, status);
  } });
  return { ...w, asked };
}

test("R57 (T46; N897 (2); plane R40, agent-worker R79): a draft the plane admitted on the test-instance exception answers its `untested` label in the answer the member receives, for every draft this door routes (writinghelp, groupdescriptiondraft, translationdraft, statusreportassist, textcheck); a draft admitted by the bar carries none (negative control)", async () => {
  const bodies = { writinghelp: { op: "notewrite", field: "text", told: "the lift" }, groupdescriptiondraft: { answers: [{ question: "Who?", text: "T" }] },
                   translationdraft: { direction: "from", language: "es", keys: ["k"] }, statusreportassist: { plan: "PLAN-1" },
                   textcheck: { text: "The landlord ignored us." } };
  for (const labelled of [true, false]) {
    const x = draftWorld({ drafted: (args) => ({ ok: true, task: { op: args.op }, label: { kind: "machine" }, usage: USE, calls: 1,
      suggestions: true, read: [], ...(labelled ? { untested: { ...UNTESTED, part: `draft:${args.op}` } } : {}),
      draft: args.op === "statusreportdraft" ? { text: "Where it stands.", sources: [0] } : args.op === "textcheck" ? { sentences: [] }
        : args.op === "translationdraft" ? [{ key: "k", text: "y" }] : { text: "The lift was out.", focus: "Tenants.", purpose: "Tenants." } }) });
    for (const [op, body] of Object.entries(bodies)) {
      const r = await call(x.env, { op, token: x.S.ann, method: "POST", hooks: packHooks(), body });
      assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 300)}`);
      const u = r.json.result?.untested;
      if (labelled) assert.deepEqual(u, { ...UNTESTED, part: `draft:${x.asked.at(-1).op}` }, op);
      else assert.equal(u, undefined, `${op}: a draft admitted by the bar carries no label`);
    }
  }
  assert.deepEqual(untestedOf({ untested: "yes" }), {}, "only the label's object is passed, nothing invented");
});

test("R57 (T46; N920; K2953, K2996; plan-work R14, agent-worker R76): `statusreportassist` is among the drafts; past the owner's items answer (`ok: true`, its items) the door hands the plane's draft door `{op: \"statusreportdraft\", member, session, plan, items}` (the owner's plan and items, never the caller's), with no told, grant, firsthand or pack, counts the use as a draft, writes nothing, and answers the labelled draft with the owner's plan and `as_of`; a plan the viewer may not see is answered as plan-work gives it (NO_SUCH_PLAN), nothing sent (negative control); a machine credential is refused before the store", async () => {
  assert.ok(DRAFT_OPS.includes("statusreportassist"));
  const spec = OPS.statusreportassist;
  assert.deepEqual([spec?.classes, spec?.machineClasses, spec?.mutating], [["admin", "member"], [], false]);
  const x = draftWorld();
  const r = await call(x.env, { op: "statusreportassist", token: x.S.ann, method: "POST", hooks: packHooks(),
                                params: { viewer: FORGED }, body: { plan: "PLAN-1", items: [{ forged: true }], viewer: FORGED } });
  assert.equal(r.status, 200, r.text.slice(0, 300));
  assert.deepEqual(x.asked, [{ ns: "bio", op: "statusreportdraft", member: "ann", session: x.S.ann, plan: "PLAN-1",
                               items: [{ section: "holds", none: true }, { section: "watches", none: true }] }]);
  assert.deepEqual(r.json.result, { ok: true, plan: "PLAN-1", as_of: "2026-10-12T00:00:00Z",
                                    draft: { text: "Where it stands.", sources: [0, 1] }, label: { kind: "machine" } });
  const inner = opCalls(x.env).filter((c) => c.route === "statusreportassist");
  assert.equal(inner.length, 1);
  assert.equal(inner[0].params.viewer, "member:ann", "the viewer the door stamps");
  assert.deepEqual(opCalls(x.env).map((c) => c.route), ["statusreportassist", "askusage"], "the use counted, nothing written");
  assert.equal(opCalls(x.env)[1].body.mode, "draft");
  /* negative control: the owner's refusal is answered as given, nothing sent */
  const hidden = draftWorld({ owner: { ok: false, reason: "NO_SUCH_PLAN", detail: "no such plan" } });
  const h = await call(hidden.env, { op: "statusreportassist", token: hidden.S.ann, method: "POST", hooks: packHooks(), body: { plan: "PLAN-9" } });
  assert.deepEqual([h.json.result.ok, h.json.result.reason, hidden.asked], [false, "NO_SUCH_PLAN", []]);
  assert.equal(draftDue("statusreportassist", { result: { ok: true, items: [] } }), false, "no items, no draft");
  assert.deepEqual(draftAsk("statusreportassist", { plan: "FORGED", items: [1] }, { member: "m", session: "s", owner: { plan: "P", items: [2] } }),
                   { op: "statusreportdraft", member: "m", session: "s", plan: "P", items: [2] });
  for (const token of [x.env.ADMIN_TOKEN, x.env.DAEMON_TOKEN]) {
    x.env.calls.length = 0;
    const m = await call(x.env, { op: "statusreportassist", token, method: "POST", body: { plan: "PLAN-1" } });
    assert.equal(m.json.ok, false);
    assert.deepEqual(opCalls(x.env), []);
  }
});

test("R57 (T46; N917; plane R41, agent-worker R76): `textcheck` is asked of the plane's draft door with the body's `text` alone (`{op: \"textcheck\", member, session, text}`, no told, grant, firsthand or pack), answered labelled, its use counted as a draft and nothing recorded or handed to filings; a `text` in the address never reaches it; the plane's ending is relayed as given; every machine credential is refused before anything is asked (negative control)", async () => {
  const spec = OPS.textcheck;
  assert.deepEqual([spec?.classes, spec?.machineClasses, spec?.mutating], [["admin", "member"], [], false]);
  const x = draftWorld();
  for (const [token, member] of [[x.S.ann, "ann"], [x.S.founder, "admin"]]) {
    x.asked.length = 0; x.env.calls.length = 0;
    const r = await call(x.env, { op: "textcheck", token, method: "POST", params: { text: "from the address", by: FORGED },
                                  body: { text: "The landlord ignored us.", told: "x", firsthand: true } });
    assert.equal(r.status, 200, r.text.slice(0, 300));
    assert.deepEqual(x.asked, [{ ns: "bio", op: "textcheck", member, session: token, text: "The landlord ignored us." }]);
    assert.deepEqual(r.json.result, { ok: true, draft: { sentences: [] }, label: { kind: "machine" } });
    assert.deepEqual(opCalls(x.env).map((c) => [c.route, c.body?.mode]), [["askusage", "draft"]], "counted; nothing recorded");
  }
  const ending = draftWorld({ drafted: { ok: false, code: "AI_PART_NOT_DEPLOYED", check: "C-22.29", detail: "not deployed" }, status: 403 });
  const e = await call(ending.env, { op: "textcheck", token: ending.S.ann, method: "POST", body: { text: "t" } });
  assert.deepEqual([e.status, e.json.ok, e.json.code], [403, false, "AI_PART_NOT_DEPLOYED"]);
  assert.deepEqual(opCalls(ending.env).map((c) => [c.route, c.body]), [["wizardrefusaltally", { op: "textcheck", code: "AI_PART_NOT_DEPLOYED" }]],
                   "an ending counts no use; only the refusal's tally (R50)");
  const agent = aik();
  const m = withObject(world({ creds: { [agent]: cred({ writes: Object.keys(OPS) }) } }), { draft: async () => { throw new Error("asked"); } });
  for (const token of [m.env.ADMIN_TOKEN, m.env.DAEMON_TOKEN, agent]) {
    const r = await call(m.env, { op: "textcheck", token, method: "POST", body: { text: "t" } });
    assert.equal(r.json.ok, false);
    assert.notEqual(r.status, 200);
  }
});

/* ================================================================ R20 */

test("R20 (T46; N905; public-read R34, R7; K2999): the review copy's in-band quartet carries `group`, the object's `groupFields()` read at that request, beside `hash`, which it never enters: the same draft under two different group fields answers the same `hash` (control); with no such read on the object, `group` is null and nothing is guessed", async () => {
  const copy = { ok: true, draft: "D1", updated_by: "iris", required_strength: "B", text: "the draft's words",
                 last_change: { kind: "comment", at: "2026-08-01T12:00:00.123Z", by: "ann" } };
  const A = { group: "grp-a", name: "Rivertown Tenants", domain: null, domain_verified_at: null, stake: "tenants", detail: null };
  const B = { group: "grp-b", name: "Hilltop", domain: "hill.example", domain_verified_at: "2026-09-01", stake: null, detail: null };
  const hashes = [];
  for (const fields of [A, B, null]) {
    const w = world({ answer: (c) => (c.route === "reviewcopy" ? reply({ ok: true, result: copy }) : null) });
    let reads = 0;
    if (fields) withObject(w, { groupFields: async (_a, id) => { reads++; assert.equal(id, "bio"); return fields; } });
    for (const req of [{ params: { secret: "s3cret" } }, { token: w.S.ann, params: { draft: "D1" } }]) {
      const r = await call(w.env, { op: "reviewcopy", ...req });
      assert.equal(r.status, 200, r.text.slice(0, 200));
      const { inband, ...rest } = r.json;
      assert.deepEqual(inband.group, fields);
      const { quartet } = await inbandQuartet({ subject: rest, over: inband.hash.over, date: copy.last_change.at,
                                                author: copy.updated_by, bar: copy.required_strength, group: fields });
      assert.deepEqual(inband, quartet);
      hashes.push(inband.hash.sha256);
    }
    if (fields) assert.equal(reads, 2, "read at each request");
  }
  assert.equal(new Set(hashes).size, 1, "the group fields never enter the hash");
  /* the dead answer reads no group */
  const dead = withObject(world({ answer: (c) => (c.route === "reviewcopy" ? reply({ ok: true, result: { ok: false, reason: "NO_REVIEW_COPY" } }) : null) }),
    { groupFields: async () => { throw new Error("read"); } });
  const d = await call(dead.env, { op: "reviewcopy", params: { secret: "nope" } });
  assert.equal(d.status, 404);
});

/* ================================================================ R77 */

function runWorld({ answer } = {}) {
  const agent = aik(), other = aik(), SENTINEL = agent;
  const w = world({ creds: {
    [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: ["airundispatch"] }),
    [other]: cred({ tokenId: "agent-bea", principal: "member:bea", writes: ["airundispatch"] }),
  } });
  const asked = [];
  withObject(w, { dispatchMemberRun: async (args, id) => {
    asked.push({ ns: id, ...args });
    return answer ? answer(args) : { run: args.run, found: true, dispatched: true, status: "running", dispatch: { state: "DISPATCHED" } };
  } });
  return { ...w, agent, other, asked, SENTINEL };
}

test("R77 (T46; N919; K2892, K2952, K2999; ai-runs R18): `airundispatch` is declared for a member, mutating, with no `machineClasses`; a member's run opened on her own `ai` credential is dispatched once through the object's `dispatchMemberRun` with `run` from the body, `by` and `viewer` the member her principal names (never `class:ai/<tokenId>`) and `credential` the credential she presented, in process: it is in no address, header or body of any request the plane makes, nor in the answer; the answer is ai-runs', as given", async () => {
  const spec = OPS.airundispatch;
  assert.deepEqual([spec?.classes, Object.hasOwn(spec ?? {}, "machineClasses"), spec?.mutating], [["admin", "member"], false, true]);
  const x = runWorld();
  const r = await call(x.env, { op: "airundispatch", token: x.agent, method: "POST", params: { by: FORGED, run: "RUN-forged" },
                                body: { run: "RUN-1", by: FORGED, viewer: FORGED, credential: "forged" } });
  assert.equal(r.status, 200, r.text.slice(0, 300));
  assert.equal(x.asked.length, 1);
  const { at, ...rest } = x.asked[0];
  assert.deepEqual(rest, { ns: "bio", run: "RUN-1", by: "member:ann", viewer: "member:ann", credential: x.agent });
  assert.ok(!Number.isNaN(Date.parse(at)));
  assert.deepEqual(r.json.result, { run: "RUN-1", found: true, dispatched: true, status: "running", dispatch: { state: "DISPATCHED" } });
  assert.equal(r.text.includes(x.SENTINEL), false, "the credential is never answered");
  for (const c of x.env.calls) {
    assert.equal(c.url.href.includes(x.SENTINEL), false, `${c.route}: address`);
    if (c.route !== "aicredentiallook")
      assert.equal(JSON.stringify([c.headers, c.body]).includes(x.SENTINEL), false, `${c.route}: header or body`);
  }
});

test("R77 (controls): the same request by her session alone hands no credential and is withheld MEMBER_PRINCIPAL_RUN as ai-runs answers it; another member's credential is refused AI_RUN_NOT_PRINCIPAL as given; a binding class is stamped its machine form and refused by ai-runs; with no `dispatchMemberRun` on the object the door answers 503 AGENT_WORKER_UNBOUND, nothing sent", async () => {
  const notPrincipal = { run: "RUN-1", dispatched: false, found: true, status: "running", code: "AI_RUN_NOT_PRINCIPAL", check: "C-22.12",
                         translation: "not yours", detail: "a run is continued by its principal alone" };
  const x = runWorld({ answer: (a) => (a.by !== "member:ann" ? notPrincipal
    : !a.credential ? { run: a.run, found: true, dispatched: false, status: "running", withheld: "MEMBER_PRINCIPAL_RUN", note: "Nothing was sent" }
    : { run: a.run, found: true, dispatched: true, status: "running" }) });
  const s = await call(x.env, { op: "airundispatch", token: x.S.ann, method: "POST", body: { run: "RUN-1" } });
  assert.deepEqual([s.status, s.json.result.withheld, x.asked.at(-1).credential, x.asked.at(-1).by], [200, "MEMBER_PRINCIPAL_RUN", null, "member:ann"]);
  const o = await call(x.env, { op: "airundispatch", token: x.other, method: "POST", body: { run: "RUN-1" } });
  assert.deepEqual([o.status, o.json.result.ok, o.json.result.reason, o.json.result.code, x.asked.at(-1).by, x.asked.at(-1).credential],
                   [403, false, "AI_RUN_NOT_PRINCIPAL", "AI_RUN_NOT_PRINCIPAL", "member:bea", x.other]);
  const m = await call(x.env, { op: "airundispatch", token: x.env.ADMIN_TOKEN, method: "POST", body: { run: "RUN-1" } });
  assert.deepEqual([m.json.result?.code, x.asked.at(-1).by, x.asked.at(-1).credential], ["AI_RUN_NOT_PRINCIPAL", "class:admin", null]);
  const bare = world();
  const u = await call(bare.env, { op: "airundispatch", token: bare.S.ann, method: "POST", body: { run: "RUN-1" } });
  assert.deepEqual([u.status, u.json.reason], [503, "AGENT_WORKER_UNBOUND"]);
  assert.deepEqual(opCalls(bare.env).map((c) => c.route), ["wizardrefusaltally"], "nothing sent; only the refusal's tally (R50)");
});

/* ================================================================ R54, R76 */

test("R54 (T46; N654; membership R130): `joindoors` reaches membership's route for an administrator's or a member's session with `by` the session's own member id (the form membership asks `isAdministrator` of), none taken from the caller; every machine credential is refused before any store request; membership's NOT_AN_ADMIN is answered as given", async () => {
  const spec = OPS.joindoors;
  assert.deepEqual([spec?.classes, spec?.machineClasses, spec?.mutating], [["admin", "member"], [], false]);
  const { w, machines } = callers({ answer: (c) => (c.route === "joindoors"
    ? ok(c.params.by === "admin" ? { ok: true, websiteKey: { live: false }, joinLink: { live: false } } : { ok: false, reason: "NOT_AN_ADMIN", detail: "not an administrator" })
    : null) });
  for (const [token, by] of [[w.S.founder, "admin"], [w.S.ann, "ann"]]) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op: "joindoors", token, params: { by: FORGED, limit: "5" } });
    const [inner] = opCalls(w.env);
    assert.deepEqual([inner.route, inner.params.by, inner.params.limit], ["joindoors", by, "5"]);
    assert.equal(JSON.stringify(inner).includes(FORGED), false);
    if (by === "ann") assert.deepEqual([r.json.result.ok, r.json.result.reason], [false, "NOT_AN_ADMIN"]);
    else assert.equal(r.json.result.ok, true);
  }
  for (const m of machines) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op: "joindoors", token: m.token, params: m.params ?? {} });
    assert.equal(r.json.ok, false, m.name);
    assert.deepEqual(opCalls(w.env).filter((c) => c.route === "joindoors"), [], m.name);
  }
});

test("R76 (T46; DEC-162; instance-setup R79; op-declarations R50): `infolevelset` and `infolevel` reach instance-setup's routes of their own names for a member's or the founder's session, `infolevelset`'s `by` and `infolevel`'s `viewer` stamped from the session and none taken from the caller, the body's `level` and `asked` kept; every machine credential is refused before any store request; a refusal is instance-setup's, answered as given", async () => {
  assert.ok(OP_STAMPS.infolevelset?.includes("by"));
  assert.ok(OP_STAMPS.infolevel?.includes("viewer"));
  await routesForSessions(["infolevelset", "infolevel"], (op) => (op === "infolevelset" ? { level: "pause", asked: true } : {}));
});
