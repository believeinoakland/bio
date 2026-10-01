/* content: the per-passage version notice, converted from the legacy suites `versiongrade.test.mjs` (REC-221, the grade
   R31) and `versionnotice.test.mjs` (D-394, content's passage arm only: R29–R31 and C-80.3). The question arm of the old
   op (`target=`, every leg of an inquiry, C-80.1, C-80.2, `inquiry_basis`, the leg bound) is reevaluation's and is not
   here. Every notice is driven at content's interface (`passageNotice`) over the fixture's real record, membership,
   promotion and provenance; extraction's facts and text units are the fixture's provider. Reads only: the store is
   byte-identical across every notice read in each test. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, LAYER, sha } from "./fixture.mjs";
import { VERSION_NOTICE_CHECKS, VERSION_NOTICE_GRADES, VERSION_NOTICE_STATES } from "../../../src/content/index.mjs";

/* ------------------------------------------------------------------ versiongrade's ground */
const T = "Council approved the transfer of two point one million dollars from the general fund to the reserve";
const T_EDIT = "Council approved the transfer of three point four million dollars from the general fund to the reserve";
const OTHER = (k) => `Unrelated matter ${k}: the parks commission heard public comment on the library hours`;
const P = [OTHER("p0"), T, OTHER("p2")];
const IMG = sha("rec221 an embedded image");
const DOCX_OLD = ["Item 1. Call to order.", T, "Item 3. Adjournment at nine.", "Item 4. A closed session."];
const DOCX_NEW = ["Item 1. Call to order.", "Item 3. Adjournment at nine.", T_EDIT, "Item 5. Public comment."];

/* A unit's extent is spelled with its optional fields OMITTED (no `rect`, no `run`, no `shape`), a spelling no minted
   row uses: the grade must read it as the same address (R2), or every A below reads UNDETERMINED. `rectNull` spells a
   pdf page's unit with `rect: null` instead. */
const unitExtent = (fmt, i, rectNull) => fmt === "pdf" ? { kind: "pdf-page", page: i, ...(rectNull ? { rect: null } : {}) }
  : fmt === "docx" ? { kind: "doc-para", para: i } : { kind: "slide-shape", slide: i + 1 };   /* the grammar reads a slide 1-based */
const unitsOf = (fmt, texts, rectNull = false) => texts.map((text, i) => ({ extent: unitExtent(fmt, i, rectNull),
  ref: `${fmt === "pdf" ? "page" : fmt === "docx" ? "para" : "slide"} ${i}`, text }));
const factsOf = (fmt, n) => fmt === "pdf" ? { chain: LAYER, pageCount: 3 }
  : fmt === "docx" ? { chain: [{ step: "layer", tier: 1, container: "docx" }], captureFormat: "docx",
      containerExtent: { container: "docx", levels: ["paragraphs", "tables", "images"], paragraphs: n,
                         tables: [{ rows: 2, cols: 2 }], images: [{ part: IMG }] } }
  : { chain: [{ step: "layer", tier: 1, container: "pptx" }], captureFormat: "pptx",
      containerExtent: { container: "pptx", levels: ["slides"], slides: Array.from({ length: n }, (_, i) => ({ index: i + 1 })) } };

/** One pair per call: an OLDER capture of an address (cited) and a NEWER capture of the same address, each read and
 *  each (unless `neu` is null) holding text units. `neu: null` is a newer capture read with no text held. */
function pairs() {
  const w = world();
  let n = 0;
  const pair = ({ fmt = "pdf", old, neu, newState = "whole", rectNull = false }) => {
    n++;
    const addr = `ex.org/rec221/${n}`;
    const a = w.cap(`p${n}-old`, `old ${n}`), b = w.cap(`p${n}-new`, `new ${n}`);
    const A = `INFO-2026-${2200 + n}-a`, B = `INFO-2026-${2200 + n}-b`;
    w.doc(A, [a]); w.doc(B, [b]);
    w.read(a.sha, factsOf(fmt, old.length), unitsOf(fmt, old, rectNull), "whole");
    if (neu) w.read(b.sha, factsOf(fmt, neu.length), unitsOf(fmt, neu, rectNull), newState);
    else w.read(b.sha, factsOf(fmt, old.length));
    w.prov.recordReceipt({ address: `https://${addr}`, addressNorm: addr, captureSha: a.sha, retrieved: "2026-01-01T09:00:00Z" });
    w.prov.recordReceipt({ address: `https://${addr}`, addressNorm: addr, captureSha: b.sha, retrieved: "2026-03-01T09:00:00Z" });
    const cite = (extent) => {
      const m = w.content.mint({ bundleId: A, captureSha: a.sha, extent, mintedBy: V("ruth") });
      assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
      return m.content_id;
    };
    return { a, b, A, B, cite };
  };
  const notice = (id) => w.content.passageNotice({ contentId: id, viewer: V("ruth") });
  return { w, pair, notice };
}

