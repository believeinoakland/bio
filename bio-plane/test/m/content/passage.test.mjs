/* content: a held row's passage text (R46; N215) and the notice for one row a caller has read (R47; N161). Reads
   only: every table is byte-identical across each call. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, LAYER } from "./fixture.mjs";
import { canonicalExtent } from "../../../src/content/index.mjs";

const DOC = "INFO-2026-0001-a", NEW = "INFO-2026-0002-b";
const P = (page, rect) => ({ kind: "pdf-page", page, ...(rect ? { rect } : {}) });
const U = (extent, text, seq, truncated = false) => ({ extent: canonicalExtent(extent), ref: `u${seq}`, text, truncated, seq });

/** A read capture `a` of DOC with three indexed pages, held in `seq` order but listed out of it. */
function setup({ units = null, state = "whole", facts = {} } = {}) {
  const w = world();
  const a = w.cap("a");
  w.doc(DOC, [a]);
  w.read(a.sha, { chain: LAYER, pageCount: 3, ...facts });
  w.ex.units[a.sha] = { units: units || [U(P(2), "third page", 2), U(P(0), "first page", 0), U(P(1), "second page", 1)], state };
  const mint = (e) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: V("bo") }).content_id;
  const text = (id) => {
    const before = w.snapshot();
    const t = w.content.passageText(id);
    assert.deepEqual(w.snapshot(), before, "passageText writes nothing");
    return t;
  };
  return { w, a, mint, text };
}

test("R46: passageText is a typing's text byte for byte, else the text held at exactly the row's extent, the whole document's units in seq order joined by a line feed only when the index reads whole", () => {
  {
    const { w, mint, text } = setup();
    assert.equal(text(mint(P(1))), "second page", "the one unit at exactly the row's extent");
    assert.equal(text(mint({ kind: "document" })), "first page\nsecond page\nthird page", "every unit, in seq order, one line feed between");
    assert.equal(text(` ${mint(P(0))} `), "first page");
    /* a typing: the typed text byte for byte, never the index's text at that extent */
    const typed = "  In the year 1921,\n\tthe parcel — ¶ as-is  ";
    const t = w.content.transcribe({ bundleId: DOC, extent: P(1), text: typed, transcriber: V("ty"), viewer: V("ty") });
    assert.equal(t.ok, true, JSON.stringify(t).slice(0, 300));
    assert.equal(text(t.content_id), typed);
    const td = w.content.transcribe({ bundleId: DOC, extent: { kind: "document" }, text: "x", transcriber: V("ty"), viewer: V("ty") });
    assert.equal(text(td.content_id), "x", "a whole-document typing is its text, whatever the index holds");
  }
  {
    /* a part index (partial) still answers a passage held whole at exactly its extent, and never the whole document */
    const { mint, text } = setup({ state: "partial" });
    assert.equal(text(mint(P(2))), "third page");
    assert.equal(text(mint({ kind: "document" })), null, "a document extent needs an index that reads whole");
  }
  {
    /* the empty string is text held, and stays itself (never read as absent) */
    const { mint, text } = setup({ units: [U(P(0), "", 0), U(P(1), "b", 1)] });
    assert.equal(text(mint(P(0))), "");
  }
});

