/* credentials' own refusal rows (requirements: `build/requirements/credentials.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached. Each row's `where` names its one site in this module.
 *
 * Copied at the split (K617, K637; T19 layer 2, CREDENTIALS #1), ids and words unchanged, `where`s re-pointed here:
 *   - `SIGNER_ENROLMENT_CHECKS` (C-63) and `AI_CREDENTIAL_CHECKS` (C-29's mint and revocation rows) from the check
 *     catalogue (✱, family names kept; the catalogue's copies are deleted after membership's deletion, K636 BOB-2);
 *   - `CREDENTIALS_CHECKS`: C-96.8 `BAD_KEY` (from the catalogue's `CUSTODIAL_CHECKS`, minted only in `signerAdd`) and
 *     C-96.15–.17 (from `membership/checks.mjs`, R9's three rows). C-96.1 `NOT_AN_ADMIN` stays membership's: R6, R7 and
 *     R13 answer through `membership.notAnAdmin` (its R84). */

const at = (fn, region) => `src/credentials/index.mjs ${fn} > ${region}`;

/* D-158 / C-63: a signing key is registered to a member who can attest (Membership Architecture v2 §6). Two codes for
   two facts: a member with no handle has never enrolled; one who has a handle and is not `active` is not standing. Both
   are minted in one region, `#signerMemberBar`, which R6, R7's activation and R9 consume. */
export const SIGNER_ENROLMENT_CHECKS = Object.freeze({
  SIGNER_MEMBER_NOT_ENROLLED: Object.freeze({
    check: 'C-63.1', where: at("#signerMemberBar", "is-signer-member-attesting"),
    translation: 'That person has not enrolled yet. A signing key belongs to a member who has taken up '
      + 'their invitation and chosen a handle; until then this instance would refuse anything signed '
      + 'with it, so registering it now would put a key on the roster that cannot sign. Nothing was '
      + 'written. Send them their invitation link, and register the key once they have enrolled.',
  }),
  SIGNER_MEMBER_NOT_ACTIVE: Object.freeze({
    check: 'C-63.2', where: at("#signerMemberBar", "is-signer-member-attesting"),
    translation: 'That member’s membership is not active, so this instance would refuse anything '
      + 'signed with their key. Nothing was written. Reinstate the member first if they should be '
      + 'able to sign again.',
  }),
});

/* C-29 — the `ai` credential (PL-11 / IS-5, D-199): the mint's and the revocation's rows (C-29.1–.5, C-29.11). The
   reach question, what a declared scope admits (C-29.6–.10), is the control plane's (`AI_SCOPE_CHECKS`). */
export const AI_CREDENTIAL_CHECKS = Object.freeze({
  /* D-199 (3): "If an agent can request a broader token, the scoping is theatre." */
  AI_CREDENTIAL_MINT_NOT_A_MEMBER: Object.freeze({
    check: 'C-29.1', where: at("aiCredentialMint", "is-ai-credential-mint"),
    translation: 'Only a named person signed in to this instance can create an agent credential. '
      + 'Deciding what an automated worker is allowed to reach is a judgement somebody has to be '
      + 'accountable for, so an automated worker cannot make it — not even about itself.',
  }),
  /* D-199 (4) / DEC-55 det 4: an act says which principal stands behind it. */
  AI_CREDENTIAL_PRINCIPAL_UNSTATED: Object.freeze({
    check: 'C-29.2', where: at("aiCredentialMint", "is-ai-credential-mint"),
    translation: 'An agent credential has to say who stands behind it: the organisation as a whole, '
      + 'or one named member. The two carry different accountability and they see different things, '
      + 'so the record will not hold one that says neither.',
  }),
  /* The identity is what acts cite, so it is never rebound. */
  AI_CREDENTIAL_IDENTITY_TAKEN: Object.freeze({
    check: 'C-29.3', where: at("aiCredentialMint", "is-ai-credential-mint"),
    translation: 'That name already belongs to an agent credential on this instance. Acts in the '
      + 'record cite the name, so binding it to something new would quietly change who did work that '
      + 'has already been done. Retire the old one or choose another name.',
  }),
  /* The row carries `revoked_by`, and a machine name there would record a decision nobody in the group made. */
  AI_CREDENTIAL_REVOKE_NOT_A_MEMBER: Object.freeze({
    check: 'C-29.4', where: at("aiCredentialRevoke", "is-ai-credential-revoke"),
    translation: 'Withdrawing an agent credential is recorded against the person who withdrew it, so '
      + 'a named member has to be the one doing it. An automated caller has no name to put there and '
      + 'the record would then show a decision nobody made.',
  }),
  AI_CREDENTIAL_UNKNOWN: Object.freeze({
    check: 'C-29.5', where: at("aiCredentialRevoke", "is-ai-credential-revoke"),
    translation: 'There is no agent credential by that name on this instance, so nothing was '
      + 'withdrawn. Being told that plainly matters more than it looks: believing you have taken an '
      + 'authority away when you have not is the worse of the two outcomes.',
  }),
  /* R14: a member-scoped credential's principal is the member who mints it. */
  AI_CREDENTIAL_PRINCIPAL_NOT_THE_MINTER: Object.freeze({
    check: 'C-29.11', where: at("aiCredentialMint", "is-ai-credential-mint"),
    translation: 'A credential that acts for one member acts for the member who creates it, and nobody else. '
      + 'You named another member, and nobody can authorise an agent in someone else\'s name: it would see '
      + 'what they see and its work would be recorded as theirs. Nothing was created. The member it should '
      + 'act for can create it themselves.',
  }),
});

/* C-96's rows for the acts on a member's keys: R6's key shape (C-96.8) and R9's three (C-96.15–.17). */
export const CREDENTIALS_CHECKS = Object.freeze({
  BAD_KEY: Object.freeze({
    check: 'C-96.8', where: at("signerAdd", "is-signer-key-shape"),
    translation: 'That is not a public key this group can register. It takes the base64 part of an '
      + 'ssh-ed25519 public key, the part that begins AAAA. Nothing was written.',
  }),
  SIGNER_KEY_HELD_BY_ANOTHER: Object.freeze({
    check: 'C-96.15', where: at("signerRegisterOwn", "is-signer-key-held"),
    translation: 'This key is registered to another member, so it cannot be yours. Make a new key in this browser. '
      + 'Nothing was changed.',
  }),
  SIGNER_KEY_REVOKED: Object.freeze({
    check: 'C-96.16', where: at("signerRegisterOwn", "is-signer-key-revoked"),
    translation: 'This key was revoked, so it cannot be registered again. Make a new key in this browser, or ask an '
      + 'administrator. Nothing was changed.',
  }),
  MACHINE_CANNOT_REGISTER_KEY: Object.freeze({
    check: 'C-96.17', where: at("signerRegisterOwn", "is-machine-register-key"),
    translation: 'A member registers their own signing key, from their own signed-in session. The credential that '
      + 'asked here has no member behind it: it is an automated one, the operator\'s token, or a call with nobody '
      + 'signed in. Sign in as yourself to register your key, or ask an administrator to register one for you. '
      + 'Nothing was changed.',
  }),
});