/* The grade's view of a notice: [state, grade, affects, grade_reason, notice affects]. */
const G = (n) => [n.state, n.candidates[0].grade, n.candidates[0].affects, n.candidates[0].grade_reason, n.affects];

function gradeGround() {
  const { w, pair, notice } = pairs();
  const pA = pair({ old: P, neu: [OTHER("p0 revised"), T, OTHER("p2")] });
  const pA2 = pair({ old: P, neu: [OTHER("p0 revised"), T, OTHER("p2")], rectNull: true });
  const pB = pair({ old: P, neu: [OTHER("p0"), OTHER("inserted"), T] });
  const pC = pair({ old: P, neu: [OTHER("p0"), T_EDIT, OTHER("p2")] });
  const pN = pair({ old: P, neu: [OTHER("p0"), OTHER("replaced"), OTHER("p2")] });
  const pP = pair({ old: P, neu: [OTHER("p0"), OTHER("replaced")], newState: "partial" });
  const pR = pair({ old: P, neu: null });
  const pH = pair({ old: [OTHER("p0")], neu: [OTHER("p0"), T] });
  const pW = pair({ old: P, neu: [...P] });
  const dX = pair({ fmt: "docx", old: DOCX_OLD, neu: DOCX_NEW });
  const sX = pair({ fmt: "pptx", old: ["Slide one: the budget gap", T], neu: ["Slide one: the budget gap", T_EDIT] });
  const pg = (i) => ({ kind: "pdf-page", page: i });
  const ids = {
    pA: pA.cite(pg(1)), pA2: pA2.cite(pg(1)), pB: pB.cite(pg(1)), pC: pC.cite(pg(1)), pN: pN.cite(pg(1)),
    pP: pP.cite(pg(1)), pR: pR.cite(pg(1)), pH0: pH.cite(pg(0)), pH1: pH.cite(pg(1)),
    wW: pW.cite({ kind: "document" }), wC: pC.cite({ kind: "document" }), wR: pR.cite({ kind: "document" }),
    d0: dX.cite({ kind: "doc-para", para: 0 }), d2: dX.cite({ kind: "doc-para", para: 2 }),
    d1: dX.cite({ kind: "doc-para", para: 1 }), d3: dX.cite({ kind: "doc-para", para: 3 }),
    dT: dX.cite({ kind: "doc-table", table: 0 }), dI: dX.cite({ kind: "image", part: IMG }),
    s0: sX.cite({ kind: "slide-shape", slide: 1 }), s1: sX.cite({ kind: "slide-shape", slide: 2 }),
  };
  const before = w.snapshot();
  const all = Object.fromEntries(Object.entries(ids).map(([k, id]) => [k, notice(id)]));
  const again = Object.fromEntries(Object.entries(ids).map(([k, id]) => [k, notice(id)]));
  assert.deepEqual(w.snapshot(), before, "no notice read writes anything");
  for (const [k, n] of Object.entries(all)) {
    assert.equal(n.ok, true, `${k}: ${JSON.stringify(n).slice(0, 300)}`);
    assert.equal(n.newer, true, `${k} saw its newer version (a grade over no newer capture measures nothing)`);
    assert.equal(n.candidates.length, 1, k);
  }
  return { all, again };
}

