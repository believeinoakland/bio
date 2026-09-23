/* NEGATIVE CONTROL: the eight arms live in `test/nc-rec85.mjs` and are re-run in one step with `node test/nc-rec85.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN — results recorded in this file's own report and in the item's report. (a) `baseline` — nothing armed; MUST be green, and it is the row that distinguishes eight-arms-working from eight-arms-broken. (b) `sheetcell` — in checks/bio-checks.mjs neuter `coversSheetCell` to `return null`; the THREE sheet-cell container refusals (an unknown sheet, a row past the last, a column past the last) MUST FAIL BY NAME as C-45.1, and the doc-para and slide-shape container arms MUST STAY GREEN — they are three separate predicates and an arm that took all three down would not have shown that. (c) `docpara` — neuter `coversDocPara` to `return null`; the paragraph-past-the-count arm MUST FAIL BY NAME and the other two arms' container refusals stay green. (d) `slideshape` — neuter `coversSlideShape` to `return null`; the slide-past-the-deck and shape-past-the-slide arms MUST FAIL BY NAME and the other two stay green. (e) `a1` — neuter `a1ToRowCol`'s BIJECTIVE base-26 accumulation to ordinary base 26 (`col * 26 + (ch - 65)`), which puts AA at 26 instead of 27; the column-boundary sweep MUST FAIL, and it is the arm that proves the sweep is measuring the accumulator rather than decorating the suite. (f) `onebased` — in `checkContentExtent` admit `slide: 0` (`e.slide < 1` -> `e.slide < 0`); the "slide is 1-BASED and 0 is refused" arm MUST FAIL, because two spellings of slide 1 would then both mint and IC-1's numbering would be two numberings. (g) `canon` — THE ARM'S OWN ARM: neuter ALL THREE of `canonicalExtent`'s new branches so every arm falls through to the `{kind, fields}` catch-all, which `legExtent` no longer fills — every address of one kind then collapses to ONE id; the seven dedup assertions (two cells, two sheets, two paragraphs, a run, two shapes, a whole slide, and the canonical-form pin) MUST FAIL, because a dedup that is true for every input is true for no reason (REC-82's `address` arm, applied to the arms this item adds). (h) `overstrict` — the OVER-STRICTNESS direction: make the three container predicates refuse when the record holds NO container extent (treat a null level as zero). Every legal in-range citation is then refused — including the suite's own FIXTURES, so the suite DIES before any assertion runs and the declaration for this arm is `mustThrow` rather than `mustFail`: it must not reach its own foot, and the crash must name C-45.1 on the first legal cell citation. A fence tighter than its rule is not a safer fence, and refusing a citation for a bound NOBODY MEASURED is precisely the direction that pushes a member into citing the whole document, which claims MORE. */
/* RESULTS, run 2026-09-14 by the REC-85 worker, each arm alone, every restore verified byte-identically
 * (631,437 bytes, sha256 cff3ac7f3928… each time): baseline 63/0 GREEN · sheetcell 59/4 (4/4 declared) ·
 * docpara 61/2 (2/2) · slideshape 61/2 (2/2) · a1 61/2 (1/1) · onebased 61/2 (1/1) · canon 50/13 (7/7) ·
 * overstrict DID NOT REACH ITS FOOT, exit 1, all 3 crash markers present. ALL EIGHT AS DECLARED.
 *
 * TWO CAME BACK WRONG ON THE FIRST RUN AND BOTH ARE RECORDED AT THEIR SITES IN `nc-rec85.mjs` RATHER
 * THAN SMOOTHED. (1) `canon` read `3/7 declared, 6 failing` because the patch touched only the
 * `sheet-cell` branch while the declaration named all three arms — THE DECLARATION WAS THE DEFECT, and
 * a mis-declared arm reads exactly like a partially-working subject. (2) `overstrict` read `-1 pass,
 * -1 fail`: the arm refuses the suite's own FIXTURES, `mustPromote` THROWS, and a throw goes through no
 * assertion at all. REC-82 and REC-83 each recorded the identical throw-instead-of-fail shape one item
 * apart, so this is the third sighting of one class and it is named as such. */

