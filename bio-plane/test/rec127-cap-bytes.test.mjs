/* NEGATIVE CONTROL: the arms live in `test/nc-rec127.mjs`, re-run in one step with `node test/nc-rec127.mjs [arm]` from `bio-plane/`. Each arm edits ONE real source (`src/query.mjs`) ALONE, declares BEFORE it runs what MUST fail and what MUST NOT, and is restored from a uniquely-named pristine copy verified by sha256 AND by content (never `git checkout --`). THE LIAR, stated before what is checked: the cheapest green is to drop `cited_as = 'bytes'` rows from EVERY `content:` answer — `cap=undetermined` goes green because the images are gone, not because they are answered — so section 3 asserts the images are still reachable through every other question. (a) `baseline` — nothing armed, MUST be green. (b) `noexclude` — THE ROW'S DECLARED CONTROL: the exclusion removed (`cap:undetermined` back to bare `derivation_cap IS NULL`): the bytes rows reappear under `undetermined` and the undetermined arms MUST FAIL naming them, while the does-not-apply arm and section 3 hold. (c) `dropall` — THE LIAR ARMED: the arm's `table` becomes a view without bytes rows: section 0's corpus floor and section 3's reachability arms MUST FAIL while section 1's undetermined arms go green for free. Its method perturbs a second variable (REC-121 measured it): content-arm's structural pins on the table name fail too, so content-arm is not required green under this arm. (d) `nolabel` — `rowLabel` removed, so `derivation_cap` is projected bare: the label arm and the filter/label agreement arm MUST FAIL, every filter arm hold. (e) `preitem` — THE OVER-STRICTNESS ARM: `src/query.mjs` as at `2c4a5c11`; content-arm §11's 40-question digest (a fixture with no bytes row) MUST be IDENTICAL to this tree's, after `baseline2` shows two untouched runs agree. The harness also drives `rec121-chain-bytes.test.mjs`, whose §4 this item CORRECTED, and that assertion is declared to fail under `noexclude`. RUN 2026-09-18 by the REC-127 worker, EVERY ARM AS DECLARED, every restore byte-identical (`src/query.mjs` 160,693 B, sha256 f14329f4e3e8…): baseline content-arm 110/0 + this suite 23/0 + rec121 21/0 · baseline2 A/A digest IDENTICAL (c39f4e8adf1960c2…, the value REC-121 recorded) · noexclude this suite 20/3 (the three declared) + rec121 20/1 (§4, declared), digest IDENTICAL · dropall this suite 12/11, rec121 11/10, content-arm 102/8 (REC-121's measured second variable) · nolabel 21/2, rec121 21/0, digest IDENTICAL · preitem (`query.mjs` at 2c4a5c11) 17/6, content-arm 110/0, digest IDENTICAL. Sibling harnesses re-run on this tree: `nc-rec121.mjs` every arm AS DECLARED; `nc-rec90.mjs pred` AS DECLARED 5/5; `nc-rec104.mjs` every arm AS DECLARED. */

/* REC-127 — `content:cap=undetermined` MATCHED AN IMAGE CITED AS ITS OWN BYTES.
 *
 * The cap-axis twin of REC-121. FW-19 / IC-125 gave `content` a `cited_as`
 * column (`text` | `bytes`). A `bytes` row is an image cited AS ITSELF: no
 * transcription stands between the citation and its target, so there is no
 * derivation step for a cap to be the weakest of, and its `derivation_cap` is
 * NULL BY MEANING (EXTRACTION-BREADTH §3.1: that null "must not be read as
 * undetermined"). REC-121 corrected the chain axis and MEASURED this one in its
 * §4, leaving it because its row said no other answer may move.
 *
 * WHAT THIS SUITE MEASURES, all of it through `op=meaningrows` and `op=search`:
 *
 *   0. THE FIXTURE is armed: two TEXT rows whose cap is null for two different
 *      reasons (no chain; a `layer` chain with no capping step), a TEXT row
 *      capped `C` by OCR, and IMAGE rows cited as bytes — one of them on the
 *      OCR'd capture, so a document answers a letter AND does-not-apply.
 *   1. `content:cap=undetermined` returns ONLY the text rows, at both grains.
 *   2. The bytes rows answer `content:cap=does-not-apply` (IC-138), at both
 *      grains, and `rows=content` labels them `derivation_cap: does-not-apply`
 *      — so every row is in EXACTLY ONE of {a letter, undetermined, does not
 *      apply}. A text row's `derivation_cap` is the stored value, unchanged.
 *   3. THE LIAR'S GREEN IS REFUSED: the images are still reachable through
 *      every other `content:` question, and `op=content` still reads them.
 */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282 */
