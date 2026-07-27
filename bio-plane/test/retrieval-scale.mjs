/* D-32: measure the SHIPPED retrieval path at the size it was designed for.
 *
 * The 20,000-bundle actuals in docs/development/RETRIEVAL-SUBSTRATE.md were
 * taken with test/facet-probe-worker.mjs, a probe Durable Object that is NOT the
 * plane: its own tables, its own text index, no viewer gate, no CTE scoping, no
 * provenance projection, no facet pass, no selections. Those numbers said the
 * SUBSTRATE was affordable. They did not say this code is.
 *
 * So this loads a corpus through the real `promote`, against the real
 * src/store.mjs, and drives the real `op=search` and `op=select`. Same engine
 * the deployment runs, since Miniflare is workerd. Not part of `npm test`: it
 * takes minutes.
 *
 *   node test/retrieval-scale.mjs [n]     default 20000
 *
 * Every timing is the MIN of five runs, matching how probe 2 reported, so the
 * two tables can be read against each other.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const N = Number(process.argv[2]) || 20000;
const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

const mf = new Miniflare({
  modules: true, script: readFileSync(SRC("store.mjs"), "utf8"),
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => {
  const r = await (await mf.dispatchFetch("http://x" + p,
    body ? { method: "POST", body: JSON.stringify(body) } : {})).json();
  if (!r || r.result === undefined) throw new Error("call failed: " + p.slice(0, 60) + " -> " + JSON.stringify(r).slice(0, 400));
  return r.result;
};

/* A corpus shaped like the real one: heterogeneous types and schema versions,
   a dominant value and a rare value on the filter fields, and heavy ties on
   criticality and coarse dates, because ties are what a sorted page gets wrong. */
const STATES = ["collected", "reviewed", "surfaced", "retired"];
const WORDS = ["sewer", "fund", "transfer", "auditor", "billing", "ratepayer", "franchise", "general"];
const RARE = "hapaxlegomenon";

/* The filter fields must be INDEPENDENT of the word choice, or a shape like
   "broad text AND a state" measures an empty intersection and reports a fast
   zero as if it were a fast answer. The first draft of this bench derived both
   from i modulo powers of two and produced exactly that: `fund state:collected`
   returned 0 because the two conditions could not co-occur. */
const mix = (i) => (Math.imul(i ^ 0x9e3779b9, 0x85ebca6b) >>> 0);
const bundleFor = (i) => {
  const h = mix(i);
  const type = h % 7 === 0 ? "problem" : "information";
  const id = `INFO-2026-${String(100000 + i)}-scale`;
  const words = [WORDS[i % 8], WORDS[(i * 3) % 8], WORDS[(i * 5) % 8]].join(" ");
  const body = `${words} record ${i}.` + (i % 500 === 0 ? ` ${RARE}` : "");
  const text = `---
id: ${id}
object_type: ${type}
schema: ${type === "problem" ? "problem@1" : "information@2"}
title: "Record ${i} ${WORDS[i % 8]}"
current_state: ${STATES[h % 4]}
created: "2026-01-01T00:00:00Z"
last_updated: "2026-07-${String(1 + (h % 28)).padStart(2, "0")}T00:00:00Z"
criticality: ${h % 11 === 0 ? "crucial" : "notable"}
group: believe-in-oakland
references: []
produced_by:
  mode: ${h % 3 === 0 ? "agent" : "interactive_chat"}
  capability_tier: standard
source:
  locator: "https://oaklandca.opengov.com/r/${i}"
  authority: "Oakland OpenGov portal"
  retrieved: "2026-07-01"
source_status: ${h % 9 === 0 ? "modified" : "unchanged"}
annotations_open: ${h % 5}
monitoring:
  enabled: ${h % 4 === 0}
  frequency: monthly
---

${body}
`;
  return { id, type, text, meta: {
    object_type: type, group: "believe-in-oakland", title: `Record ${i} ${WORDS[i % 8]}`,
    current_state: STATES[h % 4], created: "2026-01-01T00:00:00Z",
    last_updated: `2026-07-${String(1 + (h % 28)).padStart(2, "0")}T00:00:00Z`,
    criticality: h % 11 === 0 ? "crucial" : "notable" } };
};

