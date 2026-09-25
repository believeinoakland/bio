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
 * slide half into its own arm: a mis-declared arm reads exactly like a partially-working subject.
 *
 * RE-RUN 2026-09-15 by COFF-11 after it changed this suite, and the re-run is the point. COFF-11
 * SPLIT the D-359 assertion and RENAMED two section-4 labels, so THREE of the declarations in
 * `nc-cap12.mjs` matched nothing and three arms read NOT AS DECLARED while every subject behaved
 * exactly right — the same mis-declared-arm failure this block already records, met a second time
 * one item later and by a DIFFERENT route: a later item editing the suite rather than the author
 * mis-stating the arm. Declarations CORRECTED at their sites (never exempted); all nine then AS
 * DECLARED, every restore byte-identical (`src/index.mjs` 545,806 B sha256 991c44d1d87f… and
 * `src/store.mjs` 2,088,831 B sha256 1503838c51f3…):
 * baseline 31/0 GREEN · dropsheets 26/5 (5/5) · droppara 28/3 (3/3) · dropslides 27/4 (4/4) ·
 * zero 30/1 (1/1) · notion 29/2 (2/2) · reader 27/4 (4/4) · overstrict 29/2 (2/2) ·
 * overstrict2 30/1 (1/1).
 *
 * AND THE LESSON IS NOT ABOUT THOSE THREE LABELS. A control harness's declarations are a SECOND
 * COPY of a suite's assertion names, and nothing in this repository makes the copy fail when the
 * original moves — it fails as a WRONG VERDICT instead, which is the one failure mode that looks
 * like the subject. Whoever next edits an assertion a `mustFail` names must re-run the harness. */

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
/* NEGATIVE CONTROL, COFF-11 (IC-100 / D-359) — SEVEN arms and a baseline, each armed ALONE with every other defence held open, re-runnable in one step with `node test/nc-coff11.mjs [arm]` from `bio-plane/`. RUN 2026-09-15, ALL SEVEN AS DECLARED, every restore verified byte-identically by sha256 AND by content with a byte count printed: `src/formats-xlsx.mjs` 33,691 B sha256 c5855053f670…, `src/pptx.mjs` 37,442 B sha256 1708977ce689…, `src/odf.mjs` 64,000 B sha256 08f4709dde58…. baseline xlsx 88/0 · pptx 116/0 · odf 140/0 · e2e 31/0 GREEN; dropxlsxbound 4/4 declared (5 failing across two suites); dropslideshapes 5/5 (6); dropodpshapes 2/2 (3); dropxlsxboundunread 1/1 (1); usedrangeasbound 4/4 (4); odsborrowsgrid 3/3 (3). TWO CAME BACK WRONG ON THE FIRST RUN AND ARE RECORDED AT THEIR SITES RATHER THAN SMOOTHED, and both were findings about the INSTRUMENT: (1) `dropxlsxbound` declared the DISAGREE assertion and it did NOT fire, because its first spelling (`rows === usedRows` expected false) is satisfied by a NULL bound too — the ASSERTION was too weak and was strengthened to require both figures be integers, which is the arm doing better than going red; (2) both xlsx arms declared the UNREAD-SHEET bound, which neither patch reaches — `xlsxText` emits the sheet object at TWO independent sites, and the seventh arm `dropxlsxboundunread` now covers the second rather than leaving it covered by nobody. AND ONE SURPRISING GREEN, kept because it is the more useful result: under `usedrangeasbound` the END-TO-END suite stayed green at 31/0 — not the arm failing but the measurement that the e2e suite cannot see this bound AT ALL today, because the acquire wire drops the producer's figure before the store reads it (D-359's residue, DELEGATED 2026-09-15). */
/* NEGATIVE CONTROL, COFF-12 (D-359's consumer half) - SIX arms and a baseline in `test/nc-coff12.mjs`, re-runnable in one step with `node test/nc-coff12.mjs [arm]` from `bio-plane/`. Each arm edits `src/index.mjs` ALONE with every other defence held OPEN, declares BEFORE it runs what MUST fail AND WHAT MUST NOT, and every restore is verified by sha256 AND by content against a UNIQUELY-NAMED per-arm pristine copy with a byte count printed and a 400 KB minimum guarded (never `git checkout --`). RUN 2026-09-15, ALL SIX AS DECLARED, `src/index.mjs` restored byte-identically every time at 562,707 B sha256 4f4c24a76c55...: baseline 47/0 GREEN; dropcellbound 4/4 declared (5 failing); dropslideshapes 5/5 (5); slidesbyposition 5/5 (5); borrowgrid 2/2 (2); usedasbound 4/4 (7) - and in EVERY arm **0 of the declared held-open assertions also broke**. THIS HARNESS CHECKS `mustNotFail` RATHER THAN DESCRIBING IT, which `nc-coff11.mjs` and `nc-cap12.mjs` do not: REC-83's own run had an arm break its declared held-open half with nothing but a human read to catch it, and an arm that takes the whole suite down proves nothing about its own subject. `slidesbyposition` is the arm worth reading - it restores the POSITIONAL slide map this wire carried from CAP-12 until today while LEAVING the passthrough intact, so it isolates the keying; nothing in this repository could see the defect it plants before this item's gapped-deck fixture existed. `borrowgrid` and `usedasbound` arm the DECISION rather than the patch (invent a grid OpenDocument never fixes; make the bound the used range), because a decision nothing can break is a decision nothing is enforcing. AND THE ITEM'S OWN FIRST SPELLING OF THE `.ods` ASSERTION WAS WRONG, kept at its site rather than smoothed: it read `?? "MISSING"`, and `null ?? "MISSING"` is `"MISSING"` - so a correctly carried NULL bound and a dropped key were the SAME observation, in the exact direction this item is about. CAP-12's OWN HARNESS WAS RE-RUN ON THIS TREE AND TWO OF ITS NINE ARMS HAD GONE DEAD: `dropsheets` and `dropslides` both read `ARMED NO, patch matched 0x` because their anchors quoted the literal-null lines this item replaced, and `overstrict`/`overstrict2` named assertion labels that moved with the flip. All four are CORRECTED IN PLACE with the reason at the site, never exempted, and `node test/nc-cap12.mjs` now reads **every arm AS DECLARED, all nine ARMED**. A control whose anchor has drifted fails silently in the direction that looks like success. */
/* NEGATIVE CONTROL, COFF-13 (IC-207, D-359's named residue — the DECK LENGTH) - three arms and a baseline in `test/nc-coff13.mjs`, re-runnable in one step with `node test/nc-coff13.mjs [arm]` from `bio-plane/`, driving this suite AND `formats-pptx.test.mjs`; each arm armed ALONE, declared BEFORE it runs what MUST fail and what MUST NOT, BOTH halves checked, every restore verified by sha256 AND by content against a uniquely-named per-arm pristine copy with a byte count printed and a per-file minimum guarded. RUN 2026-09-23, ALL THREE AS DECLARED, 0 held-open assertions broken in any arm; `src/pptx.mjs` restored byte-identically at 38,898 B sha256 2b29fc49d095..., `src/index.mjs` at 724,665 B sha256 406a2ccd33cf...: baseline e2e 56/0 · pptx 118/0 GREEN; `readablecount` (THE ROW'S DECLARED ARM - the pptx entry emits the READABLE slide count as the length) 8/8 declared, 9 failing - the trailing-slide arm fails BY NAME ("the entry's deckLength ... EXCEEDS the readable list", "(1) a citation of the unreadable LAST slide 3 MINTS", "(3) ... REFUSED C-45.1 ... naming the DECK's 3 slides") while the middle-gapped deck's four held; `wiredrop` (producer correct, wire ignores the length - what the record held before this item) 6/6, producer suite untouched at 118/0; `shortlength` (THE OVER-STRICTNESS ARM - a stated length SHORTER than an itemised slide) 9/9 with the middle-gapped deck's slots and citations HELD, so a stated length only ever lengthens the record. TWO DECLARATIONS WERE WRONG ON THE FIRST RUN AND ARE CORRECTED AT THEIR SITES in the harness, both findings about the ARM: the over-bound deck's "last slide MINTS" was declared to fail under `readablecount`/`wiredrop` and did not, because without a length NOTHING bounds that deck and it mints in both worlds (it is the admission half, now held open); and `shortlength` was declared against three assertions and broke nine, because on a deck whose only evidence of its length IS the stated length the lie bounds it wherever it falls. */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
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
    /* COFF-12: `store: true` writes the member UNCOMPRESSED (method 0). It is
       here for ONE reason and not as a convenience — OpenDocument 1.2 part 3
       requires the `mimetype` member to be FIRST and STORED, and `detectOdf`
       reads it synchronously without inflating, so a deflated mimetype is a
       package the ODF entries correctly refuse to claim. The same option in
       `formats-odf.test.mjs` builds its fixtures this way; this suite needs it
       to drive a REAL `.ods` capture through `op=acquire`. */
    const stored = f.store === true;
    const comp = stored ? data : deflateRawSync(data);
    const method = stored ? 0 : 8;
    const crc = crc32(data);
    /* COFF-13: `declare` LIES in the CENTRAL DIRECTORY ONLY about the member's
       uncompressed size — the COFF-6 metric the size guard sums before any
       inflation — so a small fixture reaches an entry's over-the-bound branch
       (`formats-pptx.test.mjs`'s `lieUncompressed`, the same device). The local
       header stays honest; the member is never inflated on that branch. */
    const declared = Number.isInteger(f.declare) ? f.declare : data.length;
    const local = Buffer.concat([
      u32le(0x04034b50), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(data.length),
      u16le(nameB.length), u16le(0), nameB, comp,
    ]);
    const central = Buffer.concat([
      u32le(0x02014b50), u16le(20), u16le(20), u16le(0x0800), u16le(method), u16le(0), u16le(0x21),
      u32le(crc), u32le(comp.length), u32le(declared),
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

/* ========== THE GAPPED DECK — COFF-12's OWN FIXTURE, AND IT EXISTS TO PROVE
 * THAT KEYING THE SLIDE MAP ON POSITION IS A DEFECT AND NOT A STYLE ==========
 *
 * THREE SLIDES ARE DECLARED in `<p:sldIdLst>` and all three are declared in
 * `[Content_Types].xml` and in the presentation's rels — and the PART for
 * slide 2 IS NOT IN THE ZIP. That is what an unreadable slide is in the wild
 * (a truncated upload, a part the producer never wrote), and `pptx.mjs` handles
 * it exactly as designed: `deckOf` still numbers the declared slots 1, 2, 3, and
 * `pptxText` pushes an `undetermined` entry for slide 2 and OMITS it from
 * `slides[]`, so the surviving units are slide 1 and slide 3 keeping their TRUE
 * numbers.
 *
 * THE SHAPE COUNTS ARE THE FIXTURE'S OWN GROUND TRUTH AND THEY ARE DELIBERATELY
 * DIFFERENT: slide 1 has TWO shapes and slide 3 has FOUR. Equal counts would
 * have made a mis-attribution invisible — the arm would have passed over a
 * defect, which is this project's most-repeated instrument failure — so the
 * asymmetry is the measurement and not decoration.
 *
 * WHAT A POSITIONAL MAP DOES TO IT, which is what this fixture measures: the
 * stored array becomes [{shapes:2}, {shapes:4}], length 2, so `coversSlideShape`
 * (which reads `slides[e.slide - 1]`) BOUNDS SLIDE 2 BY SLIDE 3'S FOUR SHAPES
 * and REFUSES SLIDE 3 as past a two-slide deck. Both directions are wrong at
 * once: the record admits a citation of a shape on a slide it cannot read, and
 * refuses a TRUE citation of a slide the deck has. Nothing in the battery could
 * see either before this fixture existed. */
const GAPPED_TITLES = ["MIDCYCLE OVERVIEW", "THE SLIDE THIS CAPTURE CANNOT READ",
                       "GENERAL PURPOSE FUND RECONCILIATION"];
const GAPPED_SHAPES = [2, null, 4];   // null = the part is absent; nothing to count
const GAPPED_MISSING = 2;             // the 1-based slide whose part is omitted
const slideXmlOfN = (title, n) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld ${P} ${A} ${R}><p:cSld><p:spTree>
<p:sp><p:txBody><a:p><a:r><a:t>${title}</a:t></a:r></a:p></p:txBody></p:sp>`
  + Array.from({ length: n - 1 }, (_, k) =>
      `<p:sp><p:txBody><a:p><a:r><a:t>Line ${k + 1}.</a:t></a:r></a:p></p:txBody></p:sp>`).join("")
  + `</p:spTree></p:cSld></p:sld>`;
const PPTX_GAPPED = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="${PPTX_CT}.main+xml"/>`
      + GAPPED_TITLES.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")
      + `</Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>` },
  { name: "ppt/presentation.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentation ${P} ${R}><p:sldIdLst>`
      + GAPPED_TITLES.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("")
      + `</p:sldIdLst></p:presentation>` },
  { name: "ppt/_rels/presentation.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
      + GAPPED_TITLES.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join("")
      + `</Relationships>` },
  /* EVERY slide part EXCEPT the missing one — the omission is the fixture. */
  ...GAPPED_TITLES.flatMap((title, i) => (i + 1 === GAPPED_MISSING ? [] : [
    { name: `ppt/slides/slide${i + 1}.xml`, data: slideXmlOfN(title, GAPPED_SHAPES[i]) },
    { name: `ppt/slides/_rels/slide${i + 1}.xml.rels`, data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>` },
  ])),
]);

/* ========== THE TRAILING-UNREADABLE DECK — COFF-13's OWN FIXTURE ==========
 *
 * The gapped deck above is unreadable in the MIDDLE, so its highest readable
 * slide number (3) already equals its length and a missing deck length is
 * invisible on it. THIS deck is unreadable at the END: three slides declared,
 * the part for slide 3 absent. Without the deck's own length the record's
 * highest slide number is the highest READABLE one — 2 — so a TRUE citation of
 * slide 3 is refused as past the deck (D-359's named residue). The accepts-when
 * names the liar: an entry emitting the READABLE count as the length passes
 * every assertion except the ones that require the length to EXCEED the
 * readable list, so those are asserted first and by name. */
const TRAILING_TITLES = ["AGENDA", "PROPOSED CUTS", "THE SLIDE THIS CAPTURE CANNOT READ"];
const TRAILING_SHAPES = [3, 1, null];   // null = the part is absent
const TRAILING_MISSING = 3;             // the LAST declared slide
const deckZipOf = (titles, shapes, { missing = 0, declare = {} } = {}) => zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="${PPTX_CT}.main+xml"/>`
      + titles.map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("")
      + `</Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>` },
  { name: "ppt/presentation.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentation ${P} ${R}><p:sldIdLst>`
      + titles.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`).join("")
      + `</p:sldIdLst></p:presentation>` },
  { name: "ppt/_rels/presentation.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
      + titles.map((_, i) => `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`).join("")
      + `</Relationships>` },
  ...titles.flatMap((title, i) => (i + 1 === missing ? [] : [
    { name: `ppt/slides/slide${i + 1}.xml`, data: slideXmlOfN(title, shapes[i]), declare: declare[i + 1] },
    { name: `ppt/slides/_rels/slide${i + 1}.xml.rels`, data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>` },
  ])),
]);
const PPTX_TRAILING = deckZipOf(TRAILING_TITLES, TRAILING_SHAPES, { missing: TRAILING_MISSING });
/* AND THE SAME DECK OVER THE SIZE BOUND: every slide part present, slide 1's
   declared uncompressed size a 64 MiB lie, so the entry reads NO slide text
   and returns `slides: []` beside the guard — while ppt/presentation.xml,
   which is structural and read regardless, still says how long the deck is. */
