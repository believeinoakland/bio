/* NEGATIVE CONTROL: the arms live in `test/nc-rec104.mjs` and are re-run in one step with `node test/nc-rec104.mjs [arm]` from `bio-plane/`; that harness drives THIS suite and `content-arm.test.mjs` together, because the construct is proved in two places (here: the engine and the migration; there: the committed fixture through the op). Each arm edits ONE real source, is armed ALONE, and is restored from a uniquely-named per-arm pristine copy verified by sha256 AND by content, with a byte count printed and a minimum guarded (never `git checkout --`). Run 2026-09-18 by the REC-104 worker, every arm AS DECLARED on the final tree, every restore byte-identical: (a) `baseline` — nothing armed -> both suites green (content-arm 110/0, this suite 28/0). (b) `baseline2` — nothing armed again -> the section-11 answer digest is IDENTICAL across two untouched runs (the A/A arm). (c) `firststep` — the generated column reads `$[0]` instead of `$[#-1]` -> content-arm's `chain_last` witness and `content:ocr` FAIL by name, and this suite's legacy-row and follow-the-chain assertions FAIL; `content:layer` stays green (a one-step chain's first step is its last). (d) `nowriter` — `chain_kind` becomes a plain column nobody writes -> every chain filter FAILS and the engine-refusal assertion FAILS, because a plain column accepts the write. (e) `parseback` — `chain_last` goes back to parsing the blob -> ONLY the two structural pins in section 1 FAIL; every behavioural assertion stays green, which is why the pins exist. (f) `nomigrate` — the #migrate block disabled -> the reboot-adds-the-column assertion and every legacy through-op assertion FAIL by name. (g) `xinfo` — the guard reads `table_info` -> the SECOND-boot assertion FAILS while the first boot's stay green. (h) `preitem` — the three plane sources as at the base commit -> the column assertions FAIL and content-arm's section-11 digest is IDENTICAL to (a)'s, the over-strictness arm the row names; run at base 92f4c64e (33 questions) and again after rebasing onto 694f0a7f, which `PRE_ITEM` now pins (38 questions, FW-19 having added extent kinds), IDENTICAL both times. FIRST RUN, RECORDED RATHER THAN SMOOTHED: (f) and (g) came back NOT AS DECLARED — the Durable Object bricked exactly as declared, but this suite's helpers threw on the non-JSON error page and ended with no tally; responses are now parsed as text so the failure is NAMED. */
/* RE-ANCHORED 2026-09-27 (T5-12, legacy-tests; content R14, R45; D-686, D-710): the control above is REC-104's and
   is HISTORY for the arms D-686 removed: `nowriter` and `xinfo`'s generated-column reading, and section 3's engine
   refusal, describe REC-104's GENERATED column, which D-686 replaced by a PLAIN column written at mint
   (`src/content/extent.mjs` `unitChainKind` over text-chain's `chainKindFor`) with `migrateContent` rebuilding a
   REC-104 store and recomputing every row once (content's record, "Decisions": R14's column). `nc-rec104.mjs` was not
   re-run here (a control rewrites product source; the brief forbids it). What changed in this suite, each marked
   below: the content table's DDL is read from content's `CONTENT_SCHEMA` (it left schema.mjs); a pre-item store is
   built by replacing the content table in a booted store's storage (the store no longer takes the content DDL from
   the `SCHEMA` binding, so a boot on an old schema text cannot hold an old content table); section 2's column arrives
   PLAIN; a REC-104 store's migration is driven (2b, from the D-710 branch's suite, re-pinned to today's rule);
   section 3's by-construction arms are RETIRED with the generated column and section 3 now drives R14 through the
   op on a mixed document (from the D-710 branch's suite, re-pinned to D-723's `mixed` for a page two parts share);
   section 1b drives the one function. The D-710 branch's `capture_text` / `CHAIN_LAST` arm is NOT taken: that
   document-level rule was superseded (extraction's N28 reads `chainKindFor` per page), and it is extraction's. */
