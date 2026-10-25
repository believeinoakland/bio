/* Projects (R10, R20, R23, R25, R29, R30, R32, R33) on the real served page over the REAL store (store-request's `storeWorld()`, op-tables §5.3):
   every project the member sees as `projectlist` answers it (project-roster R26, R28), each with its question count, its stage, its members, its
   activity over eight weeks and its last change; `truncated` said; and "Start a project". The team, its members, projects, invitations,
   questions and the passing weeks are made by the real acts, and every answer the page reads is the real store's, but where a test's point is
   an answer the real store never gives (a row of a shape it does not give, a read that fails) it wraps only that op over the world's own door
   (`shaped`, `failing`). Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { counted } from "../interface-shell/harness.mjs";
import { open as openRaw, refused, text, ops, button, press, beside, last, main, settle, screen, word, hasWord, dmy, withScreens } from "./page.mjs";

const timeout = { timeout: 300000 };
const WEEK = 7 * 24 * 3600 * 1000;
const CREATE = ["contribute", "create_projects"];
/** The page over the world, as `as` (the world's door answers every op `plane` does not). */
const open = (w, as, path, plane = {}, o = {}) => openRaw(path, plane, { ...w.boot(as), ...o });
/** The real door's answer to `req`, its result handed to `f` to reshape (an answer of a shape the real store never gives). */
const shaped = (w, as, f) => { const { door } = w.boot(as); return async (req) => { const a = await counted(door)(req); f(a.json.result, req); return a; }; };
const rows = (p) => main(p).querySelectorAll(".cs-row");
const rowOf = (p, name) => rows(p).find((r) => text(p, r).includes(name));
const hex = async (s) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, "0")).join("");
/** The projects `as` sees, by name, as the store answers them. */
const listed = async (as) => Object.fromEntries((await as.read("projectlist")).projects.map((p) => [p.name, p]));
/** A project closed or reopened, by its owner's real act (a revision of its document with the other state). */
async function restage(w, as, id, title, stage) {
  const now = new Date(w.now()).toISOString().replace(/\.\d{3}Z$/, "Z");
  const head = (await as.read("bundlehistory", { query: { bundle: id } })).revisions[0];
  const md = (await as.read("image", { query: { id } }))["bundle.md"].replace(/^current_state: .*$/m, "current_state: " + stage).replace(/^last_updated: .*$/m, `last_updated: "${now}"`);
  await as.act("promote", { body: { bundleId: id, base: head.sha256, snapKey: `stage-${stage}-${++restage.n}`, meta: { object_type: "project", title, current_state: stage, last_updated: now },
    files: [{ path: "bundle.md", text: md, bytes: new TextEncoder().encode(md).length, sha256: await hex(md) }], register: [] } });
}
restage.n = 0;

/** A small team: rosa (administrator), and her projects `names`, none with questions. */
async function simple(...names) {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const ids = [];
  for (const n of names) ids.push(await w.recipes.project(rosa, n));
  return { w, rosa, ids };
}

/** The group's projects as the glance draws them, by the real acts over six and a half weeks: dev opened "The Coliseum lease" (rosa and teo
 *  joined it, it holds two questions, and it has been busy lately); ana opened "Sewer fund transfers", closed it and was revoked (no owner, no
 *  act for six weeks); dev's "Pothole repairs" has the same few acts lately as before (steady). The roster reads the host's own clock, so the
 *  world starts six and a half weeks before it. Viewed by rosa, who administers. */
