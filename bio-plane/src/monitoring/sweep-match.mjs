/* monitoring — a sweep's terms (requirements: `build/requirements/monitoring.md`, R54; K1036). Pure: no record, no
 * clock, no network.
 *
 * A term is a literal, or a regular expression written between slashes; both match without regard to case. A regular
 * expression is never handed to JavaScript's backtracking `RegExp`: banning backreferences and lookaround does not make
 * a backtracking engine linear, because `(a|a)*` and `(a+)+` still blow up (the Suggestion's reason). It is parsed here
 * and compiled to a Thompson NFA, which is simulated over the text one character at a time with the set of live
 * states, so its time is the text's length times the program's size, and the program's size is bounded at compile
 * time (`TERM_PROGRAM_MAX`). What it refuses (a backreference, a lookahead, a lookbehind, a construct it does not read,
 * a program past the bound) it names, for C-18.5's `SWEEP_TERM_REFUSED`. */

import { normalizeAddress } from "../subresources.mjs";

/** R53: whether `address` is in scope of `sources`: its normalised form (`subresources.normalizeAddress`) equals a
 *  prefix's, or continues one at a `/`. The one rule C-18.5, a run, a redirect and R64's check read. */
export function inScope(address, sources) {
  if (typeof address !== "string" || !Array.isArray(sources)) return false;
  let a;
  try { a = normalizeAddress(address); } catch { return false; }
  return sources.some((p) => {
    if (typeof p !== "string" || !p) return false;
    let n;
    try { n = normalizeAddress(p); } catch { return false; }
    return a === n || (a.startsWith(n) && (n.endsWith("/") || a[n.length] === "/"));
  });
}

/** R54: the longest term, and the most characters of a link's text or decoded address a term reads. */
export const TERM_MAX = 200;
export const MATCH_TEXT_MAX = 2048;
/** R54: the most states a compiled term may hold (a counted repetition is expanded), and the largest count. */
export const TERM_PROGRAM_MAX = 4000;
export const TERM_REPEAT_MAX = 100;

const fold = (c) => { const l = c.toLowerCase(); return l.length === 1 ? l : c; };
const unfold = (c) => { const u = c.toUpperCase(); return u.length === 1 ? u : c; };
const isWord = (c) => c !== undefined && /^[A-Za-z0-9_]$/.test(c);
const CLASS = { d: (c) => c >= "0" && c <= "9", w: isWord, s: (c) => /^\s$/u.test(c) };

class Refused extends Error { constructor(construct, detail) { super(detail); this.construct = construct; } }

/* The parser: alternation of sequences of quantified atoms. Nodes: {t: "char", test}, {t: "assert", k}, {t: "seq", xs},
   {t: "alt", xs}, {t: "rep", x, min, max}. */
