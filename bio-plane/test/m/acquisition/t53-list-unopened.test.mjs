/* acquisition R41 (T53; FILE-SAFETY's finding, K5706; P9): `archiveList` of an archive no unpack has opened reads its listing from the central directory by ranges, never the whole
   object, up to the upload ceiling: a 104 MiB ZIP held whole as one object is never loaded (before, one 104 MiB read and its copies, about 313 MiB above idle). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, run, sha } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";

test("R41: an unopened archive held whole as one object is listed by range reads only; the listing is the one it gave before", async () => {
  const w = world();
  w.rows("CREATE TABLE IF NOT EXISTS members (member_id TEXT PRIMARY KEY, role TEXT, status TEXT)");
  w.rows("CREATE TABLE IF NOT EXISTS project_participants (project_id TEXT, member_id TEXT)");
  w.rows("CREATE TABLE IF NOT EXISTS project_sight (project_id TEXT PRIMARY KEY, setting TEXT)");
  const big = new Uint8Array(104 * 1024 * 1024).map((_, i) => (i * 2654435761) >>> 24);
  const z = makeZip([{ name: "big.bin", data: big, method: 0 }, { name: "s.txt", data: "s" }]);
  const url = "https://files.example/big.zip";
  await run(w, { [url]: () => new Response(z, { headers: { "content-type": "application/zip" } }) }, { locator: url });
  w.rows(`INSERT INTO bundles (bundle_id, object_type, group_id, current_state, created, last_updated, bundle_sha, project) VALUES ('B1', 'information', 'g', 'collected', 'T', 'T', 'x', NULL)`);
  w.prov.homes[sha(z)] = "B1";
  delete w.prov.named[sha(z)];
  await w.core.evidenceStore().put(sha(z), z);   // held whole, one object
  w.rows("DELETE FROM archive_entries");           // never opened
  w.b.calls.length = 0;
  const r = await w.acq.archiveList({ archiveSha: sha(z), viewer: "class:admin" });
  assert.equal(r.ok, true);
  assert.deepEqual(r.entries.map((e) => e.name), ["big.bin", "s.txt"]);
  assert.equal(r.archive.opened, false);
  const whole = w.b.calls.filter((c) => c[0] === "get" && !(c[2] && c[2].range));
  assert.deepEqual(whole, [], "no read of the whole object");
  assert.ok(w.b.calls.filter((c) => c[0] === "get").every((c) => c[2].range.length <= 1024 * 1024 + 64), "each read a window");
});
