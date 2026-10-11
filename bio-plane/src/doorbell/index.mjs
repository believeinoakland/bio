/* doorbell — the public intake by which anyone, with no account, hands the group material (Intake Doctrine §2a), and the
 * member's inbox over it (layer 3). The knock, its two-bucket rate and its refusals (C-85), the inbox with its read,
 * reasoned resolve and pull into the record, the knocker secret and its pseudonym, and the two count-only tallies of the
 * knocks it turns away. A knock is not a capture and not a bundle: it writes no bundle, and no intake path writes live
 * state. Requirements: build/requirements/doorbell.md (R1–R25). Built by copy from `capture` (K624; N826, T42-6;
 * `build/extraction/capture-split.md`), its SQL unchanged; `capture` keeps its copy, unused by new code, until its T43
 * delete (K625, N849).
 *
 * SHAPE (K61, R25). `doorbellOf(ctx, deps)` answers the one instance for a Durable Object's storage. It reaches
 * `capture`'s instance for the same storage (`captureOf(ctx)`, or `deps.capture`), from which it reads `env` at each use
 * (capture R58 is the one adoption rule), and through which it records a pull's actor in the table capture R69 reads
 * (`recordCaptureActor`); record-core (`transact`, `afterCommit`, `declarePurge`, the evidence store, the `bundles` read
 * contract) and provenance (`recordReceipt`, the `register` read contract) are the ones capture holds for the storage
 * (`deps.record`, `deps.provenance` for a test's own); credentials' `securityCount` (R20); membership's `viewerPredicate`
 * and `listenerRefusal`; acquisition's `profileOf`, `profileView`, `firstHopWho` and `INSTALLATION_CHECKS` (R13). It calls
 * no later module: a later module registers the litigation-hold reader (`registerReader`, R3). At its creation it
 * creates its six tables and declares them to record-core's purge as exempt. */
import { DOORBELL_VIA } from "../provenance/index.mjs";
import { profileOf, profileView, firstHopWho, INSTALLATION_CHECKS } from "../acquisition/index.mjs";
import { viewerPredicate, listenerRefusal } from "../membership/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { captureOf } from "../capture/index.mjs";
import { evidenceAbsent } from "../capture/ops.mjs";
import { KNOCK, isWeakKnockerSecret, knockerSecretWeak } from "./door.mjs";
import { DOORBELL_CHECKS, KNOCK_CHECKS } from "./checks.mjs";
import { DOORBELL_SCHEMA, DOORBELL_ADDITIVE_COLUMNS, DOORBELL_EXEMPT_TABLES } from "./schema.mjs";
export { DOORBELL_SCHEMA, DOORBELL_EXEMPT_TABLES } from "./schema.mjs";

/* The helpers below are copied from `capture`, which keeps its own for its other code (the map's §2). */
/* A whole-second instant, the record's `…:00Z` spelling. */
const stampSecond = (when = Date.now()) => new Date(when).toISOString().replace(/\.\d+Z$/, "Z");
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const HEX64 = /^[0-9a-f]{64}$/;
const te = new TextEncoder();
const hexOf = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const b64Of = (bytes) => { let out = ""; for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(out); };

/* R14: Crockford's base32 (no I, L, O, U), for a secret a person copies and a pseudonym a person reads. */
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const base32Of = (bytes) => {
  let bits = 0, value = 0, out = "";
  for (const b of bytes) { value = (value << 8) | b; bits += 8; while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
};
/** R14: the pseudonym, a fixed readable derivation of the knocker digest: its first 80 bits in Crockford base32, in
 *  four groups of four. The same digest always reads the same, and it names no one. */
export const pseudonymOf = (digestHex) =>
  `knocker-${base32Of(Uint8Array.from(String(digestHex).slice(0, 20).match(/../g).map((h) => parseInt(h, 16)))).match(/.{4}/g).join("-")}`;

/* N380: the tag a throw of `pullKnock`'s `within` is carried out of the transaction under. */
const WITHIN_FAULT = Symbol("within's fault");
/** R13 (N409, K609): the one sentence `PULL_WITHIN_FAILED` answers, whatever `within` threw or answered. */
export const PULL_WITHIN_FAILED_DETAIL =
  "the act run with the pull did not complete, so the pull was rolled back and nothing was written";

/* N90: the one bound this module's reads publish (R3, R15). CHOSEN, not measured: a page a member reads in one answer,
   never a size the record grows to. Every read over-fetches one row so `truncated` is a fact, not a guess. */
export const READ_LIMIT = Object.freeze({ default: 200, max: 1000 });
const limitOf = (asked) => {
  const n = Math.floor(Number(asked));
  return asked != null && asked !== "" && Number.isFinite(n) && n > 0 ? Math.min(READ_LIMIT.max, n) : READ_LIMIT.default;
};
/* A paged read's `next`: the ordering key of the last row listed, opaque to the caller (base64url of its JSON), read
   back by `keyOf`, which answers null for a cursor this module did not write (the read then refuses BAD_CURSOR). */
const cursorOf = (parts) => btoa(String.fromCharCode(...te.encode(JSON.stringify(parts))))
  .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const keyOf = (cursor, n) => {
  try {
    const bytes = Uint8Array.from(atob(String(cursor).replace(/-/g, "+").replace(/_/g, "/")), (ch) => ch.charCodeAt(0));
    const k = JSON.parse(new TextDecoder().decode(bytes));
    return Array.isArray(k) && k.length === n && k.every((x) => typeof x === "string") ? k : null;
  } catch { return null; }
};
const badCursor = () => ({ ok: false, reason: "BAD_CURSOR", detail: "`after` is not a cursor this read answered as `next`" });

/* R3: the one reader a later module may register, once at start, whoever makes it: whether any litigation hold is in
   place (`actions` R52). */
export const DOORBELL_READERS = Object.freeze(["litigation-hold"]);

/* R3: the longest reason a member may give, in characters. */
export const REASON_MAX = 2000;
/* R3: a reason is a string with something other than white space in it, at most REASON_MAX characters. */
const reasonGiven = (r) => typeof r === "string" && r.trim() !== "" && [...r].length <= REASON_MAX;

/* R19 (BOB's privacy ruling): how many UTC days the tally keeps. */
export const TALLY_DAYS = 30;

/* R3 (DEC-108 (2)): the orders `inboxList` sorts by, and the directions. */
export const INBOX_SORTS = Object.freeze(["received", "status", "secret", "project"]);
export const SORT_DIRS = Object.freeze(["asc", "desc"]);

const instances = new WeakMap();

/** K61, R25: the one Doorbell for this object's storage; every caller for the same storage gets the same instance.
 *  `deps`: `capture` (`captureOf(ctx)` by default: its `env` is read at each use, R25), `record` and `provenance`
 *  (capture's own by default), `credentials` (`credentialsOf` for the storage by default), each read on the first call
 *  only; a test may pass its own. At its creation it creates its six tables and declares them to purge (`migrate`); a
 *  refused declaration other than R25's held one throws, naming the table, before the caller gets an instance. */
export function doorbellOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let d = instances.get(storage);
  if (d) return d;
  const capture = deps.capture ?? captureOf(ctx);
  d = new Doorbell(storage, { capture, record: deps.record ?? capture.core, provenance: deps.provenance ?? capture.provenance,
                              credentials: deps.credentials ?? null });
  d.migrate();
  instances.set(storage, d);
  return d;
}

