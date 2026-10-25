/* screens-action's tests' helper over interface-shell's harness (B7, K3007): the real page `interfacePage(SCREENS)`
   serves, run over the shell's document stand-in with a scripted plane, so every screen is drawn by the shell's own kit
   and every act runs through its friction, gate, refusals and re-reads. The fixtures are each op's answer as its owner
   documents it (action-plans, filings, actions, action-holds, conformance, consequences, escalation, instance-setup). */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SCREENS } from "../../../src/screens-action/index.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { wordsOf, interfacePage } from "../../../src/interface-shell/index.mjs";
import { boot, ok, refused, refusedIn, settle, textNodes, MEMBER, ADMIN } from "../interface-shell/harness.mjs";

export { SCREENS, ok, refused, refusedIn, settle, textNodes, MEMBER, ADMIN, word, hasWord };
/** A word read through `setup-words` as a drawn text node holds it (whitespace collapsed): the tests assert keys, never a sentence's text (R19). */
/** The word as the page carries it for a key (the shell's own rows win over the list's until it reads `word` itself, `interface-shell` R70). */
export const PAGE = (key) => String(new Map(wordsOf(SCREENS)).get(key)).replace(/\s+/g, " ").trim();
/** A date as the kit draws it, by `date.daymonthyear` and `date.month.*` (interface-shell R6): `D("2026-10-02")`. */
export const D = (iso) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const month = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"][m - 1];
  return word("date.daymonthyear", { day: String(d), month: word("date.month." + month), year: String(y) }).replace(/\s+/g, " ").trim();
};
export const W = (key, vars) => String(word(key, vars)).replace(/\s+/g, " ").trim();
/** What `escalation` says of the compliance exit when no compliant determination is live: its word, never a copy of it. */
export const COMPLIANCE_SAYS = W("escalation.live_compliant_determination");
/* R14: the classes a served stylesheet defines: the visual language's `civicsmith.css`, the design page's product rules (what
   interface-assets R7 serves as `shell.css`) and the shell's own `<style>` in the page. */
const DOCS = join(dirname(fileURLToPath(import.meta.url)), "../../../../docs/development/ux-substrate");
export function servedClasses() {
  const css = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{[^{}]*\}/g, "{}").replace(/"[^"]*"/g, '""');
  const page = readFileSync(join(DOCS, "screens/page.src.html"), "utf8");
  const parts = [readFileSync(join(DOCS, "visual-language/civicsmith.css"), "utf8"), ...[...page.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]),
    ...[...interfacePage(SCREENS).matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1])];
  return new Set(parts.flatMap((t) => [...css(t).matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1])));
}
export const screen = (id) => SCREENS.find((s) => s.id === id);
/** A change to a choice that drives its screen (`cs.choice` with `acts`): the select takes the value and the page redraws. */
export async function choose(p, id, value) {
  const el = p.doc.getElementById(id);
  if (!el) throw new Error(`no choice ${id}`);
  el.value = value;
  p.fire(el, "change");
  await settle();
}
/** The member who may read and not act: no capability. */
export const READER = { ...MEMBER, capabilities: [] };

