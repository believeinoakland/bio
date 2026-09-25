/* NEGATIVE CONTROL: D-724 (a partial capture NAMES the units it skipped over the bound; BOB #36 2026-09-25 11:20Z, option (b)), run 2026-09-25 through `node test/nc-rec91.mjs <arm>` from `bio-plane/`, FIVE NEW ARMS, each ALONE, every restore byte-identical by sha256 AND content (first run `src/store.mjs` 3,480,187 B sha256 dfc6659a4284…, `src/index.mjs` 895,904 B sha256 43616b2ba8f3…, baseline 86/0, figures below; RE-RUN after the gate named the unbounded read and the cap landed — `src/store.mjs` 3,481,086 B sha256 1ed386f531d4…, baseline 89/0: `d724nowrite` 84/5 (its four AND Z7, no rows to cut), `d724wire` 86/3, `d724nodelete` 88/1, `d724cutisskip` 85/4, and (u) `d724nocap` — serve the row read past the cap; MUST fail Z7 alone → 88/1, as declared). Baseline 86/0. Declared before arming: (q) `d724nowrite` — THE ROW'S CONTROL: drop the skipped-key write; MUST fail G6b, G6c, Z5d (naming S4), Z5e → 82/4, exactly those four, as declared. (r) `d724wire` — the wire drops a unit without naming it; MUST fail Z5c, Z5d, Z5e and MUST NOT move G6b/G6c (the store's loop) → 83/3, as declared. (s) `d724nodelete` — the rewrite leaves the named gaps standing; MUST fail Z5f alone → 85/1, as declared. (t) `d724cutisskip` — OVER-STRICTNESS: name a unit the wire CUT (and carried) as skipped; declared Z3b and Z5c → 82/4: both, AND Z5d/Z5e UNDECLARED — recorded, not smoothed: S1–S3 are named beside S4, the arm's own subject reaching the read. The seventeen earlier arms re-run on this tree, every one AS DECLARED; the new assertions each reaches are the arm's own subject: `noobs`/`overstrict` G6b G6c G7b Z3b Z5d Z5e Z5f (no index row / a 64 B bound), `d685whole` Z3b Z5c Z5d Z5e (the whole-unit wire skips different sheets), `d672nosheets` Z5c Z5d Z5e, `d672storeset` Z5e Z5f, `nowire` Z5d. First run found an INSTRUMENT defect, fixed: Z5e's pattern required the `;` of a trailing truncated clause, so `d685storeflag` failed it; it now reads the clause it tests. REC-91's `nopurge` anchor moved with the purge list (D-724 appends an entry) and arms once, as before. */
/* NEGATIVE CONTROL: D-685 (a unit over the acquire wire's budget is carried as its capped prefix, marked truncated), run 2026-09-25 through `node test/nc-rec91.mjs <arm>` from `bio-plane/`, THREE NEW ARMS, each ALONE, every restore byte-identical by sha256 AND content (first on `src/index.mjs` 893,432 B sha256 cdf667478865… / `src/store.mjs` 3,473,715 B sha256 03139705cbdb…; RE-RUN, the four arms here with the same verdicts, after the cap moved to `checks/bio-checks.mjs` — `src/index.mjs` 893,527 B sha256 6298c78c9352…, `src/store.mjs` 3,473,965 B sha256 d26738241468…). Baseline 78/0. Declared before arming: (n) `d685whole` — THE ROW'S CONTROL: charge and carry the WHOLE unit again (the pre-D-685 wire); MUST fail Z1, Z2, Z3, Z4, Z4b, Z5 and MUST NOT move Z5b or Z6 → 72/6, exactly those six BY NAME, as declared. (o) `d685storeflag` — the writer ignores the wire's `truncated: true`; MUST fail Z2 and Z4b alone (the prefix arrives AT the cap, so the writer's own comparison calls it whole) → 76/2, as declared. (p) `d685flagall` — OVER-STRICTNESS: mark every carried unit truncated, cut or not; MUST fail Z5, Z5b, Z6 → 75/3, as declared. Zero undeclared failures on any arm. The fourteen earlier arms re-run on this tree, every one AS DECLARED; their new failures in §Z are each the arm's own subject reaching the new section and are recorded, not smoothed: `noobs` adds Z3/Z5b (the axis reads), `overstrict` Z2/Z3/Z4b (a 64 B capture bound), `d672storeset` Z3/Z5b (no sheet arm in the store's set), `nowire` and `d672nosheets` Z1–Z6 (no units at all). Those last two first THREW at Z6 (`bookDoc.text_units.some` over an absent list) — a finding about the suite, fixed with `?.` so the arm fails Z6 BY NAME instead: `nowire` 53/25, `d672nosheets` 61/17. The BEFORE reading (the HEAD sources swapped in) is M-184: 71/7. */
/* NEGATIVE CONTROL: D-684 (a text/csv capture read as text at intake reaches its format entry), run 2026-09-25 through `node test/nc-rec91.mjs <arm>` from `bio-plane/`, THREE NEW ARMS, each ALONE, every restore byte-identical by sha256 AND content (`src/index.mjs` 892,191 B sha256 da5f850111be…, re-run after the D-70 comment rewording). Baseline 70/0. Declared before arming: (k) `d684shortcircuit` — THE ROW'S CONTROL: skip D-684's block so the content-type reader's branch short-circuits again (the pre-D-684 tree); MUST fail Y1 and Y3 and MUST NOT move Y2 (the profile reading is the same either way) or Y4 → 68/2, exactly Y1 and Y3 BY NAME, as declared. (l) `d684certain` — OVER-STRICTNESS: admit the entry only on a CERTAIN detection, which a csv never has (no magic bytes; `likely` by construction); MUST fail Y1 and Y3 → 68/2, as declared. (m) `d684overreach` — SCOPE: write `text_container` for any detected format before the `text()` guard; MUST fail Y4 alone (an HTML reading claiming a container the wire never read) → 69/1, as declared. Zero undeclared failures on any arm. */
/* NEGATIVE CONTROL: D-672 (the workbook's sheet unit), run 2026-09-25 through `node test/nc-rec91.mjs` from `bio-plane/`, THREE NEW ARMS beside REC-91's seven, every arm ALONE, every restore byte-identical by sha256 AND content (`src/index.mjs` 889,784 B sha256 d62623fb8d0c…; `src/store.mjs` 3,472,630 B sha256 764a2df0f8b1…). Declared before arming: (h) `d672nosheets` — THE ROW'S CONTROL: drop the `sheets[]` arm from `textUnitsFor`; MUST fail B3, B3b, C1, C3c, X1 (the workbook passage search returns 0 rows), X2, X2b and MUST NOT move the document, deck or no-arm arms → 59/7, exactly those seven BY NAME, as declared. (i) `d672storeset` — revert the store's container set to its pre-D-672 five; MUST fail C3c, X2b, X3 and MUST NOT move B3, C1 or X1 — the units are emitted, WRITTEN and FOUND while the observation says the container has no unit arm, the record contradicting itself → 63/3, as declared. (j) `d672strict` — OVER-STRICTNESS: admit a sheet only when its grid bound is stated, dropping the .ods sheet (bound NULL by format, used range measured); MUST fail X2, X2b and MUST NOT move the .xlsx arms → 64/2, as declared. REC-91's arms re-run on this tree: baseline 66/0; `nowire` had NOT ARMED since CPDF-19 moved its anchor line from sixteen spaces of indent to four (matched 0×, a control that could never fail) — re-anchored, now 51/15, 8/8 declared; `armsopen` 64/2 (C3b and X3, X3 newly declared because it reads the set this arm replaces); `noobs` 51/15, `overstrict` 49/17, `replace` 58/8, `nopurge` and `nodelete` -1 (THREW, declared) — every arm AS DECLARED. `d672nosheets` IS the pre-D-672 wire, so it is the before-the-fix reading. */
/* NEGATIVE CONTROL: D-531 (§W), run 2026-09-25, each arm ALONE with the other site held fixed, restored by `cp` from a uniquely-named pristine copy and verified by sha256 AND `cmp` (`index.mjs` 838,838 B sha256 38590bd40c69…; `store.mjs` 3,329,535 B sha256 bdfbfedbab26…). Declared before arming: (a) `index` — restore `u.text.length` in `index.mjs`'s `arm`; MUST fail W1 and W1b and MUST NOT move W2/W3, because the store's own filter still refuses the blank units → 58/2, W1 and W1b BY NAME, as declared. (b) `store` — restore `u.text.length` in `#writeCaptureText`'s ordering filter; MUST fail W2 and W3 and MUST NOT move W1/W1b → 58/2, W2 and W3 BY NAME, as declared. (c) `overstrict` — `glyphCount(u.text) > 1` at the `arm` site; MUST fail W1b (the one-glyph `§` paragraph dropped) → 58/2, W1b BY NAME and W1 WITH it, which was not declared and is correct: W1 asserts the exact surviving para list, so it sees the same drop. Before the fix, both sites pristine: 56/4 (W1, W1b, W2, W3) — M-154. */
/* NEGATIVE CONTROL: SIX arms and a baseline live in `test/nc-rec91.mjs` and are re-run in one step with `node test/nc-rec91.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with every other defence held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by content (`cmp`) with a byte count printed and a minimum guarded — never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work. Declared before arming, and every one RUN; results are in this item's report and in CLAIMS.md's release line. (a) `baseline` — nothing armed; MUST be green, the row that distinguishes six-arms-broken from six-arms-working. (b) `nopurge` — drop `"capture_text"` from `purge`'s TABLES array; MUST fail the purge arms BY NAME in BOTH directions (the per-bundle arm and the whole-store arm) and MUST fail `hygiene.test.mjs`'s D-113 census, which is the check that would have caught it at the moment the mistake was made. (c) `nodelete` — in `#writeCaptureText` remove the leading `DELETE FROM capture_text WHERE capture_sha=?`; MUST fail the CHAIN-MOVE arm by name — the superseded text is still indexed, which is a search answering out of an engine that did not produce it — and MUST NOT move any first-promote arm, because on a first promotion there is nothing to delete and the defect is invisible. (d) `replace` — change that same plain `INSERT` to `INSERT OR REPLACE` and drop the delete with it; MUST fail the chain-move arm AND the stats-parity arm (`textIndexed` exceeds `textUnits`), because SQLite does not fire delete triggers for REPLACE conflict resolution and the superseded row's index entry is ORPHANED — this is the arm that proves the measured hazard is real in the product and not only in a probe. (e) `noobs` — neuter `#observeIndexed` to return without appending; MUST fail every content-axis arm and MUST NOT move the row-count arms, which separates the OBSERVATION from the WRITE. (f) `armsopen` — treat every container as having a unit arm (`CAPTURE_TEXT_UNIT_CONTAINERS` becomes a Set that answers true); MUST fail the WORKBOOK arm alone, because a workbook would then be recorded as extracted-and-indexed-nothing rather than as having no unit arm — the false-absence direction this item's whole vocabulary exists to refuse. (g) `overstrict` — THE OVER-STRICTNESS DIRECTION, and it is armed against the BOUND rather than against the writer: drop the per-capture bound to 64 B so an ordinary document goes `partial`; MUST fail the FULL arms and MUST NOT fail the partial arm or any refusal, because a bound tighter than its rule is not a safer bound — it makes the record say it holds less than it does, and a member reading `partial` would re-extract a document that was already whole. */
/* RESULTS: see this item's report and the CLAIMS.md release line. */
/* RESULTS, REC-111's arms RE-RUN 2026-09-16 on the final tree, each ALONE, every restore byte-identical by sha256 AND by content (`store.mjs` 2,242,874 B sha256 e03a95882562… four times; `index.mjs` 586,300 B sha256 b90c31c4f2ad…): baseline 55/0 green · nounitbound 51/4 · sentencebytesonly 54/1 · gtnotge 52/3 · tighten 50/5 · pinoff 54/1 — ALL SIX AS DECLARED, every declared failure present and ZERO UNDECLARED failures, which this harness CHECKS rather than describes afterwards. ONE RESULT CAME BACK DIFFERENT FROM ITS DECLARATION AND IS RECORDED RATHER THAN SMOOTHED: `tighten` was declared with EIGHT failures and returned FIVE, and the three surprising greens (`G5`, `G6b`, `G7`) are a finding about the SUITE — they read `CAPTURE_TEXT_CAPTURE_UNIT_BOUND` out of the product, so both sides of each assertion move with it and they are blind to its VALUE by construction. That is not fixed by hand-copying the constant, which agrees for free; it is why `G1`, `G2`, `G6` and `G8` carry independent figures (the wire's derived ceiling, M-20's literals, and two real documents by name), and all four went red. The declaration is corrected to what the arm does. AND THE REGISTER DOES NOT COUNT THIS DECLARATION, which is stated rather than worked around: `control-register.mjs`'s `readControl` records "the fullest single statement, never the sum", so this suite's tally stays REC-91's seven arms and `REGISTER_FLOOR` did not move (arms 1109/1109 · classified 199/199 · corpus 200/200, exit 0 — unchanged from the baseline). The instrument was not touched. */
/* NEGATIVE CONTROL: FIVE arms and a baseline live in `test/nc-rec111.mjs` for SECTION G (REC-111, the UNIT-COUNT bound) and are re-run in one step with `node test/nc-rec111.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with every other defence held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by content with a byte count printed and a minimum guarded — never `git checkout --`. The harness also fails an arm on any UNDECLARED failure, so an arm measuring something wider than its subject is caught rather than described afterwards. Declared before arming, and every one RUN. (a) `baseline` — nothing armed; MUST be green, the row that distinguishes five-arms-broken from five-arms-working. (b) `nounitbound` — THE ITEM'S OWN: drop the unit half of `#writeCaptureText`'s bound branch so the constant is computed and thrown away, which is the tree exactly as it was before this item; MUST fail `G3`, `G5`, `G6` and `G6b` BY NAME, and between them those lines print the UNIT COUNT and the BYTE COUNT — `G6b` is asserted as a WHOLE SENTENCE rather than as a pair of regexes precisely so the failure names both, since a failure naming one is a failure a reader cannot act on; MUST NOT move `G1` or `G2`, which is the finding this arm carries — DECLARING a bound and ENFORCING one are two acts and this arm is the gap between them. (c) `sentencebytesonly` — revert `#observeIndexed`'s `partial` sentence to the pre-item wording naming only the byte bound, leaving the trimming intact; MUST fail `G6` ALONE, which separates the BOUND from what the record SAYS about it — two defences, and a suite whose halves fall together cannot tell which one is enforcing. (d) `gtnotge` — compare `written >` instead of `>=`, indexing one unit past the bound; MUST fail `G3`, `G5` and `G6b` and MUST NOT move `G7`, and that held-open half is the point: the exactly-at-the-bound test an author would naturally write does NOT catch this defect. (e) `tighten` — THE ARM THAT DECIDES THIS ITEM IS SAFE TO SHIP, and it is the over-strictness direction because §4.3's own bound was not merely too tight but a REGRESSION: lower the unit bound to 512, the round number an author reasoning from §4.1's worked example would reach for instead of from M-20's ladder; MUST fail `G1`, `G2`, `G6` and BOTH worst-docx arms, and MUST NOT move `G5`, `G6b`, `G7` or the worst-PDF arm. Its first run was declared with eight failures and returned five, and the three surprising greens are recorded at the arm rather than smoothed: they read the bound OUT OF THE PRODUCT, so both sides of each assertion move with it, and an assertion written that way can prove the MECHANISM right and can never prove the NUMBER right — which is why `G1`, `G2`, `G6` and `G8` carry independent figures and are the entire defence against a wrong constant. (f) `pinoff` — halve `ACQUIRE_TEXT_UNIT_ENVELOPE` to 64, doubling the acquire wire's unit ceiling past the store's bound; MUST fail `G1` ALONE and move NO store arm. This is the arm that justifies shipping no unit check at the wire at all: the wire's ceiling is a side effect of an envelope ESTIMATE, the argument for stating it in an assertion rather than a constant is that the assertion fires when the estimate moves, and a pin that did not fire would be a paragraph. */

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
const INDEX_SRC = readFileSync(new URL("../src/index.mjs", import.meta.url), "utf8");

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
    /* D-672: `store: true` for an ODF `mimetype`, which the format must hold
       uncompressed (the `fw19-extent-arms.test.mjs` builder's same option). */
    const stored = f.store === true, method = stored ? 0 : 8;
    const comp = stored ? data : deflateRawSync(data);
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

