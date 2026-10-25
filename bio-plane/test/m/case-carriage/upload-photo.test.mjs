/* case-carriage R1, R8, R9, R13 (K5148; WALK-FINAL-10A R172): a photo a member uploaded is a photo. An upload records no
   `capture.content_type` (capture R86); only the profile of its bytes (`profile.format.format`, `profile.source_content_type`).
   `capture` publishes no upload fixture (reported to BOB), so the provenance document has the shape `capture/upload.test.mjs`
   pins for `uploadCapture`: `capture` with method "uploaded" and no content type, the file `snapshots/upload-<sha>`, and the profile. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, makePng, sha } from "./fixture.mjs";
import { V } from "./fixture.mjs";

const OLIVE = V("olive");
const area = (rect, kind = "person") => ({ rect, kind });

/** An uploaded file: one bundle, the bytes only in the evidence store, registered at the upload's file name, its home's
 *  provenance exactly as an upload writes it. `format` is the profile's format (null: none), `declared` the profile's
 *  `source_content_type`, `name` the register path's name. */
function uploaded(w, id, bytes, { format = "png", declared = "image/png", name = null } = {}) {
  const b = Buffer.from(bytes), s = sha(b);
  w.doc(id, { text: `the page about ${id}` });
  const path = name ? `snapshots/${name}` : `snapshots/upload-${s}`;
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'binary', ?, ?)`, s, id, path, b.length, "2026-09-28T01:00:00Z");
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`, id, path, s, b.length, s);
  const doc = { file: path, locator: `upload:${s}`, retrieved: "2026-09-28T01:00:00Z",
    capture: { method: "uploaded", grade: null, grade_basis: "CAPTURE_RECEIVED_NOT_FETCHED", actor_class: "member", actor: OLIVE, sha256: s, encoding: "binary", bytes: b.length },
    profile: { format: format ? { format, confidence: "certain", signals: [] } : { format: "undetermined", confidence: "none", signals: [] }, source_content_type: declared },
    origin: { kind: "upload" } };
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify({ documents: [doc] }), id);
  w.evidence.held.set(s, b);
  return s;
}

test("R1 R9 R13 an uploaded photo (no content type, the profile names the PNG) is a photo: obscuremark records nothing_to_obscure and the photo's marks answer a photo", async () => {
  const w = world();
  w.member("olive");
  const p = uploaded(w, "INFO-2026-0030-street", makePng(20, 20));
  const r = await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  assert.equal(r.ok, true, JSON.stringify(r));
  assert.equal(r.state, "nothing_to_obscure");
  assert.equal(w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).ok, true);
  assert.equal(w.cc.documentCopy(p).state, "photo", "R8: it is carried only as its copy, never as a document");
});

test("R1 R9 an upload is a photo by its profile alone: a PNG with no declared type, and a declared image type over bytes of no known format", async () => {
  const w = world();
  w.member("olive");
  const noType = uploaded(w, "INFO-2026-0031-a", makePng(12, 12), { declared: null });
  const typeOnly = uploaded(w, "INFO-2026-0032-b", makePng(14, 14), { format: null, declared: "image/jpeg" });
  for (const s of [noType, typeOnly]) {
    const r = await w.cc.obscureMark({ captureSha: s, areas: [], by: OLIVE });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.equal(r.state, "nothing_to_obscure");
  }
});

test("R1 R9 R13 (controls) the format wins over the name: a text upload named notes.png is not a photo; a named .png with no profile is by its extension; an undetermined format falls to the extension", async () => {
  const w = world();
  w.member("olive");
  const text = uploaded(w, "INFO-2026-0033-notes", "just some notes", { format: "text", declared: "text/plain", name: "notes.png" });
  const r = await w.cc.obscureMark({ captureSha: text, areas: [], by: OLIVE });
  assert.equal(r.ok, false);
  assert.equal(r.code ?? r.reason, "NOT_A_PHOTO");
  assert.notEqual(w.cc.documentCopy(text).state, "photo");
  const undetermined = uploaded(w, "INFO-2026-0034-x", makePng(10, 10), { format: null, declared: null, name: "x.png" });
  assert.equal((await w.cc.obscureMark({ captureSha: undetermined, areas: [], by: OLIVE })).ok, true, "nothing states a type: the extension decides");
  const plain = uploaded(w, "INFO-2026-0035-y", "plain words", { format: null, declared: null });
  assert.equal((await w.cc.obscureMark({ captureSha: plain, areas: [], by: OLIVE })).ok, false, "no format, no type, no extension: not a photo");
});

test("R1 R9 a fetched photo is still a photo by its recorded content type,", async () => {
  const w = world();
  w.member("olive");
  const p = w.photo("INFO-2026-0036-fetched", makePng(16, 16));
  assert.equal((await w.cc.obscureMark({ captureSha: p, areas: [area([1, 1, 5, 5])], by: OLIVE })).ok, true);
});
