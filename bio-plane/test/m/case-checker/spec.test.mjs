/* case-checker: the readable specification (R14), the two public reads (R15) and the outward text (R17). */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CC from "../../../src/case-checker/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { PublicRead } from "../../../src/public-read/index.mjs";
import { STRENGTH_AXES } from "../../../src/strength/arithmetic.mjs";

const SPEC = CC.CASE_FILE_SPECS["bio-case-file/1"];
/* Every word the specification spells as code: each backticked span's identifiers. */
const CODE = new Set([...SPEC.matchAll(/`([^`]+)`/g)].flatMap((m) => [m[1], ...m[1].split(/[^A-Za-z0-9_./-]+/)]));
const named = (word) => CODE.has(word);

test("R14: the specification of bio-case-file/1 is held with this module, its version naming the format it specifies", () => {
  assert.deepEqual(CC.CASE_FILE_SPEC_VERSIONS, [CG.CASE_FILE_FORMAT]);
  assert.match(SPEC, /^# The case file, format bio-case-file\/1\n/);
});

test("R14: it states every field, kind and rule a checker needs, from case-grammar R11–R13 and R16–R17", () => {
  const words = [
    ...CG.CASE_FILE_MANIFEST_FIELDS, ...CG.CASE_FILE_KEY_FIELDS, ...CG.CASE_FILE_PART_FIELDS, ...CG.CASE_FILE_FILE_FIELDS,
    ...CG.CASE_FILE_KINDS, ...CG.METHOD_FIELDS, ...CG.MATERIAL_FIELDS, ...CG.MATERIAL_ATTESTATION_FIELDS, ...CG.ATTESTATION_BY_KINDS,
    ...CG.ACCEPTED_WORK_FIELDS, ...CG.MATERIAL_KINDS, ...CG.MATERIAL_RESTS_UNDER, ...STRENGTH_AXES,
    CG.CASE_FILE_MANIFEST_PATH, CG.GROUP_ATTESTATION_SIGNATURE,
    "case_id", "case_edition", "case_findings", "case_roles", "case_strength", "required_strength", "capture_accounts",
    "observation_attributions", "content_id", "capture_sha", "extent", "chain", "quoted", "legs", "answer",
    "load_bearing", "supporting", "recreated", "recreated_in_part", "did_not_recreate", "bio-ratify", "ssh-ed25519",
  ];
  const missing = [...new Set(words)].filter((w) => !named(w));
  assert.deepEqual(missing, []);
  /* every path the format spells, and each statement a signature is over */
  for (const p of [CG.caseFilePath("case_document"), CG.caseFilePath("case_signature"), CG.caseFilePath("complete_edition"),
                   CG.caseFilePath("finding", "<finding>"), CG.caseFilePath("finding_signature", "<finding>"),
                   CG.caseFilePath("grading_facts", "<finding>"), CG.caseFilePath("passages", "<finding>")].filter(Boolean))
    assert.ok(SPEC.includes(p), p);
  for (const s of ["bio-ratify-case <case_id> <case_edition> <case_document_sha>", "bio-ratify <finding id> <version_sha>",
                   "bio-capture-account <capture sha>"]) assert.ok(SPEC.includes(s), s);
  /* the checks, one numbered rule each: integrity, signatures, passages, grades, the bar, publication checks,
     presentability, completion, the complete edition, another group's work */
  for (const h of ["Integrity", "Signatures", "Passages", "Grades", "The bar", "Publication checks", "Presentability", "Completion",
                   "The complete edition", "Another group's work"]) assert.match(SPEC, new RegExp(`\\n\\d+\\. ${h}\\.`), h);
});

test("R15: at start the module registers casechecker and casefilespec with public-read, credential-free; a second registration is refused", async () => {
  const pr = new PublicRead({ storage: { sql: null }, publication: null, docket: null });
  const host = {};
  const answer = CC.registerCaseCheckerPublicReads(host, { publicRead: pr });
  assert.deepEqual(answer, { ok: true, module: "case-checker", names: ["casechecker", "casefilespec"] });
  assert.equal(CC.registerCaseCheckerPublicReads(host, { publicRead: pr }), answer);   /* once per host */
  assert.deepEqual(pr.publicReads(), [{ name: "casechecker", module: "case-checker", params: [] },
                                      { name: "casefilespec", module: "case-checker", params: ["version"] }]);
  const program = pr.publicRead("casechecker", { token: "secret", viewer: "x" });
  assert.equal(program.ok, true);
  assert.equal(program.result.program, CC.PROGRAM);
  assert.equal(program.result.sha256, CC.PROGRAM_SHA256);
  const spec = pr.publicRead("casefilespec", { version: "bio-case-file/1" });
  assert.deepEqual([spec.ok, spec.result.held, spec.result.text], [true, true, CC.CASE_FILE_SPECS["bio-case-file/1"]]);
  /* an unknown or absent version is answered with the versions held */
  for (const q of [{ version: "bio-case-file/9" }, {}]) {
    const r = pr.publicRead("casefilespec", q);
    assert.equal(r.ok, true);
    assert.equal(r.result.held, false);
    assert.deepEqual(r.result.versions, ["bio-case-file/1"]);
    assert.equal("text" in r.result, false);
  }
  /* another module cannot take the names */
  const again = new PublicRead({ storage: { sql: null } });
  again.registerPublicReads("someone-else", { casechecker: () => 1 });
  assert.equal(CC.registerCaseCheckerPublicReads({}, { publicRead: again }).reason, "PROVIDER_DECLARED");
});

test("R17: no place is named in this module's behaviour or outward text", async () => {
  const outward = JSON.stringify([
    Object.fromEntries(Object.entries(CC).filter(([k, v]) => typeof v !== "function" && k !== "PROGRAM")),
    CC.CHECKS_VERSION_STATEMENT("1.0.0", "2.0.0"), CC.caseFileSpec("x"), await CC.checkCaseFile({ parts: [] }),
    await CC.runProgram([], async () => null),
  ]);
  for (const place of ["Oakland", "California", "Alameda", "Berkeley", "San Francisco", "Sacramento", "Brown Act", "CPRA",
                       "United States", "County", "City of"])
    assert.equal(outward.includes(place), false, `names ${place}`);
});
