/* money R28 (T51 fix round 3, C8): a project's money trails are listed by what they concern, at money's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { seeded, BOB, ANN, OUTSIDER } from "./fixture.mjs";
import { moneyOps, DECLARED_OPS } from "../../../src/money/index.mjs";

/* a world with two projects, BOB a participant of both, and four trails started in the first */
function world() {
  const s = seeded();
  s.project("PROJ-1", "bob");
  s.project("PROJ-2", "bob");
  s.trails = ["one", "two", "three", "four"].map((label) => s.m.createSet({ purpose: "trail", label, concerns: "PROJ-1", by: BOB }).set_id);
  return s;
}
const ids = (r) => (r.sets ?? []).map((x) => x.set_id);

test("R28 four trails started in one project are all listed, newest first, each in the set's shape", () => {
  const s = world();
  const f = s.rec();
  s.m.include({ setId: s.trails[1], factId: f, reason: "follows the transfer", by: BOB });
  const r = s.m.moneySets({ concerns: "PROJ-1", limit: 100, viewer: BOB });
  assert.equal(r.ok, true);
  assert.deepEqual(ids(r), [...s.trails].reverse());
  assert.deepEqual([r.truncated, r.next], [false, null]);
  assert.deepEqual(r.sets.map((x) => x.label), ["four", "three", "two", "one"]);
  const two = r.sets.find((x) => x.set_id === s.trails[1]);
  assert.deepEqual(Object.keys(two).sort(), ["concerns", "exclusions", "inclusions", "label", "purpose", "set_id"]);
  assert.deepEqual([two.purpose, two.concerns, two.inclusions.map((i) => i.fact_id), two.exclusions], ["trail", "PROJ-1", [f], []]);
});

test("R28 a trail concerning another project is not listed, and each project lists its own", () => {
  const s = world();
  const other = s.m.createSet({ purpose: "trail", label: "elsewhere", concerns: "PROJ-2", by: BOB }).set_id;
  assert.deepEqual(ids(s.m.moneySets({ concerns: "PROJ-1", viewer: BOB })), [...s.trails].reverse());
  assert.deepEqual(ids(s.m.moneySets({ concerns: "PROJ-2", viewer: BOB })), [other]);
});

test("R28 a project the viewer cannot see lists none and names none, exactly as an id that names nothing", () => {
  const s = world();
  const hidden = s.m.moneySets({ concerns: "PROJ-1", viewer: OUTSIDER });
  const nothing = s.m.moneySets({ concerns: "PROJ-NOWHERE", viewer: OUTSIDER });
  assert.deepEqual(hidden, { ...nothing });
  assert.deepEqual([hidden.ok, hidden.sets, hidden.truncated, hidden.next], [true, [], false, null]);
  assert.equal(JSON.stringify(hidden).includes("PROJ-1"), false);
  assert.equal(s.m.moneySets({ concerns: "PROJ-1", viewer: "" }).sets.length, 0);
  assert.equal(s.m.moneySets({ concerns: "PROJ-1", viewer: BOB }).sets.length, 4);
});

test("R28 purpose narrows; control: an attribution set is no trail, and a set with no concerns is listed under no id", () => {
  const s = world();
  s.m.createSet({ purpose: "attribution", label: "dredging", concerns: s.contract, by: ANN });
  const bare = s.m.createSet({ purpose: "trail", label: "no project", by: ANN }).set_id;
  assert.equal(s.m.moneySets({ concerns: "PROJ-1", purpose: "trail", viewer: BOB }).sets.length, 4);
  assert.deepEqual(s.m.moneySets({ concerns: "PROJ-1", purpose: "attribution", viewer: BOB }).sets, []);
  assert.deepEqual(ids(s.m.moneySets({ concerns: s.contract, purpose: "attribution", viewer: ANN })).length, 1);
  assert.deepEqual(s.m.moneySets({ concerns: s.contract, purpose: "trail", viewer: ANN }).sets, []);
  for (const id of ["PROJ-1", "PROJ-2", s.contract, "", "null"]) {
    const r = s.m.moneySets({ concerns: id, viewer: ANN });
    assert.equal(ids(r).includes(bare), false);
  }
  assert.equal(s.m.moneySets({ concerns: "PROJ-1", purpose: "ledger", viewer: BOB }).reason, "UNKNOWN_PURPOSE");
  assert.equal(s.m.moneySets({ viewer: BOB }).reason, "NO_CONCERNS");
});

