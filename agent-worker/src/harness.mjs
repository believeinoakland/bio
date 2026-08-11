/* FL-3 / IS-9 — THE RUN HARNESS, AS A DETERMINISTIC CONTROL FLOW TABLE.
 *
 * `INVESTIGATIVE-SESSION.md` §14b.4 is the whole item in one sentence: *"do not
 * let the model decide control flow that should be guaranteed. Loops, fan-out
 * and gates are deterministic; judgement happens inside a step."* And §14b.4's
 * evidential case is measured rather than stylistic — TREC 2011 found searchers
 * estimating their own recall erred by up to +95/-87 points and terminated
 * review prematurely on a false belief of high recall, so **the model never
 * decides when the loop stops.**
 *
 * SO THIS FILE IS A TABLE AND NOT A NARRATIVE, AND THAT DISTINCTION IS THE
 * ITEM. What the harness does next must be a ROW A SUITE CAN DRIVE, not a
 * sentence a model reads. Everything below is therefore:
 *
 *   - PURE. No fetch, no clock, no storage, no `globalThis`. `queuestate.mjs`'s
 *     recorded reason, one Worker over: "a rule that can only be exercised
 *     through a Durable Object is a rule that gets exercised less." The whole
 *     table can be walked in a plain node process with no miniflare at all, and
 *     `test/harness.test.mjs` walks it BOTH ways — pure, and through `POST /run`
 *     inside workerd — because a table proven only through the op is a table
 *     nobody can exhaust, and one proven only in the pure harness is a table
 *     nobody has run.
 *   - DATA. `CONTROL_FLOW` is an object of rows, each declaring the steps it may
 *     go `to`. `nextStep` may not return a step outside its row's `to` set, and
 *     the suite asserts that over an exhaustive state walk rather than trusting
 *     it. A table whose implementation can leave a row illegally is decoration.
 *
 * ---------------------------------------------------------------------------
 * WHAT THE PLAN ROW REQUIRES THIS TABLE TO CARRY, AND WHERE EACH ONE IS
 * ---------------------------------------------------------------------------
 *
 *   pass count and loop termination ....... `next-pass`, and `stopBecause` above
 *                                           every row — the model supplies no
 *                                           input to either
 *   four-level fan-out .................... `fanout`, over LEVELS, all four, in
 *                                           a fixed order, one sub-session each
 *   dedup-before-write .................... `dedup`, and there is NO EDGE from
 *                                           `compose` to `submit`. The ordering
 *                                           is the table's shape, not a rule a
 *                                           step remembers
 *   log-always ............................ every row carries `logs: true`, and
 *                                           `stepLog` builds the entry. §14b.6:
 *                                           the log is written whether or not
 *                                           the run succeeds
 *   denied-means-adjust (F10) ............. `submit --refused--> adjust`, and
 *                                           `adjust` may only return to `submit`
 *                                           with a CHANGED submission. See the
 *                                           F10 block below — this is the row
 *                                           the item is named for
 *   query-never-load ...................... PLANE_OPS. The meaning-grain read is
 *                                           PL-9's `op=meaningrows` and this
 *                                           item CONSUMES it; no op in the set
 *                                           returns document bytes
 *   versions as formed, never batched ..... `submit` takes ONE candidate off the
 *                                           head of the queue. There is no
 *                                           submit-all and no batch shape to
 *                                           write one
 *   budget: fetches, sub-sessions, wall ... BUDGET_BOUNDS, spent through the
 *                                           plane's own `op=airuntick` so the
 *                                           record's producer writes the
 *                                           condition — never a second producer
 *                                           here
 *
 * ---------------------------------------------------------------------------
 * F10 — DENIED MEANS ADJUST, AND WHY THE BUDGET IS NOT THE MECHANISM
 * ---------------------------------------------------------------------------
 *
 * PL-3 built F10's plane side: a verbatim resubmit is keyed on the canonical
 * submission BYTE FOR BYTE plus the inquiry's `bundle_sha`, returns the stored
 * refusal WITHOUT re-running the six checks, and climbs a `repeats` counter.
 * That counter is what makes a retry loop visible to something other than the
 * budget — and this table is the thing that must make it stay at ZERO on a
 * well-behaved run.
 *
 * So a refusal does not route back to `submit`. It routes to `adjust`, and
 * `adjust` is a row with a PRECONDITION the code enforces: the submission it
 * hands back must differ from the one that was refused. `adjustedFrom` compares
 * the two canonically; if the judgement supplied no change, the candidate is
 * DROPPED rather than resent. A run that cannot adjust has learned something,
 * and sending the same bytes again would learn nothing while costing a write
 * path and a counter.
 *
 * **THE BUDGET IS THE BACKSTOP, NOT THE MECHANISM.** A design in which the only
 * thing stopping a retry loop is the budget running out is a design that pays
 * full price for the loop before noticing it, and — worse — reports the budget
 * as the reason a run stopped when the real reason was that it never adjusted.
 * `stopBecause` would then name `fetches` on a run whose actual fault was F10.
 *
 * ---------------------------------------------------------------------------
 * THE INVESTIGATE-MODE GATE IS A ROW IN THIS TABLE (SK-4)
 * ---------------------------------------------------------------------------
 *
 * §2: CHECK is the first deployed mode — the same session run against an
 * EXISTING conclusion, the record read adversarially, aimed at self-directed
 * overclaiming. Smallest authorisation surface, clearest ground truth. The
 * investigate-fresh mode enables only after CHECK's first live run is verified
 * (VF-5), and SK-4 RECORDS that sequencing rather than enforcing it.
 *
 * **WHICH IS EXACTLY WHY THE GATE IS HERE AND NOT IN THE SKILL.** A gate in a
 * prompt is the defect §14b.4 names. `gate-mode` is the FIRST row every run
 * takes, it reads a flag the caller cannot set from inside a judgement, and a
 * run in a mode that is not deployed terminates on `mode-not-deployed` before
 * it has spent anything.
 *
 * **THAT SENTENCE WAS FALSE WHEN IT WAS WRITTEN AND IS TRUE NOW — FL-7,
 * 2026-08-10, IC-62.** From FL-3 until FL-7 this header named
 * `mode-not-deployed` while the `gate-mode` branch of `nextStep`, far below in
 * this same file, closed on `cancelled` — and `mode-not-deployed` existed
 * NOWHERE ELSE IN THE REPOSITORY:
 * not in the plane's `RUN_ENDINGS`, not in its `RUN_BOUNDS`, only here. So the
 * header described a value that did not exist while the code produced one that
 * said "a member stopped it" about a run no member touched. SK-4 measured both
 * halves and delegated the call; FL-7 closed it by ADDING the ending the header
 * had already named, rather than by editing this sentence down to match the
 * defect — the disagreement was the symptom and the misattribution was the bug.
 *
 * **AND THE AGREEMENT IS NOW ASSERTED IN BOTH DIRECTIONS, which is the half
 * that stops it recurring.** `test/harness.test.mjs` A6b reads this file and
 * the plane's `airun.mjs` as TEXT and holds two claims that fail independently:
 * every ending named in this header must EXIST in the plane's catalogue, and
 * the ending the gate actually closes on must be the one this header names.
 * One direction alone is what allowed the original drift — a comment nobody
 * could contradict. **Neither side is the expectation for the other's test:**
 * the catalogue is read from the plane's own source, never from a literal
 * copied into the arm, because an expectation derived from the subject moves
 * with it and proves nothing (three items shipped exactly that on 2026-08-10).
 * ========================================================================= */

