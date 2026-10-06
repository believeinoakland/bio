/* membership's own refusal rows (requirements: `build/requirements/membership.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached.
 *
 * Its families C-55, C-56.1–.2, C-57, C-70.1–.4, C-95 and C-96.2–.12 (but C-96.8), and C-33.28 and C-33.48, are held here
 * since T19 layer 2 (below); C-29, C-63 and C-96.8 are `credentials`'. The row below is new with R78 (N208, N146, K275: `NO_SUCH_PROJECT` is one
 * condition, a project absent or unseen, answered as absent, so it is minted at one site, `noSuchProject`, and every
 * module answering that condition calls it). It takes the next free number of C-70, the sight family it belongs to
 * (K107 (3)'s rule: the job names a new code's row; K174: a module holds its new rows). Intent's C-111.2 and
 * conformance's C-113.2 give way to it.
 *
 * EXPERTISE_NO_LABEL is new with N285 (K275, K343): R21's no-label refusal was minted as the shared `NO_LABEL`, which
 * progressions and entities mint for conditions of their own; it gets its own code and this row. Membership's
 * expertise acts had no family in the catalogue, so it takes the next free number of C-96, this module's family for
 * the acts on a member's own row (K107 (3), K174).
 *
 * NOT_AN_ADMIN moved here with R84 (N324, K275, K403, K408): the stamped caller is not an administrator where the act
 * is an administrator's, one condition, so it is minted at one site, `notAnAdmin`, which every act refusing it answers
 * through (this module's, monitoring's R30, intent's R9 and bias's R11; N327 converged `ADMIN_ONLY` and
 * `AI_CREDENTIAL_ORG_NOT_ADMIN` into it, DEC-83). The row is C-96.1 unchanged but for its `where`; it is held here
 * alone since legacy-checks removed the catalogue's copy (K408 (4)).
 *
 * N128 (K275): LISTENER_MALFORMED and LISTENER_DECLARED are minted at one site, `listenerRefusal` (R81), so their rows
 * are this module's, the next free numbers of the registration family C-102 (K343's pattern), both in its one region.
 *
 * N335 (K275, K380): NOT_A_PARTICIPANT names one condition, the caller holds no participation in the project, minted at
 * `notAParticipant` (R87), which promotion's fork calls too; a TARGET holding none (R36) and a target not joined (R39)
 * are their own conditions and codes (`TARGET_NOT_AN_ADMIN`'s precedent). They take the next free numbers of C-56, a
 * person's position in a project. NOT_PROPOSED (R6) takes the next free number of C-96.
 *
 * N453 (K875, K910; T21): C-96.15–.17 (SIGNER_KEY_HELD_BY_ANOTHER, SIGNER_KEY_REVOKED, MACHINE_CANNOT_REGISTER_KEY),
 * C-96.8 BAD_KEY and C-63 left with the signer-key copies that answered them; `credentials` holds each as its own (its
 * R6, R9, R10). */

const at = (fn, region) => `src/membership/index.mjs ${fn} > ${region}`;

