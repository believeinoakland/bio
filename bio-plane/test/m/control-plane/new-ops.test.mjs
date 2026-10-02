/* control-plane: the ops T22 layer 11 declares (K1037, K1019, K1108; op-declarations, affordances): escalation's
   `declinetoescalate` (J3's decline act) and `escalationstatus`; capture's `heldsetaside`, `heldrestore`, `heldcaptures`,
   `doorbelltally` and `gradenote`; monitoring's `addressfrequencyset`. Each is routed through the door's general path to
   its store route of the same name, with the stamps its act lists name (R17, R29), for every kind of caller its row
   admits, whatever the caller sent; `doorbelltally` is a member session's alone; `doorbellrefused` stays store-internal,
   never a public op (R2). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, aik, cred, refused, FORGED, QUERY_STAMPS, BODY_STAMPS } from "./harness.mjs";

const { OPS } = O;

function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  const bind = (c, token, params = {}) => ({ name: c, token, params, ns: params.store ?? "bio", session: false,
    viewer: `class:${c}`, by: `class:${c}`, author: `class:${c}` });
  return { w, list: [
    bind("admin", w.env.ADMIN_TOKEN), bind("member", w.env.MEMBER_TOKEN), bind("probe", w.env.PROBE_TOKEN, { store: "scratch" }),
    { name: "founder", token: w.S.founder, params: {}, ns: "bio", session: true, viewer: "admin", by: "admin", author: "member:admin" },
    { name: "ann", token: w.S.ann, params: {}, ns: "bio", session: true, viewer: "member:ann", by: "ann", author: "member:ann" },
    { name: "agent", token: agent, params: {}, ns: "bio", session: false, viewer: "member:ann", by: "class:ai", author: "class:ai/agent-ann" },
  ] };
}

/* Each op: its stamps, from the caller. The author is the action layer's (QUERY_AUTHOR_ACTIONS), the `by` capture's member
   acts' (CAPTURE_MEMBER_ACTIONS), the viewer every sight-gated op's. */
const viewer = (c) => ({ viewer: c.viewer });
const NEW = {
  declinetoescalate:   (c) => ({ author: c.author, viewer: c.viewer }),
  escalationstatus:    viewer,
  heldsetaside:        (c) => ({ by: c.by, viewer: c.viewer }),
  heldrestore:         (c) => ({ by: c.by, viewer: c.viewer }),
  heldcaptures:        viewer,
  doorbelltally:       viewer,
  gradenote:           viewer,
  addressfrequencyset: (c) => ({ author: c.author, viewer: c.viewer }),
};
const admits = (spec, c) => (c.session ? true
  : c.name === "agent" ? !Array.isArray(spec.machineClasses)
  : (Array.isArray(spec.machineClasses) ? spec.machineClasses : spec.classes).includes(c.name));
const STAMP_NAMES = [...new Set([...QUERY_STAMPS, "proposer", "principal", "owner", "member"])];

test("R2, R17, R29 (K1037, K1108): each new op is declared and routed through the general path to its store route, in the caller's namespace, with the caller's own parameters and body; its declared stamps are the server's value for every caller its row admits, the caller's forged ones deleted, and no stamp it does not declare is set", async () => {
  const { w, list } = callers();
  let checked = 0, reached = 0;
  for (const op of Object.keys(NEW)) assert.ok(Object.hasOwn(OPS, op), `${op} is declared`);
  const forgedQ = Object.fromEntries(STAMP_NAMES.map((k) => [k, FORGED]));
  const forgedB = Object.fromEntries([...STAMP_NAMES, ...BODY_STAMPS].map((k) => [k, FORGED]));
  for (const c of list) for (const [op, stamps] of Object.entries(NEW)) {
    const spec = OPS[op];
    if (!admits(spec, c)) continue;
    const want = stamps(c);
    for (const [params, body] of [[c.params, { note: "kept" }], [{ ...c.params, ...forgedQ }, { note: "kept", ...forgedB }]]) {
      w.env.calls.length = 0;
      const r = await call(w.env, { op, token: c.token, params: { ...params, capture: "C1" }, method: spec.mutating ? "POST" : "GET",
                                    body: spec.mutating ? body : undefined });
      const where = `${op} for ${c.name}${params === c.params ? "" : " (forged)"}`;
      assert.equal(r.status, 200, `${where}: ${r.text.slice(0, 200)}`);
      const inner = opCalls(w.env);
      assert.deepEqual(inner.map((x) => [x.route, x.ns]), [[op, c.ns]], where);
      assert.equal(inner[0].params.capture, "C1", `${where}: the caller's own parameters reach the route`);
      if (spec.mutating) assert.equal(inner[0].body.note, "kept", `${where}: the body reaches the route`);
      for (const k of STAMP_NAMES) {
        const got = inner[0].params[k] ?? null;
        if (Object.hasOwn(want, k)) { assert.equal(got, want[k], `${where}: ?${k}`); checked++; }
        else if (QUERY_STAMPS.includes(k)) assert.notEqual(got, FORGED, `${where}: ?${k} carries the caller's value`);
        if (!Object.hasOwn(want, k) && params === c.params) assert.equal(got, null, `${where}: ?${k} is not this op's stamp`);
      }
      for (const k of BODY_STAMPS) assert.notEqual(inner[0].body?.[k], FORGED, `${where}: #${k}`);
      reached++;
    }
  }
  assert.ok(reached >= 80 && checked > 100, `${reached} ${checked}`);
});

