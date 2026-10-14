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

/* (T49; N1075, K3269) The words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this module's
   refusals carry, each `en` verbatim, read by key: the translation of each of the five rows that file keys is the word
   itself, never a copy. `{time}` in SIGN_IN_PAUSED's is left for the screen. */
export const CREDENTIALS_WORDS = Object.freeze({
  'refusal.SIGN_IN_PAUSED': 'Sign-in is paused for a while after too many tries from here. This keeps others from guessing passwords; it isn\'t a judgment on you. Try again at {time}.',
  'refusal.NOT_SIGNED_IN': 'You aren\'t signed in here any more: your sign-in ended, or you signed out on another device. Sign in again to go back to where you were.',
  'refusal.RECOVERY_REFUSED': 'That didn\'t work: the handle, the code or both aren\'t right, or the code was already used. Check them and try again. Nothing was changed.',
  'refusal.CURRENT_PASSWORD_WRONG': 'Your current password isn\'t right, so it wasn\'t changed. Check it and try again.',
  'refusal.AI_RUN_CREDENTIAL_MALFORMED': 'The run couldn\'t start: the pass it needs to work for you was malformed. Nothing was sent. Try again; if it happens again, tell an administrator.',
});


/* D-158 / C-63: a signing key is registered to a member who can attest (Membership Architecture v2 §6). Two codes for
   two facts: a member with no handle has never enrolled; one who has a handle and is not `active` is not standing. Both
   are minted in one region, `#signerMemberBar`, which R6, R7's activation and R9 consume. */
