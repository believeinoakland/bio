/* following R10, R11, R17 (fix round 6, G46): a followed portal of any size is snapshotted whole or stated, never failed by a
 * bound value. Through the real `followTick` over a portal follow, run under the platform's value bound (`test/platform-sqlite.mjs`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as Following from "../../../src/following/index.mjs";
import { readDataset } from "../../../src/following/snapshot.mjs";
import { world, MEMBER, T0, DAY } from "./fixture.mjs";

const INLINE_MAX = Following.PORTAL_ROWS_INLINE_MAX;
const PARSE_MAX = Following.PORTAL_PARSE_MAX_BYTES;
const PART_CHARS = Following.PORTAL_PART_CHARS;
const MIB = 1024 * 1024;
const PORTAL = "https://data.ellery.example/resource/permits.csv";
const HOME = "INFO-2026-0002-a";

/* the J7 shape: a 1,500,035 B portal CSV of 24,121 rows (the last row's note is padded to land the exact size) */
function permitsCsv({ rows = 24121, size = 1_500_035, changed = false } = {}) {
  const line = (i, status = "open", note = "x".repeat(13)) => `${String(i).padStart(5, "0")},Permit ${String(i).padStart(5, "0")} on Ellery Street,${status},100.00,${note}\n`;
  const out = ["id,name,status,fee,note\n"];
  for (let i = 1; i <= rows; i++) out.push(line(i));
  let text = out.join("");
  text = text.slice(0, -1 - 13) + "x".repeat(13 + size - Buffer.byteLength(text)) + "\n";
  /* the later read: row 100 closed, row 200 gone, row 99999 new */
  return changed ? text.replace(line(100), line(100, "closed")).replace(line(200), "") + line(99999) : text;
}

function setup(address = PORTAL) {
  const w = world();
  w.project("PRJ-2026-0001-a");
  w.bundle(HOME, { project: "PRJ-2026-0001-a" });
  const follow = w.f.followPortal({ address, key: "id", home: HOME, author: MEMBER, viewer: MEMBER }).follow;
  const key = w.f.follows({ viewer: MEMBER }).items[0].subject.address;
  const tick = async (n, body) => { if (body !== undefined) w.serve(key, body); return w.f.followTick(T0 + n * DAY); };
  const stored = (seq) => {
    const snap = w.one(`SELECT * FROM portal_snapshots WHERE follow_id=? AND seq=?`, follow, seq);
    const parts = w.rows(`SELECT part, chunk FROM portal_snapshot_parts WHERE follow_id=? AND seq=? ORDER BY part`, follow, seq);
    return { snap, parts };
  };
  return { w, follow, key, tick, stored };
}
const joined = (s) => s.parts.map((p) => p.chunk).join("");
const bytesOf = (v) => Buffer.byteLength(String(v), "utf8");

test("R10 R11 G46: a 1.5 MB portal CSV (24,121 rows) is snapshotted in pieces whole, read back by snapshotDiff, and no bound value passes 1 MiB", async () => {
  const { w, follow, tick, stored } = setup();
  const csv = permitsCsv();
  assert.equal(Buffer.byteLength(csv), 1_500_035);
  const t1 = await tick(0, csv);
  assert.deepEqual(t1.failed, [], "the tick is not failed by a value over the platform's bound");
  assert.equal(t1.captured[0].snapshot, 1);
  const s1 = stored(1);
  const want = readDataset(csv).rows;
  assert.equal(want.length, 24121);
  assert.deepEqual(JSON.parse(joined(s1)), want, "the stored rows equal the dataset read from the bytes");
  assert.deepEqual(JSON.parse(s1.snap.rows), { parts: s1.parts.length, bytes: bytesOf(joined(s1)), rows: 24121 });
  assert.ok(bytesOf(joined(s1)) > INLINE_MAX, "this dataset is above the inline max");
  const t2 = await tick(1, permitsCsv({ changed: true }));
  assert.deepEqual(t2.failed, []);
  const list = w.f.snapshots({ follow, viewer: MEMBER }).snapshots;
  assert.deepEqual(list.map((x) => [x.seq, x.why]), [[1, undefined], [2, undefined]], "both listed, neither with a why");
  const d = w.f.snapshotDiff({ follow, from: 1, to: 2, viewer: MEMBER });
  assert.deepEqual(d.added.map((r) => r.key), ["99999"]);
  assert.deepEqual(d.removed.map((r) => r.key), ["00200"]);
  assert.deepEqual(d.changed, [{ key: "00100", field: "status", before: "open", after: "closed" }]);
  assert.deepEqual(d.undetermined, []);
  const biggest = Math.max(...w.rows(`SELECT length(CAST(rows AS BLOB)) AS n FROM portal_snapshots UNION ALL SELECT length(CAST(chunk AS BLOB)) FROM portal_snapshot_parts`).map((r) => Number(r.n)));
  assert.ok(biggest < MIB, `the largest bound value is ${biggest} B, under 1 MiB`);
  /* the same capture read again lands nothing new */
  const t3 = await tick(2);
  assert.equal(t3.read[0].outcome, "unchanged");
  assert.equal(w.rows(`SELECT 1 FROM portal_snapshots`).length, 2);
});

