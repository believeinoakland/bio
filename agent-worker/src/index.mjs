/* agent-worker — the SECOND member of the function-specific Worker fleet (I8).
 *
 * WHY THIS EXISTS, AND WHY IT IS NOT A SECOND `pdf-worker`. The plane stays a
 * lean control/record Worker. An investigative session (INVESTIGATIVE-SESSION.md)
 * is long, dependency-laden and mostly spent WAITING on model responses, so it
 * moves into a dedicated Worker the plane calls over a service binding — a fleet,
 * not a monolith.
 *
 * But it is a different SHAPE from `pdf-worker`, and that is the whole reason I8
 * is its own registry entry. `pdf-worker` is a pure function of bytes: it is
 * called, it answers, it needs nothing from anybody. **This member CALLS BACK.**
 * It consumes the plane's op surface while it works, which makes it the first
 * component in this system that is both called by the plane and a caller of it.
 * Every rule below follows from that one fact.
 *
 * WHAT IT DOES AT FL-3. `/run` DRIVES THE RUN HARNESS — `src/harness.mjs`'s
 * deterministic control-flow table (IS-9). It takes the run identity, the
 * namespace and the `ai` credential the plane hands it; asks the plane who that
 * credential is; reads the run's MODE and BUDGET from the record and its own
 * OBSERVATION LOG (so a resumed run continues rather than restarting); then
 * walks the table, performing each row's plane call and appending an observation
 * entry for every step it takes.
 *
 * **IT STILL RUNS NO MODEL TURNS AND IT STILL SAYS SO ON THE WIRE**
 * (`turns_run: 0`, `judgement_source: "supplied"`). The DETERMINISTIC half is
 * what FL-3 builds; the model account that would supply the judgement inside a
 * step is FL-6's cascade and is not resolved here. Until it lands, a judgement
 * arrives from the caller and the answer names that fact rather than presenting
 * a table-driven walk as a model run. Nothing here is a stub that pretends to be
 * finished, and nothing here claims to be the half it is not.
 *
 * WHAT IT MUST NOT DO (fleet rules 2/3, inherited from I6 and asserted in the
 * suite — behaviourally AND by a source scan, as I6's are for `pdf-worker`):
 *
 *   - WRITE ANYTHING DIRECTLY, BY ANY ROUTE. It holds no STORE (Durable Object)
 *     binding and no R2 binding at all — not CAPTURES and above all not
 *     PUBLISHED. Every change to the record is made BY THE PLANE, under a
 *     credential a MEMBER minted with a declared scope, at an op the plane's own
 *     `aiTaskScope` admitted; a hop a component can hand us is a hop a component
 *     can invent (D-112), and none of the provenance is this member's to write.
 *
 *     **FL-2 SAID "IT CALLS NO MUTATING OP" AND THAT SENTENCE WAS TIGHTER THAN
 *     THE RULE IT WAS ENFORCING — CORRECTED HERE RATHER THAN EXEMPTED.** FL-2
 *     performed one read and could honestly promise it; the FLEET plan row's own
 *     words are *"writes nothing DIRECTLY"* and PL-11's `ai` credential class is
 *     specified as *"writes ONLY PL-3's endpoint and PL-4's table"* — a scope
 *     with no consumer if the member that holds the credential may never name
 *     those ops. FL-3's acceptance cannot be reached without them: a budget
 *     exhaustion must WRITE `runtime-ceiling-reached` and a refusal must be
 *     followed by an ADJUSTED submission. So the fence moves from "no mutating
 *     op" to its true shape — **an EXACT PINNED SET, floor and ceiling both, in
 *     which every mutating member is one PL-11's credential scope can declare**
 *     — and the suite's arms are corrected to match, each with a comment saying
 *     why the old one was wrong. The property FL-2 was actually protecting is
 *     untouched: no binding but the plane, no write this member performs itself,
 *     and no op it may name that somebody did not decide to give it.
 *   - HOLD A CREDENTIAL. It has no token of its own and no secret binding. The
 *     `ai` credential arrives PER CALL and is not retained, so this member cannot
 *     act except while somebody is asking it to.
 *   - JUDGE ITS OWN SCOPE. D-199 (2): what an agent may reach is a row a member
 *     AUTHORED, read from the record at the plane's gate by `aiTaskScope`. A copy
 *     of that judgement here would be a second enforcement point that drifts from
 *     the first, and a scope compiled into a Worker is precisely the settings row
 *     D-199 refused. There is no op allow-list, no scope and no class in this
 *     file. `harness.mjs`'s `PLANE_OPS` is a DECLARATION of what the table's rows
 *     do and grants nothing — naming an op the credential does not declare gets
 *     the plane's `AI_BEYOND_TASK_SCOPE` refusal, passed through verbatim. It is
 *     pinned as an exact set by the suite — floor and ceiling both — so a call
 *     this member gains is a call somebody decided to give it.
 *
 *   - DECIDE ITS OWN CONTROL FLOW FROM A JUDGEMENT. §14b.4: loops, fan-out and
 *     gates are deterministic and judgement happens INSIDE a step. The pass
 *     counter, the loop's termination, the budget, the mode and the step are
 *     refused to a judgement by `applyJudgement`, by name.
 *   - RE-WORD A REFUSAL. The plane's refusal carries its C-number and its DEC-49
 *     canned translation; this member passes it through UNCHANGED. A component
 *     that paraphrases a refusal is thirteen surfaces inventing wording, which is
 *     the drift DEC-49's guard exists to close.
 *   - BE REACHED BY ANYTHING BUT THE PLANE. No member-facing surface, no token
 *     classes of its own. The plane's op layer is the authorisation boundary.
 *
 * It versions and deploys SEPARATELY (fleet rule 4), so `GET /version` exists:
 * a verification must establish which build ANSWERED, for the member as well as
 * the plane (D-108's second face), and a member that cannot name its own build
 * makes that unverifiable.
 */