async function roster() {
  const t0 = Math.floor(Date.now() / 1000) * 1000 - Math.round(6.5 * WEEK);
  const w = await storeWorld({ group: null, now: t0 });
  const founder = await w.signIn("admin");
  await w.signIn("rosa", { admin: true });
  await w.signIn("teo");
  const [dev, ana] = [await w.signIn("dev", { capabilities: CREATE }), await w.signIn("ana", { capabilities: CREATE })];
  const sewer = await w.recipes.project(ana, "Sewer fund transfers");
  await restage(w, ana, sewer, "Sewer fund transfers", "closed");
  await founder.act("memberset", { body: { memberId: "ana", status: "revoked" } });
  const coliseum = await w.recipes.project(dev, "The Coliseum lease");
  const pothole = await w.recipes.project(dev, "Pothole repairs");
  await restage(w, dev, pothole, "Pothole repairs", "closed");
  await restage(w, dev, pothole, "Pothole repairs", "forming");
  await w.tick(6 * WEEK);
  const [rosa, teo, dev2] = [await w.signIn("rosa"), await w.signIn("teo"), await w.signIn("dev")];
  for (const who of [rosa, teo]) { await dev2.act("projectinvite", { query: { projectId: coliseum, handle: who.handle } }); await who.act("projectjoin", { query: { projectId: coliseum } }); }
  await w.recipes.questions(dev2, coliseum, 2);
  await restage(w, dev2, pothole, "Pothole repairs", "closed");
  await restage(w, dev2, pothole, "Pothole repairs", "forming");
  return { w, rosa, coliseum, sewer, pothole };
}

test("R10: projects reads projectlist and draws each project as a reference opening project, with its stage on the ladder", timeout, async () => {
  const { w, rosa, coliseum } = await roster();
  const p = await open(w, rosa, "/app/projects");
  assert.equal(p.byOp("projectlist").length, 1);
  assert.equal(main(p).querySelector("h1").textContent, word("screen.projects.name"));
  assert.equal(rows(p).length, 3);
  const withProject = await open(w, rosa, "/app/projects", {}, { screens: withScreens("project") });
  assert.equal(main(withProject).querySelectorAll("a.cs-ref").find((a) => a.textContent === "The Coliseum lease").getAttribute("href"), "/app/project/" + coliseum);
  const on = (l) => l.children.map((s) => s.getAttribute("class") === "on");
  const ladder = (page, name) => rowOf(page, name).querySelector(".cs-ladder");
  assert.deepEqual(on(ladder(p, "The Coliseum lease")), [true, false, false, false], "a project just begun is forming");
  assert.deepEqual(on(ladder(p, "Sewer fund transfers")), [true, true, true, true]);
  assert.equal(ladder(p, "Sewer fund transfers").querySelector("[aria-current]").textContent, word("screen.projects.stage.closed"));
  // The store records only forming and closed (the document machine: the other two stages are computed, not written), so the stage
  // between is the real row's with its stage word changed.
  const between = await open(w, rosa, "/app/projects", { projectlist: shaped(w, rosa, (r) => { r.projects.find((x) => x.name === "The Coliseum lease").stage = "investigating"; }) });
  assert.deepEqual(on(ladder(between, "The Coliseum lease")), [true, true, false, false]);
});

test("R10, R25 (fix round 3, C14): each project's question count is its roster row's, picking the singular or plural key; none is read project by project", timeout, async () => {
  const { w, rosa } = await roster();
  const p = await open(w, rosa, "/app/projects");
  await settle();
  assert.equal(p.byOp("projectquestions").length, 0, "no per-project read (project-roster R42)");
  assert.ok(text(p, rowOf(p, "The Coliseum lease")).includes("The Coliseum lease" + word("screen.projects.questions.many", { n: "2" })));
  assert.doesNotMatch(text(p, rowOf(p, "Sewer fund transfers")), /\d+ questions?/, "R21: no count at zero");
  const solo = await simple("Solo");
  await solo.w.recipes.questions(solo.rosa, solo.ids[0], 1);
  const single = await open(solo.w, solo.rosa, "/app/projects");
  await settle();
  assert.ok(text(single, rows(single)[0]).includes(word("screen.projects.questions.one")), "one question: the singular key");
});