/* REC-104 / CONTENT-SEARCH-DESIGN.md §4.2 — `content.chain_kind`: THE `chain` FILTER
 * ANSWERS OFF A COLUMN, AND THE COLUMN CANNOT GO STALE.
 *
 * `content-arm.test.mjs` owns the FILTER'S ANSWERS on its committed fixture, and
 * this item changed how those answers are produced and never which rows produce
 * them — so that suite's assertions are the over-strictness arm and they are not
 * restated here. THIS suite owns the three properties the fixture cannot reach:
 *
 *   1. THE COLUMN IS THE ENGINE'S AND NOBODY ELSE'S. `chain_kind` is a GENERATED
 *      column over `chain`, so a stale value is impossible BY CONSTRUCTION rather
 *      than by a writer remembering to write it. That is a claim about SQLite
 *      and it is DRIVEN inside workerd, the plane's own engine, not argued: an
 *      INSERT that names the column is REFUSED by the engine, and an UPDATE that
 *      moves the chain moves the kind with it in the same statement.
 *
 *   2. A STORE CREATED BEFORE THIS ITEM MIGRATES. A store booted on the pre-item
 *      schema, holding content rows, is rebooted on the current one; the rows it
 *      already held answer the filter, and a SECOND boot does not re-add the
 *      column (a generated column is HIDDEN from `PRAGMA table_info`, which is
 *      what every other additive migration in `#migrate` reads — reading it here
 *      would re-ALTER on every boot and brick the Durable Object).
 *
 *   3. THE PARSE IS RETIRED, NOT KEPT BESIDE. The compiled statement carries no
 *      JSON parse of the chain, and its plan inside workerd SEEKS the index
 *      rather than scanning the table.
 *
 * WHAT THIS SUITE DOES NOT CLAIM: the size of the improvement. That is
 * `test/content-index-probe.mjs` at two corpus sizes, recorded in
 * `MEASUREMENTS.md`, because a battery is no place to time anything.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { compile, MEANING } from "../src/query.mjs";
/* RE-ANCHORED 2026-09-27 (T5-12): the content table's DDL is content's own schema text (R45), not schema.mjs's. */
import { CONTENT_SCHEMA as SCHEMA } from "../src/content/schema.mjs";
import { mergedChain, CHAIN_KIND_MIXED } from "../src/textchain.mjs";
import { unitChainKind, unitTargetOf } from "../src/content/extent.mjs";
import { registerDoc, registerFile } from "./register-doc.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const QUERY_SRC = readFileSync(SRC("query.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const M = "class:member";
const NOW = "2026-09-18T00:00:00Z";

/* THE PRE-ITEM SCHEMA, derived from the current one by removing exactly what
   this item added — the column and its index — so the fixture cannot drift from
   the table it stands in for in any other respect. Asserted to BE the old shape
   before anything is measured against it. */
const contentStmt = (s) => { const i = s.indexOf("CREATE TABLE IF NOT EXISTS content ("); return s.slice(i, s.indexOf("\n);", i) + 3); };
const NEW_CONTENT = contentStmt(SCHEMA);
const OLD_CONTENT = NEW_CONTENT
  .replace(/\n[ \t]*chain_kind[^\n]*/, "")
  .replace(/,([ \t]*--[^\n]*)?\n\);$/, "$1\n);");
const OLD_SCHEMA = SCHEMA.replace(NEW_CONTENT, OLD_CONTENT)
  .replace(/CREATE INDEX IF NOT EXISTS content_chain_kind ON[^\n]*\n/, "");
/* RE-ANCHORED 2026-09-27 (T5-12; D-686, from the D-710 branch's suite): THE PRE-D-686 TABLE — REC-104's GENERATED
   whole-chain column in place of today's plain one. The expression is TYPED because it is history, REC-104's
   definition, which the current source no longer holds; it is asserted to replace exactly the one column line. */
const REC104_COLUMN = "  chain_kind     TEXT GENERATED ALWAYS AS (json_extract(chain, '$[#-1].step')) VIRTUAL";
const GEN_SCHEMA = SCHEMA.replace(/\n[ \t]*chain_kind[ \t]+TEXT[ \t]*--[^\n]*/, `\n${REC104_COLUMN}`);
const GEN_CONTENT = contentStmt(GEN_SCHEMA);

