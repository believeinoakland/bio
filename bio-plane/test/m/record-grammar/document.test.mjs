/* record-grammar at its interface: the document grammar moved at T19 (R30–R36): the heading sets, the state
   machines, the type-keyed vocabulary lookup, the case-member predicate, the section slicer and the inquiry title rule,
   each pinned whole as the catalogue held it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { HEADINGS, HEADINGS_WHEN, STATES, vocabFor, isCaseMemberBytes, sectionText, INQUIRY_TITLE_MAX, deriveInquiryTitle,
  inquiryQuestionOf, OBJECT_TYPES, normalizeType } from "../../../src/record-grammar/index.mjs";

const FOCUS_HEADINGS = ["## Statement", "## Why It Matters", "## Open Questions", "## Session Log", "## Review Notes"];

test("R32 HEADINGS: the literal heading set per type; problem is the same array as focus", () => {
  assert.deepEqual({ ...HEADINGS }, {
    information: ["## Summary", "## Provenance Notes", "## Session Log", "## Review Notes"],
    inquiry: ["## Question", "## What It Rests On", "## Conclusion", "## What Would Falsify This", "## Session Log", "## Review Notes"],
    focus: FOCUS_HEADINGS,
    project: ["## Thesis Summary", "## Open Questions", "## Ruled Out", "## Session Log", "## Review Notes"],
    action: ["## Plan", "## Status", "## Correspondence", "## Session Log", "## Review Notes"],
    bias: ["## Statements", "## Adoption", "## What This Does Not Enforce", "## Session Log", "## Review Notes"],
    problem: FOCUS_HEADINGS });
  assert.ok(HEADINGS.problem === HEADINGS.focus);
  assert.ok(!Object.isFrozen(HEADINGS));
});

test("R33 HEADINGS_WHEN: the inquiry's exclusion heading, owed by a case member; none for the legacy spellings", () => {
  assert.deepEqual({ ...HEADINGS_WHEN }, { inquiry: [{ heading: "## What This Excludes", whenCaseMember: true }], problem: [], focus: [] });
  assert.ok(HEADINGS_WHEN.problem === HEADINGS_WHEN.focus);
  assert.ok(!Object.isFrozen(HEADINGS_WHEN));
});

const M = (legal, edges, legacy) => (legacy ? { legal, legacy, edges } : { legal, edges });
const FOCUS = M(["surfaced", "elevated", "deferred", "dismissed"], { surfaced: ["elevated", "deferred", "dismissed"],
  deferred: ["surfaced", "elevated", "dismissed"], dismissed: ["surfaced", "elevated", "deferred"], elevated: [] });
const ONE = M(["recorded"], { recorded: [] });

test("R35 STATES: every type's legal states and edges, inquiry's legacy `published`, project's legacy `investigating` and `matured`, and problem the same machine as focus", () => {
  assert.deepEqual({ ...STATES }, {
    information: M(["collected", "verified", "retired"], { collected: ["verified"], verified: ["retired"], retired: [] }),
    inquiry: M(["open", "deferred", "dismissed", "surfaced", "concluded", "divided"], {
      open: ["deferred", "dismissed", "concluded", "divided"], surfaced: ["deferred", "dismissed", "concluded", "divided"],
      deferred: ["open", "surfaced", "dismissed"], dismissed: ["open", "surfaced", "deferred"],
      concluded: ["open", "surfaced", "deferred", "dismissed", "divided"], published: ["open", "surfaced"], divided: [] }, ["published"]),
    focus: FOCUS,
    project: M(["forming", "closed"], { forming: ["closed"], investigating: ["closed"], matured: ["closed"], closed: ["forming"] },
      ["investigating", "matured"]),
    action: M(["planned", "active", "awaiting_response", "resolved", "abandoned"], { planned: ["active", "abandoned"],
      active: ["awaiting_response", "resolved", "abandoned"], awaiting_response: ["active", "resolved", "abandoned"],
      resolved: [], abandoned: [] }),
    bias: M(["draft", "proposed", "adopted", "retired"], { draft: ["proposed", "retired"], proposed: ["draft", "adopted", "retired"],
      adopted: ["retired"], retired: [] }),
    standard: ONE, determination: ONE, consequence: ONE,
    escalation: M(["open", "suspended", "ended"], { open: ["suspended", "ended"], suspended: ["open", "ended"], ended: [] }),
    aspiration: M(["held", "retired"], { held: ["retired"], retired: [] }),
    goal: M(["open", "closed"], { open: ["closed"], closed: [] }),
    action_plan: M(["open", "closed"], { open: ["closed"], closed: [] }),
    problem: FOCUS });
  assert.ok(STATES.problem === STATES.focus);
  assert.ok(!Object.isFrozen(STATES));
  /* Every bundle type has a machine, every edge lands on a state its machine reads, and nothing enters a legacy state.
     T33's new objects are table rows, not bundles, and have none (R3). */
  const BUNDLE = ["INFO", "PROB", "FOCUS", "INQ", "PROJ", "ACTN", "BIAS", "STD", "CONF", "CONS", "ESC", "ASP", "GOAL", "PLN"];
  for (const t of new Set(BUNDLE.map((p) => OBJECT_TYPES[p]))) assert.ok(STATES[t], t);
  for (const [p, t] of Object.entries(OBJECT_TYPES)) if (!BUNDLE.includes(p)) assert.ok(!(t in STATES) && !(t in HEADINGS), t);
  for (const [t, m] of Object.entries(STATES)) {
    const readable = [...m.legal, ...(m.legacy || [])];
    assert.deepEqual(Object.keys(m.edges).sort(), [...readable].sort(), t);
    for (const to of Object.values(m.edges).flat()) assert.ok(m.legal.includes(to), `${t} -> ${to}`);
  }
  assert.equal(STATES.inquiry.legal[0], "open");
  assert.equal(STATES.project.legal[0], "forming");
  /* Only inquiry and project carry `legacy` (K904, form (b)). */
  assert.deepEqual(Object.keys(STATES).filter((t) => "legacy" in STATES[t]), ["inquiry", "project"]);
});

