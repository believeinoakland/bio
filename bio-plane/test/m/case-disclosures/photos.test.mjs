/* case-disclosures (T37; N757; DEC-180 (3), (4); K2206; T38: N779, K2248; DEC-183 (1), K2220, K2291, K2303): a photo a
   case relies on. R6: a photo never travels whole; a checked photo with a copy is carried as its copy (`included: false`,
   `obscured: {copy, label}`, `label` only when marked); an unchecked photo any chain reaches is refused PHOTO_UNCHECKED;
   a photo whose cover was refused, marked or not, is refused PHOTO_NOT_COVERABLE when a load-bearing chain reaches it
   and listed `included: false` when only supporting chains do; a photo whose marks cannot be read is refused
   PHOTO_MARKS_UNDETERMINED; a withdrawn mark counts as withdrawn. R7: the row states `obscured`. R22: the rows and their
   words, read by key from `words.json`. R29: `photosOf`, the ceremony's Photos step. `case-carriage.photoMarks` (its
   R10) is the fixture's stand-in at its ruled interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, V, sha } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS, PHOTO_NOT_COVERABLE_WORDS, PHOTO_UNCHECKED_WORDS, PHOTO_WORDS, PHOTO_STATES,
         photoRead } from "../../../src/case-disclosures/index.mjs";
import { OBSCURED_LABEL } from "../../../src/case-carriage/index.mjs";
import { CASE_DOCUMENT_FORMAT, materialBlockLines, materialsOf } from "../../../src/case-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c", DOC4 = "INFO-2026-0004-d";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const COPY = "c".repeat(64), COPY2 = "d".repeat(64);
const AT = "2026-09-28T01:00:00Z";
const COVER_REFUSALS = ["NOT_A_COVERABLE_FORMAT", "UNSUPPORTED_JPEG_PROCESS", "PNG_INTERLACED", "PHOTO_TOO_LARGE",
                        "TRUNCATED_IMAGE_DATA", "IMAGE_DATA_CORRUPT"];
const WORDS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
const wordOf = (key) => (Array.isArray(WORDS) ? WORDS : WORDS.words || Object.values(WORDS).find(Array.isArray)).find((w) => w && w.key === key);
const AREA = [{ rect: [0, 0, 8, 8], kind: "person" }];
const mark = (id, areas, withdrawn = null) => ({ mark: id, areas, by: "alice", at: AT, withdrawn });
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

test("R22: PHOTO_NOT_COVERABLE's and PHOTO_UNCHECKED's translations are words.json's photo.refused.format and photo.refused.unchecked, read by key, verbatim and protected, {photo} the photo named; PHOTO_WORDS holds each once and R29's words are the same", () => {
  for (const [key, code] of [["photo.refused.format", "PHOTO_NOT_COVERABLE"], ["photo.refused.unchecked", "PHOTO_UNCHECKED"]]) {
    const w = wordOf(key);
    assert.ok(w, key);
    assert.equal(w.protected, true, key);
    assert.equal(PHOTO_WORDS[key], w.en, key);
    assert.equal(CASE_DISCLOSURE_CHECKS[code].translation, w.en, code);
    assert.ok(w.en.includes("{photo}"), key);
  }
  assert.deepEqual(Object.keys(PHOTO_WORDS), ["photo.refused.format", "photo.refused.unchecked"]);
  assert.ok(Object.isFrozen(PHOTO_WORDS));
  assert.equal(PHOTO_NOT_COVERABLE_WORDS, wordOf("photo.refused.format").en);
  assert.equal(PHOTO_UNCHECKED_WORDS, wordOf("photo.refused.unchecked").en);
  assert.equal(CASE_DISCLOSURE_CHECKS.PHOTO_UNCHECKED.check, "C-120.19");
  assert.equal(OBSCURED_LABEL, wordOf("photo.obscured.label").en, "the label is case-carriage's, the same words");
});

test("R6: a photo never travels whole — a marked photo with a copy is answered included: false with obscured {copy, label: OBSCURED_LABEL}, a nothing_to_obscure photo with a copy obscured {copy, label: null}, held whole or not; each is presentable through its copy and never RELIED_ON_NOT_PRESENTABLE; photoMarks is asked as the viewer", () => {
  const w = setup();
  const p = w.doc(DOC, {}, { indexed: false }), n = w.doc(DOC3), d = w.doc(DOC2);
  w.marks.photo(p, { state: "marked", copy: COPY.toUpperCase() });
  w.marks.photo(n, { state: "nothing_to_obscure", copy: COPY2 });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }, { target: DOC3 }]);
  const before = w.snapshot();
  const r = judged(w, [Q]);
  assert.deepEqual(r.refusals, []);
  assert.ok(typeof OBSCURED_LABEL === "string" && OBSCURED_LABEL.length > 0);
  assert.deepEqual(r.materials.map((m) => [m.ref, m.sha, m.included, m.obscured]),
    [[DOC, p, false, { copy: COPY, label: OBSCURED_LABEL }], [DOC2, d, true, null], [DOC3, n, false, { copy: COPY2, label: null }]]);
  assert.equal(r.materials[2].held.whole, true, "held whole, and still carried only as its copy");
  assert.deepEqual(r.materials[0].held.missing, ["extracted_text"], "what is held of the original is still stated");
  assert.deepEqual(w.marks.asked, [p, d, n].map((captureSha) => ({ captureSha, viewer: V("alice") })));
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* supporting only: the same */
  assert.deepEqual(judged(w, [Q], [Q]).materials.map((m) => [m.included, m.obscured && m.obscured.label]),
    [[false, OBSCURED_LABEL], [true, null], [false, null]]);
  /* negative control: the same document no photo and not held whole is C-120.8 */
  const c = setup(); c.doc(DOC, {}, { indexed: false }); c.finding(Q, [{ target: DOC }]);
  refused(judged(c, [Q]).refusals[0], "RELIED_ON_NOT_PRESENTABLE");
});