/* THE FOUR LEVELS, IN FAN-OUT ORDER.
 *
 * CLAUDE.md's standing section: when anything goes looking it "may need to
 * search meaning, content, documents, AND the open internet, in any order", and
 * "sparse is the normal condition at every level" — absence at one level is not
 * evidence of absence at the next.
 *
 * THIS IS A COPY OF THE PLANE'S `OBSERVATION_LEVELS` AND IT IS PINNED RATHER
 * THAN IMPORTED, which is a decision and not laziness. Importing
 * `../../bio-plane/src/airun.mjs` would drag the plane's module graph into this
 * Worker's bundle — the fleet's whole point is that a member ships alone — and
 * the plane publishes no op that names the levels, so there is nothing to read
 * at runtime. What closes the drift is a SOURCE PIN: `harness.test.mjs` reads
 * `OBSERVATION_LEVELS` out of the plane's own file and asserts this array is
 * exactly its key order. A fifth level added there fails this member's suite
 * rather than silently going unsearched, which is the failure a hand-kept copy
 * normally has and the reason D-113's purge list is this project's stock
 * example. */
export const LEVELS = ["meaning", "content", "document", "internet"];

/* THE MODES (§2/§10), and WHICH ONE IS DEPLOYED.
 *
 * `check` is DEC-24's CHECK role and it deploys first. `investigate` is the
 * fresh-investigation mode and it is NOT deployed: `deployed: false` here is the
 * gate `gate-mode` reads, and VF-5's verification of CHECK's first live run is
 * what flips it. Flipping it is an EDIT TO THIS FILE under review — which is the
 * point, because a mode that could be enabled by a request parameter would be a
 * gate the caller holds. */
