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
 * WHAT IT DOES. `/run` DRIVES THE RUN HARNESS — `agent-harness`' deterministic
 * control-flow table (IS-9; moved there by copy at T33-54, and this file now
 * imports it). It takes the run identity, the
 * namespace and the `ai` credential the plane hands it; asks the plane who that
 * credential is; reads the run's MODE and BUDGET from the record and its own
 * OBSERVATION LOG (so a resumed run continues rather than restarting); then
 * walks the table, performing each row's plane call and appending an observation
 * entry for every step it takes.
 *
 * WHAT IT GAINED AT FL-5 (IS-9(a), §14b.1). The fan-out now composes a SPAWN
 * CONTRACT per level — read-only, one level each, sharing no state, with no field
 * for the bias manifest to arrive in — and the returns are held to a RETURN
 * CONTRACT: a REPORT with a citation, never documents, with the parent re-reading
 * each citation BY ADDRESS through the one meaning reader it already had. Both
 * contracts are `agent-harness`' `subsession.mjs` and both are pure. The rule they enforce is
 * the design's own: *a sub-session that returns documents rather than reports has
 * defeated the architecture* — so a return that breaks the contract is REFUSED
 * and NAMED, and its level goes UNDETERMINED rather than becoming an absence.
 *
 * **WHEN IT RUNS MODEL TURNS, AND IT SAYS WHICH ON THE WIRE (R28, R58).** It
 * runs model turns through `agent-model` exactly when the Claude account that
 * serves the member's act arrived with the call (R6: the member's own, or the
 * group's API key, as `credentials.accountFor` answers it, K1755; there is no
 * project account) and the run's mode has turns to run: an API key goes to the
 * Messages API, a subscription to Claude Code in the `agent-runner` container
 * through the Container Durable Object binding (R35). A segment whose caller
 * supplied the judgements (`judgements` in the body, the stubbed path) runs no
 * turn. The answer's `turns_run` counts the turns that actually ran and
 * `judgement_source` says whose judgements the table applied (`model` or
 * `body`), so a table-driven walk is never presented as a model run, nor the
 * reverse. `POST /ask` (R54) is a member's question, answered through the same
 * module under the account that serves that member's ask and an ask grant, and
 * handed to the plane's `answers` checks before anything is returned. `POST
 * /draft` (R59) is a member's labelled draft of their own words, made the same
 * way, read only under a grant the door sends when the draft may read, and
 * checked by the door before the member sees it.
 *
 * WHAT IT MUST NOT DO (fleet rules 2/3, inherited from I6 and asserted in the
 * suite behaviourally, at this member's interface — what it reads from `env`,
 * what it touches on its one binding, and what reaches the plane and the model
 * (`test/inprocess.mjs`, N421)):
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
 *   - HOLD A CREDENTIAL (R36). It has no token of its own and no secret binding.
 *     The `ai` credential, an ask's grant and the account that serves the
 *     member's act (the member's own reference, or the group's API key, held
 *     sealed in `credentials`, K1755) arrive PER CALL and are never stored,
 *     logged or echoed, so this member cannot act except while somebody is
 *     asking it to. The copy binds no Claude credential in its environment.
 *   - JUDGE ITS OWN SCOPE. D-199 (2): what an agent may reach is a row a member
 *     AUTHORED, read from the record at the plane's gate by `aiTaskScope`. A copy
 *     of that judgement here would be a second enforcement point that drifts from
 *     the first, and a scope compiled into a Worker is precisely the settings row
 *     D-199 refused. There is no op allow-list, no scope and no class in this
 *     file. `ops.mjs`' `PLANE_OPS` is a DECLARATION of what the table's rows
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

/* FL-3 / IS-9 — THE CONTROL FLOW TABLE, IN ITS OWN MODULE AND PURE (`agent-harness`, T33-54).
 *
 * Read `agent-harness/src/harness.mjs`'s header for why it is a table rather than a narrative.
 * The split matters here: this file is the DRIVER and holds no decision, so the
 * suite can walk every row of the table in a plain node process AND drive it
 * through `POST /run` inside workerd, and the two must agree. A table exercised
 * only through the op is a table nobody can exhaust. */
import {
  FIRST_STEP, LEVELS, BUDGET_BOUNDS, passLimit,
  nextStep, stepLog, applyJudgement, adjustedFrom, emptyLevelCandidates, runContextTarget,
  advance, publishableState, resumeFrom,
  PLAN_FLOW, PLAN_MAX_PASSES, OPTION_KEYS, flowFor, nextPlanStep, planAdvance, applyPlanJudgement, planDedup,
  PLAN_READS, PROFILE_FACTS, planSubjectReads, earlierPlans, whyWithUndetermined, resumeTargets,
} from "../../agent-harness/src/harness.mjs";

/* R4, R37, R55 — what this member names to the plane: its namespaces, a run's ops, the meaning arm, an ask's reach. */
import { NAMESPACES, MEANING_ARM } from "./ops.mjs";
/* R63 — what a read hands the model of a file: the readers' text and its `active` list, never its bytes. */
import { toolContent, droppedNote } from "./reads.mjs";
/* R54–R56 — `POST /ask`, in its own file. */
import { handleAsk } from "./ask.mjs";
/* R59 — `POST /draft`, in its own file. */
import { handleDraft } from "./draft.mjs";

/* R49, N293 — THE CEILING ON A RUN'S PUBLISHED STATE IS run-rules' (its R10), read from its own module and never
 * copied. run-rules is pure (no storage, no clock), so this is the one plane module in the bundle beside `tokens.mjs`. */
import { AI_RUN_STATE_MAX_BYTES } from "../../bio-plane/src/run-rules/index.mjs";

/* FL-5 / IS-9(a) — THE SUB-SESSION CONTRACTS, ALSO IN THEIR OWN FILE AND ALSO
 * PURE. What goes OUT to a sub-session and what may come BACK are shapes, not
 * control flow, so they live beside the table rather than inside it — and the
 * suite can drive every spelling of a return in a plain node process while the
 * driver's job is reduced to asking and obeying. Read `agent-harness`' `subsession.mjs` header
 * for why the rule is an exact key set rather than a list of banned fields. */
import {
  SUBSESSION_OPS, spawnContract, takeReports, citedAddresses, documentHoldings, holdingsNote, LOOKED_STATES,
} from "../../agent-harness/src/subsession.mjs";

/* R32, R33 (K1502, K1755) — WHICH ACCOUNT SERVES THE ACT: the one that arrived, judged at its own level (`member` or
 * `group`), in its own file and pure. The account arrives PER CALL beside the `ai` credential and is retained exactly
 * as long: not at all (R36). */
import {
  resolveClaudeCascade, cascadeToken, CASCADE_NO_ACCOUNT, ACCOUNT_KINDS, CASCADE_ORDER, LEVEL_KINDS,
} from "./cascade.mjs";

/* THE MODEL HALF (`agent-model`, T33-55; R58). It runs a judgement's turns inside a step, under the account that serves
 * the member's act and the model its mode names (`MODEL_FOR_MODE`), and decides no step; the table still decides every one. */
import {
  DEFAULT_MAX_SEGMENT_BYTES, SEGMENT_BYTES_SOURCE, segmentMeter, converse, MODEL_FOR_MODE,
  judgeTools, planJudgeTools, LOAD_LAYER, parentSystem, openRow, rowFacts, subsessionSystem, subsessionOpening,
  subsessionTools,
} from "../../agent-model/src/model.mjs";

/* R48 — THE PACK A RUN'S MODEL IS INSTRUCTED BY is the one the plane renders and publishes on its untargeted
 * `op=affordances` answer (`pack`, control-plane R41: `skills.renderPack` over the composed machine fences). This
 * member renders nothing and imports neither the check catalogue nor `skills`' code (N157, §1a), so its bundle carries
 * what it runs; it holds the pack's version to the one the run recorded. */

/* ------------------------------------------------------ THE SEGMENT BOUND
 *
 * 120 TURNS, AND THE CEILING IT KEEPS CLEAR OF IS CPU — NOT MEMORY. D-312 (2026-09-25,
 * measurements/M-168.md) re-checked this bound, because it was first sized on a misreading:
 * FL-1's `memoryUsageBytesP99 = 120.4 MB at 200 turns` was read with 128 MB as its
 * denominator, as a wall ~200 turns away. The metric is not a share of anything (CPDF-15:
 * 132–240 MB on invocations the platform marks `success`, the kill at 278.7 MB reported;
 * INTERFACES.md §"The memory bound, and how it is expressed"), and walking the same loop up
 * until refused found NO memory wall:
 *
 *   turns (scratch corpus)   400     800     1,200    1,400    — every invocation `success`
 *   transcript               0.68 MB 1.34 MB 2.00 MB  2.34 MB
 *   memoryUsageBytesP99      120.9   107.8   122.7    94.7 MB  — FLAT while the work grows 3.5x
 *   billed CPU / invocation  1.06 s  3.85 s  12.59 s  15.75 s  — ~7-10 ms per MB re-serialised
 *
 * CPU is spent RE-SERIALISING THE TRANSCRIPT every turn, so it grows with the CUMULATIVE
 * BYTES SENT (~turns^2 x bytes per turn), and this member runs under the 30 s DEFAULT (its
 * wrangler.jsonc sets no `limits`): ~3-4 GB re-serialised fits. At FL-1's payload size
 * (~7.2 KB of transcript per turn) that is ~900-1,050 turns; 120 turns there cost ~0.3 s.
 * So 120 is SAFE and carries ~8x headroom — not the ~1.7x its first reading claimed. It is
 * kept, not raised: the payload size of a REAL run is unmeasured and a larger one moves the
 * ceiling down as its square root. A turn count is the wrong UNIT for a CPU bound that
 * scales with bytes (D-611 names the fix: bound the segment on bytes re-serialised).
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
const BOUND_SOURCE = "FL-1 2026-08-08 curve, re-checked by D-312 2026-09-25 (M-168): CPU binds, not memory; "
  + "120 turns is ~1/8 of the ~1,000 the 30 s CPU default fits at FL-1's payload size";

/* The `ai` credential's shape (PL-11). Checked ONLY so an absent or obviously
   malformed credential is refused here instead of costing a round trip — this is
   a shape test and NOT an authorisation test. Whether the credential is live,
   revoked, or scoped to the work being asked for is the PLANE's judgement, read
   from the record, and it is never duplicated here. */
const AI_TOKEN_SHAPE = /^aik-[0-9a-f]{64}$/;

/* D-462, R4 — THE NAMESPACES THIS MEMBER WILL NAME TO THE PLANE: `NAMESPACES` in `ops.mjs`, exactly `bio` or
 * `scratch`, exported there (a Worker entry may export only handlers) so control-plane pins it to its namespace gate
 * (N402). A named namespace outside it is refused here, before the cascade and before any plane call is spent. NOT
 * NAMING ONE is a different condition and keeps its old code, BAD_STORE: the plane defaults an ABSENT `store=`, and
 * this member deliberately does not (see the refusal below). */

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    /* R47: no `access-control-allow-origin`. Nothing but the plane's service binding reaches this member, and
       a header inviting a browser origin was an invitation to a caller it must never have. */
    headers: { "content-type": "application/json" },
  });

/* Every refusable condition answers through THIS helper, with the code passed as
   a STRING LITERAL at the site.

   NO DEC-49 CHECK FAMILY IS OWED HERE, AND THAT IS A DECISION RATHER THAN AN
   OMISSION. DEC-49's reach is "every code a SURFACE can receive", which the
   guard's own header records as SMALLER than every refusal code in the plane. No
   member ever receives these codes: this Worker has no member-facing surface and
   its only caller is the plane. The DEC-49 guard that walked the plane's codes
   (`civicos-ui/check-refusal-codes.mjs`, deleted with the old battery in T20)
   never walked the fleet — correct for the same reason, and why `pdf-worker`'s
   BAD_SHA/NOT_FOUND carry no rows.

   The convention is followed anyway because it costs nothing and it is what gives
   the guard teeth the day it is pointed here: a local helper taking the code in a
   VARIABLE is invisible to a walk over literals, which is how seven of thirteen
   governed sites once read 776 lines and compared zero codes. The day any surface
   renders one of these verbatim to a member — which FL-3/FL-4 could do while
   composing a run's failure — a family is owed, and so is a check that reads
   these codes. */
const refusal = (code, detail, status, extra) =>
  json({ ok: false, reason: code, code, detail, worker: "agent-worker", ...(extra || {}) }, status);

/* ---------------------------------------------------------------- THE SURFACE
 *
 * What this member answers, as data (R34): `fleet-member.json` names this export,
 * and the suites hold it to the routes the handler actually serves.
 *
 * `mutating` is a property of THIS WORKER and not of what the plane may do
 * downstream, and for a fleet member it must be `false` on every row — fleet
 * rule 2, a member ASSERTS nothing. That is not left to discipline: the suites
 * fail a member that declares a mutating surface op. */
export const SURFACE = {
  run:     { method: "POST", mutating: false },
  ask:     { method: "POST", mutating: false },
  draft:   { method: "POST", mutating: false },
  version: { method: "GET",  mutating: false },
};

/* --------------------------------------------------------------- THE ONE CALL
 *
 * Everything this member learns, it learns here. The credential is forwarded
 * exactly as handed over and is never stored, logged or echoed.
 *
 * R60 (F1; K1874): THE CREDENTIAL TRAVELS IN THE `Authorization: Bearer` HEADER
 * AND NOWHERE ELSE. An address is logged, cached and echoed by every hop it
 * passes; a header is not part of it. So the address carries only `op`, `store`
 * and the op's own arguments, a body only the op's own fields, and there is no
 * query form kept as a fallback: the plane reads the header from admission's T35
 * merge, and both ship in one release. A call with no credential (a draft that
 * may read nothing, R59) sends no header at all.
 *
 * REC-52's rule, one layer out: a failure to ANSWER is not an answer. If the
 * plane could not be reached, this member says the plane was silent — it does not
 * convert its own failure into a statement about the record or about who the
 * caller is. */
async function askPlane(env, op, credential, store, query = null, body = null) {
  /* An ask that names no namespace sends none, and the plane's default applies (K1601 (5)); a run always names one (R4). */
  let url = `${PLANE_ORIGIN}/?op=${op}${store == null ? "" : `&store=${encodeURIComponent(store)}`}`;
  for (const [k, v] of Object.entries(query || {}))
    if (v != null && v !== "") url += `&${k}=${encodeURIComponent(String(v))}`;
  const headers = credential ? { authorization: `Bearer ${credential}` } : {};
  let res;
  try {
    res = await env.PLANE.fetch(url, body == null ? { headers } : {
      method: "POST", headers: { ...headers, "content-type": "application/json" }, body: JSON.stringify(body),
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

/** FL-3's DRIVER. It turns each row of `agent-harness`' table into plane calls
 *  and appends an observation entry for EVERY step — including the last one, and
 *  including the steps of a run that ends badly (§14b.6: log-always).
 *
 *  IT DECIDES NOTHING. `nextStep` picks the step, `stopBecause` names the bound,
 *  `applyJudgement` polices what a judgement may touch, and `adjustedFrom`
 *  answers F10's precondition. Every one of those is in `agent-harness`, is pure,
 *  and is driven directly by the suite as well as through this function — so a
 *  decision made here instead would be a decision nothing exhaustive covers. */
async function driveHarness(env, { runId, store, credential, judgements, maxSteps, account = null, model = null }) {
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
  /* REC-100 / IC-130: every log entry the plane REFUSED, named with its step,
     and every step whose model-judged PRESENT was recorded as indeterminate
     because it could name nothing (`stepLog`'s note). Both are published. */
  const logRefused = [];
  let presentUnbacked = 0;

  /* THE RUN'S OWN FACTS COME FROM THE RECORD, NEVER FROM THE CALLER.
     The MODE above all: SK-4's gate is only a gate while the mode is the
     record's. A `mode` in the request body would be a gate the caller holds,
     which is the defect §14b.4 names one layer up. */
  const runRead = planeAnswer(await call("airun", { run: runId }), "airun");
  if (runRead.silent)
    return { refusal: planeSilent(runRead.silent) };
  /* D-276: this site DID check the answer, at the ENVELOPE. It is routed through
     `planeAnswer` so it also sees a refusal the control plane wrapped inside
     `result` — the shape the meaning read was actually refused in. A store-level
     refusal used to fall through here as a session-less body and be re-worded as
     this member's own NO_SUCH_RUN, which is a different sentence from the plane's
     and is the one thing a member may never do to a refusal (A6). */
  if (runRead.refused)
    return { refusal: planeRefused(runId, store,
      { status: 403, body: runRead.refused.plane ?? null }) };
  const session = runRead.result?.session ?? null;
  if (!session)
    return { refusal: refusal("NO_SUCH_RUN",
      "the plane holds no run under that id in this namespace, so there is nothing to continue. This "
      + "member opens no run: a run's identity and its conditions are the plane's, and a member that "
      + "could open one would be a machine deciding what it was formed under.", 404, { run_id: runId }) };

  /* R10, R57 (K1502, K1503, K1755) — THE RECORD'S ACCOUNT HOLDER AND THE MEMBER WHOSE ACT THE ARRIVED ACCOUNT SERVES
     MUST BE THE SAME MEMBER. The run records the member whose act started it (a standing question's author) as its
     account holder (`session.principal.claude`); this segment was handed the account that serves one member's act:
     that member's own reference, or the group's API key (`level: "group"`), which serves that member's act and never
     the group's own, so the run stays that member's act. When the two members differ, driving on would spend one
     member's act on another's run, which K1502 forbids and nobody could audit. Refused before any step, naming both
     members (ids, never a secret); this member re-words neither. Every segment carries an account (R6), the stubbed
     `judgements` path included, so the check is made on every segment. */
  const recordedPayer = session.principal?.claude ?? null;
  if (account && recordedPayer !== account.member)
    return { refusal: refusal("RUN_NAMES_A_DIFFERENT_PAYER",
      `the run's own record says it is the act of ${JSON.stringify(recordedPayer)}, but the Claude account handed to `
      + `this segment serves ${JSON.stringify(account.member)}'s act (${account.level === "group"
        ? "the group's API key, serving that member" : "that member's own reference"}). A run is continued only under `
      + "the account that serves the member whose act started it, never another member's (K1502, K1755, D-260), so no "
      + "step was taken and the run stays as it was. The caller handed the account for the wrong member, or the run "
      + "recorded the wrong member.",
      409, { run_id: runId, recorded: recordedPayer, supplied: account.member }) };

  /* R48 — THE PACK, AS THE PLANE PUBLISHED IT, HELD TO THE RUN'S RECORD, BEFORE ANY TURN. Only when model turns run:
     until then the pack instructs nothing and this changes nothing. */
  if (model) {
    const pub = planeAnswer(await call("affordances"), "affordances");
    if (pub.silent) return { refusal: planeSilent(pub.silent) };
    if (pub.refused)
      return { refusal: planeRefused(runId, store, { status: 403, body: pub.refused.plane ?? null }) };
    const pack = publishedPack(pub.result);
    const recordedSkill = session.principal?.skill ?? null;
    if (!pack.ok || recordedSkill !== pack.pack.version)
      return { refusal: refusal("SKILL_VERSION_MISMATCH",
        (pack.ok
          ? "the run's record says it runs under one skill pack and the pack the plane publishes is another, so its "
            + "model would be instructed by words the record does not name."
          : "the plane published no skill pack this member can instruct a model with, so the pack's version is "
            + `UNDETERMINED and cannot be held to the one the run recorded (${pack.why}).`)
        + " No turn was taken; the run is resumable once the two agree.", 409,
        { run_id: runId, recorded: recordedSkill, rendered: pack.ok ? pack.pack.version : null,
          ...(pack.ok ? {} : { rendered_basis: "UNDETERMINED", pack_absent: pack.why }) }) };
    const { pack: held } = pack;
    model.pack = held;
    model.messages = [];
    model.system = parentSystem(held);
    /* R52: a plan-mode run judges with `optionPropose`'s fields only; every other mode with the search table's. */
    /* R56 (K1479, K1502, K1755): the `suggestions` layer is loadable only when the switch that governs the act is on. */
    model.layers = loadableLayers(held, model.suggestions);
    model.tools = [LOAD_LAYER(model.layers),
                   ...(session.mode === "plan" ? planJudgeTools(OPTION_KEYS) : judgeTools(LEVELS))];
  }

  /* §14b.7 — A RESUMED RUN READS ITS OWN LOG AND CONTINUES.
     The count is what the table needs; the entries are what a later reader
     needs. Both come from PL-5's `op=airunlog`, in `seq` order, which is why
     that read keeps ASCENDING order and cuts at the END. */
  const logRead = planeAnswer(await call("airunlog", { run: runId }), "airunlog");
  if (logRead.silent) return { refusal: planeSilent(logRead.silent) };
  /* D-276's CLASS. This read was TRANSPORT-checked only, so a refused
     `op=airunlog` left `entries` unreadable and `resumedFrom` at 0 — this member
     stating "there is no prior log" about a run whose log the record had just
     declined to show it, and then publishing that as `resumed_from`. It is
     treated exactly as a refused `op=airun` above is: a run's own facts are the
     record's, and a segment that cannot read them does not proceed on a guess. */
  if (logRead.refused)
    return { refusal: planeRefused(runId, store,
      { status: 403, body: logRead.refused.plane ?? null }) };
  const priorLog = logRead.result ?? {};
  const resumedFrom = Array.isArray(priorLog.entries) ? priorLog.entries.length : 0;
  /* THE ADDRESS OF A LOOK THIS SEGMENT WRITES: `log:<seq>`, the ordinal `op=airunlog` answers (agent-harness R7's reports
     cite it as `observed_at`). Knowable only from a whole log: a truncated read leaves it UNDETERMINED. */
  const logSeq = { next: () => (priorLog.truncated === true ? null : resumedFrom + logged + 1),
                   landed: () => { logged += 1; },
                   refused: (named) => { logRefused.push(named); refusals.push(named); } };

  const budget = {};
  for (const b of Array.isArray(session.budget) ? session.budget : [])
    budget[String(b.bound)] = { allowed: Number(b.allowed) || 0, consumed: Number(b.consumed) || 0 };

  /* FL-11 (§11 item 5, RULE 1'S TARGET, BOB #28) — THE RUN'S TARGET IS SEEDED HERE, FROM THE RUN'S OWN
     CONTEXT AS THE RECORD HOLDS IT, and never from the request body or a judgement (`target` is
     NOT_JUDGEABLE). Before FL-11 nothing set it, so the empty-level candidates and dedup's read went out
     naming no question and the plane refused every table-made suggestion. `runContextTarget` says why it
     holds what it holds; a project run's target is UNDETERMINED there and stated, never the project id. */
  const seeded = runContextTarget(session);

  let state = {
    step: FIRST_STEP,
    mode: session.mode,
    target: seeded.target, targetBasis: seeded.basis,
    pass: 0,
    /* R50: mode `plan` walks one pass; R15's limit otherwise. */
    maxPasses: session.mode === "plan" ? PLAN_MAX_PASSES
      : passLimit(session.max_passes),
    /* R51: the plan a plan-mode run proposes to is the run's own (ai-runs R46, R19), never the caller's. */
    planId: typeof session.plan === "string" && session.plan ? session.plan : null,
    resumedFrom,
    budget,
    targets: [], reports: [], candidates: [], queue: [],
    refusal: null, adjusted: false, submission: null,
    level: null, observed: null, governed: false, condition: null,
  };
  /* R11, N153 — A RESUMED RUN CONTINUES AT THE STATE ITS LAST TICK PUBLISHED (ai-runs R19's `state`), and starts from
     the `resume` row when there is none. The gate still comes first: the published state names where the table goes
     AFTER `resume`, and carries only the table's own fields (`resumeFrom`), never the mode, target, limit or budget. */
  const FLOW = flowFor(session.mode);
  const planMode = FLOW === PLAN_FLOW;
  const resumed = resumeFrom(session.state ?? null, FLOW);
  state = resumed.at
    ? { ...state, ...resumed.state, resumeAt: resumed.at, resumeBasis: null }
    : { ...state, resumeAt: null, resumeBasis: resumed.basis };

  /* Judgements are consumed IN ORDER and matched to the step that asks for one.
     A judgement offered for a step the table does not judge is refused by
     `applyJudgement` reaching nothing, and a step that judges with none supplied
     simply carries the state forward — an absent judgement is not an error, it
     is a run whose model had nothing to add. */
  let jx = 0;
  let ended = null, steps = 0, segmentStopped = null;

  while (steps < maxSteps) {
    steps += 1;
    const callsAtStepStart = calls;
    const row = FLOW[state.step];

    /* THE JUDGEMENT, AND THE ONE DOOR IT COMES THROUGH. Supplied by the caller in order, or (R58; agent-model R1) made by
       a model turn at every judged row but `collect`, whose judgements are the sub-sessions' REPORTS (agent-harness R7). */
    let judgement;
    let factsDropped = [];
    if (row && row.judged && model && state.step !== "collect") {
      /* R61 (F5; agent-model R12): THE ROW'S FACTS ARE RECORD TEXT, AND REACH THE MODEL ONLY AS A TOOL'S RESULT.
         `openRow` appends the row's own prompt (the step and the row) and then the facts it judges over as the result of
         `read_facts` (which `converse` answers again from the transcript if the model calls it), text only (R63). */
      const { content: facts, dropped } = toolContent(rowFacts(state, LEVELS));
      factsDropped = dropped;
      openRow(model.messages, state.step, row, facts);
      const got = await converse({
        reference: model.reference, runner: model.runner, mode: state.mode, meter: model.meter, system: model.system,
        messages: model.messages, tools: model.tools, finalTool: `judge_${state.step}`,
        onTool: async (name, input) => {
          if (name === "load_layer") return loadLayer(model, input);
          return { content: `this step is judged by judge_${state.step}`, error: true };
        },
      });
      model.spent(got, state.mode);
      if (got.silent) return { refusal: modelSilent(got.silent, runId) };
      if (got.refused) return { refusal: modelRefused(got.refused, runId) };
      if (got.stopped) { segmentStopped = got.stopped; break; }
      if (got.answer) judgement = got.answer;
    } else if (row && row.judged && !model && jx < judgements.length) {
      judgement = judgements[jx];
      jx += 1;
    }
    if (judgement !== undefined) {
      const applied = planMode ? applyPlanJudgement(state, judgement) : applyJudgement(state, judgement);
      if (!applied.ok)
        return { refusal: refusal("JUDGEMENT_OVERREACH", applied.detail, 400,
          { step: state.step, fields: applied.overreach }) };
      state = applied.state;
    }

    /* WHAT THE ROW DOES, IN PLANE CALLS. */
    const work = planMode ? await performPlanStep(call, state, runId)
      : await performStep(call, state, runId, model, logSeq);
    if (work.silent) return { refusal: planeSilent(work.silent) };
    if (work.model?.silent) return { refusal: modelSilent(work.model.silent, runId) };
    if (work.model?.refused) return { refusal: modelRefused(work.model.refused, runId) };
    /* D-611: the segment's turns or bytes ran out inside the step. The SEGMENT stops; the run does not, and what
       the step already logged stays logged. */
    if (work.stopped) { segmentStopped = work.stopped; break; }
    /* THE SPAWN CONTRACT COULD NOT BE COMPOSED, AND THE RUN STOPS RATHER THAN
       FANNING OUT ANYWAY. This is the §14 fence firing: the plane's search-half
       payload arrived carrying the lens, or carrying nothing at all. Continuing
       would mean a run that searched under a bias nobody can afterwards prove it
       did not use — so it refuses, names the level it was composing for, and
       passes the plane's payload nowhere. 502, because the fault is upstream of
       this member and reporting it as this member's would be REC-52's rule read
       backwards. */
    if (work.contract)
      return { refusal: refusal(work.contract.code, work.contract.detail, 502,
        { level: work.level ?? null, run_id: runId }) };
    /* D-276: THE PLANE REFUSED A CALL THIS STEP CANNOT CONTINUE WITHOUT, and its
       refusal is passed through in the plane's own words rather than re-worded
       into a statement about this member's inputs. */
    if (work.planeRefusal)
      return { refusal: planeRefused(runId, store,
        { status: 403, body: work.planeRefusal.plane ?? null }) };
    /* A STEP MAY REFUSE MORE THAN ONCE — see the acquisition loop and the
       citation re-reads. Publishing the last one only would make the run's own
       refusal list shorter than the run's refusals. */
    if (work.refused) refusals.push(...(Array.isArray(work.refused) ? work.refused : [work.refused]));
    state = work.state;
    if (work.submitted) submitted += 1;
    /* R52: the plane counts `proposals` (run-rules R13) and this member sends no figure for it; the copy here follows
       the plane's count so the table stops on the bound (R50), and the record's figure is read again next segment. */
    if (work.proposed && state.budget.proposals)
      state = { ...state, budget: { ...state.budget,
        proposals: { ...state.budget.proposals, consumed: state.budget.proposals.consumed + 1 } } };
    if (work.verbatim) verbatimResubmits += 1;
    if (state.step === "adjust" && state.adjusted) adjusted += 1;

    const decision = planMode ? nextPlanStep(state) : nextStep(state);
    /* R63: a drop of a file's bytes, from the row's facts or a sub-session's reads, is named in the step's trace. */
    const dropNote = droppedNote([...factsDropped, ...(work.dropped || [])]);
    const stepNote = [work.note, dropNote].filter(Boolean).join("; ");
    trace.push({ step: state.step, to: decision.step, why: decision.why,
                 ...(stepNote ? { note: stepNote } : {}) });

    /* LOG-ALWAYS, AND IT IS A TICK RATHER THAN A SEPARATE WRITE. The tick is
       ONE call that appends what was observed, spends the budget and extends
       the lease — PL-5's own ordering, chosen so partial results survive a
       death that happens next. Consuming through it is also why nothing here
       writes `runtime-ceiling-reached`: a tick that spends the last of a budget
       ends the run through the plane's one exit and the plane writes the
       condition. */
    const spentThisStep = calls - callsAtStepStart + 1; /* +1: the tick is a subrequest too */
    const consume = { ...(work.consume || {}), runtime: spentThisStep };
    /* R26, K148: the entry only when the step's judgement states a look; a step that looked at nothing still
       ticks, for its spend and its lease, and sends no entry. */
    const entry = stepLog(state, decision);
    if (entry && state.observed === "PRESENT") presentUnbacked += 1;
    /* R11, N153: the tick also publishes where the table goes next, so a later segment continues there. The gate's
       tick publishes nothing: until `resume` has moved on, the resume point is the one the record already holds. */
    const after = planMode ? planAdvance(state, decision) : advance(state, decision);
    /* R49: the state stays within ai-runs' ceiling; one that would not is published as its pass restarted, and the
       step's trace says so (the answer's keys are R28's). */
    let published = null;
    if (resumeTargets(FLOW).includes(after.step)) {
      published = publishableState(after, AI_RUN_STATE_MAX_BYTES, FLOW);
      if (published.restarted) {
        const last = trace[trace.length - 1];
        last.note = (last.note ? `${last.note}; ` : "")
          + `the table's state is ${published.restarted.bytes} bytes, over the ${published.restarted.limit} a run's `
          + `state may hold (ai-runs R45), so this tick publishes the pass restarted at '${published.restarted.at}' `
          + "and a later segment re-does it rather than resume from a state the record refuses";
      }
    }
    /* ai-runs R48: the usage of every model call since the last tick, counted for the member whose account carried it. */
    const usage = model ? model.drain() : [];
    const tick = await call("airuntick", null,
      { run: runId, log: entry ? [entry] : [], consume, ...(published ? { state: published.state } : {}),
        ...(usage.length ? { usage } : {}) });
    if (!tick.reached) return { refusal: planeSilent(tick) };
    /* R26, R43 — D-276's class at the tick: a refusal of the whole tick nested in `result` is a refusal, never
       an entry that landed. */
    const tickAnswer = planeAnswer(tick, "airuntick");
    if (tickAnswer.refused) {
      /* R49: `AI_RUN_STATE_TOO_LARGE` (ai-runs R45) among them — a refusal of this tick, never the plane failing; the
         segment carries on. */
      refusals.push({ at: "airuntick", code: tickAnswer.refused.code, check: tickAnswer.refused.check,
                      plane: tickAnswer.refused.plane });
    } else {
      const t = tick.body.result ?? tick.body;
      /* REC-100 / IC-130 — A TICK THAT ANSWERED ok IS NOT AN ENTRY THAT LANDED.
         `op=airuntick` appends entry by entry and REFUSES per entry, returning
         `appended` and `refused[]` beside `ok: true` — §14b.7's partial results,
         so one bad entry cannot cost the budget spend or the lease. This site
         used to count `logged += 1` off the envelope alone, so a refused entry
         vanished: the run reported it logged and the record never held it. That
         is the D-276 class (a refusal inside a well-formed answer) at the one
         op whose refusals are PER ENTRY rather than per call.
         So: count what the plane says it APPENDED, and carry every refused entry
         into the run's own `refusals` (in the plane's words, never re-worded)
         and into `log_refused`, naming the step it came from. A plane that does
         not publish `appended` is read as having appended what it did not
         refuse, which is the plane's own contract (appended + refused = sent). */
      const refusedEntries = Array.isArray(t?.refused) ? t.refused : [];
      const appendedNow = t?.appended != null && Number.isFinite(Number(t.appended))
        ? Number(t.appended)
        : (t?.ticked === false ? 0 : Math.max(0, (entry ? 1 : 0) - refusedEntries.length));
      logged += appendedNow;
      for (const r of refusedEntries) {
        const named = { at: "airuntick.log", step: state.step, to: decision.step,
                        code: r?.code ?? r?.reason ?? null, check: r?.check ?? null,
                        ...(r?.referent_fault ? { referent_fault: r.referent_fault } : {}),
                        plane: r ?? null };
        logRefused.push(named);
        refusals.push(named);
      }
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
    }
    /* A LOOK BELONGS TO THE STEP THAT MADE IT: it is not carried into the next step's entry. */
    const look = { level: null, observed: null, governed: false, condition: null };
    state = { ...state, ...look };

    if (decision.step === "close") {
      /* THE ORDINARY EXIT, NAMING THE BOUND (C-22.5). The plane refuses a close
         that names none rather than inferring "completed" from silence, so the
         bound the TABLE computed is handed over explicitly. */
      const closed = planeAnswer(
        await call("airunclose", null, { run: runId, bound: decision.bound || "completed" }),
        "airunclose");
      if (closed.silent) return { refusal: planeSilent(closed.silent) };
      /* D-276's CLASS, AND THIS ONE IS A CLAIM ABOUT THE RECORD ITSELF. `ended`
         says the run ENDED and names who ended it; it used to be written from a
         transport check, so a REFUSED close published `ended: { bound, by: "the
         table" }` for a run the record still holds open. A run reported as
         terminated when the plane declined to terminate it is the record
         claiming more than it can support. The refusal is named and `ended`
         stays null, which is the honest "this segment did not end it". */
      /* The pass a close completes is counted (R50's one pass; `advance` leaves R15's count as it was). */
      if (closed.refused) { refusals.push(closed.refused); state = { ...state, step: "close", pass: after.pass }; break; }
      ended = { bound: decision.bound || "completed", by: "the table" };
      state = { ...state, step: "close", pass: after.pass };
      break;
    }
    /* THE ONE PLACE THE REFUSAL IS CARRIED FORWARD, AND IT IS CARRIED TO EXACTLY
       ONE ROW. `adjust` needs both the refusal and the bytes that earned it, or
       `adjustedFrom` has nothing to compare and F10's precondition becomes a
       promise. Every other transition CLEARS them, so a stale refusal cannot
       route a later step into an adjust it did not earn.
       THE PASS COUNTER MOVES WHEN A PASS IS **DONE**, NOT WHEN ONE STARTS, AND
       THE DIFFERENCE IS OFF-BY-ONE IN THE DIRECTION THAT MATTERS. Counting on
       entry to `plan` makes `maxPasses: 1` mean ZERO completed passes — the run
       fans out over nothing and closes reporting `completed`, which is an empty
       run wearing a finished run's answer, and this suite's own empty-run arm is
       what distinguishes those. `next-pass` is the row that means "a pass
       finished", so it is the row that counts. Both are `advance`, the move the
       tick above published. */
    state = { ...after, budget: state.budget, ...look };
  }

  return {
    mode: state.mode, trace, passes: state.pass, ended, logged, submitted,
    /* FL-11: the question this run's readings default to, and WHY — published so a reader can check it
       against the run's context rather than take it on this member's word. */
    target: { id: state.target ?? null, basis: state.targetBasis ?? null },
    refusals, adjusted, verbatimResubmits, resumedFrom, logRefused, presentUnbacked,
    /* FL-5's FACTS, PUBLISHED RATHER THAN HELD. FL-3 computed the fence's answer
       into a local nobody could read and asserted it by grepping a note — which
       measured nothing (see the fan-out step). What a suite, and a later reader,
       actually need is the object a sub-session WAS HANDED. So the contracts
       themselves go on the wire: whatever is true of the spawn contract can then
       be read off the answer rather than taken on the member's word. They are the
       LAST pass's, and the field says so. */
    fanout: {
      of_pass: state.pass, levels: LEVELS, scope: SUBSESSION_OPS,
      contracts: state.contracts || [],
    },
    reportsTaken: (state.reports || []).length,
    /* NAMED, NEVER A COUNT ALONE. A refused return is a component of this system
       breaking its contract; a bare number would say it happened and not what. */
    reportsRefused: state.reportsRefused || [],
    citationsReread: state.rereads || 0,
    /* D-220: the LAST pass's holdings, like `fanout`. Null when no `collect` ran,
       which is "nothing was counted", not "nothing is held". */
    holdings: state.holdings ?? null,
    budget: BUDGET_BOUNDS.map((b) => ({ bound: b, ...(state.budget[b] || { allowed: 0, consumed: 0 }) })),
    segmentStopped,
  };
}

