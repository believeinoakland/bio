/* control-plane R75 (T46; N897 (1); DEC-122 (3); N559): the member interface's routes, driven through `makeFetch(hooks)` over
   the harness's store: `GET /app` and `/app/<path>` answer interface-shell's page over the four screen modules' screens,
   under answer-envelope's page policy with a fresh nonce; `GET /app/assets/<name>` answers interface-assets' files. The
   end-to-end suite over Miniflare and the real plane is `t46-e2e.test.mjs`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, call, refused } from "./harness.mjs";
import { appPage } from "../../../src/control-plane/app.mjs";
import { interfacePage } from "../../../src/interface-shell/index.mjs";
import { ASSET_FILES } from "../../../src/interface-assets/index.mjs";
import { SCREENS as S1 } from "../../../src/screens-settings/index.mjs";
import { SCREENS as S2 } from "../../../src/screens-intake/index.mjs";
import { SCREENS as S3 } from "../../../src/screens-daily/index.mjs";
import { SCREENS as S4 } from "../../../src/screens-inquiry/index.mjs";

const SCRIPT = /<script\b[^>]*>/gi;
const NONCE = /^'nonce-([A-Za-z0-9+/=]{22,})'$/;
const policyNonce = (r) => {
  const csp = r.headers.get("content-security-policy") || "";
  const d = Object.fromEntries(csp.split(";").map((x) => x.trim()).filter(Boolean).map((x) => { const [n, ...v] = x.split(/\s+/); return [n, v]; }));
  for (const k of ["default-src", "style-src", "font-src", "img-src", "connect-src"])
    assert.ok((d[k] ?? d["default-src"]).every((s) => ["'self'", "'unsafe-inline'", "data:", "'none'", ...(k === "img-src" ? ["blob:"] : [])]
      .includes(s)), `${k}: ${d[k]}`);
  /* (T47; K3164; answer-envelope R6) `blob:` in `img-src` alone */
  for (const [k, v] of Object.entries(d)) if (k !== "img-src") assert.equal(v.includes("blob:"), false, `${k} admits blob:`);
  assert.equal(d["script-src"]?.length, 1);
  return d["script-src"][0].match(NONCE)[1];
};

test("R75 (T46; N897 (1)): `GET /app` and `GET /app/<path>` answer interface-shell's page over the four screen modules' screens, `text/html`, `cache-control: no-store`, under the page policy with a nonce fresh per response that every script element carries; the same page for every path below `/app` (the routing is the page's own); no store is asked and no credential read, a presented session changing nothing", async () => {
  const { env, S } = world();
  const want = interfacePage([...S1, ...S2, ...S3, ...S4]);
  const strip = (html) => html.replace(/ nonce="[^"]*"/g, "").replace(/'nonce-[^']*'/g, "");
  const nonces = new Set();
  for (const [path, headers] of [["/app", {}], ["/app/", {}], ["/app/home", {}], ["/app/project/PRJ-1", {}], ["/app/no-such-screen", {}],
                                 ["/app", { authorization: `Bearer ${S.ann}` }]]) {
    env.calls.length = 0;
    const r = await call(env, { path, headers });
    assert.equal(r.status, 200, `${path}: ${r.text.slice(0, 200)}`);
    assert.match(r.headers.get("content-type"), /^text\/html/);
    assert.equal(r.headers.get("cache-control"), "no-store");
    const nonce = policyNonce(r);
    assert.ok(Buffer.from(nonce, "base64").length >= 16);
    const tags = r.text.match(SCRIPT) || [];
    assert.ok(tags.length > 0);
    for (const t of tags) assert.ok(t.includes(`nonce="${nonce}"`), t);
    assert.equal(r.text.includes("__CSP_NONCE__"), false);
    assert.equal(strip(r.text), strip(want), `${path}: interface-shell's page over the four modules' screens`);
    assert.ok(r.text.includes(`href="/app/assets/civicsmith.css"`));
    assert.deepEqual(env.calls, [], `${path}: no store asked, no credential read`);
    nonces.add(nonce);
  }
  assert.equal(nonces.size, 6, "a fresh nonce per response");
});

