/* screens-daily, T51 fix round 6 (G16, G20; K4571, K4578): a search, a find and a list that stop at their bound say so and continue by the
   op's own cursor, never silently partial. Each test drives the case past the bound (250 documents, 300 passage hits, 120 matches) through
   the member's own presses on the real served page, with its control. Every sentence is asserted as `word(key, vars)` (R34). The words
   used are the nearest held rows (K4269); the rows owed go to the design (see the record). */
import test from "node:test";
import assert from "node:assert/strict";
import { open as openRaw, ok, text, press, main, settle, word, withScreens, MEMBER } from "./page.mjs";

const open = (path, plane, o = {}) => openRaw(path, plane, { screens: withScreens("document", "question", "person", "action", "plan", "project", "timeline"), ...o });
const SCOPES = ok({ ok: true, scopes: ["everything", "document"].map((key) => ({ key, kinds: [], only: null })) });
const hits = (from, n) => Array.from({ length: n }, (_, i) => ({ bundle_id: "INF-" + (from + i), object_type: "information", title: "Document " + (from + i), snippet: null }));
const rows = (from, n, doc = (i) => "INF-" + (from + i)) => Array.from({ length: n }, (_, i) => ({ bundle_id: doc(i), title: "Document " + doc(i), snippet: "the [sewer] fund", extent: { passage: from + i } }));
const subjects = (from, n) => Array.from({ length: n }, (_, i) => ({ entity_id: "ENT-" + (from + i), kind: "fund", label: "Fund " + (from + i), documents: 2 }));
const routeButton = (p, route) => main(p).querySelector(`button[data-route="${route}"]`);

// 120 titles-and-notes matches shown 50 at a time; 300 passage matches shown 200 at a time; 60 subjects shown 50 at a time.
const searched = () => {
  const reads = { search: [], meaningrows: [], subjectsnamed: [] };
  return { reads, plane: {
    searchfields: SCOPES,
    search: (req) => { reads.search.push(req.query); const at = Number(req.query.offset || 0); return ok({ ok: true, total: 120, limit: 50, offset: at, hits: hits(at, Math.min(50, 120 - at)) }); },
    meaningrows: (req) => { reads.meaningrows.push(req.query); const at = Number(req.query.offset || 0); return ok({ ok: true, total: 300, limit: 200, offset: at, rows: rows(at, Math.min(200, 300 - at), (i) => "INF-" + ((at + i) % 250)) }); },
    subjectsnamed: (req) => { reads.subjectsnamed.push(req.query); const first = !req.query.after; return ok({ ok: true, count: 60, subjects: first ? subjects(0, 50) : subjects(50, 10), truncated: first, next: first ? "cursor-50" : null }); },
  } };
};

test("R100, R56 (G16, S3): a search past its pages says it shows part and continues by each route's cursor; the counts stay the query's own and the documents the passages lie in are counted only once every passage is loaded", async () => {
  const { reads, plane } = searched();
  const p = await open("/app/finder/sewer fund", plane);
  await settle();
  for (const route of ["fields", "passages", "subjects"]) assert.ok(routeButton(p, route), route + ": a more act is drawn");
  assert.ok(text(p).includes(word("screen.finder.route.fields.holds.other", { n: "120" })), "the count is the query's total, not the rows drawn");
  assert.ok(text(p).includes(word("screen.held.archivemore", { shown: "200", total: "300" })), "the passages route says 200 of 300 are shown");
  assert.ok(!text(p).includes(word("screen.finder.route.passages.holds.other", { n: "300", m: "200" })), "and states no documents count of the part it holds");
  assert.equal(main(p).querySelectorAll('a[href^="/app/document/INF-"]').length > 0, true);
  await p.click(routeButton(p, "fields"));
  await settle();
  assert.equal(reads.search.at(-1).offset, "50", "the fields route asks the next page from where it stopped");
  await p.click(routeButton(p, "fields"));
  await settle();
  assert.equal(reads.search.at(-1).offset, "100");
  assert.equal(main(p).querySelectorAll('a[href^="/app/document/INF-"]').length > 100, true, "the later pages are added below the first");
  assert.ok(!routeButton(p, "fields"), "the fields route, whole at 120, draws no more act");
  await p.click(routeButton(p, "passages"));
  await settle();
  assert.equal(reads.meaningrows.at(-1).offset, "200", "the passages route continues at the rows it holds");
  assert.ok(!routeButton(p, "passages"), "300 of 300 loaded: no more act");
  assert.ok(text(p).includes(word("screen.finder.route.passages.holds.other", { n: "300", m: "250" })), "now the documents are counted: 250 of them");
  await p.click(routeButton(p, "subjects"));
  await settle();
  assert.equal(reads.subjectsnamed.at(-1).after, "cursor-50");
  assert.ok(!routeButton(p, "subjects"));
  assert.equal(main(p).querySelectorAll('a[href^="/app/person/ENT-"]').length, 60, "all sixty subjects");
});

