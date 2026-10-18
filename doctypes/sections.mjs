/* regulation's structure readings (A LAW 1a and 2; ladders §6.4 L2–L3): an instrument's or
 * a code's SECTIONS (paths, headings and extents, the `portion` extents `standards` keys on),
 * and the passages in them that DEFINE a term or EXCEPT something (R9–R14, R19).
 *
 * WHAT IS LOCAL AND WHAT IS NOT (R11, R20). A code's section numbers, the characters that
 * divide their parts, and the order of its subsection markers are the jurisdiction's: they
 * come from the view (`vocabulary.codes[].sections`, jurisdictions R6). An instrument's own
 * `SECTION n.` headings, the definitional voice ("'X' means") and the exceptive voice
 * ("notwithstanding", "shall not apply") are the language's, the same wherever an English-
 * speaking body legislates, so they stay here as the operative voice does in regulation.mjs.
 *
 * MEASURED ON THE CODIFIER'S OWN DOCUMENTS (`measures-T33/time-law.md` §4–§5; the captures in
 * `test/fixtures/codifier.json`): a code section is served as one document whose first line
 * is `<number> - <title>.`, its subsections as marker paragraphs (`A.`, `1.`, `(a)`), its
 * history note last; a charter article as one document whose sections each open a paragraph
 * `Section <number>. <title>.`. Today's reader found 0 of 50 boundaries; this one is tested on
 * every one of them (R17).
 *
 * THE FAILURE ASYMMETRY (R23, R24). A text no heading divides gives NO sections and says why,
 * never one section standing for the whole; a definitional or exceptive passage no section
 * holds is listed with `section: null` and why, never dropped (R19). Nothing here records a
 * law relation: a definition or an exception is a reading, and a member records what it
 * means, in `standards` (R15). */
import { vocabulary } from "../docprofile/doctypes/index.mjs";

/* ---------------------------------------------------------------- the view's forms */

const escapeClass = (s) => String(s).replace(/[\\\]^-]/g, "\\$&");
const piece = (re) => String(re).replace(/^\^/, "").replace(/(?<!\\)\$$/, "");
const compile = (src, flags) => { try { return new RegExp(src, flags); } catch { return null; } };
const ownFlags = (p) => String((p && p.flags) || "").replace(/[^iu]/g, "");

/** The subsection marker kinds jurisdictions R6 names, each as the marker opens a line:
 *  its value, how values follow one another, and the first value of a level. */
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii", "xiii", "xiv", "xv", "xvi",
               "xvii", "xviii", "xix", "xx"];
const nextLetter = (v) => (v.length === 1 && v !== "z" && v !== "Z" ? String.fromCharCode(v.charCodeAt(0) + 1) : null);
const MARKERS = {
  /* A letter's case is the level's own: the first value read there (`A.` or `a.`) sets it. */
  letter:        { re: /^([A-Za-z])\.(?=\s|$)/,       first: ["A", "a"], next: nextLetter },
  numeral:       { re: /^(\d{1,3})\.(?=\s|$)/,        first: ["1"], next: (v) => String(Number(v) + 1) },
  paren_letter:  { re: /^\(([A-Za-z])\)(?=\s|$)/,     first: ["A", "a"], next: nextLetter },
  paren_numeral: { re: /^\((\d{1,3})\)(?=\s|$)/,      first: ["1"], next: (v) => String(Number(v) + 1) },
  roman:         { re: /^\(?([ivx]{1,5})[.)](?=\s|$)/, first: ["i"],
                   next: (v) => { const i = ROMAN.indexOf(v); return i >= 0 && i + 1 < ROMAN.length ? ROMAN[i + 1] : null; } },
};

/** The codes the view names with a section-number form (R9, R11): each with its heading
 *  recogniser, the separators its number divides on, its subsection marker order, and a
 *  recogniser for a citation of one of its sections in prose (R14's `cites`). */
