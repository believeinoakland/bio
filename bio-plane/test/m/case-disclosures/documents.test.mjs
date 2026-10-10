/* case-disclosures (T39; N806; K2315, K2333): a member document a case relies on. R6: a document that is no photo is
   judged by the state `case-carriage.documentCopy` (its R16) answers — `undetermined` refused DOCUMENT_COPY_UNDETERMINED
   whichever chain reaches it; `pending` refused DOCUMENT_COPY_PENDING and `refused` DOCUMENT_NOT_CLEANABLE when a
   load-bearing chain reaches it, else listed `included: false` with no `obscured`; `copy` carried as its cleaned copy
   (`included: false`, `obscured: {copy, label: COPY_CLEANED_LABEL, label_key: "document.cleaned.label"}`, K2483);
   `clean` and `public` by what is held. R7: the copy row `{copy, label}`. R22: the three rows, two of them reading
   `words.json`'s `document.refused.clean` and `document.refused.pending` by key (DEC-188 (7)). `documentCopy` is the
   fixture's stand-in at its ruled interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { world, V, sha } from "./fixture.mjs";
import { CASE_DISCLOSURE_CHECKS, DOCUMENT_WORDS, DOCUMENT_STATES, documentRead } from "../../../src/case-disclosures/index.mjs";
import { COPY_CLEANED_LABEL, OBSCURED_LABEL } from "../../../src/case-carriage/index.mjs";
import { CASE_DOCUMENT_FORMAT, materialBlockLines, materialsOf } from "../../../src/case-grammar/index.mjs";

const DOC = "INFO-2026-0001-a", DOC2 = "INFO-2026-0002-b", DOC3 = "INFO-2026-0003-c", DOC4 = "INFO-2026-0004-d";
const DOC5 = "INFO-2026-0005-e";
const Q = "INQ-2026-0001-q", Q2 = "INQ-2026-0002-q";
const COPY = "c".repeat(64), COPY2 = "d".repeat(64);
const AT = "2026-09-28T01:00:00Z";
/* doc-clean's refusals by name (its R3), as case-carriage R16 relays them in `refused.code` */
const CLEAN_REFUSALS = ["ENCRYPTED", "EMBEDDED_FILE", "IMAGE_NOT_CLEANABLE", "HTML_EMBEDS_IMAGE", "NOT_A_CLEANABLE_FORMAT",
                        "DOCUMENT_TOO_LARGE", "DOCUMENT_UNREADABLE"];
const WORDS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
const wordOf = (key) => (Array.isArray(WORDS) ? WORDS : WORDS.words || Object.values(WORDS).find(Array.isArray)).find((w) => w && w.key === key);
/* R6 (K2483): a member document's copy, as R6 answers it; R7's row drops the key */
const CLEANED = (copy) => ({ copy, label: COPY_CLEANED_LABEL, label_key: "document.cleaned.label" });
const OBSCURED = (copy) => ({ copy, label: OBSCURED_LABEL, marked: true, label_key: "photo.obscured.label" });
const copyOf = (copy) => ({ state: "copy", copy, refused: null });
const refusedBy = (code) => ({ state: "refused", copy: null, refused: { code, detail: `doc-clean refused: ${code}` } });
function refused(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 400));
  assert.deepEqual([r.reason, r.code, r.check, r.translation],
    [code, code, CASE_DISCLOSURE_CHECKS[code].check, CASE_DISCLOSURE_CHECKS[code].translation]);
}
function setup() { const w = world(); for (const m of ["alice", "bo"]) w.member(m); return w; }
const judged = (w, members, supporting = [], viewer = V("alice")) =>
  w.cd.materialsJudged(w.prepared(members), w.roles(members, supporting), viewer);

