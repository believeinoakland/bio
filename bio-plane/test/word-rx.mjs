// A regex for the text of a word key with no placeholder: tests assert the word, never the English (K5313).
import { word } from "../src/setup-words/index.mjs";
export const wordRx = (key, flags = "") => new RegExp(word(key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
// The same for a word with placeholders: the text `word(key, vars)` gives, filled as the product fills it (K5313).
export const wordTextRx = (key, vars = {}, flags = "") => new RegExp(word(key, vars).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