export function codeForms(ctx) {
  const out = [];
  for (const c of vocabulary(ctx, "codes")) {
    const s = c && c.sections;
    if (!s || typeof s !== "object" || !s.number || typeof s.number.re !== "string" || !s.number.re) continue;
    if (typeof c.key !== "string" || !c.key) continue;
    const num = piece(s.number.re);
    const flags = ownFlags(s.number);
    /* A heading: the number opening a line, optionally after the words any code is cited by,
       then a title. The title is required: a bare number on a line is not a heading. */
    const heading = compile(`^[ \\t]*(?:(?:Section|SECTION|Sec\\.|§{1,2})[ \\t]*)?(?<num>${num})(?![0-9A-Za-z])\\.?[ \\t]*(?:[-–—:][ \\t]*)?(?<rest>\\S.*)$`, flags);
    const cite = compile(`(?<![0-9A-Za-z.])(?:${num})(?![0-9A-Za-z])`, flags + "g");
    if (!heading || !cite) continue;
    const seps = typeof s.separators === "string" && s.separators ? s.separators : "";
    const markers = (Array.isArray(s.markers) ? s.markers : []).filter((m) => Object.hasOwn(MARKERS, m));
    out.push({ key: c.key, label: typeof c.label === "string" && c.label ? c.label : c.key, heading, cite,
               split: seps ? new RegExp(`[${escapeClass(seps)}]+`) : null, markers });
  }
  return out;
}

/* ---------------------------------------------------------------------- text lines */

/** Every line of the text with its offset, so an extent is an offset into the text read. */
function linesOf(raw) {
  const out = [];
  let at = 0;
  for (const line of raw.split("\n")) { out.push({ start: at, end: at + line.length, text: line }); at += line.length + 1; }
  return out;
}

/** A title as printed after a heading's number: up to its own full stop, or the line's end.
 *  `stopped` requires the stop: a code's heading ends its title with one (measured: every
 *  codifier heading, `2.20.030 - Definitions.`, `Section 200. Composition of the Council.`),
 *  where a street address or a list line opening with a number does not. */
function titleOf(rest, stopped = false) {
  const t = String(rest || "").trim();
  const stop = t.search(/\.(?=\s|$)/);
  if (stopped && stop < 0) return null;
  const title = (stop >= 0 ? t.slice(0, stop) : t).trim();
  return /^[A-Z"“'‘(]/.test(title) && /[A-Za-z]{2}/.test(title) ? title.slice(0, 300) : null;
}

/* -------------------------------------------------------------------- the sections */

/** Two section paths in a code's order: part by part, numerically where both parts are
 *  numbers (`2.20.090` before `2.20.100`), else as text. */
function comparePaths(a, b) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] === undefined) return -1;
    if (b[i] === undefined) return 1;
    const x = /^\d+/.exec(a[i]), y = /^\d+/.exec(b[i]);
    if (x && y && Number(x[0]) !== Number(y[0])) return Number(x[0]) - Number(y[0]);
    if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

/** A code's section headings in the text read, in document order. */
function codeHeadings(lines, forms) {
  const out = [];
  for (const l of lines) {
    /* One document is of one code: after the first heading, only that code's headings
       divide it (a paragraph opening "1946 Termination of Tenancy." in a code section is
       another code's citation, not a section of a second code). */
    for (const f of out.length ? [out[0].form] : forms) {
      const m = f.heading.exec(l.text);
      if (!m) continue;
      const title = titleOf(m.groups.rest, true);
      if (!title) continue;
      const number = m.groups.num;
      /* A code is printed in its own order: a heading numbered before the one above it is
         a citation or a list line, not the next section. */
      const path = f.split ? number.split(f.split).filter(Boolean) : [number];
      if (out.length && comparePaths(path, out[out.length - 1].path) <= 0) break;
      out.push({ start: l.start + (l.text.length - l.text.trimStart().length), line: l, number, heading: title, form: f, path });
      break;
    }
  }
  return out;
}

/** An instrument's own `SECTION n.` headings: place-free (R11), and read only in sequence
 *  from 1, so a sentence that happens to open with "Section 4." of another law is not one. */
function instrumentHeadings(lines) {
  const out = [];
  let expect = 1;
  for (const l of lines) {
    const m = /^[ \t]*(?:SECTION|Section)[ \t]+(\d{1,3})[A-Z]?[ \t]*\.[ \t]*(.*)$/.exec(l.text);
    if (!m || Number(m[1]) !== expect) continue;
    expect++;
    out.push({ start: l.start + (l.text.length - l.text.trimStart().length), line: l, number: m[1],
               heading: titleOf(m[2]), form: null, path: [m[1]] });
  }
  return out;
}

/** The subsections of one code section, from its marker lines, in the order the code's
 *  markers nest (R10, R11). A marker is read only where it continues the sequence it belongs
 *  to (B after A, 2 after 1) or opens the next level at its first value, so a line that
 *  merely begins with "3." in prose is not a subsection. */
