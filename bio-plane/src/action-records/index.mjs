/* action-records — what the group records about an action in records of its own, apart from the action's document
 * (requirements: `build/requirements/action-records.md`; State Rules v1.5 §4.4; Action v0.2 rules 6, 15): the proposals
 * a credential makes of an action's governing laws, risk tier and what a records request seeks, stored apart from the
 * member's value and never it (DEC-24: a machine proposes, a member acts); and the members' side records of an action:
 * that a sent entry was received or served, its confidential scope, and the promises the group made to people.
 *
 * Split from `actions` by copy for size (K617, K624; N961; T47-37; the map `build/extraction/actions-split.md`, its §4
 * adopted, K2982). Each requirement names its `actions` source ("was R<n>"); the copied comments keep `actions`' ids as
 * they were written there. No refusal code, text or bound changed in the copy, and the DEC-49 REGION markers moved with
 * their code. `actions` reads each record into the action's block (its R25) and asks this module's four single-site
 * judgments (R7–R10) at its own acts, so each code keeps one site. This module writes no action document and calls
 * nothing of `actions`' (the calls run one way).
 *
 * REACHED as `actionRecordsOf(host, deps)` (R15; K61): one instance per host, created on the first call. At creation it
 * creates its six tables with the DDL `actions` created them by and declares them to record-core's purge (R11).
 * `actions`' factory creates it at its own creation, so its tables exist and are declared at every boot.
 * `deps` (each reached on the same host unless given; a test passes its own):
 *   record         `transact`, `readFile`, `declarePurge` (R11) and the store's `sql` through the host's storage.
 *   membership     the instance on the host (sight itself is `viewerPredicate`, a module-level function: every act's
 *                  visibility).
 *   progressions   `readProgression` (its R5): the stages a `seeks` item names (R10).
 *   standards      `standardRead` (its R5): whether a law's `standard` is one the viewer may read (R9).
 *   now            the instance clock, milliseconds (default: `env.BIO_NOW_MS`, else the wall clock).
 *   env            the instance bindings.
 *
 * READ CONTRACTS it joins in its own SQL: record-core's `bundles` (`bundle_id`, `object_type`, `current_state`, and the
 * sight columns `viewerPredicate` reads) and `files` (`bundle_id`, `path`, `content`), its R37; provenance's `register`
 * (`capture_sha`), its R48 (R4's `UNREGISTERED_ARTIFACT`). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate } from "../membership/index.mjs";
import { progressionsOf } from "../progressions/index.mjs";
import { standardsOf, noSuchStandard } from "../standards/index.mjs";
import { isCalendarDate } from "../civil-time/index.mjs";
import { parseFrontmatter, normalizeType, isMachineIdentity, BUNDLE_ID_RE } from "../record-grammar/index.mjs";
import { RISK_TIERS, riskTierState, lawProposalLabel, LAW_LEVELS, GOVERNING_LAWS_MAX, CITATION_MAX, governingLawsOf,
         seeksOf, seeksFindings, SEEKS_MAX, PROMISE_KINDS, ACTION_FENCE_CHECKS, ACTION_ACT_CHECKS, GOVERNING_LAW_CHECKS,
         QUOTE_CHECKS, LIFECYCLE_CHECKS, RISK_TIER_REVISION_CHECKS, RECORDS_LAW_FENCE_CHECKS,
         ACTION_CATALOGUE_CHECKS } from "../action-grammar/index.mjs";
import { ACTION_RECORDS_TABLES, migrateActionRecords } from "./schema.mjs";

export { ACTION_RECORDS_SCHEMA, ACTION_RECORDS_TABLES } from "./schema.mjs";

/* REC-195: the most PROPOSALS one action's read returns (each at most GOVERNING_LAWS_MAX citations). A cut, published
   beside the answer — never a claim that no more exist. R28: the same bound for proposed tiers. (R1, R2) */
export const LAW_PROPOSALS_READ_MAX = 12;
export const RISK_PROPOSALS_READ_MAX = 12;
/** R73: the most proposals of what a request seeks one action's read lists (R19's bound). (R3) */
export const SEEKS_PROPOSALS_READ_MAX = 12;
/** R28: the longest basis a proposed tier carries. (R2) */
export const RISK_PROPOSAL_BASIS_MAX = 500;
/** R80 (T45): what a receipt record says happened to a sent entry. (R4) */
export const RECEIPT_KINDS = Object.freeze(["receipt", "service"]);
/** R80: the longest `how` and `party` of a receipt record. (R4) */
export const RECEIPT_TEXT_MAX = 200;
/** R88 (T45): the longest promise. (R6) */
export const PROMISE_TEXT_MAX = 500;
/* R4's account and R5's reason: `actions`' text bound for a reason, account, medium or party (its `NOTE_MAX`, R14's
   text rule), the same value, held here because this module imports nothing of `actions`'. */
const NOTE_MAX = 500;
/** R80, R74: a local date-time, `YYYY-MM-DDTHH:MM`. (R4) */
const LOCAL_DT_RE = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d$/;

/* R14 (was `actions` R99; DEC-194, N913): the one word of `words.json` (`docs/development/ux-substrate/screens/words.json`)
   this module answers, its `en` verbatim, read by key, as `actions`' `ACTIONS_WORDS` holds its own. The design stream's
   words: re-worded there, then re-taken here by key, never a copy of a sentence of this module's own. */
export const ACTION_RECORDS_WORDS = Object.freeze({
  "actions.scope.published_stays": "This changes what is published from now on. A case already signed stays as it was.",
});
/** R5, R14: the sentence answered beside a changed scope, as its key and the words `words.json` holds for it. */
export const SCOPE_PUBLISHED_STAYS = Object.freeze({ key: "actions.scope.published_stays",
                                                     says: ACTION_RECORDS_WORDS["actions.scope.published_stays"] });

/* The catalogue-backed refusals: each carries its code, check and translation (the Provides' "Terms"). The rows are
   action-grammar's (its R9, R28), over the same families `actions` reads its own from. */
const ROWS = Object.assign({}, ACTION_FENCE_CHECKS, ACTION_ACT_CHECKS, GOVERNING_LAW_CHECKS, QUOTE_CHECKS,
  LIFECYCLE_CHECKS, RISK_TIER_REVISION_CHECKS, RECORDS_LAW_FENCE_CHECKS, ACTION_CATALOGUE_CHECKS);
/** A refusal with its row's code, check and translation, when action-grammar holds a row for its reason; anything else
 *  unchanged. Never replaces a field the refusal already carries. */
