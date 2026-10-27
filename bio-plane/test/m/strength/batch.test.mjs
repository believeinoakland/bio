/* strength R44 (T51 fix round 6; G12c, K4426-K4428): `inquirystrength` also answers a list, `ids` (at most 50), one result
   per id in one call, each gated exactly as the single read. Driven through the ops map as the door calls it (`url`,
   `body`), over the fixture's world; the single read of the same id is the expected answer, never a hand-written shape. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, MACHINE } from "./fixture.mjs";
import * as strength from "../../../src/strength/index.mjs";

const { strengthOps } = strength;

const PROJ = "PROJ-2026-0042-abc";
const HIDDEN = "INQ-2026-0009-h";
const INFO = (n) => `INFO-2026-000${n}-a`;
const INQS = [1, 2, 3, 4, 5].map((n) => `INQ-2026-000${n}-a`);

/* Five questions with five different bases, and a sixth that sits in a project carol has not joined. */
function fiveAndAHidden() {
  const w = world();
  for (const n of [1, 2, 3, 4, 5]) w.bundle(INFO(n));
  w.member("alice");
  w.member("carol");
  w.project(PROJ, ["alice"]);
  w.inquiry(INQS[0], [{ target: INFO(1), grade: "B", axis: "capture", source: "capture" }]);
  w.inquiry(INQS[1], [{ target: INFO(2), grade: "C", axis: "connection", source: "resolution" }, { target: INFO(3) }]);
  w.inquiry(INQS[2], [{ target: INFO(3), grade: "A", axis: "capture", source: "capture" },
                      { target: INQS[0] }]);
  w.inquiry(INQS[3], [{ target: INFO(4) }]);
  w.inquiry(INQS[4], []);
  w.inquiry(HIDDEN, [{ target: INFO(5), grade: "B", axis: "capture", source: "capture" }]);
  w.rows(`UPDATE bundles SET project=? WHERE bundle_id=?`, PROJ, HIDDEN);
  return w;
}

/* the call as the door makes it: the list in the address, as a comma-separated string, or in the body as a list */
const viaQuery = (w, ids, viewer) =>
  strengthOps(w.s, new URL(`http://x/?op=inquirystrength&viewer=${encodeURIComponent(viewer)}&ids=${encodeURIComponent(ids.join(","))}`), null).inquirystrength();
const viaBody = (w, ids, viewer) =>
  strengthOps(w.s, new URL(`http://x/?op=inquirystrength&viewer=${encodeURIComponent(viewer)}`), { ids }).inquirystrength();
const single = (w, id, viewer) =>
  strengthOps(w.s, new URL(`http://x/?op=inquirystrength&viewer=${encodeURIComponent(viewer)}&id=${id}`), null).inquirystrength();

test("R44: a batch of 5 ids answers each id as the single read answers it, in one call (query list and body list alike)", () => {
  const w = fiveAndAHidden();
  for (const viewer of [MACHINE, "member:alice", "member:carol"]) {
    const expected = Object.fromEntries(INQS.map((id) => [id, single(w, id, viewer)]));
    for (const answer of [viaQuery(w, INQS, viewer), viaBody(w, INQS, viewer)]) {
      assert.equal(answer.ok, true);
      assert.deepEqual(Object.keys(answer.results), INQS, "one result per id, in the order asked");
      assert.deepEqual(answer.results, expected, `each result is the single read of that id for ${viewer}`);
    }
  }
  /* the five really differ, so equality is not a trivial one */
  const answers = INQS.map((id) => JSON.stringify(single(w, id, MACHINE)));
  assert.equal(new Set(answers).size, 5);
});

test("R44: an id the viewer may not see is withheld as the single read withholds it, under its own key, never by omission", () => {
  const w = fiveAndAHidden();
  const ask = [INQS[0], HIDDEN, "INQ-2026-0099-none", INQS[1]];
  const carol = viaQuery(w, ask, "member:carol");
  assert.deepEqual(Object.keys(carol.results), ask, "the hidden and the absent id each still have a result");
  assert.deepEqual(carol.results[HIDDEN], single(w, HIDDEN, "member:carol"));
  assert.deepEqual(carol.results[HIDDEN], { ok: false, reason: "NO_SUCH_BUNDLE", target: HIDDEN });
  assert.deepEqual(carol.results["INQ-2026-0099-none"], { ok: false, reason: "NO_SUCH_BUNDLE", target: "INQ-2026-0099-none" },
    "the hidden and the absent are told in the same shape");
  assert.equal(carol.results[INQS[0]].ok, true);
  assert.ok(!JSON.stringify(carol).includes(INFO(5)), "nothing of the hidden question's evidence is named");
  /* control: a participant of the project sees the same id answered whole */
  const alice = viaQuery(w, ask, "member:alice");
  assert.equal(alice.results[HIDDEN].ok, true);
  assert.deepEqual(alice.results[HIDDEN], single(w, HIDDEN, "member:alice"));
});

test("R44: at most INQUIRY_STRENGTH_IDS_MAX (50) ids; more is refused whole, naming the bound, and 50 are answered", () => {
  const w = fiveAndAHidden();
  assert.equal(strength.INQUIRY_STRENGTH_IDS_MAX, 50);
  const many = (n) => Array.from({ length: n }, (_, i) => `INQ-2026-${String(1000 + i)}-x`);
  const over = viaQuery(w, many(51), MACHINE);
  assert.equal(over.ok, false);
  assert.equal(over.reason, "BAD_IDS");
  assert.equal(over.limit, 50);
  assert.equal(over.results, undefined, "no partial answer");
  const exact = viaBody(w, many(50), MACHINE);
  assert.equal(exact.ok, true);
  assert.equal(Object.keys(exact.results).length, 50, "the bound itself is answered, every id absent here");
  /* an id named twice is answered once */
  const twice = viaBody(w, [INQS[0], INQS[0], INQS[1]], MACHINE);
  assert.deepEqual(Object.keys(twice.results), [INQS[0], INQS[1]]);
});

test("R44: a list of anything but ids is refused BAD_IDS and an empty list NO_ID, as the single read refuses no id", () => {
  const w = fiveAndAHidden();
  const body = (ids) => strengthOps(w.s, new URL(`http://x/?viewer=${MACHINE}`), { ids }).inquirystrength();
  for (const bad of [[1, 2], [INQS[0], ""], [" "], { a: 1 }, 7, [INQS[0], null]]) {
    const r = body(bad);
    assert.equal(r.ok, false, JSON.stringify(bad));
    assert.equal(r.reason, "BAD_IDS", JSON.stringify(bad));
  }
  for (const empty of [[], ","]) {
    const r = strengthOps(w.s, new URL(`http://x/?viewer=${MACHINE}&ids=${encodeURIComponent(empty)}`), null).inquirystrength();
    assert.equal(r.reason, "NO_ID", JSON.stringify(empty));
  }
  assert.equal(body([]).reason, "NO_ID");
  /* control: the single read is as it was, and `ids` absent leaves it untouched */
  assert.deepEqual(single(w, INQS[0], MACHINE), w.s.inquiryStrength({ id: INQS[0], viewer: MACHINE }));
  assert.equal(single(w, INQS[0], MACHINE).results, undefined);
  assert.equal(strengthOps(w.s, new URL(`http://x/?viewer=${MACHINE}`), null).inquirystrength().reason, "NO_ID");
});
