/* reevaluation: the corrected side (R27, N345; DEC-84 item 7): a dependent carries the cause `corrected` when a live leg
   of it rests on a side that contradiction's `tensionsOn` marks stale; `correctedDependents` lists each (dependent,
   candidate); `changesOf` answers it too; a recorded re-evaluation closes it (R16); nothing moves and nothing is written
   (R18, R19); a dependent the viewer may not see is withheld and not counted (R20). The stale marks are made through
   contradiction's own doors: the pairing forms a pair, a run proposes it, a member names one side wrong. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, U, V, MACHINE } from "./fixture.mjs";
import { Reevaluation, CAUSE_SOURCES, CORRECTED_LIMIT_DEFAULT, CORRECTED_LIMIT_MAX } from "../../../src/reevaluation/index.mjs";
import { Contradiction, inquiryServices } from "../../../src/contradiction/index.mjs";

const RULE = "INFO-2026-0001-rule", ACT = "INFO-2026-0002-act";
const Q = "INQ-2026-0001-q", D = "INQ-2026-0002-d", WHOLE = "INQ-2026-0003-whole", OTHER = "INQ-2026-0004-other";
const ADMIN = "class:admin";

/** Q rests on a passage of RULE (supports) and one of ACT (cuts against): contradiction's K1 pairs them. D rests on the
 *  same passage of RULE; WHOLE on RULE with no passage named; OTHER on the passage of ACT. */
function k1() {
  const w = world();
  const a = w.cap("a", "the rule"), b = w.cap("b", "the act");
  w.doc(RULE, [a]); w.doc(ACT, [b]);
  w.read(a.sha, [U(0, "x"), U(1, "the fee rose")]); w.read(b.sha, [U(0, "x"), U(1, "the fee fell")]);
  const ca = w.passage(RULE, a.sha), cb = w.passage(ACT, b.sha);
  w.inquiry(Q, { legs: [{ target: RULE, content_id: ca }, { target: ACT, role: "cuts_against", content_id: cb }] });
  w.inquiry(D, { legs: [{ target: RULE, content_id: ca }] });
  w.inquiry(WHOLE, { legs: [{ target: RULE }] });
  w.inquiry(OTHER, { legs: [{ target: ACT, content_id: cb }] });
  const cand = w.candidate("K1");
  return { w, a, b, ca, cb, cand };
}
const corrected = (o) => o.causes.filter((c) => c.source === "corrected");
/** Which side of a candidate rests on content row `cid` (contradiction stores a pair's sides in a canonical order). */
const sideOn = (w, cand, cid) => {
  const [c] = w.c.candidatesFor({ on: { candidate: cand }, viewer: ADMIN }).candidates;
  return c.a.content_id === cid || c.a.inquiry === cid && c.a.kind === "claim" ? "a" : "b";
};

test("R27 R2: a live leg resting on a side marked stale carries `corrected`: the stale leg's own inquiry, and an inquiry with a leg on its content row", () => {
  const { w, a, ca, cand } = k1();
  assert.equal(w.r.reevaluations({ viewer: ADMIN }).count, 0, "a candidate not yet resolved marks nothing stale");
  const act = w.wrong(cand, sideOn(w, cand, ca), "misread the table");
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.equal(r.corrections_read, true);
  assert.deepEqual(r.obligations.map((o) => [o.bundle_id, o.target]), [[Q, RULE], [D, RULE]],
    "WHOLE names no passage and OTHER rests on the side not named wrong: neither is caused");
  for (const o of r.obligations) {
    const [c] = corrected(o);
    assert.deepEqual([c.source, c.since, c.ord, c.candidate, c.kind, c.reason, c.member, c.act],
      ["corrected", act.act.at, 0, cand, "corrected", "misread the table", "member:alice", act.act.act_id]);
    assert.deepEqual(c.side, { on: "content", content_id: ca, capture_sha: a.sha });
    assert.equal(c.since_why, undefined, "an act's mark carries its instant");
    assert.match(c.detail, /named wrong .* still resolves .*nothing resting on it was moved/s);
    assert.deepEqual(o.reeval, { flag: true, since: act.act.at, source: "corrected" });
    assert.deepEqual([o.target_state, o.legs.map((l) => [l.ord, l.status])], ["collected", [[0, "confirmed"]]]);
  }
  assert.ok(CAUSE_SOURCES.includes("corrected"));
  /* asked of the target */
  assert.deepEqual(w.r.reevaluations({ target: RULE, viewer: ADMIN }).obligations.map((o) => o.bundle_id), [Q, D]);
  assert.equal(w.r.reevaluations({ target: ACT, viewer: ADMIN }).count, 0);
});