/* ===== D-531 — A DOCUMENT WITH WHITESPACE-ONLY PARAGRAPHS ================
 * Two paragraphs hold characters and NO GLYPH: one of ASCII whitespace, one of
 * a no-break space and an em space, which `String.prototype.length` counts and
 * no reader can search. Beside them, the OVER-STRICTNESS half: a paragraph of
 * ONE glyph (`§`) and a paragraph with whitespace AROUND its words must still
 * be emitted, the second VERBATIM — the fix is "no glyph", never "trim". */
const WS_PARAS = ["CITY OF OAKLAND", " \t  ", "\u00a0\u2003", "§", "  The marmoreal clause stands.  "];
const WS_KEPT = [0, 3, 4];
const DOCX_WS = zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="${DOCX_CT}.main+xml"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>` },
  { name: "word/document.xml", data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${W}><w:body>`
      + WS_PARAS.map((p) => `<w:p><w:r><w:t xml:space="preserve">${p}</w:t></w:r></w:p>`).join("")
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

/* ===== THE WORKBOOK — REAL TEXT, ONE UNIT PER SHEET =====================
 * CORRECTED BY D-672, and the old heading is kept in words because it was right
 * for its day: this fixture was "REAL TEXT AND NO UNIT ARM", its point the gap —
 * a workbook's text extracted and no passage of it addressable. M-20 measured
 * that gap at 288 workbooks in the census holding 72,651,441 bytes of text over
 * 1,056 sheets and not one indexable unit. D-672 closes it at the grain §4.1
 * designs (*a sheet's unit is a sheet-range*), so the fixture's job is now the
 * opposite assertion: one `sheet-range` unit per sheet, keyed by the sheet's
 * used range, and a cell's text findable through `passage:`. The no-unit-arm
 * answer the fixture used to carry moves to C3, onto a container that still has
 * none. */
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
/* D-672: an `.ods` workbook is a second producer of `sheets[]` (`odf.mjs`), so
   the arm's recognise-by-shape claim is driven on a second container and not
   asserted from one. One sheet, used range A1:B3; the term occurs in one cell. */
