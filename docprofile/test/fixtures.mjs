/* Fixtures for docprofile's requirement-named tests.
 *
 * TWO MADE-UP JURISDICTIONS, neither of them Oakland (R30): Port Alder and Lakemont.
 * Each is a TEST profile in `jurisdictions`' shape (its R1–R7), every fact carrying
 * `basis: "TEST"`. They differ in every fact a content type reads, so a test can show
 * a reader following the view it is given and nothing else (R6).
 *
 * `view(...)` is `jurisdictions.combine` of the profiles given (its R12–R16): the
 * view a caller passes as `ctx.view`. Patterns are written the way the held profiles
 * write them, anchors and groups included.
 */
import { combine, validate } from "../../jurisdictions/index.mjs";

const p = (re, flags) => (flags ? { re, flags } : { re });
const fact = (pattern, extra) => ({ pattern, basis: "TEST", ...(extra || {}) });

export const PORT_ALDER = {
  id: "port-alder-test", name: "Port Alder (test)", covers: ["Town of Port Alder"], test: true,
  spaces: {
    enactment: {
      label: "Port Alder bylaws and orders",
      forms: [{ form: "serial", pattern: p("^0*(\\d{3,4})$"), normal: [{ group: 1 }], basis: "TEST" }],
      kinds: [
        { kind: "bylaw", prefix: p("bylaw\\s+(?:no\\.?\\s*)?", "i"), basis: "TEST" },
        { kind: "order", prefix: p("order\\s+(?:no\\.?\\s*)?", "i"), basis: "TEST" },
      ],
    },
  },
  systems: [{ origin: "pa-records", name: "Port Alder records", hosts: ["records.portalder.test"], basis: "TEST" }],
  vocabulary: {
    furniture: [fact(p("^Town of Port Alder$")), fact(p("^Office of the Town Recorder$")), fact(p("^View Record$"))],
    bodies: [fact(p("(Harbor Commission|Select Board|Committee)\\s*$", "i"))],
    member_titles: [fact(p("^Selectperson"))],
    enactment_markers: [fact(p("T\\.B\\.S\\."))],
    codes: [{ key: "pac", label: "P.A.C.", pattern: p("P\\.A\\.C\\.|Port Alder Code"), basis: "TEST" }],
    file_numbers: [{ pattern: p("PA-\\d{3}"), system: "pa-records", basis: "TEST" }],
    report_titles: [fact(p("^MEMO TO THE (?:BOARD|COMMISSION)\\b"))],
    report_sections: [fact(p("^RECOMMENDATION\\b")), fact(p("^SUMMARY\\b")), fact(p("^COST\\b")),
                      fact(p("^HISTORY\\b")), fact(p("^NEXT STEPS\\b"))],
    recommendation_openers: [fact(p("The Manager advises that", "i"))],
    template_blanks: [fact(p("SPONSOR: \\[NAME\\]"))],
  },
  practice: { minutes_due_days: { value: 10, basis: "TEST" } },
};

export const LAKEMONT = {
  id: "lakemont-test", name: "Lakemont (test)", covers: ["City of Lakemont"], test: true,
  spaces: {
    enactment: {
      label: "Lakemont ordinances",
      forms: [{ form: "serial", pattern: p("^(L\\d{3})$", "i"), normal: [{ group: 1, upper: true }], basis: "TEST" }],
      kinds: [{ kind: "ordinance", prefix: p("ordinance\\s+(?:no\\.?\\s*)?", "i"), basis: "TEST" }],
    },
  },
  systems: [{ origin: "lk-records", name: "Lakemont records", hosts: ["records.lakemont.test"], basis: "TEST" }],
  vocabulary: {
    furniture: [fact(p("^City of Lakemont$"))],
    bodies: [fact(p("Lakemont Council\\s*$", "i"))],
    member_titles: [fact(p("^Alderman"))],
    codes: [{ key: "lmc", label: "L.M.C.", pattern: p("L\\.M\\.C\\."), basis: "TEST" }],
    file_numbers: [{ pattern: p("LK\\d{5}"), system: "lk-records", basis: "TEST" }],
    report_titles: [fact(p("^COUNCIL BRIEFING\\b"))],
    report_sections: [fact(p("^RECOMMENDATION\\b")), fact(p("^CONTEXT\\b")), fact(p("^BUDGET\\b")), fact(p("^RISKS\\b"))],
    recommendation_openers: [fact(p("Officers propose that", "i"))],
  },
  practice: { minutes_due_days: { value: 30, basis: "TEST" } },
};

