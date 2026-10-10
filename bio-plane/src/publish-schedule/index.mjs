/* publish-schedule — publishing a signed case edition at a set time (requirements:
 * `build/requirements/publish-schedule.md` R1–R11; DEC-147). Built by copy (K624) at publication's third split for size
 * (K617, K2418, K2438; N823; T41-37), no requirement changing meaning: `./schedule.mjs` is `publication/schedule.mjs`
 * whole, and this file holds what `publication/index.mjs` held of it (the publisher's and the listeners' registrations,
 * the delegates and the three ops), with the table (`./schema.mjs`) and row C-122.5 (`./checks.mjs`).
 *
 * The case ceremony (`ratification`, `op=publishat`) sets a signed edition to wait (R1); the one publisher `ratification`
 * registers (R2) checks it again at its time and commits through `publication` R22; an owner moves or cancels it until
 * then (R3, `op=publishatmove`, `op=publishatcancel`); R4 lists them (`op=publishschedule`) for the case and the queue;
 * R2's wake and R6's notice serve `scheduler`; R7 answers the waiting edition to `case-authoring`. This module never
 * calls `publication` R22 itself, and never writes `publication`'s tables: it reads `cases` and `case_documents` under
 * `publication` R40 and `publication.hasCaseStanding` (its R1) for standing.
 *
 * THE SEAM (R8; K31's pattern, as `publication` R61): at creation this module registers with `publication` R77
 * (`registerWaitingEditions`) the source `publication` reads a waiting edition through: `isWaiting(caseId, edition)`
 * (`publication` R21's waiting clause), `signedAtOf(caseId, edition)` (R5, for `publication` R70's `signed_at`) and
 * `signerOf(caseId, edition)` (K2529, for `publication` R76's signer and deliverer).
 * Until `publication` offers R77 (T41-36, K2483) nothing is registered, and `publication` reads its own copy, as today.
 *
 * REACHED as `publishScheduleOf(host, deps)` (K61): one instance per host, created on the first call with `deps`. At
 * creation it creates `scheduled_editions` (the same DDL `publication` created, so a running store's rows are kept),
 * declares it to record-core (R10; the answer kept as `purgeDeclaration`, so a refused one, TABLE_DECLARED while
 * `publication` still declares the table, is seen and never thrown), and registers R8. `deps` (each reached through its
 * factory on the same host unless given; a test passes its own):
 *   storage       the host's `storage.sql` (the same storage as `publication`'s, so both read one table).
 *   record        `transact`, `getSetting("jurisdiction_profiles")` (R1), `declareTable` (R10).
 *   membership    `isProjectOwner` (R3); `viewerPredicate` and `listenerRefusal` are its exported rules.
 *   publication   `hasCaseStanding` (its R1; R3, R4), `registerWaitingEditions` (its R77; R8).
 *   now           the clock for the instants it writes, an ISO string (default: the wall clock). */

import { recordOf } from "../record-core/index.mjs";
import { membershipOf, listenerRefusal } from "../membership/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { PUBLISH_SCHEDULE_DECLARATIONS, migratePublishSchedule } from "./schema.mjs";
import * as schedule from "./schedule.mjs";

export { SCHEDULED_EDITIONS_MAX, SCHEDULE_STATES, SCHEDULED_CHECK_UNAVAILABLE } from "./schedule.mjs";
export { PUBLISH_SCHEDULE_SCHEMA, PUBLISH_SCHEDULE_TABLES, PUBLISH_SCHEDULE_DECLARATIONS } from "./schema.mjs";
export { PUBLISH_SCHEDULE_CHECKS } from "./checks.mjs";

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : "");

export class PublishSchedule {
  #publisher = null;        // R2 (K1790): {module, publishScheduled}, filled once by ratification
  #publishListeners = [];   // R6 (K1816): [{module, fn}], one per module
  purgeDeclaration = null;  // R10: record-core's answer to this module's declaration, set at creation
  waitingSource = null;     // R8: publication R77's answer to this module's registration, or null when R77 is not offered

