/* Settings › Your group at the module's interface (R18): every member reads it; an administrator's acts each send their
   owner's arguments; a member is drawn none. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, open, said, SCREENS } from "./kit.mjs";
import { ADMIN, MEMBER, env, groupTable } from "./fixtures.mjs";

const ops = (o) => [...new Set(acts(o.tree).map((b) => b.attrs["data-act"]))].sort();
// the acts the screen draws: its own declaration (contract.test holds it to the registry's)
const ALL = SCREENS.find((s) => s.id === "group").acts.map((a) => a.op).sort();

test("R18 group: what the group chose is drawn to every member; the acts only to an administrator (control: a member is drawn none)", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  for (const op of ["groupidentity", "grouplanguages", "courtnotice", "hostingaccess", "strengthbarof"]) assert.ok(a.p.all.some((r) => r.op === op), op);
  has(a, "screen.group.name.now", { name: "East Oakland Watch" });
  has(a, "screen.group.domain.verified", { domain: "eastoak.example", date: day("2026-10-03") });
  has(a, "screen.group.languages.now", { languages: "English, Spanish" });
  has(a, "screen.group.court.tell");
  assert.ok(a.text.includes("Rosa and Lu"));
  assert.ok(a.text.includes("Most of our sources are records."));
  assert.deepEqual(ops(a), ALL);
  const m = await open("group", { me: MEMBER, table: groupTable() });
  assert.deepEqual(ops(m), [], "absent, not greyed");
  has(m, "screen.group.admins");
  has(m, "screen.group.name.now", { name: "East Oakland Watch" });
});

test("R18 group: groupnameset, groupdomainset, grouplanguagesset, courtnoticeset, hostingaccessset and strengthbarset (reasoned) send their owners' arguments", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  // a reason given wherever the shell asks one (its R11, by op-grades' rung)
  const body = async (op, values, data = {}) => { const r = await a.press(op, { values, data, reason: "as agreed" }); if (!r.sent.length) return null; const { reason, ...b } = r.sent[0].body; return op === "strengthbarset" ? r.sent[0].body : b; };
  assert.deepEqual(await body("groupnameset", { "gr-name": " East Oakland Watch Collective " }), { name: "East Oakland Watch Collective" });
  assert.equal(await body("groupnameset", { "gr-name": " " }), null);
  assert.equal(a.refused.key, "screen.group.name.empty");
  assert.deepEqual(await body("groupdomainset", { "gr-domain": "watch.example" }), { domain: "watch.example" });
  // the languages are ticked by name; the tags are the boxes' ids and the body's values only (R31)
  assert.deepEqual(await body("grouplanguagesset", { "gr-lang-vi": true }), { languages: ["en", "es", "vi"] });
  assert.equal(await body("grouplanguagesset", { "gr-lang-en": false, "gr-lang-es": false, "gr-lang-vi": false }), null, "one at least");
  assert.equal(a.refused.key, "screen.group.languages.count");
  const many = Object.fromEntries(["zh", "yue", "vi", "tl", "ko", "ja", "fr", "ar", "ru", "pt", "hi", "so", "am", "ti", "fa", "uk", "hy", "km", "th", "ht", "de"].map((t) => ["gr-lang-" + t, true]));
  assert.equal(await body("grouplanguagesset", many), null, "twenty at most");
  assert.deepEqual(await body("courtnoticeset", { "gr-court-dont": true }), { choice: "dont" });
  assert.deepEqual(await body("courtnoticeset", { "gr-court-tell": true }), { choice: "tell" });
  assert.deepEqual(await body("hostingaccessset", { "gr-holders": "Rosa", "gr-hnote": "" }), { holders: "Rosa" });
  assert.deepEqual(await body("hostingaccessset", { "gr-holders": "Rosa", "gr-hnote": "vault" }), { holders: "Rosa", note: "vault" });
  assert.deepEqual(await body("strengthbarset", { "gr-cap": "A", "gr-con": "", "gr-why": "We publish only firsthand records." }), { capture: "A", connection: null, reason: "We publish only firsthand records." });
  assert.equal(await body("strengthbarset", { "gr-cap": "A", "gr-con": "", "gr-why": "" }), null, "reasoned: no reason, nothing sent");
  assert.equal(a.refused.key, "screen.group.bar.noreason");
  assert.equal(await body("strengthbarset", { "gr-cap": "", "gr-con": "", "gr-why": "x" }), null);
  assert.equal(a.s.acts.find((x) => x.op === "strengthbarset").reasonField, "reason");
});

test("R18 group: grouplogoset sends the chosen PNG or JPEG's own bytes as the body with its type, nothing in the address; another type sends nothing", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable() });
  const spec = a.s.acts.find((x) => x.op === "grouplogoset");
  const png = { type: "image/png", size: 1200, name: "logo.png" };
  const cs = { file: () => png };
  assert.deepEqual(spec.send({}, {}, cs), { raw: png, rawType: "image/png" });
  assert.deepEqual(spec.send({}, {}, { file: () => ({ type: "image/jpeg", size: 1 }) }).rawType, "image/jpeg");
  assert.deepEqual(spec.send({}, {}, { file: () => ({ type: "image/gif", size: 1 }) }), { refuse: "screen.group.logo.type" });
  assert.deepEqual(spec.send({}, {}, { file: () => ({ type: "image/png", size: 200 * 1024 + 1 }) }), { refuse: "screen.group.logo.size" });
  assert.deepEqual(spec.send({}, {}, { file: () => null }), { refuse: "screen.group.logo.nofile" });
  const set = await open("group", { me: ADMIN, table: groupTable({ groupidentity: env({ group: "g", display_name: "G", logo: true }) }) });
  has(set, "screen.group.logo.set");
});

test("R31 group: every language is shown by its name in the member's language and ticked by name; a tag such as en-US is never shown or typed", async () => {
  const a = await open("group", { me: ADMIN, table: groupTable({ grouplanguages: env({ ok: true, languages: ["en-US", "es", "vi"] }) }) });
  assert.ok(a.text.includes("English") && a.text.includes("Spanish") && a.text.includes("Vietnamese"));
  assert.ok(!/\ben-US\b|\bvi\b|\bes\b/.test(a.text), "no tag is drawn");
  assert.equal(all(a.tree, (e) => e.tag === "input" && e.attrs.type === "text" && /lang/.test(e.attrs.id || "")).length, 0, "no tag is typed");
  const boxes = all(a.tree, (e) => e.tag === "input" && e.attrs.type === "checkbox" && /^gr-lang-/.test(e.attrs.id));
  assert.ok(boxes.length >= 20 && boxes.every((b) => a.tree && all(a.tree, (l) => l.tag === "label" && l.attrs.for === b.attrs.id).length === 1), "each box has its label, the language's name");
  assert.deepEqual(boxes.filter((b) => "checked" in b.attrs).map((b) => b.attrs.id), ["gr-lang-en-US", "gr-lang-es", "gr-lang-vi"], "the languages set are ticked");
  // in the member's language
  const es = await open("group", { me: ADMIN, table: groupTable({ memberlanguage: env({ ok: true, language: "es" }) }) });
  has(es, "screen.group.languages.now", { languages: "Inglés, Español" });
  // a member who does not administer reads them too, with no box
  const m = await open("group", { me: MEMBER, table: groupTable() });
  has(m, "screen.group.languages.now", { languages: "English, Spanish" });
  assert.equal(all(m.tree, (e) => e.tag === "input").length, 0);
});

test("R33 group: a hosting account recorded at setup or by the system is set at setup, never a credential's name", async () => {
  for (const by of ["admin", "member:admin", "token:setup-1", "class:daemon", ""]) {
    const a = await open("group", { me: MEMBER, table: groupTable({ hostingaccess: env({ ok: true, recorded: true, current: { holders: "Rosa", note: null, recorded_by: by, at: "2026-10-04T00:00:00Z" }, history: [], limit: 50, truncated: false }) }) });
    has(a, "settings.set.setup");
    has(a, "screen.group.hosting.now", { by: said("settings.set.setup"), date: day("2026-10-04") });
    assert.ok(!/\badmin\b|token:|class:/.test(a.text), `${JSON.stringify(by)} is not drawn`);
  }
  // control: a member who recorded it is named
  const r = await open("group", { me: MEMBER, table: groupTable() });
  has(r, "screen.group.hosting.now", { by: "rosa", date: day("2026-10-04") });
});

test("R28 group: a section that holds nothing is not drawn, and nothing says there is none", async () => {
  const empty = { groupidentity: env({ group: "g", display_name: null, domain: null, domain_verified_at: null, logo: false }), grouplanguages: env({ ok: true, languages: [] }), hostingaccess: env({ ok: true, recorded: false, current: null, history: [] }), strengthbarof: env({ ok: true, group: "g", bar: null }) };
  const m = await open("group", { me: MEMBER, table: groupTable(empty) });
  for (const k of ["screen.group.name.none", "screen.group.logo.none", "screen.group.domain.none", "screen.group.languages.none", "screen.group.hosting.none", "screen.group.bar.none"]) assert.ok(!m.text.includes(said(k)), k);
  for (const k of ["name", "domain", "languages", "hosting", "bar"]) assert.equal(all(m.tree, (e) => e.tag === "h2" && e.children.some((c) => (c.text || "").includes(said("screen.group." + k + ".heading")))).length, 0, `no ${k} section`);
  // control: a read that failed is still drawn as failed
  const f = await open("group", { me: MEMBER, table: groupTable({ groupidentity: "none" }) });
  assert.ok(all(f.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
});
