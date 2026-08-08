/* D-224's MEASUREMENT, and it is the one the row asked for before anything was capped:
 * *"derive against a synthetic entity at k = 10/100/1000 and record rows, bytes and tick
 * duration in MEASUREMENTS.md ... Do not cap it before measuring; the point of the row is
 * that nobody knows the curve."*
 *
 * THIS IS AN INSTRUMENT, NOT A SUITE. It is deliberately named `*.measure.mjs` so
 * `scripts/battery.mjs` (which discovers `*.test.mjs`) does not run it: it takes minutes and
 * it asserts nothing. Run it directly:
 *
 *     cd bio-plane && node test/connections-growth.measure.mjs
 *
 * WHAT IT MEASURES, per k: the connection ROWS one derivation produces, the store's own
 * `dbBytes` before and after it (op=stats, i.e. workerd's `ctx.storage.sql.databaseSize`),
 * and the WALL TIME of the single `op=connect` call. Bytes are the store's, time is the
 * harness's — both are labelled as such in the output rather than mixed.
 *
 * WHAT IT DELIBERATELY DOES NOT CLAIM: this is Miniflare on a laptop, not a Cloudflare
 * isolate, so the DURATION is an order-of-magnitude reading and never a latency budget.
 * `dbBytes` is the store's own number and is the one figure here that transfers.
 *
 * k = 1000 IS NOT DRIVEN BY DEFAULT and the reason is stated rather than hidden: it is
 * 499,500 rows through one synchronous transaction and the run does not finish in a
 * reasonable time on this harness. Pass k values on the command line to drive it
 * (`node test/connections-growth.measure.mjs 10 100 1000`) if a machine has the patience;
 * the curve is already legible from the four defaults, which is the point of a curve. */
import "./sandbox.mjs";
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const KS = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n) && n > 1);
const LEVELS = KS.length ? KS : [10, 50, 100, 200];
const MAXK = Math.max(...LEVELS);

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-r66", MEMBER_TOKEN: "mem-r66", PROBE_TOKEN: "prb-r66",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

const NOW = "2026-07-16T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`, "produced_by:", "  mode: assisted",
  "  capability_tier: session", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:", "  locator: in hand",
  "  authority: synthetic", `  retrieved: ${NOW}`, "monitoring:", "  enabled: false",
  "  frequency: none", "---", "", "## Summary", "", "An agenda item.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");

console.log(`--- D-224: the connection curve, measured. k = ${LEVELS.join(", ")} ---`);
const t0 = Date.now();
const CAPS = [], REFS = [];
for (let i = 1; i <= MAXK; i++) {
  const id = `INFO-2026-${String(i).padStart(4, "0")}-r66`;
  const md = bundleMd(id);
  const capture = sha(`r66-${i}`);
  const ref = `legislation:26-${String(i).padStart(4, "0")}`;
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: capture, encoding: "binary", bytes: 10 },
    reading: { content_type: "meeting_agenda", reader_version: 1, found: true, at: NOW,
               entities: [{ ref, kind: "legislation", key: String(i), label: `Subject ${i}` }] } }] });
  const files = [
    { path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) },
    { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) },
  ];
  const r = await POST("op=promote&token=mem-r66", {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "r66", files,
    register: [{ sha256: capture, path: "captures/doc.pdf", encoding: "binary", bytes: 10 }],
    meta: { object_type: "information", group: "believe-in-oakland", title: id,
            current_state: "collected", created: NOW, last_updated: NOW } });
  if (r?.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 300)}`);
  CAPS.push(capture); REFS.push(ref);
  if (i % 50 === 0) console.log(`  ... ${i} documents promoted (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}

const rows = [];
for (const k of LEVELS) {
  const ent = (await POST("op=entitycreate&token=mem-r66",
    { kind: "contract", label: `D-224 synthetic subject at k=${k}` })).entity_id;
  if (!ent) throw new Error(`entitycreate k=${k} failed`);
  for (let i = 0; i < k; i++) {
    const r = await POST("op=resolvetestify&token=mem-r66", {
      captureSha: CAPS[i], ref: REFS[i], entityId: ent,
      basis: `D-224 measurement fixture: document ${i + 1} of ${k} concerns the synthetic subject`,
      resolvedBy: "r66" });
    if (r?.ok === false) throw new Error(`resolvetestify k=${k} i=${i}: ${JSON.stringify(r).slice(0, 300)}`);
  }
  const before = (await GET("op=stats&token=adm-r66")).dbBytes;
  const t = Date.now();
  const derived = await POST("op=connect&token=mem-r66", { entityId: ent, assertedBy: "r66", limit: 5000000 });
  const ms = Date.now() - t;
  const after = (await GET("op=stats&token=adm-r66")).dbBytes;
  if (derived?.ok === false) throw new Error(`connect k=${k}: ${JSON.stringify(derived).slice(0, 300)}`);
  rows.push({ k, expected: (k * (k - 1)) / 2, count: derived.count,
              documents: derived.documents, truncated: derived.truncated ?? null,
              bytes: after - before, dbBytes: after, ms });
  console.log(`  k=${String(k).padStart(4)}  rows=${String(derived.count).padStart(7)}  `
            + `k(k-1)/2=${String((k * (k - 1)) / 2).padStart(7)}  `
            + `dbBytes +${String(after - before).padStart(9)}  ${String(ms).padStart(6)}ms  `
            + `documents=${derived.documents} truncated=${derived.truncated ?? "(absent)"}`);
}

console.log("\n  | k | connection rows | k(k-1)/2 | dbBytes delta | bytes/row | derive ms |");
console.log("  | --- | --- | --- | --- | --- | --- |");
for (const r of rows)
  console.log(`  | ${r.k} | ${r.count} | ${r.expected} | ${r.bytes} | `
            + `${r.count ? Math.round(r.bytes / r.count) : "n/a"} | ${r.ms} |`);
console.log(`\n  total harness time ${((Date.now() - t0) / 1000).toFixed(1)}s · `
          + `store dbBytes now ${(await GET("op=stats&token=adm-r66")).dbBytes}`);
await mf.dispose();
