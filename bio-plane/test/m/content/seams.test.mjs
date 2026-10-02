/* content: the extent core held here and the algebra read from text-chain (R48), the testimony path's check and mint on
   provenance's slot (R49), the ops map (R50) and the figures (R51) — T19 layer 4. Driven at content's interface (its
   exports, `contentOf` through the fixture's `world()`), at provenance's `testimonySlot` and record-core's `counts`. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, LAYER } from "./fixture.mjs";
import {
  CONTENT_EXTENT_CHECKS, CONTENT_EXTENT_OWN_CHECKS, CONTENT_EXTENT_KINDS, CONTENT_EXTENT_A1_RE, CONTENT_ID_RE,
  CONTENT_EXTENT_DOCUMENT_ONLY, CONTENT_EXTENT_KIND_NO_PRODUCER, CONTENT_COUNT_KEYS, canonicalExtent, describeExtent,
  contentCitedAs, contentIdFor, checkContentExtent, extentRelation, legExtent, legHasAuthoredExtent, imagePartUndetermined,
  contentOps,
} from "../../../src/content/index.mjs";
import * as textChain from "../../../src/textchain.mjs";
import { TESTIMONY_PATH } from "../../../src/provenance/index.mjs";

const DOC = "INFO-2026-0001-a", OTHER = "INFO-2026-0002-b";
const H = "a".repeat(64);

/* ------------------------------------------------------------------------------------------------------- R48 */

const C45 = {
  CONTENT_EXTENT_OUT_OF_RANGE: "C-45.1", CONTENT_EXTENT_NO_CHAIN: "C-45.2", CONTENT_EXTENT_UNREADABLE: "C-45.3",
  CONTENT_EXTENT_NO_PRODUCER: "C-45.4", CONTENT_EXTENT_NOT_A_CONTAINER: "C-45.11", CONTENT_ROW_UNKNOWN: "C-45.5",
  CONTENT_ROW_NOT_THIS_TARGET: "C-45.6", CONTENT_EXTENT_NO_IMAGE_PAINTED: "C-45.12",
};

test("R48: C-45's rows are this module's own table, each with its number, a translation and a where naming a site in this module", () => {
  assert.deepEqual(Object.keys(CONTENT_EXTENT_CHECKS), Object.keys(C45), "exactly the catalogue's eight rows, in its order");
  for (const [k, n] of Object.entries(C45)) {
    const r = CONTENT_EXTENT_CHECKS[k];
    assert.equal(r.check, n, k);
    assert.ok(typeof r.translation === "string" && r.translation.length > 80, k);
    assert.match(r.where, /^src\/content\/(extent-core|index)\.mjs \S+ > is-content-(extent|row)$/, k);
  }
  assert.equal(Object.keys(CONTENT_EXTENT_OWN_CHECKS).some((k) => k in CONTENT_EXTENT_CHECKS), false, "C-45.13 is not among them");
});