test("R22: DOCUMENT_COPY_UNDETERMINED, DOCUMENT_COPY_PENDING and DOCUMENT_NOT_CLEANABLE are rows of this family; DOCUMENT_COPY_PENDING's and DOCUMENT_NOT_CLEANABLE's words are words.json's document.refused.pending and document.refused.clean (DEC-188 (7)), read by key, verbatim, each naming {document}, held once in DOCUMENT_WORDS; document.cleaned.label is case-carriage's words, answered by its key", () => {
  assert.deepEqual(Object.keys(DOCUMENT_WORDS), ["document.refused.clean", "document.refused.pending"]);
  for (const key of Object.keys(DOCUMENT_WORDS)) {
    const w = wordOf(key);
    assert.ok(w, key);
    assert.equal(DOCUMENT_WORDS[key], w.en, key);
    assert.ok(w.en.includes("{document}"), key);
  }
  /* protected as words.json states it: `clean` protected; `pending` held unprotected there (reported to BOB, J1) */
  assert.deepEqual(Object.keys(DOCUMENT_WORDS).map((k) => wordOf(k).protected), [true, false]);
  assert.equal(COPY_CLEANED_LABEL, wordOf("document.cleaned.label").en, "the cleaned copy's label is case-carriage's, by its key");
  assert.ok(Object.isFrozen(DOCUMENT_WORDS));
  assert.equal(CASE_DISCLOSURE_CHECKS.DOCUMENT_NOT_CLEANABLE.translation, DOCUMENT_WORDS["document.refused.clean"]);
  assert.equal(CASE_DISCLOSURE_CHECKS.DOCUMENT_COPY_PENDING.translation, DOCUMENT_WORDS["document.refused.pending"]);
  assert.equal(CASE_DISCLOSURE_CHECKS.DOCUMENT_COPY_UNDETERMINED.translation, "A document this case relies on could not be checked for the details a member's file can carry, so what the published case would show of it is not known. Try again. Nothing was written.");
  assert.ok(typeof COPY_CLEANED_LABEL === "string" && COPY_CLEANED_LABEL.length > 0 && COPY_CLEANED_LABEL !== OBSCURED_LABEL,
    "the label is case-carriage's own, not a photo's");
});

test("R6 (copy): a member document whose copy state is copy is answered included: false with obscured {copy, label: COPY_CLEANED_LABEL, label_key: document.cleaned.label}, held whole or not, load-bearing or supporting; it is presentable through its copy and never RELIED_ON_NOT_PRESENTABLE; documentCopy is asked once per document that is no photo, and never of a photo or an observation; nothing is written", () => {
  const w = setup();
  const a = w.doc(DOC), b = w.doc(DOC2, {}, { indexed: false }), p = w.doc(DOC3), o = w.doc(DOC4), plain = w.doc(DOC5);
  w.st.sql.exec(`UPDATE register SET authored=1 WHERE bundle_id=?`, DOC4);
  w.marks.document(a, copyOf(COPY.toUpperCase()));
  w.marks.document(b, copyOf(COPY2));
  w.marks.photo(p, { state: "marked", copy: COPY });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }, { target: DOC3 }, { target: DOC4 }, { target: DOC5 }]);
  const before = w.snapshot();
  for (const supporting of [[], [Q]]) {
    w.marks.copyAsked.length = 0;
    const r = judged(w, [Q], supporting);
    assert.deepEqual(r.refusals, [], JSON.stringify(supporting));
    assert.deepEqual(r.materials.map((m) => [m.ref, m.kind, m.included, m.obscured]), [
      [DOC, "document", false, CLEANED(COPY)],
      [DOC2, "document", false, CLEANED(COPY2)],
      [DOC3, "document", false, OBSCURED(COPY)],
      [DOC4, "observation", true, null],
      [DOC5, "document", true, null]]);
    assert.equal(r.materials[0].held.whole, true, "held whole, and still carried only as its copy");
    assert.deepEqual(r.materials[1].held.missing, ["extracted_text"], "what is held of the original is still stated");
    assert.deepEqual(r.materials.map((m) => m.document && m.document.state), ["copy", "copy", null, null, "public"]);
    assert.deepEqual(w.marks.copyAsked, [a, b, plain], "asked of each document that is no photo, once");
  }
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* negative control: the same document public and not held whole is C-120.8 */
  w.marks.document(b, "public");
  const r = judged(w, [Q]);
  refused(r.refusals[0], "RELIED_ON_NOT_PRESENTABLE");
  assert.deepEqual(r.refusals[0].not_presentable[0].materials.map((m) => m.sha), [b]);
  void o;
});

