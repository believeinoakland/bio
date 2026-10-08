/* case-checker: how a case uses its standards, judged offline over a carried `criteria` file (R22; N717, K2129; N763,
   K2140), at the interface `checkCaseFile`. The case file is the fixture's whole case (`./fixture.mjs`), its member A
   measured against a paywalled benchmark and C against a free standard that binds its body, with the edition's criteria
   rows as `public-read` R33 carries them: R72's rows with their labels. A row frozen before T37 carries no `captures`;
   one frozen since carries the captures the edition itself carries (`publication` R72 as amended, T37). */
import { test } from "node:test";
import assert from "node:assert/strict";
import * as CC from "../../../src/case-checker/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";
import { parseFrontmatter } from "../../../src/record-grammar/frontmatter.mjs";
import { contentIdFor } from "../../../src/content/extent.mjs";
import { caseFile, gradingFacts, byId, sha, A, B, C, MINUTES_SHA } from "./fixture.mjs";

const BENCH = "STD-2026-0001-peer-times";      // a benchmark (binds: false), paywalled
const CODE = "STD-2026-0002-lease-code";       // binds the body, free
const BODY = "ENT-2026-0001-board";
const RELIED = contentIdFor(MINUTES_SHA, { kind: "pdf-page", page: 0 }, null);   // A's one passage (the fixture's)
const LOOSE = sha("a passage no finding relies on");
const ALL_RECREATED = { [A]: "recreated", [C]: "recreated", [B]: "recreated" };
const results = (answer) => Object.fromEntries(answer.findings.map((f) => [f.finding, f.result]));

/** The criteria rows as `publication` R72 froze them before T37 and `public-read` R31 serves them: no row carries
 *  `captures`. `since(rows, captures)` is the same rows as R72 freezes them since T37, each row's `captures` given. */
const criteria = () => [
  { standard: BENCH, portion: null, designation: "Peer response times", edition: "2024", issuer: "an association", citation: "PRT 2024",
    access: "paywalled", body: BODY, binds: false, passages: [{ content: RELIED, text: "The lease was approved without a vote." }],
    label: "Benchmark · not binding on the board", access_words: "Behind a paywall" },
  { standard: CODE, portion: "s. 4", designation: "Lease code", edition: "2023", issuer: "the council", citation: "LC s. 4",
    access: "free", body: BODY, binds: true, passages: [], label: "Standard · binds the board", access_words: "Free to read" }];
const since = (rows, captures = {}) => rows.map((r) => (r.stated === "not held" ? { ...r, captures: null } : { ...r, captures: captures[r.standard] ?? [] }));
/** Each member's standard leg in the signed grading facts: A on the benchmark, C on the binding code. */
const facts = () => {
  const f = gradingFacts();
  const std = (target) => ({ target, kind: "standard", role: "supports", grade: "B", grade_axis: "capture", grade_source: "capture", ground: null });
  f[A].legs.push(std(BENCH)); f[C].legs.push(std(CODE));
  return f;
};
/** Each member's `case_conclusions:` row, as the publishing copy writes it. */
const conclusions = (claims) => ["case_conclusions:", ...[A, C].flatMap((m) => [`  - target: ${m}`, "    relationship: project",
  "    project: PROJ-2026-0001-parks", "    version: null", "    claim_state: adopted", `    claim: "${claims[m] ?? "It is as the record shows."}"`,
  '    claim_detail: ""', '    falsifier: "a later record"', "    concluded_by: alice", '    concluded_at: "2026-10-01T00:00:00Z"'])];
const SLOWER = { [A]: "The board approved it slower than the peer average.", [C]: "The board violated the lease code." };
const opts = (over = {}) => ({ facts: facts(), docLines: conclusions(over.claims || SLOWER), criteria: criteria(), ...over });
const check = (over = {}, args = {}) => CC.checkCaseFile({ parts: caseFile(opts(over)).parts, ...args });
/* The unjudged entry R22 adds for a copyrighted row that carries no captures. */
const blind = (standard = BENCH) => ({ standard, portion: null, body: BODY, check: "COPYRIGHTED_TEXT_CARRIED", detail: CC.CAPTURES_NOT_CARRIED_STATEMENT });

