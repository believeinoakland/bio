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
  if (type === "project")
    return {
      target: null,
      basis: "UNDETERMINED: a run over a project lands on a question the project confirmed-cites, and the run read does not publish that set; a candidate names its own target, never the project id"
    };
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
  const judgedPresent = s.observed === "PRESENT";
  const why = String(d.why || "");
  return {
    level: s.level || null,
    subject: `${String(s.step || FIRST_STEP)} -> ${String(d.step || "?")}`,
    /* NEVER_LOOKED is the honest default for a control-flow entry: the step's
       own transition establishes nothing about the world. A step that DID look
       supplies its own state, and D-129's whole point is that the four are
       different claims — EXCEPT `PRESENT`, which this entry cannot back (see
       the note above `PRESENT_UNBACKED_NOTE`). */
    state: judgedPresent ? "LOOKED_INDETERMINATE" : s.observed || "NEVER_LOOKED",
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

// src/index.mjs
var PLANE_ORIGIN = "http://plane";
var DEFAULT_MAX_TURNS_PER_SEGMENT = 120;
var BOUND_SOURCE = "FL-1 2026-08-08 memory curve (120.4 MB P99 of 128 MB at 200 turns), not the CPU curve";
var AI_TOKEN_SHAPE = /^aik-[0-9a-f]{64}$/;
var STORE_SHAPE = /^[a-z0-9_-]+$/i;
var json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
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
async function driveHarness(env, { runId, store, credential, judgements, maxSteps, cascade = null }) {
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
  let ended = null, steps = 0;
  while (steps < maxSteps) {
    steps += 1;
    const callsAtStepStart = calls;
    const row = CONTROL_FLOW[state.step];
    if (row && row.judged && jx < judgements.length) {
      const applied = applyJudgement(state, judgements[jx]);
      jx += 1;
      if (!applied.ok)
        return { refusal: refusal2(
          "JUDGEMENT_OVERREACH",
          applied.detail,
          400,
          { step: state.step, fields: applied.overreach }
        ) };
      state = applied.state;
    }
    const work = await performStep(call, state, runId);
    if (work.silent) return { refusal: planeSilent(work.silent) };
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
    if (state.observed === "PRESENT") presentUnbacked += 1;
    const tick = await call(
      "airuntick",
      null,
      { run: runId, log: [entry], consume }
    );
    if (!tick.reached) return { refusal: planeSilent(tick) };
    if (tick.status === 200 && tick.body?.ok === true) {
      const t = tick.body.result ?? tick.body;
      const refusedEntries = Array.isArray(t?.refused) ? t.refused : [];
      const appendedNow = t?.appended != null && Number.isFinite(Number(t.appended)) ? Number(t.appended) : t?.ticked === false ? 0 : Math.max(0, 1 - refusedEntries.length);
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
    } else {
      refusals.push({
        at: "airuntick",
        code: tick.body?.reason ?? tick.body?.code ?? null,
        check: tick.body?.check ?? null,
        plane: tick.body ?? null
      });
    }
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
    budget: BUDGET_BOUNDS.map((b) => ({ bound: b, ...state.budget[b] || { allowed: 0, consumed: 0 } }))
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
async function performStep(call, state, runId) {
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
      if (res.status === 200 && res.body?.ok === true && answer.wrote !== false) {
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
  if (!store || !STORE_SHAPE.test(store))
    return refusal2(
      "BAD_STORE",
      "a run happens inside one namespace and this member guesses none: the caller must say which. A default namespace here would let a run touch the real record while its caller believed it was working in a scratch one.",
      400
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
  const bound = Number(env.MAX_TURNS_PER_SEGMENT) || DEFAULT_MAX_TURNS_PER_SEGMENT;
  const requested = body.turns == null ? bound : Number(body.turns);
  if (!Number.isFinite(requested) || requested < 1)
    return refusal2("BAD_TURNS", "turns must be a positive number of model turns for this segment.", 400);
  if (requested > bound)
    return refusal2(
      "SEGMENT_OVER_BOUND",
      `a segment is bounded at ${bound} model turns and ${requested} were asked for. The bound is not a policy choice: it is where the isolate's MEMORY ceiling sits, measured, and a longer segment would not fail cleanly. Split the run across segments \u2014 resuming is what segments are for.`,
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
  const drive = await driveHarness(env, {
    runId,
    store,
    credential,
    cascade,
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
    turns_run: 0,
    judgement_source: "supplied",
    /* CORRECTED AT FL-6, never exempted: this note used to say the model
       account "is FL-6's cascade and is not resolved here". The cascade IS
       resolved here now, and the honest remainder is different — the account
       is resolved and NAMED, and what still does not happen is a MODEL TURN,
       whose sizing is D-218's measurement and not this item's. */
    judgement_note: "the control-flow table is FL-3's and it ran; the Claude account that would pay for a model turn is resolved by FL-6's cascade and named beside this. What has not happened is a model turn itself (turns_run: 0) \u2014 running one is sized by D-218 and is not this segment's claim \u2014 so judgements arrived from the caller. Stated rather than presented as a model run.",
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
    segment: { turns_requested: requested, turns_bound: bound, bound_source: BOUND_SOURCE },
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
