/* control-plane R52 (DEC-101 (3); N534; op-declarations R16; case-import R17): `importwatch` and `importunwatch`, routed
   through `case-import`'s own map with the stamps op-declarations R16 declares (`by`, the positional identity, and
   `viewer`), none taken from the caller, each refused to every caller not arriving by a member's session. Driven through
   `makeFetch(hooks)`, R49's form (`r49-routes.test.mjs`); the store's door through `dispatch` over case-import's own map. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, aik, cred, refused, FORGED, QUERY_STAMPS, BODY_STAMPS } from "./harness.mjs";
const { caseImportOps } = await import("../../../src/case-import/index.mjs");
const D = await import("../../../src/control-plane/dispatch.mjs");

const { OPS, NEEDS } = O;
const WATCH = ["importwatch", "importunwatch"];
const STAMP_NAMES = [...new Set([...QUERY_STAMPS, "proposedBy", "proposer", "principal", "owner", "member", "mintedBy"])];
const sessions = (w) => [
  { name: "founder", token: w.S.founder, viewer: "admin", identity: "member:admin", cls: "admin" },
  { name: "ann", token: w.S.ann, viewer: "member:ann", identity: "member:ann", cls: "member" },
];

test("R52, R2, R26: importwatch and importunwatch are declared session-only mutating acts needing contribute, are routes of case-import's own map, and are forwarded by the door's general path to that route in bio with the caller's own parameters and body, for a member's session and the founder's (negative control: a watch op case-import does not serve is unknown, nothing forwarded)", async () => {
  const map = caseImportOps(null, new URL("http://do/"), null);
  for (const op of WATCH) {
    assert.ok(Object.hasOwn(OPS, op), `${op} is declared`);
    assert.deepEqual([OPS[op].classes, OPS[op].machineClasses, OPS[op].mutating], [["admin", "member"], [], true], op);
    assert.equal(NEEDS[op], "contribute", op);
    assert.equal(typeof map[op], "function", `${op}: a route of case-import's map`);
    assert.equal(Object.hasOwn(D.controlPlaneRoutes({}, new URL("http://do/"), null), op), false, `${op}: no route of this module's`);
  }
  const w = world();
  for (const c of sessions(w)) for (const op of WATCH) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op, token: c.token, params: { import: "IMP-1" }, method: "POST",
                                  body: { publisher: "https://other.example/api" } });
    assert.equal(r.status, 200, `${op}/${c.name}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(w.env);
    assert.deepEqual(inner.map((x) => [x.route, x.ns]), [[op, "bio"]], `${op}/${c.name}`);
    assert.equal(inner[0].params.import, "IMP-1");
    assert.deepEqual(inner[0].body, { publisher: "https://other.example/api" });
    assert.deepEqual([r.json.store, r.json.tokenClass], ["bio", c.cls]);
  }
  for (const op of ["importwatchall", "importrewatch"]) {
    w.env.calls.length = 0;
    refused(await call(w.env, { op, token: w.S.ann, method: "POST", body: {} }), 400, "UNKNOWN_OP", "C-69.1");
    assert.equal(w.env.calls.length, 0, op);
  }
});

test("R52, R17, R29: each watch act's `by` (the positional identity) and `viewer` are the server's from the session, whatever the caller sent in the query or the body; every other stamp of the caller's is deleted and none is set (negative control: the unforged call is stamped the same)", async () => {
  const w = world();
  const forgedQ = Object.fromEntries(STAMP_NAMES.map((k) => [k, FORGED]));
  const forgedB = Object.fromEntries([...STAMP_NAMES, ...BODY_STAMPS].map((k) => [k, FORGED]));
  let checked = 0;
  for (const c of sessions(w)) for (const op of WATCH)
    for (const [params, body] of [[{}, { note: "kept" }], [forgedQ, { note: "kept", ...forgedB }]]) {
      w.env.calls.length = 0;
      await call(w.env, { op, token: c.token, params, method: "POST", body });
      const [inner] = opCalls(w.env);
      const where = `${op}/${c.name}${params === forgedQ ? " (forged)" : ""}`;
      assert.deepEqual([inner.params.by, inner.params.viewer], [c.identity, c.viewer], where);
      checked++;
      for (const k of STAMP_NAMES) if (k !== "by" && k !== "viewer") {
        if (QUERY_STAMPS.includes(k)) assert.notEqual(inner.params[k], FORGED, `${where}: ?${k} carries the caller's value`);
        if (params !== forgedQ) assert.equal(inner.params[k] ?? null, null, `${where}: ?${k} is not this op's stamp`);
      }
      for (const k of BODY_STAMPS) assert.notEqual(inner.body?.[k], FORGED, `${where}: #${k}`);
      assert.equal(inner.body.note, "kept", where);
    }
  assert.equal(checked, 2 * 2 * 2);
});

test("R52, R28: each watch act is refused to every caller not arriving by a member's session — every binding class CLASS_FORBIDDEN, an agent credential declaring every write AI_BEYOND_TASK_SCOPE, no credential NOT_AUTHENTICATED — and nothing is forwarded; negative control: a member's session reaches each", async () => {
  const wide = aik();
  const { env, S } = world({ creds: { [wide]: cred({ tokenId: "agent-wide", writes: Object.keys(OPS) }) } });
  for (const op of WATCH) {
    const at = { op, params: { import: "IMP-1" }, method: "POST", body: { publisher: "https://other.example/api" } };
    for (const [token, store] of [[env.ADMIN_TOKEN], [env.MEMBER_TOKEN], [env.PROBE_TOKEN, "scratch"], [env.DAEMON_TOKEN]]) {
      env.calls.length = 0;
      refused(await call(env, { ...at, token, params: { ...at.params, ...(store ? { store } : {}) } }), 403, "CLASS_FORBIDDEN", "C-38.2");
      assert.equal(opCalls(env).length, 0, `${op}: forwarded for a binding class`);
    }
    env.calls.length = 0;
    refused(await call(env, { ...at, token: wide }), 403, "AI_BEYOND_TASK_SCOPE", "C-29.6");
    assert.equal(opCalls(env).length, 0, `${op}: forwarded for an agent`);
    env.calls.length = 0;
    assert.equal((await call(env, { ...at })).status, 401, `${op}: no credential`);
    assert.equal(opCalls(env).length, 0);
    env.calls.length = 0;
    assert.equal((await call(env, { ...at, token: S.ann })).status, 200, op);
    assert.deepEqual(opCalls(env).map((x) => x.route), [op]);
  }
});