console.log("\n--- 0. the fixture: a pre-item schema, derived rather than typed ---");
/* RE-PINNED 2026-09-27 (T5-12; D-686, content R14): the column is PLAIN, written at mint. */
t("ARMED: the current content table declares chain_kind", /\n\s*chain_kind\s+TEXT\s*--/.test(NEW_CONTENT)
  && !/GENERATED/.test(NEW_CONTENT), true);
t("ARMED: the derived REC-104 table differs from today's by exactly the one column line (D-686's fixture)",
  [GEN_SCHEMA !== SCHEMA, /GENERATED ALWAYS AS/.test(GEN_CONTENT),
   GEN_SCHEMA.split("\n").filter((l, i) => l !== SCHEMA.split("\n")[i]).length], [true, true, 1]);
t("ARMED: the derived OLD content table does not, and still ends on a well-formed column list",
  [/chain_kind/.test(OLD_CONTENT), /,\s*(--[^\n]*)?\n\);$/.test(OLD_CONTENT)], [false, false]);
t("ARMED: the derived OLD schema carries no chain_kind index", /content_chain_kind/.test(OLD_SCHEMA), false);
/* A column line differs between the two only by the SEPARATING COMMA the last
   column does not carry — which column that is moves whenever a column is added
   (FW-19's `cited_as` landed beside this one), so the comparison ignores exactly
   that comma and nothing else. */
const sansComma = (l) => l.replace(/,(\s*--)/, "$1").replace(/,\s*$/, "");
const OLD_LINES = new Set(OLD_SCHEMA.split("\n").map(sansComma));
t("ARMED: and nothing else moved — the two schemas differ by exactly the column line and the index line",
  SCHEMA.length - OLD_SCHEMA.length > 0
    && SCHEMA.split("\n").filter((l) => !OLD_LINES.has(sansComma(l)))
         .filter((l) => !/chain_kind/.test(l)).length === 0, true);

/* ==================================================================== 1
 * THE PARSE IS RETIRED (structural, then compiled).
 * ================================================================== */
