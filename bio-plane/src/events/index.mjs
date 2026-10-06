/* events (layer 5; T33-26, `build/requirements/events.md`): the things that happen in the world, held apart from the
   dates documents state. A DATED FACT is a document's own stated date (R1–R5); an EVENT is a happening one or more
   records attest (R6–R10), with who took part (R11–R13), its merges and splits (R14), the listeners that move with its
   time (R15, R16), its cited relations (R17–R20), `ACT-` aliases (R21), Legistar and register following (R22–R25, R38;
   `follow.mjs`), the reads (R26–R34), the connection owner (R35), the ops map (R36) and the read contract (R37). It
   never stores a sequence, an amount, an absence or the group's own acts, and never infers a cause (R39–R42).
   Reached through `eventsOf(ctx)` (K61). Members see these as the timeline (K1462). */
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, GATE_MARK, listenerRefusal, MODULE_ORDER, notAnAdmin, noSuchProject } from "../membership/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { extractionOf, noSha } from "../extraction/index.mjs";
import { contentOf, canonicalExtent, checkContentExtent } from "../content/index.mjs";
import { entitiesOf, noEntity, noSuchEntity, gradeRank } from "../entities/index.mjs";
import { readHooksOf } from "../reading-pipeline/hooks.mjs";
import { idPattern, isHypothesisId, isMachineIdentity, sha256HexSync, canonicalJson, BASIS_GRADES, TESTIMONY_GRADE }
  from "../record-grammar/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { registerOwner, LOWEST_GRADE, BOUNDS } from "../connection-grammar/index.mjs";
import { EVENTS_SCHEMA } from "./schema.mjs";
import { readDate, whenOf, sequenceOf, spanOfBound, placeAgainst, orderByWhen } from "./time.mjs";
import { followedImport, followedRegister, datesOfReading, READ_DATE_CLASSES } from "./follow.mjs";
import { neighboursOf, OWNER_KINDS } from "./owner.mjs";

export { EVENTS_SCHEMA };

/* ---- the closed vocabularies (Provides, Terms) ---- */
export const DATED_KINDS = Object.freeze(["meeting", "adopted", "effective", "signed", "entered", "issued", "published",
  "received", "hearing", "period_covered", "edited"]);
export const EVENT_KINDS = Object.freeze(["meeting", "vote", "adoption", "enactment", "signing", "award", "payment",
  "transfer", "filing", "order", "hearing", "issuance", "publication", "statement", "communication", "appointment",
  "departure", "inspection", "other"]);
/* schema.org's EventStatusType: a cancelled meeting is one event with status EventCancelled, never a missing one. */
export const STATUSES = Object.freeze(["EventScheduled", "EventCancelled", "EventPostponed", "EventRescheduled",
  "EventMovedOnline"]);
/* K1465. There is no payer or payee role: a payer or payee lives on the money fact. */
export const ROLES = Object.freeze(["actor", "organizer", "mover", "seconder", "voted", "present", "speaker", "sender",
  "recipient", "copied", "signatory", "decider", "author", "implementer", "party", "subject"]);
export const RELATION_KINDS = Object.freeze(["authorises", "answers", "amends", "reverses", "stated_cause", "within"]);

/* R27, R29: the read bound, as entities' name lookup and the query language's. */
export const LIMIT_DEFAULT = 100;
export const LIMIT_MAX = 500;
export const REASON_MAX = 2000;
const clamp = (limit) => Math.max(1, Math.min(Math.trunc(Number(limit)) || LIMIT_DEFAULT, LIMIT_MAX));

const ACT_RE = idPattern("ACT");
const EVT_RE = idPattern("EVT");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const said = (v) => typeof v === "string" && v.trim() !== "";
const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, detail, ...extra });
const stamp = (by) => (by == null ? null : String(by).slice(0, 200));
const json = (s) => { try { return JSON.parse(s); } catch { return null; } };

class ListenerFailure extends Error {
  constructor(module, cause) { super(`${module}: ${String(cause && cause.message || cause).slice(0, 200)}`); this.module = module; }
}

/* R39, R78 (record-core): the one-home checks, asked by the store gate before every write to these tables. */
const AMOUNT_KEYS = /^(amount|amounts|total|sum|value_amount|currency)$/i;
const ID_FIELDS = ["event_id", "entity_id", "end_id", "from_event", "to_event", "alias_of", "dated_fact_id"];
function oneHome(row) {
  if (!isObj(row)) return null;
  const k = Object.keys(row).find((x) => AMOUNT_KEYS.test(x));
  if (k) return { code: "AMOUNT_NOT_HERE", detail: `an event row holds no amount (${k}); an amount's one home is the money fact` };
  if (row.role === "payer" || row.role === "payee")
    return { code: "UNKNOWN_ROLE", detail: "a payer or payee lives on the money fact, never on an event" };
  const h = ID_FIELDS.find((f) => isHypothesisId(row[f]));
  if (h) return { code: "HYPOTHESIS_ID", detail: `a hypothesis (${row[h]}) is never held in an event's ${h} (K1467)` };
  return null;
}
const GATED = ["events", "event_attestations", "event_participants", "event_concerns", "event_relations"];

/* ---- the instance (K61) ---- */

const instances = new WeakMap();
let current = null;        /* R35: the instance the default registry's owner reads (the plane wires one) */
let ownerRegistered = false;

/** K61: the one Events for this object's storage. `opts` is read on the first call only: `record`, `membership`,
 *  `provenance`, `extraction`, `content`, `entities` (each its module's instance for `ctx`, reached on first use), `now`
 *  (a clock), `view` (the jurisdiction view, or a function answering it; otherwise `jurisdictions.combine` of the
 *  instance's active profiles, record-core R26) and `readHooks` (reading-pipeline's registry for this storage). */
export function eventsOf(ctx, opts = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let e = instances.get(storage);
  if (!e) {
    const record = opts.record ?? recordOf(ctx);
    const lazy = (v, f) => v ?? f;
    e = new Events(storage, { ...opts, record,
      membership: opts.membership ?? membershipOf(ctx, { record }),
      provenance: lazy(opts.provenance, () => provenanceOf(ctx)),
      extraction: lazy(opts.extraction, () => extractionOf(ctx)),
      content: lazy(opts.content, () => contentOf(ctx)),
      entities: lazy(opts.entities, () => entitiesOf(ctx)) });
    instances.set(storage, e);
    e.start(opts.readHooks ?? readHooksOf(ctx));
  }
  return e;
}

export class Events {
  #sql; #record; #membership; #now; #viewOpt; #deps;
  #onWhen = []; #onChanged = []; #sources = []; #started = false; #migrated = false;

