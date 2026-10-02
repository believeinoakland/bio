/* control-plane R26, R17, R29 (N490; DEC-115; action-plans R37, op-declarations R11): `optionstartpreview`, the preview of
   an option's start, a read that writes nothing, routed through the door's general path to action-plans' own map (its
   route of the same name), stamped `author` (the positional identity, `optionstart`'s expression: `class:<cls>` or
   `class:ai/<tokenId>` for a machine) and `viewer` by the server, none taken from the caller. Driven through
   `makeFetch(hooks)` for every kind of caller with every stamp forged. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O, world, call, opCalls, aik, cred, FORGED, QUERY_STAMPS, BODY_STAMPS, refused } from "./harness.mjs";
const { actionPlansOps } = await import("../../../src/action-plans/index.mjs");

const { OPS, SESSION_OPS } = O;
const OP = "optionstartpreview";
const FORGE = { viewer: FORGED, author: FORGED, proposer: FORGED, principal: FORGED, identity: FORGED, by: FORGED };

function callers() {
  const agent = aik();
  const w = world({ creds: { [agent]: cred({ tokenId: "agent-ann", principal: "member:ann", writes: Object.keys(OPS) }) } });
  return { w, list: [
    { name: "admin", token: w.env.ADMIN_TOKEN, params: {}, ns: "bio", viewer: "class:admin", author: "class:admin" },
    { name: "member", token: w.env.MEMBER_TOKEN, params: {}, ns: "bio", viewer: "class:member", author: "class:member" },
    { name: "probe", token: w.env.PROBE_TOKEN, params: { store: "scratch" }, ns: "scratch", viewer: "class:probe", author: "class:probe" },
    { name: "founder", token: w.S.founder, params: {}, ns: "bio", viewer: "admin", author: "member:admin" },
    { name: "ann", token: w.S.ann, params: {}, ns: "bio", viewer: "member:ann", author: "member:ann" },
    { name: "agent", token: agent, params: {}, ns: "bio", viewer: "member:ann", author: "class:ai/agent-ann" },
  ] };
}

test("R26, R2 (N490; op-declarations R11, action-plans R37): optionstartpreview is declared a read (classes admin, member, probe; in both session sets) and is a route of action-plans' own map, and the door forwards it to that route in the caller's namespace with the caller's own parameters, for every caller its row admits (negative controls: the daemon class is refused, nothing forwarded; a near name no owner serves is `unknown op`)", async () => {
  assert.deepEqual([OPS[OP].classes, OPS[OP].mutating], [["admin", "member", "probe"], false]);
  assert.ok(SESSION_OPS.member.has(OP) && SESSION_OPS.admin.has(OP), "in both session sets");
  assert.ok(Object.keys(actionPlansOps(null, new URL("http://do/"), null)).includes(OP), "a route of action-plans' map");
  const { w, list } = callers();
  for (const c of list) {
    w.env.calls.length = 0;
    const r = await call(w.env, { op: OP, token: c.token, params: { ...c.params, plan: "PLAN-1", option: "o1", kind: "letter" } });
    assert.equal(r.status, 200, `${c.name}: ${r.text.slice(0, 200)}`);
    const inner = opCalls(w.env);
    assert.deepEqual(inner.map((x) => [x.route, x.ns]), [[OP, c.ns]], c.name);
    assert.deepEqual([inner[0].params.plan, inner[0].params.option, inner[0].params.kind], ["PLAN-1", "o1", "letter"], c.name);
    assert.equal(r.json.store, c.ns);
  }
  /* negative controls */
  w.env.calls.length = 0;
  refused(await call(w.env, { op: OP, token: w.env.DAEMON_TOKEN, params: { plan: "PLAN-1" } }), 403, "CLASS_FORBIDDEN", "C-38.2");
  assert.equal(opCalls(w.env).length, 0, "nothing forwarded for the daemon");
  for (const op of ["optionstartpreviews", "optionpreview"]) {
    refused(await call(w.env, { op, token: w.S.ann }), 400, "UNKNOWN_OP", "C-69.1");
    assert.equal(opCalls(w.env).length, 0, op);
  }
});

test("R17, R29 (N490; op-declarations R11): optionstartpreview is stamped author (the positional identity, optionstart's expression) and viewer from the credential, whatever the caller sent in the query or the body, for every caller its row admits; the caller's copies never reach the store, and no other stamp is set (negative control: action-plans' `plan` read carries no author)", async () => {
  const { w, list } = callers();
  let driven = 0;
  for (const c of list) for (const method of ["GET", "POST"]) {
    for (const forged of [false, true]) {
      w.env.calls.length = 0;
      const params = forged ? { ...c.params, ...FORGE } : c.params;
      const body = method === "POST" ? (forged ? { ...FORGE, ...Object.fromEntries(BODY_STAMPS.map((k) => [k, FORGED])), plan: "P" } : { plan: "P" }) : undefined;
      await call(w.env, { op: OP, token: c.token, params, method, body });
      const [inner] = opCalls(w.env);
      const where = `${c.name} ${method}${forged ? " (forged)" : ""}`;
      assert.ok(inner && inner.route === OP, where);
      assert.deepEqual([inner.params.author, inner.params.viewer], [c.author, c.viewer], where);
      for (const k of QUERY_STAMPS) assert.notEqual(inner.params[k], FORGED, `${where}: ?${k}`);
      if (!forged) for (const k of [...QUERY_STAMPS, "proposer", "principal"])
        if (!["author", "viewer"].includes(k)) assert.equal(inner.params[k] ?? null, null, `${where}: ?${k} is not this op's stamp`);
      if (body) {
        for (const k of BODY_STAMPS) assert.notEqual(inner.body?.[k], FORGED, `${where}: #${k}`);
        assert.equal(inner.body.plan, "P", `${where}: the body reaches the route`);
      }
      /* the stamps it is answered with are the ones optionstart, the act it previews, is stamped with */
      w.env.calls.length = 0;
      await call(w.env, { op: "optionstart", token: c.token, params, method: "POST", body: { plan: "P" } });
      const [act] = opCalls(w.env);
      assert.deepEqual([act.params.author, act.params.viewer], [inner.params.author, inner.params.viewer], `${where}: as optionstart`);
      driven++;
    }
  }
  assert.equal(driven, 24);
  /* negative control: a read of the same module carries no author */
  w.env.calls.length = 0;
  await call(w.env, { op: "plan", token: w.S.ann, params: { id: "P", author: FORGED } });
  assert.equal("author" in opCalls(w.env)[0].params, false);
});
