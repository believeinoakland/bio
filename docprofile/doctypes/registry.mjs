/* The CONTENT-TYPE axis: a second registry of the SAME shape as the stack axis.
 *
 * Before CONSTRUCTS Step 0 this file carried its own ordered loop and its own rank
 * table, a near-duplicate of the stack registry's. Now both axes are `makeRegistry()`
 * instances of the one recogniser engine (recogniser.mjs), which is the whole claim
 * of framework §4: a third axis is a third `makeRegistry()`, not a third loop.
 *
 * THREE types are registered today -- `meeting_calendar`, `meeting_agenda` and the
 * `generic` fallback (the register() calls below) -- of which TWO are measured real
 * types, and the restraint is still deliberate rather than unfinished.
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
 * Both measured types were written from documents that were actually fetched and read:
 * `meeting_calendar` from a page that was fetched, diffed and read, `meeting_agenda`
 * from a real Legistar agenda packet's Tier-1 text. A regulation, a staff directory and
 * a set of meeting minutes are still named in the design doc as types worth having and
 * none has been measured, so none is written: a content type invented from what a
 * document probably looks like is a type that reassures people about things it has not
 * understood. The generic type reports change without describing it, which is noisy and
 * honest, and the noise is the prompt to go and measure. */
import { makeRegistry } from "../recogniser.mjs";
import meetingCalendar from "./meeting-calendar.mjs";
import meetingAgenda from "./meeting-agenda.mjs";
import generic from "./generic.mjs";

/* generic carries `fallback: true`, so the shared registry returns it when nothing
   detects — same mechanism as the conservative handler on the stack axis. */
const types = makeRegistry();
types.register(meetingCalendar);
/* meeting_agenda (FW-15) is the SECOND measured type, written from a real
   Legistar agenda packet's Tier-1 text — the first content type reached through
   text a non-HTML container produced, which is the FORMAT-axis uniformity claim
   exercised on the content axis. */
types.register(meetingAgenda);
types.register(generic);

export function doctypes() { return types.all(); }

/** Identify what KIND of content this is, independently of the stack that served it.
 *  A thin wrapper over the shared registry; always returns something. */
export function doctypeFor(ctx) {
  const r = types.recognise(ctx);
  return { type: r.member, confidence: r.confidence, signals: r.signals, considered: r.considered };
}

export { meetingCalendar, meetingAgenda, generic };
export * from "./index.mjs";