function subsections(lines, sec, end, form, locate) {
  const out = [];
  if (!form || !form.markers.length) return out;
  const open = [];          // [{level, value, entry}]
  const close = (depth, at) => { while (open.length > depth) open.pop().entry.end = at; };
  for (const l of lines) {
    if (l.start <= sec.line.start || l.start >= end) continue;
    const t = l.text.trimStart();
    const at = l.start + (l.text.length - t.length);
    let placed = null;
    /* A sibling at this level or an ancestor's, deepest first; then a child of the deepest. */
    for (let d = open.length - 1; d >= 0 && !placed; d--) {
      const k = MARKERS[form.markers[open[d].level]];
      const m = k.re.exec(t);
      if (m && m[1] === k.next(open[d].value)) placed = { depth: d, level: open[d].level, value: m[1] };
    }
    /* Else a child of the deepest open level, at its first value: the next level in the
       code's order, or a deeper one where the code skips a level (a first `i.` with no
       letter above it), the nearest that fits. */
    /* With nothing open, only the code's first two levels open (a charter section may
       begin at `(1)`): a first `i.` at the top of a code section is a list inside its prose
       (a definition's items), not a subsection. */
    const deepest = open.length ? form.markers.length : Math.min(2, form.markers.length);
    for (let level = open.length ? open[open.length - 1].level + 1 : 0; !placed && level < deepest; level++) {
      const k = MARKERS[form.markers[level]];
      const m = k.re.exec(t);
      if (m && k.first.includes(m[1])) placed = { depth: open.length, level, value: m[1] };
    }
    /* A marker standing alone on its line (the codifier's marker paragraph) that continues
       no sequence still opens a subsection where its kind belongs: under the nearest open
       subsection of a shallower level. Measured: a code section printing `D.`, then `a.`
       to `f.`, then `2.` with no `1.` (its first item unnumbered); the `2.` is D's. */
    if (!placed && /^\S+$/.test(t.trim())) {
      for (let level = 0; !placed && level < form.markers.length; level++) {
        const m = MARKERS[form.markers[level]].re.exec(t);
        if (!m) continue;
        let depth = 0;
        while (depth < open.length && open[depth].level < level) depth++;
        if (depth > 0) placed = { depth, level, value: m[1] };
      }
    }
    if (!placed) continue;
    close(placed.depth, at);
    const parent = open.length ? open[open.length - 1].entry : sec.entry;
    const entry = { path: [...parent.path, placed.value], number: `${parent.number}(${placed.value})`, heading: null,
                    start: at, end, source: locate(at) || null };
    out.push(entry);
    open.push({ level: placed.level, value: placed.value, entry });
  }
  close(0, end);
  return out;
}

/** The code headings of a text (R9): how many there are, whether the first non-blank line
 *  is one, and the label of the code the first names. */
export function codeHeadingsIn(raw, ctx) {
  const lines = linesOf(String(raw || ""));
  const heads = codeHeadings(lines, codeForms(ctx));
  const first = lines.find((l) => l.text.trim().length);
  return { count: heads.length, first: !!(first && heads.length && heads[0].line === first),
           label: heads.length ? heads[0].form.label : null };
}

/** The sections of the text read, with each extent (R10–R12), or none and why (R11, R24). */
export function readSections(raw, form, ctx, locate) {
  const lines = linesOf(raw);
  const forms = codeForms(ctx);
  const heads = form === "code" ? codeHeadings(lines, forms) : form === "instrument" ? instrumentHeadings(lines) : [];
  if (!heads.length) {
    const why = form === "code"
      ? (forms.length ? "no line of this text opens with a section number of a code the active jurisdiction profiles name, "
                        + "followed by a title, so it is not divided into sections"
                      : "no active jurisdiction profile gives a section-number form for any code, so no code section is read")
      : form === "instrument"
        ? "no `SECTION 1.` heading opens a line of this instrument, so its text is not divided into sections"
        : "this text was read as neither an instrument nor a code section, so it is not divided into sections"
          + (forms.length ? "" : "; and no active jurisdiction profile gives a section-number form for any code");
    return { sections: [], sections_why: why };
  }
  const sections = [];
  heads.forEach((h, i) => {
    const end = i + 1 < heads.length ? heads[i + 1].start : raw.length;
    h.entry = { path: h.path, number: h.number, heading: h.heading, start: h.start, end, source: locate(h.start) || null };
    sections.push(h.entry);
    for (const s of subsections(lines, h, end, h.form, locate)) sections.push(s);
  });
  return { sections, sections_why: null };
}