export function withRow(r) {
  if (!r || typeof r !== "object" || r.ok !== false || typeof r.reason !== "string") return r;
  const row = ROWS[r.reason];
  if (!row) return r;
  return { ...r, code: r.code ?? r.reason, check: r.check ?? row.check, translation: r.translation ?? row.translation };
}
const refuse = (code, detail, extra) => withRow({ ok: false, reason: code, detail, ...(extra || {}) });
const findingsOf = (list) => list.filter((x) => x.severity === "error")
  .map((x) => ({ check: x.check, detail: x.message, ...(x.code ? { code: x.code } : {}), ...(x.repairs ? { repairs: x.repairs } : {}) }));

/* ================================================================ the correspondence entry's one site (R16; T48-47)
   Five conditions, each minted here and nowhere else: C-32.4 (the machine fence) and C-33.6–C-33.9 (the entry's own shape
   and its capture). `actions.actionCorrespond` (its R101) and R4's `actionReceipt` both answer them through these, so a
   change to what an entry must be cannot reach one act and miss the other. Each function's region below is its row's
   `where` (`action-grammar` R29). The caller's own fields ride in `extra` and never replace `reason`, `code`, `check` or
   `translation`; its `detail` is a sentence, or an object keyed by reason code where one call can refuse in several. */
const RESERVED = ["ok", "reason", "code", "check", "translation"];
function correspondRefusal(reason, fields, detail, extra) {
  const own = {};
  for (const [k, v] of Object.entries(extra && typeof extra === "object" ? extra : {})) if (!RESERVED.includes(k)) own[k] = v;
  const said = own.detail && typeof own.detail === "object" ? own.detail[reason] : own.detail;
  delete own.detail;
  return withRow({ ok: false, reason, ...fields, ...own, detail: typeof said === "string" && said ? said : detail });
}
/* R4's sentences for the five conditions, field for field as `actionReceipt` answered them before R16. */
const RECEIPT_DETAIL = Object.freeze({
  MACHINE_CANNOT_CORRESPOND: "a receipt is a named member's record that the group's sending reached its addressee. A machine "
    + "credential may not record one. Sign in as a member.",
  BAD_DATE: "a receipt is dated YYYY-MM-DD, or YYYY-MM-DDTHH:MM in the office's local time, a day the calendar has",
  CAPTURE_AND_TESTIMONY: "a receipt is held as the captured bytes OR a named member's account, never both.",
  NEITHER_CAPTURE_NOR_TESTIMONY: "a receipt is held as captured bytes the register holds, or as a named member's account.",
  UNREGISTERED_ARTIFACT: "this hash names no capture in this store. Capture it first, or record a named account instead.",
});
const shaOf = (v) => String(v ?? "").trim().replace(/^sha256:/, "").toLowerCase();

/** R16: C-32.4 `MACHINE_CANNOT_CORRESPOND` for an empty or machine author stamp (`isMachineIdentity`), else null. Pure. */
export function correspondFence(author, extra) {
  const who = String(author ?? "").trim();
  /* DEC-49 REGION is-machine-correspond — REC-64/C-32.4. The fence alone. */
  if (!who || isMachineIdentity(who))                 /* REC-46: one predicate */
    return correspondRefusal("MACHINE_CANNOT_CORRESPOND", {},
      "a correspondence entry is a named member's statement that this exchange happened — and on the testimony arm it IS "
      + "the evidence. A machine credential may capture bytes and may not testify to an exchange. Sign in as a member.", extra);
  /* END DEC-49 REGION is-machine-correspond */
  return null;
}

/** R16: the first of C-33.6 `BAD_DATE` (`at` not a real `YYYY-MM-DD`; with `dateTime`, `YYYY-MM-DDTHH:MM` on a real date is
 *  also one), C-33.7 `CAPTURE_AND_TESTIMONY` (a capture hash and an account both) and C-33.8 `NEITHER_CAPTURE_NOR_TESTIMONY`
 *  (neither), else null. Pure. */
export function correspondEntryRefusal({ at = "", artifactSha = "", account = "", dateTime = false } = {}, extra) {
  /* DEC-49 REGION is-correspond-entry — REC-64/C-33.6-8. The conditions on the ENTRY's own shape. The target guard and
     the hash checks around it refuse with codes minted at other sites, so they are outside this span: a `where` claims ONE
     span, and a code enforced in eight places cannot honestly name one of them as the site. */
  const day = String(at ?? "").trim();
  const m = dateTime ? LOCAL_DT_RE.exec(day) : null;
  if (!(isCalendarDate(day) || (m && isCalendarDate(m[1]))))
    return correspondRefusal("BAD_DATE", { at: day },
      dateTime ? "an entry is dated YYYY-MM-DD, or YYYY-MM-DDTHH:MM in the office's local time, a day the calendar has"
               : "every entry in this ledger is dated YYYY-MM-DD, a day the calendar has", extra);
  const sha = shaOf(artifactSha), acct = String(account ?? "").trim();
  if (sha && acct)
    return correspondRefusal("CAPTURE_AND_TESTIMONY", {},
      "an entry carries the captured bytes OR a named account, never both: what comes back is CAPTURED, not summarised "
      + "(DEC-13).", extra);
  if (!sha && !acct)
    return correspondRefusal("NEITHER_CAPTURE_NOR_TESTIMONY", {},
      "an entry carries either an artifact_sha that resolves in the register or an account with an author.", extra);
  /* END DEC-49 REGION is-correspond-entry */
  return null;
}

export class ActionRecords {
  #deps;

  constructor({ storage, record, host = null, membership = null, progressions = null, standards = null, now = null,
                env = null } = {}) {
    this.sql = storage.sql;
    this.record = record;
    this.#deps = { host, membership, progressions, standards };
    this.env = env && typeof env === "object" ? env : {};
    this.now = typeof now === "function" ? now : null;
  }

