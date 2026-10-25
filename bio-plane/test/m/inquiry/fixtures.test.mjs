/* inquiry's published fixtures (fixtures.mjs): each is called here and its real answer checked (K4990). */
import test from "node:test";
import assert from "node:assert/strict";
import { basisForUnread, basisRefusals, disposeAct, migratedSurfacing, readRefusals } from "./fixtures.mjs";
import { word } from "../../../src/setup-words/index.mjs";

test("R16: basisForUnread answers the real basis read for no question (NO_ID) and for one the record does not hold (resting on nothing)", () => {
  const f = basisForUnread();
  assert.deepEqual([f.noId.ok, f.noId.reason], [false, "NO_ID"]);
  assert.deepEqual([f.unheld.ok, f.unheld.legs], [true, []]);
  assert.equal(f.unheld.bundleId, f.unheldId);
  assert.deepEqual(f.inquiry.basisFor(""), f.noId, "the fixture's inquiry is the real one: it answers again as it did");
});

test("R11 R62: basisRefusals answers each refusal of a real promote of a bad basis, with its check, and nothing written", () => {
  const f = basisRefusals();
  assert.deepEqual([f.basisRefused.ok, f.basisRefused.reason], [false, "BASIS_REFUSED"]);
  assert.ok(f.basisRefused.findings.length >= 1 && f.basisRefused.findings.every((x) => x.check && x.detail));
  assert.deepEqual([f.selfBasis.reason, f.selfBasis.check, f.selfBasis.path], ["SELF_BASIS", "C-33.22", [f.question, f.question]]);
  assert.ok(f.selfBasis.translation);
  assert.deepEqual([f.basisCycle.reason, f.basisCycle.check], ["BASIS_CYCLE", "C-33.23"]);
  assert.equal(f.basisCycle.path[0], f.cycleQuestion);
  assert.equal(f.basisCycle.path.at(-1), f.cycleQuestion, "the path closes on the question being written");
  assert.ok(f.basisCycle.path.length >= 3);
  assert.deepEqual([f.machinePassageUnchecked.ok, f.machinePassageUnchecked.reason, f.machinePassageUnchecked.code, f.machinePassageUnchecked.check],
    [false, "MACHINE_PASSAGE_UNCHECKED", "MACHINE_PASSAGE_UNCHECKED", "C-2.20"]);
  assert.ok(f.machinePassageUnchecked.translation && f.machinePassageUnchecked.detail);
  assert.equal(f.world.record.head(f.question), null, "the refused writes left nothing");
  assert.equal(f.machineWorld.record.head(f.question), null);
});

test("R20 R21 R22: disposeAct answers the real dispose over a real selection: done, an unknown selection, another owner's", () => {
  const f = disposeAct();
  assert.deepEqual([f.done.ok, f.done.to, f.done.reason, f.done.handle, f.done.disposed], [true, "deferred", "later", "pair", f.ids]);
  assert.deepEqual(f.unknownSelection.reason, "NO_SUCH_SELECTION");
  assert.deepEqual(f.notYours.reason, "NOT_YOURS");
  for (const id of f.ids) assert.equal(f.world.fm(id).current_state, "deferred", `${id} moved through the promotion`);
  /* control: the act asked again over the set it moved is the real refusal, the set having moved */
  assert.equal(f.dispose().ok, false);
  const dismissed = disposeAct({ to: "dismissed", reason: "out of scope" });
  assert.deepEqual([dismissed.done.ok, dismissed.done.to], [true, "dismissed"]);
});

test("R49: migratedSurfacing answers the surfacing a migration replay recorded, and null for a question made on this plane", () => {
  const f = migratedSurfacing();
  assert.equal(f.plainAnswer, null);
  assert.deepEqual({ ...f.migratedAnswer, migrated: { ...f.migratedAnswer.migrated, at: typeof f.migratedAnswer.migrated.at } },
    { recorded: false, stated: word("inquiry.stated.recorded_migrated_drive"), run: null, lens: null,
      migrated: { capture: "c".repeat(64), promotion: "P-1", at: "string" } });
});

test("R33 R65: readRefusals answers NOT_AN_INQUIRY for a bundle that is no question, and one NO_SUCH_BUNDLE for an absent id and for a question the viewer may not see", () => {
  const f = readRefusals();
  assert.deepEqual(f.notAnInquiry, { ok: false, reason: "NOT_AN_INQUIRY", target: f.document });
  assert.deepEqual(f.absent, { ok: false, reason: "NO_SUCH_BUNDLE", target: f.absentId });
  assert.deepEqual(f.hiddenFromViewer, { ok: false, reason: "NO_SUCH_BUNDLE", target: f.question }, "answered as an absent one is");
  assert.equal(f.visible.ok, true, "control: a question the viewer may see is read");
});
