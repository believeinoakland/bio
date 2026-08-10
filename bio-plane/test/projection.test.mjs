/* NEGATIVE CONTROL: (run 2026-07-31) neuter the `nested(block,key)` helper in the store projection to always return undefined, so nested-block fields (produced_by.*, source.*, monitoring.*) no longer project -> 10 assertions fail (the produced_mode/tier/source_locator/authority/retrieved/monitor_* columns); restored, 33 pass. */
/* The metadata projection, S-10 step 1.
 *
 * Probe 2 measured that a full search/filter/sort surface needs the fields the
 * UX filters on to exist as typed indexed columns, and found that the `bundles`
 * projection covers about half of what real frontmatter carries. This suite is
 * the contract for the other half.
 *
 * Negative-control detail: neuter the `nested(block,key)` helper in the store projection to always return undefined, so nested-block fields (produced_by.*, source.*, monitoring.*) no longer project -> 10 assertions fail (the produced_mode/tier/source_locator/authority/retrieved/monitor_* columns); restored, 33 pass.
 *
 * The projection is DERIVED FROM bundle.md, not from the caller's `meta`. The
 * bundle format is authoritative (schema.mjs line 3) and these fields have no
 * representation in `meta` at all, so the document is not merely the better
 * source, it is the only one. Deriving with the catalog's own parser is what
 * keeps the projection and the checker from disagreeing about what the document
 * says.
 *
 * Frontmatter is heterogeneous by object_type and schema version:
 * information@1, information@2, problem@1 and project@1 carry different field
 * sets and more versions will arrive. So the typed columns cover what every
 * bundle has and what the UX filters on, and the full frontmatter is kept as
 * JSON for the per-schema tail, queryable through json_extract.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));

const sha = (s) => createHash("sha256").update(s).digest("hex");
const mf = new Miniflare({
  modules: true, script: readFileSync(SRC("store.mjs"), "utf8"),
  modulesRoot: "/", scriptPath: SRC("store.mjs"),
  compatibilityDate: "2026-07-01",
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
});
const call = async (p, body) => (await (await mf.dispatchFetch("http://x" + p,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json());

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* An information@2 bundle carrying every field the real corpus carries. */
const INFO_ID = "INFO-2026-0001-sewer-transfer-series";
const infoMd = `---
id: ${INFO_ID}
object_type: information
schema: information@2
title: "Sewer Service Fund transfer series"
current_state: collected
prior_state: null
created: "2026-07-18T22:00:00Z"
last_updated: "2026-07-20T18:58:01Z"
produced_by:
  mode: interactive_chat
  capability_tier: standard
group: believe-in-oakland
references: []
state_history: []
annotations_open: 3
reeval_pending:
  flag: true
  since: "2026-07-19T00:00:00Z"
  source: source_status
visuals: []
criticality: crucial
source:
  locator: "https://oaklandca.opengov.com"
  authority: "Oakland OpenGov portal, City Auditor"
  retrieved: "2026-07-18"
content_hash: "sha256:05af3ea6a95789ad8589701a0b72d4711b152e9ad06f761dec5d0000000000aa"
source_status: modified
monitoring:
  enabled: true
  frequency: monthly
  last_checked: "2026-07-18T22:00:00Z"
---

## Summary

The evidentiary spine.

## Provenance Notes

## Session Log

## Review Notes
`;

/* A problem@1 bundle, whose type-specific fields exist in NO information
   bundle. This is the heterogeneity the JSON tail is for. */
const PROB_ID = "PROB-2026-0002-franchise-fee-authority";
const probMd = `---
id: ${PROB_ID}
object_type: problem
schema: problem@1
title: "Did the franchise fee ever have lawful authority"
current_state: surfaced
prior_state: null
created: "2026-07-19T00:00:00Z"
last_updated: "2026-07-19T00:00:00Z"
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

## Why It Matters

## Open Questions

## Session Log

## Review Notes
`;

