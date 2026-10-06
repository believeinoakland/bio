/* people (layer 5; T33-36, K1452, K1455, K1483–K1493): the people the record is about, held fully and never judged.
   `build/requirements/people.md` R1–R33. Identity claims that LINK two person records and never merge them, with the
   derived identity cluster (R1–R8); dated person facts and their lawful removal (R9–R12); the reads that gather a
   person's positions, career, credentials, interests, statements and acts from their owning modules (R13–R17);
   staffing as of a date (R18–R19); members' own ties (R20); the protected link from a source to a person (R21); the
   machine's interest checks, held in the hypothesis layer and shown only past their gate (R22–R25); the connection
   owner of the identity kinds (R26) and the ops map (R27).
   ONE HOME PER FACT (R30): posts, memberships, credentials, interests and ties are `lines`'; statements and acts are
   `events`'; money is `money`'s; duties are `duties`'. This module reads them through the services it is handed
   (`peopleOf(ctx, deps)`, K61) and stores none of them. NO JUDGMENT ON A PERSON (R29): no score, rank or suspicion is
   stored or answered, and a match of a check is "Noticed", the machine's, in the hypothesis layer. */
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, listenerRefusal, MODULE_ORDER, notAnAdmin, noSuchProject } from "../membership/index.mjs";
import { isMachineIdentity, BASIS_GRADES, sha256HexSync, canonicalJson } from "../record-grammar/index.mjs";
import { validAt, compare, isCalendarDate, bounds } from "../civil-time/index.mjs";
import { defaultRegistry, BOUNDS } from "../connection-grammar/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { contentOf, checkContentExtent, canonicalExtent } from "../content/index.mjs";
import { sourcesOf } from "../sources/index.mjs";
import { noSuchEntity, noEntity, entitiesOf } from "../entities/index.mjs";
import { eventsOf } from "../events/index.mjs";
import { linesOf } from "../lines/index.mjs";
import { moneyOf } from "../money/index.mjs";
import { dutiesOf } from "../duties/index.mjs";
import { combine } from "../../../jurisdictions/index.mjs";
import { PEOPLE_SCHEMA, PEOPLE_TABLES, CLUSTER_TABLE } from "./schema.mjs";
import { SHIPPED_CHECKS, CHECK_MACHINE, conditionError, hypothesisNamed, evaluatePerson } from "./checks.mjs";

export { PEOPLE_SCHEMA, PEOPLE_TABLES } from "./schema.mjs";
export { SHIPPED_CHECKS, HOP_KINDS, HOPS_MAX, conditionError, evaluatePerson } from "./checks.mjs";

const MODULE = "people";

/* The closed vocabularies (R1, R9, R20, R12). */
export const CLAIM_KINDS = Object.freeze(["same_as", "not_same_as", "unsure"]);
export const CLAIM_BASES = Object.freeze(["identifier", "corroborated_name", "name", "testimony"]);
/* R2 (K1488): each basis earns exactly one grade. */
export const BASIS_GRADE = Object.freeze({ identifier: "A", corroborated_name: "B", name: "C", testimony: "D" });
export const FACT_KINDS = Object.freeze(["name", "birth", "death", "locality", "address", "contact"]);
export const CONTACT_KINDS = Object.freeze(["address", "contact"]);
export const TIE_KINDS = Object.freeze(["employer", "relative", "business", "other"]);
/* R20 (K1490; case-disclosures R27): the attribution levels a member chooses for a tie's disclosure. */
export const ATTRIBUTION_LEVELS = Object.freeze(["group", "project", "cover", "name"]);
export const EXPUNGE_GROUNDS = Object.freeze(["unlawful", "confidential", "court_order", "lawful_demand"]);
/* R26 (K1486): the members' words for the identity kinds. */
export const IDENTITY_KIND_WORDS = Object.freeze([
  { kind: "same_as", word: "same person?", class: "evidentiary" },
  { kind: "not_same_as", word: "claimed not the same person", class: "evidentiary" },
  { kind: "unsure", word: "unsure whether the same person", class: "evidentiary" },
]);
/* R29 (K1471, K1473, K1486): words no outward text of this module uses. */
export const FORBIDDEN_WORDS = Object.freeze(["knows", "conflict", "suspicious", "most connected"]);

/* The bounds. R5: a cluster's members and claims; R17: every list a read answers; R7: candidates. */
export const CLUSTER_MEMBERS_MAX = 500;
export const CLUSTER_CLAIMS_MAX = 1000;
export const READ_LIST_MAX = 500;
export const CANDIDATES_DEFAULT = 50;
export const CANDIDATES_MAX = 200;
/* R24 (K1504, M-C8): a machine check's results are shown only at a measured false-alarm rate at most this. */
export const GATE_RATE_MAX = 0.2;
/* R2 (K1488): the people line kinds a name match is corroborated by. */
const STATEMENT_ROLES = Object.freeze(["decider", "signatory", "implementer", "author"]);
const TEXT_MAX = 2000;
/* The machine's reading viewer: a machine credential sees every row (membership R43), for evaluating checks. */
const MACHINE_VIEWER = "class:daemon";

const filled = (v) => typeof v === "string" && v.trim() !== "";
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const clean = (v, max = TEXT_MAX) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const refuse = (reason, detail, extra = {}) => ({ ok: false, reason, detail, ...extra });
const json = (v) => { try { return JSON.parse(v); } catch { return null; } };
const listOf = (r) => {
  if (!r || r.ok === false) return [];
  for (const k of ["items", "lines", "events", "facts", "duties", "statements", "identifiers"]) if (Array.isArray(r[k])) return r[k];
  return Array.isArray(r) ? r : [];
};
const lineId = (l) => l.line_id ?? l.id ?? null;
const lineFrom = (l) => l.from ?? l.from_entity ?? null;
const lineTo = (l) => l.to ?? l.to_entity ?? null;
const eventId = (e) => e.event_id ?? e.id ?? null;
const factIdOf = (f) => f.fact_id ?? f.id ?? null;
const partyEntity = (p) => (isObj(p) ? p.entity ?? null : typeof p === "string" ? p : null);
const roleNames = (roles) => (Array.isArray(roles) ? roles.map((r) => (isObj(r) ? r.role : r)).filter(filled) : []);
/* The `by` of an act as a member id: a machine stamp names no member. */
const memberOf = (by) => (typeof by !== "string" || !by.trim() || isMachineIdentity(by) ? null
  : by.startsWith("member:") ? by.slice(7) || null : by.trim());
/* The member a viewer names: the founder's two spellings, `member:<id>`, or none (a machine, or no viewer). */
const viewerMember = (viewer) => (viewer === "admin" ? "admin"
  : typeof viewer === "string" && viewer.startsWith("member:") && viewer.length > 7 ? viewer.slice(7) : null);
/* A bound of one list (R17): at most `max`, `truncated` when one more was there. */
const bounded = (items, max = READ_LIST_MAX, truncated = false) =>
  ({ items: items.slice(0, max), truncated: truncated || items.length > max });

const instances = new WeakMap();
const live = new Set();           /* R26 (K1563 (1)): every instance made in this isolate, weakly held */

/** K61, K1563 (1): the one People for a Durable Object's storage. `deps` is read on the first call only: `record`,
 *  `membership`, `entities`, `provenance`, `content`, `sources`, `events`, `lines`, `money`, `duties` (each the real
 *  module on the same host when not given, reached on first use; a dep given as a function is called once, then), and
 *  `registry` (connection-grammar's; the default one when absent), `now`. */
export function peopleOf(ctx, deps = {}) {
  const storage = ctx && ctx.storage ? ctx.storage : ctx;
  let p = instances.get(storage);
  if (!p) {
    const d = deps || {};
    const record = d.record ?? recordOf(ctx);
    const membership = d.membership ?? membershipOf(ctx, { record });
    const real = {
      entities: () => entitiesOf(ctx, { record, membership }),
      provenance: () => provenanceOf(ctx),
      content: () => contentOf(ctx, { record, membership }),
      sources: () => sourcesOf(ctx, { record, membership }),
      events: () => eventsOf(ctx, { record, membership }),
      lines: () => linesOf(ctx, { record }),
      money: () => moneyOf(ctx, { record, membership }),
      duties: () => dutiesOf(ctx, { record, membership }),
    };
    const pick = (k) => (d[k] !== undefined && d[k] !== null ? d[k] : real[k]);
    p = new People(storage, { ...d, record, membership, entities: pick("entities"), provenance: pick("provenance"),
                              content: pick("content"), sources: pick("sources"), events: pick("events"), lines: pick("lines"),
                              money: pick("money"), duties: pick("duties") });
    instances.set(storage, p);
  }
  return p;
}

export class People {
  #sql; #record; #membership;
  #deps = {};            /* the used modules' services, each an instance or a function answering it on first use */
  #registry; #now; #declared = false;
  #roster = [];          /* R19: {module, fn, seq} in the modules' order */
  #onResult = [];        /* R25: {module, fn, seq} */

