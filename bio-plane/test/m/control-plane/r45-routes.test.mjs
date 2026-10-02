/* control-plane R45: the ops T23 adds (N485: K1025, K1051; K1094; DEC-111, K1100; op-declarations R10) — escalation's
   `escalationreasondraft`, case-authoring's `whatchangedpropose` and `whatchangeddrafts`, monitoring's `sweeps`,
   network-notices' `noticeprepare`, `noticepost`, `notices` and `directorysubmission` — each routed through the door's general path to its
   owner's store route of the same name (R26), with the stamps its owner reads set by the server and none taken from the
   caller (R29), by op-declarations' lists (K1168); the notice ops a member's session's alone; and network-notices'
   public reads, registered through public-read R18, reached with no credential on the public path as
   `op=publicread&name=<name>` (K1166 (2)). Driven through `makeFetch(hooks)`, T22's form (`new-ops.test.mjs`,
   `doorbell.test.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, aik, cred, hex64, member, refused, FORGED, QUERY_STAMPS, BODY_STAMPS } from "./harness.mjs";
const { escalationOps } = await import("../../../src/escalation/ops.mjs");
const { caseAuthoringOps } = await import("../../../src/case-authoring/index.mjs");
const { monitoringOps } = await import("../../../src/monitoring/index.mjs");
const { networkNoticesOps, networkNoticesPublicReads } = await import("../../../src/network-notices/index.mjs");
const { publicReadDoorOp } = await import("../../../src/public-read/door.mjs");

const { OPS } = O;
const U = new URL("http://do/");

/* The owners' own maps (R26): each op is a route of its owner's map, which the plane spreads into the store's. */
const OWNER = {
  escalationreasondraft: Object.keys(escalationOps(null, U, null)),
  whatchangedpropose: Object.keys(caseAuthoringOps(null, U, null)),
  whatchangeddrafts: Object.keys(caseAuthoringOps(null, U, null)),
  sweeps: Object.keys(monitoringOps(null, U, null)),
  noticeprepare: Object.keys(networkNoticesOps(null, U, null)),
  noticepost: Object.keys(networkNoticesOps(null, U, null)),
  notices: Object.keys(networkNoticesOps(null, U, null)),
  directorysubmission: Object.keys(networkNoticesOps(null, U, null)),
};
const PUBLIC_READS = Object.keys(networkNoticesPublicReads(null));

/* Every kind of caller, and what each stamp reads for it. */
function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  const bind = (c, token, params = {}) => ({ name: c, token, params, ns: params.store ?? "bio", session: false,
    viewer: `class:${c}`, identity: `class:${c}`, proposer: `class:${c}` });
  return { w, list: [
    bind("admin", w.env.ADMIN_TOKEN), bind("member", w.env.MEMBER_TOKEN), bind("probe", w.env.PROBE_TOKEN, { store: "scratch" }),
    bind("daemon", w.env.DAEMON_TOKEN),
    { name: "founder", token: w.S.founder, params: {}, ns: "bio", session: true, viewer: "admin", identity: "member:admin", proposer: "admin" },
    { name: "ann", token: w.S.ann, params: {}, ns: "bio", session: true, viewer: "member:ann", identity: "member:ann", proposer: "ann" },
    { name: "agent", token: agent, params: {}, ns: "bio", session: false, viewer: "member:ann", identity: "member:ann",
      proposer: "class:ai/agent-ann" },
  ] };
}

/* Each op: the stamps its owner reads, from the caller (op-declarations R10). */
const viewer = (c) => ({ viewer: c.viewer });
const R45 = {
  escalationreasondraft: viewer,                                                     /* escalation R29 */
  whatchangedpropose:    (c) => ({ viewer: c.viewer, proposedBy: c.proposer, author: c.proposer }),   /* case-authoring R39 */
  whatchangeddrafts:     viewer,                                                     /* case-authoring R39 */
  sweeps:                viewer,                                                     /* monitoring R61 */
  noticeprepare:         (c) => ({ by: c.identity, viewer: c.viewer }),              /* network-notices R1, R2 */
  noticepost:            (c) => ({ by: c.identity, viewer: c.viewer }),              /* network-notices R4, R5 */
  notices:               viewer,                                                     /* network-notices R22 */
  directorysubmission:   viewer,                                                     /* network-notices R23 */
};
const NOTICE = ["noticeprepare", "noticepost", "notices", "directorysubmission"];
const admits = (spec, c) => (c.session ? true
  : c.name === "agent" ? !Array.isArray(spec.machineClasses)
  : (Array.isArray(spec.machineClasses) ? spec.machineClasses : spec.classes).includes(c.name));
