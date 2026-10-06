// @ts-check
/* hypotheses (layer 6; T33-46; K1467, K1473, K1487, K1489): a member's hunches and hypotheses, held as labelled rows
 * of the working inquiry. Never facts, never legs, never moving a grade or a finding (R8); a hypothesised cause stays a
 * hypothesis and is never recorded as an event relation (R9).
 *
 *   hold, revise, withdraw, hypothesesOf, read (R1–R3)   the acts and reads; nothing is edited in place
 *   neighbours (R4)                                       the hunch hops, registered as the connection owner of
 *                                                         `hunch`, answered only inside the inquiry holding them
 *   check (R5, R6)                                        registered with `promotion` (its R39): no leg rests on a
 *                                                         hypothesis or on a derived connection carrying a lead
 *   noteWrite, notesOf, noteTurn (R11–R15)                a member's own notes, answered to their author alone
 *   hypothesesOps (R7)                                    the route arms
 *
 * SHAPE (K61, K1563 (1)). `hypothesesOf(host, deps)` answers the one instance per host; making it creates and declares
 * the tables (R10, R15) and registers the leg check with `promotion`. `deps` may give `record`, `membership`,
 * `promotion`, `explore` (whose `rederive` R6 asks), `calculations` (whose synchronous `gradeFactsOf` R6's calculation
 * arm asks; absent, the host's instance, reached when first asked), `registry` (a connection registry other than the
 * default, for a test) and `now` (a clock answering an ISO instant). */
import { isHypothesisId, isMachineIdentity, idPattern } from "../record-grammar/index.mjs";
import { recordOf } from "../record-core/index.mjs";
import { membershipOf, Membership } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { BOUNDS, HUNCH_LABEL, defaultRegistry, isRecordId } from "../connection-grammar/index.mjs";
import { exploreOf } from "../explore/index.mjs";
import { calculationsOf } from "../calculations/index.mjs";
import { HYPOTHESES_SCHEMA, HYPOTHESES_TABLES, NOTES_SCHEMA, NOTES_TABLES } from "./schema.mjs";
import { HYPOTHESES_CHECKS } from "./checks.mjs";

export { HYPOTHESES_SCHEMA, HYPOTHESES_TABLES, NOTES_SCHEMA, NOTES_TABLES, HYPOTHESES_CHECKS };

/** The module's name: its tables' declarer, its promotion step and the connection owner of `hunch` (R4, R10). */
export const OWNER = "hypotheses";
/** R1: the five kinds of hypothesis, closed. */
export const HYPOTHESIS_KINDS = Object.freeze(["cause", "identity", "relation", "flow", "other"]);
/** R1: the kinds whose nodes are exactly two, `from` and `to`. */
export const PAIRED_KINDS = Object.freeze(["cause", "identity", "relation"]);
/** R3: the label every read carries. */
export const HYPOTHESIS_LABEL = "hypothesis";
/** R4: the one kind this module owns, of class `hunch`, with the members' word. */
export const HUNCH_KINDS = Object.freeze([Object.freeze({ kind: "hunch", word: "a member's hunch", class: "hunch" })]);
/** R1: a statement, a reason, at most; the nodes of one hypothesis, at most. */
export const STATEMENT_MAX = 4000;
export const REASON_MAX = 2000;
export const ABOUT_MAX = 50;
/** R4: why a hunch hop is undetermined at every date: a hunch states no period (K1563 (2), an undated kind). */
export const UNDATED_WHY = "a hunch states no period of its own, so whether it holds at a date is not determined";
/** R6: the form of a derived connection's id (`connection-grammar.derivedId`, a SHA-256 in lowercase hex). */
export const DERIVED_ID_RE = /^[0-9a-f]{64}$/;
/** R6 (K1728): a calculation's id, in either form `record-grammar` reads (opaque, and the earlier sequential). */
const CALC_RE = idPattern("CALC");
/** R6: the kinds of a calculation's input whose 64-hex reference names, by definition, something other than a derived
 *  connection (a table's canonical sha256, a passage's content id, a frozen set's or a draw's sha, money facts, a
 *  calculation), so it is never read as one. */
const NOT_A_CONNECTION_REF = Object.freeze(["table", "figure", "set", "draw", "money", "calculation"]);
/** R11: a note's bound, in bytes (`observation-log` R14's bound for a member's own words); refused, never cut. */
export const NOTE_MAX_BYTES = 131072;
/** R13: what a note may become. */
export const NOTE_TURNS = Object.freeze(["observation", "hunch", "question"]);
/** R12: the page of notes: 200 by default, clamped 1…1000. */
export const NOTES_LIMIT = Object.freeze({ default: 200, max: 1000 });
const UTF8 = new TextEncoder();
const HUNCH_VALID = Object.freeze({ from: null, to: null, precision: "day", zone: "UTC" });

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const filled = (v) => typeof v === "string" && v.trim() !== "";
const json = (v) => JSON.stringify(v);
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };
const isThenable = (v) => v !== null && (typeof v === "object" || typeof v === "function") && typeof v.then === "function";

