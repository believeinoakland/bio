/* case-checker: the gates' words by key (R26; T50-73; N1181, K3560, DEC-299), at the interface: `checkStandardsUse` and
   `checkCaseFile` answer each departure with `says: {key, vars}`, the members' words read through `setup-words`
   `word(key, vars)`, and the standalone program prints those sentences offline. No test here reads English from the
   module's source: the sentences are read through `word` and compared with what the program prints. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import * as CC from "../../../src/case-checker/index.mjs";
import { buildProgram } from "../../../src/case-checker/build-program.mjs";
import { SAYS_WORDS } from "../../../src/case-checker/says-words.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { contentIdFor } from "../../../src/content/extent.mjs";
import { caseFile, gradingFacts, sha, A, B, C, MINUTES_SHA } from "./fixture.mjs";

const BENCH = "STD-2026-0001-peer-times";      // a benchmark (binds: false), paywalled
const CODE = "STD-2026-0002-lease-code";       // binds the body, free
const BODY = "ENT-2026-0001-board";
const RELIED = contentIdFor(MINUTES_SHA, { kind: "pdf-page", page: 0 }, null);
const LOOSE = sha("a passage no finding relies on");

const criteria = () => [
  { standard: BENCH, portion: null, designation: "Peer response times", edition: "2024", issuer: "an association", citation: "PRT 2024",
    access: "paywalled", body: BODY, binds: false, passages: [{ content: RELIED, text: "The lease was approved without a vote." }, { content: LOOSE, text: "the whole chapter" }],
    captures: [MINUTES_SHA], label: "Benchmark · not binding on the board", access_words: "Behind a paywall" },
  { standard: CODE, portion: "s. 4", designation: "Lease code", edition: "2023", issuer: "the council", citation: "LC s. 4",
    access: "free", body: BODY, binds: true, passages: [], captures: [], label: "Standard · binds the board", access_words: "Free to read" }];
const facts = () => {
  const f = gradingFacts();
  const std = (target) => ({ target, kind: "standard", role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture", ground: null });
  f[A].legs.push(std(BENCH)); f[C].legs.push(std(CODE));
  return f;
};
const conclusions = (claims) => ["case_conclusions:", ...[A, C].flatMap((m) => [`  - target: ${m}`, "    relationship: project",
  "    project: PROJ-2026-0001-parks", "    version: null", "    claim_state: adopted", `    claim: "${claims[m]}"`,
  '    claim_detail: ""', '    falsifier: "a later record"', "    concluded_by: alice", '    concluded_at: "2026-10-01T00:00:00Z"'])];
/* A case file with all three arms departing: the benchmark's capture travels whole, a passage no finding relies on, and
   "violated" said of a benchmark. */
const refusing = () => caseFile({ facts: facts(), criteria: criteria(),
  docLines: conclusions({ [A]: "The board violated the peer average.", [C]: "Fine." }) });

const FIELDS = ["standard", "sha", "content", "finding", "word", "field"];
const walk = (v, f) => { f(v); if (v && typeof v === "object") for (const x of Object.values(v)) walk(x, f); };

