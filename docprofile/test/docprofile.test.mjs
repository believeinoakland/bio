/* docprofile — requirement-named tests (T2-11), at the module's interface only:
 * everything is reached through `docprofile/registry.mjs`, the entry the plane
 * imports. Every live id R1–R35 is named in at least one test title, and each test
 * checks the requirement whole over the inputs that decide it.
 *
 * Every content type is exercised under a profile that is not Oakland's (R30): the
 * made-up Port Alder and Lakemont in ./fixtures.mjs.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as dp from "../registry.mjs";
import {
  PORT_ALDER, LAKEMONT, view, PA_AGENDA, PA_AGENDA_REVISED, PA_MINUTES, PA_REPORT, PA_BYLAW,
  PA_DIRECTORY, calendarHtml, wordpressArticle, shellHtml,
} from "./fixtures.mjs";

const {
  identify, doctypeFor, digests, assess, readText, flattenText, makeLocator, fidelity,
  profileRecord, CONFIDENCE, CONTRACT, confidenceRank, EVENTS, event, worstSignificance,
  doctypes, register, aspnetWebforms, wordpress, clientRendered, conservative,
} = dp;

const PA = view(PORT_ALDER);
const LK = view(LAKEMONT);
const enc = (s) => new TextEncoder().encode(s);
const sha256 = async (b) => createHash("sha256").update(b).digest("hex");
const LADDER = new Set(Object.values(CONFIDENCE));
const typeOf = (key) => doctypes().find((t) => t.key === key);
const keys = (r) => r.entities.map((e) => e.key);
const NOW = "2026-03-20T12:00:00Z";

/* A stack handler that no registered handler resembles, defining no `kind`: the only
   way to show R2's "absent when it does not". Registered once, at the end, so it
   cannot pre-empt any built-in handler. */
const KINDLESS = register({
  key: "test_kindless", label: "a test stack with no kind", version: 1, textual: true,
  detect: (ctx) => /X-KINDLESS-STACK/.test(ctx.text || "")
    ? { match: true, confidence: CONFIDENCE.CERTAIN, signals: ["kindless marker"] } : { match: false },
  rules: () => [], renderCritical: () => false, ignorable: () => false,
});

/* ------------------------------------------------------------------ identify */

test("R1 identify returns the first CERTAIN stack, else the highest match, else conservative at NONE with why", () => {
  // first CERTAIN wins, in registration order: a shell that is ALSO WordPress is a shell
  const both = shellHtml() + '<link href="/wp-content/a.css"><link href="/wp-includes/b.js">';
  const a = identify({ text: both });
  assert.equal(a.handler.key, "client_rendered");
  assert.equal(a.confidence, CONFIDENCE.CERTAIN);
  // nothing CERTAIN: the highest confidence wins (aspnet LIKELY from a header over a POSSIBLE shell hint)
  const b = identify({ text: '<div id="app"></div><p>x</p>', headers: { "x-powered-by": "ASP.NET" } });
  assert.equal(b.handler.key, "aspnet_webforms");
  assert.equal(b.confidence, CONFIDENCE.LIKELY);
  assert.ok(b.considered.some((c) => c.key === "client_rendered" && c.confidence === CONFIDENCE.POSSIBLE));
  // equal confidence: the earlier-registered wins (aspnet before wordpress)
  const c = identify({ text: '<a href="/wp-content/x.css">x</a>', headers: { "x-powered-by": "ASP.NET" } });
  assert.equal(c.handler.key, "aspnet_webforms");
  // nothing at all: conservative, NONE, and a stated why
  const d = identify({ text: "<html><body><p>plain</p><a href='/'>home</a></body></html>" });
  assert.equal(d.handler.key, "conservative");
  assert.equal(d.confidence, CONFIDENCE.NONE);
  assert.match(d.why, /no handler recognised/);
  assert.deepEqual(d.signals, []);
  for (const r of [a, b, c, d]) assert.ok(r.handler && typeof r.handler.key === "string");
});

test("R2 kind is the winning handler's own classification of the address, and absent when it defines none", () => {
  const html = calendarHtml([["1", "Harbor Commission", "3/3/2026"]]);
  assert.equal(identify({ text: html, locator: "https://x.test/MeetingDetail.aspx?ID=1" }).kind, "record");
  assert.equal(identify({ text: html, locator: "https://x.test/Calendar.aspx" }).kind, "index");
  assert.equal(identify({ text: wordpressArticle(), locator: "https://news.test/2026/03/harbor/" }).kind, "article");
  assert.equal(identify({ text: wordpressArticle(), locator: "https://news.test/" }).kind, "index");
  assert.equal(identify({ text: shellHtml() }).kind, "shell");
  const k = identify({ text: "X-KINDLESS-STACK" });
  assert.equal(k.handler, KINDLESS);
  assert.ok(!("kind" in k), "a handler with no kind() gives a result with no kind");
});

test("R3 every confidence either axis returns is one of the ONE ladder's four values", () => {
  const texts = [shellHtml(), wordpressArticle(), calendarHtml([["1", "B", "3/3/2026"]]), "plain",
                 PA_AGENDA, PA_MINUTES, PA_REPORT, PA_BYLAW, PA_DIRECTORY, '<div id="app"></div>'];
  for (const t of texts) {
    const id = identify({ text: t, headers: { server: "Microsoft-IIS/10" } });
    assert.ok(LADDER.has(id.confidence), `stack confidence ${id.confidence}`);
    for (const c of id.considered) assert.ok(LADDER.has(c.confidence));
    const dt = doctypeFor({ text: t, view: PA, handler: id.handler, kind: id.kind });
    assert.ok(LADDER.has(dt.confidence), `type confidence ${dt.confidence}`);
    for (const c of dt.considered) assert.ok(LADDER.has(c.confidence));
    for (const c of dt.also) if (!c.error) assert.ok(LADDER.has(c.confidence));
  }
  assert.deepEqual(new Set(Object.keys(CONFIDENCE)), new Set(["CERTAIN", "LIKELY", "POSSIBLE", "NONE"]));
});

