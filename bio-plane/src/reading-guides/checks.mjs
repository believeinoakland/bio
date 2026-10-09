/* reading-guides' refusal rows (requirements: `build/requirements/reading-guides.md` R11). DEC-49: every refusal this
 * module answers carries its code, its row and the member's translation. A new module with nothing moved: its rows are
 * a new family, C-144 (K2480, K2482: T41's new families steps C-142, ai-use C-143, reading-guides C-144,
 * question-explorer C-145, investigation C-146), each awaiting promotion's stamp (K231; T41 rule 4 item 2). No
 * translation names a place (R11, `layers.md` rule 1). The registrations' own refusals (`PROVIDER_DECLARED`,
 * `PROVIDER_MALFORMED`) are a starting module's errors and carry no row, as `public-read` R18's and `connections` R5's
 * do. This file imports nothing. */

const at = (file, fn, region) => `src/reading-guides/${file} ${fn} > ${region}`;

export const READING_GUIDES_CHECKS = Object.freeze({
  GUIDE_CARRIES_CONDUCT: {
    check: "C-144.1", where: at("check.mjs", "checkGuide", "is-guide-look-for"),
    translation: "A reading guide says only what to look for in a document, and where. Each item opens with \"Look "
      + "for\", \"Note whether\", \"Note where\", \"Check whether\", \"Check that\", \"Watch for\" or \"Compare\", and "
      + "none tells the assistant what to do, names a tool or an action, or states a rule or a permission. The item "
      + "named does not. Reword it. Nothing was written.",
  },
  GUIDE_ITEMS_REFUSED: {
    check: "C-144.2", where: at("check.mjs", "checkGuide", "is-guide-shape"),
    translation: "A reading guide holds from 1 to 50 items, each a short label (at most 80 characters), what to look "
      + "for (at most 500 characters) and, if you like, where to look (at most 200 characters), as plain text. The "
      + "items given are not of that form. Nothing was written.",
  },
  GUIDE_MEMBER_ACT: {
    check: "C-144.3", where: at("index.mjs", "memberRefusal", "is-guide-member"),
    translation: "Writing, reviewing, offering, adopting or retiring a reading guide is a member's act. An assistant "
      + "may propose a guide for a member to take up; it may not do any of these. Sign in as an active member. "
      + "Nothing was written.",
  },
  GUIDE_KIND_UNKNOWN: {
    check: "C-144.4", where: at("index.mjs", "kindRefusal", "is-guide-kind"),
    translation: "A reading guide is for one kind of document your group's Civicsmith recognises (a meeting "
      + "calendar, minutes, an agenda, a staff report, an ordinance or code section, a policy, a staff directory, "
      + "or any other document). The kind given is not one of them. Nothing was written.",
  },
  NO_SUCH_GUIDE: {
    check: "C-144.5", where: at("index.mjs", "noSuchGuide", "is-guide-held"),
    translation: "No reading guide you can see answers to that id. Nothing was written.",
  },
  GUIDE_READ_ONLY: {
    check: "C-144.6", where: at("index.mjs", "readOnly", "is-guide-ours"),
    translation: "This reading guide comes with every copy of Civicsmith and is the same for every group, so no group "
      + "can review, offer or retire it. Write your group's own guide for this kind instead, based on it if you "
      + "like. Nothing was written.",
  },
  GUIDE_REVIEW_BY_AUTHOR: {
    check: "C-144.7", where: at("index.mjs", "guideReview", "is-guide-reviewer"),
    translation: "A reading guide is reviewed by a member other than the one who wrote or adopted it. Ask another "
      + "member to review it. Nothing was written.",
  },
  GUIDE_VERDICT_UNKNOWN: {
    check: "C-144.8", where: at("index.mjs", "guideReview", "is-guide-verdict"),
    translation: "A review either approves the guide, making it your group's, or refuses it, keeping it its "
      + "author's. Say which. Nothing was written.",
  },
  GUIDE_REASON_MISSING: {
    check: "C-144.9", where: at("index.mjs", "reasonRefusal", "is-guide-reason"),
    translation: "Refusing or retiring a reading guide needs a reason, in at most 500 characters, so its author and "
      + "the group can see why. None was given, or it is too long. Nothing was written.",
  },
  GUIDE_NOT_REVIEWABLE: {
    check: "C-144.10", where: at("index.mjs", "guideReview", "is-guide-reviewable"),
    translation: "Only a guide not yet your group's can be reviewed: one a member wrote for themselves, or one "
      + "adopted from another group. This one is already your group's or has been retired. Nothing was written.",
  },
  GUIDE_NOT_OFFERABLE: {
    check: "C-144.11", where: at("index.mjs", "offerable", "is-guide-offerable"),
    translation: "Only a guide your group has approved can be offered to another group. Have it reviewed and "
      + "approved first. Nothing was sent.",
  },
  GUIDE_OFFER_UNREADABLE: {
    check: "C-144.12", where: at("index.mjs", "guideAdopt", "is-guide-offer"),
    translation: "What was given is not a reading guide another group offered, or it was changed after it was "
      + "offered. Ask the offering group to send it again. Nothing was written.",
  },
  GUIDE_NO_GROUP_SLUG: {
    check: "C-144.13", where: at("index.mjs", "slugRefusal", "is-guide-slug"),
    translation: "An offered guide is labelled with your group's short name, and none is recorded for this group, "
      + "so nothing can be offered. Whoever runs your group's Civicsmith can set it. Nothing was sent.",
  },
  GUIDE_RETIRE_NOT_APPROVER: {
    check: "C-144.14", where: at("index.mjs", "guideRetire", "is-guide-approver"),
    translation: "A guide that is its author's alone is retired by its author; a group's guide by a member who could "
      + "approve it, that is, any active member other than its author. Nothing was written.",
  },
  GUIDE_RETIRED: {
    check: "C-144.15", where: at("index.mjs", "retiredRefusal", "is-guide-live"),
    translation: "This reading guide has been retired. It stays readable, and nothing more can be done to it. Write "
      + "a new guide based on it if it is still needed. Nothing was written.",
  },
  GUIDE_BASED_ON_UNKNOWN: {
    check: "C-144.16", where: at("index.mjs", "guideDraft", "is-guide-basis"),
    translation: "A guide may say which guide or proposal it is based on, and the one named is not a guide or "
      + "proposal you can see. Nothing was written.",
  },
  GUIDE_PROPOSAL_NOT_MACHINE: {
    check: "C-144.17", where: at("index.mjs", "guidePropose", "is-guide-machine"),
    translation: "A proposed guide is the assistant's work, kept apart for members to take up. A member writes a "
      + "guide directly instead. Nothing was written.",
  },
  GUIDE_RUN_MISSING: {
    check: "C-144.18", where: at("index.mjs", "guidePropose", "is-guide-run"),
    translation: "A proposed guide names the assistant's run that proposed it, so members can see where it came "
      + "from. None was named. Nothing was written.",
  },
});

/** A refusal carrying its row. Called with the code as a literal at each site, so the DEC-49 guard reads which code a
 *  marked region mints. */
export function refusal(code, detail, extra) {
  const row = READING_GUIDES_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}
