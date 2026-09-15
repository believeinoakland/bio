/* NEGATIVE CONTROL: NINE arms — a baseline and eight — live in `test/nc-cap12.mjs` and are re-run in one step with `node test/nc-cap12.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by content with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN — results are in this item's report and in CLAIMS.md's release line. (a) `baseline` — nothing armed; MUST be green, the row that distinguishes eight-arms-broken from eight-arms-working. (b) `dropsheets` — in src/index.mjs drop the SHEET level from the persisted extent (`sheets: null`); MUST fail the workbook's acquire arm, its persisted arm, the D-359 arm AND the C-45.1 refusal on an unknown sheet with its detail — THE ARM THAT PROVES THE GAP WAS REAL for this level, because it reproduces exactly what the record held before this item; MUST NOT move the paragraph or slide arms, which are three independent levels and an arm taking all three down would not have shown that. (c) `droppara` — drop the PARAGRAPH level; MUST fail the document's three arms and nothing else. (d) `dropslides` — drop the SLIDE level; MUST fail the deck's arms and nothing else. (e) `zero` — treat an entry's EMPTY list (the over-the-size-bound branch's own shape) as a held figure rather than as NULL; MUST fail the never-a-zero arm alone, because a workbook too large to read would then be recorded as holding NO sheets and C-45.1 would refuse every cell citation on it — the record asserting a fact nobody established. (f) `notion` — emit `levels` as all three names regardless of what the entry itemised; MUST fail the two arms that assert what a container itemises AT ALL, because declaring a level the container has no notion of would make the store report a gap that does not exist; MUST NOT move a single gate, which is itself the finding this arm records. (g) `reader` — in src/store.mjs neuter `#containerExtentForCapture`'s read of the stored figure so it answers NULL as it did before this item; MUST fail all four container refusals and MUST NOT move the acquire or persist arms, which separates a reader failure from `drop*`'s writer failure. (h) `overstrict` and (i) `overstrict2` — THE OVER-STRICTNESS DIRECTION, armed SEPARATELY for the sheet and slide predicates because each reads its own shape and each is its own function: invent the inner bounds this record does not hold (five rows and columns per sheet; five shapes per slide). `overstrict` MUST fail the CELL half of the D-359 arm and `overstrict2` the SHAPE half — one each, not both — and neither MUST move any refusal or any in-range mint. A fence tighter than its rule is not a safer fence, and refusing here pushes a member toward citing the whole document, which claims MORE. */
/* RESULTS, run 2026-09-14 by the CAP-12 worker, each arm ALONE with the others held open, every restore verified byte-identically (9 of 9 `YES`, `src/index.mjs` 529,262 B sha256 8f030d481cb4… and `src/store.mjs` 2,000,712 B sha256 e9c5fe8250a5… each time):
 * baseline 29/0 GREEN · dropsheets 24/5 (5/5) · droppara 26/3 (3/3) · dropslides 25/4 (4/4) ·
 * zero 28/1 (1/1) · notion 27/2 (2/2) · reader 25/4 (4/4) · overstrict 28/1 (1/1) ·
 * overstrict2 28/1 (1/1). ALL NINE AS DECLARED at the recorded run.
 *
 * ONE CAME BACK WRONG ON THE FIRST RUN AND IS RECORDED AT ITS SITE IN `nc-cap12.mjs` RATHER THAN
 * SMOOTHED: `overstrict` read `1/2 declared, 1 failing` — NOT AS DECLARED — because the
 * DECLARATION named both halves of the D-359 arm while the patch touches only the SHEET
 * predicate. THE DECLARATION WAS THE DEFECT and the subject was behaving exactly right. That is
 * REC-85's `canon` finding reproduced one item later, and it is the argument for splitting the
 * slide half into its own arm: a mis-declared arm reads exactly like a partially-working subject. */