const ONLY_IN_ODS = "Measure Q parcel levy";
const ODS_CT = "application/vnd.oasis.opendocument.spreadsheet";
const ODF_NS = ['xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"',
  'xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"',
  'xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"'].join(" ");
const odsCell = (v) => `<table:table-cell office:value-type="string"><text:p>${v}</text:p></table:table-cell>`;
const ODS = zip([
  { name: "mimetype", data: ODS_CT, store: true },
  { name: "META-INF/manifest.xml", data: `<?xml version="1.0" encoding="UTF-8"?><manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2"><manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="${ODS_CT}"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>` },
  { name: "content.xml", data: `<?xml version="1.0" encoding="UTF-8"?><office:document-content ${ODF_NS} office:version="1.3"><office:automatic-styles/><office:body><office:spreadsheet>`
      + `<table:table table:name="Levies"><table:table-row>${odsCell("Line")}${odsCell("Item")}</table:table-row>`
      + `<table:table-row>${odsCell("1")}${odsCell(ONLY_IN_ODS)}</table:table-row>`
      + `<table:table-row>${odsCell("2")}${odsCell("Library hours")}</table:table-row></table:table>`
      + `</office:spreadsheet></office:body></office:document-content>` },
  { name: "styles.xml", data: `<?xml version="1.0"?><office:document-styles ${ODF_NS}/>` },
]);

/* D-684: a `text/csv` body small enough to be READ AS TEXT AT INTAKE — the common case, and the one
   that never reached the FORMAT wire. One sheet (the csv entry's own name, `csv`), used range A1:B3; the
   term occurs in one cell and in no other fixture. The HTML page beside it is the scope arm: a textual
   capture whose format entry declares no `text()` must be exactly as it was. */
const ONLY_IN_CSV = "Measure KK bond draw";
const CSV_BODY = `Line,Item\r\n1,${ONLY_IN_CSV}\r\n2,Library hours\r\n`;
const HTML_BODY = "<!doctype html><html><head><title>Agenda</title></head><body><p>Item 1: Measure KK</p></body></html>";

/* D-685: WORKBOOKS WHOSE SHEETS ARE OVER THE WIRE'S BUDGET. A sheet is ONE unit (D-672), so its text is
   the sheet's whole stream — and the acquire wire's budget loop (`textUnitsFor`) charged that WHOLE text
   against its 524,288 B, dropping any sheet it did not fit, although the store keeps only the first
   `CAPTURE_TEXT_UNIT_CAP` (131,072) characters of a unit anyway. Each row is one cell of `ROW_W`
   characters, so a sheet's text is `rows × (ROW_W + 1) − 1` bytes (the producer joins rows with a newline)
   — ASCII, so characters and bytes agree and the arithmetic below is exact. The OPEN term sits in the
   sheet's first row, inside any prefix; the CLOSE term in its last row, past the per-unit cap. */
const ROW_W = 1000;
const bigSheet = (n, open, close) => sheetXml(Array.from({ length: n }, (_, i) =>
  [`${i === 0 ? open : i === n - 1 ? close : ""} `
    .padEnd(ROW_W, String.fromCharCode(97 + (i % 26)))]));  /* the SPACE ends the term's last token */
const xlsxOf = (sheets) => zip([
  { name: "[Content_Types].xml", data: `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="${XLSX_MAIN_CT}"/></Types>` },
  { name: "_rels/.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>` },
  { name: "xl/workbook.xml", data: `<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>`
      + sheets.map((s, i) => `<sheet name="${s.name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")
      + `</sheets></workbook>` },
  { name: "xl/_rels/workbook.xml.rels", data: `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
      + sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")
      + `</Relationships>` },
  ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: s.xml })),
]);
/* (1) ONE sheet over the WHOLE budget: 600 rows, 600,599 B. (2) A sheet over what REMAINS: 300 + 300 rows,
   the second arriving with 224,087 B left of the budget. (3) THE RESIDUE: four sheets each over the cap —
   even their capped prefixes (131,072 B + 128 B of envelope each) do not all fit 524,288 B, so the fourth
   is still dropped; a small fifth after it still fits. */
const HUGE_OPEN = "Measure ZZ ledger opening line", HUGE_CLOSE = "Measure ZZ ledger closing line";
const REST_OPEN = "Measure YY appendix opening line", REST_CLOSE = "Measure YY appendix closing line";
const FOURTH_OPEN = "Measure XX fourth sheet opening line", FIFTH_TERM = "Measure XX small fifth sheet";
const XLSX_HUGE = xlsxOf([{ name: "Ledger", xml: bigSheet(600, HUGE_OPEN, HUGE_CLOSE) }]);
const XLSX_REST = xlsxOf([{ name: "First", xml: bigSheet(300, "first", "first") },
                          { name: "Appendix", xml: bigSheet(300, REST_OPEN, REST_CLOSE) }]);
const XLSX_FOUR = xlsxOf([{ name: "S1", xml: bigSheet(200, "s1", "s1") },
                          { name: "S2", xml: bigSheet(200, "s2", "s2") },
                          { name: "S3", xml: bigSheet(200, "s3", "s3") },
                          { name: "S4", xml: bigSheet(200, FOURTH_OPEN, "s4") },
                          { name: "S5", xml: sheetXml([[FIFTH_TERM]]) }]);

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
    if (u.pathname === "/levies.ods") return bin(ODS, ODS_CT);
    if (u.pathname === "/blank-paras.docx") return bin(DOCX_WS, DOCX_CT);
    if (u.pathname === "/levies.csv") return bin(CSV_BODY, "text/csv");
    if (u.pathname === "/agenda.html") return bin(HTML_BODY, "text/html");
    if (u.pathname === "/huge-sheet.xlsx") return bin(XLSX_HUGE, XLSX_CT);
    if (u.pathname === "/rest-sheet.xlsx") return bin(XLSX_REST, XLSX_CT);
    if (u.pathname === "/four-sheets.xlsx") return bin(XLSX_FOUR, XLSX_CT);
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
let ax4Truncated = null, ax4Limit = null;   /* D-724: Z5's workbook, read back at Z7b */

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
  /* D-724 moved the signature (the wire's named skips arrive as a fifth parameter), so the anchor
     moved with it; A6a is what would have caught a stale anchor, and did. */
  const i0 = STORE_SRC.indexOf("  #writeCaptureText(bundleId, captureSha, units, chain, wireSkipped = null) {");
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
  t("A7b: D-724 — `capture_text_skipped` (the named gaps) is in purge's TABLES too, beside the units",
    !!tables && /"capture_text_skipped"/.test(tables[1]), true);
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
          + `of ${SHEET_NAMES.length} sheets (${SHEET_NAMES.join(", ")}), one sheet-range unit per sheet (D-672)`);
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

/* CORRECTED BY D-672, NOT EXEMPTED. B3 asserted the workbook emitted NO units
   ("a cell is not a passage and `sheet-range` waits on EXTRACTION-BREADTH §3.2")
   with the key ABSENT. The extent arm landed with FW-19 and every workbook
   producer emits `sheets[].range`, so the absence was a missing READER in
   `textUnitsFor`, and the assertion pinned the gap D-672 exists to close. What
   it protected stays protected: a cell is still not a unit — the unit is the
   SHEET, carrying the sheet's text, addressed by the producer's own used range
   (never re-derived here: the fixture's own cells give A1:B2 and A1:B1). */
t("B3: the WORKBOOK emits ONE `sheet-range` unit per SHEET, keyed by the sheet's used range, "
+ "in the producer's sheet order — a cell is not a passage, a sheet is (D-672, §4.1)",
  [bookDoc.text_units?.length,
   bookDoc.text_units?.map((u) => u.extent),
   bookDoc.text_units?.map((u) => u.seq),
   bookDoc.reading?.read_from_text],
  [SHEET_NAMES.length,
   [{ kind: "sheet-range", sheet: "Summary", range: "A1:B2" },
    { kind: "sheet-range", sheet: "Detail", range: "A1:B1" }],
   [0, 1], true]);
