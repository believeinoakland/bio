/* extraction R90 (fix round 6, G13; K4571): THE WALKER'S 12 MB TEXT WITH THE REAL READER. `round6.test.mjs` checks this module's half against a
   scripted provider; here reading-pipeline's own `read` (its R40, pieces by a cursor) is the provider, over a text of 120,000 lines of 100
   bytes and a last line "ENDMARKER" (12,000,060 bytes, no blank line). Each call of `readHeld` is one tick of the plane's ledger (plane R77:
   it calls `readHeld({sha, kind: "reading"})` and goes on at once while the answer says `more`). Red by name until reading-pipeline R40 has
   merged. Each test names the requirement ids it checks. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, doc, sha } from "./fixture.mjs";

const register = (rows) => ({ homeOf: (s) => rows.get(s) ?? null, onTestimony: () => ({ ok: true }) });
const LINES = 120000;
const lineOf = (i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".");
const longLog = () => Array.from({ length: LINES }, (_, i) => lineOf(i)).concat(["ENDMARKER" + " ".repeat(51)]).join("\n");

async function home(text, { project = null } = {}) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: register(rows) });
  bundle(w.s, "INFO-1", { project });
  const bytes = new TextEncoder().encode(text);
  const d = sha(bytes);
  rows.set(d, { bundleId: "INFO-1", path: "log.txt", encoding: "binary", bytes: bytes.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, bytes);
  const document = doc({ digest: d, bytes: bytes.length, ct: "text/plain", format: "undetermined", fromText: true });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  return { w, d, bytes };
}
const fts = (w, term) => w.rows(`SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH ?`, term).length;

test("R90 (G13): the 12,000,060 B text is read to its last line by the ledger's ticks, a piece each: midway a search finds only what is read and the reading says it has more; at the end ENDMARKER is in the index, the state is whole, every word is read and the entry ends", { timeout: 300_000 }, async () => {
  const { w, d, bytes } = await home(longLog());
  assert.equal(bytes.length, 12000060);
  assert.equal(w.x.readingFor(d, "class:admin").found, false, "the walker's state: nothing read");
  let ticks = 0, answer, midway = null;
  do {
    answer = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
    ticks++;
    assert.equal(answer.ok, true, JSON.stringify(answer));
    if (ticks === 3) midway = { reading: w.x.readingFor(d, "class:admin"), end: fts(w, "ENDMARKER"), some: fts(w, "council"), state: w.x.unitsOf(d).state };
  } while (answer.more === true && ticks < 100);
  assert.ok(ticks > 6 && ticks < 100, `read in ${ticks} ticks`);
  assert.equal(answer.read, true, "the last tick reads the last piece");
  assert.equal(midway.reading.more, true, "midway the reading says it has more");
  assert.ok(midway.reading.read_through > 0 && midway.reading.read_through < midway.reading.total, "and how far");
  assert.equal(midway.end, 0, "midway a search finds only what is read: the last line is not found");
  assert.ok(midway.some > 0);
  assert.equal(midway.state, "partial", "never stated whole while more follows");
  const got = w.x.readingFor(d, "class:admin");
  assert.deepEqual([got.more, got.read_through, got.total], [false, 12000060, 12000060]);
  assert.equal(got.reading.words_read, got.reading.words_total, "every word is read");
  assert.equal(fts(w, "ENDMARKER"), 1, "R-STOP: the last line is in the index");
  const st = w.x.unitsOf(d);
  assert.deepEqual([st.state, st.counts.offered, st.counts.written, st.counts.over_bound], ["whole", LINES + 1, LINES + 1, 0]);
  const last = w.one(`SELECT seq, text FROM capture_text WHERE capture_sha=? ORDER BY seq DESC LIMIT 1`, d);
  assert.deepEqual([last.seq, last.text], [LINES, "ENDMARKER"]);
  assert.ok(w.one(`SELECT ref FROM capture_text WHERE capture_sha=? AND seq=?`, d, LINES - 5), "a passage near the end is in the index with its address");
  assert.equal(w.one(`SELECT count(*) c FROM reading_history WHERE capture_sha=?`, d).c, 1, "the pieces change no reading");
  const again = await w.x.readHeld({ sha: d, kind: "reading" });
  assert.deepEqual([again.read, again.why], [false, "READING_HELD"], "a finished text is held as any reading is");
});

test("R90 (control): a text within one piece (4,000 lines, 400 KB) is complete at once: the first tick reads all of it, no `more`, whole, every word read", async () => {
  const text = Array.from({ length: 4000 }, (_, i) => lineOf(i)).concat(["ENDMARKER"]).join("\n");
  const { w, d } = await home(text);
  const r = await w.x.readHeld({ sha: d, kind: "reading", storeName: "bio", env: {} });
  assert.deepEqual([r.ok, r.read, r.more], [true, true, undefined], JSON.stringify(r));
  const got = w.x.readingFor(d, "class:admin");
  assert.deepEqual([got.more, got.read_through === got.total], [false, true]);
  assert.equal(w.x.unitsOf(d).state, "whole");
  assert.equal(fts(w, "ENDMARKER"), 1);
});

test("R90 (control): a viewer who may not see the text's bundle gets no tick of it, and is told no more than a record that is absent", async () => {
  const { w, d } = await home(longLog().slice(0, 2_000_000), { project: "PROJ-9" });
  const r = await w.x.readHeld({ sha: d, kind: "reading", viewer: "member:outsider" });
  assert.deepEqual([r.read, r.why], [false, "NO_HOME"]);
  assert.equal(w.x.readingFor(d, "class:admin").found, false);
});
