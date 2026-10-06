/* duties' closed vocabularies (requirements: `build/requirements/duties.md`, Provides "Terms"). Frozen, so a caller
 * (`affordances`) publishes them with the members' words and never edits them. No place is named here (R23): the
 * response-status vocabulary and every rule are the active jurisdiction profiles' data. */

/** Terms: a duty is a duty, a prohibition or a power. Members see "obligation" and "power" (DEC-107). */
export const MODALITIES = Object.freeze(["duty", "prohibition", "power"]);
/** Terms: the closed union of a duty's source kinds. */
export const SOURCE_KINDS = Object.freeze(["standard", "court", "practice", "dependency"]);
/** Terms: the closed union of a duty's trigger kinds. */
export const TRIGGER_KINDS = Object.freeze(["event", "recurrence", "source", "date"]);
/** Terms: the due date's basis kinds (K1431); only `rule` is a deadline the law sets. */
export const BASIS_KINDS = Object.freeze(["rule", "commitment", "dependency", "window"]);
/** Terms: an occurrence's states (K1466). */
export const OCCURRENCE_STATES = Object.freeze(["met", "met_late", "overdue", "pending", "discharged", "undetermined"]);
/** The entity kinds an obligation's obligor may be without a further line (Terms: an office or a body). */
export const PUBLIC_KINDS = Object.freeze(["office", "body"]);
/** `entities`' organisation kinds (its Terms, K1453), which carry a sector. */
export const ORGANISATION_KINDS = Object.freeze(["institution", "body", "movement"]);
/** The line kinds that tie an acting organisation to a public body (K1440, K1505 (12)). */
export const ACTING_LINES = Object.freeze(["acts_for", "contracts_with"]);
/** R11: the level an occurrence's match is searched at, in `observation-log`'s level vocabulary. */
export const LEVEL_SEARCHED = "meaning";
/** The words an answer about an occurrence never uses (R11, R15, R17; D275). */
export const NEVER_SAID = Object.freeze(["violation", "violated", "breach", "unauthorised", "unauthorized", "within powers", "outside powers", "ultra vires"]);
/** The members' words of the connection kinds this module owns (R18; K1486). */
export const CONNECTION_KINDS = Object.freeze([
  Object.freeze({ kind: "owes", word: "owes", class: "evidentiary" }),
  Object.freeze({ kind: "owed_to", word: "is owed to", class: "evidentiary" }),
  Object.freeze({ kind: "holds_power", word: "holds the power", class: "evidentiary" }),
  Object.freeze({ kind: "met_by", word: "met by", class: "derived" }),
]);
