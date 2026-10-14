/* The group's home (R1, R8, R9, R11) on the real served page (interface-shell's harness): what it reads, what it draws in
   each state, and the acts it offers, run through the shell's kit, gate and re-reads. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, button, press, beside, last, main, screen, settle, MEMBER } from "./page.mjs";
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

test("R17: a busy home draws, in order, the strip, Needs you, Needs the group, each area at a glance, the projects, Since you last looked and What happened?", async () => {
  const p = await open("/app", ADMIN_PLANE);
  await settle();
  assert.deepEqual(sections(p), ["Needs you", "Needs the group", "Each area at a glance", "Projects", "Since you last looked", "What happened?"]);
  const strip = main(p).querySelector(".cs-strip");
  const order = main(p).querySelectorAll(".cs-strip, h1, section");
  assert.equal(order[0], strip, "the strip comes first, above the heading and every block");
  assert.deepEqual(strip.querySelectorAll("a").map((a) => text(p, a)), ["2 need you", "1 overdue", "4 need the group"]);
  const you = main(p).querySelectorAll("section")[0];
  assert.match(text(p, you), /Vouch for 3 photos/);
  assert.ok(you.querySelector('button[data-act="taskresolve"]'), "its options (R3)");
  // R19: the update to-do on Needs you, with its security mark, and "See what changes" opening `updates`.
  assert.match(text(p, you), /An update to your group's Civicsmith is ready: release 0\.84\.0, with a security fix/);
  assert.ok(you.querySelector('a[href="/app/updates"]'));
  // Needs the group: whose move it is.
  const group = main(p).querySelectorAll("section")[1];
  assert.match(text(p, group), /Send the follow-up letter.*an administrator's move/);
  assert.match(text(p, group), /A reply is due.*anyone's move/);
  // R22: the two source notices are one item with their count, in members' words.
  assert.match(text(p, group), /2 documents changed at their source/);
  assert.doesNotMatch(text(p), /B-1|404/);
  // The four areas, each named as its reference; Since you last looked holds the project changed since then.
  const areas = main(p).querySelectorAll(".mk-ablock").map((b) => b.getAttribute("data-area"));
  assert.deepEqual(areas, ["investigation", "action", "members", "administration"]);
  assert.match(text(p, main(p).querySelector('[data-area="members"]')), /3 members1 administrator1 invited/);
  assert.match(text(p, main(p).querySelector('[data-area="administration"]')), /0\.83\.0 this release.*Places: River Town.*Languages: English, español.*\$31\.40 of \$60\.00/);
  assert.match(text(p, main(p).querySelector('[data-area="investigation"]')), /3 projects4 questions/);
  const since = main(p).querySelectorAll("section")[4];
  assert.match(text(p, since), /The Coliseum lease.*changed 12 October 2026/);
  assert.doesNotMatch(text(p, since), /Pothole repairs/, "changed before the last look: not drawn");
});

test("R17: controls: a reading at zero is not drawn, and an empty block is not drawn; a failed read is drawn failed in its block", async () => {
  const quiet = await open("/app", { ...PLANE, queue: ok({ items: [], item_count: 0 }) });
  await settle();
  assert.equal(main(quiet).querySelector(".cs-strip"), null, "no strip with nothing to count");
  assert.doesNotMatch(text(quiet), /Needs you|Needs the group|0 need|0 to do|\b0 questions?/);
  assert.equal(main(quiet).querySelector('[data-area="action"]'), null, "an area with nothing to show is left out");
  const failed = await open("/app", { ...PLANE, queue: refused("STORE_DID_NOT_ANSWER", null, 502), projectlist: refused("STORE_DID_NOT_ANSWER", null, 502), lookedsince: refused("STORE_DID_NOT_ANSWER", null, 502) });
  assert.ok(main(failed).querySelectorAll('[data-state="failed"]').length >= 3, "the queue, the projects and lookedsince each drawn failed");
  assert.match(text(failed), /Needs you/);
  assert.match(text(failed), /Since you last looked/);
});

test("R17, R11: a new member's first visit (lookedsince answers null) draws no Needs you and no Since you last looked", async () => {
  const p = await open("/app", { ...PLANE, lookedsince: ok({ since: null }) });
  await settle();
  assert.doesNotMatch(text(p), /Needs you|Since you last looked/);
  assert.match(text(p), /Needs the group/, "the group's items are still drawn");
});

test("R23: the heading is the group's name, or \"Your group\" while none is set, never the slug", async () => {
  const p = await open("/app", PLANE);
  assert.equal(main(p).querySelector("h1").textContent, "Lakeshore Tenants");
  assert.match(text(p), /Rents and leases on city land\./);
  const unnamed = await open("/app", { ...PLANE, groupidentity: ok({ ok: true, group: "lakeshore", display_name: null }) });
  assert.equal(main(unnamed).querySelector("h1").textContent, "Your group");
  assert.doesNotMatch(text(unnamed), /lakeshore/);
});

test("R17, R23, R11: a new group's home draws that it is ready, its first steps (\"Name your group\" first, to an administrator while unnamed) and What happened?, nothing else", async () => {
  const fresh = { ...ADMIN_PLANE, groupidentity: ok({ ok: true, group: "lakeshore", display_name: null }), projectlist: ok({ ok: true, projects: [] }), queue: ok({ items: [] }),
    memberlist: ok({ members: [{ member_id: "mai", handle: "mai", role: "admin", status: "active" }] }) };
  const p = await open("/app", fresh);
  assert.deepEqual(sections(p), ["Your group's Civicsmith is ready", "What happened?"]);
  assert.deepEqual(main(p).querySelectorAll(".mk-links a").map((a) => [a.textContent, a.getAttribute("href")]),
    [["Name your group", "/app/group"], ["Invite your first members", "/app/members"], ["Say who your group is", "/app/group-identity"]]);
  assert.equal(main(p).querySelector(".mk-ablocks, .cs-strip"), null);
  // Controls: a named group draws no "Name your group"; a group with a project, or a second active member, is not new.
  const named = await open("/app", { ...fresh, groupidentity: PLANE.groupidentity });
  assert.doesNotMatch(text(named), /Name your group/);
  assert.match(text(named), /Nothing is here yet/);
  assert.doesNotMatch(text(await open("/app", { ...fresh, projectlist: PLANE.projectlist })), /Nothing is here yet/);
  assert.doesNotMatch(text(await open("/app", { ...fresh, memberlist: ADMIN_PLANE.memberlist })), /Nothing is here yet/);
  assert.doesNotMatch(text(await open("/app", { ...fresh, whoami: ok({ ...MEMBER, capabilities: ["contribute"] }) })), /Nothing is here yet/);
  assert.doesNotMatch(text(await open("/app", { ...fresh, projectlist: refused("STORE_DID_NOT_ANSWER", null, 502) })), /Nothing is here yet/);
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
  assert.equal(ladders[0].querySelector("[aria-current]").textContent, "Investigating");
  assert.deepEqual(ladders[0].children.map((s) => s.textContent), ["Forming", "Investigating", "Matured", "Closed"]);
});

test("R8, R21: each project's question count is read from projectquestions, paged to its end, and drawn with the project; a count at zero is not drawn", async () => {
  const p = await open("/app", PLANE);
  await settle();
  const reads = p.byOp("projectquestions").map((r) => `${r.query.project}:${r.query.after || ""}`);
  assert.deepEqual(reads.sort(), ["PROJ-1:", "PROJ-1:INQ-2", "PROJ-2:", "PROJ-3:"], "PROJ-1 paged on past its first page's cursor");
  assert.match(text(p), /The Coliseum lease3 questions/);
  assert.match(text(p), /Pothole repairs1 questionForming/);
  assert.doesNotMatch(text(p), /0 questions/);
});

test("R8: a page shorter than its limit with a cursor is not the end: the count pages on until the cursor is null", async () => {
  const p = await open("/app", { ...PLANE, projectlist: ok({ ok: true, projects: [{ id: "PROJ-1", name: "A", stage: "forming" }] }),
    projectquestions: (req) => ok({ ok: true, items: req.query.after === "c2" ? [{ inquiry: "Q9" }] : req.query.after === "c1" ? [] : [{ inquiry: "Q1" }],
      cursor: req.query.after === "c2" ? null : req.query.after === "c1" ? "c2" : "c1" }) });
  await settle();
  assert.equal(p.byOp("projectquestions").length, 3);
  assert.match(text(p), /A2 questions/);
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
  assert.match(text(failed), /Pothole repairs1 question/);
});

test("R8: a project whose stage is null is drawn undetermined; a list answered truncated says more projects exist", async () => {
  const p = await open("/app", { ...PLANE, projectlist: ok({ ok: true, truncated: true, projects: [{ id: "PROJ-5", name: "Unstaged", stage: null }] }) });
  await settle();
  assert.match(text(p), /UnstagedUndetermined, because no stage is recorded for it/);
  assert.equal(main(p).querySelectorAll(".cs-ladder [aria-current]").length, 0);
  assert.match(text(p), /Your group has more projects than are shown here\./);
  assert.doesNotMatch(text(await open("/app", PLANE)), /more projects than are shown/, "control: not truncated, not said");
});

test("R1, R17 (interface-shell R10): Home's reads drawn loading, failed or with data; an empty read draws no block", async () => {
  const pend = { pending: true };
  const loading = await open("/app", { groupidentity: pend, queue: pend, projectlist: pend, startfrom: pend, lookedsince: pend });
  assert.ok(main(loading).querySelectorAll('[data-state="loading"]').length >= 2);
  const empty = await open("/app", { ...PLANE, queue: ok({ items: [], item_count: 0 }), projectlist: ok({ ok: true, projects: [] }) });
  assert.doesNotMatch(text(empty), /Nothing is waiting|No projects yet|Needs you|Projects/);
  const failed = await open("/app", { ...PLANE, projectlist: refused("STORE_DID_NOT_ANSWER", "the store did not answer", 502) });
  assert.ok(main(failed).querySelectorAll('[data-state="failed"]').length >= 1);
  assert.doesNotMatch(text(failed), /No projects yet/, "a failed read is never drawn as empty");
});

test("R17: an item's own acts on Home send their bodies and re-read the queue, never lookedsince", async () => {
  const p = await open("/app", { ...PLANE, taskresolve: ok({ ok: true }) });
  await press(p, "taskresolve");
  assert.deepEqual(last(p, "taskresolve").body, { id: "TSK-1" });
  assert.equal(p.byOp("lookedsince").length, 1, "the look is read once per visit");
  assert.ok(p.byOp("queue").length >= 2, "the queue re-read");
});

test("R1: \"Start a project\" sends promote with the member's title as a new forming project, and opens project on success", async () => {
  const p = await open("/app", { ...PLANE, ...CREATOR, promote: ok({ ok: true, bundleId: "PROJ-77", owner: "mai" }) });
  assert.equal(button(p, "promote").textContent, "Start a project");
  await press(p, "promote", { values: { "home-title": "  Park bond oversight " } });
  const r = last(p, "promote");
  assert.equal(r.method, "POST");
  assert.equal(r.headers.Authorization, "Bearer tok-1");
  const body = r.body;
  assert.equal(body.base, null);
  assert.deepEqual([body.meta.object_type, body.meta.title, body.meta.current_state], ["project", "Park bond oversight", "forming"]);
  assert.match(body.snapKey, /^\d{8}T\d{6}Z_[0-9a-f]{8}$/);
  assert.equal(body.files[0].path, "bundle.md");
  assert.match(body.files[0].text, /^---\nobject_type: project\nobjective: "Park bond oversight"\ncurrent_state: forming\n/);
  assert.doesNotMatch(body.files[0].text, /^id:/m, "no id is sent: the project's id is minted (promotion R19)");
  assert.equal("owner" in body || "author" in body, false, "the owner is the door's stamp, never the page's");
  assert.equal(p.location.pathname, "/app/project/PROJ-77");
  // A title with a quote or newline stays one YAML string.
  const q = await open("/app", { ...PLANE, ...CREATOR });
  await press(q, "promote", { values: { "home-title": 'A "quoted"\ntitle' } });
  assert.match(last(q, "promote").body.files[0].text, /objective: "A \\"quoted\\"\\ntitle"\n/);
});

test("R1: control: with no title nothing is sent and the member is told in the screen's words; a refusal is drawn beside the act", async () => {
  const p = await open("/app", { ...PLANE, ...CREATOR });
  const b = await press(p, "promote", { values: { "home-title": "   " } });
  assert.equal(p.byOp("promote").length, 0);
  assert.equal(beside(p, b), "Give the project a title first.");
  const t = await open("/app", { ...PLANE, ...CREATOR, promote: refused("NAME_TAKEN", "A project already has this title.") });
  const c = await press(t, "promote", { values: { "home-title": "Parks" } });
  assert.match(beside(t, c), /already has this title|NAME_TAKEN/);
  assert.equal(t.doc.getElementById("home-title").value, "Parks", "the form keeps what the member typed (interface-shell R13)");
  assert.equal(t.location.pathname, "/app");
});

test("R1 (interface-shell R12): \"Start a project\" is drawn only to a session that may contribute", async () => {
  const p = await open("/app", { ...PLANE, whoami: ok({ ...MEMBER, capabilities: [] }) });
  assert.ok(!ops(p).includes("promote"));
  assert.doesNotMatch(text(p), /Start a project/, "nor its disclosure");
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

test("R9, R14, R23: \"What happened?\" draws each door startfrom answers as the design's card (mk-door), the sixth door last; a door left out is not drawn", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  assert.equal(p.byOp("startfrom").length, 1);
  const sec = main(p).querySelector('[data-front="doors"]');
  assert.match(text(p, sec), /^What happened\?Choose what fits, or describe it in your own words\. Nothing here is the one right way in\./);
  assert.deepEqual(main(p).querySelectorAll(".mk-door").map((d) => d.getAttribute("data-door")), ["problem", "money", "elsewhere"], "person, read and tip (no script) are not drawn");
  assert.match(text(p, doorOf(p, "problem").querySelector("summary")), /^A problem I live withPotholes, dumping, a bill, a service$/);
  assert.match(text(p, doorOf(p, "elsewhere")), /^Help for my own situationA notice, a bill, a repair, a deadline that's yours alone/);
  assert.deepEqual(doorOps(p, "problem"), [["WIZ-33b5887790b7561b", "1"], ["WIZ-cb0ad18a17a04233", "2"]]);
  // Control: with "Follow the money" not offered, the money door names only what startfrom names.
  assert.deepEqual(doorOps(p, "money").map(([id]) => id), ["WIZ-cb0ad18a17a04233"]);
  assert.doesNotMatch(text(p), /Follow the money/);
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
  assert.match(text(p), /None of these: start a project from a blank page\./);
  const start = main(p).querySelector('details[data-start="project"]');
  assert.equal(text(p, start.querySelector("summary")), "Start a project", "the act's own words");
  assert.equal(start.getAttribute("open"), null, "never an always-open field");
  assert.ok(start.querySelector("#home-title") && start.querySelector('button[data-act="promote"]'));
  const words = main(p).querySelectorAll('button[data-act="startfrom"]').find((x) => !x.dataset.script);
  assert.match(words.textContent, /^Start from…/);
  const none = await press(p, "startfrom", { nth: main(p).querySelectorAll('button[data-act="startfrom"]').indexOf(words), values: { "home-words": "  " } });
  assert.equal(beside(p, none), "Write what happened first.");
  assert.equal(p.byOp("search").length, 0, "control: no words, nothing searched");
  await press(p, "startfrom", { nth: main(p).querySelectorAll('button[data-act="startfrom"]').findIndex((x) => !x.dataset.script), values: { "home-words": " potholes on Seminary " } });
  assert.equal(last(p, "search").query.q, "potholes on Seminary");
  const m = main(p).querySelector('[data-front="matching"]');
  assert.match(text(p, m), /^Already in your group: Pothole repairs, Work orders FY2025$/);
  assert.equal(p.doc.getElementById("home-words").value, " potholes on Seminary ", "the field keeps what the member typed");
  assert.equal(p.byOp("lookedsince").length, 1, "re-reading the doors never re-reads lookedsince");
});
