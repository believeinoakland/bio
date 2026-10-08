/* case-carriage — a photo carried as its obscured copy (R1, R8; T37, N757, DEC-180 (4)) and the marks that lapsed since a
   case was prepared (R13; K2206), driven at the module's interface with case documents written by case-grammar's own
   line builders (its R12's `obscured`). (T38; N779, K2248, K2291 (2)) A photo is never carried whole, nor inside an
   archive: every photo leaves only as its copy. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseFm, makePng, sha, V, NOW } from "./fixture.mjs";
import { makeZip } from "../../make-zip.mjs";
import { OBSCURED_LABEL, MARKS_LAPSED_MAX, PHOTO_ONLY_AS_COPY, ARCHIVE_HOLDS_IMAGE } from "../../../src/case-carriage/index.mjs";
import { migrateCaseCarriage } from "../../../src/case-carriage/schema.mjs";
import { materialsOf } from "../../../src/case-grammar/index.mjs";

const CASE = "CASE-2026-0001", PHOTO = "INFO-2026-0020-photo", DOC = "INFO-2026-0001-minutes";
const OLIVE = V("olive");
const docRow = (ref, s, over = {}) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                                         included: true, rests_under: "load_bearing", ...over });
const obscuredRow = (ref, s, copy, over = {}) => docRow(ref, s, { included: false, obscured: { copy, label: OBSCURED_LABEL }, ...over });
const area = (rect, kind = "person") => ({ rect, kind });

async function scene() {
  const w = world();
  w.member("olive");
  const p = w.photo(PHOTO, makePng(20, 20));
  const r = await w.cc.obscureMark({ captureSha: p, areas: [area([1, 1, 6, 6])], by: OLIVE });
  assert.equal(r.ok, true, JSON.stringify(r));
  return { w, p, copy: r.copy.sha256 };
}

test("R1 case-grammar reads the obscured row this module's tests write (the one spelling)", async () => {
  const { p, copy } = await scene();
  const m = materialsOf(caseFm({ materials: [obscuredRow(PHOTO, p, copy)] }));
  assert.deepEqual(m.materials[0].obscured, { copy, label: OBSCURED_LABEL });
  assert.equal(m.materials[0].included, false);
});

/* ---------------------------------------------------------------- R1 */

test("R1 a photo carried as its copy holds the copy alone, held derived, kind obscured, under the row's ref; nothing of the original: not its bytes, text, tokens, archive or container record", async () => {
  const { w, p, copy } = await scene();
  w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`,
    JSON.stringify({ documents: [{ file: "snapshots/photo.png", capture: { method: "acquire", sha256: p, content_type: "image/png" },
                                   timestamp: { token_file: "attestations/stamp.tsr" } }] }), PHOTO);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, 'attestations/stamp.tsr', 'TOKEN', NULL, 5, ?)`, PHOTO, sha("TOKEN"));
  w.units.set(p, { units: [{ seq: 0, extent: null, ref: "¶1", text: "words in the photo", truncated: false }], state: "whole" });
  const bytes = w.bucket.held.get(`bio/obscured/${copy}`).bytes.length;
  const r = w.cc.holdMaterials(caseFm({ materials: [obscuredRow(PHOTO, p, copy, { text_sha: sha("words in the photo") })] }),
                               { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.materials, [{ sha: copy, held: "derived" }]);
  assert.deepEqual(r.files, [{ sha256: copy, ref: PHOTO, path: `materials/${copy}`, kind: "obscured", bytes }]);
  assert.deepEqual(r.unheld, []);
  assert.equal(w.count("published_material_texts"), 0, "no text of the original, not its token");
  assert.equal(w.unitCalls.includes(p), false, "its extracted text not even asked");
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 1), [{ sha: copy, held: "derived" }], "R2 lists it for ratification R39");
  assert.ok(!JSON.stringify(r).includes(p), "the original's digest is not among what is held");
  /* a row not included and not obscured holds nothing */
  const out = w.cc.holdMaterials(caseFm({ materials: [docRow(PHOTO, p, { included: false })] }), { caseId: CASE, edition: 3, at: NOW });
  assert.deepEqual([out.materials, out.files, out.unheld], [[], [], []]);
});