  constructor(storage, { record, membership = null, provenance = null, extraction = null, content = null,
                         entities = null, now = null, view = null } = {}) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#deps = { provenance, extraction, content, entities };
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
    this.#viewOpt = view;
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }
  #dep(name) { const d = this.#deps[name]; return typeof d === "function" ? (this.#deps[name] = d()) : d; }
  get #prov() { return this.#dep("provenance"); }
  get #ents() { return this.#dep("entities"); }
  get #content() { return this.#dep("content"); }
  get #extraction() { return this.#dep("extraction"); }

  /* ---- boot ---- */

  /** This module's tables at every boot, idempotent, and (R40) their declarations once. */
  migrate() {
    const bare = EVENTS_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    if (!this.#migrated) {
      this.#migrated = true;
      const d = this.declareTables();
      if (d && d.ok === false && d.reason !== "TABLE_DECLARED") throw new Error(`events: record-core refused its tables: ${d.reason}`);
      for (const t of GATED) this.#record.registerStoreGate("events", t, oneHome);
    }
    return { ok: true };
  }

  /** R40 (record-core R21, R77): every table declared with its classes. The tables of facts read from captures are
   *  seen as their capture is (`source`); the `when_cache` is derived-rebuildable, its rule `#rebuildWhen`; the
   *  opt-in set is group-wide; nothing here is expunged but by its capture's purge. */
  declareTables() {
    const t = (name, cls) => ({ name, purge: "clear", expunge: "none", export: "yes", sight: "source", derive: "stored",
                                version_chain: false, ...cls });
    return this.#record.declareTable("events", [
      t("dated_facts", { keys: ["bundle_id"] }),
      t("events", { keys: [] }),
      t("event_attestations", { keys: ["bundle_id"] }),
      t("event_concerns", { keys: [] }),
      t("event_participants", { keys: [] }),
      t("event_relations", { keys: [] }),
      t("event_when_cache", { keys: [], derive: "derived-rebuildable", key: ["event_id"], rebuild: (scope) => this.#rebuildWhen(scope) }),
      t("event_choices", { keys: [], version_chain: true }),
      t("event_aliases", { keys: [], sight: "group" }),
      t("event_changes", { keys: [], version_chain: true }),
      t("event_sources", { keys: [], export: "admin-only" }),
      t("event_read_optin", { keys: [], sight: "group", export: "admin-only", version_chain: true }),
    ]);
  }

  /** R4, R35: the after-read hook (once, over the content types whose readings this module reads dates from) and the
   *  connection owner in the default registry (once per process; it reads the instance the plane made last). */
  start(readHooks) {
    current = this;
    if (!ownerRegistered) {
      const r = registerOwner({ owner: "events", kinds: OWNER_KINDS,
        neighbours: (a) => (current ? current.neighbours(a) : { refused: "OWNER_NOT_READY", why: "no events instance is wired" }) });
      ownerRegistered = r.ok === true || r.refused === "OWNER_DUPLICATE";
    }
    if (this.#started) return;
    this.#started = true;
    if (readHooks && typeof readHooks.onRead === "function")
      readHooks.onRead("events", (a) => this.afterRead(a), { captureClasses: [...READ_DATE_CLASSES] });
  }

  /* ---- the view (R23, R42) ---- */

  view() {
    if (this.#viewOpt) return typeof this.#viewOpt === "function" ? this.#viewOpt() : this.#viewOpt;
    const ids = typeof this.#record.getSetting === "function" ? this.#record.getSetting("jurisdiction_profiles") : null;
    const c = combine(Array.isArray(ids) ? ids : []);
    return c && c.ok ? c.view : {};
  }
  zone() { const z = this.view().time_zone; return z && typeof z.value === "string" ? z.value : null; }

  /* ---- sight (R40; membership R43) ---- */

  /* Whether `viewer` may see what a row keyed to `bundleId` holds: a machine or the founder sees all, an absent viewer
     nothing (fail closed), a member through membership's predicate; a null bundle is group-wide. */
  #sees(bundleId, viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "DENY") return false;
    if (g.scope === "member" || bundleId == null) return true;
    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id = ? AND (${g.sql})`, bundleId, ...g.args);
  }
  #seer(viewer) {
    const memo = new Map();
    return (bundleId) => {
      const k = bundleId ?? "\u0000";
      if (!memo.has(k)) memo.set(k, this.#sees(bundleId, viewer));
      return memo.get(k);
    };
  }

  /* The capture's home bundle when the record holds it and `by` may see it, else null (R1: answered alike). */
  #heldCapture(captureSha, by) {
    const sha = typeof captureSha === "string" ? captureSha.trim().toLowerCase() : "";
    if (!/^[0-9a-f]{64}$/.test(sha)) return null;
    const p = this.#prov;
    const home = p && typeof p.homeOf === "function" ? p.homeOf(sha) : null;
    if (!home) return null;
    if (by != null && !this.#sees(home.bundleId, by)) return null;
    return { sha, bundleId: home.bundleId };
  }
  #captureGrade(sha) {
    const p = this.#prov;
    try { const g = p && typeof p.captureGrade === "function" ? p.captureGrade(sha) : null; return g && g.grade ? g.grade : null; }
    catch { return null; }
  }

  /* ===================================================================== *
   * DATED FACTS (R1–R5).
   * ===================================================================== */

  /** R1, R2: a document's own date, cited at its extent. */
  recordDatedFact({ captureSha, extent, kind, value, method, by = null } = {}) {
    if (!said(captureSha)) return noSha("a dated fact is a captured document's own statement, named by its capture sha256");
    const held = this.#heldCapture(captureSha, by);
    if (!held) return refuse("CAPTURE_NOT_HELD", "the record holds no such capture you can see");
    if (!isObj(extent)) return refuse("NO_EXTENT", "a dated fact names the extent of the capture that states it");
    const bad = this.#extentRefusal(held.sha, extent);
    if (bad) return bad;
    if (!DATED_KINDS.includes(kind)) return refuse("UNKNOWN_DATED_KIND", `a dated fact is one of ${DATED_KINDS.join(", ")}`, { kinds: [...DATED_KINDS] });
    const d = readDate(value, this.zone());
    if (d.bad) return refuse("BAD_DATE", d.bad);
    if (!said(method)) return refuse("NO_METHOD", "a dated fact says how its date was read (a member's reading, a reader, OCR, office metadata)");
    return this.#record.transact(() => this.#holdFact({ sha: held.sha, bundleId: held.bundleId, extent, kind, date: d,
      method: method.trim().slice(0, 400), by }));
  }

  /* R1, R2: the extent within the capture, by content's own check over the capture's context. */
  #extentRefusal(sha, extent) {
    let bad;
    try {
      const c = this.#content;
      bad = checkContentExtent(extent, c && typeof c.contentContextFor === "function" ? c.contentContextFor(sha) : {});
    } catch (e) { bad = { code: "CONTENT_EXTENT_UNREADABLE", detail: String(e && e.message || e) }; }
    return bad ? refuse("EXTENT_NOT_IN_CAPTURE", "the extent names no part of that capture", { extent_refusal: bad }) : null;
  }

  /* R1, R2: one dated fact, inside the caller's transaction; its grade is the capture's own, never above it. */
  #holdFact({ sha, bundleId, extent, kind, date, method, by, sourceRow = null, upperBound = false }) {
    const ext = canonicalExtent(extent);
    const id = sha256HexSync(canonicalJson([sha, ext, sourceRow, kind, date.value, date.precision, date.zone])).slice(0, 32);
    const prior = this.#one(`SELECT * FROM dated_facts WHERE dated_fact_id=?`, id);
    if (prior) return { ok: true, already: true, dated_fact: this.#factView(prior) };
    const row = { dated_fact_id: id, capture_sha: sha, bundle_id: bundleId, extent: ext, source_row: sourceRow, kind,
                  value: date.value, precision: date.precision, zone: date.zone, method, grade: this.#captureGrade(sha),
                  upper_bound: upperBound ? 1 : 0, by_actor: stamp(by), at: this.#now() };
    this.#insert("dated_facts", row);
    return { ok: true, dated_fact: this.#factView(row) };
  }

  #insert(table, row) {
    const gate = GATED.includes(table) ? this.#record.storeGate("events", table, row, "insert") : null;
    if (gate) throw Object.assign(new Error("gate"), { refusal: gate });
    const cols = Object.keys(row);
    this.#sql.exec(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`, ...cols.map((c) => row[c]));
    return Number(this.#one(`SELECT last_insert_rowid() AS id`).id);
  }

  #factView(r) {
    return { dated_fact_id: r.dated_fact_id, capture_sha: r.capture_sha, extent: json(r.extent), source_row: r.source_row ?? null,
             kind: r.kind, value: r.value, precision: r.precision, zone: r.zone, method: r.method, grade: r.grade,
             ...(r.upper_bound ? { upper_bound: true, label: "on or before" } : {}), by: r.by_actor, at: r.at };
  }

  /** R4 (K1505 (9)): the capture classes whose readings' stated dates are held after read, an administrator's act. */
  setReadOptIn({ captureClasses, by = null } = {}) {
    const m = this.#membership;
    const member = typeof by === "string" ? by.replace(/^member:/, "") : null;
    const admin = by === "admin" || (member && m && typeof m.isAdministrator === "function" && m.isAdministrator(member));
    if (!admin || isMachineIdentity(by)) return notAnAdmin(by, "choosing which readings' dates are held");
    if (!Array.isArray(captureClasses) || !captureClasses.every(said))
      return refuse("NO_CLASSES", "the opt-in set is a list of capture classes (content-type keys), empty for none");
    const classes = [...new Set(captureClasses.map((c) => c.trim()))].sort();
    const at = this.#now();
    this.#sql.exec(`INSERT INTO event_read_optin (classes, by_actor, at) VALUES (?,?,?)`, JSON.stringify(classes), stamp(by), at);
    return { ok: true, captureClasses: classes, by: stamp(by), at,
             unread: classes.filter((c) => !READ_DATE_CLASSES.includes(c)) };
  }
  readOptIn() {
    const r = this.#one(`SELECT classes, by_actor, at FROM event_read_optin ORDER BY seq DESC LIMIT 1`);
    return { ok: true, captureClasses: r ? json(r.classes) || [] : [], by: r ? r.by_actor : null, at: r ? r.at : null,
             history: this.#rows(`SELECT classes, by_actor, at FROM event_read_optin ORDER BY seq`)
               .map((x) => ({ captureClasses: json(x.classes) || [], by: x.by_actor, at: x.at })) };
  }

  /** R4: the hook reading-pipeline calls after a reading commits. For a class in the opt-in set it holds each date the
   *  reader states, with the reader's method, as the machine's dated facts; any other class gets nothing (R3). */
  afterRead({ captureSha, captureClass, reading } = {}) {
    const set = this.readOptIn().captureClasses;
    if (!set.includes(captureClass)) return { ok: true, held: 0, why: "this capture class is not in the opt-in set" };
    const held = this.#heldCapture(captureSha, null);
    if (!held) return { ok: true, held: 0, why: "the record holds no such capture" };
    const out = [];
    this.#record.transact(() => {
      for (const d of datesOfReading(reading, this.zone())) {
        const r = this.#holdFact({ sha: held.sha, bundleId: held.bundleId, extent: { kind: "document" }, kind: d.kind,
          date: d.date, method: d.method, by: "class:daemon" });
        out.push(r.dated_fact);
      }
      return { ok: true };
    });
    return { ok: true, held: out.length, dated_facts: out };
  }

  /** R5: edit acts from office metadata, on request: the created and modified values a captured office file states
   *  about itself, held as dated facts `issued` and `edited`, the method naming the field (and the author as written). */
  recordEditActs({ captureSha, by = null } = {}) {
    if (!said(captureSha)) return noSha("edit acts are read from a captured office document, named by its capture sha256");
    const held = this.#heldCapture(captureSha, by);
    if (!held) return refuse("CAPTURE_NOT_HELD", "the record holds no such capture you can see");
    const c = this.#content;
    const m = c && typeof c.officeMetadataOf === "function" ? c.officeMetadataOf(held.sha) : null;
    if (!m || !m.metadata) return refuse("NO_OFFICE_METADATA", m && m.why ? m.why : "the capture's reading holds no office metadata");
    const md = m.metadata, zone = this.zone(), out = [], skipped = [];
    return this.#record.transact(() => {
      for (const [field, kind, who] of [["created", "issued", md.author], ["modified", "edited", md.lastModifiedBy]]) {
        const v = md[field];
        if (v == null || v === "") continue;
        const d = readDate(v, zone);
        if (d.bad) { skipped.push({ field, value: v, why: d.bad }); continue; }
        const method = `office metadata: the file's ${field} value`
          + (said(who) ? `; ${field === "created" ? "author" : "last modified by"} as the file writes it: ${String(who).slice(0, 200)}` : "")
          + "; what the file states about itself, never a finding";
        out.push(this.#holdFact({ sha: held.sha, bundleId: held.bundleId,
          extent: { kind: "envelope", item: "core-property", name: field }, kind, date: d, method, by }).dated_fact);
      }
      return { ok: true, capture_sha: held.sha, dated_facts: out, skipped };
    });
  }

  /** R27: a capture's dated facts in extent order, answered only to a viewer who may see the capture (R40). */
  datedFactsFor({ captureSha, viewer = null } = {}) {
    if (!said(captureSha)) return noSha("dated facts are read for a captured document, by its capture sha256");
    const rows = this.#rows(`SELECT * FROM dated_facts WHERE capture_sha=? ORDER BY extent, source_row, kind, value`, captureSha.trim().toLowerCase());
    const sees = this.#seer(viewer);
    const seen = rows.filter((r) => sees(r.bundle_id));
    return { ok: true, capture_sha: captureSha, count: seen.length, dated_facts: seen.map((r) => this.#factView(r)) };
  }

  /* ===================================================================== *
   * EVENTS, ATTESTATIONS AND THE DERIVED when (R6–R10).
   * ===================================================================== */

  /* An event id resolved through a merge alias to the event it lives on, or null. */
  #resolve(eventId) {
    if (!said(eventId)) return null;
    let id = eventId.trim();
    for (let i = 0; i < 64; i++) {
      const r = this.#one(`SELECT event_id, alias_of FROM events WHERE event_id=?`, id);
      if (!r) return null;
      if (!r.alias_of) return r.event_id;
      id = r.alias_of;
    }
    return null;
  }
  has(eventId) { return this.#resolve(eventId) !== null; }

  /* R7: an attestation as given, read into its row, or a refusal. `by` is the stamp whose sight a capture is asked in. */
  #attestationFrom(a, by) {
    if (!isObj(a)) return refuse("NO_ATTESTATION", "an attestation is {datedFactId}, {captureSha, extent} or {testimony}");
    if (a.datedFactId !== undefined) {
      const f = said(a.datedFactId) ? this.#one(`SELECT * FROM dated_facts WHERE dated_fact_id=?`, a.datedFactId.trim()) : null;
      if (!f || !this.#sees(f.bundle_id, by)) return refuse("NO_SUCH_DATED_FACT", "no dated fact with that id is held where you can see it");
      return { ok: true, row: { form: "dated_fact", dated_fact_id: f.dated_fact_id, capture_sha: f.capture_sha, extent: f.extent,
        source_row: f.source_row, statement: null, value: f.value, precision: f.precision, zone: f.zone,
        bundle_id: f.bundle_id, grade: f.grade, upper_bound: f.upper_bound } };
    }
    if (a.captureSha !== undefined) {
      if (!said(a.captureSha)) return noSha("an attestation from a captured document names its capture sha256");
      const held = this.#heldCapture(a.captureSha, by);
      if (!held) return refuse("CAPTURE_NOT_HELD", "the record holds no such capture you can see");
      if (!isObj(a.extent)) return refuse("NO_EXTENT", "a capture attestation names the extent that attests the event");
      const bad = this.#extentRefusal(held.sha, a.extent);
      if (bad) return bad;
      return { ok: true, row: { form: "extent", dated_fact_id: null, capture_sha: held.sha, extent: canonicalExtent(a.extent),
        source_row: Number.isInteger(a.sourceRow) ? a.sourceRow : null, statement: null, value: null, precision: null, zone: null,
        bundle_id: held.bundleId, grade: this.#captureGrade(held.sha) } };
    }
    if (a.testimony !== undefined) {
      if (!said(a.testimony)) return refuse("NO_STATEMENT", "testimony carries the member's own account of the event");
      if (!said(by) || isMachineIdentity(by)) return refuse("MEMBER_ACT_ONLY", "testimony is a member's own account, never the machine's");
      let date = null;
      if (a.value !== undefined && a.value !== null) {
        const d = readDate(a.value, this.zone());
        if (d.bad) return refuse("BAD_DATE", d.bad);
        date = d;
      }
      let bundleId = null;
      if (a.project !== undefined && a.project !== null) {
        const p = said(a.project) ? this.#one(`SELECT bundle_id FROM bundles WHERE bundle_id=? AND object_type='project'`, a.project.trim()) : null;
        if (!p || !this.#sees(p.bundle_id, by)) return noSuchProject(a.project);
        bundleId = p.bundle_id;
      }
      return { ok: true, row: { form: "testimony", dated_fact_id: null, capture_sha: null, extent: null, source_row: null,
        statement: a.testimony.trim().slice(0, 4000), value: date ? date.value : null, precision: date ? date.precision : null,
        zone: date ? date.zone : null, bundle_id: bundleId, grade: TESTIMONY_GRADE } };
    }
    return refuse("NO_ATTESTATION", "an attestation is {datedFactId}, {captureSha, extent} or {testimony}");
  }

  #addAttestation(eventId, row, by, serves = "event") {
    const { upper_bound, ...rest } = row;
    return this.#insert("event_attestations", { ...rest, event_id: eventId, serves, by_actor: stamp(by), at: this.#now() });
  }

  /* R6: a concerns end, an entity or another event; a hypothesis id is never held (R39). */
  #concernRefusal(end) {
    if (!said(end)) return noEntity("an event concerns a registered subject or another event, named by its id");
    if (isHypothesisId(end)) return refuse("HYPOTHESIS_ID", "a hypothesis is never what an event concerns (K1467)");
    if (EVT_RE.test(end)) return this.has(end) ? null : refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: end });
    const e = this.#ents;
    return e && e.has(end) ? null : noSuchEntity(end, { end: "concerns" });
  }

  /* R11: a participant's refusals after its event: the entity, the role, the attestation, the vote. */
  #participantRefusal({ entityId, role, attestation, voteValue }, { attestationGiven = true } = {}) {
    if (!said(entityId)) return noEntity("a participant is a registered subject, named by its id");
    if (isHypothesisId(entityId)) return refuse("HYPOTHESIS_ID", "a hypothesis is never a participant (K1467)");
    const e = this.#ents;
    if (!e || !e.has(entityId)) return noSuchEntity(entityId);
    if (!ROLES.includes(role))
      return refuse("UNKNOWN_ROLE", `a role is one of ${ROLES.join(", ")}; a payer or payee lives on the money fact, never on an event`,
                    { roles: [...ROLES] });
    if (!attestationGiven || attestation === undefined || attestation === null)
      return refuse("NO_ATTESTATION", "a participant is what a document states or a member testifies, never filled from who held an office");
    if (role === "voted") return this.#voteRefusal(voteValue);
    return null;
  }

  /* R11: the vote values the profile names; with none held, the value is kept as written and marked unchecked. */
  #voteValues() {
    const v = this.view();
    const list = Array.isArray(v.vote_values) ? v.vote_values
      : v.vocabulary && Array.isArray(v.vocabulary.vote_values) ? v.vocabulary.vote_values : null;
    return list ? list.map((x) => (isObj(x) ? x.value : x)).filter(said) : null;
  }
  #voteRefusal(voteValue) {
    if (!said(voteValue)) return refuse("NO_VOTE_VALUE", "a vote is held with the value the record states");
    const values = this.#voteValues();
    if (values && !values.includes(voteValue.trim()))
      return refuse("UNKNOWN_VOTE_VALUE", `a vote value is one of the profile's: ${values.join(", ")}`, { values });
    return null;
  }

  /** R6: an event held with at least one attestation, its concerns and its participants, in one transaction. */
  createEvent({ kind, status = "EventScheduled", where = null, concerns = [], attestations, participants = [], by = null } = {}) {
    if (!EVENT_KINDS.includes(kind)) return refuse("UNKNOWN_EVENT_KIND", `an event is one of ${EVENT_KINDS.join(", ")}`, { kinds: [...EVENT_KINDS] });
    if (!STATUSES.includes(status)) return refuse("UNKNOWN_STATUS", `a status is one of ${STATUSES.join(", ")}`, { statuses: [...STATUSES] });
    if (!Array.isArray(attestations) || !attestations.length)
      return refuse("NO_ATTESTATION", "an event is held only with at least one attestation");
    const rows = [];
    for (const a of attestations) { const r = this.#attestationFrom(a, by); if (!r.ok) return r; rows.push(r.row); }
    const ends = Array.isArray(concerns) ? concerns : [];
    for (const end of ends) { const r = this.#concernRefusal(end); if (r) return r; }
    const parts = Array.isArray(participants) ? participants : [];
    for (const p of parts) {
      const r = this.#participantRefusal(isObj(p) ? p : {});
      if (r) return r;
      if (!(Number.isInteger(p.attestation) && p.attestation >= 0 && p.attestation < rows.length))
        return refuse("NO_ATTESTATION", "a participant names the attestation that states it, by its index in attestations");
    }
    return this.#tx(() => {
      const at = this.#now();
      const id = this.#record.allocId("EVT", at.slice(0, 4));
      if (!id || !id.id) return id;
      const eventId = id.id;
      this.#insert("events", { event_id: eventId, kind, status, where_text: said(where) ? where.trim().slice(0, 400) : null,
                               by_actor: stamp(by), at, alias_of: null });
      const attIds = rows.map((r) => this.#addAttestation(eventId, r, by));
      for (const end of [...new Set(ends)])
        this.#insert("event_concerns", { event_id: eventId, end_id: end, by_actor: stamp(by), at });
      for (const p of parts)
        this.#insert("event_participants", { event_id: eventId, entity_id: p.entityId, role: p.role,
          vote_value: p.role === "voted" ? p.voteValue.trim() : null, attestation_id: attIds[p.attestation], by_actor: stamp(by), at });
      this.#setWhen(eventId);
      return { ok: true, event_id: eventId, attestation_ids: attIds };
    });
  }

  /* The transaction every act runs in: a store-gate refusal or a listener that throws fails the whole write. */
  #tx(fn) {
    return this.#record.transact(() => {
      try { return fn(); }
      catch (e) {
        if (e && e.refusal) return e.refusal;
        if (e instanceof ListenerFailure)
          return refuse("LISTENER_FAILED", `the write was undone because ${e.module}'s listener failed: ${e.message}`, { module: e.module });
        throw e;
      }
    });
  }

  /** R7: one more attestation of a held event. */
  attest({ eventId, attestation, by = null } = {}) {
    const id = this.#resolve(eventId);
    if (!id) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: eventId ?? null });
    const r = this.#attestationFrom(attestation, by);
    if (!r.ok) return r;
    const same = this.#sameAttestation(id, r.row);
    if (same) return { ok: true, already: true, event_id: id, attestation_id: same };
    return this.#tx(() => {
      const aid = this.#addAttestation(id, r.row, by);
      this.#setWhen(id);
      return { ok: true, event_id: id, attestation_id: aid };
    });
  }
  #sameAttestation(eventId, row, serves = "event") {
    const r = this.#one(`SELECT attestation_id FROM event_attestations WHERE event_id=? AND serves=? AND form=?
                          AND dated_fact_id IS ? AND capture_sha IS ? AND extent IS ? AND source_row IS ? AND statement IS ?
                          AND value IS ? AND bundle_id IS ?`,
      eventId, serves, row.form, row.dated_fact_id, row.capture_sha, row.extent, row.source_row, row.statement, row.value, row.bundle_id);
    return r ? Number(r.attestation_id) : null;
  }

  /** R8: a member chooses which dated attestation governs; each choice is kept with who, when and why. */
  chooseGoverning({ eventId, attestationId, reason = null, by = null } = {}) {
    const id = this.#resolve(eventId);
    if (!id) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: eventId ?? null });
    const a = this.#one(`SELECT * FROM event_attestations WHERE attestation_id=? AND event_id=? AND serves='event'`, Number(attestationId), id);
    if (!a) return refuse("NO_SUCH_ATTESTATION", "that event holds no such attestation");
    if (a.value == null) return refuse("ATTESTATION_UNDATED", "an attestation with no date of its own cannot govern when the event happened");
    return this.#tx(() => {
      this.#sql.exec(`INSERT INTO event_choices (event_id, attestation_id, reason, by_actor, at) VALUES (?,?,?,?,?)`,
                     id, a.attestation_id, said(reason) ? reason.trim().slice(0, REASON_MAX) : null, stamp(by), this.#now());
      const w = this.#setWhen(id);
      return { ok: true, event_id: id, governing: Number(a.attestation_id), when: w.after };
    });
  }

  /* R8: the governing attestation of an event: the latest choice still on it, else the first dated attestation. */
  #governing(eventId) {
    const chosen = this.#one(`SELECT a.* FROM event_choices c JOIN event_attestations a ON a.attestation_id = c.attestation_id
                               WHERE c.event_id=? AND a.event_id=? AND a.serves='event' AND a.value IS NOT NULL
                               ORDER BY c.choice_id DESC LIMIT 1`, eventId, eventId);
    return chosen || this.#one(`SELECT * FROM event_attestations WHERE event_id=? AND serves='event' AND value IS NOT NULL
                                 ORDER BY attestation_id LIMIT 1`, eventId);
  }
  #upperBound(a) {
    if (!a || !a.dated_fact_id) return 0;
    const f = this.#one(`SELECT upper_bound FROM dated_facts WHERE dated_fact_id=?`, a.dated_fact_id);
    return f ? Number(f.upper_bound) : 0;
  }
  /* R9: the when_cache row an event's governing attestation gives (all nulls when no attestation is dated). */
  #whenRow(eventId) {
    const g = this.#governing(eventId);
    const w = g ? whenOf({ value: g.value, precision: g.precision, zone: g.zone, upper_bound: this.#upperBound(g) }) : null;
    return { event_id: eventId, start: w ? w.start : null, end: w ? w.end : null, precision: w ? w.precision : null,
             zone: w ? w.zone : null, value: w ? w.value : null, attestation_id: g ? Number(g.attestation_id) : null };
  }
  /* R77 (record-core): the rule the derived table is rebuilt by. */
  #rebuildWhen(scope) {
    const ids = scope && scope.event_id ? [scope.event_id]
      : this.#rows(`SELECT event_id FROM events WHERE alias_of IS NULL ORDER BY event_id`).map((r) => r.event_id);
    return ids.filter((id) => this.#one(`SELECT 1 AS x FROM events WHERE event_id=? AND alias_of IS NULL`, id)).map((id) => this.#whenRow(id));
  }
  static #whenOfRow(r) {
    return r && r.value != null ? { start: r.start, end: r.end, precision: r.precision, zone: r.zone, value: r.value } : null;
  }

  /* R9, R15, R16: rebuild an event's when_cache in the caller's transaction; when it moved, the onWhenChanged
     listeners run there (one that throws fails the write) and onEventChanged is told after commit. */
  #setWhen(eventId) {
    const before = this.#one(`SELECT * FROM event_when_cache WHERE event_id=?`, eventId);
    const after = this.#whenRow(eventId);
    const same = before && ["start", "end", "precision", "zone", "value", "attestation_id"]
      .every((k) => String(before[k] ?? "") === String(after[k] ?? ""));
    if (same) return { moved: false, after: Events.#whenOfRow(after) };
    this.#sql.exec(`INSERT OR REPLACE INTO event_when_cache (event_id, start, end, precision, zone, value, attestation_id)
                    VALUES (?,?,?,?,?,?,?)`, eventId, after.start, after.end, after.precision, after.zone, after.value, after.attestation_id);
    const b = Events.#whenOfRow(before), a = Events.#whenOfRow(after);
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      for (const l of this.#onWhen) {
        try { l.fn({ eventId, before: b, after: a }); } catch (e) { throw new ListenerFailure(l.module, e); }
      }
      if (before) this.#tell({ eventId, change: "when_moved", before: b, after: a });
    }
    return { moved: true, after: a };
  }
  #tell(change) {
    const fns = [...this.#onChanged];
    if (!fns.length) return;
    this.#record.afterCommit(() => { for (const l of fns) { try { l.fn({ ...change }); } catch { /* R16: after commit, the write stands */ } } });
  }

  /* R10: an event's when as read: the held cache, failing closed when it differs from its rebuild. */
  #whenRead(eventId) {
    const held = this.#one(`SELECT * FROM event_when_cache WHERE event_id=?`, eventId);
    const stale = (() => { try { return this.#record.readDerived("events", "event_when_cache", eventId).stale; } catch { return true; } })();
    const rebuilt = this.#whenRow(eventId);
    const same = held && ["start", "end", "precision", "zone", "value", "attestation_id"]
      .every((k) => String(held[k] ?? "") === String(rebuilt[k] ?? ""));
    if (!held || stale || !same) return { when: "undetermined", why: "cache stale", governing: null };
    return { when: Events.#whenOfRow(held), governing: held.attestation_id };
  }

  /* ===================================================================== *
   * PARTICIPANTS (R11–R13).
   * ===================================================================== */

  /** R11: one participant, on an attestation the event holds (its id) or one given here. */
  addParticipant({ eventId, entityId, role, attestation, voteValue = null, by = null } = {}) {
    const id = this.#resolve(eventId);
    if (!id) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: eventId ?? null });
    const r = this.#participantRefusal({ entityId, role, attestation, voteValue });
    if (r) return r;
    let attRow = null, attId = null;
    if (Number.isInteger(attestation)) {
      const a = this.#one(`SELECT attestation_id FROM event_attestations WHERE attestation_id=? AND event_id=? AND serves='event'`, attestation, id);
      if (!a) return refuse("NO_SUCH_ATTESTATION", "that event holds no such attestation");
      attId = Number(a.attestation_id);
    } else {
      const x = this.#attestationFrom(attestation, by);
      if (!x.ok) return x;
      attRow = x.row;
      attId = this.#sameAttestation(id, attRow);
    }
    if (attId !== null) {
      const dup = this.#one(`SELECT participant_id FROM event_participants WHERE event_id=? AND entity_id=? AND role=? AND attestation_id=?
                              AND superseded_by IS NULL`, id, entityId, role, attId);
      if (dup) return { ok: true, already: true, event_id: id, participant_id: Number(dup.participant_id) };
    }
    return this.#tx(() => {
      const aid = attId ?? this.#addAttestation(id, attRow, by);
      if (attId === null) this.#setWhen(id);
      const pid = this.#insert("event_participants", { event_id: id, entity_id: entityId, role,
        vote_value: role === "voted" ? voteValue.trim() : null, attestation_id: aid, by_actor: stamp(by), at: this.#now() });
      return { ok: true, event_id: id, participant_id: pid, attestation_id: aid };
    });
  }

  /** R13: a participant re-resolved to another entity; the corrected row stays, superseded with who, when and why. */
  correctParticipant({ participantId, entityId, reason, by = null } = {}) {
    if (!said(reason)) return refuse("NO_REASON", "a correction says why the participant was wrong; it is kept beside the row");
    const p = this.#one(`SELECT * FROM event_participants WHERE participant_id=?`, Number(participantId));
    if (!p) return refuse("NO_SUCH_PARTICIPANT", "no participant with that id is held");
    if (p.superseded_by != null) return refuse("PARTICIPANT_SUPERSEDED", "that row was already corrected; correct the row that replaced it",
                                               { superseded_by: Number(p.superseded_by) });
    if (!said(entityId)) return noEntity("a correction names the subject the participant is, by its id");
    if (isHypothesisId(entityId)) return refuse("HYPOTHESIS_ID", "a hypothesis is never a participant (K1467)");
    if (!this.#ents.has(entityId)) return noSuchEntity(entityId);
    return this.#tx(() => {
      const at = this.#now();
      const pid = this.#insert("event_participants", { event_id: p.event_id, entity_id: entityId, role: p.role, vote_value: p.vote_value,
        attestation_id: p.attestation_id, by_actor: stamp(by), at });
      this.#sql.exec(`UPDATE event_participants SET superseded_by=?, superseded_actor=?, superseded_at=?, superseded_why=? WHERE participant_id=?`,
                     pid, stamp(by), at, reason.trim().slice(0, REASON_MAX), p.participant_id);
      this.#tell({ eventId: p.event_id, change: "participant_re_resolved", participantId: pid, was: p.entity_id, now: entityId });
      return { ok: true, event_id: p.event_id, participant_id: pid, superseded: Number(p.participant_id) };
    });
  }

  /* ===================================================================== *
   * MERGE AND SPLIT (R14): a member's acts only, recorded, rebuilding every when they touch.
   * ===================================================================== */

  #memberAct(by) {
    return !said(by) || isMachineIdentity(by)
      ? refuse("MEMBER_ACT_ONLY", "only a member merges or splits events; the machine's rows are corrected by a member's act") : null;
  }

  /** R14: `absorb` joins `keep`; `absorb` stays as an alias resolving to `keep`. */
  mergeEvents({ keep, absorb, reason, by = null } = {}) {
    const m = this.#memberAct(by); if (m) return m;
    if (!said(reason)) return refuse("NO_REASON", "a merge says why the two records are one happening");
    const k = this.#resolve(keep), a = this.#resolve(absorb);
    if (!k) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: keep ?? null, end: "keep" });
    if (!a) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: absorb ?? null, end: "absorb" });
    if (k === a) return refuse("SAME_EVENT", "an event is not merged into itself");
    return this.#tx(() => {
      const at = this.#now(), why = reason.trim().slice(0, REASON_MAX);
      const g = this.#governing(k);
      if (g) this.#sql.exec(`INSERT INTO event_choices (event_id, attestation_id, reason, by_actor, at) VALUES (?,?,?,?,?)`,
                            k, g.attestation_id, "kept as governing when another event was merged into this one", stamp(by), at);
      this.#sql.exec(`UPDATE event_attestations SET event_id=? WHERE event_id=?`, k, a);
      this.#sql.exec(`UPDATE event_participants SET event_id=? WHERE event_id=?`, k, a);
      this.#sql.exec(`UPDATE event_choices SET event_id=? WHERE event_id=?`, k, a);
      this.#sql.exec(`INSERT OR IGNORE INTO event_concerns (event_id, end_id, by_actor, at) SELECT ?, end_id, by_actor, at FROM event_concerns WHERE event_id=?`, k, a);
      this.#sql.exec(`DELETE FROM event_concerns WHERE event_id=?`, a);
      this.#sql.exec(`UPDATE event_concerns SET end_id=? WHERE end_id=?`, k, a);
      this.#sql.exec(`UPDATE event_relations SET from_event=? WHERE from_event=?`, k, a);
      this.#sql.exec(`UPDATE event_relations SET to_event=? WHERE to_event=?`, k, a);
      this.#sql.exec(`UPDATE event_relations SET withdrawn_actor=?, withdrawn_at=?, withdrawn_why=? WHERE from_event=? AND to_event=? AND withdrawn_at IS NULL`,
                     stamp(by), at, "its two ends were merged into one event", k, k);
      this.#sql.exec(`UPDATE event_aliases SET event_id=? WHERE event_id=?`, k, a);
      this.#sql.exec(`UPDATE event_sources SET target_id=? WHERE target='event' AND target_id=?`, k, a);
      this.#sql.exec(`UPDATE events SET alias_of=? WHERE event_id=?`, k, a);
      this.#sql.exec(`DELETE FROM event_when_cache WHERE event_id=?`, a);
      for (const [e, o, kind] of [[k, a, "merged_in"], [a, k, "merged_into"]])
        this.#sql.exec(`INSERT INTO event_changes (event_id, kind, other, reason, by_actor, at) VALUES (?,?,?,?,?,?)`, e, kind, o, why, stamp(by), at);
      this.#setWhen(k);
      for (const r of this.#rows(`SELECT DISTINCT from_event FROM event_relations WHERE to_event=? AND kind='within'`, k)) this.#setWhen(r.from_event);
      this.#tell({ eventId: k, change: "merged", absorbed: a });
      return { ok: true, keep: k, absorbed: a, alias: { [a]: k } };
    });
  }

  /** R14: the named attestations (and the participants resting on them) move to a new event of the same kind. */
  splitEvent({ eventId, attestations, reason, by = null } = {}) {
    const m = this.#memberAct(by); if (m) return m;
    if (!said(reason)) return refuse("NO_REASON", "a split says why one record held two happenings");
    const id = this.#resolve(eventId);
    if (!id) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: eventId ?? null });
    const ids = Array.isArray(attestations) ? [...new Set(attestations.map(Number))] : [];
    if (!ids.length) return refuse("NO_ATTESTATION", "a split names the attestations that move to the new event");
    for (const x of ids)
      if (!this.#one(`SELECT 1 AS y FROM event_attestations WHERE attestation_id=? AND event_id=? AND serves='event'`, x, id))
        return refuse("NO_SUCH_ATTESTATION", "that event holds no such attestation", { attestation_id: x });
    const left = Number(this.#one(`SELECT COUNT(*) AS n FROM event_attestations WHERE event_id=? AND serves='event'`, id).n);
    if (left <= ids.length) return refuse("SPLIT_EMPTIES", "a split leaves at least one attestation on the event it splits");
    const ev = this.#one(`SELECT * FROM events WHERE event_id=?`, id);
    return this.#tx(() => {
      const at = this.#now(), why = reason.trim().slice(0, REASON_MAX);
      const nid = this.#record.allocId("EVT", at.slice(0, 4));
      if (!nid || !nid.id) return nid;
      this.#insert("events", { event_id: nid.id, kind: ev.kind, status: ev.status, where_text: ev.where_text, by_actor: stamp(by), at, alias_of: null });
      const list = ids.join(",");
      this.#sql.exec(`UPDATE event_attestations SET event_id=? WHERE attestation_id IN (${list})`, nid.id);
      this.#sql.exec(`UPDATE event_participants SET event_id=? WHERE attestation_id IN (${list})`, nid.id);
      this.#sql.exec(`UPDATE event_choices SET event_id=? WHERE attestation_id IN (${list})`, nid.id);
      for (const [e, o, kind] of [[id, nid.id, "split_out"], [nid.id, id, "split_from"]])
        this.#sql.exec(`INSERT INTO event_changes (event_id, kind, other, detail, reason, by_actor, at) VALUES (?,?,?,?,?,?,?)`,
                       e, kind, o, JSON.stringify({ attestations: ids }), why, stamp(by), at);
      this.#setWhen(id);
      this.#setWhen(nid.id);
      this.#tell({ eventId: id, change: "split", into: nid.id });
      return { ok: true, event_id: id, new_event_id: nid.id, moved: ids };
    });
  }

  /* ===================================================================== *
   * LISTENERS (R15, R16) AND EVENT SOURCES (R30).
   * ===================================================================== */

  #listen(list, module, fn, extra) {
    const refused = listenerRefusal(list, module, fn, extra);
    if (refused) return refused;
    list.push({ module, fn, seq: list.length });
    const rank = (x) => { const i = MODULE_ORDER.indexOf(x); return i === -1 ? Infinity : i; };
    list.sort((p, q) => (rank(p.module) - rank(q.module)) || (p.seq - q.seq));
    return { ok: true };
  }
  /** R15: run inside the transaction that changes an event's when_cache, with `{eventId, before, after}`. */
  onWhenChanged(module, fn) { return this.#listen(this.#onWhen, module, fn, { slot: "onWhenChanged" }); }
  /** R16: run after commit, for `when_moved` and `participant_re_resolved` (and merges and splits). */
  onEventChanged(module, fn) { return this.#listen(this.#onChanged, module, fn, { slot: "onEventChanged" }); }
  /** R30: a later module's own acts, read into the timeline's "what we did" lane. */
  registerEventSource(module, fn) { return this.#listen(this.#sources, module, fn, { slot: "registerEventSource" }); }

  /* ===================================================================== *
   * RELATIONS (R17–R20).
   * ===================================================================== */

  /* R19: would `from within to` close a loop? It does when `from` is reached walking up from `to`. */
  #withinLoops(from, to) {
    const seen = new Set([to]);
    let frontier = [to];
    for (let depth = 0; frontier.length && depth < 256; depth++) {
      const next = [];
      for (const n of frontier)
        for (const r of this.#rows(`SELECT to_event FROM event_relations WHERE from_event=? AND kind='within' AND withdrawn_at IS NULL`, n)) {
          if (r.to_event === from) return true;
          if (!seen.has(r.to_event)) { seen.add(r.to_event); next.push(r.to_event); }
        }
      frontier = next;
    }
    return false;
  }

  /** R17–R19: a cited relation between two events. */
  relate({ from, to, kind, attestation, by = null } = {}) {
    if (!RELATION_KINDS.includes(kind)) return refuse("UNKNOWN_RELATION", `a relation is one of ${RELATION_KINDS.join(", ")}`, { kinds: [...RELATION_KINDS] });
    if (!said(from) || !said(to)) return refuse("NO_ENDS", "a relation names two events by id: from and to");
    if (isHypothesisId(from) || isHypothesisId(to)) return refuse("HYPOTHESIS_ID", "a hypothesis is never an end of an event's relation (K1467)");
    const f = this.#resolve(from), t = this.#resolve(to);
    if (f && t && f === t) return refuse("SELF_RELATION", "a relation is between two distinct events");
    if (!f) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: from, end: "from" });
    if (!t) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: to, end: "to" });
    if (attestation === undefined || attestation === null) return refuse("NO_ATTESTATION", "every relation is cited");
    const machine = isMachineIdentity(by);
    if (kind === "stated_cause") {
      if (machine) return refuse("CAUSE_NOT_MACHINE", "a stated cause is held only from a named source by a member; the machine never writes one");
      if (isObj(attestation) && attestation.testimony !== undefined)
        return refuse("CAUSE_NEEDS_SOURCE", "a cause is held only as a named source's claim; a member's own hypothesis is not held here (K1467)");
    } else if (machine && kind !== "within")
      return refuse("RELATION_NOT_MACHINE", "the machine writes no relation but within (R41)");
    const x = this.#attestationFrom(attestation, by);
    if (!x.ok) return x;
    if (kind === "within" && this.#withinLoops(f, t)) return refuse("WITHIN_CYCLE", "that within would make an event lie within itself");
    const prior = this.#one(`SELECT r.relation_id FROM event_relations r JOIN event_attestations a ON a.attestation_id = r.attestation_id
                              WHERE r.from_event=? AND r.to_event=? AND r.kind=? AND r.withdrawn_at IS NULL AND a.form=?
                                AND a.dated_fact_id IS ? AND a.capture_sha IS ? AND a.extent IS ? AND a.source_row IS ? AND a.statement IS ?`,
                            f, t, kind, x.row.form, x.row.dated_fact_id, x.row.capture_sha, x.row.extent, x.row.source_row, x.row.statement);
    if (prior) return { ok: true, already: true, relation_id: Number(prior.relation_id) };
    return this.#tx(() => {
      const aid = this.#addAttestation(f, x.row, by, "relation");
      const rid = this.#insert("event_relations", { from_event: f, to_event: t, kind, attestation_id: aid, by_actor: stamp(by), at: this.#now() });
      return { ok: true, relation: this.#relationView(this.#one(`SELECT * FROM event_relations WHERE relation_id=?`, rid), "class:admin") };
    });
  }

  /** R20: a relation withdrawn, never deleted. */
  withdrawRelation({ relationId, reason, by = null } = {}) {
    if (!said(reason)) return refuse("NO_REASON", "a withdrawal says why the relation was wrong; it is kept beside it");
    const r = this.#one(`SELECT * FROM event_relations WHERE relation_id=?`, Number(relationId));
    if (!r) return refuse("NO_SUCH_RELATION", "no relation with that id is held");
    if (r.withdrawn_at) return { ok: true, already: true, relation: this.#relationView(r, "class:admin") };
    this.#sql.exec(`UPDATE event_relations SET withdrawn_actor=?, withdrawn_at=?, withdrawn_why=? WHERE relation_id=?`,
                   stamp(by), this.#now(), reason.trim().slice(0, REASON_MAX), r.relation_id);
    return { ok: true, relation: this.#relationView(this.#one(`SELECT * FROM event_relations WHERE relation_id=?`, r.relation_id), "class:admin") };
  }

  /* R17, R18: a relation as read: two grades, the assertion's and its ends'; a stated cause in the source's words. */
  #relationView(r, viewer) {
    const a = this.#one(`SELECT * FROM event_attestations WHERE attestation_id=?`, r.attestation_id);
    const end = (id) => { const g = this.#governing(id); return g ? g.grade : null; };
    const source = a && a.capture_sha ? `the document ${a.capture_sha.slice(0, 12)}…` : "a member's testimony";
    return { relation_id: Number(r.relation_id), from: r.from_event, to: r.to_event, kind: r.kind,
             attestation: a ? this.#attestationView(a, viewer) : null,
             grade: { assertion: a ? a.grade : null, ends: [end(r.from_event), end(r.to_event)] },
             ...(r.kind === "stated_cause" ? { says: `${source} states that one caused the other`, asserted_by_record: false } : {}),
             by: r.by_actor, at: r.at,
             withdrawn: r.withdrawn_at ? { by: r.withdrawn_actor, at: r.withdrawn_at, reason: r.withdrawn_why } : null };
  }

  /* ===================================================================== *
   * ACT- ALIASES (R21).
   * ===================================================================== */

  aliasAct({ actId, eventId, by = null } = {}) {
    if (!said(actId) || !ACT_RE.test(actId.trim())) return refuse("NO_ACT", "an act is named by its ACT- id");
    const id = this.#resolve(eventId);
    if (!id) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: eventId ?? null });
    const held = this.#one(`SELECT event_id FROM event_aliases WHERE alias=?`, actId.trim());
    if (held && held.event_id === id) return { ok: true, already: true, act_id: actId.trim(), event_id: id };
    if (held) return refuse("ACT_ALIASED", "that act already names another event", { event_id: held.event_id });
    this.#sql.exec(`INSERT INTO event_aliases (alias, event_id, by_actor, at) VALUES (?,?,?,?)`, actId.trim(), id, stamp(by), this.#now());
    return { ok: true, act_id: actId.trim(), event_id: id };
  }
  eventForAct(actId) {
    try {
      const r = said(actId) ? this.#one(`SELECT event_id FROM event_aliases WHERE alias=?`, actId.trim()) : null;
      const id = r ? this.#resolve(r.event_id) : null;
      return id ? { ok: true, found: true, act_id: actId.trim(), event_id: id } : { ok: true, found: false, act_id: actId ?? null };
    } catch { return { ok: true, found: false, act_id: null }; }
  }

  /* ===================================================================== *
   * THE READS (R26–R34), each through the viewer's sight (R40).
   * ===================================================================== */

  /* The attestations of an event the viewer may see, oldest first. */
  #visibleAttestations(eventId, viewer, serves = "event") {
    const sees = this.#seer(viewer);
    return this.#rows(`SELECT * FROM event_attestations WHERE event_id=? AND serves=? ORDER BY attestation_id`, eventId, serves)
      .filter((a) => sees(a.bundle_id));
  }
  #attestationView(a, viewer) {
    const hidden = a.bundle_id != null && !this.#sees(a.bundle_id, viewer);
    return { attestation_id: Number(a.attestation_id), form: a.form, dated_fact_id: a.dated_fact_id, capture_sha: a.capture_sha,
             extent: json(a.extent), source_row: a.source_row ?? null,
             ...(a.form === "testimony" ? { statement: a.statement, testimony: true } : {}),
             date: a.value != null ? { value: a.value, precision: a.precision, zone: a.zone } : null,
             grade: a.grade, by: hidden ? null : a.by_actor, at: a.at };
  }
  /* R12: the participant's entity resolution in the attesting capture, the strongest, beside the attestation's grade. */
  #resolutionGrade(entityId, a) {
    if (!a || !a.capture_sha) return null;
    try {
      const r = this.#ents.resolutionsFor({ captureSha: a.capture_sha, limit: 5000, viewer: "class:admin" });
      let best = null;
      for (const x of (r && r.resolutions) || [])
        if (x.entity_id === entityId && (!best || (gradeRank[x.grade] || 0) > (gradeRank[best] || 0))) best = x.grade;
      return best;
    } catch { return null; }
  }
  #participantView(p, viewer, attById) {
    const a = attById.get(Number(p.attestation_id)) || this.#one(`SELECT * FROM event_attestations WHERE attestation_id=?`, p.attestation_id);
    return { participant_id: Number(p.participant_id), entity_id: p.entity_id, role: p.role,
             ...(p.role === "voted" ? { vote_value: p.vote_value,
                 vote_value_checked: this.#voteValues() !== null,
                 ...(this.#voteValues() === null ? { vote_value_why: "no active jurisdiction profile names vote values, so the value is kept as the record writes it" } : {}) } : {}),
             attestation_id: Number(p.attestation_id),
             grades: { attestation: a ? a.grade : null, resolution: this.#resolutionGrade(p.entity_id, a) },
             by: p.by_actor, at: p.at,
             superseded: p.superseded_by != null
               ? { by_row: Number(p.superseded_by), by: p.superseded_actor, at: p.superseded_at, reason: p.superseded_why } : null };
  }

  /* The one event view R26 answers, or null when the viewer may see none of its attestations (R40). */
  #eventView(id, viewer) {
    const ev = this.#one(`SELECT * FROM events WHERE event_id=?`, id);
    if (!ev) return null;
    const atts = this.#visibleAttestations(id, viewer);
    if (!atts.length) return null;
    const attById = new Map(atts.map((a) => [Number(a.attestation_id), a]));
    const w = this.#whenRead(id);
    let when = w.when, why = w.why ?? null;
    if (when !== "undetermined" && w.governing != null && !attById.has(Number(w.governing))) {
      when = null; why = "no dated attestation you can see governs this event";
    }
    if (when === null && !why) why = "placed nowhere: no attestation of this event is dated";
    const parts = this.#rows(`SELECT * FROM event_participants WHERE event_id=? ORDER BY participant_id`, id)
      .filter((p) => attById.has(Number(p.attestation_id))).map((p) => this.#participantView(p, viewer, attById));
    const sees = this.#seer(viewer);
    const relVisible = (r) => { const a = this.#one(`SELECT bundle_id FROM event_attestations WHERE attestation_id=?`, r.attestation_id); return a && sees(a.bundle_id); };
    const relations = this.#rows(`SELECT * FROM event_relations WHERE from_event=? OR to_event=? ORDER BY relation_id`, id, id)
      .filter(relVisible).map((r) => ({ ...this.#relationView(r, viewer), direction: r.from_event === id ? "out" : "in" }));
    const within = relations.filter((r) => r.kind === "within" && r.direction === "out" && !r.withdrawn).map((r) => r.to);
    const concerns = this.#rows(`SELECT end_id FROM event_concerns WHERE event_id=? ORDER BY end_id`, id).map((r) => r.end_id);
    const changes = this.#rows(`SELECT kind, other, detail, reason, by_actor, at FROM event_changes WHERE event_id=? ORDER BY change_id`, id)
      .map((c) => ({ kind: c.kind, other: c.other, detail: json(c.detail), reason: c.reason, by: c.by_actor, at: c.at }));
    const choices = this.#rows(`SELECT attestation_id, reason, by_actor, at FROM event_choices WHERE event_id=? ORDER BY choice_id`, id)
      .filter((c) => attById.has(Number(c.attestation_id)))
      .map((c) => ({ attestation_id: Number(c.attestation_id), reason: c.reason, by: c.by_actor, at: c.at }));
    return { event_id: id, kind: ev.kind, status: ev.status, where: ev.where_text, when, ...(why ? { why } : {}),
             governing: when && when !== "undetermined" ? Number(w.governing) : null, concerns, within,
             attestations: atts.map((a) => this.#attestationView(a, viewer)), participants: parts, relations,
             choices, merges_and_splits: changes, by: ev.by_actor, at: ev.at };
  }

  /** R26: one event, by its id or an alias of it. */
  readEvent({ eventId, viewer = null } = {}) {
    if (!said(eventId)) return refuse("NO_EVENT", "an event is read by its id (op=event&id=EVT-…)");
    const id = this.#resolve(eventId);
    const v = id ? this.#eventView(id, viewer) : null;
    if (!v) return { ok: true, found: false, event_id: eventId };
    return { ok: true, found: true, ...(id !== eventId.trim() ? { alias_of: id, asked: eventId.trim() } : {}), event: v };
  }

  /* The live events an entity takes part in (with its roles) or which concern it, each with its when, in sight. */
  #eventsOfEntity(entity, viewer, { kinds = null, roles = null } = {}) {
    const byEvent = new Map();
    for (const p of this.#rows(`SELECT event_id, role, attestation_id FROM event_participants WHERE entity_id=? AND superseded_by IS NULL`, entity)) {
      if (roles && !roles.includes(p.role)) continue;
      if (!byEvent.has(p.event_id)) byEvent.set(p.event_id, { roles: new Set(), atts: new Set(), concerns: false });
      byEvent.get(p.event_id).roles.add(p.role); byEvent.get(p.event_id).atts.add(Number(p.attestation_id));
    }
    if (!roles) for (const c of this.#rows(`SELECT event_id FROM event_concerns WHERE end_id=?`, entity)) {
      if (!byEvent.has(c.event_id)) byEvent.set(c.event_id, { roles: new Set(), atts: new Set(), concerns: false });
      byEvent.get(c.event_id).concerns = true;
    }
    return this.#itemsFor(byEvent, viewer, kinds);
  }
  #itemsFor(byEvent, viewer, kinds) {
    const out = [];
    for (const [id, x] of byEvent) {
      const ev = this.#one(`SELECT kind, status, alias_of FROM events WHERE event_id=?`, id);
      if (!ev || ev.alias_of || (kinds && !kinds.includes(ev.kind))) continue;
      const atts = this.#visibleAttestations(id, viewer);
      if (!atts.length) continue;
      const seen = new Set(atts.map((a) => Number(a.attestation_id)));
      const roles = [...x.roles].filter(() => [...x.atts].some((a) => seen.has(a)));
      if (!roles.length && !x.concerns && x.roles.size) continue;
      const w = this.#whenRead(id);
      const when = w.when === "undetermined" || (w.governing != null && !seen.has(Number(w.governing))) ? null : w.when;
      out.push({ event_id: id, kind: ev.kind, status: ev.status, when, ...(w.when === "undetermined" ? { why: "cache stale" } : {}),
                 roles: roles.sort(), concerns: x.concerns });
    }
    return out;
  }
  #range(items, from, to) {
    const zone = this.zone();
    const f = spanOfBound(from, zone), t = spanOfBound(to, zone);
    if ((f && f.bad) || (t && t.bad)) return { bad: (f && f.bad) || t.bad };
    if (!f && !t) return { items };
    return { items: items.filter((i) => i.when && (!f || placeAgainst(i.when, f) !== "before") && (!t || placeAgainst(i.when, t) !== "after")) };
  }
  #bounded(items, limit, idOf = (i) => i.event_id) {
    const cap = clamp(limit);
    const o = orderByWhen(items, idOf);
    const truncated = o.placed.length > cap;
    return { items: o.placed.slice(0, cap), placed_nowhere: o.nowhere.slice(0, cap), limit: cap,
             truncated: truncated || o.nowhere.length > cap };
  }

  /** R27: the events an entity takes part in or that concern it, ordered by R31, bounded. */
  eventsFor({ entity, kinds = null, from = null, to = null, limit = null, viewer = null } = {}) {
    if (!said(entity)) return noEntity("events are read for one registered subject, named by its id");
    const ks = Array.isArray(kinds) && kinds.length ? kinds : typeof kinds === "string" && kinds ? kinds.split(",") : null;
    const r = this.#range(this.#eventsOfEntity(entity, viewer, { kinds: ks }), from, to);
    if (r.bad) return refuse("BAD_DATE", r.bad);
    const b = this.#bounded(r.items, limit);
    return { ok: true, entity, count: b.items.length, events: b.items, placed_nowhere: b.placed_nowhere, limit: b.limit, truncated: b.truncated };
  }

  /** R28–R30: the world's events concerning or involving an explicit set, and, apart, what the group's own modules did. */
  timeline({ set, from = null, to = null, lanes = null, limit = null, viewer = null } = {}) {
    const ids = Array.isArray(set) ? set.filter(said).map((s) => s.trim()) : typeof set === "string" ? set.split(",").filter(said) : [];
    if (!ids.length) return refuse("NO_SET", "a timeline is of an explicit set of entity or event ids; a project's or inquiry's scope is resolved by its caller");
    const want = Array.isArray(lanes) && lanes.length ? lanes : ["world", "ours"];
    const answer = { ok: true, set: ids };
    if (want.includes("world")) {
      const items = new Map();
      for (const id of ids) {
        const list = EVT_RE.test(id) ? this.#eventsAround(id, viewer) : this.#eventsOfEntity(id, viewer);
        for (const it of list) {
          const held = items.get(it.event_id);
          items.set(it.event_id, held ? { ...held, roles: [...new Set([...held.roles, ...it.roles])].sort(), concerns: held.concerns || it.concerns,
                                          of: [...new Set([...held.of, id])] } : { ...it, of: [id] });
        }
      }
      const r = this.#range([...items.values()], from, to);
      if (r.bad) return refuse("BAD_DATE", r.bad);
      const b = this.#bounded(r.items, limit);
      answer.world = { label: "what they did", items: b.items, placed_nowhere: b.placed_nowhere, limit: b.limit, truncated: b.truncated };
    }
    if (want.includes("ours")) {
      const cap = clamp(limit);
      answer.ours = { label: "what we did", sources: this.#sources.map((s) => {
        try {
          const got = s.fn({ set: ids, from, to, limit: cap });
          const list = Array.isArray(got) ? got : got && Array.isArray(got.items) ? got.items : [];
          const items = list.filter(isObj).map((x) => ({ at: x.at ?? null, label: x.label ?? null, ref: x.ref ?? null, kind: x.kind ?? null }));
          const zone = this.zone();
          const withWhen = items.map((x) => { const w = spanOfBound(x.at, zone); return { ...x, when: w && !w.bad ? w : null }; });
          const o = orderByWhen(withWhen, (x) => `${x.ref}`);
          const all = [...o.placed, ...o.nowhere.map((x) => ({ ...x, placed_nowhere: true }))];
          return { source: s.module, items: all.slice(0, cap).map(({ when, ...x }) => x), truncated: all.length > cap };
        } catch (e) { return { source: s.module, error: String(e && e.message || e).slice(0, 200) }; }
      }) };
    }
    return answer;
  }
  /* An event of the set, with the events within it and those that concern it. */
  #eventsAround(eventId, viewer) {
    const id = this.#resolve(eventId);
    if (!id) return [];
    const byEvent = new Map([[id, { roles: new Set(), atts: new Set(), concerns: false }]]);
    for (const r of this.#rows(`SELECT from_event FROM event_relations WHERE to_event=? AND kind='within' AND withdrawn_at IS NULL`, id))
      byEvent.set(r.from_event, { roles: new Set(), atts: new Set(), concerns: false });
    for (const c of this.#rows(`SELECT event_id FROM event_concerns WHERE end_id=?`, id))
      byEvent.set(c.event_id, { roles: new Set(), atts: new Set(), concerns: true });
    return this.#itemsFor(byEvent, viewer, null);
  }

  /** R31: before, after or undetermined with why; computed on each read, never stored. */
  sequence({ a, b, viewer = "class:admin" } = {}) {
    const ia = this.#resolve(a), ib = this.#resolve(b);
    if (!ia || !ib) return refuse("NO_SUCH_EVENT", "no event with that id is held", { event_id: !ia ? a ?? null : b ?? null });
    const wa = this.#whenRead(ia), wb = this.#whenRead(ib);
    if (wa.when === "undetermined" || wb.when === "undetermined") return { ok: true, a: ia, b: ib, answer: "undetermined", why: "cache stale" };
    const s = sequenceOf(wa.when, wb.when);
    return typeof s === "string" ? { ok: true, a: ia, b: ib, answer: s }
      : { ok: true, a: ia, b: ib, answer: "undetermined", why: s.why };
  }

  /** R32: who a communication, issuance or meeting was sent to, copied to, or who was present: never who knew or saw. */
  whoWasSent({ eventId, viewer = null } = {}) {
    const r = this.readEvent({ eventId, viewer });
    if (!r.ok || !r.found) return r;
    if (!["communication", "issuance", "meeting"].includes(r.event.kind))
      return refuse("NOT_A_COMMUNICATION", "who was sent something is read of a communication, an issuance or a meeting");
    const WORDS = { sender: "sent by", recipient: "sent to", copied: "copied", present: "present" };
    const list = r.event.participants.filter((p) => !p.superseded && WORDS[p.role])
      .map((p) => ({ entity_id: p.entity_id, role: p.role, words: WORDS[p.role], attestation: r.event.attestations.find((a) => a.attestation_id === p.attestation_id) || null }));
    return { ok: true, event_id: r.event.event_id, kind: r.event.kind, participants: list,
             detail: "this says to whom the record states it was sent, copied or who was present; it never says who knew or saw anything" };
  }

  /** R33: an entity's statements and communications in R31's order. */
  statementsOf({ entity, from = null, to = null, limit = null, viewer = null } = {}) {
    if (!said(entity)) return noEntity("statements are read for one registered subject, named by its id");
    const items = this.#eventsOfEntity(entity, viewer, { kinds: ["statement", "communication"], roles: ["speaker", "sender", "author", "actor"] });
    const r = this.#range(items, from, to);
    if (r.bad) return refuse("BAD_DATE", r.bad);
    const b = this.#bounded(r.items, limit);
    return { ok: true, entity, count: b.items.length, statements: b.items, placed_nowhere: b.placed_nowhere, limit: b.limit, truncated: b.truncated };
  }

  /** R34: the stage of the profile's flow the proceeding's held events reach on `at`, or undetermined with why. */
  proceedingStatusAt({ proceeding, at, viewer = null } = {}) {
    if (!said(proceeding)) return noEntity("a proceeding's status is read by its entity id");
    const ents = this.#ents;
    if (!ents.has(proceeding)) return noSuchEntity(proceeding);
    const e = ents.readEntity({ entityId: proceeding, viewer: "class:admin" });
    if (!e || !e.entity || e.entity.kind !== "proceeding")
      return refuse("NOT_A_PROCEEDING", "status as of a date is read of an entity of kind proceeding", { entity_id: proceeding });
    const und = (why, extra = {}) => ({ ok: true, proceeding, at: at ?? null, stage: "undetermined", why, ...extra });
    const facet = typeof ents.proceedingOf === "function" ? ents.proceedingOf(proceeding) : (e.entity.proceeding || null);
    const kind = facet && facet.kind;
    if (!kind) return und("the proceeding's kind is not held, so no flow can be read for it");
    const flows = this.view().proceeding_flows;
    const flow = Array.isArray(flows) ? flows.find((f) => f && f.kind === kind) : isObj(flows) ? flows[kind] : null;
    if (!flow || !Array.isArray(flow.stages)) return und(`no active profile holds a flow for proceedings of kind ${kind}`);
    const point = spanOfBound(at, this.zone());
    if (!point || point.bad) return refuse("BAD_DATE", point && point.bad ? point.bad : "a status is read as of a date");
    const events = this.#eventsOfEntity(proceeding, viewer);
    let reached = null, rests = [], open = [];
    flow.stages.forEach((st, i) => {
      const bearing = events.filter((ev) => (st.reached_by || []).includes(ev.kind));
      for (const ev of bearing) {
        const place = !ev.when ? "nowhere" : ev.when.end && point.end && ev.when.end <= point.end ? "by" : ev.when.start && point.end && ev.when.start >= point.end ? "after" : "open";
        if (place === "by" && (!reached || reached.i <= i)) { reached = { i, stage: st }; rests = [...rests.filter((x) => x.stage === st.stage), { event_id: ev.event_id, stage: st.stage, when: ev.when }]; }
        else if (place === "open" || place === "nowhere") open.push({ event_id: ev.event_id, stage: st.stage, when: ev.when, i });
      }
    });
    if (!reached && !open.length) return und("no held event bears on this proceeding's flow on that date");
    const later = open.filter((o) => !reached || o.i > reached.i);
    if (later.length) return und("the order of the deciding events against that date is undetermined at the precision held", { events: later.map(({ i, ...x }) => x) });
    return { ok: true, proceeding, at, kind, stage: reached.stage.stage, label: reached.stage.label,
             rests_on: rests.filter((x) => x.stage === reached.stage.stage), citation: flow.citation ?? null };
  }

  /** R35: this owner's connections at a node (connection-grammar's contract). */
  neighbours(args) { return neighboursOf(this.#kernel(), args); }

  /** R22–R25: the machine's writes from a followed body's Legistar capture (`follow.mjs`). */
  followedImport(args = {}) { return followedImport(this.#kernel(), args); }
  /** R38: a followed proceeding's register rows as filing and order events (`follow.mjs`). */
  followedRegister(args = {}) { return followedRegister(this.#kernel(), args); }

  /* What the following and owner files reach, and nothing else. */
  #kernel() {
    return {
      rows: (q, ...a) => this.#rows(q, ...a), one: (q, ...a) => this.#one(q, ...a), now: () => this.#now(),
      view: () => this.view(), zone: () => this.zone(), extraction: this.#extraction, entities: this.#ents,
      record: this.#record, heldCapture: (s, by) => this.#heldCapture(s, by), sees: (b, v) => this.#sees(b, v),
      tx: (fn) => this.#tx(fn), holdFact: (x) => this.#holdFact(x), insert: (t, r) => this.#insert(t, r),
      addAttestation: (e, r, by, serves) => this.#addAttestation(e, r, by, serves), sameAttestation: (e, r) => this.#sameAttestation(e, r),
      setWhen: (e) => this.#setWhen(e), resolve: (e) => this.#resolve(e), governing: (e) => this.#governing(e),
      whenRead: (e) => this.#whenRead(e), visibleAttestations: (e, v) => this.#visibleAttestations(e, v),
      resolutionGrade: (en, a) => this.#resolutionGrade(en, a), captureGrade: (s) => this.#captureGrade(s),
      voteRefusal: (v) => this.#voteRefusal(v), tell: (c) => this.#tell(c), allocEvent: () => this.#record.allocId("EVT", this.#now().slice(0, 4)),
    };
  }
}

/* R36 (K1122): the route arms this module answers, spread into the plane's op map. `url` carries the control plane's
   stamps (`viewer`, `by`); `body` the act's arguments, whose `by` the control plane stamps. One append site per act. */
export function eventsOps(ev, url, body) {
  const q = (k) => url.searchParams.get(k);
  const act = (fn) => () => fn({ ...(body || {}), by: q("by") ?? (body && body.by) ?? null });
  return {
    datedfact: act((b) => ev.recordDatedFact(b)),
    editacts: act((b) => ev.recordEditActs(b)),
    readoptin: act((b) => ev.setReadOptIn(b)),
    eventcreate: act((b) => ev.createEvent(b)),
    eventattest: act((b) => ev.attest(b)),
    eventgovern: act((b) => ev.chooseGoverning(b)),
    participantadd: act((b) => ev.addParticipant(b)),
    participantcorrect: act((b) => ev.correctParticipant(b)),
    eventmerge: act((b) => ev.mergeEvents(b)),
    eventsplit: act((b) => ev.splitEvent(b)),
    eventrelate: act((b) => ev.relate(b)),
    eventrelationwithdraw: act((b) => ev.withdrawRelation(b)),
    actalias: act((b) => ev.aliasAct(b)),
    eventimport: act((b) => ev.followedImport(b)),
    registerimport: act((b) => ev.followedRegister(b)),
    event: () => ev.readEvent({ eventId: q("id"), viewer: q("viewer") }),
    eventforact: () => ev.eventForAct(q("act")),
    datedfacts: () => ev.datedFactsFor({ captureSha: q("sha256"), viewer: q("viewer") }),
    eventsfor: () => ev.eventsFor({ entity: q("entity"), kinds: q("kinds"), from: q("from"), to: q("to"), limit: q("limit"), viewer: q("viewer") }),
    timeline: () => ev.timeline({ set: q("set"), from: q("from"), to: q("to"), lanes: q("lanes") ? q("lanes").split(",") : null,
                                  limit: q("limit"), viewer: q("viewer") }),
    sequence: () => ev.sequence({ a: q("a"), b: q("b"), viewer: q("viewer") }),
    whowassent: () => ev.whoWasSent({ eventId: q("id"), viewer: q("viewer") }),
    statementsof: () => ev.statementsOf({ entity: q("entity"), from: q("from"), to: q("to"), limit: q("limit"), viewer: q("viewer") }),
    proceedingstatus: () => ev.proceedingStatusAt({ proceeding: q("proceeding"), at: q("at"), viewer: q("viewer") }),
  };
}
