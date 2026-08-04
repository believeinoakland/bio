/* The PPTX registry entry (QUEUE COFF-5), tested against a hermetic,
 * programmatically-built .pptx modelled on a real Oakland budget deck —
 * three slides, a Legistar hyperlink, a mailto, an internal slide-jump link,
 * an OLE embedding, and SPEAKER NOTES (routinely more candid than the slide:
 * the deck says "GENERAL PURPOSE FUND OUTLOOK", the notes say what to do if
 * Council presses on the gap) — so a PASS means the entry read what is
 * actually in the container.
 *
 * The accepts-when cases, all present:
 *   - battery green with the Oakland-shaped deck yielding SLIDE+SHAPE
 *     references ({kind:"slide-shape"} per IC-1 as resolved)
 *   - speaker notes DISTINGUISHABLE from slide text everywhere shown, cited
 *     or indexed: a distinct envelope kind, a distinct text unit list with
 *     its own "(notes)" refs, NEVER merged into `document` or a slide's text
 *   - an unreadable part -> a STATED undetermined, never a silent partial
 * Plus the doctrine cases: wrapper BYTE-IDENTITY with subresources.mjs's ONE
 * linkWrapper (the parity formats-docx.test.mjs pins for DOCX, pinned here
 * for PPTX); the detect confidence ladder (a bare PK sniff at the 1 KiB
 * acquire seam NEVER claims a pptx; content-type-only is at most likely);
 * slide numbers from the DECLARED sldIdLst order, never from filenames; the
 * size guard carried verbatim as a stated text-undetermined; a jump to a
 * slide the deck does not contain stated, never invented.
 */
/* NEGATIVE CONTROL: in src/pptx.mjs's pptxText, merge the notes into the slide text — change the `document` line to `const document = [...slides.map((s) => s.text), ...speakerNotes.map((s) => s.text)].filter((t) => t.length).join("\n");` — and the suite fails NAMING the distinction. RUN 2026-08-03: 2 of 95 failed ("speaker notes are NOWHERE in document — the deck as presented" and "document is the slide texts newline-joined — THE DECK AS PRESENTED"); restored -> 95 pass 0 fail. */

import { deflateRawSync } from "node:zlib";
import { linkWrapper } from "../src/subresources.mjs";
import { detectFormat, getFormat, listFormats } from "../src/formats.mjs";
import { pptxEntry, slideShapeRef, walkSlide, PPTX_CONTENT_TYPE } from "../src/pptx.mjs";

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

/* The zip assembler (the formats-docx.test.mjs one). Per-file options: store
 * (method 0), badCrc (lie about the CRC in both headers), lieUncompressed
 * (declare a FALSE uncompressed size in the central directory — the
 * authority — for the size-guard case, where the declared size is read and
 * the member deliberately is not). */
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

/* ---- the fixture, modelled on a real Oakland budget presentation ---- */
const P = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const A = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"';
const R = 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const LEGISTAR_URL = "https://oakland.legistar.com/LegislationDetail.aspx?ID=7141033&GUID=1A2B3C4D";
const MAILTO = "mailto:budget@oaklandca.gov";
const UNUSED_URL = "https://www.oaklandca.gov/documents/fy-2026-27-budget-facts";

/* Deck (sldIdLst order = slide1, slide2, slide3):
 *  slide 1  title deck — shapes: sp0 title, sp1 subtitle. Notes: logistics.
 *  slide 2  outlook — sp0 title; sp1 body with the Legistar hyperlink (rId2),
 *           the mailto (rId3), an internal jump to slide 3 (rId4), and a jump
 *           to a slide the deck does not contain (rId6). Notes: THE CANDID
 *           LINE the slide itself never says.
 *  slide 3  fiscal impact — sp0 title, graphicFrame1 with the OLE embedding
 *           (rId2), sp2 fund table text. No notes.                        */
