/* The CONTENT-TYPE axis: a second registry of the SAME shape as the stack axis.
 *
 * Before CONSTRUCTS Step 0 this file carried its own ordered loop and its own rank
 * table, a near-duplicate of the stack registry's. Now both axes are `makeRegistry()`
 * instances of the one recogniser engine (recogniser.mjs), which is the whole claim
 * of framework §4: a third axis is a third `makeRegistry()`, not a third loop.
 *
 * Only ONE real type is registered today, and that is deliberate rather than
 * unfinished. meeting_calendar is written from a page that was fetched, diffed and
 * read. A regulation, a staff directory, a set of meeting minutes and an agenda are
 * all named in the design doc as types worth having and none has been measured, so
 * none is written: a content type invented from what a document probably looks like
 * is a type that reassures people about things it has not understood. The generic type
 * reports change without describing it, which is noisy and honest, and the noise is
 * the prompt to go and measure. */
import { makeRegistry } from "../recogniser.mjs";
import meetingCalendar from "./meeting-calendar.mjs";
import generic from "./generic.mjs";

/* generic carries `fallback: true`, so the shared registry returns it when nothing
   detects — same mechanism as the conservative handler on the stack axis. */
const types = makeRegistry();
types.register(meetingCalendar);
types.register(generic);

export function doctypes() { return types.all(); }

/** Identify what KIND of content this is, independently of the stack that served it.
 *  A thin wrapper over the shared registry; always returns something. */
export function doctypeFor(ctx) {
  const r = types.recognise(ctx);
  return { type: r.member, confidence: r.confidence, signals: r.signals, considered: r.considered };
}

export { meetingCalendar, generic };
export * from "./index.mjs";
