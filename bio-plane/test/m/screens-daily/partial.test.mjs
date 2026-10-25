/* screens-daily, T51 fix round 6 (G16, G20; K4571, K4578): a search, a find and a list that stop at their bound say so and continue by the
   op's own cursor, never silently partial. Each test drives the case past the bound (250 documents, 120 matches, 60 subjects, 200 questions)
   through the member's own presses on the real served page, over the REAL store (store-request's `storeWorld()`, op-tables §5.3): the
   documents, the subjects, the questions and the project are made by the real acts and every answer from an earlier module is the store's.
   What stays hand-built is a later module's answer (`searchfields`, `meaningrows`, `frontier`, `heldcaptures`: not yet in the store) and
   the one read that fails. Every sentence is asserted as `word(key, vars)` (R34). The words used are the nearest held rows (K4269); the rows
   owed go to the design (see the record). */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { generate } from "../../sheetgen.mjs";
import { open as openRaw, ok, text, press, main, settle, word, withScreens } from "./page.mjs";

const timeout = { timeout: 900000 };
const SCREENS = withScreens("document", "question", "person", "action", "plan", "project", "timeline");
/** The page over the world, as `as`. */
const open = (w, as, path, plane = {}, o = {}) => openRaw(path, plane, { screens: SCREENS, ...w.boot(as), ...o });
/** The page over a scripted plane alone (the later modules' reads only). */
const plain = (path, plane, o = {}) => openRaw(path, plane, { screens: SCREENS, ...o });
const SCOPES = ok({ ok: true, scopes: ["everything", "document"].map((key) => ({ key, kinds: [], only: null })) });
const rows = (from, n, doc = (i) => "INF-" + (from + i)) => Array.from({ length: n }, (_, i) => ({ bundle_id: doc(i), title: "Document " + doc(i), snippet: "the [sewer] fund", extent: { passage: from + i } }));
const routeButton = (p, route) => main(p).querySelector(`button[data-route="${route}"]`);
const worldOf = async () => { const w = await storeWorld({ group: null }); return { w, rosa: await w.signIn("rosa", { admin: true }) }; };
const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// 120 titles-and-notes matches shown 50 at a time; 300 passage matches shown 200 at a time; 60 subjects shown 50 at a time.
/** The group's documents "Sewer fund memo 1..120" and subjects "Sewer fund 1..60" (funds), by the real acts. The passage route (`meaningrows`,
 *  a later module) answers 300 passage rows over 250 documents. */
async function searched() {
  const { w, rosa } = await worldOf();
  for (let i = 1; i <= 120; i++) await w.recipes.hold(rosa, `Sewer fund memo ${i}`, `memo ${i}`);
  for (let i = 1; i <= 60; i++) await rosa.act("entitycreate", { body: { kind: "fund", label: `Sewer fund ${i}`, note: `Fund number ${i} of the sewer accounts.` } });
  const plane = { searchfields: SCOPES,
    meaningrows: (req) => { const at = Number(req.query.offset || 0); return ok({ ok: true, total: 300, limit: 200, offset: at, rows: rows(at, Math.min(200, 300 - at), (i) => "INF-" + ((at + i) % 250)) }); } };
  return { w, rosa, plane };
}
/** The reads a route made, by the words it asked. */
const readsOf = (p, op) => p.byOp(op).filter((r) => !String(r.query.q || "").startsWith("id:")).map((r) => r.query);

