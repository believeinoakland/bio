/* basis-versions R48 (D59; T41-19): a project's conclusion may carry `bias_applied` in inquiry-grammar R18's shape with a
   conclusion's own effects (`inference_refused`, `scrutiny_raised`), recorded with the conclusion and read back by
   `conclusionRecordOf`; each statement is asked of bias's `statementInForce` (its R49) at the project's scope, the acting
   member as viewer, and one not in force (false or null) is refused through inquiry's `biasNotInForce` (its R61) with
   nothing written. bias's answer is a provider the test controls (as the fixture's inquiry provider), recording each
   call; the last test drives the factory's own wiring to the real bias on the same host. Every refusal has a negative
   control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, block, version, merge, V } from "./fixture.mjs";
import { basisVersionsOps, CONCLUSION_BIAS_MAX } from "../../../src/basis-versions/index.mjs";
import { biasOf } from "../../../src/bias/index.mjs";

const DOC = "INFO-2026-0001-ledger", Q = "INQ-2026-0001-transfers", T = "2026-09-27T00:00:00Z";
const RUTH = "member:ruth", CLAIM = "The transfer bypassed the council vote.";
const ACC = { state: "accepted", state_by: RUTH, state_at: T, state_reason: "", claim: CLAIM };
const SHA = "f".repeat(64);
const STANDS = ["current_versions:", `  - inquiry: "${Q}"`, `    version: "first"`, `    at: "${T}"`, `    by: "${RUTH}"`];

/* bias R49 as the test controls it: `lens` maps a statement id to its in_force answer (absent: false) */
function biasProvider() {
  const p = { lens: {}, calls: [] };
  p.statementInForce = (args) => {
    p.calls.push(args);
    const inForce = Object.hasOwn(p.lens, args.statement) ? p.lens[args.statement] : false;
    return { ok: true, statement: args.statement, scope: args.scope, in_force: inForce, kind: inForce ? "inference" : null,
             text: inForce ? "a statement" : null, bundle_id: null, level: inForce ? "project" : null, locked: false,
             statements_sha: SHA, stated: "" };
  };
  return p;
}

function setup({ bias = biasProvider() } = {}) {
  const w = world({ bias });
  w.doc(DOC);
  w.member("ruth");
  const q = w.inquiry(Q, block(merge(version("first", [DOC], ACC), { basis: [{ target: DOC, role: "supports" }], refs: [DOC] })),
                      { author: RUTH });
  assert.equal(q.ok, true, JSON.stringify(q).slice(0, 300));
  const P = w.project("Oversight", "ruth", [Q], { extra: STANDS });
  const P2 = w.project("Budget", "ruth", [Q], { extra: STANDS });
  return { w, bias, P, P2 };
}
const conclude = (w, o) => w.bv.conclude({ target: Q, falsifier: "a recorded council vote", author: RUTH, viewer: V("ruth"),
                                           identity: RUTH, ...o });
const BOTH = [{ statement: "p1", effect: "inference_refused" }, { statement: "s3", effect: "scrutiny_raised" }];

