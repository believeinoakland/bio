/* NEGATIVE CONTROL: the arms live in `test/nc-rec121.mjs`, re-run in one step with `node test/nc-rec121.mjs [arm]` from `bio-plane/`. Each arm edits ONE real source (`src/query.mjs`) ALONE, declares BEFORE it runs what MUST fail and what MUST NOT, and is restored from a uniquely-named pristine copy verified by sha256 AND by content (never `git checkout --`). THE LIAR, stated before what is checked: the cheapest green is to drop `cited_as = 'bytes'` rows from EVERY `content:` answer — the mislabel disappears and so does the image, a record losing a citation to fix a filter — so section 3 asserts the image is still reachable through every other question. (a) `baseline` — nothing armed, MUST be green. (b) `noexclude` — THE ROW'S DECLARED CONTROL: the exclusion removed (`chain:undetermined` back to bare `chain IS NULL`): the bytes rows reappear under `undetermined` and the undetermined arms MUST FAIL naming them, while the does-not-apply arm and section 3 hold. (c) `dropall` — THE LIAR ARMED: the arm's `table` becomes a view without bytes rows, so every bytes row leaves every `content:` answer: section 0's corpus floor and section 3's reachability arms MUST FAIL while section 1's undetermined arms go green for free (the liar's green, which is why they cannot be the acceptance alone). ITS METHOD PERTURBS A SECOND VARIABLE, measured on the first run: content-arm's structural pins on the table name and its cited/uncited arms (whose `citedExists("content")` alias a bare subquery lacks) fail too, so content-arm is not required green under this arm. (d) `nolabel` — `chain_last` back to bare `m.chain_kind`: the label arm and the filter/label agreement arm MUST FAIL, every filter arm hold. (e) `preitem` — THE OVER-STRICTNESS ARM: `src/query.mjs` as at `e09f5be0`; content-arm §11's 40-question digest (a fixture with no bytes row) MUST be IDENTICAL to this tree's, after `baseline2` shows two untouched runs agree. RUN 2026-09-18 by the REC-121 worker, EVERY ARM AS DECLARED, every restore byte-identical (`src/query.mjs` 157,943 B, sha256 b813a8163746…): baseline content-arm 110/0 + this suite 21/0 · baseline2 A/A digest IDENTICAL (c39f4e8adf1960c2…) · noexclude 18/3 (the three declared), digest IDENTICAL · dropall 11/10 · nolabel 19/2, digest IDENTICAL · preitem 15/6, content-arm 110/0, digest IDENTICAL. Sibling harnesses whose anchors this item moved were re-run: `nc-rec104.mjs parseback` (re-anchored) AS DECLARED 26/2; `nc-rec90.mjs pred` AS DECLARED 5/5. The first run of `dropall` read NOT AS DECLARED because the harness required content-arm green under it — the second-variable finding above; the arm itself fired exactly as declared and the rule, not the arm, was corrected. */

/* REC-121 — `content:chain=undetermined` MATCHED AN IMAGE CITED AS ITS OWN BYTES.
 *
 * FW-19 / IC-125 gave `content` a `cited_as` column (`text` | `bytes`). A `bytes`
 * row is an image cited AS ITSELF: its chain and its cap are NULL BY MEANING —
 * the question "what transcription stands between this citation and its target"
 * has no answer to be undetermined about (EXTRACTION-BREADTH §3.1: that null
 * "must not be read as undetermined"). REC-104 kept `chain:undetermined` on
 * `chain IS NULL`, which was right for text and wrong for bytes, and its worker
 * found it and correctly left it alone.
 *
 * WHAT THIS SUITE MEASURES, all of it through `op=meaningrows` and `op=search`:
 *
 *   0. THE FIXTURE is armed: a TEXT row whose chain is null and IMAGE rows
 *      cited as bytes, one of them on a document whose capture HAS a chain.
 *   1. `content:chain=undetermined` returns ONLY the text row, at both grains.
 *   2. The bytes rows answer `content:chain=does-not-apply` (IC-131), at both
 *      grains, and `rows=content` labels them `chain_last: does-not-apply` —
 *      so every row is in EXACTLY ONE of {a step, undetermined, does not
 *      apply}: reported under its own stated answer, never silently dropped
 *      and never silently counted as undetermined.
 *   3. THE LIAR'S GREEN IS REFUSED: the images are still reachable through
 *      every other `content:` question, and `op=content` still reads them.
 *
 * WHAT IT DID NOT CLAIM: `content:cap=undetermined` ALSO matched a bytes row
 * (`derivation_cap IS NULL`), the same class on the cap axis. It was OUT OF
 * THIS ROW'S SCOPE ("no other content: answer may move") and was reported to
 * CONDUCT; section 4 MEASURED it. REC-127 (IC-138) CLOSED it, and section 4's
 * assertion is CORRECTED at its site with the reason, never exempted.
 */
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
  bindings: { ADMIN_TOKEN: "adm-r121", MEMBER_TOKEN: "mem-r121", PROBE_TOKEN: "prb-r121",
              AI_TOKEN: "ai-r121", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r121") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r121") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const idsOf = async (q) => ((await get("search", `q=${encodeURIComponent(q)}&mode=ids`))?.ids ?? []).sort();
