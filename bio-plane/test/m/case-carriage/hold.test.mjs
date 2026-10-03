/* case-carriage — the materials a case edition holds at its commit (R1), the list read back (R2) and a held text read
   by its SHA-256 (R3); DEC-112 (3), (4), K1315, K1316, K1317. Copied in meaning from `publication` R57's arms
   (`test/m/publication/t28.test.mjs`), driven here at this module's interface with its own fixture. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, caseFm, sha, NOW } from "./fixture.mjs";
import { extractedTextOf } from "../../../src/case-grammar/index.mjs";
import { UNHELD_MAX } from "../../../src/case-carriage/index.mjs";

const DOC = "INFO-2026-0001-minutes", CASE = "CASE-2026-0001";
const UNITS = [{ seq: 0, extent: { kind: "document" }, ref: "¶1", text: "The minutes say so.", truncated: false }];
const EXTRACTED = extractedTextOf(UNITS);
const LATER = "2026-09-28T09:00:00Z";
const docRow = (ref, s, over = {}) => ({ ref, kind: "document", sha: s, text_sha: null, origin: null, archived_copy: null,
                                         included: true, rests_under: "load_bearing", ...over });
const obsRow = (ref, s, over = {}) => ({ ref, kind: "observation", sha: s, text_sha: null, origin: null, archived_copy: null,
                                         included: true, rests_under: "load_bearing", ...over });
const KEPT = ["published_material_texts", "published_case_materials"];
const len = (t) => Buffer.byteLength(t);

/* A blob-backed live file: record-core's `files` row with no inline content (its R13 then answers its blob reference). */
const blobFile = (w, bundleId, path, blob, bytes) =>
  w.st.sql.exec(`INSERT INTO files (bundle_id, path, content, blob_sha, bytes, sha256) VALUES (?, ?, NULL, ?, ?, ?)`,
                bundleId, path, blob, bytes, blob);

/* ---------------------------------------------------------------- R1 */