const STAMP_NAMES = [...new Set([...QUERY_STAMPS, "proposedBy", "proposer", "principal", "owner", "member", "mintedBy"])];

test("R45, R2, R26: each of T23's ops is declared, a route of its owner's own map, and routed through the door's general path to that route, in the caller's namespace, with the caller's own parameters and body, for every caller its row admits; a notice op is a member's session's alone (negative control: a name no owner serves is `unknown op`, nothing forwarded)", async () => {
  for (const [op, routes] of Object.entries(OWNER)) {
    assert.ok(Object.hasOwn(OPS, op), `${op} is declared`);
    assert.ok(routes.includes(op), `${op} is a route of its owner's map`);
  }
  for (const op of NOTICE) assert.deepEqual([OPS[op].classes, OPS[op].machineClasses], [["admin", "member"], []], op);
  const { w, list } = callers();
  let reached = 0;
  for (const c of list) for (const op of Object.keys(R45)) {
    const spec = OPS[op];
    if (!admits(spec, c)) continue;
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token: c.token, params: { ...c.params, project: "PROJ-1" }, method: spec.mutating ? "POST" : "GET",
                                  body: spec.mutating ? { note: "kept" } : undefined });
    assert.equal(r.status, 200, `${op}/${c.name}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(w.env);
    assert.deepEqual(inner.map((x) => [x.route, x.ns]), [[op, c.ns]], `${op}/${c.name}`);
    assert.equal(inner[0].params.project, "PROJ-1", `${op}: the caller's own parameters reach the route`);
    if (spec.mutating) assert.equal(inner[0].body.note, "kept", `${op}: the caller's own body reaches the route`);
    assert.equal(r.json.store, c.ns);
    reached++;
  }
  assert.ok(reached >= 30, String(reached));
  /* negative control: an op no owner serves */
  for (const op of ["noticewithdraw", "sweepsall", "whatchanged"]) {
    assert.equal(Object.hasOwn(OPS, op), false, op);
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token: w.S.ann, method: "POST", body: {} });
    refused(r, 400, "UNKNOWN_OP", "C-69.1");
    assert.deepEqual([r.json.error, r.json.op], ["unknown op", op]);
    assert.equal(w.env.calls.length, 0, `${op}: nothing read`);
  }
});

test("R45, R17, R29: each op's stamps are the server's value from the credential, for every caller its row admits, whatever the caller sent in the query or the body; the caller's copies are deleted; a stamp the op does not take is not set", async () => {
  const { w, list } = callers();
  const forgedQ = Object.fromEntries(STAMP_NAMES.map((k) => [k, FORGED]));
  const forgedB = Object.fromEntries([...STAMP_NAMES, ...BODY_STAMPS].map((k) => [k, FORGED]));
  let checked = 0;
  for (const c of list) for (const [op, stamps] of Object.entries(R45)) {
    const spec = OPS[op];
    if (!admits(spec, c)) continue;
    const want = stamps(c);
    for (const [params, body] of [[c.params, { note: "kept" }], [{ ...c.params, ...forgedQ }, { note: "kept", ...forgedB }]]) {
      w.env.calls.length = 0;
      await call(w.env, { op, token: c.token, params, method: "POST", body });
      const [inner] = opCalls(w.env);
      const where = `${op} for ${c.name}${params === c.params ? "" : " (forged)"}`;
      assert.ok(inner, `${where}: forwarded`);
      for (const k of STAMP_NAMES) {
        const got = inner.params[k] ?? null;
        if (Object.hasOwn(want, k)) { assert.equal(got, want[k], `${where}: ?${k}`); checked++; }
        else if (QUERY_STAMPS.includes(k)) assert.notEqual(got, FORGED, `${where}: ?${k} carries the caller's value`);
        if (!Object.hasOwn(want, k) && params === c.params) assert.equal(got, null, `${where}: ?${k} is not this op's stamp`);
      }
      for (const k of BODY_STAMPS) assert.notEqual(inner.body?.[k], FORGED, `${where}: #${k}`);
      assert.equal(inner.body?.note, "kept", `${where}: the body reaches the route`);
    }
  }
  assert.ok(checked >= 70, String(checked));
});