test("R6 (PHOTO_UNCHECKED): an unchecked photo (no standing mark) that any member's chain reaches — load-bearing or supporting only, held whole or not — is refused, naming each such photo and the members reaching it, with photo filling {photo}; it never travels and is never C-120.8; it writes nothing", () => {
  const w = setup();
  const a = w.doc(DOC), b = w.doc(DOC2, {}, { indexed: false }), c = w.doc(DOC3);
  w.marks.photo(a, { state: "unchecked" }); w.marks.photo(b, { state: "unchecked" });
  w.marks.photo(c, { state: "marked", copy: COPY });
  w.finding(Q, [{ target: DOC }, { target: DOC3 }]);
  w.finding(Q2, [{ target: DOC }, { target: DOC2 }]);
  const before = w.snapshot();
  for (const supporting of [[], [Q2], [Q, Q2]]) {
    const r = judged(w, [Q, Q2], supporting);
    assert.equal(r.refusals.length, 1, JSON.stringify(supporting));
    refused(r.refusals[0], "PHOTO_UNCHECKED");
    assert.deepEqual(r.refusals[0].unchecked, [{ ref: DOC, sha: a, members: [Q, Q2] }, { ref: DOC2, sha: b, members: [Q2] }]);
    assert.equal(r.refusals[0].photo, `${DOC}, ${DOC2}`);
    assert.ok(r.refusals[0].detail.includes(a) && r.refusals[0].detail.endsWith("Nothing was written."));
    assert.deepEqual(r.materials.map((m) => [m.ref, m.included, m.obscured]),
      [[DOC, false, null], [DOC3, false, { copy: COPY, label: OBSCURED_LABEL }], [DOC2, false, null]]);
  }
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* an unchecked photo with a copy or a refused cover in the answer is still unchecked: no copy travels */
  const x = setup(); const q = x.doc(DOC); x.finding(Q, [{ target: DOC }]);
  x.marks.answer(q, { ok: true, capture: q, photo: true, state: "unchecked", marks: [], copy: { sha256: COPY }, refused: { code: "PNG_INTERLACED" } });
  const xr = judged(x, [Q]);
  assert.deepEqual([xr.refusals.map((r) => r.reason), xr.materials[0].obscured], [["PHOTO_UNCHECKED"], null]);
  /* negative control: each checked */
  w.marks.photo(a, { state: "nothing_to_obscure", copy: COPY }); w.marks.photo(b, { state: "marked", copy: COPY2 });
  assert.deepEqual(judged(w, [Q, Q2]).refusals, []);
});

