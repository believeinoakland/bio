/* FW-15: the L2→L3 wire — a PDF's text becomes a reading.
 *
 * Before this wire, op=acquire ran the content/intent layers inline for HTML
 * only: a PDF profiled honestly as `profiled_from_text: false` and stopped, so
 * it had structure (op=pdfstructure) and could never have a READING. The wire
 * feeds the FORMAT axis's own text surface (a PDF's Tier-1 extraction; an
 * office container's paragraph walk) into docprofile's ONE text entry point
 * (readText — identify()/doctypeFor()/parse() over text FROM ANYWHERE), so
 * acquiring a PDF produces a reading exactly as acquiring an HTML page does.
 *
 * THE REAL DOCUMENT. test/fixtures/legistar-agenda-1425405.pdf is a REAL
 * Oakland agenda packet — oakland.legistar.com/View.ashx?M=A&ID=1425405
 * &GUID=86B6D25C-4D38-4101-BD37-13DF930A7950, the *Rules & Legislation
 * Committee supplemental agenda for 2026-07-16, fetched 2026-08-03 (sha256
 * 16cb1adf6d35116dbc475ae39ac1757f28cd549e7ff5b7f6d5bb7c660503570c, 276,421
 * bytes, 33 pages; the same document MEASUREMENTS.md's CPDF-5 corpus measured
 * at 99.9% Tier-1 decode). Its text names 41 items of legislation by Legistar
 * file number, which is what the meeting_agenda doctype (written FROM this
 * measurement) reads.
 *
 * The honesty rules, each asserted below:
 *   - a tier that could not decode SAYS SO (the encrypted case names its
 *     marker and yields a FAILED reading, found:false, NO invented refs);
 *   - a PARTIAL decode does not silently produce a partial reading (the real
 *     packet's 45-code-point residue is STATED on the reading's basis);
 *   - a reading that finds nothing stays a failed reader, never an emptied
 *     document (unchanged from FW-5).
 *
 * NEGATIVE CONTROL: bypass the wire — in index.mjs's acquire reading assembly,
 * change the wire branch's `if (!multipart && fmt && fmt !== "undetermined")`
 * to `if (false)` -> the mini agenda PDF known to name THREE entities acquires
 * with found:false and after promote its reading_refs count is ZERO. RUN
 * 2026-08-03: wire branch forced `if (false)` -> 33 of 55 failed — every wired
 * reading/ref assertion (meeting_agenda expected / generic got; found
 * true->false; 41->0 and 3->0 entities; the three op=readingref lookups each
 * want 1 / got 0 for a document known to name three entities; the docx arm
 * and the tier-2 arm with them) while the encrypted-PDF honesty assertions and
 * the readText unit assertions still passed (they do not depend on the wire);
 * restored -> 55 pass 0 fail. A suite that still passed without the persist
 * would test nothing; this one fails 33 ways.
 */
/* NEGATIVE CONTROL: in index.mjs's acquire reading assembly change the wire branch's `if (!multipart && fmt && fmt !== "undetermined")` to `if (false)` -> the PDF known to name three entities reads found:false and its three op=readingref counts drop 1->0. RUN 2026-08-03: 33 of 55 failed (meeting_agenda->generic, 41->0 and 3->0 entities, every ref lookup 0, the docx and tier-2 arms with them); the encrypted-honesty and readText unit assertions still passed; restored -> 55 pass 0 fail. */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { readText, flattenText } from "../../docprofile/registry.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const REAL = new Uint8Array(readFileSync(fileURLToPath(new URL("./fixtures/legistar-agenda-1425405.pdf", import.meta.url))));