/* ---------------------------------------------------------------- THE BINDING
 *
 * The plane is reached on `env.PLANE` and by NO other route. This is measured,
 * not preferred: FL-1 (MEASUREMENTS.md, 2026-08-08) found that a Worker CANNOT
 * fetch another Worker on this account's own `*.workers.dev` name — 404, body
 * `error code: 1042`, in 7 ms, EVERY time — while the service binding to the same
 * script answered 200 in 1,885 ms with a 1,500 ms delay honoured. Two probe
 * passes were lost to that: the arms looked like a CPU story and were a routing
 * story. So there is no URL for the plane anywhere in this file, and the suite
 * asserts the absence rather than trusting it. */
const PLANE_ORIGIN = "http://plane"; /* a binding ignores the host; this names the
                                        request, it does not route it. */

/* FL-3 / IS-9 — THE CONTROL FLOW TABLE, IN ITS OWN FILE AND PURE.
 *
 * Read `harness.mjs`'s header for why it is a table rather than a narrative.
 * The split matters here: this file is the DRIVER and holds no decision, so the
 * suite can walk every row of the table in a plain node process AND drive it
 * through `POST /run` inside workerd, and the two must agree. A table exercised
 * only through the op is a table nobody can exhaust. */
import {
  CONTROL_FLOW, FIRST_STEP, LEVELS, BUDGET_BOUNDS,
  nextStep, stepLog, applyJudgement, adjustedFrom, emptyLevelCandidates,
} from "./harness.mjs";

/* ------------------------------------------------------ THE SEGMENT BOUND
 *
 * SIZED ON FL-1's MEMORY CURVE, AND NOT ON ITS CPU CURVE. The difference is a
 * factor of about ten and it is the finding FL-1 said should shape this work:
 *
 *   at 200 turns   memoryUsageBytesP99 = 120.4 MB against a 128 MB isolate,
 *                  while billed CPU was 757.65 ms — 2.5% of the 30 s ceiling.
 *   at 100 turns   51.2 MB P50, 189.28 ms.
 *
 * Extrapolated on the measured CPU exponent (~n^1.9), ~1,100 turns would fit the
 * CPU ceiling. **A segment sized on CPU headroom would therefore be roughly 10x
 * too long and would meet the MEMORY wall instead.** 120 sits inside the 100–150
 * band FL-1 named as inside both ceilings.
 *
 * The other two FL-1 numbers that bear on this member, recorded so nobody
 * re-derives them: waiting is effectively free (~0.16 ms billed CPU per awaited
 * subrequest, INDEPENDENT of how long the wait lasts — 25 subrequests held open
 * 2 s each cost 4.29 ms across 50.0 seconds of wall time), so a run that spends
 * its life waiting on model responses is not what bounds a segment; and at least
 * 160 external subrequests per invocation were reached with no refusal, which is
 * a FLOOR on that ceiling rather than the ceiling, because the walk stopped at
 * its own cap. */
const DEFAULT_MAX_TURNS_PER_SEGMENT = 120;
const BOUND_SOURCE = "FL-1 2026-08-08 memory curve (120.4 MB P99 of 128 MB at 200 turns), not the CPU curve";

/* The `ai` credential's shape (PL-11). Checked ONLY so an absent or obviously
   malformed credential is refused here instead of costing a round trip — this is
   a shape test and NOT an authorisation test. Whether the credential is live,
   revoked, or scoped to the work being asked for is the PLANE's judgement, read
   from the record, and it is never duplicated here. */
const AI_TOKEN_SHAPE = /^aik-[0-9a-f]{64}$/;

/* A namespace token, the same shape `pdf-worker` accepts. */
const STORE_SHAPE = /^[a-z0-9_-]+$/i;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

