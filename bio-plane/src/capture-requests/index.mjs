/* capture-requests — the AI's capture requests: the door, the drain, the reads (requirements:
 * `build/requirements/capture-requests.md`; K58, K102, K103, K109, N35, N39, N63). Extracted from `legacy-store` in
 * T7 (T6-8) per `build/extraction/capture-requests.md`.
 *
 * THE SPINE, AND IT IS THE MODULE: THE AI DOES NOT CAPTURE. IT REQUESTS, AND THE DAEMON CAPTURES WITH PROVENANCE
 * PRESERVED. Bob, 2026-08-05: *"capturing a document (with provenance preserved) is something the daemon does
 * (sometimes at the suggestion of an AI)."* So the requester holds no capture write at all and never touches the
 * provenance chain, which is the foundation the whole trust model rests on. `captureRequest` writes a ROW and cannot
 * fetch; `drain` fetches and cannot be reached by a caller except as the daemon's verb.
 *
 * THE FENCE IS IN PROCESS (K58). The drain fires `capture`'s trusted in-process arm with the row's own address,
 * purpose, agent and render flag, which is exactly what the conduct check judged; nothing outside this module's drain
 * can reach that arm, and `op=acquire` refuses `via: "capture-request"` from any caller (C-28.13, acquisition R1).
 *
 * DEC-47's CONDUCT IS ENFORCED ONCE, AT THE DRAIN. The authorisation question is CLOSED — the inquiry and the session
 * launch ARE the authorisation, and a member asked to approve forty URLs *"has not done the research and cannot judge
 * them"*. What remains is behaviour: a UA with a contact URL, a purpose token, and rate. All three fire in
 * `is-capture-conduct` and nowhere else. AND ROBOTS.TXT IS NOT ONE OF THEM (BOB-3, RULED 2026-08-07): there is no
 * robots rule here and the drain fetches no `robots.txt`.
 *
 * ATTRIBUTION STATES BOTH PRINCIPALS (DEC-27(b), DEC-55.4). The act is the DAEMON'S, performed AT THE SESSION'S
 * REQUEST, and the record names the plane-credential principal AND the Claude-account principal — never a token
 * value, and never a person's name in the actor slot. A record naming one of the two is the defect, so the composer
 * refuses and the capture is not made.
 *
 * Reached through `captureRequestsOf(ctx, deps)` (K61); every module it uses is reached through its own factory on
 * the same storage, and a test may pass its own. */
import { isPublicHttpsLocator } from "../record-grammar/locator.mjs";
import { MACHINE_AUTHOR_PREFIX } from "../record-grammar/actors.mjs";
import { normalizeType } from "../record-grammar/types.mjs";
import { createSha256 } from "../record-grammar/sha256.mjs";
import { RENDER_CAPTURE_CHECKS, civicosUserAgent } from "../acquisition/index.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { viewerPredicate, listenerRefusal, MODULE_ORDER } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { governorOf } from "../host-governor/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { credentialsOf } from "../capture-sources/credentials.mjs";
import { observationLogOf } from "../observation-log/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { runPrincipalGate } from "../run-rules/index.mjs";
import { migrateCaptureRequests } from "./schema.mjs";
import { CAPTURE_REQUEST_CHECKS, CAPTURE_SOURCE_CHECKS, CAPTURE_PURPOSES, CAPTURE_UA_MODES, userAgentIsLegible }
  from "./checks.mjs";

export { CAPTURE_REQUEST_CHECKS, CAPTURE_SOURCE_CHECKS, CAPTURE_PURPOSES, CAPTURE_UA_MODES, userAgentIsLegible };

export const CAPTURE_REQUESTS_MODULE = "capture-requests";

/** R12: how many requests one drain tick acts on, and how many per host. The per-host figure is ONE and it is DEC-47's
 *  rate rule in its smallest honest form: *"a stranger's server has no relationship with this instance"*, so a tick
 *  does not burst one host even when the token bucket would admit it. */
export const CAPTURE_REQUEST_TICK_BATCH = 10;
export const CAPTURE_REQUEST_PER_HOST_PER_TICK = 1;
/** R6: how long a request stays interesting. SCRATCH, on `capture_sessions`' shape: a work list with an expiry. */
export const CAPTURE_REQUEST_TTL_MS = 86_400_000;
/** R37: the cadence between drain ticks while work waits. */
export const CAPTURE_REQUEST_TICK_MS = 60_000;
/** R23, R26: a read's default bound and its ceiling. */
export const CAPTURE_REQUEST_READ_LIMIT = 200;
export const CAPTURE_REQUEST_READ_MAX = 1000;
/** R29: a run's outstanding requests and its completions, each bounded. */
export const CAPTURE_REQUEST_WAIT_BATCH = 25;
/** R12 (N224): with the scheduler's rank, a tick reads this many times its batch of `requested` rows to rank. */
export const CAPTURE_REQUEST_RANK_READ = 10;
/** R38 (N141): the slug of the information bundle a requested capture is promoted as (`INFO-<year>-<n>-requested`). */
export const CAPTURE_REQUEST_BUNDLE_SLUG = "requested";
/** R5: the request's states; the terminal ones end a request. */
export const CAPTURE_REQUEST_STATES = Object.freeze(["requested", "draining", "captured", "refused", "expired"]);
export const CAPTURE_REQUEST_TERMINAL = Object.freeze(["captured", "refused", "expired"]);
/** R40: why a source turned a request away. */
export const SOURCE_REASONS = Object.freeze(["login", "paywall", "user-agent", "other"]);
/** R35: the figure this module reports to record-core's counts (its R63). */
export const CAPTURE_REQUESTS_COUNT_KEYS = Object.freeze(["captureRequests"]);
/** R18: the two render results `capture` decides after the page was fetched, by their C-83 check (C-83.6, C-83.7). */
const RENDER_NOT_A_PAGE_CHECK = "C-83.6";
const RENDER_FAILED_CHECK = "C-83.7";
/** R4: the fields that would make a request a capture. */
export const CAPTURE_FIELDS = Object.freeze(["capture_sha", "sha256", "bytes", "content", "provenance_chain", "via", "retrieved"]);

/** R40: the source's HTTP answer as its reason, and whether it ends the request. A login is asked by 401 (and a proxy's
 *  407); a payment by 402; an agent the source refuses by 403 and 406 (D-94 measured a 403 as the answer to an agent a
 *  source will not admit); 451 and every other refusal are `other`. The five named statuses are TERMINAL (`refused`,
 *  which a member can retry with what the source asked for, R42); every other answer from the source (a 404, a 429, a
 *  5xx) holds the row, reason `other`, until it expires. */
export function sourceReasonOf(status) {
  const s = Number(status);
  if (s === 401 || s === 407) return { reason: "login", terminal: true };
  if (s === 402) return { reason: "paywall", terminal: true };
  if (s === 403 || s === 406) return { reason: "user-agent", terminal: true };
  if (s === 451) return { reason: "other", terminal: true };
  return { reason: "other", terminal: false };
}

/** R25: THE REASON A RENDER WAS HELD, in DEC-49 words, read off the family that MINTED the code: C-83 for a render
 *  `capture` could not do, C-28 for the drain's own holds, C-108 for the source's refusal. A code in none, or no code,
 *  answers `check` and `translation` null, stated as such rather than given a sentence nobody minted. */
export function renderHoldReason(code) {
  const own = (fam) => (code && Object.prototype.hasOwnProperty.call(fam, code) ? fam[code] : null);
  const family = own(RENDER_CAPTURE_CHECKS) ? "C-83" : own(CAPTURE_REQUEST_CHECKS) ? "C-28"
    : own(CAPTURE_SOURCE_CHECKS) ? "C-108" : null;
  const row = own(RENDER_CAPTURE_CHECKS) || own(CAPTURE_REQUEST_CHECKS) || own(CAPTURE_SOURCE_CHECKS);
  return { code: code ?? null, family, check: row ? row.check : null, translation: row ? row.translation : null };
}

/** R10: THE ATTRIBUTION, composed in ONE place, refusing rather than half-stating.
 *
 *  DEC-27(b): *"the assistant captured this, at Anna's request"* — the record states BOTH. Here that is three names and
 *  not two: the ACTOR is the daemon and is MACHINE-SHAPED (REC-2's `token:<class>`, never a person's name), and behind
 *  it stand the run's two principals, which are different principals and not two spellings of one.
 *
 *  TRIMMED, and that is not tidiness: a principal of whitespace reads as present while naming nobody, the worse
 *  direction of the two. THE ACT IS VISIBLY THE MACHINE'S BY CONSTRUCTION, and there is deliberately NO REFUSAL FOR
 *  IT: `actor` is `MACHINE_AUTHOR_PREFIX` concatenated with a literal, so it cannot be a person's name, and a branch
 *  refusing one would be a gate for a condition this code cannot produce (C-28.12 stays unallocated). */
export function captureRequestAttribution(row) {
  const actor = `${MACHINE_AUTHOR_PREFIX}daemon`;
  const plane = String((row && row.principal_plane) || "").trim();
  const claude = String((row && row.principal_claude) || "").trim();
  if (!row || !plane || !claude)
    return { ok: false, code: "CAPTURE_ATTRIBUTION_ONE_PRINCIPAL", plane: plane || null, claude: claude || null };
  return {
    ok: true, actor, machine_attributed: true,
    at_the_request_of: { run: row.run, inquiry: row.target },
    principals: { plane, claude },
    /* The sentence a surface renders, composed from the fields above so it cannot say something they do not. */
    statement: `the daemon captured this, at the investigative session's request `
             + `(run ${row.run}), under ${plane}, paid by ${claude}`,
  };
}

/** R11, R37: whether the instance's unattended capture is configured: a daemon or administrator credential is bound
 *  (runtime-limits R26's `bound`: presence only). With the arm in process (K58) the drain no longer needs `env.SELF`
 *  and spends no credential; the bound credential is the unattended act's standing. */
