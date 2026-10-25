/* extraction's published fixtures (`fixtures.mjs`; K4990, K4993, K4995, K5044), each called here and compared with the answer extraction really gives:
   the fixture is only worth publishing while it is the real answer. Each test names the requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractionNotice, progressOf, readHeldAnswer, transcribeRefusal, unheldStructure } from "./fixtures.mjs";
import { REEXTRACT_CHECKS } from "../../../src/extraction/index.mjs";
import { evidenceAbsent } from "../../../src/capture/ops.mjs";

test("R24 R62 (fixture `extractionNotice`): the registry is extraction's own: one listener a module, LISTENER_DECLARED on a repeat, LISTENER_MALFORMED on a malformed one; `fire` runs the accepted listeners in registration order and `fireIndexed` the index's", () => {
  const n = extractionNotice();
  const seen = [];
  assert.deepEqual(n.onReading("content", (e) => { seen.push(["content", e]); return { staled: 1 }; }), { ok: true, module: "content" });
  assert.deepEqual(n.onReading("observation-log", (e) => { seen.push(["observation-log", e]); return { observed: 1 }; }), { ok: true, module: "observation-log" });
  const again = n.onReading("content", () => ({}));
  assert.deepEqual([again.ok, again.reason], [false, "LISTENER_DECLARED"]);
  const bad = n.onReading("entities", "not a function");
  assert.deepEqual([bad.ok, bad.reason], [false, "LISTENER_MALFORMED"]);
  assert.deepEqual(n.listeners.map((l) => l.module), ["content", "observation-log"], "only accepted registrations are kept");
  assert.deepEqual(n.fire({ captureSha: "x" }), [{ module: "content", answer: { staled: 1 } }, { module: "observation-log", answer: { observed: 1 } }]);
  assert.deepEqual(seen.map(([m]) => m), ["content", "observation-log"]);
  assert.deepEqual(n.onIndexed("observation-log", () => ({ ok: true })), { ok: true, module: "observation-log" });
  assert.equal(n.onIndexed("observation-log", () => ({})).reason, "LISTENER_DECLARED");
  assert.deepEqual(n.indexListeners.map((l) => l.module), ["observation-log"]);
  assert.deepEqual(n.fireIndexed({ captureSha: "x" }), [{ module: "observation-log", answer: { ok: true } }]);
  assert.equal(n.readingOf("a".repeat(64)), null, "R30: a capture not read");
  assert.equal(n.capturesReadFor("INFO-1").length, 0, "R51: no capture read");
});

test("R108 (fixture `progressOf`): a scan with pages owed is `partial` with them owed, a short text `whole`, a text read through its first piece `partial` with R90's figures, an unknown digest `none`", async () => {
  const p = await progressOf();
  const a = p.answer;
  assert.deepEqual([a[p.shas.scan].state, a[p.shas.scan].owed], ["partial", 6]);
  assert.deepEqual(a[p.shas.text], { state: "whole", read_through: null, total: null, owed: 0 });
  assert.equal(a[p.shas.big].state, "partial");
  assert.ok(a[p.shas.big].read_through > 0 && a[p.shas.big].total > a[p.shas.big].read_through);
  assert.deepEqual(a[p.shas.unknown], { state: "none", read_through: null, total: null, owed: 0 });
  assert.deepEqual(p.progressOf([p.shas.text, p.shas.unknown]), { [p.shas.text]: a[p.shas.text], [p.shas.unknown]: a[p.shas.unknown] });
});

test("R80 R82 R90 R101 (fixture `readHeldAnswer`): each kind is the answer `readHeld` gives: no home, a short text read, a first piece that goes on, the pieces of a text, a reading held with its counters, a read ended stated, an OCR tick whose member died", async () => {
  const none = await readHeldAnswer.noHome();
  assert.deepEqual([none.ok, none.read, none.why], [true, false, "NO_HOME"]);
  const read = await readHeldAnswer.read();
  assert.deepEqual([read.ok, read.read, read.more, typeof read.bundle_id], [true, true, undefined, "string"]);
  const piece = await readHeldAnswer.piece();
  assert.deepEqual([piece.ok, piece.read, piece.more], [true, true, true]);
  assert.ok(piece.detail.read_through > 0 && piece.detail.total > piece.detail.read_through);
  const three = await readHeldAnswer.pieces(3);
  assert.deepEqual(three.map((a) => a.more === true), [true, true, false], "the last piece answers as a read does");
  await assert.rejects(readHeldAnswer.pieces(1), /n is from 2 to 5/);
  const held = await readHeldAnswer.held();
  assert.deepEqual([held.ok, held.read, held.why], [true, false, "READING_HELD"]);
  assert.ok(Number.isInteger(held.counters.written) && held.counters.written > 0 && "owed" in held.counters === false);
  const final = await readHeldAnswer.final("CURSOR_MISMATCH");
  assert.deepEqual([final.ok, final.read, final.final, typeof final.why], [true, false, true, "string"]);
  await assert.rejects(readHeldAnswer.final("NO_TEXT"), /no such reason/);
  const killed = await readHeldAnswer.killed();
  assert.ok(Array.isArray(killed.killed) && killed.killed.length > 0 && killed.killed.every(Number.isInteger), JSON.stringify(killed));
  assert.deepEqual([killed.ok, killed.read, killed.owed], [true, false, true]);
});

test("R47 R71 (fixture `transcribeRefusal`): the refusal is extraction's whole C-51.7 answer: 501 TRANSCRIBE_NOT_DEPLOYED with its check, translation and the op, naming no account", async () => {
  const r = await transcribeRefusal();
  assert.equal(r.status, 501);
  assert.deepEqual([r.body.ok, r.body.reason, r.body.code, r.body.check, r.body.op], [false, "TRANSCRIBE_NOT_DEPLOYED", "TRANSCRIBE_NOT_DEPLOYED", "C-51.7", "pagetranscribe"]);
  assert.equal(r.body.translation, REEXTRACT_CHECKS.TRANSCRIBE_NOT_DEPLOYED.translation);
});

test("R31 (fixture `unheldStructure`): an object the store does not hold is capture's one answer for it: 404 EVIDENCE_NOT_HELD with its row, the store and the caller's class", async () => {
  const miss = "e".repeat(64);
  const a = await unheldStructure({ sha: miss });
  assert.deepEqual(a, evidenceAbsent(miss, "bio", { tokenClass: "member" }));
  assert.deepEqual([a.status, a.body.ok, a.body.reason, a.body.check], [404, false, "EVIDENCE_NOT_HELD", "C-118.1"]);
});
