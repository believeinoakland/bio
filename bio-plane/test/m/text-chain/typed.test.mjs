/* text-chain: requirement-named tests for a member's typing, its two grades and the predicate that tells it
 * (build/requirements/text-chain.md R107, R108; DEC-464). */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  gradeCeiling, typedStepOf, chainKindFor, terminalStep, layerChain, appendStep, mergedChain,
  TYPED_UNCHECKED_GRADE, TYPED_CHECKED_GRADE,
} from "../../../src/textchain.mjs";
import { BASIS_GRADES, EARNED_CAPTURE_CEILING } from "../../../src/record-grammar/index.mjs";

const T = (member = "tess", x = {}) => ({ step: "typed", member, text_sha256: "abc", ...x });
const O = (x = {}) => ({ step: "ocr", engine: "eng", cap: "C", ...x });
const AI = (x = {}) => ({ step: "ai_transcription", engine: "vision-model", ...x });
const doc = { kind: "document" };
const att = (member, extent = doc) => ({ member, at: "2026-10-27", extent });
const page = (n) => ({ kind: "page", page: n });

test("R107: the two grades are derived from BASIS_GRADES, the checked one strictly weaker than the earned ceiling", () => {
  assert.equal(TYPED_UNCHECKED_GRADE, BASIS_GRADES[BASIS_GRADES.length - 1]);
  assert.equal(TYPED_CHECKED_GRADE, BASIS_GRADES[BASIS_GRADES.indexOf(TYPED_UNCHECKED_GRADE) - 1]);
  assert.ok(BASIS_GRADES.indexOf(TYPED_CHECKED_GRADE) > BASIS_GRADES.indexOf(EARNED_CAPTURE_CEILING));
});

test("R107: a typed chain with no attestation answers the unchecked grade, by the typist", () => {
  for (const atts of [undefined, [], null]) {
    const g = gradeCeiling([T()], { page: 0 }, atts);
    assert.equal(g.ceiling, TYPED_UNCHECKED_GRADE);
    assert.equal(g.determinant, "typist");
    assert.deepEqual(g.by, ["tess"]);
    assert.ok(g.why.includes("tess"));
  }
});

test("R107: one other member's covering attestation raises it one step, and more raise nothing", () => {
  const one = gradeCeiling([T()], { page: 0 }, [att("bea")]);
  assert.equal(one.ceiling, TYPED_CHECKED_GRADE);
  assert.equal(one.determinant, "second_member");
  assert.deepEqual(one.by, ["bea"]);
  assert.ok(one.why.includes("tess") && one.why.includes("bea"));
  const two = gradeCeiling([T()], { page: 0 }, [att("zed"), att("bea"), att("bea")]);
  assert.equal(two.ceiling, TYPED_CHECKED_GRADE);
  assert.deepEqual(two.by, ["bea", "zed"]);
  assert.ok(two.why.includes("bea") && two.why.includes("zed"));
});

test("R107: the typist's own attestation, and a non-covering one, leave it at the unchecked grade", () => {
  for (const atts of [[att("tess")], [att("bea", page(3))], [att("tess"), att("bea", page(3))], [{ member: "bea" }]]) {
    const g = gradeCeiling([T()], { page: 0 }, atts);
    assert.equal(g.ceiling, TYPED_UNCHECKED_GRADE, JSON.stringify(atts));
    assert.equal(g.determinant, "typist");
  }
  /* A covering attestation by another member beside the typist's own still counts once. */
  assert.equal(gradeCeiling([T()], { page: 0 }, [att("tess"), att("bea", page(0))]).ceiling, TYPED_CHECKED_GRADE);
});

test("R107: no typed chain is ever answered the earned ceiling; the grade follows the step covering the target", () => {
  const scoped = mergedChain([{ chain: [T()], pages: [0] }, { chain: [...layerChain({ tier: 1 }), O()], pages: [1] }]);
  assert.equal(gradeCeiling(scoped, { page: 0 }, [att("bea")]).ceiling, TYPED_CHECKED_GRADE);
  assert.equal(gradeCeiling(scoped, { page: 1 }, [att("bea")]).ceiling, EARNED_CAPTURE_CEILING);
  assert.equal(gradeCeiling(scoped, { page: 0 }, [att("bea")]).determinant, "second_member");
});

test("R107 control: an AI-reading chain with the same attestation answers the earned ceiling, as R56 says", () => {
  for (const chain of [[AI()], [O()], layerChain({ tier: 1 })]) {
    const g = gradeCeiling(chain, { page: 0 }, [att("bea")]);
    assert.equal(g.ceiling, EARNED_CAPTURE_CEILING);
    assert.equal(g.determinant, "attestation");
  }
  assert.equal(gradeCeiling([AI()], { page: 0 }, []).determinant, "derivation");
});

test("R108: typedStepOf answers the typed step that decides the grade, and null otherwise", () => {
  const typed = T();
  assert.equal(typedStepOf([layerChain({ tier: 1 })[0], typed]), typed);
  assert.equal(typedStepOf([typed]), typed);
  for (const chain of [[layerChain({ tier: 1 })[0]], [O()], [AI()], [typed, O()], [], null, undefined, "typed", [{ step: "nope" }]])
    assert.equal(typedStepOf(chain), null, JSON.stringify(chain));
  /* A verification step after the typing is not the deciding step. */
  assert.equal(typedStepOf([typed, { step: "attested", member: "bea", at: "x", extent: doc }]), typed);
});

test("R108: with a target, a typed step scoped to another page answers null; the last covering part decides", () => {
  const typed = T("tess", { extent: { kind: "pages", pages: [2] } });
  assert.equal(typedStepOf([typed], 2), typed);
  assert.equal(typedStepOf([typed], { page: 2 }), typed);
  assert.equal(typedStepOf([typed], 0), null);
  assert.equal(typedStepOf([typed], { page: 5 }), null);
  assert.equal(typedStepOf([typed], {}), null);
  /* Two parts sharing the page: the later part decides. */
  const typedLast = mergedChain([{ chain: [O()], pages: [0] }, { chain: [T()], pages: [0] }]);
  assert.equal(typedStepOf(typedLast, 0).step, "typed");
  const ocrLast = mergedChain([{ chain: [T()], pages: [0] }, { chain: [O()], pages: [0] }]);
  assert.equal(typedStepOf(ocrLast, 0), null);
});

test("R108 control: chainKindFor and terminalStep answer as before", () => {
  const chain = mergedChain([{ chain: [layerChain({ tier: 1 })[0]], pages: [0, 1] }, { chain: [T()], pages: [1] }]);
  assert.equal(chainKindFor(chain, 0), "layer");
  assert.equal(chainKindFor(chain, 1), "mixed");
  assert.equal(chainKindFor(chain, 2), null);
  assert.equal(terminalStep(chain), "typed");
  assert.equal(terminalStep(appendStep([T()], O({ cap: undefined }))), "ocr");
});
