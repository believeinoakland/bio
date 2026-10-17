/* T50 (T50-23): the translation workspace leaves (R94), at the module's interface: the module over the real
   record-core, the REAL membership, credentials and ai-accounts (credentials' own test world: the founder `admin`, a
   second administrator `second`, members `ruth`, `sam` and `tom`), the real `translations` behind the delegates, and the
   nine routes through the frame control-plane joins them to. Every refusal has a control (K874). */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, frame, providers, storage, applyRecordSchema } from "./fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { world as credentialsWorld } from "../credentials/fixture.mjs";
import { aiAccountsOf } from "../../../src/ai-accounts/index.mjs";
import { InstanceSetup, INSTANCE_SETUP_TABLES, INSTANCE_SETUP_TABLE_DECLARATIONS, INTERFACE_WORDS,
         instanceSetupOps } from "../../../src/setup.mjs";
import { translationsOf, translationsOps, INTERFACE_WORDS as TRANSLATIONS_WORDS } from "../../../src/translations/index.mjs";
import { list as jList, get as jGet, combine as jCombine } from "../../../../jurisdictions/index.mjs";

const TABLES = ["translation_grants", "translation_drafts", "translation_adoptions", "translation_confirmations",
                "translation_undos", "translation_marks", "translation_readings"];
const ORDINARY = INTERFACE_WORDS.find((w) => !w.protected && !/\{/.test(w.en));
const jurisdictions = { list: jList, get: jGet, combine: jCombine };

async function world() {
  const c = credentialsWorld();
  await c.group("ruth", "sam", "tom");
  let t = Date.parse("2026-10-08T10:00:00Z");
  const w = await boot({ now: () => (t += 1000), more: { membership: c.m, credentials: c.c, aiAccounts: aiAccountsOf(c.ctx), jurisdictions } });
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin");
  return { ...w, c };
}
const call = async (m, path, body) => (await frame(m, new Request(`http://do/${path}`,
  body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) }))).json();

test("R94 each of the nine translation routes answers through this module's delegates what `translations` answers: grant, adopt, mark, the workspace and the words, and the door's draft, hand-back, confirm and undo; a body naming its own `by` grants nothing (control)", async () => {
  const w = await world();
  const routes = Object.keys(instanceSetupOps(w.m, new URL("http://do/x"), {})).filter((k) => /^translation|^interfacewords$/.test(k));
  assert.deepEqual(routes.sort(), Object.keys(translationsOps(w.m, new URL("http://do/x"), {})).sort());
  assert.equal(routes.length, 9);
  const g = await call(w.m, "translationgrant?by=admin", { member: "ruth", language: "es" });
  assert.deepEqual([g.ok, g.result.ok, g.result.granted], [true, true, true]);
  const spoof = await call(w.m, "translationgrant?by=sam", { member: "tom", language: "es", by: "admin" });
  assert.notEqual(spoof.result.ok, true, "a body naming an administrator grants nothing");
  const a = await call(w.m, "translationadopt?by=ruth", { language: "es", key: ORDINARY.key, text: "Algo" });
  assert.equal(a.result.state, "shown");
  const m = await call(w.m, "translationmark?by=sam", { language: "es", key: ORDINARY.key, note: "off" });
  assert.equal(m.result.ok, true);
  const ws = await call(w.m, "translations?language=es&viewer=ruth");
  assert.equal(ws.result.words.find((x) => x.key === ORDINARY.key).state, "shown");
  const iw = await call(w.m, "interfacewords?language=es&viewer=sam");
  assert.deepEqual(iw.result.words.find((x) => x.key === ORDINARY.key), { key: ORDINARY.key, text: "Algo", en: ORDINARY.en, fallback: false });
  const asked = await call(w.m, "translationdraft?by=ruth", { language: "es", direction: "to_language", keys: [INTERFACE_WORDS[1].key, INTERFACE_WORDS[2].key] });
  assert.equal(asked.result.reason, "ASSISTANT_DRAFT_UNAVAILABLE");
  const rec = await call(w.m, "translationdraftrecord?by=ruth", { language: "es", direction: "to_language", words: asked.result.words,
    keys: asked.result.words.map((x) => x.key), draft: { words: asked.result.words.map((x) => ({ key: x.key, text: `ES ${x.en}` })) } });
  assert.equal(rec.result.ok, true);
  assert.ok(rec.result.drafted.length >= 1);
  const rv = await call(w.m, "translationrevert?by=admin", { language: "es", key: ORDINARY.key });
  assert.equal(rv.result.state, "missing");
  const cf = await call(w.m, "translationconfirm?by=admin", { language: "es", key: ORDINARY.key });
  assert.equal(cf.result.reason, "TRANSLATION_NOT_AWAITING");
});

