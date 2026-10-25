/* screens-inquiry FR-28 (B15), R122 (DEC-384 T-06) and entry 43 (K4199): after an owner stands down, her own row says the vote is
 * open and who is awaited, at once and until the vote ends; another owner's view of the row has the button to agree; and the
 * reason box the shell now opens before "Make an owner" is given as a member gives it. On interface-shell's served page over a
 * scripted plane. Every expectation is a word read by key (R44). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, MEMBER, boot } from "../interface-shell/harness.mjs";
import { hasWord } from "../../../src/setup-words/index.mjs";
import { open, main, actsIn, fill, press, says, section, plane, word, SCREENS, P, storeWorld } from "./fixtures.mjs";

/** The page `path` as `me`, over the real world's door and the session her sign-in made (op-tables §5.3). */
async function pageAs(world, me, path) {
  const { door, session } = world.boot(me);
  const p = await boot({ screens: SCREENS, door, session, path });
  await p.settle();
  return p;
}
/** A world where `ann` started a project, `ben` is a joined owner beside her, and `cat` a joined member. */
async function ownersWorld() {
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const people = {};
  for (const h of ["ben", "cat"]) {
    people[h] = await world.signIn(h, { capabilities: ["contribute"] });
    await ann.act("projectinvite", { query: { projectId: project, handle: h } });
    await people[h].act("projectjoin", { query: { projectId: project } });
  }
  return { world, ann, project, ...people };
}

const at = "/app/project/" + P;
const PROJECT = SCREENS.find((s) => s.id === "project");
const owner = (handle) => ({ handle, state: "joined", owner: 1 });
/* mai is the harness's member */
const TWO = ok({ ok: true, projectId: P, participants: [owner("dev"), owner("mai")] });
const THREE = ok({ ok: true, projectId: P, participants: [owner("dev"), owner("mai"), owner("rosa")] });
const MATH = (n) => (n === 2 ? { owners: 2, votesNeeded: 2, eligibleVoters: 2, targetMayVote: true, possible: true }
  : { owners: n, votesNeeded: Math.floor(n / 2) + 1, eligibleVoters: n - 1, targetMayVote: false, possible: true });
const arith = (n) => ok({ ok: true, table: [2, 3].map(MATH), live: MATH(n), projectId: P });
const votes = (...changes) => ok({ ok: true, projectId: P, changes });
const waiting = (target, agreed, awaiting) => ({ change: "remove", target, proposed_by: target, proposed_at: "2026-10-09T09:00:00Z", agreed, awaiting });
const short = (extra) => ({ status: 200, json: { ok: true, result: { ok: false, reason: "VOTES_SHORT", code: "VOTES_SHORT", projectId: P, handle: "mai", ...extra } } });
const rowOf = (p, handle) => section(p, "screen.project.members.head").querySelectorAll(".cs-row").find((r) => r.textContent.includes(handle) && !r.closest("[data-state-e]"));
/* the page as another member opens it: her own whoami over the fixture's plane with `over` */
const as = (handle, over) => ({ boot: { plane: { ...plane({ plane: over }), whoami: ok({ ...MEMBER, member: handle, handle }) } } });

test("R122 after she stands down, her own row says the vote is open and who is awaited, at once; her stand-down act is no longer offered there", async () => {
  const p = await open(at, { plane: { projectparticipants: TWO, projectownerarith: arith(2), projectownerremove: short({ have: 1, need: 2, deciders: ["mai"] }) } });
  assert.ok(!says(rowOf(p, "mai"), "project.owners.standdown.opened", { awaiting: "dev" }), "not before she has stood down");
  await press(p, "projectownerremove", { within: rowOf(p, "mai") });
  fill(p, { "project-ownerstand-reason": "I am stepping back; dev carries it." });
  await p.click(main(p).querySelector('[data-state-e="votes"] button[data-act="projectownerremove"]'));
  await p.settle();
  assert.equal(p.byOp("projectownerremove").length, 1, "the vote was sent");
  const mine = rowOf(p, "mai");
  assert.ok(says(mine, "project.owners.standdown.opened", { awaiting: "dev" }), "the vote is open, and dev is awaited");
  assert.ok(!actsIn(mine).includes("projectownerremove"), "she is not offered it again");
  assert.ok(!says(rowOf(p, "dev"), "project.owners.standdown.opened", { awaiting: "dev" }), "control: only her own row");
});

test("R122 the vote still open when the page is read says so on her row, with every owner awaited by name; it is gone when the vote has ended", async () => {
  const pending = votes(waiting("mai", ["mai"], ["dev", "rosa"]));
  const p = await open(at, { plane: { projectparticipants: THREE, projectownerarith: arith(3), projectownervotes: pending } });
  assert.ok(says(rowOf(p, "mai"), "project.owners.standdown.opened", { awaiting: "dev, rosa" }));
  /* the vote ended: the plane lists no change, and the row says neither */
  const ended = await open(at, { plane: { projectparticipants: THREE, projectownerarith: arith(3), projectownervotes: votes() } });
  assert.ok(!rowOf(ended, "mai").textContent.includes(word("project.owners.standdown.opened", { awaiting: "dev, rosa" }).slice(0, 20)));
  assert.ok(actsIn(rowOf(ended, "mai")).includes("projectownerremove"), "and she may stand down");
});