t("B3b: and each sheet unit carries that SHEET's text and only that sheet's — every cell of it, "
+ "none of the other sheet's",
  [bookDoc.text_units?.[0]?.text.includes("Police") && bookDoc.text_units?.[0]?.text.includes("FY26 Adopted"),
   bookDoc.text_units?.[0]?.text.includes("General Purpose Fund"),
   bookDoc.text_units?.[1]?.text.includes("General Purpose Fund"),
   bookDoc.text_units?.[1]?.text.includes("Police")],
  [true, false, true, false]);

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
  /* D-672: the workbook's units join the sweep. `canonicalRange` upper-cases
     and strips `$`, so a range the producer spelled otherwise would show here as
     a canonical form differing from what the producer wrote. */
  [...(docDoc.text_units || []), ...(deckDoc.text_units || []), ...(bookDoc.text_units || [])]
    .filter((u) => canonicalExtent(u.extent) !== canonicalExtent({ ...u.extent })
                   || (u.extent.kind === "sheet-range"
                       && JSON.parse(canonicalExtent(u.extent)).range !== u.extent.range)).length, 0);
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
/* CORRECTED BY D-672: this read "and the workbook contributes none", which
   pinned the missing unit. The workbook now contributes one row per sheet. */
t("C1: the units are PERSISTED — one row per paragraph, one per slide and one per sheet",
  st1.textUnits, PARAS.length + SLIDE_TITLES.length + SHEET_NAMES.length);
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
   read as a document with no text.
   MOVED BY D-672 FROM THE WORKBOOK TO HTML, and the property is unchanged. The
   workbook WAS this case; it now has a unit, so asserting NONE of it would pin
   the gap. HTML still has no `dom` producer (§4.1), and no fixture here makes
   `op=acquire` read an HTML page's text into a reading, so the subject is the
   workbook's own acquired document with its container relabelled `html` and its
   units withheld — the writer's REAL input, a provenance document a caller can
   author, carrying a container this build has no unit arm for. */
const axBook = await axisOf(bookDoc.capture.sha256);
t("C3c: and the WORKBOOK now reads FULLY indexed — both sheets written, nothing dropped (D-672)",
  [axBook.indexed, axBook.determined, axBook.extraction?.state], [FULL, true, "PRESENT"]);
/* D-672's ACCEPTANCE (X1) is asked HERE, while the workbook is promoted —
   section E purges the store, so a search after it would find nothing for a
   reason that has nothing to do with the index. See section X's header. */
const passageRows = async (term) => get("meaningrows",
  `rows=passage&q=${encodeURIComponent(`passage:${JSON.stringify(term)}`)}`);
{
  const hit = await passageRows("Fund 1010");
  const rowsOf = Array.isArray(hit?.rows) ? hit.rows : [];
  console.log(`  passage:"Fund 1010" -> ${rowsOf.length} row(s) `
            + `${JSON.stringify(rowsOf.map((r) => [r.extent_kind, r.ref]))}`);
  t("X1: a passage search over a captured WORKBOOK finds a cell's text in ONE unit labelled "
  + "sheet-range — the Detail sheet, by its range, in that workbook's capture",
    rowsOf.map((r) => [r.capture_sha, r.extent_kind, r.ref, JSON.parse(r.extent).sheet]),
    [[bookDoc.capture.sha256, "sheet-range", "Detail!A1:B1", "Detail"]]);
}
const htmlSha = sha("D-672: a page whose container has no unit arm");
await promote("INFO-2026-9310-noarm", { document: {
  ...bookDoc, text_units: undefined,
  capture: { ...bookDoc.capture, sha256: htmlSha },
  reading: { ...bookDoc.reading, text_container: "html" } } });
const axNoArm = await axisOf(htmlSha);
t("C3: a container with NO unit arm says NONE with a REASON — its text WAS extracted and this record "
+ "cannot address a passage of it. That is not an absence of text and the answer must not let it "
+ "read as one",
  [axNoArm.indexed, axNoArm.determined, axNoArm.extraction?.state], [NONE, true, "PRESENT"]);
t("C3b: and the reason NAMES the container rather than the category, so a member is told which "
+ "absence is true (CLAUDE.md's sparse rule, made mechanical where absence is read)",
  typeof axNoArm.why === "string" && axNoArm.why.includes("html"), true);

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
 *  G · REC-111 — THE UNIT-COUNT BOUND, AND THE TWO ACCIDENTS IT REPLACES
 * ========================================================================= */
console.log("\n--- G · the unit bound: bytes do not bound the unit count (REC-111, §4.3) ---");

