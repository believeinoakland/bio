/* action-plans' pure rules: the vocabularies, the shapes of a subject, an option's text and a scenario's phases, and the
 * derivation of when each phase starts. Pure: no storage, no clock, no viewer; never throw. The refusals are minted at
 * their sites in index.mjs (DEC-49's one code, one site); these answer what is wrong, and the site refuses it. */

/** Terms: an option's category. */
export const CATEGORIES = Object.freeze(["mitigation", "legal", "awareness", "journalistic", "grassroots", "other"]);
/** R13: an option's dispositions; `open` is the default. */
export const DISPOSITIONS = Object.freeze(["open", "chosen", "declined", "done", "blocked"]);
/** R13: the dispositions that need a reason. */
export const NEEDS_REASON = Object.freeze(["declined", "blocked"]);
/** R21: a project's kinds of work. */
export const WORK_KINDS = Object.freeze(["reporting", "fixing", "legal", "oversight", "other"]);
/** R26: the keys no input or answer carries. */
export const REFUSED_KEYS = Object.freeze(["budget", "cost", "assignee", "hours", "significance", "priority", "score"]);
/** R9: a legal option's tiers; absent reads `undetermined`. */
export const TIERS = Object.freeze([1, 2, 3, "undetermined"]);
/** R16: a checkpoint's judgements. */
export const JUDGEMENTS = Object.freeze(["met", "not_met"]);

export const TITLE_MAX = 200;
export const REASON_MAX = 500;
export const SUMMARY_MAX = 200;
export const DETAIL_MAX = 5000;
export const WHY_MAX = 500;
export const NOTE_MAX = 500;
export const SUBJECTS_MAX = 50;
export const SCENARIOS_MAX = 3;
export const PHASES_MAX = 50;
export const DATES_MAX = 20;
export const CHECKPOINT_DAYS_MAX = 3650;
export const PLANS_PAGE_MAX = 200;
export const DUE_MAX = 500;
export const TRAY_PAGE = 5;
export const SOURCES_MAX = 50;
export const STAGE_MAX = 7;

const DAY_MS = 86400000;
export const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
export const str = (v) => (typeof v === "string" ? v.trim() : "");
export const isDay = (v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)
  && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;
