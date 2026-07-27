/* Probe 2: the substrate a full search/filter/list/sort/select surface needs.
 *
 *   node test/facet-probe.mjs caps      -> what this SQLite engine actually offers
 *   node test/facet-probe.mjs real      -> agreement anchor on the 30 real bundles
 *   node test/facet-probe.mjs 20000
 *
 * Probe 1 answered "FTS5 or exported index" for free text. This measures the
 * shapes probe 1 did not: filtering on typed frontmatter, facet counts for a
 * sidebar, sorting by an arbitrary field, paging, and select-all. Two metadata
 * substrates (WIDE typed columns, EAV facet rows) are held to exact agreement
 * with an unindexed ground truth, then measured.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ARG = process.argv[2] || "20000";
const SRC = fileURLToPath(new URL("./facet-probe-worker.mjs", import.meta.url));
const now = () => Number(process.hrtime.bigint() / 1000000n);
const norm = (s) => (String(s).toLowerCase().match(/[a-z0-9]{2,}/g) || []);

/* ---------------- corpus ---------------- */

/* Value distributions taken from the real 30-bundle corpus, then given spread:
   a 20k corpus of one group's record would not be 100% one state, but it is
   heavily skewed toward the common value. Skew matters because it decides
   whether an index helps or the planner scans. */
const DIST = {
  object_type:    [["information", 0.86], ["problem", 0.09], ["project", 0.05]],
  current_state:  [["collected", 0.55], ["verified", 0.22], ["surfaced", 0.12], ["elevated", 0.08], ["ratified", 0.03]],
  criticality:    [["supporting", 0.72], ["crucial", 0.28]],
  produced_mode:  [["interactive_chat", 0.78], ["agent", 0.18], ["import", 0.04]],
  capability_tier:[["standard", 0.90], ["high", 0.10]],
  source_status:  [["unchanged", 0.88], ["modified", 0.10], ["gone", 0.02]],
  monitor_freq:   [["monthly", 0.70], ["weekly", 0.20], ["none", 0.10]],
  reeval_flag:    [["false", 0.93], ["true", 0.07]],
  source_authority: [
    ["Oakland OpenGov portal", 0.34], ["City Auditor", 0.22], ["ACFR fund statements", 0.16],
    ["adopted budget", 0.12], ["EBMUD", 0.08], ["City Council agenda", 0.08],
  ],
};
function pickFrom(pairs, r) {
  let acc = 0;
  for (const [v, p] of pairs) { acc += p; if (r < acc) return v; }
  return pairs[pairs.length - 1][0];
}

function syntheticCorpus(n) {
  const V = 3000;
  const vocab = Array.from({ length: V }, (_, i) => `t${i}`);
  const weight = vocab.map((_, i) => 1 / (i + 1));
  const cum = []; let s = 0; for (const w of weight) { s += w; cum.push(s); }
  const total = s;
  let seed = 42;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const pick = () => { const r = rnd() * total; let lo = 0, hi = cum.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] < r) lo = m + 1; else hi = m; } return vocab[lo]; };
  const docs = [];
  for (let i = 0; i < n; i++) {
    const set = new Set();
    const len = 80 + (i % 80);
    for (let k = 0; k < len; k++) set.add(pick());
    if (i % 500 === 0) set.add("needlerare");
    if (i % 5000 === 0) set.add("needleultrarare");
    const ot = pickFrom(DIST.object_type, rnd());
    const day = String((i % 200) + 1).padStart(3, "0");
    const t = `2026-${String(1 + (i % 7)).padStart(2, "0")}-${String(1 + (i % 28)).padStart(2, "0")}T12:00:00Z`;
    docs.push({
      row: i + 1,
      id: `INFO-2026-${String(i).padStart(5, "0")}`,
      body: [...set].join(" "),
      meta: {
        object_type: ot,
        schema_id: `${ot}@${1 + (i % 2)}`,
        current_state: pickFrom(DIST.current_state, rnd()),
        prior_state: rnd() < 0.4 ? "collected" : null,
        criticality: pickFrom(DIST.criticality, rnd()),
                created: `2026-0${1 + (i % 6)}-${String(1 + (i % 28)).padStart(2, "0")}T08:00:00Z`,
        last_updated: t,
        produced_mode: pickFrom(DIST.produced_mode, rnd()),
        capability_tier: pickFrom(DIST.capability_tier, rnd()),
        source_authority: pickFrom(DIST.source_authority, rnd()),
        source_status: pickFrom(DIST.source_status, rnd()),
        monitor_freq: pickFrom(DIST.monitor_freq, rnd()),
        annotations_open: rnd() < 0.15 ? 1 + Math.floor(rnd() * 4) : 0,
        reeval_flag: pickFrom(DIST.reeval_flag, rnd()),
      },
    });
  }
  return docs;
}

