/* signin-door's published fixtures (`fixtures.mjs`): each is made by the door's real code, and its test calls it and checks
   the real answer. `signinRefusal` is the sign-in refusals R1 relays (status and body as the runner gave them, `trace`
   added by R3), and the door's own AGENT_WORKER_UNBOUND. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { signinRefusal, SIGNIN_REFUSAL_CODES, FIXTURE_MEMBER } from "./fixtures.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const STATUS = { NO_SIGNIN_WAITING: 409, SIGNIN_UNAVAILABLE: 502, SIGNIN_ADDRESS_UNEXPECTED: 502, AGENT_WORKER_UNBOUND: 503, SIGNIN_REFUSED: 409 };

test("R1, R3 signinRefusal answers each sign-in refusal as the door sends it: the code as `reason` and `code`, ok false, a `detail`, a `trace`, the runner's status relayed, and no code or token in it", async () => {
  assert.deepEqual([...SIGNIN_REFUSAL_CODES].sort(), Object.keys(STATUS).sort());
  for (const code of SIGNIN_REFUSAL_CODES) {
    const a = await signinRefusal(code);
    assert.equal(a.status, STATUS[code], code);
    assert.equal(a.body.ok, false, code);
    assert.equal(a.body.reason, code, code);
    if (code !== "AGENT_WORKER_UNBOUND") assert.equal(a.body.code, code, code);
    assert.equal(typeof a.body.detail === "string" && a.body.detail.length > 0, true, `${code}: detail`);
    assert.equal(typeof a.body.trace === "string" && a.body.trace.length > 0, true, `${code}: trace`);
    assert.equal(JSON.stringify(a).includes("typed-code-never-answered"), false, `${code}: the typed code is never answered`);
    assert.equal("token" in a.body, false, code);
  }
  assert.equal((await signinRefusal("NO_SIGNIN_WAITING")).body.detail, word("refusal.NO_SIGNIN_WAITING"));
});

test("R1 signinRefusal carries the runner's own detail where it gives one, and refuses a code that is no sign-in refusal (control)", async () => {
  const a = await signinRefusal("SIGNIN_REFUSED", { detail: "access_denied" });
  assert.deepEqual([a.status, a.body.reason, a.body.detail], [409, "SIGNIN_REFUSED", "access_denied"]);
  assert.equal((await signinRefusal("SIGNIN_REFUSED")).body.detail, "invalid_grant");
  await assert.rejects(() => signinRefusal("NOT_A_REFUSAL"), /no sign-in refusal/);
  assert.equal(FIXTURE_MEMBER, "member:ann");
});
