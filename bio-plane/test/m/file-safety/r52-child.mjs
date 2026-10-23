/* file-safety R52 (fix round 7 G84; K4753): the child that loads the module with the passes over `WORD_ROWS` counted. It wraps
   the array methods and the iterator before `file-safety` is imported, counts each call whose `this` is `WORD_ROWS` (the table is
   frozen, so identity is the test), then prints the count as JSON. Run by `r52-one-pass.test.mjs` in its own process, so no
   other test's loads are counted. */
import { WORD_ROWS, hasWord } from "../../../src/setup-words/index.mjs";

/* setup-words builds its key table once, on its first lookup, by one pass of its own; that is paid whatever file-safety does, so
   the first lookup is made before the count starts and the count is of file-safety's load alone. */
hasWord("weight.reversible.name");
let passes = 0;
const counted = (name, original) => function (...args) {
  if (this === WORD_ROWS) passes += 1;
  return original.apply(this, args);
};
for (const name of ["some", "filter", "map", "find", "findIndex", "forEach", "every", "reduce", "includes", "indexOf", "entries", "keys", "values"]) {
  Array.prototype[name] = counted(name, Array.prototype[name]);
}
Array.prototype[Symbol.iterator] = counted("Symbol.iterator", Array.prototype[Symbol.iterator]);

await import("../../../src/file-safety/index.mjs");
process.stdout.write(JSON.stringify({ passes }));
