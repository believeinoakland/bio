/* control-plane T37 (T37-33): R57's third draft (`translationdraft`), R65 (a member's own Claude sign-in relayed to their
   own runner), R66 (instance-setup's translation ops), R67 (case-carriage's photo marks) and R68 (`setpassword`). Driven
   through `makeFetch(hooks)` over the harness's store, which records every request the plane makes, with a stand-in
   `AGENT_WORKER` binding that records each request it is sent and a stand-in object `draft` (plane's `draftOnObject`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { call, opCalls, FORGED } from "./harness.mjs";
import { ok, callers, routesForSessions } from "./door-routes.mjs";

const TRANSLATION_OPS = ["translationgrant", "translationadopt", "translationconfirm", "translationrevert", "translationmark",
                         "translations", "interfacewords"];
const PHOTO_OPS = ["obscuremark", "photomarks"];

/* The stand-in binding: records each request (its path and parsed body) and answers as `reply(path, body)` says. */
function agentWorker(reply = () => ok({})) {
  const sent = [];
  return { sent, fetch: async (url, init) => {
    const body = JSON.parse(init.body);
    sent.push({ url: String(url), path: new URL(String(url)).pathname, body, headers: init.headers });
    return reply(new URL(String(url)).pathname, body);
  } };
}
const runner = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/* ---------------------------------------------------------------- R66 */

test("R66 (N669; op-declarations R37; instance-setup R69–R74): the seven translation ops reach instance-setup's routes of their own names for a member's or the founder's session, each stamp op-declarations declares set from the session and none taken from the caller, the body's own fields kept; every machine credential is refused before any store request; a refusal is instance-setup's, answered as given", async () => {
  await routesForSessions(TRANSLATION_OPS, (op) => ({ language: "es", key: "nav.home", ...(op === "translationadopt" ? { text: "Inicio", draft: "TD-1" } : {}),
                                                      ...(op === "translationgrant" ? { member: "bea", revoke: false } : {}),
                                                      ...(op === "translationmark" ? { note: "looks odd" } : {}) }));
});

test("R66 (op-declarations R6, R37): `translationdraftrecord` is never served to a caller — every caller and method is answered UNKNOWN_OP (C-69.1), as an op with no spec, and nothing reaches any store", async () => {
  const { w, sessions, machines } = callers();
  for (const c of [...sessions, ...machines, { name: "none" }]) for (const method of ["GET", "POST"]) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op: "translationdraftrecord", token: c.token, method, body: method === "POST" ? { words: [] } : undefined });
    assert.equal(r.status, 400, `${c.name}/${method}`);
    assert.deepEqual([r.json.reason, r.json.check], ["UNKNOWN_OP", "C-69.1"], c.name);
    assert.deepEqual(opCalls(w.env), [], `${c.name}: no store request`);
  }
});

/* ---------------------------------------------------------------- R67 */

test("R67 (N757; op-declarations R38; case-carriage R9, R10): `obscuremark` and `photomarks` reach case-carriage's routes of their own names for a member's or the founder's session, `by` and `viewer` set from the session as declared and none taken from the caller, `captureSha` and `areas` kept from the body; every machine credential is refused before any store request; a refusal is case-carriage's, answered as given", async () => {
  await routesForSessions(PHOTO_OPS, (op) => (op === "obscuremark"
    ? { captureSha: "a".repeat(64), areas: [{ rect: [1, 2, 30, 40], kind: "plate" }] } : { captureSha: "a".repeat(64) }));
});

/* ---------------------------------------------------------------- R68 */

