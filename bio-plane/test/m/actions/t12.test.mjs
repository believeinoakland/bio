/* actions' T12 entry at its interface: R8's `DETERMINATION_SUPERSEDED` through conformance R20 (N312, K275). (R31's
   entry cursor, N311, went with R31's held copy: N428.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP } from "./fixture.mjs";
import * as conformance from "../../../src/conformance/index.mjs";

const M = V("alice");
const A = "ACTN-2026-0001-a";

test("R8 (N312) a breach action resting only on a superseded determination is refused DETERMINATION_SUPERSEDED, answered through conformance R20", () => {
  const D1 = "CONF-2026-0001-determination", D2 = "CONF-2026-0002-determination", D3 = "CONF-2026-0003-determination";
  const dets = { [D1]: { ok: true, id: D1, live: true, superseded_by: null },
                 [D2]: { ok: true, id: D2, live: false, superseded_by: D1 },
                 [D3]: { ok: true, id: D3, live: false, superseded_by: null } };
  const w = world({ conformance: { determinationRead: ({ id }) => dets[id] || { ok: false, reason: "NO_SUCH_DETERMINATION" } } });
  for (const id of [D1, D2, D3])
    assert.equal(w.promote(id, ["---", `id: ${id}`, "object_type: determination", `title: ${id}`, "current_state: recorded",
      'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } }).ok, true);
  const md = (...ids) => actionMd(A, [...CP, "action_kind: other", "breach: true", "action_basis:",
    ...ids.flatMap((d) => [`  - target: ${d}`, "    kind: rests_on"])]);
  const r = w.promote(A, md(D2));
  assert.deepEqual([r.ok, r.reason, r.code, r.determination, r.superseded_by], [false, "DETERMINATION_SUPERSEDED", "DETERMINATION_SUPERSEDED", D2, D1]);
  assert.equal(typeof r.detail, "string");
  assert.equal(w.promote(A, md(D3)).superseded_by, null, "a successor the reader does not name answers null");
  assert.equal(w.promote(A, md(D2, D3)).determination, D2, "the first superseded leg is named");
  assert.equal(w.record.head(A), null, "nothing was written");
  /* the same detail for every superseded determination: one fixed sentence (conformance R20). */
  assert.equal(w.promote(A, md(D3)).detail, r.detail);
  /* negative control: a live leg beside a superseded one rests the action. */
  assert.equal(w.promote(A, md(D2, D1)).ok, true);
});

test("R8 (N312) the answer is conformance's own, check and translation its catalogue row's", () => {
  const D1 = "CONF-2026-0001-determination", D2 = "CONF-2026-0002-determination";
  const dets = { [D1]: { ok: true, id: D1, live: true, superseded_by: null }, [D2]: { ok: true, id: D2, live: false, superseded_by: D1 } };
  const w = world({ conformance: { determinationRead: ({ id }) => dets[id] || { ok: false } } });
  for (const id of [D1, D2])
    w.promote(id, ["---", `id: ${id}`, "object_type: determination", `title: ${id}`, "current_state: recorded",
      'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } });
  const r = w.promote(A, actionMd(A, [...CP, "action_kind: other", "breach: true", "action_basis:", `  - target: ${D2}`, "    kind: rests_on"]));
  assert.deepEqual(r, conformance.determinationSuperseded(D2, D1));
  assert.ok(r.check && r.translation, "its row's");
});
