/* acquisition R40 (K1852 (2); F7; K1881, K1940): when an archive opens, and how far: the per-call share, the whole tree's
   limits counted from the outermost archive, the depth bound, and the day's budget for automatic opening, each exported
   by its name and named, with its figure, by every wait. At the module's interface: `acquire` (the automatic run) and
   `unpack(store, {archiveSha, by, cls})`. A tree or a day already near its limit is set up by writing the count the
   module keeps (`archive_entries`' outermost row, `unpack_days`), as a store that has run that long would hold it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { makeZip, nestedZip } from "../../make-zip.mjs";
import { unpack, ARCHIVE_CHECKS, UNPACK_CALL_ENTRIES, UNPACK_CALL_BYTES, UNPACK_DAILY_BYTES, UNPACK_DAILY_ENTRIES,
         UNPACK_LIMITS } from "../../../src/acquisition/index.mjs";
import * as acquisition from "../../../src/acquisition/index.mjs";
import { ARCHIVE_DEPTH_MAX, ARCHIVE_TREE_TOTAL_MAX, ARCHIVE_TREE_ENTRIES_MAX } from "../../../src/ooxml.mjs";

const URL1 = "https://files.example/many.zip";
const capture = (w, bytes, url = URL1) => run(w, { [url]: () => new Response(bytes, { headers: { "content-type": "application/zip" } }) }, { locator: url });
const many = (n, tag = "f") => makeZip(Array.from({ length: n }, (_, i) => ({ name: `${tag}${i}.txt`, data: `${tag} ${i}` })));
const today = () => new Date().toISOString().slice(0, 10);
const MEMBER = { by: "m1", cls: "member" }, DAEMON = { cls: "daemon" };
const waitingOn = (w, s) => w.rows("SELECT DISTINCT limit_name FROM archive_entries WHERE archive_sha=? AND idx>=0 AND state='waiting'", s).map((r) => r.limit_name);

test("R40: each figure is exported by its name, as K1940 set them, and together as UNPACK_LIMITS; the tree and depth figures are ooxml's", () => {
  assert.deepEqual([UNPACK_CALL_ENTRIES, UNPACK_CALL_BYTES, UNPACK_DAILY_BYTES, UNPACK_DAILY_ENTRIES], [100, 67108864, 1073741824, 40000]);
  assert.deepEqual({ ...UNPACK_LIMITS }, { UNPACK_CALL_ENTRIES, UNPACK_CALL_BYTES, UNPACK_DAILY_BYTES, UNPACK_DAILY_ENTRIES });
  assert.ok(Object.isFrozen(UNPACK_LIMITS));
  for (const k of Object.keys(UNPACK_LIMITS)) assert.equal(acquisition[k], UNPACK_LIMITS[k], k);
  assert.deepEqual([ARCHIVE_DEPTH_MAX, ARCHIVE_TREE_TOTAL_MAX, ARCHIVE_TREE_ENTRIES_MAX], [3, 268435456, 10000]);
});

test("R40: one call cuts at most UNPACK_CALL_ENTRIES entries; the rest wait for the next call (no limit named), the automatic run asks the queue to continue, and a member's op=unpack finishes it", async () => {
  const w = world();
  const z = many(150);
  const r = await capture(w, z);
  const u = r.body.unpack;
  assert.deepEqual([u.ok, u.documents.length, u.waiting, u.complete, "waiting_on" in u], [true, UNPACK_CALL_ENTRIES, 50, false, false]);
  assert.deepEqual(waitingOn(w, sha(z)), [null], "waiting only for the next call");
  assert.deepEqual(w.store.state.events.filter((e) => e.kind === "archive-unpack").map((e) => e.captureSha), [sha(z)], "the driver is asked once");
  const m = await unpack(w.store, { archiveSha: sha(z), ...MEMBER });
  assert.deepEqual([m.documents.length, m.waiting, m.complete], [50, 0, true]);
  assert.deepEqual(m.documents.map((d) => d.container.index), Array.from({ length: 50 }, (_, i) => 100 + i), "resumed from the first entry with no outcome");
  /* negative control: an archive within one call's share is complete in one call, and asks no continuation */
  const w2 = world();
  const r2 = await capture(w2, many(UNPACK_CALL_ENTRIES));
  assert.deepEqual([r2.body.unpack.complete, w2.store.state.events.filter((e) => e.kind === "archive-unpack").length], [true, 0]);
});