const rowsOf = async (q) => (await get("meaningrows", `rows=content&q=${encodeURIComponent(q)}`))?.rows ?? [];
const rowIds = async (q) => (await rowsOf(q)).map((r) => r.content_id).sort();

const NOW = "2026-09-18T00:00:00Z";
const LATER = "2026-09-18T01:00:00Z";

const memberSession = async (id) => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role: "admin",
                                        capabilities: ["contribute"] }, "adm-r121");
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
   `pageCount` is the reading's stored figure (CAP-9), which is what lets an image
   on a page be addressed on a capture that has no chain at all. */
const promoteDoc = async (id, { chain, pageCount }) => {
  const capSha = sha(`rec121-${id}-bytes`);
  const text = infoMd(id);
  const reading = { capture: { sha256: capSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
               entities: [], facts: {}, page_count: pageCount,
               ...(chain === undefined ? {} : { text_source: chain }) } };
  const prov = JSON.stringify({ documents: [reading] });
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260918T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${id}`,
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

/* ==================================================================== 0 */
console.log("\n--- 0. the fixture: a text row with a null chain, and images cited as bytes ---");
/* DOC_TEXT — captured, never read: its document row is TEXT with no chain, which
   IS undetermined. */
const DOC_TEXT = "INFO-2026-9121-text";
await promoteDoc(DOC_TEXT, { chain: undefined, pageCount: 2 });
const TEXT_ROW = await mint(DOC_TEXT, { kind: "document" });
/* DOC_IMG — the same kind of capture, but the only row is an IMAGE cited as its
   own bytes. Its chain is NULL for a different reason, and that is the defect. */
const DOC_IMG = "INFO-2026-9121-image";
await promoteDoc(DOC_IMG, { chain: undefined, pageCount: 2 });
const IMG_ROW = await mint(DOC_IMG, { kind: "image", page: 0, rect: [50, 600, 250, 700] });
/* DOC_MIXED — a text-layer capture holding BOTH a text row (chain `layer`) and a
   bytes image: the capture HAS a chain and the image row still carries none,
   because nothing about the image was read. It is what separates the arm's two
   grains — the document answers `layer` AND `does-not-apply`, and must NOT
   answer `undetermined`. */
const DOC_MIXED = "INFO-2026-9121-mixed";
await promoteDoc(DOC_MIXED, { chain: [{ step: "layer" }], pageCount: 3 });
const MIXED_TEXT = await mint(DOC_MIXED, { kind: "document" });
const MIXED_IMG = await mint(DOC_MIXED, { kind: "image", page: 1, rect: [10, 10, 90, 90] });

const byId = Object.fromEntries((await rowsOf("has:content")).map((r) => [r.content_id, r]));
const ALL = Object.values(byId);
console.log(`  corpus: ${ALL.length} content rows over ${new Set(ALL.map((r) => r.bundle_id)).size} documents`);
const readRow = async (id) => get("content", `id=${encodeURIComponent(id)}`);
const cited = {};
for (const id of [TEXT_ROW, IMG_ROW, MIXED_TEXT, MIXED_IMG]) {
  const r = await readRow(id);
  cited[id] = [r?.cited_as ?? null, r?.chain ?? null];
}
t("ARMED: four content rows over three documents, each read back through `op=content`",
  [ALL.length, Object.keys(byId).sort()], [4, [TEXT_ROW, IMG_ROW, MIXED_TEXT, MIXED_IMG].sort()]);
t("ARMED: the text row on the unread capture is `text` with NO chain",
  cited[TEXT_ROW], ["text", null]);
t("ARMED: both image rows are cited as `bytes` with NO chain — one on a capture that has one",
  [cited[IMG_ROW], cited[MIXED_IMG]], [["bytes", null], ["bytes", null]]);
t("ARMED: the mixed document's text row carries its capture's `layer` chain",
  [cited[MIXED_TEXT][0], Array.isArray(cited[MIXED_TEXT][1])], ["text", true]);

/* ==================================================================== 1 */
console.log("\n--- 1. `content:chain=undetermined` answers ONLY the text row ---");
/* THE ARM ANSWERS AT BUNDLE GRAIN and `rows=content` returns every content row of
   every document in that scope (CONTENT-SEARCH §4.2: "the content rows themselves,
   of every bundle in scope") — measured on this fixture before the fix, where the
   row list for `chain=undetermined` held all four rows because all three
   documents were in scope. So the ROW-grain assertion below holds exactly because
   the only document in scope is the one holding only the text row. */
t("at BUNDLE grain, `content:chain=undetermined` names ONLY the document holding the text row — "
+ "never a document whose null chain is an image cited as its own bytes",
  await idsOf("content:chain=undetermined"), [DOC_TEXT]);
t("through `op=meaningrows&rows=content`, the answer is ONLY the text row",
  await rowIds("content:chain=undetermined"), [TEXT_ROW]);

/* ==================================================================== 2 */
console.log("\n--- 2. the bytes rows answer under their OWN stated value: does not apply ---");
t("`content:chain=does-not-apply` names the documents holding an image cited as bytes",
  await idsOf("content:chain=does-not-apply"), [DOC_IMG, DOC_MIXED].sort());
t("and through `rows=content` returns those documents' rows — both bytes rows among them",
  await rowIds("content:chain=does-not-apply"), [IMG_ROW, MIXED_IMG, MIXED_TEXT].sort());
t("case does not matter, as for every chain value (`case: lower`)",
  await idsOf("content:chain=Does-Not-Apply"), [DOC_IMG, DOC_MIXED].sort());
t("`rows=content` LABELS each row: a step, NULL for undetermined, `does-not-apply` for bytes",
  [TEXT_ROW, IMG_ROW, MIXED_TEXT, MIXED_IMG].map((id) => byId[id]?.chain_last ?? null),
  [null, "does-not-apply", "layer", "does-not-apply"]);
/* ONE DEFINITION, TWO CONSUMERS — the filter and the label must agree, document
   by document: a document is in `chain=X` iff it holds a row whose `chain_last`
   says X (NULL for undetermined). A bytes row counted in undetermined (the
   defect) or in nothing (the liar) makes the two disagree and fails BY NAME. */
const label = (r) => r.chain_last ?? "undetermined";
const docs = [...new Set(ALL.map((r) => r.bundle_id))].sort();
const disagree = [];
for (const v of ["undetermined", "does-not-apply", "layer"]) {
  const arm = await idsOf(`content:chain=${v}`);
  for (const d of docs) {
    const holds = ALL.some((r) => r.bundle_id === d && label(r) === v);
    if (holds !== arm.includes(d)) disagree.push(`${v}: ${d} filter=${arm.includes(d)} label=${holds}`);
  }
}
t("the FILTER and the ROW LABEL agree for every document on every chain answer", disagree, []);
t("and every row carries exactly one of {a step, undetermined, does-not-apply} — no row is left "
+ "without an answer", ALL.filter((r) => !["undetermined", "does-not-apply", "layer"].includes(label(r)))
    .map((r) => r.content_id), []);
t("the PUBLISHED grammar (`op=searchfields`) states the third answer, so a member who does not "
+ "find an image under undetermined can learn where it went",
  ((await get("searchfields"))?.syntax ?? []).some((l) => /content:chain=does-not-apply/.test(l)), true);
t("`content:chain=*` (a step is present) is untouched: only the document with a chained text row",
  await idsOf("content:chain=*"), [DOC_MIXED]);
t("`content:layer` is untouched", await idsOf("content:layer"), [DOC_MIXED]);

/* ==================================================================== 3 */
console.log("\n--- 3. THE LIAR'S GREEN REFUSED: the images are still in every other answer ---");
t("`has:content` still names all three documents — the image-only one included",
  await idsOf("has:content"), [DOC_IMG, DOC_MIXED, DOC_TEXT].sort());
t("`rows=content` over `has:content` still carries both bytes rows",
  [IMG_ROW, MIXED_IMG].map((id) => !!byId[id]), [true, true]);
t("`content:image` names both documents holding an image",
  await idsOf("content:image"), [DOC_IMG, DOC_MIXED].sort());
t("`content:member` and `content:uncited` still reach the image-only document",
  [(await idsOf("content:member")).includes(DOC_IMG), (await idsOf("content:uncited")).includes(DOC_IMG)],
  [true, true]);
t("`op=content` still reads the bytes row, and its transcription still says it does NOT APPLY",
  [(await readRow(IMG_ROW))?.transcription?.applies], [false]);

/* ==================================================================== 4 */
console.log("\n--- 4. the cap axis carries the same class — CLOSED by REC-127 ---");
/* CORRECTED BY REC-127 (IC-138), NOT EXEMPTED. This assertion was written by
   REC-121 as a MEASUREMENT of a defect out of its scope: it pinned
   `content:cap=undetermined` returning [DOC_IMG, DOC_MIXED, DOC_TEXT], because
   `derivation_cap IS NULL` counted both images cited as their own bytes. That
   answer was WRONG — a bytes row's cap is null by meaning, not undetermined —
   and REC-127 gave the cap axis the chain's third answer. So the pin now states
   the corrected answer: the image-only document LEAVES `cap=undetermined`, and
   both images answer `cap=does-not-apply`. DOC_MIXED stays under undetermined,
   and correctly: its TEXT row's chain is a `layer` step, which caps nothing, so
   that row's cap genuinely is undetermined — the image beside it is not why.
   The full cap-axis coverage is `rec127-cap-bytes.test.mjs`. */
t("CORRECTED by REC-127: `content:cap=undetermined` no longer returns the bytes rows — their null cap "
+ "does not apply, and they answer `content:cap=does-not-apply`",
  [await idsOf("content:cap=undetermined"), await idsOf("content:cap=does-not-apply")],
  [[DOC_MIXED, DOC_TEXT].sort(), [DOC_IMG, DOC_MIXED].sort()]);

await mf.dispose();
console.log(`\nrec121-chain-bytes: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
