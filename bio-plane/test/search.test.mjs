/* NEGATIVE CONTROL: (run 2026-07-31) index the empty string instead of the bundle's text in promote's FTS write (store.mjs: `...FTS_COLUMNS.map(() => "")`), so the text index diverges from the corpus it is derived from -> 19 assertions fail (op=searchindexcheck disagrees, and no body/title term is found) then the suite throws on the empty hit set; restored, 164 pass.
   (b) D-228/REC-68, run 2026-08-08: restore the quote-stripping defect in query.mjs's tokenizer (drop `&& src[i] !== '"'` from the BARE reader's terminator set) -> 170 pass, 12 FAIL, and this suite is where the two failure modes SEPARATE. MATCHED NOTHING, which fails honestly: `state:"collected"` 0 against 1, `type:"problem"` [] against one row, `monitored:"true"` 0, `annotations:">0"` 0, `fm:monitoring.frequency="monthly"` 0, `schema:"problem@1"` []. MATCHED THE WRONG THING, which does not: `title:"Fund general"` returned 1 for a phrase that is in NO title (the column filter bound to the first word only and the second was matched over every column), and `title:"billing Water"` returned 1 with the words reversed. AND THE SHARPEST: `-state:"collected"` returned 3 against 2 — a selector matching nothing, under NEGATION, returns THE WHOLE CORPUS, so an honest empty answer becomes a confident complete one. Restored, verified by sha256 AND `cmp`.
   (c) REC-204, run 2026-09-25, Phase 4 (the envelope as content). Pristine src/index.mjs sha256 9b90c9c2…aaf92b, 896,766 B, copied aside under an item-named file; every restore verified by sha256 AND `cmp` against it. BASELINE: 201 pass, 0 fail. ARM `noenvelope` — DECLARED: drop the envelope arm (`const env = envelopeUnitsFor(...)` -> `const env = []` in `textUnitsFor`); the tracked-change-author search MUST return 0 by name and every envelope assertion MUST fail, while the body-only search, the no-merge assertion and both catalog refusals (`cited_as` crossed in either direction) MUST stay green — they are the body and the checker, not the projection. ACTUAL: `passage:"Marbury" -> 0 row(s)`, 15 FAIL, 186 pass, suite reached its foot; the four held-open assertions green. ITS FIRST TWO RUNS FOUND THREE DEFECTS IN THIS PHASE'S OWN INSTRUMENT and they were fixed, not smoothed: the reading-order assertion PASSED over an emptied envelope (`Math.min()` of nothing is Infinity), the `content_id` assertion PASSED on `undefined === undefined`, and an unguarded `JSON.parse` killed the suite before its foot. ARM `nolabel` — DECLARED: write the unit's text without its `ENVELOPE —` prefix; the SNIPPET assertion ALONE must fail (extent kind and `ref` still say envelope — three labels, and each is its own defence). ACTUAL: exactly that one, 200 pass. Restored; 201 pass, 0 fail. */
/* Retrieval end to end, S-10 steps 2 to 4.
 *
 * Negative-control detail: index the empty string instead of the bundle's text in promote's FTS write (store.mjs: `...FTS_COLUMNS.map(() => "")`), so the text index diverges from the corpus it is derived from -> 19 assertions fail (op=searchindexcheck disagrees, and no body/title term is found) then the suite throws on the empty hit set; restored, 164 pass.
 *
 * Three claims are on trial here, and each one is checked the way it can fail
 * rather than the way it is meant to work.
 *
 * 1. THE TEXT INDEX CANNOT DIVERGE FROM THE CORPUS. It is written inside
 *    promote's transaction, so a creation, a revision, and a purge each carry
 *    their index row with them. "Maintained transactionally" is a design, and a
 *    design is not a measurement, so `op=searchindexcheck` re-derives the
 *    expected index row for every bundle from the stored files and compares. The
 *    verifier gets a negative control: the index is deliberately broken and the
 *    checker must say so, because a verifier that says yes to everything says
 *    nothing.
 *
 * 2. NO QUERY PATH REACHES THE STORE WITHOUT THE D-15 VIEWER GATE. Search ships
 *    at flat member scope ahead of the membership model, which is only safe
 *    because visibility filtering has exactly one compilation point. Asserted
 *    three ways: structurally, that store.mjs builds no query at all and routes
 *    every compiled statement through one guarded executor; behaviourally, that
 *    an unrecognised viewer returns nothing on every mode including facets; and
 *    at the door, that a caller who supplies their own `viewer` parameter has it
 *    overwritten by the server.
 *
 * 3. PAGING IS CORRECT ON A FIELD THAT TIES. Probe 2 found the ground truth
 *    disagreeing with both indexed paths at 20,000 rows on the sorted shape
 *    alone, because at 30 documents every timestamp was distinct and there were
 *    no ties to get wrong. Real corpora tie heavily on state, criticality and
 *    coarse dates. So the scale phase below builds a corpus that is ONE VALUE on
 *    the sort field and pages the whole of it.
 *
 *    MEASURED, AND NOT WHAT WAS ASSUMED: removing `, bundle_id ASC` from the
 *    compiler and re-running this suite still passes. At 600 rows SQLite returns
 *    tied rows in a deterministic order, so the partition assertions below do NOT
 *    demonstrate the hazard, and a comment claiming they do was removed rather
 *    than left to be believed. The order is deterministic but UNDECLARED, which
 *    is the actual risk: it is a property of the plan SQLite chose, and the plan
 *    changes with corpus size, with an added index, with a different sort field,
 *    and with an engine upgrade. Forcing the break needs a corpus large enough to
 *    spill the sorter, which is far past what a suite should build.
 *
 *    So the guard against it is at COMPILE time, in query.test.mjs, which asserts
 *    that every sortable field in both directions ends in a unique column and
 *    therefore declares a TOTAL order. These assertions remain as a regression
 *    net on the results themselves, described as what they are.
 *
 * Ground truth is computed in JavaScript from the corpus definitions and
 * compared against what SQL returns, which is the discipline both probes used.
 * An agreement between the compiler and itself would prove nothing.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
/* textOf lives in query.mjs, not in the store, so the text derivation is
   importable and assertable in plain node exactly like the compiler is. The
   store maintains the index; the module derives what goes in it. */
import { textOf, FTS_COLUMNS } from "../src/query.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ------------------------------------------------------------------ *
 * Structural: the store builds no query.
 * ------------------------------------------------------------------ */
