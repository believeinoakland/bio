/* conformance's published fixtures (./fixtures.mjs), each called here and checked against the real answer. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { curesOf, determinationRead, determinationVariants, voidDetermination, noDeterminations } from "./fixtures.mjs";
import { noSuchDetermination } from "../../../src/conformance/index.mjs";

test("R37: the curesOf fixture answers the standing link per standard to a viewer who sees it, and one answer to one who does not", () => {
  const f = curesOf();
  const r = f.conformance.curesOf({ determination: f.determination, standard: f.standard, viewer: f.viewer });
  assert.equal(r.ok, true);
  assert.deepEqual(r.standards.map((s) => [s.standard, s.link.link, s.link.cure, s.link.cure_standing]),
                   [[f.standard, f.link, f.cure, true]]);
  assert.deepEqual(f.conformance.curesOf({ determination: f.determination, viewer: f.outsider }), noSuchDetermination(f.determination));
});

test("R9: the determinationRead fixture reads a live determination, a superseded one naming its successor, and an unclear outcome", () => {
  const f = determinationRead();
  const live = f.conformance.determinationRead({ id: f.live, viewer: f.viewer });
  assert.equal(live.ok, true);
  assert.equal(live.live, true);
  const old = f.conformance.determinationRead({ id: f.superseded, viewer: f.viewer });
  assert.deepEqual([old.ok, old.live, old.superseded_by], [true, false, f.supersededBy]);
  const unclear = f.conformance.determinationRead({ id: f.unclear, viewer: f.viewer });
  assert.equal(unclear.ok, true);
  assert.deepEqual(unclear.standards.map((s) => s.outcome), ["unclear"]);
  assert.deepEqual(f.conformance.determinationRead({ id: f.live, viewer: f.outsider }), noSuchDetermination(f.live));
});

test("R19: the noDeterminations fixture answers NO_SUCH_DETERMINATION to every id", () => {
  const f = noDeterminations();
  const r = f.conformance.determinationRead({ id: "CONF-2026-0001-determination", viewer: f.viewer });
  assert.deepEqual(r, noSuchDetermination("CONF-2026-0001-determination"));
  assert.equal(f.conformance.determinationsFor({ live: true, viewer: f.viewer }).items.length, 0);
});

test("R9 R14 R31 R32: the determinationVariants fixture reads a determination on a held check, one on an accepted finding, a compliant one, a superseded one naming its successor, and a live one with superseded_by null", () => {
  const f = determinationVariants();
  const read = (id) => f.conformance.determinationRead({ id, viewer: f.viewer });
  assert.deepEqual(read(f.held).findings.map((x) => x.basis.kind), ["checked_held"]);
  assert.deepEqual(read(f.accepted).findings.map((x) => x.basis.kind), ["accepted"]);
  assert.deepEqual(read(f.compliant).standards.map((s) => s.outcome), ["compliant"]);
  assert.deepEqual([read(f.superseded).live, read(f.superseded).superseded_by], [false, f.supersededBy]);
  assert.deepEqual([read(f.live).live, read(f.live).superseded_by], [true, null]);
  for (const id of [f.held, f.accepted, f.compliant, f.superseded, f.live]) assert.equal("void" in read(id), false, id);
  assert.deepEqual(f.conformance.determinationRead({ id: f.held, viewer: f.outsider }), noSuchDetermination(f.held));
});

test("R33: the voidDetermination fixture reads void while its held check's source has lapsed, naming the cause, and the control reads not void", () => {
  const f = voidDetermination();
  const r = f.conformance.determinationRead({ id: f.voided, viewer: f.viewer });
  assert.deepEqual([r.ok, r.live, r.void.causes.map((c) => c.cause), r.outcomes.map((o) => o.outcome)],
                   [true, true, ["check_void"], ["undetermined"]]);
  assert.equal("void" in f.conformance.determinationRead({ id: f.control, viewer: f.viewer }), false);
});
