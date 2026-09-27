/* content: a member's typed transcription (R23–R26) and the C-52 rows it moves with (R38's share). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { TRANSCRIBE_CHECKS } from "../../../checks/bio-checks.mjs";
import { world, V, sha } from "./fixture.mjs";
import { TRANSCRIPTION_MAX_BYTES } from "../../../src/content/index.mjs";

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
  isRow(w.content.transcriptionAttest({ contentId: "", attestor: V("zo"), viewer: V("zo") }), "TRANSCRIPTION_NOT_FOUND");
  const machineRow = w.content.contentMint({ bundleId: DOC, extent: { kind: "pdf-page", page: 2 }, mintedBy: V("bo"), viewer: V("bo") });
  isRow(w.content.transcriptionAttest({ contentId: machineRow.content_id, attestor: V("zo"), viewer: V("zo") }), "TRANSCRIPTION_NOT_FOUND");
  assert.equal(w.content.transcriptionAttest({ contentId: t.content_id, attestor: "class:ai", viewer: V("zo") }).code, "TEXT_ATTEST_MACHINE");
  assert.equal(w.content.transcriptionAttest({ contentId: t.content_id, attestor: "", viewer: V("zo") }).code, "TEXT_ATTEST_MACHINE");
  isRow(w.content.transcriptionAttest({ contentId: t.content_id, attestor: V("ty"), viewer: V("ty") }), "TRANSCRIPTION_SELF_ATTEST");
  assert.equal(w.count("transcription_attestations"), 0);
  const typing = { ...w.row(`SELECT * FROM transcriptions`) };
  const ok = w.content.transcriptionAttest({ contentId: t.content_id, attestor: V("zo"), viewer: V("zo"), note: "checked", at: "2026-09-11T00:00:00Z" });
  assert.equal(ok.ok, true);
  assert.equal(ok.ceiling_before.ceiling, null);
  assert.deepEqual([ok.transcription.determinant, ok.transcription.by], ["attestation", [V("zo")]]);
  assert.deepEqual(ok.extent, { kind: "page", page: 1 }, "scoped to the typed portion, never the caller's");
  const again = w.content.transcriptionAttest({ contentId: t.content_id, attestor: V("zo"), viewer: V("zo"), at: "2026-09-12T00:00:00Z" });
  assert.equal(again.ok, true);
  assert.equal(w.count("transcription_attestations"), 1, "a repeat replaces it");
  assert.equal(w.row(`SELECT at FROM transcription_attestations`).at, "2026-09-12T00:00:00Z");
  assert.deepEqual({ ...w.row(`SELECT * FROM transcriptions`) }, typing, "the typing is unchanged");
});

test("R26: transcriptionRead: C-52.8; the text, digest, chain, cap, ceiling and attestations, the typist's own counts:false", () => {
  const { w, tr } = setup();
  const t = tr({ text: "the words" });
  isRow(w.content.transcriptionRead({ id: "nope", viewer: V("zo") }), "TRANSCRIPTION_NOT_FOUND");
  w.content.transcriptionAttest({ contentId: t.content_id, attestor: V("zo"), viewer: V("zo") });
  w.st.sql.exec(`INSERT INTO transcription_attestations (content_id,bundle_id,attestor,at) VALUES (?,?,?,?)`, t.content_id, DOC, V("ty"), "2026-09-01T00:00:00Z");
  const r = w.content.transcriptionRead({ id: t.content_id, viewer: V("zo") });
  assert.deepEqual([r.ok, r.text, r.text_sha256, r.transcriber], [true, "the words", sha("the words"), V("ty")]);
  assert.deepEqual(r.chain, [{ step: "typed", member: V("ty"), text_sha256: sha("the words") }]);
  assert.ok(typeof r.chain_says === "string" && r.chain_says.includes(V("ty")));
  assert.equal(r.derivation_cap, null);
  assert.equal(r.transcription.determinant, "attestation");
  assert.deepEqual(r.attestations.map((a) => [a.attestor, a.counts]).sort(), [[V("ty"), false], [V("zo"), true]]);
});

test("R38: C-52.1–C-52.9 are refused by their catalogue rows (and C-45 by its, C-80.3 by its)", () => {
  const keys = ["TRANSCRIBE_NOT_A_MEMBER", "TRANSCRIBE_NO_DOCUMENT", "TRANSCRIBE_NO_BYTES", "TRANSCRIBE_NO_PORTION",
                "TRANSCRIBE_PORTION_UNREADABLE", "TRANSCRIBE_NO_TEXT", "TRANSCRIBE_TEXT_TOO_LONG", "TRANSCRIPTION_NOT_FOUND",
                "TRANSCRIPTION_SELF_ATTEST"];
  assert.deepEqual(keys.map((k) => TRANSCRIBE_CHECKS[k].check), keys.map((_, i) => `C-52.${i + 1}`));
  /* each has a negative control above (R23, R25, R26); the positive control: an ordinary typing passes every one */
  const { tr } = setup();
  assert.equal(tr({}).ok, true);
});