  constructor(storage, { record, membership, entities, provenance = null, content = null, sources = null, events = null,
                         lines = null, money = null, duties = null, registry = null, now = null } = {}) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#deps = { entities, provenance, content, sources, events, lines, money, duties };
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
    this.#registry = registry || defaultRegistry;
    this.#registerOwner(!registry);
  }

  #dep(name) { const d = this.#deps[name]; return typeof d === "function" ? (this.#deps[name] = d()) : d ?? null; }
  get #entities() { return this.#dep("entities"); }
  get #provenance() { return this.#dep("provenance"); }
  get #content() { return this.#dep("content"); }
  get #sources() { return this.#dep("sources"); }
  get #events() { return this.#dep("events"); }
  get #lines() { return this.#dep("lines"); }
  get #money() { return this.#dep("money"); }
  get #duties() { return this.#dep("duties"); }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ===================================================================== *
   * BOOT (R33, R6, R22)
   * ===================================================================== */

  /** This module's tables at every boot, idempotent; the declarations (R33) once; the shipped checks (R22) once. */
  migrate() {
    const bare = PEOPLE_SCHEMA.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    this.declare();
    this.#installShipped();
  }

  /** R33: every table declared explicitly through record-core's `declareTable`, the cluster cache derived-rebuildable
   *  with its rebuild (R6; record-core R77). Once per instance; a refusal is a wiring defect and throws. */
  declare() {
    if (this.#declared) return { ok: true, already: true };
    const r = this.#record.declareTable(MODULE, [...PEOPLE_TABLES.map((t) => ({ ...t })),
      { name: CLUSTER_TABLE, keys: [], purge: "clear", expunge: "none", export: "admin-only", sight: "group",
        derive: "derived-rebuildable", version_chain: false, key: ["entity_id"], rebuild: () => this.#clusterRows() }]);
    if (r && r.ok === false) throw new Error(`people: record-core refused its tables: ${r.reason}${r.table ? ` (${r.table})` : ""}`);
    this.#declared = true;
    return r;
  }

  /* R22 (K1491): the machine's shipped checks, held once each as version 1 by the machine's stamp. */
  #installShipped() {
    for (const c of SHIPPED_CHECKS) {
      if (this.#one(`SELECT 1 AS x FROM interest_checks WHERE name=? AND machine=1`, c.name)) continue;
      const at = this.#now();
      this.#record.transact(() => {
        const { id } = this.#record.allocId("CHK", at.slice(0, 4));
        this.#sql.exec(`INSERT INTO interest_checks (check_id,version,name,condition_json,denominator,project,machine,by_actor,at)
                        VALUES (?,1,?,?,?,NULL,1,?,?)`, id, c.name, JSON.stringify(c.condition), c.denominator, CHECK_MACHINE, at);
        return { ok: true };
      });
    }
  }

  /* ===================================================================== *
   * SIGHT (R31; K1489). The registry of people is group-wide; a fact from a document follows that document; a claim,
   * a check or its result made inside a project follows the project; ties and source links take their own narrowest
   * sight. Every withheld item answers exactly as an absent one.
   * ===================================================================== */

  #denied(viewer) { return viewerPredicate(viewer).scope === "DENY"; }
  static #noViewer() {
    return refuse("NO_VIEWER", "a read names the member reading, stamped by the control plane; with none, nothing is answered");
  }
  #seesProject(project, viewer) {
    if (!filled(project)) return !this.#denied(viewer);
    return this.#membership.inSight(project, viewer) === true;
  }
  #homeOf(captureSha) {
    try { return this.#provenance && typeof this.#provenance.homeOf === "function" ? this.#provenance.homeOf(captureSha) : null; }
    catch { return null; }
  }
  #seesCapture(captureSha, viewer) {
    if (this.#denied(viewer)) return false;
    const home = this.#homeOf(captureSha);
    return !!home && this.#membership.inSight(home.bundleId, viewer) === true;
  }
  #isAdmin(memberId) {
    return filled(memberId) && typeof this.#membership.isAdministrator === "function" && this.#membership.isAdministrator(memberId) === true;
  }
  /* R25: a row of another module the viewer may read, asked of its owner (absent answers alike). */
  #rowVisible(row, viewer) {
    try {
      if (row.module === "lines") { const r = this.#lines.readLine({ lineId: row.id, viewer }); return !!(r && r.ok !== false && r.found !== false); }
      if (row.module === "events") { const r = this.#events.readEvent({ eventId: row.id, viewer }); return !!(r && r.ok !== false && r.found !== false); }
      if (row.module === "money") { const r = this.#money.readFact({ factId: row.id, viewer }); return !!(r && r.ok !== false && r.found !== false); }
    } catch { return false; }
    return false;
  }

  /* ===================================================================== *
   * PERSONS (entities' registry; K1452)
   * ===================================================================== */

  /* The registered entity, or null. */
  #entity(id) {
    try {
      const r = this.#entities.readEntity({ entityId: id });
      return r && r.found ? r.entity : null;
    } catch { return null; }
  }
  /* R1, R9: a person's refusals: NO_SUCH_ENTITY then NOT_A_PERSON, each naming the end when `end` is given. */
  #personRefusal(id, end = null) {
    const extra = end ? { end } : {};
    if (!filled(id) || !this.#entities.has(id)) return noSuchEntity(id ?? null, extra);
    const e = this.#entity(id);
    if (!e || e.kind !== "person")
      return refuse("NOT_A_PERSON", `${id} is registered as ${e ? `a ${e.kind}` : "something"}, not a person`, { entity_id: id, ...extra });
    return null;
  }
  /* The live names of a person, as their aliases stand in the registry. */
  #names(id) {
    const e = this.#entity(id);
    return e && Array.isArray(e.aliases) ? e.aliases.filter((a) => !a.withdrawn).map((a) => a.alias) : [];
  }
  /* The other persons holding a fold of one of `id`'s names (entities R6), with the name each shares. */
  #sharingName(id) {
    const out = new Map();
    for (const name of this.#names(id)) {
      let r;
      try { r = this.#entities.entitiesByAlias({ alias: name }); } catch { r = null; }
      for (const e of r && Array.isArray(r.entities) ? r.entities : []) {
        if (e.entity_id !== id && e.kind === "person" && !out.has(e.entity_id)) out.set(e.entity_id, name);
      }
    }
    return out;
  }
  /* The scheme identifiers an entity holds (entities R44), not withdrawn, each {scheme, id, normal, valid}. */
  #identifiers(id) {
    let r;
    try { r = typeof this.#entities.identifiersOf === "function" ? this.#entities.identifiersOf(id) : null; } catch { r = null; }
    return listOf(r).filter((x) => isObj(x) && !x.withdrawn && filled(x.scheme) && (filled(x.id) || filled(x.normal)))
      .map((x) => ({ scheme: x.scheme, id: x.id ?? x.normal, normal: String(x.normal ?? x.id).trim().toLowerCase(),
                     valid: isObj(x.valid) ? x.valid : null }));
  }
  #view() {
    const ids = typeof this.#record.getSetting === "function" ? this.#record.getSetting("jurisdiction_profiles") : null;
    const c = combine(Array.isArray(ids) ? ids : []);
    return c && c.ok ? c.view : {};
  }

  /* A date asked as a day, a minute, an instant or a date-time value, as civil-time reads it. */
  static #dateOf(at, zone = "UTC") {
    if (isObj(at)) return at;
    if (typeof at !== "string") return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(at)) return { value: at, precision: "day", zone };
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(at)) return { value: at, precision: "minute", zone };
    return at;
  }
  /* `in`, `out` or `{undetermined, why}` of a validity at a date (civil-time R22); a validity civil-time cannot read
     answers undetermined with its reason, never in. A validity its owner answers undetermined (a stale bound cache,
     lines R7) stays so. `currentThrough` is the day an open-ended `holds` line is stated current through (lines R21): at
     a date no later than it the line is `in`, and after it stays undetermined. Event bounds are read as their owner
     answers them, with the resolved edge as their `at`. */
  static #judge(valid, at, currentThrough = null) {
    if (!isObj(valid)) return { undetermined: true, why: "no validity is stated" };
    if (valid.undetermined) return { undetermined: true, why: filled(valid.why) ? valid.why : "its owner does not settle its validity" };
    const v = { from: valid.from ?? null, to: valid.to ?? null, precision: valid.precision || "day", zone: valid.zone || "UTC" };
    const judge = (x) => {
      try {
        const r = validAt({ valid: x, basis: null }, People.#dateOf(at, x.zone));
        if (r === "in" || r === "out") return r;
        if (r && r.refused) return { undetermined: true, why: r.why };
        return { undetermined: true, why: (r && r.why) || "undetermined" };
      } catch (e) { return { undetermined: true, why: String((e && e.message) || e) }; }
    };
    const r = judge(v);
    if (r === "in" || r === "out" || !filled(currentThrough) || v.to !== null) return r;
    if (judge({ ...v, to: currentThrough, precision: "day" }) === "in") return "in";
    return { undetermined: true, why: `${r.why}; it is stated current through ${currentThrough}, and the date is after that` };
  }
  /* R9: a validity as civil-time's value, or the bound it refuses. */
  static #validity(valid) {
    if (!isObj(valid)) return { refused: "valid", why: "a validity is {from, to, precision, zone}" };
    const precision = valid.precision || "day";
    if (!["day", "minute", "second", "edtf"].includes(precision)) return { refused: "precision", why: `${precision} is not a precision` };
    const zone = filled(valid.zone) ? valid.zone : "UTC";
    for (const side of ["from", "to"]) {
      const b = valid[side];
      if (b === null || b === undefined) continue;
      if (isObj(b)) {
        if (b.value !== undefined && b.event !== undefined) return { refused: side, why: "a bound gives both a value and an event" };
        if (filled(b.event) && ["start", "end"].includes(b.edge)) continue;
        if (b.value === undefined) return { refused: side, why: "an event bound names its event and its edge" };
      }
      const value = isObj(b) ? b.value : b;
      if (typeof value !== "string") return { refused: side, why: "a bound is a date value, an event bound or null" };
      let r;
      try { r = bounds({ value, precision: isObj(b) && b.precision ? b.precision : precision, zone: isObj(b) && b.zone ? b.zone : zone }); }
      catch (e) { r = { refused: "DATE_INVALID", why: String((e && e.message) || e) }; }
      if (r && r.refused) return { refused: side, why: r.why };
    }
    return { valid: { from: valid.from ?? null, to: valid.to ?? null, precision, zone } };
  }

  /* A citation `{captureSha, extent}`: a capture the record holds, and an extent content judges (R9; R1's evidence). */
  #citationRefusal(c, what) {
    if (!isObj(c) || !filled(c.captureSha) || !isObj(c.extent))
      return { reason: "NO_CITATION", detail: `${what} cites a captured document and a part of it: {captureSha, extent}` };
    if (!this.#homeOf(c.captureSha))
      return { reason: "NO_CITATION", detail: `${what} names no captured document the record holds` };
    /* content's own judgment of the extent against that capture (content R-extent checks), as lines reads a passage */
    let bad;
    try {
      canonicalExtent(c.extent);
      const ctx = this.#content && typeof this.#content.contentContextFor === "function" ? this.#content.contentContextFor(c.captureSha) : {};
      bad = checkContentExtent(c.extent, ctx);
    } catch (e) { bad = { reason: "CONTENT_EXTENT_UNREADABLE", detail: String((e && e.message) || e) }; }
    if (bad) return { ...bad, reason: bad.reason || bad.code || "NO_CITATION", detail: bad.detail || `${what}'s extent is not a part of that capture` };
    return null;
  }
  /* The capture axis of a cited fact (provenance R24–R27): its letter, or null where it is not determined. */
  #captureGrade(captureSha) {
    try {
      const g = this.#provenance && typeof this.#provenance.captureGrade === "function" ? this.#provenance.captureGrade(captureSha) : null;
      return g && BASIS_GRADES.includes(g.grade) ? g.grade : null;
    } catch { return null; }
  }

  /* ===================================================================== *
   * IDENTITY CLAIMS (R1–R4; K1488). Linked, never merged (R28).
   * ===================================================================== */

  /** R1–R3. */
  claimIdentity({ a, b, kind, basis, evidence = null, project = null, note, by = null } = {}) {
    if (!filled(a) || !filled(b)) return refuse("NO_ENDS", "a claim names two person records by id: a and b");
    if (a === b) return refuse("SELF_CLAIM", "a claim is between two distinct person records");
    for (const [id, end] of [[a, "a"], [b, "b"]]) { const r = this.#personRefusal(id, end); if (r) return r; }
    if (!CLAIM_KINDS.includes(kind))
      return refuse("UNKNOWN_CLAIM_KIND", `a claim's kind is one of ${CLAIM_KINDS.join(", ")}`, { kinds: [...CLAIM_KINDS] });
    if (!CLAIM_BASES.includes(basis))
      return refuse("UNKNOWN_BASIS", `a claim's basis is one of ${CLAIM_BASES.join(", ")}; its grade is earned from it`, { bases: [...CLAIM_BASES] });
    const machine = isMachineIdentity(by);
    /* R3 (K1443, K1470): the machine records only an identifier claim from source-native data at both ends. */
    if (machine && (basis !== "identifier" || !isObj(evidence) || !isObj(evidence.a) || !isObj(evidence.b)
                    || !filled(evidence.a.captureSha) || !filled(evidence.b.captureSha)))
      return refuse("MACHINE_CLAIM_REFUSED", "the machine records only an identifier claim from source-native data with "
        + "identifiers at both ends; any other claim is a member's act");
    const hasEvidence = isObj(evidence) && Object.keys(evidence).length > 0;
    if (basis !== "testimony" && !hasEvidence)
      return refuse("NO_EVIDENCE", `a ${basis} claim carries its evidence: each end's cited record and what it rests on`);
    const why = clean(note);
    if (!why) return refuse("NO_NOTE", "a claim carries a note in the claimant's own words");
    if (filled(project) && !(this.#record.bundleInfo(project) && this.#record.bundleInfo(project).type === "project"))
      return noSuchProject(project);
    for (const end of ["a", "b"]) {
      if (!hasEvidence || evidence[end] === undefined) continue;
      const bad = this.#citationRefusal(evidence[end], `the evidence for ${end}`);
      if (bad) return refuse("NO_EVIDENCE", bad.detail || `the evidence for ${end} is not a citation the record holds`, { end, cause: bad.reason });
      if (evidence[end].date !== undefined && !isCalendarDate(evidence[end].date))
        return refuse("NO_EVIDENCE", `the evidence for ${end} states a date that is not a calendar day`, { end });
    }
    const earned = this.#earn(basis, a, b, hasEvidence ? evidence : {});
    if (earned.failed)
      return refuse("IDENTITY_GRADE_UNEARNED", `a ${basis} claim earns grade ${BASIS_GRADE[basis]} only when ${earned.failed}; nothing was written`,
                    { condition: earned.failed, basis });
    const grade = BASIS_GRADE[basis];
    const dates = hasEvidence ? [evidence.a?.date, evidence.b?.date].filter((d) => isCalendarDate(d)).sort() : [];
    const [vf, vt] = dates.length === 2 ? dates : [null, null];
    const sentence = People.#why(kind, grade, earned.because);
    const at = this.#now();
    const stamp = by == null ? null : String(by);
    const out = this.#record.transact(() => {
      const r = this.#record.allocId("IDC", at.slice(0, 4));
      if (!r || r.ok === false) return r;
      this.#sql.exec(`INSERT INTO identity_claims (claim_id,a,b,kind,basis,grade,why,evidence_json,note,project,valid_from,valid_to,by_actor,at)
                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, r.id, a, b, kind, basis, grade, sentence,
                     hasEvidence ? JSON.stringify(evidence) : null, why, filled(project) ? project : null, vf, vt, stamp, at);
      this.#rebuildCluster();
      return { ok: true, claim_id: r.id, kind, grade, why: sentence, at };
    });
    return out;
  }

  /* R2 (K1488): Civicsmith's sentence, "claimed the same person, grade B, because ...", never "is the same person". */
  static #why(kind, grade, because) {
    const said = kind === "same_as" ? "claimed the same person" : kind === "not_same_as" ? "claimed not the same person"
      : "claimed unsure whether the same person";
    return `${said}, grade ${grade}, because ${because}`;
  }

  /* R2: the grade's condition, met (`because`) or failed (`failed`, naming the condition). */
  #earn(basis, a, b, ev) {
    if (basis === "testimony") return { because: "a member testified to it in their own words" };
    const shared = this.#sharingName(a).get(b);
    if (basis === "name") {
      if (!shared) return { failed: "the two records share a name" };
      return { because: `both records carry the name '${shared}'` };
    }
    const dA = ev.a && ev.a.date, dB = ev.b && ev.b.date;
    if (!isCalendarDate(dA)) return { failed: "the evidence states the date of a's cited record" };
    if (!isCalendarDate(dB)) return { failed: "the evidence states the date of b's cited record" };
    if (basis === "identifier") {
      const want = isObj(ev.identifier) && filled(ev.identifier.scheme) && filled(ev.identifier.id) ? ev.identifier : null;
      if (!want) return { failed: "the evidence names the scheme identifier both records hold" };
      const norm = String(want.id).trim().toLowerCase();
      for (const [id, end, day] of [[a, "a", dA], [b, "b", dB]]) {
        const held = this.#identifiers(id).find((x) => x.scheme === want.scheme && x.normal === norm);
        if (!held) return { failed: `${end} holds the scheme identifier ${want.scheme} ${want.id}` };
        if (held.valid && People.#judge(held.valid, day) !== "in")
          return { failed: `the identifier ${want.scheme} ${want.id} is valid on ${end} at its record's date ${day}` };
      }
      return { because: `both records hold the identifier ${want.scheme} ${want.id}, valid at ${dA} and ${dB}` };
    }
    /* corroborated_name: a shared name and the same cited line (the same post, licence, filer or credential) held by
       each, valid at its record's date (civil-time.validAt). */
    if (!shared) return { failed: "the two records share a name" };
    const ls = isObj(ev.lines) ? ev.lines : null;
    if (!ls || !filled(ls.a) || !filled(ls.b)) return { failed: "the evidence names the cited line held by each record (lines: {a, b})" };
    const read = (id) => { try { const r = this.#lines.readLine({ lineId: id, viewer: MACHINE_VIEWER }); return r && r.found ? r.line ?? r : null; } catch { return null; } };
    const la = read(ls.a), lb = read(ls.b);
    if (!la || la.withdrawn) return { failed: `the line ${ls.a} is held and not withdrawn` };
    if (!lb || lb.withdrawn) return { failed: `the line ${ls.b} is held and not withdrawn` };
    const otherOf = (l, p) => (lineFrom(l) === p ? lineTo(l) : lineTo(l) === p ? lineFrom(l) : undefined);
    const oa = otherOf(la, a), ob = otherOf(lb, b);
    if (oa === undefined) return { failed: `the line ${ls.a} has a at one end` };
    if (ob === undefined) return { failed: `the line ${ls.b} has b at one end` };
    if (la.kind !== lb.kind || oa !== ob) return { failed: "the two lines are the same fact: one kind, to the same entity" };
    if (People.#judge(la.valid, dA, People.#through(la)) !== "in") return { failed: `the line ${ls.a} is valid at a's record date ${dA}` };
    if (People.#judge(lb.valid, dB, People.#through(lb)) !== "in") return { failed: `the line ${ls.b} is valid at b's record date ${dB}` };
    return { because: `both records carry the name '${shared}' and each holds a ${la.kind} line to ${oa} at its record's date (${dA}, ${dB})` };
  }

  /** R4: a claim withdrawn, never edited or deleted; it links nothing after. No entities row moves (R28). */
  withdrawIdentityClaim({ claimId, reason, by = null } = {}) {
    const why = clean(reason);
    if (!why) return refuse("NO_REASON", "a withdrawal says why the claim was wrong; it is kept beside the claim");
    const c = filled(claimId) ? this.#one(`SELECT claim_id, withdrawn_by, withdrawn_at, withdrawn_reason FROM identity_claims WHERE claim_id=?`, claimId) : null;
    if (!c) return refuse("NO_SUCH_CLAIM", "no identity claim with that id is held", { claim_id: claimId ?? null });
    if (c.withdrawn_at)
      return { ok: true, already: true, claim_id: claimId, withdrawn: { by: c.withdrawn_by, at: c.withdrawn_at, reason: c.withdrawn_reason } };
    const at = this.#now(), stamp = by == null ? null : String(by);
    return this.#record.transact(() => {
      this.#sql.exec(`UPDATE identity_claims SET withdrawn_by=?, withdrawn_at=?, withdrawn_reason=? WHERE claim_id=?`, stamp, at, why, claimId);
      this.#rebuildCluster();
      return { ok: true, claim_id: claimId, withdrawn: { by: stamp, at, reason: why } };
    });
  }

  /* ===================================================================== *
   * THE IDENTITY CLUSTER (R5, R6). Derived from the unwithdrawn same_as claims, cached under record-core's
   * derived-cache convention, read fail-closed.
   * ===================================================================== */

  /* R6: the cache's rows from the claims they derive from: every person an unwithdrawn claim names, with the least id
     of its same_as component. */
  #clusterRows() {
    const parent = new Map();
    const find = (x) => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x); } return x; };
    const add = (x) => { if (!parent.has(x)) parent.set(x, x); };
    for (const c of this.#rows(`SELECT a, b, kind FROM identity_claims WHERE withdrawn_at IS NULL`)) {
      add(c.a); add(c.b);
      if (c.kind === "same_as") {
        const ra = find(c.a), rb = find(c.b);
        if (ra !== rb) { if (ra < rb) parent.set(rb, ra); else parent.set(ra, rb); }
      }
    }
    /* Roots are joined smaller-first, so each component's root is its least id. */
    return [...parent.keys()].sort().map((x) => ({ entity_id: x, component: find(x) }));
  }
  #rebuildCluster() { return this.#record.rebuildDerived(MODULE, CLUSTER_TABLE, null); }

  /* R5, R6: the cluster `entityId` sits in, as `viewer` sees it. Fail-closed: a stale or missing cache row, or one whose
     component differs from the claims' own, answers `undetermined` with why, never a stale cluster. */
  #cluster(entityId, viewer) {
    const alone = (state, why = null) => ({ state, ...(why ? { why } : {}), members: [entityId], links: [], unsure: [],
                                            not_same_as: [], truncated: false });
    if (!this.#one(`SELECT 1 AS x FROM identity_claims WHERE (a=? OR b=?) AND withdrawn_at IS NULL LIMIT 1`, entityId, entityId))
      return alone("linked");
    const held = this.#record.readDerived(MODULE, CLUSTER_TABLE, entityId);
    if (!held || held.stale) return alone("undetermined", "the identity cluster's cache is stale or missing, so no cluster is answered until it is rebuilt");
    const cached = new Set(this.#rows(`SELECT entity_id FROM identity_cluster WHERE component=?`, held.row.component).map((r) => r.entity_id));
    const live = new Set([entityId]);
    for (let frontier = [entityId]; frontier.length;) {
      const next = [];
      for (const x of frontier)
        for (const c of this.#rows(`SELECT a, b FROM identity_claims WHERE (a=? OR b=?) AND kind='same_as' AND withdrawn_at IS NULL`, x, x))
          for (const y of [c.a, c.b]) if (!live.has(y)) { live.add(y); next.push(y); }
      frontier = next;
    }
    const sameAs = cached.size === live.size && [...live].every((x) => cached.has(x));
    if (!sameAs) return alone("undetermined", "the identity cluster's cache differs from its rebuild, so no cluster is answered until it is rebuilt");
    /* The viewer's own component: only the claims it may see join (R31), bounded (R5). */
    const seen = (c) => this.#seesProject(c.project, viewer);
    const members = new Set([entityId]), links = [], claimIds = new Set();
    let truncated = false;
    for (let frontier = [entityId]; frontier.length && !truncated;) {
      const next = [];
      for (const x of frontier) {
        const rows = this.#rows(`SELECT * FROM identity_claims WHERE (a=? OR b=?) AND kind='same_as' AND withdrawn_at IS NULL
                                 ORDER BY claim_id`, x, x).filter(seen);
        for (const c of rows) {
          if (claimIds.has(c.claim_id)) continue;
          if (claimIds.size >= CLUSTER_CLAIMS_MAX) { truncated = true; break; }
          claimIds.add(c.claim_id);
          links.push(People.#claimView(c));
          for (const y of [c.a, c.b]) {
            if (members.has(y)) continue;
            if (members.size >= CLUSTER_MEMBERS_MAX) { truncated = true; continue; }
            members.add(y); next.push(y);
          }
        }
        if (truncated) break;
      }
      frontier = next;
    }
    const ids = [...members].sort();
    const inside = (c) => members.has(c.a) && members.has(c.b);
    const touching = (kind) => {
      const out = [];
      for (const x of ids)
        for (const c of this.#rows(`SELECT * FROM identity_claims WHERE (a=? OR b=?) AND kind=? AND withdrawn_at IS NULL ORDER BY claim_id`, x, x, kind))
          if (seen(c) && !out.some((o) => o.claim_id === c.claim_id)) out.push(c);
      return out;
    };
    const apart = touching("not_same_as").filter(inside).map(People.#claimView);
    const unsure = touching("unsure").map(People.#claimView);
    return { state: apart.length ? "undetermined" : "linked",
             ...(apart.length ? { why: `a not_same_as claim (${apart.map((c) => c.claim_id).join(", ")}) joins two members of this component, so the cluster is undetermined` } : {}),
             members: ids, links, unsure, not_same_as: apart, truncated };
  }

  static #claimView(c) {
    return { claim_id: c.claim_id, a: c.a, b: c.b, kind: c.kind, basis: c.basis, grade: c.grade, why: c.why,
             evidence: c.evidence_json == null ? null : json(c.evidence_json), note: c.note, project: c.project ?? null,
             valid: { from: c.valid_from ?? null, to: c.valid_to ?? null }, by: c.by_actor, at: c.at,
             withdrawn: c.withdrawn_at ? { by: c.withdrawn_by, at: c.withdrawn_at, reason: c.withdrawn_reason } : null };
  }

  /** R5. */
  identityOf({ entityId, viewer = null } = {}) {
    if (!filled(entityId)) return noEntity("an identity cluster is read for one person, by its entity id");
    if (this.#denied(viewer)) return People.#noViewer();
    if (!this.#entities.has(entityId)) return { ok: true, found: false, entity_id: entityId };
    const c = this.#cluster(entityId, viewer);
    return { ok: true, found: true, entity_id: entityId, state: c.state, ...(c.why ? { why: c.why } : {}),
             members: c.members, links: c.links, unsure: c.unsure, not_same_as: c.not_same_as, truncated: c.truncated,
             limits: { members: CLUSTER_MEMBERS_MAX, claims: CLUSTER_CLAIMS_MAX },
             detail: "each link is a recorded claim with its grade and why; two records stay two ids, linked and never merged" };
  }

  /* R13: the members a read gathers over, as the viewer sees the cluster; an undetermined cluster joins nothing. */
  #over(entityId, viewer) {
    const c = this.#cluster(entityId, viewer);
    const members = c.state === "linked" ? c.members : [entityId];
    return { cluster: { state: c.state, ...(c.why ? { why: c.why } : {}), members: c.members, truncated: c.truncated }, members };
  }

  /* ===================================================================== *
   * CANDIDATES (R7, R8; D167). Explained field by field; no probability, score or rank.
   * ===================================================================== */

  /** R7. */
  samePersonCandidates({ entityId, limit = CANDIDATES_DEFAULT, viewer = null } = {}) {
    if (!filled(entityId)) return noEntity("candidates are read for one person, by its entity id");
    if (this.#denied(viewer)) return People.#noViewer();
    const bad = this.#personRefusal(entityId);
    if (bad) return bad;
    const cap = Math.max(1, Math.min(Math.floor(Number(limit)) || CANDIDATES_DEFAULT, CANDIDATES_MAX));
    const found = new Set(this.#sharingName(entityId).keys());
    for (const idf of this.#identifiers(entityId)) {
      let r;
      try { r = typeof this.#entities.entityByIdentifier === "function" ? this.#entities.entityByIdentifier({ scheme: idf.scheme, id: idf.id }) : null; }
      catch { r = null; }
      /* entities R44: one holder, or `undetermined` with every candidate holding it; each is a candidate here */
      const others = isObj(r) && Array.isArray(r.candidates) ? r.candidates
        : [isObj(r) ? r.entity_id ?? (isObj(r.entity) ? r.entity.entity_id : null) : typeof r === "string" ? r : null];
      for (const other of others)
        if (filled(other) && other !== entityId) { const e = this.#entity(other); if (e && e.kind === "person") found.add(other); }
    }
    const ids = [...found].sort();
    const mine = this.#profile(entityId, viewer);
    const candidates = ids.slice(0, cap).map((id) => ({ entity_id: id, fields: People.#compareProfiles(mine, this.#profile(id, viewer)) }));
    return { ok: true, entity_id: entityId, count: candidates.length, candidates, limit: cap, truncated: ids.length > cap,
             detail: "candidates are not claims: each shares a name or an identifier with this person, and each field is "
               + "compared as the record holds it (agrees, differs or absent), with the rows compared. Nothing is scored, "
               + "ranked or written; a claim is a member's act (op=identityclaim)." };
  }

  /* R7: what a person's record holds for the comparison: names, identifiers, posts and life facts. */
  #profile(id, viewer) {
    const posts = listOf(this.#lines ? this.#lines.linesOf({ entity: id, kinds: ["holds"], direction: "from", limit: READ_LIST_MAX, viewer }) : null)
      .filter((l) => !l.withdrawn).map((l) => ({ line_id: lineId(l), to: lineTo(l) }));
    const life = this.#rows(`SELECT fact_id, kind, value, capture_sha FROM person_facts WHERE person=? AND kind IN ('birth','death')
                             AND withdrawn_at IS NULL ORDER BY fact_id`, id).filter((f) => this.#seesCapture(f.capture_sha, viewer));
    return { names: this.#names(id), identifiers: this.#identifiers(id), posts, life };
  }
  static #compareProfiles(p, q) {
    const fold = (s) => String(s).trim().replace(/\s+/g, " ").toLowerCase();
    const field = (agree, differ, any, rows) => ({ state: !any ? "absent" : differ ? "differs" : agree ? "agrees" : "differs", rows });
    const pn = new Set(p.names.map(fold)), qn = q.names.map(fold);
    const names = field(qn.some((n) => pn.has(n)), false, p.names.length && q.names.length, { this: p.names, candidate: q.names });
    const common = p.identifiers.filter((x) => q.identifiers.some((y) => y.scheme === x.scheme));
    const idAgree = common.some((x) => q.identifiers.some((y) => y.scheme === x.scheme && y.normal === x.normal));
    const idDiffer = common.some((x) => !q.identifiers.some((y) => y.scheme === x.scheme && y.normal === x.normal));
    const identifiers = field(idAgree, idDiffer, common.length > 0, { this: p.identifiers, candidate: q.identifiers });
    const pTo = new Set(p.posts.map((l) => l.to));
    const posts = field(q.posts.some((l) => pTo.has(l.to)), false, p.posts.length && q.posts.length, { this: p.posts, candidate: q.posts });
    const lifeOf = (kind) => {
      const a = p.life.filter((f) => f.kind === kind), b = q.life.filter((f) => f.kind === kind);
      const agree = a.some((x) => b.some((y) => fold(y.value) === fold(x.value)));
      return { agree, differ: a.length && b.length && !agree, any: a.length && b.length };
    };
    const lb = lifeOf("birth"), ld = lifeOf("death");
    const life = field(lb.agree || ld.agree, lb.differ || ld.differ, lb.any || ld.any, { this: p.life, candidate: q.life });
    return { names, identifiers, posts, life };
  }

  /** R8: whether every compared field of a candidate agrees (the M-P6 measure's numerator and denominator). */
  static agreesEverywhere(candidate) {
    return isObj(candidate) && isObj(candidate.fields) && Object.values(candidate.fields).every((f) => f.state === "agrees");
  }

  /* ===================================================================== *
   * PERSON FACTS (R9–R12)
   * ===================================================================== */

  /** R9, R10. */
  recordPersonFact({ person, kind, value, valid, citation, by = null } = {}) {
    if (!filled(person)) return noSuchEntity(person ?? null);
    const bad = this.#personRefusal(person);
    if (bad) return bad;
    if (!FACT_KINDS.includes(kind)) return refuse("UNKNOWN_FACT_KIND", `a person fact is one of ${FACT_KINDS.join(", ")}`, { kinds: [...FACT_KINDS] });
    const contact = CONTACT_KINDS.includes(kind);
    /* R10 (K1485 row 9, K1493): an address or contact enters only by a member's act, never an import. */
    if (contact && (isMachineIdentity(by) || !memberOf(by)))
      return refuse("CONTACT_NOT_IMPORTED", "an address or contact is recorded only by a member's own act from a cited document; "
        + "the machine never imports one");
    const v = clean(value, 400);
    if (!v) return refuse("NO_VALUE", "a person fact carries its value as the cited document states it");
    const cite = this.#citationRefusal(citation, "a person fact");
    if (cite) return refuse(cite.reason, cite.detail, cite.code ? { code: cite.code, check: cite.check, translation: cite.translation } : {});
    const vv = People.#validity(valid);
    if (vv.refused) return refuse("BAD_VALIDITY", `the validity's ${vv.refused} is refused: ${vv.why}`, { bound: vv.refused });
    const at = this.#now(), stamp = by == null ? null : String(by);
    const table = contact ? "person_contacts" : "person_facts";
    return this.#record.transact(() => {
      const r = this.#record.allocId("PFA", at.slice(0, 4));
      if (!r || r.ok === false) return r;
      this.#sql.exec(`INSERT INTO ${table} (fact_id,person,kind,value,valid_json,capture_sha,extent_json,by_actor,at)
                      VALUES (?,?,?,?,?,?,?,?,?)`, r.id, person, kind, v, JSON.stringify(vv.valid), citation.captureSha,
                     JSON.stringify(citation.extent), stamp, at);
      return { ok: true, fact_id: r.id, person, kind, value: v, valid: vv.valid, at, ...(contact ? { publishable: false } : {}) };
    });
  }

  /** R11 (DEC-19): a wrong fact corrected forward: kept, marked withdrawn with who, when and why. */
  withdrawPersonFact({ factId, reason, by = null } = {}) {
    const why = clean(reason);
    if (!why) return refuse("NO_REASON", "a withdrawal says why the fact was wrong; it is kept beside the fact");
    const table = this.#factTable(factId);
    if (!table) return refuse("NO_SUCH_FACT", "no person fact with that id is held", { fact_id: factId ?? null });
    const f = this.#one(`SELECT * FROM ${table} WHERE fact_id=?`, factId);
    if (f.withdrawn_at)
      return { ok: true, already: true, fact_id: factId, withdrawn: { by: f.withdrawn_by, at: f.withdrawn_at, reason: f.withdrawn_reason } };
    const at = this.#now(), stamp = by == null ? null : String(by);
    this.#sql.exec(`UPDATE ${table} SET withdrawn_by=?, withdrawn_at=?, withdrawn_reason=? WHERE fact_id=?`, stamp, at, why, factId);
    return { ok: true, fact_id: factId, withdrawn: { by: stamp, at, reason: why } };
  }
  #factTable(factId) {
    if (!filled(factId)) return null;
    for (const t of ["person_facts", "person_contacts"]) if (this.#one(`SELECT 1 AS x FROM ${t} WHERE fact_id=?`, factId)) return t;
    return null;
  }
  #factView(f, contact) {
    return { fact_id: f.fact_id, member: f.person, kind: f.kind, value: f.value, valid: json(f.valid_json),
             citation: { captureSha: f.capture_sha, extent: json(f.extent_json) }, grade: this.#captureGrade(f.capture_sha),
             by: f.by_actor, at: f.at, withdrawn: f.withdrawn_at ? { by: f.withdrawn_by, at: f.withdrawn_at, reason: f.withdrawn_reason } : null,
             ...(contact ? { publishable: false } : {}) };
  }
  /* R9, R10, R31: a person's unwithdrawn facts the viewer may see (each follows its citing capture). */
  #factsOf(person, viewer) {
    const out = [];
    for (const [table, contact] of [["person_facts", false], ["person_contacts", true]])
      for (const f of this.#rows(`SELECT * FROM ${table} WHERE person=? AND withdrawn_at IS NULL ORDER BY at, fact_id`, person))
        if (this.#seesCapture(f.capture_sha, viewer)) out.push(this.#factView(f, contact));
    return out;
  }

  /** R12 (K1493; record-core R79): a value removed, leaving a tombstone, only on the grounds K1493 lists and only by an
   *  administrator. Any other wish to correct is a withdrawal (R11). */
  expunge({ id, ground, demandKind = null, order = null, reason, by = null } = {}) {
    const who = memberOf(by);
    if (!who || !this.#isAdmin(who)) return notAnAdmin(by ?? null, "removing a person fact, claim, tie or source link");
    if (!EXPUNGE_GROUNDS.includes(ground) || (ground === "court_order" && !filled(order)))
      return refuse("EXPUNGE_GROUND_REFUSED", `a value is removed only as unlawful to hold, confidential, under a recorded court `
        + `order (naming it) or under a lawful demand the jurisdiction lists; anything else is corrected forward by withdrawing it `
        + `(op=personfactwithdraw, op=identitywithdraw, op=membertiewithdraw)`, { grounds: [...EXPUNGE_GROUNDS], correction: "withdraw" });
    if (ground === "lawful_demand") {
      const kinds = (Array.isArray(this.#view().lawful_demands) ? this.#view().lawful_demands : []).map((d) => d && d.kind).filter(filled);
      if (!kinds.includes(demandKind))
        return refuse("DEMAND_KIND_UNLISTED", `the active jurisdiction profiles list no lawful demand of that kind; they list `
          + `${kinds.length ? kinds.join(", ") : "none"}`, { demand_kinds: kinds });
    }
    const why = clean(reason);
    if (!why) return refuse("NO_REASON", "a removal states its reason");
    const target = this.#expungeTarget(id);
    if (!target) return refuse("NO_SUCH_ITEM", "no person fact, identity claim, member tie or source link answers to that id", { id: id ?? null });
    return this.#record.transact(() => {
      const r = this.#record.expunge({ module: MODULE, table: target.table, key: target.key, ground,
                                       ...(ground === "court_order" ? { order } : {}), ...(ground === "lawful_demand" ? { demandKind } : {}), by: who });
      if (!r || r.ok === false) return r;
      if (target.table === "identity_claims") this.#rebuildCluster();
      return { ok: true, removed: r.removed, tombstone: r.tombstone, reason: why };
    });
  }
  #expungeTarget(id) {
    if (isObj(id) && filled(id.source) && filled(id.person)) {
      return this.#one(`SELECT 1 AS x FROM source_person_links WHERE source=? AND person=?`, id.source, id.person)
        ? { table: "source_person_links", key: { source: id.source, person: id.person } } : null;
    }
    if (!filled(id)) return null;
    const t = this.#factTable(id);
    if (t) return { table: t, key: { fact_id: id } };
    if (this.#one(`SELECT 1 AS x FROM identity_claims WHERE claim_id=?`, id)) return { table: "identity_claims", key: { claim_id: id } };
    if (this.#one(`SELECT 1 AS x FROM member_ties WHERE tie_id=?`, id)) return { table: "member_ties", key: { tie_id: id } };
    return null;
  }

  /* ===================================================================== *
   * THE READS (R13–R17), over the identity cluster, every list bounded.
   * ===================================================================== */

  /* The common opening of a read: the entity named, the viewer stamped, the person registered. */
  #readOpen(entityId, viewer, what) {
    if (!filled(entityId)) return { refusal: noEntity(`${what} is read for one person, by its entity id`) };
    if (this.#denied(viewer)) return { refusal: People.#noViewer() };
    if (!this.#entities.has(entityId)) return { refusal: { ok: true, found: false, entity_id: entityId } };
    return null;
  }
  /* A line as a read answers it, naming the cluster member it is held on (R13). */
  static #lineItem(l, member) {
    return { member, line_id: lineId(l), kind: l.kind, from: lineFrom(l), to: lineTo(l), capacity: l.capacity ?? null,
             title: l.title ?? l.as_written ?? null, valid: l.valid ?? null, grade: { assertion: l.assertion ?? null, ends: l.ends ?? null },
             citation: l.basis ?? null, ...(People.#through(l) ? { current_through: People.#through(l) } : {}) };
  }
  /* lines R21: the day an open-ended holds line is stated current through, as its owner answers it to this viewer. */
  static #through(l) { return isObj(l) && isObj(l.current_through) && filled(l.current_through.day) ? l.current_through.day : null; }
  /* Every unwithdrawn line of the members, of these kinds, from the member's end; `truncated` when an owner's list was cut. */
  #linesOver(members, kinds, viewer) {
    const items = [];
    let truncated = false;
    for (const m of members) {
      const r = this.#lines.linesOf({ entity: m, kinds, direction: "from", limit: READ_LIST_MAX, viewer });
      if (r && r.truncated) truncated = true;
      for (const l of listOf(r)) if (!l.withdrawn && kinds.includes(l.kind)) items.push(People.#lineItem(l, m));
    }
    return { items, truncated };
  }
  /* Items split by their validity at `at`: `in` answered, `undetermined` apart with why, `out` left out (R14). */
  static #atDate(items, at, validOf = (x) => x.valid) {
    const held = [], undetermined = [];
    for (const x of items) {
      const j = People.#judge(validOf(x), at, x.current_through ?? null);
      if (j === "in") held.push(x);
      else if (j !== "out") undetermined.push({ ...x, undetermined: { why: j.why } });
    }
    return { held, undetermined };
  }
  /* R15: validity order, earliest `from` first (civil-time.compare), unstated or unsettled last, then by id. */
  static #byValidity(items) {
    const fromOf = (x) => (isObj(x.valid) && typeof x.valid.from === "string" ? { value: x.valid.from, precision: x.valid.precision || "day", zone: x.valid.zone || "UTC" } : null);
    return [...items].sort((x, y) => {
      const a = fromOf(x), b = fromOf(y);
      if (a && b) { let c; try { c = compare(a, b); } catch { c = null; } if (c === "before") return -1; if (c === "after") return 1; }
      else if (a) return -1;
      else if (b) return 1;
      return String(x.line_id ?? x.fact_id ?? "").localeCompare(String(y.line_id ?? y.fact_id ?? ""));
    });
  }

  /** R13, R14. */
  personAt({ entityId, at, viewer = null } = {}) {
    const o = this.#readOpen(entityId, viewer, "a person as of a date");
    if (o) return o.refusal;
    if (at === undefined || at === null || at === "") return refuse("NO_DATE", "a person is read as of a date (at)");
    const { cluster, members } = this.#over(entityId, viewer);
    const names = members.flatMap((m) => this.#names(m).map((name) => ({ member: m, name, from: "registry" })));
    const facts = People.#atDate(members.flatMap((m) => this.#factsOf(m, viewer)), at);
    const posts = this.#linesOver(members, ["holds"], viewer);
    const postsAt = People.#atDate(posts.items, at);
    /* duties R7, R8: the person's duties as obligor, each with `in_force` at the date; a withdrawn duty or one not in
       force then binds nothing, and one whose in-force answer is not settled is listed undetermined with its reason */
    const duties = [], dutiesUnsettled = [];
    let dutiesTruncated = false;
    const day = typeof at === "string" ? at : isObj(at) && typeof at.value === "string" ? at.value : null;
    for (const m of members) {
      const r = this.#duties ? this.#duties.dutiesOf({ entity: m, as: "obligor", at: day, limit: READ_LIST_MAX, viewer }) : null;
      if (r && r.truncated) dutiesTruncated = true;
      for (const x of listOf(r)) {
        if (x.withdrawn) continue;
        const state = isObj(x.in_force) ? x.in_force.state : null;
        if (state === "not_in_force") continue;
        if (state === "in_force") duties.push({ member: m, ...x });
        else dutiesUnsettled.push({ member: m, ...x, undetermined: { why: isObj(x.in_force) && filled(x.in_force.why) ? x.in_force.why
          : "whether its source is in force at the date is not settled" } });
      }
    }
    const n = bounded(names), f = bounded(facts.held), p = bounded(postsAt.held, READ_LIST_MAX, posts.truncated);
    const d = bounded(duties, READ_LIST_MAX, dutiesTruncated);
    const u = bounded([...facts.undetermined, ...postsAt.undetermined, ...dutiesUnsettled]);
    return { ok: true, found: true, entity_id: entityId, at, cluster,
             names: n.items, facts: f.items, posts: p.items, duties: d.items, undetermined: u.items,
             truncated: { names: n.truncated, facts: f.truncated, posts: p.truncated, duties: d.truncated, undetermined: u.truncated },
             limit: READ_LIST_MAX,
             detail: "each item is cited, dated and graded, and names the cluster member it is held on; an item whose validity does "
               + "not settle the date is listed as undetermined, never as current" };
  }

  /** R13, R15: every holds line of the cluster, in and out of government, in validity order. */
  careerOf({ entityId, viewer = null } = {}) {
    const o = this.#readOpen(entityId, viewer, "a career");
    if (o) return o.refusal;
    const { cluster, members } = this.#over(entityId, viewer);
    const r = this.#linesOver(members, ["holds"], viewer);
    const c = bounded(People.#byValidity(r.items), READ_LIST_MAX, r.truncated);
    return { ok: true, found: true, entity_id: entityId, cluster, career: c.items, truncated: c.truncated, limit: READ_LIST_MAX };
  }

  /** R13, R15: education and credentials, each credential with its issuer's scheme identifier. */
  credentialsOf({ entityId, at = null, viewer = null } = {}) {
    const o = this.#readOpen(entityId, viewer, "a person's credentials");
    if (o) return o.refusal;
    const { cluster, members } = this.#over(entityId, viewer);
    const r = this.#linesOver(members, ["educated_at", "credentialed_by"], viewer);
    let items = r.items.map((l) => (l.kind === "credentialed_by" ? { ...l, issuer_identifiers: this.#identifiers(l.to) } : l));
    let undetermined = [];
    if (at !== null && at !== undefined && at !== "") { const s = People.#atDate(items, at); items = s.held; undetermined = s.undetermined; }
    const c = bounded(People.#byValidity(items), READ_LIST_MAX, r.truncated), u = bounded(undetermined);
    return { ok: true, found: true, entity_id: entityId, cluster, credentials: c.items, undetermined: u.items,
             truncated: { credentials: c.truncated, undetermined: u.truncated }, limit: READ_LIST_MAX };
  }

  /** R13, R15: interests held as lines, and the money where the person is payee of income or a gift, or payer of a
   *  contribution. Facts, never a total. */
  interestsOf({ entityId, at = null, viewer = null } = {}) {
    const o = this.#readOpen(entityId, viewer, "a person's interests");
    if (o) return o.refusal;
    const { cluster, members } = this.#over(entityId, viewer);
    const r = this.#linesOver(members, ["owns_interest_in"], viewer);
    let lines = r.items, undetermined = [];
    if (at !== null && at !== undefined && at !== "") { const s = People.#atDate(lines, at); lines = s.held; undetermined = s.undetermined; }
    const money = [];
    let moneyTruncated = false;
    for (const m of members) {
      const q = this.#money ? this.#money.moneyOf({ entity: m, kinds: ["income", "gift", "contribution"], limit: READ_LIST_MAX, viewer }) : null;
      if (q && q.truncated) moneyTruncated = true;
      for (const f of listOf(q)) {
        if (f.withdrawn) continue;
        const payee = partyEntity(f.to), payer = partyEntity(f.from);
        const side = (f.kind === "income" || f.kind === "gift") && payee === m ? "payee" : f.kind === "contribution" && payer === m ? "payer" : null;
        if (side) money.push({ member: m, side, fact_id: factIdOf(f), kind: f.kind, amount: f.amount ?? null, as_read: f.as_read ?? null,
                               currency: f.currency ?? null, period: f.period ?? null, from: f.from ?? null, to: f.to ?? null,
                               grade: f.grade ?? null, source: f.source ?? null, citation: f.citation ?? null });
      }
    }
    const l = bounded(People.#byValidity(lines), READ_LIST_MAX, r.truncated), mm = bounded(money, READ_LIST_MAX, moneyTruncated);
    const u = bounded(undetermined);
    return { ok: true, found: true, entity_id: entityId, cluster, interests: l.items, money: mm.items, undetermined: u.items,
             truncated: { interests: l.truncated, money: mm.truncated, undetermined: u.truncated }, limit: READ_LIST_MAX,
             detail: "facts as held, each cited; no total is computed" };
  }

  /** R13, R16: statements and acts (decider, signatory, implementer, author; K1465), merged in events' order,
   *  three-valued: two events whose order the record does not settle are answered as such, never placed. */
  statementsOf({ entityId, from = null, to = null, viewer = null } = {}) {
    const o = this.#readOpen(entityId, viewer, "a person's statements and acts");
    if (o) return o.refusal;
    const { cluster, members } = this.#over(entityId, viewer);
    const byId = new Map();
    let truncated = false;
    const put = (e, m, as) => {
      const id = eventId(e);
      if (!filled(id)) return;
      const held = byId.get(id) || { event_id: id, kind: e.kind ?? null, when: e.when ?? null, members: [], as: [] };
      if (!held.members.includes(m)) held.members.push(m);
      for (const r of as) if (!held.as.includes(r)) held.as.push(r);
      byId.set(id, held);
    };
    /* events R27, R33: placed events, and apart those placed nowhere (no `when`); both are the member's */
    const all = (r) => [...listOf(r), ...(r && Array.isArray(r.placed_nowhere) ? r.placed_nowhere : [])];
    for (const m of members) {
      const s = this.#events.statementsOf({ entity: m, from, to, limit: READ_LIST_MAX, viewer });
      if (s && s.truncated) truncated = true;
      for (const e of all(s)) put(e, m, ["statement"]);
      const acts = this.#events.eventsFor({ entity: m, from, to, limit: READ_LIST_MAX, viewer });
      if (acts && acts.truncated) truncated = true;
      for (const e of all(acts)) {
        const roles = roleNames(e.roles).filter((r) => STATEMENT_ROLES.includes(r));
        if (roles.length) put(e, m, roles);
      }
    }
    const items = [...byId.values()];
    const seq = (a, b) => { try { return this.#events.sequence({ a: a.event_id, b: b.event_id }); } catch (e) { return { undetermined: true, why: String((e && e.message) || e) }; } };
    const memo = new Map();
    const order = (a, b) => {
      const k = `${a.event_id}\u0000${b.event_id}`;
      if (!memo.has(k)) memo.set(k, seq(a, b));
      return memo.get(k);
    };
    items.sort((a, b) => {
      const s = order(a, b);
      const v = typeof s === "string" ? s : isObj(s) ? s.order ?? s.answer ?? null : null;
      if (v === "before") return -1;
      if (v === "after") return 1;
      return a.event_id.localeCompare(b.event_id);
    });
    const unsettled = [];
    for (let i = 1; i < items.length; i++) {
      const s = order(items[i - 1], items[i]);
      const v = typeof s === "string" ? s : isObj(s) ? s.order ?? s.answer ?? null : null;
      if (v !== "before" && v !== "after")
        unsettled.push({ a: items[i - 1].event_id, b: items[i].event_id, why: isObj(s) && filled(s.why) ? s.why : "the record does not settle their order" });
    }
    const b = bounded(items, READ_LIST_MAX, truncated);
    return { ok: true, found: true, entity_id: entityId, cluster, items: b.items, order_undetermined: unsettled.filter((u) =>
               b.items.some((x) => x.event_id === u.b)), truncated: b.truncated, limit: READ_LIST_MAX,
             detail: "listed in events' order where the record settles it; each pair in order_undetermined is not placed against the other" };
  }

  /* ===================================================================== *
   * STAFFING (R18, R19)
   * ===================================================================== */

  /** R19: one roster source per module, asked in the modules' total order. */
  registerRosterSource(module, source) { return People.#listen(this.#roster, module, source); }
  /** R25: told of each new gated-open result, once. */
  onCheckResult(module, fn) { return People.#listen(this.#onResult, module, fn); }
  static #listen(list, module, fn) {
    const refused = listenerRefusal(list, module, fn);
    if (refused) return refused;
    list.push({ module, fn, seq: list.length });
    const rank = (m) => { const i = MODULE_ORDER.indexOf(m); return i === -1 ? Infinity : i; };
    list.sort((a, b) => (rank(a.module) - rank(b.module)) || (a.seq - b.seq));
    return { ok: true };
  }

  /** R18: the persons holding a holds line to the organisation or its parts at `at`, and beside them each roster source's
   *  answer with its level. Roster rows are never copied into lines. */
  staffingAt({ organisation, at, viewer = null } = {}) {
    if (!filled(organisation)) return noEntity("staffing is read for one organisation, by its entity id");
    if (this.#denied(viewer)) return People.#noViewer();
    if (!this.#entities.has(organisation)) return noSuchEntity(organisation);
    if (at === undefined || at === null || at === "") return refuse("NO_DATE", "staffing is read as of a date (at)");
    const units = [organisation];
    const s = this.#lines.structureAt({ entity: organisation, at, kinds: ["part_of"], viewer });
    const parts = isObj(s) ? (Array.isArray(s.held) ? s.held : listOf(s)) : [];
    for (const l of parts) if (l.kind === "part_of" && lineTo(l) === organisation && filled(lineFrom(l)) && !units.includes(lineFrom(l))) units.push(lineFrom(l));
    const held = [], undetermined = [];
    let truncated = false;
    for (const u of units) {
      const r = this.#lines.linesOf({ entity: u, kinds: ["holds"], direction: "to", limit: READ_LIST_MAX, viewer });
      if (r && r.truncated) truncated = true;
      for (const l of listOf(r)) {
        if (l.withdrawn || l.kind !== "holds" || lineTo(l) !== u) continue;
        const j = People.#judge(l.valid, at, People.#through(l));
        const item = { unit: u, person: lineFrom(l), line_id: lineId(l), capacity: l.capacity ?? null, valid: l.valid ?? null,
                       grade: { assertion: l.assertion ?? null, ends: l.ends ?? null }, citation: l.basis ?? null };
        if (j === "in") held.push(item); else if (j !== "out") undetermined.push({ ...item, undetermined: { why: j.why } });
      }
    }
    const rosters = this.#roster.length ? this.#roster.map(({ module, fn }) => {
      try { return { source: module, level: `held as a table, read by ${module}`, answer: fn({ organisation, at, viewer }) }; }
      catch (e) { return { source: module, failed: true, level: `held as a table, read by ${module}`, error: String((e && e.message) || e).slice(0, 200) }; }
    }) : [{ source: null, level: "held as a table, not read" }];
    const h = bounded(held, READ_LIST_MAX, truncated), u = bounded(undetermined);
    return { ok: true, organisation, at, units, staff: h.items, undetermined: u.items, rosters,
             truncated: { staff: h.truncated, undetermined: u.truncated }, limit: READ_LIST_MAX };
  }

  /* ===================================================================== *
   * MEMBERS' TIES (R20; K1490)
   * ===================================================================== */

  /** R20: a member's own tie, by their own act; there is no field naming another member. */
  declareTie({ entity, kind, note, attribution, by = null } = {}) {
    const member = memberOf(by);
    if (!member) return refuse("MEMBER_ACT_ONLY", "a tie is declared by the member it is theirs, stamped from their session; the machine declares none");
    if (!filled(entity)) return noEntity("a tie names the registered entity it is to, by its id");
    if (!this.#entities.has(entity)) return noSuchEntity(entity);
    if (!TIE_KINDS.includes(kind)) return refuse("UNKNOWN_TIE_KIND", `a tie is one of ${TIE_KINDS.join(", ")}`, { kinds: [...TIE_KINDS] });
    const n = clean(note);
    if (!n) return refuse("NO_NOTE", "a tie carries a note in the member's own words");
    if (!ATTRIBUTION_LEVELS.includes(attribution))
      return refuse("UNKNOWN_ATTRIBUTION", `a tie's disclosure is at one of ${ATTRIBUTION_LEVELS.join(", ")}`, { levels: [...ATTRIBUTION_LEVELS] });
    const at = this.#now();
    return this.#record.transact(() => {
      const r = this.#record.allocId("MTI", at.slice(0, 4));
      if (!r || r.ok === false) return r;
      this.#sql.exec(`INSERT INTO member_ties (tie_id,member,entity,kind,note,attribution,at) VALUES (?,?,?,?,?,?,?)`,
                     r.id, member, entity, kind, n, attribution, at);
      return { ok: true, tie_id: r.id, member, entity, kind, attribution, at };
    });
  }

  /** R20: a tie withdrawn by its member (or an administrator); kept, marked withdrawn. Another's tie answers as absent. */
  withdrawTie({ tieId, reason, by = null } = {}) {
    const why = clean(reason);
    if (!why) return refuse("NO_REASON", "a withdrawal says why; it is kept beside the tie");
    const t = filled(tieId) ? this.#one(`SELECT * FROM member_ties WHERE tie_id=?`, tieId) : null;
    const who = memberOf(by);
    if (!t || !who || (t.member !== who && !this.#isAdmin(who))) return refuse("NO_SUCH_TIE", "no tie of yours answers to that id", { tie_id: tieId ?? null });
    if (t.withdrawn_at) return { ok: true, already: true, tie_id: tieId, withdrawn: { by: t.withdrawn_by, at: t.withdrawn_at, reason: t.withdrawn_reason } };
    const at = this.#now();
    this.#sql.exec(`UPDATE member_ties SET withdrawn_by=?, withdrawn_at=?, withdrawn_reason=? WHERE tie_id=?`, String(by), at, why, tieId);
    return { ok: true, tie_id: tieId, withdrawn: { by: String(by), at, reason: why } };
  }

  /* R20: may this viewer read `member`'s ties: that member, or an administrator. */
  #seesTies(member, viewer) {
    const v = viewerMember(viewer);
    return !!v && (v === member || this.#isAdmin(v));
  }
  static #tieView(t) {
    return { tie_id: t.tie_id, member: t.member, entity: t.entity, kind: t.kind, note: t.note, attribution: t.attribution, at: t.at,
             withdrawn: t.withdrawn_at ? { by: t.withdrawn_by, at: t.withdrawn_at, reason: t.withdrawn_reason } : null };
  }

  /** R20: a member's ties, to them and administrators; any other viewer is answered exactly as for no tie. */
  tiesOf({ member, viewer = null } = {}) {
    const m = filled(member) ? (member.startsWith("member:") ? member.slice(7) : member) : viewerMember(viewer);
    if (!filled(m) || !this.#seesTies(m, viewer)) return { ok: true, member: m ?? null, count: 0, ties: [] };
    const rows = this.#rows(`SELECT * FROM member_ties WHERE member=? ORDER BY at, tie_id LIMIT ?`, m, READ_LIST_MAX + 1);
    return { ok: true, member: m, count: Math.min(rows.length, READ_LIST_MAX), ties: rows.slice(0, READ_LIST_MAX).map(People.#tieView),
             truncated: rows.length > READ_LIST_MAX };
  }

  /** R20: for `case-disclosures`, the member's unwithdrawn ties to any of the entities, each with its attribution level. */
  tiesConcerning({ entities, member, viewer = null } = {}) {
    const m = filled(member) ? (member.startsWith("member:") ? member.slice(7) : member) : null;
    const want = Array.isArray(entities) ? entities.filter(filled) : [];
    if (!m || !this.#seesTies(m, viewer) || !want.length) return { ok: true, member: m, ties: [] };
    const ties = this.#rows(`SELECT * FROM member_ties WHERE member=? AND withdrawn_at IS NULL ORDER BY at, tie_id`, m)
      .filter((t) => want.includes(t.entity)).map(People.#tieView);
    return { ok: true, member: m, ties };
  }

  /* ===================================================================== *
   * THE PROTECTED SOURCE LINK (R21; DEC-78 item 5, K1484 row 18)
   * ===================================================================== */

  /** R21. */
  linkSourceToPerson({ source, person, evidence, sight, by = null } = {}) {
    if (!memberOf(by)) return refuse("MEMBER_ACT_ONLY", "a source is linked to a person only by a member's own act");
    if (!filled(source) || !this.#sourceHeld(source, by)) return refuse("NO_SUCH_SOURCE", "no source with that id is held", { source: source ?? null });
    const bad = this.#personRefusal(person);
    if (bad) return bad;
    const ev = clean(evidence);
    if (!ev) return refuse("NO_EVIDENCE", "a link from a source to a person carries its evidence");
    const list = Array.isArray(sight) ? [...new Set(sight.filter(filled).map((s) => (s.startsWith("member:") ? s.slice(7) : s)))] : [];
    if (!list.length) return refuse("NO_SIGHT_LIST", "a link from a source to a person names the members who may read it");
    const at = this.#now();
    this.#sql.exec(`INSERT INTO source_person_links (source,person,evidence,sight_json,by_actor,at) VALUES (?,?,?,?,?,?)
                    ON CONFLICT(source, person) DO UPDATE SET evidence=excluded.evidence, sight_json=excluded.sight_json,
                    by_actor=excluded.by_actor, at=excluded.at`, source, person, ev, JSON.stringify(list), String(by), at);
    return { ok: true, source, person, sight: list, at };
  }
  /* sources R9: a source the linking member may read (its own refusal answers alike for an absent one). */
  #sourceHeld(id, by) {
    try {
      if (!this.#sources || typeof this.#sources.rungOf !== "function") return false;
      const r = this.#sources.rungOf({ source: id, viewer: `member:${memberOf(by)}` });
      return !!r && r.ok !== false && r.reason !== "NO_SUCH_SOURCE";
    } catch { return false; }
  }

  /** R21: the links on a source or a person, to a listed member only; to anyone else exactly as if none were held. */
  sourceLinksOf({ source = null, person = null, viewer = null } = {}) {
    const v = viewerMember(viewer);
    const rows = filled(source) ? this.#rows(`SELECT * FROM source_person_links WHERE source=? ORDER BY person`, source)
      : filled(person) ? this.#rows(`SELECT * FROM source_person_links WHERE person=? ORDER BY source`, person) : [];
    const links = rows.filter((r) => !!v && (json(r.sight_json) || []).includes(v))
      .map((r) => ({ source: r.source, person: r.person, evidence: r.evidence, sight: json(r.sight_json), by: r.by_actor, at: r.at }));
    return { ok: true, count: links.length, links };
  }

  /* ===================================================================== *
   * INTEREST CHECKS (R22–R25; K1491, K1473). The hypothesis layer: never a fact, never stored on a person.
   * ===================================================================== */

  /** R22: a member's own check, a new check or a new version of one. */
  defineCheck({ name, condition, denominator, project = null, check = null, by = null } = {}) {
    const n = clean(name, 200);
    if (!n) return refuse("NO_NAME", "a check carries a name");
    const hyp = hypothesisNamed(name, condition, denominator);
    if (hyp) return refuse("HYPOTHESIS_NOT_A_FACT", `a check rests on held facts, never on a hypothesis (${hyp} is one)`, { hypothesis: hyp });
    const err = conditionError(condition);
    if (err) return refuse("BAD_CONDITION", err);
    const den = clean(denominator, 400);
    if (!den) return refuse("NO_DENOMINATOR", "a check names the set it counts against");
    if (filled(project) && !(this.#record.bundleInfo(project) && this.#record.bundleInfo(project).type === "project")) return noSuchProject(project);
    const machine = isMachineIdentity(by) ? 1 : 0;
    const at = this.#now(), stamp = by == null ? null : String(by);
    if (filled(check)) {
      const prior = this.#one(`SELECT MAX(version) AS v, MAX(machine) AS m FROM interest_checks WHERE check_id=?`, check);
      if (!prior || prior.v == null) return refuse("NO_SUCH_CHECK", "no check with that id is held", { check });
      const v = Number(prior.v) + 1;
      this.#sql.exec(`INSERT INTO interest_checks (check_id,version,name,condition_json,denominator,project,machine,by_actor,at)
                      VALUES (?,?,?,?,?,?,?,?,?)`, check, v, n, JSON.stringify(condition), den, filled(project) ? project : null,
                     Number(prior.m) ? 1 : machine, stamp, at);
      return { ok: true, check, version: v, at };
    }
    return this.#record.transact(() => {
      const r = this.#record.allocId("CHK", at.slice(0, 4));
      if (!r || r.ok === false) return r;
      this.#sql.exec(`INSERT INTO interest_checks (check_id,version,name,condition_json,denominator,project,machine,by_actor,at)
                      VALUES (?,1,?,?,?,?,?,?,?)`, r.id, n, JSON.stringify(condition), den, filled(project) ? project : null, machine, stamp, at);
      return { ok: true, check: r.id, version: 1, at };
    });
  }

  /** R22: any check switched off (or on again) in one project by a member of that project. */
  switchCheck({ check, project, on, by = null } = {}) {
    if (!filled(check) || !this.#one(`SELECT 1 AS x FROM interest_checks WHERE check_id=?`, check))
      return refuse("NO_SUCH_CHECK", "no check with that id is held", { check: check ?? null });
    const who = memberOf(by);
    if (!filled(project) || !who || !this.#membership.inSight(project, `member:${who}`)) return noSuchProject(project ?? null);
    if (typeof on !== "boolean") return refuse("NO_SWITCH", "a switch says on: true or on: false");
    const at = this.#now();
    this.#sql.exec(`INSERT INTO interest_check_switches (check_id,project,is_on,by_actor,at) VALUES (?,?,?,?,?)`, check, project, on ? 1 : 0, String(by), at);
    return { ok: true, check, project, on, at };
  }
  #onIn(check, project) {
    if (!filled(project)) return true;
    const r = this.#one(`SELECT is_on FROM interest_check_switches WHERE check_id=? AND project=? ORDER BY seq DESC LIMIT 1`, check, project);
    return !r || Number(r.is_on) === 1;
  }
  /* A check's latest version, the one evaluated. */
  #latest() {
    return this.#rows(`SELECT c.* FROM interest_checks c JOIN (SELECT check_id, MAX(version) AS v FROM interest_checks GROUP BY check_id) l
                        ON l.check_id = c.check_id AND l.v = c.version ORDER BY c.check_id`);
  }
  /* Switched on: off only where every project that has switched it has switched it off and it belongs to none. */
  #switchedOn(c) {
    if (filled(c.project)) return this.#onIn(c.check_id, c.project);
    const projects = this.#rows(`SELECT DISTINCT project FROM interest_check_switches WHERE check_id=?`, c.check_id).map((r) => r.project);
    return !projects.length || projects.some((p) => this.#onIn(c.check_id, p));
  }
  /* R24 (K1504; K1505 (8)): a machine check's version is open only past its gate; a member's check shows at once. */
  #gateOpen(c) {
    if (!Number(c.machine)) return true;
    const g = this.#one(`SELECT false_alarm_rate FROM interest_check_gates WHERE check_id=? AND version=?`, c.check_id, c.version);
    return !!g && Number(g.false_alarm_rate) <= GATE_RATE_MAX;
  }

  /* The readers a check's evaluation reads through. */
  #readers() {
    return { lines: this.#lines, events: this.#events, money: this.#money,
             sectorIs: (id, sector) => {
               const e = this.#entity(id);
               if (!e) return false;
               if (sector === "government" && e.kind === "office") return true;
               return e.sector === sector;
             } };
  }

  /** R23: every switched-on check over the held persons, within the budget, resuming where it stopped. A pass ends at
   *  the last person and records its denominator (the persons holding a fact of the first end); the next call starts a
   *  fresh pass, so a changed fact is evaluated again. A computation, never a model run; matches go to the checks' own
   *  result table with their derivation and denominator. */
  evaluateChecks({ budgetMs = 1000 } = {}) {
    const started = Date.now();
    const budget = Math.max(0, Number(budgetMs) || 0);
    const readers = this.#readers();
    let evaluated = 0, remaining = false;
    for (const c of this.#latest()) {
      if (!this.#switchedOn(c)) continue;
      const condition = json(c.condition_json);
      if (conditionError(condition)) continue;
      const cur = this.#one(`SELECT after, base, done_base FROM interest_check_cursor WHERE check_id=? AND version=?`, c.check_id, c.version);
      let after = cur ? cur.after : "", base = cur ? Number(cur.base) : 0;
      const doneBase = cur && cur.done_base != null ? Number(cur.done_base) : null;
      const save = (a, b, done) => this.#sql.exec(`INSERT INTO interest_check_cursor (check_id,version,after,base,done_base) VALUES (?,?,?,?,?)
                        ON CONFLICT(check_id, version) DO UPDATE SET after=excluded.after, base=excluded.base, done_base=excluded.done_base`,
                        c.check_id, c.version, a, b, done);
      for (;;) {
        if (evaluated > 0 && Date.now() - started >= budget) { remaining = true; break; }
        const next = this.#one(`SELECT entity_id FROM entities WHERE entity_id > ? ORDER BY entity_id LIMIT 1`, after);
        if (!next) { save("", 0, base); break; }
        after = next.entity_id;
        const e = this.#entity(after);
        if (e && e.kind === "person") {
          const r = evaluatePerson(readers, after, condition, MACHINE_VIEWER);
          if (r.has) base++;
          for (const m of r.matches) this.#recordResult(c, m);
          evaluated++;
        }
        save(after, base, doneBase);
      }
      if (remaining) break;
    }
    return { ok: true, evaluated, remaining };
  }

  #recordResult(c, m) {
    const derivation = { check: c.check_id, version: Number(c.version), ...m.derivation, rows: m.rows };
    const id = sha256HexSync(canonicalJson({ check: c.check_id, version: Number(c.version), rows: m.rows }));
    if (this.#one(`SELECT 1 AS x FROM interest_check_results WHERE result_id=?`, id)) return;
    this.#sql.exec(`INSERT INTO interest_check_results (result_id,check_id,version,project,derivation_json,denominator,told,at)
                    VALUES (?,?,?,?,?,?,0,?)`, id, c.check_id, Number(c.version), c.project ?? null, JSON.stringify(derivation), c.denominator, this.#now());
    if (this.#gateOpen(c)) this.#tell(c, id);
  }
  /* R23: a result's denominator: the set it counts against, and its size over the last completed pass (null before one
     completes, never a partial count shown as whole). */
  #denominator(r) {
    const cur = this.#one(`SELECT done_base FROM interest_check_cursor WHERE check_id=? AND version=?`, r.check_id, Number(r.version));
    return { label: r.denominator, counted: cur && cur.done_base != null ? Number(cur.done_base) : null };
  }
  /* R25: each listener told once of a gated-open result. */
  #tell(c, resultId) {
    const r = this.#one(`SELECT * FROM interest_check_results WHERE result_id=? AND told=0`, resultId);
    if (!r) return;
    this.#sql.exec(`UPDATE interest_check_results SET told=1 WHERE result_id=?`, resultId);
    const result = this.#resultView(r, c);
    for (const l of this.#onResult) { try { l.fn({ result }); } catch { /* a listener's failure never undoes the result */ } }
  }
  #resultView(r, c) {
    return { result_id: r.result_id, check: r.check_id, version: Number(r.version), name: c.name, project: r.project ?? null,
             derivation: json(r.derivation_json), denominator: this.#denominator(r), at: r.at,
             by: "the machine's", layer: "hypothesis", label: "Noticed",
             detail: "Noticed by a check: a pattern in held facts, worth a look. It is not a finding and says nothing about anyone." };
  }

  /** R24: a machine check version's gate, by an administrator: its gold set and measured false-alarm rate. */
  recordCheckGate({ check, version, goldSet, falseAlarmRate, by = null } = {}) {
    const who = memberOf(by);
    if (!who || !this.#isAdmin(who)) return notAnAdmin(by ?? null, "recording a check's measured gate");
    const c = filled(check) ? this.#one(`SELECT * FROM interest_checks WHERE check_id=? AND version=?`, check, Number(version)) : null;
    if (!c) return refuse("NO_SUCH_CHECK", "no check version with that id is held", { check: check ?? null, version: version ?? null });
    const gold = clean(goldSet);
    if (!gold) return refuse("NO_GOLD_SET", "a gate names the gold set the false-alarm rate was measured on");
    const rate = Number(falseAlarmRate);
    if (falseAlarmRate === null || falseAlarmRate === "" || !Number.isFinite(rate) || rate < 0 || rate > 1)
      return refuse("BAD_RATE", "a false-alarm rate is a number from 0 to 1");
    const at = this.#now();
    this.#sql.exec(`INSERT INTO interest_check_gates (check_id,version,gold_set,false_alarm_rate,by_actor,at) VALUES (?,?,?,?,?,?)
                    ON CONFLICT(check_id, version) DO UPDATE SET gold_set=excluded.gold_set, false_alarm_rate=excluded.false_alarm_rate,
                    by_actor=excluded.by_actor, at=excluded.at`, check, Number(version), gold, rate, String(by), at);
    const open = this.#gateOpen(c);
    if (open) for (const r of this.#rows(`SELECT result_id FROM interest_check_results WHERE check_id=? AND version=? AND told=0`, check, Number(version)))
      this.#tell(c, r.result_id);
    return { ok: true, check, version: Number(version), false_alarm_rate: rate, open, at };
  }

  /** R24, R25: a check version's results once open, each the machine's, "Noticed", in the hypothesis layer. A result
   *  resting on any row the viewer may not see is withheld whole and not counted. */
  checkResults({ project = null, check = null, viewer = null } = {}) {
    if (this.#denied(viewer)) return People.#noViewer();
    if (filled(project) && !this.#seesProject(project, viewer)) return { ok: true, checks: [] };
    const checks = this.#latest().filter((c) => (!filled(check) || c.check_id === check) && this.#seesProject(c.project, viewer)
      && (!filled(project) || this.#onIn(c.check_id, project)));
    const out = checks.map((c) => {
      const head = { check: c.check_id, version: Number(c.version), name: c.name, machine: !!Number(c.machine), denominator: c.denominator };
      if (!this.#gateOpen(c)) return { ...head, gated: true, reason: `this check's false-alarm rate is not yet measured at or below ${GATE_RATE_MAX * 100}% on a gold set, so its results are not shown` };
      const results = [];
      let truncated = false;
      for (const r of this.#rows(`SELECT * FROM interest_check_results WHERE check_id=? AND version=? ORDER BY result_id`, c.check_id, Number(c.version))) {
        if (!this.#seesProject(r.project, viewer)) continue;
        const d = json(r.derivation_json);
        const rows = isObj(d) && Array.isArray(d.rows) ? d.rows : [];
        if (!rows.every((row) => this.#rowVisible(row, viewer))) continue;
        if (results.length >= READ_LIST_MAX) { truncated = true; break; }
        results.push(this.#resultView(r, c));
      }
      return { ...head, gated: false, results, count: results.length, truncated };
    });
    return { ok: true, checks: out };
  }

  /** R22: the checks with their versions, for the switch and the gate. */
  listChecks({ viewer = null } = {}) {
    if (this.#denied(viewer)) return People.#noViewer();
    return { ok: true, checks: this.#rows(`SELECT * FROM interest_checks ORDER BY check_id, version`).filter((c) => this.#seesProject(c.project, viewer))
      .map((c) => ({ check: c.check_id, version: Number(c.version), name: c.name, condition: json(c.condition_json), denominator: c.denominator,
                     project: c.project ?? null, machine: !!Number(c.machine), by: c.by_actor, at: c.at, open: this.#gateOpen(c) })) };
  }

  /* ===================================================================== *
   * THE CONNECTION OWNER (R26; connection-grammar R2, R6–R9)
   * ===================================================================== */

  /* R26: a registry the caller hands in (a test's own) takes this instance directly; the default registry's entry is
     made once at load (below) and reads through `host`. */
  #registerOwner(isDefault) {
    live.add(new WeakRef(this));
    if (isDefault) return;
    this.#registry.registerOwner({ owner: MODULE, kinds: IDENTITY_KIND_WORDS.map((k) => ({ ...k })), neighbours: (args) => this.neighbours(args) });
  }

  /** R26 (K1563 (1)): the instance a load-time registration reads through: the one for `host` when the walk passes it,
   *  else the isolate's one instance, else none (`OWNER_HOST_AMBIGUOUS`). */
  static forHost(host) {
    if (host) {
      const storage = host.storage ? host.storage : host;
      return instances.get(storage) || null;
    }
    const alive = [];
    for (const r of live) { const p = r.deref(); if (p) alive.push(p); else live.delete(r); }
    return alive.length === 1 ? alive[0] : null;
  }

  /** R26: each visible, unwithdrawn claim on `node` as one hop in connection-grammar's shape, evidentiary, its evidence
   *  and grade the claim's. */
  neighbours({ node, kinds = null, at, page = null, viewer, scope = null, host: _host = null } = {}) {
    if (viewer === undefined || viewer === null || viewer === "")
      return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
    const want = Array.isArray(kinds) ? kinds.filter((k) => CLAIM_KINDS.includes(k)) : [...CLAIM_KINDS];
    if (!filled(node) || this.#denied(viewer) || !want.length) return { items: [] };
    const rows = this.#rows(`SELECT * FROM identity_claims WHERE (a=? OR b=?) AND withdrawn_at IS NULL ORDER BY claim_id`, node, node)
      .filter((c) => want.includes(c.kind) && this.#seesProject(c.project, viewer));
    const items = [];
    for (const c of rows) {
      const valid = { from: c.valid_from ?? null, to: c.valid_to ?? null, precision: "day", zone: "UTC" };
      const j = People.#judge(valid, at);
      if (j === "out") continue;
      const ev = json(c.evidence_json) || {};
      const cited = ["a", "b"].filter((e) => isObj(ev[e]) && filled(ev[e].captureSha))
        .map((e) => ({ source: ev[e].captureSha, extent: ev[e].extent ?? null, end: e }));
      const evidence = cited.length ? cited : [{ source: `testimony:${c.by_actor ?? "a member"}`, statement: c.note }];
      items.push({ id: c.claim_id, from: c.a, to: c.b, kind: c.kind, owner: MODULE, valid, evidence,
                   grade: { assertion: c.grade, ends: [c.grade, c.grade] }, derived: null, why: c.why,
                   ...(j === "in" ? {} : { undetermined: { why: j.why } }) });
    }
    if (items.length > BOUNDS.hub)
      return { items: [], hub: { set_size: items.length, why: `this person is an end of more than ${BOUNDS.hub} identity claims you can see` } };
    const start = Number.isInteger(page) && page > 0 ? page : 0;
    const slice = items.slice(start, start + BOUNDS.fanout);
    return { items: slice, ...(start + BOUNDS.fanout < items.length ? { next: start + BOUNDS.fanout } : {}) };
  }
}

/* R26 (K1563 (1)): registered once at load with connection-grammar's default registry, the plane's. */
defaultRegistry.registerOwner({ owner: MODULE, kinds: IDENTITY_KIND_WORDS.map((k) => ({ ...k })), neighbours: (args) => {
  const p = People.forHost(args && args.host);
  if (!p) return { refused: "OWNER_HOST_AMBIGUOUS",
                   why: "people's neighbours needs the host it reads (args.host) when this isolate holds no single people instance" };
  return p.neighbours(args);
} });

/** R27: the route arms, keyed by op name, each a function of no arguments answering what its service answers; the
 *  stamps (`viewer` in the query, `by` in the body) are the control plane's. Which credential reaches each op is
 *  `op-declarations`'. */
export function peopleOps(p, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = () => (body && typeof body === "object" ? body : {});
  return {
    identityclaim: () => p.claimIdentity(b()),
    identitywithdraw: () => p.withdrawIdentityClaim(b()),
    identity: () => p.identityOf({ entityId: q("id"), viewer: q("viewer") }),
    samepersoncandidates: () => p.samePersonCandidates({ entityId: q("id"), limit: q("limit"), viewer: q("viewer") }),
    personfact: () => p.recordPersonFact(b()),
    personfactwithdraw: () => p.withdrawPersonFact(b()),
    personexpunge: () => p.expunge(b()),
    person: () => p.personAt({ entityId: q("id"), at: q("at"), viewer: q("viewer") }),
    career: () => p.careerOf({ entityId: q("id"), viewer: q("viewer") }),
    personcredentials: () => p.credentialsOf({ entityId: q("id"), at: q("at"), viewer: q("viewer") }),
    personinterests: () => p.interestsOf({ entityId: q("id"), at: q("at"), viewer: q("viewer") }),
    personstatements: () => p.statementsOf({ entityId: q("id"), from: q("from"), to: q("to"), viewer: q("viewer") }),
    staffing: () => p.staffingAt({ organisation: q("id"), at: q("at"), viewer: q("viewer") }),
    membertie: () => p.declareTie(b()),
    membertiewithdraw: () => p.withdrawTie(b()),
    memberties: () => p.tiesOf({ member: q("member"), viewer: q("viewer") }),
    sourcepersonlink: () => p.linkSourceToPerson(b()),
    sourcepersonlinks: () => p.sourceLinksOf({ source: q("source"), person: q("person"), viewer: q("viewer") }),
    interestcheckdefine: () => p.defineCheck(b()),
    interestcheckswitch: () => p.switchCheck(b()),
    interestchecks: () => p.checkResults({ project: q("project"), check: q("check"), viewer: q("viewer") }),
    interestcheckgate: () => p.recordCheckGate(b()),
  };
}