test("R31 (versiongrade): A and B are unaffected only on positive evidence, over pdf-page, doc-para, slide-shape and the whole document; units spelled without rect/run match their canonical extent", () => {
  const { all } = gradeGround();
  assert.deepEqual(G(all.pA), ["newer_capture_matched", "A", "unaffected", "identical_at_extent", "unaffected"]);
  assert.deepEqual(all.pA.candidates[0].found_at.extent, { kind: "pdf-page", page: 1, rect: null }, "A names where: the same extent");
  assert.deepEqual(G(all.pA2).slice(1, 4), ["A", "unaffected", "identical_at_extent"], "a unit extent carrying rect: null is the same address");
  assert.deepEqual([...G(all.pB), all.pB.candidates[0].found_at.extent.page, all.pB.candidates[0].found_at.ref],
    ["newer_capture_matched", "B", "unaffected", "identical_elsewhere", "unaffected", 2, "page 2"]);
  assert.deepEqual(G(all.pH0).slice(1, 3), ["A", "unaffected"], "page 0 held on both sides");
  assert.deepEqual(G(all.d0).slice(1, 4), ["A", "unaffected", "identical_at_extent"], "docx ¶0");
  assert.deepEqual([...G(all.d2).slice(1, 4), all.d2.candidates[0].found_at.extent.para], ["B", "unaffected", "identical_elsewhere", 1],
    "docx: ¶2's text is now ¶1");
  assert.deepEqual(G(all.s0).slice(1, 4), ["A", "unaffected", "identical_at_extent"], "pptx slide 1");
  assert.deepEqual(G(all.wW).slice(1, 4), ["A", "unaffected", "identical_at_extent"],
    "whole document: every unit identical, though the captures' bytes differ");
  for (const k of ["pA", "pB", "d0", "d2", "s0", "wW"]) assert.equal(all[k].candidates[0].similarity, null, `${k}: no similarity on A/B`);
});

test("R31 (versiongrade): C and NOT_FOUND are affected where the extent test still matches (the grade is never read off the extent); C is never collapsed into B", () => {
  const { all } = gradeGround();
  const c = all.pC.candidates[0];
  assert.deepEqual([...G(all.pC), c.matched, c.reason], ["newer_capture_matched", "C", "affected", "similar_text", "affected", true, "extent_in_newer_capture"]);
  assert.ok(c.similarity < 1 && c.similarity >= 0.7, `similarity ${c.similarity} is under 1 and at or over the floor`);
  assert.equal(c.found_at.extent.page, 1, "an edited passage that stayed put is named where it stayed");
  const nf = all.pN.candidates[0];
  assert.deepEqual([...G(all.pN), nf.matched, nf.found_at], ["newer_capture_matched", "NOT_FOUND", "affected", "text_not_found", "affected", true, null]);
  assert.ok(nf.similarity < 0.7);
  assert.deepEqual([...G(all.d1).slice(1, 4), all.d1.candidates[0].found_at.extent.para], ["C", "affected", "similar_text", 2],
    "docx: ¶1's edited text is at ¶2");
  assert.deepEqual(G(all.d3).slice(1, 5), ["NOT_FOUND", "affected", "text_not_found", "affected"], "docx: ¶3 was removed");
  assert.deepEqual([...G(all.s1).slice(1, 4), all.s1.candidates[0].matched], ["C", "affected", "similar_text", true], "pptx: slide 2 edited");
  assert.deepEqual([...G(all.wC).slice(1, 4), all.wC.candidates[0].matched, all.wC.candidates[0].reason],
    ["C", "affected", "similar_text", true, "whole_document"], "whole document: its text changed a little");
  assert.ok(all.wC.candidates[0].similarity >= 0.7 && all.wC.candidates[0].similarity < 1);
});

