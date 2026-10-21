/* R46, R47, R48 (T51's fix round; K4169, UC-046): the decisions the record routes to a member: an endorsement owed on a proposed
   administrator, an owner vote owed on a project's owner change, an expertise awaiting confirmation. Each reads the REAL
   member-roster (`endorsementsOwed`, `expertiseAwaitingConfirmation`) or project-roster (`projectOwnerVotes`) over the same storage,
   beside the real membership, so the rows are the owners' own; each item names its door (K4210). A feed that throws is the
   `members` feed (R45) and the others' items stand. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { busy } from "./every.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const V = (m) => `member:${m}`;
const kind = (r, k) => r.items.filter((i) => i.kind === k);
const owed = (r) => kind(r, "endorsement-owed");

/* Three administrators; "newbie" proposed by ada, whose own endorsement stands. */
function proposal() {
  const w = world();
  for (const m of ["ada", "bob", "cy"]) w.member(m, { role: "admin", handle: m });
  w.member("zed", { handle: "zed" });
  w.run(`INSERT INTO members (member_id, cover, handle, role, status, invited_by, created, updated, pairing_published)
         VALUES ('newbie','newbie',NULL,'member','proposed','ada',?,?,0)`, iso(NOW - 3600000), iso(NOW - 3600000));
  w.run(`INSERT INTO admin_votes (kind, target, voter, reason, created) VALUES ('add','newbie','ada',NULL,?)`, iso(NOW - 3600000));
  return w;
}
const endorse = (w, voter) => w.run(`INSERT INTO admin_votes (kind, target, voter, reason, created) VALUES ('add','newbie',?,NULL,?)`, voter, iso(NOW));

test("R46: a proposal makes one OBLIGATION endorsement-owed for each administrator who has not endorsed, keyed OBLIGATION::endorsement-owed::admin::<proposed>::<member>, to her alone, with no project home, aged from the proposal, offering adminendorse as its door", () => {
  const w = proposal();
  const bob = owed(w.read("bob", V("bob")));
  assert.deepEqual(bob.map((i) => i.id), ["OBLIGATION::endorsement-owed::admin::newbie::bob"], "one item");
  const it = bob[0];
  assert.deepEqual([it.class, it.kind, it.recipients], ["OBLIGATION", "endorsement-owed", ["bob"]]);
  assert.deepEqual(it.subject, { kind: "member", id: "newbie" });
  assert.deepEqual(it.case.ancestors, [], "no project home"); assert.equal(it.case.ungrouped, true);
  assert.deepEqual(it.age, { state: "determined", since: iso(NOW - 3600000), ms: 3600000 }, "from proposed_at");
  assert.equal(it.door, "adminendorse");
  assert.deepEqual(it.options, [{ id: "adminendorse", label: word("act.adminendorse.label.queue"), weight: "single" }]);
  assert.ok(it.summary.includes("newbie") && /\b1\b/.test(it.summary) && /\b2\b/.test(it.summary), `names her, the one who has and the two awaited: ${it.summary}`);
  assert.ok(!/[{}]/.test(it.summary + it.detail), "no unfilled placeholder");
  assert.deepEqual(it.basis.have, ["ada"]); assert.deepEqual(it.basis.awaiting, ["bob", "cy"]);
  assert.deepEqual(owed(w.read("cy", V("cy"))).map((i) => i.id), ["OBLIGATION::endorsement-owed::admin::newbie::cy"], "one for each administrator who has not endorsed");
  /* one endorsement clears hers and leaves the other's */
  endorse(w, "bob");
  assert.deepEqual(owed(w.read("bob", V("bob"))), [], "an endorsement clears hers");
  const cy = owed(w.read("cy", V("cy")));
  assert.deepEqual(cy.map((i) => i.id), ["OBLIGATION::endorsement-owed::admin::newbie::cy"]);
  assert.deepEqual(cy[0].basis.have, ["ada", "bob"]); assert.deepEqual(cy[0].basis.awaiting, ["cy"]);
  /* it leaves when the member is no longer proposed */
  w.run(`UPDATE members SET status='active' WHERE member_id='newbie'`);
  assert.deepEqual(owed(w.read("cy", V("cy"))), []);
});

test("R46 (control): the proposer, a member who is not an administrator, and a caller with no member see none", () => {
  const w = proposal();
  assert.deepEqual(owed(w.read("ada", V("ada"))), [], "the proposer has endorsed by proposing");
  assert.deepEqual(owed(w.read("zed", V("zed"))), [], "not an administrator");
  assert.deepEqual(owed(w.read(null, "class:admin")), [], "no member");
});

/* PRJ-1 "Parkside" owned by ann, bob and cal; dee outside. */
function parkside() {
  const w = world();
  for (const m of ["ann", "bob", "cal", "dee"]) w.member(m, { handle: m });
  w.bundle("PRJ-1", "project", { title: "Parkside" });
  for (const m of ["ann", "bob", "cal"]) w.join("PRJ-1", m, { owner: true });
  w.discoverable("PRJ-1");
  return w;
}
const vote = (w, kind, target, voter, project = "PRJ-1") =>
  w.run(`INSERT INTO project_owner_votes (project_id, kind, target, voter, reason, created) VALUES (?,?,?,?,NULL,?)`, project, kind, target, voter, iso(NOW));

