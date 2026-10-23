/* Bounded reading of a large text (doctypes R37): the types' `detect`, `parse` and `assess` read a text a line at a
 * time, or in windows of its flattened form, and never build a whole-text copy (a flatten, a `split`, a global `match`
 * over all of it). Every answer is the answer the whole-text reading gave.
 *
 * A WINDOW is a piece of `flatten(text)` (every white-space run one space): the text is cut into chunks of about
 * `chunk` characters, each cut moved to the end of a white-space run so the pieces joined are exactly the whole
 * flatten, and each piece is handed with `pad` flattened characters of what came before and of what comes after, so a
 * phrase that crosses a cut is seen whole. A match belongs to the window its first character is in (`from` to `to`),
 * and a scan resumes where the last match of the whole text would have ended, so a count, a first match and a
 * boolean are the whole-text ones. A pattern here never matches more than `pad` characters (the types' phrases are
 * tens to hundreds). Offsets named `abs` are offsets into the flattened text; `scanFlat*` give them, and a reader that
 * needs an offset into the RAW text (for `ctx.locate`) reads raw lines (`eachLine`, `lineTable`), as it always did. */
import { allMatches } from "../docprofile/doctypes/index.mjs";

export const WINDOW_CHARS = 1 << 18;
export const WINDOW_PAD = 4096;

const WS = /\s/;

/* The pieces of flatten(text), each cut at the end of a white-space run so that no run is split between two pieces. */
function* flatPieces(text, chunk) {
  const n = text.length;
  let at = 0;
  while (at < n) {
    let cut = Math.min(n, at + chunk);
    if (cut < n && WS.test(text[cut - 1])) while (cut < n && WS.test(text[cut])) cut++;
    yield text.slice(at, cut).replace(/\s+/g, " ");
    at = cut;
  }
}

/** The windows of flatten(text): `{buf, from, to, base, last}`; `buf` holds the piece between `from` and `to` with
 *  the flattened characters before and after it, and `base` is the offset of `buf[0]` in the whole flatten. */
export function* flatWindows(text, { chunk = WINDOW_CHARS, pad = WINDOW_PAD } = {}) {
  const pieces = flatPieces(String(text || ""), chunk);
  const ahead = [];
  let aheadLen = 0;
  const pull = () => { const r = pieces.next(); if (r.done) return false; ahead.push(r.value); aheadLen += r.value.length; return true; };
  let tail = "", pos = 0;
  if (!pull()) return;
  while (ahead.length) {
    const cur = ahead.shift();
    aheadLen -= cur.length;
    while (aheadLen < pad && pull());
    const last = ahead.length === 0;
    let head = "";
    for (let i = 0; i < ahead.length && head.length < pad; i++) head += ahead[i].slice(0, pad - head.length);
    yield { buf: tail + cur + head, from: tail.length, to: tail.length + cur.length, base: pos - tail.length, last };
    tail = cur.length >= pad ? cur.slice(-pad) : (tail + cur).slice(-pad);
    pos += cur.length;
  }
}

