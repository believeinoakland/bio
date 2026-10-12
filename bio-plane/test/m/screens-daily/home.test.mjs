/* The group's home (R1) on the real served page (interface-shell's harness): what it reads, what it draws in each state,
   and the one act it offers, run through the shell's kit, gate and re-reads. */
import test from "node:test";
import assert from "node:assert/strict";
import { open, ok, refused, text, ops, button, press, beside, last, main, screen, MEMBER } from "./page.mjs";

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
  search: ok({ hits: [
    { bundle_id: "PROJ-1", title: "The Coliseum lease", current_state: "investigating" },
    { bundle_id: "PROJ-2", title: "Pothole repairs", current_state: "forming" },
    { bundle_id: "PROJ-3", title: "Odd", current_state: "paused" },
  ] }),
  projectdirectory: ok({ projects: [{ id: "PROJ-9", name: "Library hours", request: { state: "open" } }, { id: "PROJ-8", name: "Parks", request: null }] }),
};
const CREATOR = { whoami: ok({ ...MEMBER, capabilities: ["contribute", "create_projects"] }) };

test("R1: Home reads queue (its first items), the projects the member may see, the projects they could join, and the public groupidentity", async () => {
  const p = await open("/app", PLANE);
  const q = p.byOp("queue").find((r) => r.query.limit === "5");
  assert.ok(q, "the queue's first five");
  assert.equal(last(p, "search").query.q, "type:project");
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

test("R1: each project the member may see is a link to its screen with its stage ladder Forming, Investigating, Matured, Closed", async () => {
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
  assert.doesNotMatch(text(p), /\d+ questions?\b/, "no question count in T46 (K3000)");
});

test("R1: the projects the member could join are listed by name under their own heading, with no act", async () => {
  const p = await open("/app", PLANE);
  assert.match(text(p), /Projects you could joinLibrary hoursYou asked to joinParks/);
  const none = await open("/app", { ...PLANE, projectdirectory: ok({ projects: [] }) });
  assert.doesNotMatch(text(none), /Projects you could join/);
  assert.deepEqual(ops(p), ["promote"]);
});

test("R1 (interface-shell R10): each read drawn in its four states: loading, empty in its own words, failed, data", async () => {
  const pend = { pending: true };
  const loading = await open("/app", { groupidentity: pend, queue: pend, search: pend, projectdirectory: pend });
  assert.ok(main(loading).querySelectorAll('[data-state="loading"]').length >= 3);
  const empty = await open("/app", { ...PLANE, queue: ok({ items: [], item_count: 0 }), search: ok({ hits: [] }) });
  assert.match(text(empty), /Nothing is waiting on you\./);
  assert.match(text(empty), /No project yet\./);
  const failed = await open("/app", { ...PLANE, search: refused("STORE_DID_NOT_ANSWER", "the store did not answer", 502) });
  assert.equal(main(failed).querySelectorAll('[data-state="failed"]').length, 1);
  assert.doesNotMatch(text(failed), /No project yet/, "a failed read is never drawn as empty");
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
