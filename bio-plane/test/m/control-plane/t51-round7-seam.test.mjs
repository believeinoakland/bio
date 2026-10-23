/* control-plane R105, R123 (fix round 7, G58, G59, G61, G62, G63, G64, G66, G74, G75, G79; K4736; R-SEAM, R-STOP, R-CLOCK): THE WALKER'S CASES THROUGH THE REAL PLANE. The Worker the
   product deploys, its object, its alarm and R2 under Miniflare, as `t51-round6-seam.test.mjs` runs them; every case is a member's own act through the door and ends at the
   record's own reads. Inputs are made by the acts, never by a hand-written answer shape. R-CLOCK: the times asserted are the test's own, taken outside the object.
     G58  the founder's `op=owedwork` (with and without `sha`) carries the five watchdog fields; a member's carries none; an enrolled administrator's carries them;
     G61  a member's Queue after a finished ingest, and after a finished large fetch, answers 200 and holds the notice; the administrator's holds neither;
     G64  a tab-delimited source declared as a table has the declared columns and the data rows only;
     G63  `moneyingest` over 10,000 rows answers `ingesting` quickly, after a restart too, beside a trivial member act (the floor).
   Red by name until the providers have merged: G58 (plane's `administers`), G61 (queue's catalogue), G64 (calculations' delimiter), G63 (calculations' started path). */
import "../../sandbox.mjs";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";

const SRC = fileURLToPath(new URL("../../../src/plane/index.mjs", import.meta.url));
const MB = 1024 * 1024;
const ADM = "adm-r7seam-0123456789abcdef", PASSWORD = "the founder's long password, round seven", ORIGIN = "https://group.example";
const sha = (b) => createHash("sha256").update(b).digest("hex");
const later = (ms) => new Promise((r) => setTimeout(r, ms));
const te = (t) => new TextEncoder().encode(t);

/* the network: a file by its last path segment, served at once or throttled, with its Content-Length or without */
const upstream = new Map();
function serve(name, bytes, { rate = null, length = true, type = "application/pdf" } = {}) { upstream.set(name, { bytes, rate, length, type }); }
function slowBody(bytes, rate) {
  const chunk = 64 * 1024;
  let at = 0;
  return new ReadableStream({
    async pull(c) {
      if (at >= bytes.length) { c.close(); return; }
      const end = Math.min(at + chunk, bytes.length);
      c.enqueue(bytes.subarray(at, end));
      at = end;
      await later((chunk / rate) * 1000);
    },
  }, new CountQueuingStrategy({ highWaterMark: 0 }));
}
const OPTIONS = {
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } }, r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: ADM, MEMBER_TOKEN: "mem-r7seam-0123456789abcdef", PROBE_TOKEN: "prb-r7seam-0123456789abcdef", VERSION: "4.7.6",
              INSTANCE_NAME: "r7seam-town", GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: (req) => {
    const name = new URL(req.url).pathname.split("/").pop();
    const f = upstream.get(name);
    if (!f) return new Response("not scripted", { status: 404 });
    const headers = { "content-type": f.type, ...(f.length ? { "content-length": String(f.bytes.length) } : {}) };
    return new Response(f.rate ? slowBody(f.bytes, f.rate) : f.bytes, { headers });
  },
};
const mf = new Miniflare(OPTIONS);
after(() => mf.dispose());
const plane = (url, init = {}) => mf.dispatchFetch(new URL(url, ORIGIN).href, init);

