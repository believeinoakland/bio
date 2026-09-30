/* control-plane: N345's routes (T15, layer 11) — contradiction's twelve ops, entities' `resolutiondefect` and the viewer on
   `entity` and `entitybyalias`, case-authoring's `publishtensions` and conformance's `comparisonfacts`. Each op is driven
   through `makeFetch(hooks)` for every kind of caller, with every stamp forged in the query and the body: it reaches the
   store's route of its name (R2), its declared stamps are the server's value from the credential (R17, R29), and each has
   a negative control. R27's two tables classify the reads that carry an id. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, hex64, aik, cred, member, refused, FORGED, QUERY_STAMPS, BODY_STAMPS } from "./harness.mjs";
const D = await import("../../../src/control-plane/dispatch.mjs");

const { OPS, SESSION_OPS, NEEDS } = O;

/* The callers, and what each stamp reads for each of them. */
function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  const bind = (c, token, params = {}) => ({ name: c, token, params, ns: params.store ?? "bio",
    viewer: `class:${c}`, identity: `class:${c}`, member: `class:${c}`, author: `token:${c}`, machine: `class:${c}`, principal: `class:${c}` });
  return { w, agent, list: [
    bind("admin", w.env.ADMIN_TOKEN), bind("member", w.env.MEMBER_TOKEN), bind("probe", w.env.PROBE_TOKEN, { store: "scratch" }),
    { name: "founder", token: w.S.founder, params: {}, ns: "bio", viewer: "admin", identity: "member:admin", member: "admin",
      author: "admin", machine: "admin", principal: "member:admin" },
    { name: "ann", token: w.S.ann, params: {}, ns: "bio", viewer: "member:ann", identity: "member:ann", member: "ann",
      author: "ann", machine: "ann", principal: "member:ann" },
    { name: "agent", token: agent, params: {}, ns: "bio", viewer: "member:ann", identity: "class:ai/agent-ann", member: "class:ai",
      author: "token:ai", machine: "class:ai/agent-ann", principal: "member:ann/agent-ann" },
  ] };
}

/* Each op: its spec, and its stamps as a function of the caller — `q` in the inner query, `b` in the inner body. */
const READ = { classes: ["admin", "member", "probe"], mutating: false };
const ACT = { classes: ["admin", "member", "probe"], mutating: true };
const viewerOnly = (c) => ({ q: { viewer: c.viewer } });
const ROUTES = {
  contradictioncandidates: [READ, viewerOnly], contradictiontensions: [READ, viewerOnly], contradictionfacts: [READ, viewerOnly],
  contradictionnotices: [READ, viewerOnly], contradictionresponses: [READ, viewerOnly],
  ...Object.fromEntries(["contradictiondismiss", "contradictionclarify", "contradictiontakeup", "contradictionresolve",
                         "contradictionoptin", "contradictionrespond"].map((op) => [op, [ACT, (c) => ({ q: { viewer: c.viewer, author: c.identity } })]])),
  contradictionrecommend: [ACT, (c) => ({ q: { viewer: c.viewer, proposedBy: c.machine, principal: c.principal } })],
  resolutiondefect: [ACT, (c) => ({ q: {}, b: { by: c.member } })],
  entity: [READ, viewerOnly], entitybyalias: [READ, viewerOnly],
  publishtensions: [READ, (c) => ({ q: { viewer: c.viewer, author: c.author } })],
  comparisonfacts: [READ, viewerOnly],
};
/* Every name a stamp could carry, so a stamp the op does not declare is seen to be absent when the caller sends none; of
   these, R17's own (QUERY_STAMPS) are deleted when a caller sends one, and the others reach only routes that do not read
   them (each is set wherever a route reads it). */
const STAMP_NAMES = [...new Set([...QUERY_STAMPS, "proposedBy", "principal", "owner", "member", "mintedBy", "proposer"])];

