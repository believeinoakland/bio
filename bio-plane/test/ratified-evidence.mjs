/* ratified-evidence.mjs — D-431's ONE fixture helper: make bundles EVIDENCE OF A RATIFIED CASE.
 *
 * WHY THIS EXISTS. `BIO_Publication_v0_1.md` §3 rule 2 as BOB #16 decided it (D-431, 2026-09-19):
 * `op=ratify` publishes nothing outside a RATIFIED case. A finding crosses only at a sha a ratified
 * case pins; ANY OTHER bundle — information, or an inquiry cited as evidence — crosses only when a
 * ratified case's pinned finding RESTS ON it, signed by an owner of that case's project and delivered
 * by the founder or a joined member. Several suites used a LOOSE information bundle as the vehicle for
 * their own subject (the signature, the gate, the published fence, the doorbell, the envelope, the
 * public read's loose branch) — which was publication outside a case, and is now refused C-58.3. Each
 * such suite is CORRECTED AT ITS SITE, never exempted: its bundle is made what rule 2 requires, the
 * evidence of a ratified case, and everything the suite asserts about its own subject is unchanged.
 *
 * ONE helper rather than a hand-built case per suite, for `adoptable-reading.mjs`'s reason: a case copied
 * six times is six places for the fixture to drift from what the gates accept, and the drift would read
 * as a plane defect.
 *
 * WHAT IT BUILDS, through the OPS (so it is evidence a caller can reach it, not a store-level shortcut):
 *   - a PROJECT (promoted with the caller's machine/operator token), its ownership handed to `owner`
 *     through the Durable Object's own `projectclaimowner` surface (`projects.test.mjs`'s precedent);
 *   - a concluded INQUIRY whose `references[]` names every target (the first as `cites`, with the one
 *     basis leg — a D-graded testimony leg, exactly `ratify-authority.test.mjs`'s fixture, which the gates
 *     are measured to accept; the rest as `relates_to`) — so each target is on the published graph's
 *     serve-class edge set, `Store.publishedGraphEdges`, which is what "rests on" means;
 *   - a CASE over that inquiry (`op=publish`, the owner's session) and its case document SIGNED BY THE
 *     OWNER (`op=caseratify`), which commits the pin.
 * It does NOT ratify the finding and does NOT ratify the targets: the suite does that, as its subject.
 *
 * PRECONDITION, stated rather than guessed: every target must be UNPUBLISHED when this runs, because the
 * inquiry's leg on the first one is graded and C-21.2 refuses a graded leg of its own on a published
 * bundle. It throws, naming the step, on any refusal — a fixture that half-built would read as the plane.
 */
