/* content: one cited passage against the newer captures of its document (R29–R31) and C-80.3 (R38's share). Reads
   only: every table is byte-identical across each notice. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { VERSION_NOTICE_CHECKS } from "../../../checks/bio-checks.mjs";
import { world, V, LAYER } from "./fixture.mjs";
import { canonicalExtent, VERSION_NOTICE_ADDRESSES_MAX, VERSION_NOTICE_GRADES } from "../../../src/content/index.mjs";

const DOC = "INFO-2026-0001-a", NEW = "INFO-2026-0002-b";
const U = (page, text, truncated = false) => ({ extent: canonicalExtent({ kind: "pdf-page", page }), ref: `page ${page + 1}`, text, truncated });

/** An older capture `a` of an address and, optionally, a newer capture `b` of the same address. */
function setup({ newer = true, units = null, newUnits = null, newState = "whole", newFacts = { pageCount: 3 } } = {}) {
  const w = world();
  const a = w.cap("a", "old bytes"), b = w.cap("b", "new bytes");
  w.doc(DOC, [a]);
  w.read(a.sha, { chain: LAYER, pageCount: 3 }, units || [U(0, "alpha beta"), U(1, "the budget was cut by the council"), U(2, "gamma")]);
  w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
  if (newer) {
    w.doc(NEW, [b]);
    w.read(b.sha, { chain: LAYER, ...newFacts }, newUnits || [U(0, "alpha beta"), U(1, "gamma"), U(2, "the budget was cut by the council")], newState);
    w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: b.sha, retrieved: "2026-09-20T00:00:00Z" });
  }
  const cite = (e) => w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: e, mintedBy: V("bo") }).content_id;
  const notice = (id, viewer = V("bo")) => {
    const before = w.snapshot();
    const n = w.content.passageNotice({ contentId: id, viewer });
    assert.deepEqual(w.snapshot(), before, "the notice writes nothing");
    return n;
  };
  return { w, a, b, cite, notice };
}

test("R29: whether a newer capture exists is asked of the version chain at each address; no_newer only when every chain was read; chain_unread never read as none; C-80.3", () => {
  {
    const { cite, notice } = setup();
    const n = notice(cite({ kind: "pdf-page", page: 0 }));
    assert.deepEqual([n.ok, n.newer, n.state, n.chain_read, n.addresses_asked], [true, true, "newer_capture_matched", true, 1]);
    assert.match(n.visible_to, /visible to you/);
    assert.deepEqual([n.wrote, n.proposal_only], [false, true]);
  }
  {
    const { cite, notice } = setup({ newer: false });
    const n = notice(cite({ kind: "pdf-page", page: 0 }));
    assert.deepEqual([n.newer, n.state, n.affects, n.says], [false, "no_newer_capture", null, null]);
  }
  {
    const w = world();
    const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: LAYER, pageCount: 1 });
    const id = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "document" }, mintedBy: V("bo") }).content_id;
    const n = w.content.passageNotice({ contentId: id, viewer: V("bo") });
    assert.deepEqual([n.newer, n.state, n.affects], [null, "chain_unread", "undetermined"], "no recorded address: unread, never none");
    assert.match(n.why, /no address/);
  }
  {
    /* more than 20 addresses: the rest are not asked, and the answer says so */
    const w = world();
    const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: LAYER, pageCount: 1 });
    for (let i = 0; i <= VERSION_NOTICE_ADDRESSES_MAX; i++)
      w.prov.recordReceipt({ address: `https://ex.org/${i}`, addressNorm: `ex.org/${String(i).padStart(2, "0")}`, captureSha: a.sha, retrieved: "2026-09-01T00:00:00Z" });
    const id = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "document" }, mintedBy: V("bo") }).content_id;
    const n = w.content.passageNotice({ contentId: id, viewer: V("bo") });
    assert.deepEqual([n.addresses_asked, n.addresses_truncated, n.newer, n.state], [20, true, null, "chain_unread"]);
  }
  {
    const { w } = setup();
    const r = w.content.passageNotice({ contentId: "9".repeat(64), viewer: V("bo") });
    assert.deepEqual([r.ok, r.code, r.check, r.translation], [false, "VERSION_NOTICE_NO_CONTENT", "C-80.3",
      VERSION_NOTICE_CHECKS.VERSION_NOTICE_NO_CONTENT.translation]);
  }
});

