/* screens-inquiry R10, R29, R30, R40, R53, R60 (fix round 10, the final pass: walk-T51-final diagnosis 03 and 03b), over `store-request`'s world:
 * the real store, a real sign-in, the page's own door (op-tables §5.3). Every state a test needs is made by the acts that make it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "../interface-shell/harness.mjs";
import { SCREENS, word, storeWorld, main, actsIn, section, press } from "./fixtures.mjs";

const PASSWORD = "a founder password that is long enough";

/** The page `path` as `me`, over the world's door and the session her sign-in made. */
async function pageAs(world, me, path) {
  const { door, session } = world.boot(me);
  const p = await boot({ screens: SCREENS, door, session, path });
  await p.settle();
  return p;
}

test("R40 R29 the founder who chose no handle holds her owner's acts on the project she started", async () => {
  const world = await storeWorld({ claimed: false });
  await world.claim({ password: PASSWORD });
  const founder = await world.signIn("admin", { admin: true });
  const project = await world.recipes.project(founder, "Stormwater");
  const roster = (await founder.read("projectparticipants", { query: { projectId: project } })).participants;
  assert.deepEqual([roster[0].founder, roster[0].handle], [true, null], "the roster's founder row, as the plane answers it: no handle, no member");
  assert.deepEqual([(await founder.read("whoami")).member, (await founder.read("whoami")).handle], ["admin", null]);
  const p = await pageAs(world, founder, "/app/project/" + project);
  const acts = actsIn(main(p));
  for (const op of ["projectinvite", "projectvisibilityset", "projectbarset", "projectclose"]) assert.ok(acts.includes(op), `the owner's ${op}`);
  assert.ok(!acts.includes("projectowneradd"), "no make-an-owner on her own row");
});

/** A world with an owner `ann` of a project `Stormwater` she started, and `others` signed in and invited to it (joined unless `joined: false`). */
async function teamWorld({ others = [], joined = true, capabilities = null } = {}) {
  const world = await storeWorld();
  const ann = await world.signIn("ann", { capabilities: capabilities || ["contribute", "create_projects"] });
  const project = await world.recipes.project(ann, "Stormwater");
  const people = {};
  for (const h of others) {
    const who = await world.signIn(h, { capabilities: ["contribute"] });
    await ann.act("projectinvite", { query: { projectId: project, handle: h } });
    if (joined) await who.act("projectjoin", { query: { projectId: project } });
    people[h] = who;
  }
  return { world, ann, project, people };
}
const fillIn = (p, values) => { for (const [id, v] of Object.entries(values)) { const el = p.doc.getElementById(id); assert.ok(el, `no field ${id}`); el.value = v; } };
/** Press the act `op` on the page, a reasoned act's reason field answered with `reason`. */
const pressAct = (p, op, reason = "after the walk") => press(p, op, { reason });

test("R53 a malformed stake is refused in the PROJECT's words, not the team's", async () => {
  const { world, ann, project } = await teamWorld();
  const p = await pageAs(world, ann, "/app/project/" + project);
  fillIn(p, { "project-stake": "x".repeat(6000) });
  await pressAct(p, "projectstakeset");
  const said = section(p, "stake.project.title").textContent;
  assert.ok(said.includes(word("refusal.STAKE_MALFORMED.project")), "the project's sentence");
  assert.ok(!said.includes(word("refusal.STAKE_MALFORMED")), "not the team's");
});

test("R60 a requester is told the owners' answer: a declined request says when and in their word, and still offers to ask again", async () => {
  const { world, ann, project } = await teamWorld();
  await ann.act("projectvisibilityset", { query: { projectId: project, setting: "discoverable", reason: "let the neighbours find it" } });
  const cal = await world.signIn("cal", { capabilities: ["contribute"] });
  const dee = await world.signIn("dee", { capabilities: ["contribute"] });
  await cal.act("projectrequest", { query: { projectId: project } });
  await dee.act("projectrequest", { query: { projectId: project } });
  await ann.act("projectrequestanswer", { query: { projectId: project, handle: "cal", answer: "decline", comment: "We are full this season." } });
  const p = await pageAs(world, cal, "/app/project/" + project);
  const declined = main(p).querySelector('[data-request="declined"]');
  assert.ok(declined, "the decline is drawn");
  assert.ok(declined.textContent.includes("We are full this season."), "the owners' word");
  assert.ok(actsIn(main(p)).includes("projectrequest"), "she may ask again");
  /* control: an open request draws no decline */
  const open = await pageAs(world, dee, "/app/project/" + project);
  assert.ok(!main(open).querySelector('[data-request="declined"]'), "no decline for an open request");
  assert.deepEqual(actsIn(main(open)), ["projectrequestwithdraw"]);
});