test("R1 holdMaterials holds, by SHA-256, each included document's bytes and whole extracted text and each included observation's whole text; nothing for a material not included; answers materials, files and unheld", () => {
  const w = world();
  const docSha = w.doc(DOC);
  w.units.set(docSha, { units: UNITS, state: "whole" });
  const obs = w.observe("ann");
  const annex = w.doc("INFO-2026-0002-annex");
  const fm = caseFm({ materials: [docRow(DOC, docSha, { text_sha: sha(EXTRACTED) }), obsRow(obs.id, obs.sha),
                                  docRow("INFO-2026-0002-annex", annex, { included: false })] });
  const r = w.cc.holdMaterials(fm, { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.materials, [{ sha: docSha, held: "inline" }, { sha: sha(EXTRACTED), held: "inline" },
                                 { sha: obs.sha, held: "inline" }]);
  assert.deepEqual(r.unheld, []);
  assert.deepEqual(r.files, [
    { sha256: docSha, ref: DOC, path: `materials/${docSha}`, kind: "document", bytes: len(`the text of ${DOC}`) },
    { sha256: sha(EXTRACTED), ref: DOC, path: `materials/${sha(EXTRACTED)}`, kind: "extracted_text", bytes: len(EXTRACTED) },
    { sha256: obs.sha, ref: obs.id, path: `materials/${obs.sha}`, kind: "observation", bytes: len(obs.text) }]);
  /* each text written once to published_material_texts, with its UTF-8 length and the instant given */
  assert.deepEqual(w.rows(`SELECT sha256, kind, text, bytes, published FROM published_material_texts ORDER BY rowid`), [
    { sha256: docSha, kind: "document", text: `the text of ${DOC}`, bytes: len(`the text of ${DOC}`), published: NOW },
    { sha256: sha(EXTRACTED), kind: "extracted_text", text: EXTRACTED, bytes: len(EXTRACTED), published: NOW },
    { sha256: obs.sha, kind: "observation", text: obs.text, bytes: len(obs.text), published: NOW }]);
  for (const row of w.rows(`SELECT sha256, text FROM published_material_texts`)) assert.equal(sha(row.text), row.sha256);
  /* the list, written once for the edition, in the order held */
  assert.deepEqual(w.rows(`SELECT case_id, edition, ord, sha256, held FROM published_case_materials ORDER BY ord`),
                   r.materials.map((m, i) => ({ case_id: CASE, edition: 1, ord: i, sha256: m.sha, held: m.held })));
  /* nothing at all for the material not included: no text, no file, not asked of extraction */
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM published_material_texts WHERE sha256=?`, annex).n, 0);
  assert.equal(r.files.some((f) => f.sha256 === annex), false);
  assert.equal(w.unitCalls.includes(annex), false);
  /* "true" as a string counts as included; a front matter object read as case-grammar R12 reads it */
  const w2 = world();
  const s2 = w2.doc(DOC);
  const r2 = w2.cc.holdMaterials({ format: "bio-case-document/6", materials: [docRow(DOC, s2, { included: "true" })] },
                                 { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r2.materials, [{ sha: s2, held: "inline" }]);
  const r3 = w2.cc.holdMaterials({ format: "bio-case-document/6", materials: [docRow(DOC, s2, { included: "false" })] },
                                 { caseId: CASE, edition: 2, at: NOW });
  assert.deepEqual([r3.materials, r3.files, r3.unheld], [[], [], []], "\"false\" is not included");
  assert.deepEqual(w2.cc.heldMaterialsOf(CASE, 2), []);
});

test("R1 a document whose bytes are only in the evidence store is held as evidence with the register's byte count; a blob-backed one too; neither writes a text", () => {
  const w = world();
  w.doc(DOC);
  const big = sha("bytes held in the evidence store only");
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, 'snapshots/big.pdf', 'binary', 999, ?)`,
                big, DOC, NOW);
  const blob = sha("a blob-backed capture");
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, 'snapshots/blob.pdf', 'binary', 4321, ?)`,
                blob, DOC, NOW);
  blobFile(w, DOC, "snapshots/blob.pdf", blob, 4321);
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, big), docRow(DOC, blob)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.materials, [{ sha: big, held: "evidence" }, { sha: blob, held: "evidence" }]);
  assert.deepEqual(r.files.map((f) => [f.sha256, f.kind, f.bytes]), [[big, "document", 999], [blob, "document", 4321]]);
  assert.equal(w.count("published_material_texts"), 0, "its bytes are not text here");
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 1), r.materials);
  assert.deepEqual(r.unheld.map((u) => [u.kind, u.sha256]), [["extracted_text", null], ["extracted_text", null]]);
});

test("R1 each material it cannot hold at its stated digest is answered unheld, never refused: no SHA-256, nothing captured, a home on no bundle, inline text at another digest, no such observation", () => {
  const w = world();
  const docSha = w.doc(DOC);
  const obs = w.observe("ann");
  const orphan = sha("registered on a bundle that does not exist");
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, 'INFO-2026-0999-gone', 'snapshots/x.txt', 'utf8', 5, ?)`,
                orphan, NOW);
  const wrong = sha("the stated bytes");
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, ?, 'utf8', 5, ?)`,
                wrong, DOC, `snapshots/${DOC}.txt`, NOW);
  const rows = [
    docRow(DOC, null), docRow(DOC, "not-a-digest"), obsRow(obs.id, ""),
    docRow("INFO-2026-0404-gone", sha("never captured")),
    docRow(DOC, orphan), docRow(DOC, wrong),
    obsRow("INFO-2026-0405-obs", sha("no such words")),
    obsRow(obs.id, docSha.replace(/^./, (c) => (c === "0" ? "1" : "0"))),
  ];
  const before = w.snapshot();
  const r = w.cc.holdMaterials(caseFm({ materials: rows }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual([r.materials, r.files], [[], []]);
  assert.deepEqual(r.unheld.map((u) => [u.ref, u.kind, u.sha256]), [
    [DOC, "document", null], [DOC, "document", "not-a-digest"], [obs.id, "observation", null],
    ["INFO-2026-0404-gone", "document", sha("never captured")], [DOC, "document", orphan], [DOC, "document", wrong],
    ["INFO-2026-0405-obs", "observation", sha("no such words")], [obs.id, "observation", rows[7].sha]]);
  for (const u of r.unheld) assert.ok(typeof u.why === "string" && u.why.length > 10, JSON.stringify(u));
  assert.deepEqual(w.snapshot(), before, "nothing held, so nothing written, not even the edition's list");
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 1), []);
});

test("R1 a document's extracted text is held only when the index is whole, holds a unit, none truncated, and its SHA-256 is the row's text_sha; each other case is answered unheld under text_sha", () => {
  const cases = [
    ["partial", { units: UNITS, state: "partial" }, sha(EXTRACTED), false],
    ["none", { units: [], state: "none" }, sha(EXTRACTED), false],
    ["never indexed", null, sha(EXTRACTED), false],
    ["whole but empty", { units: [], state: "whole" }, sha(extractedTextOf([])), false],
    ["a unit truncated", { units: [...UNITS, { seq: 1, extent: null, ref: "¶2", text: "cut", truncated: true }], state: "whole" },
     sha(extractedTextOf([...UNITS, { seq: 1, extent: null, ref: "¶2", text: "cut", truncated: true }])), false],
    ["another digest", { units: UNITS, state: "whole" }, sha("something else"), false],
    ["no text_sha", { units: UNITS, state: "whole" }, null, false],
    ["unitsOf throws", "throws", sha(EXTRACTED), false],
    ["whole, at its digest (upper case stated)", { units: UNITS, state: "whole" }, sha(EXTRACTED).toUpperCase(), true],
  ];
  for (const [label, index, textSha, held] of cases) {
    const w = world();
    const docSha = w.doc(DOC);
    if (index === "throws") w.cc.extraction.unitsOf = () => { throw new Error("down"); };
    else if (index) w.units.set(docSha, index);
    const r = w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, docSha, { text_sha: textSha })] }), { caseId: CASE, edition: 1, at: NOW });
    assert.deepEqual(r.materials[0], { sha: docSha, held: "inline" }, `${label}: the document itself is held`);
    if (held) {
      assert.deepEqual(r.materials[1], { sha: sha(EXTRACTED), held: "inline" }, label);
      assert.deepEqual(w.cc.publishedMaterialText(sha(EXTRACTED)), { found: true, sha256: sha(EXTRACTED), kind: "extracted_text", text: EXTRACTED });
      assert.deepEqual(r.unheld, []);
    } else {
      assert.equal(r.materials.length, 1, label);
      assert.deepEqual(r.unheld.map((u) => [u.ref, u.kind, u.sha256]), [[DOC, "extracted_text", textSha ? textSha.toLowerCase() : null]], label);
      assert.equal(w.row(`SELECT COUNT(*) AS n FROM published_material_texts WHERE kind='extracted_text'`).n, 0, label);
    }
  }
});

test("R1 (K1315, K1322) each timestamp token the capture's home provenance.json names is held: inline as text, blob-backed as evidence under its blob digest; one not held is named; co-archives and other attestation kinds hold nothing", () => {
  const w = world();
  const token = "TSA-TOKEN-BYTES", second = "SECOND-TOKEN";
  const body = "the stamped bytes";
  const blob = sha("a blob-backed token");
  const docSha = w.doc(DOC, { text: body,
    files: [{ path: "attestations/stamp.tsr", text: token }, { path: "attestations/two.tsr", text: second },
            { path: "attestations/archive.txt", text: "an archive's locator page" }, { path: "attestations/other.tsr", text: "OTHER" }],
    prov: { timestamp: { service: "tsa.example", token_file: "attestations/stamp.tsr" },
            attestations: [{ kind: "rfc3161", file: "attestations/two.tsr" }, { kind: "rfc3161", file: "attestations/blob.tsr" },
                           { kind: "rfc3161", file: "attestations/missing.tsr" }, { kind: "rfc3161", file: "attestations/stamp.tsr" },
                           { kind: "co_archive", file: "attestations/archive.txt", locator: "https://archive.example/x" },
                           { kind: "other", file: "attestations/other.tsr" }] } });
  blobFile(w, DOC, "attestations/blob.tsr", blob, 77);
  const r = w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, docSha)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.materials, [{ sha: docSha, held: "inline" }, { sha: sha(token), held: "inline" },
                                 { sha: sha(second), held: "inline" }, { sha: blob, held: "evidence" }]);
  assert.deepEqual(r.files.slice(1).map((f) => [f.sha256, f.kind, f.bytes, f.ref]),
                   [[sha(token), "attestation", len(token), DOC], [sha(second), "attestation", len(second), DOC], [blob, "attestation", 77, DOC]]);
  assert.deepEqual(w.cc.publishedMaterialText(sha(token)), { found: true, sha256: sha(token), kind: "attestation", text: token });
  assert.deepEqual(w.cc.publishedMaterialText(blob), { found: false });
  assert.deepEqual(r.unheld.map((u) => [u.kind, u.why]).filter(([k]) => k === "attestation"),
                   [["attestation", "the timestamp token attestations/missing.tsr is not held"]]);
  assert.equal(r.files.some((f) => f.sha256 === sha("an archive's locator page") || f.sha256 === sha("OTHER")), false,
               "a co-archive is a locator, and only rfc3161 attestations are tokens");
  /* a document with no provenance.json, or one naming another capture, holds no token */
  const w2 = world();
  const other = w2.doc(DOC, { files: [{ path: "attestations/stamp.tsr", text: token }] });
  w2.st.sql.exec(`UPDATE files SET content=? WHERE bundle_id=? AND path='data/provenance.json'`,
                 JSON.stringify({ documents: [{ capture: { sha256: sha("another capture") }, timestamp: { token_file: "attestations/stamp.tsr" } }] }), DOC);
  const r2 = w2.cc.holdMaterials(caseFm({ materials: [docRow(DOC, other)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r2.materials, [{ sha: other, held: "inline" }]);
  w2.st.sql.exec(`DELETE FROM files WHERE bundle_id=? AND path='data/provenance.json'`, DOC);
  assert.deepEqual(w2.cc.holdMaterials(caseFm({ materials: [docRow(DOC, other)] }), { caseId: CASE, edition: 2, at: NOW }).materials,
                   [{ sha: other, held: "inline" }]);
});

test("R1 a SHA-256 is held once per call; a text is written once; the list is written once for a case edition and a second call writes nothing new", () => {
  const w = world();
  const docSha = w.doc(DOC);
  const annex = w.doc("INFO-2026-0002-annex");
  const fm = caseFm({ materials: [docRow(DOC, docSha), docRow("INFO-2026-0003-copy", docSha), docRow(DOC, docSha.toUpperCase())] });
  const r = w.cc.holdMaterials(fm, { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual(r.materials, [{ sha: docSha, held: "inline" }]);
  assert.equal(r.files.length, 1);
  const kept = w.snapshot(KEPT);
  /* again, for the same edition, with more materials and a later instant: nothing new is written */
  const again = w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, docSha), docRow("INFO-2026-0002-annex", annex)] }),
                                   { caseId: CASE, edition: 1, at: LATER });
  assert.deepEqual(again.materials, [{ sha: docSha, held: "inline" }, { sha: annex, held: "inline" }], "answered as held");
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 1), [{ sha: docSha, held: "inline" }], "the edition's list is not rewritten");
  assert.equal(w.row(`SELECT published FROM published_material_texts WHERE sha256=?`, docSha).published, NOW, "nor the text");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM published_material_texts WHERE sha256=?`, annex).n, 1, "a new text is held");
  assert.deepEqual(JSON.parse(w.snapshot(KEPT).published_case_materials), JSON.parse(kept.published_case_materials));
  /* another edition gets its own list */
  w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0002-annex", annex)] }), { caseId: CASE, edition: 2, at: LATER });
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 2), [{ sha: annex, held: "inline" }]);
  /* with no instant given, the module's clock */
  w.clock.now = "2026-09-29T00:00:00Z";
  const fresh = w.doc("INFO-2026-0004-late");
  w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0004-late", fresh)] }), { caseId: CASE, edition: 3 });
  assert.equal(w.row(`SELECT published FROM published_material_texts WHERE sha256=?`, fresh).published, "2026-09-29T00:00:00Z");
});