test("R27: a leg naming an inquiry whose claim was named wrong carries `corrected` on that claim; the other claim's dependents do not", () => {
  const w = world();
  const I1 = "INQ-2026-0001-rose", I2 = "INQ-2026-0002-fell", DEP = "INQ-2026-0003-dep", DEP2 = "INQ-2026-0004-dep2";
  w.inquiry(I1, {}); w.inquiry(I2, {});
  w.claim(I1, "v1", "the fee rose", "E1"); w.claim(I2, "v1", "the fee fell", "E1");
  w.inquiry(DEP, { legs: [{ target: I1 }] });
  w.inquiry(DEP2, { legs: [{ target: I2 }] });
  const cand = w.candidate("K2");
  const act = w.wrong(cand, sideOn(w, cand, I1), "the earlier minutes were superseded");
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => [o.bundle_id, o.target]), [[DEP, I1]]);
  const [c] = corrected(r.obligations[0]);
  assert.deepEqual([c.ord, c.candidate, c.since, c.side], [0, cand, act.act.at, { on: "claim", inquiry: I1, version: "v1" }]);
  assert.match(c.detail, new RegExp(`claim of ${I1} at version v1`));
});

test("R27: only a live leg rests on anything: a severed leg and a divided citer carry no corrected cause; the child that took the passage leg does (N360)", () => {
  const { w, ca, cand } = k1();
  const SEV = "INQ-2026-0005-sev";
  w.inquiry(SEV, { legs: [{ target: RULE, content_id: ca }], refs: [{ target: RULE, rel: "cites", status: "severed" }] });
  w.wrong(cand, sideOn(w, cand, ca));
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.ok(!r.obligations.some((o) => o.bundle_id === SEV), "a severed leg supports nothing and is not caused");
  assert.deepEqual(w.r.correctedDependents({ viewer: ADMIN }).entries.map((e) => e.dependent), [Q, D]);
  /* a divided citer: its legs are frozen history. The child that took the passage leg holds it on the same passage
     (inquiry R24, N360: divide carries each apportioned leg's passage), so R27's passage-level cause reaches it; the
     child that took the whole-document leg on ACT is not caused. */
  const DIV = "INQ-2026-0006-div", C1 = "INQ-2026-0007-first", C2 = "INQ-2026-0008-second";
  w.inquiry(DIV, { legs: [{ target: RULE, content_id: ca }, { target: ACT }] });
  const d = w.k.divide({ target: DIV, reason: "two questions", viewer: "admin", author: V("alice"),
    children: [{ id: C1, question: "First half?", legs: [0] }, { id: C2, question: "Second half?", legs: [1] }] });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  const after = w.r.correctedDependents({ viewer: ADMIN }).entries.map((e) => e.dependent);
  assert.deepEqual(w.rows(`SELECT content_id FROM inquiry_basis WHERE bundle_id=? AND ord=0`, DIV)[0].content_id, ca,
    "the divided citer's leg still names the passage");
  assert.deepEqual(w.rows(`SELECT content_id FROM inquiry_basis WHERE bundle_id=? AND ord=0`, C1)[0].content_id, ca,
    "the child's leg names the parent leg's passage");
  assert.deepEqual(after, [Q, D, C1], "the divided citer is not caused; its child resting on the passage is");
  assert.ok(!after.includes(DIV) && !after.includes(C2));
  const [c1] = w.r.reevaluations({ viewer: ADMIN }).obligations.filter((o) => o.bundle_id === C1);
  assert.deepEqual([c1.target, corrected(c1).map((c) => [c.ord, c.candidate, c.side.content_id])], [RULE, [[0, cand, ca]]]);
});

