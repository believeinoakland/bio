/* control-plane R75 (T46; N897 (1); `draft-T46-interface.md` §4 (3)): THE END-TO-END SUITE. Over Miniflare and the real plane
   (`src/plane/index.mjs`, the Worker the product deploys): `GET /app` and `/app/assets/*` served with the page policy and
   its nonce; (T47; R82, R83) `GET /` answering that same page, and the founder signed in through the plane's real
   `login` by handle, password and device; then the real served `/app` page booted on interface-shell's document stand-in with
   that session, every request it makes answered by the same plane: `home`, `capture` with an upload, `held` and
   `release`, each read back through the real ops. */
import "./register-declared.mjs";
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
const { boot } = await import("../interface-shell/harness.mjs");
const { APP_SCREENS, GUIDE } = await import("./app-screens.mjs");
const { interfaceScript } = await import("../../../src/interface-shell/index.mjs");
const { ASSET_FILES } = await import("../../../src/interface-assets/index.mjs");
const { OPS } = await import("../../../src/op-declarations/index.mjs");

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-e2e-0123456789abcdef", PASSWORD = "the founder's long password";
const ORIGIN = "https://group.example";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-e2e-0123456789abcdef", PROBE_TOKEN: "prb-e2e-0123456789abcdef",
              VERSION: "4.6.0", INSTANCE_NAME: "e2e-town" },
});
after(() => mf.dispose());

/* A request the page makes, sent to the plane as it would leave a browser at the group's address. */
async function toPlane(url, init = {}) {
  const u = new URL(url, ORIGIN);
  let body = init.body;
  if (body instanceof Blob) body = new Uint8Array(await body.arrayBuffer());
  return mf.dispatchFetch(u.href, { method: init.method || "GET", headers: init.headers || {}, ...(body === undefined ? {} : { body }) });
}
/* The shell harness's answer shape (`{status, json}`, or bytes) from a real answer of the plane. */
async function answerOf(res) {
  const type = res.headers.get("content-type") || "";
  if (/json/.test(type)) return { status: res.status, json: await res.json() };
  return { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()), type };
}
/* Every op the door declares, answered by the plane: the booted page's whole world is the real one. */
/* what the plane has finished answering, per op: a request the page has SENT is not yet one the plane has ANSWERED */
const finished = {};
const real = Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => {
  const a = await answerOf(await toPlane(req.url, req.init));
  finished[op] = (finished[op] ?? 0) + 1;
  return a;
}]));
const SCRIPT = /<script\b[^>]*>/gi;

let session = null;

test("R75 end to end (Miniflare, the real plane; fix round 3, C15): `GET /app` and `/app/<path>` serve the page with a policy that names the shell's script by its hash, in place of a nonce; the script is served at the release's address, `immutable`, and hashes to what the policy and the page's `integrity` name; `/app/assets/*` serve every file with its type and bytes, 304 on its etag", async () => {
  const hashes = new Set();
  for (const path of ["/app", "/app/home", "/app/held"]) {
    const r = await mf.dispatchFetch(`${ORIGIN}${path}`);
    const html = await r.text();
    assert.equal(r.status, 200, path);
    assert.match(r.headers.get("content-type"), /^text\/html/);
    assert.equal(r.headers.get("cache-control"), "no-store");
    const csp = r.headers.get("content-security-policy") || "";
    const named = (/script-src 'self' 'sha256-([A-Za-z0-9+/]{43}=)'(?:;|$)/.exec(csp) || [])[1];
    assert.ok(named, csp);
    assert.doesNotMatch(csp, /nonce|https?:/, "no nonce, no other origin");
    const tags = html.match(SCRIPT) || [];
    assert.equal(tags.length, 1, "one script element, loading the shell's script");
    assert.ok(tags[0].includes(`integrity="sha256-${named}"`), tags[0]);
    assert.equal(/\bnonce\b/.test(html) || html.includes("__CSP_NONCE__"), false);
    const src = (/\ssrc="([^"]+)"/.exec(tags[0]) || [])[1];
    assert.match(src, /^\/app\/shell-[^/]+\.js$/);
    for (let load = 1; load <= 2; load++) {
      const js = await mf.dispatchFetch(`${ORIGIN}${src}`);
      assert.equal(js.status, 200, `load ${load}`);
      assert.match(js.headers.get("content-type"), /^text\/javascript/);
      assert.equal(js.headers.get("cache-control"), "public, max-age=31536000, immutable");
      const text = await js.text();
      assert.equal(createHash("sha256").update(text).digest("base64"), named, "the script hashes to the policy's value");
      assert.equal(text, interfaceScript(APP_SCREENS, { guide: GUIDE }), "the served script is the one the end-to-end suites run over the same screens");
    }
    hashes.add(named);
  }
  assert.equal(hashes.size, 1, "the same script on every path");
  for (const [name, file] of Object.entries(ASSET_FILES)) {
    const r = await mf.dispatchFetch(`${ORIGIN}/app/assets/${name}`);
    assert.equal(r.status, 200, name);
    assert.equal(r.headers.get("content-type"), file.type, name);
    const got = new Uint8Array(await r.arrayBuffer());
    const want = file.encoding === "base64" ? Uint8Array.from(Buffer.from(file.body, "base64")) : new TextEncoder().encode(file.body);
    assert.deepEqual(got, want, name);
    const again = await mf.dispatchFetch(`${ORIGIN}/app/assets/${name}`, { headers: { "if-none-match": r.headers.get("etag") } });
    assert.equal(again.status, 304, name);
    await again.arrayBuffer();
  }
  const none = await mf.dispatchFetch(`${ORIGIN}/app/assets/nope.css`);
  assert.equal(none.status, 404);
  await none.arrayBuffer();
});