test("R1 writes inside the caller's transaction and opens none of its own: a failure after it in the caller's transaction leaves nothing", () => {
  const w = world();
  const docSha = w.doc(DOC);
  let opened = 0;
  const inner = w.st.transactionSync.bind(w.st);
  w.st.transactionSync = (fn) => { opened++; return inner(fn); };
  const before = w.snapshot(KEPT);
  assert.throws(() => w.record.transact(() => {
    const r = w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, docSha)] }), { caseId: CASE, edition: 1, at: NOW });
    assert.deepEqual(r.materials, [{ sha: docSha, held: "inline" }]);
    assert.equal(opened, 1, "only the caller's transaction is open");
    throw new Error("the commit fails after it");
  }), /the commit fails after it/);
  assert.deepEqual(w.snapshot(KEPT), before, "rolled back with the caller's");
  opened = 0;
  w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, docSha)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.equal(opened, 0, "called outside a transaction, it opens none");
});

test("R1 unheld names at most 1,000; never throws: no front matter, a malformed one, no materials block, a store that cannot be written", () => {
  const w = world();
  const many = Array.from({ length: UNHELD_MAX + 5 }, (_, i) => docRow(`INFO-2026-${String(i).padStart(4, "0")}`, null));
  const r = w.cc.holdMaterials({ format: "bio-case-document/6", materials: many }, { caseId: CASE, edition: 1, at: NOW });
  assert.equal(UNHELD_MAX, 1000);
  assert.equal(r.unheld.length, 1000);
  for (const fm of [null, undefined, "not front matter", 42, {}, { format: "bio-case-document/6" },
                    { format: "bio-case-document/5", materials: [docRow(DOC, sha("x"))] }, { format: "bio-case-document/6", materials: "x" },
                    { format: "bio-case-document/6", materials: [null, 3, "row"] }])
    assert.deepEqual(w.cc.holdMaterials(fm, { caseId: CASE, edition: 1 }), { materials: [], unheld: [], files: [] }, JSON.stringify(fm));
  assert.deepEqual(w.cc.holdMaterials(caseFm({})), { materials: [], unheld: [], files: [] }, "no options");
  /* the store refuses the write: answered, every item named unheld, never thrown */
  const docSha = w.doc(DOC);
  w.st.sql.exec(`DROP TABLE published_material_texts`);
  const broken = w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, docSha)] }), { caseId: CASE, edition: 1, at: NOW });
  assert.deepEqual([broken.materials, broken.files], [[], []]);
  assert.deepEqual(broken.unheld.map((u) => [u.kind, u.sha256]), [["document", docSha], ["extracted_text", null]]);
});

