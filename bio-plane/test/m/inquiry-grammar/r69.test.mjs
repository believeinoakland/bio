/* R69 (T51 fix round 10; K5297): no finding or repair this module words names a field, a stored code or a decision id.
   The sweep runs over this module's corpus findings, the recorded golden answers for its checks (`golden.json`), and reads
   each message and each repair as a member would. A field is a snake_case name or a bracketed path, a stored code is an
   upper-case code or an `op=` act, a decision or requirement id is `DEC-n`, `C-n`, `REC-n`, `CASE-n`, `D-n`, `R-n`, and
   `kind:` names a stored kind. Record ids that the finding quotes (an INQ-, INFO-, LEAD- id) are data, not names. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { GOLDEN } from "./fixture.mjs";

const THIS_MODULE = /^C-(2\.8|6\.1|6\.3|15\.1|21\.2|21\.3|54\.1|3[23]\.\d+)$/;
const NAMES = [
  /[a-z]+_[a-z_]+/,                               // a field: division_apportionment, grade_axis, target_edition
  /\[|\]/,                                        // a bracketed path: basis[0], references[]
  /\b(DEC|REC|CASE|C|D|R|K|N)-\d/,                // a decision, record, case, requirement or code id
  /\bop=/,                                        // an act named as a stored operation
  /\bkind:/,                                      // a stored kind
  /\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/,           // a stored code: NO_SIBLING_DISCLOSURE, LEAD_NOT_EVIDENCE
];
const named = (text) => NAMES.find((rx) => rx.test(text));

/* every finding of this module's checks in the recorded answers, in every section that records findings */
function findingsOf(value, out = []) {
  if (Array.isArray(value)) {
    if (value.every((x) => x && typeof x === "object" && "check" in x && "message" in x)) out.push(...value);
    else value.forEach((x) => findingsOf(x, out));
  } else if (value && typeof value === "object") {
    for (const v of Object.values(value)) findingsOf(v, out);
  }
  return out;
}

test("R69 the corpus: no finding this module words names a field, a stored code or a decision id, in its message or any repair", () => {
  /* the bundles also record record-grammar's own references findings (C-6.1, C-6.3): those are not this module's words */
  const findings = Object.entries(GOLDEN).flatMap(([section, value]) => findingsOf(value)
    .filter((x) => THIS_MODULE.test(x.check) && !(section === "bundles" && /^C-6\./.test(x.check))));
  assert.ok(findings.length > 100, `the sweep reads the module's recorded findings (${findings.length})`);
  const bad = [];
  for (const x of findings) {
    for (const text of [x.message, ...(x.repairs ?? [])]) {
      const rx = named(text);
      if (rx) bad.push(`${x.check} ${rx}: ${text}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("R69 the names the sweep looks for are the ones a member would read as a field, a code or an id, and record ids are not among them", () => {
  assert.equal(named("the grade on basis leg 0 is set, on a leg on the calculation CALC-2026-0003"), undefined);
  assert.equal(named("basis leg 0 names 'INFO-2026-0002-b', which is not a valid record reference"), undefined);
  assert.equal(named("the content id on basis leg 0 is not a content id"), undefined);
  assert.ok(named("basis leg 0.grade_axis is set"));
  assert.ok(named("references[1] names a target"));
  assert.ok(named("refused: NO_SIBLING_DISCLOSURE"));
  assert.ok(named("see DEC-15 for the rule"));
  assert.ok(named("op=earnedbasis answers what each target earns"));
});