test("R31 (versiongrade): UNDETERMINED is stated with its reason and a sentence, never A and never NOT_FOUND: a partial or absent newer index, an extent no unit carries (doc-table, a page with no unit), bytes", () => {
  const { all } = gradeGround();
  assert.deepEqual(G(all.pP).slice(1), ["UNDETERMINED", "undetermined", "newer_text_partial", "undetermined"],
    "the passage is not in the part of the newer text held: never NOT_FOUND");
  assert.deepEqual(G(all.pR).slice(1), ["UNDETERMINED", "undetermined", "newer_text_not_held", "undetermined"],
    "the newer capture holds no text");
  assert.deepEqual(G(all.wR).slice(1, 5), ["UNDETERMINED", "undetermined", "newer_text_not_held", "undetermined"],
    "whole document, newer text not held");
  assert.deepEqual([...G(all.dT).slice(1, 4), all.dT.candidates[0].matched], ["UNDETERMINED", "undetermined", "cited_text_not_held", true],
    "no unit carries a table's text, though the table exists in the newer capture");
  assert.deepEqual(G(all.dI).slice(1, 4), ["UNDETERMINED", "undetermined", "cited_as_bytes"]);
  /* the negative control for "A where the cited text was never held": the passage's text IS at page 1 of the newer
     capture, but nothing was held at page 1 of the cited one */
  assert.deepEqual(G(all.pH1).slice(1, 4), ["UNDETERMINED", "undetermined", "cited_text_not_held"]);
  for (const k of ["pP", "pR", "wR", "dT", "dI", "pH1"]) {
    const why = all[k].candidates[0].grade_why;
    assert.ok(typeof why === "string" && why.length > 40, `${k}: every UNDETERMINED says why, in a sentence`);
    assert.equal(all[k].candidates[0].found_at, null, `${k}: nothing is named as found`);
  }
});

test("R31 (versiongrade): the notice publishes the five grades, keeps every extent-test field beside the grade, and a second read is byte-identical and writes nothing", () => {
  const { all, again } = gradeGround();
  assert.deepEqual(Object.fromEntries(Object.entries(all.pC.grades).map(([k, v]) => [k, v.affects])),
    { A: "unaffected", B: "unaffected", C: "affected", NOT_FOUND: "affected", UNDETERMINED: "undetermined" });
  assert.deepEqual(all.pC.grades, VERSION_NOTICE_GRADES);
  for (const k of ["state", "newer", "chain_read", "chains", "candidates", "says"]) assert.ok(k in all.pC, k);
  for (const k of ["matched", "reason", "why", "candidate_only", "identity", "says", "grade", "affects", "grade_reason",
                   "grade_why", "found_at", "similarity"]) assert.ok(k in all.pC.candidates[0], k);
  for (const k of Object.keys(all)) assert.equal(JSON.stringify(again[k]), JSON.stringify(all[k]), `${k}: the same on a second read`);
});