test("R48: every C-45 refusal this module answers, at the grammar, the mint and a citation, carries its row's check and translation from this module's table", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  w.read(a.sha, { chain: LAYER, pageCount: 2, captureFormat: "pdf",
                  containerExtent: { container: "pdf", levels: [], images: [{ page: 0, rect: [0, 0, 1, 1] }] } });
  const b = w.cap("b"); w.doc(OTHER, [b]); w.read(b.sha, { chain: LAYER, pageCount: 2 });
  const theirs = w.content.mint({ bundleId: OTHER, captureSha: b.sha, extent: { kind: "pdf-page", page: 0 }, mintedBy: V("bo") }).content_id;
  const got = [
    checkContentExtent({ kind: "pdf-page", page: 9 }, { chain: LAYER, pageCount: 2, container: {} }),
    checkContentExtent({ kind: "pdf-page", page: 0 }, { chain: null, pageCount: 2, container: {} }),
    checkContentExtent({ kind: "chapter" }, {}),
    checkContentExtent(null, {}),
    checkContentExtent({ kind: CONTENT_EXTENT_KIND_NO_PRODUCER }, {}),
    w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "image", part: H, cited_as: "bytes" }, mintedBy: V("bo") }),
    w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "image", page: 1 }, mintedBy: V("bo") }),
    ...w.content.citationRefusals([{ target: DOC, content_id: "0".repeat(64) }, { target: DOC, content_id: theirs },
                                   { target: DOC, extent_kind: "pdf-page", extent_page: 5 }]),
  ];
  assert.deepEqual(got.map((r) => r.code), ["CONTENT_EXTENT_OUT_OF_RANGE", "CONTENT_EXTENT_NO_CHAIN", "CONTENT_EXTENT_UNREADABLE",
    "CONTENT_EXTENT_UNREADABLE", "CONTENT_EXTENT_NO_PRODUCER", "CONTENT_EXTENT_NOT_A_CONTAINER", "CONTENT_EXTENT_NO_IMAGE_PAINTED",
    "CONTENT_ROW_UNKNOWN", "CONTENT_ROW_NOT_THIS_TARGET", "CONTENT_EXTENT_OUT_OF_RANGE"]);
  assert.deepEqual(new Set(got.map((r) => r.code)), new Set(Object.keys(C45)), "every row reached");
  for (const r of got) {
    assert.equal(r.check, CONTENT_EXTENT_CHECKS[r.code].check, r.code);
    assert.equal(r.translation, CONTENT_EXTENT_CHECKS[r.code].translation, r.code);
    assert.ok(typeof r.detail === "string" && r.detail, r.code);
  }
  /* the negative control: an address inside every bound is refused by none of them */
  assert.equal(checkContentExtent({ kind: "pdf-page", page: 1 }, { chain: LAYER, pageCount: 2, container: {} }), null);
});

test("R48: the extent algebra is text-chain's: its eight kinds (with envelope beside them), A1 notation, canonical and human forms and cited_as, answer for answer", () => {
  assert.equal(CONTENT_EXTENT_A1_RE, textChain.CONTENT_EXTENT_A1_RE, "the one pattern");
  const { envelope, ...eight } = CONTENT_EXTENT_KINDS;
  assert.deepEqual(eight, textChain.CONTENT_EXTENT_KINDS);
  assert.ok(envelope && envelope.landed);
  const extents = [];
  const cells = ["B14", "$b$14", "zz9", "14B", undefined];
  for (const kind of Object.keys(textChain.CONTENT_EXTENT_KINDS))
    for (const page of [undefined, 0, 2, -1, "1"])
      for (const rect of [undefined, [10, 20, 1, 2], [0, 0, 1]])
        for (const cell of cells)
          extents.push({ kind, page, rect, cell, sheet: " S ", para: page, run: 1, slide: page, shape: 0, table: page,
                         range: "$C$10:a1", part: cell === "B14" ? H.toUpperCase() : undefined,
                         ...(cell === "zz9" ? { cited_as: "bytes" } : {}), ...(cell === "14B" ? { ref: " a ref " } : {}) });
  for (const e of extents) {
    const k = JSON.stringify(e);
    assert.equal(canonicalExtent(e), textChain.canonicalExtent(e), k);
    assert.equal(describeExtent(e), textChain.describeExtent(e), k);
    assert.equal(contentCitedAs(e), textChain.contentCitedAs(e), k);
  }
  assert.ok(extents.length > 500, `${extents.length} extents`);
  /* the address is taken over that one form: R3's id is unmoved by the algebra's home */
  assert.equal(contentIdFor("c", { kind: "sheet-cell", sheet: "S", cell: "$b$14" }, LAYER),
               contentIdFor("c", { kind: "sheet-cell", sheet: "S", cell: "B14" }, LAYER));
});