/* ----------------------------------------------------------------- doctypeFor */

test("R4 doctypeFor returns the first CERTAIN type, else the highest match, else generic at NONE", () => {
  const cases = [[PA_AGENDA, "meeting_agenda"], [PA_MINUTES, "meeting_minutes"], [PA_REPORT, "staff_report"],
                 [PA_BYLAW, "regulation"], [PA_DIRECTORY, "staff_directory"]];
  for (const [t, key] of cases) {
    const r = doctypeFor({ text: t, view: PA });
    assert.equal(r.type.key, key);
    assert.equal(r.confidence, CONFIDENCE.CERTAIN);
  }
  // a certain calendar
  const cal = doctypeFor({ text: calendarHtml([["1", "B", "3/3/2026", null, "9"]]), locator: "https://r.test/Calendar.aspx" });
  assert.equal(cal.type.key, "meeting_calendar");
  assert.equal(cal.confidence, CONFIDENCE.CERTAIN);
  // no CERTAIN: the likely match wins (a bylaw with no recitals and no caption still enacts)
  const likely = doctypeFor({ text: "The Select Board DOES HEREBY RESOLVE that the harbor opens.", view: PA });
  assert.equal(likely.type.key, "regulation");
  assert.equal(likely.confidence, CONFIDENCE.LIKELY);
  // first CERTAIN in registration order: minutes (registered before the agenda) win over an agenda that is also certain
  const both = PA_MINUTES + "\n" + PA_AGENDA;
  const w = doctypeFor({ text: both, view: PA });
  assert.equal(w.type.key, "meeting_minutes");
  // nothing: generic, NONE
  const g = doctypeFor({ text: "a letter about nothing in particular", view: PA });
  assert.equal(g.type.key, "generic");
  assert.equal(g.confidence, CONFIDENCE.NONE);
  assert.match(g.why, /no registered content type/);
});

test("R5 also names every other non-fallback type that matches, and a throwing detect as an error entry", () => {
  const both = PA_MINUTES + "\n" + PA_AGENDA;
  const r = doctypeFor({ text: both, view: PA });
  assert.equal(r.type.key, "meeting_minutes");
  const also = r.also.map((x) => x.key);
  assert.ok(also.includes("meeting_agenda"), "the agenda the break hid is stated");
  assert.ok(!also.includes("meeting_minutes"), "the winner is not in also");
  assert.ok(!also.includes("generic"), "the fallback is never in also");
  // exactly the types whose own detect matches
  for (const t of doctypes()) {
    if (t.key === r.type.key || t.fallback) continue;
    const d = t.detect({ text: both, view: PA });
    assert.equal(also.includes(t.key), !!d.match, t.key);
  }
  // a detect that throws during the also pass: reported, never dropped, never propagated.
  // `text` answers the first read (the calendar's own detect, which wins at CERTAIN and
  // stops the first pass) and throws on every read after it.
  const html = calendarHtml([["1", "B", "3/3/2026", null, "9"]]);
  let reads = 0;
  const ctx = { locator: "https://r.test/Calendar.aspx",
                get text() { if (reads++ === 0) return html; throw new Error("unreadable"); } };
  const t = doctypeFor(ctx);
  assert.equal(t.type.key, "meeting_calendar");
  const errs = t.also.filter((x) => x.error);
  assert.equal(errs.length, doctypes().filter((x) => !x.fallback && x.key !== "meeting_calendar").length);
  for (const e of errs) { assert.equal(e.confidence, null); assert.match(e.error, /unreadable/); }
});

test("R6 every content type takes its vocabulary from ctx.view and holds none of it itself", () => {
  // the same document, two views: each reader follows the view it is given
  const lkAgenda = PA_AGENDA.replace(/PA-(\d{3})/g, "LK00$1").replace(/Harbor Commission/g, "Lakemont Council")
    .replace(/Town of Port Alder/g, "City of Lakemont");
  const paParse = (t, v) => typeOf("meeting_agenda").parse({ text: t, view: v });
  assert.deepEqual(keys(paParse(PA_AGENDA, PA)), ["PA-101", "PA-102", "PA-103"]);
  assert.deepEqual(keys(paParse(PA_AGENDA, LK)), [], "Lakemont's file-number shape does not read Port Alder's");
  assert.deepEqual(keys(paParse(lkAgenda, LK)), ["LK00101", "LK00102", "LK00103"]);
  assert.equal(paParse(PA_AGENDA, PA).body, "Harbor Commission");
  assert.equal(paParse(PA_AGENDA, LK).body, null);
  assert.equal(paParse(lkAgenda, LK).body, "Lakemont Council");

  const mins = (v) => typeOf("meeting_minutes").parse({ text: PA_MINUTES, view: v });
  assert.deepEqual(keys(mins(PA)), ["PA-101", "PA-103"]);
  assert.equal(mins(PA).body, "Harbor Commission");
  assert.deepEqual(keys(mins(LK)), []);
  assert.equal(mins(LK).body, null);

  const rep = (t, v) => typeOf("staff_report").parse({ text: t, view: v });
  assert.deepEqual(keys(rep(PA_REPORT, PA)).sort(),
    ["bylaw:2041", "file:PA-117", "order:1990", "pac:4.12"].sort());
  assert.deepEqual(keys(rep(PA_REPORT, LK)), []);
  assert.equal(typeOf("staff_report").detect({ text: PA_REPORT, view: PA }).confidence, CONFIDENCE.CERTAIN);
  assert.equal(typeOf("staff_report").detect({ text: PA_REPORT, view: LK }).match, false,
    "Port Alder's template is not Lakemont's");
  const lkReport = ["COUNCIL BRIEFING", "TO: Council FROM: Officers SUBJECT: Fees DATE: May 1, 2026",
    "CONTEXT", "Ordinance No. L204 and L.M.C. Section 9.1 apply; file LK00417.", "BUDGET", "None.", "RISKS", "Low.",
    "Officers propose that the Council adopt the fee."].join("\n");
  const lr = rep(lkReport, LK);
  assert.deepEqual(keys(lr).sort(), ["file:LK00417", "lmc:9.1", "ordinance:L204"].sort());
  assert.match(lr.recommendation, /^Officers propose that the Council adopt the fee\.$/);
  assert.equal(rep(lkReport, PA).recommendation, null);

  const reg = (v) => typeOf("regulation").parse({ text: PA_BYLAW, view: v });
  assert.equal(reg(PA).instrument, "bylaw");
  assert.deepEqual(keys(reg(PA)).sort(), ["order:1990", "pac:4.12"].sort());
  assert.match(reg(PA).title, /^A BYLAW AMENDING THE TOWN CODE/);
  assert.equal(reg(LK).title, null);
  assert.deepEqual(keys(reg(LK)), []);

  // the calendar's practice threshold: 10 days in Port Alder, 30 in Lakemont, none without a view
  const html = calendarHtml([["7", "Harbor Commission", "3/2/2026"]]);
  const cal = typeOf("meeting_calendar");
  const parsed = cal.parse({ text: html });
  const due = (v) => cal.connections(parsed, parsed, { now: NOW, view: v })
    .find((c) => c.relation === "minutes_not_yet_published").expected_by;
  assert.equal(due(PA), "2026-03-12");
  assert.equal(due(LK), "2026-04-01");
  assert.equal(due(undefined), null);

  // the directory reads no local vocabulary: the same under either view, or none
  const d = (v) => keys(typeOf("staff_directory").parse({ text: PA_DIRECTORY, view: v }));
  assert.deepEqual(d(PA), d(LK));
  assert.deepEqual(d(PA), d(undefined));
});

