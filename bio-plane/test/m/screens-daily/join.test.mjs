/* A member who may not start projects (R42), Themes on Projects (R43, R66), on the real served page over the REAL store (store-request's
   `storeWorld()`, op-tables §5.3): the team, its members, projects, invitations, requests and themes are made by the real acts, and every
   answer the page reads is the real store's. Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import "../../sandbox.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { storeWorld } from "../store-request/fixtures.mjs";
import { httpError } from "../interface-shell/harness.mjs";
import { open as openRaw, text, ops, button, press, last, main, word, dmy, settle, withScreens } from "./page.mjs";

// The screens a reference opens are registered, as on the real page (a reference to one that is not is a card only).
const open = (w, as, path, plane = {}) => openRaw(path, plane, { ...w.boot(as), screens: withScreens("theme", "project", "document") });
const timeout = { timeout: 180000 };

/** A team: rosa (administrator, so she may start projects and owns every project), ruth (may not start projects), and the projects
 *  "Library hours" (hidden; ruth is invited), "Pothole repairs" and "Bus stops" (findable; ruth has asked for "Bus stops") and "Old"
 *  (findable; ruth asked and withdrew). All by the real acts. */
async function team({ ruthCaps = ["contribute"] } = {}) {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  const ruth = await w.signIn("ruth", { capabilities: ruthCaps });
  const make = async (title, findable) => {
    const id = await w.recipes.project(rosa, title);
    if (findable) await rosa.act("projectvisibilityset", { query: { projectId: id, setting: "discoverable", reason: "open to ask" } });
    return id;
  };
  const library = await make("Library hours", false), pothole = await make("Pothole repairs", true), bus = await make("Bus stops", true), old = await make("Old", true);
  await rosa.act("projectinvite", { query: { projectId: library, handle: "ruth" } });
  await ruth.act("projectrequest", { query: { projectId: bus } });
  await ruth.act("projectrequest", { query: { projectId: old } });
  await ruth.act("projectrequestwithdraw", { query: { projectId: old } });
  const roster = await rosa.read("memberlist");
  const admins = roster.members.filter((m) => m.status === "active" && m.role === "admin").map((m) => m.handle).join(", ");
  return { w, rosa, ruth, library, pothole, bus, old, admins };
}

