/* mail-reader: the internet message format (RFC 5322) and MIME (RFC 2045-2047, 2231), read from bytes.
 *
 * Pure: no store, no network, no clock (R15). Nothing here fetches what a message names: an HTML body is cleaned to
 * text and its remote references (images, tracking links) are counted, never requested (R5). Every function answers
 * a value or `{ok: false, reason}`; none throws to its caller (R11). */
import { decodeText } from "../ooxml.mjs";

const LATIN1 = new TextDecoder("latin1");
const UTF8_STRICT = new TextDecoder("utf-8", { fatal: true });

/* Bytes as a binary string (one char per byte), the form the header and boundary scans read. */
export const binary = (bytes) => LATIN1.decode(bytes);

/* The offset where the header block ends and the length of the blank line that ends it: CRLF CRLF or LF LF.
 * A message with no blank line is all headers (an empty body). */
export function splitHead(bytes) {
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] !== 0x0a) continue;
    if (bytes[i + 1] === 0x0a) return { head: i + 1, body: i + 2 };
    if (bytes[i + 1] === 0x0d && bytes[i + 2] === 0x0a) return { head: i + 1, body: i + 3 };
  }
  return { head: bytes.length, body: bytes.length };
}

/* A header block's text: UTF-8 where it is valid UTF-8 (RFC 6532), else each byte its Latin-1 character. */
function headText(bytes) {
  try { return UTF8_STRICT.decode(bytes); } catch { return binary(bytes); }
}

/* Every header field in order, unfolded: [{name, value}]. A line that is neither a field nor a continuation is
 * skipped and counted (`stray`), never joined to a neighbour. */
export function parseHeaders(bytes) {
  const text = headText(bytes);
  const fields = [];
  let stray = 0;
  for (const line of text.split(/\r?\n/)) {
    if (line === "") continue;
    if (/^[ \t]/.test(line)) {
      if (fields.length) fields[fields.length - 1].value += line.replace(/^[ \t]+/, " ");
      else stray++;
      continue;
    }
    const colon = line.indexOf(":");
    if (colon <= 0 || !/^[\x21-\x39\x3b-\x7e]+$/.test(line.slice(0, colon).trimEnd())) { stray++; continue; }
    fields.push({ name: line.slice(0, colon).trimEnd(), value: line.slice(colon + 1).trim() });
  }
  return { fields, stray };
}

/* All values of one header, case-blind, in order. */
export const allOf = (fields, name) => fields.filter((f) => f.name.toLowerCase() === name).map((f) => f.value);
export const firstOf = (fields, name) => allOf(fields, name)[0] ?? null;

/* Text in a named charset; an unknown or absent label is sniffed (`ooxml` decodeText). */
export function charsetText(bytes, charset) {
  const label = typeof charset === "string" ? charset.trim().toLowerCase() : "";
  if (label && label !== "us-ascii" && label !== "ascii") {
    try { return { text: new TextDecoder(label).decode(bytes), encoding: label }; } catch { /* sniffed below */ }
  }
  if (label === "us-ascii" || label === "ascii") {
    try { return { text: UTF8_STRICT.decode(bytes), encoding: "us-ascii" }; } catch { /* 8-bit text under an ASCII label */ }
  }
  const d = decodeText(bytes, label ? { declared: label } : undefined);
  if (d.ok) return { text: d.text, encoding: d.encoding };
  return { text: binary(bytes), encoding: "latin1" };
}

const B64 = new Uint8Array(256).fill(255);
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("").forEach((c, i) => { B64[c.charCodeAt(0)] = i; });

/* Base64, skipping every byte outside the alphabet (line breaks, stray spaces); stops at the first `=`. */
export function base64(bytes) {
  const out = new Uint8Array(Math.floor((bytes.length * 3) / 4) + 3);
  let n = 0, acc = 0, bits = 0;
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    if (c === 0x3d) break;
    const v = B64[c];
    if (v === 255) continue;
    acc = (acc << 6) | v; bits += 6;
    if (bits >= 8) { bits -= 8; out[n++] = (acc >> bits) & 0xff; }
  }
  return out.subarray(0, n);
}

const hexVal = (c) => (c >= 0x30 && c <= 0x39 ? c - 0x30 : c >= 0x41 && c <= 0x46 ? c - 0x37 : c >= 0x61 && c <= 0x66 ? c - 0x57 : -1);

