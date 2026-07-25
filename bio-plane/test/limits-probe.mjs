/* What are workerd's actual SQL limits?
 *
 * D-36's open item is not the two ceilings already found, it is the CLASS. Both
 * were discovered by a bench hitting them in production-shaped code, one at a
 * time, after they had already broken something. Both sit orders of magnitude
 * below SQLite's documented defaults, neither is in Cloudflare's published
 * behaviour, and the register's own conclusion is that any new statement shape
 * can meet another one.
 *
 * So: stop discovering them one at a time. This binary-searches each limit
 * directly against a real Durable Object and prints the number, so a session
 * adding a statement shape can read the ceiling instead of finding it.
 *
 * Every probe is CONSTRUCTED to isolate one limit and is checked against the
 * value the code currently assumes. A probe that cannot fail tells you nothing,
 * so each one also confirms it still succeeds one step below the ceiling it
 * reports.
 *
 * Not part of `npm test`: it exists to be run when a statement shape changes, or
 * when workerd is upgraded and these numbers may have moved under us.
 * `npm run probe:limits`.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, script: readFileSync(SRC, "utf8"),
  modulesRoot: "/", scriptPath: SRC,
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});

/* op=sqlprobe does not exist and must not: the store executes compiled
   statements only. So the probe drives limits through the ops that BUILD the
   shapes, which is also the honest thing to measure, since a limit only matters
   where real code meets it. */
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

const sha = (await import("node:crypto")).createHash;
const h = (s) => sha("sha256").update(s).digest("hex");

const md = (id) => `---
id: ${id}
object_type: information
schema: information@1
title: "Probe ${id}"
current_state: collected
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-01T00:00:00Z"
produced_by:
  mode: assisted
  capability_tier: session
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
criticality: supporting
classification: fact
source_status: unchanged
source:
  locator: "https://example.org/${id}"
  authority: "probe"
  retrieved: "2026-07-01"
monitoring:
  enabled: false
  frequency: none
---

## Summary

Probe body alpha bravo charlie.

## Provenance Notes

Probe.

## Session Log

### Session 2026-07-01T00:00:00Z | Probe | assisted
Trigger: probe
Changes: created.

## Review Notes

`;

const SEED = 400;
process.stdout.write(`seeding ${SEED} bundles`);
const ids = [];
for (let i = 0; i < SEED; i++) {
  const id = `INFO-2026-${String(3000 + i).padStart(4, "0")}-probe`;
  ids.push(id);
  const text = md(id);
  await call("/promote", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "probe",
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: h(text) }],
    meta: { object_type: "information", group: "believe-in-oakland", title: "probe",
            current_state: "collected", created: "2026-07-01T00:00:00Z",
            last_updated: "2026-07-01T00:00:00Z", criticality: "supporting", classification: "fact" },
  });
  if (i % 100 === 0) process.stdout.write(".");
}
console.log(" done\n");

/* Binary search the largest n for which `probe(n)` succeeds. Reports the
   boundary and the error text at the first failure, because the message is what
   a future session will grep for. */
async function ceiling(name, lo, hi, probe, assumed) {
  let good = null, firstErr = null;
  // confirm the floor works at all, or the search is meaningless
  const base = await probe(lo);
  if (!base.ok) {
    console.log(`  ${name.padEnd(46)} FLOOR FAILS at ${lo}: ${String(base.err).slice(0, 70)}`);
    return null;
  }
  let a = lo, b = hi;
  while (a <= b) {
    const mid = Math.floor((a + b) / 2);
    const r = await probe(mid);
    if (r.ok) { good = mid; a = mid + 1; }
    else { if (!firstErr) firstErr = r.err; b = mid - 1; }
  }
  /* THE HONESTY CHECK. A binary search that never saw a failure has not found a
     ceiling, it has found the top of the range it was given, and reporting that
     number as a limit is exactly the verifier-that-says-yes-to-everything this
     repository keeps warning about. The first draft of this probe reported four
     "ceilings" that were all just `hi`. */
  if (firstErr === null) {
    console.log(`  ${name.padEnd(46)} ${String("none <" + hi).padStart(10)}  (never failed up to ${hi}; NOT a measured ceiling)`);
    return null;
  }
  const verdict = assumed === undefined ? ""
    : good >= assumed ? `  (code assumes ${assumed}, headroom ${good - assumed})`
    : `  (CODE ASSUMES ${assumed}, WHICH IS ABOVE THE CEILING)`;
  console.log(`  ${name.padEnd(46)} ${String(good).padStart(10)}${verdict}`);
  console.log(`      first failure: ${String(firstErr).replace(/\s+/g, " ").slice(0, 96)}`);
  return good;
}

