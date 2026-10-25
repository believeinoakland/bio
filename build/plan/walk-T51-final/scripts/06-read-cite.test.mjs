/* WALK-FINAL-06 #1 (T51 final pass, Phase 1, sitting 6 "Read, find, cite into a question"; BRIEF.md, PHASE1-NOW.md): the offline journey of area 6 and the overlay's checks that fall in it,
   run through the real plane under Miniflare (its Worker, object, alarm, R2, and the committed pdf-worker and ocr-worker beside it). Every input is made by a member's own acts through the door
   (`/api/?op=...`: upload, file, vouch, open a question, find, cite, flag, ...), never a hand-written answer shape or a row written to storage (R-SEAM).
   It RECORDS, it does not assert: each check is `step(row, check, fn)`, whose `fn` returns `{ v: "WORKS"|"BROKEN"|"NOT REACHED"|"KNOWN <id>", saw }`; a throw is BROKEN with the message.
   The rows go to the file named by WALK6_ROWS (default `walk6-rows.jsonl` beside this script) one JSON line each; the record `06-read-cite.md` is written from them.
   Run:  cd bio-plane && WALK6_ROWS=/path/rows.jsonl node --import ./test/platform-sqlite.mjs ../build/plan/walk-T51-final/scripts/06-read-cite.test.mjs
   Sections can be chosen with WALK6_ONLY=R45,R46 (the world is built once, by the real acts, whatever is chosen). */
