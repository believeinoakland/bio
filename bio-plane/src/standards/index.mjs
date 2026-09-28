/* standards — what a government act is measured against (requirements: `build/requirements/standards.md`; Functional
 * Architecture, Layer 2 Function 1). A standard is a statute, regulation, ordinance, court decision or order, adopted
 * policy or public commitment, held as content in the record: its citation, kind and issuer, its own words as captured
 * (content ids), where it comes from (a jurisdiction profile's `standard_sources`, or undetermined) and the period it
 * was in force. It answers which standards were in force at a date. It judges nothing about a government act
 * (`conformance` does) and nothing about a standard's merit (R12).
 *
 * A new module (K102, K171): nothing moves (its map, §1). A standard is a record document of type `standard` (R15),
 * `STD-<year>-NNNN-<kind>`, promoted through `promotion` outside any project (K171 (12)); the catalogue knows the type
 * (one state, `recorded`, no edges: legacy-checks' N129). It is never edited: a correction is a new standard that
 * supersedes it, at most once (R4, R6). Its registered check refuses every other write of a standard (R11). The reads
 * answer from this module's own tables (`./schema.mjs`), written once per act and never updated (R14). A proposal (the
 * Legal/Policy Lookup skill's work, or a member's suggestion) is stored apart and labelled by `legacy-checks`'
 * `proposalLabel(proposer, "standard")` (R9); a member's adoption records a standard naming it (R10).
 *
 * No place is named here (R13): where a citation comes from is read from the active profiles' combined view
 * (`jurisdictions.combine` over record-core's `jurisdiction_profiles`), and a fact they do not supply is undetermined.
 *
 * REACHED as `standardsOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps` and returned to every later caller. At creation it registers its check with `promotion` (R39) and
 * its tables with purge (R14). `deps`:
 *   record, membership, promotion, content   the modules it uses, through their factories on the same host unless a
 *                test passes its own (`content` is reached lazily, on first use).
 *   combine      `jurisdictions.combine` (default); a test passes its own, which resolves profiles it wrote by id.
 *   now          the module's clock, an ISO instant (default: the wall clock). */

import { isMachineIdentity, normalizeType, proposalLabel } from "../../checks/bio-checks.mjs";
import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { contentOf } from "../content/index.mjs";
import { combine as combineProfiles, SOURCE_KINDS } from "../../../jurisdictions/index.mjs";
import { STANDARDS_CHECKS, refusal } from "./checks.mjs";
import { STANDARDS_TABLES, migrateStandards } from "./schema.mjs";

export { STANDARDS_CHECKS } from "./checks.mjs";
export { STANDARDS_SCHEMA, STANDARDS_TABLES } from "./schema.mjs";

export const STANDARD = "standard";
/** R1, R12: the six kinds, `jurisdictions`' own list (its R23), never a copy: the whole vocabulary of a standard. */
export const STANDARD_KINDS = SOURCE_KINDS;
/** R7: the three answers of `inForce`. */
export const IN_FORCE_STATES = Object.freeze(["in_force", "not_in_force", "undetermined"]);
/** R1: a citation's bound; R9: a proposal's `why`; R8: a page; R2: the passages one standard's text names; the bound on
 *  a proposal's named act. */
export const CITE_MAX = 200, WHY_MAX = 240, PAGE_MAX = 200, TEXTS_MAX = 50, ACT_MAX = 200;
/** R12: the fields each act takes. Anything else is refused by name, never ignored: a field silently dropped is a view
 *  the caller believes was recorded. */
const DECLARE_KEYS = Object.freeze(["cite", "kind", "issuer", "text", "period", "supersedes", "author", "viewer"]);
const PROPOSE_KEYS = Object.freeze(["cite", "kind", "issuer", "text", "why", "act", "proposer", "viewer"]);
const ADOPT_KEYS = Object.freeze([...DECLARE_KEYS, "proposal"]);

