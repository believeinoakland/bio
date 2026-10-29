/* extraction's words, read by key from the design stream's list (`docs/development/ux-substrate/screens/words.json`;
   DEC-190, R27, R47, R71): `WORD(key)` is the key's `en` exactly, and a key the list lacks throws, so the test fails. */
import { readFileSync } from "node:fs";
import { word } from "../../../src/setup-words/index.mjs";

const LIST = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
const BY_KEY = new Map(LIST.words.map((w) => [w.key, w.en]));

export function WORD(key) {
  if (!BY_KEY.has(key)) throw new Error(`words.json holds no word ${key}`);
  return BY_KEY.get(key);
}

/** A regex for the text of the word `key` with each of `holes` (the names of its placeholders) matching any text: the sentence as the product reads it from its key, never
 *  a copy of it (K5313). */
export function wordHolesRx(key, holes = [], flags = "", fixed = {}) {
  const vars = { ...fixed, ...Object.fromEntries(holes.map((n, i) => [n, `\u0000${i}\u0000`])) };
  const src = word(key, vars).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\u0000\d+\u0000/g, "[\\s\\S]*?");
  return new RegExp(src, flags);
}
