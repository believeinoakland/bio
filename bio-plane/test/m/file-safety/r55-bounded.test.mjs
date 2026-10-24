/* file-safety R55, R4, R12, R21 (fix round 9, G92, G91; K4807, K4811): a scanner or renderer call is not waited for beyond a bound.
   At the module's interface, over a scripted scanner whose paths wait on a gate the test opens, the bound injected at 50 ms
   (`callBoundMs`). The assertions are counts of calls and states of rows, never a time (R-CLOCK). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { filedWorld as world, pdf } from "./fixture.mjs";
import { SCANNER_CALL_BOUND_MS } from "../../../src/file-safety/index.mjs";

const gate = () => { let open; const p = new Promise((r) => { open = r; }); return { p, open }; };
const until = async (f, what) => { for (let i = 0; i < 400; i++) { if (f()) return; await new Promise((r) => setTimeout(r, 5)); } assert.fail(`never: ${what}`); };
const notesOf = (w, s) => w.fs.verdictNotes({ captureSha: s }).notes.map((n) => [n.kind, n.result]);

test("R55 R21: the bound is exported (8,000 ms) and injectable; a test's bound of 50 ms is the one used", async () => {
  assert.equal(SCANNER_CALL_BOUND_MS, 8_000);
  const w = world();
  assert.equal(w.fs.callBoundMs, SCANNER_CALL_BOUND_MS, "the default is the exported figure");
  assert.equal(world({ callBoundMs: 50 }).fs.callBoundMs, 50);
});

test("R55 R4: scanBatch of two queued files returns at the bound with both still queued and the call in flight; no second call is made for them; the result is recorded when it arrives; the call's start is logged before the await", async () => {
  const g = gate();
  const w = world({ callBoundMs: 50, scan: { gate: { scan: g.p } } });
  const a = await w.capture(pdf(false, "a")), b = await w.capture(pdf(false, "b"));
  const lines = [];
  const log = console.log;
  console.log = (x) => { try { lines.push(JSON.parse(x)); } catch { /* not ours */ } };
  let r;
  try { r = await w.fs.scanBatch({}); } finally { console.log = log; }
  assert.deepEqual([r.ok, r.scanned, r.found, r.not_scanned, r.in_flight, r.remaining], [true, 0, 0, 0, 2, 2]);
  assert.equal(w.calls("/scan").length, 1, "one batched call");
  assert.deepEqual([notesOf(w, a), notesOf(w, b)], [[], []], "both still queued: no note, nothing shown scanned");
  const start = lines.find((l) => l.file_safety === "scanner_call" && l.phase === "start" && l.call === "/scan");
  assert.ok(start && [a, b].some((x) => x.slice(0, 12) === start.sha), "the call's start is logged, by name and digest prefix, before the await");
  assert.equal(lines.some((l) => l.file_safety === "scanner_call" && l.phase === "end" && l.call === "/scan"), false, "its end is not yet");
  /* while it is in flight: another batch sends neither file again, an opening is pending and never opens */
  const again = await w.fs.scanBatch({});
  assert.deepEqual([again.ok, again.in_flight], [true, 2]);
  assert.equal(w.calls("/scan").length, 1, "no second call for the same files");
  assert.equal((await w.fs.openOriginal({ captureSha: a, viewer: "member:m1" })).code, "SCAN_PENDING");
  assert.equal(w.calls("/scan").length, 1, "an opening shares the call in flight");
  /* the result is recorded when it arrives (a 40 s scan is not starved) */
  g.open();
  await until(() => notesOf(w, a).length && notesOf(w, b).length, "the notes");
  assert.deepEqual([notesOf(w, a), notesOf(w, b)], [[["scan", "clean"]], [["scan", "clean"]]]);
  assert.equal(w.calls("/scan").length, 1);
  const ends = lines.length;
  assert.ok(ends > 0);
});

