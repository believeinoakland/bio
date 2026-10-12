/* project-roster's own refusal rows (requirements: `build/requirements/project-roster.md`). DEC-49: every refusal this
 * module answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever
 * the act is reached.
 *
 * Copied from membership's `checks.mjs` at the split (T38, N783; K624: copy, then delete), each row's number and
 * translation unchanged and its `where` re-pointed to the region in this module's `index.mjs` that mints it: C-56.5
 * (R3), C-33.28 (R4), C-70.4 (R9) and the whole C-95 family (R10–R14). C-56.4, C-33.48 and C-70.1–.3 stay
 * membership's, minted at its acts (`existenceAct`'s C-70.1 is relayed here, never minted). */

const at = (fn, region) => `src/project-roster/index.mjs ${fn} > ${region}`;

export const PROJECT_ROSTER_CHECKS = Object.freeze({
  /* R3 (N335): an owner is a JOINED participant with the owner flag, so a target not joined is its own condition. */
  TARGET_NOT_JOINED: Object.freeze({
    check: 'C-56.5', where: at("projectOwnerAdd", "is-owner-target-joined"),
    translation: 'An owner of a project is one of its participants who has joined it, and the member you named has '
      + 'not joined this project: they are invited and have not joined, have asked to leave, or hold no place in it. '
      + 'Nothing was changed. Once they have joined, they can be made an owner.',
  }),
  /* R4 (REC-64): one owner is the floor. */
  LAST_OWNER: Object.freeze({
    check: 'C-33.28', where: at("projectOwnerRemove", "is-owner-floor"),
    translation: 'A project always has at least one owner, so the last one cannot be removed — the '
      + 'result would be work nobody is answerable for. Add another owner first, or stand the '
      + 'project down.',
  }),
  /* R9 (REC-149): the directory is a member's. */
  PROJECT_DIRECTORY_NEEDS_A_MEMBER: Object.freeze({
    check: 'C-70.4', where: at("projectDirectory", "is-project-directory-member"),
    translation: 'The list of projects you can ask to join is for a signed-in member. Sign in as yourself to '
      + 'see it.',
  }),
});

/* REC-150 / C-95 — THE REQUEST TO JOIN (Membership Architecture v2 §7, item 7.14, "The request to join"; Bob's ruling
 * of 2026-09-18: *"somebody who sees the project can ask to be added as a member"*). A member outside a DISCOVERABLE
 * project asks (at most one open request per member per project, an optional comment) and may withdraw; an OWNER grants
 * — which writes the requester `invited`, never `joined`, because joining is the member's own act (§7.4) — or declines;
 * administrators and the founder see requests and answer none; setting the project HIDDEN lapses every open request.
 * Every refusal here is said only where it discloses nothing: a request to a project the caller cannot see is
 * `noSuchProject` byte for byte and never a C-95 code, and a withdrawal with no open request is ONE answer whatever the
 * id names. */
export const PROJECT_JOIN_REQUEST_CHECKS = Object.freeze({
  PROJECT_REQUEST_NEEDS_A_MEMBER: Object.freeze({
    check: 'C-95.1', where: at("#noRequester", "is-join-request-member"),
    translation: 'Asking to join a project, withdrawing that request and reading your own requests are things '
      + 'a signed-in member does for themselves. Sign in as yourself to do it. Nothing was changed.',
  }),
  PROJECT_REQUEST_NOT_OUTSIDE: Object.freeze({
    check: 'C-95.2', where: at("projectRequest", "is-join-request-ask"),
    translation: 'You can already see this project, so there is nothing to ask. If you were invited, join it '
      + 'with its checkbox. Nothing was changed.',
  }),
  PROJECT_REQUEST_ALREADY_OPEN: Object.freeze({
    check: 'C-95.3', where: at("projectRequest", "is-join-request-ask"),
    translation: 'You already have a request open to join this project. Its owners answer it; you can withdraw '
      + 'it and ask again. Nothing was changed.',
  }),
  PROJECT_REQUEST_NONE_OPEN: Object.freeze({
    check: 'C-95.4', where: at("#noOpenRequest", "is-join-request-none-open"),
    translation: 'There is no open request to join here to act on. It may already have been answered, '
      + 'withdrawn or lapsed. Nothing was changed.',
  }),
  PROJECT_REQUEST_ANSWER_NOT_THE_OWNER: Object.freeze({
    check: 'C-95.5', where: at("projectRequestAnswer", "is-join-request-answer"),
    translation: 'Only an owner of this project can grant or decline a request to join it. Administrators see '
      + 'requests and answer none. Nothing was changed.',
  }),
  PROJECT_REQUEST_UNKNOWN_ANSWER: Object.freeze({
    check: 'C-95.6', where: at("projectRequestAnswer", "is-join-request-answer"),
    translation: 'A request to join is either granted or declined, and nothing else. Choose one of the two. '
      + 'Nothing was changed.',
  }),
  PROJECT_REQUEST_REQUESTER_INACTIVE: Object.freeze({
    check: 'C-95.7', where: at("projectRequestAnswer", "is-join-request-answer"),
    translation: 'The member who asked is no longer active, so they cannot be invited. The request stays open; '
      + 'you can decline it. Nothing was changed.',
  }),
  PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT: Object.freeze({
    check: 'C-95.8', where: at("projectRequestAnswer", "is-join-request-answer"),
    translation: 'The member who asked is already a participant of this project, so granting would invite '
      + 'nobody new. You can decline the request, or they can withdraw it. Nothing was changed.',
  }),
  PROJECT_REQUESTS_NOT_VISIBLE: Object.freeze({
    check: 'C-95.9', where: at("projectRequests", "is-join-requests-project"),
    translation: 'A project\'s requests to join are seen by the people who asked, its owners and administrators. '
      + 'You can read your own requests without naming a project.',
  }),
});

