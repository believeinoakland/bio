/* content: the fixed-key read (R17–R19), standings (R20), the transcription axis (R21), the stale mark and its notice
   (R22, R41), and sight (R37). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, LAYER } from "./fixture.mjs";
import { CONTENT_READ_PARAMS, CONTENT_EARNED_MAX, canonicalExtent } from "../../../src/content/index.mjs";

const DOC = "INFO-2026-0001-a";
const OCR = [{ step: "layer", tier: 1, cap: null }, { step: "ocr", engine: "t", version: "1", cap: "C", measured_by: "m" }];

function setup() {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 3 });
  const mint = (e, by = V("bo")) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: by }).content_id;
  return { w, a, mint };
}

test("R17: contentRead is fixed-key: any parameter but id and viewer is FIXED_KEY_ONLY naming them sorted; no id is NO_ID; absent and invisible are one answer", () => {
  const { w, mint } = setup();
  const id = mint({ kind: "pdf-page", page: 1 });
  const r = w.content.contentRead({ id, viewer: V("bo"), extras: ["id", "viewer", "where", "limit", "limit", "q"] });
  assert.deepEqual([r.ok, r.reason, r.rejected], [false, "FIXED_KEY_ONLY", ["limit", "q", "where"]]);
  assert.equal(w.content.contentRead({ id: "", viewer: V("bo") }).reason, "NO_ID");
  assert.equal(w.content.contentRead({ viewer: V("bo") }).reason, "NO_ID");
  const absent = w.content.contentRead({ id: "0".repeat(64), viewer: V("bo") });
  const hidden = w.content.contentRead({ id, viewer: "nobody" });
  assert.equal(absent.reason, "NO_SUCH_CONTENT");
  assert.deepEqual({ ...hidden, target: null }, { ...absent, target: null }, "byte for byte but the id asked");
  assert.deepEqual([...CONTENT_READ_PARAMS].sort(), ["id", "store", "viewer"]);
});

test("R18: the plane's own store parameter is accepted", () => {
  const { w, mint } = setup();
  const id = mint({ kind: "pdf-page", page: 1 });
  const r = w.content.contentRead({ id, viewer: V("bo"), extras: ["id", "viewer", "store"] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
});

test("R19: the answer carries the row, its label, says, the transcription axis, the attestations that bear on it, the document's capture axis and no connection", () => {
  const { w, a, mint } = setup();
  const id = mint({ kind: "pdf-page", page: 1 });
  w.content.attestText({ captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent: { kind: "page", page: 1 }, at: "2026-09-02T00:00:00Z" });
  w.content.attestText({ captureSha: a.sha, viewer: V("bo"), member: V("di"), extent: { kind: "page", page: 2 }, at: "2026-09-03T00:00:00Z" });
  const r = w.content.contentRead({ id, viewer: V("bo"), extras: ["id", "viewer"] });
  assert.equal(r.ok, true);
  for (const k of ["content_id", "capture_sha", "bundle_id", "extent_kind", "extent", "ref", "chain", "derivation_cap",
                   "page_count", "minted_by", "at", "stale", "cited_as", "mint", "says", "transcription", "attestations",
                   "capture", "connection"]) assert.ok(k in r, k);
  assert.equal(r.says, "page 2, as this record holds it");
  assert.deepEqual(r.attestations.covering.map((x) => x.attestor), [V("cy")], "only the attestation over this page covers it");
  assert.deepEqual(r.attestations.all.map((x) => x.attestor), [V("cy"), V("di")]);
  assert.equal(r.attestations.count, 2);
  assert.ok(r.attestations.why);
  assert.equal(r.transcription.determinant, "attestation");
  assert.equal(r.capture.grain, "document");
  assert.deepEqual([r.connection.determined, r.connection.undetermined_because], [false, "NO_SUBJECT_IN_THIS_READ"]);
});

test("R20: standings answers at most 200 ids in one set-based read, each without a connection axis", () => {
  const { w, mint } = setup();
  const ids = [mint({ kind: "pdf-page", page: 0 }), mint({ kind: "pdf-page", page: 1 }), mint({ kind: "document" })];
  const s = w.content.standings([...ids, ids[0], "nope", null]);
  assert.deepEqual(Object.keys(s).sort(), [...ids].sort());
  for (const id of ids) assert.equal("connection" in s[id], false);
  assert.equal(CONTENT_EARNED_MAX, 200);
  const many = Array.from({ length: 250 }, (_, i) => `x${i}`);
  let asked = null;
  const sql = w.content.sql;
  w.content.sql = { exec: (q, ...a) => { if (/FROM content WHERE content_id IN/.test(q)) asked = JSON.parse(a[0]).length; return sql.exec(q, ...a); } };
  w.content.standings(many);
  w.content.sql = sql;
  assert.equal(asked, 200, "the 201st id is never read");
});

test("R21: the transcription axis: not applicable for bytes, undetermined for an unevaluable kind, else gradeCeiling over the right attestations", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { chain: OCR, pageCount: 3, captureFormat: "docx",
                  containerExtent: { container: "docx", levels: ["paragraphs", "tables", "images"], paragraphs: 9, tables: [], images: [{ part: "e".repeat(64) }] } });
  const m = (e, by = V("bo")) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: by }).content_id;
  const bytes = m({ kind: "image", part: "e".repeat(64) });
  const para = m({ kind: "doc-para", para: 2 });
  const page = m({ kind: "pdf-page", page: 1 });
  const doc = m({ kind: "document" });
  const s = w.content.standings([bytes, para, page, doc]);
  assert.deepEqual([s[bytes].transcription.applies, s[bytes].transcription.ceiling], [false, null]);
  assert.equal(s[para].transcription.ceiling, null);
  assert.match(s[para].transcription.why, /cannot yet evaluate/);
  assert.deepEqual([s[page].transcription.ceiling, s[page].transcription.determinant], ["C", "derivation"]);
  /* a page attestation raises the page and not the whole document */
  w.content.attestText({ captureSha: a.sha, viewer: V("bo"), member: V("cy"), extent: { kind: "page", page: 1 } });
  const s2 = w.content.standings([page, doc]);
  assert.equal(s2[page].transcription.determinant, "attestation");
  assert.equal(s2[doc].transcription.determinant, "derivation");
  /* the capture's attestations never raise a typing, and the typist's own never counts */
  const t = w.content.transcribe({ bundleId: DOC, extent: { kind: "pdf-page", page: 1 }, text: "words", transcriber: V("ty"), viewer: V("ty") });
  assert.equal(w.content.standings([t.content_id])[t.content_id].transcription.ceiling, null);
  w.st.sql.exec(`INSERT INTO transcription_attestations (content_id,bundle_id,attestor,at) VALUES (?,?,?,?)`, t.content_id, DOC, V("ty"), "2026-09-01T00:00:00Z");
  assert.equal(w.content.standings([t.content_id])[t.content_id].transcription.ceiling, null, "the typist's own raises nothing");
  w.content.transcriptionAttest({ contentId: t.content_id, attestor: V("zo"), viewer: V("zo") });
  assert.equal(w.content.standings([t.content_id])[t.content_id].transcription.determinant, "attestation");
  /* ... and a typing's attestations never raise the capture's text */
  assert.equal(w.content.standings([doc])[doc].transcription.determinant, "derivation");
  /* an attestation made against another chain does not raise a row */
  w.read(a.sha, { chain: LAYER, pageCount: 3 });
  w.content.attestText({ captureSha: a.sha, viewer: V("bo"), member: V("xx"), extent: { kind: "document" } });
  assert.equal(w.content.standings([doc])[doc].transcription.determinant, "derivation");
});