export const MEMBERSHIP_CHECKS = Object.freeze({
  NOT_AN_ADMIN: Object.freeze({
    check: 'C-96.1', where: at("notAnAdmin", "is-custodial-admin"),
    translation: 'Only an active administrator of this group can do that, and the account asking is not '
      + 'one of them here. The record reads who is asking from the signed-in session, never from the '
      + 'request. Nothing was changed.',
  }),
  NO_SUCH_PROJECT: Object.freeze({
    check: 'C-70.5', where: at("noSuchProject", "is-project-seen"),
    translation: 'No project answers to that id here. A project you cannot see is answered exactly as one that does '
      + 'not exist, so this is not a hint either way.',
  }),
  NOT_PROPOSED: Object.freeze({
    check: 'C-96.14', where: at("adminEndorse", "is-endorse-proposed"),
    translation: 'Only a member proposed as an administrator is endorsed, and this member is not proposed now: they '
      + 'were never proposed, or every administrator has already endorsed them. Nothing was changed.',
  }),
  NOT_A_PARTICIPANT: Object.freeze({
    check: 'C-56.3', where: at("notAParticipant", "is-not-a-participant"),
    translation: 'You hold no place in this project, and this is an act one of its participants takes. Nothing was '
      + 'changed. An owner of the project can invite you to it.',
  }),
  TARGET_NOT_A_PARTICIPANT: Object.freeze({
    check: 'C-56.4', where: at("projectRemove", "is-remove-target-participant"),
    translation: 'The member you named holds no place in this project, so there is nobody to remove from it. '
      + 'Nothing was changed.',
  }),
  TARGET_NOT_JOINED: Object.freeze({
    check: 'C-56.5', where: at("projectOwnerAdd", "is-owner-target-joined"),
    translation: 'An owner of a project is one of its participants who has joined it, and the member you named has '
      + 'not joined this project: they are invited and have not joined, have asked to leave, or hold no place in it. '
      + 'Nothing was changed. Once they have joined, they can be made an owner.',
  }),
  LISTENER_MALFORMED: Object.freeze({
    check: 'C-102.11', where: at("listenerRefusal", "is-listener-registration"),
    translation: 'A part of this instance tried to register a listener without naming itself or without a function '
      + 'to call, so nothing was registered. This is a fault in how the instance was built, not in the record, and '
      + 'nothing in the record changed.',
  }),
  LISTENER_DECLARED: Object.freeze({
    check: 'C-102.12', where: at("listenerRefusal", "is-listener-registration"),
    translation: 'A part of this instance tried to register a listener it had already registered, or one that '
      + 'another part already holds, so the second registration was refused and the first still stands. This is a '
      + 'fault in how the instance was built, not in the record, and nothing in the record changed.',
  }),
  /* R95 (K774): an enrolment whose password the registered setter could not record (or with no setter registered).
     The next free number of C-96, this module's family for the acts on a member's own row (K107 (3), K174). */
  ENROL_NOT_RECORDED: Object.freeze({
    check: 'C-96.18', where: at("#enrolNotRecorded", "is-enrol-password-set"),
    translation: 'Your enrolment could not be completed, because your password could not be recorded. Nothing was '
      + 'changed, and your invitation link still works: try again, or ask an administrator.',
  }),
  EXPERTISE_NO_LABEL: Object.freeze({
    check: 'C-96.13', where: at("expertiseDeclare", "is-expertise-labelled"),
    translation: "An expertise is declared by a name a person can read, such as 'CPA', and this one has none. "
      + 'Nothing was written.',
  }),
  /* T19 layer 2 (the families' move): C-33.28 and C-33.48 COPIED from the catalogue's `ACT_SHAPE_CHECKS`, rows and
     translations unchanged (entities' C-33.25 precedent). That table is split between modules; its copies leave the
     catalogue when the last owner holds its rows (rule 1). */
  LAST_OWNER: {
    check: 'C-33.28',
    where: 'src/membership/index.mjs projectOwnerRemove > is-owner-floor',
    translation: 'A project always has at least one owner, so the last one cannot be removed — the '
      + 'result would be work nobody is answerable for. Add another owner first, or stand the '
      + 'project down.',
  },
  LAST_COMMITTED_OWNER: {
    check: 'C-33.48',
    where: 'src/membership/index.mjs projectLeave > is-leave-owner-floor',
    translation: 'A project always keeps at least one owner who is committed to it, and this would leave it '
      + 'with none: every other owner has asked to leave, or there is no other owner. Add another owner first '
      + '— or stand the project down. Nothing was recorded.',
  },
  /* ===== T34 (T34-10; DEC-132 to DEC-136, Bob's; K1745): the next free numbers of C-96, this module's family for the
     acts on a member's row and the group's custodial acts (K107 (3), K174). C-96.19–.21 are credentials'. Each code is
     minted at one site, the region its `where` names. ===== */
  /* R10 (DEC-134 (4)): only the last administrator is stopped from stepping down. */
  LAST_ADMIN: Object.freeze({
    check: 'C-96.22', where: at("adminResign", "is-admin-resign-last"),
    translation: 'You are the only administrator of this group, so you cannot step down: the group would be left '
      + 'with nobody to run it. Nothing was changed. Add another administrator first, then resign.',
  }),
  /* R97 (DEC-133 (2)): an invitation lasts a whole number of days from 1 to 30, seven when not chosen. */
  BAD_EXPIRY: Object.freeze({
    check: 'C-96.23', where: at("#expiryRefusal", "is-invitation-expiry"),
    translation: 'An invitation lasts a whole number of days, from 1 to 30, and seven when you choose none. The '
      + 'number given is not one of those. Nothing was written.',
  }),
  /* R98 (DEC-133 (3)): only an unused invitation is withdrawn. */
  NO_UNUSED_INVITATION: Object.freeze({
    check: 'C-96.24', where: at("inviteWithdraw", "is-invitation-unused"),
    translation: 'There is no unused invitation for this member to withdraw: they have already joined, their '
      + 'invitation was already withdrawn, or none has been made yet. Nothing was changed.',
  }),
  /* R99 (DEC-133 (1)): at most one live website key. */
  WEBSITE_KEY_EXISTS: Object.freeze({
    check: 'C-96.25', where: at("websiteKeyCreate", "is-website-key-one"),
    translation: 'Your group already has a live website key, and it holds one at a time. Nothing was created. '
      + 'Change the live key\'s settings, or switch it off and create a new one.',
  }),
  /* R99, R100, R102, R103: the daily number of invitations a door may make, which the administrator sets. */
  BAD_DAILY_CAP: Object.freeze({
    check: 'C-96.26', where: at("#dailyCapRefusal", "is-door-daily-cap"),
    translation: 'Say how many invitations it may make in a day: a whole number, at least 1. Nothing was changed.',
  }),
  /* R100: the acts on the live website key, when none is live. */
  NO_WEBSITE_KEY: Object.freeze({
    check: 'C-96.27', where: at("#liveWebsiteKey", "is-website-key-live"),
    translation: 'Your group has no live website key, so there is none to change or switch off. Nothing was '
      + 'changed. An administrator can create one.',
  }),
  /* R101: the website's call with a key never made, switched off or malformed: one answer for each. */
  WEBSITE_KEY_UNKNOWN: Object.freeze({
    check: 'C-96.28', where: at("websiteInvite", "is-website-key-known"),
    translation: 'This website key does not open this group: it was never made, was switched off, or is not a '
      + 'key at all, and the answer does not say which. Nothing was written.',
  }),
  /* R101: the key's daily cap reached. */
  WEBSITE_DAILY_CAP: Object.freeze({
    check: 'C-96.29', where: at("websiteInvite", "is-website-daily-cap"),
    translation: 'The website has made as many invitations today as the group allows it in a day. Nothing was '
      + 'written. Try again later, or ask an administrator to raise the daily number.',
  }),
  /* R102 (DEC-133 (6)): at most one live join link. */
  JOIN_LINK_ON: Object.freeze({
    check: 'C-96.30', where: at("joinLinkEnable", "is-join-link-one"),
    translation: 'Your group\'s join link is already on, and it has one at a time. Nothing was changed. Change its '
      + 'settings, replace it with a new link, or switch it off.',
  }),
  /* R103: the acts on the live join link, when none is live. */
  JOIN_LINK_OFF: Object.freeze({
    check: 'C-96.31', where: at("#liveJoinLink", "is-join-link-live"),
    translation: 'Your group\'s join link is off, so there is none to change, replace or switch off. Nothing was '
      + 'changed. An administrator can switch one on.',
  }),
  /* R104: the join page's call with a link never made, replaced, switched off or malformed: one answer for each. */
  NO_SUCH_JOIN_LINK: Object.freeze({
    check: 'C-96.32', where: at("joinLinkInvite", "is-join-link-known"),
    translation: 'This join link does not work: it may have been replaced or switched off by the group. Ask the '
      + 'group for its current link. Nothing was written.',
  }),
  /* R104: the link's daily cap reached. */
  JOIN_LINK_DAILY_CAP: Object.freeze({
    check: 'C-96.33', where: at("joinLinkInvite", "is-join-link-daily-cap"),
    translation: 'This join link has let in as many people today as the group allows in a day. Nothing was '
      + 'written. Try again tomorrow.',
  }),
  /* R107 (DEC-136 (1)): tell our members, or don't. */
  COURT_NOTICE_UNKNOWN_CHOICE: Object.freeze({
    check: 'C-96.34', where: at("courtNoticeSet", "is-court-notice-choice"),
    translation: 'Choose whether your members are told what a court can reach: tell them, or don\'t. Nothing '
      + 'was changed.',
  }),
  /* R109 (DEC-132 (2)): the group's kinds come from one closed list. */
  GROUP_KIND_UNKNOWN: Object.freeze({
    check: 'C-96.35', where: at("groupDescriptionSet", "is-group-description"),
    translation: 'A group says what kind it is from the list: professional, issue-specific, neighbourhood or '
      + 'community, catch-all, or one it describes itself, and may choose none. Something else was given. '
      + 'Nothing was written.',
  }),
  GROUP_KIND_OTHER_EMPTY: Object.freeze({
    check: 'C-96.36', where: at("groupDescriptionSet", "is-group-description"),
    translation: 'You chose to describe your group\'s kind yourself and wrote nothing to describe it. Write it, '
      + 'or leave that choice out. Nothing was written.',
  }),
  GROUP_DESCRIPTION_TOO_LONG: Object.freeze({
    check: 'C-96.37', where: at("groupDescriptionSet", "is-group-description"),
    translation: 'Part of what you wrote is longer than it may be: a kind you describe yourself is at most 120 '
      + 'characters, the focus at most 1,000 and why the group exists at most 4,000. Nothing was written.',
  }),
  GROUP_VISIBILITY_UNKNOWN: Object.freeze({
    check: 'C-96.38', where: at("groupDescriptionSet", "is-group-description"),
    translation: 'Who sees what your group says about itself is your members only, or the public as well, and '
      + 'nothing else. Nothing was written.',
  }),
});

