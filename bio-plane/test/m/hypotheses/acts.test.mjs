/* hypotheses at its interface: holding, revising and withdrawing a hypothesis (R1, R2) and every read (R3). */
import test from "node:test";
import assert from "node:assert/strict";
import { world, ANN, OUTSIDER, INQ, E1, E2, E3 } from "./fixture.mjs";
import { HYPOTHESIS_KINDS, HYPOTHESES_CHECKS } from "../../../src/hypotheses/index.mjs";

test("R1 hold records one HYP- in an inquiry, of each of the five kinds, with the member's statement and nodes, and answers {ok, hypothesis_id, kind, label, at}", () => {
  const w = world();
  w.bundle(INQ);
  assert.deepEqual([...HYPOTHESIS_KINDS], ["cause", "identity", "relation", "flow", "other"]);
  const seen = new Set();
  for (const kind of HYPOTHESIS_KINDS) {
    const about = ["flow", "other"].includes(kind) ? [E1, E2, E3] : { from: E1, to: E2 };
    const r = w.h.hold({ inquiry: INQ, kind, statement: `A ${kind} I suspect.`, about, by: ANN });
    assert.equal(r.ok, true, JSON.stringify(r));
    assert.match(r.hypothesis_id, /^HYP-2026-\d{4,}$/);
    assert.ok(!seen.has(r.hypothesis_id));
    seen.add(r.hypothesis_id);
    assert.deepEqual(Object.keys(r).sort(), ["at", "hypothesis_id", "kind", "label", "ok"]);
    assert.equal(r.kind, kind);
    assert.equal(r.label, "hypothesis");
    const got = w.h.read({ hypothesisId: r.hypothesis_id, viewer: ANN }).hypothesis;
    assert.equal(got.inquiry, INQ);
    assert.equal(got.statement, `A ${kind} I suspect.`);
    assert.deepEqual(got.about, about);
    assert.equal(got.held_by, ANN);
  }
  /* flow and other may also name {from, to}; a bundle id with its slug is a node the grammar knows */
  assert.equal(w.h.hold({ inquiry: INQ, kind: "flow", statement: "Money moved.", about: { from: E1, to: "INFO-2026-0001-doc" }, by: ANN }).ok, true);
});

test("R1 hold's refusals, in order: NO_SUCH_BUNDLE (absent or invisible, one answer), NOT_AN_INQUIRY, MACHINE_CANNOT_HYPOTHESISE, UNKNOWN_HYPOTHESIS_KIND naming the five, HYPOTHESIS_NO_STATEMENT (its own code, row C-134.5), BAD_ABOUT naming the node; nothing is written", () => {
  const w = world();
  w.bundle(INQ);
  w.fenced("INQ-2026-0009-hidden");
  w.bundle("INFO-2026-0001-doc", { type: "information" });
  const ok = { inquiry: INQ, kind: "relation", statement: "S.", about: { from: E1, to: E2 }, by: ANN };
  const codes = (r) => [r.ok, r.reason, r.code, r.check];
  const absent = w.h.hold({ ...ok, inquiry: "INQ-2026-0404-none", kind: "nonsense", by: OUTSIDER });
  const hidden = w.h.hold({ ...ok, inquiry: "INQ-2026-0009-hidden", kind: "nonsense", by: OUTSIDER });
  assert.deepEqual(codes(absent), [false, "NO_SUCH_BUNDLE", "NO_SUCH_BUNDLE", "C-134.1"]);
  assert.deepEqual({ ...hidden, inquiry: null }, { ...absent, inquiry: null }, "a hidden inquiry answers as an absent one");
  assert.equal(w.h.hold({ ...ok, by: null }).reason, "NO_SUCH_BUNDLE", "an absent stamp sees nothing");
  assert.equal(w.h.hold({ ...ok, inquiry: "INFO-2026-0001-doc", kind: "nonsense" }).reason, "NOT_AN_INQUIRY");
  for (const machine of ["class:ai", "class:daemon", "class:admin"])
    assert.equal(w.h.hold({ ...ok, kind: "nonsense", by: machine }).reason, "MACHINE_CANNOT_HYPOTHESISE");
  const k = w.h.hold({ ...ok, kind: "suspicion", statement: "" });
  assert.equal(k.reason, "UNKNOWN_HYPOTHESIS_KIND");
  assert.deepEqual(k.kinds, ["cause", "identity", "relation", "flow", "other"]);
  for (const kind of ["cause", "identity", "relation", "flow", "other"]) assert.ok(k.detail.includes(kind));
  for (const statement of ["", "   ", null, 7]) {
    const r = w.h.hold({ ...ok, statement, about: null });
    assert.deepEqual([r.reason, r.code, r.check], ["HYPOTHESIS_NO_STATEMENT", "HYPOTHESIS_NO_STATEMENT", "C-134.5"]);
    assert.equal(r.translation, "Say what you think, in your own words. Nothing was written.", "the row's translation is unchanged");
  }
  const bad = [
    [{ from: E1, to: "not-an-id" }, "not-an-id"], [{ from: E1 }, null], [{ from: E1, to: E1 }, E1],
    [[E1, E2], undefined], [null, undefined],
  ];
  for (const [about, node] of bad) {
    const r = w.h.hold({ ...ok, about });
    assert.equal(r.reason, "BAD_ABOUT", JSON.stringify(about));
    if (node !== undefined) assert.equal(r.node, node);
  }
  const listBad = w.h.hold({ ...ok, kind: "other", about: [E1, "nope"] });
  assert.deepEqual([listBad.reason, listBad.node], ["BAD_ABOUT", "nope"]);
  assert.equal(w.h.hold({ ...ok, kind: "flow", about: [] }).reason, "BAD_ABOUT");
  for (const r of [absent, k, listBad]) assert.ok(typeof r.translation === "string" && r.translation.length > 10);
  assert.equal(w.rows(`SELECT COUNT(*) AS n FROM hypotheses`)[0].n, 0, "nothing was written");
  assert.equal(w.h.hold(ok).ok, true, "the negative control holds");
});