export function unattendedBound(env) {
  return !!(env && ((typeof env.DAEMON_TOKEN === "string" && env.DAEMON_TOKEN !== "")
                 || (typeof env.ADMIN_TOKEN === "string" && env.ADMIN_TOKEN !== "")));
}

/** A body field as text: a string as it is, a number or boolean spelled, anything else empty — so no value a caller
 *  sends can make the door throw (R7). */
const text = (v) => (typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : "");
const shown = (v) => { try { return String(JSON.stringify(v) ?? typeof v).slice(0, 40); } catch { return typeof v; } };
const clamp = (limit, dflt, max) => {
  const n = Math.floor(Number(limit));
  return Math.max(1, Math.min(Number.isFinite(n) && n > 0 ? n : dflt, max));
};
/** An instant as milliseconds: a finite number, or a parseable date string; else null. */
const instantMs = (v) => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim()) { const t = Date.parse(v); return Number.isFinite(t) ? t : null; }
  return null;
};
const randomHex = (bytes) => [...crypto.getRandomValues(new Uint8Array(bytes))]
  .map((b) => b.toString(16).padStart(2, "0")).join("");

export class CaptureRequests {
  #sql; #deps; #draining = false;
  #filed = [];     // R44: {module, fn, seq}
  #sweepScope = null;   // R45: {module, fn}, link-sweep's scope check

  /** `deps`: `record`, `observations`, `governor`, `capture`, `credentials` (each module's instance on this storage),
   *  `runs` (ai-runs' run sight, R28 of ai-runs: `runFor(run, viewer)` answering the run's `status`,
   *  `principal_plane` and `principal_claude`, or null), `env`, `now()` (milliseconds; a test may inject its clock),
   *  `storeName`, `configured()` (R11; `unattendedBound(env)` by default), `promotion` (R38), `order` (R44: the
   *  modules' total order, membership's `MODULE_ORDER` unless a test passes its own), `inquiry` (R14: its R44
   *  `memberUserAgent(id)`). */
  constructor(storage, deps = {}) {
    this.#sql = storage.sql;
    this.#deps = deps;
  }

