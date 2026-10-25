/* file-safety's published fixtures (fixtures.mjs): each is made by the module's real code when this test runs, and each is checked here
   against what the real answer is. R4, R12, R35, R36, R41 (the batches); R24, R42 (the declared refusals); R29 (the tool test). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { batchTickAnswers, declaredRefusals, scannerAbsent, toolTestFailed, toolTested } from "./fixtures.mjs";
import { FILE_SAFETY_CHECKS, LOG_COUNT_KINDS } from "../../../src/file-safety/index.mjs";

test("R4 R12 R35 R36 R41: batchTickAnswers is the real answer of each of the five batches on an empty store", async () => {
  const a = await batchTickAnswers();
  assert.deepEqual(a.scan, { ok: true, scanned: 0, found: 0, not_scanned: 0, remaining: 0 });
  assert.deepEqual(a.render, { ok: true, rendered: 0, failed: 0, none: 0, data: 0, copies: { made: 0, failed: 0, queued: 0 }, remaining: 0 });
  assert.deepEqual(a.deeper, { ok: true, started: 0, polled: 0, done: [], running: 0, queued: 0 });
  assert.deepEqual([a.forward.ok, a.forward.sent, a.forward.failed], [true, [], []]);
  assert.deepEqual(Object.keys(a.forward.record.counts).sort(), [...LOG_COUNT_KINDS].sort(), "the counts record holds exactly the kinds");
  assert.ok(Object.values(a.forward.record.counts).every((n) => n === 0), "nothing happened in an empty store");
  assert.deepEqual(a.refresh, { ok: true, refreshed: [], failed: [], skipped: [] });
});

test("R24 R42 R43 R36 R35 R28: declaredRefusals holds the real refusal of each declared *_ABSENT, *_UNREADABLE and *_INVALID code, with its row", async () => {
  const r = await declaredRefusals();
  const declared = Object.keys(FILE_SAFETY_CHECKS).filter((c) => /_(ABSENT|UNREADABLE|INVALID)$/.test(c)).sort();
  assert.deepEqual(Object.keys(r).sort(), declared, "every declared code, none made up");
  for (const [code, a] of Object.entries(r)) {
    assert.equal(a.ok, false, code);
    assert.equal(a.code, code, code);
    assert.equal(a.check, FILE_SAFETY_CHECKS[code].check, code);
    assert.equal(a.translation, FILE_SAFETY_CHECKS[code].translation, code);
  }
});

test("R29 R42: scannerAbsent is the real SCANNER_ABSENT of securityToolTest, with its row", async () => {
  const a = await scannerAbsent();
  assert.deepEqual({ ok: a.ok, code: a.code, check: a.check, translation: a.translation },
                   { ok: false, code: "SCANNER_ABSENT", check: FILE_SAFETY_CHECKS.SCANNER_ABSENT.check, translation: FILE_SAFETY_CHECKS.SCANNER_ABSENT.translation });
});

test("R29: toolTestFailed is the real answer of a tool test the provider refuses, and toolTested that of one it passes", async () => {
  const f = await toolTestFailed();
  assert.deepEqual([f.ok, f.state, f.passed, typeof f.detail], [true, "test_failed", false, "string"]);
  assert.ok(f.detail.length > 0);
  const t = await toolTested();
  assert.deepEqual([t.ok, t.state, t.passed, typeof t.detail], [true, "on", true, "string"]);
  assert.ok(typeof t.tool_id === "string" && Number.isFinite(Date.parse(t.tested_at)));
});