  /* R15: each dependency reached lazily on the same host unless a test passes its own; a host on which one cannot be
     created answers null, and what it would have answered is answered as R9 and R10 state (not seen; not held). */
  #reach(name, make) {
    if (this.#deps[name] === undefined || this.#deps[name] === null) {
      try { this.#deps[name] = make(this.#deps.host); } catch { this.#deps[name] = false; }
    }
    return this.#deps[name] || null;
  }
  get membership() { return this.#reach("membership", (h) => membershipOf(h, { record: this.record })); }
  /* R10: the progression definitions (`readProgression`, its R5). */
  get progressions() { return this.#reach("progressions", (h) => progressionsOf(h)); }
  /* R9: the held standards (`standardRead`, its R5). */
  get standards() { return this.#reach("standards", (h) => standardsOf(h)); }

  /** R16: the correspondence entry's site, reached on the instance `actions` creates (its R101). The two pure judgments are
   *  the module's own functions, answered unchanged; the third reads the register. */
  correspondFence(author, extra) { return correspondFence(author, extra); }
  correspondEntryRefusal(entry, extra) { return correspondEntryRefusal(entry, extra); }
  /** R16: null when the register holds `sha`, else C-33.9 `UNREGISTERED_ARTIFACT` naming `artifact_sha`. Writes nothing. */
  unregisteredArtifact(sha, extra) {
    const h = shaOf(sha);
    /* DEC-49 REGION is-correspond-artifact — REC-64/C-33.9. */
    if (h && !this.#one(`SELECT capture_sha FROM register WHERE capture_sha=?`, h)) {
      return correspondRefusal("UNREGISTERED_ARTIFACT", { artifact_sha: h },
        "this hash names no capture in this store. Capture the artifact first (op=capture), or record a named account "
        + "instead — those are the two honest ways to hold an exchange.", extra);
    }
    /* END DEC-49 REGION is-correspond-artifact */
    return null;
  }

  /** R15: creates the tables (idempotent), `action_law_proposals`' `standard` column added where absent. */
  migrate() { migrateActionRecords(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }

  /* The instance clock: an explicit `now` (the caller's as-of), then the injected clock, then `env.BIO_NOW_MS`, then
     the wall. An ABSENT param is null or "" and falls through, never read as the epoch. */
  #nowMs(explicit) {
    if (explicit !== undefined && explicit !== null && explicit !== "") {
      const e = Number(explicit);
      if (Number.isFinite(e) && e >= 0) return e;
    }
    if (this.now) { const n = Number(this.now()); if (Number.isFinite(n) && n >= 0) return n; }
    const v = Number(this.env && this.env.BIO_NOW_MS);
    if (Number.isFinite(v) && v >= 0) return v;
    return Date.now();
  }

  /* K57's small helpers, copied from `actions` (the map's §2). */
  #heldFm(id) {
    const f = this.record.readFile(id, "bundle.md");
    if (!f || typeof f.text !== "string") return null;
    const fm = parseFrontmatter(f.text).data;
    return fm && typeof fm === "object" ? fm : null;
  }
  /* R11: an action the viewer may not see is answered as an absent one (membership R43, the one sight rule). */
  #visibleAction(id, viewer) {
    const gate = viewerPredicate(viewer);
    return this.#one(`SELECT b.bundle_id, b.object_type, b.current_state FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`,
                     id, ...gate.args);
  }

  /* ================================================================ the single-site judgments (R7–R10) */

