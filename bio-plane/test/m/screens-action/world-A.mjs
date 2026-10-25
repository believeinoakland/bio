/* screens-action's Matter tests over `store-request`'s world (K5148; op-tables §5.3): the real store, a member really signed in, and the matter
   built by the acts that make it: a project, two documents it holds (each with its passage minted as citable), an event the first document dates,
   an event the second states undated, a question drawn into the project and concluded there, the case that publishes it, two standards the city
   issued, a determination of the act (one standard noncompliant, one compliant), the consequences recorded against it, and an escalation opened
   and advanced to the stage a test needs. The ids a test asserts are read back from the world's own answers, never copied from a literal.
   Imports `./world.mjs` first (op-declarations is not registered after its first read). */
import { actionWorld, actionDoc, correspond, inWorld } from "./world.mjs";
import { publicationOf } from "../../../src/publication/index.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";

export { actionWorld, actionDoc, correspond, inWorld };

const NOW = "2026-10-22T20:00:00Z";
const KEY = "AAAAC3NzaC1lZDI1NTE5AAAAIKEY";
const SIG = (n) => `-----BEGIN SSH SIGNATURE-----\nsig${n}\n-----END SSH SIGNATURE-----`;
export const ACT = { role: "City Administrator", body: "City of Oakland" };
export const CITE = { a: "Lease §7.2", b: "Lease §9.1" };
export const FINDING_TITLE = "Did the adjustments cause the higher rent?";

const instant = (world) => new Date(world.now()).toISOString().replace(/\.\d{3}Z$/, "Z");

/** A document the project holds, its whole text a passage minted as citable. Answers `{bundle, sha, content}`. */
export async function heldDoc(world, me, project, name, text) {
  const held = await world.recipes.hold(me, name, text, project);
  const minted = await me.act("contentmint", { body: { bundleId: held.bundle, extent: { kind: "document" } } });
  return { ...held, content: minted.content_id };
}

/** A question of `project` (an inquiry resting on `doc`), drawn into the project. With `conclude`, the project concludes it in its own words. Answers its id. */
export async function question(world, me, project, doc, title, { conclude = null } = {}) {
  const now = instant(world);
  const slug = title.toLowerCase().replace(/[^a-z]+/g, "-").replace(/^-|-$/g, "").slice(0, 20);
  const qid = (await me.read("allocid", { query: { prefix: "INQ", year: now.slice(0, 4) } })).id + "-" + slug;
  const md = ["---", `id: ${qid}`, "object_type: inquiry", "schema: inquiry@1", `title: ${JSON.stringify(title)}`, "current_state: open", "prior_state: null", `created: "${now}"`,
    `last_updated: "${now}"`, `project: ${project}`, "produced_by:", "  mode: human", "  capability_tier: session", "references:", `  - target: ${doc.bundle}`, "    rel: cites",
    "    status: confirmed", "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null", "visuals: []", "surfaced_by: human",
    'disposition_reason: ""', "basis:", `  - target: ${doc.bundle}`, "    role: supports", `    content_id: ${doc.content}`, "---", "", "## Question", "", title, "", "## Conclusion", "", "x", "",
    "## Session Log", "", "## Review Notes", ""].join("\n");
  await me.act("promote", { body: { bundleId: qid, base: null, snapKey: now.replace(/[-:]/g, "") + "_" + slug.slice(0, 8), meta: { object_type: "inquiry", current_state: "open", created: now, last_updated: now },
    files: [{ path: "bundle.md", text: md }], register: [] } });
  await me.act("drawquestion", { query: { project, inquiry: qid } });
  if (conclude) await me.act("conclude", { query: { target: qid, project, reading: conclude, no_falsifier: "1" } });
  return qid;
}

/** The case that publishes `finding` for `project`, through publication's own commits as the store-assembly tests play them (a ratification signs with an
 *  SSH key, which no act of the door can); the world's `publishedlist` then lists it. Answers `{caseId, edition}`. */
