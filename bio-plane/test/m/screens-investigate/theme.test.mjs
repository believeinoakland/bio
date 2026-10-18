/* screens-investigate R31: the team's themes, on interface-shell's served page over a scripted plane. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, refusedIn, ADMIN } from "../interface-shell/harness.mjs";
import { open, main, button, fill, press, plane, PATHS, MORE_PATHS, THEME, word, drew, notDrew, dayOf, rawKeys } from "./fixtures.mjs";

const many = (n) => Array.from({ length: n }, (_, i) => ({ theme_id: "THEME-2026-000" + (i + 1), name: "Theme " + (i + 1), test: "test " + (i + 1), at: "2026-10-0" + (i + 1) + "T09:00:00Z", declared_by_handle: "mai" }));
const admin = (o = {}) => ({ boot: { plane: { ...plane({ plane: o }), whoami: ok(ADMIN) } } });

test("R31 state a: Themes over three themes, each a reference with Belongs when and who declared it and when; no count the read does not answer; the declare form", async () => {
  const p = await open(PATHS.theme, { plane: { themeread: ok({ ok: true, themes: many(3), truncated: false }) } });
  const m = main(p);
  drew(m, "theme.never.evidence");
  drew(m, "theme.list.heading");
  assert.equal(m.querySelectorAll(".cs-ref, .cs-card").length, 3);
  drew(m, "theme.declared", { who: "mai", date: dayOf("2026-10-01") });
  assert.ok(m.textContent.includes(word("theme.test.label") + ": test 1"));
  for (const k of ["theme.q.label", "theme.name.label", "theme.test.label", "theme.declare"]) drew(m, k);
  assert.deepEqual(rawKeys(p.root()), []);
});

test("R31 state a: a search sends themeread with the words; declaring sends themedeclare with the name and test and opens the theme", async () => {
  const p = await open(PATHS.theme, { plane: { themeread: ok({ ok: true, themes: many(1), truncated: false }), themedeclare: ok({ ok: true, theme_id: "THEME-2026-0009", name: "N", test: "T" }) } });
  fill(p, { "theme-q": "repairs" });
  await press(p, "themeread");
  assert.equal(p.byOp("themeread").at(-1).query.q, "repairs");
  fill(p, { "theme-name": "Deferred maintenance", "theme-test": "repairs put off" });
  await press(p, "themedeclare");
  assert.deepEqual(p.byOp("themedeclare")[0].body, { name: "Deferred maintenance", test: "repairs put off" });
  assert.equal(p.location.pathname, "/app/theme/THEME-2026-0009");
  const bad = await open(PATHS.theme, { plane: { themedeclare: refusedIn("THEME_NO_TEST", "A theme needs its test.") } });
  await press(bad, "themedeclare");
  drew(main(bad), "refusal.THEME_NO_TEST", undefined, "the owner's refusal by its words");
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
  const p = await open(MORE_PATHS.themeOne, { ...admin({ themeread: ok(THEME({ withdrawn: [{ target: "INFO-2026-0003", target_kind: "document", state: "rejected", ended_by_handle: "dev", ended_at: "2026-10-05T09:00:00Z", reason: "not it" }] })), themewithdraw: ok({ ok: true }), themeplace: ok({ ok: true }) }) });
  drew(main(p), "theme.out.rejected", { who: "dev", date: dayOf("2026-10-05"), reason: "not it" });
  const takeout = main(p).querySelectorAll('button[data-act="themewithdraw"]');
  assert.equal(takeout.length, 2, "an administrator may take out the placement and reject the hunch");
  await press(p, "themewithdraw", { el: takeout[0], reason: "a duplicate" });
  assert.deepEqual(p.byOp("themewithdraw")[0].body, { theme: "THEME-2026-0001", target: "INFO-2026-0001", reason: "a duplicate" });
  await press(p, "themeplace", { el: button(p, "themeplace") });
  assert.deepEqual(p.byOp("themeplace")[0].body, { theme: "THEME-2026-0001", target: "INFO-2026-0002" });
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
