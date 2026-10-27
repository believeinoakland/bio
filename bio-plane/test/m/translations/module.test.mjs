/* translations as a module (R12, R14, R15, R16, and R9's declaration), at its interface: the one instance for a storage
   and the nine routes it joins to the control plane's route map; the stamps `by` and `viewer`, which a body never names;
   the words members read, each read by key; and no place named. The world is the ai-accounts test world (the real
   membership and ai-accounts over a real database), the real record-core and the real jurisdictions. */
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { boot, frame, storage, applyRecordSchema, translationsOps } from "./fixture.mjs";
import { world as aiAccountsWorld } from "../ai-accounts/fixture.mjs";
import { recordOf } from "../../../src/record-core/index.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { list as heldProfiles } from "../../../../jurisdictions/index.mjs";
import { Translations, translationsOf, TRANSLATION_TABLES, TRANSLATION_TABLE_DECLARATIONS,
         interfaceWords } from "../../../src/translations/index.mjs";
import { TRANSLATIONS_CHECKS } from "../../../src/translations/checks.mjs";

const ORDINARY = interfaceWords().find((w) => !w.protected && !/\{/.test(w.en));
const PROTECTED = interfaceWords().find((w) => w.protected && !/\{/.test(w.en));
const call = async (m, path, body) => (await frame(m, new Request(`http://do/${path}`,
  body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) }))).json();
const RETIRED = /\b(?:copy|copies|instance|plane|server)\b/i;

async function world() {
  const c = aiAccountsWorld();
  await c.group("ruth", "sam", "tom");
  const w = boot({ more: { membership: c.m, aiAccounts: c.a } });
  const chosen = new Map();
  w.m.registerMemberLanguageRead(({ viewer } = {}) => ({ ok: true, language: chosen.get(viewer) ?? null, set_at: null }));
  w.say = (member, language) => chosen.set(member, language);
  w.c = c;
  return w;
}
/* every sentence of this module's answers carry: its translation, detail, notes and reasons (a draft's label `says`
   is record-grammar's, and the reading's `english` the assistant's) */
const said = (r, out = []) => {
  if (Array.isArray(r)) { for (const x of r) said(x, out); return out; }
  if (!r || typeof r !== "object") return out;
  for (const [k, v] of Object.entries(r)) {
    if (["translation", "detail", "note", "note_for_you", "why"].includes(k) && typeof v === "string") out.push(v);
    else if (v && typeof v === "object") said(v, out);
  }
  return out;
};