/* Quoted-printable: `=XX` a byte, `=` at a line's end a soft break; a malformed `=` is kept as it stands. */
export function quotedPrintable(bytes) {
  const out = new Uint8Array(bytes.length);
  let n = 0;
  for (let i = 0; i < bytes.length; i++) {
    const c = bytes[i];
    if (c !== 0x3d) { out[n++] = c; continue; }
    if (bytes[i + 1] === 0x0a) { i += 1; continue; }
    if (bytes[i + 1] === 0x0d && bytes[i + 2] === 0x0a) { i += 2; continue; }
    const h = hexVal(bytes[i + 1] ?? -1), l = hexVal(bytes[i + 2] ?? -1);
    if (h >= 0 && l >= 0) { out[n++] = h * 16 + l; i += 2; continue; }
    out[n++] = c;
  }
  return out.subarray(0, n);
}

/* A body's bytes under its Content-Transfer-Encoding; an unknown encoding is stated and the bytes kept as sent. */
export function transferDecode(bytes, encoding) {
  const e = (encoding || "7bit").trim().toLowerCase();
  if (e === "base64") return { bytes: base64(bytes), encoding: e };
  if (e === "quoted-printable") return { bytes: quotedPrintable(bytes), encoding: e };
  if (e === "7bit" || e === "8bit" || e === "binary") return { bytes, encoding: e };
  return { bytes, encoding: e, unknown: true };
}

/* RFC 2047 encoded words in a header value; adjacent encoded words joined across the space between them. */
export function decodeWords(value) {
  if (typeof value !== "string" || !value.includes("=?")) return value;
  const WORD = /=\?([^?\s]+)\?([BbQq])\?([^?\s]*)\?=/g;
  const decoded = value.replace(/(=\?[^?\s]+\?[BbQq]\?[^?\s]*\?=)\s+(?==\?[^?\s]+\?[BbQq]\?[^?\s]*\?=)/g, "$1");
  return decoded.replace(WORD, (whole, charset, kind, data) => {
    try {
      const raw = Uint8Array.from(data, (ch) => ch.charCodeAt(0) & 0xff);
      const bytes = kind.toUpperCase() === "B" ? base64(raw) : quotedPrintable(Uint8Array.from(data.replace(/_/g, " "), (ch) => ch.charCodeAt(0) & 0xff));
      return charsetText(bytes, charset.split("*")[0]).text;
    } catch { return whole; }
  });
}

/* A structured header's value and parameters (Content-Type, Content-Disposition), RFC 2231 continuations and
 * charsets joined: {value, params}. */
