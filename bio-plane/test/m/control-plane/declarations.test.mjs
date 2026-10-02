/* control-plane: the door over op-declarations' tables (R2; op-declarations R6, K727). What each op is — its spec, the
   act lists, the session sets, the act gate — is op-declarations' (its R1–R6) and tested there; this suite keeps the one
   arm that is the door's: every op with a spec is answered by this module, by a module's hook, or by the store route of
   its name. The store's door (R26, R27) is `dispatch.test.mjs`'s. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, defaultHooks, cred, aik } from "./harness.mjs";

const { OPS } = O;

test("R2 (op-declarations R6): no spec is without a handler or a store route — with every module hook declining, each op with a spec is answered by this module, by a hook, or forwarded to the store route of its name for some caller", async () => {
  const keys = Object.keys(OPS);
  assert.ok(keys.length > 250);
  /* no spec without a handler or a route: with every module hook declining, each op is answered by this module, by a
     hook, or forwarded to the store route of that name for some caller */
  const wide = aik();
  const { env, S } = world({ creds: { [wide]: cred({ writes: keys }) } });
  const log = [];
  const hooks = defaultHooks(log);
  /* `confirm` names the namespace each caller resolves to, R39's gate before op=purge reaches the store */
  const callers = [[env.ADMIN_TOKEN, { confirm: "bio" }], [env.PROBE_TOKEN, { store: "scratch", confirm: "scratch" }], [env.DAEMON_TOKEN, {}], [S.founder, {}], [S.ann, {}], [undefined, {}]];
  const RENAMED = { inbox: "inboxlist", publish: "publishcase", inboxpull: "inboxpullfile" };
  for (const op of keys) {
    let reached = false;
    for (const [token, params] of callers) {
      env.calls.length = 0; log.length = 0;
      const body = op === "claim" ? { bootstrapToken: env.ADMIN_TOKEN, password: "pw" } : {};
      const r = await call(env, { op, token, params, hooks, method: "POST", body });
      const routes = opCalls(env).map((c) => c.route);
      /* R45: a registered public read is answered by the store's `publicread` route under its own name */
      const publicRead = opCalls(env).some((c) => c.route === "publicread" && c.params.name === op);
      if (routes.includes(RENAMED[op] ?? op) || publicRead || log.some((l) => l.kind === "public" && l.op === op) || (op === "whoami" && r.json.ok)) {
        reached = true; break;
      }
    }
    assert.ok(reached, `${op}: no handler and no store route answered it`);
  }
});
