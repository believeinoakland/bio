/* answer-envelope R6, through control-plane's door (was control-plane R51; DEC-122 (3); N528; F17, K1881; K2037 (a)): every `text/html` response the plane serves — the signer page, the setup page,
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
  ["'self'", "'none'", "'unsafe-inline'", "data:"].includes(s) || /^'nonce-[A-Za-z0-9+/=]+'$/.test(s));
function assertOwnOrigin(header, where) {
  assert.equal(typeof header, "string", `${where}: no policy`);
  const p = parse(header);
  for (const d of ["script-src", "style-src", "font-src", "img-src", "connect-src", "frame-src", "worker-src",
                   "media-src", "object-src", "manifest-src"])
    assert.ok(ownOnly(sourcesFor(p, d)), `${where}: ${d} = ${sourcesFor(p, d)}`);
  /* nothing is sent elsewhere: a form posts only here, and no <base> can redirect relative addresses */
  assert.ok(ownOnly(p["form-action"]), `${where}: form-action`);
  assert.ok(ownOnly(p["base-uri"]), `${where}: base-uri`);
  /* F17: a script runs only by this response's nonce — no 'unsafe-inline', 'unsafe-eval', 'self' or host in script-src */
  const scripts = p["script-src"];
  assert.ok(Array.isArray(scripts) && scripts.length === 1 && /^'nonce-[A-Za-z0-9+/=]{22,}'$/.test(scripts[0]), `${where}: script-src ${scripts}`);
  return scripts[0].slice(7, -1);
}

test("R51 (answer-envelope R6): the signer page and the setup page (bio's and scratch's) are served with a policy that admits no other origin for any script, style, font, image, connection, frame or worker, posts forms only here and fixes the base (negative control: a policy naming another origin is caught by the judge)", async () => {
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

test("R51 (answer-envelope R6): an HTML page a module's hook answers through the door carries the same policy, public or gated, whatever its status; a JSON answer, the version text and the preflight carry none", async () => {
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

test("R51 (answer-envelope R6; F17, K1881): each HTML route fetched twice carries two different nonces, at least 128 bits each, and every script element of each body carries its own response's nonce (negative control: a body's script without it is seen)", async () => {
  const { env } = world();
  const SCRIPT = /<script\b[^>]*>/gi;
  for (const [path, params] of [["/sign", {}], ["/", {}], ["/", { store: "scratch" }]]) {
    const seen = [];
    for (let i = 0; i < 2; i++) {
      const r = await call(env, { path, params });
      const nonce = assertOwnOrigin(r.headers.get("content-security-policy"), path);
      assert.ok(Buffer.from(nonce, "base64").length >= 16, nonce);
      const tags = r.text.match(SCRIPT) || [];
      assert.ok(tags.length > 0, `${path}: the page has script elements`);
      for (const t of tags) assert.ok(t.includes(`nonce="${nonce}"`), `${path}: ${t.slice(0, 80)}`);
      assert.equal(r.text.includes("__CSP_NONCE__"), false, `${path}: the slot is filled`);
      seen.push(nonce);
    }
    assert.notEqual(seen[0], seen[1], `${path}: a fresh nonce per response`);
  }
  assert.equal("<script>x</script>".match(SCRIPT).every((t) => t.includes('nonce="')), false);
});