/* ---- a tiny PDF assembler (the pdfstructure.test.mjs pattern) ---- */
function pdf(objs, trailer = "") {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n`, "latin1"));
    if (o.stream) {
      chunks.push(Buffer.from(o.head + "\nstream\n", "latin1"));
      chunks.push(o.stream);
      chunks.push(Buffer.from("\nendstream\n", "latin1"));
    } else {
      chunks.push(Buffer.from(o.body + "\n", "latin1"));
    }
    chunks.push(Buffer.from("endobj\n", "latin1"));
  }
  chunks.push(Buffer.from(trailer + "%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}

/* A one-page PDF whose Tier-1 text decodes to `lines` (ASCII identity CMap, so
   the fixture's decoded text is known byte-for-byte). */
function textPdf(lines) {
  const content = "BT /F1 10 Tf " + lines.map((l, i) =>
    (i ? "0 -12 Td " : "") + `(${l}) Tj `).join("") + "ET";
  const cbuf = Buffer.from(content, "latin1");
  const cmap = `/CIDInit /ProcSet findresource begin 12 dict begin begincmap
/CMapName /Adobe-Identity-UCS def
1 begincodespacerange
<20> <7e>
endcodespacerange
1 beginbfrange
<20> <7e> <0020>
endbfrange
endcmap CMapName currentdict /CMap defineresource pop end end`;
  const mbuf = Buffer.from(cmap, "latin1");
  return pdf([
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>" },
    { num: 4, head: `<< /Length ${cbuf.length} >>`, stream: cbuf },
    { num: 5, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /ToUnicode 6 0 R >>" },
    { num: 6, head: `<< /Length ${mbuf.length} >>`, stream: mbuf },
  ]);
}

/* The measured Legistar agenda text shape (see docprofile/doctypes/
   meeting-agenda.mjs): labelled Subject:/From: blocks, the item number line,
   the file number alone on its line. File numbers chosen NOT to collide with
   the real packet's (26-07xx..26-09xx). */
const agendaLines = (n1, n2, n3) => [
  "Thursday, July 16, 2026",
  "City of Oakland",
  "Office of the City Clerk",
  "*Rules & Legislation Committee",
  " Agenda - SUPPLEMENTAL",
  "Roll Call /  Call To Order",
  "Subject: ",
  "Grand Performance Mural",
  "From: ",
  "Councilmember Wang",
  "Recommendation: Adopt A Resolution On Consent",
  "3.1",
  n1,
  "Subject: ",
  "Coliseum Payment Allocation",
  "From: ",
  "Finance Department",
  "Recommendation: Receive An Informational Report",
  "3.2",
  n2,
  "Determination Of Schedule Of Outstanding Committee Items",
  "2",
  n3,
  "Open Forum",
  "Adjournment",
];
const THREE = textPdf(agendaLines("26-9901", "26-9902", "26-9903"));

/* An ENCRYPTED PDF: the Standard Security Handler dict in the trailer. Tier 1
   has no decryption, so its text is a stated document-level `encrypted` marker
   and zero chars — the text-undetermined case. */
const ENC = pdf([
  { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
  { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
  { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  { num: 4, body: "<< /Filter /Standard /V 2 /R 3 /O (0000000000000000) /U (0000000000000000) /P -44 >>" },
], "trailer\n<< /Root 1 0 R /Encrypt 4 0 R >>\n");

/* ---- a minimal DOCX whose paragraphs carry the same agenda shape, so the
   office (pageless paragraphs[]) form is proven THROUGH THE WIRE ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
const u16 = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32 = (n) => Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8");
    const data = Buffer.from(f.data, "utf-8");
    const comp = deflateRawSync(data);
    const crc = crc32(data);
    const local = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length),
      u16(nameB.length), u16(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length),
      u16(nameB.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameB,
    ]);
    locals.push(local); centrals.push(central);
    offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(cd.length), u32(offset), u16(0),
  ]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const DOCXA = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
  { name: "word/document.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ${W}><w:body>`
      + agendaLines("26-9911", "26-9912", "26-9913").map((l) => `<w:p><w:r><w:t xml:space="preserve">${esc(l)}</w:t></w:r></w:p>`).join("")
      + `</w:body></w:document>` },
]);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-fw15", MEMBER_TOKEN: "mem-fw15", PROBE_TOKEN: "prb-fw15", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.pathname === "/packet.pdf") return bin(REAL, "application/pdf");
    if (u.pathname === "/three.pdf") return bin(THREE, "application/pdf");
    if (u.pathname === "/enc.pdf") return bin(ENC, "application/pdf");
    if (u.pathname === "/report.docx") return bin(DOCXA, DOCX_CT);
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const acquire = async (path) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-fw15",
  { method: "POST", body: JSON.stringify({ locator: "https://oakland.legistar.com" + path, authority: "City Clerk" }) })).json());
