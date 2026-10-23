/* control-plane: the Worker entry's routing and namespaces (R1–R6). Driven through `makeFetch(hooks)` with a fake env. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { M, O, world, call, opCalls, defaultHooks, refused } from "./harness.mjs";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const { OPS } = O;
const PUBLIC = Object.keys(OPS).filter((k) => OPS[k].classes === null);


test("R1: routing: OPTIONS answers 204 with access-control-allow-origin *, /version answers VERSION or 0.0.0 as plain text", async () => {
  const { env } = world();
  const o = await call(env, { method: "OPTIONS", path: "/api", op: "index" });
  assert.equal(o.status, 204);
  assert.equal(o.headers.get("access-control-allow-origin"), "*");
  assert.equal(o.text, "");
  for (const p of ["/version", "/version/"]) {
    const v = await call(env, { path: p });
    assert.equal(v.status, 200);
    assert.match(v.headers.get("content-type"), /^text\/plain/);
    assert.equal(v.text.trim(), "9.8.7");
  }
  const unset = world({ omit: ["VERSION"] });
  assert.equal((await call(unset.env, { path: "/version" })).text.trim(), "0.0.0");
  /* none of these asks the store anything */
  assert.equal(env.calls.length, 0);
});

test("R109 (T51-123; K3807, K3814, K3835; amends R1, R104): the signing page is not served: `/sign` and `/sign/` answer as any unknown address does (R104's page, 404, no-store, the page policy), `/api/sign` and `/?op=sign` answer UNKNOWN_OP as JSON (R2), the deleted files are found nowhere in this module's paths; controls: `/version` and `/app` answer as before, an address under `/app/` that begins with `sign` is the interface's page", async () => {
  const { env } = world();
  /* the interface page is served under the hash of its one external script (fix round 3, C15; answer-envelope R6), no nonce */
  const hashed = (r) => /script-src 'self' 'sha256-[A-Za-z0-9+/]{43}='/.test(r.headers.get("content-security-policy") || "");
  const strip = (r) => r.text;
  const unknown = await call(env, { path: "/nonesuch" });
  assert.equal(unknown.status, 404);
  const app = await call(env, { path: "/app" });
  assert.equal(app.status, 200);
  for (const path of ["/sign", "/sign/"]) {
    const r = await call(env, { path });
    assert.equal(r.status, 404, path);
    assert.match(r.headers.get("content-type"), /^text\/html/, path);
    assert.equal(r.headers.get("cache-control"), "no-store", path);
    assert.ok(hashed(r), `${path}: the page policy and its script's hash`);
    assert.equal(strip(r), strip(unknown), `${path}: the page any unknown address draws`);
    assert.equal(strip(r), strip(app), `${path}: the interface's own page`);
    assert.equal(/<title>[^<]*signing keys/i.test(r.text), false, `${path}: no signing page`);
  }
  for (const asked of [{ path: "/api/sign" }, { path: "/", op: "sign" }, { path: "/sign", op: "sign" }]) {
    refused(await call(env, asked), 400, "UNKNOWN_OP", "C-69.1");
  }
  assert.equal(env.calls.length, 0);
  /* the deleted files are found nowhere in this module's paths */
  const src = (rel) => fileURLToPath(new URL(`../../../src/${rel}`, import.meta.url));
  for (const rel of ["signpage.mjs", "sign-release.html"]) assert.equal(existsSync(src(rel)), false, rel);
  assert.equal(existsSync(fileURLToPath(new URL("../../../scripts/embed-signpage.mjs", import.meta.url))), false);
  /* controls */
  assert.equal((await call(env, { path: "/version" })).text.trim(), "9.8.7");
  assert.equal((await call(env, { path: "/app" })).status, 200);
  for (const path of ["/app/sign", "/app/signature/x"]) {
    const r = await call(env, { path });
    assert.equal(r.status, 200, path);
    assert.equal(strip(r), strip(app), path);
  }
});

test("R1, R82 (T47; N1002): GET / with no op answers interface-shell's page (`interfacePage` over the screen modules' screens, the page `/app` answers), text/html, cache-control: no-store, under the page policy, whatever namespace it names (R1's gate first) and with no store asked; no route serves the setup page (control: none of setupPage's text)", async () => {
  const strip = (html) => html;
  const { env: appEnv } = world();
  const app = await call(appEnv, { path: "/app" });
  assert.equal(app.status, 200);
  /* the setup page's own title, as it was served at `/` before T47 (R82) */
  const marker = "<title>Your accountability record</title>";
  for (const params of [{}, { store: "bio" }, { store: "scratch" }]) {
    const { env } = world({ group: { ok: true, group: "grp-rivertown" } });
    const log = [];
    const r = await call(env, { path: "/", params, hooks: defaultHooks(log) });
    assert.equal(r.status, 200);
    assert.match(r.headers.get("content-type"), /^text\/html/);
    assert.equal(r.headers.get("cache-control"), "no-store");
    assert.match(r.headers.get("content-security-policy") || "", /script-src 'self' 'sha256-[A-Za-z0-9+/]{43}='/);
    assert.doesNotMatch(r.headers.get("content-security-policy") || "", /nonce/);
    assert.match(r.text, /^<!doctype html>/i);
    assert.equal(strip(r.text), strip(app.text), "the interface's page, as /app answers it");
    /* control: the setup page is served by no route, and nothing of the record is read for the page */
    assert.equal(r.text.includes(marker), false);
    assert.equal(r.text.includes("grp-rivertown"), false);
    assert.deepEqual(log, []);
    assert.equal(env.calls.length, 0);
  }
  /* R1's gate applies first: nothing is read */
  const { env } = world();
  refused(await call(env, { path: "/", params: { store: "elsewhere" } }), 400, "NAMESPACE_UNKNOWN", "C-78.1");
  assert.equal(env.calls.length, 0);
  /* an op parameter is not the page */
  assert.equal((await call(env, { path: "/", op: "index", token: env.ADMIN_TOKEN })).json.store, "bio");
  /* control-plane R59 (admission R20, K2166): the same request with its credential in the address is the API's refusal,
     CREDENTIAL_IN_ADDRESS, not the page, and nothing is read */
  env.calls.length = 0;
  const inAddress = await call(env, { path: "/", params: { op: "index", token: env.ADMIN_TOKEN } });
  refused(inAddress, 400, "CREDENTIAL_IN_ADDRESS", "C-38.10");
  assert.equal("deprecated" in inAddress.json, false);
  assert.equal(env.calls.length, 0);
});