import { projectFixtureMd, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

const unwrap = (r) => (r && typeof r === "object" && "result" in r && !("reason" in r && r.ok === false)) ? r.result : r;
const okOrThrow = (what, r) => {
  const v = unwrap(r);
  if (!v || v.ok === false) throw new Error(`ratified-evidence: ${what}: ${JSON.stringify(v).slice(0, 700)}`);
  return v;
};

const inquiryMd = (id, question, targets, at) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${at}"`, `last_updated: "${at}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  "references:",
  ...targets.flatMap((tg, i) => [`  - target: ${tg}`, `    rel: ${i === 0 ? "cites" : "relates_to"}`, "    status: confirmed"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${targets[0]}`, "    role: supports",
  "    grade: D", "    grade_axis: connection", "    grade_source: testimony",
  "---", "", "## Question", "", question, "",
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${at} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

/**
 * @param {object} o
 * @param {(q:string, body?:object)=>Promise<any>} o.post   POST to `/api/?<q>` (wrapped or not; unwrapped here)
 * @param {(q:string)=>Promise<any>} o.get                   GET `/api/?<q>`
 * @param {(path:string, body:object)=>Promise<any>} o.doPost POST to the Durable Object of the SAME store
 * @param {(s:string)=>string} o.sha                          sha256 hex
 * @param {string} o.promoteToken  a token that may `op=promote` (the suite's machine/operator token)
 * @param {string} o.owner         the member who owns the project and SIGNS the case document
 * @param {string} o.ownerToken    that member's own SESSION token (it publishes, concludes and caseratifies)
 * @param {(text:string)=>string} o.signText  the owner's SSHSIG over `text`, namespace `bio-ratify`
 * @param {string[]} o.targets     the bundles to make evidence (at least one; all unpublished)
 * @param {string} o.n             a four-digit tag unique in the suite, for the ids
 * @param {string} [o.store]       `&store=` suffix the suite's ops carry (e.g. "&store=scratch"), or ""
 * @param {string} [o.at]          an ISO instant for the documents
 * @returns {Promise<{project:string, lead:string, case_id:string, edition:number}>}
 */
export async function restOnARatifiedCase({ post, get, doPost, sha, promoteToken, owner, ownerToken, signText,
                                            targets, n, store = "", at = "2026-07-01T00:00:00Z" } = {}) {
  if (!Array.isArray(targets) || !targets.length) throw new Error("ratified-evidence: no targets");
  const lead = `INQ-2026-${n}-evidence`;
  let seq = 0;
  const promote = async (id, text, objectType, state, label = id) => okOrThrow(`promote ${label}`, await post(`op=promote&token=${promoteToken}${store}`, {
    ...(id === null ? {} : { bundleId: id }), base: null,
    snapKey: `20260701T${String(700000 + (++seq))}Z_${sha(label).slice(0, 8)}`,
    meta: { object_type: objectType, group: "believe-in-oakland",
            current_state: state, created: at, last_updated: at },
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [] }));
  /* CORRECTED 2026-09-19 at D-431's integration (CONDUCT #6), where this new fixture met REC-141 (IC-158): a
     project's id is minted by the plane and a creation that names one is refused C-59.1, so the project is
     promoted with NO id and `project` is the id the plane answers. What the fixture builds is unchanged. */
  const label = `PROJ-2026-${n}-evidence`;
  const project = (await promote(null, projectFixtureMd(null, { created: at, updated: at, name: label }),
    "project", "investigating", label)).bundleId;
  okOrThrow(`projectclaimowner ${project}`, await doPost("projectclaimowner", { projectId: project, memberId: owner }));
  await promote(lead, withAdoptableReading(inquiryMd(lead, `Does the record in ${lead} answer the question?`, targets, at)),
    "inquiry", "open");
  okOrThrow(`conclude ${lead}`, await get(`op=conclude&token=${ownerToken}${store}&target=${lead}`
    + `&conclusion=${encodeURIComponent("The record in hand answers it.")}`
    + `&falsifier=${encodeURIComponent("A later record contradicting it would overturn this.")}`
    + adoptedVersionParam()));
  const pub = okOrThrow(`publish ${project}`, await post(`op=publish&token=${ownerToken}${store}`, {
    project, targets: [lead], roles: allLoadBearing({ targets: [lead] }),
    scope: "Whether the record in hand answers the question, on the documents in hand.",
    statement: "This case covers the documents in hand at edition 1 only.",
    excluded: [], subjectPosition: "sought_and_answered",
    subjectJustification: "We put the question to the subject on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds that public records should be read in full." }));
  const d = pub.caseDocument;
  if (!d || !d.case_id) throw new Error(`ratified-evidence: publish ${project} returned no case document`);
  okOrThrow(`caseratify ${d.case_id}`, await post(`op=caseratify&token=${ownerToken}${store}`, {
    caseId: d.case_id, edition: d.edition, expectedSha: d.doc_sha,
    sig: signText(`bio-ratify-case ${d.case_id} ${d.edition} ${d.doc_sha}\n`) }));
  return { project, lead, case_id: d.case_id, edition: d.edition };
}