/** `jurisdictions.combine` of these profiles, as a caller would pass it. Every
 *  fixture profile must validate, or the tests are not testing what they claim. */
export function view(...profiles) {
  for (const pr of profiles) {
    const v = validate(pr);
    if (!v.ok) throw new Error(`fixture profile ${pr.id} is invalid: ${JSON.stringify(v.errors)}`);
  }
  const r = combine(profiles);
  if (!r.ok) throw new Error(`fixture views do not combine: ${JSON.stringify(r.errors)}`);
  return r.view;
}

/** A view with no profile in it: nothing local is known. */
export const EMPTY = combine([]).view;

/* ---- documents written in Port Alder's vocabulary ---- */

/** An agenda: file numbers alone on their lines, item blocks, a masthead on every
 *  page, the jurisdiction's furniture between pages. */
export const PA_AGENDA = [
  "Tuesday, March 3, 2026",
  "Harbor Commission",
  "Agenda - FINAL",
  "Roll Call",
  "1",
  "Call To Order And Welcome",
  "PA-101",
  "Subject:",
  "Dock Fee Schedule",
  "From:",
  "Harbor Master",
  "Recommendation: Adopt the dock fee schedule for the season",
  "2.1",
  "PA-102",
  "Page 1",
  "Town of Port Alder",
  "Tuesday, March 3, 2026",
  "Agenda - FINAL",
  "Subject:",
  "Mooring Permits",
  "From:",
  "Selectperson Reyes",
  "Recommendation: Receive the report",
  "2.2",
  "PA-103",
  "Page 2",
  "Town of Port Alder",
  "Agenda - FINAL",
  "PA-101",
].join("\n");

/** The same agenda with PA-102 pulled and PA-104 added, PA-103's subject changed. */
export const PA_AGENDA_REVISED = PA_AGENDA
  .replace("2.1\nPA-102", "2.1\nPA-104")
  .replace("Mooring Permits", "Mooring Permits And Waitlist");

/** Minutes: masthead at page rate, a motion with its vote, a roster, the frame. */
export const PA_MINUTES = [
  "Wednesday, March 4, 2026",
  "Harbor Commission",
  "Meeting Minutes - DRAFT",
  "The Harbor Commission Convened At 6:30 P.M.",
  "Ana Reyes, Bo Chen, and Cy Diaz",
  "Present",
  "3 -",
  "Dee Park",
  "Excused",
  "1 -",
  "3.1",
  "Subject:",
  "Dock Fee Schedule",
  "From:",
  "Harbor Master",
  "PA-101",
  "A motion was made by Ana Reyes, seconded by Bo Chen, that this matter be Approved. The motion carried by the following vote:",
  "Aye:",
  "Ana Reyes, Bo Chen, and Cy Diaz",
  "3 -",
  "Excused:",
  "Dee Park",
  "1 -",
  "Page 1",
  "Town of Port Alder",
  "Wednesday, March 4, 2026",
  "Harbor Commission",
  "Meeting Minutes - DRAFT",
  "3.2",
  "Subject:",
  "Mooring Permits",
  "PA-103",
  "This Informational Report be Received and Filed.",
  "Page 2",
  "Town of Port Alder",
  "Wednesday, March 4, 2026",
  "Harbor Commission",
  "Meeting Minutes - DRAFT",
  "There Being No Further Business, The Harbor Commission Adjourned The Meeting At 7:02 P.M.",
].join("\n");