/* T46 (R25; DEC-194, N913): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) the C-147
   rows translate by, each `en` verbatim, read by key (`refusal.<CODE>`), as membership's `HANDLE_WORDS` are. The
   design stream's words: re-worded there, then re-taken here by key; a row never holds a copy of its sentence. */
export const PROJECT_SCOPE_WORDS = Object.freeze({
  'refusal.PROJECT_SCOPE_UNKNOWN': 'A project is a counsel matter, a member\'s own project, or neither. Choose one of '
    + 'those. Nothing was changed.',
  'refusal.PROJECT_SCOPE_NEEDS_HIDDEN': 'Only a hidden project can be a counsel matter or a member\'s own project. Its '
    + 'owners set it hidden first. Nothing was changed.',
  'refusal.PROJECT_SCOPE_OWN_NOT_SOLE': 'Only a project\'s owner, while they are its one member, can make it their own '
    + 'project or stop it being one. Nothing was changed.',
  'refusal.PROJECT_SCOPE_UNCHANGED': 'The project already has that scope. Nothing was changed.',
  'refusal.PROJECT_SCOPE_OWN': 'This is a member\'s own project: nobody else is invited into it, and nobody is made its '
    + 'owner in that member\'s place. Nothing was changed.',
  'refusal.PROJECT_SCOPE_KEEPS_HIDDEN': 'A counsel matter or a member\'s own project stays hidden, so it can\'t be listed '
    + 'for others to find. Remove its scope first if it should be. Nothing was changed.',
  'refusal.APPROVAL_RULE_INVALID': 'Each rule for a second approval names one kind of action, one tier (1, 2 or 3), or '
    + 'acts addressed to the public. One of these doesn\'t. Nothing was changed.',
  'refusal.APPROVAL_KIND_UNKNOWN': 'That kind of action isn\'t one your group\'s places list, so a second approval '
    + 'can\'t be required for it. Nothing was changed.',
});

/* T45 (R21, R22, R24; Actions D4, D27; v0.2 rules 15, 20): A PROJECT'S SCOPE AND ITS SECOND-APPROVAL SETTING. A new
 * family, C-147 (J1's reading; the census's highest was C-146). `PROJECT_SCOPE_OWN` is said at two sites, the guard and
 * the rescue; its row names the guard, where it is minted, and the rescue relays it. T46 (R25): each row's translation
 * is `PROJECT_SCOPE_WORDS`' `refusal.<CODE>`, read by key; codes, numbers and `where`s unmoved. */
export const PROJECT_SCOPE_CHECKS = Object.freeze({
  PROJECT_SCOPE_UNKNOWN: Object.freeze({
    check: 'C-147.1', where: at("projectScopeSet", "is-project-scope-set"),
    translation: PROJECT_SCOPE_WORDS['refusal.PROJECT_SCOPE_UNKNOWN'],
  }),
  PROJECT_SCOPE_NEEDS_HIDDEN: Object.freeze({
    check: 'C-147.2', where: at("projectScopeSet", "is-project-scope-set"),
    translation: PROJECT_SCOPE_WORDS['refusal.PROJECT_SCOPE_NEEDS_HIDDEN'],
  }),
  PROJECT_SCOPE_OWN_NOT_SOLE: Object.freeze({
    check: 'C-147.3', where: at("projectScopeSet", "is-project-scope-set"),
    translation: PROJECT_SCOPE_WORDS['refusal.PROJECT_SCOPE_OWN_NOT_SOLE'],
  }),
  PROJECT_SCOPE_UNCHANGED: Object.freeze({
    check: 'C-147.4', where: at("projectScopeSet", "is-project-scope-set"),
    translation: PROJECT_SCOPE_WORDS['refusal.PROJECT_SCOPE_UNCHANGED'],
  }),
  PROJECT_SCOPE_OWN: Object.freeze({
    check: 'C-147.5', where: at("#guard", "is-project-scope-guard"),
    translation: PROJECT_SCOPE_WORDS['refusal.PROJECT_SCOPE_OWN'],
  }),
  PROJECT_SCOPE_KEEPS_HIDDEN: Object.freeze({
    check: 'C-147.6', where: at("#guard", "is-project-scope-guard"),
    translation: PROJECT_SCOPE_WORDS['refusal.PROJECT_SCOPE_KEEPS_HIDDEN'],
  }),
  APPROVAL_RULE_INVALID: Object.freeze({
    check: 'C-147.7', where: at("projectApprovalSet", "is-project-approval-set"),
    translation: PROJECT_SCOPE_WORDS['refusal.APPROVAL_RULE_INVALID'],
  }),
  APPROVAL_KIND_UNKNOWN: Object.freeze({
    check: 'C-147.8', where: at("projectApprovalSet", "is-project-approval-set"),
    translation: PROJECT_SCOPE_WORDS['refusal.APPROVAL_KIND_UNKNOWN'],
  }),
});
