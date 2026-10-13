/* case-carriage — the marker a copy carries (R22; T47, N953, case-grammar R31). Each answer naming a copy a case carries
   in place of its original also answers the row's `obscured` object whole, `kind` its marker: R10's `photoMarks` (and
   R9's and R14's answers, as R10 answers after the act) for a photo's copy, R16's `documentCopy` for a member
   document's cleaned copy. Every other field is unchanged, and an answer naming no copy carries no `obscured`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, makePng, V, NOW, sha } from "./fixture.mjs";
import { pdf } from "../doc-clean/fixtures.mjs";
import { OBSCURED_LABEL, PUBLISHED_LABEL, COPY_CLEANED_LABEL } from "../../../src/case-carriage/index.mjs";

const OLIVE = V("olive");
const area = (rect, kind = "person") => ({ rect, kind });

test("R22 a marked photo's photoMarks, obscureMark and obscureMarkWithdraw answers carry obscured {copy, label: OBSCURED_LABEL, marked: true, kind: \"photo\"}; an unmarked photo's (nothing to obscure) {label: PUBLISHED_LABEL, marked: false, kind: \"photo\"}; every other field unchanged; writes nothing", async () => {
  const w = world();
  w.member("olive");
  const p = w.photo("INFO-2026-0020-photo", makePng(20, 20));
  const unchecked = w.cc.photoMarks({ captureSha: p, viewer: OLIVE });
  assert.equal("obscured" in unchecked, false, "no copy: no obscured");
  const nothing = await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  assert.equal(nothing.state, "nothing_to_obscure");
  assert.deepEqual(nothing.obscured, { copy: nothing.copy.sha256, label: PUBLISHED_LABEL, marked: false, kind: "photo" });
  const before = w.snapshot();
  const plain = w.cc.photoMarks({ captureSha: p, viewer: OLIVE });
  assert.deepEqual(w.snapshot(), before, "photoMarks writes nothing");
  assert.deepEqual(plain.obscured, nothing.obscured);
  assert.deepEqual(Object.keys(plain).sort(), ["capture", "copy", "marks", "obscured", "ok", "photo", "refused", "state"]);
  const marked = await w.cc.obscureMark({ captureSha: p, areas: [area([2, 2, 8, 8])], by: OLIVE });
  assert.equal(marked.state, "marked");
  const ob = { copy: marked.copy.sha256, label: OBSCURED_LABEL, marked: true, kind: "photo" };
  assert.deepEqual(marked.obscured, ob);
  assert.deepEqual(w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).obscured, ob);
  /* withdrawing the area's mark leaves the nothing-to-obscure mark standing: unmarked again */
  const back = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: marked.mark, reason: "drawn in error", by: OLIVE });
  assert.deepEqual(back.obscured, { copy: back.copy.sha256, label: PUBLISHED_LABEL, marked: false, kind: "photo" });
  /* every mark withdrawn: no copy, no obscured */
  const none = await w.cc.obscureMarkWithdraw({ captureSha: p, mark: nothing.mark, reason: "not needed", by: OLIVE });
  assert.equal(none.copy, null);
  assert.equal("obscured" in none, false);
});

test("R22 a photo image-cover refuses has no copy, so its answer carries no obscured", async () => {
  const w = world();
  w.member("olive");
  const p = w.photo("INFO-2026-0022-heic", Buffer.from("not a png at all"), { name: "photo.heic", contentType: "image/heic" });
  const r = await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.copy, null);
  assert.ok(r.refused);
  assert.equal("obscured" in r, false);
  assert.equal("obscured" in w.cc.photoMarks({ captureSha: p, viewer: OLIVE }), false);
});

test("R22 a member document's documentCopy in state copy answers obscured {copy, label: COPY_CLEANED_LABEL, kind: \"document\"}, its copy the state's; every other state carries no obscured", async () => {
  const w = world();
  const b = Buffer.from(pdf()), s = sha(b), id = "INFO-2026-0101-knock", path = "snapshots/file.pdf";
  w.doc(id, { text: `the page about ${id}` });
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`, s, id, path, b.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`, id, path, s, b.length, s);
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`,
    JSON.stringify({ documents: [{ file: path, capture: { method: "acquire", sha256: s, encoding: "binary", bytes: b.length, content_type: "application/pdf" } }] }), id);
  w.evidence.held.set(s, b);
  w.receipt(s, "doorbell");
  const pending = w.cc.documentCopy(s);
  assert.deepEqual(pending, { state: "pending", copy: null, refused: null }, "pending: no obscured");
  await w.cc.copyBatch({});
  const before = w.snapshot();
  const c = w.cc.documentCopy(s);
  assert.deepEqual(w.snapshot(), before, "writes nothing once derived");
  assert.equal(c.state, "copy");
  assert.deepEqual(c, { state: "copy", copy: c.copy, refused: null,
                        obscured: { copy: c.copy, label: COPY_CLEANED_LABEL, kind: "document" } });
  /* the other states carry none */
  const fetched = w.doc("INFO-2026-0001-minutes");
  assert.deepEqual(w.cc.documentCopy(fetched), { state: "public", copy: null, refused: null });
  w.st.sql.exec(`INSERT INTO document_copies (capture, state, refused_code, at) VALUES (?, 'refused', 'IMAGE_NOT_CLEANABLE', ?)`, s, "2026-09-28T03:00:00Z");
  assert.equal("obscured" in w.cc.documentCopy(s), false, "refused");
  w.st.sql.exec(`INSERT INTO document_copies (capture, state, at) VALUES (?, 'clean', ?)`, s, "2026-09-28T03:10:00Z");
  assert.deepEqual(w.cc.documentCopy(s), { state: "clean", copy: null, refused: null });
  const p = w.photo("INFO-2026-0020-photo", makePng(4, 4));
  assert.deepEqual(w.cc.documentCopy(p), { state: "photo", copy: null, refused: null });
  assert.deepEqual(w.cc.documentCopy("not a digest"), { state: "undetermined", copy: null, refused: null });
});
