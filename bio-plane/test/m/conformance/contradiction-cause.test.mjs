/* conformance, N345: a comparison started from a contradiction (R12's link, R21's facts), a cause recorded only when
   evidenced and no recommendation in a determination (R22, with R1's order), and the read's cause and `outcomes_differ`
   (R9). Every test drives `conformance` at its interface over the real modules it uses (./fixture.mjs); a contradiction
   is formed, proposed and taken up through contradiction's own doors (`w.contradicted`). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { scene, V, MACHINE, F, DOC } from "./fixture.mjs";
import { Conformance, CONFORMANCE_CHECKS, CAUSE_MAX, CAUSE_NOT_ESTABLISHED, RECOMMENDATION_KEYS, FACTS_SAY,
         OUTCOMES_DIFFER_SAYS, LIMITS } from "../../../src/conformance/index.mjs";

const refused = (r, code) => {
  assert.equal(r.ok, false, `expected ${code}, got ${JSON.stringify(r).slice(0, 300)}`);
  assert.equal(r.reason, code, JSON.stringify(r).slice(0, 300));
  if (CONFORMANCE_CHECKS[code])
    assert.deepEqual([r.code, r.check, r.translation], [code, CONFORMANCE_CHECKS[code].check,
      CONFORMANCE_CHECKS[code].translation]);
};
const nothing = (w, fn) => { const before = w.snapshot(); const r = fn(); assert.deepEqual(w.snapshot(), before, "nothing written"); return r; };
/* Every key of an answer, at any depth. */
const keysOf = (v, out = new Set()) => {
  if (Array.isArray(v)) v.forEach((x) => keysOf(x, out));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) { out.add(k.toLowerCase()); keysOf(x, out); }
  return out;
};
/* A Conformance over the scene's modules with some replaced (a sight rule, a contradiction read), for the arms the real
   rules do not reach in one group (membership R43 shows every non-project bundle to a member). It reads and refuses;
   it does not write a determination, whose promotion step is the scene's own instance's (R13). */
const over = (w, deps) => new Conformance({ storage: w.st, record: w.record, membership: w.membership,
  promotion: w.promotion, host: w.host, content: w.content, inquiry: w.k, strength: w.strength,
  reevaluation: w.reevaluation, publication: w.publication, standards: w.standards, contradiction: w.contradiction,
  now: () => w.clock.now, ...deps });
