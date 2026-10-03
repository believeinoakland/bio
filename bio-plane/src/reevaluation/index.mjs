/* reevaluation — when something a finding rests on changes, which findings are affected and how (requirements:
 * `build/requirements/reevaluation.md`; Content Framework §18.1, State Rules §5.4). It changes nothing a finding rests
 * on: the obligation is DERIVED ON READ from the record's own facts about each target (R1–R6, R16, R17) and from the
 * sides a member's resolution of a contradiction named wrong (R27, `contradiction.tensionsOn`), the pushed notice tells
 * a member when a newer version of a document affects a passage they reference and the member chooses (R14, R15), and
 * later modules are told when a finding's basis changed (R8, R9): a source's rung (R28, heard from `sources`) or an
 * observation's credit level, or an off-the-record capture's attesting member's (R29, R32, told by `ratification`
 * through `levelMoved`) moving included, a case edition withdrawn or contested on its docket (R30, read through the
 * registration `docket` fills, told through `docketActed`), and this group's acceptance of another group's finding
 * withdrawn (R31, read through `accepted-work`, told by `case-import` through `acceptanceWithdrawn`).
 *
 * Extracted from the legacy modules (T7, layer 7; K3, K102): `store.mjs` (`#reevalRaisedBy`, now `raise`; the REC-17
 * obligation, `reevaluations`, with `#reevalLegsEarned` and `#reevalMoved`; D-256's `changedFromAudit`; D-394's
 * `versionNotice`, its question arm, calling content's passage notice) and the check catalogue (C-10.1, C-80.1, C-80.2,
 * now `./checks.mjs`). Its tables are `./schema.mjs`. The legacy code's comments moved with it, shortened where they
 * only restated the code. The grammar it reads is record-grammar's, `basis-versions`' (a version name),
 * `inquiry-grammar`'s (a ground label) and `text-chain`'s (`canonicalExtent`); no file of it imports the catalogue (T19).
 *
 * NOTHING IS STORED FOR THE OBLIGATION (R18, P-64), for two reasons that are the item's title rather than an
 * implementation preference: a stored verdict goes stale in both directions (still set after the member looked, still
 * clear after the thing beneath it moved again), and the member decides, not the plane. No verdict here is computed
 * from strength and nothing here alters one (R19): what a reader is handed is the FACT that something moved.
 *
 * REACHED as `reevaluationOf(host, deps)` (K61): one instance per host (the Durable Object's `ctx`), created on the first
 * call with `deps`, returned to every later caller. At creation it creates its tables and declares them to record-core's
 * purge (K23), registers its answer with `inquiry.onRaised` (a deferral, a division, a re-read) and
 * `promotion.onReopened` (a reopening), registers C-10.1 with promotion as a check and with record-core's audit (R22), and
 * listens to provenance's receipts (its R47), each of which makes the notice sweep pending again (R25).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership, promotion   layer 2: `readFile`, `head`, `livePaths`, `transact`, `declarePurge`,
 *                                   `registerAuditCheck`; `viewerPredicate`; `registerStep`, `onReopened`, the facts
 *                                   `publishedRegistry` (R2's ratified edition, R17's frozen pair) and
 *                                   `publishedCaseRegistry` (R16's case editions, N457).
 *   inquiry        `restingOn`, `restsOnLive`, `supersededBy`, `earned`, `onRaised` (its R13, R16, R17, R42).
 *   content        `noticeForRow`, `passageNotice` (its R29–R31).
 *   connections    `edgeSevered` (its R22), read through inquiry's `restingOn`.
 *   provenance     `versionChain` (its R17, R18), `onReceipt` (its R47, R25 here).
 *   strength       `strengthOf` (its R1–R5).
 *   basisVersions  `appendVersion` (its R28).
 *   contradiction  `tensionsOn` (its R27): which sides a member's resolution named wrong (R27 here).
 *   sources        `onDisclosure` (its R10): each rung move of a source, heard and kept (R28 here). Its `rungOf` is
 *                  never called on a read.
 *   acceptedWork   `acceptedFinding`, `acceptanceWithdrawals` (its R2): whether a viewer may see an imported finding
 *                  reference (R1) and the acceptances withdrawn (R31). `case-import` fills it and tells
 *                  `acceptanceWithdrawn` after a withdrawal commits.
 *   now            the clock for the instants it writes, an ISO string (default: the wall clock, to the second).
 *   env            the instance bindings: `REEVAL_NOTICE_DELAY_MS` (R25).
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, `current_state`, `title`,
 * `last_updated`, its R37) and `files` (the D-256 audit's scan, below); inquiry's `inquiry_basis` (`bundle_id`, `ord`,
 * `target_id`, `content_id`, its R40); content's `content` (its R45); provenance's `register` and `captured_locators`
 * (its R48); basis-versions' `inquiry_basis_versions` (`bundle_id`, `name`, `claim`, its R38), R27's claim referents;
 * sources' `source_knocks` (`source_id`, `capture_sha`, its R15), R28's captures of a source. */

import { recordOf, stampInstant, instantOrder } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, listenerRefusal } from "../membership/index.mjs";
import { promotionOf, REOPENABLE_FROM } from "../promotion/index.mjs";
import { provenanceOf } from "../provenance/index.mjs";
import { contentOf, VERSION_NOTICE_STATES, VERSION_NOTICE_GRADES } from "../content/index.mjs";
import { inquiryOf, legCapped } from "../inquiry/index.mjs";
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { strengthOf, GRADE_RANK } from "../strength/index.mjs";
import { contradictionOf, TENSIONS_REFERENTS_MAX } from "../contradiction/index.mjs";
import { sourcesOf } from "../sources/index.mjs";
import { acceptedWorkOf } from "../accepted-work/index.mjs";
import { normalizeType, parseFrontmatter, isMachineIdentity, MACHINE_CLASS_PREFIX, sha256HexSync }
  from "../record-grammar/index.mjs";
import { VERSION_NAME_RE } from "../basis-versions/index.mjs";
import { GROUND_LABEL_RE, parseImportedFindingRef } from "../inquiry-grammar/index.mjs";
import { canonicalExtent } from "../textchain.mjs";
import { checkReevalPending, REEVAL_SOURCES, VERSION_NOTICE_SUBJECT_CHECKS, REEVALUATION_ACT_CHECKS,
         rowOf } from "./checks.mjs";
import { REEVALUATION_TABLES, migrateReevaluation } from "./schema.mjs";

export { checkReevalPending, REEVAL_SOURCES, REEVAL_POLICY_AGE_DAYS, VERSION_NOTICE_SUBJECT_CHECKS,
         REEVALUATION_ACT_CHECKS } from "./checks.mjs";
export { REEVALUATION_SCHEMA, REEVALUATION_TABLES } from "./schema.mjs";

/** R11: the legs one notice read answers for a question. 200 is the version chain's own default, reused rather than a
 *  new spelling: a question resting on more than two hundred passages is a run's walk, and `truncated` says so. */
export const VERSION_NOTICE_LEGS_MAX = 200;
/** R13: D-256's bound, `op=versionchain`'s 200/1000 pair reused. It bounds the LISTING only: the three totals are
 *  always counted over every affected bundle, because a verdict total cut at N would be the partial count this read
 *  exists to replace. */
export const CHANGED_FROM_AUDIT_LIMIT_DEFAULT = 200;
export const CHANGED_FROM_AUDIT_LIMIT_MAX = 1000;
/** R12: the one literal the pre-2026-08-08 `addGo` wrote, up to the parenthesis that opens the named id. */
export const CHANGED_FROM_SENTENCE = "The record already holds an earlier capture of this same address (";
/** R9: the findings and the passages one `changesOf` read answers, each. */
export const CHANGES_OF_MAX = 200;
/** R14: the basis legs one sweep reads (default and most). */
export const NOTICE_SWEEP_DEFAULT = 200;
export const NOTICE_SWEEP_MAX = 1000;
/** R14: the notices one read lists (default and most). */
export const NOTICES_LIMIT_DEFAULT = 200;
export const NOTICES_LIMIT_MAX = 1000;
/** R25: the notice sweep's delay after `now` while it is pending, unless the instance binding sets another. */
export const REEVAL_NOTICE_DELAY_MS = 1000;
/** R15, R16: the longest why or note a member's act stores. */
export const NOTE_MAX = 500;
/** R15 (DEC-88): the longest why an adoption takes (C-110.29). */
export const ADOPT_WHY_MAX = 2000;
/** R30, R8: the two kinds a docket act tells, each also the source of the cause it raises. */
export const DOCKET_KINDS = Object.freeze(["withdrawal", "contested"]);
/** R31: the withdrawals one page of accepted-work's `acceptanceWithdrawals` is asked for. */
export const ACCEPTANCE_PAGE = 200;
/** R2, R16: the sources a cause may carry. R2's five are facts about the target's own row; `corrected` is R27's, a fact
 *  about a side the leg rests on; `source` is R28's, a rung move of the source behind a capture the leg rests on;
 *  `attribution` is R29's, a move of the credit level of the observation the leg rests on; `withdrawal` and `contested`
 *  are R30's, a case edition withdrawn or contested on its docket; `acceptance` is R31's, this group's acceptance of
 *  another group's finding withdrawn at the edition the leg names; §5.4's four cascade events (C-10.1's
 *  `REEVAL_SOURCES`, `./checks.mjs`) are derived the same way; `weakened` is R17's. */
export const CAUSE_SOURCES = Object.freeze(["supersession", "edition", "deferred", "reopened", "dismissed", "corrected",
  "source", "attribution", ...DOCKET_KINDS, "acceptance", ...REEVAL_SOURCES, "weakened"]);
/** R21, R27: what an answer says when a tensions read could not be made. */
const CORRECTIONS_UNREAD = "the contradiction module's tensions read could not be made, so whether a side this rests on "
  + "was named wrong was not read and no corrected cause could be derived; that is not the same as none";
/** R16, R21 (N457): what an answer says when no module registered a case edition's parts (R26), or a read of the work
 *  products a project owns could not be made. */
const CASE_PARTS_ABSENT = "no module has registered the cited parts of a case edition, so which cases a project owns "
  + "was not read and no wp_retraction cause could be derived; that is not the same as none";
const WORK_PRODUCTS_UNREAD = "the cases a project owns, or their ratified editions, could not be read, so a wp_retraction "
  + "cause may be missing; that is not the same as none";
/** R16 (N457): the cases one page of R26's `cases` is asked for, while the work products a project owns are read. */
export const WORK_PRODUCT_CASES_PAGE = 200;
/** R30: the entries one page of the docket registration's `withdrawals` or `contested` is asked for. */
export const DOCKET_PAGE = 200;
/** R30: the (dependent, entry) pairs one `docketDependents` read lists (default and most). */
export const DOCKET_LIMIT_DEFAULT = 200;
export const DOCKET_LIMIT_MAX = 200;
/** R16, R21, R30: what an answer says when no module registered the docket, or a read of it could not be made. */
const DOCKET_ABSENT = "no module has registered the docket, so no withdrawn or contested case edition was read and no "
  + "withdrawal, contested or withdrawal wp_retraction cause could be derived; that is not the same as none";
const DOCKET_UNREAD = "the docket's withdrawals or contesting entries could not all be read, so a withdrawal, contested or "
  + "wp_retraction cause may be missing; that is not the same as none";
/** R1, R21, R31: what an answer says when no module registered accepted work, or a read of it could not be made. */
const ACCEPTED_WORK_ABSENT_WHY = "no module holding another group's work is registered, so no acceptance withdrawal was read "
  + "and no acceptance cause could be derived; that is not the same as none";
const ACCEPTANCE_UNREAD = "the acceptances withdrawn could not all be read, so an acceptance cause may be missing; that is "
  + "not the same as none";
/* R1, R31: an imported finding reference (`inquiry-grammar` R11), as a leg's target names it. */
const isRef = (id) => typeof id === "string" && !!parseImportedFindingRef(id);
/** R27: the (dependent, candidate) entries one `correctedDependents` read lists (default and most). */
export const CORRECTED_LIMIT_DEFAULT = 200;
export const CORRECTED_LIMIT_MAX = 200;
/** R14: the grades a notice is raised on (content R31's `affects`); A and B read `unaffected` and never raise one. */
const RAISED_ON = Object.freeze(["affected", "undetermined"]);
/** R26: the sweep cursor's mark once it stands in the case half (`case:<case id>`); `case:` alone is its start. */
export const CASE_CURSOR = "case:";
/* R26: a cited part is graded whole, as a leg on a whole document is (content R46's `document` extent). */
const DOCUMENT_EXTENT = canonicalExtent({ kind: "document" });
/** R17: the axes whose frozen and derived letters are compared. */
const PAIR_AXES = Object.freeze(["capture", "connection", "testimony"]);