test("R22 R1: with no criteria file standards_use is null, in a /1 case file and a /2 one alike", async () => {
  const one = await CC.checkCaseFile({ parts: caseFile().parts });
  assert.equal(one.format, "bio-case-file/1");
  assert.equal(one.standards_use, null);
  assert.deepEqual(results(one), ALL_RECREATED);
  const none = await check({ criteria: undefined });
  assert.equal(none.standards_use, null);
  /* malformed input answers it null too */
  assert.equal((await CC.checkCaseFile({ parts: [] })).standards_use, null);
});

test("R22: a /2 case file carrying a criteria file answers standards_use, R21 over the case document, the file's rows, the materials and the passages; a paywalled row frozen before T37 (no captures) is named unjudged for COPYRIGHTED_TEXT_CARRIED, a free one is not; no finding's result changes", async () => {
  const r = await check();
  assert.equal(r.format, "bio-case-file/2");
  assert.deepEqual(r.integrity.departures, []);
  assert.deepEqual(r.standards_use, { ok: true, unjudged: [blind()] });
  assert.deepEqual(results(r), ALL_RECREATED);
  assert.equal(r.complete_edition.equal, true, r.complete_edition.detail);
  /* the answer is R21's own over the same arguments, with only the unjudged entry R22 adds */
  const cf = caseFile(opts({ claims: { [A]: "The board violated the peer average.", [C]: "Fine." } }));
  const read = CC.readCaseFile(cf.parts);
  const text = new TextDecoder().decode(read.files.find((f) => f.kind === "case_document").content);
  const fm = parseFrontmatter(text).data;
  const passages = Object.entries(CG.passagesOf(fm)).flatMap(([finding, rows]) => rows.map((p) => ({ ...p, finding })));
  const direct = CC.checkStandardsUse({ text, criteria: criteria(), materials: CG.materialsOf(fm).materials, passages });
  assert.deepEqual(direct, { ok: false, refusals: [{ code: "BENCHMARK_CALLED_NONCONFORMING", finding: A, standard: BENCH, word: "violated" }] });
  const viaFile = await CC.checkCaseFile({ parts: cf.parts });
  assert.deepEqual(viaFile.standards_use, { ...direct, unjudged: [blind()] });
  /* R16: the same arguments, the same answer */
  assert.equal(canonicalJson(viaFile), canonicalJson(await CC.checkCaseFile({ parts: cf.parts.map((p) => new Uint8Array(p)) })));
});

test("R22 (K1723): a member resting only on a benchmark called violated or nonconforming is refused by name; a member on a binding standard may say it; the refusal changes no finding's result", async () => {
  for (const word of CC.NONCONFORMING_WORDS) {
    const r = await check({ claims: { [A]: `The board's response was ${word.toUpperCase()} by any count.`, [C]: "Fine." } });
    assert.deepEqual(r.standards_use, { ok: false, refusals: [{ code: "BENCHMARK_CALLED_NONCONFORMING", finding: A, standard: BENCH, word }], unjudged: [blind()] }, word);
    assert.deepEqual(results(r), ALL_RECREATED, word);
    for (const f of r.findings) assert.equal(f.differs.some((e) => /standard|criteria/i.test(e.check)), false);
  }
  /* C rests on the binding code and says "violated" (SLOWER's claim): not refused */
  assert.equal((await check()).standards_use.ok, true);
});

