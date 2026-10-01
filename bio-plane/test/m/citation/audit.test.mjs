/* citation: what `cite`, `sever` and `reinstate` write is a document the check catalogue accepts (R2, R4), read back
   through record-core's audit, a different door from the one that wrote it. Converted from the old battery's
   `citeproject-inquiry` (legacy-tests T17, citation's share: "op=audit finds no error on what cite/sever/reinstate
   rewrote"); its affordances arms are `affordances`'. The documents here are whole ones the catalogue passes before any
   act, so a finding after one is the act's. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, T0, sha } from "./fixture.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const DOC = "INFO-2026-0101-ledger", DOC2 = "INFO-2026-0102-minutes";
const QUESTION = "INQ-2026-0101-transfer", QUESTION2 = "INQ-2026-0102-process";

const core = (id, type, state) => ["---", ...(id ? [`id: ${id}`] : []), `object_type: ${type}`, `schema: ${type}@1`,
  `current_state: ${state}`, "prior_state: null", `created: "${T0}"`, `last_updated: "${T0}"`,
  "produced_by:", "  mode: human", "  capability_tier: member", "group: test-group", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []"];
const infoMd = (id) => [...core(id, "information", "collected"), `title: "Ledger ${id}"`, "criticality: supporting",
  "source_status: unchanged", `content_hash: "sha256:${"0".repeat(64)}"`, "source:", `  locator: "https://example.org/${id}"`,
  '  authority: "Example Board"', '  retrieved: "2026-07-01"', "monitoring:", "  enabled: false", "  frequency: none",
  "  last_checked: null", "---", "", "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "Hashed at receipt.", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const inquiryMd = (id) => [...core(id, "inquiry", "open"), 'title: "Did the transfer follow the adopted process?"',
  "surfaced_by: human", "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.", "---", "",
  "## Question", "", "Did the transfer follow the adopted process?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const projectMd = (title) => [...core(null, "project", "forming"), `title: "${title}"`, 'objective: "Find out."', "---", "",
  "## Thesis Summary", "", "Working frame.", "", "## Open Questions", "", "1. The question.", "", "## Ruled Out", "",
  "Nothing yet.", "", "## Session Log", "", "## Review Notes", ""].join("\n");

function setup() {
  const w = world();
  for (const id of [DOC, DOC2]) {
    const bytes = `the bytes of ${id}`;
    w.put(id, infoMd(id), { captures: [{ path: "snapshots/a.txt", text: bytes, sha: sha(bytes) }] });
  }
  for (const id of [QUESTION, QUESTION2]) w.put(id, inquiryMd(id));
  const caseA = w.put(null, projectMd("The oversight case"), { author: V("ann"), owner: "ann" }).bundleId;
  const caseB = w.put(null, projectMd("The budget case"), { author: V("ann"), owner: "ann" }).bundleId;
  return { w, caseA, caseB };
}
const audit = (w) => w.record.auditPass({ after: "", limit: 50, visible: () => true });
const findingsOn = (a, ids) => a.offenders.filter((o) => ids.includes(o.bundleId));

test("R2, R4: every case and question cite, sever and reinstate rewrote passes the catalogue's audit, before, between and after the withdrawal", async () => {
  const { w, caseA, caseB } = setup();
  const citing = [caseA, caseB, QUESTION, QUESTION2];
  /* The baseline: the whole corpus is clean before any act, so every finding below would be an act's. */
  const before = await audit(w);
  assert.deepEqual([before.checked, before.clean, before.withErrors, before.offenders], [6, 6, 0, []]);
  const versions = Object.fromEntries(citing.map((id) => [id, w.record.head(id).rowVersion]));

  /* A case draws on a question and a document; a second case on the same question; a question rests on a document
     (pinned) and on another question. No citation is hand-authored: every one is written by the act. */
  const s1 = await w.select([QUESTION, DOC]);
  assert.equal(w.cit.cite({ project: caseA, handle: s1, ...ANN, note: "the budget team is asking this too" }).ok, true);
  const s2 = await w.select([QUESTION]);
  assert.equal(w.cit.cite({ project: caseB, handle: s2, ...ANN, note: "the oversight team too" }).ok, true);
  const s3 = await w.select([DOC2, QUESTION2]);
  assert.equal(w.cit.cite({ project: QUESTION, handle: s3, ...ANN, role: "cuts_against", note: "against" }).ok, true);
  const s4 = await w.select([DOC]);
  assert.equal(w.cit.cite({ project: QUESTION2, handle: s4, ...ANN, role: "supports" }).ok, true);
  const cited = await audit(w);
  assert.deepEqual([cited.checked, cited.withErrors, findingsOn(cited, citing)], [6, 0, []]);

  /* The withdrawal, a status change recorded in the document, and the restoration. */
  const sq = await w.select([QUESTION]);
  assert.equal(w.cit.sever({ project: caseA, handle: sq, ...ANN, reason: "the audit answered this" }).ok, true);
  const severed = await audit(w);
  assert.deepEqual([severed.withErrors, findingsOn(severed, citing)], [0, []]);
  assert.equal(w.fm(caseA).references.find((e) => e.target === QUESTION).status, "severed");
  assert.equal(w.cit.reinstate({ project: caseA, handle: sq, ...ANN, reason: "the question is live again" }).ok, true);
  const after = await audit(w);
  assert.deepEqual([after.checked, after.clean, after.withErrors, after.offenders], [6, 6, 0, []]);

  /* Every citing document was really rewritten: the audit read the acts' bytes, not the fixture's. */
  for (const id of citing) assert.ok(w.record.head(id).rowVersion > versions[id], id);
  assert.deepEqual(w.fm(caseA).references.map((e) => [e.target, e.status]).sort(),
                   [[DOC, "confirmed"], [QUESTION, "confirmed"]]);
  assert.deepEqual(w.fm(QUESTION).basis.map((l) => [l.target, l.role]), [[DOC2, "cuts_against"], [QUESTION2, "cuts_against"]]);
});

test("R2, R4: the audit that finds the acts' documents clean is not blind — a citing document the catalogue refuses is counted", async () => {
  const { w, caseA } = setup();
  const s = await w.select([DOC]);
  assert.equal(w.cit.cite({ project: caseA, handle: s, ...ANN }).ok, true);
  w.revise(caseA, w.md(caseA).replace("## Thesis Summary", "## Something Else"));
  const a = await audit(w);
  assert.equal(a.withErrors, 1);
  assert.deepEqual(a.offenders.map((o) => o.bundleId), [caseA]);
});
