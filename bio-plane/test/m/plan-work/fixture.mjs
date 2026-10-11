/* plan-work over the modules it uses: action-plans' test world (its fixture) gives the real record, membership,
   promotion, actions, action-clocks and action-plans, on a real SQLite database; plan-work is built over them with
   stand-ins, in the shape of their Provides, for the modules whose facts a test controls: escalation (`escalationsFor`
   R22, `escalationRead` R2, the fixture's own), filings (`filingsFor` R13), conformance (`curesOf` R37), action-holds
   (`projectHolds` R7, `holdsDue` R3, `holdsOf` R2), action-replies (`aroseFrom`, `arisenFrom` R2), duties
   (`dutiesArisingIn` R31), reading-guides (`procedureGuidesFor` R13) and ai-runs (`open` R77). action-plans' T45
   services this module calls (`planMark` R43 in K2848's shape, `registerCloseSnapshot` R44, the marks in `planRead`) are
   stood in over the real module until its job merges (plan rule 1). Every test drives plan-work at its interface. */
import { seeded, opened, option, choose, V, MACHINE, by, OFFICE, ms, DAY, NOW } from "../action-plans/fixture.mjs";
import { planWorkOf } from "../../../src/plan-work/index.mjs";

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
  const cures = new Map();          // `${determination}#${standard}` -> link
  const conformance = { curesOf: ({ determination, standard, viewer }) => {
    if (viewer === V("outsider")) return { ok: false, reason: "NO_SUCH_DETERMINATION" };
    const l = cures.get(`${determination}#${standard}`) || null;
    return { ok: true, determination, cures: [{ standard, standing: l }] };
  } };
  const drafts = new Map();         // action -> [{filing, purpose, approval, sending}]
  const filings = { filingsFor: ({ action }) => ({ ok: true, action, drafts: drafts.get(action) || [] }) };
  const holds = { project: [], due: [], of: new Map() };
  const actionHolds = {
    projectHolds: ({ projects }) => ({ ok: true, items: projects.map((p) => ({ project: p, held: holds.project.includes(p) })) }),
    holdsDue: () => ({ ok: true, items: holds.due }),
    holdsOf: ({ target, project, viewer }) => {
      const k = target ?? project;
      if (viewer === V("dave")) return { ok: false, reason: "NO_SUCH_BUNDLE" };
      return holds.of.has(k) ? { ok: true, statements: holds.of.get(k) } : { ok: false, reason: "NO_SUCH_BUNDLE" };
    },
  };
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
  /* actions: the real module; a received entry's capture, which a test sets, read as actions' read answers it */
  const shas = new Map();           // `${action}#${ord}` -> sha
  const listeners = [];
  /* a test's `w.hide(viewer, id)` withholds an action from that viewer here as action-plans' world does */
  const hidden = new Set(), hide = w.hide;
  w.hide = (viewer, id) => { hidden.add(`${viewer}|${id}`); hide(viewer, id); };
  const actions = new Proxy(w.actions, { get: (t, k) => {
    if (k === "actionRead") return (a) => {
      if (a && hidden.has(`${a.viewer}|${a.id}`)) return { ok: false, reason: "NO_SUCH_BUNDLE", target: a.id };
      const r = t.actionRead(a);
      if (!r || r.ok === false) return r;
      return { ...r, correspondence: (r.correspondence || []).map((e) => (shas.has(`${r.id}#${e.ord}`) ? { ...e, artifact_sha: shas.get(`${r.id}#${e.ord}`) } : e)) };
    };
    if (k === "registerResponseListener") return (module, fn) => { listeners.push({ module, fn }); return { ok: true }; };
    return typeof t[k] === "function" ? t[k].bind(t) : t[k];
  } });
  const pw = planWorkOf(w.host, { record: w.record, membership: w.membership, actionPlans: ap, actions,
    escalation: w.stand.escalation, filings, conformance, actionHolds, actionReplies, duties, readingGuides, aiRuns,
    now: () => w.clock.now, ...(opts.deps || {}) });
  Object.assign(w, { pw, apx: ap, marks, offers, aside, closers, cures, drafts, holds, links, dutyCalls, guides, runs, shas, listeners });
  /** Start a chosen option addressed to the office and answer its action's id. */
  w.started = (fields = {}, extra = {}) => {
    const o = option(w, { addressee: OFFICE, ...fields });
    choose(w, [o]);
    const r = w.ap.optionStart({ plan: w.PL, option: o, kind: "other", ...by("bob"), ...extra });
    if (!r.ok) throw new Error(`fixture start refused: ${JSON.stringify(r).slice(0, 300)}`);
    return { option: o, action: r.action };
  };
  /** Record a correspondence entry on an action by bob, as a member's account. */
  w.correspond = (action, direction, at = "2026-10-02") => {
    const r = w.actions.actionCorrespond({ target: action, direction, at, ...(direction === "no_response" ? {} : { account: "told by phone" }),
                                           ...by("bob") });
    if (!r.ok) throw new Error(`fixture correspond refused: ${JSON.stringify(r).slice(0, 300)}`);
    return r.ord;
  };
  /** Fire the registered response listener as actions' R95 calls it. */
  w.respond = (action, ord, project = w.P, recorder = V("bob")) =>
    listeners[0].fn({ action, ord, project, recorder, at: w.clock.now });
  return w;
}

export const code = (r) => r && (r.code ?? r.reason);
