/* REC-92's TALLY-BOUND PROBE — `node test/passage-axis-probe.mjs [n ...]`.
 *
 * WHY IT EXISTS: `MEANING_AXIS_CAP` is a published bound on the content-axis
 * tally that rides on EVERY `rows=passage` answer, and a bound chosen by
 * judgement is a number nobody can re-derive. §5's discipline for this document
 * is that a figure is measured with its instrument or it is not a figure.
 *
 * WHAT IT MEASURES: wall time for the WHOLE `op=meaningrows&rows=passage`
 * answer at a growing number of captures in scope, and separately the answer
 * with the tally's bound set low, so the tally's own share is a difference of
 * two measurements rather than an estimate.
 *
 * WHAT IT CANNOT SEE, stated because a probe is an instrument: this runs in
 * miniflare on a developer machine, not in workerd on Cloudflare, so the
 * ABSOLUTE numbers are this machine's and the SHAPE is what transfers — M0-35
 * measured that the reference-iteration currency is not runtime-portable. It
 * also runs against a synthetic corpus of one-unit captures, so it measures the
 * per-capture cost of the tally and NOT the per-unit cost of the index.
 */
import "./stdio.mjs";
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { MEANING_AXIS_CAP } from "../src/query.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-p", MEMBER_TOKEN: "mem-p", PROBE_TOKEN: "prb-p",
              AI_TOKEN: "ai-p", VERSION: "test" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-p") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body) })).json());
const get = async (op, qs = "", tok = "mem-p") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

const NOW = "2026-09-17T00:00:00Z";
const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`, "produced_by:", "  mode: assisted",
  "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:", "  locator: in hand", "  authority: synthetic",
  `  retrieved: ${NOW}`, "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

let seq = 0;
const add = async (i) => {
  const id = `INFO-2026-P${String(100000 + i).slice(-6)}`;
  const capSha = sha(`probe capture ${i}`);
  const doc = {
    file: "snapshots/p.pdf", locator: `https://example.org/p${i}.pdf`, retrieved: NOW,
    capture: { sha256: capSha, encoding: "binary", bytes: 4096 },
    reading: { content_type: "meeting_packet", reader_version: 1, read_from_text: true,
               found: false, entities: [], facts: {}, at: NOW,
               text_source: [{ step: "layer", tier: 1, container: "pdf" }],
               text_tier: 1, text_container: "pdf", page_count: 1, container_extent: null,
               basis: "probe" },
    text_units: [{ extent: { kind: "pdf-page", page: 0, rect: null }, seq: 0,
                   text: `probe page ${i} mentioning quorum and appropriation` }],
  };
  const text = infoMd(id);
  const prov = JSON.stringify({ documents: [doc] });
  const r = await post("promote", {
    bundleId: id, base: null,
    snapKey: `20260917T${String(200000 + (++seq)).slice(-6)}Z_${sha(String(seq)).slice(0, 8)}`,
    meta: { object_type: "information", group: "believe-in-oakland", title: id,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) },
            { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) }],
    register: [{ sha256: capSha, path: "data/p.bin", encoding: "binary", bytes: 4096 }] });
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 400)}`);
};

const time = async (qs, reps = 5) => {
  await get("meaningrows", qs);                 /* warm */
  const ts = [];
  for (let i = 0; i < reps; i++) {
    const t0 = performance.now();
    const a = await get("meaningrows", qs);
    ts.push(performance.now() - t0);
    if (a.ok === false) throw new Error(`refused: ${JSON.stringify(a).slice(0, 300)}`);
  }
  ts.sort((a, b) => a - b);
  return { med: ts[Math.floor(ts.length / 2)], min: ts[0], max: ts[ts.length - 1] };
};

const sizes = (process.argv.slice(2).map(Number).filter(Boolean));
const STEPS = sizes.length ? sizes : [100, 500, 1000];

console.log(`REC-92 tally-bound probe · ${new Date().toISOString()}`);
console.log(`MEANING_AXIS_CAP as shipped = ${MEANING_AXIS_CAP}\n`);
console.log("captures |  hit-answer med  |  miss-answer med  |  tally counted  | truncated");
console.log("---------+------------------+-------------------+-----------------+----------");

let made = 0;
try {
  for (const n of STEPS) {
    for (; made < n; made++) await add(made);
    const hit = await time(`rows=passage&q=${encodeURIComponent("passage:quorum")}`);
    const miss = await time(`rows=passage&q=${encodeURIComponent("passage:zzzznotaword")}`);
    const a = await get("meaningrows", `rows=passage&q=${encodeURIComponent("passage:zzzznotaword")}`);
    console.log(`${String(n).padStart(8)} | ${hit.med.toFixed(1).padStart(13)} ms `
      + `| ${miss.med.toFixed(1).padStart(14)} ms `
      + `| ${String(a.scope.captures_counted).padStart(15)} | ${a.scope.captures_truncated}`);
  }
  /* THE NOISE FLOOR, so a difference smaller than it is not reported as one —
     M-21's practice, which measured 20.5% over the same kind of harness. */
  const f1 = await time(`rows=passage&q=${encodeURIComponent("passage:quorum")}`, 9);
  console.log(`\nnoise floor over 9 reps of one query: min ${f1.min.toFixed(1)} ms, `
    + `med ${f1.med.toFixed(1)} ms, max ${f1.max.toFixed(1)} ms `
    + `(spread ${(100 * (f1.max - f1.min) / f1.med).toFixed(1)}% of the median)`);
} finally { await mf.dispose(); }
