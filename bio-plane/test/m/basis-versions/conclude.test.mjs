/* basis-versions: the conclusion (R16–R21), its record and reads (R22, R23), and the append-only record (R32). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, inqMd, V, MACHINE } from "./fixture.mjs";
import { ACT_SHAPE_CHECKS, MACHINE_FENCE_CHECKS } from "../../../checks/bio-checks.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const T = "2026-09-27T00:00:00Z", NOW = "2026-09-28T01:00:00Z";
const ALICE = "member:alice";
const ACCEPTED = { state: "accepted", claim: "the council approved it", state_by: ALICE, state_at: T, state_reason: "" };

function setup({ versionExtra = ACCEPTED, basis = [{ target: DOC, role: "supports" }] } = {}) {
  const w = world();
  w.doc(DOC);
  w.member("alice"); w.member("bo");
  const r = w.inquiry(Q, block(merge(version("first", [DOC], versionExtra),
    version("open-one", [DOC], { claim: "not yet accepted" }),
    version("no-claim", [DOC], { state: "accepted", state_by: ALICE, state_at: T, state_reason: "" }),
    { basis, refs: [DOC] })));
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  return w;
}
function standing(w, owner = "alice") {
  const p = w.project("Team", owner, [Q], { extra: ["current_versions:", `  - inquiry: "${Q}"`, `    version: "first"`,
    `    at: "${T}"`, `    by: "${ALICE}"`] });
  return p;
}
const conclude = (w, o) => w.bv.conclude({ target: Q, author: ALICE, viewer: V("alice"), identity: ALICE, ...o });

test("R16: refusals in order — a machine for either act; no conclusion without a project; free text beside a project; no falsifier unless stated or overridden; both; malformed fields; no target; no such bundle; not an inquiry; no document; an illegal transition, except a project on a concluded question; not a project; not joined", () => {
  const w = setup();
  const p = standing(w);
  const m = conclude(w, { author: MACHINE });
  assert.deepEqual([m.reason, MACHINE_FENCE_CHECKS.MACHINE_CANNOT_CONCLUDE.check], ["MACHINE_CANNOT_CONCLUDE", "C-32.2"]);
  assert.equal(conclude(w, { author: "" }).reason, "MACHINE_CANNOT_CONCLUDE");
  assert.equal(conclude(w, { author: MACHINE, withdraw: true }).reason, "MACHINE_CANNOT_CONCLUDE");
  assert.equal(conclude(w, { falsifier: "f" }).reason, "NO_CONCLUSION");
  assert.equal(ACT_SHAPE_CHECKS.NO_CONCLUSION.check, "C-33.1");
  assert.equal(conclude(w, { project: p, conclusion: "my words", falsifier: "f" }).reason, "CONCLUSION_IS_THE_CLAIM");
  assert.equal(conclude(w, { conclusion: "c" }).reason, "NO_FALSIFIER");
  assert.equal(conclude(w, { conclusion: "c", falsifier: "f", noFalsifier: "1" }).reason, "FALSIFIER_AND_NONE_STATED");
  for (const [k, v] of [["conclusion", 'has "quotes"'], ["falsifier", "x".repeat(501)], ["commentary", "a\nb"]])
    assert.equal(conclude(w, { project: p, falsifier: "f", ...(k === "conclusion" ? { project: null } : {}), [k]: v }).reason,
      `BAD_${k.toUpperCase()}`, k);
  assert.equal(conclude(w, { target: "", conclusion: "c", falsifier: "f" }).reason, "NO_TARGET");
  assert.equal(conclude(w, { target: "INQ-2026-0404-z", conclusion: "c", falsifier: "f" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(conclude(w, { viewer: "nobody", conclusion: "c", falsifier: "f" }).reason, "NO_SUCH_BUNDLE", "invisible is absent");
  assert.equal(conclude(w, { target: DOC, conclusion: "c", falsifier: "f" }).reason, "NOT_AN_INQUIRY");
  const deferred = world(); deferred.doc(DOC);
  deferred.promotion.promote({ bundleId: Q, base: null, snapKey: "d1", author: ALICE, meta: { object_type: "inquiry" },
    files: [{ path: "bundle.md", text: inqMd(Q, [...block(version("first", [DOC], ACCEPTED)), "disposition_reason: \"later\""], { state: "deferred" }) }] });
  const ill = deferred.bv.conclude({ target: Q, author: ALICE, viewer: V("alice"), conclusion: "c", falsifier: "f", version: "first" });
  assert.deepEqual([ill.reason, ill.from, ill.to], ["ILLEGAL_TRANSITION", "deferred", "concluded"]);
  assert.equal(conclude(w, { project: "PROJ-2026-0404-none", falsifier: "f" }).reason, "NOT_A_PROJECT");
  const bos = w.project("Bo", "bo", [Q]);
  assert.equal(conclude(w, { project: bos, falsifier: "f", viewer: "class:admin" }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  /* a project may conclude a question already concluded */
  assert.equal(conclude(w, { conclusion: "it was approved", falsifier: "minutes say otherwise", version: "first" }).ok, true);
  assert.equal(conclude(w, { project: p, falsifier: "f" }).ok, true);
});

