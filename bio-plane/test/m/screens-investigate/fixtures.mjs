/* screens-investigate's tests: the scripted plane behind each screen, over interface-shell's served page (its tests'
 * harness, `harness.mjs`, and document stand-in, `dom.mjs`). Each fixture answers its screen's reads in their owners'
 * shapes as surveyed on `tranche/T47` (J1); a test overrides any op. */
import { SCREENS } from "../../../src/screens-investigate/index.mjs";
import { boot, ok, textNodes } from "../interface-shell/harness.mjs";

export { SCREENS };
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

export const PROJECT_MD = ["---", `id: ${P}`, "object_type: project", "title: \"Pothole repairs\"", "references:",
  `  - target: ${ENT}`, "    rel: cites", "    status: active", "  - target: INQ-2026-0001-seven-days", "    rel: cites", "    status: active", "---", ""].join("\n");

export const PERSON = (o = {}) => ({ ok: true, found: true, entity_id: ENT, at: "2026-10-14",
  cluster: { state: "linked", members: [ENT, "ENT-2026-0019"], truncated: false },
  names: [{ member: ENT, name: "L. Chen", from: "registry" }],
  facts: [{ fact_id: "PFA-2026-0007", member: ENT, kind: "locality", value: "Oakview district", valid: { from: "2022-03-01", to: null, precision: "day", zone: "UTC" },
    question: null, citation: { captureSha: SHA, extent: { kind: "pdf-page", page: 2 } }, grade: "B", by: "member:mai", at: "2026-10-02T09:00:00Z", withdrawn: null }],
  posts: [{ member: ENT, line_id: "LIN-2026-0040", kind: "holds", from: ENT, to: ORG, capacity: "employee", title: "Director of Public Works",
    valid: { from: "2022-03-01", to: null, precision: "day", zone: "UTC" }, grade: { assertion: "B", ends: ["B", "B"] }, citation: { captureSha: SHA, extent: { kind: "pdf-page", page: 0 } } }],
  duties: [], undetermined: [], truncated: {}, limit: 500, ...o });
export const DIRECTORY = (o = {}) => ({ ok: true, following: 3, in_your_projects: 1, limit: 50, truncated: false, cursor: null,
  rows: [{ entity: ENT, kind: "person", name: "L. Chen", today: { posts: [{ line_id: "LIN-1", title: "Director of Public Works", capacity: "employee", office: { entity: "ENT-9", label: "Director" }, body: { entity: ORG, label: "Public Works Department" } }] },
    documents: 14, questions: 2, projects: 1, newest_added: "2026-10-02T09:00:00Z", mine: true },
  { entity: ORG, kind: "body", name: "Public Works Department", today: { kind: "body", sector: "government", note: "A city department · repairs streets and sewers" },
    documents: 11, questions: 0, projects: 0, newest_added: "2026-09-28T09:00:00Z", mine: false }], ...o });
export const WALK = (o = {}) => ({ ok: true, from: ENT, at: { value: "2026-10-14", precision: "day", zone: "UTC" }, kinds: [], order: { by: "fewest steps first" },
  paths: [{ hops: [{ id: "lines:holds:1", from: ENT, to: ORG, kind: "line:holds:employee", owner: "lines", valid: {}, evidence: [{ source: "capture:" + SHA, extent: { kind: "pdf-page", page: 1 } }], grade: { assertion: "B", ends: ["B", "B"] }, derived: null },
    { id: "co:5", from: ORG, to: "ENT-2026-0200", kind: "mentioned_together", owner: "connections", valid: {}, evidence: [], grade: { assertion: "C", ends: ["C", "C"] }, derived: { method: "co-mention@1", inputs: [ORG, "ENT-2026-0200"], as_of: "2026-10-14" } }],
    grade: { assertion: "C", end: "C" }, label: "evidenced", marks: [{ hop: "co:5", mark: "derived" }], at_date: "in" },
  { hops: [{ id: "entities:proxy_for:2", from: ENT, to: "ENT-2026-0300", kind: "proxy_for", owner: "entities", valid: {}, evidence: [], grade: { assertion: "D", ends: ["D", "D"] }, derived: null, label: "declared, not evidenced" }],
    grade: { assertion: "D", end: "D" }, label: "lead", lead: { hops: ["entities:proxy_for:2"], sentence: "a lead" }, marks: [{ hop: "entities:proxy_for:2", mark: "declared, not evidenced" }], at_date: "in" }],
  hubs: [], fanout_truncated: [], owner_refusals: [], visited: 5, depth: 8, budget_ms: 10000, elapsed_ms: 4, owner_calls: 3, complete: true, note: "", ...o });
