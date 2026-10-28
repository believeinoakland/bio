/* ai-accounts' own refusal rows (requirements: `build/requirements/ai-accounts.md`). DEC-49: every refusal this module
 * answers carries its code, its row and the member's translation, so a surface shows the same sentence wherever the act
 * is reached. Each row's `where` names its one site in this module.
 *
 * The C-29 rows of the AI accounts, as one family object, `AI_ACCOUNT_CHECKS` (moved by copy from `credentials` at the
 * split, T48-10, R33; credentials keeps C-29.1–.5, .11, .23–.26, .28, .33, .41–.43, .46 and .47: one family across two
 * files). (T53; K5457, R58) The rows of the retired kinds leave with their acts (UNKNOWN_ACCOUNT_KIND, GROUP_KEY_NOTICE_DUE,
 * SUBSCRIPTION_LOGIN_REFUSED, PROJECT_NOT_SOLE_MEMBER, SIGNIN_NOT_CONNECTED, PROJECT_KEY_NOTICE_DUE, SIGNIN_NOT_HELD and
 * SUBSCRIPTION_TOKEN_MALFORMED; their numbers are never reused) and the account model's arrive, each the next free number
 * of C-29 at this job's START (C-29.47 held last, `credentials`'): C-29.48–.82, each new row awaiting promotion's stamp.
 * "team" in every sentence (K3472). */

import { word, localize } from "../setup-words/index.mjs";

const at = (file, fn, region) => `src/ai-accounts/${file} ${fn} > ${region}`;

/* The words of `words.json` (`docs/development/ux-substrate/screens/words.json`) this module's older rows read, each read
   by key through setup-words' `word`, never held here; placeholders are left for the screen by being written back as
   themselves. A row's `translation` is the word itself, never a copy. */
const keep = (key, ...names) => word(key, Object.fromEntries(names.map((n) => [n, `{${n}}`])));

export const AI_WORDS = Object.freeze({
  'ai.refused.off': keep('ai.refused.off', 'Use', 'whose', 'who'),
  'ai.refused.projectkeptaway': keep('ai.refused.projectkeptaway', 'for_uses', 'member', 'date', 'reason'),
  'ai.refused.switchvalue': word('ai.refused.switchvalue'),
  /* R23 (T47; N981, K231): DISCLOSURE_DUE's sentence, unchanged by its move from the door's C-69.6 */
  'refusal.DISCLOSURE_DUE': word('refusal.DISCLOSURE_DUE'),
});

/* The placeholders of a sentence written at its use, left to be filled when answered. */
const holds = (...names) => Object.fromEntries(names.map((n) => [n, `{${n}}`]));

/* A new row (R58): its translation is the word of its key, `localize`d at the one place the sentence is written (K3943),
   the placeholders held for `fill` to put the answer's values in. */
const made = (check, translation) => Object.freeze({ check, where: at("base.mjs", "#refuse", "is-ai-refusal"), translation });

