/* case-import: the source group's public identity and declared stake (R4's T46 clause; N903, K2832, K2949), recorded at
   import from what the caller read (`public-read` R34's `group_fields`, with `read_at`) and answered per edition by
   `importedCase`, for `conformance` R32. Never fetched, never a refusal; a repeat import writes nothing. At the module's
   interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, imp, caseFile, V, SOURCE } from "./fixture.mjs";
import { GROUP_FIELDS_NONE, GROUP_FIELDS_LABEL, GROUP_FIELD_KEYS, caseImportOps } from "../../../src/case-import/index.mjs";

/* R34's answer as `publishedCase` gives it, read by the caller at `read_at` */
const FIELDS = { group: SOURCE, name: "The Source Group", domain: "source.example.org", domain_verified_at: "2026-09-30T08:00:00Z",
                 stake: "We campaign for the measure this case examines.", detail: null, read_at: "2026-10-03T11:59:30Z" };
const withFields = (w, gf, file = caseFile(), who = "alice") =>
  w.ci.importCaseFile({ parts: file.parts, by: V(who), viewer: V(who), groupFields: gf });
const editionOf = (w, a, edition) => w.ci.importedCase({ import: a.import, edition, viewer: V("bob") }).edition;

test("R4 an import given the source's group_fields records them with the edition and importedCase answers them with read_at, labeled as the source's", async () => {
  const w = seeded();
  const a = await withFields(w, FIELDS);
  assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
  assert.equal(a.existed, false);
  assert.deepEqual(a.group_fields, { recorded: true, read_at: "2026-10-03T11:59:30Z" });
  const e = editionOf(w, a, 1);
  assert.deepEqual(e.group_fields, FIELDS, "every R34 field, as the caller read it, with read_at");
  assert.deepEqual(Object.keys(e.group_fields).sort(), [...GROUP_FIELD_KEYS, "read_at"].sort());
  assert.equal(e.group_fields_label, GROUP_FIELDS_LABEL);
  assert.equal(e.group_fields_note, undefined);
  /* per edition: the editions list answers it too, in importedCase and importedCases alike */
  const c = w.ci.importedCase({ import: a.import, viewer: V("bob") });
  assert.deepEqual(c.editions[0].group_fields, FIELDS);
  assert.deepEqual(w.ci.importedCases({ viewer: V("bob") }).imports[0].editions[0].group_fields, FIELDS);
  /* a stake that is null (no stake declared) and one undetermined are each kept as given, never conflated */
  for (const stake of [null, "undetermined", { text: "a structured declaration" }]) {
    const w2 = seeded();
    const r = await withFields(w2, { ...FIELDS, stake });
    assert.deepEqual(editionOf(w2, r, 1).group_fields.stake, stake, JSON.stringify(stake));
  }
  /* an identity R34 answered undetermined (all four null but group) is not this group's to fill: a null group is not the
     manifest's, so nothing is recorded */
  const w3 = seeded();
  const r3 = await withFields(w3, { ...FIELDS, group: null, name: null, domain: null, domain_verified_at: null, detail: "undetermined" });
  assert.equal(editionOf(w3, r3, 1).group_fields, null);
  /* a read_at is stamped to the second */
  const w4 = seeded();
  const r4 = await withFields(w4, { ...FIELDS, read_at: "2026-10-03T11:59:30.750Z" });
  assert.equal(editionOf(w4, r4, 1).group_fields.read_at, "2026-10-03T11:59:30Z");
});

test("R4 the same import without group_fields answers group_fields: null with its sentence, never a guess", async () => {
  const w = seeded();
  const a = await imp(w);
  assert.equal(a.ok, true);
  assert.deepEqual(a.group_fields, { recorded: false, why: "none_given" });
  const e = editionOf(w, a, 1);
  assert.equal(e.group_fields, null);
  assert.equal(e.group_fields_note, GROUP_FIELDS_NONE);
  assert.equal(w.count("case_import_group_fields"), 0);
  /* the control: the same case file, with the fields, answers them */
  const w2 = seeded();
  const b = await withFields(w2, FIELDS);
  assert.equal(b.import, a.import, "the same import");
  assert.deepEqual(editionOf(w2, b, 1).group_fields, FIELDS);
});

