/* ai-accounts' own refusal rows (requirements: `build/requirements/ai-accounts.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached. Each row's `where` names its one site in this module.
 *
 * Moved by copy from `credentials/checks.mjs` at the split (T48-10; N996, K624, K3101; split map §2), R33: the C-29
 * rows of the AI accounts, each with its number, code and translation unchanged and its `where` re-pointed here, as one
 * family object, `AI_ACCOUNT_CHECKS`; and `AI_WORDS`, whose every key is the accounts'. credentials keeps C-29.1–.5,
 * .11, .23–.26, .28, .33, .41–.43, .46 and .47 (C-44's and C-136's precedent: one family across two files). */

const at = (fn, region) => `src/ai-accounts/index.mjs ${fn} > ${region}`;

/* R10–R12, R14, R22 (T41; DEC-188 (7)): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this
   module's refusals and notice read, each `en` verbatim, read by key; placeholders (`{Use}`, `{whose}`, `{who}`,
   `{project}`, `{for_uses}`, `{member}`, `{date}`, `{reason}`) are left for the screen, except that a project key's
   disclosure is answered with `{project}` filled (R12). A row's `translation` is the word itself, never a copy. */
export const AI_WORDS = Object.freeze({
  'ai.refused.off': '{Use} is switched off on {whose} account, so the assistant can\'t do this here. {who} can switch it on.',
  'ai.refused.projectkeptaway': 'This project keeps its material away from AI{for_uses}. {member} set this on {date}: '
    + '\u201c{reason}\u201d. Everything else in the project works as usual.',
  'ai.refused.notsole': 'Your own sign-in can be a project\'s account only while you are its only member, and {project} has '
    + 'other members. Add an Anthropic API key for the project instead.',
  'ai.disclosure.projectkey': 'Your questions in {project}, and the material read to answer them, go to Anthropic under the '
    + 'project\'s API account. Its owners see how much is used in total, never what you ask or who asked.',
  'ai.refused.noticedue': 'Before the assistant works on {project}\'s account, read what that means.',
  'ai.refused.switchvalue': 'That isn\'t a setting this switch takes: a use is on or off, and exploring is No, Ask every day '
    + 'or Yes.',
  'ai.refused.signinnotconnected': 'Connect your own Claude sign-in first, in Settings \u203a The assistant; then it can '
    + 'serve this project.',
  /* R23 (T47; N981, K231): DISCLOSURE_DUE's sentence, unchanged by its move from the door's C-69.6 */
  'refusal.DISCLOSURE_DUE': 'Read what connecting means first: your questions, and what is read to answer them, go to '
    + 'Anthropic under your own account. Then open the sign-in page again.',
});

/* T33-20 (K1502, K1449): each member's own Claude account reference (R1–R4); T34 (K1755): the group's API key (R5–R9).
   The account refusals R1 names are minted in one region, `#accountBar`, which every act on a reference consumes, and
   credentials' grant mint through R25's `accountActBar`. */
