/* docket — a published case's docket (requirements: `build/requirements/docket.md`; DEC-116, DEC-100; Publication
 * §5D; N520, K1256, K1257).
 *
 * After a case is published, the world responds without changing the case. Each case's docket holds dated entries
 * beside it, each naming the edition it concerns, on three shelves: `listed` (what the group stands behind as accurately
 * listed), `reactions` (reactions elsewhere) and `record` (in our record only). Any joined member files a record entry
 * (R1) and may mark it as a threat (R2); only the case's manager places an entry in public, prepared here and signed in
 * the browser with their registered key (`NS_DOCKET`), as a case and a working-on notice are: prepare, sign, post
 * (R4–R6). The manager may decline a submission containing redactions (R7) or list a reply naming a private person as
 * received (R8); grants of standing (R10), take-backs (R11) and the withdrawal of an edition (R12) are public entries
 * like any other. `coreDue` answers the manager's To-dos (R9). The public shelves and a feed per case are answered for
 * anybody to pull (R14, R15), served by `public-read` (its R21). This module sends nothing anywhere, and no entry is ever
 * evidence (R17, R20).
 *
 * A NEW MODULE (T27, layer 8, directly after `publication`). REACHED as `docketOf(host, deps)` (K61): one instance per
 * host. At creation it creates its tables, declares them to record-core's purge (whole store only, R16), registers its
 * figures (record-core R63) and its record entry ids' mint seed, and fills `reevaluation`'s docket registration (R13).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record        `transact`, `mintOpaqueId`, `registerMintSeed`, `declarePurge`, `registerCounts`, `readFile`,
 *                 `evidenceStore` (the evidence store's bytes, R14).
 *   membership    `sight` (R44), `isProjectOwner`, `isJoinedParticipant` (R54), `positionalMember`.
 *   credentials   `attestingKeys` (R11).
 *   promotion     the fact `producingGroup` (its R40).
 *   provenance    `homeOf`, and the `register` and `captured_locators` read contract (its R48).
 *   attestation   `attestationsOf` (its R7): a capture's co-archive.
 *   entities      `readEntity` (its R5): the subject's name.
 *   inquiry       `subjectEntityOf` (its R43): the named subjects.
 *   reevaluation  `registerDocket`, `docketActed` (its R30).
 *   publication   `caseTensions` (its R50); its tables `cases`, `published_cases`, `published_case_members` and
 *                 `case_documents` under its R40.
 *   now           the clock, milliseconds (default `env.BIO_NOW_MS`, else the wall clock).
 *
 * The words a member or reader sees (the shelves' labels, the outward-act warning, the invitation, the stamp) are the
 * UX design stream's; this module carries a code and a plain statement of meaning, never their final words. No place is
 * named here (R21). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf } from "../membership/index.mjs";
import { credentialsOf } from "../credentials/index.mjs";
import { promotionOf } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { attestationOf } from "../attestation/index.mjs";
import { entitiesOf } from "../entities/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { reevaluationOf } from "../reevaluation/index.mjs";
import { publicationOf } from "../publication/index.mjs";
import { whatChangedOf } from "../case-grammar/index.mjs";
import { verifySshsig, NS_DOCKET, docketStatement } from "../sshsig.mjs";
import { isMachineIdentity } from "../record-grammar/actors.mjs";
import { canonicalJson } from "../record-grammar/json.mjs";
import { sha256HexSync } from "../record-grammar/sha256.mjs";
import { parseFrontmatter } from "../record-grammar/frontmatter.mjs";
import { DOCKET_CHECKS, rowOf } from "./checks.mjs";
import { DOCKET_TABLES, migrateDocket } from "./schema.mjs";
import { renderFeed, docketAddress, feedAddress, ATOM_MEDIA_TYPE } from "./feed.mjs";

export { DOCKET_CHECKS } from "./checks.mjs";
export { DOCKET_SCHEMA, DOCKET_TABLES } from "./schema.mjs";
export { docketAddress, feedAddress, feedHref, ATOM_MEDIA_TYPE, FEED_ID_PREFIX } from "./feed.mjs";

/* ---------------------------------------------------------------- the vocabularies and bounds */

/** R6 (DEC-124, K1365): the label a new public entry carries. */
export const ENTRY_FORMAT = "civicsmith-docket-entry/1";
/** R6: the label an entry published before T31 keeps with its bytes; the same format, accepted by every reader forever. */
export const LEGACY_ENTRY_FORMAT = "civicos-docket-entry/1";
/** R6: both labels of the one entry format. */
export const ENTRY_FORMATS = Object.freeze([ENTRY_FORMAT, LEGACY_ENTRY_FORMAT]);
/** R6: whether `label` names the docket entry format, under either label. */
export const isEntryFormat = (label) => ENTRY_FORMATS.includes(label);
export const SHELVES = Object.freeze(["listed", "reactions", "record"]);
export const PUBLIC_SHELVES = Object.freeze(["listed", "reactions"]);
export const RECORD_KINDS = Object.freeze(["response", "statement", "reaction", "outcome"]);       /* R1 */
export const ENTRY_KINDS = Object.freeze([...RECORD_KINDS, "edition", "disclosure", "withdrawal", "standing-granted",
  "standing-withdrawn", "receipt", "take-back"]);                                         /* R6 */
export const FROM_KINDS = Object.freeze(["subject", "holder", "other"]);
export const PROPOSALS = Object.freeze(["record", "public", "both"]);                     /* R1 */
export const PRESSURE_KINDS = Object.freeze(["legal", "retaliation", "discrediting", "other"]);   /* R2: as `actions` R48's */
export const FOUND_BY = Object.freeze(["paste", "watch"]);                                /* R1 */
export const RECORD_STATES = Object.freeze(["pending", "placed", "declined", "receipted", "taken-back"]);  /* R3 */
export const CORE_KINDS = Object.freeze(["response", "statement", "edition", "tension"]);  /* R9 */
/** `affordances` R34: the vocabularies this module owns. */
export const DOCKET_VOCABULARIES = Object.freeze({
  docket_shelves: SHELVES, docket_entry_kinds: ENTRY_KINDS, docket_proposals: PROPOSALS,
  docket_pressure_kinds: PRESSURE_KINDS,
});
export const REASON_MAX = 2000;        /* R1, DEC-88's */
export const NAME_MAX = 200;           /* R1 */
export const NOTE_MAX = 500;           /* R2 */
export const SUMMARY_MAX = 600;        /* R4 */
export const PREPARED_TTL_MS = 60 * 60 * 1000;   /* R4: `expires` */
/** R10: the prefix record entry ids are minted under (record-core R6). */
export const RECORD_ID_PREFIX = "DKT";
/** R8: the fixed head of a receipt's published reason; the manager's words follow it. */
export const RECEIPT_REASON = "names a private person";
/** R15: what a citing copy says when it cannot read a docket (DEC-116 item 8). */
export const DOCKET_UNREADABLE = "Could not read the publisher's docket";
/** R4: the outward-act warning, as a code and its meaning; its words are the UX design stream's. */
export const OUTWARD_ACT_WARNING = Object.freeze({
  code: "docket_outward_act",
  meaning: "The public will see this entry; a later entry can take it back but never unsay it.",
});
/** R8: the request to resend a reply without the private person's name, as a code and its meaning; its words are the
 *  UX design stream's, and this module sends nothing. */
