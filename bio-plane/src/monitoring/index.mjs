/* monitoring — the daemon's watch over what the group's standing intent names (requirements:
 * `build/requirements/monitoring.md`; Intake Doctrine §4, §6): it checks each monitored document at its own cadence and
 * records what it saw as a look and a mechanical tick, never deciding what a change means; it fires the archive
 * fallback for a source that has stopped answering; it names Drive baselines that are shells; it guards the gathering
 * grammar; and it watches the clocks of the group's actions and what its objectives rest on.
 *
 * Extracted from the legacy modules (T8, layer 10; K3, K4, K6, K23, K31, K49, K61, K72, K102): `store.mjs` (`driveShells`,
 * the monitor's look and its address type, the archive-monitor tick, the idempotence key, the cadence plan and tick,
 * the two fires, the write-time gathering arm of the promotion step, the purge entries, the routes `driveshells` and
 * `monitorlook`), `index.mjs` (`op=monitor` with `monitorCadence`, `monitorAssess` and `monitorRecordLook`, now the
 * Durable Object service `monitor`, K72 (11)), `schema.mjs` (the three tables, now `./schema.mjs`) and
 * `checks/bio-checks.mjs` (C-18.5, now `./checks.mjs`). The legacy code's comments moved with it.
 *
 * REACHED as `monitoringOf(host, deps)` (K61): one instance per host, created on the first call. At creation it creates
 * its tables and declares them to record-core's purge (R41), registers the gathering grammar with promotion (R27) and
 * with record-core's audit (R42), and registers its proposal source with intent (R33, N170).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `readImage`, `getSetting`, `evidenceStore`, `declarePurge`,
 *                                   `registerAuditCheck`; `inSight`, `viewerPredicate`; `promote`, `registerStep`.
 *   governor, provenance, capture   layer 3: `governorAdmit`/`governorReport` (through `governedFetch`); the receipt
 *                                   writer `recordReceipt`; `reachabilityThresholds`, `sourceReachability`,
 *                                   `recordSourceOutcome`.
 *   observationLog                  its one append, `observe`.
 *   intent, actions, escalation     R33 (`watchSet`, `registerSource`), R34/R44 (`pendingClocks`), R35
 *                                   (`escalationsDue`).
 *   env      the instance bindings (`SELF`, `DAEMON_TOKEN`/`ADMIN_TOKEN` through runtime-limits, `MONITOR_TICK_MS`).
 *   now      the instance clock in milliseconds (default: the wall clock).
 *   fetch    the network (default: the global `fetch`, read at each call).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` and `files` (R37); retrieval's projection columns
 * `monitor_enabled`, `monitor_frequency`, `monitor_last_checked`, `source_locator` (K75 (3)); provenance's `register`
 * and `captured_locators` (R48); capture's `source_reachability` (its R59, N166); observation-log's `observation_log`
 * (its R29). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { governorOf, governedFetch } from "../host-governor/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { substanceDigests, profilesAsText, ODF_DIGEST_MAX } from "../capture/acquire.mjs";
import { observationLogOf } from "../observation-log/index.mjs";
import { intentOf } from "../intent/index.mjs";
import { actionsOf } from "../actions/index.mjs";
import { escalationOf } from "../escalation/index.mjs";
import { unattendedCredential } from "../tokens.mjs";
import { readDriveAddress, driveBaselineRow, classifyDriveBaseline } from "../drive.mjs";
import { RENDERED_METHOD, RENDER_TICK_UNDETERMINED } from "../render.mjs";
import { detectFormat } from "../formats.mjs";
import { normalizeAddress } from "../subresources.mjs";
import { identify, doctypeFor, assess, CONTRACT } from "../../../docprofile/registry.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { parseFrontmatter, isPublicHttpsLocator, createSha256, civicosUserAgent, MONITOR_FREQ,
         DRIVE_CAPTURE_CHECKS } from "../../checks/bio-checks.mjs";
import { checkGatheringGrammar } from "./checks.mjs";
import { MONITORING_TABLES, migrateMonitoring } from "./schema.mjs";

export * from "./checks.mjs";
export { MONITORING_SCHEMA, MONITORING_TABLES, monitoringOwns } from "./schema.mjs";

/* ===========================================================   *  CAP-3: the ARCHIVE-MONITOR consumer (R20).
 *
 *  The decision half and the capture half of the archive fallback both work
 *  and are live-verified, and NOTHING invoked them: no periodic actor
 *  consulted `source_reachability` and nothing fired the fallback (the largest
 *  gap between what is built and what runs). This is the consumer that closes
 *  it: one entry in the scheduler's single reconciling alarm registry, NOT a
 *  second alarm and NOT a cron. SCHEDULER.md is the authority for why.
 *
 *  Each tick consults `sourcereach` for every document whose CURRENT failing
 *  run could reach the RULED threshold, and for those the fence finds
 *  `fallback_eligible` it fires the fallback by invoking op=acquire with
 *  via:"archive.org" and the DOCUMENT address — the SAME op a caller uses, so
 *  the two-hop grade-C chain, the re-checked eligibility fence and the
 *  provenance hop built from the CDX record that call itself fetches are all
 *  produced by one code path that cannot drift (D-112). It reaches that op over
 *  `env.SELF`, a service binding to this instance's own Worker, under a daemon
 *  credential: the archive arm is admin/probe by design, "an operator or daemon
 *  credential, never a member's".
 *
 *  D-104 is load-bearing here and was read before this was written: a governed
 *  refusal is OUR OWN politeness declining and moves no failure counter, so a
 *  self-throttled instance never trips the fallback. The exclusion lives in
 *  `recordSourceOutcome`; this tick only reads the verdict that respects it.
 *
 *  INERT unless configured. With no `env.SELF` and no daemon token the consumer
 *  contributes no wake and holds no alarm — exactly the SCHED_PROBE seam's
 *  posture — so an instance that has not wired monitoring behaves byte-for-byte
 *  as it did before. Live wiring is per-instance because THE INSTANCE NAME IS
 *  THE WORKER NAME (a static self-binding target would be wrong on a deployed
 *  slug), so it is provisioned by the installer/CONDUCT, not by this file. */
export const MONITOR_TICK_MS = 3600000;   // 1h. Cadence is the binding variable, not corpus size (ARCHIVE-FALLBACK.md).
export const MONITOR_TICK_BATCH = 50;     // eligible documents acted on per tick, bounded like TASK_DRAIN_ALARM_BATCH.

/* REC-33 / DEC-37 / D-334: the credential a fire spends is chosen by `runtime-limits.unattendedCredential(env)` (its
   R26): `bound` answers "is monitoring WIRED at all" (presence, synchronous, for the scheduler's `due`/`wake`), and
   `token()` which LIVE credential to spend (the daemon's, then the administrator's; a published value is not set).
   The stated reason a tick has nothing to spend is a SENTENCE rather than a bare code because its reader is an
   operator looking at a tick report, and the one thing they must not conclude is that the tick found no work. */
export const MONITOR_NO_LIVE_CREDENTIAL =
  "no LIVE monitoring credential: every bound credential is absent or denylisted "
  + "(tokens.mjs — publication is revocation), so this tick spent nothing rather than "
  + "firing a request the gate would refuse; rotate DAEMON_TOKEN or ADMIN_TOKEN";

/* ===========================================================   *  REC-26: MONITOR-CADENCE — op=monitor's caller, at each document's own pace.
 *
 *  The interval a document is checked at comes from ITS OWN
 *  `monitoring.frequency`, projected into `bundles.monitor_frequency`. The
 *  table below is keyed off the CATALOG's MONITOR_FREQ (imported, never
 *  copied), so a frequency word the catalog gains has to be given an interval
 *  here or it is UNSCHEDULED BY NAME — it can never quietly inherit a default,
 *  which is the failure this consumer exists to avoid.
 *
 *  Two words map to no clock, and they are reported rather than approximated:
 *    per_meeting  the cadence is a body's meeting schedule. This plane does not
 *                 hold one, and inventing 'about a fortnight' would be the
 *                 system stating a cadence it cannot derive. Undetermined is
 *                 first-class and must be STATED (CLAUDE.md).
 *    none         the document does not ask to be monitored on a clock at all.
 *  A document with monitoring.enabled true and either of those is listed in the
 *  tick's `unscheduled`, so an operator can see it is not being checked instead
 *  of assuming it is. R32's read (`monitoring`) answers the same rows to a member
 *  without waiting for a tick.
 * ================================================================== */
export const MONITOR_CADENCE_MS = Object.freeze({
  hourly:       3600000,
  daily:       86400000,
  weekly:     604800000,
  monthly:   2592000000,   // 30 days. The word names the interval; no ladder is implied.
  per_meeting:      null,  // not a clock this plane can compute — stated, never guessed
  none:             null,  // not monitored on a clock
});
/* D-65's PROVISIONAL contract intervals (BIO_Content_Framework section 6: a content
   type's monitoring contract *"also sets the expected check frequency, because a
   delisting is time-sensitive and a regulation is not"*; the framework names the ORDER
   and no interval). ONE copy: the tick's cadence (`cadenceFor`) reads this table and so
   does the cadence plan below, so the cadence a tick ANSWERS with and the cadence the plan
   SCHEDULES by cannot drift apart — which is exactly what REC-191 found they had done.
   `unmonitorable` (a shell) has no clock: watching bytes that carry no substance proves
   nothing. The words are the catalog's, checked by `monitorIntervalMs`. */
export const CONTRACT_FREQUENCY = Object.freeze({ membership: "daily", substance: "weekly", unmonitorable: null });

/* Bounded like TASK_DRAIN_ALARM_BATCH and MONITOR_TICK_BATCH: 50 is the usable
   external-subrequest budget measured for one invocation (MEASUREMENTS.md), and
   each fire in this tick spends one. */
export const MONITOR_CADENCE_BATCH = 50;
/* The floor between a wake and the next, so a document whose fire keeps failing
   re-arms the alarm at a bounded pace instead of spinning it. The task drain's
   coalescing delay, same reasoning. */
export const MONITOR_CADENCE_DELAY_MS = 1000;

/* The CATALOG decides what a frequency word is before this table decides what
   it means. A word the catalog does not know has no interval whatever this
   object happens to hold under that key — which also means no inherited
   property and no future rogue key can be read as a cadence. */
export function monitorIntervalMs(frequency) {
  if (!MONITOR_FREQ.includes(frequency)) return null;
  const v = MONITOR_CADENCE_MS[frequency];
  return typeof v === "number" ? v : null;
}

/** R14: WHICH FREQUENCY GOVERNS, and WHICH SOURCE SET IT — one rule, which the tick answers with and the plan schedules
 *  by. REC-26's authored `monitoring.frequency` stays the choice when the document states one the catalog knows; an
 *  authored word it does not know is undetermined, stated; a document stating none takes the contract of the content
 *  type the last reading found (`reading`: `{contract, content_type}`); anything else is STATED as undetermined rather
 *  than defaulted. `reading` null means nothing was read. */
export function cadenceFor(authored, reading) {
  const FREQ = MONITOR_FREQ;
  const contract = reading ? reading.contract ?? null : null;
  const contentType = reading ? reading.content_type ?? null : null;
  if (typeof authored === "string" && FREQ.includes(authored))
    return { frequency: authored, source: "authored", contract, content_type: contentType };
  if (authored != null && authored !== "")
    return { frequency: null, source: "undetermined", contract, content_type: contentType,
             why: `the document states the frequency '${String(authored)}', which is not one the catalog knows (${FREQ.join(", ")})` };
  if (!reading || !contract)
    return { frequency: null, source: "undetermined", contract: null, content_type: null,
             why: "the document states no frequency and the fetched document's content type could not be determined" };
  const f = Object.prototype.hasOwnProperty.call(CONTRACT_FREQUENCY, contract) ? CONTRACT_FREQUENCY[contract] : undefined;
  if (f === undefined || (f !== null && !FREQ.includes(f)))
    return { frequency: null, source: "undetermined", contract, content_type: contentType,
             why: `the contract '${contract}' is given no frequency the catalog knows` };
  return { frequency: f, source: "contract", contract, content_type: contentType,
           ...(f === null ? { why: "an unmonitorable document has no check clock: its bytes carry no substance to watch" } : {}) };
}

/** D-525 (R26): the Drive shell sweep's page bounds. A baseline sha's retrieval rows are one per (address, via) it was
 *  seen at — a handful. Bounded so the per-row read cannot amplify; a sha that reaches the bound is judged on what was
 *  read and SAYS it was cut. */
export const DRIVE_SHELLS_LIMIT_DEFAULT = 200;
export const DRIVE_SHELLS_LIMIT_MAX = 1000;
export const DRIVE_SHELLS_RETRIEVALS_MAX = 50;

/** R32: the most addresses one read answers. */
export const MONITORING_READ_MAX = 1000;
/** R34: the most pending clock entries one recheck reads (actions R31's page). */
export const DEADLINE_RECHECK_MAX = 500;

/** The machine viewer this module reads as: the daemon class, which D-15 leaves unfiltered. Escalation and
 *  conformance answer a call with no viewer as unseen, so every read names it (ESCALATION #1 J3). */
export const MONITOR_VIEWER = "class:daemon";
/** The author of every mechanical promotion this module writes. */
export const MONITOR_AUTHOR = "bio-monitor";

/* The catalogue's C-48 rows the Drive tick answers with (K72 (1): read in place, as capture reads the family). The
   code is a STRING LITERAL at each site so the DEC-49 guard can compare it; a code with no sentence throws. */
const driveRow = (code) => {
  const row = DRIVE_CAPTURE_CHECKS[code];
  if (!row || typeof row.translation !== "string" || !row.translation)
    throw new Error(`driveRow: ${code} has no DRIVE_CAPTURE_CHECKS row with a canned translation (DEC-49).`);
  return { code, check: row.check, translation: row.translation };
};

const hex = (buf) => [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, "0")).join("");
const sha256Hex = async (v) => hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? new TextEncoder().encode(v) : v));

/** D-65 (R11): THE MONITOR'S LOOK, as `OBSERVATION-LOG-DESIGN.md` §4.1's second row states it: *"the same vocabulary,
 *  `authority_kind = sweep`, `authority` = the named request or ratified sweep"*. A tick has no capture request; the
 *  cadence it runs under is the one the BUNDLE ratified (`monitoring.enabled`), so the authority is the bundle id —
 *  the "ratified cadence" arm of the `sweep` kind's own definition (`OBSERVATION_AUTHORITY_KINDS.sweep`). The mapping
 *  from the tick's outcome word to a state is this one pure function, so the tick and the suite read the same rule. */