const readingOf = async (sha256) => (await (await mf.dispatchFetch(
  `http://x/api/?op=reading&token=mem-fw15&sha256=${encodeURIComponent(sha256)}`)).json()).result;
const refLookup = async (ref) => (await (await mf.dispatchFetch(
  `http://x/api/?op=readingref&token=mem-fw15&ref=${encodeURIComponent(ref)}`)).json()).result;

let bseq = 0;
const NOW = "2026-08-03T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Wire ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Wire bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const promoteDoc = async (doc) => {
  const id = `INFO-2026-${String(++bseq).padStart(4, "0")}-wire`;
  const md = bundleMd(id);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await (await mf.dispatchFetch("http://x/api/?op=promote&token=mem-fw15", { method: "POST", body: JSON.stringify({
    bundleId: id, base: null, snapKey: "20260803T010000Z_aaaa1111", author: "fw15",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Wire ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
    ],
    register: [],
  }) })).json();
  return { id, promoted: r.ok !== false };
};

console.log("\n--- ACCEPTS-WHEN: acquiring a REAL Oakland agenda PDF produces a reading ---");
const real = (await acquire("/packet.pdf")).document;
t("the capture was NOT read as text at intake (a PDF, stated by FW-3)", real.profile.profiled_from_text, false);
t("the FORMAT axis named it (COFF-1)", real.profile.format.format, "pdf");
t("but the WIRE read its text: the reading names the meeting_agenda reader", real.reading.content_type, "meeting_agenda");
t("the reader ran over text (read_from_text)", real.reading.read_from_text, true);
t("and found the packet's legislation (found:true)", real.reading.found, true);
t("all 41 items of legislation, keyed by Legistar file number", real.reading.entities.length, 41);
t("the reference is carried AS IT APPEARS (raw kind:key)",
  real.reading.entities.some((e) => e.ref === "legislation:26-0910"), true);
t("with the item's own facts read from the packet",
  real.reading.entities.find((e) => e.ref === "legislation:26-0910")?.facts?.from, "Councilmember Wang");
t("the meeting's facts ride the reading (body)", real.reading.facts.body, "Rules & Legislation Committee");
t("and the meeting date", real.reading.facts.date, "2026-07-16");
/* CORRECTED 2026-08-08 by CPDF-10, and the old assertion was WRONG rather than
   merely superseded, which is why it is changed here instead of exempted.
   It asserted `text_source === "layer"` — a single LABEL. That was right about
   the FACT (this text came out of the document's own layer) and wrong about the
   SHAPE, and the shape was load-bearing: the moment a second derivation exists,
   one label cannot say which engine produced the text or how many hands it
   passed through, and CPDF-10's whole thesis is that a chain which collapses is
   a chain nobody can audit. `text_source` is now the CHAIN. A text layer is
   itself an unverified transcription (CPDF-9 measured ABBYY FineReader in 3 of
   14 recent Legistar attachments), so `layer` is a derivation STEP like any
   other rather than the absence of one. `text_tier`/`text_container` below are
   untouched — a consumer reading only those is unaffected (IC-39). */
t("text provenance is a CHAIN (CPDF-10; was the token \"layer\" until 2026-08-08)",
  real.reading.text_source.map((s) => s.step), ["layer"]);
t("by tier", real.reading.text_tier, 1);
t("from which container", real.reading.text_container, "pdf");
t("a PARTIAL decode is STATED, never silent (the packet's 45-code-point residue)",
  /PARTIAL decode, stated: 45 undetermined/.test(real.reading.basis), true);

console.log("\n--- ACCEPTS-WHEN: after promote, the readings row and reading_refs rows exist ---");
const bReal = await promoteDoc(real);
t("the packet promoted", bReal.promoted, true);
const rReal = await readingOf(real.capture.sha256);
t("op=reading returns the persisted reading (readings row)", rReal.found, true);
t("reader_found and the entity count survived", [rReal.reader_found, rReal.entity_count], [true, 41]);
const at0910 = await refLookup("legislation:26-0910");
t("op=readingref finds the document BY LEGISLATION REFERENCE (reading_refs row)", at0910.count, 1);
t("naming the promoted bundle", at0910.documents[0]?.bundle_id, bReal.id);
t("and the capture whose reading carries it", at0910.documents[0]?.capture_sha, real.capture.sha256);

