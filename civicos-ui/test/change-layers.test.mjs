/* The layered change pipeline, and the content type that made the layers necessary.
 *
 * RULED by Bob: recognising change is layered. Which stack, then whether the bytes
 * differ at all, then whether the difference is noteworthy, then WHAT TYPE of
 * content changed, then whether the change is meaningful for that type, then what
 * connections it implies. Each layer can settle the question, and nothing below a
 * settled layer runs.
 *
 * The fixture calendar mirrors the real one: a relative window ("This Month"),
 * meetings keyed by MeetingDetail id, statuses written into the title text, and
 * agenda and minutes links carrying View.ashx type codes. Every one of those is a
 * measured property of oakland.legistar.com/Calendar.aspx.
 *
 * The load-bearing assertions:
 *   1. The layers SHORT-CIRCUIT, and the trail says where reasoning stopped.
 *   2. Identical bytes and same-substance both produce a CONFIRMATION, because a
 *      dated statement that nothing changed is evidence and not an absence of news.
 *   3. A calendar whose WINDOW moved is not a changed calendar. This is the false
 *      positive the whole layer exists to kill: the window is relative, so meetings
 *      scroll out, and the membership diff underneath calls that a delisting, which
 *      is the heaviest signal the system has.
 *   4. A meeting vanishing from INSIDE the shown range still is a delisting.
 *   5. Referential and temporal connections are separate kinds, and the temporal
 *      ones include an expected-by date so an absence becomes a fact.
 */
import { webcrypto } from "crypto";
import {
  assess, LAYER, doctypeFor, meetingCalendar, generic,
  CONNECTION, diffEntities, TYPE_CONFIDENCE,
} from "../../docprofile/registry.mjs";

const sha = async (b) => [...new Uint8Array(await webcrypto.subtle.digest("SHA-256", b))]
  .map((x) => x.toString(16).padStart(2, "0")).join("");
const enc = (s) => new TextEncoder().encode(s);
let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

const VS = "dDwtMTs" + "x".repeat(400);
const LOC = "https://oakland.legistar.com/Calendar.aspx";
const H = { server: "Microsoft-IIS/10.0", "x-powered-by": "ASP.NET" };

/* A meeting row in Legistar's shape: status in the title text, documents as
   View.ashx links with a type code. */
const MEET = (id, body, date, status, agenda, minutes) =>
  `<tr><td><a href="MeetingDetail.aspx?ID=${id}&amp;GUID=G${id}">${body}${status ? " - " + status : ""}</a></td>` +
  `<td>${date}</td><td>${agenda ? `<a href="View.ashx?M=A&amp;ID=${agenda}">Agenda</a>` : "Not available"}</td>` +
  `<td>${minutes ? `<a href="View.ashx?M=M&amp;ID=${minutes}">Minutes</a>` : "Not available"}</td></tr>`;
const CAL = (rows, range) => `<!DOCTYPE html><html><head><title>Calendar</title></head><body>
<form id="aspnetForm"><input type="hidden" name="__VIEWSTATE" value="${VS}" />
<div id="ctl00_divTop"><div id="divHeaderLeft">Home</div></div>
<main id="mainContent" role="main">
<input id="ctl00_ContentPlaceHolder1_lstYears_Input" value="${range || "This Month"}" readonly="readonly" title="Date Range Dropdown List" />
<table>${rows.join("")}</table></main></form></body></html>`;

const JULY = [
  MEET(1, "Rules and Legislation Committee", "7/30/2026", null, 900, null),
  MEET(2, "Public Safety Committee", "7/28/2026", null, 901, 801),
  MEET(3, "Finance and Management Committee", "7/14/2026", null, 902, 802),
];
const JUNE_AND_JULY = [MEET(9, "City Council", "6/29/2026", null, 890, 790), ...JULY];

const ctx = (extra) => ({ sha256: sha, locator: LOC, headers: H, now: "2026-08-01T00:00:00Z", ...extra });

/* ---- 1. the layers, and where they stop ---- */
let r = await assess(enc(CAL(JULY)), enc(CAL(JULY)), ctx());
ok("identical bytes settle at the byte layer", r.stopped_at === LAYER.BYTES);
ok("with the verdict identical", r.verdict === "identical" && r.meaningful === false);
ok("and the stack was still identified first", r.trail[0].layer === LAYER.STACK);
ok("naming the handler that spoke", /ASP\.NET WebForms/.test(r.trail[0].said));
/* Bob: if nothing is different, that is NOTED. */
ok("identical bytes produce a confirmation rather than silence",
   r.confirmation && r.confirmation.kind === "identical_bytes");