/* Every refusable condition answers through THIS helper, with the code passed as
   a STRING LITERAL at the site.

   NO DEC-49 CHECK FAMILY IS OWED HERE, AND THAT IS A DECISION RATHER THAN AN
   OMISSION. DEC-49's reach is "every code a SURFACE can receive", which the
   guard's own header records as SMALLER than every refusal code in the plane. No
   member ever receives these codes: this Worker has no member-facing surface and
   its only caller is the plane. `civicos-ui/check-refusal-codes.mjs` walks
   `bio-plane/src` and `bio-plane/checks` and does not walk the fleet — correct
   for the same reason, and why `pdf-worker`'s BAD_SHA/NOT_FOUND carry no rows.

   The convention is followed anyway because it costs nothing and it is what gives
   the guard teeth the day it is pointed here: a local helper taking the code in a
   VARIABLE is invisible to arm C's walk, which is how seven of thirteen governed
   sites once read 776 lines and compared zero codes. The day any surface renders
   one of these verbatim to a member — which FL-3/FL-4 could do while composing a
   run's failure — a family is owed AND the guard must be taught to walk here. */
const refusal = (code, detail, status, extra) =>
  json({ ok: false, reason: code, code, detail, worker: "agent-worker", ...(extra || {}) }, status);

/* ---------------------------------------------------------------- THE SURFACE
 *
 * Declared for the fleet-coverage instrument to read the same way it reads the
 * plane's OPS table (`bio-plane/scripts/coverage.mjs`, D-117/VF-3).
 *
 * `mutating` is a property of THIS WORKER and not of what the plane may do
 * downstream, and for a fleet member it must be `false` on every row — fleet
 * rule 2, a member ASSERTS nothing. That is not left to discipline: `--strict`
 * fails a member that declares a mutating surface op. */
export const SURFACE = {
  run:     { method: "POST", mutating: false },
  version: { method: "GET",  mutating: false },
};

/* --------------------------------------------------------------- THE ONE CALL
 *
 * Everything this member learns, it learns here. The credential is forwarded
 * exactly as handed over and is never stored, logged or echoed.
 *
 * REC-52's rule, one layer out: a failure to ANSWER is not an answer. If the
 * plane could not be reached, this member says the plane was silent — it does not
 * convert its own failure into a statement about the record or about who the
 * caller is. */
async function askPlane(env, op, credential, store, query = null, body = null) {
  let url = `${PLANE_ORIGIN}/?op=${op}&store=${encodeURIComponent(store)}&token=${encodeURIComponent(credential)}`;
  for (const [k, v] of Object.entries(query || {}))
    if (v != null && v !== "") url += `&${k}=${encodeURIComponent(String(v))}`;
  let res;
  try {
    res = await env.PLANE.fetch(url, body == null ? undefined : {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
    });
  } catch (e) {
    return { reached: false, detail: String((e && e.message) || e).slice(0, 200) };
  }
  let parsed = null;
  try { parsed = await res.json(); } catch { parsed = null; }
  if (parsed == null) return { reached: false, detail: `the plane answered ${res.status} with a body this member could not read as JSON` };
  return { reached: true, status: res.status, body: parsed };
}

/* THE ONLY BOUND ON THE DRIVER ITSELF, and it is not the run's budget.
 *
 * The run's budget (fetches, sub-sessions, wall time) is the RECORD's and is
 * spent through the plane. This is a different and smaller thing: a ceiling on
 * how many TABLE ROWS one invocation walks, so a table defect cannot spin an
 * isolate. It is deliberately not called a budget and it never appears as the
 * bound a run stopped on — a driver ceiling reported as a run's bound would be
 * this member's own fault read as a fact about the record, which is REC-52's
 * rule and the one this Worker already applies to a silent plane. */
const MAX_STEPS = 400;

/** FL-3's DRIVER. It turns each row of `harness.mjs`'s table into plane calls
 *  and appends an observation entry for EVERY step — including the last one, and
 *  including the steps of a run that ends badly (§14b.6: log-always).
 *
 *  IT DECIDES NOTHING. `nextStep` picks the step, `stopBecause` names the bound,
 *  `applyJudgement` polices what a judgement may touch, and `adjustedFrom`
 *  answers F10's precondition. Every one of those is in `harness.mjs`, is pure,
 *  and is driven directly by the suite as well as through this function — so a
 *  decision made here instead would be a decision nothing exhaustive covers. */
