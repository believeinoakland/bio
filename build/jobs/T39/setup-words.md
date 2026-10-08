# setup-words (T39)

**Status** · session_01A2AS5brGMcep6rEBjmj3fa · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T39-16a done: `job/T39/setup-words`, from `tranche/T39` @ 34d506ba7d (merged at start; BOB changed nothing I read since).

**Entries applied:** T39-16a (N807; K2337, K2343, K2375). `bio-plane/src/setup-words/index.mjs` regenerated with the T37 generator (below; changed only in its header and its closing line): data lines 9–929 byte-identical to `bio-plane/src/setup-words.mjs`:8–928 (`diff` empty); header names setup-words R1–R3 and `word-list.test.mjs`; R3 met by `].map((row) => Object.freeze(row)))` after the rows rather than `Object.freeze([...])` around each, so the data lines stay byte-identical as START asks. `bio-plane/src/setup-words.mjs` and `setup.mjs` untouched (T39-16b's). R3's not-yet-met mark can go (yours).
**Tests:** `bio-plane/test/m/setup-words/word-list.test.mjs`, rewritten from `instance-setup/interface-words.test.mjs`:13–55 over `WORD_ROWS`: `R1 R2` (the file from git at e08cd35ecb word by word, counts 921/345, keys distinct, field types, the sibling rule stated independently plus its four examples), `R2` (the commit), `R3` (list and every row frozen; push, index write, length, sort, field writes and row push each throw `TypeError`), `R4` (source with comments and strings set aside holds no `import`/`require`/`from` and no identifier beyond its two frozen exports; namespace exactly `WORDS_COMMIT`, `WORD_ROWS`; a second load answers the same). 4 pass, 0 fail. Negative control: the old file in place of the copy fails R3 only.
**Checks** (process repo): format 0 failures; architecture 0 failures; coverage and ownership fail as expected with `modules.json`'s empty paths (K1043): with paths `bio-plane/src/setup-words/` and tests `bio-plane/test/m/setup-words/` filled in an uncommitted copy, coverage 4 of 4, 0 failures; ownership 3 files, 0 failures. **Please fill those paths and tests in `modules.json`.**
**Deferred:** none. The generator is kept here, not beside the module, so R4 holds for every file under the module's path (a generator there would import `node:fs`).
**Found elsewhere:** nothing new. No generated artifact staled: the new file is imported by nothing yet; the plane bundle's input `src/setup-words.mjs` moves with T39-16b.

**The word list's generator** (run from the repository root: `git show e08cd35ecb:docs/development/ux-substrate/screens/words.json > words.json; node gen-words.mjs words.json e08cd35ecb bio-plane/src/setup-words/index.mjs`):

```js
// Writes bio-plane/src/setup-words/index.mjs from words.json (argv[2]) at commit argv[3].
import { readFileSync, writeFileSync } from "node:fs";
const [, , file, commit, out] = process.argv;
const words = JSON.parse(readFileSync(file, "utf8")).words;
const K = new Map(words.map((w) => [w.key, w]));
const sib = (k) => {
  const s = k.split(".");
  if (/^(means|does)$/.test(s.at(-1))) return null;
  for (let n = s.length - 1; n >= 2; n--) for (const e of ["means", "does"]) {
    const c = `${s.slice(0, n).join(".")}.${e}`;
    if (c !== k && K.has(c)) return K.get(c).en;
  }
  return null;
};
const lines = words.map((w) => `  [${JSON.stringify(w.key)}, ${JSON.stringify(w.en)}, ${JSON.stringify(w.note ?? null)}, ${JSON.stringify(sib(w.key))}, ${w.protected === true}],`);
writeFileSync(out, `/* GENERATED: do not edit by hand. setup-words R1–R3 (DEC-179; K2200 (4)): the interface's word list,
   docs/development/ux-substrate/screens/words.json at ${commit} (${words.length} words, ${words.filter((w) => w.protected === true).length} protected), each
   [key, en, note, means, protected]: key, en, note (or null) and protected as the file gives them, means the en of the
   word's sibling .means or .does entry (the nearest dotted prefix of at least two segments holding one), or null. The
   list and each row are frozen (R3). Written by the generator recorded in build/jobs/T39/setup-words.md;
   bio-plane/test/m/setup-words/word-list.test.mjs checks it word by word. */
export const WORDS_COMMIT = ${JSON.stringify(commit)};
export const WORD_ROWS = Object.freeze([
${lines.join("\n")}
].map((row) => Object.freeze(row)));
`);
```

Size (session_01A2AS5brGMcep6rEBjmj3fa): test runs 2, module lines 930