ok("the profile is recorded whatever the outcome", r.profile.handler === "aspnet_webforms");

r = await assess(enc(CAL(JULY)), enc(CAL(JULY).replace(VS, "ZZ" + "q".repeat(500))), ctx());
ok("reissued page state settles at the noteworthy layer", r.stopped_at === LAYER.NOTEWORTHY);
ok("as unchanged", r.verdict === "unchanged" && r.meaningful === false);
ok("and still confirms the substance", r.confirmation.kind === "same_substance");
ok("nothing was parsed, because the layer above settled it",
   !r.trail.some((t) => t.layer === LAYER.MEANING));

r = await assess(enc(CAL(JULY)), enc(CAL(JULY).replace(">Home<", ">Home Contact<")), ctx());
ok("a change outside the document is a restyle", r.verdict === "restyled" && r.meaningful === false);
ok("which also stops before the content is read", r.stopped_at === LAYER.NOTEWORTHY);

/* ---- 2. the content type is a separate axis from the stack ---- */
const dt = doctypeFor({ text: CAL(JULY), locator: LOC });
ok("a calendar is recognised as a calendar", dt.type.key === "meeting_calendar");
ok("with certainty from its meeting links", dt.confidence === TYPE_CONFIDENCE.CERTAIN);
ok("and the type is not a property of the stack that served it",
   doctypeFor({ text: CAL(JULY), locator: "https://granicus.example/Calendar" }).type.key === "meeting_calendar");
ok("an unrecognised type falls back and describes nothing",
   doctypeFor({ text: "<html><body><p>a memo</p></body></html>", locator: "https://x/m" }).type.key === "generic");
ok("the fallback says so rather than guessing",
   /has not been worked out/.test(generic.assess().why));

/* ---- 3. what the parse finds ---- */
const p = meetingCalendar.parse({ text: CAL(JULY), locator: LOC });
ok("every meeting is found", p.entities.length === 3);
ok("keyed by its stable id, not its position", p.entities.map((e) => e.key).join() === "1,2,3");
ok("the window is read from the control the page shows", p.window.named === "This Month");
ok("and is known to be RELATIVE, which is what makes absence ambiguous", p.window.relative === true);
const cancelled = meetingCalendar.parse({ text: CAL([MEET(1, "Rules and Legislation Committee", "7/30/2026", "CANCELLED", null, null)]), locator: LOC });
ok("a cancellation is read as a status", cancelled.entities[0].facts.status === "cancelled");
/* Caught on the real page: Legistar writes the status into the title, so leaving
   it there moves two facts at once and reports a spurious rename beside the event. */
ok("and is stripped out of the body's name, so a status change is ONE fact",
   cancelled.entities[0].facts.body === "Rules and Legislation Committee");

/* ---- 4. THE WINDOW. The false positive this layer exists to kill. ---- */
const before = meetingCalendar.parse({ text: CAL(JUNE_AND_JULY), locator: LOC });
const after = meetingCalendar.parse({ text: CAL(JULY), locator: LOC });
let m = meetingCalendar.assess(before, after, { now: "2026-08-01T00:00:00Z" });
ok("a meeting that scrolled out of the window is NOT meaningful", m.meaningful === false);
ok("and raises no event at all", m.events.length === 0);
ok("it is accounted for as the window moving", m.confirmed.scrolled_out === 1);
ok("said in those terms, not as a disappearance", /moving its window/.test(m.why));
ok("while the meetings that remain are confirmed intact",
   m.confirmed.intact === 3 && m.confirmed.entries === 3);

/* Inside the shown range, the same absence IS the heaviest signal available. */
const lost = meetingCalendar.parse({ text: CAL([JULY[0], JULY[2]]), locator: LOC });
m = meetingCalendar.assess(after, lost, { now: "2026-08-01T00:00:00Z" });
ok("a meeting inside the range that vanishes IS meaningful", m.meaningful === true);
ok("and is an event", m.significance === "event" && m.events[0].type === "delisted");
ok("named as dated inside the range the calendar shows",
   /inside the range this calendar shows/.test(m.events[0].why));
/* And when the window cannot be read, the honest answer is neither. */
const noRange = meetingCalendar.parse({ text: CAL(JULY).replace(/lstYears_Input[^>]*>/, ">"), locator: LOC });
const noRange2 = { ...noRange, window: { named: null, relative: true, from: null, to: null },
                   entities: noRange.entities.slice(1) };
m = meetingCalendar.assess(noRange, noRange2, { now: "2026-08-01T00:00:00Z" });
ok("an unreadable window yields possibly_delisted, not a claim either way",
   m.events[0].type === "possibly_delisted" && /not established/.test(m.events[0].why));

