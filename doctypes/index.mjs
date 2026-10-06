/* doctypes — the seven content types, split from docprofile by copy (T33-13; K617).
 *
 * What kind of document a capture is, what is in it, and whether a change between two
 * readings of it is meaningful. Each type recognises a document by the vocabulary the
 * active jurisdiction profiles supply (`ctx.view`), through docprofile's shared helpers,
 * and holds no place's vocabulary itself (R3, R20).
 *
 * THE ORDER IS LOAD-BEARING (R1). docprofile's `doctypeFor` takes the first type that
 * matches at CERTAIN, so registration order decides a certain/certain tie. Minutes come
 * before the agenda (an agenda packet can be both; the rarer reading is offered first),
 * the substance types before the directory (a report carrying a contact block is a
 * report first), and `generic`, the one fallback, last. The reasons are recorded at each
 * type's own header and at docprofile's registry, where this order was first measured.
 *
 * This module does not register itself anywhere: `registerDoctypes(register)` is how a
 * composition root (the plane) wires the types into docprofile's registry (R2). */
import meetingCalendar from "./meeting-calendar.mjs";
import meetingMinutes from "./meeting-minutes.mjs";
import meetingAgenda from "./meeting-agenda.mjs";
import staffReport from "./staff-report.mjs";
import regulation from "./regulation.mjs";
import staffDirectory from "./staff-directory.mjs";
import generic from "./generic.mjs";

/** The seven types in their registration order (R1). Frozen: the order is a fact other
 *  modules rest on, not a list a caller may edit. */
export const DOCTYPES = Object.freeze([meetingCalendar, meetingMinutes, meetingAgenda, staffReport, regulation,
                                       staffDirectory, generic]);

/* Which registrations have already received the seven. A `register` function is
   remembered by identity; a registry object (`makeRegistry()`'s, passed whole) also by
   the members it already holds, so a second call, through either, adds nothing. */
const REGISTERED = new WeakSet();

/** Register every type, once each, in R1's order (R2). `register` is a registry's
 *  `register` function, or the registry itself (anything with a `register` method).
 *  Called again on the same registry it registers nothing, and says how many it added. */
export function registerDoctypes(register) {
  const target = register && typeof register === "object" && typeof register.register === "function" ? register : null;
  const fn = target ? (m) => target.register(m) : register;
  if (typeof fn !== "function")
    throw new TypeError("registerDoctypes needs a registry's register function, or the registry itself");
  const key = target || register;
  if (REGISTERED.has(key)) return { registered: 0, why: "the seven types are already registered here" };
  const held = target && typeof target.all === "function" ? new Set(target.all().map((m) => m && m.key)) : new Set();
  let n = 0;
  for (const t of DOCTYPES) {
    if (held.has(t.key)) continue;
    fn(t);
    n++;
  }
  REGISTERED.add(key);
  if (target && typeof target.register === "function") REGISTERED.add(target.register);
  return { registered: n, why: n ? null : "every type was already held by this registry" };
}

export { meetingCalendar, meetingMinutes, meetingAgenda, staffReport, regulation, staffDirectory, generic };