console.log("\n--- the compiler is the only place a query comes from ---");
{
  const store = readFileSync(SRC("store.mjs"), "utf8");
  const query = readFileSync(SRC("query.mjs"), "utf8");
  t("store.mjs contains no MATCH against the text index", /bundles_fts\s+MATCH/.test(store), false);
  t("query.mjs is where MATCH is built", /bundles_fts MATCH/.test(query), true);
  /* Every compiled statement the store executes goes through the one guarded
     executor. Checked on the source because the guard is what protects the code
     that has not been written yet. */
  /* Checked in a WINDOW rather than per line, because a batched statement is
     consumed by a loop whose #runQuery sits on the next line. What matters is
     that no compiled statement reaches the engine by any other route. */
  const uses = [];
  for (let i = store.indexOf(".statements."); i !== -1; i = store.indexOf(".statements.", i + 1))
    uses.push(store.slice(Math.max(0, i - 80), i + 160));
  t("the store executes compiled statements", uses.length > 0, true);
  t("and every one of them goes through #runQuery",
    uses.filter((w) => !/#runQuery\(/.test(w)).length, 0);
  t("no compiled statement is handed to the raw row helper instead",
    /#rows\([^)]*statements\./.test(store) || /sql\.exec\([^)]*statements\./.test(store), false);
  t("the guard refuses a statement without the gate", /REFUSED: a retrieval statement/.test(store), true);
}

/* ------------------------------------------------------------------ *
 * Phase 1: the small corpus, where index maintenance is checked.
 * ------------------------------------------------------------------ */
const mf = new Miniflare({
  modules: true, script: readFileSync(SRC("store.mjs"), "utf8"),
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const raw = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());
const call = async (p, body) => (await raw(p, body)).result;
const S = (qs) => call("/search?viewer=class:member&" + qs);
/* REC-30: op=searchindexcheck's `findings` NAME bundles, so its page carries the
   D-15 predicate and fails closed on an absent viewer. This suite drives the
   Durable Object directly and so stands in for a machine credential — no person
   behind it, no participation to check, which is D-15's own carve-out — and
   stamps class:member exactly as the /search reads above already do. Unstamped
   the checker sees an empty corpus and reports `ok` about nothing. */
const IDXCHK = (qs = "") => call(`/searchindexcheck?viewer=class:member${qs ? "&" + qs : ""}`);

const bundleMd = (b) => `---
id: ${b.id}
object_type: ${b.type}
schema: ${b.schema || "information@2"}
title: "${b.title}"
current_state: ${b.state}
prior_state: null
created: "${b.created}"
last_updated: "${b.updated}"
criticality: ${b.crit}
group: believe-in-oakland
references: []
produced_by:
  mode: ${b.mode || "interactive_chat"}
  capability_tier: standard
source:
  locator: "${b.locator || "https://oaklandca.opengov.com/records"}"
  authority: "${b.authority || "Oakland OpenGov portal"}"
  retrieved: "2026-07-18"
source_status: ${b.status || "unchanged"}
annotations_open: ${b.ann ?? 0}
monitoring:
  enabled: ${b.monitored ?? false}
  frequency: ${b.freq || "monthly"}
---

${b.body}
`;

const promote = async (b, base = null, extra = null) => {
  const text = bundleMd(b);
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (extra) files.push({ path: "analysis.md", text: extra, bytes: extra.length, sha256: sha(extra) });
  return call("/promote", {
    bundleId: b.id, base, files, snapKey: `${b.id}-${base ? "rev" : "new"}`, author: "suite",
    meta: { object_type: b.type, group: "believe-in-oakland", title: b.title, current_state: b.state,
            created: b.created, last_updated: b.updated, criticality: b.crit },
  });
};

const A = { id: "INFO-2026-0001-sewer", type: "information", title: "Sewer Service Fund transfer series",
            state: "collected", created: "2026-07-18T22:00:00Z", updated: "2026-07-20T18:58:01Z",
            crit: "crucial", cls: "fact", ann: 3, monitored: true, status: "modified",
            body: "The sewer service fund transferred money to the general fund. Sewer sewer sewer sewer." };
const B = { id: "INFO-2026-0002-water", type: "information", title: "Water billing anomaly",
            state: "reviewed", created: "2026-07-19T00:00:00Z", updated: "2026-07-21T00:00:00Z",
            crit: "notable", cls: "fact", ann: 0, locator: "https://auditor.example.org/water",
            authority: "City Auditor", body: "Water billing anomalies appear in the auditor report." };
const C = { id: "PROB-2026-0003-oversight", type: "problem", schema: "problem@1", title: "Fund oversight is absent",
            state: "surfaced", created: "2026-07-15T00:00:00Z", updated: "2026-07-16T00:00:00Z",
            crit: "crucial", cls: "assessment", ann: 1, body: "No committee reviews the fund transfers." };

console.log("\n--- a creation is indexed inside its own transaction ---");
{
  t("bundle A promotes", (await promote(A)).ok, true);
  t("bundle B promotes", (await promote(B)).ok, true);
  t("bundle C promotes", (await promote(C)).ok, true);
  const st = await call("/stats");
  t("three bundles, three index rows", [st.bundles, st.indexed], [3, 3]);
  const chk = await IDXCHK();
  t("the index agrees with the corpus", chk.ok, true);
  t("with nothing keyless and nothing orphaned", [chk.counts.keyed, chk.orphans.length], [3, 0]);
  t("a term in the body is found", (await S("q=transferred&facets=none")).hits.map((h) => h.bundle_id), [A.id]);
  t("a term in the title is found", (await S("q=title:anomaly&facets=none")).hits.map((h) => h.bundle_id), [B.id]);
  t("a value in the frontmatter tail is found as free text",
    (await S("q=interactive_chat&facets=none")).total, 3);
  t("pasting a bundle id finds the bundle",
    (await S(`q=${encodeURIComponent(A.id)}&facets=none`)).hits.map((h) => h.bundle_id), [A.id]);
}

console.log("\n--- an inline document beyond bundle.md is part of the text surface ---");
{
  const r = await promote({ ...C, updated: "2026-07-17T00:00:00Z" },
    (await call(`/projection?id=${C.id}&viewer=class:member`)).bundle_sha,
    "# Analysis\n\nThe comptroller signed the requisition without a resolution.");
  t("the revision lands", r.ok, true);
  t("a word only present in analysis.md is searchable",
    (await S("q=comptroller&facets=none")).hits.map((h) => h.bundle_id), [C.id]);
  t("and the index still agrees with the corpus", (await IDXCHK()).ok, true);
}

console.log("\n--- a revision replaces its index row, so the index cannot lag the document ---");
{
  const before = (await call(`/projection?id=${B.id}&viewer=class:member`)).bundle_sha;
  const revised = { ...B, title: "Water billing reconciliation", updated: "2026-07-22T00:00:00Z",
                    body: "Reconciliation of the water accounts is complete." };
  t("the revision lands", (await promote(revised, before)).ok, true);
  /* The point of writing the index inside the transaction: text the document no
     longer contains must not still match, which is the failure that makes a
     stale text index worse than none. */
  t("a word the old revision had no longer matches", (await S("q=anomalies&facets=none")).total, 0);
  t("a word the new revision has matches now",
    (await S("q=reconciliation&facets=none")).hits.map((h) => h.bundle_id), [B.id]);
  t("the old title no longer matches", (await S("q=title:anomaly&facets=none")).total, 0);
  t("the index row count did not grow", (await call("/stats")).indexed, 3);
  t("and the checker still agrees", (await IDXCHK()).ok, true);
}

console.log("\n--- the divergence checker can say no: a deliberately broken index ---");
{
  /* A verifier that says yes to everything says nothing, so break the index and
     require the checker to name what is wrong. */
  t("clearing one bundle's derived state reports what it cleared",
    (await call("/projectionclear", { bundleId: A.id })).scope, A.id);
  const chk = await IDXCHK();
  t("the checker refuses to pass", chk.ok, false);
  t("and names the bundle and the reason",
    chk.findings.map((f) => [f.bundleId, f.finding]), [[A.id, "NO_FTS_ID"]]);
  t("the counts disagree, which is the cheap signal", [chk.counts.bundles, chk.counts.indexed], [3, 2]);
  t("the broken bundle is unfindable while the index is broken", (await S("q=transferred&facets=none")).total, 0);
  const rep = await call("/reproject", {});
  t("repair reports what it rebuilt", [rep.reprojected, rep.reindexed, rep.remaining], [1, 1, 0]);
  t("the checker passes again", (await IDXCHK()).ok, true);
  t("and the bundle is findable again", (await S("q=transferred&facets=none")).total, 1);
}

console.log("\n--- a purge takes its index row with it, so a key cannot be inherited ---");
{
  const gone = "INFO-2026-0009-doomed";
  await promote({ ...A, id: gone, title: "Doomed record", body: "This mentions xylophone once.", updated: "2026-07-23T00:00:00Z" });
  t("the doomed bundle is findable", (await S("q=xylophone&facets=none")).total, 1);
  const pr = await call(`/purge?bundleId=${gone}`);
  t("the purge removes the bundle", pr.removed.bundles, 1);
  t("and the index row with it", (await call("/stats")).indexed, 3);
  t("its text is gone", (await S("q=xylophone&facets=none")).total, 0);
  /* fts_id is allocated MAX+1, so a purge that left the index row behind would
     hand the next bundle a dead document's text. This is that case. */
  const heir = "INFO-2026-0010-heir";
  await promote({ ...A, id: heir, title: "The next record", body: "This mentions marimba once.", updated: "2026-07-24T00:00:00Z" });
  t("the next bundle inherits nothing", (await S("q=xylophone&facets=none")).total, 0);
  t("and carries its own text", (await S("q=marimba&facets=none")).hits.map((h) => h.bundle_id), [heir]);
  t("with no orphan left anywhere", (await IDXCHK()).orphans, []);
  await call(`/purge?bundleId=${heir}`);
}

console.log("\n--- the text derivation is pure, and the checker compares against it ---");
{
  /* The comparison the checker performs, exercised directly on the pure
     function, so the DIVERGED finding is not the only untested branch. */
  const files = [{ path: "bundle.md", text: bundleMd(A) }];
  const one = textOf(A.id, files);
  const two = textOf(A.id, [{ path: "bundle.md", text: bundleMd({ ...A, title: "Something else" }) }]);
  t("the same document projects the same text", textOf(A.id, files), one);
  t("a changed document projects different text", FTS_COLUMNS.some((c) => one[c] !== two[c]), true);
  t("the title column carries the title", one.title, A.title);
  t("locator and authority are indexed, per Bob's decision",
    [one.locator, one.authority], ["https://oaklandca.opengov.com/records", "Oakland OpenGov portal"]);
  t("a document with no frontmatter at all does not throw",
    typeof textOf("X", [{ path: "bundle.md", text: "no frontmatter here" }]).body, "string");
  t("and neither does a bundle with no bundle.md",
    textOf("X", [{ path: "data/x.json", text: "{}" }]).title, "");
  /* JSON data is deliberately out of the free-text body: machine records would
     flood the term statistics bm25 depends on. */
  t("a JSON data file is not folded into the body",
    textOf("X", [{ path: "bundle.md", text: bundleMd(A) },
                       { path: "data/gathering.json", text: "hapaxlegomenon" }]).body.includes("hapaxlegomenon"), false);
}

console.log("\n--- the viewer gate returns nothing on every shape, not merely on the page ---");
{
  for (const [label, qs] of [
    ["a page", "q=fund&facets=none"],
    ["a count", "q=fund&mode=count"],
    ["select-all", "q=fund&mode=ids&facets=none"],
    ["an empty query", "q=&facets=none"],
    ["a metadata-only query", "q=state:collected&facets=none"],
  ]) {
    const denied = await call("/search?" + qs);
    t(`${label} with no viewer finds nothing`, denied.total, 0);
    t(`${label} reports the gate as DENY`, denied.gate.scope, "DENY");
    const allowed = await call("/search?viewer=class:member&" + qs);
    t(`${label} with a member viewer finds something`, allowed.total > 0, true);
  }
  const facets = await call("/search?q=");
  t("facet counts are empty under the deny predicate too",
    Object.values(facets.facets).every((v) => v.length === 0), true);
  t("an unrecognised viewer string is denied, not trusted",
    (await call("/search?q=fund&viewer=admin-ish")).gate.scope, "DENY");
  /* Three, not four and not eight. A count, a page, and ONE facet scan. It was
     eight when each of six facets ran its own statement (283ms at 20,000), four
     when they were batched into two compound statements, and is three now that
     the counting happens in JS over a single scan (D-32). The number is asserted
     rather than described because it is the thing that regresses silently. */
  t("the gate is applied to every statement the request ran",
    (await call("/search?q=fund&viewer=class:member")).gate.applied, 3);
}

console.log("\n--- the two facet strategies agree exactly (D-32) ---");
{
  /* An optimisation that disagrees with the thing it replaces is not an
     optimisation. Same standard op=audit is held to against an outside pass:
     the fast path is only allowed to be fast, never to be different. */
  const shapes = [
    ["whole corpus", "q="],
    ["a text filter", "q=fund"],
    ["a metadata filter", "q=state:collected"],
    ["text and metadata", "q=fund+state:collected"],
    ["a named facet subset", "q=&facets=state,type"],
    ["an empty result", "q=zzzznothingmatchesthis"],
  ];
  for (const [label, qs] of shapes) {
    const scan = await call(`/search?${qs}&viewer=class:member&facetmode=scan`);
    const grp = await call(`/search?${qs}&viewer=class:member&facetmode=groupby`);
    t(`${label}: identical facet counts`,
      JSON.stringify(scan.facets), JSON.stringify(grp.facets));
  }
  /* And the agreement is not vacuous: prove the shapes above actually produced
     counts, or six comparisons of {} would pass and mean nothing. */
  const filled = await call("/search?q=&viewer=class:member&facetmode=scan");
  const total = Object.values(filled.facets).reduce((a, v) => a + v.length, 0);
  t("the comparison was not over empty facet sets", total > 0, true);
  /* NULL is absence in both forms. A column no bundle fills must appear as an
     empty list, never as a bucket counting nulls. */
  const nulls = Object.values(filled.facets).flat().filter((x) => x.value === null);
  t("neither form counts NULL as a value", nulls, []);
}

console.log("\n--- AND semantics, and the affordance that makes AND safe ---");
{
  /* Two, not three: the revision above rewrote bundle B and "fund" left with
     the old text, which is the index doing its job rather than a shortfall. */
  t("one word finds the two documents that say it", (await S("q=fund&facets=none")).total, 2);
  t("two words narrow rather than widen", (await S("q=fund+transferred&facets=none")).total, 1);
  t("a third word can narrow to nothing", (await S("q=fund+transferred+marimba&facets=none")).total, 0);
  const zero = await S("q=fund+marimba&facets=none");
  t("and a zero result offers the OR reading rather than a dead end", zero.widen.interpretation, "OR");
  t("with the count the wider reading would return", zero.widen.total, 2);
  t("a single term is not offered a widening, because there is nothing to widen",
    (await S("q=marimba&facets=none")).widen, null);
  t("a query that found something is not offered one either", (await S("q=fund&facets=none")).widen, null);
  t("an explicit OR is honoured without the affordance",
    (await S("q=transferred+OR+reconciliation&facets=none")).total, 2);
  t("a phrase is one unit", (await S(`q=${encodeURIComponent('"service fund"')}&facets=none`)).total, 1);
  t("a prefix match stands in for a stemmer", (await S("q=transfer*&facets=none")).total, 2);
  t("a negation excludes", (await S("q=fund+-transferred&facets=none")).total, 1);
  t("nesting works", (await S(`q=${encodeURIComponent("(transferred OR reconciliation) AND type:information")}&facets=none`)).total, 2);
}

console.log("\n--- a hit carries full provenance and its context ---");
{
  const r = await S("q=transferred&facets=none");
  const h = r.hits[0];
  t("the id is there", h.bundle_id, A.id);
  t("and the locator, which a citation needs", h.source_locator, "https://oaklandca.opengov.com/records");
  t("and the authority", h.source_authority, "Oakland OpenGov portal");
  t("and the state and the criticality",
    [h.current_state, h.criticality], ["collected", "crucial"]);
  t("and the projected tail", [h.schema_id, h.source_status, h.annotations_open], ["information@2", "modified", 3]);
  t("and the sha, so a caller can fetch the image without a second lookup", typeof h.bundle_sha, "string");
  t("the match is marked in a snippet", h.snippet.includes("[transferred]"), true);
  /* CORRECTED 2026-09-23 BY D-447 (Membership v2 §7.9), never exempted: these asserted a hit carries a numeric
     `score` and a metadata-only hit `score: null`. The number was `bm25(bundles_fts)`, a statistic of the WHOLE index,
     so it moved when a project the reader cannot see was revised (measured, project-sight §7). The answer now publishes
     the ORDER only: no hit carries a score, ranked or not. */
  t("and it carries NO score: the order is the answer (D-447)", "score" in h, false);
  t("a metadata-only query returns provenance with no score key either",
    "score" in (await S("q=state:collected&facets=none")).hits[0], false);
}

console.log("\n--- relevance is the default order, and any field overrides it ---");
{
  const rel = await S("q=sewer&facets=none");
  t("the document that says it four more times ranks first", rel.hits[0].bundle_id, A.id);
  t("relevance is what was used", rel.query.sort, { field: "relevance", dir: "ASC" });
  const byTitle = await S("q=fund&sort=title&dir=asc&facets=none");
  t("an explicit sort overrides relevance", byTitle.query.sort, { field: "title", dir: "ASC" });
  t("and orders by that field", byTitle.hits.map((h) => h.title),
    ["Fund oversight is absent", "Sewer Service Fund transfer series"]);
  const desc = await S("q=fund&sort=title&dir=desc&facets=none");
  t("in either direction", desc.hits.map((h) => h.title).reverse(), byTitle.hits.map((h) => h.title));
  t("sort: inside the query string works the same",
    (await S("q=fund+sort:title:asc&facets=none")).hits.map((h) => h.bundle_id), byTitle.hits.map((h) => h.bundle_id));
}

console.log("\n--- filters, ranges, presence, and the per-schema tail ---");
{
  t("an enumeration filters", (await S("q=type:problem&facets=none")).total, 1);
  t("case does not matter to an enumeration", (await S("q=type:Problem&facets=none")).total, 1);
  t("two filters intersect", (await S("q=type:information+state:collected&facets=none")).total, 1);
  t("a range filters", (await S("q=updated:2026-07-20..2026-07-23&facets=none")).total, 2);
  t("a comparison filters", (await S("q=annotations:>0&facets=none")).total, 2);
  t("a boolean filters", (await S("q=monitored:true&facets=none")).total, 1);
  t("has: finds a field that carries a value", (await S("q=has:locator&facets=none")).total, 3);
  t("the per-schema tail is queryable", (await S("q=fm:monitoring.frequency=monthly&facets=none")).total, 3);
  t("a schema version filters", (await S("q=schema:problem@1&facets=none")).total, 1);
  t("the authority is searchable", (await S("q=authority:auditor&facets=none")).total, 1);
  t("the locator is searchable", (await S("q=locator:opengov&facets=none")).total, 2);
  t("text and metadata mix", (await S("q=fund+type:problem&facets=none")).total, 1);
  t("an unknown field warns rather than refusing",
    (await S("q=nosuchfield:x&facets=none")).query.warnings.length, 1);
}

/* ====================================================================
 * D-228 / REC-68, DRIVEN OVER THE PLANE'S ANSWER RATHER THAN THE COMPILER'S SQL.
 *
 * `query.test.mjs` proves what a quoted value COMPILES to. That is necessary
 * and it is not the claim a member cares about, which is which rows come back.
 * This block asks the op.
 *
 * THE TWO FAILURE MODES ARE NOT EQUALLY BAD AND THIS BLOCK SEPARATES THEM,
 * because the cost is asymmetric and the project has already ruled on it:
 *
 *   MATCHED NOTHING — `state:"collected"` bound the literal `"collected"`
 *   against an indexed equality on a corpus that stores `collected`, so it
 *   returned zero rows and said nothing. A selector that matches nothing FAILS
 *   HONESTLY: the member sees an empty page and knows something is wrong. This
 *   is the shape 28 of the 34 projected fields had.
 *
 *   MATCHED THE WRONG THING — `title:"Fund general"` bound the FTS5 expression
 *   `({title} : """Fund" AND "general""")`. In FTS5 a column filter binds to the
 *   PHRASE THAT FOLLOWS IT, so `{title}` scoped only the first word and the
 *   second was searched over EVERY column. It returned rows, confidently, and
 *   they were not the rows asked for. This is the shape the free-text fields
 *   had, and PL-10 measured the same distinction one component over
 *   (`heldMatch`) and concluded that confidently matching the wrong row is the
 *   WORSE of the two. It is therefore the case driven hardest here.
 * ================================================================== */
console.log("\n--- D-228: a quoted field value, over the plane's own answer ---");
{
  const ids = async (q) => (await S(`q=${encodeURIComponent(q)}&facets=none`)).hits.map((h) => h.bundle_id).sort();
  const total = async (q) => (await S(`q=${encodeURIComponent(q)}&facets=none`)).total;

  /* --- the half that matched NOTHING, and now matches what it was asked --- */
  t("an enumeration filter answers when its value is quoted", await total('state:"collected"'), 1);
  t("and it is the SAME ROW the unquoted spelling finds",
    await ids('state:"collected"'), await ids("state:collected"));
  t("a quoted type filter answers too", await ids('type:"problem"'), [C.id]);
  t("a quoted boolean is a boolean, not the string it was typed as", await total('monitored:"true"'), 1);
  t("a quoted number is a number", await total('annotations:">0"'), 2);
  t("a quoted frontmatter value reaches the per-schema tail",
    await total('fm:monitoring.frequency="monthly"'), 3);
  t("a quoted schema stamp, punctuation and all", await ids('schema:"problem@1"'), [C.id]);

  /* --- the half that matched the WRONG THING, which is the worse one --- */
  /* A's title is "Sewer Service Fund transfer series" and A's BODY contains
     "general" ("...to the general fund"). A's title does NOT contain the phrase
     "Fund general" and never did. Under the old reading `{title}` scoped only
     `Fund`, and `general` was matched against every column — so A came back,
     confidently, for a phrase it does not contain. */
  t("the phrase is not in any title, so the honest answer is none",
    await total('title:"Fund general"'), 0);
  t("and the row the broken reading returned is a row that really exists — "
    + "so the old answer was WRONG, not merely empty",
    await ids("title:Fund general"), [A.id]);
  /* Read those two together: the unquoted spelling still means AND-across-
     columns and still returns A, which is correct for what it asks. The quoted
     spelling asks a different question and now gets a different answer. Before
     this item BOTH returned A, and only one of them should have. */
  t("a phrase that IS in a title is found, so the phrase arm is not just refusing",
    await ids('title:"Water billing"'), [B.id]);
  t("word order inside a phrase is load-bearing, which is what a phrase means",
    await total('title:"billing Water"'), 0);
  t("while the unquoted spelling ignores order, unchanged by this item",
    await total("title:billing Water"), 1);
  /* PL-10 measured that the FTS columns' single-word case matched the same 63
     hits both ways — the defect did not bite there — and that is re-measured
     here rather than inherited, because a fact taken on report is not a
     measurement. */
  t("a SINGLE-word quoted value on a free-text column matched the same rows before and after "
    + "(PL-10's finding, re-measured here rather than inherited)",
    await ids('locator:"opengov"'), await ids("locator:opengov"));
  t("which is why `heldMatch` was confidently wrong rather than silently empty (UI-50's subject)",
    await total('locator:"opengov"'), 2);

  /* --- the composition, because an arm that only works alone is not a fix --- */
  t("a quoted value composes with an unquoted one", await total('type:"information" state:collected'), 1);
  t("with negation", await total('-state:"collected"'), 2);
  t("with parentheses and OR", await total('(state:"collected" OR state:"surfaced")'), 2);
  t("and a quoted value never becomes a warning", (await S(`q=${encodeURIComponent('state:"collected"')}&facets=none`)).query.warnings, []);
}

console.log("\n--- facet counts drive the filter sidebar ---");
{
  const r = await S("q=");
  const truth = {};
  for (const b of [A, { ...B, title: "Water billing reconciliation" }, C])
    truth[b.state] = (truth[b.state] || 0) + 1;
  t("state counts agree with ground truth",
    Object.fromEntries(r.facets.state.map((x) => [x.value, x.n])), truth);
  /* Superseded 2026-08-03 (REC-10): the canonical name for the legacy
     `problem`/`focus` spellings is now `inquiry`, so the facet answers with
     it. The assertion's point is unchanged — one canonical spelling, never a
     split count. */
  t("the type facet counts both types, the legacy one under its canonical name",
    Object.fromEntries(Object.entries(Object.fromEntries(r.facets.type.map((x) => [x.value, x.n]))).sort()), { information: 2, inquiry: 1 });
  const filtered = await S("q=type:information");
  t("a facet counts the FILTERED set, not the corpus",
    Object.fromEntries(filtered.facets.type.map((x) => [x.value, x.n])), { information: 2 });
  t("a caller can name the facets it wants",
    Object.keys((await S("q=&facets=criticality")).facets), ["criticality"]);
  t("and can turn them off", (await S("q=&facets=none")).facets, undefined);
  /* Reachable by a member with one pass over a filter sidebar, and it failed
     until 2026-07-25: workerd refuses a compound SELECT of more than five terms,
     so seven filters must nest rather than chain. */
  t("seven metadata filters execute rather than being refused by the engine",
    (await S("q=type:information state:collected criticality:crucial schema:information@2 "
           + "status:modified monitored:true frequency:monthly&facets=none".replace(/ /g, "+")))
      .total >= 0, true);
  t("a seven-arm OR executes too",
    (await S("q=state:collected+OR+state:reviewed+OR+state:surfaced+OR+state:retired+OR+state:a+OR+state:b+OR+state:c&facets=none")).total >= 0, true);
}

console.log("\n--- select-all is a different request from a page ---");
{
  const page = await S("q=&limit=2&facets=none");
  t("a page is bounded", page.hits.length, 2);
  t("and reports the whole total anyway", page.total, 3);
  const ids = await S("q=&mode=ids&facets=none");
  t("select-all returns every id", ids.ids.length, 3);
  t("in the same order the page presented", ids.ids.slice(0, 2), page.hits.map((h) => h.bundle_id));
  t("and carries no provenance, because it is a selection and not a listing", ids.hits, undefined);
  t("and is not truncated at this size", ids.truncated, false);
  const count = await S("q=&mode=count");
  t("mode=count answers with the total alone", [count.total, count.hits, count.facets], [3, undefined, undefined]);
}

/* ------------------------------------------------------------------ *
 * Phase 2: scale, where the sort assumption is tested until it breaks.
 * ------------------------------------------------------------------ */
const N = 600;
console.log(`\n--- scale: ${N} bundles that all tie on the sort field ---`);
const corpus = [];
{
  await call("/purge?bundleId=");
  const WORDS = ["alpha", "bravo", "charlie", "delta", "echo"];
  const STATES = ["collected", "reviewed", "surfaced", "retired"];
  const t0 = Date.now();
  for (let i = 0; i < N; i++) {
    const b = {
      id: `INFO-2026-${String(4000 + i).padStart(4, "0")}-scale`,
      type: i % 3 === 0 ? "problem" : "information",
      schema: i % 3 === 0 ? "problem@1" : "information@2",
      title: `Record ${i} ${WORDS[i % WORDS.length]}`,
      state: STATES[i % STATES.length],
      created: "2026-01-01T00:00:00Z",
      /* Every row carries the SAME last_updated and the SAME criticality. That
         is the point: a corpus with no ties cannot catch a missing tiebreak, and
         probe 2 found exactly that false pass at 30 documents. */
      updated: "2026-07-01T00:00:00Z",
      crit: "notable", cls: "fact", ann: i % 4,
      body: `${WORDS[i % WORDS.length]} ${WORDS[(i + 1) % WORDS.length]} record number ${i}.`,
    };
    corpus.push(b);
    await promote(b);
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const st = await call("/stats");
  t(`${N} bundles promoted with their index rows in ${secs}s`, [st.bundles, st.indexed], [N, N]);
  const chk = await IDXCHK("limit=1000");
  t("the index agrees with the corpus at this size", [chk.ok, chk.checked], [true, N]);
}

console.log("\n--- paging a tied field partitions the set exactly ---");
{
  /* Without a declared total order a row can appear on two pages or on none,
     because SQLite is free to order tied rows differently between statements. It
     does not currently exercise that freedom at this size, so what these
     assertions prove is that paging is correct today, not that the tiebreak is
     load-bearing. The compile-time assertion in query.test.mjs is what holds the
     tiebreak in place. */
  for (const [label, qs] of [["criticality", "sort=criticality"], ["last updated", "sort=updated"], ["state", "sort=state"]]) {
    const seen = [];
    for (let off = 0; off < N; off += 7) {
      const r = await S(`q=&limit=7&offset=${off}&facets=none&${qs}`);
      seen.push(...r.hits.map((h) => h.bundle_id));
    }
    const uniq = new Set(seen);
    t(`paging by ${label} returns every row once`, [seen.length, uniq.size], [N, N]);
    t(`and omits none`, uniq.size === corpus.length, true);
  }
  const first = await S("q=&limit=10&sort=criticality&facets=none");
  const again = await S("q=&limit=10&sort=criticality&facets=none");
  t("the same page twice is the same page", again.hits.map((h) => h.bundle_id), first.hits.map((h) => h.bundle_id));
  const deep = await S(`q=&limit=10&offset=${N - 5}&sort=criticality&facets=none`);
  t("a deep page returns the tail and stops", deep.hits.length, 5);
}

console.log("\n--- ground truth: the compiler agrees with an independent count ---");
{
  const has = (b, w) => (`${b.title} ${b.body}`).toLowerCase().split(/[^a-z0-9]+/).includes(w);
  const cases = [
    ["q=alpha&facets=none", corpus.filter((b) => has(b, "alpha")).length],
    ["q=alpha+bravo&facets=none", corpus.filter((b) => has(b, "alpha") && has(b, "bravo")).length],
    ["q=alpha+OR+bravo&facets=none", corpus.filter((b) => has(b, "alpha") || has(b, "bravo")).length],
    ["q=alpha+-bravo&facets=none", corpus.filter((b) => has(b, "alpha") && !has(b, "bravo")).length],
    ["q=type:problem&facets=none", corpus.filter((b) => b.type === "problem").length],
    ["q=state:collected&facets=none", corpus.filter((b) => b.state === "collected").length],
    ["q=type:problem+state:collected&facets=none", corpus.filter((b) => b.type === "problem" && b.state === "collected").length],
    ["q=alpha+type:problem&facets=none", corpus.filter((b) => has(b, "alpha") && b.type === "problem").length],
    ["q=type:problem+-alpha&facets=none", corpus.filter((b) => b.type === "problem" && !has(b, "alpha")).length],
    ["q=annotations:>1&facets=none", corpus.filter((b) => b.ann > 1).length],
    [`q=${encodeURIComponent("(alpha OR bravo) AND type:problem")}&facets=none`,
      corpus.filter((b) => (has(b, "alpha") || has(b, "bravo")) && b.type === "problem").length],
    [`q=${encodeURIComponent("(alpha OR state:reviewed) AND type:problem")}&facets=none`,
      corpus.filter((b) => (has(b, "alpha") || b.state === "reviewed") && b.type === "problem").length],
  ];
  for (const [qs, want] of cases) {
    const got = (await S(qs)).total;
    t(`${decodeURIComponent(qs.replace("q=", "").replace("&facets=none", ""))} counts ${want}`, got, want);
  }
  /* Every shape is checked as a SET, not only as a count, because two different
     wrong answers can have the same size. */
  const ids = (await S("q=alpha+type:problem&mode=ids&facets=none")).ids.slice().sort();
  t("and the identities agree, not merely the sizes", ids,
    corpus.filter((b) => has(b, "alpha") && b.type === "problem").map((b) => b.id).sort());
}

console.log("\n--- facet counts and select-all at scale ---");
{
  /* Compared as sorted pairs. Facets come back ordered by count and then by
     value, which is a presentation order and not a set difference. */
  const pairs = (o) => Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1));
  const tally = (list) => { const o = {}; for (const b of list) o[b.state] = (o[b.state] || 0) + 1; return o; };
  const r = await S("q=");
  t("state facet counts agree with ground truth over the whole corpus",
    pairs(Object.fromEntries(r.facets.state.map((x) => [x.value, x.n]))), pairs(tally(corpus)));
  const filtered = await S("q=type:problem");
  t("and over a filtered set",
    pairs(Object.fromEntries(filtered.facets.state.map((x) => [x.value, x.n]))),
    pairs(tally(corpus.filter((b) => b.type === "problem"))));
  const all = await S("q=&mode=ids&facets=none");
  t("select-all returns the whole corpus", all.ids.length, N);
  t("with no duplicates", new Set(all.ids).size, N);
  t("and matches the page order for its first page",
    all.ids.slice(0, 10), (await S("q=&limit=10&facets=none")).hits.map((h) => h.bundle_id));
  const t0 = Date.now();
  const heavy = await S("q=alpha&sort=updated");
  console.log(`         (a broad text query with facets over ${N} bundles: ${Date.now() - t0}ms, ${heavy.total} hits)`);
  t("a broad query with facets still answers", heavy.total > 0, true);
}

await mf.dispose();

/* ------------------------------------------------------------------ *
 * Phase 3: the door. The viewer is stamped by the server.
 * ------------------------------------------------------------------ */
console.log("\n--- at the door: the caller does not choose whose view compiles ---");
const IDX = SRC("index.mjs");
const door = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "search-test", ADMIN_TOKEN: "BOOT-search-1",
              MEMBER_TOKEN: "mem-search-1", PROBE_TOKEN: "prb-search-1" },
});
{
  const j = async (p, init) => (await door.dispatchFetch("http://x" + p, init)).json();
  const MEM = "mem-search-1";
  const text = bundleMd(A);
  await j(`/api/?op=promote&token=${MEM}`, { method: "POST", body: JSON.stringify({
    bundleId: A.id, base: null, snapKey: "door", author: "seed",
    meta: { object_type: A.type, group: "g", title: A.title, current_state: A.state,
            created: A.created, last_updated: A.updated, criticality: A.crit },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  }) });

  const ok = await j(`/api/?op=search&q=transferred&token=${MEM}&facets=none`);
  t("a member searches and finds", ok.result.total, 1);
  t("and the gate reports member scope", ok.result.gate.scope, "member");
  /* A caller-supplied viewer is copied along with every other parameter, then
     OVERWRITTEN. If it were honoured, the gate would be whatever the caller
     said it was. */
  const forged = await j(`/api/?op=search&q=transferred&token=${MEM}&viewer=class%3Aadmin&facets=none`);
  t("a forged viewer parameter is overwritten by the server", forged.result.query.q, "transferred");
  t("and the scope is still the one the credential earned", forged.result.gate.scope, "member");
  const denied = await j(`/api/?op=search&q=transferred&viewer=class%3Amember&facets=none`);
  t("an unauthenticated caller with a forged viewer gets nothing at all", denied.error, "unauthenticated");
  t("there is no public class to grant search to",
    (await j(`/api/?op=search&q=transferred&token=pub-whatever`)).error, "unauthenticated");
  const fields = await j(`/api/?op=searchfields&token=${MEM}`);
  t("the query vocabulary is readable, so a UI need not keep its own copy",
    typeof fields.result.fields.locator.column, "string");
  const chk = await j(`/api/?op=searchindexcheck&token=${MEM}`);
  t("and the divergence checker answers at the door", chk.result.ok, true);
}
await door.dispose();

