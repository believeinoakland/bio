/* NEGATIVE CONTROL: SIX arms and a baseline live in `test/nc-rec91.mjs` and are re-run in one step with `node test/nc-rec91.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with every other defence held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by content (`cmp`) with a byte count printed and a minimum guarded — never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work. Declared before arming, and every one RUN; results are in this item's report and in CLAIMS.md's release line. (a) `baseline` — nothing armed; MUST be green, the row that distinguishes six-arms-broken from six-arms-working. (b) `nopurge` — drop `"capture_text"` from `purge`'s TABLES array; MUST fail the purge arms BY NAME in BOTH directions (the per-bundle arm and the whole-store arm) and MUST fail `hygiene.test.mjs`'s D-113 census, which is the check that would have caught it at the moment the mistake was made. (c) `nodelete` — in `#writeCaptureText` remove the leading `DELETE FROM capture_text WHERE capture_sha=?`; MUST fail the CHAIN-MOVE arm by name — the superseded text is still indexed, which is a search answering out of an engine that did not produce it — and MUST NOT move any first-promote arm, because on a first promotion there is nothing to delete and the defect is invisible. (d) `replace` — change that same plain `INSERT` to `INSERT OR REPLACE` and drop the delete with it; MUST fail the chain-move arm AND the stats-parity arm (`textIndexed` exceeds `textUnits`), because SQLite does not fire delete triggers for REPLACE conflict resolution and the superseded row's index entry is ORPHANED — this is the arm that proves the measured hazard is real in the product and not only in a probe. (e) `noobs` — neuter `#observeIndexed` to return without appending; MUST fail every content-axis arm and MUST NOT move the row-count arms, which separates the OBSERVATION from the WRITE. (f) `armsopen` — treat every container as having a unit arm (`CAPTURE_TEXT_UNIT_CONTAINERS` becomes a Set that answers true); MUST fail the WORKBOOK arm alone, because a workbook would then be recorded as extracted-and-indexed-nothing rather than as having no unit arm — the false-absence direction this item's whole vocabulary exists to refuse. (g) `overstrict` — THE OVER-STRICTNESS DIRECTION, and it is armed against the BOUND rather than against the writer: drop the per-capture bound to 64 B so an ordinary document goes `partial`; MUST fail the FULL arms and MUST NOT fail the partial arm or any refusal, because a bound tighter than its rule is not a safer bound — it makes the record say it holds less than it does, and a member reading `partial` would re-extract a document that was already whole. */
/* RESULTS: see this item's report and the CLAIMS.md release line. */

/* REC-91 — `capture_text` AND `capture_text_fts`: THE CONTENT-GRAIN TEXT INDEX,
 * WRITTEN AT PROMOTE.  `CONTENT-SEARCH-DESIGN.md` §4.1, §4.3 and §7 row 4.
 *
 * WHAT THIS SUITE MEASURES, and it is the mechanism rather than its existence.
 * Three containers are acquired through `op=acquire` for real — a DOCX, a PPTX
 * and an XLSX, each assembled byte by byte in this file with an independent
 * crc32, so the paragraph count, the slide count and the sheet names are the
 * FIXTURE'S OWN GROUND TRUTH and not an equality the code under test produced
 * for itself — then promoted through `op=promote`, and what the index did with
 * each is read back through `op=contentaxis` and `op=stats`. The `pdf-page` arm
 * and both bounds are driven through `op=promote` with an authored
 * `data/provenance.json`, which is the writer's REAL input: the store reads its
 * units out of a document a caller composes, so that is where a bound has to be
 * driven from.
 *
 * WHAT IT DELIBERATELY DOES NOT CLAIM. There is no `passage:` arm and no
 * `rows=passage` yet — those are REC-92 — so this suite CANNOT assert that a
 * member searching for a term inside a captured PDF finds it. What it can and
 * does assert is everything that read will rest on: the units are there, they
 * are addressed by the SAME canonical extent a citation would mint, the FTS
 * index is true against them, and it stays true across a chain move and both
 * purge arms. §8's first control ("a term that appears ONLY inside a captured
 * PDF's page text returns that bundle through `passage:`") is REC-92's to run
 * and is named here as owed rather than approximated.
 *
 * AND THE INDEX IS DRIVEN ON THE PRODUCT'S OWN DDL, NEVER ON A COPY. Section D
 * extracts the `CREATE VIRTUAL TABLE` and the three `CREATE TRIGGER` statements
 * OUT OF `src/store.mjs` by regex and executes THOSE. A retyped DDL would be a
 * second copy that agrees with the product for free — this repository's
 * most-measured failure — and would have gone on passing after the product's own
 * DDL changed underneath it.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { CONTENT_AXIS_STATES, CONTENT_AXIS_UNDETERMINED } from "../src/airun.mjs";
import { canonicalExtent, describeExtent } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(new URL("../src/store.mjs", import.meta.url), "utf8");
const SCHEMA_SRC = readFileSync(new URL("../src/schema.mjs", import.meta.url), "utf8");

/* THE VOCABULARY IS THE IMPORTED CONSTANT AND NO MEMBER IS SPELLED HERE — the
   ruling CONDUCT made on 2026-09-14, which `observation-content.test.mjs` §A
   turns into a build error. A suite holding its own copy of the words it is
   asserting is the second copy that ruling exists to prevent. */
const AXIS = Object.keys(CONTENT_AXIS_STATES);
const FULL = AXIS[0], PARTIAL = AXIS[1], NONE = AXIS[2];

