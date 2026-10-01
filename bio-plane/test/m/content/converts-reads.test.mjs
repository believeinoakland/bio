/* content: the share of three old suites no module test proved — `content-reads.test.mjs` (a whole-document
   attestation's coverage of a page and a document row, R21; the two legitimate nulls' sentences, R28; attestations kept
   and marked across a re-read, R22/R43/R44), `transcribe.test.mjs` (the routing case on a chainless capture, R21; a
   region typing's attestation scope, R25; `attestationsFor` never lists a typing's attestations, R44; the mint label,
   R16; malformed and bytes portions, R23) and `textchain.test.mjs` (the attestor is the `member` stamp, never a body
   field, R43). Driven at content's interface; extraction's facts come through the fixture's `w.read`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { TRANSCRIBE_CHECKS } from "../../../src/content/index.mjs";
import { EARNED_CAPTURE_CEILING } from "../../../src/record-grammar/index.mjs";

const DOC = "INFO-2026-0001-a";
const OCR = [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
             { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
               extent: { kind: "pages", pages: [0, 1, 2] } }];
const OCR_NEW = [{ step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
                 { step: "ocr", engine: "tesseract", version: "5.4.0", cap: "B", confidence: { basis: "none" },
                   extent: { kind: "pages", pages: [0, 1, 2] } }];
const REGION = { kind: "pdf-page", page: 1, rect: [10, 10, 200, 100] };
const TYPED = "Know all men by these presents, that the Grantor conveys unto the Grantee Lot 7, Block 3.";
const ceil = (x) => [x.transcription.ceiling, x.transcription.determinant, x.transcription.by];

function paged() {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 3 });
  const mint = (e) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: V("bo") }).content_id;
  return { w, a, mint };
}

/* ------------------------------------------------------------- content-reads */

test("R21 (content-reads): a page attestation covers the page row and not the document row; a whole-document attestation covers both, and names only its attestor on the document row", () => {
  const { w, a, mint } = paged();
  const DOC_ROW = mint({ kind: "document" });
  const PAGE_ROW = mint({ kind: "pdf-page", page: 1, rect: [10, 20, 100, 200] });
  const OTHER_PAGE = mint({ kind: "pdf-page", page: 2 });
  let s = w.content.standings([DOC_ROW, PAGE_ROW, OTHER_PAGE]);
  assert.deepEqual([ceil(s[DOC_ROW]), ceil(s[PAGE_ROW])], [["C", "derivation", []], ["C", "derivation", []]],
    "no attestation: both bounded by the chain's measured letter");

  assert.equal(w.content.attestText({ captureSha: a.sha, viewer: V("ho"), member: V("ho"), extent: { kind: "page", page: 1 } }).ok, true);
  s = w.content.standings([DOC_ROW, PAGE_ROW, OTHER_PAGE]);
  assert.deepEqual(ceil(s[PAGE_ROW]), [EARNED_CAPTURE_CEILING, "attestation", [V("ho")]], "the page row is raised by the page attestation");
  assert.deepEqual(ceil(s[DOC_ROW]), ["C", "derivation", []], "a page attestation does not cover the whole document");
  assert.deepEqual(ceil(s[OTHER_PAGE]), ["C", "derivation", []], "nor another page");

  /* the other direction: a coverage rule that covered nothing would also leave the document row at C */
  assert.equal(w.content.attestText({ captureSha: a.sha, viewer: V("ro"), member: V("ro"), extent: { kind: "document" } }).ok, true);
  s = w.content.standings([DOC_ROW, PAGE_ROW, OTHER_PAGE]);
  assert.deepEqual(s[DOC_ROW].transcription.ceiling, EARNED_CAPTURE_CEILING);
  assert.equal(s[DOC_ROW].transcription.determinant, "attestation", "a document attestation raises the document row");
  assert.deepEqual(s[DOC_ROW].transcription.by, [V("ro")], "and only the document attestor covers it");
  assert.deepEqual([...s[PAGE_ROW].transcription.by].sort(), [V("ho"), V("ro")], "a document attestation covers a page too");
  assert.deepEqual(s[OTHER_PAGE].transcription.by, [V("ro")]);

  /* the same rule at the fixed-key read */
  const cPage = w.content.contentRead({ id: PAGE_ROW, viewer: V("bo") });
  assert.deepEqual(cPage.attestations.covering.map((x) => x.attestor).sort(), [V("ho"), V("ro")]);
  assert.deepEqual([cPage.transcription.ceiling, cPage.transcription.determinant], [EARNED_CAPTURE_CEILING, "attestation"]);
  const cDoc = w.content.contentRead({ id: DOC_ROW, viewer: V("bo") });
  assert.deepEqual(cDoc.attestations.covering.map((x) => x.attestor), [V("ro")], "the page attestation is withheld from covering");
  assert.deepEqual(cDoc.attestations.all.map((x) => x.attestor).sort(), [V("ho"), V("ro")], "and never hidden from all");
});

