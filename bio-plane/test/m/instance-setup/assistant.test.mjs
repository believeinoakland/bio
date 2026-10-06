/* The assistant, optional for the copy, and each member's disclosure (R53–R55; K1502, K1478 (i), D311), at the
   module's interface: the module over the real record-core and its routes through the frame control-plane joins them
   to. The page's half (whether it is on, and the switch) is setup-page's (its R24). */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, frame } from "./fixture.mjs";
import { ASSISTANT_DISCLOSURE, ASSISTANT_INSTALLER, INSTANCE_SETUP_CHECKS, INSTANCE_SETUP_TABLES, INSTANCE_SETUP_TABLE_DECLARATIONS }
  from "../../../src/setup.mjs";

const call = async (m, path, body) => (await frame(m, new Request(`http://do/${path}`,
  body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) }))).json();

test("R53 the assistant is off unless chosen: assistantState answers {on, set_by, set_at}, off with nobody and no instant when nothing is recorded, on every boot of a fresh copy", async () => {
  const w = await boot({ env: { INSTANCE_NAME: "river-town" } });
  const st = w.m.assistantState();
  assert.deepEqual([st.ok, st.on, st.set_by, st.set_at], [true, false, null, null]);
  assert.match(st.detail, /never been switched on/);
  /* a later boot of the same store changes nothing */
  const again = await boot({ st: w.st, env: { INSTANCE_NAME: "river-town" } });
  assert.equal(again.m.assistantState().on, false);
});

test("R53 assistantSet is an administrator's act only (NOT_AN_ADMIN through membership R84), refuses an on that is not true or false, and appends each set with who and when; the latest set is the switch", async () => {
  let t = Date.parse("2026-10-06T08:00:00Z");
  const w = await boot({ now: () => t });
  w.prov.admins = new Set(["admin", "member:ada"]);
  for (const by of [null, "", "member:bob", "class:admin", 42]) {
    const r = w.m.assistantSet({ on: true, by });
    assert.deepEqual([r.ok, r.reason, r.code, r.check], [false, "NOT_AN_ADMIN", "NOT_AN_ADMIN", "C-96.1"], String(by));
  }
  for (const on of [undefined, null, "true", 1, 0, {}]) {
    const r = w.m.assistantSet({ on, by: "admin" });
    assert.deepEqual([r.ok, r.reason, r.check], [false, "ASSISTANT_SWITCH_MALFORMED", "C-119.6"], JSON.stringify(on));
    assert.equal(r.translation, INSTANCE_SETUP_CHECKS.ASSISTANT_SWITCH_MALFORMED.translation);
  }
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM assistant_switch`).get().n, 0, "no refusal writes");
  const on = w.m.assistantSet({ on: true, by: "member:ada" });
  assert.deepEqual([on.ok, on.on, on.set_by, on.set_at], [true, true, "member:ada", "2026-10-06T08:00:00.000Z"]);
  assert.match(on.note, /^the assistant is on for your group's Civicsmith\. Switching it on binds no account/);
  assert.match(on.note, /their own Claude account or API key, connected by their own act, or by the group's Anthropic API key/);
  t += 60_000;
  const off = w.m.assistantSet({ on: false, by: "admin" });
  t += 60_000;
  const again = w.m.assistantSet({ on: false, by: "admin" });
  assert.deepEqual(again.history, [
    { on: true, set_by: "member:ada", set_at: "2026-10-06T08:00:00.000Z" },
    { on: false, set_by: "admin", set_at: "2026-10-06T08:01:00.000Z" },
    { on: false, set_by: "admin", set_at: "2026-10-06T08:02:00.000Z" }]);
  assert.equal(off.on, false);
  assert.deepEqual(w.m.assistantState(), { ok: true, on: false, set_by: "admin", set_at: "2026-10-06T08:02:00.000Z" });
  /* enabling binds no Claude credential: the switch holds who and when and nothing else, and the answer names no secret */
  const cols = w.st.db.prepare(`PRAGMA table_info(assistant_switch)`).all().map((c) => c.name);
  assert.deepEqual(cols, ["seq", "on_", "set_by", "set_at"]);
  w.m.assistantSet({ on: true, by: "admin" });
  assert.deepEqual(Object.keys(w.m.assistantState()).sort(), ["ok", "on", "set_at", "set_by"]);
});

test("R53 R29 over the routes: op=assistantset takes `by` from the control plane's stamp, never the body, and op=assistantstate answers the switch", async () => {
  const w = await boot();
  w.prov.admins = new Set(["admin"]);
  const forged = await call(w.m, "assistantset?by=member:mallory", { on: true, by: "admin" });
  assert.equal(forged.result.reason, "NOT_AN_ADMIN");
  assert.equal(forged.result.by, "member:mallory");
  const set = await call(w.m, "assistantset?by=admin", { on: true });
  assert.deepEqual([set.result.on, set.result.set_by], [true, "admin"]);
  const st = await call(w.m, "assistantstate");
  assert.deepEqual([st.ok, st.result.on, st.result.set_by], [true, true, "admin"]);
});

test("R54 disclosureShown records who, when and the version, only by the member's own act: DISCLOSURE_MALFORMED without a member or a version, DISCLOSURE_NOT_THE_MEMBERS for another member, an administrator or a machine; nothing written on a refusal", async () => {
  const w = await boot({ now: () => Date.parse("2026-10-06T09:00:00Z") });
  const v = ASSISTANT_DISCLOSURE.version;
  for (const [args, code] of [[{ version: v, by: "ruth" }, "DISCLOSURE_MALFORMED"], [{ member: "ruth", by: "ruth" }, "DISCLOSURE_MALFORMED"],
                              [{ member: " ", version: v, by: " " }, "DISCLOSURE_MALFORMED"],
                              [{ member: "ruth", version: v, by: "admin" }, "DISCLOSURE_NOT_THE_MEMBERS"],
                              [{ member: "ruth", version: v, by: "member:ada" }, "DISCLOSURE_NOT_THE_MEMBERS"],
                              [{ member: "class:ai", version: v, by: "class:ai" }, "DISCLOSURE_NOT_THE_MEMBERS"],
                              [{ member: "ruth", version: v, by: null }, "DISCLOSURE_NOT_THE_MEMBERS"]]) {
    const r = w.m.disclosureShown(args);
    assert.deepEqual([r.ok, r.reason, r.check], [false, code, INSTANCE_SETUP_CHECKS[code].check], JSON.stringify(args));
  }
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM assistant_disclosures`).get().n, 0);
  const r = w.m.disclosureShown({ member: "ruth", version: v, by: "ruth" });
  assert.deepEqual(r, { ok: true, member: "ruth", version: v, shown_at: "2026-10-06T09:00:00.000Z", shown: true });
  /* through the route: `by` is the stamp, so a body naming the member cannot record it for them */
  const forged = await call(w.m, "disclosureshown?by=mallory", { member: "ada", version: v, by: "ada" });
  assert.equal(forged.result.reason, "DISCLOSURE_NOT_THE_MEMBERS");
  const own = await call(w.m, "disclosureshown?by=ada", { member: "ada", version: v });
  assert.equal(own.result.ok, true);
});