export const AI_ACCOUNT_CHECKS = Object.freeze({
  MACHINE_CANNOT_HOLD_ACCOUNT: Object.freeze({
    check: 'C-29.13', where: at("base.mjs", "#accountBar", "is-account-own-act"),
    translation: word('refusal.MACHINE_CANNOT_HOLD_ACCOUNT'),
  }),
  NOT_YOUR_ACCOUNT: Object.freeze({
    check: 'C-29.14', where: at("base.mjs", "#notYours", "is-account-theirs"),
    translation: word('refusal.NOT_YOUR_ACCOUNT'),
  }),
  ACCOUNT_MEMBER_NOT_ACTIVE: Object.freeze({
    check: 'C-29.15', where: at("base.mjs", "#accountBar", "is-account-own-act"),
    translation: word('refusal.ACCOUNT_MEMBER_NOT_ACTIVE'),
  }),
  NO_SECRET: Object.freeze({
    check: 'C-29.19', where: at("base.mjs", "#noSecret", "is-secret-given"),
    translation: word('refusal.NO_SECRET'),
  }),
  NO_ACCOUNT: Object.freeze({
    check: 'C-29.20', where: at("base.mjs", "#noAccount", "is-account-held"),
    translation: word('refusal.NO_ACCOUNT'),
  }),
  UNKNOWN_SWITCH: Object.freeze({
    check: 'C-29.21', where: at("base.mjs", "#switchName", "is-account-switch"),
    translation: word('refusal.UNKNOWN_SWITCH'),
  }),
  ACCOUNT_SEAL_UNAVAILABLE: Object.freeze({
    check: 'C-29.22', where: at("base.mjs", "#sealRefusal", "is-seal-bound"),
    translation: word('refusal.ACCOUNT_SEAL_UNAVAILABLE'),
  }),
  /* T36 (T36-7; DEC-172, K1957): keep-away's two refusals (R7, R20). (T37-6; K231, N755, N765) C-29.31's `where` is
     `aiKeptAway`, the one site every gate on keep-away reads (R7); C-29.32 is re-coded `AI_KEEP_AWAY_NO_REASON`, a code of
     this module's own, its number unmoved. */
  AI_KEPT_AWAY: Object.freeze({
    check: 'C-29.31', where: at("limits.mjs", "#keptAway", "is-kept-away"),
    translation: word('refusal.AI_KEPT_AWAY'),
  }),
  AI_KEEP_AWAY_NO_REASON: Object.freeze({
    check: 'C-29.32', where: at("limits.mjs", "#keepAwayReason", "is-keep-away-reason"),
    translation: word('refusal.AI_KEEP_AWAY_NO_REASON'),
  }),
  /* T40 (T40-3; N812, D34, D38, K2352): the switches' values (R14), the account used (R11) and a project's material
     limit (R22). (T41; DEC-188 (7)) Each reads its translation by key from `AI_WORDS`, never a copy. */
  SWITCH_VALUE_INVALID: Object.freeze({
    check: 'C-29.36', where: at("base.mjs", "#valueInvalid", "is-switch-value"),
    translation: AI_WORDS['ai.refused.switchvalue'],
  }),
  AI_USE_SWITCHED_OFF: Object.freeze({
    check: 'C-29.37', where: at("base.mjs", "#switchedOff", "is-use-switched-on"),
    translation: AI_WORDS['ai.refused.off'],
  }),
  PROJECT_AI_KEPT_AWAY: Object.freeze({
    check: 'C-29.38', where: at("limits.mjs", "aiKeptAway", "is-project-kept-away"),
    translation: AI_WORDS['ai.refused.projectkeptaway'],
  }),
  /* T47 (T47-9; N981, K231, K3030): the disclosure-first order held here (R23), its one site `disclosureDue`. */
  DISCLOSURE_DUE: Object.freeze({
    check: 'C-29.40', where: at("base.mjs", "disclosureDue", "is-disclosure-shown"),
    translation: AI_WORDS['refusal.DISCLOSURE_DUE'],
  }),

  /* ===== T53 (K5457; R58): the account model's rows, C-29.48 on ===== */
  PLAN_SCOPE_REFUSED: made('C-29.48', localize("ai.refused.planscope",
    "The plan {plan} cannot be held at the {level} level: the plan's own scope allows only a lower one. Nothing was written.",
    holds("plan", "level"))),
  PERSONAL_SUBSCRIPTION_LEVEL: made('C-29.49', localize("ai.refused.personallevel",
    "{plan} is a personal subscription: only a member may hold it, for their own use, never the {level}. Nothing was written.",
    holds("plan", "level"))),
  PERSONAL_SUBSCRIPTION_NOT_SHARED: made('C-29.50', localize("ai.refused.personalsubscriptionnotshared",
    "A personal subscription serves only the member who holds it, so it is on no one else's list and is never shared. Nothing was written.")),
  MEANS_NOT_ALLOWED: made('C-29.51', localize("ai.refused.meansnotallowed",
    "The plan {plan} cannot be reached by the means '{means}'. Nothing was written.", holds("plan", "means"))),
  REFERENCE_MALFORMED: made('C-29.52', localize("ai.refused.referencemalformed",
    "A reference is a store and a locator, each a short piece of text, and this was not one. Nothing was written.")),
  OPT_IN_MISSING: made('C-29.53', localize("ai.refused.optinmissing",
    "The account {account} is not shared with this list: the one who holds it turns sharing on first. Nothing was changed.",
    holds("account"))),
  ACCOUNT_NOT_LISTED: made('C-29.54', localize("ai.refused.accountnotlisted",
    "The account {account} is not on this list, or is named twice. Nothing was changed.", holds("account"))),
  LIST_EXHAUSTED: made('C-29.55', localize("ai.refused.listexhausted",
    "No other account on the list can take over: raise a limit, add an account, or change the order. Nothing was used.")),
  HOP_REASON_REFUSED: made('C-29.56', localize("ai.refused.hopreasonrefused",
    "'{reason}' is not a reason to move down the list of accounts. Nothing moved.", holds("reason"))),
  HOP_NOT_AT_STEP_BOUNDARY: made('C-29.57', localize("ai.refused.hopnotatstepboundary",
    "An account is changed only between the steps of a run, and this is in the middle of one. Nothing moved.")),
  CHECK_LOCKED: made('C-29.58', localize("ai.refused.checklocked",
    "The check {check} is held on by the {level}, so it cannot be turned off here. Nothing was changed.",
    holds("check", "level"))),
  CHECK_NOT_MET: made('C-29.59', localize("ai.refused.checknotmet",
    "The AI {entry} does not meet the check {check}, which is in force here. Nothing was used.", holds("entry", "check"))),
  CHECK_OPEN: made('C-29.60', localize("ai.refused.checkopen",
    "Whether the AI {entry} meets the check {check}, which is in force here, is not yet known. Nothing was used.",
    holds("entry", "check"))),
  PART_NOT_PASSED: made('C-29.61', localize("ai.refused.partnotpassed",
    "The AI {entry} has not passed the {part} test, so it is not offered for this use. Nothing was used.",
    holds("entry", "part"))),
  PART_NOT_RATED: made('C-29.62', localize("ai.refused.partnotrated",
    "The AI {entry} has not yet been rated for the {part} test, so it is not offered for this use. Nothing was used.",
    holds("entry", "part"))),
  ENTRY_NOT_ALLOWED: made('C-29.63', localize("ai.refused.entrynotallowed",
    "The AI {entry} is not on this account's list, or is outside what the team, the project or the member allows. Nothing was written.",
    holds("entry"))),
  ENTRY_LAPSED: made('C-29.64', localize("ai.refused.entrylapsed",
    "The AI {entry} has lapsed and is not offered for new work; what it made earlier stands. Nothing was used.", holds("entry"))),
  ENTRY_RETIRED: made('C-29.65', localize("ai.refused.entryretired",
    "The AI {entry} has been retired and is not offered for new work; what it made earlier stands. Nothing was used.",
    holds("entry"))),
  NEEDS_NEWER_RELEASE: made('C-29.66', localize("ai.refused.needsnewerrelease",
    "The AI {entry} needs a newer release of your team's Civicsmith than the one running. Nothing was used.", holds("entry"))),
  NO_PLAN_OFFERED: made('C-29.67', localize("ai.refused.noplanoffered",
    "No plan that reaches the AI {entry} is offered now. Nothing was used.", holds("entry"))),
  ENTRIES_EMPTY: made('C-29.68', localize("ai.refused.entriesempty",
    "An account must allow at least one AI. Nothing was written.")),
  NARROWING_ONLY: made('C-29.69', localize("ai.refused.narrowingonly",
    "The AI {entry} is outside what the level above allows, and a level may only narrow the one above it. Nothing was written.",
    holds("entry"))),
  NO_ENTRY_OFFERED: made('C-29.70', localize("ai.refused.noentryoffered",
    "No AI on the account's list is offered for this use ({why}). Nothing was used.", holds("why"))),
  FREE_TIER_NOT_ACCEPTED: made('C-29.71', localize("ai.refused.freetier",
    "{plan} is a free plan whose provider may train on what is sent, and it serves only once its warning is accepted. Nothing was used.",
    holds("plan"))),
  RECIPIENT_NOTICE_DUE: made('C-29.72', localize("ai.refused.recipientnotice",
    "You have not yet read what {host} ({provider}) receives when it is used. Read it, then try again. Nothing was sent.",
    holds("provider", "host"))),
  PAYER_NOT_VERIFIED: made('C-29.73', localize("ai.refused.payernotverified",
    "The account's own key was not the one that paid for its last call ({cause}), so it is stopped until its manager clears it. Nothing was used.",
    holds("cause"))),
  GATEWAY_LOG_UNREADABLE: made('C-29.74', localize("ai.refused.gatewaylogunreadable",
    "The gateway's record of the call could not be read, so who paid for it cannot be shown. The call's answer is kept.")),
  GATEWAY_UNAVAILABLE: made('C-29.75', localize("ai.refused.gatewayunavailable",
    "Your team's Civicsmith cannot reach the gateway for AI keys: whoever holds your team's Cloudflare account can grant it. The built-in AI, a sealed key and a reference work without it. Nothing was written.")),
  GATEWAY_STORE_REFUSED: made('C-29.76', localize("ai.refused.gatewaystorerefused",
    "The gateway did not take the key. Nothing was stored.")),
  GATEWAY_KEY_ABSENT: made('C-29.77', localize("ai.refused.gatewaykeyabsent",
    "The gateway holds no key for this account yet: enter it in the Cloudflare dashboard, then confirm. Nothing was recorded.")),
  ISSUED_TOKEN_MALFORMED: made('C-29.78', localize("ai.refused.issuedtokenmalformed",
    "A sign-in's token is {min} to {max} characters, and this was not one. Nothing was recorded.", holds("min", "max"))),
  UNKNOWN_PLAN: made('C-29.79', localize("ai.refused.unknownplan",
    "The provider {provider} has no plan {plan} in the list of AIs. Nothing was written.", holds("provider", "plan"))),
  AI_CREDENTIAL_NOT_SERVED: made('C-29.80', localize("ai.refused.aicredentialnotserved",
    "An account's credential is served only to the assistant's own worker, for its own call. Nothing was served.")),
  OPT_IN_NOT_OFFERED: made('C-29.81', localize("ai.refused.optinnotoffered",
    "The account {account} cannot be shared: a project's account carries no share flag. Nothing was changed.", holds("account"))),
  ORDER_POSITION_INVALID: made('C-29.82', localize("ai.refused.orderpositioninvalid",
    "Position {position} is outside the list, which holds {count} accounts. Nothing was changed.", holds("position", "count"))),
});

/* R58: a sentence's placeholders filled from the answer's values (a value that is absent is left as written). */
export function fillSentence(text, vars = {}) {
  return String(text).replace(/\{([A-Za-z0-9_]+)\}/g, (m, n) => (Object.hasOwn(vars, n) && vars[n] !== undefined && vars[n] !== null ? String(vars[n]) : m));
}
