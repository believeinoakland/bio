/* queue's published fixtures (fixtures.mjs, K5217) are the answers queue's own code gives: an empty feed, a feed holding one
   obligation, and the counts over both, each made afresh and never stored. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { emptyFeed, feedWithItem, emptyCount, countWithItem, FIXTURE_MEMBER } from "./fixtures.mjs";
import { plainCount } from "./world.mjs";

/* the answer's timings and how it was derived differ between two asks by design (the clock, the derivation's served mark) */
const content = ({ feeds_ms: _ms, derivation: _d, feeds: _f, ...rest }) => rest;

test("K5217: the empty feed is queue's real answer for a member with nothing open: ok, her name, no item, the answer's own fields", () => {
  const f = emptyFeed();
  assert.equal(f.ok, true);
  assert.equal(f.member, FIXTURE_MEMBER);
  assert.deepEqual(f.items, []);
  assert.equal(f.item_count, 0);
  assert.equal(f.truncated, false);
  for (const k of ["limit", "classes", "class_labels", "sections", "feeds", "all_clear", "resolved", "mute", "disposed"])
    assert.ok(k in f, k);
});

test("K5217: the one-item feed is queue's real answer: the one open task assigned to her, as an OBLIGATION, with its subject's summary", () => {
  const f = feedWithItem();
  assert.equal(f.ok, true);
  assert.equal(f.member, FIXTURE_MEMBER);
  assert.deepEqual(f.items.map((i) => i.id), ["TASK-2026-0001-a"]);
  assert.equal(f.items[0].class, "OBLIGATION");
  assert.equal(f.items[0].summary, "about INF-1");
  assert.equal(f.item_count, 1);
});

test("K5217: the counts over the two feeds are queue's real count: 0 for the empty feed, 1 for the one-item feed, nothing else", () => {
  assert.deepEqual(plainCount(emptyCount()), { ok: true, member: FIXTURE_MEMBER, count: 0 });
  assert.deepEqual(plainCount(countWithItem()), { ok: true, member: FIXTURE_MEMBER, count: 1 });
  assert.equal("items" in countWithItem(), false, "no item is sent with a count");
});

test("K5217: each fixture is made afresh over its own world: equal in content, never the same object, and a caller's change to one answer does not reach the next", () => {
  const a = feedWithItem();
  const b = feedWithItem();
  assert.deepEqual(content(a), content(b));
  assert.notEqual(a, b);
  a.items.push({ id: "TASK-X", class: "OBLIGATION" });
  a.item_count = 99;
  assert.equal(feedWithItem().items.length, 1);
  assert.equal(feedWithItem().item_count, 1);
  assert.deepEqual(emptyFeed().items, []);
});
