/* retrieval: the published fixtures (fixtures.mjs) and the selection-read contract, each checked against retrieval's real answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { V } from "./fixture.mjs";
import { actionRegistrar, meaningRowsUnknownArm, noSelection, selectionResolve } from "./fixtures.mjs";
import { MEANING_READ_CHECKS } from "../../../src/retrieval/index.mjs";
import { MEANING } from "../../../src/query.mjs";

test("R53, R56: actionRegistrar registers the action facts once and a projection decoration once per module", () => {
  const r = actionRegistrar();
  assert.deepEqual(r.registerActionFacts("actions", () => ({})), { ok: true, module: "actions" });
  const again = r.registerActionFacts("actions", () => ({}));
  assert.deepEqual([again.ok, again.reason, again.declaredBy], [false, "FACTS_DECLARED", "actions"]);
  assert.equal(r.registerActionFacts("actions").reason, "FACTS_MALFORMED");
  assert.deepEqual(r.registerProjectionDecoration("actions", () => ({})), { ok: true, module: "actions" });
  assert.deepEqual(r.registerProjectionDecoration("actions", () => ({})), { ok: false, reason: "DECORATION_DECLARED", module: "actions" });
  assert.equal(r.registerProjectionDecoration("", () => ({})).reason, "DECORATION_MALFORMED");
});

test("R10, R31: meaningRowsUnknownArm is MEANING_ROWS_UNKNOWN_ARM (C-23.2), naming every arm with its grain", () => {
  const a = meaningRowsUnknownArm();
  assert.deepEqual([a.ok, a.reason, a.check, a.translation],
    [false, "MEANING_ROWS_UNKNOWN_ARM", "C-23.2", MEANING_READ_CHECKS.MEANING_ROWS_UNKNOWN_ARM.translation]);
  for (const [k, g] of Object.entries(MEANING)) assert.ok(a.detail.includes(`${k} (${g.rowGrain})`), k);
  assert.match(a.detail, /"bogus"/);
});

test("R19, R31: noSelection answers NO_SUCH_SELECTION (C-33.20), one answer for any handle", () => {
  const n = noSelection();
  assert.deepEqual(n.answer, { ok: false, reason: "NO_SUCH_SELECTION", detail: "unknown, released, or expired" });
  assert.deepEqual(n.selectionResolve({ handle: "sel-other", viewer: V("ann"), owner: "x" }), n.answer);
  assert.deepEqual(n.selectionResolve({}), n.answer);
});

test("R18, R19, R20: selectionResolve fixture: NO_SUCH_SELECTION, NOT_YOURS, SET_MOVED at weight refuse, and {ok, members, drift}", async () => {
  const f = selectionResolve();
  assert.deepEqual(f.resolve({ handle: "sel-nope", owner: "o" }), { ok: false, reason: "NO_SUCH_SELECTION", detail: "unknown, released, or expired" });
  const handle = await f.selection(["INFO-001", "INFO-002"], "o");
  assert.match(handle, /^sel-[0-9a-f]{24}$/);
  assert.equal(f.resolve({ handle, owner: "x" }).reason, "SELECTION_NOT_YOURS");
  const ok = f.resolve({ handle, owner: "o" });
  assert.deepEqual([ok.ok, ok.members, ok.moved], [true, ["INFO-001", "INFO-002"], false]);
  assert.deepEqual(Object.keys(ok.drift).sort(), ["added", "hidden", "kind", "purged", "removed", "revised"]);
  f.world.record.purge({ bundleId: "INFO-002" });
  const moved = f.resolve({ handle, owner: "o", weight: "refuse" });
  assert.deepEqual([moved.ok, moved.reason, moved.code, moved.members], [false, "SET_MOVED", "SET_MOVED", []]);
  const report = f.resolve({ handle, owner: "o", weight: "report" });
  assert.deepEqual([report.ok, report.moved, report.members], [true, true, ["INFO-001"]]);
});

/* R77, R19: the selection-read contract. Its user (retrieval-browse) holds these values as its own stand-in; the real
   answer is the value. */
// fixtures-run: retrieval-browse selection-read
test("R77: selection-read: NO_SUCH_SELECTION, NOT_YOURS, and the members of a selection held, writing nothing", async () => {
  const f = selectionResolve();
  assert.deepEqual(f.read({ handle: "sel-nope", owner: "o" }), { ok: false, reason: "NO_SUCH_SELECTION", detail: "unknown, released, or expired" });
  const handle = await f.selection(["INFO-001", "INFO-003"], "o");
  const mine = f.read({ handle, owner: "x" });
  assert.deepEqual([mine.ok, mine.reason], [false, "SELECTION_NOT_YOURS"]);
  assert.equal(f.read({ handle, owner: null }).reason, "SELECTION_NOT_YOURS");
  const held = f.read({ handle, owner: "o" });
  assert.deepEqual([held.ok, held.members], [true, ["INFO-001", "INFO-003"]]);
  assert.equal("viewer" in held, false, "the real answer does not echo the viewer (the user's stand-in does)");
  assert.deepEqual(f.read({ handle, owner: "o" }), held, "reading twice answers the same");
});
