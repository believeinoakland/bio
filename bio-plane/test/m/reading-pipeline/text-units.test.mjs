/* reading-pipeline R32 (T49; D6 B; K3324 (1)), R33 (T50, lines), R34 (T50, the title) and R22 (N1065): the text units of a capture read as text through no format
   entry, at `read`'s interface, over stored captures; and the module's whole outward text against `jurisdictions`' full
   place list. Each test names the requirement ids it checks in its title. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, hold, doc, member, withEntry, i2, noText, folio, ocrAnswer, sha } from "./fixture.mjs";
import { checkChain } from "../../../src/textchain.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import * as rp from "../../../src/reading-pipeline/index.mjs";
import { ACQUIRE_TEXT_UNITS_BUDGET, CAPTURE_TEXT_UNIT_CAP, ACQUIRE_TEXT_UNIT_ENVELOPE, ReadHooks, tier4Extend } from "../../../src/reading-pipeline/index.mjs";
import { list as listProfiles } from "../../../../jurisdictions/index.mjs";
import { registerDoctype } from "../../../../docprofile/registry.mjs";
import { registerDoctypes } from "../../../../doctypes/index.mjs";
import { accountsServing } from "../ai-accounts/fixtures.mjs";
import { world as accountsWorld } from "../ai-accounts/fixture.mjs";

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
  assert.deepEqual(Object.keys(out.text_units[0]), ["extent", "seq", "text", "kind"]);   /* R47: a unit names its kind */
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
  /* R33 amends R10: the units' chain is stored with the reading (the test of it follows) */
  assert.equal(reading.text_source.length, 1);
});

test("R32 R1: a plain-text capture answers one doc-para unit per run of text between blank lines, in the text's order; a blank-looking line separates, a wrapped line does not; the units' text is the paragraph", async () => {
  const out = await plain("\n\nFirst line\nstill the first\n\n   \t\nSecond\r\n\r\nThird  \n");
  assert.deepEqual(shape(out), [
    ["doc-para", 0, null, 0, "First line\nstill the first"],
    ["doc-para", 1, null, 1, "Second"],
    ["doc-para", 2, null, 2, "Third"]]);
  /* fix round 9 (R49; G131g): a capture whose bytes are not UTF-8 is decoded by ooxml's one rule (here detected windows-1252), never
     read as replacement characters */
  const bytes = Uint8Array.from([...Buffer.from("caf"), 0xe9, ...Buffer.from(" au lait\n\nsecond")]);
  const w = fresh();
  const d = await hold(w.evidence, bytes);
  const lat = await w.read(doc({ digest: d, bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true, headers: [] }));
  assert.deepEqual(lat.text_units.map((u) => u.text), ["café au lait", "second"]);
  assert.equal(lat.reading.encoding, "windows-1252");
});

