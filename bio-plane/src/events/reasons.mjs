/* events: the reasons the module gives for an undetermined answer (R54). A reason is `{key, vars}`, never English: `key`
   a row of the word list (or a `localize` id written below), `vars` the values it fills. A reason `civil-time` gives is
   passed on exactly as it answers it. `reasonText` reads one in English, for a caller that draws a sentence itself (a
   refusal's detail, a log); the screens read `word(key, vars)`. */
import { reasonText as civilReason } from "../civil-time/index.mjs";
import { word, localize } from "../setup-words/index.mjs";

/** R54: a reason, a key with its fills. */
export const reason = (key, vars = {}) => ({ key, vars });

const TEXT = {
  "events.why.placed_nowhere_event": (v) => word("events.why.placed_nowhere_event", v),
  "events.text.held_zone_span": (v) => word("events.text.held_zone_span", v),
  "events.text.upper_bound_says": (v) => word("events.text.upper_bound_says", v),
  "events.why.precision_held_settle": (v) => word("events.why.precision_held_settle", v),
  "events.why.cited_orders_disagree": (v) => word("events.why.cited_orders_disagree", v),
  "events.why.grade_placed_nowhere": (v) => word("events.why.grade_placed_nowhere", v),
  "events.why.grade_time_unread": (v) => word("events.why.grade_time_unread", v),
  "events.why.placed_nowhere_attestation": (v) => word("events.why.placed_nowhere_attestation", v),
  "events.why.dated_attestation_see": (v) => word("events.why.dated_attestation_see", v),
  "events.vote_value_why": (v) => word("events.vote_value_why", v),
  "events.why.cache_stale": (v) => localize("events.why.cache_stale", "the time held for this event differs from what its attestations give, so it is not answered", v),
};

/** Every key a reason of this module itself gives (a reason from `civil-time` carries that module's key). */
export const REASON_KEYS = Object.keys(TEXT);

/** A `why` as English: a string as it is, a `{key, vars}` through the list. */
export function reasonText(why) {
  if (typeof why === "string") return why;
  if (why && typeof why === "object" && typeof why.key === "string" && Object.hasOwn(TEXT, why.key)) return TEXT[why.key](why.vars ?? {});
  return civilReason(why);
}
