/* The three OpenDocument registry entries (QUEUE COFF-10) — `.odt`, `.ods`,
 * `.odp` — driven against packages BUILT HERE, hermetically, by the same
 * byte-by-byte ZIP assembler `ooxml.test.mjs` and the three OOXML entry
 * suites use. No binary is committed and the suite must pass on a machine
 * with no office suite, which is every machine the plane runs on.
 *
 * THE FIXTURES ARE HAND-BUILT AND VERIFIED AGAINST A REAL PRODUCER, which is
 * the only reason they can be trusted. On 2026-09-14 LibreOffice 26.8.0.3
 * (`/opt/homebrew/bin/soffice`) produced a real `.odt`, `.ods` and `.odp`
 * carrying every construct asserted below — a hyperlink, tracked insertion
 * and deletion, an annotation, a formula beside its value, a hidden sheet, a
 * hidden slide, speaker notes — and each was read back through THESE ENTRIES.
 * The grammar here is copied from that output, not from the spec, and the
 * differences that measurement forced are marked `MEASURED` at their site.
 * The figures are in MEASUREMENTS.md, 2026-09-14, COFF-10.
 *
 * WHAT THE FIXTURES CANNOT SEE, stated rather than implied: one producer, one
 * version, one platform. GOOGLE DRIVE'S OWN ODF EXPORT — the source Bob's
 * 2026-09-14 ruling actually points these entries at — was NOT reachable from
 * this session and is NOT measured. CAP-8 meets it first and should re-verify
 * this grammar against a real Drive export rather than inherit it.
 *
 * THE ACCEPTS-WHEN CASES, all present:
 *   - each entry detects its fixture BY BYTES (certain, from the first-and-
 *     stored mimetype VALUE) and BY CONTENT TYPE (likely), through the
 *     registry's own two passes
 *   - each emits I2 structure with element references of the RIGHT IC-1 union
 *     member — sheet-cell / doc-para / slide-shape — and no new member
 *   - wrappers byte-identical to subresources.mjs's ONE linkWrapper (the
 *     HTML/PDF/OOXML parity pin)
 *   - the DEC-5 extras content.xml CARRIES, emitted under the IC-2 envelope
 *     with the SAME kind names the OOXML siblings use
 *   - the DEC-5 extras content.xml CANNOT carry, STATED as named
 *     undetermineds rather than left to be inferred from an absent item
 *   - adding a format cost ONE registerFormat call each: index.mjs is grepped
 *     for the three names and must carry NONE (the D-70 property)
 */
/* NEGATIVE CONTROL: five arms, each armed ALONE with the others held open, plus a baseline row. (1) CONTENT.XML REMOVED, per entry — DRIVEN here rather than patched, because the required behaviour is a STATED absence and not a crash: `odfFixture(f, {omitContent:true})` must give `parts.ok === false` with `why === "declared_main_part_absent"` AND `part === "content.xml"` AND `flavourDeclared === f`, and structure()/text() must answer `ok:false` carrying that reason — never an empty structure. RUN 2026-09-14: passes. (2) WRONG FLAVOUR TO EACH ENTRY — also DRIVEN: handing the `.ods` package to the `.odt` entry must refuse by name (`not_odt:ods`), and so for all six cross pairs. RUN 2026-09-14: passes. (3) THE ARM'S OWN ARM — UNREGISTER ONE ENTRY: `unregisterFormat("ods")` then re-assert detection. MUST FAIL: the detect assertions for `.ods` by bytes and by content type. MUST NOT FAIL: `.odt` and `.odp`, which are independent entries. RUN 2026-09-14 in-process at the foot of this suite, restoring by `registerFormat` with the exact entry `unregisterFormat` returned — 2 of 2 armed assertions failed by name, 0 of the other two entries' 8 moved. (4) OVER-STRICTNESS, the OOXML entries: `docx`/`xlsx`/`pptx` structure+text over their own fixtures must be byte-identical to the pre-item run, captured from a pristine `origin/main` worktree at `d791aa7` and COMPARED by sha256, not eyeballed — this item exports `sheetCellRef` from `formats-xlsx.mjs`, and that export must move nothing. RUN 2026-09-14: identical, digest in MEASUREMENTS.md. (5) OVER-STRICTNESS, the spellings this item did not anticipate: `table:display="false"` written on the `<table:table>` ELEMENT rather than on its style, and `presentation:visibility="hidden"` written on `<draw:page>` rather than on its drawing-page style — both are correct OpenDocument a producer may emit, and both must be READ, not refused. RUN 2026-09-14: passes. */

/* NEGATIVE CONTROL, COFF-11 (IC-100 / D-359) — SEVEN arms and a baseline, each armed ALONE with every other defence held open, re-runnable in one step with `node test/nc-coff11.mjs [arm]` from `bio-plane/`. RUN 2026-09-15, ALL SEVEN AS DECLARED, every restore verified byte-identically by sha256 AND by content with a byte count printed: `src/formats-xlsx.mjs` 33,691 B sha256 c5855053f670…, `src/pptx.mjs` 37,442 B sha256 1708977ce689…, `src/odf.mjs` 64,000 B sha256 08f4709dde58…. baseline xlsx 88/0 · pptx 116/0 · odf 140/0 · e2e 31/0 GREEN; dropxlsxbound 4/4 declared (5 failing across two suites); dropslideshapes 5/5 (6); dropodpshapes 2/2 (3); dropxlsxboundunread 1/1 (1); usedrangeasbound 4/4 (4); odsborrowsgrid 3/3 (3). TWO CAME BACK WRONG ON THE FIRST RUN AND ARE RECORDED AT THEIR SITES RATHER THAN SMOOTHED, and both were findings about the INSTRUMENT: (1) `dropxlsxbound` declared the DISAGREE assertion and it did NOT fire, because its first spelling (`rows === usedRows` expected false) is satisfied by a NULL bound too — the ASSERTION was too weak and was strengthened to require both figures be integers, which is the arm doing better than going red; (2) both xlsx arms declared the UNREAD-SHEET bound, which neither patch reaches — `xlsxText` emits the sheet object at TWO independent sites, and the seventh arm `dropxlsxboundunread` now covers the second rather than leaving it covered by nobody. AND ONE SURPRISING GREEN, kept because it is the more useful result: under `usedrangeasbound` the END-TO-END suite stayed green at 31/0 — not the arm failing but the measurement that the e2e suite cannot see this bound AT ALL today, because the acquire wire drops the producer's figure before the store reads it (D-359's residue, DELEGATED 2026-09-15). */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync } from "node:fs";
import { deflateRawSync } from "node:zlib";
import { detectFormat, getFormat, listFormats, registerFormat, unregisterFormat } from "../src/formats.mjs";
import {
  odtEntry, odsEntry, odpEntry,
  ODT_CONTENT_TYPE, ODS_CONTENT_TYPE, ODP_CONTENT_TYPE,
} from "../src/odf.mjs";
import { linkWrapper } from "../src/subresources.mjs";
/* COFF-11: the cross-format roster pin at the foot of this suite needs the
 * SIBLING spreadsheet entry, because the claim IC-100 rests on is that ONE
 * consumer reads both containers by key presence. Imported here rather than
 * asserted in prose in two files that could drift apart silently. */
