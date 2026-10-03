/* control-plane R50 (DEC-121 (6); K1364 B4; wizard-scripts R16): for every refusal the door answers to a member's
   session, it hands `wizard-scripts.tallyRefusal` the op and the code and nothing else about the call. The count
   crosses to the store by the internal route `wizardrefusaltally` (this module's, `dispatch.mjs`), in the namespace the
   session landed in. Driven through `makeFetch(hooks)` at the Worker door. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, opCalls } from "./harness.mjs";

const refusing = (reason, at = "result") => (c) => {
  if (c.route === "wizardrefusaltally") return null;
  if (c.route === "session" || c.route === "aicredentiallook") return null;
  return new Response(JSON.stringify(at === "result" ? { ok: true, result: { ok: false, reason, detail: "member:ann's case X" } }
                                                      : { ok: false, reason, detail: "x" }), { status: at === "result" ? 200 : 400 });
};
const tallies = (env) => env.calls.filter((c) => c.route === "wizardrefusaltally");

test("R50: a refusal answered to a member's session — the store's inside its answer, the store's own, the door's own — is tallied once, as {op, code} and nothing else, in the session's namespace; the answer the caller receives is unchanged (negative control: an answer that is not a refusal tallies nothing)", async () => {
  const { env, S } = world({ answer: refusing("NO_SUCH_BUNDLE") });
  for (const token of [S.ann, S.founder]) {
    env.calls.length = 0;
    const r = await call(env, { op: "index", token, params: { viewer: "member:forged", note: "secret words" } });
    assert.deepEqual([r.json.result.ok, r.json.result.reason], [false, "NO_SUCH_BUNDLE"]);
    const t = tallies(env);
    assert.equal(t.length, 1);
    assert.deepEqual([t[0].ns, t[0].method, t[0].body], ["bio", "POST", { op: "index", code: "NO_SUCH_BUNDLE" }]);
    assert.deepEqual(t[0].params, {}, "nothing of the call rides in the query");
  }
  /* the store's own refusal (BAD_JSON, at its status), relayed */
  const own = world({ answer: refusing("BAD_JSON", "top") });
  let r = await call(own.env, { op: "index", token: own.S.ann });
  assert.equal(r.status, 400);
  assert.deepEqual(tallies(own.env).map((c) => c.body), [{ op: "index", code: "BAD_JSON" }]);
  /* the door's own refusal after admission: a session creating a project without `create_projects` (admission R11's
     payload gate, which this door asks) */
  const plain = world({ caps: ["contribute"] });
  const md = "---\nobject_type: project\ntitle: P\n---\n";
  r = await call(plain.env, { op: "promote", token: plain.S.ann, method: "POST",
                              body: { base: null, meta: { object_type: "project" }, files: [{ path: "bundle.md", text: md }] } });
  assert.equal(r.json.reason, "NOT_CAPABLE");
  assert.deepEqual(tallies(plain.env).map((c) => c.body), [{ op: "promote", code: "NOT_CAPABLE" }]);
  /* a silence is a refusal answered too */
  const silent = world({ answer: (c) => (c.route === "index" ? new Response("not json") : null) });
  r = await call(silent.env, { op: "index", token: silent.S.ann });
  assert.equal(r.status, 502);
  assert.deepEqual(tallies(silent.env).map((c) => c.body), [{ op: "index", code: "STORE_DID_NOT_ANSWER" }]);
  /* negative control: a success is not tallied */
  plain.env.calls.length = 0;
  r = await call(plain.env, { op: "index", token: plain.S.ann });
  assert.equal(r.json.ok, true);
  assert.equal(tallies(plain.env).length, 0);
});

test("R50: a refusal answered to any other caller — a binding class, an agent credential, no credential, a public op — is not tallied; the op tallied is the one the member asked (`inboxresolve` at `pulled`, not its re-route); a tally the store does not take changes nothing the caller receives", async () => {
  const { env, S, A } = world({ answer: refusing("NO_SUCH_BUNDLE") });
  for (const token of [env.ADMIN_TOKEN, env.MEMBER_TOKEN, env.DAEMON_TOKEN, A.ann]) {
    env.calls.length = 0;
    const r = await call(env, { op: "index", token });
    assert.ok(r.json.ok === false || r.json.result?.ok === false, r.text.slice(0, 200));
    assert.equal(tallies(env).length, 0, String(token).slice(0, 8));
  }
  env.calls.length = 0;
  assert.equal((await call(env, { op: "index" })).status, 401);
  assert.equal((await call(env, { op: "nosuchop", token: S.ann })).json.reason, "UNKNOWN_OP");
  assert.equal(tallies(env).length, 0);
  /* the re-routed resolve is tallied under the op asked */
  env.calls.length = 0;
  await call(env, { op: "inboxresolve", token: S.ann, method: "POST", body: { id: "K-1", status: "pulled", reason: "r" } });
  assert.deepEqual(opCalls(env).filter((c) => c.route !== "wizardrefusaltally").map((c) => c.route), ["inboxpullfile"]);
  assert.deepEqual(tallies(env).map((c) => c.body), [{ op: "inboxresolve", code: "NO_SUCH_BUNDLE" }]);
  /* a tally the store refuses, is silent on, or throws on leaves the answer as it was */
  for (const fault of [() => new Response("x", { status: 500 }), () => { throw new Error("down"); }]) {
    const w = world({ answer: (c) => (c.route === "wizardrefusaltally" ? fault() : refusing("NO_SUCH_BUNDLE")(c)) });
    const r = await call(w.env, { op: "index", token: w.S.ann });
    assert.deepEqual([r.status, r.json.result.reason], [200, "NO_SUCH_BUNDLE"]);
  }
});
