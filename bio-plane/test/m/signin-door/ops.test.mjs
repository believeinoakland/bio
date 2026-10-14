/* signin-door R2, R4, R5: the store's half (`src/signin-door/ops.mjs`) driven at its interface, `signinDoorOps(c, url,
   body, env)`, over a stand-in `credentials` recording each in-plane call it is asked. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { signinDoorOps, keptLine } from "../../../src/signin-door/ops.mjs";
import { SIGNIN_TRACE_MAX, TRACE_FIELDS } from "../../../src/signin-door/index.mjs";

const TEST_ENV = { CIVICSMITH_TEST_INSTANCE: "civ-test", INSTANCE_NAME: "civ-test" };
function credentials(answers = {}) {
  const asked = [];
  const rec = (name) => (args) => { asked.push([name, args]); return answers[name] ?? null; };
  return { asked, disclosureDue: rec("disclosureDue"), subscriptionTokenHold: rec("subscriptionTokenHold"),
           subscriptionTokenRefused: rec("subscriptionTokenRefused") };
}
const at = (path) => new URL(`http://do/${path}`);
const run = (c, path, body, env = {}) => signinDoorOps(c, at(path), body, env)[at(path).pathname.slice(1)]();

test("R2 (credentials R64): `signindisclosuredue` asks `disclosureDue` for the stamped member, `by` from the query and never the body, and answers its refusal as given, or `{ok: true}` when it answers null", async () => {
  const due = { ok: false, reason: "DISCLOSURE_DUE", check: "C-29.40" };
  const c = credentials({ disclosureDue: due });
  assert.deepEqual(run(c, "signindisclosuredue?by=member%3Aann", { member: "member:forged" }), due);
  assert.deepEqual(c.asked, [["disclosureDue", { member: "member:ann" }]]);
  assert.deepEqual(run(credentials(), "signindisclosuredue?by=member%3Aann", {}), { ok: true }, "control: shown");
});

test("R4 (credentials R70): `signintokenhold` hands the body's `token` and `validFor` to `subscriptionTokenHold` for the stamped member and answers its result; `signintokenrefused` calls `subscriptionTokenRefused` for the stamped member", async () => {
  const c = credentials({ subscriptionTokenHold: { ok: true, since: "s" }, subscriptionTokenRefused: { ok: true, dropped: true } });
  assert.deepEqual(await run(c, "signintokenhold?by=member%3Aann", { token: "tok", validFor: "1 year", member: "member:forged" }),
                   { ok: true, since: "s" });
  assert.deepEqual(run(c, "signintokenrefused?by=member%3Aann", { member: "member:forged" }), { ok: true, dropped: true });
  assert.deepEqual(c.asked, [["subscriptionTokenHold", { member: "member:ann", token: "tok", validFor: "1 year" }],
                             ["subscriptionTokenRefused", { member: "member:ann" }]]);
  const none = credentials();
  run(none, "signintokenhold?by=member%3Aann", null);
  assert.deepEqual(none.asked, [["subscriptionTokenHold", { member: "member:ann", token: null, validFor: null }]]);
});

test("R5 (connect §3): on a test instance the trace keeps the last 200 lines, each only the named fields as short scalars (no token, secret or code field), and `signintraceread` answers them oldest first; off a test instance nothing is kept and no line is read (the refusal is the door's alone)", async () => {
  const c = credentials();
  for (let i = 0; i < SIGNIN_TRACE_MAX + 25; i++)
    assert.equal(run(c, "signintracekeep", { line: { event: "signin.door", trace: `t${i}`, ms_total: i, held: false,
                                                     token: "sentinel-token", secret: "s", address: "https://x?code=1" } }, TEST_ENV).kept, true);
  const read = run(c, "signintraceread", null, TEST_ENV);
  assert.equal(read.ok, true);
  assert.equal(read.lines.length, SIGNIN_TRACE_MAX);
  assert.deepEqual([read.lines[0].trace, read.lines.at(-1).trace], ["t25", `t${SIGNIN_TRACE_MAX + 24}`]);
  for (const l of read.lines) assert.deepEqual(Object.keys(l).filter((k) => !TRACE_FIELDS.includes(k)), []);
  assert.equal(JSON.stringify(read).includes("sentinel-token"), false);
  assert.deepEqual(keptLine({ step: "x".repeat(201), status: 200, at: { nested: 1 } }), { status: 200 });
  assert.deepEqual(run(c, "signintracekeep", { line: { token: "t" } }, TEST_ENV), { ok: true, kept: false });
  /* another store's trace is its own */
  assert.deepEqual(run(credentials(), "signintraceread", null, TEST_ENV).lines, []);
  const prod = credentials();
  assert.deepEqual(run(prod, "signintracekeep", { line: { event: "signin.door" } }, { INSTANCE_NAME: "oakland" }), { ok: true, kept: false });
  assert.deepEqual(run(c, "signintraceread", null, { INSTANCE_NAME: "oakland" }).lines, [], "no line read off a test instance");
  assert.deepEqual(run(prod, "signintraceread", null, TEST_ENV).lines, [], "nothing was kept off the test instance");
});
