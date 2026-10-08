/* control-plane R53 (T33-89; K1122, K1601, K1674): T33's ops routed through their owners' maps with the stamps
   op-declarations R17–R20 declare (`OP_STAMPS`, op → keys), each key set by the door from the credential and none taken
   from the caller (R29); an ask's grant admitted for its list and the ask's own four calls, its member the viewer; and
   every read served under a grant recorded in the grant's read log in the record store's door. Driven through
   `makeFetch(hooks)` for every kind of caller with every stamp forged, and through `dispatch`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, M, world, call, opCalls, aik, cred, hex64, refused, FORGED } from "./harness.mjs";
const D = await import("../../../src/store-door/dispatch.mjs");
const { record } = await import("./record.mjs");
const { AI_GRANT_OPS, ACCOUNT_CHECKS } = await import("../../../src/credentials/index.mjs");
const { ASK_PLANE_OPS } = await import("../../../../agent-worker/src/ops.mjs");

const { OPS } = O;
const OP_STAMPS = O.OP_STAMPS || {};
/* T35 (op-declarations R30; OP-DECLARATIONS #12 J2): `principal`, `owner`, and the public ops' `source` and `country` */
const KEYS = ["viewer", "by", "bodyBy", "author", "proposer", "member", "session", "principal", "owner", "source", "country"];
/* who is calling, as the door knows them on a public op (admission R21): the window's fingerprint, no country unstated */
const DOOR = { source: "src-test", country: null };
const MEMBER_ID_BY = ["invitewithdraw", "websitekeycreate", "websitekeyset", "websitekeyrevoke", "joinlinkenable", "joinlinkset",
                      "joinlinkreplace", "joinlinkoff", "courtnoticeset", "groupdescriptionset"];
const URL0 = new URL("http://do/");

/* The maps R53 names, and the T33 arms of the existing modules the findings route (K1544, K1550, K1570, K1601, K1604,
   K1612, K1640, K1657, K1658): every op each serves. */
const MAPS = {
  events: ["events/index.mjs", "eventsOps"], lines: ["lines/index.mjs", "linesOps"], money: ["money/index.mjs", "moneyOps"],
  "money-checks": ["money-checks/index.mjs", "moneyChecksOps"], duties: ["duties/index.mjs", "dutiesOps"],
  people: ["people/index.mjs", "peopleOps"], explore: ["explore/ops.mjs", "exploreOps"],
  hypotheses: ["hypotheses/index.mjs", "hypothesesOps"], calculations: ["calculations/index.mjs", "calculationsOps"],
  workbooks: ["workbooks/ops.mjs", "workbooksOps"], answers: ["answers/ops.mjs", "answersOps"],
  following: ["following/index.mjs", "followingOps"],
};
const ARMS = ["accountreferenceset", "accountreferenceremove", "accountreference", "accountswitchset", "aigrantmint",
              "keyedserviceset", "keyedserviceswitch", "keyedservices", "sourcekeyed", "aiusage", "aiceilingset",
              "aicopyceilingset", "airunverify", "waitlook", "exportpage", "exportrender", "addresseesuggest", "clockadopt",
              "clocksics", "clocklateness", "clockpropose"];
async function t33Ops() {
  const out = new Set(ARMS);
  for (const [file, fn] of Object.values(MAPS))
    for (const op of Object.keys((await import(`../../../src/${file}`))[fn](null, URL0, null, {}))) out.add(op);
  return [...out].sort();
}