test("R10 (DEC-214 (3); project-roster R28): each row draws its members (cs.initials), its activity over eight weeks (cs.activity) with the word the bars say, and its last change", timeout, async () => {
  const { w, rosa } = await roster();
  const real = await listed(rosa);
  const p = await open(w, rosa, "/app/projects");
  await settle();
  const [a, b, c] = ["The Coliseum lease", "Sewer fund transfers", "Pothole repairs"].map((n) => rowOf(p, n));
  assert.equal(a.querySelector(".mk-people").getAttribute("aria-label"), word("shell.glance.people", { n: "3", names: "dev, rosa, teo" }));
  assert.deepEqual(a.querySelector(".mk-people").querySelectorAll("i").map((i) => i.textContent), ["D", "R", "T"]);
  assert.equal(b.querySelector(".mk-people").getAttribute("aria-label"), word("shell.glance.people", { n: "1", names: "ana" }));
  // Eight bars, oldest first, the newest marked; the word: busy (more lately), quiet (none lately), steady (about the same).
  const weeks = (name) => real[name].activity.join(", ");
  assert.equal(real["The Coliseum lease"].activity.length, 8);
  assert.equal(a.querySelector(".mk-spark").querySelectorAll("i").length, 8);
  assert.equal(a.querySelector(".mk-spark").getAttribute("aria-label"), word("shell.glance.weeks", { word: word("shell.glance.busy"), weeks: weeks("The Coliseum lease") }));
  assert.equal(a.querySelector(".mk-spark i.now").getAttribute("style"), "height:18px");
  assert.equal(b.querySelector(".mk-spark").getAttribute("aria-label"), word("shell.glance.weeks", { word: word("shell.glance.quiet"), weeks: weeks("Sewer fund transfers") }));
  assert.equal(b.querySelector(".mk-spark b").textContent, word("shell.glance.quiet"));
  assert.equal(c.querySelector(".mk-spark").getAttribute("aria-label"), word("shell.glance.weeks", { word: word("shell.glance.steady"), weeks: weeks("Pothole repairs") }));
  assert.equal(c.querySelector(".mk-spark b").textContent, word("shell.glance.steady"));
  for (const [row, name] of [[a, "The Coliseum lease"], [b, "Sewer fund transfers"], [c, "Pothole repairs"]])
    assert.ok(text(p, row).includes(word("screen.projects.lastchange", { date: dmy(real[name].lastChange.slice(0, 10)) })), name + ": its last change");
  // A project the store gives no last change (it always gives one to a project that exists) is told so: the real row with it taken away.
  const none = await open(w, rosa, "/app/projects", { projectlist: shaped(w, rosa, (r) => { r.projects.find((x) => x.name === "Sewer fund transfers").lastChange = null; }) });
  await settle();
  assert.ok(text(none, rowOf(none, "Sewer fund transfers")).includes(word("screen.projects.lastchange.none")));
  assert.ok(!text(none, rowOf(none, "The Coliseum lease")).includes(word("screen.projects.lastchange.none")));
  // Control: a row answering none of the three draws none of them, and says nothing of them.
  const lone = await simple("Bare");
  const bare = await open(lone.w, lone.rosa, "/app/projects", { projectlist: shaped(lone.w, lone.rosa, (r) => { for (const x of r.projects) { delete x.members; delete x.activity; delete x.lastChange; } }) });
  await settle();
  assert.ok(!main(bare).querySelector(".mk-people, .mk-spark"));
  assert.ok(!text(bare).includes(word("screen.projects.lastchange.none")) && !text(bare).includes(word("screen.projects.lastchange", { date: "" }).trim()));
});

