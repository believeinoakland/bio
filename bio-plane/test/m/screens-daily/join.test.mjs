/* A member who may not start projects (R42), Themes on Projects and Find's Theme filter (R43), on the real served page
   (interface-shell's harness). Every sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { open as openRaw, ok, refused, text, ops, button, press, last, main, word, settle, MEMBER, withScreens } from "./page.mjs";

// The screens a reference opens are registered, as on the real page (a reference to one that is not is a card only).
const open = (path, plane, o = {}) => openRaw(path, plane, { screens: withScreens("theme", "project", "document"), ...o });
import { ADMIN } from "../interface-shell/harness.mjs";

const NOCREATE = { whoami: ok({ ...MEMBER, capabilities: ["contribute"] }) };
const CREATE = { whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }) };
const ROSTER = ok({ members: [{ member_id: "admin", handle: null, founder: true, role: "admin", status: "active" },
  { member_id: "rosa", handle: "rosa", role: "admin", status: "active" }, { member_id: "mai", handle: "mai", role: "member", status: "active" }] });
const BASE = { groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants" }), queue: ok({ items: [] }), lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
  startfrom: ok({ ok: true, scripts: [{ id: "WIZ-1", version: 1, name: "Trace the deed" }], doors: [{ door: "problem", scripts: ["WIZ-1"] }, { door: "elsewhere", scripts: [], opens: "elsewhere" }] }),
  memberlist: ROSTER };
const INVITED = ok({ ok: true, projects: [{ id: "PROJ-7", name: "Library hours", stage: "forming", participation: "invited" }] });
const DIRECTORY = ok({ ok: true, projects: [{ id: "PROJ-9", name: "Pothole repairs", request: null }, { id: "PROJ-8", name: "Bus stops", request: { state: "open", asked: "2026-10-10T10:00:00Z" } }] });
const REQUESTS = ok({ ok: true, own: true, requests: [{ project: "PROJ-8", name: "Bus stops", state: "open", asked: "2026-10-10T10:00:00Z" }, { project: "PROJ-6", name: "Old", state: "withdrawn", asked: "2026-09-01T10:00:00Z" }] });
const ADMINS = word("member.founder.unnamed") + ", rosa";

test("R42: a member who may not start projects is drawn no doors and no start form, and reads \"Getting into a project\" with the ways in and whom to ask", async () => {
  const p = await open("/app", { ...BASE, ...NOCREATE, projectlist: INVITED, projectdirectory: DIRECTORY, projectrequests: REQUESTS });
  assert.ok(!ops(p).includes("promote"), "no Start a project");
  assert.ok(!main(p).querySelector("details[data-start]"));
  assert.deepEqual(main(p).querySelectorAll(".mk-door").map((d) => d.getAttribute("data-door")), ["elsewhere"], "\"Help for my own situation\" stays for everyone");
  assert.ok(!text(p).includes(word("door.front.intro")));
  // K5148 (03 R20): the lone door has no "What happened?" over it; control below: the administrator's Home still has it.
  const lone = main(p).querySelectorAll("section").find((x) => x.querySelector('[data-door="elsewhere"]'));
  assert.ok(lone && !text(p, lone).includes(word("door.front.head")) && !text(p).includes(word("door.front.head")), "no heading over a lone door");
  const t = text(p);
  assert.ok(t.includes(word("screen.home.join.heading")) && t.includes(word("screen.home.join.lead")));
  // The invitation as the invitation item reads, with Join.
  assert.ok(t.includes(word("queue.project-invitation.summary.unnamed", { project: "Library hours" })));
  assert.ok(t.includes(word("queue.project-invitation.detail")));
  await press(p, "projectjoin");
  assert.equal(last(p, "projectjoin").query.projectId, "PROJ-7");
  // The findable project she has not asked for: "Ask to join"; the one she has asked for is in her requests with "Withdraw".
  assert.ok(t.includes("Pothole repairs") && t.includes(word("projects.findable.meta")));
  assert.equal(main(p).querySelectorAll('button[data-act="projectrequest"]').length, 1, "only the project she has not asked");
  assert.equal(button(p, "projectrequest").dataset.project, "PROJ-9");
  assert.ok(t.includes(word("projects.request.asked", { date: "10 October 2026" })) || /Bus stops/.test(t));
  assert.equal(main(p).querySelectorAll('button[data-act="projectrequestwithdraw"]').length, 1, "a closed request is not drawn");
  assert.ok(t.includes(word("screen.home.join.nocreate", { admins: ADMINS })), "whom to ask");
  await press(p, "projectrequest");
  assert.equal(last(p, "projectrequest").query.projectId, "PROJ-9");
  await press(p, "projectrequestwithdraw");
  assert.equal(last(p, "projectrequestwithdraw").query.projectId, "PROJ-8");
  // With all three empty: "none" in place of the rows and the note.
  const none = await open("/app", { ...BASE, ...NOCREATE, projectlist: ok({ ok: true, projects: [] }), projectdirectory: ok({ ok: true, projects: [] }), projectrequests: ok({ ok: true, requests: [] }) });
  assert.ok(text(none).includes(word("screen.home.join.none", { admins: ADMINS })));
  assert.ok(!text(none).includes(word("screen.home.join.nocreate", { admins: ADMINS })));
  // Controls: an administrator is drawn the doors and the form; a member in a project is not drawn the section.
  const admin = await open("/app", { ...BASE, whoami: ok({ ...ADMIN, capabilities: ["contribute"] }), projectlist: INVITED });
  assert.ok(ops(admin).includes("promote") && admin.doc.querySelector('[data-door="problem"]'));
  assert.ok(text(admin).includes(word("door.front.head")), "control: with the five doors the heading is drawn");
  assert.ok(!text(admin).includes(word("screen.home.join.heading")));
  const joined = await open("/app", { ...BASE, ...NOCREATE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "Mine", participation: "joined" }] }), projectdirectory: DIRECTORY, projectrequests: REQUESTS });
  assert.ok(!text(joined).includes(word("screen.home.join.heading")));
});

test("R42: Projects draws an Invited section and a Findable section, and says whom to ask in place of \"Start a project\"", async () => {
  const plane = { ...BASE, ...NOCREATE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-7", name: "Library hours", participation: "invited" }, { id: "PROJ-1", name: "Mine", participation: "joined" }] }),
    projectdirectory: DIRECTORY, projectrequests: REQUESTS, projectquestions: ok({ ok: true, items: [], cursor: null }) };
  const p = await open("/app/projects", plane);
  const heads = main(p).querySelectorAll("section h2").map((h) => h.textContent);
  assert.ok(heads.includes(word("projects.invited.head")) && heads.includes(word("projects.findable.head")));
  assert.ok(text(p).includes(word("screen.projects.nocreate", { admins: ADMINS })));
  assert.ok(!main(p).querySelector("details[data-start]") && !ops(p).includes("promote"));
  assert.ok(ops(p).includes("projectjoin") && ops(p).includes("projectrequest") && ops(p).includes("projectrequestwithdraw"));
  await press(p, "projectrequest");
  assert.equal(last(p, "projectrequest").query.projectId, "PROJ-9");
  // Control: a member who may start projects is drawn the form and not the sentence.
  const c = await open("/app/projects", { ...plane, ...CREATE });
  assert.ok(c.doc.querySelector("details[data-start]"));
  assert.ok(!text(c).includes(word("screen.projects.nocreate", { admins: ADMINS })));
});

test("R42: an owner's request to join waits in Needs you and the queue with Grant and Decline, which send projectrequestanswer; an answered request is not drawn", async () => {
  const item = { id: "OBLIGATION::project-request::PROJ-1::dev", class: "OBLIGATION", kind: "project-request", subject: { kind: "project", id: "PROJ-1", name: "Coliseum", requester: "dev" },
    summary: "dev asks to join Coliseum", detail: "x", quote: { by: "dev", text: "I live next door" }, assignee: "mai", assignee_role: null,
    options: [{ id: "projectrequestanswer", answers: [{ answer: "grant", label: "Grant" }, { answer: "decline", label: "Decline" }] }], age: { since: "2026-10-10T10:00:00Z" } };
  let items = [item];
  const plane = { ...BASE, ...CREATE, queue: () => ok({ items }), projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "Coliseum", participation: "joined" }] }),
    projectquestions: ok({ ok: true, items: [], cursor: null }), projectrequestanswer: () => { items = []; return ok({ ok: true }); } };
  for (const path of ["/app", "/app/queue"]) {
    items = [item];
    const p = await open(path, plane);
    const t = text(p);
    assert.ok(t.includes(word("queue.project-request.summary", { who: "dev", project: "Coliseum" })), path);
    assert.ok(t.includes(word("queue.project-request.detail")) && t.includes("I live next door"), "her own words");
    assert.deepEqual(main(p).querySelectorAll('button[data-act="projectrequestanswer"]').map((b) => b.dataset.answer), ["grant", "decline"]);
    assert.ok(main(p).querySelectorAll('button[data-act="projectrequestanswer"]').map((b) => b.textContent).every((x, i) => x.startsWith(word(["screen.home.request.grant", "screen.home.request.decline"][i]))));
    await press(p, "projectrequestanswer", { nth: 1 });
    const r = last(p, "projectrequestanswer");
    assert.deepEqual([r.query.projectId, r.query.handle, r.query.answer], ["PROJ-1", "dev", "decline"]);
    assert.equal(main(p).querySelectorAll('button[data-act="projectrequestanswer"]').length, 0, "answered: not drawn");
  }
});

test("R43: Projects reads themeread and draws the Themes section under the list: each theme its name as a reference opening theme, no count, and \"Every theme\"", async () => {
  const themes = ok({ ok: true, themes: [{ theme_id: "THM-1", name: "Deferred maintenance", test: "a repair put off", at: "2026-10-01" }, { theme_id: "THM-2", name: "Overtime", test: "x", at: "2026-09-01" }, { theme_id: "THM-3", name: "Contracts", test: "y", at: "2026-08-01" }] });
  const plane = { ...BASE, ...CREATE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "Mine", participation: "joined" }] }), projectquestions: ok({ ok: true, items: [], cursor: null }), themeread: themes };
  const p = await open("/app/projects", plane);
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word("theme.section"));
  assert.ok(sec, "the Themes section");
  assert.ok(text(p, sec).includes(word("theme.never.evidence")));
  const names = sec.querySelectorAll(".cs-row a.cs-ref, .cs-row .cs-card").map((a) => a.textContent);
  assert.deepEqual(names, ["Deferred maintenance", "Overtime", "Contracts"]);
  assert.doesNotMatch(text(p, sec).replace(word("theme.never.evidence"), ""), /\d/, "no count, no test, no author on a row");
  assert.ok(!text(p, sec).includes("a repair put off"));
  const every = sec.querySelectorAll("a").find((a) => a.textContent === word("theme.every"));
  assert.equal(every.getAttribute("href"), "/app/theme");
  const row = sec.querySelectorAll("a").find((a) => a.textContent === "Overtime");
  assert.equal(row.getAttribute("href"), "/app/theme/THM-2", "a reference opening theme");
});

test("R66: Projects with no theme declared still draws the Themes section with its door to theme, and no theme rows", async () => {
  const plane = { ...BASE, ...CREATE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "Mine", participation: "joined" }] }), projectquestions: ok({ ok: true, items: [], cursor: null }), themeread: ok({ ok: true, themes: [] }) };
  const p = await open("/app/projects", plane);
  const sec = main(p).querySelectorAll("section").find((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word("theme.section"));
  assert.ok(sec, "the Themes section is drawn with none declared");
  const every = sec.querySelectorAll("a").find((a) => a.textContent === word("theme.every"));
  assert.equal(every.getAttribute("href"), "/app/theme");
  assert.equal(sec.querySelectorAll(".cs-row").length, 0, "no theme rows");
  // The same with the read failed: the door is still there.
  const failed = await open("/app/projects", { ...plane, themeread: refused("THEMES_DOWN", "x", 500) });
  assert.ok(main(failed).querySelectorAll("a").some((a) => a.getAttribute("href") === "/app/theme"));
});
