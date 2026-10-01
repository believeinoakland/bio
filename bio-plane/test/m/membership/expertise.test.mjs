import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

test("R21 expertiseDeclare: the member's own act; refusals; labels normalised", async () => {
  const w = await world().group("ann", "bob");
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.equal(w.m.expertiseDeclare({ memberId: "nobody", label: "CPA" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.expertiseDeclare({ memberId: "bob", label: "CPA" }).reason, "NOT_ACTIVE");
  /* N285: the no-label refusal is its own code with its own row, never the shared NO_LABEL; nothing is written. */
  const row = { check: "C-96.13", where: "src/membership/index.mjs expertiseDeclare > is-expertise-labelled",
                translation: "An expertise is declared by a name a person can read, such as 'CPA', and this one has none. "
                  + "Nothing was written." };
  assert.deepEqual({ ...MEMBERSHIP_CHECKS.EXPERTISE_NO_LABEL }, row);
  for (const label of [undefined, null, "", "  \n ", "\t\t"]) {
    const r = w.m.expertiseDeclare({ memberId: "ann", label });
    assert.deepEqual(r, { ok: false, reason: "EXPERTISE_NO_LABEL", code: "EXPERTISE_NO_LABEL", check: row.check,
                          translation: row.translation, detail: "a declaration needs a label, such as 'CPA'" });
  }
  assert.equal(w.row(`SELECT count(*) AS n FROM member_expertise WHERE member_id='ann'`).n, 0);
  const d = w.m.expertiseDeclare({ memberId: "ann", label: "  Certified   Public\tAccountant " });
  assert.deepEqual([d.ok, d.label, d.state], [true, "Certified Public Accountant", "declared"]);
  assert.equal(w.m.expertiseDeclare({ memberId: "ann", label: "Certified Public Accountant" }).reason, "ALREADY_DECLARED");
  w.m.expertiseConfirm({ memberId: "ann", label: "Certified Public Accountant", by: "admin" });
  assert.equal(w.m.expertiseDeclare({ memberId: "ann", label: "Certified Public Accountant" }).reason, "ALREADY_DECLARED");
  assert.equal(w.m.expertiseDeclare({ memberId: "ann", label: "x".repeat(200) }).label.length, 120);
  assert.equal(w.row(`SELECT actor FROM member_expertise WHERE member_id='ann' ORDER BY seq LIMIT 1`).actor, "ann");
});

test("R22 expertiseConfirm: NOT_AN_ADMIN (R84), NO_SUCH_MEMBER, NOT_DECLARED, ALREADY_CONFIRMED, NOT_CONFIRMED; admin for admin", async () => {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "ann" }).reason, "NOT_AN_ADMIN");
  assert.equal(w.m.expertiseConfirm({ memberId: "nobody", label: "CPA", by: "admin" }).reason, "NO_SUCH_MEMBER");
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "Lawyer", by: "admin" }).reason, "NOT_DECLARED");
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin", withdraw: true }).reason, "NOT_CONFIRMED");
  const c = w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "second" });
  assert.deepEqual([c.ok, c.state, c.by], [true, "confirmed", "second"]);
  assert.equal(w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" }).reason, "ALREADY_CONFIRMED");
  w.m.expertiseDeclare({ memberId: "second", label: "Engineer" });
  assert.equal(w.m.expertiseConfirm({ memberId: "second", label: "Engineer", by: "admin" }).ok, true);
});

test("R23 every declaration, confirmation and withdrawal is a new entry, none overwritten", async () => {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "second", withdraw: true });
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  assert.deepEqual(w.rows(`SELECT event, actor FROM member_expertise ORDER BY seq`).map((r) => [r.event, r.actor]),
    [["declared", "ann"], ["confirmed", "admin"], ["withdrawn", "second"], ["declared", "ann"]]);
});

test("R24 expertiseList: per label the state, who and when, the full history; expertise gates nothing", async () => {
  const w = await world().group("ann");
  w.m.expertiseDeclare({ memberId: "ann", label: "CPA" });
  w.m.expertiseDeclare({ memberId: "ann", label: "Architect" });
  w.m.expertiseConfirm({ memberId: "ann", label: "CPA", by: "admin" });
  const l = w.m.expertiseList({ memberId: "ann" });
  assert.equal(l.gates, "nothing");
  assert.deepEqual(l.expertise.map((e) => [e.label, e.state, e.confirmed, e.by, e.history.map((h) => h.event)]),
    [["Architect", "declared", false, "ann", ["declared"]], ["CPA", "confirmed", true, "admin", ["declared", "confirmed"]]]);
  for (const e of l.expertise) assert.match(e.at, /^\d{4}-/);
  // gates nothing: capabilities and sight are the same with and without it
  const rightsBefore = w.m.sessionRights("member:ann");
  w.m.expertiseConfirm({ memberId: "ann", label: "Architect", by: "admin" });
  assert.deepEqual(w.m.sessionRights("member:ann"), rightsBefore);
});