  /** R7 (was `actions` R18, its list-shape clause) — D-149: WHAT A WELL-FORMED LIST OF GOVERNING LAWS IS, decided in
   *  ONE place.
   *
   *  EXTRACTED FROM `actionLaws` BY REC-195, and the extraction is the point rather than tidiness. REC-195 adds a
   *  SECOND caller — `actionLawsPropose`, the machine's proposal — and a second caller judging the same shape is
   *  how REC-46's eleven-copies-of-one-predicate failure arrives at a grammar. The alternative was a second family
   *  of refusal codes saying the same four things about the same four conditions, which would have made the
   *  catalogue claim the plane draws a distinction it does not draw. So both acts ask this (`actions.actionLaws`, its
   *  R18, and R1 here), both refuse with C-73.2..5, and a change to what a citation may be cannot reach one act and
   *  miss the other.
   *
   *  IT JUDGES THE SHAPE AND NEVER THE LAW. Whether a citation is the RIGHT law for the agency asked is a member's
   *  reading and the plane does not try (D-149: the plane encodes no law's rules). Returns the parsed entries or
   *  the refusal (with its row), and writes nothing. It reads no instance state. */
  lawEntries(laws) {
    let list = laws;
    if (typeof list === "string") { try { list = JSON.parse(list); } catch { list = null; } }
    const entries = [];
    /* DEC-49 REGION is-laws-entry — D-149/C-73.2-5. The conditions on the LIST's own shape. */
    if (!Array.isArray(list) || !list.length)
      return withRow({ ok: false, reason: "NO_LAWS", legal_levels: LAW_LEVELS,
               detail: "the act names at least one law as {level, citation}. An action whose laws nobody has "
                     + "stated reads UNDETERMINED on its own; an empty list is not a statement." });
    if (list.length > GOVERNING_LAWS_MAX)
      return withRow({ ok: false, reason: "TOO_MANY_LAWS", count: list.length, max: GOVERNING_LAWS_MAX,
               detail: `one act states at most ${GOVERNING_LAWS_MAX} governing laws` });
    const seen = new Set();
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const level = e && typeof e === "object" ? String(e.level ?? "").trim() : "";
      const citation = e && typeof e === "object" && typeof e.citation === "string" ? e.citation.trim() : "";
      if (!LAW_LEVELS.includes(level))
        return withRow({ ok: false, reason: "BAD_LAW_LEVEL", index: i, level, legal: LAW_LEVELS,
                 detail: `laws[${i}].level is one of ${LAW_LEVELS.join(", ")}` });
      if (!citation || citation.length > CITATION_MAX || /["\\\r\n]/.test(citation))
        return withRow({ ok: false, reason: "BAD_CITATION", index: i,
                 detail: `laws[${i}].citation is 1 to ${CITATION_MAX} characters with no quote, backslash or `
                       + "newline: the restricted frontmatter grammar has no escapes" });
      const key = `${level}\u0000${citation.toLowerCase()}`;
      if (seen.has(key))
        return withRow({ ok: false, reason: "BAD_CITATION", index: i,
                 detail: `laws[${i}] repeats an earlier entry: a law is named once at its level` });
      seen.add(key);
      /* R64 (K1446): an entry may name a held standard; the citation stays the member's own statement. Whether the
         standard is one the caller may read is asked by each act once the action is found (R9). */
      const std = e.standard === undefined || e.standard === null || e.standard === "" ? null : String(e.standard).trim();
      entries.push({ level, citation, ...(std ? { standard: std } : {}) });
    }
    /* END DEC-49 REGION is-laws-entry */
    return { ok: true, entries };
  }

  /** R8 (was `actions` R23, its `BAD_RISK_TIER` site; C-90.2): the one site that answers a tier that is not 1, 2 or 3,
   *  for `actions.actionRiskTier` and for a proposal (R2) alike (one condition, one code). `who` names the stater ("the
   *  act", "a proposal"). Writes nothing. */
  badRiskTier(target, tier, who) {
    /* DEC-49 REGION is-bad-risk-tier */
    return refuse("BAD_RISK_TIER", `${who} states a tier of 1 (file freely), 2 (file with caution) or 3 (do not file `
      + "without counsel). Undetermined is what an action reads when nobody has assessed it, not a tier to set.",
      { target, tier: tier ?? null, legal: [1, 2, 3] });
    /* END DEC-49 REGION is-bad-risk-tier */
  }

  /** R9 (was `actions` R64, its "a standard the viewer may see" clause; K1446): null when `id` is a `STD-` id the viewer
   *  may read (`standards.standardRead`), else `standards.noSuchStandard`'s one answer, absent and invisible alike; a read
   *  that throws, or a host with no standards, is not seen. Writes nothing. */
  standardSeen(id, viewer) {
    const sid = typeof id === "string" ? id.trim() : "";
    const st = this.standards;
    let r = null;
    if (sid && BUNDLE_ID_RE.test(sid) && sid.startsWith("STD-") && st) {
      try { r = st.standardRead({ id: sid, viewer }); } catch { r = null; }
    }
    return r && r.ok ? null : noSuchStandard(sid || (typeof id === "string" ? id : null));
  }

  /** R10 (was `actions` R70, its judgment; R73): action-grammar's `seeksFindings` (its R13) over `fm`, with the facts read
   *  here through `progressions.readProgression`, once per distinct progression an item names: its declared stage keys,
   *  or null for a progression the record does not hold. A definition that cannot be read is read as not held (fail
   *  closed), and the refusal says so (`cause: "PROGRESSIONS_UNREADABLE"`). The refusal is the grammar's own (C-117.29),
   *  relayed with every finding; null when none. Writes nothing. */
  seeksRefusal(fm) {
    const stages = {};
    let unreadable = false;
    const items = fm && Array.isArray(fm.seeks) ? fm.seeks : [];
    for (const p of new Set(items.map((x) => (x && typeof x === "object" ? x.progression : null))
                              .filter((x) => typeof x === "string" && x.trim()))) {
      let r = null;
      try { r = this.progressions ? this.progressions.readProgression({ progressionKey: p }) : null; } catch { r = null; }
      if (!r || r.ok === false) { unreadable = true; stages[p] = null; continue; }
      stages[p] = r.found ? (r.stages || []).map((st) => st.stage_key) : null;
    }
    const found = [];
    seeksFindings(fm || {}, { stages }, found);
    const errors = found.filter((x) => x.severity === "error");
    if (!errors.length) return null;
    return refuse(errors[0].code, errors[0].message, { findings: findingsOf(errors),
      ...(unreadable ? { cause: "PROGRESSIONS_UNREADABLE" } : {}) });
  }

  /* ================================================================ proposals stored apart (R1–R3) */

  /** op=actionlawspropose — R1 (was `actions` R19; REC-195, D-149's remaining half; `BIO_Case_Making_v0_1.md` §2,
   *  *A RECORDS REQUEST NAMES EVERY LAW THAT GOVERNS IT*): A PROPOSAL OF CITATIONS AND LEVELS, STORED APART FROM THE
   *  MEMBER'S LIST AND LABELLED MACHINE WORK.
   *
   *  THE RULING'S OWN WORDS: *the machine may propose the list from the counterparty, labelled as machine work,
   *  and never sets it*. D-149 built the half that REFUSES (the machine fence at C-32.18); this is the proposal, and
   *  every line of it is about the difference between the two halves.
   *
   *  IT NEVER SETS THE LIST, AND THAT IS STRUCTURAL RATHER THAN POLICED. This method does not call `promote`, it
   *  writes no file, and it never touches `governing_laws`, `governing_laws_by` or `governing_laws_at`. The list
   *  is the member's and moves only through `actions.actionLaws`; the fence that keeps a revision from moving it
   *  (C-73.1) is untouched and unreachable from here, because nothing here writes bytes at all. This module's test of
   *  R1 holds that a proposal leaves the list as it stands.
   *
   *  ANY CREDENTIAL MAY PROPOSE, AND THE LABEL CARRIES THE MEANING — `themePropose`'s shape, for its reason
   *  (§8.4 fence 3). A fence admitting only machines would be a fence TIGHTER THAN ITS RULE: D-149 says a
   *  machine MAY propose, not that nobody else may, and a member's proposal to whoever states the list is a
   *  real act with an obvious surface. What the record owes is the LABEL, and `lawProposalLabel` composes it in
   *  one place so the plane answers the question rather than publishing an identity for a surface to judge.
   *
   *  THE WHOLE PROPOSAL, REPLACED, PER PROPOSER. A proposer restating replaces its OWN standing proposal and
   *  nobody else's: two machines proposing different lists are two proposals, and the record says who proposed
   *  which. There is no act that clears one and none that adopts one — adopting is `op=actionlaws`, which is a
   *  member's authored statement of the laws and not an acceptance of anybody's suggestion. **NOTHING HERE OR
   *  IN THE READ DERIVES A RELATION BETWEEN A PROPOSAL AND THE LIST**, even when they hold the same citations:
   *  that a member's list came FROM a machine's proposal is a claim about why somebody acted, and the record
   *  cannot support it. */
  actionLawsPropose({ target, laws = null, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who)
      return { ok: false, reason: "NO_AUTHOR",
               detail: "this call carries nobody. The plane stamps the proposer from the credential that "
                     + "asked, and a proposal nobody can be named for is one the record could say nothing "
                     + "about: the label IS the act." };
    if (!target)
      return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const read = this.lawEntries(laws);
    if (!read.ok) return read;
    const entries = read.entries;

    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type,
               detail: "governing laws belong to an action: they are the laws its request is made under." };
    /* R64, R19 (R9, R1 here): a proposal may name a held standard with a law; it is one the proposer may read. */
    for (const e of entries) {
      if (!e.standard) continue;
      const r = this.standardSeen(e.standard, viewer ?? who);
      if (r) return { ...r, target };
    }
    const at = stampInstant("second", this.#nowMs(null));
    /* REPLACE THIS PROPOSER'S OWN ROWS AND NOBODY ELSE'S. Keyed on both columns, never on the bundle alone; in one
       transaction, so a reader never sees the proposer's old list half replaced. */
    this.record.transact(() => {
      this.sql.exec(`DELETE FROM action_law_proposals WHERE bundle_id=? AND proposed_by=?`, target, who);
      entries.forEach((e, i) => this.sql.exec(
        `INSERT INTO action_law_proposals (bundle_id, proposed_by, ord, level, citation, standard, proposed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, target, who, i, e.level, e.citation, e.standard ?? null, at));
    });

    /* THE ACT'S OWN ANSWER SAYS WHAT IT DID NOT DO, read through the ONE reader of the list (`governingLawsOf`)
       so the act and the action's own read cannot disagree about whose the list is. */
    const liveMd = this.#one(`SELECT content FROM files WHERE bundle_id=? AND path='bundle.md'`, target);
    const fm = liveMd && liveMd.content !== null ? (parseFrontmatter(liveMd.content).data || {}) : null;
    const listed = governingLawsOf(fm);
    return { ok: true, target, weight: "single",
             proposal: { ...lawProposalLabel(who), at, laws: entries },
             governing_laws: listed, evidence: false,
             says: `${entries.length} citation${entries.length === 1 ? " is" : "s are"} proposed for this `
                 + `action. This is not the action's list of governing laws and did not change it: that list `
                 + `${listed.state === "stated" ? `is ${listed.laws.length} law(s) stated by a member` : "is UNDETERMINED"}`
                 + ", and only a member's own act states it." };
  }

  /** R2 (was `actions` R28; REC-215): a proposed tier, stored apart, labelled; it never touches `risk_tier` or its
   *  history. A proposer's restatement replaces its own proposal only. */
  actionRiskPropose({ target, tier = null, basis = null, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who) return { ok: false, reason: "NO_AUTHOR", detail: "this call carries nobody: the proposer is stamped from the credential that asked." };
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const asked = typeof tier === "string" && /^[123]$/.test(tier.trim()) ? Number(tier.trim()) : tier;
    if (asked !== 1 && asked !== 2 && asked !== 3) return this.badRiskTier(target, tier, "a proposal");
    const why = typeof basis === "string" ? basis.trim() : "";
    /* DEC-49 REGION is-risk-propose-basis */
    if (!why || why.length > RISK_PROPOSAL_BASIS_MAX || /["\\\r\n]/.test(why))
      return refuse("RISK_PROPOSAL_BASIS_REFUSED", `a proposed tier carries its basis: 1 to ${RISK_PROPOSAL_BASIS_MAX} `
        + "characters with no quote, backslash or line break", { target, max: RISK_PROPOSAL_BASIS_MAX });
    /* END DEC-49 REGION is-risk-propose-basis */
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const at = stampInstant("second", this.#nowMs(null));
    this.sql.exec(`INSERT INTO action_risk_proposals (bundle_id, proposed_by, tier, basis, proposed_at) VALUES (?,?,?,?,?)
      ON CONFLICT(bundle_id, proposed_by) DO UPDATE SET tier=excluded.tier, basis=excluded.basis, proposed_at=excluded.proposed_at`,
      target, who, asked, why, at);
    const held = riskTierState((this.#heldFm(target) || {}).risk_tier);
    return { ok: true, target, weight: "single", evidence: false,
             proposal: { ...proposalLabelFor(who, "risk_tier"), tier: asked, tier_words: RISK_TIERS[asked], basis: why, at },
             risk_tier: held, risk_tier_words: RISK_TIERS[held] ?? null,
             says: `a tier of ${asked} is proposed for this action. This is not the action's risk tier and did not change `
                 + `it: the tier is ${held === "undetermined" ? "undetermined" : held}, and only a member's own act sets it.` };
  }

  /** R3 (was `actions` R73; K2561; R10): a proposal of what a records request seeks, as R1 is to `actions.actionLaws`:
   *  stored apart, labelled, replacing only its proposer's own standing proposal; it writes no file and never changes
   *  `seeks`. Its items are judged as R10 judges a statement (`SEEKS_REFUSED`, C-117.29, every finding carried), on the
   *  target's own kind. */
  actionSeeksPropose({ target, seeks = null, proposer = null, viewer = null } = {}) {
    const who = String(proposer ?? "").trim();
    if (!who) return { ok: false, reason: "NO_AUTHOR", detail: "this call carries nobody: the proposer is stamped from the credential that asked." };
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action")
      return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const held = this.#heldFm(target) || {};
    let list = seeks;
    if (typeof list === "string") { try { list = JSON.parse(list); } catch { /* judged as given: not a list */ } }
    const asked = { action_kind: held.action_kind, seeks: list === undefined || list === null ? [] : list };
    const r = this.seeksRefusal(asked);
    if (r) return { ...r, target };
    const items = seeksOf(asked);
    const at = stampInstant("second", this.#nowMs(null));
    this.record.transact(() => {
      this.sql.exec(`DELETE FROM action_seeks_proposals WHERE bundle_id=? AND proposed_by=?`, target, who);
      items.forEach((x, i) => this.sql.exec(`INSERT INTO action_seeks_proposals (bundle_id, proposed_by, ord, progression,
        entity, stage, proposed_at) VALUES (?,?,?,?,?,?,?)`, target, who, i, x.progression, x.entity, x.stage, at));
    });
    const stated = seeksOf(held);
    return { ok: true, target, weight: "single", evidence: false,
             proposal: { ...proposalLabelFor(who, "seeks"), at, seeks: items },
             seeks: stated,
             says: `${items.length} stage${items.length === 1 ? " is" : "s are"} proposed as what this request seeks. This `
                 + `is not the action's seeks and did not change it: ${stated.length ? `it names ${stated.length} stage(s) a `
                 + "member stated" : "no member has stated what it seeks"}, and only a member's own write states it.` };
  }

  /** R1 (was `actions` R19, R25's share): the standing law proposals, newest first, at most `LAW_PROPOSALS_READ_MAX`
   *  proposers, with `truncated` and a sentence also when empty. Writes nothing. */
  lawProposalsFor(bundleId) {
    const cap = LAW_PROPOSALS_READ_MAX;
    const rowCap = (cap + 1) * GOVERNING_LAWS_MAX;
    const rows = this.#rows(
      `SELECT proposed_by, ord, level, citation, standard, proposed_at FROM action_law_proposals
        WHERE bundle_id=? ORDER BY proposed_at DESC, proposed_by, ord LIMIT ?`, bundleId, rowCap + 1);
    const byProposer = new Map();
    for (const r of rows) {
      if (!byProposer.has(r.proposed_by))
        byProposer.set(r.proposed_by, { ...lawProposalLabel(r.proposed_by), at: r.proposed_at, laws: [] });
      byProposer.get(r.proposed_by).laws.push({ level: r.level, citation: r.citation, ...(r.standard ? { standard: r.standard } : {}) });
    }
    const all = [...byProposer.values()];
    const proposals = all.slice(0, cap);
    const machine = proposals.filter((p) => p.machine_work).length;
    return {
      proposals, limit: cap, truncated: all.length > cap,
      says: proposals.length
        ? `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} of the laws that govern this `
          + `action, ${machine} of them machine work. A proposal is not this action's list of governing laws `
          + `and nothing here states which laws apply: the list is the member's own act, and it is stated `
          + `beside this one.`
        : "no proposal of the laws governing this action stands in the record. That is a statement about "
          + "proposals and about nothing else: whether any law governs this request is answered beside this, "
          + "and a member states it.",
    };
  }

  /** R2 (was `actions` R28): the standing tier proposals, newest first, at most `RISK_PROPOSALS_READ_MAX`, with
   *  `truncated` and a sentence also when empty. Writes nothing. */
  riskProposalsFor(id) {
    const cap = RISK_PROPOSALS_READ_MAX;
    const rows = this.#rows(`SELECT proposed_by, tier, basis, proposed_at FROM action_risk_proposals WHERE bundle_id=?
      ORDER BY proposed_at DESC, proposed_by LIMIT ?`, id, cap + 1);
    const proposals = rows.slice(0, cap).map((r) => ({ ...proposalLabelFor(r.proposed_by, "risk_tier"), tier: r.tier,
      tier_words: RISK_TIERS[r.tier] ?? null, basis: r.basis, at: r.proposed_at }));
    return { proposals, limit: cap, truncated: rows.length > cap,
             says: proposals.length
               ? `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} of this action's risk tier. A proposal is `
                 + "not the tier: the tier is the member's own act, stated beside this one."
               : "no proposal of this action's risk tier stands in the record. That is a statement about proposals and "
                 + "about nothing else." };
  }

  /** R3 (was `actions` R73): the standing proposals of what the request seeks, newest first, at most
   *  `SEEKS_PROPOSALS_READ_MAX`, with `truncated` and a sentence also when empty. Writes nothing. */
  seeksProposalsFor(id) {
    const cap = SEEKS_PROPOSALS_READ_MAX;
    const rows = this.#rows(`SELECT proposed_by, ord, progression, entity, stage, proposed_at FROM action_seeks_proposals
      WHERE bundle_id=? ORDER BY proposed_at DESC, proposed_by, ord LIMIT ?`, id, (cap + 1) * SEEKS_MAX + 1);
    const by = new Map();
    for (const r of rows) {
      if (!by.has(r.proposed_by)) by.set(r.proposed_by, { ...proposalLabelFor(r.proposed_by, "seeks"), at: r.proposed_at, seeks: [] });
      by.get(r.proposed_by).seeks.push({ progression: r.progression, entity: r.entity, stage: r.stage });
    }
    const all = [...by.values()];
    const proposals = all.slice(0, cap);
    return { proposals, limit: cap, truncated: all.length > cap,
             says: proposals.length
               ? `${proposals.length} proposal${proposals.length === 1 ? "" : "s"} of what this request seeks. A proposal is `
                 + "not the action's seeks: that is a member's own statement, shown beside this one."
               : "no proposal of what this request seeks stands in the record. That is a statement about proposals and "
                 + "about nothing else." };
  }

  /* ================================================================ members' side records (R4–R6) */

  /** R4 (was `actions` R80; T45; S1 §C 9; v0.2 rule 6): a member records that the `sent` entry at `ord` was received by
   *  the addressee (`receipt`) or that a party was served (`service`), how and when, held as a capture or her account
   *  (`actions` R34's rule). Its own table, appended; the ledger entry is never rewritten. `action-clocks` R2 reads it,
   *  through `actions.actionRead`, as the start of a count from receipt or service. */
  actionReceipt({ target, ord = null, kind = "receipt", at = "", how = "", party = "", artifactSha = "", account = "",
                  viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    const asked = { target: target ?? null, detail: RECEIPT_DETAIL };
    const fenced = correspondFence(who, asked);
    if (fenced) return fenced;
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const when = String(at ?? "").trim();
    const entryRefused = correspondEntryRefusal({ at: when, artifactSha, account, dateTime: true }, asked);
    if (entryRefused) return entryRefused;
    const sha = shaOf(artifactSha);
    const acct = String(account ?? "").trim();
    if (sha && !/^[0-9a-f]{64}$/.test(sha)) return { ok: false, reason: "BAD_SHA", target, detail: "artifact_sha is a sha256 hash (64 hex characters)" };
    const k = String(kind ?? "").trim() || "receipt";
    const h = String(how ?? "").trim(), pty = String(party ?? "").trim();
    for (const [name, v, need] of [["how", h, true], ["party", pty, k === "service"], ["account", acct, false]])
      if ((need && !v) || v.length > (name === "account" ? NOTE_MAX : RECEIPT_TEXT_MAX))
        return { ok: false, reason: `BAD_${name.toUpperCase()}`, target,
                 detail: `${name} is ${need ? "1" : "0"} to ${name === "account" ? NOTE_MAX : RECEIPT_TEXT_MAX} characters` };
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action") return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    const ledger = (this.#heldFm(target) || {}).correspondence;
    const n = typeof ord === "number" ? ord : /^\d+$/.test(String(ord ?? "").trim()) ? Number(String(ord).trim()) : NaN;
    const entry = Array.isArray(ledger) && Number.isInteger(n) ? ledger[n] : undefined;
    /* DEC-49 REGION is-receipt-on-sent */
    if (!entry || typeof entry !== "object" || entry.direction !== "sent" || !RECEIPT_KINDS.includes(k))
      return refuse("RECEIPT_NOT_ON_SENT", `a receipt is recorded on a sent entry of this action, as ${RECEIPT_KINDS.join(" or ")}; `
        + "the entry named is not a sent one. Nothing was written.", { target, ord: ord ?? null, legal: [...RECEIPT_KINDS] });
    /* END DEC-49 REGION is-receipt-on-sent */
    const unregistered = this.unregisteredArtifact(sha, { target, detail: RECEIPT_DETAIL });
    if (unregistered) return unregistered;
    const recorded = stampInstant("second", this.#nowMs(null));
    const seq = this.record.transact(() => {
      const next = this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM action_receipts WHERE bundle_id=? AND ord=?`, target, n).n;
      this.sql.exec(`INSERT INTO action_receipts (bundle_id, ord, seq, kind, at, how, party, artifact_sha, account, author,
        recorded_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`, target, n, next, k, when, h, pty || null, sha || null, acct || null,
        who, recorded);
      return next;
    });
    return { ok: true, target, ord: n, seq, kind: k, at: when, how: h, ...(pty ? { party: pty } : {}),
             held_as: sha ? "capture" : "testimony", ...(sha ? { artifact_sha: sha } : { account: acct }),
             author: who, recorded_at: recorded, weight: "single" };
  }
  /** R4 (`actions` R80, R25; K2845): every receipt record, oldest first, so an entry's latest is its last. */
  receiptsOf(id) {
    return this.#rows(`SELECT ord, seq, kind, at, how, party, artifact_sha, account, author, recorded_at
      FROM action_receipts WHERE bundle_id=? ORDER BY recorded_at, ord, seq`, id)
      .map((r) => ({ ord: r.ord, seq: r.seq, kind: r.kind, at: r.at, how: r.how, ...(r.party !== null ? { party: r.party } : {}),
        held_as: r.artifact_sha ? "capture" : "testimony", ...(r.artifact_sha ? { artifact_sha: r.artifact_sha } : { account: r.account }),
        by: r.author, recorded_at: r.recorded_at }));
  }

  /** R5 (was `actions` R87; T45; Actions D4; v0.2 rule 15): a member sets (`true`) or removes (`false`) the action's
   *  confidential scope, with a reason, each statement appended. A confidential action is seen inside the group as
   *  before and never answered by `actions` R66 or anything that feeds published output; the change never touches a
   *  signed edition (`publication` R63), the answer saying so (R14). */
  actionScope({ target, confidential = null, reason = "", viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    const why = String(reason ?? "").trim();
    /* DEC-49 REGION is-scope */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_SET_SCOPE", "whether an action is confidential is a member's act; a machine credential "
        + "may not set or remove it. Nothing was written.", { target: target ?? null });
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    const want = confidential === true || confidential === "true" ? 1 : confidential === false || confidential === "false" ? 0 : null;
    if (want === null) return { ok: false, reason: "BAD_SCOPE", target, legal: [true, false],
                                detail: "confidential is true (set the scope) or false (remove it)" };
    if (!why) return refuse("SCOPE_NO_REASON", "setting or removing an action's confidential scope carries the member's "
      + "reason. Nothing was written.", { target });
    if (why.length > NOTE_MAX || /["\\\r\n]/.test(why))
      return { ok: false, reason: "BAD_REASON", target, detail: `reason is at most ${NOTE_MAX} characters with no quote, backslash or line break` };
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action") return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    if (this.confidential(target) === !!want)
      return refuse("SCOPE_UNCHANGED", `this action is already ${want ? "confidential" : "not confidential"}; nothing was `
        + "written.", { target, confidential: !!want });
    /* END DEC-49 REGION is-scope */
    const at = stampInstant("second", this.#nowMs(null));
    this.record.transact(() => {
      const seq = this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM action_scopes WHERE bundle_id=?`, target).n;
      this.sql.exec(`INSERT INTO action_scopes (bundle_id, seq, confidential, reason, by, at) VALUES (?,?,?,?,?,?)`,
        target, seq, want, why, who, at);
    });
    return { ok: true, target, confidential: !!want, reason: why, by: who, at, scope: this.scopeOf(target),
             published: SCOPE_PUBLISHED_STAYS, weight: "single" };
  }
  /** R5 (`actions` R87, R66; K2850): whether the action's latest scope statement is confidential; false with none. */
  confidential(id) {
    const r = this.#one(`SELECT confidential FROM action_scopes WHERE bundle_id=? ORDER BY seq DESC LIMIT 1`, id);
    return !!(r && r.confidential);
  }
  /** R5 (`actions` R87, R25): the scope and its statements, oldest first. */
  scopeOf(id) {
    const statements = this.#rows(`SELECT seq, confidential, reason, by, at FROM action_scopes WHERE bundle_id=? ORDER BY seq`, id)
      .map((r) => ({ seq: r.seq, confidential: !!r.confidential, reason: r.reason, by: r.by, at: r.at }));
    return { confidential: statements.length ? statements[statements.length - 1].confidential : false, statements };
  }

  /** R6 (was `actions` R88; T45; Actions D4; v0.2 rule 15): a member records a promise the group made to a person
   *  (`PROMISE_KINDS`), or one ending an earlier promise (`ends`, its position, with `text` its reason). Appended, never
   *  edited; every viewer who may see the action reads every promise (through `actions.actionRead`); nothing published
   *  carries one (`actions` R66). */
  actionPromise({ target, kind = "", text = "", ends = null, viewer = null, author = null } = {}) {
    const who = String(author ?? "").trim();
    const k = String(kind ?? "").trim(), t = String(text ?? "").trim();
    const endsAt = ends === null || ends === undefined || ends === "" ? null
      : Number.isInteger(ends) ? ends : /^\d+$/.test(String(ends).trim()) ? Number(String(ends).trim()) : NaN;
    const kinds = PROMISE_KINDS;
    const promiseRefused = (why) => refuse("PROMISE_REFUSED", `${why} Nothing was written.`,
      { target: target ?? null, legal: [...kinds], max: PROMISE_TEXT_MAX });
    /* DEC-49 REGION is-promise */
    if (!who || isMachineIdentity(who))
      return refuse("MACHINE_CANNOT_RECORD_PROMISE", "a promise the group made to a person is recorded by a member; a "
        + "machine credential may not record one. Nothing was written.", { target: target ?? null });
    if (!target) return { ok: false, reason: "NO_TARGET", detail: "one action at a time: pass target=<action id>" };
    if (!kinds.includes(k) || !t || t.length > PROMISE_TEXT_MAX || Number.isNaN(endsAt))
      return promiseRefused(`a promise is {kind, text, ends?}: kind one of ${kinds.join(", ")}, the text 1 to `
        + `${PROMISE_TEXT_MAX} characters, and ends the position of an earlier promise it ends.`);
    const b = this.#visibleAction(target, viewer);
    if (!b) return { ok: false, reason: "NO_SUCH_BUNDLE", target };
    if (normalizeType(b.object_type) !== "action") return { ok: false, reason: "NOT_AN_ACTION", target, object_type: b.object_type };
    if (endsAt !== null && !this.promisesOf(target).standing.some((p) => p.seq === endsAt))
      return promiseRefused(`ends names promise ${endsAt}, and no promise standing on this action is at that position.`);
    /* END DEC-49 REGION is-promise */
    const at = stampInstant("second", this.#nowMs(null));
    const seq = this.record.transact(() => {
      const next = this.#one(`SELECT COALESCE(MAX(seq), 0) + 1 AS n FROM action_promises WHERE bundle_id=?`, target).n;
      this.sql.exec(`INSERT INTO action_promises (bundle_id, seq, kind, text, ends, by, at) VALUES (?,?,?,?,?,?,?)`,
        target, next, k, t, endsAt, who, at);
      return next;
    });
    return { ok: true, target, seq, kind: k, text: t, ...(endsAt !== null ? { ends: endsAt } : {}), by: who, at,
             promises: this.promisesOf(target), weight: "single" };
  }
  /** R6 (`actions` R88, R25): every promise on the action, standing apart from ended (one a later statement ends). */
  promisesOf(id) {
    const all = this.#rows(`SELECT seq, kind, text, ends, by, at FROM action_promises WHERE bundle_id=? ORDER BY seq`, id)
      .map((r) => ({ seq: r.seq, kind: r.kind, text: r.text, ...(r.ends !== null ? { ends: r.ends } : {}), by: r.by, at: r.at }));
    const ended = new Map(all.filter((p) => p.ends !== undefined).map((p) => [p.ends, p]));
    const notes = all.filter((p) => p.ends === undefined);
    return { standing: notes.filter((p) => !ended.has(p.seq)),
             ended: notes.filter((p) => ended.has(p.seq)).map((p) => ({ ...p, ended_by: ended.get(p.seq) })) };
  }
}

/* The acts answer their catalogue-backed refusals with code, check and translation (the Provides' "Terms"). */
for (const m of ["actionLawsPropose", "actionRiskPropose", "actionSeeksPropose", "actionReceipt", "actionScope", "actionPromise"]) {
  const fn = ActionRecords.prototype[m];
  ActionRecords.prototype[m] = function (...a) { return withRow(fn.apply(this, a)); };
}

/* R1–R3 (`actions` R19, R28, R73): the label of a proposal stored apart. The governing-laws sentence is action-grammar's
   `lawProposalLabel` (REC-195); the tier's and the seeks' says, in each state, what the proposal is not. */
const PROPOSAL_SAYS = {
  risk_tier: {
    machine_proposed: "a machine credential proposed this risk tier. That is machine work, labelled as machine work: it "
      + "can set a tier beside the action for members to weigh and it can never set the tier. Nothing here is this "
      + "action's risk tier, and nothing becomes it until a member states it themselves",
    member_proposed: "a member proposed this risk tier to whoever states it. It is a proposal and not the tier: only the "
      + "risk-tier act sets that, and the record holds who made the proposal",
    unstated: "the record does not say who proposed this risk tier",
  },
  seeks: {
    machine_proposed: "a machine credential proposed what this records request seeks. That is machine work, labelled as "
      + "machine work: it sets stages beside the action for members to weigh and never states what it seeks; nothing "
      + "becomes it until a member states it themselves",
    member_proposed: "a member proposed what this records request seeks to whoever states it. It is a proposal and not "
      + "the action's seeks: only a member's own write states that, and the record holds who made the proposal",
    unstated: "the record does not say who proposed what this records request seeks",
  },
};
function proposalLabelFor(who, subject) {
  const base = lawProposalLabel(who);
  return { by: base.by, state: base.state, machine_work: base.machine_work, says: PROPOSAL_SAYS[subject][base.state] };
}

const instances = new WeakMap();

/** R15 (K61; the map's §1; `case-account` R12's form): the one instance per host. At its creation it creates its six
 *  tables (R11) and declares them to record-core's purge; a refused declaration is thrown and no instance is kept.
 *  `actions`' factory creates it at its own creation, so its tables exist and are declared at every boot. */
export function actionRecordsOf(host, deps) {
  let r = instances.get(host);
  if (!r) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    const made = new ActionRecords({ ...d, host, storage, record });
    made.migrate();
    const declared = record.declarePurge("action-records", [...ACTION_RECORDS_TABLES]);
    if (declared && declared.ok === false)
      throw new Error(`action-records: its tables could not be declared (${declared.reason}: ${declared.detail ?? ""})`);
    instances.set(host, made);
    r = made;
  }
  return r;
}

/** R11: which purge declaration names one of this module's tables (record-core R21: each owner declares its own). */
export function actionRecordsOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return ACTION_RECORDS_TABLES.includes(name);
}