/* -------------------------------------------------------------------- digests */

test("R7 identity is always sha256 of the bytes", async () => {
  for (const [bytes, h] of [[enc(calendarHtml([["1", "B", "3/3/2026"]])), aspnetWebforms],
                            [enc("plain"), conservative], [new Uint8Array([0, 255, 1]), { textual: false }],
                            [enc(shellHtml()), clientRendered]]) {
    const d = await digests(bytes, h, { sha256 });
    assert.equal(d.identity, await sha256(bytes));
  }
});

test("R8 a non-textual handler gives rendition and evidentiary equal to identity and textual false", async () => {
  const bytes = new Uint8Array([37, 80, 68, 70, 0, 1, 2]);
  const d = await digests(bytes, { key: "binary", textual: false }, { sha256 });
  assert.equal(d.rendition, d.identity);
  assert.equal(d.evidentiary, d.identity);
  assert.equal(d.textual, false);
});

test("R9 textual digests: rendition after mechanical rules, evidentiary after the boundary or presentational rules, three region labels", async () => {
  // mechanical only moves: rendition and evidentiary both unmoved
  const a = await digests(enc(calendarHtml([["1", "B", "3/3/2026"]], { state: "AAA" })), aspnetWebforms, { sha256 });
  const b = await digests(enc(calendarHtml([["1", "B", "3/3/2026"]], { state: "BBB" })), aspnetWebforms, { sha256 });
  assert.notEqual(a.identity, b.identity);
  assert.equal(a.rendition, b.rendition);
  assert.equal(a.evidentiary, b.evidentiary);
  assert.equal(a.textual, true);
  // outside the boundary is presentational: evidentiary unmoved, rendition moved
  const h1 = calendarHtml([["1", "B", "3/3/2026"]]).replace("site header", "site header one");
  const h2 = calendarHtml([["1", "B", "3/3/2026"]]).replace("site header", "site header two");
  const c = await digests(enc(h1), aspnetWebforms, { sha256 });
  const d = await digests(enc(h2), aspnetWebforms, { sha256 });
  assert.notEqual(c.rendition, d.rendition);
  assert.equal(c.evidentiary, d.evidentiary);
  assert.ok(c.applied.some((x) => x.rule === "outside_the_document" && x.region === "presentational"));
  // no boundary declared: the presentational rules decide (a handler with rules only)
  const nb = { key: "nb", textual: true,
    rules: () => [{ key: "chrome", region: "presentational", label: "chrome",
                    patterns: [/(<nav>)([\s\S]*?)(<\/nav>)/g] }] };
  const e = await digests(enc("<nav>one</nav><p>body</p>"), nb, { sha256 });
  const f = await digests(enc("<nav>two</nav><p>body</p>"), nb, { sha256 });
  assert.equal(e.evidentiary, f.evidentiary);
  assert.ok(e.presentational_bytes > 0);
  // every label reported is one of the three
  for (const x of [...a.applied, ...c.applied, ...e.applied])
    assert.ok(["mechanical", "presentational", "evidentiary"].includes(x.region));
  const decoded = new TextEncoder().encode("<nav>one</nav><p>body</p>");
  assert.equal(e.rendition, await sha256(decoded), "no mechanical rule: rendition is the decoded text");
});

test("R10 a declared boundary that misses normalises nothing beyond mechanical and says boundary_missed", async () => {
  // WordPress declares <article> as the boundary of an article; this article has none
  const noArticle = (nav) => `<html><head><meta name="generator" content="WordPress 6.5"></head>`
    + `<body><nav>${nav}</nav><div>The harbor reopened.</div><footer>f</footer></body></html>`;
  const ctx = { sha256, locator: "https://news.test/2026/03/harbor/" };
  const a = await digests(enc(noArticle("Home")), wordpress, ctx);
  const b = await digests(enc(noArticle("Home | Sports")), wordpress, ctx);
  assert.equal(a.boundary_missed, true);
  assert.equal(a.presentational_bytes, 0, "nothing presentational is normalised");
  assert.notEqual(a.evidentiary, b.evidentiary, "a change outside the missed boundary is still substance");
  assert.equal(a.evidentiary, a.rendition);
  const hit = await digests(enc(wordpressArticle()), wordpress, ctx);
  assert.equal(hit.boundary_missed, false);
  // the precondition, and the one throw
  await assert.rejects(() => digests(enc("x"), conservative, {}), TypeError);
  // otherwise never throws: odd handlers and odd bytes
  await digests(enc("x"), { textual: true }, { sha256 });
  await digests(enc("x"), { textual: true, rules() { throw new Error("bad"); } }, { sha256 });
});

