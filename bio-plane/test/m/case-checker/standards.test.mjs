/* case-checker: how a case uses the standards it measures against (R21; N648; K1723, K1739), at the interface
   `checkStandardsUse({text, criteria, materials, passages})`. The case document is written with the writers the
   publishing copy uses: `case-grammar`'s `grading_facts:` lines (its R17) and `ratification`'s `case_conclusions:` rows. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import * as CC from "../../../src/case-checker/index.mjs";
import * as CG from "../../../src/case-grammar/index.mjs";
import { caseConclusionRowLines } from "../../../src/ratification/index.mjs";
import { canonicalJson } from "../../../src/record-grammar/json.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const A = "INQ-2026-0001-response";     // member, measured against a benchmark
const B = "INQ-2026-0002-permits";      // member, measured against a standard that binds the body
const R = "INQ-2026-0003-reached";      // reached from A's chain, not a member
const BENCH = "STD-2026-0001-peer-times";       // a benchmark (binds: false), paywalled
const CODE = "STD-2026-0002-permit-code";       // binds the body, free
const BOOK = "STD-2026-0003-practice-manual";   // a benchmark, free
const BENCH_CAP = sha("the paywalled standard, as a member captured it");
const CODE_CAP = sha("the permit code");
const RELIED = sha("passage relied on"), LOOSE = sha("passage no finding relies on");

const leg = (finding, ord, target, kind = "standard") => ({ finding, ord, target, kind, role: "supports", grade: "B",
  grade_axis: "capture", grade_source: "capture", ground: null });
const conclusion = (claim, detail = "") => ({ relationship: "project", project: "PROJ-2026-0001-x", version: null,
  claim: { state: "adopted", text: claim, detail }, falsifier: "a later count", by: "alice", at: "2026-10-01T00:00:00Z" });

/** A case document's text: `claims` per member, `legs` the signed grading facts, and the case's own statements. */
function doc({ claims = { [A]: "Responses here were slower than the peer average.", [B]: "The permits violated the code." },
               details = {}, legs = [leg(A, 0, BENCH), leg(A, 1, R, "inquiry"), leg(B, 0, CODE), leg(R, 0, BOOK)],
               scope = "How quickly the office answers, and whether its permits follow the code.",
               statement = "the 2019 permits are not covered", body = "", members = [A, B] } = {}) {
  return ["---", "format: bio-case-document/7", "case_id: CASE-2026-0001", "case_edition: 1",
    `case_scope: "${scope}"`, `case_findings: [${members.join(", ")}]`,
    "case_conclusions:", ...members.flatMap((m) => caseConclusionRowLines(m, claims[m] === undefined ? null : conclusion(claims[m], details[m]))),
    ...CG.gradingFactsLines(legs),
    "completeness:", `  statement: "${statement}"`, "  author: alice",
    "---", "", "# Case", "", body, ""].join("\n");
}
const criteria = () => [
  { standard: BENCH, portion: null, designation: "Peer response times", edition: "2024", issuer: "an association", citation: "PRT 2024",
    access: "paywalled", body: "ENT-2026-0001", binds: false, passages: [{ content: RELIED, text: "within ten days" }], captures: [BENCH_CAP] },
  { standard: CODE, portion: "s. 4", designation: "Permit code", edition: "2023", issuer: "the council", citation: "PC s. 4",
    access: "free", body: "ENT-2026-0001", binds: true, passages: [], captures: [CODE_CAP] },
  { standard: BOOK, portion: null, designation: "Practice manual", edition: "3", issuer: "a profession", citation: "PM 3",
    access: "free", body: "ENT-2026-0001", binds: false, passages: [], captures: [sha("manual")] }];
const materials = () => [
  { ref: "INFO-2026-0001-code", kind: "document", sha: CODE_CAP, text_sha: null, origin: "https://records.example/code", archived_copy: null, included: true, rests_under: "load_bearing" },
  { ref: "INFO-2026-0002-peer", kind: "document", sha: BENCH_CAP, text_sha: null, origin: "an association", archived_copy: null, included: false, rests_under: "load_bearing" }];