const SLIDE1_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld ${P} ${A} ${R}><p:cSld><p:spTree>
<p:sp><p:txBody><a:p><a:r><a:t>CITY OF OAKLAND</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:txBody><a:p><a:r><a:t>FY 2026-27 Proposed Midcycle Budget</a:t></a:r></a:p></p:txBody></p:sp>
</p:spTree></p:cSld></p:sld>`;
const SLIDE2_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld ${P} ${A} ${R}><p:cSld><p:spTree>
<p:sp><p:txBody><a:p><a:r><a:t>GENERAL PURPOSE FUND OUTLOOK</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:txBody>
<a:p><a:r><a:t>See </a:t></a:r><a:r><a:rPr><a:hlinkClick r:id="rId2"/></a:rPr><a:t>the legislative file</a:t></a:r></a:p>
<a:p><a:r><a:rPr><a:hlinkClick r:id="rId3"/></a:rPr><a:t>Contact the City Clerk</a:t></a:r></a:p>
<a:p><a:r><a:t>Details: </a:t></a:r><a:r><a:rPr><a:hlinkClick r:id="rId4" action="ppaction://hlinksldjump"/></a:rPr><a:t>Fiscal Impact</a:t></a:r></a:p>
<a:p><a:r><a:t>See </a:t></a:r><a:r><a:rPr><a:hlinkClick r:id="rId6" action="ppaction://hlinksldjump"/></a:rPr><a:t>the missing appendix</a:t></a:r></a:p>
</p:txBody></p:sp>
</p:spTree></p:cSld></p:sld>`;
const SLIDE3_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld ${P} ${A} ${R}><p:cSld><p:spTree>
<p:sp><p:txBody><a:p><a:r><a:t>FISCAL IMPACT</a:t></a:r></a:p></p:txBody></p:sp>
<p:graphicFrame><a:graphic><a:graphicData><p:oleObj r:id="rId2"/></a:graphicData></a:graphic></p:graphicFrame>
<p:sp><p:txBody><a:p><a:r><a:t>Fund 1010</a:t></a:r><a:br/><a:r><a:t>General Purpose Fund</a:t></a:r></a:p></p:txBody></p:sp>
</p:spTree></p:cSld></p:sld>`;

const NOTES1_TEXT = "Presented to Council 2026-06-16. Keep the walkthrough to five minutes.";
const NOTES2_TEXT = "If Council presses on the $1.9 million gap, defer to the Budget Bureau — the reconciliation is not final.";
const notesXmlOf = (text) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:notes ${P} ${A} ${R}><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:notes>`;

/* sldId carries BOTH its own unprefixed id="" and the r:id rel — the entry
 * must read the PREFIXED one. */
const PRESENTATION_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation ${P} ${R}><p:sldIdLst><p:sldId id="256" r:id="rId2"/><p:sldId id="257" r:id="rId3"/><p:sldId id="258" r:id="rId4"/></p:sldIdLst></p:presentation>`;
/* The REORDERED deck: same slide parts, sldIdLst says 1, 3, 2 — numbering
 * must follow the declaration, never the filenames. */
const PRESENTATION_XML_REORDERED = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation ${P} ${R}><p:sldIdLst><p:sldId id="256" r:id="rId2"/><p:sldId id="258" r:id="rId4"/><p:sldId id="257" r:id="rId3"/></p:sldIdLst></p:presentation>`;