test("R55: a routine outside scan tool is waited for at the bound too: one call is made, the second file's waits for the next batch, the result is recorded when it arrives", async () => {
  const g = gate();
  const w = world({ callBoundMs: 50, scan: { gate: { "provider/scan": g.p } } });
  const ct = await w.tool("scanii");
  w.exec("UPDATE fs_tools SET use = 'routine' WHERE tool_id = ?", ct);
  const a = await w.capture(pdf(false, "p1")), b = await w.capture(pdf(false, "p2"));
  const r = await w.fs.scanBatch({});
  assert.equal(r.ok, true);
  assert.equal(r.in_flight, 1);
  assert.equal(w.calls("/provider/scan").length, 1, "one file after another, never two in one wait");
  g.open();
  await until(() => w.fs.verdictNotes({ captureSha: a }).notes.some((n) => n.tool === "scanii") || w.fs.verdictNotes({ captureSha: b }).notes.some((n) => n.tool === "scanii"), "the outside note");
  assert.equal(w.calls("/provider/scan").length, 1);
});

test("R55 R12: renderBatch begins one render per tick and returns at the bound with the first in flight (marked) and the second untouched; the result is recorded when it arrives", async () => {
  const g = gate();
  const w = world({ callBoundMs: 50, scan: { gate: { render: g.p } } });
  const a = await w.capture(pdf(false, "r1")); w.tick(1000);
  const b = await w.capture(pdf(false, "r2"));
  const r = await w.fs.renderBatch({});
  assert.deepEqual([r.ok, r.rendered, r.in_flight, r.remaining], [true, 0, 1, 1]);
  assert.equal(w.calls("/render").length, 1, "the second is not begun");
  const state = (s) => w.row("SELECT render_state, render_started_at FROM fs_files WHERE capture_sha = ?", s);
  assert.equal(state(a).render_state, "rendering", "the in-flight mark");
  assert.ok(state(a).render_started_at);
  assert.equal(state(b).render_state, "queued", "untouched");
  /* nothing is shown made, and no second render of the same file is begun while it is in flight */
  assert.equal((await w.fs.safeView({ captureSha: a, viewer: "member:m1" })).code, "SAFE_VIEW_PENDING");
  const again = await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 2, "the next tick begins the next file, not the file in flight");
  assert.equal(again.in_flight, 1);
  g.open();
  await until(() => state(a).render_state === "done" && state(b).render_state === "done", "both rendered");
  assert.equal((await w.fs.safeView({ captureSha: a, viewer: "member:m1" })).status, 200);
});

test("R55: a render marked in flight by a firing that stopped is queued again once its mark is stale; one still running is left alone", async () => {
  const w = world();
  const s = await w.capture(pdf(false, "stale"));
  w.exec("UPDATE fs_files SET render_state = 'rendering', render_started_at = ? WHERE capture_sha = ?", new Date(w.clock.now).toISOString(), s);
  await w.fs.renderBatch({});
  assert.equal(w.calls("/render").length, 0, "a fresh mark is a render in flight");
  w.tick(1_300_000);
  const r = await w.fs.renderBatch({});
  assert.equal(r.rendered, 1, "its mark is stale, so it is rendered again");
  assert.equal(w.row("SELECT render_state FROM fs_files WHERE capture_sha = ?", s).render_state, "done");
});

test("R55 R33: the safe-copy maker is waited for at the bound: renderBatch makes one copy, the second waits, the first's result is recorded when it arrives", async () => {
  const g = gate();
  const w = world({ callBoundMs: 50, scan: { gate: { "provider/cdr": g.p } } });
  const ct = await w.tool("glasswall-halo", { config: { host: "halo.example.org" } });
  w.exec("UPDATE fs_tools SET use = 'routine' WHERE tool_id = ?", ct);
  const a = await w.capture(pdf(false, "c1")); w.tick(1000);
  await w.capture(pdf(false, "c2"));
  const r = await w.fs.renderBatch({});
  assert.equal(r.ok, true);
  assert.equal(r.in_flight >= 1, true);
  assert.equal(w.calls("/provider/cdr").length, 1, "one file after another, never two in one wait");
  assert.equal(w.row("SELECT state FROM fs_copies WHERE capture_sha = ?", a).state, "pending", "marked while it runs");
  g.open();
  await until(() => w.row("SELECT state FROM fs_copies WHERE capture_sha = ?", a).state === "done", "the copy");
});
