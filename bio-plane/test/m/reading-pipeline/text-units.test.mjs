/* reading-pipeline R32 (T49; D6 B; K3324 (1)) and R22 (N1065): the text units of a capture read as text through no format
   entry, at `read`'s interface, over stored captures; and the module's whole outward text against `jurisdictions`' full
   place list. Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc, member, withEntry, i2, noText, folio, ocrAnswer } from "./fixture.mjs";
import * as rp from "../../../src/reading-pipeline/index.mjs";
import { ACQUIRE_TEXT_UNITS_BUDGET, CAPTURE_TEXT_UNIT_CAP, ACQUIRE_TEXT_UNIT_ENVELOPE, ReadHooks, tier4Extend } from "../../../src/reading-pipeline/index.mjs";
import { list as listProfiles } from "../../../../jurisdictions/index.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";

registerDoctypes(registerDoctype);

const readAs = async (w, body, { ct, format, headers = [["content-type", ct]], ...rest } = {}) => {
  const d = await hold(w.evidence, body);
  return w.read(doc({ digest: d, bytes: Buffer.byteLength(body), ct, format, fromText: true, headers, ...rest }));
};
const html = (body, ct = "text/html; charset=utf-8") => readAs(fresh(), body, { ct, format: "html" });
const plain = (body) => readAs(fresh(), body, { ct: "text/plain", format: "undetermined" });
const shape = (out) => out.text_units.map((u) => [u.extent.kind, u.extent.para, u.extent.run, u.seq, u.text]);

const PAGE = `<!DOCTYPE html><html><head><title>Hidden Title</title><style>.t { color: red }</style></head><body>
<script>var secret = "<p>script words</p>";</script><!-- comment words -->
<h1>Budget &amp; Rules &lt;2026&gt;</h1>
<p class="lead" data-note="a>b">First paragraph
  wraps over two source lines &#169; &#x41;&nbsp;done.</p><p>Second<br>line</p><div></div>
<ul><li>One</li><li>Two</li></ul><style>late style words</style></body></html>`;

test("R32 R1: an HTML capture read as text with no format entry answers one doc-para unit per paragraph of its visible text: markup, attributes, script, style and comments dropped, character references decoded, para from 0 and seq the position", async () => {
  const out = await html(PAGE);
  assert.deepEqual(shape(out), [
    ["doc-para", 0, null, 0, "Budget & Rules <2026>"],
    ["doc-para", 1, null, 1, "First paragraph wraps over two source lines © A done."],
    ["doc-para", 2, null, 2, "Second line"],
    ["doc-para", 3, null, 3, "One"],
    ["doc-para", 4, null, 4, "Two"]]);
  assert.deepEqual(Object.keys(out.text_units[0]), ["extent", "seq", "text"]);
  assert.deepEqual(Object.keys(out.text_units[0].extent), ["kind", "para", "run"]);
  const said = out.text_units.map((u) => u.text).join("\n");
  for (const gone of [/<\/?[a-z!]/i, /class=|data-note|lead/, /secret|script words/, /color: red|late style/, /comment words/, /Hidden Title/, /&amp;|&#|&nbsp;/])
    assert.doesNotMatch(said, gone, String(gone));
  /* R1's reading is otherwise as before: text counts and provenance stay over exactly the text the reader was handed */
  const { reading } = out;
  assert.equal(reading.read_from_text, true);
  assert.equal(reading.text_chars, PAGE.length);
  assert.equal(reading.provenance.text_sha256.length, 64);
  assert.equal(reading.provenance.text_chars, PAGE.length);
  assert.equal(reading.text_source, undefined);
});

test("R32 R1: a plain-text capture answers one doc-para unit per run of text between blank lines, in the text's order; a blank-looking line separates, a wrapped line does not; the units' text is the paragraph", async () => {
  const out = await plain("\n\nFirst line\nstill the first\n\n   \t\nSecond\r\n\r\nThird  \n");
  assert.deepEqual(shape(out), [
    ["doc-para", 0, null, 0, "First line\nstill the first"],
    ["doc-para", 1, null, 1, "Second"],
    ["doc-para", 2, null, 2, "Third"]]);
  /* a capture whose bytes are not UTF-8 is read as the intake decoded it */
  const bytes = Uint8Array.from([...Buffer.from("caf"), 0xe9, ...Buffer.from(" au lait\n\nsecond")]);
  const w = fresh();
  const d = await hold(w.evidence, bytes);
  const lat = await w.read(doc({ digest: d, bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true, headers: [] }));
  assert.deepEqual(lat.text_units.map((u) => u.text), ["caf� au lait", "second"]);
});