test("R54 disclosureOf answers shown: false for a member with none recorded at the current version, an earlier version, or no member named; true only once recorded at that version; it never states a disclosure shown that was not", async () => {
  const w = await boot({ now: () => Date.parse("2026-10-06T09:00:00Z") });
  const v = ASSISTANT_DISCLOSURE.version;
  assert.equal(typeof v, "string");
  assert.match(ASSISTANT_DISCLOSURE.meaning, /go to Anthropic under your own account/);
  const none = w.m.disclosureOf({ member: "ruth" });
  assert.deepEqual([none.ok, none.shown, none.version, none.shown_at], [true, false, v, null]);
  assert.equal(w.m.disclosureOf({}).shown, false);
  w.m.disclosureShown({ member: "ruth", version: "D311-0", by: "ruth" });
  assert.equal(w.m.disclosureOf({ member: "ruth" }).shown, false, "an earlier version is not the current one");
  assert.equal(w.m.disclosureOf({ member: "ruth", version: "D311-0" }).shown, true);
  w.m.disclosureShown({ member: "ruth", version: v, by: "ruth" });
  assert.deepEqual(w.m.disclosureOf({ member: "ruth" }), { ok: true, member: "ruth", version: v, shown: true, shown_at: "2026-10-06T09:00:00.000Z" });
  assert.equal(w.m.disclosureOf({ member: "ada" }).shown, false, "one member's disclosure is not another's");
  const route = await call(w.m, "disclosureof?member=ruth");
  assert.equal(route.result.shown, true);
});