/* CAP-12 / D-354 — THE CONTAINER'S OWN EXTENT, PERSISTED AT ACQUIRE.
 *
 * REC-85 landed the `sheet-cell`, `doc-para` and `slide-shape` arms of the
 * content-extent primitive with two halves each. The SHAPE half — is this an
 * address at all — is fed by the leg and was live. The CONTAINER half — does
 * THIS document hold that address — needs the container's own extent, and
 * NOTHING IN THIS PLANE PERSISTED ONE: the reading carried `entities`, `facts`,
 * `text_source`, `text_tier`, `text_container` and nothing structural, and no
 * table in `schema.mjs` held a sheet, a paragraph or a shape. So the three arms
 * were BUILT, CORRECT AND UNFED, and a leg could cite `NoSuchSheet!ZZ9999999` of
 * a real workbook and it MINTED. That is D-354 and this suite is its close.
 *
 * WHAT THIS SUITE MEASURES, and it is the mechanism rather than its existence: a
 * REAL acquire of a REAL XLSX, DOCX and PPTX through `op=acquire` — each
 * assembled byte-by-byte in this file with an independent crc32, so the sheet
 * names, the paragraph count and the slide count are the FIXTURE'S OWN GROUND
 * TRUTH and not an equality the code under test produced for itself — promoted
 * through `op=promote`, then a leg beyond each container driven through
 * `op=promote` again and refused BY NAME. Every figure comes out of an op.
 *
 * WHAT IT ALSO PINS, because the safe direction is the one that is easy to lose:
 *
 *   NULL IS NOT A REFUSAL AND NOT A ZERO. A PDF acquires with the key present
 *   and NULL; an HTML page acquires with the key ABSENT; a capture acquired
 *   before this landing still mints an impossible cell, deliberately.
 *
 *   THE INNER BOUNDS ARE NOT INVENTED (D-359). The entries emit the sheet LIST,
 *   the paragraph LIST and the slide LIST and emit no sheet dimensions and no
 *   per-slide shape count, so a cell inside a KNOWN sheet and a shape inside a
 *   KNOWN slide still mint. That is this item's honest boundary, asserted rather
 *   than described, and `nc-cap12.mjs`'s `overstrict` arm breaks it on purpose.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* ---- independent crc32 + zip assembler (the ooxml.test.mjs / formats-*.test.mjs
 * pattern: the fixture builder must not inherit a defect from the module under
 * test, so nothing here imports the container reader) ---- */
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
    const comp = deflateRawSync(data);
    const crc = crc32(data);
    const local = Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(8), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(8), u16le(0), u16le(0x21),
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

/* ================= THE WORKBOOK — THREE NAMED SHEETS ==================== *
 * THE SHEET NAMES ARE THE FIXTURE'S OWN GROUND TRUTH: they are the strings
 * this function writes into `xl/workbook.xml`, so the assertion below is not
 * an equality the code under test produced for itself.                     */
const SHEET_NAMES = ["Summary", "Detail", "Reconciliation"];
const XLSX_MAIN_CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml";
const XLSX_CT = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const sheetXml = (rows) => `<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>`
  + rows.map((cells, i) => `<row r="${i + 1}">`
      + cells.map((v, j) => `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t>${v}</t></is></c>`).join("")
      + `</row>`).join("")
  + `</sheetData></worksheet>`;
const XLSX = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${XLSX_MAIN_CT}"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
  { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>`
      + SHEET_NAMES.map((n, i) => `<sheet name="${n}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")
      + `</sheets></workbook>` },
  { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
      + SHEET_NAMES.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")
      + `</Relationships>` },
  { name: "xl/worksheets/sheet1.xml", data: sheetXml([["Department", "FY26 Adopted"], ["Police", "2200000"], ["Fire", "2000000"]]) },
  { name: "xl/worksheets/sheet2.xml", data: sheetXml([["Fund 1010", "General Purpose Fund"]]) },
  { name: "xl/worksheets/sheet3.xml", data: sheetXml([["Reconciliation notes"]]) },
]);

/* ================= THE DOCUMENT — A KNOWN PARAGRAPH COUNT =============== *
 * THE COUNT IS THE FIXTURE'S OWN GROUND TRUTH: it is the length of this
 * array, written as that many <w:p> elements and nothing else. No table, so
 * nothing else in the body can contribute a paragraph.                      */