/* ===== T19 layer 2: membership's families, COPIED from the check catalogue with their names, ids, `where`s and
   translations unchanged (`build/plan/current.md` layer 2; rule 1: the catalogue's copies are deleted by the job of
   their last importer). This module reads its own copies; `SIGNER_ENROLMENT_CHECKS` (C-63) and `AI_CREDENTIAL_CHECKS`
   (C-29) are `credentials`'. Each family keeps the catalogue's comment, which states why its rows exist. ===== */

/* REC-132 / D-422 / C-55 — THE MEMBER ID `admin` IS RESERVED (Membership Architecture v2 §7,
 * "THE FOUNDER IS AN ADMINISTRATOR HERE TOO", BOB #15, 2026-09-18).
 *
 * WHY A REFUSAL AND NOT A CONVENTION. The founding administrator is named `admin`
 * (`Membership.ROOT_ADMIN`) and has no `members` row, and every check that asks whether
 * someone administers BY NAME (`isAdministrator`, `activeAdmins`) answers yes for that
 * string. So a member ENROLLED with the id `admin` would be read as the founder by every
 * one of them — votes counted, participant lists opened — without anybody having granted
 * it anything. `memberAdd` refuses the id, by name, before anything is written; an
 * instance already holding such a member is REPORTED by `op=audit`, never renamed.
 * The reservation is the ID, exactly: `administrator`, `admins` and `admin-2` are
 * ordinary ids. */