test("R6 (PHOTO_NOT_COVERABLE): a photo whose cover image-cover refused, for every code it refuses by name, marked or nothing_to_obscure, is neither carried whole nor left out: a load-bearing member's chain reaching it is refused, naming each photo and member, with photo filling {photo}; one only supporting members reach is listed included: false with no obscured and never refused; it writes nothing", () => {
  for (const code of COVER_REFUSALS) for (const state of ["marked", "nothing_to_obscure"]) {
    const w = setup();
    const p = w.doc(DOC), p2 = w.doc(DOC2, {}, { indexed: false });
    w.marks.photo(p, { state, refused: code });
    w.marks.photo(p2, { state, copy: COPY, refused: code });
    w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
    w.finding(Q2, [{ target: DOC }]);
    const before = w.snapshot();
    const r = judged(w, [Q, Q2]);
    assert.equal(r.refusals.length, 1, code);
    refused(r.refusals[0], "PHOTO_NOT_COVERABLE");
    assert.deepEqual(r.refusals[0].not_coverable, [
      { target: Q, materials: [{ ref: DOC, sha: p, refused: code }, { ref: DOC2, sha: p2, refused: code }] },
      { target: Q2, materials: [{ ref: DOC, sha: p, refused: code }] }], code);
    assert.equal(r.refusals[0].photo, `${DOC}, ${DOC2}`);
    assert.ok(r.refusals[0].detail.includes(p) && r.refusals[0].detail.endsWith("Nothing was written."));
    assert.deepEqual(r.materials.map((m) => [m.included, m.obscured]), [[false, null], [false, null]],
      `${code} ${state}: never whole, and a copy an earlier mark left is not carried`);
    assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
    const s = judged(w, [Q, Q2], [Q, Q2]);
    assert.deepEqual(s.refusals, [], code);
    assert.deepEqual(s.materials.map((m) => [m.ref, m.included, m.obscured, m.rests_under]),
      [[DOC, false, null, "supporting"], [DOC2, false, null, "supporting"]]);
    assert.deepEqual(judged(w, [Q, Q2], [Q]).refusals[0].not_coverable.map((x) => x.target), [Q2]);
  }
});