/* real corpus: parse the actual frontmatter, no invention */
function realCorpus() {
  const raw = JSON.parse(readFileSync("/tmp/corpus/bundles.json", "utf8"));
  const scalar = (fm, key) => {
    const m = fm.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
    if (!m) return null;
    const v = m[1].trim().replace(/^"|"$/g, "");
    return v === "null" || v === "" ? null : v;
  };
  const nested = (fm, parent, key) => {
    const block = fm.match(new RegExp(`^${parent}:\\s*\\n((?:\\s{2,}.*\\n)+)`, "m"));
    if (!block) return null;
    const m = block[1].match(new RegExp(`^\\s+${key}:\\s*(.*)$`, "m"));
    if (!m) return null;
    const v = m[1].trim().replace(/^"|"$/g, "");
    return v === "null" || v === "" ? null : v;
  };
  return Object.entries(raw).map(([id, md], i) => {
    const fm = md.split("---")[1] || "";
    const ot = scalar(fm, "object_type");
    return {
      row: i + 1, id, body: norm(md).join(" "),
      meta: {
        object_type: ot,
        schema_id: scalar(fm, "schema"),
        current_state: scalar(fm, "current_state"),
        prior_state: scalar(fm, "prior_state"),
        criticality: scalar(fm, "criticality"),
                created: scalar(fm, "created"),
        last_updated: scalar(fm, "last_updated"),
        produced_mode: nested(fm, "produced_by", "mode"),
        capability_tier: nested(fm, "produced_by", "capability_tier"),
        source_authority: nested(fm, "source", "authority"),
        source_status: scalar(fm, "source_status"),
        monitor_freq: nested(fm, "monitoring", "frequency"),
        annotations_open: scalar(fm, "annotations_open"),
        reeval_flag: nested(fm, "reeval_pending", "flag"),
      },
    };
  });
}

/* ---------------- rig ---------------- */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  durableObjects: { FACET: { className: "FacetProbe", useSQLite: true } },
  compatibilityDate: "2026-07-01",
});
const call = async (op, args = {}) => {
  const r = await mf.dispatchFetch("http://p/", {
    method: "POST", body: JSON.stringify({ op, args }), headers: { "content-type": "application/json" },
  });
  if (!r.ok) throw new Error(`${op}: ${r.status} ${await r.text()}`);
  return r.json();
};
const timed = async (reps, fn) => {
  let best = Infinity, last;
  for (let i = 0; i < reps; i++) { const t = now(); last = await fn(); best = Math.min(best, now() - t); }
  return { best, last };
};
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

