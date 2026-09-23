/* NEGATIVE CONTROL: SIX arms and a baseline in `test/nc-fw19.mjs`, re-runnable in one step with `node test/nc-fw19.mjs [arm]` from `bio-plane/`. Each arm edits ONE real source ALONE, declares BEFORE it runs what MUST fail AND what MUST NOT, and is restored from a uniquely-named pristine copy verified by sha256 (never `git checkout --`). (a) `baseline` — nothing armed, MUST be green. (b) `rangeoob` — neuter `coversSheetRange` (answer null) in checks/bio-checks.mjs: an impossible sheet-range MINTS and the sheet-range out-of-range arms fail BY NAME, while the doc-table and image arms hold. (c) `tableoob` — neuter `coversDocTable`: table 99 of a two-table document mints and the doc-table arms fail by name. (d) `imageoob` — neuter `coversImage`: an image part the container does not hold mints. (e) `bytesnull` — drop the `cited_as !== 'bytes'` exemption from the chain arm: the same bytes row that must NOT be refused is refused — §8's "the two nulls are different facts" in the direction that refuses correct work. (f) `textnochain` — drop the `{part}` + `text` refusal: an image cited as TEXT with no transcription of its media mints, the overclaim. (g) `rec85canon` — the over-strictness direction on the arms this item must NOT move: perturb `canonicalExtent`'s `sheet-cell` arm (stop upper-casing the cell) and the REC-85 byte-identity pin MUST fail while every FW-19 arm holds. RUN 2026-09-18 by the FW-19 worker, ALL SIX AS DECLARED, every restore byte-identical (`checks/bio-checks.mjs` 713,080 B sha256 ef70bb1fe631…), 0 held-open assertions broken in any arm: baseline 36/0 GREEN · rangeoob 34/2 (2/2) · tableoob 34/2 (2/2) · imageoob 33/3 (3/3) · bytesnull 35/1 (1/1) · textnochain 35/1 (1/1) · rec85canon 35/1 (1/1). THE SIBLING HARNESSES WERE RE-RUN ON THIS TREE because FW-19 edits lines they anchor on, and TWO HAD GONE DEAD: `nc-cap12.mjs notion` read `ARMED NO` (FW-19 split the `levels` line) and `nc-rec85.mjs overstrict` read `ARMED NO (matched 2x)` (`coversSheetRange` had copied `coversSheetCell`'s two anchor lines) — both corrected, both then AS DECLARED. A third, `nc-rec85.mjs onebased`, read `-1 pass` for a PRE-EXISTING reason (a bare `.check` on a null refusal threw in `content-extent-arms.test.mjs`) and is AS DECLARED after a defensive read. `nc-coff11`, `nc-coff12`, `nc-rec84` all AS DECLARED unchanged. */

/* FW-19 / IC-124 / IC-125 — EXTRACTION-BREADTH §3.2 / §7 row 3: THE TWO ARMS AND
 * THE IMAGE REFERENCE, DRIVEN END TO END.
 *
 * WHAT THE ROW SAYS IS DONE WHEN, and what each section below measures:
 *
 *   0. THE PRODUCERS EMIT THEM. A real DOCX, XLSX, ODT and ODS — assembled
 *      byte-by-byte in this file with an independent crc32, so the table
 *      grids, the sheet ranges and the image hashes are the FIXTURE'S OWN
 *      GROUND TRUTH and not an equality the code under test produced for
 *      itself — read through the registered entries. And the human form each
 *      builder produces IS the checker's derived form, pinned (IC-1's parity).
 *   1. THE WIRE CARRIES THEM. `op=acquire` persists `tables` and `images` on
 *      the reading's container extent.
 *   2. THE TWO ARMS MINT IN RANGE AND REFUSE OUT OF RANGE BY NAME (REC-85's
 *      shape), through `op=promote`, read back through `op=content`.
 *   3. AN IMAGE IS ADMITTED WITH `cited_as`: as bytes it mints with NO chain
 *      and NO cap and says NOT APPLICABLE; as text over an embedded part it is
 *      refused; `bytes` on a text arm is refused.
 *   4. THE ACT (`op=cite`) CARRIES THE NEW FIELDS.
 *   5. OVER-STRICTNESS: REC-85's three arms are BYTE-IDENTICAL to the pristine
 *      tree, by digest (REC-82's two are pinned by `content-extent-arms`).
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { canonicalExtent, describeExtent, checkContentExtent, contentIdFor,
         CONTENT_EXTENT_KINDS } from "../checks/bio-checks.mjs";
import { docxEntry, docTableRef } from "../src/docx.mjs";
import { xlsxEntry, sheetRangeRef } from "../src/formats-xlsx.mjs";
import { odtEntry, odsEntry } from "../src/odf.mjs";
import { imageRef } from "../src/ooxml.mjs";
import { rec85Sweep } from "./fw19-rec85-digest.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");

/* ---- independent crc32 + zip assembler (capture-container-extent's own) ---- */
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
const u16le = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32le = (n) => Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8");
    const data = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf-8");
    const stored = f.store === true;
    const comp = stored ? data : deflateRawSync(data);
    const method = stored ? 0 : 8;
    const crc = crc32(data);
    locals.push(Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp]));
    centrals.push(Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), u16le(0), u16le(0), u16le(0), u32le(0), u32le(offset), nameB]));
    offset += locals[locals.length - 1].length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.concat([u32le(0x06054b50), u16le(0), u16le(0), u16le(files.length),
    u16le(files.length), u32le(cd.length), u32le(offset), u16le(0)]);
  return new Uint8Array(Buffer.concat([...locals, cd, eocd]));
}