export const VOCAB = { vocabularies: { connection_kinds: { values: ["line:holds:employee", "money_flow", "mentioned_together", "proxy_for"],
  words: { "line:holds:employee": { word: "held the post (employee)" }, money_flow: { word: "money" }, mentioned_together: { word: "mentioned together" }, proxy_for: { word: "proxy for" } } } } };
export const TIMELINE = (o = {}) => ({ ok: true, set: [ENT],
  world: { label: "what they did", items: [
    { event_id: "EVT-2026-0001", kind: "vote", status: "EventScheduled", when: { start: "2024-01-12T08:00:00Z", end: "2024-01-13T08:00:00Z", precision: "day", zone: "UTC", value: "2024-01-12" }, roles: [], concerns: true, of: [ENT], order: { undetermined: false } },
    { event_id: "EVT-2026-0002", kind: "decision", status: "EventScheduled", when: { start: null, end: null, precision: "edtf", zone: "UTC", value: "2024-03" }, roles: [], concerns: true, of: [ENT], order: { undetermined: true, with: ["EVT-2026-0003"], band: {} } }],
    placed_nowhere: [{ event_id: "EVT-2026-0009", kind: "statement", status: "EventScheduled", when: null, roles: [], concerns: false, of: [ENT] }], limit: 100, truncated: false },
  ours: { label: "what we did", sources: [{ source: "actions", items: [{ at: "2026-09-04", label: "We requested the rent schedules", ref: ACT, kind: "request" }], truncated: false }] }, ...o });
export const EVENT = (id) => ({ ok: true, found: true, event: { event_id: id, kind: "vote", attestations: [{ attestation_id: 1, capture_sha: SHA, extent: { kind: "pdf-page", page: 6 }, grade: "B" }],
  participants: [{ participant_id: 1, entity_id: ORG, role: "decider", superseded: false }] } });
const fact = (id, o = {}) => ({ ok: true, fact_id: id, amount: "4200000.00", as_read: "4,200,000", currency: "USD", sign: "+", precision: "exact", kind: "transfer", phase: "adopted", basis: "budgetary",
  period: { from: "2021-07-01", to: "2022-06-30", precision: "day", zone: "UTC", fiscal: "FY2021-22" }, from: { fund: "ENT-2026-0500", as_written: "Sewer Fund 3100" }, to: { fund: "ENT-2026-0501", as_written: "General Fund 1010" },
  codes: [], concerns: [], source: { capture_sha: SHA, extent: { kind: "pdf-page", page: 87 } }, citation: "page 88", method: "typed", grade: { reading: "B", reading_basis: "direct capture", parties: {} },
  by: "member:ana", at: "2026-10-01T09:00:00Z", withdrawn: null, question: null, ...o });
export const FACTS = { [M1]: fact(M1), [M2]: fact(M2, { amount: "4750000.00", phase: "actual", stage: "paid", period: { from: "2021-07-01", to: "2022-06-30", fiscal: "FY2021-22" } }),
  [M3]: fact(M3, { amount: "310000.00", kind: "allocation", phase: "actual", stage: "paid", to: null }) };
