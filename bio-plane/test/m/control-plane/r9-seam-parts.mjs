/* control-plane (fix round 9, K4842; job 43; R-SEAM, R-ONE, R-CLOCK, R-NOLOAD): THE SECOND HALF OF THE SEAM, sections 10-13 of `t51-round9-seam.test.mjs` (plan 3b): a member's own acts
   through the real plane under Miniflare, files made by the library's generators (`docgen`, `sheetgen`), counts, rows and fields, never a wall time (R-CLOCK).
     10  G134a/d  a part kind found, cited and shown: every part of a DOCX / PPTX / ODT is a unit with its kind; `op=search` returns it with the kind; the citation names it; the Document page shows it
     11  G135/G126  the states of a read come from the job row; the registrar with the real table (a kill between the put and the filing finds one job row)
     12  G131a/g  the encoding matrix through the upload and the fetch
     13  G130a-d  detection polyglots through the upload
   Requirement ids in titles: R100, R120, R123, R125, R130-R135 (control-plane); the owners' ids ride beside the cause. A test whose provider's behaviour is not yet met is RED BY NAME (its title says so
   and the record names the CHANGE asked of BOB): no assertion is weakened. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { CAPTURE_SCREEN } from "../../../src/screens-intake/capture.mjs";
import { PART_KIND_WORDS } from "../../../src/content/index.mjs";
import { SCREENS } from "../../../src/screens-inquiry/index.mjs";
import { OPS } from "../../../src/op-declarations/index.mjs";
import { boot } from "../interface-shell/harness.mjs";
import { generate as docGenerate } from "../../docgen.mjs";
import { makeKit } from "./r8-kit.mjs";
import { world, scanOf } from "./r9-seam-reading.mjs";
import { FAULT_SCRIPT } from "./r9-seam-documents.mjs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { after } from "node:test";

const HERE = dirname(fileURLToPath(import.meta.url));
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const ENDED = ["finished", "final", "refused"];

const enc = encodeURIComponent;
let counter = 0;
export const uniq = () => `${Date.now().toString(36)}${(counter++).toString(36)}`;
const textOf = (v) => JSON.stringify(v || {});
export const bytesOf = async (g) => Buffer.from(await g.bytes());

/** the member's upload through the real door */
export async function put(k, auth, bytes, { name, type, statement = name }) {
  const res = await k.plane(`/api/?op=captureupload&statement=${enc(statement)}&name=${enc(name)}&type=${enc(type)}`, { method: "POST", headers: auth, body: bytes });
  const body = await res.json();
  return { status: res.status, up: body.result ?? body, headers: res.headers };
}
/** the capture screen's promotion of the document the upload answered, under `project` ("" for none) */
export async function fileIt(k, auth, up, { title, project = "" }) {
  const made = await CAPTURE_SCREEN.parts.promoteDocument(k.screenCall(auth), { doc: up.document, title, locator: up.document.locator, project });
  assert.equal(made.refused, undefined, "promoted: " + JSON.stringify(made).slice(0, 400));
  return made.bundleId;
}
/** the reading by digest, waited for until it has ended (whole, or ended with a reason) */
export async function readEnded(k, auth, sha, ms = 240000) {
  let last = null;
  const got = await k.until(async () => {
    last = (await k.get(auth, { op: "reading", sha256: sha })).result;
    const c = last && last.completeness;
    return last && last.found === true && last.more !== true && c && (c.state === "whole" || c.failure === "final") ? last : null;
  }, ms, 2000);
  assert.ok(got, "the reading ended: " + textOf(last && { found: last.found, more: last.more, completeness: last.completeness, job: last.job }).slice(0, 500));
  return got;
}
/** every text unit of a reading, paged by `next` */
export async function allUnits(k, auth, sha) {
  let r = (await k.get(auth, { op: "reading", sha256: sha })).result;
  const units = [...(r.text_units || [])];
  for (let i = 0; i < 400 && r && r.next != null; i++) {
    r = (await k.get(auth, { op: "reading", sha256: sha, after: String(r.next) })).result;
    units.push(...(r.text_units || []));
  }
  return units;
}
/** `op=search` for a passage by one word (the generators' unit ids are distinct words) */
export const passageHits = async (k, auth, word) => ((await k.get(auth, { op: "search", q: `passage:"${word}"` })).result || {}).hits || [];
/** the member's find-in-this-document */
export const findIn = async (k, auth, sha, term) => { const f = (await k.post(auth, "findin", { scope: { capture: sha }, kinds: ["term"], term })).body; return ((((f && f.result) || f || {}).kinds || [])[0] || {}).items || []; };

