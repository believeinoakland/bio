// A regex for the text of a word key whose placeholders stand for any text: tests assert the word, never the English (K5313).
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
export const wordLike = (key, flags = "") => {
  const row = WORD_ROWS.find((r) => r[0] === key);
  if (!row) throw new Error(`no word ${key}`);
  const quote = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(row[1].split(/\{[A-Za-z0-9_]+\}/).map(quote).join("[\\s\\S]*"), flags);
};
