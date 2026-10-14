/* Settings › Translations at the module's interface (R16). */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, has, open, panelOf, rowOf, said, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, env, refuse, translationsTable } from "./fixtures.mjs";

const ops = (n) => [...new Set(acts(n).map((b) => b.attrs["data-act"]))].sort();

test("R16 translations: the group's languages each open their words; translations and interfacewords read for the chosen language", async () => {
  const a = await open("translations", { me: ADMIN, table: translationsTable() });
  assert.deepEqual(all(a.tree, (e) => e.tag === "a" && /^\/app\/translations\//.test(e.attrs.href || "")).map((e) => e.attrs.href), ["/app/translations/es", "/app/translations/vi"]);
  has(a, "screen.translations.choose");
  const es = await open("translations", { me: ADMIN, table: translationsTable(), subject: "es" });
  assert.deepEqual(es.p.all.filter((r) => ["translations", "interfacewords"].includes(r.op) && r.query.language).map((r) => [r.op, r.query]), [["translations", { language: "es" }], ["interfacewords", { language: "es" }]]);
  // a member not granted the language: its refusal in its words
  const m = await open("translations", { me: MEMBER, subject: "es", table: translationsTable({ translations: refuse("TRANSLATION_NOT_GRANTED") }) });
  assert.ok(m.text.includes("translated TRANSLATION_NOT_GRANTED"));
});

test("R16 each word a row: its English, meaning note, state, its text with who adopted it, and whether its English changed", async () => {
  const a = await open("translations", { me: ADMIN, table: translationsTable(), subject: "es" });
  const home = textOf(rowOf(a.tree, "rail.home.name"));
  assert.ok(home.includes("Home") && home.includes("The first place") && home.includes(said("screen.translations.state.shown")) && home.includes("Inicio") && home.includes(said("screen.translations.adopted", { by: "ana" })));
  assert.ok(textOf(rowOf(a.tree, "mark.outward.means")).includes(said("screen.translations.changed")));
});

test("R16 the panel: translationadopt (typed, or a stored draft kept as drafted), translationconfirm (an awaiting protected word), translationrevert (an administrator's)", async () => {
  const a = await open("translations", { me: ADMIN, table: translationsTable(), subject: "es" });
  assert.deepEqual(ops(panelOf(a.tree, "rail.queue.name")), ["translationadopt"]);
  assert.deepEqual(ops(panelOf(a.tree, "mark.outward.means")), ["translationadopt", "translationconfirm", "translationrevert"]);
  assert.ok(textOf(panelOf(a.tree, "rail.queue.name")).includes(said("screen.translations.draft.label", { handle: "ana" })), "a draft labelled machine work");
  assert.deepEqual((await a.press("translationadopt", { data: { key: "rail.queue.name" }, values: { "tr-t-rail_queue_name": "", "tr-t-rail_queue_name-d0": true } })).sent[0].body, { language: "es", key: "rail.queue.name", text: "Cola", draft: "D1" });
  assert.deepEqual((await a.press("translationadopt", { data: { key: "rail.queue.name" }, values: { "tr-t-rail_queue_name": "La cola", "tr-t-rail_queue_name-d0": true } })).sent[0].body, { language: "es", key: "rail.queue.name", text: "La cola", draft: "D1" }, "a draft corrected");
  assert.deepEqual((await a.press("translationadopt", { data: { key: "rail.home.name" }, values: { "tr-t-rail_home_name": "Portada" } })).sent[0].body, { language: "es", key: "rail.home.name", text: "Portada" });
  assert.deepEqual((await a.press("translationconfirm", { data: { key: "mark.outward.means" } })).sent[0].body, { language: "es", key: "mark.outward.means" });
  assert.deepEqual((await a.press("translationrevert", { data: { key: "rail.home.name" } })).sent[0].body, { language: "es", key: "rail.home.name" });
  const m = await open("translations", { me: MEMBER, table: translationsTable(), subject: "es" });
  assert.ok(!ops(m.tree).includes("translationrevert") && !ops(m.tree).includes("translationgrant"), "the undo and the grant are administrators'");
});

test("R16 translationdraft: the picked words' drafts while the assistant is reachable; an administrator's reading of an awaiting protected word into English, adopting nothing", async () => {
  const a = await open("translations", { me: ADMIN, table: translationsTable(), subject: "es", reachable: true });
  a.b.fire(a.b.doc.getElementById("pick-words-rail.queue.name"), "click");
  await a.b.settle(80); a.redraw();
  const r = await a.press("translationdraft", { data: { direction: "to_language" }, reason: "for the new members" });
  const { reason, ...body } = r.sent[0].body;
  assert.deepEqual(body, { language: "es", direction: "to_language", keys: ["rail.queue.name"] });
  const e = await a.press("translationdraft", { data: { key: "mark.outward.means", direction: "to_english" }, reason: "to confirm it" });
  const { reason: why, ...back } = e.sent[0].body;
  assert.deepEqual(back, { language: "es", direction: "to_english", key: "mark.outward.means" });
  assert.ok(a.text.includes("Outward: this goes outside") && a.text.includes(said("screen.translations.reading.label", { handle: "rosa" })));
  assert.ok(!e.sent.some((x) => x.op === "translationadopt" || x.op === "translationconfirm"), "it adopts nothing");
  const off = await open("translations", { me: ADMIN, table: translationsTable(), subject: "es", reachable: false });
  assert.ok(!ops(off.tree).includes("translationdraft"), "not while the assistant is not reachable");
});

test("R16 translationgrant: an administrator grants or revokes a named member's right for the language", async () => {
  const a = await open("translations", { me: ADMIN, table: translationsTable(), subject: "es" });
  assert.deepEqual((await a.press("translationgrant", { data: { revoke: "" }, values: { "tr-member": "ana" } })).sent[0].body, { member: "ana", language: "es" });
  assert.deepEqual((await a.press("translationgrant", { data: { revoke: "" }, values: { "tr-member": "ana", "tr-revoke": true } })).sent[0].body, { member: "ana", language: "es", revoke: true });
});

test("R31 translations: every language is listed by its name in the member's language and never as a tag; the group's source English is not offered; a row shows its English and meaning, never its key", async () => {
  const a = await open("translations", { me: ADMIN, table: translationsTable({ grouplanguages: env({ ok: true, languages: ["en", "en-US", "es", "vi"] }), memberlanguage: env({ ok: true, language: null }) }) });
  const links = all(a.tree, (e) => e.tag === "a" && /^\/app\/translations\//.test(e.attrs.href || ""));
  assert.deepEqual(links.map((e) => textOf(e)), ["Spanish", "Vietnamese"], "named, English left out");
  assert.deepEqual(links.map((e) => e.attrs.href), ["/app/translations/es", "/app/translations/vi"], "the tag is the address only");
  assert.ok(!/\b(es|vi|en-US)\b/.test(a.text), "no tag is drawn");
  // in the member's language
  const es = await open("translations", { me: ADMIN, table: translationsTable({ memberlanguage: env({ ok: true, language: "es" }) }) });
  assert.deepEqual(all(es.tree, (e) => e.tag === "a" && /^\/app\/translations\//.test(e.attrs.href || "")).map((e) => textOf(e)), ["Español", "Vietnamita"]);
  // a word's row: its English and its meaning, and no key (control: no row shows a screen. key)
  const w = await open("translations", { me: ADMIN, table: translationsTable(), subject: "es" });
  assert.ok(!w.text.includes("rail.home.name") && !/\b(screen|rail|mark|act)\.[a-z]/.test(w.text.replace(/screen\.[a-z-]+\.[a-z.]+ /g, "")), "no key is drawn");
  const home = textOf(rowOf(w.tree, "rail.home.name", "Home"));
  assert.ok(home.includes("Home") && home.includes("The first place"));
  assert.ok(!all(w.tree, (e) => e.tag === "code").length, "no key in a code box");
  assert.ok(!w.text.includes(said("screen.translations.col.key")), "no key column");
  // the grant names the language, not its tag
  assert.ok(w.text.includes(said("screen.translations.grant.member", { language: "Spanish" })));
});

test("R31 translations: a member who is not granted sees the refusal's own words alone, no section about the words", async () => {
  const m = await open("translations", { me: MEMBER, subject: "es", table: translationsTable({ translations: refuse("TRANSLATION_NOT_GRANTED") }) });
  assert.ok(m.text.includes("TRANSLATION_NOT_GRANTED"));
  assert.equal(all(m.tree, (e) => e.tag === "h2" && textOf(e) === said("screen.translations.words.heading")).length, 0, "no words section around it");
  assert.equal(all(m.tree, (e) => e.tag === "table").length, 0);
  assert.deepEqual(acts(m.tree), []);
});

/* R37 (T49; D30 m): translations with nothing to show draws its empty state by key, never a bare screen */
test("R37 a group with no language beside English draws screens-settings' languages.none by key; no language is offered, nor a choice of one; a failed read is drawn failed", async () => {
  for (const languages of [["en"], ["en-US"], []]) {
    const a = await open("translations", { me: ADMIN, table: translationsTable({ grouplanguages: env({ ok: true, languages }) }) });
    has(a, "screen.translations.languages.none");
    assert.equal(all(a.tree, (e) => e.tag === "a" && /^\/app\/translations\//.test(e.attrs.href || "")).length, 0, `${JSON.stringify(languages)}: no language to open`);
    assert.ok(!a.text.includes(said("screen.translations.choose")), "no choice of a language that is not there");
    assert.ok(a.text.includes(said("screen.translations.name")) && a.text.trim().length > said("screen.translations.name").length, "never a bare screen");
  }
  // control: a language beside English draws the list and not the empty state
  const b = await open("translations", { me: ADMIN, table: translationsTable() });
  assert.ok(!b.text.includes(said("screen.translations.languages.none")));
  // control: a read that failed is drawn failed, never as no language
  const f = await open("translations", { me: ADMIN, table: translationsTable({ grouplanguages: "none" }) });
  assert.ok(all(f.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
  assert.ok(!f.text.includes(said("screen.translations.languages.none")));
});
