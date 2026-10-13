/* action-grammar R9 (T45-25; reconciliation R21; K2845, K2849): the rows C-117.30–.58 this job adds, as drafted, each
   {check, where, translation} exactly; pinned here so a later change to one is a change to a test. New in T45 layer 9,
   awaiting T46's stamp. Since T46 (R26; N913) twenty-four of them translate by `words.json`'s `refusal.<CODE>`: `ROWS_NOW`
   below is each row as it now reads, `T45_ROWS` the record of T45's drafts. Since T47 (R28; N961) the `where`s of C-117.39 and
   C-117.48–.52 name `src/action-records/index.mjs`, whose acts raise them now. */
import { readFileSync } from "node:fs";

export const T45_ROWS = {
  DETERMINATION_NOT_NONCOMPLIANT: {
    check: "C-117.30",
    where: "src/actions/index.mjs #breachRefusal > is-breach-not-noncompliant",
    translation: "An action taken for a breach rests on the group's determination that the act was out of conformance. The determination named is in force but finds no breach of any standard it names, so nothing was written. Name a determination that finds the act noncompliant, or record the action without marking it a breach.",
  },
  OVERRIDE_NO_GROUND: {
    check: "C-117.31",
    where: "src/actions/index.mjs #overrideAndAddressee > is-override-ground",
    translation: "Acting on a breach the group has not yet determined is allowed on one of two grounds only: a legal deadline that falls before a determination could be made, with its citation and date, or an imminent act that cannot be undone, saying what and when. No ground was stated, so nothing was written.",
  },
  OVERRIDE_GROUND_REFUSED: {
    check: "C-117.32",
    where: "src/actions/index.mjs #overrideAndAddressee > is-override-ground",
    translation: "The ground stated for acting without a determination was incomplete or not in the form the record keeps: a legal deadline names its citation and a real date; an imminent act says what it is in up to 500 characters and when, as a date or a date and time. Nothing was written.",
  },
  COPIED_IS_ADDRESSEE: {
    check: "C-117.33",
    where: "src/action-grammar/checks.mjs copiedFindings > is-copied",
    translation: "The office the action is addressed to is also listed among the offices copied on it. One action is made per office addressed, and the others are copied. Remove the addressee from the copied list. Nothing was written.",
  },
  MACHINE_CANNOT_SET_PARTNERS: {
    check: "C-117.34",
    where: "src/actions/index.mjs #t45Fields > is-machine-set-partners",
    translation: "Which organisations the group acts jointly with is a member's statement, and somebody answers for it. The credential that asked here is an automated one, so it cannot state or change the partners. Nothing was written. Sign in to state them yourself.",
  },
  PARTNERS_REFUSED: {
    check: "C-117.35",
    where: "src/actions/index.mjs #t45Fields > is-partners-entity",
    translation: "A partner on a joint action is an organisation named by a role and its name, at most twenty of them, each once, never a person. One entry was not of that form, so nothing was written.",
  },
  MACHINE_CANNOT_SET_PRESS_TERMS: {
    check: "C-117.36",
    where: "src/actions/index.mjs #t45Fields > is-machine-set-press-terms",
    translation: "The terms agreed with a reporter, on the record, background or off the record, and any embargo, are a member's statement. The credential that asked here is an automated one, so it cannot state or change them. Nothing was written. Sign in to state them yourself.",
  },
  PRESS_TERMS_NOT_PRESS: {
    check: "C-117.37",
    where: "src/action-grammar/checks.mjs pressTermsFindings > is-press-terms",
    translation: "Press terms are noted on an action addressed to a reporter. This action is addressed to someone else, so nothing was written. Remove the press terms, or address the action to the press.",
  },
  PRESS_TERMS_REFUSED: {
    check: "C-117.38",
    where: "src/action-grammar/checks.mjs pressTermsFindings > is-press-terms",
    translation: "Press terms say whether the exchange is on the record, background or off the record, with an embargo and a release time each as a date and time, and a note of up to 500 characters with no quotation mark, backslash or line break. These were not of that form, so nothing was written.",
  },
  RECEIPT_NOT_ON_SENT: {
    check: "C-117.39",
    where: "src/action-records/index.mjs actionReceipt > is-receipt-on-sent",
    translation: "Receipt is recorded for something the group sent: when and how the addressee received it. The entry named records something received, or a reply that never came, so nothing was written.",
  },
  OFFICE_STATUS_UNKNOWN: {
    check: "C-117.40",
    where: "src/action-grammar/checks.mjs entryFieldFindings > is-entry-fields",
    translation: "The office's own status was named with a status the group's jurisdiction profile does not hold for this kind of action. Quote the office's words alone, or name a status the profile lists. Nothing was written.",
  },
  OFFICE_STATUS_WITHOUT_OUTCOME: {
    check: "C-117.41",
    where: "src/action-grammar/checks.mjs entryFieldFindings > is-entry-fields",
    translation: "The office's own wording of its status is quoted beside the outcome of what it sent back, never in its place, in up to 500 characters on one line. This entry carried the wording without an outcome, or the wording was not of that form, so nothing was written. Record the outcome first.",
  },
  MACHINE_CANNOT_SET_REPLY_OWED: {
    check: "C-117.42",
    where: "src/actions/index.mjs #t45Fields > is-machine-set-reply-owed",
    translation: "Whether a body owes the group a reply is a member's statement, made with a reason. The credential that asked here is an automated one, so it cannot state or change it. Nothing was written. Sign in to state it yourself.",
  },
  NO_REPLY_OWED: {
    check: "C-117.43",
    where: "src/actions/index.mjs actionCorrespond > is-no-reply-owed",
    translation: "This action is to a body that owes the group no reply, so silence is not recorded as a non-response. Nothing was written. If a reply is owed after all, a member states so first, with a reason.",
  },
  FOUND_ELSEWHERE_NEEDS_CAPTURE: {
    check: "C-117.44",
    where: "src/action-grammar/checks.mjs entryFieldFindings > is-entry-fields",
    translation: "A response found elsewhere, in the press, a report, a decision or a statement, is held as the captured material where it was found, never as an account alone. Capture it first and record it with its capture. Nothing was written.",
  },
  STAGE_NOT_IN_LAW: {
    check: "C-117.45",
    where: "src/actions/index.mjs actionCorrespond > is-stage-in-law",
    translation: "The law this records request is made under has no such stage, as the group's jurisdiction profile lists that law's stages. Record the entry as the stage the law has, or with no stage. Nothing was written.",
  },
  FOLLOWS_ACTION_REWRITTEN: {
    check: "C-117.46",
    where: "src/actions/index.mjs #t45Fields > is-follows-action-rewritten",
    translation: "The earlier action this one follows is named when it is created and never changed or removed afterwards. This write would have set, changed or removed it, so nothing was written.",
  },
  FOLLOWS_ACTION_SELF: {
    check: "C-117.47",
    where: "src/action-grammar/checks.mjs actionFieldFindings > is-action-fields",
    translation: "An action follows an earlier action, and this one named itself. Name the action it follows. Nothing was written.",
  },
  MACHINE_CANNOT_SET_SCOPE: {
    check: "C-117.48",
    where: "src/action-records/index.mjs actionScope > is-scope",
    translation: "Whether an action is kept confidential inside the group is a member's decision, made with a reason. The credential that asked here is an automated one, so it cannot set or remove it. Nothing was written. Sign in to do it yourself.",
  },
  SCOPE_NO_REASON: {
    check: "C-117.49",
    where: "src/action-records/index.mjs actionScope > is-scope",
    translation: "Keeping an action confidential, or ending that, is recorded with a reason in your own words, up to 500 characters with no quotation mark, backslash or line break. No such reason was given, so nothing was written.",
  },
  SCOPE_UNCHANGED: {
    check: "C-117.50",
    where: "src/action-records/index.mjs actionScope > is-scope",
    translation: "The action already has that scope, so there is nothing to change. Nothing was written.",
  },
  MACHINE_CANNOT_RECORD_PROMISE: {
    check: "C-117.51",
    where: "src/action-records/index.mjs actionPromise > is-promise",
    translation: "A promise the group made to a person, an embargo or a source's anonymity, is recorded by a member who answers for it. The credential that asked here is an automated one, so it cannot record one. Nothing was written. Sign in to record it yourself.",
  },
  PROMISE_REFUSED: {
    check: "C-117.52",
    where: "src/action-records/index.mjs actionPromise > is-promise",
    translation: "A promise is recorded as an embargo, anonymity or other, with words of up to 500 characters; one that ends an earlier promise names a promise still standing. This one was not of that form, so nothing was written.",
  },
  FOUND_ELSEWHERE_REFUSED: {
    check: "C-117.53",
    where: "src/action-grammar/checks.mjs entryFieldFindings > is-entry-fields",
    translation: "A response found elsewhere is something received, and says where it was found: the press, a report, a decision, a statement or other, with a note of up to 500 characters. This entry was not of that form, so nothing was written.",
  },
  SPEAKER_REFUSED: {
    check: "C-117.54",
    where: "src/action-grammar/checks.mjs entryFieldFindings > is-entry-fields",
    translation: "The member who spoke for the group is recorded on something the group sent, by their member id. This entry was received or named no member id, so nothing was written.",
  },
  REPLY_OWED_REFUSED: {
    check: "C-117.55",
    where: "src/action-grammar/checks.mjs actionFieldFindings > is-action-fields",
    translation: "Whether a reply is owed is stated as yes or no, or left out, which reads as owed. Something else was stated, so nothing was written.",
  },
  FOLLOWS_ACTION_REFUSED: {
    check: "C-117.56",
    where: "src/action-grammar/checks.mjs actionFieldFindings > is-action-fields",
    translation: "The earlier action this one follows is named by its record id and, optionally, the position of the entry it follows, a whole number counted from zero. It was named in another form, so nothing was written.",
  },
  LAW_STAGE_UNKNOWN: {
    check: "C-117.57",
    where: "src/action-grammar/checks.mjs lawStagesFindings > is-law-stages",
    translation: "A records law in the jurisdiction profile lists a stage the record does not know. Each of a law's stages is named by one of the record's stages of a records request, such as a request, an appeal or a decision. That stage is not read as one the law has.",
  },
  MACHINE_CANNOT_SET_COPIED: {
    check: "C-117.58",
    where: "src/actions/index.mjs #t45Fields > is-machine-set-copied",
    translation: "Which other offices are copied on an action is a member's statement, and somebody answers for it. The credential that asked here is an automated one, so it cannot state or change them. Nothing was written. Sign in to state them yourself.",
  },
};