/** Every refusal: `{ok: false, reason, code, check, translation, detail}` (Provides). */
function refuse(code, detail, extra = {}) {
  const row = HYPOTHESES_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra };
}

const instances = new WeakMap();
/* K1563 (1): every instance made in this isolate, so the owner registered at load finds the one there is. */
const live = new Set();
const storageOf = (host) => (host && host.storage ? host.storage : host);

/** R4, K1563 (1): the `neighbours` registered at load. With a `host`, that host's instance answers; without one, the
 *  isolate's one instance; otherwise `OWNER_HOST_AMBIGUOUS`. */
export function ownerNeighbours(args) {
  const a = isObj(args) ? args : {};
  const { host, ...rest } = a;
  let h = null;
  if (host !== undefined && host !== null) h = instances.get(storageOf(host)) ?? null;
  else if (live.size === 1) h = [...live][0];
  if (!h) return { refused: "OWNER_HOST_AMBIGUOUS",
                   why: host ? "no hypotheses instance is made over that host" : `${live.size} hypotheses instances are made in this isolate and the read names no host` };
  return h.neighbours(rest);
}
/* R4: registered once, at load, into the registry the plane wires. */
defaultRegistry.registerOwner({ owner: OWNER, kinds: [...HUNCH_KINDS], neighbours: ownerNeighbours });

/** K61, K1563 (1): the one instance per host, made on the first call (`deps` read then only). */
export function hypothesesOf(host, deps = {}) {
  const storage = storageOf(host);
  let h = instances.get(storage);
  if (!h) {
    const record = deps.record ?? recordOf(host);
    const membership = deps.membership ?? membershipOf(host, { record });
    const promotion = deps.promotion ?? promotionOf(host, { record, membership });
    h = new Hypotheses(storage, { ...deps, record, membership, host,
                                  explore: deps.explore ?? null });
    instances.set(storage, h);
    live.add(h);
    h.migrate();
    const r = promotion.registerStep(OWNER, { check: (c) => h.check(c) });
    if (r && r.ok === false) throw new Error(`hypotheses: registerStep refused: ${r.reason}`);
  }
  return h;
}

export class Hypotheses {
  #sql; #record; #membership; #explore; #host; #calculations; #registry; #now;

