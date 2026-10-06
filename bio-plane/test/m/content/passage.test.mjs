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

/** A cited capture `a` at one address and a capture `c` of another bundle held at ANOTHER address: no version chain
 *  joins them, so only a caller that found `c` itself (reevaluation R36) can ask about it. */
function across({ cUnits = null, cState = "whole", cFacts = { pageCount: 3 }, aUnits = null, aState = "whole" } = {}) {
  const w = world();
  const a = w.cap("a", "cited bytes"), c = w.cap("c", "elsewhere bytes");
  w.doc(DOC, [a]); w.doc(NEW, [c]);
  w.read(a.sha, { chain: LAYER, pageCount: 3 },
    aUnits || [{ extent: P(0), text: "alpha beta" }, { extent: P(1), text: "the budget was cut by the council" }, { extent: P(2), text: "gamma" }], aState);
  w.read(c.sha, { chain: LAYER, ...cFacts },
    cUnits || [{ extent: P(0), text: "alpha beta" }, { extent: P(1), text: "gamma" }, { extent: P(2), text: "the budget was cut by the council" }], cState);
  w.prov.recordReceipt({ address: "https://ex.org/a", addressNorm: "ex.org/a", captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
  w.prov.recordReceipt({ address: "https://other.org/c", addressNorm: "other.org/c", captureSha: c.sha, retrieved: "2026-09-20T00:00:00Z" });
  const rowOf = (e) => {
    const id = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: V("bo") }).content_id;
    return w.row(`SELECT content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as FROM content WHERE content_id=?`, id);
  };
  const ask = (row, sha = c.sha, memo) => {
    const before = w.snapshot();
    const got = w.content.passageAcross(row, sha, memo);
    assert.deepEqual(w.snapshot(), before, "passageAcross writes nothing");
    return got;
  };
  return { w, a, c, rowOf, ask };
}

test("R55: passageAcross compares a row's passage with a capture held at another address exactly as R30–R31 compare a newer capture, one candidate in R47's shape; reads no version chain and asks no sight", () => {
  const KEYS = ["capture_sha", "extent", "matched", "reason", "why", "existing_content_id", "grade", "affects", "grade_reason",
                "grade_why", "found_at", "similarity", "candidate_only", "identity", "says"].sort();
  {
    const { w, c, rowOf, ask } = across();
    const row = rowOf(P(0));
    const own = w.content.noticeForRow(row, V("bo"), new Map());
    assert.deepEqual([own.state, own.candidates], ["no_newer_capture", []], "the row's own chain never reaches the capture");
    const k = ask(row);
    assert.deepEqual(Object.keys(k).sort(), KEYS, "R47's candidate fields, less the version chain's bundle_id and first_retrieved");
    assert.deepEqual([k.capture_sha, k.matched, k.reason, k.extent, k.grade, k.affects, k.candidate_only, k.identity],
      [c.sha, true, "extent_in_newer_capture", { kind: "pdf-page", page: 0, rect: null }, "A", "unaffected", true, "not_established"]);
    assert.match(k.says, /CANDIDATE/); assert.match(k.says, /never evidence of identity/);
    /* B: identical text at another position, found_at named */
    const kB = ask(rowOf(P(1)));
    assert.deepEqual([kB.grade, kB.affects, kB.grade_reason, kB.found_at.extent], ["B", "unaffected", "identical_elsewhere", { kind: "pdf-page", page: 2, rect: null }]);
    /* an existing row at that extent of the other capture is named, and nothing is minted (R30) */
    const there = w.content.mint({ bundleId: NEW, captureSha: c.sha, extent: P(0), mintedBy: V("bo") }).content_id;
    const n = w.count("content");
    assert.equal(ask(row).existing_content_id, there);
    assert.equal(w.count("content"), n);
    /* the whole document: whole on both sides, so A or B from the units */
    assert.equal(ask(rowOf({ kind: "document" })).reason, "whole_document");
    /* reads no version chain: one that cannot be read changes nothing */
    const vc = w.prov.versionChain;
    w.prov.versionChain = () => { throw new Error("no chain may be read"); };
    assert.deepEqual(ask(row), ask(row, c.sha, new Map()));
    assert.equal(ask(row).grade, "A");
    w.prov.versionChain = vc;
    /* asks no sight: a capture whose bundle no viewer here is a member of still answers; the caller gates (R37) */
    assert.equal(w.content.sees(NEW, "nobody"), false);
    assert.equal(ask(row, c.sha).capture_sha, c.sha);
  }
  /* the same comparison R30–R31 make on a version chain: put the capture on the row's chain and the candidate matches */
  {
    const { w, c, rowOf, ask } = across();
    w.prov.recordReceipt({ address: "https://ex.org/a", addressNorm: "ex.org/a", captureSha: c.sha, retrieved: "2026-09-21T00:00:00Z" });
    for (const e of [P(0), P(1), P(2), { kind: "document" }]) {
      const row = rowOf(e);
      const { bundle_id, first_retrieved, says, ...onChain } = w.content.noticeForRow(row, V("bo"), new Map()).candidates[0];
      const { says: s2, ...got } = ask(row);
      assert.deepEqual(got, onChain, JSON.stringify(e));
      assert.equal(typeof s2, "string");
    }
  }
});