const passages = () => [{ finding: A, ord: 0, content_id: RELIED, capture_sha: BENCH_CAP, extent: { kind: "pdf-page", page: 3 }, chain: null, quoted: "within ten days" }];
const args = (over = {}) => ({ text: doc(over.doc), criteria: over.criteria || criteria(), materials: over.materials || materials(), passages: over.passages || passages() });
const codes = (r) => (r.refusals || []).map((x) => x.code);

test("R21: a case that quotes a paywalled standard only where a finding relies on it, carries a free one whole, says 'violated' only against a binding standard and 'slower than' against a benchmark, answers {ok: true}", () => {
  assert.deepEqual(CC.checkStandardsUse(args()), { ok: true });
  assert.deepEqual(CC.STANDARDS_USE_CODES, ["MALFORMED", "COPYRIGHTED_TEXT_CARRIED", "COPYRIGHTED_PASSAGE_UNRELIED", "BENCHMARK_CALLED_NONCONFORMING"]);
});

test("R21: COPYRIGHTED_TEXT_CARRIED names the standard and sha of every material listed included: true that is a capture of a standard whose access is not free (paywalled, reading room or unstated); a free standard, or one not included, is not refused", () => {
  for (const access of ["paywalled", "reading_room", "undetermined", null, undefined]) {
    const c = criteria(); c[0].access = access;
    const m = materials(); m[1].included = true;
    assert.deepEqual(CC.checkStandardsUse(args({ criteria: c, materials: m })),
      { ok: false, refusals: [{ code: "COPYRIGHTED_TEXT_CARRIED", standard: BENCH, sha: BENCH_CAP }] }, String(access));
  }
  /* the free code travels whole, and the paywalled standard listed not included travels as its fingerprint only */
  assert.deepEqual(CC.checkStandardsUse(args()), { ok: true });
  const freeBench = criteria(); freeBench[0].access = "free";
  const m = materials(); m[1].included = true;
  assert.deepEqual(CC.checkStandardsUse(args({ criteria: freeBench, materials: m })), { ok: true });
  /* the capture is matched by its SHA-256 in any letter case */
  const upper = materials(); upper[1].included = true; upper[1].sha = BENCH_CAP.toUpperCase();
  assert.deepEqual(codes(CC.checkStandardsUse(args({ materials: upper }))), ["COPYRIGHTED_TEXT_CARRIED"]);
});

test("R21 (K1739): COPYRIGHTED_PASSAGE_UNRELIED names each passage of a copyrighted standard's capture that no finding relies on, whether the criteria row quotes it or the case's passages carry it; a relied-on passage and a free standard's passage are not refused", () => {
  /* the criteria row quotes a passage no finding relies on */
  const c = criteria(); c[0].passages.push({ content: LOOSE, text: "the whole chapter" });
  assert.deepEqual(CC.checkStandardsUse(args({ criteria: c })),
    { ok: false, refusals: [{ code: "COPYRIGHTED_PASSAGE_UNRELIED", standard: BENCH, content: LOOSE }] });
  /* the case carries a passage of the capture with no finding relying on it */
  for (const finding of [null, "", undefined]) {
    const p = [...passages(), { finding, ord: 1, content_id: LOOSE, capture_sha: BENCH_CAP, extent: { kind: "pdf-page", page: 4 }, chain: null, quoted: "more" }];
    assert.deepEqual(CC.checkStandardsUse(args({ passages: p })),
      { ok: false, refusals: [{ code: "COPYRIGHTED_PASSAGE_UNRELIED", standard: BENCH, content: LOOSE }] }, String(finding));
  }
  /* the relied-on passage is fine whichever finding relies on it; with no finding relying on it, it is refused */
  assert.deepEqual(CC.checkStandardsUse(args({ passages: [{ ...passages()[0], finding: B }] })), { ok: true });
  assert.deepEqual(CC.checkStandardsUse(args({ passages: [] })),
    { ok: false, refusals: [{ code: "COPYRIGHTED_PASSAGE_UNRELIED", standard: BENCH, content: RELIED }] });
  /* a free standard's passages may be quoted freely */
  const free = criteria(); free[1].passages = [{ content: LOOSE, text: "s. 4 in full" }];
  const fp = [...passages(), { finding: null, ord: 2, content_id: sha("other"), capture_sha: CODE_CAP, extent: { kind: "document" }, chain: null, quoted: "all" }];
  assert.deepEqual(CC.checkStandardsUse(args({ criteria: free, passages: fp })), { ok: true });
});

