/* journey-check R30 (T51 FR-34; K4161 group E; amends R29 (a)): making an answer pseudo is cheap. The shell reads the whole word
   list (`interfacewords`, about 67,000 strings) on every page, and the pseudo route made it pseudo by trying every sentence
   pattern of the list on every string, which held the walk's event loop for seconds a page. No browser: the route's own
   function, `pseudoJson`, over a body shaped like that answer, with the anchored patterns' tries counted. The budget test
   runs first, in a process of its own, so no string has been made before it. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { pseudoJson, pseudoString, escapedIn, sentencePatterns } from "../../../src/journey-check/pseudo.mjs";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";

const SIMPLE = /\{[A-Za-z0-9_]+\}/g;
const BUDGET = 1_000_000;

/* The answer's shape: rows of `{key, text, en, fallback}`; `text` and `fallback` carry the values filled into a sentence (a
   different one in each row), `en` the sentence as the list holds it. */
const filled = (en, i) => en.replace(SIMPLE, `Value${i}`);
const BODY = JSON.stringify({ ok: true, rows: WORD_ROWS.map((r, i) => ({ key: r[0], text: filled(r[1], i), en: r[1], fallback: filled(r[1], i + WORD_ROWS.length) })) });

/* `RegExp.prototype.exec` counted for the anchored sentence patterns (`^…$` with the `s` flag) while `run` goes. */
function counted(run) {
  const exec = RegExp.prototype.exec;
  let tries = 0;
  RegExp.prototype.exec = function (s) {
    if (this.flags === "s" && this.source.startsWith("^") && this.source.endsWith("$")) tries += 1;
    return exec.call(this, s);
  };
  try { const out = run(); return { tries, out }; } finally { RegExp.prototype.exec = exec; }
}

test("R30: a body shaped like `interfacewords` costs at most 1,000,000 sentence-pattern tries, a second call none, and the same answer", () => {
  assert.ok(JSON.parse(BODY).rows.length * 3 > 60000, "the body is shaped like the answer: about 67,000 strings");
  const first = counted(() => pseudoJson(BODY));
  assert.ok(first.tries <= BUDGET, `${first.tries} sentence patterns tried for one answer`);
  const second = counted(() => pseudoJson(BODY));
  assert.equal(second.tries, 0, "a string already made is not tried again");
  assert.equal(second.out, first.out, "the same answer");
  assert.notEqual(first.out, BODY, "the answer was made pseudo");
});

test("R30: every string of the body gets the result of trying every pattern", () => {
  const patterns = sentencePatterns();
  assert.ok(patterns.length > 1000, "the list's sentence patterns");
  const everyPattern = (s) => {
    for (const p of patterns) {
      const m = p.re.exec(s);
      if (m) return p.made.replace(SIMPLE, (ph) => m[1 + p.names.indexOf(ph.slice(1, -1))] ?? ph);
    }
    return s;
  };
  /* a sentence the list holds whole, with no placeholder, is answered by its own entry, not by a pattern */
  const whole = new Set(WORD_ROWS.map((r) => r[1]).filter((en) => typeof en === "string" && !/\{[A-Za-z0-9_]+\}/.test(en)));
  const strings = new Set();
  for (const r of JSON.parse(BODY).rows) for (const k of ["text", "en", "fallback"]) strings.add(r[k]);
  const reaching = [...strings].filter((s) => s.length >= 5 && !s.startsWith("[") && /\S\s+\S/.test(s) && !whole.has(s));
  assert.ok(reaching.length > 10000, "the strings that reach the patterns");
  const wrong = reaching.filter((s) => pseudoString(s) !== everyPattern(s));
  assert.deepEqual(wrong.slice(0, 5), []);
});

test("R30: every row of the list that is a sentence, with a value filled into each placeholder, is made pseudo, whatever its length; control: a string that is not a sentence of the list is left as it was", () => {
  const sentence = (en) => typeof en === "string" && !en.startsWith("[") && !/\{[^}]*,/.test(en) && /\S\s+\S/.test(en)
    && (!(en.match(SIMPLE) || []).length || en.replace(SIMPLE, "").trim().length >= 8);
  const rows = WORD_ROWS.filter((r) => sentence(r[1]) && r[1].length >= 5);
  assert.ok(rows.length > 20000, "every sentence row of the list: " + rows.length);
  assert.ok(rows.some((r) => filled(r[1], 0).length > 600), "the list holds sentences longer than 600 characters");
  const unmade = [];
  for (const [i, r] of rows.entries()) {
    const text = filled(r[1], i);
    const made = pseudoString(text);
    if (made === text || escapedIn(made).length) unmade.push(`${r[0]} (${text.length})`);
  }
  assert.deepEqual(unmade, [], "rows whose English is drawn as it is");
  assert.equal(pseudoString("Roof repairs at 14 Lakeshore Row"), "Roof repairs at 14 Lakeshore Row");
  assert.equal(pseudoString("A line no list holds at all today"), "A line no list holds at all today");
});
