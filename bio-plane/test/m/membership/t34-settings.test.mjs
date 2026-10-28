/* T34 (T34-10; DEC-132, DEC-135, DEC-136, Bob's; K1745): addressing a check request (R106), the court-notice setting
   and the joining statement (R107, R108), and the group's own description (R109, R110). At the interface only. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { word } from "../../../src/setup-words/index.mjs";
import { world, V } from "./fixture.mjs";
import { Membership, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";
import { MACHINE_CLASS_PREFIX } from "../../../src/record-grammar/index.mjs";

const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));
const rowOf = (r, code) => {
  const row = MEMBERSHIP_CHECKS[code];
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], code);
  assert.equal(typeof r.detail, "string");   /* the refusal carries its sentence; it is read by key where a test names the act */
};
/* R108 as R151 states it (T50): the statement is the words of `court.statement`, read by key, never held here. */
const COURT = word("court.statement");

/* ---- R106 ---- */

/* ann (CPA confirmed), bob (CPA declared), cal (CPA declared, then revoked), dee (CPA withdrawn), eve (no CPA), fay (CPA
   declared, invited to H). H a hidden project owned by ann; INFO-1 shared evidence; ESC-1 inside H. */
async function checkWorld() {
  const w = await world().group("ann", "bob", "cal", "dee", "eve", "fay");
  for (const id of ["ann", "bob", "cal", "dee", "fay"]) w.m.expertiseDeclare({ memberId: id, label: "CPA" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" });
  w.m.expertiseConfirm({ memberId: "dee", label: "CPA", by: "admin" });
  w.m.expertiseConfirm({ memberId: "dee", label: "CPA", by: "admin", withdraw: true });
  w.m.expertiseDeclare({ memberId: "eve", label: "Engineer" });
  w.m.memberSet({ memberId: "cal", status: "revoked", by: "admin" });
  w.bundle("INFO-1");
  w.project("PROJ-H", "Hidden H");
  w.m.projectClaimOwner({ projectId: "PROJ-H", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-H", handle: "fay", by: "ann", viewer: V("ann") });
  w.bundle("ESC-1", "escalation", "an escalation", "PROJ-H");
  return w;
}

test("R106 checkAddressees: every active member whose current state for the label is declared or confirmed and who can see the target, in member-id order", async () => {
  const w = await checkWorld();
  assert.deepEqual(w.m.checkAddressees({ target: "INFO-1", label: "CPA" }), [
    { memberId: "ann", handle: "ann", state: "confirmed" },
    { memberId: "bob", handle: "bob", state: "declared" },
    { memberId: "fay", handle: "fay", state: "declared" }]);
  /* sight: only those R80 admits to the target reach it */
  for (const target of ["ESC-1", "PROJ-H"])
    assert.deepEqual(w.m.checkAddressees({ target, label: "CPA" }).map((a) => a.memberId), ["ann", "fay"], target);
  /* the label normalised as R21 normalises it */
  assert.deepEqual(w.m.checkAddressees({ target: "INFO-1", label: "  CPA \t" }), w.m.checkAddressees({ target: "INFO-1", label: "CPA" }));
  assert.deepEqual(w.m.checkAddressees({ target: "INFO-1", label: "cpa" }), [], "a label is matched as written");
  assert.deepEqual(w.m.checkAddressees({ target: "INFO-1", label: "Engineer" }), [{ memberId: "eve", handle: "eve", state: "declared" }]);
  /* agreement with R24 and R80, for every member, so the rule is the composition and nothing else */
  for (const target of ["INFO-1", "ESC-1", "PROJ-H"]) {
    const want = [];
    for (const m of w.m.memberList({}).members.filter((x) => x.status === "active")) {
      const e = w.m.expertiseList({ memberId: m.member_id }).expertise.find((x) => x.label === "CPA");
      if (e && (e.state === "declared" || e.state === "confirmed") && w.m.inSight(target, V(m.member_id)))
        want.push({ memberId: m.member_id, handle: m.handle, state: e.state });
    }
    assert.deepEqual(w.m.checkAddressees({ target, label: "CPA" }), want, target);
  }
  /* a target not held, or one nobody can see */
  assert.deepEqual(w.m.checkAddressees({ target: "NOPE-1", label: "CPA" }), []);
  w.project("PROJ-M", "nobody's");
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.deepEqual(w.m.checkAddressees({ target: "PROJ-M", label: "CPA" }), []);
  /* the op */
  assert.deepEqual(w.ops("target=INFO-1&label=CPA").checkaddressees().map((a) => a.memberId), ["ann", "bob", "fay"]);
});

test("R106 an empty label is EXPERTISE_NO_LABEL; it writes nothing, grants nothing and never throws", async () => {
  const w = await checkWorld();
  const row = MEMBERSHIP_CHECKS.EXPERTISE_NO_LABEL;
  for (const label of [undefined, null, "", "   "]) {
    const r = w.m.checkAddressees({ target: "INFO-1", label });
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, "EXPERTISE_NO_LABEL", "EXPERTISE_NO_LABEL",
      row.check, row.translation]);
  }
  const before = snapshot(w);
  const rights = w.m.sessionRights("member:bob");
  const sees = w.m.inSight("PROJ-H", V("bob"));
  for (const target of [null, undefined, "", 7, {}, [], "INFO-1", "PROJ-H"])
    for (const label of ["CPA", 7, {}, [], null])
      assert.doesNotThrow(() => w.m.checkAddressees({ target, label }));
  assert.doesNotThrow(() => w.m.checkAddressees());
  assert.deepEqual(w.m.checkAddressees({ target: 7, label: "CPA" }), []);
  assert.equal(snapshot(w), before, "writes nothing");
  assert.deepEqual(w.m.sessionRights("member:bob"), rights, "grants no act");
  assert.equal(w.m.inSight("PROJ-H", V("bob")), sees, "grants no sight");
  const broken = new Membership({ sql: { exec() { throw new Error("disk"); } } });
  assert.deepEqual(broken.checkAddressees({ target: "INFO-1", label: "CPA" }), []);
});

/* ---- R107, R108 ---- */

/* ---- R109, R110 ---- */
