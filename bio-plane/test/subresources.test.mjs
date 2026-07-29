/* Capture fidelity: what a captured page brings with it, and what it refuses.
 *
 * Three load-bearing claims are asserted here, and they are the ones that would
 * do real damage if they quietly stopped being true.
 *
 * 1. The RAW bytes are never rewritten. The render companion is a SEPARATE
 *    artifact with its own hash; the primary capture and every subresource
 *    capture read back byte-identical to what the source served. A version of
 *    this feature that inlined stylesheets into the captured HTML would pass a
 *    naive "does it render" test and destroy the evidence, so the byte-identity
 *    assertions here are the point rather than a formality.
 *
 * 2. Nothing executable survives into the companion, and no reference in it can
 *    reach the network. Scripts are FETCHED AND STORED, because they are part of
 *    what the source served that day, and then never referenced. That asymmetry
 *    is easy to lose to a refactor and is asserted from both directions.
 *
 * 3. The fences hold at the subresource level. A page an adversary controls is
 *    a list of addresses this instance can be asked to fetch, so javascript:,
 *    data:, http:, localhost, and bare IPs are refused with the same fence that
 *    guards the primary locator, and the fanout cap truncates VISIBLY rather
 *    than silently.
 */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash, webcrypto } from "node:crypto";
import {
  parseHtmlRefs, srcsetUrls, classifyRef, renderCompanion, captureSubresources,
  placeholderFor, PLACEHOLDER_MISSING, SUBRESOURCE_CAP, CSS_MAX_DEPTH,
  readLinkWrapper, LINK_TYPES, originOf, fetchPolicy, priorityOf, normalizeAddress, reuseDecision,
} from "../src/subresources.mjs";
import { isPublicHttpsLocator } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const sha = (b) => createHash("sha256").update(Buffer.from(b)).digest("hex");
const enc = (s) => new TextEncoder().encode(s);

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* ------------------------------------------------------------------ *
 * The fixture page, and everything it reaches for
 * ------------------------------------------------------------------ */

const CSS_MAIN = `@import url("deep.css");
body { background: url(img/bg.png) repeat; font-family: X; }
.logo { background-image: url('missing.png'); }
.evil { background: url("javascript:alert(1)"); }
`;
const CSS_DEEP = `.deep { background: url(deeper/one-more.png); }`;
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 13, 10, 26, 10, 1, 2, 3, 4]);
const BIGPNG = new Uint8Array(9 * 1024 * 1024);

const PAGE = `<!doctype html>
<html><head>
<title>Sewer fund transfers</title>
<base href="https://elsewhere.example.com/">
<meta http-equiv="refresh" content="0;url=https://elsewhere.example.com/">
<link rel="stylesheet" href="/css/main.css">
<link rel="icon" href="favicon.ico">
<link rel="stylesheet" href="http://www.oaklandca.gov/css/insecure.css">
<link rel="stylesheet" href="https://localhost/css/internal.css">
<link rel="stylesheet" href="https://198.51.100.7/css/internal.css">
<script src="/js/analytics.js"></script>
<script>window.tracked = true;</script>
<style>.inline { background: url("/img/inline.png"); }</style>
</head>
<body onload="steal()">
<!-- <link rel="stylesheet" href="/css/commented-out.css"> -->
<h1 style="background:url('/img/head.png')">Transfers</h1>
<img src="/img/chart.png" alt="chart" integrity="sha384-nope">
<img srcset="/img/1x.png 1x, /img/2x.png 2x" src="/img/1x.png">
<img src="data:image/gif;base64,R0lGOD">
<img src="/img/gone.png">
<img src="/img/huge.png">
<a href="/next-page.html" onclick="go()">next</a>
<a href="#findings">jump to findings</a>
<a href="/img/chart.png">the chart itself</a>
<a href="javascript:void(0)">dead</a>
<a href="http://www.oaklandca.gov/insecure.html">insecure</a>
<iframe src="https://www.oaklandca.gov/frame.html"></iframe>
<video poster="/img/poster.png" src="/media/clip.mp4"></video>
</body></html>`;

/* Deterministic bodies for the scripted source. */
const BODIES = new Map([
  ["/page.html", [PAGE, "text/html; charset=utf-8"]],
  ["/css/main.css", [CSS_MAIN, "text/css"]],
  ["/css/deep.css", [CSS_DEEP, "text/css"]],
  ["/js/analytics.js", ["window.tracked=1;", "application/javascript"]],
  ["/favicon.ico", [PNG, "image/x-icon"]],
  ["/css/img/bg.png", [PNG, "image/png"]],
  ["/img/inline.png", [PNG, "image/png"]],
  ["/img/head.png", [PNG, "image/png"]],
  ["/img/chart.png", [PNG, "image/png"]],
  ["/img/1x.png", [PNG, "image/png"]],
  ["/img/2x.png", [PNG, "image/png"]],
  ["/img/poster.png", [PNG, "image/png"]],
  ["/media/clip.mp4", [PNG, "video/mp4"]],
  ["/css/deeper/one-more.png", [PNG, "image/png"]],
  ["/img/huge.png", [BIGPNG, "image/png"]],
]);

