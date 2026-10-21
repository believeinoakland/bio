/* reading-pipeline R32 (T51 fix round 3, C19; K4194, K4303, K4356: "More furniture") and R34 (the walker's page title, C25):
   the text units of a captured web page, at `read`'s interface, over stored captures. Each test names the requirement
   ids it checks in its title. The three saved pages in `fixtures/` are the walker's: nps.gov's Yosemite page, the
   Department of Justice's and Alameda County's home pages, saved as served. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fresh, hold, doc } from "./fixture.mjs";

const readAs = async (body, locator = "https://a.example/x") => {
  const w = fresh(), d = await hold(w.evidence, body);
  return w.read(doc({ digest: d, bytes: Buffer.byteLength(body), ct: "text/html", format: "html", fromText: true, locator }));
};
const words = async (markup) => ((await readAs(markup)).text_units || []).map((u) => u.text);
const saved = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");
const around = (inner) => `<!DOCTYPE html><html><head><title>Site</title></head><body><main><h1>Notice 2026-118</h1>
<p>The council adopted the shelter repair standard on 3 March 2025.</p>${inner}<p>Repairs follow within 30 days.</p></main></body></html>`;
const NOTICE = ["Notice 2026-118", "The council adopted the shelter repair standard on 3 March 2025.", "Repairs follow within 30 days."];

test("R32 (T51 fix round 3, C19; K4356): a dialog goes with its contents wherever it sits, inside the main element too: role dialog or alertdialog, aria-modal true, the dialog element", async () => {
  for (const furniture of [
    '<div role="dialog" aria-label="Leaving"><p>Exiting example.gov</p><button>Cancel</button></div>',
    '<div role="alertdialog"><p>Session warning words.</p></div>',
    '<section aria-modal="true"><p>Sign up for alerts words.</p></section>',
    "<dialog open><p>Dialog element words.</p></dialog>",
    '<div role="dialog"><div role="dialog"><p>Nested.</p></div><p>After the nested one.</p></div>',
  ]) assert.deepEqual(await words(around(furniture)), NOTICE, furniture);
  assert.deepEqual(await words(around('<div aria-modal="false"><p>Not modal words.</p></div>')),
    [...NOTICE.slice(0, 2), "Not modal words.", NOTICE[2]], "aria-modal that is not true is no dialog");
});

test("R32 (T51 fix round 3, C19; K4356): a government-site banner or a cookie or consent notice, named by its role, class or id, goes with its contents wherever it sits", async () => {
  for (const furniture of [
    '<section class="usa-banner" aria-label="Official website of the United States government"><p>Official websites use .gov</p><p>Secure .gov websites use HTTPS</p></section>',
    '<div class="gov-banner"><p>An official website of the state.</p></div>',
    '<div id="cookie-banner"><p>We use cookies words.</p><p>More about cookies.</p></div>',
    '<div class="site cookie-consent"><p>Consent words.</p></div>',
    '<div id="gdpr-notice"><p>Privacy choice words.</p></div>',
    '<div class="modal fade" id="m"><div class="modal-dialog"><p>Modal words.</p></div></div>',
  ]) assert.deepEqual(await words(around(furniture)), NOTICE, furniture);
});

test("R32 (T51 fix round 3, C19; K4356): a share bar, named by its role, class or id, goes with its contents wherever it sits", async () => {
  for (const furniture of [
    '<div class="share-bar"><span>Share</span><a href="https://fb.example/s">Facebook</a><a href="https://x.example/s">X</a></div>',
    '<div id="social-share"><p>Share this page words.</p></div>',
    '<ul class="social-links"><li>Social words.</li></ul>',
    '<div class="addthis_toolbox"><p>Toolbox words.</p></div>',
    '<div role="group" class="page-sharing"><p>Sharing words.</p></div>',
  ]) assert.deepEqual(await words(around(furniture)), NOTICE, furniture);
});

test("R32 (T51 fix round 3, C19; K4356): a block whose only visible content is controls, or only links, goes with its contents; a block with words of its own beside a link is kept", async () => {
  for (const furniture of [
    '<div><button type="button">Cancel</button><button>Close</button></div>',
    '<form><label>Search</label><input type="text" name="q"><button>Go</button></form>',
    '<p><select><option>One</option><option>Two</option></select></p>',
    '<ul><li><a href="/a">Quick Links</a></li><li><a href="/b">Contact Us</a></li></ul>',
    '<div><a href="/a">Facebook</a> <a href="/b">Twitter</a></div>',
    '<div><div><a href="/a">Deep link</a></div></div>',
  ]) assert.deepEqual(await words(around(furniture)), NOTICE, furniture);
  assert.deepEqual(await words(around('<p>Read the <a href="/r">full report</a> before 1 May.</p><ul><li>Item with words <a href="/i">and a link</a></li></ul>')),
    [...NOTICE.slice(0, 2), "Read the full report before 1 May.", "Item with words and a link", NOTICE[2]], "words of its own keep a block");
  assert.deepEqual(await words(around('<h2><a href="/s">Heading that is a link</a></h2><table><tr><td><a href="/c">Cell link</a></td></tr></table>')),
    [...NOTICE.slice(0, 2), "Heading that is a link", "Cell link", NOTICE[2]], "a heading and a table cell are not blocks of links");
});

test("R32 (T51 fix round 3, C19; K4356): a notice that only tells the reader to skip ahead or that they are leaving the site goes; an article that merely speaks of leaving is kept", async () => {
  for (const furniture of [
    "<p>Skip to main content</p>", "<div>Skip navigation</div>", "<span>Skip ahead to the results</span>",
    "<h2>Exiting nps.gov</h2>", "<p>You are leaving this site.</p>", "<p>You are now leaving the County website.</p>",
    "<div>You are about to leave the Department of Justice website.</div>",
  ]) assert.deepEqual(await words(around(furniture)), NOTICE, furniture);
  const kept = "Exiting the lease early requires thirty days notice, and a tenant leaving the unit must return the keys to the landlord in person.";
  assert.deepEqual(await words(around(`<p>${kept}</p>`)), [...NOTICE.slice(0, 2), kept, NOTICE[2]]);
});

test("R32 (T51 fix round 3, C19; K4356) (control): the landmark rule still selects main, else article, for what else is read; the new furniture goes inside the article as well; script, style, template and head stay dropped", async () => {
  const page = `<html><head><title>T</title><style>.x{}</style></head><body><p>Outside words.</p>
<article><p>Article words.</p><div class="cookie-banner"><p>Cookie words.</p></div></article>
<template><p>Template words.</p></template><script>var s = "<p>Script words.</p>";</script></body></html>`;
  assert.deepEqual(await words(page), ["Article words."]);
  assert.deepEqual(await words(page.replace("<article>", "<main><p>Main words.</p><article>").replace("</article>", "</article></main>")),
    ["Main words.", "Article words."], "a main is the region when the page has one, and the furniture inside it is dropped");
  assert.deepEqual(await words('<body><p>One.</p><div class="usa-banner"><p>Banner.</p></div><dialog><p>Dialog.</p></dialog><p>Two.</p></body>'),
    ["One.", "Two."], "with no region the furniture is dropped from the whole page");
});

test("R32 (T51 fix round 3, C19; K4356) (control): a page with none of this furniture keeps all its text; the element and attribute names that are not furniture are kept; two readings of the same page are identical", async () => {
  const page = `<html><body class="share-page cookie-policy modal-open"><h1>Title words</h1><p class="lead">First.</p><div id="content" class="shared-notes">Second.</div>
<p>Terms: <a href="/t">the terms</a> apply.</p><ul><li>Plain one</li><li>Plain two</li></ul><span class="social-impact">Impact words.</span>
<div class="notice">Cookies are a kind of biscuit, said the recipe.</div></body></html>`;
  assert.deepEqual(await words(page), ["Title words", "First.", "Second.", "Terms: the terms apply.", "Plain one", "Plain two",
    "Impact words.", "Cookies are a kind of biscuit, said the recipe."]);
  const a = await readAs(page), b = await readAs(page);
  assert.deepEqual(a.text_units, b.text_units);
  assert.deepEqual(a.reading, b.reading);
});

test("R32 (T51 fix round 3, C19; K4356) (control): the reader still gets the whole decoded text, so the counts and the provenance are those of the whole page, furniture included", async () => {
  const page = around('<div class="usa-banner"><p>Official websites use .gov</p></div>');
  const out = await readAs(page);
  assert.equal(out.reading.text_chars, page.length);
  assert.ok(out.reading.words_total >= out.reading.words_read, "the counts speak of the units drawn");
  assert.deepEqual(out.text_units.map((u) => u.text), NOTICE);
});

const FIXTURES = [
  ["nps.gov", "nps-gov-yose-index.htm", ["Official websites use .gov", "Secure .gov websites use HTTPS", "Exiting nps.gov", "Cancel"],
    ["What is there to do in Yosemite? A lot!", "Camping is extremely popular in Yosemite", "Wilderness permits are required for all overnight hikes"]],
  ["justice.gov", "justice-gov-home.html", ["Official websites use .gov", "Secure .gov websites use HTTPS"],
    ["Our Mission", "Our Values", "By the Numbers"]],
  ["acgov.org", "acgov-org-home.html", ["Translate", "Cancel", "Close", "Skip to"],
    ["Digital Counties Award Winner", "Vision 2036", "ACGOV Cares"]],
];
for (const [site, file, furniture, content] of FIXTURES)
  test(`R32 (T51 fix round 3, C19; K4194, K4356): the saved ${site} page yields units without the walker's furniture (${furniture.join(", ")}) and still yields its content; the same page read twice gives the same units`, async () => {
    const page = saved(file);
    for (const f of furniture) assert.ok(page.includes(f), `the saved page holds ${f}`);
    const out = await readAs(page), a = out.text_units.map((u) => u.text);
    for (const f of furniture) assert.ok(!a.some((t) => t.includes(f)), `no unit holds ${f}`);
    for (const c of content) assert.ok(a.some((t) => t.includes(c)), `a unit still holds ${c}`);
    assert.deepEqual(a, (await readAs(page)).text_units.map((u) => u.text));
    assert.deepEqual(out.text_units.map((u) => u.seq), a.map((_, i) => i), "seq and para count the passages kept, from 0");
    assert.deepEqual(out.text_units.map((u) => u.extent.para), a.map((_, i) => i));
  });

test("R32 (T51 fix round 3, C19; K4194, K4303): a passage already cited keeps resolving to the same words: a page with none of the new furniture reads unit for unit as it did, and the furniture's removal leaves the page's other units in their order", async () => {
  const old = [["Notice 2026-118", 0], ["The council adopted the shelter repair standard on 3 March 2025.", 1], ["Repairs follow within 30 days.", 2]];
  const plain = (await readAs(around(""))).text_units.map((u) => [u.text, u.extent.para]);
  assert.deepEqual(plain, old);
  const furnished = (await readAs(around('<div class="cookie-banner"><p>Cookies.</p></div><dialog><p>Dialog.</p></dialog>'))).text_units;
  assert.deepEqual(furnished.map((u) => u.text), old.map(([t]) => t), "the units are those of the page read without the furniture");
  assert.deepEqual(furnished, (await readAs(around(""))).text_units);
});

test("R34 C25 (T51 fix round 3; the walker's page): a captured page whose address names a file (index.htm) reads its own <title>, else its first heading, never the file name; a page with neither carries none; the passages and extents are identical with and without the title", async () => {
  const at = "https://www.nps.gov/yose/index.htm";
  const titled = await readAs(saved("nps-gov-yose-index.htm"), at);
  assert.equal(titled.reading.title, "Yosemite National Park (U.S. National Park Service)");
  const body = "<p>Housing words one.</p><p>Housing words two.</p>";
  const withTitle = await readAs(`<html><head><title>Notice 2026-118</title></head><body>${body}</body></html>`, "https://a.example/docs/index.htm");
  const withHeading = await readAs(`<html><body><h1>Notice 2026-118</h1>${body}</body></html>`, "https://a.example/docs/index.html");
  const neither = await readAs(`<html><body>${body}</body></html>`, "https://a.example/docs/index.htm");
  assert.equal(withTitle.reading.title, "Notice 2026-118");
  assert.equal(withHeading.reading.title, "Notice 2026-118");
  assert.equal(neither.reading.title, null);
  assert.ok(Object.prototype.hasOwnProperty.call(neither.reading, "title"), "the key is present and null");
  const strip = (u) => u.text_units.filter((x) => x.text !== "Notice 2026-118").map((x) => x.text);
  assert.deepEqual(strip(withTitle), strip(neither));
  assert.deepEqual(neither.text_units.map((u) => u.text), strip(neither));
  assert.deepEqual(withTitle.text_units.map((u) => u.extent), neither.text_units.map((u) => u.extent));
});
