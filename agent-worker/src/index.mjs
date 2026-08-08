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
 * WHAT IT DOES AT FL-2, STATED HONESTLY BECAUSE HALF-BUILT IS A REAL STATE.
 * `/run` performs the round trip: it takes the run identity, the namespace and
 * the `ai` credential the plane hands it, asks the plane who that credential is,
 * and answers with the principal the PLANE stated plus the segment bound this
 * member will honour. **It runs no model turns and it says so on the wire**
 * (`turns_run: 0`, `stage: "round-trip"`) rather than returning an empty success
 * that a caller cannot tell from a run that found nothing. FL-3 fills the loop in;
 * FL-6 resolves the model-account cascade behind it. Nothing here is a stub that
 * pretends to be finished.
 *
 * WHAT IT MUST NOT DO (fleet rules 2/3, inherited from I6 and asserted in the
 * suite — behaviourally AND by a source scan, as I6's are for `pdf-worker`):
 *
 *   - WRITE ANYTHING, BY ANY ROUTE. It holds no STORE (Durable Object) binding,
 *     no R2 binding at all — not CAPTURES and above all not PUBLISHED — and it
 *     calls no mutating op. It returns derived output and the plane decides what
 *     it means; a hop a component can hand us is a hop a component can invent
 *     (D-112).
 *   - HOLD A CREDENTIAL. It has no token of its own and no secret binding. The
 *     `ai` credential arrives PER CALL and is not retained, so this member cannot
 *     act except while somebody is asking it to.
 *   - JUDGE ITS OWN SCOPE. D-199 (2): what an agent may reach is a row a member
 *     AUTHORED, read from the record at the plane's gate by `aiTaskScope`. A copy
 *     of that judgement here would be a second enforcement point that drifts from
 *     the first, and a scope compiled into a Worker is precisely the settings row
 *     D-199 refused. There is no op allow-list, no scope and no class in this
 *     file. The ops it may NAME are pinned as an exact set by its suite — floor
 *     and ceiling both — so a call this member gains is a call somebody decided
 *     to give it.
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
async function askPlane(env, op, credential, store) {
  const url = `${PLANE_ORIGIN}/?op=${op}&store=${encodeURIComponent(store)}&token=${encodeURIComponent(credential)}`;
  let res;
  try {
    res = await env.PLANE.fetch(url);
  } catch (e) {
    return { reached: false, detail: String((e && e.message) || e).slice(0, 200) };
  }
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  if (body == null) return { reached: false, detail: `the plane answered ${res.status} with a body this member could not read as JSON` };
  return { reached: true, status: res.status, body };
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

  return json({
    ok: true,
    run_id: runId,
    store,
    /* WHAT WAS ACTUALLY DONE, NAMED. FL-2 ships the envelope and FL-3 fills the
       loop; an answer that did not say so would be indistinguishable from a run
       that executed and found nothing, and those are different claims. */
    stage: "round-trip",
    turns_run: 0,
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