  migrate() { migrateCaptureRequests(this.#sql); }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #nowMs() { const n = this.#deps.now ? Number(this.#deps.now()) : Date.now(); return Number.isFinite(n) ? n : Date.now(); }
  #env() { return this.#deps.env || {}; }
  #storeName() {
    const n = typeof this.#deps.storeName === "function" ? this.#deps.storeName() : this.#deps.storeName;
    return typeof n === "string" && n ? n : "bio";
  }
  #observe(entry, at) { return this.#deps.observations.observe(entry, at, 0); }
  #rank(m) { const o = Array.isArray(this.#deps.order) ? this.#deps.order : MODULE_ORDER; const i = o.indexOf(m); return i === -1 ? Infinity : i; }

  /* ==================================================================== *
   * R1–R9 — THE DOOR. It writes a row. It fetches NOTHING.
   *
   * Read this function looking for an outbound call and there is none, which is the module's whole claim expressed as
   * an absence: R9's test drives the door with a capture, a governor and credentials that fail the test when touched.
   * ==================================================================== */
  captureRequest(a = {}, { viewer = null, caller = null, at = null } = {}) {
    const args = a && typeof a === "object" ? a : {};
    const refusal = (code, detail, extra) => {
      const row = CAPTURE_REQUEST_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
    };

    /* DEC-49 REGION is-capture-request
     *
     * THE SPAN `CAPTURE_REQUEST_CHECKS`' door rows name (REC-71). A REGION and not the whole function, so a refusal
     * that arrives here later is not conscripted into this family by a `where` that claims too much. Every code is a
     * STRING LITERAL at its site, which is what makes arm C of the DEC-49 guard able to COMPARE them. */
    /* R1, REC-168 (INVESTIGATIVE-SESSION.md §11 item 5): A REQUEST THAT NAMES A RUN IS A PRODUCTION OF THAT RUN, so it
       names a RUNNING run whose PRINCIPAL is the caller. REC-165's three questions, in order: (a) SIGHT — a run whose
       context this viewer cannot see answers exactly as a never-minted id does, byte for byte but for the id; (b)
       POSITION — REC-152's `runPrincipalGate`, the caller being the control plane's `principal` stamp, never a field
       sent, its refusal relayed field by field; (c) STATUS — the run is running. */
    const run = text(args.run).trim();
    const runRow = run ? this.#deps.runs.runFor(run, viewer) : null;
    if (!runRow)
      return refusal("CAPTURE_REQUEST_NO_RUN",
        run ? `no run named '${run.slice(0, 60)}' is running in this store. DEC-47 makes the SESSION `
              + `LAUNCH the authorisation for reaching a public source, so a request that cannot name a `
              + `live session is a fetch nothing authorised.`
            : "pass run=<the run asking>: the inquiry and the session launch ARE the authorisation "
              + "(DEC-47), and a request naming no session names no authorisation.",
        { run: run || null });
    const notPrincipal = runPrincipalGate({ caller, principal: runRow.principal_plane,
                                            act: "requesting a capture under a run" });
    /* RELAYED FIELD BY FIELD AND NEVER SPREAD (REC-165's relay: a spread is a return whose VERDICT the DEC-49 guard
       cannot read). The code, check and translation are the gate's own (C-22.12's literal stays there). */
    if (notPrincipal)
      return { ok: false, reason: notPrincipal.code, code: notPrincipal.code, check: notPrincipal.check,
               translation: notPrincipal.translation, detail: notPrincipal.detail, run,
               note: "a capture request names a run its caller holds. Nothing was requested or written" };
    if (runRow.status !== "running")
      return refusal("CAPTURE_REQUEST_NO_RUN",
        `no run named '${run.slice(0, 60)}' is running in this store. DEC-47 makes the SESSION `
        + `LAUNCH the authorisation for reaching a public source, so a request that cannot name a `
        + `live session is a fetch nothing authorised.`,
        { run });

    /* R2: a public locator with a host this module can read; the host is derived here, lower-cased, and stored, so
       the drain's rate rule reads one column instead of re-parsing a locator inside the enforcement point. */
    const address = text(args.address).trim();
    if (!isPublicHttpsLocator(address))
      return refusal("CAPTURE_REQUEST_NOT_PUBLIC",
        `'${address.slice(0, 80) || "(none)"}' is not a public https locator. DEC-47 scopes what a `
        + `session may reach to "areas that anybody can go through", and this address is not one on `
        + `its face.`, { address: address || null });
    let host = null;
    try { host = new URL(address).host.toLowerCase(); } catch { host = null; }
    if (!host)
      return refusal("CAPTURE_REQUEST_NOT_PUBLIC",
        "this address has no host this plane can read, and the per-host pacing DEC-47 requires is "
        + "computed from one.", { address });

    /* R3: the question the request is accountable to, readable by this viewer; an unseen and an absent one alike. */
    const target = text(args.target).trim();
    if (!this.#inquiryInSight(target, viewer))
      return refusal("CAPTURE_REQUEST_NOT_AN_INQUIRY",
        `${target.slice(0, 60) || "(none)"} is not a question readable here. A requested capture is `
        + `accountable to the question it was asked under, and a fetch belonging to nothing is a fetch `
        + `nobody can account for afterwards.`, { target: target || null });

    /* R3, PL-15 / D-213 — THE LEAD, OPTIONAL by construction. When present it must be a question this caller can
       read, exactly as `target` must (a lead under an unseen bundle would let this door probe for a project), and it
       may not be the target: a "lead" pointing back at the question already being worked is ordinary evidence
       wearing the notification's clothes. Refused rather than normalised to NULL. */
    const lead = text(args.lead_inquiry ?? args.lead).trim();
    if (lead) {
      if (!this.#inquiryInSight(lead, viewer))
        return refusal("CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY",
          `${lead.slice(0, 60)} is not a question readable here. A lead says which OTHER question this `
          + `evidence bears on, so it names a question or it names nothing — a document, a project or a `
          + `record id nothing answers to would give the notification a home that cannot hold it.`,
          { lead_inquiry: lead });
      if (lead === target)
        return refusal("CAPTURE_REQUEST_LEAD_IS_THE_TARGET",
          `this request names ${lead.slice(0, 60)} as both the question it was made under and the `
          + `question the evidence bears on. That is ordinary evidence for this question, which needs `
          + `no lead: a lead exists to give evidence for ANOTHER question a home (D-213), and one `
          + `pointing back here would file a notification about this question saying evidence for a `
          + `different one was found.`, { lead_inquiry: lead, target });
    }

    /* R4, THE SPINE AT THE DOOR. A request that arrives carrying bytes, a digest or a provenance hop is a caller
       trying to be the fetcher. Refused BY NAME rather than by dropping the fields. */
    const brought = CAPTURE_FIELDS.filter((k) => args[k] !== undefined && args[k] !== null && args[k] !== "");
    if (brought.length)
      return refusal("CAPTURE_REQUEST_CARRIES_A_CAPTURE",
        `this request carries ${brought.join(", ")}, and a request carries none of them. The AI does `
        + `not capture: it REQUESTS, and the daemon captures with provenance preserved (DEC-47's `
        + `structural gate, DEC-60).`, { fields: brought });

    /* R5, D-491 / IC-276 — THE RENDER FLAG, READ STRICTLY BECAUSE READING IT LOOSELY IS THE DEFECT. Absent, null and
       `false` are the document as the site serves it; `true` the page as a visitor saw it; ANY OTHER VALUE IS
       REFUSED BY NAME (C-83.1's argument at this door: a `render: "yes"` normalised to 0 files the served shell). */
    const renderRaw = args.render ?? null;
    if (renderRaw !== null && renderRaw !== false && renderRaw !== true)
      return refusal("CAPTURE_REQUEST_RENDER_MALFORMED",
        `render=${shown(renderRaw)} is not a value this door reads. Send `
        + `render: true for the page as a visitor saw it, or nothing for the document as the site `
        + `serves it.`, { render: null });
    const render = renderRaw === true ? 1 : 0;

    /* END DEC-49 REGION is-capture-request */

    /* R8: the PLANE principal is the caller's stamp (REC-168), the CLAUDE principal the run's: it is the account the
       run's budget is paid from, which the request does not choose. Neither is taken from the body, and neither is
       JUDGED here (R32): attribution, like conduct, is judged once, at the drain, where a row that outlived the door's
       rules is judged again before anything leaves. `purpose` and `ua_mode` ride the row as sent. */
    const purpose = text(args.purpose).trim();
    const uaMode = text(args.ua_mode ?? args.uaMode ?? "civicos").trim();
    const callerPlane = text(caller).trim();
    /* R45: THE SWEEP the request asks to be filed under (`"<bundle>#<id>"`), recorded as sent and judged only at the
       drain, with conduct (R9, R32): whether the sweep admits it can change while the row waits. Absent, null or blank
       is an ordinary request. A value that is not text is recorded as what was sent, so the drain refuses it by name
       rather than this door dropping it and filing an ordinary request nobody asked for. */
    const sweepRaw = args.sweep ?? null;
    const sweep = typeof sweepRaw === "string" ? (sweepRaw.trim() || null) : sweepRaw === null ? null : shown(sweepRaw);

    /* R6: IDEMPOTENT ON (run, address, render). A run that asks twice for the same document has asked once: the second
       ask returns the standing row, never this call's fields. `render` is in the key because the rendered page and
       the served document are not the same document (D-64). */
    const standing = this.#one(
      `SELECT * FROM capture_requests WHERE run=? AND address=? AND render=? AND state IN ('requested','draining','captured')`,
      run, address, render);
    if (standing)
      return { ok: true, request: standing.request, run, target: standing.target, address,
               host: standing.host, purpose: standing.purpose, ua_mode: standing.ua_mode,
               lead_inquiry: standing.lead_inquiry ?? null, render: standing.render === 1,
               sweep: standing.sweep ?? null, state: standing.state, requested: false, already: true,
               principals: { plane: standing.principal_plane, claude: standing.principal_claude } };

    /* R6, R7: THE TIME IS THE IN-PROCESS CALLER'S STATED INSTANT (`at`, a test or the scheduler's replay) OR THIS
       INSTANCE'S CLOCK, never a body's `at` (the op handler passes none), so each request's expiry follows its own
       instant (N188 (3)). THE ID IS MINTED HERE, never a body's `request`: one naming the id could collide with a held
       one. A drawn id already held is drawn again, so the door never throws on the key. */
    const nowMs = instantMs(at) ?? this.#nowMs();
    const now = stampInstant("second", nowMs);
    const expires = stampInstant("second", nowMs + CAPTURE_REQUEST_TTL_MS);
    let request = null;
    for (let i = 0; i < 8 && !request; i++) {
      const id = `CR-${now.replace(/[-:TZ]/g, "")}-${randomHex(6)}`;
      if (!this.#one(`SELECT 1 AS x FROM capture_requests WHERE request=?`, id)) request = id;
    }
    this.#sql.exec(
      `INSERT INTO capture_requests (request, run, target, address, host, purpose, ua_mode,
         principal_plane, principal_claude, state, attempts, requested_at, updated, expires, lead_inquiry, render, sweep)
       VALUES (?,?,?,?,?,?,?,?,?,'requested',0,?,?,?,?,?,?)`,
      request, run, target, address, host, purpose, uaMode, callerPlane, String(runRow.principal_claude ?? ""),
      now, now, expires, lead || null, render, sweep);
    const written = this.#one(`SELECT * FROM capture_requests WHERE request=?`, request);
    /* R44 (N223): every listener told once, after the write, in the modules' total order; none can change the row or
       the answer. A rejection is swallowed where it lands. */
    for (const l of this.#filed) {
      try {
        const r = l.fn({ request, run: written.run, expires: written.expires });
        if (r && typeof r.then === "function") r.then(null, () => {});
      } catch { /* isolated */ }
    }
    return { ok: true, request, run: written.run, target: written.target, address: written.address,
             host: written.host, purpose: written.purpose, ua_mode: written.ua_mode,
             lead_inquiry: written.lead_inquiry ?? null, render: written.render === 1,
             sweep: written.sweep ?? null, state: written.state, requested: true, already: false,
             requested_at: written.requested_at, expires: written.expires,
             principals: { plane: written.principal_plane, claude: written.principal_claude },
             detail: "requested. This instance does not fetch on a caller's timing: the daemon drains "
                   + "this queue, and DEC-47's conduct rules are applied there." };
  }

  /** Is `id` an inquiry this viewer can see (membership's predicate over record-core's `bundles` read contract)? A
   *  legacy `focus` or `problem` spelling reads as an inquiry (`normalizeType`). An unseen and an absent id alike. */
  #inquiryInSight(id, viewer) {
    if (!id) return false;
    const gate = viewerPredicate(viewer);
    const b = this.#one(`SELECT b.bundle_id, b.object_type FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                        id, ...gate.args);
    return !!b && normalizeType(b.object_type) === "inquiry";
  }

  /** R10's composer, as a method for the reads' callers. */
  attribution(row) { return captureRequestAttribution(row); }

  /** R44 (N223, K259): a later module registers once at start for the notice after each request written (R6). Its
   *  refusals are membership's `listenerRefusal` (R81); listeners run in the modules' total order (R83). */
  onRequestFiled(module, fn) {
    const refused = listenerRefusal(this.#filed, module, fn);
    if (refused) return refused;
    this.#filed.push({ module, fn, seq: this.#filed.length });
    this.#filed.sort((a, b) => (this.#rank(a.module) - this.#rank(b.module)) || (a.seq - b.seq));
    return { ok: true, module };
  }

  /** R45 (K1099; K31's pattern, this module being earlier than `link-sweep`, P4): the one scope check, registered once
   *  at start by `link-sweep` (its R12). A second registration, whoever makes it, is refused `LISTENER_DECLARED` naming the
   *  holder, and a malformed one `LISTENER_MALFORMED`, both through membership's `listenerRefusal` (its R81).
   *
   *  The check is `fn({sweep, locators, run, target})`, answered at once or as a promise: `{ok: true, scope}` when the
   *  sweep is ratified and not held and every locator is in its scope, `scope` being its in-scope prefixes (the
   *  sweep's `sources`, link-sweep R1), which ride the fetch so `acquisition` judges each redirect against them (its
   *  R31); anything else, a throw included, refuses the request (`reason`, one of `unknown`, `unratified`, `held` or
   *  `out-of-scope`, and `detail` are carried into the refusal when given). */
  registerSweepScope(module, fn) {
    const refused = listenerRefusal(this.#sweepScope, module, fn);
    if (refused) return refused;
    this.#sweepScope = { module, fn };
    return { ok: true, module };
  }

  /* ==================================================================== *
   * R11–R22, R37–R41 — THE DRAIN: THE ONLY THING IN THIS PLANE THAT TURNS A REQUEST INTO A FETCH.
   * ==================================================================== */

  /** R11, R37: whether unattended capture is configured here. Never throws. */
  configured() {
    try { return this.#deps.configured ? !!this.#deps.configured() : unattendedBound(this.#env()); }
    catch { return false; }
  }

  /** R37: the number of `requested` rows, and 0 whenever unattended capture is not configured, so an idle or
   *  unconfigured instance holds no alarm. Synchronous; writes nothing; never throws. */
  drainPending() {
    try {
      if (!this.configured()) return 0;
      return Number(this.#one(`SELECT count(*) AS c FROM capture_requests WHERE state='requested'`).c) || 0;
    } catch { return 0; }
  }

  /** R37: the cadence between drain ticks while work waits: the binding `CAPTURE_REQUEST_TICK_MS` when it reads as a
   *  number ≥ 0, else 60,000. An absent or empty binding is not a number. Synchronous; never throws. */
  drainIntervalMs() {
    try {
      const raw = this.#env().CAPTURE_REQUEST_TICK_MS;
      if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) return CAPTURE_REQUEST_TICK_MS;
      const v = Number(raw);
      return Number.isFinite(v) && v >= 0 ? v : CAPTURE_REQUEST_TICK_MS;
    } catch { return CAPTURE_REQUEST_TICK_MS; }
  }

  #remaining() { return Number(this.#one(`SELECT count(*) AS c FROM capture_requests WHERE state='requested'`).c) || 0; }

  /** op=capturerequestdrain, and the scheduler's `capture-request-drain` consumer, which passes its rank (R12, N224:
   *  scheduler R10, `rank(items, now)` answering the items reordered). */
  async drain({ limit = null, actor = "consumer", now = null, rank = null } = {}) {
    const nowMs = Number.isFinite(now) ? now : this.#nowMs();
    const at = stampInstant("second", nowMs);
    if (!this.configured())
      return { configured: false, actor, at, drained: 0, captured: [], refused: [], held: [], expired: [], remaining: 0,
               detail: "no daemon credential is bound: this instance drains nothing and holds no alarm for it" };
    /* R11: NOT RE-ENTRANT. The tick awaits its fetches, and a second tick while one is out would judge the same rows
       and could send the same fetch twice. */
    if (this.#draining)
      return { configured: true, busy: true, actor, at, drained: 0, captured: [], refused: [], held: [], expired: [],
               remaining: this.#remaining() };
    this.#draining = true;
    try {
      const cap = Math.max(1, Math.min(Number(limit) || CAPTURE_REQUEST_TICK_BATCH, CAPTURE_REQUEST_TICK_BATCH));

      /* R21: A ROW LEFT `draining` BY A TICK THAT DID NOT FINISH IS NOT LEFT THERE. No tick is running (the flag
         above), so every `draining` row is one an interrupted tick left: it goes back to `requested`, where R20 below
         releases it when it is past `expires` and the batch otherwise judges it again. Left, it would hold its run
         (R29) and block a new ask for its key (R6) indefinitely. */
      this.#sql.exec(`UPDATE capture_requests SET state='requested', updated=? WHERE state='draining'`, at);

      /* R20, D-523, D-581: EVERY NON-TERMINAL ROW PAST ITS `expires`, PLAIN OR RENDER, IS RELEASED, never fetched.
         `expired` is a state of its own: not `refused` (nothing refused the ask; the time it was valid for ran out)
         and not `captured` (nothing was filed). Its last code is KEPT, so the record says what it was held under.
         Bounded by the tick's batch and BEFORE the batch is selected, so an expired row never takes a slot. */
      const expired = [];
      for (const q of this.#rows(
        `SELECT * FROM capture_requests WHERE state='requested' AND expires <= ? ORDER BY expires, request LIMIT ?`, at, cap)) {
        const renderRow = q.render === 1;
        const reason = renderHoldReason(q.code);
        const why = String(q.detail || "").slice(0, 400);
        const said = `held under ${reason.check || "no catalogued check"} ${q.code || "(no code: never attempted)"} `
                   + `until this request expired at ${q.expires}. `
                   + (renderRow ? "The render was never performed and nothing was filed for it, so what the page showed "
                                  + "is UNDETERMINED"
                                : "Nothing was fetched or filed for it after that, so what the address holds is "
                                  + "UNDETERMINED")
                   + (why ? ` — the reason last given: ${why}` : " — no further detail was carried");
        this.#sql.exec(`UPDATE capture_requests SET state='expired', detail=?, updated=? WHERE request=? AND state='requested'`,
                       said.slice(0, 600), at, q.request);
        /* A held render is GOVERNED (D-491: every C-83 admission refusal is a fact about US), condition
           `render-deferred`; a plain row's expiry says nothing about us or the source, so it is not governed. */
        this.#observe({
          ...lookAuthority(q), level: "document", subjectKind: "address", subject: q.address,
          state: "LOOKED_INDETERMINATE", governed: renderRow, condition: renderRow ? "render-deferred" : null,
          detail: `${reason.check || "no catalogued check"} ${q.code || "(no code)"}: the request expired `
                + `UNDETERMINED at ${q.expires} and is released — ${why || "no detail was carried"}`,
        }, at);
        expired.push({ request: q.request, address: q.address, host: q.host,
                       code: q.code ?? null, check: reason.check, translation: reason.translation,
                       source_reason: q.source_reason ?? null,
                       render: renderRow ? { state: "expired", content: "undetermined" } : null,
                       expires: q.expires, detail: said });
      }

      /* R12: `requested` rows oldest first, none past its `expires`. Given the scheduler's rank (N224), the tick reads
         at most ten times its batch, oldest first, and takes its batch in the rank's order; without one, or when the
         rank fails, oldest first. */
      const ranking = typeof rank === "function";
      const read = this.#rows(
        `SELECT * FROM capture_requests WHERE state='requested' AND expires > ? ORDER BY requested_at, request LIMIT ?`,
        at, ranking ? cap * CAPTURE_REQUEST_RANK_READ : cap);
      const queued = ranking ? this.#ranked(read, rank, nowMs).slice(0, cap) : read;
      const captured = [], refused = [], held = [];
      const hostsThisTick = new Map();
      /* R13: a refusal or hold writes code, detail (and R40's reason), `attempts + 1` when judged by conduct, and moves
         the row to `refused` when terminal or leaves it `requested`; the observation log is told every time, in its
         own vocabulary: LOOKED_INDETERMINATE, `governed` exactly when the reason is this instance's own pacing or
         renderer (D-104's split). */
      const settle = (q, { terminal, code, check, translation, detail, governed, condition, sourceReason = null,
                           render = null, countAttempt = true, into }) => {
        this.#sql.exec(
          `UPDATE capture_requests SET state=?, code=?, detail=?, source_reason=?, attempts=attempts+?, updated=? WHERE request=?`,
          terminal ? "refused" : "requested", code, String(detail || "").slice(0, 600), sourceReason,
          countAttempt ? 1 : 0, at, q.request);
        this.#observe({
          ...lookAuthority(q), level: "document", subjectKind: "address", subject: q.address,
          state: "LOOKED_INDETERMINATE", governed: governed === true, condition: condition || null,
          detail: `${check || "no catalogued check"} ${code}: ${String(detail || "").slice(0, 400)}`,
        }, at);
        (into || (terminal ? refused : held)).push({
          request: q.request, address: q.address, host: q.host, code, check: check ?? null,
          translation: translation ?? null, source_reason: sourceReason, detail: String(detail || ""),
          ...(render ? { render } : {}) });
      };