export class Doorbell {
  #sql; #storage; #readers = new Map(); #declared = false;

  constructor(storage, { capture, record = null, provenance = null, credentials = null } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.capture = capture;
    this.core = record;
    this.provenance = provenance;
    this.credentials = credentials;
  }

  /** R25 (the map's doubt 5): the storage's `env` (the `CAPTURES` evidence bucket, `KNOCK_FINGERPRINT_KEY`,
   *  `KNOCKER_SECRET_KEY`, `INSTANCE_NAME`, `VERSION`), read at each use from capture's instance for the same storage,
   *  so capture R58's adoption rule is the only one that decides it. */
  get env() { return (this.capture && this.capture.env) || {}; }

  /* credentials' instance for this storage (R20's security tally, its R44), reached when first needed. */
  #credentials() {
    if (!this.credentials) this.credentials = credentialsOf({ storage: this.#storage }, { record: this.core });
    return this.credentials;
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  /* R22 (N418, K650): every write this module makes runs through record-core's `transact` (its R32): one transaction, a
     savepoint inside a caller's, rolled back whole by a throw or an `ok: false` answer, and record-core's `afterCommit`
     (its R66) holds what is called inside it until the outermost commit. Only a Doorbell built with no record (a bare
     storage) falls back to the storage's own `transactionSync`. `fn` is synchronous. */
  #tx(fn) {
    return this.core && typeof this.core.transact === "function" ? this.core.transact(fn) : this.#storage.transactionSync(fn);
  }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #cols(t) { return this.#rows(`PRAGMA table_info(${t})`).map((r) => r.name); }

  /* ---- creation (R25) ---- */

  /** R25: this module's tables, idempotent: the additive columns an older store's `inbox` lacks are added; every table
   *  and index is created if absent, by the DDL capture created them by, so a running store's rows are kept with no
   *  data move; the six are declared to record-core's purge as exempt. */
  migrate() {
    for (const [table, column, decl] of DOORBELL_ADDITIVE_COLUMNS) {
      const have = this.#cols(table);
      if (have.length && !have.includes(column)) this.#sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
    }
    const bare = DOORBELL_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    this.declareTables();
  }

  /** R25 (the map's doubt 4; plan T42 rule 3 (4)): the six tables declared to record-core's purge, every one exempt.
   *  While `capture` keeps its copy (K625), it declares the same six with the same class; so its declaration is asked
   *  first (`capture.declareTables`, idempotent, capture R87; K2629), whatever order the host builds the two in, and a refusal
   *  `TABLE_DECLARED` whose `declaredBy` is `capture` is held, not a failure: the instance is made and nothing is thrown.
   *  Any other refusal throws, naming the table. A record with no declaration (a test's stand-in) is left alone. */
  declareTables() {
    if (this.#declared || !this.core || typeof this.core.declarePurge !== "function") return false;
    if (this.capture && typeof this.capture.declareTables === "function") this.capture.declareTables();
    const answer = this.core.declarePurge("doorbell", [], { exempt: [...DOORBELL_EXEMPT_TABLES] });
    if (answer && answer.ok === false && !(answer.reason === "TABLE_DECLARED" && answer.declaredBy === "capture"))
      throw new Error(`doorbell: record-core refused its purge declaration: ${answer.reason} (${answer.table})`);
    this.#declared = true;
    return true;
  }

  /* ---- the litigation-hold reader (R3) ---- */

  /** R3: a later module (`actions`, its R55) registers, once at start, the litigation-hold reader, the one slot of
   *  `DOORBELL_READERS`: its own slot, apart from capture's copy (plan T42 rule 3 (2): registered only where `actions`
   *  registers it, the other copy answering fail-closed). The slot takes one registration whoever makes it; a second, or
   *  a malformed one, is membership's `listenerRefusal` (its R81); another slot's name is `UNKNOWN_READER`. */
  registerReader(slot, module, fn) {
    if (!DOORBELL_READERS.includes(slot)) return { ok: false, reason: "UNKNOWN_READER", slot };
    const refused = listenerRefusal(this.#readers.get(slot) || null, module, fn, { slot });
    if (refused) return refused;
    this.#readers.set(slot, { module, fn });
    return { ok: true, slot, module };
  }

  /** R3 (DEC-108 (5)): whether a discarded knock's row or bytes may be cleared now. Only when the registered
   *  litigation-hold reader answers, synchronously, that no hold is in place (`false`); with none registered, or one
   *  that fails or answers anything else, nothing discarded is cleared. Writes nothing and never throws. */
  mayClearDiscarded() {
    const reader = this.#readers.get("litigation-hold");
    if (!reader) return { may: false, basis: "no reader of litigation holds is registered, so a hold cannot be ruled out" };
    let held;
    try { held = reader.fn(); } catch { held = undefined; }
    if (held === false) return { may: true, basis: `${reader.module} reports no litigation hold in place` };
    if (held === true) return { may: false, basis: `${reader.module} reports a litigation hold in place` };
    if (held && typeof held.then === "function") Promise.resolve(held).catch(() => {});
    return { may: false, basis: `${reader.module} did not answer whether a litigation hold is in place` };
  }

  /* ==================================================================== *
   * The doorbell's store side (R2, R3, R4, R5, R10, R11, R12)
   * ==================================================================== */

  /** R12: the key the source fingerprint is computed under: the operator's secret binding when set, else the
   *  instance's own, generated once and held in `knock_key`. */
  #knockKey() {
    const bound = this.env && typeof this.env.KNOCK_FINGERPRINT_KEY === "string" && this.env.KNOCK_FINGERPRINT_KEY;
    if (bound) return te.encode(bound);
    let r = this.#one(`SELECT key_hex FROM knock_key WHERE id = 1`);
    if (!r) {
      const k = new Uint8Array(32);
      crypto.getRandomValues(k);
      this.#tx(() => this.#sql.exec(`INSERT OR IGNORE INTO knock_key (id, key_hex, created) VALUES (1, ?, ?)`, hexOf(k), stampSecond()));
      r = this.#one(`SELECT key_hex FROM knock_key WHERE id = 1`);
    }
    return Uint8Array.from(r.key_hex.match(/../g).map((h) => parseInt(h, 16)));
  }

  /** R2, R12: a keyed digest (HMAC-SHA-256, first 16 bytes) of the connecting address, never the address and
   *  never an unkeyed hash, which can be reversed by trying every address. */
  async sourceFingerprint(address) {
    const key = await crypto.subtle.importKey("raw", this.#knockKey(), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const mac = await crypto.subtle.sign("HMAC", key, te.encode(String(address || "unknown")));
    return hexOf(mac).slice(0, 32);
  }

  /** R14: the key the knocker's secret is digested under: the operator's secret binding `KNOCKER_SECRET_KEY` when set,
   *  else the instance's own, generated once (256 random bits) and held in `knocker_key`, exempt from purge and
   *  answered by no op: R12's pattern, a separate key. With `create: false` it answers null rather than make one. */
  #knockerKey({ create = true } = {}) {
    const bound = this.env && typeof this.env.KNOCKER_SECRET_KEY === "string" && this.env.KNOCKER_SECRET_KEY;
    if (bound) return te.encode(bound);
    let r = this.#one(`SELECT key_hex FROM knocker_key WHERE id = 1`);
    if (!r) {
      if (!create) return null;
      const k = new Uint8Array(32);
      crypto.getRandomValues(k);
      this.#tx(() => this.#sql.exec(`INSERT OR IGNORE INTO knocker_key (id, key_hex, created) VALUES (1, ?, ?)`, hexOf(k), stampSecond()));
      r = this.#one(`SELECT key_hex FROM knocker_key WHERE id = 1`);
    }
    return Uint8Array.from(r.key_hex.match(/../g).map((h) => parseInt(h, 16)));
  }

  /* R14: the HMAC-SHA-256 of a secret under the knocker key, as 64 hex. */
  static async #knockerDigest(key, secret) {
    const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return hexOf(await crypto.subtle.sign("HMAC", k, te.encode(secret)));
  }

  /** R14: `{knocker_digest, pseudonym}` for a secret presented at this instance (`sources`' consent by secret). It
   *  writes nothing and never throws: with no knocker key yet (no knock has carried a secret here, and none is bound)
   *  or a secret that is not a non-empty string, both are null, and `basis` says which; a secret this instance never
   *  received answers its digest and pseudonym, which match no knock. */
  async knockerDigestOf(secret) {
    try {
      if (typeof secret !== "string" || secret === "")
        return { knocker_digest: null, pseudonym: null, basis: "no secret was presented" };
      const key = this.#knockerKey({ create: false });
      if (!key) return { knocker_digest: null, pseudonym: null,
                         basis: "no knock carrying a secret has been received by your group's Civicsmith, so no secret is recognised" };
      const knocker_digest = await Doorbell.#knockerDigest(key, secret);
      return { knocker_digest, pseudonym: pseudonymOf(knocker_digest) };
    } catch { return { knocker_digest: null, pseudonym: null, basis: "the digest could not be computed" }; }
  }

  /* D-508 / DEC-49: THE ONE HELPER THE TWO RATE REFUSALS ARE MINTED THROUGH. The row is read from this module's
     table (`KNOCK_CHECKS`, C-85) at the moment of the refusal, so this file holds no member-facing word, and THE CODE
     STAYS A STRING LITERAL AT ITS SITE. It THROWS on a missing row (R9): a throw is a 500 in a test, which is loud,
     where a missing sentence is silent and reaches a stranger with no account and no other way to find out. */
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
    /* R19: whether this knock found the whole doorbell at its limit, whichever refusal answers it. */
    const full = est(globalBucket, globalPrevBucket) >= globalLimit;
    const tag = (r) => Object.defineProperty(r, Doorbell.#LIMIT_REACHED, { value: full, enumerable: false });
    /* DEC-49 REGION is-knock-rate — D-508 / C-85.1, C-85.2. The SMALLEST SPAN in which either rate refusal is
       enforced. The instance's published bound (`stated`) is added by the op, never the translation. */
    if (est(ipBucket, ipPrevBucket) >= perIpLimit) return tag(Doorbell.#rateRefusal("RATE_IP"));
    if (full) return tag(Doorbell.#rateRefusal("RATE_GLOBAL"));
    /* END DEC-49 REGION is-knock-rate */
    return null;
  }

  /* R19: the mark a rate refusal carries, unseen in its answer, saying whether the whole doorbell was full. */
  static #LIMIT_REACHED = Symbol("the whole-doorbell limit was reached");

  /** R19: count one knock the doorbell turned away in the day's tally, and whether it found the whole-doorbell limit
   *  reached (R5), dropping any day older than the last `TALLY_DAYS`. Two counters and a date: no address, fingerprint,
   *  time, digest, pseudonym, note, contact or content. A count that cannot be written is ignored: it never changes a
   *  refusal's answer, and it decides nothing. */
  #tallyRefusal(nowMs, limitReached = false) {
    try {
      const at = Number.isFinite(Number(nowMs)) ? Number(nowMs) : Date.now();
      const day = new Date(at).toISOString().slice(0, 10);
      const oldest = new Date(Date.parse(`${day}T00:00:00Z`) - (TALLY_DAYS - 1) * 86400000).toISOString().slice(0, 10);
      const reached = limitReached === true ? 1 : 0;
      this.#tx(() => {
        this.#sql.exec(`INSERT INTO doorbell_tally (day, refused, limit_reached) VALUES (?, 1, ?)
                        ON CONFLICT(day) DO UPDATE SET refused = refused + 1, limit_reached = limit_reached + excluded.limit_reached`,
                       day, reached);
        if (reached) this.#sql.exec(`INSERT INTO doorbell_limit_last (id, day) VALUES (1, ?)
                                     ON CONFLICT(id) DO UPDATE SET day = MAX(day, excluded.day)`, day);
        this.#sql.exec(`DELETE FROM doorbell_tally WHERE day < ?`, oldest);
      });
    } catch { /* the tally is status: a count that cannot be written changes nothing */ }
  }

  /** R20 (N703; K1875, DEC-165, DEC-166): one refused hand-over in the security tally, through `credentials`'
   *  `securityCount({kind: "handover", country})` (its R44), beside R19's tally. `country` is the control plane's stamp
   *  (Cloudflare's two-letter label for the request), never the body's; nothing else of the knock reaches the count. A
   *  count that cannot be written is dropped: it never changes the refusal's answer, R10's order or R19's tally, and
   *  this module keeps no table for it. */
  #securityCount(country) {
    try {
      const cr = this.#credentials();
      if (cr && typeof cr.securityCount === "function")
        cr.securityCount({ kind: "handover", country: typeof country === "string" && country ? country : null });
    } catch { /* the security tally is status: a count that cannot be written changes nothing */ }
  }

  /* R19, R20: a refusal answered, counted first in both tallies. */
  #refusedKnock(answer, nowMs, country = null) {
    this.#tallyRefusal(nowMs, answer && answer[Doorbell.#LIMIT_REACHED] === true);
    this.#securityCount(country);
    return answer;
  }

  /** R19, R20: a knock the Worker refused before the store was asked to keep anything (R6–R8, the required-argument
   *  refusals, R14's weak secret), counted in the doorbell's tally and the security tally (`country` the control
   *  plane's stamp, or null). Answers `{counted: true}` and never throws. */
  doorbellRefused({ now = null, country = null } = {}) {
    this.#refusedKnock(null, now != null && now !== "" && Number.isFinite(Number(now)) ? Number(now) : Date.now(), country);
    return { counted: true };
  }

  /** R19: the tally, to a member session only: the kept days with at least one refusal, newest first, and the day the
   *  whole-doorbell limit was last reached, or null. It is status, read where the inbox is read; it writes nothing and
   *  never notifies. */
  doorbellTally({ viewer = null, now = null } = {}) {
    if (!viewerPredicate(viewer).member || !/^member:/.test(String(viewer)))
      return { ok: false, reason: "MEMBER_SESSION_REQUIRED", status: 403,
               detail: "the doorbell's tally is read by a signed-in member; nothing was read" };
    const at = now != null && now !== "" && Number.isFinite(Number(now)) ? Number(now) : Date.now();
    const today = new Date(at).toISOString().slice(0, 10);
    const oldest = new Date(Date.parse(`${today}T00:00:00Z`) - (TALLY_DAYS - 1) * 86400000).toISOString().slice(0, 10);
    const days = this.#rows(`SELECT day, refused, limit_reached FROM doorbell_tally WHERE day >= ? AND refused > 0 ORDER BY day DESC`, oldest)
      .map((r) => ({ day: r.day, refused: Number(r.refused), limit_reached: Number(r.limit_reached) }));
    const last = this.#one(`SELECT day FROM doorbell_limit_last WHERE id = 1`);
    return { ok: true, days, last_limit_reached: last ? last.day : null };
  }

  /* R2: the two windows one knock is asked against: the source's (a keyed fingerprint, R12) and the instance's, the
     current bucket and the previous one, with how far into the current window `nowMs` is. */
  async #rateWindows({ sourceAddress, nowMs, windowMs = KNOCK.windowMs, perIpLimit = KNOCK.perIp, globalLimit = KNOCK.global }) {
    const win = Math.floor(nowMs / windowMs);
    const fp = await this.sourceFingerprint(sourceAddress);
    return { ipBucket: `ip:${fp}:${win}`, ipPrevBucket: `ip:${fp}:${win - 1}`, globalBucket: `all:${win}`,
             globalPrevBucket: `all:${win - 1}`, elapsedFrac: (nowMs - win * windowMs) / windowMs, perIpLimit, globalLimit, win };
  }

  /* R2: ask the rate again and, when it admits, count one knock in both windows; in the caller's transaction, so a
     race cannot slip past the caps. Answers the rate refusal, or null once counted. */
  #countKnock(rate) {
    const late = this.#knockRateRefusal(rate);
    if (late) return late;
    for (const b of [rate.ipBucket, rate.globalBucket])
      this.#sql.exec(`INSERT INTO knock_rate (bucket,count) VALUES (?,1) ON CONFLICT(bucket) DO UPDATE SET count=count+1`, b);
    /* The prune keeps win AND win-1 (D-496): the previous bucket is read by the estimate, so deleting it would
       silently restore the fixed bucket at the edge. Part of the subject, not housekeeping. */
    this.#sql.exec(`DELETE FROM knock_rate WHERE bucket NOT LIKE '%:' || ? AND bucket NOT LIKE '%:' || ?`,
                   String(rate.win), String(rate.win - 1));
    return null;
  }

  /** R17 (K539; for `sources` R11): an attempt that counts as a knock from its source. R2's two windows are asked
   *  exactly as `knock` asks them: a refusal is R2's (`RATE_IP` or `RATE_GLOBAL`, with `stated`, the published bound)
   *  and counts nothing; an admitted attempt is counted in both windows, in one transaction that asks again, and
   *  answers null. Nothing else is written. */
  async knockAttempt({ sourceAddress = null, now = null, country = null } = {}) {
    const nowMs = now != null && now !== "" && Number.isFinite(Number(now)) ? Number(now) : Date.now();
    const rate = await this.#rateWindows({ sourceAddress, nowMs });
    const refusal = this.#knockRateRefusal(rate) || this.#tx(() => this.#countKnock(rate));
    if (!refusal) return null;
    /* R19, R20: every refusal R17 answers is counted in both tallies. */
    this.#refusedKnock(refusal, nowMs, country);
    return { ...refusal, stated: refusal.reason === "RATE_IP" ? KNOCK.statedPerIp : KNOCK.statedGlobal };
  }

  /** R2, R3, R10, R11: an accepted knock. `sourceAddress` is the connecting address, reduced here to a keyed
   *  fingerprint. The rate is asked first and changes nothing when it refuses; the bytes (with an evidence store)
   *  are stored BEFORE the row, so a row never stands without its bytes (R11: a failed store answers a failure
   *  and leaves no row); the row and the rate count land in ONE transaction that asks the rate again, so a race
   *  cannot slip past the caps. A knock refused on that second ask stores no bytes of its own: the object is
   *  removed unless another knock's row already names the same digest. */
  async knock({ contentB64 = null, content = null, note, contact, sourceAddress = null, windowMs = KNOCK.windowMs,
                perIpLimit = KNOCK.perIp, globalLimit = KNOCK.global, now = null, knockerSecret = null,
                generateSecret = false, country = null } = {}) {
    const nowMs = now != null && now !== "" && Number.isFinite(Number(now)) ? Number(now) : Date.now();
    let bytes;
    try {
      bytes = contentB64 != null ? Uint8Array.from(atob(contentB64), (c) => c.charCodeAt(0)) : te.encode(String(content ?? ""));
    } catch { return this.#refusedKnock({ ok: false, reason: "BAD_CONTENT", detail: "the content did not decode" }, nowMs, country); }
    /* R10, R14: a weak secret before the rate: nothing is stored, and nothing counted but the tallies (R19, R20). */
    if (isWeakKnockerSecret(knockerSecret)) return this.#refusedKnock(knockerSecretWeak(), nowMs, country);
    const sha = hexOf(await crypto.subtle.digest("SHA-256", bytes));
    const rate = await this.#rateWindows({ sourceAddress, nowMs, windowMs, perIpLimit, globalLimit });
    const early = this.#knockRateRefusal(rate);
    if (early) return this.#refusedKnock(early, nowMs, country);
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
    /* R14: the knocker's continuity. A supplied secret is used; `generateSecret` makes one of 128 random bits, shown
       in this answer only. Only the keyed digest and the pseudonym derived from it are kept. */
    let secret = typeof knockerSecret === "string" ? knockerSecret : null, generated = null;
    if (!secret && generateSecret === true) {
      const r = new Uint8Array(16);
      crypto.getRandomValues(r);
      secret = generated = base32Of(r);
    }
    const knockerDigest = secret ? await Doorbell.#knockerDigest(this.#knockerKey(), secret) : null;
    const pseudonym = knockerDigest ? pseudonymOf(knockerDigest) : null;
    const knockId = `KNOCK-${new Date(nowMs).toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}`;
    const received = new Date(nowMs).toISOString();
    const answer = this.#tx(() => {
      const late = this.#countKnock(rate);
      if (late) return late;
      this.#sql.exec(
        `INSERT INTO inbox (knock_id,sha256,bytes,content,in_r2,note,contact,received,status,knocker_digest,pseudonym,content_b64)
         VALUES (?,?,?,?,?,?,?,?,'new',?,?,?)`,
        knockId, sha, bytes.length, bucket ? null : new TextDecoder().decode(bytes), bucket ? 1 : 0,
        String(note ?? "").slice(0, 2000), String(contact ?? "").slice(0, 300), received, knockerDigest, pseudonym,
        bucket ? null : b64Of(bytes));
      return { ok: true, knockId, sha256: sha, bytes: bytes.length, pseudonym, ...(generated ? { secret: generated } : {}) };
    });
    if (!answer.ok && stored && !this.#one(`SELECT 1 AS x FROM inbox WHERE sha256 = ?`, sha)) {
      try { await bucket.delete?.(key); } catch { /* an orphaned content-addressed object is harmless */ }
    }
    /* R19, R20: a knock refused on the second ask is counted, outside the refused transaction, which rolled back. */
    return answer.ok ? answer : this.#refusedKnock(answer, nowMs, country);
  }

  /** R3: only a signed-in member reaches these (the op's fence). N90: at most `limit` knocks, paged by `after`: a
   *  doorbell anyone may ring must not answer a member with everything it was ever handed. Each row names its knocker's
   *  pseudonym and digest (R14, null without a secret), once pulled its capture (R13), the reason, who and when of its
   *  last status change, and `project`: the project of the document a pulled knock was brought into (its capture's home,
   *  provenance R4 over the register's read contract, R48, and that bundle's `project`, record-core R37), null until
   *  then. DEC-108 (2): sorted by `sort` (`received`, the default, newest first; `status`; `secret`, whether a knocker
   *  secret was presented; `project`, a knock with none last in either direction) in `dir`, ties by received time,
   *  newest first. An unknown `sort` or `dir` is the required-argument refusal naming it, with nothing read. */
  inboxList(status, { limit = null, after = null, sort = null, dir = null } = {}) {
    const by = sort == null || sort === "" ? "received" : sort;
    if (!INBOX_SORTS.includes(by)) return Doorbell.#badArgument("inbox", "sort", INBOX_SORTS.join(" | "), by);
    const way = dir == null || dir === "" ? (by === "received" ? "desc" : "asc") : dir;
    if (!SORT_DIRS.includes(way)) return Doorbell.#badArgument("inbox", "dir", SORT_DIRS.join(" | "), way);
    const cap = limitOf(limit);
    const from = after ? keyOf(after, 4) : null;
    if (after && !from) return badCursor();
    /* k0 puts a knock with no project last in either direction; k1 is the order asked; received time, newest first,
       then the id break every tie. Every key is text, so the cursor is the four of the last row listed. */
    const k1 = { received: "i.received", status: "i.status",
                 secret: "CASE WHEN i.knocker_digest IS NULL THEN '0' ELSE '1' END", project: "COALESCE(b.project, '')" }[by];
    const k0 = by === "project" ? "CASE WHEN b.project IS NULL OR b.project = '' THEN '1' ELSE '0' END" : "'0'";
    const op = way === "asc" ? ">" : "<";
    const found = this.#rows(
      `SELECT * FROM (SELECT i.knock_id, i.sha256, i.bytes, i.in_r2, i.note, i.contact, i.received, i.status, i.resolved,
                             i.resolved_by, i.resolve_reason, i.knocker_digest, i.pseudonym, i.capture_sha, i.pulled_by,
                             i.pulled_at, b.project AS project, ${k0} AS k0, ${k1} AS k1
                        FROM inbox i LEFT JOIN register r ON r.capture_sha = i.capture_sha
                        LEFT JOIN bundles b ON b.bundle_id = r.bundle_id
                       WHERE ${status ? "i.status = ?" : "1=1"}) q
        WHERE ${from ? `(k0 > ? OR (k0 = ? AND (k1 ${op} ? OR (k1 = ? AND (received, knock_id) < (?, ?)))))` : "1=1"}
        ORDER BY k0 ASC, k1 ${way.toUpperCase()}, received DESC, knock_id DESC LIMIT ?`,
      ...(status ? [status] : []), ...(from ? [from[0], from[0], from[1], from[1], from[2], from[3]] : []), cap + 1);
    const rows = found.slice(0, cap), truncated = found.length > cap, last = rows[rows.length - 1];
    const inbox = rows.map(({ k0: _k0, k1: _k1, ...r }) => ({ ...r, project: r.project || null }));
    return { inbox, sort: by, dir: way, limit: cap, truncated,
             next: truncated ? cursorOf([String(last.k0), String(last.k1), last.received, last.knock_id]) : null };
  }

  /* R3 (DEC-108 (2)): the required-argument refusal for an argument this module reads that names nothing it knows
     (the control plane's C-61 shape, answered from the store as `monitoring`'s store-side refusals are). */
  static #badArgument(op, argument, shape, given) {
    return { ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, status: 400,
             error: `${argument} must be one of ${shape}; ${JSON.stringify(String(given)).slice(0, 80)} is not`,
             detail: `op=${op} needs '${argument}' in the shape ${shape}, and this request carried none the operation `
                   + "could use. Nothing was read." };
  }

  /* R3 (K383, K275): a knock id no knock answers to, read or resolved, is one condition with its own code and row
     (C-118.2), not capture R63's `EVIDENCE_NOT_HELD`; minted here alone, so the read and the resolve answer it identically. */
  #noSuchKnock(knockId) {
    /* DEC-49 REGION is-knock-held */
    const row = DOORBELL_CHECKS.NO_SUCH_KNOCK;
    return { ok: false, reason: "NO_SUCH_KNOCK", code: "NO_SUCH_KNOCK", check: row.check, translation: row.translation,
             knockId: typeof knockId === "string" ? knockId : null };
    /* END DEC-49 REGION is-knock-held */
  }

  inboxGet(knockId) {
    if (typeof knockId !== "string" || !knockId) return this.#noSuchKnock(knockId);
    const r = this.#one(`SELECT knock_id, sha256, bytes, content, in_r2, note, contact, received, status, resolved, resolved_by,
                                resolve_reason, knocker_digest, pseudonym, capture_sha, pulled_by, pulled_at FROM inbox WHERE knock_id=?`, knockId);
    return r ? { ok: true, item: r } : this.#noSuchKnock(knockId);
  }

  /** R3: a member moves a knock to `discarded` or back to `new`, recorded with who, when and the member's own reason
   *  (DEC-88 (2)). `pulled` is R13's act for that knock and answers as `pullKnock` does (a promise), once its reason is
   *  admitted, the reason recorded on the row with the pull: a knock becomes `pulled` only by being brought in. Refused
   *  in order: `BAD_STATUS`, `NO_SUCH_KNOCK`, `RESOLVE_NO_REASON` (C-118.7), each before anything is written. N499
   *  (K1105): the `pulled` arm takes `at` and `within` as `pullKnock` does, so the control plane's reasoned resolve is
   *  one act with its promotion (control-plane R36) and the reason lands on the row inside it; the other arms ignore
   *  them. */
  inboxResolve({ knockId, status, by, reason, at = null, within = null } = {}) {
    if (!["pulled", "discarded", "new"].includes(status)) return { ok: false, reason: "BAD_STATUS" };
    if (typeof knockId !== "string" || !knockId || !this.#one(`SELECT knock_id FROM inbox WHERE knock_id=?`, knockId))
      return this.#noSuchKnock(knockId);
    /* DEC-49 REGION is-resolve-reasoned */
    if (!reasonGiven(reason)) {
      const row = DOORBELL_CHECKS.RESOLVE_NO_REASON;
      return { ok: false, reason: "RESOLVE_NO_REASON", code: "RESOLVE_NO_REASON", check: row.check, translation: row.translation,
               knockId, status: 400, maxChars: REASON_MAX };
    }
    /* END DEC-49 REGION is-resolve-reasoned */
    if (status === "pulled") return this.#pull({ knockId, by, at, within }, reason);
    this.#tx(() => this.#sql.exec(`UPDATE inbox SET status=?, resolved=?, resolved_by=?, resolve_reason=? WHERE knock_id=?`,
                                  status, new Date().toISOString(), by ?? null, reason, knockId));
    return { ok: true, knockId, status, resolve_reason: reason };
  }

  /** R13 (N364; DEC-78 item 1): bring a knock into the record as a capture. The member-session fence is the op's; `by`
   *  is its stamp. Refused in order: `NO_SUCH_KNOCK` (C-118.2), `KNOCK_DISCARDED` (C-118.4), capture R63's absence when the
   *  knock's bytes are gone. A knock already pulled answers `existed: true` with the same document. Otherwise, in one
   *  act: the bytes are held under their own digest in the evidence store, one acquisition receipt is written
   *  (`via: "doorbell"`, address `knock:<knockId>`), the knock becomes `pulled` naming the capture, `by` and the
   *  instant, and `by` is recorded as the capture's actor. The answer carries the provenance document (`acquisition` R16) the
   *  control plane promotes at `collected`; it never carries `contact` (R16), and nothing here writes a bundle (`acquisition` R25).
   *
   *  N380 (K559): `within`, the seam that makes the pull and the control plane's promotion one act (control-plane R36).
   *  `pullKnock` is async and the record's transaction is synchronous, so no caller can wrap both; `within(document)` is
   *  called INSIDE the pull's own transaction, after the receipt, the knock's `pulled` update and the actor, and what it
   *  writes lands or rolls back with them. Its `{ok: false, …}` rolls the whole pull back and is the answer; a throw, or
   *  an answer that is not synchronous (a promise would outlive the transaction), rolls it back as `PULL_WITHIN_FAILED`.
   *  Any other answer is carried as `within`. A knock already pulled does not call it: its pull is not being made. The
   *  bytes put under their own digest before the transaction stay, content-addressed and already held as the knock's. */
  pullKnock({ knockId, by, at = null, within = null } = {}) { return this.#pull({ knockId, by, at, within }, null); }

  /* R13, and R3's `pulled` arm: the pull, with the resolve's admitted reason recorded on the row beside it (null for a
     pull asked directly, which takes no reason). */
  async #pull({ knockId, by, at = null, within = null } = {}, reason) {
    if (typeof by !== "string" || !by.trim())
      return { ok: false, reason: "NO_PULLER", status: 400,
               detail: "a knock is brought in by a member, whose stamp names them; none was given, so nothing was written" };
    if (typeof knockId !== "string" || !knockId) return this.#noSuchKnock(knockId);
    const row = this.#one(`SELECT * FROM inbox WHERE knock_id = ?`, knockId);
    if (!row) return this.#noSuchKnock(knockId);
    /* DEC-49 REGION is-knock-pullable */
    if (row.status === "discarded") {
      const k = DOORBELL_CHECKS.KNOCK_DISCARDED;
      return { ok: false, reason: "KNOCK_DISCARDED", code: "KNOCK_DISCARDED", check: k.check, translation: k.translation,
               knockId, status: 409 };
    }
    /* END DEC-49 REGION is-knock-pullable */
    if (row.capture_sha) {
      let document = null;
      try { document = row.pulled_document ? JSON.parse(row.pulled_document) : null; } catch { document = null; }
      return { ok: true, existed: true, knockId, capture: { sha256: row.capture_sha, bytes: row.bytes },
               pulled_by: row.pulled_by, pulled_at: row.pulled_at, ...(document ? { document } : {}) };
    }
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    if (!ev) {
      /* C-68.1 (K794, K797): the installation's complaint carries its row, which acquisition holds as its earliest raiser. */
      const row = INSTALLATION_CHECKS.EVIDENCE_STORAGE_NOT_CONFIGURED;
      return { ok: false, reason: "EVIDENCE_STORAGE_NOT_CONFIGURED", code: "EVIDENCE_STORAGE_NOT_CONFIGURED", check: row.check,
               translation: row.translation, status: 503, knockId,
               detail: "this group's Civicsmith has no evidence storage configured, so the knock's bytes cannot be held under their own digest; nothing was written" };
    }
    /* The bytes as received: the evidence bucket's inbox object, else the inline copy. They must hash to the row's digest. */
    let bytes = null;
    try {
      if (row.in_r2) {
        const bucket = this.env && typeof this.env.CAPTURES?.get === "function" ? this.env.CAPTURES : null;
        const obj = bucket ? await bucket.get(`bio/inbox/${row.sha256}`) : null;
        if (obj) bytes = new Uint8Array(await obj.arrayBuffer());
      } else if (typeof row.content_b64 === "string") {
        bytes = Uint8Array.from(atob(row.content_b64), (c) => c.charCodeAt(0));
      } else if (typeof row.content === "string") {
        bytes = te.encode(row.content);
      }
    } catch { bytes = null; }
    if (bytes && hexOf(await crypto.subtle.digest("SHA-256", bytes)) !== row.sha256) bytes = null;
    if (!bytes) {
      const a = evidenceAbsent(row.sha256, "bio", { knockId, status: 404,
        detail: "the knock's bytes are no longer held as received (gone, or no longer hashing to the knock's digest), so nothing was written" });
      return a.body;
    }
    const sha = row.sha256;
    try { if (!(await ev.head(sha))) await ev.put(sha, bytes); }
    catch { return { ok: false, reason: "PULL_NOT_STORED", status: 502, knockId,
                     detail: "the knock's bytes could not be held under their own digest, so nothing was written" }; }
    const when = typeof at === "string" && ISO_INSTANT.test(at) ? at : stampSecond();
    const address = `knock:${knockId}`;
    /* N615 (K1683, K1773): the origin `doctypeFor` is handed. `"member"` is only for bytes a member supplied by their own
       act under their session; a knock is made with no account (R1) and its row names no member session, so no knock
       is one, and every pull is profiled as `"fetch"`: a type read only from a member's own capture (court-doctypes R2)
       never matches a stranger's knock, whoever brings it in. */
    const profile = await profileOf({ ev, sha, ct: null, total: bytes.length, multipart: false, headers: {}, locator: address,
                                      view: profileView(this.core), retrieved: when, origin: "fetch" });
    const document = this.#pulledDocument(row, { by, at: when, profile });
    const receiptOf = (fn) => { try { return fn(); } catch (e) { return { recorded: false, error: String(e && e.message || e).slice(0, 200) }; } };
    /* N409 (K609): one fixed sentence. A thrown message is the caller's internals (a store fault names a table, a
       stack names a file), so it never rides in the answer; the fault is a programming fault, found in the caller. */
    const withinFailed = () => ({ ok: false, reason: "PULL_WITHIN_FAILED", status: 500, knockId, detail: PULL_WITHIN_FAILED_DETAIL });
    let done;
    try {
      done = this.#tx(() => {
        const receipt = receiptOf(() => this.provenance?.recordReceipt?.({ address, addressNorm: address, captureSha: sha, retrieved: when,
                                                                            via: DOORBELL_VIA, retrievalLocator: null }));
        if (!receipt || receipt.recorded !== true)
          return { ok: false, reason: "RECEIPT_NOT_WRITTEN", status: 502, knockId,
                   detail: "the acquisition receipt could not be written, so the knock stays as it was and nothing was filed" };
        this.#sql.exec(`UPDATE inbox SET status = 'pulled', resolved = ?, resolved_by = ?, capture_sha = ?, pulled_by = ?, pulled_at = ?,
                          pulled_document = ?, resolve_reason = ? WHERE knock_id = ?`,
                       when, by, sha, by, when, JSON.stringify(document), reason, knockId);
        this.capture.recordCaptureActor({ captureSha: sha, actor: by, at: when });
        if (typeof within !== "function") return { ok: true, receipt };
        const w = Doorbell.#callWithin(within, document);
        if (w && typeof w === "object" && w.ok === false) return { ...w, knockId: w.knockId ?? knockId };
        return { ok: true, receipt, within: w ?? null };
      });
    } catch (e) {
      if (e && typeof e === "object" && WITHIN_FAULT in e) return withinFailed();
      throw e;
    }
    if (!done.ok) return done;
    return { ok: true, existed: false, knockId, capture: { sha256: sha, bytes: bytes.length }, pulled_by: by, pulled_at: when,
             receipt: { address, via: DOORBELL_VIA, retrieved: when, observation: done.receipt.observation ?? null }, document,
             ...(typeof within === "function" ? { within: done.within } : {}) };
  }

  /* N380 (R13, capture R86): the caller's act, called inside the act's own transaction with its own copy of the document. Its
     throw is tagged so a fault of the act's own still throws; an answer that is not synchronous (a promise would outlive
     the transaction, its outcome dropped with it) is tagged likewise. Answers what `within` answered. */
  static #callWithin(within, document) {
    let w;
    try { w = within(structuredClone(document)); } catch { throw { [WITHIN_FAULT]: true }; }
    if (w && typeof w.then === "function") {
      Promise.resolve(w).catch(() => {});
      throw { [WITHIN_FAULT]: true };
    }
    return w;
  }

  /* R13 (`acquisition` R16): the provenance document of a pulled knock. Received, not fetched (provenance R51): no fetched letter, no
     transport; the knocker is its source, unnamed, and the note travels as the knocker's words, never as evidence of
     their truth. The contact is never in it (R16). */
  #pulledDocument(row, { by, at, profile }) {
    const locator = `knock:${row.knock_id}`;
    const name = String(row.knock_id).replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100);
    return {
      file: `snapshots/${name}`, locator, retrieved: at,
      profile,
      authority_state: "undetermined",
      authority_basis: `material handed to the group through its doorbell by an unnamed knocker; no authority is asserted; recorded ${at} for resolution through the task list`,
      provenance_chain: [{
        /* R13 (N541): the first hop's `who` in acquisition's one spelling (its R33), never a copy. A document pulled
           before T31 keeps its `who` as written (DEC-124), answered again as stored (`pulled_document`). */
        who: firstHopWho(this.env.INSTANCE_NAME, this.env.VERSION),
        asserts: `these bytes were received at the doorbell of your group's Civicsmith as knock ${row.knock_id} at ${row.received}, `
               + `and brought into the record by ${by} at ${at}; they were received, not fetched from any address`,
        evidence: "the knock's receipt: its digest, taken as the bytes arrived, and its instant",
        bound: false, via: DOORBELL_VIA,
      }],
      capture: {
        method: "doorbell knock, received, hashed at receipt",
        grade: null, grade_basis: "CAPTURE_RECEIVED_NOT_FETCHED",
        actor_class: "member", actor: by,
        sha256: row.sha256, encoding: "binary", bytes: row.bytes,
      },
      source: { kind: "knocker", named: false, pseudonym: row.pseudonym ?? null,
                receipt: { knock_id: row.knock_id, sha256: row.sha256, bytes: row.bytes, received: row.received } },
      knocker_note: { text: String(row.note ?? ""), words_of: "the knocker", evidence_of_truth: false },
      origin: { kind: "doorbell", knock_id: row.knock_id },
      attestation_attempts: [],
    };
  }