test("R48: a project's conclusion records bias_applied (both conclusion effects), each statement asked of bias R49 at the project's scope as the acting member; conclusionRecordOf and op=basisversions read it back with the lens checked; the question's bytes do not move; a conclusion with none reads [] (control)", () => {
  const { w, bias, P, P2 } = setup();
  bias.lens = { p1: true, s3: true };
  const qSha = w.sha(Q), qText = w.text(Q);
  const r = conclude(w, { project: P, biasApplied: BOTH });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual([r.bias_applied, r.bias_lens_sha], [BOTH, SHA]);
  assert.deepEqual(bias.calls, BOTH.map((e) => ({ statement: e.statement, scope: { type: "project", id: P }, viewer: V("ruth") })),
    "each statement asked once, at the project's scope, the acting member as viewer");
  const rec = w.bv.conclusionRecordOf(P, Q, V("ruth"));
  assert.deepEqual([rec.history.length, rec.stance.act, rec.stance.bias_applied, rec.stance.bias_lens_sha],
    [1, "concluded", BOTH, SHA], "recorded with the conclusion and read back, in order");
  assert.deepEqual(w.bv.conclusionOf(P, Q, V("ruth")).bias_applied, BOTH);
  assert.deepEqual(w.bv.basisVersions({ id: Q, project: P, viewer: V("ruth") }).conclusion_history[0].bias_applied, BOTH);
  assert.ok(w.text(P).includes("Bias applied: p1 (inference_refused); s3 (scrutiny_raised)"), "the Session Log names them");
  assert.deepEqual([w.sha(Q), w.text(Q)], [qSha, qText], "the question's bytes do not move");
  /* control: a conclusion with no bias applications asks bias nothing and reads an empty list */
  bias.calls.length = 0;
  const c = conclude(w, { project: P2 });
  assert.deepEqual([c.ok, c.bias_applied, c.bias_lens_sha, bias.calls.length], [true, [], null, 0]);
  const rc = w.bv.conclusionRecordOf(P2, Q, V("ruth")).stance;
  assert.deepEqual([rc.bias_applied, rc.bias_lens_sha], [[], null]);
  assert.equal(w.text(P2).includes("bias_"), false);
  /* a withdrawal and a re-conclusion keep the earlier row's applications readable (append-only, R32) */
  assert.equal(w.bv.conclude({ withdraw: true, target: Q, project: P, reason: "we got it wrong", author: RUTH,
                               viewer: V("ruth"), identity: RUTH }).ok, true);
  const h = w.bv.conclusionRecordOf(P, Q, V("ruth")).history;
  assert.deepEqual([h.length, h[0].bias_applied, h[1].act, "bias_applied" in h[1]], [2, BOTH, "withdrawn", false]);
});

test("R48: a statement not in force (false) or undetermined (null) is refused BIAS_APPLICATION_NOT_IN_FORCE through inquiry's biasNotInForce, naming the statement, and nothing is written — one bad statement refuses the whole list; the same list in force is recorded (control)", () => {
  const { w, bias, P } = setup();
  for (const [label, lens, bad] of [["not in force", { p1: true, s3: false }, "s3"], ["undetermined", { p1: null, s3: true }, "p1"],
                                    ["never held", { p1: true }, "s3"]]) {
    bias.lens = lens;
    const before = [w.sha(P), w.sha(Q)];
    const r = conclude(w, { project: P, biasApplied: BOTH });
    assert.deepEqual([r.ok, r.reason, r.code, r.statement, r.project, r.target], [false, "BIAS_APPLICATION_NOT_IN_FORCE",
      "BIAS_APPLICATION_NOT_IN_FORCE", bad, P, Q], label);
    assert.equal(r.in_force, Object.hasOwn(lens, bad) ? lens[bad] : false, label);
    assert.deepEqual([w.sha(P), w.sha(Q)], before, `${label}: nothing written`);
    assert.deepEqual(w.bv.conclusionRecordOf(P, Q, V("ruth")).history, [], `${label}: no conclusion recorded`);
  }
  bias.lens = { p1: true, s3: true };
  const ok = conclude(w, { project: P, biasApplied: BOTH });
  assert.deepEqual([ok.ok, ok.bias_applied], [true, BOTH], "control: in force, recorded");
});

