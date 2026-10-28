/* connections R73 (T51 fix round 10; K5297; ACTION-GRAMMAR #15 J8): no finding or repair a person reads names a field, a
   stored code or a decision id, and the rule is said in plain words. Driven at the interface: `themeLegFindings`, the only
   finding this module words, over its corpus of theme legs (a theme named bare, as a membership in one, by the target or
   by the content id, and by the two leg keys). The label is the plain one a caller hands in (R73). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { themeLegFindings } from "../../../src/connections/index.mjs";
import { localize } from "../../../src/setup-words/index.mjs";

const LABEL = "The basis leg";
const ID = "THEME-2026-0927-ab12cd";
const REFS = [ID, `${ID}#INFO-2026-0001-a`, `${ID}/x`, `${ID}:x`, `${ID}?x`];
const LEGS = [
  ...REFS.flatMap((ref) => [{ target: ref }, { content_id: ref }]),
  { theme: ID }, { theme: true }, { themes: [ID] }, { themes: "a" },
];
/* The two sentences the module says (the word table's), whichever subject the leg names. */
const SAYS = [
  ...["a THEME", "membership in a THEME"].map((subject) => localize("connections.checks.leg_names_theme", "{label} names {subject}, and a theme is never the basis of a claim: it is one member's declared lens for gathering material, not evidence, so no leg can rest on it or on membership in it", { label: LABEL, subject })),
  localize("connections.checks.leg_claims_through_theme", "{label} claims its support through a THEME, and membership in a theme is never a reason a leg counts: it rests on the document or passage it cites, or on nothing", { label: LABEL }),
];

/* What a person must never read: a field name in code form, a snake_case stored name, a DEC- or C- or D- id, a `kind:`
   value, or an internal document's file name or section mark. */
const NAMES = [
  /content_id|\.target\b|\.theme\b|\.themes\b|\btheme=|\btarget=/,
  /\b[a-z]+(?:_[a-z0-9]+)+\b/,
  /\b(?:DEC|C|D)-\d/,
  /\bkind:/,
  /\.md\b|§/,
];

test("R73 (T51 fix round 10): over every theme leg in the corpus, no finding or repair names a field, a stored code or a decision id, and the rule is said in plain words", () => {
  let asked = 0;
  for (const leg of LEGS) {
    const findings = [];
    assert.equal(themeLegFindings(LABEL, leg, findings), true, JSON.stringify(leg));
    assert.equal(findings.length, 1, JSON.stringify(leg));
    const [finding] = findings;
    const said = [finding.message, ...(finding.repairs || [])];
    for (const text of said) for (const re of NAMES) assert.doesNotMatch(text, re, `${JSON.stringify(leg)}: ${text}`);
    assert.ok(SAYS.includes(finding.message), JSON.stringify(leg));
    asked += 1;
  }
  assert.equal(asked, LEGS.length);
});

test("R73 (T51 fix round 10): a clean leg answers no finding, and the caller's plain label leads the message", () => {
  const findings = [];
  assert.equal(themeLegFindings(LABEL, { target: "INFO-2026-0001-a" }, findings), false);
  assert.deepEqual(findings, []);
  const named = [];
  themeLegFindings(LABEL, { target: `${ID}#INFO-2026-0001-a` }, named);
  assert.ok(named[0].message.startsWith(LABEL), named[0].message);
});