test("R10 (DEC-201 (8); project-roster R27): each row draws its owner by handle, a reference to the member; an owner no longer active is said", timeout, async () => {
  const { w, rosa } = await roster();
  const p = await open(w, rosa, "/app/projects");
  const a = rowOf(p, "The Coliseum lease"), b = rowOf(p, "Sewer fund transfers");
  assert.ok(text(p, a).includes(word("screen.projects.owner", { handle: "" }).trim() + " dev") || text(p, a).includes(word("screen.projects.owner", { handle: "dev" })));
  assert.ok(a.querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "dev"));
  assert.ok(text(p, b).includes(word("screen.projects.owner.none")), "ana, who opened it, was revoked");
  // An owner answered with no handle (project-roster R27's form when the handle is unknown) is named as R85 (C94) says: never by her member id.
  // The store gives every active member a handle, so this is the real row with hers taken away.
  const lone = await simple("N");
  const nohandle = await open(lone.w, lone.rosa, "/app/projects", { projectlist: shaped(lone.w, lone.rosa, (r) => { r.projects[0].owner = { member: "M-7", handle: null }; }) });
  assert.ok(!text(nohandle, rows(nohandle)[0]).includes("M-7") && text(nohandle, rows(nohandle)[0]).includes(word("shell.card.member")));
  assert.ok(!text(nohandle).includes(word("screen.projects.owner.none")));
  // Control: a row answering no owner says nothing of one.
  const bare = await open(lone.w, lone.rosa, "/app/projects", { projectlist: shaped(lone.w, lone.rosa, (r) => { for (const x of r.projects) delete x.owner; }) });
  assert.ok(!text(bare, rows(bare)[0]).includes(word("screen.projects.owner.none")) && !text(bare, rows(bare)[0]).includes(word("screen.projects.owner", { handle: "" }).trim()));
});

test("R32 (N1072; DEC-230 (4); project-roster R29): a member answered founder: true, handle: null is drawn \"The group's founder\", never by the member id; no row draws admin", timeout, async () => {
  const w = await storeWorld({ group: null });
  const [founder, rosa] = [await w.signIn("admin"), await w.signIn("rosa", { admin: true })];
  const mine = await w.recipes.project(founder, "The Coliseum lease");
  await founder.act("projectinvite", { query: { projectId: mine, handle: "rosa" } });
  await rosa.act("projectjoin", { query: { projectId: mine } });
  await w.recipes.project(founder, "Library hours");
  // The founder the store names is drawn by the handle she has (WORLD_FOUNDER_HANDLE); the form with no handle is the same rows with it taken away.
  const unnamed = (x) => { if (x && x.founder) x.handle = null; };
  const p = await open(w, rosa, "/app/projects", { projectlist: shaped(w, rosa, (r) => { const a = r.projects.find((x) => x.name === "The Coliseum lease"); unnamed(a.owner); a.members.forEach(unnamed); }) });
  await settle();
  const a = rowOf(p, "The Coliseum lease"), b = rowOf(p, "Library hours");
  assert.ok(text(p, a).includes(word("member.founder.unnamed")), "the owner, the founder, by the keyed word");
  assert.ok(a.querySelector(".mk-people").getAttribute("aria-label").includes(word("member.founder.unnamed")), "and among the members");
  assert.doesNotMatch(text(p, a), /\badmin\b/, "control: no row draws admin");
  assert.doesNotMatch(a.querySelector(".mk-people").getAttribute("aria-label"), /\badmin\b/);
  assert.ok(text(p, b).includes("founder") && !text(p, b).includes(word("member.founder.unnamed")), "a founder who has chosen a handle is drawn by it");
  assert.doesNotMatch(text(p), /\badmin\b/);
});