export const open = (path, plane = {}, o = {}) => boot({ screens: SCREENS, plane, path, ...o });
/** The path's steps, as the kit draws them (a link or span per earlier step, the current page last). */
export const crumbs = (p) => main(p).querySelector("nav.cs-crumbs").children.filter((e) => e.localName !== "i").map((e) => e.textContent.trim());
export const main = (p) => p.doc.getElementById("cs-main");
export const text = (p, el = main(p)) => (el ? el.textContent : "").replace(/\s+/g, " ").trim();
export const acts = (p) => main(p).querySelectorAll("button[data-act]").map((b) => [b.getAttribute("data-act"), b.dataset]);
export const ops = (p) => acts(p).map(([op]) => op);
export const button = (p, op, nth = 0) => main(p).querySelectorAll(`button[data-act="${op}"]`)[nth] || null;
export function fill(p, values) {
  for (const [id, v] of Object.entries(values)) {
    const el = p.doc.getElementById(id);
    if (!el) throw new Error(`no field ${id}`);
    if (el.type === "checkbox" || el.type === "radio") el.checked = !!v; else el.value = v;
  }
}
/** Presses `op`'s `nth` button; a reasoned act's reason field is answered with `reason`, a dialog confirmed by `confirm`. */
export async function press(p, op, { nth = 0, values = {}, reason, confirm = false } = {}) {
  fill(p, values);
  const b = typeof op === "string" ? button(p, op, nth) : op;
  if (!b) throw new Error(`no ${op} button`);
  await p.click(b);
  const ai = b.getAttribute("data-ai");
  if (reason !== undefined) {
    const ta = p.doc.getElementById("cs-reason-" + ai.replace(":", "-"));
    if (ta) { ta.value = reason; await p.click(p.root().querySelector(`[data-shell="reason-send"][data-for="${ai}"]`)); }
  }
  if (confirm) await p.click(p.root().querySelector(`[data-shell="confirm"][data-for="${ai}"]`));
  await settle();
  return b;
}
export const beside = (p, b) => text(p, p.root().querySelector(`[data-slot="${b.getAttribute("data-ai")}"]`));
export const last = (p, op) => p.byOp(op).at(-1);

/* R7 (interface-shell R5): a drawn text node is a word (filled), a piece of one between its placeholders, or the
   record's own data. */
