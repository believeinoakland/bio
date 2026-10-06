/* court-citations: Python regular expressions (the `re` module, str patterns) translated to equivalent JavaScript
 * ones, for the build (R4). Python's Unicode classes are spelled out so they mean what they meant in Python:
 * `\d` is any decimal digit, `\w` any letter, number or underscore, `\s` Python's own white-space set, `.` anything but
 * a newline, and `$` the end or just before a final newline. A construct with no JavaScript equivalent throws
 * `Untranslatable`, which the build lists (R5); nothing is approximated silently. */

export class Untranslatable extends Error {}

const WORD = "\\p{L}\\p{N}_";
const SPACE = "\\t\\n\\v\\f\\r\\x1c-\\x20\\x85\\xa0\\u1680\\u2000-\\u200a\\u2028\\u2029\\u202f\\u205f\\u3000";
const DIGIT = "\\p{Nd}";
const ASCII = { d: "0-9", w: "a-zA-Z0-9_", s: "\\t\\n\\v\\f\\r " };
const SYNTAX = new Set("^$\\.*+?()[]{}|/");
const SIMPLE = { n: "\\n", t: "\\t", r: "\\r", f: "\\f", v: "\\v", a: "\\x07" };

/* translate(source, {ignoreCase}) → {source, flags}: the JavaScript pattern and flags (always `u`). */
export function translate(src, { ignoreCase = false } = {}) {
  if (typeof src !== "string") throw new Untranslatable("not a string");
  const fl = { i: ignoreCase, m: false, s: false, a: false };
  let i = 0;
  // Global inline flags, at the very start only (Python 3.11 refuses them anywhere else).
  while (src.startsWith("(?", i) && /^\(\?[aiLmsux]+\)/.test(src.slice(i))) {
    const m = /^\(\?([aiLmsux]+)\)/.exec(src.slice(i));
    for (const f of m[1]) {
      if (f === "i") fl.i = true; else if (f === "m") fl.m = true; else if (f === "s") fl.s = true;
      else if (f === "a") fl.a = true; else if (f === "u") { /* the default for str patterns */ }
      else throw new Untranslatable(`inline flag (?${f})`);
    }
    i += m[0].length;
  }
  const cls = (k) => (fl.a ? ASCII[k] : k === "d" ? DIGIT : k === "w" ? WORD : SPACE);
  const word = `[${cls("w")}]`;
  const names = [];
  let groups = 0, out = "";

  // One escape at src[j] === "\\"; returns [text, next index]. inClass: inside [...].
  function escape(j, inClass) {
    const c = src[j + 1];
    if (c === undefined) throw new Untranslatable("trailing backslash");
    if ("dws".includes(c)) return [inClass ? cls(c) : `[${cls(c)}]`, j + 2];
    if ("DWS".includes(c)) {
      if (inClass) throw new Untranslatable(`\\${c} inside a character class`);
      return [`[^${cls(c.toLowerCase())}]`, j + 2];
    }
    if (c === "b") return [inClass ? "\\x08" : `(?:(?<=${word})(?!${word})|(?<!${word})(?=${word}))`, j + 2];
    if (c === "B" && !inClass) return [`(?:(?<=${word})(?=${word})|(?<!${word})(?!${word}))`, j + 2];
    if (c === "A" && !inClass) return ["(?<![\\s\\S])", j + 2];
    if (c === "Z" && !inClass) return ["(?![\\s\\S])", j + 2];
    if (SIMPLE[c]) return [SIMPLE[c], j + 2];
    if (c === "x") { const h = /^[0-9a-fA-F]{2}/.exec(src.slice(j + 2)); if (!h) throw new Untranslatable("bad \\x"); return [`\\x${h[0]}`, j + 4]; }
    if (c === "u") { const h = /^[0-9a-fA-F]{4}/.exec(src.slice(j + 2)); if (!h) throw new Untranslatable("bad \\u"); return [`\\u${h[0]}`, j + 6]; }
    if (c === "U") { const h = /^[0-9a-fA-F]{8}/.exec(src.slice(j + 2)); if (!h) throw new Untranslatable("bad \\U"); return [`\\u{${h[0].replace(/^0+(?=.)/, "")}}`, j + 10]; }
    if (/[0-7]/.test(c) && (c === "0" || inClass || /^[0-7]{3}/.test(src.slice(j + 1)))) {
      const o = /^[0-7]{1,3}/.exec(src.slice(j + 1))[0];
      return [`\\u{${parseInt(o, 8).toString(16)}}`, j + 1 + o.length];
    }
    if (/[1-9]/.test(c)) {
      const n = /^[0-9]{1,2}/.exec(src.slice(j + 1))[0];
      if (Number(n) > groups) throw new Untranslatable(`back-reference \\${n} before its group`);
      return [`(?:\\${n})`, j + 1 + n.length];
    }
    if (/[A-Za-z0-9]/.test(c)) throw new Untranslatable(`escape \\${c}`);
    const lit = src.codePointAt(j + 1), ch = String.fromCodePoint(lit);
    return [literal(ch, inClass), j + 1 + ch.length];
  }
  const literal = (ch, inClass) => (SYNTAX.has(ch) || (inClass && ch === "-") ? `\\${ch}` : ch);

  function charClass(j) { // src[j] === "["
    let k = j + 1, t = "[";
    if (src[k] === "^") { t += "^"; k++; }
    if (src[k] === "]") { t += "\\]"; k++; }
    for (;;) {
      if (k >= src.length) throw new Untranslatable("unterminated character class");
      const c = src[k];
      if (c === "]") return [t + "]", k + 1];
      if (c === "\\") { const [e, n] = escape(k, true); t += e; k = n; continue; }
      if (c === "[" && /^\[[:=.]/.test(src.slice(k))) throw new Untranslatable("POSIX class");
      if (c === "-" && src[k + 1] !== "]" && t !== "[" && t !== "[^") { t += "-"; k++; continue; }
      const ch = String.fromCodePoint(src.codePointAt(k));
      t += c === "-" ? "\\-" : "[]".includes(ch) ? `\\${ch}` : ch;
      k += ch.length;
    }
  }

  const quant = /^\{(\d*)(?:(,)(\d*))?\}/;
  while (i < src.length) {
    const c = src[i];
    if (c === "\\") { const [e, n] = escape(i, false); out += e; i = n; }
    else if (c === "[") { const [t, n] = charClass(i); out += t; i = n; }
    else if (c === "(") {
      const rest = src.slice(i);
      let m;
      if ((m = /^\(\?P<([A-Za-z_][A-Za-z0-9_]*)>/.exec(rest))) { groups++; names.push(m[1]); out += `(?<${m[1]}>`; i += m[0].length; }
      else if ((m = /^\(\?P=([A-Za-z_][A-Za-z0-9_]*)\)/.exec(rest))) {
        if (!names.includes(m[1])) throw new Untranslatable(`back-reference to ${m[1]} before its group`);
        out += `\\k<${m[1]}>`; i += m[0].length;
      }
      else if ((m = /^\(\?(?::|=|!|<=|<!)/.exec(rest))) { out += m[0]; i += m[0].length; }
      else if ((m = /^\(\?#[^)]*\)/.exec(rest))) { i += m[0].length; }
      else if ((m = /^\(\?([ims]*)(?:-([ims]*))?:/.exec(rest)) && (m[1] || m[2])) {
        if ((m[1] + (m[2] || "")).includes("s") || (m[1] + (m[2] || "")).includes("m")) throw new Untranslatable("scoped (?s) or (?m)");
        out += m[0]; i += m[0].length;
      }
      else if (rest.startsWith("(?")) throw new Untranslatable(`group ${rest.slice(0, 4)}`);
      else { groups++; out += "("; i++; }
    }
    else if (c === "{") {
      const m = quant.exec(src.slice(i));
      if (m && (m[1] !== "" || m[2])) {
        out += `{${m[1] || "0"}${m[2] ? "," + m[3] : ""}}`; i += m[0].length;
        if (src[i] === "+") throw new Untranslatable("possessive quantifier");
      } else { out += "\\{"; i++; }
    }
    else if ((c === "*" || c === "+" || c === "?") && src[i + 1] === "+") throw new Untranslatable("possessive quantifier");
    else if (c === "}" || c === "]" || c === "/") { out += `\\${c}`; i++; }
    else if (c === ".") { out += fl.s ? "[\\s\\S]" : "[^\\n]"; i++; }
    else if (c === "$") { out += fl.m ? "(?=\\n|(?![\\s\\S]))" : "(?=\\n?(?![\\s\\S]))"; i++; }
    else if (c === "^") { out += fl.m ? "(?<=\\n|^)" : "(?<![\\s\\S])"; i++; }
    else { const ch = String.fromCodePoint(src.codePointAt(i)); out += ch; i += ch.length; }
  }
  const flags = "u" + (fl.i ? "i" : "");
  try { new RegExp(out, flags); } catch (e) { throw new Untranslatable(`does not compile in JavaScript: ${e.message}`); }
  return { source: out, flags };
}

/* Python's re.escape for an edition string, as JavaScript source. */
export const escapeLiteral = (s) => [...s].map((ch) => (SYNTAX.has(ch) ? `\\${ch}` : ch)).join("");