const str = (v) => (typeof v === "string" && v.trim() ? v.trim() : null);
const MACHINE_ADMIN = `${MACHINE_CLASS_PREFIX}admin`;
const UNSTORABLE = /["\\\n\r]/;
/* R26 (K365): a pinned capture is a whole sha-256, as publication R41 answers it. */
const SHA256_HEX = /^[0-9a-fA-F]{64}$/;
const asList = (v) => {
  if (Array.isArray(v)) return v.map((x) => String(x ?? "").trim()).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((x) => x.trim()).filter(Boolean);
  return [];
};
const clamp = (v, dflt, max) => Math.max(1, Math.min(max, Math.floor(Number(v) || dflt)));

/* R15: one ground of an adopted version, as the live document authored it, else asserted by the adopting member now. */
function groundRow(ground, authored, who, when) {
  const d = authored || {};
  return { ground, asserted_by: d.asserted_by ?? who, at: d.at ?? when, ...(d.statement ? { statement: d.statement } : {}) };
}

/* A cause's `since` against a recorded one: closed when the cause is not later (R16). Two nulls are the same instant;
   an unreadable pair is compared as text, never read as later. */
function notLater(since, recorded) {
  if (since == null || recorded == null) return since == null && recorded == null;
  const o = instantOrder(since, recorded);
  return Number.isNaN(o) ? String(since) <= String(recorded) : o <= 0;
}

/* R28, R29: whether a move's instant comes after a dependent's last write; a dependent with no stamp counts every move. An
   unreadable pair is compared as text. */
function laterThan(at, written) {
  if (written == null) return true;
  const o = instantOrder(at, written);
  return Number.isNaN(o) ? String(at) > String(written) : o > 0;
}

/* R29: the move, in the words a cause and an event share: both levels, the case and the edition, never an author. */
function attributionDetail(m) {
  /* R32: a capture's attesting member is never named, only the capture. */
  if (m.capture_sha)
    return `the credit level of the member attesting capture ${m.capture_sha.slice(0, 12)} moved from ${m.level_before} `
      + `to ${m.level_after}${m.case_id ? ` in case ${m.case_id}` : ""}${m.edition != null ? ` at edition ${m.edition}` : ""}, `
      + `at ${m.at}: how the member who attests it is identified has changed.`;
  return `the credit level of the observation ${m.observation} moved from ${m.level_before} to ${m.level_after}`
    + `${m.case_id ? ` in case ${m.case_id}` : ""}${m.edition != null ? ` at edition ${m.edition}` : ""}, at ${m.at}:`
    + ` how the member who gave it is identified has changed.`;
}

export class Reevaluation {
  #deps;
  #listeners = [];     // R8: {module, fn}, in registration order
  #caseParts = null;   // R26: {module, parts, cases}, publication's, one registration
  #docketReg = null;   // R30: {module, withdrawals, contested}, docket's, one registration

  constructor({ storage, record, membership, promotion, host = null, inquiry = null, content = null,
                connections = null, provenance = null, strength = null, basisVersions = null, contradiction = null,
                sources = null, acceptedWork = null, now = null, env = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.membership = membership;
    this.promotion = promotion;
    this.#deps = { host, inquiry, content, connections, provenance, strength, basisVersions, contradiction, sources, acceptedWork };
    this.now = typeof now === "function" ? now : () => stampInstant("second");
    this.env = env && typeof env === "object" ? env : {};
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  get content() { return this.#deps.content ||= contentOf(this.#deps.host); }
  get provenance() { return this.#deps.provenance ||= provenanceOf(this.#deps.host); }
  get strength() { return this.#deps.strength ||= strengthOf(this.#deps.host); }
  get basisVersions() { return this.#deps.basisVersions ||= basisVersionsOf(this.#deps.host); }
  get contradiction() { return this.#deps.contradiction ||= contradictionOf(this.#deps.host); }
  get sources() { return this.#deps.sources ||= sourcesOf(this.#deps.host); }
  get acceptedWork() {
    return this.#deps.acceptedWork ||= acceptedWorkOf(this.#deps.host, { record: this.record, promotion: this.promotion });
  }

  migrate() { migrateReevaluation(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  #when() { const w = this.now(); return typeof w === "string" && w ? w : stampInstant("second"); }

  /* R20: whether the viewer may see one bundle, by membership's one rule (its R43); absent and unseen are one answer. */
  #visible(id, viewer) {
    if (!id) return false;
    const g = viewerPredicate(viewer);
    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, id, ...g.args);
  }

  /* R3, R20: the same question of ONE id, as a function: a visible id passes, an unseen one answers null, a value naming
     no bundle is left alone. Memoised for the one answer it serves. */
  #redactor(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return (id) => id ?? null;          /* a machine credential: not filtered */
    if (g.scope === "DENY") return (id) => (id ? null : id ?? null);
    const memo = new Map();
    return (id) => {
      if (!id) return id ?? null;
      if (!memo.has(id))
        memo.set(id, !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, id, ...g.args));
      return memo.get(id) ? id : null;
    };
  }

  /* A bundle's live frontmatter, parsed from its bundle.md (record-core R13), or null. */
  #frontmatterOf(bundleId) {
    let md = null;
    try { md = this.record.readFile(bundleId, "bundle.md"); } catch { md = null; }
    if (!md || typeof md.text !== "string") return null;
    try { return parseFrontmatter(md.text).data || null; } catch { return null; }
  }

  /* The authored basis legs of a bundle, by ord: the fields `inquiry_basis` does not project (`target_edition`). */
  #basisFrontmatter(fm) {
    const legs = fm && Array.isArray(fm.basis) ? fm.basis : [];
    return legs.map((l) => (l && typeof l === "object" ? l : {}));
  }

  /* R4: the dependent's OWN authored triple, as its document states it (a legacy boolean is the flag alone). */
  #storedTriple(fm) {
    const rp = fm ? fm.reeval_pending : undefined;
    if (typeof rp === "boolean") return { flag: rp, since: null, source: null };
    if (rp && typeof rp === "object" && !Array.isArray(rp))
      return { flag: typeof rp.flag === "boolean" ? rp.flag : null,
               since: typeof rp.since === "string" ? rp.since : null,
               source: typeof rp.source === "string" ? rp.source : null };
    return { flag: null, since: null, source: null };
  }

  /* R2, R17: promotion's fact `publishedRegistry` for these ids (the published registry, per finding), or null when no
     module provides it: then no edition is read, and the answer says so (R21). */
  #registry(ids) {
    const list = [...new Set(ids.filter(Boolean))];
    if (!list.length) return {};
    const f = this.promotion.fact("publishedRegistry", null, list);
    return f && f.ok && f.value && typeof f.value === "object" ? f.value : null;
  }

  /* A target's own row, read through record-core: its `bundles` columns (R37) and its prior state (`head`, R41). */
  #targetRow(id) {
    const row = this.#one(`SELECT bundle_id, object_type, current_state, title, last_updated FROM bundles WHERE bundle_id=?`, id);
    if (!row) return null;
    let head = null;
    try { head = this.record.head(id); } catch { head = null; }
    return { ...row, prior_state: head ? head.priorState ?? null : null };
  }

  /* R16, the `annotation` cascade event: the latest annotation on the target addressed with a substantive change. */
  #addressedAnnotation(id) {
    let paths = null;
    try { paths = this.record.livePaths(id); } catch { paths = null; }
    let latest = null;
    for (const p of Array.isArray(paths) ? paths : []) {
      if (!p.startsWith("annotations/") || !p.endsWith(".json")) continue;
      let a = null;
      try { const f = this.record.readFile(id, p); a = f && typeof f.text === "string" ? JSON.parse(f.text) : null; }
      catch { a = null; }
      if (!a || a.state !== "addressed" || a.substantive !== true) continue;
      const when = typeof a.addressed_at === "string" ? a.addressed_at : null;
      if (!latest || (when && (!latest.at || String(when) > String(latest.at)))) latest = { id: a.id ?? p, at: when };
    }
    return latest;
  }

  /** R2, R16: one target's own row, answered as "has anything moved under a leg naming it?". `null` when nothing has,
   *  which is the common case and what keeps the untargeted sweep cheap. `reg` is the published registry (null unread);
   *  `wp` the answer's work-product reader (`#workProducts`), `dk` its docket reader (`#docket`). */
  #moved(targetId, visible, reg, wp = this.#workProducts(), dk = this.#docket()) {
    /* R1, R31: an imported finding reference is held by another group's case, never a bundle here: no row of its own
       moves, so it carries no cause of its own (and never a deletion); R31's arm is per leg. */
    if (isRef(targetId)) return null;
    const row = this.#targetRow(targetId);
    /* §5.4's gated deletion: a leg naming what the record no longer holds. When it went is not recorded here. */
    if (!row)
      return { held: false, state: null, object_type: null, edition: null,
               causes: [{ source: "deletion", since: null,
                          detail: `${targetId} is not held by this record: it was deleted, or was never held. A claim `
                                + `resting on it names something the record cannot show, and when it went is not `
                                + `recorded here, so no instant is stated.` }] };
    const causes = [];
    /* SUPERSESSION, from inquiry's reverse index and not from a walk. The superseding ids are BACK-REFERENCES: one the
       viewer may not see is withheld whole, never a null in its place, the key is left out when none is left, and the
       fact that this bundle was superseded still stands (REC-30; R2, R20, DEC-36). `withheld` says one was. */
    const sup = this.inquiry.supersededBy(targetId) || [];
    let supersededBy = null, withheld = false;
    if (sup.length) {
      supersededBy = sup.filter((id) => visible(id) !== null);
      withheld = supersededBy.length < sup.length;
      /* D-443: ONE json_each value — a question's successors are bounded by no cap (D-36). */
      const when = this.#one(
        `SELECT MAX(last_updated) AS m FROM bundles WHERE bundle_id IN (SELECT value FROM json_each(?))`,
        JSON.stringify(sup));
      causes.push({ source: "supersession", since: (when && when.m) || row.last_updated,
                    detail: `${targetId} has been superseded. The question it asked is carried forward by `
                          + `what supersedes it, and a leg naming ${targetId} was not re-pointed by that `
                          + `act — nothing here re-points it for you.` });
    }
    /* THE LIFECYCLE ARMS (D-5), off the target's own state pair; the reversible acts RAISE rather than refuse. */
    if (row.current_state === "deferred")
      causes.push({ source: "deferred", since: row.last_updated,
                    detail: `${targetId} has been set down. It is reversible and the group may pick it back `
                          + `up, and until it does, a claim resting on it rests on a question nobody is `
                          + `working.` });
    else if (row.current_state === "dismissed")
      causes.push({ source: "dismissed", since: row.last_updated,
                    detail: `${targetId} was abandoned. A claim resting on it names a question that will `
                          + `not be answered.` });
    /* CASE-4 / DEC-72: `concluded` joins the prior states that mean "reopened". `concluded -> open` is refused by
       reopen for every finding that is not a case member, so a document at `open` with `prior_state: concluded` can
       only have got there by a case member being picked back up. */
    else if (row.current_state === "open"
             && (REOPENABLE_FROM.includes(row.prior_state) || row.prior_state === "concluded"))
      causes.push({ source: "reopened", since: row.last_updated,
                    detail: `${targetId} was picked back up from ${row.prior_state}. What it concluded is `
                          + `being worked again, which is a reason to look at what rests on it.` });
    /* R16: §5.4's cascade events, each a fact the record states about the target (the obligation is derived on read,
       never a flag a cascade sets). */
    const type = normalizeType(row.object_type);
    const fm = type === "information" || (reg && reg[targetId] && reg[targetId].latest > 0)
      ? this.#frontmatterOf(targetId) : null;
    if (type === "information" && fm && (fm.source_status === "modified" || fm.source_status === "removed"))
      causes.push({ source: "source_status", since: row.last_updated,
                    detail: fm.source_status === "removed"
                      ? `the source of ${targetId} no longer serves it (source_status: removed). What a claim quotes `
                        + `from it can no longer be checked against the source.`
                      : `the source of ${targetId} has changed since it was captured (source_status: modified); both `
                        + `versions are kept, and a claim resting on it rests on the earlier one.` });
    /* N457: a project's work product is its case editions (DEC-72), read through R26's registration and promotion's
       fact; no document field is read for it (`workproduct_state` is retired, K899 (3)). A case edition withdrawn on its
       docket raises it too, read through R30's registration (DEC-116 item 7). */
    if (type === "project") causes.push(...wp.of(targetId), ...this.#withdrawnProject(targetId, dk));
    const ann = this.#addressedAnnotation(targetId);
    if (ann)
      causes.push({ source: "annotation", since: ann.at,
                    detail: `an annotation on ${targetId} was addressed with a substantive change (${ann.id}). What `
                          + `a claim took from it may have changed with it.` });
    /* THE EDITION ARM is per LEG (it depends on which edition the leg named), so what is computed here is the target's
       latest edition: the greater of what has been RATIFIED and what the working document now says, both reported so
       neither is implied. The document is read only where it could carry an edition at all (a ratified one exists). */
    const entry = reg ? reg[targetId] : null;
    const latestRatified = entry && Number.isFinite(Number(entry.latest)) ? Number(entry.latest) : 0;
    const authored = latestRatified > 0 && fm && Number.isInteger(fm.edition) ? fm.edition : 0;
    const latest = Math.max(latestRatified, authored);
    const edition = latest > 1 ? { latest, latest_ratified: latestRatified, since: row.last_updated } : null;
    if (!causes.length && !edition) return null;
    return { held: true, state: row.current_state, object_type: row.object_type, causes, edition, withheld,
             ...(supersededBy && supersededBy.length ? { superseded_by: supersededBy } : {}) };
  }

  /** R16 (N457, K901): the `wp_retraction` causes, read once per answer. A project's work product is a case it owns
   *  (DEC-72); the cause stands on the project when such a case has a ratified edition superseded by a later ratified
   *  one (a correction is a new edition, publication R24), one cause per case, `since` the latest edition's
   *  ratification. The cases and their owning project come through R26's registration (`cases`, `parts`' `project`),
   *  their editions through promotion's fact `publishedCaseRegistry`, never a later module's service (P4). A withdrawn
   *  edition is R30's half of the cause (`#withdrawnProject`), read through the docket's registration. Answers `{of(project), flags()}`: `of` the causes
   *  on one project, the cases paged through on its first call; `flags` what the answer states when the read could not
   *  be made (R21): `case_parts_absent` with none registered, `work_products_read: false` when a read failed. */
  #workProducts() {
    const state = { asked: false, absent: false, read: true, owned: null, causes: new Map() };
    const owned = (reg) => {
      const byProject = new Map();
      let after = "";
      for (;;) {
        let page = null;
        try { page = reg.cases({ after, limit: WORK_PRODUCT_CASES_PAGE }); } catch { page = null; }
        if (!page || !Array.isArray(page.cases)) { state.read = false; break; }
        const ids = page.cases.filter((c) => typeof c === "string" && c);
        for (const id of ids) {
          let a = null;
          try { a = reg.parts({ case: id }); } catch { a = null; }
          if (!a) { state.read = false; continue; }
          /* a case with no ratified edition answers a refusal: it owns no edition yet, so it is no work product */
          const project = a.ok === false ? null : str(a.project);
          if (!project) continue;
          if (!byProject.has(project)) byProject.set(project, []);
          if (!byProject.get(project).includes(id)) byProject.get(project).push(id);
        }
        const next = typeof page.cursor === "string" ? page.cursor : null;
        if (!ids.length || next === null || next <= after) break;
        after = next;
      }
      return byProject;
    };
    const of = (project) => {
      state.asked = true;
      if (state.causes.has(project)) return state.causes.get(project);
      const reg = this.#caseParts;
      if (!reg) { state.absent = true; return []; }
      if (!state.owned) state.owned = owned(reg);
      const ids = [...(state.owned.get(project) || [])].sort();
      const out = [];
      if (ids.length) {
        const f = this.promotion.fact("publishedCaseRegistry", ids);
        const value = f && f.ok && f.value && typeof f.value === "object" ? f.value : null;
        if (!value) state.read = false;
        for (const id of value ? ids : []) {
          const e = value[id];
          const eds = (e && e.editions && typeof e.editions === "object" ? Object.values(e.editions) : [])
            .filter((x) => x && Number.isInteger(Number(x.edition)) && typeof x.ratified_at === "string" && x.ratified_at)
            .sort((x, y) => Number(x.edition) - Number(y.edition));
          if (eds.length < 2) continue;
          const latest = eds[eds.length - 1], prior = eds[eds.length - 2];
          out.push({ source: "wp_retraction", since: latest.ratified_at, case: id, edition: Number(latest.edition),
                     superseded_edition: Number(prior.edition),
                     detail: `case ${id}, a work product of ${project}, was corrected: its ratified edition `
                       + `${Number(prior.edition)} is superseded by edition ${Number(latest.edition)}, ratified at `
                       + `${latest.ratified_at}. Edition ${Number(prior.edition)} keeps answering as it was signed, and what `
                       + `a claim took from the work product may no longer be what its authors stand behind.` });
        }
      }
      state.causes.set(project, out);
      return out;
    };
    const flags = () => !state.asked ? {} : {
      ...(state.absent ? { case_parts_absent: true, case_parts_why: CASE_PARTS_ABSENT } : {}),
      ...(state.read ? {} : { work_products_read: false, work_products_why: WORK_PRODUCTS_UNREAD }) };
    return { of, flags };
  }

  /** R30: the docket as one answer reads it, through the registration `docket` fills (its R13): every withdrawal and
   *  every contesting record entry, each paged through once, on first use. A withdrawal is `{case, project, editions,
   *  findings: [{bundle_id, sha, edition}], at, seq, entry}` (`findings` each member finding of each withdrawn edition at
   *  its pin; `at` the signing instant); a contesting entry `{case, edition, findings: [{bundle_id, sha}], at, entry}`
   *  (`at` the filing instant). An entry naming no `entry` is named `<case>#<seq>`. Answers `{get(), flags()}`: `get`
   *  the read (`byProject`, `pinned` and `contested` keyed by project and finding, `entries` by `<kind>\0<entry>`);
   *  `flags` what the answer states when nothing is registered (`docket_absent`) or a page could not be read
   *  (`docket_read: false`), R21. */
  #docket() {
    let read = null;
    const get = () => {
      if (read) return read;
      const reg = this.#docketReg;
      read = { absent: !reg, ok: true, byProject: new Map(), pinned: new Map(), contested: new Map(), entries: new Map() };
      if (!reg) return read;
      const pageAll = (fn, key) => {
        const items = [], seen = new Set();
        let after = "";
        for (;;) {
          let page = null;
          try { page = fn({ after, limit: DOCKET_PAGE }); } catch { page = null; }
          if (!page || !Array.isArray(page[key])) { read.ok = false; break; }
          items.push(...page[key].filter((x) => x && typeof x === "object"));
          const next = typeof page.cursor === "string" ? page.cursor : null;
          if (!page[key].length || next === null || seen.has(next)) break;
          seen.add(next);
          after = next;
        }
        return items;
      };
      const push = (map, k, v) => { if (!map.has(k)) map.set(k, []); map.get(k).push(v); };
      const int = (v) => (Number.isInteger(Number(v)) && v !== null && v !== "" ? Number(v) : null);
      const named = (x, c) => str(x.entry) ?? (x.seq != null ? `${c}#${x.seq}` : null);
      const pins = (x) => (Array.isArray(x.findings) ? x.findings : []).map((f) => ({
        bundle_id: f ? str(f.bundle_id) : null, sha: f ? str(f.sha) : null, edition: f ? int(f.edition) : null }))
        .filter((f) => f.bundle_id && f.sha);
      for (const x of pageAll(reg.withdrawals, "withdrawals")) {
        const c = str(x.case), entry = named(x, c), at = str(x.at);
        if (!c || !entry) { read.ok = false; continue; }
        const editions = [...new Set((Array.isArray(x.editions) ? x.editions : [x.editions]).map(int).filter((e) => e !== null))]
          .sort((a, b) => a - b);
        const w = { kind: "withdrawal", case: c, project: str(x.project), editions, at, seq: x.seq ?? null, entry,
                    findings: pins(x) };
        read.entries.set(`withdrawal\u0000${entry}`, w);
        if (w.project) push(read.byProject, w.project, w);
        for (const f of w.findings) push(read.pinned, f.bundle_id, { w, f });
      }
      for (const x of pageAll(reg.contested, "contested")) {
        const c = str(x.case), entry = named(x, c), at = str(x.at);
        if (!c || !entry) { read.ok = false; continue; }
        const e = { kind: "contested", case: c, edition: int(x.edition), at, entry, findings: pins(x) };
        read.entries.set(`contested\u0000${entry}`, e);
        for (const id of new Set(e.findings.map((f) => f.bundle_id))) push(read.contested, id, e);
      }
      return read;
    };
    const flags = () => {
      const d = get();
      return { ...(d.absent ? { docket_absent: true, docket_why: DOCKET_ABSENT } : {}),
               ...(d.ok ? {} : { docket_read: false, docket_read_why: DOCKET_UNREAD }) };
    };
    return { get, flags };
  }

  /** R16 (N520; DEC-116 item 7): the `wp_retraction` causes a project carries for each withdrawal of an edition of a case
   *  it owns, the owning project as the docket names it, `since` the signing instant, `detail` naming the case, the
   *  edition or editions withdrawn and the entry. None while nothing is registered (the answer says so). */
  #withdrawnProject(project, dk) {
    return (dk.get().byProject.get(project) || []).map((w) => ({
      source: "wp_retraction", since: w.at, case: w.case, withdrawn_editions: w.editions, entry: w.entry,
      detail: `case ${w.case}, a work product of ${project}, was withdrawn on its docket: `
        + `${w.editions.length === 1 ? `edition ${w.editions[0]}` : `editions ${w.editions.join(", ")}`} `
        + `(entry ${w.entry}, signed at ${w.at}). The edition keeps answering as it was signed, and its authors no longer `
        + `stand behind it; what a claim took from the work product is worth a second look.` }));
  }

  /** R30 (a): the `withdrawal` causes on `legs` (`inquiry_basis` rows), for a viewer's visible dependents. A live leg
   *  (R7) carries one per withdrawal pinning its target, a member finding of the withdrawn edition, at the sha the leg
   *  rests on: the edition of the finding the leg names (`target_edition`), published with that `bundle_sha`
   *  (`publishedRegistry`), or, naming none, the finding's live head at that sha. `only` keeps one entry's. Answers
   *  `{byPair}` keyed `<dependent>\0<target>`, each list in (ord, entry) order. Reads only; regrades nothing (R19). */
  #withdrawn(legs, visible, dk, only = null) {
    const byPair = new Map();
    const pinned = dk.get().pinned;
    if (!pinned.size) return { byPair };
    const rows = legs.filter((l) => l && l.bundle_id && pinned.has(l.target_id) && visible(l.bundle_id) !== null);
    if (!rows.length) return { byPair };
    const targets = [...new Set(rows.map((l) => l.target_id))];
    const reg = this.#registry(targets) || {};
    const heads = new Map();
    const headOf = (id) => {
      if (!heads.has(id)) { let h = null; try { h = this.record.head(id); } catch { h = null; } heads.set(id, h ? h.bundleSha ?? null : null); }
      return heads.get(id);
    };
    const fms = new Map();
    const citedOf = (l) => {
      if (!fms.has(l.bundle_id)) fms.set(l.bundle_id, this.#basisFrontmatter(this.#frontmatterOf(l.bundle_id)));
      const leg = fms.get(l.bundle_id)[l.ord];
      return leg && leg.target === l.target_id && leg.target_edition != null ? Number(leg.target_edition) : null;
    };
    const hits = [];
    for (const l of rows) {
      const cited = citedOf(l);
      const at = cited === null ? headOf(l.target_id)
        : reg[l.target_id]?.editions?.[String(cited)]?.bundle_sha ?? null;
      if (!at) continue;
      for (const { w, f } of pinned.get(l.target_id))
        if (f.sha === at && (!only || w.entry === only)) hits.push({ l, w, f, cited });
    }
    if (!hits.length) return { byPair };
    const live = this.#liveOn(hits.map((h) => h.l.target_id));
    for (const { l, w, f, cited } of hits) {
      const x = live.get(l.target_id).get(`${l.bundle_id}\u0000${l.ord}`);
      if (!x) continue;
      const pk = `${l.bundle_id}\u0000${l.target_id}`;
      if (!byPair.has(pk)) byPair.set(pk, []);
      if (byPair.get(pk).some((c) => c.ord === l.ord && c.entry === w.entry)) continue;
      byPair.get(pk).push({
        source: "withdrawal", since: w.at, ord: l.ord, role: x.role ?? null, state: x.state ?? null, case: w.case,
        edition: f.edition, withdrawn_editions: w.editions, entry: w.entry, finding: l.target_id, sha: f.sha,
        cited_edition: cited,
        detail: `this leg rests on ${l.target_id} at ${f.sha.slice(0, 12)}, a member finding of case ${w.case}`
          + `${f.edition != null ? ` edition ${f.edition}` : ""}, which was withdrawn on its docket (entry ${w.entry}, `
          + `signed at ${w.at}). The finding keeps answering as it was signed and the leg's grade is unchanged; whether `
          + `this finding still stands is the members' to decide.` });
    }
    for (const list of byPair.values())
      list.sort((a, b) => (a.ord - b.ord) || (a.entry < b.entry ? -1 : a.entry > b.entry ? 1 : 0));
    return { byPair };
  }

  /** R30 (b): the `contested` causes a member finding carries, one per contesting record entry naming an edition it is
   *  a member of, `since` the filing instant, in entry order. Its own target, as R17's `weakened` is. Reads only. */
  #contestedOn(finding, dk, only = null) {
    return (dk.get().contested.get(finding) || []).filter((e) => !only || e.entry === only)
      .map((e) => ({
        source: "contested", since: e.at, case: e.case, edition: e.edition, entry: e.entry,
        detail: `${finding} is a member finding of case ${e.case}${e.edition != null ? ` edition ${e.edition}` : ""}, `
          + `and a response filed on its docket contests that edition (entry ${e.entry}, filed at ${e.at}). Nothing `
          + `was moved and no entry is evidence; whether this finding still stands is the members' to decide.` }))
      .sort((a, b) => (a.entry < b.entry ? -1 : a.entry > b.entry ? 1 : 0));
  }

  /** R31 (DEC-96 item 1): accepted work's withdrawals as one answer reads them, through `accepted-work`'s
   *  `acceptanceWithdrawals` (its R2), paged through each `cursor` to null on first use. A withdrawal is `{withdrawal,
   *  import, edition, refs, at}`. Answers `{get(), flags()}`: `get` the read (`byRefEdition` keyed `<ref>\0<edition>`,
   *  `entries` by withdrawal id); `flags` what the answer states when nothing is registered (`accepted_work_absent`) or a
   *  page could not be read (`acceptance_read: false`), R21. */
  #accepted() {
    let read = null;
    const get = () => {
      if (read) return read;
      read = { absent: false, ok: true, byRefEdition: new Map(), entries: new Map() };
      const seen = new Set();
      let after = "";
      for (;;) {
        let page = null;
        try { page = this.acceptedWork.acceptanceWithdrawals({ after, limit: ACCEPTANCE_PAGE }); } catch { page = null; }
        if (page && page.absent === true) { read.absent = true; break; }
        if (!page || !Array.isArray(page.withdrawals)) { read.ok = false; break; }
        for (const x of page.withdrawals) {
          const id = x && typeof x === "object" ? str(x.withdrawal) : null;
          const edition = x && Number.isInteger(x.edition) && x.edition > 0 ? x.edition : null;
          if (!id || edition === null) { read.ok = false; continue; }
          const w = { withdrawal: id, import: str(x.import), edition, at: str(x.at),
                      refs: [...new Set((Array.isArray(x.refs) ? x.refs : []).map(str).filter(isRef))].sort() };
          read.entries.set(id, w);
          for (const ref of w.refs) {
            const k = `${ref}\u0000${edition}`;
            if (!read.byRefEdition.has(k)) read.byRefEdition.set(k, []);
            read.byRefEdition.get(k).push(w);
          }
        }
        const next = typeof page.cursor === "string" ? page.cursor : null;
        if (!page.withdrawals.length || next === null || seen.has(next)) break;
        seen.add(next);
        after = next;
      }
      return read;
    };
    const flags = () => {
      const a = get();
      return { ...(a.absent ? { accepted_work_absent: true, accepted_work_why: ACCEPTED_WORK_ABSENT_WHY } : {}),
               ...(a.ok ? {} : { acceptance_read: false, acceptance_read_why: ACCEPTANCE_UNREAD }) };
    };
    return { get, flags };
  }

  /* R1, R31: the edition each leg on a ref names (`target_edition`, authored on the leg and not projected), keyed
     `<bundle>\0<ord>`; a leg whose document no longer names that target there names none. */
  #citedEditions(legs) {
    const fms = new Map(), out = new Map();
    for (const l of legs) {
      if (!fms.has(l.bundle_id)) fms.set(l.bundle_id, this.#basisFrontmatter(this.#frontmatterOf(l.bundle_id)));
      const leg = fms.get(l.bundle_id)[l.ord];
      const e = leg && typeof leg.target === "string" && leg.target.trim() === l.target_id ? Number(leg.target_edition) : NaN;
      out.set(`${l.bundle_id}\u0000${l.ord}`, Number.isInteger(e) && e > 0 ? e : null);
    }
    return out;
  }

  /** R1 (N522): whether a viewer may see an imported finding reference: `accepted-work.acceptedFinding` answers a
   *  finding at some edition a leg on it names. Answers `{seen(ref), flags()}`: `seen` true or false, memoised for the
   *  answer; a machine credential is not filtered, as for a bundle; with nothing registered, or the read unreadable,
   *  the ref is not seen (whether it may be cannot be read, R20). `flags` states `accepted_work_absent` when nothing is
   *  registered, and a failed read nothing more (R1, R20; K1312). */
  #refSeer(viewer) {
    const g = viewerPredicate(viewer);
    const memo = new Map();
    const state = { absent: false };
    const seen = (ref) => {
      if (!isRef(ref)) return false;
      if (g.scope === "member") return true;
      if (g.scope === "DENY") return false;
      if (memo.has(ref)) return memo.get(ref);
      const legs = this.#rows(`SELECT bundle_id, ord, target_id FROM inquiry_basis WHERE target_id = ? ORDER BY bundle_id, ord`, ref);
      const editions = [...new Set([...this.#citedEditions(legs).values()].filter((e) => e !== null))].sort((a, b) => a - b);
      let ok = false;
      for (const edition of editions) {
        let a = null;
        try { a = this.acceptedWork.acceptedFinding({ ref, edition, viewer }); } catch { a = { unreadable: true }; }
        if (a && a.absent === true) { state.absent = true; break; }
        if (a && a.unreadable === true) continue;
        if (a && typeof a === "object") { ok = true; break; }
      }
      memo.set(ref, ok);
      return ok;
    };
    const flags = () => (state.absent ? { accepted_work_absent: true, accepted_work_why: ACCEPTED_WORK_ABSENT_WHY } : {});
    return { seen, flags };
  }

  /** R31 (DEC-96 item 1): the `acceptance` causes on `legs` (`inquiry_basis` rows), for a viewer's visible dependents.
   *  A live leg (R7) on an imported finding reference carries one per withdrawal naming that ref at the edition the leg
   *  names, `since` the withdrawal's instant, `detail` the source group, case and edition (read through
   *  `acceptedFinding`; null where it answers none) and the withdrawal. A read path asks for its `viewer`, a viewer never
   *  sent asked as nobody, so an import's group and case read null to whom `case-import` R4, R16 do not show them; the
   *  telling (`plane`) asks with no viewer, the plane reading for itself (N531). `only` keeps one withdrawal's. Answers
   *  `{byPair}` keyed `<dependent>\0<target>`, each list in (ord, withdrawal) order. Reads only; regrades nothing (R19). */
  #acceptanceOn(legs, visible, aw, viewer, only = null, { plane = false } = {}) {
    const asking = plane ? null : (viewer ?? "");
    const byPair = new Map();
    const index = aw.get().byRefEdition;
    if (!index.size) return { byPair };
    const rows = legs.filter((l) => l && l.bundle_id && isRef(l.target_id) && visible(l.bundle_id) !== null);
    if (!rows.length) return { byPair };
    const cited = this.#citedEditions(rows);
    const hits = [];
    for (const l of rows) {
      const edition = cited.get(`${l.bundle_id}\u0000${l.ord}`);
      if (edition === null) continue;
      for (const w of index.get(`${l.target_id}\u0000${edition}`) || [])
        if (!only || w.withdrawal === only) hits.push({ l, w, edition });
    }
    if (!hits.length) return { byPair };
    const live = this.#liveOn(hits.map((h) => h.l.target_id));
    const source = new Map();
    const sourceOf = (ref, edition) => {
      const k = `${ref}\u0000${edition}`;
      if (!source.has(k)) {
        let a = null;
        try { a = this.acceptedWork.acceptedFinding({ ref, edition, viewer: asking }); } catch { a = null; }
        source.set(k, a && typeof a === "object" && !a.absent && !a.unreadable
          ? { group: str(a.group), case: str(a.case) } : { group: null, case: null });
      }
      return source.get(k);
    };
    for (const { l, w, edition } of hits) {
      const x = live.get(l.target_id).get(`${l.bundle_id}\u0000${l.ord}`);
      if (!x) continue;
      const pk = `${l.bundle_id}\u0000${l.target_id}`;
      if (!byPair.has(pk)) byPair.set(pk, []);
      if (byPair.get(pk).some((c) => c.ord === l.ord && c.withdrawal === w.withdrawal)) continue;
      const s = sourceOf(l.target_id, edition);
      byPair.get(pk).push({
        source: "acceptance", since: w.at, ord: l.ord, role: x.role ?? null, state: x.state ?? null, ref: l.target_id,
        edition, withdrawal: w.withdrawal, import: w.import, group: s.group, case: s.case,
        detail: `this leg rests on another group's finding ${l.target_id} at edition ${edition}`
          + `${s.case ? `, of case ${s.case}` : ""}${s.group ? ` by ${s.group}` : ""}, and this group's acceptance of that `
          + `edition was withdrawn (${w.withdrawal}${w.at ? `, at ${w.at}` : ""}). The finding keeps answering as that `
          + `group published it and the leg is unchanged; whether this finding still stands is the members' to decide.` });
    }
    for (const list of byPair.values())
      list.sort((a, b) => (a.ord - b.ord) || (a.withdrawal < b.withdrawal ? -1 : a.withdrawal > b.withdrawal ? 1 : 0));
    return { byPair };
  }

  /* R16: the recorded re-evaluations of the (dependent, target) pairs one answer lists, keyed (dependent, target,
     source): the LATEST record of each key, which is the one with the latest `since`, because a record is only written
     for a cause still owed, whose `since` is later than every earlier record's (`recordReevaluation`). So the read is
     one row per key, at most one per cause source per pair, and its `LIMIT` says so (N182 (2)). */
  #records(pairs) {
    const keys = [...new Map(pairs.map(([d, t]) => [`${d}\u0000${t}`, { d, t }])).values()];
    if (!keys.length) return new Map();
    const rows = this.#rows(
      `SELECT dependent, target, source, since, note, author, at FROM reevaluation_records
        WHERE record_id IN (
          SELECT MAX(r.record_id) FROM reevaluation_records r
            JOIN json_each(?) k ON r.dependent = json_extract(k.value, '$.d') AND r.target = json_extract(k.value, '$.t')
           GROUP BY r.dependent, r.target, r.source)
        ORDER BY record_id LIMIT ?`, JSON.stringify(keys), keys.length * CAUSE_SOURCES.length);
    return new Map(rows.map((r) => [`${r.dependent}\u0000${r.target}\u0000${r.source}`, r]));
  }

  /* R16: split one obligation's causes into those still owed and those a member's recorded re-evaluation closed. */
  #split(dependent, target, causes, records) {
    const open = [], closed = [];
    for (const c of causes) {
      const r = records.get(`${dependent}\u0000${target}\u0000${c.source}`);
      if (r && notLater(c.since, r.since))
        closed.push({ ...c, closed_by: r.author, closed_at: r.at, note: r.note });
      else open.push(c);
    }
    return { open, closed };
  }

  /* R4: the dependent's pair per axis with its depth bound (`strength.strengthOf`), unaltered. */
  #strengthOf(bundleId) {
    let s = null;
    try { s = this.strength.strengthOf(bundleId); } catch { s = null; }
    if (!s || s.ok === false) return null;
    return { capture: s.capture, connection: s.connection, testimony: s.testimony, depth_bound: s.depth_bound };
  }

  /** R17: a dependent at a published edition whose derived pair now reads weaker on an axis than that edition's frozen
   *  pair: the cause `weakened`, naming both per axis. Weaker is both graded and the derived letter ranking below the
   *  frozen one; an axis either side leaves ungraded is not compared. Neither pair is altered. */
  #weakened(dependent, reg) {
    const e = reg ? reg[dependent] : null;
    const latest = e && Number(e.latest) > 0 ? Number(e.latest) : 0;
    if (!latest) return null;
    const frozen = e.editions ? e.editions[String(latest)] : null;
    if (!frozen) return null;
    const derived = this.#strengthOf(dependent);
    if (!derived) return null;
    const axes = [];
    for (const axis of PAIR_AXES) {
      const f = frozen[axis], d = derived[axis];
      if (!f || !d || f.state !== "graded" || d.state !== "graded" || !f.grade || !d.grade) continue;
      if (!(f.grade in GRADE_RANK) || !(d.grade in GRADE_RANK)) continue;
      if (GRADE_RANK[d.grade] < GRADE_RANK[f.grade])
        axes.push({ axis, frozen: { state: f.state, grade: f.grade }, derived: { state: d.state, grade: d.grade } });
    }
    if (!axes.length) return null;
    return {
      source: "weakened", since: frozen.ratified_at ?? null, edition: latest, axes,
      detail: `${dependent} now derives weaker than edition ${latest} froze: `
        + axes.map((a) => `${a.axis} ${a.derived.grade} where the edition says ${a.frozen.grade}`).join("; ")
        + `. The signed edition keeps its own pair and nothing here changes either; a new edition stays the `
        + `authors' choice (DEC-12, DEC-69).`,
    };
  }

  /** R27: the `corrected` causes on `legs` (`inquiry_basis` rows: `bundle_id`, `ord`, `target_id`, `content_id`), for a
   *  viewer. A live leg (R7's) carries one per stale mark `contradiction.tensionsOn` answers on a referent the leg rests
   *  on: its content row at that row's capture (a leg or an extent side on the same row, the stale leg's own inquiry
   *  included), and, when its target is an inquiry, each claimed version of that inquiry. A stance side is never marked
   *  stale (contradiction R33, R36 refuse a CORRECTED kind on K5), so none is asked. Answers `{byPair, read}`: `byPair`
   *  keyed `<dependent>\0<target>`, each cause list in (ord, candidate) order; `read` false when a tensions read could
   *  not be made, so no answer reads "none corrected" that did not read it (R21). Reads only. */
  #corrected(legs, viewer, visible) {
    const byPair = new Map();
    const rows = legs.filter((l) => l && l.bundle_id && l.target_id && visible(l.bundle_id) !== null);
    if (!rows.length) return { byPair, read: true };
    const cids = [...new Set(rows.map((l) => l.content_id).filter(Boolean))];
    const caps = new Map((cids.length
      ? this.#rows(`SELECT content_id, capture_sha FROM content WHERE content_id IN (SELECT value FROM json_each(?)) LIMIT ?`,
                   JSON.stringify(cids), cids.length)
      : []).filter((r) => r.capture_sha).map((r) => [r.content_id, r.capture_sha]));
    const tids = [...new Set(rows.map((l) => l.target_id))];
    const claims = new Map();
    for (const v of this.#rows(
      `SELECT bundle_id, name, claim FROM inquiry_basis_versions
        WHERE bundle_id IN (SELECT value FROM json_each(?)) AND claim IS NOT NULL AND claim <> ''
        ORDER BY bundle_id, name`, JSON.stringify(tids))) {
      if (!claims.has(v.bundle_id)) claims.set(v.bundle_id, []);
      claims.get(v.bundle_id).push({ name: v.name, ref: `${v.bundle_id}|${v.name}`, version: sha256HexSync(String(v.claim)) });
    }
    /* Each referent asked once, in chunks of contradiction's own bound (its R27, C-60.3). */
    const key = (ref, version) => `${ref}\u0000${version}`;
    const asked = new Map();
    for (const [cid, cap] of caps) asked.set(key(cid, cap), { ref: cid, version: cap });
    for (const list of claims.values()) for (const c of list) asked.set(key(c.ref, c.version), { ref: c.ref, version: c.version });
    const stale = new Map();
    let read = true;
    const all = [...asked.entries()];
    for (let i = 0; i < all.length; i += TENSIONS_REFERENTS_MAX) {
      const chunk = all.slice(i, i + TENSIONS_REFERENTS_MAX);
      let t = null;
      try { t = this.contradiction.tensionsOn({ referents: chunk.map(([, r]) => r), viewer }); } catch { t = null; }
      if (!t || t.ok !== true || t.undetermined || !Array.isArray(t.referents) || t.referents.length !== chunk.length) {
        read = false; continue;
      }
      chunk.forEach(([k], j) => {
        const marks = (t.referents[j] && Array.isArray(t.referents[j].marks) ? t.referents[j].marks : [])
          .filter((m) => m && m.mark === "stale" && m.candidate);
        if (marks.length) stale.set(k, marks);
      });
    }
    if (!stale.size) return { byPair, read };
    /* Only a LIVE leg rests on anything (R7): a divided citer and a severed leg carry no cause. Asked only of the
       targets a stale side was found under. */
    const hitOn = (l) => {
      const out = [];
      const cap = l.content_id ? caps.get(l.content_id) : null;
      if (cap) for (const m of stale.get(key(l.content_id, cap)) || [])
        out.push({ m, side: { on: "content", content_id: l.content_id, capture_sha: cap } });
      for (const c of claims.get(l.target_id) || [])
        for (const m of stale.get(key(c.ref, c.version)) || [])
          out.push({ m, side: { on: "claim", inquiry: l.target_id, version: c.name } });
      return out;
    };
    const hits = rows.map((l) => ({ l, found: hitOn(l) })).filter((h) => h.found.length);
    const live = new Map();
    for (const t of new Set(hits.map((h) => h.l.target_id))) {
      let r = null;
      try { r = this.inquiry.restsOnLive(t); } catch { r = null; }
      live.set(t, new Set((r && Array.isArray(r.all) ? r.all : []).map((x) => `${x.bundle_id}\u0000${x.ord}`)));
    }
    for (const { l, found } of hits) {
      if (!live.get(l.target_id).has(`${l.bundle_id}\u0000${l.ord}`)) continue;
      const pk = `${l.bundle_id}\u0000${l.target_id}`;
      if (!byPair.has(pk)) byPair.set(pk, []);
      for (const { m, side } of found) {
        const what = side.on === "content"
          ? `the passage ${side.content_id} this leg rests on (capture ${side.capture_sha.slice(0, 12)})`
          : `the claim of ${side.inquiry} at version ${side.version}, which this leg names`;
        byPair.get(pk).push({
          source: "corrected", since: m.at ?? null, ord: l.ord, candidate: m.candidate, kind: m.kind ?? null,
          reason: m.reason ?? null, member: m.member ?? null,
          ...(m.inquiry ? { inquiry: m.inquiry } : {}), ...(m.act ? { act: m.act } : {}), side,
          /* N359: a mark carries its marking act's instant (a member's `one_wrong`, or R36's concluding act); only a
             conclusion reached by basis-versions' own door has none, and the mark says why. */
          ...(m.at ? {} : { since_why: `${typeof m.why === "string" && m.why ? `${m.why}; ` : ""}the tensions read states `
                              + "no instant for this mark, and none is invented here" }),
          detail: `${what} was named wrong by a member's resolution of contradiction ${m.candidate}`
            + `${m.reason ? ` (${m.reason})` : ""}. It still resolves and says it was corrected; nothing resting on it `
            + `was moved, and whether this finding still stands is the members' to decide.`,
        });
      }
    }
    for (const list of byPair.values())
      list.sort((a, b) => (a.ord - b.ord) || (a.candidate < b.candidate ? -1 : a.candidate > b.candidate ? 1 : 0));
    return { byPair, read };
  }

  /* R28: the captures each leg rests on, keyed `<bundle>\0<ord>`: its content row's capture (content R45), or, on a
     leg naming no passage, each capture its target registers (provenance's `register`, R48). */
  #legCaptures(legs) {
    const out = new Map();
    const cids = [...new Set(legs.map((l) => l.content_id).filter(Boolean))];
    const byCid = new Map((cids.length
      ? this.#rows(`SELECT content_id, capture_sha FROM content WHERE content_id IN (SELECT value FROM json_each(?)) LIMIT ?`,
                   JSON.stringify(cids), cids.length) : []).filter((r) => r.capture_sha).map((r) => [r.content_id, r.capture_sha]));
    const whole = [...new Set(legs.filter((l) => !l.content_id).map((l) => l.target_id))];
    const byTarget = new Map();
    for (const r of whole.length
      ? this.#rows(`SELECT DISTINCT bundle_id, capture_sha FROM register WHERE bundle_id IN (SELECT value FROM json_each(?))
                     ORDER BY bundle_id, capture_sha`, JSON.stringify(whole)) : []) {
      if (!byTarget.has(r.bundle_id)) byTarget.set(r.bundle_id, []);
      byTarget.get(r.bundle_id).push(r.capture_sha);
    }
    for (const l of legs)
      out.set(`${l.bundle_id}\u0000${l.ord}`, l.content_id ? (byCid.has(l.content_id) ? [byCid.get(l.content_id)] : [])
                                                            : byTarget.get(l.target_id) || []);
    return out;
  }

  /* R7's live legs, as a set of `<bundle>\0<ord>` per target (`inquiry.restsOnLive`). */
  #liveOn(targets) {
    const live = new Map();
    for (const t of new Set(targets)) {
      let r = null;
      try { r = this.inquiry.restsOnLive(t); } catch { r = null; }
      live.set(t, new Map((r && Array.isArray(r.all) ? r.all : []).map((x) => [`${x.bundle_id}\u0000${x.ord}`, x])));
    }
    return live;
  }

  /** R28: the `source` causes on `legs` (`inquiry_basis` rows), for a viewer's visible dependents. A live leg carries one
   *  per heard rung move of a source standing behind a capture it rests on (`source_knocks`, sources R15), when the move
   *  came after the dependent's last write (`bundles.last_updated`). Answers `{byPair}` keyed `<dependent>\0<target>`,
   *  each list latest move first, then ord. Reads only; `rungOf` is never called here. */
  #sourceMoves(legs, visible) {
    const byPair = new Map();
    if (!this.#one(`SELECT 1 AS x FROM reevaluation_source_moves LIMIT 1`)) return { byPair };
    const rows = legs.filter((l) => l && l.bundle_id && l.target_id && visible(l.bundle_id) !== null);
    if (!rows.length) return { byPair };
    const caps = this.#legCaptures(rows);
    const allCaps = [...new Set([...caps.values()].flat())];
    if (!allCaps.length) return { byPair };
    const sourcesOn = new Map();
    for (const k of this.#rows(`SELECT DISTINCT capture_sha, source_id FROM source_knocks
                                 WHERE capture_sha IN (SELECT value FROM json_each(?)) ORDER BY capture_sha, source_id`,
                               JSON.stringify(allCaps))) {
      if (!sourcesOn.has(k.capture_sha)) sourcesOn.set(k.capture_sha, []);
      sourcesOn.get(k.capture_sha).push(k.source_id);
    }
    const srcs = [...new Set([...sourcesOn.values()].flat())];
    if (!srcs.length) return { byPair };
    const movesOf = new Map();
    for (const m of this.#rows(`SELECT move_id, source_id, entry_id, rung_before, rung_after, at FROM reevaluation_source_moves
                                 WHERE source_id IN (SELECT value FROM json_each(?)) ORDER BY source_id, move_id`,
                               JSON.stringify(srcs))) {
      if (!movesOf.has(m.source_id)) movesOf.set(m.source_id, []);
      movesOf.get(m.source_id).push(m);
    }
    const deps = [...new Set(rows.map((l) => l.bundle_id))];
    const written = new Map(this.#rows(`SELECT bundle_id, last_updated FROM bundles WHERE bundle_id IN (SELECT value FROM json_each(?)) LIMIT ?`,
                                       JSON.stringify(deps), deps.length).map((r) => [r.bundle_id, r.last_updated]));
    const hits = [];
    for (const l of rows)
      for (const cap of caps.get(`${l.bundle_id}\u0000${l.ord}`) || [])
        for (const src of sourcesOn.get(cap) || [])
          for (const m of movesOf.get(src) || [])
            if (laterThan(m.at, written.get(l.bundle_id))) hits.push({ l, cap, m });
    if (!hits.length) return { byPair };
    const live = this.#liveOn(hits.map((h) => h.l.target_id));
    for (const { l, cap, m } of hits) {
      if (!live.get(l.target_id).has(`${l.bundle_id}\u0000${l.ord}`)) continue;
      const pk = `${l.bundle_id}\u0000${l.target_id}`;
      if (!byPair.has(pk)) byPair.set(pk, []);
      byPair.get(pk).push({
        source: "source", since: m.at, ord: l.ord, source_id: m.source_id, entry: m.entry_id ?? null,
        rung_before: m.rung_before ?? null, rung_after: m.rung_after, capture_sha: cap,
        detail: `the source of capture ${cap.slice(0, 12)}, which this leg rests on, moved from `
          + `${m.rung_before ?? "an unstated rung"} to ${m.rung_after} at ${m.at}: what the group knows of who gave it `
          + `has changed. The leg's grade is unchanged; whether this finding still stands is the members' to decide.`,
      });
    }
    for (const list of byPair.values())
      list.sort((a, b) => (a.since < b.since ? 1 : a.since > b.since ? -1 : 0) || (a.ord - b.ord));
    return { byPair };
  }

  /* R28: the live legs resting on any capture `sourceId` stands behind, each `{bundle_id, ord, role, state, target}`, as
     the plane reads them (a listener is the plane's own; no viewer is asked). */
  #legsOnSource(sourceId) {
    return this.#legsOnCaptures(this.#rows(`SELECT DISTINCT capture_sha FROM source_knocks WHERE source_id = ?
                                              ORDER BY capture_sha`, sourceId).map((r) => r.capture_sha));
  }

  /* R28, R32: the live legs resting on any of `caps` (a passage's capture, or a capture a whole target registers), each
     `{bundle_id, ord, role, state, target}`, as the plane reads them. */
  #legsOnCaptures(caps) {
    if (!caps.length) return [];
    const legs = this.#rows(
      `SELECT ib.bundle_id AS bundle_id, ib.ord AS ord, ib.target_id AS target_id FROM inquiry_basis ib
         JOIN content c ON c.content_id = ib.content_id
        WHERE c.capture_sha IN (SELECT value FROM json_each(?))
       UNION
       SELECT ib.bundle_id, ib.ord, ib.target_id FROM inquiry_basis ib JOIN register r ON r.bundle_id = ib.target_id
        WHERE (ib.content_id IS NULL OR ib.content_id = '') AND r.capture_sha IN (SELECT value FROM json_each(?))
       ORDER BY bundle_id, ord`, JSON.stringify(caps), JSON.stringify(caps));
    const live = this.#liveOn(legs.map((l) => l.target_id));
    const out = [];
    for (const l of legs) {
      const x = live.get(l.target_id).get(`${l.bundle_id}\u0000${l.ord}`);
      if (x) out.push({ bundle_id: l.bundle_id, ord: l.ord, role: x.role ?? null, state: x.state ?? null, target: l.target_id });
    }
    return out;
  }

  /** R28, R8: the listener registered with `sources.onDisclosure` (its R10), called after each disclosure, link or
   *  consent commits with `{source, entry, rung_before, rung_after}`. A move whose rung changed is kept as one row (R18),
   *  then told to R8's listeners as `kind: "source"`; one whose rung did not change writes nothing. It carries no value
   *  (sources R13) and regrades nothing. */
  sourceMoved({ source = null, entry = null, rung_before = null, rung_after = null } = {}) {
    const id = str(source);
    if (!id || typeof rung_after !== "string" || !rung_after || rung_before === rung_after) return { ok: true, moved: false };
    const before = typeof rung_before === "string" && rung_before ? rung_before : null;
    const at = this.#when();
    this.sql.exec(`INSERT INTO reevaluation_source_moves (source_id, entry_id, rung_before, rung_after, at) VALUES (?,?,?,?,?)`,
                  id, str(entry), before, rung_after, at);
    let dependents = [];
    try { dependents = this.#legsOnSource(id); } catch { dependents = []; }
    const out = { ok: true, moved: true, at, dependents: dependents.length };
    this.#tellAfterCommit({ kind: "source", subject: id, source: "source", since: at,
      detail: `the source ${id} moved from ${before ?? "an unstated rung"} to ${rung_after}; `
        + `${dependents.length ? "what rests on its captures is named" : "nothing here rests on its captures"}`,
      rung_before: before, rung_after, dependents }, out);
    return out;
  }

  /** R29, R32: the `attribution` causes on `legs` (`inquiry_basis` rows), for a viewer's visible dependents. A live leg
   *  carries one per kept level move of the observation it names as its target, or (R32) of the attesting member of a
   *  capture of the document it targets (R28's captures: its passage's, or each its whole target registers), when the move came after the
   *  dependent's last write (`bundles.last_updated`). Answers `{byPair}` keyed `<dependent>\0<target>`, each list latest
   *  move first, then ord. Reads only; it names no author and regrades nothing. */
  #levelMoves(legs, visible) {
    const byPair = new Map();
    const anyObs = !!this.#one(`SELECT 1 AS x FROM reevaluation_level_moves LIMIT 1`);
    const anyCap = !!this.#one(`SELECT 1 AS x FROM reevaluation_capture_level_moves LIMIT 1`);
    if (!anyObs && !anyCap) return { byPair };
    const rows = legs.filter((l) => l && l.bundle_id && l.target_id && visible(l.bundle_id) !== null);
    if (!rows.length) return { byPair };
    const obs = [...new Set(rows.map((l) => l.target_id))];
    const movesOf = new Map();
    for (const m of this.#rows(`SELECT move_id, observation, level_before, level_after, case_id, edition, at
                                  FROM reevaluation_level_moves WHERE observation IN (SELECT value FROM json_each(?))
                                 ORDER BY observation, move_id`, JSON.stringify(obs))) {
      if (!movesOf.has(m.observation)) movesOf.set(m.observation, []);
      movesOf.get(m.observation).push(m);
    }
    /* R32: a capture's attesting member's moves, on the legs targeting a document whose capture it is (R28's captures). */
    const capMoves = new Map();
    const caps = anyCap ? this.#legCaptures(rows) : new Map();
    const allCaps = [...new Set([...caps.values()].flat())];
    for (const m of allCaps.length ? this.#rows(`SELECT move_id, capture_sha, level_before, level_after, case_id, edition, at
                                                   FROM reevaluation_capture_level_moves
                                                  WHERE capture_sha IN (SELECT value FROM json_each(?))
                                                  ORDER BY capture_sha, move_id`, JSON.stringify(allCaps)) : []) {
      if (!capMoves.has(m.capture_sha)) capMoves.set(m.capture_sha, []);
      capMoves.get(m.capture_sha).push(m);
    }
    const movesOn = (l) => [...(movesOf.get(l.target_id) || []),
      ...(caps.get(`${l.bundle_id}\u0000${l.ord}`) || []).flatMap((c) => capMoves.get(c) || [])];
    if (!movesOf.size && !capMoves.size) return { byPair };
    const deps = [...new Set(rows.filter((l) => movesOn(l).length).map((l) => l.bundle_id))];
    const written = new Map(this.#rows(`SELECT bundle_id, last_updated FROM bundles WHERE bundle_id IN (SELECT value FROM json_each(?)) LIMIT ?`,
                                       JSON.stringify(deps), deps.length).map((r) => [r.bundle_id, r.last_updated]));
    const hits = [];
    for (const l of rows)
      for (const m of movesOn(l))
        if (laterThan(m.at, written.get(l.bundle_id))) hits.push({ l, m });
    if (!hits.length) return { byPair };
    const live = this.#liveOn(hits.map((h) => h.l.target_id));
    for (const { l, m } of hits) {
      if (!live.get(l.target_id).has(`${l.bundle_id}\u0000${l.ord}`)) continue;
      const pk = `${l.bundle_id}\u0000${l.target_id}`;
      if (!byPair.has(pk)) byPair.set(pk, []);
      byPair.get(pk).push({
        source: "attribution", since: m.at, ord: l.ord,
        ...(m.capture_sha ? { capture_sha: m.capture_sha } : { observation: m.observation }),
        level_before: m.level_before, level_after: m.level_after, case: m.case_id ?? null, edition: m.edition ?? null,
        detail: attributionDetail(m)
          + ` This leg rests on it. The leg's grade is unchanged and the weight the new level gives is strength's to `
          + `judge; whether this finding still stands is the members' to decide.`,
      });
    }
    for (const list of byPair.values())
      list.sort((a, b) => (a.since < b.since ? 1 : a.since > b.since ? -1 : 0) || (a.ord - b.ord));
    return { byPair };
  }

  /** R29, R8: told by ratification (its R36), in its commit's transaction, when a ratified case edition states a credit
   *  level for an observation other than the one in force at the case's previous ratified edition. Keeps one row per
   *  call (R18: no author, no text), then tells R8's listeners `kind: "attribution"` once, after the act commits. A call
   *  naming no observation, a level missing on either side or the same level twice writes nothing. `at` is the move's
   *  instant (the commit's); one that does not read as an instant is replaced by now. It regrades nothing. R32: `capture`
   *  (a whole sha-256) in place of `observation`, for an off-the-record capture's attesting member; a call naming both,
   *  or a capture that is not one, writes nothing. */
  levelMoved({ observation = null, capture = null, from = null, to = null, case: caseId = null, edition = null,
                at = null } = {}) {
    const before = str(from), after = str(to);
    /* R32: `capture` in place of `observation` (one of the two, never both), a whole sha-256. */
    const cap = typeof capture === "string" && SHA256_HEX.test(capture.trim()) ? capture.trim().toLowerCase() : null;
    if (capture != null && observation != null) return { ok: true, moved: false };
    if (capture != null) {
      if (!cap || !before || !after || before === after) return { ok: true, moved: false };
      return this.#captureLevelMoved(cap, before, after, caseId, edition, at);
    }
    const id = str(observation);
    if (!id || !before || !after || before === after) return { ok: true, moved: false };
    const when = typeof at === "string" && at.trim() && Number.isFinite(Date.parse(at.trim())) ? at.trim() : this.#when();
    const ed = Number.isInteger(edition) ? edition
      : typeof edition === "string" && /^\d+$/.test(edition.trim()) ? Number(edition.trim()) : null;
    const m = { observation: id, level_before: before, level_after: after, case_id: str(caseId), edition: ed, at: when };
    this.sql.exec(`INSERT INTO reevaluation_level_moves (observation, level_before, level_after, case_id, edition, at)
                   VALUES (?,?,?,?,?,?)`, id, before, after, m.case_id, ed, when);
    let live = null;
    try { live = this.inquiry.restsOnLive(id); } catch { live = null; }
    const dependents = (live && Array.isArray(live.all) ? live.all : [])
      .map((l) => ({ bundle_id: l.bundle_id, ord: l.ord, role: l.role ?? null, state: l.state ?? null }));
    const out = { ok: true, moved: true, at: when, dependents: dependents.length };
    this.#tellAfterCommit({ kind: "attribution", subject: id, source: "attribution", since: when,
      detail: `${attributionDetail(m)} ${dependents.length ? "What rests on it is named." : "Nothing here rests on it."}`,
      level_before: before, level_after: after, case: m.case_id, edition: ed, dependents }, out);
    return out;
  }

  /* R32 (DEC-119 (3)): `levelMoved` for an off-the-record capture's attesting member, called by ratification R36. One
     row per call (the capture, both levels, the case, the edition and the instant; no member, no text), then R8's
     listeners told `kind: "attribution"`, `subject` the capture, with the live legs targeting a document whose capture
     it is. It names no member and regrades nothing. */
  #captureLevelMoved(cap, before, after, caseId, edition, at) {
    const when = typeof at === "string" && at.trim() && Number.isFinite(Date.parse(at.trim())) ? at.trim() : this.#when();
    const ed = Number.isInteger(edition) ? edition
      : typeof edition === "string" && /^\d+$/.test(edition.trim()) ? Number(edition.trim()) : null;
    const m = { capture_sha: cap, level_before: before, level_after: after, case_id: str(caseId), edition: ed, at: when };
    this.sql.exec(`INSERT INTO reevaluation_capture_level_moves (capture_sha, level_before, level_after, case_id, edition, at)
                   VALUES (?,?,?,?,?,?)`, cap, before, after, m.case_id, ed, when);
    let dependents = [];
    try { dependents = this.#legsOnCaptures([cap]).map(({ target, ...l }) => l); } catch { dependents = []; }
    const out = { ok: true, moved: true, at: when, dependents: dependents.length };
    this.#tellAfterCommit({ kind: "attribution", subject: cap, source: "attribution", since: when,
      detail: `${attributionDetail(m)} ${dependents.length ? "What rests on it is named." : "Nothing here rests on it."}`,
      level_before: before, level_after: after, case: m.case_id, edition: ed, dependents }, out);
    return out;
  }

  /* ---------------------------------------------------------------- R1–R6, R16, R17: the obligation */

  /** R1–R6: the re-evaluation obligation, derived on read. With `target`, the dependents of one moved thing (and, R17,
   *  that thing itself if its derivation weakened under a published edition); with none, every id a basis leg names. */
  reevaluations({ target = null, viewer = null } = {}) {
    const t0 = str(target);
    /* R1 (N522): an imported finding reference is a target, seen when accepted work answers it for this viewer. */
    const refs = this.#refSeer(viewer);
    if (t0 && (isRef(t0) ? !refs.seen(t0) : !this.#visible(t0, viewer)))
      return { ok: false, reason: "NO_SUCH_BUNDLE", target: t0, ...refs.flags() };
    /* Bounded by the number of DISTINCT basis targets rather than by the corpus: the same index read the other way, and
       each costs one row read before it is dismissed as unmoved. */
    const targets = t0 ? [t0]
      : this.#rows(`SELECT DISTINCT target_id FROM inquiry_basis ORDER BY target_id`).map((r) => r.target_id);
    const dependents = t0 ? [t0]
      : this.#rows(`SELECT DISTINCT bundle_id FROM inquiry_basis ORDER BY bundle_id`).map((r) => r.bundle_id);
    const visible = this.#redactor(viewer);
    const reg = this.#registry([...targets, ...dependents]);
    const wp = this.#workProducts();
    const dk = this.#docket();
    const aw = this.#accepted();
    const obligations = [], closedOnly = [];
    /* Each obligation found is held with its causes, and the recorded re-evaluations of exactly those pairs are read
       once after the walk (R16), so that read is bounded by the answer. */
    const found = [];
    /* R20: whether this answer withheld a dependent or a superseder; stated only of one target. */
    let withheld = false;
    const place = (o, causes) => found.push({ o, causes });
    /* R27, R28, R29: the corrected, source and attribution causes, over the legs resting on these targets, read once for the answer. */
    const onTargets = this.#rows(`SELECT bundle_id, ord, target_id, content_id FROM inquiry_basis
                   WHERE target_id IN (SELECT value FROM json_each(?)) ORDER BY bundle_id, ord`, JSON.stringify(targets));
    /* R27–R30 are read for every dependent: the walk below withholds one the viewer may not see, and so knows that it did
       (R20's `out_of_view` on one target), where a dependent filtered out here would leave its target unwalked. */
    const all = (id) => id ?? null;
    const corr = this.#corrected(onTargets, viewer, all);
    const srcm = this.#sourceMoves(onTargets, all);
    const lvlm = this.#levelMoves(onTargets, all);
    /* R30 (a): the withdrawal causes, over the same legs. */
    const wdr = this.#withdrawn(onTargets, all, dk);
    /* R31: the acceptance causes, over the same legs. */
    const acc = this.#acceptanceOn(onTargets, all, aw, viewer);
    const correctedOn = new Set([...corr.byPair.keys(), ...srcm.byPair.keys(), ...lvlm.byPair.keys(), ...wdr.byPair.keys(),
                                 ...acc.byPair.keys()].map((k) => k.slice(k.indexOf("\u0000") + 1)));
    for (const t of targets) {
      const moved = this.#moved(t, visible, reg, wp, dk);
      if (!moved && !correctedOn.has(t)) continue;
      /* R20: in the listing, an obligation whose target the viewer may not see is withheld whole, as strength R6
         withholds an unseen leg's member. A target the record no longer holds is no one's to see: its deletion cause
         is a fact about the leg naming it, and stands (§5.4). */
      if (!t0 && !(moved && moved.held === false) && (isRef(t) ? !refs.seen(t) : visible(t) === null)) continue;
      if (moved && moved.withheld) withheld = true;
      /* A target whose only causes are R27's, R28's, R29's or R30's is read for its own state and type here, as `#moved` reads one. */
      const own = moved ? { state: moved.state, object_type: moved.object_type }
        : this.#one(`SELECT current_state AS state, object_type FROM bundles WHERE bundle_id=?`, t)
          || { state: null, object_type: null };
      const rest = this.inquiry.restingOn(t);
      const legs = rest && rest.ok !== false && Array.isArray(rest.dependents) ? rest.dependents : [];
      const byBundle = new Map();
      for (const l of legs) {
        /* The row IS about this dependent, so an invisible one is withheld whole and no count of the withheld is
           reported, because that count is the leak (R3). */
        if (visible(l.bundle_id) === null) { withheld = true; continue; }
        if (!byBundle.has(l.bundle_id)) byBundle.set(l.bundle_id, []);
        byBundle.get(l.bundle_id).push(l);
      }
      for (const [bundleId, mine] of byBundle) {
        const dep = this.#one(`SELECT title, object_type, current_state FROM bundles WHERE bundle_id=?`, bundleId);
        /* The leg's OWN cited edition comes from the dependent's document: `target_edition` is authored on the leg
           (DEC-12) and inquiry_basis does not project it. */
        const fm = this.#frontmatterOf(bundleId);
        const fmBasis = this.#basisFrontmatter(fm);
        /* REC-160 / DEC-70: SEVERANCE DISCHARGES SUPPORT, NEVER CONNECTION. A withdrawn leg still RECEIVES the
           obligation, and the read marks it (connections' one severance predicate, through inquiry's `restingOn`). */
        const legStatus = mine.some((l) => l.status === "severed") ? "severed" : "confirmed";
        const causes = moved ? [...moved.causes] : [];
        if (moved && moved.edition) {
          for (const l of mine) {
            const cited = fmBasis[l.ord] && fmBasis[l.ord].target_edition != null
              ? Number(fmBasis[l.ord].target_edition) : null;
            if (cited === null || cited < moved.edition.latest)
              causes.push({ source: "edition", since: moved.edition.since, ord: l.ord,
                            cited_edition: cited, latest_edition: moved.edition.latest,
                            latest_ratified_edition: moved.edition.latest_ratified,
                            detail: legStatus === "severed"
                              ? (cited === null
                                ? `this leg was WITHDRAWN (severed) and named no edition of ${t}, which `
                                  + `now stands at edition ${moved.edition.latest}.`
                                : `this leg was WITHDRAWN (severed) and named edition ${cited} of ${t}, `
                                  + `which now stands at edition ${moved.edition.latest}.`)
                                + ` A withdrawn leg supports nothing here: it adds nothing to strength, `
                                + `gates nothing and counts toward no bar. It is listed because the `
                                + `connection still informs a second look (DEC-70).`
                              : cited === null
                              ? `this leg names no edition of ${t}, which now stands at edition `
                                + `${moved.edition.latest}. A leg keeps citing the edition it names `
                                + `(DEC-12) and this one names none, so which edition it rests on cannot `
                                + `be read off the record.`
                              : `this leg rests on edition ${cited} of ${t}, which now stands at edition `
                                + `${moved.edition.latest}. Edition ${cited} keeps answering with its own `
                                + `signature and its own frozen strength; nothing here follows the case `
                                + `forward on your behalf (DEC-12).` });
          }
        }
        causes.push(...(corr.byPair.get(`${bundleId}\u0000${t}`) || []), ...(srcm.byPair.get(`${bundleId}\u0000${t}`) || []),
                    ...(lvlm.byPair.get(`${bundleId}\u0000${t}`) || []), ...(wdr.byPair.get(`${bundleId}\u0000${t}`) || []),
                    ...(acc.byPair.get(`${bundleId}\u0000${t}`) || []));
        if (!causes.length) continue;
        place({
          bundle_id: bundleId, title: dep?.title ?? null,
          object_type: dep?.object_type ?? null, current_state: dep?.current_state ?? null,
          target: t, target_state: own.state,
          /* The RAW rows travel here and the PUBLISHED leg shape is composed once, in `#legsEarned`, after the whole
             answer is built, so the registry is asked ONCE for the page. */
          legs: mine.map((l) => ({ ...l, target_id: t, target_type: own.object_type,
                                   target_edition: fmBasis[l.ord]?.target_edition ?? null, status: legStatus })),
          stored: this.#storedTriple(fm),
          strength: this.#strengthOf(bundleId),
          ...(moved && moved.superseded_by ? { superseded_by: moved.superseded_by } : {}),
          /* R20: its `superseded_by` withheld a superseder (stated on the obligation, in a listing too). */
          ...(moved && moved.withheld ? { out_of_view: true } : {}),
        }, causes);
      }
    }
    /* R17: each visible dependent at a published edition whose derivation weakened; R30 (b): each visible member finding
       of a contested edition. Both are the finding's own target, one obligation for both. */
    const contestedIds = t0 ? (dk.get().contested.has(t0) ? [t0] : []) : [...dk.get().contested.keys()];
    for (const d of [...new Set([...dependents, ...contestedIds])].sort()) {
      if (visible(d) === null) continue;
      const own = [];
      const w = this.#weakened(d, reg);
      if (w) own.push(w);
      own.push(...this.#contestedOn(d, dk));
      if (!own.length) continue;
      const dep = this.#one(`SELECT title, object_type, current_state FROM bundles WHERE bundle_id=?`, d);
      if (!dep) continue;
      place({ bundle_id: d, title: dep.title ?? null, object_type: dep.object_type ?? null,
              current_state: dep.current_state ?? null, target: d, target_state: dep.current_state ?? null,
              legs: [], stored: this.#storedTriple(this.#frontmatterOf(d)), strength: this.#strengthOf(d) }, own);
    }
    const records = this.#records(found.map(({ o }) => [o.bundle_id, o.target]));
    for (const { o, causes } of found) {
      const { open, closed } = this.#split(o.bundle_id, o.target, causes, records);
      if (open.length) obligations.push({ ...o, reeval: { flag: true, since: open[0].since, source: open[0].source },
                                          causes: open, closed });
      else if (closed.length) closedOnly.push({ bundle_id: o.bundle_id, target: o.target, causes: closed });
    }
    const order = (a, b) => (a.bundle_id < b.bundle_id ? -1 : a.bundle_id > b.bundle_id ? 1
                            : a.target < b.target ? -1 : a.target > b.target ? 1 : 0);
    obligations.sort(order);
    closedOnly.sort(order);
    this.#legsEarned(obligations);
    return { ok: true, ...(t0 ? { target: t0 } : {}), obligations, count: obligations.length,
             ...(t0 && withheld ? { out_of_view: true } : {}),
             closed: closedOnly, closed_count: closedOnly.length,
             editions_read: reg !== null,
             ...(reg === null ? { editions_why: "no module provides the published registry, so no edition was read "
                                  + "and no edition cause could be derived; that is not the same as none" } : {}),
             corrections_read: corr.read,
             ...(corr.read ? {} : { corrections_why: CORRECTIONS_UNREAD }), ...wp.flags(), ...dk.flags(),
             ...refs.flags(), ...aw.flags() };
  }

  /** R5 (REC-118 / D-410): an obligation's leg letters, resolved against what the record can earn, so the two halves of
   *  one answer stop disagreeing. It publishes what the record can SUPPORT, never erases what a member AUTHORED, and
   *  says why they differ; the rule is inquiry's `legCapped`, never a second policy. Capture axis only, a leg actually
   *  carrying a letter, a target that is not an inquiry. ONE registry call for the whole answer. Both derived fields
   *  are always present. It mutates `obligations` in place. */
  #legsEarned(obligations) {
    if (!obligations.length) return;
    const bounded = (l) => !!l && l.grade_axis === "capture" && l.grade != null
      && typeof l.target_id === "string" && !!l.target_id && normalizeType(l.target_type) !== "inquiry";
    const targets = new Set();
    for (const o of obligations) for (const l of o.legs) if (bounded(l)) targets.add(l.target_id);
    let cap = {};
    if (targets.size) {
      try { cap = this.inquiry.earned(null, [...targets])?.earned?.capture || {}; } catch { cap = {}; }
    }
    for (const o of obligations) {
      o.legs = o.legs.map((l) => {
        const res = bounded(l) ? legCapped(l.grade, cap[l.target_id], l.target_id) : null;
        return { ord: l.ord, role: l.role || null,
                 grade: res ? res.grade : (l.grade ?? null),
                 grade_axis: l.grade_axis ?? null,
                 grade_source: l.grade_source ?? null,
                 target_edition: l.target_edition ?? null,
                 status: l.status === "severed" ? "severed" : "confirmed",
                 grade_authored: l.grade ?? null,
                 grade_why: res ? res.why : null };
      });
    }
  }

  /* ---------------------------------------------------------------- R7, R8: raise and the listeners */

  /** R8: a later module's listener, registered once at start, told of every R7 raise and every R14 notice raised,
   *  after the act commits. A second registration by one module is `LISTENER_DECLARED`. */
  onBasisChanged(module, fn) {
    /* Both refusals are minted at membership's one site (its R81; K231). */
    const refused = listenerRefusal(this.#listeners, module, fn);
    if (refused) return refused;
    this.#listeners.push({ module, fn });
    return { ok: true, module };
  }

  /** R26 (N210): the one registration of a case edition's cited parts (publication R41): `parts({case, edition?})`
   *  answers `{case, edition, project, parts: [{bundle_id, capture_sha}]}` (K365), and `cases({after, limit})` the cases with a
   *  ratified edition, `{cases, cursor}`, which the sweep's case half pages through (a case is no bundle, so only its
   *  holder can list them). Both refusals are membership's (its R81): a registration missing either function is
   *  malformed; a second, by any module, is declared. */
  registerCaseParts(module, fns) {
    const ok = !!fns && typeof fns === "object" && typeof fns.parts === "function" && typeof fns.cases === "function";
    const refused = listenerRefusal(this.#caseParts, module, ok ? fns.parts : null);
    if (refused) return refused;
    this.#caseParts = { module, parts: fns.parts, cases: fns.cases };
    return { ok: true, module };
  }

  /** R30 (DEC-116 items 3, 7): the one registration of a case's docket (`docket` R13): `withdrawals({after, limit})`
   *  answers `{withdrawals, cursor}` and `contested({after, limit})` answers `{contested, cursor}`, in the shapes
   *  `#docket` reads. Both refusals are membership's (its R81), as R26's: a registration missing either function is
   *  malformed; a second, by any module, is declared. */
  registerDocket(module, fns) {
    const ok = !!fns && typeof fns === "object" && typeof fns.withdrawals === "function"
      && typeof fns.contested === "function";
    const refused = listenerRefusal(this.#docketReg, module, ok ? fns.withdrawals : null);
    if (refused) return refused;
    this.#docketReg = { module, withdrawals: fns.withdrawals, contested: fns.contested };
    return { ok: true, module };
  }

  /* R8: every listener once, in registration order; one that throws or rejects changes nothing, and is named. */
  #tell(event) {
    const failed = [];
    for (const l of this.#listeners) {
      try {
        const r = l.fn(event);
        if (r && typeof r.then === "function") r.then(null, () => {});
      } catch { failed.push(l.module); }
    }
    return failed;
  }

  /* R8 (N406, K598): the listeners are told once what raised the event has committed, through record-core's
     `afterCommit` (its R66): at once outside any transaction; inside one, just after the outermost commits and before
     it returns; never when it, or the savepoint holding this call, rolls back. A listener that failed is named on
     `out`, the answer already handed back, as `listeners_failed` (absent while none has). */
  #tellAfterCommit(event, out) {
    this.record.afterCommit(() => {
      const failed = this.#tell(event);
      if (!failed.length) return;
      const named = out.listeners_failed || (out.listeners_failed = []);
      for (const m of failed) if (!named.includes(m)) named.push(m);
    });
  }

  /** R7: the live legs resting on `target` (`inquiry.restsOnLive`), each `{bundle_id, ord, role, state}`, a dependent
   *  the viewer may not see withheld and not counted, no titles, answered at once. Called by the acts that move a
   *  target; the act puts the answer in its reply as `reevaluation`, whole. R8's listeners are told after the act
   *  commits, and any that failed are written onto this answer then (N406). */
  raise({ target = null, source = null, since = null, edition = null, viewer = null } = {}) {
    const t = str(target);
    const visible = this.#redactor(viewer);
    let live = null;
    try { live = t ? this.inquiry.restsOnLive(t) : null; } catch { live = null; }
    const all = live && Array.isArray(live.all) ? live.all : [];
    const raised = all.filter((l) => visible(l.bundle_id) !== null)
      .map((l) => ({ bundle_id: l.bundle_id, ord: l.ord, role: l.role ?? null, state: l.state ?? null }));
    /* R20: `out_of_view` states only that a dependent was withheld; the listener's detail is the plane's own. */
    const out = { source, since, ...(edition != null ? { edition } : {}), raised,
                  ...(raised.length < all.length ? { out_of_view: true } : {}) };
    if (t) this.#tellAfterCommit({ kind: "finding", subject: t, source, since, ...(edition != null ? { edition } : {}),
                                   detail: `${t} moved (${source}); ${raised.length ? "what rests on it is named" : "nothing visible here rests on it"}`,
                                   dependents: raised }, out);
    return out;
  }

  /* ---------------------------------------------------------------- R9: the recovery read */

  /** R9: now, the causes standing on each named finding (R2's arms and §5.4's, the finding as target, R17's, and R27's
   *  `corrected`, R28's `source`, R29's `attribution`, R30's and R31's `acceptance` causes the finding carries on its
   *  own legs, each naming its target, less those a recorded re-evaluation closed) and each named passage's `affects` (`content.passageNotice`). Ids the viewer may not see
   *  answer as absent. Writes nothing. */
  changesOf({ findings = null, contents = null, viewer = null } = {}) {
    const F = asList(findings), C = asList(contents);
    const fl = F.slice(0, CHANGES_OF_MAX), cl = C.slice(0, CHANGES_OF_MAX);
    const visible = this.#redactor(viewer);
    const seen = fl.filter((id) => this.#visible(id, viewer));
    const reg = this.#registry(seen);
    const wp = this.#workProducts();
    const dk = this.#docket();
    const aw = this.#accepted();
    const corr = this.#standingCorrected(seen, viewer, visible, { withSource: true, dk, aw });
    const outF = fl.map((id) => {
      if (!seen.includes(id)) return { id, absent: true };
      const moved = this.#moved(id, visible, reg, wp, dk);
      const causes = moved ? [...moved.causes] : [];
      if (moved && moved.edition)
        causes.push({ source: "edition", since: moved.edition.since, latest_edition: moved.edition.latest,
                      latest_ratified_edition: moved.edition.latest_ratified,
                      detail: `${id} now stands at edition ${moved.edition.latest}; a leg naming an earlier edition, or `
                            + `none, rests on an edition that is no longer its latest.` });
      const w = this.#weakened(id, reg);
      if (w) causes.push(w);
      causes.push(...(corr.byDependent.get(id) || []));
      const state = this.#one(`SELECT current_state FROM bundles WHERE bundle_id=?`, id);
      return { id, state: state ? state.current_state : null, causes,
               ...(moved && moved.superseded_by ? { superseded_by: moved.superseded_by } : {}),
               ...(moved && moved.withheld ? { out_of_view: true } : {}) };
    });
    const outC = cl.map((cid) => {
      let n = null;
      try { n = this.content.passageNotice({ contentId: cid, viewer }); } catch { n = null; }
      if (!n || !n.ok) return { id: cid, absent: true };
      return { id: cid, state: n.state, newer: n.newer, affects: n.affects,
               candidates: (n.candidates || []).map((c) => ({ capture_sha: c.capture_sha, grade: c.grade,
                                                                affects: c.affects })) };
    });
    return { ok: true, findings: outF, contents: outC,
             findings_truncated: F.length > fl.length, contents_truncated: C.length > cl.length,
             limit: CHANGES_OF_MAX, wrote: false,
             ...(reg === null ? { editions_read: false } : { editions_read: true }),
             corrections_read: corr.read, ...(corr.read ? {} : { corrections_why: CORRECTIONS_UNREAD }), ...wp.flags(),
             ...dk.flags(), ...aw.flags() };
  }

  /* R9, R27 (and R28, R29, R30, R31 `withSource`): the corrected (and source, attribution, withdrawal, contested and
     acceptance) causes the
     named dependents carry on their own legs, each with its `target`, less those a recorded re-evaluation closed (R16).
     `byDependent` keyed by dependent, in (target, ord, candidate) order, each target's source causes after its corrected
     ones, its attribution causes after those, then its withdrawal causes and its acceptance causes last; a contested
     cause names the finding itself
     as its target. */
  #standingCorrected(dependents, viewer, visible, { withSource = false, dk = null, aw = null } = {}) {
    const byDependent = new Map();
    if (!dependents.length) return { byDependent, read: true };
    const legs = this.#rows(`SELECT bundle_id, ord, target_id, content_id FROM inquiry_basis
                   WHERE bundle_id IN (SELECT value FROM json_each(?)) ORDER BY bundle_id, target_id, ord`,
                 JSON.stringify(dependents));
    const corr = this.#corrected(legs, viewer, visible);
    if (withSource) {
      const moved = [this.#sourceMoves(legs, visible), this.#levelMoves(legs, visible),
                     ...(dk ? [this.#withdrawn(legs, visible, dk)] : []),
                     ...(aw ? [this.#acceptanceOn(legs, visible, aw, viewer)] : [])];
      for (const moves of moved)
        for (const [k, list] of moves.byPair) corr.byPair.set(k, [...(corr.byPair.get(k) || []), ...list]);
      for (const d of dk ? dependents : []) {
        const own = this.#contestedOn(d, dk);
        if (own.length) corr.byPair.set(`${d}\u0000${d}`, [...(corr.byPair.get(`${d}\u0000${d}`) || []), ...own]);
      }
    }
    const pairs = [...corr.byPair.keys()].sort().map((k) => k.split("\u0000"));
    const records = this.#records(pairs);
    for (const [d, t] of pairs) {
      const { open } = this.#split(d, t, corr.byPair.get(`${d}\u0000${t}`), records);
      if (!open.length) continue;
      if (!byDependent.has(d)) byDependent.set(d, []);
      byDependent.get(d).push(...open.map((c) => ({ ...c, target: t })));
    }
    return { byDependent, read: corr.read };
  }

  /* ---------------------------------------------------------------- R27: the corrected side, listed */

  /** R27: each (dependent, candidate) a standing `corrected` cause names, in dependent then candidate order after
   *  `after` (`<dependent>#<candidate>`), at most `limit` (1–200, default 200), with `truncated` and `cursor` (the last
   *  entry's key when more follow). A cause a recorded re-evaluation closed is not listed (R16). A dependent the viewer
   *  may not see is withheld and not counted (R20). For `queue`'s `side-corrected` item (its R44). Writes nothing. */
  correctedDependents({ after = null, limit = null, viewer = null } = {}) {
    const cap = clamp(limit, CORRECTED_LIMIT_DEFAULT, CORRECTED_LIMIT_MAX);
    const aft = String(after ?? "");
    const cut = aft.lastIndexOf("#");
    const [aDep, aCand] = cut >= 0 ? [aft.slice(0, cut), aft.slice(cut + 1)] : [aft, ""];
    const visible = this.#redactor(viewer);
    /* Dependents are read a page at a time, in id order, until one entry past the limit is found or none are left, so
       the read is bounded by the answer rather than by the corpus. */
    const entries = [];
    let read = true, from = aDep, first = true;
    while (entries.length <= cap) {
      const deps = this.#rows(`SELECT DISTINCT bundle_id FROM inquiry_basis WHERE bundle_id ${first ? ">=" : ">"} ?
                                ORDER BY bundle_id LIMIT ?`, from, CORRECTED_LIMIT_MAX).map((r) => r.bundle_id);
      if (!deps.length) break;
      first = false;
      from = deps[deps.length - 1];
      const corr = this.#standingCorrected(deps, viewer, visible);
      if (!corr.read) read = false;
      for (const d of [...corr.byDependent.keys()].sort()) {
        const byCand = new Map();
        for (const c of corr.byDependent.get(d)) {
          if (!byCand.has(c.candidate)) byCand.set(c.candidate, []);
          byCand.get(c.candidate).push(c);
        }
        for (const cand of [...byCand.keys()].sort()) {
          if (d < aDep || (d === aDep && cand <= aCand)) continue;
          const cs = byCand.get(cand), m = cs[0];
          entries.push({ dependent: d, candidate: cand, kind: m.kind, reason: m.reason, member: m.member, since: m.since,
                         ...(m.inquiry ? { inquiry: m.inquiry } : {}), ...(m.act ? { act: m.act } : {}),
                         ...(m.since_why ? { since_why: m.since_why } : {}),
                         legs: cs.map((c) => ({ target: c.target, ord: c.ord, side: c.side })),
                         detail: m.detail });
        }
      }
      if (deps.length < CORRECTED_LIMIT_MAX) break;
    }
    const listed = entries.slice(0, cap);
    const truncated = entries.length > cap;
    return { ok: true, entries: listed, count: listed.length, limit: cap, truncated,
             cursor: truncated ? `${listed[listed.length - 1].dependent}#${listed[listed.length - 1].candidate}` : null,
             wrote: false, corrections_read: read, ...(read ? {} : { corrections_why: CORRECTIONS_UNREAD }),
             says: "each finding listed rests on a side a member's resolution named wrong; that side still resolves and "
                 + "says it was corrected, nothing resting on it was moved, and a recorded re-evaluation closes the cause" };
  }

  /* ---------------------------------------------------------------- R30: a case edition withdrawn or contested */

  /** R30: each (dependent, entry) a standing `withdrawal` or `contested` cause names, in dependent then entry order after
   *  `after` (`<dependent>#<entry>`, split at the first `#`, which no bundle id holds), at most `limit` (1–200, default
   *  200), with `truncated` and `cursor` (the last entry's key when more follow). A cause a recorded re-evaluation closed
   *  is not listed (R16). A dependent the viewer may not see is withheld and not counted (R20). Writes nothing. */
  docketDependents({ after = null, limit = null, viewer = null } = {}) {
    const cap = clamp(limit, DOCKET_LIMIT_DEFAULT, DOCKET_LIMIT_MAX);
    const aft = String(after ?? "");
    const cut = aft.indexOf("#");
    const [aDep, aEntry] = cut >= 0 ? [aft.slice(0, cut), aft.slice(cut + 1)] : [aft, ""];
    const visible = this.#redactor(viewer);
    const dk = this.#docket();
    const d = dk.get();
    const pinned = [...d.pinned.keys()];
    const legs = pinned.length
      ? this.#rows(`SELECT bundle_id, ord, target_id FROM inquiry_basis WHERE target_id IN (SELECT value FROM json_each(?))
                     ORDER BY bundle_id, ord`, JSON.stringify(pinned)) : [];
    const byPair = new Map(this.#withdrawn(legs, visible, dk).byPair);
    for (const f of d.contested.keys())
      if (visible(f) !== null && this.#one(`SELECT 1 AS x FROM bundles WHERE bundle_id=?`, f))
        byPair.set(`${f}\u0000${f}`, [...(byPair.get(`${f}\u0000${f}`) || []), ...this.#contestedOn(f, dk)]);
    const pairs = [...byPair.keys()].map((k) => k.split("\u0000"));
    const records = this.#records(pairs);
    const byKey = new Map();
    for (const [dep, t] of pairs) {
      for (const c of this.#split(dep, t, byPair.get(`${dep}\u0000${t}`), records).open) {
        const k = `${dep}\u0000${c.entry}`;
        if (!byKey.has(k)) byKey.set(k, { dependent: dep, entry: c.entry, kind: c.source, case: c.case, since: c.since,
          ...(c.source === "withdrawal" ? { withdrawn_editions: c.withdrawn_editions } : { edition: c.edition }),
          legs: [], detail: c.detail });
        if (c.source === "withdrawal") byKey.get(k).legs.push({ target: t, ord: c.ord, edition: c.edition, sha: c.sha });
      }
    }
    const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
    const entries = [...byKey.values()]
      .filter((e) => e.dependent > aDep || (e.dependent === aDep && e.entry > aEntry))
      .sort((a, b) => cmp(a.dependent, b.dependent) || cmp(a.entry, b.entry));
    for (const e of entries) e.legs.sort((a, b) => cmp(a.target, b.target) || (a.ord - b.ord));
    const listed = entries.slice(0, cap);
    const truncated = entries.length > cap;
    return { ok: true, entries: listed, count: listed.length, limit: cap, truncated,
             cursor: truncated ? `${listed[listed.length - 1].dependent}#${listed[listed.length - 1].entry}` : null,
             wrote: false, ...dk.flags(),
             says: "each finding listed rests on a member finding of a case edition withdrawn on its docket, or is a member "
                 + "finding of an edition a filed response contests; nothing was moved or regraded, no docket entry is "
                 + "evidence, and a recorded re-evaluation closes the cause" };
  }

  /** R30, R8: told by `docket` after its withdrawal or contesting act commits (its R13). Tells R8's listeners once, as
   *  `kind: "withdrawal"` or `kind: "contested"`, `subject` the entry, with the dependents R30's arm answers for that
   *  entry now, as the plane reads them (no viewer: a listener is the plane's own, R28's precedent): for a withdrawal the
   *  live legs resting on its pinned findings, each `{bundle_id, ord, role, state, target}`; for a contesting entry its
   *  member findings, each `{bundle_id}`. Writes nothing and never throws; a kind it does not know tells nothing. */
  docketActed({ kind = null, case: caseId = null, entry = null } = {}) {
    try {
      const e = str(entry), c = str(caseId);
      if (!DOCKET_KINDS.includes(kind) || !e)
        return { ok: true, told: false, why: "only a withdrawal or a contesting entry, named, is told" };
      const dk = this.#docket();
      const rec = dk.get().entries.get(`${kind}\u0000${e}`);
      const found = !!rec && (!c || rec.case === c);
      let dependents = [];
      if (found && kind === "withdrawal") {
        const pinned = [...new Set(rec.findings.map((f) => f.bundle_id))];
        const legs = pinned.length
          ? this.#rows(`SELECT bundle_id, ord, target_id FROM inquiry_basis WHERE target_id IN (SELECT value FROM json_each(?))
                         ORDER BY bundle_id, ord`, JSON.stringify(pinned)) : [];
        /* the pair's key holds the dependent */
        dependents = [...this.#withdrawn(legs, (id) => id ?? null, dk, e).byPair.entries()]
          .flatMap(([k, list]) => list.map((x) => ({ bundle_id: k.split("\u0000")[0], ord: x.ord, role: x.role,
                                                     state: x.state, target: x.finding })));
      } else if (found)
        dependents = [...new Set(rec.findings.map((f) => f.bundle_id))].sort().map((bundle_id) => ({ bundle_id }));
      const since = found && rec.at ? rec.at : this.#when();
      const out = { ok: true, told: true, kind, case: c ?? rec?.case ?? null, entry: e, dependents: dependents.length,
                    ...(found ? {} : { entry_read: false }), ...dk.flags() };
      this.#tellAfterCommit({ kind, subject: e, source: kind, since, case: out.case,
        ...(kind === "withdrawal" ? { withdrawn_editions: found ? rec.editions : [] } : { edition: found ? rec.edition : null }),
        detail: `${kind === "withdrawal" ? "a case edition was withdrawn" : "a filed response contests a case edition"} `
          + `on the docket of case ${out.case ?? "(unnamed)"} (entry ${e}); `
          + `${dependents.length ? "what rests on it is named" : "nothing here rests on it"}`,
        dependents }, out);
      return out;
    } catch { return { ok: true, told: false, why: "the docket could not be read" }; }
  }

  /* ---------------------------------------------------------------- R31: an acceptance withdrawn */

  /** R31, R8 (DEC-96 item 1): told by `case-import` after its withdrawal of an acceptance commits (its R7). Tells R8's
   *  listeners once, as `kind: "acceptance"`, `subject` the withdrawal, with the dependents R31's arm answers for that
   *  withdrawal now, as the plane reads them (no viewer: a listener is the plane's own, R28's precedent; N531), each
   *  `{bundle_id, ord, role, state, target, group, case, detail}`, the detail naming the source group and case.
   *  `withdrawal` is its id (or an object carrying one). Writes nothing and never throws; a withdrawal accepted work does
   *  not answer is still told, with no dependents, and says so. */
  acceptanceWithdrawn({ withdrawal = null } = {}) {
    try {
      const id = str(withdrawal && typeof withdrawal === "object" ? withdrawal.withdrawal : withdrawal);
      if (!id) return { ok: true, told: false, why: "only a named withdrawal is told" };
      const aw = this.#accepted();
      const rec = aw.get().entries.get(id) || null;
      let dependents = [];
      if (rec && rec.refs.length) {
        const legs = this.#rows(`SELECT bundle_id, ord, target_id FROM inquiry_basis WHERE target_id IN (SELECT value FROM json_each(?))
                                  ORDER BY bundle_id, ord`, JSON.stringify(rec.refs));
        dependents = [...this.#acceptanceOn(legs, (x) => x ?? null, aw, null, id, { plane: true }).byPair.entries()]
          .flatMap(([k, list]) => list.map((x) => ({ bundle_id: k.split("\u0000")[0], ord: x.ord, role: x.role,
                                                     state: x.state, target: x.ref, group: x.group, case: x.case,
                                                     detail: x.detail })));
      }
      const since = rec && rec.at ? rec.at : this.#when();
      const out = { ok: true, told: true, kind: "acceptance", withdrawal: id, dependents: dependents.length,
                    ...(rec ? {} : { withdrawal_read: false }), ...aw.flags() };
      this.#tellAfterCommit({ kind: "acceptance", subject: id, source: "acceptance", since,
        import: rec ? rec.import : null, edition: rec ? rec.edition : null, refs: rec ? rec.refs : [],
        detail: `this group's acceptance of another group's work was withdrawn (${id}`
          + `${rec ? `, edition ${rec.edition}` : ""}); ${dependents.length ? "what rests on it is named" : "nothing here rests on it"}`,
        dependents }, out);
      return out;
    } catch { return { ok: true, told: false, why: "accepted work could not be read" }; }
  }

  /* ---------------------------------------------------------------- R10, R11: the cross-version notice (D-394) */

  /** R10–R11: one question (`target=`: every leg of it, those resting on a passage carrying content's notice) or one
   *  passage (`content=`). A READ that writes nothing. `limit` bounds the legs answered for a question, clamped to
   *  1–200, and the applied figure is what is published, with `truncated`. */
  versionNotice({ target = null, content = null, limit = null, viewer = null } = {}) {
    const refusal = (code, detail, extra) => {
      const row = VERSION_NOTICE_SUBJECT_CHECKS[code];
      return { ok: false, reason: code, code, check: row.check, translation: row.translation,
               detail, ...(extra || {}) };
    };
    const tgt = String(target ?? "").trim();
    const cid = String(content ?? "").trim();
    let legs = [], rows = [], truncated = false, inquiry = null;
    /* DEC-49 REGION is-version-notice-subject */
    if ((tgt && cid) || (!tgt && !cid))
      return refusal("VERSION_NOTICE_NO_SUBJECT",
        tgt ? "pass target=<INQ-…> OR content=<content id>, not both: a notice is about one subject."
            : "pass target=<INQ-…> (every passage a question rests on) or content=<content id> (one passage).");
    if (tgt) {
      const b = this.#one(`SELECT bundle_id, object_type FROM bundles WHERE bundle_id=?`, tgt);
      if (!b || normalizeType(b.object_type) !== "inquiry" || !this.#visible(b.bundle_id, viewer))
        return refusal("VERSION_NOTICE_NO_INQUIRY",
          `no question by the id '${tgt.slice(0, 60)}' is readable here. A question you may not see `
          + `answers exactly as one that does not exist.`, { target: tgt });
      inquiry = b.bundle_id;
    } else {
      const passage = this.content.passageNotice({ contentId: cid, viewer });
      if (!passage.ok) return passage;
      const { ok, states, grades, wrote, proposal_only, visible_to, ...notice } = passage;
      rows = [notice];
    }
    /* END DEC-49 REGION is-version-notice-subject */
    const max = clamp(limit, VERSION_NOTICE_LEGS_MAX, VERSION_NOTICE_LEGS_MAX);
    if (inquiry) {
      const page = this.#rows(
        `SELECT b.ord AS ord, b.target_id AS target, b.content_id AS content_id
           FROM inquiry_basis b WHERE b.bundle_id=? ORDER BY b.ord LIMIT ?`, inquiry, max + 1);
      truncated = page.length > max;
      legs = page.slice(0, max);
      const ids = [...new Set(legs.map((l) => l.content_id).filter(Boolean))];
      /* `LIMIT ?` at the id count: the set is already bounded by the leg cap above, and saying so in the SQL is what
         lets a bounds census see it. */
      rows = ids.length
        ? this.#rows(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as FROM content
                       WHERE content_id IN (SELECT value FROM json_each(?)) LIMIT ?`, JSON.stringify(ids), ids.length)
        : [];
    }
    const memo = new Map();
    const byId = new Map(rows.map((r) => [r.content_id, inquiry ? this.content.noticeForRow(r, viewer, memo) : r]));
    const notices = inquiry
      ? legs.map((l) => l.content_id && byId.has(l.content_id)
          ? { ord: l.ord, target: l.target, ...byId.get(l.content_id) }
          : { ord: l.ord, target: l.target, content_id: null, state: "not_asked", newer: null,
              says: null, affects: null,
              why: "this leg rests on no cited passage (it cites another question, or a document this record "
                 + "holds no bytes of), so there is no capture whose newer versions could be asked about" })
      : [...byId.values()];
    return {
      ok: true, target: inquiry, content: inquiry ? null : cid,
      notices, count: notices.length, limit: inquiry ? max : 1, truncated,
      states: VERSION_NOTICE_STATES, grades: VERSION_NOTICE_GRADES,
      wrote: false, proposal_only: true,
      visible_to: "the version chains here are the ones visible to you; a version filed in a project you "
        + "were not invited to is not in them",
      says: "a notice, computed now and stored nowhere. A newer version is stated with certainty where the "
        + "version chain was read; a passage at the same extent in it is a CANDIDATE, never the same passage; "
        + "nothing was moved, minted or written, and only a member's act can re-point a citation.",
    };
  }

  /* ---------------------------------------------------------------- R12, R13: the "changed from" audit (D-256) */

  /** R12–R13: every "changed from" sentence already written, checked against the version chain, and not one byte of any
   *  body rewritten (BOB #31, 2026-09-23 22:22Z: the bodies stay as written and the correction is the READ). The
   *  bundle's own version is found from the record (its `register` rows joined to `captured_locators`), never from its
   *  prose; the frontmatter's `content_hash` only breaks a tie. It reads the LIVE bundle.md of every bundle and matches
   *  the literal the writer emitted, so a sentence present only in a superseded snapshot, or retyped in other words, is
   *  not counted. Undetermined is never evidence the sentence was right. */
  changedFromAudit({ limit = null, offset = 0 } = {}) {
    const cap = clamp(limit, CHANGED_FROM_AUDIT_LIMIT_DEFAULT, CHANGED_FROM_AUDIT_LIMIT_MAX);
    const from = Math.max(0, Math.floor(Number(offset) || 0));
    const lit = CHANGED_FROM_SENTENCE;
    const named = new RegExp(lit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^()\\s]+)\\)", "g");
    const rows = this.#rows(
      `SELECT bundle_id, content FROM files WHERE path = 'bundle.md' AND instr(content, ?) > 0
        ORDER BY bundle_id`, lit);
    const out = { wrong: 0, right: 0, undetermined: 0 };
    const all = rows.map((r) => {
      const ids = [...new Set([...String(r.content).matchAll(named)].map((m) => m[1]))];
      const base = { bundle_id: r.bundle_id, named: ids.length === 1 ? ids[0] : null };
      const undetermined = (why, extra = {}) =>
        ({ ...base, verdict: "undetermined", why, predecessor: null, ...extra });
      if (ids.length !== 1) return undetermined(ids.length ? "several_named" : "no_named_id", { named_all: ids });
      const pairs = this.#rows(
        `SELECT DISTINCT cl.address_norm AS address_norm, cl.capture_sha AS capture_sha
           FROM register r JOIN captured_locators cl ON cl.capture_sha = r.capture_sha
          WHERE r.bundle_id = ? ORDER BY cl.address_norm, cl.capture_sha`, r.bundle_id);
      let pair = pairs.length === 1 ? pairs[0] : null;
      if (pairs.length > 1) {
        const h = /^\s*content_hash:\s*"?([0-9a-fA-F]{64})"?\s*$/m.exec(String(r.content));
        const hits = h ? pairs.filter((p) => p.capture_sha === h[1].toLowerCase()) : [];
        pair = hits.length === 1 ? hits[0] : null;
        if (!pair) return undetermined("several_versions_held", { versions_held: pairs.length });
      }
      if (!pair) return undetermined("no_version_held");
      const c = this.provenance.versionChain({ addressNorm: pair.address_norm, at: pair.capture_sha, limit: 1,
                                               viewer: MACHINE_ADMIN });
      if (!c || !c.ok) return undetermined("no_version_held");
      const at = { address_norm: pair.address_norm, capture_sha: pair.capture_sha, at_index: c.at_index };
      if (!c.predecessor) return undetermined("no_prior_version", at);
      const predecessor = { bundle_id: c.predecessor.bundle_id, capture_sha: c.predecessor.capture_sha,
                            first_retrieved: c.predecessor.first_retrieved };
      return { ...base, verdict: c.predecessor.bundle_id === ids[0] ? "right" : "wrong",
               ...at, sole_prior: c.at_index === 1, predecessor };
    });
    for (const a of all) out[a.verdict]++;
    const listed = all.slice(from, from + cap);
    return {
      ok: true,
      affected: all.length,
      wrong: out.wrong, right: out.right, undetermined: out.undetermined,
      bundles: listed, count: listed.length, total: all.length,
      limit: cap, offset: from, truncated: from + listed.length < all.length,
      wrote: false,
      note: "read-only: every body stays as written (BOB #31, 2026-09-23 22:22Z); this answer is the correction. "
        + "'undetermined' is the chain unable to check a sentence, never evidence it was right.",
    };
  }

  /* ---------------------------------------------------------------- R14: the pushed notice (REC-222) */

  /** R14: a bounded sweep over the basis legs that rest on a passage (inquiry R40), in (holder, ord) order after
   *  `after` (`<holder>#<ord>`). For each, content's notice is read as the record holds it (a machine viewer); each
   *  newer capture graded affected or undetermined raises ONE notice per (holder, reference, newer capture), never for A
   *  or B, and never where the chain could not be read (`chain_unread`, K102: a pushed notice needs a newer capture to
   *  exist; the pull read keeps answering it as undetermined by name). A notice once raised, open or closed, is never
   *  raised again; a yet newer capture raises its own. A divided holder's legs are frozen history and raise nothing.
   *  R8's listeners are told of each notice raised, after the sweep's writes commit. */
  raiseNotices({ limit = null, after = null } = {}) {
    const cap = clamp(limit, NOTICE_SWEEP_DEFAULT, NOTICE_SWEEP_MAX);
    const aft = String(after ?? "");
    const inCases = aft.startsWith(CASE_CURSOR);
    const m = inCases ? null : /^(.*)#(\d+)$/.exec(aft);
    const [aHolder, aOrd] = m ? [m[1], Number(m[2])] : ["", -1];
    const page = inCases ? [] : this.#rows(
      `SELECT ib.bundle_id AS holder, ib.ord AS ord, ib.target_id AS target_id, ib.content_id AS content_id
         FROM inquiry_basis ib
        WHERE ib.content_id IS NOT NULL AND ib.content_id <> ''
          AND (ib.bundle_id > ? OR (ib.bundle_id = ? AND ib.ord > ?))
        ORDER BY ib.bundle_id, ib.ord LIMIT ?`, aHolder, aHolder, aOrd, cap + 1);
    let truncated = page.length > cap;
    const legs = page.slice(0, cap);
    const holders = [...new Set(legs.map((l) => l.holder))];
    const divided = new Set(holders.length
      ? this.#rows(`SELECT bundle_id FROM bundles WHERE bundle_id IN (SELECT value FROM json_each(?))
                     AND current_state = 'divided' LIMIT ?`, JSON.stringify(holders), holders.length).map((r) => r.bundle_id)
      : []);
    const ids = [...new Set(legs.map((l) => l.content_id))];
    const rows = new Map((ids.length
      ? this.#rows(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as FROM content
                     WHERE content_id IN (SELECT value FROM json_each(?)) LIMIT ?`, JSON.stringify(ids), ids.length)
      : []).map((r) => [r.content_id, r]));
    const memo = new Map(), noticeMemo = new Map();
    /* R26: the case half runs once the legs are read to their end, with what is left of this batch's limit. */
    const cases = truncated ? null : this.#caseHalf(inCases ? aft.slice(CASE_CURSOR.length) : "", cap - legs.length, memo);
    const when = this.#when();
    const raised = [];
    let examined = 0, unread = 0;
    this.record.transact(() => {
      for (const l of legs) {
        const row = rows.get(l.content_id);
        if (!row || divided.has(l.holder)) continue;
        examined++;
        let n = noticeMemo.get(l.content_id);
        if (!n) {
          try { n = this.content.noticeForRow(row, MACHINE_ADMIN, memo); } catch { n = null; }
          noticeMemo.set(l.content_id, n);
        }
        if (!n || n.state === "chain_unread") { unread++; continue; }
        for (const c of n.candidates || []) {
          if (!RAISED_ON.includes(c.affects)) continue;
          const id = `RN-${sha256HexSync(`${l.holder}\u0000${l.ord}\u0000${l.content_id}\u0000${c.capture_sha}`).slice(0, 24)}`;
          if (this.#one(`SELECT 1 AS x FROM reevaluation_notices WHERE notice_id=?`, id)) continue;
          this.sql.exec(
            `INSERT INTO reevaluation_notices (notice_id, holder, ord, content_id, target_id, capture_sha, newer_capture,
                                               newer_bundle, grade, affects, raised_at, state)
             VALUES (?,?,?,?,?,?,?,?,?,?,?, 'open')`,
            id, l.holder, l.ord, l.content_id, l.target_id, row.capture_sha, c.capture_sha, c.bundle_id ?? null,
            c.grade ?? null, c.affects, when);
          raised.push({ notice: id, holder: l.holder, ord: l.ord, content_id: l.content_id, target: l.target_id,
                        capture_sha: row.capture_sha, newer_capture: c.capture_sha, grade: c.grade ?? null,
                        affects: c.affects });
        }
      }
      for (const p of cases ? cases.parts : []) {
        examined++;
        const n = p.notice;
        if (!n || n.state === "chain_unread") { unread++; continue; }
        for (const c of n.candidates || []) {
          if (!RAISED_ON.includes(c.affects)) continue;
          const id = `RC-${sha256HexSync(`${p.case}\u0000${p.part}\u0000${p.capture_sha}\u0000${c.capture_sha}`).slice(0, 24)}`;
          if (this.#one(`SELECT 1 AS x FROM reevaluation_case_notices WHERE notice_id=?`, id)) continue;
          this.sql.exec(
            `INSERT INTO reevaluation_case_notices (notice_id, case_id, edition, project, ord, part, capture_sha,
                                                    newer_capture, newer_bundle, grade, affects, owners, raised_at, state)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, 'open')`,
            id, p.case, p.edition, p.project, p.ord, p.part, p.capture_sha, c.capture_sha,
            c.bundle_id ?? null, c.grade ?? null, c.affects, JSON.stringify(p.owners), when);
          raised.push({ notice: id, kind: "case", case: p.case, edition: p.edition, project: p.project, ord: p.ord,
                        part: p.part, capture_sha: p.capture_sha, newer_capture: c.capture_sha,
                        grade: c.grade ?? null, affects: c.affects, owners: p.owners });
        }
      }
      return null;
    });
    const last = legs.length ? legs[legs.length - 1] : null;
    let cursor = truncated && last ? `${last.holder}#${last.ord}` : null;
    if (cases && cases.cursor !== null) { truncated = true; cursor = `${CASE_CURSOR}${cases.cursor}`; }
    const out = { ok: true, examined, chain_unread: unread, raised, count: raised.length, limit: cap, truncated, cursor,
                  ...(cases && cases.absent ? { case_parts_absent: true, case_parts_why: "no module has registered the "
                    + "cited parts of a case edition, so no case's owners were told of a newer version of what it cites; "
                    + "that is not the same as none" } : {}),
                  says: "a notice is raised once per question, leg and newer capture, and once per case, cited part and "
                      + "newer capture to that case's owners, only where the newer version affects the passage or whether "
                      + "it does is undetermined; nothing was moved, and only a member's act moves a reference" };
    /* R8 (N406): each notice raised is told once the sweep's writes have committed, and a caller's transaction around
       it has too; a rolled-back sweep raised nothing and tells nothing. */
    for (const r of raised) {
      const told = r.kind === "case"
        ? { kind: "passage", subject: r.part, source: "newer_capture", since: when,
            detail: `a newer capture of ${r.part} (${r.newer_capture.slice(0, 12)}), cited by case ${r.case}, grades it `
                  + `${r.grade ?? "undetermined"} (${r.affects})`,
            dependents: [], case: { case: r.case, edition: r.edition, project: r.project, owners: r.owners },
            captures: { cited: r.capture_sha, newer: r.newer_capture }, grade: r.grade, affects: r.affects, notice: r.notice }
        : { kind: "passage", subject: r.content_id, source: "newer_capture", since: when,
            detail: `a newer capture of ${r.target} (${r.newer_capture.slice(0, 12)}) grades `
                  + `this passage ${r.grade ?? "undetermined"} (${r.affects})`,
            dependents: [{ bundle_id: r.holder, ord: r.ord }],
            captures: { cited: r.capture_sha, newer: r.newer_capture },
            grade: r.grade, affects: r.affects, notice: r.notice };
      this.#tellAfterCommit(told, out);
    }
    return out;
  }

  /* R26: R14's case half for one batch: the ratified cases after `afterCase`, one counting one toward `budget`, each
     cited part graded at the capture the edition pinned (its `capture_sha`, K365). Reads only; the caller writes. `cursor` is the last case read when more
     may follow (`""` when the budget is spent before the first), else null; `absent` when nothing is registered. */
  #caseHalf(afterCase, budget, memo) {
    const reg = this.#caseParts;
    if (!reg) return { absent: true, parts: [], cursor: null };
    if (budget <= 0) return { parts: [], cursor: afterCase };
    let list = null;
    try { list = reg.cases({ after: afterCase, limit: budget }); } catch { list = null; }
    const ids = (list && Array.isArray(list.cases) ? list.cases : []).filter((c) => typeof c === "string" && c)
      .slice(0, budget);
    const parts = [];
    for (const caseId of ids) {
      let a = null;
      try { a = reg.parts({ case: caseId }); } catch { a = null; }
      if (!a || a.ok === false || !Array.isArray(a.parts)) continue;
      const project = str(a.project);
      let owners = [];
      try { owners = project ? this.membership.projectOwners(project) || [] : []; } catch { owners = []; }
      a.parts.forEach((p, ord) => {
        const part = p ? str(p.bundle_id) : null;
        const capture = p && typeof p.capture_sha === "string" && SHA256_HEX.test(p.capture_sha.trim())
          ? p.capture_sha.trim().toLowerCase() : null;
        if (!part || !capture) return;
        parts.push({ case: caseId, edition: Number.isInteger(a.edition) ? a.edition : null, project, owners, ord,
                     part, capture_sha: capture, notice: this.#gradeWhole(part, capture, memo) });
      });
    }
    /* A full page may have more after it; a short one is the end. */
    return { parts, cursor: ids.length === budget ? ids[ids.length - 1] : null };
  }

  /* R26: content's notice for the whole of one capture of a part, as the record holds it (a machine viewer). */
  #gradeWhole(part, capture, memo) {
    const row = { content_id: null, capture_sha: capture, bundle_id: part, extent_kind: "document",
                  extent: DOCUMENT_EXTENT, ref: null, cited_as: null };
    try { return this.content.noticeForRow(row, MACHINE_ADMIN, memo); } catch { return null; }
  }

  #noticeView(r) {
    return { notice: r.notice_id, kind: r.kind, holder: r.holder, ord: r.ord, content_id: r.content_id,
             target: r.target_id, capture_sha: r.capture_sha, newer_capture: r.newer_capture, newer_bundle: r.newer_bundle,
             grade: r.grade, affects: r.affects, raised_at: r.raised_at, state: r.state,
             closed_by: r.closed_by, closed_at: r.closed_at, why: r.why, adopted_version: r.adopted_version,
             ...(r.kind === "case" ? { case: { case: r.holder, edition: r.edition, project: r.project,
                                               part: r.target_id } } : {}) };
  }

  /* R14, R26: the two kinds of notice as one listing. A leg notice is seen through its holder; a case notice only by
     the owners it told (and a machine credential, which is not filtered), so nobody else is told. */
  #noticeRows(g, where, args, tail, tailArgs) {
    const seeAll = g.scope === "member" ? 1 : 0;
    return this.#rows(
      `SELECT * FROM (
         SELECT 'leg' AS kind, n.notice_id, n.holder, n.ord, n.content_id, n.target_id, n.capture_sha, n.newer_capture,
                n.newer_bundle, n.grade, n.affects, n.raised_at, n.state, n.closed_by, n.closed_at, n.why,
                n.adopted_version, NULL AS edition, NULL AS project
           FROM reevaluation_notices n JOIN bundles b ON b.bundle_id = n.holder WHERE (${g.sql})
         UNION ALL
         SELECT 'case' AS kind, c.notice_id, c.case_id, c.ord, NULL, c.part, c.capture_sha, c.newer_capture,
                c.newer_bundle, c.grade, c.affects, c.raised_at, c.state, c.closed_by, c.closed_at, c.why,
                NULL, c.edition, c.project
           FROM reevaluation_case_notices c
          WHERE ? = 1 OR EXISTS (SELECT 1 FROM json_each(c.owners) o WHERE o.value = ?)
       ) WHERE ${where} ${tail}`, ...g.args, seeAll, g.member ?? null, ...args, ...tailArgs);
  }

  /* R14 (N200): whether the viewer sees a capture, by the gate `versionChain` reads it through (provenance R17): some
     bundle registering it is one the viewer may see. Memoised for the one answer it serves. */
  #captureSeer(viewer) {
    const g = viewerPredicate(viewer);
    if (g.scope === "member") return () => true;          /* a machine credential: not filtered */
    if (g.scope === "DENY") return () => false;
    const memo = new Map();
    return (sha) => {
      if (!sha) return false;
      if (!memo.has(sha))
        memo.set(sha, !!this.#one(`SELECT 1 AS x FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id
                                    WHERE r.capture_sha=? AND (${g.sql}) LIMIT 1`, sha, ...g.args));
      return memo.get(sha);
    };
  }

  /** R14: the notices raised, for the queue that renders them: by holder or all, open unless `state` names another,
   *  in holder then id order after `after`, at most `limit` (default 200, most 1,000), `truncated`. A notice whose holder
   *  the viewer may not see is withheld and not counted; its newer bundle, if unseen, is null. A viewer who does not
   *  see the newer capture's project is given its `newer_capture`, `grade` and `affects` as absent, as
   *  `op=versionnotice` withholds that version (N200, K224). */
  notices({ holder = null, state = "open", after = null, limit = null, viewer = null } = {}) {
    const cap = clamp(limit, NOTICES_LIMIT_DEFAULT, NOTICES_LIMIT_MAX);
    const h = str(holder);
    const st = ["open", "adopted", "kept", "all"].includes(state) ? state : "open";
    const g = viewerPredicate(viewer);
    const rows = this.#noticeRows(g, `(? IS NULL OR holder = ?) AND (? = 'all' OR state = ?) AND notice_id > ?`,
      [h, h, st, st, String(after ?? "")], `ORDER BY notice_id LIMIT ?`, [cap + 1]);
    const visible = this.#redactor(viewer);
    const seesCapture = this.#captureSeer(viewer);
    const list = rows.slice(0, cap).map((r) => ({ ...this.#noticeView(r), newer_bundle: visible(r.newer_bundle),
      ...(seesCapture(r.newer_capture) ? {} : { newer_capture: null, grade: null, affects: null }) }));
    return { ok: true, notices: list, count: list.length, limit: cap, truncated: rows.length > cap,
             cursor: rows.length > cap ? list[list.length - 1].notice : null, state: st };
  }

  /* ---------------------------------------------------------------- R25: the notice sweep's due, wake and tick */

  /* R25: where the pass stands (`reevaluation_sweep`); an absent row is no pass yet complete and no receipt counted. */
  #sweepRow() {
    return this.#one(`SELECT cursor, pass_began, pass_seq, complete_began, complete_seq, receipt_seq
                        FROM reevaluation_sweep WHERE id = 1 LIMIT 1`)
      || { cursor: null, pass_began: null, pass_seq: null, complete_began: null, complete_seq: null, receipt_seq: 0 };
  }

  #sweepWrite(row) {
    this.sql.exec(`INSERT INTO reevaluation_sweep (id, cursor, pass_began, pass_seq, complete_began, complete_seq, receipt_seq)
                   VALUES (1,?,?,?,?,?,?)
                   ON CONFLICT(id) DO UPDATE SET cursor=excluded.cursor, pass_began=excluded.pass_began,
                     pass_seq=excluded.pass_seq, complete_began=excluded.complete_began,
                     complete_seq=excluded.complete_seq, receipt_seq=excluded.receipt_seq`,
                  row.cursor, row.pass_began, row.pass_seq, row.complete_began, row.complete_seq, row.receipt_seq);
  }

  /* R25: a receipt was written: the count moves. Not a service: it is the listener the factory registers with
     provenance's `onReceipt`, run inside the receipt's own transaction. */
  receiptSeen() {
    this.sql.exec(`INSERT INTO reevaluation_sweep (id, receipt_seq) VALUES (1, 1)
                   ON CONFLICT(id) DO UPDATE SET receipt_seq = receipt_seq + 1`);
  }

  /* R25: pending while a pass is part-way, when a receipt was counted since the last complete pass began, or, with no
     pass yet complete, when any basis leg rests on a passage. */
  #sweepPending(row = this.#sweepRow()) {
    if (row.pass_began !== null) return true;
    if (row.complete_began !== null) return Number(row.receipt_seq) > Number(row.complete_seq ?? 0);
    return !!this.#one(`SELECT 1 AS x FROM inquiry_basis WHERE content_id IS NOT NULL AND content_id <> '' LIMIT 1`);
  }

  /* R25: the sweep delay, the instance binding `REEVAL_NOTICE_DELAY_MS` when it reads as a number >= 0. */
  #sweepDelayMs() {
    const raw = this.env.REEVAL_NOTICE_DELAY_MS;
    const v = raw === null || raw === undefined || String(raw).trim() === "" ? NaN : Number(raw);
    return Number.isFinite(v) && v >= 0 ? v : REEVAL_NOTICE_DELAY_MS;
  }

  /** R25: `now` while the sweep is pending, else null. Synchronous; writes nothing; never throws. */
  noticeSweepDue(now) {
    try { return this.#sweepPending() ? now : null; } catch { return null; }
  }

  /** R25: `now` plus the sweep delay while the sweep is pending, else null. Synchronous; writes nothing; never throws. */
  noticeSweepWake(now) {
    try { return this.#sweepPending() ? Number(now) + this.#sweepDelayMs() : null; } catch { return null; }
  }

  /** R25: one batch of R14's sweep at the default limit, where the pass stands (a pass begins when none is part-way),
   *  answered as that batch's `raiseNotices` answer; a batch whose `cursor` is null completes the pass. Not pending, it
   *  runs nothing and answers `{pending: false}`. `now` (ms) stamps when a pass began. */
  noticeSweep(now) {
    const row = this.#sweepRow();
    if (!this.#sweepPending(row)) return { pending: false };
    const ms = Number(now);
    const began = row.pass_began !== null ? row.pass_began
      : Number.isFinite(ms) ? stampInstant("second", ms) : this.#when();
    const pass = row.pass_began !== null ? { began, seq: row.pass_seq ?? 0, after: row.cursor }
      : { began, seq: Number(row.receipt_seq) || 0, after: null };
    const batch = this.raiseNotices({ after: pass.after });
    /* The count read now: a receipt counted during the batch stays counted. */
    const seq = this.#sweepRow().receipt_seq;
    this.#sweepWrite(batch.cursor
      ? { ...row, receipt_seq: seq, cursor: batch.cursor, pass_began: pass.began, pass_seq: pass.seq }
      : { ...row, receipt_seq: seq, cursor: null, pass_began: null, pass_seq: null,
          complete_began: pass.began, complete_seq: pass.seq });
    return batch;
  }

  /* ---------------------------------------------------------------- R15: the member's choice (REC-223) */

  /* C-110's refusal with its row. */
  #refuse(code, detail, extra = {}) {
    const row = rowOf(code);
    return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...extra };
  }

  /* R15: the notice an act names, seen through its holder; a machine is refused first. Answers the refusal itself, or
     `{ok: true, who, r}`, so every outcome carries its verdict (DEC-49; N242). */
  #choiceSubject(machineCode, notice, author, viewer, why = undefined) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-version-choice */
    if (!who || isMachineIdentity(who))
      return this.#refuse(machineCode,
        who ? `'${who.slice(0, 60)}' is a machine identity.` : "no member is named as the one choosing.");
    /* R15 (DEC-88): an adoption's why, asked straight after the machine refusal (a keep passes none and is not asked). */
    if (machineCode === "MACHINE_CANNOT_ADOPT_VERSION"
        && (typeof why !== "string" || !why.trim() || why.trim().length > ADOPT_WHY_MAX))
      return this.#refuse("VERSION_ADOPT_NO_REASON",
        typeof why !== "string" || !why.trim()
          ? "pass why=<your words on why the finding should rest on the newer version>."
          : `the reason is ${why.trim().length} characters; at most ${ADOPT_WHY_MAX}.`,
        { notice: String(notice ?? "").trim() || null, limit: ADOPT_WHY_MAX });
    const id = String(notice ?? "").trim();
    /* R26: a case notice answers only to the owners it told; any other viewer reads it as absent. */
    const r = !id ? null
      : this.#noticeRows(viewerPredicate(viewer), `notice_id = ?`, [id], `LIMIT 1`, [])[0] ?? null;
    if (!r)
      return this.#refuse("VERSION_NOTICE_NOT_FOUND",
        `no notice by the id '${id.slice(0, 60)}' is readable here.`, { notice: id || null });
    if (r.state !== "open")
      return this.#refuse("VERSION_NOTICE_CLOSED",
        `${id} was answered ${r.state === "adopted" ? "by adopting the newer version" : "by keeping the earlier version"} `
        + `by ${r.closed_by} at ${r.closed_at}.`, { notice: id, state: r.state });
    /* END DEC-49 REGION is-version-choice */
    return { ok: true, who, r };
  }

  /** R15: ADOPT writes a new version of the reference pinned to the newer capture, the old staying readable: for a
   *  basis leg, a new basis version through `basis-versions` (its R28), holding the question's live legs as written with
   *  this one re-pinned (its grade is not carried: it was given to the earlier passage). The live basis is untouched.
   *  The version and the notice's closing land together or neither does. It requires `why`, the member's words on why
   *  the newer version is adopted (DEC-88), asked after the machine refusal and before anything is read for writing;
   *  the why is recorded with the new version (its description and Session Log entry) and on the notice's closure. */
  adoptVersion({ notice = null, why = null, author = null, viewer = null } = {}) {
    const s = this.#choiceSubject("MACHINE_CANNOT_ADOPT_VERSION", notice, author, viewer, why);
    if (!s.ok) return s;
    const { who, r } = s;
    const text = why.trim();
    if (r.kind === "case")
      return this.#refuse("VERSION_ADOPT_UNWRITABLE",
        `${r.notice_id} is about a part case ${r.holder} cites at its pin; a case edition keeps the bytes it was signed `
        + `over, and resting a case on the newer version is a new edition, which is the case's authors' act. `
        + `Nothing was written.`, { notice: r.notice_id });
    const fm = this.#frontmatterOf(r.holder);
    const legs = this.#basisFrontmatter(fm);
    const leg = legs[r.ord];
    /* DEC-49 REGION is-version-adoptable */
    if (!fm || !leg || leg.target !== r.target_id)
      return this.#refuse("VERSION_ADOPT_UNWRITABLE",
        `${r.holder} no longer holds leg ${r.ord} on ${r.target_id} as this notice read it, so there is no reference to `
        + `move. Nothing was written.`, { notice: r.notice_id });
    const old = this.#one(`SELECT extent_kind, extent FROM content WHERE content_id=?`, r.content_id);
    let extent = null;
    try { extent = old && old.extent ? JSON.parse(old.extent) : null; } catch { extent = null; }
    /* The newer capture's home: the version chain is per address, so the newer version may be filed in another bundle,
       and a leg names the document its capture is held in (content R27). */
    const home = r.newer_bundle || r.target_id;
    const held = old ? this.#one(`SELECT content_id FROM content WHERE capture_sha=? AND extent=? AND bundle_id=?
                                   ORDER BY content_id LIMIT 1`, r.newer_capture, old.extent, home) : null;
    const when = this.#when();
    /* Every leg as the live basis holds it; the adopted one re-pinned. A content id is a hash over its capture, so the
       adopted leg names the newer capture's row where the record holds one at the same extent, else the extent itself
       with `extent_capture` (inquiry R5: never both). */
    const KEEP = ["target", "role", "grade", "grade_axis", "grade_source", "note", "date", "author", "ground",
                  "target_edition", "content_id", "extent_capture"];
    const copy = (l) => {
      const o = {};
      for (const [k, v] of Object.entries(l)) if ((KEEP.includes(k) || k.startsWith("extent_")) && v !== undefined && v !== null && v !== "") o[k] = v;
      return o;
    };
    const vlegs = legs.map((l, i) => {
      if (i !== r.ord) return copy(l);
      const o = { target: home };
      for (const k of ["role", "note", "ground", ...(home === l.target ? ["target_edition"] : [])])
        if (l[k] !== undefined && l[k] !== null && l[k] !== "") o[k] = l[k];
      if (held) o.content_id = held.content_id;
      else {
        const kind = (extent && extent.kind) || old?.extent_kind || "document";
        if (kind !== "document") {
          o.extent_kind = kind;
          for (const [k, v] of Object.entries(extent || {})) if (k !== "kind" && v !== undefined && v !== null) o[`extent_${k}`] = v;
        }
        o.extent_capture = r.newer_capture;
      }
      return o;
    });
    /* A version carries its partition (C-25.5): the live grounds as authored, or every leg in one ground the adopting
       member asserts, composing as `and`. */
    const labels = new Set(vlegs.map((l) => (typeof l.ground === "string" ? l.ground.trim() : "")).filter(Boolean));
    let grounds;
    if (labels.size && vlegs.every((l) => typeof l.ground === "string" && l.ground.trim())) {
      const rowsG = Array.isArray(fm.grounds) ? fm.grounds.filter((g) => g && typeof g === "object") : [];
      grounds = [...labels].map((g) => groundRow(g, rowsG.find((x) => String(x.ground ?? "").trim() === g), who, when));
    } else {
      for (const l of vlegs) l.ground = "all";
      labels.clear(); labels.add("all");
      grounds = [{ ground: "all", asserted_by: who, at: when,
                   statement: "every leg is needed, as the live basis holds them" }];
    }
    if (![...labels].every((g) => GROUND_LABEL_RE.test(g)))
      return this.#refuse("VERSION_ADOPT_UNWRITABLE",
        `${r.holder}'s grounds carry a label a version cannot hold, so the newer version could not be written. `
        + `Nothing was written.`, { notice: r.notice_id });
    const names = new Set((Array.isArray(fm.basis_versions) ? fm.basis_versions : [])
      .map((v) => String(v && v.name ? v.name : "").trim().toLowerCase()));
    let name = `adopt-${r.newer_capture.slice(0, 8)}-${r.ord}`;
    for (let k = 2; names.has(name.toLowerCase()); k++) name = `adopt-${r.newer_capture.slice(0, 8)}-${r.ord}-${k}`;
    if (!VERSION_NAME_RE.test(name))
      return this.#refuse("VERSION_ADOPT_UNWRITABLE", `no version name could be formed for ${r.holder}.`, { notice: r.notice_id });
    /* END DEC-49 REGION is-version-adoptable */
    /* The why on one line: a line break in it would open a heading of its own in the Session Log. */
    const line = text.replace(/\s*[\r\n]+\s*/g, " ");
    const description = `Adopts a newer version of ${r.target_id}${home !== r.target_id ? ` (held as ${home})` : ""}: leg ${r.ord} rests on capture `
      + `${r.newer_capture.slice(0, 12)} in place of ${r.capture_sha.slice(0, 12)} (notice ${r.notice_id}). `
      + `Every other leg is as the live basis holds it. Why: ${line}`;
    const answer = this.record.transact(() => {
      const w = this.basisVersions.appendVersion({
        target: r.holder, version: { name, description, relationship: labels.size > 1 ? "or" : "and" },
        grounds, legs: vlegs, author: who, at: when,
        log: `### Session ${when} | Newer version adopted | ${who}\n`
           + `Trigger: adoptVersion on ${r.notice_id}\n`
           + `Changes: reading '${name}' added, in state suggested: leg ${r.ord} pinned to capture ${r.newer_capture}; `
           + `the live basis is unchanged.\n`
           + `Why: ${line}\n` });
      /* basis-versions' own refusal passes through as it came; no answer at all is this module's C-110.9 (N182 (4)). */
      if (w && !w.ok) return { ...w, ok: false, notice: r.notice_id };
      if (!w) return this.#refuse("VERSION_ADOPT_UNWRITABLE", `the newer version of ${r.holder} could not be written. `
        + `Nothing was written.`, { notice: r.notice_id });
      this.sql.exec(`UPDATE reevaluation_notices SET state='adopted', closed_by=?, closed_at=?, why=?, adopted_version=?
                      WHERE notice_id=? AND state='open'`, who, when, text, name, r.notice_id);
      return { ok: true, bundleSha: w.bundleSha ?? null };
    });
    if (!answer.ok) return answer;
    return { ok: true, notice: r.notice_id, holder: r.holder, ord: r.ord, act: "adopted", author: who, at: when, why: text,
             capture_sha: r.capture_sha, newer_capture: r.newer_capture, version: name, state: "suggested",
             bundleSha: answer.bundleSha,
             ...(legs[r.ord].grade ? { grade_not_carried: { grade: legs[r.ord].grade,
               why: "the grade was given to the passage in the earlier capture; the newer passage is not graded until a "
                  + "member grades it" } } : {}),
             says: `a new reading of ${r.holder} rests leg ${r.ord} on the newer capture; the live basis and every earlier `
                 + `reading are unchanged and readable, and the new reading is suggested until a member accepts it` };
  }

  /** R15: KEEP records "stays on the earlier version" with who, when, the optional why and both captures. */
  keepVersion({ notice = null, why = null, author = null, viewer = null } = {}) {
    const s = this.#choiceSubject("MACHINE_CANNOT_KEEP_VERSION", notice, author, viewer);
    if (!s.ok) return s;
    const { who, r } = s;
    const text = why == null ? null : String(why).trim() || null;
    if (text !== null && (text.length > NOTE_MAX || UNSTORABLE.test(text)))
      return this.#refuse("VERSION_CHOICE_WHY_MALFORMED",
        `the reason is ${text.length} characters (at most ${NOTE_MAX}), or holds a quote, backslash or line break.`,
        { notice: r.notice_id, limit: NOTE_MAX });
    const when = this.#when();
    this.sql.exec(`UPDATE ${r.kind === "case" ? "reevaluation_case_notices" : "reevaluation_notices"}
                      SET state='kept', closed_by=?, closed_at=?, why=? WHERE notice_id=? AND state='open'`,
                  who, when, text, r.notice_id);
    return { ok: true, notice: r.notice_id, holder: r.holder, ord: r.ord, act: "kept", author: who, at: when,
             why: text, capture_sha: r.capture_sha, newer_capture: r.newer_capture,
             says: `${r.kind === "case" ? `case ${r.holder}'s cited part ${r.target_id}` : `${r.holder}'s leg ${r.ord}`} `
                 + `stays on the earlier version (${r.capture_sha.slice(0, 12)}); the newer capture `
                 + `(${r.newer_capture.slice(0, 12)}) will not raise this notice again` };
  }

  /* ---------------------------------------------------------------- R16: a recorded re-evaluation */

  /** R16: a member's recorded re-evaluation of `dependent` against one standing cause (`target`, `source`, and, when
   *  given, its `since`), closing that cause for that dependent until the target moves again (a later `since`). The
   *  cause is read now, from the obligation; the caller's `since` only confirms which one is meant. */
  recordReevaluation({ dependent = null, target = null, source = null, since = null, note = null, author = null,
                       viewer = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-reevaluation-record */
    if (!who || isMachineIdentity(who))
      return this.#refuse("MACHINE_CANNOT_RECORD_REEVALUATION",
        who ? `'${who.slice(0, 60)}' is a machine identity.` : "no member is named as the one who looked again.");
    const text = String(note ?? "").trim();
    if (!text || text.length > NOTE_MAX || UNSTORABLE.test(text))
      return this.#refuse("REEVALUATION_NOTE_MALFORMED",
        !text ? "pass note=<what was looked at and what was decided>."
              : `the note is ${text.length} characters (at most ${NOTE_MAX}), or holds a quote, backslash or line break.`,
        { limit: NOTE_MAX });
    const dep = str(dependent), tgt = str(target), src = str(source);
    const noCause = (detail) => this.#refuse("REEVALUATION_NO_SUCH_CAUSE", detail,
      { dependent: dep, target: tgt, source: src });
    if (!dep || !tgt || !src || !CAUSE_SOURCES.includes(src))
      return noCause("pass dependent=<the finding looked at>, target=<what moved under it> and source=<one of "
                     + `${CAUSE_SOURCES.join(", ")}>.`);
    if (!this.#visible(dep, viewer)) return noCause(`no finding by the id '${dep.slice(0, 60)}' is readable here.`);
    const ob = ((isRef(tgt) ? this.#refSeer(viewer).seen(tgt) : this.#visible(tgt, viewer)) || tgt === dep)
      ? this.reevaluations({ target: tgt, viewer }) : { ok: true, obligations: [] };
    const hit = ob.ok ? (ob.obligations || []).find((o) => o.bundle_id === dep && o.target === tgt) : null;
    const cause = hit ? hit.causes.find((c) => c.source === src && (since == null || String(c.since) === String(since))) : null;
    if (!cause)
      return noCause(`nothing owed on ${dep} for ${tgt} (${src}${since != null ? ` since ${since}` : ""}) is standing now.`);
    /* END DEC-49 REGION is-reevaluation-record */
    const when = this.#when();
    this.sql.exec(`INSERT INTO reevaluation_records (dependent, target, source, since, note, author, at)
                   VALUES (?,?,?,?,?,?,?)`, dep, tgt, src, cause.since ?? null, text, who, when);
    return { ok: true, dependent: dep, target: tgt, source: src, since: cause.since ?? null, note: text,
             author: who, at: when, closed: true,
             says: `the ${src} cause on ${dep} from ${tgt} is recorded as looked at again by ${who}; it is owed again `
                 + `only when ${tgt} moves again` };
  }

  /* ---------------------------------------------------------------- R22: C-10.1 at the write and in the audit */

  /** R22: the promotion check (promotion R39): C-10.1's errors refuse a promotion that is not a replay; its warnings and
   *  infos are the audit's. */
  check(c) {
    if (!c || c.replay || (c.pkg && c.pkg.replay)) return null;
    const md = Array.isArray(c.files) ? c.files.find((f) => f && f.path === "bundle.md") : null;
    if (!md || typeof md.text !== "string") return null;
    let fm = null;
    try { fm = parseFrontmatter(md.text).data; } catch { fm = null; }
    if (!fm) return null;
    const errs = checkReevalPending(fm, { nowMs: Date.parse(this.#when()) || Date.now() })
      .filter((x) => x.severity === "error");
    if (!errs.length) return null;
    return { ok: false, reason: "REEVAL_PENDING_REFUSED",
             detail: "the document's reeval_pending field is not a shape the record can read. Nothing was written.",
             findings: errs.map((x) => ({ check: x.check, detail: x.message })) };
  }

  /** R22: the audit check (record-core R59) over one image: every C-10.1 finding of its bundle.md. */
  audit(image) {
    const files = image && image.files instanceof Map ? image.files : null;
    const md = files ? files.get("bundle.md") : null;
    const text = typeof md === "string" ? md : md instanceof Uint8Array ? new TextDecoder().decode(md) : null;
    if (text === null) return [];
    let fm = null;
    try { fm = parseFrontmatter(text).data; } catch { fm = null; }
    return fm ? checkReevalPending(fm) : [];
  }
}

const instances = new WeakMap();

/** K61: the one instance per host, created on the first call with `deps`. It creates its tables and declares them to
 *  purge (K23), fills the registrations `inquiry` and `promotion` offer (R7), and registers C-10.1 (R22). */
export function reevaluationOf(host, deps) {
  let r = instances.get(host);
  if (!r) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const membership = d.membership || membershipOf(host, { record });
    const promotion = d.promotion || promotionOf(host, { record, membership });
    r = new Reevaluation({ ...d, host, storage, record, membership, promotion });
    instances.set(host, r);
    r.migrate();
    record.declarePurge("reevaluation", REEVALUATION_TABLES);
    /* R7, R8: a deferral, a division and a re-read, through inquiry's registration (its R42): it answers `raise`'s answer
       whole, so R8's `listeners_failed` reaches the act's reply (N292). */
    r.inquiry.onRaised("reevaluation", ({ target, cause, since, viewer }) =>
      r.raise({ target, source: cause, since, viewer }));
    /* R7: a reopening, through promotion's (its R46): the answer joins reopen's reply under this module's id. */
    promotion.onReopened("reevaluation", ({ target, at, viewer }) => r.raise({ target, source: "reopened", since: at, viewer }));
    promotion.registerStep("reevaluation", { check: (c) => r.check(c) });
    record.registerAuditCheck("reevaluation", (image) => r.audit(image));
    /* R25: a receipt makes the notice sweep pending again (provenance R47). */
    r.provenance.onReceipt("reevaluation", () => r.receiptSeen());
    /* R28: each rung move of a source is heard and kept (sources R10). */
    r.sources.onDisclosure("reevaluation", (move) => r.sourceMoved(move));
  }
  return r;
}

/** Which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function reevaluationOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return REEVALUATION_TABLES.some((x) => x.name === name);
}

/** The module's ops (K3), as entries of the plane's op map (`src/plane/store.mjs`). `viewer` and `author` are the
 *  control plane's stamps, read from the query after the body, so a caller's own copy never wins. */
export function reevaluationOps(r, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    reevaluations: () => r.reevaluations({ target: q("target"), viewer: q("viewer") }),
    versionnotice: () => r.versionNotice({ target: q("target"), content: q("content"), limit: q("limit"),
                                           viewer: q("viewer") }),
    changedfromaudit: () => r.changedFromAudit({ limit: q("limit"), offset: q("offset") }),
    reevaluationchanges: () => r.changesOf({ findings: b.findings ?? q("findings"), contents: b.contents ?? q("contents"),
                                             viewer: q("viewer") }),
    reevaluationraise: () => r.raiseNotices({ limit: q("limit") ?? b.limit, after: q("after") ?? b.after }),
    reevaluationnotices: () => r.notices({ holder: q("holder"), state: q("state") || "open", after: q("after"),
                                           limit: q("limit"), viewer: q("viewer") }),
    versionadopt: () => r.adoptVersion({ notice: b.notice ?? q("notice"), why: b.why ?? q("why"), author: q("author"),
                                         viewer: q("viewer") }),
    versionkeep: () => r.keepVersion({ notice: b.notice ?? q("notice"), why: b.why ?? q("why"), author: q("author"),
                                       viewer: q("viewer") }),
    reevaluationrecord: () => r.recordReevaluation({ ...b, dependent: b.dependent ?? q("dependent"),
                                                     target: b.target ?? q("target"), source: b.source ?? q("source"),
                                                     since: b.since ?? q("since"), note: b.note ?? q("note"),
                                                     author: q("author"), viewer: q("viewer") }),
  };
}