/* ---- independent crc32 + zip assembler. The fixture builder imports NOTHING
 * from the container readers under test, which is the `ooxml.test.mjs` /
 * `capture-container-extent.test.mjs` discipline and its stated reason: a
 * fixture that inherited a defect from the module under test would agree with
 * it for free. ---- */
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

/* ===== THE DOCUMENT — A KNOWN PARAGRAPH COUNT AND ONE UNIQUE TERM ========
 * `PARAS` is this fixture's ground truth for the unit count. `ONLY_IN_DOCX` is
 * a term that appears in the DOCUMENT'S TEXT and NOWHERE in any bundle.md this
 * suite promotes, which is what makes the index arm a statement about what the
 * document SAYS rather than about the group's notes on it — §3's whole
 * argument, and the shape §8's first control will take when REC-92 lands. */
const ONLY_IN_DOCX = "pelagic";
const PARAS = [
  "CITY OF OAKLAND", "AGENDA REPORT",
  "SUBJECT: FY 2026-27 Midcycle Budget Amendments",
  `The ${ONLY_IN_DOCX} reserve was appropriated without a council vote.`,
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

/* ===== THE DECK — A KNOWN SLIDE COUNT ===================================
 * TWO shapes per slide, on purpose. Bob's ruling of 2026-09-15 is that a
 * deck's unit is the SLIDE and not the shape, so a two-shape slide must produce
 * ONE unit whose text carries both — and a fixture with one shape per slide
 * could not tell the ruling from its opposite. */
const SLIDE_TITLES = ["FY 2026-27 PROPOSED MIDCYCLE BUDGET", "GENERAL PURPOSE FUND OUTLOOK",
                      "FISCAL IMPACT"];
const SLIDE_SECOND = "Presented to Council 2026-06-16.";
const P = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
const A = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"';
const R = 'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const PPTX_CT = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const slideXmlOf = (title) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld ${P} ${A} ${R}><p:cSld><p:spTree>
<p:sp><p:txBody><a:p><a:r><a:t>${title}</a:t></a:r></a:p></p:txBody></p:sp>
<p:sp><p:txBody><a:p><a:r><a:t>${SLIDE_SECOND}</a:t></a:r></a:p></p:txBody></p:sp>
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

/* ===== THE WORKBOOK — REAL TEXT AND NO UNIT ARM =========================
 * The point of this fixture is the gap: a workbook's text is extracted and this
 * record cannot address a passage of it, which is a DIFFERENT fact from a
 * document with no text. M-20 measured the size of that gap — 288 workbooks in
 * the census holding 72,651,441 bytes of text over 1,056 sheets and not one
 * indexable unit between them. */
const SHEET_NAMES = ["Summary", "Detail"];
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
  { name: "xl/worksheets/sheet1.xml", data: sheetXml([["Department", "FY26 Adopted"], ["Police", "2200000"]]) },
  { name: "xl/worksheets/sheet2.xml", data: sheetXml([["Fund 1010", "General Purpose Fund"]]) },
]);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec91", MEMBER_TOKEN: "mem-rec91", PROBE_TOKEN: "prb-rec91",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.pathname === "/report.docx") return bin(DOCX, DOCX_CT);
    if (u.pathname === "/deck.pptx") return bin(PPTX, PPTX_CT);
    if (u.pathname === "/budget.xlsx") return bin(XLSX, XLSX_CT);
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-rec91") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-rec91") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const acquire = async (path) => (await (await mf.dispatchFetch(
  "http://x/api/?op=acquire&token=mem-rec91",
  { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov" + path,
                                           authority: "City of Oakland" }) })).json());

