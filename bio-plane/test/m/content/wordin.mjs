/* content tests: does a text carry the sentence of a word key, its placeholders filled where the test knows them and
   matching anything where it does not (K5313: a test asserts the key, never the English). */
import { word } from "../../../src/setup-words/index.mjs";

export function wordIn(text, key, vars = {}) {
  const have = { ...vars };
  for (;;) {
    try { word(key, have); break; } catch (e) {
      const m = /needs \{([A-Za-z0-9_]+)\}/.exec(String(e && e.message));
      if (!m) throw e;
      have[m[1]] = "\u0000";
    }
  }
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(word(key, have).split("\u0000").map(esc).join("[\\s\\S]*?")).test(String(text));
}
