/* interface-shell R7, R8, R9, R20, R25, R26: the working frame, the path, the router, the dock, Settings and the rail. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { PATHS, FRAMES } from "../../../src/interface-shell/index.mjs";
import { boot, ok, refused, silent, pending, httpError, STORE_KEY } from "./harness.mjs";
import { ALL, ASSISTANT, FRONT, DOORBELL, PUBLISHED, JOIN, PERSON } from "./screens.fixture.mjs";

const IMAGE = ok({ title: "A lease", pages: 3, grade: "B", why: "w", project: { id: "P1", title: "Pothole repairs" }, passages: [{ n: 1, text: "Closed" }] });
const HELDA = ok({ items: [{ id: "h1", title: "Minutes", at: "2026-10-01" }] });
const PLANE = { image: IMAGE, heldcaptures: HELDA, projectdirectory: ok({ projects: [] }) };
const en = (k) => (WORD_ROWS.find((r) => r[0] === k) || [])[1];
const texts = (els) => els.map((e) => e.textContent.trim());
/* an act pressed through whatever friction its weight asks (R11) */
async function press(p, op) {
  await p.click(`button[data-act="${op}"]`);
  const go = p.root().querySelector('[data-shell="reason-send"], [data-shell="confirm"]');
  if (go) { const ta = p.root().querySelector('[data-slot] textarea'); if (ta) ta.value = "because"; await p.click(go); }
}

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

test("R7 R37 a place none of whose screens is registered is shown and opens the shell's page saying, in its words, that it comes later", async () => {
  const p = await boot({ screens: ALL });
  await p.click('.cs-rail a[href="/app/people"]');
  const main = p.root().querySelector("#cs-main");
  assert.ok(main.textContent.includes("People comes later"));
  assert.ok(p.root().querySelector('.cs-rail a[href="/app/people"]').hasAttribute("aria-current"));
});

