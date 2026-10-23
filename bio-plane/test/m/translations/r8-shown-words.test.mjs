/* Fix round 8 (K4817): G113 `interfacewords` answers the shown words alone unless a language is named (R19, amending R8),
   and G114's provider half, the adoptions stamp `wordsVersion()` (R20). The module over the real record-core, membership
   and ai-accounts, its routes through the frame the control plane joins them to. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, frame } from "./fixture.mjs";
import { world as aiAccountsWorld } from "../ai-accounts/fixture.mjs";
import { interfaceWords } from "../../../src/translations/index.mjs";

const ORDINARY = interfaceWords().find((w) => !w.protected && !/\{/.test(w.en));
const SECOND = interfaceWords().filter((w) => !w.protected && !/\{/.test(w.en))[1];
const PROTECTED = interfaceWords().find((w) => w.protected && !/\{/.test(w.en));

async function world() {
  const c = aiAccountsWorld();
  await c.group("ruth", "sam", "tom");
  let t = Date.parse("2026-10-08T10:00:00Z");
  const w = boot({ now: () => (t += 1000), more: { membership: c.m, aiAccounts: c.a } });
  const chosen = new Map();
  w.m.registerMemberLanguageRead(({ viewer } = {}) => ({ ok: true, language: chosen.get(viewer) ?? null, set_at: null }));
  w.say = (member, language) => chosen.set(member, language);
  w.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  w.m.translationGrant({ member: "sam", language: "es", by: "admin" });
  return w;
}
const route = async (m, path) => (await (await frame(m, new Request(`http://do/${path}`))).json()).result;
const bytes = (x) => new TextEncoder().encode(JSON.stringify(x)).length;

test("R19 with no language named the words answer holds only the words the team shows in the viewer's language: none held, no word and at most 4 KiB; after one adoption, exactly that word with fallback false; an awaiting word is not sent; controls: a language named answers every word, the viewer's language decides, and the route says the same", async () => {
  const w = await world();
  w.say("tom", "es");
  const none = w.m.interfaceWords({ viewer: "tom" });
  assert.deepEqual([none.ok, none.language, none.words], [true, "es", []]);
  assert.ok(bytes(none) <= 4096, `no translation held: ${bytes(none)} bytes`);
  assert.deepEqual((await route(w.m, "interfacewords?viewer=tom")).words, []);
  /* one real adoption (ordinary: shown at once) */
  assert.equal(w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "Algo", by: "ruth" }).state, "shown");
  const one = w.m.interfaceWords({ viewer: "tom" });
  assert.deepEqual(one.words, [{ key: ORDINARY.key, text: "Algo", en: ORDINARY.en, fallback: false }]);
  assert.ok(bytes(one) <= 4096);
  assert.deepEqual((await route(w.m, "interfacewords?viewer=tom")).words, one.words, "the route answers the same");
  /* a protected word kept by hand awaits: members see the English, so it is not sent; its confirmation sends it */
  assert.equal(w.m.translationAdopt({ language: "es", key: PROTECTED.key, text: "Primero", by: "ruth" }).state, "awaiting");
  assert.deepEqual(w.m.interfaceWords({ viewer: "tom" }).words.map((x) => x.key), [ORDINARY.key]);
  assert.equal((await w.m.translationConfirm({ language: "es", key: PROTECTED.key, by: "sam" })).state, "shown");
  assert.deepEqual(w.m.interfaceWords({ viewer: "tom" }).words.map((x) => x.key).sort(), [ORDINARY.key, PROTECTED.key].sort());
  /* control: a language named is the settings screen's read, every word, the English where none is held */
  const all = w.m.interfaceWords({ language: "es", viewer: "tom" });
  assert.equal(all.words.length, interfaceWords().length);
  assert.deepEqual(all.words.map((x) => x.key), interfaceWords().map((x) => x.key));
  assert.equal(all.words.filter((x) => !x.fallback).length, 2);
  assert.ok(all.words.every((x) => x.text && x.en));
  assert.equal((await route(w.m, "interfacewords?viewer=tom&language=es")).words.length, interfaceWords().length);
  /* controls: another viewer's language decides; a viewer with none set and a language not held sees no word; a refused tag stays refused */
  w.say("tom", "fr");
  assert.deepEqual(w.m.interfaceWords({ viewer: "tom" }).words, []);
  assert.deepEqual(w.m.interfaceWords({ viewer: "nobody" }).words, []);
  assert.equal(w.m.interfaceWords({ language: "not a tag", viewer: "tom" }).reason, "LANGUAGE_MALFORMED");
  assert.deepEqual(w.m.interfaceWords({ viewer: "tom" }).words, [], "reading writes nothing and changes nothing");
  void SECOND;
});

