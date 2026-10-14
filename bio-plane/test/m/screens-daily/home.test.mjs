/* The group's home (R1, R8, R9, R11) on the real served page (interface-shell's harness): what it reads, what it draws in
   each state, and the acts it offers, run through the shell's kit, gate and re-reads. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, button, press, beside, last, main, screen, settle, MEMBER } from "./page.mjs";
import { ADMIN } from "../interface-shell/harness.mjs";

const PLANE = {
  groupidentity: ok({ ok: true, group: "lakeshore", display_name: "Lakeshore Tenants", description: "Rents and leases on city land." }),
  queue: ok({
    items: [
      { id: "TSK-1", class: "OBLIGATION", kind: "check", summary: "Vouch for 3 photos", due: "2026-10-12" },
      { id: "FINDING::a", class: "FINDING", kind: "source-modified", summary: "Two documents disagree" },
      { id: "CONDITION::b", class: "CONDITION", kind: "reply", summary: "A reply is due" },
    ],
    item_count: 9,
  }),
  projectlist: ok({ ok: true, count: 3, limit: 200, truncated: false, projects: [
    { id: "PROJ-1", name: "The Coliseum lease", stage: "investigating" },
    { id: "PROJ-2", name: "Pothole repairs", stage: "forming" },
    { id: "PROJ-3", name: "Odd", stage: "paused" },
  ] }),
  // Each project's questions, paged (basis-versions R50): PROJ-1 holds 3 over two pages, PROJ-2 one, PROJ-3 none.
  projectquestions: (req) => {
    const pages = { "PROJ-1": [[{ inquiry: "INQ-1" }, { inquiry: "INQ-2" }], [{ inquiry: "INQ-3" }]], "PROJ-2": [[{ inquiry: "INQ-4" }]], "PROJ-3": [[]] };
    const at = req.query.after ? 1 : 0;
    const list = pages[req.query.project] || [[]];
    return ok({ ok: true, project: req.query.project, items: list[at] || [], cursor: at + 1 < list.length ? "INQ-2" : null });
  },
  startfrom: ok({ ok: true, scripts: [], doors: [] }),
  projectdirectory: ok({ projects: [{ id: "PROJ-9", name: "Library hours", request: { state: "open" } }, { id: "PROJ-8", name: "Parks", request: null }] }),
};
const CREATOR = { whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }) };

test("R1, R8: Home reads queue (its first items), projectlist (the projects the member sees), the projects they could join, and the public groupidentity", async () => {
  const p = await open("/app", PLANE);
  const q = p.byOp("queue").find((r) => r.query.limit === "5");
  assert.ok(q, "the queue's first five");
  assert.equal(p.byOp("projectlist").length, 1);
  assert.equal(p.byOp("search").length, 0, "R8: no search over type:project any more");
  assert.equal(p.byOp("projectdirectory").length, 1);
  assert.ok(p.byOp("groupidentity").length >= 1);
});

test("R1: the heading is the group's name and its description; the queue's first items by kind mark, under \"Your queue (<n>)\"", async () => {
  const p = await open("/app", PLANE);
  assert.equal(main(p).querySelector("h1").textContent, "Lakeshore Tenants");
  assert.match(text(p), /Rents and leases on city land\./);
  const kinds = main(p).querySelectorAll(".cs-kind").map((e) => e.getAttribute("data-kind"));
  assert.deepEqual(kinds, ["todo", "noticed", "status"]);
  const link = main(p).querySelectorAll("a[data-nav]").find((a) => a.getAttribute("href") === "/app/queue");
  assert.equal(link.textContent, "Your queue (9)");
  assert.match(text(p), /Vouch for 3 photos12 October 2026/);
  const bare = await open("/app", { ...PLANE, groupidentity: ok({ ok: true, display_name: "Lakeshore Tenants" }) });
  assert.match(text(bare), /Your group has not described itself yet\./);
});

test("R1, R8: each project the member sees is a reference opening project, with its stage ladder Forming, Investigating, Matured, Closed", async () => {
  const p = await open("/app", PLANE);
  // Each project is the record's item, through the kit's reference (interface-shell R16): a link once the project screen
  // is registered beside these (screens-inquiry), its card meanwhile.
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

test("R8: each project's question count is read from projectquestions, paged to its end, and drawn with the project", async () => {
  const p = await open("/app", PLANE);
  await settle();
  const reads = p.byOp("projectquestions").map((r) => `${r.query.project}:${r.query.after || ""}`);
  assert.deepEqual(reads.sort(), ["PROJ-1:", "PROJ-1:INQ-2", "PROJ-2:", "PROJ-3:"], "PROJ-1 paged on past its first page's cursor");
  assert.match(text(p), /The Coliseum lease3 questions/);
  assert.match(text(p), /Pothole repairs1 question\b/);
  assert.match(text(p), /Odd0 questions/);
  // Redraws (each count landing redraws the screen) read no count again: four reads for three projects, one paged on.
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

test("R1: the projects the member could join are listed by name under their own heading, with no act", async () => {
  const p = await open("/app", PLANE);
  assert.match(text(p), /Projects you could joinLibrary hoursYou asked to joinParks/);
  const none = await open("/app", { ...PLANE, projectdirectory: ok({ projects: [] }) });
  assert.doesNotMatch(text(none), /Projects you could join/);
  assert.deepEqual(ops(p), ["promote"], "with no doors, Home draws no Start from… (R9)");
});

test("R1 (interface-shell R10): each read drawn in its four states: loading, empty in its own words, failed, data", async () => {
  const pend = { pending: true };
  const loading = await open("/app", { groupidentity: pend, queue: pend, projectlist: pend, projectdirectory: pend, startfrom: pend });
  assert.ok(main(loading).querySelectorAll('[data-state="loading"]').length >= 3);
  const empty = await open("/app", { ...PLANE, queue: ok({ items: [], item_count: 0 }), projectlist: ok({ ok: true, projects: [] }) });
  assert.match(text(empty), /Nothing is waiting on you\./);
  assert.match(text(empty), /No projects yet\./);
  const failed = await open("/app", { ...PLANE, projectlist: refused("STORE_DID_NOT_ANSWER", "the store did not answer", 502) });
  assert.equal(main(failed).querySelectorAll('[data-state="failed"]').length, 1);
  assert.doesNotMatch(text(failed), /No projects yet/, "a failed read is never drawn as empty");
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
  assert.deepEqual(ops(p), []);
  assert.ok(screen("home"));
});

// The front doors as startfrom answers them (wizard-scripts R23, R33): "Follow the money" not offered, so `money` names only
// "Get a record"; `person` and `read` left out (no script offered).
const DOORS = ok({ ok: true,
  scripts: [
    { id: "WIZ-cb0ad18a17a04233", version: 2, name: "Get a record", start: "request" },
    { id: "WIZ-33b5887790b7561b", version: 1, name: "Check a claim", start: "finder" },
  ],
  doors: [
    { door: "problem", scripts: ["WIZ-33b5887790b7561b", "WIZ-cb0ad18a17a04233"] },
    { door: "money", scripts: ["WIZ-cb0ad18a17a04233"] },
    { door: "tip", scripts: [] },
  ] });
const doorOps = (p, door) => main(p).querySelector(`[data-door="${door}"]`).querySelectorAll("button[data-act]").map((b) => [b.dataset.script, b.dataset.version, b.textContent.replace(/Reversible.*|Reasoned.*/, "").trim()]);