test("R75, R82, R83 end to end (T47): `GET /` answers the interface's page (the page `/app` answers), and the founder signs in through the real plane's `login` by the handle `admin`, the password and the device, no role sent; the session it answers is the one the interface keeps", async () => {
  /* the instance claimed, as an installer leaves it */
  const claimed = await mf.dispatchFetch(`${ORIGIN}/api/?op=claim`, { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  assert.equal(claimed.status, 200, await claimed.clone().text());
  await claimed.arrayBuffer();
  const strip = (html) => html;
  const root = await mf.dispatchFetch(`${ORIGIN}/`);
  assert.equal(root.status, 200);
  assert.equal(root.headers.get("cache-control"), "no-store");
  assert.equal(strip(await root.text()), strip(await (await mf.dispatchFetch(`${ORIGIN}/app`)).text()), "/ is the interface");
  const signed = await (await toPlane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed));
  const r = signed.result;
  assert.ok(r && r.ok === true && typeof r.token === "string" && r.token.length > 20, JSON.stringify(r));
  assert.equal(r.device, "own");
  /* the session record the interface keeps (interface-shell R32): `{t, e, d}` */
  session = { t: r.token, e: r.expires, d: r.device };
  const who = await (await toPlane("/api/?op=whoami", { headers: { authorization: `Bearer ${r.token}` } })).json();
  assert.deepEqual([who.ok, who.result.session], [true, true]);
  /* control: a wrong password is refused, and no session is answered */
  const wrong = await (await toPlane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: "not the password", device: "own" }) })).json();
  assert.equal(wrong.result?.ok ?? wrong.ok, false);
  assert.equal(Object.hasOwn(wrong.result ?? wrong, "token"), false, "no session answered");
});

/* Wait until the page has gone quiet: no new request for several rounds (the merged screens ask many reads, so a fixed
   number of rounds is a race). Bounded, so a page that never settles still fails by its own assertion. */
async function quiet(p) {
  let last = -1, stable = 0;
  for (let i = 0; i < 600 && stable < 10; i++) {
    await p.settle(20); await new Promise((r) => setTimeout(r, 10));
    stable = p.requests.length === last ? stable + 1 : 0; last = p.requests.length;
  }
}

/* The real served page, booted with the session, at `path`, every request answered by the plane. */
async function appAt(path) {
  const html = await (await mf.dispatchFetch(`${ORIGIN}${path}`)).text();
  const p = await boot({ screens: APP_SCREENS, guide: GUIDE, html, session, path, plane: real });
  await quiet(p);
  return p;
}
const main = (p) => p.doc.getElementById("cs-main");
/* the plane is real, so an answer takes real time: wait (bounded) until the page has asked `op` */
async function waitFor(p, ok, ms = 20000) {
  const end = Date.now() + ms;
  while (Date.now() < end && !ok()) { await p.settle(20); await new Promise((r) => setTimeout(r, 10)); }
  return ok();
}
const answered = async (p, op) => {
  await waitFor(p, () => p.byOp(op).length > 0);
  const sent = p.byOp(op);
  assert.ok(sent.length > 0, `${op} was asked`);
  for (const r of sent) assert.match(r.headers.Authorization || r.headers.authorization || "", /^Bearer /, `${op}: the session in the header`);
  return sent;
};

