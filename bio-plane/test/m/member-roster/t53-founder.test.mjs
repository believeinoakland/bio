/* R84 to R91 (T53; K5562, K5563, K5568): the founder removes an administrator alone, every removal is read by the team,
   her endorsement alone issues an administrator invitation, a waiting proposal is cancelled, and the two new ops are
   declared. Everything is asked at the module's interface; no sentence is copied (a refusal is read by its code). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, threeAdmins, fiveAdmins, snapshot } from "./fixture.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { MEMBER_ROSTER_ROWS } from "../../../src/member-roster/checks.mjs";
const { MEMBERSHIP_CHECKS } = MEMBER_ROSTER_ROWS;

const votes = (w, kind, target) => w.rows(`SELECT voter, reason FROM admin_votes WHERE kind=? AND target=? ORDER BY voter`, kind, target);

test("R84 the founder removes the second of two alone, with a reason: revoked by her, a listener told once, alone: true", async () => {
  const w = await world().group();
  const r = w.m.adminRemove({ memberId: "second", by: "admin", reason: "  lost trust  " });
  assert.deepEqual([r.ok, r.removed, r.alone, r.by, r.reason, r.deciders, r.reasons],
    [true, true, true, "admin", "lost trust", ["admin"], ["lost trust"]]);
  assert.deepEqual([r.administrators, r.votesNeeded, r.eligibleVoters, r.possible], [2, 2, 1, false]);
  assert.equal(r.alsoDo, word("membership.also_do"));
  assert.deepEqual(w.row(`SELECT status, status_by FROM members WHERE member_id='second'`), { status: "revoked", status_by: "admin" });
  assert.deepEqual(w.creds.revoked.map(({ memberId, by }) => [memberId, by]), [["second", "admin"]], "told once");
  /* R85 (1): one row of its own kind, no `remove` row */
  assert.deepEqual(votes(w, "remove_founder", "second"), [{ voter: "admin", reason: "lost trust" }]);
  assert.deepEqual(votes(w, "remove", "second"), []);
});

test("R84 at four, with another's vote already on the target, her act carries; the vote stays recorded and uncounted", async () => {
  const w = await threeAdmins();
  assert.equal(w.m.adminRemove({ memberId: "third", by: "second", reason: "theirs" }).reason, "VOTES_SHORT");
  const r = w.m.adminRemove({ memberId: "third", by: "admin", reason: "hers" });
  assert.deepEqual([r.ok, r.alone, r.deciders, r.reasons], [true, true, ["admin"], ["hers"]]);
  assert.deepEqual(votes(w, "remove", "third"), [{ voter: "second", reason: "theirs" }], "stays in admin_votes");
  assert.deepEqual(w.m.adminRemovalsOpen({ by: "admin" }).removals, [], "a removal under way on the target is gone with it");
  assert.equal(w.creds.revoked.length, 1);
});

