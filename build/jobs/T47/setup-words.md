# setup-words (T47)

**Status** · session_01TNymwpyzHCE7zgbShSt1pQ · depth 2 · WORKING · handled B1


## Completion

**Read, whole** (P20): `build/requirements/setup-words.md`; my entry T47-52 in `build/plan/current.md` and B1; the layer-11 row of `build/layers.md`; the passages of `draft-T47-L11-fold.md`, `draft-T47-interface.md` and `draft-T47-wayin.md` naming this module; the T46 record's generator; my test whole; my module's header and code (its data rows are generated and were replaced whole; I read the new rows through the diff and checked them word by word with the test). Uses: none. No flaw found in the module or its test beyond the move below.
**Entry applied:** T47-52 (N992; DEC-198, DEC-199; K3062, K3137; R6, R7). `bio-plane/src/setup-words/index.mjs` regenerated with the generator below over `git show 6f0d88d8d5:docs/development/ux-substrate/screens/words.json`, the merge of PR #33's head `f90b187c7b` into `tranche/T47` at L11's START (K3127; the file there is byte-for-byte the file at that head and unchanged on the tranche since): `WORDS_COMMIT` `"6f0d88d8d5"`, **1,788 rows, 651 protected** (the file's own `counts` agree; keys distinct). R7's text quotes 1,749 / 631, which are the file at PR #33 @ `1d41495eda`; I took B1's "count them there" (J1 QUESTION, my reading; the requirement's counts are BOB's to correct). The header now names R1–R3, R5–R7 and this record.
**R6 as built (under R7):** R6's 18 dropped keys are in neither the file at the merge nor `WORD_ROWS`; each of the seven served names DEC-198 (1) re-keyed to carries its `.does`; `handle.*` is now seven rows, carried as given; DEC-188 (8)'s four retired acts still have no rows. Between R6's list (`a0fab7abf0`, 1,608) and the merge, 185 keys are new and 5 left (`act.hostingaccess.label.setup`, `act.hostingaccess.does`, `act.strengthbarset.label.project`, `act.owed_projectaikeepaway.label.projectai`, `act.owed_projectaikeepaway.does`), none of them among R6's 123 new.
**Tests** (`bio-plane/test/m/setup-words/word-list.test.mjs`; each new id named explicitly, K874): `R1 R5 R6 R7` the file at 6f0d88d8d5 word by word, sibling rule stated independently; `R1 R5 R6 R7 negative control` (one word, order, a count, a note, a means, a protected mark, and the lists at a0fab7abf0, 3f40899950, 3660c18803, e08cd35ecb each refused); `R2 R5 R6 R7` the commit, `handle.*`'s seven as given, retired acts absent, with controls; new `R6` (the 18 keys gone from file and list, the served names' `.does` present, R6's commit and counts moved; control: one of the 18 brought back refuses); new `R7` (WORDS_COMMIT is the merge whose second parent is f90b187c7b and the file there is that head's; 1,788 / 651; control: the list at 1d41495eda refuses); `R3`; `R4`. **7 pass, 0 fail.** Negative control on the module: the T46 list in place fails 5 of 7, passes R4 and the controls' test.
**Users' tests** (`instance-setup`, `interface-shell` and the screens modules with tests): instance-setup 157 pass 0 fail; interface-shell 63/0; screens-settings 47/4 (0 fail with the T46 list); screens-intake 40/2 (0 before); screens-daily 44/1 (0 before); screens-inquiry 44/2 (1 before: its R5 "each screen draws exactly its registry acts", inherited). The new reds are those modules' own code meeting the new list, theirs to adapt in their L11 jobs (they merge after this one): see J3.
**Checks** (process repo): format 0 failures; architecture 0 failures; coverage 7 of 7, 0 failures; ownership 0 failures; `run.mjs` over the product: format 0, architecture 0 (none in my files), channels 0, coverage 24 failures product-wide, none in setup-words.
**Found elsewhere (REPORT J3):** the users' reds above; the requirements file's R7 counts (J1); R6 and R7 remain marked *(not yet met: T47)*, now met. Generated artifact made stale: the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json`, not_product) takes this module as an input.
**Deferred:** none.
**Final `uses`:** none (`[]`).

**The word list's generator** (T46's, header now naming R5–R7 and this record; run from the repository root: `git show 6f0d88d8d5:docs/development/ux-substrate/screens/words.json > words.json; node gen-words.mjs words.json 6f0d88d8d5 bio-plane/src/setup-words/index.mjs`):

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
writeFileSync(out, `/* GENERATED: do not edit by hand. setup-words R1–R3, R5–R7 (DEC-179; K2200 (4)): the interface's word list,
   docs/development/ux-substrate/screens/words.json at ${commit} (${words.length} words, ${words.filter((w) => w.protected === true).length} protected), each
   [key, en, note, means, protected]: key, en, note (or null) and protected as the file gives them, means the en of the
   word's sibling .means or .does entry (the nearest dotted prefix of at least two segments holding one), or null. The
   list and each row are frozen (R3). Written by the generator recorded in build/jobs/T47/setup-words.md;
   bio-plane/test/m/setup-words/word-list.test.mjs checks it word by word. */
export const WORDS_COMMIT = ${JSON.stringify(commit)};
export const WORD_ROWS = Object.freeze([
${lines.join("\n")}
].map((row) => Object.freeze(row)));
`);
```

Size (session_01TNymwpyzHCE7zgbShSt1pQ): test runs 18, module lines 1797

## J1 · QUESTION

R7's counts. R7 binds WORD_ROWS to words.json as merged into tranche/T47 at L11's START (K3127), WORDS_COMMIT that merge's commit, 'its counts as read there (1,749 rows, 631 protected at PR #33 @ 1d41495eda; K3137)'. At the merge 6f0d88d8d5 (PR #33's head f90b187c7b, DEC-200–DEC-217) the file holds 1,788 words, 651 protected (its own counts agree; keys distinct); 1,749/631 are the file at 1d41495eda. words.json is unchanged on tranche/T47 since 6f0d88d8d5. My reading, per your B1 note ('count them there'): WORDS_COMMIT "6f0d88d8d5", 1,788 rows, 651 protected, and the requirement's parenthetical counts are a stale read for you to correct. I am building on that reading; answer only if it is wrong.