console.log("\n--- the parser sees what a browser would go and get ---");
{
  const refs = parseHtmlRefs(PAGE);
  const got = (kind) => refs.filter((r) => r.kind === kind).map((r) => r.ref);
  t("stylesheets, in document order", got("stylesheet"),
    ["/css/main.css", "http://www.oaklandca.gov/css/insecure.css", "https://localhost/css/internal.css", "https://198.51.100.7/css/internal.css"]);
  t("the favicon", got("icon"), ["favicon.ico"]);
  t("the script, seen and labelled as a script", got("script"), ["/js/analytics.js"]);
  t("images, with the srcset family collapsed to its largest candidate first", got("image"),
    ["/img/chart.png", "/img/2x.png", "/img/1x.png", "data:image/gif;base64,R0lGOD", "/img/gone.png", "/img/huge.png", "/img/poster.png"]);
  t("the src fallback is a MEMBER of the family, not a reference of its own",
    refs.filter(r => r.collapsed).map(r => [r.ref, r.family, r.family_size]), [["/img/1x.png", "srcset", 2]]);
  t("and the family is a weak signal against evidentiary value",
    refs.find(r => r.family === "srcset").evidentiary_prior, "weak_against");
  t("css assets from the inline style element and the style attribute",
    got("css-asset").sort(), ["/img/head.png", "/img/inline.png"]);
  t("a commented-out reference is not a request the reader ever made",
    refs.some((r) => /commented-out/.test(r.ref)), false);
  t("a hyperlink is not a subresource",
    refs.some((r) => /next-page/.test(r.ref)), false);
}

console.log("\n--- srcset is split on the commas that are really separators ---");
t("plain candidates", srcsetUrls("/a.png 1x, /b.png 2x"), ["/a.png", "/b.png"]);
t("a data: URI's own commas do not invent references",
  srcsetUrls("data:image/gif;base64,AAA,BBB 1x, /b.png 2x"), ["data:image/gif;base64,AAA,BBB", "/b.png"]);
t("a url() with a comma inside survives", srcsetUrls("/a.png?x=(1,2) 1x, /b.png 2x"), ["/a.png?x=(1,2)", "/b.png"]);

console.log("\n--- the fence that guards the primary locator guards every subresource ---");
const BASE = "https://www.oaklandca.gov/page.html";
for (const [ref, reason, why] of [
  ["javascript:alert(1)", "REFUSED_SCHEME", "javascript:"],
  ["data:image/gif;base64,AAA", "REFUSED_SCHEME", "data:"],
  ["blob:https://x/y", "REFUSED_SCHEME", "blob:"],
  ["http://www.oaklandca.gov/a.css", "REFUSED_LOCATOR", "plain http"],
  ["https://localhost/a.css", "REFUSED_LOCATOR", "localhost"],
  ["https://198.51.100.7/a.css", "REFUSED_LOCATOR", "a bare IP"],
  ["https://user:pw@www.oaklandca.gov/a.css", "REFUSED_LOCATOR", "credentials in the address"],
  ["https://intranet/a.css", "REFUSED_LOCATOR", "no public dot"],
]) t(`refused: ${why}`, classifyRef(ref, BASE, isPublicHttpsLocator).reason, reason);
t("a relative reference resolves against the page",
  classifyRef("/css/main.css", BASE, isPublicHttpsLocator).url, "https://www.oaklandca.gov/css/main.css");
t("and a fragment is not part of the address",
  classifyRef("/css/main.css#x", BASE, isPublicHttpsLocator).url, "https://www.oaklandca.gov/css/main.css");

/* ------------------------------------------------------------------ *
 * The whole capture, driven directly
 * ------------------------------------------------------------------ */

const stored = new Map();
const mkFetch = (log = []) => async (u) => {
  log.push(u);
  const p = new URL(u).pathname;
  const b = BODIES.get(p);
  if (!b) return { ok: false, status: 404, reason: "SOURCE_REFUSED" };
  const [body, ct] = b;
  return { ok: true, status: 200, bytes: typeof body === "string" ? enc(body) : body, contentType: ct };
};

const fetched = [];
const out = await captureSubresources({
  html: PAGE, base: BASE, primarySha: sha(enc(PAGE)), primaryFile: "snapshots/page.html",
  fetchOne: mkFetch(fetched),
  put: async (s, b) => { const had = stored.has(s); stored.set(s, b); return { existed: had }; },
  sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
});
const rec = (u) => out.subresources.find((r) => r.url.endsWith(u));

console.log("\n--- every supporting file is its own content-addressed capture ---");
t("the stylesheet was fetched", rec("/css/main.css").ok, true);
t("and stored under the hash of exactly what the source served",
  Buffer.from(stored.get(sha(enc(CSS_MAIN)))).toString("utf8"), CSS_MAIN);
t("the favicon resolved relative to the page", !!rec("/favicon.ico"), true);
t("the srcset's 2x candidate is a capture of its own", rec("/img/2x.png").ok, true);
t("the style attribute's image too", rec("/img/head.png").ok, true);
t("and the inline style element's", rec("/img/inline.png").ok, true);
t("the poster and the media source both", [rec("/img/poster.png").ok, rec("/media/clip.mp4").ok], [true, true]);
t("identical bytes at two addresses are one stored object",
  stored.get(sha(PNG)).length, PNG.length);
t("a collapsed candidate is never fetched at all",
  fetched.filter((u) => u.endsWith("/img/1x.png")).length, 0);
t("and the family's largest is fetched exactly once",
  fetched.filter((u) => u.endsWith("/img/2x.png")).length, 1);

console.log("\n--- css url() is followed exactly one level, and then stops ---");
t("the stylesheet's own background image is captured, resolved against the STYLESHEET and not the page",
  rec("/css/img/bg.png").ok, true);
t("an @import one level down is captured", rec("/css/deep.css").ok, true);
t("and ITS references are not followed: depth is bounded",
  out.subresources.some((r) => /one-more\.png/.test(r.url)), false);
t("the bound is the declared one", CSS_MAX_DEPTH, 2);
t("the stylesheet carries a rewrite list for the viewer",
  out.subresources.find((r) => r.url.endsWith("/css/main.css")).rewrite
    .find((w) => w.ref === "img/bg.png").sha256, sha(PNG));
t("a url() the source could not serve maps to nothing, so the CSS cannot keep a live address",
  out.subresources.find((r) => r.url.endsWith("/css/main.css")).rewrite
    .find((w) => w.ref === "missing.png").sha256, null);
t("and a javascript: url() inside CSS maps to nothing as well",
  out.subresources.find((r) => r.url.endsWith("/css/main.css")).rewrite
    .find((w) => /javascript:/.test(w.ref)).sha256, null);

