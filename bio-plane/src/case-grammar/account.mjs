/* case-grammar — the case's account, the bias applications it carries, the review comments its publisher included and
 * the approvals it was signed under (requirements: `build/requirements/case-grammar.md` R23–R26, with R13, R14 and R6;
 * T41: N820, `draft-T41-investigation.md` §3.6; D56, D58–D61, D63; K2405, K2417, K2418). `case-authoring` writes the
 * blocks (its R63, R66, R68) with the line builders here, so the bytes are written one way, and the readers are the one
 * reading of them, for `case-disclosures`, `case-checker`, `case-import` and the complete edition (R14) alike.
 *
 * THE BLOCKS, as a `/7` document's front matter carries them (flat rows, K549; optional, with no new format, as R10's
 * `working_on` and R22's `subject_entity` are: a document without one reads null, so every earlier edition reads and
 * renders byte for byte):
 *   account:                   one row per sentence: `ord`, `text`, `cites` (what it rests on), `kind` (`account` or one
 *                              of the four statements, D63), `bias_statement` (set only for framing marked as following a
 *                              printed bias statement, D58), `began_as` (`member` or `machine_draft`) and `draft` (the
 *                              machine draft it began as, null for `member`).
 *   bias_applications:         one row per application recorded at a leg or conclusion of a finding a member's chain
 *                              reaches (`inquiry-grammar` R18, `basis-versions` R48): `finding`, `ord` (the leg's, null at
 *                              a conclusion), `target` (`leg` or `conclusion`), `statement`, `effect`, `from`, `to`.
 *   review_comments:           one row per reviewer's comment the publisher chose to include: `reviewer`, `text`, `at`;
 *   review_comments_left_out:  and the count left out, always stated (D61).
 *   approval_rule:             the group's approval rule in force at signing, `{approvers, set_by, set_at}`, or null when
 *                              none is (the default, so a group of one is never blocked; D60);
 *   approvals:                 one row per approval given, `by`, `at`.
 *
 * ONE VALUE, EXACTLY. A sentence is re-checked offline against what it cites (`case-checker` R24), so its words must read
 * back byte for byte: every value is written as R17's are (`./facts.mjs`' `exact`), canonical JSON in one quoted value.
 * A value outside its words is written null, undetermined, never a guess. Pure; nothing here throws. */

import { caseDocumentRequiresMaterials } from "./formats.mjs";
import { exact, unexact, exactRowsBlock } from "./facts.mjs";

/** R23: the fields of an `account:` row, in the order they are written. */
export const ACCOUNT_FIELDS = Object.freeze(["ord", "text", "cites", "kind", "bias_statement", "began_as", "draft"]);
/** R23 (D63): what a row is: a sentence of the account, or one of the four authored statements (what it says, why this
 *  subject, what was left out and why, what changed; `case-authoring` R65's fields), each under the same check. */
export const ACCOUNT_KINDS = Object.freeze(["account", "statement", "subject_justification", "excluded", "what_changed"]);
/** R23: how a sentence began (R8's two origins). */
export const ACCOUNT_ORIGINS = Object.freeze(["member", "machine_draft"]);
/** R23: what a sentence may cite: a finding, a leg of one (with its `ord`), a passage (by its `content_id`) or a material
 *  (by its `materials:` ref). Each cite is `{kind, ref, ord}`. */
export const ACCOUNT_CITE_KINDS = Object.freeze(["finding", "leg", "passage", "material"]);
/** R23: the body section's head, and the mark a bias-framed sentence carries in the text (the UX stream's words, until
 *  it gives them). */
export const ACCOUNT_HEAD = "## The Account";
export const accountBiasMark = (statement) => `[framing that follows the declared bias statement ${statement ?? "not named"}]`;

/** R24: the fields of a `bias_applications:` row, what an application is recorded at, and its effects (`inquiry-grammar`
 *  R18's three at a leg, `basis-versions` R48's `scrutiny_raised` at a conclusion). */
export const BIAS_APPLICATION_FIELDS = Object.freeze(["finding", "ord", "target", "statement", "effect", "from", "to"]);
export const BIAS_APPLICATION_TARGETS = Object.freeze(["leg", "conclusion"]);
export const BIAS_APPLICATION_EFFECTS = Object.freeze(["grade_lowered", "leg_excluded", "inference_refused", "scrutiny_raised"]);
const GRADES = ["A", "B", "C", "D"];