import "./sandbox.mjs";               /* D-186 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r127", MEMBER_TOKEN: "mem-r127", PROBE_TOKEN: "prb-r127",
              AI_TOKEN: "ai-r127", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r127") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r127") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const idsOf = async (q) => ((await get("search", `q=${encodeURIComponent(q)}&mode=ids`))?.ids ?? []).sort();
const rowsOf = async (q) => (await get("meaningrows", `rows=content&q=${encodeURIComponent(q)}`))?.rows ?? [];
const rowIds = async (q) => (await rowsOf(q)).map((r) => r.content_id).sort();

const NOW = "2026-09-18T00:00:00Z";
const LATER = "2026-09-18T01:00:00Z";

const memberSession = async (id) => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role: "admin",
                                        capabilities: ["contribute"] }, "adm-r127");
  const en = await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
const MINA = await memberSession("mina");

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
/* A document with ONE capture. `chain` undefined = never read (no text_source);
   `pageCount` is the reading's stored figure (CAP-9), which lets an image on a
   page be addressed on a capture that has no chain at all. REC-121's shape. */
const promoteDoc = async (id, { chain, pageCount }) => {
  const capSha = sha(`rec127-${id}-bytes`);
  const text = infoMd(id);
  const reading = { capture: { sha256: capSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
               entities: [], facts: {}, page_count: pageCount,
               ...(chain === undefined ? {} : { text_source: chain }) } };
  const prov = JSON.stringify({ documents: [reading] });
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260918T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [{ path: `snapshots/${id}.bin`, sha256: capSha, encoding: "binary", bytes: 10 }] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
};
const mint = async (bundleId, extent) => {
  const m = await post("contentmint", { bundleId, extent }, MINA);
  if (!m.ok) throw new Error(`mint ${bundleId}: ${JSON.stringify(m).slice(0, 500)}`);
  return m.content_id;
};
/* content-arm's own OCR chain: pixels then an OCR step that caps at `cap`. */
const ocrChain = (pages, cap) => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" },
    extent: { kind: "pages", pages } }];

/* ==================================================================== 0 */
console.log("\n--- 0. the fixture: text rows with a null cap, a capped text row, images cited as bytes ---");
/* DOC_TEXT — captured, never read: its text row has no chain and so no cap. */
const DOC_TEXT = "INFO-2026-9127-text";
await promoteDoc(DOC_TEXT, { chain: undefined, pageCount: 2 });
const TEXT_ROW = await mint(DOC_TEXT, { kind: "document" });
/* DOC_LAYER — a text layer: a chain with no capping step, so the cap is
   undetermined WITH a chain. It is what shows the cap exclusion is not the
   chain's in disguise. */
const DOC_LAYER = "INFO-2026-9127-layer";
await promoteDoc(DOC_LAYER, { chain: [{ step: "layer" }], pageCount: 2 });
const LAYER_ROW = await mint(DOC_LAYER, { kind: "document" });
/* DOC_IMG — the only row is an IMAGE cited as its own bytes. */
const DOC_IMG = "INFO-2026-9127-image";
await promoteDoc(DOC_IMG, { chain: undefined, pageCount: 2 });
const IMG_ROW = await mint(DOC_IMG, { kind: "image", page: 0, rect: [50, 600, 250, 700] });
/* DOC_OCR — an OCR'd capture capped at C, holding a capped text row AND a bytes
   image: the document answers `C` AND `does-not-apply`, and must NOT answer
   `undetermined`, which is what separates the arm's two grains. */
const DOC_OCR = "INFO-2026-9127-ocr";
await promoteDoc(DOC_OCR, { chain: ocrChain([0, 1, 2], "C"), pageCount: 3 });
const OCR_TEXT = await mint(DOC_OCR, { kind: "document" });
const OCR_IMG = await mint(DOC_OCR, { kind: "image", page: 1, rect: [10, 10, 90, 90] });

const ROWS = [TEXT_ROW, LAYER_ROW, IMG_ROW, OCR_TEXT, OCR_IMG];
const byId = Object.fromEntries((await rowsOf("has:content")).map((r) => [r.content_id, r]));
const ALL = Object.values(byId);
console.log(`  corpus: ${ALL.length} content rows over ${new Set(ALL.map((r) => r.bundle_id)).size} documents`);
const readRow = async (id) => get("content", `id=${encodeURIComponent(id)}`);
const stored = {};
for (const id of ROWS) {
  const r = await readRow(id);
  stored[id] = [r?.cited_as ?? null, r?.derivation_cap ?? null];
}
t("ARMED: five content rows over four documents, each read back through `op=content`",
  [ALL.length, Object.keys(byId).sort()], [5, [...ROWS].sort()]);
t("ARMED: the unread text row and the text-layer row are `text` with NO cap",
  [stored[TEXT_ROW], stored[LAYER_ROW]], [["text", null], ["text", null]]);
t("ARMED: the OCR'd text row is `text` capped at C",
  stored[OCR_TEXT], ["text", "C"]);
t("ARMED: both image rows are cited as `bytes` with NO cap — one on a capture capped at C",
  [stored[IMG_ROW], stored[OCR_IMG]], [["bytes", null], ["bytes", null]]);

/* ==================================================================== 1 */
console.log("\n--- 1. `content:cap=undetermined` answers ONLY the text rows ---");
/* At BUNDLE grain, and `rows=content` returns every content row of every
   document in that scope (CONTENT-SEARCH §4.2) — so the row-grain assertion
   holds exactly because neither document in scope holds an image. */