const withholding = (w, hidden) => new Proxy(w.membership, { get: (t, p) => (p === "inSight"
  ? (id, viewer) => (hidden(id, viewer) ? false : t.inSight(id, viewer))
  : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });

test("R1 R22: R22's refusals follow SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT in R1's order (CAUSE_UNSTATED, CAUSE_NOT_EVIDENCED, RECOMMENDATION_IS_AN_ACTION), each asked only once the ones before it pass, and nothing is written by any", () => {
  const { w, ev, input } = scene();
  let cur = input({ score: 1, cause: { statement: " ", evidence: [] }, recommendation: "reopen the playground",
                    proposal: "CMP-2026-0099" });
  const steps = [
    ["SIGNIFICANCE_IS_A_MEMBERS_JUDGMENT", (x) => { const { score: _s, ...rest } = x; return rest; }],
    ["CAUSE_UNSTATED", (x) => ({ ...x, cause: { statement: "The notice rule was not in the department's checklist.", evidence: [] } })],
    ["CAUSE_NOT_EVIDENCED", (x) => ({ ...x, cause: { ...x.cause, evidence: [ev.content] } })],
    ["RECOMMENDATION_IS_AN_ACTION", (x) => { const { recommendation: _r, ...rest } = x; return rest; }],
    ["NO_SUCH_COMPARISON", (x) => { const { proposal: _p, ...rest } = x; return rest; }],
  ];
  for (const [code, mend] of steps) {
    refused(nothing(w, () => w.c.determine(cur)), code);
    cur = mend(cur);
  }
  const ok = w.c.determine(cur);
  assert.equal(ok.ok, true, JSON.stringify(ok).slice(0, 300));
  assert.equal(ok.cause.statement, "The notice rule was not in the department's checklist.");
  /* a cause is optional: absent or null is no cause, and no refusal (the negative control) */
  for (const cause of [undefined, null]) assert.equal(w.c.determine(input({ cause })).ok, true);
  /* the rows are this module's (C-113.24–C-113.27), each its own number */
  assert.deepEqual(["NO_SUCH_CONTRADICTION_INQUIRY", "CAUSE_NOT_EVIDENCED", "CAUSE_UNSTATED", "RECOMMENDATION_IS_AN_ACTION"]
    .map((k) => CONFORMANCE_CHECKS[k].check), ["C-113.24", "C-113.25", "C-113.26", "C-113.27"]);
});

test("R22: CAUSE_UNSTATED for a statement blank, not text, absent or over 2,000 characters; at the bound it is accepted", () => {
  const { w, ev, input } = scene();
  const evidence = [ev.content];
  for (const cause of [{ statement: "", evidence }, { statement: "   ", evidence }, { statement: 42, evidence },
                       { statement: ["why"], evidence }, { evidence }, "the budget", 7, [],
                       { statement: "x".repeat(CAUSE_MAX + 1), evidence }]) {
    const r = nothing(w, () => w.c.determine(input({ cause })));
    refused(r, "CAUSE_UNSTATED");
    assert.equal(r.max, CAUSE_MAX);
  }
  assert.equal(CAUSE_MAX, 2000);
  const at = w.c.determine(input({ cause: { statement: "y".repeat(CAUSE_MAX), evidence } }));
  assert.deepEqual([at.ok, at.cause.statement.length], [true, CAUSE_MAX]);
});

test("R22: CAUSE_NOT_EVIDENCED for no evidence, a blank id, content the record does not hold, or content the author may not see; a hypothesized cause never enters the determination", () => {
  const { w, ev, input } = scene();
  const statement = "The department's checklist omits the notice rule.";
  for (const evidence of [undefined, null, [], "", [""], ["  "], [ev.content, ""], ["f".repeat(64)], [ev.content, "f".repeat(64)]]) {
    const r = nothing(w, () => w.c.determine(input({ cause: { statement, evidence } })));
    refused(r, "CAUSE_NOT_EVIDENCED");
  }
  assert.deepEqual(w.c.determine(input({ cause: { statement, evidence: ["f".repeat(64)] } })).unresolved, ["f".repeat(64)]);
  /* content in a bundle the author may not see, answered as content not held: one answer */
  const hidden = w.evidence("INFO-2026-0700-hidden");
  const c = over(w, { membership: withholding(w, (id, viewer) => id === hidden.doc && viewer === V("olive")) });
  const unseen = nothing(w, () => c.determine(input({ cause: { statement, evidence: [hidden.content] } })));
  refused(unseen, "CAUSE_NOT_EVIDENCED");
  assert.deepEqual(unseen.unresolved, [hidden.content]);
  /* the control: under the real sight rule olive may see it, so the same cause is recorded */
  const seen = w.c.determine(input({ cause: { statement, evidence: [hidden.content] } }));
  assert.deepEqual([seen.ok, seen.cause && seen.cause.evidence], [true, [hidden.content]]);
  /* a single id is a list of one; the evidence is bounded like the act's (R18), naming the cause */
  assert.deepEqual(w.c.determine(input({ cause: { statement, evidence: ev.content } })).cause.evidence, [ev.content]);
  const big = nothing(w, () => w.c.determine(input({ cause: { statement, evidence: Array(LIMITS.evidence + 1).fill(ev.content) } })));
  refused(big, "DETERMINATION_TOO_LARGE");
  assert.deepEqual([big.part, big.max, big.of], ["evidence", LIMITS.evidence, "cause"]);
  assert.equal(w.c.determine(input({ cause: { statement, evidence: Array(LIMITS.evidence).fill(ev.content) } })).ok, true);
  /* a refused cause wrote no row; the determinations recorded carry only the evidenced causes */
  assert.ok(w.rows(`SELECT evidence FROM determination_causes`).every((r) => JSON.parse(r.evidence).length >= 1));
});

test("R22: a determination carrying recommendation or policy, at any depth and in any case, is RECOMMENDATION_IS_AN_ACTION, and writes nothing", () => {
  const { w, ev, input } = scene();
  assert.deepEqual(RECOMMENDATION_KEYS, ["recommendation", "policy"]);
  const cause = { statement: "The rule was not on the checklist.", evidence: [ev.content] };
  for (const key of RECOMMENDATION_KEYS) {
    const base = input();
    for (const inp of [{ ...base, [key]: "post notice next time" }, { ...base, [key.toUpperCase()]: "x" },
                       { ...base, act: { ...base.act, [key]: "x" } }, { ...base, rows: [{ ...base.rows[0], [key]: "x" }] },
                       { ...base, standards: [{ ...base.standards[0], [key]: "x" }] },
                       { ...base, cause: { ...cause, [key]: "x" } }, { ...base, questions: [{ question: "Q?", meta: { [key]: 1 } }] }]) {
      const r = nothing(w, () => w.c.determine(inp));
      refused(r, "RECOMMENDATION_IS_AN_ACTION");
      assert.ok(r.keys.length >= 1);
    }
  }
  /* the words themselves in a row are the member's and pass (only the key is refused) */
  assert.equal(w.c.determine(input({ rows: [{ ...input().rows[0], did: "closed with no notice; no policy was cited" }] })).ok, true);
  /* no answer carries one */
  const ok = w.c.determine(input({ cause }));
  for (const a of [ok, w.c.determinationRead({ id: ok.id, viewer: V("pat") })])
    for (const k of RECOMMENDATION_KEYS) assert.equal(keysOf(a).has(k), false, k);
});

test("R9 R22: determinationRead answers the cause with its evidence, or cause null with \"cause not established\"; the document states it; evidence the viewer may not see is null", () => {
  const { w, ev, input } = scene();
  const second = w.evidence("INFO-2026-0710-memo");
  const cause = { statement: "The department's closure checklist omits the notice rule.", evidence: [ev.content, second.content] };
  const d = w.c.determine(input({ cause }));
  const r = w.c.determinationRead({ id: d.id, viewer: V("pat") });
  assert.deepEqual([r.cause, r.cause_says], [cause, null]);
  assert.deepEqual(d.cause, cause, "the act answers the read");
  assert.match(w.text(d.id), /## Cause\n\nThe department's closure checklist omits the notice rule\.\n\nShown by: /);
  const none = w.c.determine(input());
  const n = w.c.determinationRead({ id: none.id, viewer: V("pat") });
  assert.deepEqual([n.cause, n.cause_says], [null, CAUSE_NOT_ESTABLISHED]);
  assert.equal(CAUSE_NOT_ESTABLISHED, "cause not established");
  assert.match(w.text(none.id), /## Cause\n\nCause not established\./);
  /* evidence a viewer may not see is null in their read; the statement stays */
  const c = over(w, { membership: withholding(w, (id, viewer) => id === second.doc && viewer === V("pat")) });
  assert.deepEqual(c.determinationRead({ id: d.id, viewer: V("pat") }).cause,
                   { statement: cause.statement, evidence: [ev.content, null] });
  assert.deepEqual(c.determinationRead({ id: d.id, viewer: V("olive") }).cause, cause);
  /* R5: the cause is read the same for a compliant determination */
  const comp = w.c.determine(input({ standards: [{ standard: input().standards[0].standard, outcome: "compliant" }],
                                     rows: [{ ...input().rows[0], reading: "aligns" }], cause }));
  assert.deepEqual(w.c.determinationRead({ id: comp.id, viewer: V("pat") }).cause, cause);
});

test("R9 R4: outcomes_differ is true, with its statement and no duty, when the per-standard outcomes are not all the same; false when they are", () => {
  const { w, std, input } = scene();
  const second = w.standard("Parks Code 12.08.040", { period: { from: "2020-01-01", to: "2030-12-31" } });
  const rows = [input().rows[0], { standard: second, requires: "a posted sign", did: "a sign was posted", reading: "aligns" }];
  const mixed = w.c.determine(input({ rows, standards: [{ standard: std, outcome: "noncompliant" }, { standard: second, outcome: "compliant" }] }));
  assert.equal(mixed.ok, true, JSON.stringify(mixed).slice(0, 300));
  const r = w.c.determinationRead({ id: mixed.id, viewer: V("pat") });
  assert.deepEqual([r.outcomes_differ, r.outcomes_differ_says], [true, OUTCOMES_DIFFER_SAYS]);
  /* a statement only: each outcome stands as the member gave it, never composed */
  assert.deepEqual(r.outcomes.map((o) => o.outcome), ["noncompliant", "compliant"]);
  for (const k of ["outcome", "verdict", "overall"]) assert.equal(k in r, false, k);
  const same = w.c.determine(input({ rows, standards: [{ standard: std, outcome: "noncompliant" }, { standard: second, outcome: "noncompliant" }] }));
  assert.deepEqual([same.outcomes_differ, same.outcomes_differ_says], [false, null]);
  const unclear = w.c.determine(input({ rows, questions: [{ question: "Q?" }],
    standards: [{ standard: std, outcome: "unclear" }, { standard: second, outcome: "compliant" }] }));
  assert.equal(unclear.outcomes_differ, true);
  assert.equal(w.c.determine(input()).outcomes_differ, false, "one standard");
});

test("R12: a comparison may name the contradiction inquiry it came from; the proposal records the link and still carries no outcome; an absent, invisible or plain inquiry is NO_SUCH_CONTRADICTION_INQUIRY, one answer", () => {
  const { w, proj, std, input } = scene();
  const x = w.contradicted();
  const base = { project: proj, standards: [std], rows: input().rows, proposer: MACHINE, viewer: MACHINE };
  const p = w.c.comparisonPropose({ ...base, contradiction: x.inquiry });
  assert.equal(p.ok, true, JSON.stringify(p).slice(0, 300));
  assert.equal(p.proposal.contradiction, x.inquiry);
  assert.equal(w.c.comparisonRead({ id: p.proposal.id, viewer: V("pat") }).proposal.contradiction, x.inquiry);
  assert.equal(keysOf(p).has("outcome") || keysOf(p).has("outcomes"), false);
  assert.equal(w.c.comparisonPropose(base).proposal.contradiction, null, "one naming none links none");
  const hidden = over(w, { membership: withholding(w, (id, viewer) => id === x.inquiry && viewer === V("pat")) });
  const answers = [];
  for (const [c, contradiction, viewer] of [[w.c, "INQ-2026-0999-none", V("pat")], [w.c, F, V("pat")], [w.c, DOC, V("pat")],
                                            [w.c, "", V("pat")], [w.c, 42, V("pat")], [hidden, x.inquiry, V("pat")]]) {
    const r = nothing(w, () => c.comparisonPropose({ ...base, proposer: viewer, viewer, contradiction }));
    refused(r, "NO_SUCH_CONTRADICTION_INQUIRY");
    answers.push({ ...r, contradiction: null });
  }
  for (const a of answers) assert.deepEqual(a, answers[0], "absent, invisible and plain alike");
  /* the proposal's link reads null to a viewer who may not see the inquiry */
  assert.equal(hidden.comparisonRead({ id: p.proposal.id, viewer: V("pat") }).proposal.contradiction, null);
  /* an outcome is refused first, the link notwithstanding (R12's order) */
  refused(w.c.comparisonPropose({ ...base, contradiction: x.inquiry, outcome: "noncompliant" }), "PROPOSAL_CANNOT_DETERMINE");
  /* a determination drawing on it records that, as any proposal (R18) */
  const d = w.c.determine(input({ proposal: p.proposal.id }));
  assert.deepEqual(w.c.comparisonRead({ id: p.proposal.id, viewer: V("pat") }).proposal.drawn_on_by, [{ determination: d.id, at: d.at }]);
});

test("R21: comparisonFacts answers requires from the side the member names and did from the other, each with its source, content id and date, labelled the record's and never an outcome; it writes nothing", () => {
  const { w } = scene();
  const x = w.contradicted();
  for (const side of ["a", "b"]) {
    const other = side === "a" ? "b" : "a";
    const before = w.snapshot();
    const f = w.c.comparisonFacts({ contradiction: x.inquiry, standardSide: side, viewer: V("pat") });
    assert.deepEqual(w.snapshot(), before, "a read writes nothing");
    assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
    assert.deepEqual([f.wrote, f.contradiction, f.candidate, f.standard_side, f.says],
                     [false, x.inquiry, x.candidate, side, FACTS_SAY]);
    assert.equal(f.rows.length, 1);
    const [row] = f.rows;
    assert.deepEqual([row.origin, row.machine_work], ["record", false]);
    for (const [part, s] of [["requires", x.sides[side]], ["did", x.sides[other]]]) {
      const fact = row[part];
      assert.deepEqual([fact.content_id, fact.date, fact.doctype, fact.capture_sha, fact.source],
                       [s.content_id, s.date, s.doctype, s.capture_sha, s.source], `${side}: ${part}`);
      assert.ok(fact.content_id && fact.date && fact.source && fact.source.bundle, part);
    }
    /* the rule's side states what is required when the member names it so; the act's what was done */
    const byDoc = { [x.rule.doc]: "rule", [x.act.doc]: "act" };
    assert.notEqual(byDoc[row.requires.source.bundle], byDoc[row.did.source.bundle]);
    /* never an outcome, never a reading: the comparison's reading is the member's */
    for (const k of ["outcome", "outcomes", "verdict", "reading", "compliant", "noncompliant"])
      assert.equal(keysOf(f).has(k), false, k);
    assert.deepEqual([f.resolution, f.concluded], [null, false]);
  }
  /* the facts start a comparison: its rows as the member words them, linked to the question */
  const f = w.c.comparisonFacts({ contradiction: x.inquiry, standardSide: x.sides.a.source.bundle === x.rule.doc ? "a" : "b",
                                  viewer: V("pat") });
  assert.equal(f.rows[0].requires.source.bundle, x.rule.doc);
});

test("R21: standardSide is named by the member and never defaulted; R12's refusal applies to an absent, invisible or plain inquiry, and to one whose candidate the viewer does not see whole", () => {
  const { w } = scene();
  const x = w.contradicted();
  for (const standardSide of [undefined, null, "", "A", "c", 1, ["a"]]) {
    const r = nothing(w, () => w.c.comparisonFacts({ contradiction: x.inquiry, standardSide, viewer: V("pat") }));
    refused(r, "STANDARD_SIDE_UNNAMED");
  }
  assert.equal(CONFORMANCE_CHECKS.STANDARD_SIDE_UNNAMED.check, "C-113.28");
  const halfSeen = over(w, { contradiction: new Proxy(w.contradiction, { get: (t, p) => (p === "candidatesFor"
    /* contradiction R10, R25: a candidate the viewer sees half is never answered by its candidates read */
    ? (a) => (a.viewer === V("quinn") ? { ok: true, candidates: [], empty: { level: "none_judged" } } : t.candidatesFor(a))
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) }) });
  const hidden = over(w, { membership: withholding(w, (id, viewer) => id === x.inquiry && viewer === V("quinn")) });
  const answers = [];
  for (const [c, contradiction, viewer] of [[w.c, "INQ-2026-0999-none", V("pat")], [w.c, F, V("pat")], [w.c, DOC, V("pat")],
                                            [w.c, null, V("pat")], [w.c, x.inquiry, "nobody"], [hidden, x.inquiry, V("quinn")],
                                            [halfSeen, x.inquiry, V("quinn")]]) {
    const r = nothing(w, () => c.comparisonFacts({ contradiction, standardSide: "a", viewer }));
    refused(r, "NO_SUCH_CONTRADICTION_INQUIRY");
    answers.push({ ...r, contradiction: null });
  }
  for (const a of answers) assert.deepEqual(a, answers[0], "one answer, which names no side");
  /* the inquiry is asked first: an unseen one with no side named answers as unseen */
  refused(w.c.comparisonFacts({ contradiction: "INQ-2026-0999-none", viewer: V("pat") }), "NO_SUCH_CONTRADICTION_INQUIRY");
  /* the controls: the same viewers see it through the real rules */
  assert.equal(halfSeen.comparisonFacts({ contradiction: x.inquiry, standardSide: "a", viewer: V("pat") }).ok, true);
  assert.equal(w.c.comparisonFacts({ contradiction: x.inquiry, standardSide: "a", viewer: V("quinn") }).ok, true);
});

test("R21: once the question is concluded, the facts carry its resolution, and still no outcome", () => {
  const { w } = scene();
  const x = w.contradicted();
  const r = w.contradiction.resolve({ inquiry: x.inquiry, resolution: { kind: "obligation_against_act" },
    conclusion: "The rule required notice, and the closure gave none.", falsifier: "a notice posted before the closure",
    viewer: V("olive"), author: V("olive") });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 400));
  const f = w.c.comparisonFacts({ contradiction: x.inquiry, standardSide: "a", viewer: V("pat") });
  assert.equal(f.ok, true, JSON.stringify(f).slice(0, 300));
  assert.deepEqual([f.concluded, f.resolution.kind], [true, "obligation_against_act"]);
  for (const k of ["outcome", "outcomes", "verdict", "reading"]) assert.equal(keysOf(f).has(k), false, k);
});

test("R21 (N362): each side's text is the passage's words as content.passageText answers them for its content id, null where it answers null (text not held whole, a stale row), a claim side's its claim; asked only of a side the viewer already sees", () => {
  const { w } = scene();
  const x = w.contradicted();
  const words = { [x.rule.doc]: "thirty days' public notice is required before a closure",
                  [x.act.doc]: "the playground was closed on 2 March with no notice" };
  const facts = (side = "a", c = w.c, viewer = V("pat")) =>
    c.comparisonFacts({ contradiction: x.inquiry, standardSide: side, viewer });
  for (const side of ["a", "b"]) {
    const [row] = facts(side).rows;
    for (const part of ["requires", "did"]) {
      const fact = row[part];
      assert.equal(fact.text, words[fact.source.bundle], `${side}: ${part}`);
      assert.equal(fact.text, w.content.passageText(fact.content_id), "content's R46, not a copy of it");
    }
  }
  /* null where passageText answers null, never an empty string or a guess: the act's passage held only to the per-unit
     cap, then the rule's row marked stale by a replaced reading (content R22) */
  const units = w.ex.units[x.act.cap.sha].units;
  units[1] = { ...units[1], truncated: true };
  let row = facts("a").rows[0];
  const byDoc = (b) => (row.requires.source.bundle === b ? row.requires : row.did);
  assert.deepEqual([w.content.passageText(x.act.content), byDoc(x.act.doc).text], [null, null]);
  assert.equal(byDoc(x.rule.doc).text, words[x.rule.doc], "the other side is unaffected");
  w.st.sql.exec(`UPDATE content SET stale=1 WHERE content_id=?`, x.rule.content);
  row = facts("a").rows[0];
  assert.deepEqual([w.content.passageText(x.rule.content), byDoc(x.rule.doc).text, byDoc(x.act.doc).text], [null, null, null]);
  for (const f of [row.requires, row.did]) assert.ok(f.content_id && f.source.bundle, "the side is still answered whole");
  /* only on a side R21 already answers: a refused read never asks for a passage's words */
  const asked = [];
  const counting = new Proxy(w.content, { get: (t, p) => (p === "passageText" ? (id) => { asked.push(id); return t.passageText(id); }
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) });
  const halfSeen = over(w, { content: counting, contradiction: new Proxy(w.contradiction, { get: (t, p) => (p === "candidatesFor"
    ? (a) => (a.viewer === V("quinn") ? { ok: true, candidates: [] } : t.candidatesFor(a))
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) }) });
  refused(facts("a", halfSeen, V("quinn")), "NO_SUCH_CONTRADICTION_INQUIRY");
  refused(halfSeen.comparisonFacts({ contradiction: x.inquiry, standardSide: "c", viewer: V("pat") }), "STANDARD_SIDE_UNNAMED");
  refused(facts("a", halfSeen, "nobody"), "NO_SUCH_CONTRADICTION_INQUIRY");
  assert.deepEqual(asked, []);
  /* the control: a side the viewer sees is asked, once per side */
  assert.equal(facts("a", halfSeen).ok, true);
  assert.deepEqual(asked.sort(), [x.act.content, x.rule.content].sort());
  /* a claim or stance side names no passage: its text is its claim as contradiction shows it, and no passage is asked */
  asked.length = 0;
  const claim = (s, claimText) => ({ kind: "claim", inquiry: `INQ-2026-0800-${s}`, version: "v1", claim: claimText,
                                     text: claimText, source: { inquiry: `INQ-2026-0800-${s}`, title: null },
                                     date: null, doctype: null, capture_sha: null });
  const claims = over(w, { content: counting, contradiction: new Proxy(w.contradiction, { get: (t, p) => (p === "candidatesFor"
    ? () => ({ ok: true, candidates: [{ candidate: x.candidate, a: claim("a", "Notice is owed."), b: claim("b", "None was given.") }] })
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) }) });
  const [c] = facts("a", claims).rows;
  assert.deepEqual([c.requires.text, c.did.text, c.requires.content_id, c.did.content_id],
                   ["Notice is owed.", "None was given.", null, null]);
  assert.deepEqual(asked, []);
  /* a passage read that fails is null, never an error */
  const failing = over(w, { content: new Proxy(w.content, { get: (t, p) => (p === "passageText" ? () => { throw new Error("boom"); }
    : typeof t[p] === "function" ? t[p].bind(t) : t[p]) }) });
  const f = facts("a", failing);
  assert.deepEqual([f.ok, f.rows[0].requires.text, f.rows[0].did.text], [true, null, null]);
});
