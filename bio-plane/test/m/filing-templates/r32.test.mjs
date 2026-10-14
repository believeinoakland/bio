/* filing-templates, T47 (R32; K231, K3124; amends R30): the one site of C-125.4 TEMPLATE_BLANK_UNKNOWN is provided,
   `blankUnknownRefusal(text, extra)`, which `filings` calls for a member's own words (its R56). At the interface: the
   export's answer, its control, and R2's and R15's answers made through it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, V, TEST, TEXT } from "./fixture.mjs";
import * as ft from "../../../src/filing-templates/index.mjs";

const ROW = ft.FILING_TEMPLATE_CHECKS.TEMPLATE_BLANK_UNKNOWN;
const A = V("alice");

test("R32 blankUnknownRefusal answers C-125.4 with its row, naming the first blank outside FILING_BLANKS, extra fields merged; control: a text of known blanks answers null", () => {
  const r = ft.blankUnknownRefusal("To {{group}}: {{mayor_name}} and {{zz}}", { action: "ACTN-1", blanks: Object.keys(ft.FILING_BLANKS) });
  assert.deepEqual([r.ok, r.reason, r.code, r.check, r.translation, r.blank], [false, "TEMPLATE_BLANK_UNKNOWN", "TEMPLATE_BLANK_UNKNOWN",
    "C-125.4", ROW.translation, "mayor_name"]);
  assert.deepEqual([r.action, r.blanks], ["ACTN-1", Object.keys(ft.FILING_BLANKS)], "extra merged");
  assert.equal(r.detail, "{{mayor_name}} is not a blank filings fill");
  assert.equal(ft.blankUnknownRefusal("{{x}}").blank, "x", "extra may be absent");
  /* the named blank is the refusal's own, never one extra sends */
  assert.equal(ft.blankUnknownRefusal("{{x}}", { blank: "other" }).blank, "x");
  /* controls: known blanks only, no blanks, not a string */
  for (const text of [TEXT, "{{records}} {{ period }} {{form}} {{cost_limit}}", "no blanks", "", null, 7])
    assert.equal(ft.blankUnknownRefusal(text, { action: "ACTN-1" }), null, JSON.stringify(text));
});

test("R32 R2's check and R15's read answer through it: a draft's refusal equals the export's for the same text and fields", () => {
  const w = seeded();
  const text = "{{group}} {{mayor_name}}";
  const d = w.ft.templateDraft({ project: w.P, kind: "records_request", use: "file", profiles: [TEST], name: "R32", text, author: A, viewer: A });
  assert.deepEqual(d, ft.blankUnknownRefusal(text, { blanks: Object.keys(ft.FILING_BLANKS) }));
  /* control */
  assert.equal(w.ft.templateDraft({ project: w.P, kind: "records_request", use: "file", profiles: [TEST], name: "R32 ok", text: TEXT,
                                    author: A, viewer: A }).ok, true);
});
