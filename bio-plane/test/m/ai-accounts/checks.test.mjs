/* ai-accounts R52, R53, R54 at the interface: the seven checks P1 to P7, the team's all ticked until set and locked below, a
   project's and a member's own, and what `checksInForce` answers for an act. Every id is tested with a negative control (K874). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PLANS as P, ENTRIES as E, HOSTS } from "./catalogue.mjs";
import { shape, refusal, ask, act, projectWorld } from "./helpers.mjs";
import { CHECK_IDS } from "../../../src/ai-accounts/index.mjs";

const ALL = Object.fromEntries(CHECK_IDS.map((c) => [c, true]));

test("R52: the checks are P1 to P7; all ticked at the team until set; checksSet({level: group}) is the team's, by administrators only (NOT_AN_ADMIN, a machine refused); an unknown check is CHECK_UNKNOWN; every change is recorded (who, when, which check, level; R16)", async () => {
  const w = await projectWorld();
  assert.deepEqual([...CHECK_IDS], ["P1", "P2", "P3", "P4", "P5", "P6", "P7"]);
  assert.deepEqual(w.a.checksState({ level: "group", viewer: "admin" }).ticks, ALL, "all ticked by default");
  assert.deepEqual(w.a.checksInForce({ member: "ann", act: ask("ann") }).checks, [...CHECK_IDS]);
  assert.deepEqual(w.a.checksSet({ level: "group", check: "P3", ticked: false, by: "admin" }), { ok: true, level: "group", check: "P3", ticked: false });
  assert.equal(w.a.checksState({ level: "group", viewer: "second" }).ticks.P3, false);
  assert.deepEqual(w.a.checksInForce({ member: "ann", act: ask("ann") }).checks, ["P1", "P2", "P4", "P5", "P6", "P7"]);
  for (const by of ["ann", "class:ai", null, "token:ai"]) assert.equal(w.a.checksSet({ level: "group", check: "P3", ticked: true, by }).reason, "NOT_AN_ADMIN", String(by));
  const unk = w.a.checksSet({ level: "group", check: "P8", ticked: true, by: "admin" });
  assert.equal(unk.reason, "CHECK_UNKNOWN");
  assert.equal(w.a.checksSet({ level: "group", check: "terms_permit_use", ticked: true, by: "admin" }).reason, "CHECK_UNKNOWN", "the shown-only facts are not checks");
  assert.equal(w.a.checksSet({ level: "group", check: "P3", ticked: "yes", by: "admin" }).reason, "SWITCH_VALUE_INVALID");
  assert.equal(w.a.checksState({ level: "group", viewer: "ann" }).reason, "NOT_AN_ADMIN");
  const hist = w.a.accountHistory({ owner: "group", viewer: "admin" }).changes.filter((c) => c.change === "check_set");
  assert.deepEqual(hist.map((c) => [c.check, c.ticked, c.by, c.level]), [["P3", false, "admin", "group"]]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM ai_check_ticks`).n, 1);
});

test("R52 R53: a check ticked at team level is locked: no project or member can unset it (CHECK_LOCKED naming the level that holds it); one the team left unticked may be ticked or unticked by a project's owner for work directly in the project (PROJECT_ACT_NOT_THE_OWNER otherwise) and by a member for their own choices (that member only); a member who is not an owner cannot unset a project's tick (CHECK_LOCKED naming the project); every change recorded", async () => {
  const w = await projectWorld();
  w.a.checksSet({ level: "group", check: "P3", ticked: false, by: "admin" });
  const locked = w.a.checksSet({ level: "project:P", check: "P1", ticked: false, by: "ann" });
  assert.deepEqual([locked.reason, locked.level, locked.check_id], ["CHECK_LOCKED", "group", "P1"]);
  assert.match(locked.detail, /team/);
  assert.equal(w.a.checksSet({ level: "member:ann", check: "P1", ticked: false, by: "ann" }).reason, "CHECK_LOCKED");
  assert.deepEqual(w.a.checksSet({ level: "project:P", check: "P3", ticked: true, by: "ann" }), { ok: true, level: "project:P", check: "P3", ticked: true });
  assert.deepEqual(w.a.checksSet({ level: "member:bob", check: "P3", ticked: true, by: "bob" }), { ok: true, level: "member:bob", check: "P3", ticked: true });
  assert.equal(w.a.checksSet({ level: "member:bob", check: "P3", ticked: false, by: "bob" }).ok, true, "a member ticks and unticks one for themselves");
  assert.equal(w.a.checksSet({ level: "member:bob", check: "P3", ticked: true, by: "bob" }).ok, true);
  assert.equal(w.a.checksSet({ level: "project:P", check: "P3", ticked: true, by: "eve" }).code, "NO_SUCH_PROJECT");
  assert.equal(w.a.checksSet({ level: "project:P", check: "P5", ticked: true, by: "bob" }).reason, "PROJECT_ACT_NOT_THE_OWNER");
  const bobUnsets = w.a.checksSet({ level: "project:P", check: "P3", ticked: false, by: "bob" });
  assert.deepEqual([bobUnsets.reason, bobUnsets.level], ["CHECK_LOCKED", "project"], "a project's tick by a member who is not an owner");
  assert.equal(w.a.checksSet({ level: "member:bob", check: "P3", ticked: false, by: "ann" }).reason, "NOT_YOUR_ACCOUNT", "that member only");
  assert.equal(w.a.checksSet({ level: "member:bob", check: "P3", ticked: true, by: "class:ai" }).reason, "MACHINE_CANNOT_HOLD_ACCOUNT");
  assert.equal(w.a.checksSet({ level: "project:P", check: "P9", ticked: true, by: "ann" }).reason, "CHECK_UNKNOWN");
  assert.equal(w.a.checksState({ level: "project:P", viewer: "ann" }).ticks.P3, true);
  assert.equal(w.a.checksState({ level: "project:P", viewer: "ann" }).ticks.P1, false, "a project's are unticked until set");
  assert.equal(w.a.checksState({ level: "member:bob", viewer: "ann" }).reason, "NOT_YOUR_ACCOUNT");
  const hp = w.a.accountHistory({ owner: "project:P", viewer: "ann" }).changes.filter((c) => c.change === "check_set");
  assert.deepEqual(hp.map((c) => [c.check, c.ticked, c.by, c.level]), [["P3", true, "ann", "project"]]);
  const hm = w.a.accountHistory({ owner: "member:bob", viewer: "bob" }).changes.filter((c) => c.change === "check_set");
  assert.deepEqual(hm.map((c) => [c.check, c.ticked]), [["P3", true], ["P3", false], ["P3", true]]);
});

test("R53 R54: a project's tick binds all work directly in the project, whoever does it and on whichever account, a personal subscription included, and does not reach work outside it; checksInForce answers {checks, sources}: `checks` the team's ticked checks plus the project's when the act is directly in the project (R11) plus the acting member's own, `sources` for each check every level that ticks it in the order group, project, member; a level that ticks nothing is absent, it names no member but the acting one and no project but the act's; unreadable answers {unreadable: true}", async () => {
  const w = await projectWorld();
  for (const c of ["P2", "P3", "P4", "P5", "P6", "P7"]) w.a.checksSet({ level: "group", check: c, ticked: false, by: "admin" });
  w.a.checksSet({ level: "project:P", check: "P3", ticked: true, by: "ann" });
  w.a.checksSet({ level: "member:ann", check: "P3", ticked: true, by: "ann" });
  w.a.checksSet({ level: "member:ann", check: "P5", ticked: true, by: "ann" });
  w.a.checksSet({ level: "member:bob", check: "P7", ticked: true, by: "bob" });
  const f = w.a.checksInForce({ member: "ann", act: ask("ann", "P") });
  assert.deepEqual(f, { checks: ["P1", "P3", "P5"], sources: { P1: ["group"], P3: ["project", "member"], P5: ["member"] } });
  const noProject = w.a.checksInForce({ member: "ann", act: ask("ann") });
  assert.deepEqual(noProject.sources, { P1: ["group"], P3: ["member"], P5: ["member"] }, "no project source for an act outside the project");
  assert.deepEqual(w.a.checksInForce({ member: "bob", act: ask("bob", "P") }).sources, { P1: ["group"], P3: ["project"], P7: ["member"] }, "another member's own tick appears nowhere in ann's");
  assert.equal(Object.keys(w.a.checksInForce({ member: "ann", act: ask("ann", "S") }).sources).includes("P7"), false);
  /* the project's tick binds bob's act in P whichever account serves it, and not his act outside */
  const mine = await w.own("bob");
  w.a.accountSwitch({ account_id: mine.account_id, on: true, by: "bob" });
  w.a.recipientNoticeSeen({ member: "bob", provider: P.provider, host: HOSTS.main, by: "bob" });
  const { setCheck } = await import("./catalogue.mjs");
  await setCheck(w, E.a, "P3", false);
  await setCheck(w, E.b, "P3", false);
  assert.equal((await w.a.accountFor({ member: "bob", act: ask("bob", "P") })).reason, "NO_ENTRY_OFFERED", "the project's P3 binds the act in the project");
  assert.equal((await w.a.accountFor({ member: "bob", act: ask("bob") })).ok, true, "and does not reach work outside it");
  /* unreadable: fail closed */
  w.sql.exec(`ALTER TABLE ai_check_ticks RENAME TO ai_check_ticks_gone`);
  assert.deepEqual(w.a.checksInForce({ member: "ann", act: ask("ann", "P") }), { unreadable: true });
  assert.equal(w.a.checksState({ level: "group", viewer: "admin" }).unreadable, true);
  assert.equal(w.a.checksSet({ level: "group", check: "P2", ticked: true, by: "admin" }).unreadable, true);
});
