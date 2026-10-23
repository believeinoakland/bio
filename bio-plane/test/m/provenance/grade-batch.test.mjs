/* provenance: the capture axis for a list of captures in one read (T51, K4323, C14's bound; proposed R71). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, sha, V } from "./fixture.mjs";
import { ARCHIVE_VIA, DOORBELL_VIA, UPLOAD_VIA, UNPACKED_VIA } from "../../../src/provenance/index.mjs";

const T = "2026-09-27T01:00:00Z";

/* A world holding one capture of every route the axis grades, an archive and a file cut out of it, a member's
   testimony, and a digest the record never saw. */
function mixed() {
  const w = world();
  const s = {
    direct: sha("direct"), archive: sha("archive"), knock: sha("knock"), upload: sha("upload"), zip: sha("zip"),
    file: sha("file-in-zip"), unruled: sha("unruled"), unknown: sha("never seen"),
  };
  w.prov.recordReceipt({ addressNorm: "e.org/d", captureSha: s.direct, retrieved: T });
  w.prov.recordReceipt({ addressNorm: "e.org/a", captureSha: s.archive, retrieved: T, via: ARCHIVE_VIA });
  w.prov.recordReceipt({ addressNorm: "e.org/k", captureSha: s.knock, retrieved: T, via: DOORBELL_VIA });
  w.prov.recordReceipt({ addressNorm: "e.org/u", captureSha: s.upload, retrieved: T, via: UPLOAD_VIA });
  w.prov.recordReceipt({ addressNorm: "e.org/x", captureSha: s.unruled, retrieved: T, via: "elsewhere" });
  w.prov.recordReceipt({ addressNorm: "e.org/z.zip", captureSha: s.zip, retrieved: T });
  w.prov.recordReceipt({ addressNorm: "e.org/z.zip#zip:0", captureSha: s.file, retrieved: T, via: UNPACKED_VIA,
                         retrievalLocator: `zip:${s.zip}!0` });
  s.testimony = w.prov.testify({ words: "I was there.", observedAt: "2026-09-20", author: V("ruth") }).capture_sha;
  return { w, s };
}

/* The reads a call makes: every statement the storage is asked to run. */
function reads(w, fn) {
  const sql = w.st.sql, exec = sql.exec;
  let n = 0;
  sql.exec = (...a) => { n++; return exec.apply(sql, a); };
  try { return { out: fn(), n }; } finally { sql.exec = exec; }
}

test("R71: captureGrades answers, for every digest asked and in order, exactly what captureGrade answers", () => {
  const { w, s } = mixed();
  const asked = [s.file, s.direct, s.testimony, s.knock, s.archive, s.unruled, s.upload, s.zip, s.direct,
                 `sha256:${s.archive.toUpperCase()}`, s.unknown];
  assert.deepEqual(w.prov.captureGrades(asked), asked.map((x) => w.prov.captureGrade(x)));
  assert.equal(w.prov.captureGrades(asked)[0].route, "unpacked", "the cut-out file answers its archive's answer (R59)");
  assert.equal(w.prov.captureGrades(asked)[2].basis, "CAPTURE_AXIS_AUTHORED");
});

test("R71: a list costs one read, not one per capture; control: the per-capture call reads every time", () => {
  const { w, s } = mixed();
  const plain = [s.direct, s.archive, s.knock, s.upload, s.unruled, s.testimony, s.unknown];
  const batch = reads(w, () => w.prov.captureGrades(plain));
  assert.equal(batch.n, 1);
  assert.equal(reads(w, () => w.prov.captureGrades([s.direct])).n, 1, "a batch of one reads once too");
  const each = reads(w, () => plain.map((x) => w.prov.captureGrade(x)));
  assert.ok(each.n >= plain.length, `${each.n} reads for ${plain.length} captures, one at least each`);
  /* A file cut out of an archive reads its archive's rows too: one more read per level of archive, never one per capture. */
  assert.equal(reads(w, () => w.prov.captureGrades([...plain, s.file])).n, 2);
  assert.equal(reads(w, () => w.prov.captureGrades([...plain, s.file, s.zip])).n, 1, "the archive asked beside its file is already read");
});

test("R71: control: an unknown digest, a malformed one and a value that is no list answer as captureGrade answers", () => {
  const { w, s } = mixed();
  const odd = [s.unknown, "not-a-digest", "", null, undefined, 7];
  assert.deepEqual(w.prov.captureGrades(odd), odd.map((x) => w.prov.captureGrade(x)));
  assert.equal(w.prov.captureGrades([s.unknown])[0].basis, "CAPTURE_ROUTE_UNRECORDED");
  assert.deepEqual(w.prov.captureGrades([]), []);
  for (const bad of [null, undefined, "abc", 3, {}]) assert.deepEqual(w.prov.captureGrades(bad), []);
});
