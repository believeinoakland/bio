/* case-checker: the readable specification (R14), the two public reads (R15) and the outward text (R17). */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CC from "../../../src/case-checker/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { PublicRead } from "../../../src/public-read/index.mjs";
import { STRENGTH_AXES } from "../../../src/strength/arithmetic.mjs";

const V1 = "bio-case-file/1", V2 = "bio-case-file/2";
/* Every word a specification spells as code: each backticked span's identifiers. */
const codeOf = (spec) => new Set([...spec.matchAll(/`([^`]+)`/g)].flatMap((m) => [m[1], ...m[1].split(/[^A-Za-z0-9_./-]+/)]));

test("R14: the specifications of bio-case-file/1 and bio-case-file/2 are held with this module, oldest first, each version naming the format it specifies; /2 is the current format", () => {
  assert.deepEqual(CC.CASE_FILE_SPEC_VERSIONS, [V1, V2]);
  assert.equal(CG.CASE_FILE_FORMAT, V2);
  for (const v of CC.CASE_FILE_SPEC_VERSIONS) {
    assert.ok(CC.CASE_FILE_SPECS[v].startsWith(`# The case file, format ${v}\n`), v);
    assert.ok(CC.CASE_FILE_SPECS[v].includes(`\`format\`: \`${v}\`.`), v);
  }
  /* /2 says how a /1 case file is read: as written, its manifest naming none of the kinds /2 adds */
  assert.match(CC.CASE_FILE_SPECS[V2], /A `bio-case-file\/1` case file is read as written, by its own specification, which is held beside this one: its manifest names none of the kinds version 2 adds/);
  assert.equal(CC.CASE_FILE_SPECS[V1].includes("bio-case-file/2"), false);
});

for (const v of [V1, V2]) test(`R14 R20: the specification of ${v} states every field, kind and rule a checker needs, from case-grammar R11–R13 and R16–R18`, () => {
  const SPEC = CC.CASE_FILE_SPECS[v];
  const CODE = codeOf(SPEC);
  const named = (word) => CODE.has(word);
  /* the kinds /2 adds are /2's alone (case-grammar R13: a /1 manifest naming one departs) */
  const added = ["archive", "container", "criteria"];
  assert.deepEqual(added.filter((k) => CG.CASE_FILE_KINDS.includes(k)), added);
  const words = [
    ...CG.CASE_FILE_MANIFEST_FIELDS, ...CG.CASE_FILE_KEY_FIELDS, ...CG.CASE_FILE_PART_FIELDS, ...CG.CASE_FILE_FILE_FIELDS,
    ...CG.CASE_FILE_KINDS.filter((k) => v === V2 || !added.includes(k)), ...CG.METHOD_FIELDS, ...CG.MATERIAL_FIELDS, ...CG.MATERIAL_ATTESTATION_FIELDS, ...CG.ATTESTATION_BY_KINDS,
    ...CG.ACCEPTED_WORK_FIELDS, ...CG.GRADING_FACT_FIELDS, ...CG.PASSAGE_FIELDS, ...CG.CALCULATION_FIELDS, ...CG.RECOMPUTE_STATUSES,
    ...CG.TIMELINE_FIELDS, ...CG.TIMELINE_LANES, ...CG.MATERIAL_KINDS, ...CG.MATERIAL_RESTS_UNDER, ...STRENGTH_AXES,
    CG.CASE_FILE_MANIFEST_PATH, CG.GROUP_ATTESTATION_SIGNATURE,
    "case_id", "case_edition", "case_findings", "case_roles", "case_strength", "required_strength", "capture_accounts",
    "observation_attributions", "content_id", "capture_sha", "extent", "chain", "quoted", "legs", "answer",
    "load_bearing", "supporting", "recreated", "recreated_in_part", "did_not_recreate", "bio-ratify", "ssh-ed25519",
    /* R20: the calculations block (case-grammar R18) and its answers */
    "calculations", "calc", "recipe", "inputs", "method_version", "results", "result_key", "recompute", "disclosed", "bio-calc/1",
    "agrees", "differs", "unbound", "not_recomputed", "calculation", "timeline",
  ];
  const missing = [...new Set(words)].filter((w) => !named(w));
  assert.deepEqual(missing, []);
  /* every path the format spells, and each statement a signature is over */
  for (const p of [CG.caseFilePath("case_document"), CG.caseFilePath("case_signature"), CG.caseFilePath("complete_edition"),
                   CG.caseFilePath("finding", "<finding>"), CG.caseFilePath("finding_signature", "<finding>"),
                   CG.caseFilePath("grading_facts", "<finding>"), CG.caseFilePath("passages", "<finding>")].filter(Boolean))
    assert.ok(SPEC.includes(p), p);
  /* the calculation kind's three paths, and the rule that an input is named by its SHA-256 (case-grammar R13, R18, R19) */
  const H = "a".repeat(64);
  for (const p of [CG.caseFilePath("calculation", "CALC-1").replace("CALC-1", "<calc>"),
                   CG.caseFilePath("calculation", ["CALC-1", H]).replace("CALC-1", "<calc>").replace(H, "<sha256>"),
                   CG.caseFilePath("calculation", "prov")])
    assert.ok(SPEC.includes(p), p);
  assert.match(SPEC, /named by its SHA-256 \(the manifest lists it with that SHA-256, or it departs: the input_sha rule\)/);
  for (const s of ["bio-ratify-case <case_id> <case_edition> <case_document_sha>", "bio-ratify <finding id> <version_sha>",
                   "bio-capture-account <capture sha>"]) assert.ok(SPEC.includes(s), s);
  /* the checks, one numbered rule each: integrity, signatures, passages, grades, the bar, publication checks,
     presentability, completion, the complete edition, another group's work, calculations (R20) */
  for (const h of ["Integrity", "Signatures", "Passages", "Grades", "The bar", "Publication checks", "Presentability", "Completion",
                   "The complete edition", "Another group's work", "Calculations"]) assert.match(SPEC, new RegExp(`\\n\\d+\\. ${h}\\.`), h);
  /* the case document formats it reads, and the product name the complete edition renders by format (DEC-124) */
  for (const w of ["bio-case-document/7", "bio-case-document/6", "CivicOS", "Civicsmith"]) assert.ok(named(w), w);
  assert.match(SPEC, /`bio-case-document\/6` document, or an earlier one, renders `CivicOS`, and a `bio-case-document\/7` document renders `Civicsmith`/);
});