test("R6 (PHOTO_MARKS_UNDETERMINED): a document whose marks cannot be read — a read that throws, refuses, or answers a shape R10 does not state (a checked photo with neither copy nor refused cover, a copy that is no SHA-256, an unknown state, a state the standing marks do not give, a mark with no areas) — is refused, naming it, wherever the answer decides what travels (held whole, or relied on by a load-bearing member); the read fails closed: it is never included, even held whole; it writes nothing", () => {
  const ans = (o) => ({ captureSha }) => ({ ok: true, capture: captureSha, photo: true, copy: null, refused: null, ...o });
  const reads = {
    throws: () => { throw new Error("down"); },
    refuses: () => ({ ok: false, reason: "NO_SUCH_PHOTO" }),
    nothing: () => null,
    "marked, no copy, no refusal": ans({ state: "marked", marks: [mark("M", AREA)] }),
    "nothing_to_obscure, no copy, no refusal": ans({ state: "nothing_to_obscure", marks: [mark("M", [])] }),
    "a copy that is no digest": ans({ state: "marked", marks: [mark("M", AREA)], copy: { sha256: "x" } }),
    "an unknown state": ans({ state: "blurred", marks: [] }),
    "no marks list": ans({ state: "unchecked" }),
    "a mark with no areas": ans({ state: "marked", marks: [{ mark: "M", by: "alice", at: AT }], copy: { sha256: COPY } }),
    "marked with no mark standing": ans({ state: "marked", marks: [mark("M", AREA, { by: "bo", at: AT, reason: "wrong" })], copy: { sha256: COPY } }),
    "unchecked with a mark standing": ans({ state: "unchecked", marks: [mark("M", [])] }),
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
  const u = setup(); const up = u.doc(DOC, {}, { indexed: false }); u.finding(Q, [{ target: DOC }]);
  u.marks.read = reads.refuses;
  const sup = judged(u, [Q], [Q]);
  assert.deepEqual([sup.refusals, sup.materials.map((m) => m.included)], [[], [false]]);
  assert.deepEqual(u.cd.photosOf(sup.materials, u.roles([Q], [Q]), V("alice")), { photos: [], unchecked: 0 });
  const lb = judged(u, [Q]);
  assert.deepEqual(lb.refusals.map((r) => r.reason), ["PHOTO_MARKS_UNDETERMINED"]);
  assert.deepEqual(lb.refusals[0].undetermined.map((x) => x.sha), [up]);
  assert.deepEqual(u.cd.photosOf(lb.materials, u.roles([Q]), V("alice")).photos.map((x) => [x.sha, x.unread]), [[up, true]]);
  const n = setup(); n.doc(DOC); n.finding(Q, [{ target: DOC }]);
  assert.deepEqual(judged(n, [Q]).refusals, []);
  const o = setup(); o.doc(DOC); o.st.sql.exec(`UPDATE register SET authored=1 WHERE bundle_id=?`, DOC); o.finding(Q, [{ target: DOC }]);
  o.marks.read = reads.throws;
  assert.deepEqual([judged(o, [Q]).refusals, o.marks.asked], [[], []]);
});

test("R6: a withdrawn mark counts as withdrawn (case-carriage R14) — a photo whose every mark is withdrawn is unchecked and refused PHOTO_UNCHECKED; one whose only area mark is withdrawn and an empty mark stands is nothing_to_obscure, carried as its copy with no label; the withdrawn marks are kept as read", () => {
  const W = { by: "bo", at: AT, reason: "it covered the wrong thing" };
  const w = setup();
  const a = w.doc(DOC), b = w.doc(DOC2), c = w.doc(DOC3);
  const ma = [mark("M1", AREA, W)], mb = [mark("M1", AREA, W), mark("M2", [])], mc = [mark("M1", AREA, W), mark("M2", AREA)];
  w.marks.photo(a, { state: "unchecked", marks: ma });
  w.marks.photo(b, { state: "nothing_to_obscure", marks: mb, copy: COPY });
  w.marks.photo(c, { state: "marked", marks: mc, copy: COPY2 });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }, { target: DOC3 }]);
  const r = judged(w, [Q]);
  assert.deepEqual(r.refusals.map((x) => [x.reason, x.unchecked.map((m) => m.sha)]), [["PHOTO_UNCHECKED", [a]]]);
  assert.deepEqual(r.materials.map((m) => [m.photo.state, m.obscured]),
    [["unchecked", null], ["nothing_to_obscure", { copy: COPY, label: null }], ["marked", { copy: COPY2, label: OBSCURED_LABEL }]]);
  assert.deepEqual(r.materials.map((m) => m.photo.marks), [ma, mb, mc]);
  /* negative control: the same marks with none withdrawn are marked */
  const x = setup(); const q = x.doc(DOC); x.marks.photo(q, { state: "marked", marks: [mark("M1", AREA)], copy: COPY }); x.finding(Q, [{ target: DOC }]);
  assert.deepEqual([judged(x, [Q]).refusals, judged(x, [Q]).materials[0].obscured], [[], { copy: COPY, label: OBSCURED_LABEL }]);
});

test("R6: the refusals in the order R6 states them — RELIED_ON_NOT_PRESENTABLE, PHOTO_MARKS_UNDETERMINED, PHOTO_UNCHECKED, PHOTO_NOT_COVERABLE — each naming only its own materials", () => {
  const w = setup();
  const a = w.doc(DOC, {}, { indexed: false }), b = w.doc(DOC2), c = w.doc(DOC3), d = w.doc(DOC4);
  w.marks.photo(b, { state: "nothing_to_obscure", refused: "PHOTO_TOO_LARGE" });
  w.marks.photo(d, { state: "unchecked" });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }, { target: DOC3 }, { target: DOC4 }]);
  w.marks.answer(c, { ok: false, reason: "NO_SUCH_PHOTO" });
  const r = judged(w, [Q]);
  assert.deepEqual(r.refusals.map((x) => x.reason),
    ["RELIED_ON_NOT_PRESENTABLE", "PHOTO_MARKS_UNDETERMINED", "PHOTO_UNCHECKED", "PHOTO_NOT_COVERABLE"]);
  assert.deepEqual(r.refusals[0].not_presentable[0].materials.map((m) => m.sha), [a]);
  assert.deepEqual(r.refusals[1].undetermined.map((m) => m.sha), [c]);
  assert.deepEqual(r.refusals[2].unchecked.map((m) => m.sha), [d]);
  assert.deepEqual(r.refusals[3].not_coverable[0].materials.map((m) => m.sha), [b]);
});