test("R22: a replaced chain marks every other-chain row over the capture stale, one way; typings and bytes rows are not; nothing is deleted; a null chain marks nothing", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { chain: OCR, pageCount: 3, captureFormat: "docx",
                  containerExtent: { container: "docx", levels: ["images"], images: [{ part: "e".repeat(64) }] } });
  const r1 = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("bo") }).content_id;
  const r2 = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "document" }, mintedBy: V("bo") }).content_id;
  const img = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "image", part: "e".repeat(64) }, mintedBy: V("bo") }).content_id;
  const t = w.content.transcribe({ bundleId: DOC, extent: { kind: "document" }, text: "typed", transcriber: V("ty"), viewer: V("ty") }).content_id;
  assert.equal(w.content.markStale(a.sha, null), 0);
  assert.equal(w.content.markStale(a.sha, OCR), 0, "the same chain moves nothing");
  const NEW = [{ step: "layer", tier: 1 }, { step: "ocr", engine: "t", version: "2", cap: "B", measured_by: "m" }];
  assert.equal(w.content.markStale(a.sha, NEW), 2);
  const stale = (id) => w.row(`SELECT stale FROM content WHERE content_id=?`, id).stale;
  assert.deepEqual([stale(r1), stale(r2), stale(img), stale(t)], [1, 1, 0, 0]);
  assert.equal(w.count("content"), 4);
  const row = w.content.contentRow(r1);
  assert.deepEqual([row.resolves, row.stale], [true, true]);
  assert.match(row.says, /cited as it stood under an earlier transcription/);
  assert.equal(w.content.markStale(a.sha, OCR), 0, "one way: going back un-stales nothing");
  assert.equal(stale(r1), 1);
});

