/* plane R25 (fix round 10, G5; walk D2a; K5057; plane R97, `store-assembly` R74), a CHARACTERISATION (not a defect): THE WALKER FILED 8 MINUTES AFTER UPLOADING, and the reading was refused `NO_HOME` three times and read after 535 s. That is the
   designed wait: a `reading` row whose capture has no home yet waits uncounted and backed off (R97). What this pins is the other half of the design, that the wait ends when the document is filed: a row backed off is re-armed by the
   filing through `op=promote` (control-plane follows a filed document's unread reading), so the reading does not wait out its backoff. On workerd under Miniflare, the plane's own Worker and `Store` with the REAL alarm
   (`r8-wave-kit.mjs`: a member's file uploaded and filed by her own acts, the administrator's `owedwork&sha=` the read): a 4 MB text is uploaded and NOT filed; the alarm's first pass finds no home and the row waits (`NO_HOME`, `next_try`
   ahead); the document is then filed through the door and the row is due before the backoff it was given, its reading run. Counts and the object's own stated instants only (R-CLOCK). Heavy: run alone. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { startWorld, textBytes } from "./r8-wave-kit.mjs";

const world = await startWorld({ tag: "r10nohome" });
after(() => world.kit.mf.dispose());

test("R25 R97 L (characterisation): an unfiled upload's reading waits `NO_HOME` with a backoff ahead; filing the document through op=promote brings the row forward, before that backoff, and it is read", { timeout: 300_000 }, async () => {
  const up = await world.upload(textBytes(4_000_060), "minutes.txt", "text/plain");
  const sha = up.capture.sha256;
  let waiting = null;
  for (let i = 0; i < 400 && !waiting; i++) {
    const w = await world.owedwork(sha), row = (w.owed || []).find((e) => e.kind === "reading");
    if (row && row.attempts >= 1 && row.why === "NO_HOME" && row.next_try > Date.now()) waiting = row;
    else await world.kit.later(250);
  }
  assert.ok(waiting, "the first pass found no home and the row waits, backed off");
  const original = waiting.next_try;
  await world.file(up);
  let ran = null;
  for (let i = 0; i < 400 && !ran; i++) {
    const w = await world.owedwork(sha), row = (w.owed || []).find((e) => e.kind === "reading");
    const runs = (w.last || []).filter((l) => l.kind === "reading" && l.at > waiting.last_try);
    if (runs.length || (row && row.next_try < original)) ran = { row, runs };
    else await world.kit.later(250);
  }
  assert.ok(ran, "the filing brought the waiting row forward");
  const at = Math.min(...[(ran.row && ran.row.next_try) ?? Infinity, ...(ran.runs || []).map((r) => r.at)]);
  console.log(`# R25 R97 L: backed off to ${original}; after the filing the row is due/ran at ${at} (${original - at} ms before the backoff ended)`);
  assert.ok(at < original, `the row was due at ${at}, not at the backoff ${original}`);
});
