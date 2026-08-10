/* The DOCX registry entry (QUEUE COFF-4), tested against a hermetic,
 * programmatically-built .docx modelled on a real Oakland agenda report —
 * paragraphs, a Legistar hyperlink, a mailto, an internal bookmark link, an
 * OLE embedding, a table, TRACKED CHANGES (w:ins/w:del with author, date and
 * the superseded wording) and word/comments.xml — so a PASS means the entry
 * read what is actually in the container.
 *
 * The accepts-when cases, all present:
 *   - battery green with the Oakland-shaped fixture yielding
 *     PARAGRAPH-REFERENCED links ({kind:"doc-para"} per IC-1 as resolved)
 *   - a tracked change carrying AUTHOR, DATE and the SUPERSEDED WORDING
 *   - an unreadable part -> a STATED undetermined, never a silent partial
 * Plus the doctrine cases: wrapper BYTE-IDENTITY with subresources.mjs's ONE
 * linkWrapper (the parity pdfstructure.test.mjs pins for PDF, pinned here for
 * DOCX); the detect confidence ladder (a bare PK sniff at the 1 KiB acquire
 * seam NEVER claims a docx; content-type-only is at most likely); deleted
 * text absent from the text stream and inserted text present; the size guard
 * carried verbatim as a stated text-undetermined; an unresolved bookmark
 * stated, never invented.
 */
/* NEGATIVE CONTROL: in src/docx.mjs's evidentiary item builder (docxStructure), change `item.superseded = c.text` to `item.superseded = null` — dropping the SUPERSEDED WORDING from the w:del emit -> the suite fails naming it ("the deletion carries the SUPERSEDED WORDING — the figure the published form removes"). RUN 2026-08-03: 2 of 82 failed (that assertion and the deletion-item deep-equal beside it); restored -> 82 pass 0 fail. */

import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { deflateRawSync } from "node:zlib";
import { linkWrapper } from "../src/subresources.mjs";
import { detectFormat, getFormat, listFormats } from "../src/formats.mjs";
import { docxEntry, docParaRef, walkDocumentBody, parseComments, DOCX_CONTENT_TYPE } from "../src/docx.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---- an INDEPENDENT crc32 so the fixture builder does not inherit a defect
 * from the module under test (the ooxml.test.mjs discipline) ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
function u16le(n) { return Buffer.from([n & 0xff, (n >> 8) & 0xff]); }
function u32le(n) { return Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]); }

/* The zip assembler. Per-file options: store (method 0), badCrc (lie about
 * the CRC in both headers), lieUncompressed (declare a FALSE uncompressed
 * size in the central directory — the authority — for the size-guard case,
 * where the declared size is read and the member deliberately is not). */
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf-8");
    const method = f.store ? 0 : 8;
    const comp = method === 8 ? deflateRawSync(data) : data;
    const crc = f.badCrc ? (crc32(data) ^ 0xdeadbeef) >>> 0 : crc32(data);
    const declared = f.lieUncompressed ?? data.length;
    const local = Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(method),
      u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(method),
      u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(declared),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0),
      u32le(0), u32le(offset), nameB,
    ]);
    locals.push(local); centrals.push(central);
    offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    u32le(0x06054b50), u16le(0), u16le(0),
    u16le(files.length), u16le(files.length),
    u32le(cd.length), u32le(offset), u16le(0),
  ]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

/* ---- the fixture, modelled on a real Oakland City Council agenda report ---- */
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const LEGISTAR_URL = "https://oakland.legistar.com/LegislationDetail.aspx?ID=7141033&GUID=1A2B3C4D";
const MAILTO = "mailto:cityclerk@oaklandca.gov";
const UNUSED_URL = "https://www.oaklandca.gov/documents/fy-2026-27-budget-facts";

/* Body paragraphs, 0-based (EVERY <w:p> in document order, table cells too):
 *  0 CITY OF OAKLAND            5 internal link -> FiscalImpact (bookmark)
 *  1 AGENDA REPORT              6 FISCAL IMPACT (bookmarkStart)
 *  2 TO: the City Administrator 7 unresolved anchor (MissingSection)
 *  3 Legistar hyperlink         8 Attachment A (OLE embedding, rId7)
 *  4 THE TRACKED CHANGE + the   9 table cell paragraph (Fund 1010)
 *    comment reference         10 closing + mailto hyperlink            */