export const MODES = {
  check:       { deployed: true,
                 does: "read an EXISTING conclusion adversarially (DEC-24's CHECK role, §2)" },
  investigate: { deployed: false,
                 does: "investigate fresh — enabled only after CHECK's first live run is verified (VF-5/SK-4)" },
};

/* §14b.6's budget, in the plane's OWN bound names (`bio-plane/src/airun.mjs`
   RUN_BOUNDS). Three of the five are the run harness's to SPEND — the design's
   own enumeration, "fetches requested, sub-sessions spawned, wall time across
   resumptions". `lease` is the plane's heartbeat and `runtime` is the ceiling
   the platform imposes; neither is something this table decides to consume, and
   both are named here as NOT OURS so a later reader does not add a consumer for
   them by analogy.

   `runtime` IS SPENT BY THIS HARNESS AND IS DELIBERATELY NOT IN THE SET ABOVE,
   and the distinction is the one §14b.6 draws. The three bounds in
   `BUDGET_BOUNDS` are the DESIGN'S — "fetches requested, sub-sessions spawned,
   wall time across resumptions" — and `stopBecause` reads them, because the
   table has to know it is out of budget before it takes another step. `runtime`
   is the PLATFORM'S ceiling (D-54, D-56 — CPU and subrequests), which no table
   can see coming: the driver spends one unit per plane call it makes and the
   PLANE decides when that is exhausted, at its own one exit.

   §14b.6: *"the record already has the word and lacks the writer —
   `runtime-ceiling-reached` exists in the condition vocabulary with NO producer
   (`queuestate.mjs:82`) — IS-9(d) builds that producer rather than minting a new
   kind."* THIS ITEM IS IS-9(d) AND THIS IS WHERE IT DISCHARGES THAT: PL-5 wired
   the condition at `store.mjs #aiRunTerminate` (`condition: hit === "runtime" ?
   "runtime-ceiling-reached" : null`) and recorded in `airun.mjs` that the
   PRODUCER — the thing that actually consumes the bound — was not its own. The
   producer is the driver's per-call spend through `op=airuntick`.

   NOTHING HERE EMITS THE CONDITION ITSELF. A second producer of the word inside
   a fleet member would be a copy of the plane's rule — the drift class DEC-8
   closed, and fleet rule 2 besides. The harness SPENDS; the plane WRITES. That
   is why the acceptance reads "a budget exhaustion WRITES
   `runtime-ceiling-reached`" and not "the harness emits it". */
export const BUDGET_BOUNDS = ["fetches", "subsessions", "wallclock"];
export const SPENT_NOT_WATCHED = {
  runtime: "the platform's CPU/subrequest ceiling (D-54, D-56). Spent one unit per plane call; "
         + "the PLANE decides when it is exhausted and writes `runtime-ceiling-reached` at its own exit",
};
export const NOT_OUR_BOUNDS = {
  lease: "the plane's heartbeat — a run that stopped heartbeating DIED rather than finished, and only "
       + "something outside the run can observe that (PL-5's `ai-run-reap` consumer)",
};