test("R47: a two-of-three add makes one OBLIGATION endorsement-owed for the owner who has not voted, keyed ...::owner::<project>::add:<target>::<member>, to her only, naming the project and offering projectowneradd as its door", () => {
  const w = parkside();
  vote(w, "add", "dee", "ann"); vote(w, "add", "dee", "bob");
  const cal = owed(w.read("cal", V("cal")));
  assert.deepEqual(cal.map((i) => i.id), ["OBLIGATION::endorsement-owed::owner::PRJ-1::add:dee::cal"], "one item, for the owner who has not voted");
  const it = cal[0];
  assert.deepEqual([it.class, it.kind, it.recipients], ["OBLIGATION", "endorsement-owed", ["cal"]]);
  assert.deepEqual(it.subject, { kind: "project", id: "PRJ-1", name: "Parkside", change: "add", target: "dee" });
  assert.deepEqual(it.case.ancestors, [], "no project home");
  assert.equal(it.door, "projectowneradd");
  assert.deepEqual(it.options, [{ id: "projectowneradd", label: word("act.projectowneradd.label.queue"), weight: "single" }]);
  assert.ok(it.summary.includes("dee") && it.summary.includes("Parkside"), `names the target and the project: ${it.summary}`);
  assert.ok(!/[{}]/.test(it.summary + it.detail), "no unfilled placeholder");
  assert.deepEqual(it.basis.agreed, ["ann", "bob"]); assert.deepEqual(it.basis.awaiting, ["cal"]);
  /* it leaves when she votes */
  vote(w, "add", "dee", "cal");
  assert.deepEqual(owed(w.read("cal", V("cal"))), []);
});

test("R47: a removal names projectownerremove as its door and is told to the owners whose vote would still count (not the target at three owners)", () => {
  const w = parkside();
  vote(w, "remove", "cal", "ann");
  assert.deepEqual(owed(w.read("bob", V("bob"))).map((i) => [i.id, i.door, i.subject.change]),
    [["OBLIGATION::endorsement-owed::owner::PRJ-1::remove:cal::bob", "projectownerremove", "remove"]]);
  assert.equal(owed(w.read("bob", V("bob")))[0].options[0].id, "projectownerremove");
  assert.deepEqual(owed(w.read("cal", V("cal"))), [], "the target neither votes nor is awaited at three owners");
});

test("R47 (control): the proposer (who has voted), a participant who is not an owner, and an owner of another project see none; no member, none", () => {
  const w = parkside();
  w.bundle("PRJ-2", "project", { title: "Elsewhere" }); w.join("PRJ-2", "dee", { owner: true });
  vote(w, "add", "dee", "ann"); vote(w, "add", "dee", "bob");
  assert.deepEqual(owed(w.read("ann", V("ann"))), [], "the proposer");
  assert.deepEqual(owed(w.read("bob", V("bob"))), [], "voted");
  assert.deepEqual(owed(w.read("dee", V("dee"))), [], "owner of PRJ-2 only; the change is on PRJ-1");
  assert.deepEqual(owed(w.read(null, "class:admin")), []);
});

/* Two administrators; cy declares an expertise. */
function declaration() {
  const w = world();
  for (const m of ["ada", "bob"]) w.member(m, { role: "admin", handle: m });
  w.member("cy", { handle: "cy" });
  const r = w.membership.members.expertiseDeclare({ memberId: "cy", label: "tax law" });
  assert.equal(r.ok, true, JSON.stringify(r));
  return w;
}
const waiting = (r) => kind(r, "expertise-confirmation-owed");

test("R48: a declaration makes one OBLIGATION expertise-confirmation-owed for each administrator, keyed ...::<member>::<label> (the same for both), offering expertiseconfirm as its door; one confirmation clears both", () => {
  const w = declaration();
  const ada = waiting(w.read("ada", V("ada"))), bob = waiting(w.read("bob", V("bob")));
  assert.deepEqual(ada.map((i) => i.id), ["OBLIGATION::expertise-confirmation-owed::cy::tax law"]);
  assert.deepEqual(bob.map((i) => i.id), ["OBLIGATION::expertise-confirmation-owed::cy::tax law"], "an item for two administrators");
  const it = ada[0];
  assert.deepEqual([it.class, it.kind, it.recipients], ["OBLIGATION", "expertise-confirmation-owed", ["ada"]]);
  assert.deepEqual(it.subject, { kind: "member", id: "cy", label: "tax law" });
  assert.deepEqual(it.case.ancestors, [], "no project home");
  assert.equal(it.door, "expertiseconfirm");
  assert.deepEqual(it.options, [{ id: "expertiseconfirm", label: word("act.expertiseconfirm.label.queue"), weight: "single" }]);
  assert.ok(it.summary.includes("cy") && it.summary.includes("tax law"), `names the member and the label: ${it.summary}`);
  assert.ok(!/[{}]/.test(it.summary + it.detail), "no unfilled placeholder");
  assert.equal(it.age.state, "determined"); assert.equal(typeof it.age.ms, "number");
  /* one confirmation clears both */
  const c = w.membership.members.expertiseConfirm({ memberId: "cy", label: "tax law", by: "ada" });
  assert.equal(c.ok, true, JSON.stringify(c));
  assert.deepEqual(waiting(w.read("ada", V("ada"))), [], "a confirmed label has none");
  assert.deepEqual(waiting(w.read("bob", V("bob"))), [], "and none for the other administrator either");
});

