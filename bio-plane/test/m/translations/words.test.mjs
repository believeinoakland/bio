/* translations' words (R17, R15; DEC-329 (2), (8); setup-words R11–R13): a word not drafted is answered as a word key with
   its fills, read by the screen through `word`; the module's keys are the design stream's declared list for it. */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { boot } from "./fixture.mjs";
import { world as aiAccountsWorld } from "../ai-accounts/fixture.mjs";
import { word, hasWord } from "../../../src/setup-words/index.mjs";
import { interfaceWords, TRANSLATION_TEXT_MAX } from "../../../src/translations/index.mjs";
import { keysRead } from "../../../src/translations/words.mjs";

const READS = JSON.parse(readFileSync(new URL("../../../../docs/development/ux-substrate/screens/words-reads.json", import.meta.url), "utf8"))
  .modules.translations.reads;

test("R17 a draft hand-back answers not_drafted as {key, why} with why a word key and its fills, in order: left out, two lines, a differing placeholder, and a word both missing and named by the hand-back; word(why.key, why.vars) is a non-empty string for each and no why is a string; control: a draft passing every check is drafted", async () => {
  const c = aiAccountsWorld();
  await c.group("ruth", "sam", "tom");
  const w = boot({ more: { membership: c.m, aiAccounts: c.a } });
  w.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  const plain = interfaceWords().filter((x) => !/\{/.test(x.en) && !x.protected);
  const withPlaceholder = interfaceWords().find((x) => /\{[a-z]+\}/.test(x.en));
  const [good, leftOut, twoLines, reported] = [plain[0], plain[1], plain[2], plain[3]];
  const keys = [good.key, leftOut.key, twoLines.key, withPlaceholder.key, reported.key];
  const asked = w.m.translationDraft({ language: "es", direction: "to_language", keys, by: "ruth" });
  const rec = await w.m.translationDraftRecord({ language: "es", direction: "to_language", keys, words: asked.words, by: "ruth",
    draft: { words: [{ key: good.key, text: `ES ${good.en}` }, { key: twoLines.key, text: "one\ntwo" },
                     { key: withPlaceholder.key, text: "ES with no placeholder" }] },
    not_drafted: [reported.key] });
  assert.equal(rec.ok, true);
  assert.deepEqual(rec.drafted.map((d) => d.key), [good.key]);
  const byKey = new Map(rec.not_drafted.map((d) => [d.key, d.why]));
  assert.deepEqual(rec.not_drafted.map((d) => d.key), [leftOut.key, twoLines.key, withPlaceholder.key, reported.key]);
  assert.deepEqual(byKey.get(leftOut.key), { key: "translations.not_drafted.not_answered", vars: {} });
  assert.deepEqual(byKey.get(twoLines.key), { key: "translations.not_drafted.not_one_line", vars: { max: TRANSLATION_TEXT_MAX } });
  assert.deepEqual(byKey.get(withPlaceholder.key), { key: "translations.not_drafted.placeholders_differ", vars: {} });
  assert.deepEqual(byKey.get(reported.key), { key: "setup.why.assistant_draft", vars: {} });
  for (const x of rec.not_drafted) {
    assert.equal(typeof x.why, "object");
    const said = word(x.why.key, x.why.vars);
    assert.equal(typeof said, "string");
    assert.ok(said.length > 0);
  }
  assert.ok(word("translations.not_drafted.not_one_line", { max: 7 }).includes("7"), "the fill reaches the sentence");
});

test("R17 R15 every key this module's source names is a word of the list and in the translations reads list of the design's declaration", () => {
  const named = keysRead();
  assert.ok(named.size > 0);
  for (const k of named) {
    assert.equal(hasWord(k), true, `${k} is a word`);
    assert.ok(READS.includes(k), `${k} is declared in the translations reads list`);
  }
  /* control: the three not_drafted keys are among those the source names */
  for (const k of ["not_answered", "not_one_line", "placeholders_differ"].map((s) => `translations.not_drafted.${s}`))
    assert.ok(named.has(k), k);
});