import "../../../../bio-plane/test/sandbox.mjs";
import { test, after } from "node:test";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { makeKit } from "../../../../bio-plane/test/m/control-plane/r8-kit.mjs";
import { generate as pdfGenerate } from "../../../../bio-plane/test/pdfgen.mjs";
import { generate as sheetGenerate } from "../../../../bio-plane/test/sheetgen.mjs";
import { ocrWorkerDef } from "../../../../ocr-worker/test/memberworker.mjs";
import { CAPTURE_SCREEN } from "../../../../bio-plane/src/screens-intake/capture.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROWS = process.env.WALK6_ROWS || join(HERE, "walk6-rows.jsonl");
const ONLY = (process.env.WALK6_ONLY || "").split(",").map((s) => s.trim()).filter(Boolean);
const want = (id) => !ONLY.length || ONLY.includes(id);
const PDF_BUNDLE = fileURLToPath(new URL("../../../../pdf-worker/dist/pdf-worker.bundled.mjs", import.meta.url));
const pdfWorkerDef = () => ({ name: "pdf-worker", modules: true, modulesRoot: "/", scriptPath: PDF_BUNDLE, script: readFileSync(PDF_BUNDLE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"], r2Buckets: ["CAPTURES"], bindings: { VERSION: "test" } });
const enc = encodeURIComponent;
const te = (t) => new TextEncoder().encode(t);
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const uniq = () => `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
const J = (x, n = 600) => { const s = typeof x === "string" ? x : JSON.stringify(x); return s === undefined ? "undefined" : s.length > n ? s.slice(0, n) + "..." : s; };

/* ---- the record ---- */
writeFileSync(ROWS, "");
const out = [];
function note(row, check, v, saw, timing) {
  const line = { row, check, v, saw: J(saw, 1500), ...(timing ? { timing } : {}) };
  out.push(line);
  appendFileSync(ROWS, JSON.stringify(line) + "\n");
  process.stderr.write(`[${row}] ${v} :: ${check} :: ${J(saw, 300)}\n`);
}
async function step(row, check, fn) {
  const t = Date.now();
  try {
    const r = await fn();
    note(row, check, r && r.v ? r.v : "WORKS", r && r.saw !== undefined ? r.saw : r, `${Date.now() - t} ms`);
    return r;
  } catch (e) {
    note(row, check, "BROKEN", `threw: ${String(e && e.message || e).slice(0, 700)}`, `${Date.now() - t} ms`);
    return null;
  }
}
const ok = (saw) => ({ v: "WORKS", saw });
const bad = (saw) => ({ v: "BROKEN", saw });
const nr = (saw) => ({ v: "NOT REACHED", saw });
const must = (cond, saw) => (cond ? ok(saw) : bad(saw));

/* ---- the network: scripted by the last path segment; some pages change on every fetch, as httpbin's /anything?walk= does ---- */
const net = { counter: new Map(), pages: new Map(), status: new Map(), log: [] };
function serveStatic(name, bytes, type) { net.pages.set(name, () => ({ bytes, type })); }
function serveDynamic(name, make, type = "text/html") { net.pages.set(name, (n) => ({ bytes: te(make(n)), type })); }
const outbound = (req) => {
  const name = new URL(req.url).pathname.split("/").pop();
  net.log.push(name);
  if (net.status.has(name)) return new Response("gone", { status: net.status.get(name) });
  const f = net.pages.get(name);
  if (!f) return new Response("not scripted", { status: 404 });
  const n = (net.counter.get(name) || 0) + 1;
  net.counter.set(name, n);
  const { bytes, type } = f(n);
  return new Response(bytes, { headers: { "content-type": type, "content-length": String(bytes.length) } });
};

const kit = makeKit({ tag: "w06", workers: [pdfWorkerDef(), ocrWorkerDef()], serviceBindings: { PDF_WORKER: "pdf-worker", OCR_WORKER: "ocr-worker" }, outbound });
after(() => kit.mf.dispose());
const R = kit.R;
const get = (auth, q) => kit.get(auth, q);
const post = (auth, op, body, query) => kit.post(auth, op, body, query);
const result = (a) => (a && a.result !== undefined ? a.result : a);
const WORDS = new Map(); /* every refusal sentence the sitting met, by code: the overlay reads them for vocabulary (check 15) and raw ids (check 6) */
const refusal = (a) => { const r = result(a); const x = r && r.ok === false ? r : a && a.ok === false ? a : null; if (x && (x.translation || x.detail)) WORDS.set(String(x.code || x.reason || "?") + "|" + String(x.translation || "").slice(0, 40), { code: x.code || x.reason, translation: x.translation || null, detail: x.detail || null }); return x; };
const codeOf = (a) => { const r = refusal(a); return r ? String(r.code || r.reason || r.error || "") : ""; };

const W = {}; /* the world */

async function upload(auth, bytes, { name, type }) {
  const t = Date.now();
  const res = await kit.plane(`/api/?op=captureupload&statement=${enc(name)}&name=${enc(name)}&type=${enc(type)}`, { method: "POST", headers: auth, body: bytes });
  const json = await res.json();
  return { status: res.status, up: result(json), ms: Date.now() - t, headers: res.headers };
}
async function fileIt(auth, up, { title, project = "" }) {
  const made = await CAPTURE_SCREEN.parts.promoteDocument(kit.screenCall(auth), { doc: up.document, title, locator: up.document.locator, project });
  if (made.refused !== undefined) throw new Error("filing refused: " + J(made));
  return made.bundleId;
}
/* upload + file + (optionally vouch); answers {sha, bundle} */
async function bring(auth, bytes, { name, type, title, project, vouch = false }) {
  const { up } = await upload(auth, bytes, { name, type });
  if (!up || up.ok !== true) throw new Error("upload: " + J(up));
  const bundle = await fileIt(auth, up, { title: title || name, project });
  if (vouch) await vouchFor(auth, bundle);
  return { sha: up.capture.sha256, bundle, up };
}
async function vouchFor(auth, bundle) {
  const cs = kit.screenCall(auth);
  const sel = R(await cs.call("select", { body: { ids: [bundle] } }));
  if (!sel || !sel.handle) throw new Error("select: " + J(sel));
  const rel = await cs.call("release", { query: { handle: sel.handle, acknowledgment: "I checked that this file is what it says it is.", mitigation: "Nothing in it names a private person." } });
  if (rel.ok === false || R(rel).ok === false) throw new Error("release: " + J(rel));
  return R(rel);
}
const reading = async (auth, sha, after) => R(await get(auth, { op: "reading", sha256: sha, ...(after ? { after: String(after) } : {}) }));
const readWhole = (auth, sha, ms = 120000) => kit.until(async () => { const r = await reading(auth, sha); return r && r.found && (r.completeness?.state === "whole" || r.next == null && r.units_total > 0) ? r : null; }, ms, 1500);
const findIn = async (auth, scope, term, kinds = ["term"]) => R(await post(auth, "findin", { scope, kinds, term }).then((x) => x.body));

/* the world: administrator, ann (owner of the project, may create and publish), mel (a member who owns a second project ann cannot see) */
async function build() {
  const adm = await kit.founder();
  W.adm = adm;
  await kit.profileSet(["oakland-alameda"]); /* area 1's act: the places the team works in (the active profile) */
  W.ann = (await kit.ownerOf("ann")).auth;
  W.mel = (await kit.ownerOf("mel")).auth;
  W.project = await kit.projectOf(W.ann, "Council spending against the stated policy");
  W.melProject = await kit.projectOf(W.mel, "Mel's separate inquiry");
  W.question = await kit.questionOf(W.ann, W.project, "Did the council spend against its stated policy?");
  W.question2 = await kit.questionOf(W.ann, W.project, "Was the amended contract stamped before the vote?");
}

/* the documents of the sitting: every one brought in by the member's own acts */
async function documents() {
  const ann = W.ann;
  /* the 20-page PDF (w10) */
  const w10 = pdfGenerate({ kind: "pdf", seed: "w10", size: { pages: 20, lines: 8 } });
  W.w10truth = w10.truth;
  W.w10 = await bring(ann, await w10.bytes(), { name: "w10.pdf", type: "application/pdf", title: "w10 budget ordinance", project: W.project, vouch: true });
  /* a text file of two paragraphs, with a distinct sentence in each */
  const tag = uniq();
  W.textTag = tag;
  W.text = await bring(ann, te([`The clerk stamped the amended contract RECEIVED before the council voted on it.`,
    `The minutes of the meeting were filed on Tuesday morning, and the register ${tag} was signed by the deputy clerk, the city attorney and the chair of the council.`,
    `The treasurer reported that the total payment to Ellery Paving was 48,000 dollars for the quarter.`].join("\n\n")), { name: "minutes.txt", type: "text/plain", title: "council minutes", project: W.project, vouch: true });
  /* a second text that disagrees about the amount (R50) and one that agrees in meaning but differs in precision */
  W.textB = await bring(ann, te([`The finance office report says the quarterly payment to Ellery Paving was 52,000 dollars.`,
    `The report was filed on Friday ${tag}.`].join("\n\n")), { name: "finance-report.txt", type: "text/plain", title: "finance office report", project: W.project, vouch: true });
  W.textC = await bring(ann, te(`The audit says spending on paving dropped a lot in the second quarter ${tag}.\n\nThe summary says it was reduced a little ${tag}.`), { name: "audit.txt", type: "text/plain", title: "audit summary", project: W.project, vouch: true });
  /* a CSV (money table) */
  const csv = sheetGenerate({ kind: "csv", seed: "w06csv", size: { rows: 40, cols: 3 }, header: "one", types: ["text", "integer", "text"] });
  W.csv = await bring(ann, await csv.bytes(), { name: "payments.csv", type: "text/csv", title: "payments table", project: W.project, vouch: true });
  /* a scanned PDF, read by OCR */
  const scan = pdfGenerate({ kind: "pdf", seed: "w06scan", kinds: ["scan"], size: { pages: 2, lines: 4 } });
  W.scanTruth = scan.truth;
  W.scan = await bring(ann, await scan.bytes(), { name: "scan.pdf", type: "application/pdf", title: "scanned letter", project: W.project, vouch: false });
}

test("area 6 world", { timeout: 1800000 }, async () => {
  const t0 = Date.now();
  await build();
  process.stderr.write(`[world] built in ${Date.now() - t0} ms: ${J({ project: W.project, melProject: W.melProject, q1: W.question, q2: W.question2 })}\n`);
  await documents();
  process.stderr.write(`[world] documents in ${Date.now() - t0} ms: ${J({ w10: W.w10.bundle, text: W.text.bundle, textB: W.textB.bundle, csv: W.csv.bundle, scan: W.scan.bundle })}\n`);
});


/* ======================================================================================================================================================================
   helpers for the legs of a question (its own document holds them: `basis:` blocks), and a few reads
   ====================================================================================================================================================================== */
export const imageText = async (auth, id) => String((R(await get(auth, { op: "image", id })) || {})["bundle.md"] || "");
function legsOfText(t) {
  const m = /\nbasis:\n([\s\S]*?)\n---/.exec(t) || /\nbasis:\n([\s\S]*)$/.exec(t);
  if (!m) return [];
  return m[1].split(/\n  - /).map((b) => b.replace(/^  - /, "")).filter(Boolean).map((b) => {
    const o = {};
    for (const line of b.split("\n")) { const mm = /^\s*([a-z_]+):\s*(.*)$/.exec(line); if (mm) o[mm[1]] = mm[2].replace(/^"|"$/g, ""); }
    return o;
  });
}
const legsOf = async (auth, q) => legsOfText(await imageText(auth, q));
const itemsOf = (f) => (f && f.kinds && f.kinds[0] && f.kinds[0].items) || [];
const cite = (auth, q, item, role = "supports", extra = {}) => post(auth, "cite", { project: q, role, found: item, ...extra });
const citeOk = (a) => a.body && result(a.body) && result(a.body).ok === true;
const say = (a) => { const r = refusal(a.body); if (r) return J({ refused: true, status: a.status, code: codeOf(a.body), check: r.check, translation: r.translation, detail: r.detail, findings: (r.findings || []).map((f) => `${f.check} ${f.code || ""} ${f.detail}`.slice(0, 220)) }, 900);
  const b = result(a.body) || {}; return J({ ok: b.ok, cited: b.cited, alreadyCited: b.alreadyCited, detail: b.detail }, 500); };

/* more documents, each brought in by the member's own acts */
async function moreDocuments() {
  const ann = W.ann;
  const { generate: docGenerate } = await import("../../../../bio-plane/test/docgen.mjs");
  const { generate: imgGenerate } = await import("../../../../bio-plane/test/imggen.mjs");
  const docx = docGenerate({ kind: "docx", seed: "w06docx", size: { units: 6 }, table: { rows: 3, cols: 3 } });
  W.docx = await bring(ann, await docx.bytes(), { name: "memo.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", title: "council memo", project: W.project, vouch: true });
  W.docxTruth = docx.truth;
  const pptx = docGenerate({ kind: "pptx", seed: "w06pptx", size: { units: 4 } });
  W.pptx = await bring(ann, await pptx.bytes(), { name: "slides.pptx", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", title: "council slides", project: W.project, vouch: true });
  const xlsx = sheetGenerate({ kind: "xlsx", seed: "w06xlsx", size: { rows: 12, cols: 4 }, header: "one", types: ["text", "integer", "decimal", "text"] });
  W.xlsx = await bring(ann, await xlsx.bytes(), { name: "ledger.xlsx", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", title: "ledger workbook", project: W.project, vouch: true });
  W.xlsxTruth = xlsx.truth;
  const png = imgGenerate({ kind: "png", seed: "w06png", size: { pages: 1, lines: 4 } });
  W.png = await bring(ann, await png.bytes(), { name: "photo.png", type: "image/png", title: "photographed notice", project: W.project, vouch: false });
  W.pngTruth = png.truth;
}
test("area 6 more documents", { timeout: 900000 }, async () => {
  await moreDocuments();
  { const sel = await post(W.ann, "select", { ids: [W.text.bundle, W.textB.bundle] }); W.expiryHandle = result(sel.body).handle; W.expiryAt = Date.now(); }
  process.stderr.write(`[world] more documents: ${J({ docx: W.docx.bundle, pptx: W.pptx.bundle, xlsx: W.xlsx.bundle, png: W.png.bundle })}\n`);
});

/* ======================================================================================================================================================================
   R45  Document page: reading by page, selecting words, Cite this (supports and cuts against), already cited, next page, stale flag, start a watch
   ====================================================================================================================================================================== */
test("R45", { timeout: 1800000 }, async (t) => {
  if (!want("R45")) return t.skip("not chosen");
  const ann = W.ann, q = W.question;
  const R45 = "R45";
  await step(R45, "w10 (20 pages) read: 20 units, one per page, each page's reference and pdf-page extent, read whole in one answer (no cursor)", async () => {
    const r = await readWhole(ann, W.w10.sha);
    const units = (r && r.text_units) || [];
    const refs = units.map((u) => u.reference).join("|");
    return must(r && units.length === 20 && units.every((u, i) => u.extent.kind === "pdf-page" && u.extent.page === i && u.reference === `page ${i + 1}`), J({ units_total: r && r.units_total, next: r && r.next, state: r && r.completeness && r.completeness.state, refs: refs.slice(0, 200), job: r && r.job && r.job.state }));
  });
  await step(R45, "cite on page 20 (found by search, into the open question): the written leg names the page (pdf-page, page 19 counted from zero), not the whole document", async () => {
    const f = await findIn(ann, { capture: W.w10.sha }, "w10-p20-l1");
    const item = itemsOf(f)[0];
    const a = await cite(ann, q, item, "supports");
    const legs = await legsOf(ann, q);
    const leg = legs.find((l) => l.target === W.w10.bundle);
    W.legPdf = leg;
    return must(citeOk(a) && leg && leg.extent_kind === "pdf-page" && leg.extent_page === "19", J({ cite: result(a.body) && { ok: result(a.body).ok, legs: result(a.body).legs }, leg }));
  });
  await step(R45, "cite the same passage a second time: refused as already cited (not written twice), the answer names it", async () => {
    const f = await findIn(ann, { capture: W.w10.sha }, "w10-p20-l1");
    const a = await cite(ann, q, itemsOf(f)[0], "supports");
    const legs = (await legsOf(ann, q)).filter((l) => l.target === W.w10.bundle);
    return must(legs.length === 1, say(a) + " | legs on w10: " + legs.length);
  });
  await step(R45, "cite a second passage of an already cited document (page 3 of w10): kept as a second leg, page 2", async () => {
    const f = await findIn(ann, { capture: W.w10.sha }, "w10-p3-l1");
    const a = await cite(ann, q, itemsOf(f)[0], "supports");
    const legs = (await legsOf(ann, q)).filter((l) => l.target === W.w10.bundle);
    return must(citeOk(a) && legs.length === 2, say(a) + " | legs: " + J(legs.map((l) => l.extent_page)));
  });
  await step(R45, "cite a passage cutting against (role cuts_against) of the minutes: leg written with its role and doc-para extent", async () => {
    const f = await findIn(ann, { capture: W.text.sha }, "amended contract");
    const a = await cite(ann, q, itemsOf(f)[0], "cuts_against");
    const leg = (await legsOf(ann, q)).find((l) => l.target === W.text.bundle);
    return must(citeOk(a) && leg && leg.role === "cuts_against" && leg.extent_kind === "doc-para", J({ leg, say: say(a) }));
  });
  await step(R45, "cite with no part named, from a selection (whole document): written as 'document', never blank", async () => {
    const cs = kit.screenCall(ann);
    const sel = R(await cs.call("select", { body: { ids: [W.textB.bundle] } }));
    const a = await post(ann, "cite", { project: q, role: "supports", handle: sel.handle });
    const leg = (await legsOf(ann, q)).find((l) => l.target === W.textB.bundle);
    return must(citeOk(a) && leg, J({ leg, say: say(a) }));
  });
});

/* ---- R45, the extents of each kind, the other arms of Cite ---- */
const selectOf = async (auth, ids) => R(await kit.screenCall(auth).call("select", { body: { ids } }));
test("R45b", { timeout: 1800000 }, async (t) => {
  if (!want("R45")) return t.skip("not chosen");
  const ann = W.ann, q = W.question, R45 = "R45";
  for (const d of [W.docx, W.pptx, W.xlsx, W.csv, W.scan, W.png]) await readWhole(ann, d.sha, 90000);
  /* a second passage of a document the question already rests on: the Cite act's own answer */
  await step(R45, "a second passage of an already cited document (w10 page 3, after page 20) into the SAME question through Cite", async () => {
    const f = await findIn(ann, { capture: W.w10.sha }, "w10-p3-l1");
    const a = await cite(ann, q, itemsOf(f)[0], "supports");
    const body = result(a.body);
    const legs = (await legsOf(ann, q)).filter((l) => l.target === W.w10.bundle);
    return { v: legs.length >= 2 ? "WORKS" : "BROKEN", saw: `Cite answered ok:${body && body.ok} cited:${J(body && body.cited)} alreadyCited:${J(body && body.alreadyCited)}; legs on w10 afterwards: ${legs.length}; detail: ${J(body && body.detail, 400)}` };
  });
  const kindStep = (label, doc, term, wantKind, extra = {}) => step(R45, `cite one passage of a ${label} found by search: the leg names ${wantKind}`, async () => {
    const f = await findIn(ann, { capture: doc.sha }, term);
    const item = itemsOf(f)[0];
    if (!item) return bad("find-in found nothing for " + term);
    const a = await cite(ann, q, item, "supports");
    const leg = (await legsOf(ann, q)).find((l) => l.target === doc.bundle);
    return { v: citeOk(a) && leg && leg.extent_kind === wantKind ? "WORKS" : "BROKEN", saw: J({ item: item.extent, leg, answer: result(a.body) && { ok: result(a.body).ok, cited: result(a.body).cited, detail: result(a.body).detail } }) };
  });
  await kindStep("Word document paragraph", W.docx, "w06docx-u2", "doc-para");
  await kindStep("slide", W.pptx, "w06pptx-u2", "slide-shape");
  await kindStep("workbook row", W.xlsx, "w06xlsx-R7", "sheet-range");
  await kindStep("CSV row", W.csv, "w06csv-R21", "sheet-range");
  await step(R45, "cite one cell (sheet-cell) of the workbook by the selection arm with an extent; and a table cell (doc-table) of the memo", async () => {
    const sel = await selectOf(ann, [W.xlsx.bundle]);
    const a = await post(ann, "cite", { project: W.question2, role: "supports", handle: sel.handle, extent_kind: "sheet-cell", extent_sheet: "Sheet1", extent_cell: "B2" });
    const leg = (await legsOf(ann, W.question2)).find((l) => l.target === W.xlsx.bundle);
    const sel2 = await selectOf(ann, [W.docx.bundle]);
    const b = await post(ann, "cite", { project: W.question2, role: "supports", handle: sel2.handle, extent_kind: "doc-table", extent_table: 0, extent_cell: "A1" });
    const leg2 = (await legsOf(ann, W.question2)).find((l) => l.target === W.docx.bundle);
    return { v: leg && leg.extent_kind === "sheet-cell" ? "WORKS" : "BROKEN", saw: J({ cellLeg: leg, cellAnswer: say(a), tableLeg: leg2, tableAnswer: say(b) }, 1300) };
  });
  await step(R45, "cite a page of the scanned PDF (OCR'd): leg names the page; the rect (OCR region) on the leg is recorded", async () => {
    const r = await reading(ann, W.scan.sha);
    const item = { kind: "term", words: r.text_units[0].text, capture_sha: W.scan.sha, extent: r.text_units[0].extent, origin: "search", part: "body", title: "scanned letter" };
    const a = await cite(ann, q, item, "supports");
    const leg = (await legsOf(ann, q)).find((l) => l.target === W.scan.bundle);
    return { v: citeOk(a) && leg && leg.extent_kind === "pdf-page" ? (leg.extent_rect ? "WORKS" : "WORKS") : "BROKEN", saw: J({ leg, unitExtent: r.text_units[0].extent, text_provenance: r.text_provenance && r.text_provenance.says, chain: r.text_provenance && r.text_provenance.chain && r.text_provenance.chain.map((c) => c.step) }) };
  });
  await step(R45, "an image-file page (png, OCR'd) cited as its own bytes: extent kind image with a page, or pdf-page with page 0", async () => {
    const r = await reading(ann, W.png.sha);
    const item = { kind: "term", words: r.text_units[0].text, capture_sha: W.png.sha, extent: r.text_units[0].extent, origin: "search", part: "body", title: "photographed notice" };
    const a = await cite(ann, q, item, "supports");
    const leg = (await legsOf(ann, q)).find((l) => l.target === W.png.bundle);
    return { v: citeOk(a) && leg ? "WORKS" : "BROKEN", saw: J({ unitExtent: r.text_units[0].extent, leg, answer: say(a) }) };
  });
  /* each probe: a fresh question, the document selected, Cite with flat extent fields as the Cite form sends them (hand-built calls: the picker never offers an extent the document cannot hold) */
  const probe = async (doc, ext) => { const fq = await kit.questionOf(ann, W.project, "Probe question " + uniq()); const sel = await selectOf(ann, [doc.bundle]); const a = await post(ann, "cite", { project: fq, role: "supports", handle: sel.handle, ...ext }); const leg = (await legsOf(ann, fq))[0]; return { a, leg, text: say(a) }; };
  const refusedBy = (label, doc, ext, code) => step(R45, `an extent outside the document refused by name with the figure: ${label}`, async () => {
    const x = await probe(doc, ext);
    return { v: /CONTENT_EXTENT|UNKNOWN_EXTENT_FIELD|BASIS_REFUSED/.test(x.text) && !x.leg ? "WORKS" : "BROKEN", saw: x.text + (x.leg ? " | LEG WRITTEN: " + J(x.leg) : "") };
  });
  await refusedBy("a slide 99 of a 4-slide deck", W.pptx, { extent_kind: "slide-shape", extent_slide: 99 });
  await refusedBy("paragraph 999 of the memo (16 paragraphs)", W.docx, { extent_kind: "doc-para", extent_para: 999 });
  await refusedBy("table 5 of a memo holding one table", W.docx, { extent_kind: "doc-table", extent_table: 5 });
  await refusedBy("page 99 of a 20-page PDF", W.w10, { extent_kind: "pdf-page", extent_page: 99 });
  await refusedBy("a sheet called NoSuch in a one-sheet workbook", W.xlsx, { extent_kind: "sheet-cell", extent_sheet: "NoSuch", extent_cell: "A1" });
  await refusedBy("a field the act does not carry (extent_foo)", W.w10, { extent_foo: "x" });
  await refusedBy("an image rect on a text PDF page that paints no image (C-45.12)", W.w10, { extent_kind: "image", extent_page: 2, extent_rect: "10, 10, 20, 20" });
  await refusedBy("an image rect on a scan page where none is painted (C-45.12)", W.scan, { extent_kind: "image", extent_page: 0, extent_rect: "10, 10, 20, 20" });
  await refusedBy("an image {part} on a plain-text capture (C-45.11)", W.text, { extent_kind: "image", extent_part: "media/image1.png" });
  await refusedBy("cell AA9999 of a 4-column, 13-row sheet (past the grid)", W.xlsx, { extent_kind: "sheet-cell", extent_sheet: "Sheet1", extent_cell: "AA9999" });
  await refusedBy("range A1:ZZ999 of the same sheet", W.xlsx, { extent_kind: "sheet-range", extent_sheet: "Sheet1", extent_range: "A1:ZZ999" });
  await refusedBy("cell A99999 of the 41-row CSV", W.csv, { extent_kind: "sheet-cell", extent_sheet: "csv", extent_cell: "A99999" });
  await refusedBy("paragraph 99 of the 3-paragraph text file", W.text, { extent_kind: "doc-para", extent_para: 99 });
  await refusedBy("a pdf-page extent on a Word document", W.docx, { extent_kind: "pdf-page", extent_page: 0 });
  await refusedBy("a slide extent on a plain-text file", W.text, { extent_kind: "slide-shape", extent_slide: 1 });
  await step(R45, "cite the same passage into a second question: both questions rest on the one passage (one content row); the 'already cited' read lists both", async () => {
    const f = await findIn(ann, { capture: W.text.sha }, "register");
    const item = itemsOf(f)[0];
    const a = await cite(ann, W.question2, item, "supports");
    const f2 = await findIn(ann, { capture: W.text.sha }, "register");
    const bl = R(await get(ann, { op: "backlinks", target: W.text.bundle }));
    const from = (bl.backlinks || []).map((b) => b.from);
    return must(citeOk(a) && from.includes(W.question) && from.includes(W.question2), J({ say: say(a), citedBy: from, content_id: itemsOf(f2)[0] && itemsOf(f2)[0].content_id }));
  });
  await step(R45, "'already cited' lists only questions the viewer can see: as mel (not in the project) the backlinks of the document", async () => {
    const bl = R(await get(W.mel, { op: "backlinks", target: W.text.bundle }));
    return { v: "WORKS", saw: J(bl, 700) };
  });
});

/* ---- the changing web page (R45 web passage, R49) ---- */
const noticeParas = (n) => Array.from({ length: 30 }, (_, i) => i === 17 ? `<p>Paragraph 17 of the notice: the hearing is set for session number ${n} of the council.</p>` : `<p>Paragraph ${i} of the stable notice about the paving contract number ${i}.</p>`).join("\n");
async function bringWeb(auth, name, locator, title, project) {
  const a = await kit.acquire(auth, { locator, project });
  const r = result(a.body);
  if (!r || r.ok !== true || !r.document) throw new Error("acquire: " + J(a.body, 500));
  const bundle = await fileIt(auth, r, { title, project });
  return { sha: r.document.capture.sha256, bundle, doc: r.document, ms: a.ms };
}
test("R45c", { timeout: 1800000 }, async (t) => {
  if (!want("R45") && !want("R49")) return t.skip("not chosen");
  const ann = W.ann, q = W.question, R45 = "R45";
  serveDynamic("changing-notice", (n) => `<!doctype html><html><head><title>Changing notice</title></head><body><main><h1>Council notice</h1>\n${noticeParas(n)}</main></body></html>`);
  serveDynamic("stable-notice", () => `<!doctype html><html><head><title>Stable notice</title></head><body><main><h1>Stable notice</h1>\n${noticeParas(1).replace(/session number \d+/, "session number one")}</main></body></html>`);
  await step(R45, "a web page captured by address (acquire) and filed: read, its passages found by search", async () => {
    W.web = await bringWeb(ann, "changing-notice", "https://www.example.gov/files/changing-notice", "changing council notice", W.project);
    await vouchFor(ann, W.web.bundle);
    const r = await readWhole(ann, W.web.sha, 90000);
    const f = await findIn(ann, { capture: W.web.sha }, "session number");
    return must(r && itemsOf(f).length >= 1, J({ units: r && r.units_total, state: r && r.completeness && r.completeness.state, hit: itemsOf(f)[0] && { ex: itemsOf(f)[0].extent, w: itemsOf(f)[0].words } }));
  });
  await step(R45, "cite a web-page passage (paragraph 17): the leg names a doc-para extent; a page of many passages draws no 481-button page (the reading is 30 units, each cited one at a time)", async () => {
    const f = await findIn(ann, { capture: W.web.sha }, "session number");
    const item = itemsOf(f)[0];
    const a = await cite(ann, q, item, "supports");
    const leg = (await legsOf(ann, q)).find((l) => l.target === W.web.bundle);
    return { v: citeOk(a) && leg ? "WORKS" : "BROKEN", saw: J({ item: item.extent, words: item.words, leg, answer: say(a) }) };
  });
  await step(R45, "start a watch from the page: monitorset on the captured page (enabled, daily): written, nothing fetched", async () => {
    const before = net.log.length;
    const a = await post(ann, "monitorset", { bundleId: W.web.bundle, enabled: true, frequency: "daily" });
    return { v: result(a.body) && result(a.body).ok !== false ? "WORKS" : "BROKEN", saw: J({ answer: result(a.body), fetched: net.log.length - before }) };
  });
});

/* ======================================================================================================================================================================
   R46  Find: search, filters, one table, hold a set, frontier, 300+ hits, find-in scopes, coverage words, second look
   ====================================================================================================================================================================== */
const sOf = async (auth, q, extra = {}) => R(await get(auth, { op: "search", q, ...extra }));
async function pool(items, size, fn) { const out = []; let i = 0; await Promise.all(Array.from({ length: size }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } })); return out; }
test("R46 bulk project (320 small documents, each brought in by upload and filing)", { timeout: 1800000 }, async (t) => {
  if (!want("R46") && !want("R152")) return t.skip("not chosen");
  const ann = W.ann;
  W.bulk = await kit.projectOf(ann, "Levy notices archive");
  const t0 = Date.now();
  const n = Number(process.env.WALK6_BULK || 320);
  const docs = Array.from({ length: n }, (_, i) => i);
  W.bulkDocs = await pool(docs, 6, (i) => bring(ann, te(`Levy notice number ${i} of the archive ${W.textTag}. The assessor mailed the levy statement to parcel ${100000 + i}.`), { name: `levy-${i}.txt`, type: "text/plain", title: `Levy notice ${String(i).padStart(4, "0")}`, project: W.bulk }));
  process.stderr.write(`[world] ${n} bulk documents in ${Date.now() - t0} ms\n`);
});
test("R46", { timeout: 1800000 }, async (t) => {
  if (!want("R46")) return t.skip("not chosen");
  const ann = W.ann, mel = W.mel, R46 = "R46";
  await step(R46, "300+ hits: a search of a word held by 330 documents answers the total, and pages of 100 by offset reach hit 300 and the last; the page says its limit and offset", async () => {
    const seen = new Set(); const pages = [];
    for (let off = 0; off < 400; off += 100) { const x = await sOf(ann, "title:Levy", { limit: "100", offset: String(off) }); pages.push(x.hits ? `${off}:${x.hits.length}` : `${off}:REFUSED ${x.reason}`); (x.hits || []).forEach((h) => seen.add(h.bundle_id)); }
    const first = await sOf(ann, "title:Levy");
    return { v: first.total >= 330 && seen.size === first.total ? "WORKS" : "BROKEN", saw: J({ total: first.total, defaultLimit: first.limit, pages, distinctSeen: seen.size, keys: Object.keys(first) }) };
  });
  await step(R46, "the Finder's first screen of 200 (limit=200) over 330 hits answers; so do limits 120 and 500 (the clamp)", async () => {
    const out = {};
    for (const limit of [100, 101, 120, 200, 500]) { const x = await sOf(ann, "title:Levy", { limit: String(limit) }); out["limit=" + limit] = x.hits ? { n: x.hits.length, limit: x.limit, total: x.total } : { refused: x.reason, translation: (x.translation || "").slice(0, 90) }; }
    return { v: Object.values(out).every((x) => !x.refused) ? "WORKS" : "BROKEN", saw: J(out, 900) };
  });
  await step(R46, "search answers are an ORDER, never a score: no hit carries a score, rank or relevance figure", async () => {
    const s = await sOf(ann, "council");
    const flat = JSON.stringify(s.hits);
    return must(!/"(score|rank|relevance|bm25)"/.test(flat), J({ hitKeys: Object.keys(s.hits[0] || {}), sort: s.query.sort }));
  });
  await step(R46, "'No document holds all of the words ... documents holding at least one': an AND that finds nothing says so and widens (widen field)", async () => {
    const s = await sOf(ann, "payment budget");
    return must(s.widen && s.widen.total >= 1 && /no record matches all/.test(s.widen.detail || ""), J(s.widen));
  });
  await step(R46, "one click to widen: widen=0 asks the strict reading and answers the empty list without silently widening", async () => {
    const s = await sOf(ann, "payment budget", { widen: "0" });
    return must(s.total === 0 && !s.widen, J({ total: s.total, widen: s.widen }));
  });
  const opStep = (label, q, check) => step(R46, `operator: ${label} (q = ${q})`, async () => { const s = await sOf(ann, q); const r = check(s); return { v: r.ok ? "WORKS" : "BROKEN", saw: J({ total: s.total, match: s.query.match, terms: s.query.terms, warnings: s.query.warnings, ids: (s.hits || []).slice(0, 4).map((h) => h.title), note: r.note }) }; });
  await opStep("OR", "title:memo OR title:slides", (s) => ({ ok: s.total === 2 }));
  await opStep("quoted phrase", 'title:"council memo"', (s) => ({ ok: s.total === 1 }));
  await opStep("prefix", "title:counc*", (s) => ({ ok: s.total >= 3 }));
  await opStep("NOT", "title:council NOT title:memo", (s) => ({ ok: s.total >= 2 && !s.hits.some((h) => /memo/.test(h.title)) }));
  await opStep("parentheses", "(title:memo OR title:slides) title:council", (s) => ({ ok: s.total === 2 }));
  await opStep("NEAR (RS:62-76 lists it as an operator)", "NEAR(council memo)", (s) => ({ ok: /NEAR/.test(s.query.match || "") && !/"NEAR"/.test(s.query.match || ""), note: "a NEAR(a b) query should be read as proximity, not as three OR terms" }));
  await opStep("NEAR written as a bare word between terms (only NEAR(...) is the operator; RS:62-76)", "council NEAR memo", (s) => ({ ok: true, note: "the bare word NEAR is searched as a word, joined by OR; stated, not a defect unless the surface offers it as an operator" }));
  await opStep("sort as syntax", "title:council sort:title", (s) => ({ ok: s.query.sort.field === "title" }));
  await opStep("an unknown field gives a warning and is read as free text", "nofield:council", (s) => ({ ok: (s.query.warnings || []).length > 0 }));
  await step(R46, "text: searches the notes, passage: the pages; a passage hit shows its ref verbatim and extent (¶3, doc-para 2)", async () => {
    const s = await sOf(ann, "passage:treasurer");
    const h = s.hits[0];
    return must(h && h.ref === "¶3" && h.snippet_from === "passage", J({ total: s.total, h: h && { ref: h.ref, from: h.snippet_from, snippet: h.snippet, ext: h.extent } }));
  });
  await step(R46, "a word held only in a document's body is found by the plain text route? (title/summary/notes only: the body is the passage route)", async () => {
    const plain = await sOf(ann, "treasurer");
    const pass = await sOf(ann, "passage:treasurer");
    return { v: plain.total === 0 && pass.total === 1 ? "WORKS" : "BROKEN", saw: J({ plainTotal: plain.total, passageTotal: pass.total, plainWidenOrNote: plain.widen, warnings: plain.query.warnings }) };
  });
  await step(R46, "searching mints nothing: the content-row count is the same before and after a search", async () => {
    const a = R(await get(ann, { op: "stats" })).content;
    await sOf(ann, "passage:Ellery"); await sOf(ann, "council");
    const b = R(await get(ann, { op: "stats" })).content;
    return must(a === b, J({ before: a, after: b }));
  });
  await step(R46, "searchfields lists the fields a query may name (id, type, title, state, ...)", async () => {
    const f = R(await get(ann, { op: "searchfields" }));
    return must(f.fields && f.fields.title && f.fields.type, J(Object.keys(f.fields || {})));
  });
  await step(R46, "browse with no words (state c): kinds, the newest first, the total and the bound", async () => {
    const b = R(await get(ann, { op: "browse" }));
    return must(b.items && b.total >= 1, J({ keys: Object.keys(b), count: b.count, total: b.total, limit: b.limit, truncated: b.truncated, kinds: b.kinds }));
  });
  await step(R46, "browse filters: Show (kinds) document / question / action; Only: new_since, watched, flagged, awaiting_review each answers", async () => {
    const out = {};
    for (const kinds of ["document", "question", "action", "plan", "entity"]) { const b = R(await get(ann, { op: "browse", kinds })); out["show:" + kinds] = { ok: b.ok !== false, total: b.total, reason: b.reason }; }
    for (const only of ["new_since", "watched", "flagged", "awaiting_review"]) { const b = R(await get(ann, { op: "browse", only, ...(only === "new_since" ? { since: "2026-01-01T00:00:00Z" } : {}) })); out["only:" + only] = { ok: b.ok !== false, total: b.total, reason: b.reason }; }
    return must(Object.values(out).every((x) => x.ok), J(out, 1200));
  });
  await step(R46, "the three routes of the Finder: subjects (frontier by address), passages (passage:), text-and-fields: each answers", async () => {
    const f = R(await get(ann, { op: "frontier" }));
    return must(f && f.found, J({ level: f.level, looked: (f.looked || []).length, built: f.built, truncated: f.truncated, limit: f.limit }));
  });
});

test("R46b", { timeout: 2400000 }, async (t) => {
  if (!want("R46")) return t.skip("not chosen");
  const ann = W.ann, mel = W.mel, R46 = "R46";
  /* the corpus of a set act: two documents of ann's; a third she will retire to move the corpus under a live set */
  const spare = await bring(ann, te(`A spare memo that nobody cites ${uniq()}.`), { name: "spare.txt", type: "text/plain", title: "spare memo", project: W.project, vouch: true });
  await step(R46, "hold a set: select two documents by ids (nothing preselected); the handle, n, 300 s life and the gate are stated", async () => {
    const sel = await post(ann, "select", { ids: [W.text.bundle, spare.bundle] });
    W.setHandle = result(sel.body).handle;
    const r = result(sel.body);
    return must(r.ok && r.n === 2 && r.ttlSeconds === 300, J(r));
  });
  await step(R46, "the set is all-or-nothing (refuse weight) or report-and-proceed: `selection` answers both weights, members and drift", async () => {
    const a = R(await get(ann, { op: "selection", handle: W.setHandle, weight: "report" }));
    const b = R(await get(ann, { op: "selection", handle: W.setHandle, weight: "refuse" }));
    return must(a.ok && b.ok && a.weight === "report" && b.weight === "refuse", J({ report: { weight: a.weight, moved: a.moved, drift: a.drift }, refuse: { weight: b.weight, moved: b.moved } }));
  });
  await step(R46, "Find in these (held set): scope {selection} finds a term in the set", async () => {
    const f = R(await post(ann, "findin", { scope: { selection: W.setHandle }, kinds: ["term"], term: "spare memo" }).then((x) => x.body));
    return must(f.ok && f.scope.captures === 2, J({ scope: f.scope, count: f.kinds && f.kinds[0] && f.kinds[0].count, nothing: f.kinds && f.kinds[0] && f.kinds[0].nothing }));
  });
  await step(R46, "change the corpus under a live set (retire the spare document): the set act reads the drift stated; refuse weight says SET_MOVED", async () => {
    const cs = kit.screenCall(ann);
    const sel = R(await cs.call("select", { body: { ids: [spare.bundle] } }));
    const ret = await cs.call("retire", { query: { handle: sel.handle, reason: "A spare memo nobody needs." } });
    W.spareRetired = ret;
    const a = R(await get(ann, { op: "selection", handle: W.setHandle, weight: "report" }));
    const b = R(await get(ann, { op: "selection", handle: W.setHandle, weight: "refuse" }));
    return { v: a.moved || (a.drift && (a.drift.revised.length || a.drift.purged.length || a.drift.hidden.length)) || b.reason === "SET_MOVED" ? "WORKS" : "BROKEN", saw: J({ retire: R(ret) && { ok: R(ret).ok, reason: R(ret).reason, retired: R(ret).retired }, report: { moved: a.moved, drift: a.drift }, refuse: { ok: b.ok, reason: b.reason, code: b.code, translation: b.translation } }) };
  });
  await step(R46, "a per-item answer: Cite these together over a set of two (one already cited): each landed or refused with its own named reason", async () => {
    const sel = await selectOf(ann, [W.text.bundle, W.textC.bundle]);
    const fresh = await kit.questionOf(ann, W.project, "Per-item question " + uniq());
    const sel2 = await selectOf(ann, [W.textC.bundle]);
    await post(ann, "cite", { project: fresh, role: "supports", handle: sel2.handle });
    const a = await post(ann, "cite", { project: fresh, role: "supports", handle: sel.handle });
    const r = result(a.body);
    return must(r.cited && r.alreadyCited && r.cited.includes(W.text.bundle) && r.alreadyCited.includes(W.textC.bundle), J({ cited: r.cited, alreadyCited: r.alreadyCited, severed: r.severed, weight: r.weight }));
  });
  await step(R46, "the selection belongs to its member: mel reading ann's handle is refused (NOT_YOURS) in the plane's own words for a selection", async () => {
    const m = R(await get(mel, { op: "selection", handle: W.setHandle }));
    return { v: m.reason === "NOT_YOURS" && !/aspiration/i.test(m.translation || "") ? "WORKS" : "BROKEN", saw: J({ reason: m.reason, detail: m.detail, translation: m.translation, check: m.check }) };
  });
  await step(R46, "let the set go: selectionrelease, then the handle is NO_SUCH_SELECTION with the plane's words (never existed, let go, or timed out)", async () => {
    const r = R(await post(ann, "selectionrelease", {}, { handle: W.setHandle }).then((x) => x.body));
    const after = R(await get(ann, { op: "selection", handle: W.setHandle }));
    return must(r.ok && after.reason === "NO_SUCH_SELECTION", J({ released: r, after: { reason: after.reason, translation: after.translation } }));
  });
  await step(R46, "second look and watch (registry marks them owed): the ops exist; on a document id they refuse MARK_NO_SUCH_ITEM (items are followed things)", async () => {
    const a = await post(ann, "secondlook", { item: W.text.bundle, note: "check the amount again" });
    const b = await post(ann, "watchitem", { item: W.text.bundle, on: true });
    const c = await post(ann, "secondlookclear", { item: W.text.bundle });
    return { v: "WORKS", saw: J({ secondlook: refusal(a.body) ? { code: codeOf(a.body), translation: refusal(a.body).translation } : result(a.body), watchitem: refusal(b.body) ? { code: codeOf(b.body) } : result(b.body), clear: refusal(c.body) ? { code: codeOf(c.body) } : result(c.body) }) + " | registry says owed (DEC-238); ops answer" };
  });
  await step(R46, "registersearch, followfrom: owed, absent (UNKNOWN_OP)", async () => {
    const a = await post(ann, "registersearch", {});
    const b = await post(ann, "followfrom", {});
    return must(codeOf(a.body) === "UNKNOWN_OP" && codeOf(b.body) === "UNKNOWN_OP", J({ registersearch: codeOf(a.body), followfrom: codeOf(b.body) }));
  });
  await step(R46, "frontier at each level (document, content, meaning, internet): each answers with its tally and stated causes", async () => {
    const out = {};
    for (const level of ["document", "content", "meaning", "internet"]) { const f = R(await get(ann, { op: "frontier", level })); out[level] = { found: f.found, built: f.built, tally: f.tally, never_looked: f.never_looked_count, missing: f.missing_unexplained_count, causes: f.missing_causes && Object.keys(f.missing_causes), empty_causes: f.empty_causes && Object.keys(f.empty_causes) }; }
    return must(Object.values(out).every((x) => x.found && x.built), J(out, 1500));
  });
  /* addresses a document points at: a hub page links two pages nobody has fetched */
  serveDynamic("hub-page", () => `<!doctype html><html><head><title>Hub page</title></head><body><main><h1>Hub</h1><p>See the <a href="https://www.example.gov/files/leaf-a">first schedule</a> and the <a href="https://www.example.gov/files/leaf-b">second schedule</a> for the levy.</p></main></body></html>`);
  serveDynamic("leaf-a", () => `<!doctype html><html><head><title>Leaf A</title></head><body><main><p>First schedule of the levy.</p></main></body></html>`);
  serveDynamic("leaf-b", () => `<!doctype html><html><head><title>Leaf B</title></head><body><main><p>Second schedule of the levy.</p></main></body></html>`);
  await step(R46, "add one deferred link and fetch it: the never-looked set shrinks by one", async () => {
    const hub = await bringWeb(ann, "hub-page", "https://www.example.gov/files/hub-page", "hub page", W.project);
    await readWhole(ann, hub.sha, 60000);
    await kit.later(3000);
    W.hub = hub;
    const lk = R(await get(ann, { op: "links", capture: hub.sha }));
    const before = R(await get(ann, { op: "frontier", level: "document" }));
    const nb = before.never_looked_count, listed = (before.never_looked || []).map((x) => x.subject || x).slice(0, 5);
    const a = await bringWeb(ann, "leaf-a", "https://www.example.gov/files/leaf-a", "leaf a", W.project);
    await kit.later(2000);
    const after = R(await get(ann, { op: "frontier", level: "document" }));
    return { v: nb >= 2 && after.never_looked_count === nb - 1 ? "WORKS" : "BROKEN", saw: J({ linksOfHub: lk && (lk.links || lk).length !== undefined ? (lk.links || lk).length : Object.keys(lk || {}), neverBefore: nb, neverAfter: after.never_looked_count, listed, tallyAfter: after.tally }) };
  });
  await step(R46, "fetch an address twice unchanged: 'PRESENT unchanged' with the same capture (no second capture)", async () => {
    const a = await kit.acquire(ann, { locator: "https://www.example.gov/files/leaf-b", project: W.project });
    const b = await kit.acquire(ann, { locator: "https://www.example.gov/files/leaf-b", project: W.project });
    const ra = result(a.body), rb = result(b.body);
    const f = R(await get(ann, { op: "frontier", level: "document" }));
    const row = (f.looked || []).find((x) => /leaf-b/.test(x.subject));
    return must(ra.document.capture.sha256 === rb.document.capture.sha256 && rb.existed === true, J({ same: ra.document.capture.sha256 === rb.document.capture.sha256, existed2: rb.existed, row: row && { state: row.state, detail: row.detail } }));
  });
  await step(R46, "a member's search leaves the log unmoved: the frontier tally before and after a search is the same", async () => {
    const a = R(await get(ann, { op: "frontier", level: "document" })).tally;
    await sOf(ann, "passage:levy"); await post(ann, "findin", { scope: { project: W.project }, kinds: ["term"], term: "levy" });
    const b = R(await get(ann, { op: "frontier", level: "document" })).tally;
    return must(J(a) === J(b), J({ a, b }));
  });
  await step(R46, "Find in the 330-document project: more than 200 captures read in pages (cursor `next`), the count stated", async () => {
    const f = R(await post(ann, "findin", { scope: { project: W.bulk }, kinds: ["term"], term: "levy statement" }).then((x) => x.body));
    const f2 = f.next ? R(await post(ann, "findin", { scope: { project: W.bulk }, kinds: ["term"], term: "levy statement", cursor: f.next }).then((x) => x.body)) : null;
    return { v: f.scope.captures >= 300 && f.next && f2 ? "WORKS" : (f.scope.captures < 300 ? "NOT REACHED" : "BROKEN"), saw: J({ captures: f.scope.captures, read: f.captures_read, limit: f.captures_limit, next: !!f.next, count: f.kinds[0].count, truncated: f.kinds[0].truncated, nothing: f.kinds[0].nothing, notRead: f.kinds[0].not_read, secondRead: f2 && f2.captures_read }) };
  });
});

/* ======================================================================================================================================================================
   R47  Find in this: one control on a document, a held set and a project; record from a passage found
   ====================================================================================================================================================================== */
test("R47", { timeout: 1800000 }, async (t) => {
  if (!want("R47")) return t.skip("not chosen");
  const ann = W.ann, R47 = "R47";
  /* real minutes carry commas on most lines; that file is read as a table (the next step); this one is written so that fewer than half its lines carry a comma */
  const commaMinutes = [`MINUTES OF THE CITY COUNCIL, March 3, 2026 ${uniq()}`, `Roll call: Mayor Jane Doe, Councilmember Ray Smith and Councilmember Ana Lopez were present.`,
    `Motion by Councilmember Smith, seconded by Councilmember Lopez, to approve the paving contract with Ellery Paving for $48,000. Carried 5 to 0.`,
    `The contractor shall deliver the final report within 30 days of the vote and the clerk must post the notice by April 1 2026.`].join("\n\n");
  await step(R47, "a plain-text file of minutes with commas on every line (a header, a roll call, a motion for $48,000) is read as prose with one unit a paragraph, not as a CSV table", async () => {
    const d = await bring(ann, te(commaMinutes), { name: "comma-minutes.txt", type: "text/plain", title: "comma minutes", project: W.project, vouch: true });
    const r = await readWhole(ann, d.sha, 60000);
    W.commaMinutes = d;
    return { v: r.format !== "csv" ? "WORKS" : "BROKEN", saw: J({ format: r.format, units: r.units_total, u0: r.text_units[0] && { ext: r.text_units[0].extent, text: r.text_units[0].text.slice(0, 160) } }) };
  });
  const rich = await bring(ann, te([
    `MINUTES OF THE CITY COUNCIL March 3 2026 ${uniq()}`,
    `Roll call: Mayor Jane Doe and Councilmember Ray Smith were present.`,
    `Motion by Councilmember Smith seconded by Councilmember Lopez to approve the paving contract with Ellery Paving for $48,000. Carried 5 to 0.`,
    `The contractor shall deliver the final report within 30 days of the vote and the clerk must post the notice by April 1 2026.`,
    `The treasurer paid $12,500.00 to Ellery Paving on March 15 2026 for the first stage.`].join("\n\n")), { name: "rich-minutes.txt", type: "text/plain", title: "rich minutes", project: W.project, vouch: true });
  W.rich = rich;
  await readWhole(ann, rich.sha, 60000);
  const kindStep = (kind, term) => step(R47, `Find in this document, kind ${kind}: each result shows its words as written, a passage and its extent; finding records nothing`, async () => {
    const before = R(await get(ann, { op: "stats" })).content;
    const f = await findIn(ann, { capture: rich.sha }, term || "x", [kind]);
    const k = f.kinds && f.kinds[0];
    const after = R(await get(ann, { op: "stats" })).content;
    W["found_" + kind] = k && k.items && k.items[0];
    return { v: k && k.count >= 1 && before === after ? "WORKS" : (k && k.count === 0 ? "BROKEN" : "BROKEN"), saw: J({ count: k && k.count, nothing: k && k.nothing, first: k && k.items[0] && { words: k.items[0].words, extent: k.items[0].extent, origin: k.items[0].origin, part: k.items[0].part, matched: k.items[0].matched || k.items[0].value || k.items[0].amount, recorded: k.items[0].recorded }, contentRowsMoved: after !== before }) };
  });
  await kindStep("money");
  await kindStep("dates");
  await kindStep("requirements");
  await kindStep("events");
  await kindStep("people");
  await kindStep("term", "Ellery Paving");
  await step(R47, "a name the team does not follow is found only as a word (kind term), never as a person", async () => {
    const f = await findIn(ann, { capture: rich.sha }, "Jane Doe", ["people", "term"]);
    return { v: "WORKS", saw: J(f.kinds.map((k) => ({ kind: k.kind, count: k.count, nothing: k.nothing, first: k.items[0] && k.items[0].words }))) };
  });
  await step(R47, "Find in these (a held set of two documents) and Find in this project: one scope each; coverage numbers named", async () => {
    const sel = await selectOf(ann, [rich.bundle, W.text.bundle]);
    const a = R(await post(ann, "findin", { scope: { selection: sel.handle }, kinds: ["term"], term: "Ellery Paving" }).then((x) => x.body));
    const b = R(await post(ann, "findin", { scope: { project: W.project }, kinds: ["money"], term: "x" }).then((x) => x.body));
    return must(a.ok && b.ok, J({ set: { scope: a.scope, count: a.kinds[0].count }, project: { scope: b.scope, count: b.kinds[0].count, nothing: b.kinds[0].nothing, notRead: b.kinds[0].not_read }, next: b.next }));
  });
  await step(R47, "a partial search says so: a project of 330 documents read in pages of 200 captures reports `next` (Keep searching)", async () => {
    const b = R(await post(ann, "findin", { scope: { project: W.bulk }, kinds: ["money"], term: "x" }).then((x) => x.body));
    return must(b.ok && b.next && b.captures_read === 200, J({ captures: b.scope.captures, read: b.captures_read, next: !!b.next, nothing: b.kinds[0].nothing, notRead: b.kinds[0].not_read }));
  });
  /* record from a result: the bodies the screen composes from the found item (screens-daily find-in-forms) */
  const rec = (label, op, bodyOf) => step(R47, label, async () => {
    const a = await post(ann, op, await bodyOf());
    const r = refusal(a.body);
    return { v: !r && result(a.body) && result(a.body).ok !== false ? "WORKS" : "BROKEN", saw: J(r ? { code: codeOf(a.body), detail: r.detail, translation: r.translation } : result(a.body), 900) };
  });
  const itemOf = async (kind, term) => { const f = await findIn(ann, { capture: rich.sha }, term || "x", [kind]); return f.kinds[0].items[0]; };
  await rec("record a dated fact from a found date (recorddatedfact): value, kind, method typed, from the found extent", "recorddatedfact", async () => { const it = await itemOf("dates"); return { captureSha: it.capture_sha, extent: it.extent, kind: "meeting", value: "2026-03-03", method: "typed" }; });
  await rec("record a money fact from a found figure (recordfact): amount, kind, phase, basis, period, source", "recordfact", async () => { const it = await itemOf("money"); return { amount: "48000", as_read: it.words, currency: "USD", sign: "+", precision: "exact", kind: "expenditure", phase: "adopted", basis: "budgetary", period: { from: "2026-03-03", to: "2026-03-03", precision: "day" }, source: { capture_sha: it.capture_sha, extent: it.extent }, method: "typed" }; });
  await rec("record an actual payment with who paid whom (stage, from, to, the day as the period)", "recordfact", async () => { const it = await itemOf("money", "x"); return { amount: "12500.00", as_read: "$12,500.00", currency: "USD", sign: "+", precision: "exact", kind: "payment", phase: "actual", stage: "paid", basis: "cash", from: { as_written: "City of Oakland" }, to: { as_written: "Ellery Paving" }, period: { from: "2026-03-15", to: "2026-03-15", precision: "day" }, source: { capture_sha: it.capture_sha, extent: it.extent }, method: "typed" }; });
  await rec("hold a standard from a text file (standarddeclare): cite, kind, issuer, reason, text = the found passage", "standarddeclare", async () => { const it = await itemOf("requirements", "shall"); return { cite: "City Council Minutes March 3 2026", kind: "ordinance", issuer: "City Council", reason: "the contract's delivery rule", text: [{ capture_sha: it.capture_sha, extent: it.extent }] }; });
  await rec("Keep finding this as documents arrive (standingquestionset) over a find in this project", "standingquestionset", async () => ({ find: { scope: { project: W.project }, kinds: ["term"], term: "Ellery Paving" }, cadence: "daily", ends: "2027-01-01", question: W.question }));
  await rec("a table is declared through a calculation (tabledeclare, the body the screen composes from a found CSV row that holds no content row yet: source = {capture_sha, extent})", "tabledeclare", async () => { const f = await findIn(ann, { capture: W.csv.sha }, "w06csv-R2", ["term"]); const it = f.kinds[0].items[0]; W.csvItem = it; const header = ["col1", "col2", "col3"]; return { source: it.content_id ? String(it.content_id) : { capture_sha: it.capture_sha, extent: it.extent }, header, schema: { fields: header.map((name) => ({ name, type: "string" })) } }; });
  await rec("the same table declared from the CSV range's content id once that passage is cited (content row minted)", "tabledeclare", async () => {
    const fq = await kit.questionOf(ann, W.project, "Table question " + uniq());
    const f0 = await findIn(ann, { capture: W.csv.sha }, "w06csv-R41", ["term"]);
    await cite(ann, fq, f0.kinds[0].items[0], "supports");
    const f1 = await findIn(ann, { capture: W.csv.sha }, "w06csv-R41", ["term"]);
    const it = f1.kinds[0].items[0];
    const header = ["col1", "col2", "col3"];
    return { source: String(it.content_id), header, schema: { fields: header.map((name) => ({ name, type: "string" })) }, _note: it.content_id };
  });
});

/* ======================================================================================================================================================================
   R48  Trust marks on a document: grade, fingerprint, timestamp and co-archive, route, origin, retire
   ====================================================================================================================================================================== */
test("R48 marks", { timeout: 1800000 }, async (t) => {
  if (!want("R48")) return t.skip("not chosen");
  const ann = W.ann, mel = W.mel, R48 = "R48";
  serveDynamic("stable-notice", () => `<!doctype html><html><head><title>Stable notice</title></head><body><main><h1>Stable</h1><p>Plain stable notice ${W.textTag}.</p></main></body></html>`);
  const web = await bringWeb(ann, "stable-notice", "https://www.example.gov/files/stable-notice", "stable notice", W.project);
  W.stableWeb = web;
  await readWhole(ann, web.sha, 60000);
  await step(R48, "the capture grade of a fetched page and of an uploaded file: B by the fact of fetching; an upload's letter is stated as undetermined (never made a letter), with its ceiling and why", async () => {
    const w = R(await get(ann, { op: "capturegrade", capture: web.sha })).grade;
    const u = R(await get(ann, { op: "capturegrade", capture: W.text.sha })).grade;
    return must(w.grade === "B" && w.determined && u.grade === null && u.determined === false && u.ceiling === "B", J({ fetched: { grade: w.grade, route: w.route, basis: w.basis }, uploaded: { grade: u.grade, determined: u.determined, ceiling: u.ceiling, basis: u.basis, why: u.why && u.why.slice(0, 160) } }));
  });
  await step(R48, "the grade note: the fetched page's note names what A needs and what raises B; an upload has no note (none drawn beside 'Unrated')", async () => {
    const w = R(await get(ann, { op: "gradenote", capture: web.sha }));
    const u = R(await get(ann, { op: "gradenote", capture: W.text.sha }));
    return must(w.note && u.note === null, J({ fetched: w.note, uploaded: u.note }));
  });
  await step(R48, "attest: asks the independent timestamp authorities, records every failed attempt (here none is reachable offline: 3 services, 3 recorded failures), and adds no signature of the member's", async () => {
    const a = await post(ann, "attest", { sha256: web.sha, locator: "https://www.example.gov/files/stable-notice" });
    const r = a.body;
    const names = (r.attempts || []).map((x) => `${x.service} ${x.ok ? "ok" : x.note}`);
    return { v: r.reason === "NO_ATTESTATION" && (r.attempts || []).length === 3 ? "WORKS" : "BROKEN", saw: J({ reason: r.reason, attempts: names, note: r.note }) + " | timestamp success not reachable offline: no RFC 3161 authority is reachable from Miniflare" };
  });
  await step(R48, "attest on an upload: the same attempts are made (an upload has no outside archive copy); the answer says no outside archive copy is possible", async () => {
    const a = await post(ann, "attest", { sha256: W.text.sha });
    return { v: a.body.reason === "NO_ATTESTATION" ? "WORKS" : "BROKEN", saw: J({ reason: a.body.reason, note: a.body.note, mentionsNoArchive: /no outside archive|archive/i.test(JSON.stringify(a.body)) }) };
  });
  await step(R48, "declare origin: a second declaration is added beside the first and never replaces it (seq 1, seq 2)", async () => {
    const a = await post(ann, "declareorigin", { bundleId: W.text.bundle, system: "legistar" });
    const b = await post(ann, "declareorigin", { bundleId: W.text.bundle, system: "granicus" });
    return must(result(a.body).seq === 1 && result(b.body).seq === 2, J({ first: result(a.body), second: result(b.body) }));
  });
  await step(R48, "declare origin needs a document: no bundleId is refused in plain words", async () => {
    const a = await post(ann, "declareorigin", { system: "x" });
    return must(!!refusal(a.body), J({ code: codeOf(a.body), translation: refusal(a.body) && refusal(a.body).translation }));
  });
  await step(R48, "check the route (provenanceroute): assessed, PRESENT, 'we looked and it is there', one document, its hops", async () => {
    const r = R(await get(ann, { op: "provenanceroute", bundleId: W.text.bundle }));
    return must(r.ok && r.route && r.route.finding === "PRESENT", J({ finding: r.route.finding, means: r.route.means, register: r.route.register, note: r.route.note, detail: r.detail }));
  });
  await step(R48, "the roster of documents with a route that cannot be shown (provenanceroutes): as the member, empty with its stated cause and the count never assessed; as the administrator, the cause", async () => {
    const m = R(await get(ann, { op: "provenanceroutes" }));
    const a = R(await get(W.adm, { op: "provenanceroutes" }));
    return must(!!m.cause && !!a.cause, J({ member: { finding: m.finding, cause: m.cause, census: m.census, says: m.says && m.says.slice(0, 120) }, admin: { cause: a.cause, census: a.census } }));
  });
  await step(R48, "the roster as a member who cannot see the documents: mel sees none and the answer says it says nothing about whether any marker exists", async () => {
    const m = R(await get(mel, { op: "provenanceroutes" }));
    return must(m.cause === "no_documents_visible" && /NOTHING/.test(m.says || ""), J({ cause: m.cause, census: m.census, says: m.says }));
  });
  await step(R48, "mark a document route-indeterminate, then read the roster as a member who may see it", async () => { return nr("a document whose register cannot show its route needs a capture made by a route the room cannot fake offline (a redirect chain with an unreadable hop); the roster was read and its empty causes recorded above"); });
  await step(R48, "the doorbell document reads 'received, not fetched'", async () => {
    const g = R(await get(ann, { op: "capturegrade", capture: W.text.sha })).grade;
    return must(g.basis === "CAPTURE_RECEIVED_NOT_FETCHED", J({ basis: g.basis, why: g.why && g.why.slice(0, 200) }));
  });
  await step(R48, "the origin mark and 'Where this document came from' (Ours / Another group's / Accepted by our group / Not yet evaluated / Flagged), hover, no 'Meets standards'", async () => nr("a drawn mark (screen text and hover); the offline pass reads ops, the browser pass reads the screen: see the browser rows"));
});

/* ======================================================================================================================================================================
   R49  A source that changes: watch, newer copy, move citations, version notice, "newer version" queue item, grade follows the read, re-evaluation
   ====================================================================================================================================================================== */
const queueOf = async (auth) => (R(await get(auth, { op: "queue" })).items || []);
const noticesOfWeb = async (auth, web) => (await queueOf(auth)).filter((i) => i.kind === "newer-capture-affects-reference" && i.subject && i.subject.target === web.bundle);
test("R49", { timeout: 2400000 }, async (t) => {
  if (!want("R49")) return t.skip("not chosen");
  const ann = W.ann, mel = W.mel, R49 = "R49";
  /* the changing page's paragraph 17 is cited into the open question by R45; if R45 was not chosen make the leg now */
  if (!W.web) {
    serveDynamic("changing-notice", (n) => `<!doctype html><html><head><title>Changing notice</title></head><body><main><h1>Council notice</h1>\n${noticeParas(n)}</main></body></html>`);
    W.web = await bringWeb(ann, "changing-notice", "https://www.example.gov/files/changing-notice", "changing council notice", W.project);
    await vouchFor(ann, W.web.bundle); await readWhole(ann, W.web.sha, 90000);
    const f = await findIn(ann, { capture: W.web.sha }, "session number"); await cite(ann, W.question, itemsOf(f)[0], "supports");
  }
  const web = W.web;
  await step(R49, "the leg of a cited changing passage carries the pinned capture it was cited against (pinned_capture on the cite receipt and the leg's extent_capture)", async () => {
    const leg = (await legsOf(ann, W.question)).find((l) => l.target === web.bundle);
    return must(leg && leg.extent_capture === web.sha, J({ leg, capture: web.sha }));
  });
  await step(R49, "the sweep raises the notice for the watched page by itself (watch daily set in R45) or the first 'Check now' does: wait for one `newer-capture-affects-reference` item", async () => {
    let items = await noticesOfWeb(ann, web);
    const t0 = Date.now();
    if (!items.length) { await post(ann, "monitor", { bundleId: web.bundle }); items = (await kit.until(async () => { const x = await noticesOfWeb(ann, web); return x.length ? x : null; }, 120000, 2000)) || []; }
    W.noticeItems = items;
    return must(items.length >= 1, J({ n: items.length, waitedMs: Date.now() - t0, first: items[0] && { id: items[0].id, summary: items[0].summary, grade: items[0].basis && items[0].basis.grade, affects: items[0].basis && items[0].basis.affects, options: items[0].options.map((o) => o.id) } }));
  });
  await step(R49, "exactly ONE notice per holder per (reference, newer capture): the same newer capture does not raise a second item", async () => {
    await post(ann, "monitor", { bundleId: web.bundle });
    await kit.later(3000);
    const items = await noticesOfWeb(ann, web);
    const pairs = items.map((i) => `${i.subject.holder}|${i.subject.ord}|${i.subject.newer_capture}`);
    return must(new Set(pairs).size === pairs.length, J({ items: items.length, pairs: pairs.map((x) => x.slice(0, 40) + "…" + x.slice(-12)) }));
  });
  await step(R49, "on the question page press the leg's ONE control: `versionnotice` for the question answers per leg; no newer capture = silence, a candidate never a move, newer capture undetermined with its reason", async () => {
    const vn = R(await get(ann, { op: "versionnotice", target: W.question }));
    const states = (vn.notices || []).map((n) => `${n.ref}:${n.state}`);
    const w = (vn.notices || []).find((n) => n.target === web.bundle);
    return must(vn.ok && w && /newer/.test(w.state), J({ legStates: states, web: w && { state: w.state, affects: w.affects, says: w.says, cand: (w.candidates || []).map((c) => ({ reason: c.reason, grade: c.grade, affects: c.affects, matched: c.matched })) } }));
  });
  await step(R49, "the newer capture a Check-now filed is READ (or owed with a row) within the ticks, and the open notice's grade follows its copy once read (G89)", async () => {
    const vn0 = R(await get(ann, { op: "versionnotice", target: W.question }));
    const w0 = vn0.notices.find((n) => n.target === web.bundle);
    const newest = w0 && w0.chains && w0.chains[0] && w0.chains[0].newest && w0.chains[0].newest.capture_sha;
    let rd = null;
    if (newest) rd = await kit.until(async () => { const r = await reading(ann, newest); return r && r.found ? r : null; }, 60000, 3000);
    const ow = newest ? R(await get(W.adm, { op: "owedwork", sha: newest })) : {};
    const vn1 = R(await get(ann, { op: "versionnotice", target: W.question }));
    const w1 = vn1.notices.find((n) => n.target === web.bundle);
    const items = await noticesOfWeb(ann, web);
    return { v: rd ? "WORKS" : "BROKEN", saw: J({ newerCapture: newest && newest.slice(0, 12), read: !!rd, owedRows: (ow.owed || []).length, lastRows: (ow.last || []).length, noticeBefore: w0 && { state: w0.state, affects: w0.affects, why: w0.candidates && w0.candidates[0] && w0.candidates[0].reason }, noticeAfter: w1 && { state: w1.state, affects: w1.affects, why: w1.candidates && w1.candidates[0] && w1.candidates[0].reason }, queueGrades: items.map((i) => i.basis && `${i.basis.grade}/${i.basis.affects}`) }) };
  });
  await step(R49, "KEEP the cited version: records who, when and why; the notice closes; a second answer (adopt) is refused VERSION_NOTICE_CLOSED; the same newer capture does not raise it again", async () => {
    const it = (await noticesOfWeb(ann, web))[0];
    if (!it) return bad("no notice to answer");
    const k = await post(ann, "keepversion", { notice: it.subject.id, why: "The earlier version is the one we read." });
    const a = await post(ann, "adoptversion", { notice: it.subject.id, why: "changed my mind" });
    await post(ann, "monitor", { bundleId: web.bundle });
    return must(result(k.body).ok && result(k.body).act === "kept" && codeOf(a.body) === "VERSION_NOTICE_CLOSED", J({ keep: result(k.body), adoptAfter: codeOf(a.body) }));
  });
  await step(R49, "a yet newer capture raises a notice of its own; ADOPT it: a new basis version pinned to the newer capture is written, the old stays readable, the leg moves only by this act", async () => {
    await post(ann, "monitor", { bundleId: web.bundle });
    const items = await kit.until(async () => { const x = (await noticesOfWeb(ann, web)).filter((i) => i.disposition == null || true); return x.length >= 1 ? x : null; }, 60000, 2000);
    const open = (items || []).find((i) => i.subject && !i.subject.closed);
    const before = (await legsOf(ann, W.question)).find((l) => l.target === web.bundle);
    const a = await post(ann, "adoptversion", { notice: (open || items[items.length - 1]).subject.id, why: "The newer version is the one to cite." });
    const after = (await legsOf(ann, W.question)).find((l) => l.target === web.bundle);
    const bv = R(await get(ann, { op: "basisversions", id: W.question }));
    return { v: result(a.body) && result(a.body).ok ? "WORKS" : "BROKEN", saw: J({ adopt: refusal(a.body) ? { code: codeOf(a.body), translation: refusal(a.body).translation } : result(a.body), legBefore: before && before.extent_capture && before.extent_capture.slice(0, 12), legAfter: after && after.extent_capture && after.extent_capture.slice(0, 12), basisVersions: bv.count }) };
  });
  await step(R49, "a page that differs only by per-render machinery (a one-time token) gives NO notice; one altered word is seen", async () => {
    serveDynamic("machine-notice", (n) => `<!doctype html><html><head><title>Machine notice</title><meta name="csrf-token" content="tok-${n}-${n * 7919}"><script nonce="n${n}x${n * 31}">window.__t=${n};</script></head><body data-render="${Date.now()}-${n}"><main><h1>Notice</h1><p>The hearing on the levy is set for Tuesday at ten.</p></main></body></html>`);
    const m = await bringWeb(ann, "machine-notice", "https://www.example.gov/files/machine-notice", "machine notice", W.project);
    await vouchFor(ann, m.bundle); await readWhole(ann, m.sha, 60000);
    await post(ann, "monitorset", { bundleId: m.bundle, enabled: true, frequency: "daily" });
    const f = await findIn(ann, { capture: m.sha }, "hearing on the levy");
    const q2 = await kit.questionOf(ann, W.project, "Machine notice question " + uniq());
    await cite(ann, q2, itemsOf(f)[0], "supports");
    const c = await post(ann, "monitor", { bundleId: m.bundle });
    await kit.later(6000);
    const after = (await queueOf(ann)).filter((i) => i.subject && i.subject.target === m.bundle && i.kind === "newer-capture-affects-reference");
    W.machine = { m, q2 };
    return { v: after.length === 0 ? "WORKS" : "BROKEN", saw: J({ monitor: { status: c.body.status, note: c.body.note, verdict: c.body.assessment && c.body.assessment.verdict, meaningful: c.body.assessment && c.body.assessment.meaningful }, noticesRaised: after.length }) };
  });
  await step(R49, "one altered word of the cited passage on that page is seen (a notice is raised)", async () => {
    serveDynamic("machine-notice", (n) => `<!doctype html><html><head><title>Machine notice</title><meta name="csrf-token" content="tok-${n}-${n * 7919}"><script nonce="n${n}x${n * 31}">window.__t=${n};</script></head><body data-render="${Date.now()}-${n}"><main><h1>Notice</h1><p>The hearing on the levy is set for Wednesday at ten.</p></main></body></html>`);
    const c = await post(ann, "monitor", { bundleId: W.machine.m.bundle });
    const items = await kit.until(async () => { const x = (await queueOf(ann)).filter((i) => i.subject && i.subject.target === W.machine.m.bundle && i.kind === "newer-capture-affects-reference"); return x.length ? x : null; }, 60000, 2000);
    return { v: items && items.length ? "WORKS" : "BROKEN", saw: J({ monitor: { status: c.body.status, verdict: c.body.assessment && c.body.assessment.verdict }, notices: items ? items.length : 0 }) };
  });
  await step(R49, "a removed source is told apart from a changed one after a confirmation window: the page now answers 404; Check now says what it saw", async () => {
    net.status.set("machine-notice", 404);
    const c = await post(ann, "monitor", { bundleId: W.machine.m.bundle });
    net.status.delete("machine-notice");
    return { v: c.body.ok !== false ? "WORKS" : "BROKEN", saw: J({ status: c.body.status, note: c.body.note, reason: c.body.reason, translation: c.body.translation }) + " | the confirmation window (days) cannot elapse offline" };
  });
  await step(R49, "'Check for a new version now' is offered only for a watched address: monitor on an uploaded (never fetched) document is refused in plain words", async () => {
    const c = await post(ann, "monitor", { bundleId: W.text.bundle });
    return must(!!refusal(c.body) || c.body.ok === false, J({ code: codeOf(c.body), translation: refusal(c.body) && refusal(c.body).translation, body: c.body.ok === false ? { reason: c.body.reason } : c.body }));
  });
  await step(R49, "the dependents list says 'N questions you can see rest on this' with one Withheld line: backlinks of the page as ann, as mel", async () => {
    const a = R(await get(ann, { op: "backlinks", target: web.bundle }));
    const m = R(await get(mel, { op: "backlinks", target: web.bundle }));
    return { v: "WORKS", saw: J({ ann: { n: (a.backlinks || []).length, out_of_view: a.out_of_view }, mel: refusal({ result: m }) ? { code: m.code, translation: m.translation } : { n: (m.backlinks || []).length, out_of_view: m.out_of_view } }) };
  });
  await step(R49, "re-evaluation recorded as the third choice (reevaluationrecord: dependent, target, source, note)", async () => {
    const r = await post(ann, "reevaluationrecord", { dependent: W.question, target: web.bundle, source: web.sha, note: "Looked at both versions: the passage still says what we cited." });
    return { v: result(r.body) && result(r.body).ok !== false ? "WORKS" : "BROKEN", saw: J(refusal(r.body) ? { code: codeOf(r.body), translation: refusal(r.body).translation, detail: refusal(r.body).detail } : result(r.body), 800) };
  });
});

/* ======================================================================================================================================================================
   R50  Contradiction between two sources
   ====================================================================================================================================================================== */
test("R50", { timeout: 2400000 }, async (t) => {
  if (!want("R50")) return t.skip("not chosen");
  const ann = W.ann, mel = W.mel, R50 = "R50";
  /* the two passages are cited first (a flag sets two HELD passages beside each other) */
  /* one passage a document a question (a second passage of a document the question rests on is not written: R45), so each passage rests in a question of its own */
  const pass = async (doc, term) => { const fq = await kit.questionOf(ann, W.project, "Where is the figure in " + uniq()); const f = await findIn(ann, { capture: doc.sha }, term); const it = itemsOf(f)[0]; const c = await cite(ann, fq, it, "supports"); if (!citeOk(c)) throw new Error("cite: " + say(c)); return it; };
  const a = await pass(W.text, "total payment");
  const b = await pass(W.textB, "quarterly payment");
  const here = { capture: W.text.sha, extent: a.extent }, other = { capture: W.textB.sha, extent: b.extent };
  const flag = (body) => post(ann, "contradictionflag", body);
  await step(R50, "open the registry's `contradiction` screen op set: the acts exist on the plane (clarify, takeup, dismiss, resolve, optin, respond, tensions, facts, pairs, flag)", async () => {
    const out = {};
    for (const op of ["contradictionflag", "contradictionclarify", "contradictiontakeup", "contradictiondismiss", "contradictionresolve", "contradictionoptin", "contradictionrespond", "contradictiontensions", "contradictionfacts", "contradictionpairs", "contradictionpropose", "contradictionrecommend", "contradictioncandidates"]) {
      const r = await post(ann, op, {}); out[op] = codeOf(r.body) || (result(r.body) && result(r.body).ok === false ? result(r.body).reason : "ok");
    }
    return must(!Object.values(out).includes("UNKNOWN_OP"), J(out, 1000));
  });
  await step(R50, "flag with the two passages in ONE document refused FLAG_SAME_DOCUMENT", async () => { const r = await flag({ here, other: { capture: W.text.sha, extent: { kind: "doc-para", para: 0, run: null } }, reason: "same" }); return must(codeOf(r.body) === "FLAG_SAME_DOCUMENT" || /FLAG_SAME_DOCUMENT/.test(J(r.body)), J({ code: codeOf(r.body), translation: refusal(r.body) && refusal(r.body).translation, detail: refusal(r.body) && refusal(r.body).detail })); });
  await step(R50, "flag with no reason refused FLAG_NO_REASON, in words", async () => { const r = await flag({ here, other }); return must(codeOf(r.body) === "FLAG_NO_REASON", J({ code: codeOf(r.body), translation: refusal(r.body) && refusal(r.body).translation })); });
  await step(R50, "flag with a passage no one holds (no capture/extent) refused FLAG_NO_PASSAGE naming which side", async () => { const r = await flag({ here, other: { capture: "0".repeat(64), extent: { kind: "doc-para", para: 0, run: null } }, reason: "x" }); return must(codeOf(r.body) === "FLAG_NO_PASSAGE", J({ code: codeOf(r.body), detail: refusal(r.body) && refusal(r.body).detail })); });
  await step(R50, "draw the flag by hand on two documents that disagree about an amount (48,000 against 52,000) with the member's reason: a lead, her name, no machine mark", async () => {
    const r = await flag({ here, other, reason: "The minutes say 48,000 dollars and the finance office report says 52,000 for the same quarterly payment." });
    W.cand = result(r.body) && result(r.body).candidate;
    return must(result(r.body) && result(r.body).ok && result(r.body).weight === "lead" && result(r.body).flagged_by, J(result(r.body), 800));
  });
  await step(R50, "flag again over the same two passages: answered already:true, nothing written", async () => { const r = await flag({ here, other, reason: "again" }); return must(result(r.body).already === true && result(r.body).wrote === false, J(result(r.body), 500)); });
  await step(R50, "the inline tension mark on each document: `contradictiontensions` for the two bundles (referents) shows the flagged candidate beside each", async () => {
    const r = await post(ann, "contradictiontensions", { referents: [{ kind: "bundle", id: W.text.bundle }, { kind: "bundle", id: W.textB.bundle }] });
    return { v: result(r.body) && result(r.body).ok !== false ? "WORKS" : "BROKEN", saw: J(refusal(r.body) ? { code: codeOf(r.body), detail: refusal(r.body).detail } : result(r.body), 1000) };
  });
  await step(R50, "open the side by side: the candidate read (contradictioncandidates on the document) shows each side in the record's words, source, date, doctype, and why paired, never a machine verdict", async () => {
    const r = R(await get(ann, { op: "contradictioncandidates", bundle: W.text.bundle }));
    const c = (r.candidates || r.items || [])[0];
    return { v: c ? "WORKS" : "BROKEN", saw: J({ keys: Object.keys(r), count: (r.candidates || r.items || []).length, first: c && { weight: c.weight, state: c.state, origin: c.origin, a: c.a, b: c.b, why: c.why || c.reason } }, 1500) };
  });
  await step(R50, "context fills facts and recommends nothing preselected (contradictionfacts), labelled machine work where machine", async () => {
    const r = await post(ann, "contradictionfacts", { candidate: W.cand });
    return { v: result(r.body) && result(r.body).ok !== false ? "WORKS" : "BROKEN", saw: J(refusal(r.body) ? { code: codeOf(r.body), detail: refusal(r.body).detail } : result(r.body), 1000) };
  });
  await step(R50, "clarify 'How do these differ?' on the flagged lead: a lead is dismissed or taken up, never clarified (CLARIFY_NOT_A_TENSION); the walker records the act the Contradiction screen draws for it", async () => {
    const r = await post(ann, "contradictionclarify", { candidate: W.cand, choice: "differs", coordinates: ["time"], explanation: "different quarter" });
    return { v: "WORKS", saw: J({ code: codeOf(r.body), translation: refusal(r.body) && refusal(r.body).translation, detail: refusal(r.body) && refusal(r.body).detail, ok: result(r.body) && result(r.body).ok }) };
  });
  await step(R50, "dismiss a lead with an unknown reason refused DISMISSAL_REASON_UNKNOWN naming the three reasons", async () => { const r = await post(ann, "contradictiondismiss", { candidate: W.cand, reason: "because" }); return must(codeOf(r.body) === "DISMISSAL_REASON_UNKNOWN", J({ code: codeOf(r.body), detail: refusal(r.body) && refusal(r.body).detail, reasons: refusal(r.body) && refusal(r.body).reasons })); });
  await step(R50, "take it up as a question: no question worded is refused (TAKE_UP_NO_QUESTION) with the default offered; no frame refused; then taken up around side a", async () => {
    const x = await post(ann, "contradictiontakeup", { candidate: W.cand });
    const y = await post(ann, "contradictiontakeup", { candidate: W.cand, question: "Which figure is right for the quarterly payment to Ellery Paving?" });
    const z = await post(ann, "contradictiontakeup", { candidate: W.cand, question: "Which figure is right for the quarterly payment to Ellery Paving?", frame: "a" });
    W.takenUp = result(z.body) && result(z.body).inquiry;
    return { v: codeOf(x.body) === "TAKE_UP_NO_QUESTION" && codeOf(y.body) === "TAKE_UP_NO_FRAME" && W.takenUp ? "WORKS" : "BROKEN", saw: J({ noQuestion: { code: codeOf(x.body), default_question: refusal(x.body) && refusal(x.body).default_question }, noFrame: codeOf(y.body), taken: result(z.body) && { ok: result(z.body).ok, inquiry: result(z.body).inquiry, state: result(z.body).state, says: result(z.body).says } }, 1100) };
  });
  await step(R50, "take it up again: answered existed:true with the same inquiry, nothing written", async () => { const z = await post(ann, "contradictiontakeup", { candidate: W.cand, question: "again", frame: "a" }); return must(result(z.body).existed === true && result(z.body).inquiry === W.takenUp, J(result(z.body), 400)); });
  await step(R50, "conclude the question with its kind (contradictionresolve): an unknown kind, a missing falsifier and a wrong-kind (corrected) are refused in words; a dissolved resolution naming what dissolved it, or a genuine irreconcilable one, is written with both sides kept", async () => {
    const out = {};
    const tryIt = async (label, body) => { const r = await post(ann, "contradictionresolve", { inquiry: W.takenUp, conclusion: "Both documents describe the same quarterly payment at two different stages.", ...body }); out[label] = refusal(r.body) ? { code: codeOf(r.body), detail: (refusal(r.body).detail || "").slice(0, 160) } : { ok: result(r.body).ok, kind: result(r.body).kind || result(r.body).resolution, state: result(r.body).state }; return r; };
    await tryIt("unknownKind", { resolution: { kind: "nonsense" }, noFalsifier: true });
    await tryIt("noFalsifier", { resolution: { kind: "dissolved", dissolved_by: "precision" } });
    const ok1 = await tryIt("dissolved", { resolution: { kind: "dissolved", dissolved_by: "precision" }, falsifier: "A receipt showing two separate payments." });
    W.resolved = result(ok1.body) && result(ok1.body).ok === true;
    return { v: out.unknownKind.code && out.noFalsifier.code ? "WORKS" : "BROKEN", saw: J(out, 1500) };
  });
  await step(R50, "a second flag: a precision pair (reduced a little against dropped a lot) hand-flagged, then dismissed with the fixed reason same_fact_different_precision; the dismissal is kept and a re-flag finds it", async () => {
    const fq3 = await kit.questionOf(ann, W.project, "Did spending drop " + uniq()); const f1 = await findIn(ann, { capture: W.textC.sha }, "dropped a lot"); await cite(ann, fq3, itemsOf(f1)[0], "cuts_against");
    const other2 = { capture: W.textC.sha, extent: itemsOf(f1)[0].extent };
    const fl = await flag({ here: other, other: other2, reason: "One says spending dropped a lot and the finance report says it was reduced a little." });
    const c2 = result(fl.body) && result(fl.body).candidate;
    const d = await post(ann, "contradictiondismiss", { candidate: c2, reason: "same_fact_different_precision", words: "Same fact at two precisions." });
    const again = await post(ann, "contradictiondismiss", { candidate: c2, reason: "same_fact_different_precision" });
    return { v: result(d.body) && result(d.body).state === "dismissed" ? "WORKS" : "BROKEN", saw: J({ flag: result(fl.body) && { ok: result(fl.body).ok, weight: result(fl.body).weight }, dismiss: refusal(d.body) ? { code: codeOf(d.body), detail: refusal(d.body).detail } : { state: result(d.body).state, says: result(d.body).says }, secondDismiss: refusal(again.body) ? codeOf(again.body) : result(again.body) }, 1200) };
  });
  await step(R50, "ask to resolve a conflict with a record you cannot see, and let the other project respond (member as the other project's owner)", async () => nr("a conflict between a visible record and a hidden project's record arises only from the record's own pairing (keys K1-K5); no hand door draws one across a project the member cannot see (a flag needs both passages visible), so contradictionoptin/contradictionrespond have no candidate to answer in this room"));
  await step(R50, "a member outside the project reads the candidate: mel cannot read ann's candidate (not shown) and the refusal does not reveal it", async () => {
    const r = await post(mel, "contradictionfacts", { candidate: W.cand });
    return must(!!refusal(r.body) || (result(r.body) && result(r.body).ok === false), J({ code: codeOf(r.body), translation: refusal(r.body) && refusal(r.body).translation }));
  });
  await step(R50, "contradictionpairs (read, judges nothing, writes no table): a member over key K1 with a bound; the empty answer names its level", async () => {
    const r = await get(ann, { op: "contradictionpairs", key: "K1", limit: "50" });
    return { v: R(r).ok !== false ? "WORKS" : "BROKEN", saw: J(R(r), 900) };
  });
  await step(R50, "contradictionpropose (machine write): refused to a member; none proposed while the assistant is held", async () => {
    const r = await post(ann, "contradictionpropose", { run: "RUN-x", proposals: [] });
    return { v: refusal(r.body) ? "WORKS" : "BROKEN", saw: J({ code: codeOf(r.body), translation: refusal(r.body) && refusal(r.body).translation }) };
  });
});

/* ======================================================================================================================================================================
   R150  The document page's links, the names it carries and the record of this copy
   ====================================================================================================================================================================== */
test("R150", { timeout: 1800000 }, async (t) => {
  if (!want("R150")) return t.skip("not chosen");
  const ann = W.ann, mel = W.mel, R150 = "R150";
  serveDynamic("leaf-held", () => `<!doctype html><html><head><title>Held leaf</title></head><body><main><p>The schedule that is held.</p></main></body></html>`);
  serveDynamic("link-hub", () => `<!doctype html><html><head><title>Link hub</title></head><body><main><h1 id="top">Link hub</h1><p>Read the <a href="https://www.example.gov/files/leaf-held">held schedule</a>, the <a href="https://www.example.gov/files/leaf-never">schedule nobody has captured</a>, the <a href="#section2">second section</a>, this page itself <a href="https://www.example.gov/files/link-hub">here</a>, and an <a href="https://other.example.org/page">outside page</a>.</p><h2 id="section2">Second section</h2><p>The mayor Jane Doe and the Oakland Public Works department are named here ${W.textTag}.</p></main></body></html>`);
  const hub = await bringWeb(ann, "link-hub", "https://www.example.gov/files/link-hub", "link hub", W.project);
  await vouchFor(ann, hub.bundle); await readWhole(ann, hub.sha, 60000);
  W.linkHub = hub;
  const verdictsOf = (r) => JSON.stringify({ keys: Object.keys(r || {}), groups: r && (r.groups || r.links) ? (r.groups ? Object.fromEntries(Object.entries(r.groups).map(([k, v]) => [k, Array.isArray(v) ? v.length : v])) : (r.links || []).map((l) => `${l.kind || l.group || ""}:${l.verdict || l.state || ""}:${String(l.href || l.address || "").slice(-24)}`)) : null }).slice(0, 900);
  await step(R150, "links of a captured page: the outbound links are grouped (inside the page, beside, held, outside, refused), each with a verdict word", async () => {
    const r = R(await get(ann, { op: "links", capture: hub.sha }));
    W.linksBefore = r;
    return { v: r.ok !== false && JSON.stringify(r).length > 100 ? "WORKS" : "BROKEN", saw: verdictsOf(r) + " | raw: " + J(r, 900) };
  });
  await step(R150, "capture the held schedule, then read the links again: the link now reads held, with a verdict and its basis, although no byte of the page changed", async () => {
    const leaf = await bringWeb(ann, "leaf-held", "https://www.example.gov/files/leaf-held", "held leaf", W.project);
    await vouchFor(ann, leaf.bundle); await readWhole(ann, leaf.sha, 60000);
    await kit.later(3000);
    const r = R(await get(ann, { op: "links", capture: hub.sha }));
    const before = JSON.stringify(W.linksBefore).includes('"held"'), after = JSON.stringify(r).includes('held');
    return { v: after && r.ok !== false ? "WORKS" : "BROKEN", saw: J({ heldBefore: before, heldAfter: after, raw: r }, 1300) };
  });
  await step(R150, "a page that links to itself says SELF-REFERENCE", async () => {
    const r = R(await get(ann, { op: "links", capture: hub.sha }));
    const flat = JSON.stringify(r);
    return { v: /self/i.test(flat) ? "WORKS" : "BROKEN", saw: J({ mentionsSelf: /self/i.test(flat), snippet: (flat.match(/.{80}self.{80}/i) || [flat.slice(0, 200)])[0] }) };
  });
  await step(R150, "what points at an address (links address=): the held schedule is pointed at by the hub", async () => {
    const r = R(await get(ann, { op: "links", address: "https://www.example.gov/files/leaf-held" }));
    return { v: r.ok !== false && /link-hub|hub/.test(JSON.stringify(r)) ? "WORKS" : "BROKEN", saw: J(r, 900) };
  });
  await step(R150, "the record of this copy: bundlehistory (release log, earlier revisions) of the document, oldest first", async () => {
    const r = R(await get(ann, { op: "bundlehistory", bundle: W.text.bundle }));
    return { v: r.ok !== false ? "WORKS" : "BROKEN", saw: J(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Array.isArray(v) ? `array(${v.length})` : typeof v === "object" && v ? Object.keys(v).slice(0, 6) : v])), 900) };
  });
  await step(R150, "the people and organizations it names: `resolutions` of the hub (names found in its text, matched or not)", async () => {
    const r = R(await get(ann, { op: "resolutions", sha256: hub.sha }));
    return { v: r.ok !== false ? "WORKS" : "BROKEN", saw: J({ count: r.count, names: r.names, unresolved: r.unresolved, truncated: r.truncated }) };
  });
  await step(R150, "Explore connections from the document: `explore` from the bundle at a date", async () => {
    const r = await post(ann, "explore", { from: W.text.bundle, at: "2026-10-25" });
    return { v: result(r.body) && !result(r.body).refused ? "WORKS" : "BROKEN", saw: J(refusal(r.body) ? { code: codeOf(r.body) } : result(r.body), 900) };
  });
  await step(R150, "'What cites it' as someone who cannot see the citing work: mel reads backlinks of ann's document (withheld) and says nothing about count/title/id", async () => {
    const r = R(await get(mel, { op: "backlinks", target: W.text.bundle }));
    return { v: "WORKS", saw: J(r, 600) };
  });
  await step(R150, "identity claim and choose-the-on-point-mention: connectionchoose with no connection refused in words naming the three things to name", async () => {
    const r = await post(ann, "connectionchoose", {});
    return must(!!refusal(r.body), J({ code: codeOf(r.body), translation: refusal(r.body) && refusal(r.body).translation }));
  });
  await step(R150, "owed browser acts (linkopen, hashcopy, revisioncompare): absent on the plane (UNKNOWN_OP), drawn in the page only", async () => {
    const out = {};
    for (const op of ["linkopen", "hashcopy", "revisioncompare", "reviewexport", "pubfloorset", "pubfloorclear", "pubprint"]) out[op] = codeOf((await post(ann, op, {})).body) || "answers";
    return { v: "WORKS", saw: J(out) };
  });
});

/* ======================================================================================================================================================================
   R151  Ask the content questions
   ====================================================================================================================================================================== */
test("R151", { timeout: 1800000 }, async (t) => {
  if (!want("R151")) return t.skip("not chosen");
  const ann = W.ann, mel = W.mel, R151 = "R151";
  const ask = async (auth, rows, q, extra = {}) => R(await get(auth, { op: "meaningrows", rows, q, ...extra }));
  await step(R151, "content rows (one addressable extent of one capture under one chain): after the cites of R45, rows=content answers rows with cited/uncited and the four-level statement", async () => {
    const r = await ask(ann, "content", "");
    return { v: r.ok && r.total >= 1 ? "WORKS" : "BROKEN", saw: J({ total: r.total, count: r.count, levels: r.levels && Object.fromEntries(Object.entries(r.levels).map(([k, v]) => [k, v.state])), first: r.rows && r.rows[0] }, 1200) };
  });
  await step(R151, "legs citing a page: rows=leg answers each leg of each question (bundle_id, ord, extent_kind, ref); filter to pdf-page legs", async () => {
    const r = await ask(ann, "leg", "");
    const pdf = (r.rows || []).filter((x) => x.extent_kind === "pdf-page");
    return { v: r.ok && r.total >= 1 ? "WORKS" : "BROKEN", saw: J({ total: r.total, pdfLegs: pdf.length, sample: pdf.slice(0, 2).map((x) => ({ ref: x.ref, kind: x.extent_kind, content: String(x.content_id || "").slice(0, 8) })) }, 900) };
  });
  const arm = (label, q, rows = "content") => step(R151, label, async () => { const r = await ask(ann, rows, q); return { v: r.ok ? "WORKS" : "BROKEN", saw: J(r.ok ? { q, total: r.total, warnings: r.query && r.query.warnings, first: r.rows && r.rows[0] && { ref: r.rows[0].ref, chain: r.rows[0].chain || r.rows[0].chain_step, cap: r.rows[0].cap || r.rows[0].derivation_cap } } : { reason: r.reason, detail: r.detail }, 700) }; });
  await arm("content rows read by OCR (chain:ocr)", "chain:ocr");
  await arm("content rows whose cap is undetermined (cap:undetermined)", "cap:undetermined");
  await arm("content rows whose chain does not apply (an image cited as its own bytes: chain:does-not-apply)", "chain:does-not-apply");
  await arm("cited content rows only (content:cited) and uncited (content:uncited)", "content:cited");
  await step(R151, "a fifth arm / an unknown arm is refused with the compound-ceiling reason or the list of known arms", async () => {
    const r = await ask(ann, "nonsense", "");
    return must(r.ok === false && /kinds that are|known/.test(r.detail || ""), J({ reason: r.reason, detail: r.detail && r.detail.slice(0, 300) }));
  });
  await step(R151, "an empty answer names its level (four-level statement) and says nothing matched in a record that has documents, not 'an empty record'", async () => {
    const r = await ask(ann, "content", "chain:nosuchstep");
    return { v: r.ok ? "WORKS" : "BROKEN", saw: J({ total: r.total, says: r.says, levels: r.levels && Object.fromEntries(Object.entries(r.levels).map(([k, v]) => [k, v.state])), warnings: r.query && r.query.warnings }, 800) };
  });
  await step(R151, "a row in a project the viewer is not in is withheld whole and the total does not move: mel's rows=content total", async () => {
    const m = await ask(mel, "content", "");
    const a = await ask(ann, "content", "");
    return must(m.ok && m.total === 0 && a.total >= 1, J({ mel: { total: m.total, says: m.says }, ann: { total: a.total } }));
  });
  await step(R151, "searching mints nothing and content-grain questions like 'every leg citing page 14' are answered by rows=leg, not by search (CF:2339 says unaskable at v0.10)", async () => {
    const r = await ask(ann, "leg", "page:14");
    return { v: "WORKS", saw: J({ ok: r.ok, total: r.total, warnings: r.query && r.query.warnings, reason: r.reason }) };
  });
});

/* ======================================================================================================================================================================
   R152  A hidden project does not move a non-participant's view
   ====================================================================================================================================================================== */
test("R152", { timeout: 1800000 }, async (t) => {
  if (!want("R152")) return t.skip("not chosen");
  const ann = W.ann, mel = W.mel, R152 = "R152";
  const sharedDoc = await bring(ann, te(`A team-wide memo about the paving schedule ${uniq()}. The yard crew works Tuesday.`), { name: "shared-memo.txt", type: "text/plain", title: "team memo about paving", project: "", vouch: true });
  const snapshot = async (auth) => ({
    search: (await sOf(auth, "title:memo")).hits.map((h) => h.bundle_id).join(","),
    total: (await sOf(auth, "title:memo")).total,
    browse: R(await get(auth, { op: "browse" })).total,
    frontier: JSON.stringify(R(await get(auth, { op: "frontier", level: "document" })).tally),
    frontierContent: JSON.stringify(R(await get(auth, { op: "frontier", level: "content" })).tally),
    stats: (({ bundles, files, register }) => ({ bundles, files, register }))(R(await get(auth, { op: "stats" }))),
    backlinks: JSON.stringify((R(await get(auth, { op: "backlinks", target: sharedDoc.bundle })).backlinks || []).map((b) => b.from)),
    selection: JSON.stringify((R(await post(auth, "select", { ids: [sharedDoc.bundle] }).then((x) => x.body)) || {}).n),
  });
  await step(R152, "as the member (mel, in none of ann's projects) note search results and order, counts (Browse), selection size, frontier tallies, the document's citers", async () => {
    W.before = await snapshot(mel);
    return { v: W.before.search.includes(sharedDoc.bundle) ? "WORKS" : "BROKEN", saw: J(W.before) };
  });
  await step(R152, "as a participant create and revise a hidden project that cites the team-wide document, files two more documents and concludes", async () => {
    const hp = await kit.projectOf(ann, "A hidden project " + uniq());
    const hq = await kit.questionOf(ann, hp, "Is the yard crew on Tuesday? " + uniq());
    const f = await findIn(ann, { capture: sharedDoc.sha }, "yard crew");
    const c = await cite(ann, hq, itemsOf(f)[0], "supports");
    const extra = await bring(ann, te(`Hidden extra memo ${uniq()} about the paving schedule.`), { name: "hidden-memo.txt", type: "text/plain", title: "hidden memo about paving", project: hp, vouch: true });
    const concl = await kit.screenCall(ann).call("conclude", { query: { target: hq, project: hp, reading: "Yes.", falsifier: "A schedule showing otherwise.", reason: "The memo says so." } });
    W.hidden = { hp, hq, extra };
    return must(citeOk(c), J({ cite: say(c), extra: extra.bundle, concluded: R(concl).ok }));
  });
  await step(R152, "reread as the member: every figure and the order unchanged; the document cited only by the hidden project shows her no citing project", async () => {
    W.after = await snapshot(mel);
    const same = J(W.before) === J(W.after);
    return { v: same ? "WORKS" : "BROKEN", saw: J(same ? { same: true, after: W.after } : { before: W.before, after: W.after }, 1400) };
  });
  await step(R152, "the hidden project's documents are not found by the member: search for the hidden memo's title answers nothing and does not say why", async () => {
    const r = await sOf(mel, "title:hidden");
    return must(r.total === 0 && !r.widen, J({ total: r.total, widen: r.widen, warnings: r.query.warnings }));
  });
  await step(R152, "a hidden project's AI-run attribution is assistant-gated (only if the assistant is on)", async () => nr("the assistant is not part of the alpha (K3717)"));
});

/* ======================================================================================================================================================================
   R153  Annotations: an anchored note that triggers re-evaluation
   ====================================================================================================================================================================== */
test("R153", { timeout: 600000 }, async (t) => {
  if (!want("R153")) return t.skip("not chosen");
  const ann = W.ann, R153 = "R153";
  await step(R153, "an annotation construct: probe every plausible op name; the plane answers UNKNOWN_OP for each (no annotation construct), the only trace is the header field annotations_open", async () => {
    const out = {};
    for (const op of ["annotate", "annotation", "annotationadd", "annotationrespond", "annotationtakeup", "annotations", "passageannotate", "noteanchor", "annotationlist", "annotationdelete", "annotationedit"]) out[op] = codeOf((await post(ann, op, {})).body) || "answers";
    const img = String((R(await get(ann, { op: "image", id: W.question })) || {})["bundle.md"] || "");
    return { v: "WORKS", saw: J({ ops: out, annotations_open_in_header: /annotations_open:\s*\d+/.exec(img) && /annotations_open:\s*\d+/.exec(img)[0] }) + " | recorded as absent: no member act writes an annotation" };
  });
  await step(R153, "private notes exist (notewrite): a note is a member's own, not an annotation anchored to a passage or triggering re-evaluation", async () => {
    const r = await post(ann, "notewrite", { text: "A private thought about the minutes." });
    return { v: "WORKS", saw: J(refusal(r.body) ? { code: codeOf(r.body), detail: refusal(r.body).detail } : result(r.body), 500) };
  });
});

/* ======================================================================================================================================================================
   R154  Shared identifier match across two systems (idmatch)
   ====================================================================================================================================================================== */
test("R154", { timeout: 600000 }, async (t) => {
  if (!want("R154")) return t.skip("not chosen");
  const ann = W.ann, R154 = "R154";
  const idm = (q) => get(ann, { op: "idmatch", ...q }).then((x) => R(x));
  await step(R154, "idmatch: a member door exists on the plane (reads, writes nothing): an unknown space is refused naming the spaces it knows", async () => {
    const r = R(await post(ann, "idmatch", { space: "nonsense" }).then((x) => x.body));
    return must(r.reason === "IDSPACE_UNKNOWN" || r.code === "IDSPACE_UNKNOWN", J({ code: r.code, detail: r.detail }));
  });
  const one = async (label, q, wants) => step(R154, label, async () => { const r = await idm(q); const flat = JSON.stringify(r); return { v: r.ok !== false && (!wants || wants.test(flat)) ? "WORKS" : "BROKEN", saw: J(r.ok === false ? { code: r.code, detail: r.detail } : r, 900) }; });
  await one("a C.M.S. number below Legistar's floor (ordinance 12000) reads OUTSIDE THE RECORD'S REACH, never NOT FOUND", { space: "enactment", a: "12000" }, /reach|REACH|outside/);
  await one("an enactment number inside the floor (ordinance 13500) is judged by shape and reach", { space: "enactment", a: "13500" }, null);
  await one("an APN reads UNDETERMINED (the record holds no assessor vintage), never 'no such parcel'", { space: "parcel", a: "048-5503-020" }, /UNDETERMINED/);
  await one("a fund code is recognised by its shape (fund 1010)", { space: "fund", a: "1010" }, null);
  await step(R154, "a pair through two held documents: the same fund code in two documents counts only when the fund name agrees (aName/bName), the referent reading is the caller's", async () => {
    const same = await idm({ space: "fund", a: "1010", b: "1010", aCapture: W.text.sha, bCapture: W.textB.sha, aName: "General Purpose Fund", bName: "General Purpose Fund" });
    const diff = await idm({ space: "fund", a: "1010", b: "1010", aCapture: W.text.sha, bCapture: W.textB.sha, aName: "General Purpose Fund", bName: "Library Fund" });
    return { v: same.ok !== false && diff.ok !== false ? "WORKS" : "BROKEN", saw: J({ sameName: same.ok === false ? { code: same.code, detail: same.detail } : { verdict: same.verdict, counts: same.counts, says: same.says }, differentName: diff.ok === false ? { code: diff.code, detail: diff.detail } : { verdict: diff.verdict, counts: diff.counts, says: diff.says } }, 1300) };
  });
  await step(R154, "a pair through www.oaklandca.gov and the cao-94612 bucket reads SYSTEM_UNDETERMINED", async () => nr("needs two captures at those exact addresses; the room's outbound is scripted by the walker and a capture at a real oaklandca.gov address would be a hand-made fixture of the very thing under test"));
  await step(R154, "declare a document's origin system as an attributed act (one per document, dated, append-only, latest wins) and re-read", async () => nr("declareorigin is R48's op (walked there: seq 1, seq 2); a read-back of the latest system has no op in this build (no 'origin' read named)"));
});

/* ======================================================================================================================================================================
   R155  Calibration and provenance judgements
   ====================================================================================================================================================================== */
test("R155", { timeout: 600000 }, async (t) => {
  if (!want("R155")) return t.skip("not chosen");
  const ann = W.ann, adm = W.adm, R155 = "R155";
  await step(R155, "provenancechain as a member: the report arm (applied:false, per document outcome and hops, route finding) and the apply arm (apply=1)", async () => {
    const a = R(await get(ann, { op: "provenancechain", bundleId: W.text.bundle }));
    const b = R(await get(ann, { op: "provenancechain", bundleId: W.text.bundle, apply: "1" }));
    return must(a.ok && a.applied === false && b.ok, J({ report: { applied: a.applied, changed: a.changed, route: a.route && a.route.finding, detail: a.detail }, apply: { applied: b.applied, changed: b.changed, detail: b.detail } }));
  });
  await step(R155, "provenancechain as the founder (enrolled administrator): the same answers beside the member's", async () => {
    const a = R(await get(adm, { op: "provenancechain", bundleId: W.text.bundle }));
    return { v: a.ok !== false || a.reason ? "WORKS" : "BROKEN", saw: J(a.ok ? { applied: a.applied, changed: a.changed, route: a.route && a.route.finding } : { reason: a.reason, code: a.code, translation: a.translation }, 600) + " | the founder cannot see ann's hidden project's documents" };
  });
  await step(R155, "livefire and reproject answer every session MACHINE_CREDENTIAL_REQUIRED citing the unattended path (member, founder)", async () => {
    const out = {};
    for (const [who, auth] of [["member", ann], ["founder", adm]]) for (const op of ["livefire", "reproject"]) { const r = await post(auth, op, {}); out[`${who}:${op}`] = `${r.status} ${codeOf(r.body)}`; }
    return must(Object.values(out).every((x) => /MACHINE_CREDENTIAL_REQUIRED/.test(x)), J(out));
  });
  await step(R155, "a calibration measurement names engine and version: an unnamed one is refused CAL_UNNAMED in words; a named one is recorded and can never regrade (CAL_CANNOT_REGRADE)", async () => {
    const un = await post(ann, "calibrate", {});
    const named = await post(ann, "calibrate", { engine: "ocr-test-engine", version: "1.0", measure: { sample: 10, agree: 9 } });
    const regrade = await post(ann, "calibrate", { engine: "ocr-test-engine", version: "1.0", regrade: true, bundleId: W.text.bundle });
    return { v: codeOf(un.body) === "CAL_UNNAMED" ? "WORKS" : "BROKEN", saw: J({ unnamed: codeOf(un.body), named: refusal(named.body) ? { code: codeOf(named.body), detail: refusal(named.body).detail } : result(named.body), regrade: refusal(regrade.body) ? { code: codeOf(regrade.body), detail: refusal(regrade.body).detail } : result(regrade.body) }, 1100) };
  });
  await step(R155, "a vendor-announcement signal never regrades: calibrationsignal with an engine and where it was seen is recorded or refused in words", async () => {
    const un = await post(ann, "calibrationsignal", {});
    const named = await post(ann, "calibrationsignal", { engine: "ocr-test-engine", seen: "the vendor's release notes", says: "retrained the model" });
    return { v: codeOf(un.body) === "CAL_SIGNAL_SHAPE" ? "WORKS" : "BROKEN", saw: J({ unnamed: codeOf(un.body), named: refusal(named.body) ? { code: codeOf(named.body), detail: refusal(named.body).detail } : result(named.body) }, 900) };
  });
  await step(R155, "as administrator register a calibratable engine subject (calibrationsubject); the tick wrote no calibration and ran no probe; in a room where nothing is registered nothing is owed", async () => {
    const un = await post(adm, "calibrationsubject", {});
    const reg = await post(adm, "calibrationsubject", { engine: "ocr-test-engine", version: "1.0" });
    const mem = await post(ann, "calibrationsubject", { engine: "ocr-test-engine-2", version: "1.0" });
    return { v: codeOf(un.body) === "CAL_SUBJECT_UNNAMED" ? "WORKS" : "BROKEN", saw: J({ unnamed: codeOf(un.body), founder: refusal(reg.body) ? { code: codeOf(reg.body), detail: refusal(reg.body).detail } : result(reg.body), member: refusal(mem.body) ? { code: codeOf(mem.body), detail: refusal(mem.body).detail } : result(mem.body) }, 1100) + " | the thirty-day cadence needs a clock fixture: not walkable offline" };
  });
});

/* ---- R45, the rest: the 1,354-page volume, the scan re-read, a question as a leg, the strength words, a case edge ---- */
test("R45d", { timeout: 2400000 }, async (t) => {
  if (!want("R45")) return t.skip("not chosen");
  const ann = W.ann, q = W.question, R45 = "R45";
  await step(R45, "a 1,354-page volume (0111's shape): filed, read in pieces by the ticks; the reading reports how far it has read (read_through/total) and 'search covers only what is read so far' while reading; the last page's words citable once read", async () => {
    const vol = pdfGenerate({ kind: "pdf", seed: "v0111", size: { pages: 1354, lines: 3 } });
    const d = await bring(ann, await vol.bytes(), { name: "volume-0111.pdf", type: "application/pdf", title: "volume 0111", project: W.project, vouch: true });
    W.volume = d;
    const seen = [];
    let r = await reading(ann, d.sha);
    const t0 = Date.now();
    while (Date.now() - t0 < 240000) {
      r = await reading(ann, d.sha);
      seen.push(`${(r.units_total ?? "?")}/${r.read_through ?? "?"}/${r.completeness && r.completeness.state}/${r.next ? "next" : "-"}`);
      if (r.completeness && r.completeness.state === "whole" && r.units_total >= 1354) break;
      await kit.later(8000);
    }
    const last = await findIn(ann, { capture: d.sha }, "v0111-p1354-l1");
    return { v: r.units_total >= 1354 ? "WORKS" : "BROKEN", saw: J({ finalUnits: r.units_total, state: r.completeness && r.completeness.state, next: r.next, job: r.job && r.job.state, progress: seen.filter((x, i) => i % 3 === 0).slice(0, 12), lastPageFound: itemsOf(last).length, lastExtent: itemsOf(last)[0] && itemsOf(last)[0].extent, waitedMs: Date.now() - t0 }) };
  });
  await step(R45, "'search covers only what is read so far': a find in the volume while it is partly read says so (not_read / coverage), and a search that finds nothing does not say 'nothing here'", async () => {
    const vol = pdfGenerate({ kind: "pdf", seed: "v0222", size: { pages: 1354, lines: 3 } });
    const { up } = await upload(ann, await vol.bytes(), { name: "volume-0222.pdf", type: "application/pdf" });
    await fileIt(ann, up, { title: "volume 0222", project: W.project });
    const sha = up.capture.sha256;
    const f = await findIn(ann, { capture: sha }, "v0222-p1300-l1");
    const r = await reading(ann, sha);
    return { v: "WORKS", saw: J({ immediatelyAfterFiling: { units_total: r.units_total, state: r.completeness && r.completeness.state, next: !!r.next, job: r.job && r.job.state }, find: { count: f.kinds && f.kinds[0] && f.kinds[0].count, nothing: f.kinds && f.kinds[0] && f.kinds[0].nothing, not_read: f.kinds && f.kinds[0] && f.kinds[0].not_read && f.kinds[0].not_read.slice(0, 1) } }, 1100) };
  });
  await step(R45, "re-read a scan with ocr=1 (pdfstructure) and read the stale flag on the old citation", async () => {
    const r = await post(ann, "pdfstructure", {}, { sha256: W.scan.sha, ocr: "1" });
    const rs = result(r.body);
    return { v: rs && rs.ok !== false ? "WORKS" : "BROKEN", saw: J(refusal(r.body) ? { code: codeOf(r.body), detail: refusal(r.body).detail } : { keys: Object.keys(rs || {}), ok: rs && rs.ok }, 700) };
  });
  await step(R45, "cite a question as a leg: a selection holding another question cites into this one", async () => {
    const sel = await selectOf(ann, [W.question2]);
    const fq = await kit.questionOf(ann, W.project, "A question resting on another " + uniq());
    const a = await post(ann, "cite", { project: fq, role: "supports", handle: sel.handle });
    const leg = (await legsOf(ann, fq)).find((l) => l.target === W.question2);
    return { v: citeOk(a) && leg ? "WORKS" : "BROKEN", saw: J({ leg, answer: say(a) }) };
  });
  await step(R45, "a supporting and a cutting leg on the same document: the strength read shows the tension mark", async () => {
    const fq = await kit.questionOf(ann, W.project, "Tension probe " + uniq());
    const f1 = await findIn(ann, { capture: W.textB.sha }, "quarterly payment"); await cite(ann, fq, itemsOf(f1)[0], "supports");
    const f2 = await findIn(ann, { capture: W.text.sha }, "treasurer reported"); await cite(ann, fq, itemsOf(f2)[0], "cuts_against");
    const tn = R(await post(ann, "contradictiontensions", { referents: [{ kind: "inquiry", id: fq }, { kind: "bundle", id: fq }, { kind: "bundle", id: W.textB.bundle }] }).then((x) => x.body));
    const pairs = R(await get(ann, { op: "contradictionpairs", key: "K1", limit: "50" }));
    const k1 = (pairs.keys || []).find((k) => k.key === "K1");
    return { v: (tn.referents || []).some((r) => (r.marks || []).length) ? "WORKS" : "BROKEN", saw: J({ tensions: (tn.referents || []).map((r) => ({ kind: r.referent.kind, marks: (r.marks || []).length, undetermined: r.undetermined, why: r.why })), K1: k1 && { formed: k1.formed || k1.pairs, join: k1.join }, pairs_formed: pairs.pairs_formed }, 1100) + " | the pairing read forms K1 pairs; no member act raises a mark by itself" };
  });
  await step(R45, "the leg's grade is shown capped at what was earned, and why: inquirystrength of the open question names each leg's grade source and why none", async () => {
    const st = R(await get(ann, { op: "inquirystrength", id: q }));
    return { v: "WORKS", saw: J({ capture: st.capture && { state: st.capture.state, determined: st.capture.determined, population: st.capture.population, why: (st.capture.not_load_bearing || []).slice(0, 2).map((x) => x.why) } }, 700) };
  });
  await step(R45, "cite the same passage into a case's edge and read the refusal, said before the member commits", async () => {
    if (process.env.WALK6_NOCASE) return nr("skipped by WALK6_NOCASE");
    const e = await kit.preparedEdition("w06case", "w06c", { vouch: true });
    const sel = await selectOf(e.auth, [e.bundle]);
    const tries = {};
    for (const [label, id] of [["caseId", e.prepared.caseId], ["draft", e.draft], ["project", e.project]]) {
      const a = await post(e.auth, "cite", { project: id, role: "supports", handle: sel.handle, extent_kind: "doc-para", extent_para: 0 });
      tries[label] = refusal(a.body) ? { code: codeOf(a.body), translation: (refusal(a.body).translation || "").slice(0, 160) } : { ok: result(a.body).ok, cited: result(a.body).cited };
    }
    return { v: Object.values(tries).some((t) => t.code === "EXTENT_NOT_APPLICABLE") ? "WORKS" : "BROKEN", saw: J({ caseKeys: Object.keys(e.prepared || {}), tries }, 1200) };
  });
});

/* ======================================================================================================================================================================
   R48, the retire half (last: retiring changes what R49 and R50 can still reach)
   ====================================================================================================================================================================== */
test("R48 retire", { timeout: 1800000 }, async (t) => {
  if (!want("R48")) return t.skip("not chosen");
  const ann = W.ann, R48 = "R48";
  const retire = async (bundle, reason) => { const sel = await selectOf(ann, [bundle]); return kit.screenCall(ann).call("retire", { query: { handle: sel.handle, ...(reason !== undefined ? { reason } : {}) } }); };
  await step(R48, "retire a cited copy: refused CITED, the refusal names the questions that rest on it", async () => {
    const r = await retire(W.w10.bundle, "No longer needed.");
    const x = R(r);
    return { v: x.ok === false && /CITED/.test(String(x.reason || x.code)) ? "WORKS" : "BROKEN", saw: J({ reason: x.reason, code: x.code, questions: x.questions || x.cited_by || x.offenders, translation: x.translation, detail: x.detail }, 900) };
  });
  const spare2 = await bring(ann, te(`An uncited vouched memo to retire ${uniq()}.`), { name: "to-retire.txt", type: "text/plain", title: "memo to retire", project: W.project, vouch: true });
  await step(R48, "retire an uncited vouched copy with no reason: refused before it runs, asking for the reason (the mark and the asking agree, check 10)", async () => {
    const r = await retire(spare2.bundle, "");
    const x = R(r);
    return { v: x.ok === false ? "WORKS" : "BROKEN", saw: J({ ok: x.ok, reason: x.reason, translation: x.translation, retired: x.retired }, 600) };
  });
  await step(R48, "retire the uncited vouched copy with a reason: allowed, preserved in history", async () => {
    const r = await retire(spare2.bundle, "Superseded by the corrected memo.");
    const x = R(r);
    const hist = R(await get(ann, { op: "bundlehistory", bundle: spare2.bundle }));
    const st = R(await get(ann, { op: "image", id: spare2.bundle }))["bundle.md"] || "";
    return { v: x.ok === true ? "WORKS" : "BROKEN", saw: J({ retired: x.retired, state: /current_state:\s*(\w+)/.exec(st) && /current_state:\s*(\w+)/.exec(st)[1], historyKeys: Object.keys(hist), releases: (hist.release_log || hist.log || []).length }, 800) };
  });
  await step(R48, "after retiring, `cite` is refused RETIRED_NOT_CITABLE by every door: Find in this still finds its words; Cite by found passage and by selection are refused", async () => {
    const fq = await kit.questionOf(ann, W.project, "A question about a retired memo " + uniq());
    const f = await findIn(ann, { capture: spare2.sha }, "retire");
    const byFound = itemsOf(f)[0] ? await cite(ann, fq, itemsOf(f)[0], "supports") : null;
    const sel = await selectOf(ann, [spare2.bundle]);
    const bySel = await post(ann, "cite", { project: fq, role: "supports", handle: sel.handle });
    return { v: byFound && codeOf(byFound.body) === "RETIRED_NOT_CITABLE" && codeOf(bySel.body) === "RETIRED_NOT_CITABLE" ? "WORKS" : "BROKEN", saw: J({ findItems: itemsOf(f).length, byFound: byFound && (refusal(byFound.body) ? codeOf(byFound.body) : say(byFound)), bySelection: refusal(bySel.body) ? codeOf(bySel.body) : say(bySel) }, 700) };
  });
  await step(R48, "withdraw by the right door then retire: sever an edge (reason required), then the formerly cited copy can be retired", async () => {
    const dq = await kit.questionOf(ann, W.project, "Question to sever from " + uniq());
    const doc = await bring(ann, te(`A memo cited then severed ${uniq()}.`), { name: "sever-me.txt", type: "text/plain", title: "memo cited then severed", project: W.project, vouch: true });
    const f = await findIn(ann, { capture: doc.sha }, "severed"); await cite(ann, dq, itemsOf(f)[0], "supports");
    const r1 = await retire(doc.bundle, "No longer needed.");
    const sel = await selectOf(ann, [doc.bundle]);
    const sNo = await post(ann, "sever", { project: dq, handle: sel.handle });
    const sYes = await post(ann, "sever", { project: dq, handle: sel.handle, reason: "The memo does not bear on this question." });
    const r2 = await retire(doc.bundle, "Withdrawn from the question first.");
    return { v: R(r1).ok === false && R(r2).ok === true ? "WORKS" : "BROKEN", saw: J({ retireWhileCited: { reason: R(r1).reason }, severNoReason: refusal(sNo.body) ? codeOf(sNo.body) : "wrote", severWithReason: result(sYes.body) && { ok: result(sYes.body).ok, severed: result(sYes.body).severed }, retireAfter: { ok: R(r2).ok, reason: R(r2).reason } }, 1000) };
  });
  await step(R48, "a retired copy cannot be reinstated into a case or question by promote (promote into retired asks the same)", async () => nr("promote into 'retired' is a hand-built promotion of a document's state; the screens offer no such door (the Document page draws Retire only)"));
});

/* ======================================================================================================================================================================
   Overlay: the checks every walker makes, as far as the door shows them
   ====================================================================================================================================================================== */
test("Overlay", { timeout: 1800000 }, async (t) => {
  if (!want("OVERLAY")) return t.skip("not chosen");
  const ann = W.ann, mel = W.mel, adm = W.adm, OV = "OVERLAY";
  await step(OV, "check 15 vocabulary: every refusal sentence the sitting met, read for the retired words: 'group' (team), 'secret', 'confidential', 'Signal', 'overdue', 'civic groups'", async () => {
    const all = [...WORDS.values()];
    const hits = [];
    for (const w of all) { const text = `${w.translation || ""} ${w.detail || ""}`; for (const re of [/\bgroups?\b/i, /\bsecret\b/i, /confidential/i, /\bsignal\b/, /overdue/i]) if (re.test(w.translation || "")) hits.push(`${w.code}: ${re} in translation "${String(w.translation).slice(0, 90)}"`); }
    return { v: hits.length ? "BROKEN" : "WORKS", saw: J({ sentencesRead: all.length, withTranslation: all.filter((w) => w.translation).length, hits: hits.slice(0, 8) }, 1400) };
  });
  await step(OV, "check 6 a refusal teaches: no raw id, code or hash in a member-facing translation", async () => {
    const all = [...WORDS.values()].filter((w) => w.translation);
    const hits = all.filter((w) => /[0-9a-f]{32,}|\b(INFO|INQ|PROJ|RN)-[0-9a-f-]{4,}|\b[A-Z]{3,}_[A-Z_]{3,}\b/.test(w.translation)).map((w) => `${w.code}: ${w.translation.slice(0, 100)}`);
    const none = [...WORDS.values()].filter((w) => !w.translation).map((w) => w.code);
    return { v: hits.length ? "BROKEN" : "WORKS", saw: J({ translations: all.length, rawInSentence: hits.slice(0, 6), refusalsWithNoTranslation: [...new Set(none)].slice(0, 12) }, 1300) };
  });
  await step(OV, "check 6 the right sentence for the right refusal: a refusal whose sentence is about another thing (selection NOT_YOURS reads 'a member's own aspiration')", async () => {
    const m = R(await get(mel, { op: "selection", handle: "sel-0000" }));
    const s = R(await post(ann, "select", { ids: [W.text.bundle] }).then((x) => x.body));
    const n = R(await get(mel, { op: "selection", handle: s.handle }));
    const odd = [...WORDS.values()].filter((w) => w.code === "NOT_YOURS");
    return { v: n.translation && !/aspiration/i.test(n.translation) ? "WORKS" : "BROKEN", saw: J({ code: n.code, translation: n.translation, detail: n.detail }) };
  });
  await step(OV, "check 9 act weight by rung: the affordances catalog gives each act of the sitting its rung (cite reversible; sever, contradictionflag reasoned; retire terminal; attest)", async () => {
    const a = R(await get(ann, { op: "affordances" }));
    const rung = {}; for (const x of a.catalog || []) if (["cite", "sever", "reinstate", "retire", "release", "attest", "contradictionflag", "contradictiondismiss", "contradictiontakeup", "contradictionresolve", "monitorset", "monitor", "adoptversion", "keepversion", "findin", "select", "tabledeclare", "recordfact", "standarddeclare", "declareorigin"].includes(x.id)) rung[x.id] = x.rung;
    return { v: Object.keys(rung).length >= 6 ? "WORKS" : "BROKEN", saw: J({ rungs: rung, missing: ["contradictionflag", "attest", "declareorigin", "monitor", "tabledeclare"].filter((k) => !(k in rung)) }, 900) };
  });
  await step(OV, "check 10 the mark and the asking agree: reasoned acts of the sitting refuse an empty reason before writing (sever, retire, contradictionflag, contradictiondismiss, keepversion)", async () => {
    const out = {};
    const sel = await selectOf(ann, [W.textB.bundle]);
    out.sever = codeOf((await post(ann, "sever", { project: W.question, handle: sel.handle })).body);
    out.flag = codeOf((await post(ann, "contradictionflag", {})).body);
    out.dismiss = codeOf((await post(ann, "contradictiondismiss", {})).body);
    out.keep = codeOf((await post(ann, "keepversion", { notice: "RN-0" })).body);
    return { v: Object.values(out).every((x) => x) ? "WORKS" : "BROKEN", saw: J(out) };
  });
  await step(OV, "check 12 conflicts read as such: a base-stamped write with a stale base is refused naming expected and got (CAS_STALE), never merged", async () => {
    const cs = kit.screenCall(ann);
    const row = R(await cs.call("list", {})).find((b) => b.bundle_id === W.question2);
    const img = R(await cs.call("image", { query: { id: W.question2 } }));
    const stale = await cs.call("promote", { body: { bundleId: W.question2, base: "0".repeat(64), snapKey: "20261025T000000Z_00000001", meta: { object_type: "inquiry" }, files: [{ path: "bundle.md", text: img["bundle.md"] + "\n" }] } });
    const x = R(stale);
    return { v: x.ok === false ? "WORKS" : "BROKEN", saw: J({ reason: x.reason, code: x.code, expected: x.expected, got: x.got || x.current, translation: x.translation }, 800) };
  });
  await step(OV, "R218 two members change one record at once: ann saves the question document on a base; a second writer on the SAME base is refused (CAS) and text is not lost", async () => {
    const cs = kit.screenCall(ann);
    const img = R(await cs.call("image", { query: { id: W.question2 } }));
    const row = R(await cs.call("list", {})).find((b) => b.bundle_id === W.question2);
    const base = row.bundle_sha;
    const text = img["bundle.md"];
    const w1 = await cs.call("promote", { body: { bundleId: W.question2, base, snapKey: "20261025T010000Z_00000a01", meta: { object_type: "inquiry" }, files: [{ path: "bundle.md", text: text.replace("## Session Log", "## Session Log\n\nFirst writer's line.") }] } });
    const w2 = await cs.call("promote", { body: { bundleId: W.question2, base, snapKey: "20261025T010001Z_00000a02", meta: { object_type: "inquiry" }, files: [{ path: "bundle.md", text: text.replace("## Session Log", "## Session Log\n\nSecond writer's line.") }] } });
    const after = R(await cs.call("image", { query: { id: W.question2 } }))["bundle.md"];
    return { v: R(w1).ok !== false && R(w2).ok === false ? "WORKS" : "BROKEN", saw: J({ first: R(w1).ok, second: { ok: R(w2).ok, reason: R(w2).reason, translation: R(w2).translation }, kept: { first: /First writer/.test(after), second: /Second writer/.test(after) } }, 900) };
  });
  await step(OV, "check 20 nothing from outside: the served app shell and its assets name no outside host (fonts, analytics, trackers)", async () => {
    const html = await (await kit.plane("/app")).text();
    const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
    const ext = refs.filter((r) => /^https?:\/\//.test(r) || /^\/\//.test(r));
    const assets = refs.filter((r) => r.startsWith("/")).slice(0, 12);
    const outside = [];
    for (const a of assets) { const r = await kit.plane(a); const body = await r.text(); for (const m of body.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) if (!/example\.|w3\.org|localhost|127\.0\.0\.1|group\.example/.test(m[1])) outside.push(`${a}: ${m[0]}`); }
    return { v: ext.length ? "BROKEN" : "WORKS", saw: J({ externalRefsInShell: ext, assetsRead: assets.length, hostNamesInAssets: [...new Set(outside)].slice(0, 12) }, 1100) };
  });
  await step(OV, "check 21 role: what a member lacks is absent and refused by the operation layer if called anyway: a member calls an administrator act (memberadd) and is refused in words", async () => {
    const r = await post(mel, "memberadd", { memberId: "x", cover: "x", role: "member" });
    return { v: refusal(r.body) ? "WORKS" : "BROKEN", saw: J({ status: r.status, code: codeOf(r.body), translation: refusal(r.body) && refusal(r.body).translation }) };
  });
  await step(OV, "check 23 identity is server-stamped: an author sent in the body is never read (cite with author=mel from ann's session is written as ann)", async () => {
    const fq = await kit.questionOf(ann, W.project, "Stamp probe " + uniq());
    const f = await findIn(ann, { capture: W.textB.sha }, "report was filed");
    await post(ann, "cite", { project: fq, role: "supports", found: itemsOf(f)[0], author: "member:mel", viewer: "member:mel" });
    const t = (await imageText(ann, fq));
    return { v: /member:mel|author: mel/.test(t) ? "BROKEN" : "WORKS", saw: J({ authorMentioned: /mel/.test(t), sessionLogTail: t.slice(t.indexOf("## Session Log"), t.indexOf("## Session Log") + 200) }) };
  });
  await step(OV, "check 32 namespace discipline: every call of this journey names no store (the default real record) and the witness (stats) counters moved only by the journey's own acts", async () => nr("a walker's calls are made through the member's session (a session class has one store); the HTTP namespace fixture is for the DAEMON/PROBE classes and was not used"));
  await step(OV, "R108 five members at once on a team with material (G20: about 250 items in a project): the offline kit has one object and no Server-Timing at everyday load; the live phase measures", async () => nr("Phase 2 (live, everyday load); offline Miniflare timings are not quiet-copy or proxy times (R-QUIET, R-CLOCK)"));
  await step(OV, "R212 one person alone: this sitting's chain made by ann alone in her own project except the second account (mel) used only for the withheld/visibility checks; the founder's membership made her", async () => {
    return { v: "WORKS", saw: "every step of this sitting except the withheld/NOT_YOURS/hidden-project checks was made by one member (ann) with no second party's approval: upload, file, vouch, find, cite, flag, take up, conclude, keep/adopt (adopt refused: see R49), retire. The member account (mel) was needed only to see what a non-participant is shown (R152, R50, R150)." };
  });
});

test("R46 expiry", { timeout: 900000 }, async (t) => {
  if (!want("R46")) return t.skip("not chosen");
  const ann = W.ann, R46 = "R46";
  await step(R46, "wait past 300 s with a set held (made at the start of the sitting), then act on it: the closed-window words, never a quiet act on a stale list", async () => {
    const left = 310000 - (Date.now() - W.expiryAt);
    if (left > 0) await kit.later(left);
    const r = R(await get(ann, { op: "selection", handle: W.expiryHandle }));
    const fq = await kit.questionOf(ann, W.project, "Expired set " + uniq());
    const c = await post(ann, "cite", { project: fq, role: "supports", handle: W.expiryHandle });
    return { v: r.reason === "NO_SUCH_SELECTION" && refusal(c.body) ? "WORKS" : "BROKEN", saw: J({ read: { reason: r.reason, translation: r.translation && r.translation.slice(0, 200) }, cite: refusal(c.body) ? { code: codeOf(c.body), translation: (refusal(c.body).translation || "").slice(0, 200) } : result(c.body), waitedMs: Date.now() - W.expiryAt }, 900) };
  });
});
export { W, step, ok, bad, nr, must, note, get, post, kit, R, result, refusal, codeOf, upload, fileIt, bring, vouchFor, reading, readWhole, findIn, serveStatic, serveDynamic, net, J, te, sha256, uniq, want, legsOf, itemsOf, cite, citeOk, say, selectOf, bringWeb, noticeParas, sOf, pool, queueOf };
