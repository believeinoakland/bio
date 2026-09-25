/* D-702 — CHROME FOR LINKS IS CONTAINMENT AND RECURRENCE.
 *
 * BOB #35 ruled (2026-09-25 09:30Z, on SCHEDULER #23's question; LINK-FIDELITY.md §"Chrome: rendering and
 * connection are different problems"): site chrome is what RECURS across the site's pages in a chrome region. A
 * page-local sidebar is page content, and its links are content links, so a varying sidebar is not a lost chrome
 * link. Where recurrence cannot be measured (only one page of the site is held), the link reads chrome
 * UNDETERMINED, never a loss marked same_page:false.
 *
 * Before this landing D-340's `navChanges` judged by containment alone: every link inside <nav>, <header>,
 * <footer>, <aside> or a landmark role that one observation carried and the next did not was LOST, so a section
 * sidebar that differs page to page read as the site's navigation losing links every time two different sections
 * were captured in turn, and a single page's nav edit read as a site-wide loss.
 *
 * What this suite holds, THROUGH THE OP (`op=acquire` files every page and its links as a real capture does;
 * `op=navchanges` is the read):
 *
 *   host www.d702.example, four captures of two pages, alternating:
 *     /parks.html  (v1)  nav [/home, /services], <aside> [/parks/pools, /parks/trails]
 *     /works.html  (v1)  nav [/home, https://…/services (the same address, written absolutely)], <aside> [/works/sewers]
 *     /parks.html  (v2)  as v1, its body edited (a new capture, the same navigation)
 *     /works.html  (v2)  nav [/home] — /services GONE — and its <aside> unchanged
 *     -> the sidebars' links read PAGE CONTENT (each was lacked by the other page while it was carried), none is
 *        lost; /services, carried by both pages, is the one link LOST, between parks v2 and works v2;
 *   host one.d702.example, ONE page captured three times, the first two carrying /b and the third not
 *     -> nothing lost; /b reads chrome UNDETERMINED, with the reason that one page of the host is held. Two
 *        captures carry it so that recurrence counted by CAPTURE rather than by PAGE would read it as site chrome.
 *
 * NEGATIVE CONTROL: (run 2026-09-25, D-702 worker) four arms on bio-plane/src/store.mjs's `#chromeJudge`, each
 * ALONE, restored by cp from a per-arm pristine copy and verified by sha256 (c909ee30...) AND cmp, 3,494,356 bytes (re-run on the final source; a first run on
 * 97bce9f1..., whose new comment carried two mis-encoded bytes hygiene refused, failed the same assertions by the same names);
 * this suite, d340-sitechrome and d701-linkgate run under every arm. BASELINE 17/0, 40/0, 31/0.
 * (a) CONTAINMENT ALONE (every contained link reads site chrome, D-340's judgement) -> this suite 8 pass 9 fail, by
 * name, among them "a varying page-local sidebar reports no lost chrome link", "every change names the sidebar links
 * it dropped as PAGE CONTENT", "a one-page host reports no lost chrome link" and "the link its nav dropped reads
 * chrome UNDETERMINED"; d701 fails "for the outsider B is chrome UNDETERMINED ..."; d340 stays 40/0, as declared (it
 * asserts a loss of a link that DOES recur, which containment alone also names). (b) RECURRENCE BY CAPTURE, not by
 * page -> 8 pass 9 fail: the same names, the one-page host's among them (its dropped link was carried by two captures
 * of one page; a first fixture carried it in ONE capture, and this arm then left the one-page arm green — a finding
 * about the fixture, corrected by adding the second capture); d340 fails "and the two pages it recurred on".
 * (c) OVER-STRICT, three pages to recur -> 13 pass 4 fail: "the one link the site's navigation lost is named: it
 * recurred on both pages" and its two details, and "and none of its links reads undetermined either"; d340 fails 7,
 * "the read names the link the host's nav lost" first; d701 fails "the machine credential sees B lost". (d) NO
 * WITNESS (page content is never concluded) -> 15 pass 2 fail: "and none of its links reads undetermined either" and
 * "every change names the sidebar links it dropped as PAGE CONTENT"; the no-loss assertions stay GREEN, as declared:
 * undetermined is not a loss either.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { normalizeAddress } from "../src/subresources.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const HOST = "www.d702.example";
const ONE = "one.d702.example";
const N = (p, h = HOST) => normalizeAddress(`https://${h}${p}`);

const parks = (v) => `<!doctype html><html><head><title>Parks</title></head><body>
<nav><a href="/home.html">Home</a> <a href="/services.html">Services</a></nav>
<aside><a href="/parks/pools.html">Pools</a> <a href="/parks/trails.html">Trails</a></aside>
<main><h1>Parks</h1><p>edition ${v}</p></main></body></html>`;
const works = (v) => `<!doctype html><html><head><title>Public Works</title></head><body>
<nav><a href="/home.html">Home</a>${v === 1 ? ` <a href="https://${HOST}/services.html">Services</a>` : ""}</nav>
<aside><a href="/works/sewers.html">Sewers</a></aside>
<main><h1>Public Works</h1><p>edition ${v}</p></main></body></html>`;
const only = (v) => `<!doctype html><html><head><title>Only</title></head><body>
<nav><a href="/a.html">A</a>${v < 3 ? ` <a href="/b.html">B</a>` : ""}</nav>
<main><h1>The one page</h1><p>edition ${v}</p></main></body></html>`;

const edition = { parks: 1, works: 1, only: 1 };
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d702", MEMBER_TOKEN: "mem-d702", PROBE_TOKEN: "prb-d702", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    const html = (b) => new Response(b, { headers: { "content-type": "text/html" } });
    if (u.hostname === HOST && u.pathname === "/parks.html") return html(parks(edition.parks));
    if (u.hostname === HOST && u.pathname === "/works.html") return html(works(edition.works));
    if (u.hostname === ONE && u.pathname === "/only.html") return html(only(edition.only));
    return new Response("nope", { status: 404 });
  },
});
const api = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json();
const acquire = async (locator) => {
  /* Retrieval stamps are whole seconds: each capture must be observed LATER than the one before it. */
  await new Promise((r) => setTimeout(r, 1100));
  const r = await api("op=acquire&token=mem-d702", { locator, authority: "City of D702", subresources: true });
  return r.document && r.document.capture && r.document.capture.sha256;
};

