/* R52 (C69; re-walk CA60): one newer-capture item per (holder, target, newer version), not one per notice. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, NOW, iso } from "./world.mjs";
import { word } from "../../../src/setup-words/index.mjs";

const notice = (id, o = {}) => ({ notice: id, kind: "leg", holder: "INQ-1", ord: 0, target: "INF-1", content_id: "c".repeat(64),
  capture_sha: "a", newer_capture: "b", grade: "affected", affects: "the passage moved", raised_at: iso(NOW - 60000), state: "open", ...o });
const read = (notices) => {
  const w = world({ reevaluation: { notices: () => ({ ok: true, limit: 1000, truncated: false, notices }) } });
  w.member("alice"); w.bundle("INQ-1", "inquiry"); w.bundle("INQ-2", "inquiry"); w.bundle("PRJ-1", "project"); w.join("PRJ-1", "alice");
  w.cite("PRJ-1", "INQ-1"); w.cite("PRJ-1", "INQ-2");
  return w.read("alice").items.filter((i) => i.kind === "newer-capture-affects-reference");
};

test("R52: two notices of one newer version on one holder and target are one item, the least notice id, its basis naming both", () => {
  const items = read([notice("RN-2", { ord: 1 }), notice("RN-1", { ord: 0 })]);
  assert.equal(items.length, 1);
  assert.equal(items[0].id, "FINDING::newer-capture-affects-reference::RN-1");
  assert.deepEqual(items[0].basis.notices, ["RN-1", "RN-2"]);
});

test("R52: a newer version of the same target is a new item", () => {
  const items = read([notice("RN-1"), notice("RN-2", { newer_capture: "c2" })]);
  assert.deepEqual(items.map((i) => i.id).sort(), ["FINDING::newer-capture-affects-reference::RN-1", "FINDING::newer-capture-affects-reference::RN-2"]);
});

test("R52 (C69): a newer capture no one has graded reads as undetermined, and its two notices are one item", () => {
  const items = read([notice("RN-1", { grade: null }), notice("RN-2", { grade: null, ord: 1 })]);
  assert.equal(items.length, 1);
  assert.equal(items[0].detail_key, "queue.newer-capture-affects-reference.detail");
  assert.ok(items[0].detail.includes(`read as ${word("queue.fill.grade.undetermined")}.`), items[0].detail);
});

test("R52: control: the same newer version on another holder, or another target, is another matter", () => {
  const items = read([notice("RN-1"), notice("RN-2", { holder: "INQ-2" }), notice("RN-3", { target: "INF-2" })]);
  assert.equal(items.length, 3);
});

test("R52: control: notices whose newer version the viewer cannot see stay one item each", () => {
  const items = read([notice("RN-1", { newer_capture: null, grade: null, affects: null }), notice("RN-2", { newer_capture: null, grade: null, affects: null })]);
  assert.equal(items.length, 2);
});