/* ------------------------------------------------------------------ versionnotice's ground */
/* Captures at addresses, each a shape of version history. No capture holds text units (the grade is versiongrade's). */
function historyGround() {
  const w = world();
  const C = {};
  for (const k of ["M1", "M2", "M3", "U1", "U2", "N1", "N2", "S1", "X1", "W1", "W2", "G1", "G2", "P1", "P2"])
    C[k] = w.cap(k.toLowerCase(), `d394 capture ${k}`);
  assert.equal(new Set(Object.values(C).map((c) => c.sha)).size, 15, "fifteen distinct capture shas");
  const D = { M1: "INFO-2026-3941-a", M2: "INFO-2026-3942-a", M3: "INFO-2026-3943-a", U1: "INFO-2026-3944-a",
              U2: "INFO-2026-3945-a", N1: "INFO-2026-3946-a", N2: "INFO-2026-3947-a", S1: "INFO-2026-3948-a",
              X1: "INFO-2026-3949-a", G1: "INFO-2026-3950-a", P1: "INFO-2026-3951-a", P2: "INFO-2026-3952-a",
              W: "INFO-2026-3953-a" };
  for (const k of ["M1", "M2", "M3", "U1", "U2", "N1", "N2", "S1", "X1", "G1", "P1", "P2"]) w.doc(D[k], [C[k]]);
  w.doc(D.W, [C.W1, C.W2]);                       /* one bundle re-captured: both captures on the SAME bundle */
  /* G2: the newer contract filed inside a project carol owns and dave was never invited to */
  const proj = w.promotion.promote({ base: null, snapKey: "k-proj-g2", author: V("carol"),
    files: [{ path: "bundle.md", text: ["---", "object_type: project", "current_state: forming", 'created: "2026-09-27T00:00:00Z"',
      'last_updated: "2026-09-27T00:00:00Z"', 'title: "Contract team"', 'objective: "Hold the newer contract."', "---", "",
      "## Summary", "", "A project the uninvited must not learn about.", ""].join("\n") }, { path: C.G2.path, text: C.G2.text }],
    meta: { object_type: "project" },
    register: [{ sha256: C.G2.sha, path: C.G2.path, encoding: "utf8", bytes: Buffer.byteLength(C.G2.text) }] });
  assert.equal(proj.ok, true, JSON.stringify(proj).slice(0, 300));
  assert.equal(w.membership.projectCreated({ projectId: proj.bundleId, ownerId: "carol" }).ok, true);
  const pages = (n) => ({ chain: LAYER, pageCount: n });
  for (const [k, n] of [["M1", 3], ["M2", 3], ["M3", 4], ["U1", 5], ["U2", 2], ["N1", 3], ["S1", 2], ["X1", 2], ["W1", 1],
                        ["G1", 2], ["G2", 2], ["P1", 3]]) w.read(C[k].sha, pages(n));
  /* N2 is never read. P2 is read by an UNSCOPED chain: its text is held and no page set is. */
  w.read(C.P2.sha, { chain: [{ step: "layer" }] });
  const ADDR = { M: "ex.org/d394/minutes", U: "ex.org/d394/budget", N: "ex.org/d394/staff-report", S: "ex.org/d394/charter",
                 W: "ex.org/d394/agenda", G: "ex.org/d394/contract", P: "ex.org/d394/resolution" };
  const AT = { M1: "2026-01-01", M2: "2026-02-01", M3: "2026-03-01", U1: "2026-01-02", U2: "2026-03-02", N1: "2026-01-03",
               N2: "2026-03-03", S1: "2026-01-04", W1: "2026-01-05", W2: "2026-03-05", G1: "2026-01-06", G2: "2026-03-06",
               P1: "2026-01-07", P2: "2026-03-07" };
  for (const [k, at] of Object.entries(AT))              /* X1 has NO locator: the record holds no address it came from */
    w.prov.recordReceipt({ address: `https://${ADDR[k[0]]}`, addressNorm: ADDR[k[0]], captureSha: C[k].sha, retrieved: `${at}T09:00:00Z` });
  const cite = (bundleId, cap, extent) => {
    const m = w.content.mint({ bundleId, captureSha: cap.sha, extent, mintedBy: V("ruth") });
    assert.equal(m.ok, true, JSON.stringify(m).slice(0, 300));
    return m.content_id;
  };
  const pg = (i) => ({ kind: "pdf-page", page: i });
  const ids = {
    M: cite(D.M1, C.M1, pg(1)),              // matched, two versions after it
    U: cite(D.U1, C.U1, pg(3)),              // newer, extent OUTSIDE the newer capture
    N: cite(D.N1, C.N1, pg(1)),              // newer, the newer capture never READ
    S: cite(D.S1, C.S1, pg(0)),              // a chain of one: silence, earned
    X: cite(D.X1, C.X1, pg(0)),              // no address: the chain CANNOT be read
    W: cite(D.W, C.W1, { kind: "document" }),// the whole document, re-captured into its own bundle
    G: cite(D.G1, C.G1, pg(1)),              // the newer version is inside a project
    P: cite(D.P1, C.P1, pg(1)),              // newer, read, and its page set NOT HELD
    H: cite(proj.bundleId, C.G2, { kind: "document" }),   // a passage inside the project itself
  };
  return { w, C, D, ids, proj };
}