const DOCUMENT_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${W} xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:o="urn:schemas-microsoft-com:office:office"><w:body>
<w:p><w:r><w:t>CITY OF OAKLAND</w:t></w:r></w:p>
<w:p><w:r><w:t>AGENDA REPORT</w:t></w:r></w:p>
<w:p><w:r><w:t>TO: Jestin D. Johnson, City Administrator</w:t></w:r></w:p>
<w:p><w:r><w:t>The full legislative file is at </w:t></w:r><w:hyperlink r:id="rId4" w:history="1"><w:r><w:t>oakland.legistar.com</w:t></w:r></w:hyperlink><w:r><w:t>.</w:t></w:r></w:p>
<w:p><w:r><w:t>The proposed appropriation is </w:t></w:r><w:del w:id="11" w:author="Chen, Roberto" w:date="2026-06-12T17:03:00Z"><w:r><w:delText>$1.2 million</w:delText></w:r></w:del><w:ins w:id="12" w:author="Chen, Roberto" w:date="2026-06-12T17:03:00Z"><w:r><w:t>$1.9 million</w:t></w:r></w:ins><w:r><w:t> from the General Purpose Fund.</w:t></w:r><w:r><w:commentReference w:id="1"/></w:r></w:p>
<w:p><w:r><w:t>See </w:t></w:r><w:hyperlink w:anchor="FiscalImpact"><w:r><w:t>Fiscal Impact</w:t></w:r></w:hyperlink><w:r><w:t> below.</w:t></w:r></w:p>
<w:p><w:bookmarkStart w:id="0" w:name="FiscalImpact"/><w:r><w:t>FISCAL IMPACT</w:t></w:r><w:bookmarkEnd w:id="0"/></w:p>
<w:p><w:r><w:t>See also </w:t></w:r><w:hyperlink w:anchor="MissingSection"><w:r><w:t>the missing section</w:t></w:r></w:hyperlink><w:r><w:t>.</w:t></w:r></w:p>
<w:p><w:r><w:t>Attachment A: </w:t></w:r><w:r><w:object><o:OLEObject r:id="rId7"/></w:object></w:r></w:p>
<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Fund 1010</w:t><w:tab/><w:t>General Purpose Fund</w:t></w:r></w:p></w:tc></w:tr></w:tbl>
<w:p><w:r><w:t>Questions to </w:t></w:r><w:hyperlink r:id="rId6"><w:r><w:t>the City Clerk</w:t></w:r></w:hyperlink><w:r><w:t>.</w:t></w:r></w:p>
</w:body></w:document>`;

const CONTENT_TYPES = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="bin" ContentType="application/vnd.openxmlformats-officedocument.oleObject"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/comments.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;
const ROOT_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
const DOC_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://oakland.legistar.com/LegislationDetail.aspx?ID=7141033&amp;GUID=1A2B3C4D" TargetMode="External"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/><Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${MAILTO}" TargetMode="External"/><Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject" Target="embeddings/oleObject1.bin"/><Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${UNUSED_URL}" TargetMode="External"/></Relationships>`;
const COMMENTS_XML = `<?xml version="1.0"?><w:comments ${W}><w:comment w:id="1" w:author="Ruiz, Elena" w:date="2026-06-13T09:41:00Z" w:initials="ER"><w:p><w:r><w:t>Confirm this figure with the Budget Bureau before publication.</w:t></w:r></w:p></w:comment></w:comments>`;
const CORE_XML = `<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>FY 2026-27 Midcycle Budget Amendments</dc:title><dc:creator>Firestone, Dana</dc:creator><cp:lastModifiedBy>Chen, Roberto</cp:lastModifiedBy><cp:revision>9</cp:revision><dcterms:created xsi:type="dcterms:W3CDTF">2026-06-01T09:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-13T09:41:00Z</dcterms:modified></cp:coreProperties>`;
const OLE_BYTES = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 1, 2, 3, 4]);

