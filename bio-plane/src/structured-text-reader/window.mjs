/* structured-text-reader: the byte windows (R1, R6, R8). A text is read a window at a time from a range source; each
 * window ends on a character boundary of the encoding the head named, so a window cut inside a UTF-8 sequence or a
 * UTF-16 pair reads the same characters as the whole text. The encoding is decided once, from the head, through
 * `ooxml.decodeText` (its R36), and carried in the cursor. Exported for `mail-reader`, which reads its bodies the same way.
 * Pure: no store, no network, no clock. */
import { decodeText } from "../ooxml.mjs";

/** The head read to decide the encoding and the format: enough for an XML declaration, a JSON head and two NDJSON lines. */
export const HEAD_BYTES = 64 * 1024;
/** One window: the grain a step decodes, at most; a step's budget may ask for less. */
export const WINDOW_BYTES = 1 << 20;

/** The byte-order mark's length for `encoding` when `b` starts with it, else 0. */
export function bomLength(b, encoding) {
  if (encoding === "utf-8" && b.length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) return 3;
  if (encoding === "utf-16le" && b.length >= 2 && b[0] === 0xff && b[1] === 0xfe) return 2;
  if (encoding === "utf-16be" && b.length >= 2 && b[0] === 0xfe && b[1] === 0xff) return 2;
  return 0;
}

/** The encoding of a text from its head: `{ok:true, encoding, assumed, bom}` or `{ok:false, why:"ENCODING_UNSUPPORTED", name}`. */
export function sniffEncoding(head, kind = null) {
  const d = decodeText(head, kind ? { kind } : undefined);
  if (!d.ok) return { ok: false, why: "ENCODING_UNSUPPORTED", name: d.name ?? null };
  return { ok: true, encoding: d.encoding, assumed: d.assumed, bom: bomLength(head, d.encoding) };
}

/** How many of `b`'s bytes end on a character boundary of `encoding` (all of them at the end of the file). */
export function alignedLength(b, encoding, atEnd) {
  const n = b.length;
  if (atEnd) return n;
  if (encoding === "utf-8") {
    for (let k = 1; k <= 3 && k <= n; k++) {
      const x = b[n - k];
      if ((x & 0xc0) === 0x80) continue;
      if (x >= 0xc0 && (x >= 0xf0 ? 4 : x >= 0xe0 ? 3 : 2) > k) return n - k;
      return n;
    }
    return n;
  }
  if (encoding === "utf-16le" || encoding === "utf-16be") {
    let m = n - (n % 2);
    if (m >= 2) {
      const unit = encoding === "utf-16le" ? b[m - 2] | (b[m - 1] << 8) : (b[m - 2] << 8) | b[m - 1];
      if (unit >= 0xd800 && unit <= 0xdbff) m -= 2;
    }
    return m;
  }
  return n;
}

/** The characters of one aligned window, and how many of them the encoding could not read. */
export function decodeWindow(b, encoding) {
  const text = new TextDecoder(encoding, { fatal: false, ignoreBOM: true }).decode(b);
  let replaced = 0;
  for (let at = text.indexOf("�"); at >= 0; at = text.indexOf("�", at + 1)) replaced++;
  return { text, replaced };
}

/** A range source over bytes in hand, the shape `reading-pipeline` R45 hands an entry. */
export function bytesSource(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : ArrayBuffer.isView(bytes)
    ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength) : new Uint8Array(0);
  return { size: b.length, readRange: async (offset, length) => b.subarray(offset, offset + length) };
}

/** The source's range reader, checked: `{size, read}` whose `read` answers exactly `length` bytes or throws. */
export function rangeOf(source) {
  if (!source || typeof source !== "object" || !Number.isSafeInteger(source.size) || source.size < 0) return null;
  const fn = typeof source.readRange === "function" ? source.readRange : typeof source.read === "function" ? source.read : null;
  if (!fn) return null;
  return {
    size: source.size,
    async read(offset, length) {
      if (length === 0) return new Uint8Array(0);
      let got = await fn.call(source, offset, length);
      if (got instanceof ArrayBuffer) got = new Uint8Array(got);
      else if (ArrayBuffer.isView(got) && !(got instanceof Uint8Array)) got = new Uint8Array(got.buffer, got.byteOffset, got.byteLength);
      if (!(got instanceof Uint8Array) || got.length < length) throw new Error("short range");
      return got.length === length ? got : got.subarray(0, length);
    },
  };
}