test("R10 G46 controls: a 3-row dataset and a CSV of 250 KB or less stay whole in rows, byte for byte, with no pieces", async () => {
  const { w, tick, stored } = setup();
  const small = [{ id: "1", status: "open" }, { id: "2", status: "open" }, { id: "3", status: "closed" }];
  await tick(0, small);
  assert.equal(stored(1).snap.rows, JSON.stringify(small));
  const csv = permitsCsv({ rows: 3600, size: 250_000 });
  assert.ok(Buffer.byteLength(csv) <= 250_000);
  const rows = readDataset(csv).rows;
  assert.ok(bytesOf(JSON.stringify(rows)) <= INLINE_MAX, "a 250 KB CSV's rows JSON is under the inline max");
  await tick(1, csv);
  assert.equal(stored(2).snap.rows, JSON.stringify(rows));
  assert.equal(w.rows(`SELECT 1 FROM portal_snapshot_parts`).length, 0);
});

test("R10 G46 boundary: a dataset of exactly PORTAL_ROWS_INLINE_MAX bytes of JSON is inline, one byte more is in pieces; exactly PORTAL_PARSE_MAX_BYTES is read, one byte more is stated", async () => {
  const { w, follow, tick, stored } = setup();
  const sized = (n) => { const pad = n - bytesOf(JSON.stringify([{ id: "1", pad: "" }])); return JSON.stringify([{ id: "1", pad: "p".repeat(pad) }]); };
  await tick(0, sized(INLINE_MAX));
  assert.equal(bytesOf(stored(1).snap.rows), INLINE_MAX);
  assert.equal(stored(1).parts.length, 0, "at the inline max the rows are whole");
  await tick(1, sized(INLINE_MAX + 1));
  const over = stored(2);
  assert.ok(over.parts.length >= 1);
  assert.equal(joined(over), sized(INLINE_MAX + 1));
  assert.deepEqual(JSON.parse(over.snap.rows), { parts: over.parts.length, bytes: INLINE_MAX + 1, rows: 1 });
  /* the parse bound: on the capture's own byte length, before it is decoded */
  await tick(2, sized(PARSE_MAX));
  assert.ok(stored(3).snap.rows !== null && stored(3).parts.length > 1, "a capture of exactly the bound is read");
  const t = await tick(3, "p".repeat(PARSE_MAX + 1));
  assert.deepEqual(t.failed, []);
  const big = stored(4);
  assert.equal(big.snap.rows, null, "not parsed");
  assert.equal(big.parts.length, 0);
  assert.ok(big.snap.why.includes(String(PARSE_MAX + 1)) && big.snap.why.includes(String(PARSE_MAX / MIB)), `the why carries the size and the bound: ${big.snap.why}`);
  assert.ok(big.snap.capture_sha, "the capture is held whole and cited");
  assert.equal(w.f.snapshots({ follow, viewer: MEMBER }).snapshots.at(-1).why, big.snap.why, "snapshots states it");
  const d = w.f.snapshotDiff({ follow, from: 3, to: 4, viewer: MEMBER });
  assert.deepEqual(d.undetermined, [{ key: null, snapshot: 4, why: big.snap.why }], "the diff states it per snapshot");
});

test("R10 G46: a JSON dataset (features) of the same size is stored in pieces and read back whole", async () => {
  const { w, follow, tick, stored } = setup("https://data.ellery.example/resource/permits.geojson");
  const features = (changed) => JSON.stringify({ type: "FeatureCollection", features: Array.from({ length: 12000 }, (_, i) => ({ type: "Feature",
    properties: { id: String(i), status: changed && i === 7 ? "closed" : "open", note: "n".repeat(60) } })) });
  const a = features(false);
  assert.ok(Buffer.byteLength(a) > 1_000_000);
  const t = await tick(0, a);
  assert.deepEqual(t.failed, []);
  assert.deepEqual(JSON.parse(joined(stored(1))), readDataset(a).rows);
  await tick(1, features(true));
  assert.deepEqual(w.f.snapshotDiff({ follow, from: 1, to: 2, viewer: MEMBER }).changed, [{ key: "7", field: "status", before: "open", after: "closed" }]);
});