/* ------------------------------------------------------------------ *
 * Phase 4 (REC-204): THE ENVELOPE AS CONTENT (OFFICE-FORMATS.md "THE
 * ENVELOPE AS CONTENT"; DEC-5). A DOCX carrying a tracked insertion, a
 * tracked deletion, a comment and core properties, and a PPTX carrying a
 * slide's speaker notes, are ACQUIRED through `op=acquire` for real and
 * promoted with the acquire document, and the passage arm is asked for
 * each envelope item BY WHAT IT SAYS — the tracked change's author's name,
 * the speaker notes' words. Every hit must say ENVELOPE, in its extent
 * kind, its `ref` and its snippet, and must never be the body.
 *
 * The fixtures are built by an assembler that imports NOTHING from the
 * container readers (capture-text-index.test.mjs's discipline): a fixture
 * that inherited a reader's defect would agree with it for free.
 *
 * WHAT THIS PHASE CANNOT SEE: the envelope of an OpenDocument or a
 * workbook (the projection's part table is exercised for docx and pptx
 * only); the producers' other envelope kinds (formula, hidden-*), which
 * the design leaves out and the projection states it leaves out; a leg
 * CITING an envelope item, which needs leg grammar fields no leg carries
 * yet — the content row is minted here through `op=contentmint`'s extent
 * door instead.
 * ------------------------------------------------------------------ */