const promote = (id, text, meta) => call("/promote", {
  bundleId: id, base: null, snapKey: "20260725T120000Z_projtest", author: "seed",
  meta, files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  refs: [], register: [],
});

/* meta deliberately carries NOTHING about source, monitoring, or produced_by:
   those fields exist only in the document, which is the point. */
await promote(INFO_ID, infoMd, {
  object_type: "information", group: "believe-in-oakland",
  title: "Sewer Service Fund transfer series", current_state: "collected",
  created: "2026-07-18T22:00:00Z", last_updated: "2026-07-20T18:58:01Z",
  criticality: "crucial",
});
await promote(PROB_ID, probMd, {
  object_type: "problem", group: "believe-in-oakland",
  title: "Did the franchise fee ever have lawful authority", current_state: "surfaced",
  created: "2026-07-19T00:00:00Z", last_updated: "2026-07-19T00:00:00Z",
});

console.log("\n--- the projection carries every field the UX filters on ---");
const p = (await call(`/projection?id=${INFO_ID}&viewer=class:member`)).result;
t("schema version is projected", p.schema_id, "information@2");
t("produced_by.mode is projected", p.produced_mode, "interactive_chat");
t("produced_by.capability_tier is projected", p.capability_tier, "standard");
t("source.locator is projected", p.source_locator, "https://oaklandca.opengov.com");
t("source.authority is projected", p.source_authority, "Oakland OpenGov portal, City Auditor");
t("source.retrieved is projected", p.source_retrieved, "2026-07-18");
t("source_status is projected", p.source_status, "modified");
t("content_hash is projected", p.content_hash, "sha256:05af3ea6a95789ad8589701a0b72d4711b152e9ad06f761dec5d0000000000aa");
t("monitoring.enabled is projected", p.monitor_enabled, 1);
t("monitoring.frequency is projected", p.monitor_frequency, "monthly");
t("monitoring.last_checked is projected", p.monitor_last_checked, "2026-07-18T22:00:00Z");
t("annotations_open is projected as a number", p.annotations_open, 3);
t("reeval_pending.flag is projected", p.reeval_flag, 1);
t("reeval_pending.since is projected", p.reeval_since, "2026-07-19T00:00:00Z");
t("reeval_pending.source is projected", p.reeval_source, "source_status");

console.log("\n--- it is derived from the document, with the catalog's own parser ---");
t("the columns exist even though meta named none of them", typeof p.source_locator, "string");
t("and the whole frontmatter is kept for the per-schema tail", typeof p.fm_json, "string");
{
  const fm = JSON.parse(p.fm_json);
  t("the tail round-trips a nested block", fm.source.authority, "Oakland OpenGov portal, City Auditor");
}

console.log("\n--- the heterogeneous tail is queryable, not just stored ---");
const prob = (await call(`/projection?id=${PROB_ID}&viewer=class:member`)).result;
t("a problem projects its own produced_by", prob.produced_mode, "agent");
t("fields no information bundle has are absent from the typed columns", prob.source_locator, null);
{
  const fm = JSON.parse(prob.fm_json);
  t("and present in the tail", fm.surfaced_by, "agent");
  t("including a nested per-type array", fm.recheck_triggers[0].text, "Revisit after the next budget cycle");
}
/* SUPERSEDED PIN, CORRECTED 2026-08-07 (REC-59 / IC-24), not exempted. This read
   took the json_extract corpus arm as a BARE ARRAY. That arm was capped at 200
   and an array has nowhere to put a key, so it could say neither what bound it
   applied nor whether the bound bit — the defect IC-24 was filed for and this
   item landed. It now answers `op=list`'s envelope; the rows are `.bundles`. */
const q = (await call(`/projection?jsonPath=$.surfaced_by&jsonEquals=agent&viewer=class:member`)).result;
/* Null-tolerant for the same reason gate-reads.test.mjs is: the negative control
   for this change makes `.bundles` undefined, and an arm that THROWS there kills
   the suite and hides everything behind it instead of naming what broke. */
