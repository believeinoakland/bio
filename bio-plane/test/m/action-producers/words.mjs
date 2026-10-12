/* action-producers' words, read by key from the design stream's list (`docs/development/ux-substrate/screens/words.json`;
   DEC-194, R23): `WORD(key)` is the key's `en` exactly, and a key the list lacks throws, so the test fails. */
import { readFileSync } from "node:fs";

const LIST = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words.json", import.meta.url), "utf8"));
const BY_KEY = new Map(LIST.words.map((w) => [w.key, w.en]));

export function WORD(key) {
  if (!BY_KEY.has(key)) throw new Error(`words.json holds no word ${key}`);
  return BY_KEY.get(key);
}

/** A key's words with its `{placeholders}` filled, as the module fills them. */
export function FILLED(key, fills = {}) {
  return WORD(key).replace(/\{([a-z_]+)\}/g, (_, k) => (fills[k] === null || fills[k] === undefined ? "" : String(fills[k])));
}