/** R25: the fields of a `review_comments:` row, and the key the count left out is stated under. */
export const REVIEW_COMMENT_FIELDS = Object.freeze(["reviewer", "text", "at"]);
export const REVIEW_COMMENTS_LEFT_OUT_KEY = "review_comments_left_out";
/** R26: the fields of the rule and of an `approvals:` row, and the rule's key. */
export const APPROVAL_RULE_KEY = "approval_rule";
export const APPROVAL_RULE_FIELDS = Object.freeze(["approvers", "set_by", "set_at"]);
export const APPROVAL_FIELDS = Object.freeze(["by", "at"]);

const objects = (xs) => (Array.isArray(xs) ? xs.filter((x) => x && typeof x === "object" && !Array.isArray(x)) : []);
const str = (v) => (typeof v === "string" && v ? v : null);
const oneOf = (v, allowed) => (allowed.includes(v) ? v : null);
const ordOf = (v) => (Number.isSafeInteger(v) && v >= 0 ? v : null);
const countOf = (v) => (Number.isSafeInteger(v) && v >= 0 ? v : null);
const frontOf = (fm) => (fm && typeof fm === "object" && caseDocumentRequiresMaterials(fm) ? fm : null);
/* Each row is spelled in its own try, so a row that cannot be read is left out and the rest still are. */
const each = (rows, spell) => objects(rows).flatMap((r) => { try { return [spell(r)]; } catch { return []; } });
const readRows = (d, key, spell) => (Array.isArray(d[key]) ? each(d[key], (r) => spell(Object.fromEntries(
  Object.keys(r).map((k) => [k, unexact(r[k])])))) : null);

/* ===== R23 — THE ACCOUNT (D56, D58, D63) ===== */

const citeOf = (c) => {
  if (!c || typeof c !== "object" || Array.isArray(c)) return { kind: null, ref: null, ord: null };
  const kind = oneOf(c.kind, ACCOUNT_CITE_KINDS);
  return { kind, ref: str(c.ref), ord: kind === "leg" ? ordOf(c.ord) : null };
};
const citesOf = (v) => (Array.isArray(v) ? v.map(citeOf) : []);
const accountRow = (r) => {
  const began = oneOf(r.began_as, ACCOUNT_ORIGINS);
  return { ord: ordOf(r.ord), text: typeof r.text === "string" ? r.text : null, cites: citesOf(r.cites),
           kind: oneOf(r.kind, ACCOUNT_KINDS), bias_statement: str(r.bias_statement), began_as: began,
           draft: began === "machine_draft" ? str(r.draft) : null };
};
const byOrd = (rows) => rows.map((r, i) => [r, i])
  .sort((a, b) => (a[0].ord ?? Infinity) - (b[0].ord ?? Infinity) || a[1] - b[1]).map(([r]) => r);

/** R23: the `account:` block's lines, from rows `{ord, text, cites: [{kind, ref, ord?}], kind, bias_statement?,
 *  began_as, draft?}`, in the order given; `draft` written null for a sentence that began with the member. `account: []`
 *  when there are none. */
export function accountLines(rows) {
  return exactRowsBlock("account", each(rows, accountRow), ACCOUNT_FIELDS);
}

/** R23: the `account:` block read back, in `ord` order (rows with the same `ord` as written), each row as `accountLines`
 *  writes it; null for a document without the block, and for a format before `/6`. Pure; never throws. */
export function accountOf(fm) {
  try {
    const d = frontOf(fm);
    if (!d) return null;
    const rows = readRows(d, "account", accountRow);
    return rows && byOrd(rows);
  } catch {
    return null;
  }
}

/** R23: the account as the body prints it, under `ACCOUNT_HEAD`: each `account` sentence in `ord` order, a bias-framed
 *  one followed by its mark naming its statement (`accountBiasMark`); the four statements' rows are printed where their
 *  own sections print them, not here. Its words are the member's, so a sentence is printed as written. */
export function accountSectionLines(rows) {
  const sentences = byOrd(each(rows, accountRow)).filter((r) => r.kind === "account");
  return [ACCOUNT_HEAD, "",
    ...(sentences.length ? sentences.map((r) => `${String(r.text ?? "").replace(/[\r\n]+/g, " ")}`
      + `${r.bias_statement ? ` ${accountBiasMark(r.bias_statement)}` : ""}`) : ["This case states no account."]),
    ""];
}

