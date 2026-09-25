/* GATE: reads bio-plane/test/ (the sweep reads every suite in the battery, which no import names)
 *
 * stated-null.test.mjs — D-620: A STATED null IS TOLD FROM A DROPPED KEY, in every suite that asserts one.
 *
 * WHY. The battery's `t` helpers compared `got` with `want` by `JSON.stringify` equality, and `JSON.stringify`
 * writes an absent array element (`undefined`, a hole) and a non-finite number (`NaN`, `±Infinity`) as `null`.
 * So `t("…", [a.edition, b.edition], [null, null])` passed when the answer DROPPED `edition`: the record read
 * as saying "undetermined" where it said nothing. D-568's worker measured it in reviewcopy.control arm v, green
 * until the arm was hardened with a per-key `stated` reader. D-620 is the class fix: ONE serialiser,
 * `statedJSON` in ./stated.mjs, which states each absence, and every suite that asserts a null compares with it.
 *
 * WHAT IS PINNED.
 *   Block 1, THE COMPARATOR: the defect exists in `JSON.stringify` (the premise, so this suite is about
 *   something); `statedJSON` tells a dropped key, a hole, NaN and ±Infinity from a stated null; and it agrees
 *   with `JSON.stringify` on every value that serialiser does not conflate, including an object property that
 *   holds `undefined` (omitted by both: absence is absence, and only a stated null is null).
 *   Block 2, THE SWEEP: every suite in this directory whose comparing helper is called with a `null` literal in
 *   either operand compares with `statedJSON`, never raw. Its matcher is `stripToCode` (the estate's one lexer,
 *   ../scripts/walkfloor.mjs), so a `null` inside a label string or a comment is not an assertion.
 *
 * WHAT THE SWEEP CANNOT SEE. A null that reaches `want` through a VARIABLE (`const W = [null]; t("…", g, W)`),
 * a helper whose comparison is not spelled `<serialiser>(<param>) === <serialiser>(<param>)`, and a helper
 * called through an alias. A suite the code-only lexer loses (a code-bearing template can desync it) is re-read
 * with strings kept and printed by name. Measured 2026-09-25 by WORKER D-620 over origin/main 5e8a65a8 with a TypeScript-AST
 * census (not this lexer): 376 suites, 368 comparing by JSON equality, 268 calling their helper with a `null`
 * literal (217 with the null inside an array literal). THIS matcher over the same tree: 368 and 268, the SAME
 * set suite for suite; its in-array figure reads 215 (it misses a null nested past an inner `]`, in
 * rec195-laws-proposal and rec213-reviewcopy-writer) — report-only, it gates nothing. The other 100 JSON-equality suites assert no null literal and were left raw (the row's
 * scope); a raw comparison there can still read an absent array element as a null only if a `want` holds one
 * through a variable, which is the blind spot above.
 *
 * NEGATIVE CONTROL: (a) in ./stated.mjs, map an array's `undefined` to `undefined` again (the replacer's
 *   `Array.isArray(this) ? ABSENT : undefined` → `undefined`) -> MUST FAIL "a DROPPED key read into an array is
 *   not a stated null" and "a hole is not a stated null"; MUST NOT FAIL the agreement or sweep arms.
 * (b) revert ONE null-asserting suite's helper to `JSON.stringify(got) === JSON.stringify(want)` -> MUST FAIL
 *   "every null-asserting suite compares with statedJSON", naming that suite; nothing else.
 * (c) OVER-STRICTNESS: a helper spelled differently — `function check(name, g, w)` comparing with `statedJSON`
 *   — is read as stated and MUST PASS (fixture arm below, always on).
 * (d) THE FIXTURE, in a real suite: drop a stated-null key on the wire and see its arm fail by name. Declared and
 *   run as d463-confined-credential.test.mjs's arm (H) and (H0) — see its NEGATIVE CONTROL block.
 * RUN 2026-09-25 by WORKER D-620, each arm ALONE, restores verified by sha256 AND cmp against per-arm pristine copies
 * in the session scratchpad: BASELINE 18 pass, 0 fail. (a) -> 15 pass, 3 fail: "a DROPPED key read into an array is
 * not a stated null", "a hole is not a stated null" AS DECLARED, and "the dropped key serialises as ABSENT, by name",
 * which the declaration OMITTED (it pins the same sentinel; a finding about the declaration, not the subject); the
 * agreement and sweep arms GREEN. test/stated.mjs 1,958 B sha256 73da15e4baca MATCH. (b) on ledger.test.mjs -> 17
 * pass, 1 fail: the sweep arm, got ["ledger.test.mjs"], AS DECLARED; ledger.test.mjs 78,742 B sha256 7a9e79c147fd
 * MATCH. (c) is always on and GREEN.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { statedJSON, ABSENT } from "./stated.mjs";
import { stripToCode, stripComments } from "../scripts/walkfloor.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

console.log("\n1. THE COMPARATOR");
const answer = { case: "C1" };                         /* an answer that DROPPED `edition` */
t("the premise: JSON.stringify reads a dropped key in an array as a stated null",
  JSON.stringify([answer.edition]) === JSON.stringify([null]), true);
