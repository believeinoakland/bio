/* The group's home (R1, R8, R9, R11, R17, R23, R25, R28–R31) on the real served page (interface-shell's harness): what it
   reads, what it draws in each state, and the acts it offers, run through the shell's kit, gate and re-reads. Every
   sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, batched, text, ops, button, press, beside, last, main, screen, settle, MEMBER, word, hasWord, dmy, inOrder, withScreens } from "./page.mjs";
import { ADMIN } from "../interface-shell/harness.mjs";

// A busy group's home, as the plane answers each read Home draws (R17).
const QITEMS = [
  { id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Vouch for 3 photos", due: "2026-10-12", assignee: "mai", assignee_role: "member",
    options: [], disposition: { instead: "taskresolve" }, subject: { kind: "bundle", id: "INF-7" } },
  { id: "OBLIGATION::update-ready::0.84.0", class: "OBLIGATION", kind: "update-ready", assignee: "mai", assignee_role: "admin",
    detail: { version: "0.84.0", date: "2026-10-13", security: true }, options: [{ id: "updatelater" }] },
  { id: "TSK-2", class: "OBLIGATION", kind: "action-reminder", summary: "Send the follow-up letter", assignee: "unassigned", assignee_role: "admin", subject: { kind: "action", id: "ACT-1" } },
  { id: "CONDITION::b", class: "CONDITION", kind: "reply", summary: "A reply is due", subject: { kind: "action", id: "ACT-2" } },
  { id: "FINDING::source-modified::1", class: "FINDING", kind: "source-modified", title: "Lease amendment", summary: "B-1 changed (404)", subject: { kind: "bundle", id: "INF-1" } },
  { id: "FINDING::source-modified::2", class: "FINDING", kind: "source-modified", title: null, summary: "B-2 changed", subject: { kind: "bundle", id: "INF-2" } },
];
const PLANE = {
  whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }),
  groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants", description: "Rents and leases on city land." }),
  queue: ok({ items: QITEMS, item_count: 6 }),
  projectlist: ok({ ok: true, count: 3, limit: 200, truncated: false, projects: [
    // Each project's questions and drafts shared for review are on its roster row (project-roster R42): PROJ-1 holds 3 questions and shares drafts, PROJ-2 one, PROJ-3 none.
    { id: "PROJ-1", name: "The Coliseum lease", stage: "investigating", lastChange: "2026-10-12T15:00:00Z", question_count: 3, shared_drafts: { count: 3, newest: "2026-10-10T10:00:00Z" } },
    { id: "PROJ-2", name: "Pothole repairs", stage: "forming", lastChange: "2026-09-20T15:00:00Z", question_count: 1, shared_drafts: { count: 0, newest: null } },
    { id: "PROJ-3", name: "Odd", stage: "paused", question_count: 0, shared_drafts: null },
  ] }),
  // K5148 (R42): "What happened?" is asked over the five doors only, so a member who may start projects is offered at least one with a script.
  startfrom: ok({ ok: true, scripts: [{ id: "WIZ-33b5887790b7561b", version: 1, name: "Trace the deed", start: "finder" }],
    doors: [{ door: "problem", scripts: ["WIZ-33b5887790b7561b"] }, { door: "elsewhere", scripts: [], opens: "elsewhere" }] }),
  lookedsince: ok({ since: "2026-10-01T00:00:00Z" }),
};
const CREATOR = { whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }) };
const ADMIN_PLANE = { ...PLANE, whoami: ok({ ...ADMIN, member: "mai", handle: "mai", capabilities: ["contribute", "create_projects"] }),
  memberlist: ok({ members: [{ member_id: "rosa", handle: "rosa", role: "admin", status: "active" }, { member_id: "mai", handle: "mai", role: "member", status: "active" },
    { member_id: "dev", handle: "dev", role: "member", status: "active" }, { member_id: "k", handle: null, role: "member", status: "invited" }] }),
  bootstrap: ok({ ok: true, service: "bio", version: "0.83.0", test_instance: false }),
  profiles: ok({ ok: true, profiles: [{ id: "p1", name: "River Town" }] }),
  grouplanguages: ok({ languages: ["en", "es"] }),
  aiuseovertime: ok({ owner: "group", days: [], periods: [{ scope: "overall", unit: "usd", period: "month", period_start: "2026-10-01", used: 31.4, limit: 60 }] }) };
const sections = (p) => main(p).querySelectorAll("section").map((x) => (x.querySelector("h2") ? x.querySelector("h2").textContent : x.getAttribute("data-front")));

test("R17: Home reads the queue, projectlist, startfrom, lookedsince and groupidentity; to an administrator also memberlist, bootstrap, profiles, grouplanguages and aiuseovertime (group)", async () => {
  const p = await open("/app", PLANE);
  for (const op of ["queue", "projectlist", "startfrom", "lookedsince", "groupidentity"]) assert.ok(p.byOp(op).length >= 1, op);
  assert.equal(p.byOp("lookedsince").length, 1, "read once per visit");
  assert.equal(p.byOp("search").length, 0, "R8: no search over type:project");
  assert.equal(p.byOp("projectdirectory").length, 0, "R17 amends R1: no list of projects to join");
  for (const op of ["memberlist", "profiles", "grouplanguages", "aiuseovertime"]) assert.equal(p.byOp(op).length, 0, `control: ${op} is an administrator's`);
  const a = await open("/app", ADMIN_PLANE);
  for (const op of ["memberlist", "profiles", "grouplanguages"]) assert.equal(a.byOp(op).length, 1, op);
  assert.equal(a.byOp("bootstrap").length, 1, "R122: the Administration reading's bootstrap is answered from the page's one answer: one request");
  assert.equal(p.byOp("bootstrap").length, 1, "and one for a member's page");
  assert.equal(a.byOp("queue").filter((r) => r.query.count !== "true" && r.query.count !== "1").length, 1, "C14: one list read of the queue (the frame's own is the count)");
  assert.equal(a.byOp("aiuseovertime")[0].query.owner, "group");
});

test("R17, R28, R31: a busy home draws, in order, the strip, Needs you, Needs the group, each area at a glance, the projects, Since you last looked and What happened?", async () => {
  const p = await open("/app", ADMIN_PLANE, { screens: withScreens("document") });
  await settle();
  assert.deepEqual(sections(p), [word("screen.home.needsyou"), word("screen.home.needsgroup"), word("screen.home.areas"), word("screen.home.projects"),
    word("screen.home.since"), word("door.front.head")]);
  const strip = main(p).querySelector(".mk-strip");
  const order = main(p).querySelectorAll(".mk-strip, h1, section");
  assert.ok(strip && order[0] === strip, "the strip comes first, above the heading and every block");
  // R31: the strip counts no item as overdue.
  assert.deepEqual(strip.querySelectorAll("a").map((a) => text(p, a)), [`2 ${word("screen.home.strip.you")}`, `4 ${word("screen.home.strip.group")}`]);
  const you = main(p).querySelectorAll("section")[0];
  // R28: a to-do on a document names the document, a reference (here untitled: it carries none), and its act by the act's label.
  assert.ok(you.querySelector('a.cs-ref[href="/app/document/INF-7"]'), "its subject is a reference to the document");
  assert.ok(you.querySelector('button[data-act="taskresolve"]').textContent.startsWith(word("act.taskresolve.label.home")), "its act is named by the act's label");
  // R19: the update to-do on Needs you, with its security mark, and "See what changes" opening `updates`.
  assert.ok(text(p, you).includes(word("home.update.ready", { version: "0.84.0", security: word("home.update.security") })));
  assert.ok(you.querySelector('a[href="/app/updates"]'));
  // Needs the group: whose move it is.
  const group = main(p).querySelectorAll("section")[1];
  assert.ok(inOrder(text(p, group), [word("screen.home.move.admin")]));
  assert.ok(text(p, group).includes(word("screen.home.move.anyone")));
  // R22: the two source notices are one item with their count, in members' words.
  assert.ok(text(p, group).includes(word("queue.source-modified.many", { n: "2" })));
  assert.doesNotMatch(text(p), /B-1|404/);
  // The four areas, each named as its reference; Since you last looked holds the project changed since then.
  const areas = main(p).querySelectorAll(".mk-ablock").map((b) => b.getAttribute("data-area"));
  assert.deepEqual(areas, ["investigation", "action", "members", "administration"]);
  assert.equal(text(p, main(p).querySelector('[data-area="members"]')).replace(word("screen.home.area.members"), "").trim(),
    `3 ${word("screen.home.rd.members")}1 ${word("screen.home.rd.admin")}1 ${word("screen.home.rd.invited")}`);
  assert.ok(inOrder(text(p, main(p).querySelector('[data-area="administration"]')), [`0.83.0 ${word("screen.home.rd.release")}`,
    word("screen.home.line.places", { places: "River Town" }), word("screen.home.line.languages", { languages: "English, español" }),
    word("screen.home.line.ailimit", { used: "$31.40", limit: "$60.00" })]));
  assert.ok(text(p, main(p).querySelector('[data-area="investigation"]')).includes(`3 ${word("screen.home.rd.projects")}4 ${word("screen.home.rd.questions")}`));
  const since = main(p).querySelectorAll("section")[4];
  assert.ok(inOrder(text(p, since), ["The Coliseum lease", word("screen.home.since.changed", { date: dmy("2026-10-12") })]));
  assert.ok(!text(p, since).includes("Pothole repairs"), "changed before the last look: not drawn");
});

test("R17: controls: a reading at zero is not drawn, and an empty block is not drawn; a failed read is drawn failed in its block", async () => {
  const quiet = await open("/app", { ...PLANE, queue: ok({ items: [], item_count: 0 }) });
  await settle();
  assert.ok(!main(quiet).querySelector(".mk-strip"), "no strip with nothing to count");
  assert.ok(!text(quiet).includes(word("screen.home.needsyou")) && !text(quiet).includes(word("screen.home.needsgroup")));
  assert.doesNotMatch(text(quiet), /\b0 (questions?|need|to do)/);
  assert.ok(!main(quiet).querySelector('[data-area="action"]'), "an area with nothing to show is left out");
  const failed = await open("/app", { ...PLANE, queue: refused("STORE_DID_NOT_ANSWER", null, 502), projectlist: refused("STORE_DID_NOT_ANSWER", null, 502), lookedsince: refused("STORE_DID_NOT_ANSWER", null, 502) });
  assert.ok(main(failed).querySelectorAll('[data-state="failed"]').length >= 3, "the queue, the projects and lookedsince each drawn failed");
  assert.ok(text(failed).includes(word("screen.home.needsyou")));
  assert.ok(text(failed).includes(word("screen.home.since")));
});

test("R17, R11: a new member's first visit (lookedsince answers null) draws no Needs you and no Since you last looked", async () => {
  const p = await open("/app", { ...PLANE, lookedsince: ok({ since: null }) });
  await settle();
  assert.ok(!text(p).includes(word("screen.home.needsyou")) && !text(p).includes(word("screen.home.since")));
  assert.ok(text(p).includes(word("screen.home.needsgroup")), "the group's items are still drawn");
});

test("R23: the heading is the group's name, or \"Your group\" while none is set, never the slug", async () => {
  const p = await open("/app", PLANE);
  assert.equal(main(p).querySelector("h1").textContent, "Lakeshore Tenants");
  assert.match(text(p), /Rents and leases on city land\./);
  const unnamed = await open("/app", { ...PLANE, groupidentity: ok({ ok: true, group: "lakeshore", display_name: null }) });
  assert.equal(main(unnamed).querySelector("h1").textContent, word("shell.group.unnamed"));
  assert.doesNotMatch(text(unnamed), /lakeshore/);
});

test("R40, R17, R23, R11: an unnamed new team's home is headed \"Your team\", leads with \"Name your team\" as its primary button and draws the other steps in order, then What happened?, nothing else", async () => {
  const fresh = { ...ADMIN_PLANE, groupidentity: ok({ ok: true, group: "lakeshore", display_name: null }), projectlist: ok({ ok: true, projects: [] }), queue: ok({ items: [] }),
    memberlist: ok({ members: [{ member_id: "mai", handle: "mai", role: "admin", status: "active" }] }) };
  const p = await open("/app", fresh);
  assert.deepEqual(sections(p), [word("home.ready.title"), word("door.front.head")]);
  assert.equal(main(p).querySelector("h1").textContent, word("shell.group.unnamed"));
  const steps = main(p).querySelectorAll("ol.mk-next li");
  assert.equal(steps.length, 4);
  const link = (li) => li.querySelector("a");
  assert.deepEqual([0, 1, 2].map((i) => [link(steps[i]).textContent, link(steps[i]).getAttribute("href"), link(steps[i]).getAttribute("data-tone")]),
    [[word("home.first.name"), "/app/group", "primary"], [word("screen.home.invite"), "/app/members", "quiet"], [word("screen.home.saywho"), "/app/group-identity", "quiet"]]);
  assert.equal(text(p, steps[1]).includes(word("screen.home.first.invite")), true);
  assert.equal(text(p, steps[2]).includes(word("screen.home.first.identity")), true);
  assert.equal(text(p, steps[3]), word("screen.home.first.project"));
  assert.equal(steps[3].querySelectorAll("a, button").length, 0, "the last step has no button of its own: the doors are its act");
  assert.ok(!main(p).querySelector(".mk-ablocks, .mk-strip"));
  // Controls: a named team draws no "Name your team" and the first of the rest is primary; a team with a project, or a second
  // active member, is not new.
  const named = await open("/app", { ...fresh, groupidentity: PLANE.groupidentity });
  assert.ok(!text(named).includes(word("home.first.name")));
  assert.equal(main(named).querySelector("ol.mk-next a").getAttribute("data-tone"), "primary");
  assert.equal(main(named).querySelector("ol.mk-next a").getAttribute("href"), "/app/members");
  const notNew = async (plane) => !main(await open("/app", plane)).querySelector("ol.mk-next");
  assert.ok(await notNew({ ...fresh, projectlist: PLANE.projectlist }));
  assert.ok(await notNew({ ...fresh, memberlist: ADMIN_PLANE.memberlist }));
  assert.ok(await notNew({ ...fresh, whoami: ok({ ...MEMBER, capabilities: ["contribute"] }) }));
  assert.ok(await notNew({ ...fresh, projectlist: refused("STORE_DID_NOT_ANSWER", null, 502) }));
});

test("R1, R8: each project the member sees is a reference opening project, with its stage ladder Forming, Investigating, Matured, Closed", async () => {
  const p = await open("/app", PLANE);
  const card = main(p).querySelectorAll(".cs-card, a.cs-ref").find((a) => a.textContent === "The Coliseum lease");
  assert.ok(card);
  const withProject = await open("/app", PLANE, { screens: [...(await import("./page.mjs")).SCREENS, { id: "project", reads: () => ({}), acts: [], render: () => "" }] });
  const ref = main(withProject).querySelectorAll("a.cs-ref").find((a) => a.textContent === "The Coliseum lease");
  assert.equal(ref.getAttribute("href"), "/app/project/PROJ-1");
  const ladders = main(p).querySelectorAll(".cs-ladder");
  assert.equal(ladders.length, 3);
  const on = (l) => l.children.map((s) => s.getAttribute("class") === "on");
  assert.deepEqual(on(ladders[0]), [true, true, false, false]);
  assert.deepEqual(on(ladders[1]), [true, false, false, false]);
  assert.deepEqual(on(ladders[2]), [false, false, false, false], "an unknown stage draws no step on");
  assert.equal(ladders[0].querySelector("[aria-current]").textContent, word("screen.home.stage.investigating"));
  assert.deepEqual(ladders[0].children.map((s) => s.textContent), ["forming", "investigating", "matured", "closed"].map((s) => word(`screen.home.stage.${s}`)));
});

test("R8, R21, R25 (fix round 3, C14): each project's question count is its roster row's own, drawn with the project, picking the singular or plural key; a count at zero is not drawn; none is read project by project", async () => {
  const p = await open("/app", PLANE);
  await settle();
  assert.equal(p.byOp("projectquestions").length, 0, "no per-project read (project-roster R42)");
  assert.ok(text(p).includes("The Coliseum lease" + word("screen.home.questions.many", { n: "3" })));
  assert.ok(text(p).includes("Pothole repairs" + word("screen.home.questions.one")), "R25: one question, the singular key");
  assert.ok(!text(p).includes(word("screen.home.questions.many", { n: "0" })));
});

test("R8: a project whose stage is null is drawn undetermined; a list answered truncated says more projects exist", async () => {
  const p = await open("/app", { ...PLANE, projectlist: ok({ ok: true, truncated: true, projects: [{ id: "PROJ-5", name: "Unstaged", stage: null, question_count: 0 }] }) });
  await settle();
  assert.ok(text(p).includes("Unstaged" + word("state.undetermined", { reason: word("screen.home.stage.none") })));
  assert.equal(main(p).querySelectorAll(".cs-ladder [aria-current]").length, 0);
  assert.ok(text(p).includes(word("screen.home.truncated")));
  assert.ok(!text(await open("/app", PLANE)).includes(word("screen.home.truncated")), "control: not truncated, not said");
});

test("R1, R17 (interface-shell R10): Home's reads drawn loading, failed or with data; an empty read draws no block", async () => {
  const pend = { pending: true };
  const loading = await open("/app", { groupidentity: pend, queue: pend, projectlist: pend, startfrom: pend, lookedsince: pend });
  assert.ok(main(loading).querySelectorAll('[data-state="loading"]').length >= 2);
  const empty = await open("/app", { ...PLANE, queue: ok({ items: [], item_count: 0 }), projectlist: ok({ ok: true, projects: [] }) });
  for (const k of ["screen.home.needsyou", "screen.home.projects"]) assert.ok(!sections(empty).includes(word(k)), k);
  const failed = await open("/app", { ...PLANE, projectlist: refused("STORE_DID_NOT_ANSWER", "the store did not answer", 502) });
  assert.ok(main(failed).querySelectorAll('[data-state="failed"]').length >= 1);
  assert.ok(!text(failed).includes(word("projects.empty.sub")), "a failed read is never drawn as empty");
});

test("R17: an item's own acts on Home send their bodies and re-read the queue, never lookedsince", async () => {
  const p = await open("/app", { ...PLANE, taskresolve: ok({ ok: true }) });
  await press(p, "taskresolve");
  assert.deepEqual(last(p, "taskresolve").body, { id: "TSK-1" });
  assert.equal(p.byOp("lookedsince").length, 1, "the look is read once per visit");
  assert.ok(p.byOp("queue").length >= 2, "the queue re-read");
});

test("R1, R25, R30: \"Start a project\" sends promote with the member's title as a new forming project, written as its title, and opens project on success", async () => {
  const p = await open("/app", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-77", owner: "mai" }) });
  assert.ok(button(p, "promote").textContent.startsWith(word("project.start.go")), "the form's own act: its label, then the weight the shell draws");
  await press(p, "promote", { values: { "home-visibility-hidden": true, "home-title": "  Park bond oversight " } });
  const r = last(p, "promote");
  assert.equal(r.method, "POST");
  assert.equal(r.headers.Authorization, "Bearer tok-1");
  const body = r.body;
  assert.equal(body.base, null);
  assert.deepEqual([body.meta.object_type, body.meta.title, body.meta.current_state], ["project", "Park bond oversight", "forming"]);
  assert.match(body.snapKey, /^\d{8}T\d{6}Z_[0-9a-f]{8}$/);
  assert.equal(body.files[0].path, "bundle.md");
  // R25: the document names the title (every screen reads it), beside the objective.
  assert.match(body.files[0].text, /^---\nobject_type: project\ntitle: "Park bond oversight"\nobjective: "Park bond oversight"\ncurrent_state: forming\n/);
  assert.ok(body.files[0].text.includes(`Trigger: ${word("file.trigger.home")}\n`), "the session log's trigger is the keyed word, as text");
  assert.doesNotMatch(body.files[0].text, /^id:/m, "no id is sent: the project's id is minted (promotion R19)");
  assert.equal("owner" in body || "author" in body, false, "the owner is the door's stamp, never the page's");
  assert.equal(p.location.pathname, "/app/project/PROJ-77");
  // A title with a quote or newline stays one YAML string.
  const q = await open("/app", { ...PLANE, ...CREATOR });
  await press(q, "promote", { values: { "home-visibility-hidden": true, "home-title": 'A "quoted"\ntitle' } });
  assert.match(last(q, "promote").body.files[0].text, /\ntitle: "A \\"quoted\\"\\ntitle"\n/);
});

test("R30, R80: the form asks the title and who can find it; neither choice is preselected; none chosen sends nothing and says so; choosing findable sends discoverable", async () => {
  const p = await open("/app", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-77" }) });
  const start = main(p).querySelector('details[data-start="project"]');
  const sel = start.querySelector("#home-visibility");
  assert.ok(start.querySelector("label[for=home-title]").textContent.includes(word("project.start.title")));
  assert.ok(start.textContent.includes(word("project.start.title.help")) && start.textContent.includes(word("project.visibility.start.later")));
  assert.deepEqual(sel.querySelectorAll("input[type=radio]").map((o) => o.parentNode.textContent.trim()), [word("project.visibility.start.hidden"), word("project.visibility.start.discoverable")]);
  assert.equal(sel.querySelectorAll("input[type=radio]").filter((o) => o.checked).length, 0, "R80: nothing is chosen for the member");
  const refusedBtn = await press(p, "promote", { values: { "home-title": "Parks" } });
  assert.equal(p.byOp("promote").length, 0, "R80: Start with neither chosen sends nothing");
  assert.ok(beside(p, refusedBtn).includes(word("project.visibility.start.required")), "R80: refused in place with the required key");
  const q = await open("/app", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-78" }) });
  await press(q, "promote", { values: { "home-title": "Parks", "home-visibility-discoverable": true } });
  assert.equal(last(q, "promote").body.visibility, "discoverable");
  const h = await open("/app", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-79" }) });
  await press(h, "promote", { values: { "home-title": "Parks", "home-visibility-hidden": true } });
  assert.equal(last(h, "promote").body.visibility, "hidden", "control: hidden, once chosen, is sent");
  // PROJECT_VISIBILITY_NO_OWNER and NAME_TAKEN are drawn by their words.
  for (const code of ["PROJECT_VISIBILITY_NO_OWNER", "NAME_TAKEN"]) {
    const t = await open("/app", { ...PLANE, ...CREATOR, promote: refused(code, null, 409) });
    const b = await press(t, "promote", { values: { "home-visibility-hidden": true, "home-title": "Parks" } });
    assert.equal(beside(t, b).replace(/\s+/g, " "), word(`refusal.${code}`), code);
  }
});

test("R1, R25: control: with no title nothing is sent and the member is told in the screen's words; a refusal is drawn beside the act", async () => {
  const p = await open("/app", { ...PLANE, ...CREATOR });
  const b = await press(p, "promote", { values: { "home-title": "   " } });
  assert.equal(p.byOp("promote").length, 0);
  assert.equal(beside(p, b), word("screen.home.title.needed"));
  const t = await open("/app", { ...PLANE, ...CREATOR, promote: refused("NAME_TAKEN", null, 409) });
  const c = await press(t, "promote", { values: { "home-visibility-hidden": true, "home-title": "Parks" } });
  assert.equal(beside(t, c), word("refusal.NAME_TAKEN"));
  assert.equal(t.doc.getElementById("home-title").value, "Parks", "the form keeps what the member typed (interface-shell R13)");
  assert.equal(t.location.pathname, "/app");
});

test("R1 (interface-shell R12): \"Start a project\" is drawn only to a session that may contribute", async () => {
  const p = await open("/app", { ...PLANE, whoami: ok({ ...MEMBER, capabilities: [] }) });
  assert.ok(!ops(p).includes("promote"));
  assert.ok(!text(p).includes(word("act.promote.label.home")), "nor its disclosure");
  assert.ok(screen("home"));
});


// The front doors as startfrom answers them (wizard-scripts R23, R33, R37): "Follow the money" not offered, so `money` names
// only "Pull the file"; `person` and `read` left out (no script offered); the sixth door last, whatever else is offered.
const DOORS = ok({ ok: true,
  scripts: [
    { id: "WIZ-cb0ad18a17a04233", version: 2, name: "Pull the file", start: "request" },
    { id: "WIZ-33b5887790b7561b", version: 1, name: "Trace the deed", start: "finder" },
  ],
  doors: [
    { door: "problem", scripts: ["WIZ-33b5887790b7561b", "WIZ-cb0ad18a17a04233"] },
    { door: "money", scripts: ["WIZ-cb0ad18a17a04233"] },
    { door: "tip", scripts: [] },
    { door: "elsewhere", scripts: [], opens: "elsewhere" },
  ] });
const doorOf = (p, door) => main(p).querySelector(`[data-door="${door}"]`);
const doorOps = (p, door) => doorOf(p, door).querySelectorAll("button[data-script]").map((b) => [b.dataset.script, b.dataset.version]);

test("R9, R14, R40: \"What happened?\" draws each door startfrom answers as a button, the sixth door last; a door left out is not drawn", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  assert.equal(p.byOp("startfrom").length, 1);
  const sec = main(p).querySelector('[data-front="doors"]');
  assert.ok(text(p, sec).startsWith(word("door.front.head") + word("door.front.intro")));
  assert.deepEqual(main(p).querySelectorAll(".mk-door").map((d) => d.getAttribute("data-door")), ["problem", "money", "elsewhere"], "person, read and tip (no script) are not drawn");
  // R25: each card's title (the button) and its description are two elements.
  const card = doorOf(p, "problem");
  assert.ok(card.querySelector("button").textContent.startsWith(word("door.front.problem.name")));
  assert.equal(card.querySelectorAll("span").at(-1).textContent, word("door.front.problem.hint"));
  assert.deepEqual(doorOf(p, "elsewhere").querySelectorAll("b, span").map((c) => c.textContent), [word("door.front.elsewhere.name"), word("door.front.elsewhere.hint")]);
  // R40: no free-text box beside the doors, and no separate "Start from…" button.
  assert.ok(!p.doc.getElementById("home-words"));
  assert.ok(!main(p).querySelectorAll("button[data-act=startfrom]").some((b) => b.textContent.startsWith(word("act.startfrom.label.home"))));
});

test("R40: pressing a door sends startfrom for it and opens its offer in place; no script name is drawn before that", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  assert.equal(main(p).querySelectorAll("button[data-script]").length, 0, "no script name before a press");
  assert.doesNotMatch(text(p), /Trace the deed|Pull the file/);
  await press(p, "startfrom", { nth: 0 });
  // R81: the door is page memory; `startfrom` takes no `door` (the guard, over the owner's declaration), so the press sends it bare.
  assert.ok(p.byOp("startfrom").length >= 2 && p.byOp("startfrom").every((r) => r.query.door === undefined), "startfrom is sent on the press with no door field");
  assert.deepEqual(doorOps(p, "problem"), [["WIZ-33b5887790b7561b", "1"], ["WIZ-cb0ad18a17a04233", "2"]]);
  assert.deepEqual(doorOps(p, "money"), [], "only the pressed door is open");
  // Control: with "Follow the money" not offered, the money door names only what startfrom names.
  await p.click(doorOf(p, "money").querySelector("button"));
  await settle();
  assert.deepEqual(doorOps(p, "money").map(([id]) => id), ["WIZ-cb0ad18a17a04233"]);
});

test("R14, R16: with no script offered, the sixth door alone is drawn, so the section is always drawn; its press opens elsewhere, starts no script and sends nothing", async () => {
  const p = await open("/app", { ...PLANE, startfrom: ok({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }] }) }, { guide: GUIDE });
  assert.deepEqual(main(p).querySelectorAll(".mk-door").map((d) => d.getAttribute("data-door")), ["elsewhere"]);
  assert.ok(main(p).querySelector('[data-front="doors"]'));
  const door = doorOf(p, "elsewhere");
  assert.equal(door.getAttribute("href"), "/app/elsewhere");
  const acts = () => p.requests.filter((r) => r.method === "POST").length;
  const before = acts();
  await p.click(door);
  await settle();
  assert.equal(p.location.pathname, "/app/elsewhere");
  assert.equal(acts(), before, "no act is sent");
  assert.equal(p.byOp("wizardprogress").length, 0);
  assert.equal(p.doc.getElementById("started"), null, "no script started");
});

test("R9: startfrom failed is drawn failed in its block; startfrom is a drawn act once it answers doors with scripts", async () => {
  const failed = await open("/app", { ...PLANE, startfrom: refused("STORE_DID_NOT_ANSWER", null, 502) });
  assert.ok(main(failed).querySelector('[data-front="doors"] [data-state="failed"]'));
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  assert.ok(ops(p).includes("startfrom"));
});

// A guide standing in for screens-wizards' runner (interface-shell R31): it draws in the dock which script it was started on.
const GUIDE = {
  words: [],
  acts: [],
  render(cs, view) { return view.ui.running ? '<p id="started">' + cs.esc(view.ui.running + "@" + view.ui.version) + "</p>" : ""; },
  start(cs, view, o) { view.ui.running = o.script; view.ui.version = o.version; },
};

test("R9: a door's script starts in the wizard runner (cs.wizard) at its version, and sends nothing", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS }, { guide: GUIDE });
  await press(p, "startfrom", { nth: 1 });
  const before = p.requests.filter((r) => r.query.op !== "bootstrap").length;
  await p.click(main(p).querySelector('[data-door="money"] button[data-script]'));
  await settle();
  assert.equal(p.doc.getElementById("started").textContent, "WIZ-cb0ad18a17a04233@2", "the runner holds that script at that version");
  assert.equal(p.requests.filter((r) => r.query.op !== "bootstrap").length, before, "starting a script sends no op");
});

test("R9, R23, R40: beside the doors, the blank start, \"Start a project\" opening its title field on press; no free-text box and no matching work", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  assert.ok(text(p).includes(word("door.front.blank")));
  const start = main(p).querySelector('details[data-start="project"]');
  assert.equal(text(p, start.querySelector("summary")), word("act.promote.label.home"), "the act's own words");
  assert.equal(start.getAttribute("open"), null, "never an always-open field");
  assert.ok(start.querySelector("#home-title") && start.querySelector('button[data-act="promote"]'));
  assert.ok(!p.doc.getElementById("home-words"), "no free-text box");
  assert.equal(p.byOp("search").length, 0, "no matching work is searched");
  assert.ok(start.querySelector('button[data-act="promote"]').getAttribute("data-tip").includes(String(word("act.promote.here.home")).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;")), "the act explains itself by its Home key");
});

// A project's participants (project-roster R1): the member's own row there says whether she is invited or has joined.
const PARTICIPANTS = (states) => (req) => ok({ ok: true, projectId: req.query.projectId, participants: [{ handle: "rosa", state: "joined", owner: true },
  ...(states[req.query.projectId] ? [{ handle: "mai", state: states[req.query.projectId], owner: false }] : [])] });

test("R29: a project the member is invited to is hers to do on Home, with Join (projectjoin), as the project's participants answer her place; a joined project offers none", async () => {
  const list = ok({ ok: true, projects: [
    { id: "PROJ-1", name: "The Coliseum lease", stage: "investigating" },
    { id: "PROJ-9", name: "Library hours", stage: "forming" },
  ] });
  const p = await open("/app", { ...PLANE, projectlist: list, projectparticipants: PARTICIPANTS({ "PROJ-1": "joined", "PROJ-9": "invited" }),
    projectjoin: ok({ ok: true, projectId: "PROJ-9", state: "joined" }) }, { screens: withScreens("project") });
  await settle();
  const you = main(p).querySelectorAll("section")[0];
  assert.equal(you.querySelector("h2").textContent, word("screen.home.needsyou"));
  const join = you.querySelector('button[data-act="projectjoin"]');
  assert.ok(join && join.textContent.startsWith(word("act.projectjoin.label.home")));
  assert.ok(you.querySelector('a.cs-ref[href="/app/project/PROJ-9"]'), "the project is a reference");
  assert.equal(main(p).querySelectorAll('button[data-act="projectjoin"]').length, 1, "control: the joined project offers none");
  assert.deepEqual(p.byOp("projectparticipants").map((r) => r.query.projectId).sort(), ["PROJ-1", "PROJ-9"], "each project's participants read once");
  await press(p, "projectjoin");
  assert.equal(last(p, "projectjoin").query.projectId, "PROJ-9");
  assert.ok(p.byOp("projectlist").length >= 2, "the projects are read again");
  assert.equal(p.byOp("lookedsince").length, 1);
  // A project row that answers the member's participation itself (N1118) is taken at its word, and read no further.
  const told = await open("/app", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-9", name: "Library hours", stage: "forming", participation: "invited" }] }) });
  await settle();
  assert.ok(told.byOp("projectparticipants").length === 0 && main(told).querySelector('button[data-act="projectjoin"]'));
  // Controls: a read that failed, or one holding no row of hers, offers nothing on a guess.
  const failed = await open("/app", { ...PLANE, projectlist: list, projectparticipants: refused("STORE_DID_NOT_ANSWER", null, 502) });
  await settle();
  assert.equal(main(failed).querySelectorAll('button[data-act="projectjoin"]').length, 0);
  const none = await open("/app", { ...PLANE, projectlist: list, projectparticipants: PARTICIPANTS({}) });
  await settle();
  assert.equal(main(none).querySelectorAll('button[data-act="projectjoin"]').length, 0);
});

test("R28: a to-do names its subject by its title, a reference, and its act by the act's label; a subject with no title draws the untitled word", async () => {
  const items = [
    { id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "https://example.org/permit.pdf", assignee: "mai", assignee_role: "member", options: [],
      disposition: { instead: "taskresolve" }, subject: { kind: "bundle", id: "INF-7", title: "Permit application" } },
    { id: "TSK-2", class: "OBLIGATION", kind: "check", summary: "INF-9", assignee: "mai", assignee_role: "member", options: [],
      disposition: { instead: "taskresolve" }, subject: { kind: "bundle", id: "INF-9" }, age: { since: "2026-10-03T00:00:00Z" } },
  ];
  const p = await open("/app", { ...PLANE, queue: ok({ items, item_count: 2 }) }, { screens: withScreens("document") });
  const you = main(p).querySelectorAll("section")[0];
  const [titled, bare] = you.querySelectorAll(".cs-row");
  assert.ok(titled.querySelector('a.cs-ref[href="/app/document/INF-7"]').textContent === "Permit application", "the title, a reference to the document");
  assert.ok(titled.querySelector('button[data-act="taskresolve"]').textContent.startsWith(word("act.taskresolve.label.home")));
  assert.doesNotMatch(text(p, titled), /https?:/, "never a bare address");
  assert.equal(bare.querySelector("a.cs-ref").textContent, word("queue.source.untitled", { date: dmy("2026-10-03") }), "control: no title, the untitled word");
  assert.doesNotMatch(text(p, bare), /INF-9/);
});

test("R31: a reply owed by another side whose date has passed is drawn \"no reply recorded\", never \"overdue\"; the strip counts no item as overdue", async () => {
  const items = [{ id: "CONDITION::c", class: "CONDITION", kind: "action-clock-overdue.theirs", assignee: "unassigned", assignee_role: "member",
    fills: { office: "Public Works", what: "send the records", date: "2026-10-02" }, due: "2026-10-02", subject: { kind: "action", id: "ACT-5" } },
  { id: "TSK-3", class: "OBLIGATION", kind: "check", summary: "Late to-do", due: "2026-10-01", assignee: "mai", assignee_role: "member", options: [], disposition: { instead: "taskresolve" } }];
  const p = await open("/app", { ...PLANE, queue: ok({ items, item_count: 2 }) });
  await settle();
  assert.ok(text(p).includes(word("action.noreply.title", { date: dmy("2026-10-02") })));
  assert.doesNotMatch(text(p), /overdue/i, "control: no drawn text contains it");
  assert.doesNotMatch(main(p).querySelector(".mk-strip").textContent, /overdue/i);
  assert.ok(text(p).includes(dmy("2026-10-01")), "a passed date of the group's own is drawn with its date and no word");
});

test("R34: every key Home reads is a word of the list, and what it draws for a sample of its keys equals word(key, vars)", async () => {
  for (const k of screen("home").words) assert.ok(hasWord(k), k);
  assert.ok(!screen("home").words.includes("screen.home.strip.overdue"), "DEC-256's retired row is not read");
  const p = await open("/app", ADMIN_PLANE);
  await settle();
  for (const k of ["screen.home.needsyou", "screen.home.areas", "door.front.head", "door.front.intro", "door.front.elsewhere.name", "door.front.elsewhere.hint"])
    assert.ok(text(p).includes(word(k)), k);
});

// R64: Home's remaining readings, as the plane answers the reads each makes.
const R64 = {
  browse: (req) => ok({ ok: true, items: [], total: req.query.kinds === "document" ? 142 : 0, truncated: false }),
  publishedlist: ok({ bundles: [], cases: [
    { case_id: "CASE-1", edition: 1, published_at: "2026-09-01T10:00:00Z" }, { case_id: "CASE-1", edition: 2, published_at: "2026-09-18T10:00:00Z" },
    { case_id: "CASE-2", edition: 1, published_at: "2026-10-02T10:00:00Z" }] }),
  publishedcase: (req) => ok({ ok: true, caseId: req.query.caseId, edition: Number(req.query.edition), scope: req.query.caseId === "CASE-1" ? "The Coliseum lease" : "Pothole repairs" }),
  peopledirectory: ok({ ok: true, following: 10, in_your_projects: 2, rows: [], limit: 1 }),
  clocksrunning: ok({ ok: true, total: 3, by_owed: { group: { count: 1, next: "2026-10-23" }, body: { count: 2, next: "2026-10-14" }, undetermined: { count: 0, next: null } }, truncated: false }),
  casedrafts: batched((id) => ({ ok: true, project: id, count: 1, drafts: id === "PROJ-1"
    ? [{ draft_id: "DRAFT-1", case: { case_id: "CASE-1", edition: 3, identity: "x" } }, { draft_id: "DRAFT-2", case: { case_id: "CASE-2", edition: 2, identity: "x" } }, { draft_id: "DRAFT-3", case: { case_id: null, edition: null, identity: "x" } }] : [] })),
  reviewcopy: (req) => ok({ ok: true, comments: req.query.draft === "DRAFT-2" ? [{ author_kind: "recipient", text: "x" }] : [],
    grants: [{ grant_id: "G-1", live: true, until: "2026-10-20T00:00:00Z" }, { grant_id: "G-0", live: false, until: "2026-10-30T00:00:00Z" }] }),
  securitymap: ok({ ok: true, level: "Raised", levelAt: null, buckets: [], totals: {} }),
};
const R64_ADMIN = { ...ADMIN_PLANE, ...R64, memberlist: ok({ members: [
  { member_id: "rosa", handle: "rosa", role: "admin", status: "active", expertise: [{ label: "CPA", confirmed: true }] },
  { member_id: "mai", handle: "mai", role: "member", status: "active", expertise: [{ label: "reporter", confirmed: false }] },
  { member_id: "dev", handle: "dev", role: "member", status: "active", expertise: [] },
  { member_id: "k", handle: "k", role: "member", status: "invited", expertise: [{ label: "nurse", confirmed: true }] }] }) };

test("R64: a home whose fixtures answer each read draws each reading with the read's figure, in its area", async () => {
  const p = await open("/app", R64_ADMIN);
  await settle();
  const area = (k) => text(p, main(p).querySelector(`[data-area="${k}"]`));
  const inv = area("investigation");
  assert.ok(inv.includes(`142 ${word("screen.home.rd.documents")}`), "documents: browse's total");
  assert.ok(inv.includes(`10 ${word("screen.home.rd.followed.other")}`), "people followed: peopledirectory's following");
  assert.ok(inv.includes(`2 ${word("screen.home.rd.cases")}`), "cases: the distinct case ids");
  assert.deepEqual(p.byOp("browse").map((r) => [r.query.kinds, r.query.limit]), [["document", "1"]], "documents: browse over documents, one row");
  assert.deepEqual([p.byOp("peopledirectory")[0].query.show, p.byOp("peopledirectory")[0].query.limit], ["people", "1"]);
  const act = area("action");
  assert.ok(act.includes(`3 ${word("screen.home.rd.clocks")}`), "clocks: the total");
  assert.ok(act.includes(word("screen.home.area.ourmove", { n: "1", date: dmy("2026-10-23") })) && act.includes(word("screen.home.area.theirmove", { n: "2", date: dmy("2026-10-14") })), "our move by the group, theirs by a body, each with its count and earliest date");
  const members = area("members");
  assert.ok(members.includes(word("screen.home.area.expertise", { people: "" }).trim().replace(/\s+$/, "")), "expertise line");
  const person = (member, label, standing) => word("screen.home.area.expertise.person", { member, label, standing: word(`screen.home.area.expertise.${standing}`) });
  assert.ok(members.includes(person("rosa", "CPA", "confirmed")) && members.includes(person("mai", "reporter", "declared")));
  assert.ok(!members.includes("nurse"), "control: an invited member's expertise is not on hand");
  const adm = area("administration");
  assert.ok(adm.includes(`${word("screen.home.rd.level.raised")} ${word("screen.home.rd.security")}`), "security level, over the last 24 hours");
  const q = p.byOp("securitymap")[0].query;
  assert.equal(Date.parse(q.to) - Date.parse(q.from), 86400000);
});

test("R64: edition lines: a case with a draft shared until a date says so, with the recipients' comments to answer; a draft of no case and a lapsed grant say nothing; the latest edition alone is its plain line", async () => {
  const p = await open("/app", R64_ADMIN);
  await settle();
  const inv = text(p, main(p).querySelector('[data-area="investigation"]'));
  assert.ok(inv.includes(word("screen.home.area.edition", { n: "2", case: "The Coliseum lease", date: dmy("2026-09-18"), until: dmy("2026-10-20") })), "no comment: the sentence that says none is to answer");
  assert.ok(inv.includes(word("screen.home.area.edition.comments.one", { n: "1", case: "Pothole repairs", date: dmy("2026-10-02"), until: dmy("2026-10-20") })), "one recipient commented");
  assert.deepEqual(p.byOp("casedrafts").map((r) => r.query.projects), ["PROJ-1"], "one read, for the project whose row says a draft is shared (project-roster R42)");
  assert.deepEqual(p.byOp("reviewcopy").map((r) => r.query.draft).sort(), ["DRAFT-1", "DRAFT-2"], "a draft of no case reads no grant");
  assert.equal(p.byOp("publishedcase").filter((r) => r.query.caseId === "CASE-1")[0].query.edition, "2", "the latest edition");
  const bare = await open("/app", { ...R64_ADMIN, casedrafts: batched(() => ({ ok: true, drafts: [] })) });
  await settle();
  assert.ok(text(bare, main(bare).querySelector('[data-area="investigation"]')).includes(word("screen.home.area.edition.published", { n: "1", case: "Pothole repairs", date: dmy("2026-10-02") })), "the latest edition, no draft");
  const only = await open("/app", { ...R64_ADMIN, publishedlist: ok({ bundles: [], cases: [] }),
    casedrafts: batched((id) => ({ ok: true, drafts: id === "PROJ-1" ? [{ draft_id: "DRAFT-1", case: { case_id: "CASE-9", edition: 1 } }] : [] })),
    reviewcopy: ok({ ok: true, comments: [], grants: [{ live: true, until: "2026-10-20T00:00:00Z" }] }) });
  await settle();
  assert.ok(text(only, main(only).querySelector('[data-area="investigation"]')).includes(word("screen.home.area.edition.draftonly", { case: "CASE-9", until: dmy("2026-10-20") })), "a draft on a case with no edition yet");
  const one = await open("/app", { ...R64_ADMIN, publishedlist: ok({ bundles: [], cases: [] }),
    casedrafts: batched((id) => ({ ok: true, drafts: id === "PROJ-1" ? [{ draft_id: "DRAFT-1", case: { case_id: "CASE-9", edition: 1 } }] : [] })),
    reviewcopy: ok({ ok: true, comments: [{ author_kind: "recipient", text: "x" }], grants: [{ live: true, until: "2026-10-20T00:00:00Z" }] }) });
  await settle();
  assert.ok(text(one, main(one).querySelector('[data-area="investigation"]')).includes(word("screen.home.area.edition.draftonly.comments.one", { case: "CASE-9", until: dmy("2026-10-20") })), "one comment on a draft with no edition yet");
});

test("R64: controls: a member who is not an administrator sends no securitymap and draws no security level; a read that fails draws its reading failed", async () => {
  const m = await open("/app", { ...PLANE, ...R64 });
  await settle();
  assert.equal(m.byOp("securitymap").length, 0);
  assert.ok(!text(m).includes(word("screen.home.rd.security")));
  for (const [op, area] of [["browse", "investigation"], ["peopledirectory", "investigation"], ["publishedlist", "investigation"], ["clocksrunning", "action"], ["securitymap", "administration"]]) {
    const f = await open("/app", { ...R64_ADMIN, [op]: refused("STORE_DID_NOT_ANSWER", null, 502) });
    await settle();
    assert.ok(main(f).querySelector(`[data-area="${area}"] [data-state="failed"]`), `${op} failed is drawn failed in ${area}`);
  }
  const quiet = await open("/app", { ...R64_ADMIN, browse: ok({ ok: true, items: [], total: 0 }), peopledirectory: ok({ ok: true, following: 0, rows: [] }), publishedlist: ok({ bundles: [], cases: [] }),
    clocksrunning: ok({ ok: true, total: 0, by_owed: {} }) });
  await settle();
  const t = text(quiet, main(quiet).querySelector('[data-area="investigation"]'));
  assert.ok(!t.includes(word("screen.home.rd.documents")) && !t.includes(word("screen.home.rd.cases")) && !t.includes(word("screen.home.rd.followed.other")), "no reading at zero");
  const a = text(quiet, main(quiet).querySelector('[data-area="action"]'));
  assert.ok(!a.includes(word("screen.home.rd.clocks")) && !a.includes(word("home.move.theirs")), "no clock reading at zero");
});

// C74, C96 (fix round 2): an invitation is drawn once, its Join says which project, and a row's Open opens its subject.
const INVITATION = (project, name) => ({ id: `OBLIGATION::project-invitation::${project}::mai`, class: "OBLIGATION", kind: "project-invitation", assignee: "mai", assignee_role: "member",
  subject: { kind: "project", id: project, name }, basis: { inviter: "rosa" }, options: [{ id: "projectjoin" }], disposition: { available: false, instead: "projectjoin" } });
const INVITED = ok({ ok: true, projects: [{ id: "PROJ-8", name: "Library hours", stage: "forming", participation: "invited" }, { id: "PROJ-9", name: "Park lights", stage: "forming", participation: "invited" },
  { id: "PROJ-1", name: "The Coliseum lease", stage: "investigating", participation: "joined" }] });

test("R29, C74: a project the member is invited to is one row on Home though the queue holds its invitation too; an invitation the list does not know is drawn from the queue", async () => {
  const p = await open("/app", { ...PLANE, projectlist: INVITED, queue: ok({ items: [INVITATION("PROJ-9", "Park lights")], item_count: 1 }), projectjoin: ok({ ok: true }) }, { screens: withScreens("project") });
  await settle();
  const joins = main(p).querySelectorAll('button[data-act="projectjoin"]');
  assert.equal(joins.length, 2, "PROJ-8 and PROJ-9 once each, not PROJ-9 twice");
  assert.deepEqual(joins.map((b) => b.dataset.project).sort(), ["PROJ-8", "PROJ-9"]);
  assert.ok(!text(p).includes(word("queue.project-invitation.detail")) || main(p).querySelectorAll("section")[0].querySelectorAll(".cs-row").length === 2, "one row for each project in Needs you");
  assert.equal(main(p).querySelectorAll("section").filter((s) => s.querySelector("h2") && s.querySelector("h2").textContent === word("screen.home.needsgroup")).length, 0, "and none under Needs the group");
  // Control: the project is not in the list the member is invited to, so the queue's own invitation is the one drawn.
  const only = await open("/app", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "The Coliseum lease", stage: "investigating", participation: "joined" }] }),
    queue: ok({ items: [INVITATION("PROJ-9", "Park lights")], item_count: 1 }), projectjoin: ok({ ok: true }) }, { screens: withScreens("project") });
  await settle();
  assert.equal(main(only).querySelectorAll('button[data-act="projectjoin"]').length, 1);
});

test("R29, C96: two invitations draw two distinct labels, each naming its project", async () => {
  const p = await open("/app", { ...PLANE, projectlist: INVITED, queue: ok({ items: [], item_count: 0 }), projectjoin: ok({ ok: true }) }, { screens: withScreens("project") });
  await settle();
  const labels = main(p).querySelectorAll('button[data-act="projectjoin"]').map((b) => b.getAttribute("aria-label"));
  assert.equal(labels.length, 2);
  assert.equal(new Set(labels).size, 2, "distinct");
  assert.ok(labels.some((l) => l.includes("Library hours")) && labels.some((l) => l.includes("Park lights")));
  assert.ok(labels.every((l) => l.startsWith(word("act.projectjoin.label.home"))), "the label's own word leads");
  // Control: a joined project offers none; the queue's invitation for a project with a name is told apart the same way.
  const item = await open("/app", { ...PLANE, projectlist: ok({ ok: true, projects: [] }), queue: ok({ items: [INVITATION("PROJ-8", "Library hours"), INVITATION("PROJ-9", "Park lights")], item_count: 2 }), projectjoin: ok({ ok: true }) });
  await settle();
  const two = main(item).querySelectorAll('button[data-act="projectjoin"]').map((b) => b.getAttribute("aria-label"));
  assert.equal(new Set(two).size, 2);
});

test("R17, C74: a row's Open opens its subject's screen; a subject that opens nothing draws no Open, not a link to the queue", async () => {
  const items = [
    { id: "CONDITION::a", class: "CONDITION", kind: "reply", summary: "A reply is due", subject: { kind: "action", id: "ACT-2" } },
    { id: "CONDITION::b", class: "CONDITION", kind: "request-awaiting", summary: "A request is awaited", subject: { kind: "capture_request", id: "CR-1" } },
  ];
  const p = await open("/app", { ...PLANE, queue: ok({ items, item_count: 2 }) }, { screens: withScreens("action") });
  await settle();
  const rowOf = (needle) => main(p).querySelectorAll(".cs-row").find((r) => text(p, r).includes(needle));
  const opens = (r) => r.querySelectorAll("a[data-nav]").filter((a) => a.textContent === word("screen.home.open")).map((a) => a.getAttribute("href"));
  assert.deepEqual(opens(rowOf("A reply is due")), ["/app/action/ACT-2"], "its subject's screen");
  assert.deepEqual(opens(rowOf("A request is awaited")), [], "no Open to the queue");
});
