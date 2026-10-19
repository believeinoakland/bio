/* journey-check R28 (DEC-340), R27 (the pseudo-locale walk), R23 (a page numbered 0): the checks at the interface, each over a
   fixture page in a real browser, each with a control that holds. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { browser } from "../../../src/journey-check/run.mjs";
import { Walk, FAIL } from "../../../src/journey-check/walker.mjs";
import { pageZero } from "../../../src/journey-check/words.mjs";
import { titleLimits, weightLimits, mastheadLimits, coverLimits, projectsLimits, noConnectionLimits, publicPages, wordOf, DEC340 } from "../../../src/journey-check/checks.mjs";
import { escapedIn, escapedOnPage, pseudoBody } from "../../../src/journey-check/pseudo.mjs";
import { word, WORD_ROWS } from "../../../src/setup-words/index.mjs";

let B, dir;
before(async () => { B = await browser(); dir = mkdtempSync(join(tmpdir(), "jc-dec340-")); });
after(async () => { await B?.close(); rmSync(dir, { recursive: true, force: true }); });

async function on(html, fn, viewport = { width: 1280, height: 900 }) {
  const ctx = await B.newContext({ viewport });
  try { const p = await ctx.newPage(); await p.setContent(html); return await fn(p); } finally { await ctx.close(); }
}

test("R28: each screen's tab title is the word of its screen, a public page's the public form; control: another title fails by name", async () => {
  const screen = wordOf("screen.members.name");
  const good = wordOf("page.title", { screen, team: "Lakeshore Tenants" });
  assert.deepEqual(await on(`<title>${good}</title>`, (p) => titleLimits(p, "members")), []);
  const bad = await on("<title>Civicsmith</title>", (p) => titleLimits(p, "members"));
  assert.equal(bad.length, 1);
  assert.equal(bad[0].kind, DEC340.TITLE);
  const pub = wordOf("page.title.public", { page: wordOf("screen.front.name"), team: "Lakeshore Tenants" });
  assert.deepEqual(await on(`<title>${pub}</title>`, (p) => titleLimits(p, "front", { isPublic: true })), []);
  assert.equal((await on(`<title>${good}</title>`, (p) => titleLimits(p, "front", { isPublic: true }))).length, 1);
  assert.ok(publicPages().includes("published") && publicPages().includes("join") && publicPages().length === 9, publicPages().join(","));
});

test("R28: a public page draws no weight mark; control: a working screen keeps its marks (the check is made on public pages only)", async () => {
  const marked = await on('<main id="cs-main"><button data-weighed="1">Save</button></main>', weightLimits);
  assert.equal(marked.length, 1);
  assert.equal(marked[0].kind, DEC340.WEIGHT);
  assert.deepEqual(await on('<main id="cs-main"><button>Sign in</button></main>', weightLimits), []);
});

test("R28: the team's name in the masthead is never cut at 390 px; control: a name that wraps passes", async () => {
  const head = (css) => `<header class="cs-mast"><a class="mk-grp" href="/app" style="${css}">The Lakeshore Row Tenants and Neighbors Association of Oakland</a></header>`;
  const phone = { width: 390, height: 844 };
  const cut = await on(head("display:block;width:120px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis"), mastheadLimits, phone);
  assert.equal(cut.length, 1);
  assert.equal(cut[0].kind, DEC340.CUT);
  assert.deepEqual(await on(head("display:block;width:120px;overflow-wrap:anywhere"), mastheadLimits, phone), []);
});

test("R28: no explanation covers another control; control: with room it opens clear of every control", async () => {
  const page = (tipCss) => `<body style="margin:0"><button id="a" data-tip="why" style="position:absolute;left:10px;top:10px;width:80px;height:30px">A</button>
<button id="b" style="position:absolute;left:10px;top:50px;width:80px;height:30px">B</button><div id="cs-tip" hidden style="position:absolute;${tipCss}">why</div>
<script>const a = document.getElementById("a"), t = document.getElementById("cs-tip");
a.addEventListener("focus", () => { t.hidden = false; a.setAttribute("aria-describedby", "cs-tip"); });</script></body>`;
  const covering = await on(page("left:10px;top:46px;width:80px;height:40px"), (p) => coverLimits(p));
  assert.equal(covering.length, 1, JSON.stringify(covering));
  assert.equal(covering[0].kind, DEC340.COVERS);
  assert.match(covering[0].detail, /covers b/);
  assert.deepEqual(await on(page("left:200px;top:10px;width:80px;height:30px"), (p) => coverLimits(p)), []);
});

test("R28: Projects' search and filter have accessible names; control: named ones pass", async () => {
  const bad = await on('<main id="cs-main"><input type="search" id="p-search"><select id="p-filter"><option>All</option></select></main>', projectsLimits);
  assert.deepEqual(bad.map((x) => x.kind), [DEC340.NAME, DEC340.NAME]);
  assert.deepEqual(await on('<main id="cs-main"><input type="search" id="p-search" aria-label="Search"><label for="p-filter">Show</label><select id="p-filter"><option>All</option></select></main>', projectsLimits), []);
});

test("R28: a person with no connections draws no graph and no Explore; control: a person with connections is not judged", async () => {
  const none = wordOf("person.graph.none");
  const bad = await on(`<main id="cs-main"><p>${none}</p><div class="cs-graph"></div><a href="/app/explore/p1">Explore</a></main>`, noConnectionLimits);
  assert.deepEqual(bad.map((x) => x.kind), [DEC340.GRAPH, DEC340.GRAPH]);
  assert.deepEqual(await on(`<main id="cs-main"><p>${none}</p></main>`, noConnectionLimits), []);
  assert.equal(await on('<main id="cs-main"><div class="cs-graph"></div></main>', noConnectionLimits), null);
});

test("R27: a fixture screen with one sentence from the list and one hard-coded reports exactly the second", async () => {
  const { pseudo } = await import("../../../src/setup-words/build.mjs");
  const fromList = pseudo(word("shell.menu.signout"));
  const found = await on(`<main><p>${fromList}</p><p>Please sign in again now</p><p>Ann K</p><p>${"Roof repairs at 14 Lakeshore Row"}</p></main>`,
    (p) => escapedOnPage(p, { entered: ["Roof repairs at 14 Lakeshore Row"] }));
  assert.equal(found.length, 1, JSON.stringify(found));
  assert.equal(found[0].text, "Please sign in again now");
  assert.match(found[0].element, /^p/);
  /* data the screens draw from records and catalogues is not a sentence (K4086): a record reference and a catalogue row name */
  const data = await on('<main id="cs-main"><a class="cs-ref" href="/x">Firsthand observation observed</a><span class="mk-rowname">Splunk HTTP Event Collector</span><p>Please sign in again now</p></main>', (p) => escapedOnPage(p));
  assert.deepEqual(data.map((x) => x.text), ["Please sign in again now"]);
  assert.deepEqual(escapedIn(fromList), []);
  assert.deepEqual(escapedIn("a b"), []);
});

