// src/harness.mjs
var LEVELS = ["meaning", "content", "document", "internet"];
var NAMESPACES = Object.freeze(["bio", "scratch"]);
var REPORTING_LEVEL = Object.freeze({
  meaning: "meaning",
  content: "content",
  document: "documents",
  internet: "internet"
});
var MODES = {
  check: {
    deployed: true,
    does: "read an EXISTING conclusion adversarially (DEC-24's CHECK role, \xA72)"
  },
  investigate: {
    deployed: false,
    does: "investigate fresh \u2014 enabled only after CHECK's first live run is verified (VF-5/SK-4)"
  },
  /* THE EXTRACT ROW, landed 2026-09-14 on SK-8's DELEGATION and NOT deployed.
     SK-8 built the plane half — `op=extractpropose` inside DEC-62's run, under
     the `mints` bound — and measured that nothing could DRIVE such a run,
     because this gate refused the word as unknown. The row's existence is what
     lets the refusal say "not deployed yet" instead of "no such mode", which
     are different facts. `deployed: false` is the honest state and it costs
     nothing: §7.3 point 7 leaves "may a project stand an EXTRACT run
     unattended" OPEN under a provisional NO, and a deployed extract mode is the
     first thing that question would bite on. Flipping this flag is a separate
     act — an EDIT here under review, never a request parameter — and it is not
     the act that added the row. */
  extract: {
    deployed: false,
    does: "propose citable passages and readings over a SUBJECT a member named, under the run's `mints` bound, never attesting \u2014 \xA77.3 of docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md; not yet deployed, and a standing EXTRACT run is provisionally NO (\xA77.3 point 7)"
  }
};
var BUDGET_BOUNDS = ["fetches", "subsessions", "wallclock"];
var MEANING_ARM = "leg";
var CONTROL_FLOW = {
  "gate-mode": {
    does: "SK-4's gate: refuse a mode that is not deployed, before anything is spent",
    judged: null,
    logs: true,
    to: ["resume", "close"]
  },
  resume: {
    does: "\xA714b.7 \u2014 read this run's OWN log and continue from it rather than restarting",
    judged: null,
    logs: true,
    /* R11, N153: a run whose last tick published its state continues at the step that state names, so every
       row after the gate is an edge from here; a run with none starts its pass at `plan`. */
    to: ["plan", "fanout", "collect", "compose", "dedup", "submit", "adjust", "next-pass", "close"]
  },
  plan: {
    does: "open a pass: the pass counter is the TABLE's and the search targets are the model's",
    judged: "what to search for",
    logs: true,
    to: ["fanout", "close"]
  },
  fanout: {
    does: "spawn ONE sub-session per level, all four, in LEVELS order",
    judged: null,
    logs: true,
    to: ["collect", "close"]
  },
  collect: {
    /* FL-5 / IS-9(a). The sub-session's return arrives HERE and is judged against
           the REPORT contract before anything downstream can read it: a REPORT with a
           citation, never documents, and the parent re-reads by address. The contract
           itself is `subsession.mjs`, kept out of this table for the reason the table
           exists — what the run does NEXT is a row, and what a return may CONTAIN is a
           shape; putting the second inside the first would make neither exhaustible.
    
           `judged` MOVED FROM null TO A JUDGEMENT AT FL-5, AND THAT IS A CORRECTION
           RATHER THAN AN ADDITION. Before FL-5 the reports entered at `compose`, one
           row too late: `compose` is where reports are INTERPRETED, so a return that
           arrived there had already been read by the step that forms versions from it,
           and the contract would have been enforced (if at all) after the harm. The
           returns now arrive at the row that collects them and are validated there. */
    does: "take each sub-session's REPORT and hold it to the return contract (a citation, never documents \u2014 \xA714b.1); re-read each citation BY ADDRESS",
    judged: "what each sub-session's REPORT says",
    logs: true,
    to: ["compose", "close"]
  },
  compose: {
    does: "form candidate versions from the reports",
    judged: "what each level's reports mean, and what the version says",
    logs: true,
    /* NO EDGE TO `submit`. Dedup is not a rule a step remembers to apply; it is
       the shape of the table, and this absent edge IS the enforcement. */
    to: ["dedup", "close"]
  },
  dedup: {
    does: "compare every candidate against the versions already on the record, BEFORE any write",
    judged: "whether this reading differs in substance",
    logs: true,
    to: ["submit", "next-pass", "close"]
  },
  submit: {
    does: "write ONE candidate through PL-3's endpoint, as formed \u2014 never a batch",
    judged: null,
    logs: true,
    /* THE F10 EDGE. A refusal goes to `adjust` and NOWHERE ELSE — there is no
       edge from `submit` back to `submit`, so a verbatim retry is not a path
       this table has. */
    to: ["submit", "adjust", "next-pass", "close"]
  },
  adjust: {
    does: "F10 \u2014 carry the plane's refusal back into the submission and CHANGE it, or drop the candidate",
    judged: "how to answer the refusal",
    logs: true,
    to: ["submit", "next-pass", "close"]
  },
  "next-pass": {
    does: "the pass counter and the loop's termination \u2014 neither is the model's to decide",
    judged: null,
    logs: true,
    to: ["plan", "close"]
  },
  close: {
    does: "the one exit, naming the bound (C-22.5). Terminal",
    judged: null,
    logs: true,
    to: []
  }
};
var FIRST_STEP = "gate-mode";
function runContextTarget(session) {
  const ctx = session && typeof session === "object" ? session.context : null;
  const type = ctx && typeof ctx.type === "string" ? ctx.type : null;
  const id = ctx && ctx.id != null && String(ctx.id).trim() !== "" ? String(ctx.id).trim() : null;
  if (!id) return { target: null, basis: "UNDETERMINED: the run read published no context id" };
  if (type === "project") {
    if (!Array.isArray(ctx.questions))
      return {
        target: null,
        basis: "UNDETERMINED: a run over a project lands on a question the project confirmed-cites, and the run read does not publish that set; a candidate names its own target, never the project id"
      };
    const qs = [...new Set(ctx.questions.filter((q) => typeof q === "string" && q.trim() !== "").map((q) => q.trim()))];
    if (qs.length === 1) return { target: qs[0], basis: "the one question the run's project confirmed-cites" };
    if (qs.length === 0)
      return {
        target: null,
        basis: "UNDETERMINED: the run's project confirmed-cites no question this run can see; a candidate names its own target, never the project id"
      };
    return {
      target: null,
      basis: `UNDETERMINED: the run's project confirmed-cites ${qs.length} questions and this member does not pick one of several; a candidate names its own target, never the project id`
    };
  }
  if (type === "inquiry") return { target: id, basis: "the run's context question" };
  return { target: null, basis: `UNDETERMINED: the run's context kind ${JSON.stringify(type)} is not one this member reads` };
}
function emptyLevelCandidates(state, target) {
  const reports = Array.isArray(state?.reports) ? state.reports : [];
  const out = [];
  for (const level of LEVELS) {
    const r = reports.find((x) => x && x.level === level);
    if (!r || r.state !== "LOOKED_ABSENT") continue;
    const reported = REPORTING_LEVEL[level];
    out.push({
      kind: "level-empty",
      target: target ?? null,
      /* THE PLANE'S SPELLING, NOT THE LOG'S — see `REPORTING_LEVEL` above. */
      level: reported,
      /* THE ADDRESS OF THE SEARCH THAT ESTABLISHES IT. The report carries where
         in the observation log it was written; a level-empty with no address is
         the one shape a later reader cannot check, and PL-3 refuses it. */
      observed_at: r.observed_at ?? null,
      /* D-323 — THE SEPARATOR IS A DASH, AND IT WAS A COLON UNTIL 2026-09-13.
         `VERSION_NAME_RE` is `/^[a-z0-9][a-z0-9 ._-]{0,63}$/i` and has NO COLON
         in it, so `level-empty:<level>` — the name THIS FUNCTION mints, the
         object §15's empty-run instrument exists to count — was refused by every
         deployed plane, `BASIS_REFUSED` / C-25.2, `wrote: false`. Measured live
         at 0.57.0 by VF-4 (MEASUREMENTS M-8) and re-measured here against the
         grammar itself. So VF-1's owed control 7 could not be true of a real
         run: the honest empty-handed run was indistinguishable from exactly the
         silent failure the kind exists to rule out.
         THE OTHER FIX WAS AVAILABLE AND ITS COST IS WHY IT WAS DECLINED. Widening
         `VERSION_NAME_RE` to admit `:` would have made this name legal without
         touching this line — every name legal today still passes, so nothing
         breaks — but it LOOSENS A PUBLISHED GRAMMAR on the record's own
         addresses, permanently, for one instrument's convenience, and it does it
         in the one character this project already spends on IDENTITY
         (`token:admin`, `class:ai`, `log:11`): a reading could then be NAMED
         like a principal. It is also an I3 wire change owing an IC. Against
         that, the separator costs one line here plus the suites that pinned the
         old spelling — and NOTHING ELSE, because the colon form has never once
         been written: no record anywhere holds it, so there is no migration and
         no reader to break. A grammar is widened when the record needs the
         character, never when one caller mints one the record refuses. */
      name: `level-empty-${reported}`,
      /* D-323's THIRD HALF — `description` IS NOT A FIELD A REPORT HAS.
         This line read `r.description ?? null`, and `checkReport` REFUSES any
         report carrying `description`: `REPORT_KEYS` is an EXACT key set —
         `level, state, observed_at, summary, citations, governed, condition` —
         and everything absent from it is refused BY NAME. So on every
         contract-honouring report this read `undefined`, every empty-level
         candidate carried `description: null`, and PL-3 refused all four of them
         `SUGGEST_BOILERPLATE` / C-27.12. VF-4 recorded this as a report-shape
         finding (*"a report carrying only summary"*); it is unconditional, and
         driving the contract is what showed that.
         COMPOSED RATHER THAN REFUSED, and the argument is §9's own. The kind is
         derived by the TABLE and never by the model precisely because the one
         case the instrument exists to catch — a run that found nothing and said
         nothing — is the case a judgement is least likely to fire on. A harness
         that refused loudly here would emit NOTHING whenever the model omitted a
         prose field, which reinstates that silence one field lower down. So the
         table composes the description too, out of what the table KNOWS: which
         level, and where the search that establishes it is written. That is an
         honest account of what changed and why — §6 rule 1's standard — and it
         overclaims nothing, because every word of it is a fact the report
         carried. The model's own `summary` is APPENDED when it has one and is
         never substituted for the composed sentence: a model that writes "n/a"
         must not be able to turn the instrument's own object back into filler. */
      description: `this run searched the ${reported} level of ${String(target ?? "this question")} and found nothing supportable there; the search that establishes it is written in the run's observation log at ${String(r.observed_at ?? "(no address)")}.` + (typeof r.summary === "string" && r.summary.trim() ? ` The sub-session reported: ${r.summary.trim()}` : "")
    });
  }
  return out;
}
function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
}
function adjustedFrom(before, after) {
  return canonical(before ?? null) !== canonical(after ?? null);
}
var allowance = (budget, bound) => {
  const row = (budget || {})[bound];
  if (!row) return null;
  const allowed = Number(row.allowed);
  const consumed = Number(row.consumed) || 0;
  if (!Number.isFinite(allowed) || allowed <= 0) return null;
  return { allowed, consumed };
};
function stopBecause(state) {
  const s = state || {};
  for (const bound of BUDGET_BOUNDS) {
    const row = allowance(s.budget, bound);
    if (row && row.consumed >= row.allowed) return bound;
  }
  if (Number(s.pass) >= Number(s.maxPasses)) return "completed";
  return null;
}
function nextStep(state) {
  const s = state || {};
  const at = String(s.step || FIRST_STEP);
  const row = CONTROL_FLOW[at];
  if (!row) return { step: "close", why: `'${at}' is not a row in this table`, bound: "completed" };
  if (at === "gate-mode") {
    const key = String(s.mode || "");
    const mode = MODES[key];
    if (!mode || !mode.deployed) {
      const deployed = Object.entries(MODES).filter(([, m]) => m.deployed).map(([k]) => k);
      const waiting = Object.entries(MODES).filter(([, m]) => !m.deployed).map(([k]) => k);
      const which = !mode ? `mode '${key || "(none)"}' is not deployed \u2014 it is no mode this table knows at all (the table holds: ${Object.keys(MODES).join(", ")})` : `mode '${key}' is not deployed yet \u2014 it is a row in this table (${mode.does}), and enabling it is an EDIT to this file under review, never a request parameter`;
      return {
        step: "close",
        bound: "mode-not-deployed",
        why: `${which}. CHECK is the first deployed mode (\xA72); deployed now: ${deployed.join(", ")}; not yet: ${waiting.join(", ")}. investigate-fresh enables only after CHECK's first live run is verified (VF-5/SK-4). This gate is a row in the control-flow table and never a sentence in the skill.`
      };
    }
    return { step: "resume", why: "the mode is deployed; read this run's own log before doing anything else" };
  }
  const stopped = stopBecause(s);
  if (stopped && at !== "close")
    return {
      step: "close",
      bound: stopped,
      why: stopped === "completed" ? `${s.pass} of ${s.maxPasses} passes are done; the loop's termination is the table's and not the model's` : `the '${stopped}' budget is spent. \xA714b.6: when a bound stops a run, the log says WHICH bound and where`
    };
  switch (at) {
    case "resume":
      if (typeof s.resumeAt === "string" && CONTROL_FLOW.resume.to.includes(s.resumeAt))
        return {
          step: s.resumeAt,
          why: `this run's last tick published its state at '${s.resumeAt}' with ${Number(s.pass) || 0} pass(es) done, and its log carries ${Number(s.resumedFrom) || 0} observation(s); continuing rather than restarting (\xA714b.7)`
        };
      return {
        step: "plan",
        why: (s.resumedFrom > 0 ? `this run's log carries ${s.resumedFrom} observation(s); continuing rather than restarting (\xA714b.7)` : "this run's log is empty; starting the first pass") + (s.resumeBasis ? `. ${s.resumeBasis}` : "")
      };
    case "plan":
      return { step: "fanout", why: `pass ${Number(s.pass) + 1}: fan out across all ${LEVELS.length} levels` };
    case "fanout":
      return { step: "collect", why: `${LEVELS.length} sub-sessions spawned, one per level, in LEVELS order` };
    case "collect": {
      const refused = (s.reportsRefused || []).length;
      return {
        step: "compose",
        why: `${(s.reports || []).length} REPORT(s) honoured the return contract` + (refused ? `; ${refused} return(s) REFUSED \u2014 a sub-session that returns documents has defeated the architecture, and those levels are UNDETERMINED, not empty` : "; none refused")
      };
    }
    case "compose":
      return { step: "dedup", why: `${(s.candidates || []).length} candidate(s) composed; nothing may be written before dedup` };
    case "dedup": {
      const queue = s.queue || [];
      if (!queue.length)
        return { step: "next-pass", why: "no candidate differs in substance from what the record already holds" };
      return { step: "submit", why: `${queue.length} candidate(s) survived dedup; they are written ONE AT A TIME, as formed` };
    }
    case "submit": {
      if (s.refusal) return { step: "adjust", why: `the plane refused '${String(s.refusal.code || s.refusal.reason || "?")}'; F10 routes a refusal to an ADJUST step, never to a verbatim retry` };
      const queue = s.queue || [];
      if (queue.length) return { step: "submit", why: `${queue.length} candidate(s) still to write, one at a time` };
      return { step: "next-pass", why: "every candidate this pass formed has been written or dropped" };
    }
    case "adjust": {
      const queue = s.queue || [];
      if (!s.adjusted && queue.length)
        return {
          step: "submit",
          why: `the refusal could not be answered by changing the submission, so the candidate is DROPPED and never resent (that would climb PL-3's \`repeats\` counter); ${queue.length} candidate(s) behind it in this pass are still written, one at a time`
        };
      if (!s.adjusted)
        return {
          step: "next-pass",
          why: "the refusal could not be answered by changing the submission, so the candidate is DROPPED. Resending the same bytes would return the stored refusal without re-evaluation and climb PL-3's `repeats` counter, which is the loop F10 exists to make visible"
        };
      return { step: "submit", why: "the submission was ADJUSTED and differs from the one that was refused" };
    }
    case "next-pass":
      return { step: "plan", why: `pass ${s.pass} done; the table decides there is another` };
    case "close":
      return { step: "close", why: "terminal", bound: s.bound || "completed" };
  }
  return { step: "close", why: `'${at}' has no transition`, bound: "completed" };
}
function advance(state, decision) {
  const s = state || {};
  const to = String(decision && decision.step || "close");
  if (to === "close") return { ...s, step: "close" };
  const next = to === "adjust" ? { ...s, step: "adjust", refusedSubmission: s.submission ?? null, adjusted: false } : { ...s, step: to, refusal: null, adjusted: false, refusedSubmission: null };
  if (s.step === "resume") {
    next.resumeAt = null;
    next.resumeBasis = null;
  }
  return to === "next-pass" ? { ...next, pass: (Number(next.pass) || 0) + 1 } : next;
}
var RESUMABLE = [
  "step",
  "pass",
  "targets",
  "reports",
  "reportsRefused",
  "rereads",
  "holdings",
  "candidates",
  "queue",
  "submission",
  "refusal",
  "refusedSubmission",
  "adjusted"
];
function resumableState(state) {
  const s = state || {};
  const out = {};
  for (const k of RESUMABLE) out[k] = s[k] === void 0 ? null : s[k];
  return out;
}
var STATE_RESTART_STEPS = ["next-pass", "close"];
function stateBytes(state) {
  return new TextEncoder().encode(JSON.stringify(state ?? null)).length;
}
function publishableState(state, limit) {
  const full = resumableState(state);
  const bytes = stateBytes(full);
  const ceiling = Number(limit);
  if (!(Number.isFinite(ceiling) && ceiling > 0) || bytes <= ceiling) return { state: full, bytes, restarted: null };
  const at = STATE_RESTART_STEPS.includes(full.step) ? full.step : "plan";
  const restart = resumableState({ step: at, pass: full.pass, adjusted: false });
  return { state: restart, bytes: stateBytes(restart), restarted: { bytes, limit: ceiling, at } };
}
var list = (v) => Array.isArray(v) ? v : [];
var record = (v) => v && typeof v === "object" && !Array.isArray(v) ? v : null;
function resumeFrom(published) {
  const p = record(published);
  if (!p || !Object.prototype.hasOwnProperty.call(p, "step") || p.step == null)
    return {
      at: null,
      state: null,
      basis: published == null ? "The run publishes no state it can be read back from, so this segment starts from the resume row" : "The run's published state names no step yet, so this segment starts from the resume row"
    };
  const at = String(p.step);
  const pass = Number(p.pass);
  if (!CONTROL_FLOW.resume.to.includes(at) || !Number.isInteger(pass) || pass < 0)
    return {
      at: null,
      state: null,
      basis: `UNDETERMINED: the run's published state names step ${JSON.stringify(at).slice(0, 60)} at pass ${JSON.stringify(p.pass ?? null).slice(0, 20)}, which is not a place this table continues from, so this segment starts the pass over rather than guess where the last one stopped`
    };
  return { at, basis: null, state: {
    pass,
    targets: list(p.targets),
    reports: list(p.reports),
    reportsRefused: list(p.reportsRefused),
    rereads: Number(p.rereads) > 0 ? Number(p.rereads) : 0,
    holdings: record(p.holdings),
    candidates: list(p.candidates),
    queue: list(p.queue),
    submission: record(p.submission),
    refusal: record(p.refusal),
    refusedSubmission: record(p.refusedSubmission),
    adjusted: p.adjusted === true
  } };
}
var PRESENT_UNBACKED_NOTE = "the model judged PRESENT at this step, but this entry can name nothing that was found, and the record refuses a PRESENT that names nothing (C-22.10) \u2014 so it is recorded as LOOKED_INDETERMINATE: a look happened, and the record cannot tell from it that the thing is there";
function stepLog(state, decision) {
  const s = state || {};
  const d = decision || {};
  if (!s.observed || s.observed === "NEVER_LOOKED") return null;
  const judgedPresent = s.observed === "PRESENT";
  const why = String(d.why || "");
  return {
    level: s.level || null,
    subject: `${String(s.step || FIRST_STEP)} -> ${String(d.step || "?")}`,
    /* D-129's states are different claims — EXCEPT `PRESENT`, which this entry cannot back (see the note above
       `PRESENT_UNBACKED_NOTE`). */
    state: judgedPresent ? "LOOKED_INDETERMINATE" : s.observed,
    governed: s.governed === true,
    condition: s.condition || null,
    terminal: d.step === "close",
    bound: d.step === "close" ? d.bound || null : null,
    detail: (judgedPresent ? `${PRESENT_UNBACKED_NOTE}. ${why}` : why).slice(0, 500)
  };
}
var JUDGEABLE = [
  "targets",
  "reports",
  "candidates",
  "queue",
  "adjusted",
  "submission",
  "level",
  "observed",
  "governed",
  "condition"
];
var NOT_JUDGEABLE = ["pass", "maxPasses", "step", "budget", "mode", "bound", "run", "store", "target"];
function applyJudgement(state, judgement) {
  const j = judgement && typeof judgement === "object" ? judgement : {};
  const overreach = Object.keys(j).filter((k) => NOT_JUDGEABLE.includes(k));
  if (overreach.length)
    return {
      ok: false,
      overreach,
      detail: `a judgement may not set ${overreach.join(", ")}. Loop bounds, the pass counter, the budget, the mode and the step are the TABLE's and never the model's (\xA714b.4). The evidential case is measured: TREC 2011 found searchers erring by up to +95/-87 points on their own recall and stopping early on a false belief of high coverage.`
    };
  const next = { ...state };
  for (const k of JUDGEABLE) if (Object.prototype.hasOwnProperty.call(j, k)) next[k] = j[k];
  return { ok: true, state: next };
}