test("R68 (N776; DEC-182 (4); op-declarations R39; credentials R3): `setpassword` reaches credentials' route for a member's or the founder's session with `by` from the session, the session it presented in the `x-bio-session` header (never an address or a body), `source` and `country` stamped as on `login`, never the caller's; a body or address `role` never reaches it; `current` and `password` pass from the body alone and appear in no address, header or answer; every machine credential is refused before any store request", async () => {
  const CURRENT = "sentinel-current-password-R68", NEXT = "sentinel-new-password-R68-xyz";
  const { w, sessions, machines } = callers({ answer: (c) => (c.route === "setpassword" ? ok({ ok: true, role: "member:ann", ended: 1 }) : null) });
  for (const s of sessions) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op: "setpassword", token: s.token, method: "POST", cf: { country: "NZ" },
      params: { by: FORGED, source: "forged-source", country: "XX", role: "admin", current: "query-current", password: "query-password", session: "forged" },
      body: { current: CURRENT, password: NEXT, role: "admin", by: FORGED, source: "forged-source", country: "XX", session: "forged" } });
    assert.equal(r.status, 200, `${s.name}: ${r.text.slice(0, 200)}`);
    const [inner] = opCalls(w.env).filter((c) => c.route === "setpassword");
    assert.equal(inner.params.by, s.by, s.name);
    assert.equal(inner.headers["x-bio-session"], s.token, `${s.name}: the presented session, in the header`);
    assert.equal(inner.params.country, "NZ");
    assert.notEqual(inner.params.source, "forged-source");
    for (const k of ["role", "current", "password", "session"]) assert.equal(Object.hasOwn(inner.params, k), false, `${s.name}: no ${k} in the address`);
    assert.deepEqual([inner.body.current, inner.body.password, Object.hasOwn(inner.body, "role")], [CURRENT, NEXT, false],
                     `${s.name}: the two passwords from the body alone, no role`);
    for (const c of [...w.env.calls, ...w.env.windowCalls, ...w.env.countCalls]) {
      assert.equal(c.url.href.includes(CURRENT) || c.url.href.includes(NEXT) || c.url.href.includes(s.token), false, `${c.route}: address`);
      if (c.route !== "setpassword") assert.equal(JSON.stringify([c.headers, c.body]).includes(CURRENT), false, `${c.route}: elsewhere`);
    }
    assert.equal(r.text.includes(CURRENT) || r.text.includes(NEXT), false, "no password in the answer");
  }
  /* a refusal is credentials', answered as given, and carries neither password */
  const refusing = callers({ answer: (c) => (c.route === "setpassword" ? ok({ ok: false, reason: "CURRENT_PASSWORD_WRONG", detail: "wrong" }) : null) });
  const no = await call(refusing.w.env, { op: "setpassword", token: refusing.w.S.ann, method: "POST", body: { current: CURRENT, password: NEXT } });
  assert.equal(no.json.result.reason, "CURRENT_PASSWORD_WRONG");
  assert.equal(no.text.includes(CURRENT) || no.text.includes(NEXT), false);
  for (const m of machines) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op: "setpassword", token: m.token, method: "POST", params: m.params ?? {}, body: { current: CURRENT, password: NEXT } });
    assert.equal(r.json.ok, false, m.name);
    assert.deepEqual(opCalls(w.env).filter((c) => c.route === "setpassword"), [], `${m.name}: no store request`);
    assert.equal(r.text.includes(CURRENT), false);
  }
});

/* ---------------------------------------------------------------- R65 */

const keptAway = { ok: false, reason: "AI_KEPT_AWAY", code: "AI_KEPT_AWAY", detail: "kept away", keep_away: { reason: "a case", set_by: "admin", set_at: "2026-10-01" } };
function signinWorld({ away = false, reply } = {}) {
  const c = callers({ answer: (q) => (q.route === "aikeptaway" ? ok(away ? keptAway : { ok: true })
                                      : q.route === "subscriptionconnected" ? ok({ ok: true, connected: true }) : null) });
  const aw = agentWorker(reply ?? ((path, body) => runner(200, body.step === "start" ? { ok: true, address: "https://claude.ai/oauth/x" }
    : { ok: true, connected: body.step === "code" || body.step === "state", member: body.member })));
  c.w.env.AGENT_WORKER = aw;
  return { ...c, aw };
}