/* THE OPS THIS HARNESS MAY NAME, AND WHY EACH ONE IS HERE.
 *
 * PINNED AS AN EXACT SET IN THE SUITE, FLOOR AND CEILING BOTH, exactly as FL-2
 * pinned `{whoami}`: a call this member gains is a call somebody decided to give
 * it, and a call it loses is visible too.
 *
 * **THE SCOPE IS STILL NEVER EVALUATED HERE.** D-199 (2): what an agent may
 * reach is a row a MEMBER AUTHORED, read from the record at the plane's gate by
 * `aiTaskScope`. This set is not an allow-list and grants nothing — naming an op
 * the credential does not declare gets a refusal from the plane, which this
 * member passes through verbatim. It is a DECLARATION of what the table's rows
 * do, so the suite can pin it.
 *
 * QUERY, NEVER LOAD (§14b.1): the run holds the inquiry, its versions and its
 * working set, and reaches everything else by ASKING. The meaning-grain read is
 * PL-9's `op=meaningrows` and this item CONSUMES it — it builds no second
 * reader, which is D-15's one-compiler rule and D-222's option C as shipped.
 * **No op in this set returns document bytes**, and the suite asserts that
 * against the plane's own OPS table rather than against this comment. */
export const PLANE_OPS = {
  whoami:         { mutating: false, why: "who the plane says this credential is (FL-2's round trip, kept)" },
  airun:          { mutating: false, why: "the run object: its conditions, its live budget" },
  airunlog:       { mutating: false, why: "§14b.7 — a RESUMED run reads its own log and continues" },
  airunspawn:     { mutating: false, why: "PL-12's spawn payload; the search half has no manifest field to read" },
  meaningrows:    { mutating: false, why: "PL-9 / D-222 option C — the meaning-grain read. CONSUMED, never rebuilt" },
  basisversions:  { mutating: false, why: "PL-1's version set — what DEDUP compares against, read before any write" },
  airuntick:      { mutating: true,  why: "log-always and budget spend, through the plane's own producer" },
  suggest:        { mutating: true,  why: "PL-3 — ONE version, as formed. The only write that reaches the record" },
  capturerequest: { mutating: true,  why: "PL-4 — the internet level REQUESTS acquisition; it does not perform it" },
  airunclose:     { mutating: true,  why: "the ordinary exit, naming the bound (C-22.5)" },
};

/** THE MEANING ARM THIS MEMBER READS AT — D-276, AND IT IS A DECLARATION RATHER
 *  THAN A DEFAULT, BECAUSE THE PLANE REFUSES DEFAULTS.
 *
 *  `op=meaningrows` will not choose an arm for a caller. C-23.1's own words:
 *  *"Each reads a different table and answers a different question, so there is
 *  no default that would not be answering something you did not ask."* The
 *  member's meaning reader used to carry `rows = "legs"` as a DEFAULT PARAMETER,
 *  which put that choice back exactly where the plane had refused to leave it —
 *  and put it there in a spelling the record does not hold.
 *
 *  WHY `leg`, AND IT WAS ESTABLISHED BY DRIVING THE REAL PLANE RATHER THAN
 *  ASSUMED. The compiler holds THREE arms resolving to TWO tables: `leg` reads
 *  `inquiry_basis`, one row per LEG of an inquiry's basis, while `resolves` and
 *  `concerns` BOTH read `resolutions` and project the identical row — they
 *  differ only in which bare word their BUNDLE-grain selector takes, which is a
 *  distinction in the `q` language and not in what `rows=` returns. A resolution
 *  is a reference in a capture resolving to a registered subject: the reading
 *  half's grain, and not what this member does. THIS RUN FORMS VERSIONS OF A
 *  BASIS — its context is an inquiry, `dedup` reads `op=basisversions`, `submit`
 *  writes through `op=suggest`. The legs ARE what it composes against.
 *
 *  IT LIVES HERE, BESIDE `PLANE_OPS`, AND NOT IN THE WORKER: a named export of a
 *  STRING from a Worker entry module is refused by workerd at startup
 *  (*"Incorrect type for map entry … not of type 'function or ExportedHandler'"*
 *  — measured), so a constant the suite must import cannot sit there. This is
 *  the file that already declares what this member may name at the plane, which
 *  is where a declaration of HOW it names it belongs.
 *
 *  THE VALUE THAT WAS HERE — `"legs"`, plural — IS AN ARM THE PLANE DOES NOT
 *  HOLD. Every call carrying it was refused `MEANING_ROWS_UNKNOWN_ARM` (C-23.2)
 *  and the refusal was written into an observation entry as a zero. */