const okOf = (r) => {
  if (r?.ok === false && r?.error) return { ok: false, err: r.error };
  const res = r?.result;
  if (res && res.ok === false && res.reason) return { ok: false, err: res.reason + " " + (res.detail || "") };
  return { ok: true };
};

console.log("workerd SQL ceilings, binary-searched through the real code paths:");
console.log("  (SQLite's documented defaults in brackets, for contrast)\n");

/* 1. The variable ceiling, reached through the path that is SUPPOSED to be
      immune to it. `selectionCreate` chunks its id list at SELECTION_ID_CHUNK,
      so no id count can push one statement over the limit; the guard working
      means this probe CANNOT find a ceiling, and saying so is the result.
      The first draft of this probe searched to 1500 while only 400 bundles
      existed, so it silently passed 400 every time and reported 1500 as a
      measured ceiling with "headroom 1436". It measured nothing. */
console.log("  -- the chunk guard: an enumerated selection must not be able to reach the limit --");
await ceiling("ids in one enumerated selection (chunked)", 1, ids.length, async (n) => {
  const r = await call(`/select?viewer=class:member&owner=class:member`, { ids: ids.slice(0, n) });
  return okOf(r);
});

/* 2. Terms in a compound SELECT [SQLite default 500].
      Driven through the query compiler: each metadata filter becomes one
      INTERSECT arm, so n filters is an n-term compound before nesting. */
await ceiling("metadata filter terms in one query [SQLite 500]", 1, 300, async (n) => {
  const parts = [];
  for (let i = 0; i < n; i++) parts.push(i % 2 ? "state:collected" : "type:information");
  const r = await call(`/search?viewer=class:member&facets=none&q=${encodeURIComponent(parts.join(" "))}`);
  return okOf(r);
}, 4);

/* 3. Depth of nested subqueries, which is how the compiler evades limit 2.
      If this is low, the evasion has its own ceiling and nobody has measured it. */
await ceiling("OR arms in one query", 1, 300, async (n) => {
  const parts = [];
  for (let i = 0; i < n; i++) parts.push(i % 2 ? "state:collected" : "type:information");
  const r = await call(`/search?viewer=class:member&facets=none&q=${encodeURIComponent(parts.join(" "))}`);
  return okOf(r);
});

/* 4. Parenthesised nesting depth in the parser and the SQL it emits. */
await ceiling("parenthesised nesting depth", 1, 600, async (n) => {
  const q = "(".repeat(n) + "fund" + ")".repeat(n);
  const r = await call(`/search?viewer=class:member&facets=none&q=${encodeURIComponent(q)}`);
  return okOf(r);
});

/* 6. Facet fields in one request. The scan form selects one column per facet in
      a single statement; the groupby form builds a compound. Both are probed,
      because they meet DIFFERENT limits and only one of them is the default. */
/* Real field names, read from the compiler's own registry rather than typed
   here: the first draft used six names the registry does not carry, which the
   compiler silently filtered out, so it probed six facets and called it twelve. */
const { FIELDS: REG, DEFAULT_FACETS } = await import("../src/query.mjs");
const FIELDS = Object.entries(REG).filter(([, v]) => v.col).map(([k]) => k);
for (const mode of ["scan", "groupby"]) {
  await ceiling(`facet fields in one request (${mode})`, 1, FIELDS.length, async (n) => {
    const r = await call(`/search?viewer=class:member&q=&facetmode=${mode}&facets=${FIELDS.slice(0, n).join(",")}`);
    return okOf(r);
  }, 6);
}

/* 7. Cited edges in one call, which is D-38's ceiling reached from the other
      side: not the byte limit but whatever the statement shape imposes. */
{
  const pid = "PROJ-2026-3000-probe";
  const ptext = md(pid).replace("object_type: information", "object_type: project")
    .replace("schema: information@1", "schema: project@1");
  await call("/promote", {
    bundleId: pid, base: null, snapKey: `${pid}-new`, author: "probe",
    files: [{ path: "bundle.md", text: ptext, bytes: ptext.length, sha256: h(ptext) }],
    meta: { object_type: "project", group: "believe-in-oakland", title: "probe",
            current_state: "forming", created: "2026-07-01T00:00:00Z",
            last_updated: "2026-07-01T00:00:00Z" },
  });
  console.log("\n  (cite is measured by bytes, not by statement shape: see D-38 and probe:cite)");
}

console.log(`
Read this when you add a statement shape. Every number above was measured
against a real Durable Object, not read from SQLite's documentation, because
D-36's whole finding is that the two disagree by orders of magnitude. If a
number here is at or below what the code assumes, the code is already broken
and the suite will not tell you.`);

await mf.dispose();
