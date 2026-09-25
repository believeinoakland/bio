/* NEGATIVE CONTROL: two harnesses drive this suite, each run from `bio-plane/` in one step. D-686's arms live in `test/nc-d686.mjs` (`node test/nc-d686.mjs [arm]`), declared there before arming, each edits ONE real source ALONE and is restored from a uniquely-named per-arm pristine copy verified by sha256 AND by content with a byte count floored: (a) `baseline` — nothing armed -> green. (b) `generated` — THE ROW'S OWN ARM: `schema.mjs` and `store.mjs` as they stood at D-686's base (d31c52bf, the generated whole-chain column) -> section 3's "a TEXT-LAYER page's unit reads `layer`" FAILS BY NAME, and the pure-function section 1b stays green. (c) `wholechain` — the page question ignores the page -> the text-layer-page arms of 1b, 2b and 3 FAIL by name and every OCR-page arm stays green. (c2) `lastkind` — BOB #35's arm (09:35Z): the no-page question answers the chain's last derivation step again -> the whole-document `mixed` arms of 1b, 2b and 3 FAIL by name and every per-page arm stays green. (d) `nowrite` — `mintContent` stops writing the column -> section 3's minted rows read NULL and FAIL by name. (e) `nomigrate` — the recompute loop removed -> section 2b's recomputed-row assertions FAIL. (f) `xinfo` — the guard reads `table_info` -> section 2b's migration of a REC-104 store FAILS by name (the generated column is hidden from `table_info`, so the ALTER duplicates it and the Durable Object bricks). (g) `overstrict` — the page question rewritten as a forward scan keeping the last covering step, a different correct spelling -> MUST PASS. RUN 2026-09-25 by D-686's worker on the final sources (after BOB #35's 09:35Z `mixed` ruling): EVERY ARM AS DECLARED, every restore byte-identical by sha256 and content; `lastkind` failed exactly the four whole-document `mixed` assertions (figures at the foot of `nc-d686.mjs`). D-710's arms live in `test/nc-d710.mjs`, same rules: `unscopedfirst` — the guard that an unscoped step before scoped parts is undetermined removed -> 1b's D-710 undetermined arm FAILS by name; `endasnull` — the capture_text writer asks about no page instead of `CHAIN_LAST` -> section 3's KEPT arm FAILS by name; `overstrict` — the guard spelled as a forward scan -> MUST PASS. RUN 2026-09-25 by D-710's worker: EVERY ARM AS DECLARED, and `nc-d686.mjs` re-run on the same sources, all eight AS DECLARED (`lastkind` 48/4 — the row's named control). REC-104's surviving arms (`baseline`, `baseline2`, `parseback`, `preitem`) stay in `test/nc-rec104.mjs`; its `firststep` and `nowriter` arms were SUPERSEDED by D-686 (they broke a generated column that no longer exists) and are carried by (b) and (d) here. */
/* REC-104 / CONTENT-SEARCH-DESIGN.md §4.2, AND D-686 (BOB #35, 2026-09-25 09:05Z) — `content.chain_kind`:
 * THE `chain` FILTER ANSWERS OFF A COLUMN, AND THE COLUMN SAYS HOW THE UNIT WAS READ.
 *
 * `content-arm.test.mjs` owns the FILTER'S ANSWERS on its committed fixture (no mixed document, so D-686
 * moves none of them) — its assertions are the over-strictness arm and are not restated here. THIS suite
 * owns what the fixture cannot reach:
 *
 *   1. THE PARSE IS RETIRED, NOT KEPT BESIDE. The compiled statement carries no JSON parse of the chain,
 *      and its plan inside workerd SEEKS the index rather than scanning the table.
 *   1b. THE ONE FUNCTION. `textchain.mjs` `chainKindFor` answers a page by the last derivation step
 *      covering it; a unit with no page by the single kind its pages were read with, or `mixed` (BOB #35,
 *      09:35Z); and `capture_text`'s document-level fact (`CHAIN_LAST`) by the chain's last derivation step.
 *   2. A STORE CREATED BEFORE REC-104 MIGRATES: the column is added, plain, and every row recomputed.
 *   2b. A STORE CREATED BEFORE D-686 MIGRATES: REC-104's GENERATED whole-chain column is dropped, re-added
 *      plain, and every row RECOMPUTED per unit — a derived value, so not a rewrite of history — ONCE.
 *   3. ON A MIXED DOCUMENT, THROUGH THE OP: a text-layer page's unit reads `layer`, an OCR'd page's reads
 *      `ocr` (D-686's accepts-when), on a partitioned chain and on D-635's overlapping parts.
 *
 * CORRECTED BY D-686, NOT EXEMPTED: this suite asserted that the column was GENERATED — that an INSERT
 * naming it was refused by the engine and an UPDATE of `chain` moved it. That was right for REC-104's
 * definition (the whole chain's last step, which an SQL expression over the row can compute) and became
 * wrong when BOB #35 ruled the column is the UNIT's kind: that needs the steps' extents and the unit's
 * page, which only `chainKindFor` computes, so the column is plain and written at mint. What REC-104's
 * engine guarantee protected — one definition, no stale value — is now section 1b's one function and
 * the rule that a content row is never rewritten.
 *
 * WHAT THIS SUITE DOES NOT CLAIM: the size of the improvement. That is `test/content-index-probe.mjs`,
 * recorded in `MEASUREMENTS.md`, because a battery is no place to time anything.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { compile, MEANING } from "../src/query.mjs";
import { SCHEMA } from "../src/schema.mjs";
import { chainKindFor, mergedChain, CHAIN_LAST, CHAIN_KIND_MIXED } from "../src/textchain.mjs";

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

/* D-686 — THE PRE-D-686 SCHEMA: REC-104's GENERATED whole-chain column in place of today's plain one.
   The expression is TYPED here because it is history — REC-104's definition, which the current source no
   longer holds anywhere — and it is asserted to replace exactly the one column line. */
