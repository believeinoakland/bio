/* case-account — a case's account (requirements: `build/requirements/case-account.md`; D56, D57, D58, D61, D63;
 * BIO_Investigation_v0_1.md §11). The written account of what a case's evidence shows, and the reviewers' comments a
 * publisher chooses to carry with it. The system drafts the account from the case's cited evidence, in one framing or
 * several (`accountPropose`, R1), and may flag the sentences of a member's account that the evidence they cite does not
 * support (`account_check`, R2); each draft is labelled as the system's, machine work when a machine proposed it, and is
 * never the case's account. The member writes the account, from a draft or from nothing; when she takes a draft up, how
 * she took it up is recorded (R4), and taking it up as proposed is refused. This module holds those drafts and
 * acceptances, the account's shape (R5) and the judgment of every sentence of the account and of the case's four
 * statements against what each cites (R6, through `case-disclosures` R30), the one reader of the review copies' comments
 * and the comments the publisher chose (R7). `case-authoring`'s `publishCase` and `publishPreflight` ask it in the order
 * case-authoring R69 states and write what it answers into the case document; this module writes no case document.
 *
 * (T45; v0.2 rules 9, 15; Actions D4, D6c, D11a) It also judges the outcomes a case carries into an edition as it judges
 * a statement (R6), checks a member's own text against the record and keeps it in their own hidden project only
 * (`advocacyCheck`, R13), and never reads anything held in a counsel matter as evidence outside it (R14).
 *
 * Split from `case-authoring` by copy (K624; N839, K2608; `build/extraction/case-account-split.md` §2): its R64, R66 and
 * R63's account share, each private method made public with its body unchanged (N529's form), the acceptance write as
 * `acceptanceRecorded`. Two changes in the copy, both the requirements': a draft is labelled through record-grammar's
 * `proposalLabel` with its R54 subjects (`case_account`, `account_check`; N838), and its id is minted opaque through
 * record-core's `allocId` (record-grammar R55, `legacy: "sequential"`, so the four-digit ids minted since T41 stay valid;
 * K2616). Copied and also kept in `case-authoring` (K57): `str`, `refusal`, `#rows`, `#one`, `#when`, `#liveText`,
 * `#preparedProject`, `COMPLETENESS_MAX`. The SQL is unchanged.
 *
 * REACHED as `caseAccountOf(host, deps)` (K61; R12): one instance per host, created on the first call with `deps`,
 * returned to every later caller. At creation it creates its two tables and declares them to record-core's purge (R8).
 * `review` registers its comments' reader here (`registerReviewComments`, R7; K31's pattern).
 * `deps` (each reached through its factory on the same host unless given; a test passes its own):
 *   record, membership   layer 2: `readFile`, `transact`, `allocId`, `declarePurge`; membership is held for its users.
 *   inquiry              `basisFor` (R6: a leg's words and the members' conclusions).
 *   runs                 ai-runs' `runFor`, the run a draft names (R1).
 *   disclosures          `case-disclosures`' `accountJudged` (its R30; R6): its one instance on this host.
 *   roster               `project-roster`'s `projectScope` (its R23; R13, R14): its one instance on this host.
 *   versions             `basis-versions`' `noProjectConclusionOf` (its R23; R13): its one instance on this host.
 *   checker              `case-checker`'s `checkAccount` (its R24; R13), pure: the import unless given.
 *   now                  the clock for the instants it writes, `(precision) => ISO string` (default: the wall clock).
 *
 * READ CONTRACTS it joins in its own SQL, each named at its statement: record-core's `bundles` (R37); publication's
 * `cases` and `case_documents` (R40); content's `content` (R45); extraction's `capture_text` (R58).
 *
 * NO SERVICE THROWS ON ANOTHER MODULE'S FAILED READ (R12): a read that throws is answered as R1–R7 state (a case not
 * seen, a run not found, a cite with no holding, a judgment undetermined, comments unread). */

import { recordOf, stampInstant } from "../record-core/index.mjs";
import { membershipOf, viewerPredicate, noSuchProject } from "../membership/index.mjs";
import { inquiryOf } from "../inquiry/index.mjs";
import { parseFrontmatter, proposalLabel, acceptanceRecord, ACCEPTANCE_FORMS, ACCEPT_MUST_REAUTHOR, SHARED_ACT_CHECKS,
         isMachineIdentity } from "../record-grammar/index.mjs";
/* R1: the run a draft came from, read as the proposer may see it (ai-runs' `runFor`). */
import { aiRunsOf } from "../ai-runs/index.mjs";
/* R5, R7 (D56, D61): case-grammar's cite kinds (its R23) and the review-comment block (its R25), the one spelling of each. */
import { reviewCommentsLines, ACCOUNT_CITE_KINDS } from "../case-grammar/index.mjs";
import { caseDisclosuresOf } from "../case-disclosures/index.mjs";
/* R13, R14 (T45): a project's scope (project-roster R23: `own`, `counsel_matter`), and the account check run over a
   member's own text (case-checker R24, pure). */
import { projectRosterOf } from "../project-roster/index.mjs";
import { checkAccount } from "../case-checker/index.mjs";
/* R13 (T45; K2829): a cited finding's own conclusion, its claim adopted or undetermined (basis-versions R23). */
import { basisVersionsOf } from "../basis-versions/index.mjs";
import { CASE_ACCOUNT_TABLES, migrateCaseAccount } from "./schema.mjs";
import { CASE_ACCOUNT_CHECKS } from "./checks.mjs";

export { CASE_ACCOUNT_SCHEMA, CASE_ACCOUNT_TABLES } from "./schema.mjs";
export { CASE_ACCOUNT_CHECKS } from "./checks.mjs";
export { reviewCommentBodyLines } from "./document.mjs";

/** R5: a sentence's longest text, in code points: case-authoring's R3 bound, a K57 copy (as `case-disclosures` holds one). */
export const COMPLETENESS_MAX = 2000;
/** R5 (D56): the most sentences one account holds. */
export const ACCOUNT_SENTENCES_MAX = 200;
/** R5: the most cites one sentence names. */
export const ACCOUNT_CITES_MAX = 50;
/** R1 (D56; run-rules R25): the framings a system draft of the account is written in: time order, by question, by rule. */
export const ACCOUNT_FRAMINGS = Object.freeze(["time_order", "by_question", "by_rule"]);
/** R1: the longest draft of an account, in code points. */
export const ACCOUNT_DRAFT_MAX = 8000;
/** R3: the most drafts one list names (`truncated` when there are more). */
export const ACCOUNT_DRAFTS_MAX = 500;
/** R1 (record-grammar R55): the prefix of an account draft's opaque id, minted through record-core's `allocId`. */
export const ACCOUNT_DRAFT_PREFIX = "ACD";
/** R4 (record-grammar R52): the kind an accepted account draft is recorded under (run-rules R25's draft kind). */
export const ACCOUNT_ACCEPT_KIND = "case_account";
/** R7 (D61): the most review comments one act names in `reviewComments.included`. */
export const REVIEW_COMMENTS_INCLUDED_MAX = 500;
/** R13: what each sentence of a member's own text is answered: held up by what it cites, not, contradicted by the
 *  record, or not known (a check that could not run is never `supported`). */