t("a DROPPED key read into an array is not a stated null",
  statedJSON([answer.edition]) === statedJSON([null]), false);
t("the dropped key serialises as ABSENT, by name", statedJSON([answer.edition]), `[${JSON.stringify(ABSENT)}]`);
t("a hole is not a stated null", statedJSON([1, , 3]) === statedJSON([1, null, 3]), false);  // eslint-disable-line no-sparse-arrays
t("NaN is not a stated null", [statedJSON(NaN) === statedJSON(null), statedJSON([NaN]) === statedJSON([null]),
  statedJSON({ n: NaN }) === statedJSON({ n: null })], [false, false, false]);
t("±Infinity is not a stated null, nor each other",
  [statedJSON(Infinity) === statedJSON(null), statedJSON(-Infinity) === statedJSON(Infinity)], [false, false]);
t("a wholly absent value is not a stated null", statedJSON(undefined) === statedJSON(null), false);
t("a stated null still equals a stated null", [statedJSON([null]) === statedJSON([null]),
  statedJSON({ a: null }) === statedJSON({ a: null }), statedJSON(null) === statedJSON(null)], [true, true, true]);
t("a key holding undefined is the same absence as a key not there (both omitted, as JSON.stringify omits it)",
  statedJSON({ a: 1, b: undefined }) === statedJSON({ a: 1 }), true);
t("a key not there is not a key stating null", statedJSON({}) === statedJSON({ a: null }), false);
const PLAIN = [null, 0, -1.5, "", "null", "xé", true, false, [], {}, [1, [2, [null]]], { a: { b: [null, "c"] } },
  { d: new Date(0) }, [{ k: null }, 3]];
t(`agrees with JSON.stringify on every value it does not conflate (${PLAIN.length} values)`,
  PLAIN.filter((v) => statedJSON(v) !== JSON.stringify(v)).map((v) => JSON.stringify(v)), []);

console.log("\n2. THE SWEEP");
/* Helpers: a `const|let|var NAME = (…) => {…}` / `function NAME(…) {…}` whose body compares two of its own
   parameters as `<ser>(<p>) === <ser>(<q>)`, `<ser>` being `JSON.stringify` (RAW) or `statedJSON` (STATED). */
