/* citation: a query selection whose answer swapped at a constant count (REC-55), at the module's interface: `cite`'s
   Session Log states the drift (R3) and `sever` and `reinstate` refuse it (R4, R7). Converted from the old battery's
   `refuse-gate` (legacy-tests T17): citation's share, the record statement; and legacy-store's share, the refuse gate
   over a real refuse-weight act, carried at citation's own refuse-weight acts (J1). The gate itself is `retrieval`'s
   (its R19, R20, R59). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, V, docMd } from "./fixture.mjs";

const ANN = { viewer: V("ann"), owner: "o", author: "member:ann", identity: V("ann") };
const CLAUSE = " (the set had moved since it was made; citing is report-weight and proceeded)";

/* A document the criterion `word` finds, by its title. */
const put = (w, id, word) => w.put(id, docMd(id, "information").replace(`"Document ${id}"`, `"${word} ${id}"`));
const query = async (w, q) => {
  const s = await w.retrieval.selectionCreate({ owner: "o", viewer: V("ann"), q });
  assert.equal(s.kind, "query", "the criterion is held, not the rows");
  return s;
};
/* The swap: one member of the answer purged and a fresh one of the same criterion written, so the count is the same on
   both sides and the membership is not. */
const swap = (w, out, into, word) => { w.record.purge({ bundleId: out }); put(w, into, word); };
const drift = (w, handle) => w.retrieval.selectionResolve({ handle, viewer: V("ann"), owner: "o", weight: "report" });
const trigger = (w, p) => w.md(p).split("\n").filter((l) => l.startsWith("Trigger: selection "));

test("R3: citing over a query selection swapped at a constant count says the set had moved, while the published `moved` stays per-row (false); an unchanged one says nothing", async () => {
  const w = world();
  for (const id of ["INFO-2026-0001", "INFO-2026-0002"]) put(w, id, "citefixture");
  const quiet = w.project("Quiet");
  const q1 = await query(w, "citefixture");
  const a = w.cit.cite({ project: quiet, handle: q1.handle, ...ANN });
  assert.deepEqual([a.ok, a.moved, a.drift.digestChanged], [true, false, undefined]);
  assert.deepEqual(trigger(w, quiet), [`Trigger: selection ${q1.handle}`], "no clause when nothing moved");

  for (const id of ["INFO-2026-0003", "INFO-2026-0004"]) put(w, id, "swapcite");
  const swapped = w.project("Swapped");
  const q2 = await query(w, "swapcite");
  assert.equal(q2.n, 2);
  swap(w, "INFO-2026-0003", "INFO-2026-0005", "swapcite");
  const rep = drift(w, q2.handle);
  assert.deepEqual([rep.n, rep.moved, rep.drift.added, rep.drift.removed, rep.drift.digestChanged], [2, false, 0, 0, true]);
  const c = w.cit.cite({ project: swapped, handle: q2.handle, ...ANN });
  assert.deepEqual([c.ok, c.weight, c.moved, c.drift.digestChanged, c.cited], [true, "report", false, true, ["INFO-2026-0004", "INFO-2026-0005"]]);
  assert.deepEqual(trigger(w, swapped), [`Trigger: selection ${q2.handle}${CLAUSE}`]);
  /* The same on a question's basis. */
  const q = w.inquiry("INQ-2026-0001");
  const onQ = w.cit.cite({ project: q, handle: q2.handle, ...ANN, role: "supports" });
  assert.equal(onQ.ok, true);
  assert.deepEqual(trigger(w, q), [`Trigger: selection ${q2.handle}${CLAUSE}`]);
});

test("R4, R7: sever and reinstate over a query selection swapped at a constant count are SET_MOVED, handing over nothing and moving no edge; an unchanged one and a fresh one over the same criterion act", async () => {
  const w = world();
  for (const id of ["INFO-2026-0001", "INFO-2026-0002"]) put(w, id, "swapfixture");
  const p = w.project();
  /* The unchanged query selection passes the refuse gate: a gate that stopped everything would pass every arm below. */
  const held = await query(w, "swapfixture");
  const all = await w.select(["INFO-2026-0001", "INFO-2026-0002"]);
  assert.equal(w.cit.cite({ project: p, handle: all, ...ANN }).ok, true);
  const s = w.cit.sever({ project: p, handle: held.handle, ...ANN, reason: "cut" });
  assert.deepEqual([s.ok, s.weight, s.severed, s.moved], [true, "refuse", ["INFO-2026-0001", "INFO-2026-0002"], false]);
  const r = w.cit.reinstate({ project: p, handle: held.handle, ...ANN, reason: "back" });
  assert.deepEqual([r.ok, r.reinstated], [true, ["INFO-2026-0001", "INFO-2026-0002"]]);

  /* The swap; the new member is cited too, so every member of the swapped answer has an edge to move. */
  swap(w, "INFO-2026-0001", "INFO-2026-0003", "swapfixture");
  assert.equal(w.cit.cite({ project: p, handle: await w.select(["INFO-2026-0003"]), ...ANN }).ok, true);
  const rep = drift(w, held.handle);
  assert.deepEqual([rep.n, rep.moved, rep.drift.digestChanged], [2, false, true]);
  const before = w.md(p);
  for (const act of ["sever", "reinstate"]) {
    const x = w.cit[act]({ project: p, handle: held.handle, ...ANN, reason: "over the swapped set", weight: "report" });
    assert.deepEqual([x.ok, x.reason, x.members, x.drift.digestChanged], [false, "SET_MOVED", [], true], act);
  }
  assert.equal(w.md(p), before, "no edge moved");
  assert.deepEqual(w.fm(p).references.filter((e) => e.target !== "INFO-2026-0001").map((e) => [e.target, e.status]),
                   [["INFO-2026-0002", "confirmed"], ["INFO-2026-0003", "confirmed"]]);

  /* The acts are not broken: a selection made now, over the set as it stands, severs and reinstates. */
  const fresh = await query(w, "swapfixture");
  const s2 = w.cit.sever({ project: p, handle: fresh.handle, ...ANN, reason: "cut" });
  assert.deepEqual([s2.ok, s2.severed], [true, ["INFO-2026-0002", "INFO-2026-0003"]]);
  const r2 = w.cit.reinstate({ project: p, handle: fresh.handle, ...ANN, reason: "back" });
  assert.deepEqual([r2.ok, r2.reinstated], [true, ["INFO-2026-0002", "INFO-2026-0003"]]);
});