export const TRAIL = (o = {}) => ({ ok: true, found: true, set: { set_id: MSR, purpose: "trail", label: "Sewer fund transfers, FY2022", concerns: P, by: "member:ana", at: "2026-10-01T09:00:00Z" },
  inclusions: [{ fact_id: M1, reason: "the transfer we ask about", by: "member:ana", at: "x", history: [], trail: { from: { stated: true, party: {} }, to: { stated: true, party: {} }, moved: { state: "did_not_move", phase: "adopted" }, gaps: [] } },
    { fact_id: M2, reason: "paid", by: "member:ana", at: "x", history: [], trail: { from: { stated: true }, to: { stated: true }, moved: { state: "dated", when: { value: "2022-06-30", precision: "day" }, event: "EVT-2026-0040" }, gaps: [] } }],
  exclusions: [{ fact_id: M3, reason: "a different transfer", by: "member:ana", at: "x", history: [] }], proposals: [], ...o });
export const CALCULATION = (o = {}) => ({ ok: true, found: true, calc_id: CALC, project: P, question: "Reports closed within seven days, FY2025", kind: "count",
  period: { from: "2024-07-01", to: "2025-06-30" }, inputs: [{ name: "orders", kind: "table", sha: SHA }, { name: "sample", kind: "draw", sha: DRAW }],
  results: { output: { value: "812", sign: "+", precision: "exact" }, steps: {}, undetermined_rows: 0, counted_apart: [], says: "every value was counted" },
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
export const FOLLOWS = { ok: true, as_of: "2026-10-14T00:00:00Z", items: [{ follow: 3, kind: "register", subject: { kind: "register", address: "https://court.example/register/RG26" }, last_read: "2026-10-01T06:00:00Z", gated: { kind: "account" } }] };
export const ACTION = { ok: true, id: ACT, kind: "records_request", counterparty: { role: "City Clerk", body: "City Council" },
  clock: [{ text: "pra_10day", description: "The City Clerk's reply", date: "2026-10-14", basis: "Gov. Code §7922.535(a)", status: "pending" }], clock_next: "2026-10-14" };
export const PROPOSALS = { ok: true, action: ACT, proposals: [{ key: "pra_10day@member:mai", rule: "pra_10day", date: "2026-10-14", undetermined: null, basis: "Gov. Code §7922.535(a) (profile basis: the 10-day window)",
  entry: {}, trace: { anchor_day: "2026-10-02", amount: 10, units: "days", count: "calendar", skipped: [{ day: "2026-10-12", why: "Indigenous Peoples' Day (office calendar)" }], zone: "America/Los_Angeles",
    calendar: { entries: [{ day: "2026-10-12", basis: "the group's profile" }] } }, label: { by: "member:mai", state: "proposed", machine_work: false }, proposed_by: "member:mai" }], limit: 500, truncated: false };
export const STANDARD = { ok: true, id: STD, cite: "Administrative Instruction 4.12, §3", kind: "policy", issuer: "Public Works", reason: "The Director shall repair each reported pothole within seven calendar days of the report.",
  text: ["CNT-2026-0001"], texts: [{ content_id: "CNT-2026-0001", standing: "current", newer: null }], period: { from: "2023-01-01", to: null } };
export const RELATIONS = { ok: true, standard: STD, temporal: [], referential: [{ id: "lrel-1", type: "implements", from: { standard: STD }, to: { standard: "STD-2026-0001-ordinance" }, reason: "The instruction implements the repair ordinance.", direction: "out", withdrawn: null }], truncated: false };
export const TIES = { ok: true, member: "mai", count: 2, truncated: false, ties: [{ tie_id: "MTI-2026-0001", member: "mai", entity: "ENT-2026-0700", kind: "employer", note: "East Bay Transit", attribution: "group", at: "x", withdrawn: null },
  { tie_id: "MTI-2026-0002", member: "mai", entity: "ENT-2026-0701", kind: "relative", note: "a cousin on the Planning Commission staff", attribution: "name", at: "x", withdrawn: null }] };

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
    entity: ok(ENTITY),
    partiesof: ok(PARTIES),
    follows: ok(FOLLOWS),
    dutiesof: ok(DUTIES),
    action: ok(ACTION),
    clockproposals: ok(PROPOSALS),
    standard: ok(STANDARD),
    lawrelations: ok(RELATIONS),
    proposals: ok({ ok: true, proposals: [] }),
    memberties: ok(TIES),
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
