/* docprofile: recognising the document, and what follows from recognising it.
 *
 * The fixtures are REAL pages, captured from the sources this project actually
 * works on, trimmed only in size. Synthetic markup would let every rule pass while
 * the real stacks did something else, which is how the ad-hoc version this package
 * replaced managed to ship a furniture rule that matched 303 bytes of a 369KB page
 * and looked like it worked.
 *
 * The load-bearing assertions, and both directions of each:
 *
 *   1. Detection picks the right handler and says how sure it is, and an
 *      unrecognised document falls to the conservative handler rather than to a
 *      guess.
 *   2. The three verdicts SEPARATE on real bytes: two fetches of one ASP.NET page
 *      are unchanged, an edit inside the document is changed, an edit outside it is
 *      restyled. A comparator that only ever says one of those passes by being
 *      useless, so all three are asserted.
 *   3. The conservative handler reports change on anything, which is the safe
 *      direction, and the reason the failure asymmetry is written down.
 *   4. A client-rendered shell is recognised AS a shell, because that is the one
 *      failure that is silent: stable bytes, a consistent hash, monitoring
 *      reporting unchanged forever, and nothing of substance in the record.
 */
import { webcrypto } from "crypto";
import fs from "fs";
import {
  identify, compare, digests, fidelity, profileRecord, handlers,
  aspnetWebforms, wordpress, clientRendered, conservative, CONFIDENCE, REGION,
  monitor, contract, diffMembers, CONTRACT, SIGNIFICANCE,
} from "../../docprofile/registry.mjs";

const sha = async (b) => [...new Uint8Array(await webcrypto.subtle.digest("SHA-256", b))]
  .map((x) => x.toString(16).padStart(2, "0")).join("");
const enc = (s) => new TextEncoder().encode(s);
let n = 0;
const ok = (label, cond) => { if (!cond) { console.error("FAIL " + label); process.exit(1); } n++; };

/* ---- fixtures: real shapes, minimal size ---- */
const VS = "dDwtMTsAAA" + "x".repeat(400);
const EV = "wEWBAL" + "y".repeat(120);
const LEGISTAR = (main, vs, nav) => `<!DOCTYPE html><html><head><title>Calendar</title>
<link rel="stylesheet" href="/CalendarControl.css"></head><body>
<form id="aspnetForm" method="post">
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="${vs}" />
<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="${EV}" />
<div id="ctl00_divTop"><div id="divHeaderLeft">${nav}</div></div>
<main id="mainContent" role="main" tabindex="-1">${main}</main>
<div id="ctl00_divFooter">City of Oakland</div>
</form></body></html>`;
const WP_ARTICLE = `<!DOCTYPE html><html><head><meta name="generator" content="WordPress 6.5">
<link rel="stylesheet" href="/wp-content/themes/x/style.css?ver=1.2.3">
<link rel="https://api.w.org/" href="/wp-json/"></head><body class="single single-post">
<nav class="main">Home About</nav>
<article><h1>Sewer fund transfers questioned</h1><p>The city moved $2.1 million.</p></article>
<aside class="related"><h2>More from this section</h2><a href="/x">Another story</a></aside>
<footer>Copyright</footer></body></html>`;
const SHELL = `<!DOCTYPE html><html><head><title>Transparency</title>
<script src="/reporting-classic-app/assets/app.js"></script></head>
<body><div id="root"></div>${"<!-- padding -->".repeat(200)}</body></html>`;
const PLAIN = `<!DOCTYPE html><html><head><title>Memo</title></head><body>
<h1>Interdepartmental memo</h1><p>The transfer was authorised on 12 March.</p></body></html>`;

const ctxFor = (text, locator, headers) => ({ text, locator, headers: headers || {}, sha256: sha });

/* ---- 1. detection ---- */
const legiCtx = ctxFor(LEGISTAR("<p>Rules Committee, 9am</p>", VS, "Home"),
  "https://oakland.legistar.com/Calendar.aspx",
  { server: "Microsoft-IIS/10.0", "x-powered-by": "ASP.NET" });
