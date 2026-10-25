/* store-assembly's copy of plane's shape helper. G123b (fix round 9; K4787, R-CLOCK): THE PASS BARS OF THE SHAPE HARNESS ARE COUNTS. The child's wall time is node's compute, not the platform's (workerd freezes `Date.now()` in the object), so
 * `TICK_MS_MAX` 10,000 / `FIRST_TICK_MS_MAX` 8,000 are retired: a plain 8 MiB DOCX's first tick took 13.3 s on a quiet 4-core machine (X30) and the bar failed the machine, not the product. What a
 * tick may do is stated by what it does and can be counted: the evidence-store reads it makes, the bytes they serve, the units it writes and the statements it runs (`ticks[].counts`, the child's
 * own counters, deterministic for a file). The figures are PROPOSED (a tick that reads the file whole eight times, or writes a piece's worth of units, is the shape's limit); the stated bound on units
 * is reading-pipeline's own `PIECE_UNITS_MAX`. A bar is a number a test can move; a test that moves it shows what a regression looks like. */
import { PIECE_UNITS_MAX } from "../../../../src/reading-pipeline/index.mjs";

export const TICK_COUNT_BARS = Object.freeze({
  gets: 8,                       /* evidence-store reads in one tick */
  bytesServedPerFileByte: 8,     /* bytes those reads serve, as a multiple of the file's own bytes */
  unitsWritten: PIECE_UNITS_MAX, /* text units one tick adds: a piece */
  sql: 20_000,                   /* statements one tick runs on the object's SQL */
  /* K4855 (2): from the second tick on, the evidence bytes a tick reads are bounded by the windows it needs, never the file: the sheet family's J-5 (a later tick hands the
     store at most 5 MiB of ranged reads; a 12 MiB CSV's ticks measured about 4.4 MB each, the dialect head read again each tick). A reader that reads the whole file every tick
     (8 times the file passed the bar above) fails this one. */
  laterTickBytes: 5 * 1048576,
});

/** the failures of the counts of every tick of a run against the bars (empty: pass); `fileBytes` is the file's length */
export function tickCountFailures(ticks, fileBytes, bars = TICK_COUNT_BARS) {
  const f = [];
  for (const t of ticks) {
    const c = t.counts;
    if (!c) { f.push(`tick ${t.n} states no counts`); continue; }
    if (c.gets > bars.gets) f.push(`tick ${t.n} read the evidence store ${c.gets} times, over ${bars.gets}`);
    if (c.bytesServed > bars.bytesServedPerFileByte * fileBytes) f.push(`tick ${t.n} served ${c.bytesServed} B of a ${fileBytes} B file, over ${bars.bytesServedPerFileByte} times it`);
    if (t.n >= 2 && bars.laterTickBytes !== undefined && c.bytesServed > bars.laterTickBytes) f.push(`tick ${t.n} served ${c.bytesServed} B, over the ${bars.laterTickBytes} B a later tick's windows need`);
    if (c.unitsWritten > bars.unitsWritten) f.push(`tick ${t.n} wrote ${c.unitsWritten} units, over ${bars.unitsWritten}`);
    if (c.sql > bars.sql) f.push(`tick ${t.n} ran ${c.sql} statements, over ${bars.sql}`);
  }
  return f;
}

/** the rows a mark is found in (the child's `markExtents`: [[from, to], ...]) against the row the generator put it on (`gen.markRows`): search is judged by extent (G123b), never by `total >= 1` */
export function markExtentFailures(done) {
  const f = [], truth = (done.gen && done.gen.markRows) || {};
  for (const [term, row] of Object.entries(truth)) {
    const ext = (done.markExtents && done.markExtents[term]) || [];
    if (!ext.some((e) => e && e[0] <= row && row <= e[1])) f.push(`${term} is on row ${row} and no text row of the index holds it (${JSON.stringify(ext)})`);
  }
  return f;
}