test("R30: a candidate's extent holds only where the newer capture holds the bound and R7 passes; an existing row there is named, nothing minted; never the same passage", () => {
  {
    const { w, b, cite, notice } = setup();
    const there = w.content.mint({ bundleId: NEW, captureSha: b.sha, extent: { kind: "pdf-page", page: 1 }, mintedBy: V("bo") }).content_id;
    const c = notice(cite({ kind: "pdf-page", page: 1 })).candidates[0];
    assert.deepEqual([c.matched, c.reason, c.existing_content_id, c.candidate_only, c.identity], [true, "extent_in_newer_capture", there, true, "not_established"]);
  }
  {
    const { cite, notice } = setup({ newFacts: { pageCount: 2 } });
    const n = notice(cite({ kind: "pdf-page", page: 2 }));
    assert.deepEqual([n.candidates[0].matched, n.candidates[0].reason, n.candidates[0].extent], [false, "outside_newer_capture", null]);
    assert.equal(n.state, "newer_capture_undetermined");
  }
  {
    const { cite, notice } = setup({ newFacts: { pageCount: null } });
    const c = notice(cite({ kind: "pdf-page", page: 1 })).candidates[0];
    assert.deepEqual([c.matched, c.reason], [false, "bound_not_held"], "a bound the record does not hold is never a match");
  }
  {
    const { cite, notice } = setup({ newFacts: { chain: null, pageCount: 3 } });
    const c = notice(cite({ kind: "pdf-page", page: 1 })).candidates[0];
    assert.deepEqual([c.matched, c.reason], [false, "newer_capture_unread"]);
  }
  {
    const { cite, notice } = setup();
    const c = notice(cite({ kind: "document" })).candidates[0];
    assert.deepEqual([c.matched, c.reason], [true, "whole_document"]);
  }
});

test("R31: each candidate is graded from the captures' text units: A, B, C, NOT_FOUND only on whole text, else UNDETERMINED; affects rolls up", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(VERSION_NOTICE_GRADES).map(([k, v]) => [k, v.affects])),
    { A: "unaffected", B: "unaffected", C: "affected", NOT_FOUND: "affected", UNDETERMINED: "undetermined" });
  const grade = (opts, page) => { const { cite, notice } = setup(opts); const n = notice(cite({ kind: "pdf-page", page })); return [n.candidates[0].grade, n.affects, n]; };
  assert.deepEqual(grade({}, 0).slice(0, 2), ["A", "unaffected"]);
  const [gB, , nB] = grade({}, 1);
  assert.equal(gB, "B"); assert.equal(nB.candidates[0].found_at.ref, "page 3");
  const [gC, aC, nC] = grade({ newUnits: [U(0, "alpha beta"), U(1, "the budget was cut by the council today"), U(2, "x")] }, 1);
  assert.deepEqual([gC, aC], ["C", "affected"]); assert.ok(nC.candidates[0].similarity >= 0.7);
  assert.deepEqual(grade({ newUnits: [U(0, "alpha beta"), U(1, "nothing alike here at all"), U(2, "x")] }, 1).slice(0, 2), ["NOT_FOUND", "affected"]);
  assert.deepEqual(grade({ newUnits: [U(0, "alpha beta"), U(1, "nothing alike here at all")], newState: "partial" }, 1).slice(0, 2),
    ["UNDETERMINED", "undetermined"], "not whole: never NOT_FOUND");
  assert.deepEqual(grade({ newUnits: [U(0, "alpha beta"), U(1, "nothing alike", true)] }, 1).slice(0, 2), ["UNDETERMINED", "undetermined"]);
  assert.equal(grade({ newUnits: [] , newState: null }, 1)[0], "UNDETERMINED");
  assert.equal(grade({ units: [U(0, "alpha beta")] }, 1)[2].candidates[0].grade_reason, "cited_text_not_held", "an extent no unit carries");
  /* bytes are undetermined */
  {
    const w = world();
    const a = w.cap("a"), b = w.cap("b");
    const fx = { chain: LAYER, pageCount: 3, captureFormat: "docx", containerExtent: { container: "docx", levels: ["images"], images: [{ part: "e".repeat(64) }] } };
    w.doc(DOC, [a]); w.read(a.sha, fx, [U(0, "x")]);
    w.doc(NEW, [b]); w.read(b.sha, fx, [U(0, "x")]);
    for (const [s, t] of [[a.sha, "2026-09-01T00:00:00Z"], [b.sha, "2026-09-20T00:00:00Z"]])
      w.prov.recordReceipt({ address: "https://ex.org/doc", addressNorm: "ex.org/doc", captureSha: s, retrieved: t });
    const id = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "image", part: "e".repeat(64) }, mintedBy: V("bo") }).content_id;
    const n = w.content.passageNotice({ contentId: id, viewer: V("bo") });
    assert.deepEqual([n.candidates[0].grade, n.candidates[0].grade_reason], ["UNDETERMINED", "cited_as_bytes"]);
  }
  /* the whole document */
  const whole = (o) => { const { cite, notice } = setup(o); return notice(cite({ kind: "document" })).candidates[0].grade; };
  assert.equal(whole({ newUnits: [U(0, "alpha beta"), U(1, "the budget was cut by the council"), U(2, "gamma")] }), "A");
  assert.equal(whole({ newUnits: [U(0, "alpha beta\nthe budget was cut by the council\ngamma")] }), "B");
});
