/* contradiction R1–R4: the judgement's words, driven at the module's interface (the re-exports of `index.mjs`). */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { CONTRADICTION_LABELS, JUDGEMENT_PROMPT, JUDGEMENT_PROMPT_SHA256, judgementSide, renderJudgementInput }
  from "../../../src/contradiction/index.mjs";

test("R1: the labels are exactly world, record, precision, unrelated, undetermined, in that order, and fixed", () => {
  assert.deepEqual([...CONTRADICTION_LABELS], ["world", "record", "precision", "unrelated", "undetermined"]);
  assert.ok(Object.isFrozen(CONTRADICTION_LABELS));
  assert.throws(() => { CONTRADICTION_LABELS.push("finding"); });
});

test("R2: the prompt's SHA-256 is the pinned digest measured on the over-strictness gate (M-162)", () => {
  assert.equal(createHash("sha256").update(JUDGEMENT_PROMPT, "utf8").digest("hex"), JUDGEMENT_PROMPT_SHA256);
  assert.equal(JUDGEMENT_PROMPT_SHA256, "79ea662afed716df7db276bac07c4c85db7b9adf12a573bfc36459c3e721a061");
});

test("R3: judgementSide keeps only text, doctype, date and role, omits null or absent, never fills", () => {
  const full = { text: "t", doctype: "agenda", date: "2026-03-01", role: "supports",
                 kind: "extent", content_id: "c", capture_sha: "s", ref: "p. 1", claim: "x", inquiry: "INQ" };
  assert.deepEqual(judgementSide(full), { text: "t", doctype: "agenda", date: "2026-03-01", role: "supports" });
  assert.deepEqual(Object.keys(judgementSide(full)), ["text", "doctype", "date", "role"]);
  assert.deepEqual(judgementSide({ text: "t", doctype: null, date: undefined }), { text: "t" });
  assert.deepEqual(judgementSide({ doctype: "", date: 0, role: false }), { doctype: "", date: 0, role: false });
  assert.deepEqual(judgementSide({}), {});
  for (const v of [null, undefined, "x", 3]) assert.deepEqual(judgementSide(v), {});
});

test("R4: the input is the prompt, PAIRS:, then each pair numbered from 1 with key, context when present, and sides A and B through R3", () => {
  const pairs = [
    { key: "K3", context: "the passage", a: { text: "one", role: "supports", extra: "dropped" }, b: { text: "two" } },
    { key: "K4", a: { doctype: "rule", date: null }, b: { doctype: "act", date: "2026-10-01" } },
  ];
  const expected = `${JUDGEMENT_PROMPT}\nPAIRS:\n\n`
    + `PAIR 1 · key K3\n  context (the source passage both claims rest on): "the passage"\n`
    + `  A: {"text":"one","role":"supports"}\n  B: {"text":"two"}\n\n`
    + `PAIR 2 · key K4\n  A: {"doctype":"rule"}\n  B: {"doctype":"act","date":"2026-10-01"}\n`;
  assert.equal(renderJudgementInput(pairs), expected);
  for (const v of [null, undefined, {}, "pairs", 7]) assert.equal(renderJudgementInput(v), `${JUDGEMENT_PROMPT}\nPAIRS:\n\n\n`);
  assert.equal(renderJudgementInput([]), `${JUDGEMENT_PROMPT}\nPAIRS:\n\n\n`);
});