test("R21 (K1723): BENCHMARK_CALLED_NONCONFORMING names the member finding, the benchmark and each word of the list it uses, as whole words in any letter case, in its claim, its claim's detail, or the case's statement", () => {
  for (const word of CC.NONCONFORMING_WORDS) {
    for (const cased of [word, word.toUpperCase(), word[0].toUpperCase() + word.slice(1)]) {
      const r = CC.checkStandardsUse(args({ doc: { claims: { [A]: `Responses were ${cased} against the peer average.`, [B]: "Fine." } } }));
      assert.deepEqual(r, { ok: false, refusals: [{ code: "BENCHMARK_CALLED_NONCONFORMING", finding: A, standard: BENCH, word }] }, cased);
    }
  }
  assert.deepEqual(CC.NONCONFORMING_WORDS, ["violated", "violates", "violation", "nonconforming", "non-conforming", "nonconformity", "nonconformance"]);
  const one = (over) => CC.checkStandardsUse(args({ doc: over }));
  const refusedA = { ok: false, refusals: [{ code: "BENCHMARK_CALLED_NONCONFORMING", finding: A, standard: BENCH, word: "violation" }] };
  assert.deepEqual(one({ claims: { [A]: "Slower than peers.", [B]: "Fine." }, details: { [A]: "a violation of good practice" } }), refusedA);
  /* the case's statement: its scope and its completeness statement count for every benchmark-only member */
  assert.deepEqual(one({ claims: { [A]: "Slower.", [B]: "Fine." }, scope: "Each violation the office committed." }), refusedA);
  assert.deepEqual(one({ claims: { [A]: "Slower.", [B]: "Fine." }, statement: "the 2019 violation is not covered" }), refusedA);
  /* not whole words: no refusal */
  for (const near of ["violations", "inviolate", "nonviolation", "violatedness", "the_violated"])
    assert.deepEqual(one({ claims: { [A]: `Responses: ${near}.`, [B]: "Fine." } }), { ok: true }, near);
  /* every word it uses is named, in the list's order */
  assert.deepEqual(one({ claims: { [A]: "Nonconforming: the office violated it.", [B]: "Fine." } }).refusals.map((x) => x.word), ["violated", "nonconforming"]);
});

test("R21 (K1723): a finding resting on any standard that binds its body, a finding resting on no standard, a reached finding that is not a member, and the body's quoted text are not judged a benchmark's", () => {
  const bad = "The office violated the standard.";
  /* B rests only on the binding code: 'violated' is its to say */
  assert.deepEqual(CC.checkStandardsUse(args({ doc: { claims: { [A]: "Slower.", [B]: bad } } })), { ok: true });
  /* A rests on the benchmark and also on the binding code: not every row is binds: false */
  assert.deepEqual(CC.checkStandardsUse(args({ doc: { claims: { [A]: bad, [B]: "Fine." }, legs: [leg(A, 0, BENCH), leg(A, 1, CODE), leg(B, 0, CODE)] } })), { ok: true });
  /* a binds value that is not false (unknown) is not a benchmark's */
  const unk = criteria(); delete unk[0].binds;
  assert.deepEqual(CC.checkStandardsUse(args({ criteria: unk, doc: { claims: { [A]: bad, [B]: "Fine." } } })), { ok: true });
  /* A rests on no standard at all */
  assert.deepEqual(CC.checkStandardsUse(args({ doc: { claims: { [A]: bad, [B]: "Fine." }, legs: [leg(B, 0, CODE)] } })), { ok: true });
  /* R is reached through A, measured against the manual (a benchmark), but is no member: its rows are not a member's */
  assert.deepEqual(CC.checkStandardsUse(args({ doc: { claims: { [A]: "Slower.", [B]: "Fine." }, legs: [leg(A, 0, CODE), leg(B, 0, CODE), leg(R, 0, BOOK)], scope: bad } })), { ok: true });
  /* the body prints quoted passages, whose own words may say 'violation': it is not read */
  assert.deepEqual(CC.checkStandardsUse(args({ doc: { body: "> A violation of this section is nonconforming." } })), { ok: true });
  /* a member measured against two benchmarks is named once per benchmark */
  const r = CC.checkStandardsUse(args({ doc: { claims: { [A]: bad, [B]: "Fine." }, legs: [leg(A, 0, BENCH), leg(A, 1, BOOK), leg(B, 0, CODE)] } }));
  assert.deepEqual(r.refusals, [{ code: "BENCHMARK_CALLED_NONCONFORMING", finding: A, standard: BENCH, word: "violated" },
                                { code: "BENCHMARK_CALLED_NONCONFORMING", finding: A, standard: BOOK, word: "violated" }]);
});