test("R10, R33: a list answered truncated says more projects exist; none draws its designed empty state and the act; a failed read is drawn failed", timeout, async () => {
  const big = await simple();
  for (let i = 0; i < 201; i++) await big.w.recipes.project(big.rosa, "Project " + i);
  const t = await open(big.w, big.rosa, "/app/projects");
  assert.equal(rows(t).length, 200, "the list stops at its bound");
  assert.ok(text(t).includes(word("screen.projects.truncated")));
  const { w, rosa } = await roster();
  assert.ok(!text(await open(w, rosa, "/app/projects")).includes(word("screen.projects.truncated")));
  const empty = await simple();
  const none = await open(empty.w, empty.rosa, "/app/projects");
  assert.ok(text(none).includes(word("projects.empty.sub")) && text(none).includes(word("projects.empty.note")), "its designed empty state");
  assert.ok(button(none, "promote"), "with \"Start a project\" below");
  assert.ok(text(none).indexOf(word("projects.empty.note")) < text(none).indexOf(word("project.start.go")), "the act below the state");
  assert.ok(!ops(none).includes("drawquestion") && !none.doc.getElementById("projects-question"), "the first question is the project page's, not asked here");
  // Control: one project draws its row and no empty state.
  const lone = await simple("A");
  const one = await open(lone.w, lone.rosa, "/app/projects");
  assert.equal(rows(one).length, 1);
  assert.ok(!text(one).includes(word("projects.empty.sub")) && !text(one).includes(word("projects.empty.note")));
  // A read the store does not answer: the world cannot make its store fail, so the op alone answers so.
  const failed = await open(w, rosa, "/app/projects", { projectlist: refused("STORE_DID_NOT_ANSWER", null, 502) });
  assert.ok(main(failed).querySelector('[data-state="failed"]'));
  assert.ok(!text(failed).includes(word("projects.empty.sub")), "a failed read is never drawn as empty");
});

test("R10, R25: \"Start a project\" sends promote with the member's title, written as its title, as a new forming project and opens it; with no title nothing is sent", timeout, async () => {
  const { w, rosa, ids } = await simple("Existing");
  await rosa.act("projectvisibilityset", { query: { projectId: ids[0], setting: "hidden", reason: "not yet" } });
  const p = await open(w, rosa, "/app/projects");
  assert.ok(button(p, "promote").textContent.startsWith(word("project.start.go")));
  const b = await press(p, "promote", { values: { "projects-title": " " } });
  assert.equal(p.byOp("promote").length, 0);
  assert.equal(beside(p, b), word("screen.projects.title.needed"));
  await press(p, "promote", { values: { "projects-visibility-hidden": true, "projects-title": " Park bond oversight " } });
  const body = last(p, "promote").body;
  assert.deepEqual([body.base, body.meta.object_type, body.meta.title, body.meta.current_state], [null, "project", "Park bond oversight", "forming"]);
  assert.match(body.files[0].text, /^---\nobject_type: project\ntitle: "Park bond oversight"\nobjective: "Park bond oversight"\ncurrent_state: forming\n/);
  assert.ok(body.files[0].text.includes(`Trigger: ${word("file.trigger.projects")}\n`));
  const made = (await listed(rosa))["Park bond oversight"];
  assert.ok(made, "the project is recorded");
  assert.equal(made.stage, "forming");
  assert.equal(p.location.pathname, "/app/project/" + made.id);
  const nocap = await w.signIn("nocap", { capabilities: [] });
  assert.deepEqual(ops(await open(w, nocap, "/app/projects")), [], "drawn only to a session that may contribute");
});

