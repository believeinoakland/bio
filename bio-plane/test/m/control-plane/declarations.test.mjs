/* control-plane: the declaration tables (R31, R34) and the store's door (R26, R27, not moved here yet). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, defaultHooks, cred, aik } from "./harness.mjs";
import { decorate, ACTS, CAPTURE_ACTS, PER_ITEM_ACTS } from "../../../src/affordances.mjs";

const { OPS, SESSION_OPS, NEEDS, ACT_GATE, decorateAct, UNATTENDED_BY_DECISION } = O;
const CLASSES = ["admin", "member", "probe", "daemon"];

test("R31: every op spec is well-formed {classes, machineClasses?, mutating}: classes null or a subset of the four binding classes, no row names ai; every op a table names has a spec, and no spec is without a handler or a store route", async () => {
  const keys = Object.keys(OPS);
  assert.ok(keys.length > 250);
  for (const op of keys) {
    const s = OPS[op];
    assert.ok(Object.hasOwn(OPS, op));
    assert.equal(Object.getPrototypeOf(s), Object.prototype, op);
    assert.deepEqual(Object.keys(s).filter((k) => !["classes", "machineClasses", "mutating"].includes(k)), [], op);
    assert.equal(typeof s.mutating, "boolean", op);
    if (s.classes !== null) {
      assert.ok(Array.isArray(s.classes) && s.classes.length > 0, op);
      assert.equal(new Set(s.classes).size, s.classes.length, op);
      for (const c of s.classes) assert.ok(CLASSES.includes(c), `${op}: ${c}`);
    }
    if ("machineClasses" in s) {
      assert.ok(Array.isArray(s.classes) && Array.isArray(s.machineClasses), op);
      for (const c of s.machineClasses) assert.ok(CLASSES.includes(c) && s.classes.includes(c), `${op}: ${c}`);
    }
    assert.ok(!JSON.stringify(s).includes('"ai"'), `${op} names ai`);
  }
  /* every op the other tables name has a spec */
  const named = new Set([...SESSION_OPS.member, ...SESSION_OPS.admin, ...Object.keys(NEEDS), ...Object.keys(UNATTENDED_BY_DECISION),
                         ...M.SCRATCH_ADDRESSING_PUBLIC_OPS]);
  for (const [k, v] of Object.entries(O)) if (Array.isArray(v) && /(_ACTIONS|_READS|_ACTS)$/.test(k)) v.forEach((op) => named.add(op));
  for (const op of named) assert.ok(Object.hasOwn(OPS, op), `${op} has no spec`);
  /* no spec without a handler or a route: with every module hook declining, each op is answered by this module, by a
     hook, or forwarded to the store route of that name for some caller */
  const wide = aik();
  const { env, S } = world({ creds: { [wide]: cred({ writes: keys }) } });
  const log = [];
  const hooks = defaultHooks(log);
  const callers = [[env.ADMIN_TOKEN, {}], [env.PROBE_TOKEN, { store: "scratch" }], [env.DAEMON_TOKEN, {}], [S.founder, {}], [S.ann, {}], [undefined, {}]];
  const RENAMED = { inbox: "inboxlist", publish: "publishcase" };
  for (const op of keys) {
    let reached = false;
    for (const [token, params] of callers) {
      env.calls.length = 0; log.length = 0;
      const body = op === "claim" ? { bootstrapToken: env.ADMIN_TOKEN, password: "pw" } : {};
      const r = await call(env, { op, token, params, hooks, method: "POST", body });
      const routes = opCalls(env).map((c) => c.route);
      if (routes.includes(RENAMED[op] ?? op) || log.some((l) => l.kind === "public" && l.op === op) || (op === "whoami" && r.json.ok)) {
        reached = true; break;
      }
    }
    assert.ok(reached, `${op}: no handler and no store route answered it`);
  }
});

test("R34: ACT_GATE is {needs(id), mode(id)} read from NEEDS and SESSION_OPS for every op and act id; decorateAct(act) is affordances.decorate(act, ACT_GATE)", () => {
  assert.deepEqual(Object.keys(ACT_GATE).sort(), ["mode", "needs"]);
  const ids = [...Object.keys(OPS), ...[...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS].map((a) => a.id), "nosuchop"];
  for (const id of ids) {
    assert.equal(ACT_GATE.needs(id), Object.hasOwn(NEEDS, id) ? (NEEDS[id] ?? null) : null, id);
    assert.equal(ACT_GATE.mode(id), SESSION_OPS.member.has(id) ? "session" : SESSION_OPS.admin.has(id) ? "admin-session" : "machine", id);
  }
  assert.deepEqual(["lease", "governorconfig", "purge", "nosuchop"].map(ACT_GATE.mode), ["session", "admin-session", "machine", "machine"]);
  assert.equal(ACT_GATE.needs("promote"), "contribute");
  assert.equal(ACT_GATE.needs("nosuchop"), null);
  const acts = [...ACTS, ...CAPTURE_ACTS, ...PER_ITEM_ACTS];
  assert.ok(acts.length > 10);
  for (const a of acts) assert.deepEqual(decorateAct(a), decorate(a, ACT_GATE), a.id);
  /* the gate is read at decoration time: a table change shows in the next decoration */
  const a = acts.find((x) => SESSION_OPS.member.has(x.id));
  SESSION_OPS.member.delete(a.id);
  try { assert.equal(decorateAct(a).mode, SESSION_OPS.admin.has(a.id) ? "admin-session" : "machine"); }
  finally { SESSION_OPS.member.add(a.id); }
  assert.equal(decorateAct(a).mode, "session");
});

test.todo("R26 the store's dispatch door: an empty POST body is null, a non-JSON body 400 BAD_JSON, an unserved route "
  + "400 `unknown op: <op>`, answers {ok:true, result}, routes from the modules' own maps (not yet met: the store's "
  + "`dispatch` door has not moved into this module — Store.fetch is still legacy-store's)");

test.todo("R27 a read naming a project (PROJECT_NAMING_READS) with a stamped viewer and a discoverable project is answered "
  + "by membership.existenceAct first (C-70.1), and the reads naming none are listed with the reason (not yet met: the "
  + "store's dispatch door, where this runs, has not moved into this module — Store.fetch is still legacy-store's)");