test("R45, R28 (network-notices R1, R24; admission R8–R10): each notice op is refused to every caller not arriving by a member's session — the operator's token and every bearer class CLASS_FORBIDDEN, an AI credential declaring every write AI_BEYOND_TASK_SCOPE — and nothing is read or written; negative control: a member's session and the founder's reach each", async () => {
  const wide = aik();
  const { env, S } = world({ creds: { [wide]: cred({ tokenId: "agent-wide", writes: Object.keys(OPS) }) } });
  for (const op of NOTICE) {
    const method = OPS[op].mutating ? "POST" : "GET";
    const body = method === "POST" ? { project: "PROJ-1", digest: "d", signature: "s" } : undefined;
    for (const [token, params] of [[env.ADMIN_TOKEN, {}], [env.MEMBER_TOKEN, {}], [env.PROBE_TOKEN, { store: "scratch" }], [env.DAEMON_TOKEN, {}]]) {
      env.calls.length = 0;
      refused(await call(env, { op, token, params: { ...params, project: "PROJ-1" }, method, body }), 403, "CLASS_FORBIDDEN", "C-38.2");
      assert.equal(opCalls(env).length, 0, `${op}: forwarded for a binding class`);
    }
    env.calls.length = 0;
    refused(await call(env, { op, token: wide, params: { project: "PROJ-1" }, method, body }), 403, "AI_BEYOND_TASK_SCOPE", "C-29.6");
    assert.equal(opCalls(env).length, 0, `${op}: forwarded for an agent`);
    for (const token of [S.ann, S.founder]) {
      env.calls.length = 0;
      assert.equal((await call(env, { op, token, params: { project: "PROJ-1" }, method, body })).status, 200, op);
      assert.deepEqual(opCalls(env).map((x) => x.route), [op]);
    }
  }
});

test("R45, R28 (case-authoring R39): `whatchangedpropose` is open to any credential an `ai` scope admits, and a member's session needs `contribute` — a session without it NOT_CAPABLE, an agent not declaring the write AI_BEYOND_TASK_SCOPE, nothing forwarded; negative control: the agent declaring it and a session holding it reach the route", async () => {
  const bare = hex64(), narrow = aik(), wide = aik();
  const { env, S } = world({ sessions: { [bare]: member("bea", []) },
                             creds: { [narrow]: cred({ tokenId: "agent-narrow", writes: ["cite"] }),
                                      [wide]: cred({ tokenId: "agent-wide", writes: ["whatchangedpropose"] }) } });
  env.calls.length = 0;
  refused(await call(env, { op: "whatchangedpropose", token: bare, method: "POST", body: { text: "t" } }), 403, "NOT_CAPABLE", "C-38.5");
  refused(await call(env, { op: "whatchangedpropose", token: narrow, method: "POST", body: { text: "t" } }), 403, "AI_BEYOND_TASK_SCOPE", "C-29.6");
  assert.equal(opCalls(env).length, 0);
  for (const token of [wide, S.ann]) {
    env.calls.length = 0;
    assert.equal((await call(env, { op: "whatchangedpropose", token, method: "POST", body: { text: "t" } })).status, 200);
    assert.deepEqual(opCalls(env).map((x) => x.route), ["whatchangedpropose"]);
  }
});