/* What each key reads for each kind of caller (null: the door sets none). */
function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  const bind = (c, token, params = {}) => ({ name: c, token, params, session: false,
    want: { viewer: `class:${c}`, by: `class:${c}`, bodyBy: `class:${c}`, author: `class:${c}`, proposer: `class:${c}`, member: null, session: null,
            principal: `class:${c}`, owner: `class:${c}`, ...DOOR } });
  return { w, list: [
    /* admission R5 (K2166): the shared member binding is retired, so it is no caller here */
    bind("admin", w.env.ADMIN_TOKEN), bind("probe", w.env.PROBE_TOKEN, { store: "scratch" }),
    { name: "founder", token: w.S.founder, params: {}, session: true,
      want: { viewer: "admin", by: "admin", bodyBy: "admin", author: "member:admin", proposer: "admin", member: "admin", session: w.S.founder,
              principal: "member:admin", owner: "member:admin", ...DOOR } },
    { name: "ann", token: w.S.ann, params: {}, session: true,
      want: { viewer: "member:ann", by: "member:ann", bodyBy: "member:ann", author: "member:ann", proposer: "ann", member: "member:ann", session: w.S.ann,
              principal: "member:ann", owner: "member:ann", ...DOOR } },
    { name: "agent", token: agent, params: {}, session: false,
      want: { viewer: "member:ann", by: "class:ai/agent-ann", bodyBy: "class:ai/agent-ann", author: "class:ai/agent-ann",
              proposer: "class:ai/agent-ann", member: null, session: null, principal: "member:ann/agent-ann", owner: "class:ai", ...DOOR } },
  ] };
}

test("R53 (K1122, K1674; op-declarations R17–R20): every op T33's owners' maps serve, and every T33 arm the findings route, has a spec and an `OP_STAMPS` entry, each naming only keys from the closed set (negative control: a map's op with no entry is seen)", async () => {
  const ops = await t33Ops();
  assert.ok(ops.length > 150, String(ops.length));
  const missing = ops.filter((op) => !Object.hasOwn(OPS, op) || !Object.hasOwn(OP_STAMPS, op));
  assert.deepEqual(missing, []);
  for (const [op, keys] of Object.entries(OP_STAMPS)) {
    assert.ok(Array.isArray(keys) && keys.every((k) => KEYS.includes(k)), `${op}: ${JSON.stringify(keys)}`);
    assert.ok(Object.isFrozen(OP_STAMPS[op]), op);
  }
  assert.ok(Object.isFrozen(OP_STAMPS));
  /* R53: no route carries a group-level or project-level Claude credential; `member` and `session` only a session's own */
  for (const [op, keys] of Object.entries(OP_STAMPS))
    if (keys.includes("member") || keys.includes("session")) assert.equal(OPS[op].classes?.includes("member") && Array.isArray(OPS[op].machineClasses) && OPS[op].machineClasses.length === 0, true, op);
  /* negative control */
  assert.ok(["eventcreate", "explore", "standingset"].every((op) => ops.includes(op)));
});

