# setup-words (T46)

**Status** · session_01CG8p9bVJ7PuMGv4UzWE2jr · depth 2 · COMPLETE · handled B0

## Completion

**Read, whole** (P20): the reading set as B1 measured it: `build/requirements/setup-words.md`, my entry T46-49 in `build/plan/current.md`, `build/plan/draft-T46-interface.md` §5 (I2) and the passages naming this module, the layer-11 row of `build/layers.md`, the T41 record's generator, my module and its test whole. Uses: none. No flaw found in the module or its test beyond the move below.
**Entry applied:** T46-49 (N897; DEC-179; R5). `bio-plane/src/setup-words/index.mjs` regenerated with the generator below over `git show 3f40899950:docs/development/ux-substrate/screens/words.json`: `WORDS_COMMIT` `"3f40899950"`, 1,503 rows, 549 protected, in the file's order, keys distinct (the file's `counts` agree). The header now names R5 and this record.
**R2/R5 as built:** at 3f40899950 the file holds no rows for DEC-188 (8)'s four retired acts (`act.accountswitchset.*` etc.), so none are in the list; the nine `handle.*` rows (K2903) are carried as the file gives them, not re-keyed.
**Tests** (`bio-plane/test/m/setup-words/word-list.test.mjs`, moved to the new commit, each new id named explicitly, K874): `R1 R5` the file at 3f40899950 word by word with the sibling rule stated independently; `R1 R5 negative control` (one word, order, a count, a note, a means, a protected mark, and the lists at 3660c18803 and e08cd35ecb each refused); `R2 R5` the commit, the `handle.*` rows as given and the retired acts absent, with controls (re-keyed, dropped, re-worded, a retired act's row brought back); `R3`; `R4`. 5 pass, 0 fail. Negative control on the module: the T41 list in place fails 3 of 5 (R1 R5, R2 R5, R3's length) and passes 2.
**Users' tests:** `instance-setup` 147 pass, 0 fail; `setup-page` 83 pass, 0 fail.
**Checks** (process repo): format 0 failures; architecture 0 failures; coverage 5 of 5, 0 failures; ownership 0 failures; `run.mjs` over the product: format 0, architecture 0 (none in my files), channels 0, coverage 15 failures product-wide, none in setup-words.
**Found elsewhere (REPORT J1):** (1) the requirements file is BOB's: R5 still carries `*(not yet met: T46)*` and R1's and R2's text still state 1,006 / 388 / `3660c18803` (R5 amends them); now met. (2) Generated artifact made stale: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`, not_product) takes this module as an input.
**Deferred:** none.
**Final `uses`:** none (`[]`).

**The word list's generator** (T41's, header now naming R5 and this record; run from the repository root: `git show 3f40899950:docs/development/ux-substrate/screens/words.json > words.json; node gen-words.mjs words.json 3f40899950 bio-plane/src/setup-words/index.mjs`):

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
writeFileSync(out, `/* GENERATED: do not edit by hand. setup-words R1–R3, R5 (DEC-179; K2200 (4)): the interface's word list,
   docs/development/ux-substrate/screens/words.json at ${commit} (${words.length} words, ${words.filter((w) => w.protected === true).length} protected), each
   [key, en, note, means, protected]: key, en, note (or null) and protected as the file gives them, means the en of the
   word's sibling .means or .does entry (the nearest dotted prefix of at least two segments holding one), or null. The
   list and each row are frozen (R3). Written by the generator recorded in build/jobs/T46/setup-words.md;
   bio-plane/test/m/setup-words/word-list.test.mjs checks it word by word. */
export const WORDS_COMMIT = ${JSON.stringify(commit)};
export const WORD_ROWS = Object.freeze([
${lines.join("\n")}
].map((row) => Object.freeze(row)));
`);
```

Size (session_01CG8p9bVJ7PuMGv4UzWE2jr): test runs 4, module lines 1512

## J1 · REPORT

From T46-49: (1) build/requirements/setup-words.md (BOB's): R5 is now met but still marked *(not yet met: T46)*, and R1's and R2's own text still states 1,006 rows / 388 protected / 3660c18803, which R5 amends to 1,503 / 549 / 3f40899950. (2) Generated artifact made stale: the plane bundle (bio-plane/dist/bio-plane.bundled.mjs and .bundle.json, not_product) takes setup-words as an input.

## J2 · COMPLETE

T46-49 applied: WORD_ROWS re-taken from words.json @ 3f40899950 (1,503 rows, 549 protected), WORDS_COMMIT "3f40899950"; R5 tested explicitly with R1, R2. At this commit DEC-188's four retired-act rows are gone from the file; handle.*'s nine are carried as given. setup-words 5 pass 0 fail (old list in place fails 3); users: instance-setup 147/0, setup-page 83/0. Checks: format, architecture, coverage 5/5, ownership all 0 failures; run.mjs coverage's 15 product-wide failures are none of mine. Uses []. Found elsewhere: J1. Ready to merge (after notice-producers, before instance-setup).