export const ADVOCACY_RESULTS = Object.freeze(["supported", "not_supported", "contradicted", "undetermined"]);
/** R13: the most checks one list of a project's advocacy checks names (`truncated` when there are more). */
export const ADVOCACY_CHECKS_MAX = 200;
/** R14 (v0.2 rule 15): the scope of a project whose material is never evidence outside it (project-roster R21, R23). */
export const COUNSEL_MATTER = "counsel_matter";
const str = (v) => String(v ?? "").trim();

/* R5 (D56; case-grammar R23): one cite `{kind, ref, ord}`, `kind` one of case-grammar's `ACCOUNT_CITE_KINDS` (a finding,
   a leg of one with its `ord`, a passage by its `content_id`, a material by its `materials:` ref); null when malformed. */
function citeOf(c) {
  if (!c || typeof c !== "object" || Array.isArray(c)) return null;
  const kind = str(c.kind), ref = str(c.ref);
  if (!ACCOUNT_CITE_KINDS.includes(kind) || !ref || ref.length > 200 || /["\\\r\n]/.test(ref)) return null;
  if (kind === "leg") return Number.isInteger(c.ord) && c.ord >= 1 ? { kind, ref, ord: c.ord } : null;
  return c.ord == null ? { kind, ref, ord: null } : null;
}
/* R5: a list of cites, at most `ACCOUNT_CITES_MAX`, each `citeOf`'s; null when malformed. */
function citesOf(v) {
  if (v == null) return [];
  if (!Array.isArray(v) || v.length > ACCOUNT_CITES_MAX) return null;
  const out = v.map(citeOf);
  return out.every(Boolean) ? out : null;
}
/** R5 (D56; K2533): `account` (`[{text, cites, bias_statement?}]`, absent read as none) and `statementCites` (`{statement,
 *  subject_justification, excluded: [per item], what_changed}`, each a list of cites, absent read as none) in their
 *  shapes, or `BAD_ACCOUNT` / `BAD_STATEMENT_CITES` naming the field. A sentence is words, at most `COMPLETENESS_MAX`
 *  code points, and carries no other field (a story has none to hide in, case-authoring R65); its `bias_statement`, when
 *  given, names the printed bias statement whose framing it follows (D58). */
export function accountShaped(account, statementCites, excludedCount = 0) {
  const bad = (reason, field, detail) => ({ ok: false, reason, field, detail: `${field}: ${detail} Nothing was written.` });
  const sentences = [];
  if (account != null) {
    if (!Array.isArray(account)) return bad("BAD_ACCOUNT", "account", "the account is a list of sentences, each {text, cites, bias_statement?}.");
    if (account.length > ACCOUNT_SENTENCES_MAX)
      return bad("BAD_ACCOUNT", "account", `an account is at most ${ACCOUNT_SENTENCES_MAX} sentences.`);
    for (let i = 0; i < account.length; i++) {
      const e = account[i], f = `account[${i}]`;
      if (!e || typeof e !== "object" || Array.isArray(e)) return bad("BAD_ACCOUNT", f, "a sentence is {text, cites, bias_statement?}.");
      const extra = Object.keys(e).filter((k) => !["text", "cites", "bias_statement"].includes(k) && e[k] !== undefined);
      if (extra.length) return bad("BAD_ACCOUNT", `${f}.${extra[0]}`, "a sentence carries its words, what it cites and the bias "
        + "statement its framing follows, and nothing else.");
      if (typeof e.text !== "string" || !e.text.trim() || [...e.text].length > COMPLETENESS_MAX || /[\r\n]/.test(e.text))
        return bad("BAD_ACCOUNT", `${f}.text`, `a sentence is words on one line, at most ${COMPLETENESS_MAX} characters.`);
      const cites = citesOf(e.cites);
      if (!cites) return bad("BAD_ACCOUNT", `${f}.cites`, `cites is a list of at most ${ACCOUNT_CITES_MAX} {kind, ref, ord}, kind `
        + `one of ${ACCOUNT_CITE_KINDS.join(", ")}, ord the leg's for a leg and absent otherwise.`);
      const framing = e.bias_statement == null ? null : str(e.bias_statement);
      if (e.bias_statement != null && (!framing || framing.length > 200 || /["\\\r\n]/.test(framing)))
        return bad("BAD_ACCOUNT", `${f}.bias_statement`, "names the printed bias statement whose framing the sentence follows.");
      sentences.push({ text: e.text.trim(), cites, bias_statement: framing });
    }
  }
  const sc = { statement: [], subject_justification: [], excluded: [], what_changed: [] };
  if (statementCites != null) {
    if (typeof statementCites !== "object" || Array.isArray(statementCites))
      return bad("BAD_STATEMENT_CITES", "statementCites", "is {statement, subject_justification, excluded, what_changed}.");
    for (const k of Object.keys(statementCites)) {
      if (statementCites[k] === undefined) continue;
      if (!(k in sc)) return bad("BAD_STATEMENT_CITES", `statementCites.${k}`, "names no statement.");
      if (k === "excluded") {
        const v = statementCites[k];
        if (!Array.isArray(v) || v.length > excludedCount)
          return bad("BAD_STATEMENT_CITES", "statementCites.excluded", "is one list of cites per exclusion row, in its order.");
        for (let i = 0; i < v.length; i++) {
          const c = citesOf(v[i]);
          if (!c) return bad("BAD_STATEMENT_CITES", `statementCites.excluded[${i}]`, "is a list of {kind, ref, ord} cites.");
          sc.excluded.push(c);
        }
      } else {
        const c = citesOf(statementCites[k]);
        if (!c) return bad("BAD_STATEMENT_CITES", `statementCites.${k}`, "is a list of {kind, ref, ord} cites.");
        sc[k] = c;
      }
    }
  }
  return { ok: true, sentences, statementCites: sc };
}
/* R6: a cite's holding address, `kind:ref`, a leg's `#ord` after it. */
const citeAddress = (c) => `${c.kind}:${c.ref}${c.kind === "leg" ? `#${c.ord}` : ""}`;
/* R6 (case-authoring R14's body): an exclusion row as the body prints it, the sentence R30 judges. */
const exclusionSentence = (r) => `${r.target ? r.target + " — " : ""}${r.description || "(named above)"}: ${r.reason}`;
/* R6: the `ord`s of the account's rows a refusal of case-disclosures R30 names: its `sentences` (each an ord or a row
   with one), else its `ord`. */
function namedOrds(r) {
  const list = Array.isArray(r.sentences) ? r.sentences : r.ord != null ? [r.ord] : [];
  return list.map((x) => (x && typeof x === "object" ? x.ord : x)).filter((x) => Number.isInteger(x));
}

/* The one constructor of a refusal with a catalogue row (DEC-49): `reason` and `code` carry the same literal, and the
   row's `check` and `translation` join the site's own `detail` and keys. */
function refusal(family, key, extra = {}) {
  const row = family[key];
  return { ok: false, reason: key, code: key, check: row.check, translation: row.translation, ...extra };
}

export class CaseAccount {
  #deps;

  constructor({ storage, record, membership = null, host = null, inquiry = null, runs = null, disclosures = null,
                roster = null, versions = null, checker = null, now = null } = {}) {
    this.sql = storage.sql;
    this.storage = storage;
    this.record = record;
    this.#deps = { host, membership, inquiry, runs, disclosures, roster, versions, checker };
    this.now = typeof now === "function" ? now : (precision) => stampInstant(precision);
  }

  /* The modules reached lazily: each is created on the same host on first use, unless a test passed its own. */
  get membership() { return this.#deps.membership ||= membershipOf(this.#deps.host, { record: this.record }); }
  get inquiry() { return this.#deps.inquiry ||= inquiryOf(this.#deps.host); }
  /* R1: the runs a draft names (ai-runs' `runFor`, as the proposer may see them). */
  get runs() { return this.#deps.runs ||= aiRunsOf(this.#deps.host); }
  /* R6: `case-disclosures`, the one instance on this host (its R30). */
  get disclosures() { return this.#deps.disclosures ||= caseDisclosuresOf(this.#deps.host); }
  /* R13, R14: `project-roster`, the one instance on this host (its R23's `projectScope`). */
  get roster() { return this.#deps.roster ||= projectRosterOf(this.#deps.host, { record: this.record }); }
  /* R13: `basis-versions`, the one instance on this host (its R23's `noProjectConclusionOf`). */
  get versions() { return this.#deps.versions ||= basisVersionsOf(this.#deps.host, { record: this.record }); }
  /* R13: case-checker's `checkAccount` (its R24, pure), imported unless a test passes its own. */
  get checker() { return this.#deps.checker ||= { checkAccount }; }

  migrate() { migrateCaseAccount(this.sql); }

  #rows(q, ...a) { return [...this.sql.exec(q, ...a)]; }
  #one(q, ...a) { for (const r of this.sql.exec(q, ...a)) return r; return null; }
  /* The act's instant, from the clock it was given. */
  #when(precision) { const w = this.now(precision); return typeof w === "string" ? w : stampInstant(precision); }

  /* The live `bundle.md` text of a held bundle, or null (blob-backed or absent): record-core R13. */
  #liveText(id) {
    const f = this.record.readFile(id, "bundle.md");
    return f && typeof f.text === "string" ? f.text : null;
  }

  /* The project an unsigned preparation of a case names, or null (publication R40: `case_documents`). */
  #preparedProject(caseId) {
    const d = this.#one(`SELECT text FROM case_documents WHERE case_id=? AND sig_armored IS NULL
                         ORDER BY edition DESC LIMIT 1`, caseId);
    const named = d ? str((parseFrontmatter(d.text).data || {}).case_project) : "";
    return named || null;
  }

  /* R1, R6, R14: the project that owns a case: published (publication R40's `cases`), else its unsigned preparation's
     `case_project`; null when neither names one. A read that throws is the caller's to catch. */
  #caseProject(caseId) {
    return this.#one(`SELECT project_id FROM cases WHERE case_id=?`, caseId)?.project_id ?? this.#preparedProject(caseId);
  }

  /** R5: `accountShaped` reached on the instance, as `case-authoring`'s `publishCase` and `publishPreflight` ask it
   *  (`this.account.accountShaped`); the module's export, never a copy. */
  accountShaped(account, statementCites, excludedCount = 0) { return accountShaped(account, statementCites, excludedCount); }

  /** R4 (D56; record-grammar R52): the draft the account began as, `accountDraft` naming one of this case's
   *  `case_account` drafts by id, or `{draft, form}`. Answers `{ok: true, draft, framing, form}` (all null when none is
   *  named) or the refusal: `BAD_ACCOUNT` (a malformed name or form, or a draft named for an act that writes no account),
   *  `NO_SUCH_ACCOUNT_DRAFT` (not a draft of this case), `ACCEPT_MUST_REAUTHOR` (record-grammar's shared row: taken up as
   *  proposed, the form given or the sentences the draft's words unchanged). The form, when not given, is `edited`.
   *  Writes nothing. */
  accountDraftJudged(accountDraft, caseId, sentences) {
    const none = { ok: true, draft: null, framing: null, form: null };
    if (accountDraft == null || accountDraft === "") return none;
    const named = typeof accountDraft === "string" ? accountDraft
      : accountDraft && typeof accountDraft === "object" && !Array.isArray(accountDraft) ? accountDraft.draft : null;
    const given = accountDraft && typeof accountDraft === "object" ? accountDraft.form ?? null : null;
    const bad = (field, detail) => ({ ok: false, reason: "BAD_ACCOUNT", field, detail: `${field}: ${detail} Nothing was written.` });
    if (typeof named !== "string" || !named.trim()) return bad("accountDraft", "names an account draft by its id, or {draft, form}.");
    if (given !== null && !ACCEPTANCE_FORMS.includes(given))
      return bad("accountDraft.form", `is one of ${ACCEPTANCE_FORMS.join(", ")}.`);
    if (!Array.isArray(sentences) || !sentences.length)
      return bad("accountDraft", "names the draft an account began as, and this act writes no account.");
    const d = this.#one(`SELECT draft_id, text, framing FROM account_drafts WHERE draft_id=? AND case_id=? AND kind='case_account'`,
                        named.trim(), caseId);
    if (!d)
      return { ok: false, reason: "NO_SUCH_ACCOUNT_DRAFT", caseId, draft: named.trim(),
               detail: `no draft of ${caseId}'s account answers to ${named.trim()} (accountDrafts lists them). Name one of them, `
                     + "or write the account from nothing and publish again. Nothing was written." };
    const words = (t) => String(t ?? "").replace(/\s+/g, " ").trim();
    const unchanged = words(d.text) === words(sentences.map((x) => x.text).join(" "));
    const form = given === "own_instead" ? "own_instead" : unchanged ? "as_proposed" : given ?? "edited";
    /* DEC-49 REGION is-account-reauthored */
    if (form === "as_proposed")
      return refusal(SHARED_ACT_CHECKS, ACCEPT_MUST_REAUTHOR, { draft: d.draft_id, caseId,
        detail: `the account is draft ${d.draft_id}'s words as the system proposed them. The published account is the `
              + "member's own (D56): write it in your words, from the draft or from nothing, and publish again. Nothing "
              + "was written." });
    /* END DEC-49 REGION is-account-reauthored */
    return { ok: true, draft: d.draft_id, framing: d.framing ?? null, form };
  }

  /** R4 (record-grammar R52), R9: the member's acceptance of the draft her account began as, `drafted` being what
   *  `accountDraftJudged` answered, written in record-grammar's one shape with the case, edition, draft and form,
   *  through `record-core.transact`, so it joins the caller's transaction and rolls back with it. With no draft named it
   *  writes nothing. Answers `{ok: true, acceptance}` (the record written, or null). Acceptances are append-only. */
  acceptanceRecorded({ caseId, edition, drafted = null, by, at } = {}) {
    if (!drafted || !drafted.draft) return { ok: true, acceptance: null };
    return this.record.transact(() => {
      const accepted = acceptanceRecord({ proposal: drafted.draft, form: drafted.form, by, at, kind: ACCOUNT_ACCEPT_KIND });
      this.sql.exec(`INSERT INTO account_acceptances (case_id, edition, draft_id, form, record, at) VALUES (?,?,?,?,?,?)`,
                    caseId, edition, drafted.draft, drafted.form, JSON.stringify(accepted), at);
      return { ok: true, acceptance: accepted };
    });
  }

  /** R6 (D56–D58, D63; K2531, K2533): `case-grammar` R23's rows — each sentence of the account (`kind: account`, in its
   *  order), then the four statements (`statement`, `subject_justification`, one `excluded` row per exclusion as the body
   *  prints it, `what_changed` for an edition above 1), each with its cites — judged by `case-disclosures` R30
   *  (`accountJudged`) against what they cite as `viewer` reads it, the lens in force the caller passes, the members'
   *  conclusions and the system's `account_check` flags on this case. Answers `{rows, refusals, results, flags, refusal}`:
   *  `results` maps each row's `ord` to the codes naming it (empty: it passed); `refusal` the first, or null. A judgment
   *  that throws or answers no list is `ACCOUNT_CHECK_UNDETERMINED` (fail closed, K2531). Writes nothing.
   *  (T45; D6c, D63) `outcomes: [{outcome, text, cites}]`, the outcomes case-authoring R71 carries into this edition, are
   *  rows after the four statements, `kind: outcome`, judged as a statement is; a refusal naming one carries `outcomes`,
   *  the outcomes it names. (T45; R14) A cite of something held in a counsel matter other than the case's owning project
   *  has no holding, and its sentences are refused `ACCOUNT_CITES_COUNSEL_MATTER` (C-153.1), first among `refusals`. */
  accountJudged({ sentences, statementCites, drafted = null, statement, justification, excluded, changed = null,
                  outcomes = null, prepared, reached, lens, caseId, viewer }) {
    const began = drafted && drafted.draft && drafted.form === "edited"
      ? { began_as: "machine_draft", draft: drafted.draft } : { began_as: "member", draft: null };
    const sc = statementCites || { statement: [], subject_justification: [], excluded: [], what_changed: [] };
    const rows = [];
    let ord = 0;
    for (const x of sentences || []) rows.push({ ord: ++ord, text: x.text, cites: x.cites, kind: "account",
                                                 bias_statement: x.bias_statement ?? null, ...began });
    /* a blank statement is no sentence to judge: case-authoring R3 refuses it first (the pre-flight's own read may still meet one) */
    const stated = (kind, text, cites, origin = { began_as: "member", draft: null }) => {
      if (typeof text === "string" && text.trim()) rows.push({ ord: ++ord, text, cites: cites || [], kind, bias_statement: null, ...origin });
    };
    stated("statement", statement, sc.statement);
    stated("subject_justification", justification, sc.subject_justification);
    (excluded || []).forEach((r, i) => stated("excluded", exclusionSentence(r), (sc.excluded || [])[i]));
    if (changed && changed.ok !== false)
      stated("what_changed", changed.text, sc.what_changed,
             changed.began_as === "machine_draft" ? { began_as: "machine_draft", draft: changed.draft } : undefined);
    /* (T45; D6c; D63) the outcomes case-authoring R71 carries into this edition, after the four statements, each judged
       as a statement is (`kind: outcome`, case-grammar R23 as amended), naming its outcome. Absent is none. An entry this
       module cannot read as one is not dropped: it is handed on as given, so case-disclosures R30 refuses it (its
       BAD_COMPLETENESS) and the account never passes over an outcome nobody judged. */
    for (const o of Array.isArray(outcomes) ? outcomes : outcomes == null ? [] : [outcomes]) {
      const ok = o && typeof o === "object" && !Array.isArray(o);
      const cites = ok ? citesOf(o.cites) ?? o.cites : [];
      rows.push({ ord: ++ord, text: ok ? o.text : null, cites, kind: "outcome", bias_statement: null, began_as: "member",
                  draft: null, outcome: ok && o.outcome != null ? String(o.outcome) : null });
    }
    const members = Array.isArray(prepared) ? prepared : [];
    let forProject = null;
    try { forProject = caseId ? this.#caseProject(caseId) : null; } catch { forProject = null; }
    const held = this.#held(rows, reached, viewer, forProject);
    const cited = { holdings: held.filter((h) => h.quote && !h.counsel).map((h) => ({ address: h.address, quote: h.quote })),
                    rules: [], looks: [] };
    const conclusions = members.map((p) => {
      /* R12: a basis that cannot be read is answered as no legs, never thrown */
      let basis = null;
      try { basis = this.inquiry.basisFor(p.id); } catch { basis = null; }
      const claim = p.conclusion && p.conclusion.claim ? p.conclusion.claim : null;
      return { finding: p.id, claim: claim && claim.text != null ? claim.text : null, claim_state: claim ? claim.state ?? null : null,
               legs: basis && basis.ok !== false && Array.isArray(basis.legs) ? basis.legs : [] };
    });
    const flags = caseId ? this.accountFlags(caseId, drafted && drafted.draft ? drafted.draft : null) : [];
    let judged = null;
    try {
      judged = this.disclosures.accountJudged({ account: rows.filter((r) => r.kind === "account"),
        statements: rows.filter((r) => r.kind !== "account"), cited, lens, conclusions, flags, viewer });
    } catch (e) { judged = { why: String(e && e.message || e).slice(0, 160) }; }
    const judgedRefusals = judged && Array.isArray(judged.refusals) ? judged.refusals.filter((r) => r && typeof r === "object")
      : [{ ok: false, reason: "ACCOUNT_CHECK_UNDETERMINED", code: "ACCOUNT_CHECK_UNDETERMINED",
           detail: "the account could not be checked against what it cites"
                 + (judged && judged.why ? ` (${judged.why})` : "") + ", so whether every sentence stands is not known. "
                 + "Try again. Nothing was written." }];
    /* R14: a sentence citing a counsel matter's material, first, naming each sentence and the cites; then the judgment's */
    const counsel = this.#counselRefusal(rows, held);
    /* an outcome row's refusal names the outcome, as a statement's names its kind */
    const outcomeOf = new Map(rows.filter((r) => r.kind === "outcome").map((r) => [r.ord, r.outcome]));
    const refusals = [...(counsel ? [counsel] : []), ...judgedRefusals].map((r) => {
      const named = namedOrds(r).filter((o) => outcomeOf.has(o));
      return named.length ? { ...r, outcomes: [...new Set(named.map((o) => outcomeOf.get(o)))] } : r;
    });
    const results = new Map(rows.map((r) => [r.ord, []]));
    for (const r of refusals) for (const o of namedOrds(r)) if (results.has(o)) results.get(o).push(r.code ?? r.reason);
    return { rows, refusals, results, flags, refusal: refusals[0] ?? null };
  }

  /** R2 (K2531, K2536): the `account_check` flags the system raised on `caseId`'s account (R1's table), in proposal
   *  order: every one proposed after the `case_account` draft `afterDraft` names, or all of them with none named; each
   *  `{kind: "account_check", ord, text, cites}`. Writes nothing. */
  accountFlags(caseId, afterDraft = null) {
    const out = [];
    const after = afterDraft ? this.#one(`SELECT seq FROM account_drafts WHERE draft_id=?`, afterDraft)?.seq ?? 0 : 0;
    for (const r of this.#rows(`SELECT flags FROM account_drafts WHERE case_id=? AND kind='account_check' AND seq>?
                                ORDER BY seq`, caseId, after)) {
      let f = null;
      try { f = JSON.parse(r.flags); } catch { f = null; }
      for (const x of Array.isArray(f) ? f : []) out.push({ kind: "account_check", ord: x.ord ?? null, text: x.text ?? null,
                                                             cites: Array.isArray(x.cites) ? x.cites : [] });
    }
    return out;
  }

  /** R6 (case-disclosures R30; answers its R33's `{holdings, rules, looks}`): what the rows cite, as `viewer` reads it,
   *  one holding per distinct cite, its `address` the cite spelled `kind:ref` (a leg's `#ord` after it) so a row's cites
   *  find their holdings, its `quote` the cited thing's own words: a finding's text (record-core R13), a leg as its basis
   *  states it (inquiry's `basisFor`), a passage's text (content R45's unit, extraction R58's indexed text), a material's
   *  indexed text (`case-disclosures` R6's materials, as the caller reached them). A cite the viewer cannot read, or that
   *  names nothing held, has no holding, so its sentence rests on nothing read. (T45; R14) Nor has a cite of something
   *  held in a counsel matter other than `forProject`, the project the act is for. Writes nothing. */
  citedFor(rows, prepared, reached, viewer, forProject = null) {
    void prepared;
    const holdings = this.#held(rows, reached, viewer, forProject).filter((h) => h.quote && !h.counsel)
      .map((h) => ({ address: h.address, quote: h.quote }));
    return { holdings, rules: [], looks: [] };
  }

  /* R6, R13, R14: each distinct cite of `rows`, `{cite, address, quote, counsel, finding}`: `quote` as `citedFor` states
     it ("" when the viewer cannot read it or it names nothing held); `counsel` true when what it names is held in a
     project whose scope `project-roster` R23 answers `counsel_matter` and that is not `forProject` (R14: never read as
     evidence; its quote is not read); `finding` the finding a finding or leg cite names. A read that fails holds
     nothing (R12). Writes nothing. */
  #held(rows, reached, viewer, forProject) {
    const gate = viewerPredicate(viewer);
    const seenBy = (id) => gate.scope !== "DENY"
      && !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
    const indexed = (sha, extent = null) => this.#rows(`SELECT text FROM capture_text WHERE capture_sha=?`
      + (extent ? ` AND extent=?` : ``) + ` ORDER BY seq`, ...(extent ? [sha, extent] : [sha]))
      .map((r) => r.text).filter((t) => typeof t === "string").join("\n");
    const materials = (reached && Array.isArray(reached.materials)) ? reached.materials : [];
    /* R14: the project a held bundle belongs to (record-core R34's `project`), and whether it is another counsel matter */
    const scopes = new Map();
    const counselHeld = (bundleId) => {
      const project = bundleId ? this.#one(`SELECT project FROM bundles WHERE bundle_id=?`, bundleId)?.project ?? null : null;
      /* a bundle the viewer cannot see is answered as one with no holding, never as a counsel matter's (it names none) */
      if (!project || project === forProject || !seenBy(bundleId)) return false;
      if (!scopes.has(project)) {
        let scope = null;
        try { scope = this.roster.projectScope(project)?.scope ?? null; } catch { scope = null; }
        scopes.set(project, scope);
      }
      return scopes.get(project) === COUNSEL_MATTER;
    };
    const out = [], done = new Set();
    for (const c of (rows || []).flatMap((r) => (Array.isArray(r.cites) ? r.cites : []))) {
      if (!c || typeof c !== "object" || !c.kind || !c.ref) continue;
      const address = citeAddress(c);
      if (done.has(address)) continue;
      done.add(address);
      let quote = "", counsel = false;
      try {
        /* DEC-49 REGION is-cite-counsel-matter */
        if (c.kind === "finding" || c.kind === "leg") counsel = counselHeld(c.ref);
        else if (c.kind === "passage") counsel = counselHeld(this.#one(`SELECT bundle_id FROM content WHERE content_id=?`, c.ref)?.bundle_id);
        else if (c.kind === "material") counsel = counselHeld(c.ref);
        /* END DEC-49 REGION is-cite-counsel-matter */
        if (counsel) quote = "";
        else if (c.kind === "finding") quote = seenBy(c.ref) ? this.#liveText(c.ref) ?? "" : "";
        else if (c.kind === "leg") {
          const basis = seenBy(c.ref) ? this.inquiry.basisFor(c.ref) : null;
          const leg = basis && basis.ok !== false && Array.isArray(basis.legs) ? basis.legs[c.ord - 1] : null;
          quote = leg ? JSON.stringify(leg) : "";
        } else if (c.kind === "passage") {
          const u = this.#one(`SELECT capture_sha, bundle_id, extent FROM content WHERE content_id=?`, c.ref);
          quote = u && seenBy(u.bundle_id) ? indexed(u.capture_sha, u.extent) : "";
        } else if (c.kind === "material") {
          const m = materials.find((x) => x.ref === c.ref);
          quote = m && m.sha ? indexed(m.sha) : "";
        }
      } catch { quote = ""; }
      out.push({ cite: c, address, quote, counsel,
                 finding: c.kind === "finding" || c.kind === "leg" ? c.ref : null });
    }
    return out;
  }

  /* R14: the one refusal naming every row that cites a counsel matter's material, with the cites, in its row's words
     (C-153.1); null when none does. */
  #counselRefusal(rows, held) {
    const counsel = new Set(held.filter((h) => h.counsel).map((h) => h.address));
    if (!counsel.size) return null;
    const named = rows.map((r) => ({ ord: r.ord, kind: r.kind, text: r.text,
      cites: [...new Set((Array.isArray(r.cites) ? r.cites : []).filter((c) => c && typeof c === "object" && c.kind && c.ref)
        .map(citeAddress).filter((a) => counsel.has(a)))] })).filter((r) => r.cites.length);
    return refusal(CASE_ACCOUNT_CHECKS, "ACCOUNT_CITES_COUNSEL_MATTER", { sentences: named, cites: [...counsel],
      detail: `${named.map((r) => `sentence ${r.ord} cites ${r.cites.join(", ")}`).join("; ")}: held in a counsel matter, `
            + "which is never used as evidence outside it. Cite something else, or leave it out. Nothing was written." });
  }

  /** R7 (D61; review R33, K2483): the reviewers' comments the publisher chose (`reviewComments: {included: [ids]}`),
   *  read through the one reader `registerReviewComments` holds, asked `{case, edition, viewer, draft}`. Answers
   *  `{ok: true, carried, left_out, block, body}` — `left_out` a count, or null when undetermined (none registered, or a
   *  list cut at its bound or unread with nothing chosen) — or the refusal: `BAD_REVIEW_COMMENTS` (malformed),
   *  `REVIEW_COMMENTS_UNREAD` (comments chosen and the list could not be read), `REVIEW_COMMENT_NOT_FOUND` (an id not
   *  among the case's comments, named). With none registered no comment travels. Writes nothing. */
  reviewCommentsChosen(reviewComments, caseId, edition, viewer, draft) {
    const bad = (detail) => ({ ok: false, reason: "BAD_REVIEW_COMMENTS", field: "reviewComments",
                               detail: `reviewComments: ${detail} Nothing was written.` });
    let included = [];
    if (reviewComments != null) {
      const inc = typeof reviewComments === "object" && !Array.isArray(reviewComments) ? reviewComments.included : undefined;
      if (inc === undefined || !Array.isArray(inc) || inc.length > REVIEW_COMMENTS_INCLUDED_MAX
          || !inc.every((x) => typeof x === "string" && x.trim()))
        return bad(`is {included: [comment ids]}, at most ${REVIEW_COMMENTS_INCLUDED_MAX}.`);
      included = [...new Set(inc.map((x) => x.trim()))];
    }
    const out = (carried, leftOut) => ({ ok: true, carried, left_out: leftOut,
      block: reviewCommentsLines({ comments: carried, left_out: leftOut }), body: { comments: carried, left_out: leftOut } });
    const reader = this.#reviewCommentsReader;
    if (!reader) return out([], null);
    let read = null;
    try { read = reader({ case: caseId, edition, viewer, draft: draft ?? null }); } catch { read = null; }
    const list = Array.isArray(read) ? read : read && Array.isArray(read.comments) ? read.comments : null;
    if (!list) {
      if (included.length)
        return { ok: false, reason: "REVIEW_COMMENTS_UNREAD", caseId, edition,
                 detail: "the comments on this case's review copies could not be read, so the ones chosen cannot be carried. "
                       + "Try again. Nothing was written." };
      return out([], null);
    }
    const rows = list.filter((c) => c && typeof c === "object");
    const byId = new Map(rows.map((c) => [String(c.comment_id ?? c.id ?? ""), c]));
    const missing = included.filter((id) => !byId.has(id));
    if (missing.length)
      return { ok: false, reason: "REVIEW_COMMENT_NOT_FOUND", caseId, edition, comments: missing,
               detail: `${missing.join(", ")}: no comment on this case's review copies answers to that id. Choose among the `
                     + "comments the review copies hold. Nothing was written." };
    const chosen = new Set(included);
    const carried = rows.filter((c) => chosen.has(String(c.comment_id ?? c.id ?? "")))
      .map((c) => ({ reviewer: c.reviewer ?? null, text: c.text ?? null, at: c.at ?? null }));
    const cut = !Array.isArray(read) && read && read.truncated === true;
    return out(carried, cut ? null : rows.length - carried.length);
  }

  /* R7 (K31's pattern): the one reader of the case's review comments, `review`'s R33, registered at its start. */
  #reviewCommentsReader = null;
  /** R7 (D61; K2483): `review` registers `reviewCommentsFor` here once, at its start. A second registration is refused
   *  `REVIEW_COMMENTS_DECLARED`, and one that is not a function `MALFORMED`; each changes nothing. */
  registerReviewComments(fn) {
    if (typeof fn !== "function")
      return { ok: false, reason: "MALFORMED", field: "fn", detail: "the review comments' reader is a function of {case, edition, viewer, draft}" };
    if (this.#reviewCommentsReader)
      return { ok: false, reason: "REVIEW_COMMENTS_DECLARED",
               detail: "a reader of the case's review comments is already registered, once, at start" };
    this.#reviewCommentsReader = fn;
    return { ok: true };
  }

  /* ==========================================================================================================
   * advocacyCheck, advocacyChecksOf: a member's own text, checked against the record (R13; R14; v0.2 rule 9; D11a)
   *
   * A member brings text they wrote. Each sentence is judged by case-checker's `checkAccount` (its R24), the case
   * account's one body of check code, against what it cites as the author reads the record, and answered supported, not
   * supported or contradicted. The text and its check are kept in the member's own hidden project (project-roster R23's
   * scope `own`) and nowhere else: no answer carries a signature, digest, stamp or label, and no service of this module
   * offers a check to another module, so nothing prepares, sends, records, certifies or publishes from it.
   * ========================================================================================================== */

  /** R13 (T45; N861; Actions D11a; v0.2 rule 9): check `sentences` (`[{text, cites}]`, R5's shape with no bias mark),
   *  the text `author` wrote, in `project`, their own hidden project. Refusals, in order, each writing nothing:
   *  `MACHINE_CANNOT_CHECK_ADVOCACY` (C-153.3: `author` absent or a machine identity); `NO_SUCH_PROJECT` (membership's
   *  one answer: no project, or one `viewer` does not see in full); `ADVOCACY_NOT_OWN_PROJECT` (C-153.2: its scope is not
   *  `own`, or `author` is not joined to it); `BAD_ACCOUNT` naming the field (R5's shape, a `bias_statement` included, or
   *  no sentence). Otherwise answers `{ok: true, project, at, sentences: [{ord, result, codes, findings}]}` and appends
   *  the text and that result to `advocacy_checks`, inside record-core's `transact` (R9). A check that cannot run answers
   *  every sentence `undetermined`, never `supported`. */
  advocacyCheck({ project = null, sentences = null, author = null, viewer = null } = {}) {
    const who = String(author ?? "").trim();
    /* DEC-49 REGION is-advocacy-member */
    if (!who || isMachineIdentity(who))
      return refusal(CASE_ACCOUNT_CHECKS, "MACHINE_CANNOT_CHECK_ADVOCACY", { detail: "a member's own text is checked "
        + "only at that member's act, and this request named no member. Nothing was written." });
    /* END DEC-49 REGION is-advocacy-member */
    const seen = this.#ownProjectSeen(project, viewer);
    if (!seen) return noSuchProject(project ?? null);
    const memberId = who.startsWith("member:") ? who.slice("member:".length) : who;
    let own = false;
    try {
      own = this.roster.projectScope(seen)?.scope === "own" && this.membership.isJoinedParticipant(seen, memberId) === true;
    } catch { own = false; }
    /* DEC-49 REGION is-advocacy-own-project */
    if (!own)
      return refusal(CASE_ACCOUNT_CHECKS, "ADVOCACY_NOT_OWN_PROJECT", { project: seen, detail: "a member's own text and "
        + "its check are kept only in that member's own project, a hidden project set as their own with them as its one "
        + "participant, and this project is not one. Nothing was written." });
    /* END DEC-49 REGION is-advocacy-own-project */
    const shaped = accountShaped(sentences, null);
    if (shaped.ok === false) {
      const field = shaped.field.replace(/^account/, "sentences");
      return { ...shaped, field, detail: shaped.detail.replace(/^account/, "sentences") };
    }
    const marked = shaped.sentences.findIndex((x) => x.bias_statement != null);
    if (marked >= 0)
      return { ok: false, reason: "BAD_ACCOUNT", field: `sentences[${marked}].bias_statement`,
               detail: `sentences[${marked}].bias_statement: a member's own text is checked against what it cites, and no `
                     + "bias mark is taken here. Nothing was written." };
    if (!shaped.sentences.length)
      return { ok: false, reason: "BAD_ACCOUNT", field: "sentences",
               detail: "sentences: the text to check is a list of one or more sentences, each {text, cites}. Nothing was written." };
    const rows = shaped.sentences.map((x, i) => ({ ord: i + 1, text: x.text, cites: x.cites, kind: "account", bias_statement: null }));
    const reader = who.startsWith("member:") || who === "admin" ? who : `member:${who}`;
    const judged = this.#advocacyJudged(rows, reader, seen);
    return this.record.transact(() => {
      const at = this.#when("millisecond");
      this.sql.exec(`INSERT INTO advocacy_checks (project_id, author, sentences, result, at) VALUES (?,?,?,?,?)`, seen, who,
                    JSON.stringify(rows.map((r) => ({ text: r.text, cites: r.cites }))), JSON.stringify(judged), at);
      return { ok: true, project: seen, at, sentences: judged };
    });
  }

  /** R13: the advocacy checks kept in `project`, newest first, each `{author, at, sentences: [{text, cites}], results}`,
   *  at most `ADVOCACY_CHECKS_MAX` (`truncated` when there are more), only to a viewer with full sight of the project
   *  (membership R44); every other viewer, and an absent project, receives `NO_SUCH_PROJECT`, byte-identical. Writes
   *  nothing. */
  advocacyChecksOf({ project = null, viewer = null } = {}) {
    const seen = this.#ownProjectSeen(project, viewer);
    if (!seen) return noSuchProject(project ?? null);
    let rows = [];
    try {
      rows = this.#rows(`SELECT author, sentences, result, at FROM advocacy_checks WHERE project_id=? ORDER BY seq DESC LIMIT ?`,
                        seen, ADVOCACY_CHECKS_MAX + 1);
    } catch { rows = []; }
    const parse = (t) => { try { return JSON.parse(t); } catch { return null; } };
    return { ok: true, project: seen, truncated: rows.length > ADVOCACY_CHECKS_MAX,
             checks: rows.slice(0, ADVOCACY_CHECKS_MAX).map((r) => ({ author: r.author, at: r.at, sentences: parse(r.sentences),
                                                                     results: parse(r.result) })) };
  }

  /* R13: `project` when it is a project `viewer` sees in full (membership R44's `FULL`), else null; a read that fails
     answers null, as an absent project (R12). */
  #ownProjectSeen(project, viewer) {
    const id = typeof project === "string" ? project.trim() : "";
    if (!id) return null;
    try {
      if (this.record.bundleInfo(id)?.type !== "project") return null;
      return this.membership.sight(id, viewer) === "full" ? id : null;
    } catch { return null; }
  }

  /* R13, R14: each sentence judged by case-checker R24 against what it cites as `reader` reads the record, `cited` built
     as R6 builds it (`#held`, a counsel matter other than `project` holding nothing) in `checkAccount`'s own list shape,
     `printed` empty, `conclusions` each cited finding's own conclusion (basis-versions R23) and its legs (inquiry's
     `basisFor`), read only where `reader` sees the finding. A check that throws or answers anything else answers every
     sentence `undetermined`. */
  #advocacyJudged(rows, reader, project) {
    const held = this.#held(rows, null, reader, project);
    const gate = viewerPredicate(reader);
    const seenBy = (id) => gate.scope !== "DENY"
      && !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, id, ...gate.args);
    const cited = held.filter((h) => h.quote && !h.counsel)
      .map((h) => ({ kind: h.cite.kind, ref: h.cite.ref, ...(h.cite.kind === "leg" ? { ord: h.cite.ord } : {}), text: h.quote }));
    const conclusions = [];
    for (const f of [...new Set(held.filter((h) => h.finding && !h.counsel).map((h) => h.finding))]) {
      try {
        if (!seenBy(f)) continue;
        const c = this.versions.noProjectConclusionOf(f);
        const basis = this.inquiry.basisFor(f);
        conclusions.push({ finding: f, claim: c && c.claim && c.claim.text != null ? c.claim.text : null,
                           claim_state: c && c.claim ? c.claim.state ?? null : null,
                           legs: basis && basis.ok !== false && Array.isArray(basis.legs) ? basis.legs : [] });
      } catch { /* R12: a finding whose conclusion or legs cannot be read states none */ }
    }
    const counsel = new Set(held.filter((h) => h.counsel).map((h) => h.address));
    let answer = null;
    try { answer = this.checker.checkAccount({ account: rows, cited, printed: [], conclusions }); } catch { answer = null; }
    const departures = answer && answer.ok === true && Array.isArray(answer.departures) ? answer.departures : null;
    return rows.map((r) => {
      const findings = [...new Set(r.cites.filter((c) => (c.kind === "finding" || c.kind === "leg")).map((c) => c.ref))];
      if (!departures) return { ord: r.ord, result: "undetermined", codes: [], findings };
      const counselCites = r.cites.map(citeAddress).filter((a) => counsel.has(a));
      const codes = [...new Set([...(counselCites.length ? ["ACCOUNT_CITES_COUNSEL_MATTER"] : []),
        ...departures.filter((d) => d && d.ord === r.ord).map((d) => d.code)])];
      const result = codes.includes("ACCOUNT_CONTRADICTED_BY_RECORD") ? "contradicted" : codes.length ? "not_supported" : "supported";
      return { ord: r.ord, result, codes, findings, ...(counselCites.length ? { counsel: counselCites } : {}) };
    });
  }

  /* ==========================================================================================================
   * accountPropose, accountDrafts: the system's drafts of a case's account (R1–R3; D56)
   *
   * A DRAFT IS NEVER THE ACCOUNT. An AI run drafts the account from the case's cited evidence, in a framing (time order,
   * by question, by rule), or flags the sentences of a member's account the evidence does not support (`account_check`,
   * run-rules R25); each is labelled through record-grammar's `proposalLabel` (its R54), machine work when a machine
   * proposed it. The member writes the account at op=publish from a draft, recording the draft and the form she took it
   * up in (R4), or from nothing; the published account is hers. Drafts are append-only.
   * ========================================================================================================== */

  /* R1, R3, R10: the case a draft may be proposed for, `viewer` seeing its project: published (publication R40's
     `cases`) or prepared and unsigned (its `case_documents`, the preparation's `case_project`), so a first edition's
     account is drafted before anything is published. Every other case, and one the viewer cannot see, answers alike,
     byte for byte; a read that fails answers the same (R12). */
  #caseForDrafts(caseId, viewer) {
    const id = str(caseId);
    let seen = false;
    try {
      const owner = id ? this.#caseProject(id) : null;
      const gate = viewerPredicate(viewer);
      seen = !!(owner && gate.scope !== "DENY"
        && this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${gate.sql})`, owner, ...gate.args));
    } catch { seen = false; }
    if (seen) return { ok: true, caseId: id };
    return { ok: false, reason: "NO_SUCH_CASE",
             detail: "no case you can see answers to that id, published or prepared. A case you cannot see is answered as "
                   + "one that does not exist. Nothing was written." };
  }

  /** R1, R2 (D56; K2536): store a draft of `case`'s account from `run`: `kind` `case_account` (default; `text` in one of
   *  `ACCOUNT_FRAMINGS`) or `account_check` (`flags: [{ord, text, cites}]` in place of `text`). Refusals, in order, each
   *  writing nothing: `NO_SUCH_CASE`; `BAD_ACCOUNT_DRAFT` (an unknown kind, a text blank or over `ACCOUNT_DRAFT_MAX`, or
   *  flags malformed); `BAD_ACCOUNT_FRAMING`; `NO_SUCH_RUN` (a run `ai-runs.runFor` does not answer for `viewer`);
   *  `MINT_EXHAUSTED` (record-core R62) when no id is free. Answers `{ok: true, draft: {id, case, kind, framing, text,
   *  flags, run, label, at}, next}`. */
  accountPropose({ case: caseId = null, kind = "case_account", framing = null, text = undefined, flags = undefined,
                   run = null, proposedBy = null, viewer = null } = {}) {
    const seen = this.#caseForDrafts(caseId, viewer);
    if (seen.ok === false) return seen;
    const bad = (field, detail) => ({ ok: false, reason: "BAD_ACCOUNT_DRAFT", case: seen.caseId, field,
                                      detail: `${field}: ${detail} Nothing was written.` });
    if (kind !== "case_account" && kind !== "account_check") return bad("kind", "is case_account or account_check.");
    let words = null, flagged = null;
    if (kind === "case_account") {
      /* R1's order: the draft's words (BAD_ACCOUNT_DRAFT) before its framing (BAD_ACCOUNT_FRAMING) */
      const length = typeof text === "string" ? [...text].length : null;
      if (length === null || !text.trim() || length > ACCOUNT_DRAFT_MAX)
        return bad("text", `a draft of the account is words, at most ${ACCOUNT_DRAFT_MAX} characters.`);
      if (!ACCOUNT_FRAMINGS.includes(framing))
        return { ok: false, reason: "BAD_ACCOUNT_FRAMING", case: seen.caseId, allowed: ACCOUNT_FRAMINGS,
                 detail: `a draft of the account is written in one framing: ${ACCOUNT_FRAMINGS.join(", ")}. Nothing was written.` };
      words = text;
    } else {
      if (!Array.isArray(flags) || !flags.length || flags.length > ACCOUNT_SENTENCES_MAX)
        return bad("flags", `is a list of 1 to ${ACCOUNT_SENTENCES_MAX} {ord, text, cites}.`);
      flagged = [];
      for (let i = 0; i < flags.length; i++) {
        const f = flags[i];
        const cites = f && typeof f === "object" ? citesOf(f.cites) : null;
        if (!f || typeof f !== "object" || !Number.isInteger(f.ord) || f.ord < 1 || typeof f.text !== "string" || !f.text.trim()
            || [...f.text].length > COMPLETENESS_MAX || /[\r\n]/.test(f.text) || !cites)
          return bad(`flags[${i}]`, "is {ord, text, cites}: the sentence's ord, its words on one line, and what it cites.");
        flagged.push({ ord: f.ord, text: f.text, cites });
      }
    }
    const r = str(run);
    let found = null;
    try { found = r ? this.runs.runFor(r, viewer) : null; } catch { found = null; }
    if (!found)
      return { ok: false, reason: "NO_SUCH_RUN", case: seen.caseId, run: r || null,
               detail: "a draft of the account names the run that wrote it, and no run you can see answers to that id. "
                     + "Nothing was written." };
    const by = proposedBy == null || !String(proposedBy).trim() ? null : String(proposedBy).trim();
    const label = proposalLabel(by, kind);
    return this.record.transact(() => {
      const at = this.#when("millisecond");
      /* record-grammar R55: `ACD` is opaque in `ID_TABLE`, so `allocId` draws its 16-character tail through the ledger,
         in this transaction, and answers record-core R62's one refusal itself when none is free */
      const minted = this.record.allocId(ACCOUNT_DRAFT_PREFIX, at.slice(0, 4));
      if (!minted || minted.ok === false || typeof minted.id !== "string") return minted;
      const id = minted.id;
      this.sql.exec(`INSERT INTO account_drafts (draft_id, case_id, kind, framing, text, flags, run, proposed_by, label, at)
                     VALUES (?,?,?,?,?,?,?,?,?,?)`, id, seen.caseId, kind, kind === "case_account" ? framing : null, words,
                    flagged ? JSON.stringify(flagged) : null, r, by, JSON.stringify(label), at);
      return { ok: true, draft: { id, case: seen.caseId, kind, framing: kind === "case_account" ? framing : null, text: words,
                                  flags: flagged, run: r, label, at },
               next: kind === "case_account"
                 ? `a member writes the account at op=publish, from this draft (accountDraft: "${id}") in their own words, or `
                   + "from nothing; until then it is a draft and never the case's account"
                 : "the member answers each flag at op=publish by tying the sentence to evidence or removing it" };
    });
  }

  /** R3: `case`'s drafts of both kinds, oldest first, each `{id, kind, framing, text, flags, run, label, at}`, at most
   *  `ACCOUNT_DRAFTS_MAX` (`truncated` when there are more). `NO_SUCH_CASE` as `accountPropose` answers it. Writes nothing. */
  accountDrafts({ case: caseId = null, viewer = null } = {}) {
    const seen = this.#caseForDrafts(caseId, viewer);
    if (seen.ok === false) return seen;
    const rows = this.#rows(`SELECT draft_id, kind, framing, text, flags, run, label, at FROM account_drafts WHERE case_id=?
                             ORDER BY seq LIMIT ?`, seen.caseId, ACCOUNT_DRAFTS_MAX + 1);
    return { ok: true, case: seen.caseId, truncated: rows.length > ACCOUNT_DRAFTS_MAX,
             drafts: rows.slice(0, ACCOUNT_DRAFTS_MAX).map((x) => ({ id: x.draft_id, kind: x.kind, framing: x.framing ?? null,
               text: x.text ?? null, flags: x.flags ? JSON.parse(x.flags) : null, run: x.run, label: JSON.parse(x.label), at: x.at })) };
  }
}

const instances = new WeakMap();

/** R12 (K61): the one instance per host, created on the first call with `deps`. It creates its two tables (the same
 *  DDL case-authoring created them by, so a running store's rows are kept) and declares them to record-core's purge
 *  (R8, K23). */
export function caseAccountOf(host, deps) {
  let c = instances.get(host);
  if (!c) {
    const d = deps || {};
    const storage = d.storage || host.storage;
    const record = d.record || recordOf(host);
    c = new CaseAccount({ ...d, host, storage, record });
    instances.set(host, c);
    c.migrate();
    record.declarePurge("case-account", CASE_ACCOUNT_TABLES);
  }
  return c;
}

/** Which purge declaration names this module's tables (record-core R21: each owner declares its own). */
export function caseAccountOwns(t) {
  const name = typeof t === "string" ? t : t && t.name;
  return CASE_ACCOUNT_TABLES.some((x) => x.name === name);
}