export const RESEND_INVITATION = Object.freeze({
  code: "docket_resend_without_name",
  meaning: "Your reply names a private person, so the group lists it as received without its text. Please send it "
    + "again without the name, and the group will list it whole.",
});
/** R3: the plan checkpoint a contesting entry offers; `action-plans`' own act, never performed here. */
export const CHECKPOINT_OFFER = Object.freeze({ code: "plan_checkpoint", act: "action-plans", performed: false });

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
const words = (v, max) => typeof v === "string" && !!v.trim() && v.length <= max && !LONE_SURROGATE.test(v);
const oneLine = (v, max) => words(v, max) && !/[\n\r]/.test(v);
const oneParagraph = (v, max) => words(v, max) && !/\r?\n[ \t]*\r?\n/.test(v);
const parse = (s) => { if (s && typeof s === "object") return s; try { return JSON.parse(s); } catch { return null; } };
const int = (v) => { const n = Number(v); return v !== null && v !== "" && v !== undefined && Number.isInteger(n) ? n : null; };
const yes = (v) => v === true || v === "true" || v === "1" || v === 1;
const isSha = (v) => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);
const dayOf = (iso) => String(iso).slice(0, 10);
const td = new TextDecoder();
const b64 = (bytes) => { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const publicId = (caseId, seq) => `${caseId}#${seq}`;

/* DEC-49: a refusal of this module's own carries its code, its row and the member's translation; one another module
   answered passes through as it came. */
export function withRow(r) {
  if (!r || typeof r !== "object" || r.ok !== false || typeof r.reason !== "string" || r.check) return r;
  const row = rowOf(r.reason);
  return row ? { ...r, code: r.code ?? r.reason, check: row.check, translation: row.translation } : r;
}
const refuse = (code, detail, extra) => withRow({ ok: false, reason: code, detail, ...(extra || {}) });
/** R1, R3, R4: the one answer for an absent case, a case with no ratified edition and one the viewer does not see. */
export const noSuchCase = (caseId) => ({ ok: false, reason: "NO_SUCH_CASE", case: str(caseId),
  detail: "no published case answers here by that id for you; an absent case, one never published and one you do not "
    + "see answer the same" });

export class Docket {
  #held = new Map();       /* R4, R5: prepared answers, by member and digest, kept in memory: prepare writes nothing */
  #deps;

  constructor({ storage, record, membership, host = null, env = null, now = null, ...deps } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
    this.#deps = { host, ...deps };
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get credentials() { return this.#deps.credentials ||= credentialsOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get promotion() { return this.#deps.promotion ||= promotionOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get attestation() { return this.#deps.attestation ||= attestationOf(this.#deps.host, { record: this.record, provenance: this.provenance }); }
  get entities() { return this.#deps.entities ||= entitiesOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get reevaluation() { return this.#deps.reevaluation ||= reevaluationOf(this.#deps.host, { record: this.record, membership: this.membership }); }
  get publication() { return this.#deps.publication ||= publicationOf(this.#deps.host, { record: this.record, membership: this.membership }); }

  migrate() { migrateDocket(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #call(fn, dflt = null) { try { return fn(); } catch { return dflt; } }
  #nowMs() {
    if (this.now) { const n = Number(this.now()); if (Number.isFinite(n) && n >= 0) return n; }
    const v = Number(this.env.BIO_NOW_MS);
    return Number.isFinite(v) && v >= 0 ? v : Date.now();
  }
  #stamp(ms = this.#nowMs()) { return stampInstant("second", ms); }

  /* ================================================================ facts read from neighbours */

  /* The member an identity names, or null for a machine, an AI credential, an operator token or nobody (R18). */
  #member(identity) {
    if (!str(identity) || isMachineIdentity(identity)) return null;
    return this.#call(() => this.membership.positionalMember(null, String(identity).trim()));
  }
  #slug() {
    const f = this.#call(() => this.promotion.fact("producingGroup"));
    return f && f.ok && str(f.value) ? str(f.value) : null;
  }
  /* The case's ratified editions, `{edition, ratified_at}` in edition order (publication R40). */
  #editions(caseId) {
    return this.#call(() => this.#rows(`SELECT edition, ratified_at FROM published_cases WHERE case_id=? AND ratified_at IS NOT NULL
                                         ORDER BY edition`, caseId), [])
      .map((r) => ({ edition: Number(r.edition), ratified_at: r.ratified_at }));
  }
  /* A case holding a ratified edition, with its owning project; null otherwise. */
  #case(caseId) {
    const id = str(caseId);
    if (!id) return null;
    const c = this.#call(() => this.#one(`SELECT case_id, project_id FROM cases WHERE case_id=?`, id));
    if (!c) return null;
    const editions = this.#editions(id);
    return editions.length ? { case: id, project: str(c.project_id), editions } : null;
  }
  /* R1, R3, R4: the case as `viewer` may act on it, or `NO_SUCH_CASE`, the same answer for each way it is not. */
  #caseFor(caseId, viewer) {
    const c = this.#case(caseId);
    if (!c || !c.project || this.#call(() => this.membership.sight(c.project, viewer)) !== "full")
      return { refusal: noSuchCase(caseId) };
    return { c };
  }
  #isManager(project, member) { return !!project && !!member && this.#call(() => this.membership.isProjectOwner(project, member), false); }
  /* R1: each subject entity of the edition's member findings (inquiry R43). */
  #namedSubjects(caseId, edition) {
    const members = this.#call(() => this.#rows(`SELECT bundle_id FROM published_case_members WHERE case_id=? AND edition=?
                                                  ORDER BY ord`, caseId, edition), []);
    return new Set(members.map((m) => this.#call(() => this.inquiry.subjectEntityOf(m.bundle_id))).filter((s) => str(s)));
  }
  /* R13: the edition's member findings at their pins. */
  #pins(caseId, edition) {
    return this.#call(() => this.#rows(`SELECT bundle_id, version_sha FROM published_case_members WHERE case_id=? AND edition=?
                                         ORDER BY ord`, caseId, edition), [])
      .filter((m) => str(m.version_sha)).map((m) => ({ bundle_id: m.bundle_id, sha: m.version_sha }));
  }
  /* R6: the subject's canonical name as the registry holds it (entities R5). */
  #entityName(entityId) {
    const r = this.#call(() => this.entities.readEntity({ entityId }));
    const e = r && r.ok && r.found ? r.entity : null;
    if (!e) return entityId;
    const live = (e.aliases || []).filter((a) => !a.withdrawn);
    return (live.find((a) => a.canonical) || live[0] || {}).alias || str(e.label) || entityId;
  }

  /* R1, R4: what the record holds of a capture: whether the register holds it with an origin locator (provenance
     R48), its origin, its co-archive's locator (attestation R7) and whether its register entry was filed by a sweep
     (`acquisition` R21's `origin.kind: "sweep"`). */
  #capture(sha) {
    if (!isSha(sha)) return { held: false };
    const loc = this.#call(() => this.#one(
      `SELECT l.address FROM register r JOIN captured_locators l ON l.capture_sha = r.capture_sha
        WHERE r.capture_sha=? ORDER BY l.first_retrieved, l.address LIMIT 1`, sha));
    if (!loc) return { held: false };
    const att = this.#call(() => this.attestation.attestationsOf(sha));
    const co = att && att.ok && Array.isArray(att.attestations) ? att.attestations.find((a) => a.kind === "co_archive" && str(a.locator)) : null;
    let sweep = false;
    const home = this.#call(() => this.provenance.homeOf(sha));
    if (home) {
      const f = this.#call(() => this.record.readFile(home.bundleId, "data/provenance.json"));
      const reg = f && typeof f.text === "string" ? parse(f.text) : null;
      sweep = !!(reg && Array.isArray(reg.documents) && reg.documents.some((d) => d && typeof d === "object"
        && d.capture && String(d.capture.sha256 || "").replace(/^sha256:/, "") === sha
        && d.origin && typeof d.origin === "object" && d.origin.kind === "sweep"));
    }
    return { held: true, origin: loc.address, archived: co ? co.locator : null, found_by: sweep ? "watch" : "paste" };
  }

  /* ================================================================ the docket's own rows */

  #recordEntry(id) { return typeof id === "string" ? this.#one(`SELECT * FROM docket_record WHERE entry_id=?`, id) : null; }
  #marks(id) { return this.#rows(`SELECT * FROM docket_marks WHERE entry_id=? ORDER BY rn`, id); }
  #entries(caseId) { return this.#rows(`SELECT * FROM docket_entries WHERE case_id=? ORDER BY seq`, caseId); }
  #entry(caseId, seq) { return this.#one(`SELECT * FROM docket_entries WHERE case_id=? AND seq=?`, caseId, seq); }
  /* R11: each public entry a `take-back` names, by seq, with the take-back. */
  #takenBack(caseId) {
    const out = new Map();
    for (const e of this.#rows(`SELECT * FROM docket_entries WHERE case_id=? AND kind='take-back' ORDER BY seq`, caseId)) {
      const j = parse(e.json) || {};
      if (!out.has(j.takes_back)) out.set(j.takes_back, e);
    }
    return out;
  }
  /* R3: a record entry's state, with what settled it. */
  #recordState(id) {
    const pub = this.#one(`SELECT * FROM docket_entries WHERE record_entry=? ORDER BY published_at, seq LIMIT 1`, id);
    const marks = this.#marks(id);
    const decline = marks.find((m) => m.kind === "declined");
    const back = marks.find((m) => m.kind === "taken-back");
    if (pub) return { state: pub.kind === "receipt" ? "receipted" : "placed", pub };
    if (decline) return { state: "declined", decline };
    if (back) return { state: "taken-back", back };
    return { state: "pending" };
  }
  /* R10: a grant (a `standing-granted` entry of the case, by seq), with when it began and when it ended. */
  #grant(caseId, seq) {
    const n = int(seq);
    const g = n === null ? null : this.#entry(caseId, n);
    if (!g || g.kind !== "standing-granted") return null;
    const end = this.#rows(`SELECT * FROM docket_entries WHERE case_id=? AND kind='standing-withdrawn' ORDER BY seq`, caseId)
      .find((e) => (parse(e.json) || {}).answers === n);
    return { seq: n, holder: (parse(g.json) || {}).holder ?? null, granted_at: g.published_at, ended_at: end ? end.published_at : null };
  }
  /* R10: live at `at` from its post until a `standing-withdrawn` entry ends it; a submission filed at or before the end
     keeps the grant's rights. */
  #liveAt(grant, at) { return !!grant && grant.granted_at <= at && (!grant.ended_at || at <= grant.ended_at); }
  /* R12: each edition a withdrawal fixed at its post, by number. */
  #withdrawn(caseId) {
    const out = new Map();
    for (const e of this.#rows(`SELECT * FROM docket_entries WHERE case_id=? AND kind='withdrawal' ORDER BY seq`, caseId))
      for (const ed of parse(e.editions) || []) if (!out.has(ed)) out.set(ed, e);
    return out;
  }

  /* ================================================================ R1: filing to the record */

  /* R1's caller refusals: the machine, the case, the participant. */
  #filerRefusal({ case: caseId, author, viewer }) {
    const member = this.#member(author);
    /* DEC-49 REGION is-docket-filer */
    if (!member)
      return { refusal: refuse("MACHINE_CANNOT_FILE_DOCKET", str(author)
        ? "a docket entry is filed by a member signed in as themselves, and this caller is not one"
        : "no member is named as the one filing: this call carries nobody") };
    /* END DEC-49 REGION is-docket-filer */
    const k = this.#caseFor(caseId, str(viewer) || str(author));
    if (k.refusal) return k;
    /* DEC-49 REGION is-docket-filer */
    if (!this.#call(() => this.membership.isJoinedParticipant(k.c.project, member), false))
      return { refusal: refuse("DOCKET_NOT_A_PARTICIPANT", "only a joined participant of the case's project files to its docket",
                               { case: k.c.case }) };
    /* END DEC-49 REGION is-docket-filer */
    return { c: k.c, member };
  }

  /* R1's form checks, in R1's order, never merit; `at` the instant a holder's grant must be live at (the filing's).
     Answers the entry's fields or a refusal. Also R4's re-check of a record entry it would sign. */
  #formRefusal(c, { edition, from, capture, kind, proposed, reason, answers, contests }, at) {
    const f = parse(from);
    const ed = int(edition);
    /* DEC-49 REGION is-docket-form */
    if (ed === null || !c.editions.some((e) => e.edition === ed))
      return { refusal: refuse("DOCKET_NO_EDITION", "the edition named is not a ratified edition of this case",
                               { editions: c.editions.map((e) => e.edition) }) };
    if (!f || typeof f !== "object" || !FROM_KINDS.includes(f.kind))
      return { refusal: refuse("DOCKET_NOT_ATTRIBUTED", "from is {kind: subject, entity}, {kind: holder, grant} or {kind: other, name}") };
    let fromRow;
    if (f.kind === "subject") {
      const entity = str(f.entity);
      if (!entity || !this.#namedSubjects(c.case, ed).has(entity))
        return { refusal: refuse("DOCKET_NOT_THE_SUBJECT", `the entity named is not a subject of edition ${ed}`, { edition: ed }) };
      fromRow = { kind: "subject", entity };
    } else if (f.kind === "holder") {
      const grant = this.#grant(c.case, f.grant);
      if (!this.#liveAt(grant, at))
        return { refusal: refuse("DOCKET_NO_STANDING", "the grant named is not a grant of standing on this docket live at the filing",
                                 { grant: int(f.grant) }) };
      fromRow = { kind: "holder", grant: grant.seq };
    } else {
      if (!oneLine(f.name, NAME_MAX))
        return { refusal: refuse("DOCKET_NOT_ATTRIBUTED", `the source's name is one line of 1 to ${NAME_MAX} characters`) };
      fromRow = { kind: "other", name: f.name.trim() };
    }
    const cap = this.#capture(capture);
    if (!cap.held)
      return { refusal: refuse("DOCKET_NO_CAPTURE", "the capture named is not one the register holds with its origin locator",
                               { capture: typeof capture === "string" ? capture : null }) };
    const fits = { response: ["subject", "holder"], statement: ["subject", "holder"], reaction: ["other"], outcome: FROM_KINDS };
    if (!RECORD_KINDS.includes(kind) || !fits[kind].includes(fromRow.kind))
      return { refusal: refuse("DOCKET_KIND_UNKNOWN", "a response or statement is from the subject or a holder, a reaction "
        + "from anyone else, an outcome from anyone", { kind: typeof kind === "string" ? kind : null, from: fromRow.kind }) };
    let answering = null;
    if (answers !== undefined && answers !== null && answers !== "") {
      const r = this.#recordEntry(str(answers));
      if (!r || r.case_id !== c.case || this.#recordState(r.entry_id).state !== "receipted")
        return { refusal: refuse("NO_SUCH_DOCKET_ENTRY", "answers names no receipted record entry of this case", { answers: str(answers) }) };
      answering = r.entry_id;
    }
    if (!PROPOSALS.includes(proposed) || !words(reason, REASON_MAX))
      return { refusal: refuse("DOCKET_NO_REASON", `proposed is record, public or both, with a reason of 1 to ${REASON_MAX} characters`) };
    /* END DEC-49 REGION is-docket-form */
    return { fields: { edition: ed, from: fromRow, capture: cap, kind, proposed, reason, answers: answering, contests: yes(contests) } };
  }

  /** R1, R11, R13: files a record entry, or, with `takesBack`, takes an earlier record entry back with a reason. */
  docketFile({ case: caseId = null, edition = null, kind = null, from = null, capture = null, contests = false,
               proposed = null, reason = null, answers = null, takesBack = null, author = null, viewer = null } = {}) {
    const nowMs = this.#nowMs(), at = this.#stamp(nowMs);
    const k = this.#filerRefusal({ case: caseId, author, viewer });
    if (k.refusal) return k.refusal;
    const { c, member } = k;
    if (takesBack !== null && takesBack !== undefined && takesBack !== "") return this.#takeBackRecord(c, member, takesBack, reason, at);
    const v = this.#formRefusal(c, { edition, from, capture, kind, proposed, reason, answers, contests }, at);
    if (v.refusal) return v.refusal;
    const x = v.fields;
    let id = null;
    const out = this.record.transact(() => {
      id = this.record.mintOpaqueId(RECORD_ID_PREFIX, at.slice(0, 4), "", (y) => !!this.#recordEntry(y));
      if (!id) return { ok: false, reason: "MINT_EXHAUSTED", detail: "no free record entry id could be drawn; nothing was filed" };
      this.sql.exec(`INSERT INTO docket_record (entry_id, case_id, edition, kind, from_json, capture_sha, contests, proposed, reason,
                                                answers, found_by, author, filed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    id, c.case, x.edition, x.kind, JSON.stringify(x.from), capture, x.contests ? 1 : 0, x.proposed, x.reason,
                    x.answers, x.capture.found_by, member, at);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    /* R13: a contesting filing is told to reevaluation after it commits; a throw there never undoes it. */
    if (x.contests) this.#call(() => this.reevaluation.docketActed({ kind: "contested", case: c.case, entry: id }));
    return { ok: true, entry: id, case: c.case, edition: x.edition, kind: x.kind, shelf: "record", found_by: x.capture.found_by,
             contests: x.contests, filed_at: at };
  }

  /* R11: a record entry taken back by a later record act with a reason; it then reads `taken-back`. */
  #takeBackRecord(c, member, takesBack, reason, at) {
    const id = str(takesBack);
    const r = this.#entryRefusal(c.case, id);
    if (r) return r;
    /* DEC-49 REGION is-docket-form */
    if (!words(reason, REASON_MAX))
      return refuse("DOCKET_NO_REASON", `a take-back carries a reason of 1 to ${REASON_MAX} characters`);
    /* END DEC-49 REGION is-docket-form */
    const out = this.record.transact(() => {
      if (this.#recordState(id).state !== "pending")
        return refuse("DOCKET_ENTRY_SETTLED", "the entry was settled meanwhile", { entry: id });
      this.sql.exec(`INSERT INTO docket_marks (entry_id, kind, reason, by_member, at) VALUES (?,?,?,?,?)`, id, "taken-back", reason, member, at);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    return { ok: true, entry: id, case: c.case, state: "taken-back", taken_back: { reason, at } };
  }

  /* R4, R7, R11: a record entry of the case, still pending; null when it is. */
  #entryRefusal(caseId, id) {
    const r = this.#recordEntry(id);
    /* DEC-49 REGION is-docket-entry */
    if (!r || r.case_id !== caseId)
      return refuse("NO_SUCH_DOCKET_ENTRY", "no record entry of this case answers by that id", { entry: id });
    const s = this.#recordState(id);
    if (s.state !== "pending")
      return refuse("DOCKET_ENTRY_SETTLED", `the entry is already ${s.state}`, { entry: id, state: s.state });
    /* END DEC-49 REGION is-docket-entry */
    return null;
  }

  /* ================================================================ R2: the pressure mark */

  /** R2: marks a record entry as a threat; appended, never rewriting the entry. */
  docketPressure({ entry = null, pressure = null, author = null, viewer = null } = {}) {
    const member = this.#member(author);
    const id = str(entry);
    const r = this.#recordEntry(id);
    const p = parse(pressure);
    /* DEC-49 REGION is-docket-pressure */
    if (!member)
      return refuse("MACHINE_CANNOT_MARK_DOCKET_PRESSURE", "a docket entry is marked by a member signed in as themselves");
    const c = r ? this.#case(r.case_id) : null;
    if (!r || !c || !c.project || this.#call(() => this.membership.sight(c.project, str(viewer) || str(author))) !== "full")
      return refuse("NO_SUCH_DOCKET_ENTRY", "no record entry you see answers by that id", { entry: id });
    if (this.#marks(id).some((m) => m.kind === "pressure"))
      return refuse("DOCKET_PRESSURE_MARKED", "the entry is already marked", { entry: id });
    const note = p && typeof p === "object" && p.note !== undefined && p.note !== null && p.note !== "" ? p.note : null;
    if (!p || typeof p !== "object" || !PRESSURE_KINDS.includes(p.kind) || (note !== null && !words(note, NOTE_MAX)))
      return refuse("DOCKET_PRESSURE_REFUSED", `kind is one of ${PRESSURE_KINDS.join(", ")}, with a note of at most ${NOTE_MAX} characters`);
    /* END DEC-49 REGION is-docket-pressure */
    const at = this.#stamp();
    const out = this.record.transact(() => {
      if (this.#marks(id).some((m) => m.kind === "pressure")) return refuse("DOCKET_PRESSURE_MARKED", "the entry was marked meanwhile", { entry: id });
      this.sql.exec(`INSERT INTO docket_marks (entry_id, kind, pressure, note, by_member, at) VALUES (?,?,?,?,?,?)`,
                    id, "pressure", p.kind, note, member, at);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    return { ok: true, entry: id, pressure: { kind: p.kind, note, at } };
  }

  /* ================================================================ R4–R6: placing in public, signed */

  /* R4's caller refusals: the machine, the case, the manager, the slug. */
  #managerRefusal({ case: caseId, by, viewer }) {
    const member = this.#member(by);
    /* DEC-49 REGION is-docket-manager */
    if (!member)
      return { refusal: refuse("MACHINE_CANNOT_PLACE_DOCKET", str(by)
        ? "a public docket entry is placed by the case's manager signed in as themselves, and this caller is not one"
        : "no member is named as the one acting: this call carries nobody") };
    /* END DEC-49 REGION is-docket-manager */
    const k = this.#caseFor(caseId, str(viewer) || str(by));
    if (k.refusal) return k;
    /* DEC-49 REGION is-docket-manager */
    if (!this.#isManager(k.c.project, member))
      return { refusal: refuse("DOCKET_NOT_THE_MANAGER", "only an owner of the case's project manages its public docket", { case: k.c.case }) };
    const slug = this.#slug();
    if (!slug) return { refusal: refuse("DOCKET_NO_GROUP_SLUG", "no group slug is recorded, and there are no anonymous entries") };
    /* END DEC-49 REGION is-docket-manager */
    return { c: k.c, member, slug };
  }

  /* R4's kind refusals (R7, R8, R10–R12), the shelf and a reaction's summary and archive copy. Answers the fields the
     entry carries by kind. */
  #kindRefusal(c, kind, a, rec, recFields) {
    const reasonOk = (req) => (req ? words(a.reason, REASON_MAX) : a.reason === null || a.reason === undefined || a.reason === "" || words(a.reason, REASON_MAX));
    const out = {};
    const ed = a.edition === "all" ? "all" : int(a.edition);
    /* DEC-49 REGION is-docket-form */
    if (rec) {
      if (a.edition !== null && a.edition !== undefined && a.edition !== "" && ed !== Number(rec.edition))
        return { refusal: refuse("DOCKET_NO_EDITION", `the record entry concerns edition ${rec.edition}`, { edition: Number(rec.edition) }) };
      out.edition = Number(rec.edition);
    } else {
      if (ed === null || (ed === "all" ? kind !== "withdrawal" : !c.editions.some((e) => e.edition === ed)))
        return { refusal: refuse("DOCKET_NO_EDITION", "the edition named is not a ratified edition of this case",
                                 { editions: c.editions.map((e) => e.edition) }) };
      out.edition = ed;
    }
    if (kind === "edition" && !(out.edition > 1))
      return { refusal: refuse("DOCKET_NO_EDITION", "an edition entry names a ratified edition above 1") };
    if (kind === "standing-granted" && !oneLine(a.holder, NAME_MAX))
      return { refusal: refuse("DOCKET_NOT_ATTRIBUTED", `a grant names its holder in one line of 1 to ${NAME_MAX} characters`) };
    const needsReason = ["withdrawal", "standing-granted", "standing-withdrawn", "take-back", "receipt"].includes(kind);
    if (!reasonOk(needsReason))
      return { refusal: refuse("DOCKET_NO_REASON", `${needsReason ? "this kind carries" : "a reason given is"} a reason of 1 to ${REASON_MAX} characters`) };
    /* END DEC-49 REGION is-docket-form */
    /* DEC-49 REGION is-docket-kind */
    if (kind === "receipt") {
      const f = recFields.from;
      if (!["response", "statement"].includes(rec.kind) || !["subject", "holder"].includes(f.kind))
        return { refusal: refuse("DOCKET_NO_STANDING", "a receipt lists only a reply from the subject or from someone granted standing") };
    }
    if (kind === "standing-withdrawn") {
      const g = this.#grant(c.case, a.grant);
      if (!g) return { refusal: refuse("NO_SUCH_DOCKET_ENTRY", "grant names no grant of standing on this docket", { grant: int(a.grant) }) };
      if (g.ended_at) return { refusal: refuse("DOCKET_NO_STANDING", "that grant has already ended", { grant: g.seq }) };
      out.grant = g;
    }
    if (kind === "take-back") {
      const n = int(a.takesBack);
      const t = n === null ? null : this.#entry(c.case, n);
      if (!t) return { refusal: refuse("NO_SUCH_DOCKET_ENTRY", "takesBack names no public entry of this case", { takes_back: n }) };
      if (t.kind === "withdrawal") return { refusal: refuse("DOCKET_WITHDRAWAL_FINAL", "a withdrawal is never lifted", { takes_back: n }) };
      if (t.kind === "take-back") return { refusal: refuse("DOCKET_TAKE_BACK_FINAL", "a take-back is never taken back", { takes_back: n }) };
      if (this.#takenBack(c.case).has(n)) return { refusal: refuse("DOCKET_ENTRY_SETTLED", "that entry is already taken back", { takes_back: n }) };
      out.takes_back = n;
    }
    if (kind === "disclosure") {
      const cand = str(a.candidate);
      if (!cand) return { refusal: refuse("NO_SUCH_DOCKET_ENTRY", "a disclosure names the candidate it discloses") };
      out.candidate = cand;
    }
    if (kind === "withdrawal") {
      const withdrawn = this.#withdrawn(c.case);
      const named = out.edition === "all" ? c.editions.map((e) => e.edition) : [out.edition];
      if (named.every((e) => withdrawn.has(e)))
        return { refusal: refuse("DOCKET_ALREADY_WITHDRAWN", out.edition === "all" ? "every ratified edition is already withdrawn"
          : `edition ${out.edition} is already withdrawn`, { edition: out.edition }) };
    }
    const shelf = kind === "reaction" ? "reactions" : "listed";
    if (a.shelf !== shelf)
      return { refusal: refuse("DOCKET_WRONG_SHELF", `a ${kind} goes on ${shelf}`, { shelf: typeof a.shelf === "string" ? a.shelf : null }) };
    const hasSummary = a.summary !== null && a.summary !== undefined && a.summary !== "";
    if ((shelf === "reactions" || hasSummary) && !oneParagraph(a.summary, SUMMARY_MAX))
      return { refusal: refuse("DOCKET_NO_SUMMARY", `a summary is one paragraph of 1 to ${SUMMARY_MAX} characters`) };
    if (shelf === "reactions" && !recFields.capture.archived)
      return { refusal: refuse("DOCKET_NO_ARCHIVE_COPY", "the capture's co-archive has not succeeded; ask it again (op=reattest)",
                               { capture: rec.capture_sha }) };
    /* END DEC-49 REGION is-docket-kind */
    out.shelf = shelf;
    return { out };
  }

  /* R6: the name an entry is from, as the registry holds it, as granted, or as filed. */
  #fromName(caseId, from) {
    if (from.kind === "subject") return this.#entityName(from.entity);
    if (from.kind === "holder") return this.#grant(caseId, from.grant)?.holder ?? null;
    return from.name;
  }

  /** R4, R6: the entry that would be published, and nothing changed. */
  docketPrepare({ case: caseId = null, kind = null, shelf = null, edition = null, entry = null, summary = null, reason = null,
                  holder = null, takesBack = null, candidate = null, grant = null, viewer = null, by = null } = {}) {
    const nowMs = this.#nowMs();
    const k = this.#managerRefusal({ case: caseId, by, viewer });
    if (k.refusal) return k.refusal;
    const { c, member, slug } = k;
    const placing = RECORD_KINDS.includes(kind) || kind === "receipt";
    let rec = null, recFields = null;
    if (placing) {
      rec = this.#recordEntry(str(entry));
      const r = this.#entryRefusal(c.case, str(entry));
      if (r) return r;
      /* R1's form checks again, on the entry it would sign; a holder's grant at the filing. */
      const v = this.#formRefusal(c, { edition: rec.edition, from: rec.from_json, capture: rec.capture_sha,
                                       kind: rec.kind, proposed: rec.proposed, reason: rec.reason, answers: rec.answers,
                                       contests: rec.contests }, rec.filed_at);
      if (v.refusal) return v.refusal;
      recFields = v.fields;
      /* DEC-49 REGION is-docket-form */
      if (kind !== "receipt" && kind !== rec.kind)
        return refuse("DOCKET_KIND_UNKNOWN", `the record entry is a ${rec.kind}`, { kind });
      /* END DEC-49 REGION is-docket-form */
    } else if (!ENTRY_KINDS.includes(kind)) {
      /* DEC-49 REGION is-docket-form */
      return refuse("DOCKET_KIND_UNKNOWN", `kind is one of ${ENTRY_KINDS.join(", ")}`, { kind: typeof kind === "string" ? kind : null });
      /* END DEC-49 REGION is-docket-form */
    }
    const kr = this.#kindRefusal(c, kind, { shelf, edition, summary, reason, holder, takesBack, candidate, grant }, rec, recFields);
    if (kr.refusal) return kr.refusal;
    const x = kr.out;
    const prior = this.#one(`SELECT seq, digest FROM docket_entries WHERE case_id=? ORDER BY seq DESC LIMIT 1`, c.case);
    const seq = prior ? Number(prior.seq) + 1 : 1;
    const date = dayOf(this.#stamp(nowMs));
    /* R6: exactly these fields; no member's name, handle or id. */
    const json = { format: ENTRY_FORMAT, group: slug, case: c.case, seq, previous: prior ? prior.digest : null,
                   shelf: x.shelf, kind, edition: x.edition, date };
    if (placing) {
      json.received = dayOf(rec.filed_at);
      json.from = this.#fromName(c.case, recFields.from);
      if (kind === "receipt") json.reason = `${RECEIPT_REASON}: ${reason.trim()}`;
      else json.capture = { sha256: rec.capture_sha, origin: recFields.capture.origin, archived: recFields.capture.archived };
      if (kind !== "receipt" && rec.answers) {
        const receipt = this.#recordState(rec.answers).pub;
        if (receipt) json.answers = Number(receipt.seq);
      }
    }
    if (str(summary)) json.summary = summary.trim();
    if (kind === "edition") {
      const doc = this.#call(() => this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=? AND sig_armored IS NOT NULL`,
                                             c.case, x.edition));
      const p = doc ? this.#call(() => parseFrontmatter(doc.text)) : null;
      json.what_changed = p ? (this.#call(() => whatChangedOf(p.data, p.body)) || {}).statement ?? null : null;
    }
    if (kind === "disclosure") json.answers = x.candidate;
    if (kind === "standing-granted") json.holder = holder.trim();
    if (kind === "standing-withdrawn") { json.holder = x.grant.holder; json.answers = x.grant.seq; }
    if (kind === "take-back") json.takes_back = x.takes_back;
    if (kind !== "receipt" && str(reason)) json.reason = reason.trim();
    const text = canonicalJson(json);
    const digest = sha256HexSync(text);
    const key = `${member}\u0000${digest}`;
    const held = this.#held.get(key);
    /* R4: the same inputs answer byte for byte. Two record entries can sign to the same bytes (the entry names no record
       id); the later prepare then holds the digest, so a post places the entry last prepared, never another. */
    if (held && held.expiresMs > nowMs && held.record === (rec ? rec.entry_id : null)) return held.answer;
    const expiresMs = nowMs + PREPARED_TTL_MS;
    const answer = { ok: true, entry: text, digest, statement: td.decode(docketStatement(c.case, seq, digest)),
                     warning: OUTWARD_ACT_WARNING, expires: this.#stamp(expiresMs) };
    this.#held.set(key, { answer, expiresMs, case: c.case, seq, previous: json.previous, json, text, digest, kind,
                          record: rec ? rec.entry_id : null, edition: x.edition });
    return answer;
  }

  /** R5: publishes the entry `by` prepared, with its signature. */
  async docketPost({ digest = null, signature = null, acknowledged = null, by = null, viewer = null } = {}) {
    const nowMs = this.#nowMs();
    const member = this.#member(by);
    const held = member ? this.#held.get(`${member}\u0000${str(digest)}`) : null;
    if (!member) {
      /* DEC-49 REGION is-docket-manager */
      return refuse("MACHINE_CANNOT_PLACE_DOCKET", "a public docket entry is posted by the case's manager signed in as themselves");
      /* END DEC-49 REGION is-docket-manager */
    }
    if (held) {
      const k = this.#managerRefusal({ case: held.case, by, viewer });
      if (k.refusal) return k.refusal;
    }
    /* DEC-49 REGION is-docket-post */
    if (acknowledged !== true)
      return refuse("DOCKET_WARNING_NOT_ACKNOWLEDGED", "acknowledged must be exactly true: the warning was read");
    if (!held || held.expiresMs <= nowMs)
      return refuse("DOCKET_STALE", "no prepared entry from you with this digest is held, or it has expired: prepare again");
    const moved = () => {
      const last = this.#one(`SELECT seq, digest FROM docket_entries WHERE case_id=? ORDER BY seq DESC LIMIT 1`, held.case);
      return (last ? Number(last.seq) : 0) !== held.seq - 1 || (last ? last.digest : null) !== held.previous
        || (held.record && this.#recordState(held.record).state !== "pending");
    };
    if (moved()) return refuse("DOCKET_STALE", "the docket moved since this was prepared: prepare again", { seq: held.seq });
    const keys = (this.#call(() => this.credentials.attestingKeys(), []) || []).filter((k) => k.member_id === member).map((k) => k.key_b64);
    const v = await verifySshsig(String(signature ?? ""), docketStatement(held.case, held.seq, held.digest), NS_DOCKET, keys);
    if (!v.ok) return refuse("DOCKET_SIGNATURE_REFUSED", `the signature was refused: ${v.reason}`, { verifier: v.reason });
    /* END DEC-49 REGION is-docket-post */
    const at = this.#stamp(nowMs);
    const editions = held.kind === "withdrawal"
      ? JSON.stringify((held.edition === "all" ? this.#editions(held.case).map((e) => e.edition) : [held.edition])
          .filter((e) => !this.#withdrawn(held.case).has(e)))
      : null;
    const out = this.record.transact(() => {
      if (moved()) return refuse("DOCKET_STALE", "the docket moved since this was prepared: prepare again", { seq: held.seq });
      this.sql.exec(`INSERT INTO docket_entries (case_id, seq, digest, json, kind, shelf, edition, record_entry, editions, signature,
                                                 signer_key, published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
                    held.case, held.seq, held.digest, held.text, held.kind, held.json.shelf, String(held.edition), held.record,
                    editions, String(signature), v.keyB64, at);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    this.#held.delete(`${member}\u0000${held.digest}`);
    /* R13: a withdrawal is told to reevaluation after it commits; a throw there never undoes it. */
    if (held.kind === "withdrawal")
      this.#call(() => this.reevaluation.docketActed({ kind: "withdrawal", case: held.case, entry: publicId(held.case, held.seq) }));
    return { ok: true, case: held.case, seq: held.seq, entry: publicId(held.case, held.seq), published_at: at };
  }

  /* ================================================================ R7, R8: declining, and the receipt's invitation */

  /** R7: the manager declines a submission that contains redactions; nothing is published. */
  docketDecline({ entry = null, reason = null, by = null, viewer = null } = {}) {
    const member = this.#member(by);
    const id = str(entry);
    /* DEC-49 REGION is-docket-manager */
    if (!member) return refuse("MACHINE_CANNOT_PLACE_DOCKET", "a submission is declined by the case's manager signed in as themselves");
    /* END DEC-49 REGION is-docket-manager */
    const r = this.#recordEntry(id);
    const k = r ? this.#caseFor(r.case_id, str(viewer) || str(by)) : null;
    /* DEC-49 REGION is-docket-entry */
    if (!r || !k || k.refusal) return refuse("NO_SUCH_DOCKET_ENTRY", "no record entry you see answers by that id", { entry: id });
    /* END DEC-49 REGION is-docket-entry */
    /* DEC-49 REGION is-docket-manager */
    if (!this.#isManager(k.c.project, member))
      return refuse("DOCKET_NOT_THE_MANAGER", "only an owner of the case's project declines a submission", { case: k.c.case });
    /* END DEC-49 REGION is-docket-manager */
    const settled = this.#entryRefusal(k.c.case, id);
    if (settled) return settled;
    /* DEC-49 REGION is-docket-form */
    if (!words(reason, REASON_MAX)) return refuse("DOCKET_NO_REASON", `a decline carries a reason of 1 to ${REASON_MAX} characters`);
    /* END DEC-49 REGION is-docket-form */
    const at = this.#stamp();
    const out = this.record.transact(() => {
      if (this.#recordState(id).state !== "pending") return refuse("DOCKET_ENTRY_SETTLED", "the entry was settled meanwhile", { entry: id });
      this.sql.exec(`INSERT INTO docket_marks (entry_id, kind, reason, by_member, at) VALUES (?,?,?,?,?)`, id, "declined", reason, member, at);
      return { ok: true };
    });
    if (!out || out.ok !== true) return out;
    return { ok: true, entry: id, case: k.c.case, state: "declined", declined: { reason, at, for: "contains redactions" },
             published: false };
  }

  /** R8: the request to resend a receipted reply without the private person's name, prefilled for a member to send by
   *  their own means. A read: this module sends nothing. */
  docketInvitation({ entry = null, viewer = null } = {}) {
    const id = str(entry);
    const r = this.#recordEntry(id);
    const k = r ? this.#caseFor(r.case_id, viewer) : null;
    const s = r ? this.#recordState(id) : null;
    if (!r || !k || k.refusal || s.state !== "receipted")
      return refuse("NO_SUCH_DOCKET_ENTRY", "no receipted record entry you see answers by that id", { entry: id });
    const pub = parse(s.pub.json) || {};
    return { ok: true, entry: id, case: r.case_id, edition: Number(r.edition), from: pub.from ?? null, received: pub.received ?? null,
             receipt: { seq: Number(s.pub.seq), entry: publicId(r.case_id, s.pub.seq) },
             invitation: { ...RESEND_INVITATION, case: r.case_id, edition: Number(r.edition), received: pub.received ?? null,
                           answers: id, docket: docketAddress(r.case_id) },
             sends: "nothing: a member sends this by their own means" };
  }

  /* ================================================================ R9: the required core */

  /* R9 for one case the caller manages: each core item still due. */
  #coreOf(c) {
    const items = [];
    const backs = this.#takenBack(c.case);
    const live = this.#entries(c.case).filter((e) => !backs.has(Number(e.seq))).map((e) => parse(e.json) || {});
    /* (a) the subject's responses and statements, and a holder's responses filed while the grant was live */
    for (const r of this.#rows(`SELECT * FROM docket_record WHERE case_id=? ORDER BY rn`, c.case)) {
      if (this.#recordState(r.entry_id).state !== "pending") continue;
      const f = parse(r.from_json) || {};
      const core = (r.kind === "response" && (f.kind === "subject" || (f.kind === "holder" && this.#liveAt(this.#grant(c.case, f.grant), r.filed_at))))
        || (r.kind === "statement" && f.kind === "subject");
      if (core) items.push({ case: c.case, kind: r.kind, ref: r.entry_id, edition: Number(r.edition), since: r.filed_at });
    }
    /* (b) each ratified edition above 1 with no edition entry naming it */
    for (const e of c.editions) {
      if (e.edition <= 1 || live.some((j) => j.kind === "edition" && j.edition === e.edition)) continue;
      const doc = this.#call(() => this.#one(`SELECT text FROM case_documents WHERE case_id=? AND edition=? AND sig_armored IS NOT NULL`,
                                             c.case, e.edition));
      const p = doc ? this.#call(() => parseFrontmatter(doc.text)) : null;
      const wc = p ? this.#call(() => whatChangedOf(p.data, p.body)) : null;
      items.push({ case: c.case, kind: "edition", ref: String(e.edition), edition: e.edition, since: e.ratified_at,
                   what_changed: wc ? wc.statement ?? null : null });
    }
    /* (c) each tension on a load-bearing member of the latest ratified edition, with no disclosure entry naming it */
    const latest = c.editions[c.editions.length - 1];
    const loadBearing = new Set(this.#call(() => this.#rows(`SELECT bundle_id FROM published_case_members WHERE case_id=? AND edition=?
                                                              AND role='load_bearing'`, c.case, latest.edition), []).map((m) => m.bundle_id));
    const disclosed = new Set(live.filter((j) => j.kind === "disclosure").map((j) => j.answers));
    const seen = new Set();
    for (const t of this.#tensions(c)) {
      if (t.case !== c.case || Number(t.edition) !== latest.edition || !loadBearing.has(t.member)) continue;
      if (!str(t.candidate) || disclosed.has(t.candidate) || seen.has(t.candidate)) continue;
      seen.add(t.candidate);
      items.push({ case: c.case, kind: "tension", ref: t.candidate, edition: latest.edition, since: latest.ratified_at,
                   member: t.member, state: t.state ?? null });
    }
    return items;
  }
  /* publication R50's candidates on the case's project, paged through. */
  #tensions(c) {
    const out = [];
    let after = null;
    for (let i = 0; i < 1000; i++) {
      const r = this.#call(() => this.publication.caseTensions({ project: c.project, after, limit: 200 }));
      if (!r || !Array.isArray(r.cases)) break;
      for (const k of r.cases) if (k && k.case === c.case && Array.isArray(k.tensions)) out.push(...k.tensions);
      if (!r.cursor || r.cursor === after) break;
      after = r.cursor;
    }
    return out;
  }

  /** R9: for each case the viewer manages (one when `case` is given), each core item still due, with its `since`. */
  coreDue({ case: caseId = null, viewer = null } = {}) {
    const member = this.#member(viewer);
    if (!member) return { ok: true, items: [], count: 0, wrote: false };
    const ids = str(caseId) ? [str(caseId)]
      : this.#call(() => this.#rows(`SELECT DISTINCT case_id FROM published_cases WHERE ratified_at IS NOT NULL ORDER BY case_id`), [])
        .map((r) => r.case_id);
    const items = [];
    for (const id of ids) {
      const c = this.#case(id);
      if (!c || !this.#isManager(c.project, member)) continue;
      items.push(...this.#coreOf(c));
    }
    return { ok: true, items, count: items.length, wrote: false };
  }

  /* ================================================================ R3: the member's read */

  /* R14's view of one public entry. */
  #publicView(e, backs) {
    const back = backs.get(Number(e.seq));
    return { seq: Number(e.seq), entry: publicId(e.case_id, e.seq), digest: e.digest, json: e.json, fields: parse(e.json),
             signature: e.signature, published_at: e.published_at,
             taken_back: back ? { seq: Number(back.seq), date: (parse(back.json) || {}).date ?? null } : null };
  }

  /** R3: every entry on all three shelves, oldest first, the core still due and a contesting entry's prompts. */
  docketOf({ case: caseId = null, viewer = null } = {}) {
    const k = this.#caseFor(caseId, viewer);
    if (k.refusal) return k.refusal;
    const { c } = k;
    const backs = this.#takenBack(c.case);
    const pub = this.#entries(c.case).map((e) => ({ shelf: e.shelf, at: e.published_at, ...this.#publicView(e, backs) }));
    const rec = this.#rows(`SELECT * FROM docket_record WHERE case_id=? ORDER BY rn`, c.case).map((r) => {
      const s = this.#recordState(r.entry_id);
      const marks = this.#marks(r.entry_id);
      const p = marks.find((m) => m.kind === "pressure");
      const contests = !!Number(r.contests);
      return {
        shelf: "record", at: r.filed_at, entry: r.entry_id, edition: Number(r.edition), kind: r.kind, from: parse(r.from_json),
        capture: r.capture_sha, proposed: r.proposed, reason: r.reason, found_by: r.found_by, contests, answers: r.answers ?? null,
        author: r.author, filed_at: r.filed_at, state: s.state,
        ...(s.state === "placed" || s.state === "receipted" ? { public: { seq: Number(s.pub.seq), entry: publicId(c.case, s.pub.seq) } } : {}),
        ...(s.state === "declined" ? { declined: { reason: s.decline.reason, at: s.decline.at } } : {}),
        ...(s.state === "taken-back" ? { taken_back: { reason: s.back.reason, at: s.back.at } } : {}),
        pressure: p ? { kind: p.pressure, note: p.note ?? null, at: p.at } : null,
        ...(contests ? { prompts: {
          reevaluation: { cause: "contested", case: c.case, edition: Number(r.edition), entry: r.entry_id, since: r.filed_at,
                          findings: this.#pins(c.case, Number(r.edition)) },
          checkpoint: CHECKPOINT_OFFER } } : {}),
      };
    });
    /* oldest first; at one instant a record entry before the public entry that may place it, then in filing or seq order */
    const entries = [...rec, ...pub].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
    return { ok: true, case: c.case, project: c.project, editions: c.editions, entries, core_due: this.#coreOf(c), wrote: false };
  }

  /* ================================================================ R12, R13: withdrawal, and reevaluation's registration */

  /** R12: the withdrawal entry naming that edition, or null; viewer-free, it writes nothing. */
  withdrawalOf({ case: caseId = null, edition = null } = {}) {
    const id = str(caseId), ed = int(edition);
    if (!id || ed === null) return null;
    const w = this.#withdrawn(id).get(ed);
    if (!w) return null;
    const j = parse(w.json) || {};
    return { seq: Number(w.seq), entry: publicId(id, w.seq), date: j.date ?? null, reason: j.reason ?? null, digest: w.digest };
  }

  /** R13: each withdrawal, in case then seq order after `after` (`<case>#<seq>`), at most `limit`. */
  docketWithdrawals({ after = null, limit = null } = {}) {
    const cap = Math.min(Math.max(int(limit) ?? 200, 1), 1000);
    const a = typeof after === "string" ? after : "";
    const cut = a.lastIndexOf("#");
    const [ac, as] = cut >= 0 ? [a.slice(0, cut), int(a.slice(cut + 1)) ?? 0] : [a, 0];
    const rows = this.#rows(`SELECT * FROM docket_entries WHERE kind='withdrawal' AND (case_id > ? OR (case_id = ? AND seq > ?))
                              ORDER BY case_id, seq LIMIT ?`, ac, ac, as, cap + 1);
    const more = rows.length > cap;
    if (more) rows.length = cap;
    const withdrawals = rows.map((w) => {
      const editions = parse(w.editions) || [];
      const c = this.#case(w.case_id);
      return { case: w.case_id, project: c ? c.project : null, editions,
               findings: editions.flatMap((ed) => this.#pins(w.case_id, ed).map((p) => ({ ...p, edition: ed }))),
               at: w.published_at, seq: Number(w.seq), entry: publicId(w.case_id, w.seq) };
    });
    return { withdrawals, cursor: more ? publicId(rows[rows.length - 1].case_id, rows[rows.length - 1].seq) : null };
  }

  /** R13: each record entry with `contests: true` and not taken back, in entry id order after `after`, at most `limit`. */
  docketContested({ after = null, limit = null } = {}) {
    const cap = Math.min(Math.max(int(limit) ?? 200, 1), 1000);
    const out = [];
    let last = null, more = false;
    for (const r of this.#rows(`SELECT * FROM docket_record WHERE contests=1 AND entry_id > ? ORDER BY entry_id`,
                               typeof after === "string" ? after : "")) {
      if (this.#recordState(r.entry_id).state === "taken-back") continue;
      if (out.length === cap) { more = true; break; }
      out.push({ case: r.case_id, edition: Number(r.edition), findings: this.#pins(r.case_id, Number(r.edition)),
                 at: r.filed_at, entry: r.entry_id });
      last = r.entry_id;
    }
    return { contested: out, cursor: more ? last : null };
  }

  /** R13: fills `reevaluation`'s docket registration (its R30), once; the answer is kept. */
  start() {
    if (this.registration) return this.registration;
    this.registration = this.#call(() => this.reevaluation.registerDocket("docket", {
      withdrawals: (q) => this.docketWithdrawals(q || {}), contested: (q) => this.docketContested(q || {}) }),
      { ok: false, reason: "REGISTRATION_FAILED" });
    return this.registration;
  }

  /* ================================================================ R5, R14, R15: the public reads */

  /** R5: each key that has signed a public entry, with the instant it first did; viewer-free, names no member. */
  docketSigners() {
    return this.#rows(`SELECT signer_key AS k, MIN(published_at) AS first FROM docket_entries GROUP BY signer_key ORDER BY first, k`)
      .map((r) => ({ keyB64: r.k, first_signed: r.first }));
  }

  /** R14, R24: the case's public entries, oldest first, the bytes of each listed entry's capture and `last_entry`; null
   *  for a case with no ratified edition. The record shelf never appears. With `captures: "omit"` no capture's bytes are
   *  read: `captures` is `{}` and the answer says `captures_omitted: true` (a citing copy's daily read, R24). Entries
   *  under either format label are answered alike, each as stored (R6). */
  async docketPublic({ case: caseId = null, captures: want = null } = {}) {
    const c = this.#case(caseId);
    if (!c) return null;
    const backs = this.#takenBack(c.case);
    const rows = this.#entries(c.case);
    const entries = rows.map((e) => this.#publicView(e, backs));
    const last = rows[rows.length - 1];
    const answer = (captures, extra) => ({ ok: true, case: c.case, group: this.#slug(), entries, captures,
      last_entry: last ? (parse(last.json) || {}).date ?? null : null, feed: feedAddress(c.case), ...extra });
    if (want === "omit") return answer({}, { captures_omitted: true });
    const captures = {};
    const store = this.#call(() => this.record.evidenceStore());
    for (const e of entries) {
      const f = e.fields || {};
      if (f.shelf !== "listed" || f.kind === "receipt" || !f.capture || !isSha(f.capture.sha256) || f.capture.sha256 in captures) continue;
      let bytes = null;
      try {
        const o = store ? await store.get(f.capture.sha256) : null;
        if (o) bytes = new Uint8Array(await o.arrayBuffer());
      } catch { bytes = null; }
      /* bytes the store cannot answer are null, never invented (K1274) */
      captures[f.capture.sha256] = bytes ? b64(bytes) : null;
    }
    return answer(captures);
  }

  /** R14 (K1276): the date of the case's latest public entry, the `last_entry` `docketPublic` answers, or null; synchronous,
   *  viewer-free, reading no capture's bytes. For `public-read` R20's `docket_last_entry`. */
  lastEntryOf({ case: caseId = null } = {}) {
    const id = str(caseId);
    if (!id) return null;
    const last = this.#one(`SELECT json FROM docket_entries WHERE case_id=? ORDER BY seq DESC LIMIT 1`, id);
    return last ? (parse(last.json) || {}).date ?? null : null;
  }

  /** R15: the same entries as an Atom 1.0 feed, newest first; null for a case with no ratified edition. Reading it
   *  writes nothing and records nothing about the reader. */
  async docketFeed({ case: caseId = null } = {}) {
    const c = this.#case(caseId);
    if (!c) return null;
    const backs = this.#takenBack(c.case);
    const entries = this.#entries(c.case).map((e) => this.#publicView(e, backs));
    return renderFeed({ case: c.case, group: this.#slug(), entries }, c.editions[c.editions.length - 1].ratified_at);
  }
}

/* The member acts and reads answer their own refusals with code, check and translation (DEC-49). */
for (const m of ["docketFile", "docketPressure", "docketPrepare", "docketDecline", "docketInvitation", "docketOf"]) {
  const fn = Docket.prototype[m];
  Docket.prototype[m] = function (...a) { return withRow(fn.apply(this, a)); };
}
{
  const fn = Docket.prototype.docketPost;
  Docket.prototype.docketPost = async function (...a) { return withRow(await fn.apply(this, a)); };
}

const instances = new WeakMap();

/** K61: the one instance per host; at creation it creates and declares its tables (whole store only, R16), registers
 *  its figures and its record ids' mint seed, and fills reevaluation's docket registration (R13). */
export function docketOf(host, deps) {
  let k = instances.get(host);
  if (!k) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    k = new Docket({ ...d, host, storage, record, membership, env: d.env ?? host.env ?? null });
    instances.set(host, k);
    k.migrate();
    k.purgeDeclaration = record.declarePurge("docket", DOCKET_TABLES.map((name) => ({ name, keys: [] })));
    k.countsRegistration = record.registerCounts("docket", ["docketRecordEntries", "docketPublicEntries", "docketMarks"], () => {
      const n = (t) => Number([...storage.sql.exec(`SELECT COUNT(*) AS n FROM ${t}`)][0].n);
      return { docketRecordEntries: n("docket_record"), docketPublicEntries: n("docket_entries"), docketMarks: n("docket_marks") };
    });
    k.mintSeedRegistration = record.registerMintSeed("docket", [[RECORD_ID_PREFIX, "docket_record", "entry_id"]]);
    k.start();
  }
  return k;
}

/** Which purge declaration names one of this module's tables (record-core R21). */
export function docketOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return DOCKET_TABLES.includes(name);
}

/** The module's member ops: `by`, `author` and `viewer` are the control plane's stamps, read from the query, never the
 *  body. `op-declarations` declares them, `control-plane` routes them and `plane` composes them (L11). The public reads
 *  `docketpublic` and `docketfeed` are `public-read`'s to serve (its R21). */
export function docketOps(m, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  const pick = (k) => (b[k] !== undefined && b[k] !== null ? b[k] : url.searchParams.has(k) ? q(k) : null);
  const by = q("by") ?? q("author"), author = q("author") ?? q("by"), viewer = q("viewer");
  return {
    docketfile: () => m.docketFile({ case: pick("case"), edition: pick("edition"), kind: pick("kind"), from: pick("from"),
      capture: pick("capture"), contests: pick("contests"), proposed: pick("proposed"), reason: pick("reason"),
      answers: pick("answers"), takesBack: pick("takesBack"), author, viewer }),
    docketpressure: () => m.docketPressure({ entry: pick("entry"), pressure: pick("pressure"), author, viewer }),
    docket: () => m.docketOf({ case: q("case"), viewer }),
    docketprepare: () => m.docketPrepare({ case: pick("case"), kind: pick("kind"), shelf: pick("shelf"), edition: pick("edition"),
      entry: pick("entry"), summary: pick("summary"), reason: pick("reason"), holder: pick("holder"), takesBack: pick("takesBack"),
      candidate: pick("candidate"), grant: pick("grant"), by, viewer }),
    docketpost: () => m.docketPost({ digest: pick("digest"), signature: pick("signature"),
      acknowledged: b.acknowledged === true || q("acknowledged") === "true" ? true : b.acknowledged ?? q("acknowledged"), by, viewer }),
    docketdecline: () => m.docketDecline({ entry: pick("entry"), reason: pick("reason"), by, viewer }),
    docketinvitation: () => m.docketInvitation({ entry: q("entry"), viewer }),
  };
}
