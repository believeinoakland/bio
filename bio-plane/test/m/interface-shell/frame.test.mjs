/* interface-shell R7, R8, R9, R20, R25, R26: the working frame, the path, the router, the dock, Settings and the rail. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { PATHS } from "../../../src/interface-shell/index.mjs";
import { boot, ok, refused, silent, pending } from "./harness.mjs";
import { ALL, ASSISTANT } from "./screens.fixture.mjs";

const IMAGE = ok({ title: "A lease", pages: 3, grade: "B", why: "w", project: { id: "P1", title: "Pothole repairs" }, passages: [{ n: 1, text: "Closed" }] });
const HELDA = ok({ items: [{ id: "h1", title: "Minutes", at: "2026-10-01" }] });
const PLANE = { image: IMAGE, heldcaptures: HELDA, projectdirectory: ok({ projects: [] }) };
const en = (k) => (WORD_ROWS.find((r) => r[0] === k) || [])[1];
const texts = (els) => els.map((e) => e.textContent.trim());

test("R7 the masthead: the group's name (groupidentity, read once), search opening Find, the explanation-level control, the To do count from op=queue, the member's initial; no assistant button while not reachable", async () => {
  const p = await boot({ screens: ALL, plane: PLANE });
  const mast = p.root().querySelector(".cs-mast");
  assert.equal(mast.querySelector(".grp").textContent, "River Town");
  assert.equal(p.byOp("groupidentity").length, 1);
  await p.click('a[href="/app/settings"]');
  assert.equal(p.byOp("groupidentity").length, 1, "read once");
  const m = p.root().querySelector(".cs-mast");
  assert.equal(m.querySelector('a[href="/app/find"]').textContent, "Search");
  assert.ok(m.querySelector('[data-shell="level"]').textContent.includes(en("level.prompt.name")));
  assert.equal(m.querySelector('[data-kind="todo"]').textContent, "2 to do");
  assert.equal(m.querySelector('[data-shell="menu"] [aria-hidden]').textContent, "M");
  assert.equal(m.querySelector('[data-shell="dock"]'), null);
  /* the slug when no display name */
  const q = await boot({ screens: ALL, plane: { ...PLANE, groupidentity: ok({ ok: true, group: "river-town", display_name: null }) } });
  assert.equal(q.root().querySelector(".cs-mast .grp").textContent, "river-town");
});