export const MEANING_ARM = "leg";

/* ---------------------------------------------------------------- THE TABLE
 *
 * `to` is the COMPLETE set of steps a row may move to, and `nextStep` is held to
 * it. `judged` names what the MODEL decides inside the step — every row that
 * carries one is a row where judgement happens, and every row that does not is a
 * row where nothing is up to the model. Read the two columns together and the
 * §14b.4 table is visible as data: what is scripted, and what is judged. */
export const CONTROL_FLOW = {
  "gate-mode": {
    does:   "SK-4's gate: refuse a mode that is not deployed, before anything is spent",
    judged: null,
    logs:   true,
    to:     ["resume", "close"],
  },
  resume: {
    does:   "§14b.7 — read this run's OWN log and continue from it rather than restarting",
    judged: null,
    logs:   true,
    to:     ["plan", "close"],
  },
  plan: {
    does:   "open a pass: the pass counter is the TABLE's and the search targets are the model's",
    judged: "what to search for",
    logs:   true,
    to:     ["fanout", "close"],
  },
  fanout: {
    does:   "spawn ONE sub-session per level, all four, in LEVELS order",
    judged: null,
    logs:   true,
    to:     ["collect", "close"],
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
    does:   "take each sub-session's REPORT and hold it to the return contract "
          + "(a citation, never documents — §14b.1); re-read each citation BY ADDRESS",
    judged: "what each sub-session's REPORT says",
    logs:   true,
    to:     ["compose", "close"],
  },
  compose: {
    does:   "form candidate versions from the reports",
    judged: "what each level's reports mean, and what the version says",
    logs:   true,
    /* NO EDGE TO `submit`. Dedup is not a rule a step remembers to apply; it is
       the shape of the table, and this absent edge IS the enforcement. */
    to:     ["dedup", "close"],
  },
  dedup: {
    does:   "compare every candidate against the versions already on the record, BEFORE any write",
    judged: "whether this reading differs in substance",
    logs:   true,
    to:     ["submit", "next-pass", "close"],
  },
  submit: {
    does:   "write ONE candidate through PL-3's endpoint, as formed — never a batch",
    judged: null,
    logs:   true,
    /* THE F10 EDGE. A refusal goes to `adjust` and NOWHERE ELSE — there is no
       edge from `submit` back to `submit`, so a verbatim retry is not a path
       this table has. */
    to:     ["submit", "adjust", "next-pass", "close"],
  },
  adjust: {
    does:   "F10 — carry the plane's refusal back into the submission and CHANGE it, or drop the candidate",
    judged: "how to answer the refusal",
    logs:   true,
    to:     ["submit", "next-pass", "close"],
  },
  "next-pass": {
    does:   "the pass counter and the loop's termination — neither is the model's to decide",
    judged: null,
    logs:   true,
    to:     ["plan", "close"],
  },
  close: {
    does:   "the one exit, naming the bound (C-22.5). Terminal",
    judged: null,
    logs:   true,
    to:     [],
  },
};

export const FIRST_STEP = "gate-mode";

/** §9's EMPTY-LEVEL KIND, DERIVED BY THE TABLE AND NEVER BY THE MODEL.
 *
 *  THE OWED CONTROL THIS EXISTS FOR (VF-1's seventh, the objective's own): feed
 *  a run an inquiry the evidence does not support and it must propose NOTHING
 *  and still EMIT something — *"an empty run and a silent failure
 *  distinguishable"*. §15's empty-run instrument needs an object to count, and
 *  §9 is explicit that without this kind *"a run that honestly found nothing
 *  supportable is indistinguishable from a run that emitted nothing"*.
 *
 *  SO THIS IS DETERMINISTIC AND IT HAS TO BE. If emitting the empty-level kind
 *  were the model's judgement, the one case the instrument exists to catch — a
 *  run that found nothing and said nothing — would be the case where the
 *  judgement is least likely to fire. The MODEL says what it observed at a
 *  level; the TABLE decides that an observed absence is written down.
 *
 *  D-129 IS WHY ONLY `LOOKED_ABSENT` QUALIFIES. `NEVER_LOOKED` is not an
 *  absence, `LOOKED_INDETERMINATE` is "we asked and could not tell", and
 *  `partial` got some of it. Only one of the five is the claim *"we looked at
 *  this level and it is empty"*, and PL-3 refuses the kind without the level AND
 *  the observation-log address that establishes it (`SUGGEST_EMPTY_LEVEL_UNSTATED`).
 *  Absence at one level is not evidence of absence at the next, so one candidate
 *  per empty level and never one for the run. */