console.log("\n--- REC-204: an office document's envelope is content, searchable and LABELLED ---");
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return (c ^ 0xffffffff) >>> 0;
}
const u16 = (n) => Buffer.from([n & 0xff, (n >> 8) & 0xff]);
const u32 = (n) => Buffer.from([n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff]);
function zip(files) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const f of files) {
    const nameB = Buffer.from(f.name, "utf-8"), data = Buffer.from(f.data, "utf-8");
    const comp = deflateRawSync(data), crc = crc32(data);
    const local = Buffer.concat([u32(0x04034b50), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length), u16(nameB.length), u16(0), nameB, comp]);
    centrals.push(Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(8), u16(0), u16(0x21),
      u32(crc), u32(comp.length), u32(data.length), u16(nameB.length), u16(0), u16(0), u16(0), u16(0),
      u32(0), u32(offset), nameB]));
    locals.push(local); offset += local.length;
  }
  const cd = Buffer.concat(centrals);
  return new Uint8Array(Buffer.concat([...locals, cd, Buffer.concat([u32(0x06054b50), u16(0), u16(0),
    u16(files.length), u16(files.length), u32(cd.length), u32(offset), u16(0)])]));
}
/* The names are the ENVELOPE'S and appear nowhere in any body or bundle.md —
   which is what makes a hit on them a statement about the envelope. */
