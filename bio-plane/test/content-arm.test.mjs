/* NEGATIVE CONTROL: the arms live in `test/nc-rec90.mjs` and are re-run in one step with `node test/nc-rec90.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by `cmp` with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work). Declared before arming, and every one RUN — results in this file's own RESULTS line and in the item's report. (a) `baseline` — nothing armed; MUST be green, and it is the row that distinguishes six-arms-working from six-arms-broken. (b) `pred` — in `src/query.mjs` `meaningWhere`, ignore the sub-field's own predicate (`if (false && sub && ...)`), so every non-ordinary filter degrades to `column <cmp> ?`: sections 4's `minted`, `cap=undetermined`, `chain` and `cited` arms MUST FAIL and the ordinary `kind` arm MUST STAY GREEN — the arm is what distinguishes a registry that carries four new predicates from one that carries four new NAMES. (c) `citeddrift` — in `src/query.mjs` make `rowComputed.cited` ask only `inquiry_basis` and not `inquiry_basis_version_legs`, which is the ONE-DEFINITION-TWO-CONSUMERS property stated at `citedExists`: the assertion that the `cited` COLUMN agrees with the `content:cited` FILTER row for row MUST FAIL, and every other section MUST STAY GREEN. (d) `nojoin` — in `src/query.mjs` delete `rows=leg`'s `rowJoin`, so `extent_kind` and `ref` leave the leg rows: section 6's three-column arms MUST FAIL BY NAME and section 5's `rows=content` arms MUST STAY GREEN, which is what shows the two row shapes are independent. (e) `levelsblind` — in `src/store.mjs` `#meaningLevels`, answer `internet` as `{ state: "COUNTED", documents: 0 }` instead of UNDETERMINED: section 7's arm that the unreachable level is NAMED AS UNDETERMINED MUST FAIL — this is CLAUDE.md's sparse rule and the statement IS the assertion, so an arm that left it green would mean the suite is testing something else. (f) `gateloss` — in `src/query.mjs` the `levels` projection takes `1=1` instead of the compiled predicate: `Store#runQuery`'s D-15 throw MUST fire and the op MUST answer `ok:false`, never an ungated tally — a third statement that could run without the gate would be the leak this projection is most able to produce. (g) OVER-STRICTNESS, section 10 and held open under every arm above: five correct spellings this implementation was not written around — `concerns:ENT<1` still a bare entity value and not a refusal, `resolves:>=B` on the bare field unchanged, `content:kind=pdf-page` as well as `content:pdf-page`, `content:minted=MEM-x` as a literal minter id beside the three class words, and `has:content` — all MUST PASS. */
/* RESULTS, run 2026-09-15 by the REC-90 worker, each arm ALONE, every restore byte-identical by sha256 AND cmp (query.mjs 109,363 bytes sha256 9f94c54927e8…; store.mjs 2,096,015 bytes sha256 348c0b0f349c… each time): baseline 107/0 green · pred 92/15 · citeddrift 106/1 · nojoin 104/3 · levelsblind 106/1 · gateloss 69/38 · qualified 100/7 — ALL SEVEN AS DECLARED on the final tree. **ONE CAME BACK WRONG ON THE FIRST RUN AND IS RECORDED RATHER THAN SMOOTHED: `citeddrift` was GREEN (107/0), and the finding was about the ARM'S CORPUS rather than about the plane.** The arm makes the `cited` column ask only the live leg table; the fixture had NO version legs at all, so the full definition and the crippled one agreed FOR FREE — WORKER.md's *arms that could never have been honoured*. The fixture now promotes a basis VERSION whose only leg rests on `DOC_VER`, a document no live leg cites, and the arm fails by name. That fixture also bought two assertions the suite did not have: that a document cited only by a recorded version IS cited, and that no live leg names it. **And `gateloss` fails 38 rather than its 2 declared, which is correct and is the point**: the D-15 throw fires, the op answers ok:false, and every ARMED corpus-floor assertion goes red with it — a suite whose fixture reads empty reports its own blindness instead of scoring zero. */

/* REC-90 / CONTENT-SEARCH-DESIGN.md §4.2 — THE `content:` ARM, `rows=content`,
 * AND THE THREE COLUMNS ON `rows=leg`.
 *
 * WHAT IS BEING ASSERTED, and every runtime arm THROUGH `op=meaningrows` and
 * `op=search` rather than against the store, because a store-level test and a
 * passing battery are not evidence that a caller can reach the feature
 * (`op=invitelook` shipped with a ReferenceError while 1,276 assertions passed):
 *
 *   1. THE ARM EXISTS AND ITS VOCABULARY IS DRIVEN, never typed. `kind` comes
 *      from `CONTENT_EXTENT_KINDS` and `chain` from `STEP_KINDS`, so a kind or a
 *      step added to either is askable the same day. The `leg:` arm's first
 *      version hand-typed three grade sources against a live five and every test
 *      written from the same copy passed; this suite compares the arm's
 *      vocabulary against the EXPORTS rather than against a list.
 *
 *   2. THE MEMBER'S STRING IS NEVER THE SQL. Four of the six sub-fields carry
 *      their own predicate (`sub.pred`) rather than compiling to
 *      `column <cmp> ?`, which is new machinery — so the property the rest of
 *      this compiler has is PINNED here rather than argued: a battery of hostile
 *      values compiles to BYTE-IDENTICAL SQL with only `args` moving.
 *
 *   3. EVERY FILTER ANSWERS THE QUESTION IT NAMES, driven over a corpus built to
 *      contain both halves of each — `content:stale` against rows that are not,
 *      `content:machine` against rows minted by the plane and by a member,
 *      `content:uncited` against rows that ARE cited. A filter measured only
 *      against rows that match it is measuring nothing.
 *
 *   4. UNDETERMINED IS ITS OWN VALUE AND THE CONSEQUENCE IS DRIVEN. `cap=undetermined`
 *      finds the NULL rows; `cap<=B` does NOT find them, because NULL compares to
 *      nothing — and the two together are what stop a reader taking "B or better"
 *      for "not worse than B".
 *
 *   5. THE FOUR-LEVEL STATEMENT. CLAUDE.md: absence at one level is not evidence
 *      of absence at the next, and saying WHICH is a first-class obligation. An
 *      empty `content:` answer over documents that hold no content row at all is
 *      driven, and so is an empty answer with no document in scope — the two must
 *      be distinguishable BY THE ENVELOPE ALONE. The level this read cannot see
 *      is NAMED as undetermined rather than omitted.
 *
 *   6. SEARCHING MINTS NOTHING (§8's control, DEC-24): the content row count is
 *      unchanged after every query this suite runs.
 *
 * WHAT THIS SUITE DOES NOT CLAIM, and the first one is a finding rather than a
 * gap in the suite:
 *
 *   - REC-36's WITHHOLD RULE CANNOT BE STAGED FOR THIS ARM, and the reason is
 *     structural rather than a fixture I did not build. `viewerPredicate`'s
 *     participant clause fences exactly one thing — `b.object_type <> 'project'`
 *     — and EVERY content row hangs off an `information` bundle, because
 *     `contentMint` refuses a non-document target BY NAME (NOT_A_DOCUMENT,
 *     DEC-21) and `promote`'s projection only mints for information targets. So
 *     there is no content row a participant gate can remove. Section 8 measures
 *     that rather than asserting it: it drives an uninvited member and a
 *     participant through the SAME statement shape and shows the `content` arm
 *     answers identically WHILE the `concerns` arm on the same call shape does
 *     not — which is what proves the gate is live rather than absent. An
 *     assertion that a row was withheld here would pass over an empty set, which
 *     is the failure this project has measured three times.
 *   - IT DOES NOT MEASURE THE INDEX DECISION. That is
 *     `test/content-index-probe.mjs` and `MEASUREMENTS.md`; this suite asserts
 *     only that the shipped indexes are DECLARED, so a later edit that removes
 *     one fails here rather than silently returning the two-second read.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { compile, MEANING, meaningVocabulary } from "../src/query.mjs";
import { CONTENT_EXTENT_KINDS, CONTENT_MINTED_BY_PLANE,
         MACHINE_CLASS_PREFIX } from "../checks/bio-checks.mjs";
import { STEP_KINDS } from "../src/textchain.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const IDX = SRC("index.mjs");
const QUERY_SRC = readFileSync(SRC("query.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r90", MEMBER_TOKEN: "mem-r90", PROBE_TOKEN: "prb-r90",
              AI_TOKEN: "ai-r90", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-r90") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-r90") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());
const rows = async (qs, tok = "mem-r90") => get("meaningrows", qs, tok);
const arm = async (q, tok = "mem-r90") =>
  (await get("search", `q=${encodeURIComponent(q)}&mode=ids`, tok))?.ids ?? [];

const M = "class:member";
const NOW = "2026-09-15T00:00:00Z";
const LATER = "2026-09-15T01:00:00Z";

/* ==================================================================== 1
 * THE REGISTRY: THE ARM EXISTS, AND ITS VOCABULARY IS DRIVEN.
 * ================================================================== */