export function emptyLevelCandidates(state, target) {
  const reports = Array.isArray(state?.reports) ? state.reports : [];
  const out = [];
  for (const level of LEVELS) {
    const r = reports.find((x) => x && x.level === level);
    if (!r || r.state !== "LOOKED_ABSENT") continue;
    out.push({
      kind: "level-empty",
      target: target ?? null,
      level,
      /* THE ADDRESS OF THE SEARCH THAT ESTABLISHES IT. The report carries where
         in the observation log it was written; a level-empty with no address is
         the one shape a later reader cannot check, and PL-3 refuses it. */
      observed_at: r.observed_at ?? null,
      name: `level-empty:${level}`,
      description: r.description ?? null,
    });
  }
  return out;
}

/* Canonical bytes for a submission, so "did the adjust actually change
   anything" is answered the same way PL-3 answers "is this a verbatim
   resubmit": by the BYTES, in a stable key order, and never by a hash. PL-1's
   reasoning transplanted — a hand-rolled synchronous hash would put a collision
   argument underneath the mechanism that decides whether a caller is told the
   truth about its own submission. */
export function canonical(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${canonical(value[k])}`).join(",")}}`;
}

/** Did `adjust` actually adjust? F10's precondition, as a function so the table
 *  and the suite ask it the same way. */
export function adjustedFrom(before, after) {
  return canonical(before ?? null) !== canonical(after ?? null);
}

/* A budget row the table can read whatever shape the plane handed back. Absent
   is NOT zero: an unknown allowance must not read as an exhausted one, because
   that would stop a run and name a bound that never bit. */
const allowance = (budget, bound) => {
  const row = (budget || {})[bound];
  if (!row) return null;
  const allowed = Number(row.allowed);
  const consumed = Number(row.consumed) || 0;
  if (!Number.isFinite(allowed) || allowed <= 0) return null;
  return { allowed, consumed };
};

/** WHICH BOUND HAS STOPPED THIS RUN — or null, meaning carry on.
 *
 *  Checked ABOVE every row, so there is no step from which the table can
 *  continue past an exhausted budget. Deterministic in its ORDER too: the bounds
 *  are asked in `BUDGET_BOUNDS` order so two runs in the same state name the
 *  same bound, which is what lets a suite pin the answer. */
export function stopBecause(state) {
  const s = state || {};
  for (const bound of BUDGET_BOUNDS) {
    const row = allowance(s.budget, bound);
    if (row && row.consumed >= row.allowed) return bound;
  }
  /* LOOP TERMINATION, AND IT IS THE TABLE'S. §14b.4 and TREC 2011: the model
     never decides when the loop stops. `maxPasses` arrives with the run and is
     not reachable from any judgement — `applyJudgement` refuses to set it, and
     the suite drives that arm. */
  if (Number(s.pass) >= Number(s.maxPasses)) return "completed";
  return null;
}

/** THE TABLE, AS A FUNCTION. Pure: same state in, same step out, every time.
 *
 *  Returns `{ step, why }`. `why` is a sentence for the observation log, so the
 *  log says WHERE it stopped and WHY in the table's own words rather than in a
 *  model's — §11's whole argument for the log existing. */
