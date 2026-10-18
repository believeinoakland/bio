/* R63 (K1888) — WHAT A READ HANDS THE MODEL OF A FILE: THE TEXT THE PLANE'S READERS EXTRACTED, AND ITS `active` LIST,
 * NEVER ITS BYTES.
 *
 * The plane's readers extract a file's text, and state its `active` list (its macros, scripts and embedded files) as a
 * fact about it; an embedded file reaches the record only as a capture of its own, read the same way. None of this
 * member's ops asks for a file's bytes (R37), but an answer is the plane's, and a field holding bytes in any encoding
 * (base64, a data URL, a raw byte array, a binary string) would hand the model the file itself, which is the thing a
 * reader exists to stand between. So every answer a read tool hands the model passes through `textOnly` first: a field
 * holding bytes is DROPPED, never cut or decoded, and the drop is named (`dropped`, each with its path and what it held)
 * so the caller can state it, in a run's trace and in the tool's result, as a fact about the answer.
 *
 * What stays: every other value as the plane answered it, `active` included, and a field NAMED like bytes whose value is
 * not bytes (a `bytes: 1234` length is a number, kept). Pure: no network, no state. */

const DATA_URL = /^\s*data:[^,]{0,200};base64,/i;
/* Controls other than tab, newline and carriage return: a string carrying them is a binary string, not text. */
const BINARY = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;
const BASE64 = /^[A-Za-z0-9+/_-]+={0,2}$/;
/* A base64 run this long is a file or a fragment of one; shorter runs (a digest, an id) are names, and stay. */
const BASE64_MIN = 256;
/* A list this long of integers 0–255 is a serialised byte array. */
const BYTE_ARRAY_MIN = 64;

/** What a string holds, when it holds bytes: `"a data URL"`, `"a binary string"`, `"base64"`; else null. */
export function bytesIn(s) {
  if (typeof s !== "string") return null;
  if (DATA_URL.test(s)) return "a data URL";
  if (BINARY.test(s)) return "a binary string";
  const t = s.replace(/\s+/g, "");
  if (t.length >= BASE64_MIN && BASE64.test(t)) return "base64";
  return null;
}

const isByteArray = (v) => Array.isArray(v) && v.length >= BYTE_ARRAY_MIN
  && v.every((n) => Number.isInteger(n) && n >= 0 && n <= 255);

/** R63 — `{content, dropped}`: the answer with every field holding bytes removed (an array element so held is removed
 *  from its list), and `dropped` naming each, `{path, held}`. The input is never changed. */
export function textOnly(answer) {
  const dropped = [];
  const walk = (v, path) => {
    if (typeof v === "string") {
      const held = bytesIn(v);
      if (held) { dropped.push({ path: path || "(the answer)", held }); return undefined; }
      return v;
    }
    if (isByteArray(v)) { dropped.push({ path: path || "(the answer)", held: "a byte array" }); return undefined; }
    if (Array.isArray(v)) {
      const out = [];
      v.forEach((x, i) => { const w = walk(x, `${path}[${i}]`); if (w !== undefined) out.push(w); });
      return out;
    }
    if (v && typeof v === "object") {
      const out = {};
      for (const [k, x] of Object.entries(v)) {
        const w = walk(x, path ? `${path}.${k}` : k);
        if (w !== undefined) out[k] = w;
      }
      return out;
    }
    return v;
  };
  const content = walk(answer, "");
  return { content: content === undefined ? null : content, dropped };
}

/** The sentence a read's drops are named by, in a trace or a tool's result; null when nothing was dropped. */
export function droppedNote(dropped) {
  if (!dropped || !dropped.length) return null;
  const listed = dropped.slice(0, 10).map((d) => `${d.path} (${d.held})`).join(", ");
  return `${dropped.length} field(s) of the answer held a file's bytes and were dropped before the model saw it, `
    + `never decoded: ${listed}${dropped.length > 10 ? ", …" : ""}. A file is read only as the text the plane's readers `
    + "extracted from it, with its active list";
}

/** A read tool's result for the model (R61, R63): the answer, text only; when something was dropped, the answer and
 *  the drop told beside it as a fact. */
export function toolContent(answer) {
  const { content, dropped } = textOnly(answer);
  return { content: dropped.length ? { answer: content, bytes_dropped: droppedNote(dropped) } : content, dropped };
}