console.log("\n--- ACCEPTS-WHEN: text-undetermined is a FAILED reading, never a fabricated one ---");
const enc = (await acquire("/enc.pdf")).document;
t("an encrypted PDF's reading is found:false", enc.reading.found, false);
t("with NO invented entities", enc.reading.entities.length, 0);
t("no reader claims to have run over text", enc.reading.read_from_text, false);
t("the basis NAMES the tier's own marker (encrypted)", /encrypted/.test(enc.reading.basis), true);
t("and states the honesty rule, not a shrug", /invented|undetermined/.test(enc.reading.basis), true);
const bEnc = await promoteDoc(enc);
const rEnc = await readingOf(enc.capture.sha256);
t("the FAILED reading is persisted as such (found recorded false)", [rEnc.found, rEnc.reader_found, rEnc.entity_count], [true, false, 0]);

console.log("\n--- the NEGATIVE-CONTROL document: a mini agenda known to name THREE entities ---");
const three = (await acquire("/three.pdf")).document;
t("three entities read", three.reading.entities.length, 3);
t("their references", three.reading.entities.map((e) => e.ref).sort(),
  ["legislation:26-9901", "legislation:26-9902", "legislation:26-9903"]);
t("a FULL decode is not called partial", /PARTIAL/.test(three.reading.basis), false);
t("subject read for the labelled item",
  three.reading.entities.find((e) => e.ref === "legislation:26-9901")?.facts?.subject, "Grand Performance Mural");
t("a section item with no Subject block takes its heading, never an invented subject",
  three.reading.entities.find((e) => e.ref === "legislation:26-9903")?.label,
  "Determination Of Schedule Of Outstanding Committee Items");
const bThree = await promoteDoc(three);
t("promoted", bThree.promoted, true);
for (const ref of ["legislation:26-9901", "legislation:26-9902", "legislation:26-9903"])
  t(`reading_refs carries ${ref}`, (await refLookup(ref)).count, 1);

console.log("\n--- the office (pageless) form flows through the SAME wire: a .docx agenda ---");
const docx = (await acquire("/report.docx")).document;
t("the FORMAT axis named the container", docx.profile.format.format, "docx");
t("the wire read the paragraph text into the SAME reader", docx.reading.content_type, "meeting_agenda");
t("three entities from the docx", docx.reading.entities.map((e) => e.ref).sort(),
  ["legislation:26-9911", "legislation:26-9912", "legislation:26-9913"]);
t("container stamped", docx.reading.text_container, "docx");
const bDocx = await promoteDoc(docx);
t("promoted", bDocx.promoted, true);
t("and looked up by reference", (await refLookup("legislation:26-9912")).count, 1);

console.log("\n--- the entry point itself: I2's degenerate text forms (unit, docprofile.readText) ---");
{
  /* The office paragraphs[]-only form (I2 1.1.0), no `document` field. */
  const paras = agendaLines("26-9921", "26-9922", "26-9923")
    .map((l, i) => ({ para: i, ref: `¶${i + 1}`, text: l }));
  const r = readText({ paragraphs: paras, undetermined: [], counts: { chars: 400, undetermined: 0 } });
  t("paragraphs[] alone is an accepted source of text", r.determined, true);
  t("flattened from the paragraphs", r.text_from, "paragraphs");
  t("and read by the same doctype", [r.doctype.type.key, r.parsed.entities.length], ["meeting_agenda", 3]);
  const f = flattenText({ pages: [{ page: 0, text: "one" }, { page: 1, text: "two" }] });
  t("pages[] alone is an accepted source of text", [f.source, f.text], ["pages", "one\ntwo"]);
}
{
  /* text-undetermined: the producer's markers are named, nothing is read. */
  const r = readText({ document: "", pages: [], undetermined: [{ page: null, reason: "encrypted", font: null, codes: null, count: 1 }], counts: { chars: 0, undetermined: 1 } });
  t("zero decoded chars -> determined:false", r.determined, false);
  t("naming the producer's own reason", /encrypted/.test(r.why), true);
}
{
  /* essentially nothing decoded (the needsTier2 line): a fragment is refused. */
  const r = readText({ document: "scrap", undetermined: [{ page: 0, reason: "no_tounicode", count: 4000 }], counts: { chars: 5, undetermined: 4000 } });
  t("undetermined > decoded -> a FAILED reading, not a reading of the fragment", r.determined, false);
  t("stating the imbalance", /could not decode most/.test(r.why), true);
}

