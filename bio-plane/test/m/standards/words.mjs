/* standards' words, read by key from the design stream's list (`docs/development/ux-substrate/screens/words.json`;
   DEC-194, R55): `WORD(key)` is the key's `en` exactly, and a key the list lacks throws, so the test fails. `HAS(key)`
   says whether the list holds the key. */
import { readFileSync } from "node:fs";

const LIST = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
const BY_KEY = new Map(LIST.words.map((w) => [w.key, w.en]));

export function WORD(key) {
  if (!BY_KEY.has(key)) throw new Error(`words.json holds no word ${key}`);
  return BY_KEY.get(key);
}
export const HAS = (key) => BY_KEY.has(key);