/* -------------------------------------------------- D-276: THE ANSWER, NOT THE WIRE
 *
 * A REFUSAL THAT ARRIVES AS A WELL-FORMED HTTP RESPONSE IS STILL A REFUSAL, and
 * this is the one place in this member that says so. `askPlane` answers the
 * TRANSPORT question — did the plane answer at all — and nothing more. Reading
 * `.reached` and then taking fields off the body treats `{ok: false, reason:
 * MEANING_ROWS_UNKNOWN_ARM}` as an answer with no rows in it, which is how
 * D-276 turned the plane's own false-coverage fence into false coverage: the
 * run note said `0 meaning-grain row(s) queried` for a call that never
 * succeeded, and that note lands in an AI run's OBSERVATION ENTRIES, which are
 * record. CLAUDE.md: *"no meaning derived may mean nothing was extracted;
 * nothing extracted may mean the document was never read; no document may mean
 * nobody looked"* — saying WHICH is a first-class obligation, and "the record
 * was not asked" is a fourth sentence that must never be written as the first.
 *
 * REC-52/REC-53 swept exactly this shape through the plane — a silence or a
 * refusal turning into a normal-looking answer. This is that lesson on the
 * member side, and it is a FUNCTION rather than a rule so that a new call site
 * cannot get it wrong quietly: there are three outcomes and a caller must
 * handle each by name.
 *
 *   { silent }   the plane did not answer. Nothing is known about the record.
 *   { refused }  the plane answered, and its answer is NO. The code, the
 *                C-number and the plane's own body travel with it — this member
 *                re-words no refusal (A6).
 *   { result }   the plane answered YES, and this is what it said.
 *
 * AND THE REFUSAL IS NOT WHERE A READER EXPECTS IT — MEASURED 2026-08-09 BY
 * DRIVING THE REAL PLANE, and it is why "check `ok`" is only half the fix.
 * `op=meaningrows` refusing an unknown arm answers **HTTP 200** with a
 * **TOP-LEVEL `ok: true`**, because the control plane wraps whatever the Durable
 * Object returned:
 *
 *   { ok: true, result: { ok: false, reason: "MEANING_ROWS_UNKNOWN_ARM",
 *                         check: "C-23.2", translation: "…" }, store, tokenClass }
 *
 * A member that tested the ENVELOPE's `ok` would have read that as a successful
 * call, exactly as the member that tested `.reached` did — the same defect one
 * layer in. So the answer is the innermost object that states its own `ok`, and
 * a call is refused when EITHER the envelope or that object says no. An op whose
 * result carries no `ok` at all (`op=airunspawn`, `op=basisversions`) is
 * unaffected: the envelope is then the only thing that speaks.
 */
