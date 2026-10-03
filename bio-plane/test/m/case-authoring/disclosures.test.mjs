/* case-authoring (T29; N529, K1333): the order in which publishCase asks `case-disclosures` (R55) — its judgments after
   R6 and before the case identity is derived, each first refusal answered with nothing written and no id drawn; its
   sources, grading facts, method and blocks only after R11; its rows written through its own renderers, imported and
   never copied. Each service is the real one on the host, watched (or made to refuse) through the instance publishCase
   reaches. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import * as CA from "../../../src/case-authoring/index.mjs";
import * as CD from "../../../src/case-disclosures/index.mjs";

const DOC = "INFO-2026-0001-a", Q = "INQ-2026-0001-q";
const JUDGED = ["hunchDebt", "tensionsJudged", "restingCaptures", "captureFacts", "selfAttestedJudged", "materialsJudged",
                "acceptedWorkJudged", "flagsJudged"];
const AFTER = ["sourcesStated", "withheldOf", "findingFacts", "methodOf", "disclosureBlocks"];

/* Every top-level call publishCase makes on `case-disclosures` (a service's own inner calls are not counted), in order;
   `over` replaces a service's answer by the real answer handed to it. */
function watched(w, over = {}) {
  const D = w.ca.disclosures, calls = [];
  let depth = 0;
  for (const m of [...JUDGED, ...AFTER, "tensionsRead", "tensionsUndetermined"]) {
    const real = D[m].bind(D);
    D[m] = (...a) => {
      if (!depth) calls.push({ m, a });
      depth++;
      try { const r = real(...a); return over[m] ? over[m](r, a) : r; } finally { depth--; }
    };
  }
  return calls;
}
function setup(opts) {
  const w = world(opts);
  w.member("alice"); w.doc(DOC); w.finding(Q, [{ target: DOC }]);
  return { w, P: w.project("Team", "alice", [Q]) };
}
const names = (calls) => calls.map((c) => c.m).filter((m, i, all) => m !== all[i - 1]);

test("R55: publishCase asks case-disclosures, after R6 and before the case identity, hunchDebt, tensionsJudged, restingCaptures, captureFacts and selfAttestedJudged, materialsJudged, acceptedWorkJudged, flagsJudged; then, after R11, sourcesStated and withheldOf, findingFacts, methodOf and disclosureBlocks; and hands it tensionsDisclosed, selfAttested and flagsDisclosed as given", () => {
  const { w, P } = setup();
  const calls = watched(w);
  const lists = { tensionsDisclosed: [], selfAttested: [], flagsDisclosed: [] };
  const r = w.publish(P, "alice", [Q], lists);
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  assert.deepEqual(names(calls), [...JUDGED, ...AFTER]);
  const arg = (m) => calls.find((c) => c.m === m).a;
  assert.equal(arg("tensionsJudged")[2], lists.tensionsDisclosed, "tensionsDisclosed, as given");
  assert.equal(arg("selfAttestedJudged")[3], lists.selfAttested, "selfAttested, as given");
  assert.equal(arg("flagsJudged")[1], lists.flagsDisclosed, "flagsDisclosed, as given");
  /* each member at the bytes R13 pins */
  assert.deepEqual(arg("tensionsJudged")[0].map((p) => [p.id, p.bundleSha]), [[Q, w.head(Q)]]);
  /* disclosureBlocks is handed what the act judged and read, with the act's stamp and instant */
  const blocks = arg("disclosureBlocks")[0];
  assert.deepEqual([blocks.project, blocks.author, blocks.at], [P, "alice", w.clock.now]);
  assert.ok(blocks.withheld instanceof Set && blocks.attributionOf instanceof Map);
  /* negative control: R6 refuses first, and case-disclosures is never asked */
  const x = setup();
  const none = watched(x.w);
  assert.equal(x.w.reviseProject(x.P, "Team", "alice", [Q], ["required_strength:", "  capture: A"]).ok, true);
  const low = x.w.publish(x.P, "alice", [Q]);
  assert.equal(low.reason, "BELOW_PROJECT_STRENGTH");
  assert.deepEqual(none, []);
});

