/* case-disclosures (T37; N757; DEC-180 (3), (4); K2206): a photo a case relies on. R6: a marked photo is carried as its
   copy (`included: false`, `obscured: {copy, label}`), never C-120.8 for being held so; a marked photo whose cover was
   refused is refused PHOTO_NOT_COVERABLE when a load-bearing chain reaches it and listed `included: false` when only
   supporting chains do; an unmarked photo is judged as any document; a photo whose marks cannot be read is refused
   PHOTO_MARKS_UNDETERMINED and never carried whole. R7: the row states `obscured`. R22: the two rows. R29: `photosOf`, the
   ceremony's Photos step. `case-carriage.photoMarks` (its R10) is the fixture's stand-in at its ruled interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS, PHOTO_NOT_COVERABLE_WORDS, PHOTO_STATES, photoRead } from "../../../src/case-disclosures/index.mjs";
import { OBSCURED_LABEL } from "../../../src/case-carriage/index.mjs";
import { CASE_DOCUMENT_FORMAT, materialBlockLines, materialsOf } from "../../../src/case-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const COPY = "c".repeat(64), COPY2 = "d".repeat(64);
const AT = "2026-09-28T01:00:00Z";
const COVER_REFUSALS = ["NOT_A_COVERABLE_FORMAT", "UNSUPPORTED_JPEG_PROCESS", "PNG_INTERLACED", "PHOTO_TOO_LARGE",
                        "TRUNCATED_IMAGE_DATA", "IMAGE_DATA_CORRUPT"];
function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation]);
}
function setup() { const w = world(); for (const m of ["alice", "bo"]) w.member(m); return w; }
const judged = (w, members, supporting = [], viewer = V("alice")) =>
  w.cd.materialsJudged(w.prepared(members), w.roles(members, supporting), viewer);
const actor = (w, capture, who) => w.st.sql.exec(`INSERT INTO capture_actors (capture_sha, actor, at) VALUES (?, ?, ?)`,
                                                  capture, who, "2026-09-27T10:00:00Z");

test("R6: a marked photo with a copy is answered included: false with obscured {copy, label}, copy its current copy's SHA-256 and label case-carriage's OBSCURED_LABEL; it is presentable through its copy and never RELIED_ON_NOT_PRESENTABLE, even with no extracted text held; photoMarks is asked as the viewer", () => {
  const w = setup();
  const p = w.doc(DOC, {}, { indexed: false }), d = w.doc(DOC2);
  w.marks.photo(p, { state: "marked", copy: COPY.toUpperCase() });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const before = w.snapshot();
  const r = judged(w, [Q]);
  assert.deepEqual(r.refusals, []);
  assert.equal(typeof OBSCURED_LABEL, "string");
  assert.ok(OBSCURED_LABEL.length > 0);
  assert.deepEqual(r.materials.map((m) => [m.ref, m.sha, m.included, m.obscured]),
    [[DOC, p, false, { copy: COPY, label: OBSCURED_LABEL }], [DOC2, d, true, null]]);
  assert.deepEqual(r.materials[0].held.missing, ["extracted_text"], "what is held of the original is still stated");
  assert.deepEqual(w.marks.asked, [{ captureSha: p, viewer: V("alice") }, { captureSha: d, viewer: V("alice") }]);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* held whole too: still carried as its copy, never whole */
  const x = setup(); const q = x.doc(DOC); x.marks.photo(q, { state: "marked", copy: COPY }); x.finding(Q, [{ target: DOC }]);
  assert.deepEqual(judged(x, [Q]).materials.map((m) => [m.included, m.obscured]), [[false, { copy: COPY, label: OBSCURED_LABEL }]]);
  /* negative control: the same document unmarked and not held whole is C-120.8 */
  const n = setup(); n.doc(DOC, {}, { indexed: false }); n.finding(Q, [{ target: DOC }]);
  refused(judged(n, [Q]).refusals[0], "RELIED_ON_NOT_PRESENTABLE");
});