test("R32 R15: the wire's rules apply unchanged to these units: a paragraph over the per-unit cap is carried as its capped prefix marked truncated, units past the byte budget are left out and named", async () => {
  const big = "x".repeat(CAPTURE_TEXT_UNIT_CAP + 10);
  const per = CAPTURE_TEXT_UNIT_CAP + ACQUIRE_TEXT_UNIT_ENVELOPE;
  const fit = Math.floor(ACQUIRE_TEXT_UNITS_BUDGET / per);
  const out = await plain([big, big, big, big, big].join("\n\n"));
  assert.equal(out.text_units.length, fit);
  assert.ok(out.text_units.every((u) => u.truncated === true && u.text.length === CAPTURE_TEXT_UNIT_CAP));
  assert.equal(out.text_units_over_bound, 5 - fit);
  assert.deepEqual(out.text_units_skipped, [{ first: { kind: "doc-para", para: fit, run: null }, first_seq: fit,
    last: { kind: "doc-para", para: 4, run: null }, last_seq: 4, units: 5 - fit }]);
});

test("R32 (control) R1 R21: a capture read as text whose text holds no glyph answers no text_units, absent and never an empty list, and its reading is as R1 states it; so does an HTML page with markup and no words", async () => {
  for (const out of [await plain(" \n\n\t\n"), await html("<html><head><title>x</title></head><body><div> </div><script>var a = 1</script></body></html>")]) {
    assert.equal("text_units" in out, false);
    assert.equal("text_units_over_bound" in out, false);
    assert.equal("text_units_skipped" in out, false);
    assert.ok(out.reading.basis.length > 0, "a reading is still recorded, with its basis");
  }
});

test("R32 (control) R1: a capture not read as text answers no text_units: a multipart capture, a capture over the profile's text bound or of a non-textual type (profiled_from_text false), and a capture whose bytes are not held", async () => {
  const w = fresh();
  const words = "words that would be a unit\n\nand another";
  const d = await hold(w.evidence, words);
  const multi = await w.read(doc({ digest: d, bytes: words.length, ct: "text/plain", format: "undetermined", fromText: true, headers: [],
    parts: [{ index: 0, sha256: d, bytes: words.length }] }));
  assert.equal("text_units" in multi, false);
  assert.match(multi.reading.basis, /not read as text/);
  const over = await w.read(doc({ digest: d, bytes: words.length, ct: "text/plain", format: "undetermined", fromText: false, headers: [] }));
  assert.equal("text_units" in over, false);
  assert.match(over.reading.basis, /not read as text/);
  const absent = await w.read(doc({ digest: "e".repeat(64), ct: "text/plain", format: "undetermined", fromText: true, headers: [] }));
  assert.equal("text_units" in absent, false);
  const none = await fresh({ evidence: null }).read(doc({ digest: d, ct: "text/html", format: "html", fromText: true }));
  assert.equal("text_units" in none, false);
});

