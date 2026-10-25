/* case-carriage's published fixtures (`fixtures.mjs`): each is called here and checked against the module's own answers, so a
   user that takes one holds the real answer and never writes it by hand (K4990). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { copyReadStates, copyTickRefusals, onCopyWorkRegistrarRefusals } from "./fixtures.mjs";
import { CASE_CARRIAGE_CHECKS, COPY_CLEANED_LABEL } from "../../../src/case-carriage/index.mjs";

test("R16 copyReadStates answers the module's documentCopy in each state over a real document: copy (cleaned, its copy held and labelled), photo, refused, undetermined (its table unreadable) and unknown (a digest no capture holds, queued and answered pending)", async () => {
  const s = await copyReadStates();
  assert.deepEqual(Object.keys(s), ["copy", "photo", "refused", "undetermined", "unknown"]);
  assert.match(s.copy.answer.copy, /^[0-9a-f]{64}$/);
  assert.deepEqual(s.copy.answer, { state: "copy", copy: s.copy.answer.copy, refused: null,
    obscured: { copy: s.copy.answer.copy, label: COPY_CLEANED_LABEL, kind: "document" } });
  assert.deepEqual(s.photo.answer, { state: "photo", copy: null, refused: null });
  assert.equal(s.refused.answer.state, "refused");
  assert.equal(s.refused.answer.refused.code, "IMAGE_NOT_CLEANABLE");
  assert.deepEqual(s.undetermined.answer, { state: "undetermined", copy: null, refused: null });
  assert.deepEqual(s.unknown.answer, { state: "pending", copy: null, refused: null }, "a miss is queued and answered pending (R16)");
  assert.match(s.unknown.capture, /^[0-9a-f]{64}$/);
});

test("R15 copyTickRefusals: a real copyBatch and copyWake with no evidence store bound answer DOCUMENT_COPY_NO_STORE (C-141.11) and null, derive nothing, and leave the member's document queued untried", async () => {
  const t = await copyTickRefusals();
  assert.deepEqual([t.batch.ok, t.batch.code, t.batch.check], [false, "DOCUMENT_COPY_NO_STORE", "C-141.11"]);
  assert.equal(t.batch.translation, CASE_CARRIAGE_CHECKS.DOCUMENT_COPY_NO_STORE.translation);
  assert.equal(t.wake, null);
  assert.deepEqual(t.queued, [{ capture: t.capture, tried: null }], "queued, no try stamped, nothing derived");
});

test("R17 onCopyWorkRegistrarRefusals: the first registration by a module stands; a second by the same module is refused LISTENER_DECLARED; a fn that is not a function is refused LISTENER_MALFORMED", () => {
  const r = onCopyWorkRegistrarRefusals();
  assert.deepEqual(r.first, { ok: true, module: "scheduler" });
  assert.deepEqual([r.twice.ok, r.twice.code], [false, "LISTENER_DECLARED"]);
  assert.deepEqual([r.malformed.ok, r.malformed.code], [false, "LISTENER_MALFORMED"]);
});