export const MEMBER_ID_CHECKS = {
  MEMBER_ID_RESERVED: {
    check: 'C-55.1',
    where: 'src/membership/index.mjs memberAdd > is-member-id-reserved',
    translation: 'That member id is reserved. `admin` is the name this instance gives its founding '
      + 'administrator, and anything that checks whether someone is an administrator by name would '
      + 'read a member enrolled as `admin` as the founder. Nothing was written. Choose a different id '
      + 'for this person.',
  },
};

/* D-134 / C-96 — THE CUSTODIAL ACTS' REFUSALS, SAID IN WORDS (Membership Architecture v2 §4.9, *"What
 * an administrator does"*; DEC-49). D-134 gave an administrator's session a surface over `memberadd`,
 * `memberset`, `signeradd` and `signerset`, and every refusal that surface can receive must arrive with a
 * canned translation rather than as a machine token. MEMBER_ID_RESERVED (C-55.1) and the two SIGNER_MEMBER
 * rows (C-63) already had one; these are the rest. C-96.1 NOT_AN_ADMIN, the caller who is not an administrator,
 * is membership's (`src/membership/checks.mjs` MEMBERSHIP_CHECKS, minted at one site, `notAnAdmin`; K408 (4)):
 * its copy here went in T14. C-96.8 BAD_KEY, the signer acts' row, is `credentials`' (its R6); its copy here went in
 * T21 (N453).
 *
 * A ROW TRANSLATES ITS CODE AT EVERY SITE THAT MINTS IT, NOT ONLY AT ITS `where`: the control plane's
 * `dec49Decorate` (control-plane) attaches a family row's `check` and `translation` to ANY refusal carrying the
 * row's code on its way out. So each sentence below was checked against every site that mints its code,
 * and is written to be true at all of them:
 *   TARGET_NOT_AN_ADMIN `adminRemove`, a member named for removal who is not an administrator: split from
 *                      NOT_AN_ADMIN (the CALLER, membership's row), because no single sentence is true of both
 *                      facts;
 *   EXISTS             `memberAdd` (a member id) and `promote` (a bundle created against an existing one;
 *                      promotion R1, `src/promotion/index.mjs` `#promote` since T3-3: N36 is served by this
 *                      row, because one code holds one row and this sentence is true at both sites);
 *   CONSENSUS_REQUIRED `memberAdd` and `adminEndorse` (§4.7's administrators) and `projectOwnerAdd`
 *                      (§7.10's owners).
 * NO_SUCH_MEMBER, NO_SUCH_KEY and BAD_STATUS are NOT given rows: the surface sends only ids and keys the
 * plane listed to it (no member or signer row is ever deleted) and only the two statuses the ops take, so it
 * cannot receive them; EXPERTISE_IS_NOT_ASSIGNED likewise, because the surface never sends `expertise`. */
