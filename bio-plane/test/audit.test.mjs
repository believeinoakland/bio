/* NEGATIVE CONTROL: (run 2026-07-31) make the in-DO conformance pass ignore error findings (store.mjs: filter errs to empty so every bundle counts clean) -> 6 assertions fail (clean/withErrors/tally/named-checks disagree with external gating) and the suite then throws at the offenders sample; restored, 18 pass. */
/* The whole-store conformance pass, run where the data is.
 *
 * The benchmark that produced this operation: gating 20,000 bundles from outside
 * the Durable Object costs about 2,060 seconds on the deployed plane against 63
 * locally, and roughly 97% of the gap is one network round trip per image. The
 * store was never the constraint and neither were the checks, which run in half a
 * millisecond. Fetching bundles one at a time was.
 *
 * Negative-control detail: make the in-DO conformance pass ignore error findings (store.mjs: filter errs to empty so every bundle counts clean) -> 6 assertions fail (clean/withErrors/tally/named-checks disagree with external gating) and the suite then throws at the offenders sample; restored, 18 pass.
 *
 * So the assertions here are about two things. That the pass agrees exactly with
 * gating from outside, because a faster answer that differs is worthless. And that
 * it is paginated and resumable, because a Durable Object has a CPU budget and a
 * pass that cannot be resumed cannot be run on a large store at all.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  bindings: { ADMIN_TOKEN: "adm-aud", MEMBER_TOKEN: "mem-aud", PROBE_TOKEN: "prb-aud", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const post = async (op, body) => (await mf.dispatchFetch("http://x/api/?op=" + op + "&token=mem-aud",
  { method: "POST", body: JSON.stringify(body) })).json();
const get = async (qs) => (await mf.dispatchFetch("http://x/api/?token=mem-aud&" + qs)).json();

const NOW = "2026-07-24T00:00:00Z";
const md = (id, i, broken) => [
  "---", `id: ${broken === "id" ? "INFO-2026-9999-wrong" : id}`,
  "object_type: information", "schema: information@1",
  `title: "Synthetic ${i}"`, `current_state: ${broken === "state" ? "elevated" : "collected"}`,
  "prior_state: null", `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland",
  ...(broken === "ref"
    ? ["references:", "  - rel: cites", "    target: INFO-2026-9998-nowhere",
       "    status: confirmed", '    note: ""']
    : ["references: []"]),
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false",
  "  since: null", "  source: null", "visuals: []", "criticality: supporting",
  "source_status: unchanged", "source:",
  "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", `Synthetic ${i}.`, "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");

/* Four digits in the sequence, not six: BUNDLE_ID_RE is \d{4}-\d{4}, and an
   id outside the grammar makes every bundle non-conformant, which measures and
   asserts the wrong thing. The first version of this used six and every
   "clean" bundle was quietly failing C-1.2. */
const id = (i) => `INFO-2026-${String(i).padStart(4, "0")}-synthetic`;
const make = async (i, broken) => {
  const body = md(id(i), i, broken);
  return post("promote", {
    bundleId: id(i), base: null, snapKey: "20260724T010000Z_aaaa1111", author: "bench",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Synthetic ${i}`,
            current_state: broken === "state" ? "elevated" : "collected", created: NOW, last_updated: NOW },
    files: [{ path: "bundle.md", text: body, bytes: body.length, sha256: sha(body) }],
    register: [],
  });
};

const N = 25;
for (let i = 0; i < N; i++) await make(i);
/* Three different broken shapes, so the tally has something to distinguish. */
await make(101, "id"); await make(102, "ref"); await make(103, "state");

console.log("\n--- the pass agrees with gating from outside ---");
const outside = async () => {
  const ids = (await get("op=list")).result.map((b) => b.bundle_id).sort();
  const shaHex = async (v) => createHash("sha256")
    .update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex");
  const sha512Hex = async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b));
  const known = new Set(ids);
  const tally = {}; let clean = 0, bad = 0;
  for (const b of ids) {
    const img = (await get(`op=image&id=${encodeURIComponent(b)}`)).result;
    const files = new Map(), elided = new Set();
    for (const [p, v] of Object.entries(img)) { if (typeof v === "string") files.set(p, v); else elided.add(p); }
    const { findings } = await checkBundle({ folderName: b, files, elidedPaths: elided,
      sha256: shaHex, sha512: sha512Hex, resolveTarget: (x) => known.has(x) });
    const errs = findings.filter((f) => f.severity === "error");
    if (errs.length) { bad++; for (const e of errs) tally[e.check] = (tally[e.check] || 0) + 1; } else clean++;
  }
  return { clean, bad, tally };
};
const ext = await outside();
const ins = (await get("op=audit&limit=1000")).result;
t("the same number of clean bundles", ins.clean, ext.clean);
t("the same number with errors", ins.withErrors, ext.bad);
t("the same tally, check for check", ins.tally, ext.tally);
t("and it found the three broken ones", ins.withErrors, 3);
t("naming the checks that caught them", Object.keys(ins.tally).sort(), ["C-1.1", "C-4.1", "C-6.2"]);

console.log("\n--- it is paginated and resumable ---");
{
  let after = "", checked = 0, clean = 0, bad = 0, pages = 0;
  const tally = {};
  for (;;) {
    const r = (await get(`op=audit&limit=7&after=${encodeURIComponent(after)}`)).result;
    pages++; checked += r.checked; clean += r.clean; bad += r.withErrors;
    for (const [k, v] of Object.entries(r.tally)) tally[k] = (tally[k] || 0) + v;
    if (!r.cursor) break;
    after = r.cursor;
    if (pages > 20) break;
  }
  t("every bundle was seen exactly once", checked, N + 3);
  t("across several pages", pages > 3, true);
  t("with the same verdict as one big page", { clean, bad, tally },
    { clean: ins.clean, bad: ins.withErrors, tally: ins.tally });
  t("and the last page says there is no more", (await get(`op=audit&limit=1000&after=${encodeURIComponent(id(103))}`)).result.cursor, null);
}

console.log("\n--- what it reports, and what it refuses to report ---");
t("it says how many bundles exist in total", ins.total, N + 3);
t("offenders are named", ins.offenders.length, 3);
t("each with its findings", ins.offenders[0].errors.length > 0, true);
{
  /* A store where everything is broken must not answer with a megabyte of
     repetition: the tally says how much, the sample says what it looks like. */
  const r = (await get("op=audit&limit=1000")).result;
  t("the sample of offenders is bounded", r.offenders.length <= 20, true);
  t("but the tally counts all of them", Object.values(r.tally).reduce((a, b) => a + b, 0) >= r.withErrors, true);
}
t("a page size beyond the cap is clamped rather than obeyed",
  (await get("op=audit&limit=99999")).result.checked <= 1000, true);

console.log("\n--- it is a read, and it is not public ---");
t("nothing changed", (await get("op=stats")).result.bundles, N + 3);
t("unauthenticated is refused", (await (await mf.dispatchFetch("http://x/api/?op=audit")).json()).error, "unauthenticated");

console.log("\n--- and it is much faster than the outside pass ---");
{
  const t1 = Date.now(); await outside(); const outMs = Date.now() - t1;
  const t2 = Date.now(); await get("op=audit&limit=1000"); const inMs = Date.now() - t2;
  console.log(`         outside ${outMs}ms, inside ${inMs}ms, ${(outMs / Math.max(inMs, 1)).toFixed(1)}x`);
  t("the in-object pass is faster", inMs < outMs, true);
}

await mf.dispose();
console.log(`\naudit: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