console.log("\n--- failures are recorded, because a 404 is part of what was served ---");
t("a missing image is recorded with its status", [rec("/img/gone.png").ok, rec("/img/gone.png").status], [false, 404]);
t("an oversized subresource is refused by size and says so", rec("/img/huge.png").reason, "TOO_LARGE");
t("an insecure stylesheet is recorded as refused, not dropped",
  out.subresources.find((r) => /insecure\.css/.test(r.url)).reason, "REFUSED_LOCATOR");
t("a data: image is recorded as a refused scheme",
  out.subresources.find((r) => /^data:/.test(r.url)).scheme, "data:");
t("nothing that was refused was ever fetched",
  fetched.some((u) => /insecure|localhost|198\.51\.100/.test(u)), false);

console.log("\n--- scripts: held as evidence, never referenced ---");
t("the script's bytes ARE captured", rec("/js/analytics.js").ok, true);
t("and are really in the store", Buffer.from(stored.get(sha(enc("window.tracked=1;")))).toString("utf8"), "window.tracked=1;");
t("the manifest counts them separately", out.manifest.counts.scripts_held_unreferenced, 1);
t("and the companion references the script's hash nowhere",
  out.companionText.includes(sha(enc("window.tracked=1;"))), false);

console.log("\n--- the render companion is derived, inert, and says so ---");
{
  const c = out.companionText;
  t("it announces itself as derived", /DERIVED ARTIFACT, not evidence/.test(c), true);
  t("and does so before anything renders, without a comment ahead of the doctype that would trigger quirks mode",
    [c.indexOf("DERIVED ARTIFACT") < c.search(/<body/i), /^<!doctype/i.test(c)], [true, true]);
  t("it names the capture it was derived from", c.includes(sha(enc(PAGE))), true);
  t("no script element survives", /<script/i.test(c), false);
  t("no inline script body survives", c.includes("window.tracked = true"), false);
  t("no iframe survives", /<iframe/i.test(c), false);
  t("no event handler survives", /onload=|onclick=/i.test(c), false);
  t("the page's <base> is gone, so nothing repoints at the live site", /<base\b/i.test(c), false);
  t("meta refresh is gone", /http-equiv\s*=\s*["']?\s*refresh/i.test(c), false);
  t("a content security policy travels WITH the file, not just with the viewer",
    /default-src 'none'/.test(c) && /script-src 'none'/.test(c), true);
  t("the stylesheet is a placeholder", c.includes(`href="${placeholderFor(sha(enc(CSS_MAIN)))}"`), true);
  t("the chart image is a placeholder", c.includes(placeholderFor(sha(PNG))), true);
  t("the collapsed srcset renders as the ONE candidate whose bytes are held, "
    + "with its descriptor dropped so the browser cannot choose a dead one",
    /srcset="about:capture#[0-9a-f]{64}"/.test(c), true);
  t("and no dead placeholder is left inside a srcset",
    /srcset="[^"]*about:capture#unavailable[^"]*[ ,]/.test(c), false);
  t("the style attribute's url() is rewritten", /style="background:url\("about:capture#[0-9a-f]{64}"\)"/.test(c), true);
  t("the inline style element's url() is rewritten too",
    /\.inline \{ background: url\("about:capture#[0-9a-f]{64}"\); \}/.test(c), true);
  t("a reference whose bytes are not in the record is dead, not live",
    c.includes(`src="${PLACEHOLDER_MISSING}"`), true);
  t("integrity attributes are gone, since the record's own hash is the check", /integrity=/.test(c), false);
  t("no hyperlink is left pointing at the live web", c.includes('href="/next-page.html"'), true === false);
  t("a javascript: hyperlink is gone", c.includes("javascript:void(0)"), false);
  /* data-bio-href deliberately holds the real address: it is inert data the
     viewer reads, not something a browser will fetch. The live-attribute check
     must therefore exclude it rather than match its suffix by accident. */
  t("NOTHING the browser would fetch is an absolute http(s) address any more",
    /(?<![-\w])(?:src|href|srcset)\s*=\s*["']https?:/i.test(c), false);
}

console.log("\n--- links are characterised into partitions, not blanked and not left live ---");
{
  const c = out.companionText;
  const L = (t_) => out.links.filter((l) => l.type === t_);
  t("the vocabulary is the declared one", LINK_TYPES, ["anchor", "intra", "deferred", "refused"]);

  t("an in-page anchor stays an in-page anchor: it points inside this document",
    L("anchor").map((l) => l.ref), ["#findings"]);
  t("and renders unchanged", c.includes('href="#findings"'), true);

  t("a link to something THIS capture holds bytes for is intra",
    L("intra").map((l) => l.address), ["https://www.oaklandca.gov/img/chart.png"]);
  t("and resolves to those bytes, the same way an image does",
    c.includes(`href="${placeholderFor(sha(PNG))}"`), true);

  t("a link to an address the record holds nothing for is DEFERRED, not declared offsite",
    L("deferred").map((l) => l.address), ["https://www.oaklandca.gov/next-page.html"]);
  t("what was true at capture is recorded, dated, rather than asserted forever",
    [L("deferred")[0].held_at_capture, /^\d{4}-\d{2}-\d{2}T/.test(L("deferred")[0].as_of)], [false, true]);
  t("the deferred wrapper carries the address so a viewer can go and ask the store",
    readLinkWrapper(`about:link#${encodeURIComponent("https://www.oaklandca.gov/next-page.html")}`),
    { type: "deferred", url: "https://www.oaklandca.gov/next-page.html" });

  t("an executable link is refused", L("refused").some((l) => /javascript:/.test(l.ref)), true);
  t("and so is one that drops out of https", L("refused").some((l) => /insecure/.test(l.ref)), true);
  t("both render as the same dead wrapper", c.includes('href="about:link#refused"'), true);

  t("every link keeps the address the page actually wrote, as data",
    c.includes('data-bio-href="/next-page.html"') || c.includes('data-bio-href="https://www.oaklandca.gov/next-page.html"'), true);
  t("and every link says which partition it is in",
    (c.match(/data-bio-link="/g) || []).length, 5);

  t("the manifest tallies the partitions", out.manifest.counts.links,
    { anchor: 1, intra: 1, deferred: 1, refused: 2 });
  t("the manifest says in words that deferred is not final",
    /unconfirmed is a third answer/.test(out.manifest.link_note), true);

  t("no live href survives anywhere, links included",
    /(?<![-\w])href\s*=\s*["']https?:/i.test(c), false);
  t("but the addresses are all still readable as data",
    (c.match(/data-bio-href="https:/g) || []).length, 2);
}

console.log("\n--- and the raw evidence is untouched by all of it ---");
t("the primary capture is not the companion", out.companionSha === sha(enc(PAGE)), false);
t("the companion is stored under its own hash", stored.has(out.companionSha), true);
t("the companion's stored bytes hash to what it claims", sha(stored.get(out.companionSha)), out.companionSha);
t("the stylesheet capture still contains the source's own url(), unrewritten",
  Buffer.from(stored.get(sha(enc(CSS_MAIN)))).toString("utf8").includes("url(img/bg.png)"), true);

console.log("\n--- the manifest is what the viewer resolves against ---");
{
  const m = out.manifest;
  t("it is marked derived", m.derived, true);
  t("it names the capture it describes", m.of_sha256, sha(enc(PAGE)));
  t("it names the companion and its hash", m.render_sha256, out.companionSha);
  t("it declares the placeholder scheme rather than the viewer guessing", m.placeholder_scheme, "about:capture#<sha256>");
  t("every entry the viewer will fetch carries a sha256 to verify against",
    m.subresources.filter((r) => r.ok).every((r) => /^[0-9a-f]{64}$/.test(r.sha256)), true);
  t("every entry carries the address it came from and when", 
    m.subresources.every((r) => r.url && r.fetched_at), true);
  t("every record lands in exactly one bucket",
    m.counts.fetched + m.counts.failed + m.counts.refused + m.counts.skipped, m.subresources.length);
  t("it round-trips as JSON", typeof JSON.parse(JSON.stringify(m)), "object");
}

console.log("\n--- the document boundary: what is the document, and what surrounds it ---");
{
  const DOC = `<html><body>
<header><img src="/chrome/logo.png"><a href="/home">home</a></header>
<nav><img src="/chrome/menu.png"><a href="/dept">departments</a></nav>
<div role="navigation"><img src="/chrome/aria.png"></div>
<article>
  <img src="/img/evidence-scan.png">
  <img srcset="/img/photo-400.jpg 400w, /img/photo-1600.jpg 1600w" src="/img/photo-400.jpg">
  <footer><img src="/img/article-credit.png"></footer>
</article>
<aside><img src="/chrome/related.png"></aside>
<img src="https://adnetwork.example.com/px.gif">
<script src="https://analytics.example.com/t.js"></script>
<script src="/js/local.js"></script>
<link rel="stylesheet" href="/css/site.css">
<footer><img src="/chrome/foot.png"></footer>
</body></html>`;
  const CSSB = `.n{background:url(/chrome/sprite.png)}`;
  const seen = [];
  const b = await captureSubresources({
    html: DOC, base: "https://www.oaklandca.gov/report.html", primarySha: "2".repeat(64),
    primaryFile: "snapshots/doc.html",
    fetchOne: async (u) => { seen.push(new URL(u).pathname);
      return { ok: true, status: 200, bytes: /\.css$/.test(u) ? enc(CSSB) : PNG,
               contentType: /\.css$/.test(u) ? "text/css" : "image/png" }; },
    put: async () => ({ existed: false }), sha256: async (x) => sha(x), isPublic: isPublicHttpsLocator,
  });
  const R = (p) => b.subresources.find((r) => r.url.endsWith(p));

  t("an image inside <article> is part of the document and is fetched", R("/img/evidence-scan.png").ok, true);
  t("a <footer> INSIDE the article is still the article's",
    [R("/img/article-credit.png").region, R("/img/article-credit.png").ok], ["body", true]);
  t("a logo in the page <header> is outside the document",
    R("/chrome/logo.png").reason, "OUTSIDE_THE_DOCUMENT");
  t("and says which region put it there", R("/chrome/logo.png").region_basis, "<header>");
  t("a declared ARIA landmark counts the same as the element",
    [R("/chrome/aria.png").reason, R("/chrome/aria.png").region_basis],
    ["OUTSIDE_THE_DOCUMENT", "role=navigation"]);
  t("nav, aside, and the page footer likewise",
    ["/chrome/menu.png", "/chrome/related.png", "/chrome/foot.png"].every(p => R(p).reason === "OUTSIDE_THE_DOCUMENT"), true);
  t("none of the furniture was ever fetched",
    seen.some(p => p.startsWith("/chrome/") && p !== "/chrome/sprite.png"), false);

  t("a stylesheet is kept whatever region named it", R("/css/site.css").ok, true);
  t("and an asset the STYLESHEET names is kept even though it is plainly chrome, because "
    + "deciding which rules serve which region needs a layout engine",
    R("/chrome/sprite.png").ok, true);

  t("a third-party tracking pixel is not part of the document",
    R("adnetwork.example.com/px.gif").reason, "THIRD_PARTY");
  t("nor is a third-party analytics script",
    R("analytics.example.com/t.js").reason, "THIRD_PARTY");
  t("but the page's own script is still held as served",
    R("/js/local.js").ok, true);

  t("the responsive family collapsed to its largest candidate",
    [R("/img/photo-1600.jpg").ok, R("/img/photo-400.jpg").reason],
    [true, "COLLAPSED_SRCSET_FAMILY"]);
  t("and the collapse is recorded with the family size, not silently dropped",
    R("/img/photo-400.jpg").family_size, 2);

  t("origin is recorded on every reference",
    [R("/css/site.css").origin, R("adnetwork.example.com/px.gif").origin], ["same_host", "third_party"]);
  t("same_site is marked approximate, since it is a guess without a suffix list",
    originOfCheck(), true);

  t("the manifest tallies what was deliberately not fetched", b.manifest.counts.not_fetched,
    { outside_the_document: 5, third_party: 2, collapsed_srcset: 1 });
  t("and every record still lands in exactly one bucket",
    b.manifest.counts.fetched + b.manifest.counts.failed + b.manifest.counts.refused + b.manifest.counts.skipped,
    b.subresources.length);

  t("links carry origin too, so a citation across sites is visible as one",
    b.links.find(l => l.address && l.address.endsWith("/dept")).origin, "same_host");
}
function originOfCheck(){
  const o = originOf("https://data.oaklandca.gov/x", "www.oaklandca.gov");
  return o.origin === "same_site" && o.approximate === true;
}

console.log("\n--- our own appetite cap truncates visibly, separately from the platform ---");
{
  const many = ["<html><body>"];
  for (let i = 0; i < 430; i++) many.push(`<img src="/img/n${i}.png">`);
  many.push("</body></html>");
  const bulk = await captureSubresources({
    html: many.join("\n"), base: BASE, primarySha: "0".repeat(64), primaryFile: "snapshots/bulk.html",
    fetchOne: async () => ({ ok: true, status: 200, bytes: PNG, contentType: "image/png" }),
    put: async () => ({ existed: false }), sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
  });
  t("it stops at the cap", bulk.attempted, SUBRESOURCE_CAP);
  t("it says it truncated rather than pretending it saw everything", bulk.truncated, true);
  t("it reports how many it actually found", bulk.discovered, 430);
  t("and the references past the cap are recorded, not dropped",
    bulk.subresources.filter((r) => r.reason === "CAP_REACHED").length, 430 - SUBRESOURCE_CAP);
  t("the truncation reaches the manifest", bulk.manifest.truncated, true);
}

console.log("\n--- the ceiling is discovered, never declared ---");
{
  /* The number belongs to the platform. It differs per account, it can change
     on either plan without notice, and a constant in our source would be
     silently wrong everywhere at once. So: our cap is appetite, the runtime's
     limit is an observation, and they are separate values. */
  t("our cap is policy, and is not set anywhere near a platform figure", SUBRESOURCE_CAP, 400);
  t("stylesheets outrank everything", priorityOf({ kind: "stylesheet" }) < priorityOf({ kind: "image" }), true);
  t("a stylesheet's own assets outrank the document's images",
    priorityOf({ kind: "css-asset" }) < priorityOf({ kind: "image" }), true);
  t("scripts come last, since they are held and never rendered",
    priorityOf({ kind: "script" }) > priorityOf({ kind: "image" }), true);
  t("and furniture yields to the document at the same kind",
    priorityOf({ kind: "image", region: "furniture" }) > priorityOf({ kind: "image", region: "body" }), true);

  const order = [];
  const PRI = `<html><body>
<script src="/a.js"></script><img src="/a.png">
<link rel="stylesheet" href="/a.css"><link rel="stylesheet" href="/b.css">
</body></html>`;
  await captureSubresources({
    html: PRI, base: BASE, primarySha: "3".repeat(64), primaryFile: "snapshots/p.html",
    fetchOne: async (u) => { order.push(new URL(u).pathname);
      return { ok: true, status: 200, bytes: /\.css$/.test(u) ? enc(".a{}") : PNG,
               contentType: /\.css$/.test(u) ? "text/css" : "image/png" }; },
    put: async () => ({ existed: false }), sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
  });
  t("the budget is spent stylesheets, then images, then scripts, whatever the document order was",
    order, ["/a.css", "/b.css", "/a.png", "/a.js"]);

  /* Hitting the limit: the run must LEARN the number and then stop, rather than
     re-discovering the same refusal once per remaining reference. */
  let calls = 0;
  const many = ["<html><body>"];
  for (let i = 0; i < 30; i++) many.push(`<img src="/img/n${i}.png">`);
  many.push("</body></html>");
  const hit = await captureSubresources({
    html: many.join(""), base: BASE, primarySha: "5".repeat(64), primaryFile: "snapshots/h.html",
    fetchOne: async () => {
      if (++calls > 8) throw new Error("Too many subrequests by single Worker invocation.");
      return { ok: true, status: 200, bytes: PNG, contentType: "image/png" };
    },
    put: async () => ({ existed: false }), sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
  });
  t("it records where the runtime actually said no", hit.manifest.platform.observed_ceiling, 10);
  t("counting the primary fetch, since that spent a subrequest too",
    hit.manifest.platform.spent_this_invocation >= hit.manifest.platform.observed_ceiling, true);
  t("it stops after ONE refusal instead of rediscovering it per reference",
    hit.manifest.counts.platform_limited, 1);
  t("and the rest are outstanding, not failed: nobody asked the source about them",
    hit.manifest.counts.deferred, 21);
  t("no reference is recorded as the SOURCE failing", hit.manifest.counts.failed, 0);
  t("the capture says it is incomplete", hit.manifest.complete, false);
  t("and how much is outstanding", hit.manifest.outstanding, 21);
  t("the refusal says the source was never asked", /never asked/.test(
    hit.subresources.find(r => r.reason === "PLATFORM_LIMIT").detail), true);

  /* Given the number back, the next run stops on ITS OWN terms, before the
     runtime has to refuse anything at all. */
  let calls2 = 0;
  const known = await captureSubresources({
    html: many.join(""), base: BASE, primarySha: "6".repeat(64), primaryFile: "snapshots/k.html",
    platformCeiling: 10, platformMargin: 2,
    fetchOne: async () => {
      if (++calls2 > 8) throw new Error("Too many subrequests by single Worker invocation.");
      return { ok: true, status: 200, bytes: PNG, contentType: "image/png" };
    },
    put: async () => ({ existed: false }), sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
  });
  t("with the observed ceiling in hand, the runtime is never made to refuse",
    known.manifest.platform.limited, false);
  t("we stop ourselves, a margin short of it", known.manifest.counts.fetched, 7);
  t("and everything else is outstanding rather than lost", known.manifest.counts.deferred, 23);
  t("it still knows it is incomplete", known.manifest.complete, false);

  /* A run that never hits the limit has learned nothing about where it is. */
  const clean = await captureSubresources({
    html: `<html><body><img src="/one.png"></body></html>`, base: BASE,
    primarySha: "7".repeat(64), primaryFile: "snapshots/c.html",
    fetchOne: async () => ({ ok: true, status: 200, bytes: PNG, contentType: "image/png" }),
    put: async () => ({ existed: false }), sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
  });
  t("a run that never saw a refusal reports no ceiling, rather than guessing one",
    clean.manifest.platform.observed_ceiling, null);
  t("and says so plainly: the ceiling is at least what was spent, value unknown",
    /at least/.test(clean.manifest.platform.note), true);
  t("that run is complete", clean.manifest.complete, true);
}

console.log("\n--- a page with nothing to fetch still produces a usable companion ---");
{
  const bare = await captureSubresources({
    html: "<html><body><p>Just words.</p></body></html>", base: BASE,
    primarySha: "1".repeat(64), primaryFile: "snapshots/bare.html",
    fetchOne: async () => { throw new Error("should not fetch"); },
    put: async () => ({ existed: false }), sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
  });
  t("nothing was fetched", bare.attempted, 0);
  t("the companion still exists and still carries the policy",
    /default-src 'none'/.test(bare.companionText), true);
  t("and the text survives", bare.companionText.includes("Just words."), true);
}

/* ------------------------------------------------------------------ *
 * The op, live, through the Worker
 * ------------------------------------------------------------------ */

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-sub", MEMBER_TOKEN: "mem-sub", PROBE_TOKEN: "prb-sub", VERSION: "test" },
  outboundService(request) {
    const u = new URL(request.url);
    if (u.hostname !== "www.oaklandca.gov") return new Response("off-limits", { status: 500 });
    const b = BODIES.get(u.pathname);
    if (!b) return new Response("nope", { status: 404 });
    const [body, ct] = b;
    return new Response(typeof body === "string" ? body : body, { headers: { "content-type": ct } });
  },
});
const acquire = async (body, token = "mem-sub") =>
  (await mf.dispatchFetch("http://x/api/?op=acquire&token=" + token,
    { method: "POST", body: JSON.stringify(body) })).json();

console.log("\n--- op=acquire, opt-in and backwards compatible ---");
const plain = await acquire({ locator: BASE, authority: "City of Oakland" });
t("without the flag the contract is exactly what it was", "subresources" in plain, false);
t("and no renditions are claimed", "renditions" in plain.document, false);

const full = await acquire({ locator: BASE, authority: "City of Oakland", subresources: true });
t("with the flag it succeeds", full.ok, true);
t("the primary capture is unchanged by the feature", full.document.capture.sha256, plain.document.capture.sha256);
t("the grade is still B and still honest", full.document.capture.grade, "B");
t("subresources are reported on the response", Array.isArray(full.subresources), true);
t("the stylesheet came back", full.subresources.some((r) => /main\.css$/.test(r.url) && r.ok), true);
t("the summary names the two derived files",
  [full.snapshot.render_file, full.snapshot.manifest_file],
  ["snapshots/page.html.render.html", "data/snapshot-manifest.json"]);
t("the register document names them as renditions, not as acquisitions",
  full.document.renditions.map((d) => d.kind), ["render_companion", "snapshot_manifest"]);
t("each rendition names what it was made from",
  full.document.renditions.every((d) => d.from_file === "snapshots/page.html"), true);
t("and each says what was done to it and why, in words",
  full.document.renditions.every((d) => d.transform && d.reason), true);

console.log("\n--- and the bytes are all really retrievable through op=capture ---");
{
  const get = async (s) => {
    const r = await mf.dispatchFetch(`http://x/api/?op=capture&token=mem-sub&sha256=${s}`);
    return r.status === 200 ? Buffer.from(await r.arrayBuffer()) : null;
  };
  const cssRec = full.subresources.find((r) => /main\.css$/.test(r.url));
  const css = await get(cssRec.sha256);
  t("the stylesheet reads back", !!css, true);
  t("byte-identical to what the source served", sha(css), sha(enc(CSS_MAIN)));
  t("which is the hash the manifest told the viewer to expect", sha(css), cssRec.sha256);
  const man = await get(full.snapshot.manifest_sha256);
  t("the manifest reads back and parses", typeof JSON.parse(man.toString("utf8")).version, "number");
  const comp = await get(full.snapshot.render_sha256);
  t("the companion reads back", !!comp, true);
  t("and hashes to what the record says", sha(comp), full.snapshot.render_sha256);
  t("the primary is STILL the bytes the source served, not the companion",
    sha(await get(full.document.capture.sha256)), sha(enc(PAGE)));
}

console.log("\n--- the observed ceiling is remembered, and a move is visible as a move ---");
{
  const q = async (path, body) => (await mf.dispatchFetch("http://x" + path,
    body ? { method: "POST", body: JSON.stringify(body) } : {})).json();
  const get = async () => (await q("/api/?op=selftest&token=mem-sub")).store;

  const st = (p, b) => mf.getDurableObjectNamespace ? null : null;
  /* Driven through the plane's own op, so the test exercises the path acquire
     uses rather than a shape invented here. */
  const rec = async (observed) => (await (await mf.dispatchFetch("http://x/api/?op=stats&token=mem-sub")).json());

  const ns = await mf.getDurableObjectNamespace("STORE");
  const id = ns.idFromName("bio");
  const stub = ns.get(id);
  const call = async (path, body) => (await stub.fetch("http://x" + path, body
    ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {})).json();

  let l = (await call("/capturelimit?runtime=subrequests")).result;
  t("with nothing observed there is no ceiling, and a probe is due",
    [l.observed, l.probeDue], [null, true]);

  let r = (await call("/recordcapturelimit", { runtime: "subrequests", observed: null })).result;
  t("a run that was never refused records NO ceiling", r.recorded, false);
  t("and says why", /nothing about where it is/.test(r.note), true);

  r = (await call("/recordcapturelimit", { runtime: "subrequests", observed: 51 })).result;
  t("a refusal is recorded", [r.observed, r.recorded, r.moved], [51, true, false]);
  l = (await call("/capturelimit?runtime=subrequests")).result;
  t("and is used from then on, with no probe due", [l.observed, l.probeDue], [51, false]);

  r = (await call("/recordcapturelimit", { runtime: "subrequests", observed: 51 })).result;
  t("a second identical observation confirms rather than moves", [r.samples, r.moved], [2, false]);

  r = (await call("/recordcapturelimit", { runtime: "subrequests", observed: 1001 })).result;
  t("a DIFFERENT observation is recorded as a move", r.moved, true);
  t("keeping the old value, because a ceiling that moved is a different fact "
    + "from a ceiling that is", r.previous, 51);
  l = (await call("/capturelimit?runtime=subrequests")).result;
  t("and the new value is what gets used", l.observed, 1001);
  t("with the move dated", /^\d{4}-\d{2}-\d{2}T/.test(l.moved_at), true);

  for (let i = 0; i < l.probeEvery; i++) await call("/recordcapturelimit", { runtime: "subrequests", observed: null });
  l = (await call("/capturelimit?runtime=subrequests")).result;
  t("after enough unrefused runs a probe falls due again, so an upgraded plan "
    + "is not capped at the old ceiling forever", l.probeDue, true);
  t("the remembered value is still there to fall back on", l.observed, 1001);
}

console.log("\n--- what a host has served: reuse, honestly recorded ---");
{
  const ns = await mf.getDurableObjectNamespace("STORE");
  const stub = ns.get(ns.idFromName("bio"));
  const call = async (path, body) => (await stub.fetch("http://x" + path, body
    ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : {})).json();

  /* Its own host on purpose: the op=acquire tests above genuinely recorded
     assets for www.oaklandca.gov, and recurrence counts would then depend on
     what ran earlier in this file. */
  const H = "assets.oaklandca.gov";
  const A = "https://assets.oaklandca.gov/css/site.css";
  const N = normalizeAddress(A);
  const OLD = "a".repeat(64), NEW = "b".repeat(64);
  const long_ago = "2026-01-01T00:00:00Z";

  t("two differently written Legistar URLs normalise to one key",
    normalizeAddress("HTTPS://Oakland.Legistar.com:443/View.ashx?GUID=b&M=F&ID=9#x"),
    normalizeAddress("https://oakland.legistar.com/View.ashx?M=F&ID=9&GUID=b"));
  t("but a trailing slash is NOT assumed away, since /a and /a/ can differ",
    normalizeAddress("https://x.gov/a") === normalizeAddress("https://x.gov/a/"), false);

  await call("/recordsiteassets", { host: H, primarySha: "d1".padEnd(64, "0"), at: long_ago,
    observations: [{ address: A, address_norm: N, sha256: OLD, content_type: "text/css", bytes: 10, kind: "stylesheet" }] });
  let k = (await call("/siteassets", { host: H })).result.assets[N];
  t("one document is not yet a shared asset", k.documents, 1);
  t("a fresh record is stable from when it was first seen", k.stable_since, long_ago);

  const one = reuseDecision({ kind: "stylesheet" }, k, { now: Date.now() });
  t("so it is not reused yet", [one.reuse, one.why], [false, "not_yet_shared_across_documents"]);

  await call("/recordsiteassets", { host: H, primarySha: "d2".padEnd(64, "0"), at: long_ago,
    observations: [{ address: A, address_norm: N, sha256: OLD, content_type: "text/css", bytes: 10, kind: "stylesheet" }] });
  k = (await call("/siteassets", { host: H })).result.assets[N];
  t("a second document makes it the SITE's, not one page's", k.documents, 2);
  t("and now it may be reused, because the source was seen serving it recently",
    reuseDecision({ kind: "stylesheet" }, { ...k, last_fetched: new Date().toISOString() }, { now: Date.now() }).reuse, true);
  t("recency of the FETCH is the condition, not how long it has been stable: a "
    + "fresh instance has no stability history and the ceiling hurts most then",
    reuseDecision({ kind: "stylesheet" }, { ...k, last_fetched: new Date().toISOString(), stable_since: new Date().toISOString() },
      { now: Date.now() }).reuse, true);

  t("but an image inside the document never is, because that is evidence",
    reuseDecision({ kind: "image" }, k, { now: Date.now() }).why, "evidence_is_always_fetched");
  t("nor a script, which is held as evidence of what was SERVED that day",
    reuseDecision({ kind: "script" }, k, { now: Date.now() }).why, "evidence_is_always_fetched");
  t("and not one the source has not been seen serving recently, however stable it was",
    reuseDecision({ kind: "stylesheet" }, { ...k, last_fetched: "2026-01-01T00:00:00Z" }, { now: Date.now() }).why,
    "last_seen_served_too_long_ago");

  /* Reuse in a real capture, and the honesty fields that must travel with it. */
  const PAGE2 = `<html><head><link rel="stylesheet" href="/css/site.css"></head><body><p>x</p></body></html>`;
  let fetches = 0;
  const cap2 = await captureSubresources({
    html: PAGE2, base: "https://assets.oaklandca.gov/report.html", primarySha: "e".repeat(64),
    primaryFile: "snapshots/r.html",
    siteLookup: async (n) => (n === N ? { ...k, last_fetched: new Date().toISOString() } : null),
    readBack: async () => ".x{}",
    fetchOne: async () => { fetches++; return { ok: true, status: 200, bytes: enc(".x{}"), contentType: "text/css" }; },
    put: async () => ({ existed: false }), sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
  });
  const rr = cap2.subresources.find((r) => r.url.endsWith("/css/site.css"));
  t("the stylesheet was NOT fetched", fetches, 0);
  t("but it is present, with the bytes the record holds", [rr.ok, rr.sha256], [true, OLD]);
  t("and it says plainly that this capture did not fetch it", rr.fetched_this_capture, false);
  t("naming when the source WAS last seen serving those bytes",
    /^\d{4}-\d{2}-\d{2}T/.test(rr.reused_from_fetched_at), true);
  t("the manifest counts the reuse", cap2.manifest.reuse.reused, 1);
  t("and says a ratified capture must re-fetch them",
    /ratified as evidence must re-fetch/.test(cap2.manifest.reuse.note), true);

  /* The change case: an asset comes back different, and everything that reused
     the old bytes is named rather than left to be discovered. */
  const chg = (await call("/recordsiteassets", { host: H, primarySha: "d3".padEnd(64, "0"),
    observations: [{ address: A, address_norm: N, sha256: NEW, content_type: "text/css", bytes: 11, kind: "stylesheet" }] })).result;
  t("a different sha is recorded as a change, not a new asset", chg.changed, 1);
  t("keeping what it was", chg.changes[0].was, OLD);
  k = (await call("/siteassets", { host: H })).result.assets[N];
  t("stability restarts from the change, not from the last look", k.stable_since !== long_ago, true);
  t("and the change is counted, so a churning asset is visible as one", k.changes, 1);

  /* Chrome by recurrence, which is what works on sites with no <nav>. */
  const own = "https://assets.oaklandca.gov/img/one-off.png";
  await call("/recordsiteassets", { host: H, primarySha: "d3".padEnd(64, "0"),
    observations: [{ address: own, address_norm: normalizeAddress(own), sha256: "c".repeat(64), kind: "image" }] });
  const cr = (await call("/sitechrome?host=" + H)).result;
  t("three documents is enough for recurrence to say something", cr.documents, 3);
  const styleRow = cr.assets.find((a) => a.address_norm === N);
  const oneOff = cr.assets.find((a) => a.address_norm === normalizeAddress(own));
  t("an address in every document is the site's", styleRow.chrome, true);
  t("an address in one is that document's own", oneOff.chrome, false);
  t("and the share is reported, not just the verdict, because the threshold is a tuning decision",
    [styleRow.share, oneOff.share], [1, 1 / 3]);

  const thin = (await call("/sitechrome?host=nothing.example.com")).result;
  t("with too few documents it says so rather than guessing",
    /says nothing yet/.test(thin.note), true);
}

console.log("\n--- it still writes no live state ---");
t("intake writes nothing, subresources or not",
  (await (await mf.dispatchFetch("http://x/api/?op=stats&token=mem-sub")).json()).result.bundles, 0);

console.log("\n--- asking for subresources on something that has none is said, not swallowed ---");
{
  const pdfish = await acquire({ locator: "https://www.oaklandca.gov/img/chart.png", authority: "City", subresources: true });
  t("the capture still succeeds", pdfish.ok, true);
  t("and the skip is reported with a reason", pdfish.subresources_skipped.reason, "NOT_HTML");
}

console.log("\n--- the catalog accepts a bundle carrying the derived artifacts ---");
{
  const { checkBundle } = await import("../checks/bio-checks.mjs");
  const ID = "INFO-2026-0801-fidelity";
  const files = new Map();
  files.set("bundle.md", [
    "---", `id: ${ID}`, "object_type: information", "schema: information@2",
    'title: "A captured page"', "current_state: collected", "prior_state: null",
    "created: 2026-07-28T00:00:00Z", "last_updated: 2026-07-28T00:00:00Z",
    "produced_by:", "  mode: assisted", "  capability_tier: session",
    "group: believe-in-oakland", "references: []", "state_history: []",
    "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
    "  source: null", "visuals: []", "criticality: supporting",
    "source_status: unchanged", "source:",
    `  locator: ${BASE}`, "  authority: City of Oakland",
    "  retrieved: 2026-07-28T00:00:00Z",
    "monitoring:", "  enabled: false", "  frequency: none", "---", "",
    "## Summary", "", "A page captured with its supporting files.", "",
    "## Provenance Notes", "", "## Session Log", "", "## Review Notes", "",
  ].join("\n"));
  files.set("data/provenance.json", JSON.stringify({ documents: [full.document] }, null, 1));
  files.set("snapshots/page.html", PAGE);
  files.set("snapshots/page.html.render.html", out.companionText);
  files.set("data/snapshot-manifest.json", JSON.stringify(out.manifest, null, 1));
  const { findings } = await checkBundle({ folderName: ID, files,
    sha256: async (v) => createHash("sha256").update(typeof v === "string" ? Buffer.from(v, "utf8") : Buffer.from(v)).digest("hex"),
    sha512: async (b) => new Uint8Array(await webcrypto.subtle.digest("SHA-512", b)),
    resolveTarget: () => true });
  const errs = findings.filter((x) => x.severity === "error");
  for (const x of errs) console.log(`         ${x.check}: ${x.message.slice(0, 140)}`);
  t("no errors: the derived artifacts sit inside the record's rules", errs.length, 0);
}

console.log("\n--- the mechanical envelope admits the manifest, and nothing else new ---");
{
  const src = readFileSync(fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url)), "utf8");
  const m = /const MECHANICAL_APPEND_FILES = \[([^\]]*)\]/.exec(src);
  t("the envelope is exactly these three files", m[1].replace(/['\s]/g, "").split(","),
    ["data/changes.json", "data/provenance.json", "data/snapshot-manifest.json"]);
}

console.log(`\nsubresources: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