test("R46: passageText answers null for a row not held, one cited as bytes, and text not held whole at exactly its extent; it never throws", () => {
  {
    const { w, mint, text } = setup();
    for (const id of [undefined, null, "", "0".repeat(64), 7, {}, ["x"]]) assert.equal(text(id), null, JSON.stringify(id));
    assert.equal(text(mint(P(1, [0, 0, 5, 5]))), null, "a region of a page: no unit at exactly that extent");
  }
  {
    const { w, a, text } = setup({ facts: { captureFormat: "docx", containerExtent: { container: "docx", levels: ["images"], images: [{ part: "e".repeat(64) }] } } });
    const img = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "image", part: "e".repeat(64) }, mintedBy: V("bo") });
    assert.equal(img.ok, true, JSON.stringify(img));
    w.ex.units[a.sha].units.push(U({ kind: "image", part: "e".repeat(64) }, "alt text", 3));
    assert.equal(text(img.content_id), null, "an image cited as its bytes has no passage text");
  }
  {
    const { mint, text } = setup({ units: [U(P(0), "first", 0), U(P(1), "cut at the cap", 1, true)] });
    assert.equal(text(mint(P(1))), null, "a unit held only to its per-unit cap");
    assert.equal(text(mint({ kind: "document" })), null, "a whole document with a unit cut at the cap");
    assert.equal(text(mint(P(0))), "first");
  }
  for (const state of ["partial", "none", null]) {
    const { mint, text } = setup({ state });
    assert.equal(text(mint({ kind: "document" })), null, `an index reading ${state}`);
  }
  {
    const { w, a, mint, text } = setup();
    const id = mint(P(1));
    delete w.ex.units[a.sha];
    assert.equal(text(id), null, "a capture never indexed");
    assert.equal(text(mint({ kind: "document" })), null);
    w.content.extraction.unitsOf = () => { throw new Error("index unreadable"); };
    assert.equal(text(id), null, "never throws");
  }
});

test("R46 (N264): passageText answers null for a row R41 marked stale, never the newer reading's text at that extent, even where that text is unchanged", () => {
  const { w, a, mint, text } = setup();
  const p0 = mint(P(0)), p1 = mint(P(1)), whole = mint({ kind: "document" });
  const t = w.content.transcribe({ bundleId: DOC, extent: P(1), text: "typed by hand", transcriber: V("ty"), viewer: V("ty") });
  /* the negative control: before the re-read, each row answers the text it was cited under */
  assert.deepEqual([text(p0), text(p1), text(whole), text(t.content_id)],
    ["first page", "second page", "first page\nsecond page\nthird page", "typed by hand"]);
  /* the re-read, through extraction's reading notice (its R24): the index now holds the new reading's units, and the
     rows cited under the old chain are marked stale (R22) */
  const NEW = [{ step: "layer", tier: 1 }, { step: "ocr", engine: "t", version: "2", cap: "B", measured_by: "m" }];
  const unitsBefore = w.ex.units[a.sha];
  w.ex.units[a.sha] = { units: [U(P(0), "first page", 0), U(P(1), "second page, re-read", 1), U(P(2), "third page", 2)], state: "whole" };
  w.read(a.sha, { chain: NEW, pageCount: 3 });
  const listener = w.ex.listeners.find((l) => l.module === "content");
  assert.deepEqual(listener.fn({ bundleId: DOC, captureSha: a.sha, reading: {}, chainBefore: LAYER, chainAfter: NEW, unitsBefore,
                                 indexed: null, author: V("bo") }), { staled: 3 });
  const stale = (id) => w.row(`SELECT stale FROM content WHERE content_id=?`, id).stale;
  assert.deepEqual([stale(p0), stale(p1), stale(whole), stale(t.content_id)], [1, 1, 1, 0]);
  assert.equal(text(p1), null, "never the newer reading's text at the extent");
  assert.equal(text(p0), null, "stale is null even where the text at the extent is byte-identical");
  assert.equal(text(whole), null);
  assert.equal(text(` ${p1} `), null);
  /* a typing is never staled (R22) and keeps its text; a row minted under the new chain is current and answers it */
  assert.equal(text(t.content_id), "typed by hand");
  const fresh = mint(P(1));
  assert.notEqual(fresh, p1, "the new chain is a new address (R3)");
  assert.equal(text(fresh), "second page, re-read");
});