test("R2 a hypothesis is never edited in place: revise appends a revision, withdraw marks it withdrawn, each with who, when and why; every read shows its history; HYPOTHESIS_NO_REASON (its own code, row C-134.7), HYPOTHESIS_NO_STATEMENT for an empty revised statement, and NO_SUCH_HYPOTHESIS refuse; no refusal answers NO_STATEMENT or NO_REASON", () => {
  const w = world();
  w.bundle(INQ);
  const id = w.hold();
  const rev = w.h.revise({ hypothesisId: id, statement: "They act together, through E3.", about: { from: E1, to: E3 }, reason: "A new filing.", by: ANN });
  assert.deepEqual([rev.ok, rev.hypothesis_id, rev.label], [true, id, "hypothesis"]);
  const only = w.h.revise({ hypothesisId: id, reason: "Same words, noted.", by: ANN });
  assert.equal(only.ok, true, "a revision may change neither statement nor nodes");
  for (const r of [w.h.revise({ hypothesisId: id, statement: "x", by: ANN }), w.h.withdraw({ hypothesisId: id, reason: "  ", by: ANN })]) {
    assert.deepEqual([r.reason, r.code, r.check], ["HYPOTHESIS_NO_REASON", "HYPOTHESIS_NO_REASON", "C-134.7"]);
    assert.equal(r.translation, "Say why you are changing or withdrawing this hypothesis. Nothing was written.", "the row's translation is unchanged");
  }
  for (const statement of ["", "  "]) {
    const r = w.h.revise({ hypothesisId: id, statement, reason: "r", by: ANN });
    assert.deepEqual([r.reason, r.check], ["HYPOTHESIS_NO_STATEMENT", "C-134.5"], "a revision with an empty statement");
  }
  /* no refusal of this module answers the shared codes, and no row holds them */
  assert.ok(!("NO_STATEMENT" in HYPOTHESES_CHECKS) && !("NO_REASON" in HYPOTHESES_CHECKS));
  for (const hypothesisId of ["HYP-2026-0404", "nope", null])
    for (const act of ["revise", "withdraw"]) assert.equal(w.h[act]({ hypothesisId, reason: "r", by: ANN }).reason, "NO_SUCH_HYPOTHESIS");
  assert.equal(w.h.revise({ hypothesisId: id, about: [E1, E2], reason: "r", by: ANN }).reason, "BAD_ABOUT", "a relation keeps its two nodes");
  assert.equal(w.h.revise({ hypothesisId: id, reason: "r", by: "class:ai" }).reason, "MACHINE_CANNOT_HYPOTHESISE");
  const wd = w.h.withdraw({ hypothesisId: id, reason: "The filing was misread.", by: ANN });
  assert.equal(wd.ok, true);
  assert.equal(wd.withdrawn.by, ANN);
  assert.equal(w.h.withdraw({ hypothesisId: id, reason: "again", by: ANN }).already, true);
  assert.equal(w.h.revise({ hypothesisId: id, statement: "back", reason: "r", by: ANN }).reason, "HYPOTHESIS_WITHDRAWN");
  const got = w.h.read({ hypothesisId: id, viewer: ANN }).hypothesis;
  assert.equal(got.status, "withdrawn");
  assert.equal(got.statement, "They act together, through E3.");
  assert.deepEqual(got.about, { from: E1, to: E3 });
  assert.deepEqual(got.history.map((x) => [x.act, x.by, x.reason ?? null]),
    [["hold", ANN, null], ["revise", ANN, "A new filing."], ["revise", ANN, "Same words, noted."], ["withdraw", ANN, "The filing was misread."]]);
  assert.deepEqual(got.history.map((x) => x.statement ?? null),
    ["They act together.", "They act together, through E3.", "They act together, through E3.", null], "each statement as it was then");
  assert.ok(got.history.every((x, i, a) => typeof x.at === "string" && (i === 0 || a[i - 1].at <= x.at)));
  assert.deepEqual(w.h.hypothesesOf({ inquiry: INQ, viewer: ANN }).hypotheses[0].history, got.history, "the list shows it too");
});