test("R6 (pending): a member document whose copy is still being made is refused DOCUMENT_COPY_PENDING when a load-bearing chain reaches it, naming each document and member, with document filling {document}; when only supporting chains reach it, it is listed included: false with no obscured and never refused; it is never C-120.8, held whole or not; it writes nothing", () => {
  const w = setup();
  const a = w.doc(DOC), b = w.doc(DOC2, {}, { indexed: false });
  w.marks.document(a, "pending"); w.marks.document(b, "pending");
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  w.finding(Q2, [{ target: DOC }]);
  const before = w.snapshot();
  const r = judged(w, [Q, Q2]);
  assert.equal(r.refusals.length, 1);
  refused(r.refusals[0], "DOCUMENT_COPY_PENDING");
  assert.deepEqual(r.refusals[0].pending, [
    { target: Q, materials: [{ ref: DOC, sha: a }, { ref: DOC2, sha: b }] },
    { target: Q2, materials: [{ ref: DOC, sha: a }] }]);
  assert.equal(r.refusals[0].document, `${DOC}, ${DOC2}`);
  assert.ok(r.refusals[0].detail.includes(a) && r.refusals[0].detail.endsWith("Nothing was written."));
  assert.deepEqual(r.materials.map((m) => [m.included, m.obscured]), [[false, null], [false, null]], "never whole");
  assert.deepEqual(judged(w, [Q, Q2], [Q]).refusals[0].pending.map((x) => x.target), [Q2], "only the load-bearing named");
  const s = judged(w, [Q, Q2], [Q, Q2]);
  assert.deepEqual(s.refusals, []);
  assert.deepEqual(s.materials.map((m) => [m.ref, m.included, m.obscured, m.rests_under]),
    [[DOC, false, null, "supporting"], [DOC2, false, null, "supporting"]]);
  assert.deepEqual(w.snapshot(), before, "nothing written");
  /* negative control: the copy made */
  w.marks.document(a, copyOf(COPY)); w.marks.document(b, copyOf(COPY2));
  assert.deepEqual(judged(w, [Q, Q2]).refusals, []);
});

test("R6 (refused): a member document doc-clean refused, for every code it refuses by name, is refused DOCUMENT_NOT_CLEANABLE when a load-bearing chain reaches it, naming each document, member and doc-clean's code, with document filling {document}; when only supporting chains reach it, it is listed included: false with no obscured and never refused; it is never carried whole and never C-120.8; it writes nothing", () => {
  for (const code of CLEAN_REFUSALS) {
    const w = setup();
    const a = w.doc(DOC), b = w.doc(DOC2, {}, { indexed: false });
    w.marks.document(a, refusedBy(code)); w.marks.document(b, refusedBy(code));
    w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
    w.finding(Q2, [{ target: DOC }]);
    const before = w.snapshot();
    const r = judged(w, [Q, Q2]);
    assert.equal(r.refusals.length, 1, code);
    refused(r.refusals[0], "DOCUMENT_NOT_CLEANABLE");
    assert.deepEqual(r.refusals[0].not_cleanable, [
      { target: Q, materials: [{ ref: DOC, sha: a, refused: code }, { ref: DOC2, sha: b, refused: code }] },
      { target: Q2, materials: [{ ref: DOC, sha: a, refused: code }] }], code);
    assert.equal(r.refusals[0].document, `${DOC}, ${DOC2}`);
    assert.ok(r.refusals[0].detail.includes(code) && r.refusals[0].detail.endsWith("Nothing was written."), code);
    assert.deepEqual(r.materials.map((m) => [m.included, m.obscured]), [[false, null], [false, null]], code);
    assert.deepEqual(r.materials.map((m) => m.document.refused.code), [code, code]);
    assert.deepEqual(w.snapshot(), before, `${code}: nothing written`);
    const s = judged(w, [Q, Q2], [Q, Q2]);
    assert.deepEqual(s.refusals, [], code);
    assert.deepEqual(s.materials.map((m) => [m.included, m.obscured, m.rests_under]),
      [[false, null, "supporting"], [false, null, "supporting"]], code);
    assert.deepEqual(judged(w, [Q, Q2], [Q]).refusals[0].not_cleanable.map((x) => x.target), [Q2], code);
  }
});

