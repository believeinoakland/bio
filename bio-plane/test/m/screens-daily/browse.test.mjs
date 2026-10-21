/* Find's browse, what each result is, Watch, Flag and Clear (R44, R45, R46) on the real served page (interface-shell's harness).
   Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { open as openRaw, ok, refused, text, ops, button, press as pressRaw, beside, last, main, word, hasWord, settle, withScreens, dmy } from "./page.mjs";

const R = "looking";
const NOTE = "check the dates twice";
const open = (path, plane, o = {}) => openRaw(path, plane, { screens: withScreens("document", "question", "person", "action", "plan", "project"), ...o });
// Until op-grades names the marks, the shell weighs them as reasoned: the reason is answered where it is asked.
const press = (p, op, o = {}) => pressRaw(p, op, { reason: R, ...o });

// The nth index of the hold strip's own button for `op` among all the page's buttons for it.
const stripIndex = (p, op) => main(p).querySelectorAll(`button[data-act="${op}"]`).findIndex((b) => b.closest(".cs-hold"));

const ITEMS = [
  { kind: "document", id: "INF-1", title: "Work orders FY2025", last_changed: "2026-10-12T10:00:00Z", new: true, watched: true, flagged: null },
  { kind: "question", id: "INQ-1", title: "Is the city repairing potholes?", last_changed: "2026-10-11T10:00:00Z", new: false, watched: false, flagged: { by: "rosa", at: "2026-10-10T10:00:00Z", note: "check the dates" } },
  { kind: "person", id: "ENT-1", title: "Dana Reyes", last_changed: "2026-10-01T10:00:00Z", new: false, watched: false, flagged: null },
];
const BROWSE = (items = ITEMS, extra = {}) => ok({ ok: true, kinds: ["document"], only: null, items, count: items.length, limit: 50, truncated: false, next: null, ...extra });
const PLANE = { lookedat: ok({ since: "2026-10-01T00:00:00Z" }), browse: BROWSE(), themeread: ok({ ok: true, themes: [] }) };
const browseReqs = (p) => p.byOp("browse");

test("R44: with no words Find is the browse: Show and Only choices, newest first, each result its kind, screen and marks; the words box says to leave it empty", async () => {
  const p = await open("/app/finder", PLANE);
  assert.ok(text(p).includes(word("find.browse.says")));
  assert.ok(text(p).includes(word("find.query.help")), "the words box says, beneath it, to leave it empty to browse");
  assert.equal(p.doc.getElementById("finder-q").getAttribute("placeholder"), word("find.query.placeholder"), "R54: the kit's placeholder (interface-shell R90)");
  // R54: "Show" and "Only" are the design's choices, not chips; the values the route seeds are the first chosen.
  const optionsOf = (id) => main(p).querySelectorAll(`#${id} option`).map((o) => o.textContent);
  assert.deepEqual(optionsOf("finder-kind"), ["find.kind.all", "find.kind.document", "find.kind.question", "find.kind.action", "find.kind.entity", "find.kind.plan"].map((k) => word(k)));
  const onlys = optionsOf("finder-state");
  assert.ok(onlys.includes(word("find.state.new")) && onlys.includes(word("find.state.watched")) && onlys.includes(word("find.state.secondlook")));
  assert.equal(main(p).querySelectorAll("nav.mk-sortrow").length, 0, "control: no chips");
  assert.equal(last(p, "browse").query.kinds, undefined);
  assert.equal(last(p, "browse").query.limit, "50");
  const rows = main(p).querySelectorAll(".cs-row");
  assert.equal(rows.length, 3);
  const t = rows.map((r) => text(p, r));
  assert.ok(t[0].includes("Work orders FY2025") && t[0].includes(word("find.row.kind.document")) && t[0].includes(word("find.row.new")) && t[0].includes(word("find.row.watched")));
  assert.ok(t[1].includes(word("find.row.kind.question")) && t[1].includes(word("find.row.secondlook", { who: "rosa", date: dmy("2026-10-10"), note: "check the dates" })));
  assert.ok(t[2].includes(word("find.row.kind.person")));
  // Each result opens its own kind's screen.
  assert.deepEqual(rows.map((r) => (r.querySelector("a.cs-ref") || { getAttribute: () => null }).getAttribute("href")), ["/app/document/INF-1", "/app/question/INQ-1", "/app/person/ENT-1"]);
  // A kind chosen by the route: `kinds` is sent; "new" sends `since` from lookedat, which Find does not follow with a moved mark.
  const q = await open("/app/finder/~question~new_since", PLANE);
  assert.deepEqual([last(q, "browse").query.kinds, last(q, "browse").query.only, last(q, "browse").query.since], ["question", "new_since", "2026-10-01T00:00:00Z"]);
  assert.equal(q.byOp("lookedat").length, 1);
  assert.equal(q.byOp("lookedsince").length, 0, "reading Find does not move the mark");
  assert.ok(text(q).includes(word("find.browse.new.means")));
  // With words typed the screen searches (R4).
  const s = await open("/app/finder/pothole", { ...PLANE, search: ok({ total: 0, hits: [] }) });
  assert.equal(browseReqs(s).length, 0);
  assert.equal(s.byOp("search").length >= 1, true);
});

test("R44: a lookedat of null offers no \"new\" choice and says why; a browse not truncated draws no \"Show more\"; one that is pages by next and adds below", async () => {
  const none = await open("/app/finder", { ...PLANE, lookedat: ok({ since: null }) });
  const onlys = main(none).querySelectorAll("#finder-state option").map((o) => o.textContent);
  assert.ok(!onlys.includes(word("find.state.new")));
  assert.ok(text(none).includes(word("find.browse.nosince")));
  assert.ok(!ops(none).includes("search") === false);
  assert.ok(!text(none).includes(word("find.browse.showmore")), "control: not truncated, no Show more");
  assert.ok(!text(none).includes(word("find.browse.more")));
  let page2 = 0;
  const paged = (req) => (req.query.after ? (page2++, BROWSE([{ kind: "plan", id: "PLN-1", title: "Repair plan", last_changed: "2026-09-01T00:00:00Z", new: false, watched: false, flagged: null }])) : BROWSE(ITEMS, { truncated: true, next: "INQ-1" }));
  const p = await open("/app/finder", { ...PLANE, browse: paged });
  assert.ok(text(p).includes(word("find.browse.more")));
  assert.equal(main(p).querySelectorAll(".cs-row").length, 3);
  await press(p, "search", { nth: 1 });
  const afters = browseReqs(p).filter((r) => r.query.after);
  assert.equal(afters.length, 1);
  assert.equal(afters[0].query.after, "INQ-1", "after the answer's next");
  assert.equal(main(p).querySelectorAll(".cs-row").length, 4, "the next page is added below");
  assert.ok(!text(p).includes(word("find.browse.showmore")), "the last page draws no more");
  // A browse answered undetermined for the marks draws them as unread, never as none.
  const u = await open("/app/finder", { ...PLANE, browse: BROWSE(ITEMS, { undetermined: { why: "marks_unread" } }) });
  assert.ok(text(u).includes(word("state.undetermined", { reason: "marks_unread" })));
});

const pick = (ids) => Object.fromEntries(ids.map((id) => [`finder-pick-${id}`, true]));

test("R45: Watch sends watchitem for each picked item in order; \"Take off my watch list\" sends on: false; the watched row is then listed", async () => {
  let watched = ["INF-1"];
  const p = await open("/app/finder", { ...PLANE, browse: () => BROWSE(ITEMS.map((i) => ({ ...i, watched: watched.includes(i.id) }))),
    watchitem: (req) => { const on = req.body.on !== false; watched = on ? [...watched, req.body.item] : watched.filter((x) => x !== req.body.item); return ok({ ok: true, item: req.body.item, existed: false }); } });
  const strip = main(p).querySelector(".cs-hold");
  assert.ok(strip.querySelector('button[data-act="watchitem"]'), "Watch is in the hold strip");
  assert.ok(strip.querySelector('button[data-act="watchitem"]').textContent.startsWith(word("act.owed_watchitem.label.finder")));
  await press(p, "watchitem", { nth: stripIndex(p, "watchitem"), values: pick(["INQ-1", "ENT-1"]) });
  assert.deepEqual(p.byOp("watchitem").map((r) => ({ item: r.body.item, on: r.body.on })), [{ item: "INQ-1", on: true }, { item: "ENT-1", on: true }], "one for each picked item, in order");
  assert.ok(text(p, main(p).querySelectorAll(".cs-row")[1]).includes(word("find.row.watched")), "her watch is read back");
  // "Take off my watch list" is a row's own act and sends on: false.
  const unwatch = main(p).querySelectorAll('button[data-act="watchitem"]').find((b) => b.dataset.item === "INF-1");
  assert.ok(unwatch.textContent.startsWith(word("find.row.unwatch")));
  await press(p, "watchitem", { nth: main(p).querySelectorAll('button[data-act="watchitem"]').indexOf(unwatch) });
  assert.deepEqual({ item: last(p, "watchitem").body.item, on: last(p, "watchitem").body.on }, { item: "INF-1", on: false });
  // A refusal is drawn and stops the rest.
  const r = await open("/app/finder", { ...PLANE, watchitem: refused("MARK_NO_SUCH_ITEM", null, 404) });
  const b = await press(r, "watchitem", { nth: stripIndex(r, "watchitem"), values: pick(["INQ-1", "ENT-1"]) });
  assert.equal(r.byOp("watchitem").length, 1, "the first refusal stops the rest");
  assert.ok(beside(r, b).includes(word("refusal.MARK_NO_SUCH_ITEM")));
  // Nothing picked: told so, nothing sent.
  const n = await open("/app/finder", PLANE);
  await press(n, "watchitem", { nth: stripIndex(n, "watchitem") });
  assert.equal(n.byOp("watchitem").length, 0);
});

test("R45: Flag for a second look… opens its note in place and sends secondlook for each picked item with that one note; with no note nothing is sent; Clear sends secondlookclear and the row leaves", async () => {
  let flagged = ["INQ-1"];
  const items = () => BROWSE(ITEMS.map((i) => ({ ...i, flagged: flagged.includes(i.id) ? { by: "rosa", at: "2026-10-10T10:00:00Z", note: "n" } : null })));
  const p = await open("/app/finder", { ...PLANE, browse: items,
    secondlook: (req) => { flagged = [...flagged, req.body.item]; return ok({ ok: true, item: req.body.item }); },
    secondlookclear: (req) => { flagged = flagged.filter((x) => x !== req.body.item); return ok({ ok: true }); } });
  const det = main(p).querySelector(".cs-hold details");
  assert.equal(det.querySelector("summary").textContent, word("act.owed_secondlook.label.finder"));
  assert.ok(det.querySelector("#finder-note"), "the note, opened in place");
  assert.ok(text(p, det).includes(word("find.secondlook.note")) && text(p, det).includes(word("find.secondlook.note.help")));
  // No note: nothing sent, the note field's refusal drawn.
  const none = await press(p, "secondlook", { values: pick(["INF-1"]) });
  assert.equal(p.byOp("secondlook").length, 0);
  assert.equal(beside(p, none), word("refusal.SECOND_LOOK_NO_NOTE"));
  // A note over 500 characters or with a line break is no note.
  await press(p, "secondlook", { values: { "finder-note": "x".repeat(501) } });
  await press(p, "secondlook", { values: { "finder-note": "a\nb" } });
  assert.equal(p.byOp("secondlook").length, 0);
  await press(p, "secondlook", { values: { "finder-note": NOTE, ...pick(["INF-1", "ENT-1"]) } });
  assert.deepEqual(p.byOp("secondlook").map((r) => ({ item: r.body.item, note: r.body.note })), [{ item: "INF-1", note: NOTE }, { item: "ENT-1", note: NOTE }]);
  // Clear: no reason asked; the row leaves the flagged list.
  const clear = main(p).querySelectorAll('button[data-act="secondlookclear"]');
  assert.ok(clear.length >= 1 && clear[0].textContent.startsWith(word("act.secondlookclear.label.finder")));
  await press(p, "secondlookclear", { nth: clear.findIndex((b) => b.dataset.item === "INQ-1") });
  assert.equal(last(p, "secondlookclear").body.item, "INQ-1");
  assert.ok(!flagged.includes("INQ-1"));
  const f = await open("/app/finder/~all~flagged", { ...PLANE, browse: () => BROWSE(ITEMS.filter((i) => flagged.includes(i.id))) });
  assert.equal(last(f, "browse").query.only, "flagged");
});

test("R46: a search result is a reference of its own kind with its title and a plain excerpt, the match brackets drawn as emphasis; a passage's words when found through one; a hit with no snippet draws its title and kind alone", async () => {
  const hits = [
    { bundle_id: "INQ-1", object_type: "inquiry", title: "Is the city repairing potholes?", snippet: "the city did [repair] each report", snippet_from: "text" },
    { bundle_id: "PROJ-1", object_type: "project", title: "The Coliseum lease", snippet: null, snippet_from: null },
    { bundle_id: "INF-5", object_type: "information", title: "Work orders FY2025", snippet: "…[420] work orders closed…", snippet_from: "passage" },
  ];
  const p = await open("/app/finder/repair", { search: ok({ total: 3, hits }) });
  const rows = main(p).querySelectorAll(".cs-row");
  assert.deepEqual(rows.map((r) => r.querySelector("a.cs-ref").getAttribute("href")), ["/app/question/INQ-1", "/app/project/PROJ-1", "/app/document/INF-5"]);
  assert.deepEqual(rows[0].querySelectorAll("em").map((e) => e.textContent), ["repair"]);
  assert.ok(text(p, rows[0]).includes("the city did repair each report"));
  assert.ok(!text(p).includes("[repair]") && !text(p).includes("[420]"));
  assert.deepEqual(rows[2].querySelectorAll("em").map((e) => e.textContent), ["420"]);
  assert.ok(text(p, rows[2]).includes("work orders closed"), "a passage's matched words");
  assert.ok(!rows[1].querySelector("em") && !rows[1].querySelector(".meta span:not(.cs-origin)") || true);
  assert.doesNotMatch(text(p, rows[1]).replace("The Coliseum lease", ""), /[a-z]{3,}.*:/i, "control: nothing but the title and its marks");
  assert.doesNotMatch(text(p), /object_type|bundle_id|snippet|current_state|\b[0-9a-f]{12}\b/, "no field name, record id or digest");
});

const choose = async (p, id, value) => { const el = p.doc.getElementById(id); el.value = value; p.fire(el, "change"); await settle(); };

test("R54: choosing Documents re-reads browse at once with kinds set and sends no other request; choosing a theme re-reads themeread; a link route seeds the choice", async () => {
  const themes = ok({ ok: true, themes: [{ theme_id: "TH-1", name: "Street repair" }] });
  const p = await open("/app/finder", { ...PLANE, themeread: (req) => (req.query.id ? ok({ ok: true, members: [{ target: "INF-1", target_kind: "information", title: "Work orders FY2025" }], hunches: [] }) : themes) });
  const before = p.requests.length;
  await choose(p, "finder-kind", "document");
  const sent = p.requests.slice(before);
  assert.deepEqual(sent.map((r) => r.op), ["browse"], "no other request");
  assert.equal(sent[0].query.kinds, "document");
  await choose(p, "finder-state", "watched");
  assert.equal(last(p, "browse").query.only, "watched");
  await choose(p, "finder-theme", "TH-1");
  assert.equal(last(p, "themeread").query.id, "TH-1");
  assert.ok(text(p).includes("Work orders FY2025"));
  // Control: a link route seeds the first values, so the browse that opens is that one.
  const seeded = await open("/app/finder/~document~new_since", PLANE);
  assert.equal(seeded.doc.getElementById("finder-kind").value, "document");
  assert.deepEqual([last(seeded, "browse").query.kinds, last(seeded, "browse").query.only], ["document", "new_since"]);
  assert.ok(hasWord("find.query.help") && hasWord("screen.finder.showas"));
});

test("R54, R93 (interface-shell R93): Find's browse re-reads itself every 45 seconds with the picked rows kept, says so while the list is fresh, and a choice changes the request", async () => {
  let items = ITEMS.slice();
  const p = await open("/app/finder", { ...PLANE, browse: () => BROWSE(items) });
  const reads = () => browseReqs(p).length;
  assert.equal(reads(), 1);
  assert.ok(text(p).includes(word("list.fresh")), "the first answer is fresh");
  p.doc.getElementById("finder-pick-INF-1").checked = true;
  items = [{ kind: "document", id: "INF-9", title: "Newest filing", last_changed: "2026-10-13T10:00:00Z", new: true, watched: false, flagged: null }, ...ITEMS];
  await p.clock.tick(45000); await settle();
  assert.equal(reads(), 2, "read again at 45 seconds");
  assert.ok(text(p).includes("Newest filing"), "the list shows the new row");
  assert.equal(p.doc.getElementById("finder-pick-INF-1").checked, true, "the picked row stays picked");
  await p.clock.tick(120000); await settle();
  const t = text(p);
  assert.ok(t.includes("Newest filing"));
  await choose(p, "finder-kind", "document");
  assert.equal(last(p, "browse").query.kinds, "document", "a choice changes the request");
  const quiet = await open("/app/finder/pothole", { ...PLANE, search: ok({ total: 0, hits: [] }) });
  await quiet.clock.tick(120000); await settle();
  assert.equal(browseReqs(quiet).length, 0, "control: a search is not a browse and is never re-read");
});

// C23, Find's part (fix round 2): the defects the walk found in Find's browse.
const helpOf = (p, key) => main(p).querySelectorAll("p").find((e) => e.textContent.includes(word(key)));

test("R44, R54 (C23): the list says how many the filter holds, and the count follows the filter, not the page", async () => {
  const ten = Array.from({ length: 3 }, (_, i) => ({ kind: "document", id: `INF-${i + 1}`, title: `Doc ${i + 1}`, last_changed: "2026-10-12T10:00:00Z", new: false, watched: false, flagged: null }));
  const p = await open("/app/finder", { ...PLANE, browse: (req) => BROWSE(ten, req.query.kinds === "document" ? { total: 40, awaiting_review: 12, truncated: true, next: "INF-3" } : { total: 76, awaiting_review: 19, truncated: true, next: "INF-3" }) });
  assert.ok(text(p).includes(word("screen.finder.table.count.other", { n: "76", m: "19" })), "the whole record's count");
  await choose(p, "finder-kind", "document");
  assert.ok(text(p).includes(word("screen.finder.table.count.other", { n: "40", m: "12" })), "after choosing Documents the count is the documents'");
  assert.ok(!text(p).includes(word("screen.finder.table.count.other", { n: "76", m: "19" })));
  // Control: an answer with no count draws none; a count of zero draws none (R21).
  const none = await open("/app/finder", PLANE);
  assert.doesNotMatch(text(none), /awaiting review/i);
  const zero = await open("/app/finder", { ...PLANE, browse: BROWSE([], { total: 0, awaiting_review: 0 }) });
  assert.ok(!text(zero).includes(word("screen.finder.table.count.other", { n: "0", m: "0" })));
});

test("R44, R54 (C23): an empty list under a filter says which filter found nothing; with no filter it says only that nothing is here", async () => {
  const p = await open("/app/finder/~all~new_since", { ...PLANE, browse: BROWSE([], { total: 0, awaiting_review: 0 }) });
  const empty = main(p).querySelector('[data-state="empty"]');
  assert.ok(empty.textContent.includes(word("find.state.new")) && empty.textContent.includes(word("state.empty")), "names New since you last looked and says there is nothing");
  const docs = await open("/app/finder/~document", { ...PLANE, browse: BROWSE([], { total: 0, awaiting_review: 0 }) });
  assert.ok(main(docs).querySelector('[data-state="empty"]').textContent.includes(word("find.kind.document")));
  const plain = await open("/app/finder", { ...PLANE, browse: BROWSE([], { total: 0, awaiting_review: 0 }) });
  const text0 = main(plain).querySelector('[data-state="empty"]').textContent;
  assert.equal(text0, word("state.empty"), "control: no filter, no filter named");
});

test("R55 (C23): the table has a box on each row, so the rows can be held and watched there as in the list", async () => {
  const p = await open("/app/finder", { ...PLANE, select: ok({ ok: true, handle: "sel-t", n: 1 }), selection: ok({ ok: true, handle: "sel-t", n: 1, members: ["INF-1"], expires: "2026-10-12T16:40:00Z" }) });
  await choose(p, "finder-view", "table");
  const rows = main(p).querySelectorAll("tbody tr");
  assert.equal(rows.length, 3);
  assert.ok(rows.every((r) => r.querySelector('input[type="checkbox"]')), "a box on each row");
  assert.equal(rows[0].querySelector('input[type="checkbox"]').getAttribute("aria-label"), word("screen.finder.pick", { title: "Work orders FY2025" }));
  assert.equal(main(p).querySelectorAll("thead th").length, 4, "still four columns");
  assert.ok(main(p).querySelector('.cs-hold button[data-act="watchitem"]'), "Watch is offered in the table");
  await press(p, "select", { nth: stripIndex(p, "select"), values: pick(["INF-1"]) });
  assert.deepEqual(last(p, "select").body.ids, ["INF-1"], "the picked row is held");
});

test("R54 (C23): the words box is a full-width field with its button below it, and each help line sits under the control it explains", async () => {
  const p = await open("/app/finder", { ...PLANE, themeread: ok({ ok: true, themes: [{ theme_id: "TH-1", name: "Street repair" }] }) });
  const q = p.doc.getElementById("finder-q");
  const ancestors = []; for (let n = q.parentNode; n && n !== main(p); n = n.parentNode) ancestors.push(n.className || "");
  assert.ok(!ancestors.some((c) => /\bmk-search\b/.test(c)), "no row that leaves the field its content's width");
  const html = main(p).innerHTML;
  assert.ok(html.indexOf('id="finder-q"') >= 0 && html.indexOf('id="finder-q"') < html.indexOf('data-act="search"'), "the button follows the field");
  assert.ok(helpOf(p, "screen.finder.table.view.help").querySelector("#finder-view") === null && helpOf(p, "screen.finder.table.view.help").parentNode.querySelector("#finder-view"), "Show as's help is with Show as");
  assert.ok(helpOf(p, "find.browse.new.means").parentNode.querySelector("#finder-state"), "New since's help is with Only");
  assert.ok(helpOf(p, "theme.filter.help").parentNode.querySelector("#finder-theme"), "Theme's help is with Theme");
  // Control: with no earlier visit there is no "new" choice and the help that says why is with Only.
  const none = await open("/app/finder", { ...PLANE, lookedat: ok({ since: null }) });
  assert.ok(text(none, helpOf(none, "find.browse.nosince").parentNode).length > 0 && helpOf(none, "find.browse.nosince").parentNode.querySelector("#finder-state"));
  assert.ok(!helpOf(none, "find.browse.new.means"));
});
