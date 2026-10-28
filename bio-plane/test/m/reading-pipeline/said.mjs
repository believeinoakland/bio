/* K5565 (T53-127): a test never copies a sentence people read; it reads the expected text from the word table by its key. `said(key, vars)` is a RegExp for
   that sentence: a placeholder named in `vars` is filled as `word` fills it, every other placeholder matches any run of text, so an assertion keeps the
   figures it checks and leaves the rest to the word. The sentences are the product's own, keyed at their use (`localize(id, en)`), read from `WORD_ROWS`. */
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";

const rows = new Map(WORD_ROWS.map((r) => [r[0], r]));
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function said(key, vars = {}) {
  const row = rows.get(key);
  if (!row) throw new Error(`no word ${key}`);
  const parts = row[1].split(/(\{[A-Za-z0-9_]+\})/);
  return new RegExp(parts.map((p) => {
    const m = /^\{([A-Za-z0-9_]+)\}$/.exec(p);
    if (!m) return escape(p);
    return Object.hasOwn(vars, m[1]) ? escape(String(vars[m[1]])) : ".+?";
  }).join(""));
}