test("R29 a member who asked to leave: her page says the request stands and offers Join to withdraw it; the owners' row for her offers Remove and no seat", async () => {
  const { world, ann, project, people } = await teamWorld({ others: ["bob"] });
  const before = await pageAs(world, people.bob, "/app/project/" + project);
  assert.ok(actsIn(main(before)).includes("projectleave"), "control: a joined member is offered the leave");
  await people.bob.act("projectleave", { query: { projectId: project } });
  const bob = await pageAs(world, people.bob, "/app/project/" + project);
  const acts = actsIn(main(bob));
  assert.ok(acts.includes("projectjoin") && !acts.includes("projectleave"), "Join withdraws it; no second leave");
  const owners = await pageAs(world, ann, "/app/project/" + project);
  const row = main(owners).querySelector('[data-leaving="asked"]');
  assert.ok(row, "the owners' row for her is marked");
  assert.deepEqual(actsIn(row), ["projectremove"], "Remove from the project, and no seat to give");
  /* control: an owner is not offered the removal of an owner, and a joined member's row carries no mark */
  assert.equal(main(owners).querySelectorAll('[data-leaving="asked"]').length, 1);
});

test("R29 a joined participant who may not start projects is shown none of the fork's three controls", async () => {
  const { world, project, people } = await teamWorld({ others: ["bob"] });
  const bob = await pageAs(world, people.bob, "/app/project/" + project);
  assert.ok(!bob.doc.getElementById("project-fork-title"), "no title field");
  assert.ok(!bob.doc.getElementById("project-fork-visibility"), "no visibility choice");
  assert.ok(!actsIn(main(bob)).includes("projectfork"));
  /* control: with the capability all three */
  const { world: w2, project: p2, people: pe2 } = await teamWorld({ others: ["cat"] });
  await (await w2.signIn("admin")).act("membercaps", { body: { memberId: "cat", capabilities: ["contribute", "create_projects"] } });
  const cat = await pageAs(w2, pe2.cat, "/app/project/" + p2);
  assert.ok(cat.doc.getElementById("project-fork-title") && cat.doc.getElementById("project-fork-visibility"));
  assert.ok(actsIn(main(cat)).includes("projectfork"));
});

test("R10 two owners change the bar at once: the second save names the bar she saw and is refused with the bar now held, which the page then draws", async () => {
  const { world, ann, project, people } = await teamWorld({ others: ["ben"] });
  await ann.act("projectowneradd", { query: { projectId: project, handle: "ben" } });
  const annPage = await pageAs(world, ann, "/app/project/" + project);
  const benPage = await pageAs(world, people.ben, "/app/project/" + project);
  /* ann saves first, from the bar both saw (none) */
  fillIn(annPage, { "project-bar-capture": "B", "project-bar-connection": "B" });
  await pressAct(annPage, "projectbarset");
  assert.deepEqual(annPage.byOp("projectbarset")[0].body.expected, { capture: null, connection: null });
  /* ben saves from the page he drew before: stale */
  fillIn(benPage, { "project-bar-capture": "C", "project-bar-connection": "C" });
  await pressAct(benPage, "projectbarset");
  assert.deepEqual(benPage.byOp("projectbarset")[0].body.expected, { capture: null, connection: null }, "the bar he saw");
  const held = (await ann.read("strengthbarof", { query: { project } })).bar;
  assert.deepEqual([held.capture, held.connection], ["B", "B"], "nothing of his was written");
  assert.ok(main(benPage).textContent.includes("B"), "the bar now held is drawn");
  /* he saves again, from the bar now drawn: it stands */
  fillIn(benPage, { "project-bar-capture": "C", "project-bar-connection": "C" });
  await pressAct(benPage, "projectbarset");
  assert.deepEqual(benPage.byOp("projectbarset")[1].body.expected, { capture: "B", connection: "B" });
  const now = (await ann.read("strengthbarof", { query: { project } })).bar;
  assert.deepEqual([now.capture, now.connection], ["C", "C"]);
});

test("R30 an administrator at a hidden project whose owners are all inactive is offered the rescue, read from the affordances the plane answers", async () => {
  const { world, ann, project } = await teamWorld();
  const founder = await world.signIn("rosa", { admin: true });
  await ann.act("projectvisibilityset", { query: { projectId: project, setting: "hidden", reason: "kept to ourselves" } });
  const before = await pageAs(world, founder, "/app/project/" + project);
  assert.ok(!actsIn(main(before)).includes("projectownerrescue"), "control: while its owner is active");
  await (await world.signIn("admin")).act("memberset", { body: { memberId: "ann", status: "revoked" } });
  const p = await pageAs(world, founder, "/app/project/" + project);
  assert.deepEqual(actsIn(main(p)), ["projectownerrescue"], "the rescue and nothing else");
});