/** An older capture `a` of an address with indexed pages, a newer capture `b` of the same address, and two rows. */
function versions() {
  const w = world();
  const a = w.cap("a", "old bytes"), b = w.cap("b", "new bytes");
  w.doc(DOC, [a]); w.doc(NEW, [b]);
  w.read(a.sha, { chain: LAYER, pageCount: 2 }, [{ extent: P(0), text: "kept" }, { extent: P(1), text: "the budget was cut" }]);
  w.read(b.sha, { chain: LAYER, pageCount: 2 }, [{ extent: P(0), text: "kept" }, { extent: P(1), text: "entirely new words" }]);
  w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
  w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: b.sha, retrieved: "2026-09-20T00:00:00Z" });
  const ids = [P(0), P(1)].map((e) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: V("bo") }).content_id);
  /* the rows as a caller reads them through R45's read contract */
  const rows = w.rows(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as FROM content
                        WHERE capture_sha=? ORDER BY content_id`, a.sha);
  return { w, a, b, ids, rows };
}

test("R47: noticeForRow answers passageNotice's notice for a row read through R45's contract, for the viewer's chains, less the gate and the vocabularies; memo reads a capture's units once; writes nothing; never throws", () => {
  const { w, a, b, ids, rows } = versions();
  const before = w.snapshot();
  let asked = [];
  const units = w.content.extraction.unitsOf;
  w.content.extraction.unitsOf = (s) => { asked.push(s); return units(s); };
  const memo = new Map();
  const notices = rows.map((r) => w.content.noticeForRow(r, V("bo"), memo));
  assert.deepEqual(asked.sort(), [a.sha, b.sha].sort(), "each capture's units read once across the rows, through memo");
  asked = [];
  for (const [i, r] of rows.entries()) {
    const full = w.content.passageNotice({ contentId: r.content_id, viewer: V("bo") });
    const { ok, states, grades, wrote, proposal_only, visible_to, ...notice } = full;
    assert.deepEqual([ok, wrote, proposal_only, typeof visible_to, !!states, !!grades], [true, false, true, "string", true, true]);
    assert.deepEqual(notices[i], notice, "the same notice passageNotice answers, field for field");
    for (const k of ["ok", "states", "grades", "wrote", "proposal_only", "visible_to"]) assert.equal(k in notices[i], false, k);
  }
  assert.ok(asked.length > 0, "a notice asked without a memo reads the units afresh");
  w.content.extraction.unitsOf = units;
  const by = Object.fromEntries(rows.map((r, i) => [r.content_id, notices[i]]));
  assert.deepEqual([by[ids[0]].state, by[ids[0]].candidates[0].grade, by[ids[0]].affects], ["newer_capture_matched", "A", "unaffected"]);
  assert.deepEqual([by[ids[1]].candidates[0].grade, by[ids[1]].affects], ["NOT_FOUND", "affected"]);
  assert.equal(by[ids[1]].candidates[0].capture_sha, b.sha);
  /* no sight gate and no C-80.3: the chains are read for the viewer given, and one who sees nothing reads none */
  const blind = w.content.noticeForRow(rows[0], "nobody", new Map());
  assert.deepEqual([blind.content_id, blind.state, blind.newer, blind.affects], [rows[0].content_id, "chain_unread", null, "undetermined"]);
  assert.equal(w.content.passageNotice({ contentId: rows[0].content_id, viewer: "nobody" }).code, "VERSION_NOTICE_NO_CONTENT");
  /* a memo that is not a Map is not used; the answer is the same */
  assert.deepEqual(w.content.noticeForRow(rows[1], V("bo"), "not a map"), notices[1]);
  assert.deepEqual(w.content.noticeForRow(rows[1], V("bo")), notices[1]);
  /* never throws */
  for (const bad of [null, undefined, "row", 7, ["x"]]) assert.equal(w.content.noticeForRow(bad, V("bo")), null, JSON.stringify(bad));
  const odd = w.content.noticeForRow({ ...rows[0], extent: "{not json" }, V("bo"), new Map());
  assert.deepEqual([odd.candidates[0].grade, odd.candidates[0].grade_reason, odd.candidates[0].reason],
    ["UNDETERMINED", "extent_unreadable", "extent_unreadable"]);
  const vc = w.prov.versionChain;
  w.prov.versionChain = () => { throw new Error("chain unreadable"); };
  assert.equal(w.content.noticeForRow(rows[0], V("bo"), new Map()), null, "a read that fails answers null, never a throw");
  w.prov.versionChain = vc;
  assert.deepEqual(w.snapshot(), before, "noticeForRow writes nothing");
});
