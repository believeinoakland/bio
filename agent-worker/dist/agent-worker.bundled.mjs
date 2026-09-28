var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/harness.mjs
var LEVELS = ["meaning", "content", "document", "internet"];
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
    to: ["plan", "close"]
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
      return {
        step: "plan",
        why: s.resumedFrom > 0 ? `this run's log carries ${s.resumedFrom} observation(s); continuing rather than restarting (\xA714b.7)` : "this run's log is empty; starting the first pass"
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
  const list = Array.isArray(resolved) ? resolved : [];
  for (const r of list) {
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
    citations: list.length,
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

// ../bio-plane/checks/bio-checks.mjs
var bio_checks_exports = {};
__export(bio_checks_exports, {
  ACTION_BASIS_KINDS: () => ACTION_BASIS_KINDS,
  ACTION_KINDS: () => ACTION_KINDS,
  ACTOR_CLASSES: () => ACTOR_CLASSES,
  ACT_SHAPE_CHECKS: () => ACT_SHAPE_CHECKS,
  ADMISSION_CHECKS: () => ADMISSION_CHECKS,
  AI_CREDENTIAL_CHECKS: () => AI_CREDENTIAL_CHECKS,
  AI_RUNS_CONTEXT_CHECKS: () => AI_RUNS_CONTEXT_CHECKS,
  AI_RUN_CHECKS: () => AI_RUN_CHECKS,
  ANN_ID_RE: () => ANN_ID_RE,
  ATTEST_CHECKS: () => ATTEST_CHECKS,
  ATTRIBUTION_CHECKS: () => ATTRIBUTION_CHECKS,
  BASIS_GRADES: () => BASIS_GRADES,
  BASIS_ROLES: () => BASIS_ROLES,
  BASIS_VERSION_CHECKS: () => BASIS_VERSION_CHECKS,
  BIAS_CHECKS: () => BIAS_CHECKS,
  BOILERPLATE_FORMS: () => BOILERPLATE_FORMS,
  BUNDLE_ID_RE: () => BUNDLE_ID_RE,
  CAPTURE_PURPOSES: () => CAPTURE_PURPOSES,
  CAPTURE_REQUEST_CHECKS: () => CAPTURE_REQUEST_CHECKS,
  CAPTURE_UA_MODES: () => CAPTURE_UA_MODES,
  CASE_AUTHORITY_CHECKS: () => CASE_AUTHORITY_CHECKS,
  CASE_CITATION_VERSIONS: () => CASE_CITATION_VERSIONS,
  CASE_CONCLUSION_CHECKS: () => CASE_CONCLUSION_CHECKS,
  CASE_DERIVATION_CHECKS: () => CASE_DERIVATION_CHECKS,
  CASE_DOCUMENT_FAMILY: () => CASE_DOCUMENT_FAMILY,
  CASE_DOCUMENT_FORMAT: () => CASE_DOCUMENT_FORMAT,
  CASE_DOCUMENT_FORMATS_ACCEPTED: () => CASE_DOCUMENT_FORMATS_ACCEPTED,
  CASE_DOCUMENT_FORMAT_LEGACY: () => CASE_DOCUMENT_FORMAT_LEGACY,
  CASE_DOCUMENT_FORMAT_V2: () => CASE_DOCUMENT_FORMAT_V2,
  CASE_DOCUMENT_FORMAT_V3: () => CASE_DOCUMENT_FORMAT_V3,
  CASE_MEMBER_ROLES: () => CASE_MEMBER_ROLES,
  CHECK_RETIREMENTS: () => CHECK_RETIREMENTS,
  CITATION_MAX: () => CITATION_MAX,
  CIVICOS_CONTACT_URL: () => CIVICOS_CONTACT_URL,
  CONNECTION_CHOICE_CHECKS: () => CONNECTION_CHOICE_CHECKS,
  CONNECTION_PAIR_CHECKS: () => CONNECTION_PAIR_CHECKS,
  CONTENT_EXTENT_A1_RE: () => CONTENT_EXTENT_A1_RE,
  CONTENT_EXTENT_CHECKS: () => CONTENT_EXTENT_CHECKS,
  CONTENT_EXTENT_DOCUMENT_ONLY: () => CONTENT_EXTENT_DOCUMENT_ONLY,
  CONTENT_EXTENT_KINDS: () => CONTENT_EXTENT_KINDS,
  CONTENT_EXTENT_KIND_NO_PRODUCER: () => CONTENT_EXTENT_KIND_NO_PRODUCER,
  CONTENT_EXTENT_RANGE_RE: () => CONTENT_EXTENT_RANGE_RE,
  CONTENT_ID_RE: () => CONTENT_ID_RE,
  CONTENT_MINTED_BY_PLANE: () => CONTENT_MINTED_BY_PLANE,
  CONTENT_MINT_STATES: () => CONTENT_MINT_STATES,
  CORE_FIELDS: () => CORE_FIELDS,
  CORRESPONDENCE_DIRECTIONS: () => CORRESPONDENCE_DIRECTIONS,
  CORRESPONDENCE_OUTCOMES: () => CORRESPONDENCE_OUTCOMES,
  CORRESPONDENCE_STAGES: () => CORRESPONDENCE_STAGES,
  CUSTODIAL_CHECKS: () => CUSTODIAL_CHECKS,
  DECISION_STAGES: () => DECISION_STAGES,
  DISPATCH_CHECKS: () => DISPATCH_CHECKS,
  DRIVE_CAPTURE_CHECKS: () => DRIVE_CAPTURE_CHECKS,
  DUE_UNDETERMINED_SAYS: () => DUE_UNDETERMINED_SAYS,
  EARNED_CAPTURE_CEILING: () => EARNED_CAPTURE_CEILING,
  EARNED_GRADE_SOURCES: () => EARNED_GRADE_SOURCES,
  EARNED_SOURCE_AXIS: () => EARNED_SOURCE_AXIS,
  EXTRACT_PROPOSE_CHECKS: () => EXTRACT_PROPOSE_CHECKS,
  FILENAME_RE: () => FILENAME_RE,
  FORBIDDEN_ALIASES: () => FORBIDDEN_ALIASES,
  GOVERNING_LAWS_MAX: () => GOVERNING_LAWS_MAX,
  GOVERNING_LAW_CHECKS: () => GOVERNING_LAW_CHECKS,
  GRADE_AXES: () => GRADE_AXES,
  GRADE_SOURCES: () => GRADE_SOURCES,
  GROUND_LABEL_RE: () => GROUND_LABEL_RE,
  HEADINGS: () => HEADINGS,
  HEADINGS_WHEN: () => HEADINGS_WHEN,
  INQUIRY_TITLE_MAX: () => INQUIRY_TITLE_MAX,
  INSTALLATION_CHECKS: () => INSTALLATION_CHECKS,
  INSTANCE_GROUP_CHECKS: () => INSTANCE_GROUP_CHECKS,
  ISO_TS_RE: () => ISO_TS_RE,
  KNOCK_CHECKS: () => KNOCK_CHECKS,
  LAW_LEVELS: () => LAW_LEVELS,
  LAW_PROPOSAL_STATES: () => LAW_PROPOSAL_STATES,
  LAW_PROPOSAL_WHY_MAX: () => LAW_PROPOSAL_WHY_MAX,
  LEAD_CHECKS: () => LEAD_CHECKS,
  LEAD_ID_RE: () => LEAD_ID_RE,
  LEGACY_TYPE_ALIASES: () => LEGACY_TYPE_ALIASES,
  LIFECYCLE_CHECKS: () => LIFECYCLE_CHECKS,
  LIFECYCLE_KEYS: () => LIFECYCLE_KEYS,
  MACHINE_AUTHOR_PREFIX: () => MACHINE_AUTHOR_PREFIX,
  MACHINE_CLASS_PREFIX: () => MACHINE_CLASS_PREFIX,
  MACHINE_FENCE_CHECKS: () => MACHINE_FENCE_CHECKS,
  MACHINE_STAMP_PREFIXES: () => MACHINE_STAMP_PREFIXES,
  MECHANICAL_FIELD_SETS: () => MECHANICAL_FIELD_SETS,
  MEMBER_ID_CHECKS: () => MEMBER_ID_CHECKS,
  MONITOR_FREQ: () => MONITOR_FREQ,
  NAMESPACE_CHECKS: () => NAMESPACE_CHECKS,
  NARROW_CHECKS: () => NARROW_CHECKS,
  NON_MEMBER_AUTHORS: () => NON_MEMBER_AUTHORS,
  OBJECT_TYPES: () => OBJECT_TYPES,
  PARTITION_INDEPENDENCE_CHECKS: () => PARTITION_INDEPENDENCE_CHECKS,
  PER_ITEM_CHECKS: () => PER_ITEM_CHECKS,
  PROJECT_AUTHORITY_CHECKS: () => PROJECT_AUTHORITY_CHECKS,
  PROJECT_CREATION_VISIBILITY_CHECKS: () => PROJECT_CREATION_VISIBILITY_CHECKS,
  PROJECT_ID_CHECKS: () => PROJECT_ID_CHECKS,
  PROJECT_JOIN_REQUEST_CHECKS: () => PROJECT_JOIN_REQUEST_CHECKS,
  PROJECT_VISIBILITY_CHECKS: () => PROJECT_VISIBILITY_CHECKS,
  PROMOTED_TYPE_CHECKS: () => PROMOTED_TYPE_CHECKS,
  PROVENANCE_ACT_CHECKS: () => PROVENANCE_ACT_CHECKS,
  PUBLISHED_READ_CHECKS: () => PUBLISHED_READ_CHECKS,
  QUEUE_MINT_CHECKS: () => QUEUE_MINT_CHECKS,
  QUOTE_CHECKS: () => QUOTE_CHECKS,
  QUOTE_KEYS: () => QUOTE_KEYS,
  RATIFY_SCOPE_CHECKS: () => RATIFY_SCOPE_CHECKS,
  REGISTRATION_CHECKS: () => REGISTRATION_CHECKS,
  RENDER_CAPTURE_CHECKS: () => RENDER_CAPTURE_CHECKS,
  REQUIRED_ARGUMENT_CHECKS: () => REQUIRED_ARGUMENT_CHECKS,
  RESOLUTIONS: () => RESOLUTIONS,
  REVIEW_COPY_CHECKS: () => REVIEW_COPY_CHECKS,
  RFC_RESPONSE_WINDOW_PRECEDENT: () => RFC_RESPONSE_WINDOW_PRECEDENT,
  RISK_TIERS: () => RISK_TIERS,
  RISK_TIER_HISTORY_MAX: () => RISK_TIER_HISTORY_MAX,
  RISK_TIER_REASON_MAX: () => RISK_TIER_REASON_MAX,
  RISK_TIER_REVISION_CHECKS: () => RISK_TIER_REVISION_CHECKS,
  ROUTE_MARK_CHECKS: () => ROUTE_MARK_CHECKS,
  SEARCHED_SUBJECT_SOURCES: () => SEARCHED_SUBJECT_SOURCES,
  SIGNER_ENROLMENT_CHECKS: () => SIGNER_ENROLMENT_CHECKS,
  STATEMENT_ACK_CHECKS: () => STATEMENT_ACK_CHECKS,
  STATES: () => STATES,
  STRENGTH_STATES: () => STRENGTH_STATES,
  SUBJECT_POSITIONS: () => SUBJECT_POSITIONS,
  SUFFICIENCY_CLAIM_STATES: () => SUFFICIENCY_CLAIM_STATES,
  SUFFICIENCY_UNCLAIMED: () => SUFFICIENCY_UNCLAIMED,
  SUGGEST_CHECKS: () => SUGGEST_CHECKS,
  SUGGEST_KINDS: () => SUGGEST_KINDS,
  SUGGEST_LEVELS: () => SUGGEST_LEVELS,
  SURFACE_CHECKS: () => SURFACE_CHECKS,
  TASK_ACTOR_CHECKS: () => TASK_ACTOR_CHECKS,
  TESTIMONY_CHECKS: () => TESTIMONY_CHECKS,
  TESTIMONY_GRADE: () => TESTIMONY_GRADE,
  TEXT_CHAIN_CHECKS: () => TEXT_CHAIN_CHECKS,
  THEME_CHECKS: () => THEME_CHECKS,
  THEME_ID_RE: () => THEME_ID_RE,
  TRANSCRIBE_CHECKS: () => TRANSCRIBE_CHECKS,
  UNREACHABLE_CAPTURE_GRADE: () => UNREACHABLE_CAPTURE_GRADE,
  VERSION_ACT_CHECKS: () => VERSION_ACT_CHECKS,
  VERSION_CHAIN_CHECKS: () => VERSION_CHAIN_CHECKS,
  VERSION_MACHINE: () => VERSION_MACHINE,
  VERSION_NAME_RE: () => VERSION_NAME_RE,
  VERSION_NOTICE_CHECKS: () => VERSION_NOTICE_CHECKS,
  VERSION_REASON_REQUIRED: () => VERSION_REASON_REQUIRED,
  VERSION_RELATIONSHIPS: () => VERSION_RELATIONSHIPS,
  VERSION_STATES: () => VERSION_STATES,
  VERSION_STRENGTH_CHECKS: () => VERSION_STRENGTH_CHECKS,
  VERSION_STRENGTH_DEFAULT_STATES: () => VERSION_STRENGTH_DEFAULT_STATES,
  VERSION_STRENGTH_INERT_SOURCES: () => VERSION_STRENGTH_INERT_SOURCES,
  a1ToRowCol: () => a1ToRowCol,
  actionBasisFindings: () => actionBasisFindings,
  b64ToBytes: () => b64ToBytes,
  basisVersionFindings: () => basisVersionFindings,
  biasAcknowledgementOf: () => biasAcknowledgementOf,
  canonicalExtent: () => canonicalExtent,
  canonicalJson: () => canonicalJson,
  canonicalRange: () => canonicalRange,
  caseDocumentRequiresDisclosures: () => caseDocumentRequiresDisclosures,
  caseDocumentRequiresV4Disclosures: () => caseDocumentRequiresV4Disclosures,
  caseDocumentStatesMemberBlocks: () => caseDocumentStatesMemberBlocks,
  caseEditionClaimed: () => caseEditionClaimed,
  checkBundle: () => checkBundle,
  checkCaseDocument: () => checkCaseDocument,
  checkContentExtent: () => checkContentExtent,
  checkGatheringGrammar: () => checkGatheringGrammar,
  checkInboxGrammar: () => checkInboxGrammar,
  checkInquiryBasis: () => checkInquiryBasis,
  checkLegExtentGrammar: () => checkLegExtentGrammar,
  checkProjectNameUniqueness: () => checkProjectNameUniqueness,
  civicosUserAgent: () => civicosUserAgent,
  completenessFields: () => completenessFields,
  consequenceState: () => consequenceState,
  contentCitedAs: () => contentCitedAs,
  contentIdFor: () => contentIdFor,
  contentMintState: () => contentMintState,
  correspondenceFindings: () => correspondenceFindings,
  createSha256: () => createSha256,
  deriveInquiryTitle: () => deriveInquiryTitle,
  describeExtent: () => describeExtent,
  divisionDisclosureFindings: () => divisionDisclosureFindings,
  extentRelation: () => extentRelation,
  governingLawsOf: () => governingLawsOf,
  imagePartUndetermined: () => imagePartUndetermined,
  inquiryQuestionOf: () => inquiryQuestionOf,
  isBoilerplate: () => isBoilerplate,
  isCaseMemberBytes: () => isCaseMemberBytes,
  isMachineIdentity: () => isMachineIdentity,
  isMachineMinted: () => isMachineMinted,
  isMachineStamp: () => isMachineStamp,
  isPublicHttpsLocator: () => isPublicHttpsLocator,
  isQuoteEntry: () => isQuoteEntry,
  isSufficiencyClaimed: () => isSufficiencyClaimed,
  isSufficiencyUnclaimed: () => isSufficiencyUnclaimed,
  lawProposalLabel: () => lawProposalLabel,
  lawProposalState: () => lawProposalState,
  leadLegFindings: () => leadLegFindings,
  legExtent: () => legExtent,
  legHasAuthoredExtent: () => legHasAuthoredExtent,
  lifecycleFindings: () => lifecycleFindings,
  normalizeType: () => normalizeType,
  parseFrontmatter: () => parseFrontmatter,
  projectNameKey: () => projectNameKey,
  quoteFindings: () => quoteFindings,
  quoteValue: () => quoteValue,
  rangeCorners: () => rangeCorners,
  requestLifecycleOf: () => requestLifecycleOf,
  respondsToEdgeFindings: () => respondsToEdgeFindings,
  riskTierHistoryOf: () => riskTierHistoryOf,
  riskTierState: () => riskTierState,
  sectionText: () => sectionText,
  sha256HexSync: () => sha256HexSync,
  sufficiencyClaimState: () => sufficiencyClaimState,
  supersedesEdgeFindings: () => supersedesEdgeFindings,
  themeLegFindings: () => themeLegFindings,
  userAgentIsLegible: () => userAgentIsLegible,
  versionNeedsReason: () => versionNeedsReason,
  vocabFor: () => vocabFor,
  withProducingGroup: () => withProducingGroup
});
var BUNDLE_ID_RE = /^(INFO|PROB|FOCUS|INQ|PROJ|ACTN|BIAS)-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
var ANN_ID_RE = /^(INFO|PROB|FOCUS|INQ|PROJ|ACTN|BIAS)-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*\.ann-\d{8}T\d{6}Z-[a-z0-9]+(-[a-z0-9]+)*$/;
var FILENAME_RE = /^[A-Za-z0-9._-]+$/;
var ISO_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
var OBJECT_TYPES = { INFO: "information", PROB: "inquiry", FOCUS: "inquiry", INQ: "inquiry", PROJ: "project", ACTN: "action", BIAS: "bias" };
var LEGACY_TYPE_ALIASES = { problem: "inquiry", focus: "inquiry" };
var normalizeType = (t) => LEGACY_TYPE_ALIASES[t] || t;
var INQUIRY_TITLE_MAX = 120;
var deriveInquiryTitle = (question) => {
  const line = String(question == null ? "" : question).split("\n").map((s) => s.trim()).find((s) => s !== "") || "";
  const flat = line.replace(/\s+/g, " ");
  if (flat === "") return null;
  if (flat.length <= 120) return flat;
  const cut = flat.slice(0, 120);
  const at = cut.lastIndexOf(" ");
  return (at > 0 ? cut.slice(0, at) : cut) + "\u2026";
};
var inquiryQuestionOf = (markdown) => {
  const m = /\n## Question[^\S\n]*\n([\s\S]*?)(?=\n## |$)/.exec("\n" + String(markdown == null ? "" : markdown));
  return m ? m[1] : "";
};
var CORE_FIELDS = [
  "id",
  "object_type",
  "schema",
  "title",
  "current_state",
  "prior_state",
  "created",
  "last_updated",
  "produced_by",
  "group",
  "references",
  "state_history",
  "annotations_open",
  "reeval_pending",
  "visuals"
];
var FORBIDDEN_ALIASES = {
  status: "current_state",
  state: "current_state",
  pipeline_state: "current_state",
  verdict: "current_state",
  type: "object_type",
  updated: "last_updated",
  modified: "last_updated"
};
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
var caseEditionClaimed = (fm) => {
  const e = fm?.case_edition;
  return !(e === void 0 || e === null || e === "" || e === "null");
};
var isCaseMemberBytes = (fm) => {
  const s = fm?.published_strength;
  return Array.isArray(s) && s.length >= 2 && s.every((a) => a && typeof a === "object" && typeof a.axis === "string");
};
var vocabFor = (table, t) => table[t] !== void 0 ? table[t] : table[normalizeType(t)];
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
  }
};
STATES.problem = STATES.focus;
var ACTION_KINDS = ["cpra_request", "grand_jury", "controller_referral", "public_comment", "media", "litigation_support", "request_for_comment", "other"];
var RISK_TIERS = {
  1: "file freely",
  2: "file with caution",
  3: "do not file without counsel",
  undetermined: "not assessed: no member has stated a risk tier for this action"
};
function riskTierState(v) {
  if (v === void 0 || v === null || v === "undetermined") return "undetermined";
  return v === 1 || v === 2 || v === 3 ? v : null;
}
var RISK_TIER_REASON_MAX = 500;
var RISK_TIER_HISTORY_MAX = 200;
function riskTierHistoryOf(fm) {
  const raw = fm && Array.isArray(fm.risk_tier_history) ? fm.risk_tier_history : [];
  const revisions = raw.map((e, i) => {
    if (!e || typeof e !== "object" || Array.isArray(e)) return { ord: i, readable: false };
    const tier = riskTierState(e.tier);
    const prior = riskTierState(e.prior);
    const by = typeof e.by === "string" && e.by.trim() ? e.by.trim() : null;
    const at = typeof e.at === "string" && e.at.trim() ? e.at.trim() : null;
    const reason = typeof e.reason === "string" && e.reason.trim() ? e.reason.trim() : null;
    return {
      ord: i,
      readable: tier !== null && tier !== "undetermined" && prior !== null && !!by && !!at && !!reason,
      tier,
      tier_words: RISK_TIERS[tier] ?? null,
      prior,
      prior_words: RISK_TIERS[prior] ?? null,
      by,
      at,
      reason
    };
  });
  const current = riskTierState(fm ? fm.risk_tier : void 0);
  const intakeTier = revisions.length ? revisions[0].prior : current;
  return {
    current,
    current_words: RISK_TIERS[current] ?? null,
    intake: {
      tier: intakeTier,
      tier_words: RISK_TIERS[intakeTier] ?? null,
      by: null,
      stated: intakeTier === "undetermined" ? "No member stated a tier when this action was created." : "Stated when this action was created. UNDETERMINED who stated it: an intake tier carries no author of its own in the record."
    },
    revisions,
    stated: revisions.length ? `${revisions.length} revision${revisions.length === 1 ? "" : "s"} by a member, each with its reason; every earlier tier stays in this history` : "Never revised: the tier is the one the action was created with."
  };
}
function riskTierHistoryFindings(fm, findings) {
  if (!Object.prototype.hasOwnProperty.call(fm, "risk_tier_history") || fm.risk_tier_history === null || Array.isArray(fm.risk_tier_history) && !fm.risk_tier_history.length) return;
  if (!Array.isArray(fm.risk_tier_history)) {
    findings.push(f("C-2.10", "error", "risk_tier_history is not a list of revisions (REC-214)"));
    return;
  }
  if (fm.risk_tier_history.length > RISK_TIER_HISTORY_MAX)
    findings.push(f("C-2.10", "error", `risk_tier_history holds ${fm.risk_tier_history.length} entries; at most ${RISK_TIER_HISTORY_MAX}`));
  const h = riskTierHistoryOf(fm);
  let prev = null;
  for (const e of h.revisions) {
    if (!e.readable) {
      findings.push(f("C-2.10", "error", `risk_tier_history[${e.ord}] is not a revision: each names tier (1, 2 or 3), prior, by, at and a reason (REC-214)`, ["revise the tier with op=actionrisktier"]));
      prev = null;
      continue;
    }
    if (isMachineIdentity(e.by))
      findings.push(f("C-2.10", "error", `risk_tier_history[${e.ord}].by '${e.by.slice(0, 40)}' is a machine identity: a risk tier is revised by a member's authored act (REC-214)`));
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(e.at))
      findings.push(f("C-2.10", "error", `risk_tier_history[${e.ord}].at '${e.at}' is not a timestamp`));
    if (e.reason.length > RISK_TIER_REASON_MAX)
      findings.push(f("C-2.10", "error", `risk_tier_history[${e.ord}].reason is longer than ${RISK_TIER_REASON_MAX} characters`));
    if (e.prior === e.tier)
      findings.push(f("C-2.10", "error", `risk_tier_history[${e.ord}] replaces tier ${e.tier} with itself: a revision changes the tier`));
    if (prev && e.prior !== prev.tier)
      findings.push(f("C-2.10", "error", `risk_tier_history[${e.ord}].prior is ${e.prior}, and the revision before it set ${prev.tier}: the history does not close (REC-214)`));
    prev = e;
  }
  const last = h.revisions[h.revisions.length - 1];
  if (last && last.readable && last.tier !== h.current)
    findings.push(f(
      "C-2.10",
      "error",
      `risk_tier is ${h.current} and the last revision in risk_tier_history set ${last.tier}: the tier stated is not the tier the history ends on (REC-214)`,
      ["revise the tier with op=actionrisktier"]
    ));
}
var LAW_LEVELS = ["federal", "state", "local"];
var GOVERNING_LAWS_MAX = 12;
var CITATION_MAX = 200;
function governingLawsOf(fm) {
  const raw = fm && Array.isArray(fm.governing_laws) ? fm.governing_laws : [];
  const laws = raw.filter((l) => l && typeof l === "object" && !Array.isArray(l)).map((l) => ({ level: String(l.level ?? ""), citation: String(l.citation ?? "") }));
  if (laws.length) {
    return {
      state: "stated",
      laws,
      by: typeof fm.governing_laws_by === "string" && fm.governing_laws_by ? fm.governing_laws_by : null,
      at: typeof fm.governing_laws_at === "string" && fm.governing_laws_at ? fm.governing_laws_at : null,
      stated: `${laws.length} governing law${laws.length === 1 ? "" : "s"}, stated by a member`
    };
  }
  const kindNames = fm && fm.action_kind === "cpra_request";
  return {
    state: "undetermined",
    laws: [],
    by: null,
    at: null,
    stated: "UNDETERMINED: no member has stated which laws govern this action. The record assumes none \u2014 not federal law, not state law, not a local ordinance. Which laws apply follows the agency asked, and a member states them, each by citation." + (kindNames ? " This action's kind, cpra_request, is its member's statement that the California Public Records Act governs it; nothing else is inferred from the kind." : "")
  };
}
function governingLawsFindings(fm, findings) {
  const has = Object.prototype.hasOwnProperty.call(fm, "governing_laws");
  const by = typeof fm.governing_laws_by === "string" ? fm.governing_laws_by.trim() : "";
  const at = typeof fm.governing_laws_at === "string" ? fm.governing_laws_at.trim() : "";
  if (!has || fm.governing_laws === null || Array.isArray(fm.governing_laws) && !fm.governing_laws.length) {
    if (by || at)
      findings.push(f(
        "C-2.10",
        "error",
        "governing_laws is empty and governing_laws_by/_at name an act that set it: an attribution with no list asserts a statement the document does not carry (D-149)",
        ["set the list with op=actionlaws", "or remove governing_laws_by and governing_laws_at"]
      ));
    return;
  }
  if (!Array.isArray(fm.governing_laws)) {
    findings.push(f("C-2.10", "error", "governing_laws is not a list of {level, citation} entries (D-149)"));
    return;
  }
  if (fm.governing_laws.length > GOVERNING_LAWS_MAX)
    findings.push(f("C-2.10", "error", `governing_laws holds ${fm.governing_laws.length} entries; at most ${GOVERNING_LAWS_MAX}`));
  fm.governing_laws.forEach((l, i) => {
    if (!l || typeof l !== "object" || Array.isArray(l)) {
      findings.push(f("C-2.10", "error", `governing_laws[${i}] is not a {level, citation} entry`));
      return;
    }
    if (!LAW_LEVELS.includes(l.level))
      findings.push(f("C-2.10", "error", `governing_laws[${i}].level '${l.level}' is not one of: ${LAW_LEVELS.join(", ")}`));
    const c = typeof l.citation === "string" ? l.citation.trim() : "";
    if (!c) findings.push(f("C-2.10", "error", `governing_laws[${i}].citation is empty: a law is named by its citation`));
    else if (c.length > CITATION_MAX)
      findings.push(f("C-2.10", "error", `governing_laws[${i}].citation is longer than ${CITATION_MAX} characters`));
  });
  if (!by || isMachineIdentity(by))
    findings.push(f(
      "C-2.10",
      "error",
      by ? `governing_laws_by '${by.slice(0, 40)}' is a machine identity: the laws governing a request are a member's authored statement (D-149)` : "governing_laws carries no governing_laws_by: a list of governing laws is a member's authored statement and names who made it (D-149)",
      ["set the list with op=actionlaws, signed in as a member"]
    ));
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(at))
    findings.push(f("C-2.10", "error", `governing_laws_at '${at}' is not a timestamp: the act that set the list is dated`));
}
var LAW_PROPOSAL_STATES = {
  machine_proposed: "a machine credential proposed these citations. That is machine work, labelled as machine work: it can set a list of laws beside the request and it can never state which laws govern it. Nothing here is this action's list of governing laws, and nothing becomes one until a member states it themselves",
  member_proposed: "a member proposed these citations to whoever states this action's governing laws. It is a proposal and not the list: only the governing-laws act sets that, and the record holds who made it",
  unstated: "the record does not say who proposed these citations"
};
function lawProposalState(proposedBy) {
  const s = String(proposedBy ?? "").trim();
  if (s.length === 0) return "unstated";
  return isMachineIdentity(s) ? "machine_proposed" : "member_proposed";
}
function lawProposalLabel(proposedBy) {
  const state = lawProposalState(proposedBy);
  return {
    by: proposedBy ?? null,
    state,
    machine_work: state === "machine_proposed",
    says: LAW_PROPOSAL_STATES[state]
  };
}
var LAW_PROPOSAL_WHY_MAX = 240;
var ACTION_BASIS_KINDS = ["rests_on", "advances"];
var CORRESPONDENCE_DIRECTIONS = ["sent", "received", "no_response"];
var RESOLUTIONS = ["complied", "denied", "escalated", "withdrawn"];
var RFC_RESPONSE_WINDOW_PRECEDENT = {
  min_days: 7,
  max_days: 30,
  source: "GAGAS / GAO agency-comment protocol (7-30 calendar days on a draft)",
  enforced: false
};
var COUNTERPARTY_STATES = ["named", "undetermined"];
var ENTITY_ID_RE = /^ENT-\d{4}-\d{4}$/;
var COUNTERPARTY_PLACEHOLDER = "to be named";
function f(check, severity, message, repairs, code) {
  const out = { check, severity, message };
  if (repairs) {
    out.repairable = true;
    out.repairs = repairs;
  }
  if (code) out.code = code;
  return out;
}
function stripComment(raw) {
  let inS = false, inD = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === "#" && !inS && !inD && (i === 0 || raw[i - 1] === " ")) return raw.slice(0, i);
  }
  return raw;
}
function parseScalar(raw) {
  let v = stripComment(raw).trim();
  if (v === "") return "";
  if (v === "null" || v === "~") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (v.startsWith('"') && v.endsWith('"') || v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (inner === "") return [];
    return inner.split(",").map((s) => parseScalar(s));
  }
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}
function parseFrontmatter(text) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") {
    findings.push(f("C-2.1", "error", "bundle.md does not begin with a --- frontmatter fence"));
    return { data: null, findings, body: text };
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) if (lines[i] === "---") {
    end = i;
    break;
  }
  if (end === -1) {
    findings.push(f("C-2.1", "error", "frontmatter fence is never closed"));
    return { data: null, findings, body: text };
  }
  const data = {};
  let topKey = null;
  let topMode = null;
  let curElem = null;
  const keyLine = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
  const indKeyLine = /^( +)([A-Za-z_][A-Za-z0-9_]*):(.*)$/;
  const itemLine = /^( +)- (.*)$/;
  for (let n = 1; n < end; n++) {
    const line = lines[n];
    const stripped = stripComment(line);
    if (stripped.trim() === "") continue;
    let m;
    if (m = keyLine.exec(line)) {
      const key = m[1];
      const rest = m[2];
      topKey = null;
      topMode = null;
      curElem = null;
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        findings.push(f("C-2.1", "error", `duplicate top-level key '${key}' at line ${n + 1}`));
      }
      if (stripComment(rest).trim() === "") {
        topKey = key;
        data[key] = void 0;
      } else {
        data[key] = parseScalar(rest);
      }
    } else if (m = itemLine.exec(line)) {
      const indent = m[1].length;
      const rest = m[2];
      if (!topKey) {
        findings.push(f("C-2.1", "error", `array item outside any block at line ${n + 1}`));
        continue;
      }
      if (indent !== 2) findings.push(f("C-2.1", "error", `array item indented ${indent} (expected 2) at line ${n + 1}`));
      if (topMode === null) {
        topMode = "array";
        data[topKey] = [];
      }
      if (topMode !== "array") {
        findings.push(f("C-2.1", "error", `array item inside a map block '${topKey}' at line ${n + 1}`));
        continue;
      }
      const km = /^([A-Za-z_][A-Za-z0-9_]*):(.*)$/.exec(rest);
      if (km && stripComment(km[2]).trim() !== "") {
        curElem = {};
        curElem[km[1]] = parseScalar(km[2]);
        data[topKey].push(curElem);
      } else {
        curElem = null;
        data[topKey].push(parseScalar(rest));
      }
    } else if (m = indKeyLine.exec(line)) {
      const indent = m[1].length;
      const key = m[2];
      const rest = m[3];
      const isCore = CORE_FIELDS.includes(key) || key in FORBIDDEN_ALIASES;
      if (topKey && topMode === null && indent === 2) {
        topMode = "map";
        data[topKey] = {};
        data[topKey][key] = parseScalar(rest);
      } else if (topKey && topMode === "map" && indent === 2) {
        data[topKey][key] = parseScalar(rest);
      } else if (topKey && topMode === "array" && curElem && indent === 4) {
        curElem[key] = parseScalar(rest);
      } else {
        if (isCore) {
          findings.push(f(
            "C-2.4",
            "error",
            `top-level key '${key}' is buried by stray indentation at line ${n + 1} and will not register`,
            [`re-indent '${key}' to column 0`]
          ));
          data[key] = parseScalar(rest);
        } else {
          findings.push(f("C-2.1", "error", `key '${key}' indented ${indent} does not fit the restricted grammar at line ${n + 1}`));
        }
      }
    } else {
      findings.push(f("C-2.1", "error", `line ${n + 1} does not fit the restricted grammar: ${line.slice(0, 60)}`));
    }
  }
  for (const k of Object.keys(data)) if (data[k] === void 0) data[k] = [];
  return { data, findings, body: lines.slice(end + 1).join("\n") };
}
function asText(v) {
  if (typeof v === "string") return v;
  return new TextDecoder().decode(v);
}
function hasFile_(ctx, path) {
  return ctx.files.has(path) || ctx.elided && ctx.elided.has(path);
}
function checkIdentity(ctx, findings) {
  const id = ctx.fm?.id;
  if (typeof id !== "string" || !BUNDLE_ID_RE.test(id)) {
    findings.push(f("C-1.2", "error", `frontmatter id '${id}' does not match the canonical ID grammar`));
  }
  if (typeof id === "string" && id !== ctx.folderName) {
    findings.push(f(
      "C-1.1",
      "error",
      `folder name '${ctx.folderName}' does not equal frontmatter id '${id}'`,
      ["restore folder name from frontmatter id", "restore frontmatter id from folder name if history confirms it"]
    ));
  }
  const seen = /* @__PURE__ */ new Set();
  for (const path of ctx.files.keys()) {
    if (!path.startsWith("annotations/")) continue;
    const name = path.slice("annotations/".length);
    if (!name.endsWith(".json")) {
      findings.push(f("C-1.3", "error", `annotation file '${name}' is not a .json record`));
      continue;
    }
    let rec;
    try {
      rec = JSON.parse(asText(ctx.files.get(path)));
    } catch {
      findings.push(f("C-1.3", "error", `annotation record '${name}' does not parse`));
      continue;
    }
    const rid = rec.id;
    if (typeof rid !== "string" || !ANN_ID_RE.test(rid)) {
      findings.push(f("C-1.3", "error", `annotation id '${rid}' does not match the v1.1 timestamp-author grammar`));
      continue;
    }
    if (!rid.startsWith(ctx.folderName + ".ann-")) {
      findings.push(f("C-1.3", "error", `annotation '${rid}' does not belong to parent '${ctx.folderName}'`));
    }
    const expectedFile = rid.slice(ctx.folderName.length + 1) + ".json";
    if (name !== expectedFile) {
      findings.push(f("C-1.3", "error", `annotation file '${name}' does not match its id (expected '${expectedFile}')`));
    }
    if (seen.has(rid)) {
      findings.push(f("C-1.3", "error", `duplicate annotation id '${rid}'`, ["adjust the later record timestamp suffix by one second, logged"]));
    }
    seen.add(rid);
  }
  let pending = 0;
  for (const path of ctx.files.keys()) {
    if (!path.startsWith("annotations/") || !path.endsWith(".json")) continue;
    try {
      if (JSON.parse(asText(ctx.files.get(path))).state === "pending") pending++;
    } catch {
    }
  }
  if (ctx.fm && typeof ctx.fm.annotations_open === "number" && ctx.fm.annotations_open !== pending) {
    findings.push(f("C-1.3", "warn", `annotations_open is ${ctx.fm.annotations_open} but ${pending} annotation record(s) are pending`, ["refresh annotations_open on the next write"]));
  }
}
function checkFrontmatterContract(ctx, findings) {
  const fm = ctx.fm;
  if (!fm) return;
  for (const key of CORE_FIELDS) {
    if (!(key in fm)) findings.push(f("C-2.2", "error", `required core field '${key}' is missing`));
  }
  for (const [alias, canonical3] of Object.entries(FORBIDDEN_ALIASES)) {
    if (alias in fm) findings.push(f("C-2.3", "error", `forbidden alias '${alias}' present (canonical name is '${canonical3}')`, [`rename '${alias}' to '${canonical3}'`]));
  }
  const ot = fm.object_type;
  if (!Object.values(OBJECT_TYPES).includes(normalizeType(ot))) {
    findings.push(f("C-2.5", "error", `object_type '${ot}' is not a known type`));
  } else {
    const prefix = fm.id && String(fm.id).split("-")[0];
    const wantType = OBJECT_TYPES[prefix];
    if (wantType && wantType !== normalizeType(ot)) findings.push(f("C-2.5", "error", `id prefix '${prefix}' implies '${wantType}' but object_type is '${ot}'`));
    const schema = fm.schema;
    const sm = typeof schema === "string" && /^([a-z]+)@(\d+)$/.exec(schema);
    if (!sm) findings.push(f("C-2.5", "error", `schema stamp '${schema}' is not of the form <type>@<n>`));
    else {
      if (normalizeType(sm[1]) !== normalizeType(ot)) findings.push(f("C-2.5", "error", `schema stamp '${schema}' does not match object_type '${ot}'`));
      if (!ctx.knownSchemas.includes(schema)) findings.push(f("C-2.5", "error", `schema version '${schema}' is not known to this check catalog`));
    }
  }
  for (const key of ["created", "last_updated"]) {
    if (typeof fm[key] === "string" && !ISO_TS_RE.test(fm[key])) {
      findings.push(f("C-2.6", "error", `${key} '${fm[key]}' is not ISO 8601 UTC (YYYY-MM-DDTHH:MM:SSZ)`));
    }
  }
  if (fm.produced_by && typeof fm.produced_by === "object") {
    if (!fm.produced_by.mode) findings.push(f("C-2.2", "error", "produced_by.mode is missing"));
    if (!fm.produced_by.capability_tier) findings.push(f("C-2.2", "error", "produced_by.capability_tier is missing"));
  }
  checkReevalPending(ctx, findings);
}
var REEVAL_SOURCES = ["deletion", "source_status", "wp_retraction", "annotation"];
function checkReevalPending(ctx, findings) {
  const rp = ctx.fm?.reeval_pending;
  if (rp === void 0) return;
  const ageDays = ctx.maxReevalAgeDays ?? 30;
  if (typeof rp === "boolean") {
    if (rp === true) {
      findings.push(f(
        "C-10.1",
        "warn",
        "reeval_pending is a legacy boolean true with no since/source; staleness cannot be checked",
        ["migrate reeval_pending to {flag, since, source}"]
      ));
    }
    return;
  }
  if (typeof rp !== "object") {
    findings.push(f("C-10.1", "error", `reeval_pending must be a {flag, since, source} record or boolean, got ${typeof rp}`));
    return;
  }
  if (typeof rp.flag !== "boolean") {
    findings.push(f("C-10.1", "error", "reeval_pending.flag must be boolean"));
    return;
  }
  if (rp.flag === false) {
    if (rp.since != null || rp.source != null) {
      findings.push(f(
        "C-10.1",
        "warn",
        "reeval_pending.flag is false but since/source are not null",
        ["reset since and source to null when clearing the flag"]
      ));
    }
    return;
  }
  if (!ISO_TS_RE.test(rp.since || "")) {
    findings.push(f(
      "C-10.1",
      "error",
      "reeval_pending.flag is true but since is not an ISO-8601 UTC instant",
      ["stamp since with the cascade event time"]
    ));
  } else {
    const ageMs = (ctx.nowMs ?? Date.now()) - Date.parse(rp.since);
    if (ageMs > ageDays * 864e5) {
      findings.push(f(
        "C-10.1",
        "info",
        `reeval_pending set ${Math.floor(ageMs / 864e5)}d ago (policy age ${ageDays}d) with no recorded re-evaluation`,
        ["perform and record the re-evaluation", "record an explicit accept-risk note (policy permitting)"]
      ));
    }
  }
  if (!REEVAL_SOURCES.includes(rp.source)) {
    findings.push(f("C-10.1", "error", `reeval_pending.source '${rp.source}' is not one of: ${REEVAL_SOURCES.join(", ")}`));
  }
}
function checkHeadings(ctx, findings) {
  const ot = ctx.fm?.object_type;
  const required = vocabFor(HEADINGS, ot);
  if (!required) return;
  const conditional = vocabFor(HEADINGS_WHEN, ot) || [];
  const canonical3 = [...required, ...conditional.map((c) => c.heading)];
  const present = (ctx.body.match(/^## .*$/gm) || []).map((h) => h.trimEnd());
  for (const h of required) {
    if (!present.includes(h)) findings.push(f("C-3.1", "error", `required heading '${h}' is missing`, [`insert canonical heading '${h}' with empty body`]));
  }
  for (const c of conditional) {
    const owed = c.whenCaseMember ? isCaseMemberBytes(ctx.fm) : (c.states || []).includes(ctx.fm?.current_state);
    if (owed && !present.includes(c.heading))
      findings.push(f("C-3.1", "error", `required heading '${c.heading}' is missing: a member of a published case carries it`, [`insert canonical heading '${c.heading}' with the assertion in it`]));
  }
  for (const h of present) {
    if (!canonical3.includes(h)) findings.push(f("C-3.1", "error", `heading '${h}' is not in the canonical set for ${ot}`, ["rename to the canonical heading, preserving body"]));
  }
}
function checkStateLegality(ctx, findings) {
  const ot = ctx.fm?.object_type;
  const spec = vocabFor(STATES, ot);
  if (!spec) return;
  const cur = ctx.fm.current_state;
  const readable = [...spec.legal, ...spec.legacy || []];
  if (!readable.includes(cur)) {
    findings.push(f("C-4.1", "error", `current_state '${cur}' is not legal for ${ot} (legal: ${spec.legal.join(", ")})`));
  }
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  for (let i = 0; i < hist.length; i++) {
    const e = hist[i];
    if (typeof e !== "object" || e === null) {
      findings.push(f("C-4.2", "error", `state_history[${i}] is not an object`));
      continue;
    }
    if (typeof e.timestamp === "string" && !ISO_TS_RE.test(e.timestamp)) {
      findings.push(f("C-2.6", "error", `state_history[${i}].timestamp '${e.timestamp}' is not ISO 8601 UTC`));
    }
  }
}
function checkWriteCompleteness(ctx, findings) {
  const fm = ctx.fm;
  if (!fm) return;
  if (typeof fm.created === "string" && typeof fm.last_updated === "string" && fm.last_updated < fm.created) {
    findings.push(f("C-13.1", "error", `last_updated '${fm.last_updated}' precedes created '${fm.created}'`));
  }
  const hist = Array.isArray(fm.state_history) ? fm.state_history : [];
  if (hist.length > 0) {
    const newest = hist[hist.length - 1].timestamp;
    if (typeof newest === "string" && typeof fm.last_updated === "string" && fm.last_updated < newest) {
      findings.push(f("C-13.1", "error", `last_updated precedes the newest state_history timestamp '${newest}'`));
    }
  }
  if (typeof fm.created === "string" && typeof fm.last_updated === "string" && fm.last_updated > fm.created) {
    const idx = ctx.body.indexOf("## Session Log");
    const section = idx >= 0 ? ctx.body.slice(idx, ctx.body.indexOf("\n## ", idx + 1) === -1 ? void 0 : ctx.body.indexOf("\n## ", idx + 1)) : "";
    if (!/^### Session /m.test(section)) {
      findings.push(f("C-13.2", "error", "bundle has been updated but carries no Session Log entry", ["append the missing Session Log entry naming the gap"]));
    }
  }
}
function checkFormatHygiene(ctx, findings) {
  const escapeRe = /\\[#*_\-\[\]!~&]/;
  for (const [path, content] of ctx.files) {
    const name = path.split("/").pop() || path;
    if (!FILENAME_RE.test(name) || name.includes(" ") || !name.includes(".") || !/\.[a-z0-9]+$/.test(name)) {
      findings.push(f("C-14.2", "error", `filename '${path}' violates the naming rule`, ["rename file and update references"]));
    }
    if (name.endsWith(".md")) {
      const text = asText(content);
      const m = escapeRe.exec(text);
      if (m) findings.push(f("C-14.1", "error", `escaped markdown character '${m[0]}' in ${path}`, ["normalize to clean markdown"]));
    }
    if (name.endsWith(".json")) {
      try {
        JSON.parse(asText(content));
      } catch {
        findings.push(f("C-14.3", "error", `${path} does not parse as JSON`, ["restore from history"]));
      }
    }
  }
  const visuals = Array.isArray(ctx.fm?.visuals) ? ctx.fm.visuals : [];
  const svgOnDisk = [...ctx.files.keys()].filter((p) => !p.includes("/") && p.endsWith(".svg"));
  for (const v of visuals) {
    if (typeof v !== "object" || !v.file || !v.description) {
      findings.push(f("C-14.4", "error", `visuals entry ${JSON.stringify(v).slice(0, 50)} lacks file+description`));
      continue;
    }
    if (!ctx.files.has(v.file)) findings.push(f("C-14.4", "error", `visuals entry '${v.file}' has no file on disk`));
  }
  for (const svg of svgOnDisk) {
    if (!visuals.some((v) => v && v.file === svg)) {
      findings.push(f("C-14.4", "error", `svg '${svg}' on disk is absent from the visuals array`));
    }
  }
}
async function checkQueueAndBase(ctx, findings) {
  const staleMs = 10 * 60 * 1e3;
  const gateMarkerStaleMs = 48 * 60 * 60 * 1e3;
  for (const p of ctx.files.keys()) {
    const gm = /^GATE_PASSED-[0-9a-f]{8}\.json$/.exec(p);
    const lm = gm ? null : /^LEASE-[A-Za-z0-9][A-Za-z0-9-]{0,63}\.json$/.exec(p);
    const m = gm || lm ? null : /^(PROMOTING|PRESENCE)-.+\.json$/.exec(p);
    if (!gm && !lm && !m) continue;
    let stale;
    if (lm) {
      let expires = null;
      try {
        expires = Date.parse(JSON.parse(asText(ctx.files.get(p))).expires || "");
      } catch {
      }
      stale = expires === null || Number.isNaN(expires) || (ctx.nowMs ?? Date.now()) > expires;
    } else {
      const windowMs = gm ? gateMarkerStaleMs : staleMs;
      let ts = null;
      try {
        const rec = JSON.parse(asText(ctx.files.get(p)));
        ts = Date.parse(rec.ts || rec["started-at"] || rec.started_at || "");
      } catch {
      }
      stale = ts === null || Number.isNaN(ts) || (ctx.nowMs ?? Date.now()) - ts > windowMs;
    }
    if (stale) {
      findings.push(f("C-16.5", "info", `stale advisory artifact '${p}' (crashed or ended actor)`, ["delete the stale claim or presence marker"]));
    }
  }
  const manifestRaw = ctx.files.get("PENDING_PROMOTION.json");
  const pendingFiles = [...ctx.files.keys()].filter((p) => p.endsWith(".pending"));
  if (!manifestRaw) {
    for (const p of pendingFiles) {
      findings.push(f("C-16.4", "error", `orphaned pending file '${p}' with no manifest`, ["complete consumption: archive manifest, delete consumed files (idempotent)"]));
    }
    return;
  }
  let man;
  try {
    man = JSON.parse(asText(manifestRaw));
  } catch {
    findings.push(f("C-16.1", "error", "PENDING_PROMOTION.json does not parse"));
    return;
  }
  for (const k of ["target", "base", "files", "created", "author", "skill_version"]) {
    if (!(k in man)) findings.push(f("C-16.1", "error", `manifest missing '${k}'`));
  }
  if (man.target && man.target !== ctx.folderName) {
    findings.push(f("C-16.1", "error", `manifest target '${man.target}' does not match bundle '${ctx.folderName}'`));
  }
  const listed = /* @__PURE__ */ new Set();
  if (Array.isArray(man.files)) {
    for (const entry of man.files) {
      if (!entry || !entry.name || !entry.sha256) {
        findings.push(f("C-16.1", "error", `manifest files entry ${JSON.stringify(entry)} lacks name+sha256`));
        continue;
      }
      listed.add(entry.name + ".pending");
      const pending = ctx.files.get(entry.name + ".pending");
      if (!pending) {
        findings.push(f("C-16.2", "error", `package file '${entry.name}.pending' listed in manifest is missing`, ["discard the package with a finding to the producing author", "re-produce the package from the originating session outputs"]));
        continue;
      }
      const hash = await ctx.sha256(pending);
      if (hash !== entry.sha256) {
        findings.push(f("C-16.2", "error", `hash mismatch on '${entry.name}.pending' (manifest ${String(entry.sha256).slice(0, 12)}\u2026, actual ${hash.slice(0, 12)}\u2026)`, ["discard the package (never promote)", "re-produce the package"]));
      }
    }
  }
  for (const p of pendingFiles) {
    if (!listed.has(p)) findings.push(f("C-16.4", "error", `pending file '${p}' is not listed in the manifest`, ["complete consumption or discard with reason"]));
  }
  if (typeof man.created === "string" && ISO_TS_RE.test(man.created)) {
    const ageDays = ((ctx.nowMs ?? Date.now()) - Date.parse(man.created)) / 864e5;
    if (ageDays > ctx.maxPackageAgeDays) {
      findings.push(f("C-16.3", "warn", `pending package is ${Math.floor(ageDays)} days old (policy ${ctx.maxPackageAgeDays})`, ["promote now", "discard with reason if superseded, preserving the manifest as a record"]));
    }
  } else {
    findings.push(f("C-16.1", "error", `manifest created '${man.created}' is not ISO 8601 UTC`));
  }
  const live = ctx.files.get("bundle.md");
  if (live && typeof man.base === "string") {
    const liveHash = await ctx.sha256(live);
    if (liveHash === man.base) {
      findings.push(f("C-17.1", "info", "pending package base matches live bundle.md: fast-forward eligible"));
    } else {
      findings.push(f("C-17.1", "warn", `pending package base ${String(man.base).slice(0, 12)}\u2026 does not match live bundle.md ${liveHash.slice(0, 12)}\u2026: divergence`, ["rebase via a reconciliation session", "supersede: human selects one, the other preserved as a diverged branch in _history", "apply-disjoint if file sets prove disjoint (requires history manifests)"]));
    }
  }
}
function canonicalJson(v) {
  if (Array.isArray(v)) return "[" + v.map(canonicalJson).join(",") + "]";
  if (v !== null && typeof v === "object") {
    return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canonicalJson(v[k])).join(",") + "}";
  }
  return JSON.stringify(v);
}
var INFO_ENUMS = {
  criticality: ["crucial", "supporting"],
  source_status: ["unchanged", "modified", "removed"]
};
var MONITOR_FREQ = ["hourly", "daily", "weekly", "monthly", "per_meeting", "none"];
var CONTENT_HASH_RE = /^sha256:[0-9a-f]{64}$/;
async function checkInformationExtension(ctx, findings) {
  if (ctx.fm?.object_type !== "information") return;
  const fm = ctx.fm;
  for (const [field, legal] of Object.entries(INFO_ENUMS)) {
    if (!legal.includes(fm[field])) {
      findings.push(f("C-2.7", "error", `${field} '${fm[field]}' is not one of: ${legal.join(", ")}`));
    }
  }
  const src = fm.source;
  if (!src || typeof src !== "object") findings.push(f("C-2.7", "error", "source block is missing"));
  else for (const k of ["locator", "authority", "retrieved"]) {
    if (!src[k]) findings.push(f("C-2.7", "error", `source.${k} is missing`));
  }
  const mon = fm.monitoring;
  if (!mon || typeof mon !== "object") findings.push(f("C-2.7", "error", "monitoring block is missing"));
  else {
    if (typeof mon.enabled !== "boolean") findings.push(f("C-2.7", "error", `monitoring.enabled '${mon.enabled}' is not boolean`));
    if (!MONITOR_FREQ.includes(mon.frequency)) findings.push(f("C-2.7", "error", `monitoring.frequency '${mon.frequency}' is not one of: ${MONITOR_FREQ.join(", ")}`));
  }
  const ch = fm.content_hash;
  const chOk = typeof ch === "string" && CONTENT_HASH_RE.test(ch);
  if (ch !== void 0 && ch !== null && ch !== "" && !chOk) {
    findings.push(f("C-2.7", "error", `content_hash '${String(ch).slice(0, 24)}\u2026' is not sha256:<64 hex>`));
  }
  const dsRaw = ctx.files.get("data/dataset.json");
  if (dsRaw && chOk) {
    try {
      const canon = canonicalJson(JSON.parse(asText(dsRaw)));
      const actual = "sha256:" + await ctx.sha256(canon);
      if (actual !== ch) {
        findings.push(f(
          "C-2.7",
          "error",
          `content_hash does not match the canonicalized data/dataset.json (declared ${ch.slice(7, 19)}\u2026, actual ${actual.slice(7, 19)}\u2026)`,
          ["refresh content_hash and append a change record", "restore data/dataset.json from history"]
        ));
      }
    } catch {
    }
  }
  if (fm.current_state === "verified") {
    if (!chOk) findings.push(f("C-2.7", "error", "verified state requires a well-formed content_hash"));
    if (!dsRaw) findings.push(f("C-2.7", "error", "verified state requires data/dataset.json"));
    const hasSnap = [...ctx.files.keys()].some((p) => p.startsWith("snapshots/")) || ctx.elided && [...ctx.elided].some((p) => p.startsWith("snapshots/"));
    if (!hasSnap) findings.push(f("C-2.7", "error", "verified state requires at least one file in snapshots/"));
  }
  const chRaw = ctx.files.get("data/changes.json");
  if (chRaw) {
    try {
      const recs = JSON.parse(asText(chRaw));
      const arr = recs && Array.isArray(recs.records) ? recs.records : null;
      if (!arr) findings.push(f("C-2.7", "error", 'data/changes.json must be {"records": [...]}'));
      else for (let i = 0; i < arr.length; i++) {
        const r = arr[i];
        if (!r || !ISO_TS_RE.test(r.detected || "") || !["modified", "removed", "corrected"].includes(r.kind) || !r.summary) {
          findings.push(f("C-2.7", "error", `changes.json records[${i}] lacks detected/kind/summary in the required shape`));
        }
      }
    } catch {
    }
  }
}
var REL_VOCAB = ["cites", "relates_to", "elevated_into", "initiates", "derived_from", "supersedes", "corroborates", "links_to", "responds_to"];
var SOURCE_ASSERTED_RELS = ["links_to"];
var EDGE_STATUS = ["proposed", "confirmed", "severed"];
function sectionText(body, heading) {
  const idx = body.indexOf(heading);
  if (idx < 0) return null;
  const next = body.indexOf("\n## ", idx + 1);
  return body.slice(idx, next === -1 ? void 0 : next);
}
var NON_MEMBER_AUTHORS = ["claude", "pwa-client", "daemon", "sweep", "session", "accelerator", "apps-script", "system", "agent", "ai"];
var ACTOR_CLASSES = ["daemon", "session", "member"];
var MACHINE_AUTHOR_PREFIX = "token:";
var MACHINE_CLASS_PREFIX = "class:";
var MACHINE_STAMP_PREFIXES = [MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX];
function isMachineStamp(who) {
  const s = String(who ?? "").trim().toLowerCase();
  return s !== "" && MACHINE_STAMP_PREFIXES.some((p) => s.startsWith(p));
}
function isMachineIdentity(who) {
  const s = String(who ?? "").trim().toLowerCase();
  if (s === "") return false;
  return isMachineStamp(s) || ACTOR_CLASSES.includes(s) || NON_MEMBER_AUTHORS.includes(s);
}
var SUFFICIENCY_UNCLAIMED = "none:independent-sufficiency";
var SUFFICIENCY_CLAIM_STATES = {
  claimed: "a member said this group of reasons would carry the answer on its own, and the record holds their name and the date",
  unclaimed: "nobody said this group of reasons would carry the answer on its own, and the record states that outright rather than leaving it blank",
  unstated: "the record does not say whether anyone claimed this group of reasons would carry the answer on its own",
  machine_stamped: "a machine credential stands where the name of the member making that claim has to be, so no member has claimed anything here"
};
function sufficiencyClaimState(assertedBy) {
  const s = String(assertedBy ?? "").trim();
  if (s === "") return "unstated";
  if (s.toLowerCase() === SUFFICIENCY_UNCLAIMED) return "unclaimed";
  if (isMachineIdentity(s)) return "machine_stamped";
  return "claimed";
}
function isSufficiencyClaimed(assertedBy) {
  return sufficiencyClaimState(assertedBy) === "claimed";
}
function isSufficiencyUnclaimed(assertedBy) {
  return sufficiencyClaimState(assertedBy) === "unclaimed";
}
var CONTENT_MINTED_BY_PLANE = "plane";
var CONTENT_MINT_STATES = {
  member_marked: "a member marked this passage as citable, and the record holds their name and the date",
  plane_minted: "this record minted this reference when a member first cited the passage in their own words \u2014 it is the address of what that member pointed at, and not a separate claim about the document",
  machine_marked: "a machine credential marked this passage as citable. That is machine work, labelled as machine work: it can lay the passage beside the question and it can never attest that the text matches the page, and nothing here is part of a finding until a member cites it themselves",
  unstated: "the record does not say who marked this passage as citable"
};
function contentMintState(mintedBy) {
  const s = String(mintedBy ?? "").trim();
  if (s.length === 0) return "unstated";
  if (s.toLowerCase() === CONTENT_MINTED_BY_PLANE) return "plane_minted";
  if (isMachineIdentity(s)) return "machine_marked";
  return "member_marked";
}
function isMachineMinted(mintedBy) {
  return contentMintState(mintedBy) === "machine_marked";
}
function latestHistorySnapshot(ctx) {
  const snaps = [...ctx.files.keys()].filter((p) => /^_history\/bundle_.*\.md$/.test(p)).sort();
  return snaps.length ? snaps[snaps.length - 1] : null;
}
function checkAppendOnly(ctx, findings) {
  const snapPath = latestHistorySnapshot(ctx);
  if (!snapPath || !ctx.fm) return;
  const snap = parseFrontmatter(asText(ctx.files.get(snapPath)));
  if (!snap.data) return;
  for (const key of ["state_history", "conclusions"]) {
    const prior = Array.isArray(snap.data[key]) ? snap.data[key] : [];
    const live = Array.isArray(ctx.fm[key]) ? ctx.fm[key] : [];
    if (live.length < prior.length) {
      findings.push(f("C-5.1", "error", `${key} shrank from ${prior.length} to ${live.length} entries vs. the latest snapshot`, ["restore from _history and re-append new material"]));
    } else {
      for (let i = 0; i < prior.length; i++) {
        if (JSON.stringify(prior[i]) !== JSON.stringify(live[i])) {
          findings.push(f("C-5.1", "error", `${key}[${i}] was modified retroactively (append-only surface)`, ["restore from _history and re-append new material"]));
          break;
        }
      }
    }
  }
  const rn = sectionText(snap.body, "## Review Notes");
  if (rn && rn.trim() !== "## Review Notes" && !ctx.body.includes(rn.trimEnd())) {
    findings.push(f("C-5.1", "error", "Review Notes content from the prior version is missing or altered (verbatim-immutable)", ["restore from _history and re-append new material", "record a tamper finding if history lacks the original"]));
  }
  const priorLog = sectionText(snap.body, "## Session Log") || "";
  for (const header of priorLog.match(/^### Session .*$/gm) || []) {
    if (!ctx.body.includes(header)) {
      findings.push(f("C-5.1", "error", `Session Log entry '${header.slice(0, 60)}' from the prior version is missing (append-only surface)`, ["restore from _history and re-append new material"]));
    }
  }
  const chSnaps = [...ctx.files.keys()].filter((p) => /^_history\/data\/changes_.*\.json$/.test(p)).sort();
  const liveCh = ctx.files.get("data/changes.json");
  if (chSnaps.length && liveCh) {
    try {
      const priorRecs = JSON.parse(asText(ctx.files.get(chSnaps[chSnaps.length - 1]))).records || [];
      const liveRecs = JSON.parse(asText(liveCh)).records || [];
      if (liveRecs.length < priorRecs.length || JSON.stringify(liveRecs.slice(0, priorRecs.length)) !== JSON.stringify(priorRecs)) {
        findings.push(f("C-5.1", "error", "data/changes.json records were mutated or removed (append-only surface)", ["restore from _history and re-append new material"]));
      }
    } catch {
    }
  }
}
function checkReferences(ctx, findings) {
  const refs = Array.isArray(ctx.fm?.references) ? ctx.fm.references : [];
  for (let i = 0; i < refs.length; i++) {
    const r = refs[i];
    if (typeof r !== "object" || r === null) {
      findings.push(f("C-6.1", "error", `references[${i}] is not an object`));
      continue;
    }
    if (!REL_VOCAB.includes(r.rel)) findings.push(f("C-6.1", "error", `references[${i}].rel '${r.rel}' is not in the closed vocabulary`, ["map to the nearest vocabulary value", "sever with reason"]));
    if (SOURCE_ASSERTED_RELS.includes(r.rel)) {
      if (r.asserted_by !== "source")
        findings.push(f("C-6.1", "error", `references[${i}].rel '${r.rel}' is source-asserted and must carry asserted_by: 'source', so it is never read as a member's claim`));
      if (typeof r.address !== "string" || !r.address)
        findings.push(f("C-6.1", "error", `references[${i}].rel '${r.rel}' must carry the address the source wrote, as a comment string beside the canonical target`));
      if (!["contemporaneous", "superseded", "undetermined"].includes(r.verdict))
        findings.push(f("C-6.1", "error", `references[${i}].rel '${r.rel}' must carry a contemporaneity verdict of contemporaneous, superseded or undetermined; undetermined is the resting state and must be stated rather than omitted`));
    } else if (r.asserted_by === "source") {
      findings.push(f("C-6.1", "error", `references[${i}].rel '${r.rel}' is a member's relation and cannot be asserted_by 'source'`));
    }
    if (!EDGE_STATUS.includes(r.status)) findings.push(f("C-6.1", "error", `references[${i}].status '${r.status}' is not one of: ${EDGE_STATUS.join(", ")}`));
    const t = r.target;
    if (typeof t !== "string" || /:\/\/|[/\\]|drive\.google/i.test(t)) {
      findings.push(f("C-6.1", "error", `references[${i}].target '${String(t).slice(0, 40)}' looks like a substrate locator; targets are canonical IDs only`));
    } else if (!BUNDLE_ID_RE.test(t)) {
      findings.push(f("C-6.1", "error", `references[${i}].target '${t}' does not match the canonical ID grammar`));
    } else if (ctx.resolveTarget) {
      if (!ctx.resolveTarget(t)) {
        findings.push(f("C-6.2", "error", `references[${i}].target '${t}' does not resolve in the store`, ["restore target from history", "re-point to the successor object (derived_from chain)", "sever the edge with a reason note"]));
      }
    }
  }
  if (ctx.fm?.workproduct_state === "distributed") {
    const hasDist = [...ctx.files.keys()].some((p) => p.startsWith("distributions/"));
    if (!hasDist) findings.push(f("C-6.3", "error", "workproduct_state is distributed but distributions/ is empty"));
  }
  supersedesEdgeFindings(ctx.fm, findings);
  respondsToEdgeFindings(ctx.fm, findings);
  divisionDisclosureFindings(ctx.fm, findings);
}
function supersedesEdgeFindings(fm, findings) {
  const refs = Array.isArray(fm?.references) ? fm.references : [];
  refs.forEach((r, i) => {
    if (!r || typeof r !== "object" || r.rel !== "supersedes") return;
    if (typeof r.reason !== "string" || r.reason.trim() === "") {
      findings.push(f(
        "C-6.1",
        "error",
        `references[${i}] is a supersedes edge with no reason: supersession says this question replaced that one, and a replacement with no account of why cannot be checked by anyone`,
        ["author the reason this supersedes its target", "or use relates_to, which claims nothing about replacement"]
      ));
    }
    if (typeof r.target !== "string" || !BUNDLE_ID_RE.test(r.target)) {
      findings.push(f("C-6.1", "error", `references[${i}] is a supersedes edge whose target '${String(r.target).slice(0, 40)}' is not a canonical bundle id: an edge that asserts a lineage must name the thing it came from`));
    }
  });
}
function respondsToEdgeFindings(fm, findings) {
  const refs = Array.isArray(fm?.references) ? fm.references : [];
  refs.forEach((r, i) => {
    if (!r || typeof r !== "object" || r.rel !== "responds_to") return;
    const target = typeof r.target === "string" ? r.target : "";
    if (!BUNDLE_ID_RE.test(target) || OBJECT_TYPES[target.split("-")[0]] !== "action") {
      findings.push(f(
        "C-6.1",
        "error",
        `references[${i}] is a responds_to edge whose target '${String(r.target).slice(0, 40)}' is not an ACTION: this edge says "this is what came back when we asked", so it points at the ask`,
        [
          "point the edge at the ACTN- bundle whose correspondence this answers",
          "or use relates_to, which claims nothing about an exchange"
        ]
      ));
    }
  });
}
function divisionDisclosureFindings(fm, findings) {
  if (normalizeType(fm?.object_type) !== "inquiry") return;
  const refs = Array.isArray(fm?.references) ? fm.references : [];
  const supers = refs.filter((r) => r && typeof r === "object" && r.rel === "supersedes" && typeof r.target === "string" && normalizeType(OBJECT_TYPES[r.target.split("-")[0]]) === "inquiry");
  const parent = typeof fm?.division_parent === "string" && fm.division_parent !== "null" ? fm.division_parent : null;
  const sibsRaw = fm?.division_siblings;
  const sibs = Array.isArray(sibsRaw) ? sibsRaw.filter((x) => typeof x === "string" && x !== "") : null;
  if (!parent && supers.length === 0) return;
  if (supers.length && !parent) {
    findings.push(f(
      "C-6.1",
      "error",
      `this document carries a supersedes edge to ${supers[0].target} and declares no division_parent: a question that superseded another discloses which division it came out of, so a reader who can see one half can see that the other half exists (R4)`,
      ["set division_parent to the inquiry this was divided out of", "or sever the supersedes edge"]
    ));
  }
  if (parent && !supers.some((r) => r.target === parent)) {
    findings.push(f(
      "C-6.1",
      "error",
      `division_parent names ${parent} with no supersedes edge to it: the disclosure and the edge are two views of one fact and cannot disagree`,
      [`add a references[] entry {rel: supersedes, target: ${parent}} with its reason`]
    ));
  }
  if (!parent) return;
  if (sibs === null || sibs.length === 0) {
    findings.push(f(
      "C-6.1",
      "error",
      `division_parent names ${parent} and division_siblings is ${sibs === null ? "absent" : "empty"}: a division produces at least two questions, so a child of one always has at least one sibling to name \u2014 NO_SIBLING_DISCLOSURE`,
      ["name every OTHER child of this division in division_siblings"]
    ));
    return;
  }
  for (const s of sibs) {
    if (!BUNDLE_ID_RE.test(s)) findings.push(f("C-6.1", "error", `division_siblings names '${String(s).slice(0, 40)}', which is not a canonical bundle id`));
    if (s === parent) findings.push(f("C-6.1", "error", `division_siblings names ${s}, which is this document's division_parent: the parent is disclosed as the parent, and listing it as a sibling would hide that one of the halves is missing`));
    if (typeof fm.id === "string" && s === fm.id) findings.push(f("C-6.1", "error", `division_siblings names this document itself: a sibling set that counts the child is a set that can look complete while a real sibling is absent`));
  }
}
function checkHistoryCoherence(ctx, findings) {
  const histFiles = [...ctx.files.keys()].filter((p) => p.startsWith("_history/"));
  const manRaw = ctx.files.get("_history/manifest.json");
  if (!manRaw) {
    if (histFiles.length) findings.push(f("C-12.1", "error", "_history contains files but no manifest.json", ["rebuild manifest entry from surviving files"]));
    return;
  }
  let man;
  try {
    man = JSON.parse(asText(manRaw));
  } catch {
    findings.push(f("C-12.1", "error", "_history/manifest.json does not parse", ["rebuild manifest entry from surviving files"]));
    return;
  }
  const entries = Array.isArray(man.entries) ? man.entries : [];
  const keys = /* @__PURE__ */ new Set();
  let prevKey = "";
  const bundleMdCreated = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    for (const k of ["key", "kind", "created", "files"]) if (!(k in (e || {}))) findings.push(f("C-12.1", "error", `manifest entry[${i}] missing '${k}'`));
    if (e?.key) {
      if (keys.has(e.key)) findings.push(f("C-12.1", "error", `duplicate manifest key '${e.key}'`));
      if (e.key < prevKey) findings.push(f("C-12.1", "error", `manifest keys out of order at '${e.key}'`));
      keys.add(e.key);
      prevKey = e.key;
    }
    if (typeof e?.created === "string" && Array.isArray(e?.snapshotted) && e.snapshotted.includes("bundle.md")) {
      bundleMdCreated.push(e.created);
    }
    if (e?.kind === "promotion" && e.key && !ctx.files.has(`_history/promotion_${e.key}.json`)) {
      findings.push(f("C-12.2", "error", `promotion record for '${e.key}' is missing`, ["rebuild manifest entry from surviving files", "record a history-loss finding and re-snapshot current state"]));
    }
    if (Array.isArray(e?.snapshotted)) {
      for (const name of e.snapshotted) {
        const dot = name.lastIndexOf(".");
        const snapPath = `_history/${name.slice(0, dot)}_${e.key}${name.slice(dot)}`;
        if (!hasFile_(ctx, snapPath)) {
          findings.push(f("C-12.2", "error", `snapshot '${snapPath}' recorded in manifest entry '${e.key}' is missing`, ["record a history-loss finding and re-snapshot current state"]));
        }
      }
    }
  }
  const REFUSAL_RECORD = /^_history\/refused_(\d{8}T\d{6}Z_[0-9a-f]{8,64}|unknown_[0-9a-f]{8,64}|[^/]*nomanifest)\.json$/;
  const REFUSAL_PAYLOAD = /^_history\/refused_(\d{8}T\d{6}Z_[0-9a-f]{8,64}|unknown_[0-9a-f]{8,64}|[^/]*nomanifest)\//;
  for (const p of histFiles) {
    if (p === "_history/manifest.json") continue;
    const rec = REFUSAL_RECORD.exec(p);
    if (rec) {
      let parsed = null;
      try {
        parsed = JSON.parse(asText(ctx.files.get(p)));
      } catch {
      }
      if (!parsed || !parsed.outcome) {
        findings.push(f(
          "C-12.2",
          "error",
          `refusal record '${p}' does not parse or names no outcome`,
          ["restore the refusal record from history", "remove the unexplained refusal artifacts"]
        ));
      }
      continue;
    }
    const pay = REFUSAL_PAYLOAD.exec(p);
    if (pay) {
      const sibling = `_history/refused_${pay[1]}.json`;
      if (!ctx.files.has(sibling)) {
        findings.push(f(
          "C-12.2",
          "error",
          `preserved refusal payload '${p}' has no refusal record at '${sibling}'`,
          ["restore the refusal record", "remove the orphaned preserved payload"]
        ));
      }
      continue;
    }
    const m = /_((?:\d{8}T\d{6}Z)_[0-9a-f]{8})\./.exec(p) || /^_history\/promotion_(.+)\.json$/.exec(p);
    const key = m ? m[1] : null;
    if (!key || !keys.has(key)) {
      findings.push(f("C-12.2", "error", `history file '${p}' maps to no manifest entry`, ["rebuild manifest entry from surviving files"]));
    }
  }
  const sorted = bundleMdCreated.slice().sort();
  sorted.pop();
  const newestPrior = sorted.length ? sorted[sorted.length - 1] : "";
  if (typeof ctx.fm?.last_updated === "string" && newestPrior && ctx.fm.last_updated < newestPrior) {
    findings.push(f(
      "C-12.1",
      "error",
      `live last_updated '${ctx.fm.last_updated}' precedes an earlier history entry '${newestPrior}': the live bundle.md is older than a version already superseded`,
      ["restore the newer bundle.md from history", "correct last_updated to reflect the live content"]
    ));
  }
}
function checkRecheckCoverage(ctx, findings) {
  if (normalizeType(ctx.fm?.object_type) !== "inquiry") return;
  const rts = Array.isArray(ctx.fm.recheck_triggers) ? ctx.fm.recheck_triggers : [];
  if (rts.length === 0) {
    findings.push(f("C-15.1", "error", "every Problem, in every disposition including dismissed, carries at least one recheck trigger", ["author a trigger, dual-audience shape, dated when time-bound"]));
    return;
  }
  for (let i = 0; i < rts.length; i++) {
    const t = rts[i];
    if (typeof t !== "object" || !t?.text || !t?.description) {
      findings.push(f("C-15.1", "error", `recheck_triggers[${i}] lacks the dual-audience {text, description} shape`));
    } else if (t.date !== void 0 && !/^\d{4}-\d{2}-\d{2}$/.test(String(t.date))) {
      findings.push(f("C-15.1", "error", `recheck_triggers[${i}].date '${t.date}' is not YYYY-MM-DD`));
    }
  }
}
var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function checkInquiryExtension(ctx, findings) {
  if (normalizeType(ctx.fm?.object_type) !== "inquiry") return;
  const fm = ctx.fm;
  if (!["agent", "human"].includes(fm.surfaced_by)) {
    findings.push(f("C-2.8", "error", `surfaced_by '${fm.surfaced_by}' is not one of: agent, human`));
  }
  if (["deferred", "dismissed"].includes(fm.current_state)) {
    if (typeof fm.disposition_reason !== "string" || fm.disposition_reason.trim() === "") {
      findings.push(f("C-2.8", "error", `${fm.current_state} state requires a non-empty disposition_reason`));
    }
  }
  if (fm.current_state === "concluded") {
    if (typeof fm.conclusion !== "string" || fm.conclusion.trim() === "") {
      findings.push(f(
        "C-2.8",
        "error",
        "concluded state requires a non-empty conclusion",
        ["author the conclusion where the document stands: reopening does not pick a concluded inquiry back up (op=reopen answers NOT_SET_DOWN), so there is no act that undoes the conclusion and the repair is made in place"]
      ));
    }
    const ovBy = typeof fm.falsifier_override_by === "string" ? fm.falsifier_override_by.trim() : "";
    const ovAt = typeof fm.falsifier_override_at === "string" ? fm.falsifier_override_at.trim() : "";
    const falsStated = typeof fm.falsifier === "string" && fm.falsifier.trim() !== "";
    if (!falsStated && !ovBy && !ovAt) {
      findings.push(f(
        "C-2.8",
        "error",
        "concluded state requires a non-empty falsifier: a conclusion that names nothing which would overturn it cannot be checked by anyone, including its author",
        [
          "state what evidence would falsify this conclusion",
          "or, if none can honestly be stated, record the absence: conclude with no_falsifier=1 so the record carries who accepted it and when"
        ]
      ));
    } else if (!falsStated && !(ovBy && ovAt)) {
      findings.push(f(
        "C-2.8",
        "error",
        "concluded state has no falsifier and only a HALF-RECORDED override: an override missing its " + (ovBy ? "date" : "member") + " is a silent one, and a record that has stopped requiring a falsifier without saying who accepted that claims more than it can support",
        ["record both falsifier_override_by and falsifier_override_at, or state a falsifier"]
      ));
    } else if (falsStated && (ovBy || ovAt)) {
      findings.push(f(
        "C-2.8",
        "error",
        "concluded state carries BOTH an authored falsifier and a record that none was stated: those are two contradictory claims about this finding and nothing may choose between them",
        [
          "remove the falsifier_override_by/at pair if the falsifier stands",
          "or clear the falsifier if the absence is what the member meant to record"
        ]
      ));
    }
    if (!Array.isArray(fm.basis) || fm.basis.length < 1) {
      findings.push(f(
        "C-2.8",
        "error",
        "concluded state requires at least one basis leg: an open inquiry may rest on nothing (a standing objective), a conclusion may not",
        ["add a basis[] leg naming what the conclusion rests on, and the same target in references[]"]
      ));
    }
  }
  if (isCaseMemberBytes(fm)) checkPublishedExtension(fm, findings);
  for (const k of [
    "case_id",
    "case_edition",
    "case_project",
    "case_scope",
    "case_findings",
    "case_roles",
    "bias_acknowledgement",
    "required_strength"
  ]) {
    const v = fm?.[k];
    if (v === void 0 || v === null || v === "" || v === "null") continue;
    findings.push(f(
      "C-2.8",
      "error",
      `a finding's bytes name a case (${k}): since CASE-5b the case's own assertions \u2014 its identity, its edition, its producing project, its scope, its roster, its load-bearing partition, its bias acknowledgement and its bar \u2014 are signed ONCE, in the CASE DOCUMENT a member reviews and ratifies (op=caseratify), and not N times in N members' frontmatter. A finding is a member of a case because the case pinned its version hash, and that pin is inside the bytes the case's signer signed`,
      [
        `remove ${k} from this document's frontmatter`,
        "the case states these facts once, in its own signed document"
      ]
    ));
  }
  if (fm.current_state === "divided") checkDividedExtension(fm, findings);
  if (fm.subject_entity !== void 0 && fm.subject_entity !== null && fm.subject_entity !== "") {
    if (typeof fm.subject_entity !== "string" || !ENTITY_ID_RE.test(fm.subject_entity)) {
      findings.push(f(
        "C-2.8",
        "error",
        `subject_entity '${String(fm.subject_entity).slice(0, 40)}' is not a subject registry key (ENT-YYYY-NNNN)`,
        ["point subject_entity at an entry in the subject registry (op=entitycreate / op=entitybyalias), or omit it \u2014 an inquiry may name no subject, and then no leg of it earns an A/B/C connection grade (DEC-15)"]
      ));
    }
  }
  checkInquiryBasis(fm, findings, ctx.publishedRegistry, ctx.earnedRegistry);
}
function checkDividedExtension(fm, findings) {
  const d = typeof fm.division === "object" && fm.division && !Array.isArray(fm.division) ? fm.division : null;
  if (!d) {
    findings.push(f(
      "C-2.8",
      "error",
      "divided state requires a division block: a question recorded as divided with no account of the division is a state change wearing a correction's clothes",
      /* REC-56 / D-203's sweep, third site: `divided` is TERMINAL — `divided:
         []` — so `divided -> open` is not an edge and C-4.2 refuses it by name,
         the same shape as `verified -> collected`. It is terminal
         STRUCTURALLY rather than by policy (the parent's legs are owned by its
         children now), so this is the one arm in the family where no state move
         exists in either direction and the honest advice says so.
         The first repair is UNCHANGED and is not a directive to run the op now
         — `op=inquirydivide` does not apply at `divided` either — it states
         where a division block legitimately comes from, which is C-20.1's
         `re-produce the creation at collected` shape exactly. */
      [
        "divide through op=inquirydivide, which authors the block and stamps who apportioned and when",
        "restore the division block from _history if the division was made and the block was lost",
        "otherwise raise it: the repair here is not a state move, and C-4.2 refuses any transition this machine does not carry"
      ]
    ));
    return;
  }
  const into = Array.isArray(d.into) ? d.into.filter((x) => typeof x === "string") : [];
  if (into.length < 2) {
    findings.push(f(
      "C-2.8",
      "error",
      `division.into names ${into.length} child inquir${into.length === 1 ? "y" : "ies"}: a division produces at least TWO questions, because one is a rename and zero is a deletion`,
      ["name every child the question was divided into"]
    ));
  }
  for (const id of into) {
    if (!BUNDLE_ID_RE.test(id)) findings.push(f("C-2.8", "error", `division.into names '${String(id).slice(0, 40)}', which is not a canonical bundle id`));
  }
  if (new Set(into).size !== into.length) {
    findings.push(f("C-2.8", "error", "division.into names the same child twice: a leg apportioned to a child named twice has one home, not two"));
  }
  if (typeof d.reason !== "string" || d.reason.trim() === "") {
    findings.push(f(
      "C-2.8",
      "error",
      "division requires a non-empty reason: the reason belongs to the ACT (DEC-28), and a restructuring nobody accounted for is indistinguishable from one nobody should have made",
      ["author the reason the question was two questions"]
    ));
  }
  if (typeof d.apportioned_by !== "string" || d.apportioned_by.trim() === "" || isMachineIdentity(d.apportioned_by)) {
    findings.push(f("C-2.8", "error", `division.apportioned_by '${d.apportioned_by}' is not a named member: apportionment is AUTHORED and never automatic, so the record carries the name of whoever decided where each leg went`));
  }
  if (!ISO_TS_RE.test(String(d.at || ""))) {
    findings.push(f("C-2.8", "error", `division requires 'at' as an ISO timestamp (got '${d.at}')`));
  }
  const legs = Array.isArray(fm.basis) ? fm.basis : [];
  const rows = Array.isArray(fm.division_apportionment) ? fm.division_apportionment : null;
  if (!rows) {
    findings.push(f(
      "C-2.8",
      "error",
      "divided state requires a division_apportionment field: the parent records WHERE EVERY LEG WENT, because dividing must not be a cheaper way to shed a finding that cuts against you than severing it (R4)",
      ["author one apportionment row per basis leg, naming the child it went to"]
    ));
    return;
  }
  const homes = /* @__PURE__ */ new Map();
  rows.forEach((r, i) => {
    if (!r || typeof r !== "object") {
      findings.push(f("C-2.8", "error", `division_apportionment[${i}] is not an object`));
      return;
    }
    if (!Number.isInteger(r.ord) || r.ord < 0 || r.ord >= legs.length) {
      findings.push(f("C-2.8", "error", `division_apportionment[${i}].ord '${r.ord}' does not name a leg of this inquiry's basis (0..${legs.length - 1}): a leg is addressed by its ORDINAL, because one document legitimately carries two legs (D4)`));
      return;
    }
    if (typeof r.to !== "string" || !into.includes(r.to)) {
      findings.push(f("C-2.8", "error", `division_apportionment[${i}].to '${r.to}' is not one of the children named in division.into: a leg's home is a child of THIS division`));
      return;
    }
    const leg = legs[r.ord];
    if (leg && typeof leg === "object" && typeof r.target === "string" && r.target !== leg.target) {
      findings.push(f("C-2.8", "error", `division_apportionment[${i}] names target '${r.target}' at ord ${r.ord}, where the basis carries '${leg.target}': the account and the basis are two views of one document and cannot disagree`));
    }
    if (!homes.has(r.ord)) homes.set(r.ord, /* @__PURE__ */ new Set());
    homes.get(r.ord).add(r.to);
  });
  const orphans = [];
  for (let i = 0; i < legs.length; i++) if (!homes.has(i)) orphans.push(i);
  if (orphans.length) {
    const cutting = orphans.filter((i) => legs[i] && legs[i].role === "cuts_against");
    findings.push(f(
      "C-2.8",
      "error",
      `basis leg${orphans.length === 1 ? "" : "s"} ${orphans.join(", ")} ${orphans.length === 1 ? "has" : "have"} no home in the apportionment${cutting.length ? ` (including ${cutting.length} that cut${cutting.length === 1 ? "s" : ""} AGAINST this inquiry)` : ""}: every leg gets a home on a child, because division RE-HOMES material and only severance REMOVES it (R4)`,
      ["apportion the remaining leg(s) to a child", "or sever them with a reason, which is the act that removes material"]
    ));
  }
  const empty = into.filter((c) => ![...homes.values()].some((s) => s.has(c)));
  if (empty.length) {
    findings.push(f("C-2.8", "error", `division.into names ${empty.join(", ")}, which received no leg of the parent's basis: a child that inherits nothing is a new question, not a half of this one`));
  }
}
var SUBJECT_POSITIONS = ["sought_and_answered", "sought_no_answer", "not_sought"];
var STRENGTH_STATES = ["graded", "unrated", "undetermined"];
var CASE_MEMBER_ROLES = ["load_bearing", "supporting"];
function biasAcknowledgementOf(fm) {
  const v = fm && typeof fm.bias_acknowledgement === "string" ? fm.bias_acknowledgement : null;
  return v === null || v === "null" ? null : v;
}
function completenessFields(fm) {
  const c = fm && typeof fm.completeness === "object" && fm.completeness || {};
  const rows = Array.isArray(fm?.completeness_excluded) ? fm.completeness_excluded : [];
  return {
    statement: typeof c.statement === "string" ? c.statement : null,
    subject_justification: typeof c.subject_justification === "string" ? c.subject_justification : null,
    excluded: JSON.stringify(rows.map((r) => [
      r && typeof r.target === "string" ? r.target : null,
      r && typeof r.description === "string" ? r.description : "",
      r && typeof r.reason === "string" ? r.reason : ""
    ]))
  };
}
function checkPublishedExtension(fm, findings) {
  const e = fm.edition;
  if (!Number.isInteger(e) || e < 1) {
    findings.push(f(
      "C-2.8",
      "error",
      `a case member requires an integer edition of 1 or more (got '${e}'): an edition is what makes a revision safe \u2014 edition 2 does not overwrite edition 1, it joins it (DEC-12)`,
      ["publish through op=publish, which stamps the edition from the published record"]
    ));
  }
  const c = typeof fm.completeness === "object" && fm.completeness || null;
  if (!c) {
    findings.push(f(
      "C-2.8",
      "error",
      "a case member requires a completeness block: a case that says nothing about what it does not cover is claiming to cover everything",
      /* REC-56 / D-203's sweep, fourth site, and this one had a REACHABLE act
         available that the old string did not name. `published: ['open',
         'surfaced']` — `published -> concluded` is NOT an edge, so "move the
         inquiry back to concluded" fires C-4.2. What IS reachable is the full
         ceremony the STATES table's own comment describes, and `op=reopen` DOES
         apply, precisely so a legal edge is not left with no caller. So the
         correction here names an act rather than only refusing one.
         CORRECTED AGAIN 2026-09-10 (CASE-4 / DEC-72), never exempted, AND THE
         EDGE IS WHAT MOVED — not the advice. The route was `published -> open`
         because a case member wore `published`; DEC-72 ends that state, a member
         sits at `concluded`, and the ceremony is now `concluded -> open ->
         concluded` with a new edition published from there. `op=reopen` still
         applies, for the same reason it always did: its gate is now "a
         disposition OR a case member", so a case member reopens and a concluded
         finding in no case is still refused NOT_SET_DOWN. REC-56's whole point is
         that a repair string must name a route that EXISTS, and
         `repair-reachability.test.mjs` is the instrument that catches it when one
         stops existing — which is exactly how this line was found. */
      [
        "author completeness.statement and the exclusion list",
        "or reopen this case for a second edition (concluded -> open, op=reopen) and carry it back through conclude and publish: an edition is not edited back into concluded, and reopening does not unpublish edition 1 (DEC-12, DEC-72)"
      ]
    ));
  } else {
    if (typeof c.statement !== "string" || c.statement.trim() === "") {
      findings.push(f("C-2.8", "error", "a case member requires a non-empty completeness.statement"));
    }
    if (typeof c.author !== "string" || c.author.trim() === "") {
      findings.push(f("C-2.8", "error", "a case member requires completeness.author: the completeness assertion is a named member's claim about the limits of this case"));
    }
    if (!ISO_TS_RE.test(String(c.at || ""))) {
      findings.push(f("C-2.8", "error", `a case member requires completeness.at as an ISO timestamp (got '${c.at}')`));
    }
    if (!SUBJECT_POSITIONS.includes(c.subject_position)) {
      findings.push(f(
        "C-2.8",
        "error",
        `a case member requires completeness.subject_position, one of: ${SUBJECT_POSITIONS.join(", ")} (got '${c.subject_position}'). The gate is that the position is declared and justified \u2014 never that contact happened, and never that the answer was favourable (DEC-13)`,
        ["declare the group's position on putting this case to its subject"]
      ));
    }
    if (typeof c.subject_justification !== "string" || c.subject_justification.trim() === "") {
      findings.push(f(
        "C-2.8",
        "error",
        "a case member requires completeness.subject_justification: a declared position with no reasoning behind it is the checkbox this gate exists to refuse. A group that sought comment says so and prints what came back; a group that deliberately did not says so and says why, and a reader weighs that justification exactly as they weigh any other declared bias (DEC-13)",
        ["justify the position \u2014 including a deliberate decision not to give notice"]
      ));
    }
  }
  if (!Array.isArray(fm.completeness_excluded)) {
    findings.push(f(
      "C-2.8",
      "error",
      "a case member requires a completeness_excluded field: an EMPTY list is a claim (this case left nothing out) and is legal \u2014 an ABSENT field is silence, and silence about what a case excludes is what the completeness assertion exists to refuse",
      ["author completeness_excluded, empty if nothing was excluded"]
    ));
  } else {
    fm.completeness_excluded.forEach((r, i) => {
      if (!r || typeof r !== "object") {
        findings.push(f("C-2.8", "error", `completeness_excluded[${i}] is not an object`));
        return;
      }
      const named = typeof r.target === "string" && BUNDLE_ID_RE.test(r.target);
      const prose = typeof r.description === "string" && r.description.trim() !== "";
      if (!named && !prose) {
        findings.push(f(
          "C-2.8",
          "error",
          `completeness_excluded[${i}] names neither a target nor a description: every exclusion row carries a target id OR prose, never neither`,
          ["name the excluded bundle by id", "or describe what was excluded in prose"]
        ));
      }
      if (typeof r.reason !== "string" || r.reason.trim() === "") {
        findings.push(f("C-2.8", "error", `completeness_excluded[${i}] carries no reason: WHAT was left out and WHY are two statements and one does not stand in for the other`));
      }
    });
  }
  const axes = Array.isArray(fm.published_strength) ? fm.published_strength : null;
  const axisCount = (a) => (axes || []).filter((x) => x && x.axis === a).length;
  const testimonyLeg = Array.isArray(fm.basis) && fm.basis.some((l) => l && typeof l === "object" && l.grade_axis === "testimony" && l.grade !== void 0 && l.grade !== null);
  if (!axes || axisCount("capture") !== 1 || axisCount("connection") !== 1 || axisCount("testimony") > 1 || axes.some((x) => !x || !GRADE_AXES.includes(x.axis))) {
    findings.push(f(
      "C-2.8",
      "error",
      `a case member requires published_strength carrying BOTH axes, capture and connection, once each, and nothing but the axes this record measures (${GRADE_AXES.join(", ")}): a case does not have "a strength", it has one per axis, and composing them into one letter is the substitution R2 forbids`,
      ["publish through op=publish, which stamps the frozen axis objects into the bytes"]
    ));
  } else if (testimonyLeg && axisCount("testimony") !== 1) {
    findings.push(f(
      "C-2.8",
      "error",
      "a case member whose basis carries a testimony grade requires a published_strength row for the testimony axis: the case rests on a member's word, and the frozen bytes must say at what, beside the capture and connection axes and never folded into either",
      ["publish through op=publish, which freezes the testimony axis whenever it carries anything"],
      "testimony-axis-unfrozen"
    ));
  } else {
    for (const a of axes) {
      if (!STRENGTH_STATES.includes(a.state)) {
        findings.push(f("C-2.8", "error", `published_strength.${a.axis} state '${a.state}' is not one of: ${STRENGTH_STATES.join(", ")}`));
      } else if (a.state === "graded" && !BASIS_GRADES.includes(a.grade)) {
        findings.push(f("C-2.8", "error", `published_strength.${a.axis} is graded but carries no grade`));
      } else if (a.state !== "graded" && a.grade != null) {
        findings.push(f("C-2.8", "error", `published_strength.${a.axis} is ${a.state} and still carries grade '${a.grade}': ${a.state === "unrated" ? "UNRATED is not a low score, it is nothing established on this axis" : "undetermined is what we do not know, not a grade"}`));
      }
    }
  }
  const grouped = Array.isArray(fm.basis) && fm.basis.some((l) => l && typeof l === "object" && typeof l.ground === "string" && l.ground !== "");
  const frozenGrounds = Array.isArray(fm.published_strength_grounds) ? fm.published_strength_grounds : null;
  if (grouped && !frozenGrounds) {
    findings.push(f(
      "C-2.8",
      "error",
      'a case member requires published_strength_grounds when the basis names grounds: the grade above is the STRONGEST ground rather than the weakest leg, and "these grounds were each independently sufficient" is a claim a reader can only test if the case says which legs were in which branch and what each branch reached',
      ["publish through op=publish, which freezes the per-ground breakdown beside the pair"]
    ));
  } else if (grouped) {
    for (let i = 0; i < frozenGrounds.length; i++) {
      const g = frozenGrounds[i];
      if (!g || typeof g !== "object") {
        findings.push(f("C-2.8", "error", `published_strength_grounds[${i}] is not an object`));
        continue;
      }
      if (!GRADE_AXES.includes(g.axis)) {
        findings.push(f("C-2.8", "error", `published_strength_grounds[${i}].axis '${g.axis}' is not one of: ${GRADE_AXES.join(", ")} \u2014 the branches are composed PER AXIS and both axes are frozen separately (DEC-21)`));
      }
      if (!STRENGTH_STATES.includes(g.state)) {
        findings.push(f("C-2.8", "error", `published_strength_grounds[${i}].state '${g.state}' is not one of: ${STRENGTH_STATES.join(", ")}`));
      } else if (g.state === "graded" && !BASIS_GRADES.includes(g.grade)) {
        findings.push(f("C-2.8", "error", `published_strength_grounds[${i}] is graded but carries no grade`));
      } else if (g.state !== "graded" && g.grade != null) {
        findings.push(f("C-2.8", "error", `published_strength_grounds[${i}] is ${g.state} and still carries grade '${g.grade}': a suspended ground states what is unknown, and an unrated one states that nothing on it is established \u2014 neither is a grade`));
      }
    }
    for (const label of new Set(fm.basis.filter((l) => l && typeof l.ground === "string" && l.ground).map((l) => l.ground))) {
      if (!frozenGrounds.some((g) => g && g.ground === label)) {
        findings.push(f("C-2.8", "error", `published_strength_grounds names no row for ground '${label}': every branch the basis carries is frozen on every axis, because a branch missing from the frozen result is one no reader can check`));
      }
    }
  }
}
var BASIS_ROLES = ["supports", "cuts_against"];
var BASIS_GRADES = ["A", "B", "C", "D"];
var GRADE_AXES = ["capture", "connection", "testimony"];
var TESTIMONY_GRADE = "D";
var GRADE_SOURCES = ["resolution", "testimony", "hunch", "inherited", "capture"];
var EARNED_GRADE_SOURCES = ["resolution", "capture"];
var EARNED_CAPTURE_CEILING = "B";
var UNREACHABLE_CAPTURE_GRADE = BASIS_GRADES[BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING) - 1] ?? null;
var EARNED_SOURCE_AXIS = { resolution: "connection", capture: "capture" };
var GROUND_LABEL_RE = /^[a-z0-9][a-z0-9 _-]{0,47}$/i;
function checkLegExtentGrammar(leg, label, checkId, findings) {
  const bad = checkContentExtent(legExtent(leg), CONTENT_EXTENT_DOCUMENT_ONLY);
  if (bad)
    findings.push(f(
      checkId,
      "error",
      `${label} names an extent this record cannot evaluate: ${bad.detail}`,
      /* CORRECTED 2026-09-14 BY REC-85: this named two landed kinds because two
         were landed when REC-84 wrote it, and the other three landed the same
         day. GUIDANCE THAT NAMES A CLOSED LIST GOES STALE THE MOMENT THE LIST
         MOVES, and stale guidance is worse than none here — it tells a member
         citing a real cell that the record cannot hold the citation, which is
         false and would send them to the whole document instead. The list is
         COMPOSED FROM THE MAP rather than typed, so the next kind to land (or
         `dom`, the day CONTENT-HTML produces one) cannot leave this sentence
         behind: the same rule `describeChain` and the DEC-49 fence composer
         already follow — a sentence built from the value it describes cannot
         come to describe a different one. */
      [
        `name one of the landed extent kinds \u2014 ${Object.entries(CONTENT_EXTENT_KINDS).filter(([, v]) => v.landed).map(([k]) => k).sort().join(", ")} \u2014 with the fields that arm takes`,
        "or drop the extent fields entirely: a citation that names no part means the WHOLE document, which is always a legal thing to cite"
      ],
      bad.code
    ));
  const cid = leg && typeof leg === "object" ? leg.content_id : void 0;
  if (cid !== void 0 && cid !== null && cid !== "") {
    if (typeof cid !== "string" || !CONTENT_ID_RE.test(cid.trim()))
      findings.push(f(
        checkId,
        "error",
        `${label}.content_id '${String(cid).slice(0, 40)}' is not a content id: a part of a document is named by the 64-character lowercase hexadecimal address this record mints for it, and nothing shorter or longer can be one`,
        [
          "copy the content id from the part as this record answers for it",
          "or describe the part instead \u2014 extent_kind and its fields \u2014 and the record will find or mint the entry"
        ]
      ));
    else if (legHasAuthoredExtent(leg))
      findings.push(f(
        checkId,
        "error",
        `${label} names BOTH a content_id and an extent: these are one fact written twice and they can disagree, which would leave the record holding two answers to what this leg rests on`,
        [
          "keep the content_id \u2014 it names the part exactly",
          "or keep the extent fields and drop content_id \u2014 the record finds or mints the part they describe"
        ]
      ));
  }
}
function checkInquiryBasis(fm, findings, publishedRegistry, earnedRegistry) {
  const legs = fm?.basis;
  basisVersionFindings(fm, findings);
  if (legs === void 0 || legs === null) {
    checkGrounds(fm, [], findings);
    return;
  }
  if (!Array.isArray(legs)) {
    findings.push(f("C-2.8", "error", `basis is not an array`));
    return;
  }
  const refTargets = new Set((Array.isArray(fm.references) ? fm.references : []).filter((r) => r && typeof r === "object" && typeof r.target === "string").map((r) => r.target));
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    if (typeof leg !== "object" || leg === null) {
      findings.push(f("C-2.8", "error", `basis[${i}] is not an object`));
      continue;
    }
    if (leadLegFindings(`basis[${i}]`, leg, findings)) continue;
    if (themeLegFindings(`basis[${i}]`, leg, findings)) continue;
    const t = leg.target;
    let targetType = null;
    if (typeof t !== "string" || !BUNDLE_ID_RE.test(t)) {
      findings.push(f("C-2.8", "error", `basis[${i}].target '${String(t).slice(0, 40)}' is not a canonical bundle id`));
    } else {
      const tt = targetType = normalizeType(OBJECT_TYPES[t.split("-")[0]]);
      if (tt !== "information" && tt !== "inquiry") {
        findings.push(f("C-2.8", "error", `basis[${i}].target '${t}' is a ${tt}: a leg rests on information or on another inquiry, nothing else`));
      } else if (!refTargets.has(t)) {
        findings.push(f(
          "C-6.3",
          "error",
          `basis[${i}].target '${t}' is not in references[]: an inquiry carrying a basis leg carries the same target as a reference, so the two projections cannot disagree`,
          [`add a references[] entry for '${t}'`, "remove the basis leg"]
        ));
      }
    }
    if (!BASIS_ROLES.includes(leg.role)) {
      findings.push(f("C-2.8", "error", `basis[${i}].role '${leg.role}' is not one of: ${BASIS_ROLES.join(", ")}`));
    }
    const graded = leg.grade !== void 0 && leg.grade !== null;
    if (graded && !BASIS_GRADES.includes(leg.grade)) {
      findings.push(f("C-2.8", "error", `basis[${i}].grade '${leg.grade}' is not one of: ${BASIS_GRADES.join(", ")} (absent or null means undetermined, and is stated as such)`));
    }
    if (leg.grade_axis !== void 0 && leg.grade_axis !== null && !GRADE_AXES.includes(leg.grade_axis)) {
      findings.push(f("C-2.8", "error", `basis[${i}].grade_axis '${leg.grade_axis}' is not one of: ${GRADE_AXES.join(", ")}`));
    }
    if (leg.grade_source !== void 0 && leg.grade_source !== null && !GRADE_SOURCES.includes(leg.grade_source)) {
      findings.push(f("C-2.8", "error", `basis[${i}].grade_source '${leg.grade_source}' is not one of: ${GRADE_SOURCES.join(", ")}`));
    }
    if (graded) {
      if (!GRADE_AXES.includes(leg.grade_axis)) {
        findings.push(f("C-2.8", "error", `basis[${i}] carries a grade with no grade_axis: the axis is not derivable from the target, so a graded leg states which axis its grade is on (${GRADE_AXES.join(", ")})`));
      }
      if (!GRADE_SOURCES.includes(leg.grade_source)) {
        findings.push(f("C-2.8", "error", `basis[${i}] carries a grade with no grade_source: a grade with no account of where it came from is an invented one (${GRADE_SOURCES.join(", ")})`));
      }
    }
    if (leg.grade_axis === "capture" && targetType === "inquiry" && leg.grade_source !== "inherited") {
      findings.push(f(
        "C-2.8",
        "error",
        `basis[${i}] states a capture-axis grade on an inquiry leg: capture is a property of an information object (DEC-21) and an inquiry is not one, so this grade has no referent`,
        [
          "grade this leg on the connection axis \u2014 a leg to another inquiry is a connection",
          "move the capture grade onto the INFO- leg it is actually about"
        ]
      ));
    }
    if (leg.grade_axis === "testimony" && targetType === "inquiry" && leg.grade_source !== "inherited") {
      findings.push(f(
        "C-2.8",
        "error",
        `basis[${i}] states a testimony-axis grade on an inquiry leg: testimony is a property of a member's authored observation, which is a document, and an inquiry is not one, so this grade has no referent`,
        [
          "rest this leg on the observation itself (its INFO- id)",
          "or grade this leg on the connection axis \u2014 a leg to another inquiry is a connection"
        ],
        "testimony-axis-no-referent"
      ));
    }
    if (leg.grade_axis === "capture" && graded && (leg.grade_source === "testimony" || leg.grade_source === "hunch")) {
      findings.push(f(
        "C-2.8",
        "error",
        `basis[${i}] states a capture-axis grade with grade_source '${leg.grade_source}': a capture grade says how the BYTES REACHED US, which is a fact this record holds about its own machinery and not one a member can assert. ${leg.grade_source === "testimony" ? "Testimony is a member's account of a connection" : "A hunch is a member's provisional connection"}, and neither is an account of a fetch`,
        [
          "use grade_source: capture \u2014 the capture axis is EARNED from the capture record, and op=earnedbasis says what it earns",
          "or move this grade onto the connection axis, where testimony and hunches belong"
        ]
      ));
    }
    if (leg.grade_source === "hunch") {
      if (typeof leg.author !== "string" || leg.author.trim() === "") {
        findings.push(f("C-2.8", "error", `basis[${i}] is a hunch with no author: a hunch is declared bias and carries the name of the member declaring it (DEC-15)`));
      }
      if (!DATE_RE.test(String(leg.date ?? ""))) {
        findings.push(f("C-2.8", "error", `basis[${i}] is a hunch with no date: a hunch is temporary by construction and carries the date it was declared, YYYY-MM-DD (DEC-15)`));
      }
    }
    if (leg.grade_source === "testimony" && graded && leg.grade !== TESTIMONY_GRADE && leg.grade_axis !== "testimony") {
      findings.push(f("C-2.8", "error", `basis[${i}] states testimony at grade ${leg.grade}: a member's testimony is grade ${TESTIMONY_GRADE} at no other value \u2014 a hunch is the only authored grade permitted above ${TESTIMONY_GRADE} (DEC-15)`));
    }
    if ((leg.grade_source === "testimony" || EARNED_GRADE_SOURCES.includes(leg.grade_source)) && !graded) {
      findings.push(f(
        "C-2.8",
        "error",
        `basis[${i}] states grade_source '${leg.grade_source}' with no grade: a source is an account of where a grade came from, and there is no grade here to account for`,
        ["state the grade this source produced", `or drop grade_source \u2014 an undetermined leg states neither, and is read as present and not yet load-bearing (DEC-18)`]
      ));
    }
    if (leg.note !== void 0 && leg.note !== null && typeof leg.note !== "string") {
      findings.push(f("C-2.8", "error", `basis[${i}].note is not a string`));
    }
    checkLegExtentGrammar(leg, `basis[${i}]`, "C-2.8", findings);
    checkTestimonyLeg(leg, i, graded, targetType, earnedRegistry, findings);
    checkEarnedLeg(leg, i, graded, targetType, earnedRegistry, findings);
    checkInheritedLeg(leg, i, graded, publishedRegistry, findings);
  }
  checkGrounds(fm, legs, findings);
}
function checkGrounds(fm, legs, findings) {
  const rows = fm?.grounds;
  const labelled = [];
  let unlabelled = 0;
  legs.forEach((leg, i) => {
    if (!leg || typeof leg !== "object") return;
    const g = leg.ground;
    if (g === void 0 || g === null || g === "") {
      unlabelled++;
      return;
    }
    if (typeof g !== "string" || !GROUND_LABEL_RE.test(g)) {
      findings.push(f("C-2.8", "error", `basis[${i}].ground '${String(g).slice(0, 60)}' is not a ground label: up to 48 characters of letters, digits, spaces, '-' and '_', naming the branch of the argument this leg belongs to`));
      return;
    }
    labelled.push([i, g]);
  });
  if (rows === void 0 || rows === null) {
    if (labelled.length) {
      findings.push(f(
        "C-2.8",
        "error",
        `basis leg${labelled.length === 1 ? "" : "s"} ${labelled.map(([i]) => i).join(", ")} name${labelled.length === 1 ? "s" : ""} a ground with no grounds[] block: grounds compose DISJUNCTIVELY, so a finding takes its STRONGEST ground rather than its weakest leg \u2014 and that is only ever reached by an affirmative, attributed act. Nothing may become stronger because a field was written and nobody signed for it`,
        [
          "author a grounds[] row per label, naming the member who asserts that ground is independently sufficient and the date",
          "or drop the ground labels \u2014 an unstructured basis is no stronger than its weakest leg, which is the conservative reading"
        ]
      ));
    }
    return;
  }
  if (!Array.isArray(rows)) {
    findings.push(f("C-2.8", "error", "grounds is not an array"));
    return;
  }
  const declared = /* @__PURE__ */ new Map();
  rows.forEach((r, i) => {
    if (!r || typeof r !== "object" || Array.isArray(r)) {
      findings.push(f("C-2.8", "error", `grounds[${i}] is not an object`));
      return;
    }
    const label = r.ground;
    if (typeof label !== "string" || !GROUND_LABEL_RE.test(label)) {
      findings.push(f("C-2.8", "error", `grounds[${i}].ground '${String(label).slice(0, 60)}' is not a ground label: up to 48 characters of letters, digits, spaces, '-' and '_'`));
      return;
    }
    if (declared.has(label)) {
      findings.push(f("C-2.8", "error", `grounds[${i}] declares '${label}' a second time: one ground, one assertion, one member answering for it`));
      return;
    }
    declared.set(label, i);
    if (typeof r.asserted_by !== "string" || r.asserted_by.trim() === "" || isMachineIdentity(r.asserted_by)) {
      findings.push(f(
        "C-2.8",
        "error",
        `grounds[${i}].asserted_by '${r.asserted_by}' is not a named member: "these legs are enough on their own" is an authored judgment that makes the finding STRONGER, so it carries the name of the member making it \u2014 never a machine's`,
        ["name the member asserting that this ground is independently sufficient"]
      ));
    }
    if (!ISO_TS_RE.test(String(r.at || ""))) {
      findings.push(f("C-2.8", "error", `grounds[${i}] requires 'at' as an ISO timestamp (got '${r.at}'): the assertion is dated because a structure authored after a strength was seen is a different act from one authored before it (DEC-32), and only a date lets a reader tell`));
    }
    if (r.statement !== void 0 && r.statement !== null && typeof r.statement !== "string") {
      findings.push(f("C-2.8", "error", `grounds[${i}].statement is not a string`));
    }
  });
  if (labelled.length && unlabelled) {
    findings.push(f(
      "C-2.8",
      "error",
      `${unlabelled} basis leg${unlabelled === 1 ? "" : "s"} carr${unlabelled === 1 ? "ies" : "y"} no ground while ${labelled.length} do: a basis is grouped WHOLE or not at all, because a leg nobody grouped sitting beside branches somebody did is a relationship the record would have to guess at`,
      [
        "give every leg a ground \u2014 a leg that is needed whatever else holds belongs in every ground, so it is its own single-leg ground only if it alone can carry the conclusion",
        "or remove the grounds and let the basis read as its weakest leg"
      ]
    ));
  }
  for (const [i, label] of labelled) {
    if (!declared.has(label)) {
      findings.push(f(
        "C-2.8",
        "error",
        `basis[${i}].ground '${label}' is not declared in grounds[]: a ground that nobody asserted is independently sufficient cannot be one, and the finding must not take a maximum over a branch no member signed for`,
        [`add a grounds[] row for '${label}' with asserted_by and at`]
      ));
    }
  }
  const carried = new Set(labelled.map(([, l]) => l));
  for (const [label, i] of declared) {
    if (!carried.has(label)) {
      findings.push(f(
        "C-2.8",
        "error",
        `grounds[${i}] declares '${label}', which no basis leg belongs to: a ground is a partition OF THE LEGS, and an empty one asserts that nothing is sufficient on its own`,
        [`give at least one basis leg 'ground: ${label}'`, "or remove the row"]
      ));
    }
  }
}
function checkTestimonyLeg(leg, i, graded, targetType, registry, findings) {
  if (!graded) return;
  const target = typeof leg.target === "string" ? leg.target : null;
  const observation = registry && registry.earned && registry.earned.testimony && target ? registry.earned.testimony[target] || null : null;
  if (leg.grade_axis === "capture" && targetType === "information" && observation) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states a capture grade of ${leg.grade} for ${target}, which is a member's authored observation: the capture axis measures the act of reading a document in, and nobody read these words in from anywhere \u2014 they are the member's own. Its grade is testimony, ${observation.grade}, on the testimony axis, and its capture axis is not applicable`,
      [
        `grade basis[${i}] on the testimony axis \u2014 grade_axis: testimony, grade: ${observation.grade}, grade_source: testimony`,
        `or state no grade on basis[${i}] \u2014 the leg stays in the basis, present and not yet load-bearing`
      ],
      "testimony-leg-capture-graded"
    ));
    return;
  }
  if (leg.grade_axis !== "testimony") return;
  if (leg.grade !== TESTIMONY_GRADE) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states a testimony grade of ${leg.grade}: a member's firsthand observation is graded ${TESTIMONY_GRADE} on the testimony axis and at no other value. It stands on the observing member's trust, and nothing raises it \u2014 a second member agreeing with it is a co-signature, not a second observation (a second member who saw the same thing records their own, and the case then rests on two testimonies, each ${TESTIMONY_GRADE})`,
      [`state grade: ${TESTIMONY_GRADE} on basis[${i}]`],
      "testimony-grade-not-d"
    ));
    return;
  }
  if (leg.grade_source === "inherited" || targetType === "inquiry") return;
  if (leg.grade_source !== "testimony") {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states a testimony-axis grade with grade_source '${leg.grade_source}': a testimony grade comes from a member's own authored observation and from nothing else \u2014 a resolution, a capture or a hunch is an account of something other than whose word this is`,
      [`set grade_source: testimony on basis[${i}]`],
      "testimony-axis-source"
    ));
    return;
  }
  if (!registry) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states a testimony grade for ${target}, but whether that document IS a member's authored observation is held by the register, which cannot be read here: a document is an observation because the act that records one wrote it, never because a leg says so`,
      ["run this through the ratification gate or op=promote, which read the record"],
      "testimony-axis-unconfirmable"
    ));
    return;
  }
  if (!observation) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states a testimony grade for ${target}, which is not a member's authored observation: the testimony axis grades whose word a document is, and this one's bytes were captured, not authored here. Grading it as testimony would let a captured source pass for a member's own word`,
      [
        `grade basis[${i}] on the capture axis, which is what a captured document's grade measures`,
        "or, if this is your own firsthand knowledge, record it as an observation (op=testify) and cite that"
      ],
      "testimony-axis-not-authored"
    ));
    return;
  }
  if (leg.grade !== observation.grade) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states a testimony grade of ${leg.grade} for ${target}, but the record holds ${observation.grade} for it. ${observation.why ?? ""}`.trimEnd(),
      [`state grade: ${observation.grade} on basis[${i}]`],
      "testimony-grade-unearned"
    ));
  }
}
function checkEarnedLeg(leg, i, graded, targetType, registry, findings) {
  const src = leg.grade_source;
  if (!EARNED_GRADE_SOURCES.includes(src)) return;
  if (!graded) return;
  if (!registry) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states grade_source '${src}' but the record it would be earned from cannot be read here: an earned grade is computed by the record and is never taken from a caller, so it cannot be confirmed by a checker that can only see this bundle`,
      [
        "run this through the ratification gate or op=promote, which read the record",
        "or state the grade as testimony (grade D, with an author and a date) if it is a member's account"
      ]
    ));
    return;
  }
  const wantAxis = EARNED_SOURCE_AXIS[src];
  if (leg.grade_axis === "capture" && targetType === "inquiry" && src !== "capture") return;
  if (leg.grade_axis !== wantAxis) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states grade_source '${src}' on the ${leg.grade_axis} axis: ${src === "resolution" ? "a resolution IS the framework's \xA78.1 connection grade and grades nothing else" : "a capture grade is a property of an information object and measures how the bytes arrived (DEC-21)"}, so it can only be a source for a ${wantAxis} grade`,
      [
        `set grade_axis: ${wantAxis} on basis[${i}]`,
        `or state where this ${leg.grade_axis}-axis grade actually came from`
      ]
    ));
    return;
  }
  if (src === "resolution" && targetType === "inquiry") {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] claims an EARNED resolution grade on an inquiry leg: a resolution matches a captured document's reading to a registry entity, and an inquiry is not a captured document \u2014 there is nothing here for the recogniser to have graded`,
      [
        "rest this leg on the INFO- document that carries the reference",
        "or, if the target is a published case, inherit its frozen connection grade (grade_source: inherited)"
      ]
    ));
    return;
  }
  if (src === "resolution" && !registry.subject_entity) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] claims an EARNED resolution grade, but this inquiry names no subject_entity: an earned connection grade is the strongest resolution of the target's captures TO THE INQUIRY'S SUBJECT, and with no subject named there is nothing to have resolved to (DATA-MODEL D1(b))`,
      [
        "add subject_entity: ENT-YYYY-NNNN naming the registry entry this question is about",
        "or state no grade at all \u2014 an inquiry with no subject entity has no A/B/C available to it, and that is honest (DEC-15)"
      ]
    ));
    return;
  }
  const earned = registry.earned && registry.earned[wantAxis] ? registry.earned[wantAxis][leg.target] : null;
  if (earned && earned.undetermined_because === "CAPTURE_AXIS_AUTHORED") return;
  if (earned && earned.mode === "ceiling" && earned.grade == null) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states an EARNED capture grade of ${leg.grade} for ${leg.target}, but what that document's capture can support is UNDETERMINED, not ${leg.grade}. ${earned.why ?? ""}`,
      [
        `state NO capture grade on basis[${i}] \u2014 an undetermined axis is stated, not filled in, and the leg stays in the basis naming what it rests on`,
        "or have the transcription measured (the MEASUREMENTS ledger, per engine, per version) and state the letter the record then earns",
        "or state this leg as testimony (grade D, with an author and a date) if it is a member's own account"
      ]
    ));
    return;
  }
  if (!earned || !earned.grade) {
    findings.push(f(
      "C-2.8",
      "error",
      src === "resolution" ? `basis[${i}] states an EARNED resolution grade of ${leg.grade} for ${leg.target}, but the record holds no A/B/C resolution of that document to ${registry.subject_entity}: nothing was earned here. The recogniser never mints a D, so a document known to concern the subject only by a member's testimony earns nothing either \u2014 that leg is testimony and says so` : `basis[${i}] states an EARNED capture grade of ${leg.grade} for ${leg.target}, but the record holds no registered capture for that document: there are no bytes here whose arrival this grade could be measuring`,
      src === "resolution" ? [
        "resolve the document to the subject with op=resolve, then state the grade it earned",
        "or state this leg as testimony (grade D, with an author and a date)"
      ] : ["state no capture grade \u2014 an uncaptured document is undetermined on the capture axis, and undetermined is stated (CLAUDE.md)"]
    ));
    return;
  }
  if (earned.mode === "ceiling") {
    if (BASIS_GRADES.indexOf(leg.grade) < BASIS_GRADES.indexOf(earned.grade)) {
      findings.push(f(
        "C-2.8",
        "error",
        `basis[${i}] states a capture grade of ${leg.grade} for ${leg.target}, which is STRONGER than the ${earned.grade} the record can earn for it. ${earned.why} ${earned.ceiling ?? ""}`,
        [`state grade: ${earned.grade} or weaker on basis[${i}] \u2014 op=earnedbasis answers what each target earns before you write it`]
      ));
    }
    return;
  }
  if (earned.grade !== leg.grade) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states an EARNED ${wantAxis} grade of ${leg.grade} for ${leg.target}, but the record earns ${earned.grade}: an earned grade is computed by the record and a caller does not hand it to us in either direction. ${earned.why}`,
      [`state grade: ${earned.grade} on basis[${i}] \u2014 op=earnedbasis answers what each target earns before you write it`]
    ));
  }
}
function checkInheritedLeg(leg, i, graded, registry, findings) {
  const target = typeof leg.target === "string" ? leg.target : null;
  const entry = registry && target ? registry[target] : null;
  const pub = entry && (entry.object_type == null || entry.object_type === "inquiry") ? entry : null;
  if (leg.grade_source === "inherited" && !pub) {
    findings.push(f(
      "C-2.8",
      "error",
      `basis[${i}] states grade_source 'inherited' but its target ${registry ? "is not a published case" : "cannot be checked against the published record here"}: a grade is inherited from a case the group SIGNED, at a stated edition, and from nothing else`,
      ["cite a published case and name its edition", "or state where this grade actually came from"]
    ));
    return;
  }
  if (!pub) return;
  if (!graded) {
    if (leg.grade_source === "inherited") {
      findings.push(f("C-2.8", "error", `basis[${i}] claims 'inherited' with no grade: a leg resting on a published case may state no grade at all \u2014 undetermined, stated \u2014 but it may not claim to have inherited one`));
    }
    return;
  }
  if (leg.grade_source !== "inherited") {
    findings.push(f(
      "C-21.2",
      "error",
      `basis[${i}] carries a grade of its own on a PUBLISHED case (${target}): a leg resting on a published case inherits that case's frozen strength and says so with grade_source 'inherited'. A case built on a case cannot be stronger than the case beneath it`,
      [`set grade_source: inherited and target_edition on basis[${i}]`]
    ));
    return;
  }
  const ed = leg.target_edition;
  if (!Number.isInteger(ed)) {
    findings.push(f(
      "C-21.2",
      "error",
      `basis[${i}] inherits from ${target} without naming an edition: every edition is a SEPARATE DOCUMENT with its own frozen strength, so an unnamed edition leaves the inheritance rule nothing fixed to compare against (DEC-12)`,
      [`add target_edition to basis[${i}]`]
    ));
    return;
  }
  const frozen = pub.editions ? pub.editions[String(ed)] : null;
  if (!frozen) {
    findings.push(f("C-21.2", "error", `basis[${i}] names edition ${ed} of ${target}, which is not in the published record (published editions: ${pub.editions ? Object.keys(pub.editions).join(", ") || "none" : "none"})`));
    return;
  }
  const axis = leg.grade_axis;
  if (!GRADE_AXES.includes(axis)) return;
  const on = frozen[axis];
  if (!on || on.state !== "graded") {
    findings.push(f(
      "C-21.2",
      "error",
      `basis[${i}] inherits ${axis} grade ${leg.grade} from ${target} edition ${ed}, whose ${axis} axis is ${on ? on.state.toUpperCase() : "ABSENT"}: ${on && on.state === "unrated" ? "nothing on that axis was ever established there, so a grade taken from it would be invented outright" : "what lies beneath is unknown rather than absent, so a grade taken from it would be a claim about material nobody has seen"}`,
      [`state no grade on basis[${i}] \u2014 undetermined, stated, is the honest answer`]
    ));
    return;
  }
  if (BASIS_GRADES.indexOf(leg.grade) < BASIS_GRADES.indexOf(on.grade)) {
    findings.push(f(
      "C-21.2",
      "error",
      `basis[${i}] inherits ${axis} grade ${leg.grade} from ${target} edition ${ed}, whose frozen ${axis} strength is ${on.grade}: a case built on a case cannot be stronger than the case beneath it, and the comparison is PER AXIS \u2014 this leg's ${axis} grade against that edition's ${axis} grade, never against a composed letter`,
      [`set basis[${i}].grade to ${on.grade}, the frozen ${axis} strength of that edition`]
    ));
  }
}
function checkProjectExtension(ctx, findings) {
  if (ctx.fm?.object_type !== "project") return;
  const fm = ctx.fm;
  if (typeof fm.objective !== "string" || fm.objective.trim() === "") {
    findings.push(f("C-2.9", "error", "objective is missing or empty"));
  }
  const WS = ["draft", "internally_checked", "externally_compliant", "distributed"];
  if (fm.workproduct_state !== void 0 && fm.workproduct_state !== null && !WS.includes(fm.workproduct_state)) {
    findings.push(f("C-2.9", "error", `workproduct_state '${fm.workproduct_state}' is not one of: ${WS.join(", ")}`));
  }
  const evals = Array.isArray(fm.evaluations) ? fm.evaluations : [];
  for (let i = 0; i < evals.length; i++) {
    const e = evals[i];
    if (!e || !["compliance", "argument"].includes(e.kind) || !["internal", "external"].includes(e.strictness) || !["pass", "findings"].includes(e.result) || !ISO_TS_RE.test(e.timestamp || "")) {
      findings.push(f("C-2.9", "error", `evaluations[${i}] lacks the required kind/strictness/result/timestamp shape`));
    } else if (e.result === "findings" && !e.findings_ref) {
      findings.push(f("C-2.9", "error", `evaluations[${i}] result is findings but findings_ref is empty`));
    }
  }
  if (fm.current_state === "closed" && !["resolved", "superseded", "abandoned"].includes(fm.closed_reason)) {
    findings.push(f("C-2.9", "error", `closed state requires closed_reason in: resolved, superseded, abandoned`));
  }
  const ws = fm.workproduct_state;
  const passed = (kind, stricts) => evals.some((e) => e && e.kind === kind && e.result === "pass" && stricts.includes(e.strictness));
  if (["internally_checked", "externally_compliant", "distributed"].includes(ws)) {
    for (const kind of ["compliance", "argument"]) {
      if (!passed(kind, ["internal", "external"])) {
        findings.push(f(
          "C-9.1",
          "error",
          `workproduct_state '${ws}' requires a passing ${kind} evaluation (internal strictness or better)`,
          ["run the missing evaluation", "demote workproduct_state to the highest earned rung"]
        ));
      }
    }
  }
  if (["externally_compliant", "distributed"].includes(ws)) {
    for (const kind of ["compliance", "argument"]) {
      if (!passed(kind, ["external"])) {
        findings.push(f(
          "C-9.1",
          "error",
          `workproduct_state '${ws}' requires a passing external-strictness ${kind} evaluation`,
          ["run the missing evaluation", "demote workproduct_state to the highest earned rung"]
        ));
      }
    }
  }
}
var CHECK_RETIREMENTS = {
  /* WHAT IT WAS FOR. `data/citations.json` is the emission shape written into
   * `BIO_State_Rules_Consistency_v1_5.md` for a workproduct's machine-checked
   * citation register: {claims:[{claim_id, claim, cites[], snapshot, as_of,
   * hash}]} — a claim, the keys it rests on, an as-of date, and a content hash.
   * C-8.1 validated that shape, the sha256 hash format, and that every cite
   * resolved in the store. It was correct code for a register the record never
   * grew, and it drew a finding on nothing, ever, in production.
   *
   * WHY THE OLD RULE WAS WRONG, which is the half a deletion would have lost.
   * It was not wrong when it was written; it was superseded. The register put a
   * CLAIM inside another object's file, and a claim that lives inside another
   * object's file cannot be cited, contradicted, graded or composed — which is
   * the precise argument that produced the inquiry object. `inquiry_basis` and
   * `inquiry_basis_versions` now hold that structure as first-class rows: legs
   * with a target, a role, a per-axis grade and a `grade_source` the caller
   * cannot hand us. Keeping C-8.1 alongside them would have left the record
   * carrying TWO claim structures with overlapping shapes and no relation
   * between them, so a reader asking "what does this rest on?" would have had
   * two places to look and no rule saying which was authoritative. That is the
   * diffusion D-69 measures, and it is worse than the missing check: the second
   * structure is the one a member could fill in by hand while the plane knew
   * nothing about it.
   *
   * MEASURED BEFORE DECIDING (FW-13, 2026-08-08). Nothing in bio-plane/src,
   * civicos-ui, docprofile, tools, agent-worker, pdf-worker or newgroup/src
   * writes or reads `data/citations.json` — the only occurrence outside this
   * catalogue and its suite is `newgroup/src/release.mjs`, which is one
   * `RELEASE_SOURCE` string holding a copy of this file. Every sibling register
   * the catalogue gates has a real producer (`data/provenance.json` 9,
   * `_history/manifest.json` 4, `data/inbox.json` and `data/dataset.json` 2
   * each); this one had 0. The check FIRED correctly on a hand-planted file and
   * fired ALONE — nothing else was doing its work — so this is not a redundant
   * check and not an unreachable one. It is a check with no producer.
   *
   * WHAT REPLACES IT: nothing, deliberately. A claim belongs on an inquiry as a
   * basis leg, in the rows op=cite writes and op=earnedbasis reads, where the
   * strength rules can reach it. A file called `data/citations.json` in a bundle
   * is now an ordinary data file: C-14.2 still judges its name and C-14.3 still
   * judges that it parses, exactly as they do for any other. */
  "C-8.1": {
    what: "the per-bundle citation register data/citations.json",
    retired: "2026-08-08",
    item: "FW-13",
    superseded_by: "inquiry_basis / inquiry_basis_versions \u2014 the claim layer, as rows",
    gated_path: "data/citations.json"
  },
  /* WHAT IT WAS FOR. `data/deletions.json` is the append-only GATED-DELETION
   * LEDGER specified in `BIO_State_Rules_Consistency_v1_5.md` §2.5: the store is
   * accretive, "material is added, not removed", and a deletion is exceptional
   * and requires all of a stated REASON, PRESERVATION of the material into
   * `_history/`, and a CASCADE flagging every object that referenced it. The
   * ledger was the reason-and-preservation half, shaped
   * {records:[{timestamp, reason, items[], preserved_to}]}, and C-7.1 validated
   * exactly that shape.
   *
   * WHY THE OLD RULE WAS WRONG, which is the half a deletion would have lost.
   * It was not wrong when it was written; it was superseded, and it was
   * superseded by a mechanism rather than by a ruling — which is why nobody
   * noticed. §2.5 was written for the DRIVE substrate, where a session with
   * create-only access physically moved files and the only way to know a removal
   * had happened was for somebody to write it down. The plane meets all three of
   * §2.5's requirements STRUCTURALLY instead, at the one write that can remove
   * anything:
   *
   *   REASON / never silent — `promote` refuses a revision that drops a path the
   *     previous revision had unless the caller NAMES it in `drop[]`. That is the
   *     FILES_DROPPED refusal (C-33.24, DEC-49 region `is-promote-files` in
   *     store.mjs), it carries a member-facing translation, and it lists the paths
   *     rather than making the member re-derive them. The removal then stands in
   *     `_history/manifest.json`: the dropping promotion's entry omits the path
   *     from `files[]` while carrying it in `snapshotted[]`.
   *   PRESERVATION — the whole outgoing image is copied into `history` BEFORE the
   *     `DELETE FROM files`, so the removed bytes survive verbatim at
   *     `_history/<path>_<snapKey>.<ext>`, hashed, and C-12.2 draws a finding if a
   *     snapshot the manifest records is missing.
   *   CASCADE — every projection is rebuilt in the same transaction, so an edge
   *     into removed material reads as an unresolvable C-6.2 finding rather than
   *     vanishing; C-5.1 refuses any append-only surface that shrank against the
   *     latest snapshot.
   *
   * So the ledger was a SECOND ACCOUNT OF ONE FACT — what the record no longer
   * holds — sitting beside a machine-kept account of the same fact, with no rule
   * saying which is authoritative. That is D-69's diffusion, the same defect that
   * retired C-8.1, arriving through a different door: not two claim structures,
   * but two accounts of an absence.
   *
   * AND IT IS WORSE THAN C-8.1's, WHICH IS THE PART THAT DECIDED THIS. C-7.1
   * validated the SHAPE of a deletion claim and NOTHING about its truth
   * (measured; see below). A ledger could name a file as deleted while that file
   * sat in the bundle, point `preserved_to` at a path the bundle did not hold,
   * and carry its records out of chronological order in a ledger the spec calls
   * append-only — and the catalogue passed all three. An absence is precisely the
   * claim a reader cannot check from the bundle, so a hand-authored
   * "this was removed, and it is kept over there" is the record claiming more
   * than it can support. CLAUDE.md ranks that above a missing feature.
   *
   * AND WHOSE ACT WOULD IT HAVE RECORDED? None that exists. A MEMBER has no
   * delete: correction moves FORWARD (DEC-19) — a new edition, a withdrawal as a
   * further attested act, a claim removed from a finding rescinding it to an
   * inquiry — and every one of those is an ADDITION already carried by
   * `state_history`, the `_history/` chain and `inquiry_basis_versions`. An
   * OPERATOR's `op=purge` is eviction, not gated deletion: it is admin-only, it
   * takes the `history` and `manifest` tables with the bundle so it can never
   * write a `preserved_to`, and it destroys the very bundle a per-bundle ledger
   * would live in. A PURGE is that same act. Published bytes are exempt from all
   * of it by doctrine — a hash once published answers forever.
   *
   * MEASURED BEFORE DECIDING (FW-15, 2026-08-08). Nothing in bio-plane/src,
   * civicos-ui, docprofile, tools, agent-worker, pdf-worker or newgroup/src
   * writes or reads `data/deletions.json` — 0 producers in a 118-file corpus,
   * against `data/provenance.json` 9, `_history/manifest.json` 4,
   * `data/inbox.json` and `data/dataset.json` 2 each. The only occurrence outside
   * this catalogue and its suite is `newgroup/src/release.mjs`, one
   * `RELEASE_SOURCE` string holding a copy of this file, excluded by name in the
   * estate walk. Driven through `checkBundle` on sixteen planted inputs: C-7.1
   * FIRED on six distinct malformed ledgers, drew NOTHING on a well-formed one,
   * and fired ALONE — the identical tamper under `data/deletionz.json`,
   * `data/removals.json`, `data/deleted.json` and `deletions.json` drew nothing at
   * all, so no other check was doing its work. WHICH OF THE THREE FINDINGS THIS
   * IS: not redundant and not unreachable — a check with NO PRODUCER, which had
   * therefore never fired on anything real.
   *   And the SHAPE-NOT-TRUTH gap above is measured, not inferred: a ledger
   *   naming `bundle.md` as deleted while `bundle.md` was present in the same
   *   bundle drew nothing; a `preserved_to` pointing at a path the bundle did not
   *   hold drew nothing; two records in descending time order in an append-only
   *   ledger drew nothing. Every one of those is well-formed by C-7.1's rule and
   *   false about the record.
   *
   * WHAT REPLACES IT: `drop[]` / FILES_DROPPED (C-33.24) for the reason,
   * the `_history/` snapshot chain (C-12.1, C-12.2) for the preservation, and
   * C-5.1 for the append-only surfaces — all three with real producers, real
   * consumers, and checks that fire. `data/deletions.json` in a bundle is now an
   * ordinary data file: C-14.2 still judges its name and C-14.3 still judges that
   * it parses, exactly as they do for any other. */
  "C-7.1": {
    what: "the per-bundle gated-deletion ledger data/deletions.json",
    retired: "2026-08-08",
    item: "FW-15",
    superseded_by: "promote drop[] / FILES_DROPPED (C-33.24) + the _history/ snapshot chain (C-12.1, C-12.2) + C-5.1",
    gated_path: "data/deletions.json"
  }
};
function checkCounterparty(fm, findings) {
  const isPlaceholder = (v) => typeof v === "string" && v.trim().toLowerCase() === COUNTERPARTY_PLACEHOLDER;
  const REPAIRS = [
    "name the counterparty: counterparty.state = named with counterparty.name",
    "or state that it is undetermined: counterparty.state = undetermined with an authored counterparty.basis saying why"
  ];
  const cp = fm.counterparty;
  if (typeof cp === "string") {
    findings.push(f(
      "C-2.10",
      "error",
      isPlaceholder(cp) ? `counterparty is the placeholder '${cp.trim()}', which asserts a counterparty this action does not have (D-130). It is not a name and it is not an honest undetermined` : `counterparty '${cp.trim().slice(0, 40)}' is a bare string; it is a block of {state, name, basis} so that "we do not know yet" can be STATED rather than invented`,
      REPAIRS
    ));
    return;
  }
  if (!cp || typeof cp !== "object" || Array.isArray(cp)) {
    findings.push(f(
      "C-2.10",
      "error",
      "counterparty block is missing: an action names who it is addressed to, or states that it is undetermined and why",
      REPAIRS
    ));
    return;
  }
  if (!COUNTERPARTY_STATES.includes(cp.state)) {
    findings.push(f(
      "C-2.10",
      "error",
      `counterparty.state '${cp.state}' is not one of: ${COUNTERPARTY_STATES.join(", ")}`,
      REPAIRS
    ));
    return;
  }
  const name = typeof cp.name === "string" ? cp.name.trim() : "";
  const basis = typeof cp.basis === "string" ? cp.basis.trim() : "";
  const entityId = cp.entity_id === void 0 || cp.entity_id === null ? "" : String(cp.entity_id).trim();
  if (isPlaceholder(name)) {
    findings.push(f(
      "C-2.10",
      "error",
      `counterparty.name is the placeholder '${COUNTERPARTY_PLACEHOLDER}', which is not a name (D-130)`,
      REPAIRS
    ));
  }
  if (isPlaceholder(basis)) {
    findings.push(f(
      "C-2.10",
      "error",
      `counterparty.basis is the placeholder '${COUNTERPARTY_PLACEHOLDER}', which says nothing about WHY the counterparty is undetermined`,
      ["author counterparty.basis: what has been established so far, and what would settle it"]
    ));
  }
  if (cp.state === "named") {
    if (!name) {
      findings.push(f(
        "C-2.10",
        "error",
        "counterparty.state is named and counterparty.name is empty: the state asserts an addressee the document does not carry",
        REPAIRS
      ));
    }
    if (entityId && !ENTITY_ID_RE.test(entityId)) {
      findings.push(f(
        "C-2.10",
        "error",
        `counterparty.entity_id '${entityId.slice(0, 40)}' is not a subject registry key (ENT-YYYY-NNNN)`,
        ["point entity_id at an entry in the subject registry (op=entitycreate / op=entitybyalias), or omit it \u2014 it is optional"]
      ));
    }
  } else {
    if (!basis) {
      findings.push(f(
        "C-2.10",
        "error",
        "counterparty.state is undetermined and counterparty.basis is empty: undetermined is first-class and must be STATED, so an action that does not know who it is addressed to says what it does know",
        ["author counterparty.basis: what has been established so far, and what would settle it"]
      ));
    }
    if (name) {
      findings.push(f(
        "C-2.10",
        "error",
        `counterparty.state is undetermined and counterparty.name is '${name.slice(0, 40)}': the block asserts a counterparty and denies having one in the same breath`,
        ["set state: named if the name is the counterparty", "or clear name and leave the basis to say what is known"]
      ));
    }
    if (entityId) {
      findings.push(f(
        "C-2.10",
        "error",
        `counterparty.state is undetermined and counterparty.entity_id is '${entityId.slice(0, 40)}': an entity_id names a subject in the registry, which is a determination`,
        ["set state: named", "or clear entity_id"]
      ));
    }
  }
}
function actionBasisFindings(fm, findings) {
  const legs = Array.isArray(fm?.action_basis) ? fm.action_basis : [];
  const REPAIRS = ["point the leg at the finding this rests on (kind: rests_on) or the question it advances (kind: advances)"];
  legs.forEach((l, i) => {
    if (!l || typeof l !== "object" || Array.isArray(l)) {
      findings.push(f("C-2.10", "error", `action_basis[${i}] is not a leg block of {target, kind}`, REPAIRS));
      return;
    }
    if (leadLegFindings(`action_basis[${i}]`, l, findings)) return;
    if (themeLegFindings(`action_basis[${i}]`, l, findings)) return;
    const target = typeof l.target === "string" ? l.target : "";
    if (!BUNDLE_ID_RE.test(target)) {
      findings.push(f(
        "C-2.10",
        "error",
        `action_basis[${i}].target '${String(l.target).slice(0, 40)}' is not a canonical bundle id`,
        REPAIRS
      ));
    } else if (OBJECT_TYPES[target.split("-")[0]] === "action") {
      findings.push(f(
        "C-2.10",
        "error",
        `action_basis[${i}].target '${target}' is an ACTION: an action does not rest on our own action. Evidence for what we did is evidence somebody else produced (DEC-14)`,
        ["point the leg at the finding or the question, not at another action"]
      ));
    }
    if (!ACTION_BASIS_KINDS.includes(l.kind)) {
      findings.push(f(
        "C-2.10",
        "error",
        `action_basis[${i}].kind '${l.kind}' is not one of: ${ACTION_BASIS_KINDS.join(", ")}`,
        REPAIRS
      ));
    }
  });
  if (fm?.action_kind === "request_for_comment") {
    const disclosed = legs.filter((l) => l && typeof l === "object" && l.kind === "advances" && typeof l.target === "string" && BUNDLE_ID_RE.test(l.target) && OBJECT_TYPES[l.target.split("-")[0]] === "inquiry");
    if (!disclosed.length) {
      findings.push(f(
        "C-2.10",
        "error",
        'a request_for_comment names ZERO inquiries: it must name the SPECIFIC questions it put to the subject, as action_basis legs of kind advances. "We contacted them" and "we put these four claims to them" are different facts, and a comment request without specifics gives the subject nothing to answer (DEC-13)',
        ["add an action_basis leg with kind: advances for each inquiry disclosed in the request"]
      ));
    }
    const clock = Array.isArray(fm.clock) ? fm.clock : [];
    if (!clock.length) {
      findings.push(f(
        "C-2.10",
        "error",
        `a request_for_comment states the response window it gave, as a clock[] entry with its own basis. The window is AUTHORED by the group; ${RFC_RESPONSE_WINDOW_PRECEDENT.source} is the precedent to reason from and is not a constant this record enforces (DEC-13)`,
        ["add a clock[] entry: the date the response was due, and the basis it derives from"]
      ));
    }
  }
}
function correspondenceFindings(fm, findings) {
  const entries = Array.isArray(fm?.correspondence) ? fm.correspondence : [];
  entries.forEach((e, i) => {
    if (!e || typeof e !== "object" || Array.isArray(e)) {
      findings.push(f("C-2.10", "error", `correspondence[${i}] is not an entry block`));
      return;
    }
    if (!CORRESPONDENCE_DIRECTIONS.includes(e.direction)) {
      findings.push(f(
        "C-2.10",
        "error",
        `correspondence[${i}].direction '${e.direction}' is not one of: ${CORRESPONDENCE_DIRECTIONS.join(", ")}`,
        ["record a non-response as direction: no_response with the date it was due (DEC-13)"]
      ));
    }
    if (!DATE_RE.test(String(e.at ?? "").slice(0, 10))) {
      findings.push(f(
        "C-2.10",
        "error",
        `correspondence[${i}].at '${String(e.at).slice(0, 40)}' is not a date: an entry in this ledger is dated, including a non-response, which is dated by when the reply was due`
      ));
    }
    const sha = typeof e.artifact_sha === "string" ? e.artifact_sha.trim() : "";
    const account = typeof e.account === "string" ? e.account.trim() : "";
    const author = typeof e.author === "string" ? e.author.trim() : "";
    const CHOICE = [
      "capture the artifact and record its sha256 (op=capture), or",
      "record a named account: account with the member who is testifying to it"
    ];
    if (sha && account) {
      findings.push(f(
        "C-2.10",
        "error",
        `correspondence[${i}] carries BOTH an artifact_sha and an account: what came back is CAPTURED, not summarised (DEC-13). The bytes are what the group can defend; a paraphrase beside them is what a reader would quote instead`,
        CHOICE
      ));
    } else if (!sha && !account) {
      findings.push(f(
        "C-2.10",
        "error",
        `correspondence[${i}] carries NEITHER an artifact_sha nor an account: it asserts an exchange and offers no way to check that it happened`,
        CHOICE
      ));
    } else if (sha) {
      if (!CONTENT_HASH_RE.test(sha) && !/^[0-9a-f]{64}$/i.test(sha)) {
        findings.push(f(
          "C-2.10",
          "error",
          `correspondence[${i}].artifact_sha '${sha.slice(0, 24)}' is not a sha256 hash`
        ));
      }
      if (e.direction === "no_response") {
        findings.push(f(
          "C-2.10",
          "error",
          `correspondence[${i}] is a no_response carrying an artifact_sha: nothing arrived, so there are no bytes to hash. A non-response is recorded as a named account with its date (DEC-13)`,
          ["record the non-response as an account: what was due, when, and that nothing came"]
        ));
      }
    } else if (!author) {
      findings.push(f(
        "C-2.10",
        "error",
        `correspondence[${i}] carries an account with no author: testimony is somebody's, and an unattributed account is a claim nobody stands behind`
      ));
    }
    for (const q of quoteFindings(entries, i)) findings.push(f("C-2.10", "error", q.message, null, q.code));
    for (const q of lifecycleFindings(entries, i)) findings.push(f("C-2.10", "error", q.message, null, q.code));
  });
}
var QUOTE_KEYS = ["quote_amount", "quote_currency", "quote_basis", "quote_answers", "quote_revises"];
var QUOTE_NUMBER_RE = /^-?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/;
var ORD_RE = /^\d+$/;
function isQuoteEntry(e) {
  return !!e && typeof e === "object" && !Array.isArray(e) && Object.keys(e).some((k) => k.startsWith("quote_"));
}
function quoteValue(amount) {
  const s = amount === null || amount === void 0 ? "" : String(amount).trim();
  return QUOTE_NUMBER_RE.test(s) ? Number(s.replace(/,/g, "")) : null;
}
function quoteFindings(entries, i) {
  const out = [];
  const e = entries[i];
  if (!isQuoteEntry(e)) return out;
  if (e.direction !== "received") {
    out.push({ code: "QUOTE_NOT_ON_RECEIVED", message: `correspondence[${i}] carries a quote on a '${e.direction}' entry: a quote is what a body SENT BACK, so it rides a received entry (D-148)` });
    return out;
  }
  if (quoteValue(e.quote_amount) === null) {
    out.push({ code: "QUOTE_AMOUNT_NOT_A_NUMBER", message: `correspondence[${i}].quote_amount '${String(e.quote_amount ?? "").slice(0, 40)}' is not a number: the amount is recorded as quoted, and a quote whose amount cannot be read as one cannot be set beside another` });
  }
  const cur = e.quote_currency === null || e.quote_currency === void 0 ? "" : String(e.quote_currency).trim();
  if (!cur) {
    out.push({ code: "QUOTE_NO_CURRENCY", message: `correspondence[${i}] carries a quote with no quote_currency: the currency is recorded as quoted and is never inferred` });
  }
  const ordOf = (v) => v === null || v === void 0 || !ORD_RE.test(String(v).trim()) ? null : Number(String(v).trim());
  const a = ordOf(e.quote_answers);
  const sent = a !== null && a < i ? entries[a] : null;
  if (!sent || typeof sent !== "object" || sent.direction !== "sent") {
    out.push({ code: "QUOTE_ANSWERS_NO_SENT", message: `correspondence[${i}].quote_answers '${String(e.quote_answers ?? "").slice(0, 20)}' names no earlier sent entry: a quote answers a request this ledger holds, and the request's own text is its scope` });
  }
  if (e.quote_revises !== void 0 && e.quote_revises !== null && e.quote_revises !== "") {
    const r = ordOf(e.quote_revises);
    const prior = r !== null && r < i ? entries[r] : null;
    if (!prior || typeof prior !== "object" || prior.direction !== "received" || !isQuoteEntry(prior)) {
      out.push({ code: "QUOTE_REVISES_NO_QUOTE", message: `correspondence[${i}].quote_revises '${String(e.quote_revises).slice(0, 20)}' names no earlier quote: a revision names the quote it revises, and both entries stand` });
    }
  }
  return out;
}
var CORRESPONDENCE_STAGES = {
  sent: ["request", "fee_waiver_request", "appeal", "court_filing"],
  received: [
    "acknowledgement",
    "fee_estimate",
    "fee_waiver_decision",
    "extension_notice",
    "production",
    "denial",
    "appeal_decision",
    "court_decision"
  ]
};
var CORRESPONDENCE_OUTCOMES = ["granted", "denied", "partial", "reversed", "affirmed", "none_stated"];
var DECISION_STAGES = ["fee_waiver_decision", "denial", "appeal_decision", "court_decision"];
var LIFECYCLE_KEYS = ["stage", "follows", "outcome", "exemptions", "due_by", "due_cite"];
function lifecycleFindings(entries, i) {
  const out = [];
  const e = entries[i];
  if (!e || typeof e !== "object" || Array.isArray(e)) return out;
  const str = (v) => v === null || v === void 0 ? "" : String(v).trim();
  const stage = str(e.stage), follows = str(e.follows), outcome = str(e.outcome);
  const exemptions = str(e.exemptions), dueBy = str(e.due_by), dueCite = str(e.due_cite);
  if (stage) {
    const legal = CORRESPONDENCE_STAGES[e.direction] || [];
    if (!legal.includes(stage)) {
      out.push({ code: "STAGE_NOT_OF_DIRECTION", message: `correspondence[${i}].stage '${stage.slice(0, 40)}' is not a stage of a '${e.direction}' entry: ` + (legal.length ? `one of ${legal.join(", ")}` : "a non-response carries no stage, it names what it awaited by follows") });
    }
  }
  let prior = null;
  if (follows) {
    const n = /^\d+$/.test(follows) ? Number(follows) : null;
    prior = n !== null && n < i ? entries[n] : null;
    if (!prior || typeof prior !== "object") {
      out.push({ code: "FOLLOWS_NO_ENTRY", message: `correspondence[${i}].follows '${follows.slice(0, 20)}' names no earlier entry of this ledger: a stage names the entry it answers or follows by its position, counted from zero` });
      prior = null;
    }
  } else if (stage && stage !== "request") {
    out.push({ code: "FOLLOWS_NO_ENTRY", message: `correspondence[${i}] is a '${stage}' naming no entry it follows: each stage after the request names the entry it answers or follows, so the lifecycle reads as one chain` });
  }
  if (stage === "appeal" && follows && prior && !(prior.direction === "received" && str(prior.outcome))) {
    out.push({ code: "APPEAL_NAMES_NO_DECISION", message: `correspondence[${i}] is an appeal following entry ${follows}, which is not a decision: an appeal names the decision it appeals, a received entry carrying an outcome` });
  }
  if (outcome) {
    if (e.direction !== "received") {
      out.push({ code: "OUTCOME_NOT_ON_RECEIVED", message: `correspondence[${i}] carries an outcome on a '${e.direction}' entry: an outcome is what the body decided and sent back, so it rides a received entry` });
    } else if (!CORRESPONDENCE_OUTCOMES.includes(outcome)) {
      out.push({ code: "OUTCOME_NOT_IN_VOCABULARY", message: `correspondence[${i}].outcome '${outcome.slice(0, 40)}' is not one of: ${CORRESPONDENCE_OUTCOMES.join(", ")}` });
    }
  } else if (DECISION_STAGES.includes(stage) && e.direction === "received") {
    out.push({ code: "DECISION_WITHOUT_OUTCOME", message: `correspondence[${i}] is a '${stage}' with no outcome: a decision carries its outcome as the body gave it, and none_stated when it gave none` });
  }
  if (exemptions && e.direction !== "received") {
    out.push({ code: "OUTCOME_NOT_ON_RECEIVED", message: `correspondence[${i}] carries exemptions on a '${e.direction}' entry: the exemptions are the ones the body cited, so they ride a received entry` });
  }
  if (stage === "fee_estimate" && e.direction === "received" && !isQuoteEntry(e)) {
    out.push({ code: "FEE_ESTIMATE_WITHOUT_QUOTE", message: `correspondence[${i}] is a fee_estimate carrying no quote: a fee estimate IS D-148's quote, the amount and currency as quoted` });
  }
  if (!!dueBy !== !!dueCite) {
    out.push({ code: "DUE_HALF_STATED", message: `correspondence[${i}] states ${dueBy ? "a due date with no citation" : "a citation with no due date"}: a due date is stated with the citation it comes from, one of the action's governing laws, or not at all` });
  } else if (dueBy && !/^\d{4}-\d{2}-\d{2}$/.test(dueBy)) {
    out.push({ code: "DUE_NOT_A_DATE", message: `correspondence[${i}].due_by '${dueBy.slice(0, 40)}' is not a date (YYYY-MM-DD)` });
  }
  return out;
}
var DUE_UNDETERMINED_SAYS = "UNDETERMINED: no member has stated when the next stage is due. The record encodes no law's clock, so it computes none \u2014 not from the action's kind, not from a law, not from the stage. A member states a due date with the citation it comes from.";
var dayNumber = (d) => {
  const s = String(d ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const ms = Date.parse(`${s}T00:00:00Z`);
  return Number.isFinite(ms) ? Math.round(ms / 864e5) : null;
};
function requestLifecycleOf(fm, today) {
  const entries = Array.isArray(fm?.correspondence) ? fm.correspondence : [];
  const laws = governingLawsOf(fm).laws.map((l) => l.citation);
  const day = String(today ?? "").slice(0, 10);
  const todayN = dayNumber(day);
  const str = (v) => v === null || v === void 0 ? "" : String(v).trim();
  const ordOf = (v, i) => /^\d+$/.test(str(v)) && Number(str(v)) < i ? Number(str(v)) : null;
  const followers = entries.map(() => []);
  entries.forEach((e, i) => {
    const p = e && typeof e === "object" ? ordOf(e.follows, i) : null;
    if (p !== null) followers[p].push(i);
  });
  const chain = entries.map((e, i) => {
    if (!e || typeof e !== "object" || Array.isArray(e)) return { ord: i, unreadable: true };
    const at = str(e.at).slice(0, 10);
    const follows = ordOf(e.follows, i);
    const prevAt = follows !== null && entries[follows] ? str(entries[follows].at).slice(0, 10) : "";
    const elapsed = follows !== null && dayNumber(at) !== null && dayNumber(prevAt) !== null ? dayNumber(at) - dayNumber(prevAt) : null;
    const next = followers[i];
    const dueBy = str(e.due_by), dueCite = str(e.due_cite);
    let due;
    if (dueBy && dueCite && dayNumber(dueBy) !== null) {
      const firstAt = next.length ? str(entries[next[0]].at).slice(0, 10) : "";
      const status = next.length ? dayNumber(firstAt) !== null && dayNumber(firstAt) <= dayNumber(dueBy) ? "followed_by_due" : "followed_after_due" : todayN !== null && dayNumber(dueBy) < todayN ? "passed_unanswered" : "open";
      due = {
        state: "stated",
        by: dueBy,
        cite: dueCite,
        on_list: laws.includes(dueCite),
        status,
        ...status === "passed_unanswered" ? { days_past: todayN - dayNumber(dueBy) } : {}
      };
    } else {
      due = { state: "undetermined", says: DUE_UNDETERMINED_SAYS };
    }
    return {
      ord: i,
      direction: e.direction ?? null,
      at,
      stage: str(e.stage) || null,
      stage_stated: !!str(e.stage),
      follows,
      elapsed_days: elapsed,
      outcome: str(e.outcome) || null,
      ...str(e.exemptions) ? { exemptions: str(e.exemptions) } : {},
      ...isQuoteEntry(e) ? { quote: { amount: str(e.quote_amount), currency: str(e.quote_currency) } } : {},
      followed_by: next,
      ...!next.length && todayN !== null && dayNumber(at) !== null ? { days_since: todayN - dayNumber(at) } : {},
      due
    };
  });
  return {
    entries: chain,
    passed_unanswered: chain.filter((c) => c.due && c.due.status === "passed_unanswered").map((c) => c.ord),
    as_of: day,
    says: "Each entry is dated as recorded and names the entry it follows. The plane derives only the days between entries and whether a STATED due date passed with nothing following it; it encodes no law's clock and states no judgement about the body."
  };
}
function consequenceState(fm) {
  const c = fm?.consequence;
  if (!c || typeof c !== "object" || Array.isArray(c)) return null;
  const claim = c.claim === "impact" ? "impact" : "outcome";
  const description = typeof c.description === "string" ? c.description.trim() : "";
  const at = typeof c.at === "string" ? c.at.trim() : "";
  if (claim === "outcome") {
    return {
      claim,
      state: "recorded",
      determined: true,
      grade: null,
      evidence: [],
      description,
      at,
      detail: "OUTCOME: a dated first-party fact about the body, carried at full strength. It makes no causal claim, so there is nothing here to establish (DEC-14)."
    };
  }
  const ownArtifacts = new Set((Array.isArray(fm.correspondence) ? fm.correspondence : []).map((e) => e && typeof e === "object" && typeof e.artifact_bundle_id === "string" ? e.artifact_bundle_id : null).filter(Boolean));
  const evidence = (Array.isArray(fm.action_basis) ? fm.action_basis : []).filter((l) => l && typeof l === "object" && l.kind === "rests_on" && typeof l.target === "string" && BUNDLE_ID_RE.test(l.target) && OBJECT_TYPES[l.target.split("-")[0]] !== "action" && !ownArtifacts.has(l.target)).map((l) => l.target);
  if (!evidence.length) {
    return {
      claim,
      state: "unproven",
      determined: false,
      grade: null,
      evidence: [],
      description,
      at,
      detail: "UNPROVEN: this action claims IMPACT and rests on no evidence outside our own action, so the causal link is asserted from sequence alone. That is not a low score and not a failure \u2014 it is what we have not established. Cite something outside us (a statement naming the report, a staff memo, a hearing record) and it becomes a claim like any other (DEC-14)."
    };
  }
  return {
    claim,
    state: "established",
    determined: true,
    grade: null,
    evidence,
    description,
    at,
    detail: `IMPACT rests on evidence that is not our own action: ${evidence.join(", ")}.`
  };
}
function checkActionExtension(ctx, findings) {
  if (ctx.fm?.object_type !== "action") return;
  const fm = ctx.fm;
  actionBasisFindings(fm, findings);
  correspondenceFindings(fm, findings);
  if (!ACTION_KINDS.includes(fm.action_kind)) findings.push(f("C-2.10", "error", `action_kind '${fm.action_kind}' is not in the suite`));
  if (riskTierState(fm.risk_tier) === null) findings.push(f("C-2.10", "error", `risk_tier '${fm.risk_tier}' is not one of ${Object.keys(RISK_TIERS).join(", ")}`));
  checkCounterparty(fm, findings);
  governingLawsFindings(fm, findings);
  riskTierHistoryFindings(fm, findings);
  if (fm.current_state === "resolved" && !RESOLUTIONS.includes(fm.resolution)) {
    findings.push(f("C-2.10", "error", `resolved state requires resolution in: ${RESOLUTIONS.join(", ")}`));
  }
  const clock = Array.isArray(fm.clock) ? fm.clock : [];
  const today = new Date(ctx.nowMs ?? Date.now()).toISOString().slice(0, 10);
  const STATUSES = ["pending", "met", "overdue", "waived"];
  for (let i = 0; i < clock.length; i++) {
    const e = clock[i];
    if (!e || !e.text || !e.description) {
      findings.push(f("C-11.1", "error", `clock[${i}] lacks the dual-audience {text, description} shape`));
      continue;
    }
    if (!DATE_RE.test(e.date || "")) findings.push(f("C-11.1", "error", `clock[${i}].date '${e.date}' is not YYYY-MM-DD`));
    if (typeof e.basis !== "string" || e.basis.trim() === "") {
      findings.push(f("C-11.1", "error", `clock[${i}] has no basis (the statute, order, or commitment the date derives from)`, ["supply basis"]));
    }
    if (!STATUSES.includes(e.status)) findings.push(f("C-11.1", "error", `clock[${i}].status '${e.status}' is not one of: ${STATUSES.join(", ")}`));
    if (DATE_RE.test(e.date || "") && e.date < today && e.status === "pending") {
      findings.push(f(
        "C-11.1",
        "error",
        `clock[${i}] '${e.text}' is silently past-due (${e.date} < today, status still pending)`,
        ["mark overdue", "mark met", "mark waived with reason"]
      ));
    }
  }
}
function isPublicHttpsLocator(url) {
  if (typeof url !== "string" || !/^https:\/\//.test(url)) return false;
  const m = /^https:\/\/([^/?#]+)/.exec(url);
  if (!m) return false;
  const hostport = m[1];
  if (hostport.indexOf("@") !== -1) return false;
  const host = hostport.split(":")[0].toLowerCase();
  if (host === "localhost" || host.charAt(0) === "[") return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return false;
  if (host.indexOf(".") === -1) return false;
  return true;
}
var GATH_ID_RE = /^GATH-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
var CRITICALITY_ENUM = ["crucial", "supporting"];
var CADENCE_ENUM = ["hourly", "daily", "weekly", "monthly", "none"];
var GATH_STATUS_ENUM = ["open", "captured", "retired"];
var CAPTURE_ENCODINGS = ["utf8", "base64", "binary"];
var RAW_SHA_RE = /^[0-9a-f]{64}$/;
function b64ToBytes(s) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const clean = String(s).replace(/[\s=]+/g, "");
  const out = new Uint8Array(Math.floor(clean.length * 3 / 4));
  let o = 0, buf = 0, bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const v = A.indexOf(clean[i]);
    if (v === -1) throw new Error("invalid base64 at position " + i);
    buf = buf << 6 | v;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[o++] = buf >> bits & 255;
    }
  }
  return out.subarray(0, o);
}
function createSha256() {
  const K = [
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
  ];
  let h0 = 1779033703 | 0, h1 = 3144134277 | 0, h2 = 1013904242 | 0, h3 = 2773480762 | 0;
  let h4 = 1359893119 | 0, h5 = 2600822924 | 0, h6 = 528734635 | 0, h7 = 1541459225 | 0;
  const buf = new Uint8Array(64);
  const w = new Int32Array(64);
  let bufLen = 0;
  let total = 0;
  let finalized = false;
  function compress(bytes, off) {
    for (let i = 0; i < 16; i++) {
      w[i] = bytes[off] << 24 | bytes[off + 1] << 16 | bytes[off + 2] << 8 | bytes[off + 3];
      off += 4;
    }
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ x >>> 3;
      const s1 = (y >>> 17 | y << 15) ^ (y >>> 19 | y << 13) ^ y >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f2 = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      const ch = e & f2 ^ ~e & g;
      const t1 = h + S1 + ch + K[i] + w[i] | 0;
      const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      const maj = a & b ^ a & c ^ b & c;
      const t2 = S0 + maj | 0;
      h = g;
      g = f2;
      f2 = e;
      e = d + t1 | 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 | 0;
    }
    h0 = h0 + a | 0;
    h1 = h1 + b | 0;
    h2 = h2 + c | 0;
    h3 = h3 + d | 0;
    h4 = h4 + e | 0;
    h5 = h5 + f2 | 0;
    h6 = h6 + g | 0;
    h7 = h7 + h | 0;
  }
  return {
    /** Feed a chunk of bytes. Chainable. */
    update(chunk) {
      if (finalized) throw new Error("sha256 stream already finalized");
      let c = chunk;
      if (!(c instanceof Uint8Array)) c = Uint8Array.from(c);
      let i = 0;
      const n = c.length;
      total += n;
      if (bufLen > 0) {
        while (bufLen < 64 && i < n) buf[bufLen++] = c[i++];
        if (bufLen === 64) {
          compress(buf, 0);
          bufLen = 0;
        }
      }
      while (n - i >= 64) {
        compress(c, i);
        i += 64;
      }
      while (i < n) buf[bufLen++] = c[i++];
      return this;
    },
    /** Finalize and return the lowercase hex digest. */
    hex() {
      if (finalized) throw new Error("sha256 stream already finalized");
      finalized = true;
      const bitHi = Math.floor(total / 536870912);
      const bitLo = total % 536870912 * 8;
      buf[bufLen++] = 128;
      if (bufLen > 56) {
        while (bufLen < 64) buf[bufLen++] = 0;
        compress(buf, 0);
        bufLen = 0;
      }
      while (bufLen < 56) buf[bufLen++] = 0;
      buf[56] = bitHi >>> 24 & 255;
      buf[57] = bitHi >>> 16 & 255;
      buf[58] = bitHi >>> 8 & 255;
      buf[59] = bitHi & 255;
      buf[60] = bitLo >>> 24 & 255;
      buf[61] = bitLo >>> 16 & 255;
      buf[62] = bitLo >>> 8 & 255;
      buf[63] = bitLo & 255;
      compress(buf, 0);
      let out = "";
      const H = [h0, h1, h2, h3, h4, h5, h6, h7];
      for (let i = 0; i < 8; i++) {
        const v = H[i] >>> 0;
        out += ("00000000" + v.toString(16)).slice(-8);
      }
      return out;
    }
  };
}
function storedToHashable(v, encoding) {
  if (encoding === "base64") return b64ToBytes(asText(v));
  return v;
}
async function checkInfo2Contract(ctx, findings) {
  if (ctx.fm?.object_type !== "information" || ctx.fm?.schema !== "information@2") return;
  const raw = ctx.files.get("data/provenance.json");
  if (!raw) {
    return;
  }
  let reg;
  try {
    reg = JSON.parse(asText(raw));
  } catch {
    return;
  }
  const docs = reg && Array.isArray(reg.documents) ? reg.documents : null;
  if (!docs) return;
  const hist = Array.isArray(ctx.fm.state_history) ? ctx.fm.state_history : [];
  const rels = Array.isArray(reg.releases) ? reg.releases : [];
  for (const e of hist) {
    if (!e || e.from_state !== "collected" || e.to_state !== "verified") continue;
    const signed = rels.some((r) => r && r.transition === e.timestamp && r.signature_file);
    if (!signed) {
      findings.push(f(
        "C-18.7",
        "warn",
        `collected -> verified transition at ${e.timestamp} has no signed release record; the target mechanism is a detached SSH signature over the transition record (ssh-keygen -Y sign, namespace bio-release; doctrine 4a)`,
        ["sign the transition record and add the releases[] entry with signature_file, signer, namespace", "record the interim member review of the release log in Review Notes"]
      ));
    }
  }
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    if (!d || typeof d !== "object") continue;
    const cap = d.capture && typeof d.capture === "object" ? d.capture : {};
    if (!RAW_SHA_RE.test(cap.sha256 || "") || !CAPTURE_ENCODINGS.includes(cap.encoding)) continue;
    let hashable = null;
    let actual = null;
    try {
      if (Array.isArray(d.parts) && d.parts.length && d.parts.every((p) => p && p.file && ctx.files.has(String(p.file)))) {
        const stored = d.parts.map((p) => ctx.files.get(String(p.file)));
        const textStored = (v) => cap.encoding !== "base64" && typeof v === "string";
        if (stored.every((v) => textStored(v))) {
          hashable = stored.join("");
        } else if (stored.every((v) => !textStored(v))) {
          const h = createSha256();
          for (const v of stored) h.update(cap.encoding === "base64" ? b64ToBytes(asText(v)) : v);
          actual = h.hex();
        } else {
          throw new Error("parts mix text and binary storage");
        }
      } else if (d.file && ctx.files.has(String(d.file))) {
        hashable = storedToHashable(ctx.files.get(String(d.file)), cap.encoding);
      }
    } catch (err) {
      findings.push(f("C-18.6", "error", `provenance documents[${i}]: stored content could not be decoded for hash verification (${err && err.message}) (@2)`));
      continue;
    }
    if (actual === null) {
      if (hashable === null) continue;
      actual = await ctx.sha256(hashable);
    }
    if (actual !== cap.sha256) {
      findings.push(f(
        "C-18.6",
        "error",
        `provenance documents[${i}]: stored bytes hash ${actual.slice(0, 12)}\u2026 but the register records ${String(cap.sha256).slice(0, 12)}\u2026; silent content mutation fails the gate (@2)`,
        ["restore the capture from history", "correct the register only if the recorded hash was wrong at intake, with a Session Log entry"]
      ));
    }
  }
}
function checkGatheringGrammar(ctx, findings) {
  const raw = ctx.files.get("data/gathering.json");
  if (!raw) return;
  let g;
  try {
    g = JSON.parse(asText(raw));
  } catch {
    return;
  }
  if (typeof g !== "object" || g === null || Array.isArray(g)) {
    findings.push(f("C-18.5", "error", "data/gathering.json must be a JSON object"));
    return;
  }
  if (g.daemon !== void 0) {
    const dmn = g.daemon;
    if (typeof dmn !== "object" || dmn === null || Array.isArray(dmn)) {
      findings.push(f("C-18.5", "error", "gathering.json daemon block must be an object"));
    } else {
      if (typeof dmn.enabled !== "boolean") findings.push(f("C-18.5", "error", "gathering.json daemon.enabled must be boolean"));
      for (const bk of ["tick_budget", "sweep_budget"]) {
        if (dmn[bk] !== void 0 && !(Number.isInteger(dmn[bk]) && dmn[bk] >= 0)) {
          findings.push(f("C-18.5", "error", `gathering.json daemon.${bk} must be a non-negative integer`));
        }
      }
    }
  }
  const reqs = Array.isArray(g.requests) ? g.requests : [];
  for (let i = 0; i < reqs.length; i++) {
    const r = reqs[i];
    if (typeof r !== "object" || r === null) {
      findings.push(f("C-18.5", "error", `gathering.json requests[${i}] is not an object`));
      continue;
    }
    if (!GATH_ID_RE.test(r.id || "")) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].id '${r.id}' does not match the GATH grammar`));
    const tgt = r.target;
    if (!tgt || typeof tgt !== "object") findings.push(f("C-18.5", "error", `gathering.json requests[${i}] missing target block`));
    else {
      if (typeof tgt.text !== "string" || tgt.text.length === 0 || tgt.text.length > 200 || /[\r\n]/.test(tgt.text)) {
        findings.push(f("C-18.5", "error", `gathering.json requests[${i}].target.text must be a nonempty single-line string under 200 chars`));
      }
      if (tgt.description !== void 0 && (typeof tgt.description !== "string" || tgt.description.length > 2e3)) {
        findings.push(f("C-18.5", "error", `gathering.json requests[${i}].target.description must be a string under 2000 chars`));
      }
    }
    const locs = Array.isArray(r.locators) ? r.locators : null;
    if (!locs || locs.length === 0) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].locators must be a nonempty array`));
    else for (let L = 0; L < locs.length; L++) {
      if (!isPublicHttpsLocator(locs[L])) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].locators[${L}] '${String(locs[L]).slice(0, 40)}' is not an https public-host locator`));
    }
    if (typeof r.authority !== "string" || r.authority.trim() === "") findings.push(f("C-18.5", "error", `gathering.json requests[${i}].authority must be a nonempty string`));
    if (!CRITICALITY_ENUM.includes(r.criticality)) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].criticality must be one of: ${CRITICALITY_ENUM.join(", ")}`));
    if (r.cadence !== void 0 && !CADENCE_ENUM.includes(r.cadence)) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].cadence must be one of: ${CADENCE_ENUM.join(", ")}`));
    if (!GATH_STATUS_ENUM.includes(r.status)) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].status must be one of: ${GATH_STATUS_ENUM.join(", ")}`));
    if (r.planted !== void 0 && !ISO_TS_RE.test(r.planted)) findings.push(f("C-18.5", "error", `gathering.json requests[${i}].planted must be an ISO 8601 UTC instant`));
  }
  const sweeps = Array.isArray(g.sweeps) ? g.sweeps : [];
  for (let i = 0; i < sweeps.length; i++) {
    const s = sweeps[i];
    if (typeof s !== "object" || s === null) {
      findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}] is not an object`));
      continue;
    }
    if (typeof s.id !== "string" || s.id.trim() === "") findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}].id must be a nonempty string`));
    if (s.ratified !== void 0 && typeof s.ratified !== "boolean") findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}].ratified must be boolean`));
    if (s.sources !== void 0) {
      if (!Array.isArray(s.sources)) findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}].sources must be an array`));
      else for (let L = 0; L < s.sources.length; L++) if (!isPublicHttpsLocator(s.sources[L])) findings.push(f("C-18.5", "error", `gathering.json sweeps[${i}].sources[${L}] is not an https public-host locator`));
    }
  }
}
var TASK_ID_RE = /^TASK-\d{4}-\d{4}-[a-z0-9]+(-[a-z0-9]+)*$/;
var TASK_KIND_ENUM = ["authority-undetermined"];
var TASK_ROLE_ENUM = ["project-manager", "group-admin", "member"];
var TASK_STATUS_ENUM = ["open", "resolved", "forwarded"];
var TASK_EVENT_ENUM = ["created", "forwarded", "resolved", "folded"];
var MEMBER_ID_RE = /^[a-z0-9][a-z0-9-]{1,40}$/;
function checkInboxGrammar(ctx, findings) {
  const raw = ctx.files.get("data/inbox.json");
  if (!raw) return;
  let g;
  try {
    g = JSON.parse(asText(raw));
  } catch {
    return;
  }
  if (typeof g !== "object" || g === null || Array.isArray(g)) {
    findings.push(f("C-19.1", "error", "data/inbox.json must be a JSON object"));
    return;
  }
  const tasks = Array.isArray(g.tasks) ? g.tasks : null;
  if (g.tasks !== void 0 && !tasks) {
    findings.push(f("C-19.1", "error", "inbox.json tasks must be an array"));
    return;
  }
  const seen = /* @__PURE__ */ new Set();
  for (let i = 0; i < (tasks || []).length; i++) {
    const tk = tasks[i];
    if (typeof tk !== "object" || tk === null) {
      findings.push(f("C-19.1", "error", `inbox.json tasks[${i}] is not an object`));
      continue;
    }
    if (!TASK_ID_RE.test(tk.id || "")) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].id '${tk.id}' does not match the TASK grammar`));
    else if (seen.has(tk.id)) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}] repeats id '${tk.id}'`));
    else seen.add(tk.id);
    if (!TASK_KIND_ENUM.includes(tk.kind)) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].kind '${tk.kind}' must be one of: ${TASK_KIND_ENUM.join(", ")}`));
    const sub = tk.subject;
    if (!sub || typeof sub !== "object") findings.push(f("C-19.1", "error", `inbox.json tasks[${i}] missing subject block`));
    else {
      if (typeof sub.text !== "string" || sub.text.length === 0 || sub.text.length > 200 || /[\r\n]/.test(sub.text)) {
        findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].subject.text must be a nonempty single-line string under 200 chars`));
      }
      if (sub.description !== void 0 && (typeof sub.description !== "string" || sub.description.length > 2e3)) {
        findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].subject.description must be a string under 2000 chars`));
      }
    }
    if (!BUNDLE_ID_RE.test(tk.refers_to || "")) {
      findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].refers_to '${String(tk.refers_to).slice(0, 40)}' is not a canonical bundle ID`));
    } else if (ctx.resolveTarget && !ctx.resolveTarget(tk.refers_to)) {
      findings.push(f(
        "C-19.1",
        "error",
        `inbox.json tasks[${i}].refers_to '${tk.refers_to}' does not resolve in the store`,
        ["re-point the task at the successor bundle", "resolve the task with a reason if its subject is gone"]
      ));
    }
    if (tk.locators !== void 0) {
      if (!Array.isArray(tk.locators)) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].locators must be an array`));
      else for (let L = 0; L < tk.locators.length; L++) {
        if (!isPublicHttpsLocator(tk.locators[L])) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].locators[${L}] '${String(tk.locators[L]).slice(0, 40)}' is not an https public-host locator`));
      }
    }
    if (tk.assignee !== "unassigned" && !MEMBER_ID_RE.test(tk.assignee || "")) {
      findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].assignee '${tk.assignee}' must be a member_id or the literal 'unassigned'`));
    }
    if (!TASK_ROLE_ENUM.includes(tk.assignee_role)) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].assignee_role '${tk.assignee_role}' must be one of: ${TASK_ROLE_ENUM.join(", ")}`));
    if (!TASK_STATUS_ENUM.includes(tk.status)) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].status '${tk.status}' must be one of: ${TASK_STATUS_ENUM.join(", ")}`));
    if (!ISO_TS_RE.test(tk.created || "")) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].created must be an ISO 8601 UTC instant`));
    if (tk.resolved_at !== void 0 && tk.resolved_at !== null && !ISO_TS_RE.test(tk.resolved_at)) {
      findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].resolved_at must be an ISO 8601 UTC instant`));
    }
    if (tk.status === "resolved" && !ISO_TS_RE.test(tk.resolved_at || "")) {
      findings.push(f("C-19.1", "error", `inbox.json tasks[${i}] is resolved but carries no resolved_at instant`));
    }
    const hist = tk.history;
    if (!Array.isArray(hist) || hist.length === 0) {
      findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].history must be a nonempty append-only array`));
    } else {
      let prev = "";
      for (let h = 0; h < hist.length; h++) {
        const e = hist[h];
        if (typeof e !== "object" || e === null) {
          findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].history[${h}] is not an object`));
          continue;
        }
        if (!ISO_TS_RE.test(e.at || "")) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].history[${h}].at must be an ISO 8601 UTC instant`));
        else {
          if (prev && e.at < prev) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].history[${h}] is out of chronological order`));
          prev = e.at;
        }
        if (!TASK_EVENT_ENUM.includes(e.event)) findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].history[${h}].event '${e.event}' must be one of: ${TASK_EVENT_ENUM.join(", ")}`));
        if (typeof e.actor !== "string" || e.actor.length === 0 || e.actor.length > 64 || /[\r\n]/.test(e.actor)) {
          findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].history[${h}].actor must be a nonempty single-line string under 64 chars`));
        }
      }
      if (hist[0] && hist[0].event !== "created") {
        findings.push(f("C-19.1", "error", `inbox.json tasks[${i}].history does not begin with its creation`));
      }
    }
  }
}
var MECHANICAL_FIELD_SETS = {
  "monitor-tick": ["source_status", "monitoring.last_checked", "reeval_pending.flag", "reeval_pending.since", "reeval_pending.source", "last_updated"],
  "sweep": [],
  "deadline-recheck": ["clock[].status", "last_updated"],
  "member-attest": ["last_updated"]
};
function projectNameKey(title) {
  return String(title ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}
function checkProjectNameUniqueness(corpus) {
  const findings = [];
  const keyed = [];
  let projects = 0;
  for (const input of corpus || []) {
    const raw = input && input.files && input.files.get ? input.files.get("bundle.md") : void 0;
    const fm = raw == null ? null : parseFrontmatter(asText(raw)).data;
    const label = fm && typeof fm.id === "string" && fm.id || input && input.folderName || "(unnamed bundle)";
    if (!fm) {
      findings.push(f(
        "C-77.2",
        "warning",
        `${label}: bundle.md is ${raw == null ? "absent" : "unreadable"}, so whether it is a project, and whether its name collides, is UNDETERMINED`,
        ["hand the corpus with this bundle's bundle.md readable and run the check again"]
      ));
      continue;
    }
    if (normalizeType(fm.object_type) !== "project") continue;
    projects++;
    const key = projectNameKey(fm.title);
    if (!key) {
      findings.push(f(
        "C-77.2",
        "warning",
        `${label}: a project with no title cannot be compared for name uniqueness (the write path refuses it NO_TITLE)`,
        ["give the project a title unique across the instance"]
      ));
      continue;
    }
    keyed.push({ id: label, title: String(fm.title), state: fm.current_state, key });
  }
  for (let i = 0; i < keyed.length; i++) {
    for (let j = i + 1; j < keyed.length; j++) {
      const a = keyed[i], b = keyed[j];
      if (a.key !== b.key) continue;
      const st = (p) => p.state === void 0 ? "" : ` [${p.state}]`;
      findings.push(f(
        "C-77.1",
        "error",
        `project names collide: ${a.id} "${a.title}"${st(a)} and ${b.id} "${b.title}"${st(b)} are the same name compared case-insensitively with whitespace collapsed (Membership v2 \xA77.1), which holds across deactivated projects too`,
        [
          "rename one of the two projects so each name identifies one project",
          "if one is deactivated, rename the live one: the deactivated project is still cited by its name"
        ]
      ));
    }
  }
  return { pass: !findings.some((x) => x.severity === "error"), findings, projects, judged: keyed.length };
}
async function checkBundle(input, opts = {}) {
  const findings = [];
  const bundleRaw = input.files.get("bundle.md");
  const ctx = {
    folderName: input.folderName,
    files: input.files,
    // 1.13.0 (three-tier read model): paths known to exist in the
    // authoritative store but whose bytes the caller deliberately did not
    // carry (a tier-scoped client mirror eliding snapshots/ and _history/).
    // Presence assertions ("this registered path must exist") consult
    // files UNION elided via hasFile_; byte checks (hashing, parsing,
    // history audits) stay files-only and skip elided content exactly as
    // they skip absent content, so nothing is ever verified against bytes
    // the caller does not hold. The gate and cli pass nothing here and are
    // byte-complete as before.
    elided: input.elidedPaths instanceof Set ? input.elidedPaths : new Set(Array.isArray(input.elidedPaths) ? input.elidedPaths : []),
    sha256: input.sha256,
    nowMs: input.nowMs,
    maxPackageAgeDays: input.maxPackageAgeDays ?? 14,
    maxReevalAgeDays: input.maxReevalAgeDays ?? 30,
    /* inquiry@1 joins; focus@1 and problem@1 STAY KNOWN forever — schema
       stamps are document truth in append-only history (REC-10). */
    /* PL-12 / D-84: `bias@1`. A type whose schema stamp the catalog does not
       know is refused by C-2.5 before any type-specific check runs, so the
       stamp has to be admitted in the same turn as the type. */
    knownSchemas: opts.knownSchemas ?? ["information@1", "information@2", "inquiry@1", "focus@1", "problem@1", "project@1", "action@1", "bias@1"],
    resolveTarget: input.resolveTarget,
    // D2.3: the key registry, injected exactly like resolveTarget. Absent
    // is legal and means pre-migration behavior; absent WITH a
    // post-migration release is an error, never a skip.
    releaseRegistry: input.releaseRegistry || null,
    /* REC-14: the published projection, injected exactly like releaseRegistry
       and for the same reason — the checker is a pure function over a
       filesystem, and what OTHER cases were published (and at which editions,
       with which frozen pair) is not in this bundle. Shape:
         { <bundleId>: { latest: n, editions: { "1": {edition, completeness,
             capture: {state, grade}, connection: {state, grade}} } } }
       Absent means the caller cannot see the published record (the cli, the
       migrate tool) and C-21.1/C-21.2 cannot fire. Every path a real caller
       has — the ratification gate and the store's own write path — injects it,
       which is what keeps the absence from being a way through. */
    publishedRegistry: input.publishedRegistry || null,
    /* REC-44 / DEC-44: the CASE-altitude half of the same fact, injected on the
       same terms and separated for the reason DEC-44 gives — a case is a
       CONTAINER over one or more findings, so what the previous edition of THIS
       CASE asserted about its limits is not a fact about any one finding.
       Shape:
         { <caseId>: { latest: n, editions: { "1": {edition, scope,
             completeness, ratified_at} } } }
       Absent means the caller cannot see the published record (the cli, the
       migrate tool) and C-21.1 cannot fire; every path a real caller has
       injects it. Kept SEPARATE from publishedRegistry deliberately: one
       registry serving both altitudes is how the collapse this item corrects
       happened in the first place. */
    publishedCaseRegistry: input.publishedCaseRegistry || null,
    /* REC-18: the second fact the catalog cannot get from the bundle, and it is
       injected on exactly the same terms and for the same reason. What
       `resolutions` holds about this bundle's basis targets, and what `register`
       holds about their captures, is the record — not this document — so a
       checker over a filesystem has no way to compute an earned grade and says
       so rather than passing the leg (checkEarnedLeg). Shape:
         { subject_entity, subject_label, earned: {
             connection: { <target>: {grade, why, ...} },
             capture:    { <target>: {grade, why, ceiling?} } } }
       Absent means the caller cannot see the record (the cli, the migrate tool).
       Every path a real caller has injects it. */
    earnedRegistry: input.earnedRegistry || null,
    sha512: input.sha512 || null,
    fm: null,
    body: ""
  };
  if (!bundleRaw) {
    findings.push(f("C-13.1", "error", "bundle.md is missing"));
  } else {
    const parsed = parseFrontmatter(asText(bundleRaw));
    findings.push(...parsed.findings);
    ctx.fm = parsed.data;
    ctx.body = parsed.body;
    checkIdentity(ctx, findings);
    checkFrontmatterContract(ctx, findings);
    checkHeadings(ctx, findings);
    checkStateLegality(ctx, findings);
    checkWriteCompleteness(ctx, findings);
    await checkInformationExtension(ctx, findings);
    await checkInfo2Contract(ctx, findings);
    checkGatheringGrammar(ctx, findings);
    checkInboxGrammar(ctx, findings);
    checkReferences(ctx, findings);
    checkRecheckCoverage(ctx, findings);
    checkInquiryExtension(ctx, findings);
    checkProjectExtension(ctx, findings);
    checkActionExtension(ctx, findings);
    checkAppendOnly(ctx, findings);
    checkHistoryCoherence(ctx, findings);
  }
  checkFormatHygiene(ctx, findings);
  await checkQueueAndBase(ctx, findings);
  const pass = !findings.some((x) => x.severity === "error");
  return { pass, findings };
}
var AI_RUN_CHECKS = {
  /* §11: "Absence uses D-129's vocabulary — NEVER_LOOKED / LOOKED_ABSENT /
     LOOKED_INDETERMINATE / PRESENT, plus `partial`. Which absence is a stated
     fact, never a diagnostic detail." An entry outside the vocabulary is not a
     weaker statement of absence; it is an ungoverned one. */
  AI_LOG_STATE_UNKNOWN: {
    check: "C-22.1",
    where: "src/airun.mjs checkObservation, called from store.mjs #aiRunAppend",
    translation: "That observation does not say which kind of absence it found. The record distinguishes never having looked, having looked and found nothing, having looked and being unable to tell, having found it, and having found part of it."
  },
  /* D-104, and CLAUDE.md states the general rule it instantiates: "our governor
     refusing is not the source failing". An entry recording LOOKED_ABSENT when
     it was OUR pacing that stopped the fetch MANUFACTURES a false absence —
     §11's own word. The governed flag is the fact; a governed observation can
     only be LOOKED_INDETERMINATE, and either definitive claim is refused. */
  AI_LOG_GOVERNED_ABSENCE: {
    check: "C-22.2",
    where: "src/airun.mjs checkObservation, called from store.mjs #aiRunAppend",
    translation: "That observation was stopped by our own pacing of the source, not by the source. It can only record that we could not tell \u2014 recording an absence there would be a claim about the world made from a fact about us."
  },
  /* §11's third rule, SWEEP §3's false-coverage hazard: "A client-rendered
     shell capture is LOOKED_INDETERMINATE, never PRESENT". `client-rendered-shell`
     is catalogued with no producer, and an evidentially empty capture that reads
     as coverage is the defect the whole absence vocabulary exists to prevent. */
  AI_LOG_SHELL_PRESENT: {
    check: "C-22.3",
    where: "src/airun.mjs checkObservation, called from store.mjs #aiRunAppend",
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
    where: "src/airun.mjs checkCondition, called from store.mjs #aiRunTerminate",
    translation: "The run tried to end on a condition the record has no name for. A condition nobody can read is not an explanation."
  },
  /* §14b.6 IS THIS ITEM: "when a bound stops a run, the observation log says
     which bound and where it stopped". A close with no bound named is the
     `heldMatch` defect exactly — not found and did not finish looking made
     indistinguishable — so the terminate path REFUSES it rather than writing an
     unattributed ending. This is what makes "names the bound" a mechanism
     rather than an intention. */
  AI_RUN_BOUND_UNNAMED: {
    check: "C-22.5",
    where: "src/airun.mjs checkBound, called from store.mjs #aiRunTerminate",
    translation: "The run stopped without saying what stopped it. Not finding something and not finishing the search are different facts, and only one of them licenses a conclusion."
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
    where: "src/airun.mjs checkObservation, called from store.mjs #aiRunAppend",
    translation: "The observation log is not part of any published document and cannot be filed into one."
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
  
       A WHOLE-FUNCTION `where`, and it is the case the convention above blesses:
       `checkSkillVersion` is small, single-purpose, and the only refusal it makes
       is this one — `src/airun.mjs`'s three check functions are the named model. */
  AI_RUN_SKILL_VERSION_UNNAMED: {
    check: "C-22.7",
    where: "src/skillpack.mjs checkSkillVersion, called from store.mjs aiRunOpen",
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
    where: "src/airun.mjs projectGate, called from store.mjs aiRunOpen/aiRunTick/aiRunClose",
    translation: "Asking the system to look into a project is work inside that project, and this account is not one of that project's participants. This is not about what the account is allowed to do in general \u2014 it is about which piece of work it is part of. Someone who owns that project can invite you to it."
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
    where: "src/airun.mjs checkObservation, called from store.mjs #observe",
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
    where: "src/airun.mjs checkObservation, called from store.mjs #observe",
    translation: "That observation says the thing is there without saying what was found. A record that something is present has to point at what it found \u2014 the captured document, the passage, the entity \u2014 or nobody can check it later, and a claim of coverage that cannot be checked is worse than no claim at all."
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
    where: "src/airun.mjs checkRunContextKind, called from store.mjs aiRunOpen",
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
    where: "src/airun.mjs runPrincipalGate, called from store.mjs aiRunTick/aiRunClose/suggestVersion/extractPropose",
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
    where: "src/airun.mjs checkConsume, called from store.mjs aiRunTick and aiRunOpen",
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
    where: "src/airun.mjs checkConsume, called from store.mjs aiRunTick and aiRunOpen",
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
    where: "src/airun.mjs checkConsume (the tick's map, the open's list, and every key in either), called from store.mjs aiRunTick and aiRunOpen",
    translation: "The investigation named a part of its budget that does not exist, or did not say which part it meant. Nothing was recorded, so no budget was spent or set that nobody could account for."
  },
  /* REC-177, 2026-09-23 (INVESTIGATIVE-SESSION.md §14b item 6, BOB #30). A bound declared at `op=airunopen` with an
     ABSENT or ZERO `allowed` was opened at 0, and `finishedBound` reads 0 as NO CEILING — so the run recorded a bound
     it did not have. Refused at the open, nothing written. Its own code and not C-22.13's: C-22.13 is a figure of the
     wrong FORM (a string, a fraction, a negative), and 0 is a perfectly good whole number; what is wrong here is that
     the declaration states no allowance, and the remedy differs (state one, or do not declare the bound). */
  AI_RUN_BOUND_NO_ALLOWANCE: {
    check: "C-22.16",
    where: "src/airun.mjs checkConsume (the open's list, its allowance arm), called from store.mjs aiRunOpen",
    translation: "The investigation was given a limit on part of its budget without saying how much it may use. A limit of nothing would mean no limit at all, so the investigation was not started. Give it an amount, or leave that part out."
  },
  /* N118 (LEGACY-TESTS #3 REPORT 10; observation-log R3, K148; T6, legacy-checks) — C-22.1 WAS MINTED FOR A SECOND
  CONDITION. observation-log's `checkObservation` refuses a look that states NEVER_LOOKED (R3: NEVER_LOOKED is the
  absence of a row, never a row; its one exception is a run's terminal rollup, K148) under C-22.1's code, and
  C-22.1's sentence ("does not say which kind of absence it found") is false for it: that look named a kind, the
  one kind a look cannot be. DEC-49 is one code, one condition, so it takes a code of its own rather than C-22.1
  reworded to cover both. observation-log mints it at its next job (N118's observation-log share); until then the
  region below is unmarked and C-22.1 is still what that site answers. */
  AI_LOG_NEVER_LOOKED_STORED: {
    check: "C-22.17",
    where: "src/observation-log/vocabulary.mjs checkObservation > is-never-looked-stored",
    translation: "That observation says nobody looked, and an observation is the record of a look. Never having looked is what the record says of a subject with no observation at all, so it is not written as one. A look that happened records what it found: nothing, something, part of it, or that it could not tell."
  }
};
var AI_RUNS_CONTEXT_CHECKS = {
  /* No kind named at all. There is no honest default: `inquiry` and `project`
     are different objects with different membership, and answering from one
     when the caller meant the other is a confidently wrong answer about a
     different context — MEANING_ROWS_NO_ARM's reasoning, one table over. */
  AI_RUNS_NO_CONTEXT_TYPE: {
    check: "C-36.1",
    where: "src/store.mjs aiRunsInContext > is-airuns-context, reached from op=airuns",
    translation: "That request did not say what kind of thing to look in. Background work is attached either to a question or to a project, and those are different places \u2014 so the record asks which rather than choosing one for you."
  },
  /* A kind was named and the record has no such context. Refused rather than
     answered empty: see the header — an empty answer here would be the record
     saying nothing is running, on the strength of a word it did not recognise. */
  AI_RUNS_UNKNOWN_CONTEXT_TYPE: {
    check: "C-36.2",
    where: "src/store.mjs aiRunsInContext > is-airuns-context, reached from op=airuns",
    translation: "Background work is not attached to anything of that kind. Rather than answer as though nothing were running there, the record says so and names the kinds of thing it does attach work to."
  },
  /* A kind but no id. The gate is compiled over the CONTEXT ID, so a blank one
     would ask the record about every context at once — which is not a wider
     answer, it is a different question nobody asked. */
  AI_RUNS_NO_CONTEXT_ID: {
    check: "C-36.3",
    where: "src/store.mjs aiRunsInContext > is-airuns-context, reached from op=airuns",
    translation: "That request named a kind of thing but not which one. Background work belongs to a particular question or a particular project, and the record answers for the one you are looking at rather than for all of them."
  }
};
var VERSION_CHAIN_CHECKS = {
  /* No address at all. There is no default document and there must not be one:
     the chain's entire subject is "at THIS address", and a chain answered for
     an unnamed address is a list of unrelated bundles wearing the word
     "versions". */
  VERSION_CHAIN_NO_ADDRESS: {
    check: "C-24.1",
    where: "src/store.mjs versionChain, reached from op=versionchain",
    translation: "That request did not say which document address to read the versions of. Versions are versions OF something, so it asks rather than answering for a document you did not name."
  },
  /* An anchor was given and it is not a version at this address. Refused rather
     than matched approximately — that approximation IS D-221 — and refused
     IDENTICALLY whether the capture is absent, filed at a different address, or
     in a project this viewer was never invited to. Hidden and absent are one
     answer here, as they are on every gated read in this plane. */
  VERSION_CHAIN_NO_SUCH_VERSION: {
    check: "C-24.2",
    where: "src/store.mjs versionChain, reached from op=versionchain with at=<capture sha>",
    translation: "The record holds no version of that document with those bytes. Rather than pick the closest-looking one and call it the version before this, it says so \u2014 naming the wrong predecessor is the defect this read was built to end."
  },
  /* The anchor is not the shape a capture identity has. A separate refusal from
     the one above because it is a different fact about the world: "you typed
     something that is not a capture" is the caller's, and "no such version" is
     the record's. Collapsing them would make a typo indistinguishable from an
     absence, which is the distinction CLAUDE.md requires be stated. */
  VERSION_CHAIN_BAD_ANCHOR: {
    check: "C-24.3",
    where: "src/store.mjs versionChain, reached from op=versionchain with at=<capture sha>",
    translation: "That is not the shape a capture identity has, so nothing was looked up. A capture is named by the sha256 of its bytes; this says the request was malformed rather than letting it read as a document the record does not hold."
  }
};
var BASIS_VERSION_CHECKS = {
  /* §6 rule 1. The description is load-bearing rather than a courtesy: §10 makes
     it what survives a conversation that is deliberately not kept, and under §5
     it carries the naming of every ungraded leg. A version with none is an
     alternative account of the evidence with no account of itself. */
  VERSION_NO_DESCRIPTION: {
    check: "C-25.1",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "That version does not say what it is or why it differs. A version is a whole alternative reading of the evidence, and the description is what a member has left to compare it by once the conversation that produced it is gone."
  },
  /* §6 rule 2. Unique PER INQUIRY, never globally — "global uniqueness would
     make naming absurd". Two versions of one inquiry sharing a name makes every
     later reference to that name ambiguous, including `derived_from`, which is
     how the derivation tree is read. */
  VERSION_NAME_NOT_UNIQUE: {
    check: "C-25.2",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "Two versions of this inquiry have the same name. Names are how versions are compared and how one records what it was derived from, so within one inquiry a name means exactly one version."
  },
  /* §3 / SWEEP C5. See the block comment above for why this is a field. */
  VERSION_NO_RELATIONSHIP: {
    check: "C-25.3",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "That version does not say how its evidence fits together \u2014 whether every part is needed, or whether any one of its parts would carry the answer on its own. Those two readings give different answers about how strong the finding is, so the version says which one it is rather than letting the record assume."
  },
  /* The field is only a claim because it can be wrong. */
  VERSION_RELATIONSHIP_DISAGREES: {
    check: "C-25.4",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "That version says its evidence fits together one way and is grouped the other way. The two cannot both be true, and a member accepting it would be signing for a reading that is not the one written down."
  },
  /* §3: "A version that is a flat leg set cannot express plurality — the version
     IS the composition, and the partition is part of the composition." The
     partition is TOTAL on a version: checkGrounds' whole-or-not-at-all rule with
     the not-at-all arm removed, because the version must carry it. */
  VERSION_PARTITION_INCOMPLETE: {
    check: "C-25.5",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "Some of that version's evidence has not been placed in the argument. A part nobody placed sitting beside parts somebody did is a relationship the record would have to guess at, and it would have to guess in the direction that makes the finding stronger."
  },
  /* REC-45 / DEC-32's attributed act, at the version's own grain. "These legs
     are enough on their own" is the one thing that makes a finding STRONGER, so
     it carries a named member and a date and a machine credential cannot assert
     it — `isMachineIdentity` is the one predicate, never a word list (REC-46). */
  VERSION_GROUND_UNASSERTED: {
    check: "C-25.6",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "That version claims one part of its argument would carry the answer on its own, and no member has said so. That claim is the one thing that makes a finding stronger, so it carries the name of the person making it and the date they made it \u2014 never a machine's."
  },
  /* §6 rule 3a: "Each version records what it was derived from, null where a run
     composed it fresh." An edge naming a version that is not here points the
     derivation tree at nothing. */
  VERSION_DERIVED_FROM_UNKNOWN: {
    check: "C-25.7",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "That version says it came from a version this inquiry does not have. Where a version came from is how the alternatives are read as a tree rather than a pile, so it names one that exists or it names none."
  },
  /* A derivation tree is a TREE. A cycle makes "what was this derived from"
     unanswerable and the prune walk non-terminating. */
  VERSION_DERIVATION_CYCLE: {
    check: "C-25.8",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "These versions say they were derived from each other in a loop, so there is no answer to which came first. Versions form a tree, and a tree has a root."
  },
  /* DEC-50 / §6.7 — the clause the sweep added and the reason this is not merely
     a data check. "An edit that regroups the ground partition is the attributed
     regroup act REC-45 built — ungroup with a reason, cite, regroup — surfacing
     through the derived version's record of who and why. §6.7 licenses no
     unattributed structural edit." So a version whose partition DIFFERS from its
     parent's carries the act: a named member, a date, a reason. */
  VERSION_REGROUP_UNATTRIBUTED: {
    check: "C-25.9",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "That version rearranges the argument it was derived from, and nobody has said who did it or why. Rearranging which evidence is grouped with which changes how strong the finding reads, so it is an act with a name on it rather than an edit."
  },
  /* D-184 / C-2.8, restated at the version's grain because a version's legs do
     not pass through checkInquiryBasis's own loop: a leg rests on information or
     on another inquiry and NOTHING ELSE. Stated as a standing bound of this item
     rather than discovered later. */
  VERSION_LEG_NOT_CITABLE: {
    check: "C-25.10",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "One part of that version rests on something that cannot be evidence for a question \u2014 the record admits a document or another question, and nothing else."
  },
  /* §6 rule 3, AND IT IS THE ONE REFUSAL THIS FILE CANNOT REACH ON ITS OWN. A
     pure check over one document cannot see what the record already holds under
     that name, so the comparison is the store's — `store.mjs`'s promote path
     computes the composition digest of every offered version and compares it to
     the stored one BEFORE anything lands. The row lives here so the C-number,
     the code and the translation stay in one place with its siblings; the
     enforcement site says where it actually fires, which is not this file. */
  VERSION_FROZEN: {
    check: "C-25.11",
    /* A REGION `where`, NOT a function `where` — see this file's "WHAT A `where`
       MEANS" block above. `promote` is 870 lines and refuses ~34 things; this row
       governs the freeze arm and nothing else. The prose `(the basis-version
       freeze arm)` said exactly this before REC-71 and no instrument could read
       it, so the guard widened the claim to the whole function and conscripted 32
       unrelated refusals. The span is now DECLARED at the site. */
    where: "src/store.mjs #promoteChecks > basis-version-freeze, reached from op=promote, NOT reachable from a pure document check",
    translation: "That version already exists and has been changed in place. A version is frozen once written, because two people comparing it must be comparing the same thing \u2014 so an edit becomes a NEW version derived from this one, and the original stays exactly as it was."
  },
  /* §6 rule 4's vocabulary. This is the SIXTH state machine and IS-2 owns its
     transitions; PL-1 owns only that the word written is one of the four. An
     unknown state is refused rather than tolerated for DEC-8's reason: a surface
     rendering a state it has no translation for is the drift DEC-49 closed. */
  VERSION_STATE_UNKNOWN: {
    check: "C-25.12",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "That version is in a state the record has no name for. A version is suggested, being considered, accepted, or rejected \u2014 and nothing else."
  },
  /* §6 rule 3a, DEC-29(b), D-214. PRUNE HIDES AND NEVER DELETES. The flag is a
     boolean and the refusal exists so that no caller can smuggle a third value
     ("archived", "deleted") into a field whose entire meaning is that the row
     stays in the record and stays queryable. */
  VERSION_HIDDEN_NOT_BOOLEAN: {
    check: "C-25.13",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "The setting that hides a version from the display is not a yes-or-no answer here. Hiding a version removes it from view and nothing else \u2014 it stays in the record and stays answerable \u2014 so there is no third thing for this to say."
  },
  /* A leg naming its own inquiry. checkInquiryBasis refuses the same thing on
     `basis[]` as SELF_BASIS at the store; a version is an account OF the
     question and cannot rest on it. The transitive cycle check is NOT done here
     and that bound is stated in `basisVersionFindings`' own comment. */
  VERSION_LEG_SELF: {
    check: "C-25.14",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "That version rests on the question it is an answer to. A question is not evidence for its own answer."
  },
  /* A leg or a ground row that belongs to no version in the block — the mirror
     of DERIVED_FROM_UNKNOWN, one grain down. Three sibling arrays joined by name
     is the shape `basis[]`/`grounds[]` already uses; an orphan in either of the
     two joined arrays is material the record would hold and never read. */
  VERSION_ORPHAN_ROW: {
    check: "C-25.15",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "Part of the version block names a version that is not there. It would be material the record holds and never shows anybody, which is worse than not holding it."
  },
  /* THE SECOND REFUSAL A PURE CHECK CANNOT REACH. C-25.10 asks whether the leg
     COULD be evidence — a fact about the id's shape, which one document answers.
     This asks whether the thing is HERE, which only the store can see, and it is
     the same half `action_basis` and `supersedes` already split off from their
     shape arms. Kept separate from C-25.10 for the reason every split refusal in
     this file is kept separate: "you cited something that cannot be evidence"
     and "you cited something we do not hold" are different facts and a member
     told the wrong one is worse off than one told nothing. */
  VERSION_LEG_UNRESOLVED: {
    check: "C-25.16",
    /* A REGION `where` — see VERSION_FROZEN above and the "WHAT A `where` MEANS"
       block at the head of this file. */
    where: "src/store.mjs #promoteChecks > basis-version-resolve, reached from op=promote, NOT reachable from a pure document check",
    translation: "One part of that version rests on something this record does not hold. A reading of the evidence that points at a document nobody can open is a reading nobody can check."
  },
  /* THE READ'S TWO REFUSALS. Versions are versions OF an inquiry, so there is no
     default subject and there must not be one — VERSION_CHAIN_NO_ADDRESS'
     reasoning one construct over: an answer for an unnamed subject is a list of
     unrelated compositions wearing the word "versions". */
  BASIS_VERSIONS_NO_INQUIRY: {
    check: "C-25.17",
    where: "src/store.mjs basisVersions, reached from op=basisversions",
    translation: "That request did not say which question to read the versions of. A version is one reading of the evidence for one question, so it asks rather than answering for a question you did not name."
  },
  /* And an id of the wrong CLASS is refused rather than answered with an empty
     list. "This project has no versions of its basis" is a confidently wrong
     sentence about a thing that has no basis at all, and an empty answer is the
     most misleading form a wrong answer takes. */
  BASIS_VERSIONS_NOT_AN_INQUIRY: {
    check: "C-25.18",
    where: "src/store.mjs basisVersions, reached from op=basisversions",
    translation: "Only a question carries versions of its evidence, and that is not a question. Answering with an empty list would say this thing has no readings of its evidence, when the truth is that it could not have any."
  },
  /* PL-2 / IS-2 — THE SECOND ENFORCEMENT LAYER of §6 rule 4's reason rule, and
       it is here rather than only at the write op because VERIFICATION rule 3a
       requires an assertion at EACH place a rule is enforced, and because the two
       layers answer different questions. The write op refuses an ACT that carries
       no reason. This refuses a DOCUMENT that arrives already claiming a
       reason-bearing state with nothing behind it — which is the shape a hand-
       authored `bundle.md`, a replayed history, or a future writer would take, and
       none of those go through the op.
  
       BOTH LAYERS CALL `versionNeedsReason` AND NEITHER RE-TYPES THE SET. Two
       enforcement layers are what the rule requires; two IMPLEMENTATIONS of the
       membership test are what IS-6's C-22.4 control was absorbed by, so there is
       one predicate and the suite pins the count. */
  VERSION_DISPOSITION_UNATTRIBUTED: {
    check: "C-25.19",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "This reading of the evidence was set aside or turned down with no reason recorded, or with a machine's name against it. What a member decided about a reading, and why, is the record itself \u2014 a decision nobody signed and nobody explained leaves nothing to answer to."
  }
};
var VERSION_STATES = ["suggested", "considering", "accepted", "rejected"];
var VERSION_MACHINE = {
  legal: VERSION_STATES,
  edges: {
    suggested: ["considering", "accepted", "rejected"],
    considering: ["suggested", "accepted", "rejected"],
    accepted: ["considering", "rejected"],
    rejected: ["suggested", "considering", "accepted"]
  }
};
var VERSION_REASON_REQUIRED = ["considering", "rejected"];
var versionNeedsReason = (to) => VERSION_REASON_REQUIRED.includes(to);
var VERSION_ACT_CHECKS = {
  VERSION_ACT_NO_INQUIRY: {
    check: "C-25.20",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "That request did not say which question the reading belongs to. A reading of the evidence always belongs to one question, so it asks rather than guessing."
  },
  VERSION_ACT_NOT_AN_INQUIRY: {
    check: "C-25.21",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "Only a question carries readings of its evidence, and that is not a question. There is nothing here to accept, set aside or turn down."
  },
  VERSION_ACT_NO_VERSION: {
    check: "C-25.22",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "That request did not name which reading to act on. A question can hold several readings of its evidence, and acting on the wrong one is worse than being asked which you meant."
  },
  VERSION_ACT_NO_SUCH_VERSION: {
    check: "C-25.23",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "This question holds no reading by that name. Readings are named so a member can ask for one by name, and a name nobody wrote is refused rather than matched to whatever is nearest."
  },
  /* REC-46's ONE predicate, at the ONE transition site. §4: THE AI HOLDS NO OP
     THAT ACCEPTS. A machine may compose an account of the evidence and propose
     it; deciding what the record stands on is a named member's act, and this is
     the refusal that says so for all six. */
  MACHINE_CANNOT_MOVE_VERSION: {
    check: "C-25.24",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "Deciding what to do with a reading of the evidence is a named member's call, and this request came from an automated credential. A machine may put a reading forward and may never settle it. Sign in as a member."
  },
  VERSION_ILLEGAL_TRANSITION: {
    check: "C-25.25",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "That is not a move this reading can make from where it stands. A reading a member has already accepted is corrected by turning it down or by putting it back under consideration, never by returning it to something nobody had acted on."
  },
  VERSION_NO_REASON: {
    check: "C-25.26",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "Setting a reading aside or turning it down carries the reason in the member's own words. The record of what was turned down is the instrument that makes a pattern of turning things down visible at all, and it is worth nothing without the reason."
  },
  /* A REASON THAT IS PRESENT AND UNWRITABLE IS NOT A MISSING REASON, and until
     2026-08-09 this plane said it was.
     PL-2 shipped both conditions under `VERSION_NO_REASON`, so a member who
     typed a reason over the length bound, or one carrying a double quote — the
     restricted frontmatter grammar has no escapes, so `he said "the budget is
     fixed"` cannot be stored — was answered with C-25.26's translation:
     *"…it is worth nothing without the reason."* Told to someone who gave one.
     WORSE ON THE THREE ACTS THAT NEED NO REASON AT ALL. The grammar arm runs
     unconditionally on whatever `reason` arrived, while the missing-reason arm
     runs only for `considering` and `rejected`. So a member ACCEPTING a reading
     with a quoted note, or HIDING one, or making one CURRENT, was told that
     setting a reading aside carries a reason — a sentence about an act they did
     not perform, refusing an act that requires no reason whatsoever.
     THE DISTINCTION IS NOT NEW HERE AND THAT IS THE POINT. This plane already
     splits absent from malformed everywhere else it asks for authored prose —
     `NO_REASON` against `BAD_REASON`, twelve sites against eight in
     `store.mjs` (#moveAction, #divide, #ground and their siblings). PL-2 did not
     invent a worse rule; it collapsed a distinction the rest of the plane keeps.
     The DEC-49 layer is exactly where that collapse becomes visible to a member,
     because a surface may RENDER a refusal and may never compute one (DEC-8), so
     the canned translation IS what the member reads.
     WHY A NEW CODE RATHER THAN A WIDER TRANSLATION. A translation covering both
     would have to say "missing or unwritable", which tells a member who can see
     their own typed reason on the screen that the plane cannot tell the two
     apart — and it would leave the two conditions sharing one C-number, so no
     assertion could ever name one without naming the other. C-25.32 is a dotted
     member of this family (the family owner allocates those; verified free
     across the whole tree before it was taken). */
  VERSION_REASON_MALFORMED: {
    check: "C-25.32",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "That reason was given but could not be stored as written: it is either longer than the record allows or it contains a character the record has no way to escape, such as a double quote. Nothing was changed. Shorten it, or say it without the quotation marks, and the words stay yours."
  },
  /* THE CHECK PL-1 RECORDED RATHER THAN HALF-BUILT. A version leg naming THIS
     inquiry is a fact about one document and C-25.14 refuses it there. A leg
     naming an inquiry that TRANSITIVELY rests on this one is a fact about the
     stored graph, and it becomes a defect at exactly one moment: when a member
     accepts the version and its legs become what the answer rests on. Wired to
     `#basisCyclePath`, the walk `promote` already runs — never a second one. */
  VERSION_BASIS_CYCLE: {
    check: "C-25.27",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "Accepting this reading would make the question rest, through a chain of other questions, on itself. The answer would then be its own support, which is a circle rather than a case, and the chain that closes it is named above."
  },
  VERSION_NOT_ACCEPTED: {
    check: "C-25.28",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "A project can only stand on a reading its members have accepted, and this one has not been accepted. Exploring an unsettled reading is done by calculating over it, which moves nobody's stance."
  },
  VERSION_CURRENT_NO_PROJECT: {
    check: "C-25.29",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "Standing on a reading is something a PROJECT does, so this request has to name which project. A question can be shared by several teams, and one team's decision must never quietly move another team's."
  },
  VERSION_CURRENT_UNRELATED: {
    check: "C-25.30",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "That project does not draw on this question, so it has no stance here to move. Add the question to the project first, and then choose what the project stands on."
  },
  VERSION_ACT_UNWRITABLE: {
    check: "C-25.31",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "This question's own file could not be rewritten in place, so nothing was changed. Acting on a reading edits the record the reading lives in, and a half-written record is worse than an unchanged one."
  },
  /* D-271 — DEC-32 RULE 4's ANTI-GAMING KEYSTONE, ENACTED AT THE ONE ACT THAT
     CASHES IT IN.
     THE NUMBER BETWEEN C-25.31 AND THIS ROW IS DELIBERATELY SKIPPED, and it is
     NOT SPELLED HERE ON PURPOSE — it is held by a concurrent unmerged item (PL-2's
     verification pass), which measured it free when it looked, and stepping over
     an id somebody holds is cheaper than the collision seven items paid for in one
     day. **Writing the numeral in this comment ALLOCATED IT AS A CHECK**:
     `scripts/coverage.mjs` builds the catalogue with
     `checksSrc.matchAll(/C-\d+\.\d+/g)` over the RAW source of this file, comments
     included, so a number named in prose becomes a check `--strict` then demands
     an assertion for. Measured at this item: the catalogue read 225 where the
     rows are 224, and `--strict` EXITED 1 naming a check nobody had written.
     Same class as the census that graded a file by a token in its comments, in a
     second instrument and this one GATED — delegated with the receipt rather than
     fixed here, because the harvest regex is not this item's span.
     THE TRANSLATION REUSES THE RECORD'S EXISTING MEMBER-FACING PHRASE — "would
     carry the answer on its own", already the wording in BASIS_VERSION_CHECKS —
     rather than authoring a third spelling of it. DEC-32 clause 1 and D-226 ban
     the analyst's vocabulary from any member-facing string, and a second sentence
     saying the same thing differently is the drift D-226 is about. */
  VERSION_AFFIRMATION_INCOMPLETE: {
    check: "C-25.33",
    where: "src/store.mjs #moveVersionState, reached from the six version acts",
    translation: "Accepting this reading claims that each of the parts it rests on would carry the answer on its own. That is a claim only a named member can make, and it is made part by part rather than assumed from silence, so every part has to be named before this reading becomes what the record stands on."
  },
  /* CASE-3 — DEC-72 CLAUSE 3 AT THE READING DOOR. Bob: "Once published, the act
     of changing the findings (or any claims of any of the findings) results in
     the changed version becoming a new version." A published case pins each
     member by the hash its members signed, so the claims underneath that hash
     cannot move without the case becoming a statement about the present.
     NO NEW FAMILY, DELIBERATELY: C-22's own header charges a new `*_CHECKS`
     family as a floor in `civicos-ui/check-refusal-codes.mjs` that buys slack
     for everybody else's walk, and this refusal belongs to the six version acts
     whose family already exists. C-25.32's row records the same choice.
     REACHED BY FOUR OF THE SIX ACTS and not all six — `hide` and `current` are
     the two `VERSION_ACT_TO` maps to null, and the reasoning for leaving them
     outside is at the refusal site rather than restated here.
     THE TRANSLATION NAMES THE ROUTE OUT rather than only the wall: a member told
     only "no" learns nothing about reopening, and DEC-12 built reopening for
     exactly this. D-226 governs the wording — no "compose", no "derive". */
  PUBLISHED_CANNOT_MOVE_VERSION: {
    check: "C-25.34",
    where: "src/store.mjs #moveVersionState, reached from the four acts that move a state",
    translation: "This question has been published, and the case it went out in froze it as it stood. Changing which reading of the evidence it stands on now would leave the published version saying something the question no longer says. Pick it back up first, make the change, and publish that as a new edition \u2014 the published one keeps its own signature and goes on answering."
  }
};
var VERSION_RELATIONSHIPS = ["and", "or"];
var VERSION_NAME_RE = /^[a-z0-9][a-z0-9 ._-]{0,63}$/i;
function basisVersionFindings(fm, findings) {
  const rows = fm?.basis_versions;
  const legRows = Array.isArray(fm?.basis_version_legs) ? fm.basis_version_legs : [];
  const groundRows = Array.isArray(fm?.basis_version_grounds) ? fm.basis_version_grounds : [];
  const push = (key, message, repairs) => {
    const row = BASIS_VERSION_CHECKS[key];
    findings.push(f(row.check, "error", message, repairs, key));
  };
  const pushSuggest = (key, message, repairs) => {
    const row = SUGGEST_CHECKS[key];
    findings.push(f(row.check, "error", message, repairs, key));
  };
  if (rows === void 0 || rows === null) {
    for (let i = 0; i < legRows.length; i++)
      push("VERSION_ORPHAN_ROW", `basis_version_legs[${i}] names version '${String(legRows[i]?.version).slice(0, 48)}' and there is no basis_versions[] block`);
    for (let i = 0; i < groundRows.length; i++)
      push("VERSION_ORPHAN_ROW", `basis_version_grounds[${i}] names version '${String(groundRows[i]?.version).slice(0, 48)}' and there is no basis_versions[] block`);
    return;
  }
  if (!Array.isArray(rows)) {
    push("VERSION_ORPHAN_ROW", "basis_versions is not an array");
    return;
  }
  const byName = /* @__PURE__ */ new Map();
  for (let i = 0; i < rows.length; i++) {
    const v = rows[i];
    if (!v || typeof v !== "object" || Array.isArray(v)) {
      push("VERSION_ORPHAN_ROW", `basis_versions[${i}] is not an object`);
      continue;
    }
    const name = typeof v.name === "string" ? v.name.trim() : "";
    if (!name || !VERSION_NAME_RE.test(name)) {
      push("VERSION_NAME_NOT_UNIQUE", `basis_versions[${i}].name '${String(v.name).slice(0, 60)}' is not a version name: 1 to 64 characters of letters, digits, spaces, '-', '_' and '.', naming this account of the evidence so a member can ask for it by name`);
      continue;
    }
    if (byName.has(name)) {
      push(
        "VERSION_NAME_NOT_UNIQUE",
        `basis_versions[${i}] names '${name}', which basis_versions[${byName.get(name)}] already names: a version name is unique WITHIN ITS INQUIRY (global uniqueness would make naming absurd), and derived_from reads by name`,
        ["rename this version", "or, if this is an edit of the other, derive it: give it its own name and derived_from the original"]
      );
      continue;
    }
    byName.set(name, i);
    if (typeof v.description !== "string" || v.description.trim().length < 12) {
      push(
        "VERSION_NO_DESCRIPTION",
        `basis_versions[${i}] ('${name}') carries no description: every version carries a textual description of the composition, held to a commit message's standard \u2014 what changed and why \u2014 because it is what survives a conversation that was deliberately not kept`,
        ["describe what this reading of the evidence is and why it differs from the others"]
      );
    }
    if (!VERSION_STATES.includes(v.state)) {
      push("VERSION_STATE_UNKNOWN", `basis_versions[${i}] ('${name}') is in state '${String(v.state).slice(0, 40)}': a version is one of ${VERSION_STATES.join(", ")}`);
    }
    if (v.kind !== void 0 && v.kind !== null && v.kind !== "" && !Object.prototype.hasOwnProperty.call(SUGGEST_KINDS, String(v.kind).trim())) {
      pushSuggest(
        "VERSION_KIND_UNKNOWN",
        `basis_versions[${i}] ('${name}').kind is '${String(v.kind).slice(0, 40)}': a suggestion is one of ${Object.keys(SUGGEST_KINDS).join(", ")} (section 9), and the set is closed so that a run reporting an empty search is distinguishable from a run that reported nothing`,
        ["name one of the five kinds", "or leave kind out entirely \u2014 a version a member composed is not a suggestion of any kind"]
      );
    }
    if (v.hidden !== void 0 && v.hidden !== null && typeof v.hidden !== "boolean") {
      push("VERSION_HIDDEN_NOT_BOOLEAN", `basis_versions[${i}] ('${name}').hidden is '${String(v.hidden).slice(0, 40)}': hiding a version is a boolean, because hiding it is ALL it does \u2014 the version stays in the record and stays queryable (DEC-29(b), D-214), so there is no third value for this field to hold`);
    }
    if (versionNeedsReason(v.state)) {
      const why = typeof v.state_reason === "string" ? v.state_reason.trim() : "";
      const by = typeof v.state_by === "string" ? v.state_by.trim() : "";
      if (why.length < 8 || !by || isMachineIdentity(by))
        push(
          "VERSION_DISPOSITION_UNATTRIBUTED",
          `basis_versions[${i}] ('${name}') is in state '${v.state}' and carries state_by '${String(v.state_by).slice(0, 40)}' with state_reason '${why.slice(0, 40)}': ${VERSION_REASON_REQUIRED.join(" and ")} are the two states a member enters WITH a recorded reason (\xA76 rule 4), and the reason carries the name of the member who authored it \u2014 never a machine's, because a machine may propose an account of the evidence and may never settle one`,
          [
            "record state_by (a named member), state_at (an ISO timestamp) and state_reason on this version",
            "or leave the version suggested \u2014 a state nobody has moved it into needs no reason"
          ]
        );
      if (!ISO_TS_RE.test(String(v.state_at || "")))
        push("VERSION_DISPOSITION_UNATTRIBUTED", `basis_versions[${i}] ('${name}') is in state '${v.state}' and requires 'state_at' as an ISO timestamp (got '${String(v.state_at).slice(0, 40)}'): a decision made before a strength was seen is a different act from one made after it, and only a date lets a reader tell`);
    }
  }
  for (const [name, i] of byName) {
    const df = rows[i].derived_from;
    if (df === void 0 || df === null || df === "" || df === "null") continue;
    if (typeof df !== "string" || !byName.has(df.trim())) {
      push(
        "VERSION_DERIVED_FROM_UNKNOWN",
        `basis_versions[${i}] ('${name}') is derived_from '${String(df).slice(0, 60)}', which is not a version of this inquiry: the derivation edge is how alternatives read as a tree rather than a pile`,
        ["name a version that exists in basis_versions[]", "or set derived_from: null \u2014 a version a run composed fresh has no parent"]
      );
    }
  }
  for (const [name, i] of byName) {
    const seen = /* @__PURE__ */ new Set([name]);
    let cur = rows[i].derived_from;
    while (typeof cur === "string" && byName.has(cur.trim())) {
      const p = cur.trim();
      if (seen.has(p)) {
        push("VERSION_DERIVATION_CYCLE", `basis_versions[${i}] ('${name}') sits in a derived_from cycle through '${p}': versions form a TREE, and a tree has a root \u2014 a cycle leaves no answer to which of these came first`);
        break;
      }
      seen.add(p);
      cur = rows[byName.get(p)].derived_from;
    }
  }
  const legsOf = /* @__PURE__ */ new Map();
  for (let i = 0; i < legRows.length; i++) {
    const l = legRows[i];
    const vn = l && typeof l.version === "string" ? l.version.trim() : "";
    if (!byName.has(vn)) {
      push("VERSION_ORPHAN_ROW", `basis_version_legs[${i}] names version '${String(l?.version).slice(0, 60)}', which is not in basis_versions[]`);
      continue;
    }
    if (!legsOf.has(vn)) legsOf.set(vn, []);
    legsOf.get(vn).push([i, l]);
  }
  const partsOf = /* @__PURE__ */ new Map();
  for (const g0 of groundRows) {
    const vn0 = g0 && typeof g0.version === "string" ? g0.version.trim() : "";
    if (!byName.has(vn0)) continue;
    const l0 = typeof g0.ground === "string" ? g0.ground.trim() : "";
    if (!l0 || !GROUND_LABEL_RE.test(l0)) continue;
    if (!partsOf.has(vn0)) partsOf.set(vn0, /* @__PURE__ */ new Set());
    partsOf.get(vn0).add(l0);
  }
  const groundsOf = /* @__PURE__ */ new Map();
  for (let i = 0; i < groundRows.length; i++) {
    const g = groundRows[i];
    const vn = g && typeof g.version === "string" ? g.version.trim() : "";
    if (!byName.has(vn)) {
      push("VERSION_ORPHAN_ROW", `basis_version_grounds[${i}] names version '${String(g?.version).slice(0, 60)}', which is not in basis_versions[]`);
      continue;
    }
    const label = typeof g.ground === "string" ? g.ground.trim() : "";
    if (!label || !GROUND_LABEL_RE.test(label)) {
      push("VERSION_GROUND_UNASSERTED", `basis_version_grounds[${i}].ground '${String(g.ground).slice(0, 60)}' is not a ground label: up to 48 characters of letters, digits, spaces, '-' and '_'`);
      continue;
    }
    if (!groundsOf.has(vn)) groundsOf.set(vn, /* @__PURE__ */ new Map());
    if (groundsOf.get(vn).has(label)) {
      push("VERSION_GROUND_UNASSERTED", `basis_version_grounds[${i}] declares '${label}' a second time for version '${vn}': one ground, one assertion, one member answering for it`);
      continue;
    }
    groundsOf.get(vn).set(label, i);
    const singlePart = (partsOf.get(vn)?.size ?? 0) === 1;
    const noClaim = typeof g.asserted_by === "string" && isSufficiencyUnclaimed(g.asserted_by);
    if (noClaim && !singlePart) {
      push(
        "VERSION_GROUND_UNASSERTED",
        `basis_version_grounds[${i}] declares '${label}' one of ${partsOf.get(vn).size} separately sufficient parts of version '${vn}' and records that nobody asserted it: a reading whose strength is the STRONGEST of its parts takes that maximum over a part somebody signed for, so the explicit no-claim value is open only to a version carrying exactly ONE part, where there is no maximum to take (DEC-65)`,
        [
          "name the member asserting that this ground is independently sufficient",
          `or put every leg of version '${vn}' in ONE part \u2014 a reading nobody has asserted the structure of is read as its weakest leg`
        ]
      );
    }
    if (!noClaim && (typeof g.asserted_by !== "string" || g.asserted_by.trim() === "" || isMachineIdentity(g.asserted_by))) {
      push(
        "VERSION_GROUND_UNASSERTED",
        `basis_version_grounds[${i}].asserted_by '${String(g.asserted_by).slice(0, 40)}' is not a named member: "these legs are enough on their own" is an authored judgment that makes the finding STRONGER, so it carries the name of the member making it \u2014 never a machine's, and a machine-composed version PROPOSES the structure rather than asserting it`,
        [
          "name the member asserting that this ground is independently sufficient",
          `or, on a version carrying exactly ONE part, record '${SUFFICIENCY_UNCLAIMED}' \u2014 the record saying outright that nobody claimed it, which is not the same as a machine's name standing where a member's has to be`
        ]
      );
    }
    if (!ISO_TS_RE.test(String(g.at || ""))) {
      push("VERSION_GROUND_UNASSERTED", `basis_version_grounds[${i}] requires 'at' as an ISO timestamp (got '${String(g.at).slice(0, 40)}'): a structure authored after a strength was seen is a different act from one authored before it (DEC-32), and only a date lets a reader tell`);
    }
  }
  for (const [name, i] of byName) {
    const legs = legsOf.get(name) || [];
    const declared = groundsOf.get(name) || /* @__PURE__ */ new Map();
    const labels = /* @__PURE__ */ new Set();
    let unlabelled = 0;
    for (const [li, leg] of legs) {
      if (leadLegFindings(`basis_version_legs[${li}] (version '${name}')`, leg, findings)) continue;
      if (themeLegFindings(`basis_version_legs[${li}] (version '${name}')`, leg, findings)) continue;
      const t = leg.target;
      if (typeof t !== "string" || !BUNDLE_ID_RE.test(t)) {
        push("VERSION_LEG_NOT_CITABLE", `basis_version_legs[${li}] (version '${name}').target '${String(t).slice(0, 40)}' is not a canonical bundle id`);
      } else if (typeof fm?.id === "string" && t === fm.id) {
        push("VERSION_LEG_SELF", `basis_version_legs[${li}] (version '${name}') rests on ${t}, which is this inquiry: a question is not evidence for its own answer, in any account of it`);
      } else {
        const tt = normalizeType(OBJECT_TYPES[t.split("-")[0]]);
        if (tt !== "information" && tt !== "inquiry")
          push("VERSION_LEG_NOT_CITABLE", `basis_version_legs[${li}] (version '${name}').target '${t}' is a ${tt}: a leg rests on information or on another inquiry, nothing else (D-184)`);
      }
      if (!BASIS_ROLES.includes(leg.role))
        push("VERSION_LEG_NOT_CITABLE", `basis_version_legs[${li}] (version '${name}').role '${String(leg.role).slice(0, 40)}' is not one of: ${BASIS_ROLES.join(", ")}`);
      if (leg.grade !== void 0 && leg.grade !== null && !BASIS_GRADES.includes(leg.grade))
        push("VERSION_LEG_NOT_CITABLE", `basis_version_legs[${li}] (version '${name}').grade '${String(leg.grade).slice(0, 40)}' is not one of: ${BASIS_GRADES.join(", ")} (absent or null means undetermined, and is STATED as such)`);
      if (leg.grade_axis !== void 0 && leg.grade_axis !== null && !GRADE_AXES.includes(leg.grade_axis))
        push("VERSION_LEG_NOT_CITABLE", `basis_version_legs[${li}] (version '${name}').grade_axis '${String(leg.grade_axis).slice(0, 40)}' is not one of: ${GRADE_AXES.join(", ")}`);
      if (leg.grade_source !== void 0 && leg.grade_source !== null && !GRADE_SOURCES.includes(leg.grade_source))
        push("VERSION_LEG_NOT_CITABLE", `basis_version_legs[${li}] (version '${name}').grade_source '${String(leg.grade_source).slice(0, 40)}' is not one of: ${GRADE_SOURCES.join(", ")}`);
      checkLegExtentGrammar(
        leg,
        `basis_version_legs[${li}] (version '${name}')`,
        BASIS_VERSION_CHECKS.VERSION_LEG_NOT_CITABLE.check,
        findings
      );
      const g = typeof leg.ground === "string" ? leg.ground.trim() : "";
      if (!g) {
        unlabelled++;
        continue;
      }
      if (!GROUND_LABEL_RE.test(g)) {
        push("VERSION_GROUND_UNASSERTED", `basis_version_legs[${li}] (version '${name}').ground '${g.slice(0, 60)}' is not a ground label`);
        continue;
      }
      labels.add(g);
      if (!declared.has(g))
        push(
          "VERSION_GROUND_UNASSERTED",
          `basis_version_legs[${li}] (version '${name}') names ground '${g}', which no basis_version_grounds[] row declares: a ground that nobody asserted is independently sufficient cannot be one, and the finding must not take a maximum over a branch no member signed for`,
          [`add a basis_version_grounds[] row for version '${name}', ground '${g}', with asserted_by and at`]
        );
    }
    for (const [label, gi] of declared) {
      if (!labels.has(label))
        push("VERSION_ORPHAN_ROW", `basis_version_grounds[${gi}] declares '${label}' for version '${name}', which no leg of that version belongs to: a ground is a partition OF THE LEGS, and an empty one asserts that nothing is sufficient on its own`);
    }
    if (legs.length && unlabelled)
      push(
        "VERSION_PARTITION_INCOMPLETE",
        `version '${name}' has ${unlabelled} leg${unlabelled === 1 ? "" : "s"} with no ground while ${labels.size} ground${labels.size === 1 ? " is" : "s are"} named: a version CARRIES its ground partition, so the partition is total \u2014 a leg nobody placed sitting beside branches somebody did is a relationship the record would have to guess at, and the guess that makes a finding stronger is the one it must never make`,
        [
          "give every leg of this version a ground \u2014 a leg needed whatever else holds belongs in every ground",
          "or put every leg in one ground and say relationship: and"
        ]
      );
    const rel = typeof rows[i].relationship === "string" ? rows[i].relationship.trim().toLowerCase() : "";
    if (!VERSION_RELATIONSHIPS.includes(rel)) {
      push(
        "VERSION_NO_RELATIONSHIP",
        `basis_versions[${i}] ('${name}').relationship is '${String(rows[i].relationship).slice(0, 40)}': every version states how its legs compose \u2014 ${VERSION_RELATIONSHIPS.join(" or ")} \u2014 because a version with no relationship field re-ships the flat implicit-AND basis REC-42 corrected, and the two readings give different strengths`,
        [
          "relationship: and \u2014 every ground is necessary and the finding is no stronger than its weakest leg",
          "relationship: or \u2014 the grounds are alternatives, each claimed sufficient on its own by a named member"
        ]
      );
    } else if (labels.size) {
      const implied = labels.size > 1 ? "or" : "and";
      if (implied !== rel)
        push(
          "VERSION_RELATIONSHIP_DISAGREES",
          `basis_versions[${i}] ('${name}') states relationship '${rel}' and is grouped into ${labels.size} ground${labels.size === 1 ? "" : "s"}, which composes as '${implied}': the stated relationship is what a member affirms at the accept ceremony, so it must be the one the structure actually has \u2014 otherwise an accepter signs for a reading that is not written down`,
          [
            `state relationship: ${implied}`,
            rel === "or" ? "or split the legs into the grounds you meant to be alternatives" : "or merge the grounds into one \u2014 legs in one ground are all necessary"
          ]
        );
    }
    const parent = typeof rows[i].derived_from === "string" ? rows[i].derived_from.trim() : "";
    if (parent && byName.has(parent)) {
      const parentLabels = /* @__PURE__ */ new Set();
      for (const [, l] of legsOf.get(parent) || [])
        if (typeof l.ground === "string" && l.ground.trim()) parentLabels.add(l.ground.trim());
      const sameShape = parentLabels.size === labels.size && [...labels].every((x) => parentLabels.has(x));
      const parentRel = typeof rows[byName.get(parent)].relationship === "string" ? rows[byName.get(parent)].relationship.trim().toLowerCase() : "";
      if ((!sameShape || parentRel !== rel) && (labels.size || parentLabels.size)) {
        const by = rows[i].regroup_by;
        const note = rows[i].regroup_note;
        if (typeof by !== "string" || by.trim() === "" || isMachineIdentity(by) || !ISO_TS_RE.test(String(rows[i].regroup_at || "")) || typeof note !== "string" || note.trim().length < 8)
          push(
            "VERSION_REGROUP_UNATTRIBUTED",
            `basis_versions[${i}] ('${name}') regroups the partition it inherited from '${parent}' and carries no attributed regroup act: DEC-50 licenses no unattributed structural edit, so the version records regroup_by (a named member, never a machine), regroup_at (an ISO timestamp) and regroup_note (the reason)`,
            [
              "record regroup_by, regroup_at and regroup_note on this version",
              "or leave the partition as it was inherited \u2014 an edit that only changes the evidence is not a regroup"
            ]
          );
      }
    }
  }
}
var SUGGEST_KINDS = {
  "basis-version": "a new version of the inquiry's basis \u2014 the main output: a complete alternative composition with its legs, its branches and its description (section 6)",
  "sharpen-question": "the inquiry asks two questions that need different evidence; here they are separated (section 8). The separation is carried as the version's claim",
  "new-inquiry": "a proposition answering the question, with the first version of its basis (section 8, under section 3's basis ruling)",
  "level-empty": "we looked at this level \u2014 meaning, content, documents, or the open internet \u2014 and it is empty, with the observation-log address of the search that establishes it. Without this kind a run that honestly found nothing supportable is indistinguishable from a run that emitted nothing (SWEEP section 6), and section 15's empty-run instrument has no object to count",
  "new-edition": "evidence bearing on a PUBLISHED finding. A published case cannot be changed, so the only act available is a new edition, and it is the member's"
};
var SUGGEST_LEVELS = ["meaning", "content", "documents", "internet"];
var BOILERPLATE_FORMS = [
  "to be named",
  "tbd",
  "to be determined",
  "n/a",
  "na",
  "none",
  "null",
  "undefined",
  "placeholder",
  "todo",
  "to do",
  "tba",
  "xxx",
  "text",
  "description",
  "description here",
  "lorem ipsum",
  "sample text",
  "no description",
  "see above",
  "as above",
  "same",
  "ditto"
];
function isBoilerplate(s) {
  if (typeof s !== "string") return true;
  const v = s.trim().toLowerCase().replace(/[.!?]+$/, "").trim();
  if (v === "") return true;
  if (/^[\s.\-_*#'"`~<>[\]()]+$/.test(v)) return true;
  if (/^<[^>]*>$/.test(v)) return true;
  return BOILERPLATE_FORMS.includes(v);
}
var SUGGEST_CHECKS = {
  /* ---- the shape of the request. Refused before anything is composed. ---- */
  SUGGEST_NO_TARGET: {
    check: "C-27.1",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "That request did not say which question the suggestion is about. A reading of the evidence always belongs to one question, so it asks rather than guessing."
  },
  SUGGEST_NOT_AN_INQUIRY: {
    check: "C-27.2",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "Only a question carries readings of its evidence, and the thing named here is not a question. There is nothing under it for a suggestion to be a reading of."
  },
  SUGGEST_UNKNOWN_KIND: {
    check: "C-27.3",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "A suggestion is one of five kinds and this one names none of them. The kinds are a closed set so that a run reporting an empty search is told apart from a run that reported nothing at all, which no other field can distinguish."
  },
  SUGGEST_NO_RUN: {
    check: "C-27.4",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "Every suggestion names the piece of work that produced it, and this one named none that can be read here. What was searched, under which declared conditions, and where it stopped is what lets anyone else check a reading rather than take it on trust."
  },
  /* REC-165 (INVESTIGATIVE-SESSION.md §11 item 5, rule 1, BOB #25): A VERSION IS FORMED UNDER A LIVE RUN. The
     run is what a version is read against, and a run that has ended stopped being the conditions anything is
     formed under. Asked AFTER sight (SUGGEST_NO_RUN for a run the caller cannot see) and position
     (AI_RUN_NOT_PRINCIPAL, C-22.12, relayed from `runPrincipalGate`), so it is said only to the run's principal.
     C-27.18 is a dotted member of PL-3's family, the family owner's to allocate (`tools/mintid.mjs` C). */
  SUGGEST_RUN_NOT_RUNNING: {
    check: "C-27.18",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "The investigation this suggestion names has ended. A suggestion is read against the conditions of the investigation that produced it, and those stopped being current when it stopped, so going on means starting a new one."
  },
  /* REC-165, BOB #28 (2026-09-22, §11 item 5, "Rule 1's target"): A SUGGESTION LANDS ONLY INSIDE ITS RUN'S
     CONTEXT — the context itself, or, for a run over a project, a question that project confirmed-cites. Asked
     after sight and position, so a run the caller cannot see still answers as absent. C-27.19, the same family. */
  SUGGEST_OUTSIDE_RUN_CONTEXT: {
    check: "C-27.19",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "This suggestion is about a question the investigation was not working on. An investigation is read against its own question, or the questions its project draws on, so work on a different question starts an investigation of that question."
  },
  SUGGEST_NAME_TAKEN: {
    check: "C-27.5",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "This question already holds a reading by that name. Names are unique within one question so a member can ask for a reading by name, and a second one wearing the same name would make every later reference ambiguous."
  },
  SUGGEST_EMPTY_LEVEL_UNSTATED: {
    check: "C-27.6",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "Reporting that a level of the search is empty means saying WHICH level was searched and where the log of that search can be read. Absence at one level is not absence at the next, and an unattributed empty answer is the one shape nobody can check."
  },
  /* SEPARATE FROM SUGGEST_UNWRITABLE_DOCUMENT, and the DEC-49 GUARD IS WHAT
     FORCED THE DISTINCTION rather than a design instinct. One code was written
     for both, and arm C failed the harness naming the file, the line, the region
     and the code: a `where` names ONE span, and a code minted in two regions
     cannot have one. Reading the row again with that in hand, they ARE two
     conditions — this one is "there is no file here to read", which is a fact
     about the question and is knowable before anything is composed; the other is
     "the file is in a shape this restricted grammar cannot be extended in
     place", which is a fact about the bytes and is only knowable at the write. */
  SUGGEST_NO_DOCUMENT: {
    check: "C-27.17",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "This question has no readable file behind it, so there is nothing for a reading of its evidence to be added to. That is a fact about the question rather than about the reading, and nothing was composed."
  },
  SUGGEST_TOO_MANY_LEGS: {
    check: "C-27.7",
    where: "src/store.mjs suggestVersion > is-suggest-shape",
    translation: "This suggestion rests on more pieces of evidence than one reading may carry. The limit is published in the refusal so a caller can split the reading rather than guess at what would have fitted."
  },
  /* ---- THE SIX PRE-WRITE CHECKS (section 14b.5). Each is its own C-number and
     each is removable ON ITS OWN, which is the owed control this item carries
     (VF-1 control 6): a control that removes them all together proves only that
     the block exists. ---- */
  /* CHECK 1. D-168 is the whole reason this is not a type check: `op=cite` is
     TYPE-ONLY today, so a naive reachability check would PASS RETIRED
     INFORMATION — a leg resting on a document the record has itself retired,
     reading to every later reader as live support. */
  SUGGEST_LEG_UNREACHABLE: {
    check: "C-27.8",
    where: "src/store.mjs suggestVersion > is-suggest-checks",
    translation: "One of the pieces of evidence this reading rests on cannot be reached where it says it is: it is not in the record, it cannot be read from here, or the record has retired it. A reading resting on something retired reads to a later member as live support for the answer."
  },
  /* CHECK 2. The pair, PER AXIS, over the version's own declared structure —
     DEC-21/DEC-44 refuse a single composed number four ways, so what has to
     compute is two answers and never one. */
  SUGGEST_PAIR_DOES_NOT_COMPUTE: {
    check: "C-27.9",
    where: "src/store.mjs suggestVersion > is-suggest-checks",
    translation: "The strength of this reading does not work out over the structure it declares, on one or both of the two things strength is measured on. A reading whose arithmetic cannot be run is a reading nobody can check, and it is not put forward."
  },
  /* CHECK 3. Section 6 rule 8, Bob's own words: a background run adds its output
     as a new version ONLY IF IT DIFFERS IN SUBSTANCE from every existing one.
     Compared over PL-1's CANONICAL COMPOSITION, byte for byte, which is the same
     bytes the freeze compares — so "the same reading" means one thing here. */
  SUGGEST_NOT_DIFFERENT: {
    check: "C-27.10",
    where: "src/store.mjs suggestVersion > is-suggest-checks",
    translation: "This reading of the evidence is the same in substance as one this question already holds, so it is not put forward a second time. The reading it matches is named, and adding a duplicate would grow the review pile without adding anything to review."
  },
  /* CHECK 4. D-195, and *"the Judith Miller error with arithmetic behind it"* is
     what the sweep called an AI composing alternatives at volume. The arithmetic
     takes a MAXIMUM across independently sufficient branches, so two branches
     that trace to one upstream origin make a finding look stronger for a reason
     that is not there. Content-addressed provenance lets the plane DERIVE it. */
  SUGGEST_BRANCHES_NOT_INDEPENDENT: {
    check: "C-27.11",
    where: "src/store.mjs suggestVersion > is-suggest-checks",
    translation: "Two parts of this reading are offered as separate routes to the same answer, and the record can show they trace back to the same original material. Treating them as separate makes the answer look better supported than it is, so a machine may not put it forward that way; a member may still say they are genuinely separate, and that is their call to sign for."
  },
  /* CHECK 5. The placeholder defect at machine scale. */
  SUGGEST_BOILERPLATE: {
    check: "C-27.12",
    where: "src/store.mjs suggestVersion > is-suggest-checks",
    translation: "A field this reading has to fill in carries filler text rather than an account of anything. A required field filled to get past a check is worse than an empty one, because it reads to the next member as something somebody wrote."
  },
  /* CHECK 6. Section 4: THE AI HOLDS NO OP THAT ACCEPTS. The sole possible
     output of this endpoint is a version in state `suggested`, so anything the
     caller says about state, about hiding, about who decided and why, or about
     what a project stands on is refused rather than ignored. */
  SUGGEST_UNWRITABLE_STATE: {
    check: "C-27.13",
    where: "src/store.mjs suggestVersion > is-suggest-checks",
    translation: "This suggestion tries to arrive already decided \u2014 settled, set aside, hidden, or signed by somebody. A suggestion may only ever arrive as something put forward; deciding what to do with it is a named member's act and no automated caller can reach it."
  },
  /* THE CHECK THAT DID NOT FINISH, and it is its own condition rather than a
     verdict borrowed from one of the two checks that can hit it. `heldMatch`
     learned this the hard way and D-129 wrote it down: NOT FOUND and DID NOT
     FINISH LOOKING are different facts, and only one of them licenses a
     conclusion. Both check 3 and check 4 read row sources whose size is a
     property of the record rather than of the submission, so both publish a
     bound and both FAIL CLOSED when they reach it — a duplicate the comparison
     never got to, or a shared origin the trace never reached, would otherwise be
     a silent pass on the safe-looking side. */
  SUGGEST_COMPARISON_INCOMPLETE: {
    check: "C-27.16",
    where: "src/store.mjs suggestVersion > is-suggest-checks",
    translation: "The record holds more material behind this question than could be checked in one pass, so whether this reading is genuinely new, or genuinely made of separate parts, was not settled either way. Not finishing the check is a different fact from passing it, and this record does not let the two read the same."
  },
  /* ---- the write itself. Separate from check 6 on purpose: that one is about
     the STATE the caller asked for, this one is about the DOCUMENT. ---- */
  SUGGEST_UNWRITABLE_DOCUMENT: {
    check: "C-27.14",
    where: "src/store.mjs suggestVersion > is-suggest-write",
    translation: "This question's own file could not be extended in place, so nothing was written. Adding a reading edits the record the reading lives in, and a half-written record is worse than an unchanged one."
  },
  /* ---- the catalog's own row, fired from `basisVersionFindings` above at both
     gates. A DOCUMENT can carry a kind without ever passing through the
     endpoint — a hand-authored file, a replayed revision, a future writer — and
     none of those go through the op, which is the same two-layer reasoning
     C-25.19 records one family up. ---- */
  VERSION_KIND_UNKNOWN: {
    check: "C-27.15",
    where: "checks/bio-checks.mjs basisVersionFindings, called from checkInquiryBasis and from store.mjs promote",
    translation: "This reading says it is a kind of suggestion nobody recognises. The kinds are a closed set because what a suggestion CLAIMS to be decides how it is read, and a kind outside the set is a claim with nothing behind it."
  }
};
var EXTRACT_PROPOSE_CHECKS = {
  NO_PROPOSER: {
    check: "C-104.1",
    where: "src/store.mjs extractPropose > is-extract-run",
    translation: "This proposed reading arrived without saying who proposed it, and the record keeps nothing it cannot attribute. Nothing was proposed and no passage was marked citable."
  },
  NO_RUN: {
    check: "C-104.2",
    where: "src/store.mjs extractPropose > is-extract-run",
    translation: "A machine proposes readings only as part of an investigation a member opened, and this named none. Nothing was proposed."
  },
  NO_SUCH_RUN: {
    check: "C-104.3",
    where: "src/store.mjs extractPropose > is-extract-run",
    translation: "No investigation you can see is open under that name, so nothing was proposed. A member opens an investigation; the assistant may suggest one, and may not start it."
  },
  RUN_NOT_RUNNING: {
    check: "C-104.4",
    where: "src/store.mjs extractPropose > is-extract-door",
    translation: "The investigation this names has ended, and an ended investigation takes no new proposals: its work is read against the conditions it ran under, and those stopped when it stopped. Nothing was proposed."
  },
  NOT_AN_EXTRACT_RUN: {
    check: "C-104.5",
    where: "src/store.mjs extractPropose > is-extract-door",
    translation: "This investigation was not opened to read documents for what they name, so it cannot propose readings. What an investigation may do is set when it is opened and never widened by its work. Nothing was proposed."
  },
  NO_MINTS_BOUND: {
    check: "C-104.6",
    where: "src/store.mjs extractPropose > is-extract-door",
    translation: "This investigation was opened with no limit on how many passages it may mark citable, and without a limit it may mark none. The member who opens an investigation sets that limit. Nothing was proposed."
  },
  MINTS_BOUND_REACHED: {
    check: "C-104.7",
    where: "src/store.mjs extractPropose > is-extract-door",
    translation: "This investigation has already marked as many passages citable as it was allowed to, so it proposes nothing more and ends. Nothing was proposed."
  },
  NO_PROPOSALS: {
    check: "C-104.8",
    where: "src/store.mjs extractPropose > is-extract-door",
    translation: "This named no readings to propose. A look that found nothing is recorded in the investigation's log of what was looked at, where it says which kind of absence it was, and not here. Nothing was proposed."
  },
  NOT_A_DOCUMENT: {
    check: "C-104.9",
    where: "src/store.mjs extractPropose > is-extract-document",
    translation: "That is not a captured document. A question, a project or an action has no pages or text of its own, so there is nothing in it to read or to point into. Nothing was changed."
  },
  NO_BYTES_HELD: {
    check: "C-104.10",
    where: "src/store.mjs extractPropose > is-extract-document",
    translation: "The record holds no captured copy of that document, so there is no text in it to read or to point into. That is a fact about what has been captured, never about what the document says. Nothing was changed."
  },
  MINTS_BOUND_WOULD_EXCEED: {
    check: "C-104.11",
    where: "src/store.mjs extractPropose > is-extract-whole-batch",
    translation: "This batch would mark more passages citable than the investigation has left of its limit, so the whole batch was refused rather than cut to fit: a trimmed batch would drop proposals the sender believes were filed. Nothing was proposed. Send fewer, or ask the member who opened the investigation."
  },
  /* K163 (T6): op=extractproposals' unscoped read. run-productions mints this code of its own in place of the
     store's `NO_SCOPE`, whose other site (a published case's authored scope) is a different condition. Minted
     nowhere yet: run-productions writes it when it moves `extractProposals` (T6-7) and marks the region. */
  EXTRACT_NO_SCOPE: {
    check: "C-104.12",
    where: "src/store.mjs extractProposals > is-extract-scope",
    translation: "This list of proposed readings names neither an investigation nor a document, so nothing was listed. A list of every proposal in the record would be a scan nobody can act on; name the one you mean."
  }
};
var BIAS_CHECKS = {
  /* D-468 — THE MACHINE IS ENFORCED AT THE WRITE PATH, AND IT WAS NOT.
     `BIO_Declared_Bias_v0_1.md` §"Bias bundles and adoption" gives bias sets
     bundle governance — *"append-only history, member-authored transitions,
     convergent promotion"* — and the STATES comment beside `bias` states the
     edge that matters in its own words: *"NO EDGE OUT OF `adopted` EXCEPT
     `retired`, and that is deliberate. An adopted set is PINNED (DEC-54 (d))
     and a published case names the version it was held to; a set that could
     slide back to draft in place would make 'the lens this case was produced
     under' unresolvable after the fact."*
     THAT SENTENCE DESCRIBED A CONSTRAINT NOTHING ENFORCED. `op=promote` writes
     `meta.current_state` into the bundles row and consulted no edge table for
     ANY type, so a bias set standing at `adopted` accepted a revision naming
     `proposed` and moved backwards — measured by REC-187's worker (its F4) and
     by `d84-case-manifest.test.mjs` §4, which drove the move and read a new
     head back. A mechanism believed on the strength of its EXISTENCE rather
     than its behaviour is this repository's most-met defect, and this is one.
     WHY IT IS THE RECORD'S PROBLEM AND NOT A TIDINESS ONE: the manifest a
     published case carries names the ADOPTED revision (REC-187), and
     `op=biasadopt` pins the head of a set standing at `proposed` or `adopted`.
     With the backwards move available, an adopted set could be returned to
     `proposed` and re-adopted onto those bytes — which lifts the lens a case
     was published under while the case still names it. Closing the edge closes
     that, which is why construct 7's own residue sentence goes with it.
     ITS `where` NAMES `store.mjs` RATHER THAN THE CATALOGUE, like its
     `BIAS_REFUSED` sibling and for the same reason: that is where it FIRES, and
     naming the site is what puts the code inside DEC-49's governed set. The
     span is a REGION and not the function — `promote` both validates and
     writes, which the note on `BIAS_REFUSED` below says is the one shape a
     whole-function `where` may never claim. */
  BIAS_ILLEGAL_TRANSITION: {
    check: "C-26.12",
    where: "src/promotion/index.mjs #promote > bias-state-edge, reached from op=promote",
    translation: "That is not a move this bias set can make from where it stands. A set is written, then offered, then adopted \u2014 and once it is adopted the only move left is to retire it, because a case published under it names the revision it was held to and a set that could slide backwards would make that unresolvable after the fact. To change an adopted set, write the amendment AS the adopted set \u2014 a new revision re-pins the lens \u2014 or retire it and adopt a successor. Nothing was written."
  }
};
var CAPTURE_PURPOSES = ["investigate", "acquire"];
var CAPTURE_UA_MODES = ["civicos", "member-browser"];
function userAgentIsLegible(ua) {
  if (typeof ua !== "string" || ua.trim() === "") return false;
  return /\(\+https?:\/\/[^\s)]+/.test(ua);
}
var CIVICOS_CONTACT_URL = "https://github.com/believeinoakland/bio";
function civicosUserAgent(version, instance, purpose) {
  return `CivicOS/${version || "0.0.0"} (+${CIVICOS_CONTACT_URL}; instance ${instance || "unnamed"}; ${purpose})`;
}
var CAPTURE_REQUEST_CHECKS = {
  /* ---- THE DOOR. Refused at the request, before any row exists. These are
     SHAPE rules and NOT conduct: conduct is enforced once, at the drain. ---- */
  CAPTURE_REQUEST_NO_RUN: {
    check: "C-28.1",
    where: "src/store.mjs captureRequest > is-capture-request",
    translation: "This request did not name the piece of work asking for it, or named one that is not running here. Every fetch this instance makes on its own is traceable to a session somebody opened, because that opening is what authorises it."
  },
  CAPTURE_REQUEST_NOT_PUBLIC: {
    check: "C-28.2",
    where: "src/store.mjs captureRequest > is-capture-request",
    translation: "What was asked for is not a public web address. What an investigation session may reach is what anybody could reach by typing it into a browser, so an address that is not public on its face is not asked for at all."
  },
  CAPTURE_REQUEST_NOT_AN_INQUIRY: {
    check: "C-28.3",
    where: "src/store.mjs captureRequest > is-capture-request",
    translation: "A capture is requested under a question, and the thing named here is not one. The question is what the request is accountable to, and a fetch belonging to nothing is a fetch nobody can later account for."
  },
  /* THE SPINE, AT THE DOOR. Section 4: *"capturing a document (with provenance
     preserved) is something the daemon does (sometimes at the suggestion of an
     AI)"* — so the requester holds no capture write at all and never touches the
     provenance chain, which is the foundation the trust model rests on. A
     request arriving WITH bytes, a sha or a provenance hop is a caller trying to
     be the fetcher, and it is refused by name rather than having its fields
     quietly dropped: a caller told nothing learns nothing. */
  CAPTURE_REQUEST_CARRIES_A_CAPTURE: {
    check: "C-28.4",
    where: "src/store.mjs captureRequest > is-capture-request",
    translation: "A request asks for a document; it never brings one. The fetch is performed by this instance itself so that where the bytes came from is something the record established rather than something it was told, and a provenance chain anybody could hand us is one anybody could invent."
  },
  /* WHAT IS NOT HERE, AND WHY IT WAS REMOVED RATHER THAN KEPT FOR SYMMETRY.
     The door also refused an incomplete attribution at one point in this item's
     construction (C-28.5). DRIVING THE FAMILY EXPOSED IT AS A DEFECT: with the
     same predicate at the door and at the drain, the door's refusal makes the
     DRAIN'S unreachable, so one of the two codes could never be driven — and a
     refusal nobody can drive is a refusal nobody can prove fires, which is
     DEC-49's floor failing in the same way a control that asserts nothing does.
     Attribution is judged ONCE, at the drain, for the same reason conduct is:
     the drain is the last point before anything leaves, and a row can outlive
     the rules the door applied to it. C-28.5 is therefore UNALLOCATED. */
  /* ---- DEC-47's CONDUCT. ALL OF IT FIRES AT THE DRAIN AND NOWHERE ELSE. ---- */
  /* CONDUCT 1: legibility. */
  CAPTURE_CONDUCT_UA_ILLEGIBLE: {
    check: "C-28.6",
    where: "src/store.mjs #captureRequestConduct > is-capture-conduct",
    translation: "This instance will not fetch without saying who is asking and how to reach whoever is running it. Being refused honestly is a fact that can be recorded; being admitted by disguise is a claim that could not be defended later."
  },
  /* CONDUCT 1b: the member-browser form, which is DELEGATION and not disguise —
     but only if the member's own agent was actually RECORDED. Inventing one
     would be the fabricated-Mozilla case wearing BOB-3's clothes, so an
     unrecorded member agent is refused rather than substituted. */
  CAPTURE_CONDUCT_UA_UNRECORDED: {
    check: "C-28.7",
    where: "src/store.mjs #captureRequestConduct > is-capture-conduct",
    translation: "This request asked to fetch as the member's own browser, and the record does not hold what that browser is. Presenting an agent nobody actually used would be inventing a client rather than speaking as one, so it asks rather than guessing."
  },
  /* CONDUCT 2: the purpose token. */
  CAPTURE_CONDUCT_NO_PURPOSE: {
    check: "C-28.8",
    where: "src/store.mjs #captureRequestConduct > is-capture-conduct",
    translation: "Every request this instance makes says what it is for, so a source can tell a first capture from a routine re-check and throttle one without blocking the other. This one names a purpose that is not one of the things it could truthfully be doing."
  },
  /* CONDUCT 3: rate. */
  CAPTURE_CONDUCT_HOST_HELD: {
    check: "C-28.9",
    where: "src/store.mjs #captureRequestConduct > is-capture-conduct",
    translation: "The site this would fetch from has asked us to slow down, or has refused us recently, and we are waiting the interval it named. The request is still queued and will be made when the wait is over \u2014 nothing has been lost and nothing needs re-asking."
  },
  CAPTURE_CONDUCT_TICK_SPENT: {
    check: "C-28.10",
    where: "src/store.mjs #captureRequestConduct > is-capture-conduct",
    translation: "This round of fetching has already been to that site once. Requests are spread out rather than sent in a burst, so this one waits for the next round. It is still queued."
  },
  /* ---- THE ATTRIBUTION, composed at the drain, and its own two refusals. ---- */
  /* DEC-27(b) IS EXPLICIT THAT THE RECORD STATES BOTH — *"the assistant captured
     this, at Anna's request"* — and this design adds one distinction: the
     Claude-account principal (WHICH LEVEL of the cascade paid for the reasoning)
     and the plane-credential principal (whose scope the writes ran under) are
     DIFFERENT principals. A record naming only one of them is the defect, so the
     composer REFUSES rather than composing half an attribution, and no capture
     is performed on a request it cannot account for. */
  CAPTURE_ATTRIBUTION_ONE_PRINCIPAL: {
    check: "C-28.11",
    where: "src/store.mjs #captureRequestConduct > is-capture-conduct",
    translation: "This capture could not be recorded as belonging to anybody in particular, so it was not made. An act that names one party where two acted reads as though a person did something a machine did, or the other way round, and that is worse than a missing document."
  },
  /* THE ACT IS VISIBLY THE MACHINE'S BY CONSTRUCTION AND HAS NO CODE, which is
       the second thing driving this family corrected. REC-2's `token:<class>`
       stamp is the record's only durable trace of an unattended write, and a
       capture attributed to a person's name would be this record claiming a member
       fetched something they never touched. But the composer builds the actor from
       `MACHINE_AUTHOR_PREFIX` and a literal, so it CANNOT be a person's name: a
       refusal for that condition would be a gate for something the code cannot
       produce — the empty gate this project refuses everywhere else — and it would
       mint a code nobody could ever drive. The property is ASSERTED over the
       composer's output instead. C-28.12 is therefore UNALLOCATED.
  
       THE DRAIN IS THE SOLE FETCHER. op=acquire's capture-request arm admits a row
       in `draining` and nothing else, and `draining` is set by the drain inside
       the tick that then fetches. So a caller holding a real request id still
       cannot make the plane fetch for it. This is the AI-does-not-capture gate
       expressed as a SHAPE rather than as a class list, which is what makes it
       hold for a credential class that does not exist yet (PL-11). */
  CAPTURE_NOT_DRAINING: {
    check: "C-28.13",
    where: "src/capture/acquire.mjs acquire > is-capture-request-arm",
    translation: "Only this instance's own background worker fetches documents, and it does so from its own queue. Nothing else can ask it to fetch something right now \u2014 including the assistant that asked for the document in the first place."
  },
  /* PL-15 / D-213 — THE LEAD'S TWO DOOR REFUSALS, ADDED TO THIS FAMILY RATHER
       THAN TO A NEW ONE. They are enforced inside `is-capture-request`, which is
       THIS family's governed span, so a row anywhere else would leave two codes
       in a region whose rows do not name them and arm C would report a site it
       could not judge. SK-1's rule applies with it: a family is a FLOOR, and
       minting one for two rows on somebody else's door buys slack for everybody
       else's walk. C-28.14 and C-28.15 — C-28.12 stays UNALLOCATED (see above),
       because reusing a number this file records as deleted would make its own
       history unreadable.
  
       WHY THE DOOR AND NOT THE DRAIN. PL-4 moved attribution to the drain because
       identical predicates at both points made one of two codes undrivable. That
       reasoning does not reach these: the lead is a claim about the RECORD's own
       shape, checkable the instant it arrives and never again — the drain has no
       second opinion about whether a bundle is a question — so checking it at the
       door refuses the row before it is stored rather than after it was fetched
       for. Nothing downstream re-checks it, so neither code is shadowed. */
  CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY: {
    check: "C-28.14",
    where: "src/store.mjs captureRequest > is-capture-request",
    translation: "This says the document bears on another question, but what it names is not a question. The whole point of noting a lead is that somebody working that question will be told about it, and there is nobody to tell if it does not name one."
  },
  CAPTURE_REQUEST_LEAD_IS_THE_TARGET: {
    check: "C-28.15",
    where: "src/store.mjs captureRequest > is-capture-request",
    translation: "This names the same question twice \u2014 the one being worked, and the one the document supposedly bears on. Evidence for the question you are already working is just evidence for it, and flagging it as belonging somewhere else would put a note in front of you saying a document you just asked for is about something other than what you asked."
  },
  /* D-491 / IC-276 — THE RENDER FLAG AT THE DOOR, AND IT IS C-83.1's ARGUMENT
       ONE LAYER UP. op=acquire refuses a `render` that is present and not `true`
       rather than reading it as absent, because a `render: "yes"` answered with the
       plain capture files the served shell as the content — the one outcome the
       whole C-83 family exists to prevent. The same value arriving at THIS door is
       the same defect with a delay on it, and worse in one respect: the row
       outlives the call, so the drain fetches under a flag nobody can see was
       dropped and the request reads afterwards as one that never asked.
  
       IN THIS FAMILY AND NOT IN C-83, on PL-15's precedent (its two lead rows) and
       for PL-15's reason: it is enforced inside `is-capture-request`, which is THIS
       family's governed span, so a row filed under C-83 would leave a code in a
       region whose rows do not name it and arm C would report a site it could not
       judge. C-28.16 — C-28.5 and C-28.12 stay UNALLOCATED, because reusing a
       number this file records as deleted would make its own history unreadable. */
  CAPTURE_REQUEST_RENDER_MALFORMED: {
    check: "C-28.16",
    where: "src/store.mjs captureRequest > is-capture-request",
    translation: "This asked for the page as a visitor would see it in a form this instance does not recognise. It reads render: true, or nothing at all for the document as the site serves it, so a request for the rendered page is never quietly turned into a request for the page's empty frame. Nothing was queued."
  },
  /* D-584 (capture-requests R19; T6, legacy-checks) — THE DRAIN'S OWN HOLD WHEN A FETCH DOES NOT LAND.
     Every other failure of a fire (not captured, not refused by the source, not a render op=acquire could
     not do) holds the row `requested` under this code, appends a LOOKED_INDETERMINATE look that is NOT
     governed, and answers the row in `held`. The code was written to the row and catalogued nowhere, so
     `#renderHoldReason` answered it with no check and no sentence (it reads this family, so the row reaches the held row at once). It is the drain's condition, so it is
     this family's (R19: every code the module writes to a row is in C-28 or C-83). The `where` names a
     region `captureRequestDrain` does not mark yet: the drain's other outcomes are other families' codes
     read from rows, and a whole-function `where` would conscript them; marking it is capture-requests'. */
  CAPTURE_FETCH_FAILED: {
    check: "C-28.17",
    where: "src/store.mjs captureRequestDrain > is-capture-fetch-failed",
    translation: "This instance tried to fetch the document and the fetch did not land, so nothing was captured. That says nothing about the document or the site beyond this one attempt, and it is recorded as a look that could not tell. The request is still queued and is tried again on a later round, until it expires."
  },
  /* K109 (3), capture-requests R42 (T6, legacy-checks) — THE RETRY'S ONE REFUSAL. `captureRequestRetry`
     (op=capturerequestretry) returns a request to the queue only when it was refused for the SOURCE's reason
     (R40) and its target is one the caller can see; every other request is refused by this code and nothing
     is written. The code is minted nowhere yet: capture-requests builds R42 in T6 (T6-8), in its own module,
     and the `where` names that site, as a region on this family's REC-71 rule (a region its job marks). The sentence claims
     nothing about which state the request is in, because an invisible target answers alike. */
  CAPTURE_REQUEST_NOT_RETRYABLE: {
    check: "C-28.18",
    where: "src/capture-requests/index.mjs captureRequestRetry > is-capture-request-retry",
    translation: "This request cannot be asked again. Only a request the source itself turned away, under a question you can see, goes back into the queue; a request that is still waiting, was captured, has expired, or was refused for any other reason does not. Nothing was changed."
  }
};
var AI_CREDENTIAL_CHECKS = {
  /* ---- THE MINT. A MEMBER ACT, AND WHAT THE RECORD MUST SAY. ---- */
  /* D-199 (3), and it is the determination with the sharpest consequence: *"If
       an agent can request a broader token, the scoping is theatre."* This rides
       REC-46's ONE machine-identity predicate, which means it fires for
       `token:ai` without this site knowing that class exists — the same
       generalisation D-199 (5) claims for the MACHINE_CANNOT_* family, arriving
       at the one act that could undo all of them.
  
       IT IS DRIVEN FROM BOTH SIDES, and the second side is the one that matters:
       a member may legitimately author a scope naming op=aicredentialmint (a
       member CAN reach it, so the floor admits it), and the agent holding that
       credential is STILL refused here. The credential layer and the identity
       layer are independent, and neither absorbs the other. */
  AI_CREDENTIAL_MINT_NOT_A_MEMBER: {
    check: "C-29.1",
    where: "src/membership/index.mjs aiCredentialMint > is-ai-credential-mint",
    translation: "Only a named person signed in to this instance can create an agent credential. Deciding what an automated worker is allowed to reach is a judgement somebody has to be accountable for, so an automated worker cannot make it \u2014 not even about itself."
  },
  /* D-199 (4) / DEC-55 det 4. An organisation-scoped key acts for the group with
     nobody individual behind it; a member-scoped key is attributable to that
     member. Both are legitimate and they carry DIFFERENT accountability, so an
     act must say which. The principal is not a label: it is the VIEWER this
     credential's reads compile under, so an unstated principal is also a
     credential nobody can decide what to show. */
  AI_CREDENTIAL_PRINCIPAL_UNSTATED: {
    check: "C-29.2",
    where: "src/membership/index.mjs aiCredentialMint > is-ai-credential-mint",
    translation: "An agent credential has to say who stands behind it: the organisation as a whole, or one named member. The two carry different accountability and they see different things, so the record will not hold one that says neither."
  },
  /* THE IDENTITY IS WHAT ACTS CITE, so rebinding it would rewrite history from
     the side nobody watches: every act already attributed to that name would
     silently belong to whatever secret was bound most recently. Refused rather
     than upserted. */
  AI_CREDENTIAL_IDENTITY_TAKEN: {
    check: "C-29.3",
    where: "src/membership/index.mjs aiCredentialMint > is-ai-credential-mint",
    translation: "That name already belongs to an agent credential on this instance. Acts in the record cite the name, so binding it to something new would quietly change who did work that has already been done. Retire the old one or choose another name."
  },
  /* ---- REVOKING. ALSO A MEMBER ACT, FOR A DIFFERENT REASON. ---- */
  /* Narrowing rather than widening, so D-199 (3)'s own argument does not reach
     it — an agent revoking itself is not an agent requesting more. It is a
     member act anyway, and the reason is the record rather than the risk: the
     row carries `revoked_by`, and a machine name there would say the group
     withdrew an authority when nobody in the group decided anything. */
  AI_CREDENTIAL_REVOKE_NOT_A_MEMBER: {
    check: "C-29.4",
    where: "src/membership/index.mjs aiCredentialRevoke > is-ai-credential-revoke",
    translation: "Withdrawing an agent credential is recorded against the person who withdrew it, so a named member has to be the one doing it. An automated caller has no name to put there and the record would then show a decision nobody made."
  },
  /* A member who believes they revoked something and did not is worse off than
     one who was told plainly. */
  AI_CREDENTIAL_UNKNOWN: {
    check: "C-29.5",
    where: "src/membership/index.mjs aiCredentialRevoke > is-ai-credential-revoke",
    translation: "There is no agent credential by that name on this instance, so nothing was withdrawn. Being told that plainly matters more than it looks: believing you have taken an authority away when you have not is the worse of the two outcomes."
  },
  /* ---- THE GATE. WHAT A DECLARED SCOPE ADMITS, ON EVERY CALL. ---- */
  /* D-199 (1)'s shape, reused from `scopeFor`: CLASS plus SCOPE, enforced at the
     gate BY REFUSING. It is one code because it answers one question — is this
     op within what the record declared for this credential — and the two ways
     of failing it (outside the member-reach floor, or not among the declared
     writes) are the same answer to the caller. */
  AI_BEYOND_TASK_SCOPE: {
    check: "C-29.6",
    where: "src/index.mjs aiTaskScope > is-ai-task-scope",
    translation: "This credential was created for a particular piece of work and that is not part of it. What an agent may do here is written down on the record by the member who set it up, so widening it means somebody amending that entry, not the agent asking again."
  },
  AI_CREDENTIAL_REVOKED: {
    check: "C-29.7",
    where: "src/index.mjs aiTaskScope > is-ai-task-scope",
    translation: "This agent credential has been withdrawn by a member of the group, so it no longer reaches anything here. The record keeps the entry and the date rather than deleting it, so what it did while it was live remains readable."
  },
  /* ---- THE DECLARATION. WHAT MAY BE AUTHORED IN THE FIRST PLACE. ---- */
  /* A scope naming something that is not an op is not a narrower scope: it is a
     sentence in the record that nothing enforces, which is precisely what
     D-199 (2) moved the scope out of a settings row to avoid. */
  AI_SCOPE_UNKNOWN_OP: {
    check: "C-29.8",
    where: "src/index.mjs aiScopeDeclaration > is-ai-scope-declaration",
    translation: "The list of things this credential may change names something this instance does not do. An entry nothing recognises would sit in the record looking like a permission while meaning nothing, so it is refused rather than stored."
  },
  /* THE SHAPE FENCE, AND PL-4'S DELEGATED CONSTRAINT DISCHARGED. Not a list of
     forbidden ops — a property of the op: can a MEMBER reach it. The unattended
     verbs carry no member class by construction, so they are outside every
     scope anybody can write, today and after the next op lands. */
  AI_SCOPE_BEYOND_MEMBER_REACH: {
    check: "C-29.9",
    where: "src/index.mjs aiScopeDeclaration > is-ai-scope-declaration",
    translation: "An agent may only be given things a member of this group could hand to it, and this is not one of them. The background worker's own jobs, and the acts a member performs only from their own signed-in session, are outside what anybody can hand to an agent, so this cannot be written into a credential at all."
  },
  /* D-463 (C-29.10) — THE CONFINEMENT, JUDGED BEFORE IT ENTERS THE RECORD.
     A credential may be minted confined to the scratch namespace for its whole life, and to NOTHING ELSE.
     `bio` is refused with the rest, and that is the decision rather than an omission: `bio` is where every
     unconfined credential already lands, so a row saying "confined to bio" would be a sentence in the record
     that reads like a fence and constrains nothing — D-199 (2)'s complaint about a settings row, arriving as
     a column. The value is matched EXACTLY — nothing trimmed, nothing case-folded — on D-456's rule one layer in,
     because a Durable Object name is an exact string and folding it would be the code guessing what a member meant.
     ABSENT (the field omitted, or null) is the ONLY silence, and it is the case every caller written before this item
     is in; a PRESENT empty string is a value and is refused with the rest, because an empty `store=` is one of the
     values D-456 measured addressing the real record. */
  AI_CONFINEMENT_NOT_SCRATCH: {
    check: "C-29.10",
    where: "src/index.mjs aiConfinementDeclaration > is-ai-confinement-declaration",
    translation: "A credential can be confined to the scratch area and to nothing else, spelt exactly. Leaving the confinement out altogether makes an ordinary credential that reaches the record itself; naming the record itself is not a confinement, so it is refused rather than written down as one. Nothing was created."
  },
  /* ---- WHO A CREDENTIAL MAY ACT FOR (T4, legacy-checks, N44, 2026-09-27). ---- */
  /* Membership R29: a member-scoped credential's principal is the member who mints it. Naming another member
     would let one member hand an agent another's sight and put acts in another's name. Until this row the
     refusal carried `check: 'membership.R29'` and its own sentence. */
  AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER: {
    check: "C-29.11",
    where: "src/membership/index.mjs aiCredentialMint > is-ai-credential-mint",
    translation: "A credential that acts for one member acts for the member who creates it, and nobody else. You named another member, and nobody can authorise an agent in someone else's name: it would see what they see and its work would be recorded as theirs. Nothing was created. The member it should act for can create it themselves."
  },
  /* Membership R62 (Bob, 2026-09-26): an organisation-scoped credential acts for the whole group, with nobody
     individual behind it, so only an active administrator (the founder included) mints one. Until this row the
     refusal carried `check: 'membership.R62'` and its own sentence. */
  AI_CREDENTIAL_ORG_NOT_ADMIN: {
    check: "C-29.12",
    where: "src/membership/index.mjs aiCredentialMint > is-ai-credential-mint",
    translation: "A credential that acts for the whole group is created by one of its administrators, and the account asking is not an active administrator here. Nothing was created. You can create a credential that acts for you alone, or ask an administrator to create this one."
  }
};
var VERSION_STRENGTH_CHECKS = {
  VERSION_STRENGTH_NO_INQUIRY: {
    check: "C-30.1",
    where: "src/store.mjs versionStrength > is-version-strength",
    translation: "This asks how strongly one question is answered, and no question was named. There is no default question here and there must not be one."
  },
  VERSION_STRENGTH_NOT_AN_INQUIRY: {
    check: "C-30.2",
    where: "src/store.mjs versionStrength > is-version-strength",
    translation: "That is not a question, so there is nothing here to say how strongly it is answered. Only a question carries readings of the evidence, and only a reading has a strength."
  },
  /* THE FOUR BEATS' FIRST BEAT, one altitude down from PL-2's acts and for the
     same reason: there is no "the latest reading" and no default. A strength
     computed over a reading the caller did not mean is a number about the wrong
     thing, which is worse than being asked which was meant. */
  VERSION_STRENGTH_NO_VERSION: {
    check: "C-30.3",
    where: "src/store.mjs versionStrength > is-version-strength",
    translation: "Say which reading of the evidence to measure, or say which project is asking so that the reading it stands on can be used. There is no default reading, because a strength reported for a reading nobody meant is a number about something else."
  },
  VERSION_STRENGTH_NO_SUCH_VERSION: {
    check: "C-30.4",
    where: "src/store.mjs versionStrength > is-version-strength",
    translation: "No reading by that name belongs to this question, or this project has not said which reading it stands on. An empty answer here would say the question rests on nothing when the truth is that nobody has pointed at anything yet."
  },
  VERSION_STRENGTH_UNKNOWN_STATE: {
    check: "C-30.5",
    where: "src/store.mjs versionStrength > is-version-strength",
    translation: "One of the words used to say which readings to count is not one this record knows. The set is closed on purpose: a strength that quietly counted readings nobody recognises would be a number no reader could check."
  },
  /* §6 rule 6, and it is the mechanism rather than a nicety: *"Exploring an
     unaccepted version is done by CALCULATING OVER IT, never by making it
     current."* So this is not a dead end — it names the widening that turns the
     request into an honest WHAT-IF, and the what-if answer then carries its own
     state-set line (DEC-40) wherever it renders. */
  VERSION_STRENGTH_STATE_EXCLUDED: {
    check: "C-30.6",
    where: "src/store.mjs versionStrength > is-version-strength",
    translation: "Nobody has adopted that reading, so it is not what this record answers with. You can still see what it would come to \u2014 ask for it as a what-if by saying which kinds of reading to count \u2014 and the answer will say on its face that that is what it is."
  },
  /* DEC-44 determination 1, at the version altitude: *"A case does NOT compose a
     super-conclusion over them and MUST NOT derive a single case-level
     strength — that would be R2's forbidden composition at a new altitude, and
     it is exactly the 'one letter' the project has refused four times."* The
     same refusal one altitude DOWN, because the temptation is identical and the
     harm is identical: two measurements over two populations reported as one
     number is the record claiming something neither population supports. */
  VERSION_STRENGTH_COMPOSED: {
    check: "C-30.7",
    where: "src/store.mjs #refusePairComposed > is-pair-composed",
    translation: "This answer tried to report one overall figure for a question, and there is no such figure. How well the documents were captured and how firmly they connect to the subject are two separate measurements over two separate things, and averaging them or picking one would state something neither of them says."
  },
  /* DEC-40 determination 2, and its own negative control: *"a filtered
     rendering states its filter IN DEC-34's per-page header … An unfiltered
     rendering says so too, or absence of the line becomes the ambiguity."* §12
     transplants it verbatim: *"A what-if pair carries its state-set line
     wherever it renders."* So EVERY answer carries the line, including the
     default one — an answer with no line is the shape a reader cannot tell from
     the record's own. */
  VERSION_STRENGTH_UNFILTERED: {
    check: "C-30.8",
    where: "src/store.mjs #refusePairComposed > is-pair-composed",
    translation: "This answer did not say which readings it counted, and a strength separated from that is a misreading waiting to happen. Every answer here says on its face whether it is the record's own or a view somebody constructed."
  },
  VERSION_STRENGTH_TOO_MANY_STATES: {
    check: "C-30.9",
    where: "src/store.mjs versionStrength > is-version-strength",
    translation: "More kinds of reading were named than this record has. The bound is said here rather than applied quietly, so nothing is dropped without you being told."
  }
};
var VERSION_STRENGTH_DEFAULT_STATES = VERSION_STATES.filter((s) => s === "accepted");
var VERSION_STRENGTH_INERT_SOURCES = ["hunch"];
var PARTITION_INDEPENDENCE_CHECKS = {
  PARTITION_INDEPENDENCE_NO_INQUIRY: {
    check: "C-71.1",
    where: "src/store.mjs partitionIndependence > is-partition-independence",
    translation: "This asks whether the groups of reasons behind one question share a source, and no question was named. There is no default question here and there must not be one."
  },
  PARTITION_INDEPENDENCE_NOT_AN_INQUIRY: {
    check: "C-71.2",
    where: "src/store.mjs partitionIndependence > is-partition-independence",
    translation: "That is not a question you can read here, so it has no reasons to group. Only a question rests on reasons, and a question you may not see answers exactly as one that does not exist."
  },
  PARTITION_INDEPENDENCE_UNREADABLE: {
    check: "C-71.3",
    where: "src/store.mjs partitionIndependence > is-partition-independence",
    translation: "The grouping of reasons could not be read. Send it as a list of groups, each group a list of the positions of the reasons in it, or as groups each carrying a name and its positions. Every group needs at least one reason and a name no other group has."
  },
  PARTITION_INDEPENDENCE_UNKNOWN_LEG: {
    check: "C-71.4",
    where: "src/store.mjs partitionIndependence > is-partition-independence",
    translation: "The grouping names a reason this question does not have. It was not dropped quietly, because an answer about groups the question does not hold would be an answer about something else."
  },
  PARTITION_INDEPENDENCE_LEG_TWICE: {
    check: "C-71.5",
    where: "src/store.mjs partitionIndependence > is-partition-independence",
    translation: "One reason was put in two groups. Each reason belongs to exactly one group, because a reason shared by two groups would make them share a source by construction."
  },
  PARTITION_INDEPENDENCE_NOT_TOTAL: {
    check: "C-71.6",
    where: "src/store.mjs partitionIndependence > is-partition-independence",
    translation: "Some of this question's reasons are in no group. A grouping covers every reason, as a written reading does, so that what is checked here is what would be written."
  },
  PARTITION_INDEPENDENCE_TOO_MANY_LEGS: {
    check: "C-71.7",
    where: "src/store.mjs partitionIndependence > is-partition-independence",
    translation: "This question rests on more reasons than a written reading may hold, so a grouping of all of them could not be written and is not checked. The bound is said here rather than applied quietly."
  },
  /* REC-192 — THE VERSION ARM (BOB #31, 2026-09-23 22:22Z): the same read over a WRITTEN reading's
     groups, answering independence on its own with no strength beside it. Two refusals the arm owes,
     numbered on in C-71 because they are refusals of the same op and neither is a statement about a
     strength. */
  PARTITION_INDEPENDENCE_TWO_SUBJECTS: {
    check: "C-71.8",
    where: "src/store.mjs partitionIndependence > is-partition-independence",
    translation: "Both a written reading and a proposed grouping were named. This answers for one of them at a time, and which one was meant is not something to guess, so name only the one you want."
  },
  PARTITION_INDEPENDENCE_NO_SUCH_VERSION: {
    check: "C-71.9",
    where: "src/store.mjs partitionIndependence > is-partition-independence",
    translation: "No reading by that name belongs to this question, so there are no written groups of it to check. Nothing was substituted for it."
  }
};
var QUEUE_MINT_CHECKS = {
  NO_CLASS: {
    check: "C-31.1",
    where: "src/store.mjs queueFeed > is-queue-mint",
    translation: "Your list could not be assembled: something on it does not say what sort of item it is, and showing it without that would put an entry in front of you that nobody can act on. Nothing has been lost and nothing about the record has changed \u2014 this is a fault on our side, not something you did."
  },
  NO_SUCH_KIND: {
    check: "C-31.2",
    where: "src/store.mjs queueFeed > is-queue-mint",
    translation: "Your list could not be assembled: something on it is described in a word this record does not know, so there is no sentence to show you in place of it. Rather than showing you a line you could not read, the list refuses whole. Nothing has been lost."
  },
  KIND_MISCLASSED: {
    check: "C-31.3",
    where: "src/store.mjs queueFeed > is-queue-mint",
    translation: "Your list could not be assembled: something on it is filed one way and described another, and the difference decides whether setting it aside is a private choice of yours or a change to the record everyone shares. That is not a difference to guess at, so the list refuses until it is right. Nothing has been lost."
  }
};
var CASE_DERIVATION_CHECKS = {
  CASE_IDENTITY_AMBIGUOUS: {
    check: "C-44.1",
    where: "src/store.mjs publishCase > case-identity-derivation",
    translation: "This publication did not say which case it is. The findings you are publishing already serve more than one published case, and a finding is allowed to serve many \u2014 so the record cannot work out from them alone whether you are publishing a further edition of one of those cases or starting a new case that rests on the same work. Nothing has been published and nothing has changed. Say which case this is, or say that it is a new one, and publish again."
  },
  /* UI-81 (2026-09-23) — D-309's OTHER HALF, the READ, given its row. `op=publishedcase` handed a
     finding id that several cases pin refuses and names every case (IC-74), because each case is
     its own artifact and serving one would choose for the reader. That refusal reached the
     published case page — the one page a stranger reads — with no code and no translation, and no
     row here named it, so the DEC-49 guard could not see it (R1 misses it; R2 misses it because
     the surface keys on the refusal's `cases[]`, not on the code). A ROW IN THIS FAMILY rather than
     a new one: the condition is clause 6's ambiguity at the read where C-44.1 is the same
     ambiguity at the act, and `#resolveOneCase` already sits in the file whose `refusal` helper
     reads this table. The translation says what a reader of either surface can do — choose — and
     names no screen, because every caller of `#resolveOneCase` answers with it. */
  FINDING_IN_SEVERAL_CASES: {
    check: "C-44.2",
    where: "src/store.mjs #resolveOneCase > is-finding-in-several-cases",
    translation: "This finding is part of more than one published case file. Each case file is its own publication, with its own scope and its own statement of what it covers, so the record will not pick one of them for you. Nothing is wrong with the finding. Choose the case file you mean, and it opens with this finding in it."
  },
  /* REC-217 (BIO_Publication_v0_1.md §3 rule 13; BOB #33, 2026-09-24 19:14Z) — THE PUBLISHER NAMES THE DRAFT
     A CASE WAS PREPARED IN, and at that act the readings taken through it bind to the case it produced. The
     three conditions under which that link would be FALSE are refused here, in this family because each is
     about the case identity the act publishes: the same question C-44.1 asks of the members, asked of the
     draft. Each is its own row and its own region, for three different mistakes. Asked before a case id is
     minted, so a refusal spends none — and none of them can refuse a publication that names no draft. */
  PUBLISH_DRAFT_NOT_FOUND: {
    check: "C-44.3",
    where: "src/store.mjs publishCase > is-publish-draft-found",
    translation: "The draft named for this case is not a draft of this project that you can open. Nothing was published. Name the draft this case was prepared in, or publish without naming one; readings of a draft that was not named are then counted in the case file and not attributed to anyone."
  },
  PUBLISH_DRAFT_NOT_THIS_CASE: {
    check: "C-44.4",
    where: "src/store.mjs publishCase > is-publish-draft-this-case",
    translation: "The draft named here was prepared for a different case than the one being published, so its readers did not read this one. Nothing was published. Publish the case that draft is for, or name the draft of this case."
  },
  PUBLISH_DRAFT_ALREADY_BOUND: {
    check: "C-44.5",
    where: "src/store.mjs publishCase > is-publish-draft-bound",
    translation: "That draft has already been named as the draft of another published case, and the people who read it are listed there. One draft becomes one case, so it cannot be named for this one too. Nothing was published."
  }
};
var MACHINE_FENCE_CHECKS = {
  MACHINE_CANNOT_RELEASE: {
    check: "C-32.1",
    where: "src/store.mjs release > is-machine-release",
    translation: "Moving documents from collected to verified is a decision a named person makes and signs. The credential that asked here is an automated one, so it can gather the batch and lay out the review, and cannot be the one who says the batch is good. Sign in and release it yourself."
  },
  MACHINE_CANNOT_CONCLUDE: {
    check: "C-32.2",
    where: "src/store.mjs conclude > is-machine-conclude",
    translation: "A conclusion is a person saying what they think the record shows, and it carries their name for as long as the record lasts. The credential that asked here is an automated one: it may raise the question, gather what bears on it and draft the answer, and it may never be the one who answers. Sign in to conclude."
  },
  MACHINE_CANNOT_MOVE_ACTION: {
    check: "C-32.3",
    where: "src/store.mjs actionMove > is-machine-move-action",
    translation: "Advancing an action is a decision to reach outside this system, or to declare that reaching out is finished, and either way somebody is answerable for it. The credential that asked here is an automated one, so it can prepare the action and cannot move it. Sign in to move it yourself."
  },
  /* REC-189 — D-182's ruling on the write side (BOB #21: *"Only a member's authored act sets 1, 2 or 3"*).
     Refuses a CHANGE of tier by a machine, never a presence: carrying a member's tier forward unchanged is
     not refused, nor is leaving undetermined a tier no member ever set. BOB #32 (2026-09-24 01:44Z): dropping a
     member's tier to undetermined IS a change and is refused. REC-214 (BOB #33, 2026-09-24): the same code refuses a
     machine at `op=actionrisktier`, the member's revision act, so the condition lives in ONE helper both `promote`'s
     action block and the act ask (`#machineRiskTierRefusal`) — one code, one site, one region. */
  MACHINE_CANNOT_SET_RISK_TIER: {
    check: "C-32.19",
    where: "src/store.mjs #machineRiskTierRefusal > is-machine-set-risk-tier",
    translation: "A risk tier tells whoever reads this action whether it is safe to file, needs caution, or must not be filed without a lawyer, and somebody has to be answerable for that judgement. The credential that asked here is an automated one: it can carry forward the tier a member set, and where no member has set one it can leave the tier unstated, but it cannot set, change or remove one. Sign in to state the tier yourself."
  },
  MACHINE_CANNOT_CORRESPOND: {
    check: "C-32.4",
    where: "src/store.mjs actionCorrespond > is-machine-correspond",
    translation: "Recording that an exchange happened is testimony: on this path the entry itself is the evidence, so somebody has to be standing behind it. The credential that asked here is an automated one \u2014 it can capture bytes, and it cannot swear that a conversation took place. Sign in to record it."
  },
  MACHINE_CANNOT_REOPEN: {
    check: "C-32.5",
    where: "src/promotion/index.mjs #reopen > is-machine-reopen",
    translation: "Reopening overturns something the group decided to set down, and that judgement belongs to a person who will be named beside it. The credential that asked here is an automated one: it may raise a question and work one, and may not undo the group's own disposition. Sign in to reopen it."
  },
  MACHINE_CANNOT_PUBLISH: {
    check: "C-32.6",
    where: "src/store.mjs publishCase > is-machine-publish",
    translation: "Publishing puts the group's name on a case, together with an assertion that it is complete and a stated position on putting it to the people it concerns. Both of those are declared judgements, and the credential that asked here is an automated one. It can assemble the case; sign in to publish it."
  },
  MACHINE_CANNOT_DIVIDE: {
    check: "C-32.7",
    where: "src/store.mjs divide > is-machine-divide",
    translation: "Dividing a question says the group asked one thing when it was really asking two, and that is a judgement about the group's own work. The credential that asked here is an automated one: it may raise questions and gather what they rest on, and may not restructure them. Sign in to divide it."
  },
  MACHINE_CANNOT_GROUND: {
    check: "C-32.8",
    where: "src/store.mjs groundInquiry > is-machine-ground",
    translation: "Grounding says some of the reasons behind an answer are strong enough to carry it on their own, and it is the one act here that makes a finding stronger rather than weaker. That decision needs a person behind it, and the credential that asked is an automated one. Sign in to ground it."
  },
  MACHINE_CANNOT_DECLARE: {
    check: "C-32.9",
    where: "src/store.mjs strengthBarSet > is-machine-strength-bar",
    translation: "How much evidence this group requires of itself is the group's own declaration about the standard it works to, and everything filed afterwards is measured against it. An automated credential cannot set that bar for the people it works for. Sign in to change it."
  },
  MACHINE_CANNOT_FORWARD: {
    check: "C-32.10",
    where: "src/store.mjs taskForward > is-machine-forward",
    translation: "Forwarding hands an obligation to a named person, and deciding who is better placed to answer it is a judgement about people rather than about records. The credential that asked here is an automated one: it can surface the work and route it as it arrives, and cannot re-address it. Sign in to forward it."
  },
  MACHINE_CANNOT_RESOLVE: {
    check: "C-32.11",
    where: "src/store.mjs taskResolve > is-machine-resolve",
    translation: "Closing an obligation says the thing the record asked for has been answered, and somebody has to be willing to say that. The credential that asked here is an automated one \u2014 it may surface the work and prepare what it needs, and closing work that is nobody's is still closing it. Sign in to resolve it."
  },
  /* REC-123 / IC-132 — THE TWO RATIFICATIONS, and they are the first of this
     family that live in the CONTROL PLANE rather than at the top of a store
     method, because both handlers do their work there: the signature is
     verified and the gate run in `index.mjs`, and the store is handed only the
     verified attestor. TRACED BY DRIVING, 2026-09-18: an `ai` credential whose
     member-authored scope named op=ratify / op=caseratify, carrying a registered
     member's VALID signature, PUBLISHED the finding and COMMITTED the case, and
     the record named the MEMBER as having done it. The scope check was the only
     thing in front of either, and a broader scope passes a scope check.
     `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 4: *"No machine credential
     performs the attested act"*; both acts sit at the `attested` rung.
     WHAT THESE TWO DO NOT REFUSE: the operator's own ENV-BINDING credentials
     (ADMIN/MEMBER/PROBE tokens). REC-123 left them open as a provisional and
     raised D-421; BOB #14 DECIDED it (REFUSE), and C-32.14 / C-32.15 below are
     that ruling, landed by REC-125. */
  MACHINE_CANNOT_RATIFY: {
    check: "C-32.12",
    where: "src/index.mjs fetch > is-machine-ratify-bundle",
    translation: "Ratifying puts a finding into the published record under a member's signature, and the member whose key signed it has to be the one who does it. The credential that asked here is an assistant's: it can prepare the finding and lay out what will be signed, and it cannot carry the signature in for you. Sign in and ratify it yourself."
  },
  MACHINE_CANNOT_RATIFY_CASE: {
    check: "C-32.13",
    where: "src/index.mjs fetch > is-machine-ratify-case",
    translation: "Ratifying a case commits the group's own assertions about it \u2014 its scope, its completeness, its position on the people it concerns \u2014 under a member's signature. The credential that asked here is an assistant's: it can assemble the case document, and it cannot be the one who commits it. Sign in and ratify it yourself."
  },
  /* REC-125 / IC-137 — D-421, DECIDED by BOB #14 applying
     `BIO_Assistant_and_AI_Roles_v0_1.md` §3 rule 4 (no new doctrine): an
     ATTESTED act is performed ONLY by a named member's OWN AUTHENTICATED
     SESSION, and the operator's bearer tokens may no longer deliver one, even
     carrying a member's valid signature. *The signature proves who AUTHORISED;
     the credential that delivers it decides WHEN the record changes, and the
     record names the actor.* ONE ROW PER ACT, like C-32.12 / C-32.13, and ONE
     ROW FOR EVERY BEARER CLASS rather than one per class: the refusal is keyed
     on how the caller ARRIVED (not through a session), so the class is named in
     the answer's `tokenClass` and the rule does not need a row per token. */
  OPERATOR_TOKEN_CANNOT_RATIFY: {
    check: "C-32.14",
    where: "src/index.mjs fetch > is-operator-ratify-bundle",
    translation: "Ratifying puts a finding into the published record under a member's signature, and it is delivered by that member signed in as themselves. The credential that asked here is one of the operator's access tokens for this copy, not a person: a valid signature does not change that, because the credential that carries it in decides when the record changes. Sign in as the member whose key signed it and ratify it there."
  },
  OPERATOR_TOKEN_CANNOT_RATIFY_CASE: {
    check: "C-32.15",
    where: "src/index.mjs fetch > is-operator-ratify-case",
    translation: "Ratifying a case commits the group's own assertions about it under a member's signature, and it is delivered by that member signed in as themselves. The credential that asked here is one of the operator's access tokens for this copy, not a person, and a valid signature does not change that. Sign in as the member whose key signed it and ratify it there."
  },
  /* REC-126 / DEC-31 / IC-145 — THE REVIEW COPY's three authoring acts (draft,
     grant, revoke) share ONE fence, because they are one doctrine: the act is
     ADDRESSED and ATTRIBUTED (`BIO_Publication_v0_1.md` §6A.2), so the record
     must name the person who handed the group's draft to somebody. One row, one
     region: the three acts enter through `reviewAct`, and the fence stands at that
     door before any act is chosen. */
  /* D-136 / C-32.17 — D-421's RULING APPLIED TO SECTION 4 GOVERNANCE, and it is
     the same doctrine rather than a new one: *the credential that delivers an
     act decides when the record changes, and the record names the actor.* A
     §4.7 vote is C-32.14's shape with the member's signature replaced by a
     roster position — an act the record attributes to a named administrator,
     which a bearer token held in the hosting account cannot be.
     ONE ROW FOR THE THREE OPS, on C-32.16's precedent rather than C-32.14's: the
     endorsement, the removal vote and the capability edit enter through ONE
     region and are refused by ONE predicate, so three rows would be one rule with
     three homes. The op is named in the answer, so a caller still learns which
     verb was refused, and the class is named in `tokenClass`, so an operator
     learns which of its credentials asked.
     THE PREDICATE IS `!viaSession` — how the caller ARRIVED, not which token it
     held — so it covers ADMIN, MEMBER and PROBE today and any binding added
     tomorrow, and no class list appears at the site to go stale. */
  OPERATOR_TOKEN_CANNOT_GOVERN: {
    check: "C-32.17",
    where: "src/index.mjs fetch > is-operator-governance-act",
    translation: "Endorsing an administrator, voting to remove one, and setting what a member may do are things the group holds a named administrator answerable for, and the record names who did them. The credential that asked here is one of the operator's access tokens for this copy, not a person: it holds no place on the roster, so it cannot be one of the administrators whose agreement the rule requires. Sign in as that administrator and do it from there."
  },
  MACHINE_CANNOT_REVIEW: {
    check: "C-32.16",
    where: "src/store.mjs reviewAct > is-machine-review",
    translation: "Handing a draft of the group's case to a named person, or withdrawing it, is an act somebody in the group answers for, and the record names who did it. The credential that asked here is an automated one: it can help prepare the draft, and it cannot address it to anyone. Sign in to do this yourself."
  },
  /* D-149 (BIO_Case_Making_v0_1.md §2): stating which laws govern a records request is a member's authored
     act — the design's words are *set by a member's authored act*, and a machine may PROPOSE a list, labelled
     as machine work, and never set it. No proposal is built; the fence is the half that is. */
  MACHINE_CANNOT_SET_LAWS: {
    check: "C-32.18",
    where: "src/store.mjs actionLaws > is-machine-set-laws",
    translation: "Which laws govern a request is a statement a member makes and is named beside: the laws follow the agency asked, and somebody has to have read them. The credential that asked here is an automated one, so it can gather what the agency is and cannot state which laws apply. Sign in to set the list yourself."
  }
};
var GOVERNING_LAW_CHECKS = {
  GOVERNING_LAWS_REWRITTEN: {
    check: "C-73.1",
    where: "src/store.mjs #promoteChecks > is-promote-governing-laws, reached from op=promote through the step legacy-store registers with promotion (K31)",
    translation: "The laws that govern a request are set by a member with the governing-laws act, and a document created or revised any other way carries them unchanged. This write would have set or changed them without that act, so nothing was written. Use the governing-laws act to state them."
  },
  NO_LAWS: {
    check: "C-73.2",
    where: "src/store.mjs #lawEntries > is-laws-entry",
    translation: "The act names at least one law, each by its citation and its level. With none named there is nothing to set: a request whose laws nobody has stated reads as undetermined on its own, and setting an empty list would not make that any truer."
  },
  BAD_LAW_LEVEL: {
    check: "C-73.3",
    where: "src/store.mjs #lawEntries > is-laws-entry",
    translation: "Each law is stated at one of three levels: federal, state or local. One entry named a level outside those three, so nothing was written."
  },
  BAD_CITATION: {
    check: "C-73.4",
    where: "src/store.mjs #lawEntries > is-laws-entry",
    translation: "Each law is named by its citation \u2014 a short reference such as a code section \u2014 and one entry was empty, too long, repeated, or held a quotation mark, backslash or line break, which this record cannot store. Nothing was written."
  },
  TOO_MANY_LAWS: {
    check: "C-73.5",
    where: "src/store.mjs #lawEntries > is-laws-entry",
    translation: "One act states at most twelve governing laws. A request governed at the federal, state and local levels names a handful; a longer list is more likely a list of every law that might apply than of the ones that do. Nothing was written."
  }
};
var ACT_SHAPE_CHECKS = {
  /* REC-205, 2026-09-24 — A CLASS THAT IS NOT DISPOSED AT ALL, and it is a MEMBER-FACING refusal from
     the day the queue lets a selection carry one. D-126's per-item weight means a member ticks items and
     applies one handler; NOTIFICATIONS.md's "MARKED AS HANDLED" section says the scope differs by class,
     so a CONDITION is muted and an OBLIGATION is resolved and neither is DISPOSED. Before this row the act
     answered NO_SUCH_PROGRESSION and told the member to define a progression — true of the key it read and
     useless about what they clicked, the same fault IC-60's bridge exists to have fixed one door over.
     THE TRANSLATION NAMES THE ACT THAT DOES REACH IT rather than only refusing, because the member is
     holding a selection and the next move is the whole question. It does NOT say the item is gone: under
     the per-item weight the rest of the selection was handled and this one stays in the list, which is the
     fact a member re-reading their queue needs. Numbered inside this family (C-33.x) on REC-211's own
     precedent two rows down — C-33.42 and C-33.43 were added to it without minting a top-level C. */
  CLASS_NOT_DISPOSED: {
    check: "C-33.44",
    where: "src/store.mjs proposeDispose > is-dispose-class",
    translation: "This is not something the record disposes of. Deferring and dismissing are decisions about a FINDING \u2014 the record's own question \u2014 and this item is a different kind of thing: a CONDITION is a fact about our machinery that you silence for yourself, and an OBLIGATION is work a named person owes and leaves every list when it is resolved. Nothing about it was changed, and it is still in your list. The answer names the act that does reach it."
  },
  NO_CONCLUSION: {
    check: "C-33.1",
    where: "src/store.mjs conclude > is-conclude-answer",
    translation: "Concluding records what was concluded, and this one says nothing. If the honest answer is that the group could not settle it, write that down \u2014 an answer of undetermined is a real answer here and is stated rather than left blank."
  },
  /* REC-117 / BOB 2026-09-17: the translation now NAMES THE DOOR, and that is
     the surfacing half of the ruling rather than a nicety. A member who is
     refused here and told only that a falsifier is required is a member under
     pressure to invent one; a member told they may instead state that none can
     honestly be given has been offered the honest way through. */
  NO_FALSIFIER: {
    check: "C-33.2",
    where: "src/store.mjs conclude > is-conclude-answer",
    translation: "A conclusion has to say what would overturn it. Without that nobody can check the finding, including the person who wrote it, and a finding that cannot be checked claims more than the evidence behind it can carry. If no falsifier can honestly be named, say so rather than inventing one: the record will carry that no falsifier was stated, in your name and with the date, wherever this finding appears."
  },
  /* REC-117. The one refusal the override ADDS, and it exists because the
     alternative is the plane choosing which of a member's two statements it
     meant. No caller written before this item can reach it: the parameter it
     turns on did not exist. */
  FALSIFIER_AND_NONE_STATED: {
    check: "C-33.33",
    where: "src/store.mjs conclude > is-conclude-answer",
    translation: "You have written a falsifier and also asked to record that none could be stated. Those are two different things to say about this finding, and choosing between them is not something the record should do on your behalf. Keep the falsifier, or clear it and record the absence."
  },
  /* REC-124 / INVESTIGATIVE-SESSION.md §7.1 (BOB #15, 2026-09-18): a conclusion
     ADOPTS the claim of the reading a project stands on, and the claim is what
     was concluded. NO_CLAIM is every door to "there is nothing to adopt" — the
     project stands on no reading, the reading is not accepted or states no
     claim, or commentary arrives with no adopted claim to comment beyond. */
  /* REC-136 / §7.1 item 6: a conclusion drawn with NO project names the
     reading it adopts, and an unnamed reading is this condition too. The
     translation was project-only and now covers both relationships. */
  NO_CLAIM: {
    check: "C-33.34",
    where: "src/store.mjs conclude > is-conclude-claim",
    translation: "Concluding adopts the claim of an accepted reading, and that claim is what the group concluded. There is no claim to adopt here. For a project, the reading is the one the project stands on; with no project, name the reading. State the claim on a reading first \u2014 a claim nothing supports yet is allowed \u2014 and conclude again."
  },
  /* REC-124 / §7.1 item 2. A free conclusion text beside a project could say
     what no claim said; the member is told the door rather than having their
     words quietly relabelled as commentary. */
  CONCLUSION_IS_THE_CLAIM: {
    check: "C-33.35",
    where: "src/store.mjs conclude > is-conclude-answer",
    translation: "When a project concludes, the claim it adopts is the conclusion, so a separate conclusion text is not accepted \u2014 it could say something no claim said. Anything you want to add beyond the claim can be sent as commentary: it is recorded in your name and is never treated as evidence."
  },
  /* REC-124. The project's own frontmatter could not take the conclusion row
     in place, so nothing was written — the make-current writer's condition, on
     the conclusion row. */
  /* REC-136 / §7.1 item 7. A project withdraws only a conclusion it currently
     stands on; a second withdrawal, or one with nothing concluded, would add
     an entry that records nothing. */
  NOTHING_TO_WITHDRAW: {
    check: "C-33.37",
    where: "src/store.mjs #withdrawConclusion > is-withdraw-stance",
    translation: "There is no conclusion here to withdraw: this project has not concluded this question, or has already withdrawn its latest conclusion. Everything it concluded and withdrew before stays in the record."
  },
  UNSPLICEABLE_CONCLUSIONS: {
    check: "C-33.36",
    where: "src/store.mjs #setProjectConclusion > is-conclusion-row",
    translation: "The project's own record is laid out in a way this act cannot add a conclusion to without rewriting parts of it nobody asked to change, so nothing was recorded. The project's file needs its list of conclusions tidied before it can conclude."
  },
  NO_RESOLUTION: {
    check: "C-33.3",
    where: "src/store.mjs actionMove > is-move-resolution",
    translation: "An action that has ended says how it ended, and this move does not. The record keeps a closed set of endings so that a reader later can tell what actually happened rather than only that something stopped."
  },
  RESOLUTION_WITHOUT_RESOLVING: {
    check: "C-33.4",
    where: "src/store.mjs actionMove > is-move-resolution",
    translation: "This move says how the action ended while moving it somewhere that is not an ending. Recording an outcome the action has not reached would put a result in the record before there is one."
  },
  BAD_DIRECTION: {
    check: "C-33.5",
    where: "src/store.mjs actionCorrespond > is-correspond-entry",
    translation: "Every entry in this ledger says which way the exchange went, and this one names something the record does not use. A reply that never came is recorded as a non-response with the date it was due, rather than left out."
  },
  BAD_DATE: {
    check: "C-33.6",
    where: "src/store.mjs actionCorrespond > is-correspond-entry",
    translation: "Every entry here carries a calendar date written as four digits, two digits and two digits. A non-response is dated too \u2014 by when the reply was due \u2014 because an undated exchange cannot be placed against anything else in the record."
  },
  CAPTURE_AND_TESTIMONY: {
    check: "C-33.7",
    where: "src/store.mjs actionCorrespond > is-correspond-entry",
    translation: "An entry holds either the captured material or a named person who can speak to the exchange, and never both. A summary sitting beside the real thing is what a reader would quote instead of the thing the group can actually defend."
  },
  NEITHER_CAPTURE_NOR_TESTIMONY: {
    check: "C-33.8",
    where: "src/store.mjs actionCorrespond > is-correspond-entry",
    translation: "This entry offers neither captured material nor a named person behind it, so there is no way for anyone to check that the exchange happened. An assertion with nothing to check it against is the one thing this ledger will not hold."
  },
  UNREGISTERED_ARTIFACT: {
    check: "C-33.9",
    where: "src/store.mjs actionCorrespond > is-correspond-artifact",
    translation: "The material named here is not held in this store, so the entry would point at something nobody can open. Capture it first, or record a named person who can speak to the exchange instead \u2014 those are the two honest ways to hold one."
  },
  NO_ACKNOWLEDGMENT: {
    check: "C-33.10",
    where: "src/store.mjs release > is-release-account",
    translation: "Releasing a batch at once records your explicit acknowledgment that the batch is of a piece and that you weighed the risk of doing them together. Without it the record shows only that a button was pressed."
  },
  NO_MITIGATION: {
    check: "C-33.11",
    where: "src/store.mjs release > is-release-account",
    translation: "Releasing a batch at once records what you actually did to check it \u2014 what was sampled and what was verified. A concrete note can be audited by somebody later; silence cannot be audited at all."
  },
  ENTRY_REQUIREMENTS: {
    check: "C-33.12",
    where: "src/store.mjs release > is-release-entry",
    translation: "Some of these documents are missing something the verified state requires, and releasing them as they stand would produce records the catalog rejects the moment they exist. The offending documents are named so they can be fixed rather than guessed at."
  },
  NOT_INQUIRIES: {
    check: "C-33.13",
    where: "src/store.mjs dispose > is-dispose-inquiries",
    translation: "This act moves a question along, and the selection carries things that are not questions. The whole set is refused rather than quietly narrowed to the part that fits, because a set that acted on less than you selected is a set you were not shown."
  },
  NO_STATEMENT: {
    check: "C-33.14",
    where: "src/store.mjs publishCase > is-publish-statement",
    translation: "A published case has to say what it does NOT cover. A case that is silent about its own limits is claiming to cover everything, and that is the overclaim this record exists to refuse."
  },
  BAD_NOTE: {
    check: "C-33.15",
    where: "src/store.mjs cite > is-cite-note",
    translation: "A note here is at most two hundred characters and cannot contain a quotation mark, a backslash or a line break. Those characters would silently reshape the document rather than appear in it, so the note is declined instead of mangled."
  },
  NO_ROLE: {
    check: "C-33.16",
    where: "src/store.mjs cite > is-cite-role",
    translation: "A leg of a question's basis has to say what the material DOES for the answer, and this one does not say. It is never assumed: material that cuts against the case is first-class here, and guessing would put a claim about your reasoning in the record that you did not make."
  },
  BAD_ROLE: {
    check: "C-33.17",
    where: "src/store.mjs cite > is-cite-role",
    translation: "That is not one of the parts a piece of basis can play. The set is closed and is published beside the act itself, so the choices can be read rather than remembered."
  },
  ROLE_NOT_APPLICABLE: {
    check: "C-33.18",
    where: "src/store.mjs cite > is-cite-role",
    translation: "What material does for an answer is a property of a question's basis, and the thing citing here is a case. A case's citation carries no such part, so this one would be dropped rather than recorded \u2014 and a field stated in one place and honoured nowhere is how a record and the pages built from it drift apart."
  },
  SEVERED_EDGE: {
    check: "C-33.19",
    where: "src/store.mjs cite > is-cite-severed",
    translation: "Somebody already recorded a decision to cut this dependency, which is different from there never having been one. Citing it again would neither reverse that decision nor step around it, so putting the link back is a separate act that records its own reason."
  },
  /* D-168 / BOB #30, 2026-09-23 — State Rules §4.1, "A RETIRED ITEM IS NOT
     CITABLE". A sub-number of this family, as C-33.15..19 (cite's other
     regions) are; C-33.38 is REC-175's. The translation NAMES THE DOOR, the
     REC-117 rule: cite what superseded it, or re-collect the source. */
  RETIRED_NOT_CITABLE: {
    check: "C-33.39",
    where: "src/store.mjs cite > is-cite-retired",
    translation: "The group has retired this material, recording that it is superseded or no longer stands, so a citation made now would read to everyone after you as live support nobody will look at again. Cite whatever superseded it, or collect the source again as a new item and cite that. A document its publisher withdrew or changed is a different thing and can still be cited."
  },
  CAS_STALE: {
    check: "C-33.21",
    where: "src/promotion/index.mjs #promote > is-promote-cas",
    translation: "Somebody else changed this document since you last read it, so writing now would quietly discard their work. Read it again, fold your change into what is there, and write once more."
  },
  /* T4 (legacy-checks, N36), 2026-09-27: promotion R1's other half. A REVISION of a bundle the record does not
     hold, and (R20) of one the caller may not see, which answers exactly as one that does not exist. Numbered in
     this family beside CAS_STALE, R1's third answer; R1's first, EXISTS, is C-96.4. It is minted by ONE literal in
     promotion, the module-level `ABSENT` helper both of `#promote`'s answers return; that helper is not a declared
     function the guard can open, so the `where` names the region promotion is to mark around the R1 answers.
     Two sites outside promotion mint the same code with the same meaning (a bundle by that id that the caller can
     see does not exist): `src/store.mjs gateFacts` (op=ratify) and `src/index.mjs` op=monitor. The translation is
     written to be true at all three, and says nothing was changed rather than written, because the monitor reads. */
  ABSENT: {
    check: "C-33.49",
    where: "src/promotion/index.mjs #promote > is-promote-absent",
    translation: "There is no document by that id here that you can see. Either it does not exist, or it is not one you have been let into, and the answer is the same for both so that it says nothing about what you cannot see. Nothing was changed. To create a new document, create it rather than revising it."
  },
  /* REC-176 (the history law, BIO_State_Rules_Consistency_v1_5.md §2.4: "History is append-only; nothing in
     _history/ is ever modified or deleted"). `op=promote` wrote its manifest and history rows with INSERT OR
     REPLACE keyed (bundle_id, snap_key), so a second promotion naming a key the bundle already holds silently
     REPLACED the first promotion's rows. It now refuses that key before anything is written; a byte-identical
     re-send of the promotion that key already names answers ok and writes nothing (§2.4's own convergent rule:
     "the second detects the existing file and skips"). C-67 is minted (`node tools/mintid.mjs C`) rather than
     C-33.n, because two parallel promote items took C-33 numbers the same day. */
  SNAP_KEY_TAKEN: {
    check: "C-67.1",
    where: "src/promotion/index.mjs #promote > is-promote-snapkey",
    translation: "This write names a history entry this document already has, and it is a different write from the one recorded there. The record never rewrites its history, so nothing was written. Send it again under a new history key."
  },
  SELF_BASIS: {
    check: "C-33.22",
    where: "src/store.mjs #promoteChecks > is-basis-acyclic, reached from op=promote through the step legacy-store registers with promotion (K31)",
    translation: "A question cannot be the evidence for its own answer. This write would have it rest on itself, which reads as support and adds nothing anybody outside could check."
  },
  BASIS_CYCLE: {
    check: "C-33.23",
    where: "src/store.mjs #promoteChecks > is-basis-acyclic, reached from op=promote through the step legacy-store registers with promotion (K31)",
    translation: "This write would close a loop: the chain it would join already rests, somewhere further along, on the thing being written. The path is named so the loop can be seen rather than re-derived, and support that circles back is support that rests on nothing."
  },
  FILES_DROPPED: {
    check: "C-33.24",
    where: "src/promotion/index.mjs #promote > is-promote-files",
    translation: "This write would remove files the previous revision had, and it does not say it means to. Carry them forward, or name them for deletion on purpose \u2014 losing part of a document by omission is not something the record will do quietly."
  },
  /* REC-175 (the Mechanical Verification Law, BIO_State_Rules_Consistency_v1_5.md §8: a stored digest is of the
     stored bytes). `op=promote` wrote the caller's `sha256` for every file, and took bundle.md's as the bundle's
     head, without computing either; it now computes each inline file's digest over its UTF-8 bytes (a blob's is
     its content address) and refuses a supplied value naming another, before anything is written. */
  FILE_DIGEST_MISMATCH: {
    check: "C-33.38",
    where: "src/promotion/index.mjs #promote > is-promote-digest",
    translation: "A fingerprint sent with this write does not match the file it was sent with, so the record would have stored a fingerprint of something it does not hold. Nothing was written. Send the file again with its own fingerprint, or with none and the record will compute it."
  },
  NO_ALIAS: {
    check: "C-33.25",
    where: "src/entities/index.mjs addAlias > is-alias-named",
    translation: "Another name for something needs to actually be a name. This one is empty once the spacing and punctuation are taken off, so there would be nothing for anybody to search on later."
  },
  KIND_NOT_PERSONAL: {
    check: "C-33.27",
    where: "src/store.mjs queueMute > is-mute-class",
    translation: "Setting this aside would be a change everybody sees rather than a private choice of yours, and that is a decision the group takes together rather than one this control makes. The kinds you can quiet for yourself are listed beside the refusal."
  },
  LAST_OWNER: {
    check: "C-33.28",
    where: "src/membership/index.mjs projectOwnerRemove > is-owner-floor",
    translation: "A project always has at least one owner, so the last one cannot be removed \u2014 the result would be work nobody is answerable for. Add another owner first, or stand the project down."
  },
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
    where: "src/store.mjs aiRunOpen > is-airun-open-capability, reached from op=airunopen",
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
    where: "src/store.mjs aiRunOpen > is-airun-open-context, reached from op=airunopen",
    translation: "Nothing was run, because the request did not say what the run is for or what it belongs to. A run has to sit inside a question or a project so that the people working on that question can see it happened; one belonging to nothing would be invisible to everybody."
  },
  AI_RUN_ALREADY_OPEN: {
    check: "C-33.31",
    where: "src/store.mjs aiRunOpen > is-airun-open-already, reached from op=airunopen",
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
    where: "src/store.mjs aiRunOpen, reached from op=airunopen",
    translation: "Nothing was run, because this run was told it is a re-run of itself. A re-run says which EARLIER piece of work it repeats, and a run pointing at itself would be able to clear its own outstanding re-run. Name the earlier run, or leave the field out."
  },
  AI_RUN_RERUN_UNKNOWN: {
    check: "C-33.46",
    where: "src/store.mjs aiRunOpen, reached from op=airunopen",
    translation: "Nothing was run, because the earlier run it says it repeats is not one this record holds for you. It may never have existed, it may have been removed, or it may belong to work you have not been brought into. Check the name."
  },
  AI_RUN_RERUN_OTHER_CONTEXT: {
    check: "C-33.47",
    where: "src/store.mjs aiRunOpen, reached from op=airunopen",
    translation: "Nothing was run, because the earlier run it says it repeats belongs to a different question or project. Repeating work means asking the same question again under the lens that is in force for it \u2014 somewhere else the group's declared lens can be a different one, so the two runs would not be comparable and settling anything on that basis would be wrong."
  },
  /* ---------------------------------------------------------------------------
       D-484, 2026-09-24 — THE FIRST TWO ROWS THIS FAMILY'S OWN HEADER SAID IT
       COULD NOT HOLD, AND THEY EXIST BECAUSE THE PLANE CHANGED SHAPE RATHER THAN
       BECAUSE A SENTENCE WAS FINALLY WRITTEN.
  
       The header above states the bar and the reason: a row holds ONE `where`,
       one code may not hold two rows, and a `where` naming one of four sites
       would claim a span the code is not confined to — *"REC-71's overstatement
       wearing the other face"*. It then names the honest fix — *"the refusals
       consolidated behind one helper so there IS one site"* — and ROUTES it.
       D-484 is that routing coming back. `NO_BASIS` was minted at four sites in
       `store.mjs` and `NO_CITATION` at three; each is now minted at exactly ONE,
       inside the region named below, and every former site returns through it.
  
       So the `where` is not a narrowing of a claim this family could not support
       — it is now literally true, and `store.mjs` holds one `reason: "NO_BASIS"`
       and one `reason: "NO_CITATION"` literal to prove it (a structural pin in
       `test/d484-refusal-translation.test.mjs` asserts exactly that, because a
       second site added later would silently make this `where` a lie again).
  
       EACH TRANSLATION IS TRUE AT EVERY SITE IT NOW SERVES, which is the price of
       consolidation and is where a careless one would do harm. `NO_BASIS` covers
       concluding an inquiry that rests on nothing, partitioning a question with no
       legs, a grade-D testimony with no stated basis, and a revision of a declared
       flow that does not say why it changes — so the sentence speaks about WHAT
       THIS RESTS ON and never about legs, or documents, or flows. The per-site
       `detail` still carries the particular, unchanged.
  
       THE UNDETERMINED DOOR IS NAMED, on NO_FALSIFIER's precedent (REC-117): a
       member refused for a missing basis is a member under pressure to invent one,
       and the record would rather carry *nothing supports this yet* in the open.
       --------------------------------------------------------------------------- */
  NO_BASIS: {
    check: "C-33.40",
    where: "src/store.mjs actNoBasis > is-act-no-basis",
    translation: "This asks the record to stand behind something without saying what it rests on. Say what that is first \u2014 what the question is grounded in, what you personally observed, or why a settled thing is being changed \u2014 and the record carries it beside the claim, in your name, so a later reader can go and disagree with it. If the honest answer is that nothing supports it yet, write that down rather than inventing something: a stated absence is a real answer here, and an empty basis reads as one nobody checked."
  },
  NO_CITATION: {
    check: "C-33.41",
    where: "src/store.mjs actNoCitation > is-act-no-citation",
    translation: "A citation is the address of something somebody who was not here can go and read. Without one, what you have written can only be checked by you, and the record would be claiming more than it can show. Name where the source is published or held \u2014 if it is not public, say who holds it and how it was seen, which is still an address and is still checkable."
  },
  /* REC-186 (BOB #31, 2026-09-23 21:37Z): the last owner's request to leave. C-33.48, not the next
     free number on main, because REC-205 and REC-207's unmerged branches already hold C-33.44..46 in
     this family; the integrator renumbers if the union needs it. RENUMBERED C-33.47 -> C-33.48 by CONDUCT #22
     (2026-09-25, c22-rec186-renumber): REC-207's renumber landed C-33.46/C-33.47 on main in c21-batch28.
     T4 (legacy-checks, N44), 2026-09-27: THE SAME CHECK UNDER THE CODE ITS SITE NOW MINTS. Membership R35 (REC-224)
     raised the floor from one owner to one COMMITTED owner (an owner who has not asked to leave), and the region
     answers LAST_COMMITTED_OWNER; LAST_OWNER_CANNOT_LEAVE is minted nowhere, so this row was translating a code no
     member can meet. C-33.48 keeps its number, its site and its region. Membership R40 mints the same code at a
     second site, `projectOwnerRemove`, when a removal would leave only owners who have asked to leave; that site is
     outside every region, and the translation below is written to be true at both (the control plane's
     `dec49Decorate` attaches it at every site that mints the code). */
  LAST_COMMITTED_OWNER: {
    check: "C-33.48",
    where: "src/membership/index.mjs projectLeave > is-leave-owner-floor",
    translation: "A project always keeps at least one owner who is committed to it, and this would leave it with none: every other owner has asked to leave, or there is no other owner. Add another owner first \u2014 or stand the project down. Nothing was recorded."
  }
};
var ROUTE_MARK_CHECKS = {
  /* Marking is a NAMED ACT: a standing statement in the record with nobody's
     name on it is not a statement. WHAT THIS DOES *NOT* DO, stated so the next
     reader does not read a fence that is not here — it does not refuse a MACHINE
     principal. It refuses an act with NO principal at all. `op=provenancechain`
     draws exactly this line and no other, and inventing a stricter one here
     would be this item ruling on DEC-52's ground (REC-65) as a side effect. */
  ROUTE_MARK_NO_AUTHOR: {
    check: "C-34.1",
    where: "src/provenance/index.mjs provenanceRouteAssess > is-route-mark",
    translation: "Recording that a document's route cannot be shown is an act the record has to be able to attribute, and nothing here said who is making it. Sign in and try again."
  },
  ROUTE_MARK_NO_BUNDLE: {
    check: "C-34.2",
    where: "src/provenance/index.mjs provenanceRouteAssess > is-route-mark",
    translation: "This did not say which document to look at, so nothing was assessed."
  },
  /* Absent and invisible answer IDENTICALLY, which is REC-25's posture rather
     than this item's invention: a document the caller may not see must refuse
     exactly as one that does not exist, or the refusal becomes a read. */
  ROUTE_MARK_NO_SUCH_BUNDLE: {
    check: "C-34.3",
    where: "src/provenance/index.mjs provenanceRouteAssess > is-route-mark",
    translation: "The record holds no document by that name, so there was nothing to assess."
  },
  /* A ROUTE IS A FACT ABOUT A CAPTURED DOCUMENT. A question, a project or an
     action was never fetched from anywhere, so asking whether its route can be
     shown is a category error rather than a doubt — and answering it as
     undetermined would put a marker on every inquiry in the store, which is the
     over-strictness failure this item's third control arm exists to catch. */
  ROUTE_MARK_NOT_A_DOCUMENT: {
    check: "C-34.4",
    where: "src/provenance/index.mjs provenanceRouteAssess > is-route-mark",
    translation: "Only a captured document travelled a route to get here, and this is not one. Questions, projects and actions were written in the record rather than fetched from anywhere, so there is no route to show or to doubt."
  }
};
var TEXT_CHAIN_CHECKS = {
  /* RULE 1. The condition this family exists for. `text_source: "ocr"` is what
     a careful author writes and it is still a loss: the engine is gone, and an
     engine is what a calibration is OF (CPDF-13) and what a re-run would need. */
  TEXT_CHAIN_COLLAPSED: {
    check: "C-35.1",
    where: "src/textchain.mjs checkChain > is-text-chain-shape",
    translation: "This says the text came from a machine but not which one, or through how many hands. A scanned document can pass through a scanner, a reader and a clean-up pass before anyone sees it, and each one can change what it says \u2014 so the record keeps the whole sequence rather than a single word for it."
  },
  TEXT_CHAIN_EMPTY: {
    check: "C-35.2",
    where: "src/textchain.mjs checkChain > is-text-chain-shape",
    translation: "Nothing here says where this text came from. Text with no stated origin looks exactly like text a publisher typed, and the difference is the whole reason this record is worth trusting."
  },
  TEXT_CHAIN_STEP_SHAPE: {
    check: "C-35.3",
    where: "src/textchain.mjs checkChain > is-text-chain-shape",
    translation: "One of the steps that produced this text is not readable as a step."
  },
  TEXT_CHAIN_STEP_UNKNOWN: {
    check: "C-35.4",
    where: "src/textchain.mjs checkChain > is-text-chain-shape",
    translation: "One step in this text's history is of a kind the record does not know. It cannot tell whether that step produced the text or checked it, and those are very different things, so it will not guess."
  },
  /* Rule 1 arriving one level down: the chain is an array and one of its
     entries is still just a label. */
  TEXT_CHAIN_STEP_UNNAMED: {
    check: "C-35.5",
    where: "src/textchain.mjs checkChain > is-text-chain-shape",
    translation: "This says a machine read the text but not which machine. Two readers of the same scan disagree, and knowing which one produced a line is what lets anybody check it later."
  },
  /* RULE 2, and the translation carries the distinction the rule turns on,
     because the member who trips this will believe they improved the text —
     and they will be right about readability. */
  TEXT_CHAIN_STRENGTHENS: {
    check: "C-35.6",
    where: "src/textchain.mjs appendStep > is-text-chain-monotone",
    translation: "This step claims the text became more reliable by being processed further. Cleaning up a garbled line makes it easier to READ, not more likely to be what the page actually said \u2014 so a later step can only ever be as trustworthy as what it was given."
  },
  /* RULE 3. Note the fence is on the BASIS, not on the number: a self-reported
     0.99 and a computed 0.99 are the same bytes. */
  TEXT_CONFIDENCE_PSEUDO: {
    check: "C-35.7",
    where: "src/textchain.mjs checkConfidence > is-text-region-confidence",
    translation: "This confidence figure is the machine's own opinion of itself. A reader that measures how clearly each character resolved is saying something checkable; a model asked how sure it is will answer confidently either way, and that number cannot be used as a threshold. Where an engine reports no confidence, the record says so plainly instead."
  },
  TEXT_CONFIDENCE_SHAPE: {
    check: "C-35.8",
    where: "src/textchain.mjs checkConfidence > is-text-region-confidence",
    translation: 'The confidence on this region is not readable. Note that saying "this engine reports no confidence" is a real answer here \u2014 an absent one is not the same thing.'
  },
  /* The anchor. Without it there is no way to point a reader at the pixels, and
     an unverifiable transcription is the thing this item refuses to ship. */
  TEXT_ANCHOR_MISSING: {
    check: "C-35.9",
    where: "src/textchain.mjs checkAnchor > is-text-anchor",
    translation: "Text a machine read off an image has to say WHERE on the page it came from, so anyone can look at that part of the scan and see for themselves. Without it the reading cannot be checked against the document at all."
  },
  /* Attestation, (a): a member act, refusable to a machine credential. */
  TEXT_ATTEST_MACHINE: {
    check: "C-35.10",
    where: "src/textchain.mjs checkAttestation > is-text-attestation",
    translation: "Attesting is a person saying they compared this text against the image of the page and it matches. The credential that asked here is an automated one: it can run the reader and lay the two side by side, and it cannot be the one who says they agree. Sign in and attest it yourself."
  },
  /* Attestation, (b): scoped to what was actually checked. */
  TEXT_ATTEST_EXTENT: {
    check: "C-35.11",
    where: "src/textchain.mjs checkAttestation > is-text-attestation",
    translation: "An attestation has to say how much of the document you checked \u2014 this region, this page, or all of it. Checking one table and having that stand behind an entire scanned report is exactly what this record will not do on your behalf."
  },
  /* CPDF-13 / D-253. The calibration REFERENCE, and note carefully what this
     row does NOT refuse: a step with a `cap` and no calibration is the
     pre-CPDF-13 shape and is LEGAL — every chain written before this rule
     existed is that shape, and refusing it would be a fence tighter than its
     rule wearing the costume of caution. What is refused is a reference that is
     PRESENT AND UNREADABLE, because an unresolvable pointer is worse than an
     absent one: it looks like a binding and joins to nothing. */
  TEXT_CHAIN_CAL_REF: {
    check: "C-35.12",
    where: "src/textchain.mjs checkChain > is-text-chain-shape",
    translation: "This step points at the measurement its fidelity rests on, but the pointer is not readable as one. A measurement nobody can look up is not a measurement this record can stand behind \u2014 and a broken pointer is worse than none, because it looks like one that works."
  },
  /* CAP-10 / DEC-75 / IC-122. A step kind that declares its letter must be
     CALIBRATED (`STEP_KINDS[k].letter`) — today only `convert`, a conversion
     the serving host made before any text was read — may carry a letter only
     beside the calibration it rests on. The permitted move is UNDETERMINED
     now, raised later by a calibration row (CAP-11 measures, a row raises);
     a letter written now and lowered later is the move Bob's 5.8 forbids. */
  TEXT_CHAIN_LETTER_UNCALIBRATED: {
    check: "C-35.13",
    where: "src/textchain.mjs checkChain > is-text-chain-shape",
    translation: 'This step says how faithful a conversion of the document was, but nobody has measured that. When a site hands us its own converted copy of a file, the record cannot tell what the conversion changed until it has compared the copies \u2014 so until then it says "not yet determined" rather than giving a grade it has not earned.'
  },
  /* REC-87 / IC-127. A step kind whose letter is NEVER written on the step
     (`STEP_KINDS[k].letter === "never"`) — today only `typed`, a member typing
     a portion's text (Bob's 5.2). A person has no calibration, so the one route
     to a letter is a SECOND member's attestation; a letter on the step would be
     the typist grading their own work. */
  TEXT_CHAIN_LETTER_ON_PERSON: {
    check: "C-35.14",
    where: "src/textchain.mjs checkChain > is-text-chain-shape",
    translation: `This says how faithful a member's own typing of the page is. Nobody grades their own transcription: what a member typed stays "not yet determined" until a different member checks it against the page and says it matches.`
  }
};
var ADMISSION_CHECKS = {
  /* Absent identity, and it is the FIRST thing a stranger meets. It says what to
     do rather than what happened, because a person reading this has not yet done
     anything wrong — they have simply not said who they are. */
  NOT_AUTHENTICATED: {
    check: "C-38.1",
    where: "src/index.mjs fetch > is-admission",
    translation: "Nothing in this request said who you are. Sign in, or send a credential this instance issued, and try again."
  },
  /* WRONG CREDENTIAL, NOT INSUFFICIENT CREDENTIAL, and the difference is worth a
     sentence: this is not a rung on a ladder the caller can climb. A credential
     is issued for a purpose and this is not that purpose, so the honest advice
     is to use the right one rather than to ask for this one to be widened. */
  CLASS_FORBIDDEN: {
    check: "C-38.2",
    where: "src/index.mjs fetch > is-admission",
    translation: "The credential you sent is not one this operation accepts. Credentials here are issued for a particular purpose, and widening this one is not the way through: use the credential meant for this work."
  },
  /* The mirror of the row above, and it exists separately because the two are
       opposite facts about the caller. This one is a PERSON asking for something
       only an unattended writer does; the row above is a credential of the wrong
       kind entirely. One refusal covering both would tell neither caller anything
       they could act on — DEC-49's own argument, and PL-18's.
  
       **NARROWED 2026-09-19 BY D-270, AND THE `where` MOVED WITH THE SITE.** This
       row is a DESIGN CLAIM — it tells a person that a verb is not for people —
       and BOB #17 ruled that the plane may make it ONLY where such a decision is
       recorded. Until D-270 this one sentence answered THREE different facts and
       was FALSE for two of them: it went to five ops an administrator's own
       browser performs, and to ops whose OPS rows say in as many words that they
       are a named member's judgement. The site is now `sessionOpGate`, which
       sends this row only for an op named in `UNATTENDED_BY_DECISION`, and the
       refusal carries the citation in `recorded`, so the claim and its warrant
       travel together. The rule's home is
       `docs/architecture/BIO_Membership_Architecture_v2.md` §4 (the §4.7 block). */
  MACHINE_CREDENTIAL_REQUIRED: {
    check: "C-38.3",
    where: "src/index.mjs sessionOpGate > is-session-op-gate",
    translation: "This operation is performed by an unattended writer, not by a person at a browser. A signed-in session cannot do it; it needs a machine credential an administrator has issued. This instance holds a recorded decision to that effect and names it beside this message."
  },
  /* D-270 / BOB #17, 2026-09-19. THE SECOND OF THE SESSION GATE'S THREE
     OUTCOMES, and the one the plane could ALWAYS have said: it is about the
     CALLER rather than about the design, so it needs no recorded decision to be
     sayable. Five ops — `governorconfig`, `memberadd`, `memberset`, `signeradd`,
     `signerset` — were answered with the row above, which told a member to go
     and find a machine credential for an act an administrator performs from
     their own browser. There is no such credential to find. This sentence names
     the person to ask instead, because that is the action actually available.
     CORRECTED 2026-09-25 by REC-162 (Membership v2 §4.9, BOB #23): it read "but an
     administrator of this group, and this session is not one … ask an administrator".
     After REC-159 the one op it answers is `governorconfig`, which the FOUNDER'S session
     alone reaches — an enrolled administrator holds a member's session and was told they
     were not an administrator. The sentence now names the SESSION, as the refusal's own
     `reachedBy` does. */
  SESSION_ROLE_CANNOT_REACH_OP: {
    check: "C-38.7",
    where: "src/index.mjs sessionOpGate > is-session-op-gate",
    translation: "A signed-in person does perform this operation, but from a different session than this one, and this refusal names which. Where it names the founder's session, being an administrator of this group does not reach it: every enrolled member, an administrator included, signs in with a member's session. No machine credential is needed and finding one is not the way through: ask the person who holds the session it names."
  },
  /* D-270 / BOB #17's THIRD SENTENCE, and it exists because the other two would
       otherwise have to cover a case neither is true of.
  
       **THE ARGUMENT, AND IT IS THIS ROW'S WHOLE REASON.** A false rationale
       SUPPRESSES ITS OWN BUG REPORT: a member told that an absence is a DECISION
       will not report it as a gap, so the sentence recruits the one person who
       could have caught it into believing there is nothing to catch. The measured
       case is D-136's — `adminendorse`, `adminremove` and `membercaps` WERE
       reachable by no session, and Membership Architecture §4.7 assigns that very
       vote to a person. **D-136 LANDED 2026-09-19 and discharged that case**: the
       three now hold `SESSION_OPS.admin` reach and a server-stamped `by`, so an
       administrator's session reaches them and a member's gets the ROLE sentence,
       not this one. The receipt stays in the past tense because it is the ARGUMENT
       for this row rather than a roster of its members — the gap was reported only
       because the plane declined to call it a decision, and deleting the evidence
       once the gap closes is how a rule outlives the reason it was made. `docs/archive/research/CAPABILITIES.md` (F-4) recorded
       independently that the old sentence told an administrator the act §4.9
       assigns them needs a credential §4.8 says somebody else holds, and that
       there is no action a member can take from it.
  
       SO THIS ROW STATES THE FACT AND INVENTS NO RATIONALE. It says what is true
       — no session route exists — and says plainly that the record holds no
       decision explaining it, which is an INVITATION to report the gap rather
       than a wall in front of it. A refusal may state only what the system can
       support. */
  SESSION_ROUTE_NOT_RECORDED: {
    check: "C-38.8",
    where: "src/index.mjs sessionOpGate > is-session-op-gate",
    translation: "No signed-in session reaches this operation, and this instance holds no recorded decision saying it is not meant for a person. That is a gap in the record rather than a rule you have run into, and it is worth reporting as one."
  },
  /* Section 8.1. THE ONE PLACE IN THIS SYSTEM WHERE BEING THE FOUNDER IS NOT
     ENOUGH, and the translation says so, because a member refused here will
     otherwise read it as a bug in their own permissions. The security property
     is the point and a person who cannot get in deserves to know it is
     deliberate. */
  ROOT_OF_TRUST_REQUIRED: {
    check: "C-38.4",
    where: "src/index.mjs fetch > is-admission",
    translation: "This needs the administrator token itself, not a signed-in session \u2014 and that includes the founder's own browser. A session is derived from a password; the root of trust is the token held in the hosting account. The published record needs no credential at all."
  },
  /* **THE LIVE DEFECT THIS ROW CLOSES, and it is why REC-79 chose this family.**
     `civicos-ui/app.html` hand-authored a sentence for this code:
     *"This credential cannot write to the record. Capturing needs a member
     holding contribute."* But this refusal is PLANE-WIDE — it is minted for
     whatever capability the op needed, and `create_projects` and `publish` are
     not `contribute`. So a surface had invented capture-specific wording for a
     refusal that is not about capture, and a member denied for `create_projects`
     was told about contributing. **That is precisely the drift a canned
     translation exists to stop** (found by PL-18; DEC-49's own argument for
     option (b) is that thirteen surfaces would otherwise each invent wording).
     The sentence here names no capability, because the plane already sends the
     one that was needed in `needs` and the surface renders that. */
  NOT_CAPABLE: {
    check: "C-38.5",
    where: "src/index.mjs fetch > is-admission",
    translation: "Your account does not hold the capability this needs. Capabilities are granted by an administrator, so ask one rather than looking for another route to the same thing."
  },
  /* A credential that MAY act, but not HERE. Distinct from every row above,
     which are all about whether the caller may act at all. */
  SCOPE_REFUSED: {
    check: "C-38.6",
    where: "src/index.mjs fetch > is-admission",
    translation: "That credential is allowed to act, but not on the part of the record this request named. It is confined to its own namespace and this request reached outside it."
  }
};
var REQUIRED_ARGUMENT_CHECKS = {
  /* NOTHING WAS CHANGED, and the sentence says so first. A caller who cannot
     tell a refused request from a half-applied one has to go and look, and this
     is the one refusal in the plane most likely to be met by a script. */
  REQUIRED_ARGUMENT_MISSING: {
    check: "C-61.1",
    where: "src/index.mjs requiredArgument > is-required-argument",
    translation: "This request left out an argument the operation cannot run without, or sent one in a shape it does not accept. Nothing was changed. The argument and the shape it must take are named beside this message."
  }
};
var INSTALLATION_CHECKS = {
  EVIDENCE_STORAGE_NOT_CONFIGURED: {
    check: "C-68.1",
    where: "src/index.mjs storageAbsent > is-storage-absent",
    translation: "This copy was installed without the storage it keeps captured documents in, so it cannot keep or read the bytes of a captured document. That is a fact about how the copy was set up, not about this request: whoever installed it can connect that storage in the hosting account. Nothing was changed."
  },
  BOOTSTRAP_CREDENTIAL_UNSET: {
    check: "C-68.2",
    where: "src/index.mjs fetch > is-bootstrap-claim",
    translation: "This copy has no administrator token set, so it cannot be claimed yet. Whoever installed it sets one in the hosting account. Nothing was changed."
  },
  BOOTSTRAP_CREDENTIAL_PUBLISHED: {
    check: "C-68.3",
    where: "src/index.mjs fetch > is-bootstrap-claim",
    translation: "This copy's administrator token is a value published in the project's public repository, so it can never be used to claim the copy: anyone can read it. Whoever installed the copy sets a fresh one in the hosting account. Nothing was changed."
  },
  BOOTSTRAP_CREDENTIAL_MISMATCH: {
    check: "C-68.4",
    where: "src/index.mjs fetch > is-bootstrap-claim",
    translation: "The administrator token given does not match the one this copy holds, so the copy was not claimed. Nothing was changed."
  },
  /* D-549. The one row in this family whose reader is most likely NOT whoever installed the copy:
     `publishedbytes` and `publishedcase` are PUBLIC, so the sentence is written for a member of the
     public holding no credential, and says what they can rely on (the document IS published, and
     nothing about it changed) before who can cure it. It names no binding and no mechanism. It is
     true at both sites: at `publishedbytes` the hash has already been verified as published, and at
     `publishedcase` the finding is a member of a published case. */
  NO_PUBLISHED_STORE: {
    check: "C-68.5",
    where: "src/index.mjs publishedStoreAbsent > is-published-store-absent",
    translation: "This copy of the record was set up without the storage it keeps its published documents in, so it cannot hand over the published document's contents. The document is published; this is a fact about how this copy was set up, not about the document or this request, and nothing was changed. Whoever runs this copy can connect that storage."
  }
};
var RENDER_CAPTURE_CHECKS = {
  /* `render` present and not `true`. Refused rather than read as absent: a
     `render: "yes"` answered with the plain capture would file the shell as the
     content, which is the outcome this family exists to prevent. */
  RENDER_FLAG_MALFORMED: {
    check: "C-83.1",
    where: "src/capture/acquire.mjs acquire > is-render-admit",
    translation: "This request asked for a rendered capture in a form this instance does not recognise. It answers render: true or nothing, so a request for the page as a visitor saw it is never quietly answered with the page's empty frame. Nothing was fetched."
  },
  /* A render combined with an arm whose bytes are not a live page: an archive
     replay, a Drive export, or the continuation of a capture already filed. */
  RENDER_ARM_CONFLICT: {
    check: "C-83.2",
    where: "src/capture/acquire.mjs acquire > is-render-admit",
    translation: "A rendered capture runs the live page in a browser, and this request combined that with a way of capturing that does not load a live page (an archived copy, a Drive export, or the continuation of an earlier capture). Ask for one or the other. Nothing was fetched."
  },
  /* No renderer bound: no RENDERER service binding and no BROWSER binding — or a
     BROWSER bound to something that is not a Fetcher, so there is no endpoint to
     open a devtools session on. Named rather than falling back.
     CORRECTED BY D-490: this comment read "the Browser Rendering binding is bound
     and the in-plane driver over it is not built", which was the state D-64 shipped
     and is the state D-490 ended (`src/browserrender.mjs`). The TRANSLATION below
     did not move and did not need to — "no working page renderer" is true of every
     case this code still names — but a comment describing a condition that no longer
     exists is how the next reader is told the wrong thing by the record. */
  RENDER_NO_RENDERER: {
    check: "C-83.3",
    where: "src/capture/acquire.mjs acquire > is-render-admit",
    translation: "This instance has no working page renderer, so it cannot capture the page as a visitor saw it. Nothing was fetched, and the page's empty frame was not filed in its place."
  },
  /* BOB #32 item 3: the daily render allowance is COMMITTED — spent, or reserved by
     renders in flight (D-492). The render is DEFERRED and the deferral is recorded;
     the shell is never the content. CORRECTED 2026-09-24 (D-492), and the old sentence
     is why: it said the allowance had been USED, which was true only of the time
     already reported. Since a render now reserves its maximum cost at admission, a
     deferral can also mean the day's remaining time is held by renders still running,
     and a member told "used" would have gone away for the day when the answer may be a
     minute off. The sentence says which, without naming a mechanism. */
  RENDER_DEFERRED: {
    check: "C-83.4",
    where: "src/capture/acquire.mjs acquire > is-render-admit",
    translation: "Today's allowance for rendering pages is fully committed \u2014 either already used, or held by renders this instance is running right now \u2014 so this render is deferred, and that is recorded. Nothing was fetched and nothing was filed in its place. Try again when the renders in flight have finished, or after midnight UTC."
  },
  /* The render loads the page again, which is a second document load to the
     host, so it asks the per-host governor like any other (BOB #32 item 3:
     "through the host governor"). Refused by name when the host is cooling off. */
  RENDER_HOST_COOLING_OFF: {
    check: "C-83.5",
    where: "src/capture/acquire.mjs acquire > is-render-admit",
    translation: "This instance is giving that website a rest after it asked us to slow down, and a rendered capture loads the page again, so it was not attempted. Nothing was fetched. Try again after the wait shown beside this message."
  },
  /* The shell is not an HTML page small enough to render (a PDF, an office
     file, a multipart giant). A document that is not a page has nothing a
     browser adds; capture it without `render`. */
  RENDER_NOT_A_PAGE: {
    check: "C-83.6",
    where: "src/capture/acquire.mjs acquire > is-render-result",
    translation: "The address served something that is not a web page a browser can render, such as a PDF or an office file, so there is nothing for a rendered capture to add. Nothing was filed. Capture it the ordinary way."
  },
  /* The renderer did not produce a rendered document. The shell's bytes are
     held content-addressed and unregistered, exactly as TOO_LARGE's parts are;
     no document names them. */
  RENDER_FAILED: {
    check: "C-83.7",
    where: "src/capture/acquire.mjs acquire > is-render-result",
    translation: "The page was fetched but the renderer did not produce the page as a visitor would see it, so nothing was filed: the page's empty frame is never filed as its content. The reason the renderer gave is beside this message."
  },
  /* D-520: the instance's CONCURRENCY CAP is full (BOB #33, 2026-09-24: a cap from the
     vendor's stated limit, and a render over it WAITS, never dropped). Decided in the
     admission span, before the shell is fetched, and distinct from C-83.4 on purpose: the
     day's allowance is untouched and may have room, so the sentence must not say it is
     used. The unattended drain holds the row under this code and asks again next tick. */
  RENDER_AT_CAPACITY: {
    check: "C-83.8",
    where: "src/capture/acquire.mjs acquire > is-render-admit",
    translation: "This instance is already rendering as many pages at once as it allows, so this render is waiting for one of them to finish. Nothing was fetched and nothing was filed in its place. A scheduled capture asks again on its own; try again in a minute."
  }
};
var NAMESPACE_CHECKS = {
  NAMESPACE_UNKNOWN: {
    check: "C-78.1",
    where: "src/index.mjs namespaceGate > is-namespace-gate",
    translation: "This request named a part of the record that does not exist on this copy, so nothing was read or changed. A copy has two: the record itself, and a scratch area kept apart for testing. The name must match one of them exactly; the names are listed beside this message."
  },
  /* D-461 (C-78.2): the scratch area named on a public operation that only ever answers from the record itself.
     Twelve such operations used to answer from the record while the caller believed it was in scratch — one of
     them, a knock, WROTE there. The sentence says nothing happened first and names no remedy but the true one. */
  NAMESPACE_PINNED: {
    check: "C-78.2",
    where: "src/index.mjs pinnedNamespaceGate > is-pinned-namespace-gate",
    translation: "This request asked for the scratch area, but this operation only ever answers from the record itself and has no scratch version, so nothing was read or changed. To use it, leave the scratch area out of the request, knowing it then reaches the real record."
  },
  /* D-463 (C-78.3): the credential itself is confined to the scratch area for its whole life, and this request
     named a different part of the record. C-78.1 and C-78.2 are both properties of the REQUEST — a name that
     does not exist, an operation that has no scratch version; this one is a property of the CALLER, which is
     why it is a third row and not a widening of either. Confinement is by REFUSAL and never by silent
     redirection when a store is NAMED (`scopeFor`'s rule for the probe class, and D-456's for everyone): a
     caller who believes it addressed the record must be told it did not. An ABSENT `store=` is not a refusal —
     the credential's own confinement is its default, which is the whole point of minting one. */
  NAMESPACE_CONFINED: {
    check: "C-78.3",
    where: "src/index.mjs confinedNamespaceGate > is-confined-namespace-gate",
    translation: "The credential used for this request can only ever reach the scratch area kept apart for testing, and this request asked for a different part of the record, so nothing was read or changed. Leave the part out of the request and it reaches scratch, which is the only place this credential goes."
  }
};
var DISPATCH_CHECKS = {
  UNKNOWN_OP: {
    check: "C-69.1",
    where: "src/index.mjs fetch > is-unknown-op",
    translation: "This copy has no operation by that name. A copy running an older or newer version can have a different set of operations, and a misspelt name reads the same way. Nothing was changed."
  },
  /* D-561. THE STORE DID NOT ANSWER (REC-52's `storeSilent`). Every public read can meet it — `publishedbytes`,
     `publishedcase`, `verify`, `publishedmanifest` — so its reader is often a member of the public holding nothing,
     and until D-561 the code reached them bare. It is a fact about the EXCHANGE, never about the record, and the
     sentence says only that. It does NOT say "nothing was changed": `storeSilent` also answers a write whose store
     went silent, and whether that write took effect is exactly what a silence cannot say. */
  STORE_DID_NOT_ANSWER: {
    check: "C-69.2",
    where: "src/index.mjs storeSilent > is-store-silent",
    translation: "This copy of the record could not consult its own records just now, so nothing in this reply is a statement about them: not that what you asked for is missing, unpublished or refused. Ask again. If your request was meant to change something, look before repeating it, because this reply cannot say whether it did."
  }
};
var PUBLISHED_READ_CHECKS = {
  NO_PUBLISHED_PART: {
    check: "C-98.1",
    where: "src/index.mjs noPublishedPart > is-no-published-part",
    translation: "Nothing this copy of the record has published matches that fingerprint. Something that was never published and something that never existed get this same answer, so it says nothing about anything unpublished. Check that the fingerprint was copied whole. Nothing was changed."
  },
  OBJECT_MISSING: {
    check: "C-98.2",
    where: "src/index.mjs publishedObjectMissing > is-published-object-missing",
    translation: "This document is published, but this copy of the record cannot find its contents in its storage, so it cannot hand them over. The document and its fingerprint are unaffected, and nothing was changed. Whoever runs this copy can restore the missing contents."
  },
  NOT_A_CONTAINER: {
    check: "C-98.3",
    where: "src/index.mjs fetch > is-not-a-container",
    translation: "You asked for a whole case file as one download, but that fingerprint belongs to a single document inside a case file. Ask for it without the download-as-one-file option to get that document, or use the fingerprint of the case file's list of contents to get the whole case file. Nothing was changed."
  },
  MANIFEST_UNREADABLE: {
    check: "C-98.4",
    where: "src/index.mjs fetch > is-manifest-unreadable",
    translation: "This case file is published, but this copy of the record cannot read the list of its contents, so it cannot put the case file together as one download. Nothing was changed. Whoever runs this copy can repair it."
  },
  PART_MISSING: {
    check: "C-98.5",
    where: "src/container.mjs containerEntries > is-part-missing",
    translation: "This case file is published, but this copy of the record cannot find one of the documents it lists, and it will not hand over a case file with a piece missing. The reply names the missing document; the others can still be asked for one at a time. Nothing was changed. Whoever runs this copy can restore it."
  },
  DUPLICATE_PATH: {
    check: "C-98.6",
    where: "src/container.mjs serialiseContainer > is-duplicate-path",
    translation: "The list of this case file's contents puts two documents under the same name, so one download could be read two ways. This copy will not hand over a case file that says two things about one name. Each document can still be asked for on its own. Nothing was changed."
  },
  CONTAINER_TOO_LARGE: {
    check: "C-98.7",
    where: "src/container.mjs serialiseContainer > is-container-too-large",
    translation: "This case file is too large to hand over as one download. Every document in it can still be asked for on its own, which gives the same contents. Nothing was changed."
  },
  NOT_PUBLISHED: {
    check: "C-98.8",
    where: "src/store.mjs publishedCase > is-not-published",
    translation: "Nothing this copy of the record has published answers to what you asked for. A case that was never published, an edition that does not exist and a name that never existed all get this same answer, so it says nothing about anything unpublished. Nothing was changed."
  }
};
var KNOCK_CHECKS = {
  RATE_IP: {
    check: "C-85.1",
    where: "src/capture/index.mjs #knockRateRefusal > is-knock-rate",
    translation: "This group's inbox is not taking any more material from where you are sending it just now. It is a limit on how fast one sender may knock, not a judgement about you or about what you sent, and it lifts on its own shortly \u2014 the bound is published beside this message. Nothing was stored and nothing was read, so send the same material again a little later and it will arrive."
  },
  RATE_GLOBAL: {
    check: "C-85.2",
    where: "src/capture/index.mjs #knockRateRefusal > is-knock-rate",
    translation: "This group's inbox is not taking any more material from anyone just now. The whole instance is at its limit rather than you \u2014 the cap exists so that no one sender can fill the inbox \u2014 and it lifts on its own shortly; the bound is published beside this message. Nothing was stored and nothing was read, so send the same material again a little later. If it keeps happening, the group's members can be told the doorbell is saturated."
  },
  /* D-513 — THE THREE REFUSALS THIS DOOR MAKES BEFORE THE STORE IS CALLED. Each
     `where` names a module-scope helper (capture's `doorbell.mjs` since T4) and
     the region inside it, because that is where each refusal is enforced; the two oversize
     rows are two conditions and deliberately not one row with a widened
     sentence. */
  KNOCK_ENVELOPE_TOO_LARGE: {
    check: "C-85.3",
    where: "src/capture/doorbell.mjs knockEnvelopeTooLarge > is-knock-envelope-too-large",
    translation: "This group's inbox did not read what you sent, because the request itself is larger than this door accepts. Nothing was stored, nothing was opened, and nothing about your material was judged \u2014 its size was read off the request and it stopped there. The size this instance will read is published beside this message. Send the material again smaller, or as more than one knock, and it will be read."
  },
  KNOCK_PAYLOAD_TOO_LARGE: {
    check: "C-85.4",
    where: "src/capture/doorbell.mjs knockPayloadTooLarge > is-knock-payload-too-large",
    translation: "This group's inbox read your material and cannot keep it, because it is larger than this instance stores. That is a fact about how this group has set its instance up rather than a judgement about what you sent \u2014 a group that has configured evidence storage can keep far more \u2014 and the size this one can keep is published beside this message. Nothing was stored. Send something smaller, or ask the group's members how to get the whole of it to them."
  },
  KNOCK_EMPTY: {
    check: "C-85.5",
    where: "src/capture/doorbell.mjs knockEmpty > is-knock-empty",
    translation: "This group's inbox has nothing to keep, because what you sent decoded to no bytes at all. The request itself was well formed and named its content, so this is most likely an empty file or an empty box rather than anything wrong with how you sent it. Nothing was stored. Check what you attached and knock again."
  }
};
var ATTEST_CHECKS = {
  CAPTURE_HELD_IN_PARTS: {
    check: "C-89.1",
    where: "src/provenance/index.mjs attest > is-attest-parts",
    translation: "The record lists this document, but keeps it in parts rather than as one file, and this instance has no record of fetching it itself. A timestamp is only requested for bytes this instance can vouch for, so none was requested. Nothing is missing: do not capture the document again. If the instance fetches it from its address, it can then be co-attested."
  }
};
var PROVENANCE_ACT_CHECKS = {
  /* R1: the C-18 register rules at the write. The findings carry each rule's own C-18 id; this row is the act's. */
  PROVENANCE_REGISTER_REFUSED: {
    check: "C-103.1",
    where: "src/provenance/index.mjs #registerArms",
    translation: "This document's account of where it came from breaks rules that the version it revises did not break, so nothing was written. Each broken rule is listed beside this message. Correct the account and save the document again."
  },
  ORIGIN_NOT_A_MEMBER: {
    check: "C-103.2",
    where: "src/provenance/index.mjs declareOrigin > is-origin-act",
    translation: "Saying which system a document came from is a statement a named member makes and is named beside, and this came from an automated credential or from nobody. Sign in and make it yourself. Nothing was recorded."
  },
  NO_BUNDLE: {
    check: "C-103.3",
    where: "src/provenance/index.mjs declareOrigin > is-origin-act",
    translation: "This did not say which document it is about, so nothing was done."
  },
  ORIGIN_NOT_A_DOCUMENT: {
    check: "C-103.4",
    where: "src/provenance/index.mjs declareOrigin > is-origin-statement",
    translation: "Only a captured document came from a system, and this is not one: a question, a project or an action was written in the record. Nothing was recorded."
  },
  ORIGIN_NO_SYSTEM: {
    check: "C-103.5",
    where: "src/provenance/index.mjs declareOrigin > is-origin-statement",
    translation: "This did not name the system the document came from, or named it at more than 200 characters. Name it briefly and try again. Nothing was recorded."
  },
  RECEIPT_MALFORMED: {
    check: "C-103.6",
    where: "src/provenance/index.mjs signReceipt",
    translation: "A receipt names the captured document's fingerprint, the address it was fetched from and when, and one of those was missing or not in its form, so no receipt was signed."
  },
  RECEIPT_NO_KEY: {
    check: "C-103.7",
    where: "src/provenance/index.mjs signReceipt",
    translation: "This instance holds no key to sign its receipts with, so this receipt was not signed, and nothing claims that it was. Whoever runs the instance can add one."
  }
};
var DRIVE_CAPTURE_CHECKS = {
  /* D-112, AND IT IS THE SPINE OF THE ITEM. The three facts this capture's hop
     carries — the export address, the export format, the producer — are derived
     by the plane from the file id and the kind in the address. A body carrying
     one is a caller trying to author the record's own provenance, and it is
     refused BY NAME rather than having the field quietly dropped: a caller told
     nothing learns nothing, and a hop a caller can hand us is one a caller can
     invent. */
  DRIVE_HOP_FACT_SUPPLIED: {
    check: "C-48.1",
    where: "src/capture/acquire.mjs acquire > is-drive-capture",
    translation: "This request tried to tell the record where a document was exported from, in what format, or by whom. Those are facts this instance establishes by doing the fetch itself, never facts it accepts from whoever asked. Send the Drive link and nothing else."
  },
  /* A FOLDER. There is nothing to export and no single set of bytes a capture
     could honestly hold, so the honest answer is the shape's name and the reason. */
  DRIVE_FOLDER_NOT_A_DOCUMENT: {
    check: "C-48.2",
    where: "src/capture/acquire.mjs acquire > is-drive-capture, and the SAME condition on a monitor tick (op=monitor, ungoverned span, D-472): a folder is not a document to capture and not a document to watch, and one sentence is true of both",
    translation: "That address is a Drive FOLDER \u2014 a listing of files rather than a document. There is nothing to export and no single set of bytes a capture of it would hold. Name the document you want; harvesting everything a folder lists is a different act."
  },
  /* A FILE ID WITH NO KIND. The kind decides the export format, so composing an
     export address here would mean guessing which conversion to ask for, and
     filing bytes whose format the record had invented. Undetermined is
     first-class and must be STATED. */
  DRIVE_KIND_UNDETERMINED: {
    check: "C-48.3",
    where: "src/capture/acquire.mjs acquire > is-drive-capture, and the SAME condition on a monitor tick (op=monitor, ungoverned span, D-472)",
    translation: "That Drive address names a file but not what KIND of file it is, and the kind is what decides which export to ask for. Guessing would file bytes in a format nobody established. Use the address that opens the document itself, which carries the kind."
  },
  /* A DRIVE HOST WITH AN UNREAD PATH. Named rather than harvested, and named
     rather than passed through: a Drive address whose shape is unread is not a
     document this instance can promise to have captured. */
  DRIVE_SHAPE_UNRECOGNISED: {
    check: "C-48.4",
    where: "src/capture/acquire.mjs acquire > is-drive-capture, and the SAME condition on a monitor tick (op=monitor, ungoverned span, D-472)",
    translation: "That is a Google Drive address in a form this instance does not recognise. Rather than capture whatever bytes the address happens to serve and call it the document, it says so. If this shape should be harvestable, that is a change worth making deliberately."
  },
  /* THE APPLICATION SHELL, REFUSED BY NAME AND NEVER PARSED. Google answers the
     export address with `text/html` when the file is not shared with anyone who
     has the link: a sign-in page, an error page, the app. It is never the
     document. Filing it would put a page of Google's furniture into the record
     under a city document's address — the record claiming more than it can
     support, which CLAUDE.md ranks worse than a missing feature. */
  DRIVE_EXPORT_IS_THE_SHELL: {
    check: "C-48.5",
    where: "src/capture/acquire.mjs acquire > is-drive-export",
    translation: "Google answered the export address with a web page rather than a document \u2014 which is what it does when a file is not shared with anyone who has the link. That page is the application, not the document, and it is not filed as one. Check that the file is shared."
  },
  /* THE SAME SHELL, CAUGHT ON THE BYTES, AND IT IS A SECOND CODE RATHER THAN THE
     ROW ABOVE FIRING TWICE. PL-4 measured what one predicate at two points costs:
     one of the two becomes unreachable and can never be driven. These are two
     different predicates over two different pieces of evidence — the header, and
     the first kibibyte — and they are two different findings. C-48.5 is "Google
     told us it was a web page"; this is "Google told us it was a document and it
     was a web page", which is the more serious fact and is why detection here is
     bytes-first (COFF-1: a byte signature ALWAYS outranks a declared type). */
  DRIVE_EXPORT_BYTES_ARE_THE_SHELL: {
    check: "C-48.7",
    where: "src/capture/acquire.mjs acquire > is-drive-bytes",
    translation: "The export address said it was sending a document and sent a web page instead. This instance checks the bytes rather than taking the label, so the application page was recognised and refused. Nothing was filed under that document address."
  },
  /* THE EXPORT FETCH FAILING, AND THE HALF THAT MATTERS IS WHAT DOES *NOT*
     HAPPEN. There is no fallback to the shell. A 403 or a 404 at the export
     address ends the capture with the failure named; it never quietly becomes a
     capture of the application page, which would look like a success and hold
     nothing. */
  /* D-472 — THE SHELL, ON A TICK, AND WHY IT IS ITS OWN CODE RATHER THAN C-48.5
     FIRING FROM A SECOND PLACE. A capture that meets the shell has captured
     nothing and the member's remedy is to share the file. A TICK that meets the
     shell has not captured anything either — it never would — and what it has
     lost is the CHECK: the record's last comparison still stands, undisturbed,
     and nothing about the document changed. Those are two different facts about
     the member's own situation, and DEC-49's canned translation is the sentence
     they actually read, so one sentence cannot be true of both. PL-4's rule cuts
     the same way it did for C-48.5/C-48.7: two predicates, two sites, both
     drivable — `op=acquire` drives the pair above, `op=monitor` drives this pair,
     and `test/monitor-assess.test.mjs` drives both of these by name. */
  DRIVE_TICK_EXPORT_IS_THE_SHELL: {
    check: "C-48.8",
    where: "src/index.mjs fetch > is-drive-tick-export",
    translation: "The check of that Google Drive document did not run: the export address answered with a web page rather than a document, which is what Drive does when a file stops being shared with anyone who has the link. Nothing was compared and nothing about the record changed \u2014 what is known is that this instance could not see the document today."
  },
  /* THE SAME TICK, CAUGHT ON THE BYTES. C-48.7's reasoning one op over: the
     declared type and the first kibibyte are two different pieces of evidence,
     and "Google told us it was a document and it was a web page" is the more
     serious fact. On a tick the consequence is the same either way and it is
     still worth two codes, because a tick that compared the shell would report
     the document CHANGED on every visit — the cry-wolf this row exists to end. */
  DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL: {
    check: "C-48.9",
    where: "src/index.mjs fetch > is-drive-tick-bytes",
    translation: "The check of that Google Drive document did not run: the export address said it was sending a document and sent a web page instead. This instance reads the bytes rather than the label, so the application page was recognised and not compared against the captured document \u2014 comparing it would report a change on every visit that nobody made."
  },
  DRIVE_EXPORT_UNREACHABLE: {
    check: "C-48.6",
    where: "src/capture/acquire.mjs acquire > is-drive-export",
    translation: "The OpenDocument export of that Drive document could not be fetched, so nothing was captured. The application page at the same address is NOT captured instead: a record holding the app in place of the document would look like evidence and be none."
  }
};
var CASE_DOCUMENT_FORMAT = "bio-case-document/4";
var CASE_DOCUMENT_FORMAT_V3 = "bio-case-document/3";
var CASE_DOCUMENT_FORMAT_V2 = "bio-case-document/2";
var CASE_DOCUMENT_FORMAT_LEGACY = "bio-case-document/1";
var CASE_DOCUMENT_FORMATS_ACCEPTED = [
  CASE_DOCUMENT_FORMAT,
  CASE_DOCUMENT_FORMAT_V3,
  CASE_DOCUMENT_FORMAT_V2,
  CASE_DOCUMENT_FORMAT_LEGACY
];
var caseDocumentStatesMemberBlocks = (fm) => fm?.format === CASE_DOCUMENT_FORMAT || fm?.format === CASE_DOCUMENT_FORMAT_V3 || fm?.format === CASE_DOCUMENT_FORMAT_V2;
var caseDocumentRequiresDisclosures = (fm) => fm?.format === CASE_DOCUMENT_FORMAT || fm?.format === CASE_DOCUMENT_FORMAT_V3;
var caseDocumentRequiresV4Disclosures = (fm) => fm?.format === CASE_DOCUMENT_FORMAT;
var SEARCHED_SUBJECT_SOURCES = {
  case_basis: "the subjects were taken from the CASE -- its members' basis legs and the content rows those legs name -- and the observation log was consulted only to ask what became of each. The log never supplies the subject set; a section computed the other way round is 100% searched by construction and says nothing about the case"
};
var CASE_DOCUMENT_FAMILY = {
  FORMAT: { check: "C-41.1", what: "the format token" },
  IDENTITY: { check: "C-41.2", what: "case_id, and that it is the case being ratified" },
  EDITION: { check: "C-41.3", what: "case_edition, and that it is the edition being ratified" },
  PROJECT: { check: "C-41.4", what: "case_project \u2014 whose production this is (DEC-72 clause 2)" },
  SCOPE: { check: "C-41.5", what: "case_scope \u2014 what the case is ABOUT (DEC-44 determination 2)" },
  BIAS: { check: "C-41.6", what: "bias_acknowledgement (REC-47 / DEC-46 (a))" },
  ROSTER: { check: "C-41.7", what: "case_findings \u2014 what the case rests on (DEC-44 determination 3)" },
  ROLES: { check: "C-41.8", what: "case_roles \u2014 the authored partition (DEC-72 clause 4)" },
  PINS: { check: "C-41.9", what: "the version hash per member (DEC-72 clause 3)" },
  COMPLETENESS: { check: "C-41.10", what: "the completeness block (REC-14)" },
  EXCLUDED: { check: "C-41.11", what: "the exclusion list field (C-9)" },
  BAR: { check: "C-41.12", what: "required_strength \u2014 the standard of evidence (DEC-17 as DEC-72 rehomes it)" },
  DISCLOSURES: { check: "C-41.13", what: "bias_manifest, the statement's acknowledgement list and the statement's WRITER, required of a bio-case-document/3 or /4 (REC-188; the writer REC-212)" },
  /* REC-219: BOB #34 named this check C-41.13, which /3's obligation above already holds, so it takes
     the next free member of the family. */
  PENDING: { check: "C-41.14", what: "the adoptions pinning a PROPOSED revision at signing, stated beside bias_manifest, required of a bio-case-document/4 (REC-219)" },
  /* REC-219 / D-579(a) (BOB #34, 2026-09-25 02:30Z): the case's citation edges, each pinned to the
     version it was made against — one more /4 obligation, riding the same bump. */
  CITATIONS: { check: "C-41.15", what: "case_citations \u2014 each citation edge with the version it rests on, a pinned one naming its capture, required of a bio-case-document/4 (REC-219, D-579(a))" }
};
var CASE_CITATION_VERSIONS = ["pinned", "only_capture", "undetermined", "no_capture", "no_bytes"];
var CITATION_NAMES_CAPTURE = /* @__PURE__ */ new Set(["pinned", "only_capture"]);
var C41 = Object.fromEntries(
  Object.entries(CASE_DOCUMENT_FAMILY).map(([k, v]) => [k, v.check])
);
function checkCaseDocument(fm, ctx = {}) {
  const findings = [];
  const { caseId = null, edition = null, priorCase = null, body = null, memberBasis = null } = ctx;
  if (!CASE_DOCUMENT_FORMATS_ACCEPTED.includes(fm?.format)) {
    findings.push(f(
      C41.FORMAT,
      "error",
      `a case document declares format '${CASE_DOCUMENT_FORMAT}' (or, authored before REC-188, '${CASE_DOCUMENT_FORMAT_V2}'; or, authored before BIO_Publication_v0_1.md \xA73 rule 12, '${CASE_DOCUMENT_FORMAT_LEGACY}') (got '${fm?.format}'): the format token is what lets a stranger holding these bytes know what they are reading and what rules they were made under, which is the same reason the container manifest carries one`,
      ["re-publish through op=publish, which authors the case document"]
    ));
  }
  if (typeof fm?.case_id !== "string" || fm.case_id.trim() === "" || fm.case_id === "null") {
    findings.push(f(C41.IDENTITY, "error", "a case document requires case_id: without it the document names no case, so C-21.1 has nothing to be fresh against and the container has no identity to be an edition OF (DEC-44)"));
  } else if (caseId && fm.case_id !== caseId) {
    findings.push(f(C41.IDENTITY, "error", `this case document names case ${fm.case_id} and is being ratified as ${caseId}: the signature covers these bytes, so a case identity taken from the request rather than from the signed document would place a commitment where nobody made one`));
  }
  if (!Number.isInteger(fm?.case_edition) || fm.case_edition < 1) {
    findings.push(f(C41.EDITION, "error", `a case document requires an integer case_edition of 1 or more (got '${fm?.case_edition}'): an edition is a SEPARATE DOCUMENT and answers forever, so a signature that did not cover the number would stand for every edition of this case at once`));
  } else if (Number.isInteger(edition) && fm.case_edition !== edition) {
    findings.push(f(C41.EDITION, "error", `this case document names edition ${fm.case_edition} and is being ratified as edition ${edition}: the edition is inside the hash the member signed, exactly as DEC-12 already requires of a bundle`));
  }
  if (typeof fm?.case_project !== "string" || fm.case_project.trim() === "" || fm.case_project === "null") {
    findings.push(f(
      C41.PROJECT,
      "error",
      "a case document requires case_project: a case is a PRODUCTION OF A PROJECT (DEC-72), and the project is what supplied the standard of evidence the case was held to. A published case naming no project is one whose bar nobody declared, and a stranger holding it cannot say whose production it is",
      ["publish through op=publish with project=<project id>, which writes it into the case document you sign"]
    ));
  }
  if (typeof fm?.case_scope !== "string" || fm.case_scope.trim() === "") {
    findings.push(f(
      C41.SCOPE,
      "error",
      "a case document requires case_scope: the case states what brought these findings together and what question it answers as a whole. It is AUTHORED by the group and never derived from the findings' titles \u2014 a scope this plane wrote is not a scope the group made (DEC-44)",
      ["author the case scope on op=publish"]
    ));
  }
  if (typeof fm?.bias_acknowledgement !== "string" || fm.bias_acknowledgement.trim() === "") {
    findings.push(f(
      C41.BIAS,
      "error",
      "a case document requires bias_acknowledgement: a published case carries the bias it was produced under as a fact the reader weighs, and the publisher ACKNOWLEDGES it at the moment of export rather than passing a pre-flight checkbox (DEC-46). Ordinary declared bias never blocks publication and is disclosed precisely so a reader can apply or discount it (DEC-20) \u2014 what is refused here is publishing SILENTLY about the lens, not publishing under one",
      ["author the bias acknowledgement on op=publish, fresh for this edition"]
    ));
  }
  const roster = Array.isArray(fm?.case_findings) ? fm.case_findings : null;
  if (!roster || !roster.length) {
    findings.push(f(
      C41.ROSTER,
      "error",
      "a case document requires case_findings naming every finding in this case: a stranger holding this document must be able to see what the case rests on without contacting this instance, which is the premise the portable container exists for (DEC-44 determination 3)",
      ["publish through op=publish, which writes the roster into the case document"]
    ));
  }
  {
    const names = (roster || []).map((x) => String(x));
    const rows = Array.isArray(fm?.case_roles) ? fm.case_roles.filter((r) => r && typeof r === "object") : null;
    if (!rows || !rows.length) {
      findings.push(f(
        C41.ROLES,
        "error",
        "a case document requires case_roles: the publisher DESIGNATES each member load_bearing or supporting, and the whole partition is signed so a stranger can see which findings were presented as carrying the case (DEC-72 clause 4). There is no default \u2014 a member designated by omission was designated by nobody",
        ['designate every member on op=publish with roles={"<finding id>": "load_bearing"|"supporting"}']
      ));
    } else {
      const named = new Map(rows.map((r) => [String(r.target ?? ""), String(r.role ?? "")]));
      const pinned = new Map(rows.map((r) => [String(r.target ?? ""), r.version_sha]));
      for (const m of names) {
        if (!named.has(m)) {
          findings.push(f(C41.ROLES, "error", `case_roles designates no role for ${m}, which case_findings names as a member: the partition covers the roster exactly, because a member the partition is silent about was designated by nobody (DEC-72 clause 4)`));
        } else if (!CASE_MEMBER_ROLES.includes(named.get(m))) {
          findings.push(f(C41.ROLES, "error", `case_roles designates ${m} '${named.get(m)}', which is not one of: ${CASE_MEMBER_ROLES.join(", ")}`));
        }
        const pin = pinned.get(m);
        if (typeof pin !== "string" || !/^[0-9a-f]{64}$/.test(pin)) {
          findings.push(f(
            C41.PINS,
            "error",
            `case_roles names ${m} without a 64-hex version_sha: publication PINS VERSIONS LIKE A COMMIT (DEC-72 clause 3), so a case that names its members and not the VERSIONS of them is a claim about the present rather than a frozen edition. The pin is the member's own bundle_sha, which is the hash that member signs`,
            ["re-publish through op=publish, which pins each member at the version it prepared"]
          ));
        }
      }
      for (const [t] of named) {
        if (t && !names.includes(t)) {
          findings.push(f(C41.ROLES, "error", `case_roles designates ${t}, which case_findings does not name as a member of this case: the partition is OVER the roster and cannot reach outside it`));
        }
      }
      if (names.length && !names.some((m) => named.get(m) === "load_bearing")) {
        findings.push(f(
          C41.ROLES,
          "error",
          "case_roles names no LOAD-BEARING member: a case rests on at least one finding that meets the project's standard of evidence (DEC-72's second ruled default). All-supporting material asserts nothing conclusively while the completeness assertion claims coverage of a question no member conclusively answers",
          ["designate the finding the case actually rests on, or do not publish this as a case yet"]
        ));
      }
    }
  }
  const c = typeof fm?.completeness === "object" && fm.completeness || null;
  if (!c) {
    findings.push(f(
      C41.COMPLETENESS,
      "error",
      "a case document requires a completeness block: a case that says nothing about what it does not cover is claiming to cover everything",
      ["author completeness.statement and the exclusion list"]
    ));
  } else {
    if (typeof c.statement !== "string" || c.statement.trim() === "")
      findings.push(f(C41.COMPLETENESS, "error", "a case document requires a non-empty completeness.statement"));
    if (typeof c.author !== "string" || c.author.trim() === "")
      findings.push(f(C41.COMPLETENESS, "error", "a case document requires completeness.author: the completeness assertion is a named member's claim about the limits of this case"));
    if (typeof c.at !== "string" || !ISO_TS_RE.test(c.at))
      findings.push(f(C41.COMPLETENESS, "error", `a case document requires completeness.at as an ISO timestamp (got '${c.at}')`));
    if (!SUBJECT_POSITIONS.includes(c.subject_position))
      findings.push(f(C41.COMPLETENESS, "error", `a case document requires completeness.subject_position, one of: ${SUBJECT_POSITIONS.join(", ")} (got '${c.subject_position}'). The gate is that the position is declared and justified \u2014 never that contact happened, and never that the answer was favourable (DEC-13)`));
    if (typeof c.subject_justification !== "string" || c.subject_justification.trim() === "")
      findings.push(f(C41.COMPLETENESS, "error", "a case document requires completeness.subject_justification: a declared position with no reasoning behind it is the checkbox this gate exists to refuse (DEC-13)"));
  }
  if (fm && fm.completeness_acknowledgements !== void 0) {
    const acks = fm.completeness_acknowledgements;
    if (!Array.isArray(acks)) {
      findings.push(f(C41.COMPLETENESS, "error", "a case document's completeness_acknowledgements must be a list \u2014 empty when nobody but the statement's author acknowledged it (BIO_Publication \xA73 rule 11)"));
    } else {
      const publisher = c && typeof c.author === "string" ? c.author : null;
      const statesWriter = !!c && Object.prototype.hasOwnProperty.call(c, "statement_by");
      const writer = statesWriter && typeof c.statement_by === "string" && c.statement_by.trim() ? c.statement_by.trim() : null;
      const writerUndetermined = statesWriter && !writer;
      for (const a of acks) {
        if (!a || typeof a !== "object" || !["participant", "recipient"].includes(a.kind) || typeof a.by !== "string" || !a.by.trim() || typeof a.at !== "string")
          findings.push(f(C41.COMPLETENESS, "error", `a case document lists an acknowledgement of its statement that names no acknowledger, kind (participant or recipient) or date (got ${JSON.stringify(a)}): an acknowledgement is an authored, attributed, dated act, and an unattributed one is the record claiming a second reader it cannot name`));
        else if (a.kind === "participant" && writer && a.by === writer)
          findings.push(f(C41.COMPLETENESS, "error", `a case document lists ${a.by}, the member who WROTE its exclusion statement (completeness.statement_by), as having acknowledged it: an acknowledgement is a SECOND person's reading of what the case leaves out (BIO_Publication \xA73 rule 11), and the writer of the sentence has read it once. Who wrote the statement and who published the case are two acts and two names (\xA73 rule 13) \u2014 this is the writer, whether or not they are also completeness.author`));
        else if (a.kind === "participant" && publisher && a.by === publisher)
          findings.push(f(C41.COMPLETENESS, "error", `a case document lists ${a.by}, completeness.author \u2014 the member who PREPARED AND PUBLISHED this case and authored this completeness block at that act \u2014 as having acknowledged its statement: an acknowledgement is a SECOND person's reading of what the case leaves out (BIO_Publication \xA73 rule 11), and the member who authored the block is its first reader by construction`));
      }
      if (writerUndetermined && acks.some((a) => a && typeof a === "object" && a.kind === "participant"))
        findings.push(f(C41.COMPLETENESS, "error", `a case document states that who wrote its exclusion statement is UNDETERMINED (completeness.statement_by is null) and lists ${acks.filter((a) => a && typeof a === "object" && a.kind === "participant").length} participant acknowledgement(s) of it: an acknowledgement is a SECOND person's reading (BIO_Publication \xA73 rule 11), and a document that cannot say who the FIRST reader was cannot support the claim that any of these is a second. Publish the edition again from a draft whose statement carries an author, or let the list stand with its recipients alone \u2014 a recipient of a review copy is never the statement's writer`));
      if (c && c.acknowledged !== void 0 && c.acknowledged !== acks.length)
        findings.push(f(C41.COMPLETENESS, "error", `a case document's completeness.acknowledged (${c.acknowledged}) disagrees with the ${acks.length} acknowledgement(s) it lists: the count and the list are one claim`));
    }
  }
  if (caseDocumentRequiresDisclosures(fm)) {
    const bm = fm?.bias_manifest;
    if (!bm || typeof bm !== "object" || Array.isArray(bm) || typeof bm.in_force !== "boolean") {
      findings.push(f(
        C41.DISCLOSURES,
        "error",
        `a ${CASE_DOCUMENT_FORMAT} case document requires a bias_manifest map with a boolean in_force (got ${JSON.stringify(bm ?? null)}): a published case CARRIES the bias it was produced under (DEC-20), and the manifest is the lens itself \u2014 computed and stamped by the plane beside the acknowledgement the publisher authors (DEC-46). A document silent about the lens cannot be told from one produced under none`,
        ["re-publish through op=publish, which stamps the manifest in force for the case's project into the case document"]
      ));
    } else if (bm.in_force === true && !(typeof bm.statements_sha === "string" && /^[0-9a-f]{64}$/.test(bm.statements_sha))) {
      findings.push(f(
        C41.DISCLOSURES,
        "error",
        `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest says a lens was in force and names no 64-hex statements_sha (got '${bm.statements_sha}'): the manifest is the (bundle, revision) pairs PLUS a hash of the effective statement set, and a lens named without its hash cannot be checked against op=biasmanifest by anyone`,
        ["re-publish through op=publish"]
      ));
    } else if (bm.in_force === false && !(typeof bm.stated === "string" && bm.stated.trim())) {
      findings.push(f(
        C41.DISCLOSURES,
        "error",
        `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest says no lens was in force and does not SAY so (stated is empty): "no manifest was in force" is a statement, and a blank is not one`,
        ["re-publish through op=publish"]
      ));
    }
    if (bm && typeof bm === "object" && !Array.isArray(fm?.bias_manifest_bundles)) {
      findings.push(f(
        C41.DISCLOSURES,
        "error",
        `a ${CASE_DOCUMENT_FORMAT} case document requires bias_manifest_bundles beside bias_manifest: an EMPTY list is a claim (no bias bundle was in force) and is legal \u2014 an ABSENT field is silence about which revisions the lens was`,
        ["re-publish through op=publish"]
      ));
    }
    if (!c || !Number.isInteger(c.acknowledged) || c.acknowledged < 0) {
      findings.push(f(
        C41.DISCLOSURES,
        "error",
        `a ${CASE_DOCUMENT_FORMAT} case document requires completeness.acknowledged, the count of second readers of its statement (got '${c ? c.acknowledged : void 0}'): ZERO is a statement \u2014 nobody but its author acknowledged it \u2014 and is legal; an absent count is silence (BIO_Publication \xA73 rule 11). An acknowledgement is never required to publish`,
        ["re-publish through op=publish, which lists every acknowledgement of the statement it publishes"]
      ));
    }
    if (!Array.isArray(fm?.completeness_acknowledgements)) {
      findings.push(f(
        C41.DISCLOSURES,
        "error",
        `a ${CASE_DOCUMENT_FORMAT} case document requires completeness_acknowledgements: an EMPTY list is a claim (nobody but the statement's author acknowledged it) and is legal \u2014 an ABSENT field is silence about who else read what this case leaves out (BIO_Publication \xA73 rule 11)`,
        ["re-publish through op=publish, which lists every acknowledgement of the statement it publishes"]
      ));
    }
    if (!c || !Object.prototype.hasOwnProperty.call(c, "statement_by") || !(c.statement_by === null || typeof c.statement_by === "string" && c.statement_by.trim())) {
      findings.push(f(
        C41.DISCLOSURES,
        "error",
        `a ${CASE_DOCUMENT_FORMAT} case document requires completeness.statement_by, the member who WROTE its exclusion statement \u2014 a different act, and a different name, from completeness.author, who prepared and published the case (BIO_Publication \xA73 rule 13). NULL is a statement (the plane could not establish who wrote the sentence) and is legal; an ABSENT key is silence, and a reader holding only the publisher's name reads two acts as one (got ${c ? JSON.stringify(c.statement_by ?? null) : void 0}${c && !Object.prototype.hasOwnProperty.call(c, "statement_by") ? ", with no such key" : ""})`,
        ["re-publish through op=publish, which carries the draft's server-stamped statement_by onto the document"]
      ));
    }
  }
  if (caseDocumentRequiresV4Disclosures(fm)) {
    const bm = fm?.bias_manifest;
    if (bm && typeof bm === "object" && !Array.isArray(bm)) {
      const list = fm?.bias_manifest_pins_proposed;
      const n = bm.pins_proposed;
      if (!Number.isInteger(n) || n < 0 || !Array.isArray(list)) {
        findings.push(f(
          C41.PENDING,
          "error",
          `a ${CASE_DOCUMENT_FORMAT} case document requires bias_manifest.pins_proposed (a count, zero legal) and bias_manifest_pins_proposed (a list, empty legal) beside its manifest (got count ${JSON.stringify(n ?? null)}, list ${Array.isArray(list) ? `of ${list.length}` : "absent"}): "no manifest was in force" is true of a scope whose only adoption pins a revision the group has proposed and not accepted, and a document silent about that adoption lets a reader take "a declaration was pending" for "nobody declared anything" (BIO_Publication \xA73 rule 18)`,
          ["re-publish through op=publish, which states every adoption of the scope pinning a proposed revision at signing"]
        ));
      } else if (list.length !== n) {
        findings.push(f(
          C41.PENDING,
          "error",
          `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest.pins_proposed says ${n} and its bias_manifest_pins_proposed lists ${list.length}: the count and the list are one fact stated twice, and a document disagreeing with itself about a pending adoption states neither`,
          ["re-publish through op=publish"]
        ));
      } else {
        const bad = list.filter((x) => !(x && typeof x === "object" && typeof x.bundle_id === "string" && x.bundle_id.trim() && typeof x.revision === "string" && /^[0-9a-f]{64}$/.test(x.revision) && (x.scope === "instance" || x.scope === "project")));
        if (bad.length > 0)
          findings.push(f(
            C41.PENDING,
            "error",
            `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest_pins_proposed has ${bad.length} row(s) not naming a bundle_id, a 64-hex revision and a scope of instance or project (first: ${JSON.stringify(bad[0])}): the ruling is that the document names the proposed revision the adoption pinned \u2014 its id \u2014 and a row without it says an adoption was pending without saying which`,
            ["re-publish through op=publish"]
          ));
        if (!(typeof bm.pins_proposed_stated === "string" && bm.pins_proposed_stated.trim()))
          findings.push(f(
            C41.PENDING,
            "error",
            `a ${CASE_DOCUMENT_FORMAT} case document's bias_manifest carries no pins_proposed_stated: the list is stated in a sentence as "no manifest was in force" is, because a bare count is a blank a reader must decode`,
            ["re-publish through op=publish"]
          ));
      }
    }
  }
  if (caseDocumentRequiresV4Disclosures(fm)) {
    const rows = fm?.case_citations;
    if (!Array.isArray(rows)) {
      findings.push(f(
        C41.CITATIONS,
        "error",
        `a ${CASE_DOCUMENT_FORMAT} case document requires case_citations, the case's citation edges each with the version it rests on (got ${JSON.stringify(rows ?? null)}): an EMPTY list is a claim (the project cited nothing) and is legal \u2014 an ABSENT field leaves a reader unable to say which version of anything the case cited (BIO_Publication \xA73 rule 18)`,
        ["re-publish through op=publish, which signs every cites edge of the project with its version"]
      ));
    } else {
      const bad = rows.filter((x) => !(x && typeof x === "object" && typeof x.target === "string" && x.target.trim() && CASE_CITATION_VERSIONS.includes(x.version) && (CITATION_NAMES_CAPTURE.has(x.version) ? typeof x.capture === "string" && /^[0-9a-f]{64}$/.test(x.capture) : x.capture === null || x.capture === void 0)));
      if (bad.length > 0)
        findings.push(f(
          C41.CITATIONS,
          "error",
          `a ${CASE_DOCUMENT_FORMAT} case document's case_citations has ${bad.length} row(s) that do not state a target and a version from {${CASE_CITATION_VERSIONS.join(", ")}}, with the 64-hex capture exactly where the version names one (first: ${JSON.stringify(bad[0])}): a citation edge that says it is pinned and omits the pin, or names a capture its version disowns, states a version nobody can verify`,
          ["re-publish through op=publish"]
        ));
    }
  }
  const srch = typeof fm?.searched === "object" && fm.searched || null;
  if (!srch) {
    findings.push(f(
      C41.COMPLETENESS,
      "error",
      "a case document requires a searched block beside its completeness block: a completeness claim with no record of what was looked for is prose with nothing behind it, which is what the search-completeness literature identifies as the claim worth least (D-196). An empty or negative answer is legal here \u2014 SILENCE is not",
      ["publish the searched section computed from the observation log over this case's own subjects"]
    ));
  } else {
    if (!Object.prototype.hasOwnProperty.call(SEARCHED_SUBJECT_SOURCES, String(srch.subject_source)))
      findings.push(f(
        C41.COMPLETENESS,
        "error",
        `a case document's searched.subject_source must name a source this record recognises (got '${srch.subject_source}'; known: ${Object.keys(SEARCHED_SUBJECT_SOURCES).join(", ")}). THE SUBJECT SET IS THE FENCE: a coverage section computed over the observation log's own subjects is 100% searched by construction with every row in it honest, and is a statement about the log rather than about this case`,
        ["compute the section over the case's own subjects \u2014 its members' basis legs and the content rows those legs name"]
      ));
    if (!Number.isInteger(srch.subjects) || srch.subjects < 0)
      findings.push(f(C41.COMPLETENESS, "error", `a case document's searched block requires an integer subject count (got '${srch.subjects}')`));
    if (!Array.isArray(fm?.searched_levels))
      findings.push(f(
        C41.COMPLETENESS,
        "error",
        "a case document requires a searched_levels field beside the searched block: an EMPTY list is a claim (this record could compute no level for this case) and is legal \u2014 an ABSENT field is silence about which levels were consulted",
        ["author searched_levels, empty if no level could be computed"]
      ));
  }
  if (!Array.isArray(fm?.completeness_excluded)) {
    findings.push(f(
      C41.EXCLUDED,
      "error",
      "a case document requires a completeness_excluded field: an EMPTY list is a claim (this case left nothing out) and is legal \u2014 an ABSENT field is silence, and silence about what a case excludes is what the completeness assertion exists to refuse",
      ["author completeness_excluded, empty if nothing was excluded"]
    ));
  }
  const rq = typeof fm?.required_strength === "object" && fm.required_strength || null;
  if (!rq || typeof rq.declared !== "boolean") {
    findings.push(f(
      C41.BAR,
      "error",
      'a case document requires required_strength with a declared flag: a case publishes the bar the group set for itself beside the strength each member reached, and an ABSENT bar is STATED as absent rather than shown as blank (DEC-17). An absent bar is not a bar of zero \u2014 a reader cannot tell "no bar was declared" from "nobody wrote this down"',
      ["declare the project bar with op=strengthbar, or publish with the bar stated absent"]
    ));
  } else if (rq.declared) {
    for (const axis of ["capture", "connection"]) {
      if (!Object.prototype.hasOwnProperty.call(rq, axis)) {
        findings.push(f(
          C41.BAR,
          "error",
          `required_strength.${axis} is absent \u2014 the declared bar is a PAIR per R2 and both keys are always written: an axis nobody set is written null, never omitted, because a reader cannot tell an omitted key from one nobody wrote down`,
          [`write required_strength.${axis}: null if the project set no bar on the ${axis} axis`]
        ));
      } else if (rq[axis] !== null && !BASIS_GRADES.includes(rq[axis])) {
        findings.push(f(C41.BAR, "error", `required_strength.${axis} '${rq[axis]}' is not one of: ${BASIS_GRADES.join(", ")}, or null for an axis nobody set \u2014 the declared bar is a PAIR per R2, because a scalar would re-collapse the two axes in the one field a reader is most likely to quote`));
      }
    }
    if (rq.capture === null && rq.connection === null) {
      findings.push(f(
        C41.BAR,
        "error",
        "required_strength is declared with no bar set on either axis \u2014 a declared bar that gates nothing claims a standard no axis holds; a case with no bar states declared: false",
        ["publish with the bar stated absent (declared: false), or declare a grade on at least one axis"]
      ));
    }
  }
  if (caseDocumentStatesMemberBlocks(fm)) {
    const members = Array.isArray(fm?.case_findings) ? fm.case_findings.map((x) => String(x)) : [];
    const rolesRows = Array.isArray(fm?.case_roles) ? fm.case_roles.filter((r) => r && typeof r === "object") : [];
    const rowsFor = (key, m) => (Array.isArray(fm?.[key]) ? fm[key] : []).filter((r) => r && typeof r === "object" && String(r.target ?? "") === m).map(({ target, ...rest }) => rest);
    if (!Array.isArray(fm?.case_strength)) {
      findings.push(f(
        "C-2.8",
        "error",
        "a case document requires a case_strength field: since BIO_Publication_v0_1.md \xA73 rule 12 each member's FROZEN STRENGTH PAIR is stated here, once, and not in the member's bytes \u2014 a case document silent about what its findings reached leaves a reader with no strength at all",
        ["re-publish through op=publish, which states each member's frozen pair in the case document"]
      ));
    }
    if (!Array.isArray(fm?.case_strength_grounds)) {
      findings.push(f(
        "C-2.8",
        "error",
        "a case document requires a case_strength_grounds field: an EMPTY list is a claim (no member's basis named grounds) and is legal \u2014 an ABSENT field is silence about the branches a structured grade was taken from",
        ["re-publish through op=publish, which states each member's frozen grounds in the case document"]
      ));
    }
    for (const m of members) {
      const row = rolesRows.find((r) => String(r.target ?? "") === m) || {};
      const basis = memberBasis && Object.prototype.hasOwnProperty.call(memberBasis, m) ? memberBasis[m] : void 0;
      const memberFm = {
        edition: row.edition,
        completeness: fm?.completeness,
        completeness_excluded: fm?.completeness_excluded,
        published_strength: rowsFor("case_strength", m),
        ...rowsFor("case_strength_grounds", m).length ? { published_strength_grounds: rowsFor("case_strength_grounds", m) } : {},
        ...Array.isArray(basis) ? { basis } : {}
      };
      const own = [];
      checkPublishedExtension(memberFm, own);
      for (const x of own) findings.push({ ...x, message: `case document, member ${m}: ${x.message}` });
    }
    if (typeof body === "string" && !/^## What This Excludes\s*$/m.test(body)) {
      findings.push(f(
        "C-3.1",
        "error",
        "required heading '## What This Excludes' is missing from the case document: since BIO_Publication_v0_1.md \xA73 rule 12 the case states what it excludes once, here, and not in any member's bytes",
        ["re-publish through op=publish, which writes the section into the case document"]
      ));
    }
  }
  if (priorCase && c) {
    if (typeof priorCase.statement === "string" && priorCase.statement === (c.statement ?? null))
      findings.push(f("C-21.1", "error", `the completeness statement is byte-identical to edition ${priorCase.edition}'s. Every edition is a separate document and states its own limits in its own words, as of its own date. If nothing about the limits changed, say THAT, as of this edition`));
    if (typeof priorCase.bias_acknowledgement === "string" && priorCase.bias_acknowledgement === (fm?.bias_acknowledgement ?? null))
      findings.push(f("C-21.1", "error", `the bias acknowledgement is byte-identical to edition ${priorCase.edition}'s. An acknowledgement of the bias a case was produced under is AUTHORED at the moment of export and never carried forward (DEC-46): reprinting the last edition's sentence is evidence nobody looked. Declaring a bias never blocks publication (DEC-20)`));
  }
  return findings;
}
var CONTENT_EXTENT_KINDS = {
  document: { landed: true, human: "the whole document" },
  "pdf-page": { landed: true, human: "a page of a PDF" },
  "sheet-cell": { landed: true, human: "a cell of a spreadsheet" },
  "slide-shape": { landed: true, human: "a shape on a slide" },
  "doc-para": { landed: true, human: "a paragraph of a document" },
  /* FW-19 / IC-125 — EXTRACTION-BREADTH §3.2's two arms and one reference,
     landed together because the design grows them together. `image` is a
     REFERENCE rather than an arm of IC-1's text union (§3.2's own table), and
     it sits in this map anyway because the content table's `extent_kind` is
     the one vocabulary a row is addressed in: an image cited as itself is
     content (§3.1) and a row must be able to say so. What makes it different
     is not its kind but `cited_as` — see `contentCitedAs` below. */
  "sheet-range": { landed: true, human: "a range of cells in a spreadsheet" },
  "doc-table": { landed: true, human: "a table in a document" },
  image: { landed: true, human: "an image in a document" }
};
var CONTENT_EXTENT_RANGE_RE = /^\$?[A-Za-z]{1,3}\$?[1-9][0-9]{0,6}(:\$?[A-Za-z]{1,3}\$?[1-9][0-9]{0,6})?$/;
function rangeCorners(range) {
  const t = String(range == null ? "" : range).trim();
  if (!CONTENT_EXTENT_RANGE_RE.test(t)) return null;
  const [a, b = a] = t.split(":");
  const p = a1ToRowCol(a), q = a1ToRowCol(b);
  if (!p || !q) return null;
  return {
    r0: Math.min(p.row, q.row),
    c0: Math.min(p.col, q.col),
    r1: Math.max(p.row, q.row),
    c1: Math.max(p.col, q.col)
  };
}
function a1Letters(n) {
  let out = "";
  for (let c = n; c > 0; c = Math.floor((c - 1) / 26)) out = String.fromCharCode(65 + (c - 1) % 26) + out;
  return out;
}
function canonicalRange(range) {
  const k = rangeCorners(range);
  if (!k) return null;
  return `${a1Letters(k.c0)}${k.r0}:${a1Letters(k.c1)}${k.r1}`;
}
function contentCitedAs(extent) {
  const e = extent && typeof extent === "object" ? extent : {};
  const v = e.cited_as;
  if (v === void 0 || v === null || v === "") return e.kind === "image" ? "bytes" : "text";
  return v;
}
var CONTENT_EXTENT_A1_RE = /^\$?[A-Za-z]{1,3}\$?[1-9][0-9]{0,6}$/;
function a1ToRowCol(cell) {
  const t = String(cell == null ? "" : cell).replace(/\$/g, "").toUpperCase();
  const m = /^([A-Z]{1,3})([1-9][0-9]{0,6})$/.exec(t);
  if (!m) return null;
  let col = 0;
  for (const ch of m[1]) col = col * 26 + (ch.charCodeAt(0) - 64);
  return { col, row: parseInt(m[2], 10) };
}
var CONTENT_EXTENT_KIND_NO_PRODUCER = "dom";
var CONTENT_EXTENT_CHECKS = {
  CONTENT_EXTENT_OUT_OF_RANGE: {
    check: "C-45.1",
    where: "checks/bio-checks.mjs checkContentExtent > is-content-extent",
    /* WIDENED BY REC-85 AND NOT REPLACED, because the FACT did not change: this
       code has always meant "the address falls outside the container's own
       extent", and a page set is one container's extent. A spreadsheet's sheets
       and their dimensions, a document's paragraph count and a deck's shape list
       are the same fact about three more containers, so they are this code and
       not a fifth one — minting a second code for a rule that already has one is
       how a vocabulary comes to hold two answers, which is the argument this
       family's own header makes about the machine-credential fence. */
    translation: "This citation points at a part of the document that is not there \u2014 a page, a sheet or cell, a paragraph, or a slide or shape that falls outside what this record holds of the document. A reference nobody can follow is worse than no reference: it looks like evidence and resolves to nothing. Check the address against the document as this record holds it \u2014 pages and paragraphs are counted from the start of the captured file, which is not always the number printed on it, and a sheet or slide the file renamed or removed is a real finding rather than a typo."
  },
  CONTENT_EXTENT_NO_CHAIN: {
    check: "C-45.2",
    where: "checks/bio-checks.mjs checkContentExtent > is-content-extent",
    translation: "Nothing in this record says where the text of this part of the document came from. Pointing at a passage means pointing at text somebody or something produced, and until this document has been read there is no passage to point at \u2014 only bytes nobody has opened. Capture or read the document first, then cite the part of it you mean."
  },
  CONTENT_EXTENT_UNREADABLE: {
    check: "C-45.3",
    where: "checks/bio-checks.mjs checkContentExtent > is-content-extent",
    translation: "This record cannot tell what part of the document this citation means. An address it cannot evaluate is treated as pointing at nothing rather than at everything \u2014 the generous reading would quietly let one checked paragraph stand behind a whole report."
  },
  CONTENT_EXTENT_NO_PRODUCER: {
    check: "C-45.4",
    where: "checks/bio-checks.mjs checkContentExtent > is-content-extent",
    translation: "Citing a region of a web page is not something this record can do yet. Nothing in it produces the addresses that would make such a citation checkable, so accepting one would record a pointer that resolves to nothing and looks exactly like one that works. Cite the captured page as a whole for now."
  },
  /* D-440 (EXTRACTION-BREADTH-DESIGN.md section 3.2; CLIENT-RENDERED.md
     "DESIGNED 2026-09-21"). An image's `{part}` names a media member of a
     CONTAINER's own bytes, and a web page, a PDF or a plain file has none. It
     is a sub-number of this family on C-45.5's rule (the family's subject is the
     ways the record could come to point at nothing), and it is NOT C-45.1: the
     part is not outside a list this record holds, there is no list to be outside
     of, because the document is not the kind that embeds one. Until D-440 this
     minted, stating nothing, whenever the capture held no image list. */
  CONTENT_EXTENT_NOT_A_CONTAINER: {
    check: "C-45.11",
    where: "checks/bio-checks.mjs checkContentExtent > is-content-extent",
    translation: "This citation points at an image embedded inside the document, and this document is not the kind that embeds files inside itself: it is a web page, a PDF or another plain file, not a Word, Excel, PowerPoint or OpenDocument file. An image shown beside a web page is a separate file the page only points at, so it is not in what this record captured of the page. If that image is your evidence, capture it at its own address as its own document and cite that document whole. An image drawn on a PDF page is cited by its page and position instead."
  },
  /* REC-84 / IC-84 (1): a leg may NAME the part it rests on, instead of
     describing it. The two refusals below are the two ways that name can be
     wrong, and both are facts only the store can establish — hence a store
     `where` and a REGION, on VERSION_FROZEN's and VERSION_LEG_UNRESOLVED's own
     precedent a few thousand lines up. The region moved with content's
     extraction (T5) to `#rowFor` in `src/content/index.mjs` (re-pointed T6, N97). */
  CONTENT_ROW_UNKNOWN: {
    check: "C-45.5",
    where: "src/content/index.mjs #rowFor > is-content-row",
    translation: "This citation names a specific part of a document, and this record holds no such part. That is not a typo the record can fix for you: the part is named by a code taken over the document, the passage and how its text was produced, so a code nothing answers to points at nothing at all. Cite the part by describing it \u2014 the page, the cell, the paragraph \u2014 and the record will find or create the entry for it."
  },
  CONTENT_ROW_NOT_THIS_TARGET: {
    check: "C-45.6",
    where: "src/content/index.mjs #rowFor > is-content-row",
    translation: 'This citation rests on one document and names a part of a different one. A reference that says "this document, that passage" is two claims that do not meet, and a reader following it would be shown material the citation never meant.'
  },
  /* REC-97 / IC-90 — THE FOUR WAYS THE ACT THAT WRITES A LEG CAN BE HANDED AN
       EXTENT IT MUST NOT WRITE, and every one of them exists because the
       alternative was already measured: until this item `op=cite` destructured
       seven named parameters and an `extent_kind` sent beside them WAS DROPPED IN
       SILENCE, so a member who chose a page got a leg resting on the whole
       document with nothing anywhere saying the choice went nowhere. A parameter
       nobody reads is a parameter nobody can refuse, and a silent drop is the
       D-21 class: a field authored in one place and honoured nowhere.
  
       THEY ARE IN THIS FAMILY AND NOT A NEW ONE, on REC-84's own rule two rows up
       (SK-1's floor rule) and on the same substantive ground: this family's
       subject is *the ways the record could come to point at nothing*, and an act
       that writes a leg the member did not describe is the widest of them. No new
       `node tools/mintid.mjs C` id: these are sub-numbers of an allocated family,
       exactly as C-45.5 and C-45.6 were.
  
       WHAT IS NOT HERE, DELIBERATELY. A leg whose extent is MALFORMED or names an
       unlanded kind is refused through `checkLegExtentGrammar` — REC-84's ONE
       checker, which this act ROUTES ITS COMPOSED LEG THROUGH and re-implements
       nothing of — and comes back under `BASIS_REFUSED`, which is `op=promote`'s
       own name for exactly that verdict. `suggest` set that precedent in words:
       *"one function answering twice should not answer under two names."* A fifth
       code here would be a second name for a refusal the record already has. */
  UNKNOWN_EXTENT_FIELD: {
    check: "C-45.7",
    where: "src/store.mjs cite > is-cite-extent",
    translation: "Part of what was sent with this citation names a field this act does not carry, so the record cannot tell what part of the document you meant. It is refused rather than ignored: a field that is accepted and quietly dropped leaves you with a citation that looks like the one you made and is not. The fields this act does take are listed beside the refusal."
  },
  EXTENT_NOT_APPLICABLE: {
    check: "C-45.8",
    where: "src/store.mjs cite > is-cite-extent",
    translation: "Which part of a document a citation rests on is something a QUESTION's basis records, and the thing citing here is a case. A case's citation names the document and has nowhere to put a page or a passage, so this one would be dropped rather than recorded \u2014 and a field stated in one place and honoured nowhere is how a record and the pages built from it drift apart."
  },
  EXTENT_ON_MANY: {
    check: "C-45.9",
    where: "src/store.mjs cite > is-cite-extent",
    translation: "A part of a document is a part of ONE document, and this citation would write a leg for several. Writing the same page or passage onto each of them would put claims in the record you never made \u2014 you named one part once. Cite the one document you mean this part of, and cite the rest separately."
  },
  BAD_EXTENT_VALUE: {
    check: "C-45.10",
    where: "src/store.mjs cite > is-cite-extent",
    translation: "One of the values describing which part of the document you mean cannot be written into the record as it stands \u2014 it is empty, too long, or contains a quotation mark, a backslash, a line break or a comment mark, and those characters would silently reshape the document rather than appear in it. It is declined instead of mangled."
  },
  /* D-420 — AN IMAGE CITED BY PAGE AND RECTANGLE WHERE THE PAGE PAINTS NO
     IMAGE. Not C-45.1: that code is "the address is outside the container" and
     this address is INSIDE it — the page exists and the rectangle is on it. What
     is wrong is the KIND the row would claim: an `image` row over a region the
     record holds as painting no image is a text-or-nothing region wearing an
     image's name. The figure comes from the record (the placements the
     structure op reported at acquire, EXTRACTION-BREADTH §3.3 item 2), and with
     no figure held the citation is admitted and the absence stated. C-45.12
     because D-440 holds C-45.11 in the same family (a sub-number of an
     allocated family, C-45.5's precedent — no `mintid C`). */
  CONTENT_EXTENT_NO_IMAGE_PAINTED: {
    check: "C-45.12",
    where: "checks/bio-checks.mjs checkContentExtent > is-content-extent",
    translation: 'This citation calls a region of the page an image, and the page paints no image there. When this document was captured the record listed every image each page draws and where, and none sits at this address \u2014 so a row saying "an image is here" would claim something the file does not show. If you meant the words in that region, cite it as a region of the page; if you meant a picture, pick it from the images the record lists for this page, which are named beside this refusal.'
  }
};
function refusal2(key, detail, extra = null) {
  const row = CONTENT_EXTENT_CHECKS[key] || CONNECTION_PAIR_CHECKS[key];
  return {
    ok: false,
    code: key,
    check: row.check,
    translation: row.translation,
    detail,
    ...extra && typeof extra === "object" ? extra : {}
  };
}
function legExtent(leg) {
  const l = leg && typeof leg === "object" ? leg : {};
  const kindRaw = l.extent_kind;
  const kind = kindRaw === void 0 || kindRaw === null || kindRaw === "" ? "document" : kindRaw;
  const out = { kind };
  if (typeof l.extent_ref === "string" && l.extent_ref.trim()) out.ref = l.extent_ref.trim();
  if (kind === "pdf-page") {
    if (l.extent_page !== void 0 && l.extent_page !== null) out.page = l.extent_page;
    if (l.extent_rect !== void 0 && l.extent_rect !== null) out.rect = l.extent_rect;
  }
  if (kind === "sheet-cell") {
    if (l.extent_sheet !== void 0 && l.extent_sheet !== null) out.sheet = l.extent_sheet;
    if (l.extent_cell !== void 0 && l.extent_cell !== null) out.cell = l.extent_cell;
  }
  if (kind === "slide-shape") {
    if (l.extent_slide !== void 0 && l.extent_slide !== null) out.slide = l.extent_slide;
    if (l.extent_shape !== void 0 && l.extent_shape !== null) out.shape = l.extent_shape;
  }
  if (kind === "doc-para") {
    if (l.extent_para !== void 0 && l.extent_para !== null) out.para = l.extent_para;
    if (l.extent_run !== void 0 && l.extent_run !== null) out.run = l.extent_run;
  }
  if (kind === "sheet-range") {
    if (l.extent_sheet !== void 0 && l.extent_sheet !== null) out.sheet = l.extent_sheet;
    if (l.extent_range !== void 0 && l.extent_range !== null) out.range = l.extent_range;
  }
  if (kind === "doc-table") {
    if (l.extent_table !== void 0 && l.extent_table !== null) out.table = l.extent_table;
    if (l.extent_cell !== void 0 && l.extent_cell !== null) out.cell = l.extent_cell;
  }
  if (kind === "image") {
    if (l.extent_part !== void 0 && l.extent_part !== null) out.part = l.extent_part;
    if (l.extent_page !== void 0 && l.extent_page !== null) out.page = l.extent_page;
    if (l.extent_rect !== void 0 && l.extent_rect !== null) out.rect = l.extent_rect;
  }
  if (l.extent_cited_as !== void 0 && l.extent_cited_as !== null && l.extent_cited_as !== "")
    out.cited_as = l.extent_cited_as;
  return out;
}
function legHasAuthoredExtent(leg) {
  const l = leg && typeof leg === "object" ? leg : {};
  for (const k of [
    "extent_kind",
    "extent_page",
    "extent_rect",
    "extent_ref",
    "extent_sheet",
    "extent_cell",
    "extent_slide",
    "extent_shape",
    "extent_para",
    "extent_run",
    /* FW-19 / IC-125 */
    "extent_range",
    "extent_table",
    "extent_part",
    "extent_cited_as"
  ]) {
    const v = l[k];
    if (v === void 0 || v === null || v === "") continue;
    return true;
  }
  return false;
}
var CONTENT_ID_RE = /^[0-9a-f]{64}$/;
var CONTENT_EXTENT_DOCUMENT_ONLY = Object.freeze({ known: false, chain: null, pageCount: null });
function canonicalExtent(extent) {
  const e = extent && typeof extent === "object" ? extent : {};
  if (e.kind === "document") return canonicalJson({ kind: "document" });
  if (e.kind === "pdf-page") {
    const ok = Array.isArray(e.rect) && e.rect.length === 4 && e.rect.every((n) => typeof n === "number" && Number.isFinite(n));
    const r = ok ? [
      Math.min(e.rect[0], e.rect[2]),
      Math.min(e.rect[1], e.rect[3]),
      Math.max(e.rect[0], e.rect[2]),
      Math.max(e.rect[1], e.rect[3])
    ] : null;
    return canonicalJson({ kind: "pdf-page", page: Number.isInteger(e.page) ? e.page : null, rect: r });
  }
  if (e.kind === "sheet-cell")
    return canonicalJson({
      kind: "sheet-cell",
      sheet: typeof e.sheet === "string" && e.sheet.trim() ? e.sheet.trim() : null,
      cell: typeof e.cell === "string" && CONTENT_EXTENT_A1_RE.test(e.cell.trim()) ? e.cell.trim().replace(/\$/g, "").toUpperCase() : null
    });
  if (e.kind === "slide-shape")
    return canonicalJson({
      kind: "slide-shape",
      slide: Number.isInteger(e.slide) ? e.slide : null,
      shape: Number.isInteger(e.shape) ? e.shape : null
    });
  if (e.kind === "doc-para")
    return canonicalJson({
      kind: "doc-para",
      para: Number.isInteger(e.para) ? e.para : null,
      run: Number.isInteger(e.run) ? e.run : null
    });
  if (e.kind === "sheet-range")
    return canonicalJson({
      kind: "sheet-range",
      sheet: typeof e.sheet === "string" && e.sheet.trim() ? e.sheet.trim() : null,
      range: typeof e.range === "string" ? canonicalRange(e.range) : null
    });
  if (e.kind === "doc-table")
    return canonicalJson({
      kind: "doc-table",
      table: Number.isInteger(e.table) ? e.table : null,
      cell: typeof e.cell === "string" && CONTENT_EXTENT_A1_RE.test(e.cell.trim()) ? e.cell.trim().replace(/\$/g, "").toUpperCase() : null
    });
  if (e.kind === "image") {
    const ok = Array.isArray(e.rect) && e.rect.length === 4 && e.rect.every((n) => typeof n === "number" && Number.isFinite(n));
    return canonicalJson({
      kind: "image",
      cited_as: contentCitedAs(e),
      part: typeof e.part === "string" ? e.part.trim().toLowerCase() : null,
      page: Number.isInteger(e.page) ? e.page : null,
      rect: ok ? [
        Math.min(e.rect[0], e.rect[2]),
        Math.min(e.rect[1], e.rect[3]),
        Math.max(e.rect[0], e.rect[2]),
        Math.max(e.rect[1], e.rect[3])
      ] : null
    });
  }
  return canonicalJson({ kind: e.kind ?? null, fields: e.fields ?? null });
}
function describeExtent(extent) {
  const e = extent && typeof extent === "object" ? extent : {};
  if (typeof e.ref === "string" && e.ref.trim()) return e.ref.trim();
  if (e.kind === "document") return "the whole document";
  if (e.kind === "pdf-page") {
    const human = Number.isInteger(e.page) ? e.page + 1 : null;
    if (human == null) return "a page of this document";
    return Array.isArray(e.rect) && e.rect.length === 4 ? `page ${human}, a region of it` : `page ${human}`;
  }
  if (e.kind === "sheet-cell") {
    const sheet = typeof e.sheet === "string" && e.sheet.trim() ? e.sheet.trim() : null;
    const cell = typeof e.cell === "string" && e.cell.trim() ? e.cell.trim() : null;
    if (sheet && cell) return `${sheet}!${cell}`;
    return "a cell of this spreadsheet";
  }
  if (e.kind === "doc-para")
    return Number.isInteger(e.para) ? `\xB6${e.para + 1}` : "a paragraph of this document";
  if (e.kind === "slide-shape")
    return Number.isInteger(e.slide) ? `slide ${e.slide}` : "a shape in this deck";
  if (e.kind === "sheet-range") {
    const sheet = typeof e.sheet === "string" && e.sheet.trim() ? e.sheet.trim() : null;
    const range = typeof e.range === "string" ? canonicalRange(e.range) : null;
    return sheet && range ? `${sheet}!${range}` : "a range of cells in this spreadsheet";
  }
  if (e.kind === "doc-table") {
    if (!Number.isInteger(e.table)) return "a table in this document";
    const cell = typeof e.cell === "string" && e.cell.trim() ? e.cell.trim().replace(/\$/g, "").toUpperCase() : null;
    return `table ${e.table + 1}${cell ? `, ${cell}` : ""}`;
  }
  if (e.kind === "image") {
    if (typeof e.part === "string" && e.part.trim()) return `image ${e.part.trim().toLowerCase().slice(0, 12)}`;
    if (Number.isInteger(e.page)) return `an image on page ${e.page + 1}`;
    return "an image in this document";
  }
  const row = CONTENT_EXTENT_KINDS[e.kind];
  return row ? row.human : "a part of this document the record cannot name";
}
function extentRelation(outer, inner) {
  const a = outer && typeof outer === "object" ? outer : null;
  const b = inner && typeof inner === "object" ? inner : null;
  if (!a || !b) return "unreadable";
  const landed = (k) => Object.prototype.hasOwnProperty.call(CONTENT_EXTENT_KINDS, k) && CONTENT_EXTENT_KINDS[k].landed;
  if (!landed(a.kind) || !landed(b.kind)) return "unreadable";
  const ca = JSON.parse(canonicalExtent(a));
  const cb = JSON.parse(canonicalExtent(b));
  if (JSON.stringify(ca) === JSON.stringify(cb)) return "same";
  if (ca.kind === "document") return "narrower";
  if (cb.kind === "document") return "wider";
  if (ca.kind !== cb.kind) return "disjoint";
  const byFine = (coarse, fine, inside) => {
    if (ca[coarse] == null || cb[coarse] == null) return "unreadable";
    if (ca[coarse] !== cb[coarse]) return "disjoint";
    const fa = ca[fine], fb = cb[fine];
    if (fa == null && fb != null) return "narrower";
    if (fa != null && fb == null) return "wider";
    if (fa == null && fb == null) return "same";
    if (inside) {
      if (inside(fa, fb)) return "narrower";
      if (inside(fb, fa)) return "wider";
    }
    return "disjoint";
  };
  if (ca.kind === "pdf-page")
    return byFine("page", "rect", (o, i) => i[0] >= o[0] && i[1] >= o[1] && i[2] <= o[2] && i[3] <= o[3]);
  if (ca.kind === "doc-para") return byFine("para", "run", null);
  if (ca.kind === "slide-shape") return byFine("slide", "shape", null);
  if (ca.kind === "sheet-cell") return byFine("sheet", "cell", null);
  return "unreadable";
}
var NARROW_CHECKS = {
  NARROW_NO_INQUIRY: {
    check: "C-50.1",
    where: "src/store.mjs #narrowSource > is-narrow-source",
    translation: "That request does not name a question this record holds and you can read. Making a citation more specific happens on a question's reading of its evidence, so it needs the question first."
  },
  NARROW_NO_SUCH_VERSION: {
    check: "C-50.2",
    where: "src/store.mjs #narrowSource > is-narrow-source",
    translation: "That question has no reading of its evidence by that name. A citation is made more specific in a NEW reading taken from an existing one, so the reading it starts from has to be named exactly as the question holds it."
  },
  NARROW_NO_SUCH_LEG: {
    check: "C-50.3",
    where: "src/store.mjs #narrowSource > is-narrow-source",
    translation: "That reading has no piece of evidence at the position named. Pieces are counted from zero, in the order the reading lists them."
  },
  NARROW_NO_PART: {
    check: "C-50.4",
    where: "src/store.mjs #narrowSource > is-narrow-source",
    translation: "That piece of evidence has no part to point at more precisely. It either rests on another question, which has no pages or passages, or on a document this record holds no copy of \u2014 and a part of something nobody captured cannot be named."
  },
  NARROW_NOT_A_MEMBER: {
    check: "C-50.5",
    where: "src/store.mjs narrow > is-narrow-extent",
    translation: "Making a citation more specific is a member's own act, done in their name. A machine may PROPOSE passages that look relevant, and they are listed for you to choose from, but choosing which passage is on point is a judgment a person signs for."
  },
  NARROW_NO_EXTENT: {
    check: "C-50.6",
    where: "src/store.mjs narrow > is-narrow-extent",
    translation: "That request does not say which part of the document the citation should point at. Name the part \u2014 a page, a region of a page, a cell, a paragraph or a slide \u2014 or choose one of the proposed passages by its content id."
  },
  NARROW_BAD_EXTENT: {
    check: "C-50.7",
    where: "src/store.mjs narrow > is-narrow-extent",
    translation: "The part named cannot be recorded as sent: it names a field this act does not take, a value that cannot be written into the record, a content id this record does not hold, or both a content id and a description of the same part. It is refused rather than guessed at, because a citation quietly re-read would not be the one you made."
  },
  NARROW_OTHER_CAPTURE: {
    check: "C-50.8",
    where: "src/store.mjs narrow > is-narrow-extent",
    translation: "The part named is not in the copy of the document this citation rests on. Pointing the citation at a different document, or at a later copy of the same one, is not making it more specific \u2014 it is moving it, and a citation is never moved except by its own separate act."
  },
  NARROW_NOT_NARROWER: {
    check: "C-50.9",
    where: "src/store.mjs narrow > is-narrow-claim",
    translation: "The part named is not inside what the citation already points at \u2014 it is the same part, a wider one, or a different place in the document. Making a citation more specific can only ever point it at LESS of the document than before; anything else would claim a precision nobody established."
  },
  NARROW_NAME: {
    check: "C-50.10",
    where: "src/store.mjs narrow > is-narrow-claim",
    translation: "The new reading needs a name of its own, one the question does not already use. The reading it starts from keeps its name and stays exactly as it was: changing an existing reading in place would move a citation somebody else may be relying on."
  },
  NARROW_NO_DESCRIPTION: {
    check: "C-50.11",
    where: "src/store.mjs narrow > is-narrow-claim",
    translation: "The new reading needs a short account of what changed and why \u2014 which citation now points at less of its document, and what makes that part the one that matters. That account is what a later reader has to go on."
  }
};
var TRANSCRIBE_CHECKS = {
  TRANSCRIBE_NOT_A_MEMBER: {
    check: "C-52.1",
    where: "src/content/index.mjs transcribe > is-transcribe-act",
    translation: "Transcribing is a person reading the page and typing what it says, in their own name. The credential that asked is an automated one: a machine reading of a page is OCR, which the record already carries and labels as such. Sign in and type it yourself."
  },
  TRANSCRIBE_NO_DOCUMENT: {
    check: "C-52.2",
    where: "src/content/index.mjs transcribe > is-transcribe-act",
    translation: "That request does not name a document this record holds and you can read. A transcription is of a part of a document, so it needs the document first."
  },
  TRANSCRIBE_NO_BYTES: {
    check: "C-52.3",
    where: "src/content/index.mjs transcribe > is-transcribe-act",
    translation: "This record holds no copy of that document, so there is no page to transcribe. A transcription is tied to the exact copy it was typed from, so the copy has to be captured first."
  },
  TRANSCRIBE_NO_PORTION: {
    check: "C-52.4",
    where: "src/content/index.mjs transcribe > is-transcribe-act",
    translation: "That request does not say which part of the document you transcribed. Select the page or the region you read \u2014 a transcription with no stated part would be read as covering the whole document, which is a claim you did not make."
  },
  TRANSCRIBE_PORTION_UNREADABLE: {
    check: "C-52.5",
    where: "src/content/index.mjs transcribe > is-transcribe-portion",
    translation: "The part you selected is one this record cannot yet check a transcription against \u2014 a spreadsheet cell, a paragraph or a slide shape, or an image cited as itself rather than as text. A second member could not attest a transcription of it, so it is refused rather than left unable ever to be checked. Select a page or a region of a page."
  },
  TRANSCRIBE_NO_TEXT: {
    check: "C-52.6",
    where: "src/content/index.mjs transcribe > is-transcribe-portion",
    translation: "The transcription is empty. Type what the selected part of the page says; nothing is filled in for you."
  },
  TRANSCRIBE_TEXT_TOO_LONG: {
    check: "C-52.7",
    where: "src/content/index.mjs transcribe > is-transcribe-portion",
    translation: "The transcription is longer than one passage this record stores. Select a smaller part of the page and transcribe it on its own; the parts can each be checked and cited."
  },
  TRANSCRIPTION_NOT_FOUND: {
    check: "C-52.8",
    where: "src/content/index.mjs #transcriptionOf > is-transcription-source",
    translation: "That request does not name a transcription this record holds and you can read. A transcription is named by the content id its own transcribe act returned."
  },
  TRANSCRIPTION_SELF_ATTEST: {
    check: "C-52.9",
    where: "src/content/index.mjs transcriptionAttest > is-transcription-attest",
    translation: "You typed this transcription, so you cannot be the one who attests it. An attestation is a SECOND person checking the text against the page; your own agreement with your own typing costs nothing and proves nothing. Ask another member to check it."
  }
};
var ATTRIBUTION_CHECKS = {
  ATTRIBUTION_NOT_A_MEMBER: {
    check: "C-92.1",
    where: "src/store.mjs attributeObservation > is-attribute-act",
    translation: "How a member's observation is attributed is that member's own choice. The credential that asked is an automated one, and it cannot make that choice for anybody. Sign in and choose it yourself."
  },
  ATTRIBUTION_NO_LEVEL: {
    check: "C-92.2",
    where: "src/store.mjs attributeObservation > is-attribute-act",
    translation: "No level was chosen. Choose what a published case shows of who said your observation: the group, the project, the cover the group knows you by, or your handle. Nothing is filled in for you."
  },
  ATTRIBUTION_LEVEL_UNKNOWN: {
    check: "C-92.3",
    where: "src/store.mjs attributeObservation > is-attribute-act",
    translation: "That is not one of the four levels. Choose group, project, cover or name."
  },
  ATTRIBUTION_NOT_AN_OBSERVATION: {
    check: "C-92.4",
    where: "src/store.mjs attributeObservation > is-attribute-author",
    translation: "That document is not a member's firsthand observation in this record, so there is no author whose choice this is. Attribution is chosen for observations only."
  },
  ATTRIBUTION_NOT_THE_AUTHOR: {
    check: "C-92.5",
    where: "src/store.mjs attributeObservation > is-attribute-author",
    translation: "Another member recorded that observation. Only the member who said it chooses how a published case shows who said it \u2014 not a project owner, not an administrator, and not a default."
  },
  ATTRIBUTION_AUTHOR_NOT_ACTIVE: {
    check: "C-92.6",
    where: "src/store.mjs attributeObservation > is-attribute-author",
    translation: "That observation's author is not an active member, and nobody chooses for them. The observation stays in the record and can be used where its author already chose, and nowhere new."
  },
  ATTRIBUTION_NOT_REACHED: {
    check: "C-92.7",
    where: "src/store.mjs attributeObservation > is-attribute-edition",
    translation: "No prepared case edition by that name rests on your observation. You choose an attribution for an edition that uses your words, once its case document has been prepared."
  },
  ATTRIBUTION_EDITION_RATIFIED: {
    check: "C-92.8",
    where: "src/store.mjs attributeObservation > is-attribute-edition",
    translation: "That edition is already signed, and a signed edition does not change. Your choice can apply to the next edition, which keeps your last choice until you change it."
  },
  /* PROVISIONAL (§4.6, carried to Bob): `name` publishes the member's HANDLE, because the record holds no
     legal name and must not start to. */
  ATTRIBUTION_NAME_NO_HANDLE: {
    check: "C-92.9",
    where: "src/store.mjs attributeObservation > is-attribute-edition",
    translation: "Choosing your name publishes the handle you appear under in this record, and you have none. Choose another level, or set a handle first."
  },
  /* PROVISIONAL (§4.4, carried to Bob): THE NARROW VETO. An edition reaching an unchosen observation is not
     signed, so each member has a veto over the use of their own words and over nothing else: the owner's
     recourse is an edition without the finding that rests on it. */
  ATTRIBUTION_UNCHOSEN: {
    check: "C-92.10",
    where: "src/index.mjs fetch > is-attribution-gate",
    translation: "This case edition uses a member's firsthand observation whose author has not yet chosen how it is attributed, so it cannot be signed. Publishing it at any level would be choosing for them. Ask the author to choose, or prepare the edition without the finding that rests on it."
  },
  ATTRIBUTION_STATEMENT_STALE: {
    check: "C-92.11",
    where: "src/index.mjs fetch > is-attribution-gate",
    translation: "This case document states an attribution for an observation that its author's choices no longer give. Prepare the case document again so it states what the authors chose, then sign that."
  },
  ATTRIBUTION_UNSTATED: {
    check: "C-92.12",
    where: "src/index.mjs fetch > is-attribution-ratify",
    translation: "This observation's words are published only beside a signed case that states whose they are, and no signed case does yet. Sign the case document that uses it first."
  }
};
var TESTIMONY_CHECKS = {
  TESTIMONY_NOT_A_MEMBER: {
    check: "C-53.1",
    where: "src/provenance/index.mjs testify > is-testify-act",
    translation: "A firsthand observation is a person saying what they saw, in their own name, and it stands on that person's trust. The credential that asked is an automated one, and it has no eyes to have seen anything with. Sign in and record it yourself."
  },
  TESTIMONY_AUTHOR_SUPPLIED: {
    check: "C-53.2",
    where: "src/provenance/index.mjs testify > is-testify-act",
    translation: "That request names who the author is. The record takes the author of an observation from the account that is signed in, never from the request \u2014 a request that names its own author could sign as somebody else. Send the observation without an author and it is recorded as yours."
  },
  TESTIMONY_NO_WORDS: {
    check: "C-53.3",
    where: "src/provenance/index.mjs testify > is-testify-words",
    translation: "The observation is empty. Write what you saw, in your own words; nothing is filled in for you."
  },
  TESTIMONY_WORDS_TOO_LONG: {
    check: "C-53.4",
    where: "src/provenance/index.mjs testify > is-testify-words",
    translation: "The observation is longer than one passage this record stores. Record it as more than one observation; each is kept exactly as written and each can be cited."
  },
  TESTIMONY_OBSERVED_AT_INVALID: {
    check: "C-53.5",
    where: "src/provenance/index.mjs testify > is-testify-words",
    translation: "An observation needs the date you saw it, as a calendar date (for example 2026-09-10) or a date and time, and not a date later than now. The record keeps that date apart from the moment you wrote it down, because they are two different facts."
  },
  /* NARROWED BY BOB #14's RULING (2026-09-18), NOT DELETED. This refused a
     second member's IDENTICAL words, because the register is keyed by bytes.
     The ruling: two identical observations are two testimonies, and the bytes
     carry a canonical header holding the testimony's own id — so identical
     words never collide. What is left is the case only an adversary produces:
     somebody registering, ahead of time, the exact bytes the NEXT testimony
     will have (the id is sequential, so it can be predicted). Recording over
     them would re-file their register row under the observation. */
  TESTIMONY_WORDS_REGISTERED: {
    check: "C-53.6",
    where: "src/provenance/index.mjs testify > is-testify-bytes",
    translation: "The record already holds, under another document, the exact bytes this observation would be stored as \u2014 which can only happen if somebody registered them in advance. Nothing was recorded. Try again: the next attempt is stored under a new identifier and new bytes."
  },
  TESTIMONY_ORIGIN_NOT_MEMBER: {
    check: "C-53.7",
    where: "src/provenance/index.mjs #testimonyFence > is-testimony-fence",
    translation: "This document is a member's own observation, and this revision of its record claims it came from somewhere else \u2014 a fetch, a sweep, or a machine. That would let a member's word pass for a captured publication. An observation's origin is the member who made it, and that cannot be revised."
  },
  TESTIMONY_AUTHORED_UNEARNED: {
    check: "C-53.8",
    where: "src/provenance/index.mjs #testimonyFence > is-testimony-fence",
    translation: "This document claims to be a member's own firsthand observation, but it did not come through the act that records one. Only that act can mark a document as an observation, because only that act takes the author from the signed-in account. Record the observation through it, or remove the claim."
  },
  TESTIMONY_AUTHORED_DROPPED: {
    check: "C-53.9",
    where: "src/provenance/index.mjs #testimonyFence > is-testimony-fence",
    translation: "This document is a member's own observation, and this revision no longer says so. Removing that would let a member's word read as a captured document. What the document is cannot be revised; to withdraw an observation, record a new one."
  },
  /* MK-1 (A) — THE PUBLICATION FENCE, measured before it was built
     (`test/mk1-publish-probe.mjs`): op=ratify on an observation whose bytes were
     in the working bucket PUBLISHED its words, its provenance document and the
     observer's handle; a finding resting on one, and a case over that finding,
     ratified. MEMBER-KNOWLEDGE-DESIGN.md §4 puts WHAT a published case may show
     of a member's observation at the attesting member's chosen level.
     LIFTED BY MK-7 AS ITS OWN ACT, AND NARROWED RATHER THAN DELETED: the three
     codes now refuse only an observation that still NAMES ITS AUTHOR in its own
     files — one written before MK-6 (§4.1: "Authored bundles written before the
     change carry the member id and STAY FENCED") — and what rests on one. No
     level can hide a name the bundle itself prints, because the level lives
     outside the bundle. Every other observation crosses under C-92. The old
     sentences said the record could not YET honour the choice; since MK-7 it
     can, so they would now be false, and they are corrected, not kept. */
  TESTIMONY_UNPUBLISHABLE: {
    check: "C-53.10",
    where: "src/index.mjs fetch > is-testimony-publish-bundle",
    translation: "This document is a member's own firsthand observation, recorded before the record stopped writing its author's name into the observation's own files. Publishing it would publish that name whatever level its author chose, so it is not published. Its author can record it again as a new observation, which names nobody in its files."
  },
  TESTIMONY_CITED_UNPUBLISHABLE: {
    check: "C-53.11",
    where: "src/index.mjs fetch > is-testimony-publish-bundle",
    translation: "This finding rests, directly or through another finding, on a member's firsthand observation recorded before the record stopped writing its author's name into the observation's own files, so it is not published. Rest the finding on a newer observation of the same thing, or publish it without that observation in its basis."
  },
  TESTIMONY_CASE_UNPUBLISHABLE: {
    check: "C-53.12",
    where: "src/index.mjs fetch > is-testimony-publish-case",
    translation: "A finding in this case rests, directly or through another finding, on a member's firsthand observation recorded before the record stopped writing its author's name into the observation's own files, so the case is not published: that name would be published whatever level its author chose. Rest the finding on a newer observation, or leave it out of this edition."
  },
  /* D-179 — ONE CAPTURE, ONE HOME, THE ORIGINAL's (BOB #26, 2026-09-22;
     `BIO_Intake_Doctrine_v1_1.md` §8). C-53.8 generalised from an authored
     observation to EVERY capture: `register` is keyed by `capture_sha`, so a
     promote registering bytes another bundle already holds would MOVE that
     bundle's row to the newcomer, silently. Kept in this family because it is
     the same fence at the same line, asked of every row rather than the authored
     one; C-53.8 still answers first for an authored capture, in its own words.
     The holding bundle is named only to a caller who may see it (D-15). */
  CAPTURE_HELD_BY_ANOTHER_BUNDLE: {
    check: "C-53.13",
    where: "src/provenance/index.mjs #testimonyFence > is-register-home",
    translation: "The record already holds this document, under another bundle. A document has one home in the record \u2014 the first bundle that registered it \u2014 and registering it again here would move it away from there. Nothing was written. Cite the bundle that holds it, or, if you found it at a new address, that sighting is already recorded as a corroboration of the one it holds."
  }
};
var LEAD_ID_RE = /^LEAD-\d{4}-\d{4}-[a-z0-9]+$/;
var LEAD_CHECKS = {
  LEAD_NOT_EVIDENCE: {
    check: "C-54.1",
    where: "checks/bio-checks.mjs leadLegFindings > is-lead-not-evidence",
    translation: "That leg points at a LEAD. A lead is somewhere to look \u2014 what a member was told or suspects \u2014 and it is never evidence, so nothing can rest on it. Follow the lead: if the look finds the document, capture it and cite THAT; if you saw the thing yourself, write it up as your own observation."
  }
};
var MEMBER_ID_CHECKS = {
  MEMBER_ID_RESERVED: {
    check: "C-55.1",
    where: "src/membership/index.mjs memberAdd > is-member-id-reserved",
    translation: "That member id is reserved. `admin` is the name this instance gives its founding administrator, and anything that checks whether someone is an administrator by name would read a member enrolled as `admin` as the founder. Nothing was written. Choose a different id for this person."
  }
};
var SIGNER_ENROLMENT_CHECKS = {
  SIGNER_MEMBER_NOT_ENROLLED: {
    check: "C-63.1",
    where: "src/membership/index.mjs #signerMemberBar > is-signer-member-attesting",
    translation: "That person has not enrolled yet. A signing key belongs to a member who has taken up their invitation and chosen a handle; until then this instance would refuse anything signed with it, so registering it now would put a key on the roster that cannot sign. Nothing was written. Send them their invitation link, and register the key once they have enrolled."
  },
  SIGNER_MEMBER_NOT_ACTIVE: {
    check: "C-63.2",
    where: "src/membership/index.mjs #signerMemberBar > is-signer-member-attesting",
    translation: "That member\u2019s membership is not active, so this instance would refuse anything signed with their key. Nothing was written. Reinstate the member first if they should be able to sign again."
  }
};
var CUSTODIAL_CHECKS = {
  NOT_AN_ADMIN: {
    check: "C-96.1",
    where: "src/membership/index.mjs #custodialBar > is-custodial-admin",
    translation: "Only an active administrator of this group can do that, and the account asking is not one of them here. The record reads who is asking from the signed-in session, never from the request. Nothing was changed."
  },
  BAD_MEMBER_ID: {
    check: "C-96.2",
    where: "src/membership/index.mjs memberAdd > is-member-add-id",
    translation: "A member id is 2 to 41 characters of lowercase letters, digits and dashes, and starts with a letter or a digit. Nothing was written. It is the name the record keeps for this person; the handle they sign in with is theirs to choose when they enrol."
  },
  NO_COVER: {
    check: "C-96.3",
    where: "src/membership/index.mjs memberAdd > is-member-add-shape",
    translation: "A cover is needed: the label you use to tell members apart. It need not be, and often should not be, a legal name. Nothing was written."
  },
  EXISTS: {
    check: "C-96.4",
    where: "src/membership/index.mjs memberAdd > is-member-add-shape",
    translation: "That id is already taken in this record, so nothing new was created under it. Choose a different id."
  },
  ADMINS_FIRST: {
    check: "C-96.5",
    where: "src/membership/index.mjs memberAdd > is-admins-first",
    translation: "This group needs a second administrator before it has any ordinary members, so that losing one person does not lose the group. Nothing was written. Invite this person as an administrator, or invite a second administrator first."
  },
  CONSENSUS_REQUIRED: {
    check: "C-96.6",
    where: "src/membership/index.mjs memberAdd > is-admin-consensus",
    translation: "This addition needs the agreement of everyone who must agree to it \u2014 every existing administrator, or for a project every existing owner \u2014 and not all of them have agreed yet, so it has not taken effect. The answer lists who has agreed and who it is still waiting on."
  },
  ADMIN_REQUIRES_VOTE: {
    check: "C-96.7",
    where: "src/membership/index.mjs memberSet > is-admin-requires-vote",
    translation: "An administrator cannot be deactivated by another administrator acting alone. Removing an administrator takes a majority of all administrators, in which the one facing removal is counted but does not vote. Nothing was changed."
  },
  BAD_KEY: {
    check: "C-96.8",
    where: "src/membership/index.mjs signerAdd > is-signer-key-shape",
    translation: "That is not a public key this group can register. It takes the base64 part of an ssh-ed25519 public key, the part that begins AAAA. Nothing was written."
  },
  TARGET_NOT_AN_ADMIN: {
    check: "C-96.9",
    where: "src/membership/index.mjs adminRemove > is-remove-target-admin",
    translation: "The member named is not an administrator, so there is no administrator to remove. An ordinary member is deactivated instead, which one administrator can do. Nothing was changed."
  },
  /* ---- T4 (legacy-checks, N44), 2026-09-27: MEMBERSHIP'S NEW ACTS (N18), SAID IN WORDS. ----
     Each code is minted at ONE site in `src/membership/index.mjs`. Those sites carry no DEC-49 region yet, and a
     whole-function `where` cannot serve: each function also refuses with codes held elsewhere (NOT_AN_ADMIN,
     NO_SUCH_MEMBER), which a whole-function site would judge as not this family's. So each `where` names the region
     membership is to mark around its one refusal; until it does, the guard reports the region missing, and the
     control plane's `dec49Decorate` already attaches the row at the wire. */
  /* Membership R10 (§4.5, §4.2): an administrator resigns only while more than two exist. */
  RESIGN_AT_TWO: {
    check: "C-96.10",
    where: "src/membership/index.mjs adminResign > is-admin-resign-floor",
    translation: "Administrative access here is always shared by at least two people, and there are no more than two administrators now, so none of them can step down yet. Nothing was changed. Once a third administrator has been added, you can resign and become an ordinary member."
  },
  /* Membership R11 (§4.8): the record of who holds hosting access names somebody. */
  NO_HOLDERS: {
    check: "C-96.11",
    where: "src/membership/index.mjs hostingAccessSet > is-hosting-access-holders",
    translation: "This records who holds access to the hosting account the group's instance runs in, and it named nobody. Write the people who hold that access. Nothing was written."
  },
  /* Membership R19 (§3, "Pairing"): whether a member's cover and handle are shown together is that member's
     decision, or an administrator's. */
  PAIRING_NOT_YOURS: {
    check: "C-96.12",
    where: "src/membership/index.mjs memberPairingSet > is-pairing-yours",
    translation: "Whether a member's cover is shown beside their handle is theirs to decide, or an administrator's, and you are neither for this member. Nothing was changed."
  }
};
var PROJECT_AUTHORITY_CHECKS = {
  PROJECT_ACT_NOT_A_PARTICIPANT: {
    check: "C-56.1",
    where: "src/membership/index.mjs projectAuthority > is-project-authority",
    translation: "Only someone working in this project can do that. You can see the project, but you have not joined it, and seeing a project does not let you change it \u2014 administrators included. Nothing was changed. Ask an owner of the project to invite you, then join it."
  },
  PROJECT_ACT_NOT_THE_OWNER: {
    check: "C-56.2",
    where: "src/membership/index.mjs projectAuthority > is-project-authority",
    translation: "Only an owner of this project can do that. You are not one of its owners, and seeing a project does not let you direct it \u2014 administrators included. Nothing was changed."
  }
};
var PROJECT_VISIBILITY_CHECKS = {
  PROJECT_SEEN_NOT_A_PARTICIPANT: {
    check: "C-70.1",
    where: "src/membership/index.mjs #existenceOnly > is-project-existence-only",
    translation: "This project can be found, but you are not one of its participants, so you cannot do that in it or see what is inside it. Nothing was changed. You can ask its owners to add you."
  },
  PROJECT_VISIBILITY_NOT_THE_OWNER: {
    check: "C-70.2",
    where: "src/membership/index.mjs projectVisibilitySet > is-project-visibility-owner",
    translation: "Only an owner of this project can choose whether it can be found. You are not one of its owners, and seeing a project does not let you direct it \u2014 administrators included. Nothing was changed."
  },
  PROJECT_VISIBILITY_UNKNOWN_SETTING: {
    check: "C-70.3",
    /* REC-197: the value check moved into one helper both doors ask (the owner's act and a creation's
       `visibility`), so this row names that helper's region and the code keeps ONE site. */
    where: "src/membership/index.mjs visibilitySettingRefusal > is-project-visibility-setting",
    translation: "A project is either discoverable or hidden, and nothing else. Nothing was changed. Choose one of the two."
  },
  PROJECT_DIRECTORY_NEEDS_A_MEMBER: {
    check: "C-70.4",
    where: "src/membership/index.mjs projectDirectory > is-project-directory-member",
    translation: "The list of projects you can ask to join is for a signed-in member. Sign in as yourself to see it."
  }
};
var PROJECT_JOIN_REQUEST_CHECKS = {
  PROJECT_REQUEST_NEEDS_A_MEMBER: {
    check: "C-95.1",
    where: "src/membership/index.mjs #noRequester > is-join-request-member",
    translation: "Asking to join a project, withdrawing that request and reading your own requests are things a signed-in member does for themselves. Sign in as yourself to do it. Nothing was changed."
  },
  PROJECT_REQUEST_NOT_OUTSIDE: {
    check: "C-95.2",
    where: "src/membership/index.mjs projectRequest > is-join-request-ask",
    translation: "You can already see this project, so there is nothing to ask. If you were invited, join it with its checkbox. Nothing was changed."
  },
  PROJECT_REQUEST_ALREADY_OPEN: {
    check: "C-95.3",
    where: "src/membership/index.mjs projectRequest > is-join-request-ask",
    translation: "You already have a request open to join this project. Its owners answer it; you can withdraw it and ask again. Nothing was changed."
  },
  PROJECT_REQUEST_NONE_OPEN: {
    check: "C-95.4",
    where: "src/membership/index.mjs #noOpenRequest > is-join-request-none-open",
    translation: "There is no open request to join here to act on. It may already have been answered, withdrawn or lapsed. Nothing was changed."
  },
  PROJECT_REQUEST_ANSWER_NOT_THE_OWNER: {
    check: "C-95.5",
    where: "src/membership/index.mjs projectRequestAnswer > is-join-request-answer",
    translation: "Only an owner of this project can grant or decline a request to join it. Administrators see requests and answer none. Nothing was changed."
  },
  PROJECT_REQUEST_UNKNOWN_ANSWER: {
    check: "C-95.6",
    where: "src/membership/index.mjs projectRequestAnswer > is-join-request-answer",
    translation: "A request to join is either granted or declined, and nothing else. Choose one of the two. Nothing was changed."
  },
  PROJECT_REQUEST_REQUESTER_INACTIVE: {
    check: "C-95.7",
    where: "src/membership/index.mjs projectRequestAnswer > is-join-request-answer",
    translation: "The member who asked is no longer active, so they cannot be invited. The request stays open; you can decline it. Nothing was changed."
  },
  PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT: {
    check: "C-95.8",
    where: "src/membership/index.mjs projectRequestAnswer > is-join-request-answer",
    translation: "The member who asked is already a participant of this project, so granting would invite nobody new. You can decline the request, or they can withdraw it. Nothing was changed."
  },
  PROJECT_REQUESTS_NOT_VISIBLE: {
    check: "C-95.9",
    where: "src/membership/index.mjs projectRequests > is-join-requests-project",
    translation: "A project's requests to join are seen by the people who asked, its owners and administrators. You can read your own requests without naming a project."
  }
};
var PROJECT_CREATION_VISIBILITY_CHECKS = {
  PROJECT_VISIBILITY_NO_OWNER: {
    check: "C-97.1",
    where: "src/promotion/index.mjs #promote > is-project-creation-ownerless",
    translation: "Whether a project can be found is chosen by its owners, and a project created by a machine credential has no owner, so it is created hidden and cannot be made discoverable here. Nothing was created. Create it without the setting; an owner who joins it later can make it discoverable."
  },
  PROJECT_VISIBILITY_NOT_A_CREATION: {
    check: "C-97.2",
    where: "src/promotion/index.mjs #promote > is-project-creation-visibility",
    translation: "Whether a project can be found is chosen when it is created or forked, and this was not a project being created. Nothing was changed. An owner changes an existing project's setting in its settings."
  }
};
var CASE_AUTHORITY_CHECKS = {
  CASE_SIGNER_NOT_AN_OWNER: {
    check: "C-57.1",
    /* REC-140 (2026-09-18): the region moved into `#caseAuthority`, the ONE helper both ratify
       paths call — `op=caseratify` for the case document and `op=ratify` for a finding a
       ratified case pins (Publication rule 2 as BOB #15 applied it to D-429). The TRANSLATION
       was corrected from "this case" to "a case, and each finding in it" at the same time,
       because the same code now answers at both acts and the old sentence was false at one. */
    where: "src/membership/index.mjs caseAuthority > is-case-signer-owner",
    translation: "A case and each finding in it are published in the project's name, so each has to be signed by an owner of that project. This signature belongs to someone who is not one of its owners. Nothing was committed. Ask an owner of the project to review it and sign it."
  }
};
var CASE_CONCLUSION_CHECKS = {
  CASE_CONCLUSION_MOVED: {
    check: "C-65.1",
    where: "src/store.mjs ratifyCaseDocument > is-caseratify-conclusion-moved",
    translation: "This case document records a conclusion its project no longer stands on: since the document was prepared, the project withdrew that conclusion or concluded again differently. Signing it would publish a conclusion nobody holds. Nothing was committed. Publish the case again from the project, so the document records what the project stands on now, and sign that."
  }
};
var SURFACE_CHECKS = {
  SURFACE_NO_RUN: {
    check: "C-66.1",
    where: "src/store.mjs #surfacingGate > is-surface-run",
    translation: "An assistant opens a question only inside an investigation it is running, and this one named none that can be read here. The investigation is what records the lens and the purpose the question was opened under, so without one nothing could say why it exists. Nothing was created."
  },
  SURFACE_RUN_NOT_RUNNING: {
    check: "C-66.2",
    where: "src/store.mjs #surfacingGate > is-surface-run",
    translation: "The investigation this question was to be opened inside has ended. A question is read against the conditions of the investigation that opened it, and those stopped being current when it stopped. Nothing was created; a member can start a new investigation."
  },
  SURFACE_NO_BOUND: {
    check: "C-66.3",
    where: "src/store.mjs #surfacingGate > is-surface-run",
    translation: "This investigation was not given a limit on how many questions it may open, so it may open none: an assistant opening questions without a limit fills the record with questions nobody asked for. The limit is set by the member who starts the investigation. Nothing was created."
  },
  SURFACE_BOUND_REACHED: {
    check: "C-66.4",
    where: "src/store.mjs #surfacingGate > is-surface-run",
    translation: "This investigation has already opened as many questions as the member who started it allowed. Nothing was created. The investigation ends at its next step and says which limit stopped it."
  },
  /* REC-179 (INVESTIGATIVE-SESSION.md §11 item 5, "Rule 2's reach", BOB #30; D-78's stated intent that a revision
     carries the value forward): `surfaced_by` records the SURFACING ACT, and that act happens once, at the
     creation — decided there by the server (D-78's restamp, or REC-173's verified replay). Measured before this
     existed (`0e7cc03e`): the restamp runs only on a creation and nothing compared a revision's value with the
     current version's, so a revision relabelled an assistant's question `human` (or a member's `agent`) and
     landed, and the rule-2 surfacing row REC-171 writes then contradicted the bytes it describes. Asked inside
     `promote`'s transaction AFTER the compare-and-swap (the current version is then the one the revision is
     based on) and BEFORE any write. The comparison is of the value the catalog's own parser reads out of each
     version's `bundle.md` — a respelling of the same value lands — and an unreadable or absent value is a value:
     a revision may not supply an origin its creation did not record, nor drop one it did. */
  SURFACED_BY_REWRITTEN: {
    check: "C-66.5",
    where: "src/store.mjs #promoteChecks > is-promote-surfaced-by, reached from op=promote through the step legacy-store registers with promotion (K31)",
    translation: "This revision changes who surfaced the question, a member or an assistant. That is recorded once, when the question is opened, and a later edit cannot rewrite it. Nothing was saved. Keep the value the current version carries and save the revision again."
  },
  /* D-512 (INVESTIGATIVE-SESSION.md §11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S", BOB #33's
     STEP (2)): `replay` exempts a promotion from every shape fence `promote` has, because a replay re-states the
     record's own past verbatim. D-511 (step 1) removed the flag from every caller but the ADMIN class with no
     session; this is the end state. A promotion of ANY type and ANY revision that asserts a replay names its
     drive-provenance capture, and `op=promote` verifies it against what the record HOLDS — the capture registered
     by this promotion, its bytes read back and hashed, and one preserved promotion record naming this bundle and
     listing this revision's `bundle.md` SHA-256 — never against the request's own claim (CLAUDE.md §5). Measured
     before this existed (`9f8b69e6`, `risk-tier.test.mjs` §8 arm (δ)): the admin deploy token sending `replay: true`
     with no provenance landed `risk_tier: 1` on an action nobody assessed. Asked in `op=promote`'s stamp block
     BEFORE the store is called, so nothing is written. The admin is refused rather than downgraded to an ordinary
     promotion, because the one honest sender (`migrate.mjs`) carries the past verbatim and an ordinary creation is
     rewritten on the way in. */
  REPLAY_UNVERIFIED: {
    check: "C-66.6",
    where: "src/index.mjs fetch > is-promote-replay-verified",
    translation: "This save says it is a replay of the record's own history, and the plane could not check that against the history it holds: the replay must name the provenance file for this document, already uploaded, whose records list this document and exactly this version of it. A replay is excused from the rules a new save must meet only when that check succeeds. Nothing was saved."
  }
};
var RATIFY_SCOPE_CHECKS = {
  RATIFY_PROJECT_BUNDLE: {
    check: "C-58.1",
    where: "src/index.mjs fetch > is-ratify-project-bundle",
    translation: "A project's own document is not published. A project publishes through its cases: publish a case from the project, have an owner sign the case document, and then ratify the findings in it. Nothing was published."
  },
  /* D-431 (2026-09-19, IC-161): `op=ratify` PUBLISHES NOTHING OUTSIDE A RATIFIED CASE
   * (BIO_Publication_v0_1.md §3 rule 2, the second note, BOB #16). REC-140 measured three
   * publications outside a case and pinned them as measured: an information bundle in no case, a
   * concluded inquiry in no case, and a finding prepared into a case whose document was not yet
   * ratified. Both codes are refused in `Store#publish`, in its transaction, before the edition
   * refusals and the retry, and ONE region carries both, because the one condition — no ratified
   * case pins this sha and none of their pinned findings rests on this bundle — is split only by
   * what the bundle IS. */
  RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE: {
    check: "C-58.2",
    where: "src/store.mjs publish > is-ratify-outside-a-case",
    translation: "A finding is published only as part of a case its project has ratified, and no ratified case holds this version of it. Publish it into a case from its project, have an owner of the project sign the case document first, and then ratify this finding at the version the case holds. Nothing was published."
  },
  RATIFY_NOT_EVIDENCE_OF_A_RATIFIED_CASE: {
    check: "C-58.3",
    where: "src/store.mjs publish > is-ratify-outside-a-case",
    translation: "This is published only as evidence for a case, and no finding in any ratified case rests on it. Cite it from a finding, publish that finding's case and have an owner of the project sign the case document; an owner of that project can then sign this. Nothing was published."
  }
};
var PROJECT_ID_CHECKS = {
  PROJECT_ID_SUPPLIED: {
    check: "C-59.1",
    where: "src/promotion/index.mjs #promote > is-project-id-supplied",
    translation: "A new project is given its id by the record; it is not chosen. This request named an id, so nothing was created. Send it again without one, and the record will answer with the id it gave the project."
  },
  PROJECT_ID_IN_BYTES: {
    check: "C-59.2",
    where: "src/promotion/index.mjs #promote > is-project-id-bytes",
    translation: "A new project's document must not carry an id line: the record writes the project's id into the document itself when it creates it. Remove the id line and send it again. Nothing was created."
  },
  PROJECT_FORK_ID_SUPPLIED: {
    check: "C-59.3",
    where: "src/promotion/index.mjs #fork > is-project-fork-id-supplied",
    translation: "A fork is given its id by the record; it is not chosen. This request named one, so nothing was forked. Send it again without an id, and the record will answer with the id it gave the fork."
  },
  PROJECT_DOCUMENT_UNREADABLE: {
    check: "C-59.4",
    where: "src/promotion/index.mjs #promote > is-project-id-bytes",
    translation: "The record could not write the new project's id into its document, because the document sent is not text that begins with a front matter block. Nothing was created."
  },
  /* REC-151 (Membership v2 §7, *"A MINTED ID CARRIES NO COUNT"*, BOB #16, 2026-09-19): an id of a GATED
     object (PROJ, CASE, DRAFT, RVG, TASK) is minted opaque by the act that creates it, and no caller
     allocates one — a counter read through op=allocid would say how many exist, hidden ones included. */
  ALLOCID_PREFIX_GATED: {
    check: "C-59.5",
    where: "src/record-core/index.mjs allocIdOp > is-allocid-prefix-gated",
    translation: "Ids of this kind are given by the record when the thing itself is created, and are not handed out in advance. Create the project, case, draft, grant or task through its own action and the record will answer with its id. Nothing was allocated."
  }
};
var QUOTE_CHECKS = {
  QUOTE_NOT_ON_RECEIVED: {
    check: "C-72.1",
    where: "src/store.mjs actionCorrespond > is-quote-grammar",
    translation: "A quote is what a body sent back, so it belongs on an entry recording something received. Record the reply as received and put the quote on it."
  },
  QUOTE_AMOUNT_NOT_A_NUMBER: {
    check: "C-72.2",
    where: "src/store.mjs actionCorrespond > is-quote-grammar",
    translation: "The amount is kept exactly as the body wrote it, but it has to read as a number \u2014 digits, with an optional decimal part and thousands separators. Otherwise it cannot be set beside another quote."
  },
  QUOTE_NO_CURRENCY: {
    check: "C-72.3",
    where: "src/store.mjs actionCorrespond > is-quote-grammar",
    translation: "A quote records the currency the body named. The record will not assume one, so say which currency the amount was quoted in."
  },
  QUOTE_ANSWERS_NO_SENT: {
    check: "C-72.4",
    where: "src/store.mjs actionCorrespond > is-quote-grammar",
    translation: "A quote answers a request, and this one names no earlier sent entry in this ledger. Record the request first, then name its position as the entry this quote answers."
  },
  QUOTE_REVISES_NO_QUOTE: {
    check: "C-72.5",
    where: "src/store.mjs actionCorrespond > is-quote-grammar",
    translation: "A revision names the earlier quote it changes, and the position given holds no quote. Both the original and the revision stay on the record, so the revision has to point at a real one."
  },
  QUOTE_TEXT_UNWRITABLE: {
    check: "C-72.6",
    where: "src/store.mjs actionCorrespond > is-quote-writable",
    translation: "The currency or the stated basis is too long, or holds a quotation mark, a backslash or a line break, which the record cannot store. Shorten it or leave those characters out."
  },
  QUOTE_READ_UNASKED: {
    check: "C-72.7",
    where: "src/store.mjs actionQuotes > is-quote-read-axis",
    translation: "Quotes are listed by the body that quoted them or by the request they answer. Name one of the two \u2014 not neither, and not both at once."
  },
  QUOTE_ANSWERS_NOT_AN_ORD: {
    check: "C-72.8",
    where: "src/store.mjs actionQuotes > is-quote-read-axis",
    translation: "A request is named by its position in the action's correspondence, which is a whole number counted from zero. Give that number to see only the quotes answering that request."
  }
};
var LIFECYCLE_CHECKS = {
  STAGE_NOT_OF_DIRECTION: {
    check: "C-94.1",
    where: "src/store.mjs actionCorrespond > is-lifecycle-grammar",
    translation: "That stage does not belong to this kind of entry. A request, a fee-waiver request, an appeal or a court filing is something sent; an acknowledgement, a fee estimate, a decision, an extension notice, a production or a denial is something received. A non-response carries no stage."
  },
  FOLLOWS_NO_ENTRY: {
    check: "C-94.2",
    where: "src/store.mjs actionCorrespond > is-lifecycle-grammar",
    translation: "Every stage after the request names the earlier entry it answers or follows, by its position in the correspondence counted from zero. Give the position of an entry already recorded."
  },
  APPEAL_NAMES_NO_DECISION: {
    check: "C-94.3",
    where: "src/store.mjs actionCorrespond > is-lifecycle-grammar",
    translation: "An appeal names the decision it appeals. The entry named is not a decision: record the decision as received with its outcome, then name it."
  },
  OUTCOME_NOT_ON_RECEIVED: {
    check: "C-94.4",
    where: "src/store.mjs actionCorrespond > is-lifecycle-grammar",
    translation: "An outcome, and the exemptions a body cited, are what the body sent back, so they belong on an entry recording something received."
  },
  OUTCOME_NOT_IN_VOCABULARY: {
    check: "C-94.5",
    where: "src/store.mjs actionCorrespond > is-lifecycle-grammar",
    translation: "An outcome is one of granted, denied, partial, reversed, affirmed, or none_stated when the body stated none."
  },
  DECISION_WITHOUT_OUTCOME: {
    check: "C-94.6",
    where: "src/store.mjs actionCorrespond > is-lifecycle-grammar",
    translation: "A decision carries its outcome as the body gave it. If the body stated none, record none_stated so the record says so rather than leaving it blank."
  },
  FEE_ESTIMATE_WITHOUT_QUOTE: {
    check: "C-94.7",
    where: "src/store.mjs actionCorrespond > is-lifecycle-grammar",
    translation: "A fee estimate is a quote: record the amount and the currency as quoted, and the request it answers."
  },
  DUE_HALF_STATED: {
    check: "C-94.8",
    where: "src/store.mjs actionCorrespond > is-lifecycle-grammar",
    translation: "A due date is stated together with the citation it comes from, or not at all. With none stated the record reads it as undetermined, which is honest."
  },
  DUE_NOT_A_DATE: {
    check: "C-94.9",
    where: "src/store.mjs actionCorrespond > is-lifecycle-grammar",
    translation: "A due date is written as a calendar date, YYYY-MM-DD."
  },
  DUE_CITE_NOT_GOVERNING: {
    check: "C-94.10",
    where: "src/store.mjs actionCorrespond > is-lifecycle-due-cite",
    translation: "A due date names the law it comes from, and that law must be one of those a member has stated govern this action. State the governing laws first, then cite one of them exactly as listed."
  },
  LIFECYCLE_TEXT_UNWRITABLE: {
    check: "C-94.11",
    where: "src/store.mjs actionCorrespond > is-lifecycle-writable",
    translation: "The exemptions or the citation is too long, or holds a quotation mark, a backslash or a line break, which the record cannot store. Shorten it or leave those characters out."
  }
};
var VERSION_NOTICE_CHECKS = {
  /* Neither subject, or both. There is no default: the notice is about a CITATION,
     and a notice answered for no citation, or for two at once, is a list the caller
     did not ask for wearing the word "notice". */
  VERSION_NOTICE_NO_SUBJECT: {
    check: "C-80.1",
    where: "src/store.mjs versionNotice > is-version-notice-subject",
    translation: "That request did not say which citation to check. Ask about one question (target=) to check every passage its evidence rests on, or about one passage (content=) \u2014 one of the two, not both and not neither."
  },
  /* The question named is not one this caller may read, or is not a question. */
  VERSION_NOTICE_NO_INQUIRY: {
    check: "C-80.2",
    where: "src/store.mjs versionNotice > is-version-notice-subject",
    translation: "There is no question by that id that you can read here. A question you may not see answers exactly as one that does not exist, so nothing about it was checked."
  },
  /* The passage named is not a content row this caller may read. Its `where` names content's `passageNotice`
     (content R29–R31, T5; N97, T6): the passage arm is content's. The store's `versionNotice` still answers the
     same condition inside `is-version-notice-subject`, one sentence true at both, until legacy-store's passage arm
     delegates to content (reported by T6's legacy-checks job). */
  VERSION_NOTICE_NO_CONTENT: {
    check: "C-80.3",
    where: "src/content/index.mjs passageNotice > is-passage-notice",
    translation: "There is no cited passage by that id that you can read here. A passage id exists once somebody has cited that part of a document; one in a project you were not invited to answers exactly as one that does not exist."
  }
};
var INSTANCE_GROUP_CHECKS = {
  GROUP_UNDETERMINED: {
    check: "C-64.1",
    where: "src/store.mjs #groupUndetermined > is-group-undetermined",
    translation: "This copy has not recorded which group it belongs to, and nothing in this request says, so the record cannot write a document that must name the group that produced it. A copy records its group once: when it is first installed, or by one act of whoever holds its administrator token in the hosting account. Nothing was written."
  },
  GROUP_SLUG_MALFORMED: {
    check: "C-64.2",
    where: "src/store.mjs instanceGroupSeed > is-instance-group-seed",
    translation: "A group is recorded by its short name, the same one the installer accepts: 3 to 40 lowercase letters, digits and hyphens, beginning and ending with a letter or a digit. Nothing was recorded."
  },
  GROUP_ALREADY_RECORDED: {
    check: "C-64.3",
    where: "src/store.mjs instanceGroupSeed > is-instance-group-seed",
    translation: "This copy's group is already recorded, and it is recorded once: the name travels inside every document the record has signed, so a second name would make those documents name a producer they were not written under. Nothing was changed."
  },
  /* REC-164 — BIO_Publication_v0_1.md §7 points 2 and 3: the display name and the domain are set by an
     administrator's own signed-in session, and the record names who set each one. */
  GROUP_IDENTITY_NEEDS_SESSION: {
    check: "C-64.4",
    where: "src/index.mjs fetch > is-group-identity-session",
    translation: "The name this group shows the public, and the web address it claims, are set by one of its administrators, and the record names who set each one. The credential that asked here is one of the operator's access tokens for this copy, not a person, so it cannot be that administrator. Sign in as the administrator and set it from there. Nothing was changed."
  },
  GROUP_IDENTITY_NOT_ADMIN: {
    check: "C-64.5",
    where: "src/store.mjs #groupIdentityGate > is-group-identity-admin",
    translation: "Only one of the group's administrators can set the name it shows the public or the web address it claims. The person signed in here is not one of its active administrators. Nothing was changed."
  },
  GROUP_DISPLAY_NAME_MALFORMED: {
    check: "C-64.6",
    where: "src/store.mjs groupNameSet > is-group-display-name",
    translation: "A display name is the group's own words for itself: some text, at most 120 characters, on one line. It is always shown beside the group's short name and never instead of it. Nothing was changed."
  },
  GROUP_DOMAIN_MALFORMED: {
    check: "C-64.7",
    where: "src/store.mjs groupDomainSet > is-group-domain",
    translation: "A web address is claimed by its bare domain name, like example.org: no https://, no path and no port. The claim is then checked by reading a file the domain itself serves, and the public sees the domain only while that check passes. Nothing was changed."
  }
};
function withProducingGroup(text, slug) {
  if (typeof text !== "string" || typeof slug !== "string" || !slug) return text;
  if (parseFrontmatter(text).data?.group === slug) return text;
  const lines = text.split("\n");
  if (lines[0] !== "---") return text;
  const end = lines.indexOf("---", 1);
  if (end === -1) return text;
  for (let i = 1; i < end; i++)
    if (lines[i].startsWith("group:")) {
      lines[i] = `group: ${slug}`;
      return lines.join("\n");
    }
  return [...lines.slice(0, end), `group: ${slug}`, ...lines.slice(end)].join("\n");
}
function leadLegFindings(label, leg, findings) {
  const l = leg && typeof leg === "object" ? leg : {};
  const refusal4 = (code, message, repairs) => f(LEAD_CHECKS[code].check, "error", message, repairs, code);
  for (const field of ["target", "content_id"]) {
    const v = typeof l[field] === "string" ? l[field].trim() : "";
    if (v && LEAD_ID_RE.test(v)) {
      findings.push(refusal4(
        "LEAD_NOT_EVIDENCE",
        `${label}.${field} '${v}' is a LEAD, and a lead is never evidence (MEMBER-KNOWLEDGE-DESIGN.md \xA75, \xA77): it says where to look, not what was found, so no leg can rest on it`,
        [
          "follow the lead and cite the document the look captured instead",
          "or, if you saw the thing yourself, author it as your own observation and cite that"
        ]
      ));
      return true;
    }
  }
  return false;
}
var THEME_ID_RE = /^THEME-\d{4}-\d{4}-[a-z0-9]+$/;
var THEME_REF_RE = /^THEME-\d{4}-\d{4}-[a-z0-9]+(?:[#/:?].*)?$/;
var THEME_LEG_KEYS = ["theme", "themes"];
var STATEMENT_ACK_CHECKS = {
  /* D-507 / IC-270 — THE SIX REFUSALS THAT REACHED A MEMBER AS MACHINE WORDS. UI-89's worker measured it
     at the surface: of the seven conditions `acknowledgeStatement` refuses on, only C-82.1 above held a
     row, so the other six arrived carrying the plane's authored `detail` and NO canned translation, which
     is the state DEC-49 exists to make impossible (`BIO_Assistant_and_AI_Roles_v0_1.md` rule 10). The
     obstacle was the same STRUCTURAL one D-484 met at `NO_BASIS`: a row holds ONE `where` naming the
     SMALLEST SPAN in which its refusal is enforced, and `acknowledgeStatement`'s `refusal` helper stood
     BELOW all six, so none of them could be built through it and none could honestly hold a row. The six
     returns now go through the helper, each inside its own DEC-49 region, and each carries the sentence
     below beside its unchanged `reason` and `detail`.
     THE WORDS ARE BOB #33's, approved 2026-09-24 and used verbatim. One was checked against the code and
     is right rather than narrow: C-82.5 says "This draft", and the case-DOCUMENT door cannot reach it —
     `publishCase` refuses `NO_STATEMENT` (region `is-publish-statement`) before authoring any document, so
     every case document in the store carries a non-empty `completeness.statement` and the draft door is
     the only one that reaches an empty one. */
  STATEMENT_ACK_NO_SUBJECT: {
    check: "C-82.2",
    where: "src/store.mjs acknowledgeStatement > is-statement-ack-subject",
    translation: "Say which statement you are acknowledging: a draft case, or a case document, by its case and edition, that has been written but not yet signed."
  },
  STATEMENT_ACK_ALREADY_SIGNED: {
    check: "C-82.3",
    where: "src/store.mjs acknowledgeStatement > is-statement-ack-signed",
    translation: "This edition of the case is already signed, and the signature covers its list of who acknowledged the statement, so a new acknowledgement could not appear in it. A signed edition is corrected only by publishing the next edition."
  },
  STATEMENT_ACK_NOT_A_PARTICIPANT: {
    check: "C-82.4",
    where: "src/store.mjs acknowledgeStatement > is-statement-ack-participant",
    translation: "Only someone who has joined the project that makes this case, or someone given a review copy of it, can acknowledge its statement. Being able to see a project is not the same as having joined it: an invited member who has not joined yet, and an administrator, cannot acknowledge it."
  },
  STATEMENT_ACK_NO_STATEMENT: {
    check: "C-82.5",
    where: "src/store.mjs acknowledgeStatement > is-statement-ack-statement",
    translation: "This draft does not yet say what its case leaves out, so there is nothing to acknowledge. Once an editor of the draft writes that statement, you can acknowledge it."
  },
  STATEMENT_ACK_BY_ITS_AUTHOR: {
    check: "C-82.6",
    where: "src/store.mjs acknowledgeStatement > is-statement-ack-by-its-author",
    /* CONDUCT #20 at c20-batch23: REC-212 sends a SECOND person through this code — the member who PUBLISHED the
       case, who did not write its statement (§3 rule 13) — and the D-507 sentence told them "You wrote this
       statement", which is false of them. Generalised at the union to be true of both; the words go to BOB #33,
       who approved the originals, to confirm or replace. */
    translation: "You wrote this statement or published this case, so you have already read it. An acknowledgement means a second person has read what the case leaves out, so it has to come from someone else: another participant in the project, or a reader given a review copy. The case can be published without one, and will say so."
  },
  STATEMENT_ACK_AUTHOR_UNDETERMINED: {
    check: "C-82.7",
    where: "src/store.mjs acknowledgeStatement > is-statement-ack-author-undetermined",
    /* CONDUCT #20 at c20-batch23: REC-212 reaches this code from a CASE DOCUMENT that states its writer could not
       be established, where "this draft" and "ask an editor to save it again" are both false. Generalised at the
       union to name both routes; to BOB #33 with the other. */
    translation: "The record does not say who wrote this statement, so it cannot tell whether you are its author. For a draft, ask an editor of the project to save the statement again; for a published case, it can be published again from a draft that records who wrote it. You can acknowledge it after that. The case can be published either way."
  }
};
var REVIEW_COPY_CHECKS = {
  NO_REVIEW_COPY: {
    check: "C-87.1",
    where: "src/store.mjs #noReviewCopy > is-no-review-copy",
    translation: "No review copy answers to this request. A review copy is read through the grant issued for it, or by a member with standing in the project that produced it. A grant that was withdrawn, one whose draft has moved on to another edition, and one that never existed all answer the same way, so this answer tells you nothing about which of those is the case."
  },
  REVIEW_UNKNOWN_ACT: {
    check: "C-87.2",
    where: "src/store.mjs reviewAct > is-review-unknown-act",
    translation: "That is not one of the things you can do to a review copy. There are three: draft the case that will be shown, grant someone a copy to read, and withdraw a grant you issued."
  },
  REVIEW_NOT_PROJECT_OWNER: {
    check: "C-87.3",
    where: "src/store.mjs #notReviewOwner > is-review-authority",
    translation: "You do not hold this act's authority over this project. Drafting the case needs permission to edit the project's work; handing the draft to someone outside the group, and withdrawing a copy you handed over, are the project owner's own acts. A project, draft or grant you hold no such authority over is answered exactly as one that does not exist, so this answer does not tell you whether it is there."
  },
  REVIEW_NO_PROJECT: {
    check: "C-87.4",
    where: "src/store.mjs #caseDraft > is-review-no-project",
    translation: "Say which project this draft belongs to. A draft case is a piece of a project's work, the same as a published case is, and it is not held by anybody until it names one."
  },
  REVIEW_DRAFT_CHANGES_PROJECT: {
    check: "C-87.5",
    where: "src/store.mjs #caseDraft > is-review-draft-changes-project",
    translation: "This draft belongs to a different project, and a case does not change hands. If the other project should be making this case, draft it there as a case of its own."
  },
  REVIEW_NO_SUCH_CASE: {
    check: "C-87.6",
    where: "src/store.mjs #caseDraft > is-review-no-such-case",
    translation: "This project has published no case by that name. A draft may name an existing case, which makes the draft that case's next edition; a case another project published is answered exactly as one that does not exist. Leave the name off and the draft is a new case."
  },
  REVIEW_DRAFT_TOO_LARGE: {
    check: "C-87.7",
    where: "src/store.mjs #caseDraft > is-review-draft-too-large",
    translation: "This draft's arguments are larger than the plane will store: the limit is 64 KiB, the same size publishing the case would accept. Nothing was saved. Material this large belongs in the documents and content the case rests on rather than in the draft itself."
  },
  REVIEW_NO_RECIPIENT: {
    check: "C-87.8",
    where: "src/store.mjs #reviewGrant > is-review-recipient",
    translation: "Say who this copy is for, in one line. Handing a draft to someone is an addressed act: the record says who it went to, and a grant addressed to nobody would leave no such record."
  },
  REVIEW_NO_SECRET: {
    check: "C-87.9",
    where: "src/store.mjs #reviewGrant > is-review-secret",
    translation: "The reading secret that would let this recipient open the copy was not set. That secret is made for you when the grant is issued, so this is a fault in the request rather than something you supply; nothing was issued. Try issuing the grant again."
  },
  REVIEW_NO_GRANT: {
    check: "C-87.10",
    where: "src/store.mjs #reviewRevoke > is-review-grant-named",
    translation: "Say which grant to withdraw, by the id you were given when it was issued. Nothing was withdrawn. This answer says only that no grant was named; it says nothing about which grants exist."
  },
  REVIEW_NO_COMMENT_TEXT: {
    check: "C-87.11",
    where: "src/store.mjs reviewComment > is-review-comment-text",
    translation: "A comment has to say something, and at most 4000 characters of it. Nothing was recorded. What you have written is still yours to send once it is within that length."
  }
};
var THEME_CHECKS = {
  THEME_NOT_EVIDENCE: {
    check: "C-81.1",
    where: "checks/bio-checks.mjs themeLegFindings > is-theme-not-evidence",
    translation: "That leg rests on a THEME. A theme is one member's declared lens \u2014 an idea they use to gather material \u2014 and it is never the basis of a claim, so nothing can rest on it or on a document's membership in it. Cite the document or the passage itself: what a finding rests on is content, whatever theme led you to it."
  },
  THEME_NOT_A_MEMBER: {
    check: "C-81.2",
    where: "src/connections/themes.mjs declare > is-theme-declare",
    translation: "A theme is declared by a person, in their own name, and every reading of it shows whose lens it is. The credential that asked is an automated one, which has nobody behind it to hold the idea. Sign in and declare it yourself."
  },
  THEME_NO_TEST: {
    check: "C-81.3",
    where: "src/connections/themes.mjs declare > is-theme-declare",
    translation: "A theme needs its TEST: one sentence a document or a passage either passes or fails, so any member can check a placement against it. Without one the theme is a label anything could wear, and it cannot be declared."
  },
  THEME_NO_NAME: {
    check: "C-81.4",
    where: "src/connections/themes.mjs declare > is-theme-declare",
    translation: 'A theme needs its idea in a few words \u2014 what you are calling it, such as "deferred maintenance" \u2014 as well as its test. Nothing was declared.'
  },
  THEME_TOO_LONG: {
    check: "C-81.5",
    where: "src/connections/themes.mjs declare > is-theme-declare",
    translation: "The theme's name or its test is longer than the record stores in one passage. It was refused rather than cut, so nothing you wrote is silently lost. Shorten it and declare it again."
  },
  THEME_NOT_FOUND: {
    check: "C-81.6",
    where: "src/connections/themes.mjs #themeFor > is-theme-source",
    translation: "No theme is recorded under that id. Use the id the declaration returned, or list the themes to find it."
  },
  THEME_PLACEMENT_NOT_A_MEMBER: {
    check: "C-81.7",
    where: "src/connections/themes.mjs place > is-theme-place",
    translation: "Placing a document in a theme is a member's judgement that it passes the theme's test, recorded in their name. An automated credential may only PROPOSE a placement, which stays a hunch until a member confirms it. Sign in to place it, or propose it instead."
  },
  THEME_TARGET_NOT_FOUND: {
    check: "C-81.8",
    where: "src/connections/themes.mjs #targetFor > is-theme-target",
    translation: "Nothing you can see in the record answers to that document or passage id, so it cannot be placed in a theme. Name a document by its id, or a passage by the content id it was minted under."
  },
  THEME_REASON_TOO_LONG: {
    check: "C-81.9",
    where: "src/connections/themes.mjs #targetFor > is-theme-target",
    translation: "The note on this placement is longer than the record stores in one passage. It was refused rather than cut. Shorten it and try again."
  },
  THEME_NO_PROPOSER: {
    check: "C-81.10",
    where: "src/connections/themes.mjs propose > is-theme-propose",
    translation: "A proposal must say who proposed it, and this one arrived carrying nobody. The record stamps the proposer from the credential that asked; nothing was written."
  },
  /* connections R43, R62 (K152; T6, legacy-checks): TAKING A PLACEMENT BACK, OR TURNING A PROPOSAL DOWN
  (`op=themewithdraw`). CONNECTIONS #1 (T5) minted these four and held them in `src/connections/themes.mjs`
  (`THEME_WITHDRAW_CHECKS`), in this family's shape, until the catalogue carried them; they are carried here
  word for word, so connections' next job re-exports them from here and deletes its copy. The order at the
  act: the actor (C-81.11), then C-81.6, C-81.8 and C-81.9, then no reason, nothing standing, not the placer. */
  THEME_WITHDRAW_NOT_A_MEMBER: {
    check: "C-81.11",
    where: "src/connections/themes.mjs withdraw > is-theme-withdraw",
    translation: "Taking a document or a passage out of a theme, or turning down a proposal, is a member's own judgement, done in their name. A machine may propose a placement; it cannot take one back."
  },
  THEME_WITHDRAW_NO_REASON: {
    check: "C-81.12",
    where: "src/connections/themes.mjs withdraw > is-theme-withdraw-standing",
    translation: "Say why. A placement taken back or a proposal turned down keeps its reason beside it, so the next reader of the theme can see what was judged and on what ground."
  },
  THEME_WITHDRAW_NOTHING_STANDING: {
    check: "C-81.13",
    where: "src/connections/themes.mjs withdraw > is-theme-withdraw-standing",
    translation: "Nothing stands in this theme at that document or passage: it was never placed or proposed there, or it has already been taken back. There is nothing to withdraw."
  },
  THEME_WITHDRAW_NOT_THE_PLACER: {
    check: "C-81.14",
    where: "src/connections/themes.mjs withdraw > is-theme-withdraw-standing",
    translation: "A membership is taken back by the member who placed it, or by an administrator. Any member may turn down a proposal, but another member's placement stands on their judgement until they withdraw it."
  }
};
function themeLegFindings(label, leg, findings) {
  const l = leg && typeof leg === "object" ? leg : {};
  const refusal4 = (code, message, repairs) => f(THEME_CHECKS[code].check, "error", message, repairs, code);
  const REPAIRS = [
    "cite the document or the passage itself \u2014 the theme is how you found it, not what it shows",
    "or leave the theme out of the leg: membership in a theme is never a reason a leg counts"
  ];
  for (const field of ["target", "content_id"]) {
    const v = typeof l[field] === "string" ? l[field].trim() : "";
    if (v && THEME_REF_RE.test(v)) {
      findings.push(refusal4(
        "THEME_NOT_EVIDENCE",
        `${label}.${field} '${v.slice(0, 80)}' names a THEME${THEME_ID_RE.test(v) ? "" : " membership"}, and a theme is never the basis of a claim (BIO_Content_Framework_v0_10.md \xA78.4, fence 4): it is a member's declared lens, not evidence, so no leg can rest on it or on membership in it`,
        REPAIRS
      ));
      return true;
    }
  }
  for (const key of THEME_LEG_KEYS) {
    const v = l[key];
    const named = typeof v === "string" ? v.trim() !== "" : Array.isArray(v) ? v.length > 0 : v != null && v !== false;
    if (named) {
      findings.push(refusal4(
        "THEME_NOT_EVIDENCE",
        `${label}.${key} claims the leg through a THEME, and membership in a theme is never a reason a leg counts (BIO_Content_Framework_v0_10.md \xA78.4, fence 4): the leg rests on its target or on nothing`,
        REPAIRS
      ));
      return true;
    }
  }
  return false;
}
function checkContentExtent(extent, ctx = {}) {
  const e = extent && typeof extent === "object" ? extent : null;
  if (!e)
    return refusal2(
      "CONTENT_EXTENT_UNREADABLE",
      `no extent was supplied and none could be read from the leg`
    );
  if (e.kind === CONTENT_EXTENT_KIND_NO_PRODUCER)
    return refusal2(
      "CONTENT_EXTENT_NO_PRODUCER",
      `extent kind 'dom' names a region of an HTML document. Nothing in this plane produces a dom address yet (CONTENT-HTML), so a row minted against one would be an address into a grammar no producer writes and no reader can evaluate`
    );
  const row = CONTENT_EXTENT_KINDS[e.kind];
  if (!row)
    return refusal2(
      "CONTENT_EXTENT_UNREADABLE",
      `extent kind '${String(e.kind).slice(0, 40)}' is not one of: ${Object.keys(CONTENT_EXTENT_KINDS).join(", ")}`
    );
  if (!row.landed)
    return refusal2(
      "CONTENT_EXTENT_UNREADABLE",
      `extent kind '${e.kind}' (${row.human}) is named in the grammar and this plane cannot yet evaluate what it covers, so it mints nothing. The pdf-page and document arms landed with REC-82 and the other three follow with REC-85`
    );
  if (e.kind === "pdf-page") {
    if (!Number.isInteger(e.page) || e.page < 0)
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a pdf-page extent names which page, as a 0-based integer. This one names '${String(e.page).slice(0, 40)}'`
      );
    if (e.rect !== void 0 && e.rect !== null && !(Array.isArray(e.rect) && e.rect.length === 4 && e.rect.every((n) => typeof n === "number" && Number.isFinite(n))))
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a pdf-page extent's rect is four finite numbers or absent. A rect that is present and unreadable is worse than none, because it looks like a region somebody chose`
      );
    if (ctx.known !== false && Number.isInteger(ctx.pageCount) && ctx.pageCount > 0 && e.page >= ctx.pageCount)
      return refusal2(
        "CONTENT_EXTENT_OUT_OF_RANGE",
        `this capture's page set holds ${ctx.pageCount} page(s) (0-${ctx.pageCount - 1}) and the extent names page ${e.page}`
      );
  }
  if (e.kind === "sheet-cell") {
    if (typeof e.sheet !== "string" || !e.sheet.trim())
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a sheet-cell extent names which sheet, as the workbook spells it. This one names '${String(e.sheet).slice(0, 40)}'`
      );
    if (typeof e.cell !== "string" || !CONTENT_EXTENT_A1_RE.test(e.cell.trim()))
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a sheet-cell extent names which cell in A1 notation (B14, $B$14). This one names '${String(e.cell).slice(0, 40)}'`
      );
    const outside = coversSheetCell(e, ctx.container);
    if (outside) return refusal2("CONTENT_EXTENT_OUT_OF_RANGE", outside);
  }
  if (e.kind === "doc-para") {
    if (!Number.isInteger(e.para) || e.para < 0)
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a doc-para extent names which paragraph, as a 0-based integer. This one names '${String(e.para).slice(0, 40)}'`
      );
    if (e.run !== void 0 && e.run !== null && !(Number.isInteger(e.run) && e.run >= 0))
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a doc-para extent's run is a 0-based integer or absent. A run that is present and unreadable is worse than none, because it looks like a span somebody chose`
      );
    const outside = coversDocPara(e, ctx.container);
    if (outside) return refusal2("CONTENT_EXTENT_OUT_OF_RANGE", outside);
  }
  if (e.kind === "slide-shape") {
    if (!Number.isInteger(e.slide) || e.slide < 1)
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a slide-shape extent names which slide, as a 1-based integer (slide 1 is the first). This one names '${String(e.slide).slice(0, 40)}'`
      );
    if (e.shape !== void 0 && e.shape !== null && !(Number.isInteger(e.shape) && e.shape >= 0))
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a slide-shape extent's shape is a 0-based integer or absent. A shape that is present and unreadable is worse than none, because it looks like an element somebody chose`
      );
    const outside = coversSlideShape(e, ctx.container);
    if (outside) return refusal2("CONTENT_EXTENT_OUT_OF_RANGE", outside);
  }
  const citedAs = contentCitedAs(e);
  if (citedAs !== "text" && citedAs !== "bytes")
    return refusal2(
      "CONTENT_EXTENT_UNREADABLE",
      `cited_as says whether a part is cited for its TEXT or as its own BYTES, and is one of text, bytes. This one says '${String(citedAs).slice(0, 40)}'`
    );
  if (citedAs === "bytes" && e.kind !== "image")
    return refusal2(
      "CONTENT_EXTENT_UNREADABLE",
      `only an image can be cited as its bytes. A ${e.kind} extent addresses text, and reading 'bytes' here as 'text' would silently change what the citation claims, so it is refused`
    );
  if (e.kind === "sheet-range") {
    if (typeof e.sheet !== "string" || !e.sheet.trim())
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a sheet-range extent names which sheet, as the workbook spells it. This one names '${String(e.sheet).slice(0, 40)}'`
      );
    if (typeof e.range !== "string" || !rangeCorners(e.range))
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a sheet-range extent names which cells in A1:A1 notation (A1:C10, $A$1:$C$10). This one names '${String(e.range).slice(0, 40)}'`
      );
    const outside = coversSheetRange(e, ctx.container);
    if (outside) return refusal2("CONTENT_EXTENT_OUT_OF_RANGE", outside);
  }
  if (e.kind === "doc-table") {
    if (!Number.isInteger(e.table) || e.table < 0)
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a doc-table extent names which table, as a 0-based ordinal in document order. This one names '${String(e.table).slice(0, 40)}'`
      );
    if (e.cell !== void 0 && e.cell !== null && !(typeof e.cell === "string" && CONTENT_EXTENT_A1_RE.test(e.cell.trim())))
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `a doc-table extent's cell is A1 notation over the table's grid (B3) or absent. A cell that is present and unreadable is worse than none, because it looks like one somebody chose`
      );
    const outside = coversDocTable(e, ctx.container);
    if (outside) return refusal2("CONTENT_EXTENT_OUT_OF_RANGE", outside);
  }
  if (e.kind === "image") {
    const hasPart = e.part !== void 0 && e.part !== null && e.part !== "";
    const hasPage = e.page !== void 0 && e.page !== null && e.page !== "";
    if (hasPart === hasPage)
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        hasPart ? `an image extent names EITHER the embedded part's content hash OR a page and rectangle, and this one names both \u2014 one image stated twice, where the two can disagree` : `an image extent names the embedded part's content hash (in a container) or the page it is on (in a PDF), and this one names neither`
      );
    if (hasPart && !(typeof e.part === "string" && /^[0-9a-fA-F]{64}$/.test(e.part.trim())))
      return refusal2(
        "CONTENT_EXTENT_UNREADABLE",
        `an image's part is the SHA-256 of the embedded media member, 64 hexadecimal characters. This one names '${String(e.part).slice(0, 40)}'`
      );
    if (hasPage) {
      if (!Number.isInteger(e.page) || e.page < 0)
        return refusal2(
          "CONTENT_EXTENT_UNREADABLE",
          `an image extent's page is a 0-based integer. This one names '${String(e.page).slice(0, 40)}'`
        );
      if (e.rect !== void 0 && e.rect !== null && !(Array.isArray(e.rect) && e.rect.length === 4 && e.rect.every((n) => typeof n === "number" && Number.isFinite(n))))
        return refusal2(
          "CONTENT_EXTENT_UNREADABLE",
          `an image extent's rect is four finite numbers or absent. A rect that is present and unreadable is worse than none, because it looks like a region somebody chose`
        );
      if (ctx.known !== false && Number.isInteger(ctx.pageCount) && ctx.pageCount > 0 && e.page >= ctx.pageCount)
        return refusal2(
          "CONTENT_EXTENT_OUT_OF_RANGE",
          `this capture's page set holds ${ctx.pageCount} page(s) (0-${ctx.pageCount - 1}) and the image extent names page ${e.page}`
        );
      const unpainted = ctx.known !== false ? coversImagePlacement(e, ctx.container) : null;
      if (unpainted) return refusal2("CONTENT_EXTENT_NO_IMAGE_PAINTED", unpainted);
    }
    const notContainer = hasPart && ctx.known !== false ? partOutsideAnyContainer(ctx.container) : null;
    if (notContainer) return refusal2("CONTENT_EXTENT_NOT_A_CONTAINER", notContainer);
    const outside = hasPart ? coversImage(e, ctx.container) : null;
    if (outside) return refusal2("CONTENT_EXTENT_OUT_OF_RANGE", outside);
    if (hasPart && citedAs === "text")
      return refusal2(
        "CONTENT_EXTENT_NO_CHAIN",
        `this citation asks for the TEXT of an embedded image, and nothing in this record has read text off an embedded image \u2014 the container's transcription covers its text parts and never its media. Cite the image as itself (cited_as: bytes), or cite the passage that quotes it`
      );
  }
  if (ctx.known !== false && citedAs !== "bytes" && e.kind !== "document" && !(Array.isArray(ctx.chain) && ctx.chain.length))
    return refusal2(
      "CONTENT_EXTENT_NO_CHAIN",
      `this record holds no extraction chain for the capture this leg cites, so there is no transcription over ${describeExtent(e)} for the citation to point at`
    );
  return null;
}
function coversSheetCell(e, container) {
  const sheets = container && Array.isArray(container.sheets) ? container.sheets : null;
  if (!sheets || !sheets.length) return null;
  const want = String(e.sheet).trim();
  const sheet = sheets.find((x) => x && typeof x.name === "string" && x.name === want);
  if (!sheet)
    return `this capture's workbook holds ${sheets.length} sheet(s) (${sheets.map((x) => x && typeof x.name === "string" ? x.name : "?").slice(0, 12).join(", ")}${sheets.length > 12 ? ", \u2026" : ""}) and the extent names a sheet called '${want.slice(0, 40)}'`;
  const at = a1ToRowCol(e.cell);
  if (!at) return null;
  if (Number.isInteger(sheet.rows) && sheet.rows > 0 && at.row > sheet.rows)
    return `sheet '${want.slice(0, 40)}' of this capture holds ${sheet.rows} row(s) (1-${sheet.rows}) and the extent names row ${at.row}`;
  if (Number.isInteger(sheet.cols) && sheet.cols > 0 && at.col > sheet.cols)
    return `sheet '${want.slice(0, 40)}' of this capture holds ${sheet.cols} column(s) and the extent names column ${at.col}`;
  return null;
}
function coversDocPara(e, container) {
  const n = container ? container.paragraphs : null;
  if (!(Number.isInteger(n) && n > 0)) return null;
  if (e.para >= n)
    return `this capture's text holds ${n} paragraph(s) (0-${n - 1}) and the extent names paragraph ${e.para}`;
  return null;
}
function coversSlideShape(e, container) {
  const slides = container && Array.isArray(container.slides) ? container.slides : null;
  if (!slides || !slides.length) return null;
  if (e.slide > slides.length)
    return `this capture's deck holds ${slides.length} slide(s) (1-${slides.length}) and the extent names slide ${e.slide}`;
  const slide = slides[e.slide - 1];
  const n = slide ? slide.shapes : null;
  if (Number.isInteger(e.shape) && Number.isInteger(n) && n > 0 && e.shape >= n)
    return `slide ${e.slide} of this capture holds ${n} shape(s) (0-${n - 1}) and the extent names shape ${e.shape}`;
  return null;
}
function coversSheetRange(e, container) {
  const held = container && Array.isArray(container.sheets) ? container.sheets : null;
  if (!held || !held.length) return null;
  const sheets = held;
  const want = String(e.sheet).trim();
  const sheet = sheets.find((x) => x && typeof x.name === "string" && x.name === want);
  if (!sheet)
    return `this capture's workbook holds ${sheets.length} sheet(s) (${sheets.map((x) => x && typeof x.name === "string" ? x.name : "?").slice(0, 12).join(", ")}${sheets.length > 12 ? ", \u2026" : ""}) and the extent names a sheet called '${want.slice(0, 40)}'`;
  const k = rangeCorners(e.range);
  if (!k) return null;
  if (Number.isInteger(sheet.rows) && sheet.rows > 0 && k.r1 > sheet.rows)
    return `sheet '${want.slice(0, 40)}' of this capture holds ${sheet.rows} row(s) (1-${sheet.rows}) and the range reaches row ${k.r1}`;
  if (Number.isInteger(sheet.cols) && sheet.cols > 0 && k.c1 > sheet.cols)
    return `sheet '${want.slice(0, 40)}' of this capture holds ${sheet.cols} column(s) and the range reaches column ${k.c1}`;
  return null;
}
function coversDocTable(e, container) {
  const tables = container && Array.isArray(container.tables) ? container.tables : null;
  if (!tables) return null;
  if (e.table >= tables.length)
    return `this capture's document holds ${tables.length} table(s)${tables.length ? ` (0-${tables.length - 1})` : ""} and the extent names table ${e.table}`;
  if (typeof e.cell !== "string" || !e.cell.trim()) return null;
  const t = tables[e.table] || {};
  const at = a1ToRowCol(e.cell);
  if (!at) return null;
  if (Number.isInteger(t.rows) && t.rows > 0 && at.row > t.rows)
    return `table ${e.table} of this capture holds ${t.rows} row(s) (1-${t.rows}) and the extent names row ${at.row}`;
  if (Number.isInteger(t.cols) && t.cols > 0 && at.col > t.cols)
    return `table ${e.table} of this capture holds ${t.cols} column(s) and the extent names column ${at.col}`;
  return null;
}
function coversImage(e, container) {
  const images = container && Array.isArray(container.images) ? container.images : null;
  if (!images) return null;
  const want = String(e.part).trim().toLowerCase();
  if (images.some((x) => x && typeof x.part === "string" && x.part.toLowerCase() === want)) return null;
  return `this capture's container holds ${images.length} image(s) and none of them has the content hash ${want.slice(0, 16)}\u2026 that the extent names`;
}
function partOutsideAnyContainer(container) {
  if (!container || container.office !== false) return null;
  const fmt = typeof container.format === "string" && container.format ? container.format : null;
  return `this capture is ${fmt ? `a ${fmt.slice(0, 20)} document` : "a document"}, not an office container, so its own bytes hold no embedded media part and a {part} names bytes this document does not contain. An image served beside a page is its OWN document: acquire it at its own address and cite that document whole` + (fmt === "pdf" ? `. An image painted on a PDF page is addressed by its page and rect, not a part` : "");
}
function imagePartUndetermined(extent, ctx = {}) {
  const e = extent && typeof extent === "object" ? extent : null;
  if (!e || e.kind !== "image" || e.part === void 0 || e.part === null || e.part === "") return null;
  if (!ctx || ctx.known === false) return null;
  const c = ctx.container && typeof ctx.container === "object" ? ctx.container : null;
  if (!c || c.office == null)
    return {
      level: "container_kind",
      why: `${c && typeof c.kind_why === "string" ? c.kind_why : "this record does not hold which kind of document this capture is"} \u2014 so whether this part is a member of the document's own bytes is UNDETERMINED, admitted and stated rather than guessed either way`
    };
  if (c.office === true && !Array.isArray(c.images))
    return {
      level: "image_list",
      why: `this capture is an office container and this record holds no list of its embedded images (it was acquired before the wire carried one, or no entry itemised it), so whether the part is among them is UNDETERMINED, admitted and stated rather than guessed`
    };
  return null;
}
function coversImagePlacement(e, container) {
  if (!container || container.container_name !== "pdf" || !Array.isArray(container.images)) return null;
  const all = container.images;
  const onPage = all.filter((x) => x && x.page === e.page && Array.isArray(x.rect) && x.rect.length === 4);
  if (!(Array.isArray(e.rect) && e.rect.length === 4)) {
    if (onPage.length) return null;
    return `page ${e.page} of this capture paints no image \u2014 the record holds ${all.length} image placement(s) over the whole document, and none is on this page`;
  }
  const norm = (r) => [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])];
  const want = norm(e.rect);
  const same = (r) => norm(r).every((v, i) => Math.abs(v - want[i]) <= 1e-3 + 1e-9);
  if (onPage.some((x) => same(x.rect))) return null;
  const listed = onPage.slice(0, 6).map((x) => `[${norm(x.rect).join(", ")}]`).join(" ");
  return `page ${e.page} of this capture paints ${onPage.length} image(s)${onPage.length ? ` (${listed}${onPage.length > 6 ? " \u2026" : ""})` : ""} and none at [${want.join(", ")}], the rectangle the extent names`;
}
var TASK_ACTOR_CHECKS = {
  NOT_YOURS: {
    check: "C-76.1",
    where: "src/store.mjs #refuseNotYours > is-task-actor-fence",
    translation: "This task is not yours to act on: it is with another member now, so nothing was done to it. The record says below who holds it. Ask them, or an administrator, if it still needs you."
  }
};
var PER_ITEM_CHECKS = {
  SET_NO_ITEMS: {
    check: "C-75.1",
    where: "src/record-core/index.mjs perItem > is-per-item-set-shape",
    translation: "Nothing was selected, so nothing was done. Choose at least one item and try again."
  },
  SET_TOO_LARGE: {
    check: "C-75.2",
    where: "src/record-core/index.mjs perItem > is-per-item-set-shape",
    translation: "That selection is larger than the record acts on at once, so nothing was done to any of it. Select fewer items and apply the action again."
  },
  SET_ITEM_MALFORMED: {
    check: "C-75.3",
    where: "src/record-core/index.mjs perItem > is-per-item-malformed",
    translation: "This item could not be read as an item, so it was left as it was. The rest of the selection was still acted on, one by one."
  },
  SET_ITEM_FAILED: {
    check: "C-75.4",
    where: "src/record-core/index.mjs perItem > is-per-item-failed",
    translation: "The record could not complete the action on this item and did not change it. It stays in your list. The rest of the selection was still acted on, one by one."
  },
  SET_ITEMS_RETAINED: {
    check: "C-75.5",
    where: "src/record-core/index.mjs perItem > is-per-item-retained",
    translation: "Not every selected item was handled. The ones that were have left your list; the ones that were not are still there, each with the reason the record gave for it, so you can take a different action on them."
  }
};
var REGISTRATION_CHECKS = {
  AUDIT_CHECK_DECLARED: {
    check: "C-102.1",
    where: "src/record-core/index.mjs registerAuditCheck",
    translation: "A part of this instance tried to register its audit check a second time. Each part registers once, when it starts, so the second was refused and the first still runs. This is a fault in how the instance was built, not in the record, and nothing in the record changed."
  },
  AUDIT_CHECK_MALFORMED: {
    check: "C-102.2",
    where: "src/record-core/index.mjs registerAuditCheck",
    translation: "A part of this instance tried to register an audit check without naming itself or without a check to run, so nothing was registered. This is a fault in how the instance was built, not in the record, and nothing in the record changed."
  },
  AUDIT_CHECK_FAILED: {
    check: "C-102.3",
    where: "src/record-core/index.mjs auditPass",
    translation: "One of the checks the audit runs over this document stopped with an error instead of answering, so the document is counted as having an error rather than as clean. The error is in the check and says nothing yet about the document. The audit changes nothing in the record."
  },
  FACT_UNAVAILABLE: {
    check: "C-102.4",
    where: "src/promotion/index.mjs fact",
    translation: "No part of this instance answers that question yet, so there is no answer here, which is not the same as the answer being no. Nothing was written."
  },
  FACT_FAILED: {
    check: "C-102.5",
    where: "src/promotion/index.mjs fact",
    translation: "The part of this instance that answers that question stopped with an error instead of answering, so there is no answer here, which is not the same as the answer being no. Nothing was written."
  }
};
var CONNECTION_PAIR_CHECKS = {
  /* THE FORGED PAIR. A pair whose recorded position is NOT inside the extent
     being graded may not grade it — which sounds obvious and is exactly the
     shortcut this record would otherwise take, because the pair is right there
     on the row and its grade is already computed. Taking it would let a leg
     citing page 3 earn a connection established on page 300 of the same
     document, which is Bob's 5.1 ruling inverted. */
  CONNECTION_PAIR_OUTSIDE_EXTENT: {
    check: "C-49.1",
    where: "src/connections/pair.mjs checkConnectionPairCovers > is-connection-pair-covering",
    translation: "This connection was established by a reference somewhere else in the document, not in the part you cited. A citation that points at a passage stands on what is IN that passage, so it cannot borrow a link the record found elsewhere in the same file. Cite the part where the reference actually appears, or cite the document as a whole and say so."
  },
  /* THE UNPLACEABLE PAIR. The connection has its two references and neither
     reading recorded WHERE it read one, so whether the reference is inside the
     cited part is not a hard question — it is an unanswerable one. This is the
     state IC-86 exists to shrink and it will be the common state until every
     producer itemises its text; it is a STATEMENT, and the closing is per pair
     and never assumed for the connection as a whole. */
  CONNECTION_PAIR_UNPLACED: {
    check: "C-49.2",
    where: "src/connections/pair.mjs checkConnectionPairCovers > is-connection-pair-covering",
    translation: "The record knows which reference links these two documents but not where in either document it was read, so it cannot say whether that reference falls inside the part you cited. This is stated rather than assumed either way: the connection is real and its reach into your citation is undetermined until the document is read with positions."
  },
  /* THE ABSENT ROW. Asked to grade a portion the record does not hold. Refused
     rather than answered UNDETERMINED, because those are opposite findings: an
     undetermined grade says the portion exists and its connections cannot be
     placed, and answering that for an id nothing minted would confirm a passage
     that was never addressed. */
  CONNECTION_PAIR_NO_CONTENT: {
    check: "C-49.3",
    /* A REGION and not the whole function, which is DEC-49's own rule (a row's
       `where` names the SMALLEST SPAN) and is also what the harness demanded:
       the function's other early return, `NO_CONTENT`, is a caller who named no
       key rather than a member who was refused, and a whole-function `where`
       made this row appear to govern it — so the guard asked for either a
       translation for "you passed no parameter" or a narrower span. The span is
       the honest answer. */
    where: "src/connections/index.mjs portionGrade > pair-content-row-present",
    translation: "This record holds no passage with that address, so there is no part of a document whose connections could be weighed. A content address is minted when a citation first points at a passage \u2014 if you expected one here, the citation that would have made it has not been written yet."
  },
  /* REC-120 / D-161 act (1) / M-51 — THE UNCHOSEN MENTION. The pair is the
     STRONGEST-GRADED mention of the subject in each document (FW-17's collapse),
     never a mention anybody chose as ON POINT (Bob's 5.4 second pass). So when
     the document holds MORE THAN ONE mention of the subject, the pair's place is
     a machine selection and two answers built on it would claim more than the
     record holds: a definite "outside" for a part where ANOTHER mention of the
     subject was read (FW-21 drove it: page 9 of a document mentioning the
     ordinance on 2 and 9 answered exactly as page 7, which never mentions it),
     and a "reaches" for a part the pair won only on a TIE-BREAK against an
     equal-grade mention read elsewhere (the tie-break is sort order, which says
     nothing about relevance — flip it and the answer flips). Both are
     UNDETERMINED, stated, with the mentions named. A mention the reading could
     not place counts as possibly-inside and possibly-outside, for the same
     reason C-49.2 exists. A WEAKER mention outside does not unsettle a reach:
     grade decided that pair, and grade is a stated basis. */
  CONNECTION_PAIR_MENTION_UNCHOSEN: {
    check: "C-49.4",
    where: "src/connections/pair.mjs checkConnectionMentionUnchosen > is-mention-unchosen",
    translation: "This document mentions the same subject in more than one place, and the record linked the two documents through the strongest-graded mention without anyone choosing which mention is the one on point. Because another mention bears on the part you cited, whether this connection reaches your citation is undetermined rather than yes or no. A citation of the document as a whole is answered today; a member may also choose which mention is the on-point one for this connection, and the answer then follows that choice."
  }
};
var CONNECTION_CHOICE_CHECKS = {
  CONNECTION_CHOICE_NOT_A_MEMBER: {
    check: "C-74.1",
    where: "src/connections/index.mjs choose > is-connection-choice",
    translation: "Choosing which mention of a subject is the one on point for a connection is a member's own act, done in their name. A machine may point out the mentions a document holds, but deciding which one a connection rests on is a judgment a person signs for."
  },
  CONNECTION_CHOICE_NO_CONNECTION: {
    check: "C-74.2",
    where: "src/connections/index.mjs choose > is-connection-choice",
    translation: "That request does not name a connection this record holds and you can see. A connection is named by the two documents it joins and the subject that joins them, and it exists once the record has derived it \u2014 choose after it appears among the document's connections."
  },
  CONNECTION_CHOICE_NOT_A_MENTION: {
    check: "C-74.3",
    where: "src/connections/index.mjs choose > is-connection-choice",
    translation: "The mention named is not one this document carries for that subject. The choice is among the places the record actually read the subject in this document, by the reference as the reading recorded it; a mention the record never read cannot be the one a connection rests on."
  },
  /* D-454: the reference named was read at MORE THAN ONE place in this document, so naming the
     string is not yet a choice between its mentions. Refused rather than defaulted: a default
     (the first read, say) would be REC-122's own liar — the machine's selection wearing a
     member's name. The refusal lists the occurrences so the member can name one. */
  CONNECTION_CHOICE_OCCURRENCE_UNNAMED: {
    check: "C-74.4",
    where: "src/connections/index.mjs choose > is-connection-choice",
    translation: "That reference was read at more than one place in this document, and each place is its own mention. Say which one is on point \u2014 by the occurrence the record lists for it, or by the place as the record names it \u2014 and the choice will rest on that place alone."
  }
};
var PROMOTED_TYPE_CHECKS = {
  ENVELOPE_TYPE_DISAGREES: {
    check: "C-86.1",
    where: "src/promotion/index.mjs #promote > is-promoted-type-disagrees",
    translation: "The document being filed says what kind of thing it is, and the request that carried it says something different. The record goes by the document, so rather than file an action as information \u2014 or the reverse \u2014 and index it as neither, it stops and tells you both answers. Nothing was written. Send it again with the request naming the type the document names, or change the document first."
  },
  /* D-547 (2026-09-25) — the SECOND way a promotion's type can be wrong, and it is not the first one twice: C-86.1
   * compares the two statements in ONE request; this compares the request with the RECORD. A revision whose document
   * names a different type than the bundle already holds would rewrite `bundles.object_type` in place, and every
   * type-scoped fence would then ask the wrong machine. Replay is exempt, as for C-86.1. */
  REVISION_RETYPES_BUNDLE: {
    check: "C-86.2",
    where: "src/promotion/index.mjs #promote > is-promote-retypes-bundle",
    translation: "This change would turn something the record already holds into a different kind of thing, an item of information into an action, say. A change can alter what a document says, but not what it is, because what it is decides which rules protect it. Nothing was written. To record it as the other kind, create a new one of that kind and link the two."
  },
  /* D-563 (2026-09-25) — C-86.1's rule one field over, twice: the document states what it is CALLED and where it STANDS,
   * and a request whose label contradicts either is refused rather than obeyed. The name is what 7.1 holds unique and
   * the state decides who may move the item (7.11) and what may cite it (REC-181), so a label a caller can steer was
   * an authority over both. Only a contradiction between two statements: a label stating nothing takes the document's
   * word. Replay is exempt, as for C-86.1. */
  ENVELOPE_TITLE_DISAGREES: {
    check: "C-86.3",
    where: "src/promotion/index.mjs #promote > is-promoted-title-disagrees",
    translation: "The document being filed gives itself one name, and the request that carried it gives another. The record goes by the document, and names are held unique across the instance, so rather than file it under a name it does not bear it stops and tells you both. Nothing was written. Send it again with the request naming the document's title, or naming none, or change the document first."
  },
  ENVELOPE_STATE_DISAGREES: {
    check: "C-86.4",
    where: "src/promotion/index.mjs #promote > is-promoted-state-disagrees",
    translation: "The document being filed says where it stands, and the request that carried it says something different. Where a thing stands decides who may move it and what may cite it, and the record goes by the document, so it stops and tells you both. Nothing was written. Send it again with the request saying what the document says, or saying nothing about it, or change the document first."
  }
};
var RISK_TIER_REVISION_CHECKS = {
  RISK_TIER_REWRITTEN: {
    check: "C-90.1",
    where: "src/store.mjs #promoteChecks > is-promote-risk-tier, reached from op=promote through the step legacy-store registers with promotion (K31)",
    translation: "After an action is created, its risk tier changes only through the risk-tier act, which records who changed it, when and why, and keeps every earlier tier readable. This write would have changed the tier, or the record of its earlier tiers, some other way, so nothing was written. Use the risk-tier act."
  },
  BAD_RISK_TIER: {
    check: "C-90.2",
    where: "src/store.mjs actionRiskTier > is-risk-tier-act",
    translation: 'A risk tier is 1 (file freely), 2 (file with caution) or 3 (do not file without counsel). The act states one of those three; "not assessed" is what an action reads when nobody has stated one, and is not something to set. Nothing was written.'
  },
  RISK_TIER_REASON_REFUSED: {
    check: "C-90.3",
    where: "src/store.mjs actionRiskTier > is-risk-tier-act",
    translation: "Changing a risk tier needs a reason, and it is kept beside the change for as long as the record lasts. The reason was missing, longer than 500 characters, or held a quotation mark, backslash or line break, which this record cannot store. Nothing was written."
  },
  RISK_TIER_UNCHANGED: {
    check: "C-90.4",
    where: "src/store.mjs actionRiskTier > is-risk-tier-act",
    translation: "The action already has that risk tier, so there is nothing to revise. The history records changes; it has not been touched."
  },
  RISK_TIER_HISTORY_UNSPLICEABLE: {
    check: "C-90.5",
    where: "src/store.mjs actionRiskTier > is-risk-tier-act",
    translation: "This action's record of earlier risk tiers is not in a shape the act can add to without rewriting it, and the act only ever adds. Nothing was written."
  }
};
var SHA256_K = new Uint32Array([
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
function sha256HexSync(str) {
  const bytes = new TextEncoder().encode(String(str));
  const bitLen = bytes.length * 8;
  const withPad = new Uint8Array(bytes.length + 9 + 63 >> 6 << 6);
  withPad.set(bytes);
  withPad[bytes.length] = 128;
  const dv = new DataView(withPad.buffer);
  dv.setUint32(withPad.length - 8, Math.floor(bitLen / 4294967296));
  dv.setUint32(withPad.length - 4, bitLen >>> 0);
  const h = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  const w = new Uint32Array(64);
  const rotr = (x, n) => x >>> n | x << 32 - n;
  for (let off = 0; off < withPad.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ w[i - 15] >>> 3;
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ w[i - 2] >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
    }
    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], ff = h[5], g = h[6], hh = h[7];
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = e & ff ^ ~e & g;
      const t1 = hh + S1 + ch + SHA256_K[i] + w[i] >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = a & b ^ a & c ^ b & c;
      const t2 = S0 + maj >>> 0;
      hh = g;
      g = ff;
      ff = e;
      e = d + t1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 >>> 0;
    }
    h[0] = h[0] + a >>> 0;
    h[1] = h[1] + b >>> 0;
    h[2] = h[2] + c >>> 0;
    h[3] = h[3] + d >>> 0;
    h[4] = h[4] + e >>> 0;
    h[5] = h[5] + ff >>> 0;
    h[6] = h[6] + g >>> 0;
    h[7] = h[7] + hh >>> 0;
  }
  let out = "";
  for (const v of h) out += v.toString(16).padStart(8, "0");
  return out;
}
function contentIdFor(captureSha, extent, chain) {
  return sha256HexSync(canonicalJson({
    v: 1,
    capture_sha: String(captureSha ?? ""),
    extent: canonicalExtent(extent),
    chain: chain == null ? null : canonicalJson(chain)
  }));
}

// ../bio-plane/src/airun.mjs
var OBSERVATION_LEVELS = {
  meaning: "the framework layer: findings, legs, connections",
  content: "extracted content within documents (DEC-23: content is the unit)",
  document: "documents the store holds",
  internet: "the open internet, through the capture path"
};
var OBSERVATION_STATES = {
  NEVER_LOOKED: "nobody looked at this level for this subject",
  LOOKED_ABSENT: "we looked and it is positively not there",
  LOOKED_INDETERMINATE: "we looked and could not tell",
  PRESENT: "we looked and it is there",
  partial: "we looked and got part of it (SWH's crawl status; CPDF-5's measured 88% case)"
};
var DEFINITIVE_STATES = /* @__PURE__ */ new Set(["LOOKED_ABSENT", "PRESENT"]);
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
var RUN_BOUNDS = {
  fetches: "fetches requested of the capture path",
  subsessions: "evidence sub-sessions spawned",
  wallclock: "wall time across resumptions, in milliseconds",
  runtime: "CPU or subrequest ceiling (D-54, D-56) \u2014 IS-9(d) builds its producer",
  /* SK-8, AND IT IS A BOUND RATHER THAN A POLICY BECAUSE §7.3 (5) RULED IT ONE.
       *"A machine that may mint citable rows without a bound produces a store of
       proposals nobody cited — each correctly labelled, the whole unexamined"*,
       which is exactly the failure `INVESTIGATIVE-SESSION.md` §15 named for
       versions one layer up. So the EXTRACT role's productions are budgeted in the
       table the run already has: **no schema, no new vocabulary**, which was the
       answer's own test.
  
       IT IS A ROW HERE AND NOT A SECOND FENCE. `finishedBound` already terminates
       a run whose consumed reaches its allowed, and `#aiRunTerminate` already
       writes which bound stopped it and where — a run that ran out of mints ends
       exactly as a run that ran out of fetches does, with no branch anywhere
       asking which kind of bound it was.
  
       IT IS LAST IN DECLARATION ORDER BEFORE `lease`, WHICH IS A TIE-BREAK RULE
       AND NOT AN OPINION: `finishedBound` sorts exhausted bounds by this object's
       key order, so a run that exhausted both its fetches and its mints in one
       tick reports FETCHES — the earlier, cheaper-to-explain cause. Putting mints
       first would have renamed every such run's ending without changing anything
       about it. */
  mints: "passages a machine credential marked citable (\xA77.3 (5)) \u2014 the EXTRACT role's budget",
  /* D-85 (INVESTIGATIVE-SESSION.md §11 item 5, rule 2, BOB #25): AN ASSISTANT OPENS A QUESTION ONLY INSIDE A
     RUN, AND THE RUN BOUNDS HOW MANY. Ruled on `mints`' rule, so it is `mints`' shape: a ROW in this table, no
     schema and no second vocabulary; declared at `op=airunopen` by the member who opens the run; a creation
     under a run that declares none is REFUSED rather than given an allowance invented in code (a number
     chosen here would be a measurement with no measurement behind it); and a run whose surfaces reach the
     allowance ends at its next tick through `finishedBound`, as one that ran out of mints does. AFTER `mints`
     in declaration order for the tie-break reason `mints` gives: appending it renames no existing ending. */
  surfaces: "questions an assistant opened inside this run (\xA711 item 5, rule 2) \u2014 the run's bound on what it may surface",
  lease: "the run stopped heartbeating and its lease lapsed: it died rather than finished"
};
var RUN_ENDINGS = {
  completed: "the run finished its work",
  cancelled: "a member stopped it",
  "mode-not-deployed": "the deployment gate refused this launch before it spent anything: the mode it asked for is not deployed yet, so no member stopped this run and no budget ran out"
};
var PLANE_COUNTED_BOUNDS = Object.freeze(["mints", "surfaces"]);
var PLANE_DECIDED_BOUNDS = Object.freeze(["lease"]);

// ../bio-plane/src/skilldoctrine.mjs
var JUDGEMENT_ID = "investigative-judgement";
var JUDGEMENT_EDITION = "1";
var DEFERRED_ROWS = [
  "how many search passes, and when the loop stops",
  "the fan-out across the four levels",
  "a version is written in `suggested` and no other state",
  "dedup against existing versions before writing",
  "the observation log is written whether or not the run succeeds",
  "every machine fence"
];
var JUDGED_ROWS = [
  "what to search for",
  "what each level's reports mean",
  "what the version says",
  "whether this reading differs in substance",
  "where it stopped and why"
];
var TABLE_SOURCE = "docs/development/INVESTIGATIVE-SESSION.md";
var LOOP_TERMINATION_EVIDENCE = "TREC 2011 found searchers estimating their own recall erred by up to +95/\u221287 points and terminated review prematurely on a false belief of high recall";
var FLOW_SUBJECTS = "passes|levels|sub-?sessions|fetches|attempts|rounds|versions|searches";
var COUNTED_SUBJECTS = "passes|sub-?sessions|fetches|attempts|rounds|versions|searches";
var CONTROL_FLOW_AUTHORITY = [
  /* A COUNT. "at most three passes", "up to 5 sub-sessions", "at most two levels". */
  {
    name: "a bound stated as a quantity",
    re: new RegExp(String.raw`\b(?:at most|no more than|up to|at least|no fewer than|exactly)\s+\S+\s+(?:${FLOW_SUBJECTS})\b`, "i")
  },
  /* A BARE NUMERAL against a flow subject. "three passes", "4 fetches". */
  {
    name: "a bound stated as a numeral",
    re: new RegExp(String.raw`\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:more\s+)?(?:${COUNTED_SUBJECTS})\b`, "i")
  },
  /* A TERMINATION CONDITION handed to the reader. */
  {
    name: "a termination condition",
    re: /\b(?:stop|terminate|halt|end|finish|conclude)\s+(?:the\s+|your\s+|this\s+)?(?:loop|search|searching|run|passes|fan-?out)\b/i
  },
  /* THE DECISION about termination handed to the reader — the exact shape
     §14b.4's first row forbids, and SK-2's negative control's own subject.
     NARROWED AFTER IT FIRED ON ITS OWN DOCTRINE, and the narrowing is the
     finding rather than a repair: written as decide/judge + when|whether|how
     many, it flagged *"judge whether this reading differs in substance"* —
     which is a row of §14b.4's RIGHT column and the one thing this clause is
     granted. A detector that refuses a granted judgement would push the next
     author to phrase the grant around it, which is how a scan starts shaping
     prose instead of measuring it. It now requires the OBJECT to be control
     flow: a stopping point, or a count of something the harness fans out. */
  {
    name: "the termination decision itself",
    re: new RegExp(String.raw`\b(?:decide|judge|choose|determine|work out)\s+(?:for yourself\s+)?(?:when\b[^.]{0,32}?\b(?:stop|end|halt|terminate|finish|enough)|how\s+many\b|whether\s+to\s+(?:continue|stop|keep))`, "i")
  },
  /* SATISFACTION AS A STOPPING RULE — TREC 2011's measured failure, in the
     words it would actually be written in. */
  {
    name: "self-assessed recall as a stopping rule",
    re: /\b(?:when|once|until)\s+you\s+(?:are\s+satisfied|are\s+confident|think|believe|feel|judge|have\s+enough)\b/i
  },
  /* A LOOP written as an instruction. */
  {
    name: "a loop written as an instruction",
    re: /\b(?:repeat|iterate|keep\s+(?:going|searching)|loop)\b(?:[^.]{0,40}?\b(?:until|while)\b)?/i
  }
];
var C = {
  hunch_needs_author: "C-2.8",
  /* checkEarnedLeg's hunch arms — see below */
  boilerplate: SUGGEST_CHECKS.SUGGEST_BOILERPLATE.check,
  unwritable_state: SUGGEST_CHECKS.SUGGEST_UNWRITABLE_STATE.check,
  not_different: SUGGEST_CHECKS.SUGGEST_NOT_DIFFERENT.check,
  comparison_incomplete: SUGGEST_CHECKS.SUGGEST_COMPARISON_INCOMPLETE.check,
  branches_not_independent: SUGGEST_CHECKS.SUGGEST_BRANCHES_NOT_INDEPENDENT.check,
  empty_level_unstated: SUGGEST_CHECKS.SUGGEST_EMPTY_LEVEL_UNSTATED.check,
  leg_unreachable: SUGGEST_CHECKS.SUGGEST_LEG_UNREACHABLE.check,
  cannot_conclude: MACHINE_FENCE_CHECKS.MACHINE_CANNOT_CONCLUDE.check,
  cannot_ground: MACHINE_FENCE_CHECKS.MACHINE_CANNOT_GROUND.check,
  skill_version: AI_RUN_CHECKS.AI_RUN_SKILL_VERSION_UNNAMED.check,
  /* SK-3's additions, read by KEY exactly as SK-2's are. */
  cannot_publish: MACHINE_FENCE_CHECKS.MACHINE_CANNOT_PUBLISH.check,
  ground_unasserted: BASIS_VERSION_CHECKS.VERSION_GROUND_UNASSERTED.check,
  strength_composed: VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_COMPOSED.check,
  strength_unfiltered: VERSION_STRENGTH_CHECKS.VERSION_STRENGTH_UNFILTERED.check
};
var CLAUSES = [
  {
    id: "compose-never-mint",
    area: "composition",
    judges: ["what the version says"],
    decides: "Shape the legs. Decide which pieces of evidence bear on the claim, what each one is doing against it, how the ground is partitioned, and which reading of the record they tell together. One sentence may support, undercut and rebut the same claim at once (\xA75), so what is being decided is a COMPOSITION and not a classification. The bar to clear is that the existing calculation, run over the grades the record has already earned for these legs, produces a result the evidence supports.",
    defers: ["a version is written in `suggested` and no other state"],
    enforced_by: [C.unwritable_state, C.leg_unreachable, C.branches_not_independent],
    why: "\xA75, and it makes the system smaller rather than larger: the intelligence goes into how the legs are formed and weighted, never into a richer set of relationships for the record to compute over. The calculation stays as simple as it already is."
  },
  {
    id: "grades-are-composed",
    area: "composition",
    judges: ["what the version says"],
    decides: "Take every grade from the record. A grade is a fact about METHOD \u2014 how the connection was established \u2014 and it arrives from the resolutions the legs rest on, exactly as `op=cite` already fills it. Where the record has earned nothing for a leg, the leg is ungraded, it is inert, and it is named as such. Composing legs whose EARNED grades produce a supported calculation is the whole of what \xA75 means by assigning strength values.",
    defers: [],
    enforced_by: [C.hunch_needs_author],
    why: "SWEEP \xA71.3: a grade asserted rather than earned is forbidden by the ASSISTANT construct, DEC-18 makes an ungraded leg inert and NAMED, and DEC-15 makes a hunch a member act. A machine-composed leg is therefore never a hunch \u2014 it either carries a grade the record earned or it is absent-and-named \u2014 and a hunch is unreachable to it because a hunch carries the name and the date of the member declaring it, which no automated credential has to give."
  },
  {
    id: "description-to-a-commit-standard",
    area: "description",
    judges: ["what the version says", "where it stopped and why"],
    decides: "Write the description to a commit message's standard: what this composition says and why these legs arranged this way tell it. It is the durable account \u2014 the conversation that produced a version is deliberately not kept (DEC-61), so anything the description does not carry is gone. Name every ungraded leg, and name it from the record's own answer rather than from memory: the strength answer publishes the ungraded legs and the hunched ones beside the graded ones, per axis and with the reason, and the description says what that answer says.",
    defers: [],
    enforced_by: [C.boilerplate],
    why: "\xA76 rule 1 holds the description to a commit message's standard and \xA75 adds the naming of every ungraded leg. DEC-18's plural clause is the obligation: inert must never mean invisible. A required field filled to clear a gate is worse than an empty one, because it reads to the next member as something somebody wrote."
  },
  {
    id: "what-to-search-never-when-to-stop",
    area: "search",
    judges: ["what to search for"],
    decides: "Decide what to look for. Which questions the claim actually turns on, which bodies and publishers would hold material bearing on them, what a document would have to say to change the reading, and which of the record's own levels is worth asking next. That is the judgement this skill exists to exercise, and it is exercised inside a step.",
    defers: [
      "how many search passes, and when the loop stops",
      "the fan-out across the four levels"
    ],
    enforced_by: [],
    unenforced_because: "nothing refuses a poorly chosen query, and nothing could: WHAT to search for is judgement and has no boundary a check could draw. What is fenced is the half that is not judgement \u2014 the run's harness decides how many passes there are and when the loop stops, and this clause takes none of that.",
    why: "\xA714b.4, and the evidential case is measured rather than stylistic: " + LOOP_TERMINATION_EVIDENCE + ". A searcher who believes recall is high stops early, and believing it is exactly what a model asked to judge its own completeness would do."
  },
  {
    id: "which-absence-per-level",
    area: "absence",
    judges: ["what each level's reports mean"],
    decides: "Read what each level's report MEANS, and say which absence it is. Absence at one level is not evidence of absence at the next, so an empty answer is a fact about the record and never about the world until the level beneath it has been asked. Report the absence in the record's own state vocabulary, with the address of the search that establishes it, and state which of the four facts it is \u2014 they are four different facts and must not read alike.",
    defers: ["the fan-out across the four levels"],
    enforced_by: [C.empty_level_unstated],
    why: "`CLAUDE.md`'s sparse-at-every-level rule, and \xA79's `level-empty` kind exists so that a run which honestly found nothing supportable is distinguishable from a run that emitted nothing. Two absences that read alike collapse that distinction back again."
  },
  {
    id: "difference-in-substance",
    area: "composition",
    judges: ["whether this reading differs in substance"],
    decides: "Judge whether a reading says something the record does not already hold. A version is a complete alternative account rather than a patch, so the question is whether this account differs in SUBSTANCE from the accounts already there \u2014 not whether its wording differs.",
    defers: ["dedup against existing versions before writing"],
    enforced_by: [C.not_different, C.comparison_incomplete],
    why: "\xA76 and \xA714b.5. The judgement is the model's; the comparison that refuses a duplicate is the plane's, and it FAILS CLOSED when it cannot finish \u2014 not finishing the check is a different fact from passing it."
  },
  {
    id: "where-it-stopped-and-why",
    area: "search",
    judges: ["where it stopped and why"],
    decides: "Say where the work stopped and what that means. Which questions were left standing, what would answer them, and what the reader must not read into what is missing. 'Source unreachable' and 'our governor held us' are different facts and are written as different facts; a capture that came back as a client-rendered shell is indeterminate and is never written as presence.",
    defers: ["the observation log is written whether or not the run succeeds"],
    enforced_by: [],
    unenforced_because: "the log's EXISTENCE is guaranteed by the harness \u2014 it is appended whether or not the run succeeds \u2014 and its entries are refused without a level and a state. What no check can reach is whether the account written into it is HONEST about what was not reached, which is judgement and is stated here as one.",
    why: "\xA711 and \xA714b.6. D-104 is the measured case: a log that writes 'source unreachable' when the truth is 'our governor held us' manufactures a false absence, and our governor refusing is not the source failing."
  },
  {
    id: "bias-minimisation-on-top-of-the-fence",
    area: "bias",
    judges: [],
    decides: "Weigh evidence the same way whichever side of the claim it lands on, and say so where it matters. Look for what would undercut the reading as hard as for what supports it; treat a source that cuts against the member's expectation exactly as one that meets it; do not let the order material arrived in decide what the reading is. Where a leg's weight rests on a judgement rather than on the record, the description says which judgement.",
    defers: [],
    enforced_by: [],
    unenforced_because: "the FENCE is already code and is not this clause: the search half of a run receives no manifest at all \u2014 `op=airunspawn` builds the search payload as an explicit literal that never touches the stored lens, so there is no field to read, and the composing half carries it for disclosure and for the weighing it discloses. Minimisation is the REQUIREMENT ON TOP of that, it is judgement, and nothing refuses a badly weighed leg.",
    why: "\xA714, and the ordering is the whole point: the lens rule is STRUCTURAL, and v2 demoting it to a skill requirement was the defect \xA714b.4 itself names. Bob's requirement that the skill MINIMISE these effects stands \u2014 on top of the fence, never instead of it."
  },
  {
    id: "the-run-says-what-it-ran-under",
    area: "disclosure",
    judges: [],
    decides: "Read the conditions this run was formed under before composing anything: the lens in force (or that none was), the bar the launching project declared (or which kind of no-bar this is), and the doctrine version. A version is only interpretable against them.",
    defers: [],
    enforced_by: [C.skill_version],
    why: "\xA711 and \xA714a, and SK-1 landed the recording half: a run that cannot say which pack it ran under is refused at the door, so this clause is a reading instruction rather than a requirement it could fail to meet."
  },
  {
    id: "propose-only",
    area: "boundary",
    judges: [],
    decides: "Put readings forward and stop there. Everything this skill produces arrives as something PROPOSED, for a named member to adopt, defer with a recorded reason, or dismiss with a recorded reason. Where the evidence supports nothing, propose nothing and say which level was empty \u2014 an empty run and a silent failure must not look alike.",
    defers: [
      "every machine fence",
      "a version is written in `suggested` and no other state"
    ],
    enforced_by: [C.cannot_conclude, C.cannot_ground, C.unwritable_state],
    why: "\xA74: the AI holds no op that ACCEPTS. Nothing it can call concludes, accepts, publishes, or makes a version current. This clause exists so the skill READS consistently with the fence, and it enforces none of it."
  },
  {
    /* D-220 (Bob, 2026-08-06), consumer (3): §3's "AND IT MUST READ DOCUMENT VERSIONS AS
       VERSIONS". The COUNT is not this clause's: the run's `collect` row reads each cited
       item's document through `op=versionchain` and publishes `holdings` keyed on the
       record's own address (agent-worker `documentHoldings`). This clause is how the
       model READS and WRITES about what it holds, which no check refuses. */
    id: "versions-are-versions",
    area: "absence",
    judges: ["what each level's reports mean"],
    decides: "Read the captures of one address as VERSIONS of one document, never as separate documents. When you say what the record holds, count the document once and name its versions as its history; a document seen many times is not better covered than one seen once, only better dated. Two items that share a title or a text are not thereby one document \u2014 the record's address says which document a capture is, and where no captured version is held at an address, the item is itself and is said to be.",
    defers: [],
    enforced_by: [],
    unenforced_because: "the count a run publishes is CODE and is not this clause: the fleet member resolves every citation through op=versionchain and groups by the address the record answers with, so its published coverage counts a document once whatever the model writes. What no check can reach is the model's own prose about coverage \u2014 a description that calls sixty captures sixty sources is refused by nothing, which is why this is stated as judgement.",
    why: "\xA73 (D-220, Bob 2026-08-06): a run that counts every capture as a document has a distorted picture of what the record holds \u2014 the false-coverage hazard STORE-AS-CACHE.md names, arriving at the document level, making an inquiry look better covered than it is."
  }
];
var SURVEY_SOURCE = "docs/development/PRACTICE-SURVEY.md";
var DESIGN_SOURCE = TABLE_SOURCE;
var PROHIBITION_SET_IS_STANDING = "The skill's own prohibition set comes from the practice survey and is not restated by each build session";
var PROHIBITIONS = [
  {
    id: "no-generated-justification",
    /* PRACTICE-SURVEY "DELIBERATELY VIOLATE" 2 — THE SHARP ONE. */
    text: "No generated justification, reason, template or suggested wording anywhere",
    because: "A justification is read later as that member's own act; a generated one is a fabricated attribution.",
    source: SURVEY_SOURCE,
    also_named_in: "no generated justification anywhere",
    in_practice: "The run's own account of its own proposal is its own words and is attributed to the run \u2014 that is the description a version carries, and writing it is required. What is forbidden is producing the words a MEMBER will be recorded as having said: a reason for a disposition, a justification for a lens, a suggested wording for a field somebody else signs. Where such a field is wanted and no member has written it, the field is left empty and the emptiness is reported, because undetermined is first-class and must be stated.",
    enforced_by: [
      C.cannot_conclude,
      C.cannot_publish,
      C.cannot_ground,
      C.ground_unasserted,
      C.hunch_needs_author,
      C.unwritable_state
    ],
    does_not_reach: "prose. Nothing refuses a well-formed sentence in a field an automated caller IS allowed to fill, and nothing could \u2014 a check that judged whether wording was generated would be a claim to a competence no check here has. What the fences above do is narrower and is worth stating exactly: the ACTS that carry a member's justification are unreachable to an automated credential, so there is no field on those acts for a generated sentence to land in. The residue is the fields a run may legitimately write, and this prohibition is instruction over them."
  },
  {
    id: "no-single-confidence-score",
    /* PRACTICE-SURVEY "DELIBERATELY VIOLATE" 3. */
    text: "No single confidence score",
    because: "Strength is weakest-link over graded legs, and an undetermined leg must remain visible as undetermined rather than being smoothed into a number.",
    source: SURVEY_SOURCE,
    also_named_in: "no single confidence score",
    in_practice: "Report what the record computed, in the shape the record computes it: a pair, per axis, over the declared partition, with the ungraded legs named beside it. Never one figure, never a percentage, and never a word standing in for one. An ungraded leg is inert and NAMED, which is the opposite of averaged.",
    enforced_by: [C.strength_composed, C.strength_unfiltered],
    does_not_reach: "a number written into PROSE. The refusal above is on the record's own strength answer, which may not report one overall figure for a question and may not omit which readings it counted. A description that says 'about eighty per cent confident' is a sentence, and the boilerplate fence is the only check that reads a description at all."
  },
  {
    id: "no-connection-density-ranking",
    /* PRACTICE-SURVEY "DELIBERATELY VIOLATE" 4. */
    text: "No connection-density or centrality ranking, and no graph view that rewards it",
    because: "Connectedness is a property of the drawing, not evidence. Where BIO must draw edges, the grade travels with the edge and an ungraded edge renders as undetermined, not as a thinner line that reads as weaker-but-real.",
    source: SURVEY_SOURCE,
    also_named_in: "no connection-density ranking",
    in_practice: "Do not order anything by how many edges touch it, and do not offer how-connected as a reason for looking at something. A subject worth searching is worth searching because of what the record says about it, and the reason is written down.",
    enforced_by: [],
    unenforced_because: "there is nothing to refuse yet, and saying so is more honest than citing a fence that would fire on something else. Nothing in this plane computes a degree, a centrality or a density over the record's edges \u2014 there is no such op, no such field and no such answer \u2014 so this prohibition is a standing bound on what may be BUILT rather than a rule a run can break today. It becomes enforceable the day a surface ranks anything, and on that day the fence belongs beside the ranking and not here.",
    does_not_reach: "anything at all, which is exactly what makes it worth publishing rather than assuming: this is the one prohibition in the set with no code behind it, and a reader must not take the other four's C-numbers as covering it."
  },
  {
    id: "machine-proposed-is-never-a-connection",
    /* PRACTICE-SURVEY "DELIBERATELY VIOLATE" 5. */
    text: "Machine-proposed connections are never presented as connections",
    because: "D-82: a derived thing must LOOK derived, because what the member needs to know is that nobody has judged it yet.",
    source: SURVEY_SOURCE,
    also_named_in: "machine-proposed connections never presented as connections",
    in_practice: "Everything this run puts forward is a lead for a named member to judge, and it says so in its own words rather than relying on where it is rendered. A candidate is described as a candidate; a match is described as a name that matched; nothing is written in the voice the record uses for what a member has already accepted.",
    enforced_by: [C.unwritable_state, C.cannot_conclude, C.cannot_ground],
    does_not_reach: "the DRESS. Whether a surface renders a suggested version differently from an accepted one is a fact about the surface, and no check in the plane can see a rendering. What the plane does hold is the STATE \u2014 a suggestion may only ever arrive as something put forward, and the acts that would make it the record's own answer are unreachable from here. D-82's requirement that the appearance communicate it is the surfaces' obligation and is stated here as one this text cannot meet."
  },
  {
    id: "no-boilerplate-to-clear-a-gate",
    /* §14b.5, and the one prohibition whose source is the DESIGN document rather
       than the survey: the survey's own falsification note predicted it (*"if the
       first published case's exclusion statement is empty or boilerplate across
       several cases … the gate is doing nothing"*) and the design turned it into
       a pre-write check. Its code half is PL-3's and is LANDED. */
    text: "nothing in it is boilerplate",
    because: "a version whose description or reason field is placeholder text is not proposed. The placeholder defect is already measured at human speed (counterparty: to be named satisfying a non-empty check, PROCESS-INVENTORY); an AI filling required fields to clear a gate is the same defect at machine scale",
    source: DESIGN_SOURCE,
    also_named_in: "nothing in it is boilerplate",
    in_practice: "A required field is filled with an account of something or it is not filled. Where there is nothing to say, say that there is nothing to say and why \u2014 a stated absence is a fact another member can act on, and a token whose only job is to be non-empty reads to them as something somebody wrote.",
    enforced_by: [C.boilerplate],
    does_not_reach: "prose that is empty without being a token. The predicate behind the C-number states this limit at its own site and this prohibition inherits it rather than improving on it: a machine writing 'the relevant department' gets past every form in the roster. What the check DOES catch is the machine-scale shape \u2014 a required field carrying a placeholder \u2014 and it is matched against the whole field rather than as a substring, so a real sentence that quotes a placeholder is not refused."
  }
];
var PERMITTED_AUTO_COMPOSITION = {
  id: "assemble-the-members-own-prior-words",
  text: "Assembling a member's OWN prior annotations into a note",
  permitted_because: "Permitted precisely because it generates no new words.",
  the_line: "it assembles the member's OWN prior words and never generates new ones",
  and_the_other_side: "Assembling what a member already wrote is not attribution; drafting a justification for them is.",
  source: SURVEY_SOURCE,
  also_named_in: "the one permitted auto-composition is assembling the member's OWN prior words",
  in_practice: "Where a member's own words already exist in the record, they may be gathered, ordered and shown with what each one came from. Nothing may be added between them, nothing smoothed, and the assembly names whose words these are and where each was written.",
  /* THE BOUNDARY IS WHAT MAKES THE PERMISSION SAFE, so it is carried with it
     rather than left to be inferred from the prohibition it sits under. */
  stops_at: "the first new word. A connective sentence written to make the excerpts read well is generated wording, and it is the first prohibition's subject however small it is."
};
var GATE_ADDRESS = {
  file: "agent-worker/src/harness.mjs",
  owned_by: "FL-3 (IS-9, the run harness) \u2014 landed, and outside this area's paths",
  modes_export: "MODES",
  table_export: "CONTROL_FLOW",
  row: "gate-mode",
  first_step_export: "FIRST_STEP",
  decision_function: "nextStep",
  why_it_is_first: "a run in a mode that is not deployed terminates before it has spent anything, so the gate cannot be reached around by exhausting something else first"
};
var SEQUENCING_SOURCE = TABLE_SOURCE;
var SEQUENCING_ALSO_NAMED_IN = "docs/archive/IS-SWEEP-2026-08-07.md";
var DEPLOYMENT_SEQUENCE = {
  id: "check-deploys-first",
  /* THE SEQUENCING, AND THE POSITION IN THIS ARRAY IS THE CLAIM: index 0 is the
     mode that deploys first, and every later index is a mode that enables only
     after the one before it has been verified live. */
  /* `extract` APPENDED 2026-09-14 by FLEET on SK-8's delegation, IN THE SAME
     COMMIT as the row entered `agent-worker/src/harness.mjs`'s `MODES` — which
     is ARM B3's whole demand (the two rosters are ONE set, held in both
     directions) and ARM B4's (index 0 stays the only deployed mode; every later
     index, `extract` included, is not). The pack's digest moves with this line
     by construction and nothing needs bumping by hand. */
  order: ["check", "investigate", "extract"],
  first_deployed_mode: "check",
  /* §2, VERBATIM. Looked up in the design document through SK-1's normaliser,
     because a session cannot verify its own copying by re-reading it. */
  text: "CHECK IS THE FIRST DEPLOYED MODE",
  role: "this session, run with this objective against an EXISTING conclusion, IS DEC-24's CHECK role \u2014 the record read adversarially, by the machine aimed at self-directed overclaiming, the threat model the doctrine names",
  because: "also the safest first deployment, because a run over a concluded inquiry has the smallest authorisation surface and the clearest ground truth to be measured against",
  satisfies: "Deploying that mode first satisfies the enacted instruction without a second architecture",
  source: SEQUENCING_SOURCE,
  /* AND PINNED A SECOND TIME, TO A DOCUMENT THAT PHRASES IT DIFFERENTLY. SK-3's
     standard: one pin proves the sentence was copied; two prove the RULING is
     the one both surfaces carry, so a sequencing quietly reversed on either
     fails here rather than in a review nobody re-runs. */
  also_named_in: "DEC-55's enacted CHECK-first instruction and DEC-60 are satisfied by one build: the session run with \xA72's objective against an existing conclusion IS the CHECK role; deploy that mode first. No second architecture.",
  also_named_in_source: SEQUENCING_ALSO_NAMED_IN,
  /* WHAT MUST HAPPEN BEFORE THE SECOND MODE ENABLES, AND WHO OWNS IT. Neither
     half is this area's, and saying so is the point rather than a disclaimer. */
  enabling_condition: "CHECK's FIRST LIVE RUN, verified in the instance's own scratch namespace against a CONCLUDED inquiry, swept after, with `op=audit` clean.",
  enabling_condition_owned_by: "VF-4, which waits on DS-4 (DIST's gated deploy)",
  /* THE HONEST STATE OF THAT CONDITION AT THIS COMMIT, AS DATA RATHER THAN AS A
     SENTENCE IN A COMMENT — so the suite can assert it and so a later session
     cannot leave it stale by editing prose around it. `null` is not "unknown":
     it is "no live run has been verified", and the suite holds it against the
     landed flag, which is still `false`. */
  verification_recorded: null,
  /* HOW THE SECOND MODE ACTUALLY ENABLES, and it is deliberately not a switch. */
  enables_how: "by an EDIT to the landed table under review \u2014 `MODES.investigate.deployed`. A mode that could be enabled by a request parameter would be a gate the caller holds, which is no gate at all.",
  gate: GATE_ADDRESS,
  /* NO C-NUMBER, AND THAT IS A FACT ABOUT THE RECORD RATHER THAN AN OMISSION
     HERE. Nothing in the check catalogue refuses a mode, so citing a C-number
     would be citing something that does not exist. `enforced_by_row` is a THIRD
     kind of backing beside SK-2's C-numbers and SK-3's instruction-only, and the
     suite prints all three rather than collapsing them — a control-flow row is
     code, but it is not a refusal at the record's edge and must not be tallied
     as one. */
  enforced_by: [],
  enforced_by_row: `${GATE_ADDRESS.file}:${GATE_ADDRESS.table_export}["${GATE_ADDRESS.row}"]`,
  /* REQUIRED, AND MEASURED. Every clause is re-measured by the suite against the
     landed sources rather than believed. */
  does_not_reach: "a DEPLOYMENT. The gate refuses a RUN whose mode is not deployed; nothing refuses shipping a build with the flag already flipped, and no instrument reads a release note. It also does not reach the RECORD: `ai_runs.mode` is free text in the plane's schema with no vocabulary check and no C-number over it, so a caller that never runs this harness can open a run in any mode string at all and the plane will store it. What the gate refuses is one fleet member's own control flow, which is the smallest authorisation surface \xA72 asked for and is also the whole of its reach. And it cannot verify its own enabling condition: `deployed: true` is an edit, and the REVIEW of that edit \u2014 not this text and not that flag \u2014 is what holds CHECK's live verification in front of it.",
  /* THE ONE SENTENCE THIS RECORD EXISTS TO MAKE UNAMBIGUOUS. */
  holds_no_gate: "This record is INSTRUCTION about an order. It refuses nothing. A model ignoring every word of it gets past nothing, because the row at `gate-mode` runs before anything it could ignore."
};
var ABSENCE_FACTS = {
  meaning: {
    fact: "no meaning derived",
    does_not_mean: "that there is nothing here to derive meaning from. It may mean nothing was extracted."
  },
  content: {
    fact: "nothing extracted",
    does_not_mean: "that the documents say nothing. It may mean the document was never read."
  },
  document: {
    fact: "no document",
    does_not_mean: "that no such document exists. It may mean nobody looked."
  },
  internet: {
    fact: "nobody looked",
    does_not_mean: "that the material is not out there. This is where the chain ends, so the honest answer is which state the search reached and nothing beyond it."
  }
};
function reportsAs(level) {
  return SUGGEST_LEVELS.find((s) => s === level || s === level + "s") ?? null;
}
var LICENSES_A_CONCLUSION = Object.keys(OBSERVATION_STATES).filter((s) => DEFINITIVE_STATES.has(s));
var LICENSES_NOTHING = Object.keys(OBSERVATION_STATES).filter((s) => !DEFINITIVE_STATES.has(s));
function absenceByLevel() {
  const levels = Object.keys(OBSERVATION_LEVELS);
  const out = {};
  levels.forEach((level, i) => {
    const authored = Object.prototype.hasOwnProperty.call(ABSENCE_FACTS, level) ? ABSENCE_FACTS[level] : null;
    out[level] = {
      level,
      level_is: OBSERVATION_LEVELS[level],
      /* WHICH ABSENCE. Null when this file holds no fact for a level the record
         has — an honest hole rather than a level silently sharing another's
         words. */
      states_when_absent: authored ? authored.fact : null,
      does_not_mean: authored ? authored.does_not_mean : null,
      /* The level to ask before concluding anything from this one, and null at
         the end of the chain. */
      ask_next: i + 1 < levels.length ? levels[i + 1] : null,
      /* What a run WRITES for this level on each of the two surfaces. */
      logged_as: level,
      reported_as: reportsAs(level),
      /* And in which words the absence is stated. Imported, both of them. */
      states: Object.keys(OBSERVATION_STATES),
      licenses_a_conclusion: LICENSES_A_CONCLUSION,
      licenses_nothing: LICENSES_NOTHING
    };
  });
  return out;
}
var COMPOSITION = {
  /** The roles a leg may take against a claim — imported, and the point of §5 is
   *  that one piece of evidence may be doing several of these at once against
   *  different claims. */
  roles: BASIS_ROLES,
  /** The grade sources a machine-composed leg may carry, because the record
   *  earned them. Imported. */
  grade_arrives_from: EARNED_GRADE_SOURCES,
  /** The source that is a member's own marking and is unreachable from here
   *  (DEC-15). Imported from the roster the strength walk already treats as
   *  inert, so this file names it nowhere. */
  unreachable_to_a_machine: VERSION_STRENGTH_INERT_SOURCES,
  ungraded_leg: "inert, and NAMED. It contributes nothing to the calculation, floors nothing and unrates nothing \u2014 and it is named in the description, per axis, with the reason. Inert never means invisible (DEC-18).",
  where_the_grades_come_from: "the resolutions the legs rest on, through the record's earned-basis registry, exactly as `op=cite` already fills them"
};
var DESCRIPTION_STANDARD = {
  held_to: "a commit message's standard: what this composition says and why",
  must_carry: [
    "what this reading of the evidence is, in substance",
    "why these legs, arranged this way, tell it",
    "every ungraded leg, named, with why the record earned nothing for it",
    "what was searched and not found, and which absence that is",
    "which judgements the weighing rests on, where it rests on judgement"
  ],
  read_the_ungraded_legs_from: "the record's own answer rather than from memory \u2014 the strength answer publishes the ungraded legs and the hunched ones beside the graded ones, per axis and with the reason",
  why_it_is_load_bearing: "the conversation that produced a version is deliberately not part of the permanent record (DEC-61), so the description is the only durable account of the reasoning"
};
function judgementLayers() {
  const byArea = (area) => CLAUSES.filter((c) => c.area === area);
  return {
    composition: {
      load_when: "the run composes or revises a version of an inquiry's basis",
      sourcing: "authored",
      body: { clauses: byArea("composition"), composition: COMPOSITION }
    },
    description: {
      load_when: "the run writes the description a version carries",
      sourcing: "authored",
      body: { clauses: byArea("description"), standard: DESCRIPTION_STANDARD }
    },
    search: {
      load_when: "the run decides what to look for, or must account for where it stopped",
      sourcing: "authored",
      body: { clauses: byArea("search"), evidence: LOOP_TERMINATION_EVIDENCE }
    },
    absence: {
      load_when: "the run reports that a level is empty, or reads an empty answer from one",
      sourcing: "authored",
      body: { clauses: byArea("absence"), by_level: absenceByLevel() }
    },
    /* SK-3. RESIDENT-ADJACENT BY ITS `load_when` RATHER THAN BY A NEW MECHANISM:
       the prohibitions bear on everything a run writes, so the work that loads
       them is "anything a member will read", and the layer says so instead of
       naming one step. The pack's own split (§14b.1) is between what must be
       held from the first token and what is fetched; this is fetched, and a run
       that composes without fetching it is a run whose output the boilerplate
       fence and the machine fences still refuse — which is the point. */
    prohibitions: {
      load_when: "the run writes anything a member will read, or is tempted to fill a field it cannot fill honestly",
      sourcing: "authored",
      body: {
        prohibitions: PROHIBITIONS,
        permitted_auto_composition: PERMITTED_AUTO_COMPOSITION,
        standing: PROHIBITION_SET_IS_STANDING,
        copied_from: SURVEY_SOURCE,
        restated_in: DESIGN_SOURCE,
        note: "these are PROHIBITIONS and they are INSTRUCTION. Each names the C-numbers that actually refuse and, separately, what those C-numbers do NOT reach \u2014 a prohibition reading as a fence when it is a sentence is the defect \xA714b.4 names, and a partially enforced one reading as a fully enforced one is the same defect wearing a citation. One of the five has no code behind it at all and says so."
      }
    },
    /* SK-4. IT LOADS AT LAUNCH AND NOWHERE ELSE, because that is the only moment
       the order it records is about — and because a layer fetched later would be
       a layer fetched after the gate has already answered. The layer carries the
       ADDRESS of the thing that actually refuses, so a run reading this learns
       where the gate is rather than being told what it says. */
    deployment_sequence: {
      load_when: "the run is launched, or a member asks which mode is deployed and why",
      sourcing: "authored",
      body: {
        sequence: DEPLOYMENT_SEQUENCE,
        gate: GATE_ADDRESS,
        ruled_in: SEQUENCING_SOURCE,
        restated_in: SEQUENCING_ALSO_NAMED_IN,
        note: "this layer is INSTRUCTION and it holds no flag. The mode that is deployed is read from FL-3's landed table at the address above, which is CODE and is the first row every run takes; this text neither restates that flag nor could change it. What it adds is the REASON for the order and the enabling condition for the second mode, both of which are facts a run should be able to state and neither of which any code can be asked to hold."
      }
    },
    judgement_boundary: {
      load_when: "always available on request: what this skill decides and what it never decides",
      sourcing: "authored",
      body: {
        clauses: [...byArea("bias"), ...byArea("boundary"), ...byArea("disclosure")],
        decided_here: JUDGED_ROWS,
        decided_by_the_harness: DEFERRED_ROWS,
        table_source: TABLE_SOURCE,
        /* STATED IN THE PACK ITSELF, so a run reading this layer learns what
           this text is and is not. */
        note: "this layer is INSTRUCTION. Every fence it names is enforced somewhere else, by code, and a reader that ignored every sentence here would get past nothing that the harness and the check catalogue do not already refuse. What is listed as decided by the harness is FL-3's deterministic control-flow table, which is code; this text cites it and restates none of it."
      }
    }
  };
}
var JUDGEMENT_VERSION = `${JUDGEMENT_ID}@${JUDGEMENT_EDITION}`;

// ../bio-plane/src/skillpack.mjs
var SKILL_PACK_ID = "investigative-session";
var DOCTRINE_EDITION = "1";
var OBJECTIVE = "Formulate claims and legs SUPPORTED BY EVIDENCE. The goal is not to support or disprove a position.";
var BOUNDARY = "The AI holds no op that ACCEPTS anything. Nothing it can call concludes, accepts, publishes, or makes a version current.";
var FOUR_LEVEL_RULE = "Absence at one level is not evidence of absence at the next";
var SEARCH_COMPLETENESS = "NEVER ASSUME THE LOWER LEVELS ARE COMPLETE.";
var AUTHORED_SOURCES = {
  OBJECTIVE: "docs/development/INVESTIGATIVE-SESSION.md",
  BOUNDARY: "docs/development/INVESTIGATIVE-SESSION.md",
  FOUR_LEVEL_RULE: "CLAUDE.md",
  SEARCH_COMPLETENESS: "CLAUDE.md"
};
var ABSENCE_ANSWER_SHAPE = ["level", "state", "searched", "not_searched"];
var SOURCING = {
  objective: "authored",
  boundary_rule: "authored",
  four_level: "authored",
  levels: "imported",
  /* airun.mjs OBSERVATION_LEVELS */
  absence: "imported",
  /* airun.mjs OBSERVATION_STATES */
  fences: "imported",
  /* checks/bio-checks.mjs, the MACHINE_CANNOT_ rows */
  bounds: "imported",
  /* airun.mjs RUN_BOUNDS + RUN_ENDINGS */
  refusals: "imported",
  /* checks/bio-checks.mjs AI_RUN_CHECKS */
  vocabularies: "driven",
  /* op=affordances .vocabularies */
  acts: "driven",
  /* op=affordances .catalog */
  member_only: "driven",
  /* op=affordances .catalog, the mode field */
  recipes: "absent",
  /* STILL absent, and the reason is unchanged — see the header */
  /* SK-2's five layers. `authored` throughout, and the label is the honest one:
     they are doctrine somebody wrote. Their vocabularies are imported and their
     quoted sentences are pinned to the documents they come from, which is the
     drift defence — the sourcing label is not. */
  judgement: "authored"
  /* skilldoctrine.mjs — SK-2 */
};
function machineFences(catalogue) {
  const out = [];
  for (const [family, rows] of Object.entries(catalogue || {})) {
    if (!/_CHECKS$/.test(family) || !rows || typeof rows !== "object") continue;
    for (const [code, row] of Object.entries(rows)) {
      if (!code.startsWith(MACHINE_FENCE_PREFIX)) continue;
      if (!row || typeof row.translation !== "string" || !row.translation) continue;
      out.push({ code, family, check: row.check ?? null, says: row.translation });
    }
  }
  return out.sort((a, b) => a.code < b.code ? -1 : a.code > b.code ? 1 : 0);
}
var MACHINE_FENCE_PREFIX = "MACHINE_CANNOT_";
function memberOnlyActs(catalog) {
  const rows = Array.isArray(catalog) ? catalog : [];
  return rows.filter((a) => a && typeof a.mode === "string" && a.mode !== MACHINE_MODE).map((a) => ({
    id: a.id,
    label: a.label ?? null,
    mode: a.mode,
    prompt: a.prompt ?? null
  })).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}
var MACHINE_MODE = "machine";
function renderPack(published, catalogue) {
  const p = published && typeof published === "object" ? published : {};
  const vocabularies = p.vocabularies && typeof p.vocabularies === "object" ? p.vocabularies : null;
  const catalog = Array.isArray(p.catalog) ? p.catalog : null;
  if (!vocabularies || Object.keys(vocabularies).length === 0)
    throw new Error("the pack renders the plane's PUBLISHED vocabulary and invents none, so it cannot be rendered against an empty one: op=affordances published no vocabularies");
  if (!catalog || catalog.length === 0)
    throw new Error("the pack renders the plane's PUBLISHED act catalogue and invents none, so it cannot be rendered against an empty one: op=affordances published no acts");
  const fences = machineFences(catalogue);
  if (fences.length === 0)
    throw new Error("the machine/member boundary is rendered from the check catalogue's own canned translations and this pack writes none of its own: no fence row was harvested");
  const memberOnly = memberOnlyActs(catalog);
  if (memberOnly.length === 0)
    throw new Error("the machine/member boundary names the acts a machine credential cannot reach, read from the published `mode`: the catalogue published none");
  const levels = Object.keys(OBSERVATION_LEVELS);
  const states = Object.keys(OBSERVATION_STATES);
  if (levels.length === 0 || states.length === 0)
    throw new Error("the four-level rule and the absence vocabulary are imported from airun.mjs and one of them is empty; a rule stated in words nobody holds is not a rule");
  const resident = {
    objective: { text: OBJECTIVE, source: AUTHORED_SOURCES.OBJECTIVE, sourcing: SOURCING.objective },
    boundary: {
      rule: BOUNDARY,
      source: AUTHORED_SOURCES.BOUNDARY,
      sourcing: SOURCING.boundary_rule,
      /* The fences in the plane's own words, verbatim, never paraphrased. */
      fences,
      fences_sourcing: SOURCING.fences,
      member_only_acts: memberOnly,
      member_only_sourcing: SOURCING.member_only,
      /* STATED, because the subset is the honest description of what was
         rendered and an unstated limit reads as completeness. */
      fences_note: "the fences rendered here are those carrying a canned translation; the plane can refuse a machine in words this pack does not hold, and this pack paraphrases none of them"
    },
    four_level: {
      rule: FOUR_LEVEL_RULE,
      completeness: SEARCH_COMPLETENESS,
      source: AUTHORED_SOURCES.FOUR_LEVEL_RULE,
      sourcing: SOURCING.four_level,
      levels: OBSERVATION_LEVELS,
      levels_sourcing: SOURCING.levels,
      answer_shape: ABSENCE_ANSWER_SHAPE
    },
    absence: { states: OBSERVATION_STATES, sourcing: SOURCING.absence },
    /* WHAT MAY BE ASKED FOR. The disclosed layer's NAMES are resident — a run
       that does not know a layer exists cannot ask for it — and its bodies are
       not. That is the whole of progressive disclosure as a mechanism rather
       than an intention (§14b.1). */
    disclosable: null
    /* filled below, from the disclosed layer's own keys */
  };
  const disclosed = disclosedLayers(
    { vocabularies, catalog, captureActs: p.capture_acts },
    catalogue
  );
  resident.disclosable = Object.keys(disclosed).map((k) => ({ layer: k, load_when: disclosed[k].load_when }));
  const pack = {
    id: SKILL_PACK_ID,
    edition: DOCTRINE_EDITION,
    resident,
    disclosed,
    sourcing: SOURCING
  };
  return { ...pack, version: packVersion(pack) };
}
function disclosedLayers({ vocabularies, catalog, captureActs } = {}, catalogue) {
  return {
    /* SK-2's judgement layers first, so `disclosable` lists what the run is
       INSTRUCTED BY before what it is given to work with. Spread from one
       function rather than restated here: `skilldoctrine.mjs` decides what its
       layers are and this file never holds a second list of them, so a layer
       added there arrives in the pack — and in the pack's version — without an
       edit here. */
    ...judgementLayers(),
    vocabularies: {
      load_when: "the run composes a version, or renders any closed set to a member",
      sourcing: SOURCING.vocabularies,
      body: vocabularies
    },
    acts: {
      load_when: "the run needs to know what a member could do next with what it proposes",
      sourcing: SOURCING.acts,
      body: { catalog, capture_acts: Array.isArray(captureActs) ? captureActs : [] }
    },
    bounds: {
      load_when: "the run opens, resumes, or must say which bound stopped it",
      sourcing: SOURCING.bounds,
      body: { bounds: RUN_BOUNDS, endings: RUN_ENDINGS }
    },
    refusals: {
      load_when: "the run is refused, and must surface the record's own words rather than its own",
      sourcing: SOURCING.refusals,
      body: Object.fromEntries(Object.entries(AI_RUN_CHECKS).map(([code, row]) => [code, { check: row.check, says: row.translation }]))
    },
    recipes: {
      load_when: "never, in this edition",
      sourcing: SOURCING.recipes,
      body: [],
      /* THE ABSENCE, STATED IN THE PACK ITSELF. A run reading this layer learns
         that the pack holds no recipes, which is a different fact from a pack
         that forgot to carry them. */
      absent_because: "a recipe is DATA whose every step names a surface id and an act, and it is worth having only if a step naming a surface that does not exist FAILS THE BUILD. The surface registry is the interface's and no plane op publishes it, so a recipe authored here could not be validated here. SK-2 landed the judgement layers and left this one empty for that reason rather than for want of an author: it waits on a published surface registry."
    }
  };
}
function canonical2(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return "[" + value.map(canonical2).join(",") + "]";
  return "{" + Object.keys(value).sort().map((k) => JSON.stringify(k) + ":" + canonical2(value[k])).join(",") + "}";
}
function digest(text) {
  let a = 2166136261, b = 16777619;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    a = Math.imul(a ^ c, 16777619) >>> 0;
    b = Math.imul(b ^ c + i, 2246822507) >>> 0;
  }
  return a.toString(16).padStart(8, "0") + b.toString(16).padStart(8, "0");
}
function packVersion(pack) {
  const { version, ...rest } = pack || {};
  return `${SKILL_PACK_ID}@${DOCTRINE_EDITION}+${digest(canonical2(rest))}`;
}

// src/index.mjs
var PLANE_ORIGIN = "http://plane";
var DEFAULT_MAX_TURNS_PER_SEGMENT = 120;
var BOUND_SOURCE = "FL-1 2026-08-08 curve, re-checked by D-312 2026-09-25 (M-168): CPU binds, not memory; 120 turns is ~1/8 of the ~1,000 the 30 s CPU default fits at FL-1's payload size";
var AI_TOKEN_SHAPE = /^aik-[0-9a-f]{64}$/;
var NAMESPACES = Object.freeze(["bio", "scratch"]);
var json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  /* R47: no `access-control-allow-origin`. Nothing but the plane's service binding reaches this member, and
     a header inviting a browser origin was an invitation to a caller it must never have. */
  headers: { "content-type": "application/json" }
});
var refusal3 = (code, detail, status, extra) => json({ ok: false, reason: code, code, detail, worker: "agent-worker", ...extra || {} }, status);
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
    return { refusal: refusal3(
      "NO_SUCH_RUN",
      "the plane holds no run under that id in this namespace, so there is nothing to continue. This member opens no run: a run's identity and its conditions are the plane's, and a member that could open one would be a machine deciding what it was formed under.",
      404,
      { run_id: runId }
    ) };
  const recordedPayer = session.principal?.claude ?? null;
  if (cascade?.available && recordedPayer !== cascade.level)
    return { refusal: refusal3(
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
    let pack;
    try {
      pack = renderPack(pub.result, bio_checks_exports);
    } catch (e) {
      return { refusal: refusal3(
        "PACK_UNRENDERABLE",
        "the skill pack a run's model is instructed by could not be rendered from what the plane published, so no model turn was taken: " + String(e && e.message || e).slice(0, 300),
        502,
        { run_id: runId }
      ) };
    }
    const recordedSkill = session.principal?.skill ?? null;
    if (recordedSkill !== pack.version)
      return { refusal: refusal3(
        "SKILL_VERSION_MISMATCH",
        "the run's record says it runs under one skill pack and the pack this member rendered is another, so its model would be instructed by words the record does not name. No turn was taken; the run is resumable once the two agree.",
        409,
        { run_id: runId, recorded: recordedSkill, rendered: pack.version }
      ) };
    model.pack = pack;
    model.messages = [];
    model.system = parentSystem(pack);
    model.tools = [LOAD_LAYER(Object.keys(pack.disclosed || {})), ...judgeTools(LEVELS)];
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
        return { refusal: refusal3(
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
      return { refusal: refusal3(
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
    const tick = await call(
      "airuntick",
      null,
      { run: runId, log: entry ? [entry] : [], consume }
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
    state = { ...state, level: null, observed: null, governed: false, condition: null };
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
    state = decision.step === "adjust" ? { ...state, step: "adjust", refusedSubmission: state.submission ?? null, adjusted: false } : {
      ...state,
      step: decision.step,
      refusal: null,
      adjusted: false,
      refusedSubmission: null
    };
    if (decision.step === "next-pass") state = { ...state, pass: state.pass + 1 };
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
var modelSilent = (silent, runId) => refusal3(
  "MODEL_SILENT",
  "the model API could not be reached, so no judgement was made at this step and the segment stopped. The run is resumable; nothing the table did before this step is lost.",
  502,
  { run_id: runId, detail_from_model: silent?.detail ?? null }
);
var modelRefused = (refused, runId) => refusal3(
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
var planeSilent = (asked) => refusal3(
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
    return refusal3(
      "PLANE_NOT_CONFIGURED",
      "this member reaches the record only through the plane service binding, and the binding is absent. It holds no store binding and no credential of its own, so with no plane there is nothing it can do and nothing it could pretend to have done.",
      503
    );
  const body = await req.json().catch(() => null);
  if (body == null)
    return refusal3("BAD_BODY", "the request body could not be read as JSON.", 400);
  const runId = typeof body.run_id === "string" ? body.run_id : "";
  const store = typeof body.store === "string" ? body.store : "";
  const credential = typeof body.credential === "string" ? body.credential : "";
  if (!runId || runId.length > 200)
    return refusal3(
      "BAD_RUN_ID",
      "a run is identified by the plane and this member mints no identity of its own; the caller must say which run this segment belongs to.",
      400
    );
  if (typeof body.store !== "string")
    return refusal3(
      "BAD_STORE",
      "a run happens inside one namespace and this member guesses none: the caller must say which. A default namespace here would let a run touch the real record while its caller believed it was working in a scratch one.",
      400
    );
  if (!NAMESPACES.includes(store))
    return refusal3(
      "NAMESPACE_UNKNOWN",
      "a run names the namespace it works in, and no namespace by that name exists on any instance this member can be bound to, so nothing was read or changed. There are two: the record itself and a scratch area kept apart for testing, and the name must match one of them exactly; they are listed beside this message.",
      400,
      { asked: store.slice(0, 80), namespaces: [...NAMESPACES] }
    );
  if (!credential)
    return refusal3(
      "NO_CREDENTIAL",
      "this member holds no credential of its own and cannot act except under one it is handed. There is no fallback identity here by design: a worker that could act unattended would be acting as nobody, and nothing it did could be attributed.",
      401
    );
  if (!AI_TOKEN_SHAPE.test(credential))
    return refusal3(
      "BAD_CREDENTIAL_SHAPE",
      "the credential handed to this member is not shaped like one this plane issues. Whether a well-shaped credential is live, withdrawn, or scoped to this work is the plane's judgement and is never made here.",
      400
    );
  const accountsSupplied = body.claude_accounts != null;
  if (accountsSupplied && (typeof body.claude_accounts !== "object" || Array.isArray(body.claude_accounts)))
    return refusal3(
      "BAD_CLAUDE_ACCOUNTS",
      "claude_accounts, when present, is an object keyed by cascade level (member, project, instance), each entry { token, ref }. This member judges only what it is handed.",
      400
    );
  const cascade = accountsSupplied ? await resolveClaudeCascade(body.claude_accounts) : null;
  if (cascade && !cascade.available)
    return refusal3(
      CASCADE_NO_ACCOUNT,
      cascade.detail,
      409,
      { capability: "unavailable", levels: cascade.levels }
    );
  const bound = Number(env.MAX_TURNS_PER_SEGMENT) > 0 ? Number(env.MAX_TURNS_PER_SEGMENT) : DEFAULT_MAX_TURNS_PER_SEGMENT;
  const requested = body.turns == null ? bound : Number(body.turns);
  if (!Number.isFinite(requested) || requested < 1)
    return refusal3("BAD_TURNS", "turns must be a positive number of model turns for this segment.", 400);
  if (requested > bound)
    return refusal3(
      "SEGMENT_OVER_BOUND",
      `a segment is bounded at ${bound} model turns and ${requested} were asked for. The bound is not a policy choice: it keeps the segment clear of the isolate's CPU ceiling, measured (M-168), which a longer segment would meet. Split the run across segments \u2014 resuming is what segments are for.`,
      400,
      { turns_requested: requested, turns_bound: bound, bound_source: BOUND_SOURCE }
    );
  const asked = await askPlane(env, "whoami", credential, store);
  if (!asked.reached)
    return refusal3(
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
    return refusal3("UNKNOWN", "POST /run or GET /version only.", 404);
  }
};
export {
  SURFACE,
  index_default as default
};