test("R48: the core's leg reader, content id shape, document-only context and part statement answer as the grammar's", () => {
  /* legExtent: an absent kind is the whole document; each arm reads only its own flattened fields; cited_as on every kind */
  assert.deepEqual(legExtent({}), { kind: "document" });
  assert.deepEqual(legExtent(null), { kind: "document" });
  assert.deepEqual(legExtent({ extent_kind: "", extent_page: 3 }), { kind: "document" });
  assert.deepEqual(legExtent({ extent_kind: "pdf-page", extent_page: 2, extent_rect: [0, 0, 1, 1], extent_cell: "A1", extent_ref: " r " }),
    { kind: "pdf-page", ref: "r", page: 2, rect: [0, 0, 1, 1] });
  assert.deepEqual(legExtent({ extent_kind: "doc-table", extent_table: 1, extent_cell: "B2", extent_para: 4 }), { kind: "doc-table", table: 1, cell: "B2" });
  assert.deepEqual(legExtent({ extent_kind: "image", extent_part: H, extent_cited_as: "text" }), { kind: "image", part: H, cited_as: "text" });
  assert.deepEqual(legExtent({ extent_kind: "doc-para", extent_para: 0, extent_cited_as: "bytes" }), { kind: "doc-para", para: 0, cited_as: "bytes" });
  /* legHasAuthoredExtent: only a field the document carries; an empty value is not authored */
  assert.equal(legHasAuthoredExtent({}), false);
  assert.equal(legHasAuthoredExtent({ extent_kind: "", extent_page: null }), false);
  for (const k of ["extent_kind", "extent_page", "extent_rect", "extent_ref", "extent_sheet", "extent_cell", "extent_slide", "extent_shape",
                   "extent_para", "extent_run", "extent_range", "extent_table", "extent_part", "extent_cited_as"])
    assert.equal(legHasAuthoredExtent({ [k]: 0 }), true, k);
  /* CONTENT_ID_RE is the minter's own output and nothing looser */
  assert.equal(CONTENT_ID_RE.test(contentIdFor("c", { kind: "document" }, null)), true);
  for (const v of [H.toUpperCase(), "a".repeat(63), "g".repeat(64), ` ${H}`]) assert.equal(CONTENT_ID_RE.test(v), false, v);
  /* the document-only pass skips every record arm and states nothing */
  assert.deepEqual({ ...CONTENT_EXTENT_DOCUMENT_ONLY }, { known: false, chain: null, pageCount: null });
  assert.ok(Object.isFrozen(CONTENT_EXTENT_DOCUMENT_ONLY));
  assert.equal(checkContentExtent({ kind: "doc-para", para: 99 }, CONTENT_EXTENT_DOCUMENT_ONLY), null);
  /* imagePartUndetermined: an office capture with no image list, or a kind not held, is stated; checked in full, null */
  const img = { kind: "image", part: H };
  assert.equal(imagePartUndetermined(img, { container: { office: null, kind_why: "no format held" } }).level, "container_kind");
  assert.match(imagePartUndetermined(img, { container: { office: null, kind_why: "no format held" } }).why, /^no format held/);
  assert.equal(imagePartUndetermined(img, { container: { office: true } }).level, "image_list");
  assert.equal(imagePartUndetermined(img, { container: { office: true, images: [] } }), null);
  assert.equal(imagePartUndetermined(img, CONTENT_EXTENT_DOCUMENT_ONLY), null);
  assert.equal(imagePartUndetermined({ kind: "image", page: 0 }, { container: { office: null } }), null, "only a part");
  /* extentRelation is the grammar's: the face answers the eight kinds by the core */
  assert.equal(extentRelation({ kind: "sheet-cell", sheet: "S" }, { kind: "sheet-cell", sheet: "S", cell: "$a$1" }), "narrower");
  assert.equal(extentRelation({ kind: "doc-table", table: 0 }, { kind: "doc-table", table: 0, cell: "A1" }), "unreadable",
    "an arm the relation does not read is unreadable, never narrower");
});

/* ------------------------------------------------------------------------------------------------------- R49 */

