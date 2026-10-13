/* filing-templates, T47 (T47-41; R30; N957, K231): C-125.4 TEMPLATE_BLANK_UNKNOWN minted at one site. Both conditions
   that raise it, R2's text check of a group's draft (R3, R4, R6) and R15's read of a profile template, answer it alike:
   the same code, check and translation, naming the first blank outside FILING_BLANKS (`blanksOf`, R19); each beside its
   control, the same act or read with only known blanks. The row's `where` names the one site, and no other site of the
   module spells the code (the census arm). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { seeded, V, MACHINE, TEST, HARBOUR, TEXT, twoProfiles, reviewedOf } from "./fixture.mjs";
import * as ft from "../../../src/filing-templates/index.mjs";

const A = V("alice"), B = V("bob");
const ROW = ft.FILING_TEMPLATE_CHECKS.TEMPLATE_BLANK_UNKNOWN;
const SITE = { fn: "blankUnknownRefusal", region: "is-template-blank" };
const answered = (r) => [r.ok, r.reason, r.code, r.check, r.translation];
const BLANK = [false, "TEMPLATE_BLANK_UNKNOWN", "TEMPLATE_BLANK_UNKNOWN", "C-125.4", ROW.translation];
/* the harbour profile with one template whose text names `text`'s blanks, attributed whole (R15's four parts) */
const withProfileText = (text) => {
  const p = structuredClone(twoProfiles.get(HARBOUR));
  p.action_kinds[0].template = { id: "TPL-test-r30", version: 1, use: "file", name: "R30 probe", text, notes: "",
    authored_by: "Ada Example", contributors: [], reviews: [], approved_by: "Cy Example", approved_at: "2026-09-02", basis: "TEST",
    sources: [{ citation: "P.E.B.L. § 1" }] };
  return reviewedOf({ ...twoProfiles, get: (id) => (id === HARBOUR ? structuredClone(p) : twoProfiles.get(id)) });
};

test("R30 C-125.4 TEMPLATE_BLANK_UNKNOWN: a group's draft, revision and proposal naming an unknown blank, and a profile template naming one, each answer the same code, check and translation, naming the first unknown blank; the controls with known blanks are accepted and offered", () => {
  const w = seeded();
  const make = (text, name) => w.ft.templateDraft({ project: w.P, kind: "records_request", use: "file", profiles: [TEST], name, text,
                                                    author: A, viewer: A });
  const before = w.snapshot();
  const bad = "To {{counterparty_role}}: {{mayor_name}} and {{zz}} for {{group}}";
  const d = make(bad, "Bad");
  const ok = make(TEXT, "Good");
  assert.equal(ok.ok, true, "control: known blanks drafted");
  const rv = w.ft.templateRevise({ version: ok.version, text: bad, author: B, viewer: B });
  const pr = w.ft.templatePropose({ kind: "records_request", text: bad, why: "w", proposer: MACHINE, viewer: MACHINE });
  for (const r of [d, rv, pr]) {
    assert.deepEqual(answered(r), BLANK, JSON.stringify(r).slice(0, 200));
    assert.equal(r.blank, "mayor_name", "the first unknown, as blanksOf names it");
    assert.equal(r.blank, ft.blanksOf(bad).unknown);
  }
  assert.equal(w.ft.templateRevise({ version: ok.version, text: "{{law}} {{date}}", author: B, viewer: B }).ok, true, "control: revision");
  assert.equal(w.ft.templatePropose({ kind: "records_request", text: TEXT, why: "w", proposer: MACHINE, viewer: MACHINE }).ok, true, "control: proposal");
  assert.equal(w.count("tpl_templates") - JSON.parse(before.tpl_templates).length, 1, "the refused draft wrote no template");
  /* the profile template naming one: not offered, answering the same row, by id, by name, and in its read */
  const pw = seeded({ profiles: [HARBOUR], jur: withProfileText(bad) });
  const o = pw.ft.offeredVersion({ template: "TPL-test-r30", viewer: A });
  const n = pw.ft.offeredVersion({ name: "@r30-probe", viewer: A });
  const r = pw.ft.templateRead({ template: "TPL-test-r30", viewer: A });
  for (const x of [o, n, r.not_offered, r.blank_unknown]) {
    assert.deepEqual(answered(x), BLANK);
    assert.deepEqual([x.blank, x.template], ["mayor_name", "TPL-test-r30"]);
  }
  assert.equal(r.offered, false);
  assert.equal(pw.ft.templatesFor({ viewer: A }).templates.some((t) => t.id === "TPL-test-r30"), false, "not listed");
  /* both sites answer alike: the same check, translation and named blank */
  assert.deepEqual([o.check, o.translation, o.blank], [d.check, d.translation, d.blank]);
  /* control: the same profile template with known blanks only is offered */
  const cw = seeded({ profiles: [HARBOUR], jur: withProfileText(TEXT) });
  const c = cw.ft.offeredVersion({ template: "TPL-test-r30", viewer: A });
  assert.deepEqual([c.ok, c.template, c.text], [true, "TPL-test-r30", TEXT]);
  assert.equal(cw.ft.templateRead({ template: "TPL-test-r30", viewer: A }).blank_unknown, undefined);
});

test("R30 the row's where names the one site, blankUnknownRefusal (R32), its region found there, and no other site of the module spells the code (the census arm); its code, number and translation unmoved", async () => {
  assert.equal(ROW.where, `src/filing-templates/index.mjs ${SITE.fn} > ${SITE.region}`);
  assert.equal(ROW.check, "C-125.4");
  assert.equal(ROW.translation, "The words name a blank that no filing fills. Use only the blanks filings fill, written {{name}}.");
  const src = await readFile(new URL("../../../src/filing-templates/index.mjs", import.meta.url), "utf8");
  const open = `/* DEC-49 REGION ${SITE.region} */`, close = `/* END DEC-49 REGION ${SITE.region} */`;
  const [i, j] = [src.indexOf(open), src.indexOf(close)];
  assert.ok(i > 0 && j > i, "the region is in the module's index");
  assert.equal(src.indexOf(open, i + 1), -1, "one region");
  const fnAt = src.lastIndexOf(`function ${SITE.fn}(`, i);
  assert.ok(fnAt > 0 && !src.slice(fnAt, i).includes("\n  }\n"), "the region is inside blankUnknownRefusal");
  /* the code, as a string the module answers, is spelled inside that region alone */
  const spelled = [...src.matchAll(/"TEMPLATE_BLANK_UNKNOWN"/g)].map((m) => m.index);
  assert.ok(spelled.length >= 1);
  for (const at of spelled) assert.ok(at > i && at < j, `spelled at ${at}, outside the one site`);
  /* every other module file holds the code only as the row's key */
  for (const f of ["blanks.mjs", "schema.mjs"])
    assert.ok(!(await readFile(new URL(`../../../src/filing-templates/${f}`, import.meta.url), "utf8")).includes("TEMPLATE_BLANK_UNKNOWN"), f);
  /* control: another of this module's rows names its own site, not this one */
  assert.notEqual(ft.FILING_TEMPLATE_CHECKS.TEMPLATE_TEXT_REFUSED.where, ROW.where);
});