console.log("\n--- 1. the arm, and the two vocabularies it does not own ---");
{
  t("`content` is an arm on the ONE compiler's registry, keyed on the bundle like every other",
    [MEANING.content?.table, MEANING.content?.key], ["content", "bundle_id"]);
  /* DRIVEN, NOT TYPED. The `leg:` arm's first version typed the three grade
     sources a schema COMMENT named while the live vocabulary had five, and a
     hand copy of a vocabulary is this repository's most-measured instrument
     defect. These two assertions are the whole reason the arm imports. */
  t("`kind`'s vocabulary IS `CONTENT_EXTENT_KINDS`, not a copy of it",
    MEANING.content.sub.kind.vocab, Object.keys(CONTENT_EXTENT_KINDS));
  t("`chain`'s vocabulary IS `STEP_KINDS`, not a copy of it",
    MEANING.content.sub.chain.vocab, Object.keys(STEP_KINDS));
  /* `dom` is refused BY NAME until CONTENT-HTML produces a producer (C-45.4),
     and it is absent from the map — so its absence here FALLS OUT of driving the
     map rather than being a second decision that could drift from the first. */
  t("and `dom` is not a word this arm accepts — it falls out of the map, never listed here",
    MEANING.content.sub.kind.vocab.includes("dom"), false);
  t("no bare word of the content arm is claimed by two sub-fields",
    meaningVocabulary().content.ambiguous, []);
  t("the arm declares the LEVEL it answers at, in Part II section 14.3's vocabulary",
    [MEANING.content.level, MEANING.leg.level, MEANING.resolves.level],
    ["content", "meaning", "meaning"]);
  /* The identity must be the table's own PRIMARY KEY or paging repeats or loses
     rows. `meaningread.test.mjs` asserts this for every arm off schema.mjs; here
     it is the literal, because a wrong identity on THIS arm is what this item
     would have shipped. */
  t("the grain's identity is the table's own PRIMARY KEY",
    [MEANING.content.identity, /content_id\s+TEXT PRIMARY KEY/.test(SCHEMA_SRC)],
    [["content_id"], true]);
  t("the six sub-fields section 4.2 names are the six the arm carries",
    Object.keys(MEANING.content.sub).sort(),
    ["cap", "chain", "cited", "kind", "minted", "stale"]);
}

/* ==================================================================== 2
 * THE MEMBER'S STRING IS NEVER THE SQL.
 * ================================================================== */
console.log("\n--- 2. four new predicates, and not one of them interpolates the member ---");
{
  /* THE PROPERTY, PINNED RATHER THAN ARGUED. `sub.pred` is new machinery that
     emits a WHERE fragment, so "the column comes from the registry and the value
     is an argument" stops being obvious and becomes something to measure. If any
     pred ever interpolated its value, these statements would differ from each
     other — they cannot, because the only thing that varies is the value. */
  /* EVERY VALUE HERE IS OUTSIDE EVERY SUB-FIELD'S VOCABULARY AND CARRIES NO
     SPACE, and both constraints were found by RUNNING this and reading the
     failure rather than by reasoning — a control that came back wrong is a
     finding about the ARM and is recorded rather than smoothed:
       - a VOCABULARY word legitimately produces different SQL (`minted=plane` is
         an equality, `minted=machine` is a LIKE — that IS the design), so a
         hostile set containing one asserts the opposite of the rule;
       - a SPACE splits the member's string into two TOKENS upstream in the
         parser, so `content:kind=f g` is two atoms and its statement differs for
         a reason that has nothing to do with this property. */
  const HOSTILE = ["a'OR'1'='1", "b\";DROP-TABLE-content;--", "c)UNION-SELECT-1(",
                   "d\\", "e%_", "f/*x*/"];
  for (const sub of ["kind", "minted", "cap", "chain", "cited"]) {
    const sqls = new Set(), argSets = [];
    for (const v of HOSTILE) {
      const st = compile({ q: `content:${sub}=${v}`, viewer: M, facets: [] }).statements.count();
      sqls.add(st.sql); argSets.push(st.args);
    }
    t(`\`content:${sub}=\` — six hostile values, ONE statement: the SQL does not move`, sqls.size, 1);
    t(`\`content:${sub}=\` — and the value travelled as an ARGUMENT, differing where the SQL did not`,
      new Set(argSets.map((a) => JSON.stringify(a))).size, HOSTILE.length);
  }
  t("no compiled content statement carries a raw quote from the member's string",
    ["a' OR 1=1 --", "b\"; DROP TABLE content; --"].filter((v) =>
      compile({ q: `content:kind=${v}`, viewer: M, facets: [] }).statements.count().sql.includes("DROP TABLE")), []);
  /* And the three arms that existed before this item compile through the path
     they always did — `pred` is opt-in per sub-field, so nothing about `leg:`
     moved. Structural, because a behavioural assertion cannot see "same path". */
  t("the three pre-existing arms declare NO predicate of their own — additive, not a rewrite",
    ["leg", "resolves", "concerns"].flatMap((a) =>
      Object.entries(MEANING[a].sub).filter(([, s]) => s.pred).map(([n]) => `${a}.${n}`)), []);
}