test("R94 memberLanguageSet then interfacewords with no language answers the set language; the delegates read it through the registration at start; control: a member with none set is answered every word in English", async () => {
  const w = await world();
  assert.deepEqual(w.started.language, { ok: true });
  w.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "Algo", by: "ruth" });
  w.m.memberLanguageSet({ language: "es", by: "sam" });
  const r = w.m.interfaceWords({ viewer: "sam" });
  assert.equal(r.language, "es");
  assert.equal(r.words.find((x) => x.key === ORDINARY.key).text, "Algo");
  assert.deepEqual(w.m.readingLanguage({ member: "sam" }), { ok: true, language: "es", source: "member" });
  const none = w.m.interfaceWords({ viewer: "tom" });
  assert.equal(none.language, null);
  assert.equal(none.words.every((x) => x.fallback === true && x.text === x.en), true);
  assert.equal(w.m.readingLanguage({ member: "tom" }).reason, "LANGUAGE_NOT_SET");
});

/* This module over a bare storage and its own stand-ins, never started. */
function bare() {
  const store = storage();
  const ctx = { storage: store };
  const record = recordOf(ctx);
  applyRecordSchema(store);
  const p = providers();
  return { store, ctx, m: new InstanceSetup(ctx, {}, { record, membership: p.membership, aiAccounts: p.aiAccounts, jurisdictions }) };
}

test("R94 an InstanceSetup built and not started answers its delegates with the member's language (the read is registered on the first use of a delegate); a second registration is only PROVIDER_DECLARED, harmless", async () => {
  const { ctx, m } = bare();
  m.migrate();
  m.memberLanguageSet({ language: "es", by: "sam" });
  assert.equal(m.interfaceWords({ viewer: "sam" }).language, "es", "unstarted, yet the member's language is read");
  const again = translationsOf(ctx).registerMemberLanguageRead(() => ({ ok: true, language: "fr" }));
  assert.equal(again.reason, "PROVIDER_DECLARED");
  assert.equal(m.interfaceWords({ viewer: "sam" }).language, "es", "the first registration stands");
  assert.equal(m.interfaceWords({ viewer: "tom" }).language, null, "control: a member with none set reads English");
});

test("R94 this module's declaration lists none of the seven translation tables and creates none of them; `translations` holds them; the word list is re-exported as `translations` holds it", async () => {
  for (const t of TABLES) {
    assert.equal(INSTANCE_SETUP_TABLES.includes(t), false, t);
    assert.equal(INSTANCE_SETUP_TABLE_DECLARATIONS.some((d) => d.name === t), false, t);
  }
  const { store, m } = bare();
  m.migrate();
  const has = (t) => store.db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`).get(t);
  for (const t of TABLES) assert.equal(has(t), undefined, `${t} is not created by this module's migrate`);
  m.interfaceWords({ viewer: "sam" });
  for (const t of TABLES) assert.ok(has(t), `${t} is created by translations, at its construction`);
  assert.equal(INTERFACE_WORDS, TRANSLATIONS_WORDS);
});
