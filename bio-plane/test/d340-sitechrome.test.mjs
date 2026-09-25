/* D-340 — CHROME IS A PROPERTY OF THE SITE, AND THE PLANE NOW RECORDS IT.
 *
 * LINK-FIDELITY.md §"Chrome: rendering and connection are different problems" ratifies
 * `site_chrome(host, observed_at, fingerprint, links[])` as a DERIVED table, regenerable by scan,
 * and justifies it with one read: "a department vanishing from the nav between two captures is a fact
 * somebody may care about, and today it would be invisible". Before D-340 the plane had a per-link
 * `chrome` column nothing ever set, no per-host record and no such read.
 *
 * What this suite holds, THROUGH THE OPS (`op=acquire` files each page and its links exactly as a real
 * capture does; `op=navchanges` is the per-host read):
 *
 *   1. two captures of DIFFERENT pages of one host, the second's <nav> missing a link the first's carried
 *      -> the read names THAT link as lost, between those two captures, and says the pages differ;
 *   2. the classification is recorded with its BASIS on the link (`<nav>`, `role=navigation`), never as
 *      a deletion: op=links still lists every link;
 *   3. over-strictness: a BODY link that disappears is content, not chrome, and is NOT named; a nav link
 *      written relatively in one capture and absolutely in the next is ONE address and is NOT named;
 *      a <footer> inside <article> is the article's, not the site's, and its link is not chrome;
 *   4. the derived tables are REGENERABLE: `derivesitechrome` rescans and the read answers identically;
 *   5. and they are DERIVED: a whole-store purge clears both.
 *
 * NEGATIVE CONTROL: (run 2026-09-25, D-340 worker) two arms on bio-plane/src/store.mjs, each ALONE, restored by
 * cp from a pristine copy and verified by sha256 (2b8f7848...) AND cmp, 3,483,091 bytes; BASELINE 38 pass 0 fail (re-run on the final source
 * after the rescan was bounded; the first run, on 0ff51a21..., read 33/0, 27/6 and 23/10 with the same names).
 * (a) derive per PAGE at the READ: `navChanges` compares adjacent observations only when they are of the same page
 * -> 32 pass 6 fail, by name: "the read names the link the host's nav lost", "naming the capture that last carried
 * it", "and the capture it was first missing from", "and saying the two were DIFFERENT pages of the host", "not
 * seen again since", "exactly one link lost". (b) derive per PAGE at the DERIVATION: `#chromeDeriveCapture` keys
 * each reference by its page instead of its host -> 28 pass 10 fail: (a)'s six plus "two observations of the
 * host's navigation", "in capture order", "two distinct navigations, one chrome record each" and "the observation
 * states its basis". In both arms every over-strictness assertion (body link, relative/absolute spelling, the
 * article's own footer, the skip-link) stayed GREEN, as declared: they assert absence, which a per-page read also
 * satisfies, and that is why the lost-link assertions are the ones that carry the control.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { normalizeAddress, furnitureLinks } from "../src/subresources.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const HOST = "www.oaklandca.gov";
const A_URL = `https://${HOST}/departments.html`;
const B_URL = `https://${HOST}/news.html`;
const N = (p) => normalizeAddress(`https://${HOST}${p}`);

/* The first capture: the nav carries Public Works, Parks and About; a landmark div carries Contact; the
   body links a story; a <footer> INSIDE the <article> links the author (the article's, not the site's). */
const PAGE_A = `<!doctype html><html><head><title>Departments</title></head><body>
<nav><a href="/dept/public-works.html">Public Works</a> <a href="/dept/parks.html">Parks</a>
<a href="/about.html">About</a> <a href="#main">Skip</a></nav>
<div role="navigation"><a href="/contact.html">Contact</a></div>
<article id="main"><h1>Departments</h1><a href="/story/old.html">An old story</a>
<footer><a href="/people/author.html">The author</a></footer></article>
</body></html>`;
/* The second capture, of ANOTHER page of the same host: Public Works is gone from the nav; About is the
   same address written absolutely; the body's story link is gone (content, not chrome). */
const PAGE_B = `<!doctype html><html><head><title>News</title></head><body>
<nav><a href="/dept/parks.html">Parks</a> <a href="https://${HOST}/about.html">About</a> <a href="#main">Skip</a></nav>
<div role="navigation"><a href="/contact.html">Contact</a></div>
<main id="main"><h1>News</h1><a href="/story/new.html">A new story</a></main>
</body></html>`;

console.log("\n--- the classifier, directly: which hrefs sit in furniture, and on what basis ---");
const fa = furnitureLinks(PAGE_A);
t("the <nav> links are furniture, basis <nav>", fa.get("/dept/public-works.html"), "<nav>");
t("a navigation landmark is furniture, basis role=navigation", fa.get("/contact.html"), "role=navigation");
t("a body link is not furniture", fa.has("/story/old.html"), false);
t("a <footer> inside <article> is the article's, not the site's", fa.has("/people/author.html"), false);
t("a commented-out <nav> opens no region",
  furnitureLinks("<!-- <nav> --><p><a href='/x'>x</a></p>").has("/x"), false);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d340", MEMBER_TOKEN: "mem-d340", PROBE_TOKEN: "prb-d340", VERSION: "test",
              GOVERNOR_APPETITE_PER_MIN: "600000", GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.hostname !== HOST) return new Response("off-limits", { status: 500 });
    if (u.pathname === "/departments.html") return new Response(PAGE_A, { headers: { "content-type": "text/html" } });
    if (u.pathname === "/news.html") return new Response(PAGE_B, { headers: { "content-type": "text/html" } });
    return new Response("nope", { status: 404 });
  },
});
const api = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  body ? { method: "POST", body: JSON.stringify(body) } : {})).json();
const acquire = (locator) => api("op=acquire&token=mem-d340", { locator, authority: "City of Oakland", subresources: true });