test("R27: the page's words are made pseudo before the page draws them: a key the list holds is altered, any other is left alone", async () => {
  const key = WORD_ROWS[0][0];
  const body = `x = [["${key}","${WORD_ROWS[0][1].replace(/"/g, '\\"').replace(/\n/g, "\\n")}"],["not.a.key","Plain words here"]]`;
  const out = await pseudoBody(body);
  assert.ok(out.includes('["not.a.key","Plain words here"]'));
  assert.ok(!out.includes(`["${key}","${WORD_ROWS[0][1].replace(/"/g, '\\"').replace(/\n/g, "\\n")}"]`) || WORD_ROWS[0][1].length < 2, "the row was altered");
  assert.match(out, /\["[^"]+","\[/);
});

test("R23: a page numbered 0 is found by the scan, and fails the step that draws it; control: a page bar whose first page reads Page 1 passes", async () => {
  assert.equal(pageZero("Page 0 of 3").length, 1);
  assert.equal(pageZero("Pages 0, 2").length, 1);
  assert.equal(pageZero("Page 0.5 of 3, Page 10, Page 1 of 3").length, 0);
  const stepOn = async (html) => {
    const walk = new Walk({ out: join(dir, String(Math.random()).slice(2)), arm: "local" });
    const ctx = await B.newContext(); const p = walk.watch(await ctx.newPage());
    try { await p.setContent(html); await walk.step(p, "a fixture page", async () => {}); return walk; } finally { await ctx.close(); }
  };
  const bad = await stepOn("<!doctype html><title>x</title><main><p>Page 0 of 3</p></main>");
  assert.deepEqual(bad.failures.map((f) => f.kind), [FAIL.PAGE_ZERO]);
  assert.deepEqual((await stepOn(`<!doctype html><title>x</title><main><p>${word("document.read.page", { n: 1, count: 3 })}</p></main>`)).failures, []);
});

test("R27 (K4086, K4111): values read from the Oakland profile and a vendor's name are data and are not reported; a hard-coded sentence beside them still is; the document step requires document.read.title", async () => {
  /* the profile's display name, read as data from the file (nothing is imported from jurisdictions) */
  const name = /\bname:\s*"([^"]+)"/.exec(readFileSync(join(import.meta.dirname, "..", "..", "..", "..", "jurisdictions", "profiles", "oakland-alameda.mjs"), "utf8"))?.[1] || "City of Oakland and Alameda County";
  const dirs = `<main id="cs-main" data-screen="elsewhere"><ul><li><b>Rent Adjustment Program</b> <span class="meta">Takes a tenant's petition challenging certain rent increases</span> <span>Frank Ogawa Plaza, Suite 5313</span></li></ul></main>`;
  assert.deepEqual(await on(dirs, (p) => escapedOnPage(p)), [], "the directory's profile values");
  const places = `<main id="cs-main" data-screen="places"><ul><li>${name}</li><li>City of Oakland, Alameda County</li></ul></main>`;
  assert.deepEqual(await on(places, (p) => escapedOnPage(p, { entered: [name] })), [], "the profile's display name");
  const vendor = '<main id="cs-main" data-screen="security"><ul><li><span class="mk-rowname">Joe Security LLC</span> <span class="mk-rowname">MetaDefender Cloud or Core</span></li></ul></main>';
  assert.deepEqual(await on(vendor, (p) => escapedOnPage(p)), [], "vendor and product names");
  /* control: the same pages holding a hard-coded sentence report exactly it */
  for (const html of [dirs, places, vendor]) {
    const found = await on(html.replace("</main>", "<p>Please sign in again now</p></main>"), (p) => escapedOnPage(p, { entered: [name] }));
    assert.deepEqual(found.map((x) => x.text), ["Please sign in again now"]);
  }
  /* the document step asks for the reading section by its key (B5) */
  const { requireWord } = await import("../../../src/journey-check/words.mjs");
  await on(`<main id="cs-main"><h2>${word("document.read.title")}</h2></main>`, (p) => requireWord(p, "document.read.title", { within: "#cs-main", timeout: 2000 }));
  await on('<main id="cs-main"><h2>Passages</h2></main>', async (p) => { await assert.rejects(requireWord(p, "document.read.title", { within: "#cs-main", timeout: 600 }), /does not draw the word document\.read\.title/); });
});