function planeAnswer(asked, at) {
  if (!asked.reached) return { at, silent: asked };
  const envelope = (asked.body && typeof asked.body === "object") ? asked.body : {};
  const inner = (envelope.result && typeof envelope.result === "object" && !Array.isArray(envelope.result))
    ? envelope.result : null;
  /* WHOEVER STATES `ok` IS WHO IS ANSWERING. */
  const said = (inner && "ok" in inner) ? inner : envelope;
  if (asked.status !== 200 || envelope.ok !== true || said.ok === false)
    return { at, refused: { at,
                            code: said.reason ?? said.code ?? envelope.reason ?? envelope.code ?? null,
                            check: said.check ?? envelope.check ?? null,
                            plane: asked.body ?? null } };
  return { at, result: inner ?? envelope };
}

/** R48 — the pack on the plane's untargeted `op=affordances` answer (control-plane R41): `{ok, pack}` when it carries
 *  one with a version, a resident layer and a disclosed map; otherwise `{ok: false, why}`, naming the plane's own
 *  `pack_absent` when it gave one. A partial pack is never used: its version is undetermined. */
function publishedPack(answer) {
  const a = answer && typeof answer === "object" ? answer : {};
  const p = a.pack;
  if (p && typeof p === "object" && typeof p.version === "string" && p.version
      && p.resident && typeof p.resident === "object" && p.disclosed && typeof p.disclosed === "object")
    return { ok: true, pack: p };
  if (typeof a.pack_absent === "string" && a.pack_absent) return { ok: false, why: a.pack_absent.slice(0, 300) };
  return { ok: false, why: p == null ? "the answer carries no pack" : "the answer's pack has no version, resident layer or disclosed layers" };
}

