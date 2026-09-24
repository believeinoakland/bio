/* The CONTENT-TYPE axis: a second registry of the SAME shape as the stack axis.
 *
 * Before CONSTRUCTS Step 0 this file carried its own ordered loop and its own rank
 * table, a near-duplicate of the stack registry's. Now both axes are `makeRegistry()`
 * instances of the one recogniser engine (recogniser.mjs), which is the whole claim
 * of framework §4: a third axis is a third `makeRegistry()`, not a third loop.
 *
 * SEVEN types are registered today -- `meeting_calendar`, `meeting_agenda`,
 * `meeting_minutes`, `staff_report`, `regulation`, `staff_directory` and the `generic`
 * fallback (the register() calls below) -- of which SIX are measured real types, and the
 * restraint is still deliberate rather than unfinished.
 *
 * CORRECTED 2026-09-14 (CPDF-17): this header used to open "Only ONE real type is
 * registered today" and went on to list an agenda among the types that "none has been
 * measured, so none is written". Both were true when written and both went false when
 * FW-15 added `meeting_agenda` below (see its own comment at the register() call). A
 * file that describes itself wrongly is the record overclaiming -- D-106's class, and
 * the same defect CPDF-17 corrected in the plane's tier-3 comments. Part II section 15
 * of `docs/architecture/BIO_Content_Framework_v0_10.md` inventories what is registered
 * and is the authority; it caught this line.
 *
 * UPDATED 2026-09-15 (FW-18), and the count above is now the thing CPDF-17's
 * correction obliges every later author to move: three types were added in the order
 * M0-32's census measured (`MEASUREMENTS.md` M-18) -- meeting minutes, then the staff
 * report, then the ordinance or resolution. A staff DIRECTORY, the fourth and smallest
 * class in that order, was withheld by FW-18 on a measurement and WRITTEN BY FW-20
 * (2026-09-23) once that measurement was re-taken and did not hold: see the register()
 * calls below.
 *
 * Every measured type was written from a document that was actually fetched and read:
 * `meeting_calendar` from a page that was fetched, diffed and read, `meeting_agenda`
 * from a real Legistar agenda packet's Tier-1 text, and FW-18's three from the real
 * Oakland documents each names in its own header, read through the plane's own Tier-1
 * extractor; FW-20's directory from real Oakland directories read through the plane's
 * tier-2 member. The rule has not moved: a content type invented from what a document
 * probably looks like is a type that reassures people about things it has not
 * understood. The generic type reports change without describing it, which is noisy and
 * honest, and the noise is the prompt to go and measure. */
import { makeRegistry } from "../recogniser.mjs";
import meetingCalendar from "./meeting-calendar.mjs";
import meetingAgenda from "./meeting-agenda.mjs";
import meetingMinutes from "./meeting-minutes.mjs";
import staffReport from "./staff-report.mjs";
import regulation from "./regulation.mjs";
import staffDirectory from "./staff-directory.mjs";
import generic from "./generic.mjs";

/* generic carries `fallback: true`, so the shared registry returns it when nothing
   detects — same mechanism as the conservative handler on the stack axis. */
const types = makeRegistry();
types.register(meetingCalendar);
/* meeting_minutes (FW-18) is registered BEFORE meeting_agenda, and the order is
   load-bearing rather than alphabetical. `recognise` walks in registration order and
   BREAKS ON THE FIRST CERTAIN detection, so when two types are both certain the
   earlier one wins. Minutes and the agenda of the same meeting share their file
   numbers and their item blocks, and the document that can be BOTH at once is the
   agenda PACKET, whose minutes-side evidence is quoted rather than its own. Putting
   minutes first means the rarer, more specific reading is offered its chance; the
   agenda's own masthead rate then decides. Neither type rests on this order for
   correctness -- each was corrected until it separates the two measured documents on
   its own evidence -- and `alsoSatisfies` below reports what the break hid. */
types.register(meetingMinutes);
/* meeting_agenda (FW-15) is the SECOND measured type, written from a real
   Legistar agenda packet's Tier-1 text — the first content type reached through
   text a non-HTML container produced, which is the FORMAT-axis uniformity claim
   exercised on the content axis. */
types.register(meetingAgenda);
/* staff_report and regulation (FW-18), classes 2 and 3 of M0-32's order. Both are
   SUBSTANCE contracts and both read documents published by the City of Oakland rather
   than by Legistar, which is why both match over flattened text: that producer's
   Tier-1 output breaks phrases across lines (see `flatten` in ./index.mjs). */
types.register(staffReport);
types.register(regulation);
/* staff_directory (FW-20), class 4 of M0-32's order (~395 items, the smallest class).
   FW-18 withheld it (D-376) because every directory it fetched was Tier-1 UNDECODABLE,
   and read that as a tier-3 gap. FW-20 re-took the census through the plane with its
   fleet bound and the premise did not survive: the markers were `no_tounicode`, TIER 2's
   case, and with the tier-2 member bound 56 of 57 name-matched documents read from text
   (`bio-plane/scripts/fw20-decode-census.mjs`; `docs/development/measurements/M-121.md`). So the type
   is written from directories that were actually fetched AND read — see its own header.
   Registered AFTER the three substance types: `recognise` breaks on the first CERTAIN,
   and a report or an instrument that happens to carry a contact block is that document
   first; `also` then says it is a directory too. */
types.register(staffDirectory);
types.register(generic);

export function doctypes() { return types.all(); }

/** Identify what KIND of content this is, independently of the stack that served it.
 *  A thin wrapper over the shared registry; always returns something.
 *
 *  FW-18 / M0-32 — `also`: WHAT ELSE THIS DOCUMENT IS. The census measured that 52 of
 *  600 sampled documents (about one in twelve) satisfy MORE THAN ONE class, so a
 *  content type that assumes one document is one kind mis-describes one document in
 *  twelve. The engine cannot say so: `recognise` stops at the first CERTAIN detection,
 *  so its `considered` list is truncated at whatever won and a second class is
 *  invisible. That break is the STACK axis's behaviour too and is not this axis's to
 *  move, so the multi-class fact is produced here instead, by asking every registered
 *  type independently.
 *
 *  IT CHANGES NO VERDICT. `type`, `confidence`, `signals` and `considered` are exactly
 *  what they were; `also` is a new field beside them, and the plane's profile stamp
 *  reads named fields rather than the whole object, so nothing downstream moves. A
 *  reader is handed the same list through `ctx.alsoSatisfies` so it can state the fact
 *  in the reading's own facts, which is the surface a member actually sees.
 *
 *  A type whose `detect` THROWS is reported as such rather than silently dropped: a
 *  recogniser that cannot answer is a different fact from one that answered no. */
export function doctypeFor(ctx) {
  const r = types.recognise(ctx);
  return { type: r.member, confidence: r.confidence, signals: r.signals, considered: r.considered,
           also: alsoFor(ctx, r.member.key) };
}

/** Every registered type OTHER than `selfKey` whose own `detect` matches this text.
 *  Exported for the suite and for callers that want the fact without a full profile. */
export function alsoFor(ctx, selfKey) {
  const out = [];
  for (const m of types.all()) {
    if (m.key === selfKey || m.fallback === true) continue;
    let d;
    try { d = m.detect(ctx) || { match: false }; }
    catch (e) { out.push({ key: m.key, confidence: null, signals: [], error: String((e && e.message) || e) }); continue; }
    if (d.match) out.push({ key: m.key, confidence: d.confidence, signals: d.signals || [] });
  }
  return out;
}

export { meetingCalendar, meetingAgenda, meetingMinutes, staffReport, regulation, staffDirectory, generic };
export * from "./index.mjs";