async function driveHarness(env, { runId, store, credential, judgements, maxSteps }) {
  /* EVERY PLANE CALL IS COUNTED, AND THE COUNT IS WHAT SPENDS `runtime`.
     §14b.6 named `runtime-ceiling-reached` as a word the record had with no
     writer, and IS-9(d) as the item that builds the producer. This counter IS
     that producer: `runtime` is the platform's CPU/subrequest ceiling (D-54,
     D-56), a subrequest is what this member spends against it, and FL-1 measured
     the floor at 160 external subrequests per invocation. The harness spends;
     the PLANE decides the bound is exhausted and writes the condition at its own
     one exit. Nothing here emits the word. */
  let calls = 0;
  const call = (op, query, body) => { calls += 1; return askPlane(env, op, credential, store, query, body); };
  const trace = [];
  const refusals = [];
  let logged = 0, submitted = 0, adjusted = 0, verbatimResubmits = 0;

  /* THE RUN'S OWN FACTS COME FROM THE RECORD, NEVER FROM THE CALLER.
     The MODE above all: SK-4's gate is only a gate while the mode is the
     record's. A `mode` in the request body would be a gate the caller holds,
     which is the defect §14b.4 names one layer up. */
  const runRead = await call("airun", { run: runId });
  if (!runRead.reached)
    return { refusal: planeSilent(runRead) };
  if (runRead.status !== 200 || runRead.body?.ok !== true)
    return { refusal: planeRefused(runId, store, runRead) };
  const session = runRead.body.result?.session ?? runRead.body.session ?? null;
  if (!session)
    return { refusal: refusal("NO_SUCH_RUN",
      "the plane holds no run under that id in this namespace, so there is nothing to continue. This "
      + "member opens no run: a run's identity and its conditions are the plane's, and a member that "
      + "could open one would be a machine deciding what it was formed under.", 404, { run_id: runId }) };

  /* §14b.7 — A RESUMED RUN READS ITS OWN LOG AND CONTINUES.
     The count is what the table needs; the entries are what a later reader
     needs. Both come from PL-5's `op=airunlog`, in `seq` order, which is why
     that read keeps ASCENDING order and cuts at the END. */
  const logRead = await call("airunlog", { run: runId });
  if (!logRead.reached) return { refusal: planeSilent(logRead) };
  const priorLog = logRead.body?.result ?? logRead.body ?? {};
  const resumedFrom = Array.isArray(priorLog.entries) ? priorLog.entries.length : 0;

  const budget = {};
  for (const b of Array.isArray(session.budget) ? session.budget : [])
    budget[String(b.bound)] = { allowed: Number(b.allowed) || 0, consumed: Number(b.consumed) || 0 };

  let state = {
    step: FIRST_STEP,
    mode: session.mode,
    pass: 0,
    maxPasses: Number(session.max_passes) > 0 ? Number(session.max_passes) : DEFAULT_MAX_PASSES,
    resumedFrom,
    budget,
    targets: [], reports: [], candidates: [], queue: [],
    refusal: null, adjusted: false, submission: null,
    level: null, observed: null, governed: false, condition: null,
  };

  /* Judgements are consumed IN ORDER and matched to the step that asks for one.
     A judgement offered for a step the table does not judge is refused by
     `applyJudgement` reaching nothing, and a step that judges with none supplied
     simply carries the state forward — an absent judgement is not an error, it
     is a run whose model had nothing to add. */
  let jx = 0;
  let ended = null, steps = 0;

  while (steps < maxSteps) {
    steps += 1;
    const callsAtStepStart = calls;
    const row = CONTROL_FLOW[state.step];

    /* THE JUDGEMENT, AND THE ONE DOOR IT COMES THROUGH. */
    if (row && row.judged && jx < judgements.length) {
      const applied = applyJudgement(state, judgements[jx]);
      jx += 1;
      if (!applied.ok)
        return { refusal: refusal("JUDGEMENT_OVERREACH", applied.detail, 400,
          { step: state.step, fields: applied.overreach }) };
      state = applied.state;
    }

    /* WHAT THE ROW DOES, IN PLANE CALLS. */
    const work = await performStep(call, state, runId);
    if (work.silent) return { refusal: planeSilent(work.silent) };
    if (work.refused) { refusals.push(work.refused); }
    state = work.state;
    if (work.submitted) submitted += 1;
    if (work.verbatim) verbatimResubmits += 1;
    if (state.step === "adjust" && state.adjusted) adjusted += 1;

    const decision = nextStep(state);
    trace.push({ step: state.step, to: decision.step, why: decision.why,
                 ...(work.note ? { note: work.note } : {}) });

    /* LOG-ALWAYS, AND IT IS A TICK RATHER THAN A SEPARATE WRITE. The tick is
       ONE call that appends what was observed, spends the budget and extends
       the lease — PL-5's own ordering, chosen so partial results survive a
       death that happens next. Consuming through it is also why nothing here
       writes `runtime-ceiling-reached`: a tick that spends the last of a budget
       ends the run through the plane's one exit and the plane writes the
       condition. */
    const spentThisStep = calls - callsAtStepStart + 1; /* +1: the tick is a subrequest too */
    const consume = { ...(work.consume || {}), runtime: spentThisStep };
    const tick = await call("airuntick", null,
      { run: runId, log: [stepLog(state, decision)], consume });
    if (!tick.reached) return { refusal: planeSilent(tick) };
    if (tick.status === 200 && tick.body?.ok === true) {
      logged += 1;
      const t = tick.body.result ?? tick.body;
      /* THE BUDGET AS THE RECORD NOW HOLDS IT. Re-read rather than decremented
         locally: a run resumes across invocations and a second copy of the
         count is a second answer that ages. */
      state = { ...state, budget: { ...state.budget } };
      for (const [k, v] of Object.entries(consume))
        if (state.budget[k]) state.budget[k] = { ...state.budget[k], consumed: state.budget[k].consumed + Number(v) };
      /* THE PLANE ENDED IT. This is the `runtime` path above all: the harness
         spends and the plane decides, so an ending that arrives HERE rather than
         from the table is the record telling this member something it could not
         have known. It is recorded with WHO decided it, because "the table
         stopped" and "the plane stopped it" are different facts. */
      if (t && t.ended) {
        ended = { bound: t.ended.bound ?? null, condition: t.ended.condition ?? null,
                  by: "the plane's own exit" };
        break;
      }
    } else {
      refusals.push({ at: "airuntick", plane: tick.body ?? null });
    }

    if (decision.step === "close") {
      /* THE ORDINARY EXIT, NAMING THE BOUND (C-22.5). The plane refuses a close
         that names none rather than inferring "completed" from silence, so the
         bound the TABLE computed is handed over explicitly. */
      const closed = await call("airunclose", null, { run: runId, bound: decision.bound || "completed" });
      if (!closed.reached) return { refusal: planeSilent(closed) };
      ended = { bound: decision.bound || "completed", by: "the table" };
      state = { ...state, step: "close" };
      break;
    }
    /* THE ONE PLACE THE REFUSAL IS CARRIED FORWARD, AND IT IS CARRIED TO EXACTLY
       ONE ROW. `adjust` needs both the refusal and the bytes that earned it, or
       `adjustedFrom` has nothing to compare and F10's precondition becomes a
       promise. Every other transition CLEARS them, so a stale refusal cannot
       route a later step into an adjust it did not earn. */
    state = decision.step === "adjust"
      ? { ...state, step: "adjust", refusedSubmission: state.submission ?? null, adjusted: false }
      : { ...state, step: decision.step, refusal: null, adjusted: false,
          refusedSubmission: null };
    /* THE PASS COUNTER MOVES WHEN A PASS IS **DONE**, NOT WHEN ONE STARTS, AND
       THE DIFFERENCE IS OFF-BY-ONE IN THE DIRECTION THAT MATTERS. Counting on
       entry to `plan` makes `maxPasses: 1` mean ZERO completed passes — the run
       fans out over nothing and closes reporting `completed`, which is an empty
       run wearing a finished run's answer, and this suite's own empty-run arm is
       what distinguishes those. `next-pass` is the row that means "a pass
       finished", so it is the row that counts. */
    if (decision.step === "next-pass") state = { ...state, pass: state.pass + 1 };
  }

  return {
    mode: state.mode, trace, passes: state.pass, ended, logged, submitted,
    refusals, adjusted, verbatimResubmits, resumedFrom,
    budget: BUDGET_BOUNDS.map((b) => ({ bound: b, ...(state.budget[b] || { allowed: 0, consumed: 0 }) })),
  };
}