test("R14 R22 (K2129): bio-case-file/2 states the kinds it adds with their paths, the criteria row's fields, the member's subject, and the check of the standards' use with its codes and words", () => {
  const SPEC = CC.CASE_FILE_SPECS[V2];
  const named = (word) => codeOf(SPEC).has(word);
  /* each kind at the path case-grammar spells it, as the spec writes the path's parts */
  const H = "a".repeat(64), H2 = "b".repeat(64);
  const shown = (p) => p.replace("REF-1", "<ref>").replace(H, "<sha256>").replace(H2, "<sha256>");
  for (const [kind, key] of [["archive", ["REF-1", H]], ["container", ["REF-1", H2]], ["criteria", null]]) {
    const p = CG.caseFilePath(kind, key);
    assert.ok(p, kind);
    assert.ok(SPEC.includes(`\`${kind}\` at \`${shown(p)}\``), `${kind} at ${shown(p)}`);
    assert.deepEqual(CG.caseFileEntryOf(p).kind, kind);
  }
  assert.match(SPEC, /An `archive` or `container` file under a `ref` that carries no `document` departs/);
  assert.match(SPEC, /`criteria` at `criteria\.json`, at most once/);
  assert.ok(SPEC.includes('`stated: "not held"`'));
  /* the criteria row as publication R72 freezes it and public-read R31 serves it */
  for (const w of ["standard", "portion", "designation", "edition", "issuer", "citation", "access", "body", "binds", "passages", "label",
                   "access_words", "content", "text", "free", "reading_room", "paywalled", "subject_entity", "case_conclusions:",
                   "claim", "claim_detail", "case_scope", "statement"]) assert.ok(named(w), w);
  /* rule 12: the three checks by their codes, the words a benchmark-only member never uses, and the unjudged offline arm */
  assert.match(SPEC, /\n12\. Standards' use\./);
  for (const code of CC.STANDARDS_USE_CODES.filter((c) => c !== "MALFORMED")) assert.ok(named(code), code);
  for (const w of CC.NONCONFORMING_WORDS) assert.ok(named(w), w);
  assert.match(SPEC, /this is not judged offline: each such row is named as not judged for this check/);
  assert.match(SPEC, /it changes no finding's result/);
  /* /2 keeps every rule of /1 */
  for (const h of ["Integrity", "Signatures", "Passages", "Grades", "The bar", "Publication checks", "Presentability", "Completion",
                   "The complete edition", "Another group's work", "Calculations", "Standards' use"]) assert.match(SPEC, new RegExp(`\\n\\d+\\. ${h}\\.`), h);
});

test("R15 (DEC-149): at start the module registers casechecker and casefilespec with public-read, credential-free; a second registration is refused", async () => {
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
  for (const v of [V1, V2]) {
    const spec = pr.publicRead("casefilespec", { version: v });
    assert.deepEqual([spec.ok, spec.result.held, spec.result.version, spec.result.text, spec.result.versions], [true, true, v, CC.CASE_FILE_SPECS[v], [V1, V2]]);
  }
  /* an unknown or absent version is answered with the versions held */
  for (const q of [{ version: "bio-case-file/9" }, {}]) {
    const r = pr.publicRead("casefilespec", q);
    assert.equal(r.ok, true);
    assert.equal(r.result.held, false);
    assert.deepEqual(r.result.versions, [V1, V2]);
    assert.equal("text" in r.result, false);
  }
  /* DEC-149 (T34-87; K1821): the reader has no credential, so the detail speaks of this group's Civicsmith, never "this copy" */
  const unknown = pr.publicRead("casefilespec", { version: "bio-case-file/9" }).result.detail;
  assert.equal(unknown, "this group's Civicsmith holds no specification of that version; it holds the specifications of bio-case-file/1 and bio-case-file/2, each named as version");
  assert.equal(/this (copy|plane|instance)/.test(unknown + CC.caseFileSpec(null).detail), false);
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
