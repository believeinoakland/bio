/* Where does citing break?
 *
 * An ENUMERATED selection is capped at 10,000 members and citing writes one
 * frontmatter entry per member into a single bundle.md, which `promote` refuses
 * above INLINE_MAX (1MB, with a measured hard limit around 2MiB). Those two
 * numbers were set independently and nothing has ever made them meet. This
 * finds the point where they do.
 *
 * Not part of `npm test`: it is a probe, run when the shape of the write
 * changes. Same reason bench:retrieval is separate.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { parseFrontmatter } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");

const mf = new Miniflare({
  modules: true, script: readFileSync(SRC("store.mjs"), "utf8"),
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;
const STAMP = "viewer=class:member&owner=class:member";

const infoMd = (id) => `---
id: ${id}
object_type: information
schema: information@2
title: "Bulk ${id}"
current_state: collected
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: interactive_agentic
  capability_tier: standard
group: believe-in-oakland
references: []
criticality: supporting
source:
  locator: "https://x/${id}"
  authority: "portal"
  retrieved: "2026-07-01"
---

## Summary

Body.

## Provenance Notes

Captured.

## Session Log

### Session 2026-07-02T00:00:00Z | Capture | interactive_agentic
Trigger: acquisition
Changes: collected.

## Review Notes

`;

/* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7); its
   creation bytes carry no `id:` line (C-59.2) and the promote names no bundleId (C-59.1). `id` null = creation. */
const projMd = (id) => `---
${id === null ? "" : `id: ${id}\n`}object_type: project
schema: project@1
title: "Scale"
current_state: forming
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: interactive_agentic
  capability_tier: standard
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
objective: "Scale."
workproduct_state: draft
evaluations: []
---

## Thesis Summary

Frame.

## Open Questions

1. Q.

## Ruled Out

Nothing.

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | interactive_agentic
Trigger: elevation
Changes: created.

## Review Notes

`;

/* CORRECTED 2026-09-23 by M0-132, never exempted: this snap key's suffix was drawn from `Math.random`, and the key is
   half of the PRIMARY KEY (bundle_id, snap_key) of `manifest` and `history`, which `promote` writes `INSERT OR
   REPLACE`: two writes to one bundle drawing the same suffix are not refused, the second SILENTLY REPLACES the
   first's rows, so a version the suite wrote could vanish by the draw rather than the code (`TREE-SHARING.md` §3). A
   per-suite COUNTER cannot repeat. */
let snapKeySeq = 0;
const promoteRaw = (id, text, meta, base = null) => call("/promote", {
  ...(id === null ? {} : { bundleId: id }), base,
  snapKey: `${id ?? `proj-${++snapKeySeq}`}-${base ? `rev${++snapKeySeq}` : "new"}`,
  author: "probe",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta,
});
const infoMeta = { object_type: "information", group: "believe-in-oakland", title: "Bulk",
  current_state: "collected", prior_state: null, created: "2026-07-01T00:00:00Z",
  last_updated: "2026-07-02T00:00:00Z", criticality: "notable" };
const projMeta = { object_type: "project", group: "believe-in-oakland", title: "Scale",
  current_state: "forming", prior_state: null, created: "2026-07-01T00:00:00Z",
  last_updated: "2026-07-02T00:00:00Z" };

const N = Number(process.argv[2] || 10000);
process.stdout.write(`loading ${N} information records`);
const ids = [];
for (let i = 0; i < N; i++) {
  const id = `INFO-2026-${String(100000 + i)}-bulk`;
  ids.push(id);
  await promoteRaw(id, infoMd(id), infoMeta);
  if (i % 2000 === 0) process.stdout.write(".");
}
console.log(" done");

console.log("\n  n      select     cite      bundle.md    outcome");
console.log("  -----  ---------  --------  -----------  -------------------------------");
for (const n of [1000, 2500, 5000, 7500, 10000].filter((x) => x <= N)) {
  const proj = (await promoteRaw(null, projMd(null), projMeta))?.bundleId;
  if (typeof proj !== "string") { console.log(`  ${String(n).padEnd(5)}  project promote returned no minted id`); continue; }

  const t0 = Date.now();
  const sel = await call(`/select?${STAMP}`, { ids: ids.slice(0, n) });
  const tSel = Date.now() - t0;
  if (!sel.ok) { console.log(`  ${String(n).padEnd(5)}  select refused: ${sel.reason}`); continue; }

  const t1 = Date.now();
  const r = await call(`/cite?${STAMP}&project=${proj}&handle=${sel.handle}`, {});
  const tCite = Date.now() - t1;

  const md = (await call(`/file?id=${proj}&path=bundle.md&viewer=class:member`))?.text ?? "";
  const size = md.length;
  let outcome;
  if (r.ok) {
    const fm = parseFrontmatter(md);
    const errs = fm.findings.filter((f) => f.severity === "error").length;
    outcome = `ok, ${r.cited.length} edges, parser errors ${errs}`;
  } else outcome = `REFUSED ${r.reason}${r.bytes ? ` (${r.bytes}B)` : ""}`;
  console.log(`  ${String(n).padEnd(5)}  ${String(tSel + "ms").padEnd(9)}  ${String(tCite + "ms").padEnd(8)}  ${String(size + "B").padEnd(11)}  ${outcome}`);
}

/* Bounding the Session Log took a cited edge from 107 to 84 bytes, which is
   what lets a maximum legal 10,000 selection fit inside INLINE_MAX. The ceiling
   is therefore no longer reachable in ONE call, only cumulatively: a Project is
   bounded in total edges, not per action. Prove the guard still fires, because
   a guard nothing can reach is a guard nothing has tested. */
if (N >= 10000) {
  console.log("\n  cumulative: citing repeatedly into one Project");
  const proj = (await promoteRaw(null, projMd(null), { ...projMeta, title: "Cumulative" }))?.bundleId;
  if (typeof proj !== "string") throw new Error("cumulative: project promote returned no minted id");
  let total = 0;
  for (let round = 0; round < 8; round++) {
    const slice = ids.slice(round * 3000, round * 3000 + 3000);
    if (!slice.length) break;
    const sel = await call(`/select?${STAMP}`, { ids: slice });
    const r = await call(`/cite?${STAMP}&project=${proj}&handle=${sel.handle}`, {});
    const md = (await call(`/file?id=${proj}&path=bundle.md&viewer=class:member`))?.text ?? "";
    if (r.ok) {
      total += r.cited.length;
      console.log(`    round ${round + 1}: +${r.cited.length} edges, total ${total}, ${md.length}B`);
    } else {
      console.log(`    round ${round + 1}: REFUSED ${r.reason} at ${total} edges`);
      console.log(`      requested ${r.requested}, would be ${r.bytes}B, limit ${r.limit}B, room for ~${r.roomFor}`);
      console.log(`      document unchanged at ${md.length}B: ${md.length < r.limit ? "nothing was written" : "WROTE ANYWAY"}`);
      break;
    }
  }
}

await mf.dispose();