test("R53, R17, R29: for every op `OP_STAMPS` declares and every kind of caller its spec admits, each declared key reaches the owner's route as the server's value — in the query, in the body for `bodyBy`, in the `x-bio-session` header for `session` (R59) — whatever the caller forged; `member` and `session` are a session's own and absent for every other caller; a key the op does not declare is not set by the door", async () => {
  const { w, list } = callers();
  const forgedQ = Object.fromEntries([...KEYS, "grant"].map((k) => [k, FORGED]));
  let checked = 0, reached = 0;
  for (const [op, keys] of Object.entries(OP_STAMPS)) for (const c of list) {
    /* R41 (T35): `agentpack` is answered from the untargeted affordances handler (a hook), which stamps its own reads */
    if (op === "agentpack") continue;
    /* R65 (T37): `subscriptionsignin` reaches the member's runner, not a store route; its `by` (sent as `member`) is
       driven in `t37-door.test.mjs` */
    if (op === "subscriptionsignin") continue;
    for (const [params, body] of [[c.params, {}], [{ ...c.params, ...forgedQ }, { by: FORGED, note: "kept" }]]) {
      w.env.calls.length = 0;
      const r = await call(w.env, { op, token: c.token, params, method: OPS[op]?.mutating ? "POST" : "GET",
                                    body: OPS[op]?.mutating ? body : undefined });
      /* a public op answers from `bio` alone, so a probe's `store=scratch` is admission's pin (R3) */
      if (r.status !== 200) { assert.ok([401, 403].includes(r.status) || (OPS[op].classes === null && r.json?.reason === "NAMESPACE_PINNED"), `${op}/${c.name}: ${r.text.slice(0, 200)}`); continue; }
      const [inner] = opCalls(w.env);
      if (!inner) continue;   /* answered by a hook (affordances) */
      reached++;
      const where = `${op} for ${c.name}${params === c.params ? "" : " (forged)"}`;
      assert.equal(inner.params.grant, undefined, `${where}: ?grant`);
      for (const k of keys) {
        /* R59, store-door R9 (K2038 (1)): a stamped session travels in the `x-bio-session` header, never the address */
        const got = k === "bodyBy" ? (inner.body?.by ?? null) : k === "session" ? (inner.headers["x-bio-session"] ?? null)
          : (inner.params[k] ?? null);
        if (k === "session") assert.equal(inner.params.session, undefined, `${where}: ?session`);
        /* R54 (K1863 (7)): membership's administrator acts take `by` as a member id, the custodial acts' expression */
        const want = k === "by" && MEMBER_ID_BY.includes(op)
          ? (c.session ? c.want.proposer : `class:${c.name === "agent" ? "ai" : c.name}`)
          /* R68 (T37; admission R21): an admitted op's `source` is admission's `sourceOf` over the request, which states
             no connecting address here; a public op's is the window's fingerprint (`DOOR`) */
          : k === "source" && OPS[op].classes !== null ? "unstated" : c.want[k];
        assert.equal(got, want, `${where}: ${k}`);
        checked++;
      }
      if (params !== c.params) {
        for (const k of KEYS) if (k !== "bodyBy" && keys.includes(k)) assert.notEqual(inner.params[k], FORGED, `${where}: ?${k}`);
        if (keys.includes("bodyBy")) assert.equal(inner.body.note, "kept", `${where}: the body's own fields reach the route`);
      }
    }
  }
  assert.ok(reached > 300 && checked > 600, `${reached} ${checked}`);
});

/* ---- the ask's grant (K1601, K1674) ---- */

/* A world whose bio store answers `aigrantadmit` as credentials does: GRANT holds and admits its list as reads. */
function grantWorld(extra = {}) {
  const GRANT = hex64();
  const v = world({ ...extra, answer: (c) => {
    if (c.route !== "aigrantadmit") return null;
    const { token, op, write } = c.body || {};
    const row = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check, translation: ACCOUNT_CHECKS[code].translation });
    if (token !== GRANT) return new Response(JSON.stringify({ ok: true, result: row("GRANT_NOT_HELD") }));
    if (write !== false || !AI_GRANT_OPS.includes(op)) return new Response(JSON.stringify({ ok: true, result: { ...row("GRANT_OP_REFUSED"), op } }));
    return new Response(JSON.stringify({ ok: true, result: { ok: true, member: "ann", viewer: "member:ann", expires: 1 } }));
  } });
  return { ...v, GRANT };
}

