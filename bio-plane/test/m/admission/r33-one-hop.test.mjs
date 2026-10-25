/* R33 (fix round 10; K5170; ratification R60): `admit` reads the session and asks whether a re-authentication is due in
   one hop, the two issued together; its answers are unchanged. Driven through the door's gate order (`gate`), counting
   what the platform double sees: both questions are on the wire before either is answered. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, gate, founder, member, hex64, refused, REAUTH_DUE_ANSWER, opCalls } from "./harness.mjs";

const CAPS = ["contribute", "publish", "create_projects"];
const ACTS = { caseratify: null };
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/* A world whose store answers `session` and `reauthdue` after a pause and records, at the first answer, which of the
   two questions had reached the store: one hop if both had. */
function paced(sessions) {
  const seen = { atFirstAnswer: null };
  let envRef = null;
  const w = world({ sessions, answer: async (call) => {
    if (call.route !== "session" && call.route !== "reauthdue") return null;
    await delay(25);
    if (seen.atFirstAnswer === null)
      seen.atFirstAnswer = envRef.calls.map((c) => c.route).filter((r) => r === "session" || r === "reauthdue").sort();
    return null;
  } });
  envRef = w.env;
  return { ...w, seen };
}

test("R33: an act that asks the password again has the session and the re-authentication due asked in one hop (both on the wire before either is answered), each once, with the session's token in a header", async () => {
  const shut = hex64(), open = hex64();
  const { env, seen } = paced({ [shut]: founder(CAPS), [open]: { ...founder(CAPS), reauthUntil: Date.now() + 60 * 60e3 } });
  const r = await gate(env, { op: "caseratify", token: shut, reauthActs: ACTS });
  assert.deepEqual(seen.atFirstAnswer, ["reauthdue", "session"], "both questions issued before the first answer");
  assert.equal(env.calls.filter((c) => c.route === "session").length, 1);
  assert.equal(env.calls.filter((c) => c.route === "reauthdue").length, 1);
  for (const c of env.calls.filter((c) => c.route === "session" || c.route === "reauthdue")) {
    assert.equal(c.headers["x-bio-session"], shut);
    assert.equal(c.href.includes(shut), false, "the token is never in the address");
  }
  /* answers unchanged: outside the window REAUTH_DUE as credentials gives it; inside it the caller is admitted */
  assert.deepEqual(refused(r, 403, "REAUTH_DUE", REAUTH_DUE_ANSWER.check, [shut]), { ...REAUTH_DUE_ANSWER });
  assert.equal(opCalls(env).length, 0);
  const { env: env2 } = paced({ [open]: { ...founder(CAPS), reauthUntil: Date.now() + 60 * 60e3 } });
  const admitted = await gate(env2, { op: "caseratify", token: open, reauthActs: ACTS });
  assert.ok(admitted.caller, JSON.stringify(admitted).slice(0, 200));
});

test("R33: every other answer of the chain is unchanged when the two are issued together — a locked session, an unknown token, a missing capability, a silent session and a silent question", async () => {
  const locked = hex64(), bare = hex64(), stranger = hex64(), shut = hex64();
  const { env } = world({ sessions: { [locked]: { ...founder(CAPS), locked: true }, [bare]: member("bea", []),
                                      [shut]: founder(CAPS) } });
  const body = async (token, extra = {}) => gate(env, { op: "caseratify", token, reauthActs: ACTS, ...extra });
  const l = await body(locked);
  assert.equal(l.refusal.status, 401);
  assert.equal(l.refusal.body.reason, "SESSION_LOCKED");
  assert.equal((await body(stranger)).refusal.body.reason, "NOT_AUTHENTICATED", "an unknown session is not authenticated, whatever the question answered");
  assert.equal((await body(bare)).refusal.body.reason, "NOT_CAPABLE", "the capability is judged before the password");
  /* a silence of the session read is the session's, though the question was also on the wire */
  const silentSession = world({ sessions: { [shut]: founder(CAPS) }, answer: (c) => (c.route === "session" ? new Response("<html>") : null) });
  const s1 = await gate(silentSession.env, { op: "caseratify", token: shut, reauthActs: ACTS });
  assert.equal(s1.silent?.op, "session");
  /* a silence of the question, the session read fine, is the question's */
  const silentDue = world({ sessions: { [shut]: founder(CAPS) }, answer: (c) => (c.route === "reauthdue" ? new Response("<html>") : null) });
  const s2 = await gate(silentDue.env, { op: "caseratify", token: shut, reauthActs: ACTS });
  assert.equal(s2.silent?.op, "reauthdue");
  /* a store that rejects the unused question never makes the request fail */
  const rejecting = world({ sessions: { [bare]: member("bea", []) }, answer: (c) => { if (c.route === "reauthdue") throw new Error("down"); return null; } });
  const s3 = await gate(rejecting.env, { op: "caseratify", token: bare, reauthActs: ACTS });
  assert.equal(s3.refusal?.body.reason, "NOT_CAPABLE");
});

test("R33: controls — an act that asks only the session makes one store call and no question of the window; an administrator's own act is still put to the roster before the password is asked", async () => {
  const ann = hex64(), old = hex64();
  const { env } = world({ sessions: { [ann]: { ...member("ann", CAPS), reauthUntil: Date.now() + 60 * 60e3 }, [old]: member("cal", CAPS) } });
  const r = await gate(env, { op: "promote", token: ann, reauthActs: ACTS });
  assert.ok(r.caller, JSON.stringify(r).slice(0, 200));
  assert.deepEqual(env.calls.map((c) => c.route), ["session"], "one store call");
  env.calls.length = 0;
  const own = await gate(env, { op: "adminendorse", token: old, reauthActs: { adminendorse: null } });
  assert.equal(own.refusal?.body.reason, "NOT_AN_ADMIN");
  assert.equal(env.calls.filter((c) => c.route === "reauthdue").length, 0, "the password is not asked of a member who may not take the act");
});
