/* action-holds R16 at its interface: `op=pressurefor` serves R12's `pressureFor` (T48; N1035, K3145). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V } from "./fixture.mjs";
import * as holds from "../../../src/action-holds/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";
const M = V("alice");

test("R16 pressurefor op: answers exactly what pressureFor answers (marks by actionpressure and stated with an entry, and pressure records); an action or project the viewer may not see is answered as an absent one; writes nothing", () => {
  const w = world();
  const s = w.doc("INFO-2026-0001-d");
  w.action(A);
  w.action(B);
  const P = { kind: "legal", note: "a letter threatening a suit" };
  w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-03", artifactSha: s, pressure: P, viewer: M, author: M });
  w.a.actionCorrespond({ target: B, direction: "received", at: "2026-09-03", artifactSha: s, viewer: M, author: M });
  assert.equal(w.h.actionPressure({ target: B, ord: 0, pressure: { kind: "retaliation", note: "funding cut" }, viewer: M, author: M }).ok, true);
  const proj = w.project("alice", "discoverable");
  assert.equal(w.h.pressureRecord({ project: proj, pressure: { kind: "other", note: "a call" }, account: "a call", at: "2026-09-21",
    viewer: M, author: M }).ok, true);
  const op = (q, viewer = M) => holds.actionHoldsOps(w.h, new URL(`https://x/?${q}&viewer=${viewer}`), null).pressurefor();
  const before = w.rows(`SELECT COUNT(*) AS n FROM action_pressure`)[0].n;
  /* the same answer as the read, for each way of asking */
  assert.deepEqual(op(""), w.h.pressureFor({ viewer: M }));
  assert.deepEqual(op(`action=${A}`), w.h.pressureFor({ action: A, viewer: M }));
  assert.deepEqual(op(`action=${B}`), w.h.pressureFor({ action: B, viewer: M }));
  assert.deepEqual(op(`project=${proj}`), w.h.pressureFor({ project: proj, viewer: M }));
  assert.deepEqual(op("limit=1"), w.h.pressureFor({ limit: 1, viewer: M }));
  const first = op("limit=1");
  assert.equal(first.truncated, true);
  assert.deepEqual(op(`limit=1&after=${encodeURIComponent(first.cursor)}`), w.h.pressureFor({ limit: 1, after: first.cursor, viewer: M }));
  /* both kinds of mark and the record are answered, each with where it arrived */
  const all = op("").items;
  assert.deepEqual(all.map((x) => Object.keys(x.arrived)[0]).sort(), ["action", "action", "pressure"]);
  assert.deepEqual(op(`action=${B}`).items.map((x) => [x.arrived.ord, x.kind]), [[0, "retaliation"]]);
  /* control: a mark by actionpressure is answered to a viewer who sees the action, and not to one who may not */
  const stranger = "nobody";
  const hidden = op(`action=${B}`, stranger), absent = op("action=ACTN-2026-0404-x", stranger);
  assert.equal(hidden.ok, false);
  assert.deepEqual([hidden.reason, absent.reason], ["NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE"]);
  assert.deepEqual({ ...hidden, target: null }, { ...absent, target: null });
  assert.equal(op(`project=${proj}`, stranger).reason, w.h.pressureFor({ project: proj, viewer: stranger }).reason);
  assert.equal(op("", stranger).items.some((x) => x.arrived.action === B), false, "not in the unscoped list either");
  /* writes nothing */
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_pressure`)[0].n, before);
});
