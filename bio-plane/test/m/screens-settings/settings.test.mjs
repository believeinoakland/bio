/* Settings, the index (R17), and Recovery codes (R20), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, env, refuse, recoveryTable } from "./fixtures.mjs";

const links = (o) => all(o.tree, (e) => e.tag === "a" && e.attrs["data-screen"]).map((e) => e.attrs["data-screen"]);

test("R17 settings: \"Yours\" then, to a session that administers, \"The group's\", each a reference to its screen; a member is drawn only their own", async () => {
  const a = await open("settings", { me: ADMIN, table: {} });
  assert.deepEqual(links(a), ["account", "connect", "ties", "notes", "recovery", "group", "group-identity", "members", "places", "security", "translations", "wizards"]);
  for (const id of links(a)) {
    const l = all(a.tree, (e) => e.tag === "a" && e.attrs["data-screen"] === id)[0];
    assert.equal(l.attrs.href, "/app/" + id);
    assert.equal(textOf(l), said(`screen.${id}.name`), id);
  }
  const t = a.text;
  assert.ok(t.indexOf(said("screen.settings.yours")) < t.indexOf(said("screen.settings.groups")), "yours first");
  // control: a member who does not administer is drawn no group section
  const m = await open("settings", { me: MEMBER, table: {} });
  assert.deepEqual(links(m), ["account", "connect", "ties", "notes", "recovery"]);
  lacks(m, "screen.settings.groups");
  assert.ok(!a.html.includes('href="/"'), "no link opens the setup page");
});

test("R20 recovery: the member's own codes (recoverycodesstate); new codes shown once, saying first that issuing again spends the earlier ones", async () => {
  const m = await open("recovery", { me: MEMBER, table: recoveryTable() });
  assert.ok(m.p.requests.some((r) => r.op === "recoverycodesstate"));
  assert.ok(!m.p.requests.some((r) => r.op === "adminrecoverystep"), "a member is not asked the administrators' step");
  has(m, "screen.recovery.held", { remaining: 7, date: day("2026-10-02") });
  has(m, "screen.recovery.spends");
  assert.deepEqual(acts(m.tree).map((b) => b.attrs["data-act"]), ["recoverycodesissue"], "every member issues their own (K3060 D4)");
  const r = await m.press("recoverycodesissue");
  assert.deepEqual(r.sent[0].body, {});
  const shown = all(m.tree, (e) => e.attrs["data-shown"] === "codes")[0];
  assert.equal(all(shown, (e) => e.tag === "code").length, 10);
  assert.ok(m.text.indexOf(said("screen.recovery.spends")) < m.text.indexOf("CODE-0000-SENTINEL"), "said before the codes");
  assert.ok(![...m.b.store.values(), ...m.b.local.values()].some((v) => String(v).includes("SENTINEL")), "never stored");
  assert.ok(!m.b.requests.some((x) => JSON.stringify([x.url, x.body]).includes("CODE-0000")), "never sent");
  // none held; a read that failed
  const none = await open("recovery", { me: MEMBER, table: recoveryTable({ recoverycodesstate: env({ ok: true, held: false, remaining: 0, issuedAt: null }) }) });
  has(none, "screen.recovery.none");
  const failed = await open("recovery", { me: MEMBER, table: recoveryTable({ recoverycodesstate: "none" }) });
  assert.ok(all(failed.tree, (e) => e.attrs["data-state"] === "failed").length >= 1);
  lacks(failed, "screen.recovery.none");
});

test("R20 recovery: to an administrator, adminrecoverystep's note while not met; nothing once met, and a step that did not answer is never drawn as not met", async () => {
  const a = await open("recovery", { me: ADMIN, table: recoveryTable() });
  has(a, "screen.members.recovery.one");
  const met = await open("recovery", { me: ADMIN, table: recoveryTable({ adminrecoverystep: env({ ok: true, administrators: 2, codes_held: true, remaining: 7, met: true }) }) });
  assert.equal(all(met.tree, (e) => e.attrs["data-note"] === "step").length, 0);
  const silent = await open("recovery", { me: ADMIN, table: recoveryTable({ adminrecoverystep: refuse("STORE_DID_NOT_ANSWER") }) });
  assert.equal(all(silent.tree, (e) => e.attrs["data-note"] === "step").length, 0);
});
