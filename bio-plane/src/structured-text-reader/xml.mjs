/* structured-text-reader: XML, SVG and KML, parsed as a stream (R2, R3, R4, R5, R6). Fed a window of text at a time,
 * the parser keeps its state plain for the cursor and looks at each character once. Text is a unit addressed by its
 * element path (`/root/child[2]/leaf[1]`); a KML placemark is one unit with its name, description, extended data and
 * coordinates (kept as data); an SVG gives only its text, titles and descriptions. Nothing a file names is fetched or
 * run: no external entity, no DTD entity beyond XML's five and character references, no script, no linked image. */
import { NESTING_MAX, XML_TAG_MAX, malformed, overNesting } from "./limits.mjs";
import { WINDOW_BYTES } from "./window.mjs";

const TEXT = 0, OPEN = 1, TAG = 2, COMMENT = 3, CDATA = 4, PI = 5, DOCTYPE = 6;
const NAME = /^[\p{L}_:][\p{L}\p{N}_.:\-·]*$/u;
const ATTR = /([^\s=\/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/gy;
const PIECE_CHARS = WINDOW_BYTES;
/* SVG: the elements whose text is read, and those whose content is never read */
const SVG_TEXT = new Set(["text", "tspan", "textPath", "title", "desc"]);
const SVG_SKIP = new Set(["script", "style"]);

const scalar = (code) => code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff);
/** XML's five entities and character references; any other entity is left as written, never expanded. */
export function decodeEntities(s) {
  if (s.indexOf("&") < 0) return s;
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot|apos);/g, (m, e) => {
    if (e[0] !== "#") return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[e];
    const code = e[1] === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
    return scalar(code) ? String.fromCodePoint(code) : m;
  });
}

const local = (name) => { const at = name.indexOf(":"); return at < 0 ? name : name.slice(at + 1); };
const stripTags = (s) => s.replace(/<[^>]*>/g, " ").replace(/[ \t]+/g, " ").trim();

/** The element path of a frame stack: the root by name, every element below with its place among its like siblings. */
export function elementPath(stack, upto = stack.length) {
  let p = "";
  for (let d = 0; d < upto; d++) p += d === 0 ? `/${stack[d].n}` : `/${stack[d].n}[${stack[d].i}]`;
  return p;
}