test("R48: a malformed bias_applied is refused BAD_BIAS_APPLIED before bias is asked and writes nothing — not a list, not JSON, an unknown field or a leg's from/to, an empty, unholdable or overlong statement, a leg's effect, a repeat, too many, or any at all without a project; a well-formed list is recorded (control)", () => {
  const { w, bias, P } = setup();
  bias.lens = { p1: true, s3: true };
  const many = Array.from({ length: CONCLUSION_BIAS_MAX + 1 }, (_, i) => ({ statement: `s${i}`, effect: "scrutiny_raised" }));
  const cases = [
    ["not a list", { statement: "p1", effect: "inference_refused" }],
    ["not JSON", "[{statement: p1}"],
    ["an entry not an object", ["p1"]],
    ["an unknown field", [{ statement: "p1", effect: "inference_refused", why: "x" }]],
    ["a leg's from and to", [{ statement: "p1", effect: "inference_refused", from: "A", to: "B" }]],
    ["no statement", [{ effect: "inference_refused" }]],
    ["an empty statement", [{ statement: "  ", effect: "inference_refused" }]],
    ["a statement with a quote", [{ statement: 'p"1', effect: "inference_refused" }]],
    ["a statement with a comment mark", [{ statement: "p#1", effect: "inference_refused" }]],
    ["an overlong statement", [{ statement: "p".repeat(201), effect: "inference_refused" }]],
    ["a leg's effect grade_lowered", [{ statement: "p1", effect: "grade_lowered" }]],
    ["a leg's effect leg_excluded", [{ statement: "p1", effect: "leg_excluded" }]],
    ["no effect", [{ statement: "p1" }]],
    ["a repeat", [BOTH[0], BOTH[0]]],
    ["too many", many],
  ];
  const before = [w.sha(P), w.sha(Q)];
  for (const [label, biasApplied] of cases) {
    const r = conclude(w, { project: P, biasApplied });
    assert.deepEqual([r.ok, r.reason, typeof r.detail], [false, "BAD_BIAS_APPLIED", "string"], label);
  }
  /* without a project: refused, even where every statement would be in force */
  const np = w.bv.conclude({ target: Q, conclusion: "It was bypassed.", falsifier: "a vote", version: "first",
                             biasApplied: BOTH, author: RUTH, viewer: V("ruth") });
  assert.deepEqual([np.ok, np.reason], [false, "BAD_BIAS_APPLIED"]);
  assert.match(np.detail, /PROJECT's conclusion/);
  assert.equal(bias.calls.length, 0, "bias is never asked about a malformed list");
  assert.deepEqual([w.sha(P), w.sha(Q)], before, "nothing written");
  /* controls: the same no-project conclusion without bias_applied, and a well-formed list (also as JSON), are recorded */
  const npOk = w.bv.conclude({ target: Q, conclusion: "It was bypassed.", falsifier: "a vote", version: "first",
                               author: RUTH, viewer: V("ruth") });
  assert.equal(npOk.ok, true, JSON.stringify(npOk).slice(0, 300));
  for (const empty of [null, "", []]) assert.equal(conclude(w, { project: P, biasApplied: empty }).ok, true);
  const json = conclude(w, { project: P, biasApplied: JSON.stringify([{ statement: " p1 ", effect: "inference_refused" }]) });
  assert.deepEqual([json.ok, json.bias_applied], [true, [{ statement: "p1", effect: "inference_refused" }]], "trimmed, as asked");
});

test("R48: op=conclude carries bias_applied from the body (a list) or the query (its JSON), the stamps from the query only", () => {
  const { w, bias, P, P2 } = setup();
  bias.lens = { p1: true, s3: true };
  const url = (extra = "") => new URL(`http://x/?op=conclude&target=${Q}&falsifier=a+vote&author=${RUTH}`
    + `&viewer=${encodeURIComponent(V("ruth"))}&identity=${RUTH}${extra}`);
  const viaBody = basisVersionsOps(w.bv, url(`&project=${P}`), { bias_applied: BOTH }).conclude();
  assert.deepEqual([viaBody.ok, viaBody.bias_applied], [true, BOTH]);
  const viaQuery = basisVersionsOps(w.bv, url(`&project=${P2}&bias_applied=${encodeURIComponent(JSON.stringify([BOTH[1]]))}`),
                                    null).conclude();
  assert.deepEqual([viaQuery.ok, viaQuery.bias_applied], [true, [BOTH[1]]]);
  assert.deepEqual(w.bv.conclusionRecordOf(P2, Q, V("ruth")).stance.bias_applied, [BOTH[1]]);
  const refused = basisVersionsOps(w.bv, url(`&project=${P}`), { bias_applied: [{ statement: "zz", effect: "scrutiny_raised" }] })
    .conclude();
  assert.deepEqual([refused.ok, refused.reason, refused.statement], [false, "BIAS_APPLICATION_NOT_IN_FORCE", "zz"]);
});

test("R48: wired by the factory to the real bias on the same host — with no lens in force a statement is refused and nothing written; a conclusion with none is recorded (control)", () => {
  const { w, P } = setup({ bias: null });
  biasOf(w.host, { record: w.record, membership: w.membership, promotion: w.promotion }).migrate();
  const before = w.sha(P);
  const r = conclude(w, { project: P, biasApplied: [BOTH[0]] });
  assert.deepEqual([r.ok, r.reason, r.statement, r.in_force], [false, "BIAS_APPLICATION_NOT_IN_FORCE", "p1", false]);
  assert.equal(w.sha(P), before, "nothing written");
  assert.equal(conclude(w, { project: P }).ok, true);
});