/** THE ONE MEANING READER IN THIS MEMBER, AND THE OP IS NAMED IN EXACTLY ONE
 *  PLACE. Two rows now need PL-9's read — `compose` queries at meaning grain and
 *  `collect` re-reads a citation BY ADDRESS through the same compiler's `ids`
 *  restriction — and two call sites naming the op would be two readers to keep in
 *  step. §14b.1's query-never-load is not "call this op"; it is that the run
 *  reaches everything it does not hold by ASKING, through one door. D-15's
 *  one-compilation-point rule is the same argument one layer down, and
 *  `harness.test.mjs` A9 holds it at the interface: every meaning read a run makes
 *  reaches the plane as this op, the parent's at `MEANING_ARM` (N421).
 *
 *  IT ANSWERS THROUGH `planeAnswer`, so there is no way to read these rows
 *  without having decided what to do about a refusal. The op's NAME is a
 *  constant because `planeAnswer` also wants it, so the code says the name once. */
const MEANING_OP = "meaningrows";
const meaningRead = async (call, { q = "", rows, limit = 50, ids = null } = {}) =>
  planeAnswer(await call(MEANING_OP, { q, rows, limit }, ids ? { ids } : null), MEANING_OP);

/** WHAT EACH ROW ACTUALLY DOES AGAINST THE PLANE. One `case` per row that has
 *  work, and rows that have none say so by falling through — the table already
 *  says what every row is FOR, and duplicating that here would be a second
 *  description to age. */
