/* R79 (T51; DEC-386, DEC-376; K4204): withdrawing a confirmed expertise is its own act, through the ops map as the door calls it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { world, sqlOver, snapshot } from "./fixture.mjs";
import { membersOf } from "../../../src/member-roster/index.mjs";

const withdraw = (w, by, body) => w.ops(`by=${by}`, body).expertisewithdraw();
async function confirmed() {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" });
  return w;
}

test("R79 confirm by one administrator, withdraw by another with a reason: the list reads withdrawn and the history keeps both", async () => {
  const w = await confirmed();
  const r = await withdraw(w, "second", { memberId: "ann", label: "CPA", reason: "the licence lapsed" });
  assert.deepEqual(r, { ok: true, memberId: "ann", label: "CPA", state: "withdrawn", confirmed: false, by: "second", reason: "the licence lapsed" });
  const [e] = w.m.expertiseList({ memberId: "ann" }).expertise;
  assert.deepEqual([e.label, e.state, e.confirmed, e.by], ["CPA", "withdrawn", false, "second"]);
  assert.deepEqual(e.history.map((h) => [h.event, h.actor, h.reason]),
    [["declared", "ann", undefined], ["confirmed", "admin", undefined], ["withdrawn", "second", "the licence lapsed"]]);
  assert.equal(Object.hasOwn(e.history[0], "reason"), false, "only a withdrawal carries a reason");
  /* the declaration is taken back with the confirmation: neither held nor awaiting */
  assert.deepEqual(w.m.expertiseHolders("CPA"), []);
  assert.deepEqual(w.m.expertiseAwaitingConfirmation({ by: "admin" }), []);
  /* the member may declare it again */
  assert.equal(w.m.expertiseDeclare({ memberId: "ann", label: "CPA" }).ok, true);
  assert.deepEqual(w.m.expertiseHolders("CPA").map((h) => h.state), ["declared"]);
  assert.equal(w.row(`SELECT count(*) AS n FROM member_expertise WHERE member_id='ann'`).n, 4, "nothing was overwritten (R19)");
});

test("R79 refusals in order, each writing nothing: NOT_AN_ADMIN, NO_SUCH_MEMBER, NO_REASON, NOT_DECLARED, NOT_CONFIRMED", async () => {
  const w = await confirmed();
  w.m.expertiseDeclare({ memberId: "ann", label: "Lawyer" });
  const before = snapshot(w);
  const ask = (by, body) => withdraw(w, by, body);
  assert.equal((await ask("ann", { memberId: "ann", label: "CPA", reason: "x" })).reason, "NOT_AN_ADMIN");
  assert.equal((await ask("", { memberId: "ann", label: "CPA", reason: "x" })).reason, "NOT_AN_ADMIN", "no stamp");
  assert.equal((await ask("second", { memberId: "nobody", label: "CPA", reason: "x" })).reason, "NO_SUCH_MEMBER");
  for (const reason of [undefined, null, "", "  \n "]) assert.equal((await ask("second", { memberId: "ann", label: "CPA", reason })).reason, "NO_REASON");
  assert.equal((await ask("second", { memberId: "ann", label: "Architect", reason: "x" })).reason, "NOT_DECLARED");
  assert.equal((await ask("second", { memberId: "ann", label: "Lawyer", reason: "x" })).reason, "NOT_CONFIRMED", "declared and not confirmed");
  assert.equal(snapshot(w), before);
  /* the order: an unknown member with no reason is NO_SUCH_MEMBER, a non-administrator never learns of a member */
  assert.equal((await ask("ann", { memberId: "nobody" })).reason, "NOT_AN_ADMIN");
  assert.equal((await ask("second", { memberId: "nobody" })).reason, "NO_SUCH_MEMBER");
  /* a second withdrawal is NOT_CONFIRMED (control) */
  assert.equal((await ask("second", { memberId: "ann", label: "CPA", reason: "lapsed" })).ok, true);
  const again = await ask("admin", { memberId: "ann", label: "CPA", reason: "lapsed again" });
  assert.deepEqual([again.ok, again.reason, again.state], [false, "NOT_CONFIRMED", "withdrawn"]);
});

test("R79 a body's own by never wins: the stamp is the query's", async () => {
  const w = await confirmed();
  const r = await w.ops("by=ann", { memberId: "ann", label: "CPA", reason: "x", by: "admin" }).expertisewithdraw();
  assert.equal(r.reason, "NOT_AN_ADMIN");
  assert.equal(w.m.expertiseList({ memberId: "ann" }).expertise[0].state, "confirmed");
});

test("R79 the founder's confirmed expertise is withdrawn like a member's (R76)", async () => {
  const w = await world().group();
  w.m.expertiseDeclare({ memberId: "admin", label: "Civil Engineer" });
  w.m.expertiseConfirm({ memberId: "admin", label: "Civil Engineer", by: "second" });
  assert.equal((await withdraw(w, "second", { memberId: "admin", label: "Civil Engineer", reason: "retired" })).state, "withdrawn");
  assert.deepEqual(w.m.expertiseHolders("Civil Engineer"), []);
});

test("R79 control: expertiseConfirm with withdraw: true still withdraws as before, without a reason, and the confirmation is the same act", async () => {
  const w = await confirmed();
  const r = await w.ops("", { memberId: "ann", label: "CPA", by: "second", withdraw: true }).expertiseconfirm();
  assert.deepEqual(r, { ok: true, memberId: "ann", label: "CPA", state: "withdrawn", confirmed: false, by: "second" });
  assert.equal(w.row(`SELECT reason FROM member_expertise WHERE event='withdrawn'`).reason, null);
});

test("R79 a withdrawn label is NOT_DECLARED to a confirmation until the member declares it again; withdrawing it again is NOT_CONFIRMED", async () => {
  const w = await confirmed();
  await withdraw(w, "second", { memberId: "ann", label: "CPA", reason: "lapsed" });
  const before = snapshot(w);
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" }).reason, "NOT_DECLARED", "the declaration was taken back");
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin", withdraw: true }).reason, "NOT_CONFIRMED");
  assert.equal(snapshot(w), before);
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" }).state, "confirmed", "control: declared again, it is confirmed");
});

test("R79 a store written before the reason column existed gains it at boot", async () => {
  const db = new DatabaseSync(":memory:");
  const sql = sqlOver(db);
  sql.exec(`CREATE TABLE member_expertise (seq INTEGER PRIMARY KEY AUTOINCREMENT, member_id TEXT NOT NULL, label TEXT NOT NULL, event TEXT NOT NULL, actor TEXT NOT NULL, created TEXT NOT NULL)`);
  sql.exec(`INSERT INTO member_expertise (member_id,label,event,actor,created) VALUES ('ann','CPA','declared','ann','2026-01-01T00:00:00.000Z')`);
  const m = membersOf({ storage: { sql } });
  m.migrate();
  assert.ok(sql.exec(`PRAGMA table_info(member_expertise)`).some((c) => c.name === "reason"));
  assert.equal(m.expertiseList({ memberId: "ann" }).expertise[0].state, "declared", "the earlier entry reads as before");
});