test("R4 fields naming another group, absent, or not in R34's shape are not recorded, and the import is never refused for them", async () => {
  const bad = [
    ["another_group", { ...FIELDS, group: "another-group" }],
    ["not_an_object", "the fields"],
    ["not_an_object", [FIELDS]],
    ["not_its_shape", { ...FIELDS, extra: 1 }],
    ["not_its_shape", (({ detail, ...x }) => x)(FIELDS)],
    ["not_its_shape", { ...FIELDS, name: 7 }],
    ["not_its_shape", { ...FIELDS, domain: "d".repeat(2001) }],
    ["not_its_shape", { ...FIELDS, stake: "s".repeat(9000) }],
    ["not_its_shape", { ...FIELDS, detail: "\uD800" }],
    ["no_read_at", { ...FIELDS, read_at: null }],
    ["no_read_at", { ...FIELDS, read_at: "yesterday" }],
  ];
  for (const [why, gf] of bad) {
    const w = seeded();
    const r = await withFields(w, gf);
    assert.equal(r.ok, true, `${why}: never refused: ${JSON.stringify(r).slice(0, 200)}`);
    assert.equal(r.existed, false);
    assert.deepEqual(r.group_fields, { recorded: false, why }, JSON.stringify(gf).slice(0, 80));
    assert.equal(w.count("case_import_group_fields"), 0);
    assert.equal(w.count("case_import_editions"), 1, "the edition is imported");
    const e = editionOf(w, r, 1);
    assert.deepEqual([e.group_fields, e.group_fields_note], [null, GROUP_FIELDS_NONE]);
  }
  /* the control: the same fields naming the manifest's group are recorded */
  const w = seeded();
  assert.deepEqual((await withFields(w, FIELDS)).group_fields.recorded, true);
  assert.equal(w.count("case_import_group_fields"), 1);
});

test("R4 a repeat import of the same edition writes nothing, whatever fields it brings; another edition records its own", async () => {
  const w = seeded();
  const first = await imp(w);
  const before = w.snapshot();
  const again = await withFields(w, FIELDS, caseFile(), "bob");
  assert.equal(again.existed, true);
  assert.deepEqual(w.snapshot(), before, "a repeat writes nothing, the fields included");
  assert.equal(editionOf(w, first, 1).group_fields, null, "the edition stays as first recorded");
  /* fields read later, with edition 2: recorded for edition 2 only, side by side */
  const later = { ...FIELDS, stake: "a later declaration", read_at: "2026-10-09T09:00:00Z" };
  await withFields(w, later, caseFile({ edition: 2 }));
  assert.equal(editionOf(w, first, 1).group_fields, null);
  assert.deepEqual(editionOf(w, first, 2).group_fields, later);
  /* and a repeat of an edition recorded with fields keeps the first ones */
  const before2 = w.snapshot();
  assert.equal((await withFields(w, { ...later, stake: "changed again" }, caseFile({ edition: 2 }))).existed, true);
  assert.deepEqual(w.snapshot(), before2);
  assert.deepEqual(editionOf(w, first, 2).group_fields.stake, "a later declaration");
});

test("R4 the group_fields arrive through the op's body; a non-member reads absence, the fields with it", async () => {
  const w = seeded();
  const f = caseFile();
  const url = new URL("https://x/?op=caseimport&by=member:alice&viewer=member:alice");
  const r = await caseImportOps(w.ci, url, { parts: f.parts.map((p) => Buffer.from(p).toString("base64")), group_fields: FIELDS }).caseimport();
  assert.equal(r.ok, true);
  assert.deepEqual(editionOf(w, r, 1).group_fields, FIELDS);
  const absent = w.ci.importedCase({ import: r.import, viewer: V("carol") });
  assert.equal(absent.reason, "IMPORT_NO_SUCH_EDITION");
  assert.doesNotMatch(JSON.stringify(absent), /The Source Group|group_fields/);
  assert.equal(JSON.stringify(absent), JSON.stringify(seeded().ci.importedCase({ import: r.import, viewer: V("alice") })));
});
