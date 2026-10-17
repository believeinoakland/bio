/* case-import: R25 (T50-15; N933; K3230, K3635; `public-read` R36): the `groupFields` given at import may also carry the
   source's `matter_stake`, in R36's shape or `null`, recorded and answered with the other fields, labeled as they are.
   A malformed one is recorded `null` with a sentence saying why, the other fields intact; the import is never refused for
   it. At the module's interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { seeded, caseFile, V, SOURCE } from "./fixture.mjs";
import { GROUP_FIELDS_LABEL, GROUP_FIELDS_NONE, GROUP_FIELD_KEYS, caseImportOps } from "../../../src/case-import/index.mjs";
import { hasWord, word } from "../../../src/setup-words/index.mjs";
import { MATTER_STAKE_NOTE_KEY } from "../../../src/case-import/words.mjs";

const FIELDS = { group: SOURCE, name: "The Source Team", domain: "source.example.org", domain_verified_at: "2026-09-30T08:00:00Z",
                 stake: "We campaign for the measure this case examines.", detail: null, read_at: "2026-10-03T11:59:30Z" };
/* R36's answer for a project with a stake, and for one whose stake cannot be read */
const MATTER = { stake: "We gain if the contract is voided.", set_by: "alice", set_at: "2026-10-01T10:00:00Z", source: "project" };
const UNREAD = { stake: "undetermined", set_by: null, set_at: null, source: "project" };
const withFields = (w, gf) => w.ci.importCaseFile({ parts: caseFile().parts, by: V("alice"), viewer: V("alice"), groupFields: gf });
const editionOf = (w, a) => w.ci.importedCase({ import: a.import, edition: 1, viewer: V("bob") }).edition;
/* the sentence R25 owes: the list's word for its key once the list holds it, else null (the key is owed, REPORT to BOB) */
const NOTE = hasWord(MATTER_STAKE_NOTE_KEY) ? word(MATTER_STAKE_NOTE_KEY) : null;

test("R25 fields with a matter_stake are recorded and read back whole, labeled as the source's declaration when read", async () => {
  for (const matter of [MATTER, UNREAD, null]) {
    const w = seeded();
    const a = await withFields(w, { ...FIELDS, matter_stake: matter });
    assert.equal(a.ok, true, JSON.stringify(a).slice(0, 300));
    assert.deepEqual(a.group_fields, { recorded: true, read_at: "2026-10-03T11:59:30Z" });
    const e = editionOf(w, a);
    assert.deepEqual(e.group_fields, { ...FIELDS, matter_stake: matter }, JSON.stringify(matter));
    assert.equal(e.group_fields_label, GROUP_FIELDS_LABEL);
    assert.equal(e.group_fields_note, undefined, "a well-formed matter stake, or none, needs no sentence");
    /* the list answers it too */
    assert.deepEqual(w.ci.importedCases({ viewer: V("bob") }).imports[0].editions[0].group_fields.matter_stake, matter);
  }
});

test("R25 fields without a matter_stake still record the six fields and answer matter_stake: null, no fault", async () => {
  const w = seeded();
  const a = await withFields(w, FIELDS);
  assert.equal(a.ok, true);
  const e = editionOf(w, a);
  assert.deepEqual(e.group_fields, { ...FIELDS, matter_stake: null });
  assert.equal(e.group_fields_note, undefined);
  assert.deepEqual(Object.keys(e.group_fields).sort(), [...GROUP_FIELD_KEYS, "matter_stake", "read_at"].sort());
  /* an explicit undefined reads as absent */
  const w2 = seeded();
  assert.equal(editionOf(w2, await withFields(w2, { ...FIELDS, matter_stake: undefined })).group_fields.matter_stake, null);
  /* an edition recorded without any fields still answers R4's sentence, never a matter stake */
  const w3 = seeded();
  const b = await withFields(w3, null);
  const e3 = editionOf(w3, b);
  assert.deepEqual([e3.group_fields, e3.group_fields_note], [null, GROUP_FIELDS_NONE]);
});

test("R25 a matter_stake that is neither an object in R36's shape nor null is recorded null with its sentence, the other fields intact, and the import is never refused", async () => {
  const bad = ["a stake", 7, true, ["x"], {}, { stake: "x" }, { ...MATTER, source: "team" }, { ...MATTER, stake: "" }, { ...MATTER, stake: 3 },
               { ...MATTER, set_by: 9 }, { ...MATTER, extra: 1 }, { ...MATTER, stake: "s".repeat(2001) }, { ...MATTER, stake: "\uD800" }];
  for (const m of bad) {
    const w = seeded();
    const a = await withFields(w, { ...FIELDS, matter_stake: m });
    assert.equal(a.ok, true, `never refused: ${JSON.stringify(m)}`);
    assert.deepEqual(a.group_fields, { recorded: true, read_at: "2026-10-03T11:59:30Z" });
    const e = editionOf(w, a);
    assert.deepEqual(e.group_fields, { ...FIELDS, matter_stake: null }, `other fields intact: ${JSON.stringify(m).slice(0, 60)}`);
    assert.ok(Object.hasOwn(e, "group_fields_note"), "the sentence's place is answered");
    assert.equal(e.group_fields_note, NOTE);
    assert.notEqual(e.group_fields_note, GROUP_FIELDS_NONE, "not the sentence of an edition with no fields");
    assert.equal(w.count("case_import_group_fields"), 1);
    assert.equal(w.count("case_import_editions"), 1);
  }
  /* the control: the same fields with a well-formed matter stake answer it and no sentence */
  const w = seeded();
  const ok = editionOf(w, await withFields(w, { ...FIELDS, matter_stake: MATTER }));
  assert.deepEqual(ok.group_fields.matter_stake, MATTER);
  assert.equal(Object.hasOwn(ok, "group_fields_note"), false);
});

test("R25 a key other than the six, read_at and matter_stake is still not_its_shape and the fields are not recorded; another group's are not either", async () => {
  for (const [why, gf] of [["not_its_shape", { ...FIELDS, matter_stake: MATTER, extra: 1 }], ["not_its_shape", { ...FIELDS, matterstake: MATTER }],
                           ["another_group", { ...FIELDS, group: "another-team", matter_stake: MATTER }]]) {
    const w = seeded();
    const r = await withFields(w, gf);
    assert.equal(r.ok, true);
    assert.deepEqual(r.group_fields, { recorded: false, why });
    assert.equal(w.count("case_import_group_fields"), 0);
    assert.deepEqual([editionOf(w, r).group_fields, editionOf(w, r).group_fields_note], [null, GROUP_FIELDS_NONE]);
  }
});

test("R25 the matter stake arrives through the op's body with the other fields; a non-member reads absence, the stake with it", async () => {
  const w = seeded();
  const f = caseFile();
  const url = new URL("https://x/?op=caseimport&by=member:alice&viewer=member:alice");
  const r = await caseImportOps(w.ci, url, { parts: f.parts.map((p) => Buffer.from(p).toString("base64")),
                                             group_fields: { ...FIELDS, matter_stake: MATTER } }).caseimport();
  assert.equal(r.ok, true);
  assert.deepEqual(editionOf(w, r).group_fields.matter_stake, MATTER);
  const absent = w.ci.importedCase({ import: r.import, viewer: V("carol") });
  assert.equal(absent.reason, "IMPORT_NO_SUCH_EDITION");
  assert.doesNotMatch(JSON.stringify(absent), /matter_stake|voided/);
});