test("R22 (K1739): a passage of the paywalled standard that no finding relies on is refused; a row stated not held is named unjudged in R21's shape; a row that does carry captures is judged for COPYRIGHTED_TEXT_CARRIED", async () => {
  const loose = criteria(); loose[0].passages.push({ content: LOOSE, text: "the whole chapter" });
  const r = await check({ criteria: loose });
  assert.deepEqual(r.standards_use, { ok: false, refusals: [{ code: "COPYRIGHTED_PASSAGE_UNRELIED", standard: BENCH, content: LOOSE }], unjudged: [blind()] });
  assert.deepEqual(results(r), ALL_RECREATED);
  /* not held: R21 names it, with nothing else of it judged */
  const held = criteria(); held[0] = { standard: BENCH, portion: null, designation: null, edition: null, issuer: null, citation: null, access: null,
    body: null, binds: null, passages: null, label: null, access_words: null, stated: "not held" };
  assert.deepEqual((await check({ criteria: held, claims: { [A]: "The board violated the peer average.", [C]: "Fine." } })).standards_use,
    { ok: true, unjudged: [{ standard: BENCH, portion: null, body: null }] });
  /* a row carrying the capture that holds the standard's text (the minutes, listed included: true) is judged */
  const caps = criteria(); caps[0].captures = [MINUTES_SHA];
  assert.deepEqual((await check({ criteria: caps })).standards_use, { ok: false, refusals: [{ code: "COPYRIGHTED_TEXT_CARRIED", standard: BENCH, sha: MINUTES_SHA }] });
  /* a reading-room standard with no captures is not free: named unjudged too */
  const room = criteria(); room[1].access = "reading_room";
  assert.deepEqual((await check({ criteria: room })).standards_use.unjudged, [blind(BENCH), { ...blind(CODE), portion: "s. 4" }]);
});

test("R22 R9 R2: a criteria file listed but not carried answers standards_use not judged, naming the file to fetch there and among the files to supply; supplied later it is judged; carried with other bytes it is not judged; neither changes a finding's result or holds back the complete edition", async () => {
  const path = CG.caseFilePath("criteria");
  const fileSha = sha(canonicalJson(criteria()));
  const gone = caseFile(opts({ edit: (b) => b.delete(path) }));
  const before = await CC.checkCaseFile({ parts: gone.parts });
  assert.deepEqual(before.standards_use, { ok: null, file: path, sha256: fileSha,
    detail: `the criteria the case measures against are not carried; fetch the file whose SHA-256 is ${fileSha}` });
  assert.deepEqual(results(before), ALL_RECREATED);
  assert.equal(before.complete_edition.equal, true, before.complete_edition.detail);
  /* K2143: it is named among the files to supply */
  assert.deepEqual(before.integrity.documents.wanted, [{ path, kind: "criteria", sha256: fileSha, detail: `${path} is not carried; fetch the file whose SHA-256 is ${fileSha}` }]);
  const after = await CC.checkCaseFile({ parts: gone.parts, documents: [Buffer.from(canonicalJson(criteria()))] });
  assert.deepEqual(after.standards_use, { ok: true, unjudged: [blind()] });
  assert.deepEqual(after.integrity.documents.used, [fileSha]);
  assert.deepEqual(after.integrity.documents.wanted, []);
  /* carried with other bytes */
  const changed = await CC.checkCaseFile({ parts: caseFile(opts({ edit: (b) => b.set(path, Buffer.from("[]")) })).parts });
  assert.equal(changed.standards_use.ok, null);
  assert.match(changed.standards_use.detail, /^the criteria the case measures against are not judged, because .* does not match the manifest/);
  assert.equal(changed.integrity.intact, false);
  assert.deepEqual(changed.integrity.documents.wanted, [{ path, kind: "criteria", sha256: fileSha, detail: `${path} is carried with other bytes; fetch the file whose SHA-256 is ${fileSha}` }]);
  assert.deepEqual(results(changed), ALL_RECREATED);
  assert.equal(changed.complete_edition.equal, true, changed.complete_edition.detail);
});

