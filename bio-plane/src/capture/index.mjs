/* capture — what capture keeps (layer 3): the evidence store by digest, what capture learns about sources and sites
 * (reachability, site assets, links and the host's chrome, capture sessions, the platform's ceiling, the render
 * allowance), the event queue an undetermined capture raises, the doorbell (`doorbell.mjs`) and the information
 * grammar (`grammar.mjs`, C-2.7). The acquisition act is `acquisition`'s since T18 (K617): `acquire` and
 * `archiveLookup` hand it this module's store (R73). It writes no bundle: no intake path writes live state.
 * Requirements: build/requirements/capture.md (R8, R15, R21–R32, R37–R40, R43–R59, R63–R82). Extracted from `legacy-store` and
 * `legacy-index` in T4 (T4-4); the reasoning the legacy comments carried is kept beside the code it explains.
 *
 * SHAPE (K61). `captureOf(ctx, opts)` answers the one instance for a Durable Object's storage. It reaches
 * record-core by `recordOf(ctx)` on the same `ctx` (the evidence store, `transact`, `declarePurge`, settings) and
 * membership's `viewerPredicate` (R43) for what a viewer may see, credentials' `attestingKeys` (its R11) for R69, and
 * attestation's `attest` (its R1–R3) for R68's late co-attestation, and holds attestation's instance for the storage
 * (`attestationOf(ctx)`), which the acquisition act reaches as `cap.attestation` to sign an archive-sourced receipt
 * (its R4; R73, K1224). It reads provenance's `register` and `captured_locators` only on their stated read contract (provenance R48). It
 * calls no later module: a later module registers a listener (R44, R55; `on`) or a reader (R32's litigation hold, R78's
 * batch examination; `registerReader`). At its first construction for a
 * storage it registers its grammar (R37) and its figures (R75) with record-core. */
import { isPublicHttpsLocator, createSha256, isMachineIdentity } from "../record-grammar/index.mjs";
import { KNOCK, isWeakKnockerSecret, knockerSecretWeak } from "./doorbell.mjs";
import { CAPTURE_CHECKS, KNOCK_CHECKS } from "./checks.mjs";
import { INFORMATION_GRAMMAR } from "./grammar.mjs";
import { evidenceAbsent } from "./ops.mjs";
import { acquire, archiveLookup, profileOf, profileView, governedFetch, governedCall, INSTALLATION_CHECKS } from "../acquisition/index.mjs";
import { verifySshsig, NS_RATIFY, captureAccountStatement } from "../sshsig.mjs";
/* R69 (N530, K1336): the account statement is spelled once, by `signatures` (its R41); re-exported so the names this
   module's users import (`affordances`' tests among them) still resolve, with no spelling of capture's own. */
export { CAPTURE_ACCOUNT_TOKEN, captureAccountStatement } from "../sshsig.mjs";
import { ARCHIVE_SERVICE } from "../tsa.mjs";
export { acquireGradeNote, ACQUIRE_GRADE_NOTE } from "../acquisition/index.mjs";
import { ACQUIRE_GRADE_NOTE } from "../acquisition/index.mjs";
import { recordOf, PER_ITEM_MAX } from "../record-core/index.mjs";
import { governorOf } from "../host-governor/index.mjs";
import { provenanceOf, DOORBELL_VIA } from "../provenance/index.mjs";
import { attest, attestationOf } from "../attestation/index.mjs";
import { viewerPredicate, GATE_MARK, listenerRefusal } from "../membership/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { CAPTURE_SCHEMA, CAPTURE_DERIVED_SCHEMA, CAPTURE_ADDITIVE_COLUMNS, CAPTURE_RESHAPE,
         CAPTURE_PURGED_TABLES, CAPTURE_EXEMPT_TABLES } from "./schema.mjs";
export { CAPTURE_SCHEMA } from "./schema.mjs";
export { MONITOR_FREQ, INFORMATION_GRAMMAR, checkInformationExtension } from "./grammar.mjs";

/* A whole-second instant, the record's `…:00Z` spelling. */
const stampSecond = (when = Date.now()) => new Date(when).toISOString().replace(/\.\d+Z$/, "Z");
const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const HEX64 = /^[0-9a-f]{64}$/;
const te = new TextEncoder();
const hexOf = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const b64Of = (bytes) => { let out = ""; for (let i = 0; i < bytes.length; i += 0x8000) out += String.fromCharCode(...bytes.subarray(i, i + 0x8000)); return btoa(out); };

/* R66: Crockford's base32 (no I, L, O, U), for a secret a person copies and a pseudonym a person reads. */
const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const base32Of = (bytes) => {
  let bits = 0, value = 0, out = "";
  for (const b of bytes) { value = (value << 8) | b; bits += 8; while (bits >= 5) { out += B32[(value >>> (bits - 5)) & 31]; bits -= 5; } }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
};
/** R66: the pseudonym, a fixed readable derivation of the knocker digest: its first 80 bits in Crockford base32, in
 *  four groups of four. The same digest always reads the same, and it names no one. */
export const pseudonymOf = (digestHex) =>
  `knocker-${base32Of(Uint8Array.from(String(digestHex).slice(0, 20).match(/../g).map((h) => parseInt(h, 16)))).match(/.{4}/g).join("-")}`;

/* R69: a member id from a stamp, so `member:x` and `x` name one member. */
const memberIdOf = (who) => (typeof who === "string" ? who.replace(/^member:/, "") : "");

/* R68: the sentence every late attestation carries: what it proves, and what it does not. */
const lateSentence = (at) => `proves the bytes existed by ${at}, not at capture`;
/* R68: the raw replay of an archived locator (`/web/<ts>/` becomes `/web/<ts>id_/`): the bytes as the archive holds
   them, without its overlay, which is what a digest can be compared against. Null for a locator not of that shape. */
const rawReplayOf = (archived) => {
  const m = /^(https:\/\/web\.archive\.org\/web\/)(\d{14})(?:[a-z_]*)\/(.+)$/.exec(String(archived || ""));
  return m ? `${m[1]}${m[2]}id_/${m[3]}` : null;
};
const REPLAY_MAX = 256 * 1024 * 1024;

/* N380: the tag a throw of `pullKnock`'s `within` is carried out of the transaction under. */
const WITHIN_FAULT = Symbol("pullKnock: within's fault");
/** R65 (N409, K609): the one sentence `PULL_WITHIN_FAILED` answers, whatever `within` threw or answered. */
export const PULL_WITHIN_FAILED_DETAIL =
  "the act run with the pull did not complete, so the pull was rolled back and nothing was written";

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
/* The names of those settings in record-core, and of the walk's stagger (`acquisition` R19). */
export const REACHABILITY_SETTINGS = Object.freeze({ failures: "reachability_consecutive_failures",
                                                     days: "reachability_stale_days", minForAge: "reachability_min_failures_for_age" });
export const SUBRESOURCE_STAGGER_SETTING = "subresource_stagger_ms";

/* R23: a ceiling only ever learned downward would leave an upgraded account at the old caps forever. */
const PROBE_EVERY = 25;

/* N90: the one bound this module's reads publish (R24–R28, R32). CHOSEN, not measured: a page a member reads in one
   answer, never a size the record grows to. Every read over-fetches one row so `truncated` is a fact, not a guess. */
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

/* The events a later module may listen to (R44, R55), and the observation a reuse verdict maps to (the
   observation log's, its Suggestion). */
export const CAPTURE_EVENTS = Object.freeze(["source-outcome", "task", "compute", "observation"]);

/* The readers a later module may register, once at start, each taking one registration whoever makes it: whether any
   litigation hold is in place (R32; `actions` R52) and the batch-release examination of one document (R78;
   `ratification` R34). */
export const CAPTURE_READERS = Object.freeze(["litigation-hold", "batch-examination"]);

/* R32, R79, R81: the longest reason a member may give, in characters. */
export const REASON_MAX = 2000;
/* R32, R79, R81: a reason is a string with something other than white space in it, at most REASON_MAX characters. */
const reasonGiven = (r) => typeof r === "string" && r.trim() !== "" && [...r].length <= REASON_MAX;

/* R80 (BOB's privacy ruling): how many UTC days the tally keeps. */
export const TALLY_DAYS = 30;

/* R32 (DEC-108 (2)): the orders `inboxList` sorts by, and the directions. */
export const INBOX_SORTS = Object.freeze(["received", "status", "secret", "project"]);
export const SORT_DIRS = Object.freeze(["asc", "desc"]);
/* R77: the orders `heldCaptures` sorts by. */
export const HELD_SORTS = Object.freeze(["age", "source", "project"]);

const instances = new WeakMap();
/* R58 (N122, K155): for each instance, which of its options a caller supplied, so a later caller's option is judged
   against the right thing: one taken by default is adopted, one a caller gave must be the same. */
const supplied = new WeakMap();

/* Two `env`s are the same when they carry the same bindings, each the same value: the object a module was handed
   need not be the object another was handed for the one Durable Object. */
const sameEnv = (a, b) => {
  const ka = Object.keys(a || {}), kb = Object.keys(b || {});
  return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && a[k] === b[k]);
};

/** K61, R58: the one Capture for this object's storage. `opts`: `env` (the object's bindings: the evidence bucket
 *  for the inbox, the renderer, the instance's name), `governor` (host-governor's, `governorOf(ctx)` by default),
 *  `record` (`recordOf(ctx)`), `provenance` (`provenanceOf(ctx)`) and `attestation` (`attestationOf(ctx)`, K1224). A later call's option is never silently
 *  dropped (N122: a first caller without `env` stripped the plane's renderer from every later one): an `env` or
 *  `governor` the instance took by default is adopted from the first later caller that supplies it, and one that
 *  differs from what an earlier caller supplied throws, naming the option. A test may pass its own. */
export function captureOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let c = instances.get(storage);
  if (!c) {
    const record = opts.record ?? recordOf(ctx), provenance = opts.provenance ?? provenanceOf(ctx);
    c = new Capture(storage, { ...opts, record, provenance,
                               governor: opts.governor ?? governorOf(ctx, { env: opts.env ?? null }),
                               /* attestation's own instance for this host, over the record and provenance capture holds */
                               attestation: opts.attestation ?? attestationOf(ctx, { record, provenance }) });
    instances.set(storage, c);
    supplied.set(c, new Set(["env", "governor", "record", "provenance", "attestation"].filter((k) => opts[k] != null)));
    registerGrammar(c.core);
    registerFigures(c);
    return c;
  }
  const given = supplied.get(c);
  const refuse = (name) => {
    throw new Error(`captureOf: a caller supplied a different \`${name}\` for a storage whose capture already holds `
                  + `another one a caller gave; capture refuses it rather than run against either silently (R58)`);
  };
  /* Every option judged before any is adopted, so a refused call changes nothing. */
  if (opts.env != null && given.has("env") && !sameEnv(c.env, opts.env)) refuse("env");
  if (opts.governor != null && given.has("governor") && c.governor !== opts.governor) refuse("governor");
  for (const [name, held] of [["record", c.core], ["provenance", c.provenance], ["attestation", c.attestation]])
    if (opts[name] != null && opts[name] !== held) refuse(name);
  if (opts.env != null && !given.has("env")) { c.env = opts.env; given.add("env"); }
  if (opts.governor != null && !given.has("governor")) { c.governor = opts.governor; given.add("governor"); }
  return c;
}