test("R2: the op is `op`, else the path after /api/ (or /), else selftest; an op with no spec is refused 400 UNKNOWN_OP (C-69.1) with error \"unknown op\" first after ok", async () => {
  const { env } = world();
  const t = env.ADMIN_TOKEN;
  const route = async (req) => { env.calls.length = 0; const r = await call(env, { token: t, ...req }); return [r.status, opCalls(env).map((c) => c.route)]; };
  assert.deepEqual(await route({ op: "index", path: "/api/list" }), [200, ["index"]]);
  assert.deepEqual(await route({ path: "/api/list" }), [200, ["list"]]);
  assert.deepEqual(await route({ path: "/list" }), [200, ["list"]]);
  assert.deepEqual(await route({ path: "/api" }), [200, ["selftest"]]);
  assert.deepEqual(await route({ path: "/api/" }), [200, ["selftest"]]);
  assert.deepEqual(await route({ path: "/", method: "POST", body: {} }), [200, ["selftest"]]);
  for (const bad of ["nosuchop", "INDEX", "index ", "selftest2", "__proto__", "constructor", "toString", "hasOwnProperty"]) {
    env.calls.length = 0;
    assert.equal((await call(env, { op: bad, token: t })).json.op, bad);
    for (const r of [await call(env, { op: bad, token: t }), await call(env, { op: bad }),
                     await call(env, { path: `/api/${encodeURIComponent(bad)}` })]) {
      refused(r, 400, "UNKNOWN_OP", "C-69.1");
      assert.deepEqual(Object.keys(r.json).slice(0, 2), ["ok", "error"]);
      assert.equal(r.json.error, "unknown op");
    }
    assert.equal(env.calls.length, 0, "nothing is read for an unknown op");
  }
  /* negative control: a declared op is admitted */
  assert.equal((await call(env, { op: "index", token: t })).status, 200);
});

test("R2: an op with a spec is answered by the handler its module provides (the hooks), or else forwarded to the store's route of that name", async () => {
  const { env } = world();
  const log = [];
  const hooks = {
    publicOp: async (c) => { log.push(["public", c.op]); return M.json({ ok: true, by: "publicOp", op: c.op }); },
    gatedOp: async (c) => { log.push(["gated", c.op]); return c.op === "links" ? M.json({ ok: true, by: "gatedOp" }) : undefined; },
  };
  const served = await call(env, { op: "links", token: env.ADMIN_TOKEN, hooks });
  assert.equal(served.json.by, "gatedOp");
  assert.equal(opCalls(env).length, 0, "a hook-served op is not forwarded");
  const fwd = await call(env, { op: "index", token: env.ADMIN_TOKEN, hooks });
  assert.equal(fwd.json.result.echo, "index");
  assert.deepEqual(opCalls(env).map((c) => c.route), ["index"]);
  const pub = await call(env, { op: "knock", hooks, method: "POST", body: {} });
  assert.equal(pub.json.by, "publicOp");
  assert.deepEqual(log, [["gated", "links"], ["gated", "index"], ["public", "knock"]]);
});

test("R2, R17 (N321): op=projectstage is declared and forwarded to the store's route of that name (publication R44), with `viewer` stamped from the caller and the caller's own viewer discarded; without a credential it is refused", async () => {
  assert.deepEqual(OPS.projectstage, { classes: ["admin", "member", "probe"], mutating: false });
  const { env, S, A } = world();
  const cases = [
    [S.ann, {}, "member:ann", "bio"], [S.founder, {}, "admin", "bio"], [env.ADMIN_TOKEN, {}, "class:admin", "bio"],
    [env.PROBE_TOKEN, { store: "scratch" }, "class:probe", "scratch"],
    [A.ann, {}, "member:ann", "bio"],
  ];
  for (const [token, extra, viewer, ns] of cases) {
    env.calls.length = 0;
    const r = await call(env, { op: "projectstage", token, params: { project: "prj-1", viewer: "member:forged", ...extra } });
    assert.equal(r.status, 200, r.text);
    assert.equal(r.json.store, ns);
    const inner = opCalls(env);
    assert.equal(inner.length, 1);
    assert.equal(inner[0].route, "projectstage");
    assert.equal(inner[0].ns, ns);
    assert.equal(inner[0].params.project, "prj-1");
    assert.equal(inner[0].params.viewer, viewer, `the stamped viewer for ${viewer}`);
  }
  /* negative control: the daemon class is not among the op's classes, and no credential is no class */
  refused(await call(env, { op: "projectstage", token: env.DAEMON_TOKEN, params: { project: "prj-1" } }), 403, "CLASS_FORBIDDEN", "C-38.2");
  env.calls.length = 0;
  refused(await call(env, { op: "projectstage", params: { project: "prj-1" } }), 401, "NOT_AUTHENTICATED", "C-38.1");
  assert.equal(opCalls(env).length, 0);
});
