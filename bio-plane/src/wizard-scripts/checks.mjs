/* wizard-scripts' refusal rows (requirements: `build/requirements/wizard-scripts.md`, R20; K1364, K1393). DEC-49: every
 * refusal this module answers carries its code, its row and the member's translation. A new family, C-131 (K1393): every
 * row is new, and each is stamped by the next promotion job. `NOT_AN_ADMIN` is membership's (its R84, C-96.1), answered
 * through `notAnAdmin` and never held here. `NOT_A_DRAFT`, `NOT_AN_APPROVER` and `APPROVER_IS_AUTHOR` are also
 * filing-templates' codes (its C-125.9, .24, .25): this module answers its own rows, worded for a wizard script, and the
 * composed catalogue keeps the first source's (control-plane R22). */

const at = (fn, region) => `src/wizard-scripts/index.mjs ${fn} > ${region}`;

export const WIZARD_SCRIPTS_CHECKS = Object.freeze({
  MACHINE_CANNOT_DRAFT_WIZARD: {
    check: "C-131.1", where: at("#machine", "is-wizard-member"),
    translation: "Only a named member drafts, revises or submits a wizard script. A machine may propose steps; it never "
      + "makes them a script's.",
  },
  NO_SUCH_WIZARD: {
    check: "C-131.2", where: at("#noWizard", "is-no-such-wizard"),
    translation: "There is no wizard script by that id that you can read here. One you may not see answers exactly as one "
      + "that does not exist.",
  },
  WIZARD_SCOPE_REFUSED: {
    check: "C-131.3", where: at("#scope", "is-wizard-scope"),
    translation: "This is done by a member taking part in the script's project (or, for a draft, by its author), and you "
      + "are not. Nothing was changed.",
  },
  WIZARD_EDITOR_NOT_GRANTED: {
    check: "C-131.4", where: at("#notGranted", "is-wizard-editor"),
    translation: "Starting a script from nothing, or adding a step it did not record, needs the advanced editor, which an "
      + "administrator grants. You may reword, remove or reorder the steps you have.",
  },
  WIZARD_RECORDING_CARRIES_VALUES: {
    check: "C-131.5", where: at("#recordingRefusal", "is-wizard-recording"),
    translation: "A recording keeps the screens and the acts, never anything typed. A recorded step carried something "
      + "else, so nothing was kept.",
  },
  WIZARD_NAME_REFUSED: {
    check: "C-131.6", where: at("wizardDraft", "is-wizard-draft"),
    translation: "Name the script in one line of 1 to 200 characters.",
  },
  WIZARD_STEP_REFUSED: {
    check: "C-131.7", where: at("#stepRefusal", "is-wizard-step"),
    translation: "A step names a screen, the act on it (or none), what the member does and why, each at most 300 "
      + "characters, and at most one labelled draft: the script's own words, an offered filing template or a "
      + "registered machine draft.",
  },
  NOT_A_DRAFT: {
    check: "C-131.8", where: at("#notADraft", "is-wizard-not-a-draft"),
    translation: "This version has left draft, so its steps are fixed. Changing them makes a new version.",
  },
  WIZARD_NO_PROPOSER: {
    check: "C-131.9", where: at("wizardPropose", "is-wizard-propose"),
    translation: "Nobody is named as the one proposing these steps. Every proposal names who made it.",
  },
  WIZARD_WHY_REFUSED: {
    check: "C-131.10", where: at("wizardPropose", "is-wizard-propose"),
    translation: "Say why the steps are proposed, in 1 to 1,000 characters.",
  },
  MACHINE_CANNOT_APPROVE_WIZARD: {
    check: "C-131.11", where: at("#machine", "is-wizard-member"),
    translation: "Only a named member approves, widens, retires or withdraws a wizard script. A machine may propose "
      + "steps; it never decides.",
  },
  NOT_SUBMITTED: {
    check: "C-131.12", where: at("wizardApprove", "is-wizard-approve"),
    translation: "Only a submitted version is approved, and this one is not submitted.",
  },
  WIZARD_NOT_APPROVED: {
    check: "C-131.13", where: at("wizardApprove", "is-wizard-approve"),
    translation: "Only an approved script is made group-wide, and this version is not the script's approved one.",
  },
  NOT_AN_APPROVER: {
    check: "C-131.14", where: at("#notAnApprover", "is-wizard-not-an-approver"),
    translation: "An owner of the script's project approves or retires it, and an administrator makes it group-wide or "
      + "approves and retires a group-wide one. You are not the one who does this here.",
  },
  APPROVER_IS_AUTHOR: {
    check: "C-131.15", where: at("wizardApprove", "is-wizard-approve"),
    translation: "The version's author is its only member contributor, so someone else approves it.",
  },
  WIZARD_REASON_REFUSED: {
    check: "C-131.16", where: at("wizardRetire", "is-wizard-retire"),
    translation: "Give the reason in 1 to 500 characters.",
  },
  WIZARD_NOT_THE_GROUPS: {
    check: "C-131.17", where: at("#notTheGroups", "is-wizard-civicsmith"),
    translation: "This script is from the Civicsmith library, shipped with the release and read-only to every group. A "
      + "group cannot edit, retire or withdraw it; it may write its own.",
  },
  WIZARD_ALREADY_ENDED: {
    check: "C-131.18", where: at("#ended", "is-wizard-ended"),
    translation: "This was already retired or withdrawn, as recorded, and that stands.",
  },
  WIZARDS_STATE_REFUSED: {
    check: "C-131.19", where: at("wizards", "is-wizards-state"),
    translation: "Scripts are listed as offered, or by one of: draft, submitted, withdrawn, retired, broken, proposed.",
  },
  WIZARD_NO_STEPS: {
    check: "C-131.20", where: at("checkScript", "is-wizard-check"),
    translation: "A script has at least one step.",
  },
  WIZARD_SCREEN_UNKNOWN: {
    check: "C-131.21", where: at("checkScript", "is-wizard-check"),
    translation: "A step names a screen the interface does not have.",
  },
  WIZARD_ACT_UNKNOWN: {
    check: "C-131.22", where: at("checkScript", "is-wizard-check"),
    translation: "A step names an act its screen does not offer.",
  },
  WIZARD_STEP_NO_WHY: {
    check: "C-131.23", where: at("checkScript", "is-wizard-check"),
    translation: "A step says what the member does and why. One leaves either unsaid.",
  },
  WIZARD_DRAFT_REFUSED: {
    check: "C-131.24", where: at("checkScript", "is-wizard-check"),
    translation: "A step's draft is the script's own words, a filing template offered here, or a labelled machine draft "
      + "the instance registers, and this one is none of them.",
  },
  WIZARD_STEP_CONCLUDES: {
    check: "C-131.25", where: at("checkScript", "is-wizard-check"),
    translation: "A step places a draft on an act a machine is refused. Only the member's own words go there: a script "
      + "may say what to do and why, and the member writes it.",
  },
  WIZARD_TRIVIAL: {
    check: "C-131.26", where: at("checkScript", "is-wizard-check"),
    translation: "A warning: the script has one step, and may not need a wizard.",
  },
  WIZARD_DUPLICATE: {
    check: "C-131.27", where: at("checkScript", "is-wizard-check"),
    translation: "A warning: an offered script already walks the same screens and acts in the same order.",
  },
  WIZARD_ALREADY_REGISTERED: {
    check: "C-131.28", where: at("wizardRegister", "is-wizard-register"),
    translation: "The screens and the library are registered once, at start, and they already are. Nothing was changed.",
  },
  WIZARD_PROGRESS_REFUSED: {
    check: "C-131.29", where: at("wizardProgress", "is-wizard-progress"),
    translation: "Use is counted as a start, a step reached (one of the script's) or a finish, and nothing else. "
      + "Stopping is not counted.",
  },
  WIZARD_USE_REFUSED: {
    check: "C-131.30", where: at("#useRefusal", "is-wizard-use"),
    translation: "A script's use is read by the owners of its project and its author, and the candidates for new scripts "
      + "by project owners and administrators. You are not one here.",
  },
  WIZARD_EDITOR_MEMBER_UNKNOWN: {
    check: "C-131.31", where: at("wizardEditorGrant", "is-wizard-editor-grant"),
    translation: "The advanced editor is granted to a member of the group, and the one named is not one.",
  },
  WIZARD_NO_SUCH_GRANT: {
    check: "C-131.32", where: at("wizardEditorRevoke", "is-wizard-editor-grant"),
    translation: "There is no editor grant by that id.",
  },
});

/** The row a code names, or null for a code this module does not answer. */
export function rowOf(code) {
  return Object.prototype.hasOwnProperty.call(WIZARD_SCRIPTS_CHECKS, code) ? WIZARD_SCRIPTS_CHECKS[code] : null;
}
