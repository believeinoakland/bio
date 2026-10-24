/* Fixtures for the csv-reader suite: the byte encoder the tests build bodies with, and the bounds the suite resolves from
 * runtime-limits' table (never a literal of its own). */
import { boundOf } from "../../../src/read-bounds.mjs";

export const enc = (s) => (typeof s === "string" ? new TextEncoder().encode(s) : s);
/** The `csv` bytes bound (50 MB, the standard's figure for a light kind), the `csv` rows bound, the `sheet` column bound. */
export const BYTES_BOUND = boundOf("csv", "bytes");
export const ROWS_BOUND = boundOf("csv", "rows");
export const COLUMNS_BOUND = boundOf("sheet", "columns");
export const CELL_CHARS = boundOf("sheet", "cell_chars");
export const CELL_KEPT = boundOf("sheet", "cell_kept_chars");
/** A body one byte over the bytes bound: one long ASCII line (a guard test reads nothing but its head). */
export const overBytes = () => new Uint8Array(BYTES_BOUND + 1).fill(0x61);