test("R6 (PHOTO_NOT_COVERABLE): a marked photo whose cover image-cover refused, for every code it refuses by name, is neither carried whole nor left out: a load-bearing member's chain reaching it is refused, naming each photo and member; one only supporting members reach is listed included: false and never refused; it writes nothing", () => {
  for (const code of COVER_REFUSALS) {
    const w = setup();
    const p = w.doc(DOC), p2 = w.doc(DOC2, {}, { indexed: false });
    w.marks.photo(p, { state: "marked", refused: code });
    w.marks.photo(p2, { state: "marked", copy: COPY, refused: code });
    w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
    w.finding(Q2, [{ target: DOC }]);
    const before = w.snapshot();
    const r = judged(w, [Q, Q2]);
    assert.equal(r.refusals.length, 1, code);
    refused(r.refusals[0], "PHOTO_NOT_COVERABLE");
    assert.deepEqual(r.refusals[0].not_coverable, [
      { target: Q, materials: [{ ref: DOC, sha: p, refused: code }, { ref: DOC2, sha: p2, refused: code }] },
      { target: Q2, materials: [{ ref: DOC, sha: p, refused: code }] }], code);
    assert.ok(r.refusals[0].detail.includes(p) && r.refusals[0].detail.endsWith("Nothing was written."));
    assert.deepEqual(r.materials.map((m) => [m.included, m.obscured]), [[false, null], [false, null]],
      `${code}: never whole, and a copy an earlier mark left is not carried`);
    assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
    /* supporting only: listed, not included, never refused */
    const s = judged(w, [Q, Q2], [Q, Q2]);
    assert.deepEqual(s.refusals, [], code);
    assert.deepEqual(s.materials.map((m) => [m.ref, m.included, m.obscured, m.rests_under]),
      [[DOC, false, null, "supporting"], [DOC2, false, null, "supporting"]]);
    /* one load-bearing member: only it is named */
    const one = judged(w, [Q, Q2], [Q]);
    assert.deepEqual(one.refusals[0].not_coverable.map((x) => x.target), [Q2]);
  }
});

test("R6: a photo answered nothing_to_obscure or unchecked travels whole as taken, judged as any document (whole: included; not whole and load-bearing: RELIED_ON_NOT_PRESENTABLE), and an unchecked photo never refuses", () => {
  for (const state of ["nothing_to_obscure", "unchecked"]) {
    const w = setup();
    const p = w.doc(DOC), p2 = w.doc(DOC2, {}, { indexed: false });
    w.marks.photo(p, { state }); w.marks.photo(p2, { state });
    w.finding(Q, [{ target: DOC }]);
    w.finding(Q2, [{ target: DOC2 }]);
    const r = judged(w, [Q]);
    assert.deepEqual([r.refusals, r.materials.map((m) => [m.included, m.obscured])], [[], [[true, null]]], state);
    const short = judged(w, [Q2]);
    assert.deepEqual(short.refusals.map((x) => x.reason), ["RELIED_ON_NOT_PRESENTABLE"], state);
    assert.deepEqual(short.refusals[0].not_presentable, [{ target: Q2, materials: [{ ref: DOC2, kind: "document", sha: p2, missing: ["extracted_text"] }] }]);
  }
});

