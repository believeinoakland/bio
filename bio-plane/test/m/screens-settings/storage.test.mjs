/* R79 (G42; K4635, K4638): the record's gauge on `group`, over the fake plane in `stats`' own shape. The thresholds and the units are
   asserted at their edges: the limit is 10,000,000,000 B (decimal), a warning from 70 %, a second from 90 % saying writes will fail, the
   size as GB and a whole percentage that never reads 70 % or 90 % below the edge. Each sentence by its key. The composition with the real
   door and the real record is `storage-seam.test.mjs`. */
import test from "node:test";
import assert from "node:assert/strict";
import { all, has, lacks, open, SCREENS } from "./kit.mjs";
import { KEYS } from "../../../src/screens-settings/keys.mjs";
import { ADMIN, MEMBER, env, groupTable } from "./fixtures.mjs";

const G = "screen.group.storage.";
const FACTORS = ["plan", "pare", "latency", "limits"].map((k) => G + "factors." + k);
const drawn = (o, state) => all(o.tree, (e) => e.attrs["data-state"] === state).length;
const gauge = (dbBytes) => open("group", { me: ADMIN, table: groupTable({ stats: env({ documents: 12, dbBytes }) }) });
const size = (used, percent) => ({ used, limit: "10", percent });

test("R79 G42 group: the size against 10 GB as GB and a whole percent, no warning below 70 %", async () => {
  for (const [bytes, fills] of [[0, size("0.0", "0")], [6_999_999_999, size("6.9", "69")]]) {
    const o = await gauge(bytes);
    has(o, G + "head");
    has(o, G + "size", fills);
    assert.equal(drawn(o, "storagewarn1") + drawn(o, "storagewarn2"), 0, `${bytes}: no warning`);
    lacks(o, G + "warn1"); lacks(o, G + "warn2");
  }
});

test("R79 G42 group: from 7,000,000,000 B (70 %) the first warning, naming the four factors, one key to a sentence", async () => {
  for (const [bytes, fills] of [[7_000_000_000, size("7.0", "70")], [8_999_999_999, size("8.9", "89")]]) {
    const o = await gauge(bytes);
    has(o, G + "size", fills);
    assert.equal(drawn(o, "storagewarn1"), 1, `${bytes}: the first warning`);
    assert.equal(drawn(o, "storagewarn2"), 0, `${bytes}: not the second`);
    has(o, G + "warn1"); lacks(o, G + "warn2");
    has(o, G + "factors.lead");
    for (const k of FACTORS) has(o, k);
  }
});

test("R79 G42 group: from 9,000,000,000 B (90 %), and over 100 %, the second warning says writes fail at the limit, naming the four factors", async () => {
  for (const [bytes, fills] of [[9_000_000_000, size("9.0", "90")], [10_500_000_000, size("10.5", "105")]]) {
    const o = await gauge(bytes);
    has(o, G + "size", fills);
    assert.equal(drawn(o, "storagewarn2"), 1, `${bytes}: the second warning`);
    assert.equal(drawn(o, "storagewarn1"), 0, `${bytes}: it replaces the first`);
    has(o, G + "warn2"); lacks(o, G + "warn1");
    for (const k of FACTORS) has(o, k);
  }
});

test("R79 G42 group: a size the object does not state is said so, never as zero; an answer with no `dbBytes` draws nothing", async () => {
  const nul = await gauge(null);
  has(nul, G + "head");
  has(nul, G + "unstated");
  lacks(nul, G + "size", size("0.0", "0"));
  assert.equal(drawn(nul, "storage"), 1);
  const none = await open("group", { me: ADMIN, table: groupTable() });
  lacks(none, G + "head");
  assert.equal(drawn(none, "storage"), 0, "key absent: nothing drawn");
  const bad = await gauge("big");
  has(bad, G + "unstated");
});

test("R79 G42 group control: a member's screen sends no `stats` and draws no gauge, whatever the answer; a failed read is drawn failed", async () => {
  const m = await open("group", { me: MEMBER, table: groupTable({ stats: env({ dbBytes: 9_500_000_000 }) }) });
  assert.equal(m.p.all.filter((r) => r.op === "stats").length, 0);
  lacks(m, G + "head"); lacks(m, G + "warn2");
  const failed = await open("group", { me: ADMIN, table: groupTable({ stats: () => ({ ok: false, status: 500, reason: "STORE_FAILED" }) }) });
  assert.equal(drawn(failed, "storagewarn1") + drawn(failed, "storagewarn2") + drawn(failed, "storage"), 0, "no size is invented from a failed read");
});

test("R79 R39 group: the gauge's heading is the design's key for it (screen.settings.storage.head), and the screen lists no other key for that heading", async () => {
  const group = SCREENS.find((s) => s.id === "group");
  assert.ok(group.words.includes("screen.settings.storage.head"));
  assert.ok(!group.words.includes(G + "head"), "the group-scoped key for the same heading is not read");
  assert.ok(KEYS.includes("screen.settings.storage.head") && !KEYS.includes(G + "head"));
  const o = await gauge(0);
  has(o, "screen.settings.storage.head");
});
