/* run-productions: the EXTRACT role's productions (R10–R13, R15, R18). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { EXTRACT_PROPOSE_CHECKS, runProductionsOps, EXTRACT_PROPOSALS_SAYS } from "../../../src/run-productions/index.mjs";
import { world, Q, DOC, DOC2, HIDDEN_PROJ, RUN, ALICE, ALICE_TOKEN, BOB, MACHINE, sha } from "./fixture.mjs";

/* A scoped OCR chain with a measured cap of C (the old battery's own), so a step claiming stronger is refused. */
const CHAIN = [
  { step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", confidence: { basis: "none" },
    extent: { kind: "pages", pages: [0, 1, 2] } },
];
const AK = "class:ai/k1";
const REF = (n, over = {}) => ({ ref: `ordinance:${n}`, refKind: "ordinance", refKey: String(n), ...over });
const AT = (page, ref = `page ${page + 1}`) => ({ kind: "pdf-page", page, ref });

function refusedAs(r, code) {
  assert.equal(r.ok, false, JSON.stringify(r).slice(0, 300));
  assert.equal(r.code, code, `${r.code}: ${r.detail}`);
  const row = EXTRACT_PROPOSE_CHECKS[code];
  if (row) { assert.equal(r.check, row.check); assert.equal(r.translation, row.translation); }
}

function base({ mints = 5 } = {}) {
  const w = world();
  w.inquiry(Q);
  const cap = w.doc(DOC);
  w.ex.readings[cap] = { chain: CHAIN, pageCount: 3 };
  w.run(RUN, { mode: "extract", principal_plane: AK, mints });
  const propose = (over = {}) => w.p.extractPropose({ run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
    refs: [REF(1)], proposedBy: AK, viewer: ALICE, caller: AK, ...over });
  return { w, cap, propose };
}

test("R10, R13: refusals in order, nothing written on any, each with its catalogue check and translation but NO_TARGET and NO_SUCH_BUNDLE", () => {
  const { w, propose } = base();
  w.project(HIDDEN_PROJ, ["carol"]);
  w.run("RUN-ENDED", { mode: "extract", principal_plane: AK, status: "completed", mints: 5 });
  w.run("RUN-CHECK", { mode: "check", principal_plane: AK, mints: 5 });
  w.run("RUN-NOBOUND", { mode: "extract", principal_plane: AK });
  w.run("RUN-ZERO", { mode: "extract", principal_plane: AK, mints: 0 });
  w.run("RUN-FULL", { mode: "extract", principal_plane: AK, mints: 2 });
  w.bounds.set("RUN-FULL|mints", { allowed: 2, consumed: 2 });
  w.run("RUN-HID", { mode: "extract", principal_plane: AK, context_type: "project", context_id: HIDDEN_PROJ, mints: 5 });
  w.run("RUN-OTHER", { mode: "extract", principal_plane: ALICE_TOKEN, mints: 5 });
  w.run("RUN-ONE", { mode: "extract", principal_plane: AK, mints: 1 });
  const nobytes = w.doc(DOC2, "unheld", { read: false });
  w.st.sql.exec(`DELETE FROM register WHERE capture_sha=?`, nobytes);
  const before = w.snapshot();
  const steps = [
    [{ proposedBy: "" }, "NO_PROPOSER"],
    [{ run: " " }, "NO_RUN"],
    [{ run: "RUN-NEVER" }, "NO_SUCH_RUN"],
    [{ run: "RUN-HID", viewer: BOB }, "NO_SUCH_RUN"],
    [{ run: "RUN-OTHER" }, "AI_RUN_NOT_PRINCIPAL"],
    [{ run: "RUN-ENDED" }, "RUN_NOT_RUNNING"],
    [{ run: "RUN-CHECK" }, "NOT_AN_EXTRACT_RUN"],
    [{ run: "RUN-NOBOUND" }, "NO_MINTS_BOUND"],
    [{ run: "RUN-ZERO" }, "NO_MINTS_BOUND"],
    [{ run: "RUN-FULL" }, "MINTS_BOUND_REACHED"],
    [{ refs: [] }, "NO_PROPOSALS"],
    [{ bundleId: "" }, "NO_TARGET"],
    [{ bundleId: "INFO-2026-0099-none" }, "NO_SUCH_BUNDLE"],
    [{ bundleId: HIDDEN_PROJ, viewer: BOB }, "NO_SUCH_BUNDLE"],
    [{ bundleId: Q }, "NOT_A_DOCUMENT"],
    [{ bundleId: DOC2 }, "NO_BYTES_HELD"],
    [{ cap: "A" }, "TEXT_CHAIN_STRENGTHENS"],
    [{ fn: "invent" }, "UNKNOWN_FUNCTION"],
    [{ refs: [REF(1), { ref: "x", grade: "A" }] }, "GRADE_OFFERED"],
    [{ run: "RUN-ONE", refs: [REF(1, { source: AT(0) }), REF(2, { source: AT(1) })] }, "MINTS_BOUND_WOULD_EXCEED"],
  ];
  for (const [over, code] of steps) {
    const r = propose(over);
    assert.equal(r.ok, false, code);
    assert.equal(r.code ?? r.reason, code, `${code}: ${JSON.stringify(r).slice(0, 200)}`);
    if (EXTRACT_PROPOSE_CHECKS[code]) refusedAs(r, code);
    if (code === "NO_TARGET" || code === "NO_SUCH_BUNDLE") assert.deepEqual([r.check, r.translation], [undefined, undefined]);
  }
  assert.deepEqual(w.snapshot(), before, "nothing written on any");
  assert.equal(w.calls.filter((c) => c.name === "consumeBound").length, 0, "nothing spent on any");
  /* An absent and an invisible bundle answer alike but for the id; an absent and an invisible run likewise. */
  const strip = (r, id) => JSON.parse(JSON.stringify(r).replaceAll(id, "X"));
  assert.deepEqual(strip(propose({ bundleId: HIDDEN_PROJ, viewer: BOB }), HIDDEN_PROJ), strip(propose({ bundleId: "INFO-2026-0099-none" }), "INFO-2026-0099-none"));
  assert.deepEqual(strip(propose({ run: "RUN-HID", viewer: BOB }), "RUN-HID"), strip(propose({ run: "RUN-NEVER" }), "RUN-NEVER"));
  /* The relayed refusals carry their own rows: ai-runs' C-22.12, the chain's C-35.6, the reference's with its ordinal. */
  assert.equal(propose({ run: "RUN-OTHER" }).check, "C-22.12");
  assert.equal(propose({ cap: "A" }).check, "C-35.6");
  assert.equal(propose({ refs: [REF(1), { ref: "x", grade: "A" }] }).at_index, 1);
  const whole = propose({ run: "RUN-ONE", refs: [REF(1, { source: AT(0) }), REF(2, { source: AT(1) })] });
  assert.deepEqual([whole.allowed, whole.consumed, whole.would_mint], [1, 0, 2]);
});