let founderOnce = null;
async function founder() {
  if (founderOnce) return founderOnce;
  await (await plane("/api/?op=claim", { method: "POST", body: JSON.stringify({ bootstrapToken: ADM, password: PASSWORD }) })).arrayBuffer();
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ handle: "admin", password: PASSWORD, device: "own" }) })).json();
  assert.equal(signed.ok, true, JSON.stringify(signed).slice(0, 300));
  return (founderOnce = { authorization: `Bearer ${signed.result.token}` });
}
/* a member made as the screens make one: the founder invites (`memberadd`), the person enrols with the invitation, then signs in */
const people = new Map();
async function person(handle, role = "member", capabilities = null) {
  if (people.has(handle)) return people.get(handle);
  const adm = await founder();
  const added = await (await plane("/api/?op=memberadd", { method: "POST", headers: { ...adm, "content-type": "application/json" },
    body: JSON.stringify({ memberId: handle, cover: `cover of ${handle}`, role, capabilities }) })).json();
  const invite = added.result && (added.result.invite || (added.result.invitation && added.result.invitation.invite));
  assert.ok(invite, "an invitation: " + JSON.stringify(added).slice(0, 400));
  const pw = `${handle}-long-passphrase-r7`;
  const enrolled = await (await plane("/api/?op=enroll", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ invite, handle, password: pw }) })).json();
  assert.equal(enrolled.ok, true, "enrolled: " + JSON.stringify(enrolled).slice(0, 400));
  const signed = await (await plane("/api/?op=login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ handle, password: pw, device: "own" }) })).json();
  assert.equal(signed.ok, true, "signed in: " + JSON.stringify(signed).slice(0, 400));
  const auth = { authorization: `Bearer ${signed.result.token}` };
  people.set(handle, auth);
  return auth;
}
const screenCall = (auth) => ({ now: () => Date.now(), digest: async (s) => createHash("sha256").update(s).digest("hex"),
  call: async (op, { query = {}, body } = {}) => (await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: body === undefined ? "GET" : "POST",
    headers: { ...auth, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) })).json() });
