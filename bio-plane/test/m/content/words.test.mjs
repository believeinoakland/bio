/* content: the words members read (DEC-149; T35-26). Each of the sweep's six rows (`build/plan/draft-T35-dec149-l1-l7.md`:
   `extent-core.mjs`:281, :291; `index.mjs`:758, :989, :1404, :1405) is driven to its answer at this module's interface,
   and the answer is held to its new wording: the group's own Civicsmith is never "plane", "instance", "copy" or "server";
   a sentence about what the software cannot yet do names no one, and one about this installation says "your group's
   Civicsmith". Codes, checks and translations are unchanged (R1, R21, R23, R32). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, V, LAYER } from "./fixture.mjs";
import { checkContentExtent, CONTENT_EXTENT_CHECKS, TRANSCRIBE_CHECKS } from "../../../src/content/index.mjs";
import * as textChain from "../../../src/textchain.mjs";

const DOC = "INFO-2026-0001-a";
const OLD = /\b(plane|instance|copy|server)\b/i;
const said = (r) => [r.detail, r.why, r.translation].filter((x) => typeof x === "string").join(" ");

test("R1 (DEC-149, extent-core.mjs:281): the dom refusal's detail says nothing produces a dom address yet, naming no plane; C-45.4 unchanged", () => {
  const r = checkContentExtent({ kind: "dom", selector: "p" }, { chain: LAYER, pageCount: null, container: {} });
  assert.deepEqual([r.code, r.check, r.translation], ["CONTENT_EXTENT_NO_PRODUCER", "C-45.4",
    CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_NO_PRODUCER.translation]);
  assert.match(r.detail, /Nothing produces a dom address yet \(CONTENT-HTML\), so a row minted against one/);
  assert.doesNotMatch(said(r), OLD);
});

test("R1 (DEC-149, extent-core.mjs:291): an unlanded kind's detail says what it covers cannot yet be evaluated, naming no plane; C-45.3 unchanged", () => {
  /* Every kind text-chain's algebra holds has landed (its R92), so the arm is reached with one unlanded kind put
     beside them for this test and taken away after it. */
  textChain.CONTENT_EXTENT_KINDS["test-unlanded"] = { landed: false, human: "a kind under test" };
  try {
    const r = checkContentExtent({ kind: "test-unlanded" }, { chain: LAYER, pageCount: null, container: {} });
    assert.deepEqual([r.code, r.check, r.translation], ["CONTENT_EXTENT_UNREADABLE", "C-45.3",
      CONTENT_EXTENT_CHECKS.CONTENT_EXTENT_UNREADABLE.translation]);
    assert.match(r.detail, /^extent kind 'test-unlanded' \(a kind under test\) is named in the grammar and what it covers cannot yet be evaluated, so it mints nothing\./);
    assert.doesNotMatch(said(r), OLD);
  } finally {
    delete textChain.CONTENT_EXTENT_KINDS["test-unlanded"];
  }
});

test("R21 (DEC-149, index.mjs:758): a row whose extent kind cannot be evaluated says so on its transcription axis, naming no plane", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: LAYER, pageCount: 1 });
  const id = w.content.mint({ bundleId: DOC, captureSha: a.sha, extent: { kind: "doc-para", para: 0 }, mintedBy: V("bo") }).content_id;
  const why = w.content.standings([id])[id].transcription.why;
  assert.equal(why, "what a doc-para extent covers cannot yet be evaluated, so what a leg citing it may claim on the "
    + "transcription axis is undetermined — stated, and never resolved into the whole document's ceiling");
  assert.doesNotMatch(why, OLD);
  assert.equal(w.content.contentRead({ id, viewer: V("bo") }).transcription.why, why, "the same sentence at the fixed-key read");
});

test("R23 (DEC-149, index.mjs:989): C-52.5's detail says the part is one no typing can be checked against, naming no plane; its row unchanged", () => {
  const w = world();
  const a = w.cap("a"); w.doc(DOC, [a]); w.read(a.sha, { chain: LAYER, pageCount: 1 });
  const r = w.content.transcribe({ bundleId: DOC, extent: { kind: "doc-para", para: 0 }, text: "x", transcriber: V("ty"), viewer: V("ty") });
  assert.deepEqual([r.code, r.check, r.translation], ["TRANSCRIBE_PORTION_UNREADABLE", "C-52.5",
    TRANSCRIBE_CHECKS.TRANSCRIBE_PORTION_UNREADABLE.translation]);
  assert.match(r.detail, /^¶1 is a part no typing can be checked against — a second member's attestation needs/);
  assert.doesNotMatch(said(r), OLD);
});

test("R32 (DEC-149, index.mjs:1404, :1405): a crop with no evidence store says your group's Civicsmith has none set up, a fact about how it is set up", async () => {
  const w = world();
  w.doc(DOC, [w.cap("a")]);
  w.read("e".repeat(64), { pageCount: 1 });
  const cid = w.content.mint({ bundleId: DOC, captureSha: "e".repeat(64), extent: { kind: "image", page: 0, rect: [0, 0, 3, 2] }, mintedBy: V("bo") }).content_id;
  const r = await w.content.cropOf({ contentId: cid, viewer: V("bo") });
  assert.equal(r.reason, "CROP_NO_EVIDENCE_STORE");
  assert.equal(r.detail, "your group's Civicsmith has no evidence store set up, so the capture's bytes cannot be read and no "
    + "crop was made. That is a fact about how your group's Civicsmith is set up, not about the image");
  assert.doesNotMatch(r.detail, OLD);
});
