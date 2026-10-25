import test from "node:test";
import { inWorld } from "./world.mjs";
import { seedEdition, completeEdition } from "../store-assembly/g54-seed.mjs";
import { publicationOf } from "../../../src/publication/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
const show = (l, x) => console.log(l, JSON.stringify(x).slice(0, 1200));
const tryAct = async (me, op, a) => { try { const r = await me.act(op, a); show(op + " OK", r); return r; } catch (e) { show(op + " REFUSED", String(e.message)); return null; } };
const NOW = "2026-10-22T20:00:00Z";
const KEY = "AAAAC3NzaC1lZDI1NTE5AAAAIKEY";
test("spike", async () => {
  const { world, me } = await inWorld({ handle: "olive" });
  const project = await world.recipes.project(me, "Stormwater");
  const doc = await world.recipes.hold(me, "Council minutes", "Minutes of March 2. The council voted to adjust rents.", project);
  const mint = await me.act("contentmint", { body: { bundleId: doc.bundle, extent: { kind: "document" } } });
  const df = await me.act("datedfact", { body: { captureSha: doc.sha, extent: { kind: "document" }, kind: "issued", value: "2026-03-02", method: "a member's reading" } });
  const ev = await me.act("eventcreate", { body: { kind: "order", attestations: [{ datedFactId: df.dated_fact.dated_fact_id }] } });
  const now = new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const al = await me.read("allocid", { query: { prefix: "INQ", year: "2026" } });
  const qid = al.id + "-rents";
  const md = ["---", `id: ${qid}`, "object_type: inquiry", "schema: inquiry@1", `title: "Did the adjustments cause the higher rent?"`, "current_state: open", "prior_state: null", `created: "${now}"`, `last_updated: "${now}"`, `project: ${project}`,
    "produced_by:", "  mode: human", "  capability_tier: session", "references:", `  - target: ${doc.bundle}`, "    rel: cites", "    status: confirmed", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "surfaced_by: human", 'disposition_reason: ""',
    "basis:", `  - target: ${doc.bundle}`, "    role: supports", `    content_id: ${mint.content_id}`,
    "---", "", "## Question", "", "Did the adjustments cause the higher rent?", "", "## Conclusion", "", "x", "", "## Session Log", "", "## Review Notes", ""].join("\n");
  await me.act("promote", { body: { bundleId: qid, base: null, snapKey: now.replace(/[-:]/g, "") + "_q1", meta: { object_type: "inquiry", current_state: "open", created: now, last_updated: now }, files: [{ path: "bundle.md", text: md }], register: [] } });
  await tryAct(me, "drawquestion", { query: { project, inquiry: qid } });
  await tryAct(me, "conclude", { query: { target: qid, project, reading: "The rent rose because of the adjustments.", no_falsifier: "1" } });
  await tryAct(me, "conclude", { query: { target: qid, conclusion: "The rent rose because of the adjustments.", falsifier: "A rent roll showing no rise." } });
  show("pq", await me.read("projectquestions", { query: { project } }));
  // publication
  const pub = publicationOf(world.ctx), record = recordOf(world.ctx);
  const pin = record.head(qid).bundleSha;
  const caseId = "CASE-2026-0101";
  const text = ["---", "format: bio-case-document/6", `case_id: ${caseId}`, "case_edition: 1", `case_project: ${project}`, "case_roles:", `  - target: ${qid}`, `    version_sha: ${pin}`, "    edition: 1", "    role: load_bearing", "case_findings:", `  - ${qid}`, "case_strength: []", "completeness:", "  author: member:olive", `  at: "${NOW}"`, "completeness_excluded: []", "case_citations: []", "method:", '  grading: "grading/1"', '  checks: "1.0.0"', "materials: []", "material_attestations: []", "---", "", "## Scope", "", "The question.", "", "## What This Excludes", "", "Nothing else.", "", "## What Was Searched", "", "Everything.", ""].join("\n");
  const st = pub.storeCaseDocument({ case: caseId, edition: 1, text, author: "member:olive", at: NOW });
  show("store", st);
  const sc = record.transact(() => pub.commitCaseEdition({ case: caseId, edition: 1, project, scope: "The question.", completeness: { statement: "It leaves out the minutes.", author: "member:olive" }, biasAcknowledgement: "none declared", bar: null, roster: [{ bundle_id: qid, version_sha: pin, role: "load_bearing" }], sigArmored: "-----BEGIN SSH SIGNATURE-----\nsig\n-----END SSH SIGNATURE-----", attestorKey: KEY, attestorMember: "olive", gateVersion: "plane-gate/test", deliveredBy: "member:olive", at: NOW }));
  show("commitCase", sc);
  const sf = record.transact(() => pub.commitEdition({ bundleId: qid, bundleSha: pin, title: "Finding", completeness: null, strength: null, memberCarriesBlocks: false, group: "test-group", edges: [], shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: 10 }], attestorKey: KEY, attestorMember: "olive", gateVersion: "plane-gate/test", sigArmored: "-----BEGIN SSH SIGNATURE-----\nsig9\n-----END SSH SIGNATURE-----", deliveredBy: "member:olive", at: NOW }));
  show("commitFinding", sf);
  show("publishedlist", await me.read("publishedlist"));
  for (const q of [{ id: caseId }, { id: caseId, edition: "1" }, { id: qid }]) { try { show("publishedcase " + JSON.stringify(q), await me.read("publishedcase", { query: q })); } catch (e) { show("pc REF", e.message); } }
  const std = await me.act("standarddeclare", { body: { cite: "Lease §7.2", kind: "ordinance", issuer: "City of Oakland", reason: "we hold the city to it", period: { from: "2020-01-01", to: "2030-12-31" }, text: [mint.content_id] } });
  const det = await tryAct(me, "determine", { body: { project, act: { event: ev.event_id, actor: { role: "City Administrator", body: "City of Oakland" }, evidence: [mint.content_id] }, findings: [{ finding: qid }],
    standards: [{ standard: std.id, outcome: "noncompliant" }], rows: [{ standard: std.id, requires: "a council vote", did: "no vote was held", reading: "diverges" }], questions: [], reason: "recorded" } });
});