const PARAS = [
  "CITY OF OAKLAND", "AGENDA REPORT", "TO: Jestin D. Johnson, City Administrator",
  "SUBJECT: FY 2026-27 Midcycle Budget Amendments", "FISCAL IMPACT",
  "The proposed appropriation is $1.9 million from the General Purpose Fund.",
  "RECOMMENDATION", "Adopt the accompanying resolution.",
];
const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOCX = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="${DOCX_CT}.main+xml"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
  { name: "word/document.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${W}><w:body>`
      + PARAS.map((p) => `<w:p><w:r><w:t>${p}</w:t></w:r></w:p>`).join("")
      + `</w:body></w:document>` },
  { name: "word/_rels/document.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>` },
]);

/* ================= THE DECK — A KNOWN SLIDE COUNT ======================= *
 * THE COUNT IS THE FIXTURE'S OWN GROUND TRUTH: the number of <p:sldId>
 * entries this function writes into the declared order.                     */
const SLIDE_TITLES = ["FY 2026-27 PROPOSED MIDCYCLE BUDGET", "GENERAL PURPOSE FUND OUTLOOK",
                      "FISCAL IMPACT"];
const P = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const A = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"';
const R = 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const PPTX_CT = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const slideXmlOf = (title) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld ${P} ${A} ${R}><p:cSld><p:spTree>
<p:sp><p:txBody><a:p><a:r><a:t>${title}</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:txBody><a:p><a:r><a:t>Presented to Council 2026-06-16.</a:t></a:r></a:p></p:txBody></p:sp>
</p:spTree></p:cSld></p:sld>`;
const PPTX = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="${PPTX_CT}.main+xml"/>`
      + SLIDE_TITLES.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")
      + `</Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>` },
  { name: "ppt/presentation.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentation ${P} ${R}><p:sldIdLst>`
      + SLIDE_TITLES.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("")
      + `</p:sldIdLst></p:presentation>` },
  { name: "ppt/_rels/presentation.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
      + SLIDE_TITLES.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join("")
      + `</Relationships>` },
  ...SLIDE_TITLES.map((title, i) => ({ name: `ppt/slides/slide${i + 1}.xml`, data: slideXmlOf(title) })),
  ...SLIDE_TITLES.map((_, i) => ({ name: `ppt/slides/_rels/slide${i + 1}.xml.rels`, data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>` })),
]);

/* ---- a tiny PDF assembler (CAP-9's own, kept for the over-strictness arm:
 * a PAGED document has no container extent and must acquire with the key
 * present and NULL) ---- */
function pdfBytes() {
  const chunks = [Buffer.from("%PDF-1.7\n", "latin1")];
  const objs = [
    { num: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { num: 2, body: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>" },
    { num: 3, body: "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>" },
  ];
  for (const o of objs) {
    chunks.push(Buffer.from(`${o.num} 0 obj\n${o.body}\nendobj\n`, "latin1"));
  }
  chunks.push(Buffer.from("%%EOF\n", "latin1"));
  return new Uint8Array(Buffer.concat(chunks));
}
const PDF = pdfBytes();
const HTML = `<!doctype html><html><head><title>Council Calendar</title></head>`
  + `<body><h1>Meetings</h1><p>A web page has no sheets, no paragraph count and no slides.</p></body></html>`;

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cap12", MEMBER_TOKEN: "mem-cap12", PROBE_TOKEN: "prb-cap12",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.pathname === "/budget.xlsx") return bin(XLSX, XLSX_CT);
    if (u.pathname === "/report.docx") return bin(DOCX, DOCX_CT);
    if (u.pathname === "/deck.pptx") return bin(PPTX, PPTX_CT);
    if (u.pathname === "/one.pdf") return bin(PDF, "application/pdf");
    if (u.pathname === "/calendar.html") return bin(HTML, "text/html; charset=utf-8");
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
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-cap12") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-cap12") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const acquire = async (path) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-cap12",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov" + path,
                                           authority: "City of Oakland" }) })).json());

const NOW = "2026-09-14T00:00:00Z";
const LATER = "2026-09-14T01:00:00Z";
const codes = (r) => (r.findings || []).map((f) => f.check).sort();
const detail = (r) => (r.findings || []).map((f) => f.detail).join(" || ");

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
/* The extent arrives as FLAT SCALARS on the leg — REC-84's C-2.8 grammar. */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
      ...(l.sheet !== undefined ? [`    extent_sheet: ${l.sheet}`] : []),
      ...(l.cell !== undefined ? [`    extent_cell: ${l.cell}`] : []),
      ...(l.para !== undefined ? [`    extent_para: ${l.para}`] : []),
      ...(l.slide !== undefined ? [`    extent_slide: ${l.slide}`] : []),
      ...(l.shape !== undefined ? [`    extent_shape: ${l.shape}`] : [])])]
  : [];

const inquiryMd = (id, { refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
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
    snapKey: `20260914T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register: [] });
};
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type, opts);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* ===================== 1. ACQUIRE CARRIES I2's EXTENTS ================== */