test("R2, R31: each of N345's fifteen ops (and entity, entitybyalias) has its spec, and is forwarded to the store's route of its name in the namespace the caller lands in", async () => {
  assert.equal(Object.keys(ROUTES).length, 17);
  for (const [op, [spec]] of Object.entries(ROUTES)) assert.deepEqual(OPS[op], spec, op);
  const { w, list } = callers();
  for (const c of list) for (const op of Object.keys(ROUTES)) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token: c.token, params: { ...c.params, candidate: "CAND-1" }, method: "POST", body: { note: "kept" } });
    assert.equal(r.status, 200, `${op}/${c.name}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(w.env);
    assert.deepEqual(inner.map((x) => [x.route, x.ns]), [[op, c.ns]], `${op}/${c.name}`);
    assert.equal(inner[0].params.candidate, "CAND-1", `${op}: the caller's own parameters reach the route`);
    assert.equal(inner[0].body.note, "kept", `${op}: the caller's own body reaches the route`);
    assert.deepEqual([r.json.store, r.json.tokenClass], [c.ns, c.name === "agent" ? "ai" : ["founder", "ann"].includes(c.name) ? (c.name === "founder" ? "admin" : "member") : c.name]);
  }
});

test("R17, R29: each op's declared stamps are the server's value from the credential, for every kind of caller, whatever the caller sent in the query or the body; a stamp the op does not declare is not set", async () => {
  const { w, list } = callers();
  const forgedQ = Object.fromEntries(STAMP_NAMES.map((k) => [k, FORGED]));
  const forgedB = Object.fromEntries([...STAMP_NAMES, ...BODY_STAMPS].map((k) => [k, FORGED]));
  for (const c of list) for (const [op, [, stamps]] of Object.entries(ROUTES)) {
    const want = stamps(c);
    for (const [params, body] of [[c.params, {}], [{ ...c.params, ...forgedQ }, forgedB]]) {
      w.env.calls.length = 0;
      await call(w.env, { op, token: c.token, params, method: "POST", body });
      const [inner] = opCalls(w.env);
      const where = `${op} for ${c.name}${params === c.params ? "" : " (forged)"}`;
      for (const k of STAMP_NAMES) {
        const got = inner.params[k] ?? null;
        if (Object.hasOwn(want.q, k)) assert.equal(got, want.q[k], `${where}: ?${k}`);
        else if (QUERY_STAMPS.includes(k)) assert.notEqual(got, FORGED, `${where}: ?${k} carries the caller's value`);
        if (!Object.hasOwn(want.q, k) && params === c.params) assert.equal(got, null, `${where}: ?${k} is not this op's stamp`);
      }
      for (const [k, v] of Object.entries(want.b ?? {})) assert.equal(inner.body[k], v, `${where}: #${k}`);
      for (const k of BODY_STAMPS) assert.notEqual(inner.body?.[k], FORGED, `${where}: #${k}`);
    }
  }
});

test("R17: resolutiondefect's `by` is stamped into an empty POST body too, and a GET carries none (the module's own refusal then answers)", async () => {
  const { w } = callers();
  for (const [token, by] of [[w.S.ann, "ann"], [w.env.ADMIN_TOKEN, "class:admin"]]) {
    w.env.calls.length = 0;
    await call(w.env, { op: "resolutiondefect", token, method: "POST" });
    assert.deepEqual(opCalls(w.env)[0].body, { by });
  }
  /* negative control: a GET sends no body, so nothing is stamped into one */
  w.env.calls.length = 0;
  await call(w.env, { op: "resolutiondefect", token: w.S.ann, method: "GET", params: { by: FORGED } });
  const [g] = opCalls(w.env);
  assert.deepEqual([g.body, g.params.by], [null, undefined]);
});

