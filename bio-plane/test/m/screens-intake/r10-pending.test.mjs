/* screens-intake fix round 10, cause R5 (G1; walks A6b, A7, C9; R65): a reading that ended with a FINAL statement is drawn as that statement, never as "unread, check again
 * soon". The page is the served `capture` screen over the REAL plane (`realplane.mjs`), so `op=reading` answers its real shape: the stored reading beside `job`, the job
 * row's state (`{state: null}` once no row is left). The named edits to a real answer are the upload's (a deferred reading, `realplane.mjs`) and, where a test says so,
 * the reading answer's `job`. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { main, text, says, idle } from "./page.mjs";
import { realPlane } from "./realplane.mjs";

const plane = realPlane("r10pend");
after(() => plane.dispose());
const { founder, uploaded } = plane;

/* the sentence of the unread line, by key: it must not stand once the reading has said what became of it */
const unread = (p) => says(p, "screen.document.text.unread.next");
const drawn = (p) => (main(p).innerHTML.match(/data-reading="([a-z]+)"/g) || []).map((m) => /"([a-z]+)"/.exec(m)[1]);
const OWN = "no OCR engine is installed";

async function ticked(edit, ready = (p) => p.byOp("reading").length >= 1 && !unread(p)) {
  const auth = await founder();
  const p = await uploaded(auth, { kind: "png", seed: "r10-pending-png", size: { lines: 3 } }, "scan.png", edit);
  /* the first ask is at twenty seconds; the plane's own jobs run on its alarm, so the clock is ticked on, by counts, until the page has drawn what the reading answered */
  await plane.ticksUntil(p, () => ready(p));
  return p;
}

test("R65 (G1; the real plane) a picture whose reading ended with a final statement is drawn as the reading's own line at the first tick, never as the unread sentence: the job row as the real op=reading answers it", async () => {
  const p = await ticked({});
  assert.ok(p.byOp("reading").length >= 1, "the page asked op=reading for the capture");
  assert.ok(!unread(p), "not the unread sentence: " + text(p).slice(-400));
  assert.ok(drawn(p).length > 0 && !drawn(p).includes("pending"), "a reading line, not the pending one: " + drawn(p));
  assert.ok(text(p).includes(OWN), "it says what the reading itself said (its `basis`)");
  await p.clock.tick(30000);
  await idle(p, 3000);
  assert.ok(!unread(p) && text(p).includes(OWN), "and at every further tick");
});

test("R65 (G1; the real plane) the same when the job row is gone (`job: {state: null}`, the row removed once the reading ended): the stored reading's own line at every tick, not the unread sentence", async () => {
  /* THE ONE NAMED EDIT to the real `op=reading` answer: its `job` is what the owner answers once no row is left for the digest (control-plane R135) */
  const gone = (json) => (json && json.result ? { ...json, result: { ...json.result, job: { state: null } } } : json);
  const p = await ticked({ reading: gone });
  assert.ok(p.byOp("reading").length >= 1);
  assert.ok(!unread(p), "not the unread sentence: " + text(p).slice(-400));
  assert.ok(drawn(p).length > 0 && !drawn(p).includes("pending"), "the stored reading's own line, not the pending one: " + drawn(p));
  assert.ok(text(p).includes(OWN));
  await p.clock.tick(30000);
  await idle(p, 3000);
  assert.ok(!unread(p) && !drawn(p).includes("pending") && text(p).includes(OWN), "at every further tick");
});

test("R65 control (the real plane): a reading the plane has not stored yet keeps the unread sentence, and a pending row draws its state", async () => {
  /* named edits: the stored reading is absent (`found: false`, `reading: null`), the row says it is being read */
  const absent = (json) => (json && json.result ? { ...json, result: { ...json.result, found: false, reading: null, job: { state: null } } } : json);
  const p = await ticked({ reading: absent }, (x) => x.byOp("reading").length >= 1);
  assert.ok(unread(p), "no reading stored, no row: the static line");
  const reading = (json) => (json && json.result ? { ...json, result: { ...json.result, found: false, reading: null, job: { state: "reading", written: 3, skipped: 0, owed: 7, failed: 0, failed_why: {}, cursor: null, last_progress_at: null, priority: null } } } : json);
  const q = await ticked({ reading }, (x) => x.byOp("reading").length >= 1);
  assert.ok(main(q).querySelector('[data-job-state="reading"]'), "a pending row draws its state: " + drawn(q));
});
