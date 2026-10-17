/* run-rules T50-70 (N1169; K3501 (C2); K3637): R35, a `level-empty` finding holds only over a scope with a document in it.
   `levelEmptyHolds({scope})`, and C-22.31's row read by key from `words.json`. Each refusal has its negative control beside
   it (K874). */
import test from "node:test";
import assert from "node:assert/strict";
import { levelEmptyHolds, AI_RUN_CHECKS, AI_RUN_OWN_CHECKS, RUN_RULES_WORDS, RETIRED_CHECKS, translationOf }
  from "../../../src/run-rules/index.mjs";
import { WORD } from "./words.mjs";

const KEY = "refusal.LEVEL_EMPTY_NO_DOCUMENT_IN_SCOPE";
const CODE = "LEVEL_EMPTY_NO_DOCUMENT_IN_SCOPE";

/** The verdict a scope that does not hold gets: R35's row, nothing more. */
const NOT_HOLDING = () => ({ holds: false, code: CODE, check: "C-22.31", translation: WORD(KEY) });

test("R35: levelEmptyHolds({scope}) is true exactly when scope.documents is a whole number of 1 or more", () => {
  for (const documents of [1, 2, 3, 40, 1e6, Number.MAX_SAFE_INTEGER])
    assert.equal(levelEmptyHolds({ scope: { documents } }), true, String(documents));
  /* a scope stating more than its documents still holds: only `documents` is read */
  assert.equal(levelEmptyHolds({ scope: { documents: 3, levels: { content: 3 }, note: "x" } }), true);
});

test("R35: a scope with no document in it does not hold: documents 0 gives the row (C-22.31, the code, the translation read by key)", () => {
  assert.deepEqual(levelEmptyHolds({ scope: { documents: 0 } }), NOT_HOLDING());
  /* the row's fields are the whole answer: holds false, code, check, translation */
  assert.deepEqual(Object.keys(levelEmptyHolds({ scope: { documents: 0 } })), ["holds", "code", "check", "translation"]);
  /* control: one document holds, so the refusal is the count's and nothing else's */
  assert.equal(levelEmptyHolds({ scope: { documents: 1 } }), true);
});

test("R35: a scope that is absent, not an object, or states no whole `documents` does not hold (fail closed): {} and null give the row", () => {
  const cases = [
    [{ scope: {} }, "an empty scope"], [{ scope: null }, "a null scope"], [{}, "no scope"], [undefined, "no argument"],
    [null, "a null argument"], [3, "a number for the argument"], ["x", "a string for the argument"], [[], "an array for the argument"],
    [{ scope: undefined }, "an undefined scope"], [{ scope: 3 }, "a number for the scope"], [{ scope: "3" }, "a string for the scope"],
    [{ scope: true }, "a boolean for the scope"], [{ scope: [] }, "an array for the scope"], [{ scope: [3] }, "an array holding a number"],
    [{ scope: { documents: null } }, "documents null"], [{ scope: { documents: undefined } }, "documents undefined"],
    [{ scope: { documents: "3" } }, "documents a string that looks like a number"], [{ scope: { documents: true } }, "documents true"],
    [{ scope: { documents: [3] } }, "documents a list"], [{ scope: { documents: { n: 3 } } }, "documents an object"],
    [{ scope: { documents: -1 } }, "documents negative"], [{ scope: { documents: 0.5 } }, "documents a fraction below one"],
    [{ scope: { documents: 1.5 } }, "documents a fraction above one"], [{ scope: { documents: NaN } }, "documents NaN"],
    [{ scope: { documents: Infinity } }, "documents infinite"], [{ scope: { documents: 2 ** 60 } }, "documents beyond a safe whole number"],
    [{ scope: { levels: { content: 3 } } }, "a scope that states other things and no documents"],
    [{ scope: { count: 3, docs: 3, document: 3 } }, "documents spelled another way"],
  ];
  for (const [asked, why] of cases) assert.deepEqual(levelEmptyHolds(asked), NOT_HOLDING(), why);
  /* a `documents` the scope only inherits is not one it states */
  assert.deepEqual(levelEmptyHolds({ scope: Object.create({ documents: 3 }) }), NOT_HOLDING(), "inherited documents");
  assert.deepEqual(levelEmptyHolds(Object.create({ scope: { documents: 3 } })), NOT_HOLDING(), "inherited scope");
  /* never throws, even on a hostile getter or a proxy */
  const hostile = { get scope() { throw new Error("boom"); } };
  assert.deepEqual(levelEmptyHolds(hostile), NOT_HOLDING(), "a throwing getter on the argument");
  assert.deepEqual(levelEmptyHolds({ scope: { get documents() { throw new Error("boom"); } } }), NOT_HOLDING(), "a throwing getter on the scope");
  assert.deepEqual(levelEmptyHolds(new Proxy({}, { has() { throw new Error("boom"); }, getOwnPropertyDescriptor() { throw new Error("boom"); } })),
                   NOT_HOLDING(), "a proxy that throws");
});