console.log("\n--- 1. op=acquire: each office container's reading carries the extent its entry itemised ---");

const book = (await acquire("/budget.xlsx")).document;
const doc = (await acquire("/report.docx")).document;
const deck = (await acquire("/deck.pptx")).document;

/* THE CORPUS THIS SUITE REACHES, PRINTED AND FLOORED. A headline assertion over
   an empty fixture has passed three times in this repository. */
console.log(`  corpus: 3 office containers acquired through op=acquire — a workbook of `
          + `${SHEET_NAMES.length} sheets (${SHEET_NAMES.join(", ")}), a document of ${PARAS.length} `
          + `paragraphs, a deck of ${SLIDE_TITLES.length} slides — plus a 1-page PDF and an HTML page`);
t("the fixture is non-empty and every container was recognised by the FORMAT axis",
  [SHEET_NAMES.length >= 2, PARAS.length >= 2, SLIDE_TITLES.length >= 2,
   book.profile.format.format, doc.profile.format.format, deck.profile.format.format],
  [true, true, true, "xlsx", "docx", "pptx"]);
t("none of the three was read as text at intake (they are containers, stated by FW-3)",
  [book.profile.profiled_from_text, doc.profile.profiled_from_text, deck.profile.profiled_from_text],
  [false, false, false]);

/* EVERY READ BELOW IS DEFENSIVE, AND THAT IS THE CONTROL HARNESS'S REQUIREMENT
   RATHER THAN STYLE. Six of `nc-cap12.mjs`'s arms make one of these levels NULL;
   dereferencing it would THROW, and a throw goes through no assertion at all —
   it ends the module while the tally reads clean, which is the `-1` failure
   WORKER.md names and which REC-82, REC-83 and REC-85 each met one item apart.
   An arm must produce a measured FAIL, never a silent death. */
const ext = (d) => (d && d.reading && d.reading.container_extent) || null;
t("the workbook's reading carries the SHEET NAMES the fixture was BUILT with, in order",
  Array.isArray(ext(book)?.sheets) ? ext(book).sheets.map((s) => s && s.name) : null, SHEET_NAMES);
t("the document's reading carries the PARAGRAPH COUNT the fixture was BUILT with",
  ext(doc)?.paragraphs ?? null, PARAS.length);
t("the deck's reading carries one entry per SLIDE the fixture was BUILT with",
  Array.isArray(ext(deck)?.slides) ? ext(deck).slides.length : null, SLIDE_TITLES.length);

/* THE LEVEL A CONTAINER HAS NO NOTION OF IS NOT AN EMPTY LEVEL IN IT, and
   `levels` is what keeps the store from reporting one as a gap. */
t("each container declares the level it itemises AT ALL, and only that one",
  [ext(book)?.levels ?? null, ext(doc)?.levels ?? null, ext(deck)?.levels ?? null],
  [["sheets"], ["paragraphs"], ["slides"]]);
/* `lvl` distinguishes an ABSENT key from a NULL value, which `??` cannot: the
   whole point of this field is that the two are different facts. */
const lvl = (o, k) => (o ? (k in o ? o[k] : "KEY-ABSENT") : "NO-EXTENT");
t("    and the levels it has no notion of are NULL rather than zero",
  [lvl(ext(book), "paragraphs"), lvl(ext(book), "slides"),
   lvl(ext(doc), "sheets"), lvl(ext(deck), "paragraphs")],
  [null, null, null, null]);