export const CUSTODIAL_CHECKS = {
  BAD_MEMBER_ID: {
    check: 'C-96.2',
    where: 'src/membership/index.mjs memberAdd > is-member-add-id',
    translation: 'A member id is 2 to 41 characters of lowercase letters, digits and dashes, and starts with '
      + 'a letter or a digit. Nothing was written. It is the name the record keeps for this person; the '
      + 'handle they sign in with is theirs to choose when they enrol.',
  },
  NO_COVER: {
    check: 'C-96.3',
    where: 'src/membership/index.mjs memberAdd > is-member-add-shape',
    translation: 'A cover is needed: the label you use to tell members apart. It need not be, and often '
      + 'should not be, a legal name. Nothing was written.',
  },
  EXISTS: {
    check: 'C-96.4',
    where: 'src/membership/index.mjs memberAdd > is-member-add-shape',
    translation: 'That id is already taken in this record, so nothing new was created under it. Choose a '
      + 'different id.',
  },
  /* C-96.5 ADMINS_FIRST is retired (DEC-134 (1), R12) and never reused. */
  CONSENSUS_REQUIRED: {
    check: 'C-96.6',
    where: 'src/membership/index.mjs memberAdd > is-admin-consensus',
    translation: 'This addition needs the agreement of everyone who must agree to it — every existing '
      + 'administrator, or for a project every existing owner — and not all of them have agreed yet, so it '
      + 'has not taken effect. The answer lists who has agreed and who it is still waiting on.',
  },
  ADMIN_REQUIRES_VOTE: {
    check: 'C-96.7',
    where: 'src/membership/index.mjs memberSet > is-admin-requires-vote',
    translation: 'An administrator cannot be deactivated by another administrator acting alone. Removing an '
      + 'administrator takes a majority of all administrators, in which the one facing removal is counted '
      + 'but does not vote. Nothing was changed.',
  },
  TARGET_NOT_AN_ADMIN: {
    check: 'C-96.9',
    where: 'src/membership/index.mjs adminRemove > is-remove-target-admin',
    translation: 'The member named is not an administrator, so there is no administrator to remove. An '
      + 'ordinary member is deactivated instead, which one administrator can do. Nothing was changed.',
  },
  /* ---- T4 (legacy-checks, N44), 2026-09-27: MEMBERSHIP'S NEW ACTS (N18), SAID IN WORDS. ----
     Each code is minted at ONE site in `src/membership/index.mjs`. A whole-function `where` could not serve: each
     function also refuses with codes held elsewhere (NOT_AN_ADMIN, NO_SUCH_MEMBER), which a whole-function site
     would judge as not this family's. So each `where` names the DEC-49 region membership marks around its one
     refusal, and the control plane's `dec49Decorate` attaches the row at the wire. */
  /* C-96.10 RESIGN_AT_TWO is retired (DEC-134 (4), R10) and never reused; LAST_ADMIN (C-96.22) takes its place. */
  /* Membership R11 (§4.8): the record of who holds hosting access names somebody. */
  NO_HOLDERS: {
    check: 'C-96.11',
    where: 'src/membership/index.mjs hostingAccessSet > is-hosting-access-holders',
    translation: 'This records who holds access to the hosting account the group\'s instance runs in, and it '
      + 'named nobody. Write the people who hold that access. Nothing was written.',
  },
  /* Membership R19 (§3, "Pairing"): whether a member's cover and handle are shown together is that member's
     decision, or an administrator's. */
  PAIRING_NOT_YOURS: {
    check: 'C-96.12',
    where: 'src/membership/index.mjs memberPairingSet > is-pairing-yours',
    translation: 'Whether a member\'s cover is shown beside their handle is theirs to decide, or an '
      + 'administrator\'s, and you are neither for this member. Nothing was changed.',
  },
};