test("R122 another owner's view of the row draws the button to agree, which opens the same vote; one who has agreed, and a member who is no owner, are not offered it", async () => {
  const pending = votes(waiting("mai", ["mai"], ["dev"]));
  const p = await open(at, as("dev", { projectownervotes: pending, projectparticipants: TWO, projectownerarith: arith(2) }));
  const mai = rowOf(p, "mai");
  const agree = mai.querySelector('button[data-act="projectownerremove"]');
  assert.ok(agree && says(agree, "project.owners.agree.remove", { who: "mai" }), "on her row, by its key");
  assert.ok(!says(mai, "project.owners.standdown.opened", { awaiting: "dev" }), "the opened sentence is her own row's, for her alone");
  assert.equal(rowOf(p, "dev").querySelector('button[data-act="projectownerremove"][data-handle="mai"]'), null);
  await p.click(agree);
  await p.settle();
  assert.equal(p.byOp("projectownerremove").length, 0, "pressing it opens the vote and sends nothing (R75)");
  assert.ok(main(p).querySelector('[data-state-e="votes"]'));
  /* control: dev has already agreed */
  const done = await open(at, as("dev", { projectownervotes: votes(waiting("mai", ["mai", "dev"], [])), projectparticipants: TWO, projectownerarith: arith(2) }));
  assert.equal(rowOf(done, "mai").querySelector('button[data-act="projectownerremove"]'), null);
  /* control: cat is a member, not an owner, and ben's real stand-down vote is open (the refusal is the plane's own answer) */
  const t = await ownersWorld();
  await t.ann.act("projectowneradd", { query: { projectId: t.project, handle: "ben", reason: "she carries it with me" } });
  await assert.rejects(t.ben.act("projectownerremove", { query: { projectId: t.project, handle: "ben", reason: "stepping back" } }), /VOTES_SHORT/);
  const cat = await pageAs(t.world, t.cat, "/app/project/" + t.project);
  assert.ok(rowOf(cat, "ben"), "control: ben's row is drawn to her");
  assert.ok(!actsIn(section(cat, "screen.project.members.head")).includes("projectownerremove"));
});

test("R122 control: a row with no pending removal draws neither the opened sentence nor the agree button", async () => {
  const p = await open(at, { plane: { projectparticipants: THREE, projectownerarith: arith(3), projectownervotes: votes() } });
  const text = section(p, "screen.project.members.head").textContent;
  assert.ok(!text.includes(word("project.owners.standdown.opened", { awaiting: "x" }).slice(0, 18)));
  assert.equal(section(p, "screen.project.members.head").querySelectorAll("button").filter((b) => b.textContent.includes(word("project.owners.agree.remove", { who: "dev" }).slice(0, 7))).length, 0);
  /* an add waiting on owners keeps its own agree (project.owners.agree), never this one */
  const add = await open(at, { plane: { projectparticipants: THREE, projectownerarith: arith(3), projectownervotes: votes({ change: "add", target: "ana", proposed_by: "dev", proposed_at: "2026-10-09T09:00:00Z", agreed: ["dev"], awaiting: ["mai", "rosa"] }) } });
  assert.ok(section(add, "screen.project.members.head").querySelectorAll("button").some((b) => says(b, "project.owners.agree", { who: "ana" })));
  assert.ok(!section(add, "screen.project.members.head").querySelectorAll("button").some((b) => says(b, "project.owners.agree.remove", { who: "ana" })));
});

test("R122 every key of the stand-down's notice is held and listed (K874)", () => {
  for (const k of ["project.owners.standdown.opened", "project.owners.agree.remove"]) {
    assert.ok(hasWord(k), k);
    assert.ok(PROJECT.words.includes(k), k + " is listed by the screen");
  }
});

test("R29 K4199 Make an owner asks its reason before it runs, and sends it with the act; control: Remove from the project, whose reason is optional, is unchanged", async () => {
  const { world, ann, project } = await ownersWorld();
  const p = await pageAs(world, ann, "/app/project/" + project);
  const row = () => section(p, "screen.project.members.head").querySelectorAll(".cs-row").find((r) => r.textContent.includes("cat"));
  const add = await press(p, "projectowneradd", { within: row() });
  assert.equal(p.byOp("projectowneradd").length, 0, "nothing is sent until she gives a reason");
  assert.ok(add && add.querySelector('textarea[id^="cs-reason-"]'), "the shell opens its reason box");
  await press(p, "projectowneradd", { within: row(), reason: "she has done the work" });
  assert.equal(p.byOp("projectowneradd").length, 1);
  assert.equal(p.byOp("projectowneradd")[0].query.handle, "cat");
});
