/* The group's home (R1, R8, R9, R11, R17, R23, R25, R28–R31) on the real served page (interface-shell's harness): what it
   reads, what it draws in each state, and the acts it offers, run through the shell's kit, gate and re-reads. Every
   sentence is asserted as `word(key, vars)` (R34): no test here holds a sentence's English. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, button, press, beside, last, main, screen, settle, MEMBER, word, hasWord, dmy, inOrder, withScreens } from "./page.mjs";
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
  groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants", description: "Rents and leases on city land." }),
  queue: ok({ items: QITEMS, item_count: 6 }),
  projectlist: ok({ ok: true, count: 3, limit: 200, truncated: false, projects: [
    { id: "PROJ-1", name: "The Coliseum lease", stage: "investigating", lastChange: "2026-10-12T15:00:00Z" },
    { id: "PROJ-2", name: "Pothole repairs", stage: "forming", lastChange: "2026-09-20T15:00:00Z" },
    { id: "PROJ-3", name: "Odd", stage: "paused" },
  ] }),
  // Each project's questions, paged (basis-versions R50): PROJ-1 holds 3 over two pages, PROJ-2 one, PROJ-3 none.
  projectquestions: (req) => {
    const pages = { "PROJ-1": [[{ inquiry: "INQ-1" }, { inquiry: "INQ-2" }], [{ inquiry: "INQ-3" }]], "PROJ-2": [[{ inquiry: "INQ-4" }]], "PROJ-3": [[]] };
    const at = req.query.after ? 1 : 0;
    const list = pages[req.query.project] || [[]];
    return ok({ ok: true, project: req.query.project, items: list[at] || [], cursor: at + 1 < list.length ? "INQ-2" : null });
  },
  startfrom: ok({ ok: true, scripts: [], doors: [{ door: "elsewhere", scripts: [], opens: "elsewhere" }] }),
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
  assert.equal(a.byOp("bootstrap").length, p.byOp("bootstrap").length + 1, "bootstrap read for Administration, beside the shell's own");
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

test("R17, R23, R11: a new group's home draws that it is ready, its first steps (\"Name your group\" first, to an administrator while unnamed) and What happened?, nothing else", async () => {
  const fresh = { ...ADMIN_PLANE, groupidentity: ok({ ok: true, group: "lakeshore", display_name: null }), projectlist: ok({ ok: true, projects: [] }), queue: ok({ items: [] }),
    memberlist: ok({ members: [{ member_id: "mai", handle: "mai", role: "admin", status: "active" }] }) };
  const p = await open("/app", fresh);
  assert.deepEqual(sections(p), [word("screen.home.ready"), word("door.front.head")]);
  assert.deepEqual(main(p).querySelectorAll(".mk-links a").map((a) => [a.textContent, a.getAttribute("href")]),
    [[word("home.first.name"), "/app/group"], [word("screen.home.invite"), "/app/members"], [word("screen.home.saywho"), "/app/group-identity"]]);
  assert.ok(!main(p).querySelector(".mk-ablocks, .mk-strip"));
  // Controls: a named group draws no "Name your group"; a group with a project, or a second active member, is not new.
  const named = await open("/app", { ...fresh, groupidentity: PLANE.groupidentity });
  assert.ok(!text(named).includes(word("home.first.name")));
  assert.ok(text(named).includes(word("screen.home.nothingyet")));
  const notNew = async (plane) => !text(await open("/app", plane)).includes(word("screen.home.nothingyet"));
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

test("R8, R21, R25: each project's question count is read from projectquestions, paged to its end, and drawn with the project, picking the singular or plural key; a count at zero is not drawn", async () => {
  const p = await open("/app", PLANE);
  await settle();
  const reads = p.byOp("projectquestions").map((r) => `${r.query.project}:${r.query.after || ""}`);
  assert.deepEqual(reads.sort(), ["PROJ-1:", "PROJ-1:INQ-2", "PROJ-2:", "PROJ-3:"], "PROJ-1 paged on past its first page's cursor");
  assert.ok(text(p).includes("The Coliseum lease" + word("screen.home.questions.many", { n: "3" })));
  assert.ok(text(p).includes("Pothole repairs" + word("screen.home.questions.one")), "R25: one question, the singular key");
  assert.ok(!text(p).includes(word("screen.home.questions.many", { n: "0" })));
});

test("R8: a page shorter than its limit with a cursor is not the end: the count pages on until the cursor is null", async () => {
  const p = await open("/app", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "A", stage: "forming" }] }),
    projectquestions: (req) => ok({ ok: true, items: req.query.after === "c2" ? [{ inquiry: "Q9" }] : req.query.after === "c1" ? [] : [{ inquiry: "Q1" }],
      cursor: req.query.after === "c2" ? null : req.query.after === "c1" ? "c2" : "c1" }) });
  await settle();
  assert.equal(p.byOp("projectquestions").length, 3);
  assert.ok(text(p).includes("A" + word("screen.home.questions.many", { n: "2" })));
});

test("R8: a count is loading until its pages are read, and a failed read is drawn failed, never as none", async () => {
  const loading = await open("/app", { ...PLANE, projectquestions: { pending: true } });
  await settle();
  assert.equal(main(loading).querySelectorAll('.cs-row [data-state="loading"]').length, 3);
  assert.doesNotMatch(text(loading), /\d+ questions?/);
  let calls = 0;
  const failed = await open("/app", { ...PLANE, projectquestions: (req) => (req.query.project === "PROJ-1" && ++calls === 2 ? refused("STORE_DID_NOT_ANSWER", null, 502) : PLANE.projectquestions(req)) });
  await settle();
  assert.equal(main(failed).querySelectorAll('.cs-row [data-state="failed"]').length, 1, "PROJ-1's second page failed: its count is failed");
  assert.doesNotMatch(text(failed), /The Coliseum lease\d+ question/, "control: never drawn as a count from the pages read");
  assert.ok(text(failed).includes("Pothole repairs" + word("screen.home.questions.one")));
});

test("R8: a project whose stage is null is drawn undetermined; a list answered truncated says more projects exist", async () => {
  const p = await open("/app", { ...PLANE, projectlist: ok({ ok: true, truncated: true, projects: [{ id: "PROJ-5", name: "Unstaged", stage: null }] }) });
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
  await press(p, "promote", { values: { "home-title": "  Park bond oversight " } });
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
  await press(q, "promote", { values: { "home-title": 'A "quoted"\ntitle' } });
  assert.match(last(q, "promote").body.files[0].text, /\ntitle: "A \\"quoted\\"\\ntitle"\n/);
});

test("R30: the form asks the title and who can find it; hidden is preselected and an untouched form sends it; choosing findable sends discoverable", async () => {
  const p = await open("/app", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-77" }) });
  const start = main(p).querySelector('details[data-start="project"]');
  const sel = start.querySelector("#home-visibility");
  assert.ok(start.querySelector("label[for=home-title]").textContent.includes(word("project.start.title")));
  assert.ok(start.textContent.includes(word("project.start.title.help")) && start.textContent.includes(word("project.visibility.start.later")));
  assert.deepEqual(sel.querySelectorAll("option").map((o) => o.textContent), [word("project.visibility.start.hidden"), word("project.visibility.start.discoverable")]);
  assert.equal(sel.value, "hidden", "preselected");
  await press(p, "promote", { values: { "home-title": "Parks" } });
  assert.equal(last(p, "promote").body.visibility, "hidden", "control: an untouched form sends hidden");
  const q = await open("/app", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-78" }) });
  await press(q, "promote", { values: { "home-title": "Parks", "home-visibility": "discoverable" } });
  assert.equal(last(q, "promote").body.visibility, "discoverable");
  // PROJECT_VISIBILITY_NO_OWNER and NAME_TAKEN are drawn by their words.
  for (const code of ["PROJECT_VISIBILITY_NO_OWNER", "NAME_TAKEN"]) {
    const t = await open("/app", { ...PLANE, ...CREATOR, promote: refused(code, null, 409) });
    const b = await press(t, "promote", { values: { "home-title": "Parks" } });
    assert.equal(beside(t, b).replace(/\s+/g, " "), word(`refusal.${code}`), code);
  }
});

test("R1, R25: control: with no title nothing is sent and the member is told in the screen's words; a refusal is drawn beside the act", async () => {
  const p = await open("/app", { ...PLANE, ...CREATOR });
  const b = await press(p, "promote", { values: { "home-title": "   " } });
  assert.equal(p.byOp("promote").length, 0);
  assert.equal(beside(p, b), word("screen.home.title.needed"));
  const t = await open("/app", { ...PLANE, ...CREATOR, promote: refused("NAME_TAKEN", null, 409) });
  const c = await press(t, "promote", { values: { "home-title": "Parks" } });
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
// only "Get a record"; `person` and `read` left out (no script offered); the sixth door last, whatever else is offered.
const DOORS = ok({ ok: true,
  scripts: [
    { id: "WIZ-cb0ad18a17a04233", version: 2, name: "Get a record", start: "request" },
    { id: "WIZ-33b5887790b7561b", version: 1, name: "Check a claim", start: "finder" },
  ],
  doors: [
    { door: "problem", scripts: ["WIZ-33b5887790b7561b", "WIZ-cb0ad18a17a04233"] },
    { door: "money", scripts: ["WIZ-cb0ad18a17a04233"] },
    { door: "tip", scripts: [] },
    { door: "elsewhere", scripts: [], opens: "elsewhere" },
  ] });
const doorOf = (p, door) => main(p).querySelector(`[data-door="${door}"]`);
const doorOps = (p, door) => doorOf(p, door).querySelectorAll("button[data-act]").map((b) => [b.dataset.script, b.dataset.version]);

test("R9, R14, R23, R25: \"What happened?\" draws each door startfrom answers as the design's card (mk-door), the sixth door last; a door left out is not drawn", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  assert.equal(p.byOp("startfrom").length, 1);
  const sec = main(p).querySelector('[data-front="doors"]');
  assert.ok(text(p, sec).startsWith(word("door.front.head") + word("door.front.intro")));
  assert.deepEqual(main(p).querySelectorAll(".mk-door").map((d) => d.getAttribute("data-door")), ["problem", "money", "elsewhere"], "person, read and tip (no script) are not drawn");
  // R25: each card's title and its description are two elements, and the closed door's summary carries its name.
  const head = doorOf(p, "problem").querySelector("summary");
  assert.deepEqual(head.children.filter((c) => c.localName !== "br").map((c) => c.textContent), [word("door.front.problem.name"), word("door.front.problem.hint")]);
  assert.equal(head.getAttribute("aria-label"), word("door.front.problem.name"), "the closed door's button has its name");
  assert.deepEqual(doorOf(p, "elsewhere").querySelectorAll("b, span").map((c) => c.textContent), [word("door.front.elsewhere.name"), word("door.front.elsewhere.hint")]);
  assert.deepEqual(doorOps(p, "problem"), [["WIZ-33b5887790b7561b", "1"], ["WIZ-cb0ad18a17a04233", "2"]]);
  // Control: with "Follow the money" not offered, the money door names only what startfrom names.
  assert.deepEqual(doorOps(p, "money").map(([id]) => id), ["WIZ-cb0ad18a17a04233"]);
});

test("R23: pressing a door opens its offer in place: its scripts are inside the door, closed, and no script name is drawn before that", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  for (const d of ["problem", "money"]) {
    const door = doorOf(p, d);
    assert.equal(door.localName, "details", "the card opens in place on press");
    assert.equal(door.getAttribute("open"), null, "closed until pressed");
    assert.doesNotMatch(text(p, door.querySelector("summary")), /Check a claim|Get a record/, "the card shows its name and hint only");
  }
  for (const b of main(p).querySelectorAll("button[data-script]")) assert.ok(b.closest("details.mk-door"), "every script is inside its door");
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
  const before = p.requests.filter((r) => r.query.op !== "bootstrap").length;
  await p.click(main(p).querySelector('[data-door="money"] button[data-act="startfrom"]'));
  await settle();
  assert.equal(p.doc.getElementById("started").textContent, "WIZ-cb0ad18a17a04233@2", "the runner holds that script at that version");
  assert.equal(p.requests.filter((r) => r.query.op !== "bootstrap").length, before, "starting a script sends no op");
});

test("R9, R23: beside the doors, the matching work (the member's words searched) and the blank start, \"Start a project\" opening its title field on press", async () => {
  const p = await open("/app", { ...PLANE, ...CREATOR, startfrom: DOORS, search: ok({ hits: [{ bundle_id: "PROJ-2", title: "Pothole repairs" }, { bundle_id: "INF-7", title: "Work orders FY2025" }] }) });
  assert.ok(text(p).includes(word("door.front.blank")));
  const start = main(p).querySelector('details[data-start="project"]');
  assert.equal(text(p, start.querySelector("summary")), word("act.promote.label.home"), "the act's own words");
  assert.equal(start.getAttribute("open"), null, "never an always-open field");
  assert.ok(start.querySelector("#home-title") && start.querySelector('button[data-act="promote"]'));
  const words = main(p).querySelectorAll('button[data-act="startfrom"]').find((x) => !x.dataset.script);
  assert.ok(words.textContent.startsWith(word("act.startfrom.label.home")));
  const none = await press(p, "startfrom", { nth: main(p).querySelectorAll('button[data-act="startfrom"]').indexOf(words), values: { "home-words": "  " } });
  assert.equal(beside(p, none), word("screen.home.wordsfirst"));
  assert.equal(p.byOp("search").length, 0, "control: no words, nothing searched");
  await press(p, "startfrom", { nth: main(p).querySelectorAll('button[data-act="startfrom"]').findIndex((x) => !x.dataset.script), values: { "home-words": " potholes on Seminary " } });
  assert.equal(last(p, "search").query.q, "potholes on Seminary");
  const m = main(p).querySelector('[data-front="matching"]');
  assert.equal(text(p, m), word("door.front.matching", { items: "" }).trim() + " Pothole repairs, Work orders FY2025");
  assert.equal(p.doc.getElementById("home-words").value, " potholes on Seminary ", "the field keeps what the member typed");
  assert.equal(p.byOp("lookedsince").length, 1, "re-reading the doors never re-reads lookedsince");
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
