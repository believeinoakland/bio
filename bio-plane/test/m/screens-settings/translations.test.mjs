/* Settings › Translations at the module's interface (R16). Over the world (store-request): the languages, the grants and the kept words are made by
   the real acts of the founder and of the speakers, and the expectations are read back from what the owners answer, never copied from a literal. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, has, open, panelOf, rowOf, said, textOf } from "./kit.mjs";
import { team, holdKey, onlyWords, draftOf, englishWas, SEAL } from "./seed-group.mjs";

const ops = (n) => [...new Set(acts(n).map((b) => b.attrs["data-act"]))].sort();
const named = (tags, lang = "en") => tags.map((t) => { const n = new Intl.DisplayNames([lang], { type: "language" }).of(t); return n.charAt(0).toUpperCase() + n.slice(1); });
const HOME = "rail.home.name", QUEUE = "rail.queue.name", PROTECTED = "weight.reversible.name", CHANGED = "ai.use.ask.name", NOTED = "state.failed";
const fid = (k) => "tr-t-" + k.replace(/[^A-Za-z0-9_-]/g, "_");
const linksOf = (o) => all(o.tree, (e) => e.tag === "a" && /^\/app\/translations\//.test(e.attrs.href || ""));
const wordOf = async (as, key, language = "es") => (await as.read("translations", { query: { language } })).words.find((x) => x.key === key);

/** A team that offers Spanish and Vietnamese, with the words the tests are about in the states they are in: Home kept by ana, the queue not kept and
 *  drafted for ana, a protected word awaiting its confirmation, a word whose English changed since it was kept, and one with a note, not kept.
 *  `dev` may translate and `rosa` is an administrator who is not the founder; the founder does what the instance's acts need. */
async function spanish({ reachable = false } = {}) {
  const t = await team(reachable ? { env: { ACCOUNT_SEAL_SECRET: SEAL } } : {});
  const { w, founder, rosa, dev } = t;
  const ana = t.ana = await w.signIn("ana");
  await founder.act("grouplanguagesset", { body: { languages: ["en", "es", "vi"] } });
  for (const member of ["ana", "dev"]) await founder.act("translationgrant", { body: { member, language: "es" } });
  await ana.act("translationadopt", { body: { language: "es", key: HOME, text: "Inicio" } });
  await ana.act("translationadopt", { body: { language: "es", key: CHANGED, text: "Preguntar" } });
  englishWas(w, "es", CHANGED, "Questions");   // SEED: the English it was kept from
  await founder.act("translationadopt", { body: { language: "es", key: PROTECTED, text: "Reversible, en español" } });
  t.draft = draftOf(w, "es", QUEUE, "Cola", "ana");   // SEED: the assistant's draft
  if (reachable) await holdKey(founder, w);
  t.only = onlyWords(founder, [HOME, QUEUE, PROTECTED, CHANGED, NOTED]);   // WORLD GAP: 26,000 rows are not drawn in a test's time
  t.table = { translations: t.only };
  return t;
}

test("R16 translations: the group's languages each open their words; translations and interfacewords read for the chosen language", async () => {
  const t = await spanish();
  const a = await open("translations", { world: t.w, as: t.founder, table: t.table });
  assert.deepEqual(linksOf(a).map((e) => e.attrs.href), ["/app/translations/es", "/app/translations/vi"]);
  has(a, "screen.translations.choose");
  const es = await open("translations", { world: t.w, as: t.founder, subject: "es", table: t.table });
  assert.deepEqual(es.p.all.filter((r) => ["translations", "interfacewords"].includes(r.op) && r.query.language).map((r) => [r.op, r.query]), [["translations", { language: "es" }], ["interfacewords", { language: "es" }]]);
  // a member not granted the language: its refusal in its words
  const m = await open("translations", { world: t.w, as: await t.w.signIn("lu"), subject: "es" });
  assert.ok(m.text.includes(said("refusal.TRANSLATION_NOT_GRANTED")));
});

test("R16 each word a row: its English, meaning note, state, its text with who adopted it, and whether its English changed", async () => {
  const t = await spanish();
  const a = await open("translations", { world: t.w, as: t.founder, table: t.table, subject: "es" });
  const home = await wordOf(t.founder, HOME), changed = await wordOf(t.founder, CHANGED), noted = await wordOf(t.founder, NOTED), prot = await wordOf(t.founder, PROTECTED);
  assert.deepEqual([home.state, home.adopted_by_name, changed.english_changed, prot.state, noted.state], ["shown", "ana", true, "awaiting", "missing"], "the owner's states");
  const row = textOf(rowOf(a.tree, HOME));
  assert.ok(row.includes(home.en) && row.includes(said("screen.translations.state.shown")) && row.includes(home.text) && row.includes(said("screen.translations.adopted", { by: "ana" })));
  assert.ok(textOf(rowOf(a.tree, CHANGED)).includes(said("screen.translations.changed")));
  assert.ok(!row.includes(said("screen.translations.changed")), "control: only the word whose English changed says so");
  assert.ok(textOf(rowOf(a.tree, NOTED)).includes(noted.note), "the meaning note");
  assert.ok(textOf(rowOf(a.tree, PROTECTED)).includes(prot.means), "what the word means");
});

