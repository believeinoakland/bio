/* screens-daily, fix round 6 (G12c-casedrafts; R-SEAM, K4427): Home over the REAL plane (the Worker the product deploys, its object and R2
   under Miniflare). The founder starts three projects and, in each, a draft shared for review, by the member's own acts through the real ops
   (`promote`, `casedraft`, `reviewgrant`); Home then asks for the drafts once, and the plane's one answer holds each project's drafts as
   its single read gives them. Review's batch, store-door's fence and the control plane's forwarding of `projects` are this round's providers:
   until all three merge this file is red by name (the plane refuses the key or answers the batch dead). */
import "./register-declared.mjs";
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
const { SCREENS: DAILY } = await import("../../../src/screens-daily/index.mjs");
const { SCREENS: INTAKE } = await import("../../../src/screens-intake/index.mjs");
const { OPS } = await import("../../../src/op-declarations/index.mjs");
const { boot } = await import("../interface-shell/harness.mjs");

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const hex = (b) => createHash("sha256").update(b).digest("hex");
const ADM = "adm-g12-0123456789abcdef", PASSWORD = "the founder's long password, G12c", ORIGIN = "https://group.example";
let mf;
const start = () => {
  mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-c25-0123456789abcdef", PROBE_TOKEN: "prb-c25-0123456789abcdef", VERSION: "4.7.3", INSTANCE_NAME: "c25-town",
                GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-g12-0123456789abcdef", PROBE_TOKEN: "prb-g12-0123456789abcdef", VERSION: "4.7.3", INSTANCE_NAME: "g12-town",
                GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
    outboundService: () => new Response("not scripted", { status: 404 }),
  });
};
after(() => mf && mf.dispose());
const toPlane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);
async function answerOf(res) {
  const type = res.headers.get("content-type") || "";
  if (/json/.test(type)) return { status: res.status, json: await res.json() };
  return { status: res.status, bytes: new Uint8Array(await res.arrayBuffer()), type };
}
/* every op the door declares, answered by the plane: the booted page's whole world is the real one */
const real = Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => answerOf(await toPlane(req.url, req.init))]));
let session = null;
async function signIn() {
  const claimed = await toPlane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) });
  assert.equal(claimed.status, 200, await claimed.clone().text());
  await claimed.arrayBuffer();
  const signed = await (await toPlane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed));
  session = { t: signed.result.token, e: signed.result.expires, d: signed.result.device };
}
const { word } = await import("../../../src/setup-words/index.mjs");
const LOADING = word("state.loading");
const SCREENS = [...DAILY, ...INTAKE];
async function appAt(path) {
  const html = await (await toPlane(path)).text();
  const p = await boot({ screens: SCREENS, html, session, path, plane: real });
  await run(p);
  return p;
}
/* Runs the page until it has gone quiet (no new request for several rounds) and nothing in the main area says it is still loading; bounded
   (the plane is real, so its answers take real time). */
async function run(p, ms = 90000) {
  const end = Date.now() + ms;
  let last = -1, stable = 0;
  while (Date.now() < end && stable < 15) {
    await p.settle(20); await new Promise((r) => setTimeout(r, 20));
    const busy = text(main(p)).includes(LOADING);
    stable = p.requests.length === last && !busy ? stable + 1 : 0; last = p.requests.length;
  }
}
/* Runs the page until `ok()` holds, at most `ms` of wall time. */
async function until(p, ok, ms = 120000) {
  const end = Date.now() + ms;
  while (Date.now() < end) { if (ok()) return true; await p.settle(20); await new Promise((r) => setTimeout(r, 25)); }
  return ok();
}
const main = (p) => p.doc.getElementById("cs-main");
const text = (el) => (el ? el.textContent : "").replace(/\s+/g, " ").trim();

const around = (t, re) => [...t.matchAll(re)].map((m) => t.slice(Math.max(0, m.index - 70), m.index + m[0].length + 50));
const asFounder = async (url, init = {}) => (await toPlane(url, { ...init, headers: { authorization: `Bearer ${session.t}`, ...(init.headers || {}) } })).json();
const file = (path, t) => ({ path, text: t, bytes: Buffer.byteLength(t), sha256: hex(t) });
const stamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
let keys = 0;
async function promoteProject(title) {
  const at = stamp();
  const md = ["---", "object_type: project", "schema: project@1", `title: ${JSON.stringify(title)}`, `objective: ${JSON.stringify(title)}`, "current_state: forming", "prior_state: null",
    `created: "${at}"`, `last_updated: "${at}"`, "references: []", "state_history: []", "---", "", "## Objective", "", "Find out.", "", "## Session Log", ""].join("\n");
  const r = await asFounder("/api/?op=promote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({
    base: null, snapKey: `${at.replace(/[-:]/g, "")}_c25${String(++keys).padStart(3, "0")}`,
    meta: { object_type: "project", title, current_state: "forming", prior_state: null, created: at, last_updated: at }, files: [file("bundle.md", md)], register: [] }) });
  assert.equal(r.ok && r.result?.ok, true, JSON.stringify(r).slice(0, 500));
  return r.result.bundleId;
}

const GRANT_UNTIL = "2099-01-05T00:00:00.000Z";
const api = (op, body, query = "") => asFounder(`/api/?op=${op}${query}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const getApi = (query) => asFounder(`/api/?${query}`);

test("R87, R64 (G12c, seam): Home over the real plane sends one casedrafts for the projects that share a draft, and the plane's one answer holds each project's drafts as its single read does", { timeout: 600000 }, async () => {
  start();
  await signIn();
  const projects = [];
  for (const title of ["Coliseum lease", "Pothole repairs", "Sewer fund"]) {
    const project = await promoteProject(title);
    const made = await api("casedraft", { project, statement: "What we found", newCase: true });
    assert.equal(made.ok && made.result?.ok, true, "the draft is made by the member's own act: " + JSON.stringify(made).slice(0, 300));
    const granted = await api("reviewgrant", { draft: made.result.draftId, recipient: "A reviewer", until: GRANT_UNTIL });
    assert.equal(granted.ok && granted.result?.ok, true, "and shared by hers: " + JSON.stringify(granted).slice(0, 300));
    projects.push({ project, draft: made.result.draftId });
  }
  const p = await appAt("/app");
  const reads = p.byOp("casedrafts");
  assert.equal(reads.length, 1, "Home asks for the drafts once");
  assert.deepEqual(reads[0].query.projects.split(",").sort(), projects.map((x) => x.project).sort(), "naming every project whose roster row says a draft is shared");
  const batch = await getApi("op=casedrafts&projects=" + encodeURIComponent(reads[0].query.projects));
  assert.equal(batch.ok, true, JSON.stringify(batch).slice(0, 300));
  for (const x of projects) {
    const single = await getApi("op=casedrafts&project=" + encodeURIComponent(x.project));
    assert.deepEqual(batch.result.projects[x.project], single.result, "the entry of " + x.project + " is its single answer");
    assert.deepEqual(single.result.drafts.map((d) => d.draft_id), [x.draft], "and holds its draft");
  }
  assert.equal(main(p).querySelector('[data-area="investigation"]').querySelectorAll('[data-state="failed"]').length, 0, "nothing on Home is drawn failed");
});