test("R100, R56 (G16, S3): a search past its pages says it shows part and continues by each route's cursor; the counts stay the query's own and the documents the passages lie in are counted only once every passage is loaded", timeout, async () => {
  const { w, rosa, plane } = await searched();
  const p = await open(w, rosa, "/app/finder/sewer fund", plane);
  await settle();
  for (const route of ["fields", "passages", "subjects"]) assert.ok(routeButton(p, route), route + ": a more act is drawn");
  assert.ok(text(p).includes(word("screen.finder.route.fields.holds.other", { n: "120" })), "the count is the query's total, not the rows drawn");
  assert.ok(text(p).includes(word("screen.held.archivemore", { shown: "200", total: "300" })), "the passages route says 200 of 300 are shown");
  assert.ok(!text(p).includes(word("screen.finder.route.passages.holds.other", { n: "300", m: "200" })), "and states no documents count of the part it holds");
  assert.equal(main(p).querySelectorAll('a[href^="/app/document/INFO-"]').length > 0, true);
  await p.click(routeButton(p, "fields"));
  await settle();
  assert.equal(readsOf(p, "search").at(-1).offset, "50", "the fields route asks the next page from where it stopped");
  await p.click(routeButton(p, "fields"));
  await settle();
  assert.equal(readsOf(p, "search").at(-1).offset, "100");
  assert.equal(main(p).querySelectorAll('a[href^="/app/document/INFO-"]').length > 100, true, "the later pages are added below the first");
  assert.ok(!routeButton(p, "fields"), "the fields route, whole at 120, draws no more act");
  await p.click(routeButton(p, "passages"));
  await settle();
  assert.equal(p.byOp("meaningrows").at(-1).query.offset, "200", "the passages route continues at the rows it holds");
  assert.ok(!routeButton(p, "passages"), "300 of 300 loaded: no more act");
  assert.ok(text(p).includes(word("screen.finder.route.passages.holds.other", { n: "300", m: "250" })), "now the documents are counted: 250 of them");
  await p.click(routeButton(p, "subjects"));
  await settle();
  assert.equal(p.byOp("subjectsnamed").length, 2, "the subjects route asked its next page");
  assert.ok(p.byOp("subjectsnamed").at(-1).query.after, "by the cursor the first page gave");
  assert.ok(!routeButton(p, "subjects"));
  assert.equal(main(p).querySelectorAll('a[href^="/app/person/ENT-"]').length, 60, "all sixty subjects");
});

test("R100, R56 (G16, S3) control: a search whose routes are whole draws no more act and states the passages' documents as before", timeout, async () => {
  const { w, rosa } = await worldOf();
  for (let i = 1; i <= 2; i++) await w.recipes.hold(rosa, `Sewer fund memo ${i}`, `memo ${i}`);
  await rosa.act("entitycreate", { body: { kind: "fund", label: "Sewer fund", note: "The sewer fund." } });
  const p = await open(w, rosa, "/app/finder/sewer fund", { searchfields: SCOPES, meaningrows: ok({ ok: true, total: 2, offset: 0, rows: rows(0, 2) }) });
  await settle();
  for (const route of ["fields", "passages", "subjects"]) assert.equal(routeButton(p, route), null, route);
  assert.ok(text(p).includes(word("screen.finder.route.passages.holds.other", { n: "2", m: "2" })));
});

const scopeWith = (extra) => ({ documents: 500, documents_with_rows: 460, documents_without_rows: 40, existence_only_projects: [], ...extra });
const VOCAB = { full: "indexed in full", part: "indexed in part", none: "not indexed", notex: "not extracted" };
/* What the passage route covered is the meaning-grain answer's (`retrieval` levels: a later module's `meaningrows`), whose scope the page reads. */
const covered = (scope) => ({ searchfields: SCOPES,
  meaningrows: ok({ ok: true, total: 0, rows: [], scope, levels: { meaning: { state: "UNDETERMINED", why: "no read names it" } }, content_axis: { vocabulary: VOCAB } }) });

test("R100, R56 (G16, S3): what the search covered names the documents only partly searchable and a tally that covers only its first captures", timeout, async () => {
  const { w, rosa } = await worldOf();
  await w.recipes.hold(rosa, "Sewer minutes", "The sewer minutes.");
  const p = await open(w, rosa, "/app/finder/sewer", covered(scopeWith({ captures_counted: 500, captures_truncated: true, captures_bound: 500, full: 400, part: 37, none: 40, notex: 23 })));
  await settle();
  const t = text(p);
  assert.ok(t.includes("37 " + word("observation-log.partial.looked_got_part")), "37 documents indexed in part are counted");
  assert.ok(t.includes(word("find.browse.more")), "and the tally says it covers only the first documents");
  const whole = await open(w, rosa, "/app/finder/sewer", covered(scopeWith({ captures_counted: 500, captures_truncated: false, captures_bound: 500, full: 460, part: 0, none: 40, notex: 0 })));
  await settle();
  assert.ok(!text(whole).includes(word("observation-log.partial.looked_got_part")) && !text(whole).includes(word("find.browse.more")), "control: none partly searchable, tally whole: neither line");
});