// ../bio-plane/src/record-grammar/ids.mjs
var ID_PREFIXES = Object.freeze([
  "INFO",
  "PROB",
  "FOCUS",
  "INQ",
  "PROJ",
  "ACTN",
  "BIAS",
  "STD",
  "CONF",
  "CONS",
  "ESC",
  "ASP",
  "GOAL",
  "PLN"
]);
var PREFIX = `(${ID_PREFIXES.join("|")})`;
var SLUG = "[a-z0-9]+(-[a-z0-9]+)*";
var BUNDLE = `${PREFIX}-\\d{4}-\\d{4}-${SLUG}`;
var BUNDLE_ID_RE = new RegExp(`^${BUNDLE}$`);
var ANN_ID_RE = new RegExp(`^${BUNDLE}\\.ann-\\d{8}T\\d{6}Z-${SLUG}$`);

// ../bio-plane/src/record-grammar/grades.mjs
var BASIS_GRADES = ["A", "B", "C", "D"];
var EARNED_CAPTURE_CEILING = "B";
var UNREACHABLE_CAPTURE_GRADE = BASIS_GRADES[BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING) - 1] ?? null;

// ../bio-plane/src/record-grammar/sha256.mjs
var K = new Int32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var utf8 = new TextEncoder();

// ../bio-plane/checks/bio-checks.mjs
var HEADINGS = {
  information: ["## Summary", "## Provenance Notes", "## Session Log", "## Review Notes"],
  inquiry: ["## Question", "## What It Rests On", "## Conclusion", "## What Would Falsify This", "## Session Log", "## Review Notes"],
  focus: ["## Statement", "## Why It Matters", "## Open Questions", "## Session Log", "## Review Notes"],
  project: ["## Thesis Summary", "## Open Questions", "## Ruled Out", "## Session Log", "## Review Notes"],
  action: ["## Plan", "## Status", "## Correspondence", "## Session Log", "## Review Notes"],
  /* PL-12 / D-84 — THE BIAS BUNDLE'S HEADING SET, and the third heading is the
     one that is not decoration.
     `## Statements` is the prose the members read; the STATEMENTS THEMSELVES
     live in frontmatter as `statements[]`, exactly as an inquiry's legs live in
     `basis[]`, because D-21 forbids a second place to state a fact and the
     projection below is a projection of the DOCUMENT.
     `## Adoption` is where the group records the process by which it adopted
     this set. The doctrine deliberately does not define that process — "defined
     and documented by that group, in the group's own process document" — and
     requires only that adoption is a recorded, member-authored transition. So
     the heading is where the group's own account of it lands, and it is what
     makes `op=biasadopt`'s row point at something a reader can check.
     `## What This Does Not Enforce` IS DEC-54 (b) IN THE DOCUMENT'S OWN BYTES.
     The ruling is that the unenforceable residue is "a first-class published
     output, not a log line": a case saying "held to AP's standards" must also
     say which of AP's standards this system does not check, because in four of
     five documented verification failures the countable rules were formally
     satisfied while the uncountable properties failed. A residue that lived
     only in an op's answer would be exactly the log line the ruling refuses —
     it would not travel with the bundle, and a stranger reading the bytes after
     this instance is gone would meet the enforcement without the caveat. It is
     REQUIRED IN EVERY STATE rather than only in `adopted`, and C-26.7 refuses
     it EMPTY on an adopted bundle, because a heading nobody filled is the
     checkbox C-21.1 exists to refuse arriving one layer down. */
  bias: ["## Statements", "## Adoption", "## What This Does Not Enforce", "## Session Log", "## Review Notes"]
};
HEADINGS.problem = HEADINGS.focus;
var HEADINGS_WHEN = {
  inquiry: [{ heading: "## What This Excludes", whenCaseMember: true }]
};
HEADINGS_WHEN.problem = HEADINGS_WHEN.focus = [];
var STATES = {
  information: {
    legal: ["collected", "verified", "retired"],
    edges: { collected: ["verified"], verified: ["retired"], retired: [] }
  },
  /* The INQUIRY machine (REC-10, extended by REC-13). `published` and
       `divided` still wait for REC-14/16, and they arrive TOGETHER WITH their
       entry requirements, so no state is ever legal before its gate exists —
       which is why `concluded` lands here in the same turn as
       checkInquiryExtension's concluded arm below and op=conclude in the store.
       `surfaced` is a LEGAL ALIAS of `open` (DATA-MODEL §2.7's recommendation):
       rewriting it would invent an authored fact and set current_state
       disagreeing with the document's own state_history (C-4.2), so it stays
       legal, appears wherever `open` appears — INCLUDING the new conclude edge,
       because refusing to conclude an inquiry merely because it spells its open
       state the old way would be the trap the alias exists to avoid — and the
       drift stays visible. `open` is legal[0] deliberately — setup.mjs derives
       FIRST_STATE from it.
  
       REC-13's edges, and only these: `open <-> concluded` both ways (a
       conclusion is revisable — reopening is how a group says the answer did
       not hold), and `concluded -> deferred|dismissed`, because a conclusion
       nobody publishes STILL AGES (D-79: a finding that silently stops being
       worked on is indistinguishable from one never made). Deliberately NOT
       added: `deferred -> concluded` and `dismissed -> concluded`. Concluding
       something the group set down means picking it back up first, and the
       machine already carries deferred/dismissed -> open for exactly that.
       `concluded -> surfaced` follows the table's own convention, where every
       existing edge into `open` names the alias beside it. */
  /* ============ CASE-4 / DEC-72, 2026-09-10: `published` LEAVES THIS MACHINE.
       THE STATE GOES; THE PRECONDITION IT ENFORCED DOES NOT, AND THAT DISTINCTION
       IS THE WHOLE ITEM.
  
       Bob's ruling (DEC-72) makes a case ITS OWN OBJECT — a set of
       finding-versions plus the publishing project — rather than a phase of a
       finding. `CASE-AS-PRODUCTION.md`: *"A finding's lifecycle ends at
       `concluded`; publication is the case relation."* Its supersession table
       rules on this table by name: *"`published` as an inquiry lifecycle state
       (State Rules per-type machine; ILLEGAL_TRANSITION publishing-only-from-
       concluded) — the precondition survives as 'only a CONCLUDED finding may be
       a case member'; the state itself becomes the case relation."*
  
       WHAT `concluded: [... 'published' ...]` WAS ACTUALLY DOING, and it is why
       deleting it alone would have been a defect rather than the change. That one
       array entry was carrying TWO facts at once. The first is that publishing
       moves the document to a new lifecycle state — that fact is what DEC-72
       deletes. The second is that publishing is reachable from `concluded` AND
       FROM NOWHERE ELSE — a material set cannot be asserted over a question with
       no conclusion — and THAT fact survives the ruling untouched. Because both
       rode on one array entry, removing the entry removes both: with no
       `published` anywhere in `edges`, the old guard
       `legalFrom.includes("published")` is false from EVERY state, which reads as
       a gate that refuses everything and is in fact a gate that has stopped
       asking. So `publishCase()` now carries the precondition EXPLICITLY, as its
       own named refusal (`NOT_CONCLUDED`) over `concluded` alone. A rule that used
       to be a side effect of a table is now a sentence, which is the only form in
       which it can survive the table.
  
       `published` IS STILL IN `legacy` BELOW AND THAT IS NOT A HEDGE. Ratified
       bytes are immutable and a store that has published anything holds documents
       whose frontmatter says `current_state: published` — bytes whose hash a
       stranger may already be verifying against. Rewriting them to say something
       else would break every pin that names them and would be this record editing
       what it already signed. The focus machine four rows down is kept whole for
       exactly this reason and states it in those words: a legacy document
       validates against the vocabulary it was authored under. So the word stays
       VALID and stops being REACHABLE — nothing in `edges` names it as a
       destination, which is what "removed from the state machine" means for a
       machine that cannot rewrite its own history. `legal` is what this machine
       produces; `legacy` is what it must still read.
  
       THE OUT-EDGES ARE KEPT for the same reason and only for it: a document
       already sitting at `published` must still be pickable-up, or the removal
       would strand every case ever published behind a state with no exit. Nothing
       new ever arrives there to use them.
  
       WHAT REPLACED THE STATE EVERYWHERE ELSE: the CASE RELATION. Every guard
       that read `current_state === 'published'` — cannot divide, cannot
       restructure, cannot move a version, the frozen/confirmed basis split,
       reopen's own gate — now asks whether the document's CURRENT VERSION is a
       case member, which CASE-5 made answerable by the pin (`bundle_sha =
       version_sha`). That is one question with one answer instead of a state word
       and a roster that could disagree, and it is also why CASE-4 needed no second
       mechanism to notice a revision: a revised member's head stops matching the
       pin, and that same inequality IS the revision flag.
  
       ============ The REC-14 / DEC-12 reasoning that put `published` here, kept
       because it is what the removal has to preserve. It was: reachable ONLY from
       `concluded` — a material set cannot be asserted over a question with no
       conclusion — and it leaves ONLY to `open` (and its `surfaced` alias), which
       is DEC-12's reopening: *"A closed finding can be reopened, and a published
       case can be revised, though when republished, the edition number must be
       incremented and the case treated as a separate document."*
  
       REOPENING DOES NOT UNPUBLISH, and this table is where that survives. The
       inquiry's STATE and its PUBLICATION HISTORY are two different records: the
       edges here move the working document, and published_bundles keeps every
       edition with its own signature, attestor, time and gate version forever.
       A revision therefore costs the full ceremony — published -> open ->
       concluded -> published at edition 2 — because each edition is a separate
       document that carries its own conclusion, its own falsifier and its own
       freshly authored completeness (C-21.1).
  
       DELIBERATELY NOT ADDED: `published -> deferred|dismissed`. Ageing is what
       happens to a finding NOBODY published (D-79); a published case cannot
       quietly stop being worked on, because it is already out in the world.
       `published -> published` is not an edge either: a new edition is entered
       through `open`, so the state_history a reader checks shows the reopening
       that produced it rather than a case that mutated in place. */
  /* REC-16 / DEC-28: `divided` joins, and it IS TERMINAL. It is a STATE and not
       a disposition, and the line between the two families is not terminality —
       `deferred` and `dismissed` are terminal-ish too — it is WHAT THE WORD
       CLAIMS ABOUT THE QUESTION. A disposition is a member's judgment about a
       well-formed question and the question survives it unchanged; `divided` says
       the QUESTION ITSELF was malformed, it was two questions, and the parent is
       corrected FORWARD into its children. That is DEC-19's shape and the
       supersession family, not the declination family. Its reason belongs to the
       ACT and `disposition_reason` is untouched.
  
       ENTERED FROM `open` (and its `surfaced` alias) AND FROM `concluded`, and
       NOT FROM `published` — the store refuses that one BY NAME
       (PUBLISHED_CANNOT_DIVIDE) rather than as a generic illegal move, because
       the two are different statements: an EDITION says the case continues, a
       DIVISION says the parent was malformed, and a signed edition cannot be
       retroactively declared malformed without erasing what a reader relied on.
       DEC-12 changed publishing; it did not change this.
  
       DELIBERATELY NOT ADDED: `deferred|dismissed -> divided`. A question the
       group set DOWN is picked back up first (op=reopen), exactly as concluding
       one is — the machine already carries those edges, and dividing something
       nobody is working on would make the disposition a state nothing can be
       reasoned about from.
  
       TERMINAL, and structurally so rather than by policy: the parent's legs are
       OWNED by its children now, and un-dividing would be the record changing its
       mind in silence. `divided: []` is that fact, and it is what makes the
       children's `supersedes` edges the only forward path. */
  inquiry: {
    legal: ["open", "deferred", "dismissed", "surfaced", "concluded", "divided"],
    /* CASE-4 / DEC-72: STATES THIS MACHINE NO LONGER PRODUCES AND MUST STILL
       READ. Valid in bytes that already carry them; named by no edge as a
       destination, so nothing can enter them again. See the block above. */
    legacy: ["published"],
    edges: {
      open: ["deferred", "dismissed", "concluded", "divided"],
      surfaced: ["deferred", "dismissed", "concluded", "divided"],
      deferred: ["open", "surfaced", "dismissed"],
      dismissed: ["open", "surfaced", "deferred"],
      /* `published` REMOVED from this list by CASE-4 — it was the only edge INTO
         the state, and with it gone the state is unreachable. The precondition
         it also carried (publishing only from `concluded`) is now publishCase()'s
         own NOT_CONCLUDED refusal. */
      concluded: ["open", "surfaced", "deferred", "dismissed", "divided"],
      /* KEPT so a document already at `published` is not stranded. No new
         document ever arrives here to use these. */
      published: ["open", "surfaced"],
      divided: []
    }
  },
  /* The LEGACY focus machine, kept whole (elevated included) because a
     legacy focus/problem document validates against the vocabulary it was
     authored under — see the HEADINGS note. Nothing produces these states
     anymore; op=dispose runs on the inquiry machine above. */
  focus: {
    legal: ["surfaced", "elevated", "deferred", "dismissed"],
    edges: {
      surfaced: ["elevated", "deferred", "dismissed"],
      deferred: ["surfaced", "elevated", "dismissed"],
      dismissed: ["surfaced", "elevated", "deferred"],
      elevated: []
    }
  },
  project: {
    legal: ["forming", "investigating", "matured", "closed"],
    edges: {
      forming: ["investigating", "closed"],
      investigating: ["matured", "closed"],
      matured: ["closed"],
      closed: ["investigating"]
    }
  },
  action: {
    legal: ["planned", "active", "awaiting_response", "resolved", "abandoned"],
    edges: {
      planned: ["active", "abandoned"],
      active: ["awaiting_response", "resolved", "abandoned"],
      awaiting_response: ["active", "resolved", "abandoned"],
      resolved: [],
      abandoned: []
    }
  },
  /* PL-12 / D-84 — THE BIAS MACHINE, and `proposed` is DEC-54 (c) made
     structural rather than documented.
     `draft` is where a set is written. The doctrine already puts one rule on
     it — "a pattern statement without at least one citation cannot leave
     draft" — and C-26.4 is that rule, which is why it fires on the way OUT of
     draft rather than on the way in.
     `proposed` is the ONLY state an INHALE could ever reach, and the reason it
     exists as a state of its own. DEC-54 (c): "INHALE MEANS PROPOSE FOR
     ADOPTION, NEVER INSTALL. Adoption is an authored, attributed act (DEC-46,
     D-90, D-82). Otherwise adopting a policy becomes a way to LAUNDER a
     standard — 'we follow BBC standards' with nobody in the group having
     authored anything, which is the never-prefill violation wearing a
     compliance badge." A machine that could write `adopted` directly would BE
     that laundering, so the machine's ceiling is a state and not a convention.
     `adopted` is entered ONLY from `proposed`, and entering it is what
     `op=biasadopt` records with an author and a date.
     NO EDGE OUT OF `adopted` EXCEPT `retired`, and that is deliberate. An
     adopted set is PINNED (DEC-54 (d)) and a published case names the version
     it was held to; a set that could slide back to draft in place would make
     "the lens this case was produced under" unresolvable after the fact.
     Amending an adopted set is a NEW REVISION of the same bundle under
     append-only history — which re-pins — or a retirement and a successor.
     DELIBERATELY NOT ADDED: `draft -> adopted`. It is the only edge that could
     let a set become binding without ever having been proposed, and closing it
     is what makes the proposed state load-bearing rather than ceremonial.
     AND SINCE D-468 (2026-09-24) THIS TABLE IS ENFORCED AT THE WRITE PATH AND NOT
     ONLY DESCRIBED HERE. Everything above was true of the table and false of the
     plane: `op=promote` consulted no edge table, so `adopted -> proposed` landed
     and moved the head — a constraint that existed as a comment, which is the
     defect this repository meets most. `promote`'s `bias-state-edge` region now
     reads this table through `vocabFor` and refuses any move it does not declare
     (BIAS_ILLEGAL_TRANSITION, C-26.12). A revision that leaves a set where it
     stands is not a move and is not asked: that is how an adopted set is amended
     (`BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption"). This fence is
     THIS machine's alone — `promote` still asks no edge table for any other
     object_type. */
  bias: {
    legal: ["draft", "proposed", "adopted", "retired"],
    edges: {
      draft: ["proposed", "retired"],
      proposed: ["draft", "adopted", "retired"],
      adopted: ["retired"],
      retired: []
    }
  },
  /* K171 (1) (T8, N129): THE ACTION LAYER'S RECORD OBJECTS. A standard, a determination and a consequence part
     are each RECORDED once and never move: a correction is a new object that supersedes the old one (standards
     R4 and R6, conformance R7, consequences R6), so each machine is one state and no edge, and a promotion that
     names any other state is refused by `promote` (promotion R15). */
  standard: {
    legal: ["recorded"],
    edges: { recorded: [] }
  },
  determination: {
    legal: ["recorded"],
    edges: { recorded: [] }
  },
  consequence: {
    legal: ["recorded"],
    edges: { recorded: [] }
  },
  /* An escalation (escalation R21) is `open` while its stages run and `suspended` while a member has set it
     aside; `escalationResume` restores it at the same stage (R15). It is `ended` only by `escalationEnd`, once
     compliance is restored and the consequences are addressed (R14), and nothing leaves `ended`. */
  escalation: {
    legal: ["open", "suspended", "ended"],
    edges: {
      open: ["suspended", "ended"],
      suspended: ["open", "ended"],
      ended: []
    }
  },
  /* K198 (2) (T8, N159): intent's two pursuit documents (intent R26). An aspiration is held until it is retired;
     a goal is open until it is closed. Neither returns: intent's step refuses any other move
     (PURSUIT_STATE_MOVE_UNDECLARED), and this table states the same machine so the audit and the gate read the
     states as legal. */
  aspiration: {
    legal: ["held", "retired"],
    edges: { held: ["retired"], retired: [] }
  },
  goal: {
    legal: ["open", "closed"],
    edges: { open: ["closed"], closed: [] }
  },
  /* N-A1 (T18, K608): `action-plans`' plan (its R2, `PLN-`, `action_plan` in record-grammar's `OBJECT_TYPES`). A plan
     is `open` while the group works it and `closed` when a member closes it with a reason; nothing reopens it. */
  action_plan: {
    legal: ["open", "closed"],
    edges: { open: ["closed"], closed: [] }
  }
};
STATES.problem = STATES.focus;
var LAW_PROPOSAL_STATES = {
  machine_proposed: "a machine credential proposed these citations. That is machine work, labelled as machine work: it can set a list of laws beside the request and it can never state which laws govern it. Nothing here is this action's list of governing laws, and nothing becomes one until a member states it themselves",
  member_proposed: "a member proposed these citations to whoever states this action's governing laws. It is a proposal and not the list: only the governing-laws act sets that, and the record holds who made it",
  unstated: "the record does not say who proposed these citations"
};
var PROPOSAL_STATES = Object.freeze({
  governing_laws: LAW_PROPOSAL_STATES,
  standard: Object.freeze({
    machine_proposed: "a machine credential proposed this standard. That is machine work, labelled as machine work: it can set a standard beside the record for members to consider and it can never enter one. Nothing here is a standard this record holds, and nothing becomes one until a member records it themselves",
    member_proposed: "a member proposed this standard to whoever records the group's standards. It is a proposal and not a standard: only recording a standard enters one, and the record holds who made the proposal",
    unstated: "the record does not say who proposed this standard"
  }),
  comparison: Object.freeze({
    machine_proposed: "a machine credential prepared this comparison of a government act against standards. That is machine work, labelled as machine work: it can set out rows and questions for members and it can never determine whether the act complied. Nothing here is a determination, and nothing becomes one until a member records it themselves",
    member_proposed: "a member suggested this comparison of a government act against standards. It is a comparison and not a determination: only a determination records whether the act complied, and the record holds who made the comparison",
    unstated: "the record does not say who prepared this comparison"
  }),
  filing_draft: Object.freeze({
    machine_proposed: "a machine credential prepared this draft. That is machine work, labelled as machine work: it can prepare the words of a filing and it can never approve or send one. Nobody has approved or sent this draft, and nothing is filed until members decide to file it and send it themselves",
    member_proposed: "a member prepared this draft. It is a draft and not a filing: nobody has approved or sent it, and the record holds who prepared it",
    unstated: "the record does not say who prepared this draft, and nobody has approved or sent it"
  }),
  theory: Object.freeze({
    machine_proposed: "a machine credential proposed this candidate theory and remedy. That is machine work, labelled as machine work: it can set a theory beside the standards for members and counsel to weigh and it can never state the group's position. Nothing here is the group's position",
    member_proposed: "a member proposed this candidate theory and remedy. It is a candidate for members and counsel to weigh and not the group's position, and the record holds who proposed it",
    unstated: "the record does not say who proposed this candidate theory and remedy"
  }),
  /* N-A1 (T18, K608): an option proposed for an action plan (action-plans R11) is not an option until a member
     adopts it, and a prepared communication (filings R23) is a draft nobody has approved or sent, worded as
     `filing_draft`'s sentences are. */
  plan_option: Object.freeze({
    machine_proposed: "a machine credential proposed this option. That is machine work, labelled as machine work: it can set an option beside the plan for members to weigh and it can never choose one. It is not an option until a member adopts it",
    member_proposed: "a member proposed this option. It is a proposal and not an option: it is not an option until a member adopts it, and the record holds who proposed it",
    unstated: "the record does not say who proposed this option, and it is not an option until a member adopts it"
  }),
  communication: Object.freeze({
    machine_proposed: "a machine credential prepared this communication. That is machine work, labelled as machine work: it can prepare the words of a message and it can never approve or send one. Nobody has approved or sent it, and nothing is sent until members decide to send it themselves",
    member_proposed: "a member prepared this communication. It is a draft and not a message sent: nobody has approved or sent it, and the record holds who prepared it",
    unstated: "the record does not say who prepared this communication, and nobody has approved or sent it"
  })
});
var EXTENSION_ARMS = Object.freeze([
  { name: "checkInformationExtension", ids: ["C-2.7"] },
  { name: "checkInfo2Contract", ids: ["C-18.6", "C-18.7"] },
  { name: "checkInquiryExtension", ids: ["C-2.8"] },
  { name: "checkProjectExtension", ids: ["C-2.9", "C-9.1"] }
].map((a) => Object.freeze({ name: a.name, ids: Object.freeze(a.ids) })));
var AI_RUN_CHECKS = {
  /* §11: "Absence uses D-129's vocabulary — NEVER_LOOKED / LOOKED_ABSENT /
     LOOKED_INDETERMINATE / PRESENT, plus `partial`. Which absence is a stated
     fact, never a diagnostic detail." An entry outside the vocabulary is not a
     weaker statement of absence; it is an ungoverned one. */
  AI_LOG_STATE_UNKNOWN: {
    check: "C-22.1",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That observation does not say which kind of absence it found. The record distinguishes never having looked, having looked and found nothing, having looked and being unable to tell, having found it, and having found part of it."
  },
  /* D-104, and CLAUDE.md states the general rule it instantiates: "our governor
     refusing is not the source failing". An entry recording LOOKED_ABSENT when
     it was OUR pacing that stopped the fetch MANUFACTURES a false absence —
     §11's own word. The governed flag is the fact; a governed observation can
     only be LOOKED_INDETERMINATE, and either definitive claim is refused. */
  AI_LOG_GOVERNED_ABSENCE: {
    check: "C-22.2",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That observation was stopped by our own pacing of the source, not by the source. It can only record that we could not tell \u2014 recording an absence there would be a claim about the world made from a fact about us."
  },
  /* §11's third rule, SWEEP §3's false-coverage hazard: "A client-rendered
     shell capture is LOOKED_INDETERMINATE, never PRESENT". `client-rendered-shell`
     is catalogued with no producer, and an evidentially empty capture that reads
     as coverage is the defect the whole absence vocabulary exists to prevent. */
  AI_LOG_SHELL_PRESENT: {
    check: "C-22.3",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That capture is a page shell with nothing evidential in it, so it cannot be recorded as having found the material. It records that we could not tell."
  },
  /* DEC-8 as amended by DEC-49: a surface may render a translation keyed on a
     code the plane SENT, which only holds if the plane never sends a condition
     nobody has translated. The condition vocabulary is `queuestate.mjs`'s, read
     LIVE rather than copied, and a run naming a kind outside it is a loud
     refusal instead of a silent new vocabulary — queuestate.mjs's own words for
     the same fence one surface over. */
  AI_RUN_CONDITION_UNKNOWN: {
    check: "C-22.4",
    where: "src/observation-log/vocabulary.mjs checkCondition, called from src/ai-runs/index.mjs #aiRunTerminate",
    translation: "The run tried to end on a condition the record has no name for. A condition nobody can read is not an explanation."
  },
  /* §11: "the observation log cannot live in bundle.md, which is written only on
     success — the log's whole value is the failure path." The log is a different
     object from the record, and a different object again from a TRANSCRIPT,
     which DEC-61 puts device-local with a TTL and out of the record store
     altogether. This refusal is the fence AT THE APPEND: an entry offered for a
     bundle is refused, so the separation is enforced at the one write rather
     than asserted about every reader. */
  AI_LOG_NOT_A_BUNDLE: {
    check: "C-22.6",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "The observation log is not part of any published document and cannot be filed into one."
  },
  /* REC-93, 2026-09-14 — THE COLUMN THAT MAY NEVER BE ABSENT.
       `OBSERVATION-LOG-DESIGN.md` §3: *"`authority_kind` is never NULL — a look
       the record cannot say WHY it made is not recorded."* `STORE-AS-CACHE.md`
       carries the rule it descends from, which is RFC 2308's: A NEGATIVE ANSWER
       WITH NO AUTHORITY BEHIND IT IS NOT RECORDABLE. The whole value of this table
       is that an absence becomes a stated fact instead of a retry, and an absence
       nobody can attribute is not a fact anybody can weigh.
  
       IT IS ALSO WHERE §4.6'S PROVISIONAL IS ENFORCED RATHER THAN MERELY WRITTEN
       DOWN, and that is the part worth reading before changing this row. *A
       member's ad hoc search, view or read is not an observation* — because the
       record is what a legal process can reach, and a store that holds what its
       members looked for is a different object from one that holds what a group
       published. What stops that from being written is not a missing writer, which
       any later item could supply without noticing: it is that there is NO
       `authority_kind` A MEMBER'S SEARCH COULD TAKE. The alternative §4.6 declines
       (`authority_kind = member`) is absent from `OBSERVATION_AUTHORITY_KINDS` on
       purpose, so reversing the provisional costs one line in a vocabulary and no
       schema change — which is exactly what §4.6 says reversal should cost, in the
       one direction that stays reversible. A member who wants a search ON the
       record states it as a LEAD (D-194), which carries a name BY CHOICE.
  
       THE TEST IS MEMBERSHIP, NOT PRESENCE. A null check would pass the very value
       the provisional exists to keep out. */
  OBS_AUTHORITY_UNNAMED: {
    check: "C-22.9",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That observation does not say why the look was made. The record keeps what it looked for only when something can be named as the reason \u2014 an investigation, a monitoring sweep, a link in a document, a ratification, or a lead somebody wrote down. A look with no reason behind it is not recorded."
  },
  /* REC-93, 2026-09-14 — THE WARC LESSON, AND THE FALSE-COVERAGE HAZARD FROM
       THE OTHER DIRECTION. `OBSERVATION-LOG-DESIGN.md` §3: *"`PRESENT` with no
       `result_ref` is refused — the WARC lesson: a revisit that omits what it
       refers to silently loses which URL the bytes came from."*
  
       WHY IT IS ITS OWN CODE AND NOT C-22.3's. C-22.3 refuses a PRESENT that the
       EVIDENCE contradicts (a client-rendered shell read as coverage). This refuses
       a PRESENT WITH NO EVIDENCE ATTACHED AT ALL. They are different facts with
       different remedies — one is answered by re-reading the capture honestly, the
       other by naming what the look produced — and DEC-49's rule is that a single
       refusal covering both tells a member nothing they can act on.
  
       IT DOES NOT FIRE ON `authority_kind = run`, AND THAT CARVE-OUT IS A MEASURED
       CONFLICT BETWEEN TWO SECTIONS OF THE DESIGN rather than a convenience. §3
       writes this refusal unconditionally; §4.4 requires every `ai_run_log` row to
       fold into this table and read back through `op=airunlog` UNCHANGED. Both
       cannot hold: `ai_run_log` HAS NO `result_ref` COLUMN, so no row ever written
       to it can satisfy this, and `op=airuntick` accepts a caller-supplied
       `PRESENT` today. Enforcing it over `run` would drop rows out of a coverage
       record, or force the fold to invent a referent — and inventing one to get
       past a gate is the failure CLAUDE.md names by name. The fold is therefore
       admitted under the weaker rule it was written under, every other authority
       carries the refusal, and the carve-out is a DEBT row rather than a shape.
  
       **THE CLOSING CONDITION NAMED HERE WAS FALSE AND IS CORRECTED BY
       MEASUREMENT (REC-100, 2026-09-16).** This row said the carve-out *"closes
       when the run's own writers carry referents (REC-95)"*. REC-95 landed and it
       did NOT close: its three writers write under `authority_kind = derive`, not
       `run` — REC-95 read the tree, found the sentence wrong and recorded that the
       correction was owed to REC-100. Left standing, it would have invited the
       next session to delete one condition and refuse three live writers.
  
       **AND THE REMAINING BLOCKER IS NOT A WRITER AT ALL, AT TWO OF THE THREE.**
       `#aiRunTerminate` and `#aiRunReap` take their state from
       `#aiRunSearchState`, a ROLLUP over the run's whole log — a summary PRESENT
       has nothing single to point at BY CONSTRUCTION, so no writer-side work
       satisfies this refusal and the design owes a ruling on what a terminal
       entry's referent is. The third is `agent-worker`'s `stepLog`, another area's
       path, which composes no referent field while a model may judge `PRESENT`.
       The full reasoning and the driven evidence are at the predicate in
       `src/airun.mjs`; section L of `test/observation-log.test.mjs` drives it
       (it was section I until D-500, 2026-09-24, which found two sections wearing
       that letter and moved REC-100's — this citation named the ambiguous one).
  
       **CLOSED 2026-09-18 BY REC-100 (IC-130, D-366).** BOB #14 ruled the rollup
       (`OBSERVATION-LOG-DESIGN.md` §3): a rollup's PRESENT carries `result_kind =
       observation` pointing at the latest non-terminal PRESENT row of its own run,
       computed by the plane. The carve-out is DELETED, so this refusal now fires
       on EVERY authority, and it GAINED AN ARM rather than a new code: an
       `observation` referent that is not an EARLIER PRESENT row of the SAME
       authority is refused here too, with `referent_fault` naming which of four
       ways it failed (`OBSERVATION_REFERENT_FAULTS` in `src/airun.mjs`). One code,
       because every fault is this row's condition — a PRESENT whose referent does
       not back it — and a second code behind C-22.10 would be two conditions
       behind one C-number, which `civicos-ui/check-refusal-codes.mjs` refuses.
       Section K of `test/observation-log.test.mjs` drives all of it. */
  OBS_PRESENT_NO_REFERENT: {
    check: "C-22.10",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That observation says the thing is there without saying what was found. A record that something is present has to point at what it found \u2014 the captured document, the passage, the entity \u2014 or nobody can check it later, and a claim of coverage that cannot be checked is worse than no claim at all."
  },
  /* N118 (LEGACY-TESTS #3 REPORT 10; observation-log R3, K148; T6, legacy-checks) — C-22.1 WAS MINTED FOR A SECOND
     CONDITION. observation-log's `checkObservation` refuses a look that states NEVER_LOOKED (R3: NEVER_LOOKED is the
     absence of a row, never a row; its one exception is a run's terminal rollup, K148) under C-22.1's code, and
     C-22.1's sentence ("does not say which kind of absence it found") is false for it: that look named a kind, the
     one kind a look cannot be. DEC-49 is one code, one condition, so it takes a code of its own rather than C-22.1
     reworded to cover both. Since T10 observation-log mints it: the region `is-never-looked-stored` is marked in
     `checkObservation` (`src/observation-log/vocabulary.mjs`), and C-22.17 is what that site answers (N286). */
  AI_LOG_NEVER_LOOKED_STORED: {
    check: "C-22.17",
    where: "src/observation-log/vocabulary.mjs checkObservation > is-never-looked-stored",
    translation: "That observation says nobody looked, and an observation is the record of a look. Never having looked is what the record says of a subject with no observation at all, so it is not written as one. A look that happened records what it found: nothing, something, part of it, or that it could not tell."
  }
};
var CONTENT_EXTENT_DOCUMENT_ONLY = Object.freeze({ known: false, chain: null, pageCount: null });

