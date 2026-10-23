/* control-plane (fix round 8, G118; K4817; review G14; R-SEAM, R-ONE, R-CLOCK): `op=bootstrap` ASKS TWO WORKERS OF THE FLEET FOR THEIR VERSION ONLY ONCE A MINUTE. The real Worker, with service bindings for
   `AGENT_WORKER` and `FILE_SCANNER` that count the calls made to them and answer after 300 ms (the walker's fleet answers in 0.4-4.7 s). Two `op=bootstrap` calls from a signed-in member inside
   10 s: each part of the fleet is asked at most once for the pair (red: twice), the second answer does not wait for it (the test's own clock, outside the object: under the binding's 300 ms,
   red: over it), and the parts' state in the second answer is the first's (the plane already treats an unanswered member as `SILENT`). The owner's own test is `instance-setup/r8-parts-report.test.mjs`;
   this is the door's confirmation through the whole Worker. Red by name until `instance-setup` (G118: `partsReport` kept for the isolate for 60 s) has merged. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { makeKit } from "./r8-kit.mjs";

const DELAY_MS = 300;
const asked = { "agent-worker": 0, "file-scanner": 0 };
const later = (ms) => new Promise((r) => setTimeout(r, ms));
/* a fleet Worker as `askMemberVersion` expects one: `/version` names itself and its version, after a counted wait */
const fleet = (member) => async (request) => {
  const name = new URL(request.url).hostname;
  asked[member] += 1;
  await later(DELAY_MS);
  return Response.json({ name, version: "9.9.9", ...(member === "agent-worker" ? { runner: { state: "SERVING" } } : {}) });
};
const kit = makeKit({ tag: "r8fleet", serviceBindings: { AGENT_WORKER: fleet("agent-worker"), FILE_SCANNER: fleet("file-scanner") } });
after(() => kit.mf.dispose());

const bootstrap = async (auth) => {
  const t0 = Date.now();
  const res = await kit.plane("/api/?op=bootstrap", { headers: auth });
  const body = await res.json();
  return { body, ms: Date.now() - t0, status: res.status };
};

test("R8 (G118): two `bootstrap` calls inside 10 s ask each fleet Worker at most once, the second does not wait for the fleet, and the parts' state is the first answer's", { timeout: 300000 }, async () => {
  const ann = await kit.person("r8-fleet-ann");
  asked["agent-worker"] = 0; asked["file-scanner"] = 0;
  const first = await bootstrap(ann);
  const second = await bootstrap(ann);
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);
  console.log(`G118: bootstrap #1 ${first.ms} ms, #2 ${second.ms} ms; agent-worker asked ${asked["agent-worker"]}, file-scanner asked ${asked["file-scanner"]}`);
  assert.ok(asked["agent-worker"] >= 1 && asked["file-scanner"] >= 1, "the fleet is asked (the parts are reported)");
  assert.ok(asked["agent-worker"] <= 1, `AGENT_WORKER asked ${asked["agent-worker"]} times for two bootstrap answers in 10 s (red: 2)`);
  assert.ok(asked["file-scanner"] <= 1, `FILE_SCANNER asked ${asked["file-scanner"]} times for two bootstrap answers in 10 s (red: 2)`);
  assert.ok(second.ms < DELAY_MS, `the second answer took ${second.ms} ms, the fleet's wait ${DELAY_MS} ms: it does not wait for the fleet`);
  for (const part of ["part_signin", "part_scanner", "part_safe_view"])
    assert.equal(second.body[part], first.body[part], `${part}: the second answer states the first's`);
  assert.equal(first.body.part_scanner, true, "the fleet served, so its part is present");
});

test("R8 control (G118): the parts are still reported after a minute's wait is not needed to see them: a member's own answer carries every part, true or false, never absent", { timeout: 300000 }, async () => {
  const bea = await kit.person("r8-fleet-bea");
  const r = await bootstrap(bea);
  for (const part of ["part_signin", "part_scanner", "part_safe_view"]) assert.ok(part in r.body, `${part} is in the answer`);
});