test("R19 a word whose adoption was undone is no longer sent without a language named, and the throwing-storage answer holds no word without one and every word in English with one", async () => {
  const w = await world();
  w.say("tom", "es");
  w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "Algo", by: "ruth" });
  assert.equal(w.m.interfaceWords({ viewer: "tom" }).words.length, 1);
  assert.equal(w.m.translationRevert({ language: "es", key: ORDINARY.key, by: "admin" }).ok, true);
  assert.deepEqual(w.m.interfaceWords({ viewer: "tom" }).words, []);
  w.st.db.exec("DROP TABLE translation_adoptions");
  const silent = w.m.interfaceWords({ viewer: "tom" });
  assert.deepEqual([silent.ok, silent.words], [true, []]);
  assert.ok(silent.detail);
  assert.ok(w.m.interfaceWords({ language: "es", viewer: "tom" }).words.every((x) => x.fallback));
});

test("R20 wordsVersion() is a short string that names no member and no word, the same across reads, other instances over the same storage and a restart, and changes at an adoption, a confirmation and an undo; controls: a refused act, a draft, a mark and a read leave it as it is", async () => {
  const w = await world();
  const v0 = w.m.wordsVersion();
  assert.equal(typeof v0, "string");
  assert.ok(v0.length > 0 && v0.length <= 40);
  assert.equal(w.m.wordsVersion(), v0, "equal across two reads");
  /* controls: nothing that is no adoption, confirmation or undo moves it */
  assert.equal(w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "Algo", by: "tom" }).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal(w.m.translationRevert({ language: "es", key: ORDINARY.key, by: "admin" }).reason, "TRANSLATION_NOTHING_TO_UNDO");
  w.m.interfaceWords({ viewer: "tom" }); w.m.translations({ language: "es", viewer: "admin" });
  assert.equal(w.m.wordsVersion(), v0);
  const seen = [v0];
  const moved = (what) => { const v = w.m.wordsVersion(); assert.ok(!seen.includes(v), `${what} changes the stamp: ${v}`); seen.push(v); return v; };
  w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "Algo", by: "ruth" });
  const afterAdopt = moved("an adoption");
  w.m.translationMark({ language: "es", key: ORDINARY.key, by: "tom" });
  assert.equal(w.m.wordsVersion(), afterAdopt, "a mark is no adoption");
  w.m.translationAdopt({ language: "es", key: PROTECTED.key, text: "Primero", by: "ruth" });
  moved("an adoption awaiting its second check");
  await w.m.translationConfirm({ language: "es", key: PROTECTED.key, by: "sam" });
  moved("a confirmation");
  w.m.translationRevert({ language: "es", key: ORDINARY.key, by: "admin" });
  const afterUndo = moved("an undo");
  /* the stamp names nobody and no word */
  for (const bad of ["ruth", "sam", "admin", ORDINARY.key, PROTECTED.key, "Algo"]) assert.ok(!afterUndo.includes(bad), bad);
  /* read from the storage alone: a fresh module over the same storage answers the same */
  const again = boot({ st: w.st });
  assert.equal(again.m.wordsVersion(), afterUndo, "the same across isolates");
});

test("R20 every ok answer of interfaceWords, with a language named or not and over a storage that throws, carries words_version beside language, equal to wordsVersion() and moving with an adoption; control: a refused tag carries none", async () => {
  const w = await world();
  w.say("tom", "es");
  const v0 = w.m.wordsVersion();
  for (const a of [w.m.interfaceWords({ viewer: "tom" }), w.m.interfaceWords({ language: "es", viewer: "tom" }), w.m.interfaceWords({ viewer: "nobody" })])
    assert.equal(a.words_version, v0);
  assert.equal((await route(w.m, "interfacewords?viewer=tom")).words_version, v0);
  w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "Algo", by: "ruth" });
  const v1 = w.m.wordsVersion();
  assert.notEqual(v1, v0);
  assert.equal(w.m.interfaceWords({ viewer: "tom" }).words_version, v1);
  assert.equal(w.m.interfaceWords({ language: "not a tag" }).words_version, undefined);
  w.st.db.exec("DROP TABLE translation_adoptions");
  assert.equal(typeof w.m.interfaceWords({ viewer: "tom" }).words_version, "string");
});