test("R84 controls: the order of her refusals, nothing written by a refusal, and a repeat refused", async () => {
  const w = await world().group("ann");
  const before = snapshot(w);
  assert.equal(w.m.adminRemove({ memberId: "admin", by: "admin", reason: "r" }).reason, "ROOT_OF_TRUST");
  assert.equal(w.m.adminRemove({ memberId: "nobody", by: "admin", reason: "r" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.adminRemove({ memberId: "ann", by: "admin", reason: "r" }).reason, "TARGET_NOT_AN_ADMIN");
  for (const reason of ["", "   ", undefined, null]) assert.equal(w.m.adminRemove({ memberId: "second", by: "admin", reason }).reason, "NO_REASON");
  assert.equal(snapshot(w), before, "nothing written by any of them");
  /* an unclaimed `admin` and a non-administrator are NOT_AN_ADMIN before any fact about the target */
  const unclaimed = world();
  assert.equal(unclaimed.m.adminRemove({ memberId: "nobody", by: "admin", reason: "r" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.adminRemove({ memberId: "nobody", by: "ann", reason: "r" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.adminRemove({ memberId: "second", by: `${MACHINE_CLASS_PREFIX}admin`, reason: "r" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.adminRemove({ memberId: "second", by: "admin", reason: "r" }).ok, true);
  const again = snapshot(w);
  assert.equal(w.m.adminRemove({ memberId: "second", by: "admin", reason: "r" }).reason, "TARGET_NOT_AN_ADMIN");
  assert.equal(snapshot(w), again, "a repeat writes nothing");
});

test("R86 everyone else's removal is unchanged: five administrators carry one by three votes; a non-founder at two cannot remove her; no remove_founder row", async () => {
  const w = await fiveAdmins();
  for (const [by, short] of [["second", true], ["third", true], ["fourth", false]]) {
    const r = w.m.adminRemove({ memberId: "fifth", by, reason: `by ${by}` });
    assert.equal(r.reason === "VOTES_SHORT", short, by);
  }
  assert.equal(w.row(`SELECT status FROM members WHERE member_id='fifth'`).status, "revoked");
  assert.deepEqual(votes(w, "remove_founder", "fifth"), [], "a non-founder's removal writes no remove_founder row");
  assert.equal(w.m.adminRemove({ memberId: "admin", by: "second", reason: "r" }).reason, "ROOT_OF_TRUST");
  const two = await world().group();
  assert.equal(two.m.adminRemove({ memberId: "admin", by: "second", reason: "r" }).reason, "ROOT_OF_TRUST");
  assert.equal(two.m.adminRemove({ memberId: "second", by: "second", reason: "r" }).reason, "TARGET_CANNOT_VOTE");
});

test("R85 adminRemovals: a founder's removal and a removal by vote are read by an ordinary member, newest first, with who and why", async () => {
  const w = await fiveAdmins("ann");
  for (const [by, id] of [["second", "fifth"], ["third", "fifth"], ["fourth", "fifth"]]) w.m.adminRemove({ memberId: id, by, reason: `${by} says so` });
  const handleOf = (id) => w.row(`SELECT handle FROM members WHERE member_id=?`, id).handle;
  await new Promise((done) => setTimeout(done, 3));
  assert.equal(w.m.adminRemove({ memberId: "fourth", by: "admin", reason: "hers" }).alone, true);
  const r = w.m.adminRemovals({ by: "ann" });
  assert.deepEqual([r.ok, r.limit, r.truncated, r.removals.length], [true, 200, false, 2]);
  const [first, second] = r.removals;
  assert.deepEqual(Object.keys(first).sort(), ["at", "deciders", "handle", "how", "reasons", "target"]);
  assert.deepEqual([first.target, first.handle, first.how, first.deciders, first.reasons], ["fourth", handleOf("fourth"), "founder", ["admin"], ["hers"]]);
  assert.match(first.at, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual([second.target, second.how], ["fifth", "vote"]);
  assert.deepEqual(second.deciders, ["fourth", "second", "third"], "R5's order: by voter");
  assert.deepEqual(second.reasons, ["fourth says so", "second says so", "third says so"]);
  assert.ok(first.at >= second.at, "newest first");
  /* the founder reads it too; a limit lowers the page and truncated says so */
  assert.deepEqual(w.m.adminRemovals({ by: "admin" }).removals, r.removals);
  const one = w.m.adminRemovals({ by: "admin", limit: 1 });
  assert.deepEqual([one.removals.length, one.limit, one.truncated], [1, 1, true]);
  /* the op, by the stamp */
  assert.deepEqual(w.ops("by=ann").adminremovals(), r);
});

test("R85 controls: a removal under way, a resignation, a callers who may not read, and a failed read are not listed or answered", async () => {
  const w = await threeAdmins("ann");
  w.m.adminRemove({ memberId: "third", by: "second", reason: "r" });
  await w.m.adminResign({ by: "third" });
  assert.deepEqual(w.m.adminRemovals({ by: "ann" }).removals, [], "under way and a resignation are not removals");
  assert.equal(JSON.stringify(w.m.adminRemovalsOpen({ by: "admin" })).includes("reason"), false, "adminRemovalsOpen carries no reason");
  w.m.adminRemove({ memberId: "second", by: "admin", reason: "gone" });
  const secret = JSON.stringify(w.m.adminRemovals({ by: "ann" }).removals);
  for (const by of [null, undefined, "", "nobody", `${MACHINE_CLASS_PREFIX}admin`, "second", 7, {}])
    assert.deepEqual(w.m.adminRemovals({ by }), { ok: true, removals: [] }, `${String(by)}: a removed administrator, an absent or a machine caller`);
  assert.deepEqual(w.m.adminRemovals(), { ok: true, removals: [] });
  assert.ok(secret.includes("gone"));
  const before = snapshot(w);
  w.m.adminRemovals({ by: "ann" });
  assert.equal(snapshot(w), before, "writes nothing");
  w.sql.exec(`DROP TABLE admin_votes`);
  assert.deepEqual(w.m.adminRemovals({ by: "ann" }), { ok: true, removals: [] }, "never throws");
});

test("R87 the founder's endorsement alone issues the invitation; her memberAdd of an administrator is invited at once; others' proposals still wait for every administrator (R88)", async () => {
  const w = await threeAdmins();
  /* A proposes C: the others wait (R88) */
  const p = await w.m.memberAdd({ memberId: "cee", cover: "c", role: "admin", by: "second" });
  assert.deepEqual([p.reason, p.have, p.awaiting], ["CONSENSUS_REQUIRED", ["second"], ["admin", "third"]]);
  const t = await w.m.adminEndorse({ memberId: "cee", by: "third" });
  assert.deepEqual([t.reason, t.have, t.awaiting], ["CONSENSUS_REQUIRED", ["second", "third"], ["admin"]], "still waiting for the founder");
  const e = await w.m.adminEndorse({ memberId: "cee", by: "admin" });
  assert.deepEqual([e.ok, e.issuedBy, e.endorsedBy], [true, "founder", ["admin", "second", "third"]]);
  assert.match(e.invite, /^[0-9a-f]{32}$/);
  assert.deepEqual(w.row(`SELECT status, status_by FROM members WHERE member_id='cee'`), { status: "invited", status_by: "admin" });
  assert.equal((await w.m.adminEndorse({ memberId: "cee", by: "admin" })).reason, "NOT_PROPOSED", "returned once");
  /* the founder alone, before the others have endorsed: endorsements already given stay recorded */
  await w.m.memberAdd({ memberId: "dee", cover: "c", role: "admin", by: "second" });
  const d = await w.m.adminEndorse({ memberId: "dee", by: "admin" });
  assert.deepEqual([d.ok, d.issuedBy, d.endorsedBy], [true, "founder", ["admin", "second"]]);
  assert.deepEqual(votes(w, "add", "dee").map((v) => v.voter), ["admin", "second"]);
  /* her own memberAdd of an administrator, with two or more administrators, is invited at once */
  const own = await w.m.memberAdd({ memberId: "eve", cover: "c", role: "admin", expiresInDays: 3, by: "admin" });
  assert.deepEqual([own.ok, own.role, own.invited_by], [true, "admin", "admin"]);
  assert.match(own.invite, /^[0-9a-f]{32}$/);
  assert.equal(w.row(`SELECT status FROM members WHERE member_id='eve'`).status, "invited");
  /* controls */
  assert.equal((await w.m.memberAdd({ memberId: "eve", cover: "c", role: "admin", by: "admin" })).reason, "EXISTS");
  const two = await world().group();
  const solo = await two.m.memberAdd({ memberId: "fay", cover: "c", role: "admin", by: "admin" });
  assert.equal(solo.ok, true, "at two the founder's memberAdd returns an invitation, not CONSENSUS_REQUIRED");
});

test("R89 a waiting proposal is cancelled by its proposer or the founder, never deleted; refusals in order", async () => {
  const w = await threeAdmins("ann");
  const heard = [];
  w.m.onRevoked("capture-sources", (n) => heard.push(n));
  await w.m.memberAdd({ memberId: "cee", cover: "c", role: "admin", by: "second" });
  const before = snapshot(w);
  /* order: NOT_AN_ADMIN, NO_SUCH_MEMBER, NO_WAITING_PROPOSAL, NOT_YOUR_PROPOSAL */
  for (const by of ["ann", null, "nobody", `${MACHINE_CLASS_PREFIX}admin`])
    for (const memberId of ["cee", "nobody", "ann"])
      assert.equal(w.m.adminProposalCancel({ memberId, by }).reason, "NOT_AN_ADMIN", `${by} → ${memberId}`);
  assert.equal(w.m.adminProposalCancel({ memberId: "nobody", by: "second" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.adminProposalCancel({ memberId: "ann", by: "second" }).reason, "NO_WAITING_PROPOSAL");
  assert.equal(w.m.adminProposalCancel({ memberId: "cee", by: "third" }).reason, "NOT_YOUR_PROPOSAL");
  assert.equal(snapshot(w), before, "a refusal writes nothing");
  const refused = w.m.adminProposalCancel({ memberId: "cee", by: "third" });
  assert.deepEqual([refused.code, refused.check], ["NOT_YOUR_PROPOSAL", "C-96.57"]);
  assert.equal(refused.translation, MEMBERSHIP_CHECKS.NOT_YOUR_PROPOSAL.translation);
  /* the proposer cancels */
  const r = w.m.adminProposalCancel({ memberId: "cee", by: "second" });
  assert.deepEqual([r.ok, r.memberId, r.status, r.proposal, r.by, r.endorsedBy], [true, "cee", "revoked", "cancelled", "second", ["second"]]);
  assert.match(r.at, /^\d{4}-\d\d-\d\dT/);
  assert.deepEqual(w.row(`SELECT status, status_by FROM members WHERE member_id='cee'`), { status: "revoked", status_by: "second" });
  assert.deepEqual(votes(w, "add", "cee").map((v) => v.voter), ["second"], "the endorsement stays");
  assert.deepEqual(heard.map((n) => [n.memberId, n.by]), [["cee", "second"]], "a listener told once");
  const roster = w.m.memberList({ administer: true }).members.find((m) => m.member_id === "cee");
  assert.deepEqual([roster.status, roster.invitation], ["revoked", "withdrawn"]);
  assert.deepEqual(w.m.endorsementsOwed({ by: "admin" }), [], "R77 no longer lists it");
  /* a repeat; the id stays taken */
  const once = snapshot(w);
  const again = w.m.adminProposalCancel({ memberId: "cee", by: "second" });
  assert.deepEqual([again.reason, again.code, again.check], ["NO_WAITING_PROPOSAL", "NO_WAITING_PROPOSAL", "C-96.56"]);
  assert.equal(again.translation, MEMBERSHIP_CHECKS.NO_WAITING_PROPOSAL.translation);
  assert.equal(snapshot(w), once);
  assert.equal((await w.m.memberAdd({ memberId: "cee", cover: "c", role: "admin", by: "second" })).reason, "EXISTS");
  /* the founder cancels another's; an issued invitation is not a proposal */
  await w.m.memberAdd({ memberId: "dee", cover: "c", role: "admin", by: "third" });
  assert.equal(w.m.adminProposalCancel({ memberId: "dee", by: "admin" }).ok, true);
  assert.equal(w.row(`SELECT status_by FROM members WHERE member_id='dee'`).status_by, "admin");
  const issued = await w.m.memberAdd({ memberId: "eve", cover: "c", by: "admin" });
  assert.equal(issued.ok, true);
  assert.equal(w.m.adminProposalCancel({ memberId: "eve", by: "admin" }).reason, "NO_WAITING_PROPOSAL");
});

test("R90 the founder is owed every waiting proposal, one she proposed under the old rule included; another's own proposal stays out of her list", async () => {
  const w = await threeAdmins();
  await w.m.memberAdd({ memberId: "cee", cover: "c", role: "admin", by: "second" });
  /* a proposal the founder made before R87: proposed, her own endorsement not recorded, `invited_by` her */
  w.sql.exec(`INSERT INTO members (member_id,cover,role,status,created,updated,invited_by) VALUES ('old','c','admin','proposed','2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z','admin')`);
  assert.deepEqual(w.m.endorsementsOwed({ by: "admin" }).map((r) => r.memberId), ["old", "cee"]);
  assert.deepEqual(w.m.endorsementsOwed({ by: "second" }).map((r) => r.memberId), ["old"], "control: second's own is not listed for second");
  const e = await w.m.adminEndorse({ memberId: "old", by: "admin" });
  assert.deepEqual([e.ok, e.issuedBy], [true, "founder"]);
  assert.deepEqual(w.m.endorsementsOwed({ by: "admin" }).map((r) => r.memberId), ["cee"]);
});

test("R91 the two new ops are declared by this module and delegated by the door", async () => {
  const { DECLARED_OPS } = await import("../../../src/member-roster/index.mjs");
  const c = DECLARED_OPS.adminproposalcancel, r = DECLARED_OPS.adminremovals;
  assert.deepEqual([c.classes, c.mutating, c.weight, c.stamps, c.fields],
    [["admin", "member", "probe"], true, "credential", ["viewer", "by"], { accepts: ["memberId"], requires: ["memberId"] }]);
  assert.deepEqual([r.classes, r.machineClasses, r.mutating, r.stamps, r.fields],
    [["admin", "member", "probe"], [], false, ["by"], { accepts: ["limit"], requires: [] }]);
  assert.equal(DECLARED_OPS.adminremove.weight, "reasoned");
  const w = await threeAdmins();
  await w.m.memberAdd({ memberId: "cee", cover: "c", role: "admin", by: "second" });
  const cancelled = await w.ops("by=second", { memberId: "cee" }).adminproposalcancel();
  assert.deepEqual([cancelled.ok, cancelled.proposal], [true, "cancelled"]);
  assert.deepEqual(await w.ops("by=ann").adminremovals(), { ok: true, removals: [] });
});