test("R16 the panel: translationadopt (typed, or a stored draft kept as drafted), translationconfirm (an awaiting protected word), translationrevert (an administrator's)", async () => {
  const t = await spanish();
  const a = await open("translations", { world: t.w, as: t.founder, table: t.table, subject: "es" });
  assert.deepEqual(ops(panelOf(a.tree, QUEUE)), ["translationadopt"]);
  assert.deepEqual(ops(panelOf(a.tree, PROTECTED)), ["translationadopt", "translationconfirm", "translationrevert"]);
  const queue = await wordOf(t.founder, QUEUE);
  assert.deepEqual(queue.drafts.map((d) => d.text), ["Cola"]);
  assert.ok(textOf(panelOf(a.tree, QUEUE)).includes(said("screen.translations.draft.label", { handle: "ana" })), "a draft labeled machine work");
  const id = queue.drafts[0].id;
  assert.deepEqual((await a.press("translationadopt", { data: { key: QUEUE }, values: { [fid(QUEUE)]: "", [fid(QUEUE) + "-d0"]: true } })).sent[0].body, { language: "es", key: QUEUE, text: "Cola", draft: id });
  assert.equal((await wordOf(t.founder, QUEUE)).text, "Cola", "kept as drafted");
  const b = await open("translations", { world: t.w, as: t.founder, table: t.table, subject: "es" });
  assert.deepEqual((await b.press("translationadopt", { data: { key: QUEUE }, values: { [fid(QUEUE)]: "La cola", [fid(QUEUE) + "-d0"]: true } })).sent[0].body, { language: "es", key: QUEUE, text: "La cola", draft: id }, "a draft corrected");
  assert.equal((await wordOf(t.founder, QUEUE)).text, "La cola");
  assert.deepEqual((await b.press("translationadopt", { data: { key: HOME }, values: { [fid(HOME)]: "Portada" } })).sent[0].body, { language: "es", key: HOME, text: "Portada" });
  assert.equal((await wordOf(t.founder, HOME)).text, "Portada");
  assert.deepEqual((await b.press("translationconfirm", { data: { key: PROTECTED } })).sent[0].body, { language: "es", key: PROTECTED });
  assert.deepEqual((await b.press("translationrevert", { data: { key: HOME } })).sent[0].body, { language: "es", key: HOME });
  assert.equal((await wordOf(t.founder, HOME)).text, "Inicio", "undone: the word it replaced");
  const m = await open("translations", { world: t.w, as: t.dev, table: t.table, subject: "es" });
  assert.ok(!ops(m.tree).includes("translationrevert") && !ops(m.tree).includes("translationgrant"), "the undo and the grant are administrators'");
});

test("R16 translationdraft: the picked words' drafts while the assistant is reachable; an administrator's reading of an awaiting protected word into English, adopting nothing", async () => {
  const t = await spanish({ reachable: true });
  // WORLD GAP: the door asks no draft after a draft-due act; the assistant's answers are the platform's, in the shape its owner gives
  const ENGLISH = "Reversible: you can undo this, as read back from the Spanish.";
  const table = { ...t.table, translationdraft: (q, b) => (b.direction === "to_english"
    ? { ok: true, result: { ok: true, key: b.key, language: b.language, english: ENGLISH, label: { kind: "machine", asked_by: "member:" + t.founder.member } } }
    : { ok: true, result: { ok: true, language: b.language, drafted: b.keys.map((k) => ({ id: 9, key: k, text: "x" })), not_drafted: [], offered_official: [] } }) };
  const a = await open("translations", { world: t.w, as: t.founder, table, subject: "es" });
  a.b.fire(a.b.doc.getElementById("pick-words-" + QUEUE), "click");
  await a.b.settle(80); a.redraw();
  const r = await a.press("translationdraft", { data: { direction: "to_language" }, reason: "for the new members" });
  const { reason, ...body } = r.sent[0].body;
  assert.deepEqual(body, { language: "es", direction: "to_language", keys: [QUEUE] });
  const e = await a.press("translationdraft", { data: { key: PROTECTED, direction: "to_english" }, reason: "to confirm it" });
  const { reason: why, ...back } = e.sent[0].body;
  assert.deepEqual(back, { language: "es", direction: "to_english", key: PROTECTED });
  assert.ok(a.text.includes(ENGLISH) && a.text.includes(said("screen.translations.reading.label", { handle: t.founder.handle })));
  assert.ok(!e.sent.some((x) => x.op === "translationadopt" || x.op === "translationconfirm"), "it adopts nothing");
  assert.equal((await wordOf(t.founder, PROTECTED)).state, "awaiting", "nothing is confirmed");
  const off = await spanish();
  assert.ok(!ops((await open("translations", { world: off.w, as: off.founder, table: off.table, subject: "es" })).tree).includes("translationdraft"), "not while the assistant is not reachable");
});