/* REC-134 / C-56 — SIGHT IS NOT AUTHORITY (Membership Architecture v2 §7, the block of that
 * name, BOB #15, 2026-09-18; §4.9: *"the custodial role can audit everything and direct
 * nothing"*). An act that changes a project, its productions or their grants asks the ACTOR'S
 * OWN POSITION IN THAT PROJECT — never what the actor may SEE. An administrator (enrolled, or
 * the founder) sees every project and so passed every act whose only barrier was the
 * visibility gate; these two rows are what such an act now answers when the position is
 * missing. The positions are §7's: a JOINED participant holds the working rights (§7.5 —
 * invited-not-joined is view only), and an OWNER holds the acts §7 and DEC-72 reserve to the
 * owner. §7.13's add-an-owner is the one administrator path and is NOT behind this family.
 * A machine credential carries no position and is not asked (the fences on machines are
 * their own and unchanged). */
export const PROJECT_AUTHORITY_CHECKS = {
  PROJECT_ACT_NOT_A_PARTICIPANT: {
    check: 'C-56.1',
    where: 'src/membership/index.mjs projectAuthority > is-project-authority',
    translation: 'Only someone working in this project can do that. You can see the project, but you '
      + 'have not joined it, and seeing a project does not let you change it — administrators included. '
      + 'Nothing was changed. Ask an owner of the project to invite you, then join it.',
  },
  PROJECT_ACT_NOT_THE_OWNER: {
    check: 'C-56.2',
    where: 'src/membership/index.mjs projectAuthority > is-project-authority',
    translation: 'Only an owner of this project can do that. You are not one of its owners, and seeing '
      + 'a project does not let you direct it — administrators included. Nothing was changed.',
  },
};