export const SIGNER_ENROLMENT_CHECKS = Object.freeze({
  SIGNER_MEMBER_NOT_ENROLLED: Object.freeze({
    check: 'C-63.1', where: at("#signerMemberBar", "is-signer-member-attesting"),
    translation: 'That person has not enrolled yet. A signing key belongs to a member who has taken up '
      + 'their invitation and chosen a handle; until then your group\'s Civicsmith would refuse anything signed '
      + 'with it, so registering it now would put a key on the roster that cannot sign. Nothing was '
      + 'written. Send them their invitation link, and register the key once they have enrolled.',
  }),
  SIGNER_MEMBER_NOT_ACTIVE: Object.freeze({
    check: 'C-63.2', where: at("#signerMemberBar", "is-signer-member-attesting"),
    translation: 'That member’s membership is not active, so your group\'s Civicsmith would refuse anything '
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
    translation: 'Only a named person signed in to your group\'s Civicsmith can create an agent credential. '
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
    translation: 'That name already belongs to an agent credential in your group\'s Civicsmith. Acts in the '
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
    translation: 'There is no agent credential by that name in your group\'s Civicsmith, so nothing was '
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
  /* R42 (F15; K1881, K1934): an agent credential expires after a whole number of days, 1 to 365, 90 when not given.
     T35's new row, awaiting promotion's stamp (T35-16). */
  AI_CREDENTIAL_BAD_EXPIRY: Object.freeze({
    check: 'C-29.28', where: at("aiCredentialMint", "is-ai-credential-expiry"),
    translation: 'An agent credential lasts a whole number of days, from 1 to 365, and 90 if you do not say. That '
      + 'was not one of them. Nothing was created. Choose a number of days, or leave it out.',
  }),
  /* R53 (T37-6; N761, K2129): a mint that carries no digest of its secret, the next free number of C-29. A new row,
     awaiting promotion's stamp (T37-7). */
  AI_CREDENTIAL_NO_SECRET: Object.freeze({
    check: 'C-29.33', where: at("aiCredentialMint", "is-ai-credential-digest"),
    translation: 'The agent credential could not be created, because your group\'s Civicsmith was not handed the '
      + 'fingerprint of its secret, and a credential without one could never be used. Nothing was created. Try again; '
      + 'if it keeps happening, tell whoever hosts your group\'s Civicsmith.',
  }),
  /* R63 (T47-9; N955, K2976): a run segment's credential asked for without its run, or with writes that are not the
     runner's, the next free number of C-29 after C-29.40 (this module's R64's then, `ai-accounts` R23's since T48). A
     new row, awaiting promotion's stamp (T47-10). */
  AI_RUN_CREDENTIAL_MALFORMED: Object.freeze({
    check: 'C-29.41', where: at("aiRunCredentialMint", "is-ai-run-credential-shape"),
    translation: CREDENTIALS_WORDS['refusal.AI_RUN_CREDENTIAL_MALFORMED'],
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

/* C-29's rows held here: the ask grant's (R27, R28, R31, R32; T33-20, T34), the sessions' lock and re-ask (R65, R66)
   and the administrator's reset link (R69). (T48; N996, K3101) The AI accounts' rows of C-29 (C-29.13–.15, .17,
   .19–.22, .27, .29, .31, .32, .34–.40, .44, .45) moved with their code to `ai-accounts`' `AI_ACCOUNT_CHECKS`, numbers,
   codes and words unchanged, so the family spans both modules' files (C-44's and C-136's precedent); `index.mjs`
   answers the two together as `ACCOUNT_CHECKS` until its readers re-point (R72). */
export const ACCOUNT_CHECKS = Object.freeze({
  GRANT_OP_REFUSED: Object.freeze({
    check: 'C-29.23', where: at("aiGrantAdmit", "is-grant-op"),
    translation: 'An answer to your question may only read the record through the reads an ask allows, and never '
      + 'change anything. This request was outside them. Nothing was read or changed.',
  }),
  GRANT_NOT_HELD: Object.freeze({
    check: 'C-29.24', where: at("#grantNotHeld", "is-grant-held"),
    translation: 'This ask\'s permission to read has ended: it lasts a short while, and ends when you sign out. Ask '
      + 'again. Nothing was read.',
  }),
  /* T34 (T34-11; K1609, K1755, K1757): R32's two refusals. Stamped by promotion (T34-12). */
  STANDING_SWITCH_OFF: Object.freeze({
    check: 'C-29.25', where: at("aiGrantMintStanding", "is-standing-grant"),
    translation: 'Standing questions are switched off for the Claude account that would answer this one, so the '
      + 'assistant did not look. Whoever holds that account can switch standing questions on. Nothing was read or '
      + 'changed.',
  }),
  NO_QUESTION: Object.freeze({
    check: 'C-29.26', where: at("aiGrantMintStanding", "is-standing-grant"),
    translation: 'A standing question needs its words, and none were given. Nothing was read or changed.',
  }),
  /* T47 (T47-81; K3060 D4, K3061 D3, K3069): the sessions' lock and re-ask (R65, R66) and the administrator's reset
     link (R69), of the next free numbers of C-29 at that job's START (C-29.42–.47; .44 and .45, the held sign-in's,
     moved to `ai-accounts`, T48). New rows, joining the row census red until T48's stamp. */
  REAUTH_DUE: Object.freeze({
    check: 'C-29.42', where: at("reauthDue", "is-reauth-window"),
    translation: 'Type your password again to do this. Signing or publishing a case, changing administrators and '
      + 'connecting Claude always ask for it. Nothing was changed.',
  }),
  SESSION_LOCKED: Object.freeze({
    check: 'C-29.43', where: at("sessionLockedRefusal", "is-session-unlocked"),
    translation: 'This page locked after a while without use. Type your password to carry on where you were, or sign '
      + 'out. Nothing was changed.',
  }),
  RESET_LINK_DEAD: Object.freeze({
    check: 'C-29.46', where: at("#resetLinkDead", "is-reset-link-live"),
    translation: 'This password reset link does not work any more: it was used, it expired, or a newer one was made. '
      + 'Nothing was changed. Ask an administrator for a new link.',
  }),
  RESET_LINK_MEMBER_NOT_ACTIVE: Object.freeze({
    check: 'C-29.47', where: at("passwordResetLinkMake", "is-reset-link-member"),
    translation: 'A password reset link is made only for an active member of your group. Nothing was made.',
  }),
});


/* R29 (K1449): the group's keys for keyed outside services. */
export const KEYED_SERVICE_CHECKS = Object.freeze({
  UNKNOWN_KEYED_SERVICE: Object.freeze({
    check: 'C-96.19', where: at("#keyedService", "is-keyed-service"),
    translation: 'That is not an outside service this group can hold a key for. Nothing was changed.',
  }),
  KEYED_SERVICE_NO_KEY: Object.freeze({
    check: 'C-96.20', where: at("keyedServiceSet", "is-keyed-service-key"),
    translation: 'No key was given for the service, so there is nothing to hold. Nothing was changed.',
  }),
  KEYED_SERVICE_OFF: Object.freeze({
    check: 'C-96.21', where: at("keyedServiceFor", "is-keyed-service-on"),
    translation: 'The group\'s key for this outside service is switched off, or no key is held, so it was not used. '
      + 'Everything still works without it.',
  }),
});

/* T35 (T35-15; F3, F14, N703, K1888; K1881, K1934): the sign-in window (R38), sign-out (R39), recovery (R47) and the
   security tally and map (R44, R45). New rows, the next free numbers of C-96, awaiting promotion's stamp (T35-16). */
export const SIGN_IN_CHECKS = Object.freeze({
  SIGN_IN_PAUSED: Object.freeze({
    check: 'C-96.39', where: at("#paused", "is-sign-in-window"),
    translation: CREDENTIALS_WORDS['refusal.SIGN_IN_PAUSED'],
  }),
  NOT_SIGNED_IN: Object.freeze({
    check: 'C-96.40', where: at("#notSignedIn", "is-session-live"),
    translation: CREDENTIALS_WORDS['refusal.NOT_SIGNED_IN'],
  }),
  RECOVERY_REFUSED: Object.freeze({
    check: 'C-96.41', where: at("#recoveryRefused", "is-recovery-code"),
    translation: CREDENTIALS_WORDS['refusal.RECOVERY_REFUSED'],
  }),
  SECURITY_KIND_UNKNOWN: Object.freeze({
    check: 'C-96.42', where: at("securityCount", "is-security-kind"),
    translation: 'That is not a kind of refused request the security count keeps, so nothing was counted. This is a '
      + 'fault in how your group\'s Civicsmith was built, not in the record.',
  }),
  SECURITY_PERIOD_INVALID: Object.freeze({
    check: 'C-96.43', where: at("#periodRefusal", "is-security-period"),
    translation: 'The security map shows a period of up to 90 days within the last 90, from an earlier time to a '
      + 'later one. The period asked was not one of those. Nothing was changed. Choose another period.',
  }),
  /* T36 (T36-7; K1946 T3): R49's read when the counts cannot be read, the next free number of C-96. A new row, awaiting
     promotion's stamp (T36-8). */
  SECURITY_COUNTS_UNREADABLE: Object.freeze({
    check: 'C-96.44', where: at("securityTotals", "is-security-counts-read"),
    translation: 'The security counts could not be read just now, so none were given: they are missing, not zero. '
      + 'Nothing was changed.',
  }),
  /* T37 (T37-6; N776, DEC-182 (4)): R3's own password change, the next free numbers of C-96. New rows, awaiting
     promotion's stamp (T37-7). */
  MACHINE_CANNOT_SET_PASSWORD: Object.freeze({
    check: 'C-96.45', where: at("passwordChange", "is-password-change-own"),
    translation: 'A member changes their own password, from their own signed-in session. The credential that asked here '
      + 'has no member behind it: it is an automated one, the operator\'s token, or a call with nobody signed in. Sign '
      + 'in as yourself to change your password. Nothing was changed.',
  }),
  CURRENT_PASSWORD_WRONG: Object.freeze({
    check: 'C-96.46', where: at("passwordChange", "is-current-password"),
    translation: CREDENTIALS_WORDS['refusal.CURRENT_PASSWORD_WRONG'],
  }),
  /* T47 (T47-81; R68, K3060 D4): recovery codes issued to anyone but an active member, the next free number of C-96.
     A new row, joining the row census red until T48's stamp. */
  RECOVERY_CODES_NOT_A_MEMBER: Object.freeze({
    check: 'C-96.53', where: at("recoveryCodesIssue", "is-recovery-codes-member"),
    translation: 'Recovery codes are given to an active member, for their own account, from their own signed-in '
      + 'session. Nothing was issued.',
  }),
});