test("R40: one call cuts at most UNPACK_CALL_BYTES declared uncompressed; the first cut of a call always fits, so no file waits for ever on the share", async () => {
  const w = world();
  const big = 40 * 1024 * 1024;
  const z = makeZip([{ name: "a.bin", data: new Uint8Array(big) }, { name: "b.bin", data: new Uint8Array(big).fill(1) }]);
  const r = await capture(w, z);
  assert.deepEqual([r.body.unpack.documents.length, r.body.unpack.waiting], [1, 1], "40 + 40 MiB is over the 64 MiB share");
  const m = await unpack(w.store, { archiveSha: sha(z), ...MEMBER });
  assert.deepEqual([m.documents.length, m.complete], [1, true]);
  assert.equal(m.documents[0].capture.bytes, big);
});

test("R40: the whole tree under the outermost archive is held to ARCHIVE_TREE_ENTRIES_MAX and ARCHIVE_TREE_TOTAL_MAX for an automatic run, which stops with the rest waiting on that name and figure; a member's op=unpack goes past both", async () => {
  for (const [col, name, figure] of [["tree_entries", "ARCHIVE_TREE_ENTRIES_MAX", ARCHIVE_TREE_ENTRIES_MAX], ["tree_bytes", "ARCHIVE_TREE_TOTAL_MAX", ARCHIVE_TREE_TOTAL_MAX]]) {
    const w = world();
    const z = many(150, name);
    await capture(w, z);
    /* the tree has already spent all but one entry, or all but one byte, of its share */
    w.rows(`UPDATE archive_entries SET ${col}=? WHERE archive_sha=? AND idx=-1`, figure - 1, sha(z));
    const d = await unpack(w.store, { archiveSha: sha(z), ...DAEMON });
    assert.equal(d.ok, true);
    assert.ok(d.documents.length <= 1, `${name}: at most what fits`);
    assert.deepEqual([d.complete, d.waiting_on.code, d.waiting_on.limit, d.waiting_on.check, d.waiting_on.translation],
                     [false, name, figure, ARCHIVE_CHECKS[name].check, ARCHIVE_CHECKS[name].translation], name);
    assert.deepEqual(waitingOn(w, sha(z)), [name], "each waiting entry names it");
    const m = await unpack(w.store, { archiveSha: sha(z), ...MEMBER });
    assert.deepEqual([m.complete, "waiting_on" in m], [true, false], `${name}: a member goes past it`);
    assert.deepEqual(waitingOn(w, sha(z)), []);
  }
});

test("R40: a file that is itself an archive counts towards the archive it was cut from: a nested archive opened by the daemon spends the outermost archive's tree", async () => {
  const w = world();
  const inner = many(5, "in");
  const outer = makeZip([{ name: "inner.zip", data: inner }, { name: "x.txt", data: "x" }]);
  const r = await capture(w, outer);
  assert.deepEqual(r.body.unpack.nested, [sha(inner)]);
  assert.ok(w.store.state.events.some((e) => e.kind === "archive-unpack" && e.captureSha === sha(inner)), "the nested archive is queued");
  assert.equal(w.rows("SELECT tree_entries FROM archive_entries WHERE archive_sha=? AND idx=-1", sha(outer))[0].tree_entries, 2, "the outer archive's own two cuts");
  /* three entries of room left in the outermost tree: the nested archive's cuts spend it, then wait */
  w.rows("UPDATE archive_entries SET tree_entries=? WHERE archive_sha=? AND idx=-1", ARCHIVE_TREE_ENTRIES_MAX - 3, sha(outer));
  const d = await unpack(w.store, { archiveSha: sha(inner), ...DAEMON });
  assert.deepEqual([d.documents.length, d.waiting, d.waiting_on.code], [3, 2, "ARCHIVE_TREE_ENTRIES_MAX"]);
  assert.equal(w.rows("SELECT tree_entries FROM archive_entries WHERE archive_sha=? AND idx=-1", sha(outer))[0].tree_entries,
               ARCHIVE_TREE_ENTRIES_MAX, "counted on the outermost archive");
  assert.equal(w.rows("SELECT COUNT(*) AS n FROM archive_entries WHERE archive_sha=? AND idx=-1 AND tree_entries>0", sha(inner))[0].n, 0,
               "never on the nested one");
  /* negative control: with room in the outermost tree, the nested archive opens whole */
  w.rows("UPDATE archive_entries SET tree_entries=0 WHERE archive_sha=? AND idx=-1", sha(outer));
  const again = await unpack(w.store, { archiveSha: sha(inner), ...DAEMON });
  assert.deepEqual([again.documents.length, again.complete], [2, true]);
  assert.equal(again.documents[0].locator, `${URL1}#zip:0#zip:3`, "a nested file's address is under its archive's");
});