test("R65 (N708; DEC-156; agent-worker R66, R67; credentials R43): `subscriptionsignin` sends `{member, step, code?}` to agent-worker's `POST /signin`, `member` the session's `by` and never the caller's, `step` and `code` the body's; the runner's answer is relayed as given, status and body; the code is in that one request's body and in no address, header, store request or answer; a `code` or `state` answer with `connected: true` for that member, and only that, is recorded through credentials' `subscriptionConnected` (the store's internal `subscriptionconnected`, `by` the member)", async () => {
  const CODE = "sentinel-anthropic-code-R65";
  const { w, sessions, aw } = signinWorld();
  for (const s of sessions) for (const step of ["start", "code", "state", "signout"]) {
    w.env.calls.length = 0; aw.sent.length = 0;
    const r = await call(w.env, { op: "subscriptionsignin", token: s.token, method: "POST",
                                  params: { member: FORGED }, body: { step, code: CODE, member: FORGED, by: FORGED } });
    assert.equal(r.status, 200, `${s.name}/${step}: ${r.text.slice(0, 200)}`);
    assert.equal(aw.sent.length, 1, step);
    assert.equal(aw.sent[0].path, "/signin");
    assert.deepEqual(aw.sent[0].body, { member: s.by, step, ...(step === "code" ? { code: CODE } : {}) }, `${s.name}/${step}`);
    const expected = step === "start" ? { ok: true, address: "https://claude.ai/oauth/x" }
      : { ok: true, connected: step === "code" || step === "state", member: s.by };
    for (const [k, v] of Object.entries(expected)) assert.deepEqual(r.json[k], v, `${step}: relayed ${k}`);
    const recorded = opCalls(w.env).filter((c) => c.route === "subscriptionconnected");
    assert.equal(recorded.length, step === "code" || step === "state" ? 1 : 0, `${s.name}/${step}: recorded only after connected: true`);
    if (recorded.length) assert.deepEqual([recorded[0].params, recorded[0].body], [{ by: s.by }, {}]);
    assert.equal(opCalls(w.env).filter((c) => c.route === "aikeptaway").length, step === "start" || step === "code" ? 1 : 0, step);
    assert.equal(r.text.includes(CODE), false, "the code is in no answer");
    for (const c of [...w.env.calls, ...w.env.windowCalls, ...w.env.countCalls])
      assert.equal(JSON.stringify([c.url.href, c.headers, c.body]).includes(CODE), false, `${step}: the code in no store request`);
    assert.equal(aw.sent[0].url.includes(CODE), false);
  }
  /* `connected: false`, or `connected: true` naming another member, records nothing */
  for (const answer of [{ ok: true, connected: false, member: "member:ann" }, { ok: true, connected: true, member: "member:bea" }]) {
    const x = signinWorld({ reply: () => runner(200, answer) });
    await call(x.w.env, { op: "subscriptionsignin", token: x.w.S.ann, method: "POST", body: { step: "state" } });
    assert.deepEqual(opCalls(x.w.env).filter((c) => c.route === "subscriptionconnected"), [], JSON.stringify(answer));
  }
  /* the runner's refusal, at its status and in its words */
  const refusing = signinWorld({ reply: () => runner(409, { ok: false, reason: "NOT_THIS_MEMBER", detail: "another member's sign-in" }) });
  const r = await call(refusing.w.env, { op: "subscriptionsignin", token: refusing.w.S.ann, method: "POST", body: { step: "code", code: CODE } });
  assert.deepEqual([r.status, r.json.reason, r.json.detail], [409, "NOT_THIS_MEMBER", "another member's sign-in"]);
  assert.deepEqual(opCalls(refusing.w.env).filter((c) => c.route === "subscriptionconnected"), []);
});