const CONTENT_TYPES = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="bin" ContentType="application/vnd.openxmlformats-officedocument.oleObject"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/slides/slide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/slides/slide3.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/notesSlides/notesSlide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/><Override PartName="/ppt/notesSlides/notesSlide2.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;
const ROOT_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`;
const PRES_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide2.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide3.xml"/></Relationships>`;
const SLIDE1_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide1.xml"/></Relationships>`;
const SLIDE2_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide2.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://oakland.legistar.com/LegislationDetail.aspx?ID=7141033&amp;GUID=1A2B3C4D" TargetMode="External"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${MAILTO}" TargetMode="External"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slide3.xml"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${UNUSED_URL}" TargetMode="External"/><Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slide9.xml"/></Relationships>`;
const SLIDE3_RELS = `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject" Target="../embeddings/oleObject1.bin"/></Relationships>`;
const CORE_XML = `<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>FY 2026-27 Proposed Midcycle Budget</dc:title><dc:creator>Nguyen, Ana</dc:creator><cp:lastModifiedBy>Chen, Roberto</cp:lastModifiedBy><cp:revision>4</cp:revision><dcterms:created xsi:type="dcterms:W3CDTF">2026-06-02T15:00:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-06-15T18:22:00Z</dcterms:modified></cp:coreProperties>`;
const OLE_BYTES = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 5, 6, 7, 8]);

const pptxFixture = (mutate = {}) => zip([
  { name: "[Content_Types].xml", data: CONTENT_TYPES },
  { name: "_rels/.rels", data: ROOT_RELS },
  { name: "ppt/presentation.xml", data: mutate.presentationXml ?? PRESENTATION_XML, ...(mutate.presentation ?? {}) },
  { name: "ppt/_rels/presentation.xml.rels", data: PRES_RELS },
  { name: "ppt/slides/slide1.xml", data: SLIDE1_XML, ...(mutate.slide1 ?? {}) },
  { name: "ppt/slides/slide2.xml", data: SLIDE2_XML, ...(mutate.slide2 ?? {}) },
  { name: "ppt/slides/slide3.xml", data: SLIDE3_XML },
  { name: "ppt/slides/_rels/slide1.xml.rels", data: SLIDE1_RELS },
  { name: "ppt/slides/_rels/slide2.xml.rels", data: SLIDE2_RELS, ...(mutate.rels2 ?? {}) },
  { name: "ppt/slides/_rels/slide3.xml.rels", data: SLIDE3_RELS },
  { name: "ppt/notesSlides/notesSlide1.xml", data: notesXmlOf(NOTES1_TEXT) },
  { name: "ppt/notesSlides/notesSlide2.xml", data: notesXmlOf(NOTES2_TEXT), ...(mutate.notes2 ?? {}) },
  { name: "ppt/embeddings/oleObject1.bin", data: OLE_BYTES, store: true, ...(mutate.embedding ?? {}) },
  { name: "docProps/core.xml", data: CORE_XML },
]);
const FIXTURE = pptxFixture();

const S1_TEXT = "CITY OF OAKLAND\nFY 2026-27 Proposed Midcycle Budget";
const S2_TEXT = "GENERAL PURPOSE FUND OUTLOOK\nSee the legislative file\nContact the City Clerk\nDetails: Fiscal Impact\nSee the missing appendix";
const S3_TEXT = "FISCAL IMPACT\nFund 1010\nGeneral Purpose Fund";

