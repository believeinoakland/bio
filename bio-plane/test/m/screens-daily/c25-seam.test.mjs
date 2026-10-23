/* screens-daily C25 (fix round 4; K4429, K4437): THE SEAM, WHOLE. A member captures a PDF through the real plane (the Worker the product
   deploys, its object and R2 under Miniflare; the network scripted to serve the real IRS file, pinned by its SHA-256, and a PDF with no
   Title), by pressing the capture screen's own act on the real served page, every request answered by the plane; then the same document is
   read where a member reads it: Add, Held, Find, the Queue (the issuer question) and Home. They all name it by the record's one rule. */
import "./register-declared.mjs";
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
const { SCREENS: DAILY } = await import("../../../src/screens-daily/index.mjs");
const { SCREENS: INTAKE } = await import("../../../src/screens-intake/index.mjs");
const { OPS } = await import("../../../src/op-declarations/index.mjs");
const { boot } = await import("../interface-shell/harness.mjs");

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const CACHE = fileURLToPath(new URL("./.cache/", import.meta.url));
const IRS = { url: "https://www.irs.gov/pub/irs-pdf/f1040es.pdf", sha: "396ffad25baa737b33a67d27624f7444be3ac4e7245d287aebe5f89864f90b54", name: "f1040es.pdf" };
const hex = (b) => createHash("sha256").update(b).digest("hex");
/* fetched once, pinned; a file that cannot be had, or is not the pinned bytes, throws (the test fails by name, never skips) */
function irsBytes() {
  const path = CACHE + IRS.name;
  mkdirSync(CACHE, { recursive: true });
  if (!existsSync(path) || hex(readFileSync(path)) !== IRS.sha) {
    try { execFileSync("curl", ["-fsSL", "--max-time", "300", "-o", path, IRS.url], { stdio: "pipe" }); }
    catch (e) { throw new Error(`THE FILE ${IRS.name} CANNOT BE HAD from ${IRS.url}: ${String(e.stderr || e.message).slice(0, 200)}`); }
  }
  const bytes = readFileSync(path);
  if (hex(bytes) !== IRS.sha) throw new Error(`THE FILE ${IRS.name} is not the pinned bytes (${hex(bytes)} for ${IRS.sha})`);
  return new Uint8Array(bytes);
}
/* A one-page PDF with no Info dictionary: no Title at all. */
function plainPdf(words) {
  const objs = ["<</Type/Catalog/Pages 2 0 R>>", "<</Type/Pages/Kids[3 0 R]/Count 1>>",
    "<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 200]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>", null, "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>"];
  const stream = `BT /F1 12 Tf 20 100 Td (${words}) Tj ET`;
  objs[3] = `<</Length ${stream.length}>>\nstream\n${stream}\nendstream`;
  let out = "%PDF-1.4\n"; const at = [];
  objs.forEach((o, i) => { at.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + at.map((n) => String(n).padStart(10, "0") + " 00000 n \n").join("");
  out += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(out);
}

const ADM = "adm-c25-0123456789abcdef", PASSWORD = "the founder's long password, C25", ORIGIN = "https://group.example";
const PLAIN = { url: "https://www.example.gov/files/budget-notes.pdf", name: "budget-notes.pdf" };
let mf, irs, plain;
const start = () => {
  irs = irsBytes(); plain = plainPdf("Budget notes for the lakeshore tenants");
  mf = new Miniflare({
    modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
    modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
    durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
    bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-c25-0123456789abcdef", PROBE_TOKEN: "prb-c25-0123456789abcdef", VERSION: "4.7.3", INSTANCE_NAME: "c25-town",
                GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
    outboundService: (req) => {
      const u = new URL(req.url);
      const pdf = u.pathname.endsWith("/" + IRS.name) ? irs : u.pathname.endsWith("/" + PLAIN.name) ? plain : null;
      return pdf ? new Response(pdf, { headers: { "content-type": "application/pdf", "content-length": String(pdf.length), ...(pdf === plain ? { "content-disposition": `attachment; filename="${PLAIN.name}"` } : {}) } })
        : new Response("not scripted", { status: 404 });
    },
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
async function capture(url, project) {
  const p = await appAt("/app/capture/address" + (project ? "/" + project : ""));
  p.doc.getElementById("ci-address").value = url;
  const before = p.byOp("promote").length;
  await p.click(main(p).querySelectorAll('button[data-act="acquire"]')[0]);
  await until(p, () => p.byOp("promote").length > before);
  await run(p);
  return p;
}
/* A page loaded until `ok(text)` holds (the plane's queue is filled by its own drain after the capture, so a page is read again until it is), bounded. */
async function pageWith(path, ok, ms = 120000) {
  const end = Date.now() + ms;
  let p = await appAt(path);
  while (!ok(text(main(p))) && Date.now() < end) { await new Promise((r) => setTimeout(r, 1500)); p = await appAt(path); }
  return p;
}
const noAddress = (t) => t.replace(/https?:\/\/\S+/g, " ");

test("R54, R17, R89 (C25): the member captures the IRS Form 1040-ES and a PDF with no Title through the real plane, and every list names them by the one rule: the title the file gives, else the name its source states", { timeout: 900000 }, async () => {
  start();
  await signIn();
  const proj = await promoteProject("Lakeshore tax help");
  const NAMED = "2026 Form 1040-ES", FILE = PLAIN.name;

  /* the member's own act, on the real page: the capture screen's act `acquire`, the real op, the real PDF reading, the screen's own promotion */
  const add1 = await capture(IRS.url, proj);
  const add2 = await capture(PLAIN.url, proj);
  assert.ok(text(main(add1)).includes(word("screen.capture.address.done", { title: NAMED }).replace(/\s+/g, " ").slice(0, 40)), "Add names the PDF by the title it gives");
  assert.ok(text(main(add2)).includes(word("screen.capture.address.done", { title: FILE }).replace(/\s+/g, " ").slice(0, 40)), "and the one with no Title by the file name its source states");
  assert.equal(add1.byOp("acquire").length, 1);
  const id1 = add1.byOp("promote")[0].body.bundleId, id2 = add2.byOp("promote")[0].body.bundleId;
  assert.equal(add1.byOp("promote")[0].body.meta.title, NAMED, "the record is titled by it");
  assert.equal(add2.byOp("promote")[0].body.meta.title, FILE);

  const both = (t) => noAddress(t).includes(NAMED) && noAddress(t).includes(FILE);
  const never = (t) => {
    const x = noAddress(t);
    assert.ok(!x.includes(IRS.name), "never the file part of the address: " + x.slice(x.indexOf(IRS.name) - 40, x.indexOf(IRS.name) + 40));
    assert.ok(!/A PDF from|from www\.irs\.gov|photo you captured/.test(x), "never a kind and a host, and never a photo");
  };
  /* Held and Find (the browse, then a search) */
  for (const path of ["/app/held", "/app/finder"]) {
    const p = await pageWith(path, both);
    assert.ok(both(text(main(p))), `${path}: both are named`);
    never(text(main(p)));
  }
  const found = await appAt("/app/finder");
  found.doc.getElementById("finder-q").value = "1040";
  await found.click(main(found).querySelectorAll('button[data-act="search"]')[0]);
  await until(found, () => found.byOp("search").length > 0);
  await run(found);
  assert.ok(noAddress(text(main(found))).includes(NAMED), "a search for it names it");
  never(text(main(found)));
  /* the Queue: the issuer question and the vouch to-do, for each document, and Home's the same (its second visit: the first is the member's first look) */
  const queue = await pageWith("/app/queue", (t) => both(t) && t.split(word("screen.queue.routed.auth.item")).length >= 3);
  const q = text(main(queue));
  assert.ok(both(q) && q.split(word("screen.queue.routed.auth.item")).length >= 3, "the Queue draws an issuer question for each document, named");
  assert.equal(main(queue).querySelectorAll('button[data-act="release"]').length, 2, "and a vouch to-do for each");
  never(q);
  await appAt("/app");
  const home = await pageWith("/app", (t) => both(t) && t.includes(word("screen.home.needsyou")));
  assert.ok(both(text(main(home))), "Home names both");
  never(text(main(home)));
  /* the lists the project's page and the document page draw (screens-inquiry's, from these fields): the project's documents (`heldcaptures` for the
     project) and the documents a member sets one beside another (`list`), each row's title, are the same names */
  const titles = (rows) => rows.map((r) => r.title).sort();
  const inProject = (await asFounder(`/api/?op=heldcaptures&project=${proj}&state=held_and_vouched&limit=200`)).result.held;
  assert.deepEqual(titles(inProject), [FILE, NAMED].sort(), "the project's documents");
  const others = (await asFounder("/api/?op=list&type=information&limit=500")).result.bundles;
  assert.deepEqual(titles(others.filter((b) => [id1, id2].includes(b.bundle_id))), [FILE, NAMED].sort(), "the document page's other documents");
});