test("R34 vocabFor: the declared spelling first, then the normalized type, else undefined", () => {
  assert.ok(vocabFor(STATES, "problem") === STATES.focus);
  assert.ok(vocabFor(HEADINGS, "focus") === HEADINGS.focus);
  assert.ok(vocabFor(STATES, "inquiry") === STATES.inquiry);
  const t = { inquiry: 1, x: 0 };
  assert.equal(vocabFor(t, "problem"), 1);
  assert.equal(vocabFor(t, "focus"), 1);
  assert.equal(vocabFor(t, "x"), 0);
  for (const odd of ["memo", undefined, null]) assert.equal(vocabFor({ inquiry: 1 }, odd), undefined);
  /* An inherited key is `table[t]` too, and only a missing table throws. */
  assert.ok(vocabFor({}, "constructor") === Object);
  assert.ok(vocabFor(STATES, "toString") === Object.prototype.toString);
  for (const t of [null, undefined]) assert.throws(() => vocabFor(t, "inquiry"), TypeError);
});

test("R33 isCaseMemberBytes: a frozen array of at least two axis objects; fails closed on any other shape", () => {
  const ax = (a) => ({ axis: a });
  assert.equal(isCaseMemberBytes({ published_strength: [ax("capture"), ax("connection")] }), true);
  assert.equal(isCaseMemberBytes({ published_strength: [ax("capture"), ax("connection"), ax("testimony")] }), true);
  assert.equal(isCaseMemberBytes({ published_strength: [ax("x"), ax("y")] }), true);
  for (const fm of [undefined, null, {}, { published_strength: [] }, { published_strength: [null, ax("a")] }, { published_strength: [ax("capture")] },
    { published_strength: "two" }, { published_strength: [ax("a"), null] }, { published_strength: [ax("a"), { axis: 1 }] },
    { published_strength: [ax("a"), "b"] }]) assert.equal(isCaseMemberBytes(fm), false, JSON.stringify(fm));
});