test("R28 the list is bounded and says when it was cut, and the next page follows on without a repeat or a gap", () => {
  const s = world();
  const p1 = s.m.moneySets({ concerns: "PROJ-1", limit: 3, viewer: BOB });
  assert.deepEqual([ids(p1).length, p1.truncated], [3, true]);
  assert.equal(p1.next, ids(p1)[2]);
  const p2 = s.m.moneySets({ concerns: "PROJ-1", limit: 3, after: p1.next, viewer: BOB });
  assert.deepEqual([...ids(p1), ...ids(p2)], [...s.trails].reverse());
  assert.deepEqual([p2.truncated, p2.next], [false, null]);
  assert.equal(s.m.moneySets({ concerns: "PROJ-1", limit: 0, viewer: BOB }).sets.length, 1);
  assert.equal(s.m.moneySets({ concerns: "PROJ-1", limit: 9999, viewer: BOB }).limit, 500);
  assert.equal(s.m.moneySets({ concerns: "PROJ-1", after: "MSR-2026-9999", viewer: BOB }).reason, "BAD_AFTER");
});

test("R28 a trail's facts the viewer cannot see are not listed in its shape, and the read changes nothing; the existing set reads and writes are unchanged", () => {
  const s = world();
  const f = s.rec();
  s.m.include({ setId: s.trails[0], factId: f, reason: "r", by: BOB });
  const before = s.rows(`SELECT count(*) AS n FROM money_sets`)[0].n;
  const acts = s.rows(`SELECT count(*) AS n FROM money_set_acts`)[0].n;
  s.m.moneySets({ concerns: "PROJ-1", viewer: BOB });
  assert.deepEqual([s.rows(`SELECT count(*) AS n FROM money_sets`)[0].n, s.rows(`SELECT count(*) AS n FROM money_set_acts`)[0].n], [before, acts]);
  const one = s.m.readSet({ setId: s.trails[0], viewer: BOB });
  assert.equal(one.set.concerns, "PROJ-1");
  assert.equal(one.inclusions.length, 1);
});

test("R28 op=moneysets is served by the ops map as a read, from the query, and declared", () => {
  const s = world();
  const url = new URL(`http://x/?op=moneysets&concerns=PROJ-1&limit=2&viewer=${encodeURIComponent(BOB)}`);
  const r = moneyOps(s.m, url, null).moneysets();
  assert.deepEqual([r.ok, r.sets.length, r.truncated], [true, 2, true]);
  const d = DECLARED_OPS.moneysets;
  assert.deepEqual([d.mutating, d.weight, d.fields.requires, d.fields.accepts], [false, "read", ["concerns"], ["concerns", "purpose", "limit", "after"]]);
});

test("R12 a trail in a project the viewer cannot see is read exactly as an absent set; the member with sight reads it", () => {
  const s = world();
  const f = s.rec();
  s.m.include({ setId: s.trails[0], factId: f, reason: "follows the transfer", by: BOB });
  const hidden = s.m.readSet({ setId: s.trails[0], viewer: OUTSIDER });
  const absent = s.m.readSet({ setId: "MSR-2026-9999", viewer: OUTSIDER });
  assert.deepEqual(Object.keys(hidden).sort(), Object.keys(absent).sort());
  assert.deepEqual([hidden.ok, hidden.found, hidden.set_id], [true, false, s.trails[0]]);
  assert.deepEqual({ ...hidden, set_id: null }, { ...absent, set_id: null });
  const text = JSON.stringify(hidden);
  for (const leak of ["PROJ-1", "one", f]) assert.equal(text.includes(`"${leak}"`), false);
  assert.equal(s.m.readSet({ setId: s.trails[0], viewer: "" }).found, false);
  const seen = s.m.readSet({ setId: s.trails[0], viewer: BOB });
  assert.deepEqual([seen.found, seen.set.concerns, seen.set.label, seen.inclusions.map((i) => i.fact_id)], [true, "PROJ-1", "one", [f]]);
  const bare = s.m.createSet({ purpose: "trail", label: "no project", by: ANN }).set_id;
  assert.equal(s.m.readSet({ setId: bare, viewer: OUTSIDER }).found, true);
});