  constructor(storage, { record, membership, explore = null, host = null, calculations = null, registry = defaultRegistry, now = null }) {
    this.#sql = storage.sql;
    this.#record = record;
    this.#membership = membership;
    this.#explore = explore;
    this.#host = host;
    this.#calculations = calculations;
    this.#registry = registry;
    this.#now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  #rows(q, ...a) { return [...this.#sql.exec(q, ...a)]; }
  #one(q, ...a) { const r = this.#rows(q, ...a); return r.length ? r[0] : null; }

  /* ---- boot (R4, R10) ---- */

  /** The tables and their declaration (R10), and, for a registry other than the default (a test's), the owner bound to
   *  this instance (R4). Idempotent; a refused declaration is a defect of the wiring and throws. */
  migrate() {
    const bare = (HYPOTHESES_SCHEMA + NOTES_SCHEMA).split("\n").map((l) => l.replace(/--.*$/, "")).join("\n");
    for (const st of bare.split(";")) { const t = st.trim(); if (t) this.#sql.exec(t); }
    if (this.#declared) return { ok: true, already: true };
    const base = { purge: "clear", expunge: "none", export: "yes", sight: "bundle", derive: "stored", version_chain: false,
                   keys: ["bundle_id"] };
    /* R15: a member's notes, their author's alone and never exported, held in the group's copy like every table. */
    const notes = { purge: "clear", expunge: "none", export: "never", sight: "owner", derive: "stored", version_chain: false, keys: [] };
    const d = this.#record.declareTable(OWNER, [...HYPOTHESES_TABLES.map((name) => ({ ...base, name })),
                                                ...NOTES_TABLES.map((name) => ({ ...notes, name }))]);
    if (d && d.ok === false) throw new Error(`hypotheses: declareTable refused: ${d.reason}`);
    if (this.#registry !== defaultRegistry && !this.#registry.owners().some((o) => o.owner === OWNER)) {
      const r = this.#registry.registerOwner({ owner: OWNER, kinds: [...HUNCH_KINDS], neighbours: (a) => this.neighbours(a) });
      if (r && r.refused) throw new Error(`hypotheses: registerOwner refused: ${r.refused}`);
    }
    this.#declared = true;
    return { ok: true };
  }
  #declared = false;

  /* ---- sight (R3; K1489) ---- */

  /* The inquiry `id` names, when the viewer may see it: `{bundle}`; else the one answer for absent and hidden alike. */
  #inquiry(id, viewer) {
    const b = filled(id) ? this.#record.bundleInfo(id) : null;
    if (!b || !this.#membership.inSight(id, viewer))
      return { refusal: refuse("NO_SUCH_BUNDLE", "no inquiry by that id is held, or it is not one you may see", { inquiry: filled(id) ? id : null }) };
    if (b.type !== "inquiry") return { refusal: refuse("NOT_AN_INQUIRY", `${id} is a ${b.type}, not an inquiry`, { inquiry: id }) };
    return { bundle: b };
  }

  /* The hypothesis `id` names, when the viewer may see its inquiry; else null (absent and hidden alike). */
  #held(id, viewer) {
    const r = isHypothesisId(id) ? this.#one(`SELECT * FROM hypotheses WHERE hypothesis_id = ?`, id) : null;
    return r && this.#membership.inSight(r.bundle_id, viewer) ? r : null;
  }
  static #noSuch(id) {
    return refuse("NO_SUCH_HYPOTHESIS", "no hypothesis by that id is held, or it is not one you may see", { hypothesis_id: filled(id) ? id : null });
  }

  /* ---- the nodes (R1) ---- */

  /* `about` read for `kind`: `{about, from, to}` or a refusal naming the node. */
  static #about(kind, about) {
    const bad = (detail, node) => ({ refusal: refuse("BAD_ABOUT", detail, node === undefined ? {} : { node }) });
    const known = (v) => typeof v === "string" && isRecordId(v);
    if (isObj(about) && ("from" in about || "to" in about)) {
      for (const end of ["from", "to"])
        if (!known(about[end])) return bad(`${end} is not an id the record's id grammar knows`, about[end] ?? null);
      if (about.from === about.to) return bad("from and to name the same node", about.from);
      return { about: { from: about.from, to: about.to }, from: about.from, to: about.to };
    }
    if (PAIRED_KINDS.includes(kind)) return bad(`a ${kind} names exactly two nodes, {from, to}`);
    if (!Array.isArray(about) || about.length === 0) return bad("name what the hypothesis is about: {from, to} or a list of ids");
    if (about.length > ABOUT_MAX) return bad(`a hypothesis names at most ${ABOUT_MAX} nodes`);
    const odd = about.find((v) => !known(v));
    if (odd !== undefined) return bad("a node is not an id the record's id grammar knows", typeof odd === "string" ? odd : null);
    return { about: [...new Set(about)], from: null, to: null };
  }

  /* ---- the acts (R1, R2) ---- */

  /** R1: `hold({inquiry, kind, statement, about, by})`. */
  hold({ inquiry = null, kind = null, statement = null, about = null, by = null } = {}) {
    const q = this.#inquiry(inquiry, by);
    if (q.refusal) return q.refusal;
    if (isMachineIdentity(by)) return refuse("MACHINE_CANNOT_HYPOTHESISE", "the act's stamp is a machine's; only a member holds a hypothesis (K1473)");
    if (!HYPOTHESIS_KINDS.includes(kind))
      return refuse("UNKNOWN_HYPOTHESIS_KIND", `a hypothesis is one of ${HYPOTHESIS_KINDS.join(", ")}`, { kinds: [...HYPOTHESIS_KINDS] });
    if (!filled(statement)) return refuse("HYPOTHESIS_NO_STATEMENT", "a hypothesis states, in the member's words, what they think");
    const a = Hypotheses.#about(kind, about);
    if (a.refusal) return a.refusal;
    const at = this.#now();
    const text = statement.trim().slice(0, STATEMENT_MAX);
    return this.#record.transact(() => {
      const id = this.#record.allocId("HYP", at.slice(0, 4));
      if (!id || !id.id) return id;
      this.#sql.exec(`INSERT INTO hypotheses (hypothesis_id, bundle_id, kind, statement, about_json, from_node, to_node, held_by, held_at)
                      VALUES (?,?,?,?,?,?,?,?,?)`, id.id, inquiry, kind, text, json(a.about), a.from, a.to, by, at);
      this.#sql.exec(`INSERT INTO hypothesis_revisions (hypothesis_id, bundle_id, act, statement, about_json, reason, by_actor, at)
                      VALUES (?,?,?,?,?,?,?,?)`, id.id, inquiry, "hold", text, json(a.about), null, by, at);
      return { ok: true, hypothesis_id: id.id, kind, label: HYPOTHESIS_LABEL, at };
    });
  }

  /* The checks `revise` and `withdraw` share: the hypothesis seen, a member's act, a reason. */
  #amendable(hypothesisId, reason, by) {
    const r = this.#held(hypothesisId, by);
    if (!r) return { refusal: Hypotheses.#noSuch(hypothesisId) };
    if (isMachineIdentity(by)) return { refusal: refuse("MACHINE_CANNOT_HYPOTHESISE", "the act's stamp is a machine's; only a member changes a hypothesis (K1473)") };
    if (!filled(reason)) return { refusal: refuse("HYPOTHESIS_NO_REASON", "a change to a hypothesis says why, in the member's words") };
    return { row: r, reason: reason.trim().slice(0, REASON_MAX) };
  }

  /** R2: `revise({hypothesisId, statement?, about?, reason, by})` appends a revision; the hypothesis keeps its id. */
  revise({ hypothesisId = null, statement = undefined, about = undefined, reason = null, by = null } = {}) {
    const m = this.#amendable(hypothesisId, reason, by);
    if (m.refusal) return m.refusal;
    const r = m.row;
    if (r.withdrawn) return refuse("HYPOTHESIS_WITHDRAWN", `${r.hypothesis_id} was withdrawn; a withdrawn hypothesis is not revised`, { hypothesis_id: r.hypothesis_id });
    if (statement !== undefined && statement !== null && !filled(statement))
      return refuse("HYPOTHESIS_NO_STATEMENT", "a revised statement says, in the member's words, what they now think");
    const text = filled(statement) ? statement.trim().slice(0, STATEMENT_MAX) : r.statement;
    let a = { about: parse(r.about_json), from: r.from_node, to: r.to_node };
    if (about !== undefined && about !== null) { a = Hypotheses.#about(r.kind, about); if (a.refusal) return a.refusal; }
    const at = this.#now();
    return this.#record.transact(() => {
      this.#sql.exec(`UPDATE hypotheses SET statement = ?, about_json = ?, from_node = ?, to_node = ? WHERE hypothesis_id = ?`,
                     text, json(a.about), a.from, a.to, r.hypothesis_id);
      this.#sql.exec(`INSERT INTO hypothesis_revisions (hypothesis_id, bundle_id, act, statement, about_json, reason, by_actor, at)
                      VALUES (?,?,?,?,?,?,?,?)`, r.hypothesis_id, r.bundle_id, "revise", text, json(a.about), m.reason, by, at);
      return { ok: true, hypothesis_id: r.hypothesis_id, kind: r.kind, label: HYPOTHESIS_LABEL, at };
    });
  }

  /** R2: `withdraw({hypothesisId, reason, by})` marks it withdrawn; a second withdrawal answers the first. */
  withdraw({ hypothesisId = null, reason = null, by = null } = {}) {
    const m = this.#amendable(hypothesisId, reason, by);
    if (m.refusal) return m.refusal;
    const r = m.row;
    if (r.withdrawn) {
      const w = this.#one(`SELECT by_actor, at, reason FROM hypothesis_revisions WHERE hypothesis_id = ? AND act = 'withdraw' ORDER BY seq LIMIT 1`, r.hypothesis_id);
      return { ok: true, already: true, hypothesis_id: r.hypothesis_id, label: HYPOTHESIS_LABEL,
               withdrawn: w ? { by: w.by_actor, at: w.at, reason: w.reason } : null };
    }
    const at = this.#now();
    return this.#record.transact(() => {
      this.#sql.exec(`UPDATE hypotheses SET withdrawn = 1 WHERE hypothesis_id = ?`, r.hypothesis_id);
      this.#sql.exec(`INSERT INTO hypothesis_revisions (hypothesis_id, bundle_id, act, statement, about_json, reason, by_actor, at)
                      VALUES (?,?,?,?,?,?,?,?)`, r.hypothesis_id, r.bundle_id, "withdraw", null, null, m.reason, by, at);
      return { ok: true, hypothesis_id: r.hypothesis_id, label: HYPOTHESIS_LABEL, withdrawn: { by, at, reason: m.reason } };
    });
  }

  /* ---- the reads (R2, R3) ---- */

  /* One hypothesis as every read answers it: labelled, the member's, never a fact, no grade, with its history. */
  #view(r) {
    const history = this.#rows(`SELECT act, statement, about_json, reason, by_actor, at FROM hypothesis_revisions
                                WHERE hypothesis_id = ? ORDER BY seq`, r.hypothesis_id)
      .map((h) => ({ act: h.act, by: h.by_actor, at: h.at, ...(h.statement !== null ? { statement: h.statement } : {}),
                     ...(h.about_json !== null ? { about: parse(h.about_json) } : {}), ...(h.reason !== null ? { reason: h.reason } : {}) }));
    return { hypothesis_id: r.hypothesis_id, inquiry: r.bundle_id, kind: r.kind, label: HYPOTHESIS_LABEL, fact: false, grade: null,
             statement: r.statement, about: parse(r.about_json), held_by: r.held_by, held_at: r.held_at,
             status: r.withdrawn ? "withdrawn" : "live", history };
  }

  /** R3: `read({hypothesisId, viewer})`. */
  read({ hypothesisId = null, viewer = null } = {}) {
    const r = this.#held(hypothesisId, viewer);
    return r ? { ok: true, hypothesis: this.#view(r) } : Hypotheses.#noSuch(hypothesisId);
  }

  /** R3: `hypothesesOf({inquiry, viewer})`: every hypothesis the inquiry holds, withdrawn ones marked, in the order held. */
  hypothesesOf({ inquiry = null, viewer = null } = {}) {
    const q = this.#inquiry(inquiry, viewer);
    if (q.refusal) return q.refusal;
    const rows = this.#rows(`SELECT * FROM hypotheses WHERE bundle_id = ? ORDER BY held_at, hypothesis_id`, inquiry);
    return { ok: true, inquiry, label: HYPOTHESIS_LABEL, hypotheses: rows.map((r) => this.#view(r)) };
  }

  /* ---- the hunch hops (R4) ---- */

  /* One live hypothesis with two ends as a connection in `connection-grammar`'s shape (its R1): labelled `hunch`, no
     grade, the hypothesis as its evidence, scoped to the inquiry holding it. */
  #hop(r) {
    return { id: r.hypothesis_id, from: r.from_node, to: r.to_node, kind: "hunch", owner: OWNER, valid: { ...HUNCH_VALID },
             evidence: [{ source: r.hypothesis_id, statement: r.statement, by: r.held_by }], grade: null, derived: null,
             label: HUNCH_LABEL, scope: r.bundle_id, hypothesis_kind: r.kind, undetermined: { why: UNDATED_WHY } };
  }

  /** R4: `neighbours({node, kinds, at, page, viewer, scope})`: the hops at `node` of the live hypotheses the inquiry
   *  `scope` holds, when the viewer may see it; none outside that scope. Synchronous (connection-grammar R19). */
  neighbours({ node, kinds: ks, at, page, viewer, scope } = {}) {
    void at; /* undated: every hop is undetermined at every date (K1563 (2)) */
    if (viewer === undefined || viewer === null || viewer === "")
      return { refused: "VIEWER_MISSING", why: "a read names the member reading; an absent viewer is neither an administrator nor the public" };
    if (Array.isArray(ks) && !ks.includes("hunch")) return { items: [] };
    if (!filled(node) || !filled(scope)) return { items: [] };
    const b = this.#record.bundleInfo(scope);
    if (!b || b.type !== "inquiry" || !this.#membership.inSight(scope, viewer)) return { items: [] };
    const where = `bundle_id = ? AND withdrawn = 0 AND from_node IS NOT NULL AND to_node IS NOT NULL AND (from_node = ? OR to_node = ?)`;
    const size = Number(this.#one(`SELECT COUNT(*) AS n FROM hypotheses WHERE ${where}`, scope, node, node).n);
    if (size > BOUNDS.hub)
      return { items: [], hub: { set_size: size, why: `this node is in more than ${BOUNDS.hub} hunches of this inquiry, so it is named, never expanded` } };
    const after = isObj(page) && filled(page.after) ? page.after : "";
    const per = isObj(page) && Number.isInteger(page.size) && page.size >= 1 ? Math.min(page.size, BOUNDS.fanout) : BOUNDS.fanout;
    const rows = this.#rows(`SELECT * FROM hypotheses WHERE ${where} AND hypothesis_id > ? ORDER BY hypothesis_id LIMIT ?`,
                            scope, node, node, after, per + 1);
    const items = rows.slice(0, per).map((r) => this.#hop(r));
    return { items, ...(rows.length > per ? { next: { after: items[items.length - 1].id, size: per } } : {}) };
  }

  /* ---- a member's own notes (R11–R15; DEC-136 (2), (3)) ---- */

  /* The member an act's stamp or a read's viewer names, or null: a machine, an absent stamp and a viewer naming no
     member keep and read no note (R11, R12). */
  #noteMember(who) {
    if (!filled(who) || isMachineIdentity(who)) return null;
    let m = null;
    try { m = this.#membership.positionalMember(who); } catch { m = null; }
    return filled(m) ? m : null;
  }

  /* The note `note` names when `member` kept it, else null (absent and another's alike, R13). */
  #ownNote(note, member) {
    const n = typeof note === "number" ? note : typeof note === "string" && /^\d{1,15}$/.test(note.trim()) ? Number(note.trim()) : NaN;
    if (!Number.isSafeInteger(n) || n < 1) return null;
    return this.#one(`SELECT note_id, member, text, at FROM member_notes WHERE note_id = ? AND member = ?`, n, member);
  }

  /** R11: `noteWrite({text, by})` keeps one note in the member's words, refused (never cut) past its bound; the first
   *  note a member keeps while the group tells members what a court can reach answers the court statement, once. */
  noteWrite({ text = null, by = null } = {}) {
    const member = this.#noteMember(by);
    if (!member) return refuse("MACHINE_CANNOT_NOTE", "the act's stamp names no member; only a member keeps a note of their own");
    if (!filled(text)) return refuse("NOTE_NO_TEXT", "a note holds the member's words, and this one holds none");
    const bytes = UTF8.encode(text).length;
    if (bytes > NOTE_MAX_BYTES)
      return refuse("NOTE_TOO_LONG", `a note holds at most ${NOTE_MAX_BYTES} bytes, and this one is ${bytes}`, { max_bytes: NOTE_MAX_BYTES, bytes });
    let tell = false;
    try { tell = this.#membership.courtNotice().choice === "tell"; } catch { tell = false; }
    const at = this.#now();
    return this.#record.transact(() => {
      this.#sql.exec(`INSERT INTO member_notes (member, text, at) VALUES (?,?,?)`, member, text, at);
      const note = Number(this.#one(`SELECT last_insert_rowid() AS id`).id);
      let told = false;
      if (tell && !this.#one(`SELECT member FROM member_note_told WHERE member = ?`, member)) {
        this.#sql.exec(`INSERT INTO member_note_told (member, at) VALUES (?,?)`, member, at);
        told = true;
      }
      return { ok: true, note, at, ...(told ? { courtStatement: Membership.COURT_STATEMENT } : {}) };
    });
  }

  /** R12: `notesOf({viewer, after?, limit?})`: the viewer's own notes, newest first, each with its turns; any other
   *  viewer, and none, reads exactly as a member with no notes. */
  notesOf({ viewer = null, after = null, limit = undefined } = {}) {
    const lim = Number.isInteger(Number(limit)) && limit !== null && limit !== "" && limit !== undefined
      ? Math.min(NOTES_LIMIT.max, Math.max(1, Number(limit))) : NOTES_LIMIT.default;
    const member = this.#noteMember(viewer);
    if (!member) return { ok: true, notes: [], limit: lim, truncated: false, next: null };
    const from = after === null || after === undefined || after === "" ? null : Number(after);
    const cursor = Number.isSafeInteger(from) && from > 0 ? from : null;
    const rows = this.#rows(`SELECT note_id, text, at FROM member_notes WHERE member = ? ${cursor ? "AND note_id < ?" : ""}
                             ORDER BY note_id DESC LIMIT ?`, ...(cursor ? [member, cursor, lim + 1] : [member, lim + 1]));
    const page = rows.slice(0, lim);
    const notes = page.map((r) => ({ note: Number(r.note_id), text: r.text, at: r.at,
      turned: this.#rows(`SELECT turned_into, made_id, at FROM member_note_turns WHERE note_id = ? AND member = ? ORDER BY seq`, r.note_id, member)
        .map((t) => ({ into: t.turned_into, id: t.made_id, at: t.at })) }));
    const truncated = rows.length > lim;
    return { ok: true, notes, limit: lim, truncated, next: truncated ? { after: notes[notes.length - 1].note } : null };
  }

  /** R13: `noteTurn({note, into, by, hunch?, made?})` records that a note became an observation, a hunch or a question,
   *  by its author's own act: a hunch is held here (R1), a note past R1's statement bound refused, never cut (K1807);
   *  an observation or a question is made by its owner's act and named in `made`. The note itself is unchanged and
   *  stays its author's alone. */
  noteTurn({ note = null, into = null, by = null, hunch = null, made = null } = {}) {
    const member = this.#noteMember(by);
    if (!member) return refuse("MACHINE_CANNOT_NOTE", "the act's stamp names no member; only a note's author turns it");
    const n = this.#ownNote(note, member);
    if (!n) return refuse("NO_SUCH_NOTE", "no note of yours is held by that number", { note: typeof note === "number" || typeof note === "string" ? note : null });
    if (!NOTE_TURNS.includes(into)) return refuse("NOTE_TURN_UNKNOWN", `a note becomes one of ${NOTE_TURNS.join(", ")}`, { turns: [...NOTE_TURNS] });
    const noteId = Number(n.note_id);
    const append = (id) => {
      const at = this.#now();
      this.#sql.exec(`INSERT INTO member_note_turns (note_id, member, turned_into, made_id, at) VALUES (?,?,?,?,?)`, noteId, member, into, id, at);
      return { ok: true, note: noteId, into, id, at };
    };
    if (into === "hunch") {
      /* K1807: R1's statement bound is never reached by cutting the member's words: such a turn is refused. */
      const length = n.text.trim().length;
      if (length > STATEMENT_MAX)
        return refuse("NOTE_TOO_LONG_FOR_HUNCH", `a hunch's statement holds at most ${STATEMENT_MAX} characters, and this note is ${length}`,
                      { max_characters: STATEMENT_MAX, characters: length, note: noteId });
      const h = isObj(hunch) ? hunch : {};
      return this.#record.transact(() => {
        const r = this.hold({ inquiry: h.inquiry ?? null, kind: h.kind ?? null, about: h.about ?? null, statement: n.text, by });
        if (!r || r.ok !== true) return r;
        return { ...append(r.hypothesis_id), hypothesis: r };
      });
    }
    const id = typeof made === "string" ? made.trim() : made;
    if (typeof id !== "string" || !isRecordId(id))
      return refuse("NOTE_TURN_NOT_MADE", `name the ${into} your own act made from this note by the record's id`, { made: typeof made === "string" ? made : null });
    return this.#record.transact(() => append(id));
  }

  /* ---- the leg check (R5, R6) ---- */

  /** R5, R6: for each leg, a finding when it rests on a hypothesis, or on a derived connection that is a lead or that
   *  cannot be re-derived; `legs` as `inquiry` numbers them (`ord`, its R12). `inquiry` is the inquiry the legs belong
   *  to, passed to `explore.rederive` as `scope: {inquiry}` (its R19; N582), so a hunch of that inquiry is seen as one;
   *  without it no scope is passed and no hunch is read. Writes nothing and never throws. */
  legRefusals({ legs = [], viewer = null, inquiry = null } = {}) {
    const out = [];
    const list = Array.isArray(legs) ? legs : [];
    const scope = filled(inquiry) ? { inquiry } : null;
    list.forEach((leg, i) => {
      if (!isObj(leg)) return;
      const ord = Number.isInteger(leg.ord) ? leg.ord : i;
      const target = typeof leg.target === "string" ? leg.target.trim() : leg.target;
      try {
        const f = this.#judgeLeg(target, leg, viewer, scope);
        if (f) out.push({ ...f, ord, target });
      } catch (e) {
        out.push({ ...finding("LEG_NOT_REDERIVED", `basis[${ord}] could not be checked: ${String(e && e.message ? e.message : e).slice(0, 200)}`), ord, target });
      }
    });
    return out;
  }

  #judgeLeg(target, leg, viewer, scope) {
    /* DEC-49 REGION is-hypothesis-leg */
    if (isHypothesisId(target))
      return finding("HYPOTHESIS_NOT_A_LEG", `the leg rests on ${target}, a hypothesis: hypotheses are held in the working inquiry, never as a leg (K1467)`);
    /* END DEC-49 REGION is-hypothesis-leg */
    if (typeof target === "string" && DERIVED_ID_RE.test(target)) return this.#judgeDerived(target, derivationOf(leg), viewer, scope, "the leg");
    if (typeof target === "string" && CALC_RE && CALC_RE.test(target)) return this.#judgeCalculation(target, viewer, scope);
    return null;
  }

  /* R6's calculation arm (N576, K1601): the calculation's inputs read synchronously through `calculations.gradeFactsOf`,
     the promotion's author as the viewer. A hypothesis among an input's reference is refused; an input naming a derived
     connection is judged as a leg on it; a calculation not found, or a read that throws or answers no such shape, is
     refused `LEG_NOT_REDERIVED`, never passed (fail closed). */
  #judgeCalculation(calcId, viewer, scope) {
    const cannot = (why) => finding("LEG_NOT_REDERIVED", `the leg rests on the calculation ${calcId}, whose inputs could not be read: ${why}`, { calculation: calcId });
    const calc = this.#calculationsOf();
    if (!calc || typeof calc.gradeFactsOf !== "function") return cannot("no calculation read is reachable");
    let facts = null;
    try { facts = calc.gradeFactsOf({ calcId, viewer }); } catch { return cannot("the read failed"); }
    if (isThenable(facts)) { Promise.resolve(facts).catch(() => {}); return cannot("the read did not answer synchronously"); }
    if (!isObj(facts) || facts.found !== true || !Array.isArray(facts.inputs))
      return cannot(isObj(facts) && facts.found === false ? "it is not held, or not one this author may see" : "the read answered no grade facts");
    for (const inp of facts.inputs) {
      if (!isObj(inp)) continue;
      const refs = stringsIn(inp.ref);
      const hyp = refs.find((x) => isHypothesisId(x.trim()));
      if (hyp !== undefined)
        return finding("HYPOTHESIS_NOT_A_LEG", `the calculation ${calcId} names ${hyp.trim()}, a hypothesis, among its inputs (K1467)`, { calculation: calcId });
    }
    for (const inp of facts.inputs) {
      if (!isObj(inp) || NOT_A_CONNECTION_REF.includes(inp.kind)) continue;
      const id = stringsIn(inp.ref).map((x) => x.trim()).find((x) => DERIVED_ID_RE.test(x));
      if (id === undefined) continue;
      const what = `the calculation ${calcId}'s input ${filled(inp.name) ? inp.name : id}`;
      const f = this.#judgeDerived(id, derivationOf(inp), viewer, scope, what);
      if (f) return { ...f, calculation: calcId };
    }
    return null;
  }

  /* R6: one derived connection id with its derivation, re-derived through `explore` with the leg's inquiry as `scope`
     (its R19). Null when it re-derives with no declared or hunch hop; a finding otherwise, never a pass. */
  #judgeDerived(id, derivation, viewer, scope, what) {
    if (!filled(id) || !isObj(derivation))
      return finding("LEG_NOT_REDERIVED", `${what} cites a derived connection ${id ?? ""} without its derivation (kind, from, to, as_of, method), so it cannot be re-derived`, { connection: filled(id) ? id : null });
    const ex = this.#exploreOf();
    let r = null;
    if (ex) {
      try { r = ex.rederive({ kind: derivation.kind, from: derivation.from, to: derivation.to, as_of: derivation.as_of,
                              method: derivation.method, id, viewer, ...(scope ? { scope } : {}) }); } catch { r = null; }
    }
    if (isThenable(r)) { Promise.resolve(r).catch(() => {}); r = null; }
    /* DEC-49 REGION is-rederived-leg */
    if (!isObj(r) || r.ok !== true || r.matches !== true)
      return finding("LEG_NOT_REDERIVED", `${what} cites the derived connection ${id}, which could not be re-derived: ${isObj(r) && filled(r.why) ? r.why : "no answer"}`, { connection: id });
    /* END DEC-49 REGION is-rederived-leg */
    /* DEC-49 REGION is-lead-leg */
    if (r.declared_or_hunch === true) {
      const hop = (Array.isArray(r.rests_on) ? r.rests_on : []).find((x) => isObj(x) && (x.class === "declared" || x.class === "hunch"));
      const hopId = hop ? (isObj(hop.connection) && filled(hop.connection.id) ? hop.connection.id : hop.input) : null;
      return finding("LEAD_NOT_A_LEG", `${what} cites the derived connection ${id}, whose chain carries a ${hop ? hop.class : "declared or hunch"} hop${hopId ? ` (${hopId})` : ""}: a lead, never a basis for a finding (K1487)`,
                     { connection: id, hop: hopId ?? null });
    }
    /* END DEC-49 REGION is-lead-leg */
    return null;
  }

  /* R6: the host's calculations instance, reached when first asked (the plane builds it before this module). */
  #calculationsOf() {
    if (!this.#calculations && this.#host) {
      try { this.#calculations = calculationsOf(this.#host); } catch { this.#calculations = null; }
    }
    return this.#calculations;
  }

  #exploreOf() {
    if (!this.#explore && this.#host) {
      try { this.#explore = exploreOf(this.#host); } catch { this.#explore = null; }
    }
    return this.#explore;
  }

  /** R5, R6 (promotion R39): inside the promotion's transaction, before the write, for every promotion of an inquiry.
   *  Every leg is asked, a replay's too: no leg ever rests on a hypothesis or a lead. */
  check(c) {
    if (!isObj(c) || c.promotedType !== "inquiry") return null;
    const fm = isObj(c.docFm) ? c.docFm : null;
    const legs = (fm && Array.isArray(fm.basis) ? fm.basis : []).filter(isObj);
    if (!legs.length) return null;
    const viewer = filled(c.author) ? c.author : (c.writer ?? null);
    const findings = this.legRefusals({ legs: legs.map((l, ord) => ({ ...l, ord })), viewer, inquiry: c.bundleId ?? null });
    if (!findings.length) return null;
    return { ok: false, reason: "BASIS_REFUSED", findings,
             detail: "a leg rests on a hypothesis, or on a derived connection that is a lead or cannot be re-derived. Nothing was written." };
  }
}

