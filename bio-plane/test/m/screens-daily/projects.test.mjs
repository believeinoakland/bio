/* Projects (R10) on the real served page (interface-shell's harness): every project the member sees as `projectlist`
   answers it (project-roster R26, R28), each with its question count (`projectquestions`, paged), its stage, its members,
   its activity over eight weeks and its last change; `truncated` said; and "Start a project". */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, button, press, beside, last, main, settle, MEMBER } from "./page.mjs";

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
  assert.equal(main(p).querySelector("h1").textContent, "Projects");
  assert.equal(rows(p).length, 2);
  const withProject = await open("/app/projects", PLANE, { screens: [...(await import("./page.mjs")).SCREENS, { id: "project", reads: () => ({}), acts: [], render: () => "" }] });
  assert.equal(main(withProject).querySelectorAll("a.cs-ref").find((a) => a.textContent === "The Coliseum lease").getAttribute("href"), "/app/project/PROJ-1");
  const on = (l) => l.children.map((s) => s.getAttribute("class") === "on");
  const ladders = main(p).querySelectorAll(".cs-ladder");
  assert.deepEqual(on(ladders[0]), [true, true, false, false]);
  assert.deepEqual(on(ladders[1]), [true, true, true, true]);
  assert.equal(ladders[1].querySelector("[aria-current]").textContent, "Closed");
});

test("R10: each project's question count from projectquestions, paged to its end", async () => {
  const p = await open("/app/projects", { ...PLANE, projectquestions: (req) => ok({ ok: true, items: [{ inquiry: "Q" }], cursor: req.query.after ? null : "Q" }) });
  await settle();
  assert.deepEqual(p.byOp("projectquestions").map((r) => `${r.query.project}:${r.query.after || ""}`).sort(), ["PROJ-1:", "PROJ-1:Q", "PROJ-2:", "PROJ-2:Q"]);
  assert.match(text(p, rows(p)[0]), /2 questions/);
  const one = await open("/app/projects", PLANE);
  await settle();
  assert.match(text(one, rows(one)[0]), /The Coliseum lease2 questions/);
  assert.doesNotMatch(text(one, rows(one)[1]), /\d+ questions?/, "R21: no count at zero");
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
  assert.equal(a.querySelector(".cs-people").getAttribute("aria-label"), "3 members: dev, rosa, teo");
  assert.deepEqual(a.querySelector(".cs-people").querySelectorAll("i").map((i) => i.textContent), ["D", "R", "T"]);
  assert.equal(b.querySelector(".cs-people").getAttribute("aria-label"), "1 members: ana");
  // Eight bars, oldest first, the newest marked; the word: busy (more lately), quiet (none lately), steady (about the same).
  assert.equal(a.querySelector(".cs-spark").querySelectorAll("i").length, 8);
  assert.equal(a.querySelector(".cs-spark").getAttribute("aria-label"), "busy: 3, 5, 4, 6, 8, 7, 9, 11 acts a week over the last eight weeks");
  assert.equal(a.querySelector(".cs-spark i.now").getAttribute("style"), "height:18px");
  assert.equal(b.querySelector(".cs-spark b").textContent, "quiet");
  assert.equal(c.querySelector(".cs-spark b").textContent, "steady");
  assert.match(text(p, a), /Last change 12 October 2026/);
  assert.match(text(p, b), /No change in the last eight weeks/);
  // Control: a row answering none of the three draws none of them, and says nothing of them.
  const bare = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-9", name: "Bare", stage: "forming" }] }) });
  await settle();
  assert.equal(main(bare).querySelector(".cs-people, .cs-spark"), null);
  assert.doesNotMatch(text(bare), /Last change|No change/);
});

