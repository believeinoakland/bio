/* standards' refusal rows (requirements: `build/requirements/standards.md`). DEC-49: every refusal this module answers
 * carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act is
 * reached. A new module with nothing moved (its map, §1): the rows are its own family, C-112 (K174: a module holds its
 * new family; C-112 assigned by BOB, K248). R5's read naming no standard is refused `STANDARD_NO_ID` through its row,
 * C-112.11, never codeless (N269, D-495): standards' own condition, so its own code (K275), not the generic `NO_ID`
 * other modules mint for their own subjects. C-112.20 (`STANDARD_NO_REASON`, R1 and R10; DEC-88, K1025) was minted in T22
 * and stamped by 1.53.0, as was C-112.17's re-wording (the record now holds the declarer's reason). No translation
 * names a place (R13, `layers.md` rule 1), and none speaks of a standard's merit (R12). */

const at = (fn, region, file = "index.mjs") => `src/standards/${file} ${fn} > ${region}`;
const law = (fn, region) => at(fn, region, "law.mjs");

export const STANDARDS_CHECKS = Object.freeze({
  MACHINE_CANNOT_DECLARE_STANDARD: {
    check: 'C-112.1', where: at("machineRefusal", "is-standard-member"),
    translation: 'Recording a standard is a member\'s act. An assistant may propose one for members to consider; it '
      + 'may not enter one in the record. Sign in as a member. Nothing was written.',
  },
  STANDARD_NO_CITE: {
    check: 'C-112.2', where: at("refuseNoCite", "is-standard-cited"),
    translation: 'A standard is recorded with its citation: how it is cited, in at most 200 characters. None was '
      + 'given, or it is too long. Nothing was written.',
  },
  STANDARD_KIND_UNKNOWN: {
    check: 'C-112.3', where: at("refuseKindUnknown", "is-standard-kind"),
    translation: 'A standard is a statute, a regulation, an ordinance, a court decision or order, an adopted policy, '
      + 'a public commitment, or a documented standard set by a standards body, a profession, a regulator or an '
      + 'accreditor. This one names none of them. Nothing was written.',
  },
  STANDARD_NO_ISSUER: {
    check: 'C-112.4', where: at("#declareRefusal", "is-standard-issuer"),
    translation: 'A standard names the body that made it. None was given. Nothing was written.',
  },
  STANDARD_NO_TEXT: {
    check: 'C-112.5', where: at("#declareRefusal", "is-standard-text"),
    translation: 'A standard is held with its own words as captured: name at least one passage of a captured '
      + 'document that holds its text. None was named. Nothing was written.',
  },
  STANDARD_TEXT_UNRESOLVED: {
    check: 'C-112.6', where: at("refuseTextUnresolved", "is-standard-text-held"),
    translation: 'A passage named as this standard\'s text is not held in the record. Capture the document and cite '
      + 'the passage first. Nothing was written.',
  },
  STANDARD_PERIOD_INVALID: {
    check: 'C-112.7', where: at("#declareRefusal", "is-standard-period"),
    translation: 'A standard\'s period in force is a start and an end, each a date written YYYY-MM-DD or left '
      + 'unstated, and the end is not before the start. Nothing was written.',
  },
  STANDARD_SUPERSEDES_UNKNOWN: {
    check: 'C-112.8', where: at("#declareRefusal", "is-superseded-held"),
    translation: 'The standard this one is said to supersede is not held in the record. Name one that is. Nothing '
      + 'was written.',
  },
  STANDARD_ALREADY_SUPERSEDED: {
    check: 'C-112.9', where: at("#declareRefusal", "is-supersession-once"),
    translation: 'The standard named is already superseded by another, which the answer names. A standard is '
      + 'superseded once; supersede the later one instead. Nothing was written.',
  },
  NO_SUCH_STANDARD: {
    check: 'C-112.10', where: at("noSuchStandard", "is-standard-held"),
    translation: 'No standard answers to that id here. Nothing was written.',
  },
  STANDARD_NO_ID: {
    check: 'C-112.11', where: at("refuseNoId", "is-standard-named"),
    translation: 'A standard is read by its id, and none was named. Name the standard to read. Nothing was answered.',
  },
  STANDARD_DATE_INVALID: {
    check: 'C-112.12', where: at("refuseDateInvalid", "is-date-readable"),
    translation: 'The date asked about is written YYYY-MM-DD, and this one is not. Nothing was answered.',
  },
  STANDARD_WHY_INVALID: {
    check: 'C-112.13', where: at("standardPropose", "is-proposal-why"),
    translation: 'A proposal says why the standard applies, in at most 240 characters. None was given, or it is too '
      + 'long. Nothing was written.',
  },
  STANDARD_PROPOSER_UNNAMED: {
    check: 'C-112.14', where: at("standardPropose", "is-proposer-named"),
    translation: 'This proposal carries nobody. A proposal is labelled with who made it, and one nobody can be named '
      + 'for could say nothing. Nothing was written.',
  },
  STANDARD_NO_SUCH_PROPOSAL: {
    check: 'C-112.15', where: at("standardAdopt", "is-proposal-held"),
    translation: 'No proposal of a standard answers to that id here. Nothing was written.',
  },
  STANDARD_PROPOSAL_ADOPTED: {
    check: 'C-112.16', where: at("#adoptRefusal", "is-proposal-open"),
    translation: 'This proposal was already adopted, as the standard the answer names. A proposal is adopted once. '
      + 'Nothing was written.',
  },
  STANDARD_FIELD_UNKNOWN: {
    check: 'C-112.17', where: at("refuseFieldUnknown", "is-standard-field"),
    translation: 'This act takes only the fields it names, and the ones listed are not among them. The record holds a '
      + 'standard\'s citation, kind, issuer, text, period and reason, and never a view of its merit. Nothing was '
      + 'written.',
  },
  STANDARD_WRITTEN_ELSEWHERE: {
    check: 'C-112.18', where: at("#checkStandard", "is-standard-written-here"),
    translation: 'A standard enters the record only when a member records or adopts one, and it is never edited: a '
      + 'correction is a new standard that supersedes it. This write is neither. Nothing was written.',
  },
  STANDARD_ACT_INVALID: {
    check: 'C-112.19', where: at("standardPropose", "is-proposal-act"),
    translation: 'The government act a proposal names is given by its id, in at most 200 characters, and this one is '
      + 'not. Nothing was written.',
  },
  STANDARD_NO_REASON: {
    check: 'C-112.20', where: at("#declareRefusal", "is-standard-reason"),
    translation: 'A standard is recorded with your reason: in your own words, why the group holds its government to '
      + 'it, in at most 2,000 characters. None was given, or it is not words, or it is too long. Nothing was written.',
  },
  /* T33-31 (R18–R27; K1438, K1442, K1446, K1447, K1449): rows minted in T33, awaiting promotion's stamp (T34). */
  STANDARD_FIELD_INVALID: {
    check: 'C-112.21', where: at("#lawFields", "is-standard-law-field"),
    translation: 'A field that says where this standard sits in its law (its instrument, portion, the passages it '
      + 'requires, its copy, how current the copy is, or what its period rests on) is not in the form it takes. The '
      + 'answer names the field. Nothing was written.',
  },
  STANDARD_PORTION_NOT_IN_TEXT: {
    check: 'C-112.22', where: at("#lawFields", "is-portion-in-text"),
    translation: 'A portion of a standard is one of the passages recorded as its own words. The passage named is not '
      + 'one of them. Nothing was written.',
  },
  MACHINE_CANNOT_RELATE: {
    check: 'C-112.23', where: law("machineRelate", "is-law-member"),
    translation: 'Recording how one law bears on another, or how a court treated a decision, is a member\'s act. An '
      + 'assistant may propose one for members to consider; it may not record one. Nothing was written.',
  },
  LAW_RELATION_UNKNOWN: {
    check: 'C-112.24', where: law("refuseRelationUnknown", "is-law-relation-type"),
    translation: 'That is not a relation this record holds between laws. The answer lists the ones it holds. Nothing '
      + 'was written.',
  },
  PORTION_UNKNOWN: {
    check: 'C-112.25', where: at("portionUnknown", "is-portion-held"),
    translation: 'The portion named is not a portion recorded for that standard. Name the portion as it was recorded, '
      + 'or none. Nothing was written.',
  },
  LAW_RELATION_NO_CITATION: {
    check: 'C-112.26', where: law("refuseNoCitation", "is-law-relation-cited"),
    translation: 'A relation between laws is recorded with the passage that makes it: the amending or referring words, '
      + 'or the court\'s words, as captured among the standard\'s own text. None of those was named. Nothing was '
      + 'written.',
  },
  LAW_RELATION_NO_EFFECTIVE: {
    check: 'C-112.27', where: law("#relateRefusal", "is-temporal-effective"),
    translation: 'An amendment, repeal, renumbering or recodification is recorded with when it took effect: a date, or '
      + 'the recorded event that enacted it. None was given, or it is not in that form. Nothing was written.',
  },
  NOT_A_COURT_STANDARD: {
    check: 'C-112.28', where: law("refuseNotCourt", "is-court-standard"),
    translation: 'This act is about a court decision or order, and the standard named is not one. Nothing was written.',
  },
  COURT_LINK_TARGET_NOT_LAW: {
    check: 'C-112.29', where: law("#linkRefusal", "is-link-target-law"),
    translation: 'A court\'s reading is linked to a portion of a statute, regulation or ordinance, and the standard '
      + 'named is none of these. Nothing was written.',
  },
  TREATMENT_UNKNOWN: {
    check: 'C-112.30', where: law("#treatRefusal", "is-treatment-known"),
    translation: 'A later decision\'s treatment of a decision is recorded as reversed, vacated, depublished, overruled '
      + 'or affirmed. This one names none of them. Nothing was written.',
  },
  NO_SUCH_LAW_ITEM: {
    check: 'C-112.31', where: law("lawWithdraw", "is-law-item-held"),
    translation: 'No law relation, court link or treatment answers to that id here. Nothing was written.',
  },
  LAW_RELATION_SELF: {
    check: 'C-112.32', where: law("#relateRefusal", "is-relation-two-ends"),
    translation: 'A relation joins two different standards or portions, and both ends named are the same. Nothing was '
      + 'written.',
  },
  /* T35-31 (R1, R33–R47; K1713, K1722–K1724, K1739, K1740; DEC-145): rows minted in T35, awaiting promotion's stamp
     (T36). C-112.53 is left for `law-relations`' LAW_RELATION_NO_EDITION (its R9). */
  STANDARD_TEXT_NOT_HELD_AS: {
    check: 'C-112.33', where: at("#heldFields", "is-held-text"),
    translation: 'A standard recorded as cited, or as looked for and not found, holds none of its own words, so no '
      + 'passage is named as its text. Record it as held with its text instead, or name no text. Nothing was written.',
  },
  FAMILY_UNKNOWN: {
    check: 'C-112.34', where: at("#familyField", "is-family-known"),
    translation: 'The series named for this standard is not one your group\'s jurisdiction profiles list. Name a series '
      + 'they list, or none. Nothing was written.',
  },
  STANDARD_CITED_BY_MISSING: {
    check: 'C-112.35', where: at("#heldFields", "is-cited-by-held"),
    translation: 'A standard known only because a document cites it is recorded with where it is cited: the captured '
      + 'document and the passage that cites it. None was given, or it is not held. Nothing was written.',
  },
  STANDARD_SEARCH_MISSING: {
    check: 'C-112.36', where: at("#heldFields", "is-search-stated"),
    translation: 'A standard looked for and not found is recorded with the searches made: the portals, sites or offices '
      + 'searched, and any records request and its reply. None was given, or one is not in that form. Nothing was '
      + 'written.',
  },
  FORCE_UNKNOWN: {
    check: 'C-112.37', where: at("#forceRefusal", "is-force-known"),
    translation: 'A provision requires, recommends or allows; a policy\'s provision may also be required or at an '
      + 'office\'s discretion. This one names none of these for its kind. Nothing was written.',
  },
  FORCE_NO_HOLDER: {
    check: 'C-112.38', where: at("#forceRefusal", "is-force-holder"),
    translation: 'A provision at someone\'s discretion names the office or body that holds the discretion, as an '
      + 'entity the record holds. None was named. Nothing was written.',
  },
  FORCE_NO_CRITERIA: {
    check: 'C-112.39', where: at("#forceRefusal", "is-force-criteria"),
    translation: 'A provision at someone\'s discretion names the passage stating the criteria for using it, or says '
      + 'that none are stated. Neither was given. Nothing was written.',
  },
  FORCE_NO_CITATION: {
    check: 'C-112.40', where: at("#forceRefusal", "is-force-cited"),
    translation: 'A provision\'s force is recorded with the provision\'s own words that state it: a passage of the '
      + 'standard\'s text. None was named. Nothing was written.',
  },
  FORCE_TEXT_NOT_HELD: {
    check: 'C-112.41', where: at("#forceRefusal", "is-force-text-held"),
    translation: 'The force of a provision is read from its own words, and this standard\'s text is not held. Hold its '
      + 'text first. Nothing was written.',
  },
  FORCE_ALREADY_CONFIRMED: {
    check: 'C-112.42', where: at("#forceRefusal", "is-force-once"),
    translation: 'This provision already has a confirmed force, which the answer names. Withdraw it, with your reason, '
      + 'before recording another. Nothing was written.',
  },
  COPY_UNKNOWN: {
    check: 'C-112.43', where: at("#copyFields", "is-copy-known"),
    translation: 'A captured copy is official, a codifier\'s, the copy in force, a draft, superseded, produced in '
      + 'answer to a records request, a vendor\'s model, or not known. This one names none of these. Nothing was '
      + 'written.',
  },
  COPY_CLAIM_NOT_CITED: {
    check: 'C-112.44', where: at("#copyFields", "is-copy-claim-cited"),
    translation: 'What a copy says of itself is recorded with the passage of its text that says it. None was named, or '
      + 'it is not one of the standard\'s passages. Nothing was written.',
  },
  RELEASE_NOT_OWNER: {
    check: 'C-112.45', where: at("releaseStandard", "is-release-owner"),
    translation: 'A policy that is not public is released by an owner of the project its source material is filed '
      + 'in. You are not one. Nothing was written.',
  },
  NOT_HELD_FROM_SOURCE: {
    check: 'C-112.46', where: at("releaseStandard", "is-held-from-source"),
    translation: 'This standard is already seen by every member of your group, so there is nothing to release. Nothing '
      + 'was written.',
  },
  VERSION_BASIS_INVALID: {
    check: 'C-112.47', where: at("#versionFields", "is-version-basis"),
    translation: 'A version read from two captures names two held captures of one address whose texts differ, and the '
      + 'version it supersedes. These are not that. Nothing was written.',
  },
  OVERRIDE_INVALID: {
    check: 'C-112.48', where: at("#versionFields", "is-override-form"),
    translation: 'An override names the held standard and portion it displaces, and until when: a recorded event or a '
      + 'later revision of this standard. The answer names the field not in that form. Nothing was written.',
  },
  FORCE_SOURCE_INVALID: {
    check: 'C-112.49', where: at("#versionFields", "is-force-source"),
    translation: 'Where a standard\'s force comes from is a delegation, a resolution, an oversight approval, a court '
      + 'order or a contract, with the passage of the instrument stating it. This is not that. Nothing was written.',
  },
  ADOPTION_MODE_UNKNOWN: {
    check: 'C-112.50', where: at("adoptionRecord", "is-adoption-mode"),
    translation: 'An adoption is by reference, voluntary or by accreditation. This one names none of these. Nothing '
      + 'was written.',
  },
  ADOPTION_NO_EDITION: {
    check: 'C-112.51', where: at("adoptionRecord", "is-adoption-edition"),
    translation: 'An adoption names the edition adopted, as it is written, in at most 50 characters. None was given. '
      + 'Nothing was written.',
  },
  ADOPTION_NO_CITATION: {
    check: 'C-112.52', where: at("adoptionRecord", "is-adoption-cited"),
    translation: 'An adoption is recorded with the passage of the adopting act that states it. None was named, or it is '
      + 'not one of the act\'s passages. Nothing was written.',
  },
  ACCESS_UNKNOWN: {
    check: 'C-112.54', where: at("#accessFields", "is-access-known"),
    translation: 'A standard is free to read, readable only in a reading room, or behind a paywall. This one names none '
      + 'of these. Nothing was written.',
  },
  TEXT_NOT_MEMBER_CAPTURED: {
    check: 'C-112.55', where: at("#accessFields", "is-text-member-captured"),
    translation: 'The text of a standard behind a paywall or in a reading room is held only from a capture a member made '
      + 'themselves. A passage named was captured another way. Nothing was written.',
  },
  TARGET_INVALID: {
    check: 'C-112.56', where: at("#targetField", "is-target-form"),
    translation: 'A target names what is measured and the passage stating it, a threshold (at least, at most or '
      + 'within, an exact number and its unit), the period it applies to, and the body\'s definition of the measure '
      + 'or that none is stated. The answer names the field not in that form. Nothing was written.',
  },
  QUESTION_NOT_HELD: {
    check: 'C-112.57', where: at("#questionField", "is-question-held"),
    translation: 'The question named is not one your group\'s record holds that you may see. Name one, or none. '
      + 'Nothing was written.',
  },
  NO_SUCH_FORCE: {
    check: 'C-112.58', where: at("forceWithdraw", "is-force-held"),
    translation: 'No confirmed force of a provision answers to that id here. Nothing was written.',
  },
});

/** A refusal carrying its row: its reason, code, check id and translation. Called with the code as a literal at each
 *  site, so the DEC-49 guard reads which code a marked region mints. */
export function refusal(code, detail, extra) {
  const row = STANDARDS_CHECKS[code];
  return { ok: false, reason: code, code, check: row.check, translation: row.translation, detail, ...(extra || {}) };
}
