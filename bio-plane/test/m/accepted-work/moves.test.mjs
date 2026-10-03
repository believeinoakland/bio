/* accepted-work: the cited cases' publisher moves (R8), read through the seam `reevaluation` uses (N534). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, importer, REF, REF2, NOW } from "./fixture.mjs";
import { ACCEPTED_WORK_ABSENT, ACCEPTED_WORK_UNREADABLE_WHY } from "../../../src/accepted-work/index.mjs";

const FIELDS = ["move", "import", "group", "case", "kind", "edition", "seq", "date", "at", "what_changed", "reason",
                "key_listed", "taken_back"];

test("R8 publisherMoves answers the registered moves' answer unchanged: each move with every field as recorded (an edition with what_changed, a withdrawal of an edition or of all with its reason, key_listed, taken_back), in the order recorded, paged by after and limit to a null cursor", () => {
  const w = world();
  w.source.move(REF, "edition", 2);
  w.source.move(REF2, "withdrawal", "all", { key_listed: false });
  w.source.move(REF, "withdrawal", 1, { taken_back: { seq: 5, date: "2026-10-04" } });
  const all = w.aw.publisherMoves({});
  assert.deepEqual(all, w.source.fns.moves({}), "the registered answer, as given");
  assert.deepEqual(all.moves, w.source.moved, "every move, every field, in the order recorded");
  assert.equal(all.cursor, null);
  for (const m of all.moves) assert.deepEqual(Object.keys(m).sort(), [...FIELDS].sort());
  const [edition, withdrawAll, withdrawOne] = all.moves;
  assert.deepEqual([edition.kind, edition.edition, edition.what_changed, edition.reason],
                   ["edition", 2, "edition 2: a date corrected", null]);
  assert.deepEqual([withdrawAll.kind, withdrawAll.edition, withdrawAll.reason, withdrawAll.key_listed],
                   ["withdrawal", "all", "the source was retracted", false]);
  assert.deepEqual(withdrawOne.taken_back, { seq: 5, date: "2026-10-04" });
  assert.equal(edition.at, NOW);
  /* paged: after names the last move read, limit bounds the page; read through each cursor to null */
  const seen = [];
  let after = null, pages = 0;
  do {
    const p = w.aw.publisherMoves({ after, limit: 1 });
    assert.ok(p.moves.length <= 1);
    seen.push(...p.moves.map((m) => m.move));
    after = p.cursor; pages++;
  } while (after !== null && pages < 10);
  assert.deepEqual(seen, ["M1", "M2", "M3"]);
  assert.deepEqual(w.source.calls.filter(([n]) => n === "moves").slice(-3).map(([, a]) => a),
    [{ after: null, limit: 1 }, { after: "M1", limit: 1 }, { after: "M2", limit: 1 }], "after and limit handed as given");
  /* no limit named: the registered function's default (200) applies; the read hands it undefined */
  for (let i = 0; i < 205; i++) w.source.move(REF, "edition", i + 3);
  const first = w.aw.publisherMoves({});
  assert.equal(first.moves.length, 200);
  assert.equal(first.cursor, "M200");
  assert.equal(w.source.calls[w.source.calls.length - 1][1].limit, undefined);
  assert.equal(w.aw.publisherMoves({ after: first.cursor }).moves.length, 8);
});

test("R8 with no moves registered publisherMoves answers {absent: true}, stated as accepted_work_absent: nothing registered, or a registration of the three functions alone", () => {
  const bare = world({ register: false });
  const { moves, ...three } = importer().fns;
  const threeOnly = world({ register: false });
  threeOnly.aw.registerAcceptedWork("case-import", three);
  for (const w of [bare, threeOnly]) {
    for (const args of [{}, { after: null, limit: 5 }, undefined, null]) {
      const a = w.aw.publisherMoves(args);
      assert.equal(a.absent, true);
      assert.equal(a.reason, ACCEPTED_WORK_ABSENT);
      assert.equal(a.reason, "accepted_work_absent");
      assert.equal(typeof a.detail, "string");
      assert.ok(!("moves" in a));
    }
  }
});

test("R8 when the registered moves throws, or answers a promise, publisherMoves answers {unreadable: true}, never the stack; it never throws, whatever it is handed, and writes nothing", async () => {
  const w = world();
  w.source.move(REF, "edition", 2);
  const dump = () => JSON.stringify(w.tables().map((t) => [t, w.st.rows(`SELECT * FROM "${t}"`)]));
  const before = dump();
  assert.equal(w.aw.publisherMoves({}).moves.length, 1);
  w.source.throws = "the move table is locked";
  const a = w.aw.publisherMoves({});
  assert.equal(a.unreadable, true);
  assert.equal(a.reason, ACCEPTED_WORK_UNREADABLE_WHY);
  assert.ok(a.detail.includes("the move table is locked"));
  assert.ok(!("stack" in a));
  for (const thrown of [() => { throw "s"; }, () => { throw null; }, () => { throw new Error("y".repeat(9000)); },
                        () => Promise.resolve({ moves: [], cursor: null }), () => Promise.reject(new Error("later"))]) {
    const x = world({ register: false });
    x.aw.registerAcceptedWork("case-import", { ...importer().fns, moves: thrown });
    const r = x.aw.publisherMoves({});
    assert.equal(r.unreadable, true);
    assert.ok(r.detail.length < 400, "the detail is bounded");
  }
  w.source.throws = null;
  const hostile = { get after() { throw new Error("boom"); } };
  for (const args of [undefined, null, 7, "x", [], hostile, { after: {}, limit: -1 }])
    assert.doesNotThrow(() => w.aw.publisherMoves(args));
  assert.equal(w.aw.publisherMoves(hostile).unreadable, true);
  assert.equal(dump(), before, "nothing was written");
  await new Promise((r) => setImmediate(r));   // no unhandled rejection is left behind
});