test("R10 (DEC-201 (8); project-roster R27): each row draws its owner by handle, a reference to the member; an owner no longer active is said", async () => {
  const p = await open("/app/projects", PLANE);
  const [a, b] = rows(p);
  assert.match(text(p, a), /Owner: dev/);
  assert.ok(a.querySelectorAll(".cs-card, a.cs-ref").some((e) => e.textContent === "dev"));
  assert.match(text(p, b), /No active owner/);
  // An owner answered with no handle (project-roster R27's form when the handle is unknown) is drawn by its member id.
  const nohandle = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-8", name: "N", stage: "forming", owner: { member: "M-7", handle: null } }] }) });
  assert.match(text(nohandle, rows(nohandle)[0]), /Owner: M-7/);
  assert.doesNotMatch(text(nohandle), /No active owner/);
  // Control: a row answering no owner says nothing of one.
  const bare = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-9", name: "Bare", stage: "forming" }] }) });
  assert.doesNotMatch(text(bare, rows(bare)[0]), /Owner|owner/);
});

test("R10: a list answered truncated says more projects exist; none says so in its own words; a failed read is drawn failed", async () => {
  const t = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, truncated: true, projects: [{ id: "PROJ-1", name: "A", stage: "forming" }] }) });
  assert.match(text(t), /Your group has more projects than are shown here\./);
  assert.doesNotMatch(text(await open("/app/projects", PLANE)), /more projects than are shown/);
  const none = await open("/app/projects", { ...PLANE, projectlist: ok({ ok: true, projects: [] }) });
  assert.match(text(none), /No projects yet\./);
  const failed = await open("/app/projects", { ...PLANE, projectlist: refused("STORE_DID_NOT_ANSWER", null, 502) });
  assert.ok(main(failed).querySelector('[data-state="failed"]'));
  assert.doesNotMatch(text(failed), /No projects yet/);
});

test("R10: \"Start a project\" sends promote with the member's title as a new forming project and opens it; with no title nothing is sent", async () => {
  const p = await open("/app/projects", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-77" }) });
  assert.equal(button(p, "promote").textContent.startsWith("Start a project"), true);
  const b = await press(p, "promote", { values: { "projects-title": " " } });
  assert.equal(p.byOp("promote").length, 0);
  assert.equal(beside(p, b), "Give the project a title first.");
  await press(p, "promote", { values: { "projects-title": " Park bond oversight " } });
  const body = last(p, "promote").body;
  assert.deepEqual([body.base, body.meta.object_type, body.meta.title, body.meta.current_state], [null, "project", "Park bond oversight", "forming"]);
  assert.match(body.files[0].text, /^---\nobject_type: project\nobjective: "Park bond oversight"\ncurrent_state: forming\n/);
  assert.equal(p.location.pathname, "/app/project/PROJ-77");
  assert.deepEqual(ops(await open("/app/projects", { ...PLANE, whoami: ok({ ...MEMBER, capabilities: [] }) })), [], "drawn only to a session that may contribute");
});

test("R20 (DEC-228 (4)): projects offers \"Imported cases\", a reference opening imported", async () => {
  const p = await open("/app/projects", PLANE);
  const link = main(p).querySelectorAll("a.cs-ref").find((a) => a.getAttribute("href") === "/app/imported");
  assert.ok(link);
  assert.equal(link.textContent, "Another group's case");
  await p.click(link);
  assert.equal(p.location.pathname, "/app/imported");
});

test("R23: \"Start a project\" opens its title field on press, as the act's own words, never an always-open field; the definition is said once", async () => {
  const p = await open("/app/projects", { ...PLANE, ...CREATOR });
  const start = main(p).querySelector('details[data-start="project"]');
  assert.equal(text(p, start.querySelector("summary")), "Start a project");
  assert.equal(start.getAttribute("open"), null);
  assert.ok(start.querySelector("#projects-title"));
  assert.equal((text(p).match(/one problem the group wants to get to the bottom of/g) || []).length, 1, "the definition once");
  const none = await open("/app/projects", { ...PLANE, ...CREATOR, projectlist: ok({ ok: true, projects: [] }) });
  assert.equal((text(none).match(/one problem the group wants to get to the bottom of/g) || []).length, 1, "and once in the empty state");
});