const OVERBOUND_SHAPES = [3, 1, 2];
const PPTX_OVERBOUND = deckZipOf(TRAILING_TITLES, OVERBOUND_SHAPES,
  { declare: { 1: 64 * 1024 * 1024 } });

/* ========== A REAL `.ods` WORKBOOK — the accepts-when clause that says an
 * HONESTLY NULL GRID BOUND MUST SURVIVE THIS WIRE ==========
 *
 * COFF-11 measured and drove the producer half of this: OpenDocument fixes no
 * maximum table size at all — the grid belongs to the producing application and
 * the file does not record it — so the entry emits `rows: null, cols: null`
 * beside a MEASURED used range, and its `odsborrowsgrid` arm breaks if a later
 * session borrows OOXML's figure.
 *
 * WHAT IS NEW HERE IS THE WIRE, and it is a different claim from the producer's.
 * COFF-12 makes `op=acquire` READ these figures, and a passthrough that coerced
 * — `Number(v) || null`, a `?? 0`, a borrowed default — would turn a stated
 * UNDETERMINED into an invented bound at exactly the seam where nobody was
 * looking. `coversSheetCell` REFUSES against whatever is stored, so an invented
 * grid here would refuse real citations on every OpenDocument workbook this
 * plane ever reads. The null is therefore asserted END TO END rather than
 * trusted to the producer suite, which cannot see this file. */