const GLOBAL = new WeakMap();
/** A private global copy of a pattern, so a scan never touches the lastIndex of one a caller holds. */
function globalOf(re) {
  let g = GLOBAL.get(re);
  if (!g) { g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g"); GLOBAL.set(re, g); }
  return g;
}

/** Scans flatten(text) for several patterns in one pass. `specs` is `[{re, on(m, abs, w)}]`; `on` is called for each
 *  match of `re`, in order, as a scan of the whole flatten would find them (`m.index` is relative to `w.buf`), and
 *  returns true to stop that pattern. `fromAbs` skips matches starting before that flat offset. */
export function scanFlatMany(text, specs, { fromAbs = 0, ...opts } = {}) {
  const st = specs.map((s) => ({ g: globalOf(s.re), on: s.on, carry: fromAbs, done: false }));
  for (const w of flatWindows(text, opts)) {
    let live = false;
    for (const s of st) {
      if (s.done) continue;
      live = true;
      s.g.lastIndex = Math.max(w.from, s.carry - w.base);
      let m;
      while ((m = s.g.exec(w.buf)) !== null) {
        if (m.index >= w.to) break;
        const abs = w.base + m.index;
        s.carry = abs + m[0].length;
        if (m[0].length === 0) s.g.lastIndex++;
        if (s.on(m, abs, w) === true) { s.done = true; break; }
      }
    }
    if (!live) break;
  }
}

/** Does flatten(text) hold a match of `re`? */
export function flatHas(text, re, opts) {
  let found = false;
  scanFlatMany(text, [{ re, on: () => (found = true) }], opts);
  return found;
}

/** How many matches of `re` flatten(text) holds (as a global `match` over it would count), counting no further than
 *  `upTo` when that is given. */
export function flatCount(text, re, upTo = Infinity, opts) {
  let n = 0;
  scanFlatMany(text, [{ re, on: () => ++n >= upTo }], opts);
  return n;
}

/** The first match of `re` in flatten(text): `{text, groups, abs}`, or null. */
export function flatFirst(text, re, opts) {
  let hit = null;
  scanFlatMany(text, [{ re, on: (m, abs) => { hit = { m: [...m], groups: m.groups || null, abs }; return true; } }], opts);
  return hit;
}

/** The first `n` characters of flatten(text) (fewer when the text is shorter). */
export function flatPrefix(text, n) {
  let out = "";
  for (const piece of flatPieces(String(text || ""), Math.max(n, 1024))) {
    out += piece;
    if (out.length >= n) break;
  }
  return out.slice(0, n);
}

/** The matches `allMatches` would keep over all of flatten(text) for these tagged global patterns, in order, one at a
 *  time: `each(hit, abs, w)` with `hit = {m, tag}` (`m.index` relative to `w.buf`; `w.buf` holds `pad` characters
 *  before and after). Returns true from `each` to stop. */
export function mergedHits(text, tagged, each, opts) {
  let carry = 0;
  for (const w of flatWindows(text, opts)) {
    for (const hit of allMatches(tagged, w.buf)) {
      const abs = w.base + hit.m.index;
      if (abs < carry || hit.m.index < w.from) continue;
      if (hit.m.index >= w.to) break;
      carry = abs + hit.m[0].length;
      if (each(hit, abs, w) === true) return true;
    }
  }
  return false;
}

/* ------------------------------------------------------------------------------------------------ the lines */

/** Calls `fn(line, offset, index)` for each line of `text` as `text.split(/\r?\n/)` gives them (a CR before the LF
 *  is not part of the line), without building the list; `offset` is where the line starts in `text`. A `true` from
 *  `fn` stops the walk and is returned. */
export function eachLine(text, fn, from = 0) {
  text = String(text || "");
  let start = from, index = 0;
  for (;;) {
    const nl = text.indexOf("\n", start);
    const end = nl < 0 ? text.length : (nl > start && text.charCodeAt(nl - 1) === 13 ? nl - 1 : nl);
    if (fn(text.slice(start, end), start, index++) === true) return true;
    if (nl < 0) return false;
    start = nl + 1;
  }
}

/** How many lines of `text`, trimmed, match `re` (what `selfNaming` counts). */
export function countLines(text, re) {
  let n = 0;
  eachLine(text, (l) => { if (re.test(l.trim())) n++; });
  return n;
}

/** The first `n` non-blank lines of `text`, trimmed. */
export function firstLines(text, n) {
  const out = [];
  eachLine(text, (l) => { const t = l.trim(); if (t) out.push(t); return out.length >= n; });
  return out;
}

/** The lines of `text` as `text.split(/\r?\n/)` gives them, held as offsets only: `length`, `start(i)`, and `get(i)`,
 *  the line trimmed (a line is cut from the text when it is asked for). */
export function lineTable(text) {
  text = String(text || "");
  let starts = new Uint32Array(1024), ends = new Uint32Array(1024), n = 0;
  eachLine(text, (l, at) => {
    if (n === starts.length) {
      const s = new Uint32Array(n * 2); s.set(starts); starts = s;
      const e = new Uint32Array(n * 2); e.set(ends); ends = e;
    }
    starts[n] = at; ends[n] = at + l.length; n++;
  });
  return {
    length: n,
    start: (i) => starts[i],
    get: (i) => (i >= 0 && i < n ? text.slice(starts[i], ends[i]).trim() : undefined),
    raw: (i) => (i >= 0 && i < n ? text.slice(starts[i], ends[i]) : undefined),
  };
}

/** The lines of `text` as `text.split("\n")` gives them (a CR stays in its line, which `lineTable` drops), held as
 *  their start offsets only (R38): `length`, `start(i)`, `end(i)`, `at(i)` (`{start, end, text}`, the line cut from the
 *  text when it is asked for) and `lineOf(offset)`, the index of the line whose start is at or before `offset` and whose
 *  end is at or after it (-1 past the text). */
export function lineIndex(text) {
  text = String(text || "");
  let starts = new Uint32Array(1024), n = 0;
  for (let at = 0; ;) {
    if (n === starts.length) { const s = new Uint32Array(n * 2); s.set(starts); starts = s; }
    starts[n++] = at;
    const nl = text.indexOf("\n", at);
    if (nl < 0) break;
    at = nl + 1;
  }
  const end = (i) => (i + 1 < n ? starts[i + 1] - 1 : text.length);
  return {
    length: n,
    start: (i) => starts[i],
    end,
    at: (i) => ({ start: starts[i], end: end(i), text: text.slice(starts[i], end(i)) }),
    lineOf(offset) {
      if (offset < 0 || offset > text.length) return -1;
      let lo = 0, hi = n - 1;
      while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= offset) lo = mid; else hi = mid - 1; }
      return lo;
    },
  };
}