test("R12 translationsOf is the one instance for a storage: two calls answer the same module, the second call's deps are not read; its migrate() creates the seven tables and a second migrate() changes nothing; the route map's keys are exactly the nine routes", async () => {
  const c = aiAccountsWorld();
  const st = storage();
  const ctx = { storage: st };
  const record = recordOf(ctx);
  applyRecordSchema(st);
  const a = translationsOf(ctx, { record, membership: c.m });
  const b = translationsOf(ctx, { record: {}, membership: {} });
  assert.equal(a, b);
  assert.ok(a instanceof Translations);
  const tables = () => st.db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'translation\\_%' ESCAPE '\\' ORDER BY name`).all().map((r) => r.name);
  assert.deepEqual(tables(), [...TRANSLATION_TABLES].sort());
  const schema = () => JSON.stringify(st.db.prepare(`SELECT name, sql FROM sqlite_master ORDER BY name`).all());
  const before = schema();
  const declared = record.declaredTables().length;
  a.migrate();
  assert.equal(schema(), before, "a second migrate() changes nothing");
  assert.equal(record.declaredTables().length, declared, "and declares nothing twice");
  /* another storage is another module */
  assert.notEqual(boot().m, a);
  const keys = Object.keys(translationsOps(a, new URL("http://do/x"), null)).sort();
  assert.equal(keys.length, 9);
  assert.equal(new Set(keys).size, 9);
  assert.ok(keys.includes("interfacewords"));
  assert.equal(keys.filter((k) => k.startsWith("translation")).length, 8, "the eight others are the translation routes");
  assert.ok(keys.includes("translationdraftrecord"), "the store-internal hand-back is one of them");
  /* control: a route that is not this module's is not answered by its frame */
  assert.equal(await frame(a, new Request("http://do/groupidentity")), null);
});

test("R12 the routes answer through the frame: a body that is not JSON is 400 BAD_JSON before the route runs, an answer is {ok: true, result}, and a route that throws is 500 STORE_INTERNAL_ERROR with a correlation id and no stack; control: a good request is answered", async () => {
  const w = await world();
  const bad = await frame(w.m, new Request("http://do/translationgrant?by=admin", { method: "POST", body: "{nope" }));
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).reason, "BAD_JSON");
  const throwing = await frame({ ...w.m, translationGrant() { throw new Error("boom"); } }, new Request("http://do/translationgrant?by=admin", { method: "POST", body: "{}" }));
  assert.equal(throwing.status, 500);
  const out = await throwing.json();
  assert.deepEqual([out.reason, "stack" in out, JSON.stringify(out).includes("boom")], ["STORE_INTERNAL_ERROR", false, false]);
  assert.match(out.correlation, /^[0-9a-f-]{36}$/);
  const good = await call(w.m, "translationgrant?by=admin", { member: "ruth", language: "es" });
  assert.deepEqual([good.ok, good.result.ok, good.result.granted], [true, true, true]);
});

test("R9 the seven tables are declared to record-core as this module's, once, at its creation: while instance-setup still declares them under its own name the module is built and they are held there (the copy window); a table another module declared is a refusal that throws, naming the table; control: with none declared elsewhere the module declares them itself", () => {
  const withDeclared = (module, names) => {
    const st = storage();
    const ctx = { storage: st };
    const record = recordOf(ctx);
    applyRecordSchema(st);
    const done = record.declareTable(module, names.map((name) => ({ ...TRANSLATION_TABLE_DECLARATIONS[0], name })));
    assert.equal(done.ok, true);
    return { st, ctx, record };
  };
  const window = withDeclared("instance-setup", TRANSLATION_TABLES);
  assert.doesNotThrow(() => translationsOf(window.ctx, { record: window.record }));
  const mine = (record) => record.declaredTables().filter((d) => TRANSLATION_TABLES.includes(d.name)).map((d) => d.module);
  assert.deepEqual(mine(window.record), TRANSLATION_TABLES.map(() => "instance-setup"));
  const clash = withDeclared("somebody-else", [TRANSLATION_TABLES[2]]);
  assert.throws(() => translationsOf(clash.ctx, { record: clash.record }), /record-core refused its table declaration: TABLE_DECLARED \(translation_adoptions\)/);
  const own = boot();
  assert.deepEqual(own.record.declaredTables().filter((d) => d.module === "translations").map((d) => d.name), TRANSLATION_TABLES);
});

test("R14 nothing a caller sends names who acts: by and viewer are the control plane's stamps, read from the query after the body is spread, so a body naming its own is overwritten, on every route that acts or reads; control: the same request stamped by an administrator acts", async () => {
  const w = await world();
  const run = async (path, body) => (await call(w.m, path, body)).result;
  assert.equal((await run("translationgrant?by=sam", { member: "sam", language: "es", by: "admin" })).reason, "NOT_AN_ADMIN");
  assert.equal((await run("translationgrant?by=admin", { member: "sam", language: "es" })).granted, true);
  assert.equal((await run("translationadopt?by=tom", { language: "es", key: ORDINARY.key, text: "Algo", by: "sam" })).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal((await run("translationadopt?by=sam", { language: "es", key: ORDINARY.key, text: "Algo", by: "tom" })).state, "shown");
  assert.equal((await run("translationdraft?by=tom", { language: "es", direction: "to_language", by: "admin" })).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal((await run("translationdraftrecord?by=tom", { language: "es", direction: "to_language", words: [], draft: { words: [] }, by: "admin" })).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal((await run("translationconfirm?by=tom", { language: "es", key: PROTECTED.key, by: "admin" })).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal((await run("translationrevert?by=sam", { language: "es", key: ORDINARY.key, by: "admin" })).reason, "NOT_AN_ADMIN");
  assert.equal((await run("translationmark?by=nobody", { language: "es", key: ORDINARY.key, by: "tom" })).reason, "NO_SUCH_MEMBER");
  assert.equal((await run("translations?viewer=tom&language=es", { viewer: "admin", language: "es" })).reason, "TRANSLATION_NOT_GRANTED");
  assert.equal((await run("translations?viewer=admin", { language: "es", viewer: "tom" })).ok, true, "control: the stamp acts");
  w.say("tom", "es");
  const words = (await run("interfacewords?viewer=tom", { language: "fr", viewer: "sam" }));
  assert.equal(words.language, "fr", "a language may be named in the body");
  assert.equal((await run("interfacewords?viewer=tom", { viewer: "sam" })).language, "es", "the viewer is the stamp");
  assert.equal((await run("translationrevert?by=admin", { language: "es", key: ORDINARY.key })).ok, true, "control: an administrator undoes");
});

test("R15 every member-facing string this module answers is read by key and holds no English of its own: each row's translation is the word refusal.<CODE>, each note is its setup.note key, and none says copy, instance, plane or server, or group where the team is meant; a sentence naming the team's Civicsmith says your team's Civicsmith", async () => {
  const w = await world();
  for (const [code, row] of Object.entries(TRANSLATIONS_CHECKS)) {
    const t = row.translation;
    assert.doesNotMatch(t, RETIRED, code);
    assert.doesNotMatch(t, /\bgroup/i, code);
    if (/Civicsmith/.test(t)) assert.match(t, /your team's Civicsmith/, code);
  }
  /* the notes are the design's words, read by key */
  w.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  const asked = w.m.translationDraft({ language: "es", direction: "to_language", keys: [ORDINARY.key, PROTECTED.key], by: "ruth" });
  const rec = await w.m.translationDraftRecord({ language: "es", direction: "to_language", keys: [ORDINARY.key, PROTECTED.key], words: asked.words, by: "ruth",
    draft: { words: [{ key: ORDINARY.key, text: `ES ${ORDINARY.en}` }] }, not_drafted: [PROTECTED.key] });
  assert.equal(rec.note, word("setup.note.drafts_labeled_machine"));
  assert.deepEqual(rec.not_drafted[0].why, { key: "setup.why.assistant_draft", vars: {} });
  assert.ok(word(rec.not_drafted[0].why.key, rec.not_drafted[0].why.vars));
  const unlisted = await w.m.translationDraftRecord({ language: "es", direction: "to_language", keys: [ORDINARY.key, PROTECTED.key], words: asked.words, by: "ruth",
    draft: { words: [{ key: ORDINARY.key, text: `ES ${ORDINARY.en}` }] } });
  assert.equal(unlisted.not_drafted[0].why.key, "translations.not_drafted.not_answered", "control: an unlisted word is the module's own reason");
  assert.equal(w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "Algo", by: "ruth" }).note, word("setup.note.member_reading_language"));
  assert.equal(w.m.translationAdopt({ language: "es", key: PROTECTED.key, text: "Escrito", by: "ruth" }).note, word("setup.note.protected_word_changed"));
  assert.equal(w.m.translationMark({ language: "es", key: ORDINARY.key, by: "tom" }).note_for_you, word("setup.note_for_you.members_asked_translate"));
  const reading = await w.m.translationDraftRecord({ language: "es", direction: "to_english", key: PROTECTED.key,
    words: w.m.translationDraft({ language: "es", direction: "to_english", key: PROTECTED.key, by: "admin" }).words, draft: { key: PROTECTED.key, english: "Written" }, by: "admin" });
  assert.equal(reading.note, word("setup.note.machine_work_reading"));
  /* every sentence an act answers, refused or done, is free of the retired words and says team, never group */
  const answers = [
    w.m.translationGrant({ member: "nobody", language: "es", by: "admin" }), w.m.translationGrant({ member: "ruth", language: "es", by: "class:ai" }),
    w.m.translationGrant({ member: "ruth", language: "bad tag", by: "admin" }), w.m.translationGrant({ member: "ruth", language: "es", by: "sam" }),
    w.m.translationDraft({ language: "es", direction: "up", by: "ruth" }), w.m.translationDraft({ language: "es", direction: "to_language", by: "tom" }),
    w.m.translationDraft({ language: "es", direction: "to_language", keys: [ORDINARY.key], by: "ruth" }),
    w.m.translationDraft({ language: "es", direction: "to_english", key: PROTECTED.key, by: "ruth" }),
    w.m.translationDraft({ language: "es", direction: "to_language", keys: [ORDINARY.key], by: "ruth", assistant: { on: true, account: { level: "project" } } }),
    w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "", by: "ruth" }), w.m.translationAdopt({ language: "es", key: "no.such", text: "x", by: "ruth" }),
    w.m.translationAdopt({ language: "es", key: ORDINARY.key, text: "x", draft: 99, by: "ruth" }),
    await w.m.translationConfirm({ language: "es", key: ORDINARY.key, by: "ruth" }), await w.m.translationConfirm({ language: "es", key: PROTECTED.key, by: "ruth" }),
    await w.m.translationConfirm({ language: "es", key: PROTECTED.key, by: "admin" }),
    w.m.translationRevert({ language: "es", key: interfaceWords()[3].key, by: "admin" }), w.m.translationRevert({ language: "es", key: ORDINARY.key, by: "ruth" }),
    w.m.translationMark({ language: "es", key: interfaceWords()[3].key, by: "tom" }), w.m.translationMark({ language: "es", key: ORDINARY.key, note: "x".repeat(501), by: "tom" }),
    w.m.translationMark({ language: "es", key: ORDINARY.key, by: "nobody" }), w.m.translations({ language: "es", viewer: "tom" }),
    w.m.readingLanguage({ member: "tom" }), w.m.readingLanguage({ language: "bad tag" }),
    { ...w.m.interfaceWords({ language: "bad tag" }) }, rec, reading,
  ];
  const sentences = said(answers);
  assert.ok(sentences.length >= 25, `${sentences.length} sentences swept`);
  for (const s of sentences) {
    assert.doesNotMatch(s, RETIRED, s);
    assert.doesNotMatch(s, /\bgroup/i, s);
    if (/Civicsmith/.test(s)) assert.match(s, /your team's Civicsmith/, s);
  }
  /* the throwing-storage answer of the two reads, whose detail is this module's own sentence */
  w.st.db.exec("DROP TABLE translation_adoptions");
  const silent = w.m.translations({ language: "es", viewer: "admin" });
  assert.deepEqual([silent.ok, silent.reason], [false, "STORE_DID_NOT_ANSWER"]);
  const fallback = w.m.interfaceWords({ language: "es" });
  assert.equal(fallback.words.every((x) => x.fallback), true);
  for (const s of said([silent, fallback])) { assert.doesNotMatch(s, RETIRED, s); assert.doesNotMatch(s, /\bgroup/i, s); }
});

test("R16 no place is named in this module's behaviour or outward text: its rows and every sentence it answers name no jurisdiction a profile covers; a local name reaches an answer only from an active profile's own data, through jurisdictions.combine (translations' local_names); control: with no profile active there are none", async () => {
  const places = heldProfiles().flatMap((p) => p.covers).flatMap((c) => c.split(/\s+(?:of|and)\s+|\s+/))
    .filter((x) => /^[A-Z]/.test(x) && !["City", "County", "Town"].includes(x));
  assert.ok(places.length >= 2);
  const w = await world();
  w.m.translationGrant({ member: "ruth", language: "es", by: "admin" });
  const before = w.m.translations({ language: "es", viewer: "admin" });
  assert.deepEqual(before.local_names, [], "no profile active: no local name");
  w.record.setSetting("jurisdiction_profiles", ["test-port-ellery"], "admin");
  const after = w.m.translations({ language: "es", viewer: "admin" });
  assert.ok(after.local_names.length >= 1);
  /* the interface's own words are setup-words' and the local names the profile's: neither is this module's text */
  const { local_names: own, words: _list, ...rest } = after;
  const { words: _before, ...restBefore } = before;
  const texts = [...Object.values(TRANSLATIONS_CHECKS).map((r) => r.translation), JSON.stringify(rest), JSON.stringify(restBefore),
    ...said([w.m.translationDraft({ language: "es", direction: "up", by: "ruth" }), w.m.translationGrant({ member: "x", language: "es", by: "admin" }),
             w.m.readingLanguage({ member: "x" }), w.m.interfaceWords({ language: "bad tag" })])];
  for (const t of texts) for (const place of places) assert.equal(t.includes(place), false, `${place} in ${t.slice(0, 80)}`);
  /* the one way a place reaches an answer: an active profile's own data (the test profile's local names) */
  assert.ok(own.every((n) => typeof n.name === "string"));
  assert.equal(own.some((n) => n.name === "Town Clerk"), true);
});