test("R75 end to end: `home` reads its world from the real plane under the member's session (whoami, the queue, the group), and draws it", async () => {
  assert.ok(session, "signed in");
  const p = await appAt("/app");
  await answered(p, "whoami");
  for (const op of ["queue", "groupidentity"]) await answered(p, op);
  const who = await (await toPlane("/api/?op=whoami", { headers: { authorization: `Bearer ${session.t}` } })).json();
  assert.equal(who.ok, true);
  assert.equal(p.assigned.length, 0, "the page kept its session: no return to the setup page");
  assert.ok(main(p).textContent.trim().length > 0, "home is drawn");
});

test("R75 end to end: `capture` uploads a file's raw bytes with its statement through `captureupload`; the capture is read back through the real ops; `held` lists what the member holds and `release` vouches for it, read back as no longer held", async () => {
  assert.ok(session, "signed in");
  const p = await appAt("/app/capture/file");
  await waitFor(p, () => p.doc.getElementById("ci-file"));
  const file = new File(["e2e photo bytes, unique " + Date.now()], "pothole.jpg", { type: "image/jpeg" });
  const set = (id, v) => { const el = p.doc.getElementById(id); assert.ok(el, id); if (el.type === "checkbox" || el.type === "radio") el.checked = v; else if (el.type === "file") el.files = [v]; else el.value = v; };
  set("ci-file", file); set("ci-how-made", true); set("ci-where", "Seminary Ave, 4 October"); set("ci-what", "The pothole, still open.");
  await p.click(main(p).querySelector('button[data-act="captureupload"]'));
  await quiet(p);
  const [up] = await answered(p, "captureupload");
  assert.equal(up.query.name, "pothole.jpg");
  /* the repeat below is sent only once the plane has answered the page's upload (before this, the page's request was only sent) */
  await waitFor(p, () => (finished.captureupload ?? 0) > 0);
  const bytes = Buffer.from(await file.arrayBuffer());
  const sha = (await import("node:crypto")).createHash("sha256").update(bytes).digest("hex");
  const auth = { authorization: `Bearer ${session.t}` };
  /* the upload is the record's: asked again, the same bytes are a capture it already holds */
  const twice = await (await toPlane(`/api/?op=captureupload&statement=again&name=pothole.jpg`, { method: "POST", headers: auth, body: bytes })).json();
  assert.deepEqual([twice.ok, twice.result.ok, twice.result.existed, twice.result.capture.sha256], [true, true, true, sha], JSON.stringify(twice).slice(0, 300));
  /* screens-intake R21: the upload's document is promoted by the screen itself as an information bundle at `collected`, the
     member's own act (op=promote), so it is held: read the real list until it holds a document over these bytes */
  await waitFor(p, () => p.byOp("promote").length > 0);
  let held = [];
  for (let i = 0; i < 100; i++) {
    const listed = await (await toPlane("/api/?op=heldcaptures&limit=200", { headers: auth })).json();
    held = (listed.result.held || []).filter((x) => JSON.stringify(x).includes(sha));
    if (held.length) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  assert.equal(held.length, 1, "the uploaded document is held: " + JSON.stringify(held).slice(0, 300));
  const id = held[0].bundleId ?? held[0].bundle_id ?? held[0].id;
  assert.equal(typeof id, "string");

  const h = await appAt("/app/held");
  await waitFor(h, () => h.byOp("heldcaptures").length > 0 && main(h).querySelector(`#pick-held-${id}`));
  await answered(h, "heldcaptures");
  assert.ok(main(h).querySelector(`#pick-held-${id}`), "the held screen draws the document from the real list");
  await h.click(main(h).querySelector(`#pick-held-${id}`));
  const fill = (k, v) => { h.doc.getElementById(k).value = v; };
  fill("ch-ack", "This copy is what I took."); fill("ch-mitigation", "Compared with the street.");
  await h.click(main(h).querySelector('button[data-act="release"]'));
  await quiet(h);
  await answered(h, "select");
  await answered(h, "release");
  /* the release's answer is ratification's own (R20–R24), relayed by the door as given: the read below is sent only once
     the plane has answered the page's release (before this, the page's request was only sent) */
  await waitFor(h, () => (finished.release ?? 0) > 0);
  const [rel] = h.byOp("release");
  assert.equal(rel.method, "POST");
  const after = await (await toPlane("/api/?op=heldcaptures&limit=200", { headers: { authorization: `Bearer ${session.t}` } })).json();
  assert.equal((after.result.held || []).some((x) => (x.bundleId ?? x.bundle_id ?? x.id) === id), false, "released, no longer held");
  assert.equal(typeof rel.body.handle, "string");
});