const docxFixture = (mutate = {}) => zip([
  { name: "[Content_Types].xml", data: CONTENT_TYPES },
  { name: "_rels/.rels", data: ROOT_RELS },
  { name: "word/document.xml", data: DOCUMENT_XML, ...(mutate.document ?? {}) },
  { name: "word/_rels/document.xml.rels", data: DOC_RELS, ...(mutate.rels ?? {}) },
  { name: "word/comments.xml", data: COMMENTS_XML, ...(mutate.comments ?? {}) },
  { name: "word/embeddings/oleObject1.bin", data: OLE_BYTES, store: true, ...(mutate.embedding ?? {}) },
  { name: "word/media/image1.png", data: Buffer.from([0x89, 0x50, 0x4e, 0x47, 9, 9]), store: true },
  { name: "docProps/core.xml", data: CORE_XML },
]);
const FIXTURE = docxFixture();

const PLAIN_ZIP = zip([
  { name: "minutes.txt", data: "Plain text minutes." },
  { name: "word/document.xml", data: "<not-wordprocessingml/>" }, // name alone must not decide
]);
const XLSXISH = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>` },
  { name: "xl/workbook.xml", data: "<workbook/>" },
]);

/* ================================================================== */
console.log("\n--- the detect confidence ladder: a PK sniff NEVER claims a docx ---");
{
  t("the docx entry is registered", listFormats().includes("docx"), true);
  const full = detectFormat(FIXTURE, null);
  t("full container bytes detect as docx", full.format, "docx");
  t("at LIKELY, not certain (the OPC declaration is deflated; parts() discriminates)",
    full.confidence, "likely");
  t("with the central-directory signals stated",
    full.signals.some((s) => s.includes("word/document.xml present")), true);

  /* The acquire-time seam: the profile stamp range-reads 1 KiB. No EOCD fits,
   * so bytes-only detection honestly answers nothing. */
  const kib = FIXTURE.subarray(0, 1024);
  t("the 1 KiB acquire seam: the entry answers null on bytes alone",
    docxEntry.detect(kib, null), null);
  t("so a bare PK sniff with no content type is a STATED undetermined",
    detectFormat(kib, null).format, "undetermined");
  const stamped = detectFormat(kib, DOCX_CONTENT_TYPE);
  t("with the declared .docx content type the second pass answers docx", stamped.format, "docx");
  t("at LIKELY — a declared type is never certain", stamped.confidence, "likely");
  t("and the signal names the content type, not a byte match",
    stamped.signals.every((s) => /content type/.test(s)), true);

  t("a plain ZIP is NOT claimed (even one carrying a word/document.xml NAME)",
    docxEntry.detect(PLAIN_ZIP, null), null);
  t("an xlsx-shaped container is NOT claimed by the docx entry",
    docxEntry.detect(XLSXISH, null), null);
  t("a legacy application/msword content type is NOT claimed (that is .doc, not .docx)",
    docxEntry.detect(null, "application/msword"), null);
}

console.log("\n--- detect→parts→structure through the registry (the D-70 pipeline, third axis) ---");
const det = detectFormat(FIXTURE, null);
const entry = getFormat(det.format);
const parts = await entry.parts(FIXTURE);
const S = await entry.structure(parts);
{
  t("parts() confirms the flavour the sync detect could only call likely", parts.ok, true);
  t("structure ok", S.ok, true);
  t("container docx", S.container, "docx");
  t("EVERY <w:p> counts, table cells included: 11 paragraphs", S.paragraphs, 11);
  t("the partition counts", S.counts, { anchor: 1, intra: 1, deferred: 2, refused: 1, undetermined: 1 });
  t("structure(bytes) — the registry seam without a prior parts() call — agrees byte-for-byte",
    await entry.structure(FIXTURE), S);
}

console.log("\n--- THE ACCEPTANCE CASE: paragraph-referenced links, {kind:\"doc-para\"} per IC-1 ---");
{
  const legistar = S.links.find((l) => l.partition === "deferred" && l.target.url === LEGISTAR_URL);
  t("the Legistar hyperlink is deferred, its rels &amp; entity decoded", !!legistar, true);
  t("wrapper BYTE-IDENTICAL to subresources.mjs linkWrapper.deferred (the ONE wrapper)",
    legistar.wrapper, linkWrapper.deferred(LEGISTAR_URL));
  t("its element reference is doc-para: ¶4, para 3 (0-based REQUIRED), run 1 (OPTIONAL, genuinely a run target)",
    legistar.source, { kind: "doc-para", ref: "¶4", para: 3, run: 1 });
  const mailto = S.links.find((l) => l.partition === "refused");
  t("the mailto is refused with the refused wrapper exactly", mailto.wrapper, linkWrapper.refused(MAILTO));
  t("refused still carries its doc-para reference", mailto.source, { kind: "doc-para", ref: "¶11", para: 10, run: 1 });
  const unused = S.links.find((l) => l.partition === "deferred" && l.target.url === UNUSED_URL);
  t("a rels hyperlink with no body usage is CARRIED once, source null (never invented)",
    unused.source, null);
}

console.log("\n--- bookmarks -> anchor; an unresolvable anchor is STATED, never invented ---");
{
  const anchor = S.links.find((l) => l.partition === "anchor");
  t("the internal link resolves through the bookmark to its paragraph",
    anchor.target, { para: 6, fragment: "#para=7", bookmark: "FiscalImpact" });
  t("wrapper byte-identical to linkWrapper.anchor of the fragment",
    anchor.wrapper, linkWrapper.anchor("#para=7"));
  t("cited from ¶6 (para 5, run 1)", anchor.source, { kind: "doc-para", ref: "¶6", para: 5, run: 1 });
  const missing = S.links.find((l) => l.partition === "undetermined");
  t("the anchor naming a bookmark the body never defines is undetermined",
    missing.target, { why: "bookmark_unresolved", bookmark: "MissingSection" });
  t("with wrapper null (I2's undetermined invariant)", missing.wrapper, null);
  t("and the CITING paragraph still referenced", missing.source, { kind: "doc-para", ref: "¶8", para: 7, run: 1 });
}

console.log("\n--- word/embeddings/ -> intra, content-addressed as PDF embedded files are ---");
{
  const intra = S.links.find((l) => l.partition === "intra");
  const sha = crypto ? await (async () => {
    const d = await crypto.subtle.digest("SHA-256", OLE_BYTES);
    return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
  })() : null;
  t("the OLE embedding is intra with its true sha256", intra.target, { sha256: sha, name: "oleObject1.bin", bytes: OLE_BYTES.length });
  t("wrapper byte-identical to linkWrapper.intra", intra.wrapper, linkWrapper.intra(sha));
  t("located to its paragraph through the rels id", intra.source, { kind: "doc-para", ref: "¶9", para: 8, run: 1 });
  t("the internal image rel (media/) is NOT a link record",
    S.links.some((l) => JSON.stringify(l).includes("image1.png")), false);
}

console.log("\n--- THE EVIDENTIARY CORE (DEC-5): the tracked change with author, date, SUPERSEDED WORDING ---");
{
  const del = S.evidentiary.items.find((i) => i.kind === "tracked-change" && i.change === "deletion");
  t("the deletion is present as a tracked-change item", !!del, true);
  t("the deletion carries the SUPERSEDED WORDING — the figure the published form removes",
    del.superseded, "$1.2 million");
  t("the deletion item entire: author, date, superseded wording, doc-para reference",
    del, { kind: "tracked-change", change: "deletion", author: "Chen, Roberto",
           date: "2026-06-12T17:03:00Z", source: { kind: "doc-para", ref: "¶5", para: 4, run: 1 },
           superseded: "$1.2 million" });
  const ins = S.evidentiary.items.find((i) => i.kind === "tracked-change" && i.change === "insertion");
  t("the insertion carries what replaced it", ins.text, "$1.9 million");
  t("insertion author and date", [ins.author, ins.date], ["Chen, Roberto", "2026-06-12T17:03:00Z"]);
  t("insertion referenced to its run", ins.source, { kind: "doc-para", ref: "¶5", para: 4, run: 2 });
  t("the envelope counts both changes", S.evidentiary.counts["tracked-change"], 2);
}

console.log("\n--- word/comments.xml: author, date, anchored to the commented paragraph ---");
{
  const c = S.evidentiary.items.find((i) => i.kind === "comment");
  t("the comment, whole", c, {
    kind: "comment", id: "1", author: "Ruiz, Elena", date: "2026-06-13T09:41:00Z",
    initials: "ER", text: "Confirm this figure with the Budget Bureau before publication.",
    source: { kind: "doc-para", ref: "¶5", para: 4, run: 4 },
  });
  const core = S.evidentiary.items.find((i) => i.kind === "core-properties");
  t("core properties ride the same envelope (who touched it, when)",
    [core.creator, core.lastModifiedBy, core.revision], ["Firestone, Dana", "Chen, Roberto", "9"]);
  t("the envelope names its kinds", S.evidentiary.kinds.sort(),
    ["comment", "core-properties", "tracked-change"]);
  t("nothing undetermined on the clean fixture", S.evidentiary.undetermined, []);
}

console.log("\n--- text: <w:t> runs in body order; DELETED text is NOT in the stream, INSERTED is ---");
{
  const T = await entry.text(parts);
  t("text ok", T.ok, true);
  t("the tracked-change paragraph reads AS SERVED: inserted present, deleted absent",
    T.paragraphs[4].text, "The proposed appropriation is $1.9 million from the General Purpose Fund.");
  t("the superseded wording is NOWHERE in the text stream (it lives in the evidentiary envelope)",
    T.document.includes("$1.2 million"), false);
  t("paragraphs carry their doc-para refs", [T.paragraphs[0].ref, T.paragraphs[6].ref], ["¶1", "¶7"]);
  t("body order holds: first and the bookmark target",
    [T.paragraphs[0].text, T.paragraphs[6].text], ["CITY OF OAKLAND", "FISCAL IMPACT"]);
  t("a table cell's text is in the stream, tab rendered as a tab",
    T.paragraphs[9].text, "Fund 1010\tGeneral Purpose Fund");
  t("document is the non-empty paragraphs newline-joined",
    T.document.startsWith("CITY OF OAKLAND\nAGENDA REPORT\n"), true);
  t("counts honest", T.counts, { chars: T.document.length, undetermined: 0 });
  t("no undetermined markers on the clean fixture", T.undetermined, []);
}

console.log("\n--- AN UNREADABLE PART IS A STATED UNDETERMINED, NEVER A SILENT PARTIAL ---");
{
  /* comments.xml corrupted: the rest of the document still reads, and the
   * envelope STATES the unreadable part by name and reason. */
  const p1 = await entry.parts(docxFixture({ comments: { badCrc: true } }));
  const s1 = await entry.structure(p1);
  t("a corrupt comments.xml is stated in the envelope",
    s1.evidentiary.undetermined, [{ part: "word/comments.xml", why: "crc_mismatch" }]);
  t("no comment item was invented from it",
    s1.evidentiary.items.some((i) => i.kind === "comment"), false);
  t("the tracked changes still read (the failure is contained)",
    s1.evidentiary.counts["tracked-change"], 2);

  /* document.xml itself unreadable: links from rels survive WITHOUT invented
   * paragraph references; text refuses with the reason. */
  const p2 = await entry.parts(docxFixture({ document: { badCrc: true } }));
  const s2 = await entry.structure(p2);
  t("structure still walks the container", s2.ok, true);
  t("paragraph count is null — honestly unknown, not zero", s2.paragraphs, null);
  t("rels links survive with source null (no paragraph reference is INVENTED) — 2 deferred, 1 refused",
    s2.links.filter((l) => l.partition === "deferred" || l.partition === "refused").map((l) => l.source),
    [null, null, null]);
  t("no anchor or tracked change was conjured without the body",
    [s2.counts.anchor, s2.evidentiary.counts["tracked-change"] ?? 0], [0, 0]);
  const t2 = await entry.text(p2);
  t("text states the unreadable main part",
    t2.undetermined, [{ reason: "main_part_unreadable", part: "word/document.xml", why: "crc_mismatch" }]);
  t("document null, chars 0 — refused, not truncated", [t2.document, t2.counts.chars], [null, 0]);

  /* an unreadable .rels part: links may be MISSING, and that is said. */
  const p3 = await entry.parts(docxFixture({ rels: { badCrc: true } }));
  const s3 = await entry.structure(p3);
  const relsU = s3.links.find((l) => l.partition === "undetermined" && l.target.why === "rels_unreadable");
  t("an unreadable rels part is CARRIED as an undetermined link naming part and reason",
    relsU.target, { why: "rels_unreadable", part: "word/_rels/document.xml.rels", detail: "crc_mismatch" });

  /* an unreadable embedding. */
  const p4 = await entry.parts(docxFixture({ embedding: { badCrc: true } }));
  const s4 = await entry.structure(p4);
  const embU = s4.links.find((l) => l.partition === "undetermined" && l.target.why === "embedded_part_unreadable");
  t("an unreadable embedding is stated with part and reason, not silently dropped",
    embU.target, { why: "embedded_part_unreadable", part: "word/embeddings/oleObject1.bin", detail: "crc_mismatch" });

  /* not a docx at all. */
  const pz = await entry.parts(PLAIN_ZIP);
  t("a plain zip refuses at parts(): stated, with the container's own verdict",
    [pz.ok, pz.why], [false, "not_docx:zip"]);
  t("structure passes the refusal through", await entry.structure(pz),
    { ok: false, container: "docx", reason: "not_docx:zip" });
  t("arbitrary bytes: not_a_zip", (await entry.parts(new Uint8Array([9, 9, 9, 9, 9, 9]))).why, "not_a_zip");
}

console.log("\n--- the size guard: over the bound -> text-undetermined VERBATIM, never truncation ---");
{
  /* The central directory DECLARES 64 MiB uncompressed for document.xml (the
   * COFF-6 metric: declared text-part bytes, summed before inflation). The
   * member is deliberately never read. */
  const big = docxFixture({ document: { lieUncompressed: 64 * 1024 * 1024 } });
  const pb = await entry.parts(big);
  t("parts still ok — the container and rels walk in full", pb.ok, true);
  const tb = await entry.text(pb);
  t("text refuses as a stated undetermined", tb.document, null);
  t("carrying the guard marker verbatim: why", tb.undetermined[0].why, "over_size_bound");
  /* CORRECTED by COFF-3's enactment of COFF-6 (the two items merged at
   * integration): the provisional 32 MiB container bound this assertion
   * originally pinned was replaced by the MEASURED bound — 20 MiB of declared
   * uncompressed text-part bytes (MEASUREMENTS.md 2026-08-03) — so the marker
   * now names the measured constant. The property under test is unchanged:
   * the marker NAMES its bound so nobody mistakes where the number came from. */
  t("naming the bound constant so nobody mistakes where the number came from",
    tb.undetermined[0].boundName, "MEASURED_OOXML_TEXT_BOUND_BYTES");
  t("counts say one undetermined, zero chars", tb.counts, { chars: 0, undetermined: 1 });
  const sb = await entry.structure(pb);
  t("structure states it in the envelope too",
    sb.evidentiary.undetermined.some((u) => u.why === "over_size_bound" && u.part === "word/document.xml"), true);
  t("rels links still emitted (source null — the body was not read): 2 deferred + 1 refused",
    [sb.counts.deferred, sb.counts.refused], [2, 1]);
}

console.log("\n--- the walk and comment parsers hold their own doctrine ---");
{
  const w = walkDocumentBody(DOCUMENT_XML);
  t("bookmarks map to their paragraph", w.bookmarks.get("FiscalImpact"), 6);
  t("the comment reference is at para 4, run 4", w.commentRefs.get("1"), { para: 4, run: 4 });
  t("rid usage locates the OLE object", w.ridUsage.get("rId7"), { para: 8, run: 1 });
  t("docParaRef omits run when the paragraph is the honest granularity",
    docParaRef(3), { kind: "doc-para", ref: "¶4", para: 3 });
  t("and carries it when the reference genuinely targets runs",
    docParaRef(3, 0), { kind: "doc-para", ref: "¶4", para: 3, run: 0 });
  t("garbage comments.xml is a stated failure", parseComments("nope").why, "comments_unparseable");
  const sparse = parseComments(`<w:comments ${W}><w:comment w:id="2"><w:p><w:r><w:t>unattributed</w:t></w:r></w:p></w:comment></w:comments>`);
  t("a comment with no author/date records NULLS, never invented attribution",
    sparse.comments[0], { id: "2", author: null, date: null, initials: null, text: "unattributed" });
}

console.log(`\nformats-docx: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