test("R42: a member who may not start projects is drawn no doors and no start form, and reads \"Getting into a project\" with the ways in and whom to ask", timeout, async () => {
  const { w, ruth, library, pothole, bus, old, admins } = await team();
  const p = await open(w, ruth, "/app");
  await settle();
  assert.ok(!ops(p).includes("promote"), "no Start a project");
  assert.ok(!main(p).querySelector("details[data-start]"));
  assert.deepEqual(main(p).querySelectorAll(".mk-door").map((d) => d.getAttribute("data-door")), ["elsewhere"], "\"Help for my own situation\" stays for everyone");
  assert.ok(!text(p).includes(word("door.front.intro")));
  // K5148 (03 R20): the lone door has no "What happened?" over it; control below: the administrator's Home still has it.
  assert.ok(!text(p).includes(word("door.front.head")), "no heading over a lone door");
  const t = text(p);
  assert.ok(t.includes(word("screen.home.join.heading")) && t.includes(word("screen.home.join.lead")));
  // The invitation as the invitation item reads, with Join.
  assert.ok(t.includes(word("queue.project-invitation.summary.unnamed", { project: "Library hours" })));
  assert.ok(t.includes(word("queue.project-invitation.detail")));
  // The findable project she has not asked for: "Ask to join"; the one she has asked for is in her requests with "Withdraw".
  assert.ok(t.includes("Pothole repairs") && t.includes(word("projects.findable.meta")));
  const askable = main(p).querySelectorAll('button[data-act="projectrequest"]');
  assert.deepEqual(askable.map((b) => b.dataset.project).sort(), [old, pothole].sort(), "the projects she has no open request for (a withdrawn request may be made again), not \"Bus stops\"");
  assert.ok(!askable.some((b) => b.dataset.project === bus));
  const asked = (await w.signIn("ruth").then((r) => r.read("projectrequests"))).requests.find((r) => r.project === bus).asked;
  assert.ok(t.includes(word("projects.request.asked", { date: dmy(asked.slice(0, 10)) })), "the date she asked");
  assert.equal(main(p).querySelectorAll('button[data-act="projectrequestwithdraw"]').length, 1, "a withdrawn request is not drawn");
  assert.equal(button(p, "projectrequestwithdraw").dataset.project, bus);
  assert.ok(t.includes(word("screen.home.join.nocreate", { admins })), "whom to ask");
  // Each way in is the real act: asking, then withdrawing, then joining the project she was invited to.
  await press(p, "projectrequest", { nth: askable.findIndex((b) => b.dataset.project === pothole) });
  assert.equal(last(p, "projectrequest").query.projectId, pothole);
  assert.ok((await ruth.read("projectrequests")).requests.some((r) => r.project === pothole && r.state === "open"), "the request is recorded");
  const q = await open(w, ruth, "/app");
  await settle();
  await press(q, "projectrequestwithdraw");
  assert.equal(last(q, "projectrequestwithdraw").query.projectId, bus);
  assert.ok(!(await ruth.read("projectrequests")).requests.some((r) => r.project === bus && r.state === "open"), "the request is withdrawn");
  const j = await open(w, ruth, "/app");
  await settle();
  await press(j, "projectjoin");
  assert.equal(last(j, "projectjoin").query.projectId, library);
  assert.equal((await ruth.read("projectlist")).projects.find((x) => x.id === library).participation, "joined", "she joined");
  // Control: a member in a project is not drawn the section.
  const joined = await open(w, ruth, "/app");
  await settle();
  assert.ok(!text(joined).includes(word("screen.home.join.heading")));
  // With no invitation, no findable project and no request: "none" in place of the rows and the note.
  const none = await storeWorld({ group: null });
  const rosa2 = await none.signIn("rosa", { admin: true });
  const zed = await none.signIn("zed", { capabilities: ["contribute"] });
  const hidden = await none.recipes.project(rosa2, "Hidden work");
  await rosa2.act("projectvisibilityset", { query: { projectId: hidden, setting: "hidden", reason: "keep it to ourselves" } });
  const nobody = await open(none, zed, "/app");
  await settle();
  const admins2 = (await rosa2.read("memberlist")).members.filter((m) => m.status === "active" && m.role === "admin").map((m) => m.handle).join(", ");
  assert.ok(text(nobody).includes(word("screen.home.join.none", { admins: admins2 })));
  assert.ok(!text(nobody).includes(word("screen.home.join.nocreate", { admins: admins2 })));
  // Control: an administrator is drawn the doors, their heading and the form.
  const admin = await open(none, rosa2, "/app");
  await settle();
  assert.ok(ops(admin).includes("promote") && main(admin).querySelectorAll(".mk-door").length > 1);
  assert.ok(text(admin).includes(word("door.front.head")), "with the five doors the heading is drawn");
  assert.ok(!text(admin).includes(word("screen.home.join.heading")));
});

test("R42: Projects draws an Invited section and a Findable section, and says whom to ask in place of \"Start a project\"", timeout, async () => {
  const { w, ruth, pothole, bus, admins } = await team();
  const p = await open(w, ruth, "/app/projects");
  await settle();
  const heads = main(p).querySelectorAll("section h2").map((h) => h.textContent);
  assert.ok(heads.includes(word("projects.invited.head")) && heads.includes(word("projects.findable.head")));
  assert.ok(text(p).includes(word("screen.projects.nocreate", { admins })));
  assert.ok(!main(p).querySelector("details[data-start]") && !ops(p).includes("promote"));
  assert.ok(ops(p).includes("projectjoin") && ops(p).includes("projectrequest") && ops(p).includes("projectrequestwithdraw"));
  const askable = main(p).querySelectorAll('button[data-act="projectrequest"]');
  assert.ok(askable.some((b) => b.dataset.project === pothole) && !askable.some((b) => b.dataset.project === bus));
  assert.equal(button(p, "projectrequestwithdraw").dataset.project, bus);
  await press(p, "projectrequest", { nth: askable.findIndex((b) => b.dataset.project === pothole) });
  assert.equal(last(p, "projectrequest").query.projectId, pothole);
  // Control: a member who may start projects is drawn the form and not the sentence.
  const cy = await w.signIn("cy", { capabilities: ["contribute", "create_projects"] });
  const c = await open(w, cy, "/app/projects");
  await settle();
  assert.ok(c.doc.querySelector("details[data-start]"));
  assert.ok(!text(c).includes(word("screen.projects.nocreate", { admins })));
});

