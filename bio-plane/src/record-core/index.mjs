/* record-core — the record's storage (layer 2): id allocation, leases, the append-only history and
   manifest of every promotion, the instance's settings, the evidence store, and purge. It holds no
   member, capability or fence (membership's) and decides nothing about what may be committed
   (promotion's). Requirements: build/requirements/record-core.md (R1–R75).

   REACHED THROUGH `recordOf(ctx)`: one instance per Durable Object storage, so every module in the
   object shares one transaction depth, one purge declaration list and one evidence binding. The
   instance reads and writes only this module's own tables and the clock (R31); `purge` also clears
   the tables other modules declared to it (R21), and `seedMintLedger` reads the live rows its
   caller and the registered seeds name (R40, R70). Extracted from `legacy-store` (store.mjs, schema.mjs) in T3; the
   reasoning the legacy comments carried is kept beside the code it explains. T19: the audit's seams (R68, R69), the
   mint seeds (R70), the schema run first (R71) and the ops map (R72, R73). T20: this module's own figures exported for
   `plane` to register (R74). T24: a chosen opaque id recorded in the ledger (R75). */
import { checkBundle, createSha256, EXTENSION_ARMS, LEGACY_TYPE_ALIASES } from "../record-grammar/index.mjs";
import { RECORD_SCHEMA } from "./schema.mjs";
import { RECORD_CORE_CHECKS, PER_ITEM_CHECKS } from "./checks.mjs";

export { RECORD_SCHEMA };
export { RECORD_CORE_CHECKS, PER_ITEM_CHECKS } from "./checks.mjs";

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const C_ID = /^C-\d+(\.\d+)?$/;             /* a catalogue check id, as `checkBundle`'s grammars name them */

/* A refusal under one of this module's own rows (DEC-49): its code, its row's check and translation, and the detail;
   `more` adds the refusal's own fields and never replaces these. */
function rowRefusal(code, detail, more) {
  const row = RECORD_CORE_CHECKS[code];
  return { ...more, ok: false, reason: code, code, check: row.check, translation: row.translation, detail };
}
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

/* ---- no free opaque id (R62, C-59.6): module-level ---- */

/* What each opaque-minted prefix's id is called in R62's detail: R3's set (`RecordCore.GATED_ID_PREFIXES`), and `SRC`, a
   source, which `sources` mints opaque through `mintOpaqueId` and never through the counter (N376, K540). */
const MINTED_OBJECT = Object.freeze({ PROJ: "project", CASE: "case", DRAFT: "draft", RVG: "grant", TASK: "task", SRC: "source" });

/** R62 (N322, N250, K275, K392): THE ONE ANSWER TO ONE CONDITION, no free opaque id could be drawn (`mintOpaqueId`
 *  answered null, R9). Every act of any module that meets it answers through here, so `MINT_EXHAUSTED` is minted at
 *  one site under one row (C-59.6). `detail` is one fixed sentence per prefix, naming the id that could not be drawn
 *  and saying nothing was written, the same for every caller; a prefix neither in R3's set nor `SRC` is named by no object. `extra`
 *  adds the caller's own fields and never replaces these. It writes nothing and never throws. */