test("R11: success writes one proposed reading per reference in one transaction, with the run, the proposer stamp, the chain with ai(fn, version) and its cap, and earned B or C computed", () => {
  const { w, cap, propose } = base();
  const r = propose({ refs: [REF(7), { ref: "a name", label: "The Clerk" }], cap: null });
  assert.equal(r.ok, true);
  assert.equal(r.capture_sha, cap);
  const rows = w.rows(`SELECT * FROM proposed_readings ORDER BY ref`);
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((x) => [x.ref, x.earned, x.run, x.proposed_by, x.fn, x.fn_version, x.content_id]),
    [["a name", "C", RUN, AK, "propose-reading", "0.1.0", null], ["ordinance:7", "B", RUN, AK, "propose-reading", "0.1.0", null]]);
  const chain = JSON.parse(rows[0].chain);
  assert.deepEqual(chain.at(-1), { step: "ai", engine: "propose-reading", version: "0.1.0", cap: null });
  assert.equal(r.cap, "C", "the chain's cap: the ai step claims none, stated, and the capture's stands");
  assert.deepEqual(r.proposed.map((x) => x.earned), ["B", "C"]);
  assert.equal(r.minted, 0);
  assert.equal(r.says, EXTRACT_PROPOSALS_SAYS);
  assert.deepEqual(r.mint.machine_work, true);
  /* A reference already proposed under the run for that capture is left as it was. */
  w.clock.now = "2026-09-28T09:00:00Z";
  assert.equal(propose({ refs: [REF(7, { refKey: "7", label: "changed" })], at: "2026-09-28T09:00:00Z" }).ok, true);
  const kept = w.row(`SELECT label, at FROM proposed_readings WHERE ref='ordinance:7'`);
  assert.deepEqual([kept.label, kept.at], [null, rows[1].at]);
});