export function nextStep(state) {
  const s = state || {};
  const at = String(s.step || FIRST_STEP);
  const row = CONTROL_FLOW[at];
  if (!row) return { step: "close", why: `'${at}' is not a row in this table`, bound: "completed" };

  /* THE GATE FIRST, and before any bound is consulted: a mode that is not
     deployed must not even be able to report that it ran out of budget. */
  if (at === "gate-mode") {
    const mode = MODES[String(s.mode || "")];
    if (!mode || !mode.deployed)
      /* `mode-not-deployed`, NOT `cancelled`, AND THE CHANGE IS FL-7 (2026-08-10,
         IC-62) CORRECTING A MISATTRIBUTION THIS LINE USED TO MAKE. This branch
         closed on `cancelled` from FL-3 until FL-7 — and the plane defines
         `cancelled` as "a member stopped it", which is FALSE of every run that
         reaches this line: the gate refused a launch, nobody asked, and nothing
         had been spent. The ending now names the machine that actually acted.
         The word is the plane's (`bio-plane/src/airun.mjs` RUN_ENDINGS) and is
         NOT minted here — a fleet member inventing an ending would be the
         drift class DEC-8 closed. */
      return { step: "close", bound: "mode-not-deployed",
               why: `mode '${String(s.mode || "(none)")}' is not deployed. CHECK is the first deployed mode `
                  + `(§2); investigate-fresh enables only after CHECK's first live run is verified (VF-5/SK-4). `
                  + `This gate is a row in the control-flow table and never a sentence in the skill.` };
    return { step: "resume", why: "the mode is deployed; read this run's own log before doing anything else" };
  }

  /* AND THE BOUNDS ABOVE EVERY OTHER ROW. */
  const stopped = stopBecause(s);
  if (stopped && at !== "close")
    return { step: "close", bound: stopped,
             why: stopped === "completed"
               ? `${s.pass} of ${s.maxPasses} passes are done; the loop's termination is the table's and not the model's`
               : `the '${stopped}' budget is spent. §14b.6: when a bound stops a run, the log says WHICH bound and where` };

  switch (at) {
    case "resume":
      return { step: "plan",
               why: s.resumedFrom > 0
                 ? `this run's log carries ${s.resumedFrom} observation(s); continuing rather than restarting (§14b.7)`
                 : "this run's log is empty; starting the first pass" };

    case "plan":
      return { step: "fanout", why: `pass ${Number(s.pass) + 1}: fan out across all ${LEVELS.length} levels` };

    case "fanout":
      return { step: "collect", why: `${LEVELS.length} sub-sessions spawned, one per level, in LEVELS order` };

    case "collect": {
      /* THE SENTENCE NAMES BOTH NUMBERS, AND BEFORE FL-5 IT NAMED NEITHER. It
         read "no documents were returned", which was a claim the run had no way
         to have checked — exactly the shape §14b.4 calls a fence in a prose. What
         it can honestly say is how many returns HONOURED the contract and how many
         were REFUSED, because `subsession.mjs` decided each one. A refused return
         is not an absence and never becomes one: the level it came from is
         UNDETERMINED and stays stated. */
      const refused = (s.reportsRefused || []).length;
      return { step: "compose",
               why: `${(s.reports || []).length} REPORT(s) honoured the return contract`
                  + (refused
                      ? `; ${refused} return(s) REFUSED — a sub-session that returns documents has `
                        + `defeated the architecture, and those levels are UNDETERMINED, not empty`
                      : "; none refused") };
    }

    case "compose":
      /* THE ONLY EDGE OUT, and it is dedup. Even with nothing composed the run
         goes through `dedup` — a candidate list of zero is a real answer and
         §9's `level-empty` kind is written from it, so short-circuiting here
         would skip the row that produces the empty-run instrument's object. */
      return { step: "dedup", why: `${(s.candidates || []).length} candidate(s) composed; nothing may be written before dedup` };

    case "dedup": {
      const queue = s.queue || [];
      if (!queue.length)
        return { step: "next-pass", why: "no candidate differs in substance from what the record already holds" };
      return { step: "submit", why: `${queue.length} candidate(s) survived dedup; they are written ONE AT A TIME, as formed` };
    }

    case "submit": {
      /* A REFUSAL ROUTES TO `adjust`. Never back here. */
      if (s.refusal) return { step: "adjust", why: `the plane refused '${String(s.refusal.code || s.refusal.reason || "?")}'; `
                                                 + `F10 routes a refusal to an ADJUST step, never to a verbatim retry` };
      const queue = s.queue || [];
      if (queue.length) return { step: "submit", why: `${queue.length} candidate(s) still to write, one at a time` };
      return { step: "next-pass", why: "every candidate this pass formed has been written or dropped" };
    }

    case "adjust": {
      /* F10's PRECONDITION, enforced rather than trusted. */
      if (!s.adjusted)
        return { step: "next-pass",
                 why: "the refusal could not be answered by changing the submission, so the candidate is DROPPED. "
                    + "Resending the same bytes would return the stored refusal without re-evaluation and climb "
                    + "PL-3's `repeats` counter, which is the loop F10 exists to make visible" };
      return { step: "submit", why: "the submission was ADJUSTED and differs from the one that was refused" };
    }

    case "next-pass":
      return { step: "plan", why: `pass ${s.pass} done; the table decides there is another` };

    case "close":
      return { step: "close", why: "terminal", bound: s.bound || "completed" };

    /* No default: every row is named above, and a row added to CONTROL_FLOW
       without a case here falls to the unreachable return below, which the
       suite drives as its own arm. */
  }
  return { step: "close", why: `'${at}' has no transition`, bound: "completed" };
}