test("R6: photoRead reads R10's answer — no photo, a photo's state over its standing marks, its marks as read, copy and refused cover (a refused cover governing over an earlier copy; an unchecked photo with no copy), and unread for anything else; it never throws", () => {
  assert.deepEqual(PHOTO_STATES, ["marked", "nothing_to_obscure", "unchecked"]);
  assert.deepEqual(photoRead(() => ({ ok: true, capture: "s", photo: false })), { photo: false });
  const marks = [mark("M", AREA)], none = [mark("M", [])];
  assert.deepEqual(photoRead(() => ({ ok: true, photo: true, state: "marked", marks, copy: { sha256: COPY2 }, refused: null })),
    { photo: true, state: "marked", marks, copy: COPY2, refused: null });
  assert.deepEqual(photoRead(() => ({ ok: true, photo: true, state: "nothing_to_obscure", marks: none, copy: { sha256: COPY2 }, refused: null })),
    { photo: true, state: "nothing_to_obscure", marks: none, copy: COPY2, refused: null });
  assert.deepEqual(photoRead(() => ({ ok: true, photo: true, state: "marked", marks, copy: { sha256: COPY2 }, refused: { code: "PNG_INTERLACED", detail: "d" } })),
    { photo: true, state: "marked", marks, copy: null, refused: { code: "PNG_INTERLACED", detail: "d" } });
  assert.deepEqual(photoRead(() => ({ ok: true, photo: true, state: "unchecked", marks: [], copy: { sha256: COPY2 }, refused: null })),
    { photo: true, state: "unchecked", marks: [], copy: null, refused: null });
  for (const bad of [() => { throw new Error("x"); }, () => undefined, () => 7, () => ({ ok: false }), () => ({ ok: true }),
                     () => ({ ok: true, photo: true, state: "marked", marks, copy: null, refused: { code: 3 } }),
                     () => ({ ok: true, photo: true, state: "marked", marks: [null], copy: { sha256: COPY } }),
                     () => ({ ok: true, photo: true, state: "nothing_to_obscure", marks, copy: { sha256: COPY } })]) {
    const r = photoRead(bad);
    assert.deepEqual([r.photo, r.unread, typeof r.why], [null, true, "string"]);
  }
});

test("R7: a photo R6 answers with obscured is written with its original's fingerprint, extracted text's fingerprint, origin and archived copy, included: false, and obscured {copy, label}, the label null for an unmarked copy; its attestations as any document's; every other row states obscured: null; case-grammar's reader reads the rows back", () => {
  const w = setup();
  const p = w.doc(DOC, { co_archive: { service: "archive.example", locator: "https://archive.example/web/p" } }, { receipt: true });
  const d = w.doc(DOC2), n = w.doc(DOC3);
  w.marks.photo(p, { state: "marked", copy: COPY });
  w.marks.photo(n, { state: "nothing_to_obscure", copy: COPY2 });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }, { target: DOC3 }]);
  const reached = judged(w, [Q]);
  const out = w.cd.disclosureBlocks({ reached, project: "PROJ-x", author: "alice", at: AT });
  const held = reached.materials[0].held;
  assert.deepEqual(out.materials.rows, [
    { ref: DOC, kind: "document", sha: p, text_sha: held.text_sha, origin: `https://example.org/${DOC}`,
      archived_copy: w.cd.captureFacts(p).co_archive, included: false, rests_under: "load_bearing",
      obscured: { copy: COPY, label: OBSCURED_LABEL } },
    { ref: DOC2, kind: "document", sha: d, text_sha: reached.materials[1].held.text_sha, origin: null,
      archived_copy: null, included: true, rests_under: "load_bearing", obscured: null },
    { ref: DOC3, kind: "document", sha: n, text_sha: reached.materials[2].held.text_sha, origin: null,
      archived_copy: null, included: false, rests_under: "load_bearing", obscured: { copy: COPY2, label: null } }]);
  const kinds = (ref) => out.materials.attestations.filter((a) => a.ref === ref).map((a) => a.by_kind);
  const own = (ref) => kinds(ref).filter((k) => k !== "co_attestation");
  assert.deepEqual([own(DOC), own(DOC2)], [["project", "group"], ["project", "group"]], "as any document's");
  /* case-grammar R12: `obscured` written flat and read back as {copy, label} */
  const fm = w.fm(["---", `format: ${CASE_DOCUMENT_FORMAT}`,
    ...materialBlockLines({ materials: out.materials.rows, attestations: out.materials.attestations }), "---", ""].join("\n"));
  assert.deepEqual(materialsOf(fm).materials, out.materials.rows);
});