test("R55: it answers the first refusal of the first step that refuses — each step in turn — asking no later step, writing nothing and drawing no id", () => {
  const R = (code) => ({ ok: false, reason: code, code, detail: "made to refuse" });
  const steps = [
    ["hunchDebt", (r) => R("H")],
    ["tensionsJudged", (r) => ({ ...r, refusals: [R("T")] })],
    ["selfAttestedJudged", (r) => ({ ...r, refusals: [R("S")] })],
    ["materialsJudged", (r) => ({ ...r, refusals: [R("M")] })],
    ["acceptedWorkJudged", (r) => ({ ...r, refusals: [R("A")] })],
    ["flagsJudged", (r) => ({ ...r, refusals: [R("F")] })],
  ];
  for (const [m, refuse] of steps) {
    const { w, P } = setup();
    const calls = watched(w, { [m]: refuse });
    const before = w.snapshot();
    const r = w.publish(P, "alice", [Q]);
    assert.equal(r.ok, false, m);
    assert.equal(r.detail, "made to refuse", `${m}: its refusal is the answer`);
    const asked = names(calls);
    assert.equal(asked[asked.length - 1], m, `${m}: no later step is asked (${asked.join(", ")})`);
    assert.deepEqual(asked, JUDGED.slice(0, JUDGED.indexOf(m) + 1), m);
    assert.deepEqual(w.snapshot(), before, `${m}: nothing written, no id drawn`);
  }
});

test("R55: sourcesStated (which mints a source id) and every later service are asked only after R11 — a searched section that cannot be computed asks none of them and writes nothing", () => {
  const { w, P } = setup({ now: () => "" });
  const calls = watched(w);
  const before = w.snapshot();
  const r = w.publish(P, "alice", [Q]);
  assert.equal(r.reason, "CASE_SEARCHED_UNCOMPUTABLE");
  assert.deepEqual(names(calls), JUDGED, "the judgments, and nothing after R11");
  assert.deepEqual(w.snapshot(), before);
});

test("R55, R14, R15: the answer's tensions are case-disclosures' R1 entries, each with the owner's words and the author stamp at this act; the document's rows are written through case-disclosures' renderers, the very functions it exports, so the bytes are its spelling", () => {
  const cand = "c".repeat(64);
  const side = (ref) => ({ kind: "leg", ref, source: { bundle: DOC, ref }, capture_sha: null, date: null, doctype: null });
  const contradiction = { unresolvedRecordOn: () => ({ ok: true, truncated: false, undetermined_legs: 0,
    candidates: [{ candidate: cand, a: side("page 1"), b: side("page 2"), state: "open", kind: null }] }) };
  const { w, P } = setup({ deps: { contradiction } });
  const r = w.publish(P, "alice", [Q], { tensionsDisclosed: [{ candidate: cand, words: "we hold page 1" }] });
  assert.equal(r.ok, true, JSON.stringify(r).slice(0, 300));
  const entries = w.ca.disclosures.tensionsRead([{ id: Q, bundleSha: w.head(Q) }], "member:alice").entries;
  assert.deepEqual(r.tensions, entries.map((e) => ({ ...e, words: "we hold page 1", acknowledged_by: "alice",
                                                     acknowledged_at: w.clock.now })));
  assert.deepEqual([r.tensions_highlighted, r.tensions_legs_unread], [0, []]);
  /* the renderers this module writes with are case-disclosures' own, re-exported, never copies */
  for (const k of ["tensionSentence", "tensionSide", "TENSION_TEMPLATES", "HIGHLIGHT_SENTENCE", "NOT_SHOWN_WORDS",
                   "TENSIONS_DEPTH_STATED", "SELF_ATTESTED_SENTENCE", "CASE_DISCLOSURE_CHECKS"])
    assert.equal(CA[k], CD[k], `${k} is case-disclosures' one spelling`);
  const text = w.row(`SELECT text FROM case_documents WHERE case_id=?`, r.caseId).text;
  assert.ok(text.includes(CD.tensionFrontmatterLines(r.tensions, []).join("\n")), "the tension block, its spelling");
  assert.ok(text.includes(CD.tensionBodyLines(r.tensions, []).join("\n")), "the tension section, its spelling");
  assert.ok(text.includes(`   - ${CD.tensionSentence(r.tensions[0])}`), "the member block's sentence");
  const blocks = CD.carriesBodyLines(w.ca.disclosures.methodOf(), { rows: [], attestations: [] }, null).slice(0, 4);
  assert.ok(text.includes(blocks.join("\n")), "the method, in its words");
});