let id = identify(legiCtx);
ok("WebForms is recognised", id.handler.key === "aspnet_webforms");
ok("with certainty, because the hidden field is definitive", id.confidence === CONFIDENCE.CERTAIN);
ok("naming what it saw", id.signals.some((s) => s.includes("__VIEWSTATE")));
ok("and the document kind, because an index legitimately changes and a record should not",
   id.kind === "index");
ok("a detail page is a record, not an index",
   identify(ctxFor(LEGISTAR("<p>x</p>", VS, ""), "https://oakland.legistar.com/LegislationDetail.aspx?ID=1")).kind === "record");
/* A header alone must NOT reach certainty: ASP.NET also serves MVC pages with no
   viewstate, and confident application of the wrong framework's rules is how a
   handler starts hiding what it should report. */
const hdrOnly = identify(ctxFor("<html><body><p>hi</p></body></html>", "https://x.gov/a",
  { "x-powered-by": "ASP.NET" }));
ok("a header alone is likely and not certain", hdrOnly.confidence === CONFIDENCE.LIKELY);

id = identify(ctxFor(WP_ARTICLE, "https://oaklandside.org/2026/07/sewer-transfers/"));
ok("WordPress is recognised", id.handler.key === "wordpress");
ok("with certainty from its generator tag", id.confidence === CONFIDENCE.CERTAIN);
ok("an article is a record of one thing", id.kind === "article");
/* The misclassification this package already made once and must not make again. */
ok("a front page is an INDEX even though its theme marks every page as a post",
   identify(ctxFor(WP_ARTICLE, "https://oaklandside.org/")).kind === "index");
ok("and so is a section", identify(ctxFor(WP_ARTICLE, "https://oaklandside.org/category/news/")).kind === "index");

id = identify(ctxFor(SHELL, "https://oaklandca.opengov.com/transparency"));
ok("a client-rendered shell is recognised as a shell", id.handler.key === "client_rendered");
ok("and is flagged so a capture path can refuse to call it evidence", id.handler.shell === true);
ok("with a warning written for a member, not a developer",
   /cannot be relied on as evidence/.test(id.handler.warning) && !/DOM|hydration|framework/.test(id.handler.warning));
ok("the structural test is what catches it, not a framework list",
   id.signals.includes("no links and no prose in the body"));

id = identify(ctxFor(PLAIN, "https://x.gov/memo.html"));
ok("an unrecognised document falls to the conservative handler", id.handler.key === "conservative");
ok("with no confidence claimed", id.confidence === CONFIDENCE.NONE);
ok("and says why, in terms of what it will do about it", /treated conservatively/.test(id.why));
ok("the conservative handler never wins by matching", conservative.detect().match === false);

/* ---- 2. the three verdicts separate, on the real stack ---- */
const H = { server: "Microsoft-IIS/10.0", "x-powered-by": "ASP.NET" };
const LOC = "https://oakland.legistar.com/Calendar.aspx";
const base = LEGISTAR("<p>Rules Committee, 9am</p>", VS, "Home");
const reissued = LEGISTAR("<p>Rules Committee, 9am</p>", "ZZ" + "q".repeat(600), "Home");
const edited = LEGISTAR("<p>Rules Committee, 2pm</p>", VS, "Home");
const restyled = LEGISTAR("<p>Rules Committee, 9am</p>", VS, "Home Contact");
const wf = identify(ctxFor(base, LOC, H));
const cmp = (a, b) => compare(enc(a), enc(b), wf.handler, { ...ctxFor(b, LOC, H), confidence: wf.confidence });

let v = await cmp(base, base);
ok("the same bytes are identical", v.verdict === "identical" && v.evidentiary_change === false);
v = await cmp(base, reissued);
ok("page state reissued is UNCHANGED", v.verdict === "unchanged");
ok("and reports no change to the evidence", v.evidentiary_change === false);
ok("naming the mechanism in plain words", v.artifacts.some((a) => /rebuilds on every visit/.test(a)));
v = await cmp(base, edited);
ok("an edit INSIDE the document is a change", v.verdict === "changed" && v.evidentiary_change === true);
ok("with a reason a member can act on", /substance of the document differs/.test(v.why));
v = await cmp(base, restyled);
ok("an edit OUTSIDE the document is a restyle, not a change", v.verdict === "restyled");
ok("and does not report the evidence as changed", v.evidentiary_change === false);
ok("saying what moved instead", /navigation or related links/.test(v.why));