export function publish(world, project, finding, { caseId = "CASE-2026-0101", edition = 1 } = {}) {
  const pub = publicationOf(world.ctx), record = recordOf(world.ctx);
  const pin = record.head(finding).bundleSha;
  const text = ["---", "format: bio-case-document/6", `case_id: ${caseId}`, `case_edition: ${edition}`, `case_project: ${project}`, "case_roles:", `  - target: ${finding}`, `    version_sha: ${pin}`,
    "    edition: 1", "    role: load_bearing", "case_findings:", `  - ${finding}`, "case_strength: []", "completeness:", "  author: member:olive", `  at: "${NOW}"`, "completeness_excluded: []",
    "case_citations: []", "method:", '  grading: "grading/1"', '  checks: "1.0.0"', "materials: []", "material_attestations: []", "---", "", "## Scope", "", "The question.", "",
    "## What This Excludes", "", "Nothing else.", "", "## What Was Searched", "", "Everything.", ""].join("\n");
  const stored = pub.storeCaseDocument({ case: caseId, edition, text, author: "member:olive", at: NOW });
  if (!stored.ok) throw new Error("storeCaseDocument " + JSON.stringify(stored).slice(0, 300));
  const signed = record.transact(() => pub.commitCaseEdition({ case: caseId, edition, project, scope: "The question.", completeness: { statement: "It leaves out the minutes.", author: "member:olive" },
    biasAcknowledgement: "none declared", bar: null, roster: [{ bundle_id: finding, version_sha: pin, role: "load_bearing" }], sigArmored: SIG(1), attestorKey: KEY, attestorMember: "olive",
    gateVersion: "plane-gate/test", deliveredBy: "member:olive", at: NOW }));
  if (!signed.ok) throw new Error("commitCaseEdition " + JSON.stringify(signed).slice(0, 300));
  const done = record.transact(() => pub.commitEdition({ bundleId: finding, bundleSha: pin, title: "Finding", completeness: null, strength: null, memberCarriesBlocks: false, group: "test-group",
    edges: [], shas: [{ sha256: pin, path: "bundle.md", kind: "bundle", bytes: 10 }], attestorKey: KEY, attestorMember: "olive", gateVersion: "plane-gate/test", sigArmored: SIG(9),
    deliveredBy: "member:olive", at: NOW }));
  if (!done.ok) throw new Error("commitEdition " + JSON.stringify(done).slice(0, 300));
  return { caseId, edition };
}

/** A standard the city issued, in force from 2020 to 2030, its text the passage `doc.content`. Answers its id. */
export async function standard(me, doc, cite) {
  const r = await me.act("standarddeclare", { body: { cite, kind: "ordinance", issuer: ACT.body, reason: "the team holds the city to it", period: { from: "2020-01-01", to: "2030-12-31" }, text: [doc.content] } });
  return r.id;
}

/** The matter's world: `{world, me, project, docs: [minutes, lease], events: {dated, undated}, finding, other, std: {a, b}}`. `a` is the standard a determination finds
 *  noncompliant and `b` the one it finds compliant. `handle` is the member (the project's owner). */
export async function matterWorld({ handle = "olive", ...o } = {}) {
  const { world, me } = await inWorld({ handle, ...o });
  const project = await world.recipes.project(me, "Stormwater");
  const minutes = await heldDoc(world, me, project, "Council minutes", "Minutes of March 2. The council voted to adjust rents.");
  const lease = await heldDoc(world, me, project, "The lease", "The lease, section 7.2: rents change only by a council vote.");
  const dated = await me.act("datedfact", { body: { captureSha: minutes.sha, extent: { kind: "document" }, kind: "issued", value: "2026-03-02", method: "a member's reading of the minutes" } });
  const event = (await me.act("eventcreate", { body: { kind: "order", attestations: [{ datedFactId: dated.dated_fact.dated_fact_id }] } })).event_id;
  const undated = (await me.act("eventcreate", { body: { kind: "meeting", attestations: [{ captureSha: lease.sha, extent: { kind: "document" } }] } })).event_id;
  const finding = await question(world, me, project, minutes, FINDING_TITLE, { conclude: "The rent rose because of the adjustments." });
  const other = await question(world, me, project, lease, "Who signed the memo?");
  publish(world, project, finding);
  const a = await standard(me, minutes, CITE.a);
  const b = await standard(me, minutes, CITE.b);
  return { world, me, project, docs: [minutes, lease], events: { dated: event, undated }, finding, other, std: { a, b } };
}