/** A new parser, or one resumed from `saved`. `mode` is `xml`, `svg` or `kml`. */
export function createXmlParser(mode, saved = null) {
  const s = saved ?? {
    mode, line: 1, st: TEXT, buf: "", text: "", textLine: 1, part: 0, stack: [], rootSeen: false, rootDone: false,
    q: null, dt: 0, tail: "", tagLine: 1, pm: null, facts: mode === "svg" ? { scripts: 0, external_refs: 0 } : mode === "kml" ? { placemarks: 0 } : {},
    skip: 0, keep: 0,
  };
  let emit = null;

  const path = () => elementPath(s.stack);

  function flushText(final) {
    const raw = s.text;
    if (!raw) return;
    if (!final && raw.length < PIECE_CHARS) return;
    s.text = "";
    if (!s.stack.length) {
      if (/\S/.test(raw)) throw malformed(s.textLine, s.rootDone ? "after_root" : "before_root");
      return;
    }
    const value = decodeEntities(raw).trim();
    const piece = !final || s.part > 0;
    if (!final) s.part++;
    else if (s.part > 0) s.part++;
    if (value) onText(value, piece ? s.part : 0);
    if (final) s.part = 0;
    s.textLine = s.line;
  }

  function onText(value, part) {
    const top = s.stack[s.stack.length - 1];
    if (s.mode === "svg") {
      if (s.skip > 0 || s.keep === 0) return;
    }
    if (s.mode === "kml" && s.pm) {
      const pm = s.pm, name = local(top.n), up = s.stack[s.stack.length - 2];
      const upName = up ? local(up.n) : null;
      if (name === "name" && upName === "Placemark") pm.name = (pm.name ?? "") + value;
      else if (name === "description" && upName === "Placemark") pm.description = (pm.description ?? "") + value;
      else if (name === "value" && upName === "Data") { const k = up.a ?? `data${Object.keys(pm.data).length + 1}`; pm.data[k] = (pm.data[k] ?? "") + value; }
      else if (name === "SimpleData") { const k = top.a ?? `data${Object.keys(pm.data).length + 1}`; pm.data[k] = (pm.data[k] ?? "") + value; }
      else if (name === "coordinates") {
        pm.geometry ??= upName;
        for (const tuple of value.split(/\s+/)) {
          if (!tuple) continue;
          const nums = tuple.split(",").map(Number);
          if (nums.length < 2 || nums.some((x) => !Number.isFinite(x))) continue;
          pm.coordinates.push(nums);
          const b = pm.bbox ?? (pm.bbox = [nums[0], nums[1], nums[0], nums[1]]);
          b[0] = Math.min(b[0], nums[0]); b[1] = Math.min(b[1], nums[1]); b[2] = Math.max(b[2], nums[0]); b[3] = Math.max(b[3], nums[1]);
        }
      }
      return;
    }
    const at = path();
    emit?.({ kind: "text", path: at, cite: at, element: top.n, text: value, line: s.textLine, ...(part ? { part } : {}) });
  }

  function openTag(body) {
    let selfClose = false;
    if (body.endsWith("/")) { selfClose = true; body = body.slice(0, -1); }
    const m = /^([^\s\/>]+)/.exec(body);
    if (!m || !NAME.test(m[1])) throw malformed(s.tagLine, "bad_element_name");
    const name = m[1];
    const attrs = [];
    let at = m[0].length;
    for (;;) {
      while (at < body.length && /\s/.test(body[at])) at++;
      if (at >= body.length) break;
      ATTR.lastIndex = at;
      const a = ATTR.exec(body);
      if (!a) throw malformed(s.tagLine, "bad_attribute");
      attrs.push([a[1], decodeEntities(a[2] ?? a[3] ?? "")]);
      at = ATTR.lastIndex;
    }
    if (s.rootDone) throw malformed(s.tagLine, "second_root");
    if (s.stack.length >= NESTING_MAX) throw overNesting(s.tagLine);
    const up = s.stack[s.stack.length - 1];
    let i = 1;
    if (up) { const k = `~${name}`; up.c[k] = (up.c[k] ?? 0) + 1; i = up.c[k]; }
    const frame = { n: name, i, c: {} };
    s.stack.push(frame);
    s.rootSeen = true;
    onOpen(frame, attrs);
    if (selfClose) closeTag(name);
  }

  function onOpen(frame, attrs) {
    const name = local(frame.n);
    if (s.mode === "xml") {
      for (const [k, v] of attrs) {
        if (k === "xmlns" || k.startsWith("xmlns:")) continue;
        const at = `${path()}/@${k}`;
        emit?.({ kind: "attribute", path: at, cite: at, element: frame.n, text: v, line: s.tagLine });
      }
    } else if (s.mode === "svg") {
      for (const [k, v] of attrs) {
        if ((local(k) === "href" || k === "src") && v && !v.startsWith("#")) s.facts.external_refs++;
      }
      if (name === "script") s.facts.scripts++;
      if (SVG_SKIP.has(name)) { s.skip++; frame.skip = true; }
      if (SVG_TEXT.has(name)) { s.keep++; frame.keep = true; }
    } else if (s.mode === "kml") {
      if (name === "Placemark" && !s.pm) {
        s.pm = { path: path(), line: s.tagLine, name: null, description: null, data: {}, coordinates: [], geometry: null, bbox: null, depth: s.stack.length };
      } else if (name === "Data" || name === "SimpleData") {
        const n = attrs.find(([k]) => k === "name");
        if (n) frame.a = n[1];
      }
    }
  }

  function closeTag(name) {
    const top = s.stack[s.stack.length - 1];
    if (!top) throw malformed(s.tagLine, "close_without_open");
    if (top.n !== name) throw malformed(s.tagLine, "mismatched_close");
    if (s.mode === "svg") { if (top.skip) s.skip--; if (top.keep) s.keep--; }
    if (s.mode === "kml" && s.pm && s.pm.depth === s.stack.length) {
      const pm = s.pm;
      s.pm = null;
      s.facts.placemarks++;
      const desc = pm.description == null ? null : stripTags(pm.description);
      const text = [pm.name, desc, ...Object.entries(pm.data).map(([k, v]) => `${k}: ${v}`)].filter(Boolean).join("\n");
      emit?.({ kind: "placemark", path: pm.path, name: pm.name, description: pm.description, data: pm.data, geometry: pm.geometry,
        coordinates: pm.coordinates, bbox: pm.bbox, text, line: pm.line, cite: pm.name ?? pm.path });
    }
    s.stack.pop();
    if (!s.stack.length) s.rootDone = true;
  }

  function onTag(body) {
    if (body[0] === "/") {
      flushText(true);
      const name = body.slice(1).trim();
      closeTag(name);
    } else {
      flushText(true);
      openTag(body.replace(/\s+$/, ""));
    }
    s.textLine = s.line;
  }

  function countLines(str) {
    for (let at = str.indexOf("\n"); at >= 0; at = str.indexOf("\n", at + 1)) s.line++;
  }

  function feed(text, sink) {
    emit = sink;
    const n = text.length;
    let i = 0;
    while (i < n) {
      if (s.st === TEXT) {
        const lt = text.indexOf("<", i);
        const end = lt < 0 ? n : lt;
        if (end > i) {
          const chunk = text.slice(i, end);
          if (!s.text) s.textLine = s.line;
          s.text += chunk;
          countLines(chunk);
          if (s.text.length >= PIECE_CHARS) flushText(false);
        }
        if (lt < 0) break;
        i = lt + 1;
        s.st = OPEN; s.buf = ""; s.tagLine = s.line;
        continue;
      }
      if (s.st === OPEN) {
        while (i < n && s.buf.length < 9) {
          s.buf += text[i++];
          const b = s.buf;
          if (b === "!--") { s.st = COMMENT; s.tail = ""; break; }
          if (b === "![CDATA[") { s.st = CDATA; s.tail = ""; break; }
          if (b[0] === "?") { s.st = PI; s.tail = ""; break; }
          if (b[0] === "!" && b.length >= 2 && b !== "!-" && !"![CDATA[".startsWith(b)) { s.st = DOCTYPE; s.dt = b.includes("[") ? 1 : 0; s.q = null; s.buf = ""; break; }
          if (b[0] !== "!") { s.st = TAG; i -= 1; s.buf = ""; s.q = null; break; }
        }
        if (s.st === OPEN && s.buf.length >= 9) throw malformed(s.tagLine, "bad_markup");
        continue;
      }
      if (s.st === TAG) {
        let j = i;
        for (; j < n; j++) {
          const ch = text[j];
          if (s.q) { if (ch === s.q) s.q = null; }
          else if (ch === '"' || ch === "'") s.q = ch;
          else if (ch === ">") break;
          if (ch === "\n") s.line++;
        }
        s.buf += text.slice(i, j);
        if (s.buf.length > XML_TAG_MAX) throw malformed(s.tagLine, "tag_too_long");
        if (j >= n) { i = n; break; }
        i = j + 1;
        const body = s.buf;
        s.buf = "";
        s.st = TEXT;
        if (!body) throw malformed(s.tagLine, "empty_tag");
        onTag(body);
        continue;
      }
      /* comment, CDATA, processing instruction: read to their closing mark, which may straddle two windows */
      if (s.st === COMMENT || s.st === CDATA || s.st === PI) {
        const mark = s.st === COMMENT ? "-->" : s.st === CDATA ? "]]>" : "?>";
        const look = s.tail + text.slice(i);
        const at = look.indexOf(mark);
        /* what is certainly content is committed; the last characters, which may begin the mark, are held */
        const keep = at >= 0 ? 0 : Math.min(mark.length - 1, look.length);
        const content = at >= 0 ? look.slice(0, at) : look.slice(0, look.length - keep);
        if (s.st === CDATA && content && !s.text) s.textLine = s.line;
        countLines(content);
        if (s.st === CDATA && content) {
          s.text += content.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        }
        if (at < 0) { s.tail = look.slice(look.length - keep); i = n; break; }
        i += at + mark.length - s.tail.length;
        s.tail = "";
        s.st = TEXT;
        continue;
      }
      if (s.st === DOCTYPE) {
        let j = i;
        for (; j < n; j++) {
          const ch = text[j];
          if (ch === "\n") s.line++;
          if (s.q) { if (ch === s.q) s.q = null; continue; }
          if (ch === '"' || ch === "'") s.q = ch;
          else if (ch === "[") s.dt++;
          else if (ch === "]") s.dt--;
          else if (ch === ">" && s.dt <= 0) break;
        }
        if (j >= n) { i = n; break; }
        i = j + 1;
        if (s.rootSeen) throw malformed(s.tagLine, "doctype_inside");
        s.st = TEXT;
      }
    }
  }

  function end(sink) {
    emit = sink;
    if (s.st !== TEXT) throw malformed(s.line, "ended_inside_markup");
    flushText(true);
    if (s.stack.length) throw malformed(s.line, "ended_inside_element");
    if (!s.rootSeen) throw malformed(s.line, "no_root");
  }

  return { feed, end, save: () => s, get line() { return s.line; }, facts: () => ({ ...s.facts }) };
}