/* Documents: appearing is routine, replaced or withdrawn is an event. */
const noMin = meetingCalendar.parse({ text: CAL([MEET(2, "Public Safety Committee", "7/28/2026", null, 901, null)]), locator: LOC });
const withMin = meetingCalendar.parse({ text: CAL([MEET(2, "Public Safety Committee", "7/28/2026", null, 901, 801)]), locator: LOC });
m = meetingCalendar.assess(noMin, withMin, { now: "2026-08-01T00:00:00Z" });
ok("minutes appearing after a meeting is routine, not an alarm",
   m.events[0].type === "minutes_published" && m.meaningful === false);
const swapMin = meetingCalendar.parse({ text: CAL([MEET(2, "Public Safety Committee", "7/28/2026", null, 901, 999)]), locator: LOC });
m = meetingCalendar.assess(withMin, swapMin, { now: "2026-08-01T00:00:00Z" });
ok("minutes REPLACED under an unchanged heading is an event", m.meaningful === true
   && m.events[0].type === "minutes_replaced");
m = meetingCalendar.assess(withMin, noMin, { now: "2026-08-01T00:00:00Z" });
ok("minutes withdrawn is an event", m.meaningful === true && m.events[0].type === "minutes_withdrawn");
/* A read that finds nothing is a failed reader, never an emptied calendar. */
m = meetingCalendar.assess(after, { entities: [], window: after.window }, {});
ok("an unreadable calendar claims nothing either way", m.meaningful === null && !m.events.length);

/* ---- 5. connections: two kinds, understood differently ---- */
const conns = meetingCalendar.connections(after, after, { now: "2026-08-01T00:00:00Z" });
const ref = conns.filter((c) => c.connection === CONNECTION.REFERENTIAL);
const tem = conns.filter((c) => c.connection === CONNECTION.TEMPORAL);
ok("referential connections are emitted", ref.length > 0);
ok("saying a document belongs to a meeting", ref.some((c) => c.relation === "is_the_agenda_for"));
ok("and a meeting to the body that held it", ref.some((c) => c.relation === "held_by"));
ok("temporal connections are a SEPARATE kind, not the same edge", tem.length > 0);
ok("minutes existing records that the meeting was minuted",
   tem.some((c) => c.relation === "minutes_published_after"));
/* The most valuable temporal form: an absence with a date on it. */
const late = tem.find((c) => c.relation === "minutes_not_yet_published");
ok("a past meeting with no minutes becomes a fact about the body", !!late);
ok("carrying the date it was due, so the absence can be aged", !!late.expected_by);
ok("and worded as the body's omission rather than the record's gap",
   /still offers no minutes|no minutes are offered/.test(late.why));
/* Nothing is owed for a meeting that did not happen. */
const cancelledCal = meetingCalendar.parse({ text: CAL([MEET(5, "Rules Committee", "7/14/2026", "CANCELLED", null, null)]), locator: LOC });
ok("a cancelled meeting owes no minutes",
   !meetingCalendar.connections(cancelledCal, cancelledCal, { now: "2026-08-01T00:00:00Z" })
     .some((c) => c.relation === "minutes_not_yet_published"));
/* An upcoming meeting with no agenda is a different absence with its own date. */
const upcoming = meetingCalendar.parse({ text: CAL([MEET(6, "City Council", "9/10/2026", null, null, null)]), locator: LOC });
const ag = meetingCalendar.connections(upcoming, upcoming, { now: "2026-08-01T00:00:00Z" })
  .find((c) => c.relation === "agenda_not_yet_published");
ok("an upcoming meeting with no agenda is noted with its own due date",
   !!ag && ag.expected_by === "2026-09-10");

/* ---- the whole pipeline, reaching the bottom ---- */
r = await assess(enc(CAL(JULY)),
  enc(CAL([MEET(1, "Rules and Legislation Committee", "7/30/2026", "CANCELLED", 900, null), JULY[1], JULY[2]])), ctx());
ok("a real cancellation reaches the connections layer", r.stopped_at === LAYER.CONNECTIONS);
ok("and is reported as a change worth attention",
   r.verdict === "changed" && r.meaningful === true && r.significance === "event");
ok("naming the content type it was judged as", r.content_type === "meeting_calendar");
ok("with the cancellation itself as the event", r.events.some((e) => e.type === "cancelled"));
ok("connections come with it", r.connections.length > 0);
/* Even a changed document confirms what did not change, which on a list is most. */
ok("and the confirmation survives the change", r.confirmation && r.confirmation.intact >= 2);
ok("the trail records all six layers when it goes the distance", r.trail.length === 6);

console.log(`change-layers: ${n} assertions, all green`);
