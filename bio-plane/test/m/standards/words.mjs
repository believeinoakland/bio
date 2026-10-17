/* standards' words in tests, read by key through `setup-words` (R59; N1132): `WORD(key, vars)` is `word`, so a test holds a
   key and never a sentence, and a key the list lacks throws. `HAS(key)` is `hasWord`. */
import { word, hasWord } from "../../../src/setup-words/index.mjs";

export const WORD = (key, vars) => word(key, vars);
export const HAS = (key) => hasWord(key);
