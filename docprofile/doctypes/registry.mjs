/* Content types, in priority order. Same discipline as the stack registry: the
   most specific first, the first CERTAIN detection wins, and the fallback never
   matches and is only ever reached by falling through.

   Only ONE real type is registered today, and that is deliberate rather than
   unfinished. meeting_calendar is written from a page that was fetched, diffed and
   read. A regulation, a staff directory, a set of meeting minutes and an agenda are
   all named in the design doc as types worth having and none has been measured, so
   none is written: a content type invented from what a document probably looks like
   is a type that reassures people about things it has not understood. The generic
   type reports change without describing it, which is noisy and honest, and the
   noise is the prompt to go and measure. */
import aspnetWebforms from "../handlers/aspnet-webforms.mjs";
import meetingCalendar from "./meeting-calendar.mjs";
import generic from "./generic.mjs";
import { TYPE_CONFIDENCE } from "./index.mjs";

const TYPES = [meetingCalendar, generic];
export function doctypes() { return TYPES.slice(); }

const TYPE_RANK = { none: 0, likely: 1, certain: 2 };

/** Identify what KIND of content this is, independently of the stack that served
 *  it. Always returns something; an unrecognised type gets `generic`. */
export function doctypeFor(ctx) {
  let best = null;
  const considered = [];
  for (const t of TYPES) {
    const d = t.detect(ctx) || { match: false };
    if (d.match) considered.push({ type: t.key, confidence: d.confidence });
    if (!d.match) continue;
    if (!best || TYPE_RANK[d.confidence] > TYPE_RANK[best.confidence]) best = { type: t, ...d };
    if (d.confidence === TYPE_CONFIDENCE.CERTAIN) break;
  }
  if (!best) return { type: TYPES[TYPES.length - 1], confidence: TYPE_CONFIDENCE.NONE,
                      signals: [], considered };
  return { type: best.type, confidence: best.confidence, signals: best.signals || [], considered };
}

export { meetingCalendar, generic };
export * from "./index.mjs";
