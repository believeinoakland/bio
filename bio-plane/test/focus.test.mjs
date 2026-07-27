/* The Focus rename, code side (Bob's directive, 2026-07-27; Technical
 * Architecture Decisions "Focus, formerly Problem").
 *
 * Three claims, each asserted in the direction a rename can silently break:
 *   1. CANONICAL WORKS: a FOCUS- bundle with object_type `focus` and schema
 *      `focus@1` is conformant, projects, filters, facets, and disposes.
 *   2. LEGACY KEEPS WORKING: `problem` spellings in existing history stay
 *      legal (the disposition suite is the standing coverage; here the mixed
 *      and modernized shapes are held), because history is append-only and a
 *      rename that invalidated the past would be a purge wearing a new name.
 *   3. THE PROJECTION NORMALIZES: a legacy `problem` document projects as
 *      `focus`, `type:focus` and the legacy `type:problem` both find it, and
 *      the facet answers with one spelling, not a split count.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (s) => createHash("sha256").update(s).digest("hex");
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const mf = new Miniflare({
  modules: true, script: readFileSync(SRC("store.mjs"), "utf8"),
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json()).result;
const STAMP = "viewer=class:member&owner=class:member";

const focusMd = (id, { type = "focus", schema = "focus@1", state = "surfaced" } = {}) => `---
id: ${id}
object_type: ${type}
schema: ${schema}
title: "Focus ${id}"
current_state: ${state}
prior_state: null
created: "2026-07-01T00:00:00Z"
last_updated: "2026-07-02T00:00:00Z"
produced_by:
  mode: agent
  capability_tier: high
group: believe-in-oakland
references: []
state_history: []
annotations_open: 0
reeval_pending:
  flag: false
  since: null
  source: null
visuals: []
surfaced_by: agent
disposition_reason: ""
recheck_triggers:
  - text: Revisit after the next budget cycle
    description: The adopted budget may restate the transfer basis.
---

## Statement

The transfer basis is unstated.

## Why It Matters

It decides the remediation options.

## Open Questions

## Session Log

### Session 2026-07-02T00:00:00Z | Formation | agent
Trigger: surfacing
Changes: created.

## Review Notes
`;

const mk = (id, text, type) => call("/promote", {
  bundleId: id, base: null, snapKey: `${id}-new`, author: "suite",
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  meta: { object_type: type, group: "believe-in-oakland", title: `Focus ${id}`,
          current_state: "surfaced", created: "2026-07-01T00:00:00Z",
          last_updated: "2026-07-02T00:00:00Z" },
});
const errorsOf = async (id) => {
  const files = new Map(Object.entries(await call(`/image?id=${id}`)));
  const { findings } = await checkBundle({ folderName: id, files,
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true });
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};
const projOf = async (id) => call(`/projection?id=${id}`);
const select = async (ids) => (await call(`/select?${STAMP}`, { ids })).handle;
const S = async (q) => call(`/search?${q}&${STAMP}`);

console.log("--- 1. the canonical vocabulary works end to end ---");
{
  const id = "FOCUS-2026-0600-canon";
  await mk(id, focusMd(id), "focus");
  t("a FOCUS- bundle with focus@1 is conformant", await errorsOf(id), []);
  t("it projects as focus", (await projOf(id)).object_type, "focus");
  t("type:focus finds it", (await S("q=type:focus&facets=none")).total, 1);
  const h = await select([id]);
  const r = await call(`/dispose?handle=${h}&to=dismissed&reason=${encodeURIComponent("out of scope")}&${STAMP}`);
  t("it disposes like the construct it is", r.ok, true);
  t("and is still conformant dismissed (C-15 recheck coverage included)", await errorsOf(id), []);
}

console.log("\n--- 2. legacy spellings keep working, including the modernized shape ---");
{
  /* The immutable-id case: a PROB- bundle whose frontmatter modernizes to
     focus on a later promotion. The id cannot change; the vocabulary can. */
  const id = "PROB-2026-0610-modern";
  await mk(id, focusMd(id, { type: "focus", schema: "focus@1" }), "focus");
  t("a PROB- id carrying object_type focus is coherent, not a C-2.5 error",
    await errorsOf(id), []);
  /* And the untouched-history case, spelled entirely the old way. */
  const legacy = "PROB-2026-0611-legacy";
  await mk(legacy, focusMd(legacy, { type: "problem", schema: "problem@1" }), "problem");
  t("a fully legacy problem/problem@1 document is still legal", await errorsOf(legacy), []);
}

console.log("\n--- 3. the projection normalizes, and both spellings answer ---");
{
  const legacy = "PROB-2026-0620-proj";
  await mk(legacy, focusMd(legacy, { type: "problem", schema: "problem@1" }), "problem");
  t("a legacy problem document projects as focus", (await projOf(legacy)).object_type, "focus");
  t("type:focus finds legacy documents too",
    (await S("q=type:focus+0620&facets=none")).total, 1);
  t("the legacy filter spelling is honoured, not answered with an empty page",
    (await S("q=type:problem+0620&facets=none")).total, 1);
  t("schema stamps stay document truth: schema:problem@1 still matches",
    (await S("q=schema:problem@1+0620&facets=none")).total, 1);
  const fac = await S("q=0620&facets=type");
  t("the facet answers with one spelling",
    fac.facets.type.map((x) => x.value), ["focus"]);
  const h = await select([legacy]);
  const r = await call(`/dispose?handle=${h}&to=deferred&reason=${encodeURIComponent("next cycle")}&${STAMP}`);
  t("dispose still moves a legacy document", r.ok, true);
}

await mf.dispose();
console.log(`\nfocus: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