/* D-359, ASSERTED RATHER THAN DESCRIBED: what the entries do NOT emit. */
t("the inner bounds are NOT invented — every sheet's rows/cols and every slide's shape "
  + "count are NULL, because no entry emits them (D-359)",
  [Array.isArray(ext(book)?.sheets)
     ? ext(book).sheets.every((s) => s && s.rows === null && s.cols === null) : null,
   Array.isArray(ext(deck)?.slides)
     ? ext(deck).slides.every((s) => s && s.shapes === null) : null],
  [true, true]);

console.log("\n--- 2. op=promote then op=reading: the extents are PERSISTED and readable ---");

const DOC_BOOK = "INFO-2026-9200-workbook";
const DOC_TEXT = "INFO-2026-9200-document";
const DOC_DECK = "INFO-2026-9200-deck";
await mustPromote(DOC_BOOK, infoMd(DOC_BOOK), "information", { reading: book });
await mustPromote(DOC_TEXT, infoMd(DOC_TEXT), "information", { reading: doc });
await mustPromote(DOC_DECK, infoMd(DOC_DECK), "information", { reading: deck });

const rBook = await get("reading", `sha256=${encodeURIComponent(book.capture.sha256)}`);
const rDoc = await get("reading", `sha256=${encodeURIComponent(doc.capture.sha256)}`);
const rDeck = await get("reading", `sha256=${encodeURIComponent(deck.capture.sha256)}`);
t("the three persisted readings are found",
  [rBook.found, rDoc.found, rDeck.found], [true, true, true]);
const pExt = (r) => (r && r.reading && r.reading.container_extent) || null;
t("and each carries its container extent THROUGH THE OP",
  [Array.isArray(pExt(rBook)?.sheets) ? pExt(rBook).sheets.map((s) => s && s.name) : null,
   pExt(rDoc)?.paragraphs ?? null,
   Array.isArray(pExt(rDeck)?.slides) ? pExt(rDeck).slides.length : null],
  [SHEET_NAMES, PARAS.length, SLIDE_TITLES.length]);

/* ============ 3. C-45.1 NOW FIRES ON ALL THREE OFFICE ARMS ============== */

console.log("\n--- 3. C-45.1 fires on each freshly acquired container, BY NAME (the accepts-when) ---");

const INQ_SHEET_OK = "INQ-2026-9200-sheet-ok";
const rSheetOk = await mustPromote(INQ_SHEET_OK, inquiryMd(INQ_SHEET_OK, { refs: [DOC_BOOK],
  legs: [{ target: DOC_BOOK, kind: "sheet-cell", sheet: SHEET_NAMES[0], cell: "B2" }] }), "inquiry");
t("a cell on a sheet the workbook HAS mints",
  [rSheetOk.content?.length, rSheetOk.content?.[0].extent_kind, rSheetOk.content?.[0].minted],
  [1, "sheet-cell", true]);

const INQ_SHEET_OOB = "INQ-2026-9200-sheet-oob";
const rSheetOob = await promote(INQ_SHEET_OOB, inquiryMd(INQ_SHEET_OOB, { refs: [DOC_BOOK],
  legs: [{ target: DOC_BOOK, kind: "sheet-cell", sheet: "NoSuchSheet", cell: "B14" }] }), "inquiry");
t("a cell on a sheet the workbook does NOT have is REFUSED BY NAME",
  [rSheetOob.ok, rSheetOob.reason, codes(rSheetOob)], [false, "BASIS_REFUSED", ["C-45.1"]]);
t("    and the refusal names the sheet list it was checked against",
  [new RegExp(`holds ${SHEET_NAMES.length} sheet\\(s\\)`).test(detail(rSheetOob)),
   detail(rSheetOob).includes(SHEET_NAMES[0]),
   /names a sheet called 'NoSuchSheet'/.test(detail(rSheetOob))],
  [true, true, true]);