test("R11: a reference with a position is minted as a content row by content, labelled machine work; mints is consumed through ai-runs by the rows newly minted and by nothing else; a refused mint is recorded, never dropped, and spends nothing", () => {
  const { w, cap, propose } = base({ mints: 3 });
  const r = propose({ refs: [REF(1, { source: AT(0) }), REF(2, { source: AT(9) }), REF(3)] });
  assert.equal(r.ok, true);
  assert.equal(r.minted, 1);
  const [placed, refused, unplaced] = r.proposed;
  assert.match(placed.content_id, /^[0-9a-f]{64}$/);
  const row = w.row(`SELECT * FROM content WHERE content_id=?`, placed.content_id);
  assert.deepEqual([row.capture_sha, row.bundle_id, row.minted_by, row.extent_kind], [cap, DOC, AK, "pdf-page"]);
  assert.deepEqual(refused.mint_refused, { code: "CONTENT_EXTENT_OUT_OF_RANGE", check: "C-45.1", detail: refused.mint_refused.detail });
  assert.ok(refused.mint_refused.detail);
  assert.equal(refused.content_id, null);
  assert.equal(unplaced.content_id, null);
  assert.equal(w.row(`SELECT content_id FROM proposed_readings WHERE ref='ordinance:2'`).content_id, null, "the refused mint's proposal is kept");
  assert.deepEqual(w.calls.filter((c) => c.name === "consumeBound").map((c) => c.a), [{ run: RUN, bound: "mints", n: 1 }]);
  assert.deepEqual(r.bound, { bound: "mints", allowed: 3, consumed: 1 });
  /* The same passage again under another reference: found, not minted, so nothing is spent. */
  const again = propose({ refs: [REF(4, { source: AT(0) })] });
  assert.equal(again.minted, 0);
  assert.equal(again.proposed[0].content_id, placed.content_id);
  assert.deepEqual(again.bound, { bound: "mints", allowed: 3, consumed: 1 });
});

test("R12: neither run nor bundle is EXTRACT_NO_SCOPE; the list is newest first, limit clamped to [1, 500], 100 by default, with truncated, each labelled a machine's proposal", () => {
  const { w, propose } = base({ mints: 50 });
  const none = w.p.extractProposals({ viewer: ALICE });
  refusedAs(none, "EXTRACT_NO_SCOPE");
  for (let i = 0; i < 3; i++) {
    w.clock.now = `2026-09-28T0${i + 1}:00:00Z`;
    propose({ refs: [REF(i)], at: w.clock.now });
  }
  const all = w.p.extractProposals({ run: RUN, viewer: ALICE });
  assert.deepEqual(all.proposals.map((x) => x.ref), ["ordinance:2", "ordinance:1", "ordinance:0"]);
  assert.deepEqual([all.limit, all.truncated, all.count], [100, false, 3]);
  assert.ok(all.proposals.every((x) => x.mint.machine_work === true && /machine proposed/.test(x.says)));
  assert.deepEqual(all.proposals[0].basis.version, "0.1.0");
  const one = w.p.extractProposals({ bundleId: DOC, viewer: ALICE, limit: 1 });
  assert.deepEqual([one.limit, one.truncated, one.count], [1, true, 1]);
  assert.equal(w.p.extractProposals({ run: RUN, viewer: ALICE, limit: 0 }).limit, 100);
  assert.equal(w.p.extractProposals({ run: RUN, viewer: ALICE, limit: -4 }).limit, 1);
  assert.equal(w.p.extractProposals({ run: RUN, viewer: ALICE, limit: 9999 }).limit, 500);
});