test("R28 (content-reads): the two legitimate nulls are stated as which, each with its own sentence; a held capture resolves with no null case", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 3 });
  w.inquiry("INQ-2026-0001-q");
  w.doc("INFO-2026-0002-nobytes", []);
  const inq = w.content.resolveCitation({ target: "INQ-2026-0001-q" });
  const none = w.content.resolveCitation({ target: "INFO-2026-0002-nobytes" });
  assert.deepEqual([inq.content_id, inq.null_case], [null, "INQUIRY_TARGET"]);
  assert.match(inq.why, /INQ-2026-0001-q is an inquiry rather than a document/);
  assert.match(inq.why, /no capture and therefore no part to point at/);
  assert.match(inq.why, /DEC-21/);
  assert.deepEqual([none.content_id, none.null_case], [null, "NO_BYTES_HELD"]);
  assert.match(none.why, /holds no capture of INFO-2026-0002-nobytes/);
  assert.match(none.why, /never evidence about what the document says/);
  assert.notEqual(inq.null_case, none.null_case, "never collapsed into one code");
  assert.notEqual(inq.why, none.why);
  /* negative control: a document whose capture is held resolves to a row and carries no null case at all */
  const held = w.content.resolveCitation({ target: DOC });
  assert.match(held.content_id, /^[0-9a-f]{64}$/);
  assert.equal("null_case" in held, false);
  assert.equal("why" in held, false);
});

test("R22, R43, R44 (content-reads): after a re-read the row is stale and still resolves; the attestations are kept, not deleted, marked stale against the capture's new chain, and still cover the row they were made under", () => {
  const { w, a, mint } = paged();
  const DOC_ROW = mint({ kind: "document" });
  const PAGE_ROW = mint({ kind: "pdf-page", page: 1 });
  w.content.attestText({ captureSha: a.sha, viewer: V("ho"), member: V("ho"), extent: { kind: "page", page: 1 }, at: "2026-09-14T00:00:00Z" });
  w.content.attestText({ captureSha: a.sha, viewer: V("ro"), member: V("ro"), extent: { kind: "document" }, at: "2026-09-14T01:00:00Z" });
  const before = w.rows(`SELECT * FROM text_attestations ORDER BY attestor`);

  /* the document is re-read: extraction holds the new chain and fires the reading-replaced notice */
  w.read(a.sha, { chain: OCR_NEW, pageCount: 3 });
  assert.equal(w.content.markStale(a.sha, OCR_NEW), 2);
  assert.deepEqual(w.rows(`SELECT * FROM text_attestations ORDER BY attestor`), before, "kept byte for byte, never deleted");

  const c = w.content.contentRead({ id: PAGE_ROW, viewer: V("bo") });
  assert.deepEqual([c.ok, c.stale, c.content_id, c.capture_sha], [true, true, PAGE_ROW, a.sha], "stale, and it still resolves where it pointed");
  assert.match(c.says, /has since been re-read/);
  assert.deepEqual([c.attestations.all.length, c.attestations.covering.length, c.transcription.determinant],
    [2, 2, "attestation"], "made against the row's own chain: they checked the text this citation points at");
  assert.deepEqual(c.attestations.all.map((x) => x.stale), [false, false], "not stale relative to the row");
  assert.equal(w.content.standings([DOC_ROW])[DOC_ROW].stale, true);

  /* against the capture's CURRENT chain they are stale, listed, and raise nothing */
  const r = w.content.attestationsFor(a.sha, { page: 1 }, V("bo"));
  assert.deepEqual(r.attestations.map((x) => [x.attestor, x.stale]), [[V("ho"), true], [V("ro"), true]]);
  assert.equal(r.count, 2);
  assert.deepEqual(r.attestations.map((x) => x.chain_at_attestation), [OCR, OCR], "the chain as it stood at attestation");
  assert.equal(r.ceiling.determinant, "derivation", "a stale attestation raises nothing on the live chain");

  /* negative control: a row minted under the NEW chain is not covered by testimony about the old text */
  const fresh = mint({ kind: "pdf-page", page: 1 });
  assert.notEqual(fresh, PAGE_ROW, "a different chain is a different row");
  const f = w.content.contentRead({ id: fresh, viewer: V("bo") });
  assert.deepEqual([f.stale, f.attestations.all.length, f.attestations.covering.length, f.transcription.determinant],
    [false, 2, 0, "derivation"]);
  assert.deepEqual(f.attestations.all.map((x) => x.stale), [true, true]);
  /* and a fresh attestation on the new chain is not stale and does raise it */
  w.content.attestText({ captureSha: a.sha, viewer: V("cy"), member: V("cy"), extent: { kind: "page", page: 1 } });
  assert.equal(w.content.attestationsFor(a.sha, { page: 1 }, V("bo")).ceiling.determinant, "attestation");
  assert.deepEqual(w.content.contentRead({ id: fresh, viewer: V("bo") }).attestations.covering.map((x) => x.attestor), [V("cy")]);
});

