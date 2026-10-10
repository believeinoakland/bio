# setup-words (T41)

**Status** · session_01NKnQg9VJvQoZDWfwkYYHF4 · depth 2 · WORKING · handled B1

## Completion

**Read:** the reading set whole, as START measured it (139 KB): `build/requirements/setup-words.md`, my plan entry T41-56, K2435, K2484 and K2514 in `build/rulings.md`, the layer-11 contract in `build/layers.md`, the T39 record's generator, the module and its test. Uses: none.
**Entries applied:** T41-56 (DEC-188; U142; K2484). `bio-plane/src/setup-words/index.mjs` regenerated with the generator below (T39's, its header now naming this record) over `git show 3660c18803:docs/development/ux-substrate/screens/words.json`: `WORDS_COMMIT` `"3660c18803"`, 1,006 rows, 388 protected (the file's `counts` agree), in the file's order.
**R2 as built (as START asks me to say):** I built R2 as applied by K2484: the file's rows for the retired acts are carried as the file gives them, not re-pointed. At 3660c18803 the file holds four of them, all `.does` rows (`act.accountswitchset.does`, `act.groupswitchset.does`, `act.aiceilingset.does`, `act.aicopyceilingset.does`). Their `label.*` rows are gone from the file, and its new `act.owed_accountusesset.*` and `act.owed_ailimitset.*` rows take their place. So the plan entry's "re-pointed to `accountusesset`" and B1's K2514 note (old rows :213, :253, :467, :500, re-point to `ailimitset`) are met by the file itself: those label rows no longer exist, and what is left is carried as given. Re-keying the four `.does` rows is the design stream's (NOTICE; K2484).
**Tests:** `bio-plane/test/m/setup-words/word-list.test.mjs`: `R1 R2`, the file at 3660c18803 word by word, using a failure-listing check (`r1Failures`); `R1 negative control`, which shows the check refusing a list with one word changed, two rows swapped, a row dropped or duplicated, a note or means nulled, a protected mark flipped, or the list at e08cd35ecb; `R2`, the commit plus the four retired-act rows carried as given, with negative controls (one re-keyed to `accountusesset`, one dropped, one re-worded); `R3`; `R4`. 5 pass, 0 fail. Negative control on the module: the e08cd35ecb file in place fails 3 of the 5 (R1 R2, R2 and the R1 negative control) and passes R3 and R4.
**Users' tests (I changed the list I provide):** `instance-setup` 129 pass, 1 fail. `translations.test.mjs:469` (R74) expects `counts` `{ missing: 919, … }`, which is 921 minus 2. With the new list it is 1,004 (1,006 minus 2). That test is instance-setup's (T41-57, later in this layer), so I reported it and did not edit it. On the tranche before my change: 130 pass.
**Checks** (process repo): format 0 failures; architecture 0 failures; coverage 4 of 4, 0 failures; ownership 0 failures.
**Found elsewhere (REPORT J2):** (1) instance-setup's `translations.test.mjs:469` count, above. (2) Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` take this module as an input (owner `not_product`; regenerated at layer close).
**Deferred:** none.
**Final `uses`:** none (`[]`).

**The word list's generator** (run from the repository root: `git show 3660c18803:docs/development/ux-substrate/screens/words.json > words.json; node gen-words.mjs words.json 3660c18803 bio-plane/src/setup-words/index.mjs`):

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
   list and each row are frozen (R3). Written by the generator recorded in build/jobs/T41/setup-words.md;
   bio-plane/test/m/setup-words/word-list.test.mjs checks it word by word. */
export const WORDS_COMMIT = ${JSON.stringify(commit)};
export const WORD_ROWS = Object.freeze([
${lines.join("\n")}
].map((row) => Object.freeze(row)));
`);
```

Size (session_01NKnQg9VJvQoZDWfwkYYHF4): test runs 6, module lines 1015

## J1 · REPORT

Found in other modules, from T41-56: (1) instance-setup bio-plane/test/m/instance-setup/translations.test.mjs:469 (R74) asserts counts { missing: 919, shown: 1, awaiting: 1 }. That is the old list's 921 minus 2. With setup-words at 3660c18803 (1,006 words) it reads 1,004. Result: instance-setup 129 pass, 1 fail (130 pass on the tranche before my change). It is instance-setup's test, for its T41-57 job. (2) Generated artifact made stale: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (owner not_product) take setup-words as an input; it is regenerated at layer close.