test("R6 (undetermined): a document whose copy state cannot be read — a read that throws, refuses or answers nothing, case-carriage's own undetermined, an unknown state, copy with no SHA-256, refused with no code, or photo for a document whose marks say it is none — is refused DOCUMENT_COPY_UNDETERMINED, naming it, whichever chain reaches it, held whole or not; it fails closed: it is never included; it writes nothing", () => {
  const reads = {
    throws: () => { throw new Error("down"); },
    refuses: () => ({ ok: false, reason: "NO_SUCH_CAPTURE" }),
    nothing: () => null,
    "case-carriage's undetermined": () => ({ state: "undetermined", copy: null, refused: null }),
    "an unknown state": () => ({ state: "scrubbed", copy: null, refused: null }),
    "copy with no digest": () => ({ state: "copy", copy: "x", refused: null }),
    "copy with none": () => ({ state: "copy", copy: null, refused: null }),
    "refused with no code": () => ({ state: "refused", copy: null, refused: { detail: "d" } }),
    "refused with none": () => ({ state: "refused", copy: null, refused: null }),
    "photo for no photo": () => ({ state: "photo", copy: null, refused: null }),
  };
  for (const [why, read] of Object.entries(reads)) for (const indexed of [true, false]) {
    const w = setup();
    const d = w.doc(DOC, {}, { indexed });
    w.finding(Q, [{ target: DOC }]);
    w.marks.copyRead = read;
    const before = w.snapshot();
    for (const supporting of [[], [Q]]) {
      const r = judged(w, [Q], supporting);
      assert.equal(r.refusals.length, 1, `${why} ${indexed} ${supporting}`);
      refused(r.refusals[0], "DOCUMENT_COPY_UNDETERMINED");
      assert.deepEqual(r.refusals[0].undetermined.map((u) => [u.ref, u.sha, u.members]), [[DOC, d, [Q]]], why);
      assert.equal(typeof r.refusals[0].undetermined[0].why, "string");
      assert.equal(r.refusals[0].document, DOC);
      assert.deepEqual([r.materials[0].included, r.materials[0].obscured], [false, null], `${why}: never carried whole`);
    }
    assert.deepEqual(w.snapshot(), before, `${why}: nothing written`);
  }
});

test("R6 (clean, public): a document carried as captured (public) or carrying no details (clean) is judged as any document, by what is held: included when held whole, RELIED_ON_NOT_PRESENTABLE when a load-bearing chain reaches it not held whole, listed included: false when only supporting chains do", () => {
  for (const state of ["clean", "public"]) {
    const w = setup();
    const a = w.doc(DOC), b = w.doc(DOC2, {}, { indexed: false });
    w.marks.document(a, state); w.marks.document(b, state);
    w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
    const r = judged(w, [Q]);
    assert.deepEqual(r.refusals.map((x) => x.reason), ["RELIED_ON_NOT_PRESENTABLE"], state);
    assert.deepEqual(r.refusals[0].not_presentable, [{ target: Q, materials: [{ ref: DOC2, kind: "document", sha: b, missing: ["extracted_text"] }] }]);
    assert.deepEqual(r.materials.map((m) => [m.included, m.obscured]), [[true, null], [false, null]], state);
    const s = judged(w, [Q], [Q]);
    assert.deepEqual([s.refusals, s.materials.map((m) => m.included)], [[], [true, false]], state);
  }
});

test("R6: the refusals in the order R6 states them — RELIED_ON_NOT_PRESENTABLE, the photos' (PHOTO_MARKS_UNDETERMINED, PHOTO_UNCHECKED, PHOTO_NOT_COVERABLE), then the documents' (DOCUMENT_COPY_UNDETERMINED, DOCUMENT_COPY_PENDING, DOCUMENT_NOT_CLEANABLE) — each naming only its own materials", () => {
  const w = setup();
  const ids = ["INFO-2026-0011-a", "INFO-2026-0012-a", "INFO-2026-0013-a", "INFO-2026-0014-a", "INFO-2026-0015-a",
               "INFO-2026-0016-a", "INFO-2026-0017-a"];
  const [short, unread, unchecked, uncover, undet, pend, refuse] = ids.map((id, i) => w.doc(id, {}, { indexed: i !== 0 }));
  w.marks.answer(unread, { ok: false, reason: "NO_SUCH_PHOTO" });
  w.marks.photo(unchecked, { state: "unchecked" });
  w.marks.photo(uncover, { state: "marked", refused: "PNG_INTERLACED" });
  w.marks.document(undet, "undetermined");
  w.marks.document(pend, "pending");
  w.marks.document(refuse, refusedBy("ENCRYPTED"));
  w.finding(Q, ids.map((target) => ({ target })));
  const r = judged(w, [Q]);
  assert.deepEqual(r.refusals.map((x) => x.reason), ["RELIED_ON_NOT_PRESENTABLE", "PHOTO_MARKS_UNDETERMINED", "PHOTO_UNCHECKED",
    "PHOTO_NOT_COVERABLE", "DOCUMENT_COPY_UNDETERMINED", "DOCUMENT_COPY_PENDING", "DOCUMENT_NOT_CLEANABLE"]);
  assert.deepEqual(r.refusals[0].not_presentable[0].materials.map((m) => m.sha), [short]);
  assert.deepEqual(r.refusals[1].undetermined.map((m) => m.sha), [unread]);
  assert.deepEqual(r.refusals[2].unchecked.map((m) => m.sha), [unchecked]);
  assert.deepEqual(r.refusals[3].not_coverable[0].materials.map((m) => m.sha), [uncover]);
  assert.deepEqual(r.refusals[4].undetermined.map((m) => m.sha), [undet]);
  assert.deepEqual(r.refusals[5].pending[0].materials.map((m) => m.sha), [pend]);
  assert.deepEqual(r.refusals[6].not_cleanable[0].materials.map((m) => m.sha), [refuse]);
});