/* ---------------------------------------------------------------- transcribe */

test("R21 (transcribe): the routing case — a whole-document attestation of a CHAINLESS capture never raises a member's typing, nor is listed on it; a second member's attestation of the typing does", () => {
  const w = world();
  const n = w.cap("n"); w.doc(DOC, [n]); w.read(n.sha, { chain: null, pageCount: 1 });
  const atN = w.content.attestText({ captureSha: n.sha, viewer: V("sam"), member: V("sam"), extent: { kind: "document" } });
  assert.deepEqual([atN.ok, atN.chain_at_attestation], [true, null], "a null chain on the capture: the null is not staleness");
  const tx = w.content.transcribe({ bundleId: DOC, extent: { kind: "pdf-page", page: 0 }, text: TYPED, transcriber: V("ruth"), viewer: V("ruth") });
  assert.equal(tx.ok, true, "a capture with no chain can be typed");
  const c = w.content.contentRead({ id: tx.content_id, viewer: V("ruth") });
  assert.deepEqual([ceil(c), c.attestations.all.length, c.attestations.covering.length], [[null, "derivation", []], 0, 0]);
  assert.deepEqual(ceil(w.content.standings([tx.content_id])[tx.content_id]), [null, "derivation", []],
    "the set-based read a leg path uses reads the capture's attestations for every row, and still routes them away");
  /* the capture's attestation does stand for the capture's own text */
  assert.equal(w.content.attestationsFor(n.sha, { page: 0 }, V("sam")).attestations.length, 1);
  /* negative control: an attestation OF the typing, by another member, raises it */
  assert.equal(w.content.transcriptionAttest({ contentId: tx.content_id, attestor: V("sam"), viewer: V("sam") }).ok, true);
  assert.deepEqual(ceil(w.content.standings([tx.content_id])[tx.content_id]), [EARNED_CAPTURE_CEILING, "attestation", [V("sam")]]);
  assert.deepEqual(w.content.contentRead({ id: tx.content_id, viewer: V("ruth") }).attestations.covering.map((x) => x.attestor), [V("sam")]);
});

