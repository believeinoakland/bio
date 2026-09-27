/* record-core — the record's storage (layer 2): id allocation, leases, the append-only history and
   manifest of every promotion, the instance's settings, the evidence store, and purge. It holds no
   member, capability or fence (membership's) and decides nothing about what may be committed
   (promotion's). Requirements: build/requirements/record-core.md (R1–R59).

   REACHED THROUGH `recordOf(ctx)`: one instance per Durable Object storage, so every module in the
   object shares one transaction depth, one purge declaration list and one evidence binding. The
   instance reads and writes only this module's own tables and the clock (R31); `purge` also clears
   the tables other modules declared to it (R21), and `seedMintLedger` reads the live rows its
   caller names. Extracted from `legacy-store` (store.mjs, schema.mjs) in T3; the reasoning the
   legacy comments carried is kept beside the code it explains. */
import { checkBundle, createSha256, PROJECT_ID_CHECKS, PER_ITEM_CHECKS } from "../../checks/bio-checks.mjs";

export { RECORD_SCHEMA } from "./schema.mjs";

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const REFUSED = Symbol("record-core-refusal");
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
const te = new TextEncoder();

/* ---- the instant (R47, R48): module-level functions ---- */

/* D-543 — THE STAMPING HELPER, AND IT NAMES ITS PRECISION AT EVERY CALL. The record spells an instant
   two ways: `…:00Z` (whole seconds — the convention `ISO_TS_RE` holds a document's own bytes to, about
   twenty gate checks) and `…:00.123Z` (milliseconds, `toISOString()`'s own spelling, which a row
   stamped for ordering keeps). Neither is wrong; what was wrong is that the precision was carried by a
   regex or a `split` at each site, in two spellings nobody named, so a site's precision could be learned
   only by reading it. `stampInstant("second" | "millisecond", when)` says it; any other word throws.
   `observation_log.at` stays whole-second by BOB #33's ruling (D-516), and it is a "second" call here
   like any other, not an exception to the helper.
   AND TWO SPELLINGS MUST NEVER BE COMPARED AS STRINGS: `Z` sorts above `.`, so `…:00Z` ranks AFTER
   `…:00.123Z` though it names the earlier instant (read as `.000`). `instantOrder` compares INSTANTS —
   negative, zero or positive like a comparator, and NaN when either side is not an instant, so a
   `> 0` / `< 0` test is false for an unreadable stamp rather than ranking it as zero. Where a
   comparison crosses act kinds, it goes through this. */
export function stampInstant(precision, when = Date.now()) {
  if (precision !== "millisecond" && precision !== "second")
    throw new Error(`stampInstant: precision is "second" or "millisecond", never ${JSON.stringify(precision)}`);
  const iso = new Date(when).toISOString();
  return precision === "millisecond" ? iso : iso.replace(/\.\d+Z$/, "Z");
}
export function instantOrder(a, b) {
  const x = typeof a === "string" && a ? Date.parse(a) : NaN, y = typeof b === "string" && b ? Date.parse(b) : NaN;
  return x - y;
}

/* ---- a file's digest and size (R58): module-level functions ---- */

/** R57's creation marker: the SHA-256 of the empty string, the base a creation's manifest entry records, as the
 *  check catalogue recognises it. */
export const EMPTY_STRING_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/* REC-175: THE ONE COMPUTATION of what a promoted file's digest IS, read by `promotion` before any write and by
   `digestCensus` over what is already held, so the check at the door and the census of the past cannot disagree
   about what a disagreement is. An inline file is hashed over `new TextEncoder().encode(text)` — the UTF-8 bytes
   of the string the `files.content` column stores, never a normalised copy (no trimming, no line-ending fold).
   A blob-backed file's digest is its content address, `blobSha`, lower-cased. Null for neither. */
export function fileDigestOf(f) {
  if (f && typeof f.text === "string") return createSha256().update(te.encode(f.text)).hex();
  if (f && typeof f.blobSha === "string" && f.blobSha) return f.blobSha.toLowerCase();
  return null;
}
/* REC-178: THE ONE MEASURE of an inline file's size — the byte length of the UTF-8 encoding of the string the
   `files.content` column stores — read by `promotion` (the stored figure and its inline bound) and by `digestCensus`
   (the held figure), so the door and the census cannot disagree about what a size is. Null for a blob-backed file. */
export function inlineBytesOf(f) {
  return f && typeof f.text === "string" ? te.encode(f.text).length : null;
}

/* R56, R57: a census's listing bound — an integer 0..500, 50 when absent, empty or not an integer. */
function censusCap(limit) {
  const asked = limit === undefined || limit === null || limit === "" ? NaN : Number(limit);
  return Math.max(0, Math.min(Number.isInteger(asked) ? asked : 50, 500));
}
/* REC-176: THE FILE LIST A MANIFEST ROW RECORDS. An unparsable or non-array value is an EMPTY list. */
function manifestFiles(filesJson) {
  let arr;
  try { arr = filesJson == null ? null : JSON.parse(filesJson); } catch { arr = null; }
  return Array.isArray(arr) ? arr.filter((f) => f && typeof f === "object") : [];
}

/* ---- the set form of an act (R49–R52, R55, C-75): module-level ---- */

/** R49: the most items one set may carry. */
export const PER_ITEM_MAX = 100;

/* D-126 — THE PER-ITEM WEIGHT — "each item independently succeeds or is RETAINED WITH A REASON"
 * (NOTIFICATIONS.md §Applying a handler to a selection; Bob: *"If that action didn't work for one or
 * more, they'd stay in the list so that the user can take a different action."*).
 *
 * ONE HELPER FOR EVERY SET ACT. An act that takes a SET when its body carries `items` hands each item to
 * the SAME function its single form calls (`one`), so an item is accepted and refused by exactly the
 * rules one key would be, and its reason is that act's own refusal, verbatim. This helper words only
 * what belongs to the SET (C-75).
 *
 * WHAT IT REFUSES TO BE, and each is how a liar would pass the row:
 *   - ALL-OR-NOTHING RELABELLED. A refusal on item k does not stop item k+1; nothing here breaks out of
 *     the loop.
 *   - SILENT SKIPPING. Every item the caller sent has exactly one outcome in `items[]`, at its own
 *     `index`, `applied` or `retained`, and `applied + retained === count` by construction.
 *   - `ok: true` OVER A MIXED SET. `ok` is true only when EVERY item applied; otherwise the answer is
 *     C-75.5's summary refusal WITH `items[]` beside it.
 *
 * THE SERVER'S STAMPS WIN OVER EVERY ITEM. `stamped` (the actor, the decider) is spread LAST, so an item
 * that names its own actor is overwritten exactly as a single-key body is. The rest of the body is SHARED
 * — a common `reason`, `to` or disposition — and an item may override it for itself.
 *
 * REC-205 — A SHARED IDENTITY OF ONE SHAPE MUST NOT REACH AN ITEM OF ANOTHER (R51). An act with several
 * identity shapes decides WHICH ACT IT IS by what the caller sent, and in a set that is the shared body
 * plus the item: a project named once for a selection made every OTHER item project-scoped too
 * (measured at 1a7f0bcc0). So an item that NAMES a key of one or more of `itemKeys`' groups keeps the
 * shared values of THOSE groups' keys and of `sharedKeys`, and the other groups' identity keys are dropped
 * for that item alone; an item naming no identity is unchanged. The groups are the act's published ones
 * (`affordances`' `PER_ITEM_ACTS`), passed by its caller: this module knows no act.
 *
 * ITEMS ARE NOT IN ONE TRANSACTION, deliberately: independence is the weight. */