test("R1 a copy not held at the digest the row names is answered unheld (kind obscured, why \"the obscured copy is not held\"): an unknown digest, another photo's copy, no digest", async () => {
  const { w, p, copy } = await scene();
  const other = w.photo("INFO-2026-0021-other", makePng(10, 10, () => [200, 10, 10]));
  const oc = (await w.cc.obscureMark({ captureSha: other, areas: [area([0, 0, 2, 2])], by: OLIVE })).copy.sha256;
  for (const [label, row, named] of [["unknown", obscuredRow(PHOTO, p, sha("no such copy")), sha("no such copy")],
                                     ["another photo's copy", obscuredRow(PHOTO, p, oc), oc],
                                     ["no digest", obscuredRow(PHOTO, p, ""), null]]) {
    const r = w.cc.holdMaterials(caseFm({ materials: [row] }), { caseId: CASE, edition: 1, at: NOW });
    assert.deepEqual([r.materials, r.files], [[], []], label);
    assert.deepEqual(r.unheld, [{ ref: PHOTO, kind: "obscured", sha256: named, why: "the obscured copy is not held" }], label);
  }
  /* negative controls: the copy as written, and its digest read case-insensitively from the front matter */
  assert.deepEqual(w.cc.holdMaterials(caseFm({ materials: [obscuredRow(PHOTO, p, copy)] }), { caseId: CASE, edition: 1, at: NOW }).unheld, []);
  const fm = caseFm({ materials: [obscuredRow(PHOTO, p, copy)] });
  assert.equal(fm.materials[0].obscured_copy, copy);
  fm.materials[0].obscured_copy = copy.toUpperCase();
  assert.deepEqual(w.cc.holdMaterials(fm, { caseId: CASE, edition: 2, at: NOW }).materials, [{ sha: copy, held: "derived" }]);
});

test("R1 a store whose published_case_materials predates derived is widened once with every row kept", () => {
  const w = world();
  const docSha = w.doc(DOC);
  w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, docSha)] }), { caseId: CASE, edition: 1, at: NOW });
  const rows = w.rows(`SELECT * FROM published_case_materials`);
  w.st.sql.exec(`DROP TABLE published_case_materials`);
  w.st.sql.exec(`CREATE TABLE published_case_materials (case_id TEXT NOT NULL, edition INTEGER NOT NULL, ord INTEGER NOT NULL,
                 sha256 TEXT NOT NULL, held TEXT NOT NULL CHECK (held IN ('inline','evidence')), PRIMARY KEY (case_id, edition, ord))`);
  for (const r of rows) w.st.sql.exec(`INSERT INTO published_case_materials VALUES (?,?,?,?,?)`, r.case_id, r.edition, r.ord, r.sha256, r.held);
  migrateCaseCarriage(w.st.sql, w.st);
  assert.deepEqual(w.rows(`SELECT * FROM published_case_materials`), rows);
  w.st.sql.exec(`INSERT INTO published_case_materials VALUES ('CASE-X', 1, 0, ?, 'derived')`, sha("copy"));
  migrateCaseCarriage(w.st.sql, w.st);
  assert.equal(w.count("published_case_materials"), rows.length + 1, "idempotent");
});