test("R29 (versionnotice): a newer capture at the address is stated with certainty, naming the newest; a re-capture into the same bundle is a newer version too", () => {
  const { w, C, D, ids } = historyGround();
  const before = w.snapshot();
  const n = (id) => w.content.passageNotice({ contentId: id, viewer: V("ruth") });
  const M = n(ids.M), U = n(ids.U), N = n(ids.N), W = n(ids.W);
  assert.deepEqual([M.ok, M.newer, M.chain_read, M.chains.length, M.chains[0].newer_count, M.chains[0].versions, M.chains[0].position],
    [true, true, true, 1, 2, 3, 0]);
  assert.deepEqual([M.chains[0].newest.capture_sha, M.chains[0].newest.bundle_id, M.candidates.length, M.candidates[0].capture_sha],
    [C.M3.sha, D.M3, 1, C.M3.sha], "the NEWEST capture, never the middle one or the cited one");
  assert.deepEqual([U.newer, U.chains[0].newest.capture_sha, N.newer, N.chains[0].newest.capture_sha], [true, C.U2.sha, true, C.N2.sha],
    "certainty holds where the passage is not matched");
  assert.deepEqual([W.newer, W.chains[0].newest.capture_sha, W.chains[0].newest.bundle_id], [true, C.W2.sha, D.W],
    "the chain is by address, not by bundle");
  assert.deepEqual([M.wrote, M.proposal_only], [false, true]);
  assert.deepEqual(Object.keys(M.states).sort(), ["chain_unread", "newer_capture_matched", "newer_capture_undetermined", "no_newer_capture"]);
  assert.deepEqual(M.states, VERSION_NOTICE_STATES);
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R29 (versionnotice): 'no newer capture' only where the chain was read (a chain of one, silence earned); no recorded address is chain_unread, never none", () => {
  const { w, ids } = historyGround();
  const before = w.snapshot();
  const S = w.content.passageNotice({ contentId: ids.S, viewer: V("ruth") });
  assert.deepEqual([S.state, S.newer, S.chain_read, S.says, S.candidates, S.affects, S.addresses_asked],
    ["no_newer_capture", false, true, null, [], null, 1]);
  assert.match(S.why, /read and holds nothing after it/);
  const X = w.content.passageNotice({ contentId: ids.X, viewer: V("ruth") });
  assert.deepEqual([X.state, X.newer, X.chain_read, X.addresses_asked, X.addresses_truncated, X.affects, X.candidates],
    ["chain_unread", null, false, 0, false, "undetermined", []]);
  assert.match(X.says, /UNDETERMINED/);
  assert.match(X.says, /not a statement that there is none/);
  assert.match(X.why, /no address/);
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R30 (versionnotice): a matched extent is a labelled CANDIDATE, never the same passage; outside, unread and unheld bounds are UNDETERMINED with reasons that say which; nothing is minted", () => {
  const { w, ids } = historyGround();
  const before = w.snapshot();
  const n = (id) => w.content.passageNotice({ contentId: id, viewer: V("ruth") });
  const M = n(ids.M), U = n(ids.U), N = n(ids.N), P = n(ids.P), W = n(ids.W);
  const m = M.candidates[0];
  assert.deepEqual([M.state, m.matched, m.extent, m.reason], ["newer_capture_matched", true, { kind: "pdf-page", page: 1, rect: null }, "extent_in_newer_capture"]);
  assert.deepEqual([m.candidate_only, m.identity, /CANDIDATE/.test(m.says), /never evidence of identity/.test(m.says)],
    [true, "not_established", true, true]);
  const json = JSON.stringify(M);
  assert.equal((json.match(/same passage/gi) || []).length, (json.match(/(not|never)[^"]{0,40}same passage/gi) || []).length,
    "'same passage' appears only to deny it");
  assert.ok((json.match(/same passage/gi) || []).length > 0, "(the denial is there to be counted)");
  const u = U.candidates[0];
  assert.deepEqual([U.state, u.matched, u.reason, u.extent, /may have moved/.test(u.why)],
    ["newer_capture_undetermined", false, "outside_newer_capture", null, true]);
  assert.deepEqual([/newer version of this document exists/.test(U.says), /UNDETERMINED/.test(U.says), /UNDETERMINED/.test(u.says)], [true, true, true]);
  const nn = N.candidates[0];
  assert.deepEqual([N.state, nn.matched, nn.reason, /not about the document/.test(nn.why), /may have moved/.test(nn.why)],
    ["newer_capture_undetermined", false, "newer_capture_unread", true, false], "the reason is about the record, not the document");
  const p = P.candidates[0];
  assert.deepEqual([P.state, P.newer, p.matched, p.reason, /no page set/.test(p.why)],
    ["newer_capture_undetermined", true, false, "bound_not_held", true], "an unheld bound is never read as a fit");
  const ww = W.candidates[0];
  assert.deepEqual([W.state, ww.reason, ww.candidate_only, ww.matched], ["newer_capture_matched", "whole_document", true, true]);
  assert.deepEqual([m.existing_content_id, ww.existing_content_id], [null, null], "existing_content_id is a find, never a mint");
  assert.deepEqual(w.snapshot(), before, "nothing minted, nothing written");
});

test("R31 (versionnotice): with no text held, a MATCHED extent is graded UNDETERMINED, never unaffected; no newer capture rolls up to null", () => {
  const { w, ids } = historyGround();
  const n = (id) => w.content.passageNotice({ contentId: id, viewer: V("ruth") });
  const M = n(ids.M), W = n(ids.W), S = n(ids.S);
  assert.deepEqual([M.candidates[0].matched, M.affects, M.candidates[0].grade, M.candidates[0].grade_reason],
    [true, "undetermined", "UNDETERMINED", "cited_text_not_held"]);
  assert.deepEqual([W.candidates[0].grade, W.candidates[0].grade_reason, W.affects], ["UNDETERMINED", "cited_text_partial", "undetermined"]);
  assert.equal(S.affects, null);
});

test("R29, R37 (versionnotice): the chains are the ones this viewer sees: a newer version filed in a project is told to its owner and to nobody else, and the answer says whose chain it read", () => {
  const { w, C, ids, proj } = historyGround();
  const before = w.snapshot();
  const carol = w.content.passageNotice({ contentId: ids.G, viewer: V("carol") });
  assert.deepEqual([carol.ok, carol.newer, carol.state, carol.chains[0].versions, carol.chains[0].newest.capture_sha,
                    carol.chains[0].newest.bundle_id], [true, true, "newer_capture_matched", 2, C.G2.sha, proj.bundleId]);
  const dave = w.content.passageNotice({ contentId: ids.G, viewer: V("dave") });
  assert.deepEqual([dave.ok, dave.state, dave.newer, dave.chain_read, dave.chains[0].versions, dave.candidates],
    [true, "no_newer_capture", false, true, 1, []]);
  const said = JSON.stringify(dave);
  assert.deepEqual([said.includes(C.G2.sha), said.includes(proj.bundleId), /PROJ-/.test(said)], [false, false, false],
    "nothing in dave's answer names the hidden capture or the project holding it");
  assert.match(dave.visible_to, /visible to you/);
  assert.match(dave.visible_to, /not in them/);
  assert.deepEqual(w.snapshot(), before, "nothing written");
});

test("R29, R38 (versionnotice): C-80.3 VERSION_NOTICE_NO_CONTENT for an absent passage and, answered identically, one the viewer may not see; the refusal writes nothing", () => {
  const { w, ids } = historyGround();
  const before = w.snapshot();
  assert.deepEqual(Object.keys(VERSION_NOTICE_CHECKS), ["VERSION_NOTICE_NO_CONTENT"], "content's share of C-80 is one row");
  const row = VERSION_NOTICE_CHECKS.VERSION_NOTICE_NO_CONTENT;
  assert.equal(row.check, "C-80.3");
  assert.ok(row.translation.length > 60, "a translation a member can read");
  const refuse = (contentId, viewer = V("dave")) => w.content.passageNotice({ contentId, viewer });
  const absent = refuse("0".repeat(64));
  assert.deepEqual([absent.ok, absent.code, absent.reason, absent.check, absent.translation],
    [false, "VERSION_NOTICE_NO_CONTENT", "VERSION_NOTICE_NO_CONTENT", "C-80.3", row.translation]);
  const hidden = refuse(ids.H);
  const strip = (r) => JSON.parse(JSON.stringify(r).split(ids.H).join("<id>").split("0".repeat(64)).join("<id>"));
  assert.deepEqual(strip(hidden), strip(absent), "a passage in a project dave was not invited to answers exactly as an absent one");
  for (const id of [null, undefined, "", "   "]) assert.equal(refuse(id).code, "VERSION_NOTICE_NO_CONTENT", JSON.stringify(id));
  assert.equal(refuse(ids.M, "nobody").code, "VERSION_NOTICE_NO_CONTENT", "an unrecognised viewer sees nothing");
  /* the negative control: the same rows read by those who may see them */
  assert.equal(refuse(ids.H, V("carol")).ok, true, "the project's owner reads the passage in it");
  assert.equal(refuse(ids.M).ok, true, "dave reads a passage of a document he may see");
  assert.deepEqual(w.snapshot(), before, "a refusal writes nothing either");
});