test("R27 R20: a dependent the viewer may not see is withheld and not counted; a viewer who may not see the candidate's sides is told no cause", () => {
  const { w, ca, cand } = k1();
  w.wrong(cand, sideOn(w, cand, ca));
  w.member("ann");
  const asAnn = w.r.correctedDependents({ viewer: V("ann") });
  assert.deepEqual(asAnn.entries.map((e) => e.dependent), [Q, D], "a member sees the same record facts");
  const none = w.r.correctedDependents({ viewer: "nobody" });
  assert.deepEqual([none.count, none.entries, Object.keys(none).filter((k) => /withheld|hidden/.test(k))], [0, [], []]);
  assert.equal(w.r.reevaluations({ viewer: "nobody" }).count, 0);
  /* the viewer is the one contradiction reads the marks for (its R10, R19): a stand-in that shows ann no mark */
  const real = w.c;
  const r = new Reevaluation({ storage: w.st, record: w.record, membership: w.membership, promotion: w.promotion,
    inquiry: w.k, content: w.content, provenance: w.prov, strength: w.strength, basisVersions: w.basisVersions,
    contradiction: { tensionsOn: (q) => (q.viewer === V("ann") ? { ok: true, wrote: false,
      referents: q.referents.map((ref) => ({ referent: ref, marks: [] })) } : real.tensionsOn(q)) } });
  assert.deepEqual(r.correctedDependents({ viewer: ADMIN }).entries.map((e) => e.dependent), [Q, D]);
  assert.deepEqual([r.correctedDependents({ viewer: V("ann") }).count, r.reevaluations({ viewer: V("ann") }).count,
                    r.changesOf({ findings: [D], viewer: V("ann") }).findings[0].causes], [0, 0, []],
    "a viewer shown no mark on the side is told no cause, though the dependent itself is seen");
});

test("R27: correctedDependents lists each (dependent, candidate) in dependent then candidate order, paged by limit (1–200) with a cursor", () => {
  const { w, a, ca, cand } = k1();
  /* a second candidate over the same passage: Q2 rests on it with a cutting leg on another document */
  const c = w.cap("c", "the minutes");
  w.doc("INFO-2026-0003-minutes", [c]);
  w.read(c.sha, [U(0, "x"), U(1, "the fee held")]);
  const cc = w.passage("INFO-2026-0003-minutes", c.sha);
  const Q2 = "INQ-2026-0000-q2";
  w.inquiry(Q2, { legs: [{ target: RULE, content_id: ca }, { target: "INFO-2026-0003-minutes", role: "cuts_against", content_id: cc }] });
  const pairs = w.c.pairs({ key: "K1", viewer: ADMIN }).pairs;
  const second = w.candidate("K1", "record", pairs.findIndex((p) => p.inquiry === Q2));
  w.wrong(cand, sideOn(w, cand, ca)); w.wrong(second, sideOn(w, second, ca), "a second reading");
  const all = w.r.correctedDependents({ viewer: ADMIN });
  const [lo, hi] = [cand, second].sort();
  assert.deepEqual(all.entries.map((e) => [e.dependent, e.candidate]),
    [[Q2, lo], [Q2, hi], [Q, lo], [Q, hi], [D, lo], [D, hi]].sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : x[1] < y[1] ? -1 : 1)));
  assert.deepEqual([all.count, all.limit, all.truncated, all.cursor, all.wrote], [6, CORRECTED_LIMIT_DEFAULT, false, null, false]);
  const e = all.entries.find((x) => x.dependent === D && x.candidate === cand);
  assert.deepEqual(e.legs, [{ target: RULE, ord: 0, side: { on: "content", content_id: ca, capture_sha: a.sha } }]);
  assert.deepEqual([e.kind, e.member, e.reason], ["corrected", "member:alice", "misread the table"]);
  /* paged */
  const seen = [];
  let page = w.r.correctedDependents({ limit: 4, viewer: ADMIN });
  assert.deepEqual([page.count, page.truncated, page.cursor], [4, true, `${page.entries[3].dependent}#${page.entries[3].candidate}`]);
  seen.push(...page.entries);
  page = w.r.correctedDependents({ limit: 4, after: page.cursor, viewer: ADMIN });
  assert.deepEqual([page.count, page.truncated, page.cursor], [2, false, null]);
  seen.push(...page.entries);
  assert.deepEqual(seen, all.entries, "the pages together are the whole listing");
  for (const [limit, applied] of [[0, CORRECTED_LIMIT_DEFAULT], [-3, 1], [9999, CORRECTED_LIMIT_MAX], ["junk", CORRECTED_LIMIT_DEFAULT], [2, 2]])
    assert.equal(w.r.correctedDependents({ limit, viewer: ADMIN }).limit, applied, `limit ${limit}`);
  assert.equal(CORRECTED_LIMIT_MAX, 200);
});