const GOT = { found: true, built: true, never_looked: [], never_looked_count: 0, tally: { LOOKED_FOUND: 4, LOOKED_ABSENT: 1 }, note: "" };
const frontierPlane = (content) => ({ frontier: (req) => ok(req.query.level === "content" ? content : GOT) });

test("R100, R77 (G16, S4): a content level looked at in part is said and blocks \"looked everywhere\"; with every level whole the sentence is drawn", async () => {
  const p = await plain("/app/finder", frontierPlane({ ...GOT, tally: { LOOKED_FOUND: 3, partial: 2 } }));
  await press(p, "frontier", { reason: "looking" });
  await settle();
  assert.ok(text(p).includes(word("observation-log.partial.looked_got_part")), "the partial look is told");
  assert.ok(text(p).includes("(2)"), "with its count");
  assert.ok(!text(p).includes(word("screen.finder.nobody.none")), "somebody has not looked everywhere");
  const whole = await plain("/app/finder", frontierPlane(GOT));
  await press(whole, "frontier", { reason: "looking" });
  await settle();
  assert.ok(text(whole).includes(word("screen.finder.nobody.none")), "control: every level whole says everywhere");
});

// Find in: 250 documents in the scope, read 200 a call.
const FIRST = ["Alma", "Boris", "Carla", "Dmitri", "Elena", "Farid", "Greta", "Hugo", "Ines", "Jonas"];
const LAST = ["Quinn", "Reyes", "Okafor", "Lindqvist", "Moreau", "Tanaka", "Haddad", "Novak", "Silva", "Brandt", "Cohen", "Dubois", "Eriksen", "Fontaine",
  "Garza", "Hoang", "Ivanov", "Jensen", "Kovacs", "Laurent", "Mbeki", "Nakamura", "Ortega", "Petrov", "Rinaldi"];
const nameAt = (i) => `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length)]}`;
/** A project with `n` minutes pages in it, each naming one registered person (a subject of kind person): the people a find over it can find. */
async function minutes(w, as, title, n, { first = 0 } = {}) {
  const project = await w.recipes.project(as, title);
  for (let i = first; i < first + n; i++) {
    await as.act("entitycreate", { body: { kind: "person", label: nameAt(i), note: "A speaker at the meetings." } });
    await w.recipes.page(as, `Minutes ${i + 1}`, { project, paragraphs: [`${nameAt(i)} spoke at the meeting.`] });
  }
  return project;
}
const peopleOf = (answer) => answer.kinds.find((k) => k.kind === "people");

test("R101, R5 (G16, S5): a find over 250 documents says it has searched 200 of them, continues from its cursor, adds the later results below the first, and says every kind that was cut", timeout, async () => {
  const { w, rosa } = await worldOf();
  const project = await minutes(w, rosa, "The Coliseum lease", 250);
  const p = await open(w, rosa, `/app/find-in/${project}`);
  await press(p, "findin", { reason: "looking" });
  await settle();
  const bodies = () => p.byOp("findin").map((r) => r.body);
  const first = await rosa.act("findin", { body: bodies()[0] });
  assert.deepEqual([first.captures_read, first.scope.captures], [200, 250], "the store read 200 of the 250");
  assert.ok(first.next, "and gives the cursor to go on from");
  assert.ok(peopleOf(first).truncated, "the people kind was cut at its bound");
  assert.ok(text(p).includes(word("screen.held.archivemore", { shown: "200", total: "250" })), "searched 200 of 250");
  assert.ok(text(p).includes(word("find.browse.more")), "the people kind was cut at its bound and says so");
  const more = main(p).querySelector('button[data-cont]');
  assert.ok(more, "a continue act is drawn");
  await p.click(more);
  await settle();
  assert.equal(bodies()[1].cursor, first.next, "the second call carries the cursor");
  assert.deepEqual(bodies()[1].kinds, bodies()[0].kinds, "and asks what the first asked");
  assert.deepEqual(bodies()[1].scope, bodies()[0].scope);
  const second = await rosa.act("findin", { body: bodies()[1] });
  assert.equal(second.next, null);
  const [early, late] = [peopleOf(first).items[0].words, peopleOf(second).items[0].words];
  assert.notEqual(early, late);
  assert.ok(text(p).includes(early) && text(p).includes(late), "the later results are added below the first");
  assert.ok(!main(p).querySelector('button[data-cont]') && !text(p).includes(word("screen.held.archivemore", { shown: "200", total: "250" })), "searched everything: no continue act, no partial line");
  const small = await minutes(w, rosa, "The Library hours", 3, { first: 250 });
  const whole = await open(w, rosa, `/app/find-in/${small}`);
  await press(whole, "findin", { reason: "looking" });
  await settle();
  assert.ok(!text(whole).includes(word("find.browse.more")) && !main(whole).querySelector('button[data-cont]'), "control: a whole find states neither");
});