test("R65 (credentials R35; K2200 (9)): while the group keeps its material away, `start` and `code` are refused with credentials' `AI_KEPT_AWAY` as it answers it, nothing sent to the runner; `state` and `signout` are always sent; a store that does not answer the keep-away question sends nothing (negative control: with keep-away off, `start` is sent)", async () => {
  const { w, aw } = signinWorld({ away: true });
  for (const step of ["start", "code"]) {
    aw.sent.length = 0;
    const r = await call(w.env, { op: "subscriptionsignin", token: w.S.ann, method: "POST", body: { step, code: "c" } });
    assert.equal(r.status, 403, step);
    assert.deepEqual([r.json.ok, r.json.reason, r.json.keep_away.reason], [false, "AI_KEPT_AWAY", "a case"], step);
    assert.deepEqual(aw.sent, [], `${step}: nothing sent`);
  }
  for (const step of ["state", "signout"]) {
    aw.sent.length = 0;
    const r = await call(w.env, { op: "subscriptionsignin", token: w.S.ann, method: "POST", body: { step } });
    assert.equal(r.status, 200, step);
    assert.equal(aw.sent.length, 1, `${step}: always sent`);
  }
  const silent = callers({ answer: (q) => (q.route === "aikeptaway" ? new Response("not json") : null) });
  silent.w.env.AGENT_WORKER = agentWorker();
  const r = await call(silent.w.env, { op: "subscriptionsignin", token: silent.w.S.ann, method: "POST", body: { step: "start" } });
  assert.equal(r.status, 502);
  assert.equal(r.json.reason, "STORE_DID_NOT_ANSWER");
  assert.deepEqual(silent.w.env.AGENT_WORKER.sent, []);
  const open = signinWorld({ away: false });
  assert.equal((await call(open.w.env, { op: "subscriptionsignin", token: open.w.S.ann, method: "POST", body: { step: "start" } })).status, 200);
  assert.equal(open.aw.sent.length, 1);
});

test("R65: with no `AGENT_WORKER` binding the door answers 503 AGENT_WORKER_UNBOUND; a runner that throws or answers no JSON, 502 AGENT_WORKER_SILENT; every machine credential is refused before the runner or any store is asked", async () => {
  const { w, machines } = signinWorld();
  delete w.env.AGENT_WORKER;
  const r = await call(w.env, { op: "subscriptionsignin", token: w.S.ann, method: "POST", body: { step: "state" } });
  assert.deepEqual([r.status, r.json.reason], [503, "AGENT_WORKER_UNBOUND"]);
  for (const reply of [() => { throw new Error("down"); }, () => new Response("<html>")]) {
    const x = signinWorld({ reply });
    const s = await call(x.w.env, { op: "subscriptionsignin", token: x.w.S.ann, method: "POST", body: { step: "state" } });
    assert.deepEqual([s.status, s.json.reason], [502, "AGENT_WORKER_SILENT"]);
  }
  const x = signinWorld();
  for (const m of machines) {
    x.w.env.calls.length = 0; x.aw.sent.length = 0;
    const s = await call(x.w.env, { op: "subscriptionsignin", token: m.token, method: "POST", params: m.params ?? {}, body: { step: "state" } });
    assert.equal(s.json.ok, false, m.name);
    assert.deepEqual([x.aw.sent, opCalls(x.w.env).filter((c) => c.route === "aikeptaway")], [[], []], m.name);
  }
});

