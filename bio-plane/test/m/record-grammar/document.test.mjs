/* record-grammar at its interface: the document grammar moved at T19 (draft-T19): the heading sets, the state
   machines, the type-keyed vocabulary lookup, the case-member predicate, the section slicer and the inquiry title rule,
   each pinned whole as the catalogue held it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { HEADINGS, HEADINGS_WHEN, STATES, vocabFor, isCaseMemberBytes, sectionText, INQUIRY_TITLE_MAX, deriveInquiryTitle,
  inquiryQuestionOf, OBJECT_TYPES, normalizeType } from "../../../src/record-grammar/index.mjs";

const FOCUS_HEADINGS = ["## Statement", "## Why It Matters", "## Open Questions", "## Session Log", "## Review Notes"];

test("HEADINGS: the literal heading set per type; problem is the same array as focus", () => {
  assert.deepEqual({ ...HEADINGS }, {
    information: ["## Summary", "## Provenance Notes", "## Session Log", "## Review Notes"],
    inquiry: ["## Question", "## What It Rests On", "## Conclusion", "## What Would Falsify This", "## Session Log", "## Review Notes"],
    focus: FOCUS_HEADINGS,
    project: ["## Thesis Summary", "## Open Questions", "## Ruled Out", "## Session Log", "## Review Notes"],
    action: ["## Plan", "## Status", "## Correspondence", "## Session Log", "## Review Notes"],
    bias: ["## Statements", "## Adoption", "## What This Does Not Enforce", "## Session Log", "## Review Notes"],
    problem: FOCUS_HEADINGS });
  assert.ok(HEADINGS.problem === HEADINGS.focus);
});

test("HEADINGS_WHEN: the inquiry's exclusion heading, owed by a case member; none for the legacy spellings", () => {
  assert.deepEqual({ ...HEADINGS_WHEN }, { inquiry: [{ heading: "## What This Excludes", whenCaseMember: true }], problem: [], focus: [] });
  assert.ok(HEADINGS_WHEN.problem === HEADINGS_WHEN.focus);
});

const M = (legal, edges, legacy) => (legacy ? { legal, legacy, edges } : { legal, edges });
const FOCUS = M(["surfaced", "elevated", "deferred", "dismissed"], { surfaced: ["elevated", "deferred", "dismissed"],
  deferred: ["surfaced", "elevated", "dismissed"], dismissed: ["surfaced", "elevated", "deferred"], elevated: [] });
const ONE = M(["recorded"], { recorded: [] });

test("STATES: every type's legal states and edges, inquiry's legacy `published`, and problem the same machine as focus", () => {
  assert.deepEqual({ ...STATES }, {
    information: M(["collected", "verified", "retired"], { collected: ["verified"], verified: ["retired"], retired: [] }),
    inquiry: M(["open", "deferred", "dismissed", "surfaced", "concluded", "divided"], {
      open: ["deferred", "dismissed", "concluded", "divided"], surfaced: ["deferred", "dismissed", "concluded", "divided"],
      deferred: ["open", "surfaced", "dismissed"], dismissed: ["open", "surfaced", "deferred"],
      concluded: ["open", "surfaced", "deferred", "dismissed", "divided"], published: ["open", "surfaced"], divided: [] }, ["published"]),
    focus: FOCUS,
    project: M(["forming", "investigating", "matured", "closed"], { forming: ["investigating", "closed"],
      investigating: ["matured", "closed"], matured: ["closed"], closed: ["investigating"] }),
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
  /* Every canonical type has a machine, every edge lands on a state its machine reads, and nothing enters a legacy state. */
  for (const t of new Set(Object.values(OBJECT_TYPES))) assert.ok(STATES[t], t);
  for (const [t, m] of Object.entries(STATES)) {
    const readable = [...m.legal, ...(m.legacy || [])];
    assert.deepEqual(Object.keys(m.edges).sort(), [...readable].sort(), t);
    for (const to of Object.values(m.edges).flat()) assert.ok(m.legal.includes(to), `${t} -> ${to}`);
  }
  assert.equal(STATES.inquiry.legal[0], "open");
});

test("vocabFor: the declared spelling first, then the normalized type, else undefined", () => {
  assert.ok(vocabFor(STATES, "problem") === STATES.focus);
  assert.ok(vocabFor(HEADINGS, "focus") === HEADINGS.focus);
  assert.ok(vocabFor(STATES, "inquiry") === STATES.inquiry);
  const t = { inquiry: 1, x: 0 };
  assert.equal(vocabFor(t, "problem"), 1);
  assert.equal(vocabFor(t, "focus"), 1);
  assert.equal(vocabFor(t, "x"), 0);
  for (const odd of ["memo", undefined, null, "constructor"]) assert.equal(vocabFor({ inquiry: 1 }, odd), ({ inquiry: 1 })[normalizeType(odd)]);
});

test("isCaseMemberBytes: a frozen array of at least two axis objects; fails closed on any other shape", () => {
  const ax = (a) => ({ axis: a });
  assert.equal(isCaseMemberBytes({ published_strength: [ax("capture"), ax("connection")] }), true);
  assert.equal(isCaseMemberBytes({ published_strength: [ax("capture"), ax("connection"), ax("testimony")] }), true);
  assert.equal(isCaseMemberBytes({ published_strength: [ax("x"), ax("y")] }), true);
  for (const fm of [undefined, null, {}, { published_strength: [] }, { published_strength: [ax("capture")] },
    { published_strength: "two" }, { published_strength: [ax("a"), null] }, { published_strength: [ax("a"), { axis: 1 }] },
    { published_strength: [ax("a"), "b"] }]) assert.equal(isCaseMemberBytes(fm), false, JSON.stringify(fm));
});

test("sectionText: from the heading to the next `## ` line or the end; null when the heading is absent", () => {
  const body = "## A\na1\n### sub\n## B\nb1\n## C";
  assert.equal(sectionText(body, "## A"), "## A\na1\n### sub");
  assert.equal(sectionText(body, "## B"), "## B\nb1");
  assert.equal(sectionText(body, "## C"), "## C");
  assert.equal(sectionText(body, "## D"), null);
  assert.equal(sectionText("", "## A"), null);
});

test("deriveInquiryTitle: the first non-empty line, whitespace collapsed, cut at a word boundary before 120 with an ellipsis", () => {
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

test("inquiryQuestionOf: the `## Question` section's text, or '' when the document has none", () => {
  assert.equal(inquiryQuestionOf("## Question\nWhy?\n## What It Rests On\nx"), "Why?");
  assert.equal(inquiryQuestionOf("intro\n## Question  \nline 1\nline 2\n"), "line 1\nline 2\n");
  assert.equal(inquiryQuestionOf("## Question\nonly"), "only");
  for (const v of [undefined, null, "", "## Statement\nx", "## Questions\nx"]) assert.equal(inquiryQuestionOf(v), "");
  assert.equal(deriveInquiryTitle(inquiryQuestionOf("## Question\n  What  happened?\nDetail.\n## B")), "What happened?");
});
