/* acquisition R45 (T38; K2307): the `archive_entries` read contract. R38's record of an opened archive is readable by a
   later module in its own SQL (case-carriage R8 is the first): columns `archive_sha`, `idx`, `name`, `kind`, `state`,
   `sha256`; the archive's listing is its row at `idx` -1, written whole when the archive is first opened, so an archive
   with no such row has no recorded listing. At the module's interface: the table as a reader's SQL sees it, over archives
   captured and opened through `acquire` and `unpack` (fixture.mjs `run`), each row checked against what R41's
   `archiveList` answers for the same entry. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { unpack } from "../../../src/acquisition/index.mjs";
import { ARCHIVE_DEPTH_MAX } from "../../../src/ooxml.mjs";

const URL1 = "https://files.example/set.zip";
const capture = (w, bytes, url = URL1) => run(w, { [url]: () => new Response(bytes, { headers: { "content-type": "application/zip" } }) }, { locator: url });
const hold = async (w, bytes) => { await w.b.put(`bio/captures/${sha(bytes)}`, bytes);
  w.prov.recordReceipt({ address: URL1, addressNorm: URL1, captureSha: sha(bytes), retrieved: "2026-01-01T00:00:00Z", via: "direct" }); };
const ADMIN = "class:admin";
const CONTRACT = ["archive_sha", "idx", "name", "kind", "state", "sha256"];
/* a later module's own SQL, exactly as the contract states it */
const read = (w, archive) => w.rows(`SELECT archive_sha, idx, name, kind, state, sha256 FROM archive_entries WHERE archive_sha=? ORDER BY idx`, archive);
const listed = (w, archive) => w.rows(`SELECT 1 AS x FROM archive_entries WHERE archive_sha=? AND idx=-1 LIMIT 1`, archive).length === 1;
const symlinked = (bytes, k) => {
  const b = new Uint8Array(bytes);
  let seen = -1;
  for (let i = 0; i + 4 <= b.length; i++)
    if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 1 && b[i + 3] === 2 && ++seen === k) { b[i + 5] = 3; b.set([0, 0, 0xff, 0xa1], i + 38); return b; }
  return b;
};
/* R41's states as R38 records them: the screen's `folder` and `link` are the listing's `dir` and `symlink` kinds */
const KIND_OF = { folder: "dir", link: "symlink" };

test("R45: the table carries the contract's columns, each readable by name in a later module's own SQL", () => {
  const w = world();
  const cols = w.rows("SELECT name FROM pragma_table_info('archive_entries')").map((r) => r.name);
  for (const c of CONTRACT) assert.ok(cols.includes(c), `column ${c}`);
  /* the archive's own key: one row per (archive_sha, idx) */
  const pk = w.rows("SELECT name, pk FROM pragma_table_info('archive_entries') WHERE pk > 0 ORDER BY pk").map((r) => r.name);
  assert.deepEqual(pk, ["archive_sha", "idx"]);
});

test("R45: an opened archive is its row at idx -1 and one row per entry of its listing, idx 0…n-1, each with the entry's name and kind as the listing states them, its state as R38 recorded it, and sha256 the file's digest exactly when filed or already held; every row agrees with R41's answer", async () => {
  const w = world();
  const inner = makeZip([{ name: "inner.txt", data: "deep" }]);
  const z = symlinked(makeZip([
    { name: "dir/", data: "", method: 0 }, { name: "a.txt", data: "same" }, { name: "b.txt", data: "same" },
    { name: "locked", data: "x", encrypted: "traditional" }, { name: "ln", data: "a.txt", method: 0 },
    { name: "Résumé.txt", data: "cv" }, { name: "n.zip", data: inner },
  ]), 4);
  const c = await capture(w, z);
  assert.equal(c.body.unpack.ok, true, "opened on capture (R40)");
  const rows = read(w, sha(z));
  assert.equal(listed(w, sha(z)), true, "its listing is recorded: the row at idx -1");
  assert.deepEqual(rows.map((r) => r.idx), [-1, 0, 1, 2, 3, 4, 5, 6], "the listing row, then every entry in index order, once each");
  for (const r of rows) assert.equal(r.archive_sha, sha(z));
  const l = await w.acq.archiveList({ archiveSha: sha(z), viewer: ADMIN });
  assert.equal(l.entries.length, rows.length - 1);
  for (const [r, e] of rows.slice(1).map((r, i) => [r, l.entries[i]])) {
    const at = `entry ${r.idx}`;
    assert.equal(r.idx, e.index, at);
    assert.equal(r.name, e.name, `${at}: its name exactly as the listing states it`);
    assert.equal(r.kind, e.kind, at);
    assert.equal(r.state, e.state, `${at}: R38's outcome`);
    if (KIND_OF[e.state]) assert.equal(r.kind, KIND_OF[e.state], at);
    else assert.equal(r.kind, "file", at);
    if (e.state === "filed" || e.state === "already_held") assert.equal(r.sha256, e.sha256, `${at}: the file's digest`);
    else assert.equal(r.sha256, null, `${at}: no file, no digest`);
  }
  assert.deepEqual(rows.slice(1).map((r) => [r.name, r.kind, r.state, r.sha256]), [
    ["dir/", "dir", "folder", null], ["a.txt", "file", "filed", sha("same")], ["b.txt", "file", "already_held", sha("same")],
    ["locked", "file", "not_filed", null], ["ln", "symlink", "link", null], ["Résumé.txt", "file", "filed", sha("cv")],
    ["n.zip", "file", "filed", sha(inner)],
  ]);
  /* a filed file that is itself an archive is read the same way once opened: its sha256 is an archive_sha with its own listing */
  assert.equal(listed(w, sha(inner)), false, "not yet opened, so no recorded listing");
  const u = await unpack(w.store, { archiveSha: sha(inner), cls: "daemon" });
  assert.equal(u.ok, true);
  assert.deepEqual(read(w, sha(inner)).map((r) => [r.idx, r.name, r.kind, r.state, r.sha256]),
                   [[-1, null, null, "opened", null], [0, "inner.txt", "file", "filed", sha("deep")]]);
});