t("json_extract finds bundles by a field with no column", (q.bundles || []).map((r) => r.bundle_id), [PROB_ID]);
/* AND THE FILTER'S OWN TOTAL IS THE FILTER'S, not the corpus's — the arm that
   catches the easy mistake in this change. A `total` that counted every bundle
   would read as "1 of N shown" on a query that matched exactly one, which is a
   new way of overstating what an answer covers rather than a fix for the old
   one. Asserted against a corpus that is deliberately LARGER than the match. */
t("op=projection: the FILTER arm's `total` counts what the FILTER matched, not the corpus it searched",
  [q.total, (q.bundles || []).length], [1, 1]);
t("op=projection: and the corpus is genuinely bigger, so that equality cost something to produce",
  (await call(`/projection?viewer=class:member`)).result?.total > q.total, true);

console.log("\n--- the projection is indexed, so a filter is a seek and not a scan ---");
const plans = (await call(`/projectionplan`)).result;
t("filtering on source_status uses its index",
  plans.source_status.some((d) => /USING INDEX/.test(d)), true);
t("filtering on produced_mode uses its index",
  plans.produced_mode.some((d) => /USING INDEX/.test(d)), true);

console.log("\n--- a revision reprojects, so the columns cannot go stale ---");
const infoMd2 = infoMd.replace("source_status: modified", "source_status: unchanged")
                      .replace("annotations_open: 3", "annotations_open: 0");
await call("/promote", {
  bundleId: INFO_ID, base: sha(infoMd), snapKey: "20260725T130000Z_projtest2", author: "seed",
  meta: { object_type: "information", group: "believe-in-oakland",
          title: "Sewer Service Fund transfer series", current_state: "collected",
          created: "2026-07-18T22:00:00Z", last_updated: "2026-07-20T19:00:00Z",
          criticality: "crucial" },
  files: [{ path: "bundle.md", text: infoMd2, bytes: infoMd2.length, sha256: sha(infoMd2) }],
  refs: [], register: [],
});
const p2 = (await call(`/projection?id=${INFO_ID}&viewer=class:member`)).result;
t("the revised source_status is projected", p2.source_status, "unchanged");
t("the revised annotations_open is projected", p2.annotations_open, 0);

console.log("\n--- backfill: a row written before the columns existed is repaired ---");
/* Simulate a pre-0.15.0 row by clearing the projection, exactly as an older
   store would have it, then run the backfill the migration runs. */
await call("/projectionclear", { bundleId: INFO_ID });
const cleared = (await call(`/projection?id=${INFO_ID}&viewer=class:member`)).result;
t("the projection is genuinely empty first", [cleared.source_status, cleared.fm_json], [null, null]);
const back = (await call("/reproject", {})).result;
t("the backfill reports what it repaired", back.reprojected, 1);
const p3 = (await call(`/projection?id=${INFO_ID}&viewer=class:member`)).result;
t("and the fields come back from bundle.md", p3.source_status, "unchanged");
t("with the tail rebuilt too", JSON.parse(p3.fm_json).source.locator, "https://oaklandca.opengov.com");

console.log("\n--- a bundle whose frontmatter will not parse does not break the write ---");
const badId = "INFO-2026-0003-unparseable";
const badMd = `---\nid: ${badId}\nthis line is not a key\n---\n\n## Summary\n`;
const bad = await promote(badId, badMd, {
  object_type: "information", group: "believe-in-oakland", title: "bad",
  current_state: "collected", created: "2026-07-19T00:00:00Z", last_updated: "2026-07-19T00:00:00Z",
});
t("the promotion still succeeds", bad.result.ok, true);
const bp = (await call(`/projection?id=${badId}&viewer=class:member`)).result;
t("and the unparseable fields are null rather than wrong", bp.source_status, null);

await mf.dispose();
console.log(`\nprojection: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