test("R48 (control): a member who is not an administrator and a caller with no member see none; a label confirmed and then withdrawn has none", () => {
  const w = declaration();
  assert.deepEqual(waiting(w.read("cy", V("cy"))), [], "not an administrator");
  assert.deepEqual(waiting(w.read(null, "class:admin")), [], "no member");
  assert.equal(waiting(w.read("ada", V("ada"))).length, 1);
  assert.equal(w.membership.members.expertiseConfirm({ memberId: "cy", label: "tax law", by: "bob" }).ok, true);
  const x = w.membership.members.expertiseWithdraw({ memberId: "cy", label: "tax law", reason: "no longer", by: "ada" });
  assert.equal(x.ok, true, JSON.stringify(x));
  assert.deepEqual(waiting(w.read("ada", V("ada"))), [], "withdrawn: gone");
  assert.deepEqual(waiting(w.read("bob", V("bob"))), []);
});

test("R46, R47, R48, R45: the members feed fails on its own: a member-roster read that throws names `members`, and every other feed's items stand", () => {
  const w = busy();
  const base = w.read("alice");
  assert.ok(!base.facts.failed.some((f) => f.feed === "members"), "answering: not named");
  const boom = () => { throw new Error("the provider threw"); };
  const t = busy({ memberRoster: { endorsementsOwed: boom, expertiseAwaitingConfirmation: boom } });
  const r = t.read("alice");
  assert.deepEqual(r.facts.failed.filter((f) => f.feed === "members").map((f) => f.reason), ["threw"]);
  assert.deepEqual(r.items.map((i) => i.id).sort(), base.items.map((i) => i.id).sort(), "the other feeds' items are unchanged");
  assert.ok("members" in r.facts.ms, "R51: the feed that threw has its milliseconds too");
});

/* T51 fix round, B7 (K4245): each R46–R48 item names its member by handle as `fills.who`, the handle as the roster answers it;
   a member with no handle carries no `who`, and the item's id still names her. */
test("R46 (B7): the endorsement item carries the proposed member's handle as fills.who; a member with no handle carries none, and the id stays", () => {
  const w = proposal();
  w.run(`UPDATE members SET handle='nova' WHERE member_id='newbie'`);
  const named = owed(w.read("bob", V("bob")))[0];
  assert.deepEqual(named.fills, { who: "nova" }, "her handle");
  assert.equal(named.subject.id, "newbie", "the subject still names her id");
  const w2 = proposal();
  const bare = owed(w2.read("bob", V("bob")))[0];
  assert.deepEqual(bare.fills, {}, "no handle, no who");
  assert.equal(bare.id, "OBLIGATION::endorsement-owed::admin::newbie::bob", "the id stays");
  assert.equal(bare.subject.id, "newbie");
});

test("R47 (B7): the owner-vote item carries the target's handle as fills.who; a target with no handle carries none, and her id stays", () => {
  const w = parkside();
  vote(w, "add", "dee", "ann"); vote(w, "add", "dee", "bob");
  assert.deepEqual(owed(w.read("cal", V("cal")))[0].fills, { who: "dee" }, "dee's handle");
  const v = parkside();
  v.member("eve");
  vote(v, "add", "eve", "ann"); vote(v, "add", "eve", "bob");
  const bare = owed(v.read("cal", V("cal")))[0];
  assert.deepEqual(bare.fills, {}, "no handle, no who");
  assert.equal(bare.id, "OBLIGATION::endorsement-owed::owner::PRJ-1::add:eve::cal", "the id stays");
  assert.equal(bare.subject.target, "eve", "the target stays her id");
});

test("R48 (B7): the expertise item carries the declarer's handle as fills.who; a declarer with no handle carries none, and her id stays", () => {
  const w = declaration();
  assert.deepEqual(waiting(w.read("ada", V("ada")))[0].fills, { who: "cy" }, "cy's handle");
  const v = declaration();
  v.member("dan");
  assert.equal(v.membership.members.expertiseDeclare({ memberId: "dan", label: "tax law" }).ok, true);
  const bare = waiting(v.read("ada", V("ada"))).find((i) => i.subject.id === "dan");
  assert.deepEqual(bare.fills, {}, "no handle, no who");
  assert.equal(bare.id, "OBLIGATION::expertise-confirmation-owed::dan::tax law", "the id stays");
});