  /** R15: the knocks sharing a pseudonym, oldest first, to a member session (the op's fence), with the continuity
   *  sentence and never an identity: no contact is answered (R16). At most `limit` (N90), paged by `after`. */
  knocksOf({ pseudonym, limit = null, after = null } = {}) {
    if (typeof pseudonym !== "string" || !pseudonym)
      return { ok: false, reason: "NO_PSEUDONYM", detail: "knocksOf names the pseudonym whose knocks it lists" };
    const cap = limitOf(limit);
    const from = after ? keyOf(after, 2) : ["", ""];
    if (!from) return badCursor();
    const found = this.#rows(
      `SELECT knock_id, sha256, bytes, note, received, status, capture_sha FROM inbox
        WHERE pseudonym = ? AND (received, knock_id) > (?, ?) ORDER BY received, knock_id LIMIT ?`, pseudonym, ...from, cap + 1);
    const knocks = found.slice(0, cap), truncated = found.length > cap, last = knocks[knocks.length - 1];
    return { ok: true, pseudonym, continuity: "the same knocker secret was presented", knocks, count: knocks.length,
             limit: cap, truncated, next: truncated ? cursorOf([last.received, last.knock_id]) : null };
  }

  /** R18 (K539; for `sources` R1): every knock pulled into a capture, oldest received first, to a member session (the
   *  op's fence), never a contact (R16); `[]` for none. One keyed read (`inbox_capture`). Never throws. */
  pulledKnocksOf(captureSha) {
    try {
      const sha = typeof captureSha === "string" ? captureSha.toLowerCase() : "";
      if (!HEX64.test(sha)) return [];
      return this.#rows(`SELECT knock_id, sha256, bytes, received, pseudonym, knocker_digest FROM inbox
                          WHERE capture_sha = ? ORDER BY received, knock_id`, sha).map((r) => ({ ...r }));
    } catch { return []; }
  }
}

/** The doorbell's routes on the plane's route map (the map's §2: the nine routes `captureOps` carried, moved; plane
 *  spreads them after capture's in its T42 job), each a function of no arguments answering what the named service
 *  answers. `url` carries the control plane's stamps (`source`, `country`, `viewer`, `by`), never the body's; `body` the
 *  parsed body. N90: every read a route answers is bounded here, whatever the caller omits (`limit` defaults to
 *  READ_LIMIT's), and pages by `after`. */
export function doorbellOps(d, url, body) {
  const q = (k) => url.searchParams.get(k);
  const page = { limit: q("limit") || READ_LIMIT.default, after: q("after") || null };
  return {
    /* R20: `country` is the control plane's stamp in the query, never the body's (nor is `sourceAddress`). */
    knock: () => d.knock({ ...(body || {}), sourceAddress: q("source"), country: q("country") }),
    inboxlist: () => d.inboxList(q("status") || null, { ...page, sort: q("sort"), dir: q("dir") }),
    inboxget: () => d.inboxGet(q("id")),
    /* N499: a body names no `at` or `within`: the pull's instant and its joined act are an in-process caller's. */
    inboxresolve: () => { const b = body || {}; return d.inboxResolve({ knockId: b.knockId, status: b.status, by: b.by, reason: b.reason }); },
    /* R19: the Worker's count of a knock it refused before the store; the tally read by the stamped viewer. */
    doorbellrefused: () => d.doorbellRefused({ now: body && body.now, country: q("country") }),
    doorbelltally: () => d.doorbellTally({ viewer: q("viewer") ?? "" }),
    /* N364: the control plane stamps `by` (the member session); a stamp in the query wins over a body's copy. */
    inboxpull: () => d.pullKnock({ knockId: (body && body.knockId) || q("id"), by: q("by") ?? (body && body.by) }),
    knocksof: () => d.knocksOf({ pseudonym: q("pseudonym") ?? (body && body.pseudonym), ...page }),
    pulledknocks: () => d.pulledKnocksOf(q("capture") ?? (body && body.captureSha)),
  };
}