test("R100, R56 (G16, S3) control: a search whose routes are whole draws no more act and states the passages' documents as before", async () => {
  const p = await open("/app/finder/sewer fund", { searchfields: SCOPES, search: ok({ ok: true, total: 2, offset: 0, hits: hits(0, 2) }),
    meaningrows: ok({ ok: true, total: 2, offset: 0, rows: rows(0, 2) }), subjectsnamed: ok({ ok: true, count: 1, subjects: subjects(0, 1), truncated: false, next: null }) });
  await settle();
  for (const route of ["fields", "passages", "subjects"]) assert.equal(routeButton(p, route), null, route);
  assert.ok(text(p).includes(word("screen.finder.route.passages.holds.other", { n: "2", m: "2" })));
});

const scopeWith = (extra) => ({ documents: 500, documents_with_rows: 460, documents_without_rows: 40, existence_only_projects: [], ...extra });
const VOCAB = { full: "indexed in full", part: "indexed in part", none: "not indexed", notex: "not extracted" };
const covered = (scope) => ({ searchfields: SCOPES, search: ok({ ok: true, total: 1, offset: 0, hits: hits(0, 1), scope, levels: { meaning: { state: "UNDETERMINED", why: "no read names it" } }, content_axis: { vocabulary: VOCAB } }),
  meaningrows: ok({ ok: true, total: 0, rows: [] }), subjectsnamed: ok({ ok: true, count: 0, subjects: [] }) });

test("R100, R56 (G16, S3): what the search covered names the documents only partly searchable and a tally that covers only its first captures", async () => {
  const p = await open("/app/finder/sewer", covered(scopeWith({ captures_counted: 500, captures_truncated: true, captures_bound: 500, full: 400, part: 37, none: 40, notex: 23 })));
  await settle();
  const t = text(p);
  assert.ok(t.includes("37 " + word("observation-log.partial.looked_got_part")), "37 documents indexed in part are counted");
  assert.ok(t.includes(word("find.browse.more")), "and the tally says it covers only the first documents");
  const whole = await open("/app/finder/sewer", covered(scopeWith({ captures_counted: 500, captures_truncated: false, captures_bound: 500, full: 460, part: 0, none: 40, notex: 0 })));
  await settle();
  assert.ok(!text(whole).includes(word("observation-log.partial.looked_got_part")) && !text(whole).includes(word("find.browse.more")), "control: none partly searchable, tally whole: neither line");
});

const GOT = { found: true, built: true, never_looked: [], never_looked_count: 0, tally: { LOOKED_FOUND: 4, LOOKED_ABSENT: 1 }, note: "" };
const frontierPlane = (content) => ({ frontier: (req) => ok(req.query.level === "content" ? content : GOT) });

test("R100, R77 (G16, S4): a content level looked at in part is said and blocks \"looked everywhere\"; with every level whole the sentence is drawn", async () => {
  const p = await open("/app/finder", frontierPlane({ ...GOT, tally: { LOOKED_FOUND: 3, partial: 2 } }));
  await press(p, "frontier", { reason: "looking" });
  await settle();
  assert.ok(text(p).includes(word("observation-log.partial.looked_got_part")), "the partial look is told");
  assert.ok(text(p).includes("(2)"), "with its count");
  assert.ok(!text(p).includes(word("screen.finder.nobody.none")), "somebody has not looked everywhere");
  const whole = await open("/app/finder", frontierPlane(GOT));
  await press(whole, "frontier", { reason: "looking" });
  await settle();
  assert.ok(text(whole).includes(word("screen.finder.nobody.none")), "control: every level whole says everywhere");
});

// Find in: 250 documents in the scope, read 200 a call.
const KINDS_OF = (people, truncated) => [{ kind: "people", items: people, count: people.length, truncated, nothing: false, not_read: [] },
  { kind: "money", items: [], count: 0, truncated: false, nothing: false, not_read: [] }];
const person = (i) => ({ kind: "people", words: "Person " + i, capture_sha: "c" + i, title: "Doc " + i, extent: { passage: i }, entity: "ENT-" + i, recorded: [] });
const FI = {
  factstatus: ok({ ok: true, zone: "America/Los_Angeles" }), image: ok({ "bundle.md": '---\nobject_type: project\ntitle: "The Coliseum lease"\n---\n' }),
  projectquestions: ok({ ok: true, project: "PROJ-1", items: [{ inquiry: "INQ-1", title: "Is it repaired?" }], cursor: null }),
};