test("R32 R2: a PDF and an office capture, and delimited text, answer their units through their format entry byte for byte as before: no doc-para unit is drawn for them from decoded text", async () => {
  const w = fresh();
  const pdf = await withEntry({ format: "pdf", structure: async () => ({ ok: true, pages: 2, notes: [],
      text: i2([{ page: 0, text: "alpha words" }, { page: 1, text: "beta words" }]) }) },
    async () => { const d = await hold(w.evidence, "%PDF-1.7 r32"); return w.read(doc({ digest: d, ct: "application/pdf", format: "pdf" })); });
  assert.deepEqual(pdf.text_units.map((u) => [u.extent.kind, u.extent.page, u.seq, u.text]), [["pdf-page", 0, 0, "alpha words"], ["pdf-page", 1, 1, "beta words"]]);
  const docx = await withEntry({ format: "r32docx", text: async () => ({ ok: true, container: "docx", document: "p1\np2",
      paragraphs: [{ para: 0, text: "p1" }, { para: 1, text: "p2" }], counts: { chars: 4, undetermined: 0 }, undetermined: [] }) },
    async () => { const d = await hold(w.evidence, "r32 office bytes"); return w.read(doc({ digest: d, ct: "application/x", format: "r32docx", fromText: true })); });
  assert.deepEqual(docx.text_units, [{ extent: { kind: "doc-para", para: 0, run: null }, seq: 0, text: "p1" },
                                     { extent: { kind: "doc-para", para: 1, run: null }, seq: 1, text: "p2" }]);
  const csv = "name,place\nAna,Hall\n";
  const c = await readAs(w, csv, { ct: "text/csv", format: "csv" });
  assert.deepEqual(c.text_units.map((u) => u.extent.kind), ["sheet-range"]);
  /* a PDF read at tier 1 with no text answers none, as before */
  const blank = await withEntry({ format: "pdf", structure: async () => ({ ok: true, pages: 1, notes: [], text: i2([{ page: 0, text: " " }]) }) },
    async () => { const d = await hold(w.evidence, "%PDF-1.7 r32 blank"); return w.read(doc({ digest: d, ct: "application/pdf", format: "pdf" })); });
  assert.equal("text_units" in blank, false);
});

test("R32 R1: the units never change what R1 reads: the content type's reader still gets the whole decoded text, a throwing reader or a type with no reader still gives its R1 reading, and the units are drawn all the same", async () => {
  const w = fresh();
  const ROW = `<tr><td><a href="MeetingDetail.aspx?ID=2101&GUID=X">City Council</a></td><td>7/15/2026</td><td><a href="View.ashx?M=A&ID=52101">Agenda</a></td></tr>`;
  const calendar = ['<!DOCTYPE html><html><head><title>Council Calendar</title></head><body><form id="aspnetForm" method="post">',
    '<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="STATE" />', '<main id="mainContent" role="main">',
    '<select id="lstYears_Input" name="lstYears" value="This Month"><option>This Month</option></select>',
    '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>', ROW, '</table></main></form></body></html>'].join("");
  const hdr = [["content-type", "text/html; charset=utf-8"], ["x-powered-by", "ASP.NET"], ["server", "Microsoft-IIS/10.0"]];
  const r = await readAs(w, calendar, { ct: "text/html", format: "html", headers: hdr });
  assert.equal(r.reading.content_type, "meeting_calendar");
  assert.deepEqual(r.reading.entities.map((e) => e.ref), ["meeting:2101"], "the reader saw the markup, not the visible text");
  assert.ok(r.text_units.some((u) => /City Council/.test(u.text)));
  assert.equal(r.reading.text_chars, calendar.length);
});

/* ---------------------------------------------------------------- R22 (N1065) */

/* The words this module says outward, from every branch it has: its readings (the failures, the tiers' notes, the
   reader's), its exported notes, its provenance sentences and its hook refusals. */