function parse(src) {
  const cs = Array.from(src);
  let i = 0;
  const peek = () => cs[i], eat = () => cs[i++];
  const escape = (inClass) => {
    const c = eat();
    if (c === undefined) throw new Refused("a trailing backslash", "the expression ends with a backslash");
    if (/[1-9]/.test(c) || c === "k") throw new Refused("a backreference", `\\${c} refers back to a group, and a backreference cannot be matched in linear time`);
    const low = c.toLowerCase();
    if (CLASS[low]) { const f = CLASS[low]; return c === low ? f : (x) => !f(x); }
    if (!inClass && (c === "b" || c === "B")) return { assert: c };
    const ctl = { n: "\n", r: "\r", t: "\t", f: "\f", v: "\v", 0: "\0" }[c];
    if (ctl !== undefined) return ctl;
    if (c === "x" || c === "u") {
      const n = c === "x" ? 2 : 4, h = cs.slice(i, i + n).join("");
      if (!new RegExp(`^[0-9a-fA-F]{${n}}$`).test(h)) throw new Refused(`\\${c} without ${n} hex digits`, `\\${c} needs ${n} hex digits`);
      i += n;
      return String.fromCharCode(parseInt(h, 16));
    }
    if (/[A-Za-z]/.test(c)) throw new Refused(`the escape \\${c}`, `\\${c} is not an escape a term reads`);
    return c;
  };
  const klass = () => {
    const neg = peek() === "^" && !!eat();
    const items = [];
    let first = true;
    for (;;) {
      let c = eat();
      if (c === undefined) throw new Refused("an unclosed class", "a [ has no closing ]");
      if (c === "]" && !first) break;
      first = false;
      let lo = c === "\\" ? escape(true) : c;
      if (typeof lo === "string" && peek() === "-" && cs[i + 1] !== undefined && cs[i + 1] !== "]") {
        eat();
        c = eat();
        const hi = c === "\\" ? escape(true) : c;
        if (typeof hi !== "string" || hi < lo) throw new Refused("a reversed or open range", "a range in a class runs backwards or ends in a class");
        items.push([lo, hi]);
        continue;
      }
      items.push(lo);
    }
    const hit = (c) => items.some((x) => (typeof x === "function" ? x(c) : Array.isArray(x) ? c >= x[0] && c <= x[1] : c === x));
    return { t: "char", test: (c) => (hit(c) || hit(unfold(c)) || hit(fold(c))) !== neg };
  };
  const atom = () => {
    const c = eat();
    if (c === "(") {
      if (peek() === "?") {
        eat();
        const k = eat();
        if (k === "=" || k === "!") throw new Refused("a lookahead", `(?${k} looks ahead, which a term may not`);
        if (k === "<" && (peek() === "=" || peek() === "!")) throw new Refused("a lookbehind", `(?<${peek()} looks behind, which a term may not`);
        if (k === "<") { while (peek() !== undefined && peek() !== ">") eat(); if (eat() !== ">") throw new Refused("an unclosed group name", "a named group's name has no closing >"); }
        else if (k !== ":") throw new Refused(`the group (?${k ?? ""}`, `(?${k ?? ""} is not a group a term reads`);
      }
      const x = alt();
      if (eat() !== ")") throw new Refused("an unclosed group", "a ( has no closing )");
      return x;
    }
    if (c === "[") return klass();
    if (c === ".") return { t: "char", test: (x) => x !== "\n" && x !== "\r" };
    if (c === "^" || c === "$") return { t: "assert", k: c };
    if (c === "\\") {
      const e = escape(false);
      if (e && e.assert) return { t: "assert", k: e.assert };
      return typeof e === "function" ? { t: "char", test: e } : lit(e);
    }
    if ("*+?{".includes(c)) throw new Refused("a quantifier with nothing to repeat", `${c} repeats nothing`);
    if (c === ")") throw new Refused("an unopened group", "a ) closes no group");
    return lit(c);
  };
  const lit = (ch) => { const f = fold(ch); return { t: "char", test: (x) => fold(x) === f }; };
  const quant = (x) => {
    let min, max;
    const c = peek();
    if (c === "*") { min = 0; max = Infinity; }
    else if (c === "+") { min = 1; max = Infinity; }
    else if (c === "?") { min = 0; max = 1; }
    else if (c === "{") {
      const m = /^\{(\d+)(,(\d*))?\}/.exec(cs.slice(i, i + 12).join(""));
      if (!m) return x;   // a brace that opens no count is a literal, as JavaScript reads it
      min = Number(m[1]); max = m[2] ? (m[3] === "" ? Infinity : Number(m[3])) : min;
      if (min > TERM_REPEAT_MAX || (max !== Infinity && max > TERM_REPEAT_MAX) || max < min)
        throw new Refused("a count past the bound", `a count is at most ${TERM_REPEAT_MAX} and never runs backwards`);
      i += m[0].length - 1;
    } else return x;
    eat();
    if (peek() === "?") eat();   // a lazy quantifier matches the same texts
    if (x.t === "assert") throw new Refused("a repeated assertion", "an anchor or word boundary cannot be repeated");
    return quant({ t: "rep", x, min, max });
  };
  const seq = () => {
    const xs = [];
    while (peek() !== undefined && peek() !== "|" && peek() !== ")") xs.push(quant(atom()));
    return { t: "seq", xs };
  };
  const alt = () => {
    const xs = [seq()];
    while (peek() === "|") { eat(); xs.push(seq()); }
    return xs.length === 1 ? xs[0] : { t: "alt", xs };
  };
  const tree = alt();
  if (i < cs.length) throw new Refused("an unopened group", "a ) closes no group");
  return tree;
}

/* Thompson's construction into a flat program: {op: "char", test, next} | {op: "split", a, b} | {op: "assert", k, next}
   | {op: "match"}. `emit` answers [entry, holes], where holes are the states whose dangling exit is patched later. */