/* REC-85 / IC-83 / IC-1 / DEC-23 / D-164 — THE OTHER THREE ARMS: `sheet-cell`,
 * `doc-para` and `slide-shape`, their shape grammar, their container-extent
 * refusal, and the rows they mint.
 *
 * THE ONE THING TO READ FIRST, BECAUSE IT IS THE ITEM'S REAL FINDING. Each arm
 * has two halves. The SHAPE half — is this an address at all — is fed by the
 * leg and is live in production today, driven here through `op=promote`. The
 * CONTAINER half — does THIS document hold that address — needs the container's
 * own extent, and **NOTHING IN THIS PLANE PERSISTS IT**: I2 produces the sheet
 * walk, the paragraph list and the shape sequence at acquire (COFF-3/4/5 and
 * COFF-10's three ODF entries) and the acquire path carries none of it onto the
 * reading, no table in `schema.mjs` holds one, and `docprofile/readtext.mjs`
 * says in its own words that it "returns what the recognisers said — never a
 * persisted shape". Part II §15 states the same from the design side. So the
 * container arms are BUILT, CORRECT AND UNFED: they are driven here against a
 * SUPPLIED context, §5 says so at the top of its own block rather than leaving a
 * reader to infer it, and §6 measures the consequence THROUGH THE OP — an
 * impossible-but-well-formed address MINTS today, because nothing bounds it.
 * That is undetermined and STATED, never a refusal for what nobody measured
 * (the page-set arm's own rule, C-45.1's prose, and IC-83's reasoning about why
 * refusing would push a member toward claiming MORE). Persisting it at acquire
 * is CAPTURE's act and is filed as a DELEGATION in `CLAIMS.md`.
 *
 * WHAT IS BEING ASSERTED, and the mints and reads THROUGH `op=promote` /
 * `op=content` / `op=earnedbasis` rather than against the store, because a
 * store-level test and a passing battery are not evidence a caller can reach
 * the feature (`op=invitelook` shipped with a ReferenceError while 1,276
 * assertions passed):
 *
 *   1. ALL FIVE KINDS ARE NOW LANDED. REC-82 landed two and named the other
 *      three `landed: false` so this would be a writer and not a migration.
 *   2. EACH ARM MINTS ON AN IN-RANGE EXTENT, through the op, and the row reads
 *      back through `op=content` with its extent, its derived human form, its
 *      chain and its `page_count` — which is NULL, correctly, on all three:
 *      a spreadsheet has no page set and inventing one would be a claim.
 *   3. THE DERIVED HUMAN FORM IS THE PRODUCER'S OWN `ref`, pinned against
 *      `sheetCellRef` / `docParaRef` / `slideShapeRef` themselves. `bio-checks.mjs`
 *      imports nothing, on purpose, so the parity is MEASURED rather than
 *      obtained by calling them — and measuring it is what keeps two spellings
 *      of one human form from drifting.
 *   4. TWO CITERS OF ONE ADDRESS GET ONE ROW AND TWO ADDRESSES GET TWO, per arm.
 *      `$B$14`, `b14` and `B14` are ONE cell and get ONE row — the `normRect`
 *      rule applied to A1 notation. Arm (g) neuters the canonical form to prove
 *      these assertions can fail.
 *   5. THE SHAPE REFUSALS, each BY NAME and each driven THROUGH THE OP: a cell
 *      with no sheet, a cell that is not A1, a non-integer paragraph, an
 *      unreadable run, slide 0 (the numbering is 1-BASED and it is the one place
 *      in this grammar where 0 is a refusal), an unreadable shape.
 *   6. THE CONTAINER REFUSALS (C-45.1), one per arm plus the sheet-name arm,
 *      driven against a supplied context — with §5's statement above.
 *   7. THE A1 COLUMN ACCUMULATOR is BIJECTIVE base 26 and the boundaries are
 *      swept (Z/AA, ZZ/AAA), because ordinary base 26 puts AA at 26 and agrees
 *      with itself perfectly.
 *   8. OVER-STRICTNESS, in two directions. `pdf-page` and `document` are
 *      BYTE-IDENTICAL to REC-82's landing, pinned by a 130-row sweep digest
 *      computed on a PRISTINE `origin/main` worktree; and a legal in-range
 *      office address is NOT refused by the pure catalogue, which holds no
 *      container and must not answer a question only the store can.
 *
 * WHAT IS DELIBERATELY NOT HERE. The transcription-axis `covers` — whether an
 * ATTESTATION covers one of these addresses — is `extentCovers`' and stays
 * NULL for all three arms, because an attestation's extent vocabulary is
 * `document|page|region` and has no cell, paragraph or shape in it. That is a
 * change to the ATTESTATION grammar, it is not what this row names, and
 * `#contentStanding` already states it as undetermined with the level named.
 */
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkContentExtent, canonicalExtent, describeExtent, legExtent,
         a1ToRowCol, CONTENT_EXTENT_A1_RE,
         CONTENT_EXTENT_KINDS } from "../checks/bio-checks.mjs";
/* THE PRODUCERS THEMSELVES, imported HERE and never by `bio-checks.mjs`, which
   is the whole point of §3: the grammar module imports nothing so that the
   checker and the store share one layer, and the parity between its derived
   human form and each container's own `ref` is therefore a measurement taken in
   the suite instead of a call. */
import { sheetCellRef } from "../src/formats-xlsx.mjs";
import { docParaRef } from "../src/docx.mjs";
import { slideShapeRef } from "../src/pptx.mjs";
import { sweepDigest } from "./rec85-arm-digest.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r85", MEMBER_TOKEN: "mem-r85", PROBE_TOKEN: "prb-r85",
              AI_TOKEN: "ai-r85", VERSION: "test" },
}));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r85") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r85") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-09-14T00:00:00Z";
const LATER = "2026-09-14T01:00:00Z";
const codes = (r) => (r.findings || []).map((f) => f.check).sort();
/* REC-84's `codeNames`, and reading BOTH is the point rather than a convenience.
   A shape refusal now travels as REC-84's leg-grammar RULE (C-2.8, which is what
   IC-84 moved) carrying the content-extent family's own CODE (which is what
   carries the DEC-49 translation and what tells `dom` from a typo). REC-84 paid
   for that distinction with four of REC-82's assertions going red when its first
   draft flattened the two into one number, so this suite asserts both halves
   everywhere it asserts either. */
const codeNames = (r) => [...new Set((r.findings || []).map((f) => f.code).filter(Boolean))].sort();
const detail = (r) => (r.findings || []).map((f) => f.detail).join(" || ");

/* ------------------------------------------------------------- documents */

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];

