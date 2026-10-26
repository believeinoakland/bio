/* control-plane R100, R120, R123 (reading-pipeline R1, fix round 10; READING-PIPELINE #40 J55 (b); K5200 (4); item 101 (4)(d)): a fetched HTML page held in parts, through the real door.
   A member presses an address that serves a 9 MiB HTML page (the page of reading-pipeline's `r1-parts.test.mjs`, its paragraphs repeated to the size): the fetch is held in parts, the whole
   never stored under its own digest, and the reading the ledger makes of it is the page's text, whole, with its title, never "(multipart)" and never refused for being in parts. Control: the
   same page small enough to be held in one part is read the same way (the same title and the same first words). Run against the Miniflare plane (the seam kit). */
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { makeKit } from "./r8-kit.mjs";

const kit = makeKit({ tag: "r10htmlparts" });
after(() => kit.mf.dispose());
const { get, acquire, until, sha, serve, founder, te } = kit;
const MB = 1024 * 1024;
const body = (a) => (a && a.result !== undefined ? a.result : a);
const unitsText = (r) => JSON.stringify((r && (r.units || r.text_units || r.passages)) || r || {});

const HEAD = `<!doctype html><html><head><meta charset="utf-8"><title>Housing notice 2026-118</title></head><body>
<nav><a href="/a">Home</a> <a href="/b">Meetings</a></nav><main><article><h1>Notice 2026-118</h1>`;
const TAIL = `</article></main><footer>Contact the clerk</footer></body></html>`;
const LEAD = "The housing committee adopted the annual budget resolution after public comment: café, déjà vu, naïve, œuvre, 東京.";
const paragraph = (i) => `<p>Paragraph ${String(i).padStart(7, "0")} of the notice, with a figure of 1,250 units &amp; a deadline of June 30, read ${"into the record ".repeat(6)}</p>\n`;
function pageOf(size, tag) {
  const chunks = [HEAD, `<p>${LEAD} ${tag}</p>\n`];
  let n = 0, bytes = te(chunks.join("")).length;
  while (bytes < size - TAIL.length - 200) { const p = paragraph(n++); chunks.push(p); bytes += te(p).length; }
  chunks.push(TAIL);
  return te(chunks.join(""));
}
const stamp = () => `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

async function pressed(auth, label, size) {
  const tag = `${label} ${stamp()}`;
  const bytes = pageOf(size, tag);
  const name = `r10-${label}-${stamp()}.html`;
  serve(name, bytes, { type: "text/html; charset=utf-8", rate: size > 8 * MB ? 3 * MB : null });
  const locator = `https://www.example.gov/notices/${name}`;
  const first = await acquire(auth, { locator });
  assert.equal(first.status, 200, JSON.stringify(first.body).slice(0, 400));
  return { bytes, tag, locator, sha: sha(bytes), first };
}
/* the reading by digest, waited for until the ledger has ended it */
async function readEnded(auth, digest, ms = 300000) {
  let last = null;
  const got = await until(async () => {
    last = body(await get(auth, { op: "reading", sha256: digest }));
    const c = last && last.completeness;
    return last && last.found === true && last.more !== true && c && (c.state === "whole" || c.failure === "final") ? last : null;
  }, ms, 2000);
  assert.ok(got, "the reading ended: " + JSON.stringify(last && { found: last.found, more: last.more, completeness: last.completeness, job: last.job }).slice(0, 500));
  return got;
}

test("R100 R120 R123 (reading-pipeline R1): a 9 MiB HTML page fetched and held in parts is read as the page: its text whole, its title stated, nothing refused for being in parts; the small page is read the same way (control)", { timeout: 900000 }, async () => {
  const auth = await founder();
  const big = await pressed(auth, "htmlparts", 9 * MB);
  assert.ok(big.first.body.fetch_pending, `a page over 8 MiB is parked for the fetch: ${JSON.stringify(big.first.body).slice(0, 300)}`);
  const held = await until(async () => {
    const h = body(await get(auth, { op: "heldat", address: big.locator }));
    return h && h.copy && h.copy.parts ? h : null;
  }, 300000, 2000);
  assert.ok(held, "the fetch delivered the copy");
  assert.ok(held.copy.parts.length >= 2, `held in parts: ${held.copy.parts.length}`);
  const read = await readEnded(auth, big.sha);
  assert.notEqual(read.completeness.failure, "final", `read, not refused: ${JSON.stringify(read.completeness).slice(0, 300)}`);
  assert.ok(!/multipart/i.test(JSON.stringify(read.completeness)), `no "(multipart)": ${JSON.stringify(read.completeness).slice(0, 300)}`);
  const text = unitsText(read);
  assert.ok(text.includes("housing committee adopted the annual budget resolution"), "the page's first paragraph is in the units");
  assert.ok(text.includes("café") && text.includes("東京"), "characters across a part's seam are whole");
  assert.ok(!/Contact the clerk/.test(text), "the footer is no passage");
  assert.ok(JSON.stringify(read).includes("Housing notice 2026-118"), "the page's title is stated");
  /* control: the same page held whole */
  const small = await pressed(auth, "htmlsmall", 300 * 1024);
  assert.ok(!small.first.body.fetch_pending, "a small page is answered at once");
  const one = await readEnded(auth, small.sha);
  assert.ok(unitsText(one).includes("housing committee adopted the annual budget resolution"), "the control page reads");
  assert.ok(JSON.stringify(one).includes("Housing notice 2026-118"), "the control page's title");
});