/* ================= THE GROUND TRUTH ======================================= *
 * Two images whose bytes are written HERE, hashed HERE with node:crypto — the
 * part addresses the record must hold are therefore not the code's own output.
 * A non-image media member rides beside them and must NOT be enumerated.      */
const PNG = Buffer.from("\x89PNG\r\n\x1a\nFW-19 fixture: the budget map of Council District 3", "latin1");
const JPG = Buffer.from("\xff\xd8\xff\xe0FW-19 fixture: the signed page of the agreement", "latin1");
const PNG_SHA = sha(PNG), JPG_SHA = sha(JPG);
const ABSENT_SHA = sha("an image no container in this suite holds");

/* ---- the DOCX: two top-level tables and one NESTED in the first ---------- *
 * Table 0: a 3-column grid (tblGrid), 2 rows, whose first cell holds table 1
 * (a 1x1 nested table). Table 2: a 2-column grid, 4 rows. So the ordinal the
 * walk must produce is 0, 1 (nested, opened inside 0), 2 — and a table count
 * of THREE, which is the figure `doc-table` 3 is refused against.            */
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const tc = (inner) => `<w:tc>${inner}</w:tc>`;
const p = (s) => `<w:p><w:r><w:t>${s}</w:t></w:r></w:p>`;
const NESTED = `<w:tbl><w:tblGrid><w:gridCol/></w:tblGrid><w:tr>${tc(p("nested"))}</w:tr></w:tbl>`;
const TABLE0 = `<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/><w:gridCol/></w:tblGrid>`
  + `<w:tr>${tc(NESTED + p("Fund"))}${tc(p("FY26"))}${tc(p("FY27"))}</w:tr>`
  + `<w:tr>${tc(p("1010"))}${tc(p("2.2M"))}${tc(p("2.0M"))}</w:tr></w:tbl>`;
const TABLE2 = `<w:tbl><w:tblGrid><w:gridCol/><w:gridCol/></w:tblGrid>`
  + [1, 2, 3, 4].map((r) => `<w:tr>${tc(p(`r${r}a`))}${tc(p(`r${r}b`))}</w:tr>`).join("") + `</w:tbl>`;
const DOCX_TABLES = [{ rows: 2, cols: 3 }, { rows: 1, cols: 1 }, { rows: 4, cols: 2 }];
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOCX = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="${DOCX_CT}.main+xml"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
  { name: "word/document.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${W}><w:body>`
      + p("AGENDA REPORT") + TABLE0 + p("Between the tables.") + TABLE2 + p("End.")
      + `</w:body></w:document>` },
  { name: "word/_rels/document.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>` },
  { name: "word/media/image1.png", data: PNG },
  { name: "word/media/briefing.wav", data: "RIFF not an image" },
]);