// ../bio-plane/src/ai-runs/checks.mjs
var AI_RUN_OWN_CHECKS = {
  /* §14b.6 IS THIS ITEM: "when a bound stops a run, the observation log says
     which bound and where it stopped". A close with no bound named is the
     `heldMatch` defect exactly — not found and did not finish looking made
     indistinguishable — so the terminate path REFUSES it rather than writing an
     unattributed ending. This is what makes "names the bound" a mechanism
     rather than an intention. */
  AI_RUN_BOUND_UNNAMED: {
    check: "C-22.5",
    where: "src/airun.mjs checkBound, called from src/ai-runs/index.mjs #aiRunTerminate",
    translation: "The run stopped without saying what stopped it. Not finding something and not finishing the search are different facts, and only one of them licenses a conclusion."
  },
  /* SK-1, 2026-08-08. §11 lists THREE conditions a run is formed under — the
       bias manifest in force, the launching project's standard pair, and THE
       SKILL VERSION IT RAN UNDER — because "everything can change at the drop of
       a hat" and a version is only interpretable against them. SK-1's row makes
       the recording a REQUIREMENT and not an analogy (the Cerebras/Schulte
       disclosure standard), and a condition that may be omitted is not recorded:
       it is recorded by the runs that felt like it.
  
       REFUSED AT THE OPEN, beside the two principals, for the same reason those
       are: refusing later would mean a run had already searched under
       instructions nobody can name. Two ways to fail and ONE code, because they
       are one fact — the run object cannot say what it ran under. The worse of
       the two is a version that names no pack: `3` reads as an answer and
       identifies nothing, which is the blank-principal shape PL-4 measured one
       field over, arriving on a condition instead of an identity.
  
       A WHOLE-FUNCTION `where`: `checkSkillVersion` is small, single-purpose, and
       the only refusal it makes is this one. Moved from the catalogue with its
       reasons and translation unchanged (N289, K333); its `where` names the site
       this module holds (`skillpack.mjs`'s copy was deleted by N156). */
  AI_RUN_SKILL_VERSION_UNNAMED: {
    check: "C-22.7",
    where: "src/ai-runs/skill-version.mjs checkSkillVersion, called from src/ai-runs/index.mjs open",
    translation: "This run did not say which version of its instructions it was working under. What a run found can only be read against the instructions it was given, so the record asks for that version before the run starts rather than guessing at it afterwards."
  },
  /* PL-18, 2026-08-09 — DEC-63'S GATE, AND IT IS THE ONE ROW IN THIS FAMILY
       THAT IS ABOUT WHO IS ASKING RATHER THAN ABOUT WHAT THE RUN OBJECT SAYS.
       Bob ruled 2026-08-09 that an investigation can be started by ANY MEMBER OF
       THE PROJECT: the gate is participation in the project the inquiry belongs
       to, and the capability token stays `contribute` only as the FLOOR beneath
       it. IS-6's provisional checked `contribute` alone.
  
       WHY IT IS ITS OWN CODE AND NOT THE CAPABILITY REFUSAL'S, which is the whole
       content of the item rather than a nicety. *You are not a member of this
       project* and *you lack contribute* are DIFFERENT FACTS ABOUT A MEMBER, and
       they have different remedies: one is answered by an owner of that project
       inviting you, the other by an administrator granting a capability. A single
       refusal covering both would tell a member nothing they can act on, which is
       DEC-49's rule and the ACT-AND-SAY principle in one place. The capability
       half keeps its own existing, differently-shaped refusal at the control
       plane (`NOT_CAPABLE`, carrying `needs`), so a caller can always tell which
       of the two stopped them.
  
       THE TRANSLATION DELIBERATELY NAMES NO PROJECT. A member who is not in a
       project may not be entitled to learn it exists — the skeleton-visibility
       rule (7.12) — so the canned sentence a surface renders says what happened
       and what to do, and the refusal's own `detail`, composed at the site, names
       only what the caller already put in their own request.
  
       CORRECTED 2026-09-19 by REC-145 (DEC-63 as amended by Bob, 2026-09-18): this refusal is now said
       ONLY over a run whose context is a PROJECT. A run over a question consults no project, so the old
       first sentence (*"asking the system to look into a question is work inside the project that
       question belongs to"*) stated the ruling Bob reversed — *a project does not own a line of inquiry*. */
  AI_RUN_NOT_PROJECT_MEMBER: {
    check: "C-22.8",
    where: "src/airun.mjs projectGate, called from src/ai-runs/index.mjs open/tick/close",
    translation: "Asking the system to look into a project is work inside that project, and this account is not one of that project's participants. This is not about what the account is allowed to do in general \u2014 it is about which piece of work it is part of. Someone who owns that project can invite you to it."
  },
  /* REC-153, 2026-09-19 — THE RUN'S CONTEXT IS THE KIND IT SAYS IT IS. Membership Architecture v2 §7, the
       DEC-63 ruling bullet, *"AND THE CONTEXT KIND IS CHECKED"* (BOB #16): *"A run's `contextType` must equal
       the named bundle's type; a mismatch is refused, and an id the caller cannot see answers as absent."*
       Once REC-145 made the run verdict turn on the KIND (a question consults no project), a run labelled
       `inquiry` over a PROJECT's id opened for a member who had not joined that project — the joined gate
       walked around by a word the caller chose.
  
       ONE CODE FOR THE MISMATCH, THE ABSENT ID AND THE HIDDEN ONE, and that is the §7.9 half of the ruling
       rather than economy. A second code for *"that is a project, not a question"* would be said over a
       project the caller can see and withheld over one they cannot, so the difference between the two codes
       would be the bit. The refusal is built from what the caller SENT and nothing else, which makes the
       three one object by construction (`#noSuchProject`'s discipline, one act over). It is one condition —
       *nothing of the kind you named answers to that id for you* — not two behind one number.
  
       CORRECTED THE SAME DAY on BOB #16's ruling (`7d03e852`), which the first build did not have: (i) A MACHINE
       SEES NO MORE THAN ITS PRINCIPAL — an `ai` credential's open over an id its member cannot see is that member's
       own absent answer, and an operator credential's open over a never-minted id is refused as absent too (the
       first build let a machine through for an id the store did not hold, on PL-18's word); (ii) THE KIND IS
       `RUN_CONTEXTS`' CLOSED VOCABULARY — any other word is refused HERE before any bundle is looked at, rather
       than matched against the bundle's type. Both are this row's one condition: the kind and id the caller named
       do not resolve to a context they can run in. A new code for (ii) was weighed and declined: C-22.12 is
       REC-152's, and the word refused is the caller's own, so the refusal can say which failed without a second
       code carrying any bit. */
  AI_RUN_NO_SUCH_CONTEXT: {
    check: "C-22.11",
    where: "src/airun.mjs checkRunContextKind, called from src/ai-runs/index.mjs open",
    translation: "Nothing of the kind this run names answers to that id here. A run is over a question or a project, nothing else; a run over a question has to name a question, and a run over a project has to name a project. Something you cannot see is answered exactly as something that does not exist, so this says nothing about whether anything else goes by that id."
  },
  /* REC-152, 2026-09-19 — TICK AND CLOSE ARE THE RUN'S PRINCIPAL'S ACTS (Membership v2 §7, "WHO MAY TICK
       AND CLOSE A RUN", BOB #16). C-22.12 and not C-22.11: CONDUCT #6 assigned C-22.11 to REC-153, which is
       on its own branch, so this number was taken with the gap left for it.
  
       WHY IT IS ITS OWN CODE AND NOT C-22.8's. *You are not in this project* and *this is not your run* are
       DIFFERENT FACTS with different remedies: the first is answered by an owner inviting you, the second by
       nobody — the run is its principal's, and one nobody drives ends on its own lease. A co-participant who
       is fully joined meets this and never C-22.8, and a single refusal covering both would tell them to ask
       for an invitation they already hold.
  
       SAID ONLY TO SOMEBODY WHO CAN SEE THE RUN'S CONTEXT. A caller who cannot is answered as for a run that
       does not exist, before this is reached (§7.9), so the sentence names nobody — neither the principal
       nor the caller — and the store's `detail` names only the rule. */
  AI_RUN_NOT_PRINCIPAL: {
    check: "C-22.12",
    /* REC-165 (§11 item 5 rule 1, BOB #25): the run's two productions ask the same gate. */
    where: "src/airun.mjs runPrincipalGate, called from src/ai-runs/index.mjs tick/close/runGate/#surfacingGate and by run-productions",
    translation: "Only the person who started this investigation \u2014 or an AI credential they created for it \u2014 can continue it or end it. It is not about which projects you belong to or what you are allowed to do in general: an investigation nobody continues ends by itself when its time or budget runs out."
  },
  /* REC-169, 2026-09-23 (INVESTIGATIVE-SESSION.md §14b.6 — A RUN IS BOUNDED, AND THE BOUND IS RECORDED). The tick
     wrote `consumed + Number(v)` for any figure, so the run's own principal could REFUND a bound its member set
     (`surfaces: -1`, and open another question). A figure is a non-negative whole JSON number; the refusal is the
     whole tick's (or the whole open's, for a seed), and nothing is written. Its own code and not C-22.5's: that one
     is a CLOSE naming no bound, this is a figure no bound can hold. */
  /* REC-172, 2026-09-23: ALSO the member's `allowed` at the open (it was written `Number(x) || 0`, so `-1`, `1.5` and
     `"3"` became a declaration nobody made). One code for both halves of a bound's figure — the rule is the same whole
     number — and the translation widened from SPENDING to GIVING an amount so it reads true of either. */
  AI_RUN_CONSUME_INVALID: {
    check: "C-22.13",
    where: "src/airun.mjs checkConsume, called from src/ai-runs/index.mjs tick and open",
    translation: "The investigation gave an amount for its budget that is not a whole number of zero or more. A budget is set and used up in whole steps, and never goes down, so nothing was recorded for this step."
  },
  /* REC-169 — THE BOUNDS THE PLANE COUNTS (`PLANE_COUNTED_BOUNDS`: `mints`, counted by extractPropose, and `surfaces`,
     counted by promote since D-85). WHY ITS OWN CODE: the figure may be perfectly well-formed; what is wrong is WHO
     is counting. The remedy differs too — the caller sends nothing for these, where C-22.13's caller sends a proper
     number. A zero claims nothing and is not refused. */
  /* REC-172, 2026-09-23: ALSO `lease` (`PLANE_DECIDED_BOUNDS`), at the tick and as a declaration at the open, and
     for ANY figure including zero. Same rationale — the plane decides it, off the clock — so the same code; the
     translation now names the lease beside the counts. */
  AI_RUN_BOUND_PLANE_COUNTED: {
    check: "C-22.14",
    where: "src/airun.mjs checkConsume, called from src/ai-runs/index.mjs tick and open",
    translation: "This part of the investigation's budget is kept by the record itself \u2014 passages marked citable and questions opened are counted as the work lands, and whether the investigation is still alive is read off the clock \u2014 so the investigation cannot report it, up or down. Nothing was recorded for this step."
  },
  /* REC-172, 2026-09-23 (INVESTIGATIVE-SESSION.md §14b.6). A tick's `consume` key naming no bound, and a `consume`
     that is not a map at all (an ARRAY, whose keys are positions), were SKIPPED: the tick answered `ticked: true` and
     spent nothing, so a caller believed it counted work the record never held (the live instrument vf4 sent an array
     for its whole life). The open DROPPED an entry naming no bound, so a member who declared `fetchs: 3` got a run
     with no fetch ceiling. Its own code and not C-22.13's: the figure may be perfectly good; what is wrong is that it
     names nothing the run has, and the remedy (spell the bound, send a map) differs. */
  AI_RUN_BOUND_UNKNOWN: {
    check: "C-22.15",
    where: "src/airun.mjs checkConsume (the tick's map, the open's list, and every key in either), called from src/ai-runs/index.mjs tick and open",
    translation: "The investigation named a part of its budget that does not exist, or did not say which part it meant. Nothing was recorded, so no budget was spent or set that nobody could account for."
  },
  /* REC-177, 2026-09-23 (INVESTIGATIVE-SESSION.md §14b item 6, BOB #30). A bound declared at `op=airunopen` with an
     ABSENT or ZERO `allowed` was opened at 0, and `finishedBound` reads 0 as NO CEILING — so the run recorded a bound
     it did not have. Refused at the open, nothing written. Its own code and not C-22.13's: C-22.13 is a figure of the
     wrong FORM (a string, a fraction, a negative), and 0 is a perfectly good whole number; what is wrong here is that
     the declaration states no allowance, and the remedy differs (state one, or do not declare the bound). */
  AI_RUN_BOUND_NO_ALLOWANCE: {
    check: "C-22.16",
    where: "src/airun.mjs checkConsume (the open's list, its allowance arm), called from src/ai-runs/index.mjs open",
    translation: "The investigation was given a limit on part of its budget without saying how much it may use. A limit of nothing would mean no limit at all, so the investigation was not started. Give it an amount, or leave that part out."
  },
  /* N293 (AGENT-WORKER #2 J1; REC-169's rule, one figure over), R45 — THE RUN'S SCRATCH IS BOUNDED. `state` is the
     run's resumable work list (R12, DEC-61: never a transcript), and it was stored with no bound on its size: the run's
     principal could write any amount on every tick, into a row every read of the run publishes whole (R19). The
     ceiling is `AI_RUN_STATE_MAX_BYTES`, measured as the UTF-8 length of the state's JSON, the bytes the row holds. Its
     own code and not C-22.13's: the figure there is a budget's; here nothing is wrong with any figure, the work list is
     simply too large to keep, and the remedy differs (keep less, or keep it elsewhere). A WHOLE-FUNCTION `where`, as
     C-22.7's: `checkRunState` makes this one refusal and no other; the open and the tick relay it. */
  AI_RUN_STATE_TOO_LARGE: {
    check: "C-22.18",
    where: "src/airun.mjs checkRunState, called from src/ai-runs/index.mjs open and tick",
    translation: "The investigation tried to keep more working notes than one investigation may hold, so nothing it sent with them was recorded and none of its budget was spent. An investigation keeps a short list of what it has left to do, not everything it has read."
  }
};
var AI_RUN_ACT_SHAPE_CHECKS = {
  /* ---------------------------------------------------------------------------
       UI-38's §14a RIDER, AND IT IS IN THIS FAMILY BECAUSE ANOTHER FAMILY'S SUITE
       REFUSED IT — WHICH IS THE CORRECT OUTCOME AND IS RECORDED RATHER THAN
       WORKED AROUND.
  
       REC-64 first put this row in `AI_RUN_CHECKS`, where the run's other three
       open-time conditions live. `airun.test.mjs` ARM D3 failed it: **every C-22
       allocation must name its enforcement site in a PURE CHECK MODULE**
       (`src/airun.mjs` or `src/skillpack.mjs`), so the catalogue can be walked to a
       pure function. This condition is enforced in `store.mjs` at the run-open
       door, so it does not satisfy that invariant and does not belong in C-22. The
       ARM WAS NOT WIDENED: an invariant relaxed to fit a new row is not an
       invariant, and this one is load-bearing — it is what lets `op=audit` reach
       every C-22 condition without opening the store.
  
       WHAT IT IS. §14a promises the running-session surface SAYS SO when the
       capability is unavailable, and IS-BUILD-PLAN's FL-6 row names the failure it
       guards: *"when no token resolves the capability is UNAVAILABLE and says so —
       never a silent no-op"*. UI-38 correctly LEFT that sentence rather than
       authoring it at the surface, because member-facing refusal wording is
       DEC-49's. The site already refused this condition — with NO CODE, so a
       surface could only render the operator's sentence verbatim or blank, the
       exact state DEC-49 ended.
  
       THE TRANSLATION SAYS "NOTHING RAN" IN SO MANY WORDS, on purpose: an
       unavailable capability must not be indistinguishable from a run that looked
       and found nothing. The second is a claim about the world; the first is a fact
       about us. That is `CLAUDE.md`'s "our governor refusing is not the source
       failing", arriving at the run door.
  
       ITS `where` IS A WHOLE FUNCTION AND NOT A REGION, which is the only one in
       REC-64's work — and the reason WAS a defect in the guard rather than a
       judgement about the span. `aiRunOpen` refuses with `started: false`, and arm
       C's matcher was `ok: false`, so a REGION here would have judged zero refusals
       and FAILED as a drifted marker. The whole-function form is honest at this site
       (every refusal `aiRunOpen` makes is a condition of opening a run) and the
       blindness was measured and delegated at the guard's own `codesChecked` floor.
  
       **REC-76 CLOSED THAT DELEGATION (D-236), AND THE WHOLE-FUNCTION `where` IS
       WHAT MADE IT PAY.** Arm C now grades an outcome by whether it DECLARES ITSELF
       A SUCCESS rather than by one literal, so this site went from `92L (0 judged,
       0 code(s) checked)` to four refusals judged — and TWO of them were CODELESS,
       at a governed site, for as long as the row has existed. They are the two rows
       immediately below. Nothing about the span changed; the instrument started
       seeing it.
  
       **D-589 (2026-09-25) NARROWED ALL THREE INTO REGIONS, AND THE PARAGRAPH TWO
       ABOVE IS NOW HISTORY, NOT RULE.** The whole-function `where` stopped being
       honest the moment a SECOND family's refusal was written inside `aiRunOpen`:
       REC-207's first draft put its re-run refusals in a narrowed region there and
       the guard failed them by name, because the region was judged once by its own
       rows and again by this whole-function site, where their codes are not rows.
       So each of these three rows now names the region around its one refusal
       (`is-airun-open-context`, `-capability`, `-already`), and arm C no longer
       judges a claimed region a second time from an enclosing whole-function
       `where` (the guard's `nestedRegionsIn`). What the narrowing costs, stated:
       the five RELAYED refusals in `aiRunOpen` (existence, kind, gate, skill,
       seed — each minted and governed at its own site) are not read at this
       function while no whole-function row names it.
       --------------------------------------------------------------------------- */
  AI_RUN_CAPABILITY_UNAVAILABLE: {
    check: "C-33.29",
    where: "src/ai-runs/index.mjs open > is-airun-open-capability, reached from op=airunopen",
    translation: "Nothing was run, because this instance could not find an account to run it under. That is a fact about our setup and not an answer about your question: no searching happened, so nothing here should be read as having looked and found nothing."
  },
  /* ---------------------------------------------------------------------------
       REC-76 / D-236 — THE TWO CODELESS REFUSALS THE WIDENED CLASSIFIER FOUND.
  
       Both have been at this governed site since before the row above was written,
       and neither was ever judged, because arm C could not see a refusal spelled
       `started: false`. They are not new conditions and they are not new refusals:
       they are two sentences a surface could only render verbatim or blank, which
       is the state DEC-49 ended. **The item that fixes an instrument owes the
       sites the instrument newly sees, and these are them.**
       --------------------------------------------------------------------------- */
  AI_RUN_NO_CONTEXT: {
    check: "C-33.30",
    where: "src/ai-runs/index.mjs open > is-airun-open-context, reached from op=airunopen",
    translation: "Nothing was run, because the request did not say what the run is for or what it belongs to. A run has to sit inside a question or a project so that the people working on that question can see it happened; one belonging to nothing would be invisible to everybody."
  },
  AI_RUN_ALREADY_OPEN: {
    check: "C-33.31",
    where: "src/ai-runs/index.mjs open > is-airun-open-already, reached from op=airunopen",
    translation: "Nothing was run, because a run with this name is already on record here. The record keeps what each run did under its own name, so starting a second one under a name already in use would write two different histories into one place. Give this one a name of its own."
  },
  /* ---------------------------------------------------------------------------
       REC-207 — THE RE-RUN LINK'S THREE REFUSALS (BOB #32, 2026-09-23 23:42Z).
  
       They are ACT-SHAPE conditions — the answer to *may this open carry this
       link* — so they belong here rather than in a family of their own (SK-1's
       rule, and the same one that put the BIAS_DEBT rows in BIAS_CHECKS).
  
       WHY THEY ARE REFUSALS AT ALL, rather than a link stored and judged later.
       `aiRunClose` settles a bias debt on the strength of `rerun_of`, so a link
       the record cannot stand behind is a DISCHARGE resting on the caller's word.
       The three conditions are the three ways that could happen: the run names
       itself, it names something that is not there, or it names work in another
       context whose lens is a different lens entirely.
  
       A WHOLE-FUNCTION `where`, AND WHY. These three were first written inside a
       narrowed REGION, which is what `kickoffs/WORKER.md` asks for — and
       `check-refusal-codes.mjs` then FAILED all three by name: `aiRunOpen`'s three
       rows of the time carried a WHOLE-FUNCTION `where`, and the guard judged a
       region's refusals twice, once at the region and once at the enclosing
       function, where their codes were not rows. So these three were written at
       the whole function. D-589 (2026-09-25) then narrowed those three neighbours
       into governed regions (`is-airun-open-context`, `-capability`, `-already`,
       the rows above) and made arm C judge a claimed region once, by its own rows
       (`nestedRegionsIn`). These three are now the ONLY rows naming `aiRunOpen`
       as a whole, and the three regions' lines inside it are governed by the
       regions, not by this site. Narrowing these three into a region of their own
       is now possible and has not been done.
       --------------------------------------------------------------------------- */
  AI_RUN_RERUN_SELF: {
    check: "C-33.45",
    where: "src/ai-runs/index.mjs open, reached from op=airunopen",
    translation: "Nothing was run, because this run was told it is a re-run of itself. A re-run says which EARLIER piece of work it repeats, and a run pointing at itself would be able to clear its own outstanding re-run. Name the earlier run, or leave the field out."
  },
  AI_RUN_RERUN_UNKNOWN: {
    check: "C-33.46",
    where: "src/ai-runs/index.mjs open, reached from op=airunopen",
    translation: "Nothing was run, because the earlier run it says it repeats is not one this record holds for you. It may never have existed, it may have been removed, or it may belong to work you have not been brought into. Check the name."
  },
  AI_RUN_RERUN_OTHER_CONTEXT: {
    check: "C-33.47",
    where: "src/ai-runs/index.mjs open, reached from op=airunopen",
    translation: "Nothing was run, because the earlier run it says it repeats belongs to a different question or project. Repeating work means asking the same question again under the lens that is in force for it \u2014 somewhere else the group's declared lens can be a different one, so the two runs would not be comparable and settling anything on that basis would be wrong."
  }
};
var AI_RUNS_CONTEXT_CHECKS = {
  /* No kind named at all. There is no honest default: `inquiry` and `project`
     are different objects with different membership, and answering from one
     when the caller meant the other is a confidently wrong answer about a
     different context — MEANING_ROWS_NO_ARM's reasoning, one table over. */
  AI_RUNS_NO_CONTEXT_TYPE: {
    check: "C-36.1",
    where: "src/ai-runs/index.mjs listInContext > is-airuns-context, reached from op=airuns",
    translation: "That request did not say what kind of thing to look in. Background work is attached either to a question or to a project, and those are different places \u2014 so the record asks which rather than choosing one for you."
  },
  /* A kind was named and the record has no such context. Refused rather than
     answered empty: see the header — an empty answer here would be the record
     saying nothing is running, on the strength of a word it did not recognise. */
  AI_RUNS_UNKNOWN_CONTEXT_TYPE: {
    check: "C-36.2",
    where: "src/ai-runs/index.mjs listInContext > is-airuns-context, reached from op=airuns",
    translation: "Background work is not attached to anything of that kind. Rather than answer as though nothing were running there, the record says so and names the kinds of thing it does attach work to."
  },
  /* A kind but no id. The gate is compiled over the CONTEXT ID, so a blank one
     would ask the record about every context at once — which is not a wider
     answer, it is a different question nobody asked. */
  AI_RUNS_NO_CONTEXT_ID: {
    check: "C-36.3",
    where: "src/ai-runs/index.mjs listInContext > is-airuns-context, reached from op=airuns",
    translation: "That request named a kind of thing but not which one. Background work belongs to a particular question or a particular project, and the record answers for the one you are looking at rather than for all of them."
  }
};
var SURFACE_RUN_CHECKS = {
  SURFACE_NO_RUN: {
    check: "C-66.1",
    where: "src/ai-runs/index.mjs #surfacingGate > is-surface-run",
    translation: "An assistant opens a question only inside an investigation it is running, and this one named none that can be read here. The investigation is what records the lens and the purpose the question was opened under, so without one nothing could say why it exists. Nothing was created."
  },
  SURFACE_RUN_NOT_RUNNING: {
    check: "C-66.2",
    where: "src/ai-runs/index.mjs #surfacingGate > is-surface-run",
    translation: "The investigation this question was to be opened inside has ended. A question is read against the conditions of the investigation that opened it, and those stopped being current when it stopped. Nothing was created; a member can start a new investigation."
  },
  SURFACE_NO_BOUND: {
    check: "C-66.3",
    where: "src/ai-runs/index.mjs #surfacingGate > is-surface-run",
    translation: "This investigation was not given a limit on how many questions it may open, so it may open none: an assistant opening questions without a limit fills the record with questions nobody asked for. The limit is set by the member who starts the investigation. Nothing was created."
  },
  SURFACE_BOUND_REACHED: {
    check: "C-66.4",
    where: "src/ai-runs/index.mjs #surfacingGate > is-surface-run",
    translation: "This investigation has already opened as many questions as the member who started it allowed. Nothing was created. The investigation ends at its next step and says which limit stopped it."
  }
};
var AI_RUN_OPEN_CHECKS = {
  AI_RUN_MODE_NOT_DEPLOYED: {
    check: "C-109.1",
    where: "src/ai-runs/index.mjs open > is-airun-open-mode, reached from op=airunopen",
    translation: "Nothing was run, because the kind of work this run asked for is not switched on for this instance yet. Kinds of work are switched on one at a time, each only after the one before it has been checked in real use. Ask for a kind that is switched on, or leave the kind out to run the one that is."
  }
};
var AI_RUNS_CHECKS = Object.freeze({
  ...AI_RUN_OWN_CHECKS,
  ...AI_RUN_ACT_SHAPE_CHECKS,
  ...AI_RUNS_CONTEXT_CHECKS,
  ...SURFACE_RUN_CHECKS,
  ...AI_RUN_OPEN_CHECKS
});

