/* T14 (N327, N329, N335; N128's rows are asserted with R81 in `t9-notice-sight-bounds.test.mjs`): R84's `remedy` and
   `message` (DEC-83) at R22 and R75 (R41's went to `project-roster`, its R5, T38; R62's to `credentials` with its R13, T19);
   R86 `activeAdmins` in its stated order; R87 `notAParticipant` and R35 through it; the rows of R36 and R6 (R39's went
   to `project-roster`, its R3, T38). At the interface only. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { word } from "../../../src/setup-words/index.mjs";
import { world, V } from "./fixture.mjs";
import { notAnAdmin, notAParticipant, MEMBERSHIP_CHECKS } from "../../../src/membership/index.mjs";

const ADMIN = MEMBERSHIP_CHECKS.NOT_AN_ADMIN;
/* Every table, read whole, to show an answer wrote nothing. */
const snapshot = (w) => JSON.stringify(w.rows(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)
  .map(({ name }) => [name, w.rows(`SELECT * FROM "${name}"`)]));

test("R87 notAParticipant: {ok, reason, code, check, translation, project, detail}, row C-56.3, one fixed sentence; extra beside and never replacing; writes nothing, never throws", async () => {
  const row = MEMBERSHIP_CHECKS.NOT_A_PARTICIPANT;
  assert.deepEqual({ ...row }, { check: "C-56.3", where: "src/membership/index.mjs notAParticipant > is-not-a-participant",
                                 translation: row.translation });
  assert.ok(Object.isFrozen(row) && row.translation.length > 40);
  const r = notAParticipant("PROJ-P", "ann");
  assert.deepEqual(r, { ok: false, reason: "NOT_A_PARTICIPANT", code: "NOT_A_PARTICIPANT", check: "C-56.3",
                        translation: row.translation, project: "PROJ-P", detail: r.detail });
  assert.equal(r.detail, word("membership.index.not_a_participant_detail"));
  /* One sentence for every caller and every project; the id as asked, null when none. */
  assert.equal(notAParticipant("PROJ-Q", "bob").detail, r.detail);
  for (const id of [null, undefined]) assert.equal(notAParticipant(id, "ann").project, null);
  const e = notAParticipant("PROJ-P", "ann", { handle: "ann", ok: true, reason: "X", code: "X", check: "C-0",
                                                translation: "forged", project: "other", detail: "mine" });
  assert.deepEqual(e, { ...r, handle: "ann" });
  const hostile = {};
  Object.defineProperty(hostile, "boom", { enumerable: true, get() { throw new Error("no"); } });
  for (const extra of [null, 7, "s", [1], hostile]) assert.deepEqual(notAParticipant("PROJ-P", "ann", extra), r);
  for (const [p, by] of [[{}, []], [42, 7], [["a"], {}]]) assert.doesNotThrow(() => notAParticipant(p, by));
  const w = await world().group("ann");
  const before = snapshot(w);
  notAParticipant("PROJ-P", "ann", { a: 1 });
  assert.equal(snapshot(w), before, "writes nothing");
});

test("R87 R35: projectLeave by a caller holding no participation answers notAParticipant byte for byte, and writes nothing", async () => {
  const w = await world().group("ann", "bob", "cal");
  w.project("PROJ-P");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  for (const [by, viewer] of [["bob", V("bob")], ["cal", null], ["ghost", V("ghost")]]) {
    const before = snapshot(w);
    assert.deepEqual(w.m.projectLeave({ projectId: "PROJ-P", by, viewer }), notAParticipant("PROJ-P", by), by);
    assert.equal(snapshot(w), before, `${by}: nothing written`);
  }
  /* D54 (T41-3): an administrator not in hidden P is at its EXISTENCE and answered there (C-70.1); once P is
     discoverable it sees P whole, holds no participation, and is answered through notAParticipant */
  assert.equal(w.m.projectLeave({ projectId: "PROJ-P", by: "second", viewer: V("second") }).code, "PROJECT_SEEN_NOT_A_PARTICIPANT");
  w.m.projectVisibilitySet({ projectId: "PROJ-P", setting: "discoverable", by: "ann", viewer: V("ann") });
  const before = snapshot(w);
  assert.deepEqual(w.m.projectLeave({ projectId: "PROJ-P", by: "second", viewer: V("second") }), notAParticipant("PROJ-P", "second"));
  assert.equal(snapshot(w), before, "second: nothing written");
  /* An absent project and a hidden one answer alike (R61). */
  const absent = w.m.projectLeave({ projectId: "PROJ-NEVER", by: "bob", viewer: V("bob") });
  assert.deepEqual(absent, notAParticipant("PROJ-NEVER", "bob"));
});

test("R36: TARGET_NOT_A_PARTICIPANT (C-56.4) carries its row at its one site (C-56.5 went with R39 to project-roster)", async () => {
  const where = (fn, region) => `src/membership/index.mjs ${fn} > ${region}`;
  const rows = {
    TARGET_NOT_A_PARTICIPANT: ["C-56.4", where("projectRemove", "is-remove-target-participant")],
  };
  for (const [code, [check, w]] of Object.entries(rows)) {
    const row = MEMBERSHIP_CHECKS[code];
    assert.deepEqual([row.check, row.where], [check, w], code);
    assert.ok(Object.isFrozen(row) && typeof row.translation === "string" && row.translation.length > 40, code);
  }
  const carries = (r, code, label) => {
    const row = MEMBERSHIP_CHECKS[code];
    assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation], [false, code, code, row.check, row.translation], label);
    assert.match(r.detail, /\S/, label);
  };
  const w = await world().group("ann", "bob", "cal", "dee", "eve");
  w.project("PROJ-P");
  w.m.projectClaimOwner({ projectId: "PROJ-P", memberId: "ann" });
  w.m.projectInvite({ projectId: "PROJ-P", handle: "bob", by: "ann", viewer: V("ann") });           // invited
  w.m.projectInvite({ projectId: "PROJ-P", handle: "cal", by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-P", by: "cal", viewer: V("cal") });
  w.m.projectInvite({ projectId: "PROJ-P", handle: "dee", by: "ann", viewer: V("ann") });
  w.m.projectJoin({ projectId: "PROJ-P", by: "dee", viewer: V("dee") });
  w.m.projectLeave({ projectId: "PROJ-P", by: "dee", viewer: V("dee") });                              // leaving
  /* R36: the named member holds no participation. */
  const before = snapshot(w);
  const rm = w.m.projectRemove({ projectId: "PROJ-P", handle: "eve", by: "ann", viewer: V("ann") });
  carries(rm, "TARGET_NOT_A_PARTICIPANT", "R36");
  assert.equal(rm.handle, "eve");
  assert.equal(snapshot(w), before, "nothing written by a refusal");
});