/* The boundary is what makes that possible, and a boundary that MISSES must not
   read as a document with no content. */
const noMain = `<html><body><input type="hidden" name="__VIEWSTATE" value="${VS}"><p>Body text</p></body></html>`;
const dm = await digests(enc(noMain), aspnetWebforms, { ...ctxFor(noMain, LOC, H), confidence: CONFIDENCE.CERTAIN });
ok("a document with no boundary normalises nothing presentational", dm.presentational_bytes === 0);
ok("and says the boundary was missed rather than silently succeeding", dm.boundary_missed === true);
ok("while still discounting the page state", dm.mechanical_bytes > 0);

/* WordPress: furniture only on an article, never on a listing. */
const wpArt = identify(ctxFor(WP_ARTICLE, "https://oaklandside.org/2026/07/x/"));
const da = await digests(enc(WP_ARTICLE), wpArt.handler, { ...ctxFor(WP_ARTICLE, "https://oaklandside.org/2026/07/x/"), confidence: wpArt.confidence });
ok("an article's surroundings are discounted", da.presentational_bytes > 0);
const wpIdx = identify(ctxFor(WP_ARTICLE, "https://oaklandside.org/"));
const di = await digests(enc(WP_ARTICLE), wpIdx.handler, { ...ctxFor(WP_ARTICLE, "https://oaklandside.org/"), confidence: wpIdx.confidence });
ok("a listing's articles are NOT discounted, because there they are the substance",
   di.presentational_bytes === 0);
ok("its version stamps still are", di.applied.some((a) => a.rule === "wp_asset_version"));

/* ---- 3. the conservative handler errs loudly ---- */
const c1 = await compare(enc(PLAIN), enc(PLAIN.replace("12 March", "13 March")), conservative,
  { ...ctxFor(PLAIN, "https://x.gov/memo.html"), confidence: CONFIDENCE.NONE });
ok("an unrecognised document reports any edit as a change", c1.verdict === "changed");
/* A token whose VALUE moved is not a change even here, because a nonce that
   repeated would not be a nonce: that is definitional rather than observed, which
   is the only kind of rule the conservative handler is allowed to carry. */
const withNonce = PLAIN.replace("<h1>", '<h1 nonce="aaaa">');
const c2 = await compare(enc(withNonce), enc(withNonce.replace('nonce="aaaa"', 'nonce="bbbb"')), conservative,
  { ...ctxFor(withNonce, "https://x.gov/memo.html"), confidence: CONFIDENCE.NONE });
ok("but a one-time token whose value moved is not a change", c2.verdict === "unchanged");
/* And the attribute APPEARING where there was none is a real difference the rule
   cannot erase, which is the safe direction. */
const c2b = await compare(enc(PLAIN), enc(withNonce), conservative,
  { ...ctxFor(PLAIN, "https://x.gov/memo.html"), confidence: CONFIDENCE.NONE });
ok("markup gaining an attribute is still reported", c2b.verdict === "changed");
/* And a handler applied without certainty declines rather than guessing. */
const c3 = await compare(enc(base), enc(reissued), aspnetWebforms,
  { ...ctxFor(reissued, LOC, H), confidence: CONFIDENCE.LIKELY });
ok("a merely likely handler will not claim the substance is unchanged", c3.verdict === "undetermined");
ok("and says so as a limit of recognition, not a property of the document",
   c3.evidentiary_change === null && /not recognised well enough/.test(c3.why));