/** A promotion's step context on the testimony path, as provenance's slot reads it. */
const testimony = (bundleId, t) => ({ bundleId, pkg: { [TESTIMONY_PATH]: { words: "I saw it.", observedAt: "2026-09-26", ...t } } });

test("R49: content registers its check and its mint on provenance's testimony slot, once; the check asks the document extent over the path's capture before anything is written", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  const again = w.prov.onTestimony("content", { check: () => null });
  assert.deepEqual([again.ok, again.code], [false, "LISTENER_DECLARED"], "registered once, at start");
  const slot = w.prov.testimonySlot();
  const asked = [];
  const ctx = w.content.contentContextFor;
  w.content.contentContextFor = (s) => { asked.push(s); return ctx.call(w.content, s); };
  const before = w.snapshot();
  assert.equal(slot.check(testimony(DOC, { captureSha: a.sha, author: V("ann"), recordedAt: "2026-09-27T00:00:00Z" })), null,
    "a whole document is never refused, read or unread");
  assert.deepEqual(asked, [a.sha], "the context of the path's own capture");
  assert.deepEqual(w.snapshot(), before, "the check writes nothing");
  w.content.contentContextFor = ctx;
  /* a promotion without the testimony path runs nothing of content's */
  assert.equal(slot.check({ bundleId: DOC, pkg: {} }), null);
  assert.equal(slot.project({ bundleId: DOC, pkg: {} }), null);
  assert.equal(w.count("content"), 0);
  /* the check's refusal is the promotion's, as it came */
  const refusal = { ok: false, code: "CONTENT_EXTENT_UNREADABLE", check: "C-45.3", translation: "t", detail: "d" };
  w.content.testimonyCheck = () => refusal;
  assert.equal(slot.check(testimony(DOC, { captureSha: a.sha, author: V("ann") })), refusal);
});

test("R49: the projection mints the document row over the path's capture, under the null chain, by the path's author at its recording instant, and answers its content_id; a refused mint throws naming its code", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]);
  const slot = w.prov.testimonySlot();
  const c = testimony(DOC, { captureSha: a.sha, author: V("ann"), recordedAt: "2026-09-27T01:02:03Z" });
  const out = slot.project(c);
  const id = contentIdFor(a.sha, { kind: "document" }, null);
  assert.deepEqual(out, { testimony: { content_id: id } });
  const row = w.row(`SELECT * FROM content WHERE content_id=?`, id);
  assert.deepEqual([row.bundle_id, row.capture_sha, row.extent_kind, row.chain, row.minted_by, row.at, row.cited_as, row.stale],
    [DOC, a.sha, "document", null, V("ann"), "2026-09-27T01:02:03Z", "text", 0]);
  /* a re-run finds the row: minted once, first minter and instant kept (R13) */
  const before = w.snapshot();
  assert.deepEqual(slot.project(testimony(DOC, { captureSha: a.sha, author: V("bo"), recordedAt: "2027-01-01T00:00:00Z" })), out);
  assert.deepEqual(w.snapshot(), before);
  /* the earlier projections' answers are beside it, never replaced by content's */
  assert.equal(w.prov.onTestimony("extraction", { project: () => ({ indexed: 1 }) }).ok, true);
  assert.deepEqual(w.prov.testimonySlot().project(c), { testimony: { indexed: 1, content_id: id } }, "extraction first, in the modules' order");
  /* a refused mint throws, so the whole promotion rolls back */
  const mint = w.content.mint;
  w.content.mint = () => ({ ok: false, code: "CONTENT_EXTENT_UNREADABLE" });
  assert.throws(() => slot.project(testimony(OTHER, { captureSha: "f".repeat(64), author: V("ann") })), /CONTENT_EXTENT_UNREADABLE/);
  w.content.mint = mint;
});

/* ------------------------------------------------------------------------------------------------------- R50 */

const urlOf = (q) => new URL(`https://plane.invalid/?${new URLSearchParams(q)}`);