/* ==================================================================== 3
 * A NAMED SUB-FIELD, COMPARED — THE DEFECT THIS ITEM MET ON THE WAY IN.
 * ================================================================== */
console.log("\n--- 3. `leg:grade>=B` and `content:cap<C`: a named sub-field with a comparison ---");
{
  /* MEASURED ON `origin/main` AT 6e88e35 BEFORE THIS ITEM CHANGED ANYTHING:
     `leg:grade>=B` compiled to `grade = 'GRADE>=B'` — an equality no row can
     satisfy, with NO warning, on every arm, since PL-8. The sub-field split was
     `indexOf("=")` and `>=` contains an `=`. It is corrected here because
     section 4.2's own worked example (`content:chain=ocr content:cap<C`) cannot
     compile without it. */
  const frag = (q) => {
    const st = compile({ q, viewer: M, facets: [] }).statements.count();
    const i = Math.max(st.sql.indexOf("FROM content"), st.sql.indexOf("FROM inquiry_basis"),
                       st.sql.indexOf("FROM resolutions"));
    return [i < 0 ? "(no arm)" : st.sql.slice(i, st.sql.indexOf(")", i)).replace(/\s+/g, " ").trim(), st.args];
  };
  t("`content:cap<C` compiles to a COMPARISON on the cap column, which it did not before",
    frag("content:cap<C"), ["FROM content WHERE derivation_cap < ?", ["C"]]);
  t("`content:cap<=B` likewise — the `<=` whose `=` was eating the sub-field name",
    frag("content:cap<=B"), ["FROM content WHERE derivation_cap <= ?", ["B"]]);
  t("AND THE FIX REACHES THE ARMS THAT SHIPPED WITH THE DEFECT: `leg:grade>=B`",
    frag("leg:grade>=B"), ["FROM inquiry_basis WHERE grade >= ?", ["B"]]);
  t("and `resolves:grade<=B`", frag("resolves:grade<=B"), ["FROM resolutions WHERE grade <= ?", ["B"]]);
  /* OVER-STRICTNESS, and it is the half that decides whether the fix is a fix or
     a new refusal: the qualified form is taken ONLY when the name IS a sub-field
     of this arm, so a bare value that merely CONTAINS a comparison character is
     still a bare value. */
  t("OVER-STRICT ARM: `concerns:ENT<1` is still a bare entity value, not a refusal",
    frag("concerns:ENT<1"), ["FROM resolutions WHERE entity_id = ?", ["ENT<1"]]);
  t("OVER-STRICT ARM: `resolves:>=B` on the BARE field is untouched",
    frag("resolves:>=B"), ["FROM resolutions WHERE grade >= ?", ["B"]]);
  t("OVER-STRICT ARM: `leg:ground=*` presence is untouched",
    frag("leg:ground=*"), ["FROM inquiry_basis WHERE ground IS NOT NULL AND ground <> ''", []]);
  /* A comparison against nothing is DROPPED WITH A WARNING — the visible
     direction this function already chose twice. */
  const w = compile({ q: "leg:grade>=", viewer: M, facets: [] });
  t("a comparison against nothing is dropped with a warning, never compiled to a predicate nothing satisfies",
    [w.meaningArms.length, w.warnings.some((x) => /compares grade against nothing/.test(x))], [0, true]);
}

/* ==================================================================== 4
 * THE CORPUS — built so every filter has BOTH halves to separate.
 * ================================================================== */
console.log("\n--- 4. the corpus: content rows with both halves of every filter ---");

const memberSession = async (id) => {
  const add = await post("memberadd", { memberId: id, cover: `cover for ${id}`, role: "admin",
                                        capabilities: ["contribute"] }, "adm-r90");
  const en = await post("enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = await post("login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${id}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
const MINA = await memberSession("mina");
const NOAH = await memberSession("noah");

const infoMd = (id, body = "A captured document.") => ["---",
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
  "---", "", "## Summary", "", body, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
      ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : []),
      ...(l.eref ? [`    extent_ref: "${l.eref}"`] : [])])]
  : [];
/* A BASIS VERSION with its own leg — the ONLY way `inquiry_basis_version_legs`
   gets a row, because `op=promote` is the single write site for that table
   (`versions.test.mjs` pins the count at one). This suite grew it because its
   OWN NEGATIVE CONTROL came back green without it: the `citeddrift` arm makes
   the `cited` column ask the live leg table only, and on a corpus with no
   version legs the two definitions agree FOR FREE. An arm that could never have
   been honoured is a finding about the arm, and the fixture is the fix. */
