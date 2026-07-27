/* Retrieval end to end, S-10 steps 2 to 4.
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
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
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
  const chk = await call("/searchindexcheck");
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
    (await call(`/projection?id=${C.id}`)).bundle_sha,
    "# Analysis\n\nThe comptroller signed the requisition without a resolution.");
  t("the revision lands", r.ok, true);
  t("a word only present in analysis.md is searchable",
    (await S("q=comptroller&facets=none")).hits.map((h) => h.bundle_id), [C.id]);
  t("and the index still agrees with the corpus", (await call("/searchindexcheck")).ok, true);
}

console.log("\n--- a revision replaces its index row, so the index cannot lag the document ---");
{
  const before = (await call(`/projection?id=${B.id}`)).bundle_sha;
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
  t("and the checker still agrees", (await call("/searchindexcheck")).ok, true);
}

console.log("\n--- the divergence checker can say no: a deliberately broken index ---");
{
  /* A verifier that says yes to everything says nothing, so break the index and
     require the checker to name what is wrong. */
  t("clearing one bundle's derived state reports what it cleared",
    (await call("/projectionclear", { bundleId: A.id })).scope, A.id);
  const chk = await call("/searchindexcheck");
  t("the checker refuses to pass", chk.ok, false);
  t("and names the bundle and the reason",
    chk.findings.map((f) => [f.bundleId, f.finding]), [[A.id, "NO_FTS_ID"]]);
  t("the counts disagree, which is the cheap signal", [chk.counts.bundles, chk.counts.indexed], [3, 2]);
  t("the broken bundle is unfindable while the index is broken", (await S("q=transferred&facets=none")).total, 0);
  const rep = await call("/reproject", {});
  t("repair reports what it rebuilt", [rep.reprojected, rep.reindexed, rep.remaining], [1, 1, 0]);
  t("the checker passes again", (await call("/searchindexcheck")).ok, true);
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
  t("with no orphan left anywhere", (await call("/searchindexcheck")).orphans, []);
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
  t("and it is scored", typeof h.score, "number");
  t("a metadata-only query returns provenance with no score",
    (await S("q=state:collected&facets=none")).hits[0].score, null);
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

console.log("\n--- facet counts drive the filter sidebar ---");
{
  const r = await S("q=");
  const truth = {};
  for (const b of [A, { ...B, title: "Water billing reconciliation" }, C])
    truth[b.state] = (truth[b.state] || 0) + 1;
  t("state counts agree with ground truth",
    Object.fromEntries(r.facets.state.map((x) => [x.value, x.n])), truth);
  t("the type facet counts both types, the legacy one under its canonical name",
    Object.fromEntries(Object.entries(Object.fromEntries(r.facets.type.map((x) => [x.value, x.n]))).sort()), { focus: 1, information: 2 });
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
  const chk = await call(`/searchindexcheck?limit=1000`);
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

console.log(`\nsearch: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