const PLAIN_ZIP = zip([
  { name: "minutes.txt", data: "Plain text minutes." },
  { name: "ppt/presentation.xml", data: "<not-presentationml/>" }, // name alone must not decide
]);
const DOCXISH = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>` },
  { name: "word/document.xml", data: "<document/>" },
]);

/* ================================================================== */
console.log("\n--- the detect confidence ladder: a PK sniff NEVER claims a pptx ---");
{
  t("the pptx entry is registered", listFormats().includes("pptx"), true);
  const full = detectFormat(FIXTURE, null);
  t("full container bytes detect as pptx", full.format, "pptx");
  t("at LIKELY, not certain (the OPC declaration is deflated; parts() discriminates)",
    full.confidence, "likely");
  t("with the central-directory signals stated",
    full.signals.some((s) => s.includes("ppt/presentation.xml present")), true);

  /* The acquire-time seam: the profile stamp range-reads 1 KiB. No EOCD fits,
   * so bytes-only detection honestly answers nothing. */
  const kib = FIXTURE.subarray(0, 1024);
  t("the 1 KiB acquire seam: the entry answers null on bytes alone",
    pptxEntry.detect(kib, null), null);
  t("so a bare PK sniff with no content type is a STATED undetermined",
    detectFormat(kib, null).format, "undetermined");
  const stamped = detectFormat(kib, PPTX_CONTENT_TYPE);
  t("with the declared .pptx content type the second pass answers pptx", stamped.format, "pptx");
  t("at LIKELY — a declared type is never certain", stamped.confidence, "likely");

  t("a plain ZIP is NOT claimed (even one carrying a ppt/presentation.xml NAME)",
    pptxEntry.detect(PLAIN_ZIP, null), null);
  t("a docx-shaped container is NOT claimed by the pptx entry",
    pptxEntry.detect(DOCXISH, null), null);
  t("a legacy application/vnd.ms-powerpoint content type is NOT claimed (that is .ppt, not .pptx)",
    pptxEntry.detect(null, "application/vnd.ms-powerpoint"), null);
}

console.log("\n--- detect→parts→structure through the registry (the D-70 pipeline, third axis) ---");
const det = detectFormat(FIXTURE, null);
const entry = getFormat(det.format);
const parts = await entry.parts(FIXTURE);
const S = await entry.structure(parts);
{
  t("parts() confirms the flavour the sync detect could only call likely", parts.ok, true);
  t("structure ok", S.ok, true);
  t("container pptx", S.container, "pptx");
  t("three slides, numbered from the DECLARED sldIdLst order", S.slides, 3);
  t("the partition counts", S.counts, { anchor: 1, intra: 1, deferred: 2, refused: 1, undetermined: 1 });
  t("structure(bytes) — the registry seam without a prior parts() call — agrees byte-for-byte",
    await entry.structure(FIXTURE), S);
}

console.log("\n--- THE ACCEPTANCE CASE: slide+shape references, {kind:\"slide-shape\"} per IC-1 ---");
{
  const legistar = S.links.find((l) => l.partition === "deferred" && l.target.url === LEGISTAR_URL);
  t("the Legistar hyperlink is deferred, its rels &amp; entity decoded", !!legistar, true);
  t("wrapper BYTE-IDENTICAL to subresources.mjs linkWrapper.deferred (the ONE wrapper)",
    legistar.wrapper, linkWrapper.deferred(LEGISTAR_URL));
  t("its element reference is slide-shape: slide 2 (1-based, = the human ref), shape 1 (0-based, genuinely a shape target)",
    legistar.source, { kind: "slide-shape", ref: "slide 2", slide: 2, shape: 1 });
  const mailto = S.links.find((l) => l.partition === "refused");
  t("the mailto is refused with the refused wrapper exactly", mailto.wrapper, linkWrapper.refused(MAILTO));
  t("refused still carries its slide-shape reference", mailto.source, { kind: "slide-shape", ref: "slide 2", slide: 2, shape: 1 });
  const unused = S.links.find((l) => l.partition === "deferred" && l.target.url === UNUSED_URL);
  t("a rels hyperlink with no body usage is CARRIED once, at SLIDE granularity (its .rels part IS the slide's — no shape invented)",
    unused.source, { kind: "slide-shape", ref: "slide 2", slide: 2 });
}

console.log("\n--- slide jumps -> anchor; a jump to a slide the deck lacks is STATED, never invented ---");
{
  const anchor = S.links.find((l) => l.partition === "anchor");
  t("the internal jump resolves through the rels to its DECK-ORDER slide number",
    anchor.target, { slide: 3, fragment: "#slide=3", part: "ppt/slides/slide3.xml" });
  t("wrapper byte-identical to linkWrapper.anchor of the fragment",
    anchor.wrapper, linkWrapper.anchor("#slide=3"));
  t("cited from slide 2, shape 1", anchor.source, { kind: "slide-shape", ref: "slide 2", slide: 2, shape: 1 });
  const missing = S.links.find((l) => l.partition === "undetermined");
  t("the jump naming a slide the deck does not contain is undetermined",
    missing.target, { why: "slide_unresolved", part: "ppt/slides/slide9.xml" });
  t("with wrapper null (I2's undetermined invariant)", missing.wrapper, null);
  t("and the CITING slide+shape still referenced", missing.source, { kind: "slide-shape", ref: "slide 2", slide: 2, shape: 1 });
  t("structural slide rels (sldIdLst's own, a slide's notesSlide rel) are NOT link records",
    S.links.some((l) => JSON.stringify(l).includes("notesSlide") || JSON.stringify(l).includes("slide1.xml")), false);
}

console.log("\n--- ppt/embeddings/ -> intra, content-addressed as PDF and DOCX embedded files are ---");
{
  const intra = S.links.find((l) => l.partition === "intra");
  const sha = await (async () => {
    const d = await crypto.subtle.digest("SHA-256", OLE_BYTES);
    return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
  })();
  t("the OLE embedding is intra with its true sha256", intra.target, { sha256: sha, name: "oleObject1.bin", bytes: OLE_BYTES.length });
  t("wrapper byte-identical to linkWrapper.intra", intra.wrapper, linkWrapper.intra(sha));
  t("located to its slide and shape through the rels id (the graphicFrame is shape 1)",
    intra.source, { kind: "slide-shape", ref: "slide 3", slide: 3, shape: 1 });
}

console.log("\n--- THE EVIDENTIARY CORE (DEC-5): speaker notes, per slide, a DISTINCT kind ---");
{
  const notes = S.evidentiary.items.filter((i) => i.kind === "speaker-notes");
  t("one speaker-notes item per slide that has notes (slide 3 has none)", notes.length, 2);
  t("the candid line the slide never says, attributed to ITS slide", notes[1], {
    kind: "speaker-notes", slide: 2, part: "ppt/notesSlides/notesSlide2.xml",
    text: NOTES2_TEXT, source: { kind: "slide-shape", ref: "slide 2", slide: 2 },
  });
  t("slide 1's notes item entire", notes[0], {
    kind: "speaker-notes", slide: 1, part: "ppt/notesSlides/notesSlide1.xml",
    text: NOTES1_TEXT, source: { kind: "slide-shape", ref: "slide 1", slide: 1 },
  });
  t("the envelope counts them", S.evidentiary.counts["speaker-notes"], 2);
  const core = S.evidentiary.items.find((i) => i.kind === "core-properties");
  t("core properties ride the same envelope exactly as docx carries them (who touched it, when)",
    [core.creator, core.lastModifiedBy, core.revision, core.title],
    ["Nguyen, Ana", "Chen, Roberto", "4", "FY 2026-27 Proposed Midcycle Budget"]);
  t("the envelope names its kinds", S.evidentiary.kinds.sort(), ["core-properties", "speaker-notes"]);
  t("the envelope container", S.evidentiary.container, "pptx");
  t("nothing undetermined on the clean fixture", S.evidentiary.undetermined, []);
}

console.log("\n--- text: <a:t> runs per slide; NOTES ARE A DISTINCT UNIT, NEVER MERGED ---");
const T = await entry.text(parts);
{
  t("text ok", T.ok, true);
  t("slide units carry slide-shape refs and their part", T.slides[0], { slide: 1, ref: "slide 1", part: "ppt/slides/slide1.xml", text: S1_TEXT });
  t("slide 2's text: paragraphs newline-joined, runs concatenated", T.slides[1].text, S2_TEXT);
  t("slide 3's text: <a:br> is a line break within its paragraph", T.slides[2].text, S3_TEXT);
  t("document is the slide texts newline-joined — THE DECK AS PRESENTED", T.document, `${S1_TEXT}\n${S2_TEXT}\n${S3_TEXT}`);
  t("speaker notes are their OWN units with their own '(notes)' refs — distinguishable wherever cited or indexed",
    T.speakerNotes.map((n) => n.ref), ["slide 1 (notes)", "slide 2 (notes)"]);
  t("the candid notes text is in its unit", T.speakerNotes[1].text, NOTES2_TEXT);
  t("speaker notes are NOWHERE in document — the deck as presented",
    T.document.includes("defer to the Budget Bureau"), false);
  t("and NOWHERE in any slide's own text unit",
    T.slides.some((s) => s.text.includes("Budget Bureau") || s.text.includes("walkthrough")), false);
  t("counts.chars counts slide text only; notesChars counts notes apart — no conflation by accident",
    T.counts, { chars: T.document.length, notesChars: NOTES1_TEXT.length + NOTES2_TEXT.length, undetermined: 0 });
  t("no undetermined markers on the clean fixture", T.undetermined, []);
}

console.log("\n--- slide numbers follow the DECLARED order, never the filenames ---");
{
  const p = await entry.parts(pptxFixture({ presentationXml: PRESENTATION_XML_REORDERED }));
  const tr = await entry.text(p);
  t("sldIdLst says 1, 3, 2: slide3.xml IS slide 2 of the deck",
    [tr.slides[1].part, tr.slides[1].slide], ["ppt/slides/slide3.xml", 2]);
  t("and slide2.xml IS slide 3", [tr.slides[2].part, tr.slides[2].slide], ["ppt/slides/slide2.xml", 3]);
  const sr = await entry.structure(p);
  const anchor = sr.links.find((l) => l.partition === "anchor");
  t("the jump re-resolves under the declared order: slide2.xml (deck slide 3) -> slide3.xml (deck slide 2)",
    [anchor.source.slide, anchor.target.slide, anchor.target.fragment], [3, 2, "#slide=2"]);
  t("its notes follow their slide's number", sr.evidentiary.items.find((i) => i.kind === "speaker-notes" && i.part.endsWith("notesSlide2.xml")).slide, 3);
}

console.log("\n--- AN UNREADABLE PART IS A STATED UNDETERMINED, NEVER A SILENT PARTIAL ---");
{
  /* notesSlide2 corrupted: the deck still reads; the envelope STATES the
   * unreadable notes by name and reason, and no notes item is invented. */
  const p1 = await entry.parts(pptxFixture({ notes2: { badCrc: true } }));
  const s1 = await entry.structure(p1);
  t("corrupt notes are stated in the envelope",
    s1.evidentiary.undetermined, [{ part: "ppt/notesSlides/notesSlide2.xml", why: "crc_mismatch" }]);
  t("only slide 1's notes item remains — nothing invented for slide 2",
    s1.evidentiary.items.filter((i) => i.kind === "speaker-notes").map((i) => i.slide), [1]);
  const t1 = await entry.text(p1);
  t("text states the unreadable NOTES as notes (the distinction holds even in failure)",
    t1.undetermined, [{ reason: "notes_unreadable", part: "ppt/notesSlides/notesSlide2.xml", why: "crc_mismatch" }]);
  t("the slide text stream is untouched by the notes failure", t1.document.includes("GENERAL PURPOSE FUND OUTLOOK"), true);

  /* slide2.xml itself unreadable: its rels links survive at SLIDE granularity
   * (the .rels name ties them to the slide; no shape is invented), no anchor
   * or jump is conjured without the body, and its NOTES still read. */
  const p2 = await entry.parts(pptxFixture({ slide2: { badCrc: true } }));
  const s2 = await entry.structure(p2);
  t("structure still walks the container", s2.ok, true);
  t("rels links survive at slide granularity — no shape invented",
    s2.links.filter((l) => l.partition === "deferred" || l.partition === "refused").map((l) => l.source),
    [{ kind: "slide-shape", ref: "slide 2", slide: 2 }, { kind: "slide-shape", ref: "slide 2", slide: 2 }, { kind: "slide-shape", ref: "slide 2", slide: 2 }]);
  t("no anchor was conjured without the body", s2.counts.anchor, 0);
  t("the unreadable slide is stated in the envelope",
    s2.evidentiary.undetermined, [{ part: "ppt/slides/slide2.xml", why: "crc_mismatch" }]);
  t("the slide's SPEAKER NOTES still read — the notes outlive the slide (rels-mapped, not body-mapped)",
    s2.evidentiary.items.filter((i) => i.kind === "speaker-notes").map((i) => i.slide), [1, 2]);
  const t2 = await entry.text(p2);
  t("text states the unreadable slide", t2.undetermined, [{ reason: "slide_unreadable", part: "ppt/slides/slide2.xml", why: "crc_mismatch" }]);
  t("the readable slides still stream", t2.slides.map((s) => s.slide), [1, 3]);

  /* an unreadable .rels part: links may be MISSING, and that is said; the
   * orphaned notesSlide still carries its evidence, honestly unnumbered. */
  const p3 = await entry.parts(pptxFixture({ rels2: { badCrc: true } }));
  const s3 = await entry.structure(p3);
  const relsU = s3.links.find((l) => l.partition === "undetermined" && l.target.why === "rels_unreadable");
  t("an unreadable rels part is CARRIED as an undetermined link naming part and reason",
    relsU.target, { why: "rels_unreadable", part: "ppt/slides/_rels/slide2.xml.rels", detail: "crc_mismatch" });
  const orphan = s3.evidentiary.items.find((i) => i.kind === "speaker-notes" && i.part.endsWith("notesSlide2.xml"));
  t("the notes the lost rels once claimed are still emitted — honestly unattributed, never dropped",
    [orphan.slide, orphan.source, orphan.text === NOTES2_TEXT], [null, null, true]);

  /* an unreadable embedding. */
  const p4 = await entry.parts(pptxFixture({ embedding: { badCrc: true } }));
  const s4 = await entry.structure(p4);
  const embU = s4.links.find((l) => l.partition === "undetermined" && l.target.why === "embedded_part_unreadable");
  t("an unreadable embedding is stated with part and reason, not silently dropped",
    embU.target, { why: "embedded_part_unreadable", part: "ppt/embeddings/oleObject1.bin", detail: "crc_mismatch" });
  t("still located to its slide and shape", embU.source, { kind: "slide-shape", ref: "slide 3", slide: 3, shape: 1 });

  /* not a pptx at all. */
  const pz = await entry.parts(PLAIN_ZIP);
  t("a plain zip refuses at parts(): stated, with the container's own verdict",
    [pz.ok, pz.why], [false, "not_pptx:zip"]);
  t("structure passes the refusal through", await entry.structure(pz),
    { ok: false, container: "pptx", reason: "not_pptx:zip" });
  t("arbitrary bytes: not_a_zip", (await entry.parts(new Uint8Array([9, 9, 9, 9, 9, 9]))).why, "not_a_zip");
}

console.log("\n--- the deck-order declaration unreadable: slides UNNUMBERED and SAID so, never numbered off filenames ---");
{
  const p = await entry.parts(pptxFixture({ presentation: { badCrc: true } }));
  const s = await entry.structure(p);
  t("the unreadable declaration is stated in the envelope",
    s.evidentiary.undetermined.some((u) => u.part === "ppt/presentation.xml" && u.why === "crc_mismatch"), true);
  t("and remarked on", s.notes.some((n) => n.includes("UNNUMBERED")), true);
  const tp = await entry.text(p);
  t("text units carry their part with slide:null — honestly unnumbered",
    tp.slides.map((x) => [x.slide, x.ref, x.part.endsWith(".xml")]), [[null, null, true], [null, null, true], [null, null, true]]);
  const legistar = s.links.find((l) => l.partition === "deferred" && l.target.url === LEGISTAR_URL);
  t("no slide-shape reference is INVENTED without a number to stand on", legistar.source, null);
  t("the jump cannot honestly resolve either: stated undetermined, not an invented anchor",
    [s.counts.anchor, s.links.filter((l) => l.target?.why === "slide_unresolved").length], [0, 2]);
  t("speaker notes still carried, unnumbered, their part named",
    s.evidentiary.items.filter((i) => i.kind === "speaker-notes").map((i) => [i.slide, i.source, i.text.length > 0]),
    [[null, null, true], [null, null, true]]);
}

console.log("\n--- the size guard: over the bound -> text-undetermined VERBATIM, never truncation ---");
{
  /* The central directory DECLARES 64 MiB uncompressed for slide1.xml (the
   * COFF-6 metric: declared text-part bytes — slides + notes — summed before
   * inflation). The member is deliberately never read. */
  const big = pptxFixture({ slide1: { lieUncompressed: 64 * 1024 * 1024 } });
  const pb = await entry.parts(big);
  t("parts still ok — the container, rels and presentation walk in full", pb.ok, true);
  const tb = await entry.text(pb);
  t("text refuses as a stated undetermined", tb.document, null);
  t("carrying the guard marker verbatim: why", tb.undetermined[0].why, "over_size_bound");
  /* CORRECTED at integration (CONDUCT, 2026-08-03), the same seam formats-docx
   * hit: this suite branched before COFF-3's enactment of COFF-6 landed, which
   * replaced the provisional 32 MiB container bound with the MEASURED one —
   * 20 MiB of declared uncompressed text-part bytes (MEASUREMENTS.md
   * 2026-08-03). The property under test is unchanged: the marker NAMES its
   * bound so nobody mistakes where the number came from. */
  t("naming the bound constant so nobody mistakes where the number came from",
    tb.undetermined[0].boundName, "MEASURED_OOXML_TEXT_BOUND_BYTES");
  t("counts say one undetermined, zero chars in EITHER stream", tb.counts, { chars: 0, notesChars: 0, undetermined: 1 });
  const sb = await entry.structure(pb);
  t("structure states it in the envelope too, naming the guarded part family",
    sb.evidentiary.undetermined.some((u) => u.why === "over_size_bound" && u.part === "ppt/slides/* + ppt/notesSlides/*"), true);
  t("no speaker-notes item is emitted from parts that were not read",
    sb.evidentiary.items.some((i) => i.kind === "speaker-notes"), false);
  t("rels links still emitted at slide granularity: 2 deferred + 1 refused",
    [sb.counts.deferred, sb.counts.refused], [2, 1]);
}

console.log("\n--- the walker holds its own doctrine ---");
{
  const w = walkSlide(SLIDE2_XML);
  t("every shape element advances the 0-based shape sequence", w.shapes, 2);
  t("hlinkClick usages carry rid and shape", w.hlinks, [
    { rid: "rId2", shape: 1 }, { rid: "rId3", shape: 1 }, { rid: "rId4", shape: 1 }, { rid: "rId6", shape: 1 },
  ]);
  const w3 = walkSlide(SLIDE3_XML);
  t("a graphicFrame is a shape; rid usage locates the OLE object to it", w3.ridUsage.get("rId2"), 1);
  t("its three shapes count (sp, graphicFrame, sp)", w3.shapes, 3);
  t("slideShapeRef omits shape when the slide is the honest granularity",
    slideShapeRef(2), { kind: "slide-shape", ref: "slide 2", slide: 2 });
  t("and carries it when the reference genuinely targets a shape",
    slideShapeRef(2, 0), { kind: "slide-shape", ref: "slide 2", slide: 2, shape: 0 });
  t("entities in run text decode", walkSlide(`<p:sld ${P} ${A}><p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>Beats &amp; Measures</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`).text,
    "Beats & Measures");
}

console.log(`\nformats-pptx: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