/* --------------------------------------------------------------------- assess */

const calCtx = (extra) => ({ sha256, locator: "https://r.test/Calendar.aspx", now: NOW, view: PA, ...extra });

test("R11 assess runs L1 to L6 in order, stops when one decides, and carries stopped_at and the trail", async () => {
  const order = ["L1_stack", "L2_bytes", "L3_noteworthy", "L4_content_type", "L5_meaning", "L6_connections"];
  const idx = (l) => order.indexOf(l);
  const same = enc(calendarHtml([["1", "Harbor Commission", "3/3/2026"]]));
  const r1 = await assess(same, same, calCtx());
  assert.equal(r1.stopped_at, "L2_bytes");
  const b = enc(calendarHtml([["1", "Harbor Commission", "3/3/2026"], ["2", "Select Board", "3/9/2026"]]));
  const r2 = await assess(same, b, calCtx());
  assert.equal(r2.stopped_at, "L6_connections");
  for (const r of [r1, r2]) {
    assert.equal(r.trail[r.trail.length - 1].layer, r.stopped_at);
    for (let i = 1; i < r.trail.length; i++) assert.ok(idx(r.trail[i].layer) > idx(r.trail[i - 1].layer), "in order");
    for (const t of r.trail) assert.equal(typeof t.said, "string");
  }
  assert.deepEqual(r2.trail.map((t) => t.layer), order);
  const sh = await assess(enc(shellHtml("1")), enc(shellHtml("2")), { sha256 });
  assert.equal(sh.stopped_at, "L1_stack");
  assert.equal(sh.trail.length, 1);
});

test("R12 the verdict is one of the seven, each reached exactly as defined", async () => {
  const row = ["1", "Harbor Commission", "3/3/2026"];
  const V = async (a, b, ctx) => (await assess(enc(a), enc(b), ctx)).verdict;
  assert.equal(await V(shellHtml("1"), shellHtml("2"), { sha256 }), "unwatchable");
  const cal = calendarHtml([row]);
  assert.equal(await V(cal, cal, calCtx()), "identical");
  assert.equal(await V(calendarHtml([row], { state: "a" }), calendarHtml([row], { state: "b" }), calCtx()), "unchanged");
  assert.equal(await V(cal.replace("site header", "new header"), cal, calCtx()), "restyled");
  // bytes differ, stack only LIKELY (header, no viewstate field), not conservative
  const likely = (s) => `<html><body><main><p>${s}</p><a href="/x">x</a></main></body></html>`;
  assert.equal(await V(likely("a"), likely("b"), { sha256, headers: { "x-powered-by": "ASP.NET" } }), "undetermined");
  // substance differs, the type judges it meaningful: a meeting cancelled
  assert.equal(await V(cal, calendarHtml([[...row.slice(0, 3), "CANCELLED"]]), calCtx()), "changed");
  // substance differs, the type judges nothing meaningful: a meeting added
  assert.equal(await V(cal, calendarHtml([row, ["2", "Select Board", "3/9/2026"]]), calCtx()), "routine");
});

test("R13 meaningful is true only for changed, false for the settled verdicts, null where nothing may be claimed", async () => {
  const row = ["1", "Harbor Commission", "3/3/2026"];
  const cal = calendarHtml([row]);
  const M = async (a, b, ctx) => { const r = await assess(enc(a), enc(b), ctx); return [r.verdict, r.meaningful]; };
  assert.deepEqual(await M(cal, cal, calCtx()), ["identical", false]);
  assert.deepEqual(await M(calendarHtml([row], { state: "a" }), calendarHtml([row], { state: "b" }), calCtx()), ["unchanged", false]);
  assert.deepEqual(await M(cal.replace("site header", "h2"), cal, calCtx()), ["restyled", false]);
  assert.deepEqual(await M(cal, calendarHtml([row, ["2", "S", "3/9/2026"]]), calCtx()), ["routine", false]);
  assert.deepEqual(await M(cal, calendarHtml([[...row, "CANCELLED"]]), calCtx()), ["changed", true]);
  assert.deepEqual(await M(shellHtml("1"), shellHtml("2"), { sha256 }), ["unwatchable", null]);
  const likely = (s) => `<html><body><main><p>${s}</p><a href="/x">x</a></main></body></html>`;
  assert.deepEqual(await M(likely("a"), likely("b"), { sha256, headers: { "x-powered-by": "ASP.NET" } }), ["undetermined", null]);
  // a content type that could not read one side: nothing is claimed, never "routine"
  const emptied = calendarHtml([]);
  const r = await assess(enc(cal), enc(emptied), calCtx());
  assert.equal(r.content_type, "meeting_calendar");
  assert.equal(r.meaningful, null);
  assert.notEqual(r.verdict, "routine");
  assert.deepEqual(r.events, []);
});

