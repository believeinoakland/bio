/* plan-work over the modules it uses: action-plans' test world (its fixture) gives the real record, membership,
   promotion, actions, action-clocks, action-plans and (merged, K2856) action-holds, on a real SQLite database; plan-work is built over them with
   stand-ins, in the shape of their Provides, for the modules whose facts a test controls: escalation (`escalationsFor`
   R22, `escalationRead` R2, the fixture's own), filings (`filingsFor` R13), conformance (`curesOf` R37; a test may read it through the real module), action-replies (`aroseFrom`, `arisenFrom` R2), duties
   (`dutiesArisingIn` R31), reading-guides (`procedureGuidesFor` R13) and ai-runs (`open` R77). action-plans' T45
   services this module calls (`planMark` R43 in K2848's shape, `registerCloseSnapshot` R44, the marks in `planRead`) are
   stood in over the real module until its job merges (plan rule 1). Every test drives plan-work at its interface. */
import { seeded, opened, option, choose, V, MACHINE, by, OFFICE, ms, DAY, NOW } from "../action-plans/fixture.mjs";
import { createHash } from "node:crypto";
import { planWorkOf } from "../../../src/plan-work/index.mjs";
import { actionHoldsOf } from "../../../src/action-holds/index.mjs";

export { V, MACHINE, by, OFFICE, ms, DAY, NOW, option, choose };

export function world(opts = {}) {
  const w = seeded(opts);
  opened(w, [w.SI, w.S1, w.S3]);
  /* action-plans' T45 services, stood in over the real module */
  const marks = new Map(), offers = new Map(), aside = new Map(), closers = [];
  const ap = new Proxy(w.ap, { get: (t, k) => {
    if (k === "planRead") return (a) => {
      const r = t.planRead(a);
      if (!r || !r.ok) return r;
      const set = aside.get(r.id) || new Map();
      return { ...r, marks: marks.get(r.id) || [], offers: offers.get(r.id) || [],
               scenarios: r.scenarios.map((s) => (set.has(s.scenario) ? { ...s, set_aside: { reason: set.get(s.scenario) } } : s)) };
    };
    /* action-plans R43 (K2848): `cause` {action, ord}; each mark {kind, why, option?, scenario?, phase?, routes?}, a
       malformed one skipped and named */
    if (k === "planMark") return ({ plan, marks: m, cause }) => {
      const l = marks.get(plan) || [];
      const skipped = [];
      const good = (x) => typeof x.why === "string" && x.why.length >= 1 && x.why.length <= 500
        && (x.kind === "option_changed" ? typeof x.option === "string"
          : x.kind === "phase_start_holds" ? x.scenario !== undefined && typeof x.phase === "string"
          : x.kind === "next_routes" ? Array.isArray(x.routes) && x.routes.length >= 1 && x.routes.length <= 20 : false);
      m.forEach((x, i) => (good(x) ? l.push({ ...x, machine_work: true, cause, at: w.clock.now }) : skipped.push(i)));
      marks.set(plan, l);
      return { ok: true, plan, marked: m.length - skipped.length, skipped };
    };
    if (k === "registerCloseSnapshot") return (module, fn) => {
      if (closers.length) return { ok: false, code: "LISTENER_DECLARED" };
      closers.push({ module, fn }); return { ok: true };
    };
    return typeof t[k] === "function" ? t[k].bind(t) : t[k];
  } });
  /* escalation: the action-plans fixture's stand-in, its items' state set by the test */
  const cures = new Map();          // `${determination}#${standard}` -> the standing link, in conformance R37's shape
  /* conformance R37's answer (K2852): per standard of the determination (or the one named), the standing link or null */
  const conformance = { curesOf: ({ determination, standard, viewer }) => {
    if (viewer === V("outsider")) return { ok: false, reason: "NO_SUCH_DETERMINATION" };
    const d = w.determinations.get(determination);
    const stds = (d ? d.outcomes.map((o) => o.standard) : []).filter((x) => !standard || x === standard);
    return { ok: true, determination, standards: stds.map((x) => ({ standard: x, link: cures.get(`${determination}#${x}`) || null, ended: [] })), cures: [] };
  } };
  const drafts = new Map();         // action -> [{filing, purpose, approval, sending}]
  const filings = { filingsFor: ({ action }) => ({ ok: true, action, drafts: drafts.get(action) || [] }) };
  /* action-holds, real (T45-26 merged, K2856), over the same host; its doorbell and ratification readers not registered */
  const actionHolds = actionHoldsOf(w.host, { record: w.record, membership: w.membership, now: () => ms(w.clock.now),
                                              doorbell: null, ratification: null });
  const links = { arose: new Map(), arisen: new Map() };
  const actionReplies = {
    aroseFrom: ({ target, ord }) => ({ ok: true, items: links.arose.get(`${target}#${ord}`) || [] }),
    arisenFrom: ({ project }) => ({ ok: true, items: links.arisen.get(project) || [] }),
  };
  const dutyCalls = [];
  const duties = { dutiesArisingIn: (a) => { dutyCalls.push(a); return w.dutiesAnswer ? w.dutiesAnswer(a) : { ok: true, duties: [], all_met: false }; } };
  const guides = new Map();         // kind -> guides
  const readingGuides = { procedureGuidesFor: ({ kind }) => ({ ok: true, kind, guides: guides.get(kind) || [], label: {} }) };
  const runs = [];
  const aiRuns = { open: async (a) => { runs.push(a); return w.aiOpen ? w.aiOpen(a) : { run: a.run, started: true }; } };
  /* actions: the real module (T45-27 merged, K2859), its response listener (R95) and receipts real; a test's
     `w.hide(viewer, id)` withholds an action from that viewer here as action-plans' world does (a narrower sight rule) */
  const hidden = new Set(), hide = w.hide;
  w.hide = (viewer, id) => { hidden.add(`${viewer}|${id}`); hide(viewer, id); };
  const actions = new Proxy(w.actions, { get: (t, k) => {
    if (k === "actionRead") return (a) => (a && hidden.has(`${a.viewer}|${a.id}`) ? { ok: false, reason: "NO_SUCH_BUNDLE", target: a.id } : t.actionRead(a));
    return typeof t[k] === "function" ? t[k].bind(t) : t[k];
  } });
  const pw = planWorkOf(w.host, { record: w.record, membership: w.membership, actionPlans: ap, actions,
    escalation: w.stand.escalation, filings, conformance, actionHolds, actionReplies, duties, readingGuides, aiRuns,
    now: () => w.clock.now, ...(opts.deps || {}) });
  Object.assign(w, { pw, apx: ap, marks, offers, aside, closers, cures, drafts, holds: actionHolds, links, dutyCalls, guides, runs });
  /** Start a chosen option addressed to the office and answer its action's id. */
  w.started = (fields = {}, extra = {}) => {
    const o = option(w, { addressee: OFFICE, ...fields });
    choose(w, [o]);
    const r = w.ap.optionStart({ plan: w.PL, option: o, kind: "other", ...by("bob"), ...extra });
    if (!r.ok) throw new Error(`fixture start refused: ${JSON.stringify(r).slice(0, 300)}`);
    return { option: o, action: r.action };
  };
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