/** A line of words with no quotation mark, backslash or line break, of 1 to `max` characters (R1's and R4's text rule). */
export const isLine = (v, max) => typeof v === "string" && v.trim().length > 0 && v.length <= max && !/["\\\r\n]/.test(v);
const TOKEN = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$/;
export const isToken = (v) => typeof v === "string" && TOKEN.test(v);

/* ---- subjects (Terms, R1, R3) ---- */

/** A subject as given, normalised: `{kind: "inquiry", inquiry, act?, standards?}` or `{kind: "outcome", determination,
 *  standard}`; null when it is neither. */
export function normSubject(s) {
  if (!isObj(s)) return null;
  if (s.kind === "inquiry") {
    if (!isToken(s.inquiry)) return null;
    const out = { kind: "inquiry", inquiry: s.inquiry };
    if (s.act !== undefined && s.act !== null) { if (!isToken(s.act)) return null; out.act = s.act; }
    if (s.standards !== undefined && s.standards !== null) {
      if (!Array.isArray(s.standards) || s.standards.length > SUBJECTS_MAX || !s.standards.every(isToken)) return null;
      out.standards = [...new Set(s.standards)];
    }
    return out;
  }
  if (s.kind === "outcome") {
    if (!isToken(s.determination) || !isToken(s.standard)) return null;
    return { kind: "outcome", determination: s.determination, standard: s.standard };
  }
  return null;
}

/** R3: two subjects are the same when they name the same inquiry, or the same determination and standard. */
export const subjectKey = (s) => (s.kind === "inquiry" ? `inquiry:${s.inquiry}` : `outcome:${s.determination}#${s.standard}`);

/* ---- an option's addressee (R10: `actions` R9's shape) ---- */

/** R10: the arm of an addressee, or null when it is not one (never a private individual). */
export function addresseeArm(a) {
  if (!isObj(a)) return null;
  const ok = (k, max = 500) => isLine(a[k], max);
  if (a.state === "named") {
    const kind = a.kind === undefined || a.kind === null ? "office" : a.kind;
    if (kind === "office") return ok("role") && ok("body") ? "office" : null;
    if (["press", "organisation", "group"].includes(kind)) return ok("role") && ok("organisation") ? kind : null;
    return null;
  }
  if (a.state === "audience") return ok("description") ? "audience" : null;
  return null;
}

/** The addressee as the action's `counterparty` carries it (actions R9): its own keys only. */
export function addresseeOf(a) {
  const arm = addresseeArm(a);
  if (arm === "office") return { state: "named", kind: "office", role: a.role, body: a.body, ...(isLine(a.level, 80) ? { level: a.level } : {}) };
  if (arm === "audience") return { state: "audience", description: a.description };
  if (arm) return { state: "named", kind: arm, role: a.role, organisation: a.organisation };
  return null;
}

/* ---- scenarios (R14, R15) ---- */

/** R14: what is wrong with a scenario's phases, or the phases normalised. `chosen` is the set of chosen option ids;
 *  `subjects` maps a subject key to the subject. Answers `{phases}` or `{fault, index?, phase?, detail}` with `fault`
 *  one of `malformed`, `not_chosen`, `branch`, `cycle`, in that order of asking. */
export function checkPhases(phases, { chosen, subjects }) {
  if (!Array.isArray(phases) || !phases.length || phases.length > PHASES_MAX)
    return { fault: "malformed", index: null, detail: `phases is a list of 1 to ${PHASES_MAX} phases` };
  const out = [];
  const ids = new Set();
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    const bad = (detail) => ({ fault: "malformed", index: i, detail });
    if (!isObj(p)) return bad("a phase is an object");
    if (!isToken(p.id) || ids.has(p.id)) return bad("a phase has an id of its own, a token used once in the scenario");
    ids.add(p.id);
    if (!isLine(p.name, TITLE_MAX)) return bad(`a phase has a name of 1 to ${TITLE_MAX} characters, with no quotation mark, backslash or line break`);
    if (!Array.isArray(p.options) || !p.options.every(isToken)) return bad("options is a list of the plan's option ids");
    const s = p.starts;
    let starts;
    if (s === "plan_start") starts = "plan_start";
    else if (isObj(s) && Object.keys(s).length === 1 && isToken(s.after)) starts = { after: s.after };
    else if (isObj(s) && isToken(s.branch_of) && JUDGEMENTS.includes(s.when) && Object.keys(s).length === 2)
      starts = { branch_of: s.branch_of, when: s.when };
    else if (isObj(s) && s.when_subject !== undefined && (s.reaches === "resolved" || s.reaches === "stage")) {
      const subj = normSubject(s.when_subject);
      if (!subj) return bad("when_subject names a matter of the plan");
      if (s.reaches === "stage" && !(Number.isInteger(s.stage) && s.stage >= 1 && s.stage <= STAGE_MAX))
        return bad(`a track reaching a stage names the stage, 1 to ${STAGE_MAX}`);
      if (s.reaches === "resolved" && s.stage !== undefined && s.stage !== null) return bad("a track reaching resolved names no stage");
      starts = { when_subject: subj, reaches: s.reaches, ...(s.reaches === "stage" ? { stage: s.stage } : {}) };
    } else return bad("starts is plan_start, {after}, {branch_of, when} or {when_subject, reaches, stage?}");
    let checkpoint = null;
    if (p.checkpoint !== undefined && p.checkpoint !== null) {
      const d = isObj(p.checkpoint) ? p.checkpoint.after_days : undefined;
      if (!Number.isInteger(d) || d < 1 || d > CHECKPOINT_DAYS_MAX || Object.keys(p.checkpoint).length !== 1)
        return bad(`a checkpoint is {after_days}, 1 to ${CHECKPOINT_DAYS_MAX}`);
      checkpoint = { after_days: d };
    }
    let condition = null;
    if (p.condition !== undefined && p.condition !== null) {
      if (typeof p.condition !== "string" || !p.condition.trim() || p.condition.length > NOTE_MAX)
        return bad(`a condition is words of 1 to ${NOTE_MAX} characters`);
      condition = p.condition;
    }
    let branches = null;
    if (p.branches !== undefined && p.branches !== null) {
      if (!isObj(p.branches) || !Object.keys(p.branches).length
          || !Object.entries(p.branches).every(([k, v]) => JUDGEMENTS.includes(k) && isToken(v)))
        return bad("branches maps met and not_met to the phase each leads to");
      if (!checkpoint) return bad("a phase with branches has a checkpoint whose judgement they follow");
      branches = { ...p.branches };
    }
    out.push({ id: p.id, name: p.name, options: [...new Set(p.options)], starts, checkpoint, condition, branches });
  }
  for (let i = 0; i < out.length; i++) {
    const miss = out[i].options.find((o) => !chosen.has(o));
    if (miss) return { fault: "not_chosen", index: i, option: miss, detail: `option ${miss} is not a chosen option of the plan` };
  }
  for (let i = 0; i < out.length; i++) {
    const p = out[i], s = p.starts;
    const target = s.after ?? s.branch_of ?? null;
    if (target !== null && !ids.has(target))
      return { fault: "branch", index: i, phase: target, detail: `phase ${target} is not a phase of this scenario` };
    if (s.when_subject && !subjects.has(subjectKey(s.when_subject)))
      return { fault: "branch", index: i, subject: s.when_subject, detail: "that matter is not one the plan is about" };
    if (s.branch_of && !out.find((x) => x.id === s.branch_of).checkpoint)
      return { fault: "branch", index: i, phase: s.branch_of, detail: `phase ${s.branch_of} has no checkpoint to branch on` };
    for (const v of Object.values(p.branches || {}))
      if (!ids.has(v)) return { fault: "branch", index: i, phase: v, detail: `phase ${v} is not a phase of this scenario` };
  }
  /* A phase depends on the phase it starts after or branches from; a branch makes its target depend on its phase. */
  const deps = new Map(out.map((p) => [p.id, new Set()]));
  for (const p of out) {
    const t = p.starts.after ?? p.starts.branch_of;
    if (t) deps.get(p.id).add(t);
    for (const v of Object.values(p.branches || {})) deps.get(v).add(p.id);
  }
  const state = new Map();
  const walk = (id) => {
    if (state.get(id) === 1) return id;
    if (state.get(id) === 2) return null;
    state.set(id, 1);
    for (const d of deps.get(id)) { const c = walk(d); if (c) return c; }
    state.set(id, 2);
    return null;
  };
  for (const p of out) {
    const c = walk(p.id);
    if (c) return { fault: "cycle", index: out.findIndex((x) => x.id === c), phase: c, detail: `phase ${c} is reachable from itself` };
  }
  return { phases: out };
}