for (const path of ["/app", "/app/queue"]) {
  test(`R42 (${path}): an owner's request to join waits in Needs you and the queue with Grant and Decline, which send projectrequestanswer; an answered request is not drawn`, timeout, async () => {
    const w = await storeWorld({ group: null });
    const rosa = await w.signIn("rosa", { admin: true });
    const dev = await w.signIn("dev");
    const project = await w.recipes.project(rosa, "Coliseum");
    await rosa.act("projectvisibilityset", { query: { projectId: project, setting: "discoverable", reason: "open to ask" } });
    await dev.act("projectrequest", { query: { projectId: project, comment: "I live next door" } });
    const p = await open(w, rosa, path);
    await settle();
    const t = text(p);
    assert.ok(t.includes(word("queue.project-request.summary", { who: "dev", project: "Coliseum" })), path);
    assert.ok(t.includes(word("queue.project-request.detail")) && t.includes("I live next door"), "her own words");
    const answers = () => main(p).querySelectorAll('button[data-act="projectrequestanswer"]');
    assert.deepEqual(answers().map((b) => b.dataset.answer), ["grant", "decline"]);
    assert.ok(answers().map((b) => b.textContent).every((x, i) => x.startsWith(word(["screen.home.request.grant", "screen.home.request.decline"][i]))));
    await press(p, "projectrequestanswer", { nth: 1 });
    const r = last(p, "projectrequestanswer");
    assert.deepEqual([r.query.projectId, r.query.handle, r.query.answer], [project, "dev", "decline"]);
    assert.ok((await dev.read("projectrequests")).requests.some((x) => x.project === project && x.state !== "open"), "the real request is answered");
    assert.equal(answers().length, 0, "answered: not drawn");
  });
}

test("R43: Projects reads themeread and draws the Themes section under the list: each theme its name as a reference opening theme, no count, and \"Every theme\"", timeout, async () => {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  await w.recipes.project(rosa, "Mine");
  const ids = {};
  for (const [name, test_] of [["Deferred maintenance", "a repair put off"], ["Overtime", "hours past the shift"], ["Contracts", "a signed agreement"]]) {
    ids[name] = (await rosa.act("themedeclare", { body: { name, test: test_ } })).theme_id;
    w.tick(1000);
  }
  const p = await open(w, rosa, "/app/projects");
  await settle();
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word("theme.section"));
  assert.ok(sec, "the Themes section");
  assert.ok(text(p, sec).includes(word("theme.never.evidence")));
  const names = sec.querySelectorAll(".cs-row a.cs-ref, .cs-row .cs-card").map((a) => a.textContent);
  assert.deepEqual([...names].sort(), ["Contracts", "Deferred maintenance", "Overtime"]);
  assert.doesNotMatch(text(p, sec).replace(word("theme.never.evidence"), "").replace(word("theme.across"), ""), /\d/, "no count, no test, no author on a row");
  assert.ok(!text(p, sec).includes("a repair put off"));
  const every = sec.querySelectorAll("a").find((a) => a.textContent === word("theme.every"));
  assert.equal(every.getAttribute("href"), "/app/theme");
  const row = sec.querySelectorAll("a").find((a) => a.textContent === "Overtime");
  assert.equal(row.getAttribute("href"), "/app/theme/" + ids.Overtime, "a reference opening theme");
});

test("R66: Projects with no theme declared still draws the Themes section with its door to theme, and no theme rows", timeout, async () => {
  const w = await storeWorld({ group: null });
  const rosa = await w.signIn("rosa", { admin: true });
  await w.recipes.project(rosa, "Mine");
  const p = await open(w, rosa, "/app/projects");
  await settle();
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word("theme.section"));
  assert.ok(sec, "the Themes section is drawn with none declared");
  const every = sec.querySelectorAll("a").find((a) => a.textContent === word("theme.every"));
  assert.equal(every.getAttribute("href"), "/app/theme");
  assert.equal(sec.querySelectorAll(".cs-row").length, 0, "no theme rows");
  // The same with the read failed: the door is still there.
  const failed = await open(w, rosa, "/app/projects", { themeread: httpError(500) });
  await settle();
  assert.ok(main(failed).querySelectorAll("a").some((a) => a.getAttribute("href") === "/app/theme"));
});