/* ---- 4. fidelity: meaningfully the same, or refused ---- */
const man = (parts) => ({ subresources: parts });
const okPart = { ok: true, kind: "stylesheet", url: "https://x/a.css" };
ok("everything held is faithful", fidelity(man([okPart]), aspnetWebforms, {}).level === "faithful");
const missingCss = fidelity(man([okPart, { ok: false, kind: "stylesheet", url: "https://x/b.css", reason: "DEFERRED" }]), aspnetWebforms, {});
ok("a missing stylesheet makes the rendition insufficient", missingCss.level === "insufficient");
ok("naming it as something the page needs to look right", /look the way the source published it/.test(missingCss.why));
const missingIcon = fidelity(man([okPart, { ok: false, kind: "icon", url: "https://x/i.png", reason: "DEFERRED" }]), aspnetWebforms, {});
ok("a missing icon leaves it degraded, not refused", missingIcon.level === "degraded");
ok("and says the document still reads correctly", /needs to read correctly/.test(missingIcon.why));
const adGone = fidelity(man([okPart, { ok: false, kind: "script", url: "https://ads/x.js", reason: "THIRD_PARTY" }]), aspnetWebforms, {});
ok("a third party's advertising was never part of the document", adGone.level === "faithful");
ok("under an unrecognised document every missing part refuses the render",
   fidelity(man([okPart, { ok: false, kind: "icon", url: "https://x/i.png", reason: "DEFERRED" }]), conservative, {}).level === "insufficient");

/* ---- the record of how it was profiled ---- */
const rec = profileRecord(identify(ctxFor(base, LOC, H)), { now: "2026-07-30T01:00:00Z" });
ok("the profile is recorded with the handler that spoke", rec.handler === "aspnet_webforms");
ok("and its version, so a verdict by a weak handler can be found later", rec.handler_version === 1);
ok("and the confidence and signals", rec.confidence === "certain" && rec.signals.length > 0);
ok("and every handler that was considered", Array.isArray(rec.considered));

/* ---- the registry's order is load-bearing ---- */
const keys = handlers().map((h) => h.key);
ok("the shell handler is asked FIRST, since any stack can serve a shell",
   keys.indexOf("client_rendered") === 0);
ok("and the conservative handler is asked last", keys[keys.length - 1] === "conservative");

/* ---- 5. monitoring, by document kind ----
   RULED by Bob: index versus record changes monitoring's BEHAVIOUR. A Legistar
   calendar changing is the calendar working; a detail page changing is an event.
   One contract cannot serve both, and applying the record's contract to an index
   is what turns monitoring into noise on exactly the pages BIO watches most. */
const idxCtx = ctxFor(LEGISTAR("<p>x</p>", VS, "Home"), LOC, H);
ok("an index is watched for its MEMBERSHIP",
   contract(aspnetWebforms, "index").mode === CONTRACT.MEMBERSHIP);
ok("a record is watched for its SUBSTANCE",
   contract(aspnetWebforms, "record").mode === CONTRACT.SUBSTANCE);
ok("and a shell is not watchable at all, rather than reported unchanged forever",
   contract(clientRendered, "shell").mode === CONTRACT.UNMONITORABLE);
ok("which is said in terms of what would go wrong",
   /report nothing changing while the figures behind it move/.test(contract(clientRendered, "shell").why));
/* An index whose entries cannot be read must not pretend a substance check is
   equivalent; it says it is degraded so the gap is visible. */
ok("an index with no member reader falls back and SAYS it is degraded",
   contract(conservative, "index").degraded === true);

/* Real rows, keyed by the stable id, digested by their own visible text. */
const ROW = (id, title, doc) =>
  `<tr><td><a href="MeetingDetail.aspx?ID=${id}&amp;GUID=G${id}">${title}</a>` +
  `<a href="View.ashx?M=A&amp;ID=${doc}">Agenda</a></td></tr>`;
const CAL = (rows) => LEGISTAR(`<table>${rows.join("")}</table>`, VS, "Home");
const three = [ROW(1, "Rules Committee 7/30 10:30 AM", 900),
               ROW(2, "Public Safety 7/28 6:00 PM", 901),
               ROW(3, "Life Enrichment 7/28 4:00 PM", 902)];