/* ---------------- run ---------------- */
try {
  if (ARG === "caps") {
    const caps = await call("capabilities");
    console.log("\n=== FTS5 / SQLite capability probe, real workerd engine ===");
    for (const [k, v] of Object.entries(caps))
      console.log(` ${v.ok ? "YES" : "NO "}  ${k.padEnd(22)} ${v.note}`);
    await mf.dispose();
    process.exit(0);
  }

  const docs = ARG === "real" ? realCorpus() : syntheticCorpus(Number(ARG));
  console.log(`\n=== probe 2: ${docs.length} docs (${ARG === "real" ? "REAL corpus" : "synthetic"}) ===`);

  const caps = await call("capabilities");
  const missing = Object.entries(caps).filter(([, v]) => !v.ok).map(([k]) => k);
  if (missing.length) console.log(`capabilities unavailable: ${missing.join(", ")}`);

  let seeded = 0;
  const CH = 500;
  let seedInfo;
  const tSeed = now();
  for (let i = 0; i < docs.length; i += CH) {
    seedInfo = await call("seed", { docs: docs.slice(i, i + CH) });
    seeded += Math.min(CH, docs.length - i);
  }
  console.log(`seeded ${seeded} in ${now() - tSeed}ms | wide+fts write ${seedInfo.wideMs}ms/chunk | eav ${seedInfo.eavMs}ms/chunk | eav bytes(last chunk) ${seedInfo.eavBytes} | dbBytes ${seedInfo.dbBytes}`);

  /* the query shapes a real sidebar+header UX issues */
  const rareTerm = ARG === "real" ? "sewer" : "needlerare";
  const commonTerm = ARG === "real" ? "bundle" : "t1";
  const specs = {
    "text selective":            { terms: [rareTerm] },
    "text broad":                { terms: [commonTerm] },
    "meta only, rare value":     { eq: { current_state: ARG === "real" ? "verified" : "ratified" } },
    "meta only, dominant value": { eq: { object_type: "information" } },
    "meta two fields":           { eq: { object_type: "information", criticality: "crucial" } },
    "mixed text+meta":           { terms: [rareTerm], eq: { object_type: "information" } },
    "mixed broad text+meta":     { terms: [commonTerm], eq: { current_state: ARG === "real" ? "collected" : "collected" } },
    "meta + time range":         { eq: { object_type: "information" }, after: { field: "last_updated", value: "2026-04-01T00:00:00Z" } },
    "sorted by last_updated":    { terms: [commonTerm], sort: { field: "last_updated", dir: "desc" } },
    "sorted by authority":       { eq: { object_type: "information" }, sort: { field: "source_authority", dir: "asc" } },
  };

  console.log(`\n${"shape".padEnd(28)}${"hits".padStart(7)}${"truth".padStart(9)}${"WIDE".padStart(8)}${"EAV".padStart(8)}  agree`);
  const rows = [];
  for (const [name, spec] of Object.entries(specs)) {
    const truth = await call("truth", { spec });
    const w = await timed(5, () => call("wide", { spec }));
    const e = await timed(5, () => call("eav", { spec }));
    const okW = same(truth.ids, w.last.ids), okE = same(truth.ids, e.last.ids);
    rows.push({ name, n: truth.ids.length, truth: truth.ms, w: w.best, e: e.best, okW, okE });
    console.log(
      `${name.padEnd(28)}${String(truth.ids.length).padStart(7)}${(truth.ms + "ms").padStart(9)}${(w.best + "ms").padStart(8)}${(e.best + "ms").padStart(8)}  ` +
      `${okW && okE ? "exact" : `MISMATCH wide=${okW} eav=${okE}`}`
    );
  }
  const anyBad = rows.some((r) => !r.okW || !r.okE);

  /* facet counts: what a sidebar must render */
  console.log(`\n=== facet counts (the sidebar) ===`);
  for (const [label, spec] of [
    ["whole corpus", {}],
    ["after text filter (selective)", { terms: [rareTerm] }],
    ["after text filter (broad)", { terms: [commonTerm] }],
    ["after meta filter", { eq: { object_type: "information" } }],
  ]) {
    const f = await timed(5, () => call("facetCounts", { spec, field: "current_state" }));
    const tot = f.last.buckets.reduce((a, [, c]) => a + c, 0);
    console.log(` ${label.padEnd(32)} ${String(f.best + "ms").padStart(7)}  over ${String(tot).padStart(6)} rows  buckets=${f.last.buckets.length}`);
  }

  /* paging and select-all */
  console.log(`\n=== paging vs select-all ===`);
  const broad = { terms: [commonTerm], sort: { field: "last_updated", dir: "desc" } };
  const p = await timed(5, () => call("pageSql", { spec: broad, limit: 50, offset: 0 }));
  const p9 = await timed(5, () => call("pageSql", { spec: broad, limit: 50, offset: 2000 }));
  const all = await timed(5, () => call("wide", { spec: broad }));
  console.log(` first page (LIMIT 50)            ${String(p.best + "ms").padStart(7)}  ids=${p.last.ids.length}`);
  console.log(` deep page (OFFSET 2000)          ${String(p9.best + "ms").padStart(7)}  ids=${p9.last.ids.length}`);
  console.log(` select-all (every id in set)     ${String(all.best + "ms").padStart(7)}  ids=${all.last.ids.length}`);

  /* ranked + snippet */
  if (caps.fts5_bm25?.ok && caps.fts5_snippet?.ok) {
    const r = await timed(5, () => call("ranked", { terms: [commonTerm], limit: 50 }));
    console.log(`\n=== ranked listing (bm25 + snippet, top 50) ===\n ${String(r.best + "ms").padStart(7)}  rows=${r.last.n}`);
    if (r.last.sample) console.log(` sample: ${r.last.sample.id} score=${Number(r.last.sample.score).toFixed(3)} snip="${String(r.last.sample.snip).slice(0, 70)}"`);
  }

  /* query plans: confirm a pass is a pass for the reason claimed */
  console.log(`\n=== query plans (is the index actually used?) ===`);
  for (const key of ["meta only, rare value", "mixed text+meta", "sorted by last_updated"]) {
    const plan = await call("plan", { spec: specs[key] });
    console.log(` ${key}:`);
    for (const line of plan) console.log(`    ${line}`);
  }

  /* compound booleans mixing text and metadata */
  console.log(`\n=== compound booleans (text mixed with metadata under OR / NOT) ===`);
  for (const [label, shape, term] of [
    ["(text:rare OR state) AND type", "orAnd", rareTerm],
    ["(text:broad OR state) AND type", "orAnd", commonTerm],
    ["type NOT text:rare", "notShape", rareTerm],
    ["type NOT text:broad", "notShape", commonTerm],
  ]) {
    const a = { shape, term, state: "ratified", type: "information" };
    const got = await timed(5, () => call("compound", a));
    const tru = await call("compoundTruth", a);
    const ok = same(tru.ids, got.last.ids);
    console.log(` ${label.padEnd(32)} ${String(got.best + "ms").padStart(7)}  hits=${String(got.last.ids.length).padStart(6)}  ${ok ? "exact" : "MISMATCH"}`);
    if (!ok) process.exitCode = 1;
  }

  /* failing case: break the EAV substrate, confirm ground truth refuses it */
  console.log(`\n=== sabotage check (ground truth must catch a broken facet index) ===`);
  const sspec = { eq: { object_type: "information" } };
  const before = await call("eav", { spec: sspec });
  const victim = docs.find((d) => d.meta.object_type === "information");
  await call("sabotage", { row: victim.row });
  const afterT = await call("truth", { spec: sspec });
  const afterE = await call("eav", { spec: sspec });
  const caught = !same(afterT.ids, afterE.ids);
  console.log(` eav before=${before.ids.length} after=${afterE.ids.length} truth=${afterT.ids.length} -> ${caught ? "CAUGHT (truth refused the silent loss)" : "NOT CAUGHT (probe is not trustworthy)"}`);

  await mf.dispose();
  if (anyBad || !caught) { console.log("\nRESULT: FAIL\n"); process.exit(1); }
  console.log("\nRESULT: all shapes agree exactly; sabotage caught\n");
} catch (e) {
  console.error("probe error:", e);
  await mf.dispose().catch(() => {});
  process.exit(1);
}