test("R6 (PHOTO_MARKS_UNDETERMINED): a document whose marks cannot be read — a read that throws, refuses, or answers a shape R10 does not state (a marked photo with neither copy nor refused cover, a copy that is no SHA-256, an unknown state) — is refused, naming it, whoever reaches it; the read fails closed: it is never included, even held whole; it writes nothing", () => {
  const reads = {
    throws: () => { throw new Error("down"); },
    refuses: () => ({ ok: false, reason: "NO_SUCH_PHOTO" }),
    nothing: () => null,
    "marked, no copy, no refusal": ({ captureSha }) => ({ ok: true, capture: captureSha, photo: true, state: "marked", marks: [], copy: null, refused: null }),
    "a copy that is no digest": ({ captureSha }) => ({ ok: true, capture: captureSha, photo: true, state: "marked", marks: [], copy: { sha256: "x" }, refused: null }),
    "an unknown state": ({ captureSha }) => ({ ok: true, capture: captureSha, photo: true, state: "blurred", marks: [], copy: null, refused: null }),
    "no marks list": ({ captureSha }) => ({ ok: true, capture: captureSha, photo: true, state: "unchecked", copy: null, refused: null }),
    "photo not a boolean": ({ captureSha }) => ({ ok: true, capture: captureSha, photo: "yes" }),
  };
  for (const [why, read] of Object.entries(reads)) {
    const w = setup();
    const p = w.doc(DOC);
    w.finding(Q, [{ target: DOC }]);
    w.marks.read = read;
    const before = w.snapshot();
    for (const supporting of [[], [Q]]) {
      const r = judged(w, [Q], supporting);
      assert.equal(r.refusals.length, 1, why);
      refused(r.refusals[0], "PHOTO_MARKS_UNDETERMINED");
      assert.deepEqual(r.refusals[0].undetermined.map((u) => [u.ref, u.sha, u.members]), [[DOC, p, [Q]]], why);
      assert.equal(typeof r.refusals[0].undetermined[0].why, "string");
      assert.deepEqual([r.materials[0].included, r.materials[0].obscured], [false, null], `${why}: never carried whole`);
    }
    assert.deepEqual(w.snapshot(), before, `${why}: nothing written`);
  }
  /* negative control: a read answering no photo */
  const n = setup(); n.doc(DOC); n.finding(Q, [{ target: DOC }]);
  assert.deepEqual(judged(n, [Q]).refusals, []);
  /* an observation is no photo: never asked */
  const o = setup(); o.doc(DOC); o.st.sql.exec(`UPDATE register SET authored=1 WHERE bundle_id=?`, DOC); o.finding(Q, [{ target: DOC }]);
  o.marks.read = reads.throws;
  assert.deepEqual([judged(o, [Q]).refusals, o.marks.asked], [[], []]);
});

test("R6: the refusals in the order R6 states them — RELIED_ON_NOT_PRESENTABLE, PHOTO_NOT_COVERABLE, PHOTO_MARKS_UNDETERMINED — each naming only its own materials", () => {
  const w = setup();
  const a = w.doc(DOC, {}, { indexed: false }), b = w.doc(DOC2), c = w.doc(DOC3);
  w.marks.photo(b, { state: "marked", refused: "PHOTO_TOO_LARGE" });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }, { target: DOC3 }]);
  w.marks.answer(c, { ok: false, reason: "NO_SUCH_PHOTO" });
  const r = judged(w, [Q]);
  assert.deepEqual(r.refusals.map((x) => x.reason), ["RELIED_ON_NOT_PRESENTABLE", "PHOTO_NOT_COVERABLE", "PHOTO_MARKS_UNDETERMINED"]);
  assert.deepEqual(r.refusals[0].not_presentable[0].materials.map((m) => m.sha), [a]);
  assert.deepEqual(r.refusals[1].not_coverable[0].materials.map((m) => m.sha), [b]);
  assert.deepEqual(r.refusals[2].undetermined.map((m) => m.sha), [c]);
});

test("R6: photoRead reads R10's answer — no photo, a photo's state, marks, copy and refused cover (a refused cover governing over an earlier copy), and unread for anything else; it never throws", () => {
  assert.deepEqual(PHOTO_STATES, ["marked", "nothing_to_obscure", "unchecked"]);
  assert.deepEqual(photoRead(() => ({ ok: true, capture: "s", photo: false })), { photo: false });
  const marks = [{ mark: "M", areas: [], by: "alice", at: AT }];
  assert.deepEqual(photoRead(() => ({ ok: true, photo: true, state: "marked", marks, copy: { sha256: COPY2 }, refused: null })),
    { photo: true, state: "marked", marks, copy: COPY2, refused: null });
  assert.deepEqual(photoRead(() => ({ ok: true, photo: true, state: "marked", marks, copy: { sha256: COPY2 }, refused: { code: "PNG_INTERLACED", detail: "d" } })),
    { photo: true, state: "marked", marks, copy: null, refused: { code: "PNG_INTERLACED", detail: "d" } });
  for (const bad of [() => { throw new Error("x"); }, () => undefined, () => 7, () => ({ ok: false }), () => ({ ok: true }),
                     () => ({ ok: true, photo: true, state: "marked", marks, copy: null, refused: { code: 3 } })]) {
    const r = photoRead(bad);
    assert.deepEqual([r.photo, r.unread, typeof r.why], [null, true, "string"]);
  }
});

