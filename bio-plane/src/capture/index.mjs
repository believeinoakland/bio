/* capture — brings material into the record with its provenance (layer 3): the acquisition act (`acquire.mjs`),
 * the evidence store by digest, what capture learns about sources and sites (reachability, site assets, links and
 * the host's chrome, capture sessions, the platform's ceiling, the render allowance), the event queue an
 * undetermined capture raises, and the doorbell (`doorbell.mjs`). It writes no bundle: no intake path writes live
 * state (R33). Requirements: build/requirements/capture.md (R1–R56). Extracted from `legacy-store` and
 * `legacy-index` in T4 (T4-4); the reasoning the legacy comments carried is kept beside the code it explains.
 *
 * SHAPE (K61). `captureOf(ctx, opts)` answers the one instance for a Durable Object's storage. It reaches
 * record-core by `recordOf(ctx)` on the same `ctx` (the evidence store, `transact`, `declarePurge`, settings) and
 * membership's `viewerPredicate` (R43) for what a viewer may see. It reads provenance's `register` and
 * `captured_locators` only on their stated read contract (provenance R48). It calls no later module: a later
 * module registers a listener (R44, R55; `on`). */
import { KNOCK_CHECKS } from "../../checks/bio-checks.mjs";
import { KNOCK } from "./doorbell.mjs";
import { acquire, archiveLookup } from "./acquire.mjs";
import { recordOf } from "../record-core/index.mjs";
import { governorOf } from "../host-governor/index.mjs";
import { viewerPredicate, GATE_MARK } from "../membership/index.mjs";
import { CAPTURE_SCHEMA, CAPTURE_DERIVED_SCHEMA, CAPTURE_ADDITIVE_COLUMNS, CAPTURE_RESHAPE,
         CAPTURE_PURGED_TABLES, CAPTURE_EXEMPT_TABLES } from "./schema.mjs";
export { CAPTURE_SCHEMA } from "./schema.mjs";

/* A whole-second instant, the record's `…:00Z` spelling. */
const stampSecond = (when = Date.now()) => new Date(when).toISOString().replace(/\.\d+Z$/, "Z");
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const HEX64 = /^[0-9a-f]{64}$/;
const te = new TextEncoder();
const hexOf = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

/* ---- D-98 event queue: module scope because they are pure ----
   The F5 bound lives HERE, at the producer boundary, so a subject is inert before it is stored rather than after
   it is read. Single line, length-capped, control characters stripped: newlines go first because a multi-line
   subject is how a plausible-looking instruction gets room to look like a message rather than a label. */
export const TASK_KINDS = Object.freeze(["authority-undetermined"]);
const boundedSubject = (v) =>
  String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 200);

/* D-104. Closed on purpose: the value of the reachability table is that it tells kinds of not-getting-the-bytes
   apart, and a free string would let a caller collapse that distinction by accident. */
export const SOURCE_OUTCOMES = Object.freeze(["success", "source_refused", "fetch_failed", "governed"]);

/* R8, R43. CHOSEN, not measured (MEASUREMENTS.md). The third constant is the thread's own judgement: with a single
   failure able to age into eligibility, a document that failed once and was never retried becomes eligible after a
   fortnight, which reads OUR MONITORING NEGLECT as the source being unreachable — D-104's mistake one level up. So
   the age arm requires corroboration too. */
export const REACHABILITY_DEFAULTS = Object.freeze({ failures: 3, days: 14, minForAge: 2 });
/* The names of those settings in record-core, and of R19's stagger. */
export const REACHABILITY_SETTINGS = Object.freeze({ failures: "reachability_consecutive_failures",
                                                     days: "reachability_stale_days", minForAge: "reachability_min_failures_for_age" });
export const SUBRESOURCE_STAGGER_SETTING = "subresource_stagger_ms";

/* R23: a ceiling only ever learned downward would leave an upgraded account at the old caps forever. */
const PROBE_EVERY = 25;

/* The events a later module may listen to (R44, R55), and the observation a reuse verdict maps to (the
   observation log's, its Suggestion). */
export const CAPTURE_EVENTS = Object.freeze(["source-outcome", "task", "compute", "observation"]);

const instances = new WeakMap();

/** K61: the one Capture for this object's storage. `opts` is read on the first call only: `env` (the object's
 *  bindings: the evidence bucket for the inbox, the renderer, the instance's name), `governor` (host-governor's,
 *  `governorOf(ctx)` by default) and `provenance` (provenance's services, taken injected until its early merge,
 *  K120 (1)). A test may pass its own. */
export function captureOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let c = instances.get(storage);
  if (!c) {
    c = new Capture(storage, { ...opts, record: opts.record ?? recordOf(ctx),
                               governor: opts.governor ?? governorOf(ctx, { env: opts.env ?? null }) });
    instances.set(storage, c);
  }
  return c;
}

export class Capture {
  #sql; #storage; #listeners = new Map(); #declared = false;

  constructor(storage, { record, env = {}, governor = null, provenance = null } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.core = record;
    this.env = env || {};
    this.governor = governor;
    this.provenance = provenance;
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #cols(t) { return this.#rows(`PRAGMA table_info(${t})`).map((r) => r.name); }

  /* ---- boot (layers.md ruling 3) ---- */

  /** This module's tables, at every boot, idempotent: a derived table whose key changed shape is dropped first
   *  (so the CREATE INDEX below never meets the old table, which would throw inside blockConcurrencyWhile and
   *  brick the Durable Object); the additive columns an older store lacks are added; every table and index is
   *  created if absent; the tables are declared to record-core's purge (R21). */
  migrate() {
    for (const [table, needed] of CAPTURE_RESHAPE) {
      const cols = this.#cols(table);
      if (cols.length && !cols.includes(needed)) this.#sql.exec(`DROP TABLE ${table}`);
    }
    for (const [table, column, decl] of CAPTURE_ADDITIVE_COLUMNS) {
      const have = this.#cols(table);
      if (have.length && !have.includes(column)) this.#sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
    for (const text of [CAPTURE_SCHEMA, CAPTURE_DERIVED_SCHEMA]) {
      const bare = text.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
      for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    }
    this.declareTables();
  }

  declareTables() {
    if (this.#declared || !this.core || typeof this.core.declarePurge !== "function") return false;
    const answer = this.core.declarePurge("capture", CAPTURE_PURGED_TABLES.map((name) => ({ name, keys: [] })),
                                          { exempt: CAPTURE_EXEMPT_TABLES });
    if (answer && answer.ok === false)
      throw new Error(`capture: record-core refused its purge declaration: ${answer.reason} (${answer.table})`);
    this.#declared = true;
    return true;
  }

  /* ---- listeners (R44, R55) ---- */

  /** A later module registers, once at start, a listener for one of `CAPTURE_EVENTS`. Listeners are called after
   *  this module's own write, in the order they registered (the host registers the modules in their total order),
   *  and a listener's failure never fails the act; its outcome is named. */
  on(event, module, fn) {
    if (!CAPTURE_EVENTS.includes(event)) return { ok: false, reason: "UNKNOWN_EVENT", event };
    if (typeof fn !== "function" || typeof module !== "string" || !module)
      return { ok: false, reason: "BAD_LISTENER", event };
    const list = this.#listeners.get(event) || [];
    if (list.some((l) => l.module === module)) return { ok: false, reason: "LISTENER_DECLARED", event, module };
    list.push({ module, fn });
    this.#listeners.set(event, list);
    return { ok: true, event, module };
  }

  async #emit(event, payload) {
    const out = [];
    for (const { module, fn } of this.#listeners.get(event) || []) {
      try { out.push({ module, ok: true, result: await fn(payload) }); }
      catch (e) { out.push({ module, ok: false, error: String(e && e.message || e).slice(0, 200) }); }
    }
    return out;
  }

  /** Hands `payload` to the listeners of `event` (the acquisition act calls it for R55's measurement). */
  emit(event, payload) { return this.#emit(event, payload); }

  /* ---- the acquisition act (acquire.mjs) ---- */

  /** R1–R20: answers `{status, body}`. */
  acquire(body, opts) { return acquire(this, body, opts); }

  /** R3 */
  archiveLookup(args) { return archiveLookup(this, args); }

  #emitSync(event, payload) {
    const out = [];
    for (const { module, fn } of this.#listeners.get(event) || []) {
      try { out.push({ module, ok: true, result: fn(payload) }); }
      catch (e) { out.push({ module, ok: false, error: String(e && e.message || e).slice(0, 200) }); }
    }
    return out;
  }

  /* ---- D-701: what a viewer may see of a capture ---- */

  /** The sight predicate (membership R43) over a column that holds a CAPTURE sha, as a WHERE term. `register`
   *  files a capture in ONE bundle, so the capture is seen exactly when that bundle is. A capture filed in NO
   *  bundle (acquired, never promoted) names no bundle and so discloses none. An absent or unrecognised viewer
   *  sees nothing (fail closed); a machine credential is not filtered. `viewer === undefined` is an internal
   *  caller, not asked. The column must be qualified: a bare name binds inside the subquery and passes all. */
  #captureGate(col, viewer) {
    if (viewer === undefined) return { sql: "1=1", args: [] };
    if (!/^[A-Za-z_][A-Za-z0-9_]*\.[A-Za-z_][A-Za-z0-9_]*$/.test(col))
      throw new Error(`capture gate needs a qualified column (got ${col})`);
    const gate = viewerPredicate(viewer);
    if (gate.scope === "member") return { sql: `${GATE_MARK} 1=1`, args: [] };
    if (gate.scope === "DENY") return { sql: gate.sql, args: [] };
    return { sql: `${GATE_MARK} NOT EXISTS (SELECT 1 FROM register reg JOIN bundles b ON b.bundle_id = reg.bundle_id
                     WHERE reg.capture_sha = ${col} AND NOT (${gate.sql}))`, args: gate.args };
  }

  /* ==================================================================== *
   * The doorbell's store side (R31, R32, R47, R48, R53, R54, R56)
   * ==================================================================== */

  /** R56: the key the source fingerprint is computed under: the operator's secret binding when set, else the
   *  instance's own, generated once and held in `knock_key`. */
  #knockKey() {
    const bound = this.env && typeof this.env.KNOCK_FINGERPRINT_KEY === "string" && this.env.KNOCK_FINGERPRINT_KEY;
    if (bound) return te.encode(bound);
    let r = this.#one(`SELECT key_hex FROM knock_key WHERE id = 1`);
    if (!r) {
      const k = new Uint8Array(32);
      crypto.getRandomValues(k);
      this.#sql.exec(`INSERT OR IGNORE INTO knock_key (id, key_hex, created) VALUES (1, ?, ?)`, hexOf(k), stampSecond());
      r = this.#one(`SELECT key_hex FROM knock_key WHERE id = 1`);
    }
    return Uint8Array.from(r.key_hex.match(/../g).map((h) => parseInt(h, 16)));
  }

