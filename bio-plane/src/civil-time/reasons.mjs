/* civil-time: the reasons the module gives for an undetermined answer of `values.mjs` (R30). A reason is `{key, vars}`,
 * never English: `key` a row of the word list, `vars` the values it fills. `reasonText` reads one in English through
 * the list, for a caller that draws a sentence itself (a trace, a log); the screens read `word(key, vars)` (people R40
 * passes the reason on exactly as given). The keys written first here are `localize` calls (K3930, K3943). */
import { word, localize } from "../setup-words/index.mjs";

/** R30: a reason, a key with its fills. */
export const reason = (key, vars = {}) => ({ key, vars });

const TEXT = {
  "civil-time.start_stated": (v) => word("civil-time.start_stated", v),
  "civil-time.end_stated": (v) => word("civil-time.end_stated", v),
  "civil-time.validity_states_zone": (v) => word("civil-time.validity_states_zone", v),
  "civil-time.precision_precision_held": (v) => word("civil-time.precision_precision_held", v),
  "civil-time.occur_clocks_move": (v) => word("civil-time.occur_clocks_move", v),
  "civil-time.occurs_twice_clocks": (v) => word("civil-time.occurs_twice_clocks", v),
  "civil-time.values.start_open": (v) => localize("civil-time.values.start_open", "{value} has an open start, so which comes first is not settled", v),
  "civil-time.values.start_unknown": (v) => localize("civil-time.values.start_unknown", "{value} has an unknown start, so which comes first is not settled", v),
  "civil-time.values.end_open": (v) => localize("civil-time.values.end_open", "{value} has an open end, so which comes first is not settled", v),
  "civil-time.values.end_unknown": (v) => localize("civil-time.values.end_unknown", "{value} has an unknown end, so which comes first is not settled", v),
  "civil-time.values.overlap": (v) => localize("civil-time.values.overlap", "{value} ({precision} precision, {zone}) and {value_2} ({precision_2} precision, {zone_2}) overlap, so the precision held does not say which came first", v),
  "civil-time.values.overlaps_start": (v) => localize("civil-time.values.overlaps_start", "{value} overlaps the start {bound} at the precision held", v),
  "civil-time.values.overlaps_end": (v) => localize("civil-time.values.overlaps_end", "{value} overlaps the end {bound} at the precision held", v),
  "civil-time.values.event_unresolved": (v) => localize("civil-time.values.event_unresolved", "the bounding event {event} ({edge}) is not resolved", v),
  "civil-time.values.event_unresolved_edgeless": (v) => localize("civil-time.values.event_unresolved_edgeless", "the bounding event {event} is not resolved", v),
};

/** Every key a reason of this module can carry (the test asserts each is held by the list or written by `localize`). */
export const REASON_KEYS = Object.keys(TEXT);

/** A `why` as English: a string as it is, a `{key, vars}` through the list. */
export function reasonText(why) {
  if (typeof why === "string") return why;
  if (!why || typeof why !== "object" || typeof why.key !== "string" || !Object.hasOwn(TEXT, why.key))
    throw new TypeError("a reason is a string or {key, vars} with a key this module gives");
  return TEXT[why.key](why.vars ?? {});
}