export function perItem(act, body, stamped, one, { itemKeys = null, sharedKeys = null } = {}) {
  const refusal = (code, detail, extra) => {
    const row = PER_ITEM_CHECKS[code];
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
  };
  const { items, ...shared } = body && typeof body === "object" ? body : {};
  const count = Array.isArray(items) ? items.length : 0;
  /* DEC-49 REGION is-per-item-set-shape */
  if (!Array.isArray(items) || items.length === 0)
    return refusal("SET_NO_ITEMS",
      `op=${act} was sent as a set and the set holds no items. Send \`items\` as a non-empty array, or `
      + `send one item's fields without \`items\` for the single act. Nothing was done.`,
      { op: act, weight: "per-item", count: 0 });
  if (items.length > PER_ITEM_MAX)
    return refusal("SET_TOO_LARGE",
      `op=${act} acts on at most ${PER_ITEM_MAX} items at once and this set holds ${items.length}. `
      + `Refused WHOLE, before any item was tried, so no item moved.`,
      { op: act, weight: "per-item", count: items.length, max: PER_ITEM_MAX });
  /* END DEC-49 REGION is-per-item-set-shape */
  const echo = (it) => {
    const o = {};
    for (const [k, v] of Object.entries(it)) {
      if (typeof v === "string") o[k] = v.slice(0, 400);
      else if (typeof v === "number" || typeof v === "boolean" || v === null) o[k] = v;
    }
    return o;
  };
  /* An identity key is one some group names and `sharedKeys` does not, so a key an act declares shareable is
     never taken from an item that relies on it. NAMED is read as the acts read an identity: a trimmed,
     non-empty string, so `project: ""` names nothing. */
  const groups = Array.isArray(itemKeys) ? itemKeys.filter(Array.isArray) : [];
  const shareable = new Set(Array.isArray(sharedKeys) ? sharedKeys : []);
  const identity = new Set(groups.flat().filter((k) => !shareable.has(k)));
  const namesIt = (o, k) => typeof o[k] === "string" && o[k].trim() !== "";
  const sharedFor = (it) => {
    const named = [...identity].filter((k) => namesIt(it, k));
    if (named.length === 0) return shared;
    const reach = new Set();
    for (const g of groups) if (g.some((k) => named.includes(k))) for (const k of g) reach.add(k);
    const narrowed = { ...shared };
    for (const k of identity) if (!reach.has(k)) delete narrowed[k];
    return narrowed;
  };
  const outcomes = [];
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    /* DEC-49 REGION is-per-item-malformed */
    if (!it || typeof it !== "object" || Array.isArray(it)) {
      outcomes.push({ ...refusal("SET_ITEM_MALFORMED", `item ${i} is not an object naming one ${act} subject; it was `
        + `left as it was and the other items were still tried.`), index: i, outcome: "retained", asked: null });
      continue;
    }
    /* END DEC-49 REGION is-per-item-malformed */
    let r;
    try {
      const b = { ...sharedFor(it), ...it, ...stamped };
      delete b.items;               /* an item cannot smuggle a nested set back into the act */
      r = one(b);
    } catch (e) {
      /* DEC-49 REGION is-per-item-failed */
      r = refusal("SET_ITEM_FAILED", `op=${act} threw on item ${i} rather than refusing it: `
        + String((e && e.message) || e).slice(0, 200) + `. Nothing about the item is claimed.`);
      /* END DEC-49 REGION is-per-item-failed */
    }
    const res = r && typeof r === "object" ? r : { ok: false };
    outcomes.push({ ...res, index: i, outcome: res.ok === true ? "applied" : "retained", asked: echo(it) });
  }
  const applied = outcomes.filter((o) => o.outcome === "applied").length;
  const retained = outcomes.length - applied;
  const head = { op: act, weight: "per-item", count, applied, retained, items: outcomes };
  if (retained === 0)
    return { ok: true, ...head, detail: `every one of the ${count} item(s) was applied, each by op=${act}'s own rules.` };
  /* DEC-49 REGION is-per-item-retained */
  return { ok: false, reason: "SET_ITEMS_RETAINED", code: "SET_ITEMS_RETAINED",
           check: PER_ITEM_CHECKS.SET_ITEMS_RETAINED.check,
           translation: PER_ITEM_CHECKS.SET_ITEMS_RETAINED.translation,
           detail: `${applied} of ${count} item(s) applied and ${retained} RETAINED; each retained item in `
             + `items[] carries its own act's reason. The applied items stand — this is not a rollback.`,
           ...head };
  /* END DEC-49 REGION is-per-item-retained */
}

const instances = new WeakMap();

/** R39: the one RecordCore for this object's storage. `ctx` is the Durable Object state (anything with
 *  `storage.sql` and `storage.transactionSync`), or that storage itself. `opts` is read on the first call
 *  only: `evidence` — the instance's evidence bucket (R2) or null; `evidencePrefix` — what every evidence
 *  key begins with (`<store>/captures/`), or a function answering it when it is asked. */
export function recordOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let rc = instances.get(storage);
  if (!rc) { rc = new RecordCore(storage, opts); instances.set(storage, rc); }
  return rc;
}

export class RecordCore {
  /** R3/R27, C-59.5 (Membership v2 §7, "A MINTED ID CARRIES NO COUNT"): THE PREFIXES WHOSE OBJECTS A READ
   *  WITHHOLDS FROM SOME CALLER. Their ids are minted opaque by the act that creates them and never from
   *  `allocId`'s counter, because a counted suffix tells its reader how many were minted before, hidden
   *  ones included: PROJ (a project out of sight), CASE (an unratified case), DRAFT (a draft), RVG (a
   *  review grant), TASK (a task naming a bundle the viewer cannot see). */
  static GATED_ID_PREFIXES = Object.freeze(["PROJ", "CASE", "DRAFT", "RVG", "TASK"]);