/* ---------------------------------------------------------------- R2 */

test("R2 heldMaterialsOf answers the list R1 wrote for that case edition in its order; [] for an edition that held nothing or was never committed; writes nothing, never throws", () => {
  const w = world();
  const a = w.doc(DOC), b = w.doc("INFO-2026-0002-annex");
  const big = sha("evidence only");
  w.st.sql.exec(`INSERT INTO register (capture_sha, bundle_id, path, encoding, bytes, registered) VALUES (?, ?, 'snapshots/big.pdf', 'binary', 9, ?)`,
                big, DOC, NOW);
  w.cc.holdMaterials(caseFm({ materials: [docRow("INFO-2026-0002-annex", b), docRow(DOC, big), docRow(DOC, a)] }),
                     { caseId: CASE, edition: 2, at: NOW });
  w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, null)] }), { caseId: CASE, edition: 3, at: NOW });
  const before = w.snapshot();
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 2), [{ sha: b, held: "inline" }, { sha: big, held: "evidence" }, { sha: a, held: "inline" }]);
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, "2"), w.cc.heldMaterialsOf(CASE, 2));
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 3), [], "held nothing");
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 1), [], "never committed");
  assert.deepEqual(w.cc.heldMaterialsOf("CASE-NONE", 2), []);
  for (const [c, e] of [[null, null], [undefined, 2], [{}, []], [CASE, "x"], [Symbol("x"), 2]])
    assert.deepEqual(w.cc.heldMaterialsOf(c, e), []);
  assert.deepEqual(w.snapshot(), before, "writes nothing");
  w.st.sql.exec(`DROP TABLE published_case_materials`);
  assert.deepEqual(w.cc.heldMaterialsOf(CASE, 2), [], "never throws");
});

/* ---------------------------------------------------------------- R3 */

test("R3 publishedMaterialText answers a text R1 held, its SHA-256 read case-insensitively, else found false; working material is unreachable; writes nothing", () => {
  const w = world();
  const docSha = w.doc(DOC);
  const obs = w.observe("ann");
  const working = w.doc("INFO-2026-0002-working");
  w.cc.holdMaterials(caseFm({ materials: [docRow(DOC, docSha), obsRow(obs.id, obs.sha)] }), { caseId: CASE, edition: 1, at: NOW });
  const before = w.snapshot();
  assert.deepEqual(w.cc.publishedMaterialText(docSha), { found: true, sha256: docSha, kind: "document", text: `the text of ${DOC}` });
  assert.deepEqual(w.cc.publishedMaterialText(` ${obs.sha.toUpperCase()} `), { found: true, sha256: obs.sha, kind: "observation", text: obs.text });
  assert.deepEqual(w.cc.publishedMaterialText(working), { found: false }, "held in the record, never by a commit");
  for (const s of [sha("nothing"), "", null, undefined, 42, {}]) assert.deepEqual(w.cc.publishedMaterialText(s), { found: false });
  assert.deepEqual(w.snapshot(), before, "writes nothing");
});
