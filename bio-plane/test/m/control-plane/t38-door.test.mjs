/* control-plane T38 (T38-16): R67's third op, `obscuremarkwithdraw` (case-carriage R14; op-declarations R40; N788,
   DEC-183 (2)). No route code: the plane spreads `caseCarriageOps`, and the `by` stamp comes from op-declarations'
   `OP_FAMILIES`. Driven through `makeFetch(hooks)` over the harness's store, in `t37-door.test.mjs`'s pattern. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, call, opCalls, FORGED } from "./harness.mjs";
import { ok, callers, routesForSessions } from "./door-routes.mjs";

const OP = "obscuremarkwithdraw";
const BODY = { captureSha: "b".repeat(64), mark: "M-1", reason: "the passer-by is the subject of the finding after all" };

test("R67 (T38; N788; DEC-183 (2); op-declarations R40; case-carriage R14): `obscuremarkwithdraw` reaches case-carriage's route of its own name for a member's or the founder's session, `by` set from the session as declared and none taken from the caller, `captureSha`, `mark` and `reason` kept from the body; every machine credential and an `ai` bearer are refused before any store request; a refusal is case-carriage's, answered as given", async () => {
  assert.deepEqual([O.OPS[OP].mutating, O.OPS[OP].machineClasses], [true, []], "a session's act (op-declarations R40)");
  assert.ok((O.OP_STAMPS[OP] || []).includes("by"), "`by` declared (op-declarations R40)");
  await routesForSessions([OP], () => BODY);
});

test("R67 (T38; op-declarations R40): `obscuremarkwithdraw`'s `by` is the session's whether the caller sends one in the address, in the body or not at all, and a caller's body `by` reaches no owner (R29), and an `ai` credential holding every write is refused", async () => {
  const { w, sessions, machines } = callers({ answer: (c) => (c.route === OP ? ok({ ok: true, mark: "M-1" }) : null) });
  for (const s of sessions) for (const [params, body] of [[{}, BODY], [{ by: FORGED }, BODY], [{}, { ...BODY, by: FORGED }]]) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op: OP, token: s.token, method: "POST", params, body });
    assert.equal(r.status, 200, `${s.name}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(w.env).filter((c) => c.route === OP);
    assert.equal(inner.length, 1);
    assert.equal(inner[0].params.by, s.by, `${s.name}: ${JSON.stringify(params)}`);
    assert.equal(inner[0].url.href.includes(FORGED), false, `${s.name}: no forged value in the address`);
    assert.equal(Object.hasOwn(inner[0].body, "by"), false, `${s.name}: no caller's \`by\` in the body`);
    assert.deepEqual([inner[0].body.captureSha, inner[0].body.mark, inner[0].body.reason], [BODY.captureSha, BODY.mark, BODY.reason]);
  }
  const agent = machines.find((m) => m.name === "agent");
  w.env.calls.length = 0;
  const r = await call(w.env, { op: OP, token: agent.token, method: "POST", body: BODY });
  assert.equal(r.json.ok, false, r.text.slice(0, 200));
  assert.deepEqual(opCalls(w.env).filter((c) => c.route === OP), [], "the bearer reaches no store");
});
