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
