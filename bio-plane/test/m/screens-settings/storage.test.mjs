/* R79 (G42; K4635, K4638): the record's gauge on `group`, over the world: the founder reads the real `stats`, its size seeded where no act can make one (the platform states the record's size). The thresholds and the units are
   asserted at their edges: the limit is 10,000,000,000 B (decimal), a warning from 70 %, a second from 90 % saying writes will fail, the
   size as GB and a whole percentage that never reads 70 % or 90 % below the edge. Each sentence by its key. The composition with the real
   door and the real record is `storage-seam.test.mjs`. */
import test from "node:test";
import assert from "node:assert/strict";
import { all, has, lacks, open, storeWorld, SCREENS } from "./kit.mjs";
import { KEYS } from "../../../src/screens-settings/keys.mjs";
import { sized, STATS_WITHOUT_SIZE, STATS_NOT_A_NUMBER } from "./seed-group.mjs";

const G = "screen.group.storage.";
const FACTORS = ["plan", "pare", "latency", "limits"].map((k) => G + "factors." + k);
const drawn = (o, state) => all(o.tree, (e) => e.attrs["data-state"] === state).length;
/** The founder (class admin: the exact figure) reads the gauge over a world whose storage states `bytes`; the real `stats` answers it as `dbBytes`. */
async function gauge(bytes, { table } = {}) {
  const w = await storeWorld();
  const founder = await w.signIn("founder");
  if (bytes !== undefined) sized(w, bytes);
  const o = await open("group", { world: w, as: founder, table });
  o.stated = (await founder.read("stats")).dbBytes;
  return o;
}
const size = (used, percent) => ({ used, limit: "10", percent });

test("R79 G42 group: the size against 10 GB as GB and a whole percent, no warning below 70 %", async () => {
  for (const [bytes, fills] of [[0, size("0.0", "0")], [6_999_999_999, size("6.9", "69")]]) {
    const o = await gauge(bytes);
    assert.equal(o.stated, bytes, "the record states its size");
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
  assert.equal(nul.stated, null, "the record states none");
  has(nul, G + "head");
  has(nul, G + "unstated");
  lacks(nul, G + "size", size("0.0", "0"));
  assert.equal(drawn(nul, "storage"), 1);
  const none = await gauge(0, { table: STATS_WITHOUT_SIZE });   // world gap: the owner always states `dbBytes` to the founder
  lacks(none, G + "head");
  assert.equal(drawn(none, "storage"), 0, "key absent: nothing drawn");
  const bad = await gauge(0, { table: STATS_NOT_A_NUMBER });   // world gap: the owner states a number or null
  has(bad, G + "unstated");
});

test("R79 G42 group control: a member's screen sends no `stats` and draws no gauge, whatever the answer; a failed read is drawn failed", async () => {
  const w = await storeWorld();
  sized(w, 9_500_000_000);
  const m = await open("group", { world: w, as: await w.signIn("dev") });
  assert.equal(m.p.all.filter((r) => r.op === "stats").length, 0);
  lacks(m, G + "head"); lacks(m, G + "warn2");
  const failed = await gauge(9_500_000_000, { table: { stats: "none" } });
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