test("R30, R80: the form asks the title and who can find it; neither is preselected, none chosen sends nothing; choosing findable sends discoverable; refusals by their words", timeout, async () => {
  const { w, rosa } = await simple("Existing");
  const p = await open(w, rosa, "/app/projects");
  const start = main(p).querySelector('details[data-start="project"]');
  assert.ok(start.querySelector("label[for=projects-title]").textContent.includes(word("project.start.title")));
  assert.ok(start.textContent.includes(word("project.start.title.help")) && start.textContent.includes(word("project.visibility.start.later")));
  const sel = start.querySelector("#projects-visibility");
  assert.deepEqual(sel.querySelectorAll("input[type=radio]").map((o) => o.parentNode.textContent.trim()), [word("project.visibility.start.hidden"), word("project.visibility.start.discoverable")]);
  assert.equal(sel.querySelectorAll("input[type=radio]").filter((o) => o.checked).length, 0, "R80: nothing is chosen for the member");
  const refusedBtn = await press(p, "promote", { values: { "projects-title": "Parks" } });
  assert.equal(p.byOp("promote").length, 0, "R80: Start with neither chosen sends nothing");
  assert.ok(beside(p, refusedBtn).includes(word("project.visibility.start.required")), "R80: refused in place with the required key");
  const q = await open(w, rosa, "/app/projects");
  await press(q, "promote", { values: { "projects-title": "Parks", "projects-visibility-discoverable": true } });
  assert.equal(last(q, "promote").body.visibility, "discoverable");
  assert.equal((await rosa.read("projectvisibility", { query: { projectId: (await listed(rosa)).Parks.id } })).setting, "discoverable", "and the store records it findable");
  const h = await open(w, rosa, "/app/projects");
  await press(h, "promote", { values: { "projects-title": "Greens", "projects-visibility-hidden": true } });
  assert.equal(last(h, "promote").body.visibility, "hidden", "control: hidden, once chosen, is sent");
  assert.equal((await rosa.read("projectvisibility", { query: { projectId: (await listed(rosa)).Greens.id } })).setting, "hidden");
  // A name a project already has: the store refuses it.
  const taken = await open(w, rosa, "/app/projects");
  const c = await press(taken, "promote", { values: { "projects-title": "Parks", "projects-visibility-hidden": true } });
  assert.equal(beside(taken, c).replace(/\s+/g, " "), word("refusal.NAME_TAKEN"), "NAME_TAKEN");
  // An ownerless creation (a machine's) cannot choose a setting: a member's session is never one, so the world cannot make this refusal and the act alone answers it.
  const t = await open(w, rosa, "/app/projects", { promote: refused("PROJECT_VISIBILITY_NO_OWNER", null, 409) });
  const d = await press(t, "promote", { values: { "projects-title": "Parks again", "projects-visibility-hidden": true } });
  assert.equal(beside(t, d).replace(/\s+/g, " "), word("refusal.PROJECT_VISIBILITY_NO_OWNER"), "PROJECT_VISIBILITY_NO_OWNER");
});

test("R20 (DEC-228 (4)): projects offers \"Imported cases\", a reference opening imported", timeout, async () => {
  const { w, rosa } = await simple("Existing");
  const p = await open(w, rosa, "/app/projects");
  const link = main(p).querySelectorAll("a.cs-ref").find((a) => a.getAttribute("href") === "/app/imported");
  assert.ok(link);
  assert.equal(link.textContent, word("screen.imported.name"));
  await p.click(link);
  assert.equal(p.location.pathname, "/app/imported");
});

test("R23: \"Start a project\" opens its title field on press, as the act's own words, never an always-open field; the definition is said once", timeout, async () => {
  const { w, rosa } = await simple("Existing");
  const p = await open(w, rosa, "/app/projects");
  const start = main(p).querySelector('details[data-start="project"]');
  assert.equal(text(p, start.querySelector("summary")), word("act.promote.label.projects"));
  assert.equal(start.getAttribute("open"), null);
  assert.ok(start.querySelector("#projects-title"));
  const once = (t, x) => t.split(x).length - 1;
  assert.equal(once(text(p), word("screen.projects.sub")), 1, "the definition once");
  const empty = await simple();
  const none = await open(empty.w, empty.rosa, "/app/projects");
  assert.equal(once(text(none), word("screen.projects.sub")), 0, "the empty state says it in its own words instead");
  assert.equal(once(text(none), word("projects.empty.sub")), 1);
});

