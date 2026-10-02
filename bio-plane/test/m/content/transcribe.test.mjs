/* content: a member's typed transcription (R23–R26), the attestor's note on both attestations (R25, R43; C-52.10,
   DEC-88), and the C-52 rows (R38's share). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, sha } from "./fixture.mjs";
import { TRANSCRIPTION_MAX_BYTES, TRANSCRIBE_CHECKS, VERSION_NOTICE_CHECKS, ATTEST_NOTE_MAX, contentOps }
  from "../../../src/content/index.mjs";

const DOC = "INFO-2026-0001-a";

function setup({ chain = undefined } = {}) {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { pageCount: 3, ...(chain !== undefined ? { chain } : {}) });
  w.inquiry("INQ-2026-0001-q");
  w.doc("INFO-2026-0002-empty", []);
  const tr = (o) => w.content.transcribe({ bundleId: DOC, extent: { kind: "pdf-page", page: 1 }, text: "In the year 1921",
                                           transcriber: V("ty"), viewer: V("ty"), ...o });
  return { w, a, tr };
}

const isRow = (r, key) => {
  assert.equal(r.ok, false);
  assert.equal(r.code, key);
  assert.equal(r.check, TRANSCRIBE_CHECKS[key].check);
  assert.equal(r.translation, TRANSCRIBE_CHECKS[key].translation);
};

test("R23: refusals in order: C-52.1 machine or empty, C-52.2 target, C-52.3 capture, C-52.4 no portion, R7's, C-52.5, C-52.6, C-52.7 (never truncated)", () => {
  const { w, tr } = setup();
  isRow(tr({ transcriber: "class:ai", bundleId: "" }), "TRANSCRIBE_NOT_A_MEMBER");
  isRow(tr({ transcriber: "  " }), "TRANSCRIBE_NOT_A_MEMBER");
  isRow(tr({ bundleId: "", extent: null }), "TRANSCRIBE_NO_DOCUMENT");
  isRow(tr({ bundleId: "INFO-2026-0404-x" }), "TRANSCRIBE_NO_DOCUMENT");
  isRow(tr({ viewer: "nobody" }), "TRANSCRIBE_NO_DOCUMENT");
  isRow(tr({ bundleId: "INQ-2026-0001-q" }), "TRANSCRIBE_NO_DOCUMENT");
  isRow(tr({ bundleId: "INFO-2026-0002-empty", extent: null }), "TRANSCRIBE_NO_BYTES");
  isRow(tr({ extent: null, text: "" }), "TRANSCRIBE_NO_PORTION");
  isRow(tr({ extent: {} }), "TRANSCRIBE_NO_PORTION");
  assert.equal(tr({ extent: { kind: "pdf-page", page: 9 }, text: "" }).code, "CONTENT_EXTENT_OUT_OF_RANGE", "R7 before the portion's own rows");
  isRow(tr({ extent: { kind: "image", part: "e".repeat(64) } }), "TRANSCRIBE_PORTION_UNREADABLE");
  isRow(tr({ extent: { kind: "doc-para", para: 0 } }), "TRANSCRIBE_PORTION_UNREADABLE");
  isRow(tr({ text: "   " }), "TRANSCRIBE_NO_TEXT");
  isRow(tr({ text: null }), "TRANSCRIBE_NO_TEXT");
  const long = tr({ text: "x".repeat(TRANSCRIPTION_MAX_BYTES + 1) });
  isRow(long, "TRANSCRIBE_TEXT_TOO_LONG");
  assert.deepEqual([long.bytes, long.limit], [131073, 131072]);
  assert.equal(tr({ text: "é".repeat(65537) }).code, "TRANSCRIBE_TEXT_TOO_LONG", "bytes, not characters");
  assert.equal(w.count("transcriptions") + w.count("content"), 0, "no refusal writes");
  assert.equal(tr({ text: "x".repeat(TRANSCRIPTION_MAX_BYTES) }).ok, true, "at the cap is admitted, not cut");
  assert.equal(w.row(`SELECT length(text) AS n FROM transcriptions`).n, TRANSCRIPTION_MAX_BYTES);
});

test("R24: success mints a row whose chain is one typed step, minted by the typist, keeping the text byte for byte; the same typing is found; undetermined until attested", () => {
  const { w, a, tr } = setup({ chain: null });
  const text = "In the year 1921,\n  the parcel  was deeded — ¶ as-is ";
  const r = tr({ text, at: "2026-09-10T00:00:00Z" });
  assert.equal(r.ok, true, "a capture with NO chain can be typed: the typing is the transcription");
  assert.deepEqual(r.chain, [{ step: "typed", member: V("ty"), text_sha256: sha(text) }]);
  assert.deepEqual([r.minted, r.transcriber, r.text_sha256, r.capture_sha, r.bytes], [true, V("ty"), sha(text), a.sha, Buffer.byteLength(text)]);
  const row = w.row(`SELECT minted_by, at, chain_kind FROM content WHERE content_id=?`, r.content_id);
  assert.deepEqual({ ...row }, { minted_by: V("ty"), at: "2026-09-10T00:00:00Z", chain_kind: "typed" });
  assert.equal(w.row(`SELECT text FROM transcriptions WHERE content_id=?`, r.content_id).text, text);
  assert.deepEqual([r.derivation_cap, r.transcription.ceiling], [null, null], "undetermined, stated");
  assert.ok(r.transcription.why);
  const before = w.snapshot();
  const again = tr({ text, at: "2027-01-01T00:00:00Z" });
  assert.deepEqual([again.ok, again.minted, again.content_id], [true, false, r.content_id]);
  assert.deepEqual(w.snapshot(), before, "found, not rewritten");
  assert.notEqual(tr({ text: text + "!" }).content_id, r.content_id, "different text is a different row");
});

test("R25: transcriptionAttest: C-52.8, then checkAttestation, then C-52.9; one per (row, attestor), the ceiling before and after; the typing unchanged", () => {
  const { w, tr } = setup();
  const t = tr({});
  isRow(w.content.transcriptionAttest({ note: "compared with the page", contentId: "", attestor: V("zo"), viewer: V("zo") }), "TRANSCRIPTION_NOT_FOUND");
  const machineRow = w.content.contentMint({ bundleId: DOC, extent: { kind: "pdf-page", page: 2 }, mintedBy: V("bo"), viewer: V("bo") });
  isRow(w.content.transcriptionAttest({ note: "compared with the page", contentId: machineRow.content_id, attestor: V("zo"), viewer: V("zo") }), "TRANSCRIPTION_NOT_FOUND");
  assert.equal(w.content.transcriptionAttest({ note: "compared with the page", contentId: t.content_id, attestor: "class:ai", viewer: V("zo") }).code, "TEXT_ATTEST_MACHINE");
  assert.equal(w.content.transcriptionAttest({ note: "compared with the page", contentId: t.content_id, attestor: "", viewer: V("zo") }).code, "TEXT_ATTEST_MACHINE");
  isRow(w.content.transcriptionAttest({ note: "compared with the page", contentId: t.content_id, attestor: V("ty"), viewer: V("ty") }), "TRANSCRIPTION_SELF_ATTEST");
  assert.equal(w.count("transcription_attestations"), 0);
  const typing = { ...w.row(`SELECT * FROM transcriptions`) };
  const ok = w.content.transcriptionAttest({ contentId: t.content_id, attestor: V("zo"), viewer: V("zo"), note: "checked", at: "2026-09-11T00:00:00Z" });
  assert.equal(ok.ok, true);
  assert.equal(ok.ceiling_before.ceiling, null);
  assert.deepEqual([ok.transcription.determinant, ok.transcription.by], ["attestation", [V("zo")]]);
  assert.deepEqual(ok.extent, { kind: "page", page: 1 }, "scoped to the typed portion, never the caller's");
  const again = w.content.transcriptionAttest({ note: "compared with the page", contentId: t.content_id, attestor: V("zo"), viewer: V("zo"), at: "2026-09-12T00:00:00Z" });
  assert.equal(again.ok, true);
  assert.equal(w.count("transcription_attestations"), 1, "a repeat replaces it");
  assert.equal(w.row(`SELECT at FROM transcription_attestations`).at, "2026-09-12T00:00:00Z");
  assert.deepEqual({ ...w.row(`SELECT * FROM transcriptions`) }, typing, "the typing is unchanged");
});

test("R26: transcriptionRead: C-52.8; the text, digest, chain, cap, ceiling and attestations, the typist's own counts:false", () => {
  const { w, tr } = setup();
  const t = tr({ text: "the words" });
  isRow(w.content.transcriptionRead({ id: "nope", viewer: V("zo") }), "TRANSCRIPTION_NOT_FOUND");
  w.content.transcriptionAttest({ note: "compared with the page", contentId: t.content_id, attestor: V("zo"), viewer: V("zo") });
  w.st.sql.exec(`INSERT INTO transcription_attestations (content_id,bundle_id,attestor,at) VALUES (?,?,?,?)`, t.content_id, DOC, V("ty"), "2026-09-01T00:00:00Z");
  const r = w.content.transcriptionRead({ id: t.content_id, viewer: V("zo") });
  assert.deepEqual([r.ok, r.text, r.text_sha256, r.transcriber], [true, "the words", sha("the words"), V("ty")]);
  assert.deepEqual(r.chain, [{ step: "typed", member: V("ty"), text_sha256: sha("the words") }]);
  assert.ok(typeof r.chain_says === "string" && r.chain_says.includes(V("ty")));
  assert.equal(r.derivation_cap, null);
  assert.equal(r.transcription.determinant, "attestation");
  assert.deepEqual(r.attestations.map((a) => [a.attestor, a.counts]).sort(), [[V("ty"), false], [V("zo"), true]]);
});

test("R25: transcriptionAttest: C-52.10 (ATTEST_NO_NOTE) after C-52.9: a note absent, not a string, blank or over 2,000 characters is refused with nothing written; at 2,000 it is kept and read back", () => {
  const { w, tr } = setup();
  const t = tr({});
  const att = (o) => w.content.transcriptionAttest({ contentId: t.content_id, attestor: V("zo"), viewer: V("zo"), ...o });
  /* the earlier rows are asked first: each answers as itself, note or none */
  for (const note of [undefined, ""]) {
    isRow(w.content.transcriptionAttest({ contentId: "", attestor: V("zo"), viewer: V("zo"), note }), "TRANSCRIPTION_NOT_FOUND");
    assert.equal(att({ attestor: "class:ai", note }).code, "TEXT_ATTEST_MACHINE");
    isRow(att({ attestor: V("ty"), viewer: V("ty"), note }), "TRANSCRIPTION_SELF_ATTEST");
  }
  /* every way a note can fail, each refused by its row, before anything is written: no attestation row, the ceiling and
     the read unchanged */
  const before = w.snapshot();
  const read0 = w.content.transcriptionRead({ id: t.content_id, viewer: V("zo") });
  const over = "n".repeat(ATTEST_NOTE_MAX + 1);
  const astralOver = "\u{1D538}".repeat(ATTEST_NOTE_MAX + 1);
  const bad = [["absent", {}], ["null", { note: null }], ["a number", { note: 42 }], ["an object", { note: { text: "x" } }],
               ["a list", { note: ["checked"] }], ["empty", { note: "" }], ["white space", { note: " \n\t " }],
               ["2,001 characters", { note: over }], ["2,001 astral characters", { note: astralOver }]];
  for (const [label, o] of bad) {
    const r = att(o);
    isRow(r, "ATTEST_NO_NOTE");
    assert.equal(r.check, "C-52.10", label);
    assert.equal(r.max_chars, ATTEST_NOTE_MAX, label);
    assert.ok(typeof r.detail === "string" && r.detail.length > 20, label);
  }
  assert.equal(w.count("transcription_attestations"), 0, "no refusal writes");
  assert.deepEqual(w.snapshot(), before, "nothing written anywhere");
  assert.deepEqual(w.content.transcriptionRead({ id: t.content_id, viewer: V("zo") }), read0, "the ceiling and the read unchanged");
  assert.equal(read0.transcription.ceiling, null);
  /* through the route arm: the note is the body's, and a body without one is refused the same way */
  const run = (q, body) => contentOps(w.content, new URL(`https://plane.invalid/?${new URLSearchParams(q)}`), body).transcriptionattest();
  isRow(run({ attestor: V("zo"), viewer: V("zo"), contentId: t.content_id }, null), "ATTEST_NO_NOTE");
  isRow(run({ attestor: V("zo"), viewer: V("zo") }, { contentId: t.content_id, note: "  " }), "ATTEST_NO_NOTE");
  assert.deepEqual(w.snapshot(), before);
  /* the bound: exactly 2,000 characters, counted as characters (an astral one is one), is admitted and kept byte for byte */
  const at2000 = "\u{1D538}".repeat(ATTEST_NOTE_MAX - 1) + "!";
  const ok = att({ note: at2000, at: "2026-09-11T00:00:00Z" });
  assert.equal(ok.ok, true);
  assert.deepEqual([ok.ceiling_before.ceiling, ok.transcription.determinant], [null, "attestation"]);
  assert.equal(w.row(`SELECT note FROM transcription_attestations`).note, at2000);
  assert.deepEqual(w.content.transcriptionRead({ id: t.content_id, viewer: V("zo") }).attestations.map((a) => [a.attestor, a.note]),
                   [[V("zo"), at2000]], "read back with its note");
  const plain = att({ attestor: V("xi"), viewer: V("xi"), note: "n".repeat(ATTEST_NOTE_MAX) });
  assert.equal(plain.ok, true, "2,000 plain characters admitted");
  /* a repeat replaces it, kept with its new note; a refused repeat leaves the held one as it was */
  const held = w.snapshot();
  isRow(att({ note: "" }), "ATTEST_NO_NOTE");
  assert.deepEqual(w.snapshot(), held, "a refused repeat changes nothing");
  assert.equal(att({ note: "re-checked against page 2's scan", at: "2026-09-12T00:00:00Z" }).ok, true);
  assert.deepEqual({ ...w.row(`SELECT at, note FROM transcription_attestations WHERE attestor=?`, V("zo")) },
                   { at: "2026-09-12T00:00:00Z", note: "re-checked against page 2's scan" });
  assert.equal(w.count("transcription_attestations"), 2);
});