test("R36 sectionText: from the heading to the next `## ` line or the end; null when the heading is absent", () => {
  const body = "## A\na1\n### sub\n## B\nb1\n## C";
  assert.equal(sectionText(body, "## A"), "## A\na1\n### sub");
  assert.equal(sectionText(body, "## B"), "## B\nb1");
  assert.equal(sectionText(body, "## C"), "## C");
  assert.equal(sectionText(body, "## D"), null);
  assert.equal(sectionText("", "## A"), null);
  assert.equal(sectionText("x ## A\n## B", "## A"), "## A");
  assert.equal(sectionText("## A\n## A2\n## B", "## A"), "## A");
  for (const b of [undefined, null, 1, {}]) assert.throws(() => sectionText(b, "## A"), TypeError);
});

test("R30 deriveInquiryTitle: the first non-empty line, whitespace collapsed, cut at a word boundary before 120 with an ellipsis", () => {
  assert.equal(INQUIRY_TITLE_MAX, 120);
  assert.equal(deriveInquiryTitle("  Why   is it\tso?  \nmore"), "Why is it so?");
  assert.equal(deriveInquiryTitle("\n \n second"), "second");
  for (const v of [undefined, null, "", "  \n\t"]) assert.equal(deriveInquiryTitle(v), null);
  assert.equal(deriveInquiryTitle(12), "12");
  const exact = "a".repeat(120);
  assert.equal(deriveInquiryTitle(exact), exact);
  const words = Array.from({ length: 40 }, (_, i) => `w${i}`).join(" ");
  const cut = words.slice(0, 120);
  assert.equal(deriveInquiryTitle(words), cut.slice(0, cut.lastIndexOf(" ")) + "…");
  assert.equal(deriveInquiryTitle("b".repeat(130)), "b".repeat(120) + "…");
  for (let n = 100; n < 140; n++) {
    const t = deriveInquiryTitle(("xy ").repeat(n));
    assert.ok(t.length <= 121 && (t.length <= 120 || t.endsWith("…")), String(n));
  }
});

test("R31 inquiryQuestionOf: the `## Question` section's text, or '' when the document has none", () => {
  assert.equal(inquiryQuestionOf("## Question\nWhy?\n## What It Rests On\nx"), "Why?");
  assert.equal(inquiryQuestionOf("intro\n## Question  \nline 1\nline 2\n"), "line 1\nline 2\n");
  assert.equal(inquiryQuestionOf("## Question\nonly"), "only");
  for (const v of [undefined, null, "", "## Statement\nx", "## Questions\nx"]) assert.equal(inquiryQuestionOf(v), "");
  assert.equal(deriveInquiryTitle(inquiryQuestionOf("## Question\n  What  happened?\nDetail.\n## B")), "What happened?");
});

test("R30 deriveInquiryTitle is closure-free: its source text, evaluated alone, gives the same answers", () => {
  const alone = (0, eval)(`(${deriveInquiryTitle.toString()})`);
  const inputs = [undefined, null, "", " \n ", "Why?", "  a \t b \n c", "x".repeat(130), ("word ").repeat(40), 7, true,
    { toString: () => "  from an object  " }, "\n\nthird line first"];
  for (const v of inputs) assert.equal(alone(v), deriveInquiryTitle(v), String(v));
});

test("R30 R31 never throw, whatever they are handed that String() accepts", () => {
  for (const v of [undefined, null, 0, NaN, [], [1, 2], {}, Symbol.iterator.description, "## Question\n\n## B"]) {
    assert.doesNotThrow(() => deriveInquiryTitle(v));
    assert.doesNotThrow(() => inquiryQuestionOf(v));
  }
  assert.equal(inquiryQuestionOf("## Question\t \nq"), "q");
  assert.equal(inquiryQuestionOf("## Question x\nq"), "");
});