async function outwardText() {
  const said = [];
  const say = (x) => said.push(typeof x === "string" ? x : JSON.stringify(x));
  const w = fresh();
  const pdf = (text, env, { tr } = {}) => withEntry({ format: "pdf", structure: async () => ({ ok: true, pages: text.pages.length, notes: [], text }) },
    async () => { const d = await hold(w.evidence, "%PDF-1.7 r22 " + Math.random());
      return w.read(doc({ digest: d, ct: "application/pdf", format: "pdf" }), { env }); });
  const scan = () => i2([{ page: 0, text: "", undetermined: [noText(0)] }, { page: 1, text: "Some page", undetermined: [] }, { page: 2, text: "1", undetermined: [folio(2)] }]);
  /* captures read as text, and the ways a read fails */
  say(await html(PAGE)); say(await plain("Plain words\n\nmore")); say(await plain(" "));
  say(await readAs(w, "{\"a\":1}", { ct: "application/json", format: "undetermined" }));
  say(await w.read(doc({ digest: "f".repeat(64), fromText: true }))); say(await w.read({ capture: {} }));
  say(await fresh({ evidence: null }).read(doc({ digest: "f".repeat(64) })));
  say(await w.read(null));
  const dd = await hold(w.evidence, "multipart");
  say(await w.read(doc({ digest: dd, ct: "text/plain", fromText: true, parts: [{ sha256: dd, bytes: 9 }] })));
  say(await w.read(doc({ digest: dd, ct: "application/octet-stream", format: "undetermined" })));
  say(await withEntry({ format: "r22boom", text: async () => { throw new Error("entry boom"); } },
    async () => w.read(doc({ digest: await hold(w.evidence, "boom1"), format: "r22boom", ct: "application/x" }))));
  say(await withEntry({ format: "r22none", text: async () => null },
    async () => w.read(doc({ digest: await hold(w.evidence, "none1"), format: "r22none", ct: "application/x" }))));
  say(await w.read(doc({ digest: await hold(w.evidence, "drive1"), ct: "text/plain", fromText: true, format: "undetermined",
    chain: [{ who: "g", asserts: "exported", via: "drive", bound: false, drive_file_id: "f1", export_format: "pdf", document_address: "https://d/x" }] })));
  /* tier 2 */
  const t1 = (n) => i2([{ page: 0, text: "x", undetermined: Array.from({ length: n }, () => ({ page: 0, reason: "no_tounicode", count: 1 })) }]);
  const t2ok = member(() => ({ ok: true, text: i2([{ page: 0, text: "recovered words here" }]) }));
  for (const env of [{}, { PDF_WORKER: member(() => ({ ok: false })) }, { PDF_WORKER: member(() => new Error("down")) }, { PDF_WORKER: t2ok }])
    say(await pdf(t1(20), env));
  say(await pdf(t1(20), { PDF_WORKER: member(() => ({ ok: true, text: { document: "", pages: [], undetermined: [], counts: { chars: 0, undetermined: 0 } } })) }));
  for (const o of ["unbound", "no_improvement", "unavailable", "merged"]) say(rp.tier2FailureNote(o) || "");
  /* tier 3 */
  const ocrEnvs = [{}, { OCR_WORKER: member(() => ({ status: 500, body: {} })) }, { OCR_WORKER: member(() => new Error("down")) },
    { OCR_WORKER: member(() => ({ ok: false, reason: "busy" })) }, { OCR_WORKER: member(() => ({ ok: true })) },
    { OCR_WORKER: member(() => ocrAnswer([0, 2])) }, { OCR_WORKER: member(() => ocrAnswer([0, 1, 7])) },
    { OCR_WORKER: member((b) => ({ ...ocrAnswer(b.pages.slice(0, 1)), deferred: b.pages.slice(1) })) },
    { OCR_WORKER: member((b, n) => (n > 1 ? new Error("down") : { ...ocrAnswer([0]), deferred: [2] })) },
    { OCR_WORKER: member((b, n) => (n > 1 ? { ok: false, reason: "no" } : { ...ocrAnswer([0]), deferred: [2] })) },
    { OCR_WORKER: member((b, n) => (n > 1 ? ocrAnswer(b.pages, { version: "9" }) : { ...ocrAnswer([0]), deferred: [2] })) }];
  for (const env of ocrEnvs) say(await pdf(scan(), env));
  say(rp.tier3Note({ filled: [0], appended: [2], unanswered: [4], wholesale: false,
    refusedWhy: [{ page: 1, reason: "carries_glyphs" }, { page: 8, reason: "no_such_page" }, { page: 9, reason: "not_asked" }] }, "member note", [1, 3]));
  say(rp.tier3LoopNote({ notAsked: [3, 4], threw: { at: 2, rest: [2, 3] }, refused: [5], mismatched: [6], strays: [1] }) || "");
  say(rp.ocrTextFromMember({ ok: false, reason: "r" }));
  for (const bad of [{ ok: true }, { ok: true, engine: "e", version: "1" }, { ok: true, engine: "e", version: "1", cap: "C", measured_by: "M", pages: [] },
                     { ok: true, engine: "e", version: "1", cap: "C", measured_by: "M", pages: [{ page: 0, regions: [{ text: "t", source: null }] }] }])
    say(rp.ocrTextFromMember(bad));
  say(rp.ocrTextFromMember(ocrAnswer([0], { floor: 0.9 })));
  /* tier 4: every stop and a success */
  const base = { sha: "d", storeName: "bio", i2text: scan(), wiredTier: 1, chain: rp.layerChainFor(scan(), { tier: 1, container: "pdf" }) };
  const acct = { ok: true, level: "member", key: "k" };
  const good = { member: "ann", accounts: { accountFor: () => acct }, useCheck: () => null,
                 transcribe: (q) => ({ ok: true, engine: "model", version: "1", pages: q.pages.map((p) => ({ page: p, text: `ai ${p}` })) }) };
  const variants = [undefined, {}, { ...good, member: "" }, { ...good, accounts: {} }, { ...good, accounts: { accountFor: () => { throw new Error("x"); } } },
    { ...good, accounts: { accountFor: () => ({ ok: false, code: "NO_ACCOUNT", detail: "none" }) } }, { ...good, useCheck: undefined },
    { ...good, useCheck: () => ({ code: "AI_LIMIT_REACHED", detail: "limit" }) }, { ...good, useCheck: () => { throw new Error("x"); } },
    { ...good, transcribe: undefined }, { ...good, transcribe: () => { throw new Error("x"); } }, { ...good, transcribe: () => ({ ok: false, reason: "no" }) },
    { ...good, transcribe: () => ({ ok: true, pages: [] }) }, { ...good, transcribe: () => ({ ok: true, engine: "m", pages: [] }) },
    { ...good, transcribe: (q) => ({ ok: true, engine: "m", pages: [{ page: 1, text: "stray" }, ...q.pages.slice(0, 1).map((p) => ({ page: p, text: "t" }))] }) },
    good, { ...good, member: "member:ann" }];
  for (const tr of variants) say(await tier4Extend(tr, base));
  say(await tier4Extend(good, { ...base, i2text: i2([{ page: 0, text: "all read" }]) }));
  say(await pdf(scan(), { OCR_WORKER: member(() => ocrAnswer([0])) }));
  /* provenance, hooks, constants */
  const pa = await rp.readingProvenance({ text: i2([{ page: 0, text: "a b" }, { page: 1, text: "" }]), chain: null, tier: 1, container: "pdf", planeVersion: "v" });
  const pb = await rp.readingProvenance({ text: i2([{ page: 0, text: "a c" }, { page: 1, text: "" }]), chain: null, tier: 2, container: "pdf", planeVersion: "v" });
  say(pa); say(pb); say(rp.compareProvenance(pa, pb)); say(rp.compareProvenance(pa, pa)); say(rp.compareProvenance(null, pa));
  say(rp.compareProvenance(await rp.readingProvenance({ text: null }), await rp.readingProvenance({ text: null })));
  say(rp.describePages([0, 1, 2, 5]));
  const h = new ReadHooks();
  say(h.onRead("", () => {}, {})); say(h.onRead("events", () => {}, { captureClasses: ["a"] })); say(h.onRead("events", () => {}, { captureClasses: ["a"] }));
  say(await h.afterRead({ captureSha: "a".repeat(64), captureClass: "a", reading: {}, committed: true }));
  say([rp.LAYER_FIDELITY_SOURCE, rp.NAMED_ENGINE_SOURCE, rp.AI_TRANSCRIPTION_SOURCE, rp.AI_READING_LABEL, rp.TRANSCRIBE_USE, rp.PROVENANCE_SCHEME]);
  return said.join("\n");
}

test("R22 (N1065): no place is named in this module's behaviour or outward text: its readings, notes, refusals and provenance sentences, over every branch the module has, name no place a jurisdiction profile covers (jurisdictions' full place list, read through its own `list`, never a two-name sample)", async () => {
  const places = new Set();
  for (const p of listProfiles()) {
    for (const c of p.covers) {
      places.add(c);
      places.add(c.replace(/^(City|Town|County) of /, "").replace(/ (County|City)$/, ""));
    }
  }
  assert.ok(places.size >= 4, "the profiles name places");
  const all = await outwardText();
  assert.ok(all.length > 20000, `the module said a good deal: ${all.length} characters`);
  for (const must of ["tier 1 read essentially nothing", "OCR member", "the AI was not asked", "was not read as text"])
    assert.ok(all.includes(must), `the scenarios reached "${must}"`);
  const lower = all.toLowerCase();
  for (const p of places) assert.equal(lower.includes(p.toLowerCase()), false, `names ${p}`);
});
