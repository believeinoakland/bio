/* duties' refusal rows (requirements: `build/requirements/duties.md`). DEC-49: every refusal this module answers
 * carries its code, its row and the member's translation. A new module: its rows are a new family, C-133 (the next
 * free after record-core's C-132; asked of BOB in J1), awaiting promotion's stamp (row-census, plan T33 Rules (9)).
 * `NO_SUCH_ENTITY` and `NO_ENTITY` are `entities`' (its R36, R37), `NO_SUCH_STANDARD` is `standards'` (its R17),
 * `NO_SUCH_FACT` `money`'s and `NO_SUCH_EVENT` `events`' (K1569): answered through their one functions, never minted here. No translation names a place (R23). */

const at = (fn, region) => `src/duties/index.mjs ${fn} > ${region}`;
const row = (n, fn, region, translation) => Object.freeze({ check: `C-133.${n}`, where: at(fn, region), translation });

export const DUTIES_CHECKS = Object.freeze({
  UNKNOWN_MODALITY: row(1, "fieldRefusal", "is-duty-modality",
    "A duty is one of three things: an obligation (something owed), a prohibition (something not to be done) or a "
    + "power (something an office may do). This one is none of them. Nothing was written."),
  NO_OBLIGOR: row(2, "fieldRefusal", "is-duty-obligor",
    "An obligation names who owes it: a registered office or body, an organisation acting for a public body, or a "
    + "person a law binds. None was named. Nothing was written."),
  PERSON_OBLIGOR_NEEDS_LAW: row(3, "fieldRefusal", "is-duty-person",
    "An obligation binds a person only where a law or a court binds them by name or role (a filer, a registrant). "
    + "Cite the held law or order and say the name or role it binds. Nothing was written."),
  NOT_ACTING_FOR_PUBLIC: row(4, "fieldRefusal", "is-duty-public",
    "An organisation outside government owes a public obligation only when it acts for a public body under a law, "
    + "contract, franchise or grant. The record holds no such line from this organisation to a public body. Record "
    + "that line, with its citation, first. Nothing was written."),
  NO_ENFORCER: row(5, "fieldRefusal", "is-duty-enforcer",
    "An obligation owed by an organisation outside government names the office that enforces it, which is where a "
    + "concern about it is addressed. None was named. Nothing was written."),
  UNKNOWN_SOURCE_KIND: row(6, "fieldRefusal", "is-duty-source",
    "An obligation says where it comes from: a held law or standard, a court's order or a report's recommendation, "
    + "a measured practice, or what it must precede. This source is none of these. Nothing was written."),
  NO_PORTION: row(7, "fieldRefusal", "is-duty-portion",
    "The part of the law named is not a part the record holds for that standard. Name a section the standard "
    + "holds. Nothing was written."),
  VERSION_NOT_HELD: row(8, "fieldRefusal", "is-duty-version",
    "The version of the law named is not one the record holds for that instrument. Name a held version. Nothing was "
    + "written."),
  UNKNOWN_TRIGGER: row(9, "fieldRefusal", "is-duty-trigger",
    "An obligation says what starts it: an event concerning someone, a repeating schedule, an item a part of this "
    + "copy records (such as a request the group sent), or a stated date. This is none of them. Nothing was written."),
  BAD_RECURRENCE: row(10, "fieldRefusal", "is-duty-recurrence",
    "The repeating schedule could not be read. It is written as a recurrence rule of the supported kind (weekly, "
    + "monthly or yearly), with its first date. Nothing was written."),
  UNKNOWN_BASIS_KIND: row(11, "fieldRefusal", "is-duty-basis",
    "A due date rests on one of four things: a rule the law sets, the body's own commitment, the event it must "
    + "precede, or the group's own window. This is none of them. Nothing was written."),
  HOLDS_AMOUNT: row(12, "fieldRefusal", "is-duty-amount",
    "An obligation never holds an amount of money. A payment it requires cites the money facts the record holds. "
    + "Remove the amount and cite the facts. Nothing was written."),
  /* C-133.13 NO_SUCH_FACT: retired (K1569); answered through money's `noSuchFact`. The id is never reused. */
  UNKNOWN_REPORTED_STATUS: row(14, "fieldRefusal", "is-duty-reported",
    "A reported status is quoted from a report or response, in the words the jurisdiction's response vocabulary "
    + "uses. This one is not in that vocabulary, or the active jurisdiction profiles hold none. Nothing was written."),
  NO_PERFORMANCE: row(15, "fieldRefusal", "is-duty-performance",
    "An obligation says, in words, the act it requires. None was given. Nothing was written."),
  BAD_TIME: row(16, "fieldRefusal", "is-duty-time",
    "The due date's basis is missing what it is computed from: a rule names the rule, a commitment or window its "
    + "date, a dependency its lead and why. Nothing was written."),
  ARISING_IN_NOT_HELD: row(17, "fieldRefusal", "is-duty-arising",
    "An obligation arising in a proceeding or report names a registered proceeding or a captured document the "
    + "record holds. This one names neither. Nothing was written."),
  EXTENT_NOT_HELD: row(18, "fieldRefusal", "is-duty-extent",
    "A reported status quotes a passage of a captured document the record holds. The passage named is not held. "
    + "Nothing was written."),
  MEMBER_ACT_ONLY: row(19, "memberOnly", "is-duty-member",
    "Adopting, declaring, revising or withdrawing an obligation, matching an event to it and recording its state "
    + "are a member's own acts. The machine may only propose. Nothing was written."),
  NO_CLAUSE: row(20, "noClause", "is-duty-clause",
    "Adopting an obligation names the clause it rests on, in the member's own words. None was given. Nothing was "
    + "written."),
  NO_REASON: row(21, "noReason", "is-duty-reason",
    "This act needs your reason, in your own words. None was given. Nothing was written."),
  NO_DUTY: row(22, "noDuty", "is-duty-named",
    "This request is about one obligation, named by its id, and it names none. Nothing was written."),
  NO_SUCH_DUTY: row(23, "noSuchDuty", "is-duty-held",
    "No obligation you can see answers to that id. Nothing was written."),
  NO_SUCH_PROPOSAL: row(24, "adopt", "is-duty-proposal",
    "No proposed obligation answers to that id. Nothing was written."),
  ALREADY_ADOPTED: row(25, "adopt", "is-duty-proposal",
    "That proposal was already adopted; the answer names the obligation it became. Nothing was written."),
  DUTY_WITHDRAWN: row(26, "revise", "is-duty-live",
    "That obligation was withdrawn; it is kept and shown withdrawn, and it is not revised. Nothing was written."),
  NO_AS_OF: row(27, "occurrencesOf", "is-duty-as-of",
    "Whether an occurrence was met is answered as known on a stated day. Name the day (an instant). Nothing was "
    + "written."),
  /* C-133.28 NO_SUCH_EVENT: retired (K1569); answered through events' `noSuchEvent`. The id is never reused. */
  NO_SUCH_OCCURRENCE: row(29, "matchEvent", "is-duty-occurrence",
    "No occurrence of this obligation answers to that key. Nothing was written."),
  UNKNOWN_STATE: row(30, "recordTransition", "is-duty-state",
    "An occurrence is met, met late, overdue, pending, discharged or undetermined. This state is none of them. "
    + "Nothing was written."),
  NO_CAUSE: row(31, "recordTransition", "is-duty-cause",
    "Recording an occurrence's state says why, in your own words. Nothing was written."),
  NOT_A_SET_AGAINST: row(32, "setAgainst", "is-duty-scope",
    "Money is set against a prohibition or a threshold whose terms cite money facts and name the funds or bodies "
    + "they cover. This obligation is not one. Nothing was computed."),
  NOT_AN_OFFICE: row(33, "powersOf", "is-duty-office",
    "Powers are read for an office. The subject named is not a registered office. Nothing was read."),
  HOLDS_HYPOTHESIS: row(34, "oneHome", "is-duty-no-hypothesis",
    "An obligation holds what the record holds, never a working hypothesis: a hypothesis id was found in one of its "
    + "fields. Remove it. Nothing was written."),
  HOLDS_DUE_DATE: row(35, "oneHome", "is-duty-no-due",
    "An obligation never stores its due date: the date is computed from its rule, trigger and calendar each time it "
    + "is read. Remove the due date. Nothing was written."),
  APPEND_ONLY: row(36, "oneHome", "is-duty-append-only",
    "A recorded state of an occurrence, and a version of an obligation, are never changed or removed once written; a "
    + "later record stands beside them. Nothing was changed."),
});

/** A refusal carrying its row. Called with the code as a literal at each site, so the DEC-49 guard reads which code
 *  a marked region mints. */
export function refusal(code, detail, extra) {
  const r = DUTIES_CHECKS[code];
  return { ok: false, reason: code, code, check: r.check, translation: r.translation, detail, ...(extra || {}) };
}