test("R27 R16: a recorded re-evaluation closes the corrected cause for that dependent; the listing drops it; the other dependent still owes it", () => {
  const { w, ca, cand } = k1();
  const act = w.wrong(cand, sideOn(w, cand, ca));
  const m = w.r.recordReevaluation({ dependent: D, target: RULE, source: "corrected", note: "x", author: MACHINE, viewer: ADMIN });
  assert.equal(m.code, "MACHINE_CANNOT_RECORD_REEVALUATION");
  const ok = w.r.recordReevaluation({ dependent: D, target: RULE, source: "corrected", note: "read the correction; still stands",
                                      author: "alice", viewer: ADMIN });
  assert.deepEqual([ok.ok, ok.source, ok.since], [true, "corrected", act.act.at]);
  const r = w.r.reevaluations({ viewer: ADMIN });
  assert.deepEqual(r.obligations.map((o) => o.bundle_id), [Q]);
  assert.deepEqual([r.closed.map((x) => x.bundle_id), r.closed[0].causes[0].closed_by], [[D], "alice"]);
  assert.deepEqual(w.r.correctedDependents({ viewer: ADMIN }).entries.map((e) => e.dependent), [Q]);
  assert.deepEqual(w.r.changesOf({ findings: [D], viewer: ADMIN }).findings[0].causes, [], "closed: not standing");
});

test("R27 R9: changesOf answers the corrected causes a named finding carries, each naming its target", () => {
  const { w, ca, cand } = k1();
  w.wrong(cand, sideOn(w, cand, ca));
  const r = w.r.changesOf({ findings: [D, OTHER, WHOLE], viewer: ADMIN });
  assert.equal(r.corrections_read, true);
  assert.deepEqual(r.findings.map((f) => [f.id, f.causes.map((c) => [c.source, c.target, c.ord, c.candidate])]),
    [[D, [["corrected", RULE, 0, cand]]], [OTHER, []], [WHOLE, []]]);
  assert.equal(r.findings[0].causes[0].side.content_id, ca);
  assert.deepEqual(w.r.changesOf({ findings: [D], viewer: "nobody" }).findings[0], { id: D, absent: true });
});

test("R27 R18 R19: the reads write nothing and nothing moves: no strength, leg or document changes", () => {
  const { w, ca, cand } = k1();
  w.wrong(cand, sideOn(w, cand, ca));
  const pair = JSON.stringify(w.strength.strengthOf(D)), text = w.text(D);
  const before = w.snapshot();
  w.r.reevaluations({ viewer: ADMIN });
  w.r.reevaluations({ target: RULE, viewer: ADMIN });
  w.r.correctedDependents({ viewer: ADMIN });
  w.r.changesOf({ findings: [Q, D], viewer: ADMIN });
  assert.deepEqual(w.snapshot(), before, "no table changes across the reads");
  assert.equal(JSON.stringify(w.strength.strengthOf(D)), pair);
  assert.equal(w.text(D), text);
});