/* REC-149 / C-70 — A DISCOVERABLE PROJECT SHOWS ITS EXISTENCE, NOT ITS DOORS (Membership Architecture
 * v2 §7, item 7.14, BOB #16 from Bob's ruling of 2026-09-18, *"each project chooses"*). A member who
 * is outside a DISCOVERABLE project sees its id and name in the directory, and nothing else. Every act
 * such a member aims at it — other than the request to join — is refused POSITIONALLY with this code,
 * carrying the project's id and name and NOTHING else. A "does not exist" answer there would be false
 * about a project the directory has just shown the caller; a HIDDEN project still answers exactly as
 * one that does not exist (§7.9, REC-138), and this code is never said about one. Minted in ONE region,
 * `Membership#existenceOnly`, which every act's sight check relays. */
export const PROJECT_VISIBILITY_CHECKS = {
  PROJECT_SEEN_NOT_A_PARTICIPANT: {
    check: 'C-70.1',
    where: 'src/membership/index.mjs #existenceOnly > is-project-existence-only',
    translation: 'This project can be found, but you are not one of its participants, so you cannot do '
      + 'that in it or see what is inside it. Nothing was changed. You can ask its owners to add you.',
  },
  PROJECT_VISIBILITY_NOT_THE_OWNER: {
    check: 'C-70.2',
    where: 'src/membership/index.mjs projectVisibilitySet > is-project-visibility-owner',
    translation: 'Only an owner of this project can choose whether it can be found. You are not one of '
      + 'its owners, and seeing a project does not let you direct it — administrators included. '
      + 'Nothing was changed.',
  },
  PROJECT_VISIBILITY_UNKNOWN_SETTING: {
    check: 'C-70.3',
    /* REC-197: the value check moved into one helper both doors ask (the owner's act and a creation's
       `visibility`), so this row names that helper's region and the code keeps ONE site. */
    where: 'src/membership/index.mjs visibilitySettingRefusal > is-project-visibility-setting',
    translation: 'A project is either discoverable or hidden, and nothing else. Nothing was changed. '
      + 'Choose one of the two.',
  },
  PROJECT_DIRECTORY_NEEDS_A_MEMBER: {
    check: 'C-70.4',
    where: 'src/membership/index.mjs projectDirectory > is-project-directory-member',
    translation: 'The list of projects you can ask to join is for a signed-in member. Sign in as yourself to '
      + 'see it.',
  },
};

/* REC-150 / C-95 — THE REQUEST TO JOIN (Membership Architecture v2 §7, item 7.14, "The request to join"; step 2
 * of its decomposition, BOB #16 from Bob's ruling of 2026-09-18: *"somebody who sees the project can ask to be
 * added as a member"*). A member outside a DISCOVERABLE project asks (at most one open request per member per
 * project, an optional comment) and may withdraw; an OWNER grants — which writes the requester `invited`, never
 * `joined`, because joining is the member's own act (§7.4) — or declines; administrators and the founder see
 * requests and answer none; setting the project HIDDEN lapses every open request. Every refusal here is said
 * only where it discloses nothing: a request to a project the caller cannot see is `noSuchProject` byte for
 * byte and never a C-95 code, and a withdrawal with no open request is ONE answer whatever the id names. */