test("R65 (credentials R16, R43): the member's own `subscriptiondisconnect` and their revocation (`memberset` to `revoked`, a carried `adminremove`) send `step: \"signout\"` for that member after the act; a runner that cannot be reached changes neither act's answer; an act that did not succeed, or did not revoke, sends nothing", async () => {
  const answers = { subscriptiondisconnect: { ok: true, disconnected: true }, memberset: { ok: true, memberId: "bea", status: "revoked" },
                    adminremove: { ok: true, memberId: "bea", removed: true } };
  for (const throws of [false, true]) {
    const { w } = callers({ answer: (c) => (answers[c.route] ? ok(answers[c.route]) : null) });
    const aw = agentWorker(() => { if (throws) throw new Error("down"); return runner(200, { ok: true, connected: false }); });
    w.env.AGENT_WORKER = aw;
    const drives = [
      [{ op: "subscriptiondisconnect", token: w.S.ann, method: "POST", body: {} }, "member:ann"],
      [{ op: "memberset", token: w.S.founder, method: "POST", body: { memberId: "bea", status: "revoked" } }, "member:bea"],
      [{ op: "adminremove", token: w.S.founder, method: "POST", body: { memberId: "bea", reason: "r" } }, "member:bea"],
    ];
    for (const [drive, who] of drives) {
      aw.sent.length = 0;
      const r = await call(w.env, drive);
      assert.equal(r.status, 200, `${drive.op}: ${r.text.slice(0, 200)}`);
      assert.deepEqual(r.json.result, answers[drive.op], `${drive.op}: the act's answer unchanged`);
      assert.equal(aw.sent.length, 1, drive.op);
      assert.deepEqual([aw.sent[0].path, aw.sent[0].body], ["/signin", { member: who, step: "signout" }], drive.op);
    }
  }
  /* negative controls: a reactivation, a removal not carried, and a refused disconnect send nothing */
  const none = { subscriptiondisconnect: { ok: false, reason: "NOT_YOUR_ACCOUNT" }, memberset: { ok: true, memberId: "bea", status: "active" },
                 adminremove: { ok: false, reason: "VOTES_SHORT", memberId: "bea" } };
  const { w } = callers({ answer: (c) => (none[c.route] ? ok(none[c.route]) : null) });
  const aw = agentWorker();
  w.env.AGENT_WORKER = aw;
  await call(w.env, { op: "subscriptiondisconnect", token: w.S.ann, method: "POST", body: {} });
  await call(w.env, { op: "memberset", token: w.S.founder, method: "POST", body: { memberId: "bea", status: "active" } });
  await call(w.env, { op: "adminremove", token: w.S.founder, method: "POST", body: { memberId: "bea" } });
  assert.deepEqual(aw.sent, []);
});

/* ---------------------------------------------------------------- R57's third draft */

/* A world whose store answers `translationdraft` past every refusal with the words to draft (instance-setup R67), whose
   object's `draft` (plane's `draftOnObject`) records what it was asked, and whose `translationdraftrecord` answers the
   owner's record. */
function draftWorld({ drafted, status = 200, recordAnswer } = {}) {
  const WORDS = [{ key: "nav.home", en: "Home", note: null, means: null, protected: false },
                 { key: "nav.cases", en: "Cases", note: "the group's cases", means: "Cases the group has made", protected: true }];
  const asked = [];
  const c = callers({ answer: (q) => {
    if (q.route === "translationdraft")
      return ok({ ok: false, reason: "ASSISTANT_DRAFT_UNAVAILABLE", direction: "to_language", language: "es", words: WORDS });
    if (q.route === "translationdraftrecord") return ok(recordAnswer ?? { ok: true, drafted: ["nav.home"], not_drafted: ["nav.cases"], offered_official: [] });
    return null;
  } });
  const get = c.w.env.STORE.get.bind(c.w.env.STORE);
  c.w.env.STORE.get = (id) => ({ ...get(id), async draft(ask) {
    asked.push(ask);
    return new Response(JSON.stringify(drafted ?? { ok: true, task: { op: "translationdraft" }, draft: { words: [{ key: "nav.home", text: "Inicio" }] },
                                                     not_drafted: ["nav.cases"], label: { kind: "machine" }, usage: { input_tokens: 5 }, calls: 1, grant: null }),
                        { status });
  } });
  return { ...c, asked, WORDS };
}