/** The act of the determination, as `determine` takes it. */
export const actOf = (w) => ({ event: w.events.dated, actor: { ...ACT }, evidence: [w.docs[0].content] });

/** A determination of the matter's act: `a` found noncompliant and `b` compliant (`outcomes` replaces them). Answers its id. */
export async function determine(w, { outcomes = { a: "noncompliant", b: "compliant" }, project = w.project, extra = {} } = {}) {
  const rows = { a: { requires: "a council vote", did: "adjusted without a vote", reading: "diverges" }, b: { requires: "notice within 30 days", did: "noticed on day 21", reading: "aligns" } };
  const keys = Object.keys(outcomes);
  const r = await w.me.act("determine", { body: { project, act: actOf(w), findings: [{ finding: w.finding }], standards: keys.map((k) => ({ standard: w.std[k], outcome: outcomes[k] })),
    rows: keys.map((k) => ({ standard: w.std[k], ...rows[k] })), reason: "recorded", ...extra } });
  return r.id;
}

/** The consequences of `det` recorded as the screen records them: a class of tenants measured in money (assessed by the member), and a program not yet measured.
 *  Answers the two parts' ids. */
export async function consequences(w, det) {
  const class_ = await w.me.act("consequencerecord", { body: { determination: det, standard: w.std.a, affected: { kind: "class", description: "Tenants of the district" },
    period: { from: "2024-01-01", to: "2026-09-30" }, measure: { unit: "money", value: "38000" }, basis: { rationale: "from the rent roll", rests_on: [] } } });
  const program = await w.me.act("consequencerecord", { body: { determination: det, standard: w.std.a, affected: { kind: "program", description: "The repair program" },
    period: { from: "2024-01-01", to: "2026-09-30" }, basis: { why: "not_assessed" } } });
  return [class_.id, program.id];
}

/** A breach action of the matter: an action to the Town Clerk of the Town of Port Ellery that rests on `det`. Answers its id. */
export async function breachAction(w, det, title = "Inspection logs, 2025") {
  const doc = actionDoc(w.project, { title, extra: ["breach: true", "action_basis:", `  - target: ${det}`, "    kind: rests_on"] });
  return (await w.me.act("actioncreate", { body: { document: doc, project: w.project } })).id;
}

/** An escalation of `det` opened and advanced by its acts to `stage` (1 to 7). Where the stage needs it: a breach action attached at stage 2 and sent, the reply to it received
 *  (its `ord` read back from the ledger), the evaluation at stage 4, and at stage 7 a second breach action left unattached. `attach: false` leaves the stage-2 action unattached
 *  (a spare is always made at stage 2). Answers `{esc, action (attached at 2), reply: {action, ord}, spare}`. */
export async function escalate(w, det, { stage = 2, attach = true, sent = true } = {}) {
  const { me } = w;
  const out = { esc: null, action: null, reply: null, spare: null };
  out.esc = (await me.act("escalationopen", { body: { determination: det, reason: "the city has not put it right" } })).id;
  const go = (to) => me.act("escalationadvance", { body: { id: out.esc, to, reason: "its trigger is met" } });
  if (stage < 2) return out;
  await go(2);
  if (stage === 2 && !attach) { out.spare = await breachAction(w, det, "Spare breach action"); return out; }
  out.action = await breachAction(w, det);
  await me.act("escalationattach", { body: { id: out.esc, action: out.action, reason: "it states the breach" } });
  if (stage === 2) { if (sent) await correspond(me, out.action, "sent"); out.spare = await breachAction(w, det, "Spare breach action"); return out; }
  await correspond(me, out.action, "sent");
  await go(3);
  if (stage === 3) return out;
  const ord = await correspond(me, out.action, "received");
  out.reply = { action: out.action, ord };
  await go(4);
  if (stage === 4) return out;
  await me.act("escalationevaluate", { body: { id: out.esc, reading: "denied", reason: "it refuses", response: out.reply } });
  await go(stage === 7 ? 7 : 5);
  if (stage === 7) out.spare = await breachAction(w, det, "Spare breach action");
  return out;
}
