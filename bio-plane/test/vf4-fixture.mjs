#!/usr/bin/env node
/* VF-4's fixture, and the LOCAL gate over it.
 *
 * The bundles this item seeds into the live scratch namespace are validated
 * HERE, against the plane's own catalogue (`checks/bio-checks.mjs`, the same
 * module `op=audit` runs inside the Durable Object), BEFORE anything is
 * promoted. A fixture that audits dirty would make the post-run audit report
 * THIS FILE's defects as the run's residue — which is exactly what happened on
 * VF-4's first live pass and made a negative control pass for the wrong reason.
 *
 * usage: node bio-plane/test/vf4-fixture.mjs      (prints findings; exit 1 if any error)
 */
import { createHash } from "node:crypto";
import { checkBundle } from "../checks/bio-checks.mjs";

const sha = (v) => createHash("sha256").update(v).digest("hex");
export const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
export const CONCLUDED_AT = "2026-07-03T00:00:00Z";
export const DOC = "INFO-2026-9740-vf4-transfer-memo";
export const INQ = "INQ-2026-9740-vf4-concluded";
export const QUESTION = "Where does the sewer fund transfer basis come from?";
export const CONCL = "The transfer rests on a 1998 council resolution never rescinded";
export const FALS = "A rescinding resolution, or a finance memo naming a different authority";
export const AUTHOR = "token:admin";

export const infoMd = () => ["---",
  `id: ${DOC}`, "object_type: information", "schema: information@1",
  `title: "The sewer fund transfer memo"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', `  retrieved: "${NOW}"`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured transfer memo.", "",
  "## Provenance Notes", "", "Captured from the portal.", "",
  "## Session Log", "",
  `### Session ${LATER} | Collected | seed`,
  "Trigger: seeding", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

/* THE CONCLUDED INQUIRY, WRITTEN AS `op=conclude` WOULD HAVE WRITTEN IT.
 *
 * WHY IT IS PROMOTED RATHER THAN CONCLUDED THROUGH THE OP, AND IT IS NOT A
 * SHORTCUT: `Store.conclude()` refuses a machine identity by name
 * (`MACHINE_CANNOT_CONCLUDE`, REC-13) — concluding is a named member's
 * assertion. No member session is reachable in the scratch namespace (VF-4's
 * phase 2a), so the op cannot be driven there at all. The document therefore
 * carries the state, the prior state, the transition, the conclusion, the
 * falsifier and the Session Log entry that the op itself writes, and it is held
 * to the SAME catalogue the op's own output is held to — "nothing concluded here
 * audits dirty" — by this file's gate. The REFUSAL is driven live and recorded;
 * what is simulated is the document, and it is said so here. */
export const inquiryMd = () => ["---",
  `id: ${INQ}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${QUESTION}"`, "current_state: concluded", "prior_state: open",
  `created: "${NOW}"`, `last_updated: "${CONCLUDED_AT}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:", `  - target: ${DOC}`, "    rel: cites", "    status: confirmed",
  "state_history:",
  `  - timestamp: "${CONCLUDED_AT}"`, "    from_state: open", "    to_state: concluded",
  `    author: ${AUTHOR}`, "    trigger: conclusion",
  `    blurb: "state open to concluded"`,
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  `conclusion: "${CONCL}"`, `falsifier: "${FALS}"`,
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${DOC}`, "    role: supports",
  "---", "",
  "## Question", "", QUESTION, "",
  "## What It Rests On", "", `The transfer memo ${DOC}.`, "",
  "## Conclusion", "", CONCL, "",
  "## What Would Falsify This", "", FALS, "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  `### Session ${CONCLUDED_AT} | Concluded | ${AUTHOR}`,
  `Trigger: conclusion`, `Changes: state open to concluded.`,
  `Conclusion: ${CONCL}`, `Falsifier: ${FALS}`, "",
  "## Review Notes", ""].join("\n");

export async function findingsFor(id, text, known) {
  const { findings } = await checkBundle({ folderName: id,
    files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: (x) => known.has(x) });
  return findings.filter((f) => f.severity === "error").map((f) => `${f.check}: ${f.message}`);
}

/** The gate. Returns the two documents only if BOTH audit clean. */
export async function fixtureOrThrow() {
  const known = new Set([DOC, INQ]);
  const a = await findingsFor(DOC, infoMd(), known);
  const b = await findingsFor(INQ, inquiryMd(), known);
  if (a.length || b.length)
    throw new Error(`VF-4 fixture is NOT catalogue-clean and must not be promoted:\n  ${DOC}: `
      + `${a.join(" | ") || "clean"}\n  ${INQ}: ${b.join(" | ") || "clean"}`);
  return { DOC, INQ, infoMd: infoMd(), inquiryMd: inquiryMd() };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const known = new Set([DOC, INQ]);
  const a = await findingsFor(DOC, infoMd(), known);
  const b = await findingsFor(INQ, inquiryMd(), known);
  console.log(`${DOC}: ${a.length ? a.join("\n  ") : "CLEAN"}`);
  console.log(`${INQ}: ${b.length ? b.join("\n  ") : "CLEAN"}`);
  process.exit(a.length || b.length ? 1 : 0);
}
