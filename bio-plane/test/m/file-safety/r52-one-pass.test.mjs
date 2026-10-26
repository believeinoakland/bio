/* file-safety R52 (fix round 7 G84; K4753; `plane` R43): importing the module passes over `setup-words`' `WORD_ROWS` at most once, and
   `WORD_KEYS` is unchanged in content and order. The old recipe read the table once per key (`designRow`), which the plane's start-up
   budget paid for; the reference below is that recipe, kept here as the one to match. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { WORD_ROWS } from "../../../src/setup-words/index.mjs";
import { WORD_KEYS, FILE_SAFETY_CHECKS, SENTENCE_KEYS } from "../../../src/file-safety/index.mjs";
import { rowKey } from "../../../src/file-safety/words.mjs";

const CHILD = fileURLToPath(new URL("./r52-child.mjs", import.meta.url));

test("R52 importing file-safety passes over WORD_ROWS at most once (counted in a child process that loads the module with the passes wrapped)", () => {
  const { passes } = JSON.parse(execFileSync(process.execPath, [CHILD], { encoding: "utf8" }));
  assert.ok(passes <= 1, `${passes} passes over WORD_ROWS while file-safety loaded; at most one is allowed`);
});

test("R52 WORD_KEYS keeps the old computation's content and order over the real word table (the reference is the per-key recipe)", () => {
  const designRow = (key) => WORD_ROWS.some((r) => r[0] === key && r[5] === "design");
  const reference = [...Object.keys(FILE_SAFETY_CHECKS).map(rowKey).filter(designRow), ...SENTENCE_KEYS];
  assert.ok(reference.length > 0);
  assert.deepEqual([...WORD_KEYS], reference);
});