test("R7: a photo R6 answers with obscured is written with its original's fingerprint, extracted text's fingerprint, origin and archived copy, included: false, and obscured {copy, label}; its attestations as any document's; every other row states obscured: null; case-grammar's reader reads the row back", () => {
  const w = setup();
  const p = w.doc(DOC, { co_archive: { service: "archive.example", locator: "https://archive.example/web/p" } }, { receipt: true });
  const d = w.doc(DOC2);
  w.marks.photo(p, { state: "marked", copy: COPY });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const reached = judged(w, [Q]);
  const out = w.cd.disclosureBlocks({ reached, project: "PROJ-x", author: "alice", at: AT });
  const held = reached.materials[0].held;
  assert.deepEqual(out.materials.rows, [
    { ref: DOC, kind: "document", sha: p, text_sha: held.text_sha, origin: `https://example.org/${DOC}`,
      archived_copy: w.cd.captureFacts(p).co_archive, included: false, rests_under: "load_bearing",
      obscured: { copy: COPY, label: OBSCURED_LABEL } },
    { ref: DOC2, kind: "document", sha: d, text_sha: reached.materials[1].held.text_sha, origin: null,
      archived_copy: null, included: true, rests_under: "load_bearing", obscured: null }]);
  const kinds = (ref) => out.materials.attestations.filter((a) => a.ref === ref).map((a) => a.by_kind);
  const own = (ref) => kinds(ref).filter((k) => k !== "co_attestation");
  assert.deepEqual([own(DOC), own(DOC2)], [["project", "group"], ["project", "group"]], "as any document's");
  /* case-grammar R12: `obscured` written flat and read back as {copy, label} */
  const fm = w.fm(["---", `format: ${CASE_DOCUMENT_FORMAT}`,
    ...materialBlockLines({ materials: out.materials.rows, attestations: out.materials.attestations }), "---", ""].join("\n"));
  assert.deepEqual(materialsOf(fm).materials, out.materials.rows);
});