test("R21, R22, R25 (transcribe): a region typing's attestation is scoped to that region; the capture's page attestation covering the region does not raise it; a re-read stales the machine row and not the typing, whose ceiling stands", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 3 });
  const machine = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 1 }, mintedBy: "class:member" }).content_id;
  w.content.attestText({ captureSha: a.sha, viewer: V("ruth"), member: V("ruth"), extent: { kind: "page", page: 1 }, note: "checked the OCR" });
  const tx = w.content.transcribe({ bundleId: DOC, extent: REGION, text: TYPED, transcriber: V("ruth"), viewer: V("ruth") });
  assert.equal(tx.ok, true);
  assert.notEqual(tx.content_id, machine, "the chain is in the address");
  assert.equal(w.content.attestationsFor(a.sha, { page: 1 }, V("ruth")).ceiling.determinant, "attestation", "the capture's page 2 is attested");
  assert.deepEqual(ceil(w.content.contentRead({ id: tx.content_id, viewer: V("ruth") })), [null, "derivation", []],
    "it checked the OCR, not what she typed");

  const sa = w.content.transcriptionAttest({ contentId: tx.content_id, attestor: V("sam"), viewer: V("sam"), note: "matches the scan" });
  assert.equal(sa.ok, true);
  assert.deepEqual(sa.extent, { kind: "region", source: { kind: "pdf-page", ref: "p1", page: 1, rect: [10, 10, 200, 100] } },
    "exactly the typed region");
  assert.deepEqual([sa.attestor, sa.transcriber, sa.ceiling_before.ceiling, ...ceil(sa)],
    [V("sam"), V("ruth"), null, EARNED_CAPTURE_CEILING, "attestation", [V("sam")]]);
  const c2 = w.content.contentRead({ id: tx.content_id, viewer: V("ruth") });
  assert.deepEqual(c2.attestations.covering.map((x) => [x.attestor, x.extent]), [[V("sam"), sa.extent]]);
  assert.deepEqual([c2.chain, c2.derivation_cap], [[{ step: "typed", member: V("ruth"), text_sha256: sha(TYPED) }], null], "the chain unchanged");
  /* negative control: a typing of a whole page scopes to the page, not a region */
  const pageTx = w.content.transcribe({ bundleId: DOC, extent: { kind: "pdf-page", page: 2 }, text: TYPED, transcriber: V("ruth"), viewer: V("ruth") });
  assert.deepEqual(w.content.transcriptionAttest({ contentId: pageTx.content_id, attestor: V("sam"), viewer: V("sam") }).extent, { kind: "page", page: 2 });

  /* a re-read by a newer engine */
  w.read(a.sha, { chain: OCR_NEW, pageCount: 3 });
  w.content.markStale(a.sha, OCR_NEW);
  assert.equal(w.content.contentRead({ id: machine, viewer: V("ruth") }).stale, true, "the machine row goes stale");
  const c3 = w.content.contentRead({ id: tx.content_id, viewer: V("ruth") });
  assert.deepEqual([c3.stale, ...ceil(c3)], [false, EARNED_CAPTURE_CEILING, "attestation", [V("sam")]], "the typing does not, and its ceiling stands");
});

test("R44 (transcribe): attestationsFor lists only the capture's text attestations, never a typing's", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 3 });
  w.content.attestText({ captureSha: a.sha, viewer: V("ruth"), member: V("ruth"), extent: { kind: "page", page: 1 } });
  const snap = JSON.stringify(w.content.attestationsFor(a.sha, { page: 1 }, V("ruth")));
  const tx = w.content.transcribe({ bundleId: DOC, extent: REGION, text: TYPED, transcriber: V("ruth"), viewer: V("ruth") });
  const other = w.content.transcribe({ bundleId: DOC, extent: { kind: "document" }, text: TYPED, transcriber: V("sam"), viewer: V("sam") });
  w.content.transcriptionAttest({ contentId: tx.content_id, attestor: V("sam"), viewer: V("sam") });
  w.content.transcriptionAttest({ contentId: other.content_id, attestor: V("ruth"), viewer: V("ruth") });
  const r = w.content.attestationsFor(a.sha, { page: 1 }, V("ruth"));
  assert.deepEqual([r.count, r.attestations.map((x) => x.attestor)], [1, [V("ruth")]], "no typing's attestation leaked into it");
  assert.equal(JSON.stringify(r), snap, "the answer is unmoved by any typing");
  /* negative control: the typings' attestations exist, on the typings' own read */
  assert.deepEqual(w.content.transcriptionRead({ id: tx.content_id, viewer: V("ruth") }).attestations.map((x) => x.attestor), [V("sam")]);
  assert.deepEqual(w.content.transcriptionRead({ id: other.content_id, viewer: V("ruth") }).attestations.map((x) => x.attestor), [V("ruth")]);
});

test("R16 (transcribe): a typing reads as member-marked work, a machine-marked row on the same page as machine work", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 3 });
  const tx = w.content.transcribe({ bundleId: DOC, extent: REGION, text: TYPED, transcriber: V("ruth"), viewer: V("ruth") });
  const c = w.content.contentRead({ id: tx.content_id, viewer: V("ruth") });
  assert.deepEqual([c.minted_by, c.mint.by, c.mint.state, c.mint.machine_work, c.stale], [V("ruth"), V("ruth"), "member_marked", false, false]);
  assert.ok(c.mint.says);
  /* negative control: the machine credential's mark on the same page */
  const m = w.content.contentMint({ bundleId: DOC, extent: { kind: "pdf-page", page: 1 }, mintedBy: "class:member", viewer: V("ruth") });
  assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
  const mc = w.content.contentRead({ id: m.content_id, viewer: V("ruth") });
  assert.deepEqual([mc.mint.state, mc.mint.machine_work], ["machine_marked", true]);
  assert.notEqual(mc.mint.says, c.mint.says);
});