test("R29: photosOf answers the ceremony's Photos step over R6's materials — one entry per document whose capture is a photo, in materials order, with who took it, the members relying on it and their roles, its state, marks (with their withdrawals), copy, refused cover and words (photo.refused.unchecked for an unchecked photo, photo.refused.format for a refused cover marked or not, OBSCURED_LABEL for a marked copy, else null) — and unchecked counts the photos with no standing mark, each blocking signing; it reuses R6's read and writes nothing", () => {
  const w = setup();
  const pm = w.doc(DOC), pr = w.doc(DOC2), pu = w.doc(DOC3), plain = w.doc("INFO-2026-0004-d"), pn = w.doc("INFO-2026-0005-e");
  const withdrawn = [mark("M1", AREA, { by: "bo", at: AT, reason: "wrong" }), mark("M2", AREA)];
  w.marks.photo(pm, { state: "marked", copy: COPY, marks: withdrawn });
  w.marks.photo(pr, { state: "marked", refused: "UNSUPPORTED_JPEG_PROCESS" });
  w.marks.photo(pu, { state: "unchecked" });
  w.marks.photo(pn, { state: "nothing_to_obscure", copy: COPY2 });
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
  assert.deepEqual(marked, withdrawn, "the withdrawn mark shown with its withdrawal");
  assert.deepEqual([out.photos[1].state, out.photos[1].copy, out.photos[1].refused.code, out.photos[1].words, out.photos[1].taken_by],
    ["marked", null, "UNSUPPORTED_JPEG_PROCESS", PHOTO_NOT_COVERABLE_WORDS, null]);
  assert.deepEqual([out.photos[2].state, out.photos[2].words, out.photos[2].taken_by, out.photos[2].relied_on_by],
    ["unchecked", PHOTO_UNCHECKED_WORDS, "alice", [{ target: Q2, role: "supporting" }]]);
  assert.deepEqual([out.photos[3].state, out.photos[3].copy, out.photos[3].words], ["nothing_to_obscure", COPY2, null]);
  assert.equal(out.unchecked, 1);
  /* an unchecked photo blocks signing, even reached only by a supporting member, and never travels */
  assert.deepEqual(reached.refusals.map((r) => r.reason), ["PHOTO_UNCHECKED", "PHOTO_NOT_COVERABLE"]);
  assert.deepEqual(reached.refusals[0].unchecked.map((x) => x.sha), [pu]);
  assert.equal(reached.materials.find((m) => m.sha === pu).included, false, "never travels");
  /* a refused cover on an unmarked photo carries photo.refused.format too */
  const f = setup(); const fp = f.doc(DOC); f.marks.photo(fp, { state: "nothing_to_obscure", refused: "PNG_INTERLACED" }); f.finding(Q, [{ target: DOC }]);
  assert.deepEqual(f.cd.photosOf(judged(f, [Q]).materials, f.roles([Q]), V("alice")).photos.map((x) => [x.state, x.words]),
    [["nothing_to_obscure", PHOTO_NOT_COVERABLE_WORDS]]);
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

test("R6, R29 over the real case-carriage (its R10–R14): an unchecked photo is refused PHOTO_UNCHECKED; once marked it travels as its labelled copy; a withdrawn mark counts as withdrawn, so withdrawing the only mark makes it unchecked again; marked as having nothing to obscure it travels as its copy with no label; a refused cover, marked or not, is PHOTO_NOT_COVERABLE; a document that is no image travels whole", async () => {
  const w = world({ realCarriage: true });
  for (const m of ["alice", "bo"]) w.member(m);
  /* DOC2 fetched by this copy (provenance R62), so case-carriage R16 answers it public, carried as captured */
  const p = w.doc(DOC, {}, { name: "c0.png" }), d = w.doc(DOC2, {}, { receipt: true });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const view = () => {
    const r = judged(w, [Q]);
    const photos = w.cd.photosOf(r.materials, w.roles([Q]), V("alice"));
    return { r, photos };
  };
  /* unchecked: no mark */
  let { r, photos } = view();
  assert.deepEqual(r.refusals.map((x) => x.reason), ["PHOTO_UNCHECKED"]);
  assert.deepEqual(r.refusals[0].unchecked, [{ ref: DOC, sha: p, members: [Q] }]);
  assert.deepEqual(r.materials.map((m) => [m.ref, m.included, m.obscured]), [[DOC, false, null], [DOC2, true, null]]);
  assert.deepEqual([photos.unchecked, photos.photos.map((x) => [x.sha, x.state, x.words])], [1, [[p, "unchecked", PHOTO_UNCHECKED_WORDS]]]);
  /* marked: carried as its labelled copy */
  const m1 = await w.carriage.obscureMark({ captureSha: p, areas: [{ rect: [0, 0, 4, 4], kind: "person" }], by: V("alice") });
  assert.equal(m1.ok, true, JSON.stringify(m1));
  ({ r, photos } = view());
  assert.deepEqual(r.refusals, []);
  assert.deepEqual(r.materials[0].obscured, { copy: m1.copy.sha256, label: OBSCURED_LABEL });
  assert.deepEqual(photos.photos.map((x) => [x.state, x.copy, x.words, x.marks.length]), [["marked", m1.copy.sha256, OBSCURED_LABEL, 1]]);
  /* the only mark withdrawn: unchecked again, the withdrawal shown */
  const wd = await w.carriage.obscureMarkWithdraw({ captureSha: p, mark: String(m1.mark), reason: "it covered the wrong thing", by: V("bo") });
  assert.equal(wd.ok, true, JSON.stringify(wd));
  ({ r, photos } = view());
  assert.deepEqual(r.refusals.map((x) => x.reason), ["PHOTO_UNCHECKED"]);
  assert.deepEqual([r.materials[0].obscured, photos.photos[0].state, photos.photos[0].marks[0].withdrawn.by], [null, "unchecked", V("bo")]);
  /* nothing to obscure: its copy, no label */
  const m2 = await w.carriage.obscureMark({ captureSha: p, areas: [], by: V("alice") });
  assert.equal(m2.ok, true, JSON.stringify(m2));
  ({ r, photos } = view());
  assert.deepEqual(r.refusals, []);
  assert.deepEqual(r.materials[0].obscured, { copy: m2.copy.sha256, label: null });
  assert.deepEqual(photos.photos.map((x) => [x.state, x.words]), [["nothing_to_obscure", null]]);
  /* a cover refused on a photo marked as having nothing to obscure */
  const p2 = w.doc(DOC3, {}, { name: "c1.png", text: "a second photo" });
  w.finding(Q2, [{ target: DOC3 }]);
  w.cover.refuse = "NOT_A_COVERABLE_FORMAT";
  const m3 = await w.carriage.obscureMark({ captureSha: p2, areas: [], by: V("alice") });
  assert.deepEqual([m3.ok, m3.state, m3.refused && m3.refused.code], [true, "nothing_to_obscure", "NOT_A_COVERABLE_FORMAT"]);
  const r2 = judged(w, [Q2]);
  assert.deepEqual(r2.refusals.map((x) => x.reason), ["PHOTO_NOT_COVERABLE"]);
  assert.deepEqual(r2.refusals[0].not_coverable, [{ target: Q2, materials: [{ ref: DOC3, sha: p2, refused: "NOT_A_COVERABLE_FORMAT" }] }]);
  assert.deepEqual(w.cd.photosOf(r2.materials, w.roles([Q2]), V("alice")).photos.map((x) => x.words), [PHOTO_NOT_COVERABLE_WORDS]);
  void d;
});
