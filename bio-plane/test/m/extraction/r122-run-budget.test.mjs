/* extraction R122 (T53; PLATFORM P-32, K5736): A LEDGER RUN OF `readHeld` HOLDS AT MOST A BUDGET before it writes and yields; the rest is the next tick's, from where it stopped, and the
   landed reading and index equal an uninterrupted run's. Through the real reader and `readHeld({kind: "reading"})`, as the plane's alarm calls it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, bundle, bucket, doc, sha, homesOver } from "./fixture.mjs";
import { READ_RUN_UNITS_MAX, READ_RUN_BYTES_MAX } from "../../../src/extraction/index.mjs";

const lines = (n) => Array.from({ length: n }, (_, i) => `line ${String(i).padStart(5, "0")} sewer fund minutes`).concat(["ENDMARKER"]).join("\n");
async function home(text) {
  const rows = new Map(), evidence = bucket();
  const w = fresh({ evidence, provenance: homesOver(rows) });
  bundle(w.s, "INFO-1");
  const u8 = new TextEncoder().encode(text), d = sha(u8);
  rows.set(d, { bundleId: "INFO-1", path: "t", encoding: "binary", bytes: u8.length, registered: "t", authored: false });
  await evidence.put(`bio/captures/${d}`, u8);
  const document = doc({ digest: d, bytes: u8.length, ct: "text/plain", format: "text", fromText: true });
  w.core.readFile = (b, p) => (b === "INFO-1" && p === "data/provenance.json" ? { text: JSON.stringify({ documents: [document] }) } : null);
  return { w, d };
}
const units = (w) => w.rows(`SELECT seq, extent, text FROM capture_text ORDER BY seq`).map((r) => [r.extent, r.text]);

test("R122: a document whose units pass the budget several times is read across several runs, none landing more than the budget, and the result equals one uninterrupted run's", async () => {
  const text = lines(2 * READ_RUN_UNITS_MAX + 100);
  const a = await home(text);
  let prev = 0, runs = 0, last;
  do {
    last = await a.w.x.readHeld({ sha: a.d, kind: "reading", storeName: "bio", env: {} });
    const now = a.w.rows(`SELECT count(*) n FROM capture_text`)[0].n;
    assert.ok(now - prev <= READ_RUN_UNITS_MAX, `a run landed ${now - prev} units`);
    prev = now; runs++;
  } while (last.more && runs < 50);
  assert.ok(runs >= 3, `read in ${runs} runs`);
  const b = await home(text);
  for (let n = 0, r; n < 50 && (r = await b.w.x.readHeld({ sha: b.d, storeName: "bio", env: {} })).more; n++);   /* the member-style run, drained */
  assert.deepEqual(units(a.w), units(b.w));
  assert.equal(a.w.rows(`SELECT rowid FROM capture_text_fts WHERE capture_text_fts MATCH 'ENDMARKER'`).length, 1);
});

test("R122: a run stopped part-way is resumed by the next tick from where it stopped and lands the same", async () => {
  const text = lines(2 * READ_RUN_UNITS_MAX + 7);
  const a = await home(text);
  await a.w.x.readHeld({ sha: a.d, kind: "reading", storeName: "bio", env: {} });
  const half = a.w.rows(`SELECT count(*) n FROM capture_text`)[0].n;
  assert.ok(half > 0 && half <= READ_RUN_UNITS_MAX);
  for (let n = 0; n < 20; n++) { const r = await a.w.x.readHeld({ sha: a.d, kind: "reading", storeName: "bio", env: {} }); if (!r.more) break; }
  const b = await home(text);
  for (let n = 0, r; n < 50 && (r = await b.w.x.readHeld({ sha: b.d, storeName: "bio", env: {} })).more; n++);
  assert.deepEqual(units(a.w), units(b.w));
});

test("R122 (control): a document within the budget is read in one run", async () => {
  const a = await home(lines(50));
  const r = await a.w.x.readHeld({ sha: a.d, kind: "reading", storeName: "bio", env: {} });
  assert.equal(r.more, undefined);
  assert.equal(a.w.rows(`SELECT count(*) n FROM capture_text`)[0].n >= 50, true);
  assert.ok(READ_RUN_BYTES_MAX > 0);
});
