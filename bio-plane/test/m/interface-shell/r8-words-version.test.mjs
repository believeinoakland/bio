/* interface-shell R128 (fix round 8, G114; K4814 (1), K4817): the words request names the release, the viewer's language and the team's
   adoptions stamp in `v`, as `<release>~<language>~<stamp>`. `loadWords` is sent at `whoami`'s answer and `bootstrap` (which carries the
   language and the stamp, instance-setup R103) after the screen's first reads (R122), so a load before `bootstrap` has answered names
   the release alone, and the shell keeps what `bootstrap` answered on the device (`cs-words:<member>`) for the loads that follow. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, ok, httpError } from "./harness.mjs";
import { inWorld, bootAs, doorAs, translated } from "./world.mjs";

const held = { id: "held", words: [], reads: () => ({ h: { op: "heldcaptures", query: { limit: "5" } } }), acts: [],
  render: (cs, view) => cs.state("h", view, () => '<p id="seen">held</p>') };
const REL = "0.86.0";
const plane = (more = {}) => ({ heldcaptures: ok({ items: [{ id: "h1" }] }), ...more });
const page = (world, me, more = {}, o = {}) => bootAs(world, me, { screens: [held], path: "/app/held", version: REL, plane: plane(more), ...o });
const vs = (p) => p.byOp("interfacewords").map((r) => r.query.v);
/* the language and the stamp the store answers `bootstrap` with for the member: what the page then names, read from the world and not copied */
const facts = async (me) => { const b = await me.read("bootstrap"); return { language: b.language, stamp: b.words_version }; };
const NOTE = (member, l, s) => ({ ["cs-words:" + member]: JSON.stringify({ l, s }) });
const named = ({ language, stamp }) => REL + "~" + (language || "") + "~" + stamp;
/* a founder's world where the team offers es and fr, holds "Inicio" in es, and the founder reads es */
const spanish = async () => {
  const { world, me } = await inWorld({ founder: true });
  await translated(me, "es", [["rail.home.name", "Inicio"]]);
  await me.act("grouplanguagesset", { body: { languages: ["es", "fr"] } });
  return { world, me };
};

test("R128 a first load of a member the device holds no note of names the release alone; once bootstrap answers, the full v is asked and the note kept", async () => {
  const { world, me } = await spanish();
  const f = await facts(me);
  assert.equal(f.language, "es");
  assert.ok(f.stamp, "the store states a stamp");
  const p = await page(world, me);
  assert.deepEqual(vs(p), [REL, named(f)], "the release alone first, then all three");
  assert.deepEqual(JSON.parse(p.local.get("cs-words:" + me.member)), { l: "es", s: f.stamp });
  assert.ok(p.byOp("interfacewords").every((r) => r.query.language === undefined), "never a `language` field: that asks every word");
});

test("R128 a load whose device holds the member's note names the release, the language and the stamp at once, and asks no second time", async () => {
  const { world, me } = await spanish();
  const f = await facts(me);
  const p = await page(world, me, {}, { local: NOTE(me.member, "es", f.stamp) });
  assert.deepEqual(vs(p), [named(f)]);
});

test("R128 a language change or a changed stamp changes v; a null language is an empty part", async () => {
  const { world, me } = await spanish();
  const before = await facts(me);
  await me.act("memberlanguageset", { body: { language: "fr" } });
  const french = await facts(me);
  assert.equal(french.language, "fr");
  const a = await page(world, me, {}, { local: NOTE(me.member, "es", before.stamp) });
  assert.deepEqual(vs(a), [named(before), named(french)], "the language changed");
  await me.act("translationadopt", { body: { language: "es", key: "rail.queue.name", text: "Cola" } });
  const later = await facts(me);
  assert.notEqual(later.stamp, french.stamp, "an adoption changes the stamp");
  const b = await page(world, me, {}, { local: NOTE(me.member, french.language, french.stamp) });
  assert.deepEqual(vs(b), [named(french), named(later)], "the stamp changed");
  const bare = await inWorld({ founder: true });
  const none = await facts(bare.me);
  assert.equal(none.language, null);
  const c = await page(bare.world, bare.me);
  assert.deepEqual(vs(c), [REL, named(none)], "no language is an empty part");
  assert.deepEqual(JSON.parse(c.local.get("cs-words:" + bare.me.member)), { l: "", s: none.stamp });
});

test("R128 another member's note is not used; control: a bootstrap that names no stamp or fails keeps the release alone and writes no note", async () => {
  const { world, me } = await spanish();
  const f = await facts(me);
  const other = await page(world, me, {}, { local: NOTE("someone-else", "de", "zz") });
  assert.equal(vs(other)[0], REL, "another member's note is not this member's");
  const door = doorAs(world, me).door;
  const unstamped = async (req) => { const a = await door(req); delete a.json.words_version; return a; };
  for (const [name, more] of [["no stamp", { bootstrap: unstamped }], ["failed", { bootstrap: httpError(500) }]]) {
    const p = await page(world, me, more);
    assert.deepEqual(vs(p), [REL], name);
    assert.ok(!p.local.has("cs-words:" + me.member), name);
  }
  assert.ok(f.stamp);
});

test("R128 a page that names no release sends no v, with or without a note; storage that denies every use renders and asks the release alone", async () => {
  const { world, me } = await spanish();
  const f = await facts(me);
  const bare = await bootAs(world, me, { screens: [held], path: "/app/held", local: NOTE(me.member, "es", f.stamp), plane: plane() });
  assert.deepEqual(vs(bare), [undefined]);
  const denied = await page(world, me, {}, { localThrows: true, local: {} });
  assert.equal(denied.doc.getElementById("seen").textContent, "held");
  assert.equal(vs(denied)[0], REL);
});