console.log("\n--- 1. the parse is retired, not kept beside the column ---");
{
  /* STRUCTURAL, because the property is ABSENCE: a second answer to one question
     that nothing currently calls is still a second answer, and it is the one that
     drifts. Comments are stripped first so this item's own explanation of what it
     retired cannot satisfy or defeat the check. */
  const code = QUERY_SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  t("query.mjs holds NO json_extract over the chain column anywhere in its code",
    (code.match(/json_extract\(\s*(\w+\.)?chain\b/g) || []), []);
  t("the `chain` sub-field reads the COLUMN", MEANING.content.sub.chain.col, "chain_kind");
  const st = compile({ q: "content:ocr", viewer: M, facets: [] }).statements.page();
  const i = st.sql.indexOf("FROM content");
  /* RE-PINNED 2026-09-27 (T5-12, legacy-tests; K143 (1), content R14, DEC-4): `ocr` is a machine reading, so
     `content:ocr` selects its own kind OR `mixed` (a unit read in more than one step kind): a set membership on the
     column, both words as ARGUMENTS. Still the column, still no parse, still no member text as syntax. */
  t("`content:ocr` compiles to an equality on the column, with the step as an ARGUMENT",
    [st.sql.slice(i, st.sql.indexOf(")", i) + 1).replace(/\s+/g, " ").trim(), st.args.includes("ocr"),
     st.args.includes("mixed")],
    ["FROM content WHERE chain_kind IN (?, ?)", true, true]);
  const frag = (q) => { const s = compile({ q, viewer: M, facets: [] }).statements.page().sql;
    const j = s.indexOf("FROM content"); return s.slice(j, s.indexOf(")", j)).replace(/\s+/g, " ").trim(); };
  t("`content:chain=*` is presence on the column", frag("content:chain=*"), "FROM content WHERE chain_kind IS NOT NULL");
  /* UNDETERMINED STAYS ON `chain`, AND THAT IS A DECISION, not a leftover. It asks
     whether the record holds a chain AT ALL — `chain IS NULL` — which is a
     different question from "the chain has no last step kind". Reading it off
     `chain_kind IS NULL` would fold the second into the first, and the pre-item
     answer did not. */
  /* CORRECTED BY REC-121, NOT EXEMPTED. This pinned the bare `chain IS NULL`, which
     was right for every row that could exist when REC-104 wrote it and became
     WRONG when FW-19 admitted an image cited as its own bytes, whose chain is NULL
     BY MEANING (EXTRACTION-BREADTH §3.1). The half of the decision above that
     REC-104 made still stands and is still pinned — undetermined reads `chain`, not
     `chain_kind` — and the exclusion of a bytes row is the new half. The bytes
     literal travels as an ARGUMENT. */
  t("`content:chain=undetermined` still asks whether the record holds a chain at all — over TEXT rows",
    frag("content:chain=undetermined"), "FROM content WHERE chain IS NULL AND cited_as <> ?");
  /* CORRECTED BY REC-121: `chain_last` still reads the COLUMN for every text row —
     no JSON parse returned, which the `parseback` arm of `nc-rec104.mjs` exists to
     catch — and a bytes row says `does-not-apply`, the word its filter answers it
     under. The pin is widened to the CASE rather than dropped, so a parse put back
     in either branch still fails here. */
  t("the rows=content projection reads `chain_last` off the column too — one answer, not two",
    /chain_last:\s*`CASE WHEN m\.cited_as = '\$\{CONTENT_CITED_AS_BYTES\}' THEN '\$\{CHAIN_DOES_NOT_APPLY\}' `\s*\+\s*`ELSE m\.chain_kind END`/.test(QUERY_SRC), true);
}

/* ==================================================================== 1b
 * ADDED 2026-09-27 (T5-12, legacy-tests; content R14, D-686, D-710, from the D-710 branch's suite and re-pinned to
 * today's rule): THE ONE FUNCTION the mint and the migration's recompute both call, `unitChainKind` over
 * `unitTargetOf`, driven directly. The chains are built by `mergedChain`, the product's own builder, never typed.
 * D-710's arm for a page two parts share read the part appended LAST; D-723 (text-chain) made it `mixed`, which is
 * R14's "`mixed` when covering steps differ", so that arm reads `mixed` here.
 * ================================================================== */
console.log("\n--- 1b. unitChainKind: how THIS unit was read ---");
const LAYER = [{ step: "layer" }];
const OCR = [{ step: "pixels" },
             { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }];
/* A mixed document whose parts PARTITION the pages (D-252): the text layer on 0-1, OCR on 2. */
const MIXED = mergedChain([{ chain: LAYER, pages: [0, 1] }, { chain: OCR, pages: [2] }]);
/* D-635's OVERLAP: page 2 read by the layer AND by OCR. */
const OVERLAP = mergedChain([{ chain: LAYER, pages: [0, 1, 2] }, { chain: OCR, pages: [2] }]);
const kindOf = (chain, extent) => unitChainKind(chain, unitTargetOf(extent));
const PAGE = (n) => ({ kind: "pdf-page", page: n, rect: null }), DOC = { kind: "document" };
t("ARMED: both chains are real mergedChain output, every step scoped to pages",
  [MIXED, OVERLAP].map((c) => Array.isArray(c) && c.every((x) => x.extent?.kind === "pages")), [true, true]);
t("a TEXT-LAYER page of a mixed document reads `layer` — the defect D-686 closes",
  [kindOf(MIXED, PAGE(0)), kindOf(MIXED, PAGE(1))], ["layer", "layer"]);
t("the OCR'd page of the same document reads `ocr`", kindOf(MIXED, PAGE(2)), "ocr");
t("a page two parts read differently reads `mixed`, and its other pages their layer (R14; D-723)",
  [kindOf(OVERLAP, PAGE(2)), kindOf(OVERLAP, PAGE(0))], ["mixed", "layer"]);
t("a WHOLE-DOCUMENT unit of a mixed document reads `mixed` — its pages' kinds differ (D-710)",
  [kindOf(MIXED, DOC), kindOf(OVERLAP, DOC), CHAIN_KIND_MIXED], ["mixed", "mixed", "mixed"]);
t("and a whole-document unit read ONE way reads that kind, scoped or not; an all-unscoped chain its last derivation step",
  [kindOf(LAYER, DOC), kindOf(OCR, DOC), kindOf(mergedChain([{ chain: OCR, pages: [0] }, { chain: OCR, pages: [1] }]), DOC),
   kindOf([{ step: "convert", engine: "google-drive", format: "odt" }, { step: "layer" }], DOC)],
  ["layer", "ocr", "ocr", "layer"]);
t("UNDETERMINED, stated as null: no chain, a malformed chain, a page no step covers",
  [kindOf(null, DOC), kindOf([{ step: "nope" }], DOC), kindOf(MIXED, PAGE(9))], [null, null, null]);

/* ==================================================================== 2
 * THE MIGRATION, AND THE ENGINE'S OWN GUARANTEE, INSIDE WORKERD.
 * ================================================================== */
const PROBE = `
import worker from "./index.mjs";
import { Store } from "./store.mjs";
export class ProbeStore extends Store {
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/rawsql") {
      const { sql, args = [] } = await req.json();
      try { return Response.json({ ok: true, rows: [...this.sql.exec(sql, ...args)] }); }
      catch (e) { return Response.json({ ok: false, error: String(e && e.message || e) }); }
    }
    return super.fetch(req);
  }
}
export default {
  async fetch(req, env, ctx) {
    if (new URL(req.url).pathname === "/rawsql")
      return env.STORE.get(env.STORE.idFromName("bio")).fetch(req);
    return worker.fetch(req, env, ctx);
  },
};
`;
const opts = (schema) => ({
  modules: true, script: PROBE, modulesRoot: "/",
  scriptPath: SRC("rec104-chain-kind-probe.mjs"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "ProbeStore", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r104", MEMBER_TOKEN: "mem-r104", PROBE_TOKEN: "prb-r104",
              AI_TOKEN: "ai-r104", VERSION: "test", ...(schema ? { SCHEMA: schema } : {}) },
});
/* RE-ANCHORED 2026-09-27 (T5-12; content R45): the store takes the content DDL from content's `migrateContent`, which
   runs after the schema pass on EVERY boot, so a store booted on an old schema text cannot hold an old content table
   (the first boot would convert it). The store is booted on today's schema and its content table is then REPLACED in
   storage by the older shape, which is what a store created before the item holds; the next boot is the migration. */
let mf = new Miniflare(opts(null));
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* A RESPONSE THAT IS NOT JSON IS AN ANSWER, NOT A CRASH. A Durable Object whose
   #migrate threw inside blockConcurrencyWhile answers every request with an error
   page — that is the failure this suite's migration section exists to catch — and
   `.json()` on it would end the module with no tally, which names nothing
   (`nc-rec104.mjs` arms `nomigrate` and `xinfo` came back that way on their first
   run). Parsed as text, so the assertion that wanted a real answer FAILS BY NAME. */
const asJson = async (res) => { const txt = await res.text();
  try { return JSON.parse(txt); } catch { return { ok: false, error: `non-JSON ${res.status}: ${txt.slice(0, 160)}` }; } };
const raw = async (sql, ...args) => asJson(await mf.dispatchFetch("http://x/rawsql",
  { method: "POST", body: JSON.stringify({ sql, args }) }));
const post = async (op, body, tok = "mem-r104") => rP(await asJson(await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })));
const get = async (op, qs = "", tok = "mem-r104") => rP(await asJson(await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)));
const ids = async (q) => ((await get("search", `q=${encodeURIComponent(q)}&mode=ids`))?.ids ?? []).sort();
const rowsOf = async (q) => (await get("meaningrows", `rows=content&q=${encodeURIComponent(q)}`))?.rows ?? [];
const xinfo = async () => ((await raw("PRAGMA table_xinfo(content)")).rows || []).map((r) => r.name);

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
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
const promoteInfo = async (id) => {
  const text = infoMd(id);
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260918T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 500)}`);
};
/* A content row written in the PRE-ITEM column set, exactly as `mintContent`
   writes one (`chain` is JSON.stringify of the chain array). The current minter
   cannot be used on the old table for the reason `publish.test.mjs` gives for its
   own raw route: the row has to exist BEFORE the migration runs. */
const INS = `INSERT INTO content (content_id,capture_sha,bundle_id,extent_kind,extent,ref,chain,
               derivation_cap,page_count,minted_by,at,stale) VALUES (?,?,?,?,?,?,?,?,?,?,?,0)`;
const chainOf = (...steps) => JSON.stringify(steps.map((s) => ({ step: s })));

console.log("\n--- 2. a store created BEFORE this item migrates, and its rows answer ---");
const DOC_OCR = "INFO-2026-9104-ocr", DOC_LAYER = "INFO-2026-9104-layer", DOC_BARE = "INFO-2026-9104-bare";
await promoteInfo(DOC_OCR); await promoteInfo(DOC_LAYER); await promoteInfo(DOC_BARE);
/* The table as a store created before the item holds it (see above), with none of today's indexes on it. */
const asTable = async (ddl, extra = []) => {
  for (const q of ["DROP TABLE content", ddl, ...extra]) {
    const w = await raw(q);
    if (!w.ok) throw new Error(`replace the content table: ${w.error}`);
  }
};
await asTable(OLD_CONTENT);
const before = await xinfo();
t("ARMED: the store booted on the pre-item schema has a content table WITHOUT chain_kind",
  [before.includes("content_id"), before.includes("chain_kind")], [true, false]);
for (const [id, doc, chain] of [["c-ocr", DOC_OCR, chainOf("pixels", "ocr")],
                                ["c-layer", DOC_LAYER, chainOf("layer")],
                                ["c-bare", DOC_BARE, null]]) {
  const w = await raw(INS, id, "sha-" + id, doc, "document", '{"kind":"document"}', "the whole document", chain,
                      null, null, "plane", NOW);
  if (!w.ok) throw new Error(`legacy insert ${id}: ${w.error}`);
}
t("ARMED: three legacy rows are held, one per answer the filter can give",
  (await raw("SELECT count(*) AS n FROM content")).rows?.[0]?.n, 3);

await mf.setOptions(opts(null));            // same storage, the CURRENT schema
const after = await xinfo();
t("the reboot ADDS the column to the existing table", after.includes("chain_kind"), true);
/* RE-PINNED 2026-09-27 (T5-12; D-686, content R14): this asserted the column arrived GENERATED (hidden from
   `table_info`). It arrives PLAIN, visible, `hidden` 0, and the rows' values are written by `migrateContent`'s one
   recompute through the mint's own function rather than by the engine. */
t("and adds it as a PLAIN column (D-686) — visible to table_info, `hidden` 0 in table_xinfo",
  [((await raw("PRAGMA table_info(content)")).rows || []).some((r) => r.name === "chain_kind"),
   ((await raw("PRAGMA table_xinfo(content)")).rows || []).find((r) => r.name === "chain_kind")?.hidden],
  [true, 0]);
t("the rows the store ALREADY HELD carry their kind, recomputed once by the mint's function",
  ((await raw("SELECT content_id, chain_kind FROM content ORDER BY content_id")).rows || [])
    .map((r) => `${r.content_id}=${r.chain_kind}`),
  ["c-bare=null", "c-layer=layer", "c-ocr=ocr"]);
t("THROUGH THE OP: `content:ocr` names the legacy OCR'd document", await ids("content:ocr"), [DOC_OCR]);
t("THROUGH THE OP: `content:layer` names the legacy text-layer document", await ids("content:layer"), [DOC_LAYER]);
t("THROUGH THE OP: `content:chain=undetermined` names the one with no chain", await ids("content:chain=undetermined"), [DOC_BARE]);
t("THROUGH THE OP: `content:chain=*` names the two that have one", await ids("content:chain=*"), [DOC_LAYER, DOC_OCR].sort());
t("THROUGH THE OP: `rows=content` publishes `chain_last` off the column for legacy rows",
  (await rowsOf("has:content")).map((r) => `${r.content_id}=${r.chain_last}`).sort(),
  ["c-bare=null", "c-layer=layer", "c-ocr=ocr"]);

await mf.setOptions(opts(null));            // a SECOND boot on the current schema
t("a SECOND boot does not re-add it — the op still answers, so #migrate did not throw on a duplicate column",
  [await ids("content:ocr"), (await xinfo()).filter((n) => n === "chain_kind").length], [[DOC_OCR], 1]);

await mf.dispose();

/* ==================================================================== 2b
 * ADDED 2026-09-27 (T5-12, legacy-tests; D-686, content R14's migration; from the D-710 branch's suite): A STORE
 * CREATED UNDER REC-104'S GENERATED COLUMN, holding a MIXED document's rows, is REBUILT (not `DROP COLUMN`, D-686's
 * measurement) and every row RECOMPUTED per unit, ONCE.
 * ================================================================== */
console.log("\n--- 2b. a store created BEFORE D-686 (REC-104's generated column) migrates, per unit ---");
mf = new Miniflare(opts(null));
const DOC_MIX_OLD = "INFO-2026-9686-mixed-legacy";
await promoteInfo(DOC_MIX_OLD);
await asTable(GEN_CONTENT, ["CREATE INDEX IF NOT EXISTS content_chain_kind ON content(chain_kind, bundle_id)"]);
const genCol = ((await raw("PRAGMA table_xinfo(content)")).rows || []).find((r) => r.name === "chain_kind");
t("ARMED: the store holds chain_kind as REC-104's GENERATED column", (genCol?.hidden ?? 0) > 0, true);
for (const [id, extent, ref] of [["m-page0", '{"kind":"pdf-page","page":0,"rect":null}', "page 1"],
                                 ["m-page2", '{"kind":"pdf-page","page":2,"rect":null}', "page 3"],
                                 ["m-doc", '{"kind":"document"}', "the whole document"]]) {
  const w = await raw(INS, id, "sha-mixed-legacy", DOC_MIX_OLD, JSON.parse(extent).kind, extent, ref,
                      JSON.stringify(MIXED), null, 3, "plane", NOW);
  if (!w.ok) throw new Error(`legacy insert ${id}: ${w.error}`);
}
const kinds = async () => ((await raw("SELECT content_id, chain_kind FROM content ORDER BY content_id")).rows || [])
  .map((r) => `${r.content_id}=${r.chain_kind}`);
t("ARMED: under REC-104 the TEXT-LAYER page's unit reads `ocr` — the defect, present before the migration",
  await kinds(), ["m-doc=ocr", "m-page0=ocr", "m-page2=ocr"]);
await mf.setOptions(opts(null));            // same storage: the boot is the migration
t("the reboot REPLACES the generated column with a plain one — one column, `hidden` 0",
  ((await raw("PRAGMA table_xinfo(content)")).rows || []).filter((r) => r.name === "chain_kind").map((r) => r.hidden), [0]);
t("every row is RECOMPUTED per unit: the text-layer page reads `layer`, the OCR'd page `ocr`, the whole document `mixed`",
  await kinds(), ["m-doc=mixed", "m-page0=layer", "m-page2=ocr"]);
t("and the index the filter seeks is back on the new column",
  ((await raw("SELECT name FROM sqlite_master WHERE type='index' AND name='content_chain_kind'")).rows || []).length, 1);
t("THROUGH THE OP: `content:layer` now names the mixed document, by its text-layer page",
  await ids("content:layer"), [DOC_MIX_OLD]);
/* THE RECOMPUTE RUNS ONCE: a sentinel written after the migration survives a second boot (a recompute on every boot
   would be a full-table rewrite per cold start; `hidden` is the guard). */
await raw("UPDATE content SET chain_kind='typed' WHERE content_id='m-doc'");
await mf.setOptions(opts(null));
t("a SECOND boot does not recompute — the converted store is left as it is",
  await kinds(), ["m-doc=typed", "m-page0=layer", "m-page2=ocr"]);
await mf.dispose();

/* ==================================================================== 3
 * RETIRED 2026-09-27 (T5-12, legacy-tests; D-686, content R14): this section drove REC-104's BY-CONSTRUCTION
 * guarantee — an INSERT naming `chain_kind` refused by the engine ("generated column"), and an UPDATE of `chain`
 * moving the kind with no second write. Its subject, the GENERATED column, no longer exists: the column is plain
 * and written at mint, because the unit's kind needs the steps' extents and the unit's page, which no SQL expression
 * over the row can ask. What it protected (one definition, no stale value) is section 1b's one function, the mint
 * and the recompute calling it, and the rule that a content row is never rewritten.
 * REPLACED BY R14's ACCEPTS-WHEN THROUGH THE OP (from the D-710 branch's suite, re-pinned to D-723): on a store
 * created today, units minted through `op=contentmint` on a mixed document each say how THEY were read.
 * ================================================================== */
console.log("\n--- 3. on a mixed document, through the op: each unit says how IT was read ---");
mf = new Miniflare(opts(null));
const memberSession = async (id) => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role: "admin",
                                        capabilities: ["contribute"] }, "adm-r104");
  const en = await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
const MINA = await memberSession("mina");
/* The reading carrier completed to C-18.1's intake shape (K121, `register-doc.mjs`), the capture registered under
   the file the document names. */
const promoteRead = async (id, captureSha, chain) => {
  const text = infoMd(id);
  const file = `snapshots/${id}.bin`;
  const doc = registerDoc({
    capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
               entities: [], facts: {}, text_source: chain } }, { file });
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260925T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland",
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }, registerFile(doc)],
    register: [{ path: file, sha256: captureSha, encoding: "binary", bytes: 10 }] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 500)}`);
};
const DOC_MIX = "INFO-2026-9686-mixed", DOC_OVER = "INFO-2026-9686-overlap";
await promoteRead(DOC_MIX, sha("d686-mixed-bytes"), MIXED);
await promoteRead(DOC_OVER, sha("d686-overlap-bytes"), OVERLAP);
const minted = {};
for (const [doc, tag] of [[DOC_MIX, "mix"], [DOC_OVER, "over"]])
  for (const [extent, name] of [[{ kind: "pdf-page", page: 0 }, "page0"], [{ kind: "pdf-page", page: 2 }, "page2"],
                                [{ kind: "document" }, "doc"]]) {
    const m = await post("contentmint", { bundleId: doc, extent }, MINA);
    if (!m.ok) throw new Error(`contentmint ${tag}.${name}: ${JSON.stringify(m).slice(0, 400)}`);
    minted[m.content_id] = `${tag}.${name}`;
  }
