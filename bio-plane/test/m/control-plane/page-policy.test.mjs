/* answer-envelope R6, through control-plane's door (was control-plane R51; DEC-122 (3); N528; F17, K1881; K2037 (a)): every `text/html` response the plane serves — the signer page, the interface page at `/` (R82; the setup page before T47),
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
/* A source admits only this origin when it is a keyword other than a wildcard, or `data:` (no network); (T47; K3164;
   answer-envelope R6) `blob:` too, in `img-src` alone (a member's own file, previewed before it is sent). */
const ownOnly = (sources, blob = false) => Array.isArray(sources) && sources.length > 0 && sources.every((s) =>
  ["'self'", "'none'", "'unsafe-inline'", "data:", ...(blob ? ["blob:"] : [])].includes(s) || /^'nonce-[A-Za-z0-9+/=]+'$/.test(s)
  || /^'sha256-[A-Za-z0-9+/]{43}='$/.test(s));
function assertOwnOrigin(header, where) {
  assert.equal(typeof header, "string", `${where}: no policy`);
  const p = parse(header);
  for (const d of ["script-src", "style-src", "font-src", "img-src", "connect-src", "frame-src", "worker-src",
                   "media-src", "object-src", "manifest-src"])
    assert.ok(ownOnly(sourcesFor(p, d), d === "img-src"), `${where}: ${d} = ${sourcesFor(p, d)}`);
  /* `blob:` nowhere but `img-src` (control) */
  for (const [d, v] of Object.entries(p)) if (d !== "img-src") assert.equal(v.includes("blob:"), false, `${where}: ${d} admits blob:`);
  /* nothing is sent elsewhere: a form posts only here, and no <base> can redirect relative addresses */
  assert.ok(ownOnly(p["form-action"]), `${where}: form-action`);
  assert.ok(ownOnly(p["base-uri"]), `${where}: base-uri`);
  /* F17: a script runs only by this response's nonce — no 'unsafe-inline', 'unsafe-eval', 'self' or host in script-src — or, for the
     interface page (fix round 3, C15; answer-envelope R6), only by the hash of its one external script, from this origin, and no nonce */
  const scripts = p["script-src"];
  if (Array.isArray(scripts) && scripts[0] === "'self'") {
    assert.ok(scripts.length >= 2 && scripts.slice(1).every((x) => /^'sha256-[A-Za-z0-9+/]{43}='$/.test(x)), `${where}: script-src ${scripts}`);
    return { hashes: scripts.slice(1) };
  }
  assert.ok(Array.isArray(scripts) && scripts.length === 1 && /^'nonce-[A-Za-z0-9+/=]{22,}'$/.test(scripts[0]), `${where}: script-src ${scripts}`);
  return { nonce: scripts[0].slice(7, -1) };
}

test("R51 (answer-envelope R6): the page at `/` (bio's and scratch's; the interface page since T47, R82) and the page an unknown address draws (`/sign` since T51, R109, R104; 404) are served with a policy that admits no other origin for any script, style, font, image, connection, frame or worker, posts forms only here and fixes the base (negative control: a policy naming another origin is caught by the judge)", async () => {
  const { env } = world();
  for (const [path, params, status] of [["/sign", {}, 404], ["/sign/", {}, 404], ["/", {}, 200], ["/", { store: "scratch" }, 200]]) {
    const r = await call(env, { path, params });
    assert.equal(r.status, status, path);
    assert.match(r.headers.get("content-type"), /^text\/html/, path);
    assertOwnOrigin(r.headers.get("content-security-policy"), `${path} ${JSON.stringify(params)}`);
  }
  /* the pages' bytes are unchanged by the policy (the page's no-store kept) */
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

test("R51 (answer-envelope R6; F17, K1881): the interface page at `/` and the page an unknown address draws are served under the hash of their one external script from this origin, with no nonce and no inline script; a page a module's hook answers keeps the nonce rule: two fetches carry two different nonces, at least 128 bits each, and every script element of each body carries its own response's nonce (negative control: a body's script without it is seen)", async () => {
  const { env } = world();
  const SCRIPT = /<script\b[^>]*>/gi;
  for (const [path, params] of [["/sign", {}], ["/", {}], ["/", { store: "scratch" }]]) {
    const seen = [];
    for (let i = 0; i < 2; i++) {
      const r = await call(env, { path, params });
      const { hashes, nonce } = assertOwnOrigin(r.headers.get("content-security-policy"), path);
      assert.equal(nonce, undefined, `${path}: no nonce`);
      assert.equal(hashes.length, 1, `${path}: the script's hash`);
      const tags = r.text.match(SCRIPT) || [];
      assert.equal(tags.length, 1, `${path}: one script element`);
      assert.match(tags[0], /\ssrc="\/app\/shell-[^"]+\.js"/);
      assert.ok(tags[0].includes(`integrity="sha256-${hashes[0].slice(8, -1)}"`), `${path}: the element names the hash the policy does`);
      assert.equal(/\bnonce\b/.test(r.text) || r.text.includes("__CSP_NONCE__"), false, `${path}: no nonce, no slot`);
      seen.push(hashes[0]);
    }
    assert.equal(seen[0], seen[1], `${path}: the same script, the same hash`);
  }
  /* the nonce rule stands for any other page */
  const html = '<!doctype html><script>x</script><script nonce="old">y</script>';
  const hooks = { ...defaultHooks(), async publicOp() { return new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } }); } };
  const seen = [];
  for (let i = 0; i < 2; i++) {
    const r = await call(env, { op: "publishedcase", params: { id: "C-1" }, hooks });
    const { nonce, hashes } = assertOwnOrigin(r.headers.get("content-security-policy"), "hook page");
    assert.equal(hashes, undefined);
    assert.ok(Buffer.from(nonce, "base64").length >= 16, nonce);
    const tags = r.text.match(SCRIPT) || [];
    assert.equal(tags.length, 2);
    for (const t of tags) assert.ok(t.includes(`nonce="${nonce}"`), t.slice(0, 80));
    seen.push(nonce);
  }
  assert.notEqual(seen[0], seen[1], "a fresh nonce per response");
  assert.equal("<script>x</script>".match(SCRIPT).every((t) => t.includes('nonce="')), false);
});