/* R26 (T46; DEC-194, N913; K2953): the twenty-four rows that take their translation from `words.json`'s `refusal.<CODE>`, in
   R26's order, and the four that keep their T45 drafts in T46 (each returned to BOB). C-117.58 MACHINE_CANNOT_SET_COPIED,
   which `words.json` does not hold, keeps its own; `BEARING_REFUSED` is action-replies' row (C-150.3). */
export const T46_TAKEN = ["DETERMINATION_NOT_NONCOMPLIANT", "OVERRIDE_NO_GROUND", "COPIED_IS_ADDRESSEE", "MACHINE_CANNOT_SET_PARTNERS",
  "PARTNERS_REFUSED", "MACHINE_CANNOT_SET_PRESS_TERMS", "PRESS_TERMS_NOT_PRESS", "PRESS_TERMS_REFUSED", "RECEIPT_NOT_ON_SENT",
  "OFFICE_STATUS_UNKNOWN", "MACHINE_CANNOT_SET_REPLY_OWED", "NO_REPLY_OWED", "FOUND_ELSEWHERE_NEEDS_CAPTURE", "STAGE_NOT_IN_LAW",
  "FOLLOWS_ACTION_REWRITTEN", "FOLLOWS_ACTION_SELF", "MACHINE_CANNOT_SET_SCOPE", "SCOPE_NO_REASON", "SCOPE_UNCHANGED",
  "MACHINE_CANNOT_RECORD_PROMISE", "PROMISE_REFUSED", "FOUND_ELSEWHERE_REFUSED", "SPEAKER_REFUSED", "FOLLOWS_ACTION_REFUSED"];
export const T46_KEPT = ["OVERRIDE_GROUND_REFUSED", "OFFICE_STATUS_WITHOUT_OUTCOME", "REPLY_OWED_REFUSED", "LAW_STAGE_UNKNOWN"];

/* The design stream's words, read from the file itself (never from the module under test). */
const WORDS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8")).words;
/** `words.json`'s `en` for `key`, or undefined when it holds none. */
export const wordsEn = (key) => WORDS.find((w) => w.key === key)?.en;

/** Each C-117.30–.58 row as it reads since T46: a taken row with `words.json`'s sentence, every other as T45 drafted it. */
export const ROWS_NOW = Object.fromEntries(Object.entries(T45_ROWS).map(([code, row]) =>
  [code, T46_TAKEN.includes(code) ? { ...row, translation: wordsEn(`refusal.${code}`) } : row]));
