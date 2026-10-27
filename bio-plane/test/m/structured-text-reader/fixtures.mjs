/* Fixtures for the structured-text-reader suite: bodies encoded as the tests need them, generated files of any size
 * served through a range source a window at a time (never held whole), and a reader that walks every step of a read.
 * The bounds come from runtime-limits' table, never a literal here. */
import { TEXT_BYTES_MAX, NESTING_MAX, CALENDAR_EVENTS_MAX } from "../../../src/structured-text-reader/index.mjs";

export { TEXT_BYTES_MAX, NESTING_MAX, CALENDAR_EVENTS_MAX };

export const enc = (s) => new TextEncoder().encode(s);

/** A range source over bytes in hand that counts what it is asked for. */
export function countingSource(bytes) {
  const log = { reads: 0, bytes: 0, ranges: [] };
  return {
    log,
    size: bytes.length,
    async readRange(offset, length) {
      log.reads++; log.bytes += length; log.ranges.push([offset, length]);
      return bytes.subarray(offset, offset + length);
    },
  };
}

const COUNTER = "@@@@@@@@@";
export const counter = (i) => String(i).padStart(COUNTER.length, "0");

/**
 * A generated text of exactly `size` bytes (ASCII): `head`, then `pad` repeated to fill, then `count` records, then
 * `tail`. A record is `record` with every `@@@@@@@@@` replaced by its 0-based number, nine digits wide, so every record
 * has one length and the last one's number is its token. `first` (optional) is the first record's own text, of the same
 * length (a JSON array's first element has no comma before it). Served by range, built per window.
 */
export function generatedText({ head, record, first = null, tail, size, pad = " " }) {
  const H = enc(head), T = enc(tail), R = enc(record), F = first == null ? R : enc(first), P = enc(pad);
  if (F.length !== R.length) throw new Error("first record must have the record's length");
  const L = R.length;
  const count = Math.floor((size - H.length - T.length) / L);
  const fill = size - H.length - T.length - count * L;
  if (fill % P.length) throw new Error("pad does not divide the remainder");
  const slots = [];
  for (let at = record.indexOf(COUNTER); at >= 0; at = record.indexOf(COUNTER, at + 1)) slots.push(at);
  const recordStart = H.length + fill;
  const recordBytes = (i) => {
    const b = (i === 0 ? F : R).slice();
    const d = counter(i);
    for (const at of slots) for (let k = 0; k < d.length; k++) b[at + k] = d.charCodeAt(k);
    return b;
  };
  const byteAt = (o) => (o < H.length ? H[o] : P[(o - H.length) % P.length]);
  return {
    size,
    count,
    lastToken: counter(count - 1),
    async readRange(offset, length) {
      const out = new Uint8Array(length);
      let p = 0;
      while (p < length) {
        const o = offset + p;
        if (o < recordStart) { out[p++] = byteAt(o); continue; }
        const r = o - recordStart;
        if (r >= count * L) { out[p++] = T[r - count * L]; continue; }
        const i = Math.floor(r / L), k = r % L;
        const b = recordBytes(i);
        const n = Math.min(L - k, length - p);
        out.set(b.subarray(k, k + n), p);
        p += n;
      }
      return out;
    },
  };
}

/** Every step of a read, without holding the units of more than one step: `{steps, units, last, answers}`. */
export async function walk(entry, source, budget, { keep = false, onUnit = null } = {}) {
  let cursor = null, steps = 0, units = 0, last = null, answer;
  const kept = [];
  for (;;) {
    answer = await entry.read(source, cursor, budget);
    steps++;
    if (!answer.ok) return { steps, units, last, answer, kept };
    units += answer.units.length;
    if (answer.units.length) last = answer.units[answer.units.length - 1];
    if (onUnit) for (const u of answer.units) onUnit(u);
    if (keep) kept.push(...answer.units);
    if (!answer.more) return { steps, units, last, answer, kept };
    cursor = answer.next;
  }
}

/** The units of a whole read of bytes in hand, through the entry's `read` with no budget. */
export async function unitsOf(entry, text, budget = null) {
  const bytes = typeof text === "string" ? enc(text) : text;
  const r = await walk(entry, countingSource(bytes), budget, { keep: true });
  return { ...r.answer, units: r.kept };
}