export function monitorObservationFor({ outcome, baseline = null, seen = null, httpStatus = null, reason = null, scope = null,
                                        captured = null, uncaptured = null } = {}) {
  const cap = typeof baseline === "string" && /^[0-9a-f]{64}$/.test(baseline) ? baseline : null;
  /* D-567: a rendered capture's tick compares the SHELL, so its look is about the FRAME and
     the referent is the pair's shell digest; the detail says so, and says the content is
     undetermined, so the log never reads a frame match as the document unchanged. */
  const frame = scope === "frame" ? "frame " : "";
  const tail = scope === "frame" ? "; content undetermined" : "";
  switch (outcome) {
    /* The zero-payload revisit: the record's own capture, confirmed at a date. */
    case "unchanged":
      return cap ? { state: "PRESENT", resultKind: "capture", resultRef: cap, detail: `${frame}unchanged${tail}` } : null;
    /* The substance moved. D-455, BOB #32's ruling of 2026-09-23 23:08Z: the tick CAPTURES
       the served bytes and `result_ref` names the NEW capture — §4.1's own word. `captured`
       is that capture's sha ONLY when `recordLook` has found it in the register under
       this bundle; the caller's word for it is not enough. Without it the look keeps D-65's
       form — the referent is the capture it was compared against and the served sha rides in
       `detail` — and says why the bytes were not filed, because naming an uncaptured sha as a
       `capture` would be the log claiming a document the record lacks. */
    case "changed":
      if (!cap) return null;
      if (typeof captured === "string" && /^[0-9a-f]{64}$/.test(captured) && captured !== cap)
        return { state: "PRESENT", resultKind: "capture", resultRef: captured,
                 detail: `${frame}changed; captured by the monitor; compared against baseline sha256 ${cap}${tail}` };
      return { state: "PRESENT", resultKind: "capture", resultRef: cap,
               detail: `${frame}changed; served sha256 ${typeof seen === "string" ? seen : "unknown"}`
                     + (uncaptured ? `; not captured: ${String(uncaptured).slice(0, 200)}` : "") + tail };
    case "removed":
      return { state: "LOOKED_ABSENT", detail: `gone; the source answered ${httpStatus ?? "unknown"}` };
    case "unreachable":
      return { state: "LOOKED_INDETERMINATE",
               detail: `unreachable; ${String(reason || (httpStatus != null ? `the source answered ${httpStatus}` : "no answer")).slice(0, 160)}` };
    /* D-338: the source answered with a shell (the `unmonitorable` contract). A look happened and
       determined nothing about the document, so it is INDETERMINATE and never `changed`/`unchanged`. */
    case "unmonitorable":
      return { state: "LOOKED_INDETERMINATE",
               detail: `unmonitorable; the source serves a shell whose bytes carry no substance${typeof seen === "string" ? `; served sha256 ${seen}` : ""}` };
    /* D-104: our pacing held us. A fact about us; LOOKED_INDETERMINATE is the only state. */
    case "governed":
      return { state: "LOOKED_INDETERMINATE", governed: true, condition: "source-unreachable-governed",
               detail: `governed; ${String(reason || "the per-host governor held the request").slice(0, 160)}` };
    /* Anything else — a fetch with no baseline to compare, an outcome word this mapping
       does not know — writes NOTHING rather than being coerced to the nearest word. */
    default: return null;
  }
}

/** R34: the document with each named `clock[]` entry's `status: pending` rewritten to `status: overdue`, line by
 *  line, so nothing else can move (a writer that rebuilt the document from a parse would reformat it, and reformatting
 *  is a change). `ords` are the entries' positions in `clock[]`. Null when an entry named is not found pending. */
export function markOverdue(text, ords) {
  const want = new Set(ords.map(Number));
  const lines = String(text).split("\n");
  let fence = 0, inClock = false, ord = -1, entryIndent = null;
  const hit = new Set();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "---" && fence < 2) { fence++; inClock = false; continue; }
    if (fence !== 1) continue;
    if (/^[A-Za-z_]/.test(line)) { inClock = /^clock:\s*$/.test(line); ord = -1; entryIndent = null; continue; }
    if (!inClock) continue;
    const item = /^(\s*)-\s+(.*)$/.exec(line);
    if (item && (entryIndent === null || item[1].length === entryIndent)) { entryIndent = item[1].length; ord++; }
    if (!want.has(ord)) continue;
    const m = /^(\s*(?:-\s+)?)status:\s*("?)pending\2\s*$/.exec(line);
    if (m) { lines[i] = `${m[1]}status: overdue`; hit.add(ord); }
  }
  return hit.size === want.size ? lines.join("\n") : null;
}

/* The Session Log is the one body surface a mechanical writer may add to, and C-13.2 requires an entry whenever
   last_updated moves. */
function withSessionEntry(text, checked, line) {
  const entry = "### Session " + checked + "\n\n" + line + "\n";
  const at = text.indexOf("## Session Log");
  if (at < 0) return text + "\n## Session Log\n\n" + entry;
  const nxt = text.indexOf("\n## ", at + 1);
  const cut = nxt === -1 ? text.length : nxt + 1;
  return text.slice(0, cut) + entry + "\n" + text.slice(cut);
}

const clampLimit = (v, dflt, max) => { const n = Math.floor(Number(v)); return Number.isFinite(n) && n > 0 ? Math.min(n, max) : dflt; };

export class Monitoring {
  #deps;
  /* MEASURED 2026-08-04, and it is the reason the guard below exists: a tick that
     reaches op=acquire over env.SELF re-enters this same Durable Object, and that
     nested acquire ENQUEUES an inbox task for an undetermined-authority capture,
     which arms the drain one second out — so workerd fires the alarm UNDERNEATH
     the tick that is still awaiting its own fetch. Two runs of the same consumer
     then interleave. The first version of this key was wiped by exactly that: the
     re-entrant run found every subject already claimed, saw nothing fail, and
     "completed" a tick another run was still in the middle of. A tick is not
     re-entrant, and saying so in memory is right for a Durable Object — one
     instance, one isolate, the flag lives exactly as long as the tick does (R22). */
  #tickRunning = new Set();

