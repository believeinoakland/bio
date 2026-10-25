/* actions' T12 entry at its interface: R8's `DETERMINATION_SUPERSEDED` through conformance R20 (N312, K275). (R31's
   entry cursor, N311, went with R31's held copy: N428.) */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, actionMd, CP, NONCOMPLIANT } from "./fixture.mjs";
import { determinationRead } from "../conformance/fixtures.mjs";
import * as conformance from "../../../src/conformance/index.mjs";

const M = V("alice");
const A = "ACTN-2026-0001-a";

/* conformance's own determinations (its published `determinationRead`, R9): a live one, one a later determination
   superseded, and the one that superseded it. Each is held in the record as a bundle, as the document it stands for. */
function grounded() {
  const f = determinationRead();
  const w = world({ conformance: f.conformance });
  for (const id of [f.live, f.superseded, f.supersededBy])
    assert.equal(w.promote(id, ["---", `id: ${id}`, "object_type: determination", `title: ${id}`, "current_state: recorded",
      'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"),
      { author: f.viewer, extra: { replay: true } }).ok, true);
  return { f, w };
}
const md = (...ids) => mdFor(A, ...ids);
const mdFor = (id, ...ids) => actionMd(id, [...CP, "action_kind: other", "breach: true", "action_basis:",
  ...ids.flatMap((d) => [`  - target: ${d}`, "    kind: rests_on"])]);

test("R8 (N312) a breach action resting only on a superseded determination is refused DETERMINATION_SUPERSEDED, answered through conformance R20", () => {
  const { f, w } = grounded();
  const author = { author: f.viewer };
  const r = w.promote(A, md(f.superseded), author);
  assert.deepEqual([r.ok, r.reason, r.code, r.determination, r.superseded_by], [false, "DETERMINATION_SUPERSEDED", "DETERMINATION_SUPERSEDED", f.superseded, f.supersededBy]);
  assert.equal(typeof r.detail, "string");
  assert.equal(w.promote(A, md(f.superseded, f.live), author).ok, true, "a live leg beside a superseded one rests the action");
  assert.equal(w.promote(A, md(f.superseded, f.superseded), author).determination, f.superseded, "the first superseded leg is named");
  assert.equal(w.record.head(A) !== null, true);
  assert.equal(w.promote("ACTN-2026-0002-b", mdFor("ACTN-2026-0002-b", f.superseded), author).detail, r.detail,
    "the same detail for every superseded determination: one fixed sentence (conformance R20)");
  assert.equal(w.record.head("ACTN-2026-0002-b"), null, "nothing was written");
  /* negative control: a live determination rests the action. */
  assert.equal(w.promote("ACTN-2026-0003-c", mdFor("ACTN-2026-0003-c", f.live), author).ok, true);
});

test("R8 (N312) the answer is conformance's own, check and translation its catalogue row's", () => {
  const { f, w } = grounded();
  const r = w.promote(A, md(f.superseded), { author: f.viewer });
  assert.deepEqual(r, conformance.determinationSuperseded(f.superseded, f.supersededBy));
  assert.ok(r.check && r.translation, "its row's");
});

/* The one arm conformance's real determinations do not reach (K252): a determination that is not live and names no
   successor. Its answer is the shape conformance R9 gives, held here by hand until conformance publishes it. */
test("R8 (N312) a superseded determination whose successor the reader does not name answers superseded_by null", () => {
  const D3 = "CONF-2026-0003-determination";
  const dets = { [D3]: { ok: true, id: D3, live: false, superseded_by: null, outcomes: NONCOMPLIANT } };
  const w = world({ conformance: { determinationRead: ({ id }) => dets[id] || { ok: false, reason: "NO_SUCH_DETERMINATION" } } });
  assert.equal(w.promote(D3, ["---", `id: ${D3}`, "object_type: determination", `title: ${D3}`, "current_state: recorded",
    'created: "2026-09-01T00:00:00Z"', 'last_updated: "2026-09-01T00:00:00Z"', "---", "", "d", ""].join("\n"), { extra: { replay: true } }).ok, true);
  assert.equal(w.promote(A, mdFor(A, D3)).superseded_by, null);
});