test("R32 R15 R47: the wire's rules apply to these units: a paragraph over the per-unit cap is carried as its chunks, never cut, units past the byte budget are left out and named", async () => {
  const big = "x".repeat(CAPTURE_TEXT_UNIT_CAP + 10);
  const out = await plain([big, big, big, big, big].join("\n\n"));
  /* fix round 9 (R15 amended, R47; G128d): a unit over the cap is carried as its chunks, never cut; a chunk past the budget is
     left out and named */
  assert.ok(out.text_units.every((u) => !u.truncated && u.text.length <= CAPTURE_TEXT_UNIT_CAP && Number.isInteger(u.extent.run)));
  assert.equal(out.text_units.length + out.text_units_over_bound, 10, "five paragraphs, two chunks each");
  assert.ok(out.text_units_over_bound > 0);
  assert.equal(out.text_units_skipped.reduce((n, r) => n + r.units, 0), out.text_units_over_bound);
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
  assert.deepEqual(docx.text_units, [{ extent: { kind: "doc-para", para: 0, run: null }, seq: 0, text: "p1", kind: "body" },
                                     { extent: { kind: "doc-para", para: 1, run: null }, seq: 1, text: "p2", kind: "body" }]);   /* R47: kind */
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

/* ---------------------------------------------------------------- R33 (T49-34; K3392) */

test("R33 R32 R10 R14: a capture read as text that has text units carries the chain they were formed by: the plane's layer at tier null with its text_container, a chain the record's extent gate accepts; R14's provenance stays at tier null on the plane", async () => {
  for (const [name, out, container] of [["html", await html(PAGE), "html"], ["plain", await plain("one\n\ntwo"), "text"]]) {
    const r = out.reading;
    assert.equal(Array.isArray(r.text_source) && r.text_source.length, 1, name);
    const [step] = r.text_source;
    assert.deepEqual([step.step, step.tier, step.container, step.cap], ["layer", null, container, null], name);
    assert.equal(r.text_container, container, name);
    assert.equal(checkChain(r.text_source), null, `${name}: a chain text-chain accepts`);
    assert.ok(out.text_units.length > 0, name);
    assert.equal(r.provenance.text_tier, null, `${name}: R14 stays true`);
    assert.equal(r.provenance.container, container, name);
    assert.equal(r.provenance.text_sha256.length, 64, name);
    assert.equal(r.text_chars, name === "html" ? PAGE.length : 8, `${name}: R17 still over the text the reader was handed`);
  }
});

test("R33 (control) R32: a reading with no text units has no chain: a capture whose text holds no glyph, one not read as text, and one whose bytes are not held carry no text_source and no text_container, as before", async () => {
  const w = fresh();
  const blank = (await plain(" \n\n\t\n")).reading;
  assert.equal(blank.text_source, undefined);
  assert.equal(blank.text_container, undefined);
  const words = "words that would be a unit";
  const d = await hold(w.evidence, words);
  const multi = (await w.read(doc({ digest: d, bytes: words.length, ct: "text/plain", format: "undetermined", fromText: true, headers: [],
    parts: [{ index: 0, sha256: d, bytes: words.length }] }))).reading;
  const absent = (await w.read(doc({ digest: "e".repeat(64), ct: "text/plain", format: "undetermined", fromText: true, headers: [] }))).reading;
  for (const r of [multi, absent]) assert.equal(r.text_source, undefined);
});

test("R33 R1 R32: the chain is carried whatever the content type's reader does, and R1's reading is otherwise unchanged: a reader that finds entities keeps them, and text units never change what the reader was handed", async () => {
  const w = fresh();
  const ROW = `<tr><td><a href="MeetingDetail.aspx?ID=2101&GUID=X">City Council</a></td><td>7/15/2026</td><td><a href="View.ashx?M=A&ID=52101">Agenda</a></td></tr>`;
  const calendar = ['<!DOCTYPE html><html><head><title>Council Calendar</title></head><body><form id="aspnetForm" method="post">',
    '<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="STATE" />', '<main id="mainContent" role="main">',
    '<select id="lstYears_Input" name="lstYears" value="This Month"><option>This Month</option></select>',
    '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>', ROW, '</table></main></form></body></html>'].join("");
  const hdr = [["content-type", "text/html; charset=utf-8"], ["x-powered-by", "ASP.NET"], ["server", "Microsoft-IIS/10.0"]];
  const r = (await readAs(w, calendar, { ct: "text/html", format: "html", headers: hdr })).reading;
  assert.deepEqual(r.entities.map((e) => e.ref), ["meeting:2101"]);
  assert.equal(r.text_chars, calendar.length);
  assert.equal(r.text_source.length, 1);
  assert.equal(r.text_container, "html");
});

/* ---------------------------------------------------------------- R33 (T50; N1191 (a)): lines */

const ORDER = ["Bus shelter repair log, fiscal year 2025",
  "Public Works received 85 shelter repair requests in 2025.",
  "Director Maria Alvarez signed the repair standard on 3 March 2025.",
  "The shelter repair contract was valued at $240,000 and paid on 12 June 2025.",
  "Standard: every reported shelter defect shall be repaired within 30 days of the report."];

test("R33 R32 (T50; N1191 (a)): a plain-text capture of a title line and four sentence lines with single breaks and no blank line answers five doc-para units, one per line, the line trimmed, para counting the non-empty lines from 0 and seq the position; \\n and \\r\\n breaks alike", async () => {
  const want = ORDER.map((t, i) => ["doc-para", i, null, i, t]);
  assert.deepEqual(shape(await plain(ORDER.join("\n") + "\n")), want);
  assert.deepEqual(shape(await plain(ORDER.join("\r\n"))), want);
  const padded = await plain(`  ${ORDER[0]}  \n\t${ORDER[1]}\t\n${ORDER[2]}`);
  assert.deepEqual(shape(padded), ORDER.slice(0, 3).map((t, i) => ["doc-para", i, null, i, t]));
  assert.deepEqual(Object.keys(padded.text_units[0]), ["extent", "seq", "text", "kind"]);
  assert.deepEqual(Object.keys(padded.text_units[0].extent), ["kind", "para", "run"]);
  /* R33's chain, R14's provenance and R17's counts stay as for any text read as text */
  const body = ORDER.join("\n");
  const r = (await plain(body)).reading;
  assert.deepEqual([r.text_container, r.text_source.length, r.provenance.text_tier, r.text_chars], ["text", 1, null, body.length]);
  assert.equal(checkChain(r.text_source), null);
});

test("R33 (control) R32: the same text with a blank line after the title answers two units as before, a wrapped paragraph is never split, a blank line anywhere (an edge included) keeps R32's paragraphs, a one-line text is one unit, an HTML capture is read by R32's rule, and a text with no glyph answers none", async () => {
  assert.deepEqual(shape(await plain(ORDER[0] + "\n\n" + ORDER.slice(1).join("\n"))),
    [["doc-para", 0, null, 0, ORDER[0]], ["doc-para", 1, null, 1, ORDER.slice(1).join("\n")]]);
  assert.deepEqual(shape(await plain("First line\nstill the first\n\nSecond")),
    [["doc-para", 0, null, 0, "First line\nstill the first"], ["doc-para", 1, null, 1, "Second"]]);
  assert.deepEqual(shape(await plain("\n\nline one\nline two")), [["doc-para", 0, null, 0, "line one\nline two"]], "a leading blank line is a blank line");
  assert.deepEqual(shape(await plain("\nline one\nline two")).map((u) => u[4]), ["line one", "line two"], "a single leading break is no blank line");
  assert.deepEqual(shape(await plain("line one\nline two\n \n")), [["doc-para", 0, null, 0, "line one\nline two"]], "a trailing blank line is a blank line");
  assert.deepEqual(shape(await plain("just one line")), [["doc-para", 0, null, 0, "just one line"]]);
  assert.deepEqual(shape(await plain("just one line\n")), [["doc-para", 0, null, 0, "just one line"]]);
  assert.deepEqual(shape(await html("<p>one</p>\n<p>two</p>\nthree\nfour")),
    [["doc-para", 0, null, 0, "one"], ["doc-para", 1, null, 1, "two"], ["doc-para", 2, null, 2, "three four"]], "an HTML page's source line breaks are no line unit");
  for (const none of [await plain(" \n \t"), await plain("\n"), await html("<div>\n</div>\n<div> </div>")]) assert.equal("text_units" in none, false);
});

test("R33 R15 R47: the wire's bound, chunks and named gaps apply to line units", async () => {
  const big = "x".repeat(CAPTURE_TEXT_UNIT_CAP + 10);
  const out = await plain([big, big, big, big, big].join("\n"));
  /* fix round 9 (R15 amended, R47; G128d): a unit over the cap is carried as its chunks, never cut; a chunk past the budget is
     left out and named */
  assert.ok(out.text_units.every((u) => !u.truncated && u.text.length <= CAPTURE_TEXT_UNIT_CAP && Number.isInteger(u.extent.run)));
  assert.equal(out.text_units.length + out.text_units_over_bound, 10, "five paragraphs, two chunks each");
  assert.ok(out.text_units_over_bound > 0);
  assert.equal(out.text_units_skipped.reduce((n, r) => n + r.units, 0), out.text_units_over_bound);
});

test("R33 R32 (the measure, M-T50-4): textUnitsOfText gives V4's order shape one unit before this rule and one unit per non-empty line after", () => {
  const r = rp.textUnitsOfText(ORDER.join("\n"));
  assert.deepEqual(r.textUnits.map((u) => u.text), ORDER);
  assert.deepEqual(rp.textUnitsOfText(ORDER.join(" ")).textUnits.length, 1);
  assert.deepEqual(rp.textUnitsOfText("").textUnits, null);
});

/* ---------------------------------------------------------------- R34 (T50; N1139, B-12): the title */

const titled = async (markup) => (await html(markup)).reading;

test("R34 R32 R1: a captured notice reads the text of its first <title>, else of its first heading in document order, else null; markup is removed, references decoded, whitespace collapsed, at most 200 characters", async () => {
  assert.equal((await titled("<html><head><title>Housing notice 2026-118</title></head><body><h1>Other</h1><p>Words</p></body></html>")).title, "Housing notice 2026-118");
  assert.equal((await titled("<html><body><p>Words</p><h1>Notice 2026-118</h1><h2>Sub</h2></body></html>")).title, "Notice 2026-118");
  assert.equal((await titled("<html><body><h3>Third</h3><p>x</p><h1>First level</h1></body></html>")).title, "Third", "document order, not level");
  assert.equal((await titled("<html><body><p>Words only</p></body></html>")).title, null);
  assert.equal((await titled("<TITLE lang=en>\n  Budget &amp;   <b>Rules</b>\n &lt;2026&gt; &#169;&nbsp;done </TITLE>")).title, "Budget & Rules <2026> © done");
  assert.equal((await titled(`<title>${"ab ".repeat(100)}</title>`)).title, "ab ".repeat(100).slice(0, 200).trim());
  assert.equal([...(await titled(`<title>${"é".repeat(300)}</title>`)).title].length, 200);
  assert.equal((await titled("<title> \n </title><h1>Heading</h1>")).title, "Heading", "a title with no glyph is none; the heading is read in its place");
  assert.equal((await titled("<title>&nbsp;</title><p>no heading</p>")).title, null);
  assert.equal((await titled("<head><title/><title>Second</title></head>")).title, "Second", "a self-closing tag is no element");
  assert.equal((await titled("<title>never closed <p>words")).title, null, "a start tag with no end tag is no element");
  assert.equal((await titled("<h1>One</h1><h1>Two</h1>")).title, "One");
});

test("R34: nothing inside a script, style, comment or template is a title: a <title> in a script string, a comment, a style or a template is none, and the real one after it is read", async () => {
  for (const hidden of ['<script>var s = "<title>Fake</title><h1>Fake</h1>";</script>', "<!-- <title>Fake</title> -->",
                        "<style>/* <title>Fake</title> */</style>", "<template><h1>Fake</h1><title>Fake</title></template>"]) {
    assert.equal((await titled(`<html><body>${hidden}<p>Words</p></body></html>`)).title, null, hidden);
    assert.equal((await titled(`<html><body>${hidden}<h2>Real</h2><p>Words</p></body></html>`)).title, "Real", hidden);
  }
  assert.equal((await titled("<p>Words</p><script>var a = '<title>Fake</title>'")).title, null, "an unclosed script drops to the end");
});

test("R34 (control) R32 R17 R14: the units, counts and provenance of each captured page are as before the title: the title is read from markup the units drop and is no text of the body", async () => {
  const withTitle = "<html><head><title>Housing notice 2026-118</title></head><body><p>Words in the body.</p></body></html>";
  const out = await html(withTitle);
  assert.deepEqual(shape(out), [["doc-para", 0, null, 0, "Words in the body."]]);
  assert.equal(out.reading.text_chars, withTitle.length);
  assert.equal(out.reading.provenance.text_chars, withTitle.length);
  assert.equal(out.reading.provenance.text_sha256, sha(withTitle));
  const heading = await html("<html><body><h1>Notice 2026-118</h1></body></html>");
  assert.deepEqual(shape(heading), [["doc-para", 0, null, 0, "Notice 2026-118"]], "a heading is also a unit");
  /* a page whose only words are in the title has a title and no unit */
  const only = await html("<html><head><title>Only a title</title></head><body></body></html>");
  assert.equal(only.reading.title, "Only a title");
  assert.equal("text_units" in only, false);
});

test("R34 R1: a plain-text capture, delimited text and any text not HTML read null; the key is present on every reading R1 composes whether or not its reader found entities", async () => {
  for (const out of [await plain("Notice 2026-118\n<title>Not markup here</title>"), await plain("one\n\ntwo"), await plain(" ")]) {
    assert.equal(Object.hasOwn(out.reading, "title"), true);
    assert.equal(out.reading.title, null);
  }
  const json = await readAs(fresh(), "{\"a\":1}", { ct: "application/json", format: "undetermined" });
  assert.equal(json.reading.title, null);
  const ROW = `<tr><td><a href="MeetingDetail.aspx?ID=2101&GUID=X">City Council</a></td><td>7/15/2026</td><td><a href="View.ashx?M=A&ID=52101">Agenda</a></td></tr>`;
  const calendar = ['<!DOCTYPE html><html><head><title>Council Calendar</title></head><body><form id="aspnetForm" method="post">',
    '<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="STATE" />', '<main id="mainContent" role="main">',
    '<select id="lstYears_Input" name="lstYears" value="This Month"><option>This Month</option></select>',
    '<table><tr><th>Name</th><th>Date</th><th>Agenda</th></tr>', ROW, '</table></main></form></body></html>'].join("");
  const r = (await readAs(fresh(), calendar, { ct: "text/html", format: "html", headers: [["content-type", "text/html; charset=utf-8"], ["x-powered-by", "ASP.NET"], ["server", "Microsoft-IIS/10.0"]] })).reading;
  assert.deepEqual([r.entities.length > 0, r.title], [true, "Council Calendar"]);
});

test("R34 R2 R28: a capture read through a format entry carries the title its metadata states when that is a non-blank string, else null; a PDF and an office capture read as before with title null", async () => {
  const w = fresh();
  const entryOf = (format, metadata) => ({ format, text: async () => ({ ok: true, container: "docx", document: "p1", paragraphs: [{ para: 0, text: "p1" }],
    counts: { chars: 2, undetermined: 0 }, undetermined: [], ...(metadata === undefined ? {} : { metadata }) }) });
  const run = (format, metadata) => withEntry(entryOf(format, metadata), async () => {
    const d = await hold(w.evidence, `r34 ${format} ${Math.random()}`);
    return (await w.read(doc({ digest: d, ct: "application/x", format, fromText: true }))).reading;
  });
  assert.equal((await run("r34a", { title: "  Quarterly\n  Report  " })).title, "Quarterly Report");
  assert.equal((await run("r34b", { title: "   " })).title, null);
  assert.equal((await run("r34c", { title: 7 })).title, null);
  assert.equal((await run("r34d", { author: "x" })).title, null);
  assert.equal((await run("r34e", undefined)).title, null);
  assert.equal((await run("r34f", null)).title, null);
  assert.equal((await run("r34g", { title: "t".repeat(300) })).title.length, 200);
  const pdf = await withEntry({ format: "pdf", structure: async () => ({ ok: true, pages: 1, notes: [], text: i2([{ page: 0, text: "alpha words" }]) }) },
    async () => { const d = await hold(w.evidence, "%PDF-1.7 r34"); return (await w.read(doc({ digest: d, ct: "application/pdf", format: "pdf" }))).reading; });
  assert.equal(Object.hasOwn(pdf, "title"), true);
  assert.equal(pdf.title, null);
  const csv = (await readAs(w, "name,place\nAna,Hall\n", { ct: "text/csv", format: "csv" })).reading;
  assert.equal(csv.title, null);
});

test("R34 R21 (control): a failed reading carries no title, absent and never null: no store, no digest, bytes not held, an entry that produces no text or throws, a capture not read as text", async () => {
  const w = fresh();
  const d = await hold(w.evidence, "<title>Held</title><p>words</p>");
  const failedOnes = [
    (await fresh({ evidence: null }).read(doc({ digest: d, ct: "text/html", format: "html", fromText: true }))).reading,
    (await w.read({ capture: {} })).reading,
    (await w.read(doc({ digest: "e".repeat(64), ct: "text/html", format: "html", fromText: true }))).reading,
    (await w.read(doc({ digest: d, ct: "text/html", format: "html", fromText: false }))).reading,
    (await w.read(doc({ digest: d, ct: "text/html", format: "html", fromText: true, parts: [{ index: 0, sha256: d, bytes: 5 }] }))).reading,
    await withEntry({ format: "r34none", text: async () => null }, async () => (await w.read(doc({ digest: d, format: "r34none", ct: "application/x" }))).reading),
    await withEntry({ format: "r34boom", text: async () => { throw new Error("boom"); } }, async () => (await w.read(doc({ digest: d, format: "r34boom", ct: "application/x" }))).reading),
  ];
  for (const r of failedOnes) { assert.equal(r.found, false); assert.equal("title" in r, false, r.basis); }
});

/* ---------------------------------------------------------------- R32 (T51; K4194; L6): a page's content, not its furniture */

const FURNITURE_PAGE = `<!DOCTYPE html><html><head><title>Site</title></head><body>
<a class="skip" href="#main">Skip to main content</a>
<nav id="top"><ul><li><a href="/signin">Sign In</a></li><li>{1}</li><li><nav><a href="/x">Nested menu</a></nav></li></ul></nav>
<div role="navigation" aria-label="Section"><div class="inner"><a href="/a">Section link</a></div><div>More section links</div></div>
<p>##LOC[OK]##</p><p>{name}</p>
<main id="main"><h1>Notice 2026-118</h1><p>The council adopted the shelter repair standard on 3 March 2025.</p>
<p>Repairs follow within 30 days.</p></main>
<div>Words after the main element.</div></body></html>`;
const ARTICLE = [["doc-para", 0, null, 0, "Notice 2026-118"],
  ["doc-para", 1, null, 1, "The council adopted the shelter repair standard on 3 March 2025."],
  ["doc-para", 2, null, 2, "Repairs follow within 30 days."]];

test("R32 (T51; K4194; L6): a captured page's text units are its content only: an element nav or role=navigation with its contents (nesting-aware), a skip link and unresolved template tokens ({1}, {name}, ##LOC[...]##) are no passage; the reader still gets the whole decoded text, so counts and provenance are as before", async () => {
  const out = await html(FURNITURE_PAGE);
  assert.deepEqual(shape(out), ARTICLE);
  const said = out.text_units.map((u) => u.text).join("\n");
  for (const gone of [/after the main/, /Skip to/, /Sign In/, /Nested menu/, /Section link/, /More section links/, /\{1\}|\{name\}/, /##LOC/])
    assert.doesNotMatch(said, gone, String(gone));
  assert.equal(out.reading.text_chars, FURNITURE_PAGE.length);
  assert.equal(out.reading.provenance.text_sha256, sha(FURNITURE_PAGE));
  /* each landmark alone, so no one rule carries the others */
  assert.deepEqual(shape(await html("<nav><a>Menu</a></nav><p>Body words.</p>")), [["doc-para", 0, null, 0, "Body words."]]);
  assert.deepEqual(shape(await html('<div role="navigation"><p>Menu</p></div><p>Body words.</p>')), [["doc-para", 0, null, 0, "Body words."]]);
  assert.deepEqual(shape(await html('<a href="#main">Skip to content</a><p>Body words.</p>')), [["doc-para", 0, null, 0, "Body words."]]);
  assert.deepEqual(shape(await html("<p>{1}</p><p>##LOC[OK]##</p><p>{name}</p><p>Body words.</p>")), [["doc-para", 0, null, 0, "Body words."]]);
  assert.equal("text_units" in await html("<nav>Only a menu</nav><p>{1}</p>"), false, "a page of furniture alone has no unit");
});

test("R32 (T51; K4194; L6) (control): a nav inside the article body is dropped with all of its contents and the article words around it are kept; nesting is by the element's own name, so a sibling after a nested role=navigation div is kept", async () => {
  assert.deepEqual(shape(await html("<article><p>Before.</p><nav><p>Menu one</p><nav>Inner</nav><p>Menu two</p></nav><p>After.</p></article>")),
    [["doc-para", 0, null, 0, "Before."], ["doc-para", 1, null, 1, "After."]]);
  assert.deepEqual(shape(await html('<div><div role="navigation"><div>A</div><div>B</div></div><div>Sibling words.</div></div>')),
    [["doc-para", 0, null, 0, "Sibling words."]]);
  assert.deepEqual(shape(await html("<NAV class=x>Menu</NAV><P>Body words.</P><DIV ROLE='Navigation'>Menu</DIV>")),
    [["doc-para", 0, null, 0, "Body words."]], "names and role value are case-insensitive");
  assert.deepEqual(shape(await html("<p>Before.</p><nav>Menu never closed<p>After.</p>")).map((u) => u[4]), ["Before.", "Menu never closed", "After."],
    "an element with no end tag is not guessed at: its words are kept");
});

test("R32 (T51; K4194; L6) (control): a page with no landmarks keeps all its text, and what the rule does not name is kept: another role, a # link that does not begin Skip to, a Skip to link that is not a # link, and braces that are not a token", async () => {
  const plainPage = "<html><body><h1>Title words</h1><p>First.</p><div>Second.</div></body></html>";
  assert.deepEqual(shape(await html(plainPage)).map((u) => u[4]), ["Title words", "First.", "Second."]);
  assert.deepEqual(shape(await html('<div role="main">Main words.</div><div role="status">Status words.</div>')).map((u) => u[4]), ["Main words.", "Status words."]);
  assert.deepEqual(shape(await html('<p>Go <a href="#top">Back to top</a> now.</p><p>Go <a href="/page">Skip to content</a> now.</p><p>See #1 and {1, 2} and {two words} and [OK].</p>')).map((u) => u[4]),
    ["Go Back to top now.", "Go Skip to content now.", "See #1 and {1, 2} and {two words} and [OK]."]);
  /* text read as text that is not HTML is never touched */
  assert.deepEqual(shape(await plain("{1}\n\n<nav>Menu</nav>")).map((u) => u[4]), ["{1}", "<nav>Menu</nav>"]);
  assert.deepEqual(shape(await html(PAGE)).length, 5, "R32's first page reads as before");
});

test("R32 (T51; K4194; L6) (control): two readings of the same fixture are identical, units and reading both", async () => {
  const a = await html(FURNITURE_PAGE);
  const b = await html(FURNITURE_PAGE);
  assert.deepEqual(a.text_units, b.text_units);
  assert.deepEqual(a.reading, b.reading);
  assert.deepEqual(rp.textUnitsOfText(FURNITURE_PAGE, { html: true }), rp.textUnitsOfText(FURNITURE_PAGE, { html: true }));
  assert.equal(rp.visibleTextOfHtml(FURNITURE_PAGE), rp.visibleTextOfHtml(FURNITURE_PAGE));
});

/* ---------------------------------------------------------------- R32 (T51 fix round 2, C19; K4303): landmarks of furniture */

const LANDMARK_PAGE = `<!DOCTYPE html><html><head><title>Site</title></head><body>
<header><h1>Oakland Housing Site</h1><p>Quick Links</p></header>
<aside><p>Related pages (opens in new tab)</p></aside>
<main><h1>Notice 2026-118</h1><p>The council adopted the shelter repair standard on 3 March 2025.</p>
<p>Repairs follow within 30 days.</p></main>
<footer><p>Copyright and contact words.</p></footer></body></html>`;
const MAIN_ONLY = `<main><h1>Notice 2026-118</h1><p>The council adopted the shelter repair standard on 3 March 2025.</p>
<p>Repairs follow within 30 days.</p></main>`;
const NOTICE = [["doc-para", 0, null, 0, "Notice 2026-118"],
  ["doc-para", 1, null, 1, "The council adopted the shelter repair standard on 3 March 2025."],
  ["doc-para", 2, null, 2, "Repairs follow within 30 days."]];
const words = async (markup) => (await html(markup)).text_units.map((u) => u.text);

test("R32 (T51 fix round 2, C19; K4303): a captured page with a header, a footer, an aside and a main yields units from the main only; the reader and the counts still see the whole page", async () => {
  const out = await html(LANDMARK_PAGE);
  assert.deepEqual(shape(out), NOTICE);
  const said = out.text_units.map((u) => u.text).join("\n");
  for (const gone of [/Oakland Housing Site/, /Quick Links/, /opens in new tab/, /Related pages/, /Copyright/])
    assert.doesNotMatch(said, gone, String(gone));
  assert.equal(out.reading.text_chars, LANDMARK_PAGE.length);
  assert.equal(out.reading.provenance.text_sha256, sha(LANDMARK_PAGE));
  /* a passage already cited keeps resolving to the same words: the units are those of the article read alone */
  assert.deepEqual(out.text_units, (await html(MAIN_ONLY)).text_units);
});

test("R32 (T51 fix round 2, C19; K4303): without a main or an article, the header, footer and aside elements and the roles banner, contentinfo, complementary and search go with their contents; the rest of the page is kept", async () => {
  assert.deepEqual(await words("<header><p>Head words.</p></header><p>Body words.</p><footer><p>Foot words.</p></footer><aside><p>Side words.</p></aside>"), ["Body words."]);
  for (const role of ["banner", "contentinfo", "complementary", "search"])
    assert.deepEqual(await words(`<div role="${role}"><div>Furniture words.</div></div><p>Body words.</p>`), ["Body words."], role);
  assert.deepEqual(await words(`<DIV ROLE='Banner'>Furniture</DIV><HEADER>Furniture</HEADER><p>Body words.</p>`), ["Body words."], "names and role values are case-insensitive");
  assert.deepEqual(await words("<header><header>Inner</header><p>Outer head</p></header><p>Body words.</p>"), ["Body words."], "nesting is by the element's own name");
  assert.equal("text_units" in await html("<header>Only a header</header><footer>Only a footer</footer>"), false, "a page of furniture alone has no unit");
});

test("R32 (T51 fix round 2, C19; K4303) (control): a header, footer, aside or landmark role inside a main or an article is kept; a nav inside them is still dropped", async () => {
  assert.deepEqual(await words("<article><header><h1>Notice 2026-118</h1></header><p>Body words.</p><aside>Aside in the article.</aside><footer>Signed by the clerk.</footer></article>"),
    ["Notice 2026-118", "Body words.", "Aside in the article.", "Signed by the clerk."]);
  assert.deepEqual(await words('<main><div role="complementary">Complementary kept.</div><div role="search">Search kept.</div><nav>Menu</nav><p>Body.</p></main>'),
    ["Complementary kept.", "Search kept.", "Body."]);
  assert.deepEqual(await words("<p>Outside.</p><div><article><footer>Inside the article.</footer></article></div><footer>Outside footer.</footer>"), ["Inside the article."]);
});

test("R32 (T51 fix round 2, C19; K4303): when the page has a main element only its contents give passages, else when it has an article element only the articles' contents do; main wins, and several of either are read in the page's order", async () => {
  assert.deepEqual(await words("<p>Before.</p><article>An article outside the main.</article><main><p>Main words.</p><article>Article in the main.</article></main><p>After.</p>"),
    ["Main words.", "Article in the main."]);
  assert.deepEqual(await words("<p>Before.</p><article><p>First article.</p></article><div>Between.</div><article><p>Second article.</p></article><p>After.</p>"),
    ["First article.", "Second article."]);
  assert.deepEqual(await words("<main><p>One.</p><main><p>Nested.</p></main></main><main><p>Two.</p></main>"), ["One.", "Nested.", "Two."], "a nested main is not a second region");
  assert.deepEqual(await words("<MAIN class=x><P>Upper.</P></MAIN><p>Outside.</p>"), ["Upper."]);
});

test("R32 (T51 fix round 2, C19; K4303) (control): a page with no landmarks keeps all its visible text, and a main or article that is no element (no end tag, a self-closing tag, a role only) does not narrow the page", async () => {
  assert.deepEqual(await words("<h1>Title words</h1><p>First.</p><div>Second.</div>"), ["Title words", "First.", "Second."]);
  assert.deepEqual(await words("<p>Before.</p><main>Never closed<p>After.</p>"), ["Before.", "Never closed", "After."], "an element with no end tag is not guessed at");
  assert.deepEqual(await words("<p>Before.</p><main/><p>After.</p>"), ["Before.", "After."]);
  assert.deepEqual(await words('<p>Before.</p><div role="main">Role words.</div><p>After.</p>'), ["Before.", "Role words.", "After."]);
  assert.deepEqual(await words("<p>Before.</p><article>Never closed<p>After.</p>"), ["Before.", "Never closed", "After."]);
});

test("R32 (T51 fix round 2, C19; K4303) (control): two readings of a landmark page are identical, and text that is not HTML is never narrowed", async () => {
  const a = await html(LANDMARK_PAGE), b = await html(LANDMARK_PAGE);
  assert.deepEqual(a.text_units, b.text_units);
  assert.deepEqual(a.reading, b.reading);
  assert.deepEqual(shape(await plain("<main>Kept</main>\n\n<footer>Also kept</footer>")).map((u) => u[4]), ["<main>Kept</main>", "<footer>Also kept</footer>"]);
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
  // fixtures-generic: busy
  // fixtures-generic: no
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
  /* the paying account is ai-accounts' real one (its published `accountsServing`: a member's own key referenced), and a real group with no account for the refusal */
  const serving = (await accountsServing()).accounts;
  const refusing = (await accountsWorld().group("ann")).a;
  // fixtures-contract: content transcribe-answer
  const good = { member: "ann", accounts: serving, useCheck: () => null,
                 transcribe: (q) => ({ ok: true, engine: "model", version: "1", pages: q.pages.map((p) => ({ page: p, text: `ai ${p}` })) }) };
  const variants = [undefined, {}, { ...good, member: "" }, { ...good, accounts: {} }, { ...good, accounts: { accountFor: () => { throw new Error("x"); } } },
    { ...good, accounts: refusing }, { ...good, useCheck: undefined },
    { ...good, useCheck: () => ({ code: "AI_LIMIT_REACHED", detail: "limit" }) }, { ...good, useCheck: () => { throw new Error("x"); } },
    // fixtures-contract: content transcribe-answer
    // fixtures-generic: no
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
  for (const must of [word("reading-pipeline.tier_read_essentially_nothing"), "OCR member", "the AI was not asked", "was not read as text"])
    assert.ok(all.includes(must), `the scenarios reached "${must}"`);
  const lower = all.toLowerCase();
  for (const p of places) assert.equal(lower.includes(p.toLowerCase()), false, `names ${p}`);
});