const NOW = "2026-09-15T00:00:00Z";
const LATER = "2026-09-15T01:00:00Z";

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
const promote = async (id, { document = null } = {}) => {
  const text = infoMd(id);
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (document) {
    const prov = JSON.stringify({ documents: [document] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  /* THE CAPTURE IS REGISTERED, because `op=contentaxis` looks the capture up in
     the REGISTER first — "this record does not hold that capture" and "this
     record holds it and nobody has read it" are two different answers and only
     the second is what the vocabulary means. A suite that promoted a reading
     without registering its capture would get `found: false` on every axis arm
     and would read as a broken writer. */
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260915T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: "collected", created: NOW, last_updated: LATER },
    files,
    register: document && document.capture && document.capture.sha256
      ? [{ sha256: document.capture.sha256, path: document.file || "data/doc.bin",
           encoding: "binary", bytes: document.capture.bytes || 10 }]
      : [] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};
const axisOf = async (s) => get("contentaxis", `captureSha=${encodeURIComponent(s)}`);

try {

/* ========================================================================= *
 *  A · THE SCHEMA, READ OUT OF THE SOURCE
 * ========================================================================= */
console.log("\n--- A · the two tables, where they must be and shaped as the design says ---");

t("A1: `capture_text` is declared in schema.mjs BEFORE the `host_governor` block — hygiene asserts "
+ "the literal ends on a `);`, and a table appended after it would truncate the schema",
  SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS capture_text (") > -1
    && SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS capture_text (")
       < SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS host_governor"), true);

/* THE NINE COLUMNS §4.1 NAMES, AND THE KEY. Asserted against the DDL text
   rather than against a promise, because a column silently dropped from the
   CREATE would fail at the first INSERT and the failure would read as a writer
   defect rather than as a schema one. */
{
  const ddl = SCHEMA_SRC.slice(SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS capture_text ("));
  const body = ddl.slice(0, ddl.indexOf(");"));
  const cols = ["capture_sha", "bundle_id", "extent_kind", "extent", "ref", "seq", "text",
                "truncated", "chain_kind"];
  t("A2: it carries §4.1's nine columns and no fewer",
    cols.filter((c) => !new RegExp(`\\n\\s+${c}\\s`).test(body)), []);
  t("A3: and the PRIMARY KEY is the ADDRESS — (capture_sha, extent_kind, extent) — which is what "
  + "makes one passage one row however many times it is written",
    /PRIMARY KEY \(capture_sha, extent_kind, extent\)/.test(body), true);
}

/* THE FTS TABLE'S SHAPE, and every clause in it is load-bearing:
   `content=` makes it external content (the text is stored once), `content_rowid=`
   is the rowid alignment that lets `snippet()` read the base table, and
   `unicode61` is the settled tokenizer §6 says this design does not revisit. */
{
  const m = /CREATE VIRTUAL TABLE IF NOT EXISTS capture_text_fts USING fts5\(([\s\S]*?)\)`/.exec(STORE_SRC);
  t("A4: `capture_text_fts` is FTS5 EXTERNAL CONTENT over `capture_text`, ROWID ALIGNED, unicode61 "
  + "— so `snippet()` reads the base table rather than a second copy of the text",
    m ? [/content='capture_text'/.test(m[1]), /content_rowid='rowid'/.test(m[1]),
         /tokenize='unicode61'/.test(m[1])] : null,
    [true, true, true]);
  const trig = [...STORE_SRC.matchAll(/CREATE TRIGGER IF NOT EXISTS (capture_text_\w+) AFTER (\w+) ON capture_text/g)];
  t("A5: three maintenance triggers cover INSERT, DELETE and UPDATE — an external-content index is "
  + "not maintained by writes to its base table, and an UPDATE nobody has written yet would fail as "
  + "a WRONG ANSWER rather than as an error",
    trig.map((x) => x[2]).sort(), ["DELETE", "INSERT", "UPDATE"]);
}

/* THE WRITER MUST NOT USE `INSERT OR REPLACE`, AND THIS IS A STRUCTURAL PIN OVER
   A MEASURED HAZARD rather than a style rule. Measured on workerd through
   miniflare by this item: SQLite does not fire delete triggers for REPLACE
   conflict resolution, so a REPLACE leaves the superseded row's index entry
   ORPHANED — and an orphan still MATCHES, which is a search answering out of
   text the record no longer holds. `nc-rec91.mjs`'s `replace` arm breaks this on
   purpose and this suite goes red. */
{
  /* THE DEFINITION, NOT ITS FIRST CALL SITE. The first draft of this arm
     anchored on `#writeCaptureText(bundleId` and matched the CALL inside
     `#writeReadings`, so it sliced 1,405 characters of the caller and asserted
     three regexes against a region that contains none of them — and it went RED,
     which is the only reason it was found. A structural pin over the wrong
     region is the failure mode that usually goes the other way. */
  const i0 = STORE_SRC.indexOf("  #writeCaptureText(bundleId, captureSha, units, chain) {");
  const w = STORE_SRC.slice(i0, STORE_SRC.indexOf("  #observeIndexed(bundleId, captureSha, result,"));
  t("A6a: the writer method was FOUND in the source — a structural pin over a failed slice would "
  + "pass over an empty string, which is the blind-by-construction shape this file refuses",
    i0 > -1 && w.length > 500, true);
  t("A6: the writer DELETES the capture's rows and then plainly INSERTs — never `INSERT OR REPLACE`, "
  + "which fires no delete trigger and orphans the superseded row's index entry (measured on workerd)",
    [/DELETE FROM capture_text WHERE capture_sha=\?/.test(w),
     /INSERT INTO capture_text\b/.test(w), /INSERT OR REPLACE INTO capture_text\b/.test(w)],
    [true, true, false]);
}

/* PURGE, D-113, IN BOTH DIRECTIONS AND IN THE RIGHT ORDER. The ORDER is the
   measured half: clearing the external-content index BEFORE its base rows
   answers SQLITE_CORRUPT_VTAB on the base delete and LEAVES THE BASE ROWS
   STANDING — so a sweep written the natural way, beside `bundles_fts`'s own
   line, would have been worse than no sweep at all. */
{
  const p0 = STORE_SRC.indexOf("purge({ bundleId");
  const src = STORE_SRC.slice(p0, STORE_SRC.indexOf("---- credentials ----", p0));
  const tables = /const TABLES\s*=\s*\[([\s\S]*?)\]/.exec(src);
  t("A7: `capture_text` is in purge's TABLES, so it clears in BOTH arms (it carries bundle_id)",
    !!tables && /"capture_text"/.test(tables[1]), true);
  const loop = src.indexOf("for (const t of TABLES) this.sql.exec(`DELETE FROM ${t}`)");
  const sweep = src.indexOf("DELETE FROM capture_text_fts");
  t("A8: and the whole-store sweep of the FTS table comes AFTER the base rows are cleared — "
  + "index-first corrupts the vtab and leaves the base rows, measured on workerd",
    loop > -1 && sweep > loop, true);
}

/* ========================================================================= *
 *  B · ACQUIRE EMITS THE UNITS, FROM REAL CONTAINERS
 * ========================================================================= */
console.log("\n--- B · op=acquire: the indexable units, off the I2 shape, by SHAPE and not by name ---");

const docDoc = (await acquire("/report.docx")).document;
const deckDoc = (await acquire("/deck.pptx")).document;
const bookDoc = (await acquire("/budget.xlsx")).document;

/* THE CORPUS THIS SUITE REACHES, PRINTED AND FLOORED. A headline assertion over
   an empty fixture has passed three times in this repository. */
console.log(`  corpus: 3 containers acquired through op=acquire — a document of ${PARAS.length} `
          + `paragraphs, a deck of ${SLIDE_TITLES.length} slides with 2 shapes each, and a workbook `
          + `of ${SHEET_NAMES.length} sheets (${SHEET_NAMES.join(", ")}), which has no unit arm at all`);
t("B0: the fixture is non-empty and all three were recognised by the FORMAT axis",
  [docDoc?.profile?.format?.format, deckDoc?.profile?.format?.format,
   bookDoc?.profile?.format?.format], ["docx", "pptx", "xlsx"]);

t("B1: the DOCUMENT emits one `doc-para` unit per paragraph, in reading order, carrying the "
+ "producer's OWN para index rather than a re-count of the array",
  [docDoc.text_units?.length,
   docDoc.text_units?.every((u) => u.extent.kind === "doc-para"),
   docDoc.text_units?.map((u) => u.extent.para),
   docDoc.text_units?.map((u) => u.seq)],
  [PARAS.length, true, PARAS.map((_, i) => i), PARAS.map((_, i) => i)]);

t("B1b: and the unit's TEXT is the document's text — the term that appears ONLY inside the captured "
+ "file is in it, which is what makes this the content level and not the group's notes (§3)",
  docDoc.text_units?.some((u) => u.text.includes(ONLY_IN_DOCX)), true);

/* BOB'S RULING OF 2026-09-15, DRIVEN. The deck's unit is the SLIDE, so a
   two-shape slide is ONE unit whose text carries both shapes — a fixture with
   one shape per slide could not tell that from its opposite. */
t("B2: the DECK emits ONE unit per SLIDE and not one per shape — `slide-shape` with the SHAPE "
+ "OMITTED, which `covers()` accepts as covering the whole slide (Bob, 2026-09-15)",
  [deckDoc.text_units?.length,
   deckDoc.text_units?.every((u) => u.extent.kind === "slide-shape" && u.extent.shape === null),
   deckDoc.text_units?.map((u) => u.extent.slide)],
  /* 1-BASED, AND THAT IS THE RECORD'S OWN CONVENTION RATHER THAN AN OFF-BY-ONE.
     `describeExtent` renders a slide as `slide ${n}` with no adjustment, where a
     page renders as `page ${n + 1}` and a paragraph as `¶${n + 1}` — so slides
     are numbered from one in the extent itself and pages and paragraphs from
     zero. The unit carries the PRODUCER's own index unchanged, which is what
     makes it the same address every other reference into this deck uses; a
     re-count here would have produced a tidier-looking sequence that addressed
     the wrong slide. */
  [SLIDE_TITLES.length, true, SLIDE_TITLES.map((_, i) => i + 1)]);
t("B2b: and the one slide unit carries BOTH of that slide's shapes' text, which is what makes it a "
+ "SLIDE unit rather than a first-shape unit wearing the name",
  deckDoc.text_units?.every((u, i) => u.text.includes(SLIDE_TITLES[i]) && u.text.includes(SLIDE_SECOND)),
  true);

t("B3: the WORKBOOK emits NO units at all — a cell is not a passage and `sheet-range` waits on "
+ "EXTRACTION-BREADTH §3.2. The key is ABSENT rather than an empty array, because an empty list "
+ "would say this workbook holds nothing to index, which is a different and false claim",
  [Object.prototype.hasOwnProperty.call(bookDoc, "text_units"),
   /* and its text WAS extracted, which is the half that makes the gap a gap */
   bookDoc.reading?.read_from_text], [false, true]);

/* THE EXTENT IS THE CONTENT ADDRESS, AND THIS IS THE ASSERTION §4.5 RESTS ON.
   The unit's extent must canonicalise to the SAME string a member's citation of
   the same passage produces, or a hit stops being a mintable row's identity and
   the record holds one passage under two ids. Computed here with the checker's
   own `canonicalExtent`, which is the function the content table hashes with. */
t("B4: every emitted unit's extent canonicalises to the SAME bytes the content address is taken "
+ "over — a hit IS a mintable row's identity (§4.5), and a second spelling would mint a second row "
+ "for one passage",
  /* NULL-SAFE, AND IT WAS NOT ON ITS FIRST RUN. Under the `nowire` control arm
     `text_units` is absent, a bare spread threw a TypeError, and a TypeError
     inside an assertion goes through NO assertion at all — it ended the module
     while the tally read clean, so the arm's verdict read 4/6 when the truth was
     that the suite never reached the two arms that would have answered. */
  [...(docDoc.text_units || []), ...(deckDoc.text_units || [])]
    .filter((u) => canonicalExtent(u.extent) !== canonicalExtent({ ...u.extent })).length, 0);
t("B4b: and a PDF page's rect is DEGENERATE on purpose — `describeExtent` reads a null rect as the "
+ "WHOLE page, so the indexed unit and a member citing `page 14` address one passage. A literal "
+ "rectangle would compute a different content id for the same words",
  [describeExtent({ kind: "pdf-page", page: 13, rect: null }),
   describeExtent({ kind: "pdf-page", page: 13, rect: [0, 0, 612, 792] })],
  ["page 14", "page 14, a region of it"]);

/* ========================================================================= *
 *  C · THE WRITER AT PROMOTE, AND THE `indexed` OBSERVATION
 * ========================================================================= */
console.log("\n--- C · op=promote writes the units, and the capture SAYS what the index holds ---");

const B_DOC = "INFO-2026-9310-document";
const B_DECK = "INFO-2026-9310-deck";
const B_BOOK = "INFO-2026-9310-workbook";
await promote(B_DOC, { document: docDoc });
await promote(B_DECK, { document: deckDoc });
await promote(B_BOOK, { document: bookDoc });

const st1 = await get("stats", "", "adm-rec91");
t("C1: the units are PERSISTED — one row per paragraph plus one per slide, and the workbook "
+ "contributes none",
  st1.textUnits, PARAS.length + SLIDE_TITLES.length);
/* CORRECTED BY THIS ITEM'S OWN `replace` CONTROL ARM, and the first spelling is
   kept here because it is the more useful half of the lesson. It read
   `st1.textIndexed === st1.textUnits` and called that "the trigger discipline
   asserted rather than believed" — and it was an equality that COSTS NOTHING:
   an FTS5 external-content table answers `count(*)` out of its content table, so
   the two figures were one figure read twice. The `replace` arm planted a real
   orphan, the assertion stayed green, and the arm came back 2/3 rather than 3/3.
   `textIndexOk` is FTS5's own `integrity-check` AT RANK 1, which compares the
   index against the content table and throws when they disagree — measured to
   catch the orphan that rank 0 passes over. */
t("C1b: and the INDEX IS TRUE AGAINST THE BASE TABLE — FTS5's own integrity check at rank 1, which "
+ "is a question with an answer rather than a count read twice. An index row outliving its base row "
+ "still MATCHES, which is the record answering out of text it no longer holds",
  st1.textIndexOk, true);

const axDoc = await axisOf(docDoc.capture.sha256);
t("C2: the DOCUMENT's content axis says its text is FULLY indexed — DETERMINED, where before this "
+ "item every extracted capture answered UNDETERMINED because no index existed",
  [axDoc.indexed, axDoc.determined], [FULL, true]);
t("C2b: and the EXTRACTION axis beside it is still extraction's own row, not the index's — two "
+ "looks at one subject, kept apart by AUTHORITY rather than by there being only one kind of row",
  [axDoc.extraction?.state, axDoc.extraction?.authority_kind], ["PRESENT", "extract"]);

/* THE OVER-STRICTNESS DIRECTION IN THE PRODUCT, not in a control arm: a
   container this record cannot address a passage of must say so, and must NOT
   read as a document with no text. */
const axBook = await axisOf(bookDoc.capture.sha256);
t("C3: the WORKBOOK says NONE with a REASON — its text WAS extracted and this record cannot address "
+ "a passage of it. That is not an absence of text and the answer must not let it read as one",
  [axBook.indexed, axBook.determined, axBook.extraction?.state], [NONE, true, "PRESENT"]);
t("C3b: and the reason NAMES the container rather than the category, so a member is told which "
+ "absence is true (CLAUDE.md's sparse rule, made mechanical where absence is read)",
  typeof axBook.why === "string" && axBook.why.includes("xlsx"), true);

/* THE PRE-ITEM CORPUS, WHICH IS EVERY CAPTURE ON EVERY LIVE INSTANCE. A capture
   whose text was extracted before this writer existed has no index observation,
   and the honest answer is UNDETERMINED — not `partial`, which would tell a
   member some of its passages are searchable when none of them are. */
{
  const orphan = sha("a capture extracted before REC-91's writer existed");
  await promote("INFO-2026-9310-prelog", { document: {
    ...docDoc, text_units: undefined,
    capture: { ...docDoc.capture, sha256: orphan },
    reading: { ...docDoc.reading, text_container: null } } });
  const ax = await axisOf(orphan);
  t("C4: a capture whose text was extracted with NO units offered answers on the index axis without "
  + "claiming partial coverage it does not have — the null-read-as-falsy direction, refused",
    ax.indexed !== PARTIAL, true);
}

/* ========================================================================= *
 *  D · THE CHAIN MOVE, AND THE BOUNDS
 * ========================================================================= */
console.log("\n--- D · a chain move REPLACES the units, and both bounds bite where §4.3 says ---");

const PDF_SHA = sha("a captured pdf whose pages carry text");
const pdfDocOf = (pages, chainStep) => ({
  file: "snapshots/packet.pdf", locator: "https://www.oaklandca.gov/packet.pdf", retrieved: NOW,
  capture: { sha256: PDF_SHA, encoding: "binary", bytes: 4096 },
  reading: { content_type: "meeting_packet", reader_version: 1, read_from_text: true,
             found: false, entities: [], facts: {}, at: NOW,
             text_source: [{ step: chainStep, tier: chainStep === "ocr" ? 3 : 1, container: "pdf" }],
             text_tier: chainStep === "ocr" ? 3 : 1, text_container: "pdf",
             page_count: pages.length, container_extent: null,
             basis: "a synthetic reading for the index writer" },
  text_units: pages.map((text, i) => ({ extent: { kind: "pdf-page", page: i, rect: null },
                                        seq: i, text })),
});

const B_PDF = "INFO-2026-9310-packet";
const FIRST = ["the layer read this page as quorum absent", "and this page as appropriation"];
await promote(B_PDF, { document: pdfDocOf(FIRST, "layer") });
const stPdf1 = await get("stats", "", "adm-rec91");
t("D1: the PDF's pages are indexed as `pdf-page` units",
  stPdf1.textUnits - st1.textUnits, FIRST.length);
const axPdf1 = await axisOf(PDF_SHA);
t("D1b: and the capture says its text is fully indexed, under the chain that produced it",
  [axPdf1.indexed, axPdf1.determined], [FULL, true]);

/* THE CHAIN MOVE. §4.1: the capture's previous text rows are deleted first, so a
   revised chain never leaves a unit claiming an engine that did not produce it.
   The SECOND read recovers FEWER pages than the first, which is the direction
   that would leave a stale row standing if the delete were conditional. */
const SECOND = ["ocr recovered this page as ocelot"];
await promote(B_PDF, { document: pdfDocOf(SECOND, "ocr") });
const stPdf2 = await get("stats", "", "adm-rec91");
t("D2: A CHAIN MOVE REPLACES THE UNITS AND DOES NOT ADD TO THEM — the re-extraction recovered ONE "
+ "page where the layer read TWO, and the record holds one. A unit left behind would claim an "
+ "engine that did not produce it",
  stPdf2.textUnits - st1.textUnits, SECOND.length);
t("D2b: and the FTS index moved with it — the superseded text is not merely unreferenced, it is "
+ "GONE from the index, which is the orphan the trigger discipline exists to prevent. Asserted "
+ "through the integrity check rather than through a count, because a count of an external-content "
+ "table cannot see an orphan at all (measured)",
  stPdf2.textIndexOk, true);

/* THE PER-UNIT CAP. A unit over it is stored TO it and FLAGGED, never a silent
   prefix — M5's rule, and §4.3's. The flag is reported on the observation's own
   sentence, which is the only surface that carries it until REC-92. */
{
  const big = "x".repeat(200 * 1024);
  const sh = sha("a capture with one unit over the per-unit cap");
  await promote("INFO-2026-9310-bigunit", { document: {
    ...pdfDocOf([big], "layer"), capture: { sha256: sh, encoding: "binary", bytes: 4096 } } });
  const ax = await axisOf(sh);
  t("D3: a unit over the PER-UNIT cap is stored to the cap and SAYS it was truncated — never a "
  + "silent prefix (M5's rule). The capture is still fully indexed: truncation is a fact about a "
  + "unit, not about the capture's coverage",
    [ax.indexed, /truncated/.test(String(ax.index?.detail))], [FULL, true]);
}

/* THE PER-CAPTURE BOUND, which is the one that actually bounds a promote. Over
   it, the capture is indexed TO the bound IN READING ORDER and says `partial` —
   which is why `seq` exists: a partial index must be a PREFIX a reader can
   reason about and not an arbitrary subset. */
/* D4 — THE BOUND ARM, AND IT CAME BACK WITH A FINDING RATHER THAN A PASS. IT IS
   RECORDED HERE AS WHAT IT MEASURED rather than rewritten into something that
   would go green.
   *
   * It was written to drive §4.3's per-capture bound: 24 pages of 100 KiB, about
   2.4 MiB, indexed to 2 MiB with the rest reported `partial`. **The promote was
   REFUSED** — `OVERSIZE_INLINE`, `data/provenance.json`, 2,460,076 bytes —
   because `op=promote` will not accept an inline bundle file over `INLINE_MAX`
   (1,048,576 B), and `data/provenance.json` is the route §4.1 names for getting
   the units to the store.
   *
   * SO §4.3's BOUND IS NOT THE BOUND THAT BINDS, and left alone this item would
   * have REFUSED documents the record accepts today — M-20's census holds a PDF
   * with 1,354,686 B of text and a docx with 1,187,253 B, both of which promote
   * now and neither of which would have. The acquire wire therefore carries its
   * own budget (half of `INLINE_MAX`) and COUNTS what it drops, so a capture
   * truncated at the wire is reported `partial` rather than recorded as whole.
   * Reported as a DESIGN GAP against §4.3.
   *
   * WHAT THIS SUITE THEREFORE CANNOT DRIVE, and it is named rather than faked:
   * a capture that reaches the STORE's 2 MiB bound. Nothing can send one. The
   * store's branch is exercised by `nc-rec91.mjs`'s `overstrict` arm, which
   * lowers the bound — a control arm reaching a branch the product's own route
   * cannot is a finding about the ROUTE, and it is this one. */
{
  const page = "y".repeat(100 * 1024);
  const pages = Array.from({ length: 24 }, (_, i) => `page${i} ${page}`);   /* ~2.4 MiB offered */
  const sh = sha("a capture over the per-capture bound");
  const doc = { ...pdfDocOf(pages, "layer"),
                capture: { sha256: sh, encoding: "binary", bytes: 1 << 22 } };
  /* THE WIRE'S BUDGET APPLIED BY HAND, because this document is authored rather
     than acquired — the same arithmetic `op=acquire` does, so the fixture stands
     in for a real capture of that size rather than bypassing the rule it is
     about. */
  let budget = 512 * 1024, kept = [], dropped = 0;
  for (const u of doc.text_units) {
    /* THE ENVELOPE IS CHARGED HERE TOO, because the wire charges it — a fixture
       standing in for a real capture has to spend what a real capture spends, or
       it is a fixture standing in for a different document. */
    const size = Buffer.byteLength(u.text, "utf8") + 128;
    if (size > budget) { dropped++; continue; }
    budget -= size; kept.push(u);
  }
  doc.text_units = kept; doc.text_units_over_bound = dropped;
  t("D4a: the wire's budget drops most of a 2.4 MiB capture and KEEPS the arithmetic honest — "
  + "fewer units offered, and the number dropped carried beside them",
    [kept.length > 0, dropped > 0, kept.length + dropped], [true, true, pages.length]);
  await promote("INFO-2026-9310-overbound", { document: doc });
  const ax = await axisOf(sh);
  t("D4: a capture whose text did not fit is indexed to the budget and says PARTIAL, naming BOTH "
  + "bounds — the design's 2 MiB and the one the promote path's inline-file limit actually forces. "
  + "A capture truncated at the wire and recorded as WHOLE would be the record claiming coverage it "
  + "does not have, at the one level a member reads absence from",
    [ax.indexed, ax.determined, /2097152/.test(String(ax.index?.bound))], [PARTIAL, true, true]);
  t("D4b: AND THE PROMOTE WAS NOT REFUSED, which is the half that matters more than the state. "
  + "Before the wire carried a budget this exact document answered OVERSIZE_INLINE at 2,460,076 B "
  + "against INLINE_MAX 1,048,576 — an index that made the record unable to FILE a document would "
  + "be the worst direction available (DESIGN GAP, §4.3)",
    HEAD.has("INFO-2026-9310-overbound"), true);
}

/* ========================================================================= *
 *  E · PURGE, BOTH ARMS, AND THE INDEX GOES WITH THE ROWS
 * ========================================================================= */
console.log("\n--- E · purge takes the units AND the index, in both arms (D-113) ---");

{
  const before = await get("stats", "", "adm-rec91");
  /* FLOORED BEFORE THE DELTA IS TAKEN. A purge that silently did nothing would
     give a delta of zero on an empty table and read as "nothing to clear" — the
     costs-nothing rule at the one assertion that is supposed to prove a
     destructive op took. */
  t("E0: there is something to purge — the delta below is over a non-empty index",
    before.textUnits > 0 && before.textIndexOk === true, true);
  await post(`purge&confirm=bio&bundleId=${encodeURIComponent(B_DOC)}`, {}, "adm-rec91");
  const after = await get("stats", "", "adm-rec91");
  t("E1: the PER-BUNDLE arm takes that document's units — a purged document whose passages stayed "
  + "indexed would let a search answer out of a file nobody holds, and a later bundle allocated a "
  + "colliding id would inherit somebody else's text",
    before.textUnits - after.textUnits, PARAS.length);
  t("E1b: and the index arm went with them WITHOUT purge saying anything to the FTS table at all — "
  + "the triggers make both arms correct by construction rather than by each deleter remembering",
    after.textIndexOk, true);
}
{
  await post("purge&confirm=bio", {}, "adm-rec91");
  const after = await get("stats", "", "adm-rec91");
  t("E2: the WHOLE-STORE arm empties both — a scratch reset reporting scope ALL while a search still "
  + "answered out of the purged corpus is the D-113 silent leftover in the one surface a member "
  + "reads absence from",
    [after.textUnits, after.textIndexOk], [0, true]);
}
{
  /* AND THE STORE IS STILL WRITABLE, which is the half a vtab corruption would
     only show later. A purge that left the index corrupt would pass every count
     assertion above and fail on the next promote. */
  await promote("INFO-2026-9310-afterpurge", { document: pdfDocOf(FIRST, "layer") });
  const after = await get("stats", "", "adm-rec91");
  t("E3: and the store still INDEXES after a whole-store purge — a corrupted external-content table "
  + "passes every count above and fails on the next write",
    [after.textUnits, after.textIndexOk], [FIRST.length, true]);
}

/* ========================================================================= *
 *  F · THE INDEX ITSELF, ON THE PRODUCT'S OWN DDL
 * ========================================================================= */
console.log("\n--- F · MATCH, snippet() and integrity, on the DDL extracted from store.mjs ---");

{
  /* THE DDL IS EXTRACTED FROM THE PRODUCT, NEVER RETYPED. A copy would agree
     with `store.mjs` for free and would go on passing after the product's DDL
     changed underneath it — the blind-by-construction assertion this repository
     has measured repeatedly. */
  const tableDdl = (() => {
    const i = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS capture_text (");
    return SCHEMA_SRC.slice(i, SCHEMA_SRC.indexOf(");", i) + 1);
  })();
  const ftsDdl = /CREATE VIRTUAL TABLE IF NOT EXISTS capture_text_fts USING fts5\(([\s\S]*?)\)`/
    .exec(STORE_SRC)[0].replace(/`$/, "");
  const trigs = [...STORE_SRC.matchAll(/CREATE TRIGGER IF NOT EXISTS capture_text_\w+ AFTER \w+ ON capture_text BEGIN[\s\S]*?END/g)]
    .map((m) => m[0]);
  t("F0: the DDL under test was EXTRACTED from the product's own sources, and the extraction is "
  + "non-empty — a probe over a failed regex would pass silently over nothing",
    [tableDdl.length > 200, ftsDdl.length > 60, trigs.length], [true, true, 3]);

  const probe = new Miniflare({
    modules: true, compatibilityDate: "2026-07-01",
    durableObjects: { P: { className: "P", useSQLite: true } },
    script: `
export class P {
  constructor(ctx) { this.ctx = ctx; this.sql = ctx.storage.sql; }
  async fetch(req) {
    const b = await req.json();
    const out = {};
    for (const s of b.ddl) this.sql.exec(s);
    const ins = (sha, i, text) => this.sql.exec(
      "INSERT INTO capture_text (capture_sha,bundle_id,extent_kind,extent,ref,seq,text,truncated,chain_kind)"
      + " VALUES (?,?,?,?,?,?,?,?,?)",
      sha, "bun-" + sha, "pdf-page", JSON.stringify({ page: i, sha }), "page " + (i + 1), i, text, 0, "layer");
    this.ctx.storage.transactionSync(() => {
      ins("s1", 0, b.terms[0]); ins("s1", 1, b.terms[1]); ins("s2", 0, b.terms[2]);
    });
    const m = (q) => [...this.sql.exec("SELECT count(*) c FROM capture_text_fts WHERE capture_text_fts MATCH ?", q)][0].c;
    out.match_one = m(b.query);
    out.snippet = [...this.sql.exec(
      "SELECT snippet(capture_text_fts, 0, '[', ']', '...', 8) s FROM capture_text_fts WHERE capture_text_fts MATCH ?",
      b.query)].map(function (r) { return r.s; });
    this.ctx.storage.transactionSync(() => { this.sql.exec("DELETE FROM capture_text WHERE capture_sha=?", "s1"); });
    out.after_delete = m(b.query);
    out.after_delete_other = m(b.other);
    try { this.sql.exec("INSERT INTO capture_text_fts(capture_text_fts) VALUES('integrity-check')"); out.integrity = "ok"; }
    catch (e) { out.integrity = String(e); }
    return new Response(JSON.stringify(out), { headers: { "content-type": "application/json" } });
  }
}
export default { async fetch(req, env) { return env.P.get(env.P.idFromName("a")).fetch(req); } };
`,
  });
  const r = await (await probe.dispatchFetch("http://x/", { method: "POST", body: JSON.stringify({
    ddl: [tableDdl, ftsDdl, ...trigs],
    terms: ["the quorum was absent from the vote", "an unrelated page", "quorum elsewhere entirely"],
    query: "quorum", other: "unrelated",
  }) })).json();
  await probe.dispose();

  t("F1: the index MATCHES the units' text, and `snippet()` returns the PASSAGE — read out of the "
  + "base table, which is what external content buys",
    [r.match_one, r.snippet.length === 2 && r.snippet.every((s) => /\[quorum\]/.test(s))],
    [2, true]);
  t("F2: deleting one capture's rows removes exactly that capture's index entries and leaves the "
  + "other's standing — the `'delete'` command the trigger issues, driven rather than assumed",
    [r.after_delete, r.after_delete_other], [1, 0]);
  t("F3: and FTS5's own integrity-check passes afterwards — a plain `DELETE ... WHERE rowid` on an "
  + "external-content table answers SQLITE_CORRUPT_VTAB, which is why the trigger exists",
    r.integrity, "ok");
}

/* WHAT THIS SUITE CANNOT SEE, NAMED RATHER THAN SCORED ZERO.
   - The `passage:` ARM AND `rows=passage` (§8's first, third and fifth controls):
     REC-92's, and not approximable here — a bundle-returning arm, the REC-36
     withholding and "searching mints nothing" are all properties of a read that
     does not exist on this tree.
   - A SLIDE'S SPEAKER NOTES. `pptxText` emits them per slide and DEC-5 forbids
     merging them with slide text, and the only address that reaches a slide is
     `slide-shape`, whose shape-omitted form is now the slide itself. So the most
     candid text in a deck has no indexable unit. Reported as a DESIGN GAP.
   - A `sheet-range` UNIT, which does not exist (EXTRACTION-BREADTH §3.2).
   - A REAL PDF PRODUCER. The `pdf-page` arm is driven through `op=promote` with
     an authored provenance document, which is the writer's real input; what it
     does NOT exercise is `pdfstructure`'s own `text.pages[]` reaching the wire.
     The DOCX and PPTX arms do exercise that path end to end, so the wire's
     shape-recognition is measured — but on two of its three arms, not three. */
console.log(`\n  WHAT THIS SUITE CANNOT SEE: the \`passage:\` arm (REC-92), a slide's speaker notes `
          + `(no extent arm — DESIGN GAP), a \`sheet-range\` unit (EXTRACTION-BREADTH §3.2), and the `
          + `PDF producer's own text reaching the wire (driven through op=promote instead).`);

reachedFoot = true;
} catch (e) {
  /* PRINTED, NEVER SWALLOWED. A throw inside the body goes through no assertion
     at all, and a `finally` that calls `process.exit` suppresses the stack — so
     the one thing a reader needs to act on would be the one thing not shown. */
  console.log(`
  THREW BEFORE THE FOOT: ${e && e.stack ? e.stack : e}`);
} finally {
  await mf.dispose();
  /* THE FOOT, AND THE TALLY IS -1 IF IT WAS NEVER REACHED. A TypeError inside an
     assertion goes through NO assertion at all — it ends the module while the
     tally reads clean — so a suite that did not reach its own foot must report
     that rather than a number. WORKER.md's own receipt. */
  console.log(`\ncapture-text-index: ${reachedFoot ? pass : -1} pass, ${reachedFoot ? fail : -1} fail`);
  process.exit(reachedFoot && fail === 0 ? 0 : 1);
}