test("R14 events come from the one graded catalogue and meaningful is always worstSignificance(events) === event", async () => {
  assert.throws(() => event("not_in_the_catalogue"), /unknown event type/);
  for (const [k, spec] of Object.entries(EVENTS)) {
    assert.ok(["event", "notice", "routine"].includes(spec.significance), k);
    assert.equal(event(k).significance, spec.significance);
  }
  const row = ["1", "Harbor Commission", "3/3/2026", null, "11"];
  const pairs = [
    [calendarHtml([row]), calendarHtml([[...row.slice(0, 3), "CANCELLED", "11"]])],
    [calendarHtml([row]), calendarHtml([row, ["2", "S", "3/9/2026"]])],
    [calendarHtml([row]), calendarHtml([[row[0], "Harbor Board", row[2], null, "11"]])],
    [calendarHtml([row]), calendarHtml([[...row.slice(0, 4), "12"]])],
    ["<p>one</p>", "<p>two</p>"],  // generic under the conservative stack
  ];
  for (const [a, b] of pairs) {
    const r = await assess(enc(a), enc(b), calCtx());
    for (const e of r.events) assert.equal(EVENTS[e.type].significance, e.significance);
    assert.equal(r.meaningful, worstSignificance(r.events) === "event", `${r.verdict}: ${JSON.stringify(r.events.map((e) => e.type))}`);
  }
  // the generic type, too, derives its meaningful from an event it emits
  const g = await assess(enc("<p>one</p>"), enc("<p>two</p>"), { sha256 });
  assert.equal(g.content_type, "generic");
  assert.deepEqual(g.events.map((e) => e.type), ["substance_changed"]);
  assert.equal(g.meaningful, true);
});

test("R15 connections are referential or temporal, each in its own shape", async () => {
  const past = ["1", "Harbor Commission", "3/2/2026", null, "11"];
  const withMinutes = ["2", "Select Board", "3/4/2026", null, "21", "22"];
  const future = ["3", "Harbor Commission", "4/2/2026"];
  const r = await assess(enc(calendarHtml([past])), enc(calendarHtml([past, withMinutes, future])), calCtx());
  assert.ok(r.connections.length >= 5);
  for (const c of r.connections) {
    if (c.connection === "referential")
      assert.deepEqual(Object.keys(c).sort(), ["connection", "from", "relation", "to", "why"].sort());
    else {
      assert.equal(c.connection, "temporal");
      assert.deepEqual(Object.keys(c).sort(), ["at", "connection", "expected_by", "from", "relation", "to", "why"].sort());
    }
  }
  const rel = new Set(r.connections.map((c) => `${c.connection}:${c.relation}`));
  for (const x of ["referential:is_the_agenda_for", "referential:is_the_minutes_of", "referential:held_by",
                   "temporal:minutes_published_after", "temporal:minutes_not_yet_published",
                   "temporal:agenda_not_yet_published"]) assert.ok(rel.has(x), x);
});

test("R16 confirmation states what was verified unchanged, even beside events, null when nothing was; a read that found nothing is a failed reader", async () => {
  const rows = [["1", "Harbor Commission", "3/3/2026"], ["2", "Select Board", "3/4/2026"]];
  const cancelled = [[...rows[0], "CANCELLED"], rows[1]];
  const r = await assess(enc(calendarHtml(rows)), enc(calendarHtml(cancelled)), calCtx());
  assert.equal(r.verdict, "changed");
  assert.deepEqual({ entries: r.confirmation.entries, intact: r.confirmation.intact }, { entries: 2, intact: 1 });
  const same = await assess(enc(calendarHtml(rows)), enc(calendarHtml(rows)), calCtx());
  assert.equal(same.confirmation.kind, "identical_bytes");
  // nothing verified unchanged: every meeting altered
  const all = [[...rows[0], "CANCELLED"], [...rows[1], "CANCELLED"]];
  const none = await assess(enc(calendarHtml(rows)), enc(calendarHtml(all)), calCtx());
  assert.equal(none.confirmation, null);
  // a read that found nothing on either side: failed reader, stated
  for (const [a, b] of [[rows, []], [[], rows]]) {
    const f = await assess(enc(calendarHtml(a)), enc(calendarHtml(b)), calCtx());
    assert.equal(f.meaningful, null);
    assert.match(f.why, /could not be read/);
    assert.deepEqual(f.events, []);
  }
});

test("R17 the result carries the L1 profile always and the content type once L4 is reached", async () => {
  const row = ["1", "Harbor Commission", "3/3/2026"];
  const same = await assess(enc(calendarHtml([row])), enc(calendarHtml([row])), calCtx());
  assert.equal(same.profile.handler, "aspnet_webforms");
  assert.ok(!("content_type" in same));
  const ch = await assess(enc(calendarHtml([row])), enc(calendarHtml([row, ["2", "S", "3/9/2026"]])), calCtx());
  const id = identify({ ...calCtx(), text: calendarHtml([row, ["2", "S", "3/9/2026"]]) });
  assert.deepEqual(ch.profile, profileRecord(id, calCtx()));
  assert.equal(ch.content_type, "meeting_calendar");
  // never throws: a missing hash, bytes that are not bytes
  const bad = await assess(enc("<p>a</p>"), enc("<p>b</p>"), {});
  assert.equal(bad.meaningful, null);
  await assess(null, undefined, { sha256 });
});

/* ------------------------------------------------------------------- readText */

const pagesOf = (texts) => ({ pages: texts.map((text, page) => ({ page, text, undetermined: [] })),
                              document: texts.filter(Boolean).join("\n") });

test("R18 readText refuses when no honest reading may be produced, and says which", () => {
  const none = readText("", { view: PA });
  assert.equal(none.determined, false);
  assert.equal(none.partial, false);
  assert.match(none.why, /no text was supplied/);
  const undecoded = readText({ pages: [], undetermined: [{ reason: "no_tounicode", count: 40 }] }, { view: PA });
  assert.equal(undecoded.determined, false);
  assert.match(undecoded.why, /undetermined .*no_tounicode/);
  const mostly = readText({ document: "Harbor", counts: { undetermined: 50 }, undetermined: [{ reason: "encrypted" }] });
  assert.equal(mostly.determined, false);
  assert.equal(mostly.partial, true);
  assert.match(mostly.why, /could not decode most of it/);
});

