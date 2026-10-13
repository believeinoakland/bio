/* filing-templates, T47 (R31; DEC-209 (3), K3120; amends R19): FILING_BLANKS gains four blanks a member fills
   (`filings` R55's `fills`), each with its sentence; every earlier blank and its sentence unchanged; `blanksOf` reads the
   four as it reads the others. At the interface: the exported set, `blanksOf`, and a draft naming each. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, V, TEST } from "./fixture.mjs";
import * as ft from "../../../src/filing-templates/index.mjs";

const A = V("alice");
const R31 = { records: "the records asked for, in the member's words", period: "the period the records cover",
              form: "the form the records are wanted in", cost_limit: "the most the group will pay for copies before being told" };

test("R31 FILING_BLANKS gains records, period, form and cost_limit, each with its sentence, after the fifteen moved, which are unchanged; still frozen", () => {
  const entries = Object.entries(ft.FILING_BLANKS);
  assert.equal(entries.length, 19);
  assert.deepEqual(Object.fromEntries(entries.slice(15)), R31, "the four, in order, with their sentences");
  assert.deepEqual(entries.slice(0, 15).map(([k]) => k), ["counterparty_role", "counterparty_body", "counterparty_organisation",
    "counterparty_description", "act", "act_date", "standards", "findings", "governing_laws", "law", "clock", "venue",
    "venue_how", "group", "date"], "every earlier blank kept, in its place (its sentences pinned by R19's test)");
  assert.ok(Object.isFrozen(ft.FILING_BLANKS));
});

test("R31 blanksOf reads the four as it reads the others: a text naming each answers it in order, with no unknown; control: a name outside the set still answers TEMPLATE_BLANK_UNKNOWN", () => {
  const text = "Please send {{records}} from {{ period }} as {{form}}; tell {{group}} before costs pass {{cost_limit}}.";
  assert.deepEqual(ft.blanksOf(text), { blanks: ["records", "period", "form", "group", "cost_limit"], unknown: null });
  const w = seeded();
  const d = w.ft.templateDraft({ project: w.P, kind: "records_request", use: "file", profiles: [TEST], name: "R31", text, author: A, viewer: A });
  assert.equal(d.ok, true, JSON.stringify(d).slice(0, 300));
  /* control: an unknown blank beside them is refused, naming it */
  const bad = w.ft.templateDraft({ project: w.P, kind: "records_request", use: "file", profiles: [TEST], name: "R31 bad",
                                   text: `${text} {{fee_waiver}}`, author: A, viewer: A });
  assert.deepEqual([bad.ok, bad.reason, bad.check, bad.blank], [false, "TEMPLATE_BLANK_UNKNOWN", "C-125.4", "fee_waiver"]);
  assert.deepEqual(ft.blanksOf("{{records}} {{fee_waiver}}"), { blanks: ["records", "fee_waiver"], unknown: "fee_waiver" });
});