test("R53 (K1601, K1674; credentials R28): a token no session or credential holds is asked of credentials as an ask's grant, in `bio`, only for an op on the grant's list; admitted, the read reaches its route with the grant's member as viewer and the grant in the `x-bio-grant` header (R59), never the address, whatever the caller forged; a held grant asking an op it does not admit is refused GRANT_OP_REFUSED; an unknown token, an op off every list and `affordances` (no longer an ask's own call since T36, R41, K2135) keep admission's NOT_AUTHENTICATED, in the same bytes; a silence is a silence", async () => {
  const { env, GRANT, S } = grantWorld();
  const listed = AI_GRANT_OPS.filter((op) => Object.hasOwn(OPS, op) && !OPS[op].mutating);
  assert.ok(listed.includes("search") && listed.length >= 5, listed.join(","));
  for (const op of listed) {
    env.calls.length = 0;
    const r = await call(env, { op, token: GRANT, params: { viewer: FORGED, grant: FORGED, by: FORGED, q: "x" } });
    assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 200)}`);
    const asked = env.calls.filter((c) => c.route === "aigrantadmit");
    assert.deepEqual(asked.map((c) => [c.ns, c.body]), [["bio", { token: GRANT, op, write: false }]], op);
    const [inner] = opCalls(env).filter((c) => c.route !== "aigrantadmit");
    if (!inner) continue;
    /* R59, store-door R9 (K2037 (b)): the grant travels in the internal header, never the address */
    assert.deepEqual([inner.ns, inner.headers["x-bio-grant"], inner.params.grant, inner.params.q], ["bio", GRANT, undefined, "x"], op);
    if (inner.params.viewer !== undefined) assert.equal(inner.params.viewer, "member:ann", op);
    assert.notEqual(inner.params.by, FORGED, op);
    assert.equal(r.json.tokenClass, "ai");
  }
  /* `agentpack` reaches the untargeted affordances handler as the grant's agent (R41, K2135); `affordances` itself is not a
     grant's call */
  const log = [];
  const hooks = { publicOp: async () => M.json({ ok: true }), publicInstanceGroup: async () => ({ answered: true, result: {} }),
                  gatedOp: async (ctx) => { log.push(ctx); return M.json({ ok: true, result: { catalog: [] } }); } };
  assert.equal((await call(env, { op: "agentpack", token: GRANT, hooks })).status, 200);
  assert.deepEqual([log[0].cls, log[0].viaSession, log[0].aiCred.principal, log[0].aiCred.grant, log[0].grantMember],
                   ["ai", false, "member:ann", GRANT, "member:ann"]);
  /* K1684: grantMember is a grant's alone (negative control: a session's hook context carries none) */
  await call(env, { op: "agentpack", token: S.ann, hooks });
  assert.equal(log.at(-1).grantMember, undefined);
  const notAuth = await call(env, { op: "search", token: hex64() });
  refused(notAuth, 401, "NOT_AUTHENTICATED", notAuth.json.check);
  for (const [op, params] of [["affordances", {}], ["affordances", { target: "INQ-1" }], ["cite", {}], ["whoami", {}]]) {
    env.calls.length = 0;
    const r = await call(env, { op, token: GRANT, params, hooks });
    assert.deepEqual([r.status, r.json.reason], [401, "NOT_AUTHENTICATED"], op);
    assert.equal(env.calls.some((c) => c.route === "aigrantadmit"), false, `${op}: no grant is asked off the lists`);
  }
  /* an unknown token, asked: the same bytes as a token never asked */
  env.calls.length = 0;
  const unknown = await call(env, { op: "search", token: hex64() });
  assert.ok(env.calls.some((c) => c.route === "aigrantadmit"));
  assert.deepEqual([unknown.status, unknown.json], [notAuth.status, notAuth.json]);
  /* a held grant refused the op by credentials: its refusal relayed with its row, nothing forwarded */
  const v = world({ answer: (c) => (c.route === "aigrantadmit"
    ? new Response(JSON.stringify({ ok: true, result: { ok: false, reason: "GRANT_OP_REFUSED", code: "GRANT_OP_REFUSED", op: c.body.op } })) : null) });
  refused(await call(v.env, { op: "search", token: hex64() }), 403, "GRANT_OP_REFUSED", ACCOUNT_CHECKS.GRANT_OP_REFUSED.check);
  assert.equal(opCalls(v.env).filter((c) => c.route !== "aigrantadmit").length, 0);
  /* a silence */
  const silent = world({ answer: (c) => (c.route === "aigrantadmit" ? new Response("boom", { status: 500 }) : null) });
  refused(await call(silent.env, { op: "search", token: hex64() }), 502, "STORE_DID_NOT_ANSWER", "C-69.2");
  /* negative controls: a session is a session (no grant asked), and a session's own `grant` never reaches an ask op */
  env.calls.length = 0;
  const s = await call(env, { op: "search", token: S.ann, params: { grant: GRANT } });
  assert.equal(s.status, 200);
  assert.equal(env.calls.some((c) => c.route === "aigrantadmit"), false);
  assert.equal(opCalls(env)[0].params.grant, undefined);
  assert.equal(opCalls(env)[0].headers["x-bio-grant"], undefined);
});

test("R53 (K1601, K1674; agent-worker R54; R41, K2135): the ask's own four calls (askceiling, askcheck, askusage, agentpack) are admitted under a held grant beside its list, asked of credentials by the list's first read, and are agent-worker's `ASK_PLANE_OPS` exactly", async () => {
  assert.deepEqual(Object.keys(ASK_PLANE_OPS).sort(), ["agentpack", "askceiling", "askcheck", "askusage"]);
  const { env, GRANT } = grantWorld();
  /* `agentpack` is answered from the affordances hook, driven in the test above */
  for (const op of Object.keys(ASK_PLANE_OPS).filter((o) => o !== "agentpack")) {
    assert.ok(Object.hasOwn(OPS, op), `${op} has a spec (op-declarations, K1601)`);
    env.calls.length = 0;
    const r = await call(env, { op, token: GRANT, method: OPS[op].mutating ? "POST" : "GET", body: OPS[op].mutating ? { usage: {} } : undefined });
    assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 200)}`);
    assert.deepEqual(env.calls.filter((c) => c.route === "aigrantadmit").map((c) => c.body), [{ token: GRANT, op: AI_GRANT_OPS[0], write: false }]);
    const inner = opCalls(env).filter((c) => c.route !== "aigrantadmit")[0];
    assert.deepEqual([inner.headers["x-bio-grant"], inner.params.grant], [GRANT, undefined], op);
  }
});

