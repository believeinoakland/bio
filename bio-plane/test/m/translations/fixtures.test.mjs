/* The fixtures this module publishes, each made by its real code (K4990). */
import test from "node:test";
import assert from "node:assert/strict";
import { memberLanguageRead } from "./fixtures.mjs";
import { world as aiAccountsWorld } from "../ai-accounts/fixture.mjs";
import { interfaceWords } from "../../../src/translations/index.mjs";

test("R11 R20 memberLanguageRead answers the real registration and stamp: a first registration is {ok: true}, the stamp of a team with no adoption is the real one, and the instance it hands over registers once and answers PROVIDER_DECLARED the second time; control: the stamp changes after an adoption", async () => {
  const f = memberLanguageRead({ language: "es" });
  assert.deepEqual(f.registered, { ok: true });
  assert.equal(typeof f.words_version, "string");
  assert.equal(f.translations.wordsVersion(), f.words_version);
  assert.deepEqual(f.translations.registerMemberLanguageRead(() => ({ ok: true, language: "es", set_at: null })), { ok: true });
  assert.equal(f.translations.registerMemberLanguageRead(() => ({ ok: true, language: "es", set_at: null })).reason, "PROVIDER_DECLARED");
  /* control: the stamp is not a constant (an adoption changes it, R20) */
  const c = aiAccountsWorld();
  await c.group("ruth");
  const w = memberLanguageRead({ more: { membership: c.m, aiAccounts: c.a } }).translations;
  const before = w.wordsVersion();
  const ordinary = interfaceWords().find((x) => !x.protected && !/\{/.test(x.en));
  w.translationGrant({ member: "ruth", language: "es", by: "admin" });
  const adopted = w.translationAdopt({ language: "es", key: ordinary.key, text: "Algo", by: "ruth" });
  assert.equal(adopted.ok, true);
  assert.notEqual(w.wordsVersion(), before);
});

/* Fix round 10 (K5217): `interfacewords` (R8, R19, op=interfacewords) is the words answer the interface shell reads at every sign-in; its frame
   tests take this published answer for a member in the default language and one in another. Each answer is the real route's
   (`frame` over `translations/index.mjs`'s op table), made over a fresh world each call. */
test("R8 R19 interfaceWordsAnswer answers the real op: a member in the default language holds no word (the shell's English), a member in another language holds the one word the team shows in it with the English beside it; each call is a fresh world, not a stored answer; control: a second call's answer is an equal, separate object", async () => {
  const { interfaceWordsAnswer } = await import("./fixtures.mjs");
  const { interfaceWords } = await import("../../../src/translations/index.mjs");
  const a = await interfaceWordsAnswer({ language: "es" });
  const ordinary = interfaceWords().find((x) => !x.protected && !/\{/.test(x.en));
  assert.deepEqual(a.default, { ok: true, language: null, words_version: a.default.words_version, words: [] });
  assert.equal(typeof a.default.words_version, "string");
  assert.equal(a.other.ok, true);
  assert.equal(a.other.language, "es");
  assert.equal(a.other.words_version === a.default.words_version, false, "the adoption moves the stamp (R20)");
  assert.deepEqual(a.other.words, [{ key: ordinary.key, text: "Algo", en: ordinary.en, fallback: false }]);
  const b = await interfaceWordsAnswer({ language: "es" });
  assert.deepEqual(b, a, "an equal answer on a second call");
  assert.notEqual(b, a, "a separate object: nothing is stored");
});