export const PROJECT_JOIN_REQUEST_CHECKS = {
  PROJECT_REQUEST_NEEDS_A_MEMBER: {
    check: 'C-95.1',
    where: 'src/membership/index.mjs #noRequester > is-join-request-member',
    translation: 'Asking to join a project, withdrawing that request and reading your own requests are things '
      + 'a signed-in member does for themselves. Sign in as yourself to do it. Nothing was changed.',
  },
  PROJECT_REQUEST_NOT_OUTSIDE: {
    check: 'C-95.2',
    where: 'src/membership/index.mjs projectRequest > is-join-request-ask',
    translation: 'You can already see this project, so there is nothing to ask. If you were invited, join it '
      + 'with its checkbox. Nothing was changed.',
  },
  PROJECT_REQUEST_ALREADY_OPEN: {
    check: 'C-95.3',
    where: 'src/membership/index.mjs projectRequest > is-join-request-ask',
    translation: 'You already have a request open to join this project. Its owners answer it; you can withdraw '
      + 'it and ask again. Nothing was changed.',
  },
  PROJECT_REQUEST_NONE_OPEN: {
    check: 'C-95.4',
    where: 'src/membership/index.mjs #noOpenRequest > is-join-request-none-open',
    translation: 'There is no open request to join here to act on. It may already have been answered, '
      + 'withdrawn or lapsed. Nothing was changed.',
  },
  PROJECT_REQUEST_ANSWER_NOT_THE_OWNER: {
    check: 'C-95.5',
    where: 'src/membership/index.mjs projectRequestAnswer > is-join-request-answer',
    translation: 'Only an owner of this project can grant or decline a request to join it. Administrators see '
      + 'requests and answer none. Nothing was changed.',
  },
  PROJECT_REQUEST_UNKNOWN_ANSWER: {
    check: 'C-95.6',
    where: 'src/membership/index.mjs projectRequestAnswer > is-join-request-answer',
    translation: 'A request to join is either granted or declined, and nothing else. Choose one of the two. '
      + 'Nothing was changed.',
  },
  PROJECT_REQUEST_REQUESTER_INACTIVE: {
    check: 'C-95.7',
    where: 'src/membership/index.mjs projectRequestAnswer > is-join-request-answer',
    translation: 'The member who asked is no longer active, so they cannot be invited. The request stays open; '
      + 'you can decline it. Nothing was changed.',
  },
  PROJECT_REQUEST_REQUESTER_ALREADY_A_PARTICIPANT: {
    check: 'C-95.8',
    where: 'src/membership/index.mjs projectRequestAnswer > is-join-request-answer',
    translation: 'The member who asked is already a participant of this project, so granting would invite '
      + 'nobody new. You can decline the request, or they can withdraw it. Nothing was changed.',
  },
  PROJECT_REQUESTS_NOT_VISIBLE: {
    check: 'C-95.9',
    where: 'src/membership/index.mjs projectRequests > is-join-requests-project',
    translation: 'A project\'s requests to join are seen by the people who asked, its owners and administrators. '
      + 'You can read your own requests without naming a project.',
  },
};

/* REC-137 / C-57 — A CASE RATIFICATION'S AUTHORITY IS ITS SIGNATURES, AND THEY MUST INCLUDE AN
 * OWNER OF THE PUBLISHING PROJECT (Membership Architecture v2 §7, the bullet *"A CASE
 * RATIFICATION: who AUTHORISES it and who may DELIVER it"*, BOB #15, 2026-09-18; DEC-72 clause 5:
 * publishing is the project owner's act). Before this, `op=caseratify` accepted the signature of
 * ANY registered signer of the instance — the instance-wide signer set and the `publish`
 * capability were the only authority asked — so a case authored by an owner could be committed
 * under a non-owner's signature, and the record then named that non-owner as the one who stood
 * behind the project's case. The DELIVERY half of the same bullet (an enrolled administrator with
 * no role in the project may not carry the signature in) is NOT in this family: it is REC-134's
 * one positional check, `projectAuthority`, asked of the deliverer, and answers C-56.1. */
export const CASE_AUTHORITY_CHECKS = {
  CASE_SIGNER_NOT_AN_OWNER: {
    check: 'C-57.1',
    /* REC-140 (2026-09-18): the region moved into `caseAuthority`, the ONE helper both ratify
       paths call — `op=caseratify` for the case document and `op=ratify` for a finding a
       ratified case pins (Publication rule 2 as BOB #15 applied it to D-429). The TRANSLATION
       was corrected from "this case" to "a case, and each finding in it" at the same time,
       because the same code now answers at both acts and the old sentence was false at one. */
    where: 'src/membership/index.mjs caseAuthority > is-case-signer-owner',
    translation: 'A case and each finding in it are published in the project\'s name, so each has to be '
      + 'signed by an owner of that project. This signature belongs to someone who is not one of its '
      + 'owners. Nothing was committed. Ask an owner of the project to review it and sign it.',
  },
};
