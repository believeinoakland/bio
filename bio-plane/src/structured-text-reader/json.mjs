/* structured-text-reader: JSON, NDJSON and GeoJSON, parsed as a stream (R2, R3, R5, R6). The parser is fed a window
 * of text at a time and keeps everything it needs between windows in a plain state that the cursor carries; each
 * character is looked at once, so a step costs the bytes it decodes. Every scalar is a unit addressed by its JSON
 * path; a GeoJSON feature is also a unit of its own, with its properties, its geometry type and its bounding box, its
 * coordinates kept as data and never made text. Nesting deeper than the limit refuses the file whole (R6). */
import { NESTING_MAX, malformed, overNesting } from "./limits.mjs";
import { WINDOW_BYTES } from "./window.mjs";

/* parser states */
const VALUE = 0, KEY = 1, COLON = 2, AFTER = 3, STRING = 4, BARE = 5;
const NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;
const IDENT = /^[A-Za-z_$][\w$]*$/;
const STRING_STOP = /["\\\u0000-\u001f]/g;
const ESCAPES = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
/* a string longer than one window is made units a window's worth at a time, so no unit and no cursor holds more */
const PIECE_CHARS = WINDOW_BYTES;

const keyPart = (k) => (IDENT.test(k) ? `.${k}` : `['${k.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}']`);

/** The JSON path of a frame stack, below `$` (or `$[record]` for NDJSON). */
export function pathOf(stack, upto = stack.length, record = null) {
  let p = record == null ? "$" : `$[${record}]`;
  for (let d = 0; d < upto; d++) {
    const f = stack[d];
    if (f.t === "o") { if (f.k != null) p += keyPart(f.k); } else if (f.i >= 0) p += `[${f.i}]`;
  }
  return p;
}

/** A new parser, or one resumed from `saved`. `mode` is `json`, `ndjson` or `geojson`. */
export function createJsonParser(mode, saved = null) {
  const s = saved ?? {
    mode, line: 1, st: VALUE, stack: [], buf: "", isKey: false, esc: null, tokLine: 1, part: 0,
    rec: 0, top: 0, nl: true, tokens: 0, features: 0,
  };
  let emit = null;

  const parent = () => s.stack[s.stack.length - 1];
  const scalarPath = () => pathOf(s.stack, s.stack.length, s.mode === "ndjson" ? s.rec : null);
  const lastKey = () => { const p = parent(); return p && p.t === "o" ? p.k : null; };

  /* the feature an index in the stack belongs to: geojson only */
  function geoScalar(type, value) {
    const top = s.stack.length - 1;
    const f = s.stack[top];
    if (!f || f.fi < 0) return true;
    const feat = s.stack[f.fi].feat;
    if (f.c) {
      if (type === "number" && f.t === "a" && f.i <= 1) {
        const n = Number(value);
        const b = feat.bbox ?? (feat.bbox = [n, n, n, n].map((x, k) => (k % 2 === f.i ? x : null)));
        if (f.i === 0) { b[0] = b[0] == null ? n : Math.min(b[0], n); b[2] = b[2] == null ? n : Math.max(b[2], n); }
        else { b[1] = b[1] == null ? n : Math.min(b[1], n); b[3] = b[3] == null ? n : Math.max(b[3], n); }
        feat.points += f.i === 0 ? 1 : 0;
      }
      return false;
    }
    if (top === f.fi && f.k === "type" && type === "string") feat.type = value;
    else if (top === f.fi + 1 && s.stack[f.fi].k === "geometry" && f.t === "o" && f.k === "type" && type === "string") feat.gtype = value;
    else if (top === f.fi + 1 && s.stack[f.fi].k === "properties" && f.t === "o" && f.k != null) feat.props[f.k] = type === "string" ? value : type === "null" ? null : value;
    return true;
  }

  function scalar(type, value, raw) {
    s.tokens++;
    if (s.mode === "geojson" && !geoScalar(type, raw ?? value)) return;
    if (!emit) return;
    const path = scalarPath();
    emit({ kind: "value", path, cite: path, key: lastKey(), type, text: type === "string" ? value : raw, line: s.tokLine,
      ...(s.part > 0 ? { part: s.part } : {}) });
  }

  function beginValue() {
    const p = parent();
    if (p && p.t === "a") p.i++;
  }

  function open(t) {
    beginValue();
    s.tokens++;
    if (s.stack.length >= NESTING_MAX) throw overNesting(s.line);
    const p = parent();
    const f = { t, k: null, i: -1, fi: p ? p.fi : -1, c: p ? p.c || (p.t === "o" && p.k === "coordinates") : false };
    if (s.mode === "geojson" && t === "o" && !f.c) {
      const gp = s.stack[s.stack.length - 2];
      const isFeature = !p || (p.t === "a" && gp && gp.t === "o" && gp.k === "features" && s.stack.length === 2);
      if (isFeature) {
        f.feat = { type: null, gtype: null, bbox: null, points: 0, props: {}, line: s.line, path: pathOf(s.stack, s.stack.length, null) };
        f.fi = s.stack.length;
      }
    }
    s.stack.push(f);
    s.st = t === "o" ? KEY : VALUE;
    f.first = true;
  }

  function close(t) {
    const f = s.stack.pop();
    if (!f || f.t !== t) throw malformed(s.line, "unbalanced_close");
    if (f.feat && (f.feat.type === "Feature" || f.feat.gtype) && f.feat.type !== "FeatureCollection") {
      s.features++;
      const props = f.feat.props;
      const text = Object.entries(props).filter(([, v]) => v != null && v !== "").map(([k, v]) => `${k}: ${v}`).join("\n");
      emit?.({ kind: "feature", path: f.feat.path, geometry_type: f.feat.gtype, bbox: f.feat.bbox, points: f.feat.points,
        properties: props, text, line: f.feat.line, cite: f.feat.path });
    }
    valueDone();
  }

  function valueDone() {
    if (s.stack.length === 0) { s.top++; s.st = AFTER; s.nl = false; return; }
    s.st = AFTER;
  }

  function finishBare() {
    const raw = s.buf;
    s.buf = "";
    if (raw === "true" || raw === "false") scalar("boolean", raw === "true", raw);
    else if (raw === "null") scalar("null", null, "null");
    else if (NUMBER.test(raw)) scalar("number", Number(raw), raw);
    else throw malformed(s.tokLine, "bad_value");
    valueDone();
  }

  function startValue(ch) {
    if (s.stack.length === 0) {
      if (s.top > 0 && s.mode !== "ndjson") throw malformed(s.line, "after_end");
      if (s.top > 0 && !s.nl) throw malformed(s.line, "same_line");
      if (s.top > 0) s.rec++;
    }
    s.tokLine = s.line;
    if (ch === "{") return open("o");
    if (ch === "[") return open("a");
    if (ch === '"') { beginValue(); s.st = STRING; s.isKey = false; s.buf = ""; s.part = 0; return; }
    if (ch === "-" || (ch >= "0" && ch <= "9") || ch === "t" || ch === "f" || ch === "n") { beginValue(); s.st = BARE; s.buf = ch; return; }
    throw malformed(s.line, "unexpected_character");
  }

  function feed(text, sink) {
    emit = sink;
    const n = text.length;
    let i = 0;
    while (i < n) {
      const st = s.st;
      if (st === STRING) {
        if (s.esc != null) {
          if (s.esc === "") {
            const ch = text[i++];
            if (ch === "u") { s.esc = "u"; continue; }
            const e = ESCAPES[ch];
            if (e == null) throw malformed(s.line, "bad_escape");
            s.buf += e; s.esc = null; continue;
          }
          while (i < n && s.esc.length < 5) {
            const ch = text[i++];
            if (!/[0-9a-fA-F]/.test(ch)) throw malformed(s.line, "bad_escape");
            s.esc += ch;
          }
          if (s.esc.length === 5) { s.buf += String.fromCharCode(parseInt(s.esc.slice(1), 16)); s.esc = null; }
          continue;
        }
        STRING_STOP.lastIndex = i;
        const m = STRING_STOP.exec(text);
        const at = m ? m.index : n;
        if (at > i) s.buf += text.slice(i, at);
        i = at;
        if (!m) {
          if (!s.isKey && s.buf.length >= PIECE_CHARS) { s.part++; scalar("string", s.buf); s.buf = ""; }
          break;
        }
        const ch = text[i++];
        if (ch === "\\") { s.esc = ""; continue; }
        if (ch !== '"') { if (ch === "\n") s.line++; throw malformed(s.line, "control_in_string"); }
        const value = s.buf;
        s.buf = "";
        if (s.isKey) {
          parent().k = value; s.isKey = false; s.st = COLON;
        } else {
          if (s.part > 0) s.part++;
          scalar("string", value);
          s.part = 0;
          valueDone();
        }
        continue;
      }
      const ch = text[i];
      if (st === BARE) {
        if ((ch >= "0" && ch <= "9") || (ch >= "a" && ch <= "z") || ch === "." || ch === "-" || ch === "+" || ch === "E") { s.buf += ch; i++; continue; }
        finishBare();
        continue;
      }
      i++;
      if (ch === " " || ch === "\t" || ch === "\r") continue;
      if (ch === "\n") { s.line++; if (s.stack.length === 0) s.nl = true; continue; }
      if (ch === "﻿" && s.tokens === 0) continue;
      if (st === VALUE) {
        const p = parent();
        if (ch === "]" && p && p.t === "a" && p.first) { close("a"); continue; }
        if (p) p.first = false;
        startValue(ch);
      } else if (st === KEY) {
        const p = parent();
        if (ch === "}" && p.first) { close("o"); continue; }
        p.first = false;
        if (ch !== '"') throw malformed(s.line, "expected_key");
        s.st = STRING; s.isKey = true; s.buf = ""; s.tokLine = s.line;
      } else if (st === COLON) {
        if (ch !== ":") throw malformed(s.line, "expected_colon");
        s.st = VALUE;
      } else {
        const p = parent();
        if (!p) { startValue(ch); continue; }
        if (ch === ",") { s.st = p.t === "o" ? KEY : VALUE; if (p.t === "o") p.k = null; continue; }
        if (ch === "}" && p.t === "o") { close("o"); continue; }
        if (ch === "]" && p.t === "a") { close("a"); continue; }
        throw malformed(s.line, "expected_comma");
      }
    }
  }

  function end(sink) {
    emit = sink;
    if (s.st === BARE) finishBare();
    if (s.st === STRING || s.stack.length) throw malformed(s.line, "ended_inside_value");
    if (s.top === 0) throw malformed(s.line, "no_value");
  }

  return {
    feed, end,
    save: () => s,
    get line() { return s.line; },
    get tokens() { return s.tokens; },
    facts: () => (s.mode === "geojson" ? { features: s.features } : s.mode === "ndjson" ? { records: s.top } : {}),
  };
}
