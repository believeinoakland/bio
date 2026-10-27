/* capture, T51 fix round 7, G78 (R77 amended; the walker's A.md:38: `heldcaptures` with a project filter, 16 rows, 7.4 s): a page of captures held in
   parts asks the evidence store for a `head` of each whole at every draw. An object proven held is immutable once it exists, so a digest whose `head`
   answered POSITIVE is not asked again by this instance; an answer that was negative or unknown is asked at every draw, and the register is never the
   source of "held" (a whole can be owed, or never kept: `keep_pending`). At the module's interface, `heldCaptures`, over a store whose `head` is counted. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bucket, sha } from "./fixture.mjs";
import { MULTIPART_KEEP_MAX } from "../../../src/acquisition/index.mjs";
import { Capture } from "../../../src/capture/index.mjs";

const ADMIN = "class:admin";
const NOW = "2026-10-23T00:00:00Z";
const keyOf = (d) => `bio/captures/${d}`;

function world() {
  const b = bucket();
  const heads = [];
  const head = b.head.bind(b);
  b.head = async (k) => { heads.push(k); return head(k); };
  const f = fresh({ evidence: b, env: { INSTANCE_NAME: "inst", VERSION: "9.9.9" } });
  /* provenance's register, with the `whole` column its R72 adds: a multipart capture is a `whole` row beside its parts' rows */
  f.s.db.exec(`ALTER TABLE register ADD COLUMN whole INTEGER`);
  return { ...f, b, heads };
}
/* a capture held in parts: the register's whole row (the digest of the whole, `bytes` its size) and part rows; `inStore` says whether the evidence store holds
   an object under the whole's digest (a keep that ran), as against only the parts (a keep owed, or never made) */
let n = 0;
function inParts(w, { size, inStore }) {
  const i = n++;
  const whole = sha(`whole ${i}`);
  const parts = [sha(`part a ${i}`), sha(`part b ${i}`)];
  const id = `INFO-${String(1000 + i).padStart(4, "0")}`;
  const created = `2026-10-${String(1 + (i % 20)).padStart(2, "0")}T00:00:00Z`;
  w.s.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha, row_version, project)
                VALUES (?, 'information', 'g', ?, 'collected', ?, ?, 'x', 1, 'PRJ-1')`, id, `title ${id}`, created, created);
  w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes, whole) VALUES (?, ?, 'x', ?, 1)`, whole, id, size);
  for (const p of parts) w.s.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, bytes, whole) VALUES (?, ?, 'x', ?, 0)`, p, id, size / 2);
  w.s.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, 'data/provenance.json', ?, NULL, 1, 'x')`,
               id, JSON.stringify({ documents: [{ capture: { sha256: whole }, parts: parts.map((p) => ({ sha256: p, bytes: size / 2 })), profile: { format: { format: "pdf" } } }] }));
  if (inStore) w.b.held.set(keyOf(whole), new Uint8Array([1, 2, 3]));
  return { id, whole };
}
const draw = (w, extra = {}) => w.c.heldCaptures({ viewer: ADMIN, project: "PRJ-1", limit: 500, now: NOW, ...extra });
const MiB = 1024 * 1024;

test("R77 (G78): sixteen captures held in parts: the second draw makes no `head` for a digest whose `head` answered positive, and the answer is the first draw's byte for byte", async () => {
  const w = world();
  const docs = Array.from({ length: 16 }, () => inParts(w, { size: 20 * MiB, inStore: true }));
  const first = await draw(w);
  assert.equal(first.held.length, 16);
  assert.equal(w.heads.filter((k) => docs.some((d) => keyOf(d.whole) === k)).length, 16, "the first draw asks for each whole once");
  assert.ok(first.held.every((r) => r.whole === true));
  w.heads.length = 0;
  const second = await draw(w);
  assert.equal(w.heads.length, 0, "an object proven held is not asked again");
  assert.equal(JSON.stringify(second), JSON.stringify(first), "and the answer is unchanged");
});

test("R77 (G78): an answer that was negative is asked at every draw, and a whole made since reads true at the next one; the register's `whole` row never makes it true", async () => {
  const w = world();
  const gone = inParts(w, { size: MULTIPART_KEEP_MAX + 5 * MiB, inStore: false });
  const kept = inParts(w, { size: 20 * MiB, inStore: true });
  const rowsOf = (r) => new Map(r.held.map((x) => [x.bundle_id, x.whole]));
  let r = await draw(w);
  assert.equal(rowsOf(r).get(gone.id), false, "the register says whole, the store holds none: not whole");
  assert.equal(rowsOf(r).get(kept.id), true);
  w.heads.length = 0;
  r = await draw(w);
  assert.deepEqual(w.heads, [keyOf(gone.whole)], "only the negative is asked again");
  assert.equal(rowsOf(r).get(gone.id), false, "still false: the register's `whole` row is not the source");
  /* the keep ran meanwhile (the plane's alarm, R103) */
  w.b.held.set(keyOf(gone.whole), new Uint8Array([9]));
  r = await draw(w);
  assert.equal(rowsOf(r).get(gone.id), true, "a whole made since is seen at the next draw");
  w.heads.length = 0;
  await draw(w);
  assert.equal(w.heads.length, 0, "and now remembered");
});

test("R77 (G78 controls): an unknown answer (a head that fails) is not remembered; a store that holds nothing is asked again; the picker row asks the store nothing", async () => {
  const w = world();
  const d = inParts(w, { size: 20 * MiB, inStore: true });
  const head = w.b.head.bind(w.b);
  let fail = true;
  w.b.head = async (k) => { w.heads.push(k); if (fail) throw new Error("store down"); return head(k); };
  let r = await draw(w);
  assert.equal(r.held[0].whole, null, "a head that fails is unknown");
  fail = false; w.heads.length = 0;
  r = await draw(w);
  assert.equal(r.held[0].whole, true);
  assert.ok(w.heads.includes(keyOf(d.whole)), "the unknown was asked again");
  w.heads.length = 0;
  const picker = await draw(w, { fields: "picker" });
  assert.equal(w.heads.length, 0);
  assert.ok(picker.held.length === 1 && d.id === picker.held[0].bundle_id);
});

test("R77 (G78): the memory of held objects is bounded: past HELD_PROVEN_MAX it is emptied and fills again, and every draw is still right", async () => {
  const { HELD_PROVEN_MAX } = await import("../../../src/capture/index.mjs");
  const w = world();
  const total = HELD_PROVEN_MAX + 100;
  const docs = Array.from({ length: total }, () => inParts(w, { size: 20 * MiB, inStore: true }));
  let after = null, drawn = 0;
  const firstPage = [];
  for (;;) {
    const r = await draw(w, { limit: 1000, ...(after ? { after } : {}), sort: "project" });
    assert.ok(r.held.every((x) => x.whole === true));
    if (!after) firstPage.push(...r.held.map((x) => x.bundle_id));
    drawn += r.held.length;
    if (!r.next) break;
    after = r.next;
  }
  assert.equal(drawn, total);
  w.heads.length = 0;
  const again = await draw(w, { limit: 1000, sort: "project" });
  assert.ok(again.held.every((x) => x.whole === true));
  assert.ok(w.heads.length > 0, "the set was emptied when it filled, so the first page is asked again");
  assert.ok(w.heads.length < 1000 + 1, "and only what it forgot");
  assert.ok(docs.length === total);
});
