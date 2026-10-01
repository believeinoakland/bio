/* control-plane R2, R41 (P9; AFFORDANCES #12 J1 (3), K1001): the door's op table is accounted for whole by the catalogue it
   publishes. Every op the door routes (R2: a name with a spec is answered, any other refused) is read here as
   affordances' `unaccounted` (its R12) reads a table, `{op, mutating, gated}` with `gated` its `NEEDS` row, and nothing
   is unpublished, unranked or stale: the totality DEC-8 and FW-14 require of the `op=affordances` answer (R41). Ported
   from the old `rung-ladder.test.mjs` §2's reading of the same service. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { O } from "./harness.mjs";
import { unaccounted, RUNGS, RUNG_ABSENT } from "../../../src/affordances.mjs";

const table = () => Object.entries(O.OPS).map(([op, spec]) => ({ op, mutating: spec?.mutating === true, gated: Object.hasOwn(O.NEEDS, op) }));

test("R2, R41 (DEC-8, FW-14; affordances R12): affordances' unaccounted over the door's op table names no unpublished act, no unranked mutating op and nothing stale (negative control: an op added to the table, or a rung the table no longer carries, is seen)", () => {
  const rows = table();
  assert.ok(rows.length > 300, String(rows.length));
  assert.deepEqual(unaccounted(rows), { unpublished: [], unranked: [], stale: [] });
  /* negative controls: a new gated mutating op is unpublished and unranked; a ranked op dropped from the table is stale */
  const added = unaccounted([...rows, { op: "nosuchact", mutating: true, gated: true }]);
  assert.deepEqual([added.unpublished, added.unranked], [["nosuchact"], ["nosuchact"]]);
  const ranked = Object.keys(RUNGS)[0] ?? Object.keys(RUNG_ABSENT)[0];
  assert.ok(unaccounted(rows.filter((r) => r.op !== ranked)).stale.includes(ranked), ranked);
});