/** R37 (C-2.7; K585 (3)): the information grammar, registered with record-core's seam (its R67) once per storage, when
 *  the instance is first made, so the audit and the gate run it in C-2.7's slot. Another module's grammar may claim the
 *  same slot (record-core R67, K766: their arms then run there in module order), so that is no refusal. A record with
 *  no seam (a test's stand-in) is left alone; a refusal is a defect of the wiring (capture registering twice, or a
 *  malformed entry) and throws, as the purge declaration's does, rather than leave the grammar silently unrun. */
function registerGrammar(record) {
  if (!record || typeof record.registerGrammar !== "function") return;
  const answer = record.registerGrammar("capture", INFORMATION_GRAMMAR);
  if (answer && answer.ok === false)
    throw new Error(`capture: record-core refused the information grammar: ${answer.reason}${answer.heldBy ? ` (held by ${answer.heldBy})` : ""}`);
}

/** R75 (`build/extraction/legacy-store.md` §4.2 (2)): this module's figures for `op=stats` and purge's proof, registered
 *  with record-core's `registerCounts` (its R63) once per storage, when the instance is first made. A record with no
 *  seam (a test's stand-in) is left alone; a refusal (another module reporting one of these figures, or capture
 *  registering twice) is a defect of the wiring and throws, as the grammar's does. */
function registerFigures(c) {
  const record = c.core;
  if (!record || typeof record.registerCounts !== "function") return;
  const answer = record.registerCounts("capture", [...Capture.COUNT_KEYS], (hid) => c.counts(hid));
  if (answer && answer.ok === false)
    throw new Error(`capture: record-core refused its figures: ${answer.reason}${answer.heldBy ? ` (held by ${answer.heldBy})` : ""}`);
}

export class Capture {
  #sql; #storage; #listeners = new Map(); #readers = new Map(); #declared = false;

  constructor(storage, { record, env = {}, governor = null, provenance = null, attestation = null, credentials = null } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    this.core = record;
    this.env = env || {};
    this.governor = governor;
    this.provenance = provenance;
    /* R73 (K1224): attestation's instance, which the acquisition act reaches as `cap.attestation` (its R4's
       `signReceipt`). */
    this.attestation = attestation;
    this.credentials = credentials;
  }

