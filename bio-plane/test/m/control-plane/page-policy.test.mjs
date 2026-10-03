/* control-plane R51 (DEC-122 (3); N528): every `text/html` response the plane serves — the signer page, the setup page,
   and any page a module's hook answers through the door — carries a content security policy under which a browser loads
   no script, style, font, image or connection from another origin and sends nothing elsewhere. The policy is parsed and
   judged directive by directive, never matched as text. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, defaultHooks } from "./harness.mjs";

/* A policy's directives, `{name: [sources]}`. */
const parse = (header) => Object.fromEntries(String(header || "").split(";").map((d) => d.trim()).filter(Boolean)
  .map((d) => { const [name, ...sources] = d.split(/\s+/); return [name.toLowerCase(), sources]; }));
/* The effective sources for a fetch directive (its own, else default-src's). */
const sourcesFor = (p, name) => p[name] ?? p["default-src"];
/* A source admits only this origin when it is a keyword other than a wildcard, or `data:` (no network). */
const ownOnly = (sources) => Array.isArray(sources) && sources.length > 0 && sources.every((s) =>
  ["'self'", "'none'", "'unsafe-inline'", "data:"].includes(s));
function assertOwnOrigin(header, where) {
  assert.equal(typeof header, "string", `${where}: no policy`);
  const p = parse(header);
  for (const d of ["script-src", "style-src", "font-src", "img-src", "connect-src", "frame-src", "worker-src",
                   "media-src", "object-src", "manifest-src"])
    assert.ok(ownOnly(sourcesFor(p, d)), `${where}: ${d} = ${sourcesFor(p, d)}`);
  /* nothing is sent elsewhere: a form posts only here, and no <base> can redirect relative addresses */
  assert.ok(ownOnly(p["form-action"]), `${where}: form-action`);
  assert.ok(ownOnly(p["base-uri"]), `${where}: base-uri`);
}

test("R51: the signer page and the setup page (bio's and scratch's) are served with a policy that admits no other origin for any script, style, font, image, connection, frame or worker, posts forms only here and fixes the base (negative control: a policy naming another origin is caught by the judge)", async () => {
  const { env } = world();
  for (const [path, params] of [["/sign", {}], ["/sign/", {}], ["/", {}], ["/", { store: "scratch" }]]) {
    const r = await call(env, { path, params });
    assert.equal(r.status, 200, path);
    assert.match(r.headers.get("content-type"), /^text\/html/, path);
    assertOwnOrigin(r.headers.get("content-security-policy"), `${path} ${JSON.stringify(params)}`);
  }
  /* the pages' bytes are unchanged by the policy (the setup page's no-store kept) */
  const setup = await call(env, { path: "/" });
  assert.equal(setup.headers.get("cache-control"), "no-store");
  /* negative controls: the judge refuses another origin, a wildcard and a missing directive's fallback to one */
  for (const bad of ["default-src 'self'; script-src https://cdn.example", "default-src *", "default-src 'self' https://x.example",
                     "default-src 'self'; connect-src 'self' wss://x.example", "default-src 'self'"])
    assert.throws(() => assertOwnOrigin(bad, "bad"), undefined, bad);
});

test("R51: an HTML page a module's hook answers through the door carries the same policy, public or gated, whatever its status; a JSON answer, the version text and the preflight carry none", async () => {
  const { env, S } = world();
  const page = (status) => new Response("<!doctype html><p>x</p>", { status, headers: { "content-type": "text/html; charset=utf-8" } });
  const hooks = { ...defaultHooks(), async publicOp() { return page(200); }, async gatedOp(ctx) { return ctx.op === "index" ? page(404) : undefined; } };
  const pub = await call(env, { op: "publishedcase", params: { id: "C-1" }, hooks });
  assert.equal(pub.text, "<!doctype html><p>x</p>");
  assertOwnOrigin(pub.headers.get("content-security-policy"), "public hook");
  const gated = await call(env, { op: "index", token: S.ann, hooks });
  assert.equal(gated.status, 404);
  assertOwnOrigin(gated.headers.get("content-security-policy"), "gated hook");
  for (const r of [await call(env, { op: "whoami", token: S.ann }), await call(env, { path: "/version" }),
                   await call(env, { path: "/api", method: "OPTIONS" })])
    assert.equal(r.headers.get("content-security-policy"), null);
});