/* WHY THIS SECTION EXISTS, AND THE FIRST THING IT FOUND WAS THAT ITS OWN PREMISE
   WAS HALF FALSE. §4.3's third correction says the index costs ROWS and FTS
   ENTRIES while every bound it sets counts BYTES, and REC-111 was rowed to close
   that with a unit budget. Measuring first (M-35) found the unit count already
   bounded on BOTH routes that can reach `#writeCaptureText` — at 4,064 by the
   acquire wire's per-unit envelope charge, and at 13,720 by `INLINE_MAX` on a
   caller-authored `data/provenance.json` — and both inside the CPU window.

   SO THE DEFECT WAS NOT AN UNBOUNDED COUNT. IT WAS THAT BOTH BOUNDS WERE
   ACCIDENTS: one falls out of a JSON envelope ESTIMATE, the other out of an
   inline-file limit that knows nothing about indexing, neither is written down,
   and either moves the day an unrelated constant moves. §4.3 asked for both
   bounds "stated in one place" so "neither hides the other"; the byte bound was
   hiding the unit bound. G1 is therefore the load-bearing assertion of this
   section and it is a PIN, not a probe: it reads the operands out of the product
   and fails if any of the three drifts. */
{
  const num = (src, name) => {
    const m = new RegExp(`const ${name} = ([^;]+);`).exec(src);
    /* EVALUATED FROM THE PRODUCT'S OWN EXPRESSION, never retyped as a literal —
       `512 * 1024` and `524288` are the same bound and a hand copy of either
       agrees for free (WORKER.md's costs-nothing rule, measured five times). */
    return m ? Function(`"use strict";return (${m[1]})`)() : null;
  };
  const wireBudget   = num(INDEX_SRC, "ACQUIRE_TEXT_UNITS_BUDGET");
  const wireEnvelope = num(INDEX_SRC, "ACQUIRE_TEXT_UNIT_ENVELOPE");
  const storeUnits   = num(STORE_SRC, "CAPTURE_TEXT_CAPTURE_UNIT_BOUND");
  const storeBytes   = num(STORE_SRC, "CAPTURE_TEXT_CAPTURE_BOUND");
  /* FLOORED BEFORE ANYTHING IS DIVIDED BY IT. A regex that stopped matching
     would give `null`, and `floor(null / 1)` is 0 — which is <= any bound and
     would pass G1 silently over a constant this suite never found. */
  t("G0: all four constants were READ OUT OF THE PRODUCT, not assumed — a miss here would score "
  + "the pin over a number nothing in the tree carries",
    [typeof wireBudget, typeof wireEnvelope, typeof storeUnits, typeof storeBytes,
     wireBudget > 0, wireEnvelope > 0, storeUnits > 0, storeBytes > 0],
    ["number", "number", "number", "number", true, true, true, true]);
  /* The smallest chargeable unit is ONE text byte plus the envelope: `arm()`
     never emits a unit with empty text, which is what makes this a ceiling and
     not an estimate. */
  const ceiling = Math.floor(wireBudget / (1 + wireEnvelope));
  t("G1: THE WIRE CAN NEVER SEND MORE UNITS THAN THE STORE WILL KEEP. The acquire wire's unit "
  + "ceiling is DERIVED here from its own two constants rather than declared in the product, "
  + "because a constant nothing reads is a mechanism believed on its existence. If the envelope "
  + "estimate is ever revised — §4.1 names `sheet-range` as a coming arm with a larger extent — "
  + "this fails rather than silently changing what a member's promote may COST",
    [ceiling, storeUnits, ceiling <= storeUnits], [4064, 4096, true]);
  t("G2: and the unit bound is the figure M-20's ladder gives, not a judgement — M-20's own "
  + "sentence is that the largest promote that fits is ~3,900 units, and 4,096 is that at the "
  + "resolution the byte budget already uses (524,288 / 128). At 4,096 units with the byte bound "
  + "ALSO at its maximum, M-20's fit predicts 141.7 ms against a 257 ms window",
    [storeUnits, storeBytes,
     Math.round((0.0076 * storeUnits + 0.054 * (storeBytes / 1024)) * 10) / 10],
    [4096, 2097152, 141.7]);
  t("G3: the constants sit BESIDE each other and the loop tests them in the SAME BRANCH — a "
  + "reader asking what stops a promote finds one place, not two. §4.3's `neither hides the "
  + "other` is a placement requirement and this is the assertion that holds it",
    [/const CAPTURE_TEXT_CAPTURE_BOUND = [^\n]+\nconst CAPTURE_TEXT_CAPTURE_UNIT_BOUND =/.test(STORE_SRC),
     /written >= CAPTURE_TEXT_CAPTURE_UNIT_BOUND\s*\n\s*\|\| bytes \+ size > CAPTURE_TEXT_CAPTURE_BOUND/
       .test(STORE_SRC)],
    [true, true]);

  /* ---- THE BOUND DRIVEN THROUGH THE OP, on the route that can actually reach
     it: a caller-authored provenance document of many tiny units. This is the
     case §4.3 named ("a spreadsheet of one-character cells is small in bytes and
     enormous in units") and the case nothing bounded. */
  const OVER = storeUnits + 504;                      /* 4,600 — over, and not by one */
  const shOver = sha("a capture over the per-capture UNIT bound");
  const doc = {
    file: "snapshots/many.docx", locator: "https://www.oaklandca.gov/many.docx", retrieved: NOW,
    capture: { sha256: shOver, encoding: "binary", bytes: 1 << 20 },
    reading: { content_type: "meeting_packet", reader_version: 1, read_from_text: true,
               found: false, entities: [], facts: {}, at: NOW,
               text_source: [{ step: "layer", tier: 1, container: "docx" }],
               text_tier: 1, text_container: "docx", page_count: 1, container_extent: null,
               basis: "a synthetic reading of a container with many tiny units" },
    text_units: Array.from({ length: OVER }, (_, i) => ({
      extent: { kind: "doc-para", para: i, run: null }, seq: i, text: "a" })),
  };
  const provBytes = JSON.stringify({ documents: [doc] }).length;
  t("G4: THE FIXTURE IS A DOCUMENT THE PRODUCT'S OWN PROMOTE PATH ACCEPTS, which is what makes "
  + "this a bound being driven rather than a branch being poked. Its provenance file is UNDER "
  + "`INLINE_MAX` (1,048,576 B), so nothing upstream refuses it — the whole finding is that this "
  + "document is small in BYTES and enormous in UNITS",
    [provBytes < 1048576, doc.text_units.length], [true, OVER]);
  const stBefore = await get("stats", "", "adm-rec91");
  await promote("INFO-2026-9311-manyunits", { document: doc });
  const stAfter = await get("stats", "", "adm-rec91");
  t("G5: exactly the unit bound is indexed and the rest are NOT — the index is trimmed on UNIT "
  + "COUNT, which is the thing no bound in §4.3 could do before this item",
    stAfter.textUnits - stBefore.textUnits, storeUnits);
  t("G5b: AND THE PROMOTE WAS NOT REFUSED. A bound is a refusal, and a bound that made the record "
  + "unable to FILE a document would be the worst direction available — §4.3 shipped exactly that "
  + "mistake once and the correction is the reason this arm exists",
    HEAD.has("INFO-2026-9311-manyunits"), true);
  const axOver = await axisOf(shOver);
  t("G6: the capture reads PARTIAL and the sentence NAMES THE UNIT BOUND AND ITS FIGURE — a "
  + "`partial` that named only bytes is a failure a reader cannot act on, because *too big* and "
  + "*too many pieces* want different answers from a member and only the first could be said "
  + "before now",
    [axOver.indexed, axOver.determined,
     /UNIT bound/.test(String(axOver.index?.bound)), /4096 units/.test(String(axOver.index?.bound)),
     /ROWS, not only bytes/.test(String(axOver.index?.bound))],
    [PARTIAL, true, true, true, true]);
  /* ASSERTED AS THE WHOLE SENTENCE AND NOT AS TWO BOOLEANS, because this is the
     assertion the negative control reads. The row's control demands that
     removing the bound produce a failure naming the UNIT COUNT **and** the BYTE
     COUNT — "a failure naming one is a failure a reader cannot act on" — and a
     regex pair fails with `[false, false]`, which names neither. Compared whole,
     the failure line PRINTS the record's own sentence with both numbers in it. */
  /* D-724 CORRECTED THIS ASSERTION'S TITLE AND ITS EXPECTED SENTENCE. The title said a partial index
     "must be a PREFIX", which was never true of the product: both budget loops go ON past a unit over
     the bound and index a later one that fits (M-184, Z5), and BOB #36 ruled 2026-09-25 11:20Z that
     this is right, with the skipped units NAMED. What makes the subset one a reader can reason about
     is the naming, so the sentence now also says how many skipped units are named on the read. */
  t("G6b: and the detail carries BOTH counts — how many of how many units, and how many bytes, in "
  + "reading order — and says the skipped units are NAMED on the read. A partial index is every "
  + "unit that fit, in reading order, with gaps, and a gap a reader cannot name is the arbitrary "
  + "subset this sentence exists to refuse",
    String(axOver.index?.detail),
    `${storeUnits} of ${OVER} unit(s) indexed in reading order, ${storeUnits} B; `
    + `${OVER - storeUnits} unit(s) past the bound are NOT indexed `
    + `(${OVER - storeUnits} named on op=contentaxis's index.skipped)`);
  /* D-724 — THE STORE'S LOOP NAMES WHAT IT SKIPPED. Under the unit bound every later unit is skipped,
     so the gap is ONE run, from the (bound+1)th paragraph to the last, and it is stated in the
     record's words. */
  t("G6c: the store's own loop NAMES the units it skipped — one run, paragraph 4096 through 4599, "
  + "stated `not indexed: over the bound` (moves: a silent gap)",
    (axOver.index?.skipped || []).map((k) => [k.says, k.from, k.to, k.units, k.first.seq, k.last.seq,
                                               k.first.extent?.kind]),
    [["not indexed: over the bound", describeExtent({ kind: "doc-para", para: storeUnits, run: null }),
      describeExtent({ kind: "doc-para", para: OVER - 1, run: null }), OVER - storeUnits,
      storeUnits, OVER - 1, "doc-para"]]);

  /* ---- THE OFF-BY-ONE, IN THE DIRECTION THAT OVER-REPORTS. A capture at EXACTLY
     the bound is whole, and reporting it `partial` would make a member re-extract
     a document the record already holds entire — the over-strictness direction of
     this very bound, and the one `>=` versus `>` decides. */
  const shExact = sha("a capture at exactly the per-capture UNIT bound");
  await promote("INFO-2026-9311-exact", { document: {
    ...doc, capture: { ...doc.capture, sha256: shExact },
    text_units: doc.text_units.slice(0, storeUnits) } });
  const axExact = await axisOf(shExact);
  t("G7: a capture of EXACTLY the bound is FULL, not partial. `>=` is tested against `written` — "
  + "the count already in the table — so the unit under consideration is the (bound + 1)th; "
  + "reading this `partial` would tell a member to re-extract a document the record holds whole",
    [axExact.indexed, axExact.determined, /unit\(s\) indexed,/.test(String(axExact.index?.detail))],
    [FULL, true, true]);
  t("G7b: and a capture of exactly the bound NAMES NO skipped unit — an empty list, not an absent key",
    axExact.index?.skipped, []);
}

