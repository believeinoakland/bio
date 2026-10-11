/* action-holds R1 at its interface: pressure marked on a received entry (moved from `actions` R48, K597 (1); T45,
   K2781 (1)): stated with `actions`' `actionCorrespond` or later by this module's `actionPressure`, in one table, never
   rewriting the entry; read apart from the ledger by `pressureFor` (R12's read, in place of `actions` R25's list and
   `actionsFor`'s `pressure: true`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, MACHINE } from "./fixture.mjs";
import * as holds from "../../../src/action-holds/index.mjs";
import * as grammar from "../../../src/action-grammar/index.mjs";

const A = "ACTN-2026-0001-a", B = "ACTN-2026-0002-b";
const M = V("alice");

test("R1 pressure: marked on a received entry by a member, with actionCorrespond or later by actionPressure; never rewritten; read apart; pressureFor lists the actions holding one", () => {
  const w = world();
  const s = w.doc("INFO-2026-0001-d");
  w.action(A);
  w.action(B);
  const P = { kind: "legal", note: "a letter threatening a suit" };
  /* at actions' act: the mark stated with the entry lands in this module's table, read here alike */
  const c = (x) => w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-03", artifactSha: s, viewer: M, author: M, ...x });
  w.a.actionCorrespond({ target: A, direction: "sent", at: "2026-09-02", account: "asked", viewer: M, author: M });
  const at = c({ pressure: P });
  assert.deepEqual([at.ok, at.ord, at.pressure], [true, 1, P]);
  assert.ok(!/pressure/.test(w.text(A)), "the mark is never in the entry's bytes");
  /* later, by actionPressure */
  w.a.actionCorrespond({ target: A, direction: "received", at: "2026-09-04", artifactSha: s, viewer: M, author: M });
  const X = (x) => w.h.actionPressure({ target: A, ord: 2, pressure: { kind: "retaliation", note: "funding cut" }, viewer: M, author: M, ...x });
  const mach = X({ author: MACHINE });
  assert.deepEqual([mach.reason, mach.check], ["MACHINE_CANNOT_MARK_PRESSURE", "C-117.14"], "the shape rows stay action-grammar's");
  assert.equal(X({ author: "" }).reason, "MACHINE_CANNOT_MARK_PRESSURE");
  assert.deepEqual([X({ target: "" }).reason, X({ pressure: { kind: "x", note: "y" } }).reason, X({ target: "ACTN-2026-0404-x" }).reason,
    X({ target: "INFO-2026-0001-d" }).reason, X({ ord: 9 }).reason, X({ ord: "one" }).reason, X({ ord: 0 }).reason, X({ ord: 1 }).reason],
    ["NO_TARGET", "PRESSURE_REFUSED", "NO_SUCH_BUNDLE", "NOT_AN_ACTION", "PRESSURE_NO_ENTRY", "PRESSURE_NO_ENTRY",
     "PRESSURE_NOT_RECEIVED", "PRESSURE_MARKED"]);
  /* PRESSURE_REFUSED: every arm of the shape */
  for (const pressure of [{ kind: "lawsuit", note: "x" }, { kind: "legal", note: "" }, { kind: "legal", note: 'a"b' },
                          { kind: "legal", note: "x".repeat(501) }, { kind: "legal" }, null, "not json", [P]])
    assert.equal(X({ pressure }).reason, "PRESSURE_REFUSED", JSON.stringify(pressure));
  assert.equal(X({ pressure: { kind: "legal", note: "x".repeat(500) }, ord: 9 }).reason, "PRESSURE_NO_ENTRY", "500 characters pass the shape");
  /* this module's own rows (C-149), minted at the regions their `where` names; the shape rows action-grammar's */
  for (const [r, code, check, region] of [[X({ ord: 9 }), "PRESSURE_NO_ENTRY", "C-149.7", "actionPressure > is-pressure-entry"],
                                          [X({ ord: 1 }), "PRESSURE_MARKED", "C-149.6", "actionPressure > is-pressure-marked"]]) {
    assert.deepEqual([r.reason, r.code, r.check, r.translation], [code, code, check, holds.ACTION_HOLDS_CHECKS[code].translation]);
    assert.equal(holds.ACTION_HOLDS_CHECKS[code].where, `src/action-holds/index.mjs ${region}`);
  }
  assert.deepEqual([X({ ord: 0 }).check, X({ pressure: { kind: "x", note: "y" } }).check], ["C-117.16", "C-117.15"]);
  assert.equal(grammar.ACTION_CATALOGUE_CHECKS.PRESSURE_NOT_RECEIVED.check, "C-117.16");
  /* absent and invisible alike */
  const hidden = X({ viewer: "nobody" }), absent = X({ target: "ACTN-2026-0404-x" });
  assert.deepEqual([hidden.reason, Object.keys(hidden)], [absent.reason, Object.keys(absent)]);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_pressure WHERE ord=2`)[0].n, 0, "no refusal writes a mark");
  const text = w.text(A);
  const ok = X({ ord: "2" });
  assert.deepEqual(ok, { ok: true, target: A, ord: 2, pressure: { kind: "retaliation", note: "funding cut" }, by: M,
                         at: "2026-09-28T12:00:00Z", weight: "single" });
  assert.equal(w.text(A), text, "never rewrites the entry");
  assert.deepEqual([X({}).reason, X({}).check], ["PRESSURE_MARKED", "C-149.6"]);
  /* the read lists them apart from the ledger, both acts' marks alike */
  const r = w.h.pressureFor({ action: A, viewer: M });
  assert.deepEqual(r.items.map((p) => [p.arrived.ord, p.kind, p.by]), [[1, "legal", M], [2, "retaliation", M]]);
  assert.equal(w.a.actionRead({ id: A, viewer: M }).correspondence.length, 3);
  /* pressureFor with no action: every visible action holding a mark (actionsFor's `pressure: true`) */
  assert.deepEqual([...new Set(w.h.pressureFor({ viewer: M }).items.map((x) => x.arrived.action))], [A]);
  assert.deepEqual(w.h.pressureFor({ viewer: "nobody" }).items, [], "an invisible action's marks are never listed");
  assert.equal(w.h.pressureFor({ action: A, viewer: "nobody" }).reason, "NO_SUCH_BUNDLE");
  /* the op, with the stamps the control plane makes */
  const op = holds.actionHoldsOps(w.h, new URL(`https://x/?target=${B}&ord=0&pressure_kind=other&pressure_note=n&viewer=${M}&author=${M}`), null)
    .actionpressure();
  assert.equal(op.reason, "PRESSURE_NO_ENTRY");
  const viaBody = holds.actionHoldsOps(w.h, new URL(`https://x/?viewer=${M}&author=${MACHINE}`),
    { target: A, ord: 2, pressure: P, author: M }).actionpressure();
  assert.equal(viaBody.reason, "MACHINE_CANNOT_MARK_PRESSURE", "the author is the stamp, never the body's");
  /* purged with the action */
  w.record.purge({ bundleId: A });
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM action_pressure WHERE bundle_id=?`, A)[0].n, 0);
});
