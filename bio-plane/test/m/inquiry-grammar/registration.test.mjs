/* inquiry-grammar R6 at the module's interface: the one registration through record-core's grammar seam (its R67, as
   K766 words it) claiming the C-6.1, C-15.1 and C-2.8 slots whole, the sub-slot inside the C-2.8 arm where the
   catalogue called `basisVersionFindings` (K775 (1)), and what record-grammar's `checkBundle` answers given
   `record.grammars()` (what promotion's gate and the audit pass): for every bundle of the corpus, the catalogue's
   findings before the move, in content and order, with `basis-versions`' grammar (a stand-in replaying the version
   findings, `fixture.mjs`) registered into the sub-slot after this module's. A fresh record per test. */
import test from "node:test";
import assert from "node:assert/strict";
import { registerInquiryGrammar, INQUIRY_GRAMMAR, checkInquiryExtension } from "../../../src/inquiry-grammar/index.mjs";
import { BUNDLE_CASES, REGISTRY_VARIANTS } from "./corpus.mjs";
import { GOLDEN, judge, freshRecord, versionStandIn, run } from "./fixture.mjs";

const VARIANTS = Object.keys(REGISTRY_VARIANTS);

test("R6 registerInquiryGrammar: one registration, `inquiry-grammar`, claiming the C-6.1, C-15.1 and C-2.8 slots whole, answered {ok: true} by record-core; reaching it again registers nothing more", () => {
  assert.deepEqual([...INQUIRY_GRAMMAR.ids], ["C-6.1", "C-15.1", "C-2.8"]);
  assert.ok(Object.isFrozen(INQUIRY_GRAMMAR));
  const record = freshRecord();
  assert.deepEqual(record.grammars(), []);
  assert.deepEqual(registerInquiryGrammar(record), { ok: true, module: "inquiry-grammar", ids: ["C-6.1", "C-15.1", "C-2.8"] });
  assert.equal(registerInquiryGrammar(record), null, "a second start registers nothing");
  assert.deepEqual(record.grammars().map((g) => [g.module, [...g.ids]]),
                   [["inquiry-grammar", ["C-6.1"]], ["inquiry-grammar", ["C-15.1"]], ["inquiry-grammar", ["C-2.8"]]],
                   "one entry per slot, in record-grammar R28's order");
  assert.equal(registerInquiryGrammar({}), null, "a record with no seam is left alone");
  assert.equal(registerInquiryGrammar(null), null);
});

test("R6 a refusal is a defect of the wiring and throws, naming record-core's reason and the holder; nothing is left half-registered", () => {
  const record = freshRecord();
  assert.equal(record.registerGrammar("inquiry-grammar", { ids: ["C-2.8"], arm: () => {} }).ok, true);
  assert.throws(() => registerInquiryGrammar(record), /inquiry-grammar: record-core refused the inquiry grammar: GRAMMAR_DECLARED \(held by inquiry-grammar\)/);
  const other = freshRecord();
  assert.equal(other.registerGrammar("elsewhere", { ids: ["C-15.1", "C-99.1"], arm: () => {} }).ok, true);
  assert.equal(registerInquiryGrammar(other).ok, true, "a slot several registrations claim is no refusal (record-core R67)");
});

test("R6 for every bundle under every registry variant, checkBundle given record.grammars() answers the catalogue's findings before the move, identical in content and in order, with basis-versions' grammar registered after this module's", async () => {
  const record = freshRecord();
  registerInquiryGrammar(record);
  assert.equal(versionStandIn(record).ok, true);
  let versions = 0;
  for (const id of Object.keys(BUNDLE_CASES)) for (const v of VARIANTS) {
    assert.deepEqual(await judge(id, v, record.grammars()), GOLDEN.bundles[id][v], `${id} (${v})`);
    versions += GOLDEN.bundles[id].versions.length;
  }
  assert.ok(versions > 0, "the corpus carries version findings, so the sub-slot's place is tested");
});

test("R6 negative control: registered BEFORE this module, the version grammar runs first, and the catalogue's order is lost", async () => {
  const record = freshRecord();
  versionStandIn(record);
  registerInquiryGrammar(record);
  const id = "INQ-2026-0130-versions-entry";
  const got = await judge(id, "both", record.grammars());
  assert.notDeepEqual(got, GOLDEN.bundles[id].both);
  assert.deepEqual(new Set(got.map((x) => JSON.stringify(x))), new Set(GOLDEN.bundles[id].both.map((x) => JSON.stringify(x))),
                   "the same findings, in another order");
});

test("R6 the sub-slot: for an inquiry, rest() runs once, after the entry, division and subject-entity findings and before the grounds and leg findings; for any other document the arm returns at once and the slot's later claimants run after it", async () => {
  const calls = [];
  const fm = { object_type: "inquiry", surfaced_by: "robot", subject_entity: "x",
               basis: [{ target: "nope", role: "supports" }] };
  const findings = [];
  const answer = checkInquiryExtension({ fm }, findings, { slot: "checkInquiryExtension",
    rest: async () => { calls.push(findings.map((x) => x.message)); findings.push({ check: "C-25.1", severity: "error", message: "VERSION" }); } });
  assert.equal(typeof answer?.then, "function", "with an asynchronous sub-slot the arm answers a promise");
  await answer;
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], ["surfaced_by 'robot' is not one of: agent, human",
    "subject_entity 'x' is not a subject registry key (ENT-YYYY-NNNN)"], "the entry and subject findings come first");
  assert.deepEqual(findings.map((x) => x.message.slice(0, 26)),
    ["surfaced_by 'robot' is not", "subject_entity 'x' is not ", "VERSION", "basis[0].target 'nope' is "]);
  /* with no sub-slot, the catalogue's synchronous arm */
  const plain = run((f) => checkInquiryExtension({ fm }, f));
  assert.equal(plain.answer, undefined);
  assert.equal(plain.findings.length, 3);
  /* through the record: a non-inquiry's later claimants run after the arm; an inquiry's at the sub-slot, once */
  const record = freshRecord();
  registerInquiryGrammar(record);
  const seen = [];
  versionStandIn(record, seen);
  for (const id of ["INFO-2026-0001-a", "PROJ-2026-0001-p", "INQ-2026-0100-clean", "PROB-2026-0001-legacy-type"])
    await judge(id, "none", record.grammars());
  assert.deepEqual(seen, ["information", "project", "inquiry", "problem"], "each bundle's version grammar ran exactly once");
});

test("R6 the arm runs only the slot it is called in, and nothing for a slot that is not this module's", () => {
  const fm = { object_type: "inquiry", references: [{ target: "x", rel: "supersedes" }] };
  const slot = (s) => run((f) => INQUIRY_GRAMMAR.arm({ fm }, f, { slot: s })).findings.map((x) => x.check);
  assert.deepEqual(slot("checkSupersession"), ["C-6.1", "C-6.1"]);
  assert.deepEqual(slot("checkRecheckCoverage"), ["C-15.1"]);
  assert.deepEqual(slot("checkInquiryExtension"), ["C-2.8"]);
  assert.deepEqual(slot("checkProjectExtension"), []);
  assert.deepEqual(run((f) => INQUIRY_GRAMMAR.arm({ fm }, f)).findings, []);
});
