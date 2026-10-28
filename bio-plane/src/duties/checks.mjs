/* duties' refusal rows (requirements: `build/requirements/duties.md`). DEC-49: every refusal this module answers
 * carries its code, its row and the member's translation. A new module: its rows are a new family, C-133 (the next
 * free after record-core's C-132; asked of BOB in J1), awaiting promotion's stamp (row-census, plan T33 Rules (9)).
 * `NO_SUCH_ENTITY` and `NO_ENTITY` are `entities`' (its R36, R37), `NO_SUCH_STANDARD` is `standards'` (its R17),
 * `NO_SUCH_FACT` `money`'s and `NO_SUCH_EVENT` `events`' (K1569): answered through their one functions, never minted here. No translation names a place (R23). */

import { word, localize } from "../setup-words/index.mjs";

const at = (fn, region) => `src/duties/index.mjs ${fn} > ${region}`;
const row = (n, fn, region, translation) => Object.freeze({ check: `C-133.${n}`, where: at(fn, region), translation });

/* T46 (R32; DEC-194, N913): the words of `words.json` (`docs/development/ux-substrate/screens/words.json`) the C-133
   rows R32 names translate by, each `en` verbatim, read by key (`refusal.<CODE>`), as membership's `HANDLE_WORDS` and
   extraction's `TRANSCRIBE_WORDS` are. The design stream's words: re-worded there, then re-taken here by key; a row
   never holds a copy of its sentence. `refusal.PROMISE_DATE_UNREAD` is not taken in T46: its sentence describes a
   promise held with no due date, while R30 refuses it and writes nothing (R32; K2919). */
export const DUTIES_WORDS = Object.freeze({
  "refusal.RESPONSE_KIND_UNKNOWN": word("refusal.RESPONSE_KIND_UNKNOWN"),
  "refusal.RESPONSE_EXTENT_NOT_IN": word("refusal.RESPONSE_EXTENT_NOT_IN"),
  "refusal.DUTY_SOURCE_NOT_HELD": word("refusal.DUTY_SOURCE_NOT_HELD"),
});

/* T48 (R33; N1044, K3150): an undetermined occurrence's member-facing reason, `duty.reason.<code>` for each code of
   `OCCURRENCE_REASONS`, read by key (`reasonWords`), as the words above are. `words.json` held none of these keys at
   T48's opening, so each was this module's interim word, in DEC-149's form; DEC-232 gave the file's `en` (T49: each
   replaces the interim word here, verbatim, under the same key). No sentence names an ISO date, a zone id, or a ruling
   or requirement number. Words, not rows: a reason is no refusal and has no check. */
export const DUTIES_REASON_WORDS = Object.freeze({
  "duty.reason.trigger_undated": word("duty.reason.trigger_undated"),
  "duty.reason.deadline_not_held": word("duty.reason.deadline_not_held"),
  "duty.reason.due_not_computed": word("duty.reason.due_not_computed"),
  "duty.reason.due_between_days": word("duty.reason.due_between_days"),
  "duty.reason.match_undated": word("duty.reason.match_undated"),
  "duty.reason.order_unsettled": word("duty.reason.order_unsettled"),
});

/** R33: an undetermined occurrence's reason, `{code, says}`, its words read by key; a throw for a code with no words
 *  behind it, because a missing sentence is silent and reaches a person while a throw is loud in a test (DEC-49). */
export function reasonWords(code) {
  const says = DUTIES_REASON_WORDS[`duty.reason.${code}`];
  if (typeof says !== "string" || !says) throw new Error(`duties: ${code} is not an occurrence reason with words`);
  return { code, says };
}

