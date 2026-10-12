/* filing-templates, T46 (T46-36; R29; DEC-194, N913): C-125.33 TEMPLATE_NOT_REVIEWED takes its translation from
   `words.json`'s `refusal.TEMPLATE_NOT_REVIEWED`, read by key, never a copy, its `{missing}` left for the screen with
   the refusal's `lacks` beside it; C-125.34 TEMPLATE_COURT_PETITION keeps its present translation; every other row keeps
   its own; codes, numbers, `where`s and behaviour unmoved. At the interface: the rows as exported, and each refusal as
   the reads answer it, beside its control, the same template offered once its attribution is whole. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { seeded, V, TEST, TEXT, reviewedOf, PROFILE_IDS } from "./fixture.mjs";
import * as ft from "../../../src/filing-templates/index.mjs";
import * as jurisdictions from "../../../../jurisdictions/index.mjs";
import { canonicalJson, sha256HexSync } from "../../../src/record-grammar/index.mjs";

const WORDS = JSON.parse(await readFile(new URL("../../../../docs/development/ux-substrate/screens/words.json",
  import.meta.url), "utf8")).words;
const en = (key) => {
  const w = WORDS.find((x) => x.key === key);
  assert.ok(w, `words.json holds ${key}`);
  return w.en;
};
const A = V("alice");
const rows = ft.FILING_TEMPLATE_CHECKS;
const AT = (fn, region) => `src/filing-templates/index.mjs ${fn} > ${region}`;
/* C-125.33 as T45 worded it: answered no longer. */
const T45_NOT_REVIEWED = "This template from the jurisdiction profile is not offered yet. A profile's template is offered only "
  + "once it names who wrote it, the public sources it was written from, a professional's review with no concerns, "
  + "and an approver other than its writer; what it lacks is named.";
/* C-125.34 keeps its present translation in T46 (R29): words.json's names "Civicsmith" bare (DEC-149). */
const COURT_PETITION = "This kind is filed with a court, so no template the group files in its own name is kept for it until "
  + "a licensed professional can certify one. A template that is the basis of a briefing to counsel may serve it.";
/* Every other row (42, C-115.31–.38 less .34, C-115.45, .46, C-125.1–.32 and .34), as T45 left them: their canonical
   JSON's sha256, so no check, where or translation of theirs moves. */
const KEPT = { count: 42, sha256: "85c06e21d331553b7e76494edabebfef4ba5efe534301fdaedbdff1a36a5f5f2" };
const editedOf = (edit, base = jurisdictions) => ({ ...base, get: (id) => { const p = base.get(id); if (p && p.id === TEST) edit(p); return p; } });

test("R29 C-125.33 TEMPLATE_NOT_REVIEWED reads words.json's refusal.TEMPLATE_NOT_REVIEWED by key from FILING_TEMPLATES_WORDS, never a copy; its code, number and where unmoved; T45's words answered no longer", () => {
  assert.ok(Object.isFrozen(ft.FILING_TEMPLATES_WORDS));
  assert.deepEqual(Object.keys(ft.FILING_TEMPLATES_WORDS), ["refusal.TEMPLATE_NOT_REVIEWED"], "the table holds exactly the one row's key");
  for (const [key, text] of Object.entries(ft.FILING_TEMPLATES_WORDS)) assert.equal(text, en(key), `${key} verbatim`);
  const row = rows.TEMPLATE_NOT_REVIEWED;
  assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"]);
  assert.deepEqual([row.check, row.where], ["C-125.33", AT("#profileRefusal", "is-profile-offered")]);
  assert.equal(row.translation, ft.FILING_TEMPLATES_WORDS["refusal.TEMPLATE_NOT_REVIEWED"]);
  assert.equal(row.translation, en("refusal.TEMPLATE_NOT_REVIEWED"));
  assert.match(row.translation, /\{missing\}/, "its placeholder left for the screen");
  assert.notEqual(row.translation, T45_NOT_REVIEWED, "T45's words no longer");
});