const INQ_PARA_OK = "INQ-2026-9200-para-ok";
const rParaOk = await mustPromote(INQ_PARA_OK, inquiryMd(INQ_PARA_OK, { refs: [DOC_TEXT],
  legs: [{ target: DOC_TEXT, kind: "doc-para", para: PARAS.length - 1 }] }), "inquiry");
t("the LAST paragraph (0-based) mints — the bound is inclusive",
  [rParaOk.content?.[0].extent_kind, rParaOk.content?.[0].minted], ["doc-para", true]);

const INQ_PARA_OOB = "INQ-2026-9200-para-oob";
const rParaOob = await promote(INQ_PARA_OOB, inquiryMd(INQ_PARA_OOB, { refs: [DOC_TEXT],
  legs: [{ target: DOC_TEXT, kind: "doc-para", para: PARAS.length }] }), "inquiry");
t("a paragraph past the count is REFUSED BY NAME, 0-based bound stated",
  [rParaOob.ok, codes(rParaOob),
   new RegExp(`holds ${PARAS.length} paragraph\\(s\\) \\(0-${PARAS.length - 1}\\).*names paragraph ${PARAS.length}`)
     .test(detail(rParaOob))],
  [false, ["C-45.1"], true]);

const INQ_SLIDE_OK = "INQ-2026-9200-slide-ok";
const rSlideOk = await mustPromote(INQ_SLIDE_OK, inquiryMd(INQ_SLIDE_OK, { refs: [DOC_DECK],
  legs: [{ target: DOC_DECK, kind: "slide-shape", slide: SLIDE_TITLES.length }] }), "inquiry");
t("the LAST slide (1-based) mints — the bound is inclusive",
  [rSlideOk.content?.[0].extent_kind, rSlideOk.content?.[0].minted], ["slide-shape", true]);

const INQ_SLIDE_OOB = "INQ-2026-9200-slide-oob";
const rSlideOob = await promote(INQ_SLIDE_OOB, inquiryMd(INQ_SLIDE_OOB, { refs: [DOC_DECK],
  legs: [{ target: DOC_DECK, kind: "slide-shape", slide: SLIDE_TITLES.length + 1 }] }), "inquiry");
t("a slide past the deck is REFUSED BY NAME, 1-based bound stated",
  [rSlideOob.ok, codes(rSlideOob),
   new RegExp(`holds ${SLIDE_TITLES.length} slide\\(s\\) \\(1-${SLIDE_TITLES.length}\\).*names slide ${SLIDE_TITLES.length + 1}`)
     .test(detail(rSlideOob))],
  [false, ["C-45.1"], true]);

/* THE THREE LEVELS ARE INDEPENDENT, and this is what the three `drop*` arms
   separate: a workbook's sheet list bounds nothing about a deck. */
t("the three levels bound three different containers and never each other",
  [(await promote("INQ-2026-9200-cross-a", inquiryMd("INQ-2026-9200-cross-a", { refs: [DOC_BOOK],
     legs: [{ target: DOC_BOOK, kind: "doc-para", para: 9999 }] }), "inquiry")).ok !== false,
   (await promote("INQ-2026-9200-cross-b", inquiryMd("INQ-2026-9200-cross-b", { refs: [DOC_DECK],
     legs: [{ target: DOC_DECK, kind: "sheet-cell", sheet: "Summary", cell: "A1" }] }), "inquiry")).ok !== false],
  [true, true]);

/* =============== 4. D-359: THE INNER BOUNDS ARE NOT INVENTED =========== */

console.log("\n--- 4. the inner bounds this record does NOT hold: a cell inside a KNOWN sheet, "
          + "and a shape inside a KNOWN slide, still MINT (D-359 — over-strictness) ---");

/* `promote`, not `mustPromote`, DELIBERATELY: this is the arm an over-strict
   fence breaks, and a throw here would end the module while the tally read
   clean — the -1 failure WORKER.md names. The mint must be MEASURED. */
const rWildCell = await promote("INQ-2026-9200-wildcell",
  inquiryMd("INQ-2026-9200-wildcell", { refs: [DOC_BOOK],
    legs: [{ target: DOC_BOOK, kind: "sheet-cell", sheet: SHEET_NAMES[0], cell: "ZZ999999" }] }), "inquiry");
