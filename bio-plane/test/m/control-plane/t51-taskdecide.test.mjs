/* control-plane R113 (T51; K4213; tasks R20): `taskdecide` takes the body stamp of `actor` that `taskforward`, `taskresolve`, `taskdrain`
   and `biasdebtresolve` take (index.mjs), the server's word from the session, and reaches `tasks` through the store's route of its own
   name (`tasksOps`, spread by store-door). Driven through the door with a member's session and a forged body `actor`. */
import "./register-tasks.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, call, FORGED } from "./harness.mjs";
import { callers } from "./door-routes.mjs";

const { OPS } = O;

/* the door as a member's session drives `op` with a body naming someone else as `actor`; the store's request it made */
async function drive(op) {
  const { w, sessions } = callers();
  const ann = sessions.find((s) => s.name === "ann");
  const r = await call(w.env, { op, token: ann.token, method: "POST", body: { actor: FORGED, item: "TSK-1", decision: "done" } });
  return { r, stored: w.env.calls.find((c) => c.route === op) };
}

test("R113 (T51; K4213): taskdecide reaches tasks' route with the body's actor stamped from the session, a forged actor overwritten, as taskforward's is", async () => {
  assert.ok(Object.hasOwn(OPS, "taskdecide"), "taskdecide is declared (tasks R20, FR-21): the door refuses an op with no spec");
  const decide = await drive("taskdecide");
  const forward = await drive("taskforward");
  assert.ok(decide.stored, `taskdecide reached the store's route of its own name (status ${decide.r.status})`);
  assert.notEqual(decide.stored.body.actor, FORGED, "the caller's actor is overwritten");
  assert.equal(decide.stored.body.actor, forward.stored.body.actor, "the same server's word taskforward's actor is");
});

test("R113 control: a taskdecide that names no actor in its body is stamped the same, and the forged actor reaches no store request", async () => {
  const { w, sessions } = callers();
  const ann = sessions.find((s) => s.name === "ann");
  await call(w.env, { op: "taskdecide", token: ann.token, method: "POST", body: { item: "TSK-1", decision: "done" } });
  const stored = w.env.calls.find((c) => c.route === "taskdecide");
  assert.ok(stored, "the store's route of its own name was reached");
  assert.equal(stored.body.actor, "ann", "a member's session stamps its own member");
  assert.ok(!w.env.calls.some((c) => JSON.stringify(c.body ?? "").includes(FORGED)), "the forged actor reaches no store request");
});
