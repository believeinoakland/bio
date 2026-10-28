/* file-safety R57, R56, R51 (T53-510; K5704): above `file_safety.grade_read` a container is graded by its directory read by ranges, never the whole file: an
   office package as before, and a ZIP no unpack has opened without asking acquisition to list it (which profiles an unopened archive whole). Sized from the
   table's active figure, so it holds at any figure. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { GRADE_READ_MAX } from "../../../src/file-safety/index.mjs";

test("R57 R56 (T53-510): a ZIP above GRADE_READ_MAX that no unpack has opened is graded from its central directory: high, not opened, an encrypted member seen, and acquisition is not asked to list it; no read of its bytes is whole", async () => {
  const w = world();
  const loads = [];
  const get = w.bucket.get.bind(w.bucket);
  w.bucket.get = async (k, opts) => {
    const o = await get(k, opts);
    return o && { ...o, arrayBuffer: async () => { if (!(opts && opts.range) || opts.range.length >= o.size) loads.push(k); return o.arrayBuffer(); } };
  };
  let listed = 0;
  const list = w.acq.archiveList.bind(w.acq);
  w.acq.archiveList = (...a) => { listed++; return list(...a); };
  const zip = makeZip([{ name: "pad.bin", data: new Uint8Array(GRADE_READ_MAX + 1), method: 0 }, { name: "b.txt", data: "hello" }]);
  const s = await w.capture(zip);
  const g = await w.fs.threatOf({ captureSha: s, viewer: "member:m1" });
  assert.deepEqual([g.format, g.threat, g.reasons.map((r) => r.code)], ["zip", "high", ["archive_not_opened"]]);
  assert.equal(g.archive.opened, false);
  assert.equal(g.archive.entries, 2, "the directory is read");
  assert.deepEqual(loads, [], "the whole was never loaded");
  assert.equal(listed, 0, "acquisition was not asked to list it");
  const st = await w.fs.originalState({ captureSha: s, viewer: "member:m1" });
  assert.equal(st.may_open, true);
  assert.deepEqual(loads, []);
});