test("R6: documentRead reads R16's answer — public, clean and pending as stated, copy with its SHA-256 (lower case), refused with doc-clean's {code, detail}, and undetermined with why for anything else; it never throws", () => {
  assert.deepEqual(DOCUMENT_STATES, ["public", "clean", "copy", "refused", "pending", "undetermined", "photo"]);
  for (const state of ["public", "clean", "pending"])
    assert.deepEqual(documentRead(() => ({ state, copy: null, refused: null })), { state, copy: null, refused: null });
  assert.deepEqual(documentRead(() => ({ state: "copy", copy: COPY.toUpperCase(), refused: null })), { state: "copy", copy: COPY, refused: null });
  assert.deepEqual(documentRead(() => ({ state: "refused", copy: null, refused: { code: "ENCRYPTED", detail: "d" } })),
    { state: "refused", copy: null, refused: { code: "ENCRYPTED", detail: "d" } });
  assert.deepEqual(documentRead(() => ({ state: "refused", copy: null, refused: { code: "ENCRYPTED" } })).refused, { code: "ENCRYPTED", detail: null });
  for (const bad of [() => { throw new Error("x"); }, () => undefined, () => 7, () => ({ ok: false }), () => ({}),
                     () => ({ state: "undetermined" }), () => ({ state: "photo" }), () => ({ state: "copy", copy: { sha256: COPY } }),
                     () => ({ state: "refused", refused: { code: "" } })]) {
    const r = documentRead(bad);
    assert.deepEqual([r.state, r.copy, r.refused, typeof r.why], ["undetermined", null, null, "string"]);
  }
});

test("R7: a member document R6 answers with obscured is written as a photo's copy row is — its original's fingerprint, extracted text's fingerprint, origin and archived copy, included: false, and obscured {copy, label: COPY_CLEANED_LABEL} — with its attestations as any document's; case-grammar's reader reads the rows back", () => {
  const w = setup();
  const a = w.doc(DOC, { co_archive: { service: "archive.example", locator: "https://archive.example/web/a" } }, { receipt: true });
  const d = w.doc(DOC2);
  w.marks.document(a, copyOf(COPY));
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  const reached = judged(w, [Q]);
  assert.deepEqual(reached.refusals, []);
  const out = w.cd.disclosureBlocks({ reached, project: "PROJ-x", author: "alice", at: AT });
  const held = reached.materials[0].held;
  assert.ok(held.text_sha, "the original's extracted text is fingerprinted");
  assert.deepEqual(out.materials.rows, [
    { ref: DOC, kind: "document", sha: a, text_sha: held.text_sha, origin: `https://example.org/${DOC}`,
      archived_copy: w.cd.captureFacts(a).co_archive, included: false, rests_under: "load_bearing",
      obscured: { copy: COPY, label: COPY_CLEANED_LABEL } },
    { ref: DOC2, kind: "document", sha: d, text_sha: reached.materials[1].held.text_sha, origin: null,
      archived_copy: null, included: true, rests_under: "load_bearing", obscured: null }]);
  assert.equal(out.materials.rows[0].archived_copy, "https://archive.example/web/a");
  const own = (ref) => out.materials.attestations.filter((x) => x.ref === ref && x.by_kind !== "co_attestation").map((x) => x.by_kind);
  assert.deepEqual([own(DOC), own(DOC2)], [["project", "group"], ["project", "group"]], "as any document's");
  const fm = w.fm(["---", `format: ${CASE_DOCUMENT_FORMAT}`,
    ...materialBlockLines({ materials: out.materials.rows, attestations: out.materials.attestations }), "---", ""].join("\n"));
  assert.deepEqual(materialsOf(fm).materials, out.materials.rows);
});