test("R10, R11, R13, R12: the acts are in both session sets with `contribute`, the reads need nothing (six by a null row, K516); negative controls — the daemon class is refused CLASS_FORBIDDEN, a session without contribute NOT_CAPABLE, an agent credential not declaring the write AI_BEYOND_TASK_SCOPE, and nothing is forwarded", async () => {
  const bare = hex64(), narrow = aik();
  const { env, S } = world({ sessions: { [bare]: member("bea", []) },
                             creds: { [narrow]: cred({ tokenId: "agent-narrow", writes: ["cite"] }) } });
  for (const [op, [spec]] of Object.entries(ROUTES)) {
    if (spec.mutating) {
      assert.deepEqual([SESSION_OPS.member.has(op), SESSION_OPS.admin.has(op), NEEDS[op]], [true, true, "contribute"], op);
    } else if (["entity", "entitybyalias", "comparisonfacts"].includes(op)) assert.equal(Object.hasOwn(NEEDS, op), false, op);
    /* K516: the contradiction reads and the ceremony's read carry a null row, named in affordances' NON_ACTS */
    else assert.deepEqual([Object.hasOwn(NEEDS, op), NEEDS[op]], [true, null], op);
    for (const [token, code, check, status] of [[env.DAEMON_TOKEN, "CLASS_FORBIDDEN", "C-38.2", 403],
                                                ...(spec.mutating ? [[bare, "NOT_CAPABLE", "C-38.5", 403], [narrow, "AI_BEYOND_TASK_SCOPE", "C-29.6", 403]] : [])]) {
      env.calls.length = 0;
      refused(await call(env, { op, token, method: "POST", body: {} }), status, code, check);
      assert.equal(opCalls(env).length, 0, `${op}: forwarded after ${code}`);
    }
    /* the same caller shapes admitted: a session holding contribute, the member binding, a read by the narrow agent */
    for (const token of [S.ann, env.MEMBER_TOKEN, ...(spec.mutating ? [] : [narrow, bare])]) {
      env.calls.length = 0;
      const r = await call(env, { op, token, method: "POST", body: {} });
      assert.equal(r.status, 200, `${op}: ${r.text.slice(0, 160)}`);
      assert.equal(opCalls(env).length, 1);
    }
  }
});

test("R27: N345's id-carrying reads are classified — notices, responses, candidates and publishtensions name a project (the door answers existence first), facts, tensions and comparisonfacts name none, with the reason", async () => {
  const { PROJECT_NAMING_READS: NAMES, PROJECT_NAMING_READS_NOT: NOT } = D;
  assert.deepEqual([NAMES.contradictionnotices, NAMES.contradictionresponses, NAMES.contradictioncandidates, NAMES.publishtensions],
                   [["project"], ["project"], ["project", "bundle"], ["project"]]);
  for (const op of ["contradictionfacts", "contradictiontensions", "comparisonfacts"]) {
    assert.equal(typeof NOT[op], "string", op);
    assert.equal(Object.hasOwn(NAMES, op), false, op);
  }
  /* through the door: a viewer seeing a discoverable project only at EXISTENCE is answered C-70.1 before the route runs */
  const P = "PROJ-seen";
  for (const [op, p] of [["contradictionnotices", "project"], ["contradictionresponses", "project"], ["contradictioncandidates", "project"],
                         ["contradictioncandidates", "bundle"], ["publishtensions", "project"]]) {
    const ran = [];
    const store = { routes: () => ({ [op]: () => { ran.push(op); return { answered: op }; } }),
                    membership: () => ({ visibilityOf: (id) => (id === P ? "discoverable" : "hidden"),
                                         existenceAct: (id) => (id === P ? { ok: false, reason: "PROJECT_SEEN_NOT_A_PARTICIPANT", project: id } : null) }) };
    const r = await (await D.dispatch(new Request(`http://do/${op}?viewer=member:ann&${p}=${P}`), store)).json();
    assert.deepEqual([r.result.reason, ran], ["PROJECT_SEEN_NOT_A_PARTICIPANT", []], `${op}.${p}`);
    /* negative control: a project the viewer is not shown at existence falls through to the route */
    const r2 = await (await D.dispatch(new Request(`http://do/${op}?viewer=member:ann&${p}=PROJ-other`), store)).json();
    assert.deepEqual([r2.result, ran], [{ answered: op }, [op]], `${op}.${p} other`);
  }
});
