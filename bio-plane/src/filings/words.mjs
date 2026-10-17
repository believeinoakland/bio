/* filings — the words it reads (requirements: `build/requirements/filings.md`, R51, R52; T50, N1116, N1132; DEC-258, DEC-259,
 * DEC-260). This module holds no member-facing English: every sentence it prepares or answers is the words
 * `words.json` holds for a key, read through setup-words' `word(key, vars)` (layer 1). This file is that one door, so the
 * keys read can be told (`wordsRead`) and compared with the `reads` list `words-reads.json` holds for this module. It adds
 * nothing to the words: it keeps no state of its own but the set of keys read, and does no I/O. */

import { word as read } from "../setup-words/index.mjs";

const READ = new Set();

/** The English of `key`, each `{name}` filled from `vars` (setup-words R11): the key is recorded as read. */
export function word(key, vars = {}) {
  const out = read(key, vars);
  READ.add(key);
  return out;
}

/** The keys this module has read in this process, sorted: what a test compares with the design's `reads` for it. */
export const wordsRead = () => [...READ].sort();

/** The keys it reads that `words-reads.json` does not list for it yet (the design lane lists them once it has them):
 *  R61's and R63's stake words, the design's DEC-231 keys for what travels with a stake. */
export const WORDS_OWED = Object.freeze(["stake.inmatter", "stake.source.action", "stake.source.project", "stake.unreadable",
                                              "state.undetermined"]);