/* ---- THE ARM THAT DECIDES THIS ITEM IS SAFE TO SHIP, and it is the
   OVER-STRICTNESS one rather than the overflow one. §4.3's own bound was not a
   limit that would merely have been too tight — LEFT ALONE IT WAS A REGRESSION,
   and M-20's census holds two real documents that promote today and would have
   stopped. So both of them are driven HERE, BY NAME and at their measured sizes,
   and must come through exactly as they do without this item. */
{
  const cases = [
    { name: "the census's worst PDF",  kind: "pdf-page", units: 1181,  bytes: 1354686,
      id: "INFO-2026-9311-worstpdf" },
    { name: "the census's worst docx", kind: "doc-para", units: 20571, bytes: 1187253,
      id: "INFO-2026-9311-worstdocx" },
  ];
  for (const c of cases) {
    /* THE DOCUMENT IS BUILT TO M-20's MEASURED SHAPE — its unit count AND its
       total text bytes — because those two numbers together are what decides
       whether either bound bites. A fixture with the right bytes and the wrong
       unit count would be a fixture standing in for a different document, which
       is the exact error §4.3 made when it reasoned about bytes alone. */
    const per = Math.floor(c.bytes / c.units);
    const all = Array.from({ length: c.units }, (_, i) => ({
      extent: { kind: c.kind,
                ...(c.kind === "pdf-page" ? { page: i, rect: null } : { para: i, run: null }) },
      seq: i, text: "z".repeat(per) }));
    /* THE WIRE'S BUDGET APPLIED BY HAND, exactly as D4 does and for the same
       reason: this document is authored rather than acquired, so it must spend
       what a real capture of that size spends or it is not standing in for one. */
    let budget = 512 * 1024, kept = [], dropped = 0;
    for (const u of all) {
      const size = Buffer.byteLength(u.text, "utf8") + 128;
      if (size > budget) { dropped++; continue; }
      budget -= size; kept.push(u);
    }
    const shM20 = sha(`M-20 ${c.name}`);
    const container = c.kind === "pdf-page" ? "pdf" : "docx";
    const stBefore = await get("stats", "", "adm-rec91");
    await promote(c.id, { document: {
      file: "snapshots/m20.bin", locator: `https://www.oaklandca.gov/${c.id}`, retrieved: NOW,
      capture: { sha256: shM20, encoding: "binary", bytes: c.bytes },
      reading: { content_type: "meeting_packet", reader_version: 1, read_from_text: true,
                 found: false, entities: [], facts: {}, at: NOW,
                 text_source: [{ step: "layer", tier: 1, container }],
                 text_tier: 1, text_container: container,
                 page_count: kept.length, container_extent: null, basis: "M-20's census, by name" },
      text_units: kept, text_units_over_bound: dropped } });
    const stAfter = await get("stats", "", "adm-rec91");
    t(`G8 (${c.name}): IT STILL PROMOTES, and the STORE indexed every unit the wire offered — the `
    + `unit bound did not bite. ${c.units} units at ${c.bytes} B is a document the record accepts `
    + `TODAY, and a bound that stopped it would take capability away silently`,
      [HEAD.has(c.id), stAfter.textUnits - stBefore.textUnits, kept.length <= 4096],
      [true, kept.length, true]);
    const axM20 = await axisOf(shM20);
    t(`G8b (${c.name}): and its state is decided by the WIRE's byte budget exactly as it was `
    + `before this item — the sentence does NOT name the unit bound, because the unit bound is `
    + `not what stopped it. Naming a cause that did not fire is the record claiming to know more `
    + `than it does`,
      [axM20.indexed, /UNIT bound/.test(String(axM20.index?.bound))],
      [dropped > 0 ? PARTIAL : FULL, false]);
  }
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

/* ========================================================================= *
 *  W · D-531 — A UNIT WITH NO GLYPH IS NEITHER EMITTED NOR INDEXED
 * ========================================================================= */
console.log("\n--- W · D-531: a whitespace-only unit is not content, at BOTH emission sites ---");

/* THE RULE IS SPELLED HERE, NOT IMPORTED: a suite that shares its subject's
   helper has stopped being able to disagree with it (`textchain.mjs`'s own note
   on `glyphCount`). Non-whitespace code points, D-501's unit. */
const glyphsOf = (x) => [...x].filter((ch) => !/\s/u.test(ch)).length;
t("W0: the fixture holds what it claims — two paragraphs with characters and NO glyph, and three "
+ "with at least one; a fixture without blank units would make every arm below pass for free",
  [WS_PARAS.filter((x) => x.length > 0 && glyphsOf(x) === 0).length,
   WS_PARAS.map((x, i) => (glyphsOf(x) > 0 ? i : -1)).filter((i) => i >= 0)],
  [2, WS_KEPT]);

/* SITE 1, `index.mjs`'s `arm` — driven through `op=acquire` on a real DOCX. */
const wsDoc = (await acquire("/blank-paras.docx")).document;
t("W1: ACQUIRE emits no unit for a whitespace-only paragraph — the two blank paragraphs are absent "
+ "and the producer's own para index of the survivors is kept, not renumbered (`index.mjs`'s `arm`)",
  [wsDoc?.profile?.format?.format, wsDoc?.text_units?.map((u) => u.extent.para),
   wsDoc?.text_units?.map((u) => u.seq)],
  ["docx", WS_KEPT, WS_KEPT]);
t("W1b: THE OVER-STRICTNESS HALF — a one-glyph paragraph is still a unit, and a paragraph with "
+ "whitespace around its words is carried VERBATIM: the rule is \"no glyph\", never \"trim\"",
  wsDoc?.text_units?.map((u) => u.text), WS_KEPT.map((i) => WS_PARAS[i]));

/* SITE 2, `store.mjs`'s `#writeCaptureText` — driven through `op=promote` with an
   AUTHORED provenance document, because that is the writer's real input and a
   caller can put a blank unit there whatever acquire does. */
{
  const before = await get("stats", "", "adm-rec91");
  const sh = sha("D-531: a capture offering one real page and two blank ones");
  const pages = ["the layer read this page as a quorum call", "  \n\t  ", "\u3000\u00a0"];
  await promote("INFO-2026-9310-blankpages", { document: {
    ...pdfDocOf(pages, "layer"), capture: { sha256: sh, encoding: "binary", bytes: 4096 } } });
  const after = await get("stats", "", "adm-rec91");
  const ax = await axisOf(sh);
  t("W2: PROMOTE indexes only the page with a glyph — two whitespace-only units offered in the "
  + "authored provenance are NOT written, and the capture reads full over the ONE real unit",
    [after.textUnits - before.textUnits, after.textIndexOk, ax.indexed], [1, true, FULL]);
}
{
  const before = await get("stats", "", "adm-rec91");
  const sh = sha("D-531: a capture every one of whose units is blank");
  await promote("INFO-2026-9310-allblank", { document: {
    ...pdfDocOf([" ", "\n\n", "\t\u2003"], "layer"),
    capture: { sha256: sh, encoding: "binary", bytes: 4096 } } });
  const after = await get("stats", "", "adm-rec91");
  const ax = await axisOf(sh);
  t("W3: a capture whose EVERY unit is blank indexes nothing and does NOT read full — the record "
  + "saying it holds a searchable passage of a document where it holds only whitespace is the "
  + "claim-more-than-it-holds class CLAUDE.md §2 ranks above a missing feature",
    [after.textUnits - before.textUnits, ax.indexed], [0, NONE]);
}

/* ========================================================================= *
 *  X · D-672 — A WORKBOOK'S TEXT IS FINDABLE AT CONTENT GRAIN
 * ========================================================================= */
/* THE ROW'S ACCEPTANCE, DRIVEN THROUGH THE OP A MEMBER CALLS. B3 shows the wire
   carries the units and C1 that the store writes them; neither shows a caller
   can FIND one. `op=meaningrows&rows=passage` is REC-92's read, and a cell's
   words coming back in exactly one row, labelled `sheet-range` and addressed by
   the sheet's range, is the whole claim — "workbook text unsearchable" moved.
   The term ("Fund 1010") occurs in ONE cell of ONE sheet of the fixture and in no
   other document this suite promotes, so one row is the fixture's ground truth,
   not a count the code produced for itself. (The first choice, "General Purpose
   Fund", came back as TWO rows — the deck's second slide is titled GENERAL
   PURPOSE FUND OUTLOOK — which was the fixture telling the truth, not the arm.)
   X1 is asked in section C, while the workbook is promoted; section E purges. */
console.log("\n--- X · D-672: a workbook's sheets are indexed units, and a cell's text is found in one ---");
{
  const odsDoc = (await acquire("/levies.ods")).document;
  t("X2: an .ods workbook — a second producer of `sheets[]` — emits ONE `sheet-range` unit for its "
  + "one sheet, recognised by SHAPE and not by the container's name",
    [odsDoc?.profile?.format?.format, odsDoc?.text_units?.length,
     odsDoc?.text_units?.[0]?.extent, odsDoc?.text_units?.[0]?.text.includes(ONLY_IN_ODS)],
    ["ods", 1, { kind: "sheet-range", sheet: "Levies", range: "A1:B3" }, true]);
  await promote("INFO-2026-9310-ods", { document: odsDoc });
  const ax = await axisOf(odsDoc.capture.sha256);
  const hit = await passageRows(ONLY_IN_ODS);
  t("X2b: and it is PROMOTED, reads FULLY indexed, and its cell's text is found through `passage:` "
  + "in that one unit",
    [ax.indexed, (hit?.rows || []).map((r) => [r.capture_sha, r.extent_kind, r.ref])],
    [FULL, [[odsDoc.capture.sha256, "sheet-range", "Levies!A1:B3"]]]);
}
/* ========================================================================= *
 *  Y · D-684 — A CSV READ AS TEXT AT INTAKE STILL REACHES ITS FORMAT ENTRY
 * ========================================================================= */
/* THE ROW'S ACCEPTANCE, THROUGH THE OPS A CALLER USES. Until D-684 a `text/csv` body under
   PROFILE_TEXT_MAX took the content-type reader's branch of `op=acquire` and never the FORMAT wire's,
   so it carried no `text_units` and no `text_container`: promoted, its cells were unsearchable and the
   index observation said the record does not hold which container it is. Y1 is the wire, Y2 the
   reading kept as it was (the profile text is still what the reader read and digested), Y3 the
   promote and the search. Y4 is the SCOPE arm: an HTML page is read as text at intake too, and its
   entry declares no `text()`, so it must be untouched — no units, no container claimed. */
console.log("\n--- Y · D-684: a text/csv capture read as profile text is still itemised by its format entry ---");
{
  const csvAcq = await acquire("/levies.csv");
  const csvDoc = csvAcq.document;
  t("Y1: a `text/csv` capture read as text at intake carries ONE `sheet-range` unit for its one sheet, "
  + "and its reading NAMES ITS CONTAINER",
    [csvDoc?.profile?.format?.format, csvDoc?.text_units?.length, csvDoc?.text_units?.[0]?.extent,
     csvDoc?.text_units?.[0]?.text.includes(ONLY_IN_CSV), csvDoc?.reading?.text_container],
    ["csv", 1, { kind: "sheet-range", sheet: "csv", range: "A1:B3" }, true, "csv"]);
  t("Y2: and the READING IS THE PROFILE READER'S, as before — read from the intake text, no chain or "
  + "tier claimed for it, and its provenance digests the CSV body itself, not the format entry's stream",
    [csvDoc?.reading?.read_from_text, csvDoc?.reading?.content_type,
     "text_source" in (csvDoc?.reading || {}), "text_tier" in (csvDoc?.reading || {}),
     csvDoc?.reading?.provenance?.text_sha256],
    [true, "generic", false, false, sha(CSV_BODY)]);
  await promote("INFO-2026-9310-csv", { document: csvDoc });
  const ax = await axisOf(csvDoc.capture.sha256);
  const hit = await passageRows(ONLY_IN_CSV);
  t("Y3: PROMOTED, it reads FULLY indexed and a cell's text is FOUND through `passage:` in that one "
  + "sheet-range unit (moves: text_units absent for CSV)",
    [ax.indexed, (hit?.rows || []).map((r) => [r.capture_sha, r.extent_kind, r.ref])],
    [FULL, [[csvDoc.capture.sha256, "sheet-range", "csv!A1:B3"]]]);
  const htmlDoc = (await acquire("/agenda.html")).document;
  t("Y4: SCOPE — an HTML page, also read as text at intake, is UNMOVED: its entry declares no `text()`, "
  + "so no unit is emitted and no container is claimed for its reading",
    [htmlDoc?.profile?.format?.format, "text_units" in (htmlDoc || {}),
     "text_container" in (htmlDoc?.reading || {})],
    ["html", false, false]);
}

/* ========================================================================= *
 *  Z · D-685 — A UNIT OVER THE WIRE'S BUDGET IS CARRIED AS ITS CAPPED PREFIX
 * ========================================================================= */
/* THE ROW'S ACCEPTANCE, THROUGH `op=acquire`, `op=promote` and `passage:`. Until D-685 the wire charged a
   unit's WHOLE text against its budget and DROPPED a unit that did not fit — though the store would have
   kept only its first 131,072 characters — so one sheet over 512 KiB left its workbook with NO searchable
   unit at all. The wire now cuts a unit to the store's per-unit cap, charges what it carries, and marks the
   cut `truncated: true`; the store honours the flag, because the prefix it receives is no longer over its
   own cap and its own comparison would call the unit whole. Z5 is what is STILL dropped: a unit whose
   capped prefix does not fit what remains. The literal 131,072 is `CAPTURE_TEXT_UNIT_CAP`, written here
   and not read out of the source, so a moved cap moves this suite. */
console.log("\n--- Z · D-685: a unit over the acquire wire's budget is carried as its capped prefix, marked truncated ---");
{
  const CAP = 131072;
  const hugeDoc = (await acquire("/huge-sheet.xlsx")).document;
  const hu = hugeDoc?.text_units || [];
  console.log(`  corpus: huge-sheet.xlsx — 1 sheet of ${600 * (ROW_W + 1) - 1} B of text; rest-sheet.xlsx — 2 sheets `
            + `of ${300 * (ROW_W + 1) - 1} B; four-sheets.xlsx — 4 sheets of ${200 * (ROW_W + 1) - 1} B and 1 of `
            + `${FIFTH_TERM.length} B. Wire carried: ${JSON.stringify([hu.map((u) => [u.extent.sheet, u.text.length, u.truncated === true]),
               hugeDoc?.text_units_over_bound ?? 0])}`);
  t("Z1: ONE sheet over the whole 524,288 B budget is CARRIED as its first 131,072 characters, marked "
  + "`truncated: true`, and nothing is counted dropped (moves: a unit silently dropped)",
    [hugeDoc?.profile?.format?.format, hu.length, hu[0]?.extent, hu[0]?.text.length, hu[0]?.truncated,
     hu[0]?.text.startsWith(HUGE_OPEN), hugeDoc?.text_units_over_bound ?? 0],
    ["xlsx", 1, { kind: "sheet-range", sheet: "Ledger", range: "A1:A600" }, CAP, true, true, 0]);
  await promote("INFO-2026-9310-huge", { document: hugeDoc });
  const ax = await axisOf(hugeDoc.capture.sha256);
  const open = (await passageRows(HUGE_OPEN))?.rows || [];
  const close = (await passageRows(HUGE_CLOSE))?.rows || [];
  console.log(`  passage:"${HUGE_OPEN}" -> ${JSON.stringify(open.map((r) => [r.ref, r.truncated]))}; `
            + `passage:"${HUGE_CLOSE}" -> ${close.length} row(s)`);
  t("Z2: PROMOTED, search FINDS the prefix — the sheet's first row, in its one unit, and the row SAYS it "
  + "is truncated (the store honours the wire's flag: the text it receives is exactly at its cap, so its "
  + "own comparison would have called it whole)",
    open.map((r) => [r.capture_sha, r.extent_kind, r.ref, r.truncated]),
    [[hugeDoc.capture.sha256, "sheet-range", "Ledger!A1:A600", 1]]);
  t("Z3: and search does NOT find the sheet's last row, which is past the cap — the prefix is a prefix, and "
  + "the capture reads indexed with every offered unit written",
    [close.length, ax.indexed], [0, FULL]);
  t("Z3b: D-724 — a capture UNDER the bound names NO skipped unit: the wire carries no key list and the "
  + "read serves an empty one (a CUT unit is not a SKIPPED one)",
    ["text_units_skipped" in hugeDoc, ax.index?.skipped], [false, []]);

  const restDoc = (await acquire("/rest-sheet.xlsx")).document;
  const ru = restDoc?.text_units || [];
  t("Z4: a sheet over what REMAINS of the budget (the second of two 300,299 B sheets) is carried as its "
  + "capped prefix too, and both are marked",
    [ru.map((u) => [u.extent.sheet, u.text.length, u.truncated]), ru[1]?.text.startsWith(REST_OPEN),
     restDoc?.text_units_over_bound ?? 0],
    [[["First", CAP, true], ["Appendix", CAP, true]], true, 0]);
  await promote("INFO-2026-9310-rest", { document: restDoc });
  t("Z4b: and the second sheet's first row is FOUND through `passage:`, marked truncated",
    ((await passageRows(REST_OPEN))?.rows || []).map((r) => [r.ref, r.truncated]),
    [["Appendix!A1:A300", 1]]);

  /* THE RESIDUE, STATED BY MEASUREMENT. A capped unit costs 131,072 + 128 = 131,200 B; three cost 393,600 and
     leave 130,688, which a fourth capped unit does not fit. So S4 is DROPPED, COUNTED, and the capture reads
     PARTIAL — and the small S5 after it still fits, because the loop skips a unit and goes on. */
  const fourDoc = (await acquire("/four-sheets.xlsx")).document;
  const fu = fourDoc?.text_units || [];
  t("Z5: WHAT IS STILL DROPPED — when even the capped prefixes exceed the budget the fourth 200,199 B sheet "
  + "does not fit the 130,688 B left and is dropped AND COUNTED; the small fifth still fits",
    [fu.map((u) => [u.extent.sheet, u.text.length, u.truncated === true]), fourDoc?.text_units_over_bound],
    [[["S1", CAP, true], ["S2", CAP, true], ["S3", CAP, true], ["S5", FIFTH_TERM.length, false]], 1]);
  await promote("INFO-2026-9310-four", { document: fourDoc });
  const ax4 = await axisOf(fourDoc.capture.sha256);
  ax4Truncated = ax4.index?.skipped_truncated; ax4Limit = ax4.index?.skipped_limit;   /* read at Z7b */
  t("Z5b: promoted, the capture reads PARTIAL, the dropped sheet's text is NOT found and the fifth's is",
    [ax4.indexed, ((await passageRows(FOURTH_OPEN))?.rows || []).length,
     ((await passageRows(FIFTH_TERM))?.rows || []).map((r) => [r.ref, r.truncated])],
    [PARTIAL, 0, [["S5!A1:A1", 0]]]);
  /* D-724 / BOB #36 2026-09-25 11:20Z, option (b) — THE SKIPPED SHEET IS NAMED, NOT ONLY COUNTED. The
     capture holds every unit that fit, in reading order, with a GAP at S4; a member whose search finds
     nothing in S4 must be able to learn S4 was NEVER INDEXED rather than that it holds no match. */
  const S4 = { kind: "sheet-range", sheet: "S4", range: "A1:A200" };
  t("Z5c: the wire NAMES the sheet it dropped — one run, S4 alone, at its producer position",
    fourDoc?.text_units_skipped, [{ first: S4, first_seq: 3, last: S4, last_seq: 3, units: 1 }]);
  t("Z5d: promoted, op=contentaxis reads S5 INDEXED and names S4 `not indexed: over the bound` "
  + "(moves: a silent gap — a search miss in S4 could not say S4 was never indexed)",
    [((await passageRows(FIFTH_TERM))?.rows || []).length,
     (ax4.index?.skipped || []).map((k) => [k.says, k.from, k.to, k.units, canonicalExtent(k.first.extent),
                                            k.first.seq])],
    [1, [["not indexed: over the bound", "S4!A1:A200", "S4!A1:A200", 1, canonicalExtent(S4), 3]]]);
  console.log(`  four-sheets.xlsx index detail: ${ax4.index?.detail}`);
  t("Z5e: and the observation's sentence says the one skipped unit is named on the read",
    / past the bound are NOT indexed \(1 named on op=contentaxis's index\.skipped\)(;|$)/.test(String(ax4.index?.detail)),
    true);
  /* THE GAPS ARE REWRITTEN WITH THE UNITS. The same capture re-promoted with S4 carried (as though a
     later wire fit it) must stop naming S4 — a gap left standing after the unit was indexed is the
     record claiming LESS than it holds, and it is the DELETE beside the units' own that prevents it. */
  await promote("INFO-2026-9310-four", { document: { ...fourDoc,
    text_units: [...fu.slice(0, 3), { extent: S4, seq: 3, text: FOURTH_OPEN }, ...fu.slice(3)],
    text_units_over_bound: undefined, text_units_skipped: undefined } });
  const ax4b = await axisOf(fourDoc.capture.sha256);
  t("Z5f: re-promoted with S4 carried, the capture reads whole and names NO skipped unit — the gaps are "
  + "rewritten with the units, never left standing",
    [ax4b.indexed, ax4b.index?.skipped, ((await passageRows(FOURTH_OPEN))?.rows || []).map((r) => r.ref)],
    [FULL, [], ["S4!A1:A200"]]);
  const s5 = fu.find((u) => u.extent.sheet === "S5");   /* by NAME: its position moves with what was dropped */
  /* OVER-STRICTNESS: a unit UNDER the cap is carried whole and carries NO flag — the wire marks only what
     it cut, so an ordinary document's units are unchanged byte for byte. */
  t("Z6: a unit under the cap is carried WHOLE and unmarked — the workbook of section B and the fifth sheet "
  + "carry no `truncated` key at all",
    [bookDoc.text_units?.some((u) => "truncated" in u), "truncated" in (s5 || {}), s5?.text === FIFTH_TERM],
    [false, false, true]);
}

/* D-724 — THE READ IS BOUNDED, AND A CUT LIST SAYS SO. `op=contentaxis` serves at most
   CAPTURE_TEXT_SKIPPED_RUNS_MAX (5,120: the unit bound plus 1,024) runs for one capture, reading one past the
   cap to know. Neither product route can produce that many (the store writes at most 4,097, the wire ~1,018),
   so the bite is driven with a caller-AUTHORED provenance document of 5,121 single-page runs — the one route
   that can carry them, and under `INLINE_MAX`. The literal 5,120 is written here, not read from the source. */
console.log("\n--- Z7 · D-724: the skipped-unit read is bounded and says when it is cut ---");
{
  const RUNS_MAX = 5120, N = RUNS_MAX + 1;
  const sh7 = sha("a capture authored with more skipped-unit runs than the read serves");
  const page = (n) => ({ kind: "pdf-page", page: n, rect: null });
  const doc7 = {
    file: "snapshots/runs.pdf", locator: "https://www.oaklandca.gov/runs.pdf", retrieved: NOW,
    capture: { sha256: sh7, encoding: "binary", bytes: 1 << 20 },
    reading: { content_type: "meeting_packet", reader_version: 1, read_from_text: true, found: false,
               entities: [], facts: {}, at: NOW, text_source: [{ step: "layer", tier: 1, container: "pdf" }],
               text_tier: 1, text_container: "pdf", page_count: 2 * N + 1, container_extent: null,
               basis: "a synthetic reading whose every other page was skipped over the bound" },
    text_units: [{ extent: page(0), seq: 0, text: "Measure QQ first page" }],
    text_units_over_bound: N,
    text_units_skipped: Array.from({ length: N }, (_, i) =>
      ({ first: page(2 * i + 1), first_seq: 2 * i + 1, last: page(2 * i + 1), last_seq: 2 * i + 1, units: 1 })),
  };
  const bytes7 = JSON.stringify({ documents: [doc7] }).length;
  t("Z7a: the fixture is under INLINE_MAX (the promote path accepts it) and carries one run more than the cap",
    [bytes7 < 1048576, doc7.text_units_skipped.length], [true, N]);
  await promote("INFO-2026-9310-runs", { document: doc7 });
  const ax7 = await axisOf(sh7);
  const sk = ax7.index?.skipped || [];
  t("Z7: THE BITE — the read serves exactly the cap, the FIRST runs in reading order, publishes the cap it "
  + "applied and says the list is cut (moves: an unbounded read, or a cut list read as whole)",
    [ax7.indexed, sk.length, sk[0]?.first.seq, sk[sk.length - 1]?.first.seq, ax7.index?.skipped_limit,
     ax7.index?.skipped_truncated],
    [PARTIAL, RUNS_MAX, 1, 2 * RUNS_MAX - 1, RUNS_MAX, true]);
  t("Z7b: and a list under the cap is WHOLE — the four-sheet workbook's one run reads not truncated",
    [ax4Truncated, ax4Limit], [false, RUNS_MAX]);
}

/* THE STORE'S HALF, READ OUT OF THE SOURCE. The writer never reads the kind, so
   admitting sheet-range is the container set and nothing else; `ods` has no
   fixture here (see below), so its membership is asserted where it lives. */
t("X3: the store's unit-arm set admits every `sheets[]` producer — xlsx, ods and csv — beside the "
+ "five it already held",
  ["xlsx", "ods", "csv", "pdf", "docx", "odt", "pptx", "odp"].every((c) =>
    new RegExp(`const CAPTURE_TEXT_UNIT_CONTAINERS = new Set\\(\\[[^\\]]*"${c}"`).test(STORE_SRC)), true);

/* WHAT THIS SUITE CANNOT SEE, NAMED RATHER THAN SCORED ZERO.
   - The `passage:` ARM AND `rows=passage` (§8's first, third and fifth controls):
     REC-92's, and not approximable here (X drives ONE read of it, D-672's
     acceptance, and claims nothing about the arm beyond that) — a bundle-returning arm, the REC-36
     withholding and "searching mints nothing" are all properties of a read that
     does not exist on this tree.
   - A SLIDE'S SPEAKER NOTES. `pptxText` emits them per slide and DEC-5 forbids
     merging them with slide text, and the only address that reaches a slide is
     `slide-shape`, whose shape-omitted form is now the slide itself. So the most
     candid text in a deck has no indexable unit. Reported as a DESIGN GAP.
   - A WORKBOOK'S NAMED UNITS (D-415's `rangeUnits`: defined names, table
     parts, named and database ranges). They are extents without text and are
     NOT indexed — §4.1 designs the SHEET as the unit and nothing about a
     sub-sheet rectangle's text (D-672 states it, does not build it).
   - AN `.ods` WORKBOOK end to end. The arm is recognised by the `sheets[]`
     SHAPE, driven here on `.xlsx` and `.csv`; `.ods` returns the same shape
     (`odf.mjs`) and `ods` is in the store's container set (asserted in X), but
     no `.ods` fixture reaches the wire in this suite.
   - A REAL PDF PRODUCER. The `pdf-page` arm is driven through `op=promote` with
     an authored provenance document, which is the writer's real input; what it
     does NOT exercise is `pdfstructure`'s own `text.pages[]` reaching the wire.
     The DOCX and PPTX arms do exercise that path end to end, so the wire's
     shape-recognition is measured — but on two of its three arms, not three. */
console.log(`\n  WHAT THIS SUITE CANNOT SEE: the \`passage:\` arm (REC-92), a slide's speaker notes `
          + `(no extent arm — DESIGN GAP), a workbook's named units (not designed), an .ods fixture, and the `
          + `PDF producer's own text reaching the wire (driven through op=promote instead).`);

reachedFoot = true;
} catch (e) {
  /* PRINTED, NEVER SWALLOWED. A throw inside the body goes through no assertion
     at all, and a `finally` that calls `process.exit` suppresses the stack — so
     the one thing a reader needs to act on would be the one thing not shown.
     M0-134: and COUNTED. The exit below already reads `reachedFoot`, so this suite was never green on a
     throw; the increment is here so the rule `hygiene.test.mjs` holds every finally-exit to — the catch
     counts a failure the exit reads — is one rule with no sentinel exception. */
  fail++;
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