test("R45 (DEC-111, K1166 (2); public-read R18, R10): network-notices' public reads are reached credential-free on the public path as `op=publicread&name=<name>` — the door hands it to the public hook, and public-read's door asks the store's `publicread` with the name and the read's parameters, never a credential or a stamp; `store=scratch` is refused with nothing read (negative controls: each read's own name is declared public and goes to the public hook, not to a store route; a name the module does not register is `unknown op`)", async () => {
  assert.deepEqual([...PUBLIC_READS].sort(), ["activitymethod", "groupkeyspublic", "noticespublic"]);
  assert.deepEqual(OPS.publicread, { classes: null, mutating: false });
  const answered = [], handed = [];
  /* the public hook as plane composes it: public-read's door over the door's own helpers */
  const { M } = await import("./harness.mjs");
  const hooks = { async publicOp({ op, url, env, stub, ...rest }) {
    handed.push({ op, keys: Object.keys(rest).sort() });
    return (await publicReadDoorOp(op, url, env, stub, { json: M.json, requiredArgument: M.requiredArgument, storeSilent: M.storeSilent,
                                                  storeRefusal: M.storeRefusal, doAnswer: M.doAnswer }))
      ?? M.json({ ok: true, publicOp: op });
  } };
  const { env, S } = world({ answer: (c) => {
    if (c.route !== "publicread") return null;
    answered.push(c);
    return new Response(JSON.stringify({ ok: true, result: { ok: true, read: c.params.name, module: "network-notices", result: { n: 1 } } }));
  } });
  for (const name of PUBLIC_READS) {
    assert.deepEqual(OPS[name], { classes: null, mutating: false }, name);
    for (const token of [undefined, S.ann, env.ADMIN_TOKEN, "junk"]) {
      env.calls.length = 0; answered.length = 0;
      const params = { name, after: "2026-01-01", limit: "5", viewer: FORGED, by: FORGED, author: FORGED, secret: "s" };
      const r = await call(env, { op: "publicread", token, params, hooks });
      assert.equal(r.status, 200, `${name}: ${r.text.slice(0, 200)}`);
      assert.deepEqual([r.json.ok, r.json.read, r.json.module, r.json.result], [true, name, "network-notices", { n: 1 }]);
      assert.deepEqual(env.calls.map((c) => [c.route, c.ns]), [["publicread", "bio"]], `${name}: one read of bio's store, no credential looked up`);
      const q = answered[0].params;
      assert.deepEqual([q.name, q.after, q.limit], [name, "2026-01-01", "5"]);
      for (const k of ["token", "viewer", "by", "author", "secret", "op", "store"]) assert.equal(Object.hasOwn(q, k), false, `${name}: ?${k} reached the store`);
    }
    env.calls.length = 0;
    refused(await call(env, { op: "publicread", params: { name, store: "scratch" }, hooks }), 400, "NAMESPACE_PINNED", "C-78.2");
    assert.equal(env.calls.length, 0);
    /* its own name is a public op the door hands the public hook, never a store route of its own */
    env.calls.length = 0; handed.length = 0;
    await call(env, { op: name, hooks });
    assert.deepEqual(handed.map((h) => h.op), [name]);
    assert.equal(env.calls.some((c) => c.route === name), false, `${name}: forwarded as a store route`);
  }
  /* the store's not-registered answer is relayed at 404, and a silence is a silence */
  const nr = world({ answer: (c) => (c.route === "publicread"
    ? new Response(JSON.stringify({ ok: true, result: { ok: false, reason: "PUBLIC_READ_NOT_REGISTERED", read: c.params.name } })) : null) });
  assert.equal((await call(nr.env, { op: "publicread", params: { name: PUBLIC_READS[0] }, hooks })).status, 404);
  const silent = world({ answer: (c) => (c.route === "publicread" ? new Response("not json", { status: 200 }) : null) });
  refused(await call(silent.env, { op: "publicread", params: { name: PUBLIC_READS[0] }, hooks }), 502, "STORE_DID_NOT_ANSWER", "C-69.2");
  /* negative control: a public-looking name the module does not register is no op */
  env.calls.length = 0;
  refused(await call(env, { op: "noticesprivate", hooks }), 400, "UNKNOWN_OP", "C-69.1");
  assert.equal(env.calls.length, 0);
});

test("R27, R45: T23's id-carrying reads are classified — `notices` names the project by its own id (the door answers existence first), `whatchangeddrafts` and `directorysubmission` name a case, with the reason (negative control: a project not shown at existence falls through to the route)", async () => {
  const D = await import("../../../src/control-plane/dispatch.mjs");
  assert.deepEqual(D.PROJECT_NAMING_READS.notices, ["project"]);
  for (const op of ["whatchangeddrafts", "directorysubmission"]) {
    assert.equal(typeof D.PROJECT_NAMING_READS_NOT[op], "string", op);
    assert.equal(Object.hasOwn(D.PROJECT_NAMING_READS, op), false, op);
  }
  const P = "PROJ-seen";
  const ran = [];
  const store = { routes: () => ({ notices: () => { ran.push(1); return { answered: true }; } }),
                  membership: () => ({ visibilityOf: (id) => (id === P ? "discoverable" : "hidden"),
                                       existenceAct: (id) => (id === P ? { ok: false, reason: "PROJECT_SEEN_NOT_A_PARTICIPANT", project: id } : null) }) };
  const r = await (await D.dispatch(new Request(`http://do/notices?viewer=member:ann&project=${P}`), store)).json();
  assert.deepEqual([r.result.reason, ran], ["PROJECT_SEEN_NOT_A_PARTICIPANT", []]);
  const r2 = await (await D.dispatch(new Request("http://do/notices?viewer=member:ann&project=PROJ-other"), store)).json();
  assert.deepEqual([r2.result, ran], [{ answered: true }, [1]]);
});