/** R15: the module's ops (K3), as entries of the plane's one route map (`plane` spreads them in, and control-plane's
 *  `dispatch` answers every store request over it), one arm per act, each argument read as `actions`' map read it: the
 *  target from the query, else the body; `viewer`, `author` and `proposer` the control plane's stamps, read from the
 *  query, so a caller's own copy never wins. The op names, their declarations, grades, help and stamps are unchanged. */
export function actionRecordsOps(r, url, body) {
  const q = (k) => url.searchParams.get(k);
  const b = body && typeof body === "object" ? body : {};
  return {
    actionlawspropose: () => r.actionLawsPropose({ target: q("target") || b.target, laws: b.laws, viewer: q("viewer"),
                                                   proposer: q("proposer") }),
    /* R3 (K2561): a proposal of what a records request seeks (declared and routed by L11). */
    actionseekspropose: () => r.actionSeeksPropose({ target: q("target") || b.target, seeks: b.seeks ?? q("seeks"),
                                                     viewer: q("viewer"), proposer: q("proposer") }),
    actionriskpropose: () => r.actionRiskPropose({ target: q("target") || b.target, tier: q("tier") ?? b.tier ?? null,
                                                   basis: q("basis") ?? b.basis ?? null, viewer: q("viewer"),
                                                   proposer: q("proposer") }),
    /* R4–R6 (T45): receipt or service of a sent entry, the confidential scope, a promise, each with the stamps the
       control plane makes (declared by op-declarations). */
    actionreceipt: () => r.actionReceipt({ target: q("target") || b.target, ord: q("ord") ?? b.ord ?? null,
      kind: q("kind") ?? b.kind ?? "receipt", at: q("at") ?? b.at ?? "", how: q("how") ?? b.how ?? "",
      party: q("party") ?? b.party ?? "", artifactSha: q("artifact_sha") ?? b.artifact_sha ?? "",
      account: q("account") ?? b.account ?? "", viewer: q("viewer"), author: q("author") }),
    actionscope: () => r.actionScope({ target: q("target") || b.target, confidential: q("confidential") ?? b.confidential ?? null,
      reason: q("reason") ?? b.reason ?? "", viewer: q("viewer"), author: q("author") }),
    actionpromise: () => r.actionPromise({ target: q("target") || b.target, kind: q("kind") ?? b.kind ?? "",
      text: q("text") ?? b.text ?? "", ends: q("ends") ?? b.ends ?? null, viewer: q("viewer"), author: q("author") }),
  };
}