t("ARMED: six units minted through `op=contentmint`, three on each mixed document", Object.keys(minted).length, 6);
const LABELS = (await rowsOf("has:content")).filter((r) => minted[r.content_id])
  .map((r) => `${minted[r.content_id]}=${r.chain_last}`).sort();
console.log(`    units: ${LABELS.join(" · ")}`);
t("a TEXT-LAYER page's unit reads `layer`, on a partitioned mixed document and on overlapping parts (D-686)",
  LABELS.filter((x) => /page0/.test(x)), ["mix.page0=layer", "over.page0=layer"]);
t("the OCR-only page's unit reads `ocr`; the page both parts read reads `mixed` (R14; D-723)",
  LABELS.filter((x) => /page2/.test(x)), ["mix.page2=ocr", "over.page2=mixed"]);
t("the whole-document unit of a mixed document reads `mixed` (D-710)",
  LABELS.filter((x) => /\.doc=/.test(x)), ["mix.doc=mixed", "over.doc=mixed"]);
t("THROUGH THE SEARCH: `content:mixed` is a word, and names each mixed document",
  await ids("content:mixed"), [DOC_MIX, DOC_OVER].sort());
t("THROUGH THE SEARCH: `content:layer` and `content:ocr` (which reads `mixed` as machine-read, DEC-4) BOTH name each",
  [await ids("content:layer"), await ids("content:ocr")], [[DOC_MIX, DOC_OVER].sort(), [DOC_MIX, DOC_OVER].sort()]);
{
  /* THE PLAN, on workerd's engine, for the statement a member actually produces — compiled here and not typed. A
     seek on the index is the evidence the question is answered off the column; the milliseconds are the probe's. */
  const st = compile({ q: "content:ocr", viewer: M, facets: [] }).statements.page();
  const plan = await raw("EXPLAIN QUERY PLAN " + st.sql, ...st.args);
  const lines = (plan.rows || []).map((r) => r.detail).filter((d) => /content/.test(d));
  console.log(`    plan: ${lines.join(" | ") || plan.error}`);
  t("the compiled `content:ocr` statement SEEKS content_chain_kind inside workerd rather than scanning content",
    [lines.some((d) => /content_chain_kind/.test(d)), lines.some((d) => /^SCAN content\b/.test(d))], [true, false]);
}

await mf.dispose();
console.log(`\ncontent-chain-kind: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