test("R9: Home draws \"What happened?\" from startfrom: each door its words and its offered scripts; a door startfrom leaves out is not drawn", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  assert.equal(p.byOp("startfrom").length, 1);
  const sec = main(p).querySelector('[data-front="doors"]');
  assert.match(text(p, sec), /^What happened\?Choose what fits, or describe it in your own words\. Nothing here is the one right way in\./);
  assert.deepEqual(main(p).querySelectorAll("[data-door]").map((d) => d.getAttribute("data-door")), ["problem", "money"], "person, read and tip (no script) are not drawn");
  assert.match(text(p, main(p).querySelector('[data-door="problem"]')), /^A problem I live withPotholes, dumping, a bill, a service/);
  assert.match(text(p, main(p).querySelector('[data-door="money"]')), /^A payment or contractA budget line, a lease, a change order/);
  assert.deepEqual(doorOps(p, "problem").map(([id, v]) => [id, v]), [["WIZ-33b5887790b7561b", "1"], ["WIZ-cb0ad18a17a04233", "2"]]);
  assert.match(text(p, main(p).querySelector('[data-door="problem"]')), /Check a claim.*Get a record/);
  // Control: with "Follow the money" not offered, the money door names only what startfrom names.
  assert.deepEqual(doorOps(p, "money").map(([id]) => id), ["WIZ-cb0ad18a17a04233"]);
  assert.doesNotMatch(text(p), /Follow the money/);
});