  constructor({ storage, record, membership, publication, now = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.publication = publication;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  migrate() { migratePublishSchedule(this.sql); }

  /* ---------------------------------------------------------------- R2, R6: the registrations */

  /** R2 (K1790): `ratification` fills, once at start, the one publisher of a waiting edition:
   *  `publishScheduled(entry, now)` → `{published: true, published_at}` or `{stopped: [{code, translation}]}`. Called as
   *  `registerScheduledPublisher(publisher)` or `registerScheduledPublisher(module, publisher)`; a second registration is
   *  refused `PROVIDER_DECLARED`, one without the door `PROVIDER_MALFORMED`. With none, a due edition is stopped
   *  `SCHEDULED_CHECK_UNAVAILABLE` and never published unchecked. */
  registerScheduledPublisher(moduleOrPublisher, maybePublisher = undefined) {
    const pub = typeof moduleOrPublisher === "string" ? maybePublisher : moduleOrPublisher;
    const module = typeof moduleOrPublisher === "string" ? str(moduleOrPublisher) : str(pub && pub.module) || "unnamed";
    if (!pub || typeof pub !== "object" || typeof pub.publishScheduled !== "function")
      return { ok: false, reason: "PROVIDER_MALFORMED", detail: "the scheduled publisher gives the door publishScheduled" };
    if (this.#publisher)
      return { ok: false, reason: "PROVIDER_DECLARED", module: this.#publisher.module,
               detail: `the scheduled publisher is already registered by ${this.#publisher.module}` };
    this.#publisher = { module, publishScheduled: pub.publishScheduled };
    return { ok: true, module };
  }
  /** R2: the registered publisher, or null. */
  scheduledPublisher() { return this.#publisher; }

  /** R6 (K1811, K1816; answers R27's model): one listener per module, refused through `membership.listenerRefusal`,
   *  told `{publishAt}` (R2's `publishWake()` as it then stands) once after an edition is set to wait (R1), its time
   *  moved or cancelled (R3), or a due edition taken (R2), so `scheduler` re-arms its alarm. Writes nothing. */
  onPublishScheduled(module, fn) {
    const bad = listenerRefusal(this.#publishListeners, module, fn);
    if (bad) return bad;
    this.#publishListeners.push({ module, fn });
    return { ok: true, module };
  }
  /* R6: the listeners, for ./schedule.mjs. */
  publishListeners() { return this.#publishListeners; }

  /* ---------------------------------------------------------------- R1–R5, R7, R8 (./schedule.mjs) */

  scheduleEdition(a) { return schedule.scheduleEdition(this, a); }
  publishWake() { return schedule.publishWake(this); }
  publishDue(now) { return schedule.publishDue(this, now); }
  publishAtMove(a) { return schedule.publishAtMove(this, a); }
  publishAtCancel(a) { return schedule.publishAtCancel(this, a); }
  scheduledEditions(a) { return schedule.scheduledEditions(this, a); }
  /** R1: the group's time zone as R1 reads it, or null. */
  groupZone() { return schedule.groupZone(this); }
  /** R7 (N681): the case's waiting edition, or null, for `case-authoring` (its R58, R59). */
  waitingEditionOf(caseId) { return schedule.waitingEditionOf(this, caseId); }
  /** R8: whether a case edition waits (`publication` R21's waiting clause). */
  isWaiting(caseId, edition) { return schedule.isWaiting(this, caseId, edition); }
  /** R5, R8: a waiting case edition's signing instant, or null. */
  signedAtOf(caseId, edition) { return schedule.signedAtOf(this, caseId, edition); }
  /** R8 (K2529): a waiting case edition's `{signer, delivered_by}`, or null. */
  signerOf(caseId, edition) { return schedule.signerOf(this, caseId, edition); }

  /** R8: the source `publication` R77 takes, its two doors bound to this instance. */
  waitingEditions() {
    return { module: "publish-schedule", isWaiting: (c, e) => this.isWaiting(c, e), signedAtOf: (c, e) => this.signedAtOf(c, e),
             signerOf: (c, e) => this.signerOf(c, e) };
  }
}

const instances = new WeakMap();

/** The one instance for a host (K61). The first call creates it with `deps`, creates `scheduled_editions`, declares it
 *  (R10), and registers R8's source with `publication` once it offers `registerWaitingEditions` (its R77; K2483). */
export function publishScheduleOf(host, deps) {
  let ps = instances.get(host);
  if (!ps) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const publication = d.publication || publicationOf(host, { record, membership });
    ps = new PublishSchedule({ storage, record, membership, publication, now: d.now });
    instances.set(host, ps);
    ps.migrate();
    /* R10: the declaration's answer is kept, so a refused one (TABLE_DECLARED: nothing declared) is seen. */
    ps.purgeDeclaration = record.declareTable("publish-schedule", PUBLISH_SCHEDULE_DECLARATIONS.map((t) => ({ ...t })));
    /* R8 (K2483): only once publication offers R77; until then publication reads its own copy. */
    if (publication && typeof publication.registerWaitingEditions === "function") {
      try { ps.waitingSource = publication.registerWaitingEditions(ps.waitingEditions()); }
      catch { ps.waitingSource = { ok: false, reason: "PROVIDER_MALFORMED" }; }
    }
  }
  return ps;
}

/** The module's ops (K3), as entries of the plane's op map (`plane/store.mjs`). R3, R4 (DEC-147): `by` and `viewer` the
 *  control plane's stamps, read from the query, so a caller's own copy in a body never wins; an absent viewer is no
 *  viewer at all, never the plane's whole read. */
export function publishScheduleOps(ps, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    publishatmove: () => ps.publishAtMove({ case: b.case, edition: b.edition, at: b.at, by: q("by") }),
    publishatcancel: () => ps.publishAtCancel({ case: b.case, edition: b.edition, by: q("by") }),
    publishschedule: () => ps.scheduledEditions({ case: q("case"), state: q("state"), after: q("after"),
                                                  limit: q("limit"), viewer: q("viewer") || "" }),
  };
}