test("R12: the minted-to-cited ratio is over the machine-minted content rows of the scope's documents the viewer may see (at most 64), a row cited when a member's leg or version leg names it; a document the viewer may not see moves neither the list nor the ratio", () => {
  const { w, propose } = base({ mints: 10 });
  const r = propose({ refs: [REF(1, { source: AT(0) }), REF(2, { source: AT(1) }), REF(3, { source: AT(2) })] });
  const [c0, c1] = r.proposed.map((x) => x.content_id);
  w.st.sql.exec(`INSERT INTO inquiry_basis (bundle_id, ord, role, target_id, content_id) VALUES (?, 0, 'supports', ?, ?)`, Q, DOC, c0);
  w.st.sql.exec(`INSERT INTO inquiry_basis_version_legs (bundle_id, name, ord, target_id, content_id) VALUES (?, 'v', 0, ?, ?)`, Q, DOC, c1);
  const seen = w.p.extractProposals({ run: RUN, viewer: ALICE });
  assert.deepEqual([seen.instrument.minted, seen.instrument.cited, seen.instrument.uncited], [3, 2, 1]);
  assert.deepEqual(seen.scope, { run: RUN, bundle_id: null, documents: 1, documents_capped: false });
  /* A proposal and a machine-minted row in a project bob cannot see: bob's list and ratio do not move. */
  w.project(HIDDEN_PROJ, ["carol"]);
  const bobBefore = w.p.extractProposals({ run: RUN, viewer: BOB });
  w.st.sql.exec(`INSERT INTO proposed_readings (run, capture_sha, bundle_id, ref, fn, fn_version, chain, earned, proposed_by, at)
                 VALUES (?, ?, ?, 'hidden:1', 'propose-reading', '0.1.0', '[]', 'B', ?, '2026-09-29T00:00:00Z')`, RUN, sha("h"), HIDDEN_PROJ, AK);
  w.st.sql.exec(`INSERT INTO content (content_id, capture_sha, bundle_id, extent_kind, extent, ref, minted_by, at)
                 VALUES (?, ?, ?, 'document', '{"kind":"document"}', 'whole', ?, 't')`, sha("hc"), sha("h"), HIDDEN_PROJ, AK);
  const bobAfter = w.p.extractProposals({ run: RUN, viewer: BOB });
  assert.deepEqual(bobAfter, bobBefore);
  const carol = w.p.extractProposals({ run: RUN, viewer: "member:carol" });
  assert.equal(carol.count, 4); assert.equal(carol.instrument.minted, 4);
  /* At most 64 documents, and the answer says when the cap cut. */
  for (let i = 0; i < 65; i++) {
    const id = `INFO-2026-${String(1000 + i)}-m`;
    w.st.sql.exec(`INSERT INTO bundles (bundle_id, object_type, group_id, title, current_state, created, last_updated, bundle_sha)
                   VALUES (?, 'information', 'g', ?, 'collected', 't', 't', 'sha')`, id, id);
    w.st.sql.exec(`INSERT INTO proposed_readings (run, capture_sha, bundle_id, ref, fn, fn_version, chain, earned, proposed_by, at)
                   VALUES ('RUN-MANY', ?, ?, 'r', 'propose-reading', '0.1.0', '[]', 'B', ?, 't')`, sha(id), id, AK);
  }
  const many = w.p.extractProposals({ run: "RUN-MANY", viewer: ALICE });
  assert.deepEqual([many.scope.documents, many.scope.documents_capped], [64, true]);
});

test("R12, R8: through the op the scope and limit are the query's and the viewer is the control plane's stamp; the proposer and caller of a production are stamps too", () => {
  const { w } = base();
  const url = new URL(`https://plane/?op=extractpropose&proposedBy=${encodeURIComponent(AK)}&viewer=${encodeURIComponent(ALICE)}&principal=${encodeURIComponent(AK)}`);
  const r = runProductionsOps(w.p, url, { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0", refs: [REF(5)],
                                          proposedBy: "member:bob", viewer: "admin", caller: BOB }).extractpropose();
  assert.equal(r.ok, true);
  assert.equal(w.row(`SELECT proposed_by FROM proposed_readings`).proposed_by, AK);
  const list = runProductionsOps(w.p, new URL(`https://plane/?op=extractproposals&bundle=${DOC}&limit=1&viewer=${encodeURIComponent(ALICE)}`), null).extractproposals();
  assert.deepEqual([list.count, list.limit, list.scope.bundle_id], [1, 1, DOC]);
});

test("R15, R18: every production names a running run whose principal is the caller; the run is read only through ai-runs.runFor and the bound only through boundOf and consumeBound — this module holds no run or bound table", () => {
  const { w, propose } = base();
  const tables = w.rows(`SELECT name FROM sqlite_master WHERE type='table'`).map((t) => t.name);
  assert.ok(!tables.includes("ai_runs") && !tables.includes("ai_run_bounds"), "no run or bound table exists for this module to write");
  assert.equal(propose({ refs: [REF(1, { source: AT(0) })] }).ok, true);
  assert.deepEqual([...new Set(w.calls.map((c) => c.name))].filter((n) => ["runFor", "boundOf", "consumeBound"].includes(n)).sort(),
                   ["boundOf", "consumeBound", "runFor"]);
  assert.equal(propose({ caller: MACHINE }).code, "AI_RUN_NOT_PRINCIPAL");
  const notYours = propose({ caller: ALICE, proposedBy: ALICE });
  assert.equal(notYours.code, "AI_RUN_NOT_PRINCIPAL");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM proposed_readings WHERE proposed_by <> ?`, AK).n, 0, "attributed to the stamped proposer alone");
});