test("R37 the People place opens people and the Settings place opens settings once registered; no working screen draws a link to / (control: before, the shell's settings list names no /)", async () => {
  const people = { id: "people", reads: () => ({}), acts: [], render: (cs) => cs.title() };
  const settings = { id: "settings", reads: () => ({}), acts: [], render: (cs) => cs.title() };
  const p = await boot({ screens: [...ALL, people, settings] });
  const rail = (k) => p.root().querySelector(".cs-rail a[href='/app/" + k + "']");
  assert.ok(rail("people") && rail("settings"));
  await p.click(rail("people"));
  assert.equal(p.root().querySelector("#cs-main").getAttribute("data-screen"), "people");
  assert.ok(p.root().querySelector('.cs-rail a[href="/app/people"]').hasAttribute("aria-current"));
  await p.click(rail("settings"));
  assert.equal(p.root().querySelector("#cs-main").getAttribute("data-screen"), "settings");
  for (const path of ["/app", "/app/held", "/app/document/c1", "/app/members", "/app/settings", "/app/people", "/app/more"]) {
    const q = await boot({ screens: [...ALL, people, settings], path, plane: PLANE });
    assert.equal(q.root().querySelectorAll('a[href="/"]').length, 0, path);
  }
  const r = await boot({ screens: ALL, path: "/app/settings" });
  assert.equal(r.root().querySelectorAll('a[href="/"]').length, 0);
  assert.deepEqual(texts(r.root().querySelectorAll("#cs-main .cs-list a")), ["Members"], "the settings screens registered");
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

const pathAt = (commit) => {
  const src = execFileSync("git", ["show", commit + ":docs/development/ux-substrate/screens/mock-shell.js"], { encoding: "utf8" });
  return new Function(/(const PATH = \{[\s\S]*?\n\};)/.exec(src)[1] + "; return PATH;")();
};
const PROJECTS = new Set(["The Coliseum lease", "Pothole repairs", "Sewer fund transfers"]);
const SHELL_EN = new Map((await import("../../../src/interface-shell/index.mjs")).SHELL_WORDS.map((r) => [r[0], r[1]]));
const DESIGN_EN = new Map((await import("../../../src/interface-shell/index.mjs")).DESIGN_WORDS.map((r) => [r[0], r[1]]));
const step = (s) => (s === "@project" ? "@project" : /^shell\./.test(s) ? SHELL_EN.get(s) : /^screen\./.test(s) ? en(s) ?? DESIGN_EN.get(s) : en("rail." + s + ".name"));
const T46 = ["home", "queue", "inbox", "finder", "answers", "capture", "held", "open-file", "find-in", "project", "document", "question", "assistant", "members", "account", "connect", "notes"];

test("R8 each screen's path is mock-shell.js' PATH for its id at 3f40899950, a project's step its title (members: Settings › Members; held: Add › Held captures; document: Projects › <project> › Document)", () => {
  const PATH = pathAt("3f40899950");
  for (const id of T46) {
    const mock = id === "answers" ? ["Find", "Ask"] : PATH[id].map((x) => (PROJECTS.has(x) ? "@project" : x));
    assert.deepEqual(PATHS[id].map(step), mock, id);
  }
  assert.deepEqual(PATHS.members.map(step), ["Settings", "Members"]);
  assert.deepEqual(PATHS.held.map(step), ["Add", "Held captures"]);
  assert.deepEqual(PATHS.document.map(step), ["Projects", "@project", "Document"]);
});

test("R28 every screen of the new screen modules has its path from mock-shell.js' PATH at a0fab7abf0 (plan: Projects › <project> › Action plan; wizards: Settings › Wizards; due-date: Queue › Due date; person: People › Person), and L11's screens from PATH at PR #33's head; the public, published and setup frames have none", async () => {
  const A = pathAt("a0fab7abf0"), B = pathAt("f90b187c7b");
  const NEW = ["wizards", "person", "explore", "timeline", "money", "calculation", "proceeding", "due-date", "standard", "ties", "case-editor", "review-copy", "ceremony", "imported", "docket", "plan", "start-send", "request", "action", "matter", "archive", "group-identity", "security", "translations"];
  for (const id of NEW) assert.deepEqual(PATHS[id].map(step), A[id].map((x) => (PROJECTS.has(x) ? "@project" : x)), id);
  for (const id of ["people", "settings", "projects", "group", "places", "recovery"]) assert.deepEqual(PATHS[id].map(step), B[id], id);
  assert.deepEqual(PATHS.plan.map(step), ["Projects", "@project", "Action plan"]);
  assert.deepEqual(PATHS.wizards.map(step), ["Settings", "Wizards"]);
  assert.deepEqual(PATHS["due-date"].map(step), ["Queue", "Due date"]);
  assert.deepEqual(PATHS.person.map(step), ["People", "Person"]);
  for (const [id, frame] of Object.entries(FRAMES)) if (frame !== "dock") assert.equal(PATHS[id], undefined, id);
  /* drawn: a person's path with its place linked */
  const p = await boot({ screens: [...ALL, PERSON], path: "/app/person/x1", plane: { person: ok({ name: "Dana Ruiz" }) } });
  assert.deepEqual(texts(p.root().querySelectorAll(".cs-crumbs li")), ["People", "Person"]);
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
    assert.ok(main.textContent.includes("Nothing is here"), path);
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


test("R9 /app/review maps to review-outside (screens-publish R17), drawn in its published frame", async () => {
  const review = { id: "review-outside", reads: () => ({}), acts: [], render: (cs) => cs.title() };
  const p = await boot({ screens: [...ALL, review], path: "/app/review", session: null });
  assert.equal(p.root().querySelector("#cs-main").getAttribute("data-screen"), "review-outside");
  assert.equal(p.root().querySelector("#cs-frame").getAttribute("data-frame"), "published");
  /* control: another address under /app/review/ keeps its subject */
  const q = await boot({ screens: [...ALL, review], path: "/app/review/abc", session: null });
  assert.equal(q.root().querySelector("#cs-main").getAttribute("data-screen"), "review-outside");
});

test("R35 unavailable: an unknown screen or subject draws Nothing is here; NOT_VISIBLE and NOT_A_PARTICIPANT draw You can't open this; no answer or a 5xx draws can't be reached, tried again every 30 seconds in the background, what was typed kept", async () => {
  const states = [["/app/nowhere", {}, "nothing"], ["/app/document/zz", { image: refused("NO_SUCH_CAPTURE") }, "nothing"], ["/app/document/zz", { image: ok(null) }, "nothing"],
    ["/app/document/zz", { image: refused("NOT_VISIBLE", "Not yours.") }, "notyours"], ["/app/document/zz", { image: refused("NOT_A_PARTICIPANT") }, "notyours"],
    ["/app/document/zz", { image: silent }, "unreachable"], ["/app/document/zz", { image: httpError(503) }, "unreachable"]];
  const SAY = { nothing: "Nothing is here", notyours: "You can't open this", unreachable: "can't be reached" };
  for (const [path, plane, kind] of states) {
    const p = await boot({ screens: ALL, path, plane: { ...PLANE, ...plane } });
    const u = p.root().querySelector("[data-unavailable]");
    assert.equal(u && u.getAttribute("data-unavailable"), kind, path + " " + JSON.stringify(plane));
    assert.ok(p.root().querySelector("#cs-main").textContent.includes(SAY[kind]), kind);
    assert.equal(p.root().querySelector("#cs-main h1").textContent, "Can't open this");
  }
  /* control: a read that failed for another reason is "could not read", not unavailable */
  const f = await boot({ screens: ALL, path: "/app/document/zz", plane: { ...PLANE, image: refused("NOT_ALLOWED", "Not yours.") } });
  assert.equal(f.root().querySelector("[data-unavailable]"), null);
  assert.ok(f.root().querySelector('#cs-main [data-state="failed"]'));
  /* retried every 30 seconds, in the background; what was typed comes back with the screen */
  let up = false;
  const form = { id: "document", reads: (view) => ({ d: { op: "image", query: { id: view.subject }, subject: true } }), acts: [],
    render: (cs, view) => cs.state("d", view, (d) => cs.title(d.title)) + cs.field("note", "shell.reason") };
  const r = await boot({ screens: [form], path: "/app/document/c1", plane: { image: () => (up ? IMAGE : silent) } });
  assert.ok(r.root().querySelector('[data-unavailable="unreachable"]'));
  up = true;
  await r.clock.tick(29_999);
  assert.ok(r.root().querySelector('[data-unavailable="unreachable"]'));
  await r.clock.tick(1);
  assert.equal(r.root().querySelector("[data-unavailable]"), null);
  assert.equal(r.byOp("image").at(-1).query.background, "1");
  r.doc.getElementById("note").value = "typed";
  up = false;
  await r.click('a[href="/app/document/c1"]') .catch(() => null);
  await r.back("/app/document/c1");
  assert.ok(r.root().querySelector('[data-unavailable="unreachable"]'));
});

test("R35 what was typed is kept while the screen can't be reached and comes back with it", async () => {
  let up = true;
  const s = { id: "document", reads: (view) => ({ d: { op: "image", query: { id: view.subject }, subject: true } }), acts: [{ op: "cite", send: () => ({ body: {} }) }],
    render: (cs, view) => cs.state("d", view, (d) => cs.title(d.title)) + cs.field("note", "shell.reason") + cs.act("cite") };
  const p = await boot({ screens: [s], path: "/app/document/c1", plane: { image: () => (up ? IMAGE : silent) } });
  p.doc.getElementById("note").value = "kept words";
  up = false;
  await p.click('button[data-act="cite"]');
  assert.ok(p.root().querySelector('[data-unavailable="unreachable"]'), "the re-read after the act found nobody");
  up = true;
  await p.clock.tick(30_000);
  assert.equal(p.doc.getElementById("note").value, "kept words");
});

test("R30 a screen of the public or published frame is drawn without a session: no session record asked, no whoami, no rail, tabs, dock or member menu, and only public ops, each with no Authorization header", async () => {
  for (const [path, screen, session] of [["/app/doorbell", "doorbell", null], ["/app/doorbell", "doorbell", undefined], ["/app/published/c9", "published", null]]) {
    const opts = { screens: [...ALL, DOORBELL, PUBLISHED], path, plane: { publishedcase: ok({ title: "The case" }) } };
    if (session === null) opts.session = null;
    const p = await boot(opts);
    assert.equal(p.root().querySelector("#cs-main").getAttribute("data-screen"), screen, path);
    assert.equal(p.byOp("whoami").length, 0, path);
    for (const sel of [".cs-rail", ".cs-tabs", ".cs-dock", '[data-shell="menu"]', ".cs-mast"]) assert.equal(p.root().querySelector(sel), null, sel);
    for (const r of p.requests) assert.equal(r.headers.Authorization, undefined, r.op);
  }
  const p = await boot({ screens: [...ALL, DOORBELL], path: "/app/doorbell", session: null });
  p.doc.getElementById("d-what").value = "a leaked memo";
  await p.click('button[data-act="knock"]');
  assert.equal(p.byOp("knock")[0].headers.Authorization, undefined);
  assert.deepEqual(p.byOp("knock")[0].body, { text: "a leaked memo" });
  /* control: /app/home with no record still draws front, never the working frame */
  const q = await boot({ screens: [...ALL, FRONT], path: "/app/home", session: null });
  assert.equal(q.root().querySelector("#cs-main").getAttribute("data-screen"), "front");
  assert.equal(q.byOp("whoami").length, 0);
});

test("R45 a screen of the setup frame is drawn without rail, tabs or dock, with or without a record: before one, no whoami and only public ops with no header; once its own act has made one, the acts R12 allows", async () => {
  const plane = { enroll: ok({ ok: true }), login: ok({ token: "tok-j", expires: 0 }), invitelook: ok({ ok: true }) };
  const p = await boot({ screens: [...ALL, JOIN], path: "/app/join", session: null, plane });
  assert.equal(p.root().querySelector("#cs-frame").getAttribute("data-frame"), "setup");
  for (const sel of [".cs-rail", ".cs-tabs", ".cs-dock", ".cs-mast"]) assert.equal(p.root().querySelector(sel), null, sel);
  assert.equal(p.byOp("whoami").length, 0);
  assert.ok(p.root().querySelector('button[data-act="enroll"]'), "a public act drawn");
  assert.equal(p.root().querySelector('button[data-act="memberlanguageset"]'), null, "a member's act is not, before a session");
  p.doc.getElementById("j-handle").value = "newbie";
  await press(p, "enroll");
  assert.equal(p.byOp("enroll")[0].headers.Authorization, undefined);
  assert.equal(p.byOp("login")[0].headers.Authorization, undefined);
  assert.equal(p.byOp("whoami")[0].headers.Authorization, "Bearer tok-j");
  assert.equal(p.location.pathname, "/app/join", "stays on the screen");
  assert.ok(p.root().querySelector('button[data-act="memberlanguageset"]'), "R12 now allows the member's act");
  await press(p, "memberlanguageset");
  assert.equal(p.byOp("memberlanguageset")[0].headers.Authorization, "Bearer tok-j");
  /* control: R3's front does not apply: /app/join with no record draws join and sends no header */
  const q = await boot({ screens: [...ALL, JOIN, FRONT], path: "/app/join", session: null });
  assert.equal(q.root().querySelector("#cs-main").getAttribute("data-screen"), "join");
  for (const r of q.requests) assert.equal(r.headers.Authorization, undefined, r.op);
});

test("R36 /#invite= and /#join= forward to /app/join, /#boot= to /app/setup, the fragment carried (and read once, R46) and nothing else; no fragment reaches a request", async () => {
  const setup = { id: "setup", reads: () => ({}), acts: [], render: (cs, view) => "<p id=frag>" + cs.esc(JSON.stringify(view.fragment)) + "</p>" };
  const join = { id: "join", reads: () => ({}), acts: [], render: (cs, view) => "<p id=frag>" + cs.esc(JSON.stringify(view.fragment)) + "</p>" };
  for (const [hash, to, frag] of [["#invite=INV-123", "/app/join", { invite: "INV-123" }], ["#join=JL-9", "/app/join", { join: "JL-9" }], ["#boot=BOOT-SECRET", "/app/setup", { boot: "BOOT-SECRET" }]]) {
    const p = await boot({ screens: [...ALL, setup, join], path: "/", hash, session: null });
    assert.equal(p.location.pathname, to, hash);
    assert.equal(p.location.hash, "", "removed from the address");
    assert.deepEqual(JSON.parse(p.doc.getElementById("frag").textContent), frag);
    for (const r of p.requests) { assert.ok(!r.url.includes(hash.slice(1)), r.url); assert.ok(!JSON.stringify(r).includes(Object.values(frag)[0])); }
    for (const v of [...p.store.values(), ...p.local.values()]) assert.ok(!String(v).includes(Object.values(frag)[0]));
  }
});

test("R36 while bootstrap answers test_instance true every frame shows the test-instance band; otherwise none", async () => {
  for (const [path, screens, session] of [["/app", ALL, undefined], ["/app/doorbell", [...ALL, DOORBELL], null], ["/app/join", [...ALL, JOIN], null]]) {
    const opts = { screens, path, plane: { bootstrap: ok({ test_instance: true }) } };
    if (session === null) opts.session = null;
    const p = await boot(opts);
    const band = p.root().querySelector(".cs-testband");
    assert.ok(band, path);
    assert.ok(band.textContent.includes("test Civicsmith"), path);
    assert.equal(p.byOp("bootstrap")[0].headers.Authorization, undefined);
  }
  for (const b of [ok({ test_instance: false }), ok({}), silent, refused("NO")]) {
    const q = await boot({ screens: ALL, plane: { bootstrap: b } });
    assert.equal(q.root().querySelector(".cs-testband"), null);
  }
});

test("R43 every working screen's masthead opens with the mark (the plumb bob, before the group's name), explaining itself; the public frame's page body draws none", async () => {
  for (const path of ["/app", "/app/held", "/app/settings", "/app/nowhere"]) {
    const p = await boot({ screens: ALL, path, plane: PLANE });
    const mast = p.root().querySelector(".cs-mast");
    const mark = mast.children[0];
    assert.ok(mark.classList.contains("cs-mark"), path);
    assert.equal(mark.querySelector("use").getAttribute("href"), "/app/assets/icons.svg#i-mark");
    assert.equal(mark.nextElementSibling.classList.contains("grp"), true, "before the group's name");
    assert.equal(mark.getAttribute("aria-label"), "Civicsmith");
    assert.ok(mark.getAttribute("data-tip").includes("you are in your group's own Civicsmith, and the name beside it says whose".replace(/'/g, "&#39;")));
    assert.equal(mark.getAttribute("data-level"), "1");
  }
  const q = await boot({ screens: [...ALL, DOORBELL], path: "/app/doorbell", session: null });
  assert.equal(q.root().querySelector(".cs-mark"), null);
});

test("R48 the main frame's root carries data-screen of the registered screen it drew; the shell's own fallbacks carry none", async () => {
  const cases = [["/app", "home"], ["/app/held", "held"], ["/app/document/c1", "document"], ["/app/settings", null], ["/app/people", null], ["/app/nowhere", null], ["/app/more", null]];
  for (const [path, id] of cases) {
    const p = await boot({ screens: ALL, path, plane: PLANE });
    assert.equal(p.root().querySelector("#cs-main").getAttribute("data-screen"), id, path);
  }
  const nf = await boot({ screens: ALL, path: "/app/document/zz", plane: { ...PLANE, image: refused("NO_SUCH_CAPTURE") } });
  assert.equal(nf.root().querySelector("#cs-main").getAttribute("data-screen"), null, "a subject not found");
  const d = await boot({ screens: [...ALL, DOORBELL], path: "/app/doorbell", session: null });
  assert.equal(d.root().querySelector("#cs-main").getAttribute("data-screen"), "doorbell", "the public frame's root");
});