test("R1 (T38; N779) a row listed included: true whose capture is a photo is not held: it is answered unheld (kind document, why \"a photo travels only as its copy\"), nothing of the original held; told by its recorded type, else its path's extension", async () => {
  const { w, p } = await scene();
  const untyped = w.photo("INFO-2026-0024-untyped", makePng(6, 6), { name: "IMG_3.JPG", contentType: null });
  const doc = w.doc(DOC);
  const before = w.snapshot();
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow(PHOTO, p), docRow("INFO-2026-0024-untyped", untyped)] }),
                               { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual([r.materials, r.files], [[], []]);
  assert.deepEqual(r.unheld, [{ ref: PHOTO, kind: "document", sha256: p, why: "a photo travels only as its copy" },
                              { ref: "INFO-2026-0024-untyped", kind: "document", sha256: untyped, why: PHOTO_ONLY_AS_COPY }]);
  assert.equal(PHOTO_ONLY_AS_COPY, "a photo travels only as its copy");
  assert.deepEqual(w.snapshot(), before, "nothing written: no byte, text or list of the original");
  assert.equal(w.unitCalls.includes(p), false, "its extracted text not even asked");
  /* negative control: a document that is not a photo is held whole */
  assert.deepEqual(w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, doc)] }), { caseId: CASE, edition: 3, at: NOW }).materials,
                   [{ sha: doc, held: "inline" }]);
});

/* ---------------------------------------------------------------- R8 */

/* An archive held on its own bundle (evidence only), its listing recorded as acquisition records it, and members of it
   on bundles of their own, each stating its container. */