test("R28 (capture R80; admission R8–R10): `doorbelltally` is a member session's alone — every bearer class CLASS_FORBIDDEN and an agent credential AI_BEYOND_TASK_SCOPE, nothing forwarded; negative control: a session reads it", async () => {
  const wide = aik();
  const { env, S } = world({ creds: { [wide]: cred({ tokenId: "agent-wide", writes: Object.keys(OPS) }) } });
  for (const [token, params] of [[env.ADMIN_TOKEN, {}], [env.MEMBER_TOKEN, {}], [env.PROBE_TOKEN, { store: "scratch" }], [env.DAEMON_TOKEN, {}]]) {
    env.calls.length = 0;
    refused(await call(env, { op: "doorbelltally", token, params }), 403, "CLASS_FORBIDDEN", "C-38.2");
    assert.equal(opCalls(env).length, 0);
  }
  env.calls.length = 0;
  refused(await call(env, { op: "doorbelltally", token: wide }), 403, "AI_BEYOND_TASK_SCOPE", "C-29.6");
  assert.equal(opCalls(env).length, 0);
  for (const token of [S.ann, S.founder]) {
    env.calls.length = 0;
    assert.equal((await call(env, { op: "doorbelltally", token })).status, 200);
    assert.deepEqual(opCalls(env).map((c) => c.route), ["doorbelltally"]);
  }
});

test("R2 (K1037): `doorbellrefused` is store-internal — answered `unknown op` (C-69.1) for every caller, nothing forwarded; negative control: its sibling `doorbelltally` is an op", async () => {
  assert.equal(Object.hasOwn(OPS, "doorbellrefused"), false);
  const { env, S } = world();
  for (const token of [undefined, S.ann, S.founder, env.ADMIN_TOKEN, env.DAEMON_TOKEN]) {
    for (const method of ["GET", "POST"]) {
      env.calls.length = 0;
      const r = await call(env, { op: "doorbellrefused", token, method, body: method === "POST" ? { day: "2026-10-02" } : undefined });
      refused(r, 400, "UNKNOWN_OP", "C-69.1");
      assert.deepEqual([Object.keys(r.json)[1], r.json.error, r.json.op], ["error", "unknown op", "doorbellrefused"]);
      assert.equal(env.calls.length, 0);
    }
    /* the path form too */
    env.calls.length = 0;
    refused(await call(env, { token, path: "/api/doorbellrefused" }), 400, "UNKNOWN_OP", "C-69.1");
  }
  assert.ok(Object.hasOwn(OPS, "doorbelltally"));
});

test("R23 (capture R79, R81; K1037): the held acts' refusals are answered at the status they state — C-118.8 403, C-118.9 400, the id count 400, an absent id 404, a named state 409 — and one stating none at the forward's own", async () => {
  for (const op of ["heldsetaside", "heldrestore"]) {
    for (const [result, status] of [[{ ok: false, reason: "MACHINE_CANNOT_SET_ASIDE", status: 403 }, 403],
                                    [{ ok: false, reason: "SET_ASIDE_NO_REASON", status: 400 }, 400],
                                    [{ ok: false, reason: "TOO_MANY_IDS", status: 400 }, 400],
                                    [{ ok: false, reason: "NO_SUCH_DOCUMENT", ids: ["X"], status: 404 }, 404],
                                    [{ ok: false, reason: "ALREADY_SET_ASIDE", ids: ["X"], status: 409 }, 409],
                                    [{ ok: false, reason: "UNSTATED" }, 200], [{ ok: true, act: "set_aside" }, 200]]) {
      const w = world({ answer: (c) => (c.route === op ? new Response(JSON.stringify({ ok: true, result })) : null) });
      const r = await call(w.env, { op, token: w.S.ann, method: "POST", body: { ids: ["X"], reason: "r" } });
      assert.equal(r.status, status, `${op} ${result.reason ?? "ok"}`);
      assert.deepEqual([r.json.ok, r.json.result.reason, r.json.store, r.json.tokenClass], [true, result.reason, "bio", "member"]);
    }
  }
});
