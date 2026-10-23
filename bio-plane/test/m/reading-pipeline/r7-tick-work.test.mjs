/* reading-pipeline G68 (fix round 7; diagnosis-R7-reading.md R1 "work per tick"): a reading tick after the first reads its
   piece, not the file. A 16 MiB CSV and a 12 MB text are read whole in pieces through `read` with a cursor, and each tick is
   measured by WORK (R-CLOCK: no time): the bytes the evidence store handed out, and the bytes the CSV entry was asked to
   decode. A later tick may touch its window and a fixed head, whatever the file's size; the first tick, which counts the
   whole text (R35's totals), reads the whole as it always did. The same pieces are the one-piece read's units (the equivalence
   tests are in `r7-window.test.mjs`). The PDF half of G68 waits for the provider (post J27). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { read } from "../../../src/reading-pipeline/index.mjs";
import { getFormat } from "../../../src/formats.mjs";
import { bucket, evidenceStore, hold, doc, withEntry } from "./fixture.mjs";
import { csvText } from "./g48-cases.mjs";

const MIB = 1024 * 1024;
const BUDGET = 512 * 1024;

/* The fixed bound a later tick may touch: the head the entry's signature needs (1 MiB), the window (1 MiB and the record it
   ends in), and the head's own record, with room. Not a function of the file's size. */
const LATER_TICK_BOUND = 5 * MIB;

const readOf = (b, document, cursor, extra = {}) =>
  read(document, { evidence: evidenceStore(b), env: {}, storeName: "bio", unitsBudget: BUDGET, cursor, ...extra });

/* Every piece to the end, with what each tick cost: the bytes the store handed out and the bytes given to `entry.text`. */
async function ticks(b, document, entryBytes, extra = {}) {
  const out = [];
  let cursor = null;
  for (let guard = 0; guard < 600; guard++) {
    const store0 = b.served, entry0 = entryBytes.n;
    const piece = await readOf(b, document, cursor, extra);
    out.push({ piece, store: b.served - store0, entry: entryBytes.n - entry0 });
    if (piece.more !== true) break;
    cursor = piece.cursor;
  }
  return out;
}

/* The csv entry, counting the bytes it is asked to decode: those handed to `parts` (the whole read's way) and to `text` as bytes
   (a window's way). */
function countingCsv(counter) {
  const real = getFormat("csv");
  const size = (x) => (x instanceof Uint8Array ? x.length : 0);
  return { ...real, parts: async (bytes) => { counter.n += size(bytes); return real.parts(bytes); },
                    text: async (given, opts) => { counter.n += size(given); return real.text(given, opts); } };
}

test("R40 R41 (G68): a 16 MiB CSV read in pieces - every tick after the first touches the store and the CSV entry for no more than a window and a head, not the file", async () => {
  const text = csvText(16 * MIB, { exact: false });
  assert.ok(text.length > 15 * MIB && text.length < 17 * MIB, `${text.length} bytes`);
  const b = bucket();
  const document = doc({ digest: await hold(b, text), bytes: text.length, ct: "text/csv", format: "csv", fromText: true });
  const entryBytes = { n: 0 };
  const run = await withEntry(countingCsv(entryBytes), () => ticks(b, document, entryBytes));
  assert.ok(run.length > 20, `${run.length} pieces`);
  assert.equal(run[0].piece.reading !== undefined, true, "the first piece is the reading");
  assert.ok(run[0].entry >= text.length, "the first tick reads the whole text, for R35's totals");
  run.slice(1).forEach((t, i) => {
    assert.equal(t.piece.reading, undefined, `piece ${i + 1} is units alone`);
    assert.ok(t.store <= LATER_TICK_BOUND, `tick ${i + 1}: the store handed out ${t.store} bytes of a ${text.length} byte file`);
    assert.ok(t.entry <= LATER_TICK_BOUND, `tick ${i + 1}: the entry was asked to decode ${t.entry} bytes of a ${text.length} byte file`);
  });
  const last = run[run.length - 1].piece;
  assert.equal(last.more, false);
  assert.equal(last.cursor, null);
  const units = run.flatMap((t) => t.piece.text_units || []);
  assert.equal(new Set(units.map((u) => u.seq)).size, units.length, "no block twice");
  assert.equal(run[0].piece.piece.units_total, units.length, "the first piece counted the blocks the pieces carried");
});

/* 120,000 lines of 100 bytes: 12 MB, no blank line, so each line is a unit. */
const LINES = 120000;
const lineOf = (i) => `line ${String(i).padStart(6, "0")} ` + "council-minutes ".repeat(5).padEnd(87, ".");
const longLog = () => Array.from({ length: LINES }, (_, i) => lineOf(i)).join("\n");

test("R40 (G68): a 12 MB text read in pieces - every tick after the first transfers its window of the store, not the file", async () => {
  const text = longLog();
  const b = bucket();
  const document = doc({ digest: await hold(b, text), bytes: text.length, ct: "text/plain", format: "undetermined", fromText: true });
  const none = { n: 0 };
  const run = await ticks(b, document, none, { unitsBudget: BUDGET, maxUnits: 4096 });
  assert.ok(run.length > 10, `${run.length} pieces`);
  assert.ok(run[0].store >= text.length, "the first tick reads the whole text, for R35's totals");
  run.slice(1).forEach((t, i) => assert.ok(t.store <= 3 * MIB, `tick ${i + 1}: the store handed out ${t.store} bytes of a ${text.length} byte file`));
  const units = run.flatMap((t) => t.piece.text_units || []);
  assert.equal(units.length, LINES);
  assert.equal(units[LINES - 1].text, lineOf(LINES - 1));
});
