/* plan-work over the modules it uses: action-plans' test world (its fixture) gives the real record, membership,
   promotion, actions, action-clocks, action-plans, action-holds and action-replies (merged, K2856, K2862, K2864), on a real SQLite database; plan-work is built over them with
   stand-ins, in the shape of their Provides, for the modules whose facts a test controls: escalation (`escalationsFor`
   R22, `escalationRead` R2, the fixture's own), filings (`filingsFor` R13), conformance (`curesOf` R37; a test may read
   it through the real module), duties (`dutiesArisingIn` R31, `transitionsOf` R14), reading-guides (`procedureGuidesFor` R13) and ai-runs
   (`open` R77). Every test drives plan-work at its interface. */
import { seeded, opened, option, choose, V, MACHINE, by, OFFICE, ms, DAY, NOW } from "../action-plans/fixture.mjs";
import { createHash } from "node:crypto";
import { planWorkOf } from "../../../src/plan-work/index.mjs";
import { actionHoldsOf } from "../../../src/action-holds/index.mjs";
import { actionRepliesOf } from "../../../src/action-replies/index.mjs";
import { curesOf as publishedCuresOf } from "../conformance/fixtures.mjs";
import { actionRead as publishedActionRead } from "../actions/fixtures.mjs";

/* the refusals the providers' own fixtures show, made once by their real code: conformance's R37 `NO_SUCH_DETERMINATION`
   for a determination the viewer does not see, and actions' R43 refusal (naming the id asked) for an action the viewer
   may not see */
let noSuchDeterminationShape = null, noSuchActionShape = null;
const noSuchDetermination = () => noSuchDeterminationShape ??= (({ conformance, determination, outsider }) =>
  conformance.curesOf({ determination, viewer: outsider }))(publishedCuresOf());
const noSuchAction = (id) => ({ ...(noSuchActionShape ??= publishedActionRead().unseenAnswer), action: id });

export { V, MACHINE, by, OFFICE, ms, DAY, NOW, option, choose };