const ms = (iso) => (typeof iso === "string" ? Date.parse(iso) : NaN);
export const dayOf = (msv) => new Date(msv).toISOString().slice(0, 10);
const iso = (msv) => new Date(msv).toISOString().replace(/\.\d{3}Z$/, "Z");

/** R14–R16: when each phase of a scenario version starts, derived, never stored. `setAt` is when the version was set
 *  (a `plan_start` phase starts then); `judged` maps a phase id to its judgement `{judged, at}`; `track(starts)` answers
 *  the instant another subject's track met R15's point, or null. Each phase answers `{started, at, earliest, due}`:
 *  `at` its start when started; `earliest` the soonest it can start (its start when started, else from the phases it
 *  waits on and their checkpoints' days, null when it waits on a track); `due` the instant its checkpoint is due, when
 *  it has one and has started. */
export function phaseTimes(phases, { setAt, judged, track }) {
  const byId = new Map(phases.map((p) => [p.id, p]));
  const memo = new Map();
  const ofPhase = (id) => {
    if (memo.has(id)) return memo.get(id);
    memo.set(id, { started: false, at: null, earliest: null, due: null });
    const p = byId.get(id);
    let at = null, earliest = null;
    const s = p.starts;
    const after = (t) => {
      const q = ofPhase(t);
      const days = byId.get(t).checkpoint ? byId.get(t).checkpoint.after_days * DAY_MS : 0;
      return { q, days };
    };
    if (s === "plan_start") { at = ms(setAt); earliest = at; }
    else if (s.after) {
      const { q: prior, days } = after(s.after);
      const j = judged.get(s.after);
      if (byId.get(s.after).checkpoint) { if (j) at = ms(j.at); }
      else if (prior.started) at = ms(prior.at);
      earliest = at ?? (prior.earliest === null ? null : ms(prior.earliest) + days);
    } else if (s.branch_of) {
      const { q: prior, days } = after(s.branch_of);
      const j = judged.get(s.branch_of);
      if (j && j.judged === s.when) at = ms(j.at);
      earliest = at ?? (j ? null : prior.earliest === null ? null : ms(prior.earliest) + days);
    } else if (s.when_subject) {
      const t = track(s);
      if (t) at = ms(t);
      earliest = at;
    }
    /* A phase named by another's branch starts at that judgement too. */
    for (const o of phases) {
      if (!o.branches) continue;
      for (const [k, v] of Object.entries(o.branches)) {
        if (v !== id) continue;
        const j = judged.get(o.id);
        if (j && j.judged === k && (at === null || ms(j.at) < at)) at = ms(j.at);
      }
    }
    const started = Number.isFinite(at);
    const r = { started, at: started ? iso(at) : null,
                earliest: started ? iso(at) : Number.isFinite(earliest) ? iso(earliest) : null,
                due: started && p.checkpoint ? iso(at + p.checkpoint.after_days * DAY_MS) : null };
    memo.set(id, r);
    return r;
  };
  return new Map(phases.map((p) => [p.id, ofPhase(p.id)]));
}

/** R19's branch check: the outcomes of a phase's checkpoint that lead nowhere. */
export function unbranched(p, phases) {
  if (!p.checkpoint) return [];
  return JUDGEMENTS.filter((k) => !(p.branches && p.branches[k])
    && !phases.some((o) => o.starts && o.starts.branch_of === p.id && o.starts.when === k));
}
