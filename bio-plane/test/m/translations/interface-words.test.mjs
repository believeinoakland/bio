/* The interface's word list at this module's interface (R2; DEC-179; T39, N807): the list itself is `setup-words`' (its
   R1–R3, checked word by word against words.json in its own tests); this module exports it as `interfaceWords()`, each
   row of `WORD_ROWS` in order as a frozen `{key, en, note, means, protected}`, and `INTERFACE_WORDS_COMMIT` as its
   `WORDS_COMMIT`, holding no copy of its own. */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { interfaceWords, INTERFACE_WORDS_COMMIT } from "../../../src/translations/index.mjs";
import { WORD_ROWS, WORDS_COMMIT } from "../../../src/setup-words/index.mjs";

const SRC = (f) => fileURLToPath(new URL(`../../../src/${f}`, import.meta.url));

test("R2 interfaceWords() is setup-words' WORD_ROWS in its order, each row as a frozen {key, en, note, means, protected}, the list frozen, and INTERFACE_WORDS_COMMIT is its WORDS_COMMIT", () => {
  assert.equal(INTERFACE_WORDS_COMMIT, WORDS_COMMIT);
  assert.equal(interfaceWords().length, WORD_ROWS.length);
  WORD_ROWS.forEach(([key, en, note, means, prot], i) => {
    const w = interfaceWords()[i];
    assert.deepEqual(w, { key, en, note, means, protected: prot }, key);
    assert.deepEqual(Object.keys(w), ["key", "en", "note", "means", "protected"], key);
    assert.ok(Object.isFrozen(w), key);
  });
  assert.ok(Object.isFrozen(interfaceWords()));
  /* frozen: a write changes nothing, and throws in strict mode */
  assert.throws(() => { interfaceWords().push({}); }, TypeError);
  assert.throws(() => { interfaceWords()[0].en = "changed"; }, TypeError);
  assert.equal(interfaceWords()[0].en, WORD_ROWS[0][1]);
});

test("R2 a word keeps its key when its English changes (DEC-179 (3)): every adoption records the English it translated, and a shown word whose recorded English is not the list's answers english_changed: true; control: one whose recorded English is the list's answers false", async () => {
  const { boot } = await import("./fixture.mjs");
  const { world: aiAccountsWorld } = await import("../ai-accounts/fixture.mjs");
  const c = aiAccountsWorld();
  await c.group("ruth");
  const w = boot({ more: { membership: c.m, aiAccounts: c.a } });
  w.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  const [a, b] = interfaceWords().filter((x) => !x.protected && !/\{/.test(x.en));
  assert.equal(w.m.translationAdopt({ language: "es", key: a.key, text: "Uno", by: "ruth" }).ok, true);
  assert.equal(w.m.translationAdopt({ language: "es", key: b.key, text: "Dos", by: "ruth" }).ok, true);
  w.st.db.prepare(`UPDATE translation_adoptions SET en = 'An older English' WHERE key = ?`).run(a.key);
  const words = w.m.translations({ language: "es", viewer: "admin" }).words;
  assert.deepEqual([words.find((x) => x.key === a.key).english_changed, words.find((x) => x.key === b.key).english_changed], [true, false]);
  assert.equal(w.st.db.prepare(`SELECT en FROM translation_adoptions WHERE key = ?`).get(b.key).en, b.en, "the English it translated");
});

/* Fix round 7 G84 (K4753): the plane's top level is budgeted, and `bundler` R31 only warns, so this bounds load-time work for
   this module: a child process counts every call of an array iteration method (and of the array iterator) on `WORD_ROWS` made
   from this module's files (`record-grammar` builds `setup-words`' own key table at its load, a pass that is not ours), imports the module, and finds none; the word list is then built once, at the first call. */
test("R2 importing the module does no pass over the word list: a child process counting every iteration of WORD_ROWS finds none at import, and interfaceWords() builds the list at its first call only", () => {
  const child = `
    const { WORD_ROWS } = await import(${JSON.stringify(SRC("setup-words/index.mjs"))});
    let n = 0;
    const count = (name) => {
      const orig = Array.prototype[name];
      Object.defineProperty(Array.prototype, name, { configurable: true, writable: true,
        value: function (...a) { if (this === WORD_ROWS && /src\\/translations\\//.test(new Error().stack)) n++; return orig.apply(this, a); } });
    };
    for (const m of ["map", "filter", "forEach", "some", "every", "find", "findIndex", "reduce", "flatMap", "entries", "keys", "values", "slice", "indexOf", "includes", Symbol.iterator]) count(m);
    const t = await import(${JSON.stringify(SRC("translations/index.mjs"))});
    const atImport = n;
    t.interfaceWords();
    console.log(JSON.stringify({ atImport, afterCall: n }));`;
  const out = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", child], { encoding: "utf8" }).trim().split("\n").pop());
  assert.equal(out.atImport, 0);
  assert.ok(out.afterCall > 0, "control: the counter sees a pass over WORD_ROWS when the list is built");
});

test("R2 interfaceWords() deep-equals the list of the old constant over the real table and answers the same frozen array on every call", () => {
  const old = Object.freeze(WORD_ROWS.map(([key, en, note, means, prot]) => Object.freeze({ key, en, note, means, protected: prot })));
  assert.deepEqual(interfaceWords(), old);
  assert.equal(interfaceWords(), interfaceWords());
  assert.ok(Object.isFrozen(interfaceWords()));
});
