/* A member's language (R64; DEC-127 (1)) at the module's interface: the module over the real record-core and its
   routes through the frame control-plane joins them to. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, frame } from "./fixture.mjs";
import { INSTANCE_SETUP_CHECKS, INSTANCE_SETUP_TABLE_DECLARATIONS, isLanguageTag } from "../../../src/setup.mjs";

const call = async (m, path, body) => (await frame(m, new Request(`http://do/${path}`,
  body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) }))).json();

test("R64 memberLanguageSet keeps any one well-formed BCP 47 tag as given, the member's own act: a machine or no member is MACHINE_CANNOT_SET_LANGUAGE (C-119.11), anything else LANGUAGE_MALFORMED (C-119.12); nothing written on a refusal", async () => {
  let t = Date.parse("2026-10-06T09:00:00Z");
  const w = await boot({ now: () => t });
  for (const by of [null, "", "  ", "class:ai", "class:admin", 7]) {
    const r = w.m.memberLanguageSet({ language: "es", by });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "MACHINE_CANNOT_SET_LANGUAGE", "C-119.11"], String(by));
    assert.equal(r.translation, INSTANCE_SETUP_CHECKS.MACHINE_CANNOT_SET_LANGUAGE.translation);
  }
  for (const bad of [undefined, "", "  ", "en US", "en,es", "e", "xx-YYYY-zzzzzzzzzzzz", "12", "en--US", 7, {}, ["en"],
                     "a".repeat(300)]) {
    const r = w.m.memberLanguageSet({ language: bad, by: "ruth" });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "LANGUAGE_MALFORMED", "C-119.12"], JSON.stringify(bad));
    assert.equal(r.translation, INSTANCE_SETUP_CHECKS.LANGUAGE_MALFORMED.translation);
  }
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM member_languages`).get().n, 0);
  /* any well-formed tag is kept, as given: a tag no translation is held for included */
  for (const tag of ["es", "zh-Hant", "pt-BR", "yue-Hant-HK", "tlh", "ase"]) {
    assert.equal(isLanguageTag(tag), true, tag);
    const r = w.m.memberLanguageSet({ language: ` ${tag} `, by: "ruth" });
    assert.deepEqual([r.ok, r.member, r.language], [true, "ruth", tag], tag);
  }
  assert.match(w.m.memberLanguageSet({ language: "es", by: "ruth" }).note, /in English where none is/);
});

test("R64 memberLanguage answers the viewer's own {language, set_at}, latest first, and nobody else's; null clears the choice and is appended with when; a viewer with none, or a machine, reads null", async () => {
  let t = Date.parse("2026-10-06T09:00:00Z");
  const w = await boot({ now: () => t });
  assert.deepEqual(w.m.memberLanguage({ viewer: "ruth" }), { ok: true, language: null, set_at: null });
  w.m.memberLanguageSet({ language: "es", by: "ruth" });
  t += 60_000;
  w.m.memberLanguageSet({ language: "fr", by: "ada" });
  assert.deepEqual(w.m.memberLanguage({ viewer: "ruth" }), { ok: true, language: "es", set_at: "2026-10-06T09:00:00.000Z" });
  assert.deepEqual(w.m.memberLanguage({ viewer: "ada" }), { ok: true, language: "fr", set_at: "2026-10-06T09:01:00.000Z" });
  t += 60_000;
  const cleared = w.m.memberLanguageSet({ language: null, by: "ruth" });
  assert.deepEqual([cleared.ok, cleared.language], [true, null]);
  assert.match(cleared.note, /device's setting/);
  assert.deepEqual(w.m.memberLanguage({ viewer: "ruth" }), { ok: true, language: null, set_at: "2026-10-06T09:02:00.000Z" });
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM member_languages WHERE member='ruth'`).get().n, 2, "appended, never overwritten");
  for (const viewer of [null, "", "class:admin", "nobody"]) assert.equal(w.m.memberLanguage({ viewer }).language, null, String(viewer));
  /* a purge clears no member's choice */
  w.record.purge({});
  assert.equal(w.m.memberLanguage({ viewer: "ada" }).language, "fr");
  assert.deepEqual(INSTANCE_SETUP_TABLE_DECLARATIONS.find((d) => d.name === "member_languages").purge, "exempt");
});

test("R64 R29 over the routes: op=memberlanguageset takes the member from the control plane's stamp, never the body, so no one sets it for another; op=memberlanguage reads the stamped viewer's own", async () => {
  const w = await boot();
  const forged = await call(w.m, "memberlanguageset?by=ruth", { language: "de", by: "ada", member: "ada" });
  assert.deepEqual([forged.result.ok, forged.result.member], [true, "ruth"]);
  assert.equal(w.m.memberLanguage({ viewer: "ada" }).language, null);
  assert.equal((await call(w.m, "memberlanguage?viewer=ruth")).result.language, "de");
  assert.equal((await call(w.m, "memberlanguage?viewer=ada", { viewer: "ruth" })).result.language, null);
  assert.equal((await call(w.m, "memberlanguageset?by=class:ai", { language: "de" })).result.reason, "MACHINE_CANNOT_SET_LANGUAGE");
});