console.log("\n--- nothing captured yet: the read answers, and says there is nothing to compare ---");
const none = await api(`op=navchanges&token=mem-d340&host=${HOST}`);
t("op=navchanges answers for a host with no captures", none.ok, true);
t("with no observations", none.observations, 0);
t("and says there is nothing to compare yet", /fewer than two captures/.test(none.note || ""), true);
const noHost = await api("op=navchanges&token=mem-d340");
t("a call naming no host is refused by name", noHost.reason, "REQUIRED_ARGUMENT_MISSING");

console.log("\n--- two captures of one host, one second apart ---");
const a = await acquire(A_URL);
t("the first page is acquired", a.ok, true);
const SHA_A = a.document && a.document.capture && a.document.capture.sha256;
/* Retrieval stamps are whole seconds; the second capture must be observed LATER, not at the same instant. */
await new Promise((r) => setTimeout(r, 1100));
const b = await acquire(B_URL);
t("the second page is acquired", b.ok, true);
const SHA_B = b.document && b.document.capture && b.document.capture.sha256;
t("two different captures", !!SHA_A && !!SHA_B && SHA_A !== SHA_B, true);

console.log("\n--- the classification is recorded on the link with its basis, and nothing is dropped ---");
const ns = await mf.getDurableObjectNamespace("STORE");
const st = ns.get(ns.idFromName("bio"));
const store = async (path) => ((await (await st.fetch("http://x" + path)).json()) || {}).result || {};
const la = await api(`op=links&token=mem-d340&capture=${SHA_A}`);
t("op=links still lists the body link, the footer link and every nav link (6 addresses + the anchor)",
  [...new Set((la.links || []).map((l) => l.address_norm))].length >= 7, true);

console.log("\n--- THE READ: the host's navigation lost Public Works between the two captures ---");
const nc = await api(`op=navchanges&token=mem-d340&host=${HOST}`);
console.log(`  (observations ${nc.observations}; records ${JSON.stringify((nc.records || []).map((r) => r.links.length))}; lost ${JSON.stringify((nc.lost || []).map((l) => l.address_norm))})`);
t("op=navchanges answers", nc.ok, true);
t("two observations of the host's navigation", nc.observations, 2);
t("in capture order", (nc.sequence || []).map((o) => o.source_capture), [SHA_A, SHA_B]);
t("two distinct navigations, one chrome record each", (nc.records || []).length, 2);
const lost = (nc.lost || []).map((l) => l.address_norm);
t("the read names the link the host's nav lost", lost.includes(N("/dept/public-works.html")), true);
const pw = (nc.lost || []).find((l) => l.address_norm === N("/dept/public-works.html")) || {};
t("naming the capture that last carried it", pw.last_carried && pw.last_carried.source_capture, SHA_A);
t("and the capture it was first missing from", pw.first_missing && pw.first_missing.source_capture, SHA_B);
t("and saying the two were DIFFERENT pages of the host", pw.same_page, false);
t("not seen again since", pw.seen_again_at, null);
t("the observation states its basis", /containment: .*<nav>/.test(((nc.sequence || [])[0] || {}).basis || ""), true);

console.log("\n--- over-strictness: what must NOT be named ---");
t("a BODY link that disappeared is content, not chrome, and is not named", lost.includes(N("/story/old.html")), false);
t("a nav link written relatively then absolutely is one address, not lost", lost.includes(N("/about.html")), false);
t("a nav link carried by both captures is not lost", lost.includes(N("/dept/parks.html")), false);
t("a landmark link carried by both captures is not lost", lost.includes(N("/contact.html")), false);
t("the article's own footer link is not chrome, so not lost", lost.includes(N("/people/author.html")), false);
t("a nav skip-link into the page itself is not navigation churn",
  lost.some((x) => /#/.test(x) || x === normalizeAddress(A_URL)), false);
t("exactly one link lost", lost.length, 1);

console.log("\n--- REGENERABLE: a rescan answers the same ---");
const re = await store(`/derivesitechrome?host=${HOST}`);
t("the rescan read both captures of the host", re.captures, 2);
const nc2 = await api(`op=navchanges&token=mem-d340&host=${HOST}`);
t("and the read after it is identical", JSON.stringify({ ...nc2, at: null }), JSON.stringify({ ...nc, at: null }));
const p1 = await store(`/derivesitechrome?host=${HOST}&limit=1`);
t("a PAGED rescan says more remain, and names where to resume", [p1.captures, p1.truncated, typeof p1.next], [1, true, "string"]);
t("and says the host's chrome is partial until then", /PARTIAL/.test(p1.partial || ""), true);
const p2 = await store(`/derivesitechrome?host=${HOST}&limit=1&after=${p1.next}`);
t("the next page finishes it", [p2.captures, p2.truncated, p2.next], [1, false, null]);
t("the two pages derived both captures, once each", [...p1.derived, ...p2.derived].sort(), [SHA_A, SHA_B].sort());
const nc3 = await api(`op=navchanges&token=mem-d340&host=${HOST}`);
t("and the read after the paged rescan is identical too", JSON.stringify(nc3), JSON.stringify(nc));

console.log("\n--- DERIVED: a whole-store purge clears it ---");
const pg = await api("op=purge&token=adm-d340&confirm=bio");
const after = await api(`op=navchanges&token=mem-d340&host=${HOST}`);
t("after a whole-store purge the host has no observations", [pg.ok, after.observations, (after.records || []).length],
  [true, 0, 0]);

console.log(`\nd340-sitechrome: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
