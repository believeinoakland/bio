/* case-grammar — the reader's words, frozen per case document format (requirements: `build/requirements/case-grammar.md`
 * R33; K3803 (3), K3820; DEC-124's precedent). The sentences of this module that name the body that publishes a case
 * ("the group", "this group") are held here twice: `group`, exactly the words every `/7` and earlier case document was
 * written and rendered in, and `team`, the words of `/8` and later. A document is spelled and rendered in the set its own
 * format selects (`caseWordsOf`), never the clock's, the release's or the format in force, so a stored case re-spells
 * and re-renders byte for byte for ever.
 *
 * NEITHER SET IS READ FROM THE WORD TABLE. A render must give the same bytes for ever and with no network (the checker's,
 * `case-checker` R10), so an edit of the table changes no published edition: BOB's exception, for byte-pinned text only,
 * to `setup-words`' rule that a module holds no member-facing English (K3820). A later re-wording is a later format, a
 * new set here, never an edit of these. Identifiers stay as they are: `ATTRIBUTION_LEVELS`' `group`, an attestation's
 * `by_kind` `group`, a manifest's `group` slug, a row's `group` value. Pure; nothing here throws. */

import { CASE_DOCUMENT_FORMAT, CASE_DOCUMENT_FORMAT_V7, CASE_DOCUMENT_FORMAT_V6, CASE_DOCUMENT_FORMAT_V5, CASE_DOCUMENT_FORMAT_V4,
         CASE_DOCUMENT_FORMAT_V3, CASE_DOCUMENT_FORMAT_V2, CASE_DOCUMENT_FORMAT_LEGACY } from "./formats.mjs";

/** R33: the formats whose documents are spelled and rendered in the `group` words: `/7` and every earlier accepted one. */
const GROUP_WORDS_FORMATS = Object.freeze([CASE_DOCUMENT_FORMAT_V7, CASE_DOCUMENT_FORMAT_V6, CASE_DOCUMENT_FORMAT_V5,
  CASE_DOCUMENT_FORMAT_V4, CASE_DOCUMENT_FORMAT_V3, CASE_DOCUMENT_FORMAT_V2, CASE_DOCUMENT_FORMAT_LEGACY]);

/** R33: the words a document of front matter `fm` is spelled and rendered in: `"group"` for `/7` and every earlier
 *  accepted format, `"team"` for `/8` and later and for a document stating no readable format. Pure; never throws. */
export function caseWordsOf(fm) {
  try {
    const f = fm && typeof fm === "object" ? fm.format : undefined;
    return GROUP_WORDS_FORMATS.includes(f) ? "group" : "team";
  } catch {
    return "team";
  }
}

/** R33: the words for a format token as the spelling functions take it (`attributionBodyLines`, `sourceStatement`,
 *  `sourceRowsStanding`, `lensSectionLines`): the format in force when none is given. */
export const wordsOfFormat = (format) => WORDS[caseWordsOf({ format: format === undefined ? CASE_DOCUMENT_FORMAT : format })];

const GROUP = Object.freeze({
  /* R9: each statement kind in plain words, and the second closing sentence */
  lensKinds: Object.freeze({
    scrutiny: "a source this group checks more closely before relying on it",
    inference: "an inference this group allows or refuses to draw",
    pattern: "a pattern this group has evidence an institution or source follows",
  }),
  lensClosing: Object.freeze([
    "Everyone who investigates looks through a lens: what they care about and expect to find. An undeclared lens is the "
      + "most dangerous kind.",
    "This group declares its lens, with its reasons and its evidence, so that you can weigh its findings knowing how it "
      + "looked at the material.",
  ]),
  /* R27, R28: how a source entry recorded without its value is stated */
  notRecorded: "known to the group, not recorded",
  /* R2: the attribution section's words */
  attributionSaid: Object.freeze({ group: "the group that publishes this case", project: "the project that produced it",
    cover: "the cover the group knows its author by", name: "the name its author chose to appear under" }),
  attributionMember: "a member of this group",
  /* R14: the complete edition's words */
  noticeGroup: "a group not named",
  titleGroup: "A group",
  verify: (program) => `Verify it with the checker from the group's public read ${program}, or against the case file's `
    + "manifest and the group's published record.",
  original: "Fingerprint of the original (SHA-256), which the group holds and this case file does not carry: ",
  notRecomputed: "not recomputed here: a workbook this group's Civicsmith did not recompute",
  checkerStep: (program, spec) => `1. Get the checker, one file, from the publishing group's public read ${program}, and the `
    + `specification of the case file's format from ${spec}.`,
  anotherFinding: "This is another group's finding.",
  accountIntro: "The account is the publisher's own, sentence by sentence; every sentence rests on what it cites. A sentence "
    + "framed by the group's declared bias is marked, and its statement named.",
  approvalRule: (approvers, setBy) => `The group's rule in force at signing required approval by: ${approvers}${setBy}.`,
  attestedMember: (credit, at) => `Attested by a member of the group, credited to the ${credit}${at}.`,
  vouched: (by) => `Vouched for by the group ${by}, under this case's own signature.`,
  levelWord: (level) => level,
});

const TEAM = Object.freeze({
  lensKinds: Object.freeze({
    scrutiny: "a source this team checks more closely before relying on it",
    inference: "an inference this team allows or refuses to draw",
    pattern: "a pattern this team has evidence an institution or source follows",
  }),
  lensClosing: Object.freeze([
    "Everyone who investigates looks through a lens: what they care about and expect to find. An undeclared lens is the "
      + "most dangerous kind.",
    "This team declares its lens, with its reasons and its evidence, so that you can weigh its findings knowing how it "
      + "looked at the material.",
  ]),
  notRecorded: "known to the team, not recorded",
  attributionSaid: Object.freeze({ group: "the team that publishes this case", project: "the project that produced it",
    cover: "the cover the team knows its author by", name: "the name its author chose to appear under" }),
  attributionMember: "a member of this team",
  noticeGroup: "a team not named",
  titleGroup: "A team",
  verify: (program) => `Verify it with the checker from the team's public read ${program}, or against the case file's `
    + "manifest and the team's published record.",
  original: "Fingerprint of the original (SHA-256), which the team holds and this case file does not carry: ",
  notRecomputed: "not recomputed here: a workbook this team's Civicsmith did not recompute",
  checkerStep: (program, spec) => `1. Get the checker, one file, from the publishing team's public read ${program}, and the `
    + `specification of the case file's format from ${spec}.`,
  anotherFinding: "This is another team's finding.",
  accountIntro: "The account is the publisher's own, sentence by sentence; every sentence rests on what it cites. A sentence "
    + "framed by the team's declared bias is marked, and its statement named.",
  approvalRule: (approvers, setBy) => `The team's rule in force at signing required approval by: ${approvers}${setBy}.`,
  attestedMember: (credit, at) => `Attested by a member of the team, credited to the ${credit}${at}.`,
  vouched: (by) => `Vouched for by the team ${by}, under this case's own signature.`,
  /* the one place an identifier is printed as a word: the level `group` is the team under these words */
  levelWord: (level) => (level === "group" ? "team" : level),
});

/** R33: the two sets, frozen: `WORDS.group` is exactly today's words, `WORDS.team` is `/8`'s own. */
export const WORDS = Object.freeze({ group: GROUP, team: TEAM });