test("R22 (T37; N763, K2140): rows frozen with their captures are judged offline exactly as R21 judges them at the ceremony: a carried capture of a paywalled standard is COPYRIGHTED_TEXT_CARRIED, an unrelied passage COPYRIGHTED_PASSAGE_UNRELIED, empty captures nothing; only a row frozen before T37 is named unjudged, never filled; no finding's result changes", async () => {
  /* the paywalled benchmark's capture is not one the edition carries: R72 freezes no capture for it, and nothing is refused or unjudged */
  const none = await check({ criteria: since(criteria()) });
  assert.deepEqual(none.standards_use, { ok: true });
  assert.deepEqual(results(none), ALL_RECREATED);
  assert.equal(none.complete_edition.equal, true, none.complete_edition.detail);
  /* its capture is the minutes, which the edition lists included: true: the whole text travels, refused by name */
  const carried = await check({ criteria: since(criteria(), { [BENCH]: [MINUTES_SHA] }) });
  assert.deepEqual(carried.standards_use, { ok: false, refusals: [{ code: "COPYRIGHTED_TEXT_CARRIED", standard: BENCH, sha: MINUTES_SHA }] });
  assert.deepEqual(results(carried), ALL_RECREATED);
  /* a passage of it no finding relies on, beside the carried capture: every departure named */
  const loose = since(criteria(), { [BENCH]: [MINUTES_SHA] }); loose[0].passages.push({ content: LOOSE, text: "the whole chapter" });
  const both = await check({ criteria: loose, claims: { [A]: "The board violated the peer average.", [C]: "Fine." } });
  assert.deepEqual(both.standards_use, { ok: false, refusals: [{ code: "COPYRIGHTED_TEXT_CARRIED", standard: BENCH, sha: MINUTES_SHA },
    { code: "COPYRIGHTED_PASSAGE_UNRELIED", standard: BENCH, content: LOOSE },
    { code: "BENCHMARK_CALLED_NONCONFORMING", finding: A, standard: BENCH, word: "violated" }] });
  assert.deepEqual(results(both), ALL_RECREATED);
  /* the answer is R21's own over the same arguments, nothing added */
  const cf = caseFile(opts({ criteria: loose }));
  const read = CC.readCaseFile(cf.parts);
  const text = new TextDecoder().decode(read.files.find((f) => f.kind === "case_document").content);
  const fm = parseFrontmatter(text).data;
  const passages = Object.entries(CG.passagesOf(fm)).flatMap(([finding, rows]) => rows.map((p) => ({ ...p, finding })));
  assert.deepEqual((await CC.checkCaseFile({ parts: cf.parts })).standards_use,
    CC.checkStandardsUse({ text, criteria: loose, materials: CG.materialsOf(fm).materials, passages }));
  /* a row frozen before T37 beside one frozen since: only it is named unjudged; its capture is never filled from the
     materials, so the minutes travelling whole is not refused for it */
  const mixed = [criteria()[0], ...since([criteria()[1]])];
  const old = await check({ criteria: mixed });
  assert.deepEqual(old.standards_use, { ok: true, unjudged: [blind()] });
  const room = since(criteria()); room[1].access = "reading_room";
  assert.deepEqual((await check({ criteria: [criteria()[0], room[1]] })).standards_use, { ok: true, unjudged: [blind()] });
  /* a row stated not held carries captures: null and is named as R21 names it, not as a row frozen before T37 */
  const held = since([{ standard: BENCH, portion: null, designation: null, edition: null, issuer: null, citation: null, access: null,
    body: null, binds: null, passages: null, label: null, access_words: null, stated: "not held" }]);
  assert.deepEqual((await check({ criteria: held })).standards_use, { ok: true, unjudged: [{ standard: BENCH, portion: null, body: null }] });
});

test("R22: a criteria file that is not a list of rows answers R21's MALFORMED, and never throws", async () => {
  for (const [text, field] of [["not json", "criteria"], ['{"rows":[]}', "criteria"], ["[1]", "criteria[0]"], ['[{"access":"free"}]', "criteria[0].standard"]]) {
    const r = await check({ criteria: text });
    assert.deepEqual(r.standards_use, { ok: false, refusals: [{ code: "MALFORMED", field }] }, text);
    assert.deepEqual(results(r), ALL_RECREATED, text);
  }
  /* an empty list (an edition whose members target no standard) judges nothing */
  assert.deepEqual((await check({ criteria: [] })).standards_use, { ok: true });
});