test("R21: every departure is named, never only the first, in the order the arms are listed and each once", () => {
  const c = criteria(); c[0].passages.push({ content: LOOSE, text: "the chapter" });
  const m = materials(); m[1].included = true;
  const r = CC.checkStandardsUse(args({ criteria: c, materials: [...m, m[1]], doc: { claims: { [A]: "It violated the peer average.", [B]: "Fine." } } }));
  assert.deepEqual(r, { ok: false, refusals: [
    { code: "COPYRIGHTED_TEXT_CARRIED", standard: BENCH, sha: BENCH_CAP },
    { code: "COPYRIGHTED_PASSAGE_UNRELIED", standard: BENCH, content: LOOSE },
    { code: "BENCHMARK_CALLED_NONCONFORMING", finding: A, standard: BENCH, word: "violated" }] });
});

test("R21: a criteria row stated 'not held' is not judged, by any arm, and is named in unjudged", () => {
  const c = criteria(); c[0].stated = "not held"; c[0].passages.push({ content: LOOSE, text: "x" });
  const m = materials(); m[1].included = true;
  const r = CC.checkStandardsUse(args({ criteria: c, materials: m, doc: { claims: { [A]: "It violated the peer average.", [B]: "Fine." } } }));
  assert.deepEqual(r, { ok: true, unjudged: [{ standard: BENCH, portion: null }] });
  /* the other rows are still judged beside it */
  const c2 = criteria(); c2[1].stated = "not held"; c2[0].passages.push({ content: LOOSE, text: "x" });
  assert.deepEqual(CC.checkStandardsUse(args({ criteria: c2 })),
    { ok: false, refusals: [{ code: "COPYRIGHTED_PASSAGE_UNRELIED", standard: BENCH, content: LOOSE }], unjudged: [{ standard: CODE, portion: "s. 4" }] });
});

test("R21: pure: it reads only its arguments and leaves them unchanged, the same arguments give the same answer, and it never throws, malformed arguments naming each field", () => {
  const a = args({ doc: { claims: { [A]: "It violated the peer average.", [B]: "Fine." } } });
  const before = canonicalJson(a);
  const one = CC.checkStandardsUse(a);
  assert.equal(canonicalJson(a), before);
  assert.equal(canonicalJson(CC.checkStandardsUse(structuredClone(a))), canonicalJson(one));
  assert.equal(CC.checkStandardsUse.length <= 1, true);
  const M = (...fields) => ({ ok: false, refusals: fields.map((field) => ({ code: "MALFORMED", field })) });
  for (const bad of [undefined, null, 7, "x", []]) assert.deepEqual(CC.checkStandardsUse(bad), M("arguments"));
  assert.deepEqual(CC.checkStandardsUse({}), M("text", "criteria", "materials", "passages"));
  assert.deepEqual(CC.checkStandardsUse({ ...a, text: 5 }), M("text"));
  assert.deepEqual(CC.checkStandardsUse({ ...a, text: "no front matter" }), M("text"));
  assert.deepEqual(CC.checkStandardsUse({ ...a, criteria: "x", materials: [null], passages: [1] }), M("criteria", "materials[0]", "passages[0]"));
  assert.deepEqual(CC.checkStandardsUse({ ...a, criteria: [{ access: "free" }, { standard: BENCH, captures: "x", passages: 3 }] }),
    M("criteria[0].standard", "criteria[1].captures", "criteria[1].passages"));
  /* a getter that throws is still answered, not thrown */
  const hostile = { get text() { throw new Error("boom"); } };
  assert.deepEqual(CC.checkStandardsUse(hostile), M("arguments"));
});