test("R50: contentOps publishes eight route arms, each a function of no arguments answering what its service answers", () => {
  const w = world();
  const ops = contentOps(w.content, urlOf({}), null);
  assert.deepEqual(Object.keys(ops).sort(),
    ["attesttext", "content", "contentcrop", "contentmint", "textattest", "transcribe", "transcription", "transcriptionattest"]);
  for (const [k, f] of Object.entries(ops)) assert.equal(f.length, 0, k);
});

test("R50: each arm reads its parameters as store.mjs' arm did: the stamps from the query, never the body; the body's fields where the arm took them", async () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: LAYER, pageCount: 3 });
  const id = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: 1 }, mintedBy: V("bo") }).content_id;
  const run = (op, q, body) => contentOps(w.content, urlOf(q), body)[op]();

  /* content: extras are every parameter name the query holds */
  assert.deepEqual(run("content", { id, viewer: V("bo") }), w.content.contentRead({ id, viewer: V("bo"), extras: ["id", "viewer"] }));
  assert.deepEqual(run("content", { id, viewer: V("bo"), where: "x" }).rejected, ["where"]);
  assert.equal(run("content", { id, viewer: V("bo"), store: "s1" }).ok, true);

  /* contentcrop: id from the query */
  assert.deepEqual(await run("contentcrop", { id, viewer: V("bo") }), await w.content.cropOf({ contentId: id, viewer: V("bo") }));

  /* contentmint: the minter is the query's stamp, never the body's; bundle, extent and at from the body, at null when absent */
  const m = run("contentmint", { mintedBy: V("cy"), viewer: V("cy") },
                { bundleId: DOC, extent: { kind: "pdf-page", page: 2 }, mintedBy: V("mallory"), minted_by: V("mallory") });
  assert.deepEqual([m.ok, m.minted_by, m.at], [true, V("cy"), "2026-09-27T03:00:00.000Z"]);
  assert.equal(run("contentmint", { viewer: V("cy") }, { bundleId: DOC, mintedBy: V("mallory") }).reason, "NO_MINTER");
  assert.equal(run("contentmint", { mintedBy: V("cy"), viewer: V("cy") }, null).reason, "NO_TARGET", "no body");
  assert.equal(run("contentmint", { mintedBy: V("cy"), viewer: V("cy") }, { bundleId: DOC, at: "2026-01-01T00:00:00Z" }).at,
    "2026-01-01T00:00:00Z");

  /* attesttext: the attestor is the query's stamp; the body's member is never read */
  const att = run("attesttext", { attestor: V("di"), viewer: V("di") },
                  { captureSha: a.sha, member: V("mallory"), extent: { kind: "page", page: 1 }, at: "2026-09-02T00:00:00Z",
                    note: "page 1 against the scan" });
  assert.deepEqual([att.ok, att.attestor], [true, V("di")]);
  assert.equal(run("attesttext", { viewer: V("di") }, { captureSha: a.sha, member: V("di"), extent: { kind: "document" } }).code,
    "TEXT_ATTEST_MACHINE", "an absent stamp is not filled from the body");

  /* textattest: no page is no target; a page is {page: Number, rect: the query's rect as JSON, null when unreadable} */
  assert.deepEqual(run("textattest", { sha256: a.sha, viewer: V("bo") }), w.content.attestationsFor(a.sha, null, V("bo"), null));
  assert.deepEqual(run("textattest", { sha256: a.sha, viewer: V("bo"), page: "1", rect: "[0,0,5,5]", limit: "1" }),
                   w.content.attestationsFor(a.sha, { page: 1, rect: [0, 0, 5, 5] }, V("bo"), "1"));
  assert.deepEqual(run("textattest", { sha256: a.sha, viewer: V("bo"), page: "1", rect: "{not json" }),
                   w.content.attestationsFor(a.sha, { page: 1, rect: null }, V("bo"), null));
  assert.equal(run("textattest", { viewer: V("bo") }).reason, "NO_SHA");

  /* transcribe: the typist is the query's stamp; bundle, extent, text and at from the body */
  const t = run("transcribe", { transcriber: V("ty"), viewer: V("ty") },
                { bundleId: DOC, extent: { kind: "pdf-page", page: 0 }, text: "typed", at: "2026-09-05T00:00:00Z", transcriber: V("mallory") });
  assert.deepEqual([t.ok, t.transcriber], [true, V("ty")]);
  assert.equal(w.row(`SELECT at FROM transcriptions WHERE content_id=?`, t.content_id).at, "2026-09-05T00:00:00Z");
  assert.equal(run("transcribe", { viewer: V("ty") }, { bundleId: DOC, extent: { kind: "pdf-page", page: 0 }, text: "x", transcriber: V("ty") }).code,
    "TRANSCRIBE_NOT_A_MEMBER", "the body's transcriber is never read");
  assert.equal(run("transcribe", { transcriber: V("ty"), viewer: V("ty") }, null).code, "TRANSCRIBE_NO_DOCUMENT", "no body");

  /* transcriptionattest: the content id from the body, else the query; the attestor the query's stamp */
  const ta = run("transcriptionattest", { attestor: V("zo"), viewer: V("zo") }, { contentId: t.content_id, note: "checked", attestor: V("ty") });
  assert.deepEqual([ta.ok, ta.attestor], [true, V("zo")]);
  const tq = run("transcriptionattest", { attestor: V("xi"), viewer: V("xi"), contentId: t.content_id }, { note: "checked" });
  assert.deepEqual([tq.ok, tq.attestor], [true, V("xi")]);
  assert.equal(run("transcriptionattest", { attestor: V("ty"), viewer: V("ty"), contentId: t.content_id }, {}).code, "TRANSCRIPTION_SELF_ATTEST");

  /* transcription: id from the query */
  assert.deepEqual(run("transcription", { id: t.content_id, viewer: V("zo") }), w.content.transcriptionRead({ id: t.content_id, viewer: V("zo") }));
});

