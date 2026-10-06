/* money's withdrawal and reads at its interface: R7, R8, R9. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, sha, ANN, BOB, OUTSIDER } from "./fixture.mjs";

test("R7 a withdrawal states why; it is kept with who, when and why, a repeat answers already, and nothing is deleted", () => {
  const s = seeded();
  const id = s.rec();
  assert.equal(s.m.withdrawFact({ factId: id, by: ANN }).reason, "NO_REASON");
  assert.equal(s.m.withdrawFact({ factId: "MNY-2026-aaaaaaaaaaaaaaaa", reason: "x", by: ANN }).reason, "NO_SUCH_FACT");
  const w = s.m.withdrawFact({ factId: id, reason: "the page was misread", by: ANN });
  assert.equal(w.ok, true);
  assert.equal(s.m.withdrawFact({ factId: id, reason: "again", by: BOB }).already, true);
  const f = s.m.readFact({ factId: id, viewer: ANN }).fact;
  assert.deepEqual([f.withdrawn.by, f.withdrawn.reason], [ANN, "the page was misread"]);
  assert.equal(s.one(`SELECT count(*) AS n FROM money_facts WHERE fact_id=?`, id).n, 1);
});

test("R7 a withdrawn fact is never counted by the reads (moneyOf, summable, reconcile, the connection edge) and its adjustments and citing facts are answered beside it", () => {
  const s = seeded();
  const a = s.rec(), b = s.rec();
  const adj = s.rec({ phase: "adjusted", stage: null, adjusts: a });
  const cites = s.rec({ source: { fact: a } });
  s.m.withdrawFact({ factId: a, reason: "duplicate", by: ANN });
  assert.equal(s.m.moneyOf({ entity: s.vendor, viewer: ANN }).facts.some((f) => f.fact_id === a), false);
  assert.equal(s.m.summable({ factIds: [a, b] }).reason, "FACT_WITHDRAWN");
  assert.equal(s.m.reconcile({ a, b }).reason, "FACT_WITHDRAWN");
  assert.equal(s.m.neighbours({ node: s.vendor, at: "2013-06-01T12:00:00Z", viewer: ANN }).items.some((i) => i.id === a), false);
  const f = s.m.readFact({ factId: a, viewer: ANN }).fact;
  assert.deepEqual([f.adjustments, f.cited_by], [[adj], [cites]]);
});

test("R8 readFact: NO_FACT for an empty id, found false for an absent one, otherwise every field, both grades, the source with its citation", () => {
  const s = seeded();
  assert.equal(s.m.readFact({ factId: "", viewer: ANN }).reason, "NO_FACT");
  assert.deepEqual(s.m.readFact({ factId: "MNY-2026-aaaaaaaaaaaaaaaa", viewer: ANN }).found, false);
  const id = s.rec({ buys: { quantity: "120", unit: "cubic yards", what: "dredged material" } });
  const f = s.m.readFact({ factId: id, viewer: ANN }).fact;
  for (const k of ["fact_id", "amount", "as_read", "currency", "sign", "precision", "kind", "phase", "stage", "basis", "period",
                   "from", "to", "codes", "concerns", "source", "citation", "method", "grade", "by", "at", "withdrawn", "adjustments", "cited_by", "buys"])
    assert.ok(k in f, k);
  assert.deepEqual(Object.keys(f.grade).sort(), ["parties", "reading", "reading_basis"]);
  assert.equal(f.citation, `page 4 of capture ${s.cap}`);
  assert.deepEqual(f.buys, { quantity: "120", unit: "cubic yards", what: "dredged material" });
});

test("R9 moneyOf answers the facts naming the entity as party (entity or fund) or concerned, ordered by period then id, never a total", () => {
  const s = seeded();
  const late = s.rec({ period: { fiscal: "FY2015-16" } });
  const early = s.rec({ period: { fiscal: "FY2012-13" } });
  const viaFund = s.rec({ from: { fund: s.harbour }, to: { entity: s.city } });
  const concerning = s.rec({ from: { entity: s.city }, to: null, concerns: [s.contract] });
  assert.deepEqual(s.m.moneyOf({ entity: s.vendor, viewer: ANN }).facts.map((f) => f.fact_id), [early, late]);
  assert.deepEqual(s.m.moneyOf({ entity: s.harbour, viewer: ANN }).facts.map((f) => f.fact_id), [viaFund]);
  assert.deepEqual(s.m.moneyOf({ entity: s.contract, viewer: ANN }).facts.map((f) => f.fact_id), [concerning]);
  const r = s.m.moneyOf({ entity: s.vendor, viewer: ANN });
  assert.equal(r.says, "facts, never a total");
  assert.equal(["total", "sum"].some((k) => k in r), false);
  assert.equal(s.m.moneyOf({ viewer: ANN }).reason, "NO_ENTITY");
  // any id a fact's concerns may name (K1563): an event, a line
  const award = s.event("award", [s.contract]);
  const line = s.line();
  const onEvent = s.rec({ concerns: [award, line] });
  assert.deepEqual(s.m.moneyOf({ entity: award, viewer: ANN }).facts.map((f) => f.fact_id), [onEvent]);
  assert.deepEqual(s.m.moneyOf({ entity: line, viewer: ANN }).facts.map((f) => f.fact_id), [onEvent]);
});

test("R9 moneyOf filters by period overlap (undetermined ones apart), kinds and phases, bounded 1–500 with truncated", () => {
  const s = seeded();
  const a = s.rec({ period: { fiscal: "FY2013-14" } });
  s.rec({ period: { fiscal: "FY2016-17" } });
  const open = s.rec({ period: { from: "2010-01-01", to: null } });
  const adopted = s.rec({ phase: "adopted", stage: null, kind: "allocation" });
  const r = s.m.moneyOf({ entity: s.vendor, period: { from: "2013-06-01", to: "2013-06-30" }, viewer: ANN });
  assert.deepEqual(r.facts.map((f) => f.fact_id).sort(), [a, adopted].sort());
  assert.deepEqual(r.undetermined.map((f) => f.fact_id), [open]);
  assert.deepEqual(s.m.moneyOf({ entity: s.vendor, phases: "adopted", viewer: ANN }).facts.map((f) => f.fact_id), [adopted]);
  assert.deepEqual(s.m.moneyOf({ entity: s.vendor, kinds: ["allocation"], viewer: ANN }).facts.map((f) => f.fact_id), [adopted]);
  assert.equal(s.m.moneyOf({ entity: s.vendor, kinds: "spending", viewer: ANN }).reason, "UNKNOWN_MONEY_KIND");
  const one = s.m.moneyOf({ entity: s.vendor, limit: 1, viewer: ANN });
  assert.deepEqual([one.facts.length, one.limit, one.truncated], [1, 1, true]);
  assert.equal(s.m.moneyOf({ entity: s.vendor, limit: 9999, viewer: ANN }).limit, 500);
  assert.equal(s.m.moneyOf({ entity: s.vendor, limit: 0, viewer: ANN }).limit, 1);
  assert.equal(s.m.moneyOf({ entity: s.vendor, viewer: ANN }).limit, 100);
});

test("R9 moneyOf answers only what the viewer may see, and counts nothing withheld", () => {
  const s = seeded();
  s.project("PROJ-1", "bob");
  const hidden = s.held("INFO-H", sha("hidden"), { project: "PROJ-1" });
  s.rec({ source: { capture_sha: hidden }, by: BOB });
  s.rec();
  assert.equal(s.m.moneyOf({ entity: s.vendor, viewer: BOB }).count, 2);
  assert.equal(s.m.moneyOf({ entity: s.vendor, viewer: OUTSIDER }).count, 1);
  assert.equal(s.m.moneyOf({ entity: s.vendor }).count, 0);
});

test("R7 noSuchFact is the one answer to an absent fact (K1569): every act that answers NO_SUCH_FACT answers it, a hidden fact alike", async () => {
  const { noSuchFact } = await import("../../../src/money/index.mjs");
  const s = seeded();
  const absent = "MNY-2026-aaaaaaaaaaaaaaaa";
  const one = noSuchFact(absent, { end: "x", reason: "not mine", detail: "not mine" });
  assert.deepEqual([one.ok, one.reason, one.code, one.fact_id, one.end], [false, "NO_SUCH_FACT", "NO_SUCH_FACT", absent, "x"]);
  assert.equal(one.detail, noSuchFact(absent).detail, "a caller's fields never replace the fixed ones");
  assert.deepEqual(noSuchFact(undefined).fact_id, null);
  const a = s.rec();
  const set = s.m.createSet({ purpose: "trail", label: "t", by: ANN }).set_id;
  for (const r of [s.m.withdrawFact({ factId: absent, reason: "r", by: ANN }), s.m.summable({ factIds: [a, absent] }),
                   s.m.reconcile({ a, b: absent }), s.m.include({ setId: set, factId: absent, reason: "r", by: ANN }),
                   s.m.proposeInclusion({ setId: set, factId: absent, method: "m", by: ANN })])
    assert.deepEqual(r, noSuchFact(absent));
  s.project("PROJ-1", "bob");
  const hid = s.rec({ source: { capture_sha: s.held("INFO-H", sha("hidden"), { project: "PROJ-1" }) }, by: BOB });
  assert.deepEqual(s.m.include({ setId: set, factId: hid, reason: "r", by: OUTSIDER }), noSuchFact(hid));
});