test("R27 R21: a tensions read that cannot be made is said, never read as none", () => {
  const { w } = k1();
  const make = (contradiction) => new Reevaluation({ storage: w.st, record: w.record, membership: w.membership,
    promotion: w.promotion, inquiry: w.k, content: w.content, provenance: w.prov, strength: w.strength,
    basisVersions: w.basisVersions, contradiction });
  const broken = make({ tensionsOn: () => { throw new Error("gone"); } });
  for (const r of [broken.reevaluations({ viewer: ADMIN }), broken.correctedDependents({ viewer: ADMIN }),
                   broken.changesOf({ findings: [D], viewer: ADMIN })]) {
    assert.equal(r.corrections_read, false);
    assert.match(r.corrections_why, /not the same as none/);
  }
  const undetermined = make({ tensionsOn: () => ({ ok: true, wrote: false, referents: [], undetermined: true }) });
  assert.equal(undetermined.reevaluations({ viewer: ADMIN }).corrections_read, false);
});

test("R27 R16 (N359): a side named wrong by a contradiction inquiry's CORRECTED conclusion gives `corrected` with the concluding member and instant as `since`; one concluded by basis-versions' own door states none, says why, and closes as any cause", () => {
  const { w, ca, cand } = k1();
  const side = sideOn(w, cand, ca);
  const up = w.c.takeUp({ candidate: cand, question: "Which reading is right?", frame: side === "a" ? "b" : "a",
                          viewer: ADMIN, author: "member:alice" });
  assert.equal(up.ok, true, JSON.stringify(up).slice(0, 400));
  /* the question's own accepted reading, whose claim the conclusion adopts (basis-versions R16) */
  const T0 = "2026-09-28T00:00:00Z";
  const reading = ["basis_versions:", '  - name: "v1"', '    description: "the reading called v1"', '    relationship: "and"',
    '    state: "accepted"', "    hidden: false", "    derived_from: null", '    author: "member:alice"', `    at: "${T0}"`,
    '    claim: "the fee fell"', '    state_by: "member:alice"', `    state_at: "${T0}"`, '    state_reason: ""',
    "basis_version_grounds:", '  - version: "v1"', '    ground: "main"', '    asserted_by: "member:alice"', `    at: "${T0}"`,
    "basis_version_legs:", '  - version: "v1"', `    target: "${RULE}"`, '    role: "supports"', '    ground: "main"'].join("\n");
  const withReading = w.promotion.promote({ bundleId: up.inquiry, base: w.record.head(up.inquiry).bundleSha, snapKey: "reading",
    author: "member:alice", files: [{ path: "bundle.md", text: w.text(up.inquiry).replace(/\n---\n/, `\n${reading}\n---\n`) }],
    meta: { object_type: "inquiry" } });
  assert.equal(withReading.ok, true, JSON.stringify(withReading).slice(0, 600));
  w.clock.now = "2026-09-29T12:00:00Z";
  const r = w.c.resolve({ inquiry: up.inquiry, resolution: { kind: "misquote", wrong_side: side, reason: "the table was misread" },
                          conclusion: "the fee fell", version: "v1", falsifier: "a clean copy of the table", viewer: ADMIN, author: "member:bea" });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 500));
  const o = w.r.reevaluations({ viewer: ADMIN }).obligations;
  assert.ok([Q, D].every((d) => o.some((x) => x.bundle_id === d && x.target === RULE)));
  for (const x of o.filter((y) => y.target === RULE)) {
    const [c] = corrected(x);
    assert.deepEqual([c.since, c.member, c.inquiry, c.act, c.kind, c.reason, c.since_why],
      [r.act.at, "member:bea", up.inquiry, r.act.act_id, "misquote", "the table was misread", undefined]);
    assert.equal(r.act.at, "2026-09-29T12:00:00Z");
    assert.deepEqual(x.reeval, { flag: true, since: r.act.at, source: "corrected" });
  }
  assert.equal(w.r.recordReevaluation({ dependent: D, target: RULE, source: "corrected", note: "seen", author: "alice",
                                        viewer: ADMIN }).since, r.act.at);
  assert.ok(!w.r.correctedDependents({ viewer: ADMIN }).entries.some((e) => e.dependent === D), "closed for D");
  /* concluded by basis-versions' own door: contradiction's mark carries no instant and says why; none is invented */
  const { w: o2, ca: ca2, cand: cand2 } = k1();
  const side2 = sideOn(o2, cand2, ca2);
  const up2 = o2.c.takeUp({ candidate: cand2, question: "Which reading is right?", frame: side2 === "a" ? "b" : "a",
                            viewer: ADMIN, author: "member:alice" });
  const text = o2.text(up2.inquiry).replace(/^current_state: .*$/m, "current_state: concluded")
    .replace(/^prior_state: .*$/m, "prior_state: open")
    .replace(/\n---\n/, `\nconclusion: "the fee fell"\nfalsifier: "none"\nresolution:\n  kind: "misquote"\n  wrong_side: "${side2}"\n  reason: "misread"\n---\n`);
  const pr = o2.promotion.promote({ bundleId: up2.inquiry, base: o2.record.head(up2.inquiry).bundleSha, snapKey: "other-door",
                                    author: "member:alice", files: [{ path: "bundle.md", text }], meta: { object_type: "inquiry" } });
  assert.equal(pr.ok, true, JSON.stringify(pr).slice(0, 600));
  const d2 = o2.r.reevaluations({ viewer: ADMIN }).obligations.find((x) => x.bundle_id === D);
  const [c2] = corrected(d2);
  assert.deepEqual([c2.since, c2.member, c2.inquiry, c2.act], [null, null, up2.inquiry, undefined]);
  assert.match(c2.since_why, /basis-versions' own door.*none is invented/s);
  /* R16's null-matching close: a null since is closed by a record of a null since, until an instant appears */
  assert.equal(o2.r.recordReevaluation({ dependent: D, target: RULE, source: "corrected", note: "seen", author: "alice",
                                         viewer: ADMIN }).since, null);
  assert.ok(!o2.r.reevaluations({ viewer: ADMIN }).obligations.some((x) => x.bundle_id === D));
});