// ../bio-plane/src/observation-log/checks.mjs
var AI_RUN_CHECKS2 = {
  /* §11: "Absence uses D-129's vocabulary — NEVER_LOOKED / LOOKED_ABSENT /
     LOOKED_INDETERMINATE / PRESENT, plus `partial`. Which absence is a stated
     fact, never a diagnostic detail." An entry outside the vocabulary is not a
     weaker statement of absence; it is an ungoverned one. */
  AI_LOG_STATE_UNKNOWN: {
    check: "C-22.1",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That observation does not say which kind of absence it found. The record distinguishes never having looked, having looked and found nothing, having looked and being unable to tell, having found it, and having found part of it."
  },
  /* D-104, and CLAUDE.md states the general rule it instantiates: "our governor
     refusing is not the source failing". An entry recording LOOKED_ABSENT when
     it was OUR pacing that stopped the fetch MANUFACTURES a false absence —
     §11's own word. The governed flag is the fact; a governed observation can
     only be LOOKED_INDETERMINATE, and either definitive claim is refused. */
  AI_LOG_GOVERNED_ABSENCE: {
    check: "C-22.2",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That observation was stopped by our own pacing of the source, not by the source. It can only record that we could not tell \u2014 recording an absence there would be a claim about the world made from a fact about us."
  },
  /* §11's third rule, SWEEP §3's false-coverage hazard: "A client-rendered
     shell capture is LOOKED_INDETERMINATE, never PRESENT". `client-rendered-shell`
     is catalogued with no producer, and an evidentially empty capture that reads
     as coverage is the defect the whole absence vocabulary exists to prevent. */
  AI_LOG_SHELL_PRESENT: {
    check: "C-22.3",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That capture is a page shell with nothing evidential in it, so it cannot be recorded as having found the material. It records that we could not tell."
  },
  /* DEC-8 as amended by DEC-49: a surface may render a translation keyed on a
     code the plane SENT, which only holds if the plane never sends a condition
     nobody has translated. The condition vocabulary is `queuestate.mjs`'s, read
     LIVE rather than copied, and a run naming a kind outside it is a loud
     refusal instead of a silent new vocabulary — queuestate.mjs's own words for
     the same fence one surface over. */
  AI_RUN_CONDITION_UNKNOWN: {
    check: "C-22.4",
    where: "src/observation-log/vocabulary.mjs checkCondition, called from src/ai-runs/index.mjs #aiRunTerminate",
    translation: "The run tried to end on a condition the record has no name for. A condition nobody can read is not an explanation."
  },
  /* §11: "the observation log cannot live in bundle.md, which is written only on
     success — the log's whole value is the failure path." The log is a different
     object from the record, and a different object again from a TRANSCRIPT,
     which DEC-61 puts device-local with a TTL and out of the record store
     altogether. This refusal is the fence AT THE APPEND: an entry offered for a
     bundle is refused, so the separation is enforced at the one write rather
     than asserted about every reader. */
  AI_LOG_NOT_A_BUNDLE: {
    check: "C-22.6",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "The observation log is not part of any published document and cannot be filed into one."
  },
  /* REC-93, 2026-09-14 — THE COLUMN THAT MAY NEVER BE ABSENT.
       `OBSERVATION-LOG-DESIGN.md` §3: *"`authority_kind` is never NULL — a look
       the record cannot say WHY it made is not recorded."* `STORE-AS-CACHE.md`
       carries the rule it descends from, which is RFC 2308's: A NEGATIVE ANSWER
       WITH NO AUTHORITY BEHIND IT IS NOT RECORDABLE. The whole value of this table
       is that an absence becomes a stated fact instead of a retry, and an absence
       nobody can attribute is not a fact anybody can weigh.
  
       IT IS ALSO WHERE §4.6'S PROVISIONAL IS ENFORCED RATHER THAN MERELY WRITTEN
       DOWN, and that is the part worth reading before changing this row. *A
       member's ad hoc search, view or read is not an observation* — because the
       record is what a legal process can reach, and a store that holds what its
       members looked for is a different object from one that holds what a group
       published. What stops that from being written is not a missing writer, which
       any later item could supply without noticing: it is that there is NO
       `authority_kind` A MEMBER'S SEARCH COULD TAKE. The alternative §4.6 declines
       (`authority_kind = member`) is absent from `OBSERVATION_AUTHORITY_KINDS` on
       purpose, so reversing the provisional costs one line in a vocabulary and no
       schema change — which is exactly what §4.6 says reversal should cost, in the
       one direction that stays reversible. A member who wants a search ON the
       record states it as a LEAD (D-194), which carries a name BY CHOICE.
  
       THE TEST IS MEMBERSHIP, NOT PRESENCE. A null check would pass the very value
       the provisional exists to keep out. */
  OBS_AUTHORITY_UNNAMED: {
    check: "C-22.9",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That observation does not say why the look was made. The record keeps what it looked for only when something can be named as the reason \u2014 an investigation, a monitoring sweep, a link in a document, a ratification, or a lead somebody wrote down. A look with no reason behind it is not recorded."
  },
  /* REC-93, 2026-09-14 — THE WARC LESSON, AND THE FALSE-COVERAGE HAZARD FROM
       THE OTHER DIRECTION. `OBSERVATION-LOG-DESIGN.md` §3: *"`PRESENT` with no
       `result_ref` is refused — the WARC lesson: a revisit that omits what it
       refers to silently loses which URL the bytes came from."*
  
       WHY IT IS ITS OWN CODE AND NOT C-22.3's. C-22.3 refuses a PRESENT that the
       EVIDENCE contradicts (a client-rendered shell read as coverage). This refuses
       a PRESENT WITH NO EVIDENCE ATTACHED AT ALL. They are different facts with
       different remedies — one is answered by re-reading the capture honestly, the
       other by naming what the look produced — and DEC-49's rule is that a single
       refusal covering both tells a member nothing they can act on.
  
       IT DOES NOT FIRE ON `authority_kind = run`, AND THAT CARVE-OUT IS A MEASURED
       CONFLICT BETWEEN TWO SECTIONS OF THE DESIGN rather than a convenience. §3
       writes this refusal unconditionally; §4.4 requires every `ai_run_log` row to
       fold into this table and read back through `op=airunlog` UNCHANGED. Both
       cannot hold: `ai_run_log` HAS NO `result_ref` COLUMN, so no row ever written
       to it can satisfy this, and `op=airuntick` accepts a caller-supplied
       `PRESENT` today. Enforcing it over `run` would drop rows out of a coverage
       record, or force the fold to invent a referent — and inventing one to get
       past a gate is the failure CLAUDE.md names by name. The fold is therefore
       admitted under the weaker rule it was written under, every other authority
       carries the refusal, and the carve-out is a DEBT row rather than a shape.
  
       **THE CLOSING CONDITION NAMED HERE WAS FALSE AND IS CORRECTED BY
       MEASUREMENT (REC-100, 2026-09-16).** This row said the carve-out *"closes
       when the run's own writers carry referents (REC-95)"*. REC-95 landed and it
       did NOT close: its three writers write under `authority_kind = derive`, not
       `run` — REC-95 read the tree, found the sentence wrong and recorded that the
       correction was owed to REC-100. Left standing, it would have invited the
       next session to delete one condition and refuse three live writers.
  
       **AND THE REMAINING BLOCKER IS NOT A WRITER AT ALL, AT TWO OF THE THREE.**
       `#aiRunTerminate` and `#aiRunReap` take their state from
       `#aiRunSearchState`, a ROLLUP over the run's whole log — a summary PRESENT
       has nothing single to point at BY CONSTRUCTION, so no writer-side work
       satisfies this refusal and the design owes a ruling on what a terminal
       entry's referent is. The third is `agent-worker`'s `stepLog`, another area's
       path, which composes no referent field while a model may judge `PRESENT`.
       The full reasoning is at the predicate, `checkObservation` in
       `src/observation-log/vocabulary.mjs` (it was `src/airun.mjs`'s until this
       module's extraction); `test/m/observation-log/append.test.mjs` drives it.
  
       **CLOSED 2026-09-18 BY REC-100 (IC-130, D-366).** BOB #14 ruled the rollup
       (`OBSERVATION-LOG-DESIGN.md` §3): a rollup's PRESENT carries `result_kind =
       observation` pointing at the latest non-terminal PRESENT row of its own run,
       computed by the plane. The carve-out is DELETED, so this refusal now fires
       on EVERY authority, and it GAINED AN ARM rather than a new code: an
       `observation` referent that is not an EARLIER PRESENT row of the SAME
       authority is refused here too, with `referent_fault` naming which of four
       ways it failed (`OBSERVATION_REFERENT_FAULTS` in `src/observation-log/vocabulary.mjs`). One code,
       because every fault is this row's condition — a PRESENT whose referent does
       not back it — and a second code behind C-22.10 would be two conditions
       behind one C-number, which `civicos-ui/check-refusal-codes.mjs` refuses.
       Section K of `test/observation-log.test.mjs` drives all of it. */
  OBS_PRESENT_NO_REFERENT: {
    check: "C-22.10",
    where: "src/observation-log/vocabulary.mjs checkObservation, called from src/observation-log/index.mjs observe",
    translation: "That observation says the thing is there without saying what was found. A record that something is present has to point at what it found \u2014 the captured document, the passage, the entity \u2014 or nobody can check it later, and a claim of coverage that cannot be checked is worse than no claim at all."
  },
  /* N118 (LEGACY-TESTS #3 REPORT 10; observation-log R3, K148; T6, legacy-checks) — C-22.1 WAS MINTED FOR A SECOND
     CONDITION. observation-log's `checkObservation` refuses a look that states NEVER_LOOKED (R3: NEVER_LOOKED is the
     absence of a row, never a row; its one exception is a run's terminal rollup, K148) under C-22.1's code, and
     C-22.1's sentence ("does not say which kind of absence it found") is false for it: that look named a kind, the
     one kind a look cannot be. DEC-49 is one code, one condition, so it takes a code of its own rather than C-22.1
     reworded to cover both. Since T10 observation-log mints it: the region `is-never-looked-stored` is marked in
     `checkObservation` (`src/observation-log/vocabulary.mjs`), and C-22.17 is what that site answers (N286). */
  AI_LOG_NEVER_LOOKED_STORED: {
    check: "C-22.17",
    where: "src/observation-log/vocabulary.mjs checkObservation > is-never-looked-stored",
    translation: "That observation says nobody looked, and an observation is the record of a look. Never having looked is what the record says of a subject with no observation at all, so it is not written as one. A look that happened records what it found: nothing, something, part of it, or that it could not tell."
  }
};
var OBSERVATION_CHECK_KEYS = Object.freeze(Object.keys(AI_RUN_CHECKS2));

