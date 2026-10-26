/* citation R23 (T51 fix round 10, walk C C-M6): `reinstate` takes an optional `role`, so a passage cited on the wrong side
   is moved to the other without a second leg: cite as cuts_against, sever, reinstate onto supports with a reason. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, STAMP } from "./fixture.mjs";
import { CITE_CHECKS } from "../../../src/citation/index.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const DOC = "INFO-2026-0001-doc", Q = "INQ-2026-0001-q";

/* A question citing one document as cuts_against, then severing that leg. */
async function severedWrongSide() {
  const w = world({ inquiry: true });
  w.info(DOC);
  w.inquiry(Q);
  const one = await w.select([DOC]);
  const c = w.cit.cite({ project: Q, handle: one, ...ANN, role: "cuts_against", note: "it says no" });
  assert.equal(c.ok, true, JSON.stringify(c).slice(0, 300));
  const s = w.cit.sever({ project: Q, handle: one, ...ANN, reason: "wrong side" });
  assert.equal(s.ok, true, JSON.stringify(s).slice(0, 300));
  return { w, one };
}
const legs = (w) => w.fm(Q).basis.map((l) => [l.target, l.role]);
const reinstatements = (w) => w.md(Q).split("\n").filter((l) => /^### Session .*\| Reinstated /.test(l));

test("R23: a severed leg cited on the wrong side is reinstated onto the other side with a reason: one leg, role supports, one Session Log entry naming the change and the reason", async () => {
  const { w, one } = await severedWrongSide();
  /* Why the act is needed: re-citing is refused, and a plain reinstate keeps the side. */
  assert.equal(w.cit.cite({ project: Q, handle: one, ...ANN, role: "supports" }).reason, "SEVERED_EDGE");
  const r = w.cit.reinstate({ project: Q, handle: one, ...ANN, reason: "I read it the wrong way round", role: "supports" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(legs(w), [[DOC, "supports"]], "one leg, now on the other side");
  assert.equal(w.fm(Q).references.find((e) => e.target === DOC).status, "confirmed");
  assert.deepEqual([r.reinstated, r.to, r.role, r.roleMoved], [[DOC], "confirmed", "supports", [DOC]]);
  const entries = reinstatements(w);
  assert.equal(entries.length, 1, "one Session Log entry for the reinstatement");
  const log = w.md(Q).slice(w.md(Q).indexOf(entries[0]));
  const entry = log.slice(0, log.indexOf("\n\n") === -1 ? undefined : log.indexOf("\n\n"));
  for (const fact of [DOC, "cuts_against", "supports", "I read it the wrong way round", "member:ann"])
    assert.ok(entry.includes(fact), `the entry names ${fact}: ${entry}`);
  assert.equal(w.fm(Q).last_updated, STAMP);
  /* The leg keeps everything else it had. */
  assert.equal(w.fm(Q).basis[0].note, "it says no");
});

test("R23: control — a reinstate with no role, or with the role the leg already has, leaves the role and says nothing of a move", async () => {
  for (const role of [undefined, "cuts_against"]) {
    const { w, one } = await severedWrongSide();
    const r = w.cit.reinstate({ project: Q, handle: one, ...ANN, reason: "back", ...(role ? { role } : {}) });
    assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
    assert.deepEqual(legs(w), [[DOC, "cuts_against"]]);
    assert.deepEqual(r.roleMoved ?? [], []);
    assert.equal(reinstatements(w).length, 1);
    assert.equal(w.md(Q).includes("cuts_against"), true, "the leg keeps its side");
    assert.equal(reinstatements(w).length === 1 && !/supports/.test(w.md(Q)), true, "no other side is named");
  }
});

test("R23: refusals — a role the vocabulary lacks is BAD_ROLE, a case's reinstate refuses a role as ROLE_NOT_APPLICABLE, and the reason is still asked; each writes nothing", async () => {
  const { w, one } = await severedWrongSide();
  const before = w.md(Q);
  const bad = w.cit.reinstate({ project: Q, handle: one, ...ANN, reason: "back", role: "neutral" });
  assert.deepEqual([bad.ok, bad.reason, bad.got, bad.check], [false, "BAD_ROLE", "neutral", CITE_CHECKS.BAD_ROLE.check]);
  assert.deepEqual(bad.roles, w.inq.BASIS_ROLES);
  assert.equal(w.cit.reinstate({ project: Q, handle: one, ...ANN, reason: " ", role: "supports" }).reason, "NO_REASON");
  assert.equal(w.md(Q), before, "nothing written");

  const p = w.project();
  const h = await w.select([DOC]);
  assert.equal(w.cit.cite({ project: p, handle: h, ...ANN }).ok, true);
  assert.equal(w.cit.sever({ project: p, handle: h, ...ANN, reason: "cut" }).ok, true);
  const pBefore = w.md(p);
  const na = w.cit.reinstate({ project: p, handle: h, ...ANN, reason: "back", role: "supports" });
  assert.deepEqual([na.ok, na.reason, na.got], [false, "ROLE_NOT_APPLICABLE", "supports"]);
  assert.equal(w.md(p), pBefore, "nothing written");
  /* Control: the same case reinstates without a role. */
  assert.equal(w.cit.reinstate({ project: p, handle: h, ...ANN, reason: "back" }).ok, true);
});

test("R23: only the leg the selection names moves to the role; the other leg stays on its side", async () => {
  const w = world({ inquiry: true });
  const DOC2 = "INFO-2026-0002-doc";
  w.info(DOC);
  w.info(DOC2);
  w.inquiry(Q);
  const both = await w.select([DOC, DOC2]);
  assert.equal(w.cit.cite({ project: Q, handle: both, ...ANN, role: "cuts_against" }).ok, true);
  const one = await w.select([DOC]);
  assert.equal(w.cit.sever({ project: Q, handle: one, ...ANN, reason: "cut" }).ok, true);
  assert.equal(w.cit.reinstate({ project: Q, handle: one, ...ANN, reason: "flip", role: "supports" }).ok, true);
  assert.deepEqual(legs(w), [[DOC, "supports"], [DOC2, "cuts_against"]]);
});