test("R40: an archive opens only at a depth of at most ARCHIVE_DEPTH_MAX, the outermost at 1; a deeper one is kept as a file, its entries waiting on that name and figure, whoever asks", async () => {
  const w = world();
  const z = nestedZip({ depth: ARCHIVE_DEPTH_MAX + 1, fanout: 1, leaf: new TextEncoder().encode("leaf") });
  let r = (await capture(w, z)).body.unpack;
  const seen = [sha(z)];
  for (let level = 2; level <= ARCHIVE_DEPTH_MAX; level++) {
    assert.equal(r.nested.length, 1, `level ${level - 1} files the next archive`);
    seen.push(r.nested[0]);
    r = await unpack(w.store, { archiveSha: r.nested[0], ...DAEMON });
    assert.equal(r.ok, true);
  }
  /* the archive at depth ARCHIVE_DEPTH_MAX + 1 is filed as a file */
  assert.equal(r.nested.length, 1);
  const deepest = r.nested[0];
  assert.equal(w.store.state.events.some((e) => e.captureSha === deepest), false, "nothing queues an archive past the depth bound");
  for (const who of [DAEMON, MEMBER]) {
    const d = await unpack(w.store, { archiveSha: deepest, ...who });
    assert.deepEqual([d.ok, d.documents.length, d.complete, d.waiting_on.code, d.waiting_on.limit],
                     [true, 0, false, "ARCHIVE_DEPTH_MAX", ARCHIVE_DEPTH_MAX], JSON.stringify(who));
  }
  assert.equal(w.rows("SELECT COUNT(*) AS n FROM archive_entries WHERE archive_sha=?", deepest)[0].n, 0, "nothing of it is recorded as opened");
  const l = await w.acq.archiveList({ archiveSha: deepest, viewer: "class:admin" });
  assert.deepEqual([l.archive.opened, l.entries.map((e) => e.waiting_on)], [false, ["ARCHIVE_DEPTH_MAX"]]);
  /* negative control: the archive at depth ARCHIVE_DEPTH_MAX opened */
  assert.equal(w.rows("SELECT depth FROM archive_entries WHERE archive_sha=? AND idx=-1", seen[ARCHIVE_DEPTH_MAX - 1])[0].depth, ARCHIVE_DEPTH_MAX);
});

test("R40: automatic opening is held to UNPACK_DAILY_ENTRIES and UNPACK_DAILY_BYTES each UTC day over every archive; past either, the run stops and waits on that name and figure; a member's op=unpack goes past it and counts towards the day", async () => {
  for (const [col, name, figure] of [["entries", "UNPACK_DAILY_ENTRIES", UNPACK_DAILY_ENTRIES], ["bytes", "UNPACK_DAILY_BYTES", UNPACK_DAILY_BYTES]]) {
    const w = world();
    w.rows("INSERT INTO unpack_days (day, entries, bytes) VALUES (?, 0, 0)", today());
    w.rows(`UPDATE unpack_days SET ${col}=? WHERE day=?`, figure, today());
    const z = many(3, name);
    const r = await capture(w, z);
    assert.equal(r.status, 200, "the capture is filed whatever the budget");
    assert.deepEqual([r.body.unpack.documents.length, r.body.unpack.waiting, r.body.unpack.waiting_on.code, r.body.unpack.waiting_on.limit],
                     [0, 3, name, figure], name);
    assert.deepEqual(waitingOn(w, sha(z)), [name]);
    const before = w.rows("SELECT entries FROM unpack_days WHERE day=?", today())[0].entries;
    const m = await unpack(w.store, { archiveSha: sha(z), ...MEMBER });
    assert.deepEqual([m.documents.length, m.complete], [3, true], `${name}: a member goes past it`);
    assert.equal(w.rows("SELECT entries FROM unpack_days WHERE day=?", today())[0].entries, before + 3, "and counts towards the day");
  }
  /* negative control: a day with room opens automatically, and counts what it cut */
  const w = world();
  const z = many(3, "ok");
  const r = await capture(w, z);
  assert.deepEqual([r.body.unpack.documents.length, r.body.unpack.complete], [3, true]);
  assert.equal(w.rows("SELECT entries FROM unpack_days WHERE day=?", today())[0].entries, 3);
});
