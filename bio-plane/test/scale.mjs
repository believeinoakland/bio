/* Scale benchmark: what a whole-store pass costs, with the real gate in it.
 *
 * The number this replaces was 112ms at 504 bundles, measured before the
 * canonical projection, the verbatim promotion records, the byte-carrying image,
 * and a gate that runs forty-nine checks instead of four. Every one of those
 * changed what a pass costs, so the old figure is not a baseline, it is
 * archaeology.
 *
 * Run locally on Miniflare, which is workerd with the same SQLite the deployed
 * Durable Object uses, so the ALGORITHMIC behaviour measured here is the real
 * thing. What is missing is network: the deployed plane adds roughly 100ms of
 * fixed round trip per call, measured separately and already recorded. That
 * separation is deliberate, because it is the per-bundle slope that decides
 * whether the design holds, and a slope is not visible through a constant.
 *
 * Not run against biosmoke7 on purpose: it holds the record of reference, and
 * twenty thousand synthetic bundles do not belong in it.
 *
 *   node test/scale.mjs 5000
 *   node test/scale.mjs 20000
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const N = Number(process.argv[2] || 5000);
const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const ms = (t) => `${(t / 1000).toFixed(2)}s`;
const now = () => Number(process.hrtime.bigint() / 1000000n);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "a", MEMBER_TOKEN: "m", PROBE_TOKEN: "p", VERSION: "bench" },
});
const post = async (op, body) => (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=m",
  { method: "POST", body: JSON.stringify(body) })).json();
const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=m&" + qs)).json();

/* A conformant bundle, because a benchmark over bundles the gate would refuse
   measures the wrong thing: the checks short-circuit differently on bad input. */
const NOW = "2026-07-24T00:00:00Z";
const md = (id, i) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Synthetic ${i}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting",
  "classification: fact", "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `Synthetic bundle ${i}, for measurement only.`, "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
].join("\n");

/* Four digits in the sequence, not six: BUNDLE_ID_RE is \d{4}-\d{4}, and an
   id outside the grammar makes every bundle non-conformant, which measures and
   asserts the wrong thing. The first version of this used six and every
   "clean" bundle was quietly failing C-1.2. */
const id = (i) => `INFO-2026-${String(i).padStart(4, "0")}-synthetic`;

console.log(`\n=== ${N} bundles, local workerd SQLite, no network ===\n`);

/* ---- write ---- */
let t0 = now();
for (let i = 0; i < N; i++) {
  const body = md(id(i), i);
  const r = await post("promote", {
    bundleId: id(i), base: null, snapKey: "20260724T010000Z_aaaa1111", author: "bench",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Synthetic ${i}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }],
    register: [],
  });
  if (!r.result?.ok) { console.error("promote failed at", i, JSON.stringify(r).slice(0, 200)); process.exit(1); }
  if ((i + 1) % 2500 === 0) console.log(`  written ${i + 1} in ${ms(now() - t0)}`);
}
const writeMs = now() - t0;
console.log(`\nwrite            ${ms(writeMs)} total, ${(writeMs / N).toFixed(2)}ms per bundle`);

/* ---- the cheap whole-store reads ---- */
for (const [label, qs] of [["stats", "op=stats"], ["list", "op=list"], ["dangling", "op=dangling"]]) {
  const t = now();
  const r = await get(qs);
  const took = now() - t;
  const size = label === "list" ? (r.result?.length ?? 0) : label === "dangling" ? (r.result?.dangling?.length ?? 0) : "-";
  console.log(`${label.padEnd(16)} ${String(took).padStart(6)}ms   rows: ${size}`);
}

/* ---- one bundle, read and gated ---- */
const shaHex = async (v) => createHash("sha256")
  .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));

let t = now();
const img = (await get(`op=image&id=${id(0)}`)).result;
const imageMs = now() - t;

const gateOne = async () => {
  const files = new Map();
  for (const [p, v] of Object.entries(img)) if (typeof v === "string") files.set(p, v);
  const s = now();
  await checkBundle({ folderName: id(0), files, sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
  return now() - s;
};
await gateOne();                        /* warm */
const gateSamples = [];
for (let k = 0; k < 20; k++) gateSamples.push(await gateOne());
const gateAvg = gateSamples.reduce((a, b) => a + b, 0) / gateSamples.length;

console.log(`image (1)        ${String(imageMs).padStart(6)}ms`);
console.log(`gate  (1)        ${gateAvg.toFixed(2).padStart(6)}ms   averaged over 20`);

/* ---- the number that matters: gate every bundle ---- */
const SAMPLE = Math.min(N, 400);
t = now();
for (let i = 0; i < SAMPLE; i++) {
  const im = (await get(`op=image&id=${id(i)}`)).result;
  const files = new Map();
  for (const [p, v] of Object.entries(im)) if (typeof v === "string") files.set(p, v);
  await checkBundle({ folderName: id(i), files, sha256: shaHex, sha512: sha512Hex, resolveTarget: () => true });
}
const perBundle = (now() - t) / SAMPLE;
console.log(`read+gate        ${perBundle.toFixed(2).padStart(6)}ms per bundle   sampled ${SAMPLE}`);
console.log(`\nwhole-store gated pass, from OUTSIDE, extrapolated: ${ms(perBundle * N)} for ${N} bundles`);

/* The same pass, run inside the Durable Object where the images already are. */
let inside = 0, seen = 0, after = "", pages = 0;
for (;;) {
  const s0 = now();
  const r = (await get(`op=audit&limit=500&after=${encodeURIComponent(after)}`)).result;
  inside += now() - s0; seen += r.checked; pages++;
  if (!r.cursor) break;
  after = r.cursor;
}
console.log(`in-object pass   ${String(inside).padStart(6)}ms   ${seen} bundles over ${pages} calls, ${(inside / seen).toFixed(2)}ms each`);
console.log(`  same work from outside would be ${ms(perBundle * seen)}: ${(perBundle * seen / (inside || 1)).toFixed(1)}x`);
console.log(`  and on the deployed plane, adding ~100ms fixed round trip per image read:`);
console.log(`  ${ms((perBundle + 100) * N)} sequential, or ${ms((perBundle + 100) * N / 20)} at 20 in flight`);

await mf.dispose();