function compile(tree) {
  const prog = [];
  const add = (s) => { if (prog.length >= TERM_PROGRAM_MAX) throw new Refused("an expression past the bound", `the term compiles to more than ${TERM_PROGRAM_MAX} states`); prog.push(s); return prog.length - 1; };
  const patch = (holes, to) => { for (const [s, k] of holes) prog[s][k] = to; };
  const emit = (n) => {
    if (n.t === "char") { const s = add({ op: "char", test: n.test, next: -1 }); return [s, [[s, "next"]]]; }
    if (n.t === "assert") { const s = add({ op: "assert", k: n.k, next: -1 }); return [s, [[s, "next"]]]; }
    if (n.t === "seq") {
      if (!n.xs.length) { const s = add({ op: "split", a: -1, b: -1 }); return [s, [[s, "a"], [s, "b"]]]; }
      let [entry, holes] = emit(n.xs[0]);
      for (const x of n.xs.slice(1)) { const [e, h] = emit(x); patch(holes, e); holes = h; }
      return [entry, holes];
    }
    if (n.t === "alt") {
      let [entry, holes] = emit(n.xs[0]);
      for (const x of n.xs.slice(1)) {
        const [e, h] = emit(x);
        entry = add({ op: "split", a: entry, b: e });
        holes = [...holes, ...h];
      }
      return [entry, holes];
    }
    /* rep: `min` copies, then either `max - min` optional copies or one starred copy. */
    const parts = [];
    for (let k = 0; k < n.min; k++) parts.push(emit(n.x));
    if (n.max === Infinity) {
      const [e, h] = emit(n.x);
      const s = add({ op: "split", a: e, b: -1 });
      patch(h, s);
      parts.push([s, [[s, "b"]]]);
    } else for (let k = n.min; k < n.max; k++) {
      const [e, h] = emit(n.x);
      const s = add({ op: "split", a: e, b: -1 });
      parts.push([s, [...h, [s, "b"]]]);
    }
    if (!parts.length) { const s = add({ op: "split", a: -1, b: -1 }); return [s, [[s, "a"], [s, "b"]]]; }
    let [entry, holes] = parts[0];
    for (const [e, h] of parts.slice(1)) { patch(holes, e); holes = h; }
    return [entry, holes];
  };
  const [start, holes] = emit(tree);
  patch(holes, add({ op: "match" }));
  return { prog, start };
}

/* The simulation: every live state advances on each character together, so no state is visited twice at one position
   and the work is at most the text's length times the program's size. An unanchored search adds the start at every
   position. */
function run({ prog, start }, chars) {
  const mark = new Int32Array(prog.length).fill(-1);
  let gen = 0;
  const closure = (list, s, pos) => {
    const stack = [s];
    while (stack.length) {
      const x = stack.pop();
      if (x < 0 || mark[x] === gen) continue;
      mark[x] = gen;
      const st = prog[x];
      if (st.op === "split") { stack.push(st.b, st.a); continue; }
      if (st.op === "assert") {
        const before = chars[pos - 1], after = chars[pos];
        const ok = st.k === "^" ? pos === 0 : st.k === "$" ? pos === chars.length
          : (isWord(before) !== isWord(after)) === (st.k === "b");
        if (ok) stack.push(st.next);
        continue;
      }
      if (st.op === "match") return true;
      list.push(x);
    }
    return false;
  };
  let live = [];
  for (let pos = 0; ; pos++) {
    gen++;
    const next = [];
    for (const s of live) if (closure(next, prog[s].next, pos)) return true;
    if (closure(next, start, pos)) return true;
    if (pos >= chars.length) return false;
    const c = chars[pos];
    live = next.filter((s) => prog[s].test(c));
  }
}

/** R54: compile one term. A literal is a case-insensitive substring; a term written `/…/` is a regular expression.
 *  Answers `{ok: true, kind, test(text)}`, `test` reading at most MATCH_TEXT_MAX characters, or `{ok: false,
 *  construct, detail}` naming what was refused. Never throws. */
export function compileTerm(term) {
  if (typeof term !== "string" || !term.length || term.length > TERM_MAX || /[\r\n]/.test(term))
    return { ok: false, construct: "not a term", detail: `a term is a single line of 1 to ${TERM_MAX} characters` };
  const regex = term.length >= 2 && term.startsWith("/") && term.endsWith("/");
  if (!regex) {
    const needle = Array.from(term, fold).join("");
    return { ok: true, kind: "literal", test: (text) => Array.from(cut(text), fold).join("").includes(needle) };
  }
  try {
    const m = compile(parse(term.slice(1, -1)));
    return { ok: true, kind: "regex", test: (text) => run(m, Array.from(cut(text))) };
  } catch (e) {
    if (e instanceof Refused) return { ok: false, construct: e.construct, detail: e.message };
    return { ok: false, construct: "an expression that does not compile", detail: String(e && e.message || e).slice(0, 160) };
  }
}

/** R54: at most MATCH_TEXT_MAX characters of `text` (code points), the rest unread. */
export function cut(text) {
  const s = typeof text === "string" ? text : "";
  if (s.length <= MATCH_TEXT_MAX) return s;
  return Array.from(s).slice(0, MATCH_TEXT_MAX).join("");
}

/** R54: whether `text` is longer than a term reads (the run counts the links it cut). */
export const isCut = (text) => typeof text === "string" && text.length > MATCH_TEXT_MAX && Array.from(text).length > MATCH_TEXT_MAX;