/* ------------------------------------------------------- WHAT A STEP LOGS
 *
 * LOG-ALWAYS (§14b.6): the observation log is written whether or not the run
 * succeeds, and its whole value is the failure path — which is why §11 forbids
 * it from living in `bundle.md`, written only on success.
 *
 * The entry is built in the PLANE'S OWN vocabulary and validated by the PLANE's
 * own `checkObservation` (C-22.1 to C-22.6): D-129's absence states, D-104's
 * governed split, the condition vocabulary. Nothing here decides whether an
 * entry is legal — this member composes it and the plane refuses it if it is
 * not, which is the same division as every other fence in this Worker. */
export function stepLog(state, decision) {
  const s = state || {};
  const d = decision || {};
  return {
    level:   s.level || null,
    subject: `${String(s.step || FIRST_STEP)} -> ${String(d.step || "?")}`,
    /* NEVER_LOOKED is the honest default for a control-flow entry: the step's
       own transition establishes nothing about the world. A step that DID look
       supplies its own state, and D-129's whole point is that the four are
       different claims. */
    state:   s.observed || "NEVER_LOOKED",
    governed: s.governed === true,
    condition: s.condition || null,
    terminal: d.step === "close",
    bound:    d.step === "close" ? (d.bound || null) : null,
    detail:  String(d.why || "").slice(0, 500),
  };
}

/* -------------------------------------------- WHAT A JUDGEMENT MAY NOT TOUCH
 *
 * The model's judgement enters the table through THIS function and no other
 * route, and the fields it may set are an exact set. Everything the plan row
 * calls deterministic is absent from it: `pass`, `maxPasses`, `step`, `budget`,
 * `mode`, `bound`. A judgement naming one of them is REFUSED and named — not
 * ignored, because a caller told its input was dropped learns nothing.
 *
 * THIS IS THE CODE HALF OF SK-2's REVIEW CRITERION. SK-2's negative control is
 * "a skill edit that moves loop termination into model judgement → FL-3's
 * deterministic-table review criterion fails the change". That criterion is not
 * a review habit: it is this refusal, and the suite drives it by handing a
 * judgement that tries to set `maxPasses`. */
export const JUDGEABLE = ["targets", "reports", "candidates", "queue", "adjusted", "submission",
                          "level", "observed", "governed", "condition"];
export const NOT_JUDGEABLE = ["pass", "maxPasses", "step", "budget", "mode", "bound", "run", "store"];

export function applyJudgement(state, judgement) {
  const j = judgement && typeof judgement === "object" ? judgement : {};
  const overreach = Object.keys(j).filter((k) => NOT_JUDGEABLE.includes(k));
  if (overreach.length)
    return { ok: false, overreach,
             detail: `a judgement may not set ${overreach.join(", ")}. Loop bounds, the pass counter, the `
                   + `budget, the mode and the step are the TABLE's and never the model's (§14b.4). The `
                   + `evidential case is measured: TREC 2011 found searchers erring by up to +95/-87 points `
                   + `on their own recall and stopping early on a false belief of high coverage.` };
  const next = { ...state };
  for (const k of JUDGEABLE) if (Object.prototype.hasOwnProperty.call(j, k)) next[k] = j[k];
  return { ok: true, state: next };
}