const REC104_COLUMN = "  chain_kind     TEXT GENERATED ALWAYS AS (json_extract(chain, '$[#-1].step')) VIRTUAL";
const GEN_SCHEMA = SCHEMA.replace(/\n[ \t]*chain_kind[ \t]+TEXT[ \t]*--[^\n]*/, `\n${REC104_COLUMN}`);

console.log("\n--- 0. the fixture: a pre-item schema, derived rather than typed ---");
t("ARMED: the current content table declares chain_kind as a PLAIN column (D-686)",
  /\n\s*chain_kind\s+TEXT\s*--/.test(NEW_CONTENT) && !/GENERATED/.test(NEW_CONTENT), true);
t("ARMED: the derived REC-104 schema differs from today's by exactly the one column line",
  [GEN_SCHEMA !== SCHEMA, /GENERATED ALWAYS AS/.test(contentStmt(GEN_SCHEMA)),
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
  t("`content:ocr` compiles to an equality on the column, with the step as an ARGUMENT",
    [st.sql.slice(i, st.sql.indexOf(")", i)).replace(/\s+/g, " ").trim(), st.args.includes("ocr")],
    ["FROM content WHERE chain_kind = ?", true]);
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
 * D-686 — THE ONE FUNCTION, driven directly. The chains are built by `mergedChain`, the product's own
 * builder, never typed, so they are the shapes the record actually holds.
 * ================================================================== */
console.log("\n--- 1b. chainKindFor: the last derivation step covering the unit's page ---");
const LAYER = [{ step: "layer" }];
const OCR = [{ step: "pixels" },
             { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" } }];
/* A mixed document whose parts PARTITION the pages (D-252): the text layer on 0-1, OCR on 2. */
const MIXED = mergedChain([{ chain: LAYER, pages: [0, 1] }, { chain: OCR, pages: [2] }]);
/* D-635's OVERLAP: page 2's folio decoded from the layer AND its transcription appended, so page 2 is in
   BOTH parts and each part carries its index. */
const OVERLAP = mergedChain([{ chain: LAYER, pages: [0, 1, 2] }, { chain: OCR, pages: [2] }]);
t("ARMED: both chains are real mergedChain output — scoped, and the overlap carries part indices",
  [Array.isArray(MIXED) && MIXED.every((x) => x.extent?.kind === "pages"),
   Array.isArray(OVERLAP) && OVERLAP.map((x) => x.extent?.part)], [true, [0, 1, 1]]);
t("a TEXT-LAYER page of a mixed document reads `layer` — the defect D-686 closes",
  [chainKindFor(MIXED, { page: 0 }), chainKindFor(MIXED, { page: 1 })], ["layer", "layer"]);
t("the OCR'd page of the same document reads `ocr`", chainKindFor(MIXED, { page: 2 }), "ocr");
t("a page two parts share answers the part appended LAST (D-635), and its other pages their layer",
  [chainKindFor(OVERLAP, { page: 2 }), chainKindFor(OVERLAP, { page: 0 })], ["ocr", "layer"]);
/* BOB #35 09:35Z: a unit with NO page answers the single kind when every page was read one way and
   `mixed` when they differ — never null, because the record knows. */
t("a WHOLE-DOCUMENT unit of a mixed document reads `mixed` — not the kind its chain happens to end on",
  [chainKindFor(MIXED), chainKindFor(OVERLAP), CHAIN_KIND_MIXED], ["mixed", "mixed", "mixed"]);
t("and a whole-document unit read ONE way reads that kind, scoped or not",
  [chainKindFor(LAYER), chainKindFor(OCR),
   chainKindFor(mergedChain([{ chain: OCR, pages: [0] }, { chain: OCR, pages: [1] }]))], ["layer", "ocr", "ocr"]);
t("capture_text's DOCUMENT-level fact (`CHAIN_LAST`) is still the chain's last derivation step, never `mixed`",
  [chainKindFor(MIXED, CHAIN_LAST), chainKindFor(OVERLAP, CHAIN_LAST), chainKindFor(LAYER, CHAIN_LAST)],
  ["ocr", "ocr", "layer"]);
/* D-710: the shapes 591ecfa6's arms did not reach. */
t("D-710: an office unit whose chain has one kind reads that kind — a conversion then its layer is one reading",
  chainKindFor([{ step: "convert", engine: "google-drive", format: "odt" }, { step: "layer" }]), "layer");
t("D-710: an unscoped step LAST read every page last, so the whole document reads it",
  chainKindFor([...MIXED, { step: "ai", engine: "m", version: "1" }]), "ai");
t("D-710: an unscoped step BEFORE the parts leaves pages only it read uncounted — undetermined, never the parts' `ocr`",
  chainKindFor([{ step: "layer" }, ...mergedChain([{ chain: OCR, pages: [1] }, { chain: OCR, pages: [2] }])]), null);
t("an UNSCOPED chain answers every page alike, so a one-provenance document reads as it always did",
  [chainKindFor(OCR, { page: 7 }), chainKindFor(LAYER, { page: 0 })], ["ocr", "layer"]);
t("UNDETERMINED, stated as null: a page no step covers, a step of no known kind, no chain",
  [chainKindFor(MIXED, { page: 9 }), chainKindFor([{ step: "nope" }], { page: 0 }), chainKindFor(null)],
  [null, null, null]);
t("an extent this module cannot read, met before a covering step, could cover the page: undetermined",
  chainKindFor([{ step: "layer", extent: { kind: "pages", pages: [0] } },
                { step: "ocr", engine: "t", version: "1", confidence: { basis: "none" }, extent: { kind: "rows" } }],
               { page: 0 }), null);

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
let mf = new Miniflare(opts(OLD_SCHEMA));
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
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${id}`,
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

console.log("\n--- 2. a store created BEFORE REC-104 migrates, and its rows answer ---");
const DOC_OCR = "INFO-2026-9104-ocr", DOC_LAYER = "INFO-2026-9104-layer", DOC_BARE = "INFO-2026-9104-bare";
await promoteInfo(DOC_OCR); await promoteInfo(DOC_LAYER); await promoteInfo(DOC_BARE);
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
/* CORRECTED BY D-686, NOT EXEMPTED: this asserted the column arrived GENERATED (hidden from
   `table_info`). D-686 makes it a plain column written at mint, so it arrives visible, and the
   rows' values are written by the recompute rather than by the engine. */
t("and adds it as a PLAIN column (D-686) — visible to table_info, `hidden` 0 in table_xinfo",
  [((await raw("PRAGMA table_info(content)")).rows || []).some((r) => r.name === "chain_kind"),
   ((await raw("PRAGMA table_xinfo(content)")).rows || []).find((r) => r.name === "chain_kind")?.hidden],
  [true, 0]);
t("the rows the store ALREADY HELD carry their kind, recomputed by chainKindFor",
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
 * D-686 — A STORE CREATED UNDER REC-104'S GENERATED COLUMN, holding a MIXED document's rows.
 * ================================================================== */
console.log("\n--- 2b. a store created BEFORE D-686 (REC-104's generated column) migrates, per unit ---");
mf = new Miniflare(opts(GEN_SCHEMA));
const DOC_MIX_OLD = "INFO-2026-9686-mixed-legacy";
await promoteInfo(DOC_MIX_OLD);
const genCol = ((await raw("PRAGMA table_xinfo(content)")).rows || []).find((r) => r.name === "chain_kind");
t("ARMED: the store booted on REC-104's schema holds chain_kind as a GENERATED column", (genCol?.hidden ?? 0) > 0, true);
const LEGACY = [["m-page0", '{"kind":"pdf-page","page":0,"rect":null}', "page 1"],
                ["m-page2", '{"kind":"pdf-page","page":2,"rect":null}', "page 3"],
                ["m-doc", '{"kind":"document"}', "the whole document"]];
for (const [id, extent, ref] of LEGACY) {
  const w = await raw(INS, id, "sha-mixed-legacy", DOC_MIX_OLD, JSON.parse(extent).kind, extent, ref,
                      JSON.stringify(MIXED), null, 3, "plane", NOW);
  if (!w.ok) throw new Error(`legacy insert ${id}: ${w.error}`);
}
const kinds = async () => ((await raw("SELECT content_id, chain_kind FROM content ORDER BY content_id")).rows || [])
  .map((r) => `${r.content_id}=${r.chain_kind}`);
t("ARMED: under REC-104 the TEXT-LAYER page's unit reads `ocr` — the defect, present before the migration",
  await kinds(), ["m-doc=ocr", "m-page0=ocr", "m-page2=ocr"]);

await mf.setOptions(opts(null));            // same storage, the CURRENT schema

const plain = ((await raw("PRAGMA table_xinfo(content)")).rows || []).filter((r) => r.name === "chain_kind");
t("the reboot REPLACES the generated column with a plain one — one column, `hidden` 0",
  plain.map((r) => r.hidden), [0]);
t("every row is RECOMPUTED per unit: the text-layer page reads `layer`, the OCR'd page `ocr`, the whole document `mixed`",
  await kinds(), ["m-doc=mixed", "m-page0=layer", "m-page2=ocr"]);
t("and the index the filter seeks is back on the new column",
  ((await raw("SELECT name FROM sqlite_master WHERE type='index' AND name='content_chain_kind'")).rows || []).length, 1);
t("THROUGH THE OP: `content:layer` now names the mixed document, by its text-layer page",
  await ids("content:layer"), [DOC_MIX_OLD]);
/* THE RECOMPUTE RUNS ONCE. A sentinel written after the migration must survive a second boot: a
   recompute on every boot would be a full-table rewrite per cold start, and the guard (`hidden`) is
   what prevents it. */
await raw("UPDATE content SET chain_kind='typed' WHERE content_id='m-doc'");
await mf.setOptions(opts(null));
t("a SECOND boot does not recompute — the converted store is left as it is",
  await kinds(), ["m-doc=typed", "m-page0=layer", "m-page2=ocr"]);
await mf.dispose();

/* ==================================================================== 3
 * D-686's ACCEPTS-WHEN, THROUGH THE OP, on a store created today.
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
const promoteRead = async (id, captureSha, chain, pages = null) => {
  const text = infoMd(id);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_calendar", reader_version: 1, found: false, at: NOW,
               entities: [], facts: {}, text_source: chain },
    /* D-710: units, so the document's `capture_text` rows are written and their column can be read. */
    ...(pages ? { text_units: pages.map((text, i) => ({ extent: { kind: "pdf-page", page: i, rect: null }, seq: i, text })) } : {}),
  }] });
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260925T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [{ path: `snapshots/${id}.bin`, sha256: captureSha, encoding: "binary", bytes: 10 }] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 500)}`);
};
const DOC_MIX = "INFO-2026-9686-mixed", DOC_OVER = "INFO-2026-9686-overlap";
await promoteRead(DOC_MIX, sha("d686-mixed-bytes"), MIXED, ["page zero", "page one", "page two"]);
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
const labelled = async (q) => (await rowsOf(q)).filter((r) => minted[r.content_id])
  .map((r) => `${minted[r.content_id]}=${r.chain_last}`).sort();
const LABELS = await labelled("has:content");
console.log(`    units: ${LABELS.join(" · ")}`);
t("a TEXT-LAYER page's unit reads `layer` on a partitioned mixed document (D-686's accepts-when)",
  LABELS.filter((x) => x.startsWith("mix.page0")), ["mix.page0=layer"]);
t("and on D-635's overlapping parts, a page only the layer read reads `layer`",
  LABELS.filter((x) => x.startsWith("over.page0")), ["over.page0=layer"]);
t("an OCR'd page's unit reads `ocr`, and so does the page both parts read (the part appended last)",
  LABELS.filter((x) => /page2/.test(x)), ["mix.page2=ocr", "over.page2=ocr"]);
t("the whole-document unit of a mixed document reads `mixed` (BOB #35 09:35Z)",
  LABELS.filter((x) => /\.doc=/.test(x)), ["mix.doc=mixed", "over.doc=mixed"]);
{
  /* D-710: capture_text KEEPS the document-level fact (BOB #35 09:05Z) — driven through the op, not only as
     a pure function: its writer asks `CHAIN_LAST`, so a mixed document's passage rows read the last step. */
  const ct = await raw("SELECT chain_kind, COUNT(*) AS n FROM capture_text WHERE bundle_id=? GROUP BY chain_kind", DOC_MIX);
  t("ARMED + KEPT: the mixed document's three capture_text rows read the chain's last step, `ocr`, never `mixed`",
    (ct.rows || []).map((r) => `${r.chain_kind}:${r.n}`), ["ocr:3"]);
}
t("THROUGH THE SEARCH: `content:mixed` is a word, and names each mixed document by its whole-document unit",
  await ids("content:mixed"), [DOC_MIX, DOC_OVER].sort());
t("THROUGH THE SEARCH: `content:layer` and `content:ocr` BOTH name each mixed document",
  [await ids("content:layer"), await ids("content:ocr")],
  [[DOC_MIX, DOC_OVER].sort(), [DOC_MIX, DOC_OVER].sort()]);
/* The cap and the kind are asked of ONE target (`unitTargetOf`), so they cannot describe different
   pages: a text-layer page is undetermined (its layer is unmeasured), the OCR-only page is the engine's C. */
const caps = (await rowsOf("has:content")).filter((r) => minted[r.content_id] && minted[r.content_id].startsWith("mix."))
  .map((r) => `${minted[r.content_id]}=${r.derivation_cap}`).sort();
t("and the unit's cap is asked of the same page as its kind",
  caps, ["mix.doc=null", "mix.page0=null", "mix.page2=C"]);

/* THE PLAN, on workerd's engine, for the statement a member actually produces — compiled here and not
   typed. A seek on the index is the evidence the question is answered off the column. */
{
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
