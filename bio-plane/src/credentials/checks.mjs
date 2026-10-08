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

/* T33-20 (K1502, K1450, K1449): each member's own Claude account reference (R22–R25), the ask grant (R27–R28, R31,
   R32) and the group's keyed services (R29); T34 (K1755): the group's API key (R33–R37). New rows, stamped by promotion in T34 (plan T33, "Choices settled"). The account
   refusals R22 names are minted in one region, `#accountBar`, which every act on a reference and the grant's mint
   consume. */
export const ACCOUNT_CHECKS = Object.freeze({
  MACHINE_CANNOT_HOLD_ACCOUNT: Object.freeze({
    check: 'C-29.13', where: at("#accountBar", "is-account-own-act"),
    translation: 'A Claude account is connected by the member it belongs to, from their own signed-in session. The '
      + 'credential that asked has no member behind it: it is an automated one, the operator\'s token, or a call with '
      + 'nobody signed in. Nothing was changed.',
  }),
  NOT_YOUR_ACCOUNT: Object.freeze({
    check: 'C-29.14', where: at("#notYours", "is-account-theirs"),
    translation: 'A member\'s Claude account is theirs alone: only they can connect it, change it, see it or use it, '
      + 'and an administrator cannot either. Nothing was changed.',
  }),
  ACCOUNT_MEMBER_NOT_ACTIVE: Object.freeze({
    check: 'C-29.15', where: at("#accountBar", "is-account-own-act"),
    translation: 'Only an active member of this group can connect a Claude account. Nothing was changed.',
  }),
  /* C-29.16 (ACCOUNT_LEVEL_MEMBER_ONLY) is retired with R26 (K1755, K1756, T34): the group's API key is R33's own act;
     its id is not reused. */
  UNKNOWN_ACCOUNT_KIND: Object.freeze({
    check: 'C-29.17', where: at("accountReferenceSet", "is-account-kind"),
    translation: 'That is not a kind of Claude account this group can hold. Connect your own API key or your own '
      + 'Claude subscription token. Nothing was changed.',
  }),
  /* C-29.18 (ACCOUNT_KIND_NOT_OFFERED) is retired with K1537's hold (K1547, T33-20b); its id is not reused. */
  NO_SECRET: Object.freeze({
    check: 'C-29.19', where: at("#noSecret", "is-secret-given"),
    translation: 'No key or token was given, so there is nothing to connect. Nothing was changed.',
  }),
  /* T34 (K1755, K1757): the words name the group's key, since a member with no account of their own is served by it
     while it is on (R35). */
  NO_ACCOUNT: Object.freeze({
    check: 'C-29.20', where: at("#noAccount", "is-account-held"),
    translation: 'No Claude account serves you here: you have not connected your own, and the group\'s own key is not '
      + 'switched on. Connect your own API key or your own Claude subscription token, or ask an administrator about '
      + 'the group\'s key. Nothing was changed.',
  }),
  UNKNOWN_SWITCH: Object.freeze({
    check: 'C-29.21', where: at("#switchName", "is-account-switch"),
    translation: 'That is not one of the assistant\'s switches. There are two: suggestions, and standing questions. '
      + 'Nothing was changed.',
  }),
  ACCOUNT_SEAL_UNAVAILABLE: Object.freeze({
    check: 'C-29.22', where: at("#sealRefusal", "is-seal-bound"),
    translation: 'Your group\'s Civicsmith cannot keep a key sealed right now, because its sealing secret is not set or has '
      + 'changed. Nothing was stored or read. Ask whoever hosts your group\'s Civicsmith to set it.',
  }),
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
  /* T34 (T34-11; K1609, K1755, K1757): R32's two refusals and R36's. New rows, stamped by promotion (T34-12). */
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
  /* R43 (DEC-156; K1819, K1922): a connected subscription is held as a fact only; a call carrying anything but the
     member is refused, so no login, code or token is ever taken. T35's new row, awaiting promotion's stamp (T35-16). */
  SUBSCRIPTION_LOGIN_REFUSED: Object.freeze({
    check: 'C-29.29', where: at("subscriptionConnected", "is-subscription-fact"),
    translation: 'Your Claude subscription\'s sign-in stays where Claude Code itself keeps it, for you alone. Your '
      + 'group\'s Civicsmith only notes that you are connected, and never takes a login, a code or a token. This '
      + 'request carried more than that, so nothing was recorded.',
  }),
  GROUP_KEY_NOTICE_DUE: Object.freeze({
    check: 'C-29.27', where: at("#noticeDue", "is-group-key-notice-seen"),
    translation: 'Before the assistant answers you under the group\'s account, read one short notice: your questions, '
      + 'and the material read to answer them, go to Anthropic under the group\'s API account. Confirm you have read '
      + 'it, then ask again. Nothing was sent.',
  }),
  /* T36 (T36-7; DEC-172, K1957): keep-away's two refusals (R35, R51), the next free numbers of C-29 (C-29.30 is
     admission's). (T37-6; K231, N755, N765) C-29.31's `where` is `aiKeptAway`, the one site every gate on keep-away
     reads (R35); C-29.32 is re-coded `AI_KEEP_AWAY_NO_REASON`, a code of this module's own, its number unmoved, so
     progressions' `NO_REASON` (C-100.18) reads its own row again. Both await promotion's stamp (T37-7). */
  AI_KEPT_AWAY: Object.freeze({
    check: 'C-29.31', where: at("aiKeptAway", "is-kept-away"),
    translation: 'Your group keeps its material away from every assistant, so no assistant was used: not the group\'s '
      + 'account and not your own. An administrator turned this on and gave the reason shown. If you think this '
      + 'should change, ask an administrator. Nothing was sent.',
  }),
  AI_KEEP_AWAY_NO_REASON: Object.freeze({
    check: 'C-29.32', where: at("aiKeepAwaySet", "is-keep-away-reason"),
    translation: 'Keeping the group\'s material away from every assistant needs a reason, which every member will '
      + 'read: from 1 to 2,000 characters. Nothing was changed.',
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
    translation: 'Signing in is paused for a few minutes, because too many attempts were refused in a short time. '
      + 'Nothing was checked or changed. Wait ten minutes and try again; if it keeps happening, tell an administrator, '
      + 'since someone may be trying to guess a password.',
  }),
  NOT_SIGNED_IN: Object.freeze({
    check: 'C-96.40', where: at("#notSignedIn", "is-session-live"),
    translation: 'There is no signed-in session to end here: it has already ended, it expired, or it never existed. '
      + 'Nothing was changed.',
  }),
  RECOVERY_REFUSED: Object.freeze({
    check: 'C-96.41', where: at("#recoveryRefused", "is-recovery-code"),
    translation: 'That recovery did not go through. A recovery code works once, only for the administrator it was '
      + 'given to, and only while they are an administrator. Nothing was changed. Check the code and the account it '
      + 'belongs to, or ask another administrator for help.',
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
    translation: 'The current password you typed is not the one your account holds, so your password was not '
      + 'changed. Nothing was changed. Type your current password again; if you have forgotten it, ask an administrator '
      + 'for help.',
  }),
});