/* ------------------------------------------------------------------------------------------------------- R51 */

test("R51: content and contentStale are registered with record-core's counts, keyed on bundle_id: whole without hid, a hidden bundle's rows left out with it", () => {
  const w = world();
  assert.deepEqual([...CONTENT_COUNT_KEYS], ["content", "contentStale"]);
  assert.deepEqual([w.record.counts().content, w.record.counts().contentStale], [0, 0], "registered at start: an empty store reads zero, never null");
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: LAYER, pageCount: 3 });
  const b = w.cap("b"); w.doc(OTHER, [b]); w.read(b.sha, { chain: LAYER, pageCount: 3 });
  for (const p of [0, 1, 2]) w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "pdf-page", page: p }, mintedBy: V("bo") });
  w.content.mint({ bundleId: OTHER, captureSha: b.sha, extent: { kind: "document" }, mintedBy: V("bo") });
  w.content.markStale(a.sha, [{ step: "ocr", engine: "t", version: "2", cap: "B", measured_by: "m" }]);
  const whole = w.record.counts(null);
  assert.deepEqual([whole.content, whole.contentStale], [4, 3]);
  const hid = { sql: "(SELECT ?)", args: [DOC] };
  const seen = w.record.counts(hid);
  assert.deepEqual([seen.content, seen.contentStale], [1, 0], "the hidden bundle's rows are left out of both");
  assert.deepEqual(w.content.counts({ sql: "(SELECT ?)", args: [OTHER] }), { content: 3, contentStale: 3 });
  const before = w.snapshot();
  w.record.counts(hid);
  assert.deepEqual(w.snapshot(), before, "counting writes nothing");
  /* one holder per figure */
  const clash = w.record.registerCounts("other", ["contentStale"], () => ({}));
  assert.deepEqual([clash.code, clash.heldBy], ["COUNTS_DECLARED", "content"]);
});
