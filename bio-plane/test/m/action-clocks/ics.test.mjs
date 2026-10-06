/* action-clocks' one-off calendar file (R14; K1451; DEC-94 (3)) at its interface: `clocksIcs`, its op, and the
   exported renderer. The file is read back as RFC 5545 says a reader reads it (lines unfolded, CRLF, TEXT unescaped). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP, CLK } from "./fixture.mjs";
import * as clocks from "../../../src/action-clocks/index.mjs";
import * as actions from "../../../src/actions/index.mjs";

const M = V("alice");
const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";

/* RFC 5545 §3.1: content lines end in CRLF and a line beginning with one space continues the previous one. */
function unfold(ics) {
  assert.ok(ics.endsWith("\r\n"), "every line ends in CRLF");
  assert.ok(!/[^\r]\n/.test(ics), "no bare LF");
  for (const l of ics.split("\r\n")) assert.ok(new TextEncoder().encode(l).length <= 75, `folded at 75 octets: ${l.slice(0, 40)}`);
  return ics.replace(/\r\n /g, "").split("\r\n").filter(Boolean);
}
const unescape = (v) => v.replace(/\\n/g, "\n").replace(/\\([,;\\])/g, "$1");
function events(lines) {
  const out = [];
  let cur = null;
  for (const l of lines) {
    if (l === "BEGIN:VEVENT") cur = {};
    else if (l === "END:VEVENT") { out.push(cur); cur = null; }
    else if (cur) { const i = l.indexOf(":"); cur[l.slice(0, i)] = l.slice(i + 1); }
  }
  return out;
}

function setUp() {
  const w = world();
  w.action(A, ["clock:", ...CLK("2026-09-07", "pending", "the clerk's answer, in full; with fees"), ...CLK("2026-09-04", "met"),
               '  - text: "budget adopted"', '    description: "d"', "    date: 2026-12-20", '    basis: "the budget calendar"',
               "    status: pending", "    basis_kind: dependency", '    precedes: "the fiscal year"', '    why: "a budget precedes its period"']);
  /* an entry with no YYYY-MM-DD date, held only by replay. */
  assert.equal(w.promote(B, actionMd(B, [...CP, "action_kind: other", "clock:", '  - text: "t"', '    description: "d"', "    date: someday",
    "    basis: Act s.2", "    status: pending", ...CLK("2027-01-04", "pending", "x".repeat(120))]), { extra: { replay: true } }).ok, true);
  return w;
}

test("R14 clocksIcs answers one iCalendar file of the pending dated entries of the named actions: an all-day event on the entry's day in the action's zone, its summary the text, its description the basis and the action, a stable UID per (action, position); undated entries left out and counted", () => {
  const w = setUp();
  const docs = [w.text(A), w.text(B)];
  const r = w.c.clocksIcs({ actions: [A, B], viewer: M });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.filename, r.content_type, r.events, r.left_out], ["deadlines.ics", "text/calendar; charset=utf-8", 3, { undated: 1 }]);
  const lines = unfold(r.ics);
  assert.deepEqual([lines[0], lines[1], lines[lines.length - 1]], ["BEGIN:VCALENDAR", "VERSION:2.0", "END:VCALENDAR"]);
  assert.ok(lines.includes("PRODID:-//CivicOS//action-clocks//EN") && lines.includes("X-WR-TIMEZONE:America/Halifax"));
  const ev = events(lines);
  assert.deepEqual(ev.map((e) => [e.UID, e["DTSTART;VALUE=DATE"], e["DTEND;VALUE=DATE"]]),
    [[`${A}.0@civicos`, "20260907", "20260908"], [`${A}.2@civicos`, "20261220", "20261221"], [`${B}.1@civicos`, "20270104", "20270105"]],
    "pending dated entries only: the met one is left out; the undated one is counted");
  assert.equal(unescape(ev[0].SUMMARY), "the clerk's answer, in full; with fees", "TEXT escaped and read back whole");
  assert.equal(unescape(ev[0].DESCRIPTION), `Basis: Act s.2\nAction: ${A}`);
  assert.equal(unescape(ev[1].DESCRIPTION), `Basis: it must precede the fiscal year, because a budget precedes its period: the budget calendar\nAction: ${A}`);
  assert.equal(unescape(ev[2].SUMMARY), "x".repeat(120), "a long line folded and unfolded whole");
  assert.ok(ev.every((e) => e.DTSTAMP === "20260928T120000Z" && e.TRANSP === "TRANSPARENT"));
  /* the zone's VTIMEZONE over the events' years: its offset at the start and each change of 2026 and 2027. */
  const tz = lines.slice(lines.indexOf("BEGIN:VTIMEZONE"), lines.indexOf("END:VTIMEZONE") + 1);
  assert.equal(tz[1], "TZID:America/Halifax");
  const obs = [];
  for (let i = 0; i < tz.length; i++) if (/^BEGIN:(STANDARD|DAYLIGHT)$/.test(tz[i])) obs.push(tz.slice(i, i + 5).join("|"));
  assert.deepEqual(obs, [
    "BEGIN:STANDARD|DTSTART:20260101T000000|TZOFFSETFROM:-0400|TZOFFSETTO:-0400|END:STANDARD",
    "BEGIN:DAYLIGHT|DTSTART:20260308T020000|TZOFFSETFROM:-0400|TZOFFSETTO:-0300|END:DAYLIGHT",
    "BEGIN:STANDARD|DTSTART:20261101T020000|TZOFFSETFROM:-0300|TZOFFSETTO:-0400|END:STANDARD",
    "BEGIN:DAYLIGHT|DTSTART:20270314T020000|TZOFFSETFROM:-0400|TZOFFSETTO:-0300|END:DAYLIGHT",
    "BEGIN:STANDARD|DTSTART:20271107T020000|TZOFFSETFROM:-0300|TZOFFSETTO:-0400|END:STANDARD"]);
  /* stable: a second download names the same events by the same UIDs. */
  w.clock.ms += 86400000;
  assert.deepEqual(events(unfold(w.c.clocksIcs({ actions: `${B},${A}`, viewer: M }).ics)).map((e) => e.UID).sort(), ev.map((e) => e.UID).sort());
  assert.deepEqual([w.text(A), w.text(B)], docs, "writes nothing");
});

