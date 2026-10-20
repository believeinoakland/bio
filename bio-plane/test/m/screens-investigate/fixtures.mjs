/* screens-investigate's tests: the scripted plane behind each screen, over interface-shell's served page (its tests'
 * harness, `harness.mjs`, and document stand-in, `dom.mjs`). Each fixture answers its screen's reads in their owners'
 * shapes as surveyed on `tranche/T47` (J1); a test overrides any op. */
import { SCREENS } from "../../../src/screens-investigate/index.mjs";
import { boot, ok, textNodes } from "../interface-shell/harness.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import assert from "node:assert/strict";

export { SCREENS, word, hasWord };
/** R30: `el` draws the word `key` (filled with `vars`) as `word` gives it; no test holds a sentence's English. */
/** A calendar day (`YYYY-MM-DD`) as the kit draws it, by its words (`date.daymonthyear`, `date.month.*`). */
export const dayOf = (iso) => { const [y, m, d] = iso.split("-").map(Number); return word("date.daymonthyear", { day: String(d), month: word("date.month." + ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"][m - 1]), year: String(y) }); };
export const drew = (el, key, vars, msg) => assert.ok(el.textContent.includes(word(key, vars)), msg || `${key} drawn`);
export const notDrew = (el, key, vars, msg) => assert.ok(!el.textContent.includes(word(key, vars)), msg || `${key} not drawn`);
/** The wire value the providers label a declared step with (a marker the screens compare, never drawn); built, not written out, since no test holds a sentence (K3810). */
export const DECLARED = ["declared", "not evidenced"].join(", ");
export const P = "PROJ-2026-0007";
export const ENT = "ENT-2026-0012";
export const ORG = "ENT-2026-0003";
export const SHA = "3b9f" + "0".repeat(56) + "c210";
export const SHA2 = "9a" + "1".repeat(62);
export const MSR = "MSR-2026-0001";
export const M1 = "MNY-2026-aaaa", M2 = "MNY-2026-bbbb", M3 = "MNY-2026-cccc";
export const CALC = "CALC-2026-0001";
export const DRAW = "d".repeat(64);
export const PROC = "ENT-2026-0100";
export const ACT = "ACTN-2026-0005";
export const STD = "STD-2026-0004-policy";
export const COURT = "ENT-2026-0101";
export const HELD = { ok: true, held: [{ bundle_id: "INFO-2026-0001", title: "Lease amendment 1", capture: { sha256: SHA } }, { bundle_id: "INFO-2026-0002", title: "Rent schedule", capture: { sha256: SHA2 } }], truncated: false };

export const SHA3 = "5c" + "2".repeat(62);
/** `heldcaptures` as `capture` R77/R88 answers it: the default list is the documents at `collected` (held); `held_and_vouched` adds
 *  the ones a member has vouched for. A document in neither state is in neither list. */
export const HELD_VOUCHED = { ok: true, held: [...HELD.held, { bundle_id: "INFO-2026-0003", title: "Vouched minutes", capture: { sha256: SHA3 } }], truncated: false };
export const heldByState = (r) => ok(r.query && r.query.state === "held_and_vouched" ? HELD_VOUCHED : HELD);

export const PROJECT_MD = ["---", `id: ${P}`, "object_type: project", "title: \"Pothole repairs\"", "references:",
  `  - target: ${ENT}`, "    rel: cites", "    status: active", "  - target: INQ-2026-0001-seven-days", "    rel: cites", "    status: active", "---", ""].join("\n");

export const PERSON = (o = {}) => ({ ok: true, found: true, entity_id: ENT, at: "2026-10-14",
  cluster: { state: "linked", members: [ENT, "ENT-2026-0019"], truncated: false },
  names: [{ member: ENT, name: "L. Chen", from: "registry" }],
  facts: [{ fact_id: "PFA-2026-0007", member: ENT, kind: "locality", value: "Oakview district", valid: { from: "2022-03-01", to: null, precision: "day", zone: "UTC" },
    question: null, citation: { captureSha: SHA, extent: { kind: "pdf-page", page: 2 } }, grade: "B", by: "member:mai", at: "2026-10-02T09:00:00Z", withdrawn: null }],
  posts: [{ member: ENT, line_id: "LIN-2026-0040", kind: "holds", from: ENT, to: ORG, capacity: "employee", title: "Director of Public Works",
    valid: { from: "2022-03-01", to: null, precision: "day", zone: "UTC" }, grade: { assertion: "B", ends: ["B", "B"] }, citation: { captureSha: SHA, extent: { kind: "pdf-page", page: 0 } } }],
  duties: [], undetermined: [], truncated: {}, limit: 500,
  claims: [{ claim_id: "IDC-2026-0001", a: ENT, b: "ENT-2026-0019", kind: "same_as", basis: "name", grade: "B", why: "both hold the Deputy Director post on the cited dates", by: "member:dev", at: "2026-10-03T09:00:00Z" },
    { claim_id: "IDC-2026-0002", a: ENT, b: "ENT-2026-0021", kind: "unsure", basis: "testimony", grade: "C", why: "the same surname", by: "member:mai", at: "2026-10-04T09:00:00Z" }], ...o });
export const PERSON_ENTITY = { ok: true, found: true, entity: { entity_id: ENT, kind: "person", label: "L. Chen", note: "Director", aliases: [
  { alias: "L. Chen", canonical: true, declared_by: "machine:roster", at: "2026-09-01T09:00:00Z", withdrawn: null },
  { alias: "Lin Chen", canonical: false, declared_by: "member:mai", at: "2026-10-01T09:00:00Z", withdrawn: null }],
  relations: [{ relation_id: "REL-2026-0001", relation: "member_of", from_entity: ENT, to_entity: ORG, direction: "out", justification: "sits on its board", citation: "minutes, page 2", declared_by: "member:dev", at: "2026-10-02T09:00:00Z", withdrawn: null }] } };
export const DIRECTORY = (o = {}) => ({ ok: true, following: 3, in_your_projects: 1, limit: 50, truncated: false, cursor: null,
  rows: [{ entity: ENT, kind: "person", name: "L. Chen", today: { posts: [{ line_id: "LIN-1", title: "Director of Public Works", capacity: "employee", office: { entity: "ENT-9", label: "Director" }, body: { entity: ORG, label: "Public Works Department" } }] },
    documents: 14, questions: 2, projects: 1, newest_added: "2026-10-02T09:00:00Z", mine: true },
  { entity: ORG, kind: "body", name: "Public Works Department", today: { kind: "body", sector: "government", note: "A city department · repairs streets and sewers", note_by: "member:mai", machine: false },
    documents: 11, questions: 0, projects: 0, newest_added: "2026-09-28T09:00:00Z", mine: false }], ...o });
export const WALK = (o = {}) => ({ ok: true, from: ENT, at: { value: "2026-10-14", precision: "day", zone: "UTC" }, kinds: [], order: { by: "fewest steps first" },
  paths: [{ hops: [{ id: "lines:holds:1", from: ENT, to: ORG, kind: "line:holds:employee", owner: "lines", valid: {}, evidence: [{ source: "capture:" + SHA, extent: { kind: "pdf-page", page: 1 } }], grade: { assertion: "B", ends: ["B", "B"] }, derived: null },
    { id: "co:5", from: ORG, to: "ENT-2026-0200", kind: "mentioned_together", owner: "connections", valid: {}, evidence: [], grade: { assertion: "C", ends: ["C", "C"] }, derived: { method: "co-mention@1", inputs: [ORG, "ENT-2026-0200"], as_of: "2026-10-14" } }],
    grade: { assertion: "C", end: "C" }, label: "evidenced", marks: [{ hop: "co:5", mark: "derived" }], at_date: "in" },
  { hops: [{ id: "REL-2026-0002", from: ENT, to: "ENT-2026-0300", kind: "proxy_for", owner: "entities", valid: {}, evidence: [], grade: { assertion: "D", ends: ["D", "D"] }, derived: null, label: DECLARED }],
    grade: { assertion: "D", end: "D" }, label: "lead", lead: { hops: ["REL-2026-0002"], sentence: "a lead" }, marks: [{ hop: "REL-2026-0002", mark: DECLARED }], at_date: "in" }],
  hubs: [], fanout_truncated: [], owner_refusals: [], visited: 5, depth: 8, budget_ms: 10000, elapsed_ms: 4, owner_calls: 3, complete: true, note: "", ...o });
export const VOCAB = { vocabularies: { connection_kinds: { values: ["line:holds:employee", "money_flow", "mentioned_together", "proxy_for"],
  words: { "line:holds:employee": { word: "held the post (employee)", group: "pos" }, money_flow: { word: "money", group: "money" }, mentioned_together: { word: "co-mentioned", group: "ment" }, proxy_for: { word: "proxy for", group: "same" }, event_voted: { word: "voted", group: "part" }, step_source: { word: "step sourced", group: "step_source" } } } } };
VOCAB.vocabularies.connection_kinds.values.push("event_voted", "step_source");
VOCAB.vocabularies.proceeding_kinds = [{ kind: "civil", label: "Civil", forum_kind: "court" }, { kind: "writ", label: "Writ", forum_kind: "court" }, { kind: "appeal", label: "Appeal", forum_kind: "court" },
  { kind: "complaint", label: "Complaint", forum_kind: "commission" }];
/** `exploregraph`'s answer: a person one ring out and an organisation two rings out, the far node a stop (explore R21). */
export const GRAPH_PERSON = "ENT-2026-0200";
export const GRAPH = (o = {}) => ({ ok: true, centre: ENT, at: { value: "2026-10-14", precision: "day", zone: "UTC" },
  nodes: [{ id: ENT, ring: 0, id_kind: "ENT", label: "L. Chen", entity_kind: "person" }, { id: GRAPH_PERSON, ring: 1, id_kind: "ENT", label: "R. Alvarez", entity_kind: "person" }, { id: ORG, ring: 2, id_kind: "ENT", label: null, entity_kind: "body" }],
  steps: [{ id: "co:1", from: ENT, to: GRAPH_PERSON, kind: "mentioned_together", word: "co-mentioned", class: "derived", grade: { assertion: "C", ends: ["C", "C"] }, evidence: [{ source: "capture:" + SHA }], valid: {} },
    { id: "lines:holds:1", from: GRAPH_PERSON, to: ORG, kind: "line:holds:employee", word: "held the post (employee)", class: "evidentiary", grade: { assertion: "B", ends: ["B", "B"] }, evidence: [{ capture_sha: SHA, extent: { kind: "pdf-page", page: 1 } }], valid: {} }],
  stopped: [{ node: ORG, why: "ring" }], visited: 3, budget_ms: 10000, elapsed_ms: 2, ...o });
export const TIMELINE = (o = {}) => ({ ok: true, set: [ENT],
  world: { label: "what they did", items: [
    { event_id: "EVT-2026-0001", kind: "vote", status: "EventScheduled", when: { start: "2024-01-12T08:00:00Z", end: "2024-01-13T08:00:00Z", precision: "day", zone: "UTC", value: "2024-01-12" }, roles: [], concerns: true, of: [ENT], order: { undetermined: false },
      participants: [{ participant_id: 1, entity_id: ORG, role: "decider", attestation_id: 1, grades: { attestation: "B", resolution: "B" } }, { participant_id: 2, entity_id: ENT, role: "voted", vote_value: "for", attestation_id: 1, grades: { attestation: "B", resolution: "B" } },
        { participant_id: 3, entity_id: "ENT-2026-0300", role: "voted", vote_value: "against", attestation_id: 1, grades: { attestation: "C", resolution: "C" } }], participants_total: 3, participants_truncated: false, grade: "B" },
    { event_id: "EVT-2026-0002", kind: "decision", status: "EventScheduled", when: { start: null, end: null, precision: "edtf", zone: "UTC", value: "2024-03" }, roles: [], concerns: true, of: [ENT], order: { undetermined: true, with: ["EVT-2026-0003"], band: {} }, participants: [], participants_total: 0, participants_truncated: false, grade: "C" }],
    placed_nowhere: [{ event_id: "EVT-2026-0009", kind: "statement", status: "EventScheduled", when: null, roles: [], concerns: false, of: [ENT], participants: [], participants_total: 0, grade: null, grade_why: { key: "events.why.placed_nowhere_event", vars: {} } }], limit: 100, truncated: false },
  ours: { label: "what we did", sources: [{ source: "actions", items: [{ at: "2026-09-04", label: "We requested the rent schedules", ref: ACT, kind: "request" }], truncated: false }] }, ...o });
export const EVENT = (id) => ({ ok: true, found: true, event: { event_id: id, kind: "vote", attestations: [{ attestation_id: 1, capture_sha: SHA, extent: { kind: "pdf-page", page: 6 }, grade: "B" }],
  participants: [{ participant_id: 1, entity_id: ORG, role: "decider", superseded: false }] } });
const fact = (id, o = {}) => ({ ok: true, fact_id: id, amount: "4200000.00", as_read: "4,200,000", currency: "USD", sign: "+", precision: "exact", kind: "transfer", phase: "adopted", basis: "budgetary",
  period: { from: "2021-07-01", to: "2022-06-30", precision: "day", zone: "UTC", fiscal: "FY2021-22" }, from: { fund: "ENT-2026-0500", as_written: "Sewer Fund 3100" }, to: { fund: "ENT-2026-0501", as_written: "General Fund 1010" },
  codes: [], concerns: [], source: { capture_sha: SHA, extent: { kind: "pdf-page", page: 87 } }, citation: "page 88", method: "typed", grade: { reading: "B", reading_basis: "direct capture", parties: {} },
  by: "member:ana", at: "2026-10-01T09:00:00Z", withdrawn: null, question: null, ...o });
export const FACTS = { [M1]: fact(M1), [M2]: fact(M2, { amount: "4750000.00", phase: "actual", stage: "paid", period: { from: "2021-07-01", to: "2022-06-30", fiscal: "FY2021-22" } }),
  [M3]: fact(M3, { amount: "310000.00", kind: "allocation", phase: "actual", stage: "paid", to: null }) };
export const TRAIL = (o = {}) => ({ ok: true, found: true, set: { set_id: MSR, purpose: "trail", label: "Stormwater fund transfers, FY2023", concerns: P, by: "member:ana", at: "2026-10-01T09:00:00Z" },
  inclusions: [{ fact_id: M1, reason: "the transfer we ask about", by: "member:ana", at: "x", history: [], trail: { from: { stated: true, party: {} }, to: { stated: true, party: {} }, moved: { state: "did_not_move", phase: "adopted" }, gaps: [] } },
    { fact_id: M2, reason: "paid", by: "member:ana", at: "x", history: [], trail: { from: { stated: true }, to: { stated: true }, moved: { state: "dated", when: { value: "2022-06-30", precision: "day" }, event: "EVT-2026-0040" }, gaps: [] } }],
  exclusions: [{ fact_id: M3, reason: "a different transfer", by: "member:ana", at: "x", history: [] }], proposals: [], ...o });
export const CALCULATION = (o = {}) => ({ ok: true, found: true, calc_id: CALC, project: P, question: "Reports closed within seven days, FY2025", kind: "count",
  period: { from: "2024-07-01", to: "2025-06-30" }, inputs: [{ name: "orders", kind: "table", sha: SHA }, { name: "sample", kind: "draw", sha: DRAW }],
  results: { output: { value: "812", sign: "+", precision: "exact" }, steps: {}, undetermined_rows: 0, counted_apart: [], says: word("calculations.says.value_counted") },
  method_version: "bio-calc/1", method_note: "count(rows where closed − reported ≤ 7 days)", recompute_status: "agrees", accepted_by: null,
  grade: { inputs: [{ name: "orders", kind: "table", ref: SHA, grade: "B", why: "captured from the city" }], capture: { grade: "B", why: "the weakest input capture, B" }, method: { note: "count" } },
  calculation: { recipe: { method: "bio-calc/1" } }, ...o });
export const SPOT = (o = {}) => ({ ok: true, found: true, draw: { draw: DRAW, set: SHA, set_kind: "table", set_size: 812, n: 3, seed: "2026-10-05-7f31", method: "bio-draw/1", reproduced: true },
  question: "Was the pothole repaired?", items: [{ item: "17", standing: "yes", visits: [{ visit: 1, item: "17", finding: "yes", testimony: SHA2, exhibits: [], visitor: "member:mai", observed_at: "2026-10-06", grade: "D" }] },
    { item: "4", standing: "disagree", visits: [{ visit: 2, item: "4", finding: "yes", testimony: SHA2, visitor: "member:mai", observed_at: "2026-10-06", grade: "D" }, { visit: 3, item: "4", finding: "no", testimony: SHA2, visitor: "member:dev", observed_at: "2026-10-07", grade: "D" }] },
    { item: "9", standing: "not_visited", visits: [] }],
  counts: { yes: 1, no: 0, could_not_tell: 0, disagree: 1, not_visited: 1, judged: 1 }, estimates: [{ calc_id: "CALC-2026-0002", recompute_status: "stale" }], says: "", ...o });
export const ESTIMATE = CALCULATION({ calc_id: "CALC-2026-0002", kind: "estimate", results: { output: { value: "0.81" }, interval: { low: 526, high: 747, low_share: 0.65, high_share: 0.92, confidence: 0.95, frame_size: 812, sample_size: 37, successes: 30 } } });
export const ENTITY = { ok: true, found: true, entity: { entity_id: PROC, kind: "proceeding", label: "the lease rent case", note: "From the court's caption", proceeding: { forum: "ENT-2026-0101", forum_kind: "court", number: "RG26-114502", kind: "civil" } } };
export const PARTIES = { ok: true, proceeding: PROC, parties: [{ party: "ENT-2026-0102", role: "petitioner", line: { line_id: "LIN-2", citation: { captureSha: SHA } } }, { party: "ENT-2026-0103", role: "respondent", line: { line_id: "LIN-3" } }], truncated: false };
export const DUTIES = { ok: true, duties: [{ duty_id: "DUT-1", modality: "duty", obligor: "ENT-2026-0103", performance: { act: "produce the 2024 rent schedules" }, source: { kind: "court" }, arising_in: PROC, time: { basis: "window", date: "2026-10-30" }, adoption: { clause: "Order ¶3" }, withdrawn: null, in_force: { state: "in_force" } }] };
export const FOLLOWS = { ok: true, as_of: "2026-10-14T00:00:00Z", items: [{ follow: 3, kind: "register", subject: { kind: "register", address: "https://court.example/register/RG26", proceeding: PROC }, last_read: "2026-10-01T06:00:00Z", gated: { kind: "account" } },
  { follow: 4, kind: "register", subject: { kind: "register", address: "https://court.example/register/OTHER", proceeding: "ENT-2026-0999" }, last_read: "2026-10-02T06:00:00Z" }] };
export const ACTION = { ok: true, id: ACT, kind: "records_request", counterparty: { role: "City Clerk", body: "City Council" },
  clock: [{ text: "pra_10day", description: "The City Clerk's reply", date: "2026-10-14", basis: "Gov. Code §7922.535(a)", status: "pending" }], clock_next: "2026-10-14" };
export const PROPOSALS = { ok: true, action: ACT, proposals: [{ key: "pra_10day@member:mai", rule: "pra_10day", date: "2026-10-14", undetermined: null, basis: "Gov. Code §7922.535(a) (profile basis: the 10-day window)",
  entry: {}, trace: { anchor_day: "2026-10-02", amount: 10, units: "days", count: "calendar", skipped: [{ day: "2026-10-12", why: "Indigenous Peoples' Day (office calendar)" }], zone: "America/Los_Angeles",
    calendar: { entries: [{ day: "2026-10-12", basis: "the team's profile" }] } }, label: { by: "member:mai", state: "proposed", machine_work: false }, proposed_by: "member:mai" }], limit: 500, truncated: false };
/** `proceedingdates`' answer (following R30): the proceeding's own lane (a hearing, a filing deadline the body set) and the group's. */
export const DATES = (o = {}) => ({ ok: true, proceeding: PROC, from: null, to: null, lanes: {
  proceeding: { items: [{ event: "EVT-2026-0050", kind: "hearing", status: "EventScheduled", label: "Hearing on the motion", when: { value: "2026-11-04", precision: "day" }, captures: [SHA] },
    { event: "EVT-2026-0051", kind: "filing", status: "EventScheduled", label: "The body's own answer due", when: { value: "2026-10-20", precision: "day" }, captures: [] }], limit: 500, truncated: false, status: { stage: "motions", label: "Motions pending" } },
  group: { items: [{ action: ACT, entry: 0, date: "2026-10-14", basis: "Gov. Code §7922.535(a)", text: "The City Clerk's reply", zone: "America/Los_Angeles" }], limit: 500, truncated: false } }, note: "kept apart", ...o });
export const STANDARD = { ok: true, id: STD, cite: "Administrative Instruction 9.1, §2", kind: "policy", issuer: "Public Works", reason: "The Director shall repair each reported pothole within seven calendar days of the report.",
  text: ["CNT-2026-0001"], texts: [{ content_id: "CNT-2026-0001", standing: "current", newer: null }], period: { from: "2023-01-01", to: null } };
export const RELATIONS = { ok: true, standard: STD, temporal: [], referential: [{ id: "lrel-1", type: "implements", from: { standard: STD }, to: { standard: "STD-2026-0001-ordinance" }, reason: "The instruction implements the repair ordinance.", direction: "out", withdrawn: null }], truncated: false };
export const STD_PROPOSALS = (q = {}) => {
  const all = [{ id: "STDP-2026-0001", cite: "90% of potholes filled within 72 hours", kind: "policy", issuer: "Public Works", why: "the department's own goal", label: { by: "class:legal_lookup", state: "machine_proposed", machine_work: true, says: "Proposed by the assistant: machine work" },
      proposed_by: "class:legal_lookup", proposed_at: "2026-10-05T09:00:00Z", has_text: true, adoption: null },
    { id: "STDP-2026-0002", cite: "Repair crews log each pothole", kind: "policy", issuer: "Public Works", why: "a member's suggestion", label: { by: "member:mai", state: "member_proposed", machine_work: false, says: "Proposed by mai" },
      proposed_by: "member:mai", proposed_at: "2026-10-04T09:00:00Z", has_text: false, adoption: { standard: STD, by: "member:dev", at: "2026-10-06T09:00:00Z" } }];
  const state = q.state || "open";
  return { ok: true, project: q.project, state, items: all.filter((x) => state === "all" || (state === "open") === !x.adoption), truncated: false };
};
export const TIES = { ok: true, member: "mai", count: 2, truncated: false, ties: [{ tie_id: "MTI-2026-0001", member: "mai", entity: "ENT-2026-0700", kind: "employer", note: "East Bay Transit", attribution: "group", at: "x", withdrawn: null },
  { tie_id: "MTI-2026-0002", member: "mai", entity: "ENT-2026-0701", kind: "relative", note: "a cousin on the Planning Commission staff", attribution: "name", at: "x", withdrawn: null }] };

export const MATTER = (o = {}) => ({ ok: true, progression_key: "pra", entity_id: ORG, found: true, defined: true, definition_version: 2, label: "A public records request", entity: { entity_id: ORG, kind: "body", label: "Public Works Department" },
  grade: null, grade_determined: false, established: false, stage_count: 2, placed_count: 1, chain: [], thread_version: 1,
  threads: [{ version: 1, threaded_by: "member:mai", at: "2026-09-22T09:00:00Z", placements: [{ stage_key: "sent", capture_sha: SHA, bundle_id: "INFO-2026-0001", grade: "B" }] }],
  stages: [{ stage_key: "sent", label: "Request sent", required: "always", present: true, document_count: 1, grade: "B", discharged: false, documents: [{ stage_key: "sent", capture_sha: SHA, bundle_id: "INFO-2026-0001", grade: "B", own_date: { value: "2026-09-22", precision: "day" }, own_date_why: null }] },
    { stage_key: "determination", label: "Determination", required: "unless_exception", present: false, document_count: 0, grade: null, discharged: false, documents: [] }],
  findings: [{ kind: "missing_predecessor", stage_key: "determination", stage_label: "Determination", definition_version: 2, says: { key: "progression.expects", vars: { interval: "10 days", n: "1", date: "2026-10-02" } }, disposition: null }], finding_count: 1, ...o });
export const DEF = (o = {}) => ({ ok: true, progression_key: "pra", found: true, label: "A public records request", declared_by: "member:ana", at: "2026-09-30T09:00:00Z", version: 2, current: true, current_version: 2,
  basis: { statement: "the agency determines within 10 days", citation: "Gov. Code §7922.535", stated: true }, version_count: 2,
  versions: [{ version: 1, declared_by: "member:ana", at: "2026-09-24T09:00:00Z", basis: { statement: "first", citation: null } }, { version: 2, declared_by: "member:ana", at: "2026-09-30T09:00:00Z", basis: { statement: "the agency determines within 10 days", citation: "Gov. Code §7922.535" } }],
  stages: [{ stage_key: "sent", stage_no: 1, label: "Request sent", after_stage: null, cardinality: "1", within_interval: null, required: "always" }, { stage_key: "determination", stage_no: 2, label: "Determination", after_stage: "sent", cardinality: "0..1", within_interval: "10 days", required: "unless_exception" }], ...o });
export const THEME = (o = {}) => ({ ok: true, theme_id: "THEME-2026-0001", name: "Deferred maintenance", test: "A document that shows repairs put off", at: "2026-10-01T09:00:00Z", declared_by_handle: "mai", evidence: false,
  members: [{ target: "INFO-2026-0001", target_kind: "document", state: "member", placed_by_handle: "dev", placed_at: "2026-10-02T09:00:00Z", note: "the roof repair", proposed_by_handle: null }],
  hunches: [{ target: "INFO-2026-0002", target_kind: "document", state: "hunch", proposed_by_handle: "dev", proposed_at: "2026-10-03T09:00:00Z", proposal_note: "maybe" }],
  withdrawn: [{ target: "INFO-2026-0003", target_kind: "document", state: "withdrawn", ended_by_handle: "mai", ended_at: "2026-10-04T09:00:00Z", reason: "wrong year" }], ...o });

/** The plane every screen reads from, keyed by op. */
export function plane(o = {}) {
  return {
    peopledirectory: ok(DIRECTORY()),
    person: ok(PERSON()),
    samepersoncandidates: ok({ ok: true, entity_id: ENT, count: 1, candidates: [{ entity_id: "ENT-2026-0019", fields: { names: { state: "agrees" }, identifiers: { state: "absent" }, posts: { state: "differs" }, life: { state: "absent" } } }], truncated: false }),
    affordances: ok(VOCAB),
    explorepreset: (r) => ok(r.body && r.body.preset === "presets" ? [{ name: "chain", words: "organisation chains", kinds: [] }, { name: "flowsFrom", words: "money trails", kinds: [] }] : { preset: r.body.preset, ...WALK() }),
    explore: ok(WALK()),
    image: (r) => ok(r.query.id === P ? { "bundle.md": PROJECT_MD } : null),
    list: ok({ bundles: [{ bundle_id: "INQ-2026-0001-seven-days", title: "Is the city repairing reported potholes within seven days?" }] }),
    timeline: ok(TIMELINE()),
    event: (r) => ok(EVENT(r.query.id)),
    moneyset: ok(TRAIL()),
    money: (r) => ok(FACTS[r.query.id] || { ok: false, reason: "NO_SUCH_FACT" }),
    calculation: (r) => ok(r.query.id === "CALC-2026-0002" ? ESTIMATE : CALCULATION()),
    spotcheck: ok(SPOT()),
    entity: (r) => ok(r.query.id === PROC ? ENTITY : PERSON_ENTITY),
    partiesof: ok(PARTIES),
    follows: ok(FOLLOWS),
    proceedingdates: ok(DATES()),
    dutiesof: ok(DUTIES),
    action: ok(ACTION),
    clockproposals: ok(PROPOSALS),
    standard: ok(STANDARD),
    lawrelations: ok(RELATIONS),
    proposals: ok({ ok: true, proposals: [] }),
    exploregraph: ok(GRAPH()),
    standardproposals: (r) => ok(STD_PROPOSALS(r.query)),
    standards: ok({ ok: true, items: [{ id: "STD-2026-0001-ordinance", cite: "Municipal Code §12.04" }, { id: STD, cite: "Administrative Instruction 9.1, §2" }], truncated: false }),
    sequence: ok({ ok: true, answer: "undetermined", why: { key: "events.why.precision_held_settle", vars: {} } }),
    memberties: ok(TIES),
    heldcaptures: ok(HELD),
    entitieskind: (r) => ok(r.query.kind === "body" ? { ok: true, kind: "body", entities: [{ entity_id: COURT, kind: "body", label: "Alameda Housing Tribunal", forum_kind: "court" }], count: 1, truncated: false } : { ok: true, kind: "institution", entities: [], count: 0, truncated: false }),
    readingname: ok({ ok: true, entity_id: ENT, documents: [{ capture_sha: SHA, bundle_id: "INFO-2026-0001", ref: "L. Chen", label: "L. Chen", matched_alias: "L. Chen", page: 2 }], truncated: false }),
    instances: ok({ ok: true, count: 1, items: [{ progression_key: "pra", label: "A public records request", definition_version: 2, entity_id: ORG, thread_version: 1, stage_count: 4, placed_count: 1, grade: null, grade_determined: false, established: false, finding_count: 1, open_finding_count: 1, next_deadline: "2026-10-02" }], truncated: false }),
    instance: ok(MATTER()),
    progression: ok(DEF()),
    themeread: (r) => ok(r.query.id ? THEME() : { ok: true, q: null, limit: 200, truncated: false, evidence: false, themes: [{ theme_id: "THEME-2026-0001", name: "Deferred maintenance", test: "A document that shows repairs put off", at: "2026-10-01T09:00:00Z", declared_by_handle: "mai" }] }),
    clocksics: ok({ ok: true, filename: "deadlines.ics", content_type: "text/calendar; charset=utf-8", ics: "BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n", events: 1, left_out: { undated: 0 } }),
    ...(o.plane || {}),
  };
}

/** The served page at `path` with this module's screens, over the plane. */
export async function open(path, o = {}) {
  const p = await boot({ screens: SCREENS, plane: plane(o), path, ...(o.boot || {}) });
  await p.settle();
  await p.settle();
  return p;
}

export const main = (p) => p.doc.getElementById("cs-main");
export const actsIn = (el) => [...new Set(el.querySelectorAll("button[data-act]").map((b) => b.getAttribute("data-act")))];
export const button = (p, op, within) => (within || p.root()).querySelector(`button[data-act="${op}"]`);
export function fill(p, values) {
  for (const [id, v] of Object.entries(values)) {
    const el = p.doc.getElementById(id);
    if (!el) throw new Error(`no field ${id}`);
    if (typeof v === "boolean") el.checked = v; else el.value = v;
  }
}
/** Press an act; a reasoned act's own reason field (when the shell asks one) answered with `reason`, a dialog's fields
 *  filled with `fields` and confirmed. */
export async function press(p, op, { reason, within, fields, el } = {}) {
  const b = el || button(p, op, within);
  if (!b) throw new Error(`no act ${op}`);
  await p.click(b);
  const slot = p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`);
  const ta = slot && slot.querySelector('textarea[id^="cs-reason-"]');
  if (ta && reason !== undefined) { ta.value = reason; await p.click(slot.querySelector('[data-shell="reason-send"]')); }
  const dlg = slot && slot.querySelector('[data-shell="confirm"]');
  if (dlg && fields) {
    slot.querySelectorAll("textarea").forEach((t, i) => { t.value = fields[i] === undefined ? "" : fields[i]; });
    await p.click(dlg);
  }
  await p.settle();
  await p.settle();
  return slot;
}
/** Every text node drawn that reads as a word key: a key the page holds no word for is drawn as itself. */
export const rawKeys = (root) => textNodes(root).map((t) => String(t.data).trim()).filter((t) => /^[a-z][\w-]*(\.[\w-]+){2,}$/.test(t));
export { ok, textNodes };

/** The address each screen is opened at. */
export const PATHS = { people: "/app/people", person: "/app/person/" + ENT, theme: "/app/theme", explore: "/app/explore/" + ENT, timeline: "/app/timeline/" + P,
  money: "/app/money/" + MSR, calculation: "/app/calculation/" + CALC, help: "/app/help", proceeding: "/app/proceeding/" + PROC,
  "due-date": "/app/due-date/" + ACT, standard: "/app/standard/" + STD, ties: "/app/ties" };

/** Further addresses: one theme, one matter and one progression (screens-investigate R31, R33). */
export const MORE_PATHS = { themeOne: "/app/theme/THEME-2026-0001", matter: "/app/timeline/" + P + "/matter/pra/" + ORG, progression: "/app/timeline/" + P + "/progression/pra" };
