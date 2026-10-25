/* screens-investigate R31: the team's themes, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, ADMIN } from "../interface-shell/harness.mjs";
import { open, main, button, fill, press, plane, PATHS, MORE_PATHS, THEME, word, drew, notDrew, dayOf, rawKeys } from "./fixtures.mjs";
import { inWorld, openAs, settled } from "./world.mjs";

const REASON = "It is so.";
const dayIn = (iso) => dayOf(iso.slice(0, 10));

const many = (n) => Array.from({ length: n }, (_, i) => ({ theme_id: "THEME-2026-000" + (i + 1), name: "Theme " + (i + 1), test: "test " + (i + 1), at: "2026-10-0" + (i + 1) + "T09:00:00Z", declared_by_handle: "mai" }));
const admin = (o = {}) => ({ boot: { plane: { ...plane({ plane: o }), whoami: ok(ADMIN) } } });

test("R31 state a: Themes over three themes, each a reference with Belongs when and who declared it and when; no count the read does not answer; the declare form", async () => {
  const { world, me } = await inWorld();
  for (const n of [1, 2, 3]) await me.act("themedeclare", { body: { name: "Theme " + n, test: "test " + n } });
  const p = await openAs(world, me, PATHS.theme);
  const m = main(p);
  const held = (await me.read("themeread", {})).themes;
  assert.equal(held.length, 3);
  drew(m, "theme.never.evidence");
  drew(m, "theme.list.heading");
  assert.equal(m.querySelectorAll(".cs-ref, .cs-card").length, 3);
  drew(m, "theme.declared", { who: me.handle, date: dayIn(held[0].at) });
  assert.ok(m.textContent.includes(word("theme.test.label") + ": " + held[0].test));
  for (const k of ["theme.q.label", "theme.name.label", "theme.test.label", "theme.declare"]) drew(m, k);
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R31 state a: a search sends themeread with the words; declaring sends themedeclare with the name and test and opens the theme", async () => {
  const { world, me } = await inWorld();
  await me.act("themedeclare", { body: { name: "Roof repairs", test: "a document that shows repairs put off" } });
  const p = await openAs(world, me, PATHS.theme);
  fill(p, { "theme-q": "repairs" });
  await press(p, "themeread");
  await settled(p);
  assert.equal(p.byOp("themeread").at(-1).query.q, "repairs");
  fill(p, { "theme-name": "Deferred maintenance", "theme-test": "repairs put off" });
  await press(p, "themedeclare", { reason: REASON });
  await settled(p);
  assert.deepEqual(p.byOp("themedeclare")[0].body, { name: "Deferred maintenance", test: "repairs put off" });
  const made = (await me.read("themeread", {})).themes.find((t) => t.name === "Deferred maintenance");
  assert.ok(made, "the world holds the theme");
  assert.equal(p.location.pathname, "/app/theme/" + made.theme_id);
  const bad = await openAs(world, me, PATHS.theme);
  fill(bad, { "theme-name": "A name without its test" });
  await press(bad, "themedeclare", { reason: REASON });
  await settled(bad);
  drew(main(bad), "refusal.THEME_NO_TEST", undefined, "the store's refusal by its words");
});

test("R31 state b: a placement with who and when and its note, a hunch kept apart, a taken-out placement with who, when and why; control: a hunch is never drawn as a placement", async () => {
  const p = await open(MORE_PATHS.themeOne);
  const m = main(p);
  const sec = (key) => m.querySelectorAll("section").find((s) => s.querySelector("h2").textContent === word(key));
  drew(sec("theme.placed"), "theme.placed.by", { who: "dev", date: dayOf("2026-10-02"), note: "the roof repair" });
  drew(sec("theme.hunches"), "theme.hunch.by", { who: "dev", date: dayOf("2026-10-03"), note: "maybe" });
  drew(sec("theme.hunches"), "theme.hunch.note");
  drew(sec("theme.out"), "theme.out.withdrawn", { who: "mai", date: dayOf("2026-10-04"), reason: "wrong year" });
  notDrew(sec("theme.placed"), "theme.hunch.by", { who: "dev", date: dayOf("2026-10-03"), note: "maybe" });
  assert.equal(sec("theme.placed").querySelectorAll(".cs-ref, .cs-card").length, 1, "only the placement is in the placed list");
  assert.equal(button(p, "themeplace") !== null, true, "It belongs, at the hunch");
  assert.equal(sec("theme.placed").querySelectorAll('button[data-act="themewithdraw"]').length, 0, "Take it out only for the placer or an administrator");
});

test("R31 state b: Take it out (the placer or an administrator, with a reason), It belongs and Reject at a hunch, and a rejected hunch is listed under Taken out", async () => {
  const { world, me } = await inWorld();
  const dev = await world.signIn("dev", { admin: true });
  const project = await world.recipes.project(me, "Roof repairs");
  const docs = [];
  for (const n of ["Roof report", "Gutter report", "Attic report"]) docs.push((await world.recipes.hold(me, n + ".txt", n + " shows repairs put off.", project)).bundle);
  const theme = (await me.act("themedeclare", { body: { name: "Deferred maintenance", test: "repairs put off" } })).theme_id;
  await dev.act("themeplace", { body: { theme, target: docs[0], note: "the roof repair" } });
  await dev.act("themepropose", { body: { theme, target: docs[1], note: "maybe" } });
  await dev.act("themepropose", { body: { theme, target: docs[2], note: "perhaps" } });
  await dev.act("themewithdraw", { body: { theme, target: docs[2], reason: "not it" } });
  const p = await openAs(world, me, "/app/theme/" + theme);
  const held = await me.read("themeread", { query: { id: theme } });
  const gone = held.withdrawn.find((w) => w.document === docs[2]);
  assert.equal(gone.state, "rejected", "the world: a rejected hunch");
  drew(main(p), "theme.out.rejected", { who: "dev", date: dayIn(gone.ended_at), reason: "not it" });
  const takeout = main(p).querySelectorAll('button[data-act="themewithdraw"]');
  assert.equal(takeout.length, 2, "an administrator may take out the placement and reject the hunch");
  await press(p, "themewithdraw", { el: takeout[0], reason: "a duplicate" });
  await settled(p);
  assert.deepEqual(p.byOp("themewithdraw")[0].body, { theme, target: docs[0], reason: "a duplicate" });
  await press(p, "themeplace", { el: button(p, "themeplace") });
  await settled(p);
  assert.deepEqual(p.byOp("themeplace")[0].body, { theme, target: docs[1] });
  const after = await me.read("themeread", { query: { id: theme } });
  assert.deepEqual(after.members.map((x) => x.document), [docs[1]], "the world: the hunch now belongs");
  assert.deepEqual(after.withdrawn.filter((w) => w.state === "withdrawn").map((w) => [w.document, w.reason]), [[docs[0], "a duplicate"]], "and the placement is taken out with its reason");
});

test("R31 a theme that answers as absent draws Nothing is here; names are handles only; a document the member may not see is left out by the owner, so none is drawn", async () => {
  const p = await open(MORE_PATHS.themeOne, { plane: { themeread: refusedIn("THEME_NOT_FOUND", "No such theme.") } });
  drew(main(p), "shell.unavailable.nothing.title");
  const q = await open(MORE_PATHS.themeOne, { plane: { themeread: ok(THEME({ members: [], hunches: [], withdrawn: [] })) } });
  assert.equal(main(q).querySelectorAll("section").length, 0, "nothing placed, nothing hunched, nothing out: no empty section");
  assert.doesNotMatch(main(q).textContent, /member:|ENT-\d/);
});

test("R10 theme, a matter and a progression: each read pending, refused and unanswered is drawn in its own state, with no key drawn bare", async () => {
  for (const [path, ops] of [[PATHS.theme, ["themeread"]], [MORE_PATHS.themeOne, ["themeread"]], [MORE_PATHS.matter, ["instance"]], [MORE_PATHS.progression, ["progression"]]]) {
    for (const variant of [refusedIn("SOME_REFUSAL", "The plane refused this read."), () => new Promise(() => {})]) {
      const p = await open(path, { plane: Object.fromEntries(ops.map((o) => [o, variant])) });
      assert.ok(main(p).textContent.length > 0, path);
      assert.deepEqual(rawKeys(p.root()), [], path);
    }
  }
});