/* ===== R24 — THE BIAS APPLICATIONS (D59) ===== */

const biasApplicationRow = (r) => {
  const target = oneOf(r.target, BIAS_APPLICATION_TARGETS);
  const effect = oneOf(r.effect, BIAS_APPLICATION_EFFECTS);
  const lowered = effect === "grade_lowered";
  return { finding: str(r.finding), ord: target === "leg" ? ordOf(r.ord) : null, target, statement: str(r.statement), effect,
           from: lowered ? oneOf(r.from, GRADES) : null, to: lowered ? oneOf(r.to, GRADES) : null };
};

/** R24: the `bias_applications:` block's lines, from rows `{finding, ord?, target, statement, effect, from?, to?}`, in
 *  the order given; `bias_applications: []` when none. */
export function biasApplicationsLines(rows) {
  return exactRowsBlock("bias_applications", each(rows, biasApplicationRow), BIAS_APPLICATION_FIELDS);
}

/** R24: the `bias_applications:` block read back, in the document's order; null for a document without it, and for a
 *  format before `/6`. Pure; never throws. */
export function biasApplicationsOf(fm) {
  try {
    const d = frontOf(fm);
    return d ? readRows(d, "bias_applications", biasApplicationRow) : null;
  } catch {
    return null;
  }
}

/* ===== R25 — THE REVIEW COMMENTS THE PUBLISHER INCLUDED (D61) ===== */

const reviewCommentRow = (r) => ({ reviewer: str(r.reviewer), text: typeof r.text === "string" ? r.text : null, at: str(r.at) });

/** R25: the `review_comments:` block and the count left out, from `{comments: [{reviewer, text, at}], left_out}`. The
 *  count is always stated: a count that is not a whole number is written null, undetermined. */
export function reviewCommentsLines(given) {
  const { comments = [], left_out: leftOut = null } = given && typeof given === "object" ? given : {};
  return [...exactRowsBlock("review_comments", each(comments, reviewCommentRow), REVIEW_COMMENT_FIELDS),
          `${REVIEW_COMMENTS_LEFT_OUT_KEY}: ${exact(countOf(leftOut))}`];
}

/** R25: `{comments, left_out}` read back, the comments in the document's order and `left_out` a count (null when it is
 *  not one); null for a document carrying neither key, and for a format before `/6`. Pure; never throws. */
export function reviewCommentsOf(fm) {
  try {
    const d = frontOf(fm);
    if (!d || (!Array.isArray(d.review_comments) && !Object.hasOwn(d, REVIEW_COMMENTS_LEFT_OUT_KEY))) return null;
    return { comments: readRows(d, "review_comments", reviewCommentRow) ?? [],
             left_out: countOf(unexact(d[REVIEW_COMMENTS_LEFT_OUT_KEY])) };
  } catch {
    return null;
  }
}

/* ===== R26 — THE APPROVALS (D60) ===== */

const ruleOf = (v) => (v && typeof v === "object" && !Array.isArray(v)
  ? { approvers: Array.isArray(v.approvers) ? v.approvers.filter((a) => typeof a === "string" && a) : [],
      set_by: str(v.set_by), set_at: str(v.set_at) } : null);
const approvalRow = (r) => ({ by: str(r.by), at: str(r.at) });

/** R26: the `approval_rule` line and the `approvals:` block, from `{rule: {approvers, set_by, set_at} | null, approvals:
 *  [{by, at}]}`. A rule that is not an object is written null: no rule was in force. */
export function approvalsLines(given) {
  const { rule = null, approvals = [] } = given && typeof given === "object" ? given : {};
  return [`${APPROVAL_RULE_KEY}: ${exact(ruleOf(rule))}`, ...exactRowsBlock("approvals", each(approvals, approvalRow), APPROVAL_FIELDS)];
}

/** R26: `{rule, approvals}` read back, `rule` null when none was in force; null for a document carrying neither key,
 *  and for a format before `/6`. Pure; never throws. */
export function approvalsOf(fm) {
  try {
    const d = frontOf(fm);
    if (!d || (!Array.isArray(d.approvals) && !Object.hasOwn(d, APPROVAL_RULE_KEY))) return null;
    return { rule: ruleOf(unexact(d[APPROVAL_RULE_KEY])), approvals: readRows(d, "approvals", approvalRow) ?? [] };
  } catch {
    return null;
  }
}