/* One finding as `inquiry` R11 carries them inside BASIS_REFUSED. */
function finding(code, detail, extra = {}) {
  const row = HYPOTHESES_CHECKS[code];
  return { check: row.check, code, severity: "error", translation: row.translation, detail, ...extra };
}

/** R6: the derivation a leg (or an input) carries beside a derived connection id: `derivation: {kind, from, to, as_of,
 *  method}`, or, in a document's frontmatter, whose list items hold scalars only, the five flat fields
 *  `derivation_kind`, `derivation_from`, `derivation_to`, `derivation_as_of`, `derivation_method`. Null when neither. */
export function derivationOf(leg) {
  if (!isObj(leg)) return null;
  if (isObj(leg.derivation)) return leg.derivation;
  const flat = Object.fromEntries(["kind", "from", "to", "as_of", "method"].map((k) => [k, leg[`derivation_${k}`]]));
  return Object.values(flat).some((v) => v !== undefined) ? flat : null;
}

/* Every string inside a value, walked. */
function stringsIn(v, out = []) {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) for (const x of v) stringsIn(x, out);
  else if (isObj(v)) for (const x of Object.values(v)) stringsIn(x, out);
  return out;
}

/* ---- the ops map (R7) ---- */

/** R7: the route arms, keyed by op name, each a function of no arguments: the hypotheses' four and, since T34, the
 *  notes' three. An act's arguments come from the body, whose `by` is the control plane's stamp; a read's from `url`'s
 *  query, the `viewer` stamp among them, never the body. */
export function hypothesesOps(hypotheses, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = isObj(body) ? body : {};
  return {
    hypothesishold: () => hypotheses.hold(b),
    hypothesisrevise: () => hypotheses.revise(b),
    hypothesiswithdraw: () => hypotheses.withdraw(b),
    hypotheses: () => (q("id") ? hypotheses.read({ hypothesisId: q("id"), viewer: q("viewer") })
                                : hypotheses.hypothesesOf({ inquiry: q("inquiry"), viewer: q("viewer") })),
    notewrite: () => hypotheses.noteWrite(b),
    notes: () => hypotheses.notesOf({ viewer: q("viewer"), after: q("after"), limit: q("limit") ?? undefined }),
    noteturn: () => hypotheses.noteTurn(b),
  };
}