/** The deepest section whose extent holds `offset`, or null. */
function holder(sections, offset) {
  let best = null;
  for (const s of sections)
    if (offset >= s.start && offset < s.end && (!best || s.path.length > best.path.length)) best = s;
  return best;
}
const unplacedWhy = (sections) => (sections.length
  ? "no section read from this text holds this passage (it stands before the first heading)"
  : "this text was not divided into sections, so no section can be named for this passage");

/* ------------------------------------------------------------------ the definitions */

/* The definitional voice: a quoted term followed by the verbs that define it, and the
   "as used in this <part>" opener. English legal voice, place-free (R13; Suggestions). */
const Q_OPEN = "[\"“‘']", Q_CLOSE = "[\"”’']";
const TERM = `${Q_OPEN}[^"“”‘’'\\n]{1,120}?${Q_CLOSE}`;
/* One term, or several naming one thing (`"Board" and "Residential Rent Adjustment Board"
   means`): each is a term the passage defines. */
const DEFINES = new RegExp(`(?<chain>(?:${TERM}[ \\t]*(?:,[ \\t]*)?(?:and|or)?[ \\t]+)*)${TERM}[ \\t]*,?[ \\t]*(?:as[ \\t]+used[ \\t]+in[ \\t]+this[ \\t]+\\w+[ \\t]*,[ \\t]*)?(?:shall[ \\t]+mean|shall[ \\t]+include|means|includes|is[ \\t]+defined[ \\t]+as|refers[ \\t]+to)\\b`, "g");
const AS_USED = new RegExp(`\\bas[ \\t]+used[ \\t]+in[ \\t]+this[ \\t]+(?:chapter|article|section|title|code|ordinance|resolution|part|division|subsection)[ \\t]*,?[ \\t]*(?:the[ \\t]+(?:term|word|phrase|words)[ \\t]+)?(?<chain>)${TERM}`, "gi");
const TERMS = new RegExp(`${Q_OPEN}([^"“”‘’'\\n]{1,120}?)${Q_CLOSE}`, "g");
/* A line that is only a list or subsection marker (`1.`, `(a)`, `ii.`). */
const MARKER_LINE = /^\s*\(?[A-Za-z0-9]{1,4}[.)]\s*$/;

/** Where a definitional passage ends: its paragraph's end, or, for a paragraph ending in a
 *  colon, past the list it introduces (marker lines and the paragraph after each). */
function passageEnd(raw, from) {
  const lines = linesOf(raw);
  let i = lines.findIndex((l) => from >= l.start && from <= l.end);
  if (i < 0) return raw.length;
  let end = lines[i].end;
  if (!/:\s*$/.test(lines[i].text)) return end;
  let afterMarker = false;
  for (i++; i < lines.length; i++) {
    const l = lines[i];
    if (MARKER_LINE.test(l.text)) { afterMarker = true; end = l.end; continue; }
    if (!afterMarker) break;
    afterMarker = false;
    end = l.end;
  }
  return end;
}

/** Every passage defining a term (R13), in reading order: `{term, start, end, source,
 *  section}`, `end` the end of its paragraph or the start of the next definition in it. */
export function readDefinitions(raw, sections, locate) {
  const hits = [];
  for (const re of [DEFINES, AS_USED]) {
    re.lastIndex = 0;
    for (const m of raw.matchAll(re)) {
      TERMS.lastIndex = 0;
      const tail = AS_USED === re ? m[0].slice(m[0].search(new RegExp(Q_OPEN + "[^" + "\"“”‘’'" + "]*" + Q_CLOSE + "$"))) : m[0];
      const base = m.index + m[0].length - tail.length;
      for (const t of tail.matchAll(TERMS)) hits.push({ start: base + t.index, at: m.index, term: t[1].trim() });
    }
  }
  hits.sort((a, b) => a.start - b.start);
  const kept = [];
  for (const h of hits) if (!kept.some((k) => k.start === h.start)) kept.push(h);
  /* A passage's terms share its extent: from its first term to its end. */
  const passages = [];
  for (const h of kept) {
    const p = passages.length ? passages[passages.length - 1] : null;
    if (p && p.at === h.at) p.terms.push(h); else passages.push({ at: h.at, start: h.start, terms: [h] });
  }
  const out = [];
  passages.forEach((p, i) => {
    let end = passageEnd(raw, p.start);
    if (i + 1 < passages.length && passages[i + 1].start < end && passages[i + 1].start > p.start) end = passages[i + 1].start;
    const s = holder(sections, p.start);
    for (const t of p.terms) {
      const d = { term: t.term, start: t.start, end, source: locate(t.start) || null, section: s ? s.path : null };
      if (!s) d.why = unplacedWhy(sections);
      out.push(d);
    }
  });
  return out;
}

