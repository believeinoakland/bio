/* mail-reader: a mailbox (MBOX) split into its messages by streaming over a range source, never loaded whole
 * (R3). A message begins at a `From ` line at the start of the file or after a blank line; its `>From ` lines are
 * unescaped (mboxrd) and it is read as an EML by the caller's `readOne`. Pure; never throws (R11, R15). */

/* the window one range read asks for: a step's unit of reading, not a ceiling the module keeps */
const WINDOW = 1 << 20;
const TAIL = 16;
const NL = 0x0a;
const FROM = [0x46, 0x72, 0x6f, 0x6d, 0x20];

/* A range source over bytes or `{size, readRange(offset, length)}` (`reading-pipeline` R45; `ooxml`'s `read` too). */
export function sourceOf(input) {
  if (input instanceof Uint8Array) return { size: input.length, read: async (o, n) => input.subarray(o, o + n) };
  if (!input || typeof input !== "object" || !Number.isSafeInteger(input.size) || input.size < 0) return null;
  const fn = typeof input.readRange === "function" ? input.readRange : typeof input.read === "function" ? input.read : null;
  if (!fn) return null;
  return {
    size: input.size,
    async read(o, n) {
      if (n === 0) return new Uint8Array(0);
      let got = await fn.call(input, o, n);
      if (got instanceof ArrayBuffer) got = new Uint8Array(got);
      if (!(got instanceof Uint8Array) || got.length < n) throw new Error("short read");
      return got.length === n ? got : got.subarray(0, n);
    },
  };
}

const isFromAt = (b, j) => FROM.every((x, k) => b[j + k] === x);

/* The offsets of message starts in one window `w` read at `pos`, with `tail` the bytes just before it. A start is
 * `From ` after a blank line (LF LF or LF CR LF), or at offset 0. */
function startsIn(tail, w, pos) {
  const out = [];
  const probe = new Uint8Array(tail.length + w.length);
  probe.set(tail, 0); probe.set(w, tail.length);
  const base = pos - tail.length;
  if (pos === 0 && isFromAt(w, 0)) out.push(0);
  for (let j = probe.indexOf(NL); j >= 0; j = probe.indexOf(NL, j + 1)) {
    if (j + 1 + FROM.length > probe.length) break;
    if (!isFromAt(probe, j + 1)) continue;
    const blank = (j >= 1 && probe[j - 1] === NL) || (j >= 2 && probe[j - 1] === 0x0d && probe[j - 2] === NL);
    /* a start whose `From ` ended in an earlier window was counted there */
    if (blank && base + j + 1 + FROM.length > pos) out.push(base + j + 1);
  }
  return out;
}

/* Every message start, counted by streaming; stops once `stopAfter` starts are seen. */
export async function countMessages(src, stopAfter) {
  let count = 0, tail = new Uint8Array(0);
  for (let pos = 0; pos < src.size; pos += WINDOW) {
    const w = await src.read(pos, Math.min(WINDOW, src.size - pos));
    count += startsIn(tail, w, pos).length;
    if (count > stopAfter) return { count, stopped: true };
    tail = w.subarray(Math.max(0, w.length - TAIL)).slice();
  }
  return { count, stopped: false };
}

/* The next message from `offset` (a message start): its bytes (held only while below `maxBytes`) and the offset
 * where the next one starts (or the source's size). */
async function nextMessage(src, offset, maxBytes, cache) {
  const chunks = [];
  let held = 0, over = false, tail = new Uint8Array(0);
  for (let pos = offset; pos < src.size;) {
    let w;
    if (cache.w && pos >= cache.pos && pos < cache.pos + cache.w.length) w = cache.w.subarray(pos - cache.pos);
    else { w = await src.read(pos, Math.min(WINDOW, src.size - pos)); cache.pos = pos; cache.w = w; }
    const next = startsIn(tail, w, pos).find((s) => s > offset);
    const take = next === undefined ? w : w.subarray(0, next - pos);
    if (!over) {
      if (held + take.length > maxBytes) { over = true; chunks.length = 0; }
      else { chunks.push(take); held += take.length; }
    }
    if (next !== undefined) return { end: next, bytes: over ? null : concat(chunks, held), length: next - offset };
    tail = w.subarray(Math.max(0, w.length - TAIL)).slice();
    pos += w.length;
  }
  return { end: src.size, bytes: over ? null : concat(chunks, held), length: src.size - offset };
}

function concat(chunks, n) {
  if (chunks.length === 1) return chunks[0];
  const out = new Uint8Array(n);
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.length; }
  return out;
}

/* A mailbox message's EML bytes: its `From ` line dropped and each `>From ` line given back one `>`. */
export function unescape(bytes) {
  let start = bytes.indexOf(NL) + 1;
  if (start <= 0) start = bytes.length;
  let b = bytes.subarray(start);
  let end = b.length;
  while (end > 0 && (b[end - 1] === NL || b[end - 1] === 0x0d)) end--;
  b = b.subarray(0, end);
  const out = new Uint8Array(b.length);
  let n = 0, lineStart = true;
  for (let i = 0; i < b.length; i++) {
    if (lineStart && b[i] === 0x3e) {
      let k = i;
      while (b[k] === 0x3e) k++;
      if (isFromAt(b, k)) { lineStart = false; continue; }
    }
    out[n++] = b[i];
    lineStart = b[i] === NL;
  }
  return out.subarray(0, n);
}

/* One piece of a mailbox: messages from `cursor` until `budget.bytes` are read. `readOne(bytes, index)` answers a
 * message's unit; a message over `maxBytes` is a failed unit with its size. */
export async function readPiece(src, cursor, budget, { maxBytes, readOne, tooLarge }) {
  let offset = cursor?.offset ?? 0, index = cursor?.index ?? 0, spent = 0;
  const units = [], counters = { written: 0, skipped: 0, owed: 0, failed: 0 };
  const cache = { pos: 0, w: null };
  const want = Number.isSafeInteger(budget?.bytes) && budget.bytes > 0 ? budget.bytes : WINDOW;
  if (index === 0 && offset === 0 && src.size > 0) {
    const first = await src.read(0, Math.min(FROM.length, src.size));
    if (!isFromAt(first, 0)) return { ok: false, reason: "MAIL_MAILBOX_MALFORMED" };
  }
  while (offset < src.size && spent < want) {
    const m = await nextMessage(src, offset, maxBytes, cache);
    if (!m.bytes) { units.push({ index, offset, length: m.length, ...tooLarge(m.length) }); counters.failed++; }
    else {
      const u = await readOne(unescape(m.bytes), index);
      units.push({ index, offset, length: m.length, ...u });
      if (u.ok) counters.written++; else counters.failed++;
    }
    spent += m.length;
    offset = m.end;
    index++;
  }
  const more = offset < src.size;
  return { ok: true, units, next: more ? { offset, index } : null, more, ...(more ? {} : { final: true }), counters };
}