t("at BUNDLE grain, `content:cap=undetermined` names ONLY the documents holding a text row with no cap — "
+ "never a document whose null cap is an image cited as its own bytes",
  await idsOf("content:cap=undetermined"), [DOC_LAYER, DOC_TEXT].sort());
t("through `op=meaningrows&rows=content`, the answer is ONLY the two text rows",
  await rowIds("content:cap=undetermined"), [TEXT_ROW, LAYER_ROW].sort());

/* ==================================================================== 2 */
console.log("\n--- 2. the bytes rows answer under their OWN stated value: does not apply ---");
t("`content:cap=does-not-apply` names the documents holding an image cited as bytes",
  await idsOf("content:cap=does-not-apply"), [DOC_IMG, DOC_OCR].sort());
t("and through `rows=content` returns those documents' rows — both bytes rows among them",
  await rowIds("content:cap=does-not-apply"), [IMG_ROW, OCR_IMG, OCR_TEXT].sort());
t("case does not matter, as for every cap value (`case: upper`)",
  await idsOf("content:cap=Does-Not-Apply"), [DOC_IMG, DOC_OCR].sort());
t("`rows=content` LABELS each row's `derivation_cap`: a letter, NULL for undetermined, `does-not-apply` for bytes",
  ROWS.map((id) => byId[id]?.derivation_cap ?? null),
  [null, null, "does-not-apply", "C", "does-not-apply"]);
t("a TEXT row's `derivation_cap` in `rows=content` is its stored value, exactly — only a bytes row's moves",
  [TEXT_ROW, LAYER_ROW, OCR_TEXT].map((id) => byId[id]?.derivation_cap ?? null),
  [TEXT_ROW, LAYER_ROW, OCR_TEXT].map((id) => stored[id][1]));
t("the COLUMN SET of a `rows=content` row is unchanged — the label is in `derivation_cap`'s own slot, "
+ "not a new column",
  Object.keys(byId[OCR_TEXT] ?? {}), Object.keys(byId[IMG_ROW] ?? {}));
/* ONE DEFINITION, TWO CONSUMERS — the filter and the label must agree, document
   by document: a document is in `cap=X` iff it holds a row whose
   `derivation_cap` says X (NULL for undetermined). A bytes row counted in
   undetermined (the defect) or in nothing (the liar) fails BY NAME. */
const label = (r) => r.derivation_cap ?? "undetermined";
const docs = [...new Set(ALL.map((r) => r.bundle_id))].sort();
const disagree = [];
for (const v of ["undetermined", "does-not-apply", "C"]) {
  const arm = await idsOf(`content:cap=${v}`);
  for (const d of docs) {
    const holds = ALL.some((r) => r.bundle_id === d && label(r) === v);
    if (holds !== arm.includes(d)) disagree.push(`${v}: ${d} filter=${arm.includes(d)} label=${holds}`);
  }
}
t("the FILTER and the ROW LABEL agree for every document on every cap answer", disagree, []);
t("and every row carries exactly one of {a letter, undetermined, does-not-apply}",
  ALL.filter((r) => !["undetermined", "does-not-apply", "C"].includes(label(r))).map((r) => r.content_id), []);
t("the PUBLISHED grammar (`op=searchfields`) states the cap's third answer, so a member who does not "
+ "find an image under undetermined can learn where it went",
  ((await get("searchfields"))?.syntax ?? []).some((l) => /content:cap=does-not-apply/.test(l)), true);
t("a COMPARISON is untouched and never reaches a bytes row: `content:cap<=C` and `content:cap>=C`",
  [await idsOf("content:cap<=C"), await idsOf("content:cap>=C")], [[DOC_OCR], [DOC_OCR]]);
t("the CHAIN axis is untouched: `content:chain=undetermined` is the unread text row's document only",
  await idsOf("content:chain=undetermined"), [DOC_TEXT]);

/* ==================================================================== 3 */
console.log("\n--- 3. THE LIAR'S GREEN REFUSED: the images are still in every other answer ---");
t("`has:content` still names all four documents — the image-only one included",
  await idsOf("has:content"), [DOC_IMG, DOC_LAYER, DOC_OCR, DOC_TEXT].sort());
t("`rows=content` over `has:content` still carries both bytes rows",
  [IMG_ROW, OCR_IMG].map((id) => !!byId[id]), [true, true]);
t("`content:image` names both documents holding an image",
  await idsOf("content:image"), [DOC_IMG, DOC_OCR].sort());
t("`content:chain=does-not-apply` (REC-121) still names them",
  await idsOf("content:chain=does-not-apply"), [DOC_IMG, DOC_OCR].sort());
t("`content:member` and `content:uncited` still reach the image-only document",
  [(await idsOf("content:member")).includes(DOC_IMG), (await idsOf("content:uncited")).includes(DOC_IMG)],
  [true, true]);
t("`op=content` still reads the bytes row, and its transcription still says it does NOT APPLY",
  [(await readRow(IMG_ROW))?.transcription?.applies], [false]);

await mf.dispose();
console.log(`\nrec127-cap-bytes: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