test("R45: the listing is written whole when the archive is first opened: every entry has its row (waiting, no digest) before it is cut, and later calls add no row and remove none", async () => {
  const w = world();
  const n = 103;
  const z = makeZip(Array.from({ length: n }, (_, i) => ({ name: `f${i}`, data: `d${i}` })));
  const c = await capture(w, z);
  assert.equal(c.body.unpack.waiting, n - 100, "one call cuts at most UNPACK_CALL_ENTRIES (R40)");
  let rows = read(w, sha(z));
  assert.deepEqual(rows.map((r) => r.idx), [-1, ...Array.from({ length: n }, (_, i) => i)], "every entry is recorded at the first opening");
  assert.deepEqual(rows.slice(1, 101).map((r) => [r.state, r.sha256]), Array.from({ length: 100 }, (_, i) => ["filed", sha(`d${i}`)]));
  assert.deepEqual(rows.slice(101).map((r) => [r.name, r.kind, r.state, r.sha256]), [[`f100`, "file", "waiting", null], [`f101`, "file", "waiting", null], [`f102`, "file", "waiting", null]],
                   "an entry not yet reached is listed, waiting, with no digest");
  const u = await unpack(w.store, { archiveSha: sha(z), by: "member:m1", cls: "member", member: true });
  assert.deepEqual([u.ok, u.complete], [true, true]);
  rows = read(w, sha(z));
  assert.deepEqual(rows.map((r) => r.idx), [-1, ...Array.from({ length: n }, (_, i) => i)], "no row added or removed by a later call");
  assert.deepEqual(rows.slice(101).map((r) => [r.state, r.sha256]), [100, 101, 102].map((i) => ["filed", sha(`d${i}`)]), "the outcome is recorded in the entry's own row");
  /* no entry row exists without its listing row, in the whole table */
  assert.deepEqual(w.rows(`SELECT DISTINCT archive_sha FROM archive_entries e WHERE idx >= 0
                           AND NOT EXISTS (SELECT 1 FROM archive_entries h WHERE h.archive_sha = e.archive_sha AND h.idx = -1)`), []);
});

test("R45: an archive with no row at idx -1 has no recorded listing: one held but never opened, one refused whole, one past the depth bound and a capture that is not an archive leave no row at all; an opened one is the negative control", async () => {
  const w = world();
  const none = (bytes, what) => assert.deepEqual(read(w, sha(bytes)), [], `${what}: no row, so no recorded listing`);
  /* held, never opened: R41 still answers it from the listing as it reads now, and records nothing */
  const plain = makeZip([{ name: "a", data: "a" }, { name: "b", data: "b" }]);
  await hold(w, plain);
  assert.equal((await w.acq.archiveList({ archiveSha: sha(plain), viewer: ADMIN })).archive.opened, false);
  none(plain, "held, never opened");
  /* refused whole (R38's ARCHIVE_AMBIGUOUS: overlapping entries): nothing is opened */
  const amb = makeZip([{ name: "a", data: "aaaa" }, { name: "b", sameDataAs: 0 }]);
  await hold(w, amb);
  const r = await unpack(w.store, { archiveSha: sha(amb), by: "member:m1", cls: "member", member: true });
  assert.deepEqual([r.ok, r.code], [false, "ARCHIVE_AMBIGUOUS"]);
  none(amb, "refused whole");
  /* not an archive (R38's NOT_AN_ARCHIVE): nothing is listed */
  const words = new TextEncoder().encode("just words");
  await hold(w, words);
  assert.equal((await unpack(w.store, { archiveSha: sha(words), by: "member:m1", cls: "member", member: true })).code, "NOT_AN_ARCHIVE");
  none(words, "not an archive");
  /* past ARCHIVE_DEPTH_MAX (R40): filed as a file and never opened */
  const leaf = makeZip([{ name: "leaf", data: "l" }]);
  let nest = leaf;
  for (let i = 0; i < ARCHIVE_DEPTH_MAX; i++) nest = makeZip([{ name: `n${i}.zip`, data: nest }]);
  const w2 = world();
  let u = (await capture(w2, nest, "https://files.example/nest.zip")).body.unpack;
  while (u.nested.length && u.nested[0] !== sha(leaf)) u = await unpack(w2.store, { archiveSha: u.nested[0], cls: "daemon" });
  assert.equal(u.nested[0], sha(leaf), "the archive at depth ARCHIVE_DEPTH_MAX + 1 is filed");
  const deep = await unpack(w2.store, { archiveSha: sha(leaf), by: "member:m1", cls: "member", member: true });
  assert.equal(deep.waiting_on.code, "ARCHIVE_DEPTH_MAX");
  assert.deepEqual(read(w2, sha(leaf)), [], "past the depth bound: no row, so no recorded listing");
  assert.equal(listed(w2, sha(nest)), true, "its outermost archive was opened");
  /* negative control: the same plain archive, once opened, has its listing row */
  await unpack(w.store, { archiveSha: sha(plain), by: "member:m1", cls: "member", member: true });
  assert.deepEqual(read(w, sha(plain)).map((x) => [x.idx, x.state]), [[-1, "opened"], [0, "filed"], [1, "filed"]]);
});