await mf.dispose();

/* ---- the Tier-2 arm of the wire, through the REAL fleet member (I6) ----
   A no-/ToUnicode doc Tier 1 cannot decode: WITH the pdf-worker bound, the wire
   escalates through the same needsTier2 predicate op=pdfstructure uses and the
   reading records tier 2; WITHOUT the binding the same doc yields a FAILED
   reading NAMING the font cause — degraded and stated, never a crash. */
const CID_STREAM = "BT /F1 24 Tf 72 700 Td (Hello Oakland 2026) Tj ET";
function xrefPdf(bodies) {
  let p = "%PDF-1.7\n%\xe2\xe3\xcf\xd3\n";
  const offsets = [];
  bodies.forEach((body, i) => { offsets[i] = p.length; p += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xrefStart = p.length;
  const n = bodies.length + 1;
  let xref = `xref\n0 ${n}\n0000000000 65535 f \n`;
  for (let i = 0; i < bodies.length; i++) xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  p += xref + `trailer\n<< /Size ${n} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(p, "latin1"));
}
const CID = xrefPdf([
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${CID_STREAM.length} >>\nstream\n${CID_STREAM}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
]);
const BUNDLE = fileURLToPath(new URL("../../pdf-worker/dist/pdf-worker.bundled.mjs", import.meta.url));
const planeWorker = (bound) => ({
  name: "plane", modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-fw15", MEMBER_TOKEN: "mem-fw15", PROBE_TOKEN: "prb-fw15", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService: (request) => new URL(request.url).pathname === "/cid.pdf"
    ? new Response(CID, { headers: { "content-type": "application/pdf" } })
    : new Response("unscripted", { status: 500 }),
  ...(bound ? { serviceBindings: { PDF_WORKER: "pdf-worker" } } : {}),
});
const pdfWorker = {
  name: "pdf-worker", modules: true, modulesRoot: "/", scriptPath: BUNDLE, script: readFileSync(BUNDLE, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  r2Buckets: ["CAPTURES"], bindings: { VERSION: "test" },
};

console.log("\n--- the wire escalates to the pdf-worker when Tier 1 got essentially nothing ---");
{
  const mf2 = new Miniflare({ workers: [planeWorker(true), pdfWorker] });
  const doc = (await (await mf2.dispatchFetch("http://x/api/?op=acquire&token=mem-fw15",
    { method: "POST", body: JSON.stringify({ locator: "https://oakland.legistar.com/cid.pdf", authority: "City Clerk" }) })).json()).document;
  t("the reading records TIER 2 (the fleet member decoded what Tier 1 could not)", doc.reading.text_tier, 2);
  t("a reader ran over the recovered text", doc.reading.read_from_text, true);
  t("a plain sentence is no agenda: the generic type, and an HONESTLY empty reading",
    [doc.reading.content_type, doc.reading.found, doc.reading.entities.length], ["generic", false, 0]);
  await mf2.dispose();
}
console.log("\n--- WITHOUT the binding the same doc is a FAILED reading NAMING the cause ---");
{
  const mf3 = new Miniflare({ workers: [planeWorker(false)] });
  const doc = (await (await mf3.dispatchFetch("http://x/api/?op=acquire&token=mem-fw15",
    { method: "POST", body: JSON.stringify({ locator: "https://oakland.legistar.com/cid.pdf", authority: "City Clerk" }) })).json()).document;
  t("no crash, no invented reading: found:false", doc.reading.found, false);
  t("tier 1 answered", doc.reading.text_tier, 1);
  t("and the basis NAMES the tier's own cause", /no_tounicode/.test(doc.reading.basis), true);
  await mf3.dispose();
}

console.log(`\nreading-wire: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