test("R29 (D25): a project the member is invited to is drawn with Join (projectjoin), set apart under its heading, as the project's participants answer her place; a joined project offers none", timeout, async () => {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const [mai, teo] = [await w.signIn("mai"), await w.signIn("teo")];
  const coliseum = await w.recipes.project(rosa, "The Coliseum lease"), library = await w.recipes.project(rosa, "Library hours");
  for (const [who, id] of [[mai, coliseum], [teo, coliseum]]) { await rosa.act("projectinvite", { query: { projectId: id, handle: who.handle } }); await who.act("projectjoin", { query: { projectId: id } }); }
  await rosa.act("projectinvite", { query: { projectId: library, handle: "mai" } });
  // The store's list names her place in each row (N1118); a list that does not (an older store's) has the page read the project's participants.
  const unplaced = (as) => shaped(w, as, (r) => { for (const x of r.projects) delete x.participation; });
  const p = await open(w, mai, "/app/projects", { projectlist: unplaced(mai) });
  await settle();
  const invited = main(p).querySelectorAll("section").find((x) => x.querySelector("h2") && x.querySelector("h2").textContent === word("projects.invited.head"));
  assert.ok(invited, "the invited projects under their heading");
  assert.ok(p.byOp("projectparticipants").length > 0, "her place is read from the projects' participants");
  assert.ok(text(p, invited).includes("Library hours") && !text(p, invited).includes("The Coliseum lease"));
  const join = invited.querySelector('button[data-act="projectjoin"]');
  assert.ok(join && join.textContent.startsWith(word("act.projectjoin.label.projects")));
  assert.equal(main(p).querySelectorAll('button[data-act="projectjoin"]').length, 1, "control: the joined project does not");
  const told = await open(w, mai, "/app/projects");
  await settle();
  assert.ok(told.byOp("projectparticipants").length === 0 && main(told).querySelector('button[data-act="projectjoin"]'), "projectlist's own participation is taken at its word (N1118)");
  const none = await open(w, teo, "/app/projects");
  await settle();
  assert.ok(!ops(none).includes("projectjoin") && !text(none).includes(word("projects.invited.head")));
  // A read of the participants that fails: the world cannot make its store fail, so that op alone answers so.
  const failed = await open(w, mai, "/app/projects", { projectlist: unplaced(mai), projectparticipants: refused("NO_SUCH_PROJECT", null, 404) });
  await settle();
  assert.equal(main(failed).querySelectorAll('button[data-act="projectjoin"]').length, 0, "a read that failed offers nothing on a guess");
  await press(p, "projectjoin");
  assert.equal(last(p, "projectjoin").query.projectId, library);
  assert.equal((await mai.read("projectparticipants", { query: { projectId: library } })).participants.find((x) => x.handle === "mai").state, "joined", "she has joined");
  assert.ok(p.byOp("projectlist").length >= 2, "the list is read again");
});

test("R34: every key projects reads is a word of the list; the retired rows are not read", () => {
  for (const k of screen("projects").words) assert.ok(hasWord(k), k);
  for (const k of ["projects.empty.sub", "projects.empty.note", "project.start.title", "project.visibility.start.later", "member.founder.unnamed", "act.projectjoin.label.projects"])
    assert.ok(screen("projects").words.includes(k), k);
});

