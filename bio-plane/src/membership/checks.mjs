/* membership's own refusal rows (requirements: `build/requirements/membership.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached.
 *
 * Its families C-55, C-56.1–.2, C-57, C-70.1–.3 and C-96.2–.12 (but C-96.8), and C-33.48, are held here since T19
 * layer 2 (below); T38 (N783, K2270): C-56.5, C-33.28, C-70.4 and the C-95 family went to `project-roster` with the acts
 * that mint them; C-29, C-63 and C-96.8 are `credentials`'. The row below is new with R78 (N208, N146, K275: `NO_SUCH_PROJECT` is one
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

import { rowWord } from "./words.mjs";

const at = (fn, region) => `src/membership/index.mjs ${fn} > ${region}`;

/* R133 (T47; K3037): every refusal-row table this module exports is a frozen map from a code to a frozen row, read by
   promotion's row census and answer-envelope and written by no one. */
const frozenRows = (table) => Object.freeze(Object.fromEntries(
  Object.entries(table).map(([code, row]) => [code, Object.freeze({ ...row })])));

export const MEMBERSHIP_CHECKS = frozenRows({
  NOT_AN_ADMIN: Object.freeze({
    check: 'C-96.1', where: at("notAnAdmin", "is-custodial-admin"),
    translation: rowWord("NOT_AN_ADMIN"),
  }),
  NO_SUCH_PROJECT: Object.freeze({
    check: 'C-70.5', where: at("noSuchProject", "is-project-seen"),
    translation: rowWord("NO_SUCH_PROJECT"),
  }),
  NOT_PROPOSED: Object.freeze({
    check: 'C-96.14', where: at("adminEndorse", "is-endorse-proposed"),
    translation: rowWord("NOT_PROPOSED"),
  }),
  NOT_A_PARTICIPANT: Object.freeze({
    check: 'C-56.3', where: at("notAParticipant", "is-not-a-participant"),
    translation: rowWord("NOT_A_PARTICIPANT"),
  }),
  TARGET_NOT_A_PARTICIPANT: Object.freeze({
    check: 'C-56.4', where: at("projectRemove", "is-remove-target-participant"),
    translation: rowWord("TARGET_NOT_A_PARTICIPANT"),
  }),
  LISTENER_MALFORMED: Object.freeze({
    check: 'C-102.11', where: at("listenerRefusal", "is-listener-registration"),
    translation: rowWord("LISTENER_MALFORMED"),
  }),
  LISTENER_DECLARED: Object.freeze({
    check: 'C-102.12', where: at("listenerRefusal", "is-listener-registration"),
    translation: rowWord("LISTENER_DECLARED"),
  }),
  /* R95 (K774): an enrolment whose password the registered setter could not record (or with no setter registered).
     The next free number of C-96, this module's family for the acts on a member's own row (K107 (3), K174). */
  ENROL_NOT_RECORDED: Object.freeze({
    check: 'C-96.18', where: at("#enrolNotRecorded", "is-enrol-password-set"),
    translation: rowWord("ENROL_NOT_RECORDED"),
  }),
  EXPERTISE_NO_LABEL: Object.freeze({
    check: 'C-96.13', where: at("expertiseDeclare", "is-expertise-labelled"),
    translation: rowWord("EXPERTISE_NO_LABEL"),
  }),
  /* T19 layer 2 (the families' move): C-33.48 COPIED from the catalogue's `ACT_SHAPE_CHECKS`, row and translation
     unchanged (entities' C-33.25 precedent); C-33.28 LAST_OWNER went with `projectOwnerRemove` to `project-roster` (T38). */
  LAST_COMMITTED_OWNER: {
    check: 'C-33.48',
    where: 'src/membership/index.mjs projectLeave > is-leave-owner-floor',
    translation: rowWord("LAST_COMMITTED_OWNER"),
  },
  /* ===== T34 (T34-10; DEC-132 to DEC-136, Bob's; K1745): the next free numbers of C-96, this module's family for the
     acts on a member's row and the group's custodial acts (K107 (3), K174). C-96.19–.21 are credentials'. Each code is
     minted at one site, the region its `where` names. ===== */
  /* R10 (DEC-134 (4)): only the last administrator is stopped from stepping down. */
  LAST_ADMIN: Object.freeze({
    check: 'C-96.22', where: at("adminResign", "is-admin-resign-last"),
    translation: rowWord("LAST_ADMIN"),
  }),
  /* R97 (DEC-133 (2)): an invitation lasts a whole number of days from 1 to 30, seven when not chosen. */
  BAD_EXPIRY: Object.freeze({
    check: 'C-96.23', where: at("#expiryRefusal", "is-invitation-expiry"),
    translation: rowWord("BAD_EXPIRY"),
  }),
  /* R98 (DEC-133 (3)): only an unused invitation is withdrawn. */
  NO_UNUSED_INVITATION: Object.freeze({
    check: 'C-96.24', where: at("inviteWithdraw", "is-invitation-unused"),
    translation: rowWord("NO_UNUSED_INVITATION"),
  }),
  /* R99 (DEC-133 (1)): at most one live website key. */
  WEBSITE_KEY_EXISTS: Object.freeze({
    check: 'C-96.25', where: at("websiteKeyCreate", "is-website-key-one"),
    translation: rowWord("WEBSITE_KEY_EXISTS"),
  }),
  /* R99, R100, R102, R103: the daily number of invitations a door may make, which the administrator sets. */
  BAD_DAILY_CAP: Object.freeze({
    check: 'C-96.26', where: at("#dailyCapRefusal", "is-door-daily-cap"),
    translation: rowWord("BAD_DAILY_CAP"),
  }),
  /* R100: the acts on the live website key, when none is live. */
  NO_WEBSITE_KEY: Object.freeze({
    check: 'C-96.27', where: at("#liveWebsiteKey", "is-website-key-live"),
    translation: rowWord("NO_WEBSITE_KEY"),
  }),
  /* R101: the website's call with a key never made, switched off or malformed: one answer for each. */
  WEBSITE_KEY_UNKNOWN: Object.freeze({
    check: 'C-96.28', where: at("websiteInvite", "is-website-key-known"),
    translation: rowWord("WEBSITE_KEY_UNKNOWN"),
  }),
  /* R101: the key's daily cap reached. */
  WEBSITE_DAILY_CAP: Object.freeze({
    check: 'C-96.29', where: at("websiteInvite", "is-website-daily-cap"),
    translation: rowWord("WEBSITE_DAILY_CAP"),
  }),
  /* R102 (DEC-133 (6)): at most one live join link. */
  JOIN_LINK_ON: Object.freeze({
    check: 'C-96.30', where: at("joinLinkEnable", "is-join-link-one"),
    translation: rowWord("JOIN_LINK_ON"),
  }),
  /* R103: the acts on the live join link, when none is live. */
  JOIN_LINK_OFF: Object.freeze({
    check: 'C-96.31', where: at("#liveJoinLink", "is-join-link-live"),
    translation: rowWord("JOIN_LINK_OFF"),
  }),
  /* R104: the join page's call with a link never made, replaced, switched off or malformed: one answer for each. */
  NO_SUCH_JOIN_LINK: Object.freeze({
    check: 'C-96.32', where: at("joinLinkInvite", "is-join-link-known"),
    translation: rowWord("NO_SUCH_JOIN_LINK"),
  }),
  /* R104: the link's daily cap reached. */
  JOIN_LINK_DAILY_CAP: Object.freeze({
    check: 'C-96.33', where: at("joinLinkInvite", "is-join-link-daily-cap"),
    translation: rowWord("JOIN_LINK_DAILY_CAP"),
  }),
  /* R107 (DEC-136 (1)): tell our members, or don't. */
  COURT_NOTICE_UNKNOWN_CHOICE: Object.freeze({
    check: 'C-96.34', where: at("courtNoticeSet", "is-court-notice-choice"),
    translation: rowWord("COURT_NOTICE_UNKNOWN_CHOICE"),
  }),
  /* R109 (DEC-132 (2)): the group's kinds come from one closed list. */
  GROUP_KIND_UNKNOWN: Object.freeze({
    check: 'C-96.35', where: at("groupDescriptionSet", "is-group-description"),
    translation: rowWord("GROUP_KIND_UNKNOWN"),
  }),
  GROUP_KIND_OTHER_EMPTY: Object.freeze({
    check: 'C-96.36', where: at("groupDescriptionSet", "is-group-description"),
    translation: rowWord("GROUP_KIND_OTHER_EMPTY"),
  }),
  GROUP_DESCRIPTION_TOO_LONG: Object.freeze({
    check: 'C-96.37', where: at("groupDescriptionSet", "is-group-description"),
    translation: rowWord("GROUP_DESCRIPTION_TOO_LONG"),
  }),
  GROUP_VISIBILITY_UNKNOWN: Object.freeze({
    check: 'C-96.38', where: at("groupDescriptionSet", "is-group-description"),
    translation: rowWord("GROUP_VISIBILITY_UNKNOWN"),
  }),
  /* N793 (K231; T38-4): one code, one site. `NO_SUCH_MEMBER` is minted only by `noSuchMember`, which every module
     refusing that condition calls; a free number of C-96 (C-96.39 is credentials'; K2279), and instance-setup's C-64.18 gives way to it. */
  NO_SUCH_MEMBER: Object.freeze({
    check: 'C-96.47', where: at("noSuchMember", "is-no-such-member"),
    translation: rowWord("NO_SUCH_MEMBER"),
  }),
  /* ===== T40 (T40-M; N797, N799; DEC-184, DEC-186; K2394; R126): a member's handle, checked as it is typed (R123). The
     next free numbers of C-96, this module's family for the acts on a member's own row (K107 (3), K174; C-96.47 the
     last held at the job's START). Each code is minted at one site, the region its `where` names. T46 (DEC-197, R126):
     C-96.49 HANDLE_CHANGE_NOT_A_MEMBER, C-96.50 (HANDLE_FIXED's published-case condition) and C-96.51
     HANDLE_CHANGE_UNCHECKED are retired with R124, their numbers never reused. ===== */
  /* R123 (K1881): the check's protective window, 60 checks in any 10 minutes per invitation or member. The translation
     is `words.json`'s `handle.refused.paused`, read by key, `{minutes}` the answer's `minutes` (DEC-188 (7)). */
  HANDLE_CHECK_PAUSED: Object.freeze({
    check: 'C-96.48', where: at("handleCheck", "is-handle-check-window"),
    translation: rowWord("HANDLE_CHECK_PAUSED"),
  }),
  /* ===== T46 (T46-4; N934; DEC-196, DEC-197; K2903; R129, R126): a handle is chosen at joining and never changed, so
     `op=handlechange` refuses every call. The code keeps its name; its one condition is now R129's, on a new row, the
     next free number of C-96 (C-96.51 the last held at the job's START). The translation is `words.json`'s
     `refusal.HANDLE_FIXED`, read by key since T49 (N1075, K3269). R144's founder-handle act answers through the same row. ===== */
  HANDLE_FIXED: Object.freeze({
    check: 'C-96.52', where: at("#handleFixed", "is-handle-fixed"),
    translation: rowWord("HANDLE_FIXED"),
  }),
  /* ===== T49 (T49-1; N1072; Bob's K3265; R144): only the founder sets the founder's handle. The next free number of C-96
     (C-96.53 is credentials' RECOVERY_CODES_NOT_A_MEMBER). BOB's draft, re-wordable by the UX stream. ===== */
  FOUNDER_HANDLE_NOT_FOUNDER: Object.freeze({
    check: 'C-96.54', where: at("founderHandleSet", "is-founder-handle-founder"),
    translation: rowWord("FOUNDER_HANDLE_NOT_FOUNDER"),
  }),
  /* ===== T45 (T45-2; N893, Actions D4; R128): the project-act guard could not answer (a throw, a promise or an answer
     it does not give), so the invitation or the visibility setting fails closed. The next free number of C-56, a
     person's acts in a project (C-56.5 is project-roster's; K107 (3), K174). T47 (R142 (2), K3078): its translation is
     `words.json`'s `refusal.PROJECT_GUARD_UNCHECKED`, read by key (a row change for T48's stamp). ===== */
  PROJECT_GUARD_UNCHECKED: Object.freeze({
    check: 'C-56.6', where: at("#projectActGuarded", "is-project-guard-checked"),
    translation: rowWord("PROJECT_GUARD_UNCHECKED"),
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
export const MEMBER_ID_CHECKS = frozenRows({
  MEMBER_ID_RESERVED: {
    check: 'C-55.1',
    where: 'src/membership/index.mjs memberAdd > is-member-id-reserved',
    translation: rowWord("MEMBER_ID_RESERVED"),
  },
});

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
 * NO_SUCH_KEY and BAD_STATUS are NOT given rows: the surface sends only keys the plane listed to it (no signer row
 * is ever deleted) and only the two statuses the ops take, so it cannot receive them; EXPERTISE_IS_NOT_ASSIGNED
 * likewise, because the surface never sends `expertise`. NO_SUCH_MEMBER has its row since T38 (N793, K231): it is
 * minted by several modules for one condition, so it is minted at one site, `noSuchMember`, and its row is
 * MEMBERSHIP_CHECKS' C-96.47. */
export const CUSTODIAL_CHECKS = frozenRows({
  BAD_MEMBER_ID: {
    check: 'C-96.2',
    where: 'src/membership/index.mjs memberAdd > is-member-add-id',
    translation: rowWord("BAD_MEMBER_ID"),
  },
  NO_COVER: {
    check: 'C-96.3',
    where: 'src/membership/index.mjs memberAdd > is-member-add-shape',
    translation: rowWord("NO_COVER"),
  },
  EXISTS: {
    check: 'C-96.4',
    where: 'src/membership/index.mjs memberAdd > is-member-add-shape',
    translation: rowWord("EXISTS"),
  },
  /* C-96.5 ADMINS_FIRST is retired (DEC-134 (1), R12) and never reused. */
  CONSENSUS_REQUIRED: {
    check: 'C-96.6',
    where: 'src/membership/index.mjs memberAdd > is-admin-consensus',
    translation: rowWord("CONSENSUS_REQUIRED"),
  },
  ADMIN_REQUIRES_VOTE: {
    check: 'C-96.7',
    where: 'src/membership/index.mjs memberSet > is-admin-requires-vote',
    translation: rowWord("ADMIN_REQUIRES_VOTE"),
  },
  TARGET_NOT_AN_ADMIN: {
    check: 'C-96.9',
    where: 'src/membership/index.mjs adminRemove > is-remove-target-admin',
    translation: rowWord("TARGET_NOT_AN_ADMIN"),
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
    translation: rowWord("NO_HOLDERS"),
  },
  /* Membership R19 (§3, "Pairing"): whether a member's cover and handle are shown together is that member's
     decision, or an administrator's. */
  PAIRING_NOT_YOURS: {
    check: 'C-96.12',
    where: 'src/membership/index.mjs memberPairingSet > is-pairing-yours',
    translation: rowWord("PAIRING_NOT_YOURS"),
  },
});

/* REC-134 / C-56 — SIGHT IS NOT AUTHORITY (Membership Architecture v2 §7, the block of that
 * name, BOB #15, 2026-09-18; §4.9: *"the custodial role can audit everything and direct
 * nothing"*). An act that changes a project, its productions or their grants asks the ACTOR'S
 * OWN POSITION IN THAT PROJECT — never what the actor may SEE. An administrator (enrolled, or
 * the founder) saw every project (every discoverable one since D54) and so passed every act whose only barrier was the
 * visibility gate; these two rows are what such an act now answers when the position is
 * missing. The positions are §7's: a JOINED participant holds the working rights (§7.5 —
 * invited-not-joined is view only), and an OWNER holds the acts §7 and DEC-72 reserve to the
 * owner. §7.13's add-an-owner is the one administrator path and is NOT behind this family.
 * A machine credential carries no position and is not asked (the fences on machines are
 * their own and unchanged). */
export const PROJECT_AUTHORITY_CHECKS = frozenRows({
  PROJECT_ACT_NOT_A_PARTICIPANT: {
    check: 'C-56.1',
    where: 'src/membership/index.mjs projectAuthority > is-project-authority',
    translation: rowWord("PROJECT_ACT_NOT_A_PARTICIPANT"),
  },
  /* T40 (R122; N812, K231): minted at one site, `notTheOwner`, which `projectAuthority` (R55) and `credentials`
     (its R54–R57) answer through; the row's `where` moved there, its words unchanged. */
  PROJECT_ACT_NOT_THE_OWNER: {
    check: 'C-56.2',
    where: 'src/membership/index.mjs notTheOwner > is-not-the-owner',
    translation: rowWord("PROJECT_ACT_NOT_THE_OWNER"),
  },
});

/* REC-149 / C-70 — A DISCOVERABLE PROJECT SHOWS ITS EXISTENCE, NOT ITS DOORS (Membership Architecture
 * v2 §7, item 7.14, BOB #16 from Bob's ruling of 2026-09-18, *"each project chooses"*). A member who
 * is outside a DISCOVERABLE project sees its id and name in the directory, and nothing else. Every act
 * such a member aims at it — other than the request to join — is refused POSITIONALLY with this code,
 * carrying the project's id and name and NOTHING else. A "does not exist" answer there would be false
 * about a project the directory has just shown the caller; a HIDDEN project still answers exactly as
 * one that does not exist (§7.9, REC-138) to every member who is not an administrator. D54 (K2408, K2409;
 * T41-3): an administrator neither invited nor joined to a HIDDEN project is at its EXISTENCE too, and this
 * code then also carries its owners' handles (membership R77). C-70.1's translation is true of both forms.
 * Minted in ONE region, `Membership#existenceOnly`, which every act's sight check relays. */
export const PROJECT_VISIBILITY_CHECKS = frozenRows({
  PROJECT_SEEN_NOT_A_PARTICIPANT: {
    check: 'C-70.1',
    where: 'src/membership/index.mjs #existenceOnly > is-project-existence-only',
    translation: rowWord("PROJECT_SEEN_NOT_A_PARTICIPANT"),
  },
  PROJECT_VISIBILITY_NOT_THE_OWNER: {
    check: 'C-70.2',
    where: 'src/membership/index.mjs projectVisibilitySet > is-project-visibility-owner',
    translation: rowWord("PROJECT_VISIBILITY_NOT_THE_OWNER"),
  },
  PROJECT_VISIBILITY_UNKNOWN_SETTING: {
    check: 'C-70.3',
    /* REC-197: the value check moved into one helper both doors ask (the owner's act and a creation's
       `visibility`), so this row names that helper's region and the code keeps ONE site. */
    where: 'src/membership/index.mjs visibilitySettingRefusal > is-project-visibility-setting',
    translation: rowWord("PROJECT_VISIBILITY_UNKNOWN_SETTING"),
  },
});

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
export const CASE_AUTHORITY_CHECKS = frozenRows({
  CASE_SIGNER_NOT_AN_OWNER: {
    check: 'C-57.1',
    /* REC-140 (2026-09-18): the region moved into `caseAuthority`, the ONE helper both ratify
       paths call — `op=caseratify` for the case document and `op=ratify` for a finding a
       ratified case pins (Publication rule 2 as BOB #15 applied it to D-429). The TRANSLATION
       was corrected from "this case" to "a case, and each finding in it" at the same time,
       because the same code now answers at both acts and the old sentence was false at one. */
    where: 'src/membership/index.mjs caseAuthority > is-case-signer-owner',
    translation: rowWord("CASE_SIGNER_NOT_AN_OWNER"),
  },
});