test("R17: NO_CLAIM when nothing can be adopted, and NO_BASIS when the adopted version has no legs or (no project) the question has none", () => {
  const w = setup();
  const nc = (o) => conclude(w, { falsifier: "f", ...o });
  assert.equal(nc({ conclusion: "c", commentary: "more" }).reason, "NO_CLAIM", "commentary without a project");
  assert.equal(nc({ conclusion: "c" }).reason, "NO_CLAIM", "no version named without a project");
  assert.equal(ACT_SHAPE_CHECKS.NO_CLAIM.check, "C-33.34");
  const notDrawing = w.project("Elsewhere", "alice", []);
  assert.equal(nc({ project: notDrawing }).reason, "NO_CLAIM", "a project that does not draw on the question");
  const noCurrent = w.project("No stance", "alice", [Q]);
  assert.equal(nc({ project: noCurrent }).reason, "NO_CLAIM", "stands on no reading");
  const p = standing(w);
  assert.equal(nc({ project: p, version: "open-one" }).reason, "NO_CLAIM", "names a reading other than its CURRENT");
  assert.equal(nc({ conclusion: "c", version: "ghost" }).reason, "NO_CLAIM", "not carried");
  assert.equal(nc({ conclusion: "c", version: "open-one" }).reason, "NO_CLAIM", "not accepted");
  assert.equal(nc({ conclusion: "c", version: "no-claim" }).reason, "NO_CLAIM", "states no claim");
  const bare = setup({ basis: [] });
  const nb = bare.bv.conclude({ target: Q, author: ALICE, viewer: V("alice"), conclusion: "c", falsifier: "f", version: "first" });
  assert.deepEqual([nb.reason, nb.check, typeof nb.translation], ["NO_BASIS", "C-33.40", "string"]);
  const legless = world(); legless.doc(DOC);
  legless.inquiry(Q, block({ versions: [{ name: "empty", description: "no legs at all here", relationship: "and", claim: "c", ...ACCEPTED }],
    basis: [{ target: DOC, role: "supports" }], refs: [DOC] }));
  assert.equal(legless.bv.conclude({ target: Q, author: ALICE, viewer: V("alice"), conclusion: "c", falsifier: "f", version: "empty" }).reason, "NO_BASIS");
});

test("R18: with a project, one dated, authored concluded row is appended to its conclusions[], the claim verbatim, the falsifier or override, the commentary not evidence; the question's bytes do not change; the answer names the prior stance and the history length", () => {
  const w = setup();
  const p = standing(w);
  const qSha = w.sha(Q), qText = w.text(Q);
  const r = conclude(w, { project: p, noFalsifier: "true", commentary: "we checked twice" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.relationship, r.inquiry_moved, r.inquiry_state, r.version, r.claim, r.falsifier_override, r.commentary, r.prior, r.history_length],
    ["project", false, "open", "first", { state: "adopted", text: "the council approved it", version: "first" }, { by: ALICE, at: NOW },
     { text: "we checked twice", by: ALICE, at: NOW, evidence: false }, null, 1]);
  assert.equal(w.sha(Q), qSha, "the question's bundle_sha does not move");
  assert.equal(w.text(Q), qText);
  const t = w.text(p);
  assert.match(t, new RegExp(`conclusions:\\n  - inquiry: "${Q}"\\n    act: "concluded"\\n    version: "first"\\n    claim: "the council approved it"\\n    falsifier: ""\\n    falsifier_override_by: "${ALICE}"\\n    falsifier_override_at: "${NOW}"\\n    commentary: "we checked twice"\\n    at: "${NOW}"\\n    by: "${ALICE}"`));
  assert.match(t, /Commentary \(member:alice, not evidence\): we checked twice/);
  const again = conclude(w, { project: p, falsifier: "the minutes" });
  assert.deepEqual([again.prior.act, again.history_length], ["concluded", 2]);
});

