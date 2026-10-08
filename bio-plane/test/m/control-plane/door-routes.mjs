/* The door's shared drive for a session-only op routed through its owner's map (R26's pattern): every kind of caller, and
   `routesForSessions`, which finds each declared stamp set from the session and none taken from the caller, every machine
   credential refused before any store request, and the owner's refusal answered as given. Used by `t37-door.test.mjs`
   (R66, R67) and `t38-door.test.mjs` (R67's `obscuremarkwithdraw`). */
import assert from "node:assert/strict";
import { O, world, call, opCalls, aik, cred, FORGED } from "./harness.mjs";

const { OPS, OP_STAMPS } = O;
export const ok = (result, status = 200) => new Response(JSON.stringify({ ok: true, result }), { status });

/* Every kind of caller; only the two sessions reach a session-only op. */
export function callers(opts = {}) {
  const agent = aik();
  const w = world({ ...opts, creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  return { w, sessions: [
    { name: "founder", token: w.S.founder, viewer: "admin", by: "admin" },
    { name: "ann", token: w.S.ann, viewer: "member:ann", by: "member:ann" },
  ], machines: [
    { name: "admin", token: w.env.ADMIN_TOKEN }, { name: "member", token: w.env.MEMBER_TOKEN },
    { name: "probe", token: w.env.PROBE_TOKEN, params: { store: "scratch" } }, { name: "daemon", token: w.env.DAEMON_TOKEN },
    { name: "agent", token: agent },
  ] };
}

/* A session-only op reaches the store's route of its own name, each declared stamp from the session, none the caller's. */
export async function routesForSessions(ops, bodyOf) {
  for (const op of ops) {
    assert.ok(OPS[op], `${op} is declared (op-declarations)`);
    const { w, sessions, machines } = callers({ answer: (c) => (c.route === op ? ok({ ok: true, route: op }) : null) });
    const declared = OP_STAMPS[op] || [];
    for (const s of sessions) {
      w.env.calls.length = 0;
      const forged = Object.fromEntries(["viewer", "by", "author", "identity", "member"].map((k) => [k, FORGED]));
      const mutating = OPS[op].mutating;
      const r = await call(w.env, { op, token: s.token, method: mutating ? "POST" : "GET", params: forged,
                                    body: mutating ? { ...forged, ...bodyOf(op), actorIdentity: FORGED } : undefined });
      assert.equal(r.status, 200, `${op}/${s.name}: ${r.text.slice(0, 200)}`);
      assert.deepEqual([r.json.ok, r.json.result.route], [true, op], `${op}/${s.name}`);
      const inner = opCalls(w.env).filter((c) => c.route === op);
      assert.equal(inner.length, 1, `${op}/${s.name}`);
      assert.equal(inner[0].ns, "bio");
      for (const k of ["viewer", "by"]) {
        if (declared.includes(k)) assert.equal(inner[0].params[k], s[k], `${op}/${s.name}: ${k} stamped from the session`);
        else assert.equal(Object.hasOwn(inner[0].params, k), false, `${op}/${s.name}: ${k} not declared, not passed`);
      }
      for (const k of ["author", "identity"])
        if (!declared.includes(k)) assert.equal(Object.hasOwn(inner[0].params, k), false, `${op}/${s.name}: no caller ${k}`);
      if (mutating) {
        for (const [k, v] of Object.entries(bodyOf(op))) assert.deepEqual(inner[0].body[k], v, `${op}: the body's own ${k} kept`);
        assert.equal(Object.hasOwn(inner[0].body, "actorIdentity"), false);
      }
    }
    /* every machine credential is refused before any store request */
    for (const m of machines) {
      w.env.calls.length = 0;
      const r = await call(w.env, { op, token: m.token, method: "POST", params: m.params ?? {}, body: bodyOf(op) });
      assert.notEqual(r.status, 200, `${op}/${m.name}: ${r.text.slice(0, 200)}`);
      assert.equal(r.json.ok, false);
      assert.deepEqual(opCalls(w.env).filter((c) => c.route === op), [], `${op}/${m.name}: no store request`);
    }
    /* a refusal is the owner's, answered as given */
    const refusing = callers({ answer: (c) => (c.route === op ? ok({ ok: false, reason: "OWNERS_OWN_REFUSAL", detail: "theirs" }) : null) });
    const r = await call(refusing.w.env, { op, token: refusing.w.S.ann, method: OPS[op].mutating ? "POST" : "GET",
                                           body: OPS[op].mutating ? bodyOf(op) : undefined });
    assert.deepEqual([r.json.result.ok, r.json.result.reason, r.json.result.detail], [false, "OWNERS_OWN_REFUSAL", "theirs"], op);
  }
}