test("R101, R5 (G16, S5): a find over 250 documents says it has searched 200 of them, continues from its cursor, adds the later results below the first, and says every kind that was cut", async () => {
  let call = 0;
  const bodies = [];
  const p = await open("/app/find-in/PROJ-1", { ...FI, findin: (req) => { bodies.push(req.body); call++;
    return call === 1 ? ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 250 }, kinds: KINDS_OF([person(1), person(2)], true), captures_read: 200, next: "c199" })
      : ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 250 }, kinds: KINDS_OF([person(3)], false), captures_read: 50, next: null }); } });
  await press(p, "findin", { reason: "looking" });
  await settle();
  assert.ok(text(p).includes(word("screen.held.archivemore", { shown: "200", total: "250" })), "searched 200 of 250");
  assert.ok(text(p).includes(word("find.browse.more")), "the people kind was cut at its bound and says so");
  const more = main(p).querySelector('button[data-cont]');
  assert.ok(more, "a continue act is drawn");
  await p.click(more);
  await settle();
  assert.equal(bodies[1].cursor, "c199", "the second call carries the cursor");
  assert.deepEqual(bodies[1].kinds, bodies[0].kinds, "and asks what the first asked");
  assert.deepEqual(bodies[1].scope, bodies[0].scope);
  assert.ok(text(p).includes("Person 1") && text(p).includes("Person 2") && text(p).includes("Person 3"), "the later results are added below the first");
  assert.ok(!main(p).querySelector('button[data-cont]') && !text(p).includes(word("screen.held.archivemore", { shown: "200", total: "250" })), "searched everything: no continue act, no partial line");
  const whole = await open("/app/find-in/PROJ-1", { ...FI, findin: ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 14 }, kinds: KINDS_OF([person(1)], false), captures_read: 14, next: null }) });
  await press(whole, "findin", { reason: "looking" });
  await settle();
  assert.ok(!text(whole).includes(word("find.browse.more")) && !main(whole).querySelector('button[data-cont]'), "control: a whole find states neither");
});

test("R101, R5, R48 (G16, S5): a sheet match whose row of cells was cut says so", async () => {
  const sheet = { kind: "money", words: "$4", capture_sha: "c1", title: "Budget", extent: {}, sheet: "Sheet1", row: 3, cells: [{ cell: "A3", value: "x" }], cells_truncated: true, recorded: [] };
  const p = await open("/app/find-in/PROJ-1", { ...FI, findin: ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 1 }, kinds: [{ kind: "money", items: [sheet], count: 1, truncated: false, nothing: false, not_read: [] }], captures_read: 1, next: null }) });
  await press(p, "findin", { reason: "looking" });
  await settle();
  assert.ok(text(p).includes(word("find.browse.more")));
  const whole = await open("/app/find-in/PROJ-1", { ...FI, findin: ok({ ok: true, scope: { form: "project", project: "PROJ-1", captures: 1 }, kinds: [{ kind: "money", items: [{ ...sheet, cells_truncated: false }], count: 1, truncated: false, nothing: false, not_read: [] }], captures_read: 1, next: null }) });
  await press(whole, "findin", { reason: "looking" });
  await settle();
  assert.ok(!text(whole).includes(word("find.browse.more")), "control: whole cells say nothing");
});

test("R102, R5 (G20, S11): the question chooser of a find says when it stops at its bound; whole, it says nothing", async () => {
  const cut = await open("/app/find-in/PROJ-1", { ...FI, projectquestions: ok({ ok: true, project: "PROJ-1", items: [{ inquiry: "INQ-1", title: "Is it repaired?" }], cursor: "INQ-1" }), findin: ok({ ok: true, kinds: [] }) });
  await settle();
  assert.ok(text(cut).includes(word("screen.people.more", { n: "1" })));
  const whole = await open("/app/find-in/PROJ-1", { ...FI, findin: ok({ ok: true, kinds: [] }) });
  await settle();
  assert.ok(!text(whole).includes(word("screen.people.more", { n: "1" })));
  const search = await open("/app/find-in/sel-1", { ...FI, search: ok({ ok: true, total: 450, hits: [{ bundle_id: "INQ-1", title: "Is it repaired?" }] }), projectlist: ok({ ok: true, projects: [] }), findin: ok({ ok: true, kinds: [] }) });
  await settle();
  assert.ok(text(search).includes(word("screen.people.more", { n: "1" })), "the questions of a held set or a document stop at 200 and say so");
});

const HOME = {
  whoami: ok({ ...MEMBER, capabilities: ["contribute"] }), groupidentity: ok({ ok: true, group: "g", display_name: "G" }), queue: ok({ items: [], item_count: 0 }),
  lookedsince: ok({ since: "2026-10-01T00:00:00Z" }), startfrom: ok({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }] }),
  projectlist: ok({ ok: true, count: 0, limit: 200, truncated: false, projects: [] }), inbox: ok({ inbox: [] }),
};
const HELD = (n, truncated) => ok({ ok: true, held: Array.from({ length: n }, (_, i) => ({ bundle_id: "INF-H" + i, title: "H" + i, actor: "other", source: null, capture: { sha256: "a".repeat(64) }, whole: true })), state: "held", truncated, next: truncated ? "INF-H9" : null, limit: n });

test("R102, R65 (G20, S11): the door to Held captures says when the picker read stopped at its bound, on Home and the Queue; whole, it says nothing", async () => {
  for (const path of ["/app", "/app/queue"]) {
    const cut = await open(path, { ...HOME, heldcaptures: HELD(500, true) });
    await settle();
    assert.ok(text(cut).includes(word("screen.held.more", { count: "500" })), path + ": 500 shown, more waiting");
    const whole = await open(path, { ...HOME, heldcaptures: HELD(3, false) });
    await settle();
    assert.ok(!text(whole).includes(word("screen.held.more", { count: "3" })), path + " control");
  }
});