  constructor({ storage, record, membership, promotion, host = null, env = null, now = null, fetch = null,
                governor = null, provenance = null, capture = null, observationLog = null, intent = null,
                actions = null, escalation = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : () => Date.now();
    this.#deps = { host, fetch, governor, provenance, capture, observationLog, intent, actions, escalation };
  }

  get governor() { return this.#deps.governor ||= governorOf(this.#deps.host, { env: this.env }); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  get capture() { return this.#deps.capture ||= captureOf(this.#deps.host); }
  get observationLog() { return this.#deps.observationLog ||= observationLogOf(this.#deps.host); }
  get intent() { return this.#deps.intent === undefined ? null : (this.#deps.intent ||= intentOf(this.#deps.host)); }
  get actions() { return this.#deps.actions ||= actionsOf(this.#deps.host); }
  get escalation() { return this.#deps.escalation ||= escalationOf(this.#deps.host); }
  #fetch(u, init) { return (this.#deps.fetch || globalThis.fetch)(u, init); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  migrate() { migrateMonitoring(this.sql); }

  /* ================================================================== *
   * op=monitor (R1–R10)
   * ================================================================== */

  /** N116: the combined view of the instance's active jurisdiction profiles (record-core's `jurisdiction_profiles`,
   *  `jurisdictions.combine`), passed to `identify`, `doctypeFor` and `assess`, as capture R17 passes it. An instance
   *  that has never set the setting passes none, which is docprofile's own no-view reading. */
  #view() {
    const ids = typeof this.record.getSetting === "function" ? this.record.getSetting("jurisdiction_profiles") : null;
    if (ids == null) return undefined;
    const c = combine(ids);
    return c.ok ? c.view : undefined;
  }

  /* Ask `assess` about one tick (R6). The before-side is the BASELINE'S OWN BYTES, read back from
     the capture store under the one capture key and verified against the baseline sha; each way that fails
     is a named `basis`, never a substitute. `content` is the fetched document's type and
     contract (for the cadence), determined whether or not a comparison could be made. */
  async #assess({ baseline, bytes, ctx, beforeAt, afterAt, view }) {
    if (!bytes || !ctx) return { assessment: null, content: null, basis: "the source served no document to assess" };
    const asText = profilesAsText(ctx.content_type, bytes.length, false);
    if (!asText) return { assessment: null, content: null,
      basis: "the fetched document is not read as text, and assess reads text documents only" };
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const v = view ? { view } : {};
    const id = identify({ ...ctx, text, ...v });
    const dt = doctypeFor({ ...ctx, text, handler: id.handler, kind: id.kind, ...v });
    const content = { type: id.handler.shell ? null : dt.type.key, confidence: dt.confidence,
                      contract: id.handler.shell ? CONTRACT.UNMONITORABLE : dt.type.contract };
    if (!baseline) return { assessment: null, content, basis: "no captured baseline to compare against" };
    const store = typeof this.record.evidenceStore === "function" ? this.record.evidenceStore() : null;
    if (!store)
      return { assessment: null, content, basis: "R2 is not configured on this instance, so the baseline's bytes are not reachable" };
    let before;
    try {
      const o = await store.get(baseline);
      if (!o) return { assessment: null, content, basis: "the baseline's bytes are not held under its capture key" };
      before = new Uint8Array(await o.arrayBuffer());
    } catch (e) {
      return { assessment: null, content, basis: "the baseline's bytes could not be read: " + String(e && e.message || e).slice(0, 90) };
    }
    if (createSha256().update(before).hex() !== baseline)
      return { assessment: null, content, basis: "the bytes held under the baseline's capture key do not hash to it, so they are not compared" };
    let r;
    try {
      r = await assess(before, bytes, { ...ctx, ...v, sha256: sha256Hex, before_at: beforeAt || null, after_at: afterAt, now: afterAt });
    } catch (e) {
      return { assessment: null, content, basis: "assess could not run: " + String(e && e.message || e).slice(0, 90) };
    }
    return { content, basis: `assessed against the baseline's own bytes (${baseline.slice(0, 12)}…)`,
      assessment: { verdict: r.verdict, meaningful: r.meaningful ?? null, significance: r.significance ?? null,
        stopped_at: r.stopped_at, trail: r.trail, events: r.events || [],
        content_type: r.content_type || null, confirmation: r.confirmation || null,
        connections: Array.isArray(r.connections) ? r.connections.length : 0, why: r.why || null } };
  }

  /** R25: the tick's outcome at the document address, recorded with capture's reachability (its R8), so a monitored
   *  source that stops answering reaches the fallback. A failed record does not fail the tick. */
  async #recordOutcome(addressNorm, outcome, status, at) {
    try {
      const r = await this.capture.recordSourceOutcome({ addressNorm, outcome, status, at });
      return r ?? null;
    } catch { return null; }
  }

  /** Monitoring: has the source changed under us? (R1–R10)
   *
   *  What this writes is deliberately narrow. MECHANICAL_FIELD_SETS lets a
   *  monitor-tick touch source_status, monitoring.last_checked, the three
   *  reeval_pending fields, and last_updated. It may not record the new
   *  document's hash, and that absence is the design rather than an oversight:
   *  detecting that a source moved is mechanical, deciding what the new version
   *  means is not. So the tick raises a flag and a human or a session decides
   *  whether to capture the new bytes. This is the escalation ladder in one
   *  operation.
   *
   *  It writes through promote like every other writer, marked mechanical, so
   *  C-20.1 audits it from the history diff rather than taking its word.
   *
   *  `viewer` is the caller's (the control plane's stamp; the monitor is a machine caller acting as itself, so it
   *  reads at its own credential's scope, which D-15 deliberately leaves unfiltered); `actorClass` and `actor` are
   *  the look's. Answers `{status, body}`: the HTTP status the control plane answers with, and the answer. */
  async monitor({ bundleId = null, viewer = null, actorClass = "machine", actor = null } = {}) {
    const op = "monitor";
    const answer = (body, status = 200) => ({ status, body });
    if (typeof bundleId !== "string" || !bundleId)
      return answer({ ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument: "bundleId",
                      shape: "a non-empty string in the POST body", error: "monitor needs a bundleId",
                      detail: "op=monitor needs 'bundleId' in the shape a non-empty string in the POST body, and this request "
                            + "carried none the operation could use. Nothing was changed." }, 400);
    /* REC-52 / REC-25: a bundle absent and one the viewer may not SEE are the same answer, `ABSENT`: the fail-closed
       read. A store silence is the control plane's to name (this service runs inside the store). */
    const img = this.membership.inSight(bundleId, viewer) ? this.record.readImage(bundleId) : null;
    if (!img || typeof img["bundle.md"] !== "string")
      return answer({ ok: false, reason: "ABSENT", bundleId }, 404);
    const live = img["bundle.md"];
    const fm = parseFrontmatter(live).data || {};
    if (!fm.monitoring || fm.monitoring.enabled !== true)
      return answer({ ok: false, reason: "NOT_MONITORED",
                      detail: "this bundle does not ask to be monitored" }, 409);
    const locator = fm.source?.locator;
    if (typeof locator !== "string" || !isPublicHttpsLocator(locator))
      return answer({ ok: false, reason: "NO_LOCATOR",
                      detail: "monitoring needs a public https locator in source.locator" }, 409);

    /* D-472 — A TICK ON A DRIVE-LINKED DOCUMENT WATCHES THE EXPORT, NEVER THE PAGE.
     *
     * THE DEFECT THIS ENDS. `op=acquire` routes a Drive link through
     * `readDriveAddress` and captures the OpenDocument export (CAP-8, Bob's
     * ruling of 2026-09-14); this tick fetched `source.locator` ITSELF, which
     * for a Drive document is Google's client-rendered APPLICATION SHELL. Its
     * bytes are rebuilt per render, so the comparison ran raw against an
     * OpenDocument baseline and read `modified` EVERY TICK: a monitor crying
     * wolf on a document nobody had touched, which is the record claiming more
     * than it can support (CLAUDE.md §2) rather than a missing feature.
     *
     * The BASELINE needs no translation: acquire files a Drive capture under
     * the DOCUMENT address (`documentAddress`), which is the address the bundle
     * carries and the address this tick looks up and logs its look against. Only
     * the FETCH moves, exactly as it does in acquire.
     *
     * THE SHAPES THAT ARE NOT DOCUMENTS ARE NAMED, NEVER SKIPPED — the whole of
     * CAP-8's rule, and the reason these are refusals with codes rather than a
     * fall-through to the ordinary fetch. A tick on a folder address would
     * compare Google's LISTING page, whose bytes move on every render, and
     * announce a change to a member on every visit. `published` is recognised
     * in order to be LEFT ALONE: it serves static HTML that is already an honest
     * document, so it takes the ordinary path here as it does in acquire. */
    const driveTick = readDriveAddress(locator);
    if (driveTick && driveTick.shape === "folder")
      return answer({ ok: false, reason: "DRIVE_FOLDER_NOT_A_DOCUMENT",
        ...driveRow("DRIVE_FOLDER_NOT_A_DOCUMENT"), op, bundleId,
        drive: { host: driveTick.host, shape: driveTick.shape, harvestable: false },
        locator: driveTick.address,
        detail: driveTick.why + " Watching it is the same question one step on: a tick would compare "
              + "Google's listing page, whose bytes are rebuilt on every render, and report a change "
              + "nobody made." }, 422);
    if (driveTick && driveTick.shape === "file")
      return answer({ ok: false, reason: "DRIVE_KIND_UNDETERMINED",
        ...driveRow("DRIVE_KIND_UNDETERMINED"), op, bundleId,
        drive: { host: driveTick.host, shape: driveTick.shape, harvestable: false,
                 ...(driveTick.fileId ? { file_id: driveTick.fileId } : {}) },
        locator: driveTick.address,
        detail: driveTick.why + " No export address can be composed, so there is nothing this tick "
              + "could compare but the application page." }, 422);
    if (driveTick && driveTick.shape === "unknown")
      return answer({ ok: false, reason: "DRIVE_SHAPE_UNRECOGNISED",
        ...driveRow("DRIVE_SHAPE_UNRECOGNISED"), op, bundleId,
        drive: { host: driveTick.host, shape: driveTick.shape, harvestable: false },
        locator: driveTick.address,
        detail: driveTick.why + " A shape this instance cannot read is a shape it cannot promise to "
              + "be watching." }, 422);
    /* The address the tick FETCHES, which is the export for a harvestable Drive
       document and the locator itself for everything else. The document address
       stays `locator` throughout — the baseline, the observation log's subject
       and the answer all key on it. */
    const tickAddress = driveTick && driveTick.harvestable ? driveTick.exportAddress : locator;
    const addressNorm = normalizeAddress(locator);

    /* The baseline is whatever the provenance register says was captured from
       this locator (R3). Without one there is nothing to compare against, and the
       tick says so rather than guessing at a status. */
    let baseline = null, baselineProfile = null, baselineAt = null, renderTick = false;
    try {
      const reg = JSON.parse(img["data/provenance.json"] || "{}");
      const rows = (reg.documents || []).filter((d) => d && typeof d.locator === "string");
      /* D-472, AND IT IS A MEASURED PROPERTY OF THE REGISTER RATHER THAN A
         GUESS. `op=acquire` answers `document.locator` as the address it
         FETCHED — for a Drive capture the export address it composed, the same
         way an archive capture answers the replay URL — while the capture is
         FILED under the document address. A caller builds `data/provenance.json`
         out of that answer (the shape C-18.1 requires), so the register row for a
         Drive document names the EXPORT address and a lookup on the bundle's own
         `source.locator` finds nothing and the tick reports "no captured
         baseline" forever. The export row is preferred over a document-address
         row because it is the one whose bytes are comparable with what this tick
         now fetches: a pre-CAP-8 capture at the document address holds the
         application shell. */
      /* D-524, THE SAME DEFECT ON THE ARCHIVE ARM: an archive-sourced row names
         the WAYBACK REPLAY URL as its locator, so the last fallback is the row
         whose `archive.org` hop names this document — `archiveHop`'s
         `document_address`, the CDX original the plane read. It comes AFTER the
         exact-locator row, never before: a direct capture of the address is the
         same fetch this tick makes, one hop and grade B, and the archive's is
         the one to compare against only when no direct capture is held. The
         comparison is in `normalizeAddress`'s form, the form the capture was
         filed under. Scoped to the archive hop: a Drive row is D-472's clause
         above, and D-525's pre-CAP-8 shells are rows at `locator` itself. */
      const namesThis = (d) => Array.isArray(d.provenance_chain) && d.provenance_chain.some((h) =>
        h && h.via === "archive.org" && typeof h.document_address === "string"
          && normalizeAddress(h.document_address) === addressNorm);
      const match = (driveTick && driveTick.harvestable
          ? rows.find((d) => d.locator === driveTick.exportAddress) : null)
        || rows.find((d) => d.locator === locator)
        || rows.find(namesThis);
      /* D-567 — A RENDERED CAPTURE IS WATCHED BY ITS SHELL, NEVER BY ITS RENDERED PRIMARY
       * (CLIENT-RENDERED.md, "RULED 2026-09-25 by BOB #34"). This tick fetches the
       * SERVED document and cannot render, so on a render:true capture what it holds is
       * a fresh SHELL; `capture.sha256` there names the RENDERED document (BOB #32 item
       * 2), and comparing the two would read `modified` on every tick for a change
       * nobody made — D-472's cry-wolf, one arm over. The comparable baseline is the
       * pair's own `shell.sha256`. A rendered row that names no shell digest has NO
       * baseline, stated, and never falls back to the rendered digest. The profile is
       * the rendered document's, so it is not carried: D-60's evidentiary comparison
       * does not apply to a shell. */
      renderTick = !!match && ((match.pair && typeof match.pair === "object" && match.pair.primary === "rendered")
        || (match.capture && match.capture.method === RENDERED_METHOD));
      if (renderTick) {
        const shellSha = match.pair && match.pair.shell && match.pair.shell.sha256;
        baseline = typeof shellSha === "string" && /^[0-9a-f]{64}$/.test(shellSha) ? shellSha : null;
      } else baseline = match?.capture?.sha256 || null;
      baselineAt = typeof match?.retrieved === "string" ? match.retrieved : null;
      baselineProfile = !renderTick && match && match.profile && typeof match.profile === "object" ? match.profile : null;
    } catch { /* C-14.3 reports unparsable JSON; monitoring just has no baseline */ }

    const checked = stampInstant("second", this.now());
    const view = this.#view();
    let status = null, note = null, seen = null, compared = null, comparedBasis = null, frame = null;
    /* D-65 — what `assess` said, the type the fetched document reads as, and the look. */
    let httpStatus = null, fetchedBytes = null, fetchedCtx = null, unreachable = null;
    const monitorLook = (o) => this.recordLook({ bundleId, address: addressNorm, locator,
      baseline, seen, httpStatus, ...(renderTick ? { scope: "frame" } : {}), ...o, actorClass, actor });
    try {
      /* D-95: a monitor tick is a document fetch and paces like one. A
         governed refusal is a tick outcome with a name, not an error: the
         check simply did not run, and saying so beats a fabricated status. */
      const gov = this.governor;
      const g = await governedFetch(tickAddress, {
        userAgent: civicosUserAgent((this.env && this.env.VERSION) || "0.0.0", (this.env && this.env.INSTANCE_NAME) || "unnamed", "monitor"),
        fetch: (u, i) => this.#fetch(u, i),
        governor: gov ? { admit: (q) => gov.governorAdmit(q), report: (q) => gov.governorReport(q) } : null });
      if (g.refusedByGovernor) {
        /* D-65: a governed tick is still a look, and §4.1 says so with `governed = 1`. R25, R39: it is recorded apart
           and never counts as the source failing. */
        const observation = monitorLook({ outcome: "governed", reason: g.reason });
        await this.#recordOutcome(addressNorm, "governed", null, checked);
        return answer({ ok: false, reason: "HOST_COOLING_OFF",
                        detail: `the per-host governor is holding requests to this host (${g.reason}); retry in about ${Math.ceil((g.retry_in_ms || 0) / 1000)}s`,
                        retry_in_ms: g.retry_in_ms || 0, locator,
                        /* D-472: the governed host is the EXPORT's when a Drive document is
                           watched, and `docs.google.com` is not the host the bundle names. */
                        ...(driveTick && driveTick.harvestable ? { fetched_address: tickAddress } : {}),
                        observation }, 429);
      }
      const res = g.res;
      httpStatus = res.status;
      /* R25: what the source did, recorded against the document address as acquire records it. */
      await this.#recordOutcome(addressNorm, res.ok ? "success" : "source_refused", res.status, checked);
      /* D-472: WHICH ADDRESS ANSWERED. For a Drive document that is the export
         address this instance composed, and a note naming the document address
         for a status the export returned would misattribute it. */
      const answered = driveTick && driveTick.harvestable
        ? `the OpenDocument export address ${driveTick.exportAddress} answered ${res.status}`
        : `the source answered ${res.status}`;
      /* DEC-49 REGION is-drive-tick-export
       *
       * THE SPAN `DRIVE_TICK_EXPORT_IS_THE_SHELL` names (C-48.8), and nothing
       * else. Google answers the export address with `text/html` — a sign-in
       * page, an error page, the app — when the file is no longer shared with
       * anyone who has the link, and it answers 200 while doing it, so the
       * status branch below cannot see it.
       *
       * WHAT A TICK DOES WITH IT, AND IT IS NOT WHAT `op=acquire` DOES. Acquire
       * refuses a CAPTURE; here there is nothing to file and everything to
       * misreport. The shell's bytes are not the document, so comparing them
       * against the captured document would answer `modified` on this visit and
       * every later one. The check simply did not run, which is a tick outcome
       * with a name (D-95's rule for a governed refusal, one condition over):
       * the LOOK is recorded as `unreachable` with the reason, the document's
       * own `source_status` and `last_checked` are left exactly as they were,
       * and the refusal says which address answered and how. */
      if (driveTick && driveTick.harvestable && res.ok) {
        /* THE PREDICATE IS NAMED HERE RATHER THAN SPELLED AS `op=acquire`'s TWIN: a control driver
           arms acquire's declared-type check by quoting its line verbatim (`test/drive.control.mjs`
           arm 4a), and a byte-identical copy would make that exactly-once patch ambiguous. */
        const declaredType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
        const servedAsPage = declaredType === "text/html" || declaredType === "application/xhtml+xml";
        if (servedAsPage) {
          try { await res.body?.cancel?.(); } catch { /* the source may already be gone */ }
          const observation = monitorLook({ outcome: "unreachable",
            reason: `the Drive export address answered \`${declaredType}\`, which is the application shell` });
          return answer({ ok: false, reason: "DRIVE_TICK_EXPORT_IS_THE_SHELL",
            ...driveRow("DRIVE_TICK_EXPORT_IS_THE_SHELL"), op, bundleId, status: res.status,
            locator: driveTick.address, export_address: driveTick.exportAddress,
            declared_content_type: declaredType, refused_on: "the declared content type",
            drive: { host: driveTick.host, shape: driveTick.shape, kind: driveTick.kind,
                     file_id: driveTick.fileId, export_format: driveTick.format },
            observation,
            detail: `the OpenDocument export address answered with \`${declaredType}\`, which is the Google Drive `
                  + `APPLICATION — a client-rendered shell whose bytes carry no document (framework Part I `
                  + `§6's UNWATCHABLE case). It is not compared against the capture: its bytes are rebuilt on `
                  + `every render, so a comparison would report this document changed today and on every `
                  + `later visit. Nothing about the record moved, and the look is logged as indeterminate. `
                  + `Google serves this when the file is no longer shared with anyone who has the link.` }, 502);
        }
      }
      /* END DEC-49 REGION is-drive-tick-export */
      if (res.status === 404 || res.status === 410) { status = "removed"; note = answered; }
      else if (!res.ok) { note = answered; unreachable = note; }
      else {
        const bytes = new Uint8Array(await res.arrayBuffer());
        /* DEC-49 REGION is-drive-tick-bytes
         *
         * THE SPAN `DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL` names (C-48.9), and
         * nothing else. C-48.7's reasoning one op over: detection is BYTES-FIRST
         * and certain (COFF-1's registry doctrine), so Google's declared type
         * need not be trusted at all, and a shell arriving under a LYING content
         * type is the more serious finding and carries its own code. Both arms
         * are drivable — the declared-type one from the header, this one from the
         * first kibibyte — which is the whole of PL-4's rule. */
        if (driveTick && driveTick.harvestable) {
          /* `sniffed`, not `sniff`, for the reason named at the declared-type arm above. */
          const sniffed = detectFormat(bytes.subarray(0, Math.min(bytes.length, 1024)), null);
          const servedType = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
          if (sniffed.format === "html") {
            const observation = monitorLook({ outcome: "unreachable",
              reason: `the Drive export address served HTML under \`${servedType || "no content type"}\`` });
            return answer({ ok: false, reason: "DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL",
              ...driveRow("DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL"), op, bundleId, status: res.status,
              locator: driveTick.address, export_address: driveTick.exportAddress,
              declared_content_type: servedType || null,
              refused_on: "the bytes", detected: sniffed,
              drive: { host: driveTick.host, shape: driveTick.shape, kind: driveTick.kind,
                       file_id: driveTick.fileId, export_format: driveTick.format },
              observation,
              detail: `the OpenDocument export address served bytes that are HTML — ${sniffed.signals.join("; ")} `
                    + `— while declaring otherwise. That is the Google Drive APPLICATION, not the document, and `
                    + `the declared type did not say so. It is not compared against the capture: the shell is `
                    + `rebuilt on every render, so the comparison would report a change nobody made. Nothing `
                    + `about the record moved, and the look is logged as indeterminate.` }, 502);
          }
        }
        /* END DEC-49 REGION is-drive-tick-bytes */
        seen = await sha256Hex(bytes);
        fetchedBytes = bytes;
        { const hh = {}; for (const [hk, hv] of res.headers) hh[hk.toLowerCase()] = hv;
          fetchedCtx = { headers: hh, locator, content_type: res.headers.get("content-type") || null }; }
        if (renderTick) {
          /* D-567 / BOB #34 (b): the FRAME is compared, raw, with the pair's shell digest,
             and the CONTENT is undetermined on every tick, match or not. A match moves no
             `source_status`: "unchanged" there would read as the document being stable,
             which is exactly what a shell cannot say. A difference is a D-472 `modified`
             about the frame only, and says so. */
          if (!baseline)
            note = "the capture is rendered and its register row names no shell digest (pair.shell.sha256), "
                 + "so nothing was compared; " + RENDER_TICK_UNDETERMINED;
          else {
            compared = "shell";
            comparedBasis = "the served shell was compared with the pair's shell digest (pair.shell.sha256), "
                          + "never with the rendered primary's; this tick cannot render";
            if (seen === baseline) { frame = "unchanged"; note = "frame unchanged; " + RENDER_TICK_UNDETERMINED; }
            else { frame = "changed"; status = "modified";
                   note = "modified (frame): the source no longer serves the captured shell; " + RENDER_TICK_UNDETERMINED; }
          }
        } else if (!baseline) note = "no captured baseline to compare against; recorded the check only";
        else {
          /* D-60 — MONITORING ASKS "HAS THE SUBSTANCE CHANGED?" (DOCUMENT-PROFILES.md,
             "Three digests, not one"), and on an ASP.NET page the raw bytes answer
             "yes" on every fetch because __VIEWSTATE is rebuilt per render. So the
             EVIDENTIARY digest is compared — but only when BOTH sides earned one: the
             baseline's register row recorded it as `determined`, and the fetched bytes
             normalise under the SAME handler (key and version) with certainty, through
             `substanceDigests`, the one function op=acquire recorded the baseline's
             with. Anything short of that compares RAW, the conservative direction the
             failure asymmetry requires, and the answer says which comparison it made
             and why. */
          const bd = baselineProfile && baselineProfile.digests;
          if (!bd || bd.determined !== true || typeof bd.evidentiary !== "string" || !bd.evidentiary)
            comparedBasis = "the captured baseline recorded no determined evidentiary digest, so the raw bytes were compared";
          else {
            const ct = res.headers.get("content-type");
            const asText = profilesAsText(ct, bytes.length, false);
            const headers = {};
            for (const [hk, hv] of res.headers) headers[hk.toLowerCase()] = hv;
            const profCtx = { headers, locator, content_type: ct || null,
                              text: asText ? new TextDecoder("utf-8", { fatal: false }).decode(bytes) : "",
                              ...(view ? { view } : {}) };
            const stackId = identify(profCtx);
            const fresh = await substanceDigests(asText ? bytes : null, stackId, profCtx, seen, false,
                                                 asText || bytes.length > ODF_DIGEST_MAX ? null : bytes);
            /* D-351: a container digest is compared only with a container digest
               over the SAME member; a text-arm baseline has no `over`. */
            const bdOver = bd.over || null, freshOver = fresh.over || null;
            if (bdOver !== freshOver)
              comparedBasis = `the baseline's evidentiary digest was taken over ${bdOver || "the normalised text"} but the fetched bytes' over ${freshOver || "the normalised text"}, so the raw bytes were compared`;
            else if (stackId.handler.key !== baselineProfile.handler || stackId.handler.version !== baselineProfile.handler_version)
              comparedBasis = `the fetched bytes identify as ${stackId.handler.key} v${stackId.handler.version} but the baseline was normalised under ${baselineProfile.handler} v${baselineProfile.handler_version}, so the raw bytes were compared`;
            else if (!fresh.determined)
              comparedBasis = `the fetched bytes' substance digest is undetermined (${fresh.basis}), so the raw bytes were compared`;
            else {
              compared = "evidentiary";
              comparedBasis = freshOver
                ? `the evidentiary digests were compared, both taken over the package's ${freshOver} (${fresh.basis})`
                : `the evidentiary digests were compared, both normalised under ${stackId.handler.key} v${stackId.handler.version} (certain)`;
              if (fresh.evidentiary !== bd.evidentiary) { status = "modified"; note = "the substance of the source differs from the capture"; }
              else if (seen === baseline) { status = "unchanged"; note = "the source still serves the captured bytes"; }
              else { status = "unchanged";
                     note = fresh.rendition != null && fresh.rendition === bd.rendition
                       ? "the substance is unchanged; only machinery the source rebuilds on every visit differs from the capture"
                       : "the substance is unchanged; machinery or furniture around it differs from the capture"; }
            }
          }
          if (compared !== "evidentiary") {
            compared = "raw";
            if (seen === baseline) { status = "unchanged"; note = "the source still serves the captured bytes"; }
            else { status = "modified"; note = "the source no longer serves the captured bytes"; }
          }
        }
      }
    } catch (e) {
      note = "the source could not be reached: " + String(e && e.message || e).slice(0, 90);
      unreachable = note;
      /* R25: a fetch that failed is the source failing, unless nothing was fetched at all (a governed refusal
         returned above; a throw after the status was recorded is not a second outcome). */
      if (httpStatus === null) await this.#recordOutcome(addressNorm, "fetch_failed", null, checked);
    }

    /* D-65 — ASK `assess` (BIO_Content_Framework §6, "One public function") THROUGH THE
       CAPTURE'S HANDLER AND CONTENT TYPE, with the baseline's OWN BYTES read back from the capture store
       under the one capture key and verified by hash: a before-side the record does not
       hold is not compared. Its trail says where reasoning stopped; its events are graded
       from the shared catalogue. Absent bytes are STATED, never approximated. */
    const graded = await this.#assess({ baseline, bytes: fetchedBytes, ctx: fetchedCtx,
      beforeAt: baselineAt, afterAt: checked, view });
    const cadence = cadenceFor(fm.monitoring.frequency, graded.content
      ? { contract: graded.content.contract, content_type: graded.content.type } : null);

    /* D-338 — AN UNMONITORABLE DOCUMENT GRADES NO CHANGE (R7; BIO_Content_Framework §6: `unmonitorable`
       is the contract of a shell, and L1 settles a shell as UNWATCHABLE "and say so"). The comparison
       above ran on bytes that carry no substance, so neither of its answers is a finding about the
       document: `modified` is a per-render nonce moving, and `unchanged` is the false comfort the
       client_rendered handler names ("monitoring will report 'unchanged' forever"). The status is
       withdrawn, the look is logged INDETERMINATE, and the note says why. A 404 is not touched: a
       gone address is a finding whatever it served. */
    /* CONDUCT #22 (c22-batch29), composing D-338 with D-567: a RENDERED capture's tick is excluded.
       There the shell IS the compared frame by BOB #34 (b) — a frame difference is a D-472 `modified`
       about the frame only, with the content already stated undetermined — and that more specific
       ruling governs; D-338 withdraws the status of a shell captured as the document itself. */
    const unmonitorable = !renderTick && !!graded.content && graded.content.contract === CONTRACT.UNMONITORABLE
      && (status === "modified" || status === "unchanged");
    if (unmonitorable) {
      status = null;
      note = "the source serves a shell whose bytes carry no substance (unmonitorable), so no change is graded";
    }

    /* D-455 — A `changed` TICK CAPTURES THE BYTES IT FETCHED (R9; BOB #32, 2026-09-23 23:08Z;
       OBSERVATION-LOG-DESIGN.md §4.1). The tick already HOLDS them — it hashed them to see the
       change — so discarding them discarded evidence the record had in hand, and the look could
       only point at the baseline. They are held here under the one capture key, exactly as
       fetched and hashed (the fetch above went through the per-host governor, so the capture is
       governed with it and no second request is made), and the promotion below files them in
       this bundle's `snapshots/` — the mechanical envelope C-20.1 already admits for a sweeping
       writer — with a register row, so the observation can name a capture the record HOLDS.
       Every way that fails is STATED on the look and in the answer, and the look then falls back
       to D-65's form (the baseline, the served sha in `detail`): an uncaptured sha is never named
       as a capture. */
    let monCap = null;
    /* CONDUCT #22 (c22-batch29), composing D-455 with D-567: a RENDERED capture's tick fetched the
       SHELL, and its `modified` is about the frame only (BOB #34 (b)); filing that shell as the
       monitor's new capture would have the look name a new version of a document the tick never
       rendered. So a render tick captures nothing and keeps D-567's frame form. */
    if (status === "modified" && !renderTick && fetchedBytes && seen && seen !== baseline) {
      const leaf = (locator.split("?")[0].split("/").pop() || "capture").replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 80) || "capture";
      monCap = { sha256: seen, file: `snapshots/monitor-${seen.slice(0, 12)}-${leaf}`, bytes: fetchedBytes.length,
                 content_type: fetchedCtx?.content_type || null, retrieved: checked, fetched_address: tickAddress,
                 taken_by: "op=monitor, from the bytes this tick fetched through the per-host governor",
                 held: false, existed: null, registered: false, why: null };
      const store = typeof this.record.evidenceStore === "function" ? this.record.evidenceStore() : null;
      if (!store)
        monCap.why = "R2 is not configured on this instance, so the served bytes could not be held";
      else {
        try {
          monCap.existed = !!(await store.head(seen));
          if (!monCap.existed) await store.put(seen, fetchedBytes);
          monCap.held = true;
        } catch (e) {
          monCap.why = "the served bytes could not be written to R2: " + String(e && e.message || e).slice(0, 90);
        }
      }
    }

    /* THE LOOK, written to the observation log (OBSERVATION-LOG-DESIGN.md §4.1). */
    const lookArgs = {
      outcome: unmonitorable ? "unmonitorable"
             : status === "unchanged" || frame === "unchanged" ? "unchanged" : status === "modified" ? "changed"
             : status === "removed" ? "removed" : unreachable ? "unreachable" : "unbaselined",
      reason: unreachable,
      /* REC-191: only a look that READ a document says what the document is; an
         unreachable or gone source leaves the address's reading as it was. */
      ...(fetchedBytes ? { content: graded.content, contentBasis: graded.basis } : {}) };
    /* D-455: a look that captured is written AFTER the promotion that registers the capture, so
       the look can check the register rather than take the tick's word for it. */
    const lookAfterPromote = !!(monCap && monCap.held);
    let observation = lookAfterPromote ? null
      : monitorLook(monCap ? { ...lookArgs, uncaptured: monCap.why } : lookArgs);

    /* Rewrite ONLY the permitted fields, line by line, so nothing else can
       move by accident. A mechanical writer that rebuilt the document from a
       parse would reformat it, and reformatting is a change. */
    /* D-65: a substance change `assess` SETTLED as not meaningful for its type (a calendar's
       window moving: `routine`; furniture: `restyled`) raises no re-evaluation. Every other
       verdict — `changed`, `undetermined`, or no assessment at all — keeps D-60's flag, the
       conservative direction. (`unwatchable` no longer reaches here as `modified`: D-338
       withdraws a shell's status above, so a shell raises no flag unless its address is gone.) */
    const settledQuiet = !!graded.assessment
      && ["identical", "unchanged", "restyled", "routine"].includes(graded.assessment.verdict);
    const flags = status === "removed" || (status === "modified" && !settledQuiet);
    const out = [];
    let fence = 0, inMon = false, inRe = false;
    for (const line of live.split("\n")) {
      if (line === "---" && fence < 2) { fence++; inMon = inRe = false; out.push(line); continue; }
      if (fence === 1) {
        if (/^[a-zA-Z_]/.test(line)) { inMon = /^monitoring:/.test(line); inRe = /^reeval_pending:/.test(line); }
        if (status && /^source_status:/.test(line)) { out.push("source_status: " + status); continue; }
        if (/^last_updated:/.test(line)) { out.push("last_updated: " + checked); continue; }
        if (inMon && /^\s+last_checked:/.test(line)) { out.push("  last_checked: " + checked); continue; }
        if (inRe && flags && /^\s+flag:/.test(line)) { out.push("  flag: true"); continue; }
        if (inRe && flags && /^\s+since:/.test(line)) { out.push("  since: " + checked); continue; }
        if (inRe && flags && /^\s+source:/.test(line)) { out.push("  source: source_status"); continue; }
      }
      out.push(line);
    }
    let text = out.join("\n");
    if (!/^\s+last_checked:/m.test(text) && /^monitoring:/m.test(text))
      text = text.replace(/^monitoring:/m, "monitoring:\n  last_checked: " + checked);

    /* The Session Log is the one body surface a mechanical writer may add to,
       and C-13.2 requires an entry whenever last_updated moves. D-455: the entry is
       composed once per promotion ATTEMPT, because it says whether the served bytes
       were filed, and a promotion retried without the capture must not say they were. */
    const head = text;
    const withEntry = (capLine) => withSessionEntry(head, checked, "Monitor tick: " + (note || "checked")
      + (compared ? ` (compared ${compared})` : "")
      /* D-472: the durable record says WHICH bytes were compared. A Drive tick
         reads Google's export, not the page at the document's own address, and
         a Session Log that does not say so leaves a reader to assume the page. */
      + (driveTick && driveTick.harvestable
          ? ` — fetched ${driveTick.exportAddress}, the OpenDocument export this instance composed `
            + `from the Drive ${driveTick.kind} in ${driveTick.address}`
          : "") + (capLine ? ` — ${capLine}` : ""));

    const carried = [];
    for (const [path, v] of Object.entries(img)) {
      if (path === "bundle.md" || path.startsWith("_history/")) continue;
      if (typeof v === "string")
        carried.push({ path, text: v, bytes: new TextEncoder().encode(v).length, sha256: await sha256Hex(v) });
      else carried.push({ path, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes });
    }
    const liveSha = await sha256Hex(live);
    const stamp = checked.replace(/[-:]/g, "") + "_" +
      [...crypto.getRandomValues(new Uint8Array(4))].map((x) => x.toString(16).padStart(2, "0")).join("");

    /* D-455: the capture joins the image as a blob under `snapshots/` with its register row,
       unless the image already carries those bytes (a later tick seeing the same new bytes), in
       which case the bundle already holds and registers them and nothing is added twice. */
    const capCarried = !!(lookAfterPromote && carried.some((f) => f.sha256 === monCap.sha256));
    const promoteWith = async (withCap) => {
      const text2 = withEntry(!monCap ? null
        : withCap ? `the served bytes were captured as ${monCap.file} (sha256 ${monCap.sha256})`
        : `the served bytes (sha256 ${monCap.sha256}) were not filed: ${monCap.why}`);
      const addCap = withCap && !capCarried;
      return await this.promotion.promote({
        bundleId, base: liveSha, snapKey: stamp, author: MONITOR_AUTHOR,
        writer: "mechanical", operation: "monitor-tick",
        /* D-436: no `group` — a tick is a REVISION, and the store keeps the group the document's creation wrote. */
        meta: { object_type: fm.object_type,
                title: fm.title, current_state: fm.current_state, prior_state: fm.prior_state ?? null,
                created: fm.created, last_updated: checked },
        /* Every OTHER file carried forward untouched. promote writes a whole
           image, so a writer that mentions one file deletes the rest: the first
           version of this tick removed the provenance register, which took the
           monitoring baseline with it and left an information@2 bundle with no
           register at all. A mechanical writer silently destroying evidence is
           the worst thing in this system, and the shape of promote made it the
           DEFAULT behaviour of a careless caller. */
        files: [
          { path: "bundle.md", text: text2, bytes: new TextEncoder().encode(text2).length, sha256: await sha256Hex(text2) },
          ...carried,
          ...(addCap ? [{ path: monCap.file, blobSha: monCap.sha256, sha256: monCap.sha256, bytes: monCap.bytes }] : []),
        ],
        register: addCap ? [{ sha256: monCap.sha256, path: monCap.file, encoding: "binary", bytes: monCap.bytes }] : [],
      });
    };
    /* D-455: the FIRST attempt is its own name, and `promoted` is only ever the attempt that stands. */
    const first = await promoteWith(lookAfterPromote);
    let promoted = first;
    if (lookAfterPromote) {
      /* A promotion REFUSED with the capture in it is retried once without it, so the tick is still
         recorded; the refusal is kept as the reason the bytes were not filed. The one refusal this is
         for is D-179's (C-53.13): those bytes are already another bundle's capture, and one capture
         has one home. */
      if (first && first.ok === false) {
        monCap.why = `the promotion filing them was refused (${first.reason || first.code || "no reason given"}`
          + `${first.detail ? `: ${String(first.detail).slice(0, 160)}` : ""})`;
        promoted = await promoteWith(false);
      } else if (first?.ok) monCap.registered = true;
      observation = monitorLook(monCap.registered
        ? { ...lookArgs, captured: { sha256: monCap.sha256, retrieved: monCap.retrieved,
                                     retrievalLocator: monCap.fetched_address } }
        : { ...lookArgs, uncaptured: monCap.why });
      /* The OUTCOME, not the intent: `registered` is what the register check let the
         look name, so a promotion that landed without filing the capture cannot read as filed. */
      if (monCap.registered && !(observation && observation.captured === monCap.sha256)) {
        monCap.registered = false;
        monCap.why = (observation && observation.uncaptured) || "the observation log did not name the capture";
      }
    }

    return answer({
      ok: !!promoted?.ok,
      checked, status, note, baseline, seen,
      /* D-60: WHICH comparison the status rests on — "evidentiary" or "raw", null
         when none was made (no baseline, or the source did not answer) — and why. */
      compared, compared_basis: comparedBasis,
      /* D-567: on a rendered capture the verdict is about the FRAME, and the content is
         UNDETERMINED on every tick — stated in those words, never inferred from a match. */
      ...(renderTick ? { frame, content: "undetermined", undetermined: [RENDER_TICK_UNDETERMINED] } : {}),
      /* D-65: the layered verdict (`stopped_at`, `trail`, graded `events`), or null with
         `assessment_basis` saying why none was made; the cadence and which source set it;
         and the look as the observation log recorded it. */
      assessment: graded.assessment, assessment_basis: graded.basis,
      cadence, observation,
      /* D-455: on a `changed` tick, the capture of the served bytes — its sha, the file it was
         filed as, whether it was held and registered, and why not when it was not. Null on
         every other tick, which captures nothing. */
      capture: monCap ? { sha256: monCap.sha256, file: monCap.registered ? monCap.file : null,
                          bytes: monCap.bytes, content_type: monCap.content_type, retrieved: monCap.retrieved,
                          fetched_address: monCap.fetched_address, taken_by: monCap.taken_by,
                          held: monCap.held, existed: monCap.existed, registered: monCap.registered,
                          why: monCap.registered ? null : monCap.why } : null,
      /* D-472: for a Drive-linked document, which address this tick actually
         fetched and the three facts the plane derived to compose it. Absent for
         every other document, where the locator is the address. */
      ...(driveTick && driveTick.harvestable
        ? { drive: { document_address: driveTick.address, export_address: driveTick.exportAddress,
                     kind: driveTick.kind, file_id: driveTick.fileId, export_format: driveTick.format },
            fetched_address: tickAddress }
        : {}),
      reeval_raised: flags,
      ...(promoted?.ok ? { revision: promoted.bundleSha } : { reason: promoted?.reason, detail: promoted?.detail }),
      note2: "A tick records that the source moved. It does not capture the new version: what a change MEANS is not a mechanical judgement.",
    }, promoted?.ok ? 200 : 409);
  }