  /* credentials' instance for this storage (R69's attesting keys, its R11), reached when first needed. */
  #credentials() {
    if (!this.credentials) this.credentials = credentialsOf({ storage: this.#storage }, { record: this.core });
    return this.credentials;
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  /* N418 (K650): every write this module makes runs through record-core's `transact` (its R32): one transaction, a
     savepoint inside a caller's, rolled back whole by a throw or an `ok: false` answer, and record-core's `afterCommit`
     (its R66) holds what a listener asks inside it until the outermost commit. Only a Capture built with no record (a
     bare storage) falls back to the storage's own `transactionSync`. `fn` is synchronous. */
  #tx(fn) {
    return this.core && typeof this.core.transact === "function" ? this.core.transact(fn) : this.#storage.transactionSync(fn);
  }
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
   *  and a listener's failure never fails the act; its outcome is named. A malformed or second registration is
   *  refused by membership's `listenerRefusal` (its R81, N202: `LISTENER_MALFORMED` and `LISTENER_DECLARED` are
   *  minted at that one site), the slot's `event` beside its fields. */
  on(event, module, fn) {
    if (!CAPTURE_EVENTS.includes(event)) return { ok: false, reason: "UNKNOWN_EVENT", event };
    const list = this.#listeners.get(event) || [];
    const refused = listenerRefusal(list, module, fn, { event });
    if (refused) return refused;
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

  /** R32, R78: a later module registers, once at start, the reader of one of `CAPTURE_READERS`. Each slot takes one
   *  registration whoever makes it; a second, or a malformed one, is membership's `listenerRefusal` (its R81). */
  registerReader(slot, module, fn) {
    if (!CAPTURE_READERS.includes(slot)) return { ok: false, reason: "UNKNOWN_READER", slot };
    const refused = listenerRefusal(this.#readers.get(slot) || null, module, fn, { slot });
    if (refused) return refused;
    this.#readers.set(slot, { module, fn });
    return { ok: true, slot, module };
  }

  /** R32 (DEC-108 (5)): whether a discarded knock's row or bytes may be cleared now. Only when the registered
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

  /* ---- the acquisition act, `acquisition`'s (K617) ---- */

  /** R73: `acquisition`'s `acquire` (its R1–R23) with this module's store handed in; answers `{status, body}`. */
  acquire(body, opts) { return acquire(this, body, opts); }

  /** R73: `acquisition`'s `archiveLookup` (its R3), likewise. */
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

  /* N388: whether a viewer may see one capture, by `#captureGate` over the capture's own digest. */
  #captureSeen(sha, viewer) {
    if (viewer === undefined) return true;
    const gate = this.#captureGate("c.capture_sha", viewer);
    return !!this.#one(`SELECT 1 AS x FROM (SELECT ? AS capture_sha) c WHERE (${gate.sql})`, sha, ...gate.args);
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
      this.#tx(() => this.#sql.exec(`INSERT OR IGNORE INTO knock_key (id, key_hex, created) VALUES (1, ?, ?)`, hexOf(k), stampSecond()));
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

  /** R66: the key the knocker's secret is digested under: the operator's secret binding `KNOCKER_SECRET_KEY` when set,
   *  else the instance's own, generated once (256 random bits) and held in `knocker_key`, exempt from purge and
   *  answered by no op: R56's pattern, a separate key. With `create: false` it answers null rather than make one. */
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

  /* R66: the HMAC-SHA-256 of a secret under the knocker key, as 64 hex. */
  static async #knockerDigest(key, secret) {
    const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return hexOf(await crypto.subtle.sign("HMAC", k, te.encode(secret)));
  }

  /** R66: `{knocker_digest, pseudonym}` for a secret presented at this instance (`sources`' consent by secret). It
   *  writes nothing and never throws: with no knocker key yet (no knock has carried a secret here, and none is bound)
   *  or a secret that is not a non-empty string, both are null, and `basis` says which; a secret this instance never
   *  received answers its digest and pseudonym, which match no knock. */
  async knockerDigestOf(secret) {
    try {
      if (typeof secret !== "string" || secret === "")
        return { knocker_digest: null, pseudonym: null, basis: "no secret was presented" };
      const key = this.#knockerKey({ create: false });
      if (!key) return { knocker_digest: null, pseudonym: null,
                         basis: "no knock carrying a secret has been received at this instance, so no secret is recognised" };
      const knocker_digest = await Capture.#knockerDigest(key, secret);
      return { knocker_digest, pseudonym: pseudonymOf(knocker_digest) };
    } catch { return { knocker_digest: null, pseudonym: null, basis: "the digest could not be computed" }; }
  }

  /* D-508 / DEC-49: THE ONE HELPER THE TWO RATE REFUSALS ARE MINTED THROUGH. The row is read from this module's
     table (`KNOCK_CHECKS`, C-85) at the moment of the refusal, so this file holds no member-facing word, and THE CODE
     STAYS A STRING LITERAL AT ITS SITE. It THROWS on a missing row (R52): a throw is a 500 in a test, which is loud,
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
    /* R80: whether this knock found the whole doorbell at its limit, whichever refusal answers it. */
    const full = est(globalBucket, globalPrevBucket) >= globalLimit;
    const tag = (r) => Object.defineProperty(r, Capture.#LIMIT_REACHED, { value: full, enumerable: false });
    /* DEC-49 REGION is-knock-rate — D-508 / C-85.1, C-85.2. The SMALLEST SPAN in which either rate refusal is
       enforced. The instance's published bound (`stated`) is added by the op, never the translation. */
    if (est(ipBucket, ipPrevBucket) >= perIpLimit) return tag(Capture.#rateRefusal("RATE_IP"));
    if (full) return tag(Capture.#rateRefusal("RATE_GLOBAL"));
    /* END DEC-49 REGION is-knock-rate */
    return null;
  }

  /* R80: the mark a rate refusal carries, unseen in its answer, saying whether the whole doorbell was full. */
  static #LIMIT_REACHED = Symbol("the whole-doorbell limit was reached");

  /** R80: count one knock the doorbell turned away in the day's tally, and whether it found the whole-doorbell limit
   *  reached (R48), dropping any day older than the last `TALLY_DAYS`. Two counters and a date: no address, fingerprint,
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

  /* R80: a refusal answered, counted first. */
  #refusedKnock(answer, nowMs) {
    this.#tallyRefusal(nowMs, answer && answer[Capture.#LIMIT_REACHED] === true);
    return answer;
  }

  /** R80: a knock the Worker refused before the store was asked to keep anything (R49–R51, the required-argument
   *  refusals, R66's weak secret), counted in the tally and nowhere else. Answers `{counted: true}` and never throws. */
  doorbellRefused({ now = null } = {}) {
    this.#tallyRefusal(now != null && now !== "" && Number.isFinite(Number(now)) ? Number(now) : Date.now(), false);
    return { counted: true };
  }

  /** R80: the tally, to a member session only: the kept days with at least one refusal, newest first, and the day the
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

  /* R31: the two windows one knock is asked against: the source's (a keyed fingerprint, R56) and the instance's, the
     current bucket and the previous one, with how far into the current window `nowMs` is. */
  async #rateWindows({ sourceAddress, nowMs, windowMs = KNOCK.windowMs, perIpLimit = KNOCK.perIp, globalLimit = KNOCK.global }) {
    const win = Math.floor(nowMs / windowMs);
    const fp = await this.sourceFingerprint(sourceAddress);
    return { ipBucket: `ip:${fp}:${win}`, ipPrevBucket: `ip:${fp}:${win - 1}`, globalBucket: `all:${win}`,
             globalPrevBucket: `all:${win - 1}`, elapsedFrac: (nowMs - win * windowMs) / windowMs, perIpLimit, globalLimit, win };
  }

  /* R31: ask the rate again and, when it admits, count one knock in both windows; in the caller's transaction, so a
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

  /** R71 (K539; for `sources` R11): an attempt that counts as a knock from its source. R31's two windows are asked
   *  exactly as `knock` asks them: a refusal is R31's (`RATE_IP` or `RATE_GLOBAL`, with `stated`, the published bound)
   *  and counts nothing; an admitted attempt is counted in both windows, in one transaction that asks again, and
   *  answers null. Nothing else is written. */
  async knockAttempt({ sourceAddress = null, now = null } = {}) {
    const nowMs = now != null && now !== "" && Number.isFinite(Number(now)) ? Number(now) : Date.now();
    const rate = await this.#rateWindows({ sourceAddress, nowMs });
    const refusal = this.#knockRateRefusal(rate) || this.#tx(() => this.#countKnock(rate));
    if (!refusal) return null;
    /* R80: every refusal R71 answers is counted in the tally. */
    this.#refusedKnock(refusal, nowMs);
    return { ...refusal, stated: refusal.reason === "RATE_IP" ? KNOCK.statedPerIp : KNOCK.statedGlobal };
  }

  /** R31, R32, R53, R54: an accepted knock. `sourceAddress` is the connecting address, reduced here to a keyed
   *  fingerprint. The rate is asked first and changes nothing when it refuses; the bytes (with an evidence store)
   *  are stored BEFORE the row, so a row never stands without its bytes (R54: a failed store answers a failure
   *  and leaves no row); the row and the rate count land in ONE transaction that asks the rate again, so a race
   *  cannot slip past the caps. A knock refused on that second ask stores no bytes of its own: the object is
   *  removed unless another knock's row already names the same digest. */
  async knock({ contentB64 = null, content = null, note, contact, sourceAddress = null, windowMs = KNOCK.windowMs,
                perIpLimit = KNOCK.perIp, globalLimit = KNOCK.global, now = null, knockerSecret = null,
                generateSecret = false } = {}) {
    const nowMs = now != null && now !== "" && Number.isFinite(Number(now)) ? Number(now) : Date.now();
    let bytes;
    try {
      bytes = contentB64 != null ? Uint8Array.from(atob(contentB64), (c) => c.charCodeAt(0)) : te.encode(String(content ?? ""));
    } catch { return this.#refusedKnock({ ok: false, reason: "BAD_CONTENT", detail: "the content did not decode" }, nowMs); }
    /* R53, R66: a weak secret before the rate: nothing is stored, and nothing counted but R80's tally. */
    if (isWeakKnockerSecret(knockerSecret)) return this.#refusedKnock(knockerSecretWeak(), nowMs);
    const sha = hexOf(await crypto.subtle.digest("SHA-256", bytes));
    const rate = await this.#rateWindows({ sourceAddress, nowMs, windowMs, perIpLimit, globalLimit });
    const early = this.#knockRateRefusal(rate);
    if (early) return this.#refusedKnock(early, nowMs);
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
    /* R66: the knocker's continuity. A supplied secret is used; `generateSecret` makes one of 128 random bits, shown
       in this answer only. Only the keyed digest and the pseudonym derived from it are kept. */
    let secret = typeof knockerSecret === "string" ? knockerSecret : null, generated = null;
    if (!secret && generateSecret === true) {
      const r = new Uint8Array(16);
      crypto.getRandomValues(r);
      secret = generated = base32Of(r);
    }
    const knockerDigest = secret ? await Capture.#knockerDigest(this.#knockerKey(), secret) : null;
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
    /* R80: a knock refused on the second ask is counted, outside the refused transaction, which rolled back. */
    return answer.ok ? answer : this.#refusedKnock(answer, nowMs);
  }

  /** R32: only a signed-in member reaches these (the op's fence). N90: at most `limit` knocks, paged by `after`: a
   *  doorbell anyone may ring must not answer a member with everything it was ever handed. Each row names its knocker's
   *  pseudonym and digest (R66, null without a secret), once pulled its capture (R65), the reason, who and when of its
   *  last status change, and `project`: the project of the document a pulled knock was brought into (its capture's home,
   *  provenance R4 over the register's read contract, R48, and that bundle's `project`, record-core R37), null until
   *  then. DEC-108 (2): sorted by `sort` (`received`, the default, newest first; `status`; `secret`, whether a knocker
   *  secret was presented; `project`, a knock with none last in either direction) in `dir`, ties by received time,
   *  newest first. An unknown `sort` or `dir` is the required-argument refusal naming it, with nothing read. */
  inboxList(status, { limit = null, after = null, sort = null, dir = null } = {}) {
    const by = sort == null || sort === "" ? "received" : sort;
    if (!INBOX_SORTS.includes(by)) return Capture.#badArgument("inbox", "sort", INBOX_SORTS.join(" | "), by);
    const way = dir == null || dir === "" ? (by === "received" ? "desc" : "asc") : dir;
    if (!SORT_DIRS.includes(way)) return Capture.#badArgument("inbox", "dir", SORT_DIRS.join(" | "), way);
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

  /* R32 (DEC-108 (2)): the required-argument refusal for an argument this module reads that names nothing it knows
     (the control plane's C-61 shape, answered from the store as `monitoring`'s store-side refusals are). */
  static #badArgument(op, argument, shape, given) {
    return { ok: false, reason: "REQUIRED_ARGUMENT_MISSING", op, argument, shape, status: 400,
             error: `${argument} must be one of ${shape}; ${JSON.stringify(String(given)).slice(0, 80)} is not`,
             detail: `op=${op} needs '${argument}' in the shape ${shape}, and this request carried none the operation `
                   + "could use. Nothing was read." };
  }

  /* R32 (K383, K275): a knock id no knock answers to, read or resolved, is one condition with its own code and row
     (C-118.2), not R63's `EVIDENCE_NOT_HELD`; minted here alone, so the read and the resolve answer it identically. */
  #noSuchKnock(knockId) {
    /* DEC-49 REGION is-knock-held */
    const row = CAPTURE_CHECKS.NO_SUCH_KNOCK;
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

  /** R32: a member moves a knock to `discarded` or back to `new`, recorded with who, when and the member's own reason
   *  (DEC-88 (2)). `pulled` is R65's act for that knock and answers as `pullKnock` does (a promise), once its reason is
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
      const row = CAPTURE_CHECKS.RESOLVE_NO_REASON;
      return { ok: false, reason: "RESOLVE_NO_REASON", code: "RESOLVE_NO_REASON", check: row.check, translation: row.translation,
               knockId, status: 400, maxChars: REASON_MAX };
    }
    /* END DEC-49 REGION is-resolve-reasoned */
    if (status === "pulled") return this.#pull({ knockId, by, at, within }, reason);
    this.#tx(() => this.#sql.exec(`UPDATE inbox SET status=?, resolved=?, resolved_by=?, resolve_reason=? WHERE knock_id=?`,
                                  status, new Date().toISOString(), by ?? null, reason, knockId));
    return { ok: true, knockId, status, resolve_reason: reason };
  }

  /** R65 (N364; DEC-78 item 1): bring a knock into the record as a capture. The member-session fence is the op's; `by`
   *  is its stamp. Refused in order: `NO_SUCH_KNOCK` (C-118.2), `KNOCK_DISCARDED` (C-118.4), R63's absence when the
   *  knock's bytes are gone. A knock already pulled answers `existed: true` with the same document. Otherwise, in one
   *  act: the bytes are held under their own digest in the evidence store, one acquisition receipt is written
   *  (`via: "doorbell"`, address `knock:<knockId>`), the knock becomes `pulled` naming the capture, `by` and the
   *  instant, and `by` is recorded as the capture's actor. The answer carries the provenance document (`acquisition` R16) the
   *  control plane promotes at `collected`; it never carries `contact` (R70), and nothing here writes a bundle (`acquisition` R25).
   *
   *  N380 (K559): `within`, the seam that makes the pull and the control plane's promotion one act (control-plane R36).
   *  `pullKnock` is async and the record's transaction is synchronous, so no caller can wrap both; `within(document)` is
   *  called INSIDE the pull's own transaction, after the receipt, the knock's `pulled` update and the actor, and what it
   *  writes lands or rolls back with them. Its `{ok: false, …}` rolls the whole pull back and is the answer; a throw, or
   *  an answer that is not synchronous (a promise would outlive the transaction), rolls it back as `PULL_WITHIN_FAILED`.
   *  Any other answer is carried as `within`. A knock already pulled does not call it: its pull is not being made. The
   *  bytes put under their own digest before the transaction stay, content-addressed and already held as the knock's. */
  pullKnock({ knockId, by, at = null, within = null } = {}) { return this.#pull({ knockId, by, at, within }, null); }

  /* R65, and R32's `pulled` arm: the pull, with the resolve's admitted reason recorded on the row beside it (null for a
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
      const k = CAPTURE_CHECKS.KNOCK_DISCARDED;
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
               detail: "this instance has no evidence storage configured, so the knock's bytes cannot be held under their own digest; nothing was written" };
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
    const profile = await profileOf({ ev, sha, ct: null, total: bytes.length, multipart: false, headers: {}, locator: address,
                                      view: profileView(this.core), retrieved: when });
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
        this.recordCaptureActor({ captureSha: sha, actor: by, at: when });
        if (typeof within !== "function") return { ok: true, receipt };
        /* N380: the caller's act, in this transaction. Its throw is tagged so a fault of the pull's own still throws. */
        let w;
        try { w = within(structuredClone(document)); } catch { throw { [WITHIN_FAULT]: true }; }
        if (w && typeof w.then === "function") {
          /* A promise would outlive the transaction; its outcome is dropped with it. */
          Promise.resolve(w).catch(() => {});
          throw { [WITHIN_FAULT]: true };
        }
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

  /* R65, R16: the provenance document of a pulled knock. Received, not fetched (provenance R51): no fetched letter, no
     transport; the knocker is its source, unnamed, and the note travels as the knocker's words, never as evidence of
     their truth. The contact is never in it (R70). */
  #pulledDocument(row, { by, at, profile }) {
    const locator = `knock:${row.knock_id}`;
    const name = String(row.knock_id).replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100);
    return {
      file: `snapshots/${name}`, locator, retrieved: at,
      profile,
      authority_state: "undetermined",
      authority_basis: `material handed to the group through its doorbell by an unnamed knocker; no authority is asserted; recorded ${at} for resolution through the task list`,
      provenance_chain: [{
        /* `acquisition` R16 (DEC-124): the product is named Civicsmith; a document pulled before T31 keeps its `who`,
           answered again as stored (`pulled_document`). */
        who: `instance ${this.env.INSTANCE_NAME || "unnamed"} (Civicsmith/${this.env.VERSION || "0.0.0"})`,
        asserts: `these bytes were received at this instance's doorbell as knock ${row.knock_id} at ${row.received}, `
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

  /** R67: the knocks sharing a pseudonym, oldest first, to a member session (the op's fence), with the continuity
   *  sentence and never an identity: no contact is answered (R70). At most `limit` (N90), paged by `after`. */
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

  /** R72 (K539; for `sources` R1): every knock pulled into a capture, oldest received first, to a member session (the
   *  op's fence), never a contact (R70); `[]` for none. One keyed read (`inbox_capture`). Never throws. */
  pulledKnocksOf(captureSha) {
    try {
      const sha = typeof captureSha === "string" ? captureSha.toLowerCase() : "";
      if (!HEX64.test(sha)) return [];
      return this.#rows(`SELECT knock_id, sha256, bytes, received, pseudonym, knocker_digest FROM inbox
                          WHERE capture_sha = ? ORDER BY received, knock_id`, sha).map((r) => ({ ...r }));
    } catch { return []; }
  }

  /* ==================================================================== *
   * The capturing member, and late co-attestation (`acquisition` R16's actor, R68, R69)
   * ==================================================================== */

  /** `acquisition` R16, R69: record `actor` as one who captured `captureSha` (a member session's acquire, a knock's pull). Kept once
   *  per pair, at the first instant. */
  recordCaptureActor({ captureSha, actor, at = null } = {}) {
    if (typeof captureSha !== "string" || !HEX64.test(captureSha) || typeof actor !== "string" || !actor) return { recorded: false };
    this.#tx(() => this.#sql.exec(`INSERT OR IGNORE INTO capture_actors (capture_sha, actor, at) VALUES (?, ?, ?)`,
                                  captureSha, actor, at && ISO_INSTANT.test(at) ? at : stampSecond()));
    return { recorded: true };
  }

  /** R69 (DEC-81 item 3(c)): a capture's actor appends a signed account of when and how they captured it. Refused
   *  `NOT_THE_CAPTURING_ACTOR` (C-118.5) for anyone this module did not record as capturing it (and for a capture it
   *  recorded no actor for), `ACCOUNT_NO_TEXT` (C-118.6), and `SIG_<reason>` unless `signature` verifies
   *  (`signatures.verifySshsig`, `NS_RATIFY`) over `signatures.captureAccountStatement(captureSha, text)` (its R41) against one of `by`'s
   *  attesting keys (`credentials.attestingKeys`, its R11). Append-only. */
  async recordCaptureAccount({ captureSha, text, signature, by, at = null } = {}) {
    const sha = typeof captureSha === "string" ? captureSha.toLowerCase() : "";
    const who = memberIdOf(by);
    const actors = HEX64.test(sha) ? this.#rows(`SELECT actor FROM capture_actors WHERE capture_sha = ?`, sha).map((r) => memberIdOf(r.actor)) : [];
    /* DEC-49 REGION is-capturing-actor */
    if (!who || !actors.includes(who)) {
      const row = CAPTURE_CHECKS.NOT_THE_CAPTURING_ACTOR;
      return { ok: false, reason: "NOT_THE_CAPTURING_ACTOR", code: "NOT_THE_CAPTURING_ACTOR", check: row.check,
               translation: row.translation, captureSha: sha || null, status: 403 };
    }
    /* END DEC-49 REGION is-capturing-actor */
    /* DEC-49 REGION is-account-worded */
    if (typeof text !== "string" || !text.trim()) {
      const row = CAPTURE_CHECKS.ACCOUNT_NO_TEXT;
      return { ok: false, reason: "ACCOUNT_NO_TEXT", code: "ACCOUNT_NO_TEXT", check: row.check, translation: row.translation,
               captureSha: sha, status: 400 };
    }
    /* END DEC-49 REGION is-account-worded */
    let keys = [];
    try { keys = (this.#credentials().attestingKeys() || []).filter((k) => memberIdOf(k.member_id) === who).map((k) => k.key_b64); }
    catch { keys = []; }
    const v = await verifySshsig(typeof signature === "string" ? signature : "", captureAccountStatement(sha, text), NS_RATIFY, keys);
    if (!v.ok) {
      const { ok: _ok, reason, ...rest } = v;
      return { ok: false, reason: `SIG_${reason}`, ...rest, captureSha: sha, status: 400,
               detail: "the signature does not verify over this account's statement against a key of yours that attests, so nothing was written" };
    }
    const when = at && ISO_INSTANT.test(at) ? at : stampSecond();
    const seq = this.#tx(() => {
      const n = Number(this.#one(`SELECT COALESCE(MAX(seq), 0) AS n FROM capture_accounts WHERE capture_sha = ?`, sha).n) + 1;
      this.#sql.exec(`INSERT INTO capture_accounts (capture_sha, seq, by, text, signature, key_b64, at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                     sha, n, by, text, signature, v.keyB64, when);
      return n;
    });
    return { ok: true, captureSha: sha, seq, by, at: when, key_b64: v.keyB64 };
  }

  /** R69: every account appended for a capture, in order, with the members recorded as capturing it. Never throws.
   *  N388 (REC-30): an account is its member's own words, which can name a project, so through the op it answers by
   *  the caller's `viewer` (membership R43, through the register's bundle, D-701's gate): a capture filed in a bundle
   *  the viewer may not see answers as one with nothing recorded, so an unseen capture and an unknown one read alike.
   *  No viewer (an in-process caller: `case-disclosures` R3's pre-flight) reads whole; the route never passes none. */
  captureAccountsOf(captureSha, { viewer = undefined } = {}) {
    try {
      const sha = typeof captureSha === "string" ? captureSha.toLowerCase() : "";
      if (!HEX64.test(sha)) return { captureSha: sha || null, actors: [], accounts: [] };
      if (!this.#captureSeen(sha, viewer)) return { captureSha: sha, actors: [], accounts: [] };
      return { captureSha: sha,
               actors: this.#rows(`SELECT actor, at FROM capture_actors WHERE capture_sha = ? ORDER BY at, actor`, sha),
               accounts: this.#rows(`SELECT seq, by, text, signature, key_b64, at FROM capture_accounts WHERE capture_sha = ? ORDER BY seq`, sha) };
    } catch { return { captureSha: null, actors: [], accounts: [] }; }
  }

  /** R68 (DEC-81 item 3(a)): a late co-attestation. N388: any caller the control plane admits may ask, a machine
   *  included, as for `attest`: the timestamp authority and the archive vouch, never the caller (Intake Doctrine §3),
   *  a late attestation proves existence only by its own instant, and `by` records who asked. It asks attestation's
   *  `attest` (its R2, R3) for a fresh timestamp over the digest and, with a public `locator`, a fresh co-archive, both
   *  through the host governor, then fetches the co-archive's raw replay through the governor too and compares its
   *  digest (`matches` true, false or undetermined). Each attempt's outcome is appended, dated, `late: true`, with the
   *  sentence "proves the bytes existed by <at>, not at capture". Refused `BAD_SHA`, and R63's absence when no bytes
   *  are held (a capture held in parts counts when provenance holds its receipt, provenance R5). */
  async reattest({ captureSha, locator = null, by = null } = {}) {
    const sha = typeof captureSha === "string" ? captureSha.toLowerCase() : "";
    if (!HEX64.test(sha)) return { ok: false, reason: "BAD_SHA", status: 400, detail: "reattest takes the sha256 of a capture the record holds" };
    const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
    const p = this.provenance;
    const holds = async (s) => (p && typeof p.registerHolds === "function" ? p.registerHolds({ sha: s }) : null);
    let held = false;
    if (ev) {
      try { held = !!(await ev.head(sha)); } catch { held = false; }
      if (!held) { try { held = (await holds(sha))?.acquired === true; } catch { held = false; } }
    }
    if (!held) { const a = evidenceAbsent(sha, "bio", { status: 404 }); return a.body; }
    const archive = typeof locator === "string" && isPublicHttpsLocator(locator);
    let out;
    try {
      out = await attest({ sha256: sha, archive, locator: archive ? locator : null },
        { head: (s) => ev.head(s), put: (s, b) => ev.put(s, b), fetch: governedCall(this, "reattest"), holds });
    } catch (e) {
      out = { ok: false, attempts: [], reason: "ATTEST_FAILED", note: String(e && e.message || e).slice(0, 200) };
    }
    const attempts = Array.isArray(out && out.attempts) ? out.attempts.filter((a) => a && typeof a === "object") : [];
    if (!attempts.length && out && out.ok === false && out.reason !== "NO_ATTESTATION" && out.reason !== "ATTEST_FAILED")
      return { ...out, status: 409 };
    const now = stampSecond();
    const outcomes = [];
    for (const a of attempts.length ? attempts : [{ service: "attest", ok: false, note: String((out && (out.note || out.reason)) || "no attempt was reported") }]) {
      const at = typeof a.attempted === "string" && ISO_INSTANT.test(a.attempted) ? a.attempted : now;
      const coArchive = a.service === ARCHIVE_SERVICE || a.kind === "co-archive";
      const o = { kind: coArchive ? "co_archive" : "timestamp", service: String(a.service || "attest"), ok: a.ok === true, at,
                  late: true, proves: lateSentence(at),
                  ...(a.kind === "rfc3161" ? { token_sha256: a.token_sha256 ?? null, token_bytes: a.token_bytes ?? null } : {}),
                  ...(a.archived_locator ? { archived_locator: a.archived_locator } : {}),
                  ...(a.note ? { note: String(a.note).slice(0, 200) } : {}) };
      if (coArchive) Object.assign(o, await this.#replayMatches(sha, o.ok ? a.archived_locator : null));
      outcomes.push(o);
    }
    this.#tx(() => {
      let seq = Number(this.#one(`SELECT COALESCE(MAX(seq), 0) AS n FROM late_attestations WHERE capture_sha = ?`, sha).n);
      for (const o of outcomes)
        this.#sql.exec(`INSERT INTO late_attestations (capture_sha, seq, kind, service, ok, at, by, outcome) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                       sha, ++seq, o.kind, o.service, o.ok ? 1 : 0, o.at, by ?? null, JSON.stringify(o));
    });
    return { ok: true, captureSha: sha, late_attestations: outcomes, attested: out && out.ok === true,
             ...(out && out.attestation ? { attestation: out.attestation } : {}),
             note: "each attempt is recorded as late: it proves the bytes existed by its instant, never at capture" };
  }

  /* R68: whether the co-archive's raw replay hashes to the capture digest. Undetermined, with the reason, when there
     is no archived locator, the replay cannot be fetched (the governor holding its host included), or it is too large. */
  async #replayMatches(sha, archived) {
    const replay = rawReplayOf(archived);
    if (!replay) return { matches: "undetermined", match_basis: archived ? "the archived locator is not a replay this instance can read raw" : "the co-archive gave no archived locator to compare" };
    try {
      const g = await governedFetch(this, replay, "reattest");
      if (g.refusedByGovernor) return { matches: "undetermined", replay, match_basis: `the governor is holding requests to the archive (${g.reason})` };
      const res = g.res;
      if (!res.ok || !res.body) return { matches: "undetermined", replay, match_basis: `the replay answered ${res.status}` };
      const h = createSha256(), reader = res.body.getReader();
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > REPLAY_MAX) { try { await reader.cancel(); } catch { /* gone */ } return { matches: "undetermined", replay, match_basis: "the replay is larger than this instance compares" }; }
        h.update(value);
      }
      const got = h.hex();
      return { matches: got === sha, replay, replay_sha256: got,
               match_basis: got === sha ? "the co-archive's replay hashes to the capture digest" : "the co-archive's replay holds other bytes than the capture" };
    } catch (e) {
      return { matches: "undetermined", replay, match_basis: `the replay could not be fetched (${String(e && e.message || e).slice(0, 120)})` };
    }
  }

  /** R68: the late attestations recorded for a capture, in the order appended. Never throws. N388: it takes no viewer:
   *  every field is the attempt's own (service, instant, token digest, archived locator, replay match) and who asked,
   *  and it names no bundle, so REC-30's rule leaves a row about a capture standing for every reader. */
  lateAttestationsOf(captureSha) {
    try {
      const sha = typeof captureSha === "string" ? captureSha.toLowerCase() : "";
      if (!HEX64.test(sha)) return { captureSha: sha || null, late_attestations: [] };
      return { captureSha: sha, late_attestations: this.#rows(`SELECT seq, by, outcome FROM late_attestations WHERE capture_sha = ? ORDER BY seq`, sha)
        .map((r) => ({ seq: r.seq, by: r.by, ...JSON.parse(r.outcome) })) };
    } catch { return { captureSha: null, late_attestations: [] }; }
  }

  /** R76 (DEC-95 (1)): the grade note of a capture this record holds (its bytes in the evidence store, or provenance's
   *  register or receipt naming it, provenance R5), so a capture completed with no member present carries it
   *  afterwards: `acquisition`'s `ACQUIRE_GRADE_NOTE`, the words `op=acquire`'s answer carries. By the viewer, as
   *  `captureAccountsOf`: a capture the viewer may not see, or one not held, answers `note: null`. Writes nothing and
   *  never throws. */
  async gradeNoteOf({ captureSha, viewer = undefined } = {}) {
    const sha = typeof captureSha === "string" ? captureSha.toLowerCase() : "";
    const none = { captureSha: sha || null, note: null };
    try {
      if (!HEX64.test(sha) || !this.#captureSeen(sha, viewer)) return none;
      const ev = this.core && typeof this.core.evidenceStore === "function" ? this.core.evidenceStore() : null;
      let held = false;
      if (ev) { try { held = !!(await ev.head(sha)); } catch { held = false; } }
      if (!held && this.provenance && typeof this.provenance.registerHolds === "function") {
        try { const h = await this.provenance.registerHolds({ sha }); held = h?.registered === true || h?.acquired === true; }
        catch { held = false; }
      }
      return held ? { captureSha: sha, note: ACQUIRE_GRADE_NOTE } : none;
    } catch { return none; }
  }

  /* ==================================================================== *
   * Held captures (R77–R79, R81; DEC-97)
   * ==================================================================== */

  /* R77: the SQL of a document's standing: an Information document at `collected` whose latest held act is not a
     set-aside, seen by the viewer (membership R43 over record-core's `bundles`, R37). */
  static #NOT_SET_ASIDE = `COALESCE((SELECT h.act FROM held_acts h WHERE h.bundle_id = b.bundle_id ORDER BY h.seq DESC LIMIT 1), '') <> 'set_aside'`;
  /* R77: when it was collected: `created` while it has never left `collected` (no prior state), else the instant its
     state last moved, `last_updated` (record-core keeps no other per-state instant). */
  static #SINCE = `CASE WHEN b.prior_state IS NULL THEN b.created ELSE b.last_updated END`;
  /* R77: its source as provenance records it: the earliest acquisition receipt (provenance R48) of a capture the
     document's register rows name. */
  static #SOURCE = (col) => `(SELECT cl.${col} FROM register r JOIN captured_locators cl ON cl.capture_sha = r.capture_sha
                               WHERE r.bundle_id = b.bundle_id ORDER BY cl.first_retrieved, cl.address, cl.via LIMIT 1)`;

  #sightOf(viewer) {
    if (viewer === undefined) return { sql: "1=1", args: [] };
    const g = viewerPredicate(viewer);
    return { sql: g.sql, args: g.args };
  }

  /** R77 (DEC-97 (1)): the Information documents at `collected` not set aside, as the viewer may see them, at most
   *  `limit` (N90), with `truncated` and `next`. `member` keeps the documents that member captured (`capture_actors`
   *  over the register); `project` that project's (the document's `project`). Each row: the document, its source, its
   *  project, its age since collected and its batch eligibility (R78). Sorted by `age` (the default, oldest first),
   *  `source` or `project`, either way, a row with none last; ties by id. Writes nothing; nothing is notified. */
  async heldCaptures({ member = null, project = null, sort = null, dir = null, limit = null, after = null, viewer = undefined,
                       now = null } = {}) {
    const by = sort == null || sort === "" ? "age" : sort;
    if (!HELD_SORTS.includes(by)) return Capture.#badArgument("heldcaptures", "sort", HELD_SORTS.join(" | "), by);
    const way = dir == null || dir === "" ? (by === "age" ? "desc" : "asc") : dir;
    if (!SORT_DIRS.includes(way)) return Capture.#badArgument("heldcaptures", "dir", SORT_DIRS.join(" | "), way);
    const cap = limitOf(limit);
    const from = after ? keyOf(after, 3) : null;
    if (after && !from) return badCursor();
    /* Age descending is `since` ascending: the longest held first. */
    const k1 = { age: "since", source: "COALESCE(src_address, '')", project: "COALESCE(project, '')" }[by];
    const k0 = by === "age" ? "'0'" : by === "source" ? "CASE WHEN src_address IS NULL THEN '1' ELSE '0' END"
                                                    : "CASE WHEN project IS NULL OR project = '' THEN '1' ELSE '0' END";
    const asc = by === "age" ? way === "desc" : way === "asc";
    const sight = this.#sightOf(viewer);
    const who = typeof member === "string" && member ? memberIdOf(member) : null;
    const found = this.#rows(
      `SELECT * FROM (SELECT bundle_id, title, project, since, src_address, src_via, src_retrieved, ${k0} AS k0, ${k1} AS k1 FROM (
         SELECT b.bundle_id, b.title, b.project, ${Capture.#SINCE} AS since, ${Capture.#SOURCE("address")} AS src_address,
                ${Capture.#SOURCE("via")} AS src_via, ${Capture.#SOURCE("first_retrieved")} AS src_retrieved
           FROM bundles b
          WHERE b.object_type = 'information' AND b.current_state = 'collected' AND ${Capture.#NOT_SET_ASIDE} AND (${sight.sql})
            AND ${who ? `EXISTS (SELECT 1 FROM register r JOIN capture_actors ca ON ca.capture_sha = r.capture_sha
                                  WHERE r.bundle_id = b.bundle_id
                                    AND (CASE WHEN ca.actor LIKE 'member:%' THEN substr(ca.actor, 8) ELSE ca.actor END) = ?)` : "1=1"}
            AND ${project != null && project !== "" ? "b.project = ?" : "1=1"})) q
        WHERE ${from ? `(k0 > ? OR (k0 = ? AND (k1 ${asc ? ">" : "<"} ? OR (k1 = ? AND bundle_id > ?))))` : "1=1"}
        ORDER BY k0 ASC, k1 ${asc ? "ASC" : "DESC"}, bundle_id ASC LIMIT ?`,
      ...sight.args, ...(who ? [who] : []), ...(project != null && project !== "" ? [String(project)] : []),
      ...(from ? [from[0], from[0], from[1], from[1], from[2]] : []), cap + 1);
    const page = found.slice(0, cap), truncated = found.length > cap, last = page[page.length - 1];
    const at = now != null && Number.isFinite(Date.parse(now)) ? Date.parse(now) : Date.now();
    const rows = [];
    for (const r of page) {
      const since = Date.parse(r.since);
      rows.push({ bundle_id: r.bundle_id, title: r.title ?? null, project: r.project || null,
                  source: r.src_address ? { address: r.src_address, via: r.src_via, retrieved: r.src_retrieved } : null,
                  collected_since: r.since, age_days: Number.isFinite(since) ? Math.max(0, Math.floor((at - since) / 86400000)) : null,
                  ...(await this.#eligibility(r.bundle_id)) });
    }
    return { ok: true, held: rows, sort: by, dir: way, limit: cap, truncated,
             next: truncated ? cursorOf([String(last.k0), String(last.k1), last.bundle_id]) : null };
  }

  /* R78: one document's batch eligibility, by the registered examination (`ratification` R34): `eligible: true`, or
     false with the class it fails first and that class's reason; with none registered, or one that fails or answers
     neither, `eligible: null`, stated undetermined. */
  async #eligibility(bundleId) {
    const reader = this.#readers.get("batch-examination");
    const undetermined = (basis) => ({ eligible: null, eligibility_basis: basis });
    if (!reader) return undetermined("no batch-release examination is registered, so eligibility is undetermined");
    let v;
    try { v = await reader.fn(bundleId); } catch { v = null; }
    if (v && v.eligible === true) return { eligible: true };
    if (v && v.eligible === false && typeof v.class === "string" && v.class)
      return { eligible: false, class: v.class, reason: typeof v.reason === "string" ? v.reason : null };
    return undetermined(`${reader.module}'s examination did not answer for this document, so eligibility is undetermined`);
  }

  /* R79, R81: the refusals the two held acts share, in order: a member's own act (C-118.8), with a reason (C-118.9),
     over one to PER_ITEM_MAX ids. */
  #heldActRefusal(ids, reason, author) {
    /* DEC-49 REGION is-held-act-by-member */
    /* A machine: record-grammar's whole question, and the bare founder's viewer `admin`, which names no member
       (membership R43; K1032). */
    if (typeof author !== "string" || !author.trim() || isMachineIdentity(author) || author.trim().toLowerCase() === "admin") {
      const row = CAPTURE_CHECKS.MACHINE_CANNOT_SET_ASIDE;
      return { ok: false, reason: "MACHINE_CANNOT_SET_ASIDE", code: "MACHINE_CANNOT_SET_ASIDE", check: row.check,
               translation: row.translation, status: 403 };
    }
    /* END DEC-49 REGION is-held-act-by-member */
    /* DEC-49 REGION is-held-act-reasoned */
    if (!reasonGiven(reason)) {
      const row = CAPTURE_CHECKS.SET_ASIDE_NO_REASON;
      return { ok: false, reason: "SET_ASIDE_NO_REASON", code: "SET_ASIDE_NO_REASON", check: row.check,
               translation: row.translation, status: 400, maxChars: REASON_MAX };
    }
    /* END DEC-49 REGION is-held-act-reasoned */
    if (!Array.isArray(ids) || ids.length === 0)
      return { ok: false, reason: "NO_IDS", status: 400, detail: "name at least one document; nothing was written" };
    if (ids.length > PER_ITEM_MAX)
      return { ok: false, reason: "TOO_MANY_IDS", status: 400, max: PER_ITEM_MAX, count: ids.length,
               detail: `at most ${PER_ITEM_MAX} documents in one act; the set was refused whole and nothing was written` };
    return null;
  }

  /* R79, R81: each id's document as the viewer may see it, with whether it is set aside now; an id absent or unseen
     answers alike (null). */
  #heldStanding(ids, viewer) {
    const sight = this.#sightOf(viewer);
    const out = new Map();
    for (const id of new Set(ids.map((x) => (typeof x === "string" ? x : "")))) {
      out.set(id, id ? this.#one(
        `SELECT b.bundle_id, b.object_type, b.current_state, ${Capture.#NOT_SET_ASIDE} AS standing FROM bundles b
          WHERE b.bundle_id = ? AND (${sight.sql})`, id, ...sight.args) : null);
    }
    return out;
  }

  /* R79, R81: append one act per document, in one transaction. */
  #appendHeld(ids, act, reason, author) {
    const at = stampSecond();
    this.#tx(() => {
      for (const id of new Set(ids)) {
        const n = Number(this.#one(`SELECT COALESCE(MAX(seq), 0) AS n FROM held_acts WHERE bundle_id = ?`, id).n) + 1;
        this.#sql.exec(`INSERT INTO held_acts (bundle_id, seq, act, reason, author, at) VALUES (?, ?, ?, ?, ?, ?)`,
                       id, n, act, reason, author, at);
      }
    });
    return at;
  }

  /** R79 (DEC-97 (2)): set several held documents aside with one reason. Refused whole, never narrowed: C-118.8,
   *  C-118.9, the id count, then any id absent or unseen (one answer), not `information`, not at `collected`, or
   *  already set aside, named. The document is unchanged and stays at `collected`; append-only. */
  setAside({ ids, reason, author, viewer = undefined } = {}) {
    const refused = this.#heldActRefusal(ids, reason, author);
    if (refused) return refused;
    const standing = this.#heldStanding(ids, viewer);
    const named = (code, test, detail) => {
      const hit = [...standing].filter(([, r]) => test(r)).map(([id]) => id);
      return hit.length ? { ok: false, reason: code, ids: hit, status: code === "NO_SUCH_DOCUMENT" ? 404 : 409, detail } : null;
    };
    const no = named("NO_SUCH_DOCUMENT", (r) => !r, "no document you may see answers to these ids; nothing was written")
      || named("NOT_INFORMATION", (r) => r.object_type !== "information", "only Information documents are held; nothing was written")
      || named("NOT_COLLECTED", (r) => r.current_state !== "collected", "only documents at collected are held; nothing was written")
      || named("ALREADY_SET_ASIDE", (r) => !r.standing, "these documents are already set aside; nothing was written");
    if (no) return no;
    const at = this.#appendHeld([...standing.keys()], "set_aside", reason, author);
    return { ok: true, act: "set_aside", ids: [...standing.keys()], reason, author, at };
  }

  /** R81 (DEC-97 (2)): undo a set-aside by a reasoned act, for several documents with one reason. Refused whole: R79's
   *  first three, then any id absent or unseen (one answer), or not set aside now, named. The restore is appended
   *  beside the set-aside, which is never rewritten or removed; a document's latest act decides. */
  restoreHeld({ ids, reason, author, viewer = undefined } = {}) {
    const refused = this.#heldActRefusal(ids, reason, author);
    if (refused) return refused;
    const standing = this.#heldStanding(ids, viewer);
    const absent = [...standing].filter(([, r]) => !r).map(([id]) => id);
    if (absent.length) return { ok: false, reason: "NO_SUCH_DOCUMENT", ids: absent, status: 404,
                                detail: "no document you may see answers to these ids; nothing was written" };
    const notAside = [...standing].filter(([, r]) => r.standing).map(([id]) => id);
    if (notAside.length) return { ok: false, reason: "NOT_SET_ASIDE", ids: notAside, status: 409,
                                  detail: "these documents are not set aside; nothing was written" };
    const at = this.#appendHeld([...standing.keys()], "restore", reason, author);
    return { ok: true, act: "restore", ids: [...standing.keys()], reason, author, at };
  }

  /** R82 (K1036; Intake Doctrine §4, the backlog ceiling): how many Information documents at `collected`, not set aside
   *  (R79, R81) and not released, have a register document whose `origin` names `matched_sweep` equal to `sweep`. The
   *  register document is the bundle's `data/provenance.json` (State Rules §4.1), read on record-core's `files` read
   *  contract (its R37); a released document has left `collected` (`ratification` R24), so the state answers that
   *  clause. The whole store, no viewer: only the daemon's hold reads it (`monitoring` R60). Writes nothing and never
   *  throws; an unknown sweep, or one that is not a non-empty string, answers 0. K1129: a store that cannot be read
   *  answers null (not known), never 0, so the hold fails closed. A register document held only as a blob
   *  (`files.content` NULL) is not counted. */
  heldCount(args) {
    const sweep = args && typeof args === "object" ? args.sweep : null;
    if (typeof sweep !== "string" || !sweep) return 0;
    try {
      const r = this.#one(
        `SELECT count(*) AS n FROM bundles b
          WHERE b.object_type = 'information' AND b.current_state = 'collected' AND ${Capture.#NOT_SET_ASIDE}
            AND EXISTS (SELECT 1 FROM files f,
                                json_each(CASE WHEN json_valid(f.content) THEN f.content ELSE '{}' END, '$.documents') d
                         WHERE f.bundle_id = b.bundle_id AND f.path = 'data/provenance.json'
                           AND (CASE WHEN d.type = 'object' THEN json_extract(d.value, '$.origin.matched_sweep') END) = ?)`,
        sweep);
      const n = Number(r && r.n);
      return r && Number.isFinite(n) ? n : null;
    } catch { return null; }
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
    return this.#tx(() => {
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
    });
  }

  /** R40. Frees the slot on every path; adds the REPORTED browser time and releases at most the reservation still
   *  held (never below zero). AN UNREPORTED RENDER STAYS CHARGED: it may have burned any time up to its
   *  reservation, so the reservation is kept for the day, which under-uses the allowance and cannot overrun. */
  renderSpend({ ms, releaseMs = 0, slot = null, at = null } = {}) {
    return this.#tx(() => {
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
    });
  }

  /* ==================================================================== *
   * Links (R27) and the host's chrome (R28, R29)
   * ==================================================================== */

  /** R27. File the links a captured document made. Replaces this capture's rows rather than appending: a
   *  capture's own links are a property of its bytes. A link carries `chrome: true` with its `chrome_basis` when
   *  it sat in a chrome region (containment, D-340); whether it IS the site's chrome is decided by recurrence
   *  (R28), re-derived here for this capture in the same write. A row filed again keeps the instant it was FIRST
   *  filed (R57: `first_seen` is a read contract, and a continuation re-files every link of its page). */
  recordLinks({ sourceCapture, sourceBundle = null, capturedAt, links = [] } = {}) {
    return this.#tx(() => {
      if (!sourceCapture) return { recorded: 0 };
      const now = stampSecond();
      /* Filed in place: a row this capture already holds is updated and keeps `first_seen`, a new one takes now, and
         the rows the new set no longer names are removed after. The first of two links with one key is the one kept. */
      const kept = new Set();
      let n = 0;
      for (const l of links) {
        /* address_norm is required; citation_norm falls back to it for a link that names no element. */
        if (!l || !l.address_norm) continue;
        n++;
        const ref = String(l.ref || l.address), citation = l.citation_norm || l.address_norm;
        const key = JSON.stringify([ref, citation]);
        if (kept.has(key)) continue;
        kept.add(key);
        this.#sql.exec(
          `INSERT INTO links (source_bundle, source_capture, link_ref, address, address_norm,
             citation_norm, fragment, partition, origin, chrome, chrome_basis, captured_at, first_seen)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(source_capture, link_ref, citation_norm) DO UPDATE SET source_bundle = excluded.source_bundle,
             address = excluded.address, address_norm = excluded.address_norm, fragment = excluded.fragment,
             partition = excluded.partition, origin = excluded.origin, chrome = excluded.chrome,
             chrome_basis = excluded.chrome_basis, captured_at = excluded.captured_at`,
          sourceBundle, sourceCapture, ref, l.address || l.address_norm,
          l.address_norm, citation, l.fragment || null,
          l.type || "deferred", l.origin || null, l.chrome ? 1 : 0,
          l.chrome ? (String(l.chrome_basis || "") || null) : null, capturedAt || now, now);
      }
      this.#sql.exec(
        `DELETE FROM links WHERE source_capture = ? AND NOT EXISTS (SELECT 1 FROM json_each(?) k
           WHERE json_extract(k.value, '$[0]') = links.link_ref AND json_extract(k.value, '$[1]') = links.citation_norm)`,
        sourceCapture, `[${[...kept].join(",")}]`);
      const chrome = this.#chromeDeriveCapture(sourceCapture, now);
      return { recorded: n, source_capture: sourceCapture, site_chrome: chrome };
    });
  }

  /** R27, D-701, N90. Everything that points AT an address, matched on the RESOURCE key so the citations of its
   *  sections are found too. Only sources the viewer may see, at most `limit` in (source, citation) order, paged by
   *  `after`; `count` and `elements` are of the rows listed. */
  linksTo({ address_norm, viewer = undefined, limit = null, after = null } = {}) {
    const seen = this.#captureGate("l.source_capture", viewer);
    const cap = limitOf(limit);
    const from = after ? keyOf(after, 3) : ["", "", ""];
    if (!from) return badCursor();
    const found = this.#rows(
      `SELECT l.source_capture, l.source_bundle, l.link_ref, l.partition, l.fragment, l.citation_norm, l.captured_at
         FROM links l WHERE l.address_norm = ? AND (l.source_capture, l.citation_norm, l.link_ref) > (?, ?, ?) AND (${seen.sql})
        ORDER BY l.source_capture, l.citation_norm, l.link_ref LIMIT ?`, address_norm, ...from, ...seen.args, cap + 1);
    const rows = found.slice(0, cap), last = rows[rows.length - 1];
    const truncated = found.length > cap;
    return { address_norm, count: rows.length, sources: rows,
             elements: [...new Set(rows.map((r) => r.fragment).filter(Boolean))], limit: cap, truncated,
             next: truncated ? cursorOf([last.source_capture, last.citation_norm, last.link_ref]) : null };
  }

  /** R27. Resolve a capture's links against the record, with a contemporaneity verdict for each that resolves:
   *  is the capture the record holds of the target the version the source pointed at on the day the source was
   *  captured? Three values, because the question is usually unanswerable and a binary scheme would sort every
   *  unanswerable case into one bucket or the other. The strongest evidence is two captures of the target
   *  BRACKETING the source's retrieval whose bytes hash equal. D-96: the bracket reads DIRECT receipts only.
   *  D-701: a source the viewer may not see answers as a capture the record does not hold, and a target capture
   *  the viewer may not see is filtered out BEFORE the bracket. N90: through the op, at most `limit` links in
   *  (citation, ref) order, paged by `after`, the tally and verdicts being of the links listed; an in-process caller
   *  that passes no `limit` (connections' projection, which must see every link) is answered whole, `limit: null`. */
  resolveLinks({ sourceCapture, at = null, viewer = undefined, limit = null, after = null } = {}) {
    const src = this.#captureGate("l.source_capture", viewer);
    const cap = limit == null ? null : limitOf(limit);
    /* In process with no `limit`, every link: a bound of Infinity, which SQLite spells `LIMIT -1`. */
    const bound = cap ?? Infinity;
    const window = Number.isFinite(bound) ? bound + 1 : -1;
    const from = after ? keyOf(after, 2) : ["", ""];
    if (!from) return badCursor();
    const found = this.#rows(
      `SELECT l.* FROM links l WHERE l.source_capture = ? AND (l.citation_norm, l.link_ref) > (?, ?) AND (${src.sql})
        ORDER BY l.citation_norm, l.link_ref LIMIT ?`, sourceCapture, ...from, ...src.args, window);
    const truncated = found.length > bound;
    const rows = found.slice(0, bound);
    const next = truncated ? cursorOf([rows[rows.length - 1].citation_norm, rows[rows.length - 1].link_ref]) : null;
    if (!rows.length) return { sourceCapture, resolved: 0, links: [], limit: cap, truncated, next };
    /* N133: the source's retrieval instant, spelled whole-second UTC as the receipts are (provenance R48), so the
       bracket is decided in SQL by comparing text. */
    const T = stampSecond(Date.parse(rows[0].captured_at) || Date.parse(at || "") || Date.now());
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
      /* N133: a BOUNDED read per link. The target's direct captures the viewer may see are never read whole: SQL
         answers their count and the at most four captures the verdict turns on, each one row: the first capture
         (by first retrieval) seen more than once across T (`bracket`), the last whose last sighting is at or
         before T (`before`), the first whose first sighting is at or after T (`after`), and the source's own. */
      const found = this.#rows(
        `WITH c AS (SELECT cl.capture_sha, cl.first_retrieved, cl.last_retrieved, cl.observations FROM captured_locators cl
                     WHERE cl.address_norm = ? AND cl.via = 'direct' AND (${tgt.sql}))
         SELECT 'n' AS k, NULL AS capture_sha, NULL AS first_retrieved, NULL AS last_retrieved, COUNT(*) AS observations FROM c
         UNION ALL SELECT * FROM (SELECT 'bracket', * FROM c WHERE first_retrieved <= ? AND last_retrieved >= ? AND observations > 1
                                  ORDER BY first_retrieved, capture_sha LIMIT 1)
         UNION ALL SELECT * FROM (SELECT 'before', * FROM c WHERE last_retrieved <= ? ORDER BY first_retrieved DESC, capture_sha DESC LIMIT 1)
         UNION ALL SELECT * FROM (SELECT 'after', * FROM c WHERE first_retrieved >= ? ORDER BY first_retrieved, capture_sha LIMIT 1)
         UNION ALL SELECT * FROM (SELECT 'self', * FROM c WHERE capture_sha = ? LIMIT 1)`,
        r.address_norm, ...tgt.args, T, T, T, T, sourceCapture);
      const pick1 = (k) => { const x = found.find((f) => f.k === k); return x ? { capture_sha: x.capture_sha,
        first_retrieved: x.first_retrieved, last_retrieved: x.last_retrieved, observations: x.observations } : null; };
      const count = Number((found.find((f) => f.k === "n") || {}).observations || 0);
      if (!count) {
        tally.offsite++;
        out.push({ ...r, resolution: "offsite", verdict: null, basis: "the record holds no capture of this address" });
        continue;
      }
      tally.linked++;
      const bracket = pick1("bracket"), before = pick1("before"), after = pick1("after");
      /* D-57: A SELF-REFERENCE, AND ONE CAPTURE ON BOTH SIDES, ARE NOT A CHANGE. A page that links to itself finds
         its OWN capture among the target's, retrieved at exactly T, so it is both the last capture at-or-before T
         and the first at-or-after it; stated for what it is (a fourth basis, never a fourth verdict). */
      const selfCap = pick1("self");
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
                 target_captures: count });
    }
    return { sourceCapture, resolved: out.length, at: rows[0].captured_at, tally, verdicts, links: out,
      limit: cap, truncated, next,
      note: "undetermined is the resting state and the expected common case, not a failure: it means "
          + "nothing established which version the source pointed at, which is different from the "
          + "record holding nothing and different again from holding a later version" };
  }

  /** R27. Append a verdict, never an update: a verdict that changed is a fact about the record. N90: the history
   *  answered is the newest `limit` verdicts, oldest first, with the `total` and whether it was cut. */
  recordLinkVerdict({ sourceCapture, addressNorm, verdict, basis, targetBundle = null, targetCapture = null, detail = null,
                      at = null, limit = null } = {}) {
    return this.#tx(() => {
      const now = at || stampSecond();
      this.#sql.exec(
        `INSERT INTO link_verdicts (source_capture, address_norm, verdict, basis, target_bundle, target_capture, at, detail)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        sourceCapture, addressNorm, verdict, basis, targetBundle, targetCapture, now, detail);
      const cap = limitOf(limit);
      const total = Number(this.#one(`SELECT COUNT(*) AS n FROM link_verdicts WHERE source_capture = ? AND address_norm = ?`,
                                     sourceCapture, addressNorm).n);
      const found = this.#rows(`SELECT * FROM link_verdicts WHERE source_capture = ? AND address_norm = ? ORDER BY at DESC LIMIT ?`,
                               sourceCapture, addressNorm, cap + 1);
      const history = found.slice(0, cap).reverse();
      return { current: history[history.length - 1] || null, history, changed: total > 1, total, limit: cap,
               truncated: found.length > cap };
    });
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

  /** R28, N90. The standing classification of a host's contained links, with basis and date: at most `limit` in
   *  address order, paged by `after`. */
  chromeOf({ host, limit = null, after = null } = {}) {
    const h = String(host || "").trim().toLowerCase();
    const cap = limitOf(limit);
    const from = after ? keyOf(after, 1) : [""];
    if (!from) return badCursor();
    const found = this.#rows(`SELECT address_norm, state, pages, basis, at FROM link_chrome WHERE host = ? AND address_norm > ?
                                ORDER BY address_norm LIMIT ?`, h, from[0], cap + 1);
    const links = found.slice(0, cap), truncated = found.length > cap;
    return { host: h, links, limit: cap, truncated, next: truncated ? cursorOf([links[links.length - 1].address_norm]) : null };
  }

  /** R29. Regenerate a host's chrome by SCAN, which is what makes it derived: everything recomputed from `links`
   *  and the receipts. Bounded and paged: the first page (no `after`) clears the host's derived rows; each page
   *  re-derives up to `limit` captures in capture-sha order and says whether more remain. */
  deriveSiteChrome({ host, limit = null, after = null } = {}) {
    return this.#tx(() => {
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
    });
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
    return this.#tx(() => {
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
    });
  }

  loadCaptureSession({ session, at = null } = {}) {
    return this.#tx(() => {
      const now = at ? new Date(at) : new Date();
      this.#sql.exec(`DELETE FROM capture_sessions WHERE expires < ?`, stampSecond(now.getTime()));
      const r = this.#one(`SELECT * FROM capture_sessions WHERE session = ?`, session);
      if (!r) return { session, found: false,
        note: "no such capture session: it either never existed, was already finished, or expired" };
      let state = null;
      try { state = JSON.parse(r.state); } catch { return { session, found: false, note: "session state did not parse" }; }
      return { session, found: true, locator: r.locator, primarySha: r.primary_sha,
               primaryFile: r.primary_file, base: r.base, ticks: r.ticks, created: r.created, state };
    });
  }

  dropCaptureSession({ session } = {}) {
    return this.#tx(() => {
      this.#sql.exec(`DELETE FROM capture_sessions WHERE session = ?`, session);
      return { session, dropped: true };
    });
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
   *  counted apart as `documents_undetermined`, never guessed into `documents`. N90: `limit` (the op always passes
   *  one) answers at most that many in address order, paged by `after`, unless `addresses` names the assets asked;
   *  the in-process walk (`acquisition` R19) passes none and reads the host whole. */
  siteAssets({ host, addresses = [], limit = null, after = null } = {}) {
    if (!host) return { host: null, assets: {} };
    const out = {};
    const want = addresses && addresses.length ? [...new Set(addresses.map(String))] : null;
    const cap = limit == null || want ? null : limitOf(limit);
    /* Asked addresses: at most as many as asked. The in-process walk: no bound (Infinity, SQLite's `LIMIT -1`). */
    const bound = cap ?? Infinity;
    const window = want ? want.length : Number.isFinite(bound) ? bound + 1 : -1;
    const from = after && cap !== null ? keyOf(after, 1) : [""];
    if (!from) return badCursor();
    /* The assets asked, or the page of the host's assets: the counts are then read for exactly those addresses. */
    let found;
    if (want) found = this.#rows(`SELECT * FROM site_assets WHERE host = ? AND address_norm IN (SELECT value FROM json_each(?))
                                  ORDER BY address_norm LIMIT ?`, host, JSON.stringify(want), window);
    else found = this.#rows(`SELECT * FROM site_assets WHERE host = ? AND address_norm > ? ORDER BY address_norm LIMIT ?`,
                            host, from[0], window);
    const page = found.slice(0, bound);
    const counts = new Map();
    if (page.length)
      for (const c of this.#rows(
        `SELECT r.address_norm AS address_norm, COUNT(DISTINCT cl.address_norm) AS pages,
                COUNT(DISTINCT CASE WHEN cl.capture_sha IS NULL THEN r.primary_sha END) AS unlocated
           FROM site_asset_refs r LEFT JOIN captured_locators cl ON cl.capture_sha = r.primary_sha
          WHERE r.host = ? AND r.address_norm IN (SELECT value FROM json_each(?)) GROUP BY r.address_norm LIMIT ?`,
        host, JSON.stringify(page.map((r) => r.address_norm)), page.length)) counts.set(c.address_norm, c);
    for (const r of page) {
      const c = counts.get(r.address_norm);
      out[r.address_norm] = { ...r, documents: (c && c.pages) || 0, documents_undetermined: (c && c.unlocated) || 0 };
    }
    return { host, assets: out, count: page.length, limit: cap, truncated: found.length > bound,
             next: found.length > bound ? cursorOf([page[page.length - 1].address_norm]) : null };
  }

  /** R25. File what a capture saw of a host. When an address comes back with different bytes, that is a dated fact
   *  about the site AND it puts every document that REUSED the old bytes into question: the asset moves, the
   *  change is counted, and a dated `posthoc` `changed` verdict is appended for each (CAP-4 item 6a, zero request
   *  cost). A fetched asset's `last_fetched_by` names the capture whose fetch it was; a reuse never moves it
   *  (CAP-14), and a reused part's source is the reusing capture's own record. N90: every change is counted and
   *  every posthoc verdict appended, but the answer lists at most `limit` changes, each naming at most `limit`
   *  reusers, and says when either was cut. */
  recordSiteAssets({ host, primarySha, observations = [], at = null, limit = null } = {}) {
    return this.#tx(() => {
      if (!host || !primarySha) return { host: null, recorded: 0 };
      const now = at || stampSecond();
      const cap = limitOf(limit);
      let truncated = false;
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
          /* INSERT OR IGNORE: the key carries the second, so two changes within one second fold into the first. Every
             reuser's verdict is appended in the one statement, whatever the answer below lists. */
          this.#sql.exec(
            `INSERT OR IGNORE INTO reuse_verdicts
               (source_capture, bundle_id, host, address_norm, phase, verdict, reused_sha, observed_sha, basis, at)
             SELECT primary_sha, NULL, ?, ?, 'posthoc', 'changed', ?, ?, ?, ?
               FROM site_asset_refs WHERE host = ? AND address_norm = ? AND reused = 1`,
            host, o.address_norm, cur.sha256, o.sha256,
            "a later direct capture of this host fetched different bytes for this address; "
              + "this earlier capture reused the old ones, which are now unverified against the source", now,
            host, o.address_norm);
          this.#sql.exec(
            `UPDATE site_assets SET sha256 = ?, content_type = ?, bytes = ?, last_seen = ?, last_fetched = ?,
               last_fetched_by = ?, stable_since = ?, changes = changes + 1 WHERE host = ? AND address_norm = ?`,
            o.sha256, o.content_type || cur.content_type, o.bytes || 0, now, now, primarySha, now, host, o.address_norm);
          changedCount++;
          if (changed.length < cap) {
            const reusedBy = this.#rows(`SELECT primary_sha FROM site_asset_refs WHERE host = ? AND address_norm = ? AND reused = 1
                                          ORDER BY primary_sha LIMIT ?`, host, o.address_norm, cap + 1);
            const count = Number(this.#one(`SELECT COUNT(*) AS n FROM site_asset_refs WHERE host = ? AND address_norm = ? AND reused = 1`,
                                           host, o.address_norm).n);
            if (reusedBy.length > cap) truncated = true;
            changed.push({ address_norm: o.address_norm, was: cur.sha256, now: o.sha256,
                           reused_by: reusedBy.slice(0, cap).map((a) => a.primary_sha), reused_by_count: count });
          } else truncated = true;
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
      return { host, recorded: observations.length, added, changed: changedCount, changes: changed, limit: cap, truncated };
    });
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
    return this.#tx(() => {
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
    });
  }

  /** R26, N90. The reuse verdicts, newest first, by bundle (ratify) or by source capture (which also surfaces the free
   *  posthoc verdicts), at most `limit`. */
  reuseVerdicts({ bundleId = null, sourceCapture = null, limit = null } = {}) {
    const cols = "source_capture, bundle_id, host, address_norm, phase, verdict, reused_sha, observed_sha, basis, at";
    const cap = limitOf(limit);
    const [key, value] = bundleId ? ["bundle_id", bundleId] : ["source_capture", sourceCapture];
    if (!value) return { verdicts: [] };
    const found = this.#rows(`SELECT ${cols} FROM reuse_verdicts WHERE ${key} = ? ORDER BY at DESC, address_norm LIMIT ?`, value, cap + 1);
    return { ...(bundleId ? { bundleId } : { sourceCapture }), verdicts: found.slice(0, cap), limit: cap, truncated: found.length > cap };
  }

  /** R24. Asset chrome by RECURRENCE across a host's pages (CAP-13: a page is its document address), a ratio, not a
   *  boolean: the threshold is the caller's. Primaries with no page on record enter neither side. N90: at most
   *  `limit` assets, most-recurring first, with the host's `total`; `documents` are the host's, never the page's. */
  siteChrome({ host, threshold = 0.6, limit = null } = {}) {
    if (!host) return { host: null, documents: 0, documents_undetermined: 0, assets: [] };
    const cap = limitOf(limit);
    const d = this.#one(
      `SELECT COUNT(DISTINCT cl.address_norm) AS pages, COUNT(DISTINCT CASE WHEN cl.capture_sha IS NULL THEN r.primary_sha END) AS unlocated
         FROM site_asset_refs r LEFT JOIN captured_locators cl ON cl.capture_sha = r.primary_sha WHERE r.host = ?`, host);
    const documents = (d && d.pages) || 0;
    const undetermined = (d && d.unlocated) || 0;
    const total = Number(this.#one(`SELECT COUNT(DISTINCT address_norm) AS n FROM site_asset_refs WHERE host = ?`, host).n);
    /* Most-recurring first: `share` is `pages / documents` over one host, so ordering by pages IS ordering by share. */
    const found = this.#rows(
      `SELECT r.address_norm AS address_norm, COUNT(DISTINCT cl.address_norm) AS pages,
              COUNT(DISTINCT CASE WHEN cl.capture_sha IS NULL THEN r.primary_sha END) AS unlocated
         FROM site_asset_refs r LEFT JOIN captured_locators cl ON cl.capture_sha = r.primary_sha
        WHERE r.host = ? GROUP BY r.address_norm ORDER BY pages DESC, r.address_norm LIMIT ?`, host, cap + 1);
    const assets = found.slice(0, cap).map((r) => {
      const share = documents ? r.pages / documents : 0;
      return { address_norm: r.address_norm, documents: r.pages, documents_undetermined: r.unlocated || 0, share,
               chrome: documents >= 3 && share >= threshold };
    });
    return { host, documents, documents_undetermined: undetermined, threshold, assets, total, limit: cap, truncated: found.length > cap,
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
    return this.#tx(() => {
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
    });
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
      return { ok: false, reason: "BAD_CAPTURE_SHA", detail: "a capture sha256 identifies the event; a record does not exist yet at capture time" };
    const text = boundedSubject(subject) || "a capture whose authority could not be determined";
    const loc = typeof locator === "string" && locator.length <= 2000 ? locator : null;
    const now = at && ISO_INSTANT.test(at) ? at : stampSecond();
    const existing = this.#tx(() => {
      const held = this.#one(`SELECT capture_sha FROM task_queue WHERE kind=? AND capture_sha=?`, kind, captureSha);
      if (!held)
        this.#sql.exec(`INSERT INTO task_queue (kind, capture_sha, subject, locator, enqueued) VALUES (?,?,?,?,?)`,
                       kind, captureSha, text, loc, now);
      return held;
    });
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
      return this.#tx(() => {
        if (!this.#one(`SELECT 1 AS x FROM task_queue WHERE kind=? AND capture_sha=?`, kind, captureSha)) return { found: false };
        this.#sql.exec(`UPDATE task_queue SET attempts = attempts + 1, last_try = ? WHERE kind=? AND capture_sha=?`,
                       at ?? stampSecond(), kind, captureSha);
        return { found: true };
      });
    } catch { return { found: false }; }
  }

  /** R45 */
  taskEventRemove({ kind, captureSha } = {}) {
    try {
      return this.#tx(() => {
        if (!this.#one(`SELECT 1 AS x FROM task_queue WHERE kind=? AND capture_sha=?`, kind, captureSha)) return { found: false };
        this.#sql.exec(`DELETE FROM task_queue WHERE kind=? AND capture_sha=?`, kind, captureSha);
        return { found: true };
      });
    } catch { return { found: false }; }
  }

  /* ==================================================================== *
   * R73 (`acquisition` R22; N140, K287): the validators a filed direct capture was served with
   * ==================================================================== */

  /** R73 (`acquisition` R22): what the source sent about the bytes of the capture this fetch filed (`ETag`, `Last-Modified`), under the
   *  document address. Written by the acquisition act on every filed direct capture; a later write for the same pair
   *  replaces it. Never throws. */
  recordValidators({ addressNorm, captureSha, etag = null, lastModified = null, at = null } = {}) {
    try {
      if (typeof addressNorm !== "string" || !addressNorm || typeof captureSha !== "string" || !HEX64.test(captureSha))
        return { recorded: false };
      this.#tx(() => this.#sql.exec(`INSERT INTO capture_validators (address_norm, capture_sha, etag, last_modified, at) VALUES (?, ?, ?, ?, ?)
                                     ON CONFLICT(address_norm, capture_sha) DO UPDATE SET etag = excluded.etag,
                                       last_modified = excluded.last_modified, at = excluded.at`,
                                    addressNorm, captureSha, etag || null, lastModified || null, at && ISO_INSTANT.test(at) ? at : stampSecond()));
      return { recorded: true };
    } catch { return { recorded: false }; }
  }

  /** R73 (`acquisition` R22): the validators recorded for one capture at one document address, or null when none was sent or none is
   *  recorded. Never throws. */
  validatorsOf({ addressNorm, captureSha } = {}) {
    try {
      const r = this.#one(`SELECT etag, last_modified FROM capture_validators WHERE address_norm = ? AND capture_sha = ?`,
                          addressNorm, captureSha);
      return r && (r.etag || r.last_modified) ? { etag: r.etag || null, lastModified: r.last_modified || null } : null;
    } catch { return null; }
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

  /** `acquisition` R19 (K120 (3)): the subresource stagger, an instance setting in record-core in milliseconds; not set, a jittered
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
    this.#tx(() => {
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
    });
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

  /* ==================================================================== *
   * Its figures (R75)
   * ==================================================================== */

  /** R75: the figures `registerCounts` (record-core R63) asks for, in this order. */
  static COUNT_KEYS = Object.freeze(["taskQueue", "sourceReachability"]);

  /** R75: `taskQueue` (the `task_queue` rows) and `sourceReachability` (the `source_reachability` rows), as the legacy
   *  store's `#counts` took them. Neither table names a bundle, so `hid` (the bundles the caller may not see) leaves
   *  no row out and each figure counts every row. A figure that cannot be read is null, never zero. Synchronous;
   *  writes nothing; never throws. */
  counts(hid = null) {
    const n = (table) => {
      try { const v = Number(this.#one(`SELECT count(*) AS c FROM ${table}`).c); return Number.isFinite(v) ? v : null; }
      catch { return null; }
    };
    return { taskQueue: n("task_queue"), sourceReachability: n("source_reachability") };
  }
}

/** Whether a purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function captureOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CAPTURE_PURGED_TABLES.includes(name) || CAPTURE_EXEMPT_TABLES.includes(name);
}

/* The Durable Object routes this module answers, as entries of the plane's one route map (plane R5: `routes` spreads
   them in, and control-plane's `dispatch` answers every store request over it). `url` carries the control plane's
   stamps; `body` the parsed body. N90: every read a route answers is bounded here, whatever the caller omits (`limit`
   defaults to READ_LIMIT's), and pages by `after`. */
export function captureOps(c, url, body, env) {
  const q = (k) => url.searchParams.get(k);
  const viewerOf = () => (url.searchParams.has("viewer") ? q("viewer") : undefined);
  const page = { limit: q("limit") || READ_LIMIT.default, after: q("after") || null };
  return {
    capturelimit: () => c.captureLimit(q("runtime") || "subrequests"),
    siteassets: () => { const a = body || { host: q("host") }; return c.siteAssets({ after: page.after, ...a, limit: a.limit ?? page.limit }); },
    recordsiteassets: () => c.recordSiteAssets(body || {}),
    reusedparts: () => c.reusedParts(q("id")),
    recordreuseverdicts: () => c.recordReuseVerdicts(body || {}),
    reuseverdicts: () => c.reuseVerdicts({ bundleId: q("bundle"), sourceCapture: q("capture"), limit: page.limit }),
    renderadmit: () => c.renderAdmit(body || {}),
    renderspend: () => c.renderSpend(body || {}),
    recordlinks: () => c.recordLinks(body || {}),
    resolvelinks: () => c.resolveLinks({ sourceCapture: q("capture"), viewer: viewerOf(), ...page }),
    linksto: () => c.linksTo({ address_norm: q("address"), viewer: viewerOf(), ...page }),
    recordlinkverdict: () => c.recordLinkVerdict(body || {}),
    navchanges: () => c.navChanges({ host: q("host"), limit: q("limit"), viewer: viewerOf() }),
    derivesitechrome: () => c.deriveSiteChrome({ host: q("host"), limit: q("limit"), after: q("after") }),
    chromeof: () => c.chromeOf({ host: q("host"), ...page }),
    recordsourceoutcome: () => c.recordSourceOutcome(body || {}),
    sourcereach: () => c.sourceReachability({ addressNorm: q("address"), now: q("now") }),
    taskenqueue: () => c.taskEnqueue(body || {}),
    savecapturesession: () => c.saveCaptureSession(body || {}),
    loadcapturesession: () => c.loadCaptureSession({ session: q("session") }),
    dropcapturesession: () => c.dropCaptureSession({ session: q("session") }),
    sitechrome: () => c.siteChrome({ host: q("host"), threshold: Number(q("threshold")) || 0.6, limit: page.limit }),
    recordcapturelimit: () => c.recordCaptureLimit(body || {}),
    knock: () => c.knock({ ...(body || {}), sourceAddress: q("source") }),
    inboxlist: () => c.inboxList(q("status") || null, { ...page, sort: q("sort"), dir: q("dir") }),
    inboxget: () => c.inboxGet(q("id")),
    /* N499: a body names no `at` or `within`: the pull's instant and its joined act are an in-process caller's. */
    inboxresolve: () => { const b = body || {}; return c.inboxResolve({ knockId: b.knockId, status: b.status, by: b.by, reason: b.reason }); },
    /* R80: the Worker's count of a knock it refused before the store; the tally read by the stamped viewer. */
    doorbellrefused: () => c.doorbellRefused(body || {}),
    doorbelltally: () => c.doorbellTally({ viewer: q("viewer") ?? "" }),
    /* R76, R77, R79, R81: by the caller's stamped viewer; an unstamped call sees nothing. The author is the stamp. */
    gradenote: () => c.gradeNoteOf({ captureSha: q("capture") ?? (body && body.captureSha), viewer: q("viewer") ?? "" }),
    heldcaptures: () => c.heldCaptures({ member: q("member"), project: q("project"), sort: q("sort"), dir: q("dir"), ...page,
                                         viewer: q("viewer") ?? "" }),
    heldsetaside: () => c.setAside({ ids: body && body.ids, reason: body && body.reason, author: q("by") ?? q("author"),
                                     viewer: q("viewer") ?? "" }),
    heldrestore: () => c.restoreHeld({ ids: body && body.ids, reason: body && body.reason, author: q("by") ?? q("author"),
                                       viewer: q("viewer") ?? "" }),
    /* N364: the control plane stamps `by` (the member session); a stamp in the query wins over a body's copy. */
    inboxpull: () => c.pullKnock({ knockId: (body && body.knockId) || q("id"), by: q("by") ?? (body && body.by) }),
    knocksof: () => c.knocksOf({ pseudonym: q("pseudonym") ?? (body && body.pseudonym), ...page }),
    pulledknocks: () => c.pulledKnocksOf(q("capture") ?? (body && body.captureSha)),
    reattest: () => c.reattest({ ...(body || {}), by: q("by") ?? (body && body.by) ?? null }),
    lateattestations: () => c.lateAttestationsOf(q("capture") ?? (body && body.captureSha)),
    captureaccount: () => c.recordCaptureAccount({ ...(body || {}), by: q("by") ?? (body && body.by) }),
    /* N388: the accounts answer by the caller's sight; an unstamped call sees nothing (REC-30's fail-closed posture). */
    captureaccounts: () => c.captureAccountsOf(q("capture") ?? (body && body.captureSha), { viewer: q("viewer") ?? "" }),
    /* K72 (11): the Worker's op forwards here with the control plane's stamps in the query. */
    acquire: () => c.acquire(body || {}, { cls: q("cls"), member: q("member") === "1", sessMember: q("sessMember") || null,
                                          storeName: q("store") || "bio" }),
    archivelookup: () => c.archiveLookup({ address: (body && body.address) || q("address") }),
  };
}