// ../bio-plane/src/observation-log/vocabulary.mjs
var OBSERVATION_STATES = {
  NEVER_LOOKED: "nobody looked at this level for this subject",
  LOOKED_ABSENT: "we looked and it is positively not there",
  LOOKED_INDETERMINATE: "we looked and could not tell",
  PRESENT: "we looked and it is there",
  partial: "we looked and got part of it (SWH's crawl status; CPDF-5's measured 88% case)"
};
var OBSERVATION_STATE_WORDS = Object.freeze(Object.fromEntries(
  Object.entries(OBSERVATION_STATES).map(([k, v]) => [k, v.replace(/\s*\([^()]*\)\s*$/, "")])
));
var LEAD_LOOK_OUTCOMES = Object.freeze(["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "partial", "PRESENT"]);
var LEAD_VOCABULARY = Object.freeze({ states: OBSERVATION_STATE_WORDS, outcomes: LEAD_LOOK_OUTCOMES });
var WATERMARK_BAND_CAUSE = "watermark_band";
var MISSING_ROW_CAUSES = {
  pre_log: "this capture was extracted BEFORE the observation log carried the content level, so the look is recorded in the readings table and not here. It is not a capture nobody read",
  /* CORRECTED BY REC-107, and the old sentence is quoted in the reason rather than
     deleted, because it is the defect and a reader who meets the new one should be
     able to see what it replaced. It read: *"...so either the log did not yet exist
     for it or a whole-store purge cleared the rows that described it. NEITHER CAN
     BE RULED OUT, and they are different facts."* That is an ENUMERATION of the
     undetermined set, published on every row, and it had TWO members where the live
     set has three: a capture reaches this cause because the `readings` probe MISSED,
     and NOBODY HAVING LOOKED is fully live in that bucket. The sentence excluded it,
     so a member reading the row concluded the capture had been extracted (or purged)
     and left it off the never-extracted worklist. **The set is now stated per row in
     `not_ruled_out` rather than asserted in prose here**, so this sentence describes
     the cause and stops claiming what it cannot. */
  purged: "this capture predates the earliest content-level row this log holds, so the log may not yet have existed for it, a whole-store purge may have cleared the rows that described it, or nobody may have looked at all. THIS ROW'S `not_ruled_out` NAMES THE SET THIS RECORD COULD NOT NARROW, and they are different facts",
  never_looked: "the log existed and was not purged over this capture's lifetime, and the record holds nothing else about its text -- so nobody has tried to extract it. This is the one cause that licenses a positive statement",
  /* D-516 / BOB #33 (2026-09-24 17:58Z) — THE FOURTH WORD, AND IT IS NOT A FOURTH
     SECTION 5.1 CAUSE. Section 5.1 has three causes and this word names none of
     them: it says WHICH TWO OF THEM THE STORED PRECISION LEFT OPEN, and it exists
     because the alternative was the reader PICKING between them. `not_ruled_out`
     is still drawn from `ALL_MISSING_ROW_CAUSES`, which stays at three. */
  [WATERMARK_BAND_CAUSE]: "this capture entered the record in the clock second IMMEDIATELY BEFORE the earliest content-level row this log holds, and `observation_log.at` stores whole seconds -- so the stored watermark denotes a one-second interval and this record cannot tell whether the capture entered before that row or within the same second of it. Those are different facts and this record DOES NOT PICK between them. The uncertainty is in the STORED VALUE and no comparison can remove it. THIS ROW'S `not_ruled_out` NAMES THE SET THIS RECORD COULD NOT NARROW"
};
var MEANING_MISSING_ROW_CAUSES = {
  pre_log: "this subject was looked at BEFORE the observation log carried the meaning level, so the look is recorded in the table that holds what it produced -- a reading, a resolution, a connection -- and not here. It is not a subject nobody looked at",
  /* CORRECTED BY REC-107, the same defect as the content level's above and with one
     member MORE at two of this level's three subject kinds. It read: *"...either the
     log did not yet carry this level for it or a whole-store purge cleared the rows
     that described it. NEITHER CAN BE RULED OUT."* Two members, and the live set is
     three at a capture and three at a reference or an entity for DIFFERENT reasons —
     `never_looked` was missing at all three, and at a reference or an entity the
     PRE-LOG LOOK THAT FOUND NOTHING is live as well, because it left no artifact for
     cause (1) to read. That second widening was published, but as the top-level
     `evidence_one_sided` map a caller had to remember to join to the row. Both now
     sit ON the row, in `not_ruled_out` and `evidence_one_sided`. */
  purged: "this subject entered the record before the earliest meaning-level row this log holds, so the log may not yet have carried this level for it, a whole-store purge may have cleared the rows that described it, or nobody may have looked -- and at a reference or an entity a pre-log look that found NOTHING is live too, having left no artifact. THIS ROW'S `not_ruled_out` NAMES THE SET, and `evidence_one_sided` SAYS WHETHER THIS SUBJECT KIND'S EVIDENCE COULD EVER HAVE NARROWED IT",
  never_looked: "the log carried this level over this subject's whole lifetime and was not purged since, AND the record holds no product of such a look -- so nobody has looked. This is the one cause that licenses a positive statement",
  /* D-516 — THE SAME FOURTH WORD AT THIS LEVEL, and the sentence differs because
     the row it is measured against differs, which is A3b's rule applied to the
     word this item adds rather than inherited by it. */
  [WATERMARK_BAND_CAUSE]: "this subject entered the record in the clock second IMMEDIATELY BEFORE the earliest meaning-level row this log holds, and `observation_log.at` stores whole seconds -- so the stored watermark denotes a one-second interval and this record cannot tell whether the subject entered before that row or within the same second of it. Those are different facts and this record DOES NOT PICK between them; at a reference or an entity a pre-log look that found NOTHING is live in the set as well, having left no artifact. THIS ROW'S `not_ruled_out` NAMES THE SET, and `evidence_one_sided` SAYS WHETHER THIS SUBJECT KIND'S EVIDENCE COULD EVER HAVE NARROWED IT"
};
var ALL_MISSING_ROW_CAUSES = Object.freeze(["pre_log", "purged", "never_looked"]);
var CONDITION_KINDS = Object.freeze({
  "monitoring-recheck-due": "a monitoring recheck or deadline sweep has come due (S-7)",
  "archive-fallback-eligible": "the archive fallback became eligible: three failures or fourteen days (D-104)",
  "capture-session-ttl-expiring": "a capture session is expiring with work outstanding (CAPTURE-SCALING)",
  "source-unreachable-governed": "the source was unreachable because OUR pacing governed it, distinguishably from theirs (D-104)",
  "capture-completed-unattended": "a capture the member walked away from has completed (D-61)",
  "partial-capture-outstanding": "a capture did not finish and subresources are outstanding",
  "text-undetermined": "no text layer, CID fonts, or over the envelope (CPDF, D-121)",
  "client-rendered-shell": "a client-rendered shell was captured and is not citable (D-64)",
  "invitation-spent-or-expired": "an invitation was spent, or expired unused",
  "governor-holding-host": "the per-host governor is holding a host: the capture is PACED, not broken (D-103)",
  "runtime-ceiling-reached": "a CPU or subrequest ceiling was reached (D-54, D-56)",
  /* D-523, LIVE from its landing: store.mjs #conditionsRenderDeferred, derived on read from
     `capture_requests`. BOB #33 RULED 2026-09-24 19:54Z (CLIENT-RENDERED.md, "RULED 2026-09-24 by BOB #33"):
     a render held under a C-83 reason is SHOWN with that reason, and at its request's `expires` it is
     recorded UNDETERMINED and released. A CONDITION and not a FINDING: our own renderer, allowance or
     pacing is what holds it, a fact about our machinery and never about the page. */
  "render-deferred": "a render this instance could not do is held under its C-83 reason until its request expires, and is then recorded undetermined (D-491, D-523) \u2014 LIVE: store.mjs #conditionsRenderDeferred"
});

// ../bio-plane/src/airun.mjs
var AI_RUN_CHECKS3 = Object.freeze({ ...AI_RUN_CHECKS, ...AI_RUN_OWN_CHECKS });
var PLANE_COUNTED_BOUNDS = Object.freeze(["mints", "surfaces"]);
var PLANE_DECIDED_BOUNDS = Object.freeze(["lease"]);
var AI_RUN_STATE_MAX_BYTES = 262144;

// src/subsession.mjs
var REPORT_STATES = {
  NEVER_LOOKED: "nobody looked at this level for this subject",
  LOOKED_ABSENT: "we looked and it is positively not there",
  LOOKED_INDETERMINATE: "we looked and could not tell",
  PRESENT: "we looked and it is there",
  partial: "we looked and got part of it"
};
var FOUND_STATES = /* @__PURE__ */ new Set(["PRESENT", "partial"]);
var LOOKED_STATES = new Set(
  Object.keys(REPORT_STATES).filter((s) => s !== "NEVER_LOOKED")
);
var SUMMARY_MAX = 500;
var ADDRESS_MAX = 200;
var CITATIONS_MAX = 20;
var REPORT_KEYS = {
  level: true,
  /* which of the four this sub-session searched */
  state: true,
  /* D-129 — what the search ESTABLISHED, never a boolean */
  observed_at: false,
  /* the observation-log address, owed by anything that looked */
  summary: false,
  /* the conclusion, in prose, BOUNDED. §14b.2's "the passage" */
  citations: false,
  /* addresses the parent can re-read. NEVER the bytes */
  governed: false,
  /* D-104 — our governor holding a host is a fact about US */
  condition: false
  /* the record's condition vocabulary. Validated by the PLANE */
};
var CITATION_KEYS = { address: true };
var SUBSESSION_OPS = ["meaningrows"];
function refusal(code, detail, extra) {
  return { ok: false, code, reason: code, detail, ...extra || {} };
}
function deepFreeze(value) {
  if (value === null || typeof value !== "object") return value;
  for (const k of Object.keys(value)) deepFreeze(value[k]);
  return Object.freeze(value);
}
function spawnContract({ level, payload } = {}) {
  if (!LEVELS.includes(String(level)))
    return refusal(
      "SPAWN_LEVEL_UNKNOWN",
      `'${String(level)}' is not one of the four levels a run searches: ${LEVELS.join(", ")}. A fan-out that spawned a level nobody declared would be searching somewhere the observation log has no word for.`
    );
  if (payload == null || typeof payload !== "object")
    return refusal(
      "SPAWN_PAYLOAD_MISSING",
      "the plane returned no search-half payload for this run, and this member composes none of its own: a run's conditions are the record's. There is nothing to brief a sub-session with."
    );
  if (Object.prototype.hasOwnProperty.call(payload, "bias"))
    return refusal(
      "SPAWN_PAYLOAD_CARRIES_LENS",
      "the search-half payload arrived carrying the run's bias manifest. \xA714: the search half never receives the lens \u2014 bias never shapes what is captured or searched, only how conclusions are weighed \u2014 and the spawn contract omits it BY CONSTRUCTION, so there should be no field here to read. This member refuses rather than ignoring it: a search half that has been handed the lens has been handed it, and a run that continued could not later prove it did not use it."
    );
  const contract = deepFreeze({
    /* THE ONE THING THAT DIFFERS BETWEEN THE FOUR, and the reason each
       sub-session searches somewhere rather than everywhere. */
    level: String(level),
    run: payload.run ?? null,
    /* BUILT FRESH, not aliased: two contracts sharing one `context` object would
       be two sub-sessions sharing state through the parent's own brief. */
    context: { type: payload.context?.type ?? null, id: payload.context?.id ?? null },
    mode: payload.mode ?? null,
    skill: payload.skill ?? null,
    /* THE BAR TRAVELS AND THE LENS DOES NOT, and that distinction is DEC-54 (a):
       a standard pair tells the search what strength the work must reach, which
       is not the coupling §14 forbids. Both spellings the plane publishes are
       carried — the column verbatim and REC-74's judged block — because a caller
       receiving a bare `null` cannot tell "no bar was in force" from "this reader
       does not publish the fact". */
    standard_pair: payload.standard_pair ?? null,
    /* READ KEY BY KEY, AND THE FIRST DRAFT OF THIS LINE SPREAD THE BLOCK —
       CAUGHT BY THIS ITEM'S OWN KEY-TREE ARM ON ITS FIRST RUN, not by review. A
       spread here would have been the delete-list defect wearing the other
       costume: whatever the plane adds to `#standardForRun`'s return tomorrow
       would ride into a sub-session's brief, which is precisely the property
       "by construction" is supposed to deny. The four keys are the plane's own
       and they are named. */
    standard: payload.standard == null ? null : {
      in_force: payload.standard.in_force ?? null,
      basis: payload.standard.basis ?? null,
      stated: payload.standard.stated ?? null,
      pair: payload.standard.pair ?? null
    },
    /* NO WRITE. See SUBSESSION_OPS. */
    scope: [...SUBSESSION_OPS],
    /* THE RETURN CONTRACT TRAVELS WITH THE BRIEF. A sub-session that is told what
       it may return is a sub-session whose violation is a defect rather than a
       misunderstanding — and the parent validates it on the way back regardless,
       because a contract enforced only by telling somebody about it is a skill
       and not a fence (§14b.4). */
    returns: {
      keys: Object.keys(REPORT_KEYS),
      required: Object.keys(REPORT_KEYS).filter((k) => REPORT_KEYS[k]),
      citation_keys: Object.keys(CITATION_KEYS),
      states: Object.keys(REPORT_STATES),
      summary_max: SUMMARY_MAX,
      citations_max: CITATIONS_MAX,
      address_max: ADDRESS_MAX,
      rule: "return a REPORT with a citation, never documents. The parent re-reads by address."
    }
  });
  return { ok: true, contract };
}
var size = (v) => JSON.stringify(v ?? null).length;
function checkReport(report) {
  if (report == null || typeof report !== "object" || Array.isArray(report))
    return refusal(
      "REPORT_NOT_AN_OBJECT",
      "a sub-session returns a REPORT object. What arrived is not one."
    );
  const unknown = Object.keys(report).filter((k) => !(k in REPORT_KEYS));
  if (unknown.length)
    return refusal(
      "REPORT_UNKNOWN_FIELD",
      `a REPORT carries exactly ${Object.keys(REPORT_KEYS).join(", ")} \u2014 ${unknown.join(", ")} ${unknown.length === 1 ? "is not one of them" : "are not among them"}. \xA714b.1: a sub-session hands back what it FOUND and never the documents; the parent re-reads by address. The contract is an exact key set rather than a list of banned spellings, because a list of spellings goes stale the moment a fourth is written.`,
      { fields: unknown }
    );
  const missing = Object.keys(REPORT_KEYS).filter((k) => REPORT_KEYS[k] && (report[k] == null || report[k] === ""));
  if (missing.length)
    return refusal(
      "REPORT_INCOMPLETE",
      `a REPORT must name ${missing.join(" and ")}: which level was searched and what the search ESTABLISHED are the two things a parent cannot derive for itself.`,
      { fields: missing }
    );
  if (!LEVELS.includes(String(report.level)))
    return refusal(
      "REPORT_LEVEL_UNKNOWN",
      `'${String(report.level)}' is not one of ${LEVELS.join(", ")}. Absence at one level is not evidence of absence at the next, so a report that cannot say which level it is about establishes nothing at any of them.`
    );
  if (!Object.prototype.hasOwnProperty.call(REPORT_STATES, String(report.state)))
    return refusal(
      "REPORT_STATE_UNKNOWN",
      `'${String(report.state)}' is not one of ${Object.keys(REPORT_STATES).join(", ")} (D-129). A report that cannot say what it ESTABLISHED is a report a later reader cannot check.`
    );
  if (LOOKED_STATES.has(String(report.state)) && !(typeof report.observed_at === "string" && report.observed_at.trim() !== ""))
    return refusal(
      "REPORT_UNLOCATED",
      `a '${String(report.state)}' report claims something about the world and must say WHERE the search that establishes it was written in the run's observation log. A claim nobody can locate is a claim nobody can check, which is the whole reason the log exists (\xA711).`
    );
  const cites = report.citations == null ? [] : report.citations;
  if (!Array.isArray(cites))
    return refusal(
      "REPORT_CITATIONS_NOT_A_LIST",
      "`citations` is a list of addresses the parent can re-read. What arrived is not a list."
    );
  if (FOUND_STATES.has(String(report.state)) && cites.length === 0)
    return refusal(
      "REPORT_NO_CITATION",
      `a '${String(report.state)}' report says something IS there and must cite where, by address. \xA714b.1: the contract is a REPORT with a citation and the parent re-reads by address. An absence cites nothing and is not held to this, because there would be nothing to cite.`
    );
  if (cites.length > CITATIONS_MAX)
    return refusal(
      "REPORT_OVER_BOUND",
      `${cites.length} citations exceed the ${CITATIONS_MAX} a single report may carry. A report is a conclusion with addresses, and a list long enough to be the reading itself is the reading.`,
      { bound: "citations", limit: CITATIONS_MAX, got: cites.length }
    );
  for (const c of cites) {
    if (c == null || typeof c !== "object" || Array.isArray(c))
      return refusal(
        "REPORT_CITATION_NOT_AN_ADDRESS",
        "a citation is an object carrying the address the parent re-reads by. What arrived is not one."
      );
    const extra = Object.keys(c).filter((k) => !(k in CITATION_KEYS));
    if (extra.length)
      return refusal(
        "REPORT_CITATION_NOT_AN_ADDRESS",
        `a citation carries exactly ${Object.keys(CITATION_KEYS).join(", ")} \u2014 ${extra.join(", ")} is not part of it. The parent re-reads BY ADDRESS; a citation that carried the content would be the document arriving inside the thing that exists to replace it.`,
        { fields: extra }
      );
    if (!(typeof c.address === "string" && c.address.trim() !== ""))
      return refusal(
        "REPORT_CITATION_NOT_AN_ADDRESS",
        "a citation must carry a non-empty address. An address the parent cannot re-read by is not a citation, it is a claim."
      );
    if (c.address.length > ADDRESS_MAX)
      return refusal(
        "REPORT_OVER_BOUND",
        `an address of ${c.address.length} characters exceeds ${ADDRESS_MAX}. An address is how the parent re-reads; something this long is content wearing an address's field.`,
        { bound: "address", limit: ADDRESS_MAX, got: c.address.length }
      );
  }
  if (report.summary != null && typeof report.summary !== "string")
    return refusal(
      "REPORT_SUMMARY_NOT_PROSE",
      "`summary` is what the sub-session concluded, in prose. A structure here is the reading itself arriving under the field that exists to replace it."
    );
  if (typeof report.summary === "string" && report.summary.length > SUMMARY_MAX)
    return refusal(
      "REPORT_OVER_BOUND",
      `a summary of ${report.summary.length} characters exceeds ${SUMMARY_MAX}. \xA714b.1: a sub-session hands back what it FOUND, never the documents \u2014 and a prose field with no ceiling is where a document arrives when every other door is shut.`,
      { bound: "summary", limit: SUMMARY_MAX, got: report.summary.length }
    );
  if (size(report) > REPORT_MAX_BYTES)
    return refusal(
      "REPORT_OVER_BOUND",
      `this report serialises to ${size(report)} bytes against a ${REPORT_MAX_BYTES}-byte ceiling computed from the contract's own fields. Whatever it is carrying, it is not a conclusion.`,
      { bound: "report", limit: REPORT_MAX_BYTES, got: size(report) }
    );
  return null;
}
var REPORT_MAX_BYTES = SUMMARY_MAX + CITATIONS_MAX * (ADDRESS_MAX + 20) + 400;
function takeReports(returns) {
  const taken = [], refused = [];
  for (const r of Array.isArray(returns) ? returns : []) {
    const bad = checkReport(r);
    if (bad) refused.push({
      level: r && typeof r === "object" ? r.level ?? null : null,
      code: bad.code,
      detail: bad.detail,
      ...bad.fields ? { fields: bad.fields } : {}
    });
    else taken.push(r);
  }
  return { taken, refused };
}
function citedAddresses(reports) {
  const out = [];
  for (const r of Array.isArray(reports) ? reports : [])
    for (const c of Array.isArray(r?.citations) ? r.citations : [])
      if (c && typeof c.address === "string" && c.address && !out.includes(c.address)) out.push(c.address);
  return out.slice(0, CITATIONS_MAX);
}
function documentHoldings(resolved) {
  const documents = /* @__PURE__ */ new Map();
  const unchained = [], undetermined = [];
  const list2 = Array.isArray(resolved) ? resolved : [];
  for (const r of list2) {
    if (!r || typeof r !== "object") continue;
    if (r.refused) {
      undetermined.push({
        citation: r.citation ?? null,
        at: r.refused.at ?? null,
        code: r.refused.code ?? null,
        check: r.refused.check ?? null
      });
      continue;
    }
    const chain = r.chain && typeof r.chain === "object" ? r.chain : null;
    const key = chain && typeof chain.address_norm === "string" ? chain.address_norm : "";
    const held = chain ? Number(chain.total) || 0 : 0;
    if (!key || held < 1) {
      unchained.push({
        citation: r.citation ?? null,
        address: r.address ?? null,
        reason: r.reason ?? "the record holds no captured version at this address"
      });
      continue;
    }
    const versions = Array.isArray(chain.versions) ? chain.versions : [];
    const inChain = new Set(versions.map((v) => v && v.bundle_id).filter(Boolean));
    let doc = documents.get(key);
    if (!doc) {
      doc = {
        address_norm: key,
        versions_held: held,
        truncated: chain.truncated === true,
        cited: [],
        versions_cited: [],
        cited_not_listed: []
      };
      documents.set(key, doc);
    }
    doc.cited.push(r.citation ?? null);
    if (r.bundle) {
      if (inChain.has(r.bundle)) {
        if (!doc.versions_cited.includes(r.bundle)) doc.versions_cited.push(r.bundle);
      } else doc.cited_not_listed.push(r.bundle);
    }
  }
  const docs = [...documents.values()];
  return {
    /* THE COUNT A READER WILL TAKE AS COVERAGE, and it counts DOCUMENTS. */
    documents: docs.length,
    citations: list2.length,
    versions_cited: docs.reduce((n, d) => n + d.versions_cited.length, 0),
    versions_held: docs.reduce((n, d) => n + d.versions_held, 0),
    unchained: unchained.length,
    undetermined: undetermined.length,
    by_document: docs,
    unchained_items: unchained,
    undetermined_items: undetermined,
    identity: "op=versionchain's address_norm \u2014 the record's captured_locators \u22C8 register join (PL-10), never a title, a text or a byte comparison"
  };
}
function holdingsNote(h) {
  if (!h) return "";
  let s = `${h.documents} document(s) held across ${h.citations} citation(s), each counted ONCE with its versions (${h.versions_cited} of ${h.versions_held} held version(s) cited, read through op=versionchain)`;
  if (h.unchained) s += `; ${h.unchained} cited item(s) in no version chain, each counted as itself`;
  if (h.undetermined) s += `; ${h.undetermined} citation(s) whose document is UNDETERMINED \u2014 the plane refused a read, so they are counted as neither a document nor an item`;
  return s;
}

// ../bio-plane/src/tokens.mjs
var PUBLISHED_TOKEN_HASHES = /* @__PURE__ */ new Set([
  // dist/SECRETS.txt of the 0.2.0 test deployment
  // ADMIN_TOKEN
  "34451e5e855bf8d45e93d89fca560e6bd392cf1d0cc6832e3121614d1c68d9db",
  // MEMBER_TOKEN
  "7ecc5d014e25ce4c2e8457424afa0420288742c69182db1be5f4caccd63d4c91",
  // PROBE_TOKEN
  "5910ebbfe7816d9d5e2451012f9db8ac92aaa3f65a8f50da3f7255ab8bdb26ad"
]);
var sha256hex = async (v) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};

// src/cascade.mjs
var CASCADE_ORDER = Object.freeze(["member", "project", "instance"]);
var CASCADE_NO_ACCOUNT = "NO_ACCOUNT_RESOLVED";
var LEVEL_UNSET = "unset";
var LEVEL_REVOKED = "revoked_by_publication";
var LEVEL_AVAILABLE = "available";
async function levelState(entry) {
  const v = entry && typeof entry.token === "string" ? entry.token : "";
  if (v.length === 0) return LEVEL_UNSET;
  if (PUBLISHED_TOKEN_HASHES.has(await sha256hex(v))) return LEVEL_REVOKED;
  return LEVEL_AVAILABLE;
}
async function resolveClaudeCascade(accounts = {}) {
  const levels = [];
  let resolved = null;
  for (const level of CASCADE_ORDER) {
    const entry = accounts?.[level];
    const state = await levelState(entry);
    levels.push({ level, state });
    if (!resolved && state === LEVEL_AVAILABLE)
      resolved = { level, ref: typeof entry.ref === "string" && entry.ref ? entry.ref : null };
  }
  if (resolved) return { available: true, level: resolved.level, ref: resolved.ref, levels };
  return {
    available: false,
    reason: CASCADE_NO_ACCOUNT,
    levels,
    detail: "no Claude account resolved at any level of the cascade (member, then project, then instance). The capability is UNAVAILABLE and this is that statement \u2014 an honest absence, stated, because a silent no-op is indistinguishable from a run that found nothing. Each level's own absence is named beside this."
  };
}
async function cascadeToken(accounts = {}) {
  const st = await resolveClaudeCascade(accounts);
  if (!st.available) return null;
  return { level: st.level, token: accounts[st.level].token };
}

// src/model.mjs
var MODEL_ENDPOINT = "https://api.anthropic.com/v1/messages";
var MODEL_API_VERSION = "2023-06-01";
var DEFAULT_MODEL = "claude-opus-5";
var MODEL_MAX_TOKENS = 16e3;
var DEFAULT_MAX_SEGMENT_BYTES = 1e9;
var SEGMENT_BYTES_SOURCE = "D-611 on M-168: CPU binds at ~7-10 ms per MB re-serialised, ~3 GB under the 30 s default; a segment sends at most a third of that";
var CONVERSATION_MAX_TURNS = 12;
function segmentMeter({ turnsBound, bytesBound }) {
  return { turns: 0, turnsBound, bytes: 0, bytesBound, stopped: null };
}
async function modelCall(token, serialized) {
  let res;
  try {
    res = await fetch(MODEL_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": token, "anthropic-version": MODEL_API_VERSION },
      body: serialized
    });
  } catch (e) {
    return { silent: { detail: String(e && e.message || e).slice(0, 200) } };
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (body == null) return { silent: { detail: `the model API answered ${res.status} with a body that is not JSON` } };
  if (res.status !== 200)
    return { refused: {
      status: res.status,
      type: body?.error?.type ?? null,
      message: String(body?.error?.message ?? "").slice(0, 300)
    } };
  if (body.stop_reason === "refusal")
    return { refused: {
      status: 200,
      type: "refusal",
      message: String(body?.stop_details?.explanation ?? "").slice(0, 300)
    } };
  return { result: body };
}
async function converse({
  token,
  model,
  meter,
  system,
  messages,
  tools,
  finalTool,
  onTool,
  maxTurns = CONVERSATION_MAX_TURNS
}) {
  for (let k = 0; k < maxTurns; k += 1) {
    const serialized = JSON.stringify({
      model,
      max_tokens: MODEL_MAX_TOKENS,
      system,
      messages,
      tools,
      tool_choice: { type: "auto" }
    });
    if (meter.turns >= meter.turnsBound) {
      meter.stopped = "turns";
      return { stopped: "turns" };
    }
    if (meter.bytes + serialized.length > meter.bytesBound) {
      meter.stopped = "bytes";
      return { stopped: "bytes" };
    }
    meter.turns += 1;
    meter.bytes += serialized.length;
    const got = await modelCall(token, serialized);
    if (got.silent || got.refused) return got;
    const content = Array.isArray(got.result.content) ? got.result.content : [];
    messages.push({ role: "assistant", content });
    const uses = content.filter((b) => b && b.type === "tool_use");
    const final = uses.find((u) => u.name === finalTool);
    if (final) {
      messages.push({ role: "user", content: uses.map((u) => ({
        type: "tool_result",
        tool_use_id: u.id,
        content: u === final ? "received" : "not performed: the answer ended this step"
      })) });
      return { answer: final.input && typeof final.input === "object" ? final.input : {} };
    }
    if (!uses.length) {
      messages.push({ role: "user", content: `Answer by calling the \`${finalTool}\` tool.` });
      continue;
    }
    const results = [];
    for (const u of uses) {
      const r = await onTool(u.name, u.input || {});
      if (r && r.halt) return r.halt;
      results.push({
        type: "tool_result",
        tool_use_id: u.id,
        content: JSON.stringify(r?.content ?? null),
        ...r?.error ? { is_error: true } : {}
      });
    }
    messages.push({ role: "user", content: results });
  }
  return { exhausted: true };
}
var STATE_ENUM = ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "PRESENT", "partial"];
var LOOK_FIELDS = (levels) => ({
  level: { type: "string", enum: levels, description: "the level a look at this step was made at, if any" },
  observed: { type: "string", enum: STATE_ENUM, description: "what a look at this step established; omit when nothing was looked at" },
  governed: { type: "boolean" },
  condition: { type: "string" }
});
function judgeTools(levels) {
  const obj = (properties, description, name) => ({
    name,
    description,
    input_schema: { type: "object", properties, additionalProperties: false }
  });
  return [
    obj(
      {
        targets: { type: "array", items: {
          type: "object",
          properties: {
            level: { type: "string", enum: levels },
            url: { type: "string" },
            target: { type: "string" }
          },
          required: ["level"]
        } },
        ...LOOK_FIELDS(levels)
      },
      "plan: what to search for this pass. An internet target names the https address to request.",
      "judge_plan"
    ),
    obj(
      {
        candidates: {
          type: "array",
          items: { type: "object" },
          description: "candidate versions, each the body of op=suggest (see the acts layer)"
        },
        ...LOOK_FIELDS(levels)
      },
      "compose: what the reports mean, and what each version says.",
      "judge_compose"
    ),
    obj(
      { candidates: {
        type: "array",
        items: { type: "object" },
        description: "the candidates that differ in substance from what the record holds"
      } },
      "dedup: whether each reading differs in substance.",
      "judge_dedup"
    ),
    obj(
      { submission: { type: "object", description: "the changed submission; the refused one unchanged drops it" } },
      "adjust: how to answer the plane's refusal.",
      "judge_adjust"
    )
  ];
}
var LOAD_LAYER = (disclosable) => ({
  name: "load_layer",
  description: "load one of the skill pack's disclosed layers when the work needs it",
  input_schema: {
    type: "object",
    properties: { name: { type: "string", enum: disclosable } },
    required: ["name"],
    additionalProperties: false
  }
});
function parentSystem(pack) {
  return "You make the judgements inside the steps of a BIO AI run. The run's control flow is a table you do not decide: at each judged step you are told the step and its facts, and you answer only by calling that step's judge tool. The instructions you work under are this skill pack, version " + String(pack.version) + ".\n\nRESIDENT LAYER:\n" + JSON.stringify(pack.resident) + "\n\nDisclosed layers, loaded with load_layer when your work needs them: " + (pack.resident?.disclosable ?? []).map((d) => `${d.layer} (${d.load_when})`).join("; ");
}
function rowPrompt(step, row, facts) {
  return `STEP ${step}: ${row.does}. You judge: ${row.judged}. Facts: ${JSON.stringify(facts)}. Answer by calling judge_${step}.`;
}
function rowFacts(s, levels) {
  switch (s.step) {
    case "plan":
      return {
        pass: Number(s.pass) + 1,
        max_passes: s.maxPasses,
        mode: s.mode,
        target: s.target ?? null,
        target_basis: s.targetBasis ?? null,
        levels,
        resumed_from: s.resumedFrom
      };
    case "compose":
      return {
        target: s.target ?? null,
        reports: s.reports || [],
        reports_refused: s.reportsRefused || [],
        holdings: s.holdings ?? null,
        candidates: s.candidates || []
      };
    case "dedup":
      return { target: s.target ?? null, candidates: s.candidates || [] };
    case "adjust":
      return { refusal: s.refusal ?? null, refused_submission: s.refusedSubmission ?? null };
    default:
      return {};
  }
}
function subsessionSystem(pack, contract) {
  return "You are a search sub-session of a BIO AI run, searching ONE level and returning a REPORT, never documents: the parent re-reads by address. Search with the meaningrows tool, then call report once.\n\nRESIDENT LAYER:\n" + JSON.stringify(pack.resident) + "\n\nYOUR SPAWN CONTRACT:\n" + JSON.stringify(contract);
}
function subsessionTools(contract) {
  const r = contract.returns || {};
  return [
    {
      name: "meaningrows",
      description: "query the record at meaning grain through the plane (op=meaningrows)",
      input_schema: { type: "object", properties: {
        q: { type: "string" },
        rows: { type: "string", description: "the meaning arm, e.g. leg" },
        limit: { type: "integer", minimum: 1, maximum: 50 }
      }, required: ["rows"], additionalProperties: false }
    },
    {
      name: "report",
      description: String(r.rule || "return a REPORT with a citation, never documents"),
      input_schema: {
        type: "object",
        properties: {
          state: { type: "string", enum: r.states || [] },
          summary: { type: "string", maxLength: r.summary_max || 500 },
          citations: { type: "array", maxItems: r.citations_max || 20, items: {
            type: "object",
            properties: {
              address: { type: "string", maxLength: r.address_max || 200 }
            },
            required: ["address"],
            additionalProperties: false
          } },
          governed: { type: "boolean" },
          condition: { type: "string" }
        },
        required: ["state"],
        additionalProperties: false
      }
    }
  ];
}