test("R57 (T37; N669, K2201; instance-setup R67; agent-worker R68–R70): `translationdraft`, past the store's and the owner's refusals, asks the object's draft with the owner's `direction`, `language` and `words` and none of the caller's, no `told`, no grant and no `firsthand`; applies no `checkDraft`; counts `usage` and `calls` to the member's day as a draft; hands the answered draft to the store-internal `translationdraftrecord` with `by` and `viewer` stamped, and answers what that route answers", async () => {
  const { w, sessions, asked, WORDS } = draftWorld();
  for (const s of sessions) {
    w.env.calls.length = 0; asked.length = 0;
    const r = await call(w.env, { op: "translationdraft", token: s.token, method: "POST",
                                  params: { by: FORGED, viewer: FORGED },
                                  body: { language: "es", direction: "to_language", keys: ["nav.home", "nav.cases"],
                                          words: [{ key: "evil", en: "forged" }], told: "x", firsthand: true } });
    assert.equal(r.status, 200, `${s.name}: ${r.text.slice(0, 300)}`);
    assert.deepEqual(r.json.result, { ok: true, drafted: ["nav.home"], not_drafted: ["nav.cases"], offered_official: [] }, s.name);
    assert.equal(asked.length, 1);
    const a = asked[0];
    assert.deepEqual([a.op, a.direction, a.language, a.words], ["translationdraft", "to_language", "es", WORDS], s.name);
    for (const k of ["told", "act", "field", "firsthand", "grant"]) assert.equal(Object.hasOwn(a, k), false, `${s.name}: no ${k}`);
    const [first] = opCalls(w.env).filter((c) => c.route === "translationdraft");
    assert.deepEqual([first.params.by, first.params.viewer], [s.by, s.viewer], `${s.name}: the owner's stamps`);
    const usage = opCalls(w.env).filter((c) => c.route === "askusage");
    assert.equal(usage.length, 1);
    assert.deepEqual([usage[0].params.viewer, usage[0].body], [s.viewer, { mode: "draft", usage: { input_tokens: 5 }, calls: 1 }]);
    const rec = opCalls(w.env).filter((c) => c.route === "translationdraftrecord");
    assert.equal(rec.length, 1);
    assert.deepEqual([rec[0].params.by, rec[0].params.viewer], [s.by, s.viewer]);
    assert.deepEqual(rec[0].body.draft, { words: [{ key: "nav.home", text: "Inicio" }] });
    /* K2238 (3d): instance-setup's hand-back body, the caller's asked `keys` beside the owner's words and the draft */
    assert.deepEqual(rec[0].body, { direction: "to_language", language: "es", keys: ["nav.home", "nav.cases"], words: WORDS,
                                    draft: { words: [{ key: "nav.home", text: "Inicio" }] }, not_drafted: ["nav.cases"] });
  }
  /* the owner's answer is the op's, refusal included */
  const refused = draftWorld({ recordAnswer: { ok: false, reason: "TRANSLATION_TEXT_REFUSED", detail: "placeholders" } });
  const rr = await call(refused.w.env, { op: "translationdraft", token: refused.w.S.ann, method: "POST", body: { language: "es", direction: "to_language" } });
  assert.deepEqual([rr.json.result.ok, rr.json.result.reason], [false, "TRANSLATION_TEXT_REFUSED"]);
});

test("R57 (T37): a translation draft that ends without one (an ending agent-worker names, an unbound or silent member) is answered as given, its status kept, and nothing is recorded; the grant is never answered", async () => {
  for (const [drafted, status, reason] of [[{ ok: false, code: "stopped", detail: "the model stopped", grant: null }, 200, undefined],
                                           [{ ok: false, reason: "AGENT_WORKER_UNBOUND", detail: "none", grant: null }, 503, "AGENT_WORKER_UNBOUND"],
                                           [{ ok: false, reason: "AGENT_WORKER_SILENT", detail: "none", grant: "g-secret" }, 502, "AGENT_WORKER_SILENT"]]) {
    const { w } = draftWorld({ drafted, status });
    const r = await call(w.env, { op: "translationdraft", token: w.S.ann, method: "POST", body: { language: "es", direction: "to_language" } });
    assert.equal(r.status, status >= 400 ? status : 502, r.text);
    assert.equal(r.json.ok, false);
    if (reason) assert.equal(r.json.reason, reason);
    else assert.equal(r.json.code, "stopped");
    assert.equal("grant" in r.json, false);
    assert.equal(r.text.includes("g-secret"), false);
    assert.deepEqual(opCalls(w.env).filter((c) => c.route === "translationdraftrecord"), [], "nothing recorded");
  }
});