const str = (v) => (typeof v === "string" ? v.trim() : "");
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const rand = (n) => [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, "0")).join("");
const safeJson = (s) => { try { return s == null ? null : JSON.parse(s); } catch { return null; } };
/* A token the front matter holds bare; any other string is quoted, with no quote, backslash or line break. */
const TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:\/-]{0,199}$/;
const q = (s) => `"${String(s).replace(/["\\\r\n]/g, " ")}"`;
const bare = (s) => (TOKEN.test(String(s)) ? String(s) : q(s));
/* A member's words kept whole in a body section: a line that would open a heading is set in by one space. */
const bodyText = (s) => String(s).trim().replace(/^#/gm, " #");

/** R1, R7: a calendar date, `YYYY-MM-DD`, that exists. */
export function isDate(v) {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** R7: a period against a date, with why. `not_in_force` only when a stated bound excludes the date; `undetermined`
 *  when a bound needed to decide is null; never a default. Bounds are inclusive. */
export function inForceAt(period, date) {
  const from = period ? period.from ?? null : null, to = period ? period.to ?? null : null;
  if (from !== null && date < from)
    return { state: "not_in_force", why: `the period in force starts ${from}, after ${date}` };
  if (to !== null && date > to)
    return { state: "not_in_force", why: `the period in force ended ${to}, before ${date}` };
  if (from !== null && to !== null)
    return { state: "in_force", why: `${date} lies within the period in force, ${from} to ${to}` };
  const missing = [from === null ? "when it came into force" : null, to === null ? "when it ceased to be in force" : null]
    .filter(Boolean).join(" or ");
  return { state: "undetermined",
           why: `the record does not state ${missing}, so whether it was in force on ${date} is undetermined` };
}

export class Standards {
  #writing = null;   // the standard this module is promoting, for its own check (R11)

  constructor({ storage, record, membership, promotion, content = null, combine = combineProfiles, now = null } = {}) {
    this.storage = storage;
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.contentRef = content;
    this.combine = combine;
    this.now = typeof now === "function" ? now : () => new Date().toISOString();
  }

  #rows(qs, ...a) { return [...this.sql.exec(qs, ...a)]; }
  #one(qs, ...a) { const r = this.#rows(qs, ...a); return r.length ? r[0] : null; }
  get content() { return typeof this.contentRef === "function" ? this.contentRef() : this.contentRef; }
  #when() { return stampInstant("second", Date.parse(this.now())); }

  /** The module's tables (R14). */
  migrate() { migrateStandards(this.sql); }

  /* ===================================================================== *
   * R3: WHERE A CITATION COMES FROM
   * ===================================================================== */

  /* The active profiles' combined view (record-core R26, jurisdictions R12–R16), or why there is none. */
  #view() {
    const ids = this.record.getSetting("jurisdiction_profiles");
    if (!Array.isArray(ids) || !ids.length)
      return { view: null, why: "the instance has no active jurisdiction profile, so no source of standards is known" };
    const c = this.combine(ids);
    if (!c || !c.ok)
      return { view: null, why: "the instance's active jurisdiction profiles could not be combined ("
               + `${[...new Set(((c && c.errors) || []).map((e) => e.code))].join(", ") || "unreadable"}), so no source `
               + "of standards is known" };
    return { view: c.view, why: null };
  }

  /** R3: the citation against every `standard_sources` entry of the active profiles, in order. The first match gives
   *  the source; entries of different profiles that match and disagree are a fact the profiles withhold between them
   *  (jurisdictions R15: nothing chooses between profiles that disagree), so the answer is undetermined. A declared
   *  kind or issuer that differs from the match's is stated beside it, never corrected. Never throws. */
  sourceOf(cite, declared = {}) {
    const undetermined = (why, extra) => ({ state: "undetermined", why, ...(extra || {}) });
    const { view, why } = this.#view();
    if (!view) return undetermined(why);
    const entries = Array.isArray(view.standard_sources) ? view.standard_sources : [];
    if (!entries.length) return undetermined("the active jurisdiction profiles list no source of standards");
    const text = String(cite ?? "");
    const matches = entries.filter((e) => {
      try { return !!e.cite && new RegExp(e.cite.re, e.cite.flags || "").test(text); } catch { return false; }
    });
    if (!matches.length)
      return undetermined("the citation matches the citation form of no source the active jurisdiction profiles list; "
                          + "the standard is held all the same, and where it comes from is undetermined");
    const first = matches[0];
    const key = (e) => JSON.stringify([e.source, e.kind, e.issuer, e.level ?? null]);
    const disagree = matches.filter((m) => m.profile !== first.profile && key(m) !== key(first));
    if (disagree.length)
      return undetermined("the citation matches sources of different active jurisdiction profiles that disagree about "
                          + "it, and none is chosen between them, so where it comes from is undetermined",
                          { disagreeing: [first, ...disagree].map((e) => ({ profile: e.profile, source: e.source,
                            kind: e.kind, issuer: e.issuer, level: e.level ?? null, basis: e.basis })) });
    const level = typeof first.level === "string" && first.level ? first.level : "undetermined";
    const differs = [];
    for (const f of ["kind", "issuer"])
      if (str(declared[f]) && str(declared[f]) !== first[f])
        differs.push({ field: f, declared: str(declared[f]), source: first[f],
                       says: `recorded as declared; the matched source says ${f} '${first[f]}'` });
    return { state: "matched", source: first.source, kind: first.kind, issuer: first.issuer, level,
             ...(level === "undetermined" ? { level_why: "the matched source states no level" } : {}),
             profile: first.profile, basis: first.basis, ...(differs.length ? { differs } : {}) };
  }

  /* ===================================================================== *
   * THE REGISTERED CHECK (promotion R39): R11, R4 at the write
   * ===================================================================== */

  /** R11: a standard is written only by this module's R1 and R10, as a creation; every other promotion of one (a raw
   *  promotion, a revision) is refused. A replay (a restore of the record's own history) is admitted. */
  check(c) {
    const headType = c.head ? normalizeType(c.head.type) : null;
    if (c.promotedType !== STANDARD && headType !== STANDARD) return null;
    return this.#checkStandard(c);
  }

  #checkStandard(c) {
    if (c.replay || (c.creation && this.#writing !== null && c.bundleId === this.#writing)) return null;
    /* DEC-49 REGION is-standard-written-here */
    return refusal("STANDARD_WRITTEN_ELSEWHERE", c.head
      ? "a standard is never edited: a correction is a new standard that supersedes it. Nothing was written."
      : "a standard is recorded by a member's act, never by a raw promotion. Nothing was written.",
      { bundleId: c.bundleId ?? null });
    /* END DEC-49 REGION is-standard-written-here */
  }

  /* ===================================================================== *
   * DECLARING (R1–R4, R6)
   * ===================================================================== */

  /** R1–R4, R6: record a standard. */
  standardDeclare(args = {}) {
    const a = isObj(args) ? args : {};
    const byMachine = machineRefusal(a.author);
    if (byMachine) return byMachine;
    const unknown = refuseFieldUnknown(a, DECLARE_KEYS);
    if (unknown) return unknown;
    const d = this.#declareRefusal(a);
    if (d.ok === false) return d;
    return this.#write(d.fields, str(a.author), a.viewer ?? null, null);
  }

  /* R1's refusals after the author, in R1's order, then R6's; `{ok: true, fields}`, checked, when none applies. */
  #declareRefusal(a) {
    const cite = str(a.cite);
    if (!cite || cite.length > CITE_MAX) return refuseNoCite(cite.length);
    if (!STANDARD_KINDS.includes(a.kind)) return refuseKindUnknown(a.kind);
    const issuer = str(a.issuer);
    /* DEC-49 REGION is-standard-issuer */
    if (!issuer)
      return refusal("STANDARD_NO_ISSUER", "a standard names the body that made it. Nothing was written.");
    /* END DEC-49 REGION is-standard-issuer */
    const texts = textIds(a.text);
    /* DEC-49 REGION is-standard-text */
    if (!texts || !texts.length || texts.length > TEXTS_MAX)
      return refusal("STANDARD_NO_TEXT", texts && texts.length > TEXTS_MAX
        ? `a standard's text names at most ${TEXTS_MAX} passages. Nothing was written.`
        : "a standard is held with its own words as captured: name one or more content ids. Nothing was written.",
        { max: TEXTS_MAX });
    /* END DEC-49 REGION is-standard-text */
    const unresolved = this.#unresolvedText(texts, a.viewer ?? null);
    if (unresolved) return refuseTextUnresolved(unresolved);
    const period = periodOf(a.period);
    /* DEC-49 REGION is-standard-period */
    if (!period)
      return refusal("STANDARD_PERIOD_INVALID", "a period is {from, to}, each a YYYY-MM-DD date or null, and `to` is "
                     + "not before `from`. Nothing was written.");
    /* END DEC-49 REGION is-standard-period */
    const supersedes = a.supersedes == null || a.supersedes === "" ? null : String(a.supersedes);
    if (supersedes !== null) {
      /* DEC-49 REGION is-superseded-held */
      if (!this.#row(supersedes))
        return refusal("STANDARD_SUPERSEDES_UNKNOWN", "no standard answers to the id this one is said to supersede. "
                       + "Nothing was written.", { supersedes });
      /* END DEC-49 REGION is-superseded-held */
      const later = this.#successorOf(supersedes);
      /* DEC-49 REGION is-supersession-once */
      if (later)
        return refusal("STANDARD_ALREADY_SUPERSEDED", `${supersedes} is already superseded by ${later}. Nothing was `
                       + "written.", { supersedes, superseded_by: later });
      /* END DEC-49 REGION is-supersession-once */
    }
    return { ok: true, fields: { cite, kind: a.kind, issuer, texts, period, supersedes } };
  }

  /* R2: the first named content id `content.contentRow` does not hold (or, for a viewer, whose document the viewer
     may not see: one answer), or null. */
  #unresolvedText(texts, viewer) {
    for (const id of texts) {
      const row = this.content.contentRow(id);
      if (!row || (viewer !== null && !this.membership.inSight(row.bundle_id, viewer))) return id;
    }
    return null;
  }

  /* R1, R10: the one write. The id is allocated, the document promoted and the rows written in one transaction, so a
     refusal anywhere leaves nothing (record-core R32). */
  #write(f, author, viewer, proposalId) {
    return this.record.transact(() => {
      const at = this.#when();
      const id = `${this.record.allocId("STD", at.slice(0, 4)).id}-${f.kind}`;
      const source = this.sourceOf(f.cite, f);
      const text = standardDoc({ id, ...f, source, proposal: proposalId, author, at });
      this.#writing = id;
      let r;
      try {
        r = this.promotion.promote({ bundleId: id, base: null, snapKey: `${at.replace(/[-:]/g, "")}_${rand(4)}`, author,
          files: [{ path: "bundle.md", text }],
          meta: { object_type: STANDARD, title: titleOf(f.cite), current_state: "recorded", created: at, last_updated: at },
          actorIdentity: author, actorViewer: viewer ?? author });
      } finally { this.#writing = null; }
      if (!r || !r.ok) return r;
      this.sql.exec(`INSERT INTO standards (standard_id, cite, kind, issuer, period_from, period_to, supersedes,
                       source_json, proposal_id, declared_by, declared_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
                    id, f.cite, f.kind, f.issuer, f.period.from, f.period.to, f.supersedes, JSON.stringify(source),
                    proposalId, author, at);
      f.texts.forEach((c, i) => this.sql.exec(`INSERT INTO standard_texts (standard_id, ord, content_id) VALUES (?,?,?)`,
                                              id, i, c));
      if (proposalId)
        this.sql.exec(`INSERT INTO standard_adoptions (proposal_id, standard_id, adopted_by, adopted_at) VALUES (?,?,?,?)`,
                      proposalId, id, author, at);
      return { ok: true, ...this.#answer(this.#row(id)), bundleSha: r.bundleSha };
    });
  }

  /* ===================================================================== *
   * READING (R5–R8)
   * ===================================================================== */

  #row(id) {
    return typeof id === "string" && id ? this.#one(`SELECT * FROM standards WHERE standard_id=?`, id) : null;
  }

  #successorOf(id) {
    const r = this.#one(`SELECT standard_id FROM standards WHERE supersedes=?`, id);
    return r ? r.standard_id : null;
  }

  /* R1's fields, R3's source, the declarer and time (R4), both ends of a supersession (R6), the proposal (R10). */
  #answer(row) {
    const texts = this.#rows(`SELECT content_id FROM standard_texts WHERE standard_id=? ORDER BY ord`, row.standard_id)
      .map((t) => t.content_id);
    return { id: row.standard_id, cite: row.cite, kind: row.kind, issuer: row.issuer, text: texts,
             period: { from: row.period_from ?? null, to: row.period_to ?? null }, source: safeJson(row.source_json),
             declared_by: row.declared_by, declared_at: row.declared_at, supersedes: row.supersedes ?? null,
             superseded_by: this.#successorOf(row.standard_id), proposal: row.proposal_id ?? null };
  }

  /** R5: one standard, with each text passage's standing and whether a newer capture of its document holds it. */
  standardRead({ id = null, viewer = null } = {}) {
    const sid = str(id);
    /* NO_ID, the generic code of many reads, is row-less under the catalogue's REC-64 rule (K163), as every other
       module answers it. */
    if (!sid) return { ok: false, reason: "NO_ID", detail: "name the standard to read: id=<standard id>." };
    const row = this.#row(sid);
    if (!row || !this.#readable(sid, viewer)) return refuseNoSuchStandard(sid);
    const a = this.#answer(row);
    const standings = this.content.standings(a.text);
    const texts = a.text.map((contentId) => ({ content_id: contentId, standing: standings[contentId] ?? null,
                                               newer: this.content.passageNotice({ contentId, viewer }) }));
    return { ok: true, ...a, texts,
             says: "a standard as the record holds it: what it is and where it comes from, never whether it is a good "
                 + "one. Each passage of its text says whether a newer capture of its document still holds it; "
                 + "nothing is moved." };
  }

  /* R5: what a viewer may read. A standard is a bundle outside any project, so membership R43 lets every member, machine
     credential and the founder see it; any other viewer, and none, is answered as for an absent standard. */
  #readable(id, viewer) { return viewer !== null && viewer !== undefined && this.membership.inSight(id, viewer); }

  /** R7: whether a standard was in force on a date, with why. */
  inForce(id, date) {
    if (!isDate(date)) return refuseDateInvalid(date);
    const row = this.#row(str(id));
    if (!row) return refuseNoSuchStandard(str(id));
    return { ok: true, id: row.standard_id, date, ...inForceAt({ from: row.period_from, to: row.period_to }, date) };
  }

  /** R8: the standards the filters admit, in id order, at most `PAGE_MAX` per page; with `at`, each with R7's answer
   *  and the ones not in force left out. Every filter is applied in SQL, so the page and its cut are exact. */
  standardsIn({ at = null, kind = null, source = null, cite = null, after = null, limit = null, viewer = null } = {}) {
    const date = at == null || at === "" ? null : at;
    if (date !== null && !isDate(date)) return refuseDateInvalid(date);
    if (kind != null && kind !== "" && !STANDARD_KINDS.includes(kind)) return refuseKindUnknown(kind);
    const n = Number.isInteger(Number(limit)) && limit !== null && limit !== "" ? Math.min(PAGE_MAX, Math.max(1, Number(limit)))
      : PAGE_MAX;
    const gate = viewerPredicate(viewer);
    const where = [`(${gate.sql})`], args = [...gate.args];
    if (kind) { where.push("s.kind=?"); args.push(kind); }
    if (str(source) === "undetermined") where.push(`json_extract(s.source_json, '$.state')='undetermined'`);
    else if (str(source)) { where.push(`json_extract(s.source_json, '$.source')=?`); args.push(str(source)); }
    if (str(cite)) { where.push("instr(lower(s.cite), lower(?)) > 0"); args.push(str(cite)); }
    if (date) { where.push("NOT ((s.period_from IS NOT NULL AND s.period_from > ?) OR (s.period_to IS NOT NULL AND s.period_to < ?))");
                args.push(date, date); }
    if (str(after)) { where.push("s.standard_id > ?"); args.push(str(after)); }
    const rows = this.#rows(`SELECT s.* FROM standards s JOIN bundles b ON b.bundle_id = s.standard_id
                              WHERE ${where.join(" AND ")} ORDER BY s.standard_id LIMIT ?`, ...args, n + 1);
    const truncated = rows.length > n;
    const page = rows.slice(0, n);
    const items = page.map((r) => ({ ...this.#answer(r),
      ...(date ? { in_force: inForceAt({ from: r.period_from, to: r.period_to }, date) } : {}) }));
    return { ok: true, items, count: items.length, limit: n, truncated,
             cursor: truncated ? page[page.length - 1].standard_id : null,
             ...(date ? { at: date, says: `standards in force on ${date}, or whose period does not decide it (stated `
                                          + "undetermined); a standard whose stated period excludes the date is left out" }
                      : {}) };
  }

  /* ===================================================================== *
   * PROPOSALS (R9, R10)
   * ===================================================================== */

  /** R9: a proposal, stored apart from standards and labelled with who proposed it and whether it is machine work. */
  standardPropose(args = {}) {
    const a = isObj(args) ? args : {};
    const unknown = refuseFieldUnknown(a, PROPOSE_KEYS);
    if (unknown) return unknown;
    const who = str(a.proposer);
    /* DEC-49 REGION is-proposer-named */
    if (!who)
      return refusal("STANDARD_PROPOSER_UNNAMED", "the plane stamps the proposer from the credential that asked, and this "
                     + "call carries nobody. Nothing was written.");
    /* END DEC-49 REGION is-proposer-named */
    const cite = str(a.cite);
    if (!cite || cite.length > CITE_MAX) return refuseNoCite(cite.length);
    if (a.kind != null && a.kind !== "" && !STANDARD_KINDS.includes(a.kind)) return refuseKindUnknown(a.kind);
    const texts = a.text == null ? [] : textIds(a.text);
    if (texts === null || texts.length > TEXTS_MAX) return refuseTextUnresolved(null);
    const unresolved = this.#unresolvedText(texts, a.viewer ?? null);
    if (unresolved) return refuseTextUnresolved(unresolved);
    const why = str(a.why);
    /* DEC-49 REGION is-proposal-why */
    if (!why || why.length > WHY_MAX)
      return refusal("STANDARD_WHY_INVALID", `a proposal says why, in 1 to ${WHY_MAX} characters. Nothing was written.`,
                     { max: WHY_MAX });
    /* END DEC-49 REGION is-proposal-why */
    const act = a.act == null || a.act === "" ? null : a.act;
    /* DEC-49 REGION is-proposal-act */
    if (act !== null && (typeof act !== "string" || !act.trim() || act.length > ACT_MAX))
      return refusal("STANDARD_ACT_INVALID", `the act a proposal names is an id of at most ${ACT_MAX} characters. `
                     + "Nothing was written.", { max: ACT_MAX });
    /* END DEC-49 REGION is-proposal-act */
    return this.record.transact(() => {
      const at = this.#when();
      const id = this.record.allocId("STDP", at.slice(0, 4)).id;
      const kind = a.kind || null, issuer = str(a.issuer) || null;
      this.sql.exec(`INSERT INTO standard_proposals (proposal_id, cite, kind, issuer, text_json, why, act, proposed_by,
                       proposed_at) VALUES (?,?,?,?,?,?,?,?,?)`,
                    id, cite, kind, issuer, JSON.stringify(texts), why, act === null ? null : act.trim(), who, at);
      return { ok: true, proposal: this.#proposalAnswer(this.#proposal(id)), standard: false,
               says: "this is a proposal and not a standard: it is not in the record's standards and no list of "
                   + "standards shows it. Only a member recording a standard, or adopting this proposal, enters one." };
    });
  }

  #proposal(id) {
    return typeof id === "string" && id ? this.#one(`SELECT * FROM standard_proposals WHERE proposal_id=?`, id) : null;
  }

  #proposalAnswer(p) {
    const adopted = this.#one(`SELECT standard_id, adopted_by, adopted_at FROM standard_adoptions WHERE proposal_id=?`,
                              p.proposal_id);
    return { id: p.proposal_id, cite: p.cite, kind: p.kind ?? null, issuer: p.issuer ?? null,
             text: safeJson(p.text_json) || [], why: p.why, act: p.act ?? null, at: p.proposed_at,
             ...proposalLabel(p.proposed_by, STANDARD),
             adoption: adopted ? { standard: adopted.standard_id, by: adopted.adopted_by, at: adopted.adopted_at } : null };
  }

  /** R10: a member adopts a proposal: R1 by that member, naming it. A field the member does not state is the
   *  proposal's, and the answer says which were; the standard records the proposal, and the proposal its adoption. */
  standardAdopt(args = {}) {
    const a = isObj(args) ? args : {};
    const byMachine = machineRefusal(a.author);
    if (byMachine) return byMachine;
    const unknown = refuseFieldUnknown(a, ADOPT_KEYS);
    if (unknown) return unknown;
    const p = this.#proposal(str(a.proposal));
    /* DEC-49 REGION is-proposal-held */
    if (!p || (a.viewer != null && viewerPredicate(a.viewer).scope === "DENY"))
      return refusal("STANDARD_NO_SUCH_PROPOSAL", "no proposal of a standard answers to that id here. Nothing was "
                     + "written.", { proposal: str(a.proposal) || null });
    /* END DEC-49 REGION is-proposal-held */
    const done = this.#adoptRefusal(p);
    if (done) return done;
    const fromProposal = [];
    const take = (k, v) => { if (a[k] == null || a[k] === "") { if (v != null) fromProposal.push(k); return v; } return a[k]; };
    const fields = { ...a, cite: take("cite", p.cite), kind: take("kind", p.kind), issuer: take("issuer", p.issuer),
                     text: take("text", (safeJson(p.text_json) || []).length ? safeJson(p.text_json) : null) };
    const d = this.#declareRefusal(fields);
    if (d.ok === false) return d;
    const r = this.#write(d.fields, str(a.author), a.viewer ?? null, p.proposal_id);
    if (!r || !r.ok) return r;
    return { ...r, adopted: { proposal: p.proposal_id, from_proposal: fromProposal,
                              says: fromProposal.length ? `${fromProposal.join(", ")} taken from the proposal as it was made`
                                                        : "every field stated by the adopting member" } };
  }

  /* R10: a proposal is adopted at most once. */
  #adoptRefusal(p) {
    const held = this.#one(`SELECT standard_id FROM standard_adoptions WHERE proposal_id=?`, p.proposal_id);
    /* DEC-49 REGION is-proposal-open */
    if (held)
      return refusal("STANDARD_PROPOSAL_ADOPTED", `${p.proposal_id} was adopted as ${held.standard_id}. Nothing was written.`,
                     { proposal: p.proposal_id, standard: held.standard_id });
    /* END DEC-49 REGION is-proposal-open */
    return null;
  }
}

/* ---- the document (R15) ---- */

/** The title a standard's document carries: its citation, as the front matter can hold it. */
const titleOf = (cite) => String(cite).replace(/["\\\r\n]/g, " ").slice(0, CITE_MAX);

/* The core fields every record document states (C-2.2): a member's act, nothing pending, nothing drawn. `group` is
   stamped by `promotion` (its R13). */
const CORE_TAIL = Object.freeze(["produced_by:", "  mode: human", "  capability_tier: session", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []"]);

/** R15: a new standard's document, `recorded`. The citation and issuer, which may hold any character, are kept whole in
 *  body sections; the front matter holds what the grammar holds bare. */
function standardDoc({ id, cite, kind, issuer, texts, period, supersedes, source, proposal, author, at }) {
  const src = source && source.state === "matched"
    ? `Matched: ${source.source} (${source.kind}, ${source.issuer}, level ${source.level}), from the profile `
      + `${source.profile} (basis ${source.basis}).`
    : `Undetermined: ${source ? source.why : "not read"}.`;
  return ["---", `id: ${id}`, `object_type: ${STANDARD}`, `schema: ${STANDARD}@1`, `title: ${q(titleOf(cite))}`,
    "current_state: recorded", "prior_state: null", `created: ${q(at)}`, `last_updated: ${q(at)}`, `kind: ${kind}`,
    `period_from: ${period.from === null ? "null" : q(period.from)}`, `period_to: ${period.to === null ? "null" : q(period.to)}`,
    `supersedes: ${supersedes ?? "null"}`, `adopted_from: ${proposal ?? "null"}`, `texts: [${texts.join(", ")}]`,
    `author: ${bare(author)}`, ...CORE_TAIL, "---", "", "## Citation", "", bodyText(cite), "", "## Issuer", "",
    bodyText(issuer), "", "## Source", "", bodyText(src), "", "## Session Log", "",
    `### Session ${at} | Recorded | ${author}`,
    `Changes: standard recorded${supersedes ? `, superseding ${supersedes}` : ""}${proposal ? `, adopting ${proposal}` : ""}.`,
    ""].join("\n");
}

/* ---- the fields ---- */

/* R2: one or more content ids, as a string or a list; null when not in that shape. Repeats are kept once. */
function textIds(v) {
  const list = typeof v === "string" ? [v] : Array.isArray(v) ? v : null;
  if (!list || !list.every((x) => typeof x === "string")) return null;
  return [...new Set(list.map((x) => x.trim()).filter(Boolean))];
}

/* R1: `{from, to}`, each a date or null (absent is null); the period with nulls, or null when invalid. */
function periodOf(p) {
  if (p === undefined || p === null) return { from: null, to: null };
  if (!isObj(p) || Object.keys(p).some((k) => k !== "from" && k !== "to")) return null;
  const from = p.from ?? null, to = p.to ?? null;
  if ((from !== null && !isDate(from)) || (to !== null && !isDate(to))) return null;
  if (from !== null && to !== null && to < from) return null;
  return { from, to };
}

/* DEC-49: a code several acts answer is minted at one site, its own function here, which builds the refusal whole from
   its row; each act relays it with its own detail. */

/* R1, R10, R11: recording a standard is a named member's act. */
function machineRefusal(author) {
  /* DEC-49 REGION is-standard-member */
  if (str(author) && !isMachineIdentity(str(author))) return null;
  return refusal("MACHINE_CANNOT_DECLARE_STANDARD", "recording a standard is a named member's act; a machine proposes one "
                 + "(standardPropose). Nothing was written.");
  /* END DEC-49 REGION is-standard-member */
}

function refuseFieldUnknown(a, keys) {
  const unknown = Object.keys(a).filter((k) => !keys.includes(k)).sort();
  /* DEC-49 REGION is-standard-field */
  if (unknown.length)
    return refusal("STANDARD_FIELD_UNKNOWN", `this act takes ${keys.join(", ")}, and not ${unknown.join(", ")}. Nothing `
                   + "was written.", { rejected: unknown, accepted: [...keys] });
  /* END DEC-49 REGION is-standard-field */
  return null;
}

function refuseNoCite(length) {
  /* DEC-49 REGION is-standard-cited */
  return refusal("STANDARD_NO_CITE", length ? `a citation is at most ${CITE_MAX} characters, and this one is ${length}. `
                 + "Nothing was written." : "a standard is recorded with its citation. Nothing was written.",
                 { max: CITE_MAX });
  /* END DEC-49 REGION is-standard-cited */
}

function refuseKindUnknown(kind) {
  /* DEC-49 REGION is-standard-kind */
  return refusal("STANDARD_KIND_UNKNOWN", `a standard's kind is one of ${STANDARD_KINDS.join(", ")}. Nothing was written.`,
                 { kind: typeof kind === "string" ? kind.slice(0, 40) : null, kinds: [...STANDARD_KINDS] });
  /* END DEC-49 REGION is-standard-kind */
}

function refuseTextUnresolved(contentId) {
  /* DEC-49 REGION is-standard-text-held */
  return refusal("STANDARD_TEXT_UNRESOLVED", contentId
    ? `no content row is held for ${String(contentId).slice(0, 80)}. Nothing was written.`
    : `a proposal's text is a list of at most ${TEXTS_MAX} content ids. Nothing was written.`,
    { content_id: contentId === null ? null : String(contentId).slice(0, 80) });
  /* END DEC-49 REGION is-standard-text-held */
}

function refuseNoSuchStandard(id) {
  /* DEC-49 REGION is-standard-held */
  const asked = id ? String(id).slice(0, 80) : null;
  return refusal("NO_SUCH_STANDARD", "no standard answers to that id here. One your credential may not read is answered "
                 + "exactly as one that does not exist.", { id: asked });
  /* END DEC-49 REGION is-standard-held */
}

function refuseDateInvalid(date) {
  /* DEC-49 REGION is-date-readable */
  return refusal("STANDARD_DATE_INVALID", "a date is written YYYY-MM-DD and names a day that exists.",
                 { date: typeof date === "string" ? date.slice(0, 40) : null });
  /* END DEC-49 REGION is-date-readable */
}

/** The ops whose handlers are this module's (K3): the control plane routes, authenticates and stamps them (`author` and
 *  `proposer` in the body; `viewer` in the URL, read after the body so a body cannot set it). Legacy-index routes them
 *  (REPORT to BOB, layer 11). */
export function standardsOps(s, url, body) {
  const qp = (k) => url.searchParams.get(k);
  const b = body || {};
  return {
    standarddeclare: () => s.standardDeclare({ ...b, viewer: qp("viewer") }),
    standard: () => s.standardRead({ id: qp("id"), viewer: qp("viewer") }),
    standards: () => s.standardsIn({ at: qp("at"), kind: qp("kind"), source: qp("source"), cite: qp("cite"),
                                     after: qp("after"), limit: qp("limit"), viewer: qp("viewer") }),
    standardinforce: () => s.inForce(qp("id"), qp("date")),
    standardpropose: () => s.standardPropose({ ...b, viewer: qp("viewer") }),
    standardadopt: () => s.standardAdopt({ ...b, viewer: qp("viewer") }),
  };
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It registers its check with promotion (R39,
 *  for R11) and its tables with purge (R14). */
export function standardsOf(host, deps) {
  let s = instances.get(host);
  if (!s) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    s = new Standards({ ...d, storage, record, membership, promotion,
                        content: d.content || (() => contentOf(host, { record, membership })) });
    instances.set(host, s);
    record.declarePurge("standards", STANDARDS_TABLES);
    promotion.registerStep("standards", { check: (c) => s.check(c) });
  }
  return s;
}