test("R10 G46: a piece never splits a surrogate pair, and the pieces join to the rows' JSON exactly", async () => {
  const { tick, stored } = setup();
  /* a 4-byte character at every boundary: pad so that a pair lies across each multiple of PORTAL_PART_CHARS */
  const emoji = "\u{1F600}";
  const rows = [{ id: "1", text: emoji.repeat(Math.ceil((INLINE_MAX * 2.2) / 4)) }];
  await tick(0, JSON.stringify(rows));
  const s = stored(1);
  assert.ok(s.parts.length >= 3);
  for (const p of s.parts) {
    assert.ok(!/[\uD800-\uDBFF]$/.test(p.chunk), "no piece ends in the first half of a pair");
    assert.ok(!/^[\uDC00-\uDFFF]/.test(p.chunk), "no piece starts with the second half");
    assert.ok(p.chunk.length <= PART_CHARS);
  }
  assert.equal(joined(s), JSON.stringify(rows));
  /* one pair across the first boundary */
  const edge = [{ id: "1", pad: "a".repeat(PART_CHARS - JSON.stringify([{ id: "1", pad: "" }]).length + 5 - 1) + emoji + "b".repeat(INLINE_MAX) }];
  await tick(1, JSON.stringify(edge));
  assert.equal(joined(stored(2)), JSON.stringify(edge));
});

test("R10 G46 repair: a capture held without its snapshot is written once on the next read; a third read answers unchanged", async () => {
  const { w, follow, tick, stored } = setup();
  const csv = permitsCsv({ rows: 3600, size: 250_000 });
  await tick(0, csv);
  /* the stored state of a follow failed for this cause: the capture held, no snapshot */
  w.st.sql.exec(`DELETE FROM portal_snapshots WHERE follow_id=?`, follow);
  const t2 = await tick(1);
  assert.equal(t2.read[0].outcome, "captured");
  assert.equal(t2.captured[0].snapshot, 1);
  assert.equal(stored(1).snap.rows, JSON.stringify(readDataset(csv).rows));
  const t3 = await tick(2);
  assert.equal(t3.read[0].outcome, "unchanged");
  assert.equal(w.rows(`SELECT 1 FROM portal_snapshots`).length, 1, "nothing written twice");
});

test("R10 G46 atomic: a throw while the second piece is written leaves neither the snapshot row nor a piece; the next read writes it", async () => {
  const { w, follow, tick, stored } = setup();
  const csv = permitsCsv();
  const exec = w.st.sql.exec;
  let pieces = 0;
  w.st.sql.exec = (q, ...a) => { if (/INSERT INTO portal_snapshot_parts/.test(q) && ++pieces === 2) throw new Error("injected"); return exec(q, ...a); };
  const t1 = await tick(0, csv);
  w.st.sql.exec = exec;
  assert.equal(pieces, 2);
  assert.equal(t1.failed.length, 1);
  assert.equal(w.rows(`SELECT 1 FROM portal_snapshots`).length, 0, "no snapshot row");
  assert.equal(w.rows(`SELECT 1 FROM portal_snapshot_parts`).length, 0, "no piece");
  const t2 = await tick(1);
  assert.equal(t2.read[0].outcome, "captured", "the capture held without its snapshot is written");
  assert.deepEqual(JSON.parse(joined(stored(1))), readDataset(csv).rows);
  assert.equal(w.f.snapshots({ follow, viewer: MEMBER }).snapshots.length, 1);
});

test("R17 G46: the pieces are a table of the follow's class and a purge of the bundle removes them with the snapshot", async () => {
  const { w, tick, stored } = setup();
  await tick(0, permitsCsv());
  const bundle = stored(1).snap.bundle_id;
  assert.ok(bundle && stored(1).parts.every((p) => true) && stored(1).parts.length > 1);
  assert.ok(w.rows(`SELECT 1 FROM portal_snapshot_parts WHERE bundle_id=?`, bundle).length > 1, "each piece carries the bundle");
  assert.ok(Following.FOLLOWING_TABLES.some((t) => t.name === "portal_snapshot_parts" && t.purge === "clear" && t.sight === "source" && t.keys.join() === "bundle_id"));
  w.record.purge({ bundleId: bundle });
  assert.equal(w.rows(`SELECT 1 FROM portal_snapshots`).length, 0);
  assert.equal(w.rows(`SELECT 1 FROM portal_snapshot_parts`).length, 0);
});

test("R10 G46: a dataset the parser rejects is stored as before, a why and no rows or pieces", async () => {
  const { w, follow, tick, stored } = setup();
  await tick(0, "<html>maintenance</html>");
  const s = stored(1);
  assert.equal(s.snap.rows, null);
  assert.equal(s.snap.why, readDataset("<html>maintenance</html>").why);
  assert.equal(s.parts.length, 0);
  assert.equal(w.f.snapshots({ follow, viewer: MEMBER }).snapshots[0].why, s.snap.why);
});