console.log("\n--- a host whose section sidebars vary page to page, and whose nav loses one link ---");
const P1 = await acquire(`https://${HOST}/parks.html`);
const W1 = await acquire(`https://${HOST}/works.html`);
edition.parks = 2;
const P2 = await acquire(`https://${HOST}/parks.html`);
edition.works = 2;
const W2 = await acquire(`https://${HOST}/works.html`);
t("four distinct captures", new Set([P1, W1, P2, W2].filter(Boolean)).size, 4);

const nc = await api(`op=navchanges&token=mem-d702&host=${HOST}`);
console.log(`  (observations ${nc.observations}; pages ${nc.pages}; lost ${JSON.stringify((nc.lost || []).map((l) => l.address_norm))}; `
  + `undetermined ${JSON.stringify((nc.undetermined || []).map((l) => l.address_norm))})`);
t("op=navchanges answers", nc.ok, true);
t("four observations, in capture order", (nc.sequence || []).map((o) => o.source_capture), [P1, W1, P2, W2]);
t("of two distinct pages", nc.pages, 2);
const lost = (nc.lost || []).map((l) => l.address_norm);
const SIDEBAR = [N("/parks/pools.html"), N("/parks/trails.html"), N("/works/sewers.html")];
t("a varying page-local sidebar reports no lost chrome link", lost.filter((x) => SIDEBAR.includes(x)), []);
t("and none of its links reads undetermined either: each page was seen lacking the other's while it was carried",
  (nc.undetermined || []).map((l) => l.address_norm), []);
t("every change names the sidebar links it dropped as PAGE CONTENT",
  (nc.changes || []).map((c) => c.page_content),
  [[N("/parks/pools.html"), N("/parks/trails.html")], [N("/works/sewers.html")], [N("/parks/pools.html"), N("/parks/trails.html")]]);
t("the one link the site's navigation lost is named: it recurred on both pages", lost, [N("/services.html")]);
const sv = (nc.lost || [])[0] || {};
t("between the last capture carrying it and the first lacking it",
  [sv.last_carried && sv.last_carried.source_capture, sv.first_missing && sv.first_missing.source_capture], [P2, W2]);
t("naming the pages it recurred on", sv.recurred_on, [N("/parks.html"), N("/works.html")].sort());
t("over-strictness: a nav link every capture carried is not lost", lost.includes(N("/home.html")), false);
t("the note states the rule", /RECURRENCE/.test(nc.note || "") && /never a loss/.test(nc.note || ""), true);

console.log("\n--- a host of which ONE page is held: recurrence cannot be measured ---");
const O1 = await acquire(`https://${ONE}/only.html`);
edition.only = 2;
const O2 = await acquire(`https://${ONE}/only.html`);
edition.only = 3;
const O3 = await acquire(`https://${ONE}/only.html`);
const one = await api(`op=navchanges&token=mem-d702&host=${ONE}`);
console.log(`  (observations ${one.observations}; pages ${one.pages}; lost ${JSON.stringify((one.lost || []).map((l) => l.address_norm))}; `
  + `undetermined ${JSON.stringify((one.undetermined || []).map((l) => l.address_norm))})`);
t("three observations of one page", [one.observations, one.pages, (one.sequence || []).map((o) => o.source_capture)], [3, 1, [O1, O2, O3]]);
t("a one-page host reports no lost chrome link", one.lost, []);
t("the link its nav dropped reads chrome UNDETERMINED",
  (one.undetermined || []).map((l) => [l.address_norm, l.chrome, l.last_carried && l.last_carried.source_capture,
                                       l.first_missing && l.first_missing.source_capture]),
  [[N("/b.html", ONE), "undetermined", O2, O3]]);
t("saying why: one page of the host is held", /one page of this host is held/.test(((one.undetermined || [])[0] || {}).reason || ""), true);
t("and the change carries it as undetermined, not as lost",
  (one.changes || []).map((c) => [c.lost, c.chrome_undetermined]), [[[], [N("/b.html", ONE)]]]);
/* (the first two captures carried ONE navigation, so they compare as no change at all) */

console.log(`\nd702-chromerecurrence: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