export function parseParams(header) {
  const out = { value: "", params: {} };
  if (typeof header !== "string") return out;
  const s = header;
  let i = s.indexOf(";");
  out.value = (i < 0 ? s : s.slice(0, i)).trim().toLowerCase();
  const pieces = {};
  while (i >= 0 && i < s.length) {
    i++;
    const m = /^\s*([^=;\s]+)\s*=\s*/.exec(s.slice(i));
    if (!m) { const next = s.indexOf(";", i); i = next; continue; }
    i += m[0].length;
    let v;
    if (s[i] === '"') {
      let j = i + 1; v = "";
      for (; j < s.length && s[j] !== '"'; j++) { if (s[j] === "\\" && j + 1 < s.length) j++; v += s[j]; }
      i = s.indexOf(";", j);
    } else {
      const next = s.indexOf(";", i);
      v = (next < 0 ? s.slice(i) : s.slice(i, next)).trim();
      i = next;
    }
    pieces[m[1].toLowerCase()] = v;
  }
  const joined = {};
  for (const [k, v] of Object.entries(pieces)) {
    const c = /^([^*]+)\*(\d+)?(\*)?$/.exec(k);
    if (!c) { joined[k] ??= { parts: [], plain: v }; continue; }
    (joined[c[1]] ??= { parts: [] }).parts.push({ n: Number(c[2] ?? 0), v, enc: Boolean(c[3]) || (c[2] === undefined) });
  }
  for (const [k, j] of Object.entries(joined)) {
    if (!j.parts.length) { out.params[k] = decodeWords(j.plain); continue; }
    j.parts.sort((a, b) => a.n - b.n);
    let charset = null;
    const bytes = [];
    for (const p of j.parts) {
      let v = p.v;
      if (p.enc && p.n === 0) { const q = /^([^']*)'[^']*'(.*)$/.exec(v); if (q) { charset = q[1] || null; v = q[2]; } }
      if (p.enc) v.replace(/%([0-9A-Fa-f]{2})|([\s\S])/g, (_, h, ch) => { bytes.push(h ? parseInt(h, 16) : ch.charCodeAt(0) & 0xff); return ""; });
      else for (const ch of v) bytes.push(ch.charCodeAt(0) & 0xff);
    }
    out.params[k] = charsetText(Uint8Array.from(bytes), charset ?? "utf-8").text;
  }
  return out;
}

/* The byte offsets of each delimiter line `--boundary` in a body: the parts between them and whether a closing
 * `--boundary--` was found. null when no delimiter line appears at all. */
export function splitMultipart(bytes, boundary) {
  const text = binary(bytes);
  const dash = `--${boundary}`;
  const marks = [];
  for (let at = text.indexOf(dash); at >= 0; at = text.indexOf(dash, at + dash.length)) {
    if (at > 0 && text[at - 1] !== "\n") continue;
    const after = at + dash.length;
    const close = text.startsWith("--", after);
    const tail = text.slice(close ? after + 2 : after, (close ? after + 2 : after) + 200);
    if (!/^[ \t]*(\r?\n|$)/.test(tail)) continue;
    const eol = text.indexOf("\n", after);
    marks.push({ at, next: eol < 0 ? text.length : eol + 1, close });
    if (close) break;
  }
  if (!marks.length) return null;
  const parts = [];
  for (let k = 0; k < marks.length && !marks[k].close; k++) {
    const start = marks[k].next;
    let end = k + 1 < marks.length ? marks[k + 1].at : bytes.length;
    /* the line break before a delimiter is the delimiter's; an unclosed last part loses its final one too */
    if (bytes[end - 1] === 0x0a) end--;
    if (bytes[end - 1] === 0x0d) end--;
    parts.push(bytes.subarray(start, Math.max(start, end)));
  }
  return { parts, closed: marks.some((m) => m.close) };
}

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", copy: "©", reg: "®", mdash: "—", ndash: "–", hellip: "…", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };
const entity = (m, e) => {
  if (e[0] === "#") {
    const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : m;
  }
  return ENTITIES[e.toLowerCase()] ?? m;
};

/* An HTML body as text: scripts, styles and the head dropped, block ends as line breaks, tags removed, entities
 * decoded. Remote references (a `src`, `background` or `href` naming http(s) or a protocol-relative URL) are
 * counted and never followed. One pass of each pattern, linear in the text. */
export function htmlText(html) {
  const remote = (html.match(/\b(?:src|background|href)\s*=\s*["']?\s*(?:https?:)?\/\//gi) || []).length
    + (html.match(/url\(\s*["']?\s*(?:https?:)?\/\//gi) || []).length;
  const text = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|head|title)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<(br|hr)\b[^>]*>/gi, "\n")
    .replace(/<\/(p|div|tr|li|h[1-6]|table|blockquote|pre)\s*>/gi, "\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<\/t[dh]\s*>/gi, "\t")
    .replace(/<[^>]*>/g, "")
    .replace(/&(#[xX]?[0-9a-fA-F]+|[a-zA-Z]+);/g, entity)
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { text, remote };
}

/* RFC 5322 date-time (with the obsolete zone names) as an ISO instant; null when it names none. */
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const ZONES = { ut: 0, gmt: 0, z: 0, est: -300, edt: -240, cst: -360, cdt: -300, mst: -420, mdt: -360, pst: -480, pdt: -420 };
export function parseDate(value) {
  if (typeof value !== "string") return null;
  const m = /^\s*(?:[A-Za-z]{3},\s*)?(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([+-]\d{4}|[A-Za-z]{1,3})?/.exec(value.replace(/\([^)]*\)/g, " "));
  if (!m) return null;
  const mo = MONTHS.indexOf(m[2].toLowerCase());
  let y = Number(m[3]);
  if (m[3].length === 2) y += y < 50 ? 2000 : 1900;
  else if (m[3].length === 3) y += 1900;
  const d = Number(m[1]), h = Number(m[4]), mi = Number(m[5]), s = Number(m[6] ?? 0);
  if (mo < 0 || d < 1 || d > 31 || h > 23 || mi > 59 || s > 60) return null;
  let offset = 0;
  const z = m[7];
  if (z && /^[+-]\d{4}$/.test(z)) offset = (z[0] === "-" ? -1 : 1) * (Number(z.slice(1, 3)) * 60 + Number(z.slice(3)));
  else if (z && Object.hasOwn(ZONES, z.toLowerCase())) offset = ZONES[z.toLowerCase()];
  const t = Date.UTC(y, mo, d, h, mi, Math.min(s, 59)) - offset * 60000;
  const check = new Date(Date.UTC(y, mo, d));
  if (Number.isNaN(t) || check.getUTCDate() !== d) return null;
  return new Date(t).toISOString();
}
