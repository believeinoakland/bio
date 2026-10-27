/* screens-inquiry R10, R29, R30, R40, R53, R60 (fix round 10, the final pass: walk-T51-final diagnosis 03 and 03b), over `store-request`'s world:
 * the real store, a real sign-in, the page's own door (op-tables §5.3). Every state a test needs is made by the acts that make it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boot } from "../interface-shell/harness.mjs";
import { SCREENS, word, storeWorld, main, actsIn, section, press, day, lead, open, says, Q, D, DOCUMENT_MD } from "./fixtures.mjs";
import { provenanceOf } from "../../../src/provenance/index.mjs";
import { questionWaitsSetAside } from "../inquiry/fixtures.mjs";
import { ok } from "../interface-shell/harness.mjs";

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

test("R106 a goal row lists the objectives linked to it: the project's name, who linked it and the day; a goal with none linked draws nothing more", async () => {
  const { world, ann, project } = await teamWorld();
  const goal = (await ann.act("goaldeclare", { body: { statement: "Every street drains", bounds: "By 2028" } })).goal;
  const lone = (await ann.act("goaldeclare", { body: { statement: "Every drain is mapped", bounds: "By 2029" } })).goal;
  await ann.act("goallink", { body: { goal, project } });
  const read = (await ann.read("goal", { query: { id: goal } })).goal.objectives[0];
  const p = await pageAs(world, ann, "/app/objective/" + project);
  const links = main(p).querySelectorAll("[data-objective-link]");
  assert.equal(links.length, 1, "only the linked goal carries a link");
  const text = links[0].textContent;
  assert.ok(text.includes("Stormwater") && text.includes("ann") && text.includes(day(read.at)), text);
  assert.ok(lone && !main(p).textContent.includes("undefined"));
});

test("R46 the declarer is named the same way everywhere: the founder's handle on the objective page, the unnamed word where she holds none", async () => {
  const world = await storeWorld();
  const founder = await world.signIn("founder", { admin: true });
  const project = await world.recipes.project(founder, "Stormwater");
  await founder.act("aspirationdeclare", { body: { scope: "project", owner: project, statement: "Every street drains" } });
  const p = await pageAs(world, founder, "/app/objective/" + project);
  const row = main(p).textContent;
  assert.ok(row.includes("Every street drains") && row.includes("founder"), "her handle");
  assert.ok(!row.includes(word("member.founder.unnamed")), "not the unnamed word");
  /* control: a founder who chose no handle reads the unnamed word */
  const bare = await storeWorld({ claimed: false });
  await bare.claim({ password: PASSWORD });
  const me = await bare.signIn("admin", { admin: true });
  const proj2 = await bare.recipes.project(me, "Roads");
  await me.act("aspirationdeclare", { body: { scope: "project", owner: proj2, statement: "Every road is paved" } });
  const q = await pageAs(bare, me, "/app/objective/" + proj2);
  assert.ok(main(q).textContent.includes(word("member.founder.unnamed")));
});

test("R32 an uploaded copy's source line says who brought the file and when, never its upload: address or its fingerprint", async () => {
  const { world, ann, project } = await teamWorld();
  const { sha, bundle } = await world.recipes.hold(ann, "Minutes", "The council met on Monday.", project);
  const p = await pageAs(world, ann, "/app/document/" + bundle);
  const page = main(p).textContent;
  assert.ok(!/upload:/i.test(page), "no upload: address anywhere on the page");
  const sub = main(p).querySelector(".mk-sub").textContent;
  assert.ok(!sub.includes(sha.slice(0, 8)) && !/[0-9a-f]{40}/.test(sub), "and no fingerprint in the source line");
  assert.ok(page.includes(lead("document.uploaded.by") + "ann"), "uploaded by her, in the word's own sentence");
});

test("provenance R80 a document's standing authority is read by `authority` and drawn: undetermined at capture, then its issuer and dated basis once a member decided", async () => {
  const { world, ann, project } = await teamWorld();
  const { sha, bundle } = await world.recipes.hold(ann, "Minutes", "The council met on Monday.", project);
  const before = await pageAs(world, ann, "/app/document/" + bundle);
  assert.equal(before.byOp("authority")[0].query.bundleId, bundle, "asked by the document");
  const control = main(before).querySelector("[data-authority]");
  assert.equal(control && control.getAttribute("data-authority"), "undetermined", "control: the register's value alone");
  const decided = provenanceOf(world.ctx).declareAuthority({ bundle, capture: sha, outcome: "determined", authority: "City Clerk", basis: "The clerk's office stamped it.", by: "ann", viewer: "member:ann" });
  assert.equal(decided.ok, true);
  const after = await pageAs(world, ann, "/app/document/" + bundle);
  const line = main(after).querySelector("[data-authority]");
  assert.equal(line.getAttribute("data-authority"), "determined");
  assert.ok(line.textContent.includes("City Clerk") && line.textContent.includes("The clerk's office stamped it.") && line.textContent.includes(day(decided.at)), line.textContent);
  /* a document decided undetermined after review says it was reviewed */
  const second = await world.recipes.hold(ann, "Letter", "Dear council.", project);
  provenanceOf(world.ctx).declareAuthority({ bundle: second.bundle, capture: second.sha, outcome: "undetermined_after_review", basis: "No issuer is named on it.", by: "ann", viewer: "member:ann" });
  const reviewed = await pageAs(world, ann, "/app/document/" + second.bundle);
  const rl = main(reviewed).querySelector("[data-authority]");
  assert.deepEqual([rl.getAttribute("data-authority"), rl.getAttribute("data-reviewed")], ["undetermined", "1"]);
  assert.ok(rl.textContent.includes("No issuer is named on it."));
});

