/* control-plane R122 (fix round 4, P9; K4429): THE PAGE'S BOOTSTRAP IS READ ONCE PER LOAD. Over Miniflare and the real plane, the founder
   signed in through the real `login`, the real served `/app` page (the screen modules and the shell) booted on interface-shell's document
   stand-in, every request it makes answered by the same plane: Home, the Queue and a Project each send exactly one `op=bootstrap` for the
   load, and a new load sends one again. The reads belong to the shell (cause-shell-4) and the screens: this is the seam test, through the
   door, and stays red by name until they merge. The door's part is `Server-Timing` (R121), which tells the count of each op's calls. */
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
const { OPS } = await import("../../../src/op-declarations/index.mjs");

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const ADM = "adm-e2e122-0123456789abcdef", PASSWORD = "the founder's long password, R122";
const ORIGIN = "https://group.example";

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-e2e122-0123456789abcdef", PROBE_TOKEN: "prb-e2e122-0123456789abcdef",
              VERSION: "4.7.1", INSTANCE_NAME: "e2e-town-122" },
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
const real = Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => answerOf(await toPlane(req.url, req.init))]));
const sha = (s) => createHash("sha256").update(s).digest("hex");

/* The instance claimed, as an installer leaves it, and the founder signed in through the real `login` (R83). */
let session = null;
async function signIn() {
  if (session) return session;
  const claimed = await mf.dispatchFetch(`${ORIGIN}/api/?op=claim`, { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  assert.equal(claimed.status, 200, await claimed.clone().text());
  await claimed.arrayBuffer();
  const signed = await (await toPlane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed));
  const r = signed.result;
  assert.ok(r && r.ok === true && typeof r.token === "string" && r.token.length > 20, JSON.stringify(r));
  session = { t: r.token, e: r.expires, d: r.device };
  return session;
}
const auth = () => ({ authorization: `Bearer ${session.t}` });
const asFounder = async (url, init = {}) => (await toPlane(url, { ...init, headers: { ...auth(), ...(init.headers || {}) } })).json();

/* The real served page at `path`, booted with `who` (a session record, or null for none), every request answered by
   the plane. */
async function appAt(path, who = session) {
  const html = await (await mf.dispatchFetch(`${ORIGIN}${path}`)).text();
  const p = await boot({ screens: APP_SCREENS, guide: GUIDE, html, session: who, path, plane: real });
  await run(p);
  return p;
}
/* Runs the page until `ok()` holds, at most `ms` of wall time (the plane is real, so its answers take real time). */
async function until(p, ok, ms = 15000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (ok()) return true; await p.settle(20); await new Promise((r) => setTimeout(r, 10)); }
  return ok();
}
/* Runs the page until it has gone quiet: no new request for several rounds (the merged screens ask many reads, so a fixed
   number of rounds is a race); bounded. */
async function run(p) {
  let last = -1, stable = 0;
  for (let i = 0; i < 600 && stable < 10; i++) {
    await p.settle(20); await new Promise((r) => setTimeout(r, 10));
    stable = p.requests.length === last ? stable + 1 : 0; last = p.requests.length;
  }
}
const main = (p) => p.doc.getElementById("cs-main");
const text = (el) => (el ? el.textContent : "").replace(/\s+/g, " ").trim();
const bearer = (r) => r.headers.Authorization || r.headers.authorization || "";
const answered = (p, op) => {
  const sent = p.byOp(op);
  assert.ok(sent.length > 0, `${op} was asked`);
  for (const r of sent) assert.equal(bearer(r), `Bearer ${session.t}`, `${op}: the session in the header`);
  return sent;
};


const promoteProject = async (title) => {
  const at = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const md = ["---", "object_type: project", "schema: project@1", `title: ${JSON.stringify(title)}`, `objective: ${JSON.stringify(title)}`, "current_state: forming",
    "prior_state: null", `created: "${at}"`, `last_updated: "${at}"`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", "", "## Session Log", ""].join("\n");
  const t = Buffer.from(md);
  const r = await asFounder("/api/?op=promote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
    base: null, snapKey: `${at.replace(/[-:]/g, "")}_e2e122001`,
    meta: { object_type: "project", title, current_state: "forming", prior_state: null, created: at, last_updated: at },
    files: [{ path: "bundle.md", text: md, bytes: t.length, sha256: sha(md) }], register: [] }) });
  assert.equal(r.ok && r.result?.ok, true, JSON.stringify(r).slice(0, 500));
  return r.result.bundleId;
};

test("R122 (the page's bootstrap is read once per load): Home, the Queue and a Project each send exactly one `op=bootstrap`; a new load sends one again (control)", async () => {
  await signIn();
  const project = await promoteProject("The bootstrap count");
  for (const [label, path] of [["Home", "/app"], ["the Queue", "/app/queue"], ["a Project", `/app/project/${encodeURIComponent(project)}`]]) {
    const p = await appAt(path);
    assert.deepEqual(p.byOp("bootstrap").length, 1, `${label}: one \`bootstrap\` for the load, asked ${p.byOp("bootstrap").length} times (${p.requests.length} requests: `
      + JSON.stringify(Object.entries(p.requests.reduce((n, r) => ({ ...n, [r.op]: (n[r.op] ?? 0) + 1 }), {})).filter(([, n]) => n > 1)) + " asked more than once)");
  }
  /* control: a new load of the same page sends one of its own */
  const again = await appAt("/app");
  assert.equal(again.byOp("bootstrap").length, 1, "a new load asks again, once");
});