test("R7 the band (mark.band.means with mark.path.working.*), the rail's seven places in order with rail.<k>.name and guidance rail.<k>.holds, one column of work, and at the phone width the five tabs Home, Queue, Add, Find, More", async () => {
  const p = await boot({ screens: ALL, plane: PLANE });
  const band = p.root().querySelector(".cs-band");
  assert.equal(band.getAttribute("data-band"), "working");
  assert.equal(band.textContent, en("mark.path.working.name"));
  assert.ok(band.querySelector("[data-tip]").getAttribute("data-tip").startsWith(en("mark.band.means").replace(/'/g, "&#39;")));
  const rail = p.root().querySelectorAll(".cs-rail a");
  assert.deepEqual(texts(rail), ["home", "queue", "find", "add", "projects", "people", "settings"].map((k) => en("rail." + k + ".name")));
  rail.forEach((a, i) => assert.ok(a.getAttribute("data-tip").length > 10, i));
  assert.equal(p.root().querySelectorAll("main").length, 1);
  const tabs = p.root().querySelectorAll(".cs-tabs a");
  assert.deepEqual(texts(tabs), [en("rail.home.name"), en("rail.queue.name"), en("rail.add.name"), en("rail.find.name"), en("tab.more.name")]);
  assert.ok(rail[0].hasAttribute("aria-current"));
  const more = await boot({ screens: ALL, path: "/app/more" });
  assert.deepEqual(texts(more.root().querySelectorAll("#cs-main .cs-list a")), [en("rail.projects.name"), en("rail.people.name"), en("rail.settings.name")]);
  assert.ok(more.root().querySelectorAll(".cs-tabs a")[4].hasAttribute("aria-current"));
});

test("R7 a place whose screens are not built (People) is shown and opens a screen saying, in its words, that it comes later", async () => {
  const p = await boot({ screens: ALL });
  await p.click('.cs-rail a[href="/app/people"]');
  const main = p.root().querySelector("#cs-main");
  assert.ok(main.textContent.includes("People comes later"));
  assert.ok(p.root().querySelector('.cs-rail a[href="/app/people"]').hasAttribute("aria-current"));
});

test("R8 every screen opens its main area with its path, from its rail place to its own name (last, the current page), each earlier step a link, the project's step its title as read", async () => {
  const p = await boot({ screens: ALL, path: "/app/document/c1", plane: PLANE });
  const nav = p.root().querySelector("#cs-main").children[0];
  assert.equal(nav.localName, "nav");
  assert.equal(nav.getAttribute("aria-label"), "Where you are");
  const steps = nav.querySelectorAll("li");
  assert.deepEqual(texts(steps), ["Projects", "Pothole repairs", "Document"]);
  assert.equal(steps[0].querySelector("a").getAttribute("href"), "/app/projects");
  assert.equal(steps[1].querySelector("a").getAttribute("href"), "/app/project/P1");
  assert.equal(steps[2].querySelector("a"), null);
  assert.equal(steps[2].querySelector("[aria-current=page]").textContent, "Document");
  assert.equal(p.root().querySelector("#cs-main").children[1].textContent, "A lease", "the heading below names the thing shown");
  const h = await boot({ screens: ALL, path: "/app/held", plane: PLANE });
  assert.deepEqual(texts(h.root().querySelectorAll(".cs-crumbs li")), ["Add", "Held captures"]);
  const m = await boot({ screens: ALL, path: "/app/members" });
  assert.deepEqual(texts(m.root().querySelectorAll(".cs-crumbs li")), ["Settings", "Members"]);
});

test("R8 each screen's path is mock-shell.js' PATH for its id at 3f40899950, a project's step its title (members: Settings › Members; held: Add › Held captures; document: Projects › <project> › Document)", () => {
  const src = execFileSync("git", ["show", "3f40899950:docs/development/ux-substrate/screens/mock-shell.js"], { encoding: "utf8" });
  const PATH = new Function(/(const PATH = \{[\s\S]*?\n\};)/.exec(src)[1] + "; return PATH;")();
  const PROJECTS = new Set(["The Coliseum lease", "Pothole repairs"]);
  const step = (s) => (s === "@project" ? "@project" : en(/^screen\./.test(s) ? s : "rail." + s + ".name"));
  for (const [id, steps] of Object.entries(PATHS)) {
    const mock = id === "answers" ? ["Find", "Ask"] : PATH[id].map((x) => (PROJECTS.has(x) ? "@project" : x));
    assert.deepEqual(steps.map(step), mock, id);
  }
  assert.deepEqual(PATHS.members.map(step), ["Settings", "Members"]);
  assert.deepEqual(PATHS.held.map(step), ["Add", "Held captures"]);
  assert.deepEqual(PATHS.document.map(step), ["Projects", "@project", "Document"]);
});

test("R9 the router maps /app to home and /app/<screen>[/<subject>] to that screen with that subject, keeps the browser's history (back and forward redraw), and answers an unknown screen or a subject the read does not find with Nothing here, never a blank page", async () => {
  const p = await boot({ screens: ALL, plane: PLANE });
  assert.ok(p.root().querySelector("#cs-main h1").textContent.includes("home"));
  await p.click('.cs-rail a[href="/app/settings"]');
  assert.equal(p.location.pathname, "/app/settings");
  await p.back("/app");
  assert.ok(p.root().querySelector("#cs-main h1").textContent.includes("home"));
  await p.back("/app/document/c1");
  assert.equal(p.byOp("image").at(-1).query.id, "c1");
  assert.equal(p.root().querySelector("#cs-main h1").textContent, "A lease");
  for (const [path, plane] of [["/app/nowhere", PLANE], ["/app/document/zz", { ...PLANE, image: refused("NO_SUCH_CAPTURE", "No such capture.") }], ["/app/document/zz", { ...PLANE, image: ok(null) }]]) {
    const q = await boot({ screens: ALL, path, plane });
    const main = q.root().querySelector("#cs-main");
    assert.ok(main.querySelector('[data-state="empty"]'), path);
    assert.ok(main.textContent.includes("Nothing here"), path);
  }
  /* control: a read that failed for another reason is "could not read", not "Nothing here" */
  const f = await boot({ screens: ALL, path: "/app/document/zz", plane: { ...PLANE, image: refused("NOT_ALLOWED", "Not yours.") } });
  assert.ok(f.root().querySelector('#cs-main [data-state="failed"]'));
});

test("R20 the assistant is reachable when assistantstate answers on and the member's own reference, a connected subscription, or the group's key held and on serves; then the masthead's button opens the dock with screens-inquiry's panel beside the screen; otherwise no assistant control anywhere", async () => {
  const reach = async (plane) => boot({ screens: ALL, path: "/app/document/c1", plane: { ...PLANE, ...plane } });
  const ON = { assistantstate: ok({ on: true }) };
  for (const plane of [{ ...ON, accountreference: ok({ held: true }) }, { ...ON, subscriptionsignin: ok({ connected: true }) }, { ...ON, groupkeystate: ok({ held: true, on: true }) }, { ...ON, groupkeystate: ok({ on: true }) }]) {
    const p = await reach(plane);
    const b = p.root().querySelector('.cs-mast [data-shell="dock"]');
    assert.ok(b, JSON.stringify(plane));
    assert.equal(p.root().querySelector(".cs-dock"), null);
    await p.click(b);
    const dock = p.root().querySelector(".cs-dock");
    assert.ok(dock.querySelector('button[data-act="airunopen"]'));
    assert.ok(p.root().querySelector("#cs-frame").classList.contains("with-dock"));
    assert.ok(p.root().querySelector("#cs-main"), "beside the screen it serves");
    await p.click(dock.querySelector('button[data-act="airunopen"]'));
    assert.deepEqual(p.byOp("airunopen")[0].body.context, { screen: "document", subject: "c1" });
  }
  const NOT = [{ assistantstate: ok({ on: false }), accountreference: ok({ held: true }) }, { ...ON }, { ...ON, groupkeystate: ok({ held: true, on: false }) },
    { ...ON, groupkeystate: ok({ held: false, on: true }) }, { assistantstate: silent, accountreference: ok({ held: true }) },
    { ...ON, accountreference: refused("NOT_YOUR_ACCOUNT") }, { assistantstate: pending, accountreference: ok({ held: true }) }];
  for (const plane of NOT) {
    const p = await reach(plane);
    assert.equal(p.root().querySelector('[data-shell="dock"]'), null, JSON.stringify(plane));
    assert.equal(p.root().querySelector(".cs-dock"), null);
    assert.equal(p.root().querySelector('[data-act="airunopen"]'), null);
  }
  assert.deepEqual(ALL.map((s) => s.id).includes(ASSISTANT.id), true);
});

test("R25 the Settings place offers Group settings, a link to the setup page's panel (/), beside the settings screens registered", async () => {
  const p = await boot({ screens: ALL });
  await p.click('.cs-rail a[href="/app/settings"]');
  const list = p.root().querySelectorAll("#cs-main .cs-list a");
  const g = list.find((a) => a.getAttribute("href") === "/");
  assert.equal(g.textContent, "Group settings");
  assert.ok(g.getAttribute("data-tip").includes("who your group is"));
  assert.equal(g.hasAttribute("data-nav"), false, "a real page change, to the setup page");
  assert.ok(list.some((a) => a.getAttribute("href") === "/app/members" && a.textContent === "Members"));
  assert.deepEqual(texts(p.root().querySelectorAll(".cs-crumbs li")), ["Settings"]);
});

test("R26 the rail's width: 184 px by default, 64 to 320, set by the keyboard (arrows, Home resets) or by dragging its edge, kept on the device and never sent; the tabs unchanged by it; a storage that cannot be read or written leaves the default", async () => {
  const p = await boot({ screens: ALL });
  const frame = () => p.root().querySelector("#cs-frame");
  assert.match(frame().getAttribute("style"), /--rail:184px/);
  const grip = () => p.root().querySelector('[data-shell="grip"]');
  assert.equal(grip().getAttribute("aria-valuemin"), "64");
  assert.equal(grip().getAttribute("aria-valuemax"), "320");
  grip().focus();
  p.fire(grip(), "keydown", { key: "ArrowRight" }); await p.settle();
  assert.match(frame().getAttribute("style"), /--rail:192px/);
  for (let i = 0; i < 40; i++) p.fire(grip(), "keydown", { key: "ArrowRight" });
  await p.settle();
  assert.match(frame().getAttribute("style"), /--rail:320px/);
  for (let i = 0; i < 60; i++) p.fire(grip(), "keydown", { key: "ArrowLeft" });
  await p.settle();
  assert.match(frame().getAttribute("style"), /--rail:64px/);
  assert.ok(frame().classList.contains("rail-icons"));
  assert.equal(p.local.get("cs-railw"), "64");
  p.fire(grip(), "keydown", { key: "Home" }); await p.settle();
  assert.match(frame().getAttribute("style"), /--rail:184px/);
  /* dragging */
  p.fire(grip(), "pointerdown", { clientX: 184 });
  for (const f of p.win.listeners.pointermove || []) f({ clientX: 250 });
  for (const f of p.win.listeners.pointerup || []) f({});
  await p.settle();
  assert.match(frame().getAttribute("style"), /--rail:250px/);
  assert.equal(p.local.get("cs-railw"), "250");
  for (const r of p.requests) assert.ok(!JSON.stringify(r).includes("250") && !/railw/.test(JSON.stringify(r)));
  assert.equal(p.root().querySelector(".cs-tabs").getAttribute("style"), null);
  const q = await boot({ screens: ALL, local: { "cs-railw": "250" } });
  assert.match(q.root().querySelector("#cs-frame").getAttribute("style"), /--rail:250px/);
  for (const bad of [{ local: { "cs-railw": "900" } }, { localThrows: true }]) {
    const r = await boot({ screens: ALL, ...bad });
    assert.match(r.root().querySelector("#cs-frame").getAttribute("style"), /--rail:184px/);
  }
});

