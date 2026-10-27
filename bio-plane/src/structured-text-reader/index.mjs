/* structured-text-reader (layer 1; build/requirements/structured-text-reader.md): JSON, NDJSON, XML, SVG, KML and KMZ,
 * GeoJSON, calendar (ICS), contact (VCF) and caption (SRT, VTT) files, read in byte windows with a carry to the text
 * bound, each value keeping its structure so a unit is found and cited by its path, a malformed file read as far as it
 * parses and the rest stated.
 *
 * Each format is one registry entry in `format-registry`'s shape (R8): `format`, `detect(bytes, contentType)`, `parts`,
 * `structure`, `text`, and the reader contract of `reading-pipeline` R45 over a range source `{size, readRange}`:
 * `plan(source)` and `read(source, cursor, budget)`. A step decodes at most `budget.bytes` bytes, a window at a time,
 * each window ending on a character boundary; the parser's state between windows travels in the opaque cursor, so a
 * step costs the bytes it decodes and no step rescans what an earlier one read (R6). The file is never loaded whole.
 *
 * Pure: no store, no network, no clock (R10). Nothing a file names is fetched or run (R4). Every ceiling is quoted from
 * `runtime-limits` through `boundOf` (R9). */
import { listArchive, streamMember } from "../ooxml.mjs";
import { localize } from "../setup-words/index.mjs";
import { createJsonParser } from "./json.mjs";
import { createXmlParser } from "./xml.mjs";
import { createLinesParser } from "./lines.mjs";
import { detectFor } from "./detect.mjs";
import { CALENDAR_EVENTS_MAX, NESTING_MAX, Stop, TEXT_BYTES_MAX, statementOf } from "./limits.mjs";
import { HEAD_BYTES, WINDOW_BYTES, alignedLength, bytesSource, decodeWindow, rangeOf, sniffEncoding } from "./window.mjs";

export { TEXT_BYTES_MAX, NESTING_MAX, CALENDAR_EVENTS_MAX } from "./limits.mjs";
export { HEAD_BYTES, WINDOW_BYTES, alignedLength, decodeWindow, sniffEncoding, bytesSource } from "./window.mjs";
export { detectText } from "./detect.mjs";

/** The formats this module reads, in the order `format-registry` registers them (each detects only its own). */
export const STRUCTURED_TEXT_FORMATS = Object.freeze(["json", "ndjson", "xml", "svg", "kml", "kmz", "geojson", "ics", "vcf", "srt", "vtt"]);

const FAMILY = Object.freeze({ json: "json", ndjson: "json", geojson: "json", xml: "xml", svg: "xml", kml: "xml", ics: "lines", vcf: "lines", srt: "lines", vtt: "lines" });
const makeParser = (format, saved) => (FAMILY[format] === "json" ? createJsonParser(format, saved)
  : FAMILY[format] === "xml" ? createXmlParser(format, saved) : createLinesParser(format, saved));

/* ------------------------------------------------------------------ answers */

const KIND_WORD = Object.freeze({
  json: "JSON", ndjson: "JSON Lines", geojson: "GeoJSON", xml: "XML", svg: "SVG", kml: "KML", kmz: "KMZ",
  ics: "calendar", vcf: "contact", srt: "caption", vtt: "caption",
});

/** A refusal, never thrown: `failure` is `final` (the file's own content or size) or `transient` (the source failed). */
function refusal(format, failure, reason, extra = {}) {
  return { ok: false, format, failure, reason, ...extra };
}

function tooLarge(format, size) {
  const st = statementOf("bytes", size);
  return refusal(format, "final", "TOO_LARGE", { ...st, detail: localize("structured-text.too_large",
    "This {kind} file is {size} bytes, over the limit of {bound} bytes for this kind of file, so it was not read.",
    { kind: KIND_WORD[format], size: st.size, bound: st.bound }) });
}

function limitRefusal(format, stop) {
  if (stop.code === "NESTING_OVER_LIMIT") {
    return refusal(format, "final", stop.code, { bound: NESTING_MAX, key: statementOf("nesting", NESTING_MAX + 1).key, line: stop.line, whole: true,
      detail: localize("structured-text.nesting_over_limit",
        "This {kind} file nests values more than {bound} levels deep, the limit, so the whole file was refused (found at line {line}).",
        { kind: KIND_WORD[format], bound: NESTING_MAX, line: stop.line }) });
  }
  return refusal(format, "final", stop.code, { bound: CALENDAR_EVENTS_MAX, key: statementOf("events", CALENDAR_EVENTS_MAX + 1).key, line: stop.line, whole: true,
    detail: localize("structured-text.events_over_limit",
      "This calendar holds more than {bound} events, the limit, so the whole file was refused.", { bound: CALENDAR_EVENTS_MAX }) });
}