      /* R40, K103 (3): THE SOURCE TURNED THE REQUEST AWAY, and it says why: a login, a payment, an agent it will not
         admit, or another reason it gave. Terminal, so a member can supply what it asked for and retry (R41, R42); the
         source's own answer is the detail. */
      const sourceRefused = (q, r) => {
        /* DEC-49 REGION is-capture-source-refused */
        const why = sourceReasonOf(r.status);
        const row = CAPTURE_SOURCE_CHECKS.CAPTURE_SOURCE_REFUSED;
        return { ok: false, terminal: true, code: "CAPTURE_SOURCE_REFUSED", check: row.check, translation: row.translation,
                 sourceReason: why.reason,
                 detail: `the source answered HTTP ${r.status} for ${q.address} (${why.reason}); nothing was captured` };
        /* END DEC-49 REGION is-capture-source-refused */
      };
      /* R19, D-584: ANY OTHER FAILURE HOLDS THE ROW under C-28.17. When the source answered (a status), its reason is
         `other` (R40) and its answer is the detail; a fetch that never got an answer states no source reason, because
         nothing the source said decided it. */
      const fetchFailed = (q, r) => {
        /* DEC-49 REGION is-capture-fetch-failed */
        const row = CAPTURE_REQUEST_CHECKS.CAPTURE_FETCH_FAILED;
        const fromSource = r.reason === "SOURCE_REFUSED";
        return { ok: false, terminal: false, code: "CAPTURE_FETCH_FAILED", check: row.check, translation: row.translation,
                 sourceReason: fromSource ? "other" : null,
                 detail: fromSource ? `the source answered HTTP ${r.status} for ${q.address}; nothing was captured`
                                    : `the fetch did not land: ${String(r.reason || "").slice(0, 200)}` };
        /* END DEC-49 REGION is-capture-fetch-failed */
      };

      for (const q of queued) {
        const verdict = await this.#conduct(q, nowMs, hostsThisTick);
        if (!verdict.ok) {
          const row = CAPTURE_REQUEST_CHECKS[verdict.code];
          settle(q, { terminal: verdict.terminal, code: verdict.code, check: row.check, translation: row.translation,
                      detail: verdict.detail, governed: verdict.governed, condition: verdict.condition });
          continue;
        }

        /* R15: `draining` IS SET HERE, by the drain, in the tick that then fetches; one fetch is counted for the
           host; the fire carries the row's address, purpose, agent (member-browser only) and render, and nothing
           else of the row. */
        this.#sql.exec(`UPDATE capture_requests SET state='draining', attempts=attempts+1, updated=? WHERE request=?`,
                       at, q.request);
        hostsThisTick.set(q.host, (hostsThisTick.get(q.host) || 0) + 1);
        const r = await this.#fire(q, verdict);