console.log(`\nLoading ${N} bundles through the real promote path...`);
const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const b = bundleFor(i);
  const r = await call("/promote", {
    bundleId: b.id, base: null, snapKey: `${b.id}-new`, author: "bench",
    files: [{ path: "bundle.md", text: b.text, bytes: b.text.length, sha256: sha(b.text) }],
    meta: b.meta,
  });
  if (!r.ok) { console.error("promote failed at", i, JSON.stringify(r)); process.exit(1); }
  if ((i + 1) % 2500 === 0) console.log(`  ${i + 1} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
const loadSecs = (Date.now() - t0) / 1000;
const st = await call("/stats");
console.log(`Loaded in ${loadSecs.toFixed(0)}s (${(loadSecs * 1000 / N).toFixed(2)}ms per promote, index written in the same transaction)`);
console.log(`Store: ${st.bundles} bundles, ${st.indexed} indexed, ${(st.dbBytes / 1048576).toFixed(1)}MB\n`);

const best = async (label, qs, viewer) => {
  let min = Infinity, total = null;
  for (let k = 0; k < 5; k++) {
    const a = Date.now();
    const r = await call("/search?viewer=class:member&owner=class:member&" + qs);
    const ms = Date.now() - a;
    if (ms < min) min = ms;
    total = r.total ?? (r.ids ? r.ids.length : null);
  }
  console.log(`  ${String(min).padStart(5)}ms  ${String(total).padStart(7)} hits   ${label}`);
  return { label, ms: min, total };
};

console.log("Query shapes, min of five, facets off unless the shape is a facet shape:");
const rows = [];
rows.push(await best("text, selective", `q=${RARE}&facets=none`));
rows.push(await best("text, broad", "q=fund&facets=none"));
rows.push(await best("text, bare two-word AND", "q=fund%20record&facets=none"));
rows.push(await best("metadata only, rare value", "q=criticality:crucial&facets=none"));
rows.push(await best("metadata only, dominant value", "q=criticality:notable&facets=none"));
rows.push(await best("metadata, two fields", "q=type:problem%20state:collected&facets=none"));
rows.push(await best("text AND metadata, selective", `q=${RARE}%20type:information&facets=none`));
rows.push(await best("text AND metadata, broad", "q=fund%20state:collected&facets=none"));
rows.push(await best("metadata AND time range", "q=updated:2026-07-05..2026-07-20&facets=none"));
rows.push(await best("sorted by last_updated desc", "q=fund&sort=updated&facets=none"));
rows.push(await best("sorted by a heavily tied field", "q=&sort=criticality&facets=none"));
rows.push(await best("nested boolean, text OR metadata AND metadata",
  "q=(fund%20OR%20state:retired)%20AND%20type:problem&facets=none"));
rows.push(await best("NOT over a broad text arm", "q=type:problem%20-fund&facets=none"));
rows.push(await best("deep page, offset 2000", "q=&offset=2000&facets=none"));
rows.push(await best("ranked page with bm25 and snippets", "q=fund&limit=50&facets=none"));
rows.push(await best("facet sidebar over the whole corpus", "q="));
rows.push(await best("facet sidebar after a broad text filter", "q=fund"));
rows.push(await best("facet sidebar after a metadata filter", "q=criticality:notable"));
/* D-15. Every shape above runs as `class:member`, a MACHINE credential, which
   the viewer predicate deliberately does not filter: a shared instance token has
   no participation to check. So none of them measure the participation filter at
   all, and shipping it on those numbers would be measuring the wrong path. An
   identified session compiles two EXISTS subqueries into every statement, and
   this is what that costs. */
{
  const flat = await best("whole corpus as a machine credential", "q=&facets=none");
  const held = await best("whole corpus as an identified member", "q=&facets=none",
                          "member:bench-member");
  console.log(`  participation filter: ${flat.ms}ms flat vs ${held.ms}ms filtered`
    + ` (${(held.ms / Math.max(flat.ms, 1)).toFixed(2)}x)`);
  rows.push(held);
}
rows.push(await best("select-all, every id", "q=&mode=ids&facets=none"));
rows.push(await best("select-all after a filter", "q=type:problem&mode=ids&facets=none"));

/* D-32, head to head. The debt register named two remaining options and the
   only honest way to choose between them is to run both over the same corpus
   through the real op. `scan` pulls the facet columns of every row in scope and
   counts in JS; `groupby` makes SQLite aggregate and sort per field. */
console.log("\nFacet strategy, head to head (D-32), min of five:");
console.log("  shape                                  groupby      scan   verdict");
const facetShapes = [
  ["sidebar over the whole corpus", "q="],
  ["sidebar after a broad text filter", "q=fund"],
  ["sidebar after a metadata filter", "q=criticality:notable"],
  ["sidebar on a selective text filter", `q=${RARE}`],
  ["sidebar on an empty result", "q=zzzznothingmatches"],
];
const facetRows = [];
for (const [label, qs] of facetShapes) {
  const run = async (mode) => {
    let min = Infinity, snap = null;
    for (let k = 0; k < 5; k++) {
      const a = Date.now();
      const r = await call(`/search?viewer=class:member&owner=class:member&facetmode=${mode}&${qs}`);
      const ms = Date.now() - a;
      if (ms < min) { min = ms; }
      snap = JSON.stringify(r.facets);
    }
    return { ms: min, snap };
  };
  const g = await run("groupby"), s = await run("scan");
  /* Agreement at SIZE, not only in the suite. The suite compares the two forms
     over a handful of bundles; a disagreement that only appears once SQLite
     changes plan would slip straight past it. */
  const agree = g.snap === s.snap;
  const verdict = !agree ? "DISAGREE" : `${(g.ms / Math.max(s.ms, 1)).toFixed(1)}x ${s.ms < g.ms ? "scan" : "groupby"}`;
  console.log(`  ${label.padEnd(38)}${String(g.ms + "ms").padStart(7)}${String(s.ms + "ms").padStart(10)}   ${verdict}`);
  facetRows.push({ label, groupby: g.ms, scan: s.ms, agree });
}
const disagreed = facetRows.filter((r) => !r.agree);
console.log(disagreed.length
  ? `  DISAGREEMENT on ${disagreed.length} shape(s): the fast path is not the same answer, which is a defect not a tradeoff`
  : "  both strategies returned identical counts on every shape");

/* D-33. The id tiebreak was required by ARGUMENT and by a compile-time
   assertion, never by anything that ran. `test/search.test.mjs` pages 600 tied
   rows and still passes with the tiebreak removed, because at that size SQLite
   happens to return tied rows in a stable order. The hazard is that the delivery
   order is a property of the QUERY PLAN, and the plan changes with corpus size,
   with an added index, and with an engine upgrade. So the check belongs here, at
   a size where the sorter actually spills: page the whole corpus on a heavily
   tied field and require the pages to partition it exactly. A row appearing
   twice or not at all is the failure this tiebreak exists to prevent, and until
   now nothing would have caught it. */
console.log("\nPaging integrity on a heavily tied sort (D-33):");
{
  const PAGE = 500;
  const seen = new Map();
  let pages = 0;
  for (let off = 0; off < N; off += PAGE) {
    const r = await call(`/search?viewer=class:member&owner=class:member&q=&sort=criticality&facets=none&limit=${PAGE}&offset=${off}`);
    pages++;
    for (const h of r.hits) seen.set(h.bundle_id, (seen.get(h.bundle_id) || 0) + 1);
  }
  const dupes = [...seen.entries()].filter(([, n]) => n > 1);
  const total = await call("/search?viewer=class:member&owner=class:member&q=&facets=none&mode=count");
  const expect = total.total ?? N;
  console.log(`  ${pages} pages of ${PAGE} over a field with ${Math.round(N / 2)}-way ties`);
  console.log(`  distinct rows delivered: ${seen.size} of ${expect}`);
  console.log(`  rows delivered twice:    ${dupes.length}`);
  console.log(`  rows never delivered:    ${expect - seen.size}`);
  console.log(seen.size === expect && dupes.length === 0
    ? "  the pages partition the corpus exactly: the tiebreak holds at spill size"
    : "  PAGING IS WRONG: the tiebreak does not hold at this size");
}
const selBest = async (label, fn) => {
  let min = Infinity, out = null;
  for (let k = 0; k < 5; k++) { const a = Date.now(); out = await fn(); const ms = Date.now() - a; if (ms < min) min = ms; }
  console.log(`  ${String(min).padStart(5)}ms  ${String(out?.n ?? "").padStart(7)}        ${label}`);
  return out;
};
const qsel = await selBest("create a query selection over the whole corpus",
  () => call("/select?viewer=class:member&owner=class:member&q="));
await selBest("resolve it", () => call(`/selection?handle=${qsel.handle}&viewer=class:member&owner=class:member`));
const ids = (await call("/search?viewer=class:member&owner=class:member&q=criticality:crucial&mode=ids&facets=none")).ids.slice(0, 2000);
const esel = await selBest(`create an enumerated selection of ${ids.length}`,
  () => call("/select?viewer=class:member&owner=class:member&q=", { ids }));
await selBest("resolve it, with drift detection over every item",
  () => call(`/selection?handle=${esel.handle}&viewer=class:member&owner=class:member`));
const s2 = await call("/stats");
console.log(`  stored selection rows: ${s2.selectionItems} for ${s2.selections} selections `
          + `(a query selection stores none, which is the point)`);

console.log("\nIntegrity at this size:");
let checked = 0, findings = 0, cursor = "";
const c0 = Date.now();
for (;;) {
  const r = await call(`/searchindexcheck?after=${encodeURIComponent(cursor)}&limit=1000`);
  checked += r.checked; findings += r.findings.length;
  if (!r.cursor) { console.log(`  index vs corpus: ${checked} checked, ${findings} findings, `
    + `${r.orphans.length} orphans, ${((Date.now() - c0) / 1000).toFixed(1)}s`); break; }
  cursor = r.cursor;
}

const worst = rows.reduce((a, b) => (b.ms > a.ms ? b : a));
console.log(`\nWorst shape: ${worst.ms}ms (${worst.label}).`);
console.log(`Probe 2 recorded nothing above ~46ms at 20,000 for the SUBSTRATE.`);
console.log(`This is the shipped path, gate and provenance and facets included.\n`);
await mf.dispose();
process.exit(0);