/* the closed list of a part's kind (reading-pipeline R47) by the generator's part name */
export const KIND_OF = Object.freeze({ body: "body", footnote: "footnote", endnote: "endnote", header: "header", footer: "footer", comment: "comment", deleted: "tracked_deletion", textbox: "text_box",
  notes: "speaker_note", master: "master_text", hidden: "body" });

export function sections(kit, counting) {
  void counting;
  const k = kit;
  const owner = (h) => k.ownerOf(h).then((o) => o.auth);
  const owner0 = (kk) => kk.ownerOf("r9p-bea").then((o) => o.auth);

  /* one document of `recipe`, uploaded, filed under a project of its own, its reading waited for */
  async function filedDoc(handle, recipe, name) {
    const auth = await owner(handle);
    const g = docGenerate(recipe);
    const project = await k.projectOf(auth, `R9 §10 ${recipe.kind} ${uniq()}`);
    const { up } = await put(k, auth, await bytesOf(g), { name, type: g.type });
    assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
    const bundle = await fileIt(k, auth, up, { title: name, project });
    const reading = await readEnded(k, auth, up.capture.sha256);
    return { auth, g, up, bundle, project, sha: up.capture.sha256, reading, units: await allUnits(k, auth, up.capture.sha256) };
  }

  /* ======================================== §10 · G134a, G134d · a part kind found, cited and shown ======================================== */

  /* each truth unit of a generated document: its words are a unit of the reading with the kind the part names, and `op=search` returns the passage with that kind */
  async function partsFoundWithTheirKinds(d) {
    const wrong = [];
    for (const u of d.g.truth.all()) {
      const want = KIND_OF[u.part];
      const unit = d.units.find((x) => String(x.text).includes(u.id) && x.kind === want);
      if (!unit) wrong.push(`${u.part}: no unit of kind ${want} holds ${u.id} (kinds with it: ${d.units.filter((x) => String(x.text).includes(u.id)).map((x) => x.kind)})`);
      const found = await k.until(async () => { const h = await passageHits(k, d.auth, u.id); return h.length ? h : null; }, 90000, 2000);
      if (!found) { wrong.push(`${u.part}: op=search finds nothing for ${u.id}`); continue; }
      const hit = found.find((h) => h.bundle_id === d.bundle) || found[0];
      if (hit.kind !== want) wrong.push(`${u.part}: the hit says kind ${hit.kind}, wanted ${want}`);
    }
    return wrong;
  }

  test("R9 seam §10 (G134a, G134d, DOCS O4; R123 R135 R100): a DOCX with a footnote, endnote, header, footer, comment, tracked deletion and text box: every part is a unit with its kind, found by `op=search` with that kind, and the reading is whole", { timeout: 900000 }, async () => {
    const d = await filedDoc("r9p-ann", { kind: "docx", seed: 9134, size: { units: 4 }, parts: ["footnote", "endnote", "header", "footer", "comment", "deleted", "textbox"] }, "parts.docx");
    assert.equal(d.reading.completeness.state, "whole", textOf(d.reading.completeness));
    assert.deepEqual(await partsFoundWithTheirKinds(d), []);
  });

  test("R9 seam §10 (G134a, G134d, DOCS P3; R123 R135): a PPTX with speaker notes, master text and a hidden slide: the notes are `speaker_note`, the master `master_text`, the hidden slide is read", { timeout: 900000 }, async () => {
    const d = await filedDoc("r9p-ann", { kind: "pptx", seed: 9135, size: { units: 3 }, parts: ["notes", "master", "hidden"] }, "parts.pptx");
    assert.deepEqual(await partsFoundWithTheirKinds(d), []);
  });

  test("R9 seam §10 (G134a, G134d, DOCS D1; R123 R135): an ODT with a footnote, a header and a comment: each is a unit of its own kind, and the footnote's words are not fused onto its paragraph", { timeout: 900000 }, async () => {
    const d = await filedDoc("r9p-ann", { kind: "odt", seed: 9136, size: { units: 4 }, parts: ["footnote", "header", "comment"] }, "parts.odt");
    assert.deepEqual(await partsFoundWithTheirKinds(d), []);
    const foot = d.g.truth.unit(5).id;
    const fused = d.units.filter((u) => u.kind === "body" && String(u.text).includes(foot));
    assert.deepEqual(fused.map((u) => String(u.text).slice(0, 60)), [], "no body unit holds the footnote's words");
  });

  test("R9 seam §10 (G134d, DOCS O4; R123 R135) (red until the leg check accepts a `doc-part` extent: citing a footnote is refused `BASIS_REFUSED` `CONTENT_EXTENT_UNREADABLE` today, \"extent kind 'doc-part' is not one of ...\"): the footnote found is cited in a question, and the content row's reference names the kind", { timeout: 900000 }, async () => {
    const d = await filedDoc("r9p-ann", { kind: "docx", seed: 9137, size: { units: 3 }, parts: ["footnote"] }, "cited.docx");
    const cs = k.screenCall(d.auth);
    const question = await k.questionOf(d.auth, d.project, "Which figure does the footnote give?");
    const foot = d.g.truth.unit(4).id;
    const item = (await findIn(k, d.auth, d.sha, foot))[0];
    assert.ok(item, "the footnote is found in its document");
    const cited = await cs.call("cite", { body: { project: question, role: "supports", found: item } });
    const result = k.R(cited);
    assert.notEqual(result.ok, false, "the citation of a footnote is accepted: " + textOf(result).slice(0, 500));
    const again = (await findIn(k, d.auth, d.sha, foot))[0];
    assert.ok(again && again.content_id, "the cited footnote has a content row: " + textOf(again).slice(0, 300));
    const row = k.R(await k.get(d.auth, { op: "content", id: again.content_id }));
    assert.ok(textOf(row).includes(PART_KIND_WORDS.footnote), "the citation's reference names the kind: " + textOf(row).slice(0, 500));
  });

  test("R9 seam §10 (G134d, DOCS O4; R123 R135): the Document page shows the kind beside a footnote's words, and the body's beside the body's, from the plane's own reading", { timeout: 900000 }, async () => {
    const d = await filedDoc("r9p-ann", { kind: "docx", seed: 9138, size: { units: 3 }, parts: ["footnote"] }, "page.docx");
    const plane = Object.fromEntries(Object.keys(OPS).map((op) => [op, async (req) => {
      const r = await k.plane(`/api/?${new URLSearchParams({ ...req.query, op })}`, { method: req.body === undefined ? "GET" : "POST", headers: { ...d.auth, "content-type": "application/json" },
        ...(req.body === undefined ? {} : { body: JSON.stringify(req.body) }) });
      return { status: r.status, json: await r.json().catch(() => null) };
    }]));
    const p = await boot({ screens: SCREENS, plane, path: "/app/document/" + d.bundle });
    const main = () => p.doc.getElementById("cs-main");
    const until = async (done, ms = 90000) => { const end = Date.now() + ms; for (;;) { await p.settle(20); if (done()) return true; if (Date.now() > end) return false; await k.later(100); } };
    assert.ok(await until(() => !!main().querySelector("[data-text-state]")), "the Document page is drawn");
    const drawn = new Set(main().querySelectorAll("[data-part-kind]").map((t) => t.getAttribute("data-part-kind")));
    assert.ok(drawn.has("footnote") && drawn.has("body"), `the page shows the kinds: ${[...drawn]}`);
    const foot = d.g.truth.unit(4).id;
    const quote = main().querySelectorAll("blockquote").find((b) => String(b.textContent).includes(foot));
    assert.ok(quote, "the footnote's words are drawn");
    assert.equal(quote.querySelector("[data-part-kind]").getAttribute("data-part-kind"), "footnote", "with its kind beside them");
  });

  /* ======================================== §11 · G135a-f, G126 · the states of a read; the registrar with the real table ======================================== */

  const faultKits = [];
  after(() => { for (const f of faultKits) { try { f.mf.dispose(); } catch { /* gone */ } } });
  /* a kit whose R2 `put` of a named digest fails `times` times (the platform's seam; the plane under it is the real one) */
  function faultKit(tag, cfg) {
    let f;
    f = makeKit({ tag, bindings: { DAEMON_TOKEN: `dmn-${tag}-0123456789abcdef` }, serviceBindings: { SELF: (req) => f.mf.dispatchFetch(req) } });
    f.ready = f.mf.setOptions({ ...f.OPTIONS, script: FAULT_SCRIPT(cfg), scriptPath: join(HERE, "r9-fault-entry.worker.mjs") });
    faultKits.push(f);
    return f;
  }
  const readingRows = async (kk, sha) => (kk.R(await kk.get(await kk.founder(), { op: "owedwork", sha })).owed || []).filter((r) => r.kind === "reading");
  /* a text of about 4 MB: the smallest size the door defers to the job table (the plane's head-of-line case) */
  const bigText = (tag) => { const line = (i) => `line ${String(i).padStart(6, "0")} ${tag} ` + "council-minutes ".repeat(5).padEnd(80, ".") + "\n"; const out = []; for (let i = 0; i < 40000; i++) out.push(line(i)); out.push("ENDMARKER" + tag); return Buffer.from(out.join("")); };

  test("R9 seam §11 (G126, G126c; R130 R123): the real job table: an upload whose first put fails registers no row (the row commits or rolls back with the filing), the retry registers exactly one `reading` row keyed by the whole digest, and the same bytes again leave one", { timeout: 900000 }, async () => {
    const bytes = bigText(uniq()), sha = sha256(bytes);
    const f = faultKit(`r9p11a`, { putFail: [{ sha, times: 1 }] });
    await f.ready;
    const auth = await owner0(f);
    const first = await put(f, auth, bytes, { name: "minutes.txt", type: "text/plain" });
    assert.notEqual(first.up.reading_pending, true, "a filing that failed promises no reading: " + textOf({ ...first.up, document: undefined }).slice(0, 300));
    assert.deepEqual((await readingRows(f, sha)).map((r) => r.job_state), [], "no row for a capture the filing did not keep");
    const second = await put(f, auth, bytes, { name: "minutes.txt", type: "text/plain" });
    assert.equal(second.up.ok, true, textOf(second.up).slice(0, 300));
    assert.equal(second.up.reading_pending, true, "deferred to the job table");
    const rows = await readingRows(f, sha);
    assert.deepEqual(rows.map((r) => [r.sha, r.job_state]), [[sha, "queued"]], "exactly one row, keyed by the whole digest, queued");
    const third = await put(f, auth, bytes, { name: "minutes.txt", type: "text/plain" });
    assert.equal(third.up.existed, true, "the same bytes again are held already");
    assert.equal((await readingRows(f, sha)).length, 1, "and still one row");
  });

  test("R9 seam §11 (G135f, G126; R135 R130 R133) (red until the finished row carries the finishing pass's counters: it states written 0 and failed 1 `NO_HOME` for a read that wrote every unit): a scan read to its end: `op=reading`'s job state is finished, nothing owed, and its counters are the reading's own", { timeout: 900000 }, async () => {
    const w = world({ tag: "r9p11b" });
    const ann = await w.person("r9p-ann");
    const bytes = Buffer.from(scanOf(8, uniq())), sha = w.sha(bytes);
    const up = await w.upload(ann, bytes, { name: "scan.pdf", type: "application/pdf" });
    await w.file(ann, up, "scan");
    let r = null;
    const ended = await w.until(async () => { await w.tick(1); r = await w.reading(ann, sha); return r && r.job && ENDED.includes(r.job.state) && r.completeness && r.completeness.state === "whole" ? r : null; }, 240000, 500);
    assert.ok(ended, "the read ended: " + textOf({ completeness: r && r.completeness, job: r && r.job }).slice(0, 500));
    assert.equal(r.job.owed, 0, "nothing is owed");
    assert.deepEqual([r.job.written, r.job.failed], [r.completeness.counters.written, 0], `the row's counters are the reading's: ${textOf(r.job)} against ${textOf(r.completeness.counters)}`);
    assert.deepEqual((await w.owed(sha)).rows.filter((x) => ["reading", "ocr"].includes(x.kind)), [], "no row is left open");
  });

  test("R9 seam §11 (G135a, G135e, DOCS R1/R2/R3; R135 R100 R123) an RTF, an email and a legacy Word file the member filed are each stated by their kind, final, and the job row ends (the first pass leaves it `queued` with `failed` 1 `NO_HOME`; the test waits for the alarm's pass)", { timeout: 900000 }, async () => {
    const auth = await owner0(k);
    const cases = [["rtf", "a.rtf", "text/rtf", Buffer.from("{\\rtf1\\ansi A line of RTF " + uniq() + "}")],
      ["email", "a.eml", "message/rfc822", Buffer.from("From: a@b.c\r\nSubject: " + uniq() + "\r\n\r\nbody\r\n")],
      ["legacy_word", "a.doc", "application/msword", Buffer.concat([Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]), Buffer.from(uniq().repeat(60))])]];
    const bad = [];
    for (const [kind, name, type, body] of cases) {
      const { up } = await put(k, auth, body, { name, type });
      await fileIt(k, auth, up, { title: name });
      const sha = up.capture.sha256;
      const r = await k.until(async () => { const x = (await k.get(auth, { op: "reading", sha256: sha })).result; return x && x.found && x.job && x.job.state !== "queued" && x.job.state !== null ? x : (x && x.found && x.job && x.job.state === null ? x : null); }, 120000, 2000);
      const reading = (r && r.reading) || up.document.reading || {};
      if (!(reading.failure === "final" && reading.reason === "UNSUPPORTED_FORMAT" && reading.kind === kind)) bad.push(`${kind}: not stated by its kind: ${textOf({ f: reading.failure, r: reading.reason, k: reading.kind })}`);
      if (!r || !(r.job.state === null || ENDED.includes(r.job.state))) bad.push(`${kind}: the job row did not end: ${textOf(r && r.job)}`);
    }
    assert.deepEqual(bad, []);
  });
}