test("R75: `/app` takes the namespace and address gates `/` takes (admission R1, R20): an unknown `store=` is NAMESPACE_UNKNOWN (C-78.1) and a credential in the address CREDENTIAL_IN_ADDRESS (C-38.10), on the page and on an asset, nothing served; `store=scratch` serves the same page (negative control); a POST to `/app` is no page (it reaches the op door, an op named `app` there being unknown)", async () => {
  const { env } = world();
  for (const path of ["/app", "/app/home", "/app/assets/icons.svg"]) {
    refused(await call(env, { path, params: { store: "elsewhere" } }), 400, "NAMESPACE_UNKNOWN", "C-78.1");
    refused(await call(env, { path, params: { token: env.ADMIN_TOKEN } }), 400, "CREDENTIAL_IN_ADDRESS", "C-38.10");
    const ok = await call(env, { path, params: { store: "scratch" } });
    assert.equal(ok.status, 200, path);
  }
  const posted = await call(env, { path: "/app", method: "POST", body: {} });
  assert.notEqual(posted.headers.get("content-type")?.startsWith("text/html"), true);
  assert.equal(posted.json.ok, false);
});

test("R75: `GET /app/assets/<name>` answers every file of interface-assets' map with its content type and its bytes (a face's decoded from base64), `cache-control: no-cache` and an `etag` of the plane's version and the name, answered 304 with no body when the browser presents that etag and the version is unchanged, and the file again once the version moves; any other name is 404 with nothing of the record's (negative controls: a name not in the map, a near name, a path out of the folder)", async () => {
  const { env } = world();
  const names = Object.keys(ASSET_FILES);
  assert.ok(names.length >= 20 && names.some((n) => n.startsWith("fonts/")));
  for (const name of names) {
    const file = ASSET_FILES[name];
    const r = await fetchRaw(env, `/app/assets/${name}`);
    assert.equal(r.status, 200, name);
    assert.equal(r.headers.get("content-type"), file.type, name);
    assert.equal(r.headers.get("cache-control"), "no-cache");
    const bytes = new Uint8Array(await r.arrayBuffer());
    const want = file.encoding === "base64" ? Uint8Array.from(Buffer.from(file.body, "base64")) : new TextEncoder().encode(file.body);
    assert.deepEqual(bytes, want, name);
    const etag = r.headers.get("etag");
    assert.equal(etag, `"${env.VERSION}:${name}"`);
    const again = await fetchRaw(env, `/app/assets/${name}`, { "if-none-match": etag });
    assert.deepEqual([again.status, (await again.arrayBuffer()).byteLength], [304, 0], name);
    const moved = await fetchRaw({ ...env, VERSION: "99.0.0" }, `/app/assets/${name}`, { "if-none-match": etag });
    assert.equal(moved.status, 200, `${name}: a new version is fetched again`);
  }
  for (const path of ["/app/assets/nope.css", "/app/assets/civicsmith.CSS", "/app/assets/", "/app/assets/fonts/", "/app/assets/..%2fversion", "/app/assets/fonts%2f..%2f..%2fversion"]) {
    env.calls.length = 0;
    const r = await fetchRaw(env, path);
    assert.equal(r.status, 404, path);
    assert.deepEqual(env.calls, [], path);
  }
});

test("R75 (R25): a page that cannot be built (`interfacePage` throws for a broken screen) is never served: the throw leaves `appPage` (negative control: the real screens build)", () => {
  const broken = [{ id: "no-such-screen", reads: () => ({}), render: () => "", acts: [], words: [] }];
  assert.throws(() => appPage(new Request("https://x/app"), { interfacePage, screens: broken }));
  assert.equal(appPage(new Request("https://x/app"), { interfacePage, screens: [...S1, ...S2, ...S3, ...S4] }).status, 200);
});

/* The harness's `call` reads every answer as text; the asset test reads bytes and its own headers. */
async function fetchRaw(env, path, headers = {}) {
  const { makeFetch } = await import("../../../src/control-plane/index.mjs");
  return makeFetch({})(new Request(`https://plane.example${path}`, { headers }), env);
}