export function wordChecker(data = []) {
  const pats = [], pieces = new Set();
  for (const [, en] of wordsOf(SCREENS)) {
    const parts = en.split(/\{\w+\}/);
    if (!parts.some((x) => x.trim())) continue;
    pats.push(new RegExp("^" + parts.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[\\s\\S]*") + "$"));
    for (const x of parts) if (x.trim()) pieces.add(x.trim());
  }
  const one = (t) => data.includes(t) || pieces.has(t) || pats.some((re) => re.test(t)) || [...pieces].some((x) => x.length > 3 && x.includes(t));
  // a text node may join a word or the record's data to its neighbour by the separator " · "
  return (t) => one(t) || t.split(/\s*·\s*/).filter((x) => x.trim()).every(one);
}

/* ---------- fixtures, each as its owner answers ---------- */
export const PLAN_ID = "PLN-2026-aaaaaaaaaaaaaaaa-plan";
export const PROJECT = "PROJ-2026-pppppppppppppppp";
export const ACTION_ID = "ACTN-2026-bbbbbbbbbbbbbbbb";
export const FILING = "FIL-2026-cccccccccccccccc";
export const DET = "CONF-2026-dddddddddddddddd-determination";
export const ESC = "ESC-2026-eeeeeeeeeeeeeeee-escalation";

export const QUESTION = "INQ-2026-ffffffffffffffff";
export const QUESTION_TITLE = "Is closed the same as repaired?";
export const PROJECT_QUESTIONS = { ok: true, project: PROJECT, items: [{ inquiry: QUESTION, title: QUESTION_TITLE },
  { inquiry: "INQ-2026-9999999999999999", title: "Who signed the closure memo?" }], cursor: null };
/** The act as `conformance` answers it (R25): the event's id, the office and the day; the kind of the event is on the one read's `event` alone. */
const ACT = { id: "EVT-2024-0001", event: "EVT-2024-0001", actor: { role: "City Administrator", body: "City" }, evidence: ["CON-1"], when: { value: "2024-03-01", precision: "day" } };
export const DETERMINATIONS = { ok: true, items: [{ id: DET, project: PROJECT, act: ACT,
  outcomes: [{ standard: "STD-1", outcome: "noncompliant" }, { standard: "STD-2", outcome: "compliant" }], live: true, superseded_by: null }], limit: 200, truncated: false, cursor: null };
export const PROJECTS = { bundles: [{ bundle_id: PROJECT, object_type: "project", title: "Pothole repairs" }], limit: 500, cursor: null, total: 1 };

export const PLAN = Object.freeze({
  id: PLAN_ID, project: PROJECT, title: "Repairs: closed is not repaired", state: "open", opened_by: "member:dev", opened_at: "2026-10-03T10:00:00Z",
  close_note_prompt: { key: "plan.close.lessons", en: "x" },
  subjects: [
    { subject: { kind: "inquiry", inquiry: "INQ-2026-ffffffffffffffff" }, key: "inquiry:INQ-2026-ffffffffffffffff", support: "hypothetical",
      why: "a suspected matter", liveness: { state: "live" } },
    { subject: { kind: "outcome", determination: DET, standard: "STD-1" }, key: `outcome:${DET}#STD-1`, support: "established", why: "determined",
      liveness: { state: "live" }, escalation: { id: ESC, state: "open", stage: 2, stage_name: "notification" } },
  ],
  offers: [{ subject: {}, key: `outcome:${DET}#STD-1`, offers: [{ kind: "chance_to_fix", summary: "x", category: "mitigation", key: "k", adopted: [] }] }],
  options: [
    { id: "opt-1", summary: "Records request: inspection logs", category: "other", subjects: ["inquiry:INQ-2026-ffffffffffffffff"], dates: [{ date: "2026-11-30", basis: "law" }],
      disposition: "chosen", dispositions: [{ disposition: "chosen", reason: "first, to see what closed means", author: "member:dev", at: "2026-10-04" }], action: null },
    { id: "opt-2", summary: "Story with a reporter", category: "awareness", subjects: [`outcome:${DET}#STD-1`], dates: [], disposition: "open", dispositions: [], action: null },
    { id: "opt-3", summary: "Complaint to the auditor", category: "legal", subjects: [`outcome:${DET}#STD-1`], dates: [{ date: "2026-12-20", basis: "law" }],
      disposition: "chosen", dispositions: [], action: { id: ACTION_ID, state: "awaiting_response", started_by: "member:mai", started_at: "2026-10-05" } },
  ],
  scenarios: [{ scenario: 1, version: 1, name: "Records first", set_aside: null, phases: [
    { id: "p1", name: "Phase 1", options: ["opt-1"], starts: "plan_start", checkpoint: { after_days: 10 }, checkpoint_due: "2026-10-20", judgement: null }] }],
  checks: [{ check: "no_hostile_branch", scenario: 1, says: "Scenario 1: no branch answers a hostile response to the records request." }],
});
export const PROPOSALS = { plan: PLAN_ID, run: "RUN-1", proposals: [{ id: `${PLAN_ID}/proposal/1`, plan: PLAN_ID, summary: "Ask the committee to agendize repair performance",
  why: "the committee oversees repairs", label: "machine work", adopted: false }], says: "x" };

export const PREVIEW = { plan: PLAN_ID, option: "opt-1", preview: true, would_start: true, says: "x",
  action: { kind: "records_request", addressee: { state: "named", kind: "office", role: "City Clerk", body: "Office of the City Clerk" },
    clock: [{ date: "2026-10-24", basis: "the records law's ten days", status: "pending" }],
    legs: [{ target: "INQ-2026-ffffffffffffffff", kind: "rests_on", subjects: [{ subject: { kind: "inquiry", inquiry: "INQ-2026-ffffffffffffffff" }, support: "hypothetical", why: "x" }] }],
    breach: false, premise_override: null } };

export const ACTION = Object.freeze({
  id: ACTION_ID, current_state: "awaiting_response", kind: "records_request", plan: PLAN_ID, option: "opt-3", confidential: false,
  project: PROJECT, title: "Inspection logs, 2025",
  addressee: { role: "City Clerk", body: "Office of the City Clerk", entity_id: "ENT-1", filled: true, holder_on_date: { holder: "Asha Rao", on: "2026-10-14" } },
  correspondence: [
    { ord: 1, direction: "sent", at: "2026-10-02", medium: "web form", party: "Office of the City Clerk", author: "member:mai" },
    { ord: 2, direction: "received", at: "2026-10-03", medium: "email", party: "Office of the City Clerk", author: "member:mai" },
  ],
  entries: [{ ord: 2 }],
  clock: [{ text: "Response due", description: "the records law", date: "2026-10-12", basis: "ten days from receipt", status: "pending" },
    { text: "Extension ends", description: "x", date: "2099-10-26", basis: "fourteen more days", status: "pending" }],
  reply_owed: { owed: true, history: [] },
  // `actions` R25: the laws a member stated, with who and when; the proposals and the risk tier, each apart from the member's value
  governing_laws: { state: "stated", laws: [{ level: "state", citation: "Gov. Code § 7922.535(b)" }], by: "member:mai", at: "2026-10-01T09:00:00Z", stated: "x" },
  governing_laws_proposals: { proposals: [{ by: "agent:claude", state: "machine_proposed", machine_work: true, says: "x", at: "2026-10-02T09:00:00Z",
    laws: [{ level: "city", citation: "Mun. Code § 2.20.230" }] }], limit: 12, truncated: false, says: "x" },
  risk_tier: 2, risk_tier_words: "x",
  risk_tier_history: { current: 2, intake: { tier: 1, by: null, stated: "x" }, stated: "x", revisions: [
    { ord: 0, readable: true, tier: 2, prior: 1, by: "member:mai", at: "2026-10-03T09:00:00Z", reason: "the office has fought requests before" }] },
  risk_tier_proposals: { proposals: [{ by: "agent:claude", state: "machine_proposed", machine_work: true, says: "x", tier: 3, tier_words: "x", basis: "x", at: "2026-10-04T09:00:00Z" },
    { by: "member:asha", state: "member_proposed", machine_work: false, says: "x", tier: 1, tier_words: "x", basis: "x", at: "2026-10-04T10:00:00Z" }], limit: 12, truncated: false, says: "x" },
});
/** `pressurefor` as action-holds R16 answers it: the action's marks, each with where it arrived. */
export const PRESSURE = { ok: true, items: [{ arrived: { action: ACTION_ID, ord: 2 }, project: PROJECT, kind: "legal", note: "a letter from the city's counsel", by: "member:mai", at: "2026-10-04T09:00:00Z" }],
  limit: 500, truncated: false, cursor: null };
/** `filingread` as filings R59 answers a prepared communication, as it was stored. */
export const READ = (o = {}) => ({ ok: true, id: FILING, filing: FILING, action: ACTION_ID, form: "communication", purpose: "request",
  text: "We request the logs for 2025.", blanks: [{ name: "period", value: "2025", source: "fills:member:mai", label: { kind: "member_fill", by: "member:mai", machine_work: false, says: "x" } },
    { name: "office", value: "City Clerk", source: ACTION_ID }], unfilled: [{ name: "cost_limit", why: W("filings.why.record_holds_value") }],
  fills: [], template: null, disclosure: { machine: false }, notices: [], label: "x", at: "2026-10-09T10:00:00Z", approval: null, second_approval: null, sending: null, ...o });
export const draft = (o = {}) => ({ filing: FILING, form: "communication", purpose: "request", label: "x", at: "2026-10-09T10:00:00Z",
  approval: null, second_approval: null, second_needed: false, signatories: [], voice: "group", sending: null, ...o });
/** `stakeatpreparation` as filings R62 answers it: the tier-1 case, a stake of the project's beside the team's. */
export const STAKE = (o = {}) => ({ ok: true, action: ACTION_ID, higher_stakes: false, governing_tier: 1, group_stake: "Some members rent from landlords the city licenses.",
  matter_stake: { stake: "Two members live in buildings on the city's list of slow repairs.", set_by: "dev", set_at: "2026-10-09T09:00:00Z", source: "project" },
  project: PROJECT, ...o });
export const FUTURE_ACTION = Object.freeze({ ...ACTION, clock: ACTION.clock.map((c) => ({ ...c, date: "2099-10-26" })) });
export const FILINGS = (drafts = []) => ({ action: ACTION_ID, drafts, drafts_truncated: false, packets: [], packets_truncated: false });
export const PROFILES = { profiles: [{ id: "p", name: "p", covers: [] }], conflicts: [], choices: [], stage_findings: [],
  view: { deadlines: [
    { rule: "records_response", applies_to: "records_request", units: "days", amount: 10, count: "calendar", citation: "Gov. Code § 7922.535(b)",
      extension: { days: 14, citation: "Gov. Code § 7922.535(c)" } },
    { rule: "immediate_disclosure", applies_to: "records_request", units: "days", amount: 3, count: "business", citation: "Mun. Code § 2.20.230" },
    { rule: "meeting_notice", applies_to: "comment", amount: 72, count: "calendar", citation: "Open meetings law" }],
  // `jurisdictions` R7, R96: the laws a records request can go under, each naming its own first-request window (`response`, a `deadlines` rule)
  records_laws: [
    { level: "state", name: "Testland Records Act", citation: "Gov. Code § 7922.535(b)", response: "records_response" },
    { level: "city", name: "Testville Sunshine Ordinance", citation: "Mun. Code § 2.20.230", response: "immediate_disclosure" }] } };

/** The test profile's `records_help` block (`jurisdictions` R93, R84: differing in every value from any first profile's). */
export const RECORDS_HELP = { law: "Testland Records Act", days: 7, extra_days: 9, status: "researched", basis: "TEST",
  extension_reasons: [{ reason: "the records are kept elsewhere", citation: "TRA § 4(a)" }, { reason: "a very large volume", citation: "TRA § 4(b)" }],
  portal: { name: "OpenDoor", url: "https://records.testville.example" },
  faster: { ordinance: "Testville Open Ordinance", window: "two business days", request: "quick request", citation: "TOO § 1" },
  citations: { answer: "TRA § 1", extend: "TRA § 2", assist: "TRA § 3", segregate: "TRA § 5", refuse_in_writing: "TRA § 6", electronic: "TRA § 7",
    cost: "TRA § 8", cost_electronic: "TRA § 9", inspect_photograph: "TRA § 10", purpose: "TRA § 11" } };
export const PROFILES_WITH_HELP = (help = RECORDS_HELP) => ({ ...PROFILES, view: { ...PROFILES.view, name: "Testville", records_help: help } });

export const DETERMINATION = { id: DET, project: PROJECT, act: ACT, event: { id: ACT.id, kind: "vote", status: "EventScheduled", when: ACT.when },
  findings: [{ finding: "INQ-1" }],
  outcomes: [{ standard: "STD-1", outcome: "noncompliant" }, { standard: "STD-2", outcome: "compliant" }],
  standards: [{ standard: "STD-1", outcome: "noncompliant", in_force: true, rows: [{ requires: "a council vote", did: "adjusted without a vote" }] },
    { standard: "STD-2", outcome: "compliant", in_force: true, rows: [{ requires: "notice within 30 days", did: "noticed on day 21" }] }],
  live: true };
export const CONSEQUENCES = { determination: DET, standard: null, totals: [], undetermined: ["C-2"], unproven: [], says: "x", parts: [
  { id: "C-1", affected: { kind: "class", name: "Tenants of the district" }, measure: { amount: 38000, currency: "USD" }, state: "computed", label: "from the rent schedules" },
  { id: "C-2", affected: { kind: "program", name: "The repair program" }, measure: null, state: "undetermined" }] };
export const STATUS_NONE = { determination: DET, status: "neither", escalations: [], declines: [] };
export const STATUS_OPEN = { determination: DET, status: "escalated", escalations: [{ id: ESC, state: "open", stage: 2, stage_name: "notification" }], declines: [] };
export const ESCALATION = { id: ESC, project: PROJECT, determination: DET, state: "open", stage: 2, stage_name: "notification",
  actions: [{ action: ACTION_ID, stage: 2, reason: "the demand" }], proposed: [{ from: 2, to: 3, stage: "clock", says: "its trigger was met 5 days ago" }],
  exit: { compliance: { state: "not_yet", says: W("escalation.live_compliant_determination") }, consequences: { state: "not_yet", says: "not every part addressed" } } };

/** `affordances` as the composer reads it: the kinds (the product's and a profile's own), the leg kinds and the tiers. */
export const KINDS = ["cpra_request", "records_request", "request_for_comment", "grand_jury", "controller_referral", "public_comment", "media", "litigation_support", "party_participation", "other"];
export const AFFORDANCES = { vocabularies: { action_kind: [...KINDS, "profile_kind_x", "profile_kind_unlabelled"], action_kind_labels: { profile_kind_x: "Hearing statement" },
  action_basis_kinds: ["rests_on", "advances"], risk_tiers: { 1: "x", 2: "x", 3: "x", undetermined: "x" } } };
export const OFFICES = { ok: true, subject: QUESTION, offices: [{ addressee: { state: "named", kind: "office", role: "City Clerk", body: "Office of the City Clerk", entity_id: "ENT-2026-1111111111111111" } }] };
/** `holdsdue` (action-holds R19): what still wants a hold, wherever it arrived. */
export const HOLDS_DUE = { ok: true, items: [
  { arrived: { action: ACTION_ID, ord: 2 }, project: PROJECT, note: "a letter from the city's counsel", marked_by: "member:mai", marked_at: "2026-10-09T09:00:00Z" },
  { arrived: { docket_entry: "DKT-2026-1", case: "CASE-2026-1" }, project: PROJECT, note: "a notice of claim", marked_by: "member:dev", marked_at: "2026-10-01T09:00:00Z" },
  { arrived: { pressure: "PRS-2026-1" }, project: PROJECT, note: "a letter from the owner's lawyer", marked_by: "member:ana", marked_at: "2026-10-03T09:00:00Z" }], truncated: false, cursor: null };
export const COUNSEL_PROJECT = "PROJ-2026-cccccccccccccccc";
export const ROSTER = { ok: true, count: 2, limit: 200, truncated: false, projects: [{ id: PROJECT, name: "Pothole repairs", stage: null, scope: "none" },
  { id: COUNSEL_PROJECT, name: "The rent dispute", stage: null, scope: "counsel_matter" }] };
export const ACTIONS = { ok: true, items: [{ id: ACTION_ID, state: "awaiting_response", kind: "records_request", counterparty: { role: "City Clerk" }, counterparty_state: "named" },
  { id: "ACTN-2026-9999999999999999", state: "resolved", kind: "request_for_comment", counterparty: null, counterparty_state: "undetermined" }], limit: 200, truncated: false, cursor: null };
export const TEMPLATES = { ok: true, action: ACTION_ID, kind: "records_request", governing: { tier: 2 },
  versions: [{ template: "TPL-1", name: "Records request, with our follow-up questions", origin: "group", state: "approved", approved_at: "2026-09-30T10:00:00Z", approved_by: "member:ana" }],
  not_offered: [{ handle: "@records-request", name: "Records request", lacks: ["writer", "sources", "professional_review"] }], court_petition: false };
export const GUIDES = { ok: true, kind: "records_request", guides: [{ origin: "profile", status: "researched", basis: "TEST", items: [
  { route: "Ask in writing, naming the records", expect: "the office says within 10 days whether it will release them", citation: "Gov. Code § 7922.535" }] },
  { origin: "group", guide: "GUIDE-1", approved_by: "member:ana", approved_at: "2026-10-01", items: [{ route: "Call the clerk's desk first", expect: "a name for the file", citation: "Mun. Code § 2.20.230" }] }], withheld: [], label: {} };
export const FACTS = [{ key: "anti_slapp", statement: "A special motion to strike generally must be filed within 60 days of being served with the complaint.", citation: "Code Civ. Proc. § 425.16", status: "researched", basis: "TEST", profile: "p" }];
export const PACKET = { ok: true, id: "CP-1", version: 1, action: ACTION_ID, purpose: "claim", marking: "Prepared for review by Priya Shah, Tenant Law Center.", fileable: false,
  sections: { facts: { title: "Facts", items: [{ finding: "FND-1", kind: "published", claim: { conclusion: "Closed means repaired" }, determined: true }, { finding: "INQ-2026-ffffffffffffffff", matter: "INQ-2026-ffffffffffffffff", determined: false }] } } };
export const NOTICE = { ok: true, place: { target: ACTION_ID, ord: 2 }, text: "Please keep, outside Civicsmith, messages and files about this matter." };

/** A plane answering every read of the screens with data. */
export const DATA_PLANE = {
  plan: ok(PLAN), planproposals: ok(PROPOSALS), list: ok(PROJECTS), optionstartpreview: ok(PREVIEW),
  projectquestions: ok(PROJECT_QUESTIONS), determinations: ok(DETERMINATIONS),
  action: ok(ACTION), filingsfor: ok(FILINGS([])), actionholdpreview: ok({ target: ACTION_ID, ord: null, hold: null, restarts: [] }),
  pressurefor: ok(PRESSURE), stakeatpreparation: ok(STAKE()),
  profiles: ok(PROFILES), determination: ok(DETERMINATION), consequencesof: ok(CONSEQUENCES), escalationstatus: ok(STATUS_OPEN), escalation: ok(ESCALATION),
  standards: ok({ ok: true, items: [{ id: "STD-1", cite: "Lease §7.2" }, { id: "STD-2", cite: "Lease §9.1" }], truncated: false }),
  affordances: ok(AFFORDANCES), holdsdue: ok(HOLDS_DUE), projectlist: ok(ROSTER), templatesforaction: ok(TEMPLATES), procedureguides: ok(GUIDES),
  actions: ok(ACTIONS), queue: ok({ items: [] }),
  // R3: the language the member states for a draft (`memberlanguage`) among those the team's profiles answer (`grouplanguages`)
  memberlanguage: ok({ language: "en" }), grouplanguages: ok({ languages: ["en", "es"] }),
  // the roster the fixtures' member ids are named from (C94, interface-shell R111): each id's handle is its own
  memberlist: ok({ members: ["mai", "dev", "ana", "asha"].map((h) => ({ member_id: h, handle: h })) }),
};
export const ROUTES = {
  plan: `/app/plan/${PLAN_ID}`, "start-send": `/app/start-send/${PLAN_ID}~opt-1`, request: `/app/request/${ACTION_ID}`,
  action: `/app/action/${ACTION_ID}`, matter: `/app/matter/${DET}~${ESC}`, "help-records": "/app/help-records",
  actionnew: `/app/actionnew/${PROJECT}`, hold: `/app/hold/${ACTION_ID}`, holdnotice: `/app/holdnotice/${encodeURIComponent(JSON.stringify({ target: ACTION_ID, ord: 2 }))}`,
  counsel: `/app/counsel/${ACTION_ID}`, "dash-action": "/app/dash-action",
};

/** The kit's read-only sentence for a screen (`interface-shell` R94): the screen's noun by its key, the path to Members as its word. */
export const RO = (id) => W("shell.readonly", { noun: W(`shell.readonly.noun.${id}`), members: W("shell.readonly.members") });