const ODS_CT = "application/vnd.oasis.opendocument.spreadsheet";
const ODS_NS = [
  'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"',
  'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"',
  'xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"',
].join(" ");
const ODS_SHEET_NAME = "Appropriations";
/* THE USED RANGE IS THE FIXTURE'S OWN GROUND TRUTH: two rows of two cells,
   written here and nowhere else, so the assertion is not an equality the code
   under test produced for itself. */
const ODS_USED_ROWS = 2, ODS_USED_COLS = 2;
const odsCell = (v) => `<table:table-cell office:value-type="string"><text:p>${v}</text:p></table:table-cell>`;
const ODS_CONTENT_XML = `<?xml version="1.0" encoding="UTF-8"?>`
  + `<office:document-content ${ODS_NS} office:version="1.3">`
  + `<office:automatic-styles/><office:body><office:spreadsheet>`
  + `<table:table table:name="${ODS_SHEET_NAME}">`
  + `<table:table-row>${odsCell("Department")}${odsCell("FY26 Adopted")}</table:table-row>`
  + `<table:table-row>${odsCell("Police")}${odsCell("2200000")}</table:table-row>`
  + `</table:table></office:spreadsheet></office:body></office:document-content>`;
const ODS = zip([
  /* FIRST and STORED — OpenDocument 1.2 part 3, and what the ODF discriminator
     reads without inflating. A deflated mimetype is a package it refuses. */
  { name: "mimetype", data: ODS_CT, store: true },
  { name: "META-INF/manifest.xml", data: `<?xml version="1.0" encoding="UTF-8"?>`
      + `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">`
      + `<manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="${ODS_CT}"/>`
      + `<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>`
      + `</manifest:manifest>` },
  { name: "content.xml", data: ODS_CONTENT_XML },
  { name: "styles.xml", data: `<?xml version="1.0"?><office:document-styles ${ODS_NS}/>` },
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

const mf = withSurfacingRun(new Miniflare({
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
    if (u.pathname === "/gapped.pptx") return bin(PPTX_GAPPED, PPTX_CT);
    if (u.pathname === "/trailing.pptx") return bin(PPTX_TRAILING, PPTX_CT);
    if (u.pathname === "/overbound.pptx") return bin(PPTX_OVERBOUND, PPTX_CT);
    if (u.pathname === "/budget.ods") return bin(ODS, ODS_CT);
    if (u.pathname === "/one.pdf") return bin(PDF, "application/pdf");
    if (u.pathname === "/calendar.html") return bin(HTML, "text/html; charset=utf-8");
    return new Response("unscripted", { status: 500 });
  },
}));

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
    meta: { object_type: type, group: "believe-in-oakland",
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
/* CORRECTED BY FW-19 (IC-124), NOT EXEMPTED, and the label is kept byte-identical
   so `nc-cap12.mjs`'s `notion` declaration still names it. The expectation read
   `[["sheets"], ["paragraphs"], ["slides"]]`, which was exact while each office
   entry itemised one level. FW-19 adds two levels the producers now emit —
   `tables` on a word-processing container (the `doc-table` bound) and `images`
   on every office container (the `image` bound) — so a DOCX genuinely itemises
   three levels and every container itemises its images. The rule this asserts
   is unchanged: only the levels THIS container has a notion of, and a workbook
   still declares no paragraphs and no tables. */
t("each container declares the level it itemises AT ALL, and only that one",
  [ext(book)?.levels ?? null, ext(doc)?.levels ?? null, ext(deck)?.levels ?? null],
  [["sheets", "images"], ["paragraphs", "tables", "images"], ["slides", "images"]]);
/* `lvl` distinguishes an ABSENT key from a NULL value, which `??` cannot: the
   whole point of this field is that the two are different facts. */
const lvl = (o, k) => (o ? (k in o ? o[k] : "KEY-ABSENT") : "NO-EXTENT");
t("    and the levels it has no notion of are NULL rather than zero",
  [lvl(ext(book), "paragraphs"), lvl(ext(book), "slides"),
   lvl(ext(doc), "sheets"), lvl(ext(deck), "paragraphs")],
  [null, null, null, null]);

/* D-359, ASSERTED RATHER THAN DESCRIBED.
 *
 * CORRECTED 2026-09-15 by COFF-11, and the correction is the FINDING rather
 * than housekeeping. CAP-12 wrote this assertion with the reason "because no
 * entry emits them", and that reason WAS true when it was written. COFF-11
 * landed the producer half — `xlsxText` now emits each sheet's `rows`/`cols`
 * and `usedRows`/`usedCols`, `pptxText` each slide's `shapes`, and `odf.mjs`
 * the same for `.ods`/`.odp` — and this assertion STILL PASSES UNCHANGED IN
 * VALUE. **That is the measurement: the stored figure is null not because the
 * producer is silent but because the ACQUIRE WIRE DROPS IT.**
 * `index.mjs`'s FW-15 projection reads the LEVELS by key presence and then
 * writes `rows: null, cols: null` and `shapes: null` as LITERALS, so a
 * producer that starts returning a field is not read. D-359 and COFF-11's own
 * brief both say the wire "carries them with no edit"; measured here, it does
 * not. The remaining edit is three lines in a file this item may not touch and
 * is filed as a DELEGATION in `CLAIMS.md` (2026-09-15).
 *
 * The assertion is therefore SPLIT: what the PRODUCERS now say, and what the
 * RECORD still holds, so the two can never again be read off one line. */
t("the PRODUCERS now emit the inner bounds — the entries return what they compute (COFF-11/IC-100)",
  [(await (await import("../src/formats-xlsx.mjs")).xlsxEntry
      .text(await (await import("../src/formats-xlsx.mjs")).xlsxEntry.parts(XLSX)))
      .sheets.every((s) => Number.isInteger(s.rows) && Number.isInteger(s.cols)),
   (await (await import("../src/pptx.mjs")).pptxEntry
      .text(await (await import("../src/pptx.mjs")).pptxEntry.parts(PPTX)))
      .slides.every((s) => Number.isInteger(s.shapes))],
  [true, true]);
/* CORRECTED 2026-09-15 by COFF-12, AND THE FLIP IS THE ITEM. This assertion read
   "and the RECORD still holds NULL for both — the acquire wire writes the literal
   and never reads the producer's figure", and it was TRUE and MEASURED when
   COFF-11 wrote it. The wire now reads the figure, so the same assertion with the
   same expected values would be pinning a defect that is gone. Its VALUE moves and
   its label moves with it, which is the whole reason COFF-11 split this line in two:
   what the producers say and what the record holds can never again be read off one
   line, and this is the line that had to move.

   IT IS THE PRODUCER'S OWN FIGURE AND NOT A FIGURE THIS WIRE CHOSE, which is the
   claim a passthrough actually makes and the one an `Number.isInteger` check alone
   would NOT catch. The entry is called directly here and the stored value compared
   against what it returned — two independent paths over the same bytes, not this
   suite agreeing with itself. The literal grid is pinned BESIDE that comparison
   (MEASUREMENTS.md M-22: a real producer kept `XFD1048576` and dropped `A1048577`)
   so that a producer and a wire drifting TOGETHER still fails here. */
const xlsxSheetsOf = async (bytes) => {
  const m = await import("../src/formats-xlsx.mjs");
  return (await m.xlsxEntry.text(await m.xlsxEntry.parts(bytes))).sheets;
};
const pptxSlidesOf = async (bytes) => {
  const m = await import("../src/pptx.mjs");
  return (await m.pptxEntry.text(await m.pptxEntry.parts(bytes))).slides;
};
const producedSheets = await xlsxSheetsOf(XLSX);
const producedSlides = await pptxSlidesOf(PPTX);
t("and the RECORD NOW HOLDS THE PRODUCER'S OWN FIGURE — the acquire wire READS it "
  + "(COFF-12, D-359's consumer half; this line read 'still holds NULL' until it landed)",
  [Array.isArray(ext(book)?.sheets)
     ? ext(book).sheets.map((s) => [s.rows, s.cols]) : null,
   Array.isArray(ext(deck)?.slides)
     ? ext(deck).slides.map((s) => s.shapes) : null],
  [producedSheets.map((s) => [s.rows, s.cols]), producedSlides.map((s) => s.shapes)]);
t("    and the grid it carries is the MEASURED OOXML grid, pinned so a producer and a wire "
  + "drifting together still fail here (M-22)",
  [ext(book)?.sheets?.every((s) => s.rows === 1048576 && s.cols === 16384) ?? null,
   ext(book)?.sheets?.length ?? null],
  [true, SHEET_NAMES.length]);
/* THE USED RANGE TRAVELS BESIDE THE BOUND AND BOUNDS NOTHING (IC-100's decision).
   Asserting it here is what makes "empty at capture" and "outside the grid" two
   readable facts in the RECORD rather than only in the producer, and COFF-11's
   `usedrangeasbound` arm is what breaks if anyone ever fences on it. */
t("    the USED range is carried BESIDE the bound, under its own name, and DISAGREES with it "
  + "— two different facts, neither pretending to be the other",
  [ext(book)?.sheets?.every((s) => Number.isInteger(s.usedRows) && Number.isInteger(s.usedCols)) ?? null,
   ext(book)?.sheets?.every((s) => s.usedRows < s.rows && s.usedCols < s.cols) ?? null],
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

console.log("\n--- 4. the inner bounds: what MINTS correctly under COFF-11's decision, and what still "
          + "mints because the acquire wire drops the figure the producers now emit (D-359) ---");

/* `promote`, not `mustPromote`, DELIBERATELY: this is the arm an over-strict
   fence breaks, and a throw here would end the module while the tally read
   clean — the -1 failure WORKER.md names. The mint must be MEASURED. */
const rWildCell = await promote("INQ-2026-9200-wildcell",
  inquiryMd("INQ-2026-9200-wildcell", { refs: [DOC_BOOK],
    legs: [{ target: DOC_BOOK, kind: "sheet-cell", sheet: SHEET_NAMES[0], cell: "ZZ999999" }] }), "inquiry");
/* CORRECTED 2026-09-15 by COFF-11. CAP-12's reason — "the entry emits no row
   or column extent" — is now FALSE: the entry emits it (IC-100). The VALUE is
   unchanged and the new reason is different in kind, so the label is rewritten
   rather than left to mean something it no longer means.

   AND ZZ999999 CHANGES CATEGORY RATHER THAN OUTCOME, which is the decision
   COFF-11 carries made visible on the one address this suite already drove.
   Row 999,999 is INSIDE the XLSX grid (1,048,576 rows, MEASURED — see
   `MEASUREMENTS.md` 2026-09-15). Under the bound this item chose — the grid,
   never the used range — that cell EXISTS and was EMPTY at capture, so minting
   it is CORRECT and will stay correct when the wire lands. It stopped being a
   cost of the gap the moment the decision was taken. The address that is
   genuinely IMPOSSIBLE is driven immediately below it. */
t("cell ZZ999999 of a sheet the workbook HAS mints — and under COFF-11's decision this is RIGHT, "
  + "not a gap: row 999,999 is inside the grid, so the cell exists and was empty at capture",
  [rWildCell.ok !== false, rWildCell.content?.[0]?.extent_kind, rWildCell.content?.[0]?.minted],
  [true, "sheet-cell", true]);
/* THE ADDRESS THAT IS ACTUALLY IMPOSSIBLE — one row past the measured grid.
   CORRECTED 2026-09-15 by COFF-12, AND THIS IS THE ACCEPTS-WHEN CLAUSE COFF-11
   COULD NOT MAKE LIVE. It read "still MINTS: the producer emits the bound and the
   acquire wire drops it", measured under a TEMPORARY arm rather than predicted, and
   COFF-11 recorded exactly this flip as the one its delegation would produce. The
   wire landed; the flip is here, DRIVEN ON THIS TREE and under no arm at all.
   The refusal is checked BY CODE AND BY SENTENCE — a C-45.1 whose detail did not
   carry the figure would be a refusal a member could not act on, and the figure is
   the only part of it that says which bound was applied. */
const rImpossibleCell = await promote("INQ-2026-9200-impossiblecell",
  inquiryMd("INQ-2026-9200-impossiblecell", { refs: [DOC_BOOK],
    legs: [{ target: DOC_BOOK, kind: "sheet-cell", sheet: SHEET_NAMES[0], cell: "A1048577" }] }), "inquiry");
t("cell A1048577 — one row PAST the measured grid, an address no XLSX can hold — is now REFUSED "
  + "C-45.1 BY NAME (COFF-12; this line read 'still MINTS' until the acquire wire landed)",
  [rImpossibleCell.ok, rImpossibleCell.reason, codes(rImpossibleCell)],
  [false, "BASIS_REFUSED", ["C-45.1"]]);
t("    and the refusal carries THE FIGURE it was checked against, and the sheet it names",
  [new RegExp(`sheet '${SHEET_NAMES[0]}' of this capture holds 1048576 row\\(s\\) \\(1-1048576\\)`)
     .test(detail(rImpossibleCell)),
   /names row 1048577/.test(detail(rImpossibleCell))],
  [true, true]);
const rWildShape = await promote("INQ-2026-9200-wildshape",
  inquiryMd("INQ-2026-9200-wildshape", { refs: [DOC_DECK],
    legs: [{ target: DOC_DECK, kind: "slide-shape", slide: 1, shape: 9999 }] }), "inquiry");
/* CORRECTED 2026-09-15 by COFF-12, the other half of the same flip, and here there
   was never a category question to settle: a slide's shape list is EXHAUSTIVE, so
   shape 9,999 of this deck's slide 1 is impossible under ANY bound and refusing it
   refuses only the impossible. This line read "still MINTS ... dropped at the same
   wire"; the wire now reads it. */
t("shape 9,999 of a slide the deck HAS is now REFUSED C-45.1 BY NAME (COFF-12; this line read "
  + "'still MINTS' until the acquire wire landed)",
  [rWildShape.ok, rWildShape.reason, codes(rWildShape)],
  [false, "BASIS_REFUSED", ["C-45.1"]]);
t("    and the refusal carries THE SLIDE'S OWN SHAPE COUNT, 0-based bound stated",
  [new RegExp(`slide 1 of this capture holds ${producedSlides[0].shapes} shape\\(s\\) `
            + `\\(0-${producedSlides[0].shapes - 1}\\)`).test(detail(rWildShape)),
   /names shape 9999/.test(detail(rWildShape))],
  [true, true]);
/* THE INSIDE-THE-LIST DIRECTION, in the same breath, because a fence proved only by
   what it REFUSES is a fence nobody has shown to be the right size. The LAST shape
   of slide 1 is 0-based `shapes - 1` and must mint. */
const rLastShape = await promote("INQ-2026-9200-lastshape",
  inquiryMd("INQ-2026-9200-lastshape", { refs: [DOC_DECK],
    legs: [{ target: DOC_DECK, kind: "slide-shape", slide: 1, shape: producedSlides[0].shapes - 1 }] }),
  "inquiry");
t("    and the LAST shape of that slide (0-based) still MINTS — the bound is inclusive and is "
  + "not one shape tight",
  [rLastShape.ok !== false, rLastShape.content?.[0]?.extent_kind, rLastShape.content?.[0]?.minted],
  [true, "slide-shape", true]);

/* ===== 4b. THE SLIDE MAP IS KEYED ON `slide`, NOT ON POSITION (COFF-12) ===== */

console.log("\n--- 4b. a deck with an UNREADABLE slide: the shape counts must follow the slide "
          + "NUMBER and never the array position ---");

const gapped = (await acquire("/gapped.pptx")).document;

/* THE FIXTURE MUST ACTUALLY PRODUCE THE GAP, ASSERTED BEFORE ANYTHING IS
   CONCLUDED FROM IT. An arm that never armed is a finding, and a "gapped" deck
   whose slides all read would make every assertion below pass over a case that
   never occurred — which is exactly the shape of the headline-over-an-empty-
   corpus failure this repository has met three times. So the producer's own
   answer is read first: it must hold ONE FEWER unit than the deck declares, the
   survivors must keep their TRUE numbers, and the missing one must be STATED. */
const gappedProduced = await pptxSlidesOf(PPTX_GAPPED);
const gappedText = await (async () => {
  const m = await import("../src/pptx.mjs");
  return m.pptxEntry.text(await m.pptxEntry.parts(PPTX_GAPPED));
})();
console.log(`  corpus: 1 deck DECLARING ${GAPPED_TITLES.length} slides with the part for slide `
          + `${GAPPED_MISSING} absent — the producer returns ${gappedProduced.length} unit(s), `
          + `numbered ${gappedProduced.map((u) => u.slide).join(", ")}, with shape counts `
          + `${gappedProduced.map((u) => u.shapes).join(", ")}`);
t("the fixture ARMS: the entry omits the unreadable slide, STATES it, and the survivors keep "
  + "their TRUE 1-based numbers — the pre-condition every assertion below rests on",
  [gappedProduced.length, gappedProduced.map((u) => u.slide),
   gappedProduced.map((u) => u.shapes),
   gappedText.undetermined.some((u) => u.reason === "slide_unreadable")],
  [GAPPED_TITLES.length - 1, [1, 3], [GAPPED_SHAPES[0], GAPPED_SHAPES[2]], true]);
t("    and the two readable slides carry DIFFERENT shape counts — equal counts would make a "
  + "mis-attribution invisible and this whole section vacuous",
  gappedProduced[0].shapes !== gappedProduced[1].shapes, true);

/* WHAT THE RECORD HOLDS. The stored array is indexed by SLIDE NUMBER, so the
   unreadable slide occupies its own slot with a NULL count — UNDETERMINED AND
   STATED, never a zero, because the deck HAS that slide and this capture could
   not read it. A positional map would have stored [{shapes:2},{shapes:4}]. */
t("the RECORD keys the shape counts on the SLIDE NUMBER: the unreadable slide holds its own "
  + "slot with a NULL count, and slide 3's count is at slide 3",
  [Array.isArray(ext(gapped)?.slides) ? ext(gapped).slides.length : null,
   Array.isArray(ext(gapped)?.slides) ? ext(gapped).slides.map((x) => x && x.shapes) : null],
  [GAPPED_TITLES.length, GAPPED_SHAPES]);

const DOC_GAPPED = "INFO-2026-9200-gappeddeck";
await mustPromote(DOC_GAPPED, infoMd(DOC_GAPPED), "information", { reading: gapped });

/* THE FOUR CITATIONS THIS KEYING DECIDES, AND EACH IS WRONG THE OTHER WAY UNDER
   A POSITIONAL MAP. They are driven as four separate legs rather than described,
   because the whole defect is invisible to every other assertion in this file. */
const rGapLastSlide = await promote("INQ-2026-9200-gap-lastslide",
  inquiryMd("INQ-2026-9200-gap-lastslide", { refs: [DOC_GAPPED],
    legs: [{ target: DOC_GAPPED, kind: "slide-shape", slide: GAPPED_TITLES.length }] }), "inquiry");
t("(1) the LAST declared slide MINTS — the deck has it. Under a positional map the deck would "
  + `read ${GAPPED_TITLES.length - 1} slides long and this TRUE citation would be REFUSED`,
  [rGapLastSlide.ok !== false, rGapLastSlide.content?.[0]?.extent_kind,
   rGapLastSlide.content?.[0]?.minted],
  [true, "slide-shape", true]);

const rGapLastShape = await promote("INQ-2026-9200-gap-lastshape",
  inquiryMd("INQ-2026-9200-gap-lastshape", { refs: [DOC_GAPPED],
    legs: [{ target: DOC_GAPPED, kind: "slide-shape", slide: GAPPED_TITLES.length,
             shape: GAPPED_SHAPES[2] - 1 }] }), "inquiry");
t(`(2) its LAST shape (0-based ${GAPPED_SHAPES[2] - 1} of ${GAPPED_SHAPES[2]}) MINTS — the count `
  + "that bounds slide 3 is SLIDE 3's",
  [rGapLastShape.ok !== false, rGapLastShape.content?.[0]?.minted], [true, true]);

const rGapPastShape = await promote("INQ-2026-9200-gap-pastshape",
  inquiryMd("INQ-2026-9200-gap-pastshape", { refs: [DOC_GAPPED],
    legs: [{ target: DOC_GAPPED, kind: "slide-shape", slide: GAPPED_TITLES.length,
             shape: GAPPED_SHAPES[2] }] }), "inquiry");
t(`(3) one shape PAST it is REFUSED C-45.1 BY NAME, naming slide ${GAPPED_TITLES.length} and ITS `
  + "own count — the figure in the refusal is what says which bound was applied",
  [rGapPastShape.ok, codes(rGapPastShape),
   new RegExp(`slide ${GAPPED_TITLES.length} of this capture holds ${GAPPED_SHAPES[2]} shape\\(s\\)`)
     .test(detail(rGapPastShape))],
  [false, ["C-45.1"], true]);

/* THE UNREADABLE SLIDE ITSELF, AND IT IS THE ARM THAT SEPARATES THIS ITEM FROM A
   TIDIER-LOOKING ONE. Its shape count is UNKNOWN, so no shape on it may be
   refused: skipping is the record saying "I could not read that slide", and
   refusing would be the record claiming a bound it never measured. A positional
   map bounds it by slide 3's four shapes and refuses shape 4 outright. */
const rGapUnreadable = await promote("INQ-2026-9200-gap-unreadable",
  inquiryMd("INQ-2026-9200-gap-unreadable", { refs: [DOC_GAPPED],
    legs: [{ target: DOC_GAPPED, kind: "slide-shape", slide: GAPPED_MISSING,
             shape: GAPPED_SHAPES[2] }] }), "inquiry");
t(`(4) a shape on the UNREADABLE slide ${GAPPED_MISSING} MINTS — its count is UNDETERMINED and is `
  + "SKIPPED, never guessed. Under a positional map it is bounded by ANOTHER slide's count and "
  + "this citation is refused against a figure that was never measured",
  [rGapUnreadable.ok !== false, rGapUnreadable.content?.[0]?.extent_kind,
   rGapUnreadable.content?.[0]?.minted],
  [true, "slide-shape", true]);

/* ===== 4b'. THE DECK'S OWN LENGTH (COFF-13, IC-207) ===== */

console.log("\n--- 4b'. a deck whose LAST slide is unreadable: the record must be as long as the "
          + "DECK, not as its last readable slide ---");

const trailingText = await (async () => {
  const m = await import("../src/pptx.mjs");
  return m.pptxEntry.text(await m.pptxEntry.parts(PPTX_TRAILING));
})();
console.log(`  corpus: 1 deck DECLARING ${TRAILING_TITLES.length} slides with the part for slide `
          + `${TRAILING_MISSING} (the LAST) absent — the producer returns `
          + `${trailingText.slides.length} readable unit(s) and deckLength ${trailingText.deckLength}`);
/* THE LIAR'S ARM, FIRST AND BY NAME. The fixture must actually produce a
   trailing gap (readable list shorter than the deck), and the LENGTH must
   EXCEED that list — an entry that emitted the readable count would pass every
   later assertion that only checks a length was present. */
t("the fixture ARMS: the entry omits the unreadable LAST slide and STATES it — the readable list "
  + "is one short of the deck",
  [trailingText.slides.map((u) => u.slide),
   trailingText.undetermined.some((u) => u.reason === "slide_unreadable")],
  [[1, 2], true]);
t("the entry's deckLength is the slides the DECK declares and EXCEEDS the readable list — "
  + "emitting the readable count is the defect",
  [trailingText.deckLength, trailingText.deckLength > trailingText.slides.length],
  [TRAILING_TITLES.length, true]);

const trailing = (await acquire("/trailing.pptx")).document;
t("the RECORD holds a slot for EVERY slide of the deck — the unreadable last one with a NULL "
  + "count — and the deck length BESIDE the list under its own name",
  [Array.isArray(ext(trailing)?.slides) ? ext(trailing).slides.map((x) => x && x.shapes) : null,
   lvl(ext(trailing), "deckLength")],
  [TRAILING_SHAPES, TRAILING_TITLES.length]);

const DOC_TRAILING = "INFO-2026-9200-trailingdeck";
await mustPromote(DOC_TRAILING, infoMd(DOC_TRAILING), "information", { reading: trailing });

const rTrailLast = await promote("INQ-2026-9200-trail-last",
  inquiryMd("INQ-2026-9200-trail-last", { refs: [DOC_TRAILING],
    legs: [{ target: DOC_TRAILING, kind: "slide-shape", slide: TRAILING_MISSING }] }), "inquiry");
t(`(1) a citation of the unreadable LAST slide ${TRAILING_MISSING} MINTS — the deck has it. `
  + `Without the deck length the record reads ${TRAILING_TITLES.length - 1} slides long and this `
  + "TRUE citation is refused",
  [rTrailLast.ok !== false, rTrailLast.content?.[0]?.extent_kind, rTrailLast.content?.[0]?.minted],
  [true, "slide-shape", true]);

const rTrailShape = await promote("INQ-2026-9200-trail-shape",
  inquiryMd("INQ-2026-9200-trail-shape", { refs: [DOC_TRAILING],
    legs: [{ target: DOC_TRAILING, kind: "slide-shape", slide: TRAILING_MISSING, shape: 7 }] }),
  "inquiry");
t("(2) and a SHAPE on it MINTS — its count is UNDETERMINED and skipped, never guessed",
  [rTrailShape.ok !== false, rTrailShape.content?.[0]?.minted], [true, true]);

const rTrailPast = await promote("INQ-2026-9200-trail-past",
  inquiryMd("INQ-2026-9200-trail-past", { refs: [DOC_TRAILING],
    legs: [{ target: DOC_TRAILING, kind: "slide-shape", slide: TRAILING_TITLES.length + 1 }] }),
  "inquiry");
t(`(3) a citation PAST the real deck (slide ${TRAILING_TITLES.length + 1}) is still REFUSED C-45.1 `
  + `BY NAME, the refusal naming the DECK's ${TRAILING_TITLES.length} slides`,
  [rTrailPast.ok, codes(rTrailPast),
   new RegExp(`deck holds ${TRAILING_TITLES.length} slide\\(s\\) \\(1-${TRAILING_TITLES.length}\\)`)
     .test(detail(rTrailPast))],
  [false, ["C-45.1"], true]);

/* THE OVER-THE-BOUND DECK. Its text is refused as a stated undetermined, so
   `slides[]` comes back EMPTY — and before COFF-13 the record held NO slide
   list for it at all, so every slide citation on it minted unbounded. The
   length is structural and was read anyway: the OUTER bound is fed, every
   slot's shape count is NULL, and the store names that as the missing half. */
const overbound = (await acquire("/overbound.pptx")).document;
t("an OVER-THE-BOUND deck: no slide text was read, and the record still holds the deck's "
  + "length — one NULL-count slot per declared slide, the length beside it",
  [Array.isArray(ext(overbound)?.slides) ? ext(overbound).slides.map((x) => x && x.shapes) : null,
   lvl(ext(overbound), "deckLength")],
  [TRAILING_TITLES.map(() => null), TRAILING_TITLES.length]);
const DOC_OVERBOUND = "INFO-2026-9200-overbounddeck";
await mustPromote(DOC_OVERBOUND, infoMd(DOC_OVERBOUND), "information", { reading: overbound });
const rOverLast = await promote("INQ-2026-9200-over-last",
  inquiryMd("INQ-2026-9200-over-last", { refs: [DOC_OVERBOUND],
    legs: [{ target: DOC_OVERBOUND, kind: "slide-shape", slide: TRAILING_TITLES.length, shape: 50 }] }),
  "inquiry");
t("    its last slide, any shape, MINTS — the slide exists and its shape count was never read",
  [rOverLast.ok !== false, rOverLast.content?.[0]?.minted], [true, true]);
const rOverPast = await promote("INQ-2026-9200-over-past",
  inquiryMd("INQ-2026-9200-over-past", { refs: [DOC_OVERBOUND],
    legs: [{ target: DOC_OVERBOUND, kind: "slide-shape", slide: TRAILING_TITLES.length + 1 }] }),
  "inquiry");
t("    and a slide past it is REFUSED C-45.1 BY NAME with the deck's figure",
  [rOverPast.ok, codes(rOverPast),
   new RegExp(`deck holds ${TRAILING_TITLES.length} slide\\(s\\)`).test(detail(rOverPast))],
  [false, ["C-45.1"], true]);

/* ===== 4c. `.ods`: AN HONESTLY NULL GRID BOUND SURVIVES THE WIRE (COFF-12) ===== */

console.log("\n--- 4c. an OpenDocument workbook: OpenDocument fixes no maximum table size, so the "
          + "grid bound is NULL — a STATEMENT, and the wire must not invent one ---");

const odsbook = (await acquire("/budget.ods")).document;
t("the ODF workbook acquires and the FORMAT axis recognised it",
  [odsbook.profile.format.format, ext(odsbook)?.levels ?? null,
   Array.isArray(ext(odsbook)?.sheets) ? ext(odsbook).sheets.map((x) => x && x.name) : null],
  /* FW-19 (IC-124): `images` joins `sheets` — every office entry now itemises
     its image list. Corrected, not exempted; the sheet half is unchanged. */
  ["ods", ["sheets", "images"], [ODS_SHEET_NAME]]);
/* THE NULL IS THE ASSERTION. A passthrough that coerced — `Number(v) || null`, a
   `?? 0`, an OOXML default borrowed because one was handy — would turn a stated
   UNDETERMINED into a bound this wire invented, at the one seam where the
   producer suite cannot see it. `coversSheetCell` REFUSES against whatever is
   stored, so an invented grid here refuses real citations on every OpenDocument
   workbook the plane ever reads. */
/* THE FIRST SPELLING OF THIS ASSERTION WAS WRONG AND IS KEPT AS A FINDING RATHER
   THAN SMOOTHED, because it failed in the exact direction this whole item is
   about. It read `?? "MISSING"`, and `null ?? "MISSING"` is `"MISSING"` — so a
   correctly carried NULL bound and a key the wire never wrote were the SAME
   observation, and the arm could not have told an honest undetermined from a
   dropped field. `lvl` is the discriminator this file already keeps for exactly
   that reason (`k in o` against `??`), and it is used here. A control that cannot
   distinguish its two outcomes is not a control. */
t("its grid bound is NULL — PRESENT and null, not absent — and its USED range is MEASURED: two "
  + "different facts, and the wire carried both without inventing the first",
  [lvl(ext(odsbook)?.sheets?.[0], "rows"), lvl(ext(odsbook)?.sheets?.[0], "cols"),
   lvl(ext(odsbook)?.sheets?.[0], "usedRows"), lvl(ext(odsbook)?.sheets?.[0], "usedCols")],
  [null, null, ODS_USED_ROWS, ODS_USED_COLS]);

const DOC_ODS = "INFO-2026-9200-odsbook";
await mustPromote(DOC_ODS, infoMd(DOC_ODS), "information", { reading: odsbook });
const rOdsWild = await promote("INQ-2026-9200-odswild",
  inquiryMd("INQ-2026-9200-odswild", { refs: [DOC_ODS],
    legs: [{ target: DOC_ODS, kind: "sheet-cell", sheet: ODS_SHEET_NAME, cell: "A1048577" }] }),
  "inquiry");
t("so the very address an XLSX REFUSES still MINTS here — the cell arm is SKIPPED on a format "
  + "that fixes no grid, never bounded by a figure borrowed from another format",
  [rOdsWild.ok !== false, rOdsWild.content?.[0]?.extent_kind, rOdsWild.content?.[0]?.minted],
  [true, "sheet-cell", true]);
/* AND THE OUTER BOUND IS STILL LIVE ON IT, which is what keeps "the grid is
   undetermined" from being read as "nothing about this workbook is known". */
const rOdsNoSheet = await promote("INQ-2026-9200-odsnosheet",
  inquiryMd("INQ-2026-9200-odsnosheet", { refs: [DOC_ODS],
    legs: [{ target: DOC_ODS, kind: "sheet-cell", sheet: "NoSuchSheet", cell: "A1" }] }), "inquiry");
t("    while an unknown SHEET on the same workbook is still REFUSED C-45.1 BY NAME — the outer "
  + "bound is fed and the inner one is honestly undetermined, and the two are independent",
  [rOdsNoSheet.ok, codes(rOdsNoSheet), /names a sheet called 'NoSuchSheet'/.test(detail(rOdsNoSheet))],
  [false, ["C-45.1"], true]);

/* ========== 5. NULL IS NOT A REFUSAL, NOT A ZERO, AND STATES WHICH ====== */

console.log("\n--- 5. a capture with no container extent: two different absences, neither a refusal ---");

const html = (await acquire("/calendar.html")).document;
t("an HTML capture still acquires, and nothing ever tried to itemise a container — "
  + "the key is ABSENT, never a zero",
  ["container_extent" in html.reading, html.reading.container_extent], [false, undefined]);

const pdfdoc = (await acquire("/one.pdf")).document;
/* CORRECTED 2026-09-23 BY D-420, NOT EXEMPTED. This assertion read `[true, null]`
   — "the wire ran and no entry itemised a container" — and that was TRUE of every
   PDF until D-420, because nothing persisted what a PDF's pages paint; it was also
   the defect D-420 closes (an `image {page, rect}` row bounded by the page set
   alone). A PDF now carries ONE level, `images`, and this 1-page text-only PDF's
   list is a MEASURED ZERO, never null. The key-present half of the claim — which
   is what this section is about — is unchanged; the NULL form now belongs to a PDF
   acquired before D-420, driven in `d420-image-page.test.mjs`. */
t("a PDF the wire READ carries the key — since D-420 its ONE level, `images`, here a MEASURED "
  + "EMPTY list (a text-only page paints no image), never null",
  ["container_extent" in pdfdoc.reading, pdfdoc.reading.container_extent],
  [true, { container: "pdf", levels: ["images"], images: [] }]);
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
/* CORRECTED 2026-09-24 by D-536, never exempted and never re-pinned: every reading now carries ONE
   more key, `provenance` (framework Part II §16, "Reading provenance" — its tier, member and the SHA-256
   of the text it classified), and this pin's rule is that a key a LATER item adds is removed by NAME
   before the digest is taken, exactly as CAP-12 removes its own. With `provenance` removed from both
   readings the two PRISTINE digests above still match unchanged, which is the proof that D-536 moved
   nothing else. That the key is PRESENT is asserted here too, so removing it cannot hide its absence. */
t("D-536: both readings carry their provenance", [!!html.reading.provenance, !!pdfdoc.reading.provenance], [true, true]);
const htmlReadingSansD536 = { ...html.reading };
delete htmlReadingSansD536.provenance;
delete pdfReadingSansNew.provenance;
t("an HTML capture's whole reading is BYTE-IDENTICAL to CAP-9's landing (pristine digest pin)",
  normDigest(htmlReadingSansD536), PRISTINE.html);
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
const mf2 = withSurfacingRun(new Miniflare({
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
}));
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
  /* FW-19 (IC-124): the image level is declared too — corrected, not exempted. */
  [null, ["sheets", "images"]]);
await mf2.dispose();

/* D-186: the sandbox is this process's own and `sandbox.mjs` removes it on exit,
   but every Miniflare instance must still be taken down — `hygiene.test.mjs`
   asserts that every suite disposes every instance it built, and it caught
   CAP-9's new suite not doing so on its first full battery run. */
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
