/* structured-text-reader: each format answered from its content (R8; format-registry R34, R35). A head is read as text
 * only when it is valid text in a known encoding; then its leading structure decides: a JSON value, one JSON value a
 * line, a GeoJSON object, an XML root (svg, kml or another), `BEGIN:VCALENDAR`, `BEGIN:VCARD`, `WEBVTT`, a numbered
 * cue. Never the extension or the declared type alone: a declared type is asked only when no bytes are given, and is
 * answered `likely`. A KMZ is a ZIP whose directory names a KML document and no office or OpenDocument part. */
import { decodeText, hasZipMagic, readContainer, CONTENT_TYPES_PART, ODF_MIMETYPE_PART } from "../ooxml.mjs";
import { createJsonParser } from "./json.mjs";
import { HEAD_BYTES } from "./window.mjs";
import { localize } from "../setup-words/index.mjs";

const toBytes = (b) => (b instanceof Uint8Array ? b : b instanceof ArrayBuffer ? new Uint8Array(b)
  : ArrayBuffer.isView(b) ? new Uint8Array(b.buffer, b.byteOffset, b.byteLength) : null);

/* control characters other than tab, line feed, form feed and carriage return: none in a text file's head */
const BINARY = /[\u0000-\u0008\u000B\u000E-\u001A\u001C-\u001F]/;

/** The head as text, or null when it is not text: `{text, encoding, whole}`. */
export function headText(bytes, kind = null) {
  const b = toBytes(bytes);
  if (!b || !b.length) return null;
  const whole = b.length <= HEAD_BYTES;
  let head = whole ? b : b.subarray(0, HEAD_BYTES);
  const d = decodeText(head, kind ? { kind } : undefined);
  if (!d.ok) return null;
  let text = d.text;
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  /* a head cut inside a character ends with one replacement; any other is not text in this encoding */
  const body = whole ? text : text.replace(/�+$/, "");
  if (BINARY.test(body)) return null;
  if (d.encoding === "utf-8" && body.includes("�")) return null;
  return { text, encoding: d.encoding, whole };
}

const certain = (format, signals, extra = {}) => ({ format, confidence: "certain", signals, ...extra });

/* ------------------------------------------------------------------ the JSON family */

/** How the JSON tokenizer fares over the head: `{ok, tokens, line}`, ok when the head parses to its end. */
function jsonHead(text, whole, mode = "json") {
  const p = createJsonParser(mode);
  try {
    p.feed(text, null);
    if (whole) p.end(null);
    return { ok: true, tokens: p.tokens };
  } catch {
    return { ok: false, tokens: p.tokens, line: p.line };
  }
}

/** Each complete line of the head is one JSON object or array, and there are two at least. */
function ndjsonHead(text, whole) {
  const lines = text.split(/\r?\n/);
  if (!whole) lines.pop();
  const filled = lines.filter((l) => l.trim() !== "");
  if (filled.length < 2) return false;
  for (const l of filled) {
    const t = l.trim();
    if (t[0] !== "{" && t[0] !== "[") return false;
    if (!jsonHead(t, true).ok) return false;
  }
  return true;
}