export const DUTIES_CHECKS = Object.freeze({
  UNKNOWN_MODALITY: row(1, "fieldRefusal", "is-duty-modality",
    word("refusal.UNKNOWN_MODALITY")),
  NO_OBLIGOR: row(2, "fieldRefusal", "is-duty-obligor",
    localize("duties.checks.an_obligation_names_who_owes", "An obligation names who owes it: a registered office or body, an organisation acting for a public body, or a person a law binds. None was named. Nothing was written.")),
  PERSON_OBLIGOR_NEEDS_LAW: row(3, "fieldRefusal", "is-duty-person",
    word("refusal.PERSON_OBLIGOR_NEEDS_LAW")),
  NOT_ACTING_FOR_PUBLIC: row(4, "fieldRefusal", "is-duty-public",
    localize("duties.checks.an_organisation_outside_government_owes", "An organisation outside government owes a public obligation only when it acts for a public body under a law, contract, franchise or grant. The record holds no such line from this organisation to a public body. Record that line, with its citation, first. Nothing was written.")),
  NO_ENFORCER: row(5, "fieldRefusal", "is-duty-enforcer",
    localize("duties.checks.an_obligation_owed_by_an", "An obligation owed by an organisation outside government names the office that enforces it, which is where a concern about it is addressed. None was named. Nothing was written.")),
  UNKNOWN_SOURCE_KIND: row(6, "fieldRefusal", "is-duty-source",
    word("refusal.UNKNOWN_SOURCE_KIND")),
  NO_PORTION: row(7, "fieldRefusal", "is-duty-portion",
    word("refusal.NO_PORTION")),
  VERSION_NOT_HELD: row(8, "fieldRefusal", "is-duty-version",
    word("refusal.VERSION_NOT_HELD")),
  UNKNOWN_TRIGGER: row(9, "fieldRefusal", "is-duty-trigger",
    word("refusal.UNKNOWN_TRIGGER")),
  BAD_RECURRENCE: row(10, "fieldRefusal", "is-duty-recurrence",
    word("refusal.BAD_RECURRENCE")),
  UNKNOWN_BASIS_KIND: row(11, "fieldRefusal", "is-duty-basis",
    word("refusal.UNKNOWN_BASIS_KIND")),
  HOLDS_AMOUNT: row(12, "fieldRefusal", "is-duty-amount",
    word("refusal.HOLDS_AMOUNT")),
  /* C-133.13 NO_SUCH_FACT: retired (K1569); answered through money's `noSuchFact`. The id is never reused. */
  UNKNOWN_REPORTED_STATUS: row(14, "fieldRefusal", "is-duty-reported",
    word("refusal.UNKNOWN_REPORTED_STATUS")),
  NO_PERFORMANCE: row(15, "fieldRefusal", "is-duty-performance",
    word("refusal.NO_PERFORMANCE")),
  BAD_TIME: row(16, "fieldRefusal", "is-duty-time",
    word("refusal.BAD_TIME")),
  ARISING_IN_NOT_HELD: row(17, "fieldRefusal", "is-duty-arising",
    word("refusal.ARISING_IN_NOT_HELD")),
  EXTENT_NOT_HELD: row(18, "fieldRefusal", "is-duty-extent",
    word("refusal.EXTENT_NOT_HELD")),
  /* C-133.19, .21 and .24 are this module's own codes (R2, K1679; DEC-49 arm A: one code, one condition): the bare
     `MEMBER_ACT_ONLY`, `NO_REASON` and `NO_SUCH_PROPOSAL` are other families' for other conditions. */
  DUTY_MEMBER_ACT_ONLY: row(19, "memberOnly", "is-duty-member",
    word("refusal.DUTY_MEMBER_ACT_ONLY")),
  NO_CLAUSE: row(20, "noClause", "is-duty-clause",
    word("refusal.NO_CLAUSE")),
  DUTY_NO_REASON: row(21, "noReason", "is-duty-reason",
    word("refusal.DUTY_NO_REASON")),
  NO_DUTY: row(22, "noDuty", "is-duty-named",
    word("refusal.NO_DUTY")),
  NO_SUCH_DUTY: row(23, "noSuchDuty", "is-duty-held",
    word("refusal.NO_SUCH_DUTY")),
  DUTY_NO_SUCH_PROPOSAL: row(24, "adopt", "is-duty-proposal",
    word("refusal.DUTY_NO_SUCH_PROPOSAL")),
  ALREADY_ADOPTED: row(25, "adopt", "is-duty-proposal",
    word("refusal.ALREADY_ADOPTED")),
  DUTY_WITHDRAWN: row(26, "revise", "is-duty-live",
    word("refusal.DUTY_WITHDRAWN")),
  NO_AS_OF: row(27, "occurrencesOf", "is-duty-as-of",
    word("refusal.NO_AS_OF")),
  /* C-133.28 NO_SUCH_EVENT: retired (K1569); answered through events' `noSuchEvent`. The id is never reused. */
  NO_SUCH_OCCURRENCE: row(29, "matchEvent", "is-duty-occurrence",
    word("refusal.NO_SUCH_OCCURRENCE")),
  UNKNOWN_STATE: row(30, "recordTransition", "is-duty-state",
    word("refusal.UNKNOWN_STATE")),
  NO_CAUSE: row(31, "recordTransition", "is-duty-cause",
    word("refusal.NO_CAUSE")),
  NOT_A_SET_AGAINST: row(32, "setAgainst", "is-duty-scope",
    word("refusal.NOT_A_SET_AGAINST")),
  NOT_AN_OFFICE: row(33, "powersOf", "is-duty-office",
    word("refusal.NOT_AN_OFFICE")),
  HOLDS_HYPOTHESIS: row(34, "oneHome", "is-duty-no-hypothesis",
    word("refusal.HOLDS_HYPOTHESIS")),
  HOLDS_DUE_DATE: row(35, "oneHome", "is-duty-no-due",
    word("refusal.HOLDS_DUE_DATE")),
  APPEND_ONLY: row(36, "oneHome", "is-duty-append-only",
    word("refusal.APPEND_ONLY")),
  REVIEW_DATE_UNREAD: row(37, "proposeReview", "is-duty-review-date",
    word("refusal.REVIEW_DATE_UNREAD")),
  REVIEW_EXTENT_NOT_HELD: row(38, "proposeReview", "is-duty-review-extent",
    word("refusal.REVIEW_EXTENT_NOT_HELD")),
  NOT_A_POWER: row(39, "usesOfPower", "is-duty-power",
    word("refusal.NOT_A_POWER")),
  /* T45 (N855, N882; Actions D6d, D7): R30's and R31's own rows. T46 (R32): C-133.41, .42 and .44 read their
     translations from `DUTIES_WORDS` by key; C-133.43 keeps its own until its sentence and R30 agree. */
  BAD_CAPTURES: row(40, "dutiesArisingIn", "is-duty-captures",
    word("refusal.BAD_CAPTURES")),
  RESPONSE_KIND_UNKNOWN: row(41, "proposeFromResponse", "is-duty-response-kind",
    DUTIES_WORDS["refusal.RESPONSE_KIND_UNKNOWN"]),
  RESPONSE_EXTENT_NOT_IN: row(42, "proposeFromResponse", "is-duty-response-extent",
    DUTIES_WORDS["refusal.RESPONSE_EXTENT_NOT_IN"]),
  PROMISE_DATE_UNREAD: row(43, "proposeFromResponse", "is-duty-promise-date",
    localize("duties.checks.a_promises_date_is_read", "A promise's date is read from the body's own words, and those words must state one whole calendar date. These do not (such as \"by spring\", a month without its day, or more than one date): they are kept as written and never completed. Nothing was written.")),
  DUTY_SOURCE_NOT_HELD: row(44, "adopt", "is-duty-source-held",
    DUTIES_WORDS["refusal.DUTY_SOURCE_NOT_HELD"]),
  /* T53 (R35; N1257, K5458): a rule name two active layers give, answered with the layers. */
  NAME_AMBIGUOUS: row(45, "ruleAmbiguous", "is-duty-rule-layer",
    localize("duties.checks.rule_name_in_several_layers", "More than one of the places your team reads gives a rule by that name, so none was chosen. Name the place whose rule this is. Nothing was written.")),
});

/** A refusal carrying its row. Called with the code as a literal at each site, so the DEC-49 guard reads which code
 *  a marked region mints. */
export function refusal(code, detail, extra) {
  const r = DUTIES_CHECKS[code];
  return { ok: false, reason: code, code, check: r.check, translation: r.translation, detail, ...(extra || {}) };
}