test("R55: grades are R31's with no new one: C, NOT_FOUND only on whole text, UNDETERMINED wherever either capture's units are not held whole, never A or B but from the units", () => {
  const P1 = P(1);
  const g = (opts, e = P1) => { const { rowOf, ask } = across(opts); return ask(rowOf(e)); };
  const C = g({ cUnits: [{ extent: P(0), text: "alpha beta" }, { extent: P(1), text: "the budget was cut by the council today" }, { extent: P(2), text: "x" }] });
  assert.deepEqual([C.grade, C.affects], ["C", "affected"]); assert.ok(C.similarity >= 0.7);
  const NF = g({ cUnits: [{ extent: P(0), text: "alpha beta" }, { extent: P(1), text: "nothing alike here at all" }, { extent: P(2), text: "x" }] });
  assert.deepEqual([NF.grade, NF.affects], ["NOT_FOUND", "affected"]);
  /* the other capture's units not whole: never NOT_FOUND */
  const part = g({ cUnits: [{ extent: P(0), text: "nothing alike here at all" }], cState: "partial" });
  assert.deepEqual([part.grade, part.affects, part.grade_reason], ["UNDETERMINED", "undetermined", "newer_text_partial"]);
  const cut = g({ cUnits: [{ extent: P(0), text: "nothing alike", truncated: true }] });
  assert.deepEqual([cut.grade, cut.grade_reason], ["UNDETERMINED", "newer_text_truncated"]);
  const none = g({ cUnits: [], cState: null });
  assert.deepEqual([none.grade, none.grade_reason], ["UNDETERMINED", "newer_text_not_held"]);
  /* the cited capture's units not whole: undetermined, even where the extent matches */
  const notCited = g({ aUnits: [{ extent: P(0), text: "alpha beta" }] });
  assert.deepEqual([notCited.matched, notCited.grade, notCited.grade_reason], [true, "UNDETERMINED", "cited_text_not_held"]);
  const docPart = g({ aState: "partial" }, { kind: "document" });
  assert.deepEqual([docPart.matched, docPart.grade, docPart.grade_reason], [true, "UNDETERMINED", "cited_text_partial"]);
  const docOther = g({ cState: "partial" }, { kind: "document" });
  assert.deepEqual([docOther.grade, docOther.grade_reason], ["UNDETERMINED", "newer_text_partial"]);
  /* R30's extent test on the other capture */
  assert.deepEqual((({ matched, reason, extent }) => [matched, reason, extent])(g({ cFacts: { pageCount: 1 } }, P(2))),
    [false, "outside_newer_capture", null]);
  assert.deepEqual((({ matched, reason }) => [matched, reason])(g({ cFacts: { pageCount: null } })), [false, "bound_not_held"]);
  const unread = g({ cFacts: { chain: null, pageCount: 3 } });
  assert.deepEqual([unread.matched, unread.reason], [false, "newer_capture_unread"]);
  assert.match(unread.says, /^UNDETERMINED: /);
});

test("R55: null for a row that is not an object, a capture that is not 64 lowercase hex, or the row's own; memo reads a capture's units once; never throws", () => {
  const { w, a, c, rowOf, ask } = across();
  const row = rowOf(P(0));
  for (const bad of [null, undefined, "row", 7, ["x"]]) assert.equal(ask(bad), null, JSON.stringify(bad));
  for (const sha of [undefined, null, "", 7, c.sha.toUpperCase(), c.sha.slice(1), `${c.sha}0`, ` ${c.sha}`, "g".repeat(64)])
    assert.equal(w.content.passageAcross(row, sha), null, String(sha));
  assert.equal(ask(row, a.sha), null, "the row's own capture: a candidate is never the same passage");
  /* a capture nothing has read is still a capture: stated, never refused */
  const unknown = ask(row, "f".repeat(64));
  assert.deepEqual([unknown.matched, unknown.grade], [false, "UNDETERMINED"]);
  /* memo: one read of each capture's units across rows; a memo that is not a Map is not used */
  const units = w.content.extraction.unitsOf;
  let asked = [];
  w.content.extraction.unitsOf = (s) => { asked.push(s); return units(s); };
  const memo = new Map();
  const rows = [P(0), P(1), P(2)].map(rowOf);
  const got = rows.map((r) => ask(r, c.sha, memo));
  assert.deepEqual(asked.sort(), [a.sha, c.sha].sort());
  assert.deepEqual(ask(rows[1], c.sha, "not a map"), got[1]);
  w.content.extraction.unitsOf = () => { throw new Error("index unreadable"); };
  assert.equal(ask(rows[1], c.sha, new Map()), null, "a read that fails answers null, never a throw");
  w.content.extraction.unitsOf = units;
  const odd = ask({ ...row, extent: "{not json" });
  assert.deepEqual([odd.matched, odd.reason, odd.grade, odd.grade_reason], [false, "extent_unreadable", "UNDETERMINED", "extent_unreadable"]);
});