/** WHAT EACH ROW ACTUALLY DOES AGAINST THE PLANE. One `case` per row that has
 *  work, and rows that have none say so by falling through — the table already
 *  says what every row is FOR, and duplicating that here would be a second
 *  description to age. */
async function performStep(call, state, runId) {
  const out = { state, consume: {}, note: null };

  switch (state.step) {
    case "fanout": {
      /* THE FOUR-LEVEL FAN-OUT, ALL FOUR, IN LEVELS ORDER, ONE SUB-SESSION EACH.
         The count is the table's and not a judgement's: a run that searched
         three levels and reported on four is the false-coverage hazard this
         project keeps naming, and `LEVELS.length` is what makes it uncountable
         any other way.

         THE SPAWN PAYLOAD IS THE PLANE'S (PL-12). `op=airunspawn`'s search half
         has NO bias-manifest field by construction — not `bias: null`, no field
         at all — so the fence is the payload's shape rather than this member's
         discipline. Asking for it here rather than composing one is what makes
         that true at runtime and not only in `store.mjs`. */
      const spawned = [];
      for (const level of LEVELS) {
        const p = await call("airunspawn", { run: runId, half: "search" });
        if (!p.reached) return { silent: p };
        const payload = (p.body?.result ?? p.body ?? {}).payload ?? null;
        spawned.push({ level, payload_seen: payload != null,
                       /* ASSERTED HERE AS WELL AS IN THE PLANE'S SUITE, because
                          this is the party that would be harmed by the fence
                          failing and a fence proved only at its own site is a
                          fence with one witness. */
                       manifest_field_present: payload != null
                         && Object.prototype.hasOwnProperty.call(payload, "bias") });
      }
      out.consume.subsessions = LEVELS.length;
      out.note = `${spawned.length} sub-session payloads taken, one per level`;
      out.state = { ...state, spawned };

      /* THE INTERNET LEVEL REQUESTS ACQUISITION AND DOES NOT PERFORM IT (§4
         group 1, PL-4). One request per internet target the judgement named, and
         each one spends a FETCH from the run's budget. */
      const fetches = (state.targets || []).filter((t) => t && t.level === "internet");
      for (const t of fetches) {
        const r = await call("capturerequest", null, { run: runId, target: t.target ?? null, url: t.url ?? null });
        if (!r.reached) return { silent: r };
        if (r.status !== 200 || r.body?.ok !== true) out.refused = { at: "capturerequest", plane: r.body ?? null };
      }
      if (fetches.length) out.consume.fetches = fetches.length;
      return out;
    }

    case "compose": {
      /* QUERY, NEVER LOAD (§14b.1). The run holds the inquiry, its versions and
         its working set; everything else it reaches by ASKING. This is PL-9's
         `op=meaningrows` — D-222 option C, the SAME query compiler read at
         meaning grain — CONSUMED and not rebuilt. There is no second reader in
         this Worker and there must not be: D-15's one compilation point is what
         makes the viewer gate a gate. */
      const rows = await call("meaningrows", { q: state.q || "", rows: "legs", limit: 50 });
      if (!rows.reached) return { silent: rows };
      const got = rows.body?.result ?? rows.body ?? {};

      /* §9's EMPTY-LEVEL KIND, ADDED BY THE TABLE. The model said what it
         observed at each level; `emptyLevelCandidates` decides that an observed
         absence is written down, and it is deterministic for the reason its own
         header gives — if emitting it were judged, the one run the instrument
         exists to catch is the run that would not emit it. */
      const empties = emptyLevelCandidates(state, state.target ?? null);
      const candidates = [...(state.candidates || []), ...empties];
      out.note = `${Array.isArray(got.rows) ? got.rows.length : 0} meaning-grain row(s) queried; no document `
               + `was loaded. ${empties.length} level(s) observed EMPTY and written down as §9's kind`;
      out.state = { ...state, candidates };
      return out;
    }

    case "dedup": {
      /* DEDUP BEFORE THE WRITE, against what the record already holds. The
         plane checks differs-in-substance too (PL-3's check 3) and that is the
         fence; this is the run doing its own arithmetic first so it does not
         spend a write path to be told something it could have known. Both are
         wanted: §14b.5 is explicit that the run verifies its own work BEFORE
         proposing and that the checks are nevertheless the PLANE'S. */
      const held = await call("basisversions", { id: state.target || "", limit: 50 });
      if (!held.reached) return { silent: held };
      const body = held.body?.result ?? held.body ?? {};
      const names = new Set((Array.isArray(body.versions) ? body.versions : [])
        .map((v) => String(v && v.name ? v.name : "")).filter(Boolean));
      const queue = (state.candidates || []).filter((c) => c && !names.has(String(c.name ?? "")));
      out.note = `${(state.candidates || []).length} candidate(s) compared against ${names.size} on the record; `
               + `${queue.length} survived`;
      out.state = { ...state, queue };
      return out;
    }

    case "submit": {
      /* ONE CANDIDATE, OFF THE HEAD OF THE QUEUE, AS FORMED (§14b.7). Versions
         are written as they are FORMED rather than in one batch at the end, so a
         run that dies halfway does not lose what it found. There is no batch
         shape here to write one. */
      const queue = [...(state.queue || [])];
      const candidate = queue.shift();
      if (!candidate) return out;
      const res = await call("suggest", null, { ...candidate, run: runId });
      if (!res.reached) return { silent: res };
      const answer = res.body?.result ?? res.body ?? {};
      if (res.status === 200 && res.body?.ok === true && answer.wrote !== false) {
        out.submitted = true;
        out.note = `wrote '${String(candidate.name ?? "")}'`;
        out.state = { ...state, queue, refusal: null, submission: candidate };
        return out;
      }
      /* F10's OTHER HALF, OBSERVED RATHER THAN ASSUMED. PL-3 answers a verbatim
         resubmit with `repeated: true` and a climbed `repeats` counter WITHOUT
         re-running the six checks. This table exists to keep that counter at
         zero, so when it is not zero this member says so on the wire instead of
         letting the budget discover it later. */
      if (answer.repeated === true) out.verbatim = true;
      out.refused = { at: "suggest", code: answer.code ?? answer.reason ?? null,
                      repeated: answer.repeated === true, repeats: answer.repeats ?? 0,
                      /* THE PLANE'S WORDS, UNCHANGED. This member re-words no
                         refusal: the code, the C-number and the DEC-49 canned
                         translation are the plane's. */
                      plane: answer };
      out.note = `refused '${String(answer.code ?? answer.reason ?? "?")}' — routing to ADJUST, never to a retry`;
      out.state = { ...state, queue, refusal: answer, submission: candidate };
      return out;
    }

    case "adjust": {
      /* F10's PRECONDITION IS ANSWERED HERE AND ENFORCED IN THE TABLE. The
         judgement has already run for this row (it is a judged row), so
         `state.submission` is whatever the model handed back. Whether that is a
         CHANGE is not the model's word for it — `adjustedFrom` compares the two
         canonically, and an unchanged submission sets `adjusted: false`, which
         `nextStep` turns into a DROPPED candidate rather than a resend. */
      const changed = adjustedFrom(state.refusedSubmission ?? null, state.submission ?? null);
      const queue = [...(state.queue || [])];
      if (changed) queue.unshift(state.submission);
      out.note = changed
        ? "the submission was changed in answer to the refusal"
        : "the refusal could not be answered by changing the submission; the candidate is dropped";
      out.state = { ...state, adjusted: changed, queue };
      return out;
    }

    default:
      return out;
  }
}