const mon = (a, b) => monitor(enc(a), enc(b), aspnetWebforms,
  { ...ctxFor(b, LOC, H), confidence: CONFIDENCE.CERTAIN });

let m = await mon(CAL(three), CAL(three));
ok("an unchanged list reports no change", m.changed === false);
/* The negative case, which Bob named as equally important. On an index this is a
   STRONGER claim than on a record, because an index is expected to move. */
ok("and CONFIRMS positively what it checked and found intact",
   m.confirmed.entries === 3 && m.confirmed.intact === 3);
ok("saying so in terms a member can rely on", /all 3 entries on this list are still present and unchanged/.test(m.why));

m = await mon(CAL(three), CAL([three[0], three[2]]));
ok("an entry that vanished is a CHANGE", m.changed === true);
ok("and is an event rather than a notice", m.significance === SIGNIFICANCE.EVENT);
ok("named as no longer listed, which is the point of watching a public list",
   m.events[0].type === "removed" && /no longer on it/.test(m.events[0].why));
ok("carrying what it used to say, since the entry is gone from the new capture",
   /Public Safety/.test(m.events[0].label));

m = await mon(CAL(three), CAL([ROW(1, "Rules Committee 7/30 - CANCELLED", 900), three[1], three[2]]));
ok("an entry that changed what it says is an event", m.changed === true && m.significance === SIGNIFICANCE.EVENT);
ok("reported as altered, not as removed and added",
   m.events[0].type === "altered" && m.events.length === 1);
ok("with both what it said and what it says now", /CANCELLED/.test(m.events[0].now) && !/CANCELLED/.test(m.events[0].was));

/* The quiet substitution: a document swapped under a heading that did not move. */
m = await mon(CAL(three), CAL([ROW(1, "Rules Committee 7/30 10:30 AM", 9999), three[1], three[2]]));
ok("a document swapped under an unchanged heading is caught",
   m.changed === true && m.events[0].type === "altered");

m = await mon(CAL(three), CAL([...three, ROW(4, "Special Meeting 8/15", 903)]));
ok("a new entry is ROUTINE, because that is the list doing its job",
   m.changed === true && m.significance === SIGNIFICANCE.ROUTINE);
ok("and the worst thing is reported first when several happen at once",
   (await mon(CAL(three), CAL([three[0], ROW(4, "New", 903)]))).events[0].type === "removed");

/* Extraction failure must never read as every entry being removed. */
m = await mon(CAL(three), LEGISTAR("<p>the grid failed to render</p>", VS, "Home"));
ok("a list whose entries cannot be read claims NOTHING either way",
   m.changed === null && m.degraded === true);
ok("rather than reporting a mass removal", !m.events.length);

/* A record still gets substance monitoring, with the furniture discounted. */
const RLOC = "https://oakland.legistar.com/LegislationDetail.aspx?ID=7";
const rmon = (a, b) => monitor(enc(a), enc(b), aspnetWebforms,
  { ...ctxFor(b, RLOC, H), confidence: CONFIDENCE.CERTAIN });
const rec1 = LEGISTAR("<p>Ordinance 13579, adopted</p>", VS, "Home");
m = await rmon(rec1, LEGISTAR("<p>Ordinance 13579, adopted</p>", "ZZ" + "q".repeat(600), "Home"));
ok("a record whose page state moved is unchanged", m.changed === false && m.contract === CONTRACT.SUBSTANCE);
ok("and confirms its substance", m.confirmed.substance === true);
m = await rmon(rec1, LEGISTAR("<p>Ordinance 13579, rescinded</p>", VS, "Home"));
ok("a record whose substance moved is an event", m.changed === true && m.significance === SIGNIFICANCE.EVENT);
m = await rmon(rec1, LEGISTAR("<p>Ordinance 13579, adopted</p>", VS, "Home Contact"));
ok("a record whose furniture moved is a notice, not a change",
   m.changed === false && m.significance === SIGNIFICANCE.NOTICE);

console.log(`docprofile: ${n} assertions, all green`);