function archiveScene(entries) {
  const w = world();
  w.member("olive");
  const zip = Buffer.from(makeZip(entries.map((e) => ({ name: e.name, data: e.data, method: 0 }))));
  const archiveSha = sha(zip);
  w.doc("INFO-2026-0010-archive", { text: "the archive's page" });
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, 'INFO-2026-0010-archive', 'snapshots/a.zip', 'binary', ?, ?)`,
                archiveSha, zip.length, NOW);
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES ('INFO-2026-0010-archive', 'snapshots/a.zip', NULL, ?, ?, ?)`,
                archiveSha, zip.length, archiveSha);
  const member = (id, name, data, contentType) => {
    const s = contentType && contentType.startsWith("image/") ? w.photo(id, data, { contentType }) : w.doc(id, { text: data });
    const path = contentType && contentType.startsWith("image/") ? "snapshots/photo.png" : `snapshots/${id}.txt`;
    w.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`, JSON.stringify({ documents: [{ file: path,
      capture: { method: "unpacked", sha256: s, ...(contentType ? { content_type: contentType } : {}) },
      container: { archive_sha256: archiveSha, index: entries.findIndex((e) => e.name === name), path: name, member_sha256: s } }] }), id);
    return s;
  };
  return { w, zip, archiveSha, member };
}

test("R8 (T38; N779, K2291 (2)) a photo, always carried as its copy, carries none of R8's files; an archive that holds any image is carried for no material, whether or not the case carries the photo: each walk reaching it answers it unheld and stops", async () => {
  const png = makePng(12, 12);
  const { w, archiveSha, member } = archiveScene([{ name: "photo.png", data: png }, { name: "notes.txt", data: "the notes" }]);
  const p = member(PHOTO, "photo.png", png, "image/png");
  const notes = member("INFO-2026-0011-notes", "notes.txt", "the notes", null);
  w.listing(archiveSha, [{ name: "photo.png", sha256: p }, { name: "notes.txt", sha256: notes }]);
  const copy = (await w.cc.obscureMark({ captureSha: p, areas: [area([0, 0, 4, 4])], by: OLIVE })).copy.sha256;
  const r = w.cc.holdMaterials(caseFm({ materials: [obscuredRow(PHOTO, p, copy), docRow("INFO-2026-0011-notes", notes)] }),
                               { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.files.map((f) => [f.kind, f.ref]), [["obscured", PHOTO], ["document", "INFO-2026-0011-notes"],
                                                        ["container", "INFO-2026-0011-notes"]]);
  assert.equal(r.files.some((f) => f.sha256 === archiveSha), false, "the archive is carried for no material");
  assert.deepEqual(r.unheld.filter((u) => u.kind === "archive"),
                   [{ ref: "INFO-2026-0011-notes", kind: "archive", sha256: archiveSha, why: "the archive holds an image, and an image leaves only as its copy" }]);
  assert.equal(ARCHIVE_HOLDS_IMAGE, "the archive holds an image, and an image leaves only as its copy");
  assert.equal(r.materials.some((m) => m.sha === archiveSha), false);
  /* the case carries no photo at all: the archive still holds one, so it still never leaves */
  const alone = w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0011-notes", notes)] }), { caseId: CASE, edition: 2, at: NOW });
  assert.deepEqual(alone.files.map((f) => f.kind), ["document", "container"]);
  assert.deepEqual(alone.unheld.filter((u) => u.kind === "archive").map((u) => u.why), [ARCHIVE_HOLDS_IMAGE]);
  /* the archive cited directly, as a document: not carried either */
  const direct = w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0010-archive", archiveSha)] }), { caseId: CASE, edition: 3, at: NOW });
  assert.deepEqual([direct.materials, direct.unheld], [[], [{ ref: "INFO-2026-0010-archive", kind: "document", sha256: archiveSha, why: ARCHIVE_HOLDS_IMAGE }]]);
});

test("R8 (T38; K2291 (2)) whether an archive holds an image is judged from its recorded listing, fail closed: an image's name, a filed photo, an unnamed file, a nested archive holding one or never opened, or no listing at all; folders, links and other files do not", async () => {
  const cases = [
    ["an entry named as an image, never filed", [{ name: "DSC_0001.JPG" }], true],
    ["a filed entry that is a photo, whatever its name", (w) => [{ name: "scan.bin", sha256: w.photo("INFO-2026-0030-ph", makePng(4, 4)) }], true],
    ["an entry with no name", [{ name: null }], true],
    ["a nested archive never opened", [{ name: "more.zip" }], true],
    ["a nested archive holding an image", (w) => { const inner = sha("inner"); w.listing(inner, [{ name: "face.png" }]); return [{ name: "inner.zip", sha256: inner }]; }, true],
    ["no listing recorded", null, true],
    ["text files, a folder and a link", [{ name: "a.txt" }, { name: "pics/", kind: "dir" }, { name: "face.png", kind: "symlink" }], false],
    ["a nested archive holding none", (w) => { const inner = sha("inner"); w.listing(inner, [{ name: "b.txt" }]); return [{ name: "inner.zip", sha256: inner }]; }, false],
  ];
  for (const [label, listed, holds] of cases) {
    const { w, archiveSha, member } = archiveScene([{ name: "notes.txt", data: "the notes" }]);
    const notes = member("INFO-2026-0011-notes", "notes.txt", "the notes", null);
    const rows = typeof listed === "function" ? listed(w) : listed;
    if (rows) w.listing(archiveSha, [{ name: "notes.txt", sha256: notes }, ...rows]);
    const r = w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0011-notes", notes)] }), { caseId: CASE, edition: 1, at: NOW });
    assert.equal(r.files.some((f) => f.kind === "archive"), !holds, label);
    assert.deepEqual(r.unheld.filter((u) => u.kind === "archive").map((u) => u.why), holds ? [ARCHIVE_HOLDS_IMAGE] : [], label);
  }
});

/* ---------------------------------------------------------------- R13 */

test("R13 marksLapsed answers a row whose copy is no longer the photo's current copy, a withdrawal since included, and a photo row carried whole, always (T38; N779); [] when every row still matches", async () => {
  const { w, p, copy } = await scene();
  const plain = w.photo("INFO-2026-0021-plain", makePng(8, 8, () => [10, 200, 10]));
  const doc = w.doc(DOC);
  const fm = () => caseFm({ materials: [obscuredRow(PHOTO, p, copy), docRow(DOC, doc), obsRow("INFO-2026-0030-obs", sha("words"))] });
  const before = w.snapshot();
  assert.deepEqual(w.cc.marksLapsed(fm()), [], "every row still matches");
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  /* a photo carried whole lapses always: unchecked, "nothing to obscure" or marked */
  const whole = () => w.cc.marksLapsed(caseFm({ materials: [docRow("INFO-2026-0021-plain", plain)] }));
  const lapsed = [{ ref: "INFO-2026-0021-plain", sha: plain, why: "a photo travels only as its copy" }];
  assert.deepEqual(whole(), lapsed, "unchecked");
  await w.cc.obscureMark({ captureSha: plain, areas: [], by: OLIVE });
  assert.deepEqual(whole(), lapsed, "nothing to obscure");
  await w.cc.obscureMark({ captureSha: plain, areas: [area([0, 0, 2, 2])], by: OLIVE });
  assert.deepEqual(whole(), lapsed, "marked");
  /* a mark since: the obscured row lapses */
  await w.cc.obscureMark({ captureSha: p, areas: [area([10, 10, 14, 14], "plate")], by: OLIVE });
  assert.deepEqual(w.cc.marksLapsed(fm()), [{ ref: PHOTO, sha: p, why: "the photo's obscured copy is no longer its current copy" }]);
  /* prepared again on the current copy, it stands */
  const current = w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).copy.sha256;
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [obscuredRow(PHOTO, p, current)] })), []);
  /* a withdrawal since (DEC-183 (2)): the copy is re-derived, so the row lapses; withdrawing every mark leaves no copy */
  await w.cc.obscureMarkWithdraw({ captureSha: p, mark: 4, reason: "the plate is the group's own", by: OLIVE });
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [obscuredRow(PHOTO, p, current)] })).map((x) => x.why),
                   ["the photo's obscured copy is no longer its current copy"]);
  const again = w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).copy.sha256;
  assert.equal(again, copy, "the marks standing are those of the first copy, so its pixels again");
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [obscuredRow(PHOTO, p, again)] })), []);
  await w.cc.obscureMarkWithdraw({ captureSha: p, mark: 1, reason: "drawn in error", by: OLIVE });
  assert.equal(w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).copy, null);
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [obscuredRow(PHOTO, p, again)] })).map((x) => x.ref), [PHOTO]);
  /* a copy refused since (no current copy) lapses too */
  await w.cc.obscureMark({ captureSha: p, areas: [], by: OLIVE });
  const now = w.cc.photoMarks({ captureSha: p, viewer: OLIVE }).copy.sha256;
  w.st.sql.exec(`INSERT INTO photo_copies (capture, through, sha256, refused_code, at) VALUES (?, 99, NULL, 'IMAGE_DATA_CORRUPT', ?)`, p, NOW);
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [obscuredRow(PHOTO, p, now)] })).map((x) => x.ref), [PHOTO]);
});

const obsRow = (ref, s) => ({ ref, kind: "observation", sha: s, text_sha: null, origin: null, archived_copy: null,
                              included: true, rests_under: "load_bearing" });

test("R13 marks that cannot be read answer each row lapsed (fail closed); at most 200; never throws", async () => {
  const { w, p, copy } = await scene();
  const plain = w.photo("INFO-2026-0021-plain", makePng(8, 8));
  w.st.sql.exec(`DROP TABLE photo_marks`);
  assert.deepEqual(w.cc.marksLapsed(caseFm({ materials: [obscuredRow(PHOTO, p, copy), docRow("INFO-2026-0021-plain", plain)] })), [
    { ref: PHOTO, sha: p, why: "the photo's marks could not be read" },
    { ref: "INFO-2026-0021-plain", sha: plain, why: "a photo travels only as its copy" }]);
  assert.equal(MARKS_LAPSED_MAX, 200);
  const many = Array.from({ length: 205 }, (_, i) => obscuredRow(`INFO-2026-${String(1000 + i)}-x`, sha(`p${i}`), copy));
  assert.equal(w.cc.marksLapsed(caseFm({ materials: many })).length, 200);
  for (const fm of [null, undefined, 42, "x", {}, { format: "bio-case-document/7", materials: "x" }])
    assert.deepEqual(w.cc.marksLapsed(fm), []);
});