const planeSilent = (asked) => refusal("PLANE_SILENT",
  "the plane could not be reached, so this member knows nothing about the record and says so. A failure "
  + "to answer is not an answer, and reporting one as the other would make this member's own fault read "
  + "as a fact about the record.", 502, { detail_from_binding: asked.detail });

const planeRefused = (runId, store, asked) =>
  json({ ok: false, reason: "PLANE_REFUSED", worker: "agent-worker", run_id: runId, store,
         detail: "the plane refused this member's call under the credential it was handed. Its refusal is "
               + "passed through exactly as the plane worded it.",
         plane_status: asked.status, plane: asked.body }, 403);

/* The table's own loop bound when the run object names none. Deliberately small
   and deliberately NOT a judgement's to set: §14b.4 and TREC 2011 — the model
   never decides when the loop stops. */
const DEFAULT_MAX_PASSES = 3;

async function handleRun(req, env) {
  if (typeof env.PLANE?.fetch !== "function")
    return refusal("PLANE_NOT_CONFIGURED",
      "this member reaches the record only through the plane service binding, and the binding is absent. "
      + "It holds no store binding and no credential of its own, so with no plane there is nothing it can "
      + "do and nothing it could pretend to have done.", 503);

  const body = await req.json().catch(() => null);
  if (body == null)
    return refusal("BAD_BODY", "the request body could not be read as JSON.", 400);

  const runId = typeof body.run_id === "string" ? body.run_id : "";
  const store = typeof body.store === "string" ? body.store : "";
  const credential = typeof body.credential === "string" ? body.credential : "";

  /* The run's identity is the PLANE's. This member mints none — a component that
     invents an identifier the record will later cite is a component inventing a
     hop (D-112), and the run log is the plane's own object. */
  if (!runId || runId.length > 200)
    return refusal("BAD_RUN_ID",
      "a run is identified by the plane and this member mints no identity of its own; the caller must say "
      + "which run this segment belongs to.", 400);

  if (!store || !STORE_SHAPE.test(store))
    return refusal("BAD_STORE",
      "a run happens inside one namespace and this member guesses none: the caller must say which. "
      + "A default namespace here would let a run touch the real record while its caller believed it "
      + "was working in a scratch one.", 400);

  /* A SHAPE test, never an authorisation test — see AI_TOKEN_SHAPE above. */
  if (!credential)
    return refusal("NO_CREDENTIAL",
      "this member holds no credential of its own and cannot act except under one it is handed. There is "
      + "no fallback identity here by design: a worker that could act unattended would be acting as "
      + "nobody, and nothing it did could be attributed.", 401);
  if (!AI_TOKEN_SHAPE.test(credential))
    return refusal("BAD_CREDENTIAL_SHAPE",
      "the credential handed to this member is not shaped like one this plane issues. Whether a "
      + "well-shaped credential is live, withdrawn, or scoped to this work is the plane's judgement and "
      + "is never made here.", 400);

  const bound = Number(env.MAX_TURNS_PER_SEGMENT) || DEFAULT_MAX_TURNS_PER_SEGMENT;
  const requested = body.turns == null ? bound : Number(body.turns);
  if (!Number.isFinite(requested) || requested < 1)
    return refusal("BAD_TURNS", "turns must be a positive number of model turns for this segment.", 400);
  /* REFUSED rather than silently clamped. A caller that asked for 400 turns and
     got 120 without being told believes it saw a whole run; the same reasoning
     that makes the plane's read bounds refuse rather than truncate. */
  if (requested > bound)
    return refusal("SEGMENT_OVER_BOUND",
      `a segment is bounded at ${bound} model turns and ${requested} were asked for. The bound is not a `
      + `policy choice: it is where the isolate's MEMORY ceiling sits, measured, and a longer segment `
      + `would not fail cleanly. Split the run across segments — resuming is what segments are for.`,
      400, { turns_requested: requested, turns_bound: bound, bound_source: BOUND_SOURCE });

  /* THE ROUND TRIP. One op, non-mutating, under the credential we were handed.
     Whatever this member reports about the credential is the PLANE's statement,
     never this member's inference — D-199 (4) makes the principal the VIEWER the
     credential's reads compile under, so a member-side guess would be a claim
     about who acted, produced by the party least entitled to make it. */
  const asked = await askPlane(env, "whoami", credential, store);
  if (!asked.reached)
    return refusal("PLANE_SILENT",
      "the plane could not be reached, so this member knows nothing about the credential it was handed "
      + "and says so. A failure to answer is not an answer, and reporting one as the other would make "
      + "this member's own fault read as a fact about the record.", 502, { detail_from_binding: asked.detail });

  /* A plane REFUSAL is passed through UNCHANGED — its code, its check number and
     its canned translation are the plane's, and re-wording them here is the
     thirteen-surfaces drift DEC-49's guard exists to close. */
  if (asked.status !== 200 || asked.body?.ok !== true)
    return json({ ok: false, reason: "PLANE_REFUSED", worker: "agent-worker",
                  run_id: runId, store,
                  detail: "the plane refused this member's call under the credential it was handed. Its "
                        + "refusal is passed through exactly as the plane worded it.",
                  plane_status: asked.status, plane: asked.body }, 403);

  /* ------------------------------------------------------- FL-3: DRIVE THE TABLE
   *
   * Everything below is `harness.mjs`'s decision and this function's plumbing.
   * The split is deliberate and it is the item: the TABLE is pure and a suite
   * walks it with no network at all, and this driver is the part that turns a
   * row into a plane call. A driver that decided anything would be a second
   * control flow nobody could exhaust. */
  const drive = await driveHarness(env, {
    runId, store, credential,
    judgements: Array.isArray(body.judgements) ? body.judgements : [],
    maxSteps: Number(body.max_steps) > 0 ? Math.min(Number(body.max_steps), MAX_STEPS) : MAX_STEPS,
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
    judgement_note: "the control-flow table is FL-3's and it ran; the model account that would supply the "
                  + "judgement inside a step is FL-6's cascade and is not resolved here, so judgements "
                  + "arrived from the caller. Stated rather than presented as a model run.",
    mode: drive.mode,
    trace: drive.trace,
    passes: drive.passes,
    ended: drive.ended,
    logged: drive.logged,
    submitted: drive.submitted,
    refusals: drive.refusals,
    adjusted: drive.adjusted,
    verbatim_resubmits: drive.verbatimResubmits,
    resumed_from: drive.resumedFrom,
    budget: drive.budget,
    segment: { turns_requested: requested, turns_bound: bound, bound_source: BOUND_SOURCE },

    /* THE PLANE'S STATEMENT ABOUT THE CREDENTIAL, COPIED AND NOT INTERPRETED.
       What the plane publishes here is the class it resolved the credential to
       and the namespace it confined the call to. Both are facts the plane
       decided; this member re-derives neither. */
    plane_says: {
      token_class: asked.body.result?.tokenClass ?? asked.body.tokenClass ?? null,
      store: asked.body.store ?? null,
      session: asked.body.result?.session ?? null,
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
    principal_source: "UNPUBLISHED — no read op an ai credential may call states its own principal (D-199 (4)); see the FL-2 delegation in CLAIMS.md",

    plane: { version: asked.body.version ?? null, op: "whoami" },
    worker: { name: "agent-worker", version: env.VERSION || "0.0.0" },
  });
}

/* Fleet rule 4: each member versions and rolls out on its own, so "a deploy
   verified is not a build serving" (D-108) has a second face — the plane can be
   current while the sibling it calls is still serving the previous build, and
   that window is invisible to both. A verification must establish which build
   ANSWERED. This is how this member answers that question about itself. */
function handleVersion(env) {
  return json({ ok: true, name: "agent-worker", version: env.VERSION || "0.0.0" });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+/, "");
    if (req.method === "GET" && path === "version") return handleVersion(env);
    if (req.method === "POST" && (path === "run" || path === "")) return handleRun(req, env);
    return refusal("UNKNOWN", "POST /run or GET /version only.", 404);
  },
};