/* ---- the read log and the ask's own routes are the store's door's (store-door R11, its own tests) ---- */

test("R53 (K1674; credentials R28): the record store's door routes `aigrantadmit` to credentials' `aiGrantAdmit` (store-internal: no spec, so no caller reaches it through the Worker), answering credentials' own words (negative control: a name no module serves is R26's refusal)", async () => {
  const r = await record();
  const a = await r.go("aigrantadmit", "POST", { token: hex64(), op: "search", write: false });
  assert.deepEqual([a.status, a.json.ok, a.json.result.ok, a.json.result.reason], [200, true, false, "GRANT_NOT_HELD"]);
  assert.equal(Object.hasOwn(OPS, "aigrantadmit"), false);
  const { env } = world();
  refused(await call(env, { op: "aigrantadmit", token: env.ADMIN_TOKEN, method: "POST", body: {} }), 400, "UNKNOWN_OP", "C-69.1");
  const u = await r.go("aigrantnothing", "POST", {});
  assert.deepEqual([u.status, u.json.error], [400, "unknown op: aigrantnothing"]);
});

test("R53, R29 (K1687): standards' five T33 acts read their author from the body, so the door sets it there — `author`, or `proposer` on `lawpropose` — as the positional identity for a session and the machine's own name otherwise, whatever the caller put in the body (negative control: a caller's body field of its own reaches the route)", async () => {
  const { w, list } = callers();
  const who = { admin: "class:admin", probe: "class:probe", founder: "member:admin", ann: "member:ann", agent: "class:ai/agent-ann" };
  let checked = 0;
  for (const op of ["lawrelate", "lawwithdraw", "lawpropose", "courtlink", "courttreat"]) for (const c of list) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token: c.token, params: c.params, method: "POST", body: { author: FORGED, proposer: FORGED, note: "kept" } });
    if (r.status !== 200) continue;
    const [inner] = opCalls(w.env);
    const key = op === "lawpropose" ? "proposer" : "author";
    assert.equal(inner.body[key], who[c.name], `${op}/${c.name}`);
    assert.equal(Object.hasOwn(inner.body, key === "author" ? "proposer" : "author"), false, `${op}/${c.name}: the other key is gone`);
    assert.equal(inner.body.note, "kept");
    checked++;
  }
  assert.ok(checked >= 12, String(checked));
});