test("R2 R58 the question screen draws inquiry's set-aside waits and history as inquiry answers them: the wait while the document stays set aside, both acts in the history after a restore, nothing for a viewer who may not see the document", async () => {
  const fx = questionWaitsSetAside({ asker: "member:mai", setter: "member:ben" });
  const reads = (answer) => ({ plane: { questionwaits: ok(answer) }, images: { [fx.document]: { "bundle.md": DOCUMENT_MD } } });
  const waiting = await open("/app/question/" + Q, reads(fx.answer));
  const row = main(waiting).querySelector('[data-wait="aside"]');
  assert.ok(row, "the wait is drawn");
  assert.ok(says(row, "screen.question.waits.setaside", { document: "Pothole repair policy, Administrative Instruction 4.12", who: "ben", reason: fx.reason }), "the document by its title, who set it aside, why");
  assert.deepEqual(actsIn(row), ["heldrestore", "search"], "restore it with a reason, or find another source");
  assert.equal(main(waiting).querySelectorAll("[data-history-act]").length, 1, "its history: the set-aside");
  /* after the restore: no wait, and the history holds both acts, the restore beside the set-aside it undid, each with its reason */
  const restored = await open("/app/question/" + Q, reads(fx.restored));
  assert.ok(!main(restored).querySelector('[data-wait="aside"]'), "a restore ends the wait");
  const acts = main(restored).querySelectorAll("[data-history-act]");
  assert.deepEqual(acts.map((a) => a.getAttribute("data-history-act")), ["set_aside", "restore"]);
  assert.ok(acts[0].textContent.includes(fx.reason) && acts[1].textContent.includes(fx.restoreReason), "both reasons stay");
  /* control: a viewer who may not see the document is shown neither */
  const hidden = await open("/app/question/" + Q, reads(fx.hiddenFrom));
  assert.ok(!main(hidden).querySelector('[data-wait]') && !main(hidden).querySelector("[data-history-act]"));
});

test("R106 R12 a retired aspiration stays readable on the objective page: marked retired, with what pursuing it taught and its dead ends, before and after it was retired; the held list is unchanged", async () => {
  const { world, ann, project } = await teamWorld();
  const held = (await ann.act("aspirationdeclare", { body: { scope: "project", owner: project, statement: "Map every storm drain" } })).aspiration;
  const gone = (await ann.act("aspirationdeclare", { body: { scope: "project", owner: project, statement: "Name every signatory" } })).aspiration;
  await ann.act("aspirationdeadend", { body: { aspiration: gone, note: "The register was sealed." } });
  await ann.act("aspirationretire", { body: { aspiration: gone, taught: "Signatories are in the minutes, not the register." } });
  await ann.act("aspirationdeadend", { body: { aspiration: gone, note: "The clerk had no copy." } });
  const p = await pageAs(world, ann, "/app/objective/" + project);
  const rows = main(p).querySelectorAll("[data-retired]");
  assert.equal(rows.length, 1, "only the retired one is marked");
  const said = rows[0].textContent;
  for (const s of ["Name every signatory", "Signatories are in the minutes, not the register.", "The register was sealed.", "The clerk had no copy."]) assert.ok(said.includes(s), s);
  assert.ok(!said.includes("Map every storm drain"), "the held one is not among the retired");
  assert.ok(main(p).textContent.includes("Map every storm drain") && held, "the held one is still listed");
  /* control: the retire act offers only what is held */
  const retire = p.doc.getElementById("ob-ret-asp");
  assert.ok(retire && !retire.outerHTML.includes(gone), "a retired aspiration cannot be retired again");
  /* control: a project with none retired draws none */
  const { world: w2, ann: a2, project: p2 } = await teamWorld();
  await a2.act("aspirationdeclare", { body: { scope: "project", owner: p2, statement: "Only held" } });
  const q = await pageAs(w2, a2, "/app/objective/" + p2);
  assert.equal(main(q).querySelectorAll("[data-retired]").length, 0);
});