export const AI_ACCOUNT_CHECKS = Object.freeze({
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
  /* C-29.16 (ACCOUNT_LEVEL_MEMBER_ONLY) is retired with `credentials` R26 (K1755, K1756, T34): the group's API key is R5's own act;
     its id is not reused. */
  /* T38 (T38-5; N708's remainder, K2200): re-worded, the subscription token retired: a subscription is connected by
     signing in through Claude Code (R18). Awaiting promotion's stamp (T38-6). */
  UNKNOWN_ACCOUNT_KIND: Object.freeze({
    check: 'C-29.17', where: at("accountReferenceSet", "is-account-kind"),
    translation: 'That is not a kind of Claude account this group can hold. Connect your own API key, or connect your '
      + 'Claude subscription by signing in through Claude Code. Nothing was changed.',
  }),
  /* C-29.18 (ACCOUNT_KIND_NOT_OFFERED) is retired with K1537's hold (K1547, T33-20b); its id is not reused. */
  NO_SECRET: Object.freeze({
    check: 'C-29.19', where: at("#noSecret", "is-secret-given"),
    translation: 'No key or token was given, so there is nothing to connect. Nothing was changed.',
  }),
  /* T34 (K1755, K1757): the words name the group's key, since a member with no account of their own is served by it
     while it is on (R7). T38 (T38-5; N785, K2200): re-worded, the subscription connected by signing in through Claude
     Code, never a token. Awaiting promotion's stamp (T38-6). */
  NO_ACCOUNT: Object.freeze({
    check: 'C-29.20', where: at("#noAccount", "is-account-held"),
    translation: 'No Claude account serves you here: you have not connected your own API key or your Claude '
      + 'subscription, and the group\'s own key is not switched on. Connect your own API key, sign in with your Claude '
      + 'subscription through Claude Code, or ask an administrator about the group\'s key. Nothing was changed.',
  }),
  UNKNOWN_SWITCH: Object.freeze({
    check: 'C-29.21', where: at("#switchName", "is-account-switch"),
    /* T40 (T40-3; R14): re-worded, an account now holds a switch for each kind of use. Awaiting promotion's stamp
       (T40-4). */
    /* (T41; T41-5, R14) re-worded: four kinds of use added. Awaiting promotion's stamp (T41-6). */
    translation: 'That is not one of the assistant\'s switches for this account. There is one for each kind of use '
      + '(asking, drafting, runs, standing questions, exploring, the interview and planning, reading inside documents, '
      + 'transcribing picture pages, and drafting and checking a case\'s account), and one for suggestions. Nothing was '
      + 'changed.',
  }),
  ACCOUNT_SEAL_UNAVAILABLE: Object.freeze({
    check: 'C-29.22', where: at("#sealRefusal", "is-seal-bound"),
    translation: 'Your group\'s Civicsmith cannot keep a key sealed right now, because its sealing secret is not set or has '
      + 'changed. Nothing was stored or read. Ask whoever hosts your group\'s Civicsmith to set it.',
  }),
  /* R18 (DEC-156; K1819, K1922): a connected subscription is held as a fact only; a call carrying anything but the
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
  /* T36 (T36-7; DEC-172, K1957): keep-away's two refusals (R7, R20), the next free numbers of C-29 (C-29.30 is
     admission's). (T37-6; K231, N755, N765) C-29.31's `where` is `aiKeptAway`, the one site every gate on keep-away
     reads (R7); C-29.32 is re-coded `AI_KEEP_AWAY_NO_REASON`, a code of this module's own, its number unmoved, so
     progressions' `NO_REASON` (C-100.18) reads its own row again. Both await promotion's stamp (T37-7). */
  AI_KEPT_AWAY: Object.freeze({
    check: 'C-29.31', where: at("#keptAway", "is-kept-away"),
    translation: 'Your group keeps its material away from every assistant, so no assistant was used: not the group\'s '
      + 'account and not your own. An administrator turned this on and gave the reason shown. If you think this '
      + 'should change, ask an administrator. Nothing was sent.',
  }),
  /* T40 (T40-3; N812, D34, D38, K2352, K2353, K2404): a project's account (R10), the switches' values (R14), the
     account used (R11), a project's material limit (R22) and its key's notice (R12), the next free numbers of C-29 at
     the job's START (C-29.34–.39). New rows, awaiting promotion's stamp (T40-4). (T41; DEC-188 (7)) Each reads its
     translation by key from `AI_WORDS` (`words.json`), never a copy: a row change for promotion's T41-6 stamp. */
  PROJECT_NOT_SOLE_MEMBER: Object.freeze({
    check: 'C-29.34', where: at("projectSigninSet", "is-project-sole-member"),
    translation: AI_WORDS['ai.refused.notsole'],
  }),
  SIGNIN_NOT_CONNECTED: Object.freeze({
    check: 'C-29.35', where: at("projectSigninSet", "is-signin-connected"),
    translation: AI_WORDS['ai.refused.signinnotconnected'],
  }),
  SWITCH_VALUE_INVALID: Object.freeze({
    check: 'C-29.36', where: at("#valueInvalid", "is-switch-value"),
    translation: AI_WORDS['ai.refused.switchvalue'],
  }),
  AI_USE_SWITCHED_OFF: Object.freeze({
    check: 'C-29.37', where: at("#switchedOff", "is-use-switched-on"),
    translation: AI_WORDS['ai.refused.off'],
  }),
  PROJECT_AI_KEPT_AWAY: Object.freeze({
    check: 'C-29.38', where: at("aiKeptAway", "is-project-kept-away"),
    translation: AI_WORDS['ai.refused.projectkeptaway'],
  }),
  PROJECT_KEY_NOTICE_DUE: Object.freeze({
    check: 'C-29.39', where: at("#projectNoticeDue", "is-project-key-notice-seen"),
    translation: AI_WORDS['ai.refused.noticedue'],
  }),
  /* T47 (T47-9; N981, K231, K3030): the disclosure-first order held here (R23), its one site `disclosureDue`, which R1
     refuses through and control-plane R65 relays (T47-65); the next free number of C-29 at the job's START. Its code and
     sentence are the door's C-69.6's, unchanged (that row retires at T47-65, its number never reused); its translation
     read by key. A new row, awaiting promotion's stamp (T47-10). */
  DISCLOSURE_DUE: Object.freeze({
    check: 'C-29.40', where: at("disclosureDue", "is-disclosure-shown"),
    translation: AI_WORDS['refusal.DISCLOSURE_DUE'],
  }),
  SIGNIN_NOT_HELD: Object.freeze({
    check: 'C-29.44', where: at("#signinNotHeld", "is-signin-held"),
    translation: 'The Claude sign-in that would serve this is not connected now: it needs to be signed in again, by the '
      + 'member it belongs to. Nothing was sent.',
  }),
  SUBSCRIPTION_TOKEN_MALFORMED: Object.freeze({
    check: 'C-29.45', where: at("subscriptionTokenHold", "is-signin-token-shape"),
    translation: 'The Claude sign-in could not be kept, because what came back from it was not a sign-in. Nothing was '
      + 'kept. Sign in again; if it keeps happening, tell whoever hosts your group\'s Civicsmith.',
  }),
  /* T40 (T40-3): its `where` moves to `#keepAwayReason`, the one site R20 and R22 share (a row change for T40-4). */
  AI_KEEP_AWAY_NO_REASON: Object.freeze({
    check: 'C-29.32', where: at("#keepAwayReason", "is-keep-away-reason"),
    translation: 'Keeping the group\'s material away from every assistant needs a reason, which every member will '
      + 'read: from 1 to 2,000 characters. Nothing was changed.',
  }),
});