test("R29: photosOf answers the ceremony's Photos step over R6's materials — one entry per document whose capture is a photo, in materials order, with who took it, the members relying on it and their roles, its state, marks, copy, refused cover and words — and unchecked counts the photos with no mark; it reuses R6's read and writes nothing", () => {
  const w = setup();
  const pm = w.doc(DOC), pr = w.doc(DOC2), pu = w.doc(DOC3), plain = w.doc("INFO-2026-0004-d"), pn = w.doc("INFO-2026-0005-e");
  w.marks.photo(pm, { state: "marked", copy: COPY });
  w.marks.photo(pr, { state: "marked", refused: "UNSUPPORTED_JPEG_PROCESS" });
  w.marks.photo(pu, { state: "unchecked" });
  w.marks.photo(pn, { state: "nothing_to_obscure" });
  actor(w, pm, "bo"); actor(w, pu, "alice");
  w.finding(Q, [{ target: DOC }, { target: DOC2 }, { target: "INFO-2026-0004-d" }]);
  w.finding(Q2, [{ target: DOC }, { target: DOC3 }, { target: "INFO-2026-0005-e" }]);
  const roles = w.roles([Q, Q2], [Q2]);
  const reached = w.cd.materialsJudged(w.prepared([Q, Q2]), roles, V("alice"));
  const asked = w.marks.asked.length;
  const before = w.snapshot();
  const out = w.cd.photosOf(reached.materials, roles, V("alice"));
  assert.equal(w.marks.asked.length, asked, "R6's read, not read again");
  assert.deepEqual(w.snapshot(), before, "nothing written");
  const marked = w.marks.photoMarks({ captureSha: pm }).marks;
  assert.deepEqual(out.photos.map((p) => [p.ref, p.sha]), [[DOC, pm], [DOC2, pr], [DOC3, pu], ["INFO-2026-0005-e", pn]],
    "a document that is no photo is not listed");
  assert.deepEqual(out.photos[0], { ref: DOC, sha: pm, taken_by: "bo",
    relied_on_by: [{ target: Q, role: "load_bearing" }, { target: Q2, role: "supporting" }],
    state: "marked", marks: marked, copy: COPY, refused: null, words: OBSCURED_LABEL, unread: false });
  assert.deepEqual([out.photos[1].state, out.photos[1].copy, out.photos[1].refused.code, out.photos[1].words, out.photos[1].taken_by],
    ["marked", null, "UNSUPPORTED_JPEG_PROCESS", PHOTO_NOT_COVERABLE_WORDS, null]);
  assert.deepEqual([out.photos[2].state, out.photos[2].words, out.photos[2].taken_by, out.photos[2].relied_on_by],
    ["unchecked", null, "alice", [{ target: Q2, role: "supporting" }]]);
  assert.deepEqual([out.photos[3].state, out.photos[3].words], ["nothing_to_obscure", null]);
  assert.equal(out.unchecked, 1);
  assert.match(PHOTO_NOT_COVERABLE_WORDS, /captured again in a format that can be covered/);
  /* an unchecked photo never refuses and never blocks signing */
  assert.deepEqual(reached.refusals.map((r) => r.reason), ["PHOTO_NOT_COVERABLE"], "only the refused cover refuses");
  assert.equal(reached.materials.find((m) => m.sha === pu).included, true, "travels whole as taken");
  /* materials without R6's read: read here, as the viewer */
  const bare = reached.materials.map(({ photo, ...m }) => m), from = w.marks.asked.length;
  assert.deepEqual(w.cd.photosOf(bare, roles, V("bo")).photos.map((p) => p.state), ["marked", "marked", "unchecked", "nothing_to_obscure"]);
  assert.deepEqual(w.marks.asked.slice(from).map((a) => a.viewer), Array(5).fill(V("bo")));
});

test("R29: a photo whose marks cannot be read is listed state: null, unread: true, as R6 refuses it; garbage in answers what it can and never throws", () => {
  const w = setup();
  const p = w.doc(DOC);
  w.finding(Q, [{ target: DOC }]);
  w.marks.read = () => { throw new Error("down"); };
  const reached = judged(w, [Q]);
  refused(reached.refusals[0], "PHOTO_MARKS_UNDETERMINED");
  const out = w.cd.photosOf(reached.materials, w.roles([Q]), V("alice"));
  assert.deepEqual(out, { photos: [{ ref: DOC, sha: p, taken_by: null, relied_on_by: [{ target: Q, role: "load_bearing" }],
    state: null, marks: null, copy: null, refused: null, words: null, unread: true }], unchecked: 0 });
  for (const args of [[], [null, null, null], ["x", 3, {}], [[null, 1, { kind: "document" }, { kind: "document", sha: 5 }], [null]]])
    assert.deepEqual(w.cd.photosOf(...args), { photos: [], unchecked: 0 }, JSON.stringify(args));
  const cap = world({ deps: { capture: { captureAccountsOf: () => { throw new Error("down"); } } } });
  cap.member("alice"); const q = cap.doc(DOC); cap.marks.photo(q); cap.finding(Q, [{ target: DOC }]);
  assert.deepEqual(cap.cd.photosOf(judged(cap, [Q]).materials, cap.roles([Q]), V("alice")).photos.map((x) => [x.taken_by, x.state]),
    [[null, "unchecked"]], "a failed actor read states less");
  void sha;
});