// src/index.mjs
var PLANE_ORIGIN = "http://plane";
var DEFAULT_MAX_TURNS_PER_SEGMENT = 120;
var BOUND_SOURCE = "FL-1 2026-08-08 curve, re-checked by D-312 2026-09-25 (M-168): CPU binds, not memory; 120 turns is ~1/8 of the ~1,000 the 30 s CPU default fits at FL-1's payload size";
var AI_TOKEN_SHAPE = /^aik-[0-9a-f]{64}$/;
var json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  /* R47: no `access-control-allow-origin`. Nothing but the plane's service binding reaches this member, and
     a header inviting a browser origin was an invitation to a caller it must never have. */
  headers: { "content-type": "application/json" }
});
var refusal2 = (code, detail, status, extra) => json({ ok: false, reason: code, code, detail, worker: "agent-worker", ...extra || {} }, status);
var SURFACE = {
  run: { method: "POST", mutating: false },
  version: { method: "GET", mutating: false }
};
async function askPlane(env, op, credential, store, query = null, body = null) {
  let url = `${PLANE_ORIGIN}/?op=${op}&store=${encodeURIComponent(store)}&token=${encodeURIComponent(credential)}`;
  for (const [k, v] of Object.entries(query || {}))
    if (v != null && v !== "") url += `&${k}=${encodeURIComponent(String(v))}`;
  let res;
  try {
    res = await env.PLANE.fetch(url, body == null ? void 0 : {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
  } catch (e) {
    return { reached: false, detail: String(e && e.message || e).slice(0, 200) };
  }
  let parsed = null;
  try {
    parsed = await res.json();
  } catch {
    parsed = null;
  }
  if (parsed == null) return { reached: false, detail: `the plane answered ${res.status} with a body this member could not read as JSON` };
  return { reached: true, status: res.status, body: parsed };
}
var MAX_STEPS = 400;
async function driveHarness(env, { runId, store, credential, judgements, maxSteps, cascade = null, model = null }) {
  let calls = 0;
  const call = (op, query, body) => {
    calls += 1;
    return askPlane(env, op, credential, store, query, body);
  };
  const trace = [];
  const refusals = [];
  let logged = 0, submitted = 0, adjusted = 0, verbatimResubmits = 0;
  const logRefused = [];
  let presentUnbacked = 0;
  const runRead = planeAnswer(await call("airun", { run: runId }), "airun");
  if (runRead.silent)
    return { refusal: planeSilent(runRead.silent) };
  if (runRead.refused)
    return { refusal: planeRefused(
      runId,
      store,
      { status: 403, body: runRead.refused.plane ?? null }
    ) };
  const session = runRead.result?.session ?? null;
  if (!session)
    return { refusal: refusal2(
      "NO_SUCH_RUN",
      "the plane holds no run under that id in this namespace, so there is nothing to continue. This member opens no run: a run's identity and its conditions are the plane's, and a member that could open one would be a machine deciding what it was formed under.",
      404,
      { run_id: runId }
    ) };
  const recordedPayer = session.principal?.claude ?? null;
  if (cascade?.available && recordedPayer !== cascade.level)
    return { refusal: refusal2(
      "RUN_NAMES_A_DIFFERENT_PAYER",
      `the run's own record says the ${JSON.stringify(recordedPayer)} level of the Claude-account cascade pays for it, but the material handed to this segment resolves to the ${JSON.stringify(cascade.level)} level. Those are two different payers and this member will not spend under one while the record names the other. Either the launch recorded the wrong level or this segment was handed the wrong accounts; both are the caller's to fix.`,
      409,
      { run_id: runId, recorded: recordedPayer, resolved: cascade.level, levels: cascade.levels }
    ) };
  if (model) {
    const pub = planeAnswer(await call("affordances"), "affordances");
    if (pub.silent) return { refusal: planeSilent(pub.silent) };
    if (pub.refused)
      return { refusal: planeRefused(runId, store, { status: 403, body: pub.refused.plane ?? null }) };
    const pack = publishedPack(pub.result);
    const recordedSkill = session.principal?.skill ?? null;
    if (!pack.ok || recordedSkill !== pack.pack.version)
      return { refusal: refusal2(
        "SKILL_VERSION_MISMATCH",
        (pack.ok ? "the run's record says it runs under one skill pack and the pack the plane publishes is another, so its model would be instructed by words the record does not name." : `the plane published no skill pack this member can instruct a model with, so the pack's version is UNDETERMINED and cannot be held to the one the run recorded (${pack.why}).`) + " No turn was taken; the run is resumable once the two agree.",
        409,
        {
          run_id: runId,
          recorded: recordedSkill,
          rendered: pack.ok ? pack.pack.version : null,
          ...pack.ok ? {} : { rendered_basis: "UNDETERMINED", pack_absent: pack.why }
        }
      ) };
    const { pack: held } = pack;
    model.pack = held;
    model.messages = [];
    model.system = parentSystem(held);
    model.tools = [LOAD_LAYER(Object.keys(held.disclosed || {})), ...judgeTools(LEVELS)];
  }
  const logRead = planeAnswer(await call("airunlog", { run: runId }), "airunlog");
  if (logRead.silent) return { refusal: planeSilent(logRead.silent) };
  if (logRead.refused)
    return { refusal: planeRefused(
      runId,
      store,
      { status: 403, body: logRead.refused.plane ?? null }
    ) };
  const priorLog = logRead.result ?? {};
  const resumedFrom = Array.isArray(priorLog.entries) ? priorLog.entries.length : 0;
  const logSeq = {
    next: () => priorLog.truncated === true ? null : resumedFrom + logged + 1,
    landed: () => {
      logged += 1;
    },
    refused: (named) => {
      logRefused.push(named);
      refusals.push(named);
    }
  };
  const budget = {};
  for (const b of Array.isArray(session.budget) ? session.budget : [])
    budget[String(b.bound)] = { allowed: Number(b.allowed) || 0, consumed: Number(b.consumed) || 0 };
  const seeded = runContextTarget(session);
  let state = {
    step: FIRST_STEP,
    mode: session.mode,
    target: seeded.target,
    targetBasis: seeded.basis,
    pass: 0,
    maxPasses: Number(session.max_passes) > 0 ? Number(session.max_passes) : DEFAULT_MAX_PASSES,
    resumedFrom,
    budget,
    targets: [],
    reports: [],
    candidates: [],
    queue: [],
    refusal: null,
    adjusted: false,
    submission: null,
    level: null,
    observed: null,
    governed: false,
    condition: null
  };
  const resumed = resumeFrom(session.state ?? null);
  state = resumed.at ? { ...state, ...resumed.state, resumeAt: resumed.at, resumeBasis: null } : { ...state, resumeAt: null, resumeBasis: resumed.basis };
  let jx = 0;
  let ended = null, steps = 0, segmentStopped = null;
  while (steps < maxSteps) {
    steps += 1;
    const callsAtStepStart = calls;
    const row = CONTROL_FLOW[state.step];
    let judgement;
    if (row && row.judged && model && state.step !== "collect") {
      model.messages.push({ role: "user", content: rowPrompt(state.step, row, rowFacts(state, LEVELS)) });
      const got = await converse({
        token: model.token,
        model: model.id,
        meter: model.meter,
        system: model.system,
        messages: model.messages,
        tools: model.tools,
        finalTool: `judge_${state.step}`,
        onTool: async (name, input) => {
          if (name === "load_layer") {
            const layer = model.pack.disclosed?.[String(input.name)];
            return layer ? { content: layer } : { content: `no disclosed layer '${String(input.name)}'`, error: true };
          }
          return { content: `this step is judged by judge_${state.step}`, error: true };
        }
      });
      if (got.silent) return { refusal: modelSilent(got.silent, runId) };
      if (got.refused) return { refusal: modelRefused(got.refused, runId) };
      if (got.stopped) {
        segmentStopped = got.stopped;
        break;
      }
      if (got.answer) judgement = got.answer;
    } else if (row && row.judged && !model && jx < judgements.length) {
      judgement = judgements[jx];
      jx += 1;
    }
    if (judgement !== void 0) {
      const applied = applyJudgement(state, judgement);
      if (!applied.ok)
        return { refusal: refusal2(
          "JUDGEMENT_OVERREACH",
          applied.detail,
          400,
          { step: state.step, fields: applied.overreach }
        ) };
      state = applied.state;
    }
    const work = await performStep(call, state, runId, model, logSeq);
    if (work.silent) return { refusal: planeSilent(work.silent) };
    if (work.model?.silent) return { refusal: modelSilent(work.model.silent, runId) };
    if (work.model?.refused) return { refusal: modelRefused(work.model.refused, runId) };
    if (work.stopped) {
      segmentStopped = work.stopped;
      break;
    }
    if (work.contract)
      return { refusal: refusal2(
        work.contract.code,
        work.contract.detail,
        502,
        { level: work.level ?? null, run_id: runId }
      ) };
    if (work.planeRefusal)
      return { refusal: planeRefused(
        runId,
        store,
        { status: 403, body: work.planeRefusal.plane ?? null }
      ) };
    if (work.refused) refusals.push(...Array.isArray(work.refused) ? work.refused : [work.refused]);
    state = work.state;
    if (work.submitted) submitted += 1;
    if (work.verbatim) verbatimResubmits += 1;
    if (state.step === "adjust" && state.adjusted) adjusted += 1;
    const decision = nextStep(state);
    trace.push({
      step: state.step,
      to: decision.step,
      why: decision.why,
      ...work.note ? { note: work.note } : {}
    });
    const spentThisStep = calls - callsAtStepStart + 1;
    const consume = { ...work.consume || {}, runtime: spentThisStep };
    const entry = stepLog(state, decision);
    if (entry && state.observed === "PRESENT") presentUnbacked += 1;
    const after = advance(state, decision);
    let published = null;
    if (CONTROL_FLOW.resume.to.includes(after.step)) {
      published = publishableState(after, AI_RUN_STATE_MAX_BYTES);
      if (published.restarted) {
        const last = trace[trace.length - 1];
        last.note = (last.note ? `${last.note}; ` : "") + `the table's state is ${published.restarted.bytes} bytes, over the ${published.restarted.limit} a run's state may hold (ai-runs R45), so this tick publishes the pass restarted at '${published.restarted.at}' and a later segment re-does it rather than resume from a state the record refuses`;
      }
    }
    const tick = await call(
      "airuntick",
      null,
      { run: runId, log: entry ? [entry] : [], consume, ...published ? { state: published.state } : {} }
    );
    if (!tick.reached) return { refusal: planeSilent(tick) };
    const tickAnswer = planeAnswer(tick, "airuntick");
    if (tickAnswer.refused) {
      refusals.push({
        at: "airuntick",
        code: tickAnswer.refused.code,
        check: tickAnswer.refused.check,
        plane: tickAnswer.refused.plane
      });
    } else {
      const t = tick.body.result ?? tick.body;
      const refusedEntries = Array.isArray(t?.refused) ? t.refused : [];
      const appendedNow = t?.appended != null && Number.isFinite(Number(t.appended)) ? Number(t.appended) : t?.ticked === false ? 0 : Math.max(0, (entry ? 1 : 0) - refusedEntries.length);
      logged += appendedNow;
      for (const r of refusedEntries) {
        const named = {
          at: "airuntick.log",
          step: state.step,
          to: decision.step,
          code: r?.code ?? r?.reason ?? null,
          check: r?.check ?? null,
          ...r?.referent_fault ? { referent_fault: r.referent_fault } : {},
          plane: r ?? null
        };
        logRefused.push(named);
        refusals.push(named);
      }
      state = { ...state, budget: { ...state.budget } };
      for (const [k, v] of Object.entries(consume))
        if (state.budget[k]) state.budget[k] = { ...state.budget[k], consumed: state.budget[k].consumed + Number(v) };
      if (t && t.ended) {
        ended = {
          bound: t.ended.bound ?? null,
          condition: t.ended.condition ?? null,
          by: "the plane's own exit"
        };
        break;
      }
    }
    const look = { level: null, observed: null, governed: false, condition: null };
    state = { ...state, ...look };
    if (decision.step === "close") {
      const closed = planeAnswer(
        await call("airunclose", null, { run: runId, bound: decision.bound || "completed" }),
        "airunclose"
      );
      if (closed.silent) return { refusal: planeSilent(closed.silent) };
      if (closed.refused) {
        refusals.push(closed.refused);
        state = { ...state, step: "close" };
        break;
      }
      ended = { bound: decision.bound || "completed", by: "the table" };
      state = { ...state, step: "close" };
      break;
    }
    state = { ...after, budget: state.budget, ...look };
  }
  return {
    mode: state.mode,
    trace,
    passes: state.pass,
    ended,
    logged,
    submitted,
    /* FL-11: the question this run's readings default to, and WHY — published so a reader can check it
       against the run's context rather than take it on this member's word. */
    target: { id: state.target ?? null, basis: state.targetBasis ?? null },
    refusals,
    adjusted,
    verbatimResubmits,
    resumedFrom,
    logRefused,
    presentUnbacked,
    /* FL-5's FACTS, PUBLISHED RATHER THAN HELD. FL-3 computed the fence's answer
       into a local nobody could read and asserted it by grepping a note — which
       measured nothing (see the fan-out step). What a suite, and a later reader,
       actually need is the object a sub-session WAS HANDED. So the contracts
       themselves go on the wire: whatever is true of the spawn contract can then
       be read off the answer rather than taken on the member's word. They are the
       LAST pass's, and the field says so. */
    fanout: {
      of_pass: state.pass,
      levels: LEVELS,
      scope: SUBSESSION_OPS,
      contracts: state.contracts || []
    },
    reportsTaken: (state.reports || []).length,
    /* NAMED, NEVER A COUNT ALONE. A refused return is a component of this system
       breaking its contract; a bare number would say it happened and not what. */
    reportsRefused: state.reportsRefused || [],
    citationsReread: state.rereads || 0,
    /* D-220: the LAST pass's holdings, like `fanout`. Null when no `collect` ran,
       which is "nothing was counted", not "nothing is held". */
    holdings: state.holdings ?? null,
    budget: BUDGET_BOUNDS.map((b) => ({ bound: b, ...state.budget[b] || { allowed: 0, consumed: 0 } })),
    segmentStopped
  };
}
function planeAnswer(asked, at) {
  if (!asked.reached) return { at, silent: asked };
  const envelope = asked.body && typeof asked.body === "object" ? asked.body : {};
  const inner = envelope.result && typeof envelope.result === "object" && !Array.isArray(envelope.result) ? envelope.result : null;
  const said = inner && "ok" in inner ? inner : envelope;
  if (asked.status !== 200 || envelope.ok !== true || said.ok === false)
    return { at, refused: {
      at,
      code: said.reason ?? said.code ?? envelope.reason ?? envelope.code ?? null,
      check: said.check ?? envelope.check ?? null,
      plane: asked.body ?? null
    } };
  return { at, result: inner ?? envelope };
}
function publishedPack(answer) {
  const a = answer && typeof answer === "object" ? answer : {};
  const p = a.pack;
  if (p && typeof p === "object" && typeof p.version === "string" && p.version && p.resident && typeof p.resident === "object" && p.disclosed && typeof p.disclosed === "object")
    return { ok: true, pack: p };
  if (typeof a.pack_absent === "string" && a.pack_absent) return { ok: false, why: a.pack_absent.slice(0, 300) };
  return { ok: false, why: p == null ? "the answer carries no pack" : "the answer's pack has no version, resident layer or disclosed layers" };
}
var MEANING_OP = "meaningrows";
var meaningRead = async (call, { q = "", rows, limit = 50, ids = null } = {}) => planeAnswer(await call(MEANING_OP, { q, rows, limit }, ids ? { ids } : null), MEANING_OP);
async function performStep(call, state, runId, model = null, logSeq = null) {
  const out = { state, consume: {}, note: null };
  switch (state.step) {
    case "fanout": {
      const contracts = [];
      for (const level of LEVELS) {
        const p = planeAnswer(await call("airunspawn", { run: runId, half: "search" }), "airunspawn");
        if (p.silent) return { silent: p.silent };
        if (p.refused) return { planeRefusal: p.refused, level };
        const payload = (p.result ?? {}).payload ?? null;
        const made = spawnContract({ level, payload });
        if (!made.ok) return { contract: made, level };
        contracts.push(made.contract);
      }
      out.consume.subsessions = LEVELS.length;
      out.note = `${contracts.length} sub-session contract(s) composed, one per level, each read-only (${SUBSESSION_OPS.join(", ")}) and with no field for the lens to arrive in`;
      out.state = { ...state, contracts };
      if (model) {
        const ran = await runSubsessions(call, out.state, runId, model, logSeq, contracts);
        if (ran.silent || ran.model || ran.stopped) return ran;
        out.state = {
          ...out.state,
          reports: ran.reports,
          reportsRefused: [...out.state.reportsRefused || [], ...ran.refused]
        };
        out.note += `; ${ran.reports.length} sub-session(s) reported, ${ran.refused.length} returned no report`;
      }
      const fetches = (state.targets || []).filter((t) => t && t.level === "internet");
      const acqRefused = [];
      for (const t of fetches) {
        const r = planeAnswer(await call(
          "capturerequest",
          null,
          { run: runId, target: t.target ?? state.target ?? null, address: t.url ?? null }
        ), "capturerequest");
        if (r.silent) return { silent: r.silent };
        if (r.refused) acqRefused.push(r.refused);
      }
      if (acqRefused.length) out.refused = acqRefused;
      if (fetches.length) out.consume.fetches = fetches.length;
      return out;
    }
    case "collect": {
      const { taken, refused } = takeReports(state.reports);
      const addresses = citedAddresses(taken);
      let reread = 0;
      const rereadRefused = [];
      for (const address of addresses) {
        const got = await meaningRead(call, { rows: MEANING_ARM, limit: 1, ids: [address] });
        if (got.silent) return { silent: got.silent };
        if (got.refused) {
          rereadRefused.push(got.refused);
          continue;
        }
        reread += 1;
      }
      const resolved = [];
      for (const address of addresses) {
        const found = planeAnswer(await call(
          "search",
          { q: `id:"${address.replace(/"/g, "")}"`, limit: 1, facets: "none" }
        ), "search");
        if (found.silent) return { silent: found.silent };
        if (found.refused) {
          rereadRefused.push(found.refused);
          resolved.push({ citation: address, refused: found.refused });
          continue;
        }
        const hit = (Array.isArray(found.result?.hits) ? found.result.hits : []).find((h) => h && h.bundle_id === address) || null;
        if (hit && !(typeof hit.source_locator === "string" && hit.source_locator.trim())) {
          resolved.push({
            citation: address,
            bundle: address,
            address: null,
            chain: null,
            reason: "the cited bundle names no source address, so no version chain can hold it"
          });
          continue;
        }
        const target = hit ? hit.source_locator.trim() : address;
        const chain = planeAnswer(await call("versionchain", { address: target, limit: 1e3 }), "versionchain");
        if (chain.silent) return { silent: chain.silent };
        if (chain.refused) {
          rereadRefused.push(chain.refused);
          resolved.push({ citation: address, refused: chain.refused });
          continue;
        }
        resolved.push({ citation: address, bundle: hit ? address : null, address: target, chain: chain.result });
      }
      const holdings = documentHoldings(resolved);
      if (rereadRefused.length) out.refused = rereadRefused;
      out.note = `${taken.length} REPORT(s) taken, ${refused.length} REFUSED; ${reread} of ${addresses.length} citation(s) re-read BY ADDRESS` + (rereadRefused.length ? `, and ${rereadRefused.length} read(s) could NOT be made \u2014 the plane refused '${String(rereadRefused[0].code ?? "?")}', so what they would have answered is UNREAD rather than empty` : "") + `; ${holdingsNote(holdings)}. No document was returned by a sub-session and none was loaded`;
      out.state = {
        ...state,
        reports: taken,
        rereads: (state.rereads || 0) + reread,
        reportsRefused: [...state.reportsRefused || [], ...refused],
        holdings
      };
      return out;
    }
    case "compose": {
      const read = await meaningRead(call, { q: state.q || "", rows: MEANING_ARM, limit: 50 });
      if (read.silent) return { silent: read.silent };
      const empties = emptyLevelCandidates(state, state.target ?? null);
      const candidates = [...state.candidates || [], ...empties];
      let said;
      if (read.refused) {
        out.refused = read.refused;
        said = `the meaning layer was NOT READ \u2014 the plane refused '${String(read.refused.code ?? "?")}'` + (read.refused.check ? ` (${read.refused.check})` : "") + `, so this run knows NOTHING about meaning-grain rows for this query and does not report zero of them`;
      } else if (!Array.isArray(read.result?.rows)) {
        said = "how many meaning-grain row(s) the record holds for this query is UNDETERMINED \u2014 the plane answered without a rows collection this member could read";
      } else {
        said = `${read.result.rows.length} meaning-grain row(s) queried at the '${MEANING_ARM}' grain`;
      }
      out.note = `${said}; no document was loaded. ${empties.length} level(s) observed EMPTY and written down as \xA79's kind`;
      out.state = { ...state, candidates };
      return out;
    }
    case "dedup": {
      const held = planeAnswer(
        await call("basisversions", { id: state.target || "", limit: 50 }),
        "basisversions"
      );
      if (held.silent) return { silent: held.silent };
      const proposed = (state.candidates || []).length;
      if (held.refused) {
        out.refused = held.refused;
        out.note = `the record's own versions could NOT be read \u2014 the plane refused '${String(held.refused.code ?? "?")}'` + (held.refused.check ? ` (${held.refused.check})` : "") + `, so this run compared its ${proposed} candidate(s) against NOTHING and says so rather than reporting them all as new. PL-3's check 3 is still the fence`;
        out.state = { ...state, queue: [...state.candidates || []] };
        return out;
      }
      const body = held.result ?? {};
      const names = new Set((Array.isArray(body.versions) ? body.versions : []).map((v) => String(v && v.name ? v.name : "")).filter(Boolean));
      const aimedHere = (c) => (c.target ?? state.target ?? null) === (state.target ?? null);
      const elsewhere = (state.candidates || []).filter((c) => c && !aimedHere(c)).length;
      const queue = (state.candidates || []).filter((c) => c && (!aimedHere(c) || !names.has(String(c.name ?? ""))));
      out.note = `${proposed} candidate(s) compared against ${names.size} on the record; ${queue.length} survived` + (elsewhere ? `; ${elsewhere} named a question other than the run's target and were NOT compared` : "");
      out.state = { ...state, queue };
      return out;
    }
    case "submit": {
      const queue = [...state.queue || []];
      const candidate = queue.shift();
      if (!candidate) return out;
      const res = await call(
        "suggest",
        null,
        { ...candidate, target: candidate.target ?? state.target ?? null, run: runId }
      );
      if (!res.reached) return { silent: res };
      const answer = res.body?.result ?? res.body ?? {};
      if (res.status === 200 && res.body?.ok === true && answer.ok !== false && answer.wrote !== false) {
        out.submitted = true;
        out.note = `wrote '${String(candidate.name ?? "")}'`;
        out.state = { ...state, queue, refusal: null, submission: candidate };
        return out;
      }
      if (answer.repeated === true) out.verbatim = true;
      out.refused = {
        at: "suggest",
        code: answer.code ?? answer.reason ?? null,
        repeated: answer.repeated === true,
        repeats: answer.repeats ?? 0,
        /* THE PLANE'S WORDS, UNCHANGED. This member re-words no
           refusal: the code, the C-number and the DEC-49 canned
           translation are the plane's. */
        plane: answer
      };
      out.note = `refused '${String(answer.code ?? answer.reason ?? "?")}' \u2014 routing to ADJUST, never to a retry`;
      out.state = { ...state, queue, refusal: answer, submission: candidate };
      return out;
    }
    case "adjust": {
      const changed = adjustedFrom(state.refusedSubmission ?? null, state.submission ?? null);
      const queue = [...state.queue || []];
      if (changed) queue.unshift(state.submission);
      out.note = changed ? "the submission was changed in answer to the refusal" : "the refusal could not be answered by changing the submission; the candidate is dropped";
      out.state = { ...state, adjusted: changed, queue };
      return out;
    }
    default:
      return out;
  }
}
async function runSubsessions(call, state, runId, model, logSeq, contracts) {
  const reports = [], refused = [];
  for (const contract of contracts) {
    const got = await converse({
      token: model.token,
      model: model.id,
      meter: model.meter,
      system: subsessionSystem(model.pack, contract),
      messages: [{ role: "user", content: `Search the ${contract.level} level for the run's question, then report.` }],
      tools: subsessionTools(contract),
      finalTool: "report",
      onTool: async (name, input) => {
        if (!contract.scope.includes(name))
          return { content: `'${String(name)}' is not in this sub-session's scope (${contract.scope.join(", ")})`, error: true };
        const lim = Math.min(50, Math.max(1, Math.floor(Number(input.limit)) || 20));
        const r = await meaningRead(call, { q: String(input.q ?? ""), rows: String(input.rows ?? ""), limit: lim });
        if (r.silent) return { halt: { planeSilent: r.silent } };
        if (r.refused) return { content: r.refused.plane ?? { code: r.refused.code }, error: true };
        return { content: r.result };
      }
    });
    if (got.planeSilent) return { silent: got.planeSilent };
    if (got.silent || got.refused) return { model: got };
    if (got.stopped) return { stopped: got.stopped };
    if (!got.answer) {
      refused.push({
        level: contract.level,
        code: "SUBSESSION_NO_REPORT",
        detail: "the sub-session ended without calling report; its level is UNDETERMINED, not empty"
      });
      continue;
    }
    const { observed_at: _ignored, ...said } = got.answer;
    const report = { ...said, level: contract.level };
    if (LOOKED_STATES.has(String(report.state))) {
      const seq = logSeq ? logSeq.next() : null;
      const entry = {
        level: contract.level,
        subject: `sub-session ${contract.level} -> report`,
        state: report.state === "PRESENT" ? "LOOKED_INDETERMINATE" : report.state,
        governed: report.governed === true,
        condition: typeof report.condition === "string" ? report.condition : null,
        terminal: false,
        bound: null,
        detail: String(typeof report.summary === "string" ? report.summary : "").slice(0, 500)
      };
      const tick = planeAnswer(await call("airuntick", null, { run: runId, log: [entry] }), "airuntick");
      if (tick.silent) return { silent: tick.silent };
      const t = tick.result ?? {};
      const bad = Array.isArray(t.refused) ? t.refused : [];
      if (tick.refused || bad.length) {
        for (const r of tick.refused ? [tick.refused] : bad)
          logSeq?.refused({
            at: "airuntick.log",
            step: "fanout",
            to: "collect",
            level: contract.level,
            code: r?.code ?? r?.reason ?? null,
            check: r?.check ?? null,
            plane: r?.plane ?? r ?? null
          });
      } else {
        logSeq?.landed();
        if (seq != null) report.observed_at = `log:${seq}`;
      }
    }
    reports.push(report);
  }
  return { reports, refused };
}
var modelSilent = (silent, runId) => refusal2(
  "MODEL_SILENT",
  "the model API could not be reached, so no judgement was made at this step and the segment stopped. The run is resumable; nothing the table did before this step is lost.",
  502,
  { run_id: runId, detail_from_model: silent?.detail ?? null }
);
var modelRefused = (refused, runId) => refusal2(
  "MODEL_REFUSED",
  "the model API refused the call, or the model declined, so no judgement was made at this step and the segment stopped. The API's own error type and status are beside this, unchanged.",
  502,
  {
    run_id: runId,
    model_status: refused?.status ?? null,
    model_error: refused?.type ?? null,
    model_message: refused?.message ?? null
  }
);
var planeSilent = (asked) => refusal2(
  "PLANE_SILENT",
  "the plane could not be reached, so this member knows nothing about the record and says so. A failure to answer is not an answer, and reporting one as the other would make this member's own fault read as a fact about the record.",
  502,
  { detail_from_binding: asked.detail }
);
var planeRefused = (runId, store, asked) => json({
  ok: false,
  reason: "PLANE_REFUSED",
  worker: "agent-worker",
  run_id: runId,
  store,
  detail: "the plane refused this member's call under the credential it was handed. Its refusal is passed through exactly as the plane worded it.",
  plane_status: asked.status,
  plane: asked.body
}, 403);
var DEFAULT_MAX_PASSES = 3;
async function handleRun(req, env) {
  if (typeof env.PLANE?.fetch !== "function")
    return refusal2(
      "PLANE_NOT_CONFIGURED",
      "this member reaches the record only through the plane service binding, and the binding is absent. It holds no store binding and no credential of its own, so with no plane there is nothing it can do and nothing it could pretend to have done.",
      503
    );
  const body = await req.json().catch(() => null);
  if (body == null)
    return refusal2("BAD_BODY", "the request body could not be read as JSON.", 400);
  const runId = typeof body.run_id === "string" ? body.run_id : "";
  const store = typeof body.store === "string" ? body.store : "";
  const credential = typeof body.credential === "string" ? body.credential : "";
  if (!runId || runId.length > 200)
    return refusal2(
      "BAD_RUN_ID",
      "a run is identified by the plane and this member mints no identity of its own; the caller must say which run this segment belongs to.",
      400
    );
  if (typeof body.store !== "string")
    return refusal2(
      "BAD_STORE",
      "a run happens inside one namespace and this member guesses none: the caller must say which. A default namespace here would let a run touch the real record while its caller believed it was working in a scratch one.",
      400
    );
  if (!NAMESPACES.includes(store))
    return refusal2(
      "NAMESPACE_UNKNOWN",
      "a run names the namespace it works in, and no namespace by that name exists on any instance this member can be bound to, so nothing was read or changed. There are two: the record itself and a scratch area kept apart for testing, and the name must match one of them exactly; they are listed beside this message.",
      400,
      { asked: store.slice(0, 80), namespaces: [...NAMESPACES] }
    );
  if (!credential)
    return refusal2(
      "NO_CREDENTIAL",
      "this member holds no credential of its own and cannot act except under one it is handed. There is no fallback identity here by design: a worker that could act unattended would be acting as nobody, and nothing it did could be attributed.",
      401
    );
  if (!AI_TOKEN_SHAPE.test(credential))
    return refusal2(
      "BAD_CREDENTIAL_SHAPE",
      "the credential handed to this member is not shaped like one this plane issues. Whether a well-shaped credential is live, withdrawn, or scoped to this work is the plane's judgement and is never made here.",
      400
    );
  const accountsSupplied = body.claude_accounts != null;
  if (accountsSupplied && (typeof body.claude_accounts !== "object" || Array.isArray(body.claude_accounts)))
    return refusal2(
      "BAD_CLAUDE_ACCOUNTS",
      "claude_accounts, when present, is an object keyed by cascade level (member, project, instance), each entry { token, ref }. This member judges only what it is handed.",
      400
    );
  const cascade = accountsSupplied ? await resolveClaudeCascade(body.claude_accounts) : null;
  if (cascade && !cascade.available)
    return refusal2(
      CASCADE_NO_ACCOUNT,
      cascade.detail,
      409,
      { capability: "unavailable", levels: cascade.levels }
    );
  const bound = Number(env.MAX_TURNS_PER_SEGMENT) > 0 ? Number(env.MAX_TURNS_PER_SEGMENT) : DEFAULT_MAX_TURNS_PER_SEGMENT;
  const requested = body.turns == null ? bound : Number(body.turns);
  if (!Number.isFinite(requested) || requested < 1)
    return refusal2("BAD_TURNS", "turns must be a positive number of model turns for this segment.", 400);
  if (requested > bound)
    return refusal2(
      "SEGMENT_OVER_BOUND",
      `a segment is bounded at ${bound} model turns and ${requested} were asked for. The bound is not a policy choice: it keeps the segment clear of the isolate's CPU ceiling, measured (M-168), which a longer segment would meet. Split the run across segments \u2014 resuming is what segments are for.`,
      400,
      { turns_requested: requested, turns_bound: bound, bound_source: BOUND_SOURCE }
    );
  const asked = await askPlane(env, "whoami", credential, store);
  if (!asked.reached)
    return refusal2(
      "PLANE_SILENT",
      "the plane could not be reached, so this member knows nothing about the credential it was handed and says so. A failure to answer is not an answer, and reporting one as the other would make this member's own fault read as a fact about the record.",
      502,
      { detail_from_binding: asked.detail }
    );
  if (asked.status !== 200 || asked.body?.ok !== true)
    return json({
      ok: false,
      reason: "PLANE_REFUSED",
      worker: "agent-worker",
      run_id: runId,
      store,
      detail: "the plane refused this member's call under the credential it was handed. Its refusal is passed through exactly as the plane worded it.",
      plane_status: asked.status,
      plane: asked.body
    }, 403);
  const bytesBound = Number(env.MAX_SEGMENT_BYTES) > 0 ? Number(env.MAX_SEGMENT_BYTES) : DEFAULT_MAX_SEGMENT_BYTES;
  const meter = segmentMeter({ turnsBound: requested, bytesBound });
  const modelMode = !!(cascade && cascade.available) && !Array.isArray(body.judgements);
  const model = modelMode ? { token: (await cascadeToken(body.claude_accounts)).token, id: env.MODEL || DEFAULT_MODEL, meter } : null;
  const drive = await driveHarness(env, {
    runId,
    store,
    credential,
    cascade,
    model,
    judgements: Array.isArray(body.judgements) ? body.judgements : [],
    maxSteps: Number(body.max_steps) > 0 ? Math.min(Number(body.max_steps), MAX_STEPS) : MAX_STEPS
  });
  if (drive.refusal) return drive.refusal;
  return json({
    ok: true,
    run_id: runId,
    store,
    /* WHAT WAS ACTUALLY DONE, NAMED — FL-2's rule, kept and made more specific.
       An answer that did not say which half ran would be indistinguishable from
       a run that executed model turns and found nothing, and those are
       different claims. `stage: "harness"` says the deterministic table ran;
       `turns_run: 0` and `judgement_source` say the model half did not. */
    stage: "harness",
    turns_run: meter.turns,
    judgement_source: modelMode ? "model" : "supplied",
    /* CORRECTED AT FL-6, never exempted: this note used to say the model
       account "is FL-6's cascade and is not resolved here". The cascade IS
       resolved here now, and the honest remainder is different — the account
       is resolved and NAMED, and what still does not happen is a MODEL TURN,
       whose sizing is D-218's measurement and not this item's. */
    judgement_note: modelMode ? `the control-flow table ran and the judgements inside its steps were made by model turns (${meter.turns}), under the Claude account the cascade resolved and the skill pack the run names; the sub-sessions ran one per level and returned REPORTS` : "the control-flow table ran and its judgements arrived from the caller, so no model turn was taken (turns_run: 0). Stated rather than presented as a model run.",
    /* FL-6 ON THE WIRE, secret-free by construction. Three shapes, each an
       honest statement of a different fact: material supplied and RESOLVED
       (level + ref + every level's own state); material supplied and NOTHING
       resolved never reaches here — it refused above, by name; material NOT
       supplied is its own stated absence, distinct from "nothing resolved",
       because a caller that offered no accounts and a cascade that exhausted
       them are different facts about this segment. */
    claude_account: cascade ? { available: true, level: cascade.level, ref: cascade.ref, levels: cascade.levels } : {
      available: false,
      reason: "NO_ACCOUNT_MATERIAL_SUPPLIED",
      detail: "this segment was handed no claude_accounts material, so the cascade had nothing to resolve \u2014 the deterministic, judgements-supplied mode. An absence, stated."
    },
    mode: drive.mode,
    trace: drive.trace,
    passes: drive.passes,
    ended: drive.ended,
    logged: drive.logged,
    /* REC-100 / IC-130 — WHAT THE LOG DID NOT TAKE, AND WHAT IT TOOK AS LESS.
       `log_refused` names every step entry the plane refused (also in
       `refusals`), so `logged` + `log_refused.length` is what this segment SENT;
       `present_unbacked` counts steps where the model judged PRESENT and the
       entry could name nothing, so it was recorded LOOKED_INDETERMINATE. */
    log_refused: drive.logRefused,
    present_unbacked: drive.presentUnbacked,
    submitted: drive.submitted,
    refusals: drive.refusals,
    adjusted: drive.adjusted,
    verbatim_resubmits: drive.verbatimResubmits,
    resumed_from: drive.resumedFrom,
    /* FL-11: the question this run's readings default to, and WHY (`runContextTarget`) — published so a
       reader can check it against the run's context rather than take it on this member's word. */
    target: drive.target,
    /* FL-5 / IS-9(a) ON THE WIRE. `fanout.contracts` is exactly what each
       sub-session was handed — the party protected by §14's fence can be read
       from outside instead of trusting this member's own summary of itself.
       `reports_refused` names every return that broke the contract, because a
       sub-session that returns documents has defeated the architecture and that
       is a fact about the run, not a detail of its plumbing. */
    fanout: drive.fanout,
    reports_taken: drive.reportsTaken,
    reports_refused: drive.reportsRefused,
    citations_reread: drive.citationsReread,
    /* D-220 ON THE WIRE. `citations_reread` counts READS; this counts DOCUMENTS,
       each once with its versions, by the record's own chain — the figure a
       reader may take as what the run held. */
    holdings: drive.holdings,
    budget: drive.budget,
    /* D-611: the segment's two bounds and what it spent against each; `stopped` names the one that ended the
       SEGMENT (never the run, whose `ended` stays null), or null. */
    segment: {
      turns_requested: requested,
      turns_bound: bound,
      bound_source: BOUND_SOURCE,
      turns_run: meter.turns,
      bytes_sent: meter.bytes,
      bytes_bound: bytesBound,
      bytes_source: SEGMENT_BYTES_SOURCE,
      stopped: drive.segmentStopped ?? null
    },
    /* THE PLANE'S STATEMENT ABOUT THE CREDENTIAL, COPIED AND NOT INTERPRETED.
       What the plane publishes here is the class it resolved the credential to
       and the namespace it confined the call to. Both are facts the plane
       decided; this member re-derives neither. */
    plane_says: {
      token_class: asked.body.result?.tokenClass ?? asked.body.tokenClass ?? null,
      store: asked.body.store ?? null,
      session: asked.body.result?.session ?? null
    },
    /* AND THE PART THAT IS UNDETERMINED, STATED RATHER THAN GUESSED OR OMITTED.
       D-199 (4) makes the PRINCIPAL the credential's operative identity — the
       viewer its reads compile under, `member:<id>` or `class:ai` — and FL-6 has
       to record it beside the model account that paid. **No read op an agent can
       call publishes its OWN principal**: `op=whoami` answers `tokenClass: "ai"`,
       `member: null`, and names no principal at all (measured against
       `bio-plane/src/index.mjs` at FL-2). So this member says the principal is
       unpublished and names why, rather than defaulting it, inferring it from the
       class, or dropping the field — a run that quietly reported no principal
       cannot be told from one acting for nobody. Filed as a DELEGATION to the
       plane's owner in `CLAIMS.md`; FL-6 needs it closed. */
    principal: null,
    principal_source: "UNPUBLISHED \u2014 no read op an ai credential may call states its own principal (D-199 (4)); see the FL-2 delegation in CLAIMS.md",
    plane: { version: asked.body.version ?? null, op: "whoami" },
    worker: { name: "agent-worker", version: env.VERSION || "0.0.0" }
  });
}
function handleVersion(env) {
  return json({ ok: true, name: "agent-worker", version: env.VERSION || "0.0.0" });
}
var index_default = {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+/, "");
    if (req.method === "GET" && path === "version") return handleVersion(env);
    if (req.method === "POST" && (path === "run" || path === "")) return handleRun(req, env);
    return refusal2("UNKNOWN", "POST /run or GET /version only.", 404);
  }
};
export {
  SURFACE,
  index_default as default
};