/* ------------------------------------------------------------------- the exceptions */

/* The exceptive voice (R14): English legal voice, place-free. */
const EXCEPTS = /\b(?:except[ \t]+as[ \t]+(?:otherwise[ \t]+)?(?:provided|set[ \t]+forth|specified|permitted|required|authorized|stated)\b|notwithstanding\b|(?:does|do|shall)[ \t]+not[ \t]+apply\b)/gi;
/* Where a sentence ends: a stop before a capital or the line's end, but not after the
   abbreviations legal text cites by. */
const ABBREV = /(?:\b(?:Sec|Secs|No|Nos|Gov|Govt|Ord|Res|Stat|Stats|Cal|Civ|Pen|Proc|Ch|Art|Subd|seq|al|etc|Inc|St|Code|U\.S|i\.e|e\.g|v|vs|Mr|Ms|Dr)|\b[A-Z])$/;

function sentenceOf(raw, at, endAt) {
  const lineStart = raw.lastIndexOf("\n", at - 1) + 1;
  const lineEndRaw = raw.indexOf("\n", endAt);
  const lineEnd = lineEndRaw < 0 ? raw.length : lineEndRaw;
  let start = lineStart;
  const before = raw.slice(lineStart, endAt);
  const stopRe = /[.;](?=\s+["“(]?[A-Z])/g;
  for (const m of before.matchAll(stopRe))
    if (lineStart + m.index < at && !ABBREV.test(before.slice(0, m.index))) start = lineStart + m.index + 1;
  while (start < at && /\s/.test(raw[start])) start++;
  let end = lineEnd;
  const after = raw.slice(endAt, lineEnd);
  for (const m of after.matchAll(/[.;](?=\s|$)/g)) {
    if (ABBREV.test(raw.slice(lineStart, endAt + m.index))) continue;
    end = endAt + m.index + 1;
    break;
  }
  return { start, end };
}

/** Every passage that excepts (R14), one per sentence, in reading order: `{start, end,
 *  source, section, cites}`, `cites` the section numbers it names in the view's forms, and
 *  for an instrument its own `Section n` references to its own sections. */
export function readExceptions(raw, sections, form, ctx, locate) {
  const forms = codeForms(ctx);
  const own = new Set(form === "instrument" ? sections.filter((s) => s.path.length === 1).map((s) => s.number) : []);
  const out = [];
  EXCEPTS.lastIndex = 0;
  for (const m of raw.matchAll(EXCEPTS)) {
    const { start, end } = sentenceOf(raw, m.index, m.index + m[0].length);
    if (out.some((x) => x.start === start)) continue;
    const text = raw.slice(start, end);
    const cites = [];
    const hits = [];
    for (const f of forms) { f.cite.lastIndex = 0; for (const c of text.matchAll(f.cite)) hits.push({ at: c.index, n: c[0] }); }
    if (own.size) for (const c of text.matchAll(/\bSections?[ \t]+(\d{1,3})\b/g)) if (own.has(c[1])) hits.push({ at: c.index, n: c[1] });
    hits.sort((a, b) => a.at - b.at);
    for (const h of hits) if (!cites.includes(h.n)) cites.push(h.n);
    const s = holder(sections, start);
    const e = { start, end, source: locate(start) || null, section: s ? s.path : null, cites };
    if (!s) e.why = unplacedWhy(sections);
    out.push(e);
  }
  return out;
}

/* -------------------------------------------------------------------- the digest */

/* SHA-256, pure and synchronous, so `assess` can tell whether a section's text moved
   between two readings (R16) without either reading carrying the text twice. */
const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
  0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08,
  0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
export function sha256Hex(str) {
  const bytes = new TextEncoder().encode(String(str));
  const len = bytes.length;
  const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
  padded.set(bytes);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 8, Math.floor(len / 0x20000000));
  dv.setUint32(padded.length - 4, (len << 3) >>> 0);
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const W = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < padded.length; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3);
      const s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }
  return [...H].map((x) => x.toString(16).padStart(8, "0")).join("");
}