/* ---- the XLSX: two sheets with KNOWN used ranges, and NO media ----------- *
 * "Summary" is 3 rows x 2 columns -> Summary!A1:B3. "Detail" 1 x 1 -> A1:A1.
 * No `xl/media/` at all, so `images` must be a MEASURED EMPTY LIST.          */
const SHEETS = [["Summary", [["Department", "FY26"], ["Police", "2.2M"], ["Fire", "2.0M"]]],
                ["Detail", [["Fund 1010"]]]];
const XLSX_CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const sheetXml = (rows) => `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`
  + rows.map((cells, i) => `<row r="${i + 1}">`
      + cells.map((v, j) => `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t>${v}</t></is></c>`).join("")
      + `</row>`).join("") + `</sheetData></worksheet>`;
const XLSX = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
  { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>`
      + SHEETS.map(([n], i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("") + `</sheets></workbook>` },
  { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
      + SHEETS.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")
      + `</Relationships>` },
  ...SHEETS.map(([, rows], i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(rows) })),
]);

/* ---- the ODT: one table of 3 columns (two by REPEAT) and 2 rows, one image */
const ODF_NS = ['xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"',
  'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"',
  'xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"'].join(" ");
const manifest = (ct) => `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="${ct}"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`;
const ODT_CT = "application/vnd.oasis.opendocument.text";
const odtCell = (v) => `<table:table-cell><text:p>${v}</text:p></table:table-cell>`;
const ODT = zip([
  { name: "mimetype", data: ODT_CT, store: true },
  { name: "META-INF/manifest.xml", data: manifest(ODT_CT) },
  { name: "content.xml", data: `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${ODF_NS} office:version="1.3"><office:automatic-styles/><office:body><office:text>`
      + `<text:p>Staff report.</text:p><table:table table:name="T1"><table:table-column/><table:table-column table:number-columns-repeated="2"/>`
      + `<table:table-row>${odtCell("a")}${odtCell("b")}${odtCell("c")}</table:table-row>`
      + `<table:table-row>${odtCell("d")}${odtCell("e")}${odtCell("f")}</table:table-row></table:table>`
      + `</office:text></office:body></office:document-content>` },
  { name: "styles.xml", data: `<?xml version="1.0"?><office:document-styles ${ODF_NS}/>` },
  { name: "Pictures/1000000000.jpg", data: JPG },
]);

/* ---- the ODS: one sheet, used range 2 x 2 -> Appropriations!A1:B2 -------- */
const ODS_CT = "application/vnd.oasis.opendocument.spreadsheet";
const odsCell = (v) => `<table:table-cell office:value-type="string"><text:p>${v}</text:p></table:table-cell>`;
const ODS = zip([
  { name: "mimetype", data: ODS_CT, store: true },
  { name: "META-INF/manifest.xml", data: manifest(ODS_CT) },
  { name: "content.xml", data: `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${ODF_NS} office:version="1.3"><office:automatic-styles/><office:body><office:spreadsheet>`
      + `<table:table table:name="Appropriations"><table:table-row>${odsCell("Dept")}${odsCell("FY26")}</table:table-row>`
      + `<table:table-row>${odsCell("Police")}${odsCell("2.2M")}</table:table-row></table:table>`
      + `</office:spreadsheet></office:body></office:document-content>` },
  { name: "styles.xml", data: `<?xml version="1.0"?><office:document-styles ${ODF_NS}/>` },
]);

/* ===================== 0. THE PRODUCERS ================================= */
console.log("--- 0. the office entries EMIT the two arms and the image reference ---");
console.log(`  corpus: a DOCX of ${DOCX_TABLES.length} tables (one nested) + 1 image + 1 non-image `
          + `media member; an XLSX of ${SHEETS.length} sheets and no media; an ODT of 1 table + `
          + `1 image; an ODS of 1 sheet. Extent kinds in the grammar: `
          + `${Object.keys(CONTENT_EXTENT_KINDS).join(", ")}`);

const dText = await docxEntry.text(DOCX);
t("the DOCX's tables are emitted in document order, the NESTED one numbered as it opens, "
  + "each with the grid the fixture was BUILT with",
  (dText.tables || []).map((x) => [x.table, x.ref, x.rows, x.cols]),
  DOCX_TABLES.map((g, i) => [i, `table ${i + 1}`, g.rows, g.cols]));
t("the DOCX's images are the ONE image member, content-addressed by the fixture's own hash — "
  + "the .wav beside it is not an image and is not enumerated",
  (dText.images || []).map((x) => [x.kind, x.part, x.mime, x.name, x.ref]),
  [["image", PNG_SHA, "image/png", "image1.png", `image ${PNG_SHA.slice(0, 12)}`]]);

const xText = await xlsxEntry.text(XLSX);
t("each XLSX sheet carries its whole-sheet `sheet-range` unit over the USED range",
  (xText.sheets || []).map((s) => s.range),
  [sheetRangeRef("Summary", "A1:B3"), sheetRangeRef("Detail", "A1:A1")]);
t("an XLSX with no media directory emits images as a MEASURED EMPTY LIST, never null",
  xText.images, []);

const oText = await odtEntry.text(ODT);
t("the ODT's table is accumulated THROUGH the column repeat — 3 columns, 2 rows",
  (oText.tables || []).map((x) => [x.table, x.ref, x.rows, x.cols]), [[0, "table 1", 2, 3]]);
t("the ODT's image is read off the package's Pictures/ directory, content-addressed",
  (oText.images || []).map((x) => [x.part, x.mime]), [[JPG_SHA, "image/jpeg"]]);
const sText = await odsEntry.text(ODS);
t("the ODS sheet carries its `sheet-range` unit through the same builder",
  (sText.sheets || []).map((s) => s.range), [sheetRangeRef("Appropriations", "A1:B2")]);

/* IC-1's PARITY: the builder's human form IS the checker's derived form. */
t("PARITY: the human form each producer builds is EXACTLY the checker's derived form for the "
  + "same address — sheet-range, doc-table (with and without a cell), image",
  [describeExtent({ kind: "sheet-range", sheet: "Summary", range: "A1:B3" }) === sheetRangeRef("Summary", "A1:B3").ref,
   describeExtent({ kind: "doc-table", table: 2 }) === docTableRef(2).ref,
   describeExtent({ kind: "doc-table", table: 2, cell: "B4" }) === docTableRef(2, "B4").ref,
   describeExtent({ kind: "image", part: PNG_SHA }) === imageRef(PNG_SHA, "image/png", "image1.png").ref],
  [true, true, true, true]);
t("one address, one string: `$b$3:a1`, `A1:B3` and a reversed range canonicalise alike, and "
  + "`B3` IS `B3:B3`",
  [canonicalExtent({ kind: "sheet-range", sheet: "S", range: "$b$3:a1" })
     === canonicalExtent({ kind: "sheet-range", sheet: "S", range: "A1:B3" }),
   canonicalExtent({ kind: "sheet-range", sheet: "S", range: "B3" })
     === canonicalExtent({ kind: "sheet-range", sheet: "S", range: "B3:B3" })],
  [true, true]);

/* ===================== THE PLANE ======================================== */
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-fw19", MEMBER_TOKEN: "mem-fw19", PROBE_TOKEN: "prb-fw19",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.pathname === "/report.docx") return bin(DOCX, DOCX_CT);
    if (u.pathname === "/budget.xlsx") return bin(XLSX, XLSX_CT);
    return new Response("unscripted", { status: 500 });
  },
}));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-fw19") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-fw19") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const acquire = async (path) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-fw19",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov" + path,
                                           authority: "City of Oakland" }) })).json());

const NOW = "2026-09-18T00:00:00Z";
const LATER = "2026-09-18T01:00:00Z";
const codes = (r) => (r.findings || []).map((f) => f.check).sort();
const detail = (r) => (r.findings || []).map((f) => f.detail).join(" || ");
const LEG_KEYS = { kind: "extent_kind", sheet: "extent_sheet", range: "extent_range",
  table: "extent_table", cell: "extent_cell", part: "extent_part", para: "extent_para",
  citedAs: "extent_cited_as" };
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, "    role: supports",
      ...Object.entries(LEG_KEYS).filter(([k]) => l[k] !== undefined).map(([k, f]) => `    ${f}: ${l[k]}`)])]
  : [];
const inquiryMd = (id, { refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs), "---", "",
  "## Question", "", `What does ${id} rest on?`, "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260918T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected", created: NOW, last_updated: LATER },
    files, register: [] });
};
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type, opts);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};
let legSeq = 0;
const citeLeg = (target, leg) => {
  const id = `INQ-2026-9190-l${++legSeq}`;
  return { id, run: () => promote(id, inquiryMd(id, { refs: [target], legs: [{ target, ...leg }] }), "inquiry") };
};

/* ===================== 1. THE WIRE ====================================== */
console.log("\n--- 1. op=acquire persists `tables` and `images` on the container extent ---");
const doc = (await acquire("/report.docx")).document;
const book = (await acquire("/budget.xlsx")).document;
const ext = (d) => (d && d.reading && d.reading.container_extent) || null;
t("the DOCX's reading carries the table GRIDS the fixture was built with, and its image list",
  [ext(doc)?.tables ?? null, ext(doc)?.images ?? null],
  [DOCX_TABLES, [{ part: PNG_SHA, mime: "image/png" }]]);
t("the XLSX's reading carries images as a MEASURED EMPTY LIST and declares no table level",
  [ext(book)?.images ?? null, ext(book)?.levels ?? null], [[], ["sheets", "images"]]);

const DOC = "INFO-2026-9190-report", BOOK = "INFO-2026-9190-budget";
await mustPromote(DOC, infoMd(DOC), "information", { reading: doc });
await mustPromote(BOOK, infoMd(BOOK), "information", { reading: book });

/* ===================== 2. THE TWO ARMS ================================== */
console.log("\n--- 2. `sheet-range` and `doc-table` mint in range and refuse out of range BY NAME ---");
const rangeOk = await citeLeg(BOOK, { kind: "sheet-range", sheet: "Summary", range: "A1:B3" }).run();
t("a range of a sheet the workbook HAS mints",
  [rangeOk.ok, rangeOk.content?.[0]?.extent_kind, rangeOk.content?.[0]?.minted], [true, "sheet-range", true]);
const rangeRow = await get("content", `id=${rangeOk.content?.[0]?.content_id}`);
t("    and reads back through op=content with the producer's own human form, cited as text",
  [rangeRow.ref, rangeRow.extent, rangeRow.cited_as],
  ["Summary!A1:B3", { kind: "sheet-range", range: "A1:B3", sheet: "Summary" }, "text"]);
const rangeSheet = await citeLeg(BOOK, { kind: "sheet-range", sheet: "NoSuchSheet", range: "A1:B3" }).run();
t("a sheet-range on a sheet the workbook does NOT have is REFUSED C-45.1 BY NAME",
  [rangeSheet.ok, codes(rangeSheet), /names a sheet called 'NoSuchSheet'/.test(detail(rangeSheet))],
  [false, ["C-45.1"], true]);
const rangeGrid = await citeLeg(BOOK, { kind: "sheet-range", sheet: "Summary", range: "A1:A1048577" }).run();
t("a sheet-range reaching one row PAST the XLSX grid is REFUSED C-45.1, with the figure",
  [rangeGrid.ok, codes(rangeGrid), /holds 1048576 row\(s\).*range reaches row 1048577/.test(detail(rangeGrid))],
  [false, ["C-45.1"], true]);
const rangeEmpty = await citeLeg(BOOK, { kind: "sheet-range", sheet: "Summary", range: "C40:D90" }).run();
t("a range past the USED range but inside the grid MINTS — the bound is the grid (an empty cell exists)",
  [rangeEmpty.ok, rangeEmpty.content?.[0]?.extent_kind], [true, "sheet-range"]);
const rangeBad = await citeLeg(BOOK, { kind: "sheet-range", sheet: "Summary", range: "A1-B3" }).run();
t("an unreadable range is REFUSED C-45.3 and never minted",
  [rangeBad.ok, codes(rangeBad)], [false, ["C-2.8"]]);

const tableOk = await citeLeg(DOC, { kind: "doc-table", table: 2 }).run();
t("the LAST table (0-based 2 of 3) mints — the bound is inclusive",
  [tableOk.ok, tableOk.content?.[0]?.extent_kind, tableOk.content?.[0]?.minted], [true, "doc-table", true]);
const tableRow = await get("content", `id=${tableOk.content?.[0]?.content_id}`);
t("    and reads back with the producer's human form", [tableRow.ref, tableRow.cited_as], ["table 3", "text"]);
const tableOob = await citeLeg(DOC, { kind: "doc-table", table: 3 }).run();
t("a table past the document's table count is REFUSED C-45.1 BY NAME, the count stated",
  [tableOob.ok, codes(tableOob), /holds 3 table\(s\) \(0-2\) and the extent names table 3/.test(detail(tableOob))],
  [false, ["C-45.1"], true]);
const cellOk = await citeLeg(DOC, { kind: "doc-table", table: 2, cell: "B4" }).run();
t("the far corner cell of table 2 (B4 of a 2x4 grid) mints", [cellOk.ok, cellOk.content?.[0]?.minted], [true, true]);
const cellOob = await citeLeg(DOC, { kind: "doc-table", table: 2, cell: "C1" }).run();
t("a cell past that table's grid is REFUSED C-45.1 with the table's own column count",
  [cellOob.ok, codes(cellOob), /table 2 of this capture holds 2 column\(s\) and the extent names column 3/.test(detail(cellOob))],
  [false, ["C-45.1"], true]);

/* ===================== 3. THE IMAGE AND cited_as ======================== */
console.log("\n--- 3. an `image` is admitted with `cited_as` — two nulls, two facts ---");
const imgOk = await citeLeg(DOC, { kind: "image", part: PNG_SHA }).run();
t("an image the container HOLDS, cited with no cited_as, mints — as BYTES",
  [imgOk.ok, imgOk.content?.[0]?.extent_kind, imgOk.content?.[0]?.minted], [true, "image", true]);
const imgRow = await get("content", `id=${imgOk.content?.[0]?.content_id}`);
t("    and its row carries cited_as=bytes with NO chain and NO cap — and says the transcription "
  + "axis does NOT APPLY rather than that it is undetermined",
  [imgRow.cited_as, imgRow.chain, imgRow.derivation_cap, imgRow.transcription?.applies,
   /does not apply, which is a different fact from one that is undetermined/.test(imgRow.transcription?.why || "")],
  ["bytes", null, null, false, true]);
t("    and its human form is the producer's own, from the address",
  imgRow.ref, `image ${PNG_SHA.slice(0, 12)}`);
const imgAbsent = await citeLeg(DOC, { kind: "image", part: ABSENT_SHA }).run();
t("an image part the container does NOT hold is REFUSED C-45.1 BY NAME",
  [imgAbsent.ok, codes(imgAbsent), /holds 1 image\(s\) and none of them has the content hash/.test(detail(imgAbsent))],
  [false, ["C-45.1"], true]);
const imgNone = await citeLeg(BOOK, { kind: "image", part: PNG_SHA }).run();
t("on a workbook whose media directory was LOOKED IN and held nothing, any image is refused — "
  + "the empty list is a measured zero, not a skip",
  [imgNone.ok, codes(imgNone), /holds 0 image\(s\)/.test(detail(imgNone))], [false, ["C-45.1"], true]);
const imgText = await citeLeg(DOC, { kind: "image", part: PNG_SHA, citedAs: "text" }).run();
/* The CHECK is the leg grammar's (C-2.8) and the CODE is the family's
   (CONTENT_EXTENT_NO_CHAIN): this refusal needs no record — no transcription of
   an embedded image exists anywhere in the plane — so the catalogue's
   document-only pass fires it before the store does, REC-84's relay rule. */
t("the SAME image cited as TEXT is REFUSED as NO_CHAIN at the leg grammar: nothing in this record "
  + "read text off it",
  [imgText.ok, codes(imgText), (imgText.findings || []).map((f) => f.code),
   /nothing in this record has read text off an embedded image/.test(detail(imgText))],
  [false, ["C-2.8"], ["CONTENT_EXTENT_NO_CHAIN"], true]);
const paraBytes = await citeLeg(DOC, { kind: "doc-para", para: 0, citedAs: "bytes" }).run();
t("`bytes` on a paragraph is REFUSED BY NAME rather than silently read as text",
  [paraBytes.ok, codes(paraBytes), /only an image can be cited as its bytes/.test(detail(paraBytes))],
  [false, ["C-2.8"], true]);
t("PURE: an image as bytes over a capture with NO chain is not refused; as text it is — §8's two nulls",
  [checkContentExtent({ kind: "image", part: PNG_SHA }, { chain: null, pageCount: null, container: null }),
   checkContentExtent({ kind: "image", page: 0, cited_as: "text" }, { chain: null, pageCount: 3, container: null })?.check],
  [null, "C-45.2"]);
t("PURE: bytes and text over one image are TWO addresses, and a bytes address ignores the chain",
  [contentIdFor("c", { kind: "image", page: 0, cited_as: "bytes" }, null)
     !== contentIdFor("c", { kind: "image", page: 0, cited_as: "text" }, null),
   canonicalExtent({ kind: "image", part: PNG_SHA }) === canonicalExtent({ kind: "image", part: PNG_SHA, cited_as: "bytes" })],
  [true, true]);
t("PURE: an image naming BOTH a part and a page is one image stated twice, and refused",
  checkContentExtent({ kind: "image", part: PNG_SHA, page: 0 }, {})?.check, "C-45.3");

/* ===================== 4. THE ACT ======================================= */
console.log("\n--- 4. op=cite carries the new fields rather than refusing them as unknown ---");
const select = async (ids) => (await post("select", { ids }, "mem-fw19")).handle;
const CITER = "INQ-2026-9190-citer";
await mustPromote(CITER, inquiryMd(CITER), "inquiry");
const viaCite = await get("cite", `project=${CITER}&handle=${await select([DOC])}&role=supports`
  + `&extent_kind=doc-table&extent_table=1&extent_cell=A1`);
t("a doc-table citation is ACCEPTED through the act (it was refused C-45.7 before FW-19)",
  [viaCite.ok, viaCite.reason ?? null], [true, null]);
/* A SECOND question, because a target already carrying a leg is a success that
   writes nothing (REC-97's rule) — citing DOC onto CITER again would measure
   that rule and not the refusal. */
const CITER2 = "INQ-2026-9190-citer2";
await mustPromote(CITER2, inquiryMd(CITER2), "inquiry");
const viaCiteImg = await get("cite", `project=${CITER2}&handle=${await select([DOC])}&role=supports`
  + `&extent_kind=image&extent_part=${ABSENT_SHA}&extent_cited_as=bytes`);
t("    and an image part the container lacks is refused at the WRITE, by the same catalogue arm",
  [viaCiteImg.ok, JSON.stringify(viaCiteImg).includes("CONTENT_EXTENT_OUT_OF_RANGE")], [false, true]);
const viaCiteImgOk = await get("cite", `project=${CITER2}&handle=${await select([DOC])}&role=supports`
  + `&extent_kind=image&extent_part=${PNG_SHA}`);
t("    while the image it DOES hold is cited through the act and minted as bytes",
  [viaCiteImgOk.ok, viaCiteImgOk.reason ?? null], [true, null]);

await mf.dispose();

/* ===================== 5. OVER-STRICTNESS =============================== */
console.log("\n--- 5. REC-85's three arms are BYTE-IDENTICAL to the pristine tree ---");
/* The pin was taken by `test/fw19-rec85-digest.mjs` run against `bio-checks.mjs`
   as it stood at `92f4c64e` (the item's base, before any FW-19 edit) — a copy
   written out of `git show`, which is the whole subject because the file imports
   nothing. It sweeps the three arms this item must NOT move; REC-82's two arms
   are pinned the same way by `content-extent-arms.test.mjs`. */
const PRISTINE_REC85 = { n: 144, digest: "ecd21fe042cacd27a639abf8b0aae7a52738703615ca8b8299ecd89a1274290d" };
const now85 = rec85Sweep({ canonicalExtent, describeExtent, contentIdFor, checkContentExtent });
t(`OVER-STRICTNESS: REC-85's sheet-cell / doc-para / slide-shape arms answer BYTE-IDENTICALLY `
  + `to the pristine tree over a ${now85.n}-row sweep`,
  [now85.n, now85.digest], [PRISTINE_REC85.n, PRISTINE_REC85.digest]);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