test("R41: a row a replaced reading marks stale is graded old text against new, and its citers are told only when affected or undetermined", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 3 });
  const U = (page, text) => ({ extent: canonicalExtent({ kind: "pdf-page", page }), ref: `page ${page + 1}`, text });
  const r0 = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("bo") }).content_id;
  const r1 = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 1 }, mintedBy: V("bo") }).content_id;
  const r2 = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 2 }, mintedBy: V("bo") }).content_id;
  const told = [];
  assert.deepEqual(w.content.onStale("inquiry", (n) => told.push(n)), { ok: true });
  assert.equal(w.content.onStale("inquiry", () => {}).reason, "LISTENER_DECLARED");
  const before = { units: [U(0, "the budget was cut"), U(1, "the budget was cut by the council"), U(2, "old words")], state: "whole" };
  w.ex.units[a.sha] = { units: [U(0, "the budget was cut"), U(1, "the budget was cut by the council today"), U(2, "entirely different")], state: "whole" };
  const NEW = [{ step: "layer", tier: 1 }, { step: "ocr", engine: "t", version: "2", cap: "B", measured_by: "m" }];
  assert.equal(w.content.markStale(a.sha, NEW, { unitsBefore: before }), 3, "every row goes stale (R22)");
  const by = Object.fromEntries(told.map((n) => [n.content_id, n]));
  assert.equal(r0 in by, false, "byte-identical: unaffected, nobody is told");
  assert.deepEqual([by[r1].grade, by[r1].affects], ["C", "affected"]);
  assert.deepEqual([by[r2].grade, by[r2].affects], ["NOT_FOUND", "affected"]);
  assert.ok(by[r1].says && by[r1].stale);
  /* nothing moved: the rows still resolve where they pointed */
  assert.equal(w.content.contentRow(r1).capture_sha, a.sha);
  /* without the old text, every stale row is undetermined and told */
  const b = w.cap("b"); w.doc("INFO-2026-0002-b", [b]); w.read(b.sha, { chain: OCR, pageCount: 1 });
  const rb = w.content.mint({ bundleId: "INFO-2026-0002-b", captureSha: b.sha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("bo") }).content_id;
  told.length = 0;
  w.content.markStale(b.sha, NEW);
  assert.deepEqual(told.map((n) => [n.content_id, n.affects]), [[rb, "undetermined"]]);
});

test("R37: every act and read naming a document or row answers one the viewer may not see exactly as an absent one", () => {
  const { w, mint } = setup();
  const id = mint({ kind: "pdf-page", page: 1 });
  const t = w.content.transcribe({ bundleId: DOC, extent: { kind: "document" }, text: "x", transcriber: V("ty"), viewer: V("ty") });
  const same = (f, hid, abs, ignore = []) => {
    const h = { ...f(hid) }, a = { ...f(abs) };
    for (const k of ignore) { delete h[k]; delete a[k]; }
    const mask = (o, v) => JSON.parse(JSON.stringify(o).replaceAll(v, "X").replaceAll(v.slice(0, 16), "X"));
    assert.deepEqual(mask(h, hid), mask(a, abs));
  };
  same((x) => w.content.contentRead({ id: x, viewer: x === id ? "nobody" : V("bo") }), id, "f".repeat(64));
  same((x) => w.content.contentMint({ bundleId: x, mintedBy: V("bo"), viewer: x === DOC ? "nobody" : V("bo") }), DOC, "INFO-2026-0404-x");
  same((x) => w.content.transcribe({ bundleId: x, extent: { kind: "document" }, text: "x", transcriber: V("bo"), viewer: x === DOC ? "nobody" : V("bo") }), DOC, "INFO-2026-0404-x");
  same((x) => w.content.transcriptionRead({ id: x, viewer: x === t.content_id ? "nobody" : V("bo") }), t.content_id, "e".repeat(64));
  same((x) => w.content.transcriptionAttest({ contentId: x, attestor: V("zo"), viewer: x === t.content_id ? "nobody" : V("zo") }), t.content_id, "e".repeat(64));
  same((x) => w.content.passageNotice({ contentId: x, viewer: x === id ? "nobody" : V("bo") }), id, "d".repeat(64));
  assert.equal(w.content.sees(DOC, V("bo")), true);
  assert.equal(w.content.sees(DOC, null), false, "no stamp sees nothing");
});

test("R41: through extraction's reading notice, the units before the write (its R24 unitsBefore) are graded against the units it left", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: OCR, pageCount: 2 });
  const U = (page, text) => ({ extent: { kind: "pdf-page", page, rect: null }, ref: `page ${page + 1}`, text });
  const same = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("bo") }).content_id;
  const moved = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 1 }, mintedBy: V("bo") }).content_id;
  const told = [];
  w.content.onStale("inquiry", (n) => told.push(n));
  const listener = w.ex.listeners.find((l) => l.module === "content");
  assert.ok(listener, "content registers its stale mark with extraction");
  /* the write has happened: the index holds the new units; the payload carries the old ones, extents parsed as R36 answers them */
  w.ex.units[a.sha] = { units: [U(0, "unchanged words"), U(1, "rewritten entirely")].map((u) => ({ ...u, extent: canonicalExtent(u.extent) })), state: "whole" };
  const NEW = [{ step: "layer", tier: 1 }, { step: "ocr", engine: "t", version: "9", cap: "B", measured_by: "m" }];
  const out = listener.fn({ bundleId: DOC, captureSha: a.sha, reading: {}, chainBefore: OCR, chainAfter: NEW,
                            unitsBefore: { units: [U(0, "unchanged words"), U(1, "the original sentence here")], state: "whole" }, indexed: null, author: V("bo") });
  assert.deepEqual(out, { staled: 2 });
  assert.deepEqual(told.map((n) => [n.content_id, n.grade, n.affects]), [[moved, "NOT_FOUND", "affected"]], "the unchanged page is A: nobody is told");
  assert.equal(told.some((n) => n.content_id === same), false);
});
