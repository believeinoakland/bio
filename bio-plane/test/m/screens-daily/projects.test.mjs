/* Projects (R10, R20, R23, R25, R29, R30, R32, R33) on the real served page (interface-shell's harness): every project the member
   sees as `projectlist` answers it (project-roster R26, R28), each with its question count (`projectquestions`, paged), its
   stage, its members, its activity over eight weeks and its last change; `truncated` said; and "Start a project". Every
   sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, button, press, beside, last, main, settle, MEMBER, screen, word, hasWord, dmy, withScreens } from "./page.mjs";

const LIST = ok({ ok: true, count: 2, limit: 200, truncated: false, projects: [
  { id: "PROJ-1", name: "The Coliseum lease", stage: "investigating", owner: { member: "M-1", handle: "dev" },
    members: [{ member: "M-1", handle: "dev" }, { member: "M-2", handle: "rosa" }, { member: "M-3", handle: "teo" }],
    activity: [3, 5, 4, 6, 8, 7, 9, 11], lastChange: "2026-10-12T15:00:00Z" },
  { id: "PROJ-2", name: "Sewer fund transfers", stage: "closed", owner: null, members: [{ member: "M-4", handle: "ana" }],
    activity: [0, 0, 0, 0, 0, 0, 0, 0], lastChange: null },
] });
const QUESTIONS = (req) => ok({ ok: true, project: req.query.project, items: req.query.project === "PROJ-1" ? [{ inquiry: "INQ-1" }, { inquiry: "INQ-2" }] : [], cursor: null });
const PLANE = { projectlist: LIST, projectquestions: QUESTIONS };
const CREATOR = { whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }) };
const rows = (p) => main(p).querySelectorAll(".cs-row");

test("R10: projects reads projectlist and draws each project as a reference opening project, with its stage on the ladder", async () => {
  const p = await open("/app/projects", PLANE);
  assert.equal(p.byOp("projectlist").length, 1);
  assert.equal(main(p).querySelector("h1").textContent, word("screen.projects.name"));
  assert.equal(rows(p).length, 2);
  const withProject = await open("/app/projects", PLANE, { screens: withScreens("project") });
  assert.equal(main(withProject).querySelectorAll("a.cs-ref").find((a) => a.textContent === "The Coliseum lease").getAttribute("href"), "/app/project/PROJ-1");
  const on = (l) => l.children.map((s) => s.getAttribute("class") === "on");
  const ladders = main(p).querySelectorAll(".cs-ladder");
  assert.deepEqual(on(ladders[0]), [true, true, false, false]);
  assert.deepEqual(on(ladders[1]), [true, true, true, true]);
  assert.equal(ladders[1].querySelector("[aria-current]").textContent, word("screen.projects.stage.closed"));
});

test("R10, R25: each project's question count from projectquestions, paged to its end, picking the singular or plural key", async () => {
  const p = await open("/app/projects", { ...PLANE, projectquestions: (req) => ok({ ok: true, items: [{ inquiry: "Q" }], cursor: req.query.after ? null : "Q" }) });
  await settle();
  assert.deepEqual(p.byOp("projectquestions").map((r) => `${r.query.project}:${r.query.after || ""}`).sort(), ["PROJ-1:", "PROJ-1:Q", "PROJ-2:", "PROJ-2:Q"]);
  assert.ok(text(p, rows(p)[0]).includes(word("screen.projects.questions.many", { n: "2" })));
  const one = await open("/app/projects", PLANE);
  await settle();
  assert.ok(text(one, rows(one)[0]).includes("The Coliseum lease" + word("screen.projects.questions.many", { n: "2" })));
  assert.doesNotMatch(text(one, rows(one)[1]), /\d+ questions?/, "R21: no count at zero");
  const single = await open("/app/projects", { ...PLANE, projectquestions: () => ok({ ok: true, items: [{ inquiry: "Q" }], cursor: null }) });
  await settle();
  assert.ok(text(single, rows(single)[0]).includes(word("screen.projects.questions.one")), "one question: the singular key");
  const failed = await open("/app/projects", { ...PLANE, projectquestions: refused("STORE_DID_NOT_ANSWER", null, 502) });
  await settle();
  assert.equal(main(failed).querySelectorAll('.cs-row [data-state="failed"]').length, 2, "a failed count is drawn failed, never as none");
});

test("R10 (DEC-214 (3); project-roster R28): each row draws its members (cs.initials), its activity over eight weeks (cs.activity) with the word the bars say, and its last change", async () => {
  const p = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [
    ...LIST.json.result.projects,
    { id: "PROJ-3", name: "Pothole repairs", stage: "forming", members: [], activity: [2, 1, 3, 2, 2, 3, 2, 3], lastChange: "2026-10-12T15:00:00Z" },
  ] }) });
  await settle();
  const [a, b, c] = rows(p);
  assert.equal(a.querySelector(".mk-people").getAttribute("aria-label"), word("shell.glance.people", { n: "3", names: "dev, rosa, teo" }));
  assert.deepEqual(a.querySelector(".mk-people").querySelectorAll("i").map((i) => i.textContent), ["D", "R", "T"]);
  assert.equal(b.querySelector(".mk-people").getAttribute("aria-label"), word("shell.glance.people", { n: "1", names: "ana" }));
  // Eight bars, oldest first, the newest marked; the word: busy (more lately), quiet (none lately), steady (about the same).
  assert.equal(a.querySelector(".mk-spark").querySelectorAll("i").length, 8);
  assert.equal(a.querySelector(".mk-spark").getAttribute("aria-label"), word("shell.glance.weeks", { word: word("shell.glance.busy"), weeks: "3, 5, 4, 6, 8, 7, 9, 11" }));
  assert.equal(a.querySelector(".mk-spark i.now").getAttribute("style"), "height:18px");
  assert.equal(b.querySelector(".mk-spark b").textContent, word("shell.glance.quiet"));
  assert.equal(c.querySelector(".mk-spark b").textContent, word("shell.glance.steady"));
  assert.ok(text(p, a).includes(word("screen.projects.lastchange", { date: dmy("2026-10-12") })));
  assert.ok(text(p, b).includes(word("screen.projects.lastchange.none")));
  // Control: a row answering none of the three draws none of them, and says nothing of them.
  const bare = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-9", name: "Bare", stage: "forming" }] }) });
  await settle();
  assert.ok(!main(bare).querySelector(".mk-people, .mk-spark"));
  assert.ok(!text(bare).includes(word("screen.projects.lastchange.none")) && !text(bare).includes(word("screen.projects.lastchange", { date: "" }).trim()));
});

test("R10 (DEC-201 (8); project-roster R27): each row draws its owner by handle, a reference to the member; an owner no longer active is said", async () => {
  const p = await open("/app/projects", PLANE);
  const [a, b] = rows(p);
  assert.ok(text(p, a).includes(word("screen.projects.owner", { handle: "" }).trim() + " dev") || text(p, a).includes(word("screen.projects.owner", { handle: "dev" })));
  assert.ok(a.querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "dev"));
  assert.ok(text(p, b).includes(word("screen.projects.owner.none")));
  // An owner answered with no handle (project-roster R27's form when the handle is unknown) is drawn by its member id.
  const nohandle = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-8", name: "N", stage: "forming", owner: { member: "M-7", handle: null } }] }) });
  assert.ok(text(nohandle, rows(nohandle)[0]).includes("M-7"));
  assert.ok(!text(nohandle).includes(word("screen.projects.owner.none")));
  // Control: a row answering no owner says nothing of one.
  const bare = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-9", name: "Bare", stage: "forming" }] }) });
  assert.ok(!text(bare, rows(bare)[0]).includes(word("screen.projects.owner.none")) && !text(bare, rows(bare)[0]).includes(word("screen.projects.owner", { handle: "" }).trim()));
});

test("R32 (N1072; DEC-230 (4); project-roster R29): a member answered founder: true, handle: null is drawn \"The group's founder\", never by the member id; no row draws admin", async () => {
  const founder = { member: "admin", handle: null, founder: true };
  const p = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [
    { id: "PROJ-1", name: "The Coliseum lease", stage: "forming", owner: founder, members: [founder, { member: "M-2", handle: "rosa" }], activity: [0, 0, 0, 0, 0, 0, 0, 1], lastChange: "2026-10-12T15:00:00Z" },
    { id: "PROJ-2", name: "Library hours", stage: "forming", owner: { member: "admin", handle: "ana", founder: true }, members: [{ member: "admin", handle: "ana", founder: true }] },
  ] }) });
  await settle();
  const [a, b] = rows(p);
  assert.ok(text(p, a).includes(word("member.founder.unnamed")), "the owner, the founder, by the keyed word");
  assert.ok(a.querySelector(".mk-people").getAttribute("aria-label").includes(word("member.founder.unnamed")), "and among the members");
  assert.doesNotMatch(text(p, a), /\badmin\b/, "control: no row draws admin");
  assert.doesNotMatch(a.querySelector(".mk-people").getAttribute("aria-label"), /\badmin\b/);
  assert.ok(text(p, b).includes("ana") && !text(p, b).includes(word("member.founder.unnamed")), "a founder who has chosen a handle is drawn by it");
  assert.doesNotMatch(text(p), /\badmin\b/);
});

test("R10, R33: a list answered truncated says more projects exist; none draws its designed empty state and the act; a failed read is drawn failed", async () => {
  const t = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, truncated: true, projects: [{ id: "PROJ-1", name: "A", stage: "forming" }] }) });
  assert.ok(text(t).includes(word("screen.projects.truncated")));
  assert.ok(!text(await open("/app/projects", PLANE)).includes(word("screen.projects.truncated")));
  const none = await open("/app/projects", { ...PLANE, ...CREATOR, projectlist: ok({ ok: true, projects: [] }) });
  assert.ok(text(none).includes(word("projects.empty.sub")) && text(none).includes(word("projects.empty.note")), "its designed empty state");
  assert.ok(button(none, "promote"), "with \"Start a project\" below");
  assert.ok(text(none).indexOf(word("projects.empty.note")) < text(none).indexOf(word("project.start.go")), "the act below the state");
  assert.ok(!ops(none).includes("drawquestion") && !none.doc.getElementById("projects-question"), "the first question is the project page's, not asked here");
  // Control: one project draws its row and no empty state.
  const one = await open("/app/projects", { ...PLANE, ...CREATOR, projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "A", stage: "forming" }] }) });
  assert.equal(rows(one).length, 1);
  assert.ok(!text(one).includes(word("projects.empty.sub")) && !text(one).includes(word("projects.empty.note")));
  const failed = await open("/app/projects", { ...PLANE, projectlist: refused("STORE_DID_NOT_ANSWER", null, 502) });
  assert.ok(main(failed).querySelector('[data-state="failed"]'));
  assert.ok(!text(failed).includes(word("projects.empty.sub")), "a failed read is never drawn as empty");
});

test("R10, R25: \"Start a project\" sends promote with the member's title, written as its title, as a new forming project and opens it; with no title nothing is sent", async () => {
  const p = await open("/app/projects", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-77" }) });
  assert.ok(button(p, "promote").textContent.startsWith(word("project.start.go")));
  const b = await press(p, "promote", { values: { "projects-title": " " } });
  assert.equal(p.byOp("promote").length, 0);
  assert.equal(beside(p, b), word("screen.projects.title.needed"));
  await press(p, "promote", { values: { "projects-title": " Park bond oversight " } });
  const body = last(p, "promote").body;
  assert.deepEqual([body.base, body.meta.object_type, body.meta.title, body.meta.current_state], [null, "project", "Park bond oversight", "forming"]);
  assert.match(body.files[0].text, /^---\nobject_type: project\ntitle: "Park bond oversight"\nobjective: "Park bond oversight"\ncurrent_state: forming\n/);
  assert.ok(body.files[0].text.includes(`Trigger: ${word("file.trigger.projects")}\n`));
  assert.equal(p.location.pathname, "/app/project/PROJ-77");
  assert.deepEqual(ops(await open("/app/projects", { ...PLANE, whoami: ok({ ...MEMBER, capabilities: [] }) })), [], "drawn only to a session that may contribute");
});

test("R30: the form asks the title and who can find it; hidden is preselected and an untouched form sends it; choosing findable sends discoverable; refusals by their words", async () => {
  const p = await open("/app/projects", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-77" }) });
  const start = main(p).querySelector('details[data-start="project"]');
  assert.ok(start.querySelector("label[for=projects-title]").textContent.includes(word("project.start.title")));
  assert.ok(start.textContent.includes(word("project.start.title.help")) && start.textContent.includes(word("project.visibility.start.later")));
  const sel = start.querySelector("#projects-visibility");
  assert.deepEqual(sel.querySelectorAll("option").map((o) => o.textContent), [word("project.visibility.start.hidden"), word("project.visibility.start.discoverable")]);
  assert.equal(sel.value, "hidden");
  await press(p, "promote", { values: { "projects-title": "Parks" } });
  assert.equal(last(p, "promote").body.visibility, "hidden", "control: an untouched form sends hidden");
  const q = await open("/app/projects", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-78" }) });
  await press(q, "promote", { values: { "projects-title": "Parks", "projects-visibility": "discoverable" } });
  assert.equal(last(q, "promote").body.visibility, "discoverable");
  for (const code of ["PROJECT_VISIBILITY_NO_OWNER", "NAME_TAKEN"]) {
    const t = await open("/app/projects", { ...PLANE, ...CREATOR, promote: refused(code, null, 409) });
    const c = await press(t, "promote", { values: { "projects-title": "Parks" } });
    assert.equal(beside(t, c).replace(/\s+/g, " "), word(`refusal.${code}`), code);
  }
});

test("R20 (DEC-228 (4)): projects offers \"Imported cases\", a reference opening imported", async () => {
  const p = await open("/app/projects", PLANE);
  const link = main(p).querySelectorAll("a.cs-ref").find((a) => a.getAttribute("href") === "/app/imported");
  assert.ok(link);
  assert.equal(link.textContent, word("screen.imported.name"));
  await p.click(link);
  assert.equal(p.location.pathname, "/app/imported");
});

test("R23: \"Start a project\" opens its title field on press, as the act's own words, never an always-open field; the definition is said once", async () => {
  const p = await open("/app/projects", { ...PLANE, ...CREATOR });
  const start = main(p).querySelector('details[data-start="project"]');
  assert.equal(text(p, start.querySelector("summary")), word("act.promote.label.projects"));
  assert.equal(start.getAttribute("open"), null);
  assert.ok(start.querySelector("#projects-title"));
  const once = (t, w) => t.split(w).length - 1;
  assert.equal(once(text(p), word("screen.projects.sub")), 1, "the definition once");
  const none = await open("/app/projects", { ...PLANE, ...CREATOR, projectlist: ok({ ok: true, projects: [] }) });
  assert.equal(once(text(none), word("screen.projects.sub")), 0, "the empty state says it in its own words instead");
  assert.equal(once(text(none), word("projects.empty.sub")), 1);
});

test("R29 (D25): a project the member is invited to is drawn with Join (projectjoin), set apart under its heading, as the project's participants answer her place; a joined project offers none", async () => {
  const mixed = ok({ ok: true, projects: [
    { id: "PROJ-1", name: "The Coliseum lease", stage: "investigating" },
    { id: "PROJ-9", name: "Library hours", stage: "forming" },
  ] });
  const participants = (req) => ok({ ok: true, projectId: req.query.projectId, participants: [{ handle: "rosa", state: "joined", owner: true },
    { handle: "mai", state: req.query.projectId === "PROJ-9" ? "invited" : "joined", owner: false }] });
  const p = await open("/app/projects", { ...PLANE, projectlist: mixed, projectparticipants: participants, projectjoin: ok({ ok: true, projectId: "PROJ-9", state: "joined" }) });
  await settle();
  const invited = main(p).querySelectorAll("section").find((x) => x.querySelector("h2") && x.querySelector("h2").textContent === word("projects.invited.head"));
  assert.ok(invited, "the invited projects under their heading");
  assert.ok(text(p, invited).includes("Library hours") && !text(p, invited).includes("The Coliseum lease"));
  const join = invited.querySelector('button[data-act="projectjoin"]');
  assert.ok(join && join.textContent.startsWith(word("act.projectjoin.label.projects")));
  assert.equal(main(p).querySelectorAll('button[data-act="projectjoin"]').length, 1, "control: the joined project does not");
  await press(p, "projectjoin");
  assert.equal(last(p, "projectjoin").query.projectId, "PROJ-9");
  assert.ok(p.byOp("projectlist").length >= 2, "the list is read again");
  const told = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-9", name: "A", stage: "forming", participation: "invited" }] }) });
  await settle();
  assert.ok(told.byOp("projectparticipants").length === 0 && main(told).querySelector('button[data-act="projectjoin"]'), "projectlist's own participation is taken at its word (N1118)");
  const none = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "A", stage: "forming", participation: "joined" }] }) });
  await settle();
  assert.ok(!ops(none).includes("projectjoin") && !text(none).includes(word("projects.invited.head")));
  const failed = await open("/app/projects", { ...PLANE, projectlist: mixed, projectparticipants: refused("NO_SUCH_PROJECT", null, 404) });
  await settle();
  assert.equal(main(failed).querySelectorAll('button[data-act="projectjoin"]').length, 0, "a read that failed offers nothing on a guess");
});

test("R34: every key projects reads is a word of the list; the retired rows are not read", () => {
  for (const k of screen("projects").words) assert.ok(hasWord(k), k);
  for (const k of ["projects.empty.sub", "projects.empty.note", "project.start.title", "project.visibility.start.later", "member.founder.unnamed", "act.projectjoin.label.projects"])
    assert.ok(screen("projects").words.includes(k), k);
});
