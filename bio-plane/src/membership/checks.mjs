/* membership's own refusal rows (requirements: `build/requirements/membership.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached.
 *
 * The rest of this module's rows are still in the check catalogue (C-29, C-55, C-56, C-57, C-63, C-70.1–.4, C-95,
 * C-96), until those checks move here. The row below is new with R78 (N208, N146, K275: `NO_SUCH_PROJECT` is one
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
 * N364 (DEC-80 item 4, K509 (2)): SIGNER_KEY_HELD_BY_ANOTHER is R89's, a member registering a key another member holds,
 * minted at its one site in `signerRegisterOwn`; its row is C-96.15, as the requirement names it, worded there. */

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
  SIGNER_KEY_HELD_BY_ANOTHER: Object.freeze({
    check: 'C-96.15', where: at("signerRegisterOwn", "is-signer-key-held"),
    translation: 'This key is registered to another member, so it cannot be yours. Make a new key in this browser. '
      + 'Nothing was changed.',
  }),
  EXPERTISE_NO_LABEL: Object.freeze({
    check: 'C-96.13', where: at("expertiseDeclare", "is-expertise-labelled"),
    translation: "An expertise is declared by a name a person can read, such as 'CPA', and this one has none. "
      + 'Nothing was written.',
  }),
});
