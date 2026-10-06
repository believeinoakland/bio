/* action-clocks — the one-off calendar file of a member's deadlines (requirements: `build/requirements/action-clocks.md`,
 * R14; K1451; DEC-94 (3)). Pure: it renders the events it is given as one iCalendar object (RFC 5545) and reads only
 * the runtime's time-zone data. No address is published and nothing is sent: the caller hands the text to the member.
 *
 * Each event is all-day on the entry's local day: RFC 5545 §3.2.19 forbids `TZID` on a `DATE` value, so `DTSTART` is
 * `VALUE=DATE` (the day as the action's jurisdiction reads it), and the calendar carries each zone's `VTIMEZONE` (its
 * offsets and transitions over the events' years) and, for one zone, `X-WR-TIMEZONE`. */

const CRLF = "\r\n";
const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/* RFC 5545 §3.3.11: a TEXT value's backslash, semicolon, comma and line breaks escaped. */
export function icsText(v) {
  return String(v ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r\n|\r|\n/g, "\\n");
}

/* RFC 5545 §3.1: a content line folded at 75 octets, a continuation starting with one space, never inside a character. */
export function foldLine(line) {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const out = [];
  let cur = "", n = 0, limit = 75;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (n + b > limit) { out.push(cur); cur = ""; n = 0; limit = 74; }
    cur += ch; n += b;
  }
  if (cur) out.push(cur);
  return out.join(`${CRLF} `);
}

const p2 = (n) => String(n).padStart(2, "0");
const compactDay = (day) => day.replace(/-/g, "");
function nextDay(day) {
  const m = DAY_RE.exec(day);
  const t = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) + 86400000;
  return new Date(t).toISOString().slice(0, 10);
}
const utcStamp = (ms) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

/* The zone's offset from UTC at instant `t`, in minutes, from the runtime's tz data (Intl). */
function offsetMinutes(t, zone) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, hourCycle: "h23", year: "numeric", month: "2-digit",
    day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(t));
  const g = (k) => Number(parts.find((x) => x.type === k).value);
  const wall = Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"), g("second"));
  return Math.round((wall - Math.floor(t / 1000) * 1000) / 60000);
}
const offsetText = (m) => `${m < 0 ? "-" : "+"}${p2(Math.floor(Math.abs(m) / 60))}${p2(Math.abs(m) % 60)}`;
const wallText = (t, off) => new Date(t + off * 60000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "");

/** The offset changes of `zone` from the start of `fromYear` to the end of `toYear`: `[{at, from, to}]`, `at` the
 *  instant of the change (to the minute). */
export function zoneTransitions(zone, fromYear, toYear) {
  const out = [];
  const start = Date.UTC(fromYear, 0, 1), end = Date.UTC(toYear + 1, 0, 1);
  let t = start, off = offsetMinutes(t, zone);
  while (t < end) {
    const t2 = Math.min(t + 86400000, end);
    const off2 = offsetMinutes(t2, zone);
    if (off2 !== off) {
      let lo = t, hi = t2;
      while (hi - lo > 60000) { const mid = lo + Math.floor((hi - lo) / 120000) * 60000; if (offsetMinutes(mid, zone) === off) lo = mid; else hi = mid; }
      out.push({ at: hi, from: off, to: off2 });
      off = off2;
    }
    t = t2;
  }
  return out;
}

/** One `VTIMEZONE` for `zone` over the years `fromYear`–`toYear`: its offset at the start, then each transition as a
 *  `STANDARD` or `DAYLIGHT` observance (`DAYLIGHT` when it moves to the larger of the zone's offsets that period). */
export function vtimezone(zone, fromYear, toYear) {
  const first = offsetMinutes(Date.UTC(fromYear, 0, 1), zone);
  const tr = zoneTransitions(zone, fromYear, toYear);
  const offs = [first, ...tr.map((x) => x.to)];
  const min = Math.min(...offs);
  const lines = ["BEGIN:VTIMEZONE", `TZID:${zone}`];
  const obs = (kind, wall, from, to) => [`BEGIN:${kind}`, `DTSTART:${wall}`, `TZOFFSETFROM:${offsetText(from)}`,
    `TZOFFSETTO:${offsetText(to)}`, `END:${kind}`];
  /* The first observance from local midnight of 1 January; each change at its wall time before the change. */
  lines.push(...obs(first > min ? "DAYLIGHT" : "STANDARD", `${fromYear}0101T000000`, first, first));
  for (const x of tr) lines.push(...obs(x.to > min ? "DAYLIGHT" : "STANDARD", wallText(x.at, x.from), x.from, x.to));
  lines.push("END:VTIMEZONE");
  return lines;
}

/**
 * R14: the calendar text. `events` are `{uid, day, zone, summary, description}` (`day` a `YYYY-MM-DD`, `zone` an IANA
 * name or null); `stampMs` the instant of the download (`DTSTAMP`). Every line folded and ended with CRLF.
 */
export function icsCalendar({ events, stampMs }) {
  const zones = [...new Set(events.map((e) => e.zone).filter((z) => typeof z === "string" && z))].sort();
  const years = events.map((e) => Number(e.day.slice(0, 4)));
  const y0 = years.length ? Math.min(...years) : new Date(stampMs).getUTCFullYear();
  const y1 = years.length ? Math.max(...years) : y0;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//CivicOS//action-clocks//EN", "CALSCALE:GREGORIAN",
                 "METHOD:PUBLISH", "X-WR-CALNAME:Deadlines", ...(zones.length === 1 ? [`X-WR-TIMEZONE:${zones[0]}`] : [])];
  for (const z of zones) lines.push(...vtimezone(z, y0, y1));
  const stamp = utcStamp(stampMs);
  for (const e of events) {
    lines.push("BEGIN:VEVENT", `UID:${icsText(e.uid)}`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${compactDay(e.day)}`,
      `DTEND;VALUE=DATE:${compactDay(nextDay(e.day))}`, `SUMMARY:${icsText(e.summary)}`,
      `DESCRIPTION:${icsText(e.description)}`, "TRANSP:TRANSPARENT", "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join(CRLF) + CRLF;
}