  /** D-432: the gated prefixes whose mint passes NO tail, so an id the counter issued for them before
   *  REC-151 (`seq`'s `<P>-<year>` scope, 0001 up to next-1) is exactly an id the opaque minter can draw;
   *  `seedMintLedger` records that range. PROJ and TASK carry a slug the counter never recorded. */
  static UNTAILED_GATED_PREFIXES = Object.freeze(["CASE", "DRAFT", "RVG"]);

  /** This module's own tables, declared to purge by it (R21), and those purge never clears (R23). */
  static OWN_TABLES = Object.freeze(["files", "history", "manifest", "leases", "bundles"]);
  static EXEMPT_TABLES = Object.freeze(["seq", "minted_ids", "settings"]);

  #storage; #sql; #depth = 0; #declared = new Map(); #order = []; #evidence; #evidencePrefix; #firstBoot;
  #auditChecks = [];      // R59: {module, check}, in registration order

  constructor(storage, { evidence = null, evidencePrefix = "bio/captures/" } = {}) {
    this.#storage = storage;
    this.#sql = storage.sql;
    /* R54, D-436: THE STORE'S FIRST BOOT, witnessed here, when the instance is made — before the store's schema
       pass or `migrate` creates or alters a table — since storage that has never held the record's schema has no
       `bundles` table. Asked through `PRAGMA table_info`, the form every boot already runs, never a catalogue read
       that could throw inside blockConcurrencyWhile (which bricks the Durable Object). */
    try { this.#firstBoot = [...this.#sql.exec(`PRAGMA table_info(bundles)`)].length === 0; }
    catch { this.#firstBoot = false; }
    this.#evidence = evidence && typeof evidence.get === "function" ? evidence : null;
    this.#evidencePrefix = evidencePrefix;
    this.declarePurge("record-core", RecordCore.OWN_TABLES, { exempt: RecordCore.EXEMPT_TABLES });
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /** R54: true throughout the boot at which the store had never held the record's schema, decided once, when
   *  this instance was made; false at every later boot. `instance-setup` reads it. */
  isFirstBoot() { return this.#firstBoot === true; }

  /** Additive columns this module's tables gained after a store was first written. Called by the
   *  store after its schema pass; idempotent. */
  migrate() {
    const cols = this.#rows(`PRAGMA table_info(bundles)`).map((r) => r.name);
    if (cols.length && !cols.includes("project")) this.#sql.exec(`ALTER TABLE bundles ADD COLUMN project TEXT`);
    this.#sql.exec(`CREATE INDEX IF NOT EXISTS bundles_project ON bundles(project, bundle_id)`);
  }

  /* ---- transactions (R32) ---- */

  /** Runs `fn` as one transaction over the whole store. A throw, or a returned refusal (`ok:false`),
   *  rolls back every row written inside it, in any module's tables; a refusal is then returned, a
   *  throw rethrown. A call made inside another joins it as a savepoint (a Durable Object's
   *  `transactionSync` nests so, measured in Miniflare): a nested call that throws or refuses rolls back
   *  its own writes and ids and nothing else, and the outer call decides the rest (R32, K133). */
  transact(fn) {
    let result;
    this.#depth++;
    try {
      return this.#storage.transactionSync(() => {
        result = fn();
        if (result && typeof result === "object" && result.ok === false) throw REFUSED;
        return result;
      });
    } catch (e) {
      if (e === REFUSED) return result;
      throw e;
    } finally {
      this.#depth--;
    }
  }

  /* ---- ids (R1–R9) ---- */

  /** R1, R2: `<prefix>-<year>-NNNN`, the scope's next number; the same step inside a caller's
   *  transaction as on its own, because it joins the caller's. */
  allocId(prefix, year) {
    return this.transact(() => this.#nextSeq(prefix, year));
  }

  #nextSeq(prefix, year) {
    const scope = `${prefix}-${year}`;
    const cur = this.#one(`SELECT next FROM seq WHERE scope=?`, scope);
    const n = cur ? cur.next : 1;
    this.#sql.exec(`INSERT INTO seq (scope,next) VALUES (?,?) ON CONFLICT(scope) DO UPDATE SET next=?`, scope, n + 1, n + 1);
    return { id: `${prefix}-${year}-${String(n).padStart(4, "0")}` };
  }

  /** R3–R5, REC-151 / C-59.5: the door a CALLER allocates through. Gating is decided on the counter's
   *  SCOPE (`<prefix>-<year>`), so moving the dash into the prefix cannot reach a gated counter, and a
   *  prefix that merely begins with a gated one's letters (`PROJECTX`) keys a different scope. The
   *  refusal echoes only what the caller sent. */
  allocIdOp(prefix, year) {
    const scope = `${prefix}-${year}`;
    const gated = RecordCore.GATED_ID_PREFIXES.find((g) => scope.startsWith(`${g}-`));
    /* DEC-49 REGION is-allocid-prefix-gated */
    if (gated) {
      const row = PROJECT_ID_CHECKS.ALLOCID_PREFIX_GATED;
      return { ok: false, reason: "ALLOCID_PREFIX_GATED", code: "ALLOCID_PREFIX_GATED", check: row.check,
               translation: row.translation,
               detail: `${gated}- ids are minted by the plane, opaque, by the act that creates the object; op=allocid `
                     + `allocates only a prefix whose objects every caller may see. Nothing was allocated.` };
    }
    /* END DEC-49 REGION is-allocid-prefix-gated */
    return this.allocId(prefix, year);
  }

  /** R6–R9, REC-151 / D-432: THE ONE OPAQUE MINTER. `<prefix>-<year>-<rand><tail>`, `<rand>` four digits
   *  from the CSPRNG, rejection-sampled so 0000–9999 are equally likely; the counter is not read or
   *  stepped. Each draw is asked of the caller's `taken(id)` and of the minter's own ledger
   *  (`minted_ids`), so an id that has existed is never drawn again, purge or not. The id is recorded
   *  BEFORE it is returned, in whatever transaction the caller holds and never one of its own, so an act
   *  that rolls back takes its id back with it. The INSERT is plain, into the ledger's primary key: were
   *  the read above it ever lost, the act fails loudly rather than handing a spent id out. Null only
   *  when 64 draws in a row collide. The ledger is read by no route and never counted or listed. */
  mintOpaqueId(prefix, year, tail = "", taken = () => false) {
    const draw = () => {
      const u = new Uint16Array(1);
      for (;;) { crypto.getRandomValues(u); if (u[0] < 60000) return String(u[0] % 10000).padStart(4, "0"); }
    };
    const spent = (id) => !!this.#one(`SELECT 1 AS x FROM minted_ids WHERE id=?`, id) || !!taken(id);
    for (let i = 0; i < 64; i++) {
      const id = `${prefix}-${year}-${draw()}${tail ?? ""}`;
      if (spent(id)) continue;
      this.#sql.exec(`INSERT INTO minted_ids (id,recorded_at,source) VALUES (?,?,'mint')`, id, new Date().toISOString());
      return id;
    }
    return null;
  }

  /** D-432: WHERE THE LEDGER LEARNS THE IDS NO MINT RECORDED, at every boot, idempotently.
   *  LIVE: every live row of a gated kind, from the `[prefix, table, column]` sources the caller names
   *  (the tables each mint site's `taken` reads; their owners declare them). COUNTER: for a prefix
   *  whose mint passes no tail, every id `seq` says the counter issued before REC-151, used or not,
   *  capped at 9,999. Rows already recorded are left as they are. One statement per source and one
   *  for the counter, each doing its work inside SQLite. */
  seedMintLedger(sources = []) {
    const at = new Date().toISOString();
    for (const [prefix, table, column] of sources) {
      if (!IDENT.test(String(table)) || !IDENT.test(String(column))) continue;
      this.#sql.exec(`INSERT OR IGNORE INTO minted_ids (id,recorded_at,source)
                      SELECT DISTINCT ${column}, ?, 'live' FROM ${table} WHERE ${column} GLOB ?`, at, `${prefix}-*`);
    }
    const scopes = RecordCore.UNTAILED_GATED_PREFIXES.map((p) => `${p}-[0-9][0-9][0-9][0-9]`);
    const inScope = (col) => scopes.map(() => `${col} GLOB ?`).join(" OR ");
    this.#sql.exec(`INSERT OR IGNORE INTO minted_ids (id,recorded_at,source)
                    WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n
                      WHERE i < (SELECT MIN(9999, COALESCE(MAX(next), 1) - 1) FROM seq WHERE ${inScope("scope")}))
                    SELECT s.scope || '-' || printf('%04d', n.i), ?, 'counter'
                      FROM seq s JOIN n ON n.i < s.next WHERE ${inScope("s.scope")}`,
                   ...scopes, at, ...scopes);
  }

  /* ---- leases (R10–R12) ---- */

  /** D-61: a lease is NEVER anonymous. It is a courtesy lock; promotion's CAS on `base` is the
   *  integrity mechanism, so the lease hands back the bundle's CURRENT digest as the edit base. */
  acquireLease(bundleId, actor, ttlMs) {
    if (typeof actor !== "string" || !actor.trim())
      return { ok: false, reason: "ANONYMOUS_LEASE",
               detail: "a lease is taken under a named actor — a member (from a session) or a machine "
                     + "identity (token:<class>). An unnamed writer cannot hold the courtesy lock." };
    return this.transact(() => {
      const now = Date.now();
      const cur = this.#one(`SELECT actor, expires FROM leases WHERE bundle_id=?`, bundleId);
      if (cur && cur.actor !== actor && Date.parse(cur.expires) > now)
        return { ok: false, heldBy: cur.actor, until: cur.expires };
      const b = this.#one(`SELECT bundle_sha FROM bundles WHERE bundle_id=?`, bundleId);
      const ttl = Number(ttlMs) || 0;
      const expires = new Date(now + ttl).toISOString();
      this.#sql.exec(
        `INSERT INTO leases (bundle_id,actor,acquired,expires,base_sha) VALUES (?,?,?,?,?)
         ON CONFLICT(bundle_id) DO UPDATE SET actor=excluded.actor, acquired=excluded.acquired, expires=excluded.expires, base_sha=excluded.base_sha`,
        bundleId, actor, new Date(now).toISOString(), expires, b ? b.bundle_sha : "");
      return { ok: true, actor, expires, base: b ? b.bundle_sha : null };
    });
  }

  /* ---- reads (R13–R17, R34–R36) ---- */

  /** R13, R14: a live file, inline text or its blob reference (never the bytes). */
  readFile(bundleId, path) {
    const r = this.#one(`SELECT content, blob_sha, bytes, sha256 FROM files WHERE bundle_id=? AND path=?`, bundleId, path);
    if (!r) return null;
    return r.content !== null ? { text: r.content, sha256: r.sha256 } : { blobSha: r.blob_sha, bytes: r.bytes, sha256: r.sha256 };
  }

  /** R15's fixed derivation: the key goes in the FILENAME, not a directory — `bundle.md` archived under
   *  K is `_history/bundle_K.md`, `data/changes.json` is `_history/data/changes_K.json` — because the
   *  check catalogue parses exactly this shape (C-12.2). */
  static snapPath(path, snapKey) {
    const cut = path.lastIndexOf("/");
    const dir = cut === -1 ? "" : path.slice(0, cut + 1);
    const name = cut === -1 ? path : path.slice(cut + 1);
    const dot = name.lastIndexOf(".");
    return dot === -1
      ? `_history/${dir}${name}_${snapKey}`
      : `_history/${dir}${name.slice(0, dot)}_${snapKey}${name.slice(dot)}`;
  }

  /** R15–R17: the byte-complete image the gate consumes, from this module's tables alone: every live
   *  file (a blob as its reference, carrying its size, so a partial writer can hand it back unchanged);
   *  every snapshot at its canonical path; a verbatim promotion record per manifest entry (C-20.1 reads
   *  the writer and operation from it, classifyDivergence rebuilds the hash chain from its per-file
   *  digests); and the manifest itself. R16 (D-674, D-700, State Rules I-20): "prior" is WRITE order,
   *  never the caller-chosen snap key, whose lexical order is not a clock, so every entry carries `seq`,
   *  its rank in the order this module recorded it, read from the table's own row order. The document
   *  keeps its entries sorted by key, the form the catalogue checks (C-12.1); a reader walks `seq`. */
  readImage(bundleId) {
    const img = {};
    for (const r of this.#sql.exec(`SELECT path, content, blob_sha, sha256, bytes FROM files WHERE bundle_id=?`, bundleId))
      img[r.path] = r.content !== null ? r.content
        : { blobSha: r.blob_sha, sha256: r.sha256, bytes: r.bytes };
    const snapFiles = new Map();
    for (const r of this.#sql.exec(`SELECT snap_key, path, content, blob_sha, sha256 FROM history WHERE bundle_id=?`, bundleId)) {
      img[RecordCore.snapPath(r.path, r.snap_key)] =
        r.content !== null ? r.content : { blobSha: r.blob_sha, sha256: r.sha256 };
      if (!snapFiles.has(r.snap_key)) snapFiles.set(r.snap_key, []);
      snapFiles.get(r.snap_key).push({ name: r.path, sha256: r.sha256 });
    }
    const entries = [];
    let seq = 0;
    for (const r of this.#sql.exec(
      `SELECT snap_key, kind, base, author, created, files_json, writer, operation FROM manifest
        WHERE bundle_id=? ORDER BY rowid`, bundleId)) {
      let written;
      try { written = JSON.parse(r.files_json); } catch { written = []; }
      if (!Array.isArray(written)) written = [];
      const writtenPairs = written.map((f) => typeof f === "string" ? { name: f, sha256: null } : f);
      const files = writtenPairs.map((f) => f.name);
      const snapshotted = (snapFiles.get(r.snap_key) || []).map((f) => f.name);
      entries.push({ key: r.snap_key, seq: ++seq, kind: r.kind, base: r.base, author: r.author,
                     created: r.created, files, snapshotted,
                     ...(r.writer ? { writer: r.writer, operation: r.operation } : {}) });
      img[`_history/promotion_${r.snap_key}.json`] = JSON.stringify({
        target: bundleId, base: r.base, files: writtenPairs,
        created: r.created, author: r.author, skill_version: "bio-plane",
        ...(r.writer ? { writer: r.writer, operation: r.operation } : {}),
      }, null, 2);
    }
    if (entries.length) {
      entries.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
      img["_history/manifest.json"] = JSON.stringify({ entries }, null, 2);
    }
    return Object.keys(img).length ? img : null;
  }

  /** R34 */
  bundleInfo(bundleId) {
    const r = this.#one(`SELECT bundle_id, object_type, title, project FROM bundles WHERE bundle_id=?`, bundleId);
    return r ? { id: r.bundle_id, type: r.object_type, title: r.title ?? null, project: r.project ?? null } : null;
  }

  /** R41 */
  head(bundleId) {
    const r = this.#one(`SELECT bundle_sha, row_version, object_type, title, current_state, prior_state, group_id
                           FROM bundles WHERE bundle_id=?`, bundleId);
    return r ? { bundleSha: r.bundle_sha, rowVersion: r.row_version, type: r.object_type, title: r.title ?? null,
                 currentState: r.current_state, priorState: r.prior_state ?? null, groupId: r.group_id } : null;
  }

  /** R42; `seq` is the entry's write-order rank, as in `readImage` (R16). */
  manifestEntry(bundleId, snapKey) {
    const r = this.#one(`SELECT kind, base, author, created, files_json, writer, operation,
                                (SELECT COUNT(*) FROM manifest x WHERE x.bundle_id = m.bundle_id AND x.rowid <= m.rowid) AS seq
                           FROM manifest m WHERE bundle_id=? AND snap_key=?`, bundleId, snapKey);
    if (!r) return null;
    let files;
    try { files = JSON.parse(r.files_json); } catch { files = []; }
    return { kind: r.kind, base: r.base ?? null, author: r.author ?? null, created: r.created,
             files: Array.isArray(files) ? files : [], writer: r.writer ?? null, operation: r.operation ?? null,
             seq: Number(r.seq) };
  }

  /** R43 */
  livePaths(bundleId) {
    if (!this.#one(`SELECT 1 AS x FROM bundles WHERE bundle_id=?`, bundleId)) return null;
    return this.#rows(`SELECT path FROM files WHERE bundle_id=? ORDER BY path`, bundleId).map((r) => r.path);
  }

  static #bound(limit) { return Math.max(1, Math.min(1000, Math.trunc(Number(limit)) || 200)); }

  /** R35 */
  listBundles({ project = null, after = "", limit = 200 } = {}) {
    const cap = RecordCore.#bound(limit);
    const ids = (project == null
      ? this.#rows(`SELECT bundle_id FROM bundles WHERE bundle_id > ? ORDER BY bundle_id LIMIT ?`, String(after ?? ""), cap)
      : this.#rows(`SELECT bundle_id FROM bundles WHERE project = ? AND bundle_id > ? ORDER BY bundle_id LIMIT ?`,
                   String(project), String(after ?? ""), cap)).map((r) => r.bundle_id);
    return { ids, cursor: ids.length ? ids[ids.length - 1] : null };
  }

  /** R36 */
  listByType({ type, after = "", limit = 200 } = {}) {
    const cap = RecordCore.#bound(limit);
    const ids = this.#rows(`SELECT bundle_id FROM bundles WHERE object_type = ? AND bundle_id > ? ORDER BY bundle_id LIMIT ?`,
                           String(type ?? ""), String(after ?? ""), cap).map((r) => r.bundle_id);
    return { ids, cursor: ids.length ? ids[ids.length - 1] : null };
  }

  /** R53: each held bundle, in id order after `after`, with at least one manifest entry whose author begins with
   *  `authorPrefix`, as `{bundleId, latest, firstOther}`. Entries are ordered by `created` and then by write order
   *  (rowid): `created` is the caller's stated time, and two entries stamped alike are ordered by the record, never
   *  by the snap key's lexical order, which is not a clock. `firstOther` is the earliest entry whose author is
   *  non-empty and does not begin with the prefix. What a viewer may see of the list is its caller's to decide. */
  manifestByAuthor({ authorPrefix = "", after = "", limit = 200 } = {}) {
    try {
      const cap = RecordCore.#bound(limit);
      const pre = String(authorPrefix ?? "");
      const begins = `(author IS NOT NULL AND substr(author, 1, length(?)) = ?)`;
      const ids = this.#rows(
        `SELECT b.bundle_id FROM bundles b
          WHERE b.bundle_id > ? AND EXISTS (SELECT 1 FROM manifest m WHERE m.bundle_id = b.bundle_id AND ${begins.replaceAll("author", "m.author")})
          ORDER BY b.bundle_id LIMIT ?`, String(after ?? ""), pre, pre, cap).map((r) => r.bundle_id);
      const entry = (r) => r ? { snapKey: r.snap_key, kind: r.kind, base: r.base ?? null, author: r.author ?? null,
                                 created: r.created, writer: r.writer ?? null, operation: r.operation ?? null } : null;
      const cols = `snap_key, kind, base, author, created, writer, operation`;
      const bundles = ids.map((id) => ({
        bundleId: id,
        latest: entry(this.#one(`SELECT ${cols} FROM manifest WHERE bundle_id=? ORDER BY created DESC, rowid DESC LIMIT 1`, id)),
        firstOther: entry(this.#one(`SELECT ${cols} FROM manifest WHERE bundle_id=? AND author IS NOT NULL AND author <> ''
                                       AND NOT ${begins} ORDER BY created, rowid LIMIT 1`, id, pre, pre)),
      }));
      return { bundles, cursor: ids.length ? ids[ids.length - 1] : null };
    } catch {
      return { bundles: [], cursor: null };
    }
  }

  /* ---- the censuses (R56, R57): read-only audits of this module's own tables ---- */

  /** R56, REC-175: THE CENSUS OF THE PAST — every row already HELD whose stored digest disagrees with its own
   *  stored content, over the live image (`files`) and the append-only snapshots (`history`). READ-ONLY, and that
   *  is the point: a disagreeing row is REPORTED, never rewritten — the record's history is not corrected by a read,
   *  and which of the two (bytes or digest) is wrong is not decidable from here. A row is recomputed by the one
   *  `fileDigestOf` (R58); `bytes` is judged beside it for live inline rows only, by the one `inlineBytesOf`, as a
   *  SEPARATE figure (history holds no size). Bounded by `limit` rows listed per table; the counts are always whole. */
  digestCensus({ limit } = {}) {
    const cap = censusCap(limit);
    const walk = (table) => {
      const out = { rows: 0, inline: 0, blob: 0, digest_disagrees: 0, bytes_disagree: 0, listed: [] };
      try {
        for (const r of this.#sql.exec(table === "files"
            ? `SELECT bundle_id, NULL AS snap_key, path, content, blob_sha, bytes, sha256 FROM files`
            : `SELECT bundle_id, snap_key, path, content, blob_sha, NULL AS bytes, sha256 FROM history`)) {
          out.rows++;
          const inline = r.content !== null && r.content !== undefined;
          if (inline) out.inline++; else out.blob++;
          const computed = fileDigestOf(inline ? { text: r.content } : { blobSha: r.blob_sha });
          const dBad = computed !== null && String(r.sha256 ?? "").toLowerCase() !== computed;
          const bBad = inline && table === "files" && Number(r.bytes) !== inlineBytesOf({ text: r.content });
          if (dBad) out.digest_disagrees++;
          if (bBad) out.bytes_disagree++;
          if ((dBad || bBad) && out.listed.length < cap)
            out.listed.push({ bundle_id: r.bundle_id, ...(table === "history" ? { snap_key: r.snap_key } : {}), path: r.path,
                              stored: r.sha256, computed, ...(bBad ? { bytes_stored: r.bytes } : {}),
                              digest: dBad ? "disagrees" : "agrees" });
        }
      } catch { /* R56 never throws: a table it cannot read is counted as far as it was read */ }
      return out;
    };
    return { ok: true, files: walk("files"), history: walk("history"), rewritten: 0,
             note: "read-only: a disagreeing row is reported and never rewritten. history holds no bytes column, "
                 + "so its bytes are not judged." };
  }

  /** R57, REC-176: THE CENSUS OF OVERWRITTEN MANIFEST ENTRIES — read-only; a bundle short of entries is REPORTED,
   *  never repaired: an entry an overwrite destroyed is not recoverable, and inventing it back would be the record
   *  claiming more than it holds. WHAT MAKES IT MEASURABLE: `commit` (R33) is the one writer of `manifest`, one entry
   *  per promotion, and steps `row_version` by one and nothing else does, so `row_version - COUNT(manifest)` is the
   *  number of promotions whose entry is gone. WHAT IT CANNOT DECIDE, stated per bundle rather than rounded: a bundle
   *  with NO creation entry (base = EMPTY_STRING_SHA) may have lost it to an overwrite OR predate the creation entry
   *  being written at all, so one promotion of such a bundle's deficit is `undetermined`, the rest `overwritten`.
   *  Which KEY collided is recorded nowhere and is not guessed; an entry whose base is none of the bundle's own
   *  entries' `bundle.md` digest (`unanchored`) is listed as the trace an overwrite leaves in the chain. Entries of
   *  a bundle id not held are counted apart. Bounded by `limit` bundles listed; the counts are always whole. */
  snapKeyCensus({ limit } = {}) {
    const cap = censusCap(limit);
    const out = { ok: true, bundles: 0, manifest_rows: 0, promotions: 0, overwritten: 0, undetermined: 0,
                  bundles_with_deficit: 0, excess: 0, orphan_manifest_bundles: 0, listed: [], rewritten: 0 };
    try {
      const rowsBy = new Map();
      for (const r of this.#sql.exec(`SELECT bundle_id, snap_key, base, files_json FROM manifest`)) {
        if (!rowsBy.has(r.bundle_id)) rowsBy.set(r.bundle_id, []);
        rowsBy.get(r.bundle_id).push(r);
      }
      const seen = new Set();
      for (const b of this.#sql.exec(`SELECT bundle_id, row_version FROM bundles`)) {
        out.bundles++;
        seen.add(b.bundle_id);
        const rows = rowsBy.get(b.bundle_id) || [];
        const promotions = Number(b.row_version) || 0;
        out.manifest_rows += rows.length;
        out.promotions += promotions;
        const deficit = promotions - rows.length;
        if (deficit < 0) out.excess += -deficit;
        const hasCreation = rows.some((r) => r.base === EMPTY_STRING_SHA);
        const outputs = new Set(rows.map((r) => {
          const md = manifestFiles(r.files_json).find((f) => f.name === "bundle.md");
          return md && typeof md.sha256 === "string" ? md.sha256.toLowerCase() : null;
        }).filter(Boolean));
        const unanchored = rows.filter((r) => r.base !== EMPTY_STRING_SHA
          && !outputs.has(String(r.base ?? "").toLowerCase())).map((r) => r.snap_key);
        if (deficit <= 0 && !unanchored.length) continue;
        const undetermined = deficit > 0 && !hasCreation ? 1 : 0;
        const overwritten = deficit > 0 ? deficit - undetermined : 0;
        out.overwritten += overwritten;
        out.undetermined += undetermined;
        if (deficit > 0) out.bundles_with_deficit++;
        if (out.listed.length < cap)
          out.listed.push({ bundle_id: b.bundle_id, promotions, manifest_rows: rows.length, overwritten, undetermined,
                            creation_row: hasCreation, unanchored });
      }
      for (const [id, rows] of rowsBy) if (!seen.has(id)) { out.orphan_manifest_bundles++; out.manifest_rows += rows.length; }
    } catch { /* R57 never throws */ }
    out.note = "read-only: a bundle whose manifest holds fewer rows than it has promotions lost a row to a repeated "
      + "snap key before REC-176; nothing is rewritten. 'undetermined' is one promotion of a bundle with no creation "
      + "row, which an overwrite and a store predating the creation row both produce. Which key collided is not "
      + "recorded and is not guessed.";
    return out;
  }

  /* ---- the write path (R33) ---- */

  /** R33: the one write into this module's tables, called inside `transact` by `promotion`, which alone
   *  decides what may be committed. Every live file the commit replaces is copied into `history` under
   *  `snapKey`; the new live files are written; the bundle's row is set; exactly one `manifest` entry is
   *  appended, `created` being this module's own clock (D-674). Nothing already in `history` or
   *  `manifest` is modified or removed (R29): a snap key already used for the bundle fails the
   *  append loudly (their primary keys) rather than rewriting it. R44: the row records the state, prior
   *  state, group, times and criticality as the caller gives them, and the entry's time is `at`, the
   *  caller's stated time (this module's clock when it states none). */
  commit({ bundleId, type, title = null, project = null, snapKey, kind = "promotion", base = null, author = null,
           writer = null, operation = null, files = [], state, priorState, group, created, lastUpdated, criticality,
           at }) {
    return this.transact(() => {
      const now = at ?? new Date().toISOString();
      const cur = this.#one(`SELECT row_version FROM bundles WHERE bundle_id=?`, bundleId);
      if (cur)
        for (const r of this.#rows(`SELECT path, content, blob_sha, sha256 FROM files WHERE bundle_id=?`, bundleId))
          this.#sql.exec(
            `INSERT INTO history (bundle_id,snap_key,path,content,blob_sha,sha256,created) VALUES (?,?,?,?,?,?,?)`,
            bundleId, snapKey, r.path, r.content, r.blob_sha, r.sha256, now);
      this.#sql.exec(
        `INSERT INTO manifest (bundle_id,snap_key,kind,base,author,created,files_json,writer,operation) VALUES (?,?,?,?,?,?,?,?,?)`,
        bundleId, snapKey, kind, base, author, now,
        JSON.stringify(files.map((f) => ({ name: f.path, sha256: f.sha256 }))), writer, operation);
      this.#sql.exec(`DELETE FROM files WHERE bundle_id=?`, bundleId);
      for (const f of files)
        this.#sql.exec(
          `INSERT INTO files (bundle_id,path,content,blob_sha,bytes,sha256) VALUES (?,?,?,?,?,?)`,
          bundleId, f.path, f.text ?? null, f.blobSha ?? null,
          f.bytes ?? (typeof f.text === "string" ? te.encode(f.text).length : 0), f.sha256);
      const bundleSha = (files.find((f) => f.path === "bundle.md") || files[0] || {}).sha256 ?? "";
      const given = [["current_state", state], ["prior_state", priorState], ["group_id", group], ["created", created],
                     ["last_updated", lastUpdated], ["criticality", criticality]].filter(([, v]) => v !== undefined);
      if (cur)
        this.#sql.exec(
          `UPDATE bundles SET object_type=?, title=?, project=?, bundle_sha=?, row_version=row_version+1
            ${given.map(([k]) => `, ${k}=?`).join("")} WHERE bundle_id=?`,
          type, title, project, bundleSha, ...given.map(([, v]) => v ?? null), bundleId);
      else
        this.#sql.exec(
          `INSERT INTO bundles (bundle_id,object_type,group_id,title,current_state,prior_state,created,last_updated,
                                criticality,bundle_sha,row_version,project) VALUES (?,?,?,?,?,?,?,?,?,?,1,?)`,
          bundleId, type, group ?? "", title, state ?? "", priorState ?? null, created ?? now, lastUpdated ?? now,
          criticality ?? null, bundleSha, project);
      const after = this.#one(`SELECT bundle_sha, row_version FROM bundles WHERE bundle_id=?`, bundleId);
      return { bundleSha: after.bundle_sha, rowVersion: after.row_version };
    });
  }

  /* ---- the audit sweep (R18–R20, R45, R59) ---- */

  /** R59 (N51, K130, the K31 pattern): a later module registers, once at start, an audit check that `auditPass`
   *  runs over every bundle of a page beside the catalogue, called `check(image, context)`: `image` is what
   *  `checkBundle` gets (`bundleId`/`folderName`, `files`, `elidedPaths`, `sha256`, `sha512`, R19's `resolveTarget`)
   *  and `raw`, the bundle's `readImage`; `context` is R45's for the bundle (`{}` when the caller gives none), so a check that left the catalogue for its module is not
   *  lost to the audit, and the bundle is judged once, whole. */
  registerAuditCheck(module, check) {
    if (typeof module !== "string" || !module || typeof check !== "function")
      return { ok: false, reason: "AUDIT_CHECK_MALFORMED", detail: "an audit check names its module and is a function" };
    if (this.#auditChecks.some((c) => c.module === module))
      return { ok: false, reason: "AUDIT_CHECK_DECLARED", module, detail: `${module} has already registered its audit check` };
    this.#auditChecks.push({ module, check });
    return { ok: true, module };
  }

  /** R18–R20: the check catalogue over a bounded page of bundles in id order after `after`, run WHERE
   *  THE DATA IS (one network round trip per image was ~97% of an outside pass's cost). What a reference
   *  resolves against is the WHOLE corpus, asked of `bundles` by its key one reference at a time, and never
   *  leaves this method: filtering it would manufacture dangling-reference findings out of a viewer's
   *  position (REC-30). What is gated is what leaves: the page holds only bundles `visible(id)` admits.
   *  N117: every read here carries an SQL `LIMIT` — the cursor read takes the ids after `after` a page's
   *  worth at a time and stops once the page is full, and no read loads the corpus's ids whole.
   *  `context(id)` adds the caller's further checkBundle options for a bundle (the earned and published
   *  registries later modules build). Blob-backed files are declared elided: existence assertions see them,
   *  byte checks skip them. */
  async auditPass({ after = "", limit = 200, visible = null, context = null } = {}) {
    const cap = RecordCore.#bound(limit);
    const page = [];
    let scan = String(after ?? "");
    for (;;) {
      const batch = this.#rows(`SELECT bundle_id FROM bundles WHERE bundle_id > ? ORDER BY bundle_id LIMIT ?`, scan, cap);
      for (const r of batch) {
        if (typeof visible === "function" && !visible(r.bundle_id)) continue;
        page.push(r.bundle_id);
        if (page.length >= cap) break;
      }
      if (page.length >= cap || batch.length < cap) break;
      scan = batch[batch.length - 1].bundle_id;
    }
    const sha256 = async (v) => hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te.encode(v) : v));
    const sha512 = async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b));
    /* REC-56 / D-206: `tally` is keyed by check id and `tallyDetail` by `<check>/<code>`, because one
       check can report different facts; `tallyDetail` is absent when nothing on the page carried a code. */
    const tally = {}; const tallyDetail = {}; const offenders = [];
    let clean = 0, withErrors = 0;
    for (const id of page) {
      const img = this.readImage(id) || {};
      const files = new Map(), elided = new Set();
      for (const [path, v] of Object.entries(img)) {
        if (typeof v === "string") files.set(path, v); else elided.add(path);
      }
      const extra = typeof context === "function" ? (context(id) || {}) : {};
      const resolveTarget = (t) => typeof t === "string" && !!this.#one(`SELECT 1 AS x FROM bundles WHERE bundle_id=? LIMIT 1`, t);
      const { findings } = await checkBundle({
        folderName: id, files, elidedPaths: elided, sha256, sha512, resolveTarget, ...extra,
      });
      /* R59: every registered check over the same image, in registration order. A check that throws is an error
         finding of its own, never a clean bundle. */
      for (const { module, check } of this.#auditChecks) {
        let more;
        try { more = await check({ bundleId: id, folderName: id, raw: img, files, elidedPaths: elided, sha256, sha512,
                                   resolveTarget }, extra); }
        catch (e) {
          more = [{ check: module, code: "AUDIT_CHECK_FAILED", severity: "error",
                    message: `${module}'s audit check threw on ${id}: ${String((e && e.message) || e).slice(0, 200)}` }];
        }
        if (Array.isArray(more)) findings.push(...more.filter((f) => f && typeof f === "object"));
      }
      const errs = findings.filter((f) => f.severity === "error");
      if (!errs.length) { clean++; continue; }
      withErrors++;
      for (const e of errs) {
        tally[e.check] = (tally[e.check] || 0) + 1;
        if (e.code) { const k = `${e.check}/${e.code}`; tallyDetail[k] = (tallyDetail[k] || 0) + 1; }
      }
      /* Bounded: the tally says how much, these say what it looks like. */
      if (offenders.length < 20)
        offenders.push({ bundleId: id, errors: errs.slice(0, 5).map((e) => ({ check: e.check, detail: e.message })) });
    }
    const last = page.length ? page[page.length - 1] : after;
    return { ok: true, checked: page.length, clean, withErrors, tally,
             ...(Object.keys(tallyDetail).length ? { tallyDetail } : {}),
             offenders, limit: cap, cursor: page.length === cap ? last : null, page };
  }

  /* ---- purge (R21–R24) ---- */

  /** R21, R46: a module declares the tables it owns, once, at start. An entry is a table name, keyed to a
   *  bundle by its `bundle_id` column when it has one, or `{name, keys, whole}`: keyed to a bundle by the
   *  named columns (any of them matching; none, and only the whole-store form clears it), and cleared by
   *  the whole-store form only where the `whole` clause holds. `exempt` names tables purge never clears.
   *  A table declared twice, or by two modules, is refused, and the refused declaration declares nothing. */
  declarePurge(module, tables = [], { exempt = [] } = {}) {
    const entries = [...tables.map((t) => (typeof t === "string" ? { name: t } : { ...t })),
                     ...exempt.map((name) => ({ name, exempt: true }))];
    const names = new Set();
    for (const e of entries) {
      if (!IDENT.test(String(e.name)) || (e.keys != null && !(Array.isArray(e.keys) && e.keys.every((k) => IDENT.test(String(k))))))
        return { ok: false, reason: "TABLE_NAME_INVALID", table: String(e.name), module };
      if (this.#declared.has(e.name) || names.has(e.name))
        return { ok: false, reason: "TABLE_DECLARED", table: e.name, module,
                 declaredBy: this.#declared.has(e.name) ? this.#declared.get(e.name).module : module };
      names.add(e.name);
    }
    for (const e of entries) {
      const d = { module, name: e.name, exempt: !!e.exempt, keys: e.keys == null ? null : [...e.keys], whole: e.whole || null };
      this.#declared.set(e.name, d);
      this.#order.push(d);
    }
    return { ok: true };
  }

  /** R22–R24: whole-store (no `bundleId`) or one bundle's rows, from every declared non-exempt table,
   *  in declaration order and this module's `bundles` last, in one transaction. `seq`, `minted_ids` and
   *  `settings` are exempt in both forms, on the counter's reasoning: an id once allocated or minted is
   *  never reissued, and a purge that reset them would make identifiers ambiguous across it. An
   *  undeclared table is never touched. Evidence objects are untouched (content-addressed, immutable). */
  purge({ bundleId = null } = {}) {
    const one = bundleId != null && bundleId !== "";
    const isRow = (d) => d.module === "record-core" && d.name === "bundles";
    const plan = [...this.#order.filter((d) => !d.exempt && !isRow(d)), ...this.#order.filter((d) => !d.exempt && isRow(d))];
    const removed = {};
    this.transact(() => {
      for (const d of plan) {
        removed[d.name] = 0;
        let where, args = [];
        if (one) {
          const keys = d.keys ?? (this.#rows(`PRAGMA table_info(${d.name})`).some((c) => c.name === "bundle_id") ? ["bundle_id"] : []);
          if (!keys.length) continue;
          where = keys.map((k) => `${k}=?`).join(" OR "); args = keys.map(() => bundleId);
        } else where = d.whole || "1=1";
        const n = this.#one(`SELECT COUNT(*) AS n FROM ${d.name} WHERE ${where}`, ...args);
        removed[d.name] = n ? Number(n.n) : 0;
        if (removed[d.name]) this.#sql.exec(`DELETE FROM ${d.name} WHERE ${where}`, ...args);
      }
    });
    return { ok: true, scope: one ? bundleId : "ALL", removed };
  }

  /* ---- settings (R25, R26) ---- */

  /** R25: the value last set under `name`, or null. */
  getSetting(name) {
    const r = this.#one(`SELECT value FROM settings WHERE name=? ORDER BY rowid DESC LIMIT 1`, String(name ?? ""));
    if (!r) return null;
    try { return JSON.parse(r.value); } catch { return null; }
  }

  /** R25, R26: records `value` under `name`, with who set it and when. `jurisdiction_profiles` is an
   *  ordered list of profile ids (non-empty strings, no repeats); anything else is refused and nothing
   *  is recorded. */
  setSetting(name, value, by) {
    const n = String(name ?? "");
    if (!n) return { ok: false, reason: "SETTING_NAME_REQUIRED" };
    if (typeof by !== "string" || !by.trim()) return { ok: false, reason: "SETTING_BY_REQUIRED" };
    if (value === undefined) return { ok: false, reason: "SETTING_VALUE_REQUIRED" };
    if (n === "jurisdiction_profiles"
        && !(Array.isArray(value) && value.every((v) => typeof v === "string" && v.trim() !== "")
             && new Set(value).size === value.length))
      return { ok: false, reason: "SETTING_INVALID", name: n,
               detail: "jurisdiction_profiles is an ordered list of distinct profile ids" };
    this.#sql.exec(`INSERT INTO settings (name,value,set_by,set_at) VALUES (?,?,?,?)`,
                   n, JSON.stringify(value), by, new Date().toISOString());
    return { ok: true };
  }

  /* ---- the evidence store (R38) ---- */

  /** R38: the instance's evidence bucket, addressed by digest; the object key of a digest is fixed
   *  here (the prefix R39's `evidencePrefix` gives, then the digest). `put` hands the bucket the digest, so it verifies the bytes.
   *  Null when no bucket is bound. */
  evidenceStore() {
    const bucket = this.#evidence;
    if (!bucket) return null;
    const prefix = typeof this.#evidencePrefix === "function" ? this.#evidencePrefix() : this.#evidencePrefix;
    const key = (digest) => `${prefix ?? ""}${String(digest)}`;
    return {
      head: (digest) => bucket.head(key(digest)),
      get: (digest) => bucket.get(key(digest)),
      put: (digest, bytes) => bucket.put(key(digest), bytes, { sha256: String(digest) }),
    };
  }
}
