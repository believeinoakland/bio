/* The language a member reads in (R10; T48; N670; DEC-127 (1), (3)) and how the member's own language reaches this
   module (R11), at the module's interface. The language a member chose is `instance-setup` R64's, a later module, so the
   tests register a stand-in read, a map, as it would at its start. Every refusal has a control (K874). */
import test from "node:test";
import assert from "node:assert/strict";
import { boot } from "./fixture.mjs";
import { word } from "../../../src/setup-words/index.mjs";
import { interfaceWords } from "../../../src/translations/index.mjs";

/* A module with a registered read over a map of what members chose. */
function reading() {
  const w = boot();
  const chosen = new Map();
  w.reads = [];
  assert.deepEqual(w.m.registerMemberLanguageRead(({ viewer } = {}) => { w.reads.push(viewer); return { ok: true, language: chosen.get(viewer) ?? null, set_at: null }; }), { ok: true });
  w.say = (member, language) => chosen.set(member, language);
  return w;
}
const writesOf = (w) => w.st.statements.filter((q) => /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i.test(q));

test("R10 readingLanguage answers the member's own language when none is named: a member with Spanish set answers es; control: a member with none set and no language named answers LANGUAGE_NOT_SET (its words the key refusal.LANGUAGE_NOT_SET), nothing written", () => {
  const w = reading();
  w.say("ruth", "es");
  assert.deepEqual(w.m.readingLanguage({ member: "ruth" }), { ok: true, language: "es", source: "member" });
  const before = writesOf(w).length;
  const none = w.m.readingLanguage({ member: "sam" });
  assert.deepEqual([none.ok, none.reason, none.code, none.check], [false, "LANGUAGE_NOT_SET", "LANGUAGE_NOT_SET", "C-64.31"]);
  assert.equal(none.translation, word("refusal.LANGUAGE_NOT_SET"));
  assert.equal(w.m.readingLanguage({}).reason, "LANGUAGE_NOT_SET", "no member and no language");
  assert.equal(w.m.readingLanguage().reason, "LANGUAGE_NOT_SET", "no argument at all never throws");
  /* a member who cleared her choice has none set; a machine has none */
  w.say("ruth", null);
  assert.equal(w.m.readingLanguage({ member: "ruth" }).reason, "LANGUAGE_NOT_SET");
  assert.equal(w.m.readingLanguage({ member: "class:ai" }).reason, "LANGUAGE_NOT_SET");
  assert.equal(writesOf(w).length, before, "it writes nothing");
});

test("R10 readingLanguage answers the language named when jurisdictions.isLocale accepts it, over the member's own, in its canonical form; control: a tag it refuses is LANGUAGE_MALFORMED (R1's rule, C-119.12), and a refused tag is not replaced by the member's own", () => {
  const w = reading();
  w.say("ruth", "es");
  assert.deepEqual(w.m.readingLanguage({ member: "ruth", language: "fr" }), { ok: true, language: "fr", source: "named" });
  assert.equal(w.m.readingLanguage({ member: "ruth", language: "pt-br" }).language, "pt-BR", "canonical form");
  assert.equal(w.m.readingLanguage({ language: "zh-Hant" }).language, "zh-Hant", "no member needed when one is named");
  const bad = w.m.readingLanguage({ member: "ruth", language: "es es" });
  assert.deepEqual([bad.ok, bad.reason, bad.check], [false, "LANGUAGE_MALFORMED", "C-119.12"]);
  assert.equal(bad.translation, word("refusal.LANGUAGE_MALFORMED"));
  /* a member's stored tag is read in its canonical form too */
  w.say("tom", "pt-br");
  assert.equal(w.m.readingLanguage({ member: "tom" }).language, "pt-BR");
});

test("R11 registerMemberLanguageRead takes one read, once: a registered read answering es for one viewer and nothing for another is the language interfaceWords and readingLanguage use when none is named, and the viewer is what the read is asked for; controls: a read that is not a function is PROVIDER_MALFORMED, a second registration PROVIDER_DECLARED, each registering nothing", () => {
  const w = boot();
  for (const bad of [undefined, null, "read", 7, {}, { read() {} }]) {
    const r = w.m.registerMemberLanguageRead(bad);
    assert.deepEqual([r.ok, r.reason], [false, "PROVIDER_MALFORMED"], String(bad));
  }
  /* nothing registered by the refusals: every word is the English, and no language is set */
  assert.equal(w.m.interfaceWords({ viewer: "ruth" }).language, null);
  assert.equal(w.m.readingLanguage({ member: "ruth" }).reason, "LANGUAGE_NOT_SET");
  const asked = [];
  const first = (args) => { asked.push(args.viewer); return { ok: true, language: args.viewer === "ruth" ? "es" : null, set_at: null }; };
  assert.deepEqual(w.m.registerMemberLanguageRead(first), { ok: true });
  const second = w.m.registerMemberLanguageRead(() => ({ ok: true, language: "fr", set_at: null }));
  assert.deepEqual([second.ok, second.reason], [false, "PROVIDER_DECLARED"]);
  assert.equal(w.m.registerMemberLanguageRead(first).reason, "PROVIDER_DECLARED");
  assert.deepEqual(w.m.readingLanguage({ member: "ruth" }), { ok: true, language: "es", source: "member" });
  assert.equal(w.m.readingLanguage({ member: "sam" }).reason, "LANGUAGE_NOT_SET");
  assert.equal(w.m.interfaceWords({ viewer: "ruth" }).language, "es");
  assert.equal(w.m.interfaceWords({ viewer: "sam" }).language, null);
  assert.deepEqual(asked, ["ruth", "sam", "ruth", "sam"], "the first stands, and is asked for the viewer");
  /* a language named is never read through it */
  asked.length = 0;
  assert.equal(w.m.readingLanguage({ member: "ruth", language: "fr" }).language, "fr");
  assert.equal(w.m.interfaceWords({ language: "fr", viewer: "ruth" }).language, "fr");
  assert.deepEqual(asked, []);
});

test("R11 a read that throws, answers no object, answers a promise or answers a value jurisdictions.isLocale does not accept leaves no language set, never a throw: every word is the English and readingLanguage answers LANGUAGE_NOT_SET; control: a read that answers a tag is used", () => {
  const answers = [() => { throw new Error("no answer"); }, () => null, () => "es", () => ({ ok: true, language: 7 }),
                   () => ({ ok: true, language: "not a tag" }), () => Promise.resolve({ ok: true, language: "es" }), () => ({ ok: false })];
  for (const answer of answers) {
    const w = boot();
    w.m.registerMemberLanguageRead(answer);
    const words = w.m.interfaceWords({ viewer: "ruth" });
    assert.equal(words.language, null, String(answer));
    assert.ok(words.words.every((x) => x.fallback && x.text === x.en && x.text));
    assert.equal(words.words.length, interfaceWords().length);
    assert.equal(w.m.readingLanguage({ member: "ruth" }).reason, "LANGUAGE_NOT_SET", String(answer));
  }
  const ok = boot();
  ok.m.registerMemberLanguageRead(() => ({ ok: true, language: "pt-br", set_at: null }));
  assert.equal(ok.m.interfaceWords({ viewer: "ruth" }).language, "pt-BR", "canonical form");
  assert.equal(ok.m.readingLanguage({ member: "ruth" }).language, "pt-BR");
});
