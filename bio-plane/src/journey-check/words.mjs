/* journey-check R14 (K3366, K3368): a step that asserts what a screen draws names the word's key and compares the drawn
   text with `setup-words`' `word(key, vars)`, never a hand-copied sentence. A placeholder the step cannot know (a date,
   a count the record decides) is left open: it is filled with a sentinel through `word` itself, and matches any text
   there; every other character of the word must be drawn exactly. The walk's own harness text (a step's label, a
   failure's detail) is not a word and stays in source (DEC-258). */
import * as setupWords from "../setup-words/index.mjs";

const OPEN = "\u0000";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const squash = (s) => String(s).replace(/\s+/g, " ").trim();

/* `vars`, with every placeholder it does not name answered by a sentinel. */
const opened = (vars) => new Proxy({ ...vars }, {
  has: () => true,
  get: (t, k) => (Object.hasOwn(t, k) ? t[k] : typeof k === "string" ? `${OPEN}${k}${OPEN}` : undefined),
  getOwnPropertyDescriptor: (t, k) => ({ value: Object.hasOwn(t, k) ? t[k] : `${OPEN}${String(k)}${OPEN}`, enumerable: true, configurable: true, writable: true }),
});

/** The word `key` as `setup-words` gives it, `vars` filled; throws `UNKNOWN_WORD` when the list has no such key. */
export const word = (key, vars) => setupWords.word(key, vars);
export const hasWord = (key) => setupWords.hasWord(key);

/** A pattern matching the word `key` as a screen draws it: `vars` filled, each placeholder not in `vars` open, white
 *  space as the page renders it. */
export function wordPattern(key, vars = {}) {
  const w = squash(setupWords.word(key, opened(vars)));
  const parts = w.split(new RegExp(`${OPEN}[A-Za-z0-9_]+${OPEN}`));
  return new RegExp(parts.map((p) => esc(p).replace(/ /g, "\\s+")).join("[\\s\\S]+?"));
}

/** Whether `text` (a page's drawn text) draws the word `key`. */
export const drawsWord = (text, key, vars) => wordPattern(key, vars).test(squash(text));

/** Requires the page to draw the word `key` (in `within`, a selector, when given), waiting for it up to `timeout`;
 *  throws naming the key when it is not drawn. */
export async function requireWord(page, key, { vars = {}, within = "body", timeout = 10000 } = {}) {
  const re = wordPattern(key, vars);
  try {
    await page.waitForFunction(([sel, src, flags]) => {
      const el = document.querySelector(sel);
      /* the words as written, before CSS: a heading drawn in capitals (text-transform) is still the word */
      return !!el && new RegExp(src, flags).test(el.textContent.replace(/\s+/g, " ").trim());
    }, [within, re.source, re.flags], { timeout });
  } catch {
    /* what the screen says instead, when it says something: its alerts and refusals, as drawn */
    const said = await page.evaluate(() => [...document.querySelectorAll('[role="alert"], .mk-msg, [data-refusal]')]
      .map((e) => e.textContent.replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, 3).join(" | ")).catch(() => "");
    throw new Error(`the screen does not draw the word ${key} on ${new URL(page.url()).pathname}${said ? `; it says: ${said.slice(0, 300)}` : ""}`);
  }
}

/** The visible link or control whose own text is the word `key`. */
export const byWord = (page, key, vars = {}, within = null) =>
  (within ? page.locator(within) : page).locator("a:visible, button:visible, summary:visible").filter({ hasText: wordPattern(key, vars) }).first();

/** Requires the page to draw one of the words `keys` (each with its own open placeholders), as `requireWord` does. */
export async function requireAnyWord(page, keys, { within = "body", timeout = 10000 } = {}) {
  const res = keys.map((k) => wordPattern(k));
  try {
    await page.waitForFunction(([sel, srcs]) => {
      const el = document.querySelector(sel);
      const t = el ? el.textContent.replace(/\s+/g, " ").trim() : "";
      return !!el && srcs.some(([src, flags]) => new RegExp(src, flags).test(t));
    }, [within, res.map((r) => [r.source, r.flags])], { timeout });
  } catch {
    throw new Error(`the screen draws none of the words ${keys.join(", ")} on ${new URL(page.url()).pathname}`);
  }
}

/* R23 (K3815; usability review B-11, B-30, B-31): a page numbered 0 ("Page 0", "Pages 0", "Page 0 of 3"): pages are numbered from 1.
   Answers each place it is drawn, `[{at}]`. */
export function pageZero(text) {
  const t = String(text).replace(/\s+/g, " ");
  return [...t.matchAll(/\bPages? 0(?!\d|[.,]\d)/g)].map((m) => ({ at: t.slice(Math.max(0, m.index - 30), m.index + 40).trim() }));
}