export function world(opts = {}) {
  const w = seeded(opts);
  opened(w, [w.SI, w.S1, w.S3]);
  /* action-plans, real (T45-33 merged, K2864): planMark, registerCloseSnapshot, marks, offers, set-aside scenarios */
  const ap = w.ap;
  /* escalation: the action-plans fixture's stand-in, its items' state set by the test */
  const cures = new Map();          // `${determination}#${standard}` -> the standing link, in conformance R37's shape
  /* conformance R37's answer (K2852): per standard of the determination (or the one named), the standing link or null */
  const conformance = { curesOf: ({ determination, standard, viewer }) => {
    if (viewer === V("outsider")) return noSuchDetermination();
    const d = w.determinations.get(determination);
    const stds = (d ? d.outcomes.map((o) => o.standard) : []).filter((x) => !standard || x === standard);
    return { ok: true, determination, standards: stds.map((x) => ({ standard: x, link: cures.get(`${determination}#${x}`) || null, ended: [] })), cures: [] };
  } };
  const drafts = new Map();         // action -> [{filing, purpose, approval, sending}]
  const filings = { filingsFor: ({ action }) => ({ ok: true, action, drafts: drafts.get(action) || [] }) };
  /* action-holds, real (T45-26 merged, K2856), over the same host; its doorbell and ratification readers not registered */
  /* its docket arm a stand-in in docket R27's shape (no docket marks, and no entry read: no test here holds on a docket entry), so no read here builds the docket and publication
     modules, whose promotion steps need tables this world does not hold */
  const docket = { docketPressureMarks: () => ({ ok: true, marks: [] }) };
  const actionHolds = actionHoldsOf(w.host, { record: w.record, membership: w.membership, now: () => ms(w.clock.now),
                                              doorbell: null, ratification: null, docket });
  /* action-replies, real (T45-29 merged, K2862): its arose_from links and their two reads */
  const actionReplies = actionRepliesOf(w.host, { record: w.record, membership: w.membership, actions: w.actions, caseInputs: null,
                                                  now: () => ms(w.clock.now) });
  const dutyCalls = [];
  /* duties R14's recorded readings: `w.transitions`, in R13's shape, filtered as `transitionsOf` filters them */
  const transitionCalls = [];
  const duties = { dutiesArisingIn: (a) => { dutyCalls.push(a); return w.dutiesAnswer ? w.dutiesAnswer(a) : { ok: true, duties: [], all_met: false }; },
    transitionsOf: (a) => { transitionCalls.push(a); if (w.transitionsAnswer) return w.transitionsAnswer(a);
      const t = (w.transitions || []).filter((x) => (!a.dutyId || x.duty_id === a.dutyId) && (!a.occurrenceKey || x.occurrence_key === a.occurrenceKey));
      return { ok: true, transitions: t, count: t.length }; } };
  const guides = new Map();         // kind -> guides
  const readingGuides = { procedureGuidesFor: ({ kind }) => ({ ok: true, kind, guides: guides.get(kind) || [], label: {} }) };
  const runs = [];
  const aiRuns = { open: async (a) => { runs.push(a); return w.aiOpen ? w.aiOpen(a) : { run: a.run, started: true }; } };
  /* actions: the real module (T45-27 merged, K2859), its response listener (R95) and receipts real; a test's
     `w.hide(viewer, id)` withholds an action from that viewer here as action-plans' world does (a narrower sight rule) */
  const hidden = new Set(), hide = w.hide;
  w.hide = (viewer, id) => { hidden.add(`${viewer}|${id}`); hide(viewer, id); };
  const actions = new Proxy(w.actions, { get: (t, k) => {
    if (k === "actionRead") return (a) => (a && hidden.has(`${a.viewer}|${a.id}`) ? noSuchAction(a.id) : t.actionRead(a));
    return typeof t[k] === "function" ? t[k].bind(t) : t[k];
  } });
  const pw = planWorkOf(w.host, { record: w.record, membership: w.membership, actionPlans: ap, actions,
    escalation: w.stand.escalation, filings, conformance, actionHolds, actionReplies, duties, readingGuides, aiRuns,
    now: () => w.clock.now, ...(opts.deps || {}) });
  Object.assign(w, { pw, cures, drafts, holds: actionHolds, replies: actionReplies, dutyCalls, transitionCalls, guides, runs });
  /** Start a chosen option addressed to the office and answer its action's id. */
  w.started = (fields = {}, extra = {}) => {
    const o = option(w, { addressee: OFFICE, ...fields });
    choose(w, [o]);
    /* R42: an outward option going before its infraction is documented says why (its control is in matters.test.mjs) */
    const r = w.ap.optionStart({ plan: w.PL, option: o, kind: "other", why_first: "the reply is due before we can document it",
                                 ...by("bob"), ...extra });
    if (!r.ok) throw new Error(`fixture start refused: ${JSON.stringify(r).slice(0, 300)}`);
    return { option: o, action: r.action };
  };
  /** The plan's machine marks (action-plans R43), as members read them. */
  w.marksOf = (plan = w.PL) => w.ap.planRead({ id: plan, viewer: V("bob") }).marks;
  /** Record a correspondence entry on an action by bob: a member's account, or the capture `artifactSha` names. A
   *  `received` one sets off actions' response listener (its R95), plan-work's re-examination among them. */
  w.correspond = (action, direction, at = "2026-10-02", extra = {}) => {
    const held = extra.artifactSha ? {} : direction === "no_response" ? {} : { account: "told by phone" };
    const r = w.actions.actionCorrespond({ target: action, direction, at, ...held, ...by("bob"), ...extra });
    if (!r.ok) throw new Error(`fixture correspond refused: ${JSON.stringify(r).slice(0, 300)}`);
    return r.ord;
  };
  /** A capture registered in the record (an information bundle holding it); answers its sha256. */
  let nc = 0;
  w.capture = (words) => {
    const id = `INFO-2026-${String(++nc).padStart(4, "0")}-reply`;
    const sha = createHash("sha256").update(words, "utf8").digest("hex");
    const text = ["---", `id: ${id}`, "object_type: information", `title: ${id}`, "current_state: collected",
                  'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "A reply.", ""].join("\n");
    const r = w.promotion.promote({ bundleId: id, base: null, snapKey: `cap${nc}`, author: V("alice"),
      files: [{ path: "bundle.md", text }, { path: `snapshots/${id}.txt`, text: words }], meta: { object_type: "information" },
      register: [{ sha256: sha, path: `snapshots/${id}.txt`, encoding: "utf8", bytes: Buffer.byteLength(words) }] });
    if (!r.ok) throw new Error(`fixture capture refused: ${JSON.stringify(r).slice(0, 300)}`);
    return sha;
  };
  /** The position the next correspondence entry on an action will take. */
  w.nextOrd = (action) => (w.actions.actionRead({ id: action, viewer: V("bob") }).correspondence || []).length;
  /** Let the listener's asynchronous part (the run's opening) finish. */
  w.settle = async () => { for (let i = 0; i < 5; i++) await new Promise((r) => setImmediate(r)); };
  /** What a response set off, per plan, oldest first: `[{plan, marks, run}]`. */
  w.reexamined = (action, ord) => w.rows(`SELECT x.plan_id, x.marks_json, r.run_json FROM pw_reexams x LEFT JOIN pw_reexam_runs r
      ON r.plan_id = x.plan_id AND r.response = x.response WHERE x.response=? ORDER BY x.plan_id`, `${action}#${ord}`)
    .map((r) => ({ plan: r.plan_id, marks: JSON.parse(r.marks_json), run: r.run_json ? JSON.parse(r.run_json) : null }));
  /** plan-work's listener called directly, as actions' R95 calls it (for a call actions itself never makes). */
  w.respond = (action, ord, project = w.P, recorder = V("bob")) => w.pw.onResponse({ action, ord, project, recorder, at: w.clock.now });
  return w;
}

export const code = (r) => r && (r.code ?? r.reason);