test("R19 a determined reading carries partial, text_from, stack, doctype, parsed or parse_error, and position facts", () => {
  const r = readText(pagesOf(PA_AGENDA.split("Page 1")), { view: PA, at: "2026-03-03T00:00:00Z" });
  assert.equal(r.determined, true);
  assert.equal(r.partial, false);
  assert.equal(r.text_from, "document");
  assert.equal(r.doctype.type.key, "meeting_agenda");
  assert.ok(r.stack && r.stack.handler);
  assert.equal(r.parse_error, null);
  assert.deepEqual(keys(r.parsed), ["PA-101", "PA-102", "PA-103"]);
  assert.equal(r.position_parts, 2);
  assert.equal(r.position_why, null);
  const part = readText({ document: PA_AGENDA, counts: { undetermined: 3 } }, { view: PA });
  assert.equal(part.partial, true);
  assert.match(part.why, /PARTIAL/);
  const s = readText("plain words", {});
  assert.equal(s.text_from, "string");
  assert.equal(s.position_parts, 0);
  assert.match(s.position_why, /bare string/);
  assert.equal(s.doctype.type.key, "generic");
  assert.deepEqual(s.parsed, { entities: [], facts: {} });
});

test("R20 the reader is handed a total locate built from the supplied segment map, and places references only there", () => {
  const pages = PA_AGENDA.split("Page 1");
  const r = readText(pagesOf(pages), { view: PA });
  const first = r.parsed.entities.find((e) => e.key === "PA-101");
  assert.deepEqual(first.source, { kind: "pdf-page", ref: "p.1", page: 0, rect: null });
  // PA-101 is read again on the second page: the occurrence is that page's
  assert.deepEqual(first.occurrences.map((s) => s && s.ref), ["p.1", "p.2"]);
  assert.equal(r.parsed.entities.find((e) => e.key === "PA-103").source.ref, "p.2");
  // every source any entity carries is one the locator gives for some offset
  const flat = flattenText(pagesOf(pages));
  const locate = makeLocator(flat.segments);
  const legal = new Set(flat.segments.map((s) => JSON.stringify(locate(s.start))));
  for (const e of r.parsed.entities) for (const s of e.occurrences || [e.source]) assert.ok(legal.has(JSON.stringify(s)));
});

/* ---------------------------------------------------------------- flattenText */

test("R21 a bare string flattens to itself with no segments and a stated position_why", () => {
  const f = flattenText("  Harbor notes \n two ");
  assert.equal(f.text, "  Harbor notes \n two ");
  assert.equal(f.source, "string");
  assert.deepEqual(f.segments, []);
  assert.match(f.position_why, /bare string/);
  assert.equal(f.undetermined, 0);
});

test("R22 document is preferred, and a segment map is laid over it only when the items join to it byte for byte", () => {
  const ok = flattenText({ document: "a\nb", pages: [{ page: 0, text: "a" }, { page: 1, text: "" }, { page: 2, text: "b" }] });
  assert.equal(ok.text, "a\nb");
  assert.equal(ok.source, "document");
  assert.deepEqual(ok.segments.map((s) => [s.start, s.end, s.source.page]), [[0, 1, 0], [2, 3, 2]]);
  const bad = flattenText({ document: "a b", pages: [{ page: 0, text: "a" }, { page: 1, text: "b" }] });
  assert.equal(bad.text, "a b");
  assert.deepEqual(bad.segments, []);
  assert.match(bad.position_why, /not its pages joined/);
  const paras = flattenText({ document: "x\ny", paragraphs: [{ para: 0, text: "x" }, { para: 1, text: "z" }] });
  assert.deepEqual(paras.segments, []);
  assert.match(paras.position_why, /not its paragraphs joined/);
  const lone = flattenText({ document: "only" });
  assert.match(lone.position_why, /no itemised pages or paragraphs/);
});

test("R23 with no document, pages or paragraphs flatten to their non-empty items, newline-joined, one segment each", () => {
  const p = flattenText({ pages: [{ page: 0, text: "one" }, { page: 1, text: "" }, { page: 2, text: "three" }] });
  assert.equal(p.text, "one\nthree");
  assert.equal(p.source, "pages");
  assert.deepEqual(p.segments.map((s) => s.source), [
    { kind: "pdf-page", ref: "p.1", page: 0, rect: null }, { kind: "pdf-page", ref: "p.3", page: 2, rect: null }]);
  const q = flattenText({ paragraphs: [{ para: 0, text: "x", ref: "¶1" }, { para: 1, text: "" }, { para: 4, text: "y" }] });
  assert.equal(q.text, "x\ny");
  assert.equal(q.source, "paragraphs");
  assert.deepEqual(q.segments.map((s) => s.source), [
    { kind: "doc-para", ref: "¶1", para: 0, run: null }, { kind: "doc-para", ref: "¶5", para: 4, run: null }]);
  const unnamed = flattenText({ pages: [{ text: "a" }] });
  assert.deepEqual(unnamed.segments, []);
  assert.match(unnamed.position_why, /carry no part index/);
});

test("R24 undetermined is the producer's stated count, else summed from its markers, never invented", () => {
  assert.equal(flattenText({ document: "a", counts: { undetermined: 7 }, undetermined: [{ count: 99 }] }).undetermined, 7);
  assert.equal(flattenText({ document: "a", undetermined: [{ count: 3 }, {}, { count: 2, reason: "r" }] }).undetermined, 6);
  assert.equal(flattenText({ document: "aaaa" }).undetermined, 0);
  assert.deepEqual(flattenText({ document: "a", undetermined: [{ reason: "x" }, { reason: "x" }, { reason: "y" }] }).reasons, ["x", "y"]);
  for (const x of [null, 3, [], {}]) flattenText(x);
});

test("R25 locate is total: a non-number, a negative, or an offset in no segment is null; otherwise the segment's source", () => {
  const segs = flattenText({ pages: [{ page: 0, text: "ab" }, { page: 1, text: "cd" }] }).segments;
  const locate = makeLocator(segs);
  for (const x of [undefined, null, "1", NaN, Infinity, -1, 2, 5, 99]) assert.equal(locate(x), null, String(x));
  assert.equal(locate(0).page, 0);
  assert.equal(locate(1).page, 0);
  assert.equal(locate(3).page, 1);
  assert.equal(locate(4).page, 1);
  for (const bad of [null, undefined, "x", {}]) assert.equal(makeLocator(bad)(0), null);
});