test("R9: with no doors the section is not drawn; startfrom is a drawn act once it answers doors (R1's \"not drawn in T46\" retired)", async () => {
  const none = await open("/app", PLANE);
  assert.equal(main(none).querySelector('[data-front="doors"]'), null);
  assert.doesNotMatch(text(none), /What happened\?/);
  assert.ok(!ops(none).includes("startfrom"));
  const failed = await open("/app", { ...PLANE, startfrom: refused("STORE_DID_NOT_ANSWER", null, 502) });
  assert.equal(main(failed).querySelector('[data-front="doors"]'), null);
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  assert.ok(ops(p).includes("startfrom"));
});

test("R9: a door's script starts in the wizard runner (cs.wizard) and sends nothing", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS });
  const before = p.byOp("startfrom").length;
  const b = main(p).querySelector('[data-door="money"] button[data-act="startfrom"]');
  await p.click(b);
  await settle();
  assert.equal(p.byOp("startfrom").length, before, "starting a script sends no op");
  assert.deepEqual(p.wizards, [["WIZ-cb0ad18a17a04233", 2]], "the runner was asked to start that script at its version");
});

test("R9: beside the doors, the matching work (the member's words searched) and the blank start", async () => {
  const p = await open("/app", { ...PLANE, startfrom: DOORS, search: ok({ hits: [{ bundle_id: "PROJ-2", title: "Pothole repairs" }, { bundle_id: "INF-7", title: "Work orders FY2025" }] }) });
  assert.match(text(p), /None of these: start a project from a blank page\./);
  assert.ok(ops(p).includes("promote"), "the blank start is R1's Start a project");
  const words = main(p).querySelectorAll('button[data-act="startfrom"]').find((x) => !x.dataset.script);
  assert.match(words.textContent, /^Start from…/);
  const none = await press(p, "startfrom", { nth: main(p).querySelectorAll('button[data-act="startfrom"]').indexOf(words), values: { "home-words": "  " } });
  assert.equal(beside(p, none), "Write what happened first.");
  assert.equal(p.byOp("search").length, 0, "control: no words, nothing searched");
  await press(p, "startfrom", { nth: main(p).querySelectorAll('button[data-act="startfrom"]').findIndex((x) => !x.dataset.script), values: { "home-words": " potholes on Seminary " } });
  assert.equal(last(p, "search").query.q, "potholes on Seminary");
  const m = main(p).querySelector('[data-front="matching"]');
  assert.match(text(p, m), /^Already in your group: Pothole repairs, Work orders FY2025$/);
  assert.equal(p.doc.getElementById("home-words").value, "potholes on Seminary");
});

test("R11: with no project, a group's founder sees the new-group state: nothing is here yet, invite members, say who the group is", async () => {
  const empty = { ...PLANE, projectlist: ok({ ok: true, projects: [] }), whoami: ok({ ...ADMIN, capabilities: ["contribute", "create_projects"] }) };
  const p = await open("/app", empty);
  assert.match(text(p), /Your group's Civicsmith is readyNothing is here yet\. Most groups start by inviting a few members and opening one project about a problem they already know\./);
  assert.equal(main(p).querySelector('a[href="/app/members"]').textContent, "Invite your first members");
  assert.equal(main(p).querySelector('a[href="/app/group-identity"]').textContent, "Say who your group is");
  // Controls: a group with a project, a member who is not its founder, and a failed read draw no new-group state.
  assert.doesNotMatch(text(await open("/app", { ...empty, projectlist: PLANE.projectlist })), /Nothing is here yet/);
  assert.doesNotMatch(text(await open("/app", { ...empty, whoami: ok({ ...MEMBER, capabilities: ["contribute"] }) })), /Nothing is here yet/);
  assert.doesNotMatch(text(await open("/app", { ...empty, projectlist: refused("STORE_DID_NOT_ANSWER", null, 502) })), /Nothing is here yet/);
});