test("R19: without a project, the question moves to concluded with the conclusion, conclusion_version, conclusion_claim, the falsifier or override pair, a state-history entry and a Session Log entry", () => {
  const w = setup();
  const r = conclude(w, { conclusion: "it was approved", falsifier: "the minutes say otherwise", version: "first" });
  assert.deepEqual([r.ok, r.relationship, r.from, r.to, r.version, r.claim.state, r.falsifier_override], [true, "no_project", "open", "concluded", "first", "adopted", null]);
  const t = w.text(Q);
  for (const line of ["current_state: concluded", "prior_state: open", 'conclusion: "it was approved"', 'conclusion_version: "first"',
                      'conclusion_claim: "the council approved it"', 'falsifier: "the minutes say otherwise"'])
    assert.ok(t.includes(line), line);
  assert.match(t, /state_history:\n  - timestamp: "2026-09-28T01:00:00Z"\n    from_state: open\n    to_state: concluded/);
  assert.match(t, /\| Concluded \| member:alice\nTrigger: op=conclude on INQ-2026-0001-q\n/);
  assert.equal(w.row(`SELECT current_state FROM bundles WHERE bundle_id=?`, Q).current_state, "concluded");
  const w2 = setup();
  w2.bv.conclude({ target: Q, author: ALICE, viewer: V("alice"), conclusion: "c", noFalsifier: true, version: "first" });
  assert.match(w2.text(Q), /falsifier_override_by: "member:alice"\nfalsifier_override_at: "2026-09-28T01:00:00Z"/);
});

test("R20: withdrawConclusion refuses in order and appends a withdrawn row naming what it withdraws, never editing an earlier row", () => {
  const w = setup();
  const p = standing(w);
  const wd = (o) => conclude(w, { withdraw: true, project: p, reason: "we got it wrong", ...o });
  assert.equal(wd({ reason: "" }).reason, "NO_REASON");
  assert.equal(wd({ reason: "x".repeat(161) }).reason, "BAD_REASON");
  assert.equal(wd({ reason: "a\nb" }).reason, "BAD_REASON");
  assert.equal(wd({ target: "" }).reason, "NO_TARGET");
  assert.equal(wd({ target: "INQ-2026-0404-z" }).reason, "NO_SUCH_BUNDLE");
  assert.equal(wd({ target: DOC }).reason, "NOT_AN_INQUIRY");
  assert.equal(wd({ project: "" }).reason, "NOT_A_PROJECT");
  assert.equal(wd({ viewer: "class:admin", project: w.project("Bo", "bo", [Q]) }).reason, "PROJECT_ACT_NOT_A_PARTICIPANT");
  const nothing = wd({});
  assert.deepEqual([nothing.reason, nothing.stance], ["NOTHING_TO_WITHDRAW", "none"]);
  assert.equal(ACT_SHAPE_CHECKS.NOTHING_TO_WITHDRAW.check, "C-33.37");
  conclude(w, { project: p, falsifier: "the minutes" });
  const before = w.text(p);
  const r = wd({});
  assert.deepEqual([r.ok, r.act, r.withdraws.version, r.withdraws.claim, r.history_length], [true, "withdrawn", "first", "the council approved it", 2]);
  const after = w.text(p);
  const block0 = before.slice(before.indexOf("conclusions:"), before.indexOf("---", before.indexOf("conclusions:")));
  assert.ok(after.includes(block0.trimEnd()), "the earlier row is kept byte for byte");
  assert.match(after, /act: "withdrawn"\n    withdraws_version: "first"\n    withdraws_at: "2026-09-28T01:00:00Z"\n    reason: "we got it wrong"/);
  assert.equal(wd({}).stance, "withdrawn", "nothing left to withdraw");
});

test("R21: UNSPLICEABLE_CONCLUSIONS when the project's block cannot be extended; nothing is written", () => {
  const w = setup();
  const p = w.project("Odd", "alice", [Q], { extra: ["current_versions:", `  - inquiry: "${Q}"`, `    version: "first"`,
    `    at: "${T}"`, `    by: "${ALICE}"`, "conclusions: none"] });
  const sha = w.sha(p);
  const r = conclude(w, { project: p, falsifier: "f" });
  assert.deepEqual([r.reason, ACT_SHAPE_CHECKS.UNSPLICEABLE_CONCLUSIONS.check], ["UNSPLICEABLE_CONCLUSIONS", "C-33.36"]);
  assert.equal(w.sha(p), sha);
});