/* THE THREE ARMS' FIELDS ON A LEG, as flat scalars — the restricted frontmatter
   grammar carries no nested object inside an array element, which is why IC-1's
   structure is flattened this way. The spelling is REC-84's to bless as C-2.8
   grammar; it is written out here because the WRITER has to be drivable through
   the op it lives on, and a writer nobody can reach is a mechanism believed on
   its existence rather than its behaviour. */
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
      ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : []),
      ...(l.eref ? [`    extent_ref: "${l.eref}"`] : []),
      ...(l.sheet !== undefined ? [`    extent_sheet: "${l.sheet}"`] : []),
      ...(l.cell !== undefined ? [`    extent_cell: "${l.cell}"`] : []),
      ...(l.slide !== undefined ? [`    extent_slide: ${l.slide}`] : []),
      ...(l.shape !== undefined ? [`    extent_shape: ${l.shape}`] : []),
      ...(l.para !== undefined ? [`    extent_para: ${l.para}`] : []),
      ...(l.run !== undefined ? [`    extent_run: ${l.run}`] : [])])]
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
const promote = async (id, text, type, { base = null, register = [], reading = null } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  return post("promote", {
    bundleId: id, base,
    snapKey: `20260914T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register });
};
const HEAD = new Map();
const mustPromote = async (id, text, type, opts = {}) => {
  const r = await promote(id, text, type,
    { ...opts, base: opts.base !== undefined ? opts.base : (HEAD.get(id) ?? null) });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* AN OFFICE DOCUMENT'S ORDINARY CHAIN: one UNSCOPED `layer` step. Unscoped is
   right and is not a simplification — a derivation step's `extent` is
   `{kind:"pages", pages:[...]}` (D-252) and an XLSX has no pages, which is
   IC-1's own `doc-para` rationale one construct along. So these three captures
   have a CHAIN and NO PAGE SET, which is exactly the shape the office path
   produces and exactly the shape that makes `page_count` NULL on every row this
   suite mints. */
const layerChain = [{ step: "layer" }];
const readingOf = (captureSha, chain, container = null) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
             entities: [], facts: {},
             ...(container ? { text_container: container } : {}),
             ...(chain === undefined ? {} : { text_source: chain }) } });

/* ===================== 0. THE GROUND ==================================== */

console.log("\n--- 0. three captured office documents, one per arm, each with a chain and NO page set ---");

const SHA_BOOK = sha("a-captured-workbook");
const SHA_TEXT = sha("a-captured-word-document");
const SHA_DECK = sha("a-captured-slide-deck");
const DOC_BOOK = "INFO-2026-8500-workbook";
const DOC_TEXT = "INFO-2026-8500-document";
const DOC_DECK = "INFO-2026-8500-deck";

await mustPromote(DOC_BOOK, infoMd(DOC_BOOK), "information",
  { reading: readingOf(SHA_BOOK, layerChain, "xlsx") });
await mustPromote(DOC_TEXT, infoMd(DOC_TEXT), "information",
  { reading: readingOf(SHA_TEXT, layerChain, "docx") });
await mustPromote(DOC_DECK, infoMd(DOC_DECK), "information",
  { reading: readingOf(SHA_DECK, layerChain, "pptx") });

const s0 = await get("stats");
t("the ground holds no content rows — nothing has cited anything yet", [s0.content, s0.contentStale], [0, 0]);
/* THE CORPUS THIS SUITE REACHES, PRINTED AND FLOORED. A headline assertion over
   an empty fixture has passed three times in this repository. */
console.log(`  corpus: 3 captured office documents (xlsx · docx · pptx), each with a `
          + `1-step unscoped chain and no page set; extent kinds in the grammar: `
          + `${Object.keys(CONTENT_EXTENT_KINDS).join(", ")}`);
t("the fixture is non-empty and is the three arms' three containers",
  [Object.keys(CONTENT_EXTENT_KINDS).length >= 5, [DOC_BOOK, DOC_TEXT, DOC_DECK].length], [true, 3]);

/* CORRECTED BY FW-19 (IC-125), NOT EXEMPTED. This read "ALL FIVE KINDS ARE NOW
   LANDED" with a five-kind roster, which was exact until EXTRACTION-BREADTH §3.2
   landed `sheet-range`, `doc-table` and the `image` reference. The TOTALITY is
   what this asserts — every kind the grammar names is evaluable — so the roster
   moves and the shape of the check does not. FW-19's three are driven end to
   end in `fw19-extent-arms.test.mjs`. */
t("ALL EIGHT KINDS ARE NOW LANDED — REC-82 landed two, this item three, FW-19 the last three",
  [Object.keys(CONTENT_EXTENT_KINDS).sort(),
   Object.entries(CONTENT_EXTENT_KINDS).filter(([, v]) => v.landed).map(([k]) => k).sort()],
  [["doc-para", "doc-table", "document", "image", "pdf-page", "sheet-cell", "sheet-range", "slide-shape"],
   ["doc-para", "doc-table", "document", "image", "pdf-page", "sheet-cell", "sheet-range", "slide-shape"]]);

/* ===================== 1. EACH ARM MINTS, THROUGH THE OP ================ */

console.log("\n--- 1. each arm mints on an IN-RANGE extent through op=promote and reads back at op=content ---");

const cite = async (id, target, leg) => mustPromote(id,
  inquiryMd(id, { refs: [target], legs: [{ target, ...leg }] }), "inquiry");

const INQ_CELL = "INQ-2026-8500-cell";
const rCell = await cite(INQ_CELL, DOC_BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "B14" });
t("(sheet-cell) a cell leg MINTS a row",
  [rCell.content?.length, rCell.content?.[0].extent_kind, rCell.content?.[0].minted,
   rCell.content?.[0].stale],
  [1, "sheet-cell", true, false]);
const ROW_CELL = rCell.content[0].content_id;

const INQ_PARA = "INQ-2026-8500-para";
const rPara = await cite(INQ_PARA, DOC_TEXT, { kind: "doc-para", para: 11 });
t("(doc-para) a paragraph leg MINTS a row",
  [rPara.content?.length, rPara.content?.[0].extent_kind, rPara.content?.[0].minted],
  [1, "doc-para", true]);
const ROW_PARA = rPara.content[0].content_id;

const INQ_SHAPE = "INQ-2026-8500-shape";
const rShape = await cite(INQ_SHAPE, DOC_DECK, { kind: "slide-shape", slide: 7, shape: 3 });
t("(slide-shape) a shape leg MINTS a row",
  [rShape.content?.length, rShape.content?.[0].extent_kind, rShape.content?.[0].minted],
  [1, "slide-shape", true]);
const ROW_SHAPE = rShape.content[0].content_id;

t("three rows exist and none is stale", [(await get("stats")).content, (await get("stats")).contentStale],
  [3, 0]);
t("every id is a sha256 — no allocator, three hashes",
  [ROW_CELL, ROW_PARA, ROW_SHAPE].map((x) => /^[0-9a-f]{64}$/.test(x || "")), [true, true, true]);

const readRow = async (id) => get("content", `id=${id}`);
const cellRow = await readRow(ROW_CELL);
t("op=content resolves the cell row with its extent read back as FIELDS, not a bag",
  [cellRow.ok, cellRow.extent_kind, cellRow.extent?.sheet, cellRow.extent?.cell],
  [true, "sheet-cell", "Sheet1", "B14"]);
t("    and its `page_count` is NULL — a spreadsheet has no page set and one is never invented",
  cellRow.page_count, null);
t("    and it carries the capture's chain as it stood at mint",
  Array.isArray(cellRow.chain) && cellRow.chain.length, 1);
const paraRow = await readRow(ROW_PARA);
t("op=content resolves the paragraph row",
  [paraRow.ok, paraRow.extent_kind, paraRow.extent?.para, paraRow.page_count],
  [true, "doc-para", 11, null]);
const shapeRow = await readRow(ROW_SHAPE);
t("op=content resolves the shape row, slide 1-BASED and shape 0-based, both carried",
  [shapeRow.ok, shapeRow.extent_kind, shapeRow.extent?.slide, shapeRow.extent?.shape],
  [true, "slide-shape", 7, 3]);

/* ===================== 2. THE HUMAN FORM IS THE PRODUCER'S ============== */

console.log("\n--- 2. the derived human form IS each container's own `ref`, measured against the producers ---");

t("(sheet-cell) the row's derived `ref` is exactly what `sheetCellRef` produces",
  [cellRow.ref, sheetCellRef("Sheet1", "B14").ref], ["Sheet1!B14", "Sheet1!B14"]);
t("(doc-para) the row's derived `ref` is exactly what `docParaRef` produces — 0-based in the "
  + "address, 1-based to a reader",
  [paraRow.ref, docParaRef(11).ref], ["¶12", "¶12"]);
t("(slide-shape) the row's derived `ref` is exactly what `slideShapeRef` produces",
  [shapeRow.ref, slideShapeRef(7, 3).ref], ["slide 7", "slide 7"]);
t("A MEMBER'S AUTHORED `extent_ref` WINS over the derived form — IC-1's human form, authored",
  describeExtent({ kind: "sheet-cell", sheet: "Sheet1", cell: "B14", ref: "the transfer line" }),
  "the transfer line");
/* THE THREE DERIVED FORMS ARE PINNED AS A SET, so a fourth arm cannot be added
   without meeting this. `bio-checks.mjs` imports nothing and cannot call these
   builders; this is the measurement that stands in for the call. */
t("the parity holds for all three arms at once, which is the pin",
  [describeExtent({ kind: "sheet-cell", sheet: "Costs", cell: "AA3" }) === sheetCellRef("Costs", "AA3").ref,
   describeExtent({ kind: "doc-para", para: 0 }) === docParaRef(0).ref,
   describeExtent({ kind: "slide-shape", slide: 1 }) === slideShapeRef(1).ref],
  [true, true, true]);

/* ===================== 3. ONE ADDRESS, ONE ROW ========================== */

console.log("\n--- 3. two citers of one address get ONE row; two addresses get TWO (arm (g) proves it can fail) ---");

const INQ_CELL2 = "INQ-2026-8500-cell-again";
const rCell2 = await cite(INQ_CELL2, DOC_BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "B14" });
t("a second inquiry citing the SAME cell finds the SAME row and mints nothing",
  [rCell2.content?.[0].content_id === ROW_CELL, rCell2.content?.[0].minted], [true, false]);

const INQ_CELLABS = "INQ-2026-8500-cell-absolute";
const rCellAbs = await cite(INQ_CELLABS, DOC_BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "$B$14" });
t("`$B$14` IS `B14` — one cell, one row (the `normRect` rule applied to A1 notation)",
  [rCellAbs.content?.[0].content_id === ROW_CELL, rCellAbs.content?.[0].minted], [true, false]);

const INQ_CELLLC = "INQ-2026-8500-cell-lower";
const rCellLc = await cite(INQ_CELLLC, DOC_BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "b14" });
t("and so is `b14` — case is a spelling, not an address",
  [rCellLc.content?.[0].content_id === ROW_CELL, rCellLc.content?.[0].minted], [true, false]);

const INQ_CELLOTHER = "INQ-2026-8500-cell-other";
const rCellOther = await cite(INQ_CELLOTHER, DOC_BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "C14" });
t("a DIFFERENT cell is a DIFFERENT row — the half that makes the dedup mean something",
  [rCellOther.content?.[0].content_id !== ROW_CELL, rCellOther.content?.[0].minted], [true, true]);
const INQ_CELLSHEET = "INQ-2026-8500-cell-sheet2";
const rCellSheet = await cite(INQ_CELLSHEET, DOC_BOOK, { kind: "sheet-cell", sheet: "Sheet2", cell: "B14" });
t("and the SHEET is part of the address: `Sheet2!B14` is not `Sheet1!B14`",
  [rCellSheet.content?.[0].content_id !== ROW_CELL, rCellSheet.content?.[0].minted], [true, true]);

const INQ_PARA2 = "INQ-2026-8500-para-other";
const rPara2 = await cite(INQ_PARA2, DOC_TEXT, { kind: "doc-para", para: 12 });
t("two different paragraphs are two rows",
  [rPara2.content?.[0].content_id !== ROW_PARA, rPara2.content?.[0].minted], [true, true]);
const INQ_PARARUN = "INQ-2026-8500-para-run";
const rParaRun = await cite(INQ_PARARUN, DOC_TEXT, { kind: "doc-para", para: 11, run: 2 });
t("a RUN narrows the address, so `¶12 run 2` is not `¶12` — the finer field is IN the id",
  [rParaRun.content?.[0].content_id !== ROW_PARA, rParaRun.content?.[0].minted], [true, true]);
t("    but the two DESCRIBE alike, because a run is a producer artifact and not what a person is shown (IC-1)",
  [(await readRow(rParaRun.content[0].content_id)).ref, paraRow.ref], ["¶12", "¶12"]);

const INQ_SHAPE2 = "INQ-2026-8500-shape-other";
const rShape2 = await cite(INQ_SHAPE2, DOC_DECK, { kind: "slide-shape", slide: 7, shape: 4 });
t("two different shapes on one slide are two rows",
  [rShape2.content?.[0].content_id !== ROW_SHAPE, rShape2.content?.[0].minted], [true, true]);
const INQ_SLIDEONLY = "INQ-2026-8500-slide-only";
const rSlideOnly = await cite(INQ_SLIDEONLY, DOC_DECK, { kind: "slide-shape", slide: 7 });
t("a WHOLE SLIDE is its own address, not shape 0 — an absent field is absent, never defaulted",
  [rSlideOnly.content?.[0].content_id !== ROW_SHAPE, rSlideOnly.content?.[0].minted], [true, true]);

/* ===================== 4. THE SHAPE REFUSALS, THROUGH THE OP ============ */

console.log("\n--- 4. the shape refusals: an address this record cannot read covers nothing and MINTS nothing ---");

const before4 = (await get("stats")).content;
const refuse = async (id, target, leg) => promote(id,
  inquiryMd(id, { refs: [target], legs: [{ target, ...leg }] }), "inquiry");

const rNoSheet = await refuse("INQ-2026-8500-nosheet", DOC_BOOK, { kind: "sheet-cell", cell: "B14" });
t("(a) a cell with NO SHEET is refused by name — `B14` of what?",
  [rNoSheet.ok, rNoSheet.reason, codes(rNoSheet), codeNames(rNoSheet),
   /names which sheet/.test(detail(rNoSheet))],
  [false, "BASIS_REFUSED", ["C-2.8"], ["CONTENT_EXTENT_UNREADABLE"], true]);
const rBadCell = await refuse("INQ-2026-8500-badcell", DOC_BOOK, { kind: "sheet-cell", sheet: "Sheet1", cell: "14B" });
t("(b) a cell that is not A1 notation is refused by name",
  [rBadCell.ok, codes(rBadCell), codeNames(rBadCell), /A1 notation/.test(detail(rBadCell))],
  [false, ["C-2.8"], ["CONTENT_EXTENT_UNREADABLE"], true]);
const rBadPara = await refuse("INQ-2026-8500-badpara", DOC_TEXT, { kind: "doc-para", para: "two" });
t("(c) a paragraph that is not a 0-based integer is refused by name",
  [rBadPara.ok, codes(rBadPara), codeNames(rBadPara), /0-based integer/.test(detail(rBadPara))],
  [false, ["C-2.8"], ["CONTENT_EXTENT_UNREADABLE"], true]);
const rNoPara = await refuse("INQ-2026-8500-nopara", DOC_TEXT, { kind: "doc-para" });
t("(d) a doc-para naming NO paragraph is unreadable, not paragraph zero",
  [rNoPara.ok, codes(rNoPara), codeNames(rNoPara)],
  [false, ["C-2.8"], ["CONTENT_EXTENT_UNREADABLE"]]);
const rSlide0 = await refuse("INQ-2026-8500-slide0", DOC_DECK, { kind: "slide-shape", slide: 0 });
t("(e) SLIDE 0 IS REFUSED — the numbering is 1-BASED (IC-1: ref \"slide 7\", slide 7), and it is "
  + "the one place in this grammar where 0 is not the first item",
  [rSlide0.ok, codes(rSlide0), codeNames(rSlide0), /1-based integer/.test(detail(rSlide0))],
  [false, ["C-2.8"], ["CONTENT_EXTENT_UNREADABLE"], true]);
const rNoSlide = await refuse("INQ-2026-8500-noslide", DOC_DECK, { kind: "slide-shape", shape: 2 });
t("(f) a shape with no slide is refused — a shape index alone is not an address",
  [rNoSlide.ok, codes(rNoSlide), codeNames(rNoSlide)],
  [false, ["C-2.8"], ["CONTENT_EXTENT_UNREADABLE"]]);
t("AND NOTHING WAS MINTED BY ANY OF THEM", (await get("stats")).content, before4);

/* THE C-NUMBER IS THE GATE AND THE CODE IS THE FACT, asserted here as a VALUE
   because dropping it was a real regression this run caught rather than a
   hypothetical. REC-84's relay means a shape refusal reaching a member arrives
   at C-2.8 — the leg grammar's number, which is what IC-84 moved — while the
   CHECKER's own verdict is still C-45.3, which is what carries the DEC-49 canned
   translation and what tells an unreadable extent from `dom`. Until this
   assertion existed the ONLY thing in the whole battery naming C-45.3 was the
   TEXT of an assertion label in `content-extent-leg.test.mjs`, and this item's
   own correction of that label removed it — `coverage.mjs --strict` then went
   red with "1 never named: C-45.3", exactly the C-20.1 defect class it exists to
   catch (a check exercised only in the direction that passes). So it is pinned
   as BEHAVIOUR here instead of as a sentence anywhere: a label can be reworded
   by the next item without anyone noticing, and a value cannot. */
t("the CHECKER's own verdict is C-45.3 and the leg grammar RELAYS it at C-2.8 — two gates, one code",
  [checkContentExtent({ kind: "sheet-cell", cell: "B14" }, { chain: layerChain }).check,
   checkContentExtent({ kind: "sheet-cell", cell: "B14" }, { chain: layerChain }).code,
   checkContentExtent({ kind: "doc-para", para: "two" }, { chain: layerChain }).check,
   /* `?.` added by FW-19, which re-ran `nc-rec85.mjs` and found its `onebased`
      arm reading `-1 pass, -1 fail`: under that arm this call returns NULL and a
      bare `.check` THREW, so the suite never reached its foot — a throw goes
      through no assertion at all. Pre-existing (the line predates FW-19); the
      defensive read turns it back into a measured FAIL. */
   checkContentExtent({ kind: "slide-shape", slide: 0 }, { chain: layerChain })?.check ?? null,
   codes(rNoSheet)],
  ["C-45.3", "CONTENT_EXTENT_UNREADABLE", "C-45.3", "C-45.3", ["C-2.8"]]);

/* A leg on a capture the record has NEVER READ still meets C-45.2 on all three
   arms, unchanged from REC-82: an address into text nobody produced. */
const DOC_UNREAD = "INFO-2026-8500-unread";
await mustPromote(DOC_UNREAD, infoMd(DOC_UNREAD), "information",
  { reading: readingOf(sha("never-read"), undefined) });
const rNoChain = await refuse("INQ-2026-8500-nochain", DOC_UNREAD,
  { kind: "sheet-cell", sheet: "Sheet1", cell: "B14" });
/* AND THIS ONE STAYS AT C-45.2 RATHER THAN RELAYING, WHICH IS REC-84's SPLIT
   DOING EXACTLY WHAT IT WAS BUILT FOR — measured here rather than assumed. The
   catalogue gate runs the grammar with `CONTENT_EXTENT_DOCUMENT_ONLY`, whose
   `known: false` SKIPS the two arms only the store can answer, so a chain
   refusal is not something one `bundle.md` can raise; it is raised at the
   STORE's own gate and arrives with the content family's C-number intact. Two
   gates, one checker, two honest answers — and the contrast with (a)-(f) above,
   which DO relay at C-2.8, is what shows the split is real. */
t("(g) and the NO-CHAIN refusal reaches the new arms at the STORE's gate — C-45.2, not relayed, naming the extent",
  [rNoChain.ok, codes(rNoChain), /Sheet1!B14/.test(detail(rNoChain))], [false, ["C-45.2"], true]);

/* ===================== 5. THE CONTAINER REFUSALS ======================== */

console.log("\n--- 5. the CONTAINER refusals (C-45.1) — driven against a SUPPLIED context, because nothing feeds one ---");
console.log("  READ THIS BEFORE THE ROWS BELOW: these six refusals are correct, driven and UNFED IN PRODUCTION.");
console.log("  `#containerExtentForCapture` answers all three levels NULL today and names the empty level,");
console.log("  because I2 produces the sheet walk / paragraph list / shape sequence at acquire and NOTHING");
console.log("  PERSISTS ANY OF IT (measured 2026-09-14: no schema table, no field on a reading, and");
console.log("  `docprofile/readtext.mjs`'s own words — \"never a persisted shape\"). Persisting it is");
console.log("  CAPTURE's act (the CAP-9 shape for D-345's page count) and is filed as a DELEGATION.");

const CHAIN = layerChain;
const CONTAINER = { sheets: [{ name: "Sheet1", rows: 20, cols: 5 }, { name: "Sheet2", rows: 3, cols: 3 }],
                    paragraphs: 12, slides: [{ shapes: 4 }, { shapes: 2 }] };
const chk = (e, container = CONTAINER) => {
  const r = checkContentExtent(e, { chain: CHAIN, pageCount: null, container });
  return r ? [r.check, r.detail] : ["OK", null];
};

const oobSheet = chk({ kind: "sheet-cell", sheet: "Budget", cell: "B14" });
t("(1) a sheet the workbook does not have is REFUSED BY NAME and the refusal NAMES the sheets held",
  [oobSheet[0], /holds 2 sheet\(s\) \(Sheet1, Sheet2\)/.test(oobSheet[1]),
   /a sheet called 'Budget'/.test(oobSheet[1])], ["C-45.1", true, true]);
const oobRow = chk({ kind: "sheet-cell", sheet: "Sheet1", cell: "B21" });
t("(2) a row past the sheet's last is REFUSED BY NAME and names the extent it was checked against",
  [oobRow[0], /holds 20 row\(s\) \(1-20\).*names row 21/.test(oobRow[1])], ["C-45.1", true]);
const oobCol = chk({ kind: "sheet-cell", sheet: "Sheet1", cell: "F1" });
t("(3) a column past the sheet's last is REFUSED BY NAME",
  [oobCol[0], /holds 5 column\(s\).*names column 6/.test(oobCol[1])], ["C-45.1", true]);
t("    and the LAST cell of the sheet is NOT refused — the bound is inclusive",
  chk({ kind: "sheet-cell", sheet: "Sheet1", cell: "E20" })[0], "OK");

const oobPara = chk({ kind: "doc-para", para: 12 });
t("(4) a paragraph past the count is REFUSED BY NAME, 0-based bound stated",
  [oobPara[0], /holds 12 paragraph\(s\) \(0-11\).*names paragraph 12/.test(oobPara[1])], ["C-45.1", true]);
t("    and the LAST paragraph is NOT refused", chk({ kind: "doc-para", para: 11 })[0], "OK");

const oobSlide = chk({ kind: "slide-shape", slide: 3 });
t("(5) a slide past the deck is REFUSED BY NAME, 1-based bound stated",
  [oobSlide[0], /holds 2 slide\(s\) \(1-2\).*names slide 3/.test(oobSlide[1])], ["C-45.1", true]);
const oobShape = chk({ kind: "slide-shape", slide: 2, shape: 2 });
t("(6) a shape not in the slide's list is REFUSED BY NAME, and the sentence names WHICH slide",
  [oobShape[0], /slide 2 of this capture holds 2 shape\(s\) \(0-1\).*names shape 2/.test(oobShape[1])],
  ["C-45.1", true]);
t("    and the LAST shape of that slide is NOT refused", chk({ kind: "slide-shape", slide: 2, shape: 1 })[0], "OK");

/* EVERY LEVEL IS INDEPENDENTLY NULLABLE, and this is the assertion that keeps a
   half-known container from being read as a fully-known one. */
t("a sheet list with NO dimensions refuses an unknown SHEET and says nothing about the cell",
  [chk({ kind: "sheet-cell", sheet: "Nope", cell: "B14" }, { sheets: [{ name: "Sheet1" }] })[0],
   chk({ kind: "sheet-cell", sheet: "Sheet1", cell: "ZZ999999" }, { sheets: [{ name: "Sheet1" }] })[0]],
  ["C-45.1", "OK"]);
t("a container holding ONLY a paragraph count bounds the paragraph arm and neither of the others",
  [chk({ kind: "doc-para", para: 99 }, { sheets: null, paragraphs: 4, slides: null })[0],
   chk({ kind: "slide-shape", slide: 99 }, { sheets: null, paragraphs: 4, slides: null })[0]],
  ["C-45.1", "OK"]);

/* ===================== 6. UNDETERMINED, STATED, THROUGH THE OP ========== */

console.log("\n--- 6. and with NO container held, an impossible address MINTS — undetermined and stated, never refused ---");

const INQ_WILD = "INQ-2026-8500-impossible";
const rWild = await cite(INQ_WILD, DOC_BOOK, { kind: "sheet-cell", sheet: "NoSuchSheet", cell: "ZZ9999999" });
t("a cell on a sheet that may not exist MINTS today, because nothing in this record bounds it",
  [rWild.content?.[0].extent_kind, rWild.content?.[0].minted], ["sheet-cell", true]);
const INQ_WILDP = "INQ-2026-8500-impossible-para";
const rWildP = await cite(INQ_WILDP, DOC_TEXT, { kind: "doc-para", para: 9999999 });
t("and so does paragraph 9,999,999 — the record never measured this document's paragraphs",
  [rWildP.content?.[0].extent_kind, rWildP.content?.[0].minted], ["doc-para", true]);
t("THIS IS THE ITEM'S FINDING, NOT A HOLE IN IT: refusing a citation for a bound NOBODY MEASURED "
  + "would push a member toward citing the whole document, which claims MORE. The arms above are "
  + "built and correct; the feed is CAPTURE's (the CAP-9 shape), and it is DELEGATED.",
  [(await readRow(rWild.content[0].content_id)).page_count,
   (await readRow(rWildP.content[0].content_id)).page_count], [null, null]);

/* ===================== 7. THE READ AT CONTENT GRAIN ===================== */

console.log("\n--- 7. op=earnedbasis answers per extent for the new arms, and states the portion's UNDETERMINED ---");

const eb = await get("earnedbasis", `id=${INQ_CELL}`);
t("op=earnedbasis names the leg AND its content row — the registry answers at content grain (REC-83)",
  [eb.ok, (eb.legs || []).length, (eb.legs || [])[0]?.content_id === ROW_CELL,
   !!(eb.earned?.content || {})[ROW_CELL]],
  [true, 1, true, true]);
const cellStanding = (eb.earned?.content || {})[ROW_CELL];
t("    and the standing it answers is about THIS extent, not about the document",
  [cellStanding?.extent_kind, cellStanding?.extent?.sheet, cellStanding?.extent?.cell],
  ["sheet-cell", "Sheet1", "B14"]);
t("    the PORTION's connection axis is UNDETERMINED with the empty level NAMED (Bob 5.1), never "
  + "borrowed from the whole document",
  [cellStanding?.connection?.determined, cellStanding?.connection?.grain,
   cellStanding?.connection?.undetermined_because],
  [false, "portion", "READING_POSITION_ABSENT"]);
t("    and its transcription ceiling is UNDETERMINED AND STATED — an attestation's extent "
  + "vocabulary is document|page|region and has no cell in it, which is the ATTESTATION grammar "
  + "and is deliberately NOT what this item moved",
  [cellStanding?.transcription?.ceiling,
   /cannot yet evaluate what a sheet-cell extent covers/.test(cellStanding?.transcription?.why || "")],
  [null, true]);
t("    and the leg's own sentence names the address a member would recognise",
  cellStanding?.ref, "Sheet1!B14");

/* ===================== 8. THE A1 ACCUMULATOR ============================ */

console.log("\n--- 8. the A1 column accumulator is BIJECTIVE base 26, swept at its boundaries (arm (e)) ---");

const SWEEP = [["A1", 1, 1], ["B14", 2, 14], ["Z1", 26, 1], ["AA1", 27, 1], ["AB1", 28, 1],
               ["AZ1", 52, 1], ["BA1", 53, 1], ["ZZ1", 702, 1], ["AAA1", 703, 1],
               ["XFD1048576", 16384, 1048576]];
console.log(`  sweep: ${SWEEP.length} cells, boundaries Z/AA (26/27) and ZZ/AAA (702/703), `
          + `plus XLSX's own last cell XFD1048576`);
t("every swept cell accumulates bijectively — ordinary base 26 would put AA at 26 and agree with itself",
  SWEEP.map(([c]) => { const r = a1ToRowCol(c); return r ? [r.col, r.row] : null; }),
  SWEEP.map(([, col, row]) => [col, row]));
t("and the grammar admits every one of them, plus their absolute and lowercase spellings",
  SWEEP.flatMap(([c]) => [CONTENT_EXTENT_A1_RE.test(c), CONTENT_EXTENT_A1_RE.test(c.toLowerCase()),
                          CONTENT_EXTENT_A1_RE.test(`$${c}`)]).every(Boolean), true);
t("and refuses what is not a cell at all", ["", "B0", "14B", "BBBB1", "B", "1", "B1.5"]
  .map((c) => CONTENT_EXTENT_A1_RE.test(c)), [false, false, false, false, false, false, false]);

/* ===================== 9. OVER-STRICTNESS ============================== */

console.log("\n--- 9. OVER-STRICTNESS, in both directions ---");

/* (i) THE TWO ARMS REC-82 LANDED DID NOT MOVE, pinned by a digest computed on a
   PRISTINE `origin/main` worktree at 3f92e5c rather than by a hand-written list
   of expected strings, which would agree with its author for free. The sweep
   includes two contexts carrying the `container` key this item ADDED, so the pin
   says specifically that adding it moved nothing here. */
const PRISTINE_SWEEP = { rows: 130,
  digest: "28875841782289e9f4a8782034b9eeaecdb621826a30f4084f10c90682a7c277" };
const nowSweep = sweepDigest();
t("`pdf-page` and `document` are BYTE-IDENTICAL to REC-82's landing across a 130-row sweep",
  nowSweep, PRISTINE_SWEEP);

/* (ii) THE PURE CATALOGUE MUST NOT ANSWER A QUESTION ONLY THE STORE CAN. A
   check that refused a legal in-range office address for want of a container
   would be a second gate holding a second answer, and every fixture citing a
   cell would start failing `op=audit` while promoting perfectly well. */
t("a well-formed cell, paragraph and shape are NOT refused with no container in hand",
  [checkContentExtent({ kind: "sheet-cell", sheet: "S", cell: "B14" }, { chain: CHAIN }),
   checkContentExtent({ kind: "doc-para", para: 3 }, { chain: CHAIN }),
   checkContentExtent({ kind: "slide-shape", slide: 1, shape: 0 }, { chain: CHAIN })],
  [null, null, null]);
t("a leg naming NO extent still means the WHOLE DOCUMENT and is never refused (Bob 5.3)",
  [legExtent({}).kind, checkContentExtent(legExtent({}), { chain: null })], ["document", null]);
t("and `legExtent` reads each arm's OWN fields and no others — a stray `extent_cell` under "
  + "`doc-para` is not in the address",
  [legExtent({ extent_kind: "doc-para", extent_para: 4, extent_cell: "B1" }),
   legExtent({ extent_kind: "sheet-cell", extent_sheet: "S", extent_cell: "B1", extent_para: 9 })],
  [{ kind: "doc-para", para: 4 }, { kind: "sheet-cell", sheet: "S", cell: "B1" }]);
t("the canonical form of each arm is over its OWN fixed fields, absent as null and never missing",
  [canonicalExtent({ kind: "sheet-cell", sheet: "S", cell: "B1" }),
   canonicalExtent({ kind: "doc-para", para: 4 }),
   canonicalExtent({ kind: "slide-shape", slide: 2 })],
  ['{"cell":"B1","kind":"sheet-cell","sheet":"S"}',
   '{"kind":"doc-para","para":4,"run":null}',
   '{"kind":"slide-shape","shape":null,"slide":2}']);

/* ===================== FOOT ============================================ */

console.log(`\n  ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