test("R38: C-52.1–C-52.10 are this module's own rows (C-52.1–.9 moved from the catalogue, T18; C-52.10 new in T22, DEC-88, stamped by 1.53.0), each refused by its row; C-80.3 is this module's one row", () => {
  const keys = ["TRANSCRIBE_NOT_A_MEMBER", "TRANSCRIBE_NO_DOCUMENT", "TRANSCRIBE_NO_BYTES", "TRANSCRIBE_NO_PORTION",
                "TRANSCRIBE_PORTION_UNREADABLE", "TRANSCRIBE_NO_TEXT", "TRANSCRIBE_TEXT_TOO_LONG", "TRANSCRIPTION_NOT_FOUND",
                "TRANSCRIPTION_SELF_ATTEST", "ATTEST_NO_NOTE"];
  assert.deepEqual(Object.keys(TRANSCRIBE_CHECKS), keys, "exactly the ten");
  assert.deepEqual(keys.map((k) => TRANSCRIBE_CHECKS[k].check), keys.map((_, i) => `C-52.${i + 1}`));
  for (const k of keys) {
    assert.match(TRANSCRIBE_CHECKS[k].where, /^src\/content\/index\.mjs \S+ > is-transcri\S+(, and \S+ > is-\S+)?$/, k);
    assert.ok(TRANSCRIBE_CHECKS[k].translation.length > 40, k);
  }
  /* C-52.10 is the one row of both attestations, and its `where` names both sites */
  assert.equal(TRANSCRIBE_CHECKS.ATTEST_NO_NOTE.where,
    "src/content/index.mjs transcriptionAttest > is-transcription-attest, and attestText > is-text-attest");
  assert.deepEqual(Object.keys(VERSION_NOTICE_CHECKS), ["VERSION_NOTICE_NO_CONTENT"]);
  assert.equal(VERSION_NOTICE_CHECKS.VERSION_NOTICE_NO_CONTENT.check, "C-80.3");
  /* each has a negative control (R23, R25, R26 above; C-52.10 at both acts, R25 above and R43 in context.test.mjs); the
     positive control: an ordinary typing, and an attestation with its note, pass every one */
  const { w, tr } = setup();
  const t = tr({});
  assert.equal(t.ok, true);
  assert.equal(w.content.transcriptionAttest({ contentId: t.content_id, attestor: V("zo"), viewer: V("zo"), note: "checked" }).ok, true);
});