const TC_AUTHOR = "Quillon Marbury", DEL_AUTHOR = "Ottoline Vasquez-Brandt";
const COMMENTER = "Perpetua Okonkwo", CREATOR = "Hollis Fenwright", MODIFIER = "Seraphina Dunleavy";
const INSERTED = "subject to a second reading", REMOVED = "without further notice";
const COMMENT_TEXT = "Legal has not cleared this paragraph";
const NOTES_TERM = "zephyrine", NOTES = `Do not mention the ${NOTES_TERM} settlement figure aloud.`;
const BODY_TERM = "gallimaufry";
const DOCX_CT = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const PPTX_CT = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const WNS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
const CT_HEAD = `<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>`;
const RELS = (inner) => `<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${inner}</Relationships>`;
const REL = (id, type, target) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`;
const CORE = `<?xml version="1.0"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"><dc:title>Midcycle memo</dc:title><dc:creator>${CREATOR}</dc:creator><cp:lastModifiedBy>${MODIFIER}</cp:lastModifiedBy><cp:revision>7</cp:revision></cp:coreProperties>`;
const ENV_DOCX = zip([
  { name: "[Content_Types].xml", data: CT_HEAD + `<Override PartName="/word/document.xml" ContentType="${DOCX_CT}.main+xml"/></Types>` },
  { name: "_rels/.rels", data: RELS(REL("rId1", "officeDocument", "word/document.xml")) },
  { name: "docProps/core.xml", data: CORE },
  { name: "word/document.xml", data: `<?xml version="1.0" encoding="UTF-8"?><w:document ${WNS}><w:body>`
      + `<w:p><w:r><w:t>The ${BODY_TERM} reserve is appropriated</w:t></w:r>`
      + `<w:ins w:id="1" w:author="${TC_AUTHOR}" w:date="2026-05-01T10:00:00Z"><w:r><w:t> ${INSERTED}</w:t></w:r></w:ins></w:p>`
      + `<w:p><w:commentRangeStart w:id="0"/><w:r><w:t>Payments cease</w:t></w:r>`
      + `<w:del w:id="2" w:author="${DEL_AUTHOR}" w:date="2026-05-02T11:00:00Z"><w:r><w:delText> ${REMOVED}</w:delText></w:r></w:del>`
      + `<w:commentRangeEnd w:id="0"/><w:r><w:commentReference w:id="0"/></w:r></w:p>`
      + `</w:body></w:document>` },
  { name: "word/comments.xml", data: `<?xml version="1.0"?><w:comments ${WNS}><w:comment w:id="0" w:author="${COMMENTER}" w:date="2026-05-03T09:00:00Z" w:initials="PO"><w:p><w:r><w:t>${COMMENT_TEXT}</w:t></w:r></w:p></w:comment></w:comments>` },
  { name: "word/_rels/document.xml.rels", data: RELS("") },
]);
const PNS = 'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
const spOf = (txt) => `<p:sp><p:txBody><a:p><a:r><a:t>${txt}</a:t></a:r></a:p></p:txBody></p:sp>`;
const ENV_PPTX = zip([
  { name: "[Content_Types].xml", data: CT_HEAD + `<Override PartName="/ppt/presentation.xml" ContentType="${PPTX_CT}.main+xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/><Override PartName="/ppt/notesSlides/notesSlide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/></Types>` },
  { name: "_rels/.rels", data: RELS(REL("rId1", "officeDocument", "ppt/presentation.xml")) },
  { name: "ppt/presentation.xml", data: `<?xml version="1.0"?><p:presentation ${PNS}><p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst></p:presentation>` },
  { name: "ppt/_rels/presentation.xml.rels", data: RELS(REL("rId2", "slide", "slides/slide1.xml")) },
  { name: "ppt/slides/slide1.xml", data: `<?xml version="1.0"?><p:sld ${PNS}><p:cSld><p:spTree>${spOf("SETTLEMENT UPDATE")}</p:spTree></p:cSld></p:sld>` },
  { name: "ppt/slides/_rels/slide1.xml.rels", data: RELS(REL("rId1", "notesSlide", "../notesSlides/notesSlide1.xml")) },
  { name: "ppt/notesSlides/notesSlide1.xml", data: `<?xml version="1.0"?><p:notes ${PNS}><p:cSld><p:spTree>${spOf(NOTES)}</p:spTree></p:cSld></p:notes>` },
]);
const env4 = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { VERSION: "search-test", ADMIN_TOKEN: "adm-rec204", MEMBER_TOKEN: "mem-rec204",
              PROBE_TOKEN: "prb-rec204", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const bin = (b, ct) => new Response(b, { headers: { "content-type": ct } });
    if (u.pathname === "/memo.docx") return bin(ENV_DOCX, DOCX_CT);
    if (u.pathname === "/deck.pptx") return bin(ENV_PPTX, PPTX_CT);
    return new Response("unscripted", { status: 500 });
  },
});
{
  const unwrap = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
  const MEM = "mem-rec204";
  const get4 = async (op, qs = "") => unwrap(await (await env4.dispatchFetch(
    `http://x/api/?op=${op}&token=${MEM}&${qs}`)).json());
  const post4 = async (op, body) => unwrap(await (await env4.dispatchFetch(
    `http://x/api/?op=${op}&token=${MEM}`, { method: "POST", body: JSON.stringify(body) })).json());
  const acquire4 = async (path) => (await (await env4.dispatchFetch(`http://x/api/?op=acquire&token=${MEM}`,
    { method: "POST", body: JSON.stringify({ locator: "https://www.oaklandca.gov" + path,
                                             authority: "City of Oakland" }) })).json()).document;
  const NOW4 = "2026-09-25T00:00:00Z";
  const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
    `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
    `created: "${NOW4}"`, `last_updated: "${NOW4}"`,
    "produced_by:", "  mode: assisted", "  capability_tier: session",
    "group: believe-in-oakland", "references: []", "state_history: []", "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", "criticality: supporting", "source_status: unchanged",
    "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW4}`,
    "monitoring:", "  enabled: false", "  frequency: none",
    "---", "", "## Summary", "", "A captured document.", "",
    "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  let snap = 0;
  const promote4 = async (id, document) => {
    const text = infoMd(id), prov = JSON.stringify({ documents: [document] });
    const r = await post4("promote", {
      bundleId: id, base: null,
      snapKey: `20260925T${String(100000 + (++snap)).slice(-6)}Z_${sha(String(snap)).slice(0, 8)}`,
      /* CORRECTED 2026-09-25 at the c22-batch30 union (D-563, C-86.3, which landed beside REC-204), never
         exempted: the label `Bundle ${id}` contradicted the document's own title (`Info ${id}`) and is now
         refused ENVELOPE_TITLE_DISAGREES; the request names no title, so the record goes by the document's. */
      meta: { object_type: "information", group: "believe-in-oakland",
              current_state: "collected", created: NOW4, last_updated: NOW4 },
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
              { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
      register: [{ sha256: document.capture.sha256, path: document.file || "data/doc.bin",
                   encoding: "binary", bytes: document.capture.bytes || 10 }] });
    if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
    return r;
  };
  const passage = async (term) => get4("meaningrows",
    `rows=passage&q=${encodeURIComponent(`passage:${JSON.stringify(term)}`)}`);

  const memo = await acquire4("/memo.docx");
  const deck = await acquire4("/deck.pptx");
  const envUnits = (d) => (d?.text_units || []).filter((u) => u.extent?.kind === "envelope");
  /* THE FIXTURE IS NOT EMPTY, printed and floored: a totality assertion over
     an empty envelope passes for free (W34). */
  console.log(`  corpus: memo.docx ${memo?.text_units?.length ?? -1} unit(s), ${envUnits(memo).length} envelope; `
            + `deck.pptx ${deck?.text_units?.length ?? -1} unit(s), ${envUnits(deck).length} envelope`);
  t("REC-204: op=acquire projects the DOCX envelope — 2 tracked changes, 1 comment, 4 core properties "
  + "(title, creator, lastModifiedBy, revision), each ONE unit of kind `envelope`",
    envUnits(memo).map((u) => u.extent.item + (u.extent.name ? `:${u.extent.name}` : "")).sort(),
    ["comment", "core-property:creator", "core-property:lastModifiedBy", "core-property:revision",
     "core-property:title", "tracked-change", "tracked-change"]);
  t("...and the deck's speaker notes, ONE envelope unit anchored at the slide, beside the slide's own unit",
    [envUnits(deck).map((u) => [u.extent.item, u.extent.at?.kind, u.extent.at?.slide]),
     (deck?.text_units || []).filter((u) => u.extent?.kind === "slide-shape").length],
    [[["speaker-note", "slide-shape", 1]], 1]);
  /* NON-EMPTY FIRST: `Math.min()` of nothing is Infinity, which is "after"
     everything — the negative control caught this assertion passing over an
     envelope the arm had emptied. */
  t("the envelope comes AFTER the body in reading order, so a bound drops it before a paragraph",
    envUnits(memo).length > 0 && Math.min(...envUnits(memo).map((u) => u.seq))
      > Math.max(...(memo?.text_units || []).filter((u) => u.extent?.kind === "doc-para").map((u) => u.seq)), true);
  t("the speaker notes are NOT folded into the slide's unit (DEC-5: never merged)",
    (deck?.text_units || []).filter((u) => u.extent?.kind === "slide-shape")
      .some((u) => u.text.includes(NOTES_TERM)), false);

  await promote4("INFO-2026-0204-memo", memo);
  await promote4("INFO-2026-0204-deck", deck);

  /* THE ACCEPTANCE. A passage search for the tracked change's AUTHOR, by name. */
  const byAuthor = await passage("Marbury");
  const hit = byAuthor?.rows?.[0] || {};
  console.log(`  passage:"Marbury" -> ${byAuthor?.count ?? -1} row(s): ${JSON.stringify(hit.ref ?? null)} | ${JSON.stringify(hit.snippet ?? null)}`);
  t("REC-204 ACCEPTS: a passage search finds the tracked-change AUTHOR by name — exactly one unit",
    [byAuthor?.ok, byAuthor?.count], [true, 1]);
  t("...LABELLED as envelope in its extent kind, and the extent names the item's kind",
    [hit.extent_kind, typeof hit.extent === "string" ? JSON.parse(hit.extent).item : null,
     typeof hit.extent === "string" ? JSON.parse(hit.extent).cited_as : null],
    ["envelope", "tracked-change", "envelope"]);
  t("...in its `ref`, the record's own sentence, which opens with the word envelope",
    /^envelope: a tracked change at ¶1$/.test(String(hit.ref)), true);
  t("...and in its SNIPPET, so the one line a member reads beside the hit says it is not the body",
    /ENVELOPE/.test(String(hit.snippet)) && String(hit.snippet).includes("[Marbury]"), true);
  /* ASKED BY IDENTITY, NOT BY SNIPPET: the snippet is a window centred on the
     matched words and cuts the author off a long line, so the first draft of
     this assertion (author inside the removed-wording snippet) was wrong about
     the instrument, not the product. The same UNIT must answer both names. */
  const removed = await passage(REMOVED), deleter = await passage("Ottoline");
  t("the removed wording is searchable, and its author finds the SAME unit — a deletion is evidence (DEC-5)",
    [removed?.rows?.map((r) => [r.extent_kind, r.ref]), deleter?.rows?.[0]?.extent === removed?.rows?.[0]?.extent],
    [[["envelope", "envelope: a tracked change at ¶2"]], true]);
  t("a COMMENTER is found by name, labelled envelope, anchored at the paragraph the comment marks",
    (await passage("Okonkwo"))?.rows?.map((r) => [r.extent_kind, r.ref]), [["envelope", "envelope: a comment at ¶2"]]);
  t("the core properties are found by name, each labelled with the property it is",
    (await passage("Fenwright"))?.rows?.map((r) => [r.extent_kind, r.ref]),
    [["envelope", "envelope: a core property 'creator'"]]);

  /* THE ACCEPTANCE'S SECOND HALF: speaker-note text. */
  const byNotes = await passage(NOTES_TERM);
  console.log(`  passage:"${NOTES_TERM}" -> ${byNotes?.count ?? -1} row(s): ${JSON.stringify(byNotes?.rows?.[0]?.ref ?? null)}`);
  t("REC-204 ACCEPTS: a passage search finds SPEAKER-NOTE text, one unit, labelled as envelope",
    [byNotes?.count, byNotes?.rows?.[0]?.extent_kind, byNotes?.rows?.[0]?.ref],
    [1, "envelope", "envelope: a slide's speaker notes at slide 1"]);

  /* OVER-STRICTNESS: the body is still the body. The inserted words are in the
     served document's text AND in the envelope's record of who inserted them,
     so a search for them returns BOTH, each under its own kind — never one
     collapsed into the other. */
  t("the BODY is untouched: a body-only term returns the paragraph, as doc-para, and no envelope unit",
    (await passage(BODY_TERM))?.rows?.map((r) => r.extent_kind), ["doc-para"]);
  t("inserted words are the body's AND the envelope's, and the two hits stay two kinds",
    ((await passage(INSERTED))?.rows || []).map((r) => r.extent_kind).sort(), ["doc-para", "envelope"]);

  /* THE GRADE AND `cited_as`. The hit is an ADDRESS; minting it gives a content
     row that carries the capture's chain and cap — the same a body paragraph of
     the same capture carries — and `cited_as: envelope`. */
  /* Guarded, so an arm that empties the index fails the assertions below BY
     NAME instead of killing the suite before its foot (W30). */
  let extent = { kind: "envelope" };
  try { if (typeof hit.extent === "string") extent = JSON.parse(hit.extent); } catch { /* stays the stub */ }
  const mint = await post4("contentmint", { bundleId: "INFO-2026-0204-memo", extent });
  const para = await post4("contentmint", { bundleId: "INFO-2026-0204-memo",
                                            extent: { kind: "doc-para", para: 0 } });
  console.log(`  contentmint(envelope) -> ${JSON.stringify({ ok: mint?.ok, cited_as: mint?.cited_as, cap: mint?.derivation_cap, reason: mint?.reason ?? null, detail: mint?.detail ?? null }).slice(0, 400)}`);
  t("an envelope hit mints a content row whose `cited_as` is `envelope`, never `text`",
    [mint?.ok, mint?.extent_kind, mint?.cited_as], [true, "envelope", "envelope"]);
  t("...carrying the CAPTURE's grade: the same chain and derivation cap as a body paragraph of it",
    /* The chain must be NON-EMPTY for the equality to mean anything: two null
       chains agree on nothing (W24). The cap is null on BOTH — a docx layer
       read carries no measured letter — and that null is the capture's own. */
    [JSON.stringify(mint?.chain), mint?.derivation_cap, Array.isArray(mint?.chain) && mint.chain.length > 0],
    [JSON.stringify(para?.chain), para?.derivation_cap, true]);
  t("...and the passage row now names it, so the hit IS the row's identity (section 4.5)",
    /* A 64-hex id on BOTH sides: under the negative control both were
       `undefined`, and two absences agreed for free (W24). */
    [/^[0-9a-f]{64}$/.test(String(mint?.content_id)),
     (await passage("Marbury"))?.rows?.[0]?.content_id === mint?.content_id], [true, true]);
  const asBody = await post4("contentmint", { bundleId: "INFO-2026-0204-memo", extent: { ...extent, cited_as: "text" } });
  t("an envelope item cited as the BODY (`cited_as: text`) is refused by name, never admitted",
    [asBody?.ok, asBody?.code ?? asBody?.reason], [false, "CONTENT_EXTENT_UNREADABLE"]);
  const bodyAsEnv = await post4("contentmint", { bundleId: "INFO-2026-0204-memo",
                                                 extent: { kind: "doc-para", para: 0, cited_as: "envelope" } });
  t("...and a body paragraph cited AS the envelope is refused the same way",
    [bodyAsEnv?.ok, bodyAsEnv?.code ?? bodyAsEnv?.reason], [false, "CONTENT_EXTENT_UNREADABLE"]);
}
await env4.dispose();

console.log(`\nsearch: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