test("R3 every read answers a hypothesis labelled as one, the member's, never a fact, with no grade; one in an inquiry the viewer may not see answers exactly as an absent one and is counted nowhere", () => {
  const w = world();
  w.bundle(INQ);
  const hiddenInq = w.fenced("INQ-2026-0009-hidden");
  const open = w.hold();
  const fenced = w.hold({ inquiry: hiddenInq });
  for (const view of [w.h.read({ hypothesisId: open, viewer: ANN }).hypothesis, ...w.h.hypothesesOf({ inquiry: INQ, viewer: OUTSIDER }).hypotheses]) {
    assert.equal(view.label, "hypothesis");
    assert.equal(view.fact, false);
    assert.equal(view.grade, null);
    assert.equal(view.held_by, ANN);
    assert.ok(!("assertion" in view) && !("strength" in view));
  }
  /* the participant sees the fenced one; the outsider gets the absent answer, word for word */
  assert.equal(w.h.read({ hypothesisId: fenced, viewer: ANN }).ok, true);
  const hidden = w.h.read({ hypothesisId: fenced, viewer: OUTSIDER });
  const absent = w.h.read({ hypothesisId: "HYP-2026-0404", viewer: OUTSIDER });
  assert.deepEqual({ ...hidden, hypothesis_id: null }, { ...absent, hypothesis_id: null });
  assert.equal(hidden.reason, "NO_SUCH_HYPOTHESIS");
  const hiddenList = w.h.hypothesesOf({ inquiry: hiddenInq, viewer: OUTSIDER });
  const absentList = w.h.hypothesesOf({ inquiry: "INQ-2026-0404-none", viewer: OUTSIDER });
  assert.deepEqual({ ...hiddenList, inquiry: null }, { ...absentList, inquiry: null });
  assert.equal(hiddenList.reason, "NO_SUCH_BUNDLE");
  /* counted nowhere: the open inquiry's list and the hops hold only its own */
  assert.deepEqual(w.h.hypothesesOf({ inquiry: INQ, viewer: OUTSIDER }).hypotheses.map((x) => x.hypothesis_id), [open]);
  assert.deepEqual(w.h.neighbours({ node: E1, viewer: OUTSIDER, scope: hiddenInq }), { items: [] });
  /* an absent viewer reads nothing */
  assert.equal(w.h.read({ hypothesisId: open, viewer: null }).reason, "NO_SUCH_HYPOTHESIS");
  assert.equal(w.h.hypothesesOf({ inquiry: INQ, viewer: undefined }).reason, "NO_SUCH_BUNDLE");
});