test("R55 while the switch is off every ask and run is refused by name through assistantGate (ASSISTANT_OFF, C-119.5), whoever asks: never switched on, and switched off; on, the gate answers null; turning it off ends nothing recorded", async () => {
  const w = await boot({ now: () => Date.parse("2026-10-06T10:00:00Z") });
  w.prov.admins = new Set(["admin"]);
  const never = w.m.assistantGate();
  assert.deepEqual([never.ok, never.reason, never.code, never.check], [false, "ASSISTANT_OFF", "ASSISTANT_OFF", "C-119.5"]);
  assert.equal(never.translation, INSTANCE_SETUP_CHECKS.ASSISTANT_OFF.translation);
  assert.match(never.detail, /never been switched on/);
  w.m.assistantSet({ on: true, by: "admin" });
  assert.equal(w.m.assistantGate(), null);
  w.m.disclosureShown({ member: "ruth", version: ASSISTANT_DISCLOSURE.version, by: "ruth" });
  w.m.assistantSet({ on: false, by: "admin" });
  const off = w.m.assistantGate();
  assert.deepEqual([off.reason, off.set_by, off.set_at], ["ASSISTANT_OFF", "admin", "2026-10-06T10:00:00.000Z"]);
  assert.match(off.detail, /switched the assistant off/);
  /* nothing recorded is ended: the disclosure and every set stay */
  assert.equal(w.m.disclosureOf({ member: "ruth" }).shown, true);
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM assistant_switch`).get().n, 2);
  /* a store that cannot be read answers off, never on */
  w.st.db.exec(`DROP TABLE assistant_switch`);
  assert.equal(w.m.assistantState().on, false);
  assert.equal(w.m.assistantGate().reason, "ASSISTANT_OFF");
});

test("R28 R41 R53 R54 every table is declared explicitly to record-core (declareTable, its R21) exempt from purge, the switch and the disclosures among them, the disclosures never exported", async () => {
  const w = await boot();
  assert.equal(w.started.purge.ok, true);
  const mine = w.record.declaredTables().filter((d) => d.module === "instance-setup");
  assert.deepEqual(mine.map((d) => d.name), INSTANCE_SETUP_TABLE_DECLARATIONS.map((d) => d.name));
  for (const d of mine) assert.equal(d.purge, INSTANCE_SETUP_TABLES.includes(d.name) ? "exempt" : "clear", d.name);
  assert.deepEqual(mine.filter((d) => d.purge === "clear").map((d) => d.name), ["seed_entities", "seed_lines", "seed_offices", "seed_bodies"]);
  const disc = mine.find((d) => d.name === "assistant_disclosures");
  assert.equal(disc.export, "never");
  w.prov.admins = new Set(["admin"]);
  w.m.assistantSet({ on: true, by: "admin" });
  w.m.disclosureShown({ member: "ruth", version: ASSISTANT_DISCLOSURE.version, by: "ruth" });
  w.record.purge({});
  assert.equal(w.m.assistantState().on, true);
  assert.equal(w.m.disclosureOf({ member: "ruth" }).shown, true);
});

test("R53 (K1678) at the first boot the installer's binding ASSISTANT_ENABLED is recorded, on or off, with by the installer; no binding, or any other value, records nothing and the assistant stays off; no later boot reads it", async () => {
  const at = Date.parse("2026-10-06T07:00:00Z");
  for (const [bound, on] of [["on", true], [" ON ", true], ["off", false]]) {
    const w = await boot({ env: { ASSISTANT_ENABLED: bound }, now: () => at });
    assert.deepEqual(w.started.assistant, { recorded: true, on });
    assert.deepEqual(w.m.assistantState(), { ok: true, on, set_by: ASSISTANT_INSTALLER, set_at: "2026-10-06T07:00:00.000Z" });
    assert.equal(ASSISTANT_INSTALLER, "installer");
  }
  for (const bound of [undefined, "", "yes", "true", "1"]) {
    const w = await boot({ env: bound === undefined ? {} : { ASSISTANT_ENABLED: bound } });
    assert.equal(w.started.assistant.recorded, false, String(bound));
    assert.deepEqual([w.m.assistantState().on, w.m.assistantState().set_by], [false, null]);
    if (bound) assert.match(w.started.assistant.why, /neither on nor off/);
    assert.equal(w.st.db.prepare(`SELECT count(*) n FROM assistant_switch`).get().n, 0);
  }
  /* a later boot of a store the installer set off does not read a binding changed to on */
  const first = await boot({ env: { ASSISTANT_ENABLED: "off" } });
  const later = await boot({ st: first.st, env: { ASSISTANT_ENABLED: "on" } });
  assert.equal("assistant" in later.started, false);
  assert.equal(later.m.assistantState().on, false);
});