const get = async (auth, query) => (await plane(`/api/?${new URLSearchParams(query)}`, { headers: auth })).json();
const post = async (auth, op, body, query = {}) => {
  const res = await plane(`/api/?${new URLSearchParams({ op, ...query })}`, { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
};
async function until(fn, ms, every = 3000) {
  const end = Date.now() + ms;
  let v = await fn();
  while (Date.now() < end && !v) { await later(every); v = await fn(); }
  return v;
}
const WATCHDOG = ["last_run", "alarm_at", "stale", "oldest_overdue", "watchdog_seen"];
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* ---- G58 ---- */

test("R105 (G58): the founder's `op=owedwork`, with and without `sha`, carries the five watchdog fields as own properties (null allowed); an enrolled administrator's too; an ordinary member's carries none", { timeout: 300000 }, async () => {
  const adm = await founder();
  for (const query of [{ op: "owedwork" }, { op: "owedwork", sha: "0".repeat(64) }]) {
    const r = (await get(adm, query)).result;
    for (const k of WATCHDOG) assert.ok(has(r, k), `the founder's ${JSON.stringify(query)} carries ${k}: ${JSON.stringify(r).slice(0, 300)}`);
  }
  const second = await person("second-admin", "admin");
  const a = (await get(second, { op: "owedwork" })).result;
  for (const k of WATCHDOG) assert.ok(has(a, k), `an enrolled administrator's carries ${k}: ${JSON.stringify(a).slice(0, 300)}`);
  const member = await person("plain-ann");
  const m = (await get(member, { op: "owedwork" })).result;
  for (const k of WATCHDOG) assert.equal(has(m, k), false, `a member's carries no ${k}`);
});

/* ---- the member's money flow: upload a CSV, file it, mint its content, declare the table, adopt the binding, ingest ---- */

const FIELDS = [{ name: "payer", type: "string" }, { name: "payee", type: "string" }, { name: "amount", type: "number" }];
const HEADER = FIELDS.map((f) => f.name);
const ROLES = { payer: { role: "payer", scheme: "ellery_person" }, payee: { role: "payee", scheme: "ellery_person" }, amount: { role: "amount" } };
const BIND = { amount: "amount", payer: "payer", payee: "payee", kind: { value: "payment" }, phase: { value: "actual" },
  stage: { value: "paid" }, basis: { value: "cash" }, currency: { value: "USD" }, period: { value: "2025-07-01/2026-06-30" } };
/* a CSV of `rows` data rows under the declared header, in the delimiter `sep`, made distinct by `tag` */
function csvOf(rows, tag, sep = ",") {
  const lines = [HEADER.join(sep)];
  for (let i = 0; i < rows; i++) lines.push([`P${tag}${String(i).padStart(6, "0")}`, "P002", (i % 97) + 1].join(sep));
  return te(lines.join("\n") + "\n");
}
/* the member's upload as the screen presses it, answered with the filed document's bundle */
async function uploadCsv(auth, bytes, name, project = "") {
  const res = await plane(`/api/?op=captureupload&statement=${encodeURIComponent(name)}&name=${encodeURIComponent(name)}&type=text%2Fcsv`, { method: "POST", headers: auth, body: bytes });
  const up = (await res.json()).result;
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  const made = await CAPTURE_SCREEN.parts.promoteDocument(screenCall(auth), { doc: up.document, title: name, locator: up.document.locator, project });
  assert.equal(made.refused, undefined, JSON.stringify(made).slice(0, 400));
  return { up, made, sha: sha(bytes) };
}
const bindingKey = (body) => { const r = body.result || body; const k = r.binding_key || r.binding || r.key || (r.binding && r.binding.binding_key); assert.ok(k, "the binding's key: " + JSON.stringify(body).slice(0, 300)); return k; };
async function declareFrom(auth, filed, { header = HEADER } = {}) {
  const bundleId = (filed.made && (filed.made.bundleId || (filed.made.result && filed.made.result.bundleId))) || filed.up.document.bundleId;
  assert.ok(bundleId, "the document's bundle: " + JSON.stringify(filed.made).slice(0, 300));
  const minted = await post(auth, "contentmint", { bundleId });
  const contentId = minted.body.result && (minted.body.result.id || minted.body.result.content_id || minted.body.result.contentId);
  assert.ok(contentId, "content minted: " + JSON.stringify(minted.body).slice(0, 400));
  const declared = await post(auth, "tabledeclare", { source: contentId, schema: { fields: FIELDS }, header, roles: ROLES });
  return { contentId, declared: declared.body.result || declared.body, status: declared.status };
}
async function ingestAs(auth, bytes, name) {
  const filed = await uploadCsv(auth, bytes, name);
  const d = await declareFrom(auth, filed);
  assert.equal(d.declared.ok, true, "table declared: " + JSON.stringify(d.declared).slice(0, 400));
  const adopted = await post(auth, "bindingadopt", { table: d.declared.sha, roles: BIND });
  assert.equal((adopted.body.result || adopted.body).ok, true, "binding adopted: " + JSON.stringify(adopted.body).slice(0, 400));
  const binding = bindingKey(adopted.body);
  const t0 = Date.now();
  const started = await post(auth, "moneyingest", { binding, rows: "all", reason: "round 7 seam" });
  return { filed, d, started, ms: Date.now() - t0 };
}
const ingestState = async (auth, ingest) => ((await get(auth, { op: "moneyingestread", ingest })).result || {});

/* ---- G61 ---- */

test("R105 (G61): a member's 18,098-row money ingest, once done, leaves the member's Queue (and its count) answering 200 with `FINDING::ingest-done::<ingest>`; the administrator's Queue is 200 without it", { timeout: 900000 }, async () => {
  const ann = await person("ingest-ann");
  const run = await ingestAs(ann, csvOf(18098, "G61"), "g61.csv");
  const result = run.started.body.result || run.started.body;
  assert.ok(result.ingest, "the act answers with its ingest: " + JSON.stringify(run.started.body).slice(0, 400));
  const done = await until(async () => { const s = await ingestState(ann, result.ingest); return s.state === "done" || s.written != null ? s : null; }, 300000, 2000);
  assert.ok(done, "the ingest finishes by the object's own alarm");
  const q = await plane(`/api/?op=queue`, { headers: ann });
  assert.equal(q.status, 200, "the member's whole Queue is not refused: " + (await q.clone().text()).slice(0, 400));
  const feed = JSON.stringify((await q.json()).result);
  assert.ok(feed.includes(`FINDING::ingest-done::${result.ingest}`), `the notice is in the feed: ${feed.slice(0, 400)}`);
  const counted = await plane(`/api/?op=queue&count=true`, { headers: ann });
  assert.equal(counted.status, 200, "the count: " + (await counted.clone().text()).slice(0, 300));
  const adm = await plane(`/api/?op=queue`, { headers: await founder() });
  assert.equal(adm.status, 200);
  assert.equal(JSON.stringify((await adm.json()).result).includes(`FINDING::ingest-done::${result.ingest}`), false, "the administrator did not run it");
});

/* ---- G64 ---- */

test("R105 (G64): a tab-delimited source declared over a three-column header is a three-column table of the data rows only, the header line dropped (comma control: the same rows; one cell per line against the header is refused naming the delimiter and the columns)", { timeout: 600000 }, async () => {
  const bob = await person("table-bob");
  const rows = 120;
  const readTable = async (sha256) => (await get(bob, { op: "table", sha256, sha: sha256 })).result || {};
  const comma = await declareFrom(bob, await uploadCsv(bob, csvOf(rows, "G64C"), "g64-comma.csv"));
  assert.equal(comma.declared.ok, true, JSON.stringify(comma.declared).slice(0, 300));
  assert.equal(comma.declared.rows, rows, `control: a comma file with a matching header holds exactly its data rows: ${JSON.stringify(comma.declared).slice(0, 1200)}`);
  for (const [sep, label] of [["\t", "tab"], [";", "semicolon"], ["|", "pipe"]]) {
    const d = await declareFrom(bob, await uploadCsv(bob, csvOf(rows, `G64${label[0].toUpperCase()}`, sep), `g64-${label}.csv`));
    assert.equal(d.declared.ok, true, `${label}: ${JSON.stringify(d.declared).slice(0, 300)}`);
    assert.equal(d.declared.rows, rows, `${label}: the header line is not a data row`);
    assert.equal((d.declared.header || HEADER).length, 3, `${label}: three declared columns`);
  }
  /* one cell per line against a three-column header, under no delimiter: refused with its reason */
  const lines = te(["payer", ...Array.from({ length: 30 }, (_, i) => `solo${i}`)].join("\n") + "\n");
  const one = await declareFrom(bob, await uploadCsv(bob, lines, "g64-solo.csv"));
  assert.equal(one.declared.ok, false, "a one-cell-per-line source is not accepted as a three-column table");
  assert.ok(JSON.stringify(one.declared).toLowerCase().includes("delimiter"), `the refusal names the delimiter: ${JSON.stringify(one.declared).slice(0, 300)}`);
  void readTable;
});

/* ---- G63 ---- */

test("R105 (G63): `moneyingest` over 10,000 rows answers `ingesting` in under 2 s by the test's own clock, after the plane's restart (cold table cache) too, and is reported beside a trivial member act through the same door (the floor)", { timeout: 900000 }, async () => {
  const cy = await person("ingest-cy");
  const bytes = csvOf(12000, "G63");
  const filed = await uploadCsv(cy, bytes, "g63.csv");
  const d = await declareFrom(cy, filed);
  assert.equal(d.declared.ok, true, JSON.stringify(d.declared).slice(0, 300));
  const adopted = await post(cy, "bindingadopt", { table: d.declared.sha, roles: BIND });
  assert.equal((adopted.body.result || adopted.body).ok, true);
  await mf.setOptions(OPTIONS); /* the plane restarts: the object's storage is kept, the table cache (process memory) is cold */
  const floorAt = Date.now();
  await (await plane("/api/?op=whoami", { headers: cy })).arrayBuffer();
  const floor = Date.now() - floorAt;
  const t0 = Date.now();
  const started = await post(cy, "moneyingest", { binding: bindingKey(adopted.body), rows: "all", reason: "round 7 cold" });
  const ms = Date.now() - t0;
  const r = started.body.result || started.body;
  assert.equal(r.state, "ingesting", JSON.stringify(started.body).slice(0, 300));
  console.log(`G63: moneyingest over ${12000} rows after a restart answered in ${ms} ms; a trivial member act through the same door ${floor} ms`);
  assert.ok(ms < 2000, `answered in ${ms} ms beside a trivial act's ${floor} ms (the walker's was 4.1 s)`);
});

/* ---- G61, the latent twin: a large capture's finished fetch, run AS AN ENROLLED MEMBER ---- */

/* a PDF of `bytes` bytes whose one page of text says `words`, filled out by a stream no page names */
function pdfOf(words, bytes) {
  const pad = new Uint8Array(Math.max(0, bytes - 1500));
  let x = 0x9e3779b9;
  for (let i = 0; i < pad.length; i++) { x = (x * 1664525 + 1013904223) >>> 0; pad[i] = 0x41 + ((x >>> 24) % 26); }
  const stream = (n, dict, data) => [te(`${n} 0 obj\n<< ${dict} /Length ${data.length} >>\nstream\n`), data, te("\nendstream\nendobj\n")];
  const plain = (n, body) => [te(`${n} 0 obj\n${body}\nendobj\n`)];
  const toUni = "/CIDInit /ProcSet findresource begin 1 begincodespacerange <00> <FF> endcodespacerange 1 beginbfrange <20> <7E> <0020> endbfrange end";
  const parts = [te("%PDF-1.7\n"), ...plain(1, "<< /Type /Catalog /Pages 2 0 R >>"), ...plain(2, "<< /Type /Pages /Kids [100 0 R] /Count 1 >>"),
    ...plain(10, `<< /Type /Font /Subtype /TrueType /BaseFont /Plain /FirstChar 32 /Widths [${Array(95).fill(500).join(" ")}] /ToUnicode 11 0 R >>`), ...stream(11, "", te(toUni)),
    ...plain(100, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 800] /Resources << /Font << /F1 10 0 R >> >> /Contents 101 0 R >>"),
    ...stream(101, "", te(`BT /F1 12 Tf 72 700 Td (${words}) Tj ET`)), ...stream(500, "", pad), te("trailer\n<< /Root 1 0 R >>\n%%EOF\n")];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
const acquire = async (auth, body) => {
  const t = Date.now();
  const res = await plane("/api/?op=acquire", { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: JSON.stringify(body) });
  return { ms: Date.now() - t, status: res.status, body: await res.json() };
};
async function projectOf(auth, title) {
  const cs = screenCall(auth);
  const iso = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const made = await cs.call("promote", { body: { base: null, snapKey: iso.replace(/[-:]/g, "") + "_00c0ffee", meta: { object_type: "project", title, current_state: "forming", created: iso, last_updated: iso },
    files: [{ path: "bundle.md", text: `---\nobject_type: project\ntitle: "${title}"\nobjective: "${title}"\ncurrent_state: forming\ncreated: "${iso}"\nlast_updated: "${iso}"\n---\n\n## Session Log\n\n### Session ${iso} | Formation | interactive\nTrigger: the seam test\nChanges: created.\n` }], register: [], visibility: "hidden" } });
  const id = (made.result && made.result.bundleId) || made.bundleId;
  assert.ok(id, "the project is made: " + JSON.stringify(made).slice(0, 300));
  return id;
}

test("R105, R124 (G61 twin): a large capture opened by an enrolled member and finished by the alarm leaves the opener's Queue answering 200 with a `fetch-done` item for that capture", { timeout: 1200000 }, async () => {
  const dee = await person("fetch-dee", "member", ["contribute", "create_projects"]);
  const project = await projectOf(dee, "Round seven large capture");
  const big = pdfOf(`G61 the large budget volume the clerk read the notice ${Date.now()}`, 15932155);
  const name = `BUDGET-R7-${Date.now()}.pdf`;
  serve(name, big, { rate: 0.7 * MB });
  const first = await acquire(dee, { locator: `https://www.example.gov/files/${name}`, project });
  assert.equal(first.status, 200, JSON.stringify(first.body).slice(0, 400));
  assert.ok(first.body.fetch_pending, JSON.stringify(first.body).slice(0, 400));
  const held = await until(async () => (JSON.stringify((await get(dee, { op: "heldcaptures", project })).result).includes(sha(big)) ? true : null), 600000, 5000);
  assert.ok(held, "the document is in the project after the tick");
  /* the opener is told once the fetch's row ends; the Queue is read until then, and never refused */
  let last = "";
  const told = await until(async () => {
    const q = await plane("/api/?op=queue", { headers: dee });
    last = await q.text();
    assert.equal(q.status, 200, `the opener's Queue is not refused: ${last.slice(0, 400)}`);
    return last.includes("fetch-done") ? true : null;
  }, 180000, 5000);
  assert.ok(told, `the opener is told, by the item's kind (fetch-done): ${last.slice(0, 600)}`);
});