/* ------------------------------------------------------------------- fidelity */

test("R26 fidelity is faithful, degraded or insufficient by what is missing and whether it is critical", () => {
  const css = { ok: false, kind: "stylesheet", url: "/a.css" };
  const icon = { ok: false, kind: "image", url: "/i.png" };
  const ad = { ok: false, kind: "script", reason: "THIRD_PARTY" };
  const held = { ok: true, kind: "stylesheet" };
  assert.deepEqual(fidelity({ subresources: [held, ad] }, aspnetWebforms), { level: "faithful", missing: [], critical: [] });
  const d = fidelity({ subresources: [held, icon] }, aspnetWebforms);
  assert.equal(d.level, "degraded");
  assert.deepEqual(d.missing, [icon]);
  assert.deepEqual(d.critical, []);
  const i = fidelity({ subresources: [css, icon] }, aspnetWebforms);
  assert.equal(i.level, "insufficient");
  assert.deepEqual(i.critical, [css]);
  assert.deepEqual(i.missing, [css, icon]);
  assert.equal(fidelity({ subresources: [icon] }, conservative).level, "insufficient", "in ignorance every part is critical");
  // never throws, and a handler that cannot say is answered in the safe direction
  assert.equal(fidelity(null, conservative).level, "faithful");
  assert.equal(fidelity({ subresources: "x" }, null).level, "faithful");
  assert.equal(fidelity({ subresources: [icon, null] }, {}).level, "insufficient");
});

/* -------------------------------------------------------------- profileRecord */