test("R16 translationgrant: an administrator grants or revokes a named member's right for the language", async () => {
  const t = await spanish();
  const a = await open("translations", { world: t.w, as: t.founder, table: t.table, subject: "es" });
  assert.deepEqual((await a.press("translationgrant", { data: { revoke: "" }, values: { "tr-member": "ana" } })).sent[0].body, { member: "ana", language: "es" });
  assert.deepEqual((await a.press("translationgrant", { data: { revoke: "" }, values: { "tr-member": "ana", "tr-revoke": true } })).sent[0].body, { member: "ana", language: "es", revoke: true });
  await assert.rejects(t.ana.read("translations", { query: { language: "es" } }), /TRANSLATION_NOT_GRANTED/, "her right is revoked");
});

test("R31 translations: every language is listed by its name in the member's language and never as a tag; the group's source English is not offered; a row shows its English and meaning, never its key", async () => {
  const t = await spanish();
  await t.founder.act("grouplanguagesset", { body: { languages: ["en", "en-US", "es", "vi"] } });
  const a = await open("translations", { world: t.w, as: t.founder, table: t.table });
  const links = linksOf(a);
  assert.deepEqual(links.map((e) => textOf(e)), ["Spanish", "Vietnamese"], "named, English left out");
  assert.deepEqual(links.map((e) => e.attrs.href), ["/app/translations/es", "/app/translations/vi"], "the tag is the address only");
  assert.ok(!/\b(es|vi|en-US)\b/.test(a.text), "no tag is drawn");
  // in the member's language
  await t.founder.act("memberlanguageset", { body: { language: "es" } });
  const es = await open("translations", { world: t.w, as: t.founder, table: t.table });
  assert.deepEqual(linksOf(es).map((e) => textOf(e)), named(["es", "vi"], "es"));
  // a word's row: its English and its meaning, and no key (control: no row shows a screen. key)
  const w = await open("translations", { world: t.w, as: t.founder, table: t.table, subject: "es" });
  assert.ok(!w.text.includes(HOME) && !/\b(screen|rail|mark|act)\.[a-z]/.test(w.text.replace(/screen\.[a-z-]+\.[a-z.]+ /g, "")), "no key is drawn");
  const home = textOf(rowOf(w.tree, HOME, "Home"));
  const noted = await wordOf(t.founder, NOTED);
  assert.ok(home.includes("Home") && textOf(rowOf(w.tree, NOTED, noted.en)).includes(noted.note));
  assert.ok(!all(w.tree, (e) => e.tag === "code").length, "no key in a code box");
  assert.ok(!w.text.includes(said("screen.translations.col.key")), "no key column");
  // the grant names the language, not its tag
  assert.ok(w.text.includes(said("screen.translations.grant.member", { language: named(["es"], "es")[0] })));
});

test("R31 translations: a member who is not granted sees the refusal's own words alone, no section about the words", async () => {
  const t = await spanish();
  const lu = await t.w.signIn("lu");
  const m = await open("translations", { world: t.w, as: lu, subject: "es" });
  assert.ok(m.text.includes(said("refusal.TRANSLATION_NOT_GRANTED")));
  assert.equal(all(m.tree, (e) => e.tag === "h2" && textOf(e) === said("screen.translations.words.heading")).length, 0, "no words section around it");
  assert.equal(all(m.tree, (e) => e.tag === "table").length, 0);
  assert.deepEqual(acts(m.tree), []);
});

/* R37 (T49; D30 m): translations with nothing to show draws its empty state by key, never a bare screen */
test("R37 a group with no language beside English draws screens-settings' languages.none by key; no language is offered, nor a choice of one; a failed read is drawn failed", async () => {
  for (const languages of [null, ["en"], ["en-US"]]) {
    const t = await team();   // a team that has chosen no language (the world's own answer), or only English
    if (languages) await t.founder.act("grouplanguagesset", { body: { languages } });
    const a = await open("translations", { world: t.w, as: t.founder });
    has(a, "screen.translations.languages.none");
    assert.equal(linksOf(a).length, 0, `${JSON.stringify(languages)}: no language to open`);
    assert.ok(!a.text.includes(said("screen.translations.choose")), "no choice of a language that is not there");
    assert.ok(a.text.includes(said("screen.translations.name")) && a.text.trim().length > said("screen.translations.name").length, "never a bare screen");
  }
  // control: a language beside English draws the list and not the empty state
  const s = await spanish();
  const b = await open("translations", { world: s.w, as: s.founder });
  assert.ok(!b.text.includes(said("screen.translations.languages.none")));
  // control: a read that failed is drawn failed, never as no language
  const f = await open("translations", { world: s.w, as: s.founder, table: { grouplanguages: "none" } });
  assert.ok(all(f.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
  assert.ok(!f.text.includes(said("screen.translations.languages.none")));
});