test("R29 C-125.34 TEMPLATE_COURT_PETITION keeps its present translation, not words.json's (which names Civicsmith bare, against DEC-149); every other row keeps its own", () => {
  const row = rows.TEMPLATE_COURT_PETITION;
  assert.deepEqual([row.check, row.where, row.translation], ["C-125.34", AT("#courtPetition", "is-court-petition"), COURT_PETITION]);
  assert.ok(!("refusal.TEMPLATE_COURT_PETITION" in ft.FILING_TEMPLATES_WORDS), "not taken in T46");
  assert.notEqual(row.translation, en("refusal.TEMPLATE_COURT_PETITION"));
  assert.match(en("refusal.TEMPLATE_COURT_PETITION"), /\bCivicsmith\b/, "words.json's sentence names Civicsmith");
  assert.doesNotMatch(en("refusal.TEMPLATE_COURT_PETITION"), /your group's Civicsmith/);
  const kept = Object.fromEntries(Object.entries(rows).filter(([c]) => c !== "TEMPLATE_NOT_REVIEWED"));
  assert.deepEqual([Object.keys(kept).length, sha256HexSync(canonicalJson(kept))], [KEPT.count, KEPT.sha256],
    "no other row's check, where or translation moved");
  for (const [code, r] of Object.entries(kept)) assert.ok(!Object.values(ft.FILING_TEMPLATES_WORDS).includes(r.translation), code);
});

test("R29 the refusal is answered by the reads with words.json's sentence and R15's lacks beside it, behaviour unmoved; the control, the same templates with their attribution whole, are offered", () => {
  const w = seeded();
  const want = { "TPL-test-records-request": ["sources"], "TPL-test-bylaw-complaint": ["sources", "professional_review"],
                 "TPL-test-commitment-brief": ["sources", "professional_review"], "TPL-test-recognition": ["professional_review"],
                 "TPL-test-recognition-follow-up": ["professional_review"] };
  const before = w.snapshot();
  for (const [id, lacks] of Object.entries(want)) {
    const o = w.ft.offeredVersion({ template: id, viewer: A });
    assert.deepEqual([o.ok, o.reason, o.code, o.check, o.translation], [false, "TEMPLATE_NOT_REVIEWED", "TEMPLATE_NOT_REVIEWED", "C-125.33",
                                                                         en("refusal.TEMPLATE_NOT_REVIEWED")], id);
    assert.deepEqual([o.template, o.lacks], [id, lacks], `${id}: what fills {missing}, beside it`);
    const r = w.ft.templateRead({ template: id, viewer: A });
    assert.deepEqual([r.offered, r.not_offered.translation, r.not_offered.lacks], [false, en("refusal.TEMPLATE_NOT_REVIEWED"), lacks], id);
  }
  assert.deepEqual(w.ft.templatesFor({ viewer: A }).templates, [], "none listed");
  assert.deepEqual(w.snapshot(), before, "the reads write nothing");
  /* by name too */
  const named = w.ft.offeredVersion({ name: "@request-under-the-records-act", viewer: A });
  assert.deepEqual([named.reason, named.translation, named.lacks], ["TEMPLATE_NOT_REVIEWED", en("refusal.TEMPLATE_NOT_REVIEWED"), ["sources"]]);
  /* no answer carries T45's words */
  assert.ok(!JSON.stringify([named, ...PROFILE_IDS.map((id) => w.ft.offeredVersion({ template: id, viewer: A }))]).includes(T45_NOT_REVIEWED));
  /* the control: each part supplied, each template offered */
  const ok = seeded({ jur: reviewedOf() });
  for (const id of PROFILE_IDS) assert.equal(ok.ft.offeredVersion({ template: id, viewer: A }).ok, true, id);
  /* C-125.34, as the draft answers it, keeps its words */
  const cp = seeded({ jur: editedOf((p) => { p.action_kinds.find((k) => k.kind === "bylaw_complaint").venue.how = "court"; }) });
  const c = cp.ft.templateDraft({ project: cp.P, kind: "bylaw_complaint", use: "file", profiles: [TEST], name: "P", text: TEXT, author: A, viewer: A });
  assert.deepEqual([c.reason, c.check, c.translation], ["TEMPLATE_COURT_PETITION", "C-125.34", COURT_PETITION]);
});