t("cell ZZ999999 of a sheet the workbook HAS mints: the entry emits no row or column "
  + "extent, so nobody measured that bound and refusing it would be a fence tighter than its rule",
  [rWildCell.ok !== false, rWildCell.content?.[0]?.extent_kind, rWildCell.content?.[0]?.minted],
  [true, "sheet-cell", true]);
const rWildShape = await promote("INQ-2026-9200-wildshape",
  inquiryMd("INQ-2026-9200-wildshape", { refs: [DOC_DECK],
    legs: [{ target: DOC_DECK, kind: "slide-shape", slide: 1, shape: 9999 }] }), "inquiry");
t("shape 9,999 of a slide the deck HAS mints, for the same reason — the shape count is "
  + "computed by `walkSlide` and returned by no entry",
  [rWildShape.ok !== false, rWildShape.content?.[0]?.extent_kind, rWildShape.content?.[0]?.minted],
  [true, "slide-shape", true]);

/* ========== 5. NULL IS NOT A REFUSAL, NOT A ZERO, AND STATES WHICH ====== */

console.log("\n--- 5. a capture with no container extent: two different absences, neither a refusal ---");

const html = (await acquire("/calendar.html")).document;
t("an HTML capture still acquires, and nothing ever tried to itemise a container — "
  + "the key is ABSENT, never a zero",
  ["container_extent" in html.reading, html.reading.container_extent], [false, undefined]);

const pdfdoc = (await acquire("/one.pdf")).document;
t("a PDF the wire READ carries the key, NULL — the wire ran and no entry itemised a container",
  ["container_extent" in pdfdoc.reading, pdfdoc.reading.container_extent], [true, null]);
t("the two absences are distinguishable, which is the point of carrying the key",
  ("container_extent" in html.reading) === ("container_extent" in pdfdoc.reading), false);

/* A capture acquired BEFORE this landing. No backfill was taken (the population
   is the same zero D-356 measured), so this is the live condition of the corpus
   and not a hypothetical: it still MINTS, deliberately. */
const SHA_LEGACY = sha("a workbook captured before CAP-12");
const DOC_LEGACY = "INFO-2026-9200-legacy";
await mustPromote(DOC_LEGACY, infoMd(DOC_LEGACY), "information",
  { reading: { capture: { sha256: SHA_LEGACY, encoding: "binary", bytes: 10 },
               reading: { content_type: "meeting_calendar", reader_version: 1, found: false,
                          at: NOW, entities: [], facts: {}, text_source: [{ step: "layer" }] } } });
const rLegacy = await promote("INQ-2026-9200-legacy",
  inquiryMd("INQ-2026-9200-legacy", { refs: [DOC_LEGACY],
    legs: [{ target: DOC_LEGACY, kind: "sheet-cell", sheet: "NoSuchSheet", cell: "ZZ9999999" }] }), "inquiry");
t("an impossible cell on a capture whose container extent was never recorded MINTS, not refused "
  + "— refusing a bound nobody measured would push a member toward citing the whole document",
  [rLegacy.ok !== false, rLegacy.content?.[0]?.extent_kind, rLegacy.content?.[0]?.minted],
  [true, "sheet-cell", true]);

/* THE OVER-STRICTNESS PIN THE ROW REQUIRES, AND IT IS A DIGEST TAKEN ON A
   PRISTINE `origin/main` CHECKOUT RATHER THAN A LIST OF EXPECTED STRINGS, which
   would agree with its author for free. Measured 2026-09-14 by running
   `test/cap12-pin.probe.mjs` against `173bc66`'s own `src/index.mjs` (CAP-9's
   landing) in a separate pristine worktree; timestamps are normalised to `<T>`
   because `reading.at` is the acquire time and varies per run, and the probe
   reproduced both digits-for-digit across two runs. The HTML reading must be
   BYTE-IDENTICAL — this item adds no key to it at all — and the PDF reading must
   be byte-identical once the ONE key this item adds is removed. */