  /* ================================================================== *
   * The look (R11–R13)
   * ================================================================== */

  /** R11, R12: the look, one observation row through observation-log's one append. `actorClass`/`actor` are the
   *  caller's, as the control plane stamped them. */
  recordLook({ bundleId = null, address = null, outcome = null, baseline = null, seen = null,
               httpStatus = null, reason = null, scope = null, actorClass = "plane", actor = null,
               locator = null, content = undefined, contentBasis = null,
               captured = null, uncaptured = null } = {}) {
    if (!bundleId || !address) return { ok: false, written: false, why: "a monitor look needs a bundle and an address" };
    /* REC-191: the type this look read the address as, kept BEFORE the observation's own
       early returns, because a look with no baseline to compare still read what the
       document is. `content` absent means the caller read nothing (a governed look). */
    if (content !== undefined) this.#recordAddressType(address, locator, content, contentBasis);
    /* D-455 — THE CAPTURE A `changed` TICK FILED, CHECKED HERE RATHER THAN TAKEN. The tick holds
       the bytes in the capture store and files them through its promotion; the look names
       them only when the REGISTER holds that sha under THIS bundle — the one fact the caller
       cannot have produced by saying so — and it is the sha the tick saw. A capture that does
       not resolve is not named, and the reason is stated on the row. */
    let capturedSha = null, uncapturedWhy = uncaptured ? String(uncaptured) : null;
    if (outcome === "changed" && captured && typeof captured === "object") {
      const s = typeof captured.sha256 === "string" ? captured.sha256 : "";
      const home = /^[0-9a-f]{64}$/.test(s) ? this.#one(`SELECT bundle_id FROM register WHERE capture_sha = ?`, s) : null;
      if (s !== seen) uncapturedWhy = "the capture offered is not the sha this tick saw";
      else if (!home || home.bundle_id !== String(bundleId))
        uncapturedWhy = "the served bytes are not registered under this bundle";
      else {
        capturedSha = s;
        /* The version at the address, filed through the ONE writer of `captured_locators`
           (PL-10: versions of one document are indexed by its address), under the sweep's
           authority. `observe: false` because THIS method writes the look below: one look,
           one row. */
        this.provenance.recordReceipt({ address: locator || address, addressNorm: address, captureSha: s,
          retrieved: typeof captured.retrieved === "string" ? captured.retrieved : stampInstant("second", this.now()),
          via: "direct", retrievalLocator: typeof captured.retrievalLocator === "string" ? captured.retrievalLocator : null,
          context: { authorityKind: "sweep", authority: String(bundleId), actorClass: "plane", actor: null, observe: false } });
      }
    }
    const row = monitorObservationFor({ outcome, baseline, seen, httpStatus, reason, scope,
                                        captured: capturedSha, uncaptured: uncapturedWhy });
    if (!row) return { ok: true, written: false,
                       why: outcome === "unchanged" || outcome === "changed"
                         ? "no captured baseline, so the look has no capture to refer to and is not recorded"
                         : `no observation is recorded for the outcome '${String(outcome)}'` };
    const cls = actorClass === "member" || actorClass === "machine" ? actorClass : "plane";
    const now = stampInstant("second", this.now());
    const bad = this.observationLog.observe({
      actorClass: cls, actor: cls === "plane" ? null : actor,
      authorityKind: "sweep", authority: String(bundleId),
      level: "document", subjectKind: "address", subject: String(address),
      state: row.state, governed: row.governed === true, condition: row.condition || null,
      resultKind: row.resultKind || null, resultRef: row.resultRef || null, detail: row.detail,
    }, now);
    if (bad) return { ok: false, written: false, refusal: bad };
    const top = this.#one(`SELECT MAX(seq) m FROM observation_log`);
    return { ok: true, written: true, seq: top ? top.m : null, at: now, state: row.state, detail: row.detail,
             /* D-455: the capture the row NAMES, which is the register's answer and not the caller's;
                null with the reason when a `changed` look could not name one. */
             ...(outcome === "changed" ? { captured: capturedSha, uncaptured: capturedSha ? null : uncapturedWhy } : {}) };
  }