import { xlsxEntry } from "../src/formats-xlsx.mjs";
import { ODF_FLAVOURS, MEASURED_OOXML_TEXT_BOUND_BYTES } from "../src/ooxml.mjs";

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

/* ---- independent crc32 + zip assembler (the ooxml.test.mjs pattern: the
 * fixture builder must not inherit a defect from the module under test) ---- */
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
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf-8");
    const method = f.store ? 0 : 8;
    const comp = method === 8 ? deflateRawSync(data) : data;
    const crc = crc32(data);
    const local = Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0), u32le(0), u32le(offset), nameB,
    ]);
    locals.push(local); centrals.push(central); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([
    u32le(0x06054b50), u16le(0), u16le(0), u16le(files.length), u16le(files.length),
    u32le(cd.length), u32le(offset), u16le(0),
  ]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

/* ================================================================== *
 * The three content.xml bodies, modelled on the real Oakland corpus and
 * copied in grammar from real LibreOffice 26.8.0.3 output
 * ================================================================== */

const NS = [
  'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"',
  'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"',
  'xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"',
  'xmlns:presentation="urn:oasis:names:tc:opendocument:xmlns:presentation:1.0"',
  'xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"',
  'xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0"',
  'xmlns:dc="http://purl.org/dc/elements/1.1/"',
  'xmlns:xlink="http://www.w3.org/1999/xlink"',
].join(" ");

const doc = (automatic, body) =>
  `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${NS} office:version="1.3">`
  + `<office:automatic-styles>${automatic}</office:automatic-styles>`
  + `<office:body>${body}</office:body></office:document-content>`;

/* ---- .odt: a budget memo with a heading, a hyperlink, an annotation, and a
 * tracked insertion and deletion. MEASURED: LibreOffice writes the
 * `<text:tracked-changes>` declaration block FIRST inside `<office:text>`,
 * with each region's wording for a deletion and only the change-info for an
 * insertion; the body then carries change-start/change-end around inserted
 * text and a bare `<text:change/>` where a deletion was taken from. ---- */
const ODT_BODY = `<office:text>`
  + `<text:tracked-changes>`
  + `<text:changed-region xml:id="ct1" text:id="ct1"><text:insertion>`
  + `<office:change-info><dc:creator>B Editor</dc:creator><dc:date>2026-09-14T11:00:00</dc:date></office:change-info>`
  + `</text:insertion></text:changed-region>`
  + `<text:changed-region xml:id="ct2" text:id="ct2"><text:deletion>`
  + `<office:change-info><dc:creator>A Reviewer</dc:creator><dc:date>2026-09-14T10:00:00</dc:date></office:change-info>`
  + `<text:p>The reserve will be drawn down.</text:p>`
  + `</text:deletion></text:changed-region>`
  + `</text:tracked-changes>`
  + `<text:h text:outline-level="1">Oakland Budget Notes</text:h>`
  + `<text:p>The first paragraph states the appropriation.`
  + `<office:annotation office:name="__Annotation__1"><dc:creator>C Commenter</dc:creator><dc:date>2026-09-14T12:00:00</dc:date>`
  + `<text:p>Check this figure against the adopted budget.</text:p></office:annotation></text:p>`
  + `<text:p>A second paragraph carries a link to `
  + `<text:a xlink:type="simple" xlink:href="https://www.oaklandca.gov/budget">the budget page</text:a>`
  + ` and a contact at <text:a xlink:href="mailto:budget@oaklandca.gov">the budget office</text:a>`
  + ` and an internal jump to <text:a xlink:href="#Totals">the totals</text:a>.</text:p>`
  + `<text:p><text:change-start text:change-id="ct1"/>An inserted sentence stands here.<text:change-end text:change-id="ct1"/>`
  + `<text:change text:change-id="ct2"/> A third paragraph closes the memo.</text:p>`
  + `</office:text>`;
const ODT_CONTENT = doc("", ODT_BODY);

/* ---- .ods: an appropriations workbook — cells, a SUM formula beside its
 * cached value, a hyperlink in a cell, a hidden ROW, a hidden COLUMN, and a
 * HIDDEN SHEET. MEASURED: LibreOffice writes sheet hiddenness on the table's
 * STYLE (`<style:table-properties table:display="false"/>`) in
 * content.xml's own automatic styles, never on `<table:table>`; a producer
 * may do either and arm (5) below pins that both are read. ---- */
const ODS_AUTOMATIC =
  `<style:style style:name="ta1" style:family="table"><style:table-properties table:display="true"/></style:style>`
  + `<style:style style:name="ta2" style:family="table"><style:table-properties table:display="false"/></style:style>`;
const ODS_BODY = `<office:spreadsheet>`
  + `<table:table table:name="Appropriations" table:style-name="ta1">`
  + `<table:table-column/><table:table-column table:visibility="collapse"/>`
  + `<table:table-row>`
  + `<table:table-cell office:value-type="string"><text:p>Department</text:p></table:table-cell>`
  + `<table:table-cell office:value-type="string"><text:p>Amount</text:p></table:table-cell>`
  + `</table:table-row>`
  + `<table:table-row>`
  + `<table:table-cell office:value-type="string"><text:p>`
  + `<text:a xlink:href="https://www.oaklandca.gov/police-budget">Police</text:a></text:p></table:table-cell>`
  + `<table:table-cell office:value-type="float" office:value="100"><text:p>100</text:p></table:table-cell>`
  + `</table:table-row>`
  + `<table:table-row table:visibility="collapse">`
  + `<table:table-cell office:value-type="string"><text:p>Fire</text:p></table:table-cell>`
  + `<table:table-cell office:value-type="float" office:value="50"><text:p>50</text:p></table:table-cell>`
  + `</table:table-row>`
  + `<table:table-row>`
  + `<table:table-cell office:value-type="string"><text:p>Total</text:p></table:table-cell>`
  + `<table:table-cell table:formula="of:=SUM([.B2:.B3])" office:value-type="float" office:value="150">`
  + `<text:p>150</text:p></table:table-cell>`
  + `</table:table-row>`
  + `</table:table>`
  + `<table:table table:name="Reconciliation" table:style-name="ta2">`
  + `<table:table-row><table:table-cell office:value-type="string"><text:p>internal note</text:p></table:table-cell></table:table-row>`
  + `</table:table>`
  + `</office:spreadsheet>`;
const ODS_CONTENT = doc(ODS_AUTOMATIC, ODS_BODY);

/* ---- .odp: a three-slide deck — shapes with text, a hyperlink on a shape,
 * SPEAKER NOTES, and a HIDDEN slide. MEASURED: LibreOffice writes slide
 * hiddenness as `presentation:visibility="hidden"` on the page's
 * drawing-page style in automatic styles, and nests `<presentation:notes>`
 * inside the `<draw:page>` it belongs to. ---- */
const ODP_AUTOMATIC =
  `<style:style style:name="dp1" style:family="drawing-page"><style:drawing-page-properties presentation:visibility="visible"/></style:style>`
  + `<style:style style:name="dp3" style:family="drawing-page"><style:drawing-page-properties presentation:visibility="hidden"/></style:style>`;
const ODP_BODY = `<office:presentation>`
  + `<draw:page draw:name="Opening" draw:style-name="dp1">`
  + `<draw:frame><draw:text-box><text:p>Budget Overview</text:p></draw:text-box></draw:frame>`
  + `<draw:frame><draw:text-box><text:p>First bullet on the opening slide</text:p>`
  + `<text:p>Second bullet with a link to <text:a xlink:href="https://www.oaklandca.gov/deck">the source</text:a></text:p>`
  + `</draw:text-box></draw:frame>`
  + `<presentation:notes><draw:frame><draw:text-box>`
  + `<text:p>Speaker note: do not mention the reserve.</text:p></draw:text-box></draw:frame></presentation:notes>`
  + `</draw:page>`
  + `<draw:page draw:name="Reserve" draw:style-name="dp3">`
  + `<draw:frame><draw:text-box><text:p>Reserve detail, not shown</text:p></draw:text-box></draw:frame>`
  + `</draw:page>`
  + `<draw:page draw:name="Closing" draw:style-name="dp1">`
  + `<draw:frame><draw:text-box><text:p>Questions</text:p></draw:text-box></draw:frame>`
  + `</draw:page>`
  + `</office:presentation>`;
const ODP_CONTENT = doc(ODP_AUTOMATIC, ODP_BODY);

const ODF_MIME = {
  odt: "application/vnd.oasis.opendocument.text",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odp: "application/vnd.oasis.opendocument.presentation",
};
const CONTENT_FOR = { odt: ODT_CONTENT, ods: ODS_CONTENT, odp: ODP_CONTENT };
const ENTRY = { odt: odtEntry, ods: odsEntry, odp: odpEntry };
const CT = { odt: ODT_CONTENT_TYPE, ods: ODS_CONTENT_TYPE, odp: ODP_CONTENT_TYPE };

/* ODF meta.xml — present in the package and DELIBERATELY NOT READ. It carries
 * a creator the entries must NOT surface, which is what makes the "core
 * properties live outside content.xml" assertion below mean something: the
 * fact is THERE and the entry still says it did not look. */
const ODF_META = `<?xml version="1.0"?><office:document-meta ${NS}><office:meta>`
  + `<dc:creator>M. Analyst</dc:creator><dc:title>FY27 Midcycle Amendment</dc:title>`
  + `<meta:editing-cycles>14</meta:editing-cycles></office:meta></office:document-meta>`;

const manifestXml = (mime) => `<?xml version="1.0" encoding="UTF-8"?>`
  + `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
  + `<manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="${mime}"/>`
  + `<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>`
  + `<manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>`
  + `</manifest:manifest>`;

/** Options: `omitContent` drops content.xml (control arm 1); `content`
 *  substitutes a body (arms 5 and the size-bound case); `extra` appends. */
const odfFixture = (flavour, o = {}) => {
  const mime = ODF_MIME[flavour];
  return zip([
    { name: "mimetype", data: mime, store: true },
    { name: "META-INF/manifest.xml", data: manifestXml(mime) },
    ...(o.omitContent ? [] : [{ name: "content.xml", data: o.content ?? CONTENT_FOR[flavour] }]),
    { name: "meta.xml", data: ODF_META },
    { name: "styles.xml", data: `<?xml version="1.0"?><office:document-styles ${NS}/>` },
    ...(o.extra ?? []),
  ]);
};

/* ================================================================== */
console.log("\n--- the registry carries three more entries, and that is the WHOLE cost (D-70) ---");
{
  /* CORRECTED by FW-23, 2026-09-24: this read `listFormats().slice(-3)`, the
     LAST three entries, which said what it meant only while ODF happened to be
     the last thing registered. The ninth entry (`csv`) turned it into a claim
     about registration RECENCY, and what it is for is TABLE ORDER — the three
     sitting immediately after the OOXML entries. Anchored on `pptx` instead, so
     a tenth format cannot make it wrong again. */
  const roster = listFormats();
  t("all three are registered, in table order after the OOXML entries",
    roster.slice(roster.indexOf("pptx") + 1, roster.indexOf("pptx") + 4), ["odt", "ods", "odp"]);
  t("each is reachable by name through the registry",
    ["odt", "ods", "odp"].map((f) => getFormat(f) === ENTRY[f]), [true, true, true]);
  t("each fills all four I7 slots (no null slot: ODF is its own container walk AND its own text)",
    ["odt", "ods", "odp"].map((f) => ["detect", "parts", "structure", "text"]
      .every((s) => typeof getFormat(f)[s] === "function")), [true, true, true]);

  /* THE D-70 PROPERTY, DRIVEN AND NOT ASSERTED: adding a format costs one
   * registerFormat call in formats.mjs and NOTHING anywhere else. The control
   * plane must never have learned these names. */
  const indexSrc = readFileSync(new URL("../src/index.mjs", import.meta.url), "utf-8");
  t("index.mjs names none of the three formats — the registry is the only dispatch",
    ["odt", "ods", "odp"].filter((f) => new RegExp(`["'\`]${f}["'\`]`).test(indexSrc)), []);
  const formatsSrc = readFileSync(new URL("../src/formats.mjs", import.meta.url), "utf-8");
  t("formats.mjs registers each exactly once",
    ["odtEntry", "odsEntry", "odpEntry"].map((e) =>
      (formatsSrc.match(new RegExp(`registerFormat\\(${e}\\)`, "g")) ?? []).length), [1, 1, 1]);

  /* The entries take their facts from COFF-9's TABLE, never from a literal
   * spelled again — so discriminator and entry cannot drift. */
  t("each entry's content type IS its ODF_FLAVOURS row's mimetype",
    [ODT_CONTENT_TYPE, ODS_CONTENT_TYPE, ODP_CONTENT_TYPE],
    ODF_FLAVOURS.map((f) => f.mimetype));
  t("and there are exactly three such rows to project", ODF_FLAVOURS.length, 3);
}

/* ================================================================== */
console.log("\n--- detect: BY BYTES (certain, from the read mimetype VALUE) then BY CONTENT TYPE (likely) ---");
for (const flavour of ["odt", "ods", "odp"]) {
  const bytes = odfFixture(flavour);

  const byBytes = detectFormat(bytes, null);
  t(`${flavour}: the registry's BYTES pass answers ${flavour}`, byBytes.format, flavour);
  /* CERTAIN, unlike the OOXML entries' "likely" — and the difference is not
     a liberty taken: the discriminating declaration was actually READ (first
     member, stored, CRC-verified, compared exactly), where OOXML's is
     deflated out of a synchronous detect's reach. */
  t(`${flavour}: with CERTAIN confidence, because the mimetype value was read`,
    byBytes.confidence, "certain");
  t(`${flavour}: and says so in signals`,
    byBytes.signals.some((s) => s.includes(`odf:mimetype=${ODF_MIME[flavour]}`)), true);

  const byCt = detectFormat(null, CT[flavour]);
  t(`${flavour}: the CONTENT-TYPE pass answers ${flavour}`, byCt.format, flavour);
  t(`${flavour}: at most LIKELY — a declared type is a claim (I7)`, byCt.confidence, "likely");

  /* Magic-bytes-first is the REGISTRY's property, and it must hold here too:
     the bytes win over a contradicting declared type. */
  t(`${flavour}: bytes OUTRANK a contradicting content type`,
    detectFormat(bytes, "text/html").format, flavour);
}
{
  /* The acquire-time 1 KiB seam: a bare PK prefix has no central directory,
     so no entry may claim an OpenDocument from it. */
  const prefix = odfFixture("odt").subarray(0, 1024);
  t("a 1 KiB PREFIX claims nothing — a renamed plain ZIP is not an .odt",
    [odtEntry.detect(prefix, null), odsEntry.detect(prefix, null), odpEntry.detect(prefix, null)],
    [null, null, null]);
  /* A plain ZIP: no entry claims it, and the REGISTRY answers a STATED
     `undetermined` (I7) — not "zip". `ooxml.mjs`'s `discriminate()` does say
     `zip`, and that is a CONTAINER-tier determination with no registry entry
     behind it; conflating the two would read the registry as knowing a format
     it does not have. Both halves are asserted so the distinction is pinned
     rather than assumed. */
  const plain = zip([{ name: "readme.txt", data: "Meeting minutes, plain text." }]);
  t("no ODF entry claims a plain ZIP",
    [odtEntry.detect(plain, null), odsEntry.detect(plain, null), odpEntry.detect(plain, null)],
    [null, null, null]);
  t("and the REGISTRY answers a stated undetermined, never a guess (I7)",
    [detectFormat(plain, null).format, detectFormat(plain, null).confidence],
    ["undetermined", "none"]);
}

/* ================================================================== */
console.log("\n--- .odt: docx.mjs's shape, doc-para references, tracked changes and comments ---");
{
  const bytes = odfFixture("odt");
  const parts = await odtEntry.parts(bytes);
  t("parts read content.xml", parts.ok, true);
  const st = await odtEntry.structure(parts);
  const tx = await odtEntry.text(parts);

  t("container is odt", st.container, "odt");
  /* The tracked-changes DECLARATION block holds the deleted paragraph. It is
     NOT in the document as served, so it must not shift the ¶ sequence. */
  t("four body paragraphs — the heading counts, the DELETED region does not", st.paragraphs, 4);
  t("text.paragraphs is the pageless degenerate form, ¶-referenced (IC-2)",
    tx.paragraphs.map((p) => p.ref), ["¶1", "¶2", "¶3", "¶4"]);
  t("the heading is paragraph 1 — ODF's text:h is a paragraph-level element",
    tx.paragraphs[0].text, "Oakland Budget Notes");
  t("the SUPERSEDED wording is NOT in the text stream (the docx w:delText rule)",
    tx.document.includes("The reserve will be drawn down."), false);
  t("the INSERTED wording IS in the text stream — it is the document as served",
    tx.document.includes("An inserted sentence stands here."), true);
  t("the ANNOTATION's own text is NOT in the paragraph it annotates",
    tx.paragraphs[1].text, "The first paragraph states the appropriation.");
  t("counts: chars and no undetermined", [tx.counts.chars, tx.counts.undetermined],
    [tx.document.length, 0]);

  const external = st.links.find((l) => l.target.url === "https://www.oaklandca.gov/budget");
  t("the external hyperlink is DEFERRED", external.partition, "deferred");
  t("wrapped by the ONE linkWrapper, byte-identical (the HTML/PDF parity pin)",
    external.wrapper, linkWrapper.deferred("https://www.oaklandca.gov/budget"));
  t("and carries an IC-1 doc-para source — no new union member",
    external.source, { kind: "doc-para", ref: "¶3", para: 2 });
  const mailto = st.links.find((l) => l.target.url === "mailto:budget@oaklandca.gov");
  t("a mailto is REFUSED — the same partition rule HTML, PDF and DOCX apply",
    [mailto.partition, mailto.wrapper], ["refused", linkWrapper.refused()]);
  const anchor = st.links.find((l) => l.partition === "anchor");
  t("a bare fragment is an ANCHOR, final at capture",
    [anchor.target.fragment, anchor.wrapper], ["#Totals", linkWrapper.anchor("#Totals")]);
  t("partition counts", st.counts, { anchor: 1, intra: 0, deferred: 1, refused: 1, undetermined: 0 });

  /* DEC-5, under IC-2's envelope, with the SAME kind names docx.mjs emits. */
  t("the envelope names its container and kinds",
    [st.evidentiary.container, st.evidentiary.kinds.sort()],
    ["odt", ["comment", "tracked-change"]]);
  const ins = st.evidentiary.items.find((i) => i.change === "insertion");
  t("the INSERTION carries author, date, its wording, and its paragraph",
    [ins.kind, ins.author, ins.date, ins.text, ins.source],
    ["tracked-change", "B Editor", "2026-09-14T11:00:00", "An inserted sentence stands here.",
      { kind: "doc-para", ref: "¶4", para: 3 }]);
  const del = st.evidentiary.items.find((i) => i.change === "deletion");
  t("the DELETION carries the SUPERSEDED WORDING, which no rendered form keeps",
    [del.author, del.date, del.superseded, del.source],
    ["A Reviewer", "2026-09-14T10:00:00", "The reserve will be drawn down.",
      { kind: "doc-para", ref: "¶4", para: 3 }]);
  t("a deletion carries no `text` field and an insertion no `superseded` — never both",
    [del.text, ins.superseded], [undefined, undefined]);
  const com = st.evidentiary.items.find((i) => i.kind === "comment");
  t("the COMMENT is located to the paragraph it annotates, inline",
    [com.author, com.date, com.text, com.source],
    ["C Commenter", "2026-09-14T12:00:00", "Check this figure against the adopted budget.",
      { kind: "doc-para", ref: "¶2", para: 1 }]);
  t("initials is NULL, never invented — ODF has the field and this producer omits it",
    com.initials, null);
}

/* ================================================================== */
console.log("\n--- .ods: formats-xlsx.mjs's shape, sheet-cell references, formulas beside values ---");
{
  const bytes = odfFixture("ods");
  const parts = await odsEntry.parts(bytes);
  const st = await odsEntry.structure(parts);
  const tx = await odsEntry.text(parts);

  t("container is ods", st.container, "ods");
  t("two sheets, the second FLAGGED hidden (from its style — where a real producer writes it)",
    st.sheets,
    [{ sheet: 0, name: "Appropriations", sheetId: null, state: "visible", hidden: false },
      { sheet: 1, name: "Reconciliation", sheetId: null, state: "hidden", hidden: "hidden" }]);
  t("sheetId is NULL because ODF HAS no numeric sheet id — the format speaking, not a gap",
    st.sheets.every((s) => s.sheetId === null), true);

  const cellLink = st.links.find((l) => l.target.url === "https://www.oaklandca.gov/police-budget");
  t("a hyperlink inside a CELL is deferred and wrapped identically",
    [cellLink.partition, cellLink.wrapper],
    ["deferred", linkWrapper.deferred("https://www.oaklandca.gov/police-budget")]);
  t("and carries an IC-1 sheet-cell source, addressed through the repeat runs",
    cellLink.source, { kind: "sheet-cell", ref: "Appropriations!A2", sheet: "Appropriations", cell: "A2" });

  const formula = st.evidentiary.items.find((i) => i.kind === "formula");
  t("the FORMULA is held BESIDE its cached value — TWO named fields on one item",
    [formula.formula, formula.value], ["of:=SUM([.B2:.B3])", "150"]);
  t("the formula is carried VERBATIM, OpenFormula's of: prefix included — never rewritten",
    formula.formula.startsWith("of:="), true);
  t("located to the cell that carries it", formula.source,
    { kind: "sheet-cell", ref: "Appropriations!B4", sheet: "Appropriations", cell: "B4" });
  t("never collapsed: the TEXT stream shows the VALUE and not the formula",
    [tx.document.includes("150"), tx.document.includes("SUM")], [true, false]);

  const hiddenSheet = st.evidentiary.items.find((i) => i.kind === "hidden-sheet");
  t("the hidden SHEET is a first-class finding (source null — workbook-scoped, stated)",
    hiddenSheet, { kind: "hidden-sheet", sheet: "Reconciliation", state: "hidden", source: null });
  const hRows = st.evidentiary.items.find((i) => i.kind === "hidden-rows");
  t("a hidden ROW is flagged with its 1-based number", [hRows.sheet, hRows.rows], ["Appropriations", [3]]);
  const hCols = st.evidentiary.items.find((i) => i.kind === "hidden-cols");
  t("a hidden COLUMN is flagged with its span and ODF's own visibility word",
    [hCols.sheet, hCols.cols], ["Appropriations", [{ min: 2, max: 2, visibility: "collapse" }]]);

  t("the hidden sheet's text IS extracted and the unit carries the flag (the xlsx precedent)",
    tx.sheets.map((s) => [s.name, s.hidden, s.text.length > 0]),
    [["Appropriations", false, true], ["Reconciliation", "hidden", true]]);
  t("counts: cells and formulas", [tx.counts.cells, tx.counts.formulas, tx.counts.undetermined],
    [9, 1, 0]);
}

/* ================================================================== */
console.log("\n--- .odp: pptx.mjs's shape, slide-shape references, speaker notes kept APART ---");
{
  const bytes = odfFixture("odp");
  const parts = await odpEntry.parts(bytes);
  const st = await odpEntry.structure(parts);
  const tx = await odpEntry.text(parts);

  t("container is odp", st.container, "odp");
  /* Unlike PPTX, the deck order needs no indirection: <draw:page> elements
     are in presentation order inside the one content.xml. */
  t("three slides, numbered 1-based off the DECLARED page order", st.slides, 3);
  t("every slide unit carries its ref and the one part it came from",
    tx.slides.map((s) => [s.slide, s.ref, s.part]),
    [[1, "slide 1", "content.xml"], [2, "slide 2", "content.xml"], [3, "slide 3", "content.xml"]]);

  const link = st.links.find((l) => l.target.url === "https://www.oaklandca.gov/deck");
  t("a hyperlink on a shape is deferred and wrapped identically",
    [link.partition, link.wrapper], ["deferred", linkWrapper.deferred("https://www.oaklandca.gov/deck")]);
  t("and carries an IC-1 slide-shape source with the 0-based shape index",
    link.source, { kind: "slide-shape", ref: "slide 1", slide: 1, shape: 1 });

  const notes = st.evidentiary.items.find((i) => i.kind === "speaker-notes");
  t("SPEAKER NOTES are their own envelope kind, located to their slide",
    [notes.slide, notes.text, notes.source],
    [1, "Speaker note: do not mention the reserve.", { kind: "slide-shape", ref: "slide 1", slide: 1 }]);
  t("and their own TEXT unit, ref'd 'slide N (notes)'",
    tx.speakerNotes.map((n) => [n.slide, n.ref]), [[1, "slide 1 (notes)"]]);
  t("NEVER in `document`, and counted APART so no indexer conflates the streams",
    [tx.document.includes("do not mention the reserve"), tx.counts.notesChars],
    [false, "Speaker note: do not mention the reserve.".length]);

  const hidden = st.evidentiary.items.find((i) => i.kind === "hidden-slide");
  t("the HIDDEN slide is a first-class finding naming its slide",
    [hidden.slide, hidden.part], [2, "content.xml"]);
  t("it is extracted IN FULL and flagged on the unit — not omitted",
    tx.slides.map((s) => [s.slide, s.hidden, s.text]),
    [[1, false, "Budget Overview\nFirst bullet on the opening slide\nSecond bullet with a link to the source"],
      [2, true, "Reserve detail, not shown"],
      [3, false, "Questions"]]);
  t("and its text IS in `document` — the record holds what the file holds",
    tx.document.includes("Reserve detail, not shown"), true);
}

/* ================================================================== */
console.log("\n--- the DEC-5 extras content.xml CANNOT supply, STATED on every entry ---");
for (const flavour of ["odt", "ods", "odp"]) {
  const st = await ENTRY[flavour].structure(odfFixture(flavour));
  const u = st.evidentiary.undetermined;

  /* THE POINT OF THIS SECTION: the fixture's meta.xml DOES carry a creator
     and a title. The entry reads one part, does not see them, and SAYS SO —
     rather than emitting no core-properties item and letting a consumer read
     that silence as "this document has no author". CLAUDE.md: absence at one
     level is not evidence of absence at the next. */
  t(`${flavour}: no core-properties item is emitted`,
    st.evidentiary.items.some((i) => i.kind === "core-properties"), false);
  t(`${flavour}: and meta.xml is NAMED as not read, so the silence is not mistaken for a fact`,
    u.some((x) => x.part === "meta.xml" && x.why === "outside_content_xml_not_read"), true);
  t(`${flavour}: META-INF/manifest.xml is NAMED too — a zero intra count means NOT LOOKED`,
    [st.counts.intra,
      u.some((x) => x.part === "META-INF/manifest.xml" && x.why === "outside_content_xml_not_read")],
    [0, true]);
  t(`${flavour}: and notes[] carries the same fact, so either surface meets it`,
    st.notes.some((n) => n.includes("no intra link is emitted")), true);
  t(`${flavour}: both markers carry a detail saying what would have been there`,
    u.filter((x) => x.why === "outside_content_xml_not_read").every((x) => typeof x.detail === "string" && x.detail.length > 40),
    true);
}

/* ================================================================== */
console.log("\n--- the measured size bound (COFF-6), enacted on content.xml ---");
{
  /* A content.xml whose DECLARED uncompressed size is over the bound. The
     container walk and discrimination still run; text is refused as a STATED
     marker carrying the guard's own fields verbatim, never truncated. */
  const big = `<?xml version="1.0"?><office:document-content ${NS}><office:body><office:text><text:p>`
    + "x".repeat(MEASURED_OOXML_TEXT_BOUND_BYTES + 1) + `</text:p></office:text></office:body></office:document-content>`;
  const bytes = odfFixture("odt", { content: big });
  const parts = await odtEntry.parts(bytes);
  t("the package still discriminates as odt", parts.ok, true);
  t("and the guard fired, naming the metric and the bound's NAME",
    [parts.guard.why, parts.guard.boundName, parts.guard.metric],
    ["over_size_bound", "MEASURED_OOXML_TEXT_BOUND_BYTES", "declared_uncompressed_text_part_bytes"]);
  const tx = await odtEntry.text(parts);
  t("text() carries the marker VERBATIM and extracts nothing",
    [tx.ok, tx.document, tx.paragraphs, tx.undetermined[0].why, tx.counts.chars],
    [true, null, [], "over_size_bound", 0]);
  const st = await odtEntry.structure(parts);
  t("structure() is honest that the paragraph count is unknown, and says why",
    [st.paragraphs, st.notes.some((n) => n.includes("over the size bound"))], [null, true]);
  t("and the envelope states the over-bound part by name",
    st.evidentiary.undetermined.some((x) => x.part === "content.xml" && x.why === "over_size_bound"), true);
}

/* ================================================================== */
console.log("\n--- NEGATIVE CONTROL arm (1), DRIVEN: content.xml REMOVED -> the absence is named ---");
for (const flavour of ["odt", "ods", "odp"]) {
  const bytes = odfFixture(flavour, { omitContent: true });
  const parts = await ENTRY[flavour].parts(bytes);
  t(`${flavour}: parts REFUSES rather than walking a package it cannot read`, parts.ok, false);
  t(`${flavour}: naming the reason AND the part — "content.xml is absent", not a lookup exercise`,
    [parts.why, parts.part], ["declared_main_part_absent", "content.xml"]);
  t(`${flavour}: and carrying what the mimetype DID declare, so the finding is diagnosable`,
    parts.flavourDeclared, flavour);
  const st = await ENTRY[flavour].structure(bytes);
  const tx = await ENTRY[flavour].text(bytes);
  t(`${flavour}: structure() is ok:FALSE with the reason — NEVER an empty structure`,
    [st.ok, st.container, st.reason, st.part],
    [false, flavour, "declared_main_part_absent", "content.xml"]);
  t(`${flavour}: text() likewise — an empty document would claim the file has no text`,
    [tx.ok, tx.reason, tx.part], [false, "declared_main_part_absent", "content.xml"]);
  /* The over-strictness half of this arm: the SAME package WITH content.xml
     must be read normally, so the refusal is about the absence and not about
     the fixture. */
  t(`${flavour}: and the same package WITH content.xml reads fine (the arm is about the absence)`,
    (await ENTRY[flavour].parts(odfFixture(flavour))).ok, true);
}

/* ================================================================== */
console.log("\n--- NEGATIVE CONTROL arm (2), DRIVEN: the WRONG FLAVOUR handed to each entry ---");
for (const mine of ["odt", "ods", "odp"]) {
  for (const theirs of ["odt", "ods", "odp"]) {
    if (mine === theirs) continue;
    const parts = await ENTRY[mine].parts(odfFixture(theirs));
    t(`${mine} entry refuses a ${theirs} package BY NAME`,
      [parts.ok, parts.why], [false, `not_${mine}:${theirs}`]);
  }
}
{
  /* And an OOXML package, which is the same container with the other part
     map — refused by name too, never walked as if it were ODF. */
  const docxLike = zip([
    { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>` },
    { name: "word/document.xml", data: `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body/></w:document>` },
  ]);
  t("the .odt entry refuses a DOCX package by name",
    (await odtEntry.parts(docxLike)).why, "not_odt:docx");
  t("and a plain ZIP by name",
    (await odsEntry.parts(zip([{ name: "readme.txt", data: "hello" }]))).why, "not_ods:zip");
}

/* ================================================================== */
console.log("\n--- NEGATIVE CONTROL arm (5), OVER-STRICTNESS: spellings this item did not anticipate ---");
{
  /* Hiddenness written on the ELEMENT rather than on the style. Both are
     correct OpenDocument; a reader that only understood the spelling its own
     fixture used would be a fence tighter than its rule. */
  const onElement = doc("", `<office:spreadsheet>`
    + `<table:table table:name="Shown"><table:table-row><table:table-cell office:value-type="string"><text:p>a</text:p></table:table-cell></table:table-row></table:table>`
    + `<table:table table:name="Tucked" table:display="false"><table:table-row><table:table-cell office:value-type="string"><text:p>b</text:p></table:table-cell></table:table-row></table:table>`
    + `</office:spreadsheet>`);
  const st = await odsEntry.structure(odfFixture("ods", { content: onElement }));
  t("table:display on the ELEMENT is read, not only on the style",
    st.sheets.map((s) => [s.name, s.hidden]), [["Shown", false], ["Tucked", "hidden"]]);

  const pageVis = doc("", `<office:presentation>`
    + `<draw:page draw:name="One"><draw:frame><draw:text-box><text:p>a</text:p></draw:text-box></draw:frame></draw:page>`
    + `<draw:page draw:name="Two" presentation:visibility="hidden"><draw:frame><draw:text-box><text:p>b</text:p></draw:text-box></draw:frame></draw:page>`
    + `</office:presentation>`);
  const sp = await odpEntry.text(odfFixture("odp", { content: pageVis }));
  t("presentation:visibility on the PAGE is read, not only on the drawing-page style",
    sp.slides.map((s) => [s.slide, s.hidden]), [[1, false], [2, true]]);

  /* ODF encodes repeated spaces, tabs and breaks as elements. A reader that
     dropped them would silently close up gaps in the extracted text. */
  const spaced = doc("", `<office:text><text:p>A<text:s text:c="3"/>B<text:tab/>C<text:line-break/>D</text:p></office:text>`);
  const tx = await odtEntry.text(odfFixture("odt", { content: spaced }));
  t("text:s / text:tab / text:line-break are honoured, not dropped",
    tx.paragraphs[0].text, "A   B\tC\nD");

  /* A repeat run must advance the ADDRESS, or every reference after a run of
     blanks points at the wrong cell. */
  const repeated = doc("", `<office:spreadsheet><table:table table:name="R"><table:table-row>`
    + `<table:table-cell office:value-type="string"><text:p>first</text:p></table:table-cell>`
    + `<table:table-cell table:number-columns-repeated="3"/>`
    + `<table:table-cell office:value-type="string"><text:p>`
    + `<text:a xlink:href="https://example.gov/x">fifth</text:a></text:p></table:table-cell>`
    + `</table:table-row></table:table></office:spreadsheet>`);
  const rst = await odsEntry.structure(odfFixture("ods", { content: repeated }));
  t("number-columns-repeated advances the cell address (E1, not B1)",
    rst.links[0].source.ref, "R!E1");
}

/* ================================================================== */
console.log("\n--- NEGATIVE CONTROL arm (3), THE ARM'S OWN ARM: unregister one entry ---");
{
  /* Declared BEFORE arming. MUST FAIL: the .ods detect assertions, by bytes
     and by content type. MUST NOT FAIL: .odt and .odp, which are independent
     entries — if they moved, the arm would be measuring the registry rather
     than the entry. A baseline row distinguishes all-broken from
     all-working, which is the row the WORKER brief says to have. */
  const odsBytes = odfFixture("ods");
  const baseline = [detectFormat(odsBytes, null).format, detectFormat(null, ODS_CONTENT_TYPE).format];
  t("ARM BASELINE: with the entry registered, .ods detects both ways", baseline, ["ods", "ods"]);

  const removed = unregisterFormat("ods");
  t("the arm ARMED — unregisterFormat returned the entry it took out (an arm that did not arm is a finding)",
    removed === odsEntry, true);
  const armedOds = [detectFormat(odsBytes, null).format, detectFormat(null, ODS_CONTENT_TYPE).format];
  /* Under the arm the bytes pass finds no entry claiming this package, so the
     registry's own STATED undetermined is what comes back — never a guess at
     another format, which is the registry property this also re-pins. */
  t("ARMED: .ods now detects as NOTHING, by bytes and by content type — the two assertions that MUST fail",
    armedOds, ["undetermined", "undetermined"]);
  t("ARMED: .odt and .odp are UNMOVED — the arm is about the entry, not the registry",
    [detectFormat(odfFixture("odt"), null).format, detectFormat(odfFixture("odp"), null).format,
      detectFormat(null, ODT_CONTENT_TYPE).format, detectFormat(null, ODP_CONTENT_TYPE).format],
    ["odt", "odp", "odt", "odp"]);

  registerFormat(removed);
  t("RESTORED: .ods detects both ways again, and the restore is MEASURED not assumed",
    [detectFormat(odsBytes, null).format, detectFormat(null, ODS_CONTENT_TYPE).format], baseline);
  /* CORRECTED by FW-23, 2026-09-24: the roster gained a NINTH entry (`csv`),
     so the old eight-name list is superseded by an entry that landed after it,
     not by a defect in what it asserted. `ods` trails `odp` here and does so on
     purpose — the arm above removed and re-registered it, which moves it to the
     END of the Map, and that ordering IS part of what the restore is checked
     against. So `ods` now trails `csv` as well, because `csv` was registered
     while `ods` was out; the expected list is written from the run rather than
     from registration order, which is the fact this assertion is about. */
  t("and the registry holds exactly the nine formats it held before the arm",
    listFormats(), ["html", "pdf", "docx", "xlsx", "pptx", "odt", "odp", "csv", "ods"]);
}

/* ================================================================== */
/* THE SUITE REACHED ITS OWN FOOT. A TypeError inside an assertion goes
 * through no assertion at all and ends the module with the tally reading
 * clean, so this line is the proof the count above is a count of a complete
 * run. A missing tally is reported as -1, never 0. */
/* ====================================================================== *
 * COFF-11 / IC-100 / D-359 — THE INNER EXTENT ON THE ODF UNITS, AND THE
 * PLACE THE TWO SPREADSHEET FORMATS HONESTLY DIVERGE.
 * ====================================================================== *
 * The `.odp` half is the pptx half verbatim: a shape list is EXHAUSTIVE, so
 * the walked count IS the addressable count and there is no decision to take.
 *
 * The `.ods` half is where this item's decision bites in the OTHER direction
 * from `formats-xlsx.mjs`. OOXML fixes a grid (measured, `MEASUREMENTS.md`
 * 2026-09-15) so the xlsx entry can emit a BOUND that refuses only the
 * impossible. **OpenDocument fixes no maximum table size at all** — the grid
 * a member's application offers is that APPLICATION's and the file does not
 * record it — so there is nothing here to state and the bound is NULL. The
 * two rejected alternatives are what make that the right answer rather than a
 * shrug: bounding by the USED range would refuse a true citation of a cell
 * that exists and was empty at capture, and borrowing OOXML's grid would be
 * this reader inventing a bound the format never fixed. The used range is
 * emitted anyway, because it is the fact this walk knows.
 *
 * SO THE SUITE PINS AN ASYMMETRY ON PURPOSE. A later reader finding `.ods`
 * with a null bound must be able to tell a DECISION from an omission, and the
 * assertions below say which it is.                                        */
console.log("\n--- COFF-11: .ods carries its USED range and an honestly NULL bound (OpenDocument fixes no grid) ---");
{
  const T = await ENTRY.ods.text(odfFixture("ods"));
  t("every sheet carries all four extent keys — a consumer reads them by key presence, so absence is not an option",
    T.sheets.every((s) => "rows" in s && "cols" in s && "usedRows" in s && "usedCols" in s), true);
  t("the BOUND is NULL on every sheet — UNDETERMINED AND STATED, never a zero and never a borrowed grid",
    T.sheets.map((s) => [s.rows, s.cols]), T.sheets.map(() => [null, null]));
  /* The fixture's own ground truth, written above in THIS file:
     `Appropriations` declares four `<table:table-row>` over two columns, and
     `Reconciliation` one row of one cell. */
  t("the USED range is what the cells reach, per sheet, off the fixture's own rows",
    T.sheets.map((s) => [s.name, s.usedRows, s.usedCols]),
    [["Appropriations", 4, 2], ["Reconciliation", 1, 1]]);
  t("a null bound is NOT a null used range — the two absences are different facts and stay distinguishable",
    T.sheets.every((s) => s.rows === null && Number.isInteger(s.usedRows)), true);
}

console.log("\n--- COFF-11: .odp carries the slide's shape COUNT, and needs no bound decision at all ---");
{
  const T = await ENTRY.odp.text(odfFixture("odp"));
  t("every slide unit carries a shape count",
    T.slides.every((s) => Number.isInteger(s.shapes)), true);
  /* Ground truth from ODP_BODY above: slide 1 has two `<draw:frame>`, slides
     2 and 3 one each. The notes frame on slide 1 is NOT one of them — the
     walk strips `<presentation:notes>` before counting, which is the same
     rule that keeps notes text out of the slide's text. */
  t("and the figures are the deck's own — the notes frame on slide 1 is NOT a slide shape",
    T.slides.map((s) => [s.slide, s.shapes]), [[1, 2], [2, 1], [3, 1]]);
  t("the HIDDEN slide is counted like any other — extraction is not presentation (the standing rule)",
    T.slides.find((s) => s.hidden).shapes, 1);
  t("speaker-notes units gain NO shape count — they are not what a slide-shape extent addresses",
    T.speakerNotes.every((n) => !("shapes" in n)), true);
}

console.log("\n--- COFF-13: .odp states its DECK LENGTH, and NULL when the format cannot answer ---");
{
  /* Every `<draw:page>` lives in the one content.xml, so once the body is read
     the length is the deck's own and equals the slide list (three pages in
     ODP_BODY, the fixture's ground truth); when content.xml is absent the
     format cannot answer, and the null is a statement — never a zero. */
  const T = await ENTRY.odp.text(odfFixture("odp"));
  t("a read deck states its length: the three pages ODP_BODY declares",
    [T.deckLength, T.slides.length], [3, 3]);
  /* A content.xml with NO `<office:presentation>` body: the package reads,
     the deck does not. (A MISSING content.xml refuses at parts() and never
     reaches text()'s shape — arm (1) below drives that.) */
  const U = await ENTRY.odp.text(odfFixture("odp", {
    content: `<?xml version="1.0"?><office:document-content ${NS}><office:body/></office:document-content>` }));
  t("no presentation body: the length is NULL — present, stated, and not a zero",
    [U.ok, "deckLength" in U, U.deckLength, U.slides.length, U.undetermined[0]?.reason],
    [true, true, null, 0, "main_part_unreadable"]);
}

console.log("\n--- COFF-11: the two spreadsheet entries agree on the SHAPE and differ only where the FORMATS differ ---");
{
  /* The cross-format pin. Both entries emit the same four keys, which is what
     lets one consumer read both by key presence; the ONLY difference is
     whether a bound exists to state, and that difference is a fact about
     OOXML and OpenDocument rather than about these two readers. */
  /* A MINIMAL xlsx package, assembled with THIS suite's own zip so the
     comparison does not borrow the other suite's fixture (or its defects).
     One sheet, two cells: enough to carry a `sheets[]` entry, and nothing
     about the key roster depends on the content. */
  const XM = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml";
  const XLSX_FIXTURE = zip([
    { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${XM}"/></Types>` },
    { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
    { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Appropriations" sheetId="1" r:id="rId1"/></sheets></workbook>` },
    { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>` },
    { name: "xl/worksheets/sheet1.xml", data: `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Department</t></is></c><c r="B1" t="inlineStr"><is><t>Amount</t></is></c></row></sheetData></worksheet>` },
  ]);
  const ods = await ENTRY.ods.text(odfFixture("ods"));
  const xlsxText = await xlsxEntry.text(await xlsxEntry.parts(XLSX_FIXTURE));
  const keys = (s) => ["rows", "cols", "usedRows", "usedCols"].filter((k) => k in s);
  t("identical key rosters across the two spreadsheet containers",
    [keys(ods.sheets[0]), keys(xlsxText.sheets[0])],
    [["rows", "cols", "usedRows", "usedCols"], ["rows", "cols", "usedRows", "usedCols"]]);
  t("and the ONLY divergence is the bound: xlsx states one, ods states that it has none",
    [Number.isInteger(xlsxText.sheets[0].rows), ods.sheets[0].rows === null], [true, true]);
}

console.log(`\nformats-odf: ${pass} pass, ${fail} fail`);
/* `process.exit`, not `process.exitCode`: hygiene.test.mjs requires the
 * explicit exit so a lingering handle can never turn a green run into a hang,
 * and `./stdio.mjs` above is D-282's other half — the exit must not throw the
 * suite's own output away. Caught by hygiene on this suite's first battery
 * run, which is the rule working. */
process.exit(fail ? 1 : 0);
