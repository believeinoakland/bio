/* Settings, the index (R17), and Recovery codes (R20), at the module's interface. */
import test from "node:test";
import assert from "node:assert/strict";
import { acts, all, ancestor, day, has, lacks, open, said, textOf } from "./kit.mjs";
import { ADMIN, MEMBER, env, refuse, recoveryTable } from "./fixtures.mjs";

const links = (o) => all(o.tree, (e) => e.tag === "a" && e.attrs["data-screen"]).map((e) => e.attrs["data-screen"]);

test("R17 settings: \"Yours\" then, to a session that administers, \"The group's\", each a reference to its screen; a member is drawn only their own", async () => {
  const a = await open("settings", { me: ADMIN, table: {} });
  assert.deepEqual(links(a), ["account", "connect", "ties", "notes", "recovery", "group", "group-identity", "members", "places", "security", "updates", "translations", "wizards"]);
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

test("R32 settings draws its sections as the design's link list: each its icon and its screen's name as the reference, its purpose beneath, the two never run together", async () => {
  const a = await open("settings", { me: ADMIN, table: {} });
  const lists = all(a.tree, (e) => /\bmk-links\b/.test(e.attrs.class || ""));
  assert.equal(lists.length, 2, "Yours, and the group's");
  for (const id of links(a)) {
    const l = all(a.tree, (e) => e.tag === "a" && e.attrs["data-screen"] === id)[0];
    assert.equal(all(l, (e) => e.tag === "svg").length, 1, `${id} has its icon`);
    assert.equal(textOf(l), said(`screen.${id}.name`), `${id}'s reference is its name alone`);
    // the purpose is a box of its own beside the reference, beneath it, never inside it
    const purpose = all(a.tree, (e) => e.attrs["data-purpose"] === id)[0];
    assert.ok(purpose && textOf(purpose) === said(`screen.${id}.purpose`), `${id}'s purpose`);
    assert.ok(!ancestor(purpose, (e) => e === l) && purpose.parent === l.parent, `${id}: apart from the reference`);
    const sib = l.parent.children.filter((c) => c.tag);
    assert.equal(sib[sib.indexOf(l) + 1], purpose, `${id}: the purpose follows its name`);
  }
  // control: the group's section is not drawn to a member who does not administer
  const m = await open("settings", { me: MEMBER, table: {} });
  assert.equal(all(m.tree, (e) => /\bmk-links\b/.test(e.attrs.class || "")).length, 1);
  assert.ok(!links(m).includes("updates"), "R27: no Updates section for a member who does not administer");
});

test("R20 recovery: the member's own codes (recoverycodesstate); new codes shown once, saying first that issuing again spends the earlier ones", async () => {
  const m = await open("recovery", { me: MEMBER, table: recoveryTable() });
  assert.ok(m.p.requests.some((r) => r.op === "recoverycodesstate"));
  assert.ok(!m.p.requests.some((r) => r.op === "adminrecoverystep"), "a member is not asked the administrators' step");
  // credentials R46 issues ten codes: the sentence's total is ten while the plane does not answer it, the plane's own when it does
  has(m, "screen.recovery.held", { remaining: 7, total: 10, date: day("2026-10-02") });
  const t = await open("recovery", { me: MEMBER, table: recoveryTable({ recoverycodesstate: env({ ok: true, held: true, remaining: 7, total: 12, issuedAt: "2026-10-02T00:00:00Z" }) }) });
  has(t, "screen.recovery.held", { remaining: 7, total: 12, date: day("2026-10-02") });
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
  has(a, "screen.members.recovery.one", { name: said("member.founder.unnamed") });
  // the sole administrator by handle: a roster administrator with the founder not claimed
  const roster = [{ member_id: "rosa", handle: "rosa", role: "admin", status: "active", capabilities: [], cover: "R", expertise: [], invitation: "spent" }];
  const named = await open("recovery", { me: ADMIN, table: recoveryTable({ memberlist: env({ members: roster }), bootstrap: { ok: true, claimed: false } }) });
  has(named, "screen.members.recovery.one", { name: "rosa" });
  // control: a step the roster cannot name is told no name, never an empty one
  const unnamed = await open("recovery", { me: ADMIN, table: recoveryTable({ memberlist: "none" }) });
  assert.ok(!/\{\w+\}|undefined/.test(unnamed.html));
  const met = await open("recovery", { me: ADMIN, table: recoveryTable({ adminrecoverystep: env({ ok: true, administrators: 2, codes_held: true, remaining: 7, met: true }) }) });
  assert.equal(all(met.tree, (e) => e.attrs["data-note"] === "step").length, 0);
  const silent = await open("recovery", { me: ADMIN, table: recoveryTable({ adminrecoverystep: refuse("STORE_DID_NOT_ANSWER") }) });
  assert.equal(all(silent.tree, (e) => e.attrs["data-note"] === "step").length, 0);
});
