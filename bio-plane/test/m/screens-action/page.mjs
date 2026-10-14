/* screens-action's tests' helper over interface-shell's harness (B7, K3007): the real page `interfacePage(SCREENS)`
   serves, run over the shell's document stand-in with a scripted plane, so every screen is drawn by the shell's own kit
   and every act runs through its friction, gate, refusals and re-reads. The fixtures are each op's answer as its owner
   documents it (action-plans, filings, actions, action-holds, conformance, consequences, escalation, instance-setup). */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SCREENS } from "../../../src/screens-action/index.mjs";
import { wordsOf, interfacePage } from "../../../src/interface-shell/index.mjs";
import { boot, ok, refused, refusedIn, settle, textNodes, MEMBER } from "../interface-shell/harness.mjs";

export { SCREENS, ok, refused, refusedIn, settle, textNodes, MEMBER };
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
  reply_owed: { owed: true, history: [] }, governing_laws: [{ level: "state", citation: "Gov. Code § 7922.535" }],
});
/** `pressurefor` as action-holds R16 answers it: the action's marks, each with where it arrived. */
export const PRESSURE = { ok: true, items: [{ arrived: { action: ACTION_ID, ord: 2 }, project: PROJECT, kind: "legal", note: "a letter from the city's counsel", by: "member:mai", at: "2026-10-04T09:00:00Z" }],
  limit: 500, truncated: false, cursor: null };
/** `filingread` as filings R59 answers a prepared communication, as it was stored. */
export const READ = (o = {}) => ({ ok: true, id: FILING, filing: FILING, action: ACTION_ID, form: "communication", purpose: "request",
  text: "We request the logs for 2025.", blanks: [{ name: "period", value: "2025", source: "fills:member:mai", label: { kind: "member_fill", by: "member:mai", machine_work: false, says: "x" } },
    { name: "office", value: "City Clerk", source: ACTION_ID }], unfilled: [{ name: "cost_limit", why: "the record holds no value for this blank: the member fills it in" }],
  fills: [], template: null, disclosure: { machine: false }, notices: [], label: "x", at: "2026-10-09T10:00:00Z", approval: null, second_approval: null, sending: null, ...o });
export const draft = (o = {}) => ({ filing: FILING, form: "communication", purpose: "request", label: "x", at: "2026-10-09T10:00:00Z",
  approval: null, second_approval: null, second_needed: false, signatories: [], voice: "group", sending: null, ...o });
export const FILINGS = (drafts = []) => ({ action: ACTION_ID, drafts, drafts_truncated: false, packets: [], packets_truncated: false });
export const PROFILES = { profiles: [{ id: "p", name: "p", covers: [] }], conflicts: [], choices: [], stage_findings: [],
  view: { deadlines: [
    { rule: "records_response", applies_to: "records_request", units: "days", amount: 10, count: "calendar", citation: "Gov. Code § 7922.535(b)",
      extension: { days: 14, citation: "Gov. Code § 7922.535(c)" } },
    { rule: "immediate_disclosure", applies_to: "records_request", units: "days", amount: 3, count: "business", citation: "Mun. Code § 2.20.230" },
    { rule: "meeting_notice", applies_to: "comment", amount: 72, count: "calendar", citation: "Open meetings law" }] } };

export const DETERMINATION = { id: DET, project: PROJECT, act: { id: "EVT-1", event: "The 2024 rent adjustment", actor: { role: "City Administrator", body: "City" }, when: "2024-03-01" },
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
  exit: { compliance: { state: "not_yet", says: "no live compliant determination" }, consequences: { state: "not_yet", says: "not every part addressed" } } };

/** A plane answering every read of the six screens with data. */
export const DATA_PLANE = {
  plan: ok(PLAN), planproposals: ok(PROPOSALS), list: ok(PROJECTS), optionstartpreview: ok(PREVIEW),
  action: ok(ACTION), filingsfor: ok(FILINGS([])), actionholdpreview: ok({ target: ACTION_ID, ord: null, hold: null, restarts: [] }),
  pressurefor: ok(PRESSURE),
  profiles: ok(PROFILES), determination: ok(DETERMINATION), consequencesof: ok(CONSEQUENCES), escalationstatus: ok(STATUS_OPEN), escalation: ok(ESCALATION),
};
export const ROUTES = {
  plan: `/app/plan/${PLAN_ID}`, "start-send": `/app/start-send/${PLAN_ID}~opt-1`, request: `/app/request/${ACTION_ID}`,
  action: `/app/action/${ACTION_ID}`, matter: `/app/matter/${DET}~${ESC}`, "help-records": "/app/help-records",
};