/* One fixture per code, at the interface `checkStandardsUse`. */
const doc = ["---", "format: bio-case-document/7", "case_id: CASE-2026-0001", "case_edition: 1", 'case_scope: "A scope."',
  `case_findings: [${A}]`, "case_roles:", `  - target: ${A}`, "    role: load_bearing", `    version_sha: ${sha(A)}`, "    edition: 1",
  "case_conclusions:", `  - target: ${A}`, "    claim_state: adopted", '    claim: "It violated the peer average."', '    claim_detail: ""',
  ...CG.gradingFactsLines([{ finding: A, ord: 0, target: BENCH, kind: "standard", role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture", ground: null }]),
  "completeness:", '  statement: "A statement."', "  author: alice", "---", "", "# Case", "", ""].join("\n");
const standardArgs = () => ({ text: doc,
  criteria: [{ standard: BENCH, portion: null, access: "paywalled", body: null, binds: false, captures: [MINUTES_SHA], passages: [{ content: LOOSE, text: "x" }] }],
  materials: [{ ref: "INFO-2026-0001-m", kind: "document", sha: MINUTES_SHA, included: true }], passages: [] });
const FIXTURES = {
  MALFORMED: () => ({}),
  COPYRIGHTED_TEXT_CARRIED: standardArgs,
  COPYRIGHTED_PASSAGE_UNRELIED: standardArgs,
  BENCHMARK_CALLED_NONCONFORMING: standardArgs,
};

test("R26: each of the four codes answers a departure whose says is {key: refusal.<code>, vars: the departure's own fields}, and word(key, vars) is a non-empty sentence", () => {
  assert.deepEqual(CC.STANDARDS_USE_CODES, Object.keys(FIXTURES));
  assert.deepEqual(CC.STANDARDS_USE_KEYS, CC.STANDARDS_USE_CODES.map((c) => `refusal.${c}`));
  for (const code of CC.STANDARDS_USE_CODES) {
    const r = CC.checkStandardsUse(FIXTURES[code]());
    const d = r.refusals.find((x) => x.code === code);
    assert.ok(d, `${code} is answered for its fixture`);
    const { code: _c, says, ...vars } = d;
    assert.deepEqual(says, { key: `refusal.${code}`, vars }, code);
    assert.ok(Object.keys(vars).every((k) => FIELDS.includes(k)), `${code}: only the departure's own fields`);
    assert.equal(hasWord(says.key), true, says.key);
    const sentence = word(says.key, says.vars);
    assert.equal(typeof sentence, "string");
    assert.ok(sentence.trim().length > 0, code);
    /* identifiers stay: nothing member-facing is answered beside the code and the fields */
    assert.deepEqual(Object.keys(d).filter((k) => k !== "code" && k !== "says" && !FIELDS.includes(k)), [], code);
  }
});

test("R26: every refusal of an answer that names several carries its own says, in the arms' order; MALFORMED names each field it says", () => {
  const r = CC.checkStandardsUse(standardArgs());
  assert.deepEqual(r.refusals.map((x) => x.code), ["COPYRIGHTED_TEXT_CARRIED", "COPYRIGHTED_PASSAGE_UNRELIED", "BENCHMARK_CALLED_NONCONFORMING"]);
  for (const d of r.refusals) assert.equal(d.says.key, `refusal.${d.code}`);
  const bad = CC.checkStandardsUse({ text: 5, criteria: "x", materials: [], passages: [] });
  assert.deepEqual(bad.refusals.map((x) => x.says), [{ key: "refusal.MALFORMED", vars: { field: "text" } }, { key: "refusal.MALFORMED", vars: { field: "criteria" } }]);
  for (const hostile of [undefined, null, 7, { get text() { throw new Error("boom"); } }])
    assert.deepEqual(CC.checkStandardsUse(hostile).refusals.map((x) => x.says), [{ key: "refusal.MALFORMED", vars: { field: "arguments" } }]);
  /* R16: the same arguments, the same answer */
  assert.deepEqual(CC.checkStandardsUse(standardArgs()), CC.checkStandardsUse(standardArgs()));
});

test("R26 R22: checkCaseFile answers standards_use with the same says on each departure, and no finding's result changes", async () => {
  const cf = refusing();
  const r = await CC.checkCaseFile({ parts: cf.parts });
  assert.deepEqual(r.standards_use.refusals.map((x) => x.code), ["COPYRIGHTED_TEXT_CARRIED", "COPYRIGHTED_PASSAGE_UNRELIED", "BENCHMARK_CALLED_NONCONFORMING"]);
  for (const d of r.standards_use.refusals) {
    const { code, says, ...vars } = d;
    assert.deepEqual(says, { key: `refusal.${code}`, vars }, code);
    assert.ok(word(says.key, says.vars).trim().length > 0, code);
  }
  assert.deepEqual(Object.fromEntries(r.findings.map((f) => [f.finding, f.result])), { [A]: "recreated", [C]: "recreated", [B]: "recreated" });
});

test("R26 (control): an {ok: true} answer carries no says, nor does a standards_use that is null or not judged; every code the module answers has a key the word list holds, so no departure goes without one", async () => {
  const ok = CC.checkStandardsUse({ ...standardArgs(), criteria: [], materials: [] });
  assert.equal(ok.ok, true);
  let says = 0; walk(ok, (v) => { if (v && typeof v === "object" && "says" in v) says++; });
  assert.equal(says, 0);
  assert.equal((await CC.checkCaseFile({ parts: caseFile().parts })).standards_use, null);
  const notHeld = CC.checkStandardsUse({ ...standardArgs(), criteria: [{ standard: BENCH, stated: "not held" }], materials: [] });
  assert.deepEqual(notHeld, { ok: true, unjudged: [{ standard: BENCH, portion: null, body: null }] });
  for (const code of CC.STANDARDS_USE_CODES) assert.equal(hasWord(`refusal.${code}`), true, code);
});

test("R26 R13: the program carries the keys it uses as data and prints each departure as the sentence word(key, vars) reads, in-process and run offline from a fresh build", async () => {
  /* the data the program carries is what word reads, key for key */
  assert.deepEqual(Object.keys(SAYS_WORDS), [...CC.STANDARDS_USE_KEYS]);
  for (const k of CC.STANDARDS_USE_KEYS) assert.equal(SAYS_WORDS[k], word(k), `${k}: says-words.mjs is stale; run node bio-plane/src/case-checker/build-program.mjs`);
  const cf = refusing();
  const expected = await CC.checkCaseFile({ parts: cf.parts });
  const sentences = expected.standards_use.refusals.map((d) => word(d.says.key, d.says.vars));
  assert.equal(sentences.length, 3);
  const files = new Map([["a.zip", cf.parts[0]]]);
  const inProcess = await CC.runProgram(["a.zip"], async (p) => files.get(p));
  const lines = inProcess.text.split("\n");
  const results = expected.findings.length;
  assert.deepEqual(lines.slice(results, results + sentences.length), sentences);
  assert.equal(lines[results + sentences.length], "");
  /* the whole answer after them is checkCaseFile's own, with its says */
  assert.deepEqual(JSON.parse(inProcess.text.slice(inProcess.text.indexOf("{"))).standards_use.refusals, JSON.parse(JSON.stringify(expected.standards_use.refusals)));
  /* a fresh build of the program (not the committed program.mjs, which BOB regenerates at the layer's close) run from an empty directory */
  const built = await buildProgram();
  const dir = mkdtempSync(join(tmpdir(), "case-checker-says-"));
  try {
    writeFileSync(join(dir, "case-checker.mjs"), built.text);
    cf.parts.forEach((p, i) => writeFileSync(join(dir, `part${i + 1}.zip`), p));
    const out = execFileSync(process.execPath, ["case-checker.mjs", ...cf.parts.map((_, i) => `part${i + 1}.zip`)], { cwd: dir, encoding: "utf8", env: { PATH: process.env.PATH } });
    const outLines = out.split("\n");
    assert.deepEqual(outLines.slice(results, results + sentences.length), sentences);
    assert.equal(built.text.includes("refusal.COPYRIGHTED_TEXT_CARRIED"), true);
  } finally { rmSync(dir, { recursive: true, force: true }); }
  /* control: a case with nothing to refuse prints no sentence of these */
  const clean = await CC.runProgram(["a.zip"], async () => caseFile().parts[0]);
  for (const s of Object.values(SAYS_WORDS)) assert.equal(clean.text.includes(s), false);
});
