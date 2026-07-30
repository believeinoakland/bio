/* A meeting calendar: a list of meetings, each with a date, a body, a status, and
 * documents that arrive at different times relative to the meeting itself.
 *
 * MEASURED on oakland.legistar.com/Calendar.aspx, 2026-07-30. This type is written
 * from that page and nothing else, and every rule below points at something in it.
 *
 *   The visible range is "This Month", read from the range control's own value.
 *   Dates on the page span 6/29/2026 to 7/31/2026. THE WINDOW IS RELATIVE TO NOW.
 *   18 meetings, each keyed by a stable MeetingDetail.aspx?ID=.
 *   FIVE of the eighteen read CANCELLED.
 *   Document links carry a type code: M=A is an Agenda (11 present), M=M is Minutes
 *   (10 present), with AADA and MADA the accessible versions of each.
 *
 * THE FALSE POSITIVE THIS TYPE EXISTS TO KILL. Because the window is relative, a
 * check a week later sees a different set of meetings: some have scrolled out of
 * range. The membership diff underneath reports those as REMOVED, which is the
 * heaviest signal the system has and which is reserved for a public record being
 * delisted. A meeting leaving the visible window is not that. No amount of care
 * about bytes or furniture could tell the two apart, because the distinction is
 * about what a calendar IS: it shows a moving window onto a longer series.
 *
 * So absence is only a delisting when the meeting's own date is INSIDE the window
 * the new capture shows. Outside it, absence is expected and silent.
 *
 * THE TEMPORAL STRUCTURE, which is the other half. A meeting has a scheduled date
 * and documents that are due at knowable times relative to it: an agenda BEFORE,
 * minutes AFTER. That makes some absences into facts with dates attached, which is
 * the most valuable thing this type produces. Minutes that have not appeared three
 * weeks after a meeting are a fact about the body, not a gap in the record.
 */
import { TYPE_CONFIDENCE, entity, referential, temporal, diffEntities } from "./index.mjs";
import { unescapeHtml } from "../index.mjs";

/* How long after a meeting minutes stop being merely late. Not a guess dressed as
   a rule: Oakland's own practice is the thing to measure, and until it is measured
   this is a threshold for RAISING A QUESTION, never for asserting a violation. */
const MINUTES_DUE_DAYS = 21;
const DAY = 86400000;