test("R22: conclusionRecordOf answers the rows in order and the stance; an unknown act reads undetermined, never skipped; an invisible project answers no record; conclusionOf is the stance only while it is a conclusion", () => {
  const w = setup();
  const p = w.project("Hand", "alice", [Q], { extra: ["conclusions:",
    `  - inquiry: "${Q}"`, `    version: "old"`, `    claim: "an old claim"`, `    at: "2026-09-01T00:00:00Z"`, `    by: "${ALICE}"`,
    `  - inquiry: "INQ-2026-0009-other"`, `    act: "concluded"`, `    at: "2026-09-02T00:00:00Z"`,
    `  - inquiry: "${Q}"`, `    act: "reconsidered"`, `    at: "2026-09-03T00:00:00Z"`, `    by: "${ALICE}"`] });
  const rec = w.bv.conclusionRecordOf(p, Q, V("alice"));
  assert.deepEqual(rec.history.map((h) => [h.act, h.state]), [["concluded", "concluded"], ["unrecognised", "undetermined"]]);
  assert.equal(rec.history[0].claim_state, "adopted");
  assert.equal(rec.history[1].recorded_act, "reconsidered");
  assert.equal(rec.stance, rec.history[1]);
  assert.equal(w.bv.conclusionOf(p, Q, V("alice")), null, "an undetermined stance is no conclusion");
  assert.deepEqual(w.bv.conclusionRecordOf(p, Q, "nobody"), { history: [], stance: null });
  const q = standing(w);
  conclude(w, { project: q, falsifier: "f" });
  assert.equal(w.bv.conclusionOf(q, Q, V("alice")).version, "first");
  conclude(w, { withdraw: true, project: q, reason: "wrong" });
  assert.equal(w.bv.conclusionOf(q, Q, V("alice")), null, "withdrawn");
  assert.equal(w.bv.conclusionOf(q, Q, "nobody"), null, "invisible");
});

test("R23: noProjectConclusionOf answers the question's own conclusion, adopted only when the named version still states the claim; a conclusion written before versions reads undetermined, never back-filled", () => {
  const w = setup();
  assert.equal(w.bv.noProjectConclusionOf(Q), null, "not concluded");
  conclude(w, { conclusion: "it was approved", falsifier: "f", version: "first" });
  const n = w.bv.noProjectConclusionOf(Q);
  assert.deepEqual([n.relationship, n.relationship_established, n.conclusion, n.claim], ["no_project", false, "it was approved",
    { state: "adopted", text: "the council approved it", version: "first" }]);
  const w2 = world(); w2.doc(DOC);
  w2.promotion.promote({ bundleId: Q, base: null, snapKey: "old", author: ALICE, meta: { object_type: "inquiry" },
    files: [{ path: "bundle.md", text: inqMd(Q, [...block({ basis: [{ target: DOC, role: "supports" }], refs: [DOC] }),
      'conclusion: "old words"', 'falsifier: "f"'], { state: "concluded" }) }] });
  const old = w2.bv.noProjectConclusionOf(Q);
  assert.deepEqual([old.claim.state, old.claim.text, old.conclusion], ["undetermined", null, "old words"]);
  const w3 = world(); w3.doc(DOC);
  w3.promotion.promote({ bundleId: Q, base: null, snapKey: "forged", author: ALICE, meta: { object_type: "inquiry" },
    files: [{ path: "bundle.md", text: inqMd(Q, [...block({ basis: [{ target: DOC, role: "supports" }], refs: [DOC] }),
      'conclusion: "x"', 'falsifier: "f"', 'conclusion_version: "ghost"', 'conclusion_claim: "a claim nobody stated"'], { state: "concluded" }) }] });
  const forged = w3.bv.noProjectConclusionOf(Q);
  assert.equal(forged.claim.state, "undetermined");
  assert.match(forged.claim.detail, /carries no such reading/);
});

test("R32: a project's conclusion record is append-only; the latest row is its stance", () => {
  const w = setup();
  const p = standing(w);
  conclude(w, { project: p, falsifier: "one" });
  conclude(w, { withdraw: true, project: p, reason: "second thoughts" });
  conclude(w, { project: p, falsifier: "two" });
  const rec = w.bv.conclusionRecordOf(p, Q, V("alice"));
  assert.deepEqual(rec.history.map((h) => [h.act, h.falsifier ?? h.reason]), [["concluded", "one"], ["withdrawn", "second thoughts"], ["concluded", "two"]]);
  assert.equal(rec.stance.falsifier, "two");
});