test("R27 (K493): a stance side is never marked stale, so a K5 candidate never yields a corrected cause", () => {
  const w = world();
  const I = "INQ-2026-0001-fee", DEP = "INQ-2026-0002-dep";
  w.inquiry(I, {});
  w.inquiry(DEP, { legs: [{ target: I }] });
  const P1 = w.project("A", "owen"), P2 = w.project("B", "owen");
  /* two projects' concluded stances on I (basis-versions R22, R37), a stand-in the test controls */
  const stance = { [P1]: { claim: "the fee rose", version: "v1" }, [P2]: { claim: "the fee fell", version: "v2" } };
  const bv = { projectsDrawingOn: (inq) => (inq === I ? [{ id: P1 }, { id: P2 }] : []),
               conclusionOf: (p, inq) => (inq === I && stance[p] ? { act: "concluded", state: "concluded", ...stance[p] } : null) };
  const c = new Contradiction(w.st, { record: w.record, extraction: w.ex.provider, membership: w.membership,
    promotion: w.promotion, entities: w.entities, basisVersions: bv, inquiry: inquiryServices(w.host), now: () => w.clock.now });
  c.registerRunGate("test", () => ({ found: true, running: true, refusal: null }));
  const [pair] = c.pairs({ key: "K5", viewer: ADMIN }).pairs;
  const p = c.propose({ run: "RUN-2026-0001", proposedBy: "class:ai/tok1", viewer: ADMIN, caller: "member:alice",
                        proposals: [{ key: "K5", a: pair.a, b: pair.b, label: "record", reason: "differs" }] });
  const cand = p.candidates[0].candidate;
  for (const wrongSide of ["a", "b"])
    assert.equal(c.clarify({ candidate: cand, choice: "one_wrong", wrongSide, reason: "x", viewer: ADMIN, author: "member:alice" }).ok,
      false, "no side of a K5 candidate can be named wrong");
  const r = new Reevaluation({ storage: w.st, record: w.record, membership: w.membership, promotion: w.promotion,
    inquiry: w.k, content: w.content, provenance: w.prov, strength: w.strength, basisVersions: w.basisVersions, contradiction: c });
  assert.deepEqual([r.reevaluations({ viewer: ADMIN }).count, r.correctedDependents({ viewer: ADMIN }).count], [0, 0]);
  const t = c.tensionsOn({ referents: [pair.a, pair.b], viewer: ADMIN });
  assert.ok(t.referents.every((x) => !x.marks.some((m) => m.mark === "stale")));
});