const parseDate = (s) => {
  const m = /(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(String(s || ""));
  if (!m) return null;
  return Date.UTC(+m[3], +m[1] - 1, +m[2]);
};
const iso = (t) => (t == null ? null : new Date(t).toISOString().slice(0, 10));

export default {
  key: "meeting_calendar",
  label: "a meeting calendar",
  version: 1,

  detect(ctx) {
    const t = String(ctx.text || "");
    const signals = [];
    if (/MeetingDetail\.aspx\?ID=/i.test(unescapeHtml(t))) signals.push("meeting detail links");
    if (/\bCalendar\.aspx/i.test(String(ctx.locator || "")) || /\bcalendar\b/i.test(String(ctx.locator || "")))
      signals.push("calendar address");
    if (/Date Range Dropdown|lstYears_Input/i.test(t)) signals.push("a date-range control");
    if (/>\s*(?:Agenda|Minutes)\s*</i.test(t)) signals.push("agenda and minutes columns");
    /* The detail links are the definitive signal: a page listing meetings by id IS
       a meeting calendar whatever it is called. */
    if (signals.includes("meeting detail links") && signals.length >= 2)
      return { match: true, confidence: TYPE_CONFIDENCE.CERTAIN, signals };
    if (signals.length >= 2) return { match: true, confidence: TYPE_CONFIDENCE.LIKELY, signals };
    return { match: false, confidence: TYPE_CONFIDENCE.NONE };
  },

  /** What is in it: the window it shows, and one entity per meeting. */
  parse(ctx) {
    const raw = unescapeHtml(String(ctx.text || ""));
    const main = /<main\b[^>]*>([\s\S]*)<\/main>/i.exec(raw);
    const scope = main ? main[1] : raw;

    /* The window. Read from the control's own value where the page states it, and
       from the dates present as a fallback, because an inferred window is still far
       better than treating every absence as a delisting. `relative` is the fact
       that matters: a named range like "This Month" means the window MOVES. */
    const named = /lstYears_Input"[^>]*\bvalue="([^"]*)"/i.exec(raw);
    const dates = (scope.match(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g) || []).map(parseDate).filter((x) => x != null);
    const window = {
      named: named ? named[1].trim() : null,
      relative: named ? /this|next|last|current|upcoming|past|month|year|week/i.test(named[1]) : true,
      from: dates.length ? Math.min(...dates) : null,
      to: dates.length ? Math.max(...dates) : null,
    };

    const entities = [];
    for (const row of scope.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) || []) {
      const id = /MeetingDetail\.aspx\?ID=(\d+)/i.exec(row);
      if (!id) continue;
      const flat = row.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const docs = {};
      for (const d of row.match(/View\.ashx\?M=([A-Za-z]+)&ID=(\d+)[^"'\s]*/gi) || []) {
        const c = /M=([A-Za-z]+)&ID=(\d+)/i.exec(d);
        /* The ADA variants are the same document in an accessible form, so they are
           not separate documents and their presence is not a separate event. */
        const kind = { A: "agenda", M: "minutes", AADA: "agenda", MADA: "minutes", IC: "packet" }[c[1].toUpperCase()];
        if (kind && !docs[kind]) docs[kind] = c[2];
      }
      const when = parseDate(flat);
      /* The body is the text before the date, which is how Legistar lays a row out.
         Kept as a fact rather than a key: a committee being renamed is a change
         worth seeing, and it must not silently become a different meeting. */
      /* The status word is stripped OUT of the body name. Legistar writes the
         status into the title text ("Rules and Legislation Committee - CANCELLED"),
         so leaving it in means a cancellation moves two facts at once and reports a
         spurious rename beside the real event. Caught on the real page. */
      const body = flat.split(/\d{1,2}\/\d{1,2}\/\d{4}/)[0]
        .replace(/^[*\s]+/, "").replace(/[\s-]*\b(?:CANCELL?ED|RESCHEDULED)\b[\s-]*/gi, " ").trim();
      entities.push(entity(id[1], "meeting", flat.slice(0, 160), {
        body, date: iso(when),
        status: /\bCANCELL?ED\b/i.test(flat) ? "cancelled"
              : /\bRESCHEDULED\b/i.test(flat) ? "rescheduled" : "scheduled",
        agenda: docs.agenda || null, minutes: docs.minutes || null,
      }));
    }
    return { entities, window, at: ctx.at || null };
  },

  /** Given two parses, what actually happened. */
  assess(a, b, ctx) {
    /* A read that found nothing is a failed reader, never an emptied calendar. */
    if (!a.entities.length || !b.entities.length)
      return { meaningful: null, significance: null, events: [], confirmed: null,
               why: "the meetings on this calendar could not be read this time, so nothing is "
                  + "claimed about them either way" };

    const d = diffEntities(a.entities, b.entities);
    const events = [];
    const w = b.window;
    const inWindow = (dateIso) => {
      if (!dateIso || w.from == null || w.to == null) return null;
      const t = Date.parse(dateIso + "T00:00:00Z");
      return t >= w.from && t <= w.to;
    };

    /* GONE: only a delisting if the meeting's date is inside the range the new
       capture actually shows. This is the whole reason this type exists. */
    let scrolled = 0;
    for (const e of d.gone) {
      const within = inWindow(e.facts.date);
      if (within === false) { scrolled++; continue; }
      events.push({ type: within === null ? "possibly_delisted" : "delisted",
                    significance: "event", key: e.key, label: e.label,
                    why: within === null
                      ? "a meeting is no longer listed, and this calendar's date range could not be "
                      + "read, so whether it simply moved out of view is not established"
                      : "a meeting dated inside the range this calendar shows is no longer listed" });
    }

    for (const alt of d.altered) {
      const f = new Map(alt.moved.map((m) => [m.fact, m]));
      if (f.has("status")) {
        const now = f.get("status").now;
        events.push({ type: now === "cancelled" ? "cancelled" : now === "rescheduled" ? "rescheduled" : "status_changed",
                      significance: "event", key: alt.entity.key, label: alt.entity.label,
                      was: f.get("status").was, now,
                      why: `a meeting's status changed from ${f.get("status").was} to ${now}` });
      }
      if (f.has("date"))
        events.push({ type: "moved", significance: "event", key: alt.entity.key,
                      label: alt.entity.label, was: f.get("date").was, now: f.get("date").now,
                      why: "a meeting's date changed" });
      if (f.has("body"))
        events.push({ type: "renamed", significance: "notice", key: alt.entity.key,
                      was: f.get("body").was, now: f.get("body").now,
                      why: "the body holding a meeting is named differently" });
      /* A document APPEARING is the normal course of business and is a routine
         event with a temporal connection attached. A document DISAPPEARING or being
         SWAPPED is not: a published agenda or set of minutes that stops being the
         one it was is the quiet substitution, and it is an event. */
      for (const kind of ["agenda", "minutes"]) {
        if (!f.has(kind)) continue;
        const { was, now } = f.get(kind);
        if (!was && now)
          events.push({ type: `${kind}_published`, significance: "routine", key: alt.entity.key,
                        label: alt.entity.label, document: now,
                        why: `${kind} were published for a meeting that had none` });
        else if (was && !now)
          events.push({ type: `${kind}_withdrawn`, significance: "event", key: alt.entity.key,
                        label: alt.entity.label,
                        why: `${kind} that this calendar previously offered are no longer offered` });
        else
          events.push({ type: `${kind}_replaced`, significance: "event", key: alt.entity.key,
                        label: alt.entity.label, was, now,
                        why: `the ${kind} document for this meeting is a different document than before` });
      }
    }

    /* A meeting appearing is the calendar doing its job. */
    for (const e of d.appeared)
      events.push({ type: "scheduled", significance: "routine", key: e.key, label: e.label,
                    why: "a meeting was added to the calendar" });

    const RANKS = { routine: 0, notice: 1, event: 2 };
    events.sort((x, y) => RANKS[y.significance] - RANKS[x.significance]);
    const worst = events.length ? events[0].significance : null;
    const meaningful = events.some((e) => e.significance === "event");

    /* The confirmation half, kept even when something did change, because on a
       calendar most of it did not and that is worth saying. */
    const intact = a.entities.filter((e) =>
      b.entities.some((x) => x.key === e.key && JSON.stringify(x.facts) === JSON.stringify(e.facts))).length;

    const parts = [];
    if (events.some((e) => e.significance === "event"))
      parts.push(events.filter((e) => e.significance === "event").length + " needing attention");
    if (scrolled) parts.push(`${scrolled} no longer in the range shown, which is this calendar moving its window`);
    if (d.appeared.length) parts.push(`${d.appeared.length} newly listed`);

    return {
      meaningful, significance: worst, events,
      confirmed: { entries: b.entities.length, intact, window: w.named || null,
                   scrolled_out: scrolled },
      why: events.length || scrolled
        ? `${intact} of ${a.entities.length} meetings unchanged` + (parts.length ? "; " + parts.join(", ") : "")
        : `all ${b.entities.length} meetings on this calendar are unchanged`,
    };
  },

  /** What this calendar implies about relationships and about time. */
  connections(a, b, ctx) {
    const out = [];
    const now = ctx.now ? Date.parse(ctx.now) : Date.now();
    for (const m of b.entities) {
      const self = `meeting:${m.key}`;
      /* REFERENTIAL: a document belongs to a meeting, and a meeting belongs to a
         body. Claims about scope, followed to understand what a thing is part of. */
      if (m.facts.agenda)
        out.push(referential(`document:${m.facts.agenda}`, self, "is_the_agenda_for",
          "this document is the agenda for that meeting"));
      if (m.facts.minutes)
        out.push(referential(`document:${m.facts.minutes}`, self, "is_the_minutes_of",
          "this document records what happened at that meeting"));
      if (m.facts.body)
        out.push(referential(self, `body:${m.facts.body}`, "held_by",
          "this meeting was held by that body"));

      /* TEMPORAL: a sequence, and its most useful form is an expected thing that
         has not arrived. A meeting whose date has passed with no minutes is a fact
         about the body rather than a hole in the record, and it carries a date. */
      const when = m.facts.date ? Date.parse(m.facts.date + "T00:00:00Z") : null;
      if (when == null) continue;
      if (m.facts.status === "cancelled") continue;   // nothing is owed for a meeting that did not happen
      if (m.facts.minutes)
        out.push(temporal(self, `document:${m.facts.minutes}`, "minutes_published_after",
          { at: m.facts.date, why: "minutes for this meeting exist, so the meeting was recorded" }));
      else if (when < now)
        out.push(temporal(self, null, "minutes_not_yet_published",
          { at: m.facts.date, expected_by: iso(when + MINUTES_DUE_DAYS * DAY),
            why: now - when > MINUTES_DUE_DAYS * DAY
              ? "this meeting was scheduled more than three weeks ago and this calendar still offers no minutes"
              : "this meeting has taken place and no minutes are offered yet" }));
      if (!m.facts.agenda && when > now)
        out.push(temporal(self, null, "agenda_not_yet_published",
          { at: m.facts.date, expected_by: m.facts.date,
            why: "this meeting is upcoming and no agenda is offered yet" }));
    }
    return out;
  },
};