test("R27 profileRecord names the handler, its version, the confidence, signals, kind, time and note", () => {
  const id = identify({ text: calendarHtml([["1", "B", "3/3/2026"]]), locator: "https://r.test/Calendar.aspx" });
  const r = profileRecord(id, { now: NOW });
  assert.deepEqual(r, { handler: "aspnet_webforms", handler_label: aspnetWebforms.label, handler_version: 1,
    confidence: "certain", signals: id.signals, document_kind: "index", considered: id.considered, at: NOW, note: null });
  const none = profileRecord(identify({ text: "plain" }), {});
  assert.equal(none.handler, "conservative");
  assert.match(none.note, /no handler recognised/);
  assert.match(none.at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  assert.equal(profileRecord(identify({ text: "X-KINDLESS-STACK" }), { now: NOW }).document_kind, "unknown");
  assert.equal(profileRecord(null, { now: NOW }).handler, null, "never throws");
});

/* ------------------------------------------------------------ the two ladders */

test("R28 CONFIDENCE is one ladder, ranked CERTAIN, LIKELY, POSSIBLE, NONE", () => {
  const order = [CONFIDENCE.CERTAIN, CONFIDENCE.LIKELY, CONFIDENCE.POSSIBLE, CONFIDENCE.NONE];
  for (let i = 1; i < order.length; i++) assert.ok(confidenceRank(order[i - 1]) > confidenceRank(order[i]));
  assert.equal(Object.keys(CONFIDENCE).length, 4);
});

test("R29 CONTRACT declares substance, membership and unmonitorable, and every type declares one", () => {
  assert.deepEqual({ ...CONTRACT }, { SUBSTANCE: "substance", MEMBERSHIP: "membership", UNMONITORABLE: "unmonitorable" });
  const want = { meeting_calendar: "membership", meeting_agenda: "membership", meeting_minutes: "membership",
                 staff_directory: "membership", staff_report: "substance", regulation: "substance", generic: "substance" };
  for (const t of doctypes()) assert.equal(t.contract, want[t.key], t.key);
});

/* ----------------------------------------------------------------- invariants */

test("R30 every content type reads under a profile that is not Oakland's, and no place's vocabulary is held in code", () => {
  // each type recognised and read under Port Alder's profile
  const read = (key, text, extra) => typeOf(key).parse({ text, view: PA, ...(extra || {}) });
  assert.deepEqual(keys(read("meeting_agenda", PA_AGENDA)), ["PA-101", "PA-102", "PA-103"]);
  assert.equal(read("meeting_minutes", PA_MINUTES).entities[0].facts.outcome, "Approved");
  assert.equal(read("staff_report", PA_REPORT).recommendation, "Adopt Bylaw No. 2041 T.B.S. amending P.A.C. Section 4.12 to set mooring fees.");
  assert.equal(read("regulation", PA_BYLAW).instrument, "bylaw");
  assert.equal(read("staff_directory", PA_DIRECTORY).entities.length, 6);
  assert.equal(read("meeting_calendar", calendarHtml([["5", "Harbor Commission", "3/3/2026"]])).entities[0].facts.body, "Harbor Commission");
  assert.deepEqual(read("generic", "x"), { entities: [], facts: {} });
  // the measured instance's own shapes are NOT recognised when no profile supplies them
  const oaklandShaped = PA_AGENDA.replace(/PA-(\d)(\d\d)/g, "26-0$1$2")
    .replace("Town of Port Alder", "City of Oakland");
  for (const v of [PA, undefined]) {
    const r = typeOf("meeting_agenda").parse({ text: oaklandShaped, view: v });
    assert.deepEqual(keys(r), [], "a file number the view does not describe is not read");
  }
  const cites = "Staff recommends amending O.M.C. Section 8.28 per Ordinance No. 13314 C.M.S. and file 26-0910.";
  assert.deepEqual(keys(typeOf("staff_report").parse({ text: cites, view: PA })), []);
  assert.deepEqual(keys(typeOf("regulation").parse({ text: cites + " DOES ORDAIN", view: undefined })), []);
  // with no view at all, a reader says why it read no references
  assert.match(typeOf("meeting_agenda").parse({ text: PA_AGENDA }).references_why, /no active jurisdiction profile/);
  assert.match(typeOf("meeting_minutes").parse({ text: PA_MINUTES }).body_why, /no active jurisdiction profile/);
});

test("R31 the same bytes and the same ctx give the same answer", async () => {
  const ctx = calCtx();
  const a = enc(calendarHtml([["1", "Harbor Commission", "3/2/2026"]]));
  const b = enc(calendarHtml([["1", "Harbor Commission", "3/2/2026"], ["2", "S", "3/9/2026"]]));
  assert.deepEqual(await assess(a, b, ctx), await assess(a, b, ctx));
  for (const t of [PA_AGENDA, PA_MINUTES, PA_REPORT, PA_BYLAW, PA_DIRECTORY])
    assert.deepEqual(JSON.stringify(readText(t, { view: PA, at: NOW })), JSON.stringify(readText(t, { view: PA, at: NOW })));
  assert.deepEqual(await digests(a, aspnetWebforms, { sha256 }), await digests(a, aspnetWebforms, { sha256 }));
});

test("R32 an unrecognised document is never assumed decorated, and a recogniser without CERTAIN never says unchanged", async () => {
  // unrecognised: any byte difference, even in what looks like navigation, is reported
  const plain = (nav) => `<html><body><nav>${nav}</nav><p>The harbor.</p><a href="/">h</a></body></html>`;
  const r = await assess(enc(plain("Home")), enc(plain("Home | News")), { sha256 });
  assert.equal(r.profile.handler, "conservative");
  assert.equal(r.verdict, "changed");
  // conservative normalises only what is per-response by definition (a nonce)
  const n = (v) => `<html><body><script nonce="${v}"></script><p>x</p><a href="/">h</a></body></html>`;
  assert.equal((await assess(enc(n("aaa")), enc(n("bbb")), { sha256 })).verdict, "unchanged");
  // a LIKELY stack: only viewstate would differ, yet it says undetermined, never unchanged
  const likely = (v) => `<html><body><input name="__EVENTTARGET" value="${v}"><p>x</p><a href="/">h</a></body></html>`;
  const l = await assess(enc(likely("1")), enc(likely("2")), { sha256, headers: { "x-powered-by": "ASP.NET" } });
  assert.equal(l.verdict, "undetermined");
});

test("R33 a read that found nothing is a failed reader, and a mass removal is never reported from it", () => {
  const cases = [
    ["meeting_agenda", PA_AGENDA, "no items here"],
    ["meeting_minutes", PA_MINUTES, "nothing"],
    ["staff_report", PA_REPORT, "nothing"],
    ["regulation", PA_BYLAW, "nothing"],
    ["staff_directory", PA_DIRECTORY, "nothing"],
  ];
  for (const [key, good, empty] of cases) {
    const t = typeOf(key);
    const a = t.parse({ text: good, view: PA });
    const b = t.parse({ text: empty, view: PA });
    for (const [x, y] of [[a, b], [b, a]]) {
      const m = t.assess(x, y, { view: PA });
      assert.equal(m.meaningful, null, key);
      assert.deepEqual(m.events, [], key);
      assert.equal(typeof m.why, "string");
    }
  }
});

test("R34 a position is only what locate returned for the offset read, and absent when the text had no structure", () => {
  for (const key of ["meeting_agenda", "staff_report", "regulation", "staff_directory", "meeting_minutes"]) {
    const text = { meeting_agenda: PA_AGENDA, staff_report: PA_REPORT, regulation: PA_BYLAW,
                   staff_directory: PA_DIRECTORY, meeting_minutes: PA_MINUTES }[key];
    // bare string: no structure, so no entity carries a source
    const bare = typeOf(key).parse({ text, view: PA });
    for (const e of bare.entities) { assert.ok(!("source" in e), key); for (const o of e.occurrences || []) assert.equal(o, null); }
    // a recording locate: every source carried is exactly what it returned for an offset
    const given = new Map();
    const locate = (off) => { const s = { kind: "pdf-page", ref: `p.${off}`, page: off, rect: null }; given.set(s.ref, s); return s; };
    const placed = typeOf(key).parse({ text, view: PA, locate });
    assert.ok(placed.entities.length, key);
    for (const e of placed.entities) {
      assert.equal(given.get(e.source.ref), e.source, `${key}: ${e.key} carries a source locate gave`);
      // and the offset it was asked about is where the reference itself was read
      const f = e.facts;
      const needle = String(f.number || f.section || f.file || f.address || e.key).toLowerCase();
      assert.ok(text.slice(e.source.page, e.source.page + 80).toLowerCase().includes(needle),
        `${key}: ${e.key} is at offset ${e.source.page}`);
    }
  }
});

test("R35 every no says which no and why", async () => {
  assert.match(identify({ text: "plain" }).why, /./);
  assert.match(doctypeFor({ text: "plain" }).why, /./);
  assert.match(readText("").why, /./);
  assert.match(readText({ document: "x", counts: { undetermined: 9 } }).why, /./);
  assert.match(flattenText("x").position_why, /./);
  assert.match(typeOf("regulation").parse({ text: "DOES ORDAIN", view: PA }).number_why, /no caption/);
  assert.match(typeOf("regulation").parse({ text: PA_BYLAW, view: PA }).number_why, /carries no number/);
  assert.match(typeOf("staff_directory").parse({ text: PA_DIRECTORY.replace("Harbor Staff Directory", "Harbor"), view: PA }).title_why, /./);
  const u = await assess(enc("<p>a</p>"), enc("<p>b</p>"), { sha256, headers: { "x-powered-by": "ASP.NET" } });
  assert.equal(u.verdict, "undetermined");
  assert.match(u.why, /not recognised well enough/);
  const html = calendarHtml([["7", "Harbor Commission", "3/2/2026"]]);
  const parsed = typeOf("meeting_calendar").parse({ text: html });
  const c = typeOf("meeting_calendar").connections(parsed, parsed, { now: NOW });
  assert.match(c.find((x) => x.relation === "minutes_not_yet_published").why, /not known/);
});