function stoppedStatement(format, stop) {
  return {
    line: stop.line, why: stop.why,
    detail: localize("structured-text.stopped_at_line",
      "Read as far as line {line}: the {kind} file stops being valid there, and the rest of it was not read.",
      { line: stop.line, kind: KIND_WORD[format] }),
  };
}

/* ------------------------------------------------------------------ the cursor */

const VERSION = 1;
function encodeCursor(c) {
  const json = JSON.stringify(c);
  const bytes = new TextEncoder().encode(json);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function decodeCursor(s) {
  try {
    const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch { return null; }
}

/* ------------------------------------------------------------------ plan and read (reading-pipeline R45) */

/** `plan(source)`: the kind, the verdict of its size against the text bound, and the grain; reads the head only. */
async function planText(format, source) {
  const src = rangeOf(source);
  if (!src) return refusal(format, "transient", "SOURCE_UNREADABLE");
  const st = statementOf("bytes", src.size);
  const verdict = { ok: src.size <= TEXT_BYTES_MAX, size: src.size, limit: st.bound, bound_key: st.key };
  if (format === "kmz") return { ok: true, kind: format, pages: null, rows: null, verdict, mode: "member" };
  let head;
  try { head = await src.read(0, Math.min(src.size, HEAD_BYTES)); } catch { return refusal(format, "transient", "SOURCE_UNREADABLE"); }
  const enc = sniffEncoding(head, FAMILY[format] === "xml" ? "xml" : null);
  return { ok: true, kind: format, pages: null, rows: null, verdict, mode: "windows", encoding: enc.ok ? enc.encoding : null };
}

/** One step of a windowed read: `{ok, units, next, more, final?, counters, encoding, read_through, total}`. */
async function readText(format, source, cursor, budget) {
  const src = rangeOf(source);
  if (!src) return refusal(format, "transient", "SOURCE_UNREADABLE");
  if (src.size > TEXT_BYTES_MAX) return tooLarge(format, src.size);
  let c;
  if (cursor == null) {
    let head;
    try { head = await src.read(0, Math.min(src.size, HEAD_BYTES)); } catch { return refusal(format, "transient", "SOURCE_UNREADABLE"); }
    const enc = sniffEncoding(head, FAMILY[format] === "xml" ? "xml" : null);
    if (!enc.ok) {
      return refusal(format, "final", "ENCODING_UNSUPPORTED", { name: enc.name ?? undefined,
        detail: localize("structured-text.encoding_unsupported", "This {kind} file is written in a text encoding that cannot be read.", { kind: KIND_WORD[format] }) });
    }
    c = { v: VERSION, f: format, size: src.size, enc: enc.encoding, assumed: enc.assumed, off: enc.bom, seq: 0, replaced: 0, st: null };
  } else {
    c = typeof cursor === "string" ? decodeCursor(cursor) : null;
    if (!c || c.v !== VERSION || c.f !== format || c.size !== src.size || !Number.isSafeInteger(c.off) || c.off > src.size) {
      return refusal(format, "final", "CURSOR_MISMATCH", { detail: localize("structured-text.cursor_mismatch",
        "This place in the reading does not belong to this file, so the reading has to start again.") });
    }
  }
  const parser = makeParser(format, c.st);
  const units = [];
  const sink = (u) => { u.seq = c.seq++; u.format = format; units.push(u); };
  const bytesCap = Number.isFinite(budget?.bytes) && budget.bytes > 0 ? budget.bytes : Infinity;
  const objectsCap = Number.isFinite(budget?.objects) && budget.objects > 0 ? budget.objects : Infinity;
  let decoded = 0, stop = null;
  try {
    while (c.off < src.size && decoded < bytesCap && units.length < objectsCap) {
      let want = Math.min(WINDOW_BYTES, src.size - c.off, Math.max(bytesCap - decoded, 1));
      let raw, cut;
      for (;;) {
        raw = await src.read(c.off, want);
        cut = alignedLength(raw, c.enc, c.off + want >= src.size);
        if (cut > 0 || c.off + want >= src.size) break;
        want = Math.min(src.size - c.off, want + 4);   /* a window smaller than one character grows to hold it */
      }
      const w = decodeWindow(cut === raw.length ? raw : raw.subarray(0, cut), c.enc);
      c.replaced += w.replaced;
      c.off += cut;
      decoded += cut;
      parser.feed(w.text, sink);
    }
    if (c.off >= src.size) parser.end(sink);
  } catch (e) {
    if (e instanceof Stop) stop = e;
    else if (e && e.message === "short range") return refusal(format, "transient", "SOURCE_UNREADABLE");
    else return refusal(format, "transient", "SOURCE_UNREADABLE", { detail: String(e?.message ?? e).slice(0, 200) });
  }
  if (stop && stop.refuse) return { ...limitRefusal(format, stop), units: [] };
  const done = c.off >= src.size || !!stop;
  c.st = parser.save();
  const base = {
    ok: true, format, encoding: c.enc, encoding_assumed: c.assumed, units, read_through: c.off, total: src.size,
    counters: { written: units.length, skipped: stop ? 1 : 0, owed: 0, failed: 0 },
  };
  if (!done) return { ...base, more: true, next: encodeCursor(c) };
  const final = { whole: !stop, replaced: c.replaced, facts: parser.facts() };
  if (stop) final.stopped = stoppedStatement(format, stop);
  return { ...base, more: false, next: null, final };
}

/* ------------------------------------------------------------------ KMZ: the KML inside, read through the archive route */

async function readKmz(source, cursor, budget) {
  const src = rangeOf(source);
  if (!src) return refusal("kmz", "transient", "SOURCE_UNREADABLE");
  if (src.size > TEXT_BYTES_MAX) return tooLarge("kmz", src.size);
  if (cursor != null) {
    return refusal("kmz", "final", "CURSOR_MISMATCH", { detail: localize("structured-text.cursor_mismatch",
      "This place in the reading does not belong to this file, so the reading has to start again.") });
  }
  void budget;
  const archive = { size: src.size, read: (o, l) => src.read(o, l) };
  const listing = await listArchive(archive);
  if (!listing.ok) {
    return refusal("kmz", listing.why === "source_unreadable" ? "transient" : "final", listing.why === "source_unreadable" ? "SOURCE_UNREADABLE" : "ARCHIVE_REFUSED",
      { name: listing.why, detail: localize("structured-text.kmz_unreadable", "This KMZ archive could not be opened ({why}), so its map data was not read.", { why: listing.why }) });
  }
  const rows = listing.entries.filter((r) => r.kind !== "dir" && r.name && /\.kml$/i.test(r.name));
  const row = rows.find((r) => !r.name.includes("/")) ?? rows[0];
  if (!row) {
    return refusal("kmz", "final", "KMZ_NO_KML", { detail: localize("structured-text.kmz_no_kml",
      "This KMZ archive holds no KML document, so there is no map data in it to read.") });
  }
  if (row.uncompressed > TEXT_BYTES_MAX) return tooLarge("kmz", row.uncompressed);
  const { chunks, done } = streamMember(archive, row);
  const parser = createXmlParser("kml");
  const units = [];
  let seq = 0, enc = null, decoder = null, replaced = 0, stop = null, carry = new Uint8Array(0);
  const sink = (u) => units.push({ seq: seq++, format: "kmz", member: row.name, ...u });
  try {
    for await (const chunk of chunks) {
      let b = chunk;
      if (!decoder) {
        b = carry.length ? concat(carry, chunk) : chunk;
        if (b.length < Math.min(HEAD_BYTES, row.uncompressed)) { carry = b; continue; }
        const s = sniffEncoding(b.subarray(0, HEAD_BYTES), "xml");
        if (!s.ok) throw new Stop("ENCODING_UNSUPPORTED");
        enc = s.encoding;
        decoder = new TextDecoder(enc, { fatal: false, ignoreBOM: false });
      }
      const text = decoder.decode(b, { stream: true });
      replaced += countReplaced(text);
      parser.feed(text, sink);
    }
    if (!decoder && carry.length) {
      const s = sniffEncoding(carry.subarray(0, HEAD_BYTES), "xml");
      if (!s.ok) throw new Stop("ENCODING_UNSUPPORTED");
      enc = s.encoding;
      decoder = new TextDecoder(enc, { fatal: false, ignoreBOM: false });
      const text = decoder.decode(carry, { stream: true });
      replaced += countReplaced(text);
      parser.feed(text, sink);
    }
    if (decoder) parser.feed(decoder.decode(), sink);
    const verdict = await done;
    if (!verdict.ok) {
      return refusal("kmz", "final", "MEMBER_CORRUPT", { name: verdict.why, detail: localize("structured-text.kmz_member_corrupt",
        "The KML document inside this KMZ archive is damaged ({why}), so it was not read.", { why: verdict.detail ?? verdict.why }) });
    }
    parser.end(sink);
  } catch (e) {
    if (e instanceof Stop && e.code === "ENCODING_UNSUPPORTED") {
      return refusal("kmz", "final", "ENCODING_UNSUPPORTED", { detail: localize("structured-text.encoding_unsupported",
        "This {kind} file is written in a text encoding that cannot be read.", { kind: KIND_WORD.kmz }) });
    }
    if (!(e instanceof Stop)) return refusal("kmz", "transient", "SOURCE_UNREADABLE");
    stop = e;
  }
  if (stop && stop.refuse) return { ...limitRefusal("kmz", stop), units: [] };
  const final = { whole: !stop, member: row.name, replaced, facts: parser.facts() };
  if (stop) final.stopped = stoppedStatement("kmz", stop);
  return {
    ok: true, format: "kmz", encoding: enc, units, read_through: src.size, total: src.size, more: false, next: null, final,
    counters: { written: units.length, skipped: stop ? 1 : 0, owed: 0, failed: 0 },
  };
}

const concat = (a, b) => { const o = new Uint8Array(a.length + b.length); o.set(a); o.set(b, a.length); return o; };
const countReplaced = (t) => { let n = 0; for (let at = t.indexOf("�"); at >= 0; at = t.indexOf("�", at + 1)) n++; return n; };

/* ------------------------------------------------------------------ whole reads and the entries */

/** Every piece of a read, joined: the reading of the whole file through the same steps. */
export async function readAll(format, source, budget = null) {
  const entry = ENTRIES[format];
  const units = [];
  let cursor = null, last = null;
  for (;;) {
    const r = await entry.read(source, cursor, budget);
    if (!r.ok) return r;
    units.push(...r.units);
    last = r;
    if (!r.more) break;
    cursor = r.next;
  }
  return { ...last, units, counters: { ...last.counters, written: units.length } };
}

/** The registry's `text` slot: the whole file's units and text, read through the windows, never by a second path. */
async function textOf(format, bytes) {
  const r = await readAll(format, bytesSource(bytes));
  if (!r.ok) return r;
  const active = format === "svg" && r.final.facts.scripts ? [{ kind: "script", count: r.final.facts.scripts, run: false }] : [];
  return {
    ok: true, container: format, text: r.units.map((u) => u.text).filter((t) => t != null && t !== "").join("\n"), units: r.units,
    encoding: r.encoding, whole: r.final.whole, stopped: r.final.stopped ?? null, facts: r.final.facts,
    images: [], metadata: null, active,
    undetermined: r.final.stopped ? [{ reason: "MALFORMED", line: r.final.stopped.line, why: r.final.stopped.why }] : [],
    counts: { units: r.units.length, replaced: r.final.replaced },
  };
}

function entryFor(format) {
  const kmz = format === "kmz";
  return Object.freeze({
    format,
    detect: detectFor(format),
    parts: kmz ? (bytes) => listArchive(bytes) : null,
    structure: null,
    text: (bytes) => (kmz ? readKmz(bytesSource(bytes), null, null).then((r) => (r.ok ? { ok: true, container: "kmz",
      text: r.units.map((u) => u.text).filter(Boolean).join("\n"), units: r.units, encoding: r.encoding, whole: r.final.whole,
      stopped: r.final.stopped ?? null, facts: r.final.facts, images: [], metadata: null, active: [],
      undetermined: [], counts: { units: r.units.length } } : r)) : textOf(format, bytes)),
    plan: (source) => planText(format, source),
    read: (source, cursor = null, budget = null) => (kmz ? readKmz(source, cursor, budget) : readText(format, source, cursor, budget)),
  });
}

export const jsonEntry = entryFor("json");
export const ndjsonEntry = entryFor("ndjson");
export const xmlEntry = entryFor("xml");
export const svgEntry = entryFor("svg");
export const kmlEntry = entryFor("kml");
export const kmzEntry = entryFor("kmz");
export const geojsonEntry = entryFor("geojson");
export const icsEntry = entryFor("ics");
export const vcfEntry = entryFor("vcf");
export const srtEntry = entryFor("srt");
export const vttEntry = entryFor("vtt");

const ENTRIES = Object.freeze({ json: jsonEntry, ndjson: ndjsonEntry, xml: xmlEntry, svg: svgEntry, kml: kmlEntry, kmz: kmzEntry,
  geojson: geojsonEntry, ics: icsEntry, vcf: vcfEntry, srt: srtEntry, vtt: vttEntry });

/** The eleven entries, in `STRUCTURED_TEXT_FORMATS`' order, for `format-registry` to register unmodified (its R33). */
export const STRUCTURED_TEXT_ENTRIES = Object.freeze(STRUCTURED_TEXT_FORMATS.map((f) => ENTRIES[f]));