const PRISTINE = { html: "ee68a49fb010bba202ccbf1ab4786a2aaef8fdb4111aa5277313f743a1e733dc",
                   pdf: "dfcf3384d44ebed29a4bdd2955e599c476b289319f97f3c1332c2ce39e1aea0d" };
const normDigest = (o) => createHash("sha256")
  .update(JSON.stringify(o).replace(/\d{4}-\d{2}-\d{2}T[0-9:.]+Z/g, "<T>")).digest("hex");
const pdfReadingSansNew = { ...pdfdoc.reading };
delete pdfReadingSansNew.container_extent;
t("an HTML capture's whole reading is BYTE-IDENTICAL to CAP-9's landing (pristine digest pin)",
  normDigest(html.reading), PRISTINE.html);
t("and a PDF capture's is too, once the ONE key this item adds is removed — nothing else "
  + "in the acquire document moved",
  normDigest(pdfReadingSansNew), PRISTINE.pdf);

/* ====== 6. A LEVEL THE CONTAINER HAS NO NOTION OF IS NOT A GAP ========== */

console.log("\n--- 6. a workbook's missing paragraph count is NOT an empty level (arm (h)) ---");

/* Driven through the op the member actually reads: `op=content` on a minted row
   is the only surface that states the capture's extents back, so the assertion
   is that a legal citation is NOT refused for a level the container lacks. */
const rMixedKind = await promote("INQ-2026-9200-notion",
  inquiryMd("INQ-2026-9200-notion", { refs: [DOC_BOOK],
    legs: [{ target: DOC_BOOK, kind: "doc-para", para: 0 }] }), "inquiry");
t("a doc-para leg on a WORKBOOK mints rather than being refused against a paragraph count "
  + "the container has no notion of — the record does not invent an absence",
  [rMixedKind.ok !== false, rMixedKind.content?.[0]?.minted], [true, true]);

/* ========== 7. THE ZERO THAT MUST NOT BE WRITTEN (arm (e)) ============== */

console.log("\n--- 7. an entry that itemised NOTHING writes NULL, never 0 ---");

/* Every entry's over-the-size-bound branch returns an EMPTY list with the guard
   marker beside it. Reading that as "this workbook holds no sheets" would be
   the record asserting a fact nobody established, and would make C-45.1 refuse
   every cell citation on a workbook too large to read — the exact inversion of
   the rule above. The condition is reached here through a container whose only
   declared sheet part is missing, so the entry answers with an empty list. */
const EMPTY_BOOK = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${XLSX_MAIN_CT}"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
  { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets></sheets></workbook>` },
  { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>` },
]);
const emptyMf = await (async () => EMPTY_BOOK)();
t("the empty-workbook fixture is a real container and not an empty buffer",
  [emptyMf.length > 200, emptyMf[0], emptyMf[1]], [true, 0x50, 0x4b]);

await mf.dispose();

/* A second instance, because the outbound service is fixed at construction and
   this fixture is deliberately built after the assertions above have run. */
const mf2 = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cap12b", MEMBER_TOKEN: "mem-cap12b", PROBE_TOKEN: "prb-cap12b",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname === "/empty.xlsx")
      return new Response(EMPTY_BOOK, { headers: { "content-type": XLSX_CT } });
    return new Response("unscripted", { status: 500 });
  },
});
const emptyDoc = (await (await mf2.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-cap12b",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov/empty.xlsx",
                                           authority: "City of Oakland" }) })).json()).document;
t("a workbook whose entry itemised NO sheets records NULL and never 0 — undetermined, "
  + "stated, and the sheet level still declared as one this container HAS",
  [emptyDoc.reading.container_extent === null
     ? null : emptyDoc.reading.container_extent.sheets,
   emptyDoc.reading.container_extent === null
     ? null : emptyDoc.reading.container_extent.levels],
  [null, ["sheets"]]);
await mf2.dispose();

/* D-186: the sandbox is this process's own and `sandbox.mjs` removes it on exit,
   but every Miniflare instance must still be taken down — `hygiene.test.mjs`
   asserts that every suite disposes every instance it built, and it caught
   CAP-9's new suite not doing so on its first full battery run. */
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
