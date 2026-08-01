/* The profile op=acquire records (CONSTRUCTS Step 1 / FW-3).
 *
 * The whole constructs ladder above capture rests on ONE fact being written at
 * intake: which host stack and which content type the record thinks it holds, how
 * sure each recogniser was, and — the part that makes a judgment revisable — the
 * recogniser's own version. A verdict whose author and version are unrecorded
 * cannot be re-evaluated when the author later turns out wrong, so this suite's
 * load-bearing assertion is that op=acquire carries a `profile` that NAMES the
 * handler, the content type, both confidences, both signal lists, the handler's
 * normalisation, and the recogniser versions.
 *
 * The second assertion is the honesty one: a document these HTML-stack recognisers
 * cannot read (a PDF) is profiled as the conservative handler and the generic type
 * rather than being guessed at. `undetermined` is first-class here as everywhere:
 * the profile says "unrecognised", it does not invent a stack.
 *
 * This is also the FIRST plane consumer of docprofile, which until now was read by
 * zero plane files: the suite doubles as proof the miniflare battery resolves the
 * package from outside bio-plane/ (modulesRoot "/").
 *
 * NEGATIVE CONTROL: stop stamping the handler in op=acquire (delete profile.handler
 * after the profile is built) -> "profile names the host stack handler" fails (want
 * "aspnet_webforms", got undefined). RUN 2026-07-31, restored. A profile that still
 * passes with the handler unstamped would be recording nothing load-bearing.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* A measured-shape ASP.NET WebForms meeting calendar: the __VIEWSTATE hidden field
   makes the stack CERTAIN, and the MeetingDetail.aspx?ID= links plus the date-range
   control and the Agenda/Minutes columns make the content type CERTAIN. The <main
   role="main"> is the boundary the aspnet handler normalises around. */
const CAL_HTML = [
  '<!DOCTYPE html><html><head><title>City Council Calendar</title></head><body>',
  '<form id="aspnetForm" method="post">',
  '<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwUABBBBBB==" />',
  '<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="/wEdAAoCCC==" />',
  '<main id="mainContent" role="main">',
  '<select id="lstYears_Input" name="lstYears"><option>This Month</option></select>',
  '<table><tr><th>Name</th><th>Date</th><th>Agenda</th><th>Minutes</th></tr>',
  '<tr><td><a href="MeetingDetail.aspx?ID=2101&GUID=ABC">City Council</a></td>',
  '<td>7/15/2026</td><td><a href="View.ashx?M=A&ID=1">Agenda</a></td>',
  '<td><a href="View.ashx?M=M&ID=1">Minutes</a></td></tr></table>',
  '</main></form></body></html>',
].join("");

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37, 0x0a]); // "%PDF-1.7\n"

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-prof", MEMBER_TOKEN: "mem-prof", PROBE_TOKEN: "prb-prof", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.pathname === "/Calendar.aspx")
      return new Response(CAL_HTML, { headers: {
        "content-type": "text/html; charset=utf-8",
        "x-powered-by": "ASP.NET", server: "Microsoft-IIS/10.0" } });
    if (u.pathname === "/report.pdf")
      return new Response(PDF, { headers: { "content-type": "application/pdf" } });
    return new Response("unscripted", { status: 500 });
  },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const acquire = async (body, token = "mem-prof") =>
  (await mf.dispatchFetch("http://x/api/?op=acquire&token=" + token,
    { method: "POST", body: JSON.stringify(body) })).json();

console.log("\n--- a recognised page carries its profile ---");
const cal = await acquire({ locator: "https://oakland.legistar.com/Calendar.aspx", authority: "City Clerk" });
t("acquisition succeeds", cal.ok, true);
t("the capture carries a profile block", typeof cal.document.profile, "object");
const p = cal.document.profile || {};

console.log("\n  the HOST STACK axis");
t("profile names the host stack handler", p.handler, "aspnet_webforms");
t("with a human label", typeof p.handler_label, "string");
t("and the recogniser VERSION, so the judgment can be revised later", p.handler_version, 1);
t("the handler confidence is recorded", p.confidence, "certain");
t("the handler's signals are recorded", Array.isArray(p.signals) && p.signals.includes("__VIEWSTATE field"), true);
t("the document kind is read from the address", p.document_kind, "index");

console.log("\n  the CONTENT TYPE axis");
t("profile names the content type", p.content_type, "meeting_calendar");
t("with its own recogniser version (the second author)", p.content_type_version, 1);
t("the content-type confidence is recorded (the second confidence)", p.content_type_confidence, "certain");
t("the content-type signals are recorded (the second signal set)", Array.isArray(p.content_type_signals) && p.content_type_signals.length >= 2, true);
t("the monitoring contract the type declares is carried", p.contract, "membership");

console.log("\n  what was normalised, and the source type");
t("the handler's normalisation is recorded", Array.isArray(p.normalised) && p.normalised.length >= 1, true);
t("each normalisation names a region and a label", p.normalised.every((r) => r.region && r.label), true);
t("the boundary the handler normalises around is recorded", p.boundary, true);
t("the source's declared content-type is kept, distinct from the content TYPE", p.source_content_type, "text/html");
t("the profile records it was read from the document text", p.profiled_from_text, true);
t("the profiling instant matches the capture instant", p.at, cal.document.retrieved);

console.log("\n--- an unreadable-here document is profiled HONESTLY, never guessed ---");
const pdf = await acquire({ locator: "https://www.oaklandca.gov/report.pdf", authority: "City Auditor" });
t("acquisition succeeds", pdf.ok, true);
const pp = pdf.document.profile || {};
t("a PDF lands on the conservative handler, not a fabricated stack", pp.handler, "conservative");
t("and the generic content type, not an invented one", pp.content_type, "generic");
t("the stack confidence is honestly none", pp.confidence, "none");
t("and the profile says it was NOT read as text", pp.profiled_from_text, false);
t("while still keeping the source's declared type", pp.source_content_type, "application/pdf");

await mf.dispose();
console.log(`\nprofile: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