test("R6, R7 over the real case-carriage (its R15, R16): a member document (no receipt fetched it) is pending and refused DOCUMENT_COPY_PENDING until copyBatch derives its copy, then travels as its cleaned copy labelled COPY_CLEANED_LABEL; one doc-clean refuses is DOCUMENT_NOT_CLEANABLE with doc-clean's code; one with nothing to clean travels whole; a document this copy fetched is public and travels whole, never queued", async () => {
  const w = world({ realCarriage: true });
  for (const m of ["alice", "bo"]) w.member(m);
  const fetched = w.doc(DOC, {}, { receipt: true });
  const member = w.doc(DOC2, {}, { text: "a member's file" });
  w.finding(Q, [{ target: DOC }, { target: DOC2 }]);
  let r = judged(w, [Q]);
  assert.deepEqual(r.refusals.map((x) => x.reason), ["DOCUMENT_COPY_PENDING"]);
  assert.deepEqual(r.refusals[0].pending, [{ target: Q, materials: [{ ref: DOC2, sha: member }] }]);
  assert.deepEqual(r.materials.map((m) => [m.ref, m.document.state, m.included, m.obscured]),
    [[DOC, "public", true, null], [DOC2, "pending", false, null]]);
  assert.deepEqual(judged(w, [Q], [Q]).refusals, [], "supporting only: listed, never refused");
  /* derived: a rewritten copy */
  const copied = Uint8Array.from(Buffer.from("a member's file, cleaned"));
  w.clean.answer = () => ({ ok: true, clean: false, bytes: copied, format: "pdf", images: { stripped: 1, unchanged: 0 } });
  const b = await w.carriage.copyBatch({});
  assert.equal(b.copied, 1, JSON.stringify(b));
  r = judged(w, [Q]);
  assert.deepEqual(r.refusals, []);
  assert.deepEqual(r.materials[1].obscured, CLEANED(sha(copied)));
  assert.equal(r.materials[1].included, false);
  const out = w.cd.disclosureBlocks({ reached: r, project: "PROJ-x", author: "alice", at: AT });
  assert.deepEqual([out.materials.rows[1].sha, out.materials.rows[1].obscured], [member, { copy: sha(copied), label: COPY_CLEANED_LABEL }]);
  /* refused by doc-clean */
  const enc = w.doc(DOC3, {}, { text: "an encrypted file" });
  w.finding(Q2, [{ target: DOC3 }]);
  assert.deepEqual(judged(w, [Q2]).refusals.map((x) => x.reason), ["DOCUMENT_COPY_PENDING"], "queued by the read");
  w.clean.answer = () => ({ ok: false, code: "ENCRYPTED", detail: "the file is encrypted" });
  await w.carriage.copyBatch({});
  r = judged(w, [Q2]);
  assert.deepEqual(r.refusals.map((x) => x.reason), ["DOCUMENT_NOT_CLEANABLE"]);
  assert.deepEqual(r.refusals[0].not_cleanable, [{ target: Q2, materials: [{ ref: DOC3, sha: enc, refused: "ENCRYPTED" }] }]);
  /* nothing to clean: carried whole */
  const plain = w.doc(DOC4, {}, { text: "a plain text file" });
  w.finding("INQ-2026-0003-q", [{ target: DOC4 }]);
  judged(w, ["INQ-2026-0003-q"]);
  w.clean.answer = null;
  await w.carriage.copyBatch({});
  r = judged(w, ["INQ-2026-0003-q"]);
  assert.deepEqual([r.refusals, r.materials.map((m) => [m.sha, m.document.state, m.included, m.obscured])], [[], [[plain, "clean", true, null]]]);
  void fetched;
});