test("R101, R5, R48 (G16, S5): a sheet match whose row of cells was cut says so", timeout, async () => {
  const { w, rosa } = await worldOf();
  const held = async (title, cols) => {
    const project = await w.recipes.project(rosa, title);
    const bytes = await generate({ kind: "xlsx", seed: "wide", size: { rows: 3, cols }, types: ["text", "currency"] }).bytes();
    await w.recipes.hold(rosa, "Budget", bytes, project, { type: XLSX, read: true });
    return project;
  };
  const [wide, narrow] = [await held("Wide budget", 54), await held("Narrow budget", 6)];
  const found = async (project) => {
    const p = await open(w, rosa, `/app/find-in/${project}`);
    await press(p, "findin", { reason: "looking", values: { "findin-term": "wide" } });
    await settle();
    return p;
  };
  const p = await found(wide);
  const item = (await rosa.act("findin", { body: p.byOp("findin")[0].body })).kinds.find((k) => k.kind === "term").items[0];
  assert.equal(item.cells_truncated, true, "the store cut the row at 50 cells");
  assert.ok(text(p).includes(word("find.browse.more")));
  const whole = await found(narrow);
  assert.equal((await rosa.act("findin", { body: whole.byOp("findin")[0].body })).kinds.find((k) => k.kind === "term").items[0].cells_truncated, false);
  assert.ok(!text(whole).includes(word("find.browse.more")), "control: whole cells say nothing");
});

test("R102, R5 (G20, S11): the question chooser of a find says when it stops at its bound; whole, it says nothing", timeout, async () => {
  const { w, rosa } = await worldOf();
  const big = await w.recipes.project(rosa, "The Coliseum lease"), small = await w.recipes.project(rosa, "The Library hours");
  await w.recipes.question(rosa, small, { title: "Is it repaired?", draw: true });
  await w.recipes.questions(rosa, big, 201);
  const cut = await open(w, rosa, `/app/find-in/${big}`);
  await settle();
  assert.ok(text(cut).includes(word("screen.people.more", { n: "200" })));
  const whole = await open(w, rosa, `/app/find-in/${small}`);
  await settle();
  assert.ok(!text(whole).includes(word("screen.people.more", { n: "1" })) && !text(whole).includes(word("screen.people.more", { n: "200" })));
  const search = await open(w, rosa, "/app/find-in/sel-1");
  await settle();
  assert.ok(text(search).includes(word("screen.people.more", { n: "200" })), "the questions of a held set or a document stop at 200 and say so");
});

const HELD = (n, truncated) => ok({ ok: true, held: Array.from({ length: n }, (_, i) => ({ bundle_id: "INF-H" + i, title: "H" + i, actor: "other", source: null, capture: { sha256: "a".repeat(64) }, whole: true })), state: "held", truncated, next: truncated ? "INF-H9" : null, limit: n });

test("R102, R65 (G20, S11): the door to Held captures says when the picker read stopped at its bound, on Home and the Queue; whole, it says nothing", timeout, async () => {
  const { w, rosa } = await worldOf();
  for (const path of ["/app", "/app/queue"]) {
    const cut = await open(w, rosa, path, { heldcaptures: HELD(500, true) });
    await settle();
    assert.ok(text(cut).includes(word("screen.held.more", { count: "500" })), path + ": 500 shown, more waiting");
    const whole = await open(w, rosa, path, { heldcaptures: HELD(3, false) });
    await settle();
    assert.ok(!text(whole).includes(word("screen.held.more", { count: "3" })), path + " control");
  }
});