  /** R31, R56: a keyed digest (HMAC-SHA-256, first 16 bytes) of the connecting address, never the address and
   *  never an unkeyed hash, which can be reversed by trying every address. */
  async sourceFingerprint(address) {
    const key = await crypto.subtle.importKey("raw", this.#knockKey(), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mac = await crypto.subtle.sign("HMAC", key, te.encode(String(address || "unknown")));
    return hexOf(mac).slice(0, 32);
  }

  /* D-508 / DEC-49: THE ONE HELPER THE TWO RATE REFUSALS ARE MINTED THROUGH. The row is read from the catalogue at
     the moment of the refusal, so this file holds no member-facing word, and THE CODE STAYS A STRING LITERAL AT ITS
     SITE. It THROWS on a missing row (R52): a throw is a 500 in a test, which is loud, where a missing sentence is
     silent and reaches a stranger with no account and no other way to find out what happened. */
  static #rateRefusal(code, extra) {
    const row = KNOCK_CHECKS[code];
    if (!row || typeof row.translation !== "string" || !row.translation)
      throw new Error(`knock: ${code} has no KNOCK_CHECKS row with a canned translation (DEC-49).`);
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, ...(extra || {}) };
  }

  /* D-496: a TWO-BUCKET WEIGHTED SLIDING WINDOW, because a fixed bucket published a bound it did not hold: a caller
     who sends the limit just before the edge and again just after it got TWICE the published number inside one
     window. The estimate weights the PREVIOUS bucket by how much of it is still inside the trailing window —
     `est = prev x (1 - elapsed/W) + cur` — refused at `est >= limit`. It is APPROXIMATE IN BOTH DIRECTIONS (it
     assumes the previous bucket's knocks were spread evenly), which is why the published sentence says
     "estimated by a sliding window". */
  #knockRateRefusal({ ipBucket, ipPrevBucket, globalBucket, globalPrevBucket, elapsedFrac, perIpLimit, globalLimit }) {
    const cnt = (b) => (b ? this.#one(`SELECT count FROM knock_rate WHERE bucket=?`, b)?.count || 0 : 0);
    const decay = 1 - Math.min(1, Math.max(0, Number(elapsedFrac) || 0));
    const est = (cur, prev) => cnt(prev) * decay + cnt(cur);
    /* DEC-49 REGION is-knock-rate — D-508 / C-85.1, C-85.2. The SMALLEST SPAN in which either rate refusal is
       enforced. The instance's published bound (`stated`) is added by the op, never the translation. */
    if (est(ipBucket, ipPrevBucket) >= perIpLimit) return Capture.#rateRefusal("RATE_IP");
    if (est(globalBucket, globalPrevBucket) >= globalLimit) return Capture.#rateRefusal("RATE_GLOBAL");
    /* END DEC-49 REGION is-knock-rate */
    return null;
  }

  /** R31, R32, R53, R54: an accepted knock. `sourceAddress` is the connecting address, reduced here to a keyed
   *  fingerprint. The rate is asked first and changes nothing when it refuses; the bytes (with an evidence store)
   *  are stored BEFORE the row, so a row never stands without its bytes (R54: a failed store answers a failure
   *  and leaves no row); the row and the rate count land in ONE transaction that asks the rate again, so a race
   *  cannot slip past the caps. A knock refused on that second ask stores no bytes of its own: the object is
   *  removed unless another knock's row already names the same digest. */
  async knock({ contentB64 = null, content = null, note, contact, sourceAddress = null, windowMs = KNOCK.windowMs,
                perIpLimit = KNOCK.perIp, globalLimit = KNOCK.global, now = null } = {}) {
    const nowMs = Number.isFinite(Number(now)) ? Number(now) : Date.now();
    let bytes;
    try {
      bytes = contentB64 != null ? Uint8Array.from(atob(contentB64), (c) => c.charCodeAt(0)) : te.encode(String(content ?? ""));
    } catch { return { ok: false, reason: "BAD_CONTENT", detail: "the content did not decode" }; }
    const sha = hexOf(await crypto.subtle.digest("SHA-256", bytes));
    const win = Math.floor(nowMs / windowMs);
    const elapsedFrac = (nowMs - win * windowMs) / windowMs;
    const fp = await this.sourceFingerprint(sourceAddress);
    const rate = { ipBucket: `ip:${fp}:${win}`, ipPrevBucket: `ip:${fp}:${win - 1}`,
                   globalBucket: `all:${win}`, globalPrevBucket: `all:${win - 1}`, elapsedFrac, perIpLimit, globalLimit };
    const early = this.#knockRateRefusal(rate);
    if (early) return early;
    const bucket = this.env && typeof this.env.CAPTURES?.put === "function" ? this.env.CAPTURES : null;
    const key = `bio/inbox/${sha}`;
    let stored = false;
    if (bucket) {
      try {
        const held = typeof bucket.head === "function" ? await bucket.head(key) : null;
        if (!held) { await bucket.put(key, bytes, { sha256: await crypto.subtle.digest("SHA-256", bytes) }); stored = true; }
      } catch (e) {
        return { ok: false, reason: "KNOCK_NOT_STORED", status: 502,
                 detail: "the material could not be stored, so nothing was received and no inbox row was written" };
      }
    }
    const knockId = `KNOCK-${new Date(nowMs).toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}`;
    const received = new Date(nowMs).toISOString();
    const answer = this.#storage.transactionSync(() => {
      const late = this.#knockRateRefusal(rate);
      if (late) return late;
      for (const b of [rate.ipBucket, rate.globalBucket])
        this.#sql.exec(`INSERT INTO knock_rate (bucket,count) VALUES (?,1) ON CONFLICT(bucket) DO UPDATE SET count=count+1`, b);
      /* The prune keeps win AND win-1 (D-496): the previous bucket is read by the estimate, so deleting it would
         silently restore the fixed bucket at the edge. Part of the subject, not housekeeping. */
      this.#sql.exec(`DELETE FROM knock_rate WHERE bucket NOT LIKE '%:' || ? AND bucket NOT LIKE '%:' || ?`,
                     String(win), String(win - 1));
      this.#sql.exec(
        `INSERT INTO inbox (knock_id,sha256,bytes,content,in_r2,note,contact,received,status) VALUES (?,?,?,?,?,?,?,?,'new')`,
        knockId, sha, bytes.length, bucket ? null : new TextDecoder().decode(bytes), bucket ? 1 : 0,
        String(note ?? "").slice(0, 2000), String(contact ?? "").slice(0, 300), received);
      return { ok: true, knockId, sha256: sha, bytes: bytes.length };
    });
    if (!answer.ok && stored && !this.#one(`SELECT 1 AS x FROM inbox WHERE sha256 = ?`, sha)) {
      try { await bucket.delete?.(key); } catch { /* an orphaned content-addressed object is harmless */ }
    }
    return answer;
  }

  /** R32: only a signed-in member reaches these (the op's fence). */
  inboxList(status) {
    return { inbox: this.#rows(
      `SELECT knock_id, sha256, bytes, in_r2, note, contact, received, status, resolved, resolved_by
       FROM inbox ${status ? "WHERE status=?" : ""} ORDER BY received DESC`, ...(status ? [status] : [])) };
  }

  inboxGet(knockId) {
    const r = this.#one(`SELECT knock_id, sha256, bytes, content, in_r2, note, contact, received, status FROM inbox WHERE knock_id=?`, knockId);
    return r ? { ok: true, item: r } : { ok: false, reason: "NOT_FOUND" };
  }

  inboxResolve({ knockId, status, by } = {}) {
    if (!["pulled", "discarded", "new"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    if (!this.#one(`SELECT knock_id FROM inbox WHERE knock_id=?`, knockId)) return { ok: false, reason: "NOT_FOUND" };
    this.#sql.exec(`UPDATE inbox SET status=?, resolved=?, resolved_by=? WHERE knock_id=?`,
                   status, new Date().toISOString(), by ?? null, knockId);
    return { ok: true, knockId, status };
  }

  /* ==================================================================== *
   * D-64: the daily render allowance (R39, R40)
   * ==================================================================== */

  /** R39. Admit one render against today's allowance, or say it waits or is deferred. The verdict is the STRING
   *  `state`, never a leading boolean. THE BOUND THIS HOLDS (D-492): at every moment spent + reserved <= allowance,
   *  because a render is admitted only when `spent + reserved + its own reservation` fits, and its reservation is
   *  the maximum the asked environment permits it to cost. Two residues stay named: the reservation binds only a
   *  renderer that honours what it was asked (its elapsed time is its own claim), and the allowance is an ACCOUNT;
   *  the concurrency cap (D-520) is the throttle, decided first and taking nothing from the day. Slots EXPIRE at
   *  admission plus reservation, so a render that never reports cannot hold one for ever. */
  renderAdmit({ allowanceMs, reserveMs = 0, cap = null, at = null } = {}) {
    const now = at || stampSecond();
    const day = now.slice(0, 10);
    const allowance = Number.isFinite(Number(allowanceMs)) ? Math.max(0, Math.floor(Number(allowanceMs))) : 0;
    /* CEILED, never floored: a reservation rounded DOWN is short of the cost it stands for. */
    const reserve = Number.isFinite(Number(reserveMs)) ? Math.max(0, Math.ceil(Number(reserveMs))) : 0;
    const capN = Number.isInteger(Number(cap)) && Number(cap) > 0 ? Number(cap) : null;
    const nowMs = Date.parse(now);
    if (capN !== null) {
      if (Number.isFinite(nowMs)) this.#sql.exec(`DELETE FROM render_slots WHERE expires_ms <= ?`, nowMs);
      const running = this.#one(`SELECT COUNT(*) AS n FROM render_slots`).n;
      if (running >= capN)
        return { state: "waiting", day, cap: capN, running, reserve_ms: reserve,
                 why: `${running} renders are running and this instance runs at most ${capN} at once` };
    }
    const cur = this.#one(`SELECT * FROM render_allowance WHERE day = ?`, day);
    const spent = cur ? cur.spent_ms : 0;
    const reserved = cur ? (cur.reserved_ms || 0) : 0;
    const defer = (why) => {
      if (cur) this.#sql.exec(`UPDATE render_allowance SET deferred = deferred + 1, last_at = ? WHERE day = ?`, now, day);
      else this.#sql.exec(`INSERT INTO render_allowance (day, spent_ms, reserved_ms, renders, deferred, last_at) VALUES (?, 0, 0, 0, 1, ?)`, day, now);
      return { state: "deferred", day, spent_ms: spent, reserved_ms: reserved, reserve_ms: reserve,
               allowance_ms: allowance, deferred: (cur ? cur.deferred : 0) + 1, renders: cur ? cur.renders : 0, why };
    };
    /* A CALLER THAT OFFERS NO RESERVATION IS DEFERRED, NOT ADMITTED: a fence a caller can switch off by omission
       is no fence. */
    if (!(reserve > 0)) return defer("no reservation was offered, and an unreserved admission is the overrun D-492 closed");
    if (spent + reserved + reserve > allowance) return defer(null);
    if (cur) this.#sql.exec(`UPDATE render_allowance SET renders = renders + 1, reserved_ms = reserved_ms + ?, last_at = ? WHERE day = ?`, reserve, now, day);
    else this.#sql.exec(`INSERT INTO render_allowance (day, spent_ms, reserved_ms, renders, deferred, last_at) VALUES (?, 0, ?, 1, 0, ?)`, day, reserve, now);
    const slot = crypto.randomUUID();
    this.#sql.exec(`INSERT INTO render_slots (slot, admitted_at, expires_ms) VALUES (?, ?, ?)`,
                   slot, now, (Number.isFinite(nowMs) ? nowMs : Date.now()) + reserve);
    return { state: "admitted", day, spent_ms: spent, reserved_ms: reserved + reserve, reserve_ms: reserve,
             allowance_ms: allowance, renders: (cur ? cur.renders : 0) + 1, deferred: cur ? cur.deferred : 0,
             slot, cap: capN };
  }

  /** R40. Frees the slot on every path; adds the REPORTED browser time and releases at most the reservation still
   *  held (never below zero). AN UNREPORTED RENDER STAYS CHARGED: it may have burned any time up to its
   *  reservation, so the reservation is kept for the day, which under-uses the allowance and cannot overrun. */
  renderSpend({ ms, releaseMs = 0, slot = null, at = null } = {}) {
    if (typeof slot === "string" && slot) this.#sql.exec(`DELETE FROM render_slots WHERE slot = ?`, slot);
    const now = at || stampSecond();
    const day = now.slice(0, 10);
    const n = typeof ms === "number" && Number.isFinite(ms) && ms >= 0 ? Math.ceil(ms) : null;
    const rel = Number.isFinite(Number(releaseMs)) ? Math.max(0, Math.ceil(Number(releaseMs))) : 0;
    const cur = this.#one(`SELECT * FROM render_allowance WHERE day = ?`, day);
    if (n === null)
      return { day, spent_ms: cur ? cur.spent_ms : 0, reserved_ms: cur ? (cur.reserved_ms || 0) : 0, released_ms: 0,
               why: "the renderer reported no elapsed time, so nothing was added and its reservation stays charged for the day" };
    const held = cur ? (cur.reserved_ms || 0) : 0;
    const released = Math.min(held, rel);
    if (cur) this.#sql.exec(`UPDATE render_allowance SET spent_ms = spent_ms + ?, reserved_ms = ?, last_at = ? WHERE day = ?`,
                            n, held - released, now, day);
    else this.#sql.exec(`INSERT INTO render_allowance (day, spent_ms, reserved_ms, renders, deferred, last_at) VALUES (?, ?, 0, 0, 0, ?)`, day, n, now);
    return { day, spent_ms: (cur ? cur.spent_ms : 0) + n, reserved_ms: held - released, released_ms: released };
  }

  /* ==================================================================== *
   * Links (R27) and the host's chrome (R28, R29)
   * ==================================================================== */

  /** R27. File the links a captured document made. Replaces this capture's rows rather than appending: a
   *  capture's own links are a property of its bytes. A link carries `chrome: true` with its `chrome_basis` when
   *  it sat in a chrome region (containment, D-340); whether it IS the site's chrome is decided by recurrence
   *  (R28), re-derived here for this capture in the same write. */
  recordLinks({ sourceCapture, sourceBundle = null, capturedAt, links = [] } = {}) {
    if (!sourceCapture) return { recorded: 0 };
    const now = stampSecond();
    this.#sql.exec(`DELETE FROM links WHERE source_capture = ?`, sourceCapture);
    let n = 0;
    for (const l of links) {
      /* address_norm is required; citation_norm falls back to it for a link that names no element. */
      if (!l || !l.address_norm) continue;
      this.#sql.exec(
        `INSERT INTO links (source_bundle, source_capture, link_ref, address, address_norm,
           citation_norm, fragment, partition, origin, chrome, chrome_basis, captured_at, first_seen)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(source_capture, link_ref, citation_norm) DO NOTHING`,
        sourceBundle, sourceCapture, String(l.ref || l.address), l.address || l.address_norm,
        l.address_norm, l.citation_norm || l.address_norm, l.fragment || null,
        l.type || "deferred", l.origin || null, l.chrome ? 1 : 0,
        l.chrome ? (String(l.chrome_basis || "") || null) : null, capturedAt || now, now);
      n++;
    }
    const chrome = this.#chromeDeriveCapture(sourceCapture, now);
    return { recorded: n, source_capture: sourceCapture, site_chrome: chrome };
  }

  /** R27, D-701. Everything that points AT an address, matched on the RESOURCE key so the citations of its
   *  sections are found too. Only sources the viewer may see; `count` and `elements` from what passed. */
  linksTo({ address_norm, viewer = undefined } = {}) {
    const seen = this.#captureGate("l.source_capture", viewer);
    const rows = this.#rows(
      `SELECT l.source_capture, l.source_bundle, l.link_ref, l.partition, l.fragment, l.citation_norm, l.captured_at
         FROM links l WHERE l.address_norm = ? AND (${seen.sql})`, address_norm, ...seen.args);
    return { address_norm, count: rows.length, sources: rows,
             elements: [...new Set(rows.map((r) => r.fragment).filter(Boolean))] };
  }

  /** R27. Resolve a capture's links against the record, with a contemporaneity verdict for each that resolves:
   *  is the capture the record holds of the target the version the source pointed at on the day the source was
   *  captured? Three values, because the question is usually unanswerable and a binary scheme would sort every
   *  unanswerable case into one bucket or the other. The strongest evidence is two captures of the target
   *  BRACKETING the source's retrieval whose bytes hash equal. D-96: the bracket reads DIRECT receipts only.
   *  D-701: a source the viewer may not see answers as a capture the record does not hold, and a target capture
   *  the viewer may not see is filtered out BEFORE the bracket. */
  resolveLinks({ sourceCapture, at = null, viewer = undefined } = {}) {
    const src = this.#captureGate("l.source_capture", viewer);
    const rows = this.#rows(`SELECT l.* FROM links l WHERE l.source_capture = ? AND (${src.sql})`, sourceCapture, ...src.args);
    if (!rows.length) return { sourceCapture, resolved: 0, links: [] };
    const T = Date.parse(rows[0].captured_at) || Date.parse(at || "") || Date.now();
    const out = [];
    const tally = { linked: 0, offsite: 0, intra: 0, anchor: 0, refused: 0 };
    const verdicts = { contemporaneous: 0, superseded: 0, undetermined: 0 };
    const tgt = this.#captureGate("cl.capture_sha", viewer);
    for (const r of rows) {
      if (r.partition !== "deferred") {
        tally[r.partition] = (tally[r.partition] || 0) + 1;
        out.push({ ...r, resolution: r.partition, verdict: null });
        continue;
      }
      const caps = this.#rows(
        `SELECT cl.capture_sha, cl.first_retrieved, cl.last_retrieved, cl.observations FROM captured_locators cl
          WHERE cl.address_norm = ? AND cl.via = 'direct' AND (${tgt.sql}) ORDER BY cl.first_retrieved`,
        r.address_norm, ...tgt.args);
      if (!caps.length) {
        tally.offsite++;
        out.push({ ...r, resolution: "offsite", verdict: null, basis: "the record holds no capture of this address" });
        continue;
      }
      tally.linked++;
      const bracket = caps.find((c) => Date.parse(c.first_retrieved) <= T && Date.parse(c.last_retrieved) >= T
                                       && c.observations > 1) || null;
      const before = [...caps].reverse().find((c) => Date.parse(c.last_retrieved) <= T) || null;
      const after = caps.find((c) => Date.parse(c.first_retrieved) >= T) || null;
      /* D-57: A SELF-REFERENCE, AND ONE CAPTURE ON BOTH SIDES, ARE NOT A CHANGE. A page that links to itself finds
         its OWN capture among the target's, retrieved at exactly T, so it is both the last capture at-or-before T
         and the first at-or-after it; stated for what it is (a fourth basis, never a fourth verdict). */
      const selfCap = caps.find((c) => c.capture_sha === sourceCapture) || null;
      const oneCapture = !!(before && after && before.capture_sha === after.capture_sha);
      let verdict, basis, detail = null, pick = null;
      if (bracket && bracket.capture_sha === sourceCapture) {
        verdict = "contemporaneous"; pick = bracket;
        basis = "this link points at the document itself: the capture the record holds of its target is "
              + "this very capture, and those same bytes were seen served on both sides of its retrieval";
        detail = `self-reference: ${bracket.capture_sha.slice(0, 12)}, observed ${bracket.observations} times `
               + `between ${bracket.first_retrieved} and ${bracket.last_retrieved}`;
      } else if (bracket) {
        verdict = "contemporaneous"; pick = bracket;
        basis = "the same bytes were seen served on both sides of this document's retrieval and "
              + "hash equal, so the target did not change across the interval";
        detail = `observed ${bracket.observations} times between ${bracket.first_retrieved} and ${bracket.last_retrieved}`;
      } else if (selfCap && oneCapture && before.capture_sha === sourceCapture) {
        verdict = "undetermined"; pick = selfCap;
        basis = "this link points at the document itself: the capture the record holds of its target is "
              + "this very capture, observed once, so no second observation says whether the target "
              + "was ever served as anything else";
        detail = `self-reference: ${selfCap.capture_sha.slice(0, 12)} retrieved ${selfCap.first_retrieved}`;
      } else if (oneCapture) {
        verdict = "undetermined"; pick = before;
        basis = "the record holds one capture of the target made at this document's retrieval instant and "
              + "observed once; one observation is not a second version, and it does not establish that "
              + "the target was unchanged on either side";
        detail = `one capture: ${before.capture_sha.slice(0, 12)} retrieved ${before.first_retrieved}`;
      } else if (before && after) {
        verdict = "undetermined"; pick = before;
        basis = "the target changed somewhere between the captures bracketing this document's "
              + "retrieval, so which version it pointed at is not established";
        detail = `bracketing captures differ: ${before.capture_sha.slice(0, 12)} last seen ${before.last_retrieved}, `
               + `${after.capture_sha.slice(0, 12)} first seen ${after.first_retrieved}`;
      } else if (!before && after) {
        verdict = "superseded"; pick = after;
        basis = "every capture of the target postdates this document's retrieval, so the record "
              + "holds a later version than the one pointed at";
      } else {
        verdict = "undetermined"; pick = before;
        basis = "the record's captures of the target all predate this document's retrieval, and "
              + "nothing establishes that it was unchanged in between";
      }
      verdicts[verdict]++;
      const reg = pick ? this.#one(`SELECT bundle_id FROM register WHERE capture_sha = ?`, pick.capture_sha) : null;
      out.push({ ...r, resolution: "linked", verdict, basis, detail,
                 target_capture: pick ? pick.capture_sha : null,
                 target_bundle: reg ? reg.bundle_id : null,
                 target_retrieved: pick ? pick.first_retrieved : null,
                 target_last_seen: pick ? pick.last_retrieved : null,
                 target_captures: caps.length });
    }
    return { sourceCapture, resolved: out.length, at: rows[0].captured_at, tally, verdicts, links: out,
      note: "undetermined is the resting state and the expected common case, not a failure: it means "
          + "nothing established which version the source pointed at, which is different from the "
          + "record holding nothing and different again from holding a later version" };
  }

  /** R27. Append a verdict, never an update: a verdict that changed is a fact about the record. */
  recordLinkVerdict({ sourceCapture, addressNorm, verdict, basis, targetBundle = null, targetCapture = null, detail = null, at = null } = {}) {
    const now = at || stampSecond();
    this.#sql.exec(
      `INSERT INTO link_verdicts (source_capture, address_norm, verdict, basis, target_bundle, target_capture, at, detail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
      sourceCapture, addressNorm, verdict, basis, targetBundle, targetCapture, now, detail);
    const all = this.#rows(`SELECT * FROM link_verdicts WHERE source_capture = ? AND address_norm = ? ORDER BY at`,
                           sourceCapture, addressNorm);
    return { current: all[all.length - 1] || null, history: all, changed: all.length > 1 };
  }

  /* ---- R28, R29: the host's chrome, derived per HOST ---- */

  /** The hosts and pages a capture is on record at. DIRECT receipts only: an archive capture's retrieval date is
   *  when WE asked the archive, not when the site served that navigation. */
  #chromePagesOf(sourceCapture) {
    const out = [];
    for (const r of this.#rows(
      `SELECT address_norm, MIN(first_retrieved) AS first_retrieved, MAX(last_retrieved) AS last_retrieved
         FROM captured_locators WHERE capture_sha = ? AND via = 'direct' GROUP BY address_norm`, sourceCapture)) {
      const host = URL.canParse(r.address_norm) ? new URL(r.address_norm).hostname.toLowerCase() : null;
      if (host) out.push({ host, page: r.address_norm, first: r.first_retrieved, last: r.last_retrieved });
    }
    return out;
  }

  /** One capture's contribution: for each host and page it is on record at, the set of contained chrome addresses
   *  it carried, fingerprinted. A capture that carried NO chrome contributes nothing: a page with no <nav> says
   *  nothing about the site's navigation. Then every touched host's classification is judged again (R28). */
  #chromeDeriveCapture(sourceCapture, at) {
    const pages = this.#chromePagesOf(sourceCapture);
    const touched = new Map(), hosts = new Set(pages.map((p) => p.host));
    for (const old of this.#rows(`SELECT host, fingerprint FROM site_chrome_refs WHERE source_capture = ?`, sourceCapture)) {
      touched.set(`${old.host}\u0000${old.fingerprint}`, old); hosts.add(old.host);
    }
    this.#sql.exec(`DELETE FROM site_chrome_refs WHERE source_capture = ?`, sourceCapture);
    /* Anchors excluded: a skip-link points into THIS page, so its address differs page to page. */
    const chromeRows = this.#rows(
      `SELECT DISTINCT address_norm, chrome_basis FROM links WHERE source_capture = ? AND chrome = 1 AND partition <> 'anchor'`,
      sourceCapture);
    const links = [...new Set(chromeRows.map((r) => r.address_norm))].sort();
    const basis = [...new Set(chromeRows.map((r) => r.chrome_basis).filter(Boolean))].sort();
    let observed = 0;
    if (links.length) {
      const fingerprint = Capture.#fingerprintOf(links);
      for (const p of pages) {
        this.#sql.exec(
          `INSERT INTO site_chrome_refs (host, source_capture, page, first_observed, last_observed, fingerprint, basis)
           VALUES (?, ?, ?, ?, ?, ?, ?)`, p.host, sourceCapture, p.page, p.first, p.last, fingerprint,
          `containment: ${basis.length ? basis.join(", ") : "chrome region not recorded"}`);
        this.#sql.exec(
          `INSERT INTO site_chrome (host, fingerprint, links, first_observed, last_observed, captures)
           VALUES (?, ?, ?, ?, ?, 0) ON CONFLICT(host, fingerprint) DO NOTHING`,
          p.host, fingerprint, JSON.stringify(links), p.first, p.last);
        touched.set(`${p.host}\u0000${fingerprint}`, { host: p.host, fingerprint });
        observed++;
      }
    }
    for (const { host, fingerprint } of touched.values()) {
      const agg = this.#one(`SELECT MIN(first_observed) AS f, MAX(last_observed) AS l, COUNT(*) AS n
                               FROM site_chrome_refs WHERE host = ? AND fingerprint = ?`, host, fingerprint);
      if (!agg || !agg.n) this.#sql.exec(`DELETE FROM site_chrome WHERE host = ? AND fingerprint = ?`, host, fingerprint);
      else this.#sql.exec(`UPDATE site_chrome SET first_observed = ?, last_observed = ?, captures = ? WHERE host = ? AND fingerprint = ?`,
                          agg.f, agg.l, agg.n, host, fingerprint);
    }
    for (const h of hosts) this.#judgeChrome(h, at);
    return { observed, chrome_links: links.length };
  }

  /* A deterministic digest of the sorted address set (FNV-1a over UTF-16, 64 bits as two halves): the fingerprint
     names a navigation, it is not evidence, so a synchronous digest is enough and keeps the write transactional. */
  static #fingerprintOf(list) {
    const s = list.join("\n");
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ c, 0x5bd1e995) >>> 0;
    }
    return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
  }

  /** R28. A contained address is the site's chrome only when it recurred on TWO OR MORE distinct pages of the host;
   *  contained on one page it reads `undetermined`, never lost. Recorded with its basis and the date judged, and
   *  judged again whenever the host is observed: always reclassifiable, never a deletion of the link. */
  #judgeChrome(host, at) {
    const pagesOf = new Map();
    for (const r of this.#rows(`SELECT page, fingerprint FROM site_chrome_refs WHERE host = ?`, host)) {
      const rec = this.#one(`SELECT links FROM site_chrome WHERE host = ? AND fingerprint = ?`, host, r.fingerprint);
      for (const a of JSON.parse((rec && rec.links) || "[]")) {
        if (!pagesOf.has(a)) pagesOf.set(a, new Set());
        pagesOf.get(a).add(r.page);
      }
    }
    this.#sql.exec(`DELETE FROM link_chrome WHERE host = ?`, host);
    for (const [a, pages] of pagesOf) {
      const n = pages.size;
      this.#sql.exec(`INSERT INTO link_chrome (host, address_norm, state, pages, basis, at) VALUES (?, ?, ?, ?, ?, ?)`,
        host, a, n >= 2 ? "chrome" : "undetermined", n,
        n >= 2 ? `contained in a chrome region and recurred on ${n} distinct pages of ${host}`
               : `contained in a chrome region on one page of ${host} only: whether it is the site's navigation or `
                 + "that page's own is undetermined until another page of the host carries it", at || stampSecond());
    }
  }

  /** R28. The standing classification of a host's contained links, with basis and date. */
  chromeOf({ host } = {}) {
    const h = String(host || "").trim().toLowerCase();
    return { host: h, links: this.#rows(`SELECT address_norm, state, pages, basis, at FROM link_chrome WHERE host = ? ORDER BY address_norm`, h) };
  }

  /** R29. Regenerate a host's chrome by SCAN, which is what makes it derived: everything recomputed from `links`
   *  and the receipts. Bounded and paged: the first page (no `after`) clears the host's derived rows; each page
   *  re-derives up to `limit` captures in capture-sha order and says whether more remain. */
  deriveSiteChrome({ host, limit = null, after = null } = {}) {
    const h = String(host || "").trim().toLowerCase();
    const asked = Number(limit);
    const cap = Number.isFinite(asked) && asked > 0 ? Math.min(2000, Math.floor(asked)) : 500;
    if (!h) return { host: null, captures: 0, derived: [], limit: cap, truncated: false, next: null };
    const from = String(after || "");
    if (!from) for (const t of ["site_chrome_refs", "site_chrome", "link_chrome"]) this.#sql.exec(`DELETE FROM ${t} WHERE host = ?`, h);
    const found = this.#rows(
      `SELECT DISTINCT capture_sha FROM captured_locators
        WHERE via = 'direct' AND capture_sha > ? AND (substr(address_norm, 1, ?) = ? OR substr(address_norm, 1, ?) = ?)
        ORDER BY capture_sha LIMIT ?`,
      from, `https://${h}/`.length, `https://${h}/`, `http://${h}/`.length, `http://${h}/`, cap + 1);
    const page = found.slice(0, cap);
    const at = stampSecond();
    for (const r of page) this.#chromeDeriveCapture(r.capture_sha, at);
    const truncated = found.length > cap;
    return { host: h, captures: page.length, derived: page.map((r) => r.capture_sha), limit: cap, truncated,
             next: truncated ? page[page.length - 1].capture_sha : null,
             ...(truncated ? { partial: "more captures of this host remain: its chrome is PARTIAL until the page naming `next` is derived" } : {}) };
  }

  /** R29, D-701. THE PER-HOST READ: how a host's navigation changed between captures. Observations (only those the
   *  viewer may see, before anything is ordered, cut or counted) are ordered by when each was first seen; each
   *  adjacent pair is compared. A contained link the earlier carried and the later did not is LOST only when it is
   *  the site's chrome (R28: it recurred on two or more distinct pages among the visible observations); one carried
   *  on one page only is `undetermined`, with its reason, never lost. */
  navChanges({ host, limit = null, viewer = undefined } = {}) {
    const h = String(host || "").trim().toLowerCase();
    const asked = Number(limit);
    const cap = Number.isFinite(asked) && asked > 0 ? Math.min(500, Math.floor(asked)) : 200;
    const seen = this.#captureGate("s.source_capture", viewer);
    const found = this.#rows(
      `SELECT s.source_capture, s.page, s.first_observed, s.last_observed, s.fingerprint, s.basis
         FROM site_chrome_refs s WHERE s.host = ? AND (${seen.sql})
        ORDER BY s.first_observed DESC, s.source_capture DESC LIMIT ?`, h, ...seen.args, cap + 1);
    const seq = found.slice(0, cap).reverse();
    const fps = [...new Set(seq.map((o) => o.fingerprint))];
    const linksOf = new Map(fps.map((f) => [f, JSON.parse(this.#one(`SELECT links FROM site_chrome WHERE host = ? AND fingerprint = ?`, h, f)?.links || "[]")]));
    const records = fps.map((f) => {
      const mine = seq.filter((o) => o.fingerprint === f);
      return { fingerprint: f, links: linksOf.get(f), captures: mine.length,
               first_observed: mine.map((o) => o.first_observed).sort()[0],
               last_observed: mine.map((o) => o.last_observed).sort().pop() };
    });
    const pagesCarrying = (a) => new Set(seq.filter((o) => linksOf.get(o.fingerprint).includes(a)).map((o) => o.page));
    const obs = (o) => ({ source_capture: o.source_capture, page: o.page, first_observed: o.first_observed,
                          last_observed: o.last_observed, fingerprint: o.fingerprint });
    const changes = [], lost = [], undetermined = [];
    for (let i = 1; i < seq.length; i++) {
      const a = seq[i - 1], b = seq[i];
      if (a.fingerprint === b.fingerprint) continue;
      const A = new Set(linksOf.get(a.fingerprint)), B = new Set(linksOf.get(b.fingerprint));
      const gone = [...A].filter((x) => !B.has(x)).sort();
      const came = [...B].filter((x) => !A.has(x)).sort();
      changes.push({ from: obs(a), to: obs(b), lost: gone, gained: came, same_page: a.page === b.page });
      for (const address_norm of gone) {
        const pages = pagesCarrying(address_norm);
        if (pages.size >= 2) {
          const again = seq.filter((o) => o.last_observed > b.first_observed && linksOf.get(o.fingerprint).includes(address_norm))
                           .map((o) => o.last_observed).sort().pop() || null;
          lost.push({ address_norm, recurred_on: pages.size, last_carried: obs(a), first_missing: obs(b),
                      same_page: a.page === b.page, seen_again_at: again });
        } else {
          undetermined.push({ address_norm, recurred_on: pages.size, last_carried: obs(a), first_missing: obs(b),
                              chrome: "undetermined",
                              why: "carried in a chrome region on one page only, so whether it was the site's navigation is undetermined" });
        }
      }
    }
    return { host: h, observations: seq.length, limit: cap, truncated: found.length > cap, records,
             sequence: seq.map((o) => ({ ...obs(o), basis: o.basis })), changes, lost, undetermined,
             note: (seq.length < 2 ? "fewer than two captures of this host carried navigation: nothing to compare yet"
                                   : "a link is LOST when the site's chrome carried it in one capture and not in the next")
               + "; chrome is containment in a chrome region AND recurrence on two or more distinct pages of the host; "
               + "a capture with no chrome at all is not an observation; direct captures only" };
  }

  /* ==================================================================== *
   * Capture sessions (R22, R46): a capture that needs another tick
   * ==================================================================== */

  /** SCRATCH, not record. Expired rows are pruned on the way past, so an abandoned session costs one row until its
   *  hour is up. The primary is never stored here: it is in the store under its own digest. */
  saveCaptureSession({ session, locator, primarySha, primaryFile, base, state, ttlMs = 3600000, at = null } = {}) {
    const now = at ? new Date(at) : new Date();
    const iso = (d) => stampSecond(d.getTime());
    this.#sql.exec(`DELETE FROM capture_sessions WHERE expires < ?`, iso(now));
    if (!session || !state) return { session: null, saved: false };
    const cur = this.#one(`SELECT ticks FROM capture_sessions WHERE session = ?`, session);
    const body = JSON.stringify(state);
    const expires = iso(new Date(now.getTime() + (Number(ttlMs) || 3600000)));
    if (cur) {
      this.#sql.exec(`UPDATE capture_sessions SET updated = ?, expires = ?, ticks = ticks + 1, state = ? WHERE session = ?`,
                     iso(now), expires, body, session);
      return { session, saved: true, ticks: cur.ticks + 1, bytes: body.length };
    }
    this.#sql.exec(`INSERT INTO capture_sessions (session, locator, primary_sha, primary_file, base, created, updated, expires, ticks, state)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
                   session, locator, primarySha, primaryFile, base, iso(now), iso(now), expires, body);
    return { session, saved: true, ticks: 1, bytes: body.length };
  }

  loadCaptureSession({ session, at = null } = {}) {
    const now = at ? new Date(at) : new Date();
    this.#sql.exec(`DELETE FROM capture_sessions WHERE expires < ?`, stampSecond(now.getTime()));
    const r = this.#one(`SELECT * FROM capture_sessions WHERE session = ?`, session);
    if (!r) return { session, found: false,
      note: "no such capture session: it either never existed, was already finished, or expired" };
    let state = null;
    try { state = JSON.parse(r.state); } catch { return { session, found: false, note: "session state did not parse" }; }
    return { session, found: true, locator: r.locator, primarySha: r.primary_sha,
             primaryFile: r.primary_file, base: r.base, ticks: r.ticks, created: r.created, state };
  }

  dropCaptureSession({ session } = {}) {
    this.#sql.exec(`DELETE FROM capture_sessions WHERE session = ?`, session);
    return { session, dropped: true };
  }

  /** R46: every live session, for `queue`'s partial-capture condition. Writes nothing, never throws. */
  liveCaptureSessions(now) {
    try {
      const at = typeof now === "string" ? now : stampSecond(Number.isFinite(Number(now)) ? Number(now) : Date.now());
      return this.#rows(`SELECT * FROM capture_sessions WHERE expires > ? ORDER BY session`, at).map((r) => {
        let state = null; try { state = JSON.parse(r.state); } catch { state = null; }
        return { session: r.session, locator: r.locator, primarySha: r.primary_sha, primaryFile: r.primary_file,
                 base: r.base, created: r.created, updated: r.updated, expires: r.expires, ticks: r.ticks, state };
      });
    } catch { return []; }
  }

  /* ==================================================================== *
   * What a host has served (R24, R25, R26)
   * ==================================================================== */

  /** R24. Assets this host has served, by normalised address. `documents` counts distinct PAGES, a page being the
   *  primary's DOCUMENT ADDRESS in the receipts (CAP-13): a primary sha is a content hash, so one page whose bytes
   *  changed would otherwise read as two documents. A primary with NO receipt cannot say which page it was: it is
   *  counted apart as `documents_undetermined`, never guessed into `documents`. */
  siteAssets({ host, addresses = [] } = {}) {
    if (!host) return { host: null, assets: {} };
    const out = {};
    const want = addresses && addresses.length ? new Set(addresses) : null;
    const counts = new Map();
    for (const c of this.#rows(
      `SELECT r.address_norm AS address_norm, COUNT(DISTINCT cl.address_norm) AS pages,
              COUNT(DISTINCT CASE WHEN cl.capture_sha IS NULL THEN r.primary_sha END) AS unlocated
         FROM site_asset_refs r LEFT JOIN captured_locators cl ON cl.capture_sha = r.primary_sha
        WHERE r.host = ? GROUP BY r.address_norm`, host)) counts.set(c.address_norm, c);
    for (const r of this.#rows(`SELECT * FROM site_assets WHERE host = ?`, host)) {
      if (want && !want.has(r.address_norm)) continue;
      const c = counts.get(r.address_norm);
      out[r.address_norm] = { ...r, documents: (c && c.pages) || 0, documents_undetermined: (c && c.unlocated) || 0 };
    }
    return { host, assets: out, count: Object.keys(out).length };
  }

  /** R25. File what a capture saw of a host. When an address comes back with different bytes, that is a dated fact
   *  about the site AND it puts every document that REUSED the old bytes into question: the asset moves, the
   *  change is counted, and a dated `posthoc` `changed` verdict is appended for each (CAP-4 item 6a, zero request
   *  cost). A fetched asset's `last_fetched_by` names the capture whose fetch it was; a reuse never moves it
   *  (CAP-14), and a reused part's source is the reusing capture's own record. */
  recordSiteAssets({ host, primarySha, observations = [], at = null } = {}) {
    if (!host || !primarySha) return { host: null, recorded: 0 };
    const now = at || stampSecond();
    let added = 0, changedCount = 0;
    const changed = [];
    const fromObs = (o) => (typeof o.reused_from === "string" && HEX64.test(o.reused_from)) ? o.reused_from : null;
    for (const o of observations) {
      if (!o || !o.address_norm || !o.sha256) continue;
      const cur = this.#one(`SELECT * FROM site_assets WHERE host = ? AND address_norm = ?`, host, o.address_norm);
      if (!cur) {
        this.#sql.exec(
          `INSERT INTO site_assets (host, address_norm, address, sha256, content_type, bytes, kind,
             first_seen, last_seen, last_fetched, stable_since, changes, last_fetched_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
          host, o.address_norm, o.address || o.address_norm, o.sha256, o.content_type || null,
          o.bytes || 0, o.kind || null, now, now, now, now, o.reused ? fromObs(o) : primarySha);
        added++;
      } else if (!o.reused && cur.sha256 !== o.sha256) {
        const affected = this.#rows(`SELECT primary_sha, at FROM site_asset_refs WHERE host = ? AND address_norm = ? AND reused = 1`,
                                    host, o.address_norm);
        this.#sql.exec(
          `UPDATE site_assets SET sha256 = ?, content_type = ?, bytes = ?, last_seen = ?, last_fetched = ?,
             last_fetched_by = ?, stable_since = ?, changes = changes + 1 WHERE host = ? AND address_norm = ?`,
          o.sha256, o.content_type || cur.content_type, o.bytes || 0, now, now, primarySha, now, host, o.address_norm);
        changedCount++;
        changed.push({ address_norm: o.address_norm, was: cur.sha256, now: o.sha256, reused_by: affected.map((a) => a.primary_sha) });
        /* INSERT OR IGNORE: the key carries the second, so two changes within one second fold into the first. */
        for (const a of affected)
          this.#sql.exec(
            `INSERT OR IGNORE INTO reuse_verdicts
               (source_capture, bundle_id, host, address_norm, phase, verdict, reused_sha, observed_sha, basis, at)
             VALUES (?, NULL, ?, ?, 'posthoc', 'changed', ?, ?, ?, ?)`,
            a.primary_sha, host, o.address_norm, cur.sha256, o.sha256,
            "a later direct capture of this host fetched different bytes for this address; "
              + "this earlier capture reused the old ones, which are now unverified against the source", now);
      } else if (!o.reused) {
        this.#sql.exec(`UPDATE site_assets SET last_seen = ?, last_fetched = ?, last_fetched_by = ? WHERE host = ? AND address_norm = ?`,
                       now, now, primarySha, host, o.address_norm);
      } else {
        /* A reuse confirms nothing about the source: last_fetched and last_fetched_by do not move. */
        this.#sql.exec(`UPDATE site_assets SET last_seen = ? WHERE host = ? AND address_norm = ?`, now, host, o.address_norm);
      }
      this.#sql.exec(
        `INSERT INTO site_asset_refs (host, address_norm, primary_sha, at, reused, sha256, reused_from)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(host, address_norm, primary_sha) DO UPDATE SET at = excluded.at,
           reused = excluded.reused, sha256 = excluded.sha256, reused_from = excluded.reused_from`,
        host, o.address_norm, primarySha, now, o.reused ? 1 : 0, o.sha256, o.reused ? fromObs(o) : null);
    }
    return { host, recorded: observations.length, added, changed: changedCount, changes: changed };
  }

  /** CAP-4: the reused subresource PARTS of a bundle, so ratification can re-fetch each. Scoped to THIS bundle by
   *  the register (provenance R48's read contract). `reused_from` is read from the reusing capture's own ref row;
   *  NULL is stated as `reused_from_state: "undetermined"`, never inferred. */
  reusedParts(bundleId) {
    if (!bundleId) return { bundleId: null, parts: [] };
    const parts = this.#rows(
      `SELECT ar.host AS host, ar.address_norm AS address_norm, ar.primary_sha AS primary_sha,
              ar.sha256 AS reused_sha, ar.reused_from AS reused_from, sa.address AS address, sa.content_type AS content_type
         FROM site_asset_refs ar JOIN register r ON r.capture_sha = ar.primary_sha
         LEFT JOIN site_assets sa ON sa.host = ar.host AND sa.address_norm = ar.address_norm
        WHERE r.bundle_id = ? AND ar.reused = 1 ORDER BY ar.host, ar.address_norm`, bundleId)
      .map((p) => ({ ...p, reused_from_state: p.reused_from ? "recorded" : "undetermined" }));
    return { bundleId, parts, count: parts.length };
  }

  /** R26. Append the outcome of a ratification's re-fetch of the reused parts, dated, never overwritten. The
   *  document-level observation each maps to (OBSERVATION-LOG-DESIGN §4.1 row 3; no new words: confirmed →
   *  PRESENT unchanged, changed → PRESENT changed, unreachable → LOOKED_INDETERMINATE, not_attempted → NO ROW,
   *  because a look not taken is NEVER_LOOKED, the absence of a row) is handed to the `observation` listener;
   *  refusals are collected and reported, never thrown. */
  recordReuseVerdicts({ bundleId = null, verdicts = [], at = null } = {}) {
    const now = at || stampSecond();
    let recorded = 0;
    const refusals = [];
    for (const v of verdicts) {
      if (!v || !v.source_capture || !v.address_norm || !v.verdict) continue;
      this.#sql.exec(
        `INSERT OR IGNORE INTO reuse_verdicts
           (source_capture, bundle_id, host, address_norm, phase, verdict, reused_sha, observed_sha, basis, at)
         VALUES (?, ?, ?, ?, 'ratify', ?, ?, ?, ?, ?)`,
        v.source_capture, bundleId, v.host || "", v.address_norm, v.verdict,
        v.reused_sha || "", v.observed_sha ?? null, v.basis || "", now);
      recorded++;
      const mapped =
        v.verdict === "confirmed" ? { state: "PRESENT", detail: "unchanged", ref: v.reused_sha || null }
      : v.verdict === "changed" ? { state: "PRESENT", detail: "changed", ref: v.observed_sha || v.reused_sha || null }
      : v.verdict === "unreachable" ? { state: "LOOKED_INDETERMINATE", detail: "unreachable", ref: null }
      : null;
      if (mapped)
        for (const o of this.#emitSync("observation", { at: now, row: {
          actorClass: "plane", authorityKind: "ratify", authority: bundleId || v.source_capture,
          level: "document", subjectKind: "address", subject: v.address_norm, state: mapped.state,
          resultKind: mapped.ref ? "capture" : null, resultRef: mapped.ref, detail: mapped.detail } }))
          refusals.push(o.ok ? o.result : { reason: "LISTENER_FAILED", module: o.module, detail: o.error });
    }
    return { ok: true, bundleId, recorded, at: now, observation_refusals: refusals.filter(Boolean) };
  }

  /** R26. The reuse verdicts, newest first, by bundle (ratify) or by source capture (which also surfaces the free
   *  posthoc verdicts). */
  reuseVerdicts({ bundleId = null, sourceCapture = null } = {}) {
    const cols = "source_capture, bundle_id, host, address_norm, phase, verdict, reused_sha, observed_sha, basis, at";
    if (bundleId) return { bundleId, verdicts: this.#rows(`SELECT ${cols} FROM reuse_verdicts WHERE bundle_id = ? ORDER BY at DESC, address_norm`, bundleId) };
    if (sourceCapture) return { sourceCapture, verdicts: this.#rows(`SELECT ${cols} FROM reuse_verdicts WHERE source_capture = ? ORDER BY at DESC, address_norm`, sourceCapture) };
    return { verdicts: [] };
  }

  /** Asset chrome by RECURRENCE across a host's pages (CAP-13: a page is its document address), a ratio, not a
   *  boolean: the threshold is the caller's. Primaries with no page on record enter neither side. */
  siteChrome({ host, threshold = 0.6 } = {}) {
    if (!host) return { host: null, documents: 0, documents_undetermined: 0, assets: [] };
    const d = this.#one(
      `SELECT COUNT(DISTINCT cl.address_norm) AS pages, COUNT(DISTINCT CASE WHEN cl.capture_sha IS NULL THEN r.primary_sha END) AS unlocated
         FROM site_asset_refs r LEFT JOIN captured_locators cl ON cl.capture_sha = r.primary_sha WHERE r.host = ?`, host);
    const documents = (d && d.pages) || 0;
    const undetermined = (d && d.unlocated) || 0;
    const assets = [];
    for (const r of this.#rows(
      `SELECT r.address_norm AS address_norm, COUNT(DISTINCT cl.address_norm) AS pages,
              COUNT(DISTINCT CASE WHEN cl.capture_sha IS NULL THEN r.primary_sha END) AS unlocated
         FROM site_asset_refs r LEFT JOIN captured_locators cl ON cl.capture_sha = r.primary_sha
        WHERE r.host = ? GROUP BY r.address_norm`, host)) {
      const share = documents ? r.pages / documents : 0;
      assets.push({ address_norm: r.address_norm, documents: r.pages, documents_undetermined: r.unlocated || 0, share,
                    chrome: documents >= 3 && share >= threshold });
    }
    assets.sort((a, b) => b.share - a.share);
    return { host, documents, documents_undetermined: undetermined, threshold, assets,
             note: (documents < 3 ? "fewer than three documents captured from this host: recurrence says nothing yet"
                                  : "chrome here means the address recurs across at least this share of the host's captured documents")
               + (undetermined ? `; ${undetermined} further capture${undetermined === 1 ? "" : "s"} of this host name no page on record, `
                                 + "so which document each was is undetermined and none is counted" : "") };
  }

  /* ==================================================================== *
   * The platform's ceiling (R23)
   * ==================================================================== */

  /** R23. The ceiling is learned by being refused, never declared; `probeDue` deliberately discards it every so
   *  often and runs to refusal again. */
  captureLimit(runtime = "subrequests") {
    const r = this.#one(`SELECT * FROM capture_limits WHERE runtime = ?`, runtime);
    return r ? { ...r, probeDue: r.since_probe >= PROBE_EVERY, probeEvery: PROBE_EVERY }
             : { runtime, observed: null, probeDue: true, probeEvery: PROBE_EVERY };
  }

  /** R23. A run never refused is NOT evidence about where the ceiling is: it only advances the counter. A ceiling
   *  that MOVED keeps the old value and the date ("51 until Tuesday, now 1000" is the fact worth acting on). */
  recordCaptureLimit({ runtime = "subrequests", observed = null, at = null } = {}) {
    const now = at || stampSecond();
    const cur = this.#one(`SELECT * FROM capture_limits WHERE runtime = ?`, runtime);
    if (observed == null) {
      if (cur) this.#sql.exec(`UPDATE capture_limits SET since_probe = since_probe + 1 WHERE runtime = ?`, runtime);
      return { runtime, observed: cur ? cur.observed : null, recorded: false,
               note: "a run that was never refused says the ceiling is at least what it spent, and nothing about where it is" };
    }
    if (!cur) {
      this.#sql.exec(`INSERT INTO capture_limits (runtime, observed, observed_at, first_seen, samples, since_probe) VALUES (?, ?, ?, ?, 1, 0)`,
                     runtime, observed, now, now);
      return { runtime, observed, recorded: true, moved: false, samples: 1 };
    }
    if (cur.observed === observed) {
      this.#sql.exec(`UPDATE capture_limits SET observed_at = ?, samples = samples + 1, since_probe = 0 WHERE runtime = ?`, now, runtime);
      return { runtime, observed, recorded: true, moved: false, samples: cur.samples + 1 };
    }
    this.#sql.exec(`UPDATE capture_limits SET previous = observed, moved_at = ?, observed = ?, observed_at = ?, samples = 1, since_probe = 0
                    WHERE runtime = ?`, now, observed, now, runtime);
    return { runtime, observed, previous: cur.observed, moved: true, moved_at: now, recorded: true, samples: 1 };
  }

  /* ==================================================================== *
   * D-98: the event queue (R15, R45)
   *
   * Bob RULED that an undetermined-authority capture creates a task AUTOMATICALLY AT CAPTURE, through a
   * PRODUCER/CONSUMER QUEUE, and the queue is the safety property. The capture path may only ENQUEUE: it cannot
   * write a task, name an assignee, set a status or forge a history entry, so the blast radius of a leaked
   * capture credential stops at `task_queue`. The consumer (`queue`, K91 (3)) is the sole writer of tasks and
   * drains this through R45.
   * ==================================================================== */

  /** R15. Bounds what it accepts, records no decision, idempotent on (kind, capture_sha); every enqueue (a dedupe
   *  included, since the consumer still owes it a drain) calls the `task` listeners (R44), which arm the drain. */
  async taskEnqueue({ kind = "authority-undetermined", captureSha = null, subject = "", locator = null, at = null } = {}) {
    if (!TASK_KINDS.includes(kind)) return { ok: false, reason: "BAD_KIND", detail: `kind must be one of: ${TASK_KINDS.join(", ")}` };
    if (typeof captureSha !== "string" || !HEX64.test(captureSha))
      return { ok: false, reason: "BAD_CAPTURE_SHA", detail: "a capture sha256 identifies the event; a bundle does not exist yet at capture time" };
    const text = boundedSubject(subject) || "a capture whose authority could not be determined";
    const loc = typeof locator === "string" && locator.length <= 2000 ? locator : null;
    const now = at && ISO_INSTANT.test(at) ? at : stampSecond();
    const existing = this.#one(`SELECT capture_sha FROM task_queue WHERE kind=? AND capture_sha=?`, kind, captureSha);
    if (!existing)
      this.#sql.exec(`INSERT INTO task_queue (kind, capture_sha, subject, locator, enqueued) VALUES (?,?,?,?,?)`,
                     kind, captureSha, text, loc, now);
    const heard = await this.#emit("task", { kind, captureSha, subject: text, locator: loc, enqueued: now, deduped: !!existing });
    const armedAt = heard.map((h) => h.ok && h.result && h.result.armedAt).find((x) => x != null) ?? null;
    return existing ? { ok: true, queued: false, deduped: true, kind, captureSha, armedAt }
                    : { ok: true, queued: true, deduped: false, kind, captureSha, enqueued: now, armedAt };
  }

  /** R45: the queued events, oldest first (by `enqueued`, then digest), at most `limit`. */
  taskEvents({ limit = 50 } = {}) {
    try {
      const n = Math.max(0, Math.min(1000, Math.trunc(Number(limit)) || 0));
      return this.#rows(`SELECT kind, capture_sha, subject, locator, enqueued, attempts, last_try FROM task_queue
                          ORDER BY enqueued, capture_sha LIMIT ?`, n)
        .map((r) => ({ kind: r.kind, captureSha: r.capture_sha, subject: r.subject, locator: r.locator,
                       enqueued: r.enqueued, attempts: r.attempts, lastTry: r.last_try }));
    } catch { return []; }
  }

  /** R45 */
  taskEventCount() {
    try { return Number(this.#one(`SELECT COUNT(*) AS n FROM task_queue`).n); } catch { return 0; }
  }

  /** R45 */
  taskEventAttempt({ kind, captureSha, at } = {}) {
    try {
      if (!this.#one(`SELECT 1 AS x FROM task_queue WHERE kind=? AND capture_sha=?`, kind, captureSha)) return { found: false };
      this.#sql.exec(`UPDATE task_queue SET attempts = attempts + 1, last_try = ? WHERE kind=? AND capture_sha=?`,
                     at ?? stampSecond(), kind, captureSha);
      return { found: true };
    } catch { return { found: false }; }
  }

  /** R45 */
  taskEventRemove({ kind, captureSha } = {}) {
    try {
      if (!this.#one(`SELECT 1 AS x FROM task_queue WHERE kind=? AND capture_sha=?`, kind, captureSha)) return { found: false };
      this.#sql.exec(`DELETE FROM task_queue WHERE kind=? AND capture_sha=?`, kind, captureSha);
      return { found: true };
    } catch { return { found: false }; }
  }

  /* ==================================================================== *
   * D-104: source reachability (R8, R43)
   * ==================================================================== */

  /** R43, R8 (K120 (3)): the three figures as they stand, instance settings in record-core (`getSetting`), a
   *  setting not set answering its default. A value that is not a number at or above its floor is never obeyed. */
  reachabilityThresholds() {
    const get = (name) => { try { return this.core && typeof this.core.getSetting === "function" ? this.core.getSetting(name) : null; } catch { return null; } };
    const pick = (v, dflt, min) => { const n = Number(v); return v != null && v !== "" && Number.isFinite(n) && n >= min ? n : dflt; };
    return { failures: pick(get(REACHABILITY_SETTINGS.failures), REACHABILITY_DEFAULTS.failures, 1),
             days: pick(get(REACHABILITY_SETTINGS.days), REACHABILITY_DEFAULTS.days, 0),
             minForAge: pick(get(REACHABILITY_SETTINGS.minForAge), REACHABILITY_DEFAULTS.minForAge, 1) };
  }

  /** R19 (K120 (3)): the subresource stagger, an instance setting in record-core in milliseconds; not set, a jittered
   *  50–250 ms. */
  subresourceStaggerMs() {
    let v = null;
    try { v = this.core && typeof this.core.getSetting === "function" ? this.core.getSetting(SUBRESOURCE_STAGGER_SETTING) : null; } catch { v = null; }
    const n = Number(v);
    return v != null && v !== "" && Number.isFinite(n) && n >= 0 ? n : 50 + Math.floor(Math.random() * 200);
  }

  /** R8. One attempt at one document address. A governed refusal is counted in its own column and never as a
   *  failure: the silence is ours. Every recorded outcome is then handed to the `source-outcome` listeners (R44),
   *  which is how monitoring's alarm is armed on a counted failure. */
  async recordSourceOutcome({ addressNorm = null, outcome = null, status = null, at = null } = {}) {
    if (typeof addressNorm !== "string" || addressNorm === "") return { ok: false, reason: "NO_ADDRESS" };
    if (!SOURCE_OUTCOMES.includes(outcome))
      return { ok: false, reason: "BAD_OUTCOME", detail: `outcome must be one of: ${SOURCE_OUTCOMES.join(", ")}` };
    const now = at && ISO_INSTANT.test(at) ? at : stampSecond();
    const st = Number.isInteger(status) ? status : null;
    this.#sql.exec(`INSERT INTO source_reachability (address_norm, updated_at) VALUES (?, ?) ON CONFLICT(address_norm) DO NOTHING`, addressNorm, now);
    if (outcome === "governed")
      this.#sql.exec(`UPDATE source_reachability SET governed_refusals = governed_refusals + 1, last_outcome = ?, updated_at = ?
                       WHERE address_norm = ?`, outcome, now, addressNorm);
    else if (outcome === "success")
      this.#sql.exec(`UPDATE source_reachability SET attempts = attempts + 1, consecutive_failures = 0, first_failure_since = NULL,
                        last_success = ?, last_outcome = ?, last_status = ?, updated_at = ? WHERE address_norm = ?`,
                     now, outcome, st, now, addressNorm);
    else
      this.#sql.exec(`UPDATE source_reachability SET attempts = attempts + 1, failures_total = failures_total + 1,
                        consecutive_failures = consecutive_failures + 1, first_failure_since = COALESCE(first_failure_since, ?),
                        last_failure = ?, last_outcome = ?, last_status = ?, updated_at = ? WHERE address_norm = ?`,
                     now, now, outcome, st, now, addressNorm);
    await this.#emit("source-outcome", { addressNorm, outcome, status: st, at: now, counted: outcome !== "governed" });
    return { ok: true, counted: outcome !== "governed", ...this.sourceReachability({ addressNorm, now }) };
  }

  /** R8. The reachability of one address and whether the fallback threshold is met, with the facts it is computed
   *  from. Staleness runs from the FIRST failure of the current run, and the age arm needs corroboration. */
  sourceReachability({ addressNorm = null, now = null } = {}) {
    const row = this.#one(`SELECT * FROM source_reachability WHERE address_norm=?`, addressNorm);
    const TH = this.reachabilityThresholds();
    if (!row)
      return { address_norm: addressNorm, known: false, consecutive_failures: 0, governed_refusals: 0,
               fallback_eligible: false, thresholds: TH, basis: "no attempt on this address has ever been recorded" };
    const at = now && ISO_INSTANT.test(now) ? now : stampSecond();
    const byCount = row.consecutive_failures >= TH.failures;
    const since = row.first_failure_since ? Date.parse(row.first_failure_since) : null;
    const staleDays = since === null ? 0 : (Date.parse(at) - since) / 86400000;
    const byAge = row.consecutive_failures >= TH.minForAge && staleDays >= TH.days;
    return {
      address_norm: row.address_norm, known: true, consecutive_failures: row.consecutive_failures,
      attempts: row.attempts, failures_total: row.failures_total,
      /* A number excluded from a decision must stay visible or the exclusion cannot be audited. */
      governed_refusals: row.governed_refusals,
      last_success: row.last_success || null, last_failure: row.last_failure || null,
      last_outcome: row.last_outcome || null, last_status: row.last_status === null ? null : row.last_status,
      first_failure_since: row.first_failure_since || null,
      failing_days: since === null ? 0 : Math.floor(staleDays),
      fallback_eligible: byCount || byAge,
      thresholds: TH,
      basis: byCount
        ? `${row.consecutive_failures} consecutive failures produced by the source, threshold ${TH.failures}`
        : byAge
          ? `failing since ${row.first_failure_since}, ${Math.floor(staleDays)} days, threshold ${TH.days} with at least ${TH.minForAge} failures`
          : row.governed_refusals > 0 && row.consecutive_failures === 0
            ? `not eligible: ${row.governed_refusals} governed refusal(s) recorded and DELIBERATELY not counted; the source has not failed`
            : row.consecutive_failures === 1 && staleDays >= TH.days
              ? `not eligible: failing for ${Math.floor(staleDays)} days but on ONE failure that was never retried, which is a gap in our monitoring rather than evidence the source is unreachable; retry it`
              : "not eligible: the threshold is not met",
    };
  }
}

/** Whether a purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function captureOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CAPTURE_PURGED_TABLES.includes(name) || CAPTURE_EXEMPT_TABLES.includes(name);
}

/* The Durable Object routes this module answers, as entries of the legacy store's op map (its dispatcher spreads
   them in). `url` carries the control plane's stamps; `body` the parsed body. */
export function captureOps(c, url, body, env) {
  const q = (k) => url.searchParams.get(k);
  const viewerOf = () => (url.searchParams.has("viewer") ? q("viewer") : undefined);
  return {
    capturelimit: () => c.captureLimit(q("runtime") || "subrequests"),
    siteassets: () => c.siteAssets(body || { host: q("host") }),
    recordsiteassets: () => c.recordSiteAssets(body || {}),
    reusedparts: () => c.reusedParts(q("id")),
    recordreuseverdicts: () => c.recordReuseVerdicts(body || {}),
    reuseverdicts: () => c.reuseVerdicts({ bundleId: q("bundle"), sourceCapture: q("capture") }),
    renderadmit: () => c.renderAdmit(body || {}),
    renderspend: () => c.renderSpend(body || {}),
    recordlinks: () => c.recordLinks(body || {}),
    resolvelinks: () => c.resolveLinks({ sourceCapture: q("capture"), viewer: viewerOf() }),
    linksto: () => c.linksTo({ address_norm: q("address"), viewer: viewerOf() }),
    recordlinkverdict: () => c.recordLinkVerdict(body || {}),
    navchanges: () => c.navChanges({ host: q("host"), limit: q("limit"), viewer: viewerOf() }),
    derivesitechrome: () => c.deriveSiteChrome({ host: q("host"), limit: q("limit"), after: q("after") }),
    chromeof: () => c.chromeOf({ host: q("host") }),
    recordsourceoutcome: () => c.recordSourceOutcome(body || {}),
    sourcereach: () => c.sourceReachability({ addressNorm: q("address"), now: q("now") }),
    taskenqueue: () => c.taskEnqueue(body || {}),
    savecapturesession: () => c.saveCaptureSession(body || {}),
    loadcapturesession: () => c.loadCaptureSession({ session: q("session") }),
    dropcapturesession: () => c.dropCaptureSession({ session: q("session") }),
    sitechrome: () => c.siteChrome({ host: q("host"), threshold: Number(q("threshold")) || 0.6 }),
    recordcapturelimit: () => c.recordCaptureLimit(body || {}),
    knock: () => c.knock({ ...(body || {}), sourceAddress: q("source") }),
    inboxlist: () => c.inboxList(q("status") || null),
    inboxget: () => c.inboxGet(q("id")),
    inboxresolve: () => c.inboxResolve(body || {}),
    /* K72 (11): the Worker's op forwards here with the control plane's stamps in the query. */
    acquire: () => c.acquire(body || {}, { cls: q("cls"), member: q("member") === "1", sessMember: q("sessMember") || null,
                                          storeName: q("store") || "bio" }),
    archivelookup: () => c.archiveLookup({ address: (body && body.address) || q("address") }),
  };
}