const versionLines = (versions) => !versions.length ? [] : [
  "basis_versions:",
  ...versions.map((v) => [`  - name: "${v.name}"`, `    description: "${v.name} of this basis"`,
                          `    state: suggested`, `    relationship: and`, `    author: mina`, `    at: "${NOW}"`].join("\n")),
  /* C-25.5: a version CARRIES its ground partition and the partition is TOTAL —
     a leg nobody placed beside branches somebody did is a relationship the record
     would have to guess at. So the ground is declared and every leg names it. */
  "basis_version_grounds:",
  ...versions.map((v) => [`  - version: "${v.name}"`, `    ground: charter`,
                          `    asserted_by: mina`, `    at: "${NOW}"`].join("\n")),
  "basis_version_legs:",
  ...versions.flatMap((v) => v.legs.map((l) =>
    [`  - version: "${v.name}"`, `    target: ${l.target}`, `    role: supports`,
     `    ground: charter`].join("\n"))),
];
const inquiryMd = (id, { refs = [], legs = [], versions = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
                  : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next cycle",
  "    description: The adopted budget may restate the basis.",
  ...legLines(legs),
  ...versionLines(versions),
  "---", "", "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { register = [], reading = null, tok = "mem-r90" } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260915T${String(200000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register }, tok);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};
const readingOf = (captureSha, chain) => ({
  capture: { sha256: captureSha, encoding: "binary", bytes: 10 },
  reading: { content_type: "meeting_calendar", reader_version: 1, found: false,
             at: NOW, entities: [], facts: {},
             ...(chain === undefined ? {} : { text_source: chain }) } });
const ocrChain = (pages, cap) => [
  { step: "pixels", extent: { kind: "pages", pages } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap, confidence: { basis: "none" },
    extent: { kind: "pages", pages } }];
const layerChain = () => [{ step: "layer" }];

/* DOC_OCR — an OCR'd document with a page set and a measured cap C. Its content
   rows are the `chain=ocr`, `cap=C` half of every comparison below. */
const DOC_OCR = "INFO-2026-9000-ocr";
const SHA_OCR = sha("rec90-ocr-bytes");
await promote(DOC_OCR, infoMd(DOC_OCR), "information", {
  reading: readingOf(SHA_OCR, ocrChain([0, 1, 2], "C")),
  register: [{ path: "snapshots/a.bin", sha256: SHA_OCR, encoding: "binary", bytes: 10 }] });

/* DOC_LAYER — a text-layer document. `layer` is a DERIVATION with no cap of its
   own, so its rows are `chain=layer` with the cap UNDETERMINED: the two halves
   of the cap question in one corpus. */
const DOC_LAYER = "INFO-2026-9000-layer";
const SHA_LAYER = sha("rec90-layer-bytes");
await promote(DOC_LAYER, infoMd(DOC_LAYER), "information", {
  reading: readingOf(SHA_LAYER, layerChain()),
  register: [{ path: "snapshots/b.bin", sha256: SHA_LAYER, encoding: "binary", bytes: 10 }] });

/* DOC_BARE — captured, never read: no chain at all, which is `chain=undetermined`
   and NOT the same fact as a chain whose cap is unknown. */
const DOC_BARE = "INFO-2026-9000-bare";
const SHA_BARE = sha("rec90-bare-bytes");
await promote(DOC_BARE, infoMd(DOC_BARE), "information", {
  reading: readingOf(SHA_BARE, undefined),
  register: [{ path: "snapshots/c.bin", sha256: SHA_BARE, encoding: "binary", bytes: 10 }] });

/* DOC_NONE — a document with NO content row at all. It is what makes the
   four-level statement measurable: a scope containing it is a scope where
   "nothing matched" and "nothing has been cited here" are different sentences. */
const DOC_NONE = "INFO-2026-9000-uncited-doc";
await promote(DOC_NONE, infoMd(DOC_NONE, "A document nobody has cited."), "information");

/* DOC_VER — cited by a BASIS VERSION's leg and by no live leg. It is what makes
   `content:cited`'s "BOTH leg tables" rule measurable: a passage a RECORDED
   VERSION of a basis rests on is cited, and an answer that asked only the live
   table would report it as unused. */
const DOC_VER = "INFO-2026-9000-versioned";
const SHA_VER = sha("rec90-ver-bytes");
await promote(DOC_VER, infoMd(DOC_VER, "Cited only by a recorded version of a basis."), "information", {
  reading: readingOf(SHA_VER, layerChain()),
  register: [{ path: "snapshots/e.bin", sha256: SHA_VER, encoding: "binary", bytes: 10 }] });

/* The inquiry whose legs MINT the plane's rows — one whole-document leg and one
   page leg on the OCR'd document, plus a whole-document leg on the layer one —
   and one recorded VERSION whose only leg rests on DOC_VER. */
const INQ = "INQ-2026-9000-basis";
const rInq = await promote(INQ, inquiryMd(INQ, { refs: [DOC_OCR, DOC_LAYER, DOC_VER],
  legs: [{ target: DOC_OCR },
         { target: DOC_OCR, kind: "pdf-page", page: 1, eref: "page 2, the transfer table" },
         { target: DOC_LAYER }],
  versions: [{ name: "v1", legs: [{ target: DOC_VER }] }] }), "inquiry");
t("the basis minted three content rows — two grains on one document, and one on another",
  (rInq.content || []).map((c) => c.extent_kind), ["document", "pdf-page", "document"]);
const PLANE_DOC = rInq.content[0].content_id;
const PLANE_PAGE = rInq.content[1].content_id;
const PLANE_LAYER = rInq.content[2].content_id;

/* A MACHINE marks a passage citable and NOBODY CITES IT — SK-7/SK-8's whole
   shape, and the `uncited` half of the corpus. The credential is MINTED BY A
   MEMBER and scoped to this one act (SK-7): the AI_TOKEN binding alone is not a
   caller, which is the fence and not an inconvenience. */
const cred = await post("aicredentialmint",
  { tokenId: "extractor", principalKind: "member", principalMember: "mina", taskScope: "extract",
    writes: ["contentmint"], note: "the extraction agent: marks passages citable" }, MINA);
t("a member mints an `ai` credential scoped to the mint and nothing else",
  [cred.ok, cred.credential?.writes], [true, ["contentmint"]]);
const mMint = await post("contentmint",
  { bundleId: DOC_LAYER, extent: { kind: "pdf-page", page: 2 } }, cred.token);
t("a MACHINE credential marks a passage citable, and the row is minted",
  [mMint.ok, String(mMint.minted_by || "").startsWith(MACHINE_CLASS_PREFIX)], [true, true]);
const MACHINE_ROW = mMint.content_id;

/* A MEMBER marks one citable through her own session — the third minter class,
   and the one a class predicate has to get right by NEGATION rather than by a
   pattern for a member id. */
const uMint = await post("contentmint",
  { bundleId: DOC_BARE, extent: { kind: "document" } }, MINA);
t("a MEMBER marks a passage citable through her session, and the row records HER",
  [uMint.ok, uMint.minted_by], [true, "mina"]);
const MEMBER_ROW = uMint.content_id;

/* NOW MOVE THE CHAIN on the OCR'd document: re-read under a different engine.
   REC-82's rule — the rows are not rewritten and not deleted; they go stale and
   still resolve. This is the ONLY way the corpus gets a stale row. */
await promote(DOC_OCR, infoMd(DOC_OCR, "Re-read under a better engine."), "information", {
  reading: readingOf(SHA_OCR, ocrChain([0, 1, 2], "B")),
  register: [{ path: "snapshots/a.bin", sha256: SHA_OCR, encoding: "binary", bytes: 10 }] });

const countContent = async () => (await get("stats", "", "adm-r90"))?.contentStale;
const allRows = async (tok = "mem-r90") => (await rows(`rows=content&q=${encodeURIComponent("has:content")}`, tok))?.rows ?? [];
const CORPUS = await allRows();
console.log(`  corpus: ${CORPUS.length} content rows over `
  + `${new Set(CORPUS.map((r) => r.bundle_id)).size} documents · `
  + `kinds ${[...new Set(CORPUS.map((r) => r.extent_kind))].sort().join("/")} · `
  + `minters ${[...new Set(CORPUS.map((r) => r.minted_by))].sort().join("/")} · `
  + `stale ${CORPUS.filter((r) => r.stale).length} · cited ${CORPUS.filter((r) => r.cited).length}`);
/* FLOOR THE CORPUS. A headline assertion passing over an empty fixture is a
   failure this project has measured three times, so every half of every filter
   is asserted to have a population BEFORE anything is measured against it. */
t("ARMED: the corpus holds rows of BOTH grains",
  [CORPUS.some((r) => r.extent_kind === "document"), CORPUS.some((r) => r.extent_kind === "pdf-page")],
  [true, true]);
t("ARMED: the corpus holds rows from all THREE minter classes",
  [CORPUS.some((r) => r.minted_by === CONTENT_MINTED_BY_PLANE),
   CORPUS.some((r) => String(r.minted_by).startsWith(MACHINE_CLASS_PREFIX)),
   CORPUS.some((r) => r.minted_by === "mina")], [true, true, true]);
t("ARMED: the corpus holds stale rows AND current ones — a filter measured against one half measures nothing",
  [CORPUS.some((r) => r.stale === 1), CORPUS.some((r) => r.stale === 0)], [true, true]);
t("ARMED: the corpus holds cited rows AND uncited ones",
  [CORPUS.some((r) => r.cited === 1), CORPUS.some((r) => r.cited === 0)], [true, true]);
t("ARMED: the corpus holds a determined cap AND an undetermined one",
  [CORPUS.some((r) => r.derivation_cap != null), CORPUS.some((r) => r.derivation_cap == null)], [true, true]);
t("ARMED: the corpus holds a document with NO content row at all (the four-level arm needs one)",
  (await arm(`id:${DOC_NONE}`)).length, 1);

/* ==================================================================== 5
 * EVERY FILTER, THROUGH THE OP.
 * ================================================================== */
console.log("\n--- 5. each filter answers the question it names, and only that question ---");
{
  const idsOf = async (q) => (await arm(q)).sort();
  const rowsOf = async (q) => ((await rows(`rows=content&q=${encodeURIComponent(q)}`))?.rows ?? [])
    .map((r) => r.content_id).sort();

  t("`content:pdf-page` selects the DOCUMENTS holding a cited page, at bundle grain",
    await idsOf("content:pdf-page"), [DOC_LAYER, DOC_OCR].sort());
  t("`content:sheet-cell` selects nothing, because nothing in this corpus is one — an honest empty",
    await idsOf("content:sheet-cell"), []);
  t("`content:kind=pdf-page` is the same question spelled the other way (OVER-STRICT ARM)",
    await idsOf("content:kind=pdf-page"), [DOC_LAYER, DOC_OCR].sort());

  t("`content:stale` names the document whose transcription the record has since replaced",
    await idsOf("content:stale"), [DOC_OCR]);
  t("`content:current` names the ones whose citations still stand under the chain they were made under",
    await idsOf("content:current"), [DOC_BARE, DOC_LAYER, DOC_VER].sort());
  const staleIds = await idsOf("content:stale"), currentIds = await idsOf("content:current");
  t("and the two are DISJOINT here — no document in this corpus holds both, so neither arm is "
  + "answering over the other's rows",
    staleIds.filter((x) => currentIds.includes(x)), []);

  /* THE THREE MINTER CLASSES, AT BUNDLE GRAIN — which is what an ARM answers.
     `content:machine` says WHICH DOCUMENTS hold a passage a machine marked
     citable, never WHICH PASSAGE, exactly as `leg:hunch` says which inquiries
     carry a hunch leg and never which leg. The grain collapse is what keeps the
     gate correct and is stated in the registry's own header. */
  t("`content:machine` names the DOCUMENT holding a machine-marked passage",
    await idsOf("content:machine"), [DOC_LAYER]);
  t("`content:plane` names the documents promote's own projection minted rows in",
    await idsOf("content:plane"), [DOC_LAYER, DOC_OCR, DOC_VER].sort());
  t("`content:member` names the document a MEMBER marked — the class defined by NEGATION, driven",
    await idsOf("content:member"), [DOC_BARE]);
  t("and the three classes COVER the corpus's documents between them",
    [...new Set([...await idsOf("content:machine"), ...await idsOf("content:plane"),
                 ...await idsOf("content:member")])].sort(),
    [DOC_BARE, DOC_LAYER, DOC_OCR, DOC_VER].sort());
  t("`content:minted=mina` is a literal minter id beside the class words (OVER-STRICT ARM)",
    await idsOf("content:minted=mina"), [DOC_BARE]);
  /* AND AT ROW GRAIN THE PREDICATE PARTITIONS THE CORPUS EXACTLY — asserted on
     the COLUMN rather than on the arm, because the arm and the rows answer at
     different grains and conflating them is the error this suite made first (see
     the whole-set assertion in section 6). */
  const klass = (r) => r.minted_by === CONTENT_MINTED_BY_PLANE ? "plane"
                     : String(r.minted_by).startsWith(MACHINE_CLASS_PREFIX) ? "machine" : "member";
  t("at ROW grain the three classes partition the corpus exactly: every row is one of them",
    CORPUS.filter((r) => !["plane", "machine", "member"].includes(klass(r))), []);

  /* UNDETERMINED IS ITS OWN VALUE, AND THE CONSEQUENCE IS DRIVEN. */
  /* UNDETERMINED IS ITS OWN VALUE. Asserted at BUNDLE grain, which is what an arm
     answers, and then on the COLUMN, which is where the row-level truth lives. */
  const undet = await idsOf("content:cap=undetermined");
  t("`content:cap=undetermined` names the documents holding a row whose cap the record does not know",
    undet, [DOC_BARE, DOC_LAYER, DOC_VER].sort());
  const capD = await idsOf("content:cap<=D");
  t("`content:cap<=D` — every letter there is — names only the document with a MEASURED cap",
    capD, [DOC_OCR]);
  t("AND IT DOES NOT REACH THE UNDETERMINED ONES, because NULL compares to nothing. That is the "
  + "whole reason UNDETERMINED is its own value and not a letter",
    capD.filter((x) => undet.includes(x)), []);
  t("on the column: every row is a letter or a NULL, and the two arms are asking about exactly those",
    [CORPUS.filter((r) => r.derivation_cap != null).length > 0,
     CORPUS.filter((r) => r.derivation_cap == null).length > 0], [true, true]);

  t("`content:layer` filters on the chain's LAST STEP",
    await idsOf("content:layer"), [DOC_LAYER, DOC_VER].sort());
  t("`content:ocr` names the OCR'd document and not the text-layer one",
    await idsOf("content:ocr"), [DOC_OCR]);
  t("`content:chain=undetermined` is a DIFFERENT fact from a cap it cannot determine: no chain at all",
    await idsOf("content:chain=undetermined"), [DOC_BARE]);

  t("`content:uncited` names the documents holding a passage no finding rests on",
    await idsOf("content:uncited"), [DOC_BARE, DOC_LAYER].sort());
  t("`content:cited` names the documents holding one that a finding DOES rest on",
    await idsOf("content:cited"), [DOC_LAYER, DOC_OCR, DOC_VER].sort());
  /* THE VERSION-LEG HALF, WHICH IS WHY `citedExists` ASKS BOTH TABLES. DOC_VER is
     cited by a RECORDED VERSION of a basis and by no live leg, and it is in the
     answer. Asking only `inquiry_basis` would report it as UNUSED — the answer
     overclaiming what nothing rests on, which is the direction that makes a
     member delete something a finding needs. THE SUITE'S OWN NEGATIVE CONTROL
     DEMANDED THIS FIXTURE: without a version leg the `citeddrift` arm came back
     GREEN, because the two definitions agree for free on a corpus that has none. */
  t("a document cited ONLY by a recorded VERSION's leg is CITED — both leg tables are asked",
    (await idsOf("content:cited")).includes(DOC_VER), true);
  t("and it is NOT reachable through the live-leg table alone: no live leg names it",
    ((await rows(`rows=leg&q=${encodeURIComponent("has:leg")}`))?.rows ?? [])
      .filter((x) => x.target_id === DOC_VER), []);
  const citedDocs = await idsOf("content:cited"), uncitedDocs = await idsOf("content:uncited");
  t("and the two OVERLAP on DOC_LAYER rather than partitioning — because a document can hold "
  + "both, which is precisely why the question is worth asking at row grain too",
    citedDocs.filter((x) => uncitedDocs.includes(x)), [DOC_LAYER]);

  /* SECTION 4.2's OWN WORKED EXAMPLE, END TO END. */
  t("section 4.2's worked example compiles and answers: `content:ocr content:cap<D` — "
  + "every OCR'd region below cap D",
    (await rowsOf("content:ocr content:cap<D")).length >= 1, true);
  t("and it is a CONJUNCTION rather than either half: it is no wider than either arm alone",
    (await rowsOf("content:ocr content:cap<D")).length
      <= Math.min((await rowsOf("content:ocr")).length, (await rowsOf("content:cap<D")).length), true);
  t("`has:content` asks whether a document holds any content row at all (OVER-STRICT ARM)",
    (await idsOf("has:content")).includes(DOC_NONE), false);
}

/* ==================================================================== 6
 * `rows=content` — THE GRAIN, AND THE TWO COLUMNS A ROW CANNOT STATE ALONE.
 * ================================================================== */
console.log("\n--- 6. rows=content: the grain, and `cited`/`chain_last` ---");
{
  const r = await rows(`rows=content&q=${encodeURIComponent("has:content")}`);
  t("the op answers at content grain and SAYS so in words",
    [r?.ok, r?.arm, r?.table, r?.identity, r?.level],
    [true, "content", "content", ["content_id"], "content"]);
  t("the published grain is section 4.2's own sentence",
    r?.grain, "one content row — one addressable extent of one capture under one chain; "
           + "cited or citable, and it says which");
  t("a returned row's keys ARE the arm's published columns — the vocabulary does not under-report",
    meaningVocabulary().content.rows.columns.filter((c) => !(c in (r?.rows?.[0] ?? {}))), []);
  /* THE GRAIN IS ONE ROW PER CONTENT ROW, asserted rather than reasoned about. */
  t("one row per content row: no id appears twice",
    (r?.rows ?? []).length, new Set((r?.rows ?? []).map((x) => x.content_id)).size);
  t("and `total` agrees with the rows when the page covers the set",
    [r?.total, r?.count], [(r?.rows ?? []).length, (r?.rows ?? []).length]);

  /* `cited` IS THE PROMISE THE GRAIN MAKES — "cited or citable, AND IT SAYS
     WHICH" — so the column must agree with the FILTER row for row. They are one
     definition with two consumers precisely so this can be asserted. */
  /* CROSS-READ, NOT SELF-CONFIRMED. The `cited` column is checked against the
     content ids the LEG ROWS actually carry — a second, independent read over a
     different table — rather than against the `content:cited` filter, which
     answers at BUNDLE grain and would agree for free on a one-document corpus.
     THE FIRST VERSION OF THIS ASSERTION COMPARED IT TO THE FILTER AND FAILED,
     and the failure was the suite's rather than the plane's: the arm selects
     documents and `rows=content` returns the WHOLE content set of each, so an
     UNCITED row of a document that also holds a cited one is correctly in the
     answer with `cited` reading false. That rule is asserted in its own right
     immediately below, because it is doctrine and not an accident. */
  const legRows = (await rows(`rows=leg&q=${encodeURIComponent("has:leg")}`))?.rows ?? [];
  const citedIds = new Set(legRows.map((x) => x.content_id).filter(Boolean));
  t("ARMED: the leg rows carry content ids to check against", citedIds.size > 0, true);
  /* THE VERSION-CITED ROW IS ADDED BY CONSTRUCTION AND SAID SO, because
     `op=basisversions` does not publish `content_id` on a version leg and there is
     no second read that can name it. MEASURED, not assumed: it is the sole content
     row of DOC_VER, which the fixture cited from a version leg and from nowhere
     else. That gap in the version read is reported as a DESIGN GAP rather than
     worked around silently. */
  const verRow = (r?.rows ?? []).filter((x) => x.bundle_id === DOC_VER);
  t("ARMED: DOC_VER holds exactly one content row, so naming it by construction is exact",
    verRow.length, 1);
  citedIds.add(verRow[0]?.content_id);
  t("the `cited` COLUMN agrees with the legs that actually exist — the live legs from a SECOND read "
  + "over a different table, plus the one row the fixture cited from a VERSION leg",
    (r?.rows ?? []).filter((x) => !!x.cited !== citedIds.has(x.content_id)).map((x) => x.content_id), []);
  t("and it is not vacuous: the corpus holds rows on BOTH sides of that agreement",
    [(r?.rows ?? []).some((x) => x.cited), (r?.rows ?? []).some((x) => !x.cited)], [true, true]);

  /* THE WHOLE-SET RULE, WHICH IS DOCTRINE AND IS THE THING THIS SUITE GOT WRONG
     FIRST. The registry's own header: "AND THE WHOLE MEANING SET OF EACH BUNDLE
     IN SCOPE IS RETURNED, not the subset the arm matched... A BASIS RETURNED IN
     PART READS AS A BASIS." It holds for content exactly as it holds for legs: a
     member who asks which documents hold a MACHINE-marked passage is shown every
     passage of those documents, so they can see what they did NOT filter for.
     Filtering the rows down to the arm's own predicate would hand a caller two
     of a document's five cited passages and let them conclude things about a
     document they have not seen. */
  const byMachine = (await rows(`rows=content&q=${encodeURIComponent("content:machine")}`))?.rows ?? [];
  t("`content:machine` + `rows=content` returns the WHOLE content set of the matching documents, "
  + "not only the machine-minted rows — a set returned in part reads as the set",
    byMachine.map((x) => x.content_id).sort(), [MACHINE_ROW, PLANE_LAYER].sort());
  t("and every returned row carries the column the arm filtered on, so a caller taking only the "
  + "machine-minted ones still knows what it did not take",
    byMachine.filter((x) => !("minted_by" in x)), []);

  /* `chain_last` IS THE WORKERD PIN. The filter uses SQLite's `$[#-1]` JSON path
     and node:sqlite is NOT the engine the plane runs on — this assertion is
     taken THROUGH the op, inside workerd, which is the only place it counts. */
  const byId = new Map((r?.rows ?? []).map((x) => [x.content_id, x]));
  t("`chain_last` is computed INSIDE workerd — the `$[#-1]` JSON path resolves on the plane's own engine",
    [byId.get(PLANE_LAYER)?.chain_last, byId.get(MEMBER_ROW)?.chain_last], ["layer", null]);
  t("and it agrees with the `content:chain=` filter it is the published half of",
    ((await rows(`rows=content&q=${encodeURIComponent("content:layer")}`))?.rows ?? [])
      .filter((x) => x.chain_last !== "layer"), []);
  /* The raw chain blob is NOT published here, and that is a decision: `op=content`
     answers it per row, in the sentence a member can read. */
  t("the chain BLOB is not in the row list — `op=content` answers it per row, in words",
    "chain" in (r?.rows?.[0] ?? { chain: 1 }), false);
}

/* ==================================================================== 7
 * `rows=leg` GAINS THREE COLUMNS, AND THE GRAIN DOES NOT MOVE.
 * ================================================================== */
console.log("\n--- 7. rows=leg: content_id, extent_kind, ref — and still one row per leg ---");
{
  const r = await rows(`rows=leg&q=${encodeURIComponent("has:leg")}`);
  const legs = (r?.rows ?? []).filter((x) => x.bundle_id === INQ).sort((a, b) => a.ord - b.ord);
  t("the three columns are on every leg row",
    ["content_id", "extent_kind", "ref"].filter((c) => !(c in (legs[0] ?? {}))), []);
  /* THE QUESTION SECTION 1 NAMES AS UNANSWERABLE TODAY: every leg citing page 14
     of this document. `ref` is the column a member reads it on. */
  t("a PAGE leg carries its extent kind and IC-1's human ref — *every leg citing page 2* is now readable",
    [legs[1]?.extent_kind, legs[1]?.ref], ["pdf-page", "page 2, the transfer table"]);
  t("a WHOLE-DOCUMENT leg says so rather than saying nothing",
    legs[0]?.extent_kind, "document");
  t("and each leg's content_id is the row the basis actually minted",
    [legs[0]?.content_id, legs[1]?.content_id], [PLANE_DOC, PLANE_PAGE]);
  /* THE GRAIN DOES NOT MOVE. A LEFT JOIN that fanned out would silently multiply
     a basis, which is the one thing this addition could break. */
  t("STILL ONE ROW PER LEG: the join is on the content table's PRIMARY KEY and cannot fan out",
    legs.length, 3);
  t("and `total` moved with it — the count statement carries the same join as the rows",
    r?.total, (r?.rows ?? []).length);
  /* A leg with NO content row answers with three nulls — the same undetermined it
     already carried, not a new one. Driven rather than assumed. */
  const noneLeg = (r?.rows ?? []).find((x) => x.content_id == null);
  t("a leg with no content row answers with all three NULL — an existing undetermined, not a new one",
    noneLeg == null || [noneLeg.extent_kind, noneLeg.ref], noneLeg == null || [null, null]);
}

/* ==================================================================== 8
 * THE FOUR-LEVEL STATEMENT.
 * ================================================================== */
console.log("\n--- 8. which level was empty, said rather than left to be inferred ---");
{
  /* THE CASE THE WHOLE BLOCK EXISTS FOR: a document in scope that holds NO
     content row. Without the statement this zero is byte-identical to "the
     passages exist and say nothing about it". */
  const e = await rows(`rows=content&q=${encodeURIComponent(`id:${DOC_NONE}`)}`);
  t("a document in scope holding NO content row answers ZERO rows",
    [e?.ok, e?.total, e?.rows?.length], [true, 0, 0]);
  t("and the envelope says the DOCUMENT level is not empty — one document was in scope",
    [e?.scope?.documents, e?.scope?.documents_with_rows, e?.scope?.documents_without_rows], [1, 0, 1]);
  t("and it says the emptiness is at the CONTENT level, naming what that does and does not mean",
    [e?.levels?.content?.state, /fact about CITATION/.test(e?.levels?.content?.why ?? "")],
    ["COUNTED", true]);
  t("and ONE SENTENCE a surface can render without composing it itself",
    /says nothing about the level below it/.test(e?.says ?? ""), true);
  /* THE LEVEL THIS READ CANNOT SEE IS NAMED, NOT OMITTED. A level omitted reads
     as a level with nothing in it, and undetermined is first-class. */
  t("the level this read CANNOT reach is named as UNDETERMINED and says what does reach it",
    [e?.levels?.internet?.state, /observation log/.test(e?.levels?.internet?.why ?? "")],
    ["UNDETERMINED", true]);
  t("all four levels of Part II section 14.3 are named, every time",
    Object.keys(e?.levels ?? {}).sort(), ["content", "document", "internet", "meaning"]);
  /* AND THE OTHER EMPTINESS — no document in scope at all — IS DISTINGUISHABLE
     BY THE ENVELOPE ALONE, which is section 8's own control one construct over. */
  const none = await rows(`rows=content&q=${encodeURIComponent("id:NOTHING-AT-ALL")}`);
  t("an empty answer with NO document in scope is a DIFFERENT envelope, not the same zero",
    [none?.total, none?.scope?.documents, none?.levels?.document?.state], [0, 0, "COUNTED"]);
  t("and its sentence says so: an empty DOCUMENT level, not an empty record",
    /empty DOCUMENT level, not an empty record/.test(none?.says ?? ""), true);
  t("THE TWO EMPTY ANSWERS ARE DISTINGUISHABLE BY THE ENVELOPE ALONE",
    JSON.stringify(e?.levels) === JSON.stringify(none?.levels), false);
  /* A MEANING-LEVEL ARM says its own level and names the content level as one it
     does not answer — so the four-level statement is not a content-arm special
     case wearing a general name. */
  const l = await rows(`rows=leg&q=${encodeURIComponent("has:leg")}`);
  t("a meaning-level arm carries the same block, at ITS level",
    [l?.level, l?.levels?.meaning?.state, l?.levels?.content?.state],
    ["meaning", "COUNTED", "UNDETERMINED"]);
  t("and it names the read that DOES answer the level below it",
    /rows=content/.test(l?.levels?.content?.why ?? ""), true);
}

/* ==================================================================== 9
 * THE GATE — AND WHAT IT CANNOT WITHHOLD HERE, MEASURED RATHER THAN ASSERTED.
 * ================================================================== */
console.log("\n--- 9. the gate: compiled into all three statements, and measured live ---");
{
  /* STRUCTURAL: every projection of the shape carries the participant predicate,
     for the content arm as for every other. `meaningread.test.mjs` pins the
     GATE-MINTING SITE COUNT; this pins that the third projection uses it. */
  const p = compile({ q: "has:content", viewer: "member:noah", rows: "content" });
  const bad = [];
  for (const mode of ["rows", "count", "levels"]) {
    const st = mode === "rows" ? p.statements.meaning() : p.statements.meaning({ mode });
    if (!st.sql.includes("project_participants")) bad.push(mode);
  }
  t("all THREE projections of the shape carry the participant predicate — including the new one", bad, []);
  /* AND IT IS APPLIED AT RUNTIME: `gate.applied` counts the statements that
     reached `#runQuery` carrying the marker, and it is three rather than two. */
  const r = await rows(`rows=content&q=${encodeURIComponent("has:content")}`, NOAH);
  t("and the gate is APPLIED to three statements, not two — the tally cannot run ungated",
    [r?.gate?.scope, r?.gate?.applied], ["participant", 3]);
  /* WHAT THIS ARM CANNOT STAGE, MEASURED RATHER THAN CLAIMED. The participant
     clause fences `b.object_type = 'project'` and NOTHING ELSE; every content
     row hangs off an INFORMATION bundle, because `contentMint` refuses a
     non-document target by name (DEC-21). So no content row is removable by this
     gate, and an assertion that one was withheld would pass over an empty set —
     the failure this project has measured three times. The gate is instead shown
     to be LIVE by the sibling arm on the same call shape. */
  const asMina = await rows(`rows=content&q=${encodeURIComponent("has:content")}`, MINA);
  t("MEASURED, NOT ASSUMED: two different members see the SAME content rows, because every content "
  + "row's owning bundle is an `information` bundle and the participant clause fences only projects",
    (r?.rows ?? []).length, (asMina?.rows ?? []).length);
  t("and the bundles those rows hang off carry NO project among them — which is WHY",
    [...new Set((r?.rows ?? []).map((x) => x.bundle_type))], ["information"]);
}

/* ==================================================================== 10
 * SEARCHING MINTS NOTHING, AND THE INDEXES ARE DECLARED.
 * ================================================================== */
console.log("\n--- 10. searching mints nothing; the measured indexes are declared ---");
{
  const before = (await allRows()).length;
  for (const q of ["content:pdf-page", "content:stale", "content:machine", "content:uncited",
                   "content:ocr content:cap<D", "has:content", "content:cap=undetermined"]) {
    await arm(q);
    await rows(`rows=content&q=${encodeURIComponent(q)}`);
  }
  const after = (await allRows()).length;
  t("SECTION 8's CONTROL: the content row count is unchanged after every query above — "
  + "a hit is an ADDRESS and searching mints nothing (DEC-24)", after, before);
  t("and the corpus it was measured over is not empty", before > 0, true);

  /* THE INDEXES THE MEASUREMENT BOUGHT. `content-index-probe.mjs` measured
     `content:uncited` at 2,051 ms UNINDEXED against 3.5 ms with these two — a
     quadratic behind a member-callable read. They are asserted DECLARED here so
     removing one fails a suite rather than silently returning the two seconds.
     The refusal is recorded too: `content(extent_kind, …)` is deliberately NOT
     declared, and this line is what would catch somebody adding it without
     re-running the measurement. */
  const idx = (name) => new RegExp(`CREATE INDEX IF NOT EXISTS ${name}\\b`).test(SCHEMA_SRC);
  t("the two indexes the `cited` measurement bought are DECLARED — without them the op does not "
  + "answer slowly, it times out (31.6 s measured)",
    [idx("inquiry_basis_content"), idx("inquiry_basis_version_legs_content")], [true, true]);
  /* ALL FOUR PER-COLUMN INDEXES SHIP, AND `content_extent_kind` IS HERE BECAUSE THE
     LARGER CORPUS OVERTURNED THE SMALLER ONE — recorded because the reversal is
     the reason two sizes were measured at all. At 5,000 bundles it read +1.6% and
     would have been refused on `inquiry_basis_role`'s precedent; at 20,000 it reads
     -48.5% on the rare value and -39.2% on the common one, against a measured 20.5%
     noise floor. The proportion grows with the corpus, which is the property an
     index buys, and a single size cannot see it. */
  t("and the four the per-column measurement bought, every one of which CLEARED the measured noise floor",
    [idx("content_extent_kind"), idx("content_stale"), idx("content_minted_by"),
     idx("content_derivation_cap")], [true, true, true, true]);
  /* THE ONE THAT CANNOT EXIST, asserted so a later reader does not add it and
     wonder why nothing got faster: `content:chain` filters on a JSON PARSE of the
     chain column, so no ordinary index can serve it. The design gives
     `capture_text` a `chain_kind` COLUMN for exactly this predicate and gives
     `content` none — REC-90's DESIGN GAP. */
  t("and NO index pretends to serve the chain filter, which is an expression and not a column",
    idx("content_chain"), false);
  t("the chain column's own comment names the gap rather than leaving it to be rediscovered",
    /DESIGN GAP by REC-90/.test(SCHEMA_SRC), true);
}

/* D-186 / hygiene: the Miniflare instance is DISPOSED. A suite that leaks one
   leaves a workerd process and a sandbox directory behind, and `hygiene.test.mjs`
   fails by name on it — which is how this line came to exist. */
await mf.dispose();
console.log(`\ncontent-arm: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