  /* REC-191 (R13) — WHAT A TICK READ THE ADDRESS AS, for the cadence plan's contract fallback.
     A reading that determined a contract replaces whatever was held; one that could not
     say is written only where nothing is held, so an unreachable source or a document
     read as bytes does not erase what an earlier tick established. The contract word is
     checked against CONTRACT_FREQUENCY's keys here, once: a word this plane gives no
     meaning is kept as UNDETERMINED with its word in the basis, never stored as a
     contract the plan would then have to second-guess. */
  #recordAddressType(addressNorm, locator, content, basis) {
    const at = stampInstant("second", this.now());
    const c = content && typeof content === "object" ? content : null;
    const known = c && typeof c.contract === "string"
      && Object.prototype.hasOwnProperty.call(CONTRACT_FREQUENCY, c.contract);
    const why = known ? null
      : c && c.contract != null ? `the tick read the contract '${String(c.contract).slice(0, 40)}', which this plane gives no frequency`
      : String(basis || "the tick could not determine the document's content type").slice(0, 240);
    this.sql.exec(
      `INSERT INTO monitor_address_type (address_norm, address, content_type, confidence, contract, basis, read_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(address_norm) DO UPDATE SET
         address=excluded.address, content_type=excluded.content_type, confidence=excluded.confidence,
         contract=excluded.contract, basis=excluded.basis, read_at=excluded.read_at
       WHERE excluded.contract IS NOT NULL OR monitor_address_type.contract IS NULL`,
      String(addressNorm), String(locator || addressNorm),
      known && typeof c.type === "string" ? c.type : null,
      known && c.confidence != null ? String(c.confidence) : null,
      known ? c.contract : null, why, at);
  }

  /* ================================================================== *
   * The cadence (R14–R16) and the idempotence key (R21)
   * ================================================================== */

  /** REC-191 (R15) — THE SUBJECT OF A SCHEDULE IS AN ADDRESS, NOT A BUNDLE.
   *
   *  Bob, 2026-08-06 (D-220): *"Monitoring an ADDRESS is what a member means"*; monitoring a
   *  bundle is what this consumer did, so sixty captures of one calendar were sixty
   *  schedules fetching the same address sixty times. The monitored bundles are GROUPED by
   *  `captured_locators.address_norm` through the version-chain join (`versionChain`'s own
   *  join: `captured_locators` to `register` on the capture sha, one version per sha, in
   *  `first_retrieved` order with the sha as tiebreak), and each address becomes ONE row of
   *  the shape the plan reads.
   *
   *  WHICH VERSION IS CHECKED: the CURRENT one — the newest version at the address among
   *  those asking to be monitored, because op=monitor refuses a bundle that does not ask.
   *  A NEWER version that does not ask is not silently passed over: it is STATED on the
   *  row (`newer_unmonitored`), since a tick against an older baseline is then comparing
   *  with a capture the record has already superseded.
   *
   *  WHICH FREQUENCY GOVERNS — BOB #31's 22:03Z ruling (quoted on REC-191's row, cited
   *  until folded): *"the ADDRESS's own setting governs; where none is set, the CURRENT version's;
   *  never the shortest; a disagreement is STATED."* No address-level setting EXISTS in
   *  this record (no column, no op writes one; R17), so the first clause has nothing to read and
   *  that is stated here rather than approximated. The current version's AUTHORED
   *  `monitoring.frequency` governs; where it authored none, the CONTRACT of the content
   *  type the last tick read at the address (`monitor_address_type`, CONTRACT_FREQUENCY) —
   *  the tick's own rule (`cadenceFor`), so the plan and the tick agree. Other
   *  versions' authored words never govern and never shorten it; where they differ from the
   *  one that governs, the row carries `disagreement`.
   *
   *  WHEN IT WAS LAST CHECKED: the LATEST check of ANY monitored version, because every one
   *  of them fetches the same address; the address was looked at when any was ticked.
   *
   *  NOTHING READ YET: an address whose current version authored no frequency and whose
   *  type no tick has read is DUE NOW (`frequency_source: "unread"`) — the check is what
   *  reads it, the same reasoning as a never-checked document. A tick that reads and cannot
   *  say writes a row saying so, so this cannot recur for the same address. One that read
   *  NO document (unreachable, gone) writes nothing, and the address is then STATED
   *  unscheduled rather than retried on an interval nobody derived.
   *
   *  A BUNDLE WITH NO CAPTURED ADDRESS (promoted without a capture filed at an address)
   *  is its own subject, as before, matched to a type reading by its own `source.locator`.
   *  So is a bundle captured at SEVERAL addresses none of which is its `source.locator`:
   *  choosing one would be the plane inventing which document it watches.
   *
   *  BOUNDED: three linear reads (the monitored bundles, the chain rows at their
   *  addresses, the type readings), grouped in memory — no read per row. */
  subjects() {
    const bundles = this.#rows(
      `SELECT bundle_id, monitor_frequency, monitor_last_checked, source_locator
         FROM bundles WHERE monitor_enabled = 1`);
    const chain = this.#rows(
      `SELECT cl.address_norm AS address_norm, cl.capture_sha AS capture_sha,
              MIN(cl.first_retrieved) AS first_retrieved, MIN(cl.address) AS address,
              r.bundle_id AS bundle_id, b.monitor_enabled AS monitor_enabled
         FROM captured_locators cl
         JOIN register r ON r.capture_sha = cl.capture_sha
         JOIN bundles b ON b.bundle_id = r.bundle_id
        WHERE cl.address_norm IN (
                SELECT cl2.address_norm FROM captured_locators cl2
                  JOIN register r2 ON r2.capture_sha = cl2.capture_sha
                  JOIN bundles b2 ON b2.bundle_id = r2.bundle_id
                 WHERE b2.monitor_enabled = 1)
        GROUP BY cl.address_norm, cl.capture_sha, r.bundle_id
        ORDER BY cl.address_norm, MIN(cl.first_retrieved), cl.capture_sha, r.bundle_id`);
    const types = new Map(), typesRaw = new Map();
    for (const t of this.#rows(`SELECT * FROM monitor_address_type`)) {
      types.set(t.address_norm, t);
      typesRaw.set(t.address, t);
    }
    const byId = new Map(bundles.map((b) => [b.bundle_id, b]));
    /* Every address each MONITORED bundle holds a version at, with the raw spelling. */
    const addrsOf = new Map();
    for (const c of chain) {
      if (!byId.has(c.bundle_id)) continue;
      if (!addrsOf.has(c.bundle_id)) addrsOf.set(c.bundle_id, new Map());
      addrsOf.get(c.bundle_id).set(c.address_norm, c.address);
    }
    const home = new Map(), lone = [];
    for (const b of bundles) {
      const a = addrsOf.get(b.bundle_id);
      if (!a || a.size === 0) { lone.push({ b, basis: null }); continue; }
      if (a.size === 1) { home.set(b.bundle_id, [...a.keys()][0]); continue; }
      const own = [...a].filter(([, raw]) => raw === b.source_locator).map(([norm]) => norm);
      if (own.length === 1) home.set(b.bundle_id, own[0]);
      else lone.push({ b, basis: `captured at ${a.size} addresses, none of them singly its source.locator, `
                                + "so it is scheduled as itself rather than assigned to one" });
    }
    const last = (list) => {
      let m = null;
      for (const b of list) {
        const v = b.monitor_last_checked ? Date.parse(b.monitor_last_checked) : NaN;
        if (Number.isFinite(v) && (m === null || v > m)) m = v;
      }
      return m === null ? null : stampInstant("second", m);
    };
    /* The frequency the plan schedules by, and WHICH SOURCE SET IT — R14's one rule (`cadenceFor`), with the two
       states only a plan has: never checked and nothing read (`unread`, due now: the check is what reads the type),
       and checked with nothing read (no interval can be derived, and inventing one to retry on is the guess this
       consumer refuses). */
    const cadence = (authored, type, checked) => {
      const hasAuthored = authored != null && authored !== "";
      if (!hasAuthored && !type && !checked) return { monitor_frequency: null, frequency_source: "unread",
        why: "no frequency authored, and no tick has read what the document is: this check reads it" };
      if (!hasAuthored && !type) return { monitor_frequency: null, frequency_source: "undetermined",
        why: `no frequency authored, and no check has read a document at this address (last checked ${checked})` };
      if (!hasAuthored && type.contract == null) return { monitor_frequency: null, frequency_source: "undetermined",
        why: `no frequency authored, and the content type read at this address on ${type.read_at} `
           + `is undetermined (${type.basis || "no basis recorded"})` };
      const c = cadenceFor(authored, type ? { contract: type.contract, content_type: type.content_type } : null);
      return { monitor_frequency: c.frequency, frequency_source: c.source,
               ...(hasAuthored ? { authored } : {}),
               ...(c.source === "contract" ? { contract: c.contract, content_type: c.content_type ?? null } : {}),
               ...(c.why ? { why: c.why } : {}) };
    };
    const rows = [];
    for (const { b, basis } of lone) {
      /* A bundle with no locator gives a tick nothing to read (op=monitor refuses it
         NO_LOCATOR), so "unread, check it now" would be a promise nothing can keep. */
      const c = (b.monitor_frequency == null || b.monitor_frequency === "") && !b.source_locator
        ? { monitor_frequency: null, frequency_source: "undetermined",
            why: "no frequency authored, and no source.locator to read a content type from" }
        : cadence(b.monitor_frequency, b.source_locator ? typesRaw.get(b.source_locator) : null,
                  last([b]));
      rows.push({ bundle_id: b.bundle_id, monitor_last_checked: b.monitor_last_checked,
                  address: null, versions: [b.bundle_id],
                  ...(basis ? { address_basis: basis } : {}), ...c });
    }
    /* ONE pass over the chain, which is ordered by address and then by version, so the
       last member seen at an address IS its current version: recorded as the pass goes,
       never looked for again. The groups partition the chain, so the per-address work
       below is linear in it in total. */
    const groups = new Map(), currentAt = new Map();
    for (const c of chain) {
      if (!groups.has(c.address_norm)) groups.set(c.address_norm, []);
      groups.get(c.address_norm).push(c);
      if (home.get(c.bundle_id) === c.address_norm) currentAt.set(c.address_norm, groups.get(c.address_norm).length - 1);
    }
    for (const [addr, versions] of groups) {
      if (!currentAt.has(addr)) continue;
      const at = currentAt.get(addr);
      const members = [...new Set(versions.filter((v) => home.get(v.bundle_id) === addr).map((v) => v.bundle_id))]
        .map((id) => byId.get(id));
      const current = byId.get(versions[at].bundle_id);
      const newer = [...new Set(versions.slice(at + 1).map((v) => v.bundle_id))]
        .filter((id) => home.get(id) !== addr);
      const authored = members.filter((m) => m.monitor_frequency != null && m.monitor_frequency !== "");
      const words = new Set(authored.map((m) => m.monitor_frequency));
      const governs = current.monitor_frequency != null && current.monitor_frequency !== ""
        ? current.monitor_frequency : null;
      const disagrees = words.size > 1 || (words.size === 1 && governs !== [...words][0]);
      rows.push({
        bundle_id: current.bundle_id, monitor_last_checked: last(members), address: addr,
        versions: [...new Set(versions.map((v) => v.bundle_id))],
        ...(newer.length ? { newer_unmonitored: newer } : {}),
        ...cadence(current.monitor_frequency, types.get(addr), last(members)),
        ...(disagrees ? { disagreement: {
          governs: governs, governed_by: current.bundle_id,
          authored: authored.map((m) => ({ bundle: m.bundle_id, frequency: m.monitor_frequency })),
          note: "versions at this address author different frequencies; the current version's governs, "
              + "never the shortest (BOB #31)" } } : {}),
      });
    }
    return { rows, monitored: bundles.length, addresses: rows.filter((r) => r.address !== null).length };
  }

  /** R16: what is due, what is next, and what has no computable cadence — one read, so `due`, `wake` and `tick`
   *  cannot disagree about the same instant. REC-191: over ADDRESSES (`subjects`), one row per address, each row
   *  carrying the version it checks as `bundle` and every version it stands for. Computed whether or not monitoring
   *  is configured; the ticks read `plan`, which is empty unless it is (R19). */
  schedule(now) {
    const due = [], unscheduled = [], scheduled = [];
    let next = null;
    const subjects = this.subjects();
    const about = (r) => ({ address: r.address, versions: r.versions, frequency_source: r.frequency_source,
      ...(r.contract ? { contract: r.contract, content_type: r.content_type } : {}),
      ...(r.address_basis ? { address_basis: r.address_basis } : {}),
      ...(r.newer_unmonitored ? { newer_unmonitored: r.newer_unmonitored } : {}),
      ...(r.disagreement ? { disagreement: r.disagreement } : {}) });
    for (const r of subjects.rows) {
      const iv = monitorIntervalMs(r.monitor_frequency);
      if (iv === null) {
        /* REC-191: nothing authored and nothing read — the check is how the type is read. */
        if (r.frequency_source === "unread") {
          due.push({ bundle: r.bundle_id, frequency: null, due_at: 0, ...about(r), why: r.why });
          continue;
        }
        const word = r.monitor_frequency ?? r.authored ?? null;
        unscheduled.push({ bundle: r.bundle_id, frequency: word,
          last_checked: r.monitor_last_checked ?? null,
          reason: r.monitor_frequency === "per_meeting"
            ? "cadence is a meeting schedule this plane does not hold"
            : r.why ? r.why
            : word === "none" || word == null
              ? "no frequency declared"
              : MONITOR_FREQ.includes(word)
                ? "the cadence table gives this frequency no interval"
                : "not a frequency the catalog knows", ...about(r) });
        continue;
      }
      /* A monitored document that has NEVER been checked is due now: the record
         has no idea whether its source still serves what was captured, and that
         is the strongest case for asking rather than the weakest. */
      const last = r.monitor_last_checked ? Date.parse(r.monitor_last_checked) : NaN;
      const at = Number.isFinite(last) ? last + iv : 0;
      if (at <= now) due.push({ bundle: r.bundle_id, frequency: r.monitor_frequency, due_at: at, interval_ms: iv, ...about(r) });
      else {
        scheduled.push({ bundle: r.bundle_id, frequency: r.monitor_frequency, next_at: at, interval_ms: iv,
                         last_checked: r.monitor_last_checked, ...about(r) });
        if (next === null || at < next) next = at;
      }
    }
    /* Longest-overdue first, then by id, so a batch-bounded tick starves nobody
       and the same instant always produces the same batch. */
    due.sort((a, b) => a.due_at - b.due_at || (a.bundle < b.bundle ? -1 : a.bundle > b.bundle ? 1 : 0));
    return { due, next, unscheduled, scheduled, monitored: subjects.monitored, addresses: subjects.addresses };
  }

  /** The plan the cadence tick runs by: `schedule(now)`, or nothing at all when monitoring is not configured (R19). */
  plan(now) {
    if (!this.configured()) return { due: [], next: null, unscheduled: [], scheduled: [], monitored: 0, addresses: 0 };
    return this.schedule(now);
  }

  /* ===========================================================   *  REC-26 (R21): the IDEMPOTENCE KEY, and it is shared by both firing consumers.
   *
   *  `MACHINE-PROCESSES.md` risk 2, stated in full there and in short here: an
   *  alarm retry re-runs a tick from the top, so an address the previous attempt
   *  already fired is fired again. For the archive fallback that is not merely
   *  wasted work — a successful archive acquire records the captured locator,
   *  which on conflict does `observations = observations + 1`, and a RUN of
   *  observations across an interval is the PRIMARY route by which the record
   *  establishes that a link was contemporaneous (LINK-FIDELITY.md). Three
   *  retries of one observation therefore produce three observations, and the
   *  record claims corroboration nobody produced. `CLAUDE.md`: "an equality or an
   *  outcome that costs nothing to produce is not evidence." So this is not an
   *  optimisation and not politeness to the Internet Archive (though it is that
   *  too, and our appetite there is OURS — D-111); it is the rule, enforced
   *  structurally.
   *
   *  The key is (consumer, subject, tick epoch), and the pattern is taskEnqueue's:
   *  the producer writes the dedup row FIRST and the expensive act happens only on
   *  a fresh key, so a subject fired and then lost to a throw still counts as
   *  fired. `now` cannot be the epoch — a retry arrives with a new Date.now() —
   *  so the epoch is REMEMBERED in monitor_tick_epoch and the presence of that row
   *  means "a tick started and did not finish". The next tick reuses it and is
   *  that tick's retry; a clean tick deletes it and the next cadence really does
   *  re-check, which is what stops the key from becoming a permanent mute.
   * ================================================================== */
  #openTickEpoch(consumer, now, staleAfterMs) {
    const open = this.#one(`SELECT epoch FROM monitor_tick_epoch WHERE consumer=?`, consumer);
    /* An open tick is a RETRY only while it is FRESH. Work that keeps failing
       would otherwise hold the epoch open forever and mute its own successes for
       good — the key would stop being idempotence and start being amnesia. Past
       one whole cadence the epoch is spent and the next fire is a genuinely new
       check. Compared absolutely so a suite driving the clock backwards cannot
       wedge it. */
    if (open && Math.abs((Number.isFinite(now) ? now : this.now()) - open.epoch) < staleAfterMs)
      return open.epoch;
    const epoch = Number.isFinite(now) ? Math.trunc(now) : this.now();
    this.sql.exec(
      `INSERT INTO monitor_tick_epoch (consumer, epoch, opened_at) VALUES (?, ?, ?)
       ON CONFLICT(consumer) DO UPDATE SET epoch=excluded.epoch, opened_at=excluded.opened_at`,
      consumer, epoch, stampInstant("second", epoch));
    /* Any fired rows left from an older epoch are spent: the key only has to hold
       WITHIN one tick, and a fired-set that accumulated across ticks would stop a
       document ever being checked twice. */
    this.sql.exec(`DELETE FROM monitor_fired WHERE consumer=? AND epoch<>?`, consumer, epoch);
    return epoch;
  }

  #closeTickEpoch(consumer, epoch) {
    this.sql.exec(`DELETE FROM monitor_tick_epoch WHERE consumer=? AND epoch=?`, consumer, epoch);
    this.sql.exec(`DELETE FROM monitor_fired WHERE consumer=? AND epoch=?`, consumer, epoch);
  }

  /* True when THIS tick has not yet fired this subject, and it records the claim
     in the same breath. The read and the write are one statement pair with no
     await between them and the Durable Object serialises, so nothing can slip
     between them; the write lands before the caller does anything expensive. */
  #claimFire(consumer, subject, epoch) {
    if (this.#one(`SELECT 1 x FROM monitor_fired WHERE consumer=? AND subject=? AND epoch=?`,
                  consumer, subject, epoch)) return false;
    this.sql.exec(
      `INSERT INTO monitor_fired (consumer, subject, epoch, fired_at) VALUES (?, ?, ?, ?)`,
      consumer, subject, epoch, stampInstant("second", this.now()));
    return true;
  }

  /* ================================================================== *
   * For `scheduler` (R19–R24)
   * ================================================================== */

  /** R24: while ticks go over the instance's Worker, configured means a self binding and a bound daemon or
   *  administrator credential (runtime-limits R26's `bound`). */
  configured() {
    return !!(this.env && this.env.SELF && typeof this.env.SELF.fetch === "function"
              && unattendedCredential(this.env).bound);
  }

  #archiveTickMs() {
    const v = Number(this.env && this.env.MONITOR_TICK_MS);
    return Number.isFinite(v) && v >= 0 ? v : MONITOR_TICK_MS;
  }
  /* The smallest consecutive-failure count from which a document could still
     reach EITHER arm: the count arm at `failures`, or the age arm at `minForAge`
     then fourteen days. A SINGLE unretried failure is deliberately below this and
     is NOT monitoring work for the archive tick — that is a gap in our own
     attention for the ordinary path to retry, D-104 one level up (the age arm's
     own reasoning in `sourceReachability`), never evidence the source is gone. */
  floor() {
    const TH = this.capture.reachabilityThresholds();
    return Math.max(1, Math.min(TH.failures, TH.minForAge));
  }
  /* Pending monitoring work keeps the one alarm armed; none lets it
     self-terminate on an idle Free-tier instance (the property REC-1 prized). */
  archivePending() {
    if (!this.configured()) return false;
    return this.#one(`SELECT count(*) c FROM source_reachability WHERE consecutive_failures >= ?`, this.floor()).c > 0;
  }
  /** R20: due on every firing (the tick itself is inert unless configured). */
  archiveDue(now) { return now; }
  /** R20: its wake is now + its interval while some address has at least the floor of failures, else null. */
  archiveWake(now) { return this.archivePending() ? now + this.#archiveTickMs() : null; }

  /** R20: the archive tick. Consult sourcereach for every failing document and fire the archive
      fallback for those the fence finds eligible. It records nothing about the
      source itself: op=acquire's own path records the outcome of the ARCHIVE fetch
      against the DOCUMENT address, and a success there is the RULED "an alternative
      source counts as a re-fetch for monitoring", which resets the failing run and
      drops the document out of eligibility on the next tick. The tick only DECIDES
      and INVOKES; the counter and the capture stay where they already live. */
  async archiveTick(now) {
    if (!this.configured()) return { configured: false };
    /* NOT RE-ENTRANT (R22) — see #tickRunning. An alarm that fires while this tick is
       awaiting a fetch must not run a second copy of it: the second copy has no
       work to do (every subject is claimed) and would report a tick nobody
       finished. It says so rather than returning a silently empty account. */
    if (this.#tickRunning.has("archive-monitor"))
      return { configured: true, busy: true, checked: 0, eligible: [], fired: [], failed: [], skipped: [] };
    this.#tickRunning.add("archive-monitor");
    try {
    const nowIso = stampInstant("second", Number.isFinite(now) ? now : this.now());
    const rows = this.#rows(
      `SELECT address_norm FROM source_reachability
        WHERE consecutive_failures >= ? ORDER BY first_failure_since LIMIT ?`,
      this.floor(), MONITOR_TICK_BATCH);
    /* REC-26 / MACHINE-PROCESSES risk 2. The epoch is opened BEFORE the loop, so
       every address fired in this tick shares one key, and a retry of a tick that
       did not finish reuses it and skips what already landed. */
    const epoch = this.#openTickEpoch("archive-monitor", now, this.#archiveTickMs());
    const eligible = [], fired = [], failed = [], skipped = [];
    for (const { address_norm } of rows) {
      const reach = this.capture.sourceReachability({ addressNorm: address_norm, now: nowIso });
      if (!reach.fallback_eligible) continue;   // governed refusals excluded here, in the verdict (D-104)
      eligible.push(address_norm);
      if (!this.#claimFire("archive-monitor", address_norm, epoch)) { skipped.push(address_norm); continue; }
      const r = await this.#fireArchiveFallback(address_norm);
      (r.ok ? fired : failed).push(r.ok
        ? { address: address_norm, grade: r.grade, hops: r.hops }
        : { address: address_norm, reason: r.reason });
    }
    /* A tick is FINISHED when it accounted for every eligible subject ITSELF:
       nothing failed AND nothing was skipped. Then the epoch closes and the next
       tick is a fresh check rather than a retry. A tick that failed on any
       address keeps its epoch OPEN: the next fire is that tick's retry, it
       re-attempts only what failed, and the successes are already keyed.

       D-518, 2026-09-24 — THE `skipped` HALF IS A CORRECTION, not a tightening:
       a tick that fired nothing and only SKIPPED subjects an earlier, still-unfinished
       tick had claimed did no work and learned nothing. Closing on it erased the record
       that the earlier tick failed, so the next wake minted a fresh epoch and re-fired an
       address that ALREADY SUCCEEDED — a retry MANUFACTURING CORROBORATION. MEASURED on the
       legacy tree before the fix: `observations` went 1 -> 2 across two ticks 62ms apart in
       real time, with no second genuine check. `skipped` non-empty can only mean this tick
       REUSED an open epoch, so the clause says exactly "this was a retry, and a retry
       finishes nothing"; the epoch is released by the spent-epoch rule, one whole cadence on. */
    if (!failed.length && !skipped.length) this.#closeTickEpoch("archive-monitor", epoch);
    return { configured: true, at: nowIso, checked: rows.length, epoch, eligible, fired, failed, skipped };
    } finally { this.#tickRunning.delete("archive-monitor"); }
  }

  /** R19: due while the plan has a due subject. */
  cadenceDue(now) { return this.plan(now).due.length > 0 ? now : null; }
  /** R19: now + 1 s while one is due, else `next`, else null. */
  cadenceWake(now) {
    const p = this.plan(now);
    if (p.due.length) return now + MONITOR_CADENCE_DELAY_MS;
    return p.next;
  }

  /** R19: the cadence tick, at most 50 due subjects by R1–R10. */
  async cadenceTick(now) {
    if (!this.configured()) return { configured: false };
    /* NOT RE-ENTRANT (R22), for the reason recorded at #tickRunning: op=monitor over
       env.SELF re-enters this object, and an alarm armed by anything it does
       would otherwise run a second copy of this tick underneath the first. */
    if (this.#tickRunning.has("monitor-cadence"))
      return { configured: true, busy: true, candidates: 0, ticked: [], skipped: [], failed: [], unscheduled: [] };
    this.#tickRunning.add("monitor-cadence");
    try {
    const at = stampInstant("second", Number.isFinite(now) ? now : this.now());
    const plan = this.plan(now);
    /* An open cadence tick is a retry only within the SHORTEST cadence this
       plane schedules at: past that, a document is genuinely due again and the
       key must not stand between it and its next check. */
    const epoch = this.#openTickEpoch("monitor-cadence", now, MONITOR_CADENCE_MS.hourly);
    const ticked = [], skipped = [], failed = [];
    for (const d of plan.due.slice(0, MONITOR_CADENCE_BATCH)) {
      if (!this.#claimFire("monitor-cadence", d.bundle, epoch)) { skipped.push(d.bundle); continue; }
      const r = await this.#fireMonitorTick(d.bundle);
      /* REC-191: each entry carries the plan's whole account of its ADDRESS — the
         versions it stands for, which source set its frequency, and anything stated. */
      const { bundle: _b, frequency: _f, due_at: _d, why: _w, interval_ms: _i, ...of } = d;
      (r.ok ? ticked : failed).push(r.ok
        ? { bundle: d.bundle, frequency: d.frequency, status: r.status, reeval_raised: r.reeval, ...of }
        : { bundle: d.bundle, frequency: d.frequency, reason: r.reason, ...of });
    }
    /* D-518: the same correction as the archive tick's, made for the same reason and
       in the same class — a cadence tick that fired nothing and only skipped
       bundles an unfinished tick had claimed has finished nothing, and closing on
       it lets the next wake re-fire op=monitor, which writes a SECOND
       monitor-tick promotion record and a second monitoring.last_checked for one
       check. The epoch is released by the spent-epoch rule at the shortest
       cadence instead. */
    if (!failed.length && !skipped.length) this.#closeTickEpoch("monitor-cadence", epoch);
    return { configured: true, at, epoch, monitored: plan.monitored, addresses: plan.addresses,
             candidates: plan.due.length, next: plan.next, ticked, skipped, failed, unscheduled: plan.unscheduled };
    } finally { this.#tickRunning.delete("monitor-cadence"); }
  }

  /* Fire through the SAME op a caller uses, for CAP-3's reason: the governor, the
     mechanical field-set envelope, the C-13.2 session entry and the escalation
     ladder ("a tick raises a flag; what a change MEANS is not a mechanical
     judgement") all run once, in one path that cannot drift. This consumer
     supplies only a bundle id — every judgement in the tick is op=monitor's (R36). */
  async #fireMonitorTick(bundleId) {
    const token = await unattendedCredential(this.env).token();
    /* D-334 (R24): refuse BY NAME rather than spend a credential the gate refuses. */
    if (!token) return { ok: false, reason: MONITOR_NO_LIVE_CREDENTIAL };
    try {
      const res = await this.env.SELF.fetch(
        new Request(`https://self/api/?op=monitor&token=${encodeURIComponent(token)}`, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ bundleId }),
        }));
      const out = await res.json().catch(() => null);
      if (out && out.ok) return { ok: true, status: out.status ?? null, reeval: !!out.reeval_raised };
      return { ok: false, reason: (out && (out.reason || out.error)) || `http ${res.status}` };
    } catch (e) {
      return { ok: false, reason: String(e && e.message || e) };
    }
  }

  /* Fire the fallback through the SAME op a caller uses, so every fence in that
     path holds and the chain is built once. A caller supplies no hop, no replay
     URL and no CDX evidence: op=acquire re-checks eligibility and builds the
     archive hop from the record IT fetched, which is exactly why the invocation
     names only the document address (R36). */
  async #fireArchiveFallback(address) {
    const token = await unattendedCredential(this.env).token();
    /* D-334 (R24): refuse BY NAME rather than spend a credential the gate refuses. */
    if (!token) return { ok: false, reason: MONITOR_NO_LIVE_CREDENTIAL };
    try {
      const res = await this.env.SELF.fetch(
        new Request(`https://self/api/?op=acquire&token=${encodeURIComponent(token)}`, {
          method: "POST", headers: { "content-type": "application/json" },
          body: JSON.stringify({ via: "archive.org", address }),
        }));
      const out = await res.json().catch(() => null);
      const doc = out && out.ok && out.document;
      if (doc) return { ok: true,
        grade: doc.capture && doc.capture.grade,
        hops: Array.isArray(doc.provenance_chain) ? doc.provenance_chain.length : null,
        sha: doc.capture && doc.capture.sha256 };
      return { ok: false, reason: (out && (out.reason || out.error)) || `http ${res.status}` };
    } catch (e) {
      return { ok: false, reason: String(e && e.message || e) };
    }
  }

  /* ================================================================== *
   * driveShells (R26)
   * ================================================================== */

  /** D-525 — THE DRIVE SHELL SWEEP. Every bundle this viewer may see whose
   *  `source.locator` is a harvestable Drive DOCUMENT address, with its baseline
   *  classified by `classifyDriveBaseline` (`drive.mjs` carries the reasoning).
   *  READ-ONLY: it lists and names the remedy, and never re-acquires — the
   *  re-acquire is `op=acquire` on the document address, which CAP-8 routes
   *  through the export and files as a NEW capture beside the old one.
   *
   *  WHAT THIS SWEEP CAN AND CANNOT SEE, stated because the sentence is
   *  load-bearing: it sees bundles by the PROJECTED `source_locator` column
   *  (`projectionOf`), so a bundle whose projection was never written is not
   *  walked; it walks ONE PAGE (`limit`, then `after: cursor`), and its counts are that page's, and it sees a
   *  register only when `data/provenance.json` is held
   *  INLINE (a register spilled to the capture store is named in `unreadable`, never scored).
   *  A Drive address that is not a document (folder, file, published, unknown)
   *  is COUNTED in `not_documents` by shape — CAP-8 refuses to watch those, so
   *  they carry no shell baseline this remedy could fix. */
  driveShells({ viewer = null, limit = null, after = null } = {}) {
    const gate = viewerPredicate(viewer);
    /* PAGED, op=projection's envelope: the per-bundle reads below run once per row, so the row source is
       BOUNDED at the source (LIMIT, keyset on bundle_id) and the answer carries the bound actually applied and
       the cursor to continue. The LIKE is a PREFILTER only — every Drive host contains `google.com/`, and the
       verdict of what is Drive is `readDriveAddress`'s alone, applied to every row the prefilter admits. */
    const asked = Number(limit);
    const cap = Number.isFinite(asked) && asked > 0
      ? Math.min(DRIVE_SHELLS_LIMIT_MAX, Math.floor(asked)) : DRIVE_SHELLS_LIMIT_DEFAULT;
    const where = [`b.source_locator LIKE '%google.com/%'`, `(${gate.sql})`, ...(after ? [`b.bundle_id > ?`] : [])];
    const raw = this.#rows(
      `SELECT b.bundle_id AS id, b.source_locator AS locator, b.monitor_enabled AS monitored
         FROM bundles b WHERE ${where.join(" AND ")} ORDER BY b.bundle_id LIMIT ?`,
      ...gate.args, ...(after ? [after] : []), cap + 1);
    /* One row past the bound, so `truncated` says MORE EXIST rather than "the page happened to be full". */
    const truncated = raw.length > cap;
    const rows = truncated ? raw.slice(0, cap) : raw;
    const shells = [], exported = [], undetermined = [], noBaseline = [], unreadable = [], notDocuments = {};
    let driveLinked = 0;
    for (const r of rows) {
      const drive = readDriveAddress(r.locator);
      if (!drive) continue;
      driveLinked++;
      if (!drive.harvestable) { notDocuments[drive.shape] = (notDocuments[drive.shape] || 0) + 1; continue; }
      const f = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='data/provenance.json'`, r.id);
      const base = { bundle: r.id, locator: r.locator, monitored: r.monitored === 1,
                     export_address: drive.exportAddress, kind: drive.kind };
      let reg = null;
      if (f && typeof f.content === "string") { try { reg = JSON.parse(f.content); } catch { reg = null; } }
      else if (f) { unreadable.push({ ...base, reason: "the register is not held inline" }); continue; }
      if (f && !reg) { unreadable.push({ ...base, reason: "the register is not parsable JSON" }); continue; }
      const docs = reg && Array.isArray(reg.documents) ? reg.documents : [];
      const row = driveBaselineRow(docs, drive, r.locator);
      const sha = row && row.capture && typeof row.capture.sha256 === "string" ? row.capture.sha256 : null;
      const retrievals = sha ? this.#rows(
        `SELECT address, via, retrieval_locator FROM captured_locators WHERE capture_sha=?
           ORDER BY address_norm, via LIMIT ?`, sha, DRIVE_SHELLS_RETRIEVALS_MAX) : [];
      const c = classifyDriveBaseline({ drive, locator: r.locator, rows: docs, retrievals });
      const entry = { ...base, ...c,
        ...(retrievals.length === DRIVE_SHELLS_RETRIEVALS_MAX ? { retrievals_truncated: true } : {}) };
      if (c.verdict === "shell")
        entry.reacquire = { op: "acquire", locator: r.locator, fetches: drive.exportAddress,
          files: "a NEW capture of the export, under the document address, beside the shell's; nothing is overwritten",
          then: "append the answer's `document` to data/provenance.json — op=monitor prefers the row naming the export address" };
      ({ shell: shells, export: exported, undetermined, no_baseline: noBaseline })[c.verdict].push(entry);
    }
    return { ok: true, generated: stampInstant("second", this.now()),
             swept: rows.length, limit: cap, truncated,
             cursor: truncated ? rows[rows.length - 1].id : null,
             drive: driveLinked, shells, export: exported, undetermined, no_baseline: noBaseline, unreadable,
             not_documents: notDocuments,
             counts: { drive: driveLinked, shells: shells.length, export: exported.length, undetermined: undetermined.length,
                       no_baseline: noBaseline.length, unreadable: unreadable.length } };
  }

  /* ================================================================== *
   * The gathering grammar (R27, R42)
   * ================================================================== */

  /** R27: a gathering queue is validated at the WRITE, not only at ratification.
      C-18.5's grammar exists because a leaked write token must be able to
      litter the queue without steering a member's session: the exporter
      renders these fields as quoted data and the grammar bounds what they can
      carry. Refusing at the write means a malformed request never lands, so
      nobody has to read it to find out it was junk.
      Historical replay is not authorship. The record's own history contains
      gathering queues written before this grammar existed, and a migration
      replays them verbatim through this same front door. Refusing them would
      mean the plane cannot faithfully hold its own past, so a replay says so
      explicitly and the manifest entry records it forever. The exemption is
      narrow by construction: it skips THIS check and nothing else, and it
      cannot hide, because a replayed revision is marked in the history a
      reader can see. */
  gatheringCheck(c) {
    const pkg = c && c.pkg ? c.pkg : {};
    const files = Array.isArray(c && c.files) ? c.files : [];
    const gj = pkg.replay ? null : files.find((f) => f.path === "data/gathering.json");
    if (!gj || typeof gj.text !== "string") return null;
    const gf = [];
    checkGatheringGrammar({ files: new Map([["data/gathering.json", gj.text]]) }, gf);
    const errs = gf.filter((x) => x.severity === "error");
    if (errs.length)
      return { ok: false, reason: "GATHERING_REFUSED",
               findings: errs.map((x) => ({ check: x.check, detail: x.message })) };
    return null;
  }

  /** R42: C-18.5 in the audit over one bundle image (record-core R59), as `checkBundle` ran it. */
  audit(image) {
    const files = image && image.files instanceof Map ? image.files : null;
    if (!files) return [];
    const findings = [];
    checkGatheringGrammar({ files }, findings);
    return findings;
  }

  /* ================================================================== *
   * What reaches members (R31, R32)
   * ================================================================== */

  /** R32: every monitored address the viewer may see, with its R15–R16 row: due, scheduled or unscheduled, so a
   *  document that is not being checked is visible without waiting for a tick. An address is seen when the viewer
   *  sees the version it checks. At most MONITORING_READ_MAX rows (`truncated` stated). */
  monitoring({ viewer = null, now = null, limit = null } = {}) {
    const at = Number.isFinite(Number(now)) && now !== null && now !== "" ? Number(now) : this.now();
    const cap = clampLimit(limit, MONITORING_READ_MAX, MONITORING_READ_MAX);
    const s = this.schedule(at);
    const sees = (id) => this.membership.inSight(id, viewer);
    const all = [
      ...s.due.map((d) => ({ state: "due", ...d, due_at: d.due_at ? stampInstant("second", d.due_at) : null })),
      ...s.scheduled.map((d) => ({ state: "scheduled", ...d, next_at: stampInstant("second", d.next_at) })),
      ...s.unscheduled.map((d) => ({ state: "unscheduled", ...d })),
    ].filter((r) => sees(r.bundle));
    const items = all.slice(0, cap);
    return { ok: true, as_of: stampInstant("second", at), configured: this.configured(), items,
             counts: { due: items.filter((r) => r.state === "due").length,
                       scheduled: items.filter((r) => r.state === "scheduled").length,
                       unscheduled: items.filter((r) => r.state === "unscheduled").length },
             limit: cap, truncated: all.length > cap };
  }

  /* ================================================================== *
   * What the understanding and action layers rest on (R33–R35, R44)
   * ================================================================== */

  /** R33 (N170): the captures a live objective's condition reads (intent R7's `watchSet`, followed with its cursor),
   *  and whether each document holding one is monitored. `project` names the objective's project. */
  watched({ project = null } = {}) {
    const intent = this.intent;
    if (!intent || typeof intent.watchSet !== "function")
      return { ok: false, reason: "INTENT_ABSENT", detail: "no intent module is present to name what objectives rest on" };
    const captures = [];
    let after = null, pages = 0;
    for (;;) {
      const w = intent.watchSet({ project, after });
      if (!w || w.ok === false) return { ok: false, reason: w?.reason ?? "WATCHSET_UNREAD", detail: w?.detail ?? null };
      for (const c of w.captures || []) captures.push(c);
      pages++;
      if (!w.cursor || pages > 1000) break;
      after = w.cursor;
    }
    const out = [];
    const seenSha = new Set();
    for (const c of captures) {
      const sha = typeof c === "string" ? c : c && (c.capture_sha || c.sha256 || c.capture);
      if (typeof sha !== "string" || seenSha.has(sha)) continue;
      seenSha.add(sha);
      const r = this.#one(`SELECT r.bundle_id AS bundle_id, b.monitor_enabled AS monitored, b.source_locator AS locator
                             FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id WHERE r.capture_sha = ?`, sha);
      out.push({ capture: sha, bundle: r ? r.bundle_id : null, monitored: !!(r && r.monitored === 1),
                 locator: r ? r.locator ?? null : null });
    }
    return { ok: true, project, captures: out };
  }

  /** R33 (N170, intent R15): monitoring's proposal source. Each document an objective's condition reads that is not
   *  monitored is proposed for monitoring to the members who own the objective; the daemon never enables it, and a
   *  member's adoption of the proposal is the ratification. */
  proposals({ project = null, viewer = null } = {}) {
    const w = this.watched({ project });
    if (!w.ok) return [];
    const byBundle = new Map();
    for (const c of w.captures) {
      if (!c.bundle || c.monitored) continue;
      if (!this.membership.inSight(c.bundle, viewer)) continue;
      if (!byBundle.has(c.bundle)) byBundle.set(c.bundle, { bundle: c.bundle, locator: c.locator, captures: [] });
      byBundle.get(c.bundle).captures.push(c.capture);
    }
    return [...byBundle.values()].map((b) => ({
      key: `monitoring::${project}::${b.bundle}`, source: "monitoring", kind: "monitor-source", grade: null,
      basis: { project, bundle: b.bundle, locator: b.locator, captures: b.captures,
               says: "an objective of this project rests on this document, and it is not monitored: a member may "
                   + "set monitoring.enabled on it; the daemon never enables it" },
      instances: [{ bundle: b.bundle, documents: [b.bundle] }], surfaced_by: "machine" }));
  }

  /** R34, R44: every `pending` clock entry of an action whose date has passed (actions R31's `pendingClocks`, read as
   *  this module's machine viewer) is marked `overdue` by one mechanical `deadline-recheck` promotion per action,
   *  changing only `clock[].status` (pending to overdue, nothing else) and `last_updated`, with its Session Log entry.
   *  R35: then asks `escalation` which stages' triggers are met, so the next stage is proposed; it advances none.
   *  Answers `{ok, at, marked: [{action, ords, revision}], failed: [{action, reason}], escalations, truncated}`. */
  async deadlineRecheck(now = null) {
    const nowMs = Number.isFinite(Number(now)) && now !== null ? Number(now) : this.now();
    const today = new Date(nowMs).toISOString().slice(0, 10);
    const at = stampInstant("second", nowMs);
    let items = [], truncated = false;
    try {
      const p = this.actions.pendingClocks({ before: today, limit: DEADLINE_RECHECK_MAX, viewer: MONITOR_VIEWER });
      if (p && p.ok !== false) { items = Array.isArray(p.items) ? p.items : []; truncated = !!p.truncated; }
      else return { ok: false, reason: p?.reason ?? "PENDING_CLOCKS_UNREAD", detail: p?.detail ?? null };
    } catch (e) {
      return { ok: false, reason: "PENDING_CLOCKS_UNREAD", detail: String(e && e.message || e).slice(0, 160) };
    }
    /* A deadline of the 14th is met by anything on the 14th: only an entry dated before today is past. */
    const byAction = new Map();
    for (const it of items) {
      if (!it || typeof it.date !== "string" || !(it.date < today)) continue;
      if (!byAction.has(it.action)) byAction.set(it.action, []);
      byAction.get(it.action).push(it);
    }
    const marked = [], failed = [];
    for (const [action, entries] of byAction) {
      const r = await this.#markOverdue(action, entries, at);
      (r.ok ? marked : failed).push(r.ok ? { action, ords: r.ords, dates: r.dates, revision: r.revision }
                                         : { action, reason: r.reason, ...(r.detail ? { detail: r.detail } : {}) });
    }
    /* R35: a clock marked overdue can meet an escalation stage's trigger; escalation proposes the next stage and a
       member advances it. Asked with this module's own viewer (conformance answers a call with no viewer as unseen). */
    const escalations = marked.length ? this.escalationsDue(nowMs) : null;
    return { ok: true, at, marked, failed, truncated, escalations };
  }

  async #markOverdue(action, entries, at) {
    const img = this.record.readImage(action);
    const live = img && typeof img["bundle.md"] === "string" ? img["bundle.md"] : null;
    if (!live) return { ok: false, reason: "ABSENT" };
    let fm = null;
    try { fm = parseFrontmatter(live).data; } catch { fm = null; }
    const clock = fm && Array.isArray(fm.clock) ? fm.clock : [];
    /* R44: only an entry the document itself still holds as `pending` with the date the read answered moves. */
    const ords = entries.map((e) => Number(e.ord)).filter((o) => Number.isInteger(o) && o >= 0 && o < clock.length
      && clock[o] && clock[o].status === "pending" && entries.some((e) => Number(e.ord) === o && e.date === clock[o].date));
    if (!ords.length) return { ok: false, reason: "NOTHING_PENDING", detail: "no entry named is still pending in the document" };
    let text = markOverdue(live, ords);
    if (text === null) return { ok: false, reason: "UNSPLICEABLE_CLOCK", detail: "a pending entry's status line could not be found" };
    text = text.split("\n").map((l, i, a) => (/^last_updated:/.test(l) && a.slice(0, i).filter((x) => x === "---").length === 1
      ? "last_updated: " + at : l)).join("\n");
    const dates = ords.map((o) => clock[o].date);
    text = withSessionEntry(text, at, `Deadline recheck: ${ords.length === 1 ? "the clock entry" : "the clock entries"} `
      + `dated ${dates.join(", ")} passed while pending and ${ords.length === 1 ? "is" : "are"} marked overdue `
      + "(a mechanical mark; nothing else moved)");
    const carried = [];
    for (const [path, v] of Object.entries(img)) {
      if (path === "bundle.md" || path.startsWith("_history/")) continue;
      if (typeof v === "string")
        carried.push({ path, text: v, bytes: new TextEncoder().encode(v).length, sha256: await sha256Hex(v) });
      else carried.push({ path, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes });
    }
    const stamp = at.replace(/[-:]/g, "") + "_" +
      [...crypto.getRandomValues(new Uint8Array(4))].map((x) => x.toString(16).padStart(2, "0")).join("");
    const r = await this.promotion.promote({
      bundleId: action, base: await sha256Hex(live), snapKey: stamp, author: MONITOR_AUTHOR,
      writer: "mechanical", operation: "deadline-recheck", viewer: MONITOR_VIEWER,
      meta: { object_type: fm.object_type, title: fm.title, current_state: fm.current_state,
              prior_state: fm.prior_state ?? null, created: fm.created, last_updated: at },
      files: [{ path: "bundle.md", text, bytes: new TextEncoder().encode(text).length, sha256: await sha256Hex(text) },
              ...carried],
    });
    if (!r || r.ok !== true) return { ok: false, reason: r?.reason ?? "REFUSED", detail: r?.detail ?? null };
    return { ok: true, ords, dates, revision: r.bundleSha ?? null };
  }

  /** R35: escalation R16's open edges whose trigger is met, read as this module's machine viewer. */
  escalationsDue(nowMs = null) {
    try {
      const e = this.escalation;
      if (!e || typeof e.escalationsDue !== "function") return { ok: false, reason: "ESCALATION_ABSENT" };
      return e.escalationsDue({ nowMs: Number.isFinite(Number(nowMs)) && nowMs !== null ? Number(nowMs) : this.now(),
                                viewer: MONITOR_VIEWER });
    } catch (err) {
      return { ok: false, reason: "ESCALATION_UNREAD", detail: String(err && err.message || err).slice(0, 160) };
    }
  }
}

const instances = new WeakMap();

/** K61: the one Monitoring for this object's storage, created on the first call; `deps` is read on that call only. */
export function monitoringOf(host, deps) {
  const storage = host && host.storage ? host.storage : host;
  let m = instances.get(storage);
  if (!m) {
    const d = deps || {};
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    m = new Monitoring({ ...d, host, storage: d.storage || storage, record, membership, promotion });
    instances.set(storage, m);
    m.migrate();
    record.declarePurge("monitoring", [...MONITORING_TABLES]);
    promotion.registerStep("monitoring", { check: (c) => m.gatheringCheck(c) });
    record.registerAuditCheck("monitoring", (image) => m.audit(image));
    const intent = d.intent === null ? null : m.intent;
    if (intent && typeof intent.registerSource === "function")
      intent.registerSource("monitoring", ({ project, viewer } = {}) => m.proposals({ project, viewer }));
  }
  return m;
}

/** The module's routes in the Durable Object (K3), as entries of the legacy store's op map. `viewer`, `actorClass`
 *  and `actor` are the control plane's stamps, read from the query, so a caller's own copy never wins. */
export function monitoringOps(m, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    monitor: () => m.monitor({ bundleId: b.bundleId ?? null, viewer: q("viewer"), actorClass: q("actorClass") || "machine",
                               actor: q("actor") || null }),
    monitorlook: () => m.recordLook({ ...b, actorClass: q("actorClass") || "plane", actor: q("actor") || null }),
    driveshells: () => m.driveShells({ viewer: q("viewer"), limit: q("limit"), after: q("after") }),
    monitoring: () => m.monitoring({ viewer: q("viewer"), now: q("now"), limit: q("limit") }),
  };
}

/** R1–R10 from the Worker (`legacy-index` routes `op=monitor` here, K72 (11)): the method check, the required
 *  argument and the envelope are the control plane's (`json`, `requiredArgument`, `storeSilent`, passed in with the
 *  stamps it decided); the tick runs in the Durable Object's `monitor` service. A store silence is named, never
 *  read as `ABSENT` or as recorded (R1, R10). */
export async function monitorOp(req, store, { json, storeSilent, requiredArgument, viewer, actorClass, actor, storeName, cls }) {
  if (req.method !== "POST") return json({ ok: false, error: "monitor is a POST" }, 405);
  const body = await req.json().catch(() => null);
  const bundleId = body?.bundleId;
  if (typeof bundleId !== "string" || !bundleId)
    return json({ ok: false, ...requiredArgument("monitor", "bundleId",
      "a non-empty string in the POST body", "monitor needs a bundleId") }, 400);
  const qs = new URLSearchParams({ viewer: viewer || "", actorClass: actorClass || "machine", actor: actor || "" });
  let out = null;
  try {
    out = await (await store.fetch(new Request(`http://do/monitor?${qs}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ bundleId }) }))).json();
  } catch { out = null; }
  if (!out || out.ok !== true || !out.result || typeof out.result.status !== "number") return storeSilent("monitor");
  return json({ ...out.result.body, store: storeName, tokenClass: cls }, out.result.status);
}