        if (r.ok) {
          /* R15, R39: captured, the detail the attribution statement; the digest `capture` filed. A capture whose
             bytes the record already held (`existed: true`, or the source's `304` on the held capture) is recorded as
             THAT capture, never as a new one. */
          this.#sql.exec(
            `UPDATE capture_requests SET state='captured', code=NULL, detail=?, source_reason=NULL, capture_sha=?, captured_at=?, updated=? WHERE request=?`,
            verdict.attribution.statement, r.sha || null, at, at, q.request);
          this.#observe({
            ...lookAuthority(q), level: "document", subjectKind: "address", subject: q.address,
            state: "PRESENT", governed: false, resultKind: "capture", resultRef: r.sha || null,
            detail: verdict.attribution.statement,
          }, at);
          /* R38 (N141): a NEW capture is promoted at `collected` as an information bundle; one already held has its
             home and makes none (R39). The promotion's refusal changes nothing of the row: the capture is filed. */
          const promoted = r.existed === true || !r.document ? null : this.#promoteCapture(q, r.document, verdict.attribution, at);
          captured.push({ request: q.request, address: q.address, sha: r.sha || null, grade: r.grade ?? null,
                          attribution: verdict.attribution, already_held: r.existed === true,
                          ...(promoted ? { promoted } : {}) });
        } else if (r.sweepRefused) {
          /* R45: the fetch met a locator outside the sweep: refused, nothing filed; the redirect was fetched, so the
             host's slot stays spent. */
          settle(q, { ...sweepOutOfScope(`${q.sweep} does not reach every locator of this request: ${r.detail}`),
                      governed: false, condition: null, countAttempt: false });
        } else if (r.renderCode) {
          const renderRow = RENDER_CAPTURE_CHECKS[r.renderCode];
          const why = String(r.detail || r.reason || "").slice(0, 400);
          if (renderRow.check === RENDER_NOT_A_PAGE_CHECK) {
            /* R18, D-582: decided AFTER the page was fetched, so the host's slot stays spent; the address serves no
               page to render, which will not change on the next tick, so the row is refused. The source served what
               it served: not governed. */
            settle(q, { terminal: true, code: r.renderCode, check: renderRow.check, translation: renderRow.translation,
                        detail: why || "the address served something that is not a single HTML page",
                        governed: false, condition: null, countAttempt: false });
          } else if (renderRow.check === RENDER_FAILED_CHECK) {
            /* R18, D-582: the page WAS fetched and our renderer failed on it: the slot stays spent (nothing is given
               back that was used), the row is held, and the look is ours (governed, `render-deferred`). */
            settle(q, { terminal: false, code: r.renderCode, check: renderRow.check, translation: renderRow.translation,
                        detail: why, governed: true, condition: "render-deferred", countAttempt: false,
                        render: { state: "deferred", content: "undetermined" } });
          } else {
            /* R17, D-491 / IC-276 — A RENDER THIS INSTANCE COULD NOT DO IS HELD, AND THE SERVED SHELL IS NEVER FILED
               IN ITS PLACE. `capture` decides these before it fetches anything, so THE HOST'S SLOT IS GIVEN BACK:
               left counted, a plain request behind a render this instance cannot do would starve until the render
               row expired. The state is `capture`'s own word (`waiting` for C-83.8), else `deferred`. */
            hostsThisTick.set(q.host, Math.max(0, (hostsThisTick.get(q.host) || 1) - 1));
            settle(q, { terminal: false, code: r.renderCode, check: renderRow.check, translation: renderRow.translation,
                        detail: why, governed: true, condition: "render-deferred", countAttempt: false,
                        render: { state: r.renderState || "deferred", content: "undetermined" } });
          }
        } else if (r.reason === "SOURCE_REFUSED" && sourceReasonOf(r.status).terminal) {
          settle(q, { ...sourceRefused(q, r), governed: false, condition: null, countAttempt: false });
        } else {
          /* Our own governor holding the host between conduct and the fire is our pacing: governed. */
          const ours = r.reason === "HOST_COOLING_OFF";
          settle(q, { ...fetchFailed(q, r), governed: ours, condition: ours ? "governor-holding-host" : null,
                      countAttempt: false });
        }
      }
      return { configured: true, actor, at, drained: captured.length + refused.length + held.length,
               captured, refused, held, expired, remaining: this.#remaining() };
    } finally { this.#draining = false; }
  }

  /** R12 (N224): the rows in the rank's order. Each is offered as `{kind: "request", id, waitingSince, cadenceMs}`
   *  (`waitingSince` its `requested_at` in milliseconds; `cadenceMs` R37's, by which the rank puts work waiting longer
   *  than one cadence first) and carries its place under a symbol the rank's copies keep; a row the rank drops or
   *  cannot place follows in oldest-first order. A rank that throws or answers no list leaves the order as read. */
  #ranked(read, rank, now) {
    if (read.length < 2) return read;
    const PLACE = Symbol("place");
    const cadenceMs = this.drainIntervalMs();
    const items = read.map((r, i) => ({ kind: "request", id: r.request, waitingSince: instantMs(r.requested_at),
                                        cadenceMs, [PLACE]: i }));
    let answer;
    try { answer = rank(items, now); } catch { return read; }
    if (!Array.isArray(answer)) return read;
    const order = [], taken = new Set();
    for (const x of answer) {
      const i = x && typeof x === "object" ? x[PLACE] : undefined;
      if (Number.isInteger(i) && !taken.has(i)) { taken.add(i); order.push(read[i]); }
    }
    for (let i = 0; i < read.length; i++) if (!taken.has(i)) order.push(read[i]);
    return order;
  }

  /** R14: DEC-47's CONDUCT, and this is the ONE place it is applied; R45's sweep scope is judged here too, among the
   *  rules about what the request says and before rate. */
  async #conduct(q, nowMs, hostsThisTick) {
    /* DEC-49 REGION is-capture-conduct
     *
     * THE SPAN `CAPTURE_REQUEST_CHECKS`' conduct and attribution rows name (REC-71). ORDER IS DELIBERATE. Attribution
     * first, because a capture nobody can account for should not be made even if every other rule passes; then the
     * two rules about WHAT WE SAY (purpose, agent), which cost nothing; then RATE last, because it is the only one that
     * is TEMPORARY — a request refused for what it says is never also reported as merely paced. */
    const attribution = captureRequestAttribution(q);
    if (!attribution.ok)
      return { ok: false, terminal: true, code: "CAPTURE_ATTRIBUTION_ONE_PRINCIPAL",
               detail: `this request names `
                     + `${attribution.plane && !attribution.claude ? "only the plane principal" : ""}`
                     + `${!attribution.plane && attribution.claude ? "only the Claude-account principal" : ""}`
                     + `${!attribution.plane && !attribution.claude ? "neither principal" : ""}`
                     + `, and DEC-27(b) requires the record to state BOTH: whose plane scope the writes `
                     + `ran under, and WHICH LEVEL of the Claude-account cascade paid. No fetch is made `
                     + `for an act the record could not attribute.` };
    /* CONDUCT 2 — THE PURPOSE TOKEN, before the agent because it is a COMPONENT of the agent. */
    if (!CAPTURE_PURPOSES.includes(q.purpose))
      return { ok: false, terminal: true, code: "CAPTURE_CONDUCT_NO_PURPOSE",
               detail: `'${String(q.purpose || "").slice(0, 40) || "(none)"}' is not one of the purposes `
                     + `this instance can truthfully name: ${CAPTURE_PURPOSES.join(", ")}. DEC-47 requires `
                     + `an investigation fetch to introduce or reuse a purpose token DELIBERATELY, and `
                     + `borrowing a word that means something else is the disguise SOURCE-ACCESS.md rules out.` };
    /* CONDUCT 1 — THE AGENT, and there are exactly TWO legible forms, legible for different reasons: the member's own
       browser agent because a member actually used it (BOB-3: delegated, never invented), the CivicOS form because of
       the contact component D-94 measured. So the rule is applied per form. */
    if (!CAPTURE_UA_MODES.includes(q.ua_mode))
      return { ok: false, terminal: true, code: "CAPTURE_CONDUCT_UA_ILLEGIBLE",
               detail: `'${String(q.ua_mode || "").slice(0, 40) || "(none)"}' is not one of the legible `
                     + `agent forms: ${CAPTURE_UA_MODES.join(", ")}. BIO does not disguise its requests, `
                     + `and a mode this door cannot express is a string nobody could account for.` };
    let ua;
    if (q.ua_mode === "member-browser") {
      ua = this.#memberAgent(q.target);
      if (!ua)
        return { ok: false, terminal: true, code: "CAPTURE_CONDUCT_UA_UNRECORDED",
                 detail: `this request asked to fetch as the member's own browser and `
                       + `${q.target} records no member agent. BOB-3 permits DELEGATING an agent a `
                       + `member actually used; composing one would be inventing a client that does `
                       + `not exist, which is the fabricated-Mozilla case wearing the ruling's clothes.` };
    } else {
      /* The honest product string, composed by `acquisition`'s ONE composer (its R24) — the string it sends. */
      const env = this.#env();
      ua = civicosUserAgent(env.VERSION, env.INSTANCE_NAME, q.purpose);
      if (!userAgentIsLegible(ua))
        return { ok: false, terminal: true, code: "CAPTURE_CONDUCT_UA_ILLEGIBLE",
                 detail: `the agent this fetch would carry names no contact anybody could reach. D-94's `
                       + `ladder MEASURED that removing the contact component flips admission 200 to 403 `
                       + `uniformly, so this is the component that decides whether the fetch happens at `
                       + `all — and being blocked honestly is a fact we can record.` };
    }
    /* R45 — THE SWEEP, when the request names one: terminal like the rules above, because it is about what the request
       says, and before rate, so a request its sweep does not admit is never reported as merely paced. */
    const sweep = q.sweep == null ? null : await this.#sweepAdmits(q);
    if (sweep && !sweep.ok) return sweep;
    /* CONDUCT 3 — RATE, and BOTH halves are NON-TERMINAL: a held request is still queued. The governor's read is
       NON-CONSUMING (host-governor R14): `capture`'s governed fetch spends the token on the way out. */
    if (this.#hostHeld(q.host, nowMs))
      return { ok: false, terminal: false, governed: true, condition: "governor-holding-host",
               code: "CAPTURE_CONDUCT_HOST_HELD",
               detail: `${q.host} is in cool-off: it refused us or asked us to slow down, and the `
                     + `per-host governor is holding the interval it named. DEC-47 bounds discovery `
                     + `more tightly than re-fetch because a stranger's server has no relationship `
                     + `with this instance.` };
    if ((hostsThisTick.get(q.host) || 0) >= CAPTURE_REQUEST_PER_HOST_PER_TICK)
      return { ok: false, terminal: false, governed: true, condition: "governor-holding-host",
               code: "CAPTURE_CONDUCT_TICK_SPENT",
               detail: `this tick has already fetched from ${q.host} once. A person opens a few tabs `
                     + `and then reads; a loop opens forty, so the drain spreads requests across ticks `
                     + `rather than emptying the queue at one host's expense.` };
    /* END DEC-49 REGION is-capture-conduct */
    return { ok: true, ua, attribution, ...(sweep ? { sweep: q.sweep, scope: sweep.scope } : {}) };
  }

  /** R45: whether the sweep the row names admits it, as `link-sweep`'s registered scope check answers: `{ok: true,
   *  scope}`, or R45's refusal. A name not of the shape `"<bundle>#<id>"` names no sweep and is refused without asking;
   *  with no check registered nothing can say the sweep admits the request, so it is refused; a check that throws, or
   *  answers anything but `ok: true` with a non-empty list of prefixes, refuses it. Never throws. */
  async #sweepAdmits(q) {
    const name = String(q.sweep);
    if (!SWEEP_NAME.test(name))
      return sweepOutOfScope(`'${name.slice(0, 80)}' is not a sweep's name ("<bundle>#<id>"), so no sweep admits this `
                             + `request`);
    const check = this.#sweepScope;
    if (!check)
      return sweepOutOfScope(`no scope check is registered on this instance, so nothing can say that ${name} is `
                             + `ratified, not held and reaches ${q.address}`);
    let a = null;
    try { a = await check.fn({ sweep: name, locators: [q.address], run: q.run, target: q.target }); } catch { a = null; }
    const scope = a && a.ok === true && Array.isArray(a.scope) ? a.scope.filter((p) => typeof p === "string" && p !== "") : [];
    if (a && a.ok === true && scope.length && scope.length === a.scope.length) return { ok: true, scope };
    const why = a && SWEEP_REFUSALS[a.reason] ? SWEEP_REFUSALS[a.reason] : "does not admit this request";
    const said = a && typeof a.detail === "string" && a.detail.trim() ? ` (${a.detail.trim().slice(0, 200)})` : "";
    return sweepOutOfScope(`${name} ${why}${said}; ${q.address} was not fetched under it`);
  }

  #hostHeld(host, nowMs) {
    try { return !!this.#deps.governor.isHeld(host, nowMs); } catch { return false; }
  }

  /** R14 (N295, K342): the member agent RECORDED on the inquiry, as inquiry answers it (its R44 `memberUserAgent`: the
   *  control plane's stamp at the inquiry's creation, else its document's `member_user_agent`), or null: answered
   *  honestly rather than defaulted, because a default here is the invented client BOB-3 does not license. Inquiry
   *  is the one reader of that record (K231); this module never reads the document's line itself. */
  #memberAgent(target) {
    try {
      const ua = this.#deps.inquiry.memberUserAgent(target);
      return typeof ua === "string" && ua.trim() !== "" ? ua.trim() : null;
    } catch { return null; }
  }

  /** R15, R16, K58: THE FETCH, through `capture`'s trusted in-process arm, handed the draining row's own address,
   *  purpose, agent and render flag — what the conduct check judged. R41 (K103): the one credential a member supplied
   *  for this request's scope, when one is admitted, rides beside them (capture-sources R56, read with the row's
   *  plane principal, target and host); none is admitted, the fetch goes without, and the source's refusal stands.
   *
   *  WHAT COMES BACK OUT: a filed capture's digest, grade and whether the bytes were already held (R39); a render
   *  `capture` refused, named by its C-83 code (read off `acquisition`'s rows, never a spelling invented here) and its own
   *  word for the hold (D-520); otherwise the reason and, for a source's answer, its status. D-205: a thrown error's
   *  message is never carried, because it can carry a query string and a query string can carry a credential. */
  async #fire(q, verdict) {
    try {
      let credential = null;
      if (this.#deps.credentials && typeof this.#deps.credentials.credentialsForFetch === "function") {
        const c = await this.#deps.credentials.credentialsForFetch({ host: q.host, principalPlane: q.principal_plane,
                                                                     target: q.target });
        credential = c && Array.isArray(c.credentials) && c.credentials.length ? c.credentials[0] : null;
      }
      /* R39 (N262): the capture this module's own record holds of the same address and render; R38: the sweep origin,
         the target inquiry the matched scope and the run with both principals the deeming actor (capture R60, R61). */
      const held = this.#one(
        `SELECT capture_sha FROM capture_requests WHERE address=? AND render=? AND state='captured' AND capture_sha IS NOT NULL
          AND request<>? ORDER BY captured_at DESC, request DESC LIMIT 1`, q.address, q.render, q.request);
      const res = await this.#deps.capture.acquire({}, {
        cls: "daemon", member: false, storeName: this.#storeName(),
        captureRequest: { locator: q.address, purpose: q.purpose,
                          agent: q.ua_mode === "member-browser" ? verdict.ua : null, render: q.render === 1,
                          ...(credential ? { credential } : {}),
                          ...(held ? { heldSha: held.capture_sha } : {}),
                          /* R45: a request its sweep admitted is filed under that sweep, the run its deeming actor,
                             and carries the sweep's scope, so every redirect is judged against it (acquisition R31). */
                          ...(verdict.sweep
                            ? { origin: { kind: "sweep", matched_sweep: verdict.sweep, deeming_actor: deemingActor(verdict.attribution) },
                                scope: verdict.scope }
                            : { origin: { matched_sweep: q.target, deeming_actor: deemingActor(verdict.attribution) } }) } });
      const out = res && res.body;
      const doc = out && out.ok && out.document;
      if (doc) return { ok: true, sha: doc.capture && doc.capture.sha256, grade: doc.capture && doc.capture.grade,
                        existed: out.existed === true || out.held === true, document: doc };
      /* R39, capture R61: the source answered that the held capture is still what it serves; no document, no bytes. */
      if (out && out.ok && out.unchanged === true && out.capture && out.capture.sha256)
        return { ok: true, sha: out.capture.sha256, grade: null, existed: true, document: null };
      const reason = (out && (out.reason || out.error)) || `http ${res && res.status}`;
      /* R45: `acquisition` refused the sweep's fetch for its scope (a redirect out of it, C-128.2, or no scope, C-128.1):
         a locator of this request is outside the sweep, and its detail says which. */
      if (verdict.sweep && (reason === "SWEEP_REDIRECT_OUT_OF_SCOPE" || reason === "SWEEP_SCOPE_MISSING"))
        return { ok: false, reason, sweepRefused: true, status: null,
                 detail: String((out && out.detail) || reason).slice(0, 300) };
      const renderCode = q.render === 1 && typeof reason === "string"
        && Object.prototype.hasOwnProperty.call(RENDER_CAPTURE_CHECKS, reason) ? reason : null;
      return { ok: false, reason, status: out && Number.isFinite(Number(out.status)) ? Number(out.status) : null,
               renderCode,
               renderState: renderCode && out && out.render && (out.render.state === "waiting" || out.render.state === "deferred")
                 ? out.render.state : null,
               detail: renderCode ? String((out && out.detail) || "").slice(0, 400) : null };
    } catch {
      return { ok: false, reason: "the fetch did not complete and this plane did not record why", status: null };
    }
  }

  /** R38 (N141, K102, K181): THE CAPTURE PROMOTED AT `collected`, NEVER HIGHER, as a plane-composed `information`
   *  bundle through `promotion.promote` under the daemon's machine-shaped actor (R10). DEC-47 makes the inquiry the
   *  authorisation, so the capture's origin (filed by `capture` from the drain's own values, R15) is `sweep`, the target
   *  inquiry its matched scope and the run with both principals its deeming actor. The bundle holds the capture's
   *  register document as `capture` answered it, the primary (and a render's shell, a streamed capture's parts) as
   *  blobs, and one register row. No `group`: `promote` writes the instance's recorded one or refuses (C-64.1). Answers
   *  `{ok: true, bundle_id}`, or `{ok: false, reason?, detail}` (the promotion's own refusal relayed); never throws. */
  #promoteCapture(q, doc, attribution, at) {
    try {
      const promotion = this.#deps.promotion;
      if (!promotion || typeof promotion.promote !== "function")
        return { ok: false, detail: "no promotion is reachable here, so the capture was filed and not promoted" };
      const cap = doc.capture || {};
      if (typeof doc.file !== "string" || !/^[0-9a-f]{64}$/.test(String(cap.sha256 || "")) || !Number.isSafeInteger(cap.bytes))
        return { ok: false, detail: "capture's answer named no primary file, digest and size to promote" };
      const retrieved = typeof doc.retrieved === "string" && doc.retrieved ? doc.retrieved : at;
      const enc = (t) => {
        const b = new TextEncoder().encode(t);
        return { text: t, bytes: b.length, sha256: createSha256().update(b).hex() };
      };
      return this.#deps.record.transact(() => {
        const id = `${this.#deps.record.allocId("INFO", at.slice(0, 4)).id}-${CAPTURE_REQUEST_BUNDLE_SLUG}`;
        const title = `Requested capture of ${q.address}`.replace(/[\p{Cc}]+/gu, " ").slice(0, 200);
        const md = ["---",
          `id: ${id}`, "object_type: information", "schema: information@2",
          `title: ${JSON.stringify(title)}`, "current_state: collected", "prior_state: null",
          `created: "${at}"`, `last_updated: "${at}"`,
          "produced_by:", "  mode: agent", "  capability_tier: session",
          "references: []", "state_history: []", "annotations_open: 0",
          "reeval_pending:", "  flag: false", "  since: null", "  source: null",
          "visuals: []", "criticality: supporting", "source_status: unchanged",
          "source:", `  locator: ${JSON.stringify(q.address)}`, `  retrieved: ${retrieved}`,
          "monitoring:", "  enabled: false", "  frequency: none",
          "---", "", "## Summary", "",
          `The document served at ${q.address}, captured by the daemon at an investigative session's request `
          + `under ${q.target}${q.sweep ? `, filed under the sweep ${q.sweep}` : ""}. Its bytes are \`${doc.file}\`, exactly as served; nothing here summarises them.`, "",
          "## Provenance Notes", "",
          `${attribution.statement}. Requested ${q.requested_at} as ${q.request}; collected ${at}. Filed at collected `
          + `and never higher: releasing it is a named member's decision.`, "",
          "## Session Log", "",
          `### Session ${at} | Collected | ${attribution.actor}`,
          `Trigger: capture request ${q.request} (run ${q.run})`,
          "Changes: created from the daemon's capture of the requested address.", "",
          "## Review Notes", ""].join("\n");
        const blob = (f) => (f && typeof f.file === "string" && /^[0-9a-f]{64}$/.test(String(f.sha256 || ""))
          && Number.isSafeInteger(f.bytes) ? { path: f.file, blobSha: f.sha256, sha256: f.sha256, bytes: f.bytes } : null);
        const blobs = [blob({ file: doc.file, sha256: cap.sha256, bytes: cap.bytes }), blob(doc.shell),
                       ...(Array.isArray(doc.parts) ? doc.parts.map(blob) : [])].filter(Boolean);
        const seen = new Set();
        const files = [{ path: "bundle.md", ...enc(md) },
                       { path: "data/provenance.json", ...enc(JSON.stringify({ documents: [doc] }, null, 2)) },
                       ...blobs.filter((f) => (seen.has(f.path) ? false : seen.add(f.path)))];
        const p = promotion.promote({
          bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${randomHex(4)}`, author: attribution.actor,
          files,
          meta: { object_type: "information", title, current_state: "collected", prior_state: null,
                  created: at, last_updated: at, criticality: "supporting" },
          register: [{ sha256: cap.sha256, path: doc.file, encoding: "binary", bytes: cap.bytes }],
        });
        /* The promotion's own refusal, relayed by its code, never minted here. */
        return p && p.ok ? { ok: true, bundle_id: id }
                         : { ok: false, reason: (p && (p.reason || p.code)) || null,
                             detail: String((p && p.detail) || "the promotion was refused").slice(0, 300) };
      });
    } catch {
      return { ok: false, detail: "the promotion did not complete and this plane did not record why" };
    }
  }

  /* ==================================================================== *
   * R23–R29 — THE READS.
   * ==================================================================== */

  /** One row as every read answers it (R24, R25, R40): the request's fields less the principals, `render` a boolean,
   *  the render deferral, the source's reason and the attribution composed by R10. */
  static project(r) {
    return {
      request: r.request, run: r.run, target: r.target, address: r.address, host: r.host,
      purpose: r.purpose, ua_mode: r.ua_mode, state: r.state, code: r.code, detail: r.detail,
      capture_sha: r.capture_sha, attempts: r.attempts, requested_at: r.requested_at,
      updated: r.updated, expires: r.expires, captured_at: r.captured_at,
      lead_inquiry: r.lead_inquiry ?? null, run_woken_at: r.run_woken_at ?? null,
      render: r.render === 1, source_reason: r.source_reason ?? null, sweep: r.sweep ?? null,
      /* R25, D-523: what became of a render this instance could not do, in the drain's and op=queue's words. */
      render_deferral: (r.render === 1 && (r.state === "expired" || (r.state === "requested" && r.code)))
        ? (({ code, check, translation }) => ({ state: r.state === "expired" ? "expired" : "deferred",
            content: "undetermined", code, check, translation }))(renderHoldReason(r.code))
        : null,
      attribution: captureRequestAttribution(r),
    };
  }

  /** The gate over a bundle-id column: membership's predicate (R43) over record-core's `bundles` read contract. A row
   *  whose bundle the viewer cannot see, or which no longer exists, is withheld; an absent or unrecognised stamp sees
   *  none; a machine credential sees every row. */
  static #gate(col, viewer) {
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return { sql: "1=1", args: [] };
    if (gate.scope === "DENY") return { sql: "0=1", args: [] };
    return { sql: `EXISTS (SELECT 1 FROM bundles b WHERE b.bundle_id = ${col} AND (${gate.sql}))`, args: gate.args };
  }

  #bounded(where, args, order, limit, gateCol, viewer) {
    const cap = clamp(limit, CAPTURE_REQUEST_READ_LIMIT, CAPTURE_REQUEST_READ_MAX);
    const seen = CaptureRequests.#gate(gateCol, viewer);
    /* CAP + 1 SO THE ANSWER CAN SAY IT WAS CUT (REC-57), and nothing says how many the gate withheld. */
    const found = this.#rows(
      `SELECT cr.* FROM capture_requests cr WHERE ${[...where, `(${seen.sql})`].join(" AND ")} ORDER BY ${order} LIMIT ?`,
      ...args, ...seen.args, cap + 1);
    const rows = found.slice(0, cap);
    return { count: rows.length, limit: cap, truncated: found.length > cap, requests: rows.map(CaptureRequests.project) };
  }

  /** R23–R25, op=capturerequests: rows whose target the viewer can see, filtered by run, target and state, oldest
   *  first. */
  captureRequests({ run = null, target = null, state = null, limit = null, viewer = null } = {}) {
    const where = [], args = [];
    if (run) { where.push("cr.run=?"); args.push(String(run)); }
    if (target) { where.push("cr.target=?"); args.push(String(target)); }
    if (state) { where.push("cr.state=?"); args.push(String(state)); }
    return this.#bounded(where, args, "cr.requested_at, cr.request", limit, "cr.target", viewer);
  }

  /** R26, R27: the queue's producers' reads, each bounded in SQL on an index (D-581: no walk over every terminal row).
   *  `completed`: captured rows by target; `leads`: captured rows with a lead, by the lead; `rendersHeld`: render rows
   *  expired, or requested with a code, by target. */
  completed({ viewer = null, limit = null } = {}) {
    return this.#bounded(["cr.state='captured'"], [], "cr.captured_at, cr.request", limit, "cr.target", viewer);
  }
  leads({ viewer = null, limit = null } = {}) {
    return this.#bounded(["cr.state='captured'", "cr.lead_inquiry IS NOT NULL", "cr.lead_inquiry <> ''"], [],
                         "cr.captured_at, cr.request", limit, "cr.lead_inquiry", viewer);
  }
  rendersHeld({ viewer = null, limit = null } = {}) {
    return this.#bounded(["cr.render = 1", "(cr.state = 'expired' OR (cr.state = 'requested' AND cr.code IS NOT NULL))"], [],
                         "cr.updated, cr.request", limit, "cr.target", viewer);
  }

  /** R43 (N169): one request by id, as R24 answers a row (with R25's `render_deferral`), when its target is one the
   *  viewer can see; null for a blank id, an unknown one or an unseen one alike. One read by key; writes nothing; never
   *  throws. */
  requestById(a = {}) {
    try {
      const { request = null, viewer = null } = a && typeof a === "object" ? a : {};
      const id = text(request).trim();
      if (!id) return null;
      const seen = CaptureRequests.#gate("cr.target", viewer);
      const r = this.#one(`SELECT cr.* FROM capture_requests cr WHERE cr.request = ? AND (${seen.sql}) LIMIT 1`,
                          id, ...seen.args);
      return r ? CaptureRequests.project(r) : null;
    } catch { return null; }
  }

  /** R28: a request's target and lead inquiry, either absent when not set, or null for an unknown id
   *  (observation-log's `sweep` authority resolution, R13 of observation-log). */
  bundlesOf(request) {
    const r = request ? this.#one(`SELECT target, lead_inquiry FROM capture_requests WHERE request = ? LIMIT 1`, String(request)) : null;
    if (!r) return null;
    return { ...(r.target ? { target: r.target } : {}), ...(r.lead_inquiry ? { lead_inquiry: r.lead_inquiry } : {}) };
  }

  /** R29, D-583: a run's outstanding requests (`requested` or `draining`, not past `expires`) and its completions not
   *  yet told to it (`captured`, `refused` and `expired` with `run_woken_at` null), each bounded by 25 and saying when
   *  it was cut. A run's wait is bounded by its requests' own expiry. */
  waits({ run, now = null } = {}) {
    const iso = stampInstant("second", Number.isFinite(now) ? now : this.#nowMs());
    const n = CAPTURE_REQUEST_WAIT_BATCH;
    const out = this.#rows(
      `SELECT * FROM capture_requests WHERE run = ? AND state IN ('requested','draining') AND expires > ?
        ORDER BY requested_at, request LIMIT ?`, String(run ?? ""), iso, n + 1);
    const done = this.#rows(
      `SELECT * FROM capture_requests WHERE run = ? AND state IN ('captured','refused','expired') AND run_woken_at IS NULL
        ORDER BY updated, request LIMIT ?`, String(run ?? ""), n + 1);
    return { run: run ?? null, outstanding: out.slice(0, n).map(CaptureRequests.project), outstanding_truncated: out.length > n,
             completions: done.slice(0, n).map(CaptureRequests.project), completions_truncated: done.length > n };
  }

  /** R29: stamps `run_woken_at` on each named completion not yet woken; answers how many were stamped. */
  markWoken({ requests = [], at = null } = {}) {
    const iso = at || stampInstant("second", this.#nowMs());
    let marked = 0;
    for (const id of Array.isArray(requests) ? requests : []) {
      const r = this.#one(`SELECT request FROM capture_requests WHERE request = ? AND run_woken_at IS NULL
                             AND state IN ('captured','refused','expired')`, String(id));
      if (!r) continue;
      this.#sql.exec(`UPDATE capture_requests SET run_woken_at = ? WHERE request = ?`, iso, r.request);
      marked++;
    }
    return { marked, at: iso };
  }

  /** ai-runs R41 (K182): the wait source this module registers with ai-runs, over R29's rows. All synchronous.
   *  `holds` answers running runs with outstanding, unexpired requests and how many; `woken` running runs with
   *  completions (`captured`, `refused`, `expired`: D-583) not yet told to them; `completions` one run's; `markWoken`
   *  stamps them. Nothing is held while unattended capture is not configured, because nothing will complete. Whether a
   *  run is running is ai-runs' own answer (`runFor`, read with a machine viewer). */
  waitSource() {
    /* N188 (1): each walk reads in keyset pages of the answer's bound, and at most `CAPTURE_REQUEST_READ_MAX` rows in
       all, so a table of finished runs' leftovers never makes one call unbounded. */
    const walk = (q, args, keyOf, take) => {
      let after = "", scanned = 0;
      for (;;) {
        const page = this.#rows(q, ...args, after, CAPTURE_REQUEST_WAIT_BATCH);
        for (const r of page) { if (take(r) === false) return; }
        scanned += page.length;
        if (page.length < CAPTURE_REQUEST_WAIT_BATCH || scanned >= CAPTURE_REQUEST_READ_MAX) return;
        after = keyOf(page[page.length - 1]);
      }
    };
    const running = (run) => {
      try { const r = this.#deps.runs.runFor(run, "class:daemon"); return !!r && r.status === "running"; }
      catch { return false; }
    };
    const bound = (limit) => clamp(limit, CAPTURE_REQUEST_WAIT_BATCH, CAPTURE_REQUEST_READ_MAX);
    return {
      tickMs: () => this.drainIntervalMs(),
      holds: (iso, limit) => {
        if (!this.configured()) return [];
        const out = [], n = bound(limit);
        walk(`SELECT run, count(*) AS outstanding FROM capture_requests
               WHERE state IN ('requested','draining') AND expires > ? AND run > ? GROUP BY run ORDER BY run LIMIT ?`,
             [String(iso)], (r) => r.run, (r) => {
               if (running(r.run)) out.push({ run: r.run, outstanding: Number(r.outstanding) });
               return out.length < n;
             });
        return out;
      },
      woken: (limit) => {
        const out = [], n = bound(limit);
        walk(`SELECT DISTINCT run FROM capture_requests
               WHERE state IN ('captured','refused','expired') AND run_woken_at IS NULL AND run > ? ORDER BY run LIMIT ?`,
             [], (r) => r.run, (r) => {
               if (running(r.run)) out.push(r.run);
               return out.length < n;
             });
        return out;
      },
      completions: (run, limit) => this.#rows(
        `SELECT request, state FROM capture_requests
          WHERE run = ? AND state IN ('captured','refused','expired') AND run_woken_at IS NULL
          ORDER BY updated, request LIMIT ?`, String(run ?? ""), bound(limit)).map((r) => ({ request: r.request, state: r.state })),
      markWoken: (requests, iso) => this.markWoken({ requests, at: iso }).marked,
    };
  }

  /** R35: the census figure this module reports through record-core's `registerCounts` (its R63), for `op=stats` and
   *  purge's proof. PL-4 / IS-4: the outbound work list is the only figure in the store that says how much traffic this
   *  instance is about to send to somebody else's server, and a purge that reported scope ALL while it stood would leave
   *  a leftover visible from OUTSIDE the instance. A COUNT AND NOTHING ELSE. `hid` (the bundles the caller may not see,
   *  `{sql, args}`, or null for a direct internal call) drops the rows whose lead names one, as the store's counter
   *  did; `COALESCE`, because a NULL lead names no bundle and `NULL NOT IN (…)` would drop the row. */
  counts(hid = null) {
    const hidden = hid !== null && typeof hid === "object" && typeof hid.sql === "string";
    const args = hidden && Array.isArray(hid.args) ? hid.args : [];
    return { captureRequests: Number(this.#one(
      `SELECT count(*) AS c FROM capture_requests${hidden ? ` WHERE COALESCE(lead_inquiry, '') NOT IN ${hid.sql}` : ""}`,
      ...args).c) || 0 };
  }

  /* ==================================================================== *
   * R41–R42 — RETRY WITH WHAT A MEMBER SUPPLIED.
   * ==================================================================== */

  /** R42 (op=capturerequestretry): a `refused` request whose reason is the source's (R40), under a target the viewer
   *  can see, returns to `requested` with `attempts`, its last code and reason kept and `expires` now + 24 h; the drain
   *  judges it again under R14, fetching with what R41 holds for its scope. Any other request is refused
   *  C-28.18 and nothing is written. Never throws. */
  captureRequestRetry(a = {}, { viewer = null } = {}) {
    const args = a && typeof a === "object" ? a : {};
    const request = text(args.request).trim();
    /* DEC-49 REGION is-capture-request-retry */
    const row = request ? this.#one(`SELECT * FROM capture_requests WHERE request=?`, request) : null;
    if (!row || row.state !== "refused" || !SOURCE_REASONS.includes(row.source_reason)
        || !this.#inquiryInSight(row.target, viewer)) {
      const c = CAPTURE_REQUEST_CHECKS.CAPTURE_REQUEST_NOT_RETRYABLE;
      return { ok: false, reason: "CAPTURE_REQUEST_NOT_RETRYABLE", code: "CAPTURE_REQUEST_NOT_RETRYABLE",
               check: c.check, translation: c.translation, request: request || null,
               detail: "only a request the source itself turned away, under a question you can see, goes back into "
                     + "the queue. Nothing was changed." };
    }
    /* END DEC-49 REGION is-capture-request-retry */
    const nowMs = this.#nowMs();
    const now = stampInstant("second", nowMs);
    const expires = stampInstant("second", nowMs + CAPTURE_REQUEST_TTL_MS);
    this.#sql.exec(`UPDATE capture_requests SET state='requested', expires=?, updated=? WHERE request=? AND state='refused'`,
                   expires, now, request);
    return { ok: true, request, state: "requested", attempts: row.attempts, code: row.code,
             source_reason: row.source_reason, expires,
             detail: "back in the queue. The drain judges it again and fetches with what a member supplied for this "
                   + "request's scope, if anything." };
  }
}

/** R45: a sweep's full name, `"<bundle>#<id>"` (link-sweep R1: the id `^[a-z0-9][a-z0-9-]{0,39}$`). */
const SWEEP_NAME = /^[^\s#]{1,200}#[a-z0-9][a-z0-9-]{0,39}$/;
/** R45: what the scope check's `reason` says, in the refusal's words. */
const SWEEP_REFUSALS = Object.freeze({
  unknown: "is not a sweep this instance holds", unratified: "is not ratified", held: "is held",
  "out-of-scope": "does not reach this address",
});

/** R45: the one site of CAPTURE_SWEEP_OUT_OF_SCOPE (C-28.19), terminal; the drain's conduct and its fire both answer
 *  through it. */
function sweepOutOfScope(detail) {
  /* DEC-49 REGION is-capture-sweep-scope */
  const row = CAPTURE_REQUEST_CHECKS.CAPTURE_SWEEP_OUT_OF_SCOPE;
  return { ok: false, terminal: true, code: "CAPTURE_SWEEP_OUT_OF_SCOPE", check: row.check, translation: row.translation,
           detail: `${detail}. A request filed under a sweep answers to what members ratified for it; nothing was filed `
                 + `under this one` };
  /* END DEC-49 REGION is-capture-sweep-scope */
}

/** R38: the deeming actor of a requested capture's sweep origin: the run and both principals (R10), never a token. */
function deemingActor(attribution) {
  const a = attribution && attribution.ok ? attribution : null;
  return a ? `run ${a.at_the_request_of.run} under ${a.principals.plane}, paid by ${a.principals.claude}` : null;
}

/** The look's authority for a request: the run that asked (the door requires one, so the `sweep` arm is reached only
 *  by a row that names none). */
function lookAuthority(q) {
  return q && q.run
    ? { authorityKind: "run", authority: String(q.run), actorClass: "machine" }
    : { authorityKind: "sweep", authority: q && q.request ? String(q.request) : null, actorClass: "plane" };
}

const instances = new WeakMap();

/** K61: the one capture-requests instance for `host` (the Durable Object's `ctx`, with its `storage`); `deps` are read
 *  on the first call only (see the class). At creation it declares its table to record-core's purge, keyed to a bundle
 *  by `target` with `lead_inquiry` cleared (R35), registers its figure with record-core's counts (R35), and registers R28 as observation-log's `sweep` resolver (its R13, N39). */
export function captureRequestsOf(host, deps = {}) {
  const storage = host && host.storage ? host.storage : host;
  let c = instances.get(storage);
  if (!c) {
    const env = deps.env || {};
    const record = deps.record || recordOf(host);
    /* `env` is handed to capture and the governor only when a caller supplied it: capture refuses a second, different
       `env` rather than run against either silently (capture R58), and an empty one would differ from the plane's. */
    const withEnv = deps.env ? { env } : {};
    const d = {
      ...deps, env, record,
      observations: deps.observations || observationLogOf(host),
      governor: deps.governor || governorOf(host, withEnv),
      capture: deps.capture || captureOf(host, withEnv),
      /* CAPTURE-SOURCES #2's note: the key rides the first `credentialsOf` call. */
      credentials: deps.credentials === undefined ? credentialsOf(host, { key: env.CAPTURE_CREDENTIALS_KEY ?? null })
                                                  : deps.credentials,
      /* R38 (N141): the one promotion on this storage, through which a requested capture enters the record. */
      promotion: deps.promotion || promotionOf(host, { record }),
      /* R14 (N295): the member-browser agent is inquiry's R44 answer. Reached when the drain asks, not at creation, so
         the one inquiry on this host is the one the plane built with its own deps. */
      inquiry: deps.inquiry || { memberUserAgent: (id) => inquiryOf(host).memberUserAgent(id) },
    };
    c = new CaptureRequests(storage, d);
    instances.set(storage, c);
    /* R35: keyed to a bundle by `target` (a bundle's purge deletes its requests), and `lead_inquiry` a pointer a
       bundle's purge clears where it names the bundle, on rows that stay (record-core R46's `clears` form, K775 (4)). */
    record.declarePurge(CAPTURE_REQUESTS_MODULE, [{ name: "capture_requests", keys: ["target"], clears: ["lead_inquiry"] }]);
    /* R35: the census counts it (record-core R63). A record with no seam (a test's stand-in) is not asked. */
    if (typeof record.registerCounts === "function") {
      const counted = record.registerCounts(CAPTURE_REQUESTS_MODULE, [...CAPTURE_REQUESTS_COUNT_KEYS], (hid) => c.counts(hid));
      if (counted && counted.ok === false)
        throw new Error(`capture-requests: record-core refused its figures: ${counted.reason}`);
    }
    d.observations.registerAuthority("sweep", (request) => {
      const b = c.bundlesOf(request);
      return b ? [b.target, b.lead_inquiry].filter(Boolean) : null;
    });
    /* R29, ai-runs R41 (K182): the wake reads this module's rows through the wait source, when ai-runs is given. */
    if (d.aiRuns && typeof d.aiRuns.registerWaitSource === "function")
      d.aiRuns.registerWaitSource(CAPTURE_REQUESTS_MODULE, c.waitSource());
  }
  return c;
}

/** The op handlers the control plane routes to (K3): `capturerequest`, `capturerequestdrain`, `capturerequests`,
 *  `capturerequestretry`. The viewer and the caller's principal come from the QUERY STRING, where the control plane
 *  stamped them, and never from the body. */
export function captureRequestsOps(c, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    capturerequest: () => c.captureRequest(b, { viewer: q("viewer"), caller: q("principal") }),
    capturerequestdrain: () => c.drain({ limit: b.limit ?? null, actor: b.actor || "consumer",
                                         now: Number.isFinite(b.now) ? b.now : null }),
    capturerequests: () => c.captureRequests({ run: q("run"), target: q("target"), state: q("state"),
                                               limit: q("limit"), viewer: q("viewer") }),
    capturerequestretry: () => c.captureRequestRetry({ request: b.request ?? q("request") },
                                                     { viewer: q("viewer"), caller: q("principal") }),
  };
}
