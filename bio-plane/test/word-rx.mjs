// A regex for the text of a word key with no placeholder: tests assert the word, never the English (K5313).
import { word } from "../src/setup-words/index.mjs";
export const wordRx = (key, flags = "") => new RegExp(word(key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