const braceEnd = (s, open) => { let d = 0; for (let i = open; i < s.length; i++) { if (s[i] === "{") d++; else if (s[i] === "}" && --d === 0) return i + 1; } return s.length; };
const parenArgs = (s, open) => {
  const args = []; let d = 0, from = open + 1;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (c === "(" || c === "[" || c === "{") d++;
    else if (c === ")" || c === "]" || c === "}") { if (--d === 0) { args.push(s.slice(from, i)); return args; } }
    else if (c === "," && d === 1) { args.push(s.slice(from, i)); from = i + 1; }
  }
  return null;
};
const esc = (x) => x.replace(/[$]/g, "\\$");
function readSuite(src, lex = stripToCode) {
  const code = lex(src);
  const helpers = [];
  const DEF = /(?:\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\s*[\w$]*\s*)?\(([^()]*)\)\s*(?:=>)?\s*\{|\bfunction\s+([A-Za-z_$][\w$]*)\s*\(([^()]*)\)\s*\{)/g;
  for (const m of code.matchAll(DEF)) {
    const name = m[1] || m[3], ps = (m[2] ?? m[4]).split(",").map((p) => p.trim().replace(/\s*=.*$/, ""));
    const open = m.index + m[0].length - 1, body = code.slice(open, braceEnd(code, open));
    for (let i = 0; i < ps.length; i++) for (let j = 0; j < ps.length; j++) {
      if (i === j || !/^[A-Za-z_$][\w$]*$/.test(ps[i]) || !/^[A-Za-z_$][\w$]*$/.test(ps[j])) continue;
      const cmp = new RegExp(`(JSON\\.stringify|statedJSON)\\(${esc(ps[i])}\\)\\s*===\\s*(JSON\\.stringify|statedJSON)\\(${esc(ps[j])}\\)`).exec(body);
      if (cmp) helpers.push({ name, operands: [i, j], at: m.index, kind: cmp[1] === "statedJSON" && cmp[2] === "statedJSON" ? "STATED" : "RAW" });
    }
  }
  let nullCalls = 0, arrayNull = 0;
  for (const h of helpers) {
    for (const m of code.matchAll(new RegExp(`(?<![\\w$.])${esc(h.name)}\\s*\\(`, "g"))) {
      if (m.index === h.at || code.slice(Math.max(0, m.index - 12), m.index).match(/function\s*$/)) continue;
      const args = parenArgs(code, m.index + m[0].length - 1);
      if (!args) continue;
      const ops = h.operands.map((k) => args[k] ?? "");
      if (ops.some((a) => /\bnull\b/.test(a))) { nullCalls++; h.nullCalls = (h.nullCalls || 0) + 1; }
      if (ops.some((a) => /\[[^\]]*\bnull\b/.test(a))) arrayNull++;
    }
  }
  return { helpers, nullCalls, arrayNull };
}

const suites = readdirSync(HERE).filter((f) => f.endsWith(".test.mjs")).sort();
/* A suite the code-only lexer reads NO helper in, while its text spells a serialiser comparison, is one the lexer lost
   (measured: browser-render.test.mjs, whose page-script template desyncs it). It is re-read with strings KEPT — the
   over-inclusive direction, where a `null` in a label counts — and printed, never scored as comparing nothing. */
const SPELLS = /(?:JSON\.stringify|statedJSON)\([\w$]+\)\s*===\s*(?:JSON\.stringify|statedJSON)\([\w$]+\)/;
const lost = [];
const read = suites.map((f) => {
  const src = readFileSync(join(HERE, f), "latin1");
  let r = readSuite(src);
  if (!r.helpers.length && SPELLS.test(src)) { lost.push(f); r = readSuite(src, stripComments); }
  return { f, ...r };
});
console.log(`  re-read with strings kept (the code-only lexer lost them): ${lost.length ? lost.join(", ") : "none"}`);
const comparing = read.filter((r) => r.helpers.length);
const asserting = read.filter((r) => r.nullCalls);
const inArray = read.filter((r) => r.arrayNull);
console.log(`  ${suites.length} suites · ${comparing.length} compare by a JSON serialiser · ${asserting.length} assert a null literal `
  + `(${inArray.length} inside an array literal) · ${comparing.filter((r) => r.helpers.every((h) => h.kind === "RAW")).length} compare raw`);
t("every suite re-read with strings kept is read as comparing", lost.filter((f) => !read.find((r) => r.f === f).helpers.length), []);
t("the corpus is the battery, not an empty directory (≥ 376 suites read, ≥ 200 asserting a null)",
  [suites.length >= 376, asserting.length >= 200], [true, true]);
const raw = asserting.filter((r) => r.helpers.some((h) => h.kind === "RAW" && h.nullCalls)).map((r) => r.f);
t("every null-asserting suite compares with statedJSON, never raw JSON.stringify", raw, []);
t("every suite that compares with statedJSON imports it from ./stated.mjs",
  read.filter((r) => r.helpers.some((h) => h.kind === "STATED"))
    .filter((r) => !/^import\s*\{[^}]*\bstatedJSON\b[^}]*\}\s*from\s*["']\.\/stated\.mjs["']/m.test(readFileSync(join(HERE, r.f), "latin1")))
    .map((r) => r.f), []);
/* (c) OVER-STRICTNESS, always on: a helper this sweep did not write, in another spelling, reads as STATED and its
   null call is counted; the same helper spelled raw reads as RAW. */
const FIX = (ser) => `function check(name, g, w) {\n  if (${ser}(g) === ${ser}(w)) pass++;\n}\ncheck("x", [a.b], [null]);\n`;
const fS = readSuite(FIX("statedJSON")), fR = readSuite(FIX("JSON.stringify"));
t("OVER-STRICTNESS: `function check(name, g, w)` comparing with statedJSON reads STATED, its null call counted",
  [fS.helpers.map((h) => h.kind), fS.nullCalls, fS.arrayNull], [["STATED"], 1, 1]);
t("and the same helper spelled raw reads RAW", fR.helpers.map((h) => h.kind), ["RAW"]);
t("a null inside the LABEL string is not an assertion", readSuite(`const t = (l, g, w) => { const ok = JSON.stringify(g) === JSON.stringify(w); };\nt("got null", 1, 1);\n`).nullCalls, 0);

console.log(`\nstated-null: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