export function mintExhausted(prefix, extra) {
  const asked = typeof prefix === "string" ? prefix : "";        /* only a string names a prefix */
  const what = Object.hasOwn(MINTED_OBJECT, asked) ? `${MINTED_OBJECT[asked]} ` : "";
  let own = {};
  try { if (extra && typeof extra === "object" && !Array.isArray(extra)) own = { ...extra }; } catch { own = {}; }
  const row = RECORD_CORE_CHECKS.MINT_EXHAUSTED;
  /* DEC-49 REGION is-mint-exhausted */
  return { ...own, ok: false, reason: "MINT_EXHAUSTED", code: "MINT_EXHAUSTED", check: row.check,
           translation: row.translation, prefix: asked,
           detail: `the plane could not find a free ${what}id: every one it drew was already taken. Nothing was written.` };
  /* END DEC-49 REGION is-mint-exhausted */
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
/* The storage's SQL of an instance, for this module's own route arms (R73's sight gate) and nothing outside it. */
let sqlOf;

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

  static { sqlOf = (rc) => rc.#sql; }

  #storage; #sql; #declared = new Map(); #order = []; #evidence; #evidencePrefix; #firstBoot;
  #held = [];             // R66: one list per open `transact`, outermost first, of what `afterCommit` held
  #auditChecks = [];      // R59: {module, check}, in registration order
  #grammars = [];         // R67: {module, ids, arm}, in registration order
  #countsBy = [];         // R63: {module, keys, counts}, in registration order
  #statsSource = null;    // R65: {module, figures}, the one source of the instance's figures
  #auditFindings = [];    // R68: {module, key, finding}, in registration order
  #auditContexts = [];    // R69: {module, context}, in registration order
  #mintSeeds = [];        // R70: {module, sources}, in registration order

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

  /* The additive columns this module's tables gained after a store was first written: nullable, so an older row simply
     has none (a hand-authored promotion names no writer, a bundle committed before R34's column names no project). */
  static #ADDITIVE_COLUMNS = Object.freeze([
    ["manifest", "writer", "TEXT"], ["manifest", "operation", "TEXT"], ["bundles", "project", "TEXT"],
  ]);

  /** R71: this module's schema (`RECORD_SCHEMA`) and its own migrations, run by the composition root BEFORE any other
   *  module's `migrate`, so `bundles` exists before any module reads it. Every step is guarded on what the storage
   *  already holds, so a second run changes nothing.
   *  REC-143 — THE ADDITIVE COLUMNS ARE ADDED BEFORE THE SCHEMA RUNS, AND AGAIN AFTER IT. The schema text carries
   *  indexes, and an index over a column only this list adds would hit an OLD table that lacks it and throw inside
   *  blockConcurrencyWhile (every release 0.59.0–0.63.0 bricked an existing store so). So the whole list runs first for
   *  every table that exists, and again after the schema, for a table the schema created on this boot (a guarded
   *  `ALTER` on a table created whole adds nothing).
   *  `classification` was REMOVED from the Information catalogue on 2026-07-27 (Bob's decision, state doc v30): dropped
   *  rather than orphaned, so a store migrated forward and a fresh install present the same table; guarded, because
   *  `DROP COLUMN` on a column already gone is an error. History keeps any frontmatter that carried it, which is correct.
   *  The type renames (problem → focus 2026-07-27, focus → inquiry REC-10) are normalised in `bundles.object_type`, the
   *  DERIVED layer, from record-grammar's own `LEGACY_TYPE_ALIASES` rather than restated, so a further name is one entry
   *  there and no edit here; append-only history keeps whatever spelling it was written with. */
  migrate() {
    const addColumns = () => {
      for (const [table, column, decl] of RecordCore.#ADDITIVE_COLUMNS) {
        const have = this.#rows(`PRAGMA table_info(${table})`).map((r) => r.name);
        /* An absent table reads as no columns: it is skipped here and the schema creates it. */
        if (have.length && !have.includes(column)) this.#sql.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${decl}`);
      }
    };
    addColumns();
    const bare = RECORD_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const statement of bare.split(";")) { const t = statement.trim(); if (t) this.#sql.exec(t); }
    addColumns();
    this.#sql.exec(`CREATE INDEX IF NOT EXISTS bundles_project ON bundles(project, bundle_id)`);
    if (this.#rows(`PRAGMA table_info(bundles)`).some((r) => r.name === "classification"))
      this.#sql.exec(`ALTER TABLE bundles DROP COLUMN classification`);
    for (const [legacy, canonical] of Object.entries(LEGACY_TYPE_ALIASES))
      this.#sql.exec(`UPDATE bundles SET object_type=? WHERE object_type=?`, canonical, legacy);
  }

  /* ---- transactions (R32, R66) ---- */

  /** Runs `fn` as one transaction over the whole store. A throw, or a returned refusal (`ok:false`),
   *  rolls back every row written inside it, in any module's tables; a refusal is then returned, a
   *  throw rethrown. A call made inside another joins it as a savepoint (a Durable Object's
   *  `transactionSync` nests so, measured in Miniflare): a nested call that throws or refuses rolls back
   *  its own writes and ids and nothing else, and the outer call decides the rest (R32, K133). */
  transact(fn) {
    let result, out, committed = false;
    const held = [];                  /* R66: what `afterCommit` held inside this call */
    this.#held.push(held);
    try {
      out = this.#storage.transactionSync(() => {
        result = fn();
        if (result && typeof result === "object" && result.ok === false) throw REFUSED;
        return result;
      });
      committed = true;
    } catch (e) {
      if (e !== REFUSED) throw e;     /* a throw drops what this call held, with its rows */
      out = result;                   /* so does a refusal */
    } finally {
      this.#held.pop();
    }
    /* R66: a savepoint that committed hands what it held to the transaction around it, which may still roll it
       back; the outermost commit runs it, now, before this call returns. */
    if (committed) {
      if (this.#held.length) this.#held[this.#held.length - 1].push(...held);
      else RecordCore.#runHeld(held);
    }
    return out;
  }

  /** R66 (N406, K598): `fn` runs after the record has committed what it was asked in: at once outside any `transact`;
   *  inside one, synchronously just after the outermost `transact` commits and before that call returns, in the order
   *  the calls were made; never when the transaction, or the savepoint holding it, rolls back (a throw or an `ok:false`
   *  answer). A held `fn` that throws does not undo the commit, stop the others or change what `transact` answers: a
   *  caller that must know (reevaluation's `listeners_failed`) catches its own. A non-function is a caller's defect. */
  afterCommit(fn) {
    if (typeof fn !== "function") throw new TypeError("afterCommit: fn is not a function");
    if (this.#held.length) this.#held[this.#held.length - 1].push(fn);
    else RecordCore.#runHeld([fn]);
  }

  static #runHeld(fns) {
    for (const fn of fns) { try { fn(); } catch { /* R66: the commit stands, and so do the others */ } }
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
      const row = RECORD_CORE_CHECKS.ALLOCID_PREFIX_GATED;
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

  /** R75 (N503, K1151): A CHOSEN OPAQUE ID, RECORDED AS A DRAWN ONE IS. A caller whose id is not drawn here (a notice id
   *  another instance chose, network-notices R4) records it in the same ledger, in the caller's own transaction and
   *  never one of its own, so the act that rolls back takes the id back with it (R7's rule) and, once it commits,
   *  `mintOpaqueId` never draws it and no purge forgets it (R6, R8). Refused, recording nothing: an id that is not a
   *  non-empty string (`OPAQUE_ID_MALFORMED`); one the ledger already holds, drawn, recorded or seeded (`OPAQUE_ID_SPENT`,
   *  naming it); a call outside any `transact` (`OPAQUE_ID_NO_TRANSACTION`), where nothing could take the record back.
   *  FAIL CLOSED: an INSERT the ledger refuses, by its primary key or because it cannot be written, is answered as spent,
   *  so a caller never uses an id the ledger has not taken. Never throws. */
  recordOpaqueId(id) {
    /* DEC-49 REGION is-opaque-id-refused */
    if (typeof id !== "string" || id === "")
      return rowRefusal("OPAQUE_ID_MALFORMED", "an opaque id to record is a non-empty string; nothing was recorded.");
    if (!this.#held.length)
      return rowRefusal("OPAQUE_ID_NO_TRANSACTION", `${id} was not recorded: an opaque id is recorded inside the transaction of `
        + "the act that uses it, so a rollback takes it back, and no transaction is open. Nothing was recorded.", { id });
    const spent = () => rowRefusal("OPAQUE_ID_SPENT", `${id} is already in the opaque-id ledger, or the ledger could not `
      + "confirm it free; an id is recorded once and never handed out again. Nothing was recorded.", { id });
    /* One plain INSERT into the ledger's primary key decides it: a spent id is refused by the key itself, so no read
       can be lost between asking and recording. */
    try { this.#sql.exec(`INSERT INTO minted_ids (id,recorded_at,source) VALUES (?,?,'chosen')`, id, new Date().toISOString()); }
    catch { return spent(); }
    /* END DEC-49 REGION is-opaque-id-refused */
    return { ok: true, id };
  }

  /** D-432: WHERE THE LEDGER LEARNS THE IDS NO MINT RECORDED, at every boot, idempotently.
   *  LIVE: every live row of a gated kind, from the `[prefix, table, column]` sources the caller names
   *  (the tables each mint site's `taken` reads; their owners declare them). COUNTER: for a prefix
   *  whose mint passes no tail, every id `seq` says the counter issued before REC-151, used or not,
   *  capped at 9,999. Rows already recorded are left as they are. One statement per source and one
   *  for the counter, each doing its work inside SQLite. A live id is matched by its literal `<prefix>-`
   *  head, never a GLOB built from the prefix: workerd refuses a pattern over 50 bytes (K313), and a
   *  prefix is the caller's, of any length and any characters. */
  seedMintLedger(sources = []) {
    const at = new Date().toISOString();
    /* R40, R70: the caller's sources, then every registered module's, each named by its table's owner. */
    for (const [prefix, table, column] of [...sources, ...this.#mintSeeds.flatMap((r) => r.sources)]) {
      if (!IDENT.test(String(table)) || !IDENT.test(String(column))) continue;
      const head = `${prefix}-`;
      this.#sql.exec(`INSERT OR IGNORE INTO minted_ids (id,recorded_at,source)
                      SELECT DISTINCT ${column}, ?, 'live' FROM ${table}
                       WHERE typeof(${column}) = 'text' AND substr(${column}, 1, length(?)) = ?`, at, head, head);
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

  /** R70 (`build/extraction/legacy-store.md` §4.2 (3)): a later module whose table holds opaque ids registers once, at
   *  start, its seed sources, `[[prefix, table, column], …]` over its own tables only, and `seedMintLedger` (R40) learns
   *  their live ids as it learns its caller's, so the ledger knows every id an opaque mint site's `taken` reads without
   *  this module naming a later module's table. A second registration by the same module is `MINT_SEED_DECLARED`; no
   *  module name, or a source that is not three non-empty strings, `MINT_SEED_MALFORMED`. A refused registration
   *  registers nothing; an accepted one writes nothing until the next seed. */
  registerMintSeed(module, sources) {
    const named = typeof module === "string" && module.trim() !== "";
    const wellFormed = (x) => Array.isArray(x) && x.length === 3 && x.every((v) => typeof v === "string" && v.trim() !== "");
    /* DEC-49 REGION is-mint-seed-registration */
    if (!named || !Array.isArray(sources) || !sources.every(wellFormed))
      return rowRefusal("MINT_SEED_MALFORMED", "a mint seed names its module and a list of [prefix, table, column] sources, "
        + "each three non-empty strings; nothing was registered.", { module: named ? module : null });
    if (this.#mintSeeds.some((r) => r.module === module))
      return rowRefusal("MINT_SEED_DECLARED", `${module} has already registered its mint seed; the first still stands.`,
                        { module, heldBy: module });
    /* END DEC-49 REGION is-mint-seed-registration */
    const held = Object.freeze(sources.map((x) => Object.freeze([...x])));
    this.#mintSeeds.push({ module, sources: held });
    return { ok: true, module, sources: held.map((x) => [...x]) };
  }

  /* ---- leases (R10–R12, R61) ---- */

  /** R10, R30, R61: the one refusal of an unnamed actor, for taking a lease and for ending one. */
  static #anonymousLease(actor) {
    if (typeof actor === "string" && actor.trim()) return null;
    return { ok: false, reason: "ANONYMOUS_LEASE",
             detail: "a lease is taken under a named actor — a member (from a session) or a machine "
                   + "identity (token:<class>). An unnamed writer cannot hold the courtesy lock." };
  }

  /** D-61: a lease is NEVER anonymous. It is a courtesy lock; promotion's CAS on `base` is the
   *  integrity mechanism, so the lease hands back the bundle's CURRENT digest as the edit base. */
  acquireLease(bundleId, actor, ttlMs) {
    const anonymous = RecordCore.#anonymousLease(actor);
    if (anonymous) return anonymous;
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

  /** R61 (N219): ends `actor`'s own lease on the bundle, live or expired, so no one is refused it (R11) until a
   *  lease is taken again. A lease another actor holds, or none, is left as it is: releasing is never a way to
   *  take a lock from its holder. Never throws; a read or write that fails released nothing (its transaction
   *  rolled back) and says so. */
  releaseLease(bundleId, actor) {
    const anonymous = RecordCore.#anonymousLease(actor);
    if (anonymous) return anonymous;
    try {
      return this.transact(() => {
        const cur = this.#one(`SELECT actor FROM leases WHERE bundle_id=?`, bundleId);
        if (!cur || cur.actor !== actor) return { ok: true, released: false };
        this.#sql.exec(`DELETE FROM leases WHERE bundle_id=? AND actor=?`, bundleId, actor);
        return { ok: true, released: true };
      });
    } catch {
      return { ok: true, released: false };
    }
  }

  /* ---- reads (R13–R17, R34–R36) ---- */

  /** R13, R14: a live file, inline text or its blob reference (never the bytes). */
  readFile(bundleId, path) {
    const r = this.#one(`SELECT content, blob_sha, bytes, sha256 FROM files WHERE bundle_id=? AND path=?`, bundleId, path);
    if (!r) return null;
    return r.content !== null ? { text: r.content, sha256: r.sha256 } : { blobSha: r.blob_sha, bytes: r.bytes, sha256: r.sha256 };
  }

  /** R60, D-442: THE PINNED BYTES OF A BUNDLE'S `bundle.md` — the text whose SHA-256 is `sha`, from the live file or
   *  any historical snapshot of it, read from this module's own tables alone. A row is a candidate by its stored
   *  digest (compared lower-cased) and is answered only when its text hashes to `sha` by R58's one digest, so a row
   *  whose stored digest disagrees with its content (R56) never passes its text off as the pinned bytes. A blob-backed
   *  row holds no text and is passed over, never ending the search. Null when either argument is absent, nothing
   *  matches, or the read fails; never throws. `publication` R2 and `ratification` R3 read it. */
  textAtSha(bundleId, sha) {
    if (typeof bundleId !== "string" || !bundleId || typeof sha !== "string" || !sha) return null;
    const want = sha.toLowerCase();
    try {
      for (const table of ["files", "history"])
        for (const r of this.#sql.exec(`SELECT content FROM ${table} WHERE bundle_id=? AND path='bundle.md'
                                          AND content IS NOT NULL AND lower(sha256)=?`, bundleId, want))
          if (typeof r.content === "string" && fileDigestOf({ text: r.content }) === want) return r.content;
    } catch { /* R60 never throws */ }
    return null;
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
    out.note = "read-only: a record whose manifest holds fewer rows than it has promotions lost a row to a repeated "
      + "snap key before REC-176; nothing is rewritten. 'undetermined' is one promotion of a record with no creation "
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
   *  caller's stated time (this module's clock when it states none). R37 (N287): `group_id` is the producing
   *  group as the committer gave it, KEPT when a later commit gives none (absent or null: the column holds no
   *  null), the empty string for a bundle created naming none; `prior_state` is `priorState` as last given. */
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
                     ["last_updated", lastUpdated], ["criticality", criticality]]
        .filter(([k, v]) => v !== undefined && !(k === "group_id" && v === null));
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

  /* ---- the store's counts (R63) ---- */

  /** R63 (N342, K435; the R59 pattern, with its keys named up front as `declarePurge` names its tables): a module that
   *  owns tables registers once, at start, the figures it reports and `counts(hid)`, a synchronous function answering
   *  them, so `op=stats` and purge's proof read every module's figures without calling a later module. Two modules
   *  never report one key: a key already held, or named twice in one list, is `COUNTS_DECLARED` naming its holder, and
   *  so is a module's second registration; no module name, no non-empty list of names, or no function is
   *  `COUNTS_MALFORMED`. A refused registration registers nothing. It writes nothing. */
  registerCounts(module, keys, counts) {
    const refuse = (code, detail, more) => {
      const row = RECORD_CORE_CHECKS[code];
      return { ...more, ok: false, reason: code, code, check: row.check, translation: row.translation, detail };
    };
    /* DEC-49 REGION is-counts-registration */
    if (typeof module !== "string" || !module.trim() || !Array.isArray(keys) || keys.length === 0
        || !keys.every((k) => typeof k === "string" && k.trim() !== "") || typeof counts !== "function")
      return refuse("COUNTS_MALFORMED", "a counts registration names its module, a non-empty list of figure names and "
        + "a function answering them; nothing was registered.", { module: typeof module === "string" ? module : null });
    /* The one conflict, found before anything is registered: the module's own earlier registration, else the first
       key already held (by another module, or earlier in this same list). */
    let clash = this.#countsBy.some((r) => r.module === module) ? { heldBy: module } : null;
    for (let i = 0; !clash && i < keys.length; i++) {
      const held = keys.indexOf(keys[i]) < i ? module : this.#countsBy.find((r) => r.keys.includes(keys[i]))?.module;
      if (held) clash = { key: keys[i], heldBy: held };
    }
    if (clash)
      return refuse("COUNTS_DECLARED", clash.key === undefined
        ? `${module} has already registered its figures; nothing more was registered.`
        : `the figure ${clash.key} is already reported by ${clash.heldBy}; nothing was registered.`, { module, ...clash });
    /* END DEC-49 REGION is-counts-registration */
    this.#countsBy.push({ module, keys: [...keys], counts });
    return { ok: true, module, keys: [...keys] };
  }

  /** R63: every registered figure, in registration order, each the number its module's function gave for it, or null
   *  when that function threw or gave no finite number for it: a figure that could not be read is never zero. `hid`
   *  (`{sql, args}`, the bundles the caller may not see, or null) is passed to each function as it was given, never
   *  read here. Each function is asked once per answer. Writes nothing; never throws. */
  counts(hid = null) {
    const out = [];
    for (const { keys, counts } of this.#countsBy) {
      let got = null;
      try { got = counts(hid); } catch { got = null; }
      /* A promise is no figure: it is answered null, and its rejection, if any, is handled here, never left unhandled. */
      try { if (got !== null && typeof got === "object" && typeof got.then === "function") { got.then(null, () => {}); got = null; } }
      catch { got = null; }
      for (const key of keys) {
        let v = null;
        try { v = got !== null && typeof got === "object" ? got[key] : null; } catch { v = null; }
        out.push([key, typeof v === "number" && Number.isFinite(v) ? v : null]);
      }
    }
    return Object.fromEntries(out);
  }

  /** R74 (K861, plane R10): this module's share of the instance's figures, exported for `plane`, which registers it
   *  under this module's name through R63 (`registerCounts("record-core", RecordCore.COUNT_KEYS, (hid) => rc.ownCounts(hid))`);
   *  the module registers nothing itself. Each figure is the table's rows less those naming a bundle in `hid` by its
   *  `bundle_id`. `refs` is `connections`' table and not this module's figure (R31; K877). */
  static COUNT_KEYS = Object.freeze(["bundles", "files", "history"]);
  static #COUNTED = Object.freeze({ bundles: "bundles", files: "files", history: "history" });

  /** R74, D-464 (A COUNT IS TAKEN THROUGH THE CALLER'S OWN SIGHT): R63's `counts(hid)` for this module's share, moved
   *  here from the plane in T20 (K861) with its reading kept. `hid` is membership's `hiddenBundles` (`{sql, args}`), or null for
   *  a viewer that sees every bundle and for the direct internal call, which count whole. `COALESCE(k, '')`: a NULL key
   *  names no bundle, and `NULL NOT IN (…)` is NULL, which would drop the row. A figure whose table cannot be read is
   *  left out, and R63 answers it null. Synchronous; writes nothing; never throws. */
  ownCounts(hid = null) {
    const out = {};
    for (const key of RecordCore.COUNT_KEYS) {
      const table = RecordCore.#COUNTED[key];
      try {
        out[key] = hid ? this.#one(`SELECT count(*) AS c FROM ${table} WHERE COALESCE(bundle_id, '') NOT IN ${hid.sql}`, ...hid.args).c
                       : this.#one(`SELECT count(*) AS c FROM ${table}`).c;
      } catch { /* unread: R63 answers it null, never zero */ }
    }
    return out;
  }

  /* ---- the instance's figures and what each caller is told of them (R64, R65; K621) ---- */

  /* REC-131 / IC-148 (BOB #15's corrected ruling, `MEMBER-KNOWLEDGE-DESIGN.md` §5, *A COUNT IS A DISCLOSURE OF
     EXISTENCE*): a count over rows a caller could not all read goes only to a caller who could read them all, and for
     members' leads THAT CALLER DOES NOT EXIST, so `leads` is on the wire for no class. ONE KEY NEVER CARRIES TWO
     MEANINGS: the wire's log count excludes lead looks and is published as `observationsNonLead`, a name that states
     its predicate; purge's `observations` keeps the whole log, and the wire carries no `observations` key, so no reader
     compares the two under one name. The themes and their placements (D-162) are purge's proof only: a count of
     members' lenses is not an operator fact. */
  static #PROOF_ONLY = Object.freeze(["leads", "observations", "themes", "themePlacements"]);
  static #WIRE_ONLY = Object.freeze(["observationsNonLead"]);

  /** R65 (K621): the one source of the instance's figures, registered once at start, `figures({viewer, proof})`
   *  answering them through the caller's sight (`viewer` exactly as the caller sent it, `undefined` when never sent,
   *  a direct internal call that counts whole). The sight and the counting are the source's, over the tables it
   *  reads; which figures each caller is told is this module's (R64). A second source is `STATS_SOURCE_DECLARED`,
   *  naming the holder; one without a module name or a function `STATS_SOURCE_MALFORMED`. */
  registerStatsSource(module, figures) {
    /* DEC-49 REGION is-stats-source-registration */
    if (typeof module !== "string" || !module.trim() || typeof figures !== "function")
      return rowRefusal("STATS_SOURCE_MALFORMED", "a statistics source names its module and is a function; nothing was registered.",
                       { module: typeof module === "string" ? module : null });
    if (this.#statsSource)
      return rowRefusal("STATS_SOURCE_DECLARED", `the instance's figures are already supplied by ${this.#statsSource.module}; `
        + "nothing was registered.", { module, heldBy: this.#statsSource.module });
    /* END DEC-49 REGION is-stats-source-registration */
    this.#statsSource = { module, figures };
    return { ok: true, module };
  }

  /* The source's figures, as a plain object of its own enumerable fields; none (`{}`) when no source is registered or
     it threw or answered no object. A field that cannot be read is left out. */
  #figures(viewer, proof) {
    const out = {};
    if (!this.#statsSource) return out;
    let got;
    try { got = this.#statsSource.figures({ viewer, proof }); } catch { return out; }
    if (!got || typeof got !== "object" || typeof got.then === "function") return out;
    let keys = [];
    try { keys = Object.keys(got); } catch { return out; }
    for (const k of keys) { try { Object.defineProperty(out, k, { value: got[k], enumerable: true, writable: true, configurable: true }); } catch { /* unread */ } }
    return out;
  }

  /* The database's size, a figure of this object's storage and no table's; null when the storage states none. */
  #dbBytes() {
    try { const n = this.#sql.databaseSize; return typeof n === "number" && Number.isFinite(n) ? n : null; } catch { return null; }
  }

  /** R64 (N408, K621): `op=stats`. The instance's figures through the caller's sight (R65's source), with the same
   *  keys for every class of caller: never `leads` nor `observations` (nor the themes, purge's only), whatever the
   *  source answers; the observation log as `observationsNonLead`. `capacity` IS THE ONE CLASS DISTINCTION, AND IT
   *  GOVERNS `dbBytes` AND NOTHING ELSE (BOB #15, resuming REC-131): the database's size moves in whole pages on every
   *  write, a lead's included, so a member diffing it across a colleague's authoring could detect a large lead;
   *  capacity is an operator need. It is the control plane's word, set from the authenticated class after the
   *  caller's parameters are copied, so only `true` itself grants it: an absent or any other value is false, and a
   *  door that forgets to stamp loses `dbBytes` rather than leaking it. THE RESIDUE, STATED RATHER THAN HIDDEN: the
   *  admin class still receives a figure that moves on every write, so an operator can tell that something large was
   *  written, never that it was a lead, and no lead is readable to it. Writes nothing; never throws. */
  stats({ capacity = false, viewer } = {}) {
    const f = this.#figures(viewer, false);
    for (const k of [...RecordCore.#PROOF_ONLY, "dbBytes"]) delete f[k];
    if (capacity === true) f.dbBytes = this.#dbBytes();
    return f;
  }

  /** R64: purge's proof of what it removed, the private form of the same figures, WHOLE (§5: *the purge proof's own
   *  count stays whole*): the whole log as `observations`, with `leads`, the themes and `dbBytes`, and no
   *  `observationsNonLead`. No route answers it: purge reads it before and after it clears. Writes nothing; never
   *  throws. */
  proofCounts() {
    const f = this.#figures(undefined, true);
    for (const k of [...RecordCore.#WIRE_ONLY, "dbBytes"]) delete f[k];
    f.dbBytes = this.#dbBytes();
    return f;
  }

  /* ---- the audit sweep (R18–R20, R45, R59, R67–R69) ---- */

  /* The three audit seams' registrations are one shape (R59, R68, R69): a module registers once per seam, by name, with a
     function; R68's carries the key its finding answers under. They share one door, `registerAuditCheck`, so each of
     C-102.1 and C-102.2 is refused at one site whichever seam is asked (DEC-49); the seam is chosen by these private
     tokens, which no caller outside this module holds. */
  static #CHECK_SEAM = Symbol("audit check");
  static #FINDING_SEAM = Symbol("audit finding");
  static #CONTEXT_SEAM = Symbol("audit context");
  /* R68: the answer's own fields, which no finding's key may take. */
  static #AUDIT_FIELDS = Object.freeze(["ok", "checked", "clean", "withErrors", "tally", "tallyDetail", "offenders", "limit",
                                        "cursor", "page", "total"]);

  /** R59 (N51, K130, the K31 pattern): a later module registers, once at start, an audit check that `auditPass`
   *  runs over every bundle of a page beside the catalogue, called `check(image, context)`: `image` is what
   *  `checkBundle` gets (`bundleId`/`folderName`, `files`, `elidedPaths`, `sha256`, `sha512`, R19's `resolveTarget`)
   *  and `raw`, the bundle's `readImage`; `context` is R45's for the bundle (`{}` when there is none), so a check that
   *  left the catalogue for its module is not lost to the audit, and the bundle is judged once, whole. */
  registerAuditCheck(module, check, seam = RecordCore.#CHECK_SEAM, key = undefined) {
    const finding = seam === RecordCore.#FINDING_SEAM, context = seam === RecordCore.#CONTEXT_SEAM;
    const list = finding ? this.#auditFindings : context ? this.#auditContexts : this.#auditChecks;
    const what = finding ? "audit finding" : context ? "audit context" : "audit check";
    const keyHeldBy = !finding ? null : RecordCore.#AUDIT_FIELDS.includes(key) ? "auditPass"
      : (this.#auditFindings.find((r) => r.key === key) || {}).module ?? null;
    /* DEC-49 REGION is-audit-check-registration */
    if (typeof module !== "string" || !module || typeof check !== "function" || (finding && (typeof key !== "string" || !key)))
      return rowRefusal("AUDIT_CHECK_MALFORMED", `an ${what} names its module${finding ? ", a non-empty key" : ""} and is a `
        + "function; nothing was registered.");
    if (list.some((c) => c.module === module) || keyHeldBy)
      return rowRefusal("AUDIT_CHECK_DECLARED", keyHeldBy
        ? `the audit's answer key ${key} is already held by ${keyHeldBy}; nothing was registered.`
        : `${module} has already registered its ${what}; the first still runs.`,
        { module, ...(keyHeldBy ? { key, heldBy: keyHeldBy } : {}) });
    /* END DEC-49 REGION is-audit-check-registration */
    if (finding) list.push({ module, key, finding: check });
    else if (context) list.push({ module, context: check });
    else list.push({ module, check });
    return { ok: true, module, ...(finding ? { key } : {}) };
  }

  /** R68 (`build/extraction/legacy-store.md` §4.2 (1)): a later module registers once, at start, a page finding
   *  `finding(page)` under its answer key `key` (provenance's route-marker tally as `route`, membership's reserved-id
   *  finding as `membership`). `auditPass` calls each once per page, in registration order, and answers its result under
   *  its key, beside the page's own figures, which a finding never moves: a stated finding, not a conformance error. The
   *  refusals are R59's rows. */
  registerAuditFinding(module, key, finding) {
    return this.registerAuditCheck(module, finding, RecordCore.#FINDING_SEAM, key);
  }

  /** R69: a later module registers once, at start, `context(bundleId)`, answering options for that bundle's checks
   *  (inquiry's earned registry, publication's published registry); R45 merges every registration's answer, in
   *  registration order, before the caller's own. The refusals are R59's rows. */
  registerAuditContext(module, context) {
    return this.registerAuditCheck(module, context, RecordCore.#CONTEXT_SEAM);
  }

  /** R67 (§1b, K585 (2), K766): a type grammar leaves the check catalogue by registering here, once, at its module's
   *  start: `ids` are the check ids its `arm(ctx, findings)` raises. Ids covering one or more of record-grammar's
   *  `EXTENSION_ARMS` slots (its R28) claim each slot whole, and the grammar runs in each claimed slot's place; a slot
   *  may be claimed by several registrations, whose arms run there in registration order (`grammars()`). Refused,
   *  before anything is registered: a malformed entry, or ids claiming part of a slot (`GRAMMAR_MALFORMED`); a module's
   *  second registration, or an id another registration holds, unless it is an id of a slot both claim
   *  (`GRAMMAR_DECLARED`, naming the holder). An accepted registration answers `{ok: true, module, ids}`. */
  registerGrammar(module, { ids, arm } = {}) {
    const named = typeof module === "string" && module.trim() !== "";
    const listed = Array.isArray(ids) && ids.length > 0 && ids.every((id) => typeof id === "string" && C_ID.test(id));
    const partial = listed ? EXTENSION_ARMS.find((a) => a.ids.some((id) => ids.includes(id)) && !a.ids.every((id) => ids.includes(id))) : null;
    const slotIds = new Set(listed ? EXTENSION_ARMS.filter((a) => a.ids.every((id) => ids.includes(id))).flatMap((a) => a.ids) : []);
    let clash = null;
    if (named && listed) {
      if (this.#grammars.some((g) => g.module === module)) clash = { heldBy: module };
      for (let i = 0; !clash && i < ids.length; i++) {
        if (ids.indexOf(ids[i]) < i) { clash = { id: ids[i], heldBy: module }; break; }
        const g = this.#grammars.find((x) => x.ids.includes(ids[i]));
        if (g && !slotIds.has(ids[i])) clash = { id: ids[i], heldBy: g.module };
      }
    }
    /* DEC-49 REGION is-grammar-registration */
    if (!named || !listed || typeof arm !== "function" || partial)
      return rowRefusal("GRAMMAR_MALFORMED", partial
        ? `the grammar claims part of ${partial.name}, whose ids are ${partial.ids.join(", ")}; a slot is claimed whole. Nothing was registered.`
        : "a grammar names its module, a non-empty list of the check ids it raises and a function to run; nothing was registered.",
        { module: named ? module : null });
    if (clash)
      return rowRefusal("GRAMMAR_DECLARED", clash.id === undefined
        ? `${module} has already registered its grammar; the first still stands.`
        : `the check ${clash.id} is already claimed by ${clash.heldBy}; nothing was registered.`, { module, ...clash });
    /* END DEC-49 REGION is-grammar-registration */
    const slots = EXTENSION_ARMS.filter((a) => a.ids.every((id) => ids.includes(id))).map((a) => a.name);
    this.#grammars.push(Object.freeze({ module, ids: Object.freeze([...ids]), arm, slots: Object.freeze(slots) }));
    return { ok: true, module, ids: [...ids] };
  }

  /** R67 (K766): the registered grammars as record-grammar's `checkBundle` takes them (`opts.grammars`, its R39): what
   *  the audit (R18) and promotion's gate pass, so a bundle is judged by one grammar list at both. A registration that is
   *  the one claimant of the one slot it claims, or claims none, is answered as it was registered, `{module, ids, arm}`,
   *  in registration order. A slot several registrations claim, or a registration claiming several slots, is answered
   *  as one entry per slot, at its first claimant's place: `{module: <first claimant>, ids: <the slot's ids>, arm}`,
   *  whose arm runs every claimant's arm in registration order, each as `arm(ctx, findings, {slot, rest})`: `slot` is
   *  the slot's `EXTENSION_ARMS` name, and `rest()` runs the slot's later claimants at that point, once (a claimant's
   *  sub-slot); those not run when an arm returns run after it. A fresh list each call; the entries are frozen. */
  grammars() { return this.#bundleGrammars(null); }

  /* `grammars()`' list. With `wrap`, each claimant's arm is called through `wrap(registration, run)`: the audit wraps each
     claimant on its own (one that throws is one error of its own, R67); `null` calls each as it is. */
  #bundleGrammars(wrap) {
    const out = [], composed = new Map(), call = wrap || ((g, run) => run());
    const passThrough = (g) => g.slots.length === 0
      || (g.slots.length === 1 && !this.#grammars.some((x) => x !== g && x.slots.includes(g.slots[0])));
    for (const g of this.#grammars) {
      if (passThrough(g)) {
        out.push(wrap === null ? g : Object.freeze({ module: g.module, ids: g.ids,
          arm: (ctx, findings, ...more) => wrap(g, () => g.arm(ctx, findings, ...more)) }));
        continue;
      }
      for (const slot of g.slots) {
        if (composed.has(slot)) { composed.get(slot).push(g); continue; }
        const claimants = [g];
        composed.set(slot, claimants);
        const ids = EXTENSION_ARMS.find((a) => a.name === slot).ids;
        out.push(Object.freeze({ module: g.module, ids, arm: async (ctx, findings) => {
          let next = 0;
          const rest = async () => {
            while (next < claimants.length) {
              const c = claimants[next++];
              await call(c, () => c.arm(ctx, findings, { slot, rest }));
            }
          };
          await rest();
        } }));
      }
    }
    return out;
  }

  /** R18–R20, R45, R59, R67–R69: the check catalogue (record-grammar's `checkBundle`, with `grammars()`) over a bounded
   *  page of bundles in id order after `after`, run WHERE THE DATA IS (one network round trip per image was ~97% of an
   *  outside pass's cost). What a reference resolves against is the WHOLE corpus, asked of `bundles` by its key one
   *  reference at a time, and never leaves this method: filtering it would manufacture dangling-reference findings out
   *  of a viewer's position (REC-30). What is gated is what leaves: the page holds only bundles `visible(id)` admits.
   *  N117: every read here carries an SQL `LIMIT` — the cursor read takes the ids after `after` a page's worth at a time
   *  and stops once the page is full, and no read loads the corpus's ids whole. R45: a bundle's context is every R69
   *  registration's answer, merged in registration order, then the caller's own `context(id)`. Blob-backed files are
   *  declared elided: existence assertions see them, byte checks skip them. R68: every registered finding's answer is
   *  carried under its key, beside the page's figures, which it never moves. */
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
    /* R59, R67, R69, C-102.3: a registered check, grammar, context or finding that threw is one error of its own on the
       bundle, under its module's name, never a clean bundle and never a throw out of the pass. */
    /* DEC-49 REGION is-audit-check-failed */
    const failOn = (into, module, id, e) => {
      into.push({ check: module, code: "AUDIT_CHECK_FAILED", severity: "error",
                  message: `${module}'s audit check threw on ${id}: ${String((e && e.message) || e).slice(0, 200)}`,
                  translation: RECORD_CORE_CHECKS.AUDIT_CHECK_FAILED.translation });
    };
    /* END DEC-49 REGION is-audit-check-failed */
    const sha256 = async (v) => hex(await crypto.subtle.digest("SHA-256", typeof v === "string" ? te.encode(v) : v));
    const sha512 = async (b) => new Uint8Array(await crypto.subtle.digest("SHA-512", b));
    const resolveTarget = (t) => typeof t === "string" && !!this.#one(`SELECT 1 AS x FROM bundles WHERE bundle_id=? LIMIT 1`, t);
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
      const failed = [];
      const extra = {};
      for (const { module, context: of } of this.#auditContexts) {
        let got;
        try { got = of(id); } catch (e) { failOn(failed, module, id, e); continue; }
        if (got && typeof got === "object") Object.assign(extra, got);
      }
      if (typeof context === "function") Object.assign(extra, context(id) || {});
      const grammars = this.#bundleGrammars(async (g, run) => { try { await run(); } catch (e) { failOn(failed, g.module, id, e); } });
      const { findings } = await checkBundle({
        folderName: id, files, elidedPaths: elided, sha256, sha512, resolveTarget, ...extra,
      }, { grammars });
      findings.push(...failed);
      /* R59: every registered check over the same image, in registration order. */
      for (const { module, check } of this.#auditChecks) {
        let more;
        try { more = await check({ bundleId: id, folderName: id, raw: img, files, elidedPaths: elided, sha256, sha512,
                                   resolveTarget }, extra); }
        catch (e) { more = []; failOn(findings, module, id, e); }
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
    /* R68: each registered finding over the page, `{bundles: [{bundleId, type, state}], after, last}`. */
    const stated = {};
    if (this.#auditFindings.length) {
      const bundles = [];
      for (const id of page)
        bundles.push({ ...(this.#one(`SELECT bundle_id AS bundleId, object_type AS type, current_state AS state
                                         FROM bundles WHERE bundle_id=?`, id) || { bundleId: id, type: null, state: null }) });
      for (const { module, key, finding } of this.#auditFindings) {
        try { stated[key] = await finding({ bundles, after: String(after ?? ""), last }); }
        catch (e) {
          const lost = [];
          failOn(lost, module, "this page", e);
          stated[key] = { ok: false, reason: lost[0].code, code: lost[0].code, check: RECORD_CORE_CHECKS[lost[0].code].check,
                          translation: lost[0].translation, detail: lost[0].message };
        }
      }
    }
    return { ...stated, ok: true, checked: page.length, clean, withErrors, tally,
             ...(Object.keys(tallyDetail).length ? { tallyDetail } : {}),
             offenders, limit: cap, cursor: page.length === cap ? last : null, page };
  }

  /* ---- purge (R21–R24) ---- */

  /** R21, R46: a module declares the tables it owns, once, at start. An entry is a table name, keyed to a
   *  bundle by its `bundle_id` column when it has one, or `{name, keys, whole, clears}`: keyed to a bundle by the
   *  named columns (any of them matching; none, and only the whole-store form clears it), cleared by the whole-store
   *  form only where the `whole` clause holds, and, for `clears` (K775), a pointer column a bundle's purge sets to
   *  NULL where it names the bundle, on rows that stay. `exempt` names tables purge never clears.
   *  A table declared twice, or by two modules, is refused, and the refused declaration declares nothing. */
  declarePurge(module, tables = [], { exempt = [] } = {}) {
    const entries = [...tables.map((t) => (typeof t === "string" ? { name: t } : { ...t })),
                     ...exempt.map((name) => ({ name, exempt: true }))];
    const names = new Set();
    for (const e of entries) {
      const columns = (list) => list == null || (Array.isArray(list) && list.every((k) => IDENT.test(String(k))));
      if (!IDENT.test(String(e.name)) || !columns(e.keys) || !columns(e.clears))
        return { ok: false, reason: "TABLE_NAME_INVALID", table: String(e.name), module };
      if (this.#declared.has(e.name) || names.has(e.name))
        return { ok: false, reason: "TABLE_DECLARED", table: e.name, module,
                 declaredBy: this.#declared.has(e.name) ? this.#declared.get(e.name).module : module };
      names.add(e.name);
    }
    for (const e of entries) {
      const d = { module, name: e.name, exempt: !!e.exempt, keys: e.keys == null ? null : [...e.keys], whole: e.whole || null,
                  clears: e.clears == null ? [] : [...e.clears] };
      this.#declared.set(e.name, d);
      this.#order.push(d);
    }
    return { ok: true };
  }

  /** R22–R24, R46: whole-store (no `bundleId`) or one bundle's rows, from every declared non-exempt table,
   *  in declaration order and this module's `bundles` last, in one transaction; a bundle's purge also sets each
   *  declared `clears` column to NULL where it names the bundle (K775), in the same transaction. `seq`, `minted_ids` and
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
          for (const c of d.clears) this.#sql.exec(`UPDATE ${d.name} SET ${c}=NULL WHERE ${c}=?`, bundleId);
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

/* ---- the routes (R72, R73) ---- */

/* The keys of purge's proof whose difference `op=purge` answers as `removed` (R72), in today's order. */
const PURGE_REMOVED = Object.freeze(["bundles", "files", "history", "refs", "register", "tasks", "taskQueue",
  "sourceReachability", "entities", "entityAliases", "entityRelations", "resolutions", "connections", "progressionDefs",
  "connectionPairChoices", "progressionStages", "progressionDefVersions", "progressionStageVersions",
  "progressionInstances", "progressionExceptions", "connectionDirty", "proposalDispositions", "queueState",
  "projectParticipants", "projectOwnerVotes", "aiRuns", "aiRunBounds", "aiRunLog", "leads", "themes", "themePlacements",
  "suggestRefusals", "captureRequests"]);

/** R72 (`build/extraction/legacy-store.md` §4.2 (6), §4.4 (2); K757; the `membershipOps` pattern): this module's route
 *  arms, keyed by op name, each a function of no arguments answering what its service answers, its parameters read from
 *  `url`'s query, where the control plane stamps `viewer` and `capacity` (never from the body). Which credential reaches
 *  each op is `op-declarations`' and `control-plane`'s, never this map's. `sight` is membership's `viewerPredicate`
 *  (its R43), handed in by the composition root, since this module uses no membership (R19, R73). */
export function recordCoreOps(record, url, body, { sight = null } = {}) {
  const q = (k) => url.searchParams.get(k);
  return {
    allocid: () => record.allocIdOp(q("prefix"), q("year")),
    /* a courtesy lock of five minutes (R10–R12) */
    lease: () => record.acquireLease(q("id"), q("actor"), 300000),
    /* REC-176, REC-175: the two read-only censuses */
    snapkeycensus: () => record.snapKeyCensus({ limit: q("limit") }),
    digestcensus: () => record.digestCensus({ limit: q("limit") }),
    /* R64: `capacity` is the control plane's stamp from the authenticated class, true exactly when it is `1`; a viewer
       never stamped is a direct internal call, counted whole */
    stats: () => record.stats({ capacity: q("capacity") === "1", viewer: url.searchParams.has("viewer") ? q("viewer") : undefined }),
    audit: () => audit(record, { after: q("after") || "", limit: q("limit"), viewer: q("viewer"), sight }),
    /* R22–R24, D-113: one transaction, the private proof read just before and just after */
    purge: () => {
      const bundleId = q("bundleId") || null;
      const before = record.proofCounts();
      const { scope } = record.transact(() => record.purge({ bundleId }));
      const after = record.proofCounts();
      const removed = Object.fromEntries(PURGE_REMOVED.map((k) => [k, before[k] - after[k]]));
      return { ok: true, scope, before, after, removed };
    },
  };
}

/* R73: today's sweep, gated by the caller's sight. `visible(id)` asks, once per id the page names, whether the bundle
   passes `sight(viewer)`; references still resolve against the whole corpus (R19). An absent or unknown viewer, a sight
   not handed in, or one that cannot be read, sees nothing: an empty page and `total` 0 (fail closed, membership R43's
   "any other viewer"). The page's ids themselves are not answered. */
async function audit(record, { after, limit, viewer, sight }) {
  let gate = null;
  try { gate = typeof sight === "function" ? sight(viewer) : null; } catch { gate = null; }
  if (!gate || typeof gate.sql !== "string") gate = { sql: "0=1", args: [] };
  const args = Array.isArray(gate.args) ? gate.args : [];
  const one = (sql, ...a) => { for (const r of sqlOf(record).exec(sql, ...a)) return r; return null; };
  const sighted = new Map();
  const visible = (id) => {
    if (!sighted.has(id)) sighted.set(id, !!one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, id, ...args));
    return sighted.get(id);
  };
  const { page, ...answer } = await record.auditPass({ after, limit, visible });
  void page;
  const total = one(`SELECT COUNT(*) AS n FROM bundles b WHERE (${gate.sql})`, ...args);
  return { ...answer, total: total ? Number(total.n) : 0 };
}