/** A staff memo in the Port Alder template, citing a bylaw, the code and a file. */
export const PA_REPORT = [
  "MEMO TO THE BOARD",
  "TO: Select Board FROM: Town Manager SUBJECT: Mooring Fees DATE: March 1, 2026",
  "RECOMMENDATION",
  "Adopt Bylaw No. 2041 T.B.S. amending P.A.C. Section 4.12 to set mooring fees.",
  "SUMMARY",
  "The fees were last set by Order No. 1990, under file PA-117.",
  "COST",
  "None to the general fund.",
  "HISTORY",
  "See P.A.C. Section 4.12 and Bylaw No. 2041.",
  "Respectfully submitted,",
  "Town Manager",
].join("\n");

/** A bylaw: body above its own blank caption, recitals, the operative voice. */
export const PA_BYLAW = [
  "HARBOR COMMISSION",
  "BYLAW NO. ____ T.B.S.",
  "SPONSOR: [NAME]",
  "A BYLAW AMENDING THE TOWN CODE CHAPTER 4 TO SET MOORING FEES FOR THE TOWN HARBOR.",
  "WHEREAS, Order No. 1990 set the mooring fees; and",
  "WHEREAS, the fees no longer cover the harbor's costs; and",
  "NOW, THEREFORE, THE HARBOR COMMISSION DOES ORDAIN AS FOLLOWS:",
  "SECTION 1. P.A.C. Section 4.12 is hereby amended to read as set out below.",
].join("\n");

/** A directory: six addresses at one domain, a title line naming it. */
export const PA_DIRECTORY = [
  "Harbor Staff Directory",
  "Ana Reyes, Harbor Master  areyes@portalder.test  555-201-0001",
  "Bo Chen, Deputy  bchen@portalder.test  555-201-0002",
  "Cy Diaz, Clerk  cdiaz@portalder.test  555-201-0003",
  "Dee Park, Warden  dpark@portalder.test  555-201-0004",
  "Eli Moss, Ranger  emoss@portalder.test  555-201-0005",
  "Fay Lin, Engineer  flin@portalder.test  555-201-0006",
].join("\n");

/* ---- HTML captures, for the stack axis and the layered pipeline ---- */

const vs = (v) => `<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${v}" />`;

/** A meeting calendar served by ASP.NET WebForms (CERTAIN), in the record vendor's
 *  page shape; `rows` are [id, body, "M/D/YYYY", status?, agendaId?, minutesId?]. */
export function calendarHtml(rows, { state = "abc", range = "This Month" } = {}) {
  const tr = rows.map(([id, body, date, status, ag, mi]) =>
    `<tr><td><a href="MeetingDetail.aspx?ID=${id}&amp;GUID=x">${body}${status ? " - " + status : ""}</a></td>`
    + `<td>${date}</td>`
    + `<td>${ag ? `<a href="View.ashx?M=A&amp;ID=${ag}">Agenda</a>` : "Not available"}</td>`
    + `<td>${mi ? `<a href="View.ashx?M=M&amp;ID=${mi}">Minutes</a>` : "Not available"}</td></tr>`).join("\n");
  return `<html><head><title>Calendar</title></head><body><form id="aspnetForm">${vs(state)}
<div id="ctl00_divTop">site header</div>
<main id="mainContent" role="main">
<input id="ctl00_lstYears_Input" value="${range}" />
<table>${tr}</table>
</main></form></body></html>`;
}

/** A WordPress article; `nav` is the site navigation outside the article. */
export function wordpressArticle({ nav = "Home | News", body = "The harbor reopened today." } = {}) {
  return `<html><head><meta name="generator" content="WordPress 6.5" />
<link rel="stylesheet" href="/wp-content/themes/x/style.css?ver=1.2" /></head>
<body><nav>${nav}</nav><article><h1>Harbor</h1><p>${body}</p></article>
<footer>© the paper</footer></body></html>`;
}

/** A client-rendered shell: an empty mount point, a framework marker, no prose. */
export function shellHtml(stamp = "1") {
  return `<html><head><script src="/app.${stamp}.js"></script></head><body>`
    + `<div id="root"></div><script>window.__INITIAL_STATE__={}</script>`
    + "<!--" + "x".repeat(2400) + "-->" + `</body></html>`;
}