test("R14 a one-off file the member saves: no address is published, nothing is pushed; an absent or invisible action answers actions.noSuchAction; at most 200 actions", () => {
  const w = setUp();
  const r = w.c.clocksIcs({ actions: [A], viewer: M });
  assert.ok(!/https?:|webcal:|mailto:/i.test(r.ics) && !("url" in r), "no address to subscribe to, no outside channel");
  assert.match(r.says, /nothing is published or sent/);
  assert.deepEqual(w.c.clocksIcs({ actions: [A, "ACTN-2026-0404-x"], viewer: M }), actions.noSuchAction("ACTN-2026-0404-x"));
  assert.deepEqual(w.c.clocksIcs({ actions: [A], viewer: "nobody" }), actions.noSuchAction(A));
  for (const a of [[], "", null, Array.from({ length: 201 }, (_, i) => `ACTN-2026-${String(i + 1).padStart(4, "0")}-z`)])
    assert.equal(w.c.clocksIcs({ actions: a, viewer: M }).reason, "CLOCKS_ICS_REFUSED");
  /* through the op: the actions named in the query, the viewer the stamp. */
  const op = clocks.actionClocksOps(w.c, new URL(`https://x/?actions=${A}&actions=${B}&viewer=${M}`), null).clocksics();
  assert.equal(op.events, 3);
  assert.equal(clocks.actionClocksOps(w.c, new URL(`https://x/?actions=${A}&viewer=nobody`), null).clocksics().reason, "NO_SUCH_ACTION");
});

test("R14 the renderer: each zone's VTIMEZONE, a zone with no change held as one observance, X-WR-TIMEZONE only for one zone", () => {
  const ics = clocks.icsCalendar({ stampMs: Date.parse("2026-09-28T12:00:00Z"), events: [
    { uid: "a.0@civicos", day: "2026-07-01", zone: "America/Halifax", summary: "s", description: "d" },
    { uid: "b.0@civicos", day: "2026-07-01", zone: "UTC", summary: "s", description: "d" }] });
  const lines = unfold(ics);
  assert.deepEqual(lines.filter((l) => l.startsWith("TZID:")), ["TZID:America/Halifax", "TZID:UTC"]);
  assert.ok(!lines.some((l) => l.startsWith("X-WR-TIMEZONE")));
  const utc = lines.slice(lines.indexOf("TZID:UTC") + 1, lines.indexOf("TZID:UTC") + 6);
  assert.deepEqual(utc, ["BEGIN:STANDARD", "DTSTART:20260101T000000", "TZOFFSETFROM:+0000", "TZOFFSETTO:+0000", "END:STANDARD"]);
});
