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
  readLinkWrapper, LINK_TYPES,
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
  t("images including both srcset candidates", got("image"),
    ["/img/chart.png", "/img/1x.png", "/img/1x.png", "/img/2x.png", "data:image/gif;base64,R0lGOD", "/img/gone.png", "/img/huge.png", "/img/poster.png"]);
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
t("a repeated reference is fetched once",
  fetched.filter((u) => u.endsWith("/img/1x.png")).length, 1);

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
  t("both srcset candidates are rewritten in place",
    /srcset="about:capture#[0-9a-f]{64} 1x, about:capture#[0-9a-f]{64} 2x"/.test(c), true);
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
  t("the counts add up to the records",
    m.counts.fetched + m.counts.failed + m.counts.refused, m.subresources.length);
  t("it round-trips as JSON", typeof JSON.parse(JSON.stringify(m)), "object");
}

console.log("\n--- the fanout cap truncates visibly ---");
{
  const many = ["<html><body>"];
  for (let i = 0; i < 60; i++) many.push(`<img src="/img/n${i}.png">`);
  many.push("</body></html>");
  const bulk = await captureSubresources({
    html: many.join("\n"), base: BASE, primarySha: "0".repeat(64), primaryFile: "snapshots/bulk.html",
    fetchOne: async () => ({ ok: true, status: 200, bytes: PNG, contentType: "image/png" }),
    put: async () => ({ existed: false }), sha256: async (b) => sha(b), isPublic: isPublicHttpsLocator,
  });
  t("it stops at the cap", bulk.attempted, SUBRESOURCE_CAP);
  t("it says it truncated rather than pretending it saw everything", bulk.truncated, true);
  t("it reports how many it actually found", bulk.discovered, 60);
  t("and the references past the cap are recorded, not dropped",
    bulk.subresources.filter((r) => r.reason === "CAP_REACHED").length, 60 - SUBRESOURCE_CAP);
  t("the truncation reaches the manifest", bulk.manifest.truncated, true);
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