async function performStep(call, state, runId, model = null, logSeq = null) {
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
      const contracts = [];
      for (const level of LEVELS) {
        const p = planeAnswer(await call("airunspawn", { run: runId, half: "search" }), "airunspawn");
        if (p.silent) return { silent: p.silent };
        /* D-276's CLASS, CLOSED-BY-CONSEQUENCE BEFORE AND NAMED NOW. A refused
           spawn used to fall through with `payload = null`, which `spawnContract`
           refuses as SPAWN_PAYLOAD_MISSING — so the run did stop, but it stopped
           saying *"the plane returned no search-half payload"* when what actually
           happened was that the plane REFUSED, for a reason it had named. A
           correct outcome reached by misreporting the cause is still a refusal
           this member re-worded. */
        if (p.refused) return { planeRefusal: p.refused, level };
        const payload = (p.result ?? {}).payload ?? null;

        /* FL-5's SPAWN CONTRACT. The payload is read key by key into a frozen
           brief for ONE level — never spread — so there is no field for a
           manifest to arrive in under any spelling, and two sub-sessions share
           no object with each other or with the parent.

           AND THE SECOND WITNESS IS NOW A REFUSAL RATHER THAN A FLAG, WHICH IS A
           CORRECTION FL-3's OWN SUITE COULD NOT HAVE CAUGHT. FL-3 computed
           `manifest_field_present` into a local that never reached the wire and
           asserted the fence by grepping a trace note that never carries the
           phrase — MEASURED at FL-5: with the plane mock's SEARCH payload made
           to carry a full bias block, FL-3's suite stayed 194/0 and its
           "no search-half spawn payload carried a bias field" arm PASSED. A
           mechanism believed on the strength of its existence rather than its
           behaviour is the defect this project meets most, so the flag is gone
           and `spawnContract` REFUSES the payload instead. */
        const made = spawnContract({ level, payload });
        if (!made.ok) return { contract: made, level };
        contracts.push(made.contract);
      }
      out.consume.subsessions = LEVELS.length;
      out.note = `${contracts.length} sub-session contract(s) composed, one per level, each read-only `
               + `(${SUBSESSION_OPS.join(", ")}) and with no field for the lens to arrive in`;
      out.state = { ...state, contracts };

      /* agent-harness R7 — THE SUB-SESSIONS RUN, when model turns do: one per level, each its own conversation under its own
         contract, and each hands back a REPORT that `collect` holds to R20. */
      if (model) {
        const ran = await runSubsessions(call, out.state, runId, model, logSeq, contracts);
        if (ran.silent || ran.model || ran.stopped) return ran;
        if (ran.dropped.length) out.dropped = ran.dropped;
        out.state = { ...out.state, reports: ran.reports,
                      reportsRefused: [...(out.state.reportsRefused || []), ...ran.refused] };
        out.note += `; ${ran.reports.length} sub-session(s) reported, ${ran.refused.length} returned no report`;
      }

      /* THE INTERNET LEVEL REQUESTS ACQUISITION AND DOES NOT PERFORM IT (§4
         group 1, PL-4). One request per internet target the judgement named, and
         each one spends a FETCH from the run's budget. */
      const fetches = (state.targets || []).filter((t) => t && t.level === "internet");
      /* NAMED, AND ALL OF THEM. This used to assign `out.refused` inside the
         loop, so two refused acquisition requests published ONE — the record
         holding fewer refusals than happened, which is the same class as
         D-276 pointing the other way. */
      const acqRefused = [];
      for (const t of fetches) {
        /* FL-12 — THE LOCATOR IS `address`, THE ONE FIELD THE PLANE READS (`captureRequest`:
           `String(args.address ?? "")`, then `isPublicHttpsLocator`). This sent `url`, which the plane
           never reads, so every request a run filed was refused `CAPTURE_REQUEST_NOT_PUBLIC` (C-28.2)
           naming "(none)" — measured by REC-168. The judgement's own field stays `url` (the model's
           vocabulary); the WIRE's is `address`. And the question a request is accountable to defaults
           to the run's target (FL-11's class, one call over): a request naming none is refused
           `CAPTURE_REQUEST_NOT_AN_INQUIRY`. */
        const r = planeAnswer(await call("capturerequest", null,
          { run: runId, target: t.target ?? state.target ?? null, address: t.url ?? null }), "capturerequest");
        if (r.silent) return { silent: r.silent };
        /* Already ANSWER-checked before D-276 — routed through `planeAnswer` so
           every refusal this member publishes carries the same three fields
           (code, C-number, the plane's own body) rather than two of them here
           and three of them at `suggest`. */
        if (r.refused) acqRefused.push(r.refused);
      }
      if (acqRefused.length) out.refused = acqRefused;
      if (fetches.length) out.consume.fetches = fetches.length;
      return out;
    }

    case "collect": {
      /* FL-5 / IS-9(a) — THE RETURN CONTRACT, ENFORCED AT THE ROW THAT COLLECTS.
         The four returns arrived as this row's judgement (the sub-sessions'
         reports when model turns run, the caller's on the stubbed path, as
         `judgement_source` states). Every one is held to
         `checkReport`: a REPORT with a citation, never documents.

         A REFUSED RETURN IS NOT DROPPED AND NEVER BECOMES AN ABSENCE. It is
         named, it is published, and its level is UNDETERMINED — because a
         contract violation that fell through to `LOOKED_ABSENT` would let a
         defect MANUFACTURE an empty-level claim, and §9's kind would then be
         written off a report the parent never accepted. */
      const { taken, refused } = takeReports(state.reports);

      /* AND THE PARENT RE-READS BY ADDRESS. §14b.1: *"the parent re-reads by
         address if it needs the bytes"* — a behaviour, not a promise, and the
         suite observes these reads arriving at the plane. It is the same one
         meaning reader `compose` uses: the sub-session hands back an ADDRESS and
         the parent resolves it itself, which is the whole trade the memory model
         is making. Bounded by `citedAddresses`, so a report cannot turn the
         parent's context into the reading it was supposed to replace. */
      const addresses = citedAddresses(taken);
      /* D-276: `reread` COUNTS READS THAT ANSWERED, never calls that were made.
         It used to climb once per address regardless of what came back, so a
         refused read was published as `citations_reread` — this member claiming
         to have gone back to the record when the record had said no. A count of
         attempts wearing the name of a count of reads is the same defect as the
         zero below, one field along. */
      let reread = 0;
      const rereadRefused = [];
      for (const address of addresses) {
        const got = await meaningRead(call, { rows: MEANING_ARM, limit: 1, ids: [address] });
        if (got.silent) return { silent: got.silent };
        if (got.refused) { rereadRefused.push(got.refused); continue; }
        reread += 1;
      }

      /* D-220 — AND THE RUN COUNTS WHAT IT HOLDS IN DOCUMENTS, ITS VERSIONS AS
         VERSIONS (§3, consumer (3)). `reread` above counts READS, one per cited
         string, so sixty captures of one calendar cited by their sixty bundles are
         sixty reads — true — and would be sixty documents if anything took that
         figure as coverage, which is the false-coverage hazard `STORE-AS-CACHE.md`
         names arriving at the document level. The document's identity is the
         RECORD's: `op=versionchain` answers every version at an address off the
         `captured_locators ⋈ register` join (PL-10), and `documentHoldings` groups
         by the `address_norm` it answers with. Never by title or text.

         A citation names a held BUNDLE or an ADDRESS, and the run does not guess
         which: it asks the plane for the bundle first (`op=search`, `id:` — the
         gated, one-compiler read), and a bundle it finds is resolved to the source
         address its own bytes name; a citation that names no held bundle is read
         as the address it is. Every read goes through `planeAnswer`, so a refusal
         makes that citation's document UNDETERMINED and is published, never a zero. */
      const resolved = [];
      for (const address of addresses) {
        const found = planeAnswer(await call("search",
          { q: `id:"${address.replace(/"/g, "")}"`, limit: 1, facets: "none" }), "search");
        if (found.silent) return { silent: found.silent };
        if (found.refused) { rereadRefused.push(found.refused); resolved.push({ citation: address, refused: found.refused }); continue; }
        const hit = (Array.isArray(found.result?.hits) ? found.result.hits : [])
          .find((h) => h && h.bundle_id === address) || null;
        if (hit && !(typeof hit.source_locator === "string" && hit.source_locator.trim())) {
          resolved.push({ citation: address, bundle: address, address: null, chain: null,
                          reason: "the cited record names no source address, so no version chain can hold it" });
          continue;
        }
        const target = hit ? hit.source_locator.trim() : address;
        const chain = planeAnswer(await call("versionchain", { address: target, limit: 1000 }), "versionchain");
        if (chain.silent) return { silent: chain.silent };
        if (chain.refused) { rereadRefused.push(chain.refused); resolved.push({ citation: address, refused: chain.refused }); continue; }
        resolved.push({ citation: address, bundle: hit ? address : null, address: target, chain: chain.result });
      }
      const holdings = documentHoldings(resolved);
      if (rereadRefused.length) out.refused = rereadRefused;

      out.note = `${taken.length} REPORT(s) taken, ${refused.length} REFUSED; ${reread} of `
               + `${addresses.length} citation(s) re-read BY ADDRESS`
               + (rereadRefused.length
                  ? `, and ${rereadRefused.length} read(s) could NOT be made — the plane refused `
                    + `'${String(rereadRefused[0].code ?? "?")}', so what they would have answered is UNREAD `
                    + "rather than empty"
                  : "")
               + `; ${holdingsNote(holdings)}`
               + `. No document was returned by a sub-session and none was loaded`;
      out.state = { ...state, reports: taken, rereads: (state.rereads || 0) + reread,
                    reportsRefused: [...(state.reportsRefused || []), ...refused], holdings };
      return out;
    }

    case "compose": {
      /* QUERY, NEVER LOAD (§14b.1). The run holds the inquiry, its versions and
         its working set; everything else it reaches by ASKING. This is PL-9's
         `op=meaningrows` — D-222 option C, the SAME query compiler read at
         meaning grain — CONSUMED and not rebuilt. There is no second reader in
         this Worker and there must not be: D-15's one compilation point is what
         makes the viewer gate a gate. */
      const read = await meaningRead(call, { q: state.q || "", rows: MEANING_ARM, limit: 50 });
      if (read.silent) return { silent: read.silent };

      /* §9's EMPTY-LEVEL KIND, ADDED BY THE TABLE. The model said what it
         observed at each level; `emptyLevelCandidates` decides that an observed
         absence is written down, and it is deterministic for the reason its own
         header gives — if emitting it were judged, the one run the instrument
         exists to catch is the run that would not emit it. */
      const empties = emptyLevelCandidates(state, state.target ?? null);
      const candidates = [...(state.candidates || []), ...empties];

      /* D-276 — THREE OUTCOMES, THREE SENTENCES, AND THE RUN NOTE IS RECORD.
         "the record was not asked", "the record answered and said nothing about
         its shape" and "the record holds N rows" are three different facts and
         only one of them may be written as a zero. What was here computed
         `Array.isArray(got.rows) ? got.rows.length : 0` off a body that had not
         been checked, so all three collapsed into the third — and a REFUSAL
         became the confident sentence `0 meaning-grain row(s) queried`. */
      let said;
      if (read.refused) {
        out.refused = read.refused;
        said = `the meaning layer was NOT READ — the plane refused `
             + `'${String(read.refused.code ?? "?")}'`
             + (read.refused.check ? ` (${read.refused.check})` : "")
             + `, so this run knows NOTHING about meaning-grain rows for this query and does not `
             + `report zero of them`;
      } else if (!Array.isArray(read.result?.rows)) {
        /* UNDETERMINED IS FIRST-CLASS AND IS STATED. This branch is the one that
           makes the note honest even if the refusal check above is ever weakened:
           an answer with no rows collection is NOT zero rows, and the old
           `Array.isArray(got.rows) ? got.rows.length : 0` said it was. */
        said = "how many meaning-grain row(s) the record holds for this query is UNDETERMINED — the "
             + "plane answered without a rows collection this member could read";
      } else {
        said = `${read.result.rows.length} meaning-grain row(s) queried at the '${MEANING_ARM}' grain`;
      }
      out.note = `${said}; no document `
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
      const held = planeAnswer(await call("basisversions", { id: state.target || "", limit: 50 }),
                               "basisversions");
      if (held.silent) return { silent: held.silent };
      const proposed = (state.candidates || []).length;
      /* D-276's CLASS, and this site is the one where it cost more than a
         sentence. A refused `op=basisversions` used to leave `names` EMPTY, so
         the note said every candidate had been *"compared against 0 on the
         record"* and every one *"survived"* — a comparison that never happened,
         written down as a comparison against an empty record. The run still goes
         on to submit, because PL-3's check 3 is the fence and this arithmetic
         was only ever the run saving itself a write path; what it may NOT do is
         say it compared. */
      if (held.refused) {
        out.refused = held.refused;
        out.note = `the record's own versions could NOT be read — the plane refused `
                 + `'${String(held.refused.code ?? "?")}'`
                 + (held.refused.check ? ` (${held.refused.check})` : "")
                 + `, so this run compared its ${proposed} candidate(s) against NOTHING and says so `
                 + `rather than reporting them all as new. PL-3's check 3 is still the fence`;
        out.state = { ...state, queue: [...(state.candidates || [])] };
        return out;
      }
      const body = held.result ?? {};
      const names = new Set((Array.isArray(body.versions) ? body.versions : [])
        .map((v) => String(v && v.name ? v.name : "")).filter(Boolean));
      /* FL-11: the read above is of the RUN's target, so it can only rule on candidates aimed THERE. A
         candidate naming another question was compared against nothing and says so — it survives to the
         plane, which bounds it — rather than being filtered against another question's versions. */
      const aimedHere = (c) => (c.target ?? state.target ?? null) === (state.target ?? null);
      const elsewhere = (state.candidates || []).filter((c) => c && !aimedHere(c)).length;
      const queue = (state.candidates || []).filter((c) => c && (!aimedHere(c) || !names.has(String(c.name ?? ""))));
      out.note = `${proposed} candidate(s) compared against ${names.size} on the record; `
               + `${queue.length} survived`
               + (elsewhere ? `; ${elsewhere} named a question other than the run's target and were NOT compared` : "");
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
      /* FL-11: a candidate that names no target lands on the RUN's (`runContextTarget`); one that names
         its own keeps it, and the plane bounds it (SUGGEST_OUTSIDE_RUN_CONTEXT, C-27.19) — this member
         does not pre-judge that refusal, it routes it to ADJUST like any other. */
      const res = await call("suggest", null,
        { ...candidate, target: candidate.target ?? state.target ?? null, run: runId });
      if (!res.reached) return { silent: res };
      const answer = res.body?.result ?? res.body ?? {};
      /* R24, R43 — D-276's class: a refusal nested in `result` states `ok: false`, with or without `wrote`. */
      if (res.status === 200 && res.body?.ok === true && answer.ok !== false && answer.wrote !== false) {
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

/** R50–R52 — WHAT EACH ROW OF `PLAN_FLOW` DOES AGAINST THE PLANE. `read` and `dedup` read; `submit` makes the one
 *  write mode `plan` has, `op=optionpropose`; `adjust` is F10 unchanged. No row spawns, requests a capture, suggests
 *  a version or fetches (R50, R53). */
async function performPlanStep(call, state, runId) {
  const out = { state, consume: {}, note: null };
  switch (state.step) {
    case "read": {
      /* R51 — UNDER THE RUN'S CREDENTIAL AND NOTHING ELSE. A refused or silent read is UNDETERMINED, carried into every
         proposal's `why`, never an absence and never the segment's end: the plan is proposed to on what could be read. */
      const reads = [], undetermined = [];
      const ask = async ({ op, query }) => {
        const got = planeAnswer(await call(op, query), op);
        const id = Object.values(query || {}).filter((v) => v != null && v !== "").join(" ") || null;
        if (got.silent) { undetermined.push({ op, id, code: null, why: "the plane did not answer" }); return null; }
        if (got.refused) { undetermined.push({ op, id, code: got.refused.code ?? null, check: got.refused.check ?? null }); return null; }
        reads.push({ op, query, answer: got.result });
        return got.result;
      };
      let planDoc = null, earlier = [];
      if (!state.planId) undetermined.push({ op: "plan", id: null, code: null, why: "the run names no plan" });
      else {
        const answered = await ask(PLAN_READS.plan(state.planId));
        planDoc = answered && typeof answered === "object" ? (answered.plan ?? answered) : null;
      }
      const project = planDoc && typeof planDoc.project === "string" && planDoc.project ? planDoc.project : null;
      if (project) {
        const plans = await ask(PLAN_READS.plans(project));
        /* The earlier plans of the SAME project only: another project's plan is never read, and the run's own plan
           is the one read above. */
        earlier = plans ? earlierPlans(plans, project, state.planId) : [];
      } else if (planDoc) undetermined.push({ op: "plans", id: null, code: null, why: "the plan names no project" });
      for (const r of planDoc ? planSubjectReads(planDoc) : [PLAN_READS.profile()]) {
        const answered = await ask(r);
        if (r.op !== "profiles" || !answered) continue;
        const view = answered.view && typeof answered.view === "object" ? answered.view : answered;
        for (const fact of PROFILE_FACTS)
          if (!(fact in view)) undetermined.push({ op: "profiles", id: fact, code: null,
                                                   why: "the plane's profile answer does not publish it" });
      }
      out.note = `${reads.length} read(s) answered under the run's credential, ${undetermined.length} UNDETERMINED `
               + "(refused, silent or not published) and carried into every proposal's why, never as an absence; "
               + `${earlier.length} earlier plan(s) of the same project`;
      out.state = { ...state, planDoc, earlier, reads, undetermined };
      return out;
    }

    case "compose": {
      out.note = `${(state.candidates || []).length} candidate proposal(s) composed, strongest first`;
      return out;
    }

    case "dedup": {
      /* R52 — BEFORE ANY WRITE, against the plan as the record holds it now: its options and proposals. A plan that
         cannot be read is compared against NOTHING and the note says so; the plane still refuses a duplicate. */
      const held = state.planId ? planeAnswer(await call("plan", { id: state.planId }), "plan") : null;
      const candidates = state.candidates || [];
      if (!held || held.silent || held.refused) {
        if (held?.refused) out.refused = held.refused;
        out.note = `the plan could NOT be read (${held?.refused ? `the plane refused '${String(held.refused.code ?? "?")}'`
                   : held?.silent ? "the plane was silent" : "the run names no plan"}), so ${candidates.length} candidate(s) `
                 + "were compared against NOTHING and say so rather than being reported new";
        out.state = { ...state, queue: [...candidates] };
        return out;
      }
      const doc = held.result && typeof held.result === "object" ? (held.result.plan ?? held.result) : {};
      const { queue, dropped } = planDedup(candidates, doc);
      out.note = `${candidates.length} candidate(s) compared against the plan's options and proposals; ${dropped.length} `
               + `already held, dropped before any write; ${queue.length} to propose, in order`;
      out.state = { ...state, queue };
      return out;
    }

    case "submit": {
      /* ONE PROPOSAL, OFF THE HEAD OF THE QUEUE, IN THE ORDER COMPOSED (R52): the plane stores the run's proposals in the
         order they arrive, which is the assistant's order of strength. The table stamps what could not be read into
         the `why` (R51); the run and the plan are the record's. */
      const queue = [...(state.queue || [])];
      const candidate = queue.shift();
      if (!candidate) return out;
      const body = { ...candidate, why: whyWithUndetermined(candidate.why, state.undetermined),
                     plan: state.planId, run: runId };
      const res = await call("optionpropose", null, body);
      if (!res.reached) return { silent: res };
      const answer = res.body?.result ?? res.body ?? {};
      if (res.status === 200 && res.body?.ok === true && answer.ok !== false) {
        out.submitted = true;
        out.proposed = true;
        out.note = `proposed '${String(candidate.summary ?? "").slice(0, 80)}'`;
        out.state = { ...state, queue, refusal: null, submission: candidate };
        return out;
      }
      if (answer.repeated === true) out.verbatim = true;
      out.refused = { at: "optionpropose", code: answer.code ?? answer.reason ?? null, check: answer.check ?? null,
                      repeated: answer.repeated === true, plane: answer };
      out.note = `refused '${String(answer.code ?? answer.reason ?? "?")}' — routing to ADJUST, never to a retry`;
      out.state = { ...state, queue, refusal: answer, submission: candidate };
      return out;
    }

    case "adjust": {
      /* R25 unchanged: resent only when changed, at the head of the queue, so it keeps its place. */
      const changed = adjustedFrom(state.refusedSubmission ?? null, state.submission ?? null);
      const queue = [...(state.queue || [])];
      if (changed) queue.unshift(state.submission);
      out.note = changed
        ? "the proposal was changed in answer to the refusal, and keeps its place"
        : "the refusal could not be answered by changing the proposal; it is dropped";
      out.state = { ...state, adjusted: changed, queue };
      return out;
    }

    default:
      return out;
  }
}

/** agent-harness R7 — THE SUB-SESSIONS. Each gets a fresh transcript (nothing shared with the parent or another level), its
 *  frozen contract, the contract's `scope` as its only plane tool, and `report` as its answer. Its look is logged
 *  at its level, and that entry's address is the report's `observed_at`. A sub-session that returns no report is
 *  named, never read as an absence. */
async function runSubsessions(call, state, runId, model, logSeq, contracts) {
  const reports = [], refused = [], dropped = [];
  for (const contract of contracts) {
    const got = await converse({
      reference: model.reference, runner: model.runner, mode: state.mode, meter: model.meter,
      /* R61: the contract's fields from the record (the run, its context, mode, skill) reach the sub-session only as
         `read_facts`' result (`subsessionOpening`); its system carries the pack and the table's own fields. */
      system: subsessionSystem(model.pack, contract),
      messages: subsessionOpening(contract),
      tools: subsessionTools(contract),
      finalTool: "report",
      onTool: async (name, input) => {
        if (!contract.scope.includes(name))
          return { content: `'${String(name)}' is not in this sub-session's scope (${contract.scope.join(", ")})`, error: true };
        const lim = Math.min(50, Math.max(1, Math.floor(Number(input.limit)) || 20));
        const r = await meaningRead(call, { q: String(input.q ?? ""), rows: String(input.rows ?? ""), limit: lim });
        if (r.silent) return { halt: { planeSilent: r.silent } };
        /* R61, R63: what the plane answers reaches the sub-session only as this tool's result, text only. */
        const told = toolContent(r.refused ? (r.refused.plane ?? { code: r.refused.code }) : r.result);
        dropped.push(...told.dropped.map((d) => ({ ...d, path: `${contract.level}: ${d.path}` })));
        return r.refused ? { content: told.content, error: true } : { content: told.content };
      },
    });
    model.spent(got, state.mode);
    if (got.planeSilent) return { silent: got.planeSilent };
    if (got.silent || got.refused) return { model: got };
    if (got.stopped) return { stopped: got.stopped };
    if (!got.answer) {
      refused.push({ level: contract.level, code: "SUBSESSION_NO_REPORT",
                     detail: "the sub-session ended without calling report; its level is UNDETERMINED, not empty" });
      continue;
    }
    const { observed_at: _ignored, ...said } = got.answer;
    const report = { ...said, level: contract.level };
    if (LOOKED_STATES.has(String(report.state))) {
      const seq = logSeq ? logSeq.next() : null;
      const entry = {
        level: contract.level, subject: `sub-session ${contract.level} -> report`,
        state: report.state === "PRESENT" ? "LOOKED_INDETERMINATE" : report.state,
        governed: report.governed === true, condition: typeof report.condition === "string" ? report.condition : null,
        terminal: false, bound: null,
        detail: String(typeof report.summary === "string" ? report.summary : "").slice(0, 500),
      };
      const tick = planeAnswer(await call("airuntick", null, { run: runId, log: [entry] }), "airuntick");
      if (tick.silent) return { silent: tick.silent };
      const t = tick.result ?? {};
      const bad = Array.isArray(t.refused) ? t.refused : [];
      if (tick.refused || bad.length) {
        for (const r of tick.refused ? [tick.refused] : bad)
          logSeq?.refused({ at: "airuntick.log", step: "fanout", to: "collect", level: contract.level,
                            code: r?.code ?? r?.reason ?? null, check: r?.check ?? null, plane: r?.plane ?? r ?? null });
      } else {
        logSeq?.landed();
        if (seq != null) report.observed_at = `log:${seq}`;
      }
    }
    reports.push(report);
  }
  return { reports, refused, dropped };
}

/* R56 (K1479, K1502, K1755) — THE SUGGESTIONS SWITCH THAT GOVERNS THE ACT, as the plane sends it beside the account
   (`suggestions`): the member's own (credentials R25), or, for an act the group's API key serves, the group key's
   (credentials R37; K1479: the switch belongs to whoever holds the account). Only when it is on may the pack's
   `suggestions` layer (skills R35) be loaded; off, as by default, the layer is not offered and a call naming it is refused, so DEC-27's
   clause in the layers that are loaded governs and no unprompted suggestion is offered. The pack and its version are
   the same for every member (skills R35); only what this member lets the model load differs. */
const SUGGESTIONS_LAYER = "suggestions";
function loadableLayers(pack, suggestionsOn) {
  return Object.keys(pack?.disclosed || {}).filter((k) => suggestionsOn === true || k !== SUGGESTIONS_LAYER);
}
function loadLayer(model, input) {
  const name = String(input?.name ?? "");
  if (!model.layers.includes(name))
    return { content: name === SUGGESTIONS_LAYER
      ? "the suggestions layer is not loaded: the suggestions switch that governs this act is off"
      : `no disclosed layer '${name}'`, error: true };
  return { content: model.pack.disclosed[name] };
}

/** A segment's or an ask's model half (R54, R58): the reference for the calls it serves (the account that serves the
 *  member's act, R33), the runner binding, the meter, and the usage of each conversation kept until it is reported
 *  (ai-runs R48). Nothing in it outlives the call that made it (R36). */
function modelHalf({ reference, runner, meter, suggestions }) {
  const pending = [];
  return {
    reference, runner, meter, suggestions: suggestions === true, pack: null, layers: [], messages: [],
    /* R26 (N588; K1621): one entry per conversation that reached the provider, `{mode, model, usage, calls}` (ai-runs
       R48's entry), `usage` and `calls` exactly as `agent-model` R6 answers them: `calls` the model calls that sum
       covers, so the plane counts each model call, never a conversation as one. A `calls` it did not state is passed
       as `null` (which the plane counts as one call), never invented here. */
    spent(got, mode) {
      if (got && got.usage) pending.push({ mode, model: MODEL_FOR_MODE[mode] ?? null, usage: got.usage,
                                           calls: got.calls === undefined ? null : got.calls });
    },
    drain() { return pending.splice(0, pending.length); },
  };
}

const modelSilent = (silent, runId) => refusal("MODEL_SILENT",
  "the model API could not be reached, so no judgement was made at this step and the segment stopped. The run is "
  + "resumable; nothing the table did before this step is lost.", 502,
  { run_id: runId, detail_from_model: silent?.detail ?? null });

const modelRefused = (refused, runId) => refusal("MODEL_REFUSED",
  "the model API refused the call, or the model declined, so no judgement was made at this step and the segment "
  + "stopped. The API's own error type and status are beside this, unchanged.", 502,
  { run_id: runId, model_status: refused?.status ?? null, model_error: refused?.type ?? null,
    model_message: refused?.message ?? null });

const planeSilent = (asked) => refusal("PLANE_SILENT",
  "the plane could not be reached, so this member knows nothing about the record and says so. A failure "
  + "to answer is not an answer, and reporting one as the other would make this member's own fault read "
  + "as a fact about the record.", 502, { detail_from_binding: asked.detail });

const planeRefused = (runId, store, asked) =>
  json({ ok: false, reason: "PLANE_REFUSED", worker: "agent-worker", run_id: runId, store,
         detail: "the plane refused this member's call under the credential it was handed. Its refusal is "
               + "passed through exactly as the plane worded it.",
         plane_status: asked.status, plane: asked.body }, 403);

/** R6, R32, R57 (K1502, K1503, K1755) — the account a call carries: `{account, cascade}` or `{refusal}`. `account` is
 *  the account that serves the act of the member who started the run (or asked; a standing question's author), as
 *  `credentials.accountFor` answers it for that act (its R35), with that member and the switch that governs it:
 *  `{kind, level, secret, member, suggestions?}`, `level` `member` (the member's own reference) or `group` (the group's
 *  API key, which serves that member's act and is still that member's act). There is no project level (R32): a body
 *  still carrying the old cascade's `claude_accounts` is refused naming that field, and a member whom no account
 *  serves has no assistant, refused by name before any plane call (D-260 as K1503 reads it). The secret is read here
 *  for the call it serves and goes no further than `agent-model` (R36). */
async function accountOf(body) {
  if (body.claude_accounts !== undefined)
    return { refusal: refusal("BAD_ACCOUNT",
      "claude_accounts is the retired three-level cascade's field: there is no project or instance Claude account. "
      + "A call carries the one account that serves the member's act, as account.", 400, { field: "claude_accounts" }) };
  const a = body.account;
  if (a === undefined || a === null)
    return { refusal: refusal("NO_ACCOUNT",
      "this call carries no Claude account for the act of the member who started it: neither the member's own "
      + "reference nor the group's API key serves that act (K1502, K1755), so the capability is UNAVAILABLE and "
      + "nothing was done.",
      409, { capability: "unavailable" }) };
  if (typeof a !== "object" || Array.isArray(a) || !ACCOUNT_KINDS.includes(a.kind)
      || !CASCADE_ORDER.includes(a.level) || !LEVEL_KINDS[a.level].includes(a.kind)
      || typeof a.member !== "string" || !a.member)
    return { refusal: refusal("BAD_ACCOUNT",
      `account is the account that serves the member's act: {kind, level, secret, member}, kind one of `
      + `${ACCOUNT_KINDS.join(", ")}, level one of ${CASCADE_ORDER.join(", ")} (the group's account an API key only), `
      + "and member the member whose act it serves. What arrived is not one, and this member judges only what it is "
      + "handed.",
      400, { field: "account" }) };
  const cascade = await resolveClaudeCascade(a);
  if (!cascade.available)
    return { refusal: refusal(CASCADE_NO_ACCOUNT, cascade.detail, 409,
      { capability: "unavailable", levels: cascade.levels }) };
  return { account: a, cascade };
}

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

  if (typeof body.store !== "string")
    return refusal("BAD_STORE",
      "a run happens inside one namespace and this member guesses none: the caller must say which. "
      + "A default namespace here would let a run touch the real record while its caller believed it "
      + "was working in a scratch one.", 400);
  /* D-462: a NAMED namespace that is not exactly one of NAMESPACES — `biosmoke`, `Scratch`, an empty string — is
     refused by the plane's own code, with the plane's `asked`/`namespaces` beside it, and nothing was called. */
  if (!NAMESPACES.includes(store))
    return refusal("NAMESPACE_UNKNOWN",
      "a run names the namespace it works in, and no namespace by that name exists on any instance this member "
      + "can be bound to, so nothing was read or changed. There are two: the record itself and a scratch area kept "
      + "apart for testing, and the name must match one of them exactly; they are listed beside this message.", 400,
      { asked: store.slice(0, 80), namespaces: [...NAMESPACES] });

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

  /* R6, R32, R57 (K1502, K1503) — THE MEMBER'S OWN ACCOUNT, JUDGED BEFORE ANY PLANE CALL IS SPENT ON THIS RUN. */
  const acct = await accountOf(body);
  if (acct.refusal) return acct.refusal;
  const { account, cascade } = acct;

  /* R7: a positive number, else 120 — `Number(x) || 120` let a negative setting become the bound. */
  const bound = Number(env.MAX_TURNS_PER_SEGMENT) > 0 ? Number(env.MAX_TURNS_PER_SEGMENT) : DEFAULT_MAX_TURNS_PER_SEGMENT;
  const requested = body.turns == null ? bound : Number(body.turns);
  if (!Number.isFinite(requested) || requested < 1)
    return refusal("BAD_TURNS", "turns must be a positive number of model turns for this segment.", 400);
  /* REFUSED rather than silently clamped. A caller that asked for 400 turns and
     got 120 without being told believes it saw a whole run; the same reasoning
     that makes the plane's read bounds refuse rather than truncate. */
  if (requested > bound)
    return refusal("SEGMENT_OVER_BOUND",
      `a segment is bounded at ${bound} model turns and ${requested} were asked for. The bound is not a `
      + `policy choice: it keeps the segment clear of the isolate's CPU ceiling, measured (M-168), which a `
      + `longer segment would meet. Split the run across segments — resuming is what segments are for.`,
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
   * Everything below is `agent-harness`' decision and this function's plumbing.
   * The split is deliberate and it is the item: the TABLE is pure and a suite
   * walks it with no network at all, and this driver is the part that turns a
   * row into a plane call. A driver that decided anything would be a second
   * control flow nobody could exhaust. */
  /* R58 — MODEL TURNS RUN, through `agent-model`, when the account that serves the member's act arrived (it always has,
     past R6) and the caller supplied no judgements; `judgements` in the body is the stubbed path, in which no turn is taken. The
     reference is handed to `agent-model` for the calls it serves and kept by nothing here (R33, R36). A subscription's
     turns reach `agent-runner` through the Container Durable Object binding (R35), passed as it is bound. */
  const bytesBound = Number(env.MAX_SEGMENT_BYTES) > 0 ? Number(env.MAX_SEGMENT_BYTES) : DEFAULT_MAX_SEGMENT_BYTES;
  const meter = segmentMeter({ turnsBound: requested, bytesBound });
  const modelMode = !Array.isArray(body.judgements);
  const model = modelMode
    ? modelHalf({ reference: (await cascadeToken(account)).reference, runner: env.RUNNER ?? null, meter,
                  suggestions: account.suggestions })
    : null;

  const drive = await driveHarness(env, {
    runId, store, credential, account, model,
    judgements: Array.isArray(body.judgements) ? body.judgements : [],
    maxSteps: Number(body.max_steps) > 0 ? Math.min(Number(body.max_steps), MAX_STEPS) : MAX_STEPS,
  });
  if (drive.refusal) return drive.refusal;

  return json({
    ok: true,
    run_id: runId,
    store,
    /* WHAT WAS ACTUALLY DONE, NAMED (R28, R58). `stage: "harness"` says the deterministic table ran; `turns_run` is the
       number of model turns this segment actually ran through `agent-model` (0 when none ran), and `judgement_source`
       says whose judgements the table applied: `model` (the turns') or `body` (the caller's, the stubbed path). The
       two never mix in one segment: supplied judgements turn the model half off for it. */
    stage: "harness",
    turns_run: meter.turns,
    judgement_source: modelMode ? "model" : "body",
    judgement_note: modelMode
      ? `the control-flow table ran and the judgements inside its steps were made by model turns run through `
        + `agent-model (${meter.turns}), under the Claude account that serves the member's act `
        + `(${cascade.level === "group" ? "the group's API key" : "the member's own"}) and the skill pack the run names; `
        + "the sub-sessions ran one per level and returned REPORTS"
      : "the control-flow table ran and its judgements arrived from the caller (the body), so no model turn was taken "
        + "(turns_run: 0). Stated rather than presented as a model run.",
    /* R29 — WHICH ACCOUNT, secret-free by construction: its kind, its level (the member's own, or the group's API key,
       K1755) and the member whose act it serves. A call with none never reaches here (R6 refused it by name before
       any step). */
    claude_account: { available: true, kind: cascade.kind, level: cascade.level, member: cascade.member },
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
    segment: { turns_requested: requested, turns_bound: bound, bound_source: BOUND_SOURCE,
               turns_run: meter.turns, bytes_sent: meter.bytes, bytes_bound: bytesBound,
               bytes_source: SEGMENT_BYTES_SOURCE, stopped: drive.segmentStopped ?? null },

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
       cannot be told from one acting for nobody. */
    principal: null,
    principal_source: "UNPUBLISHED — no read op an ai credential may call states its own principal (D-199 (4))",

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
  return json({ ok: true, name: "agent-worker", version: env.VERSION || "0.0.0", model_turns: MODEL_TURNS });
}

/* R54, R59 — what `/ask` (ask.mjs) and `/draft` (draft.mjs) use of this shell: one route to the plane, one refusal
   helper, one account judgement. */
const ASK_DEPS = { refusal, json, askPlane, planeAnswer, publishedPack, accountOf, cascadeToken, modelHalf,
                   loadableLayers, loadLayer, converse, segmentMeter, NAMESPACES, DEFAULT_MAX_SEGMENT_BYTES };

/* R58 — ONE TRUTH FOR MODEL TURNS, the sentence this member states about itself on `GET /version`, and the same one its
   header and its `/run` answer state. */
const MODEL_TURNS = "run through agent-model exactly when the Claude account that serves the member's act (the "
  + "member's own reference, or the group's API key) arrives with the call and the run's, ask's or draft's mode has "
  + "turns to run; a segment whose caller supplies the judgements runs none";

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/+/, "");
    if (req.method === "GET" && path === "version") return handleVersion(env);
    if (req.method === "POST" && (path === "run" || path === "")) return handleRun(req, env);
    if (req.method === "POST" && path === "ask") return handleAsk(req, env, ASK_DEPS);
    if (req.method === "POST" && path === "draft") return handleDraft(req, env, ASK_DEPS);
    return refusal("UNKNOWN", "POST /run, POST /ask, POST /draft or GET /version only.", 404);
  },
};