test("R63: projects draws a search by name and a filter (all, in, own), narrowing the rows in the page from projectlist's mine; it sends no op and changes nothing", timeout, async () => {
  const w = await storeWorld({ group: null });
  const [rosa, ana] = [await w.signIn("rosa", { admin: true }), await w.signIn("ana", { capabilities: CREATE })];
  const coliseum = await w.recipes.project(rosa, "The Coliseum lease"), sewer = await w.recipes.project(ana, "Sewer fund transfers");
  await w.recipes.project(ana, "Pothole repairs");
  await ana.act("projectinvite", { query: { projectId: sewer, handle: "rosa" } });
  await rosa.act("projectjoin", { query: { projectId: sewer } });
  await restage(w, ana, sewer, "Sewer fund transfers", "closed");
  const p = await open(w, rosa, "/app/projects", {}, { screens: withScreens("project") });
  const names = () => rows(p).map((r) => r.querySelector("a.cs-ref").textContent);
  const real = (await rosa.read("projectlist")).projects;
  const all = real.map((x) => x.name), within = real.filter((x) => x.mine.in).map((x) => x.name), owned = real.filter((x) => x.mine.owner).map((x) => x.name);
  assert.deepEqual([within.length, owned.length], [2, 1], "rosa is in two projects and owns one");
  assert.ok(hasWord("screen.projects.search.label") && hasWord("screen.projects.search.help"));
  assert.ok(main(p).querySelector('label[for="projects-search"]') && text(p).includes(word("screen.projects.search.help")));
  assert.equal(text(p, main(p).querySelector('label[for="projects-filter"]')), word("screen.projects.filter.label"));
  assert.deepEqual(main(p).querySelectorAll("#projects-filter option").map((o) => o.textContent), ["screen.projects.filter.all", "screen.projects.filter.in", "screen.projects.filter.own"].map((k) => word(k)));
  assert.deepEqual(names(), all, "control: at all, every row shows");
  assert.equal(all.length, 3);
  const before = p.requests.length;
  const set = async (id, v) => {
    const el = p.doc.getElementById(id); el.value = v;
    if (id === "projects-search") { p.fire(el, "input"); await p.clock.tick(600); } else p.fire(el, "change");
    await settle();
  };
  await set("projects-search", "  FUND  sewer ");
  assert.deepEqual(names(), ["Sewer fund transfers"], "case-folded, every word present");
  await set("projects-search", "");
  await set("projects-filter", "in");
  assert.deepEqual(names(), within);
  assert.deepEqual(new Set(names()), new Set(["The Coliseum lease", "Sewer fund transfers"]));
  await set("projects-filter", "own");
  assert.deepEqual(names(), owned);
  assert.deepEqual(names(), ["The Coliseum lease"]);
  assert.ok(coliseum);
  await set("projects-search", "pothole");
  assert.equal(rows(p).length, 0);
  assert.ok(text(p).includes(word("projects.empty.sub")), "a search finding none says so with the empty-list sentence");
  assert.deepEqual(p.requests.slice(before).filter((r) => r.op === "projectlist"), [], "it sends no read of the list again and no act");
  assert.equal(p.requests.slice(before).filter((r) => r.method !== "GET").length, 0);
});

test("R72: a project whose row says rescue_open is marked and opens the project; a row without is unchanged", timeout, async () => {
  const w = await storeWorld({ group: null });
  const [founder, rosa, ana] = [await w.signIn("admin"), await w.signIn("rosa", { admin: true }), await w.signIn("ana", { capabilities: CREATE })];
  const library = await w.recipes.project(ana, "Library hours");
  await ana.act("projectvisibilityset", { query: { projectId: library, setting: "hidden", reason: "not yet" } });
  await founder.act("memberset", { body: { memberId: "ana", status: "revoked" } });
  await w.recipes.project(rosa, "The Coliseum lease");
  const real = await listed(rosa);
  assert.equal(real["Library hours"].rescue_open, true, "the store marks the stranded project");
  const p = await open(w, rosa, "/app/projects", {}, { screens: withScreens("project") });
  const rowAt = (name) => rows(p).find((r) => r.querySelectorAll("a.cs-ref").some((a) => a.textContent === name));
  assert.equal(rowAt("Library hours").querySelectorAll("a.cs-ref").find((a) => a.textContent === "Library hours").getAttribute("href"), "/app/project/" + library, "the row opens the project, where the rescue is");
  assert.ok(text(p, rowAt("Library hours")).includes(word("project.rescue.title.nodate")), "the stranded project is marked");
  assert.ok(!text(p, rowAt("The Coliseum lease")).includes(word("project.rescue.title.nodate")), "control: a row without rescue_open is not marked");
});