test("R23, R1 (transcribe): a malformed portion is the extent grammar's C-45.3 verbatim; an image cited as itself is C-52.5; a well-formed page passes both", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 3 });
  const tr = (extent) => w.content.transcribe({ bundleId: DOC, extent, text: TYPED, transcriber: V("ruth"), viewer: V("ruth") });
  const bad = tr({ kind: "pdf-page", page: "two" });
  assert.deepEqual([bad.ok, bad.code, bad.check], [false, "CONTENT_EXTENT_UNREADABLE", "C-45.3"]);
  assert.equal(TRANSCRIBE_CHECKS[bad.code], undefined, "not restated as a transcription row");
  const img = tr({ kind: "image", page: 1, rect: [0, 0, 5, 5] });
  assert.deepEqual([img.ok, img.code, img.check, img.translation],
    [false, "TRANSCRIBE_PORTION_UNREADABLE", "C-52.5", TRANSCRIBE_CHECKS.TRANSCRIBE_PORTION_UNREADABLE.translation]);
  assert.equal(w.count("content") + w.count("transcriptions"), 0, "neither refusal writes");
  /* negative control */
  assert.equal(tr({ kind: "pdf-page", page: 1 }).ok, true);
  assert.equal(tr({ kind: "document" }).extent_kind, "document", "the whole document named as the portion is legal");
});

/* ----------------------------------------------------------------- textchain */

test("R43 (textchain): attestText takes the attestor from the member stamp, never a body field; a machine stamp is refused whatever the body names; the answer's why names the extent it covers", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 3 });
  const region = { kind: "region", source: { kind: "pdf-page", ref: "p0", page: 0, rect: [72, 600, 540, 720], attestor: "member:someone-else" } };
  const ok = w.content.attestText({ captureSha: a.sha, viewer: V("bob"), member: V("bob"), attestor: "member:someone-else",
                                    by: "member:someone-else", extent: region, at: "2026-09-14T00:00:00Z" });
  assert.equal(ok.ok, true);
  assert.equal(ok.attestor, V("bob"), "attributed to the stamp, never the name in the body");
  assert.deepEqual(w.rows(`SELECT attestor FROM text_attestations`).map((r) => r.attestor), [V("bob")]);
  assert.equal(JSON.stringify(w.rows(`SELECT * FROM text_attestations`)).includes("someone-else"), false, "the body's name is stored nowhere");
  assert.match(ok.why, /a region of page 0/);
  assert.match(ok.why, /does not inherit it/);
  const listed = w.content.attestationsFor(a.sha, null, V("bob")).attestations;
  assert.deepEqual(listed.map((x) => x.attestor), [V("bob")]);
  /* inside the attested region it covers; outside it does not */
  const inside = w.content.attestationsFor(a.sha, { page: 0, rect: [100, 650, 200, 700] }, V("bob"));
  assert.deepEqual([inside.ceiling.ceiling, inside.ceiling.determinant, inside.ceiling.by], [EARNED_CAPTURE_CEILING, "attestation", [V("bob")]]);
  const outside = w.content.attestationsFor(a.sha, { page: 0, rect: [0, 0, 50, 50] }, V("bob"));
  assert.deepEqual([outside.ceiling.ceiling, outside.ceiling.determinant], ["C", "derivation"]);

  /* a machine stamp is refused even when the body names a real member */
  for (const member of ["class:member", "class:admin"]) {
    const m = w.content.attestText({ captureSha: a.sha, viewer: V("bob"), member, attestor: V("bob"), extent: { kind: "document" } });
    assert.equal(m.code, "TEXT_ATTEST_MACHINE", member);
  }
  /* an absent stamp is not filled from the body */
  const none = w.content.attestText({ captureSha: a.sha, viewer: V("bob"), attestor: V("bob"), extent: { kind: "document" } });
  assert.equal(none.code, "TEXT_ATTEST_MACHINE");
  assert.equal(w.count("text_attestations"), 1, "no refusal writes");
  /* the why names each extent kind it covers */
  assert.match(w.content.attestText({ captureSha: a.sha, viewer: V("cy"), member: V("cy"), extent: { kind: "page", page: 2 } }).why, /over page 2\./);
  assert.match(w.content.attestText({ captureSha: a.sha, viewer: V("di"), member: V("di"), extent: { kind: "document" } }).why, /over the whole document\./);
});
