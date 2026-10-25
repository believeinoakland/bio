/* R52 (C69; re-walk CA60): one newer-capture item per (holder, target, newer version), not one per notice. The notices are
   reevaluation's real answer (its published fixture): holder Q has two legs on one target, both waiting on one newer capture;
   a second holder has a leg on that target, and a third holder a leg on another target whose newer version is changed. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./world.mjs";
import { noticesRead } from "../reevaluation/fixtures.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const real = noticesRead({ several: true });
const NEWER = "newer-capture-affects-reference";

/* the newer-capture items alice reads, the notices of the real answer each holder cites from PRJ-1 */
const items = () => {
  const w = world({ reevaluation: { notices: () => ({ ok: true, limit: real.limit, truncated: real.truncated, notices: real.notices }) } });
  w.member("alice"); w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice");
  for (const h of new Set(real.notices.map((n) => n.holder))) { w.bundle(h, "inquiry"); w.cite("PRJ-1", h); }
  return w.read("alice").items.filter((i) => i.kind === NEWER);
};
/** the notice ids a holder raised, least first */
const legsOf = (holder) => real.notices.filter((n) => n.holder === holder).map((n) => n.notice).sort();
const holderQ = real.holder, holderQ2 = "INQ-2026-0002-q", holderQ3 = "INQ-2026-0003-q";

test("R52: the two legs of one holder on one target, both waiting on one newer capture, are one item, its id the least notice id and its basis naming both", () => {
  const got = items();
  assert.equal(got.length, 3, "three items for four notices: holder Q's two legs are one");
  const legs = legsOf(holderQ);
  assert.equal(legs.length, 2);
  const one = got.find((i) => i.basis.notices.includes(legs[0]));
  assert.equal(one.id, `FINDING::${NEWER}::${legs[0]}`);
  assert.deepEqual(one.basis.notices, legs);
});

test("R52: control: another holder's leg on that target, and a leg of a third holder on another target, are each another matter", () => {
  const got = items().map((i) => i.id).sort();
  const expected = [`FINDING::${NEWER}::${legsOf(holderQ)[0]}`, `FINDING::${NEWER}::${legsOf(holderQ2)[0]}`, `FINDING::${NEWER}::${legsOf(holderQ3)[0]}`].sort();
  assert.deepEqual(got, expected);
});

test("R52 (C69): a newer capture no one has graded reads as undetermined, and the two legs waiting on it are one item", () => {
  const one = items().find((i) => i.basis.notices.includes(legsOf(holderQ)[0]));
  assert.equal(one.detail_key, `queue.${NEWER}.detail`);
  assert.ok(one.detail.includes(`read as ${word("queue.fill.grade.undetermined")}.`), one.detail);
});

test("R52 (G65): a newer version graded NOT_FOUND reads its grade through its row, not as a hole", () => {
  const other = items().find((i) => i.basis.notices.includes(legsOf(holderQ3)[0]));
  assert.ok(other.detail.includes(word("queue.fill.grade.notfound")), other.detail);
  assert.ok(!other.detail.includes("read as ."), other.detail);
});