test("R35: the answer for a scope that does not hold is the table's row: C-22.31 in R11's table, read by key, with the number, code and key one condition; translationOf answers it", () => {
  const row = AI_RUN_OWN_CHECKS[CODE];
  assert.deepEqual(Object.keys(row).sort(), ["check", "translation", "where"]);
  assert.equal(row.check, "C-22.31");
  assert.match(row.where, /^src\/run-rules\/rules\.mjs levelEmptyHolds, /);
  assert.equal(AI_RUN_CHECKS[CODE], row, "in AI_RUN_CHECKS");
  /* the translation is the list's word, verbatim, read by key (RUN_RULES_WORDS), never a copy */
  assert.equal(RUN_RULES_WORDS[KEY], WORD(KEY));
  assert.equal(row.translation, WORD(KEY));
  assert.equal(translationOf(CODE), WORD(KEY));
  const r = levelEmptyHolds({ scope: { documents: 0 } });
  assert.deepEqual([r.code, r.check, r.translation], [CODE, row.check, row.translation]);
  /* the statement: a level with no document in scope was not looked at, so no absence is written for it */
  assert.match(row.translation, /no document there was in scope, so none was looked at/);
  assert.match(row.translation, /^Nothing is recorded as missing at this level/);
  assert.match(row.translation, /Nothing was written\.$/);
  /* "team", never "group", in text people read (D29) */
  assert.doesNotMatch(row.translation, /\bgroups?\b/i);
  /* one condition per number; the next free after R32's C-22.30; no retired number reused */
  const numbers = Object.values(AI_RUN_CHECKS).map((x) => x.check);
  assert.equal(numbers.filter((n) => n === "C-22.31").length, 1);
  assert.equal(AI_RUN_CHECKS.MEMBER_RUN_MODE_NOT_ADMITTED.check, "C-22.30");
  for (const x of Object.values(RETIRED_CHECKS)) assert.notEqual(x.check, "C-22.31");
  /* controls: a word the list lacks fails loudly, and the rows beside it are different conditions */
  assert.throws(() => WORD(`${KEY}_X`), /holds no word/);
  assert.notEqual(row.translation, AI_RUN_OWN_CHECKS.MEMBER_RUN_MODE_NOT_ADMITTED.translation);
  assert.notEqual(row.translation, AI_RUN_OWN_CHECKS.AI_PART_NOT_DEPLOYED.translation);
});

test("R35: the verdict carries no `ok` and no cause beyond the row, and a holding scope returns the bare `true` (the caller's `=== true` is the whole test)", () => {
  const no = levelEmptyHolds({ scope: { documents: 0 } });
  assert.equal(no.holds, false);
  assert.equal("ok" in no, false);
  assert.equal(levelEmptyHolds({ scope: { documents: 2 } }), true);
  assert.notEqual(no, true);
  /* the answers do not alias: a caller changing one cannot change the next */
  no.translation = "changed";
  assert.equal(levelEmptyHolds({ scope: { documents: 0 } }).translation, WORD(KEY));
});