const GEO_ROOT = /^\s*\{[\s\S]*?"type"\s*:\s*"(FeatureCollection|Feature)"/;

function jsonFamily(h) {
  const t = h.text.trimStart();
  if (t[0] !== "{" && t[0] !== "[") return null;
  if (ndjsonHead(h.text, h.whole)) return certain("ndjson", [localize("structured-text.signal.ndjson", "one JSON value on each line")], { encoding: h.encoding });
  const j = jsonHead(h.text, h.whole);
  /* a malformed JSON file is still JSON when it breaks after its first values; a text that only opens with a bracket is not */
  if (!j.ok && j.tokens < 3) return null;
  const sig = j.ok ? localize("structured-text.signal.json", "a JSON value")
    : localize("structured-text.signal.json_stops", "a JSON value that stops parsing at line {line}", { line: j.line });
  if (t[0] === "{" && GEO_ROOT.test(h.text) && (/"features"\s*:\s*\[/.test(h.text) || /"geometry"\s*:/.test(h.text))) {
    return certain("geojson", [localize("structured-text.signal.geojson", "a GeoJSON object (its type, and features or a geometry)")], { encoding: h.encoding });
  }
  return certain("json", [sig], { encoding: h.encoding });
}

/* ------------------------------------------------------------------ the XML family */

/** The root element's name after the declaration, comments, processing instructions and a DOCTYPE; null when none. */
export function xmlRoot(text) {
  let at = 0;
  const n = text.length;
  for (;;) {
    while (at < n && /\s/.test(text[at])) at++;
    if (text.startsWith("<?", at)) { const e = text.indexOf("?>", at); if (e < 0) return null; at = e + 2; continue; }
    if (text.startsWith("<!--", at)) { const e = text.indexOf("-->", at); if (e < 0) return null; at = e + 3; continue; }
    if (/^<!DOCTYPE/i.test(text.slice(at, at + 9))) {
      if (/^<!DOCTYPE\s+html/i.test(text.slice(at, at + 64))) return { html: true };
      let depth = 0, e = at;
      for (; e < n; e++) { if (text[e] === "[") depth++; else if (text[e] === "]") depth--; else if (text[e] === ">" && depth <= 0) break; }
      if (e >= n) return null;
      at = e + 1;
      continue;
    }
    const m = /^<([\p{L}_][\p{L}\p{N}_.:\-]*)[\s>\/]/u.exec(text.slice(at, at + 512));
    if (!m) return null;
    const name = m[1];
    const local = name.includes(":") ? name.slice(name.indexOf(":") + 1) : name;
    return { name, local, declared: text.slice(0, at).includes("<?xml") };
  }
}

function xmlFamily(h) {
  const t = h.text.trimStart();
  if (t[0] !== "<") return null;
  const root = xmlRoot(h.text);
  if (!root || root.html) return null;
  if (root.local.toLowerCase() === "html") return null;
  if (root.local === "svg") return certain("svg", [localize("structured-text.signal.svg", "an XML document whose root element is svg")], { encoding: h.encoding });
  if (root.local === "kml") return certain("kml", [localize("structured-text.signal.kml", "an XML document whose root element is kml")], { encoding: h.encoding });
  /* an undeclared root must close somewhere in the head, so a line of prose opening with a tag is not XML */
  if (!root.declared && !h.text.includes(`</${root.name}>`) && !/\/>/.test(h.text) && !h.text.includes("</")) return null;
  return certain("xml", [localize("structured-text.signal.xml", "an XML document whose root element is {name}", { name: root.name })], { encoding: h.encoding });
}

/* ------------------------------------------------------------------ the line formats */

function firstLines(text, k) {
  const out = [];
  for (const l of text.split(/\r\n|\n|\r/)) {
    if (!out.length && l.trim() === "") continue;
    out.push(l);
    if (out.length >= k) break;
  }
  return out;
}

const SRT_TIMING = /^\s*\d{1,3}:\d{2}:\d{2}[,.]\d{1,3}\s+-->\s+\d{1,3}:\d{2}:\d{2}[,.]\d{1,3}/;

function lineFamily(h) {
  const [a, b] = firstLines(h.text, 2);
  if (a === undefined) return null;
  const first = a.trim().toUpperCase();
  if (first === "BEGIN:VCALENDAR") return certain("ics", [localize("structured-text.signal.ics", "a calendar file: its first line is BEGIN:VCALENDAR")], { encoding: h.encoding });
  if (first === "BEGIN:VCARD") return certain("vcf", [localize("structured-text.signal.vcf", "a contact file: its first line is BEGIN:VCARD")], { encoding: h.encoding });
  if (/^WEBVTT(?:[ \t]|$)/.test(a.replace(/^﻿/, ""))) return certain("vtt", [localize("structured-text.signal.vtt", "a caption file: its first line is WEBVTT")], { encoding: h.encoding });
  if (/^\s*\d+\s*$/.test(a) && b !== undefined && SRT_TIMING.test(b)) return certain("srt", [localize("structured-text.signal.srt", "a caption file: a numbered cue and its times")], { encoding: h.encoding });
  return null;
}

/* ------------------------------------------------------------------ declared types (asked only without bytes) */

const DECLARED = Object.freeze({
  json: ["application/json", "text/json"],
  ndjson: ["application/x-ndjson", "application/ndjson", "application/jsonl", "application/jsonlines", "application/json-seq"],
  geojson: ["application/geo+json", "application/vnd.geo+json"],
  xml: ["application/xml", "text/xml"],
  svg: ["image/svg+xml"],
  kml: ["application/vnd.google-earth.kml+xml"],
  kmz: ["application/vnd.google-earth.kmz"],
  ics: ["text/calendar"],
  vcf: ["text/vcard", "text/x-vcard", "text/directory"],
  srt: ["application/x-subrip", "text/srt"],
  vtt: ["text/vtt"],
});

function declared(format, contentType) {
  if (typeof contentType !== "string") return null;
  const ct = contentType.split(";")[0].trim().toLowerCase();
  if (!DECLARED[format].includes(ct)) return null;
  return { format, confidence: "likely", signals: [`content type "${contentType}"`,
    localize("structured-text.signal.declared", "likely, not certain: a declared type is a claim, and no bytes were given to check it")] };
}

/* ------------------------------------------------------------------ KMZ */

function kmzDetect(b) {
  if (!hasZipMagic(b)) return null;
  const c = readContainer(b);
  if (!c.ok) return null;
  const names = c.entries.map((e) => e.name);
  if (names.includes(CONTENT_TYPES_PART) || names.includes(ODF_MIMETYPE_PART)) return null;
  const kml = names.find((x) => /\.kml$/i.test(x));
  return kml ? certain("kmz", [localize("structured-text.signal.kmz", "a ZIP archive holding the KML document {name}", { name: kml })]) : null;
}

/** The format of a text from its head, among this module's text formats, or null. */
export function detectText(bytes) {
  const h = headText(bytes);
  if (!h) return null;
  const xmlH = h.text.trimStart()[0] === "<" ? headText(bytes, "xml") ?? h : h;
  return jsonFamily(h) ?? xmlFamily(xmlH) ?? lineFamily(h);
}

/** `detect(bytes, contentType)` for one format: its answer when the content is that format, else null (R8). */
export function detectFor(format) {
  return (bytes, contentType) => {
    if (bytes != null) {
      const b = toBytes(bytes);
      if (!b) return null;
      if (format === "kmz") return kmzDetect(b);
      const hit = detectText(b);
      return hit && hit.format === format ? hit : null;
    }
    return declared(format, contentType);
  };
}
