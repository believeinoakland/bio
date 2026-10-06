/* following: the meetings a `per_meeting` watch is captured before, and when each capture is due (R4, R5; ladders
 * §4.4 TIME L3). Pure over what its caller hands it: the view (recurrences, deadlines, zone), the body's observed
 * meetings from `events`, and "now". Counting and expansion are `civil-time`'s. */
import { expandRecurrence, evaluateRule, localDay, bounds } from "../civil-time/index.mjs";

/** R5: how far ahead a body's meetings are looked for (`civil-time` R20's own bound). */
export const MEETING_HORIZON_MONTHS = 24;
const CANCELLED = "EventCancelled";
const SOURCED = ["researched", "ruled"];

const ms = (iso) => Date.parse(iso);
const iso = (t) => new Date(t).toISOString().replace(/\.\d{3}Z$/, "Z");
function addMonths(t, n) { const d = new Date(t); d.setUTCMonth(d.getUTCMonth() + n); return d.getTime(); }

/** R5: the notice rule a link names, if the view holds it with a primary source: a `deadlines` entry counted
 *  backward from the meeting (`starts: act` or `hearing`), with a citation and a sourced status (jurisdictions R44).
 *  Answers `{rule}` or `{why}`. */
export function noticeRule(view, name) {
  if (typeof name !== "string" || !name) return { why: "the watch names no notice period for its body" };
  const rule = (Array.isArray(view && view.deadlines) ? view.deadlines : []).find((d) => d && d.rule === name);
  if (!rule) return { why: `the active profiles hold no notice period named ${name}` };
  if (rule.direction !== "backward" || !["act", "hearing"].includes(rule.starts))
    return { why: `${name} is not a period counted back from a meeting` };
  if (!SOURCED.includes(rule.status) || typeof rule.citation !== "string" || !rule.citation)
    return { why: `the profile does not hold ${name} with a primary source` };
  return { rule };
}

/* The meeting's start as a date-time and its instant, from an observed event's `when`. */
function observedStart(when) {
  if (!when || typeof when.value !== "string") return null;
  const dt = { value: when.value, precision: when.precision, zone: when.zone };
  let b;
  try { b = bounds(dt); } catch { return null; }
  return b && b.earliest ? { dt, instant: b.earliest } : null;
}

/** R4, R5: the meetings of `bodyLabel` from `fromMs` to the horizon. `observed` are the body's meeting events
 *  (`{event_id, status, when}`). An observed meeting governs over the recurrence instance on its local day; a
 *  cancelled one earns no capture. Answers `{meetings: [{start, instant, source, event_id?}], why?}`, `why` when there
 *  is no meeting to schedule. */
export function meetingsOf({ view, bodyLabel, observed = [], fromMs, zone }) {
  const toMs = addMonths(fromMs, MEETING_HORIZON_MONTHS);
  const from = iso(fromMs), to = iso(toMs);
  const byDay = new Map();
  for (const r of Array.isArray(view && view.recurrences) ? view.recurrences : []) {
    if (!r || r.body !== bodyLabel || !SOURCED.includes(r.status)) continue;
    const x = expandRecurrence({ rrule: r.rrule, dtstart: r.dtstart, zone, from: { value: from.slice(0, 19), precision: "second", zone: "UTC" },
                                 to: { value: to.slice(0, 19), precision: "second", zone: "UTC" } });
    for (const i of x && Array.isArray(x.instances) ? x.instances : [])
      byDay.set(localDay(i.instant, zone), { start: { value: i.value, precision: i.precision, zone: i.zone }, instant: i.instant,
                                              source: "recurrence", citation: r.citation });
  }
  for (const e of Array.isArray(observed) ? observed : []) {
    const s = observedStart(e.when);
    if (!s || ms(s.instant) < fromMs || ms(s.instant) > toMs) continue;
    const d = localDay(s.instant, zone);
    if (e.status === CANCELLED) { byDay.set(d, null); continue; }
    byDay.set(d, { start: s.dt, instant: s.instant, source: "observed", event_id: e.event_id });
  }
  const meetings = [...byDay.values()].filter(Boolean).sort((a, b) => ms(a.instant) - ms(b.instant));
  return meetings.length ? { meetings }
    : { meetings, why: `the body has no stated meeting schedule and no observed meeting in the next ${MEETING_HORIZON_MONTHS} months` };
}

/** R4: when the capture before `meeting` is due: its start less the notice period, counted by `civil-time`, as an
 *  instant, or `{why}` when the count is undetermined. */
export function dueBefore(meeting, rule, view) {
  const r = evaluateRule({ rule, anchor: meeting.start, view });
  if (!r || r.refused || r.undetermined || !r.due) return { why: `the notice period's count is undetermined: ${(r && r.why) || "no due"}` };
  const due = r.due.candidates ? r.due.candidates[0] : r.due;
  try { return { at: bounds(due).earliest, trace: r.trace }; } catch { return { why: "the notice period's due is not a date-time" }; }
}
