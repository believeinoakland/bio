/* The assistant, optional for the copy, and each member's disclosure (R53–R55; K1502, K1478 (i), D311), at the
   module's interface: the module over the real record-core, its routes through the frame control-plane joins them to,
   and the page as served. */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, frame, pageOver } from "./fixture.mjs";
import { ASSISTANT_DISCLOSURE, INSTANCE_SETUP_CHECKS, INSTANCE_SETUP_TABLE_DECLARATIONS, setupPage } from "../../../src/setup.mjs";

const call = async (m, path, body) => (await frame(m, new Request(`http://do/${path}`,
  body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) }))).json();
const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 20; i++) await tick(); };

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
  assert.match(on.note, /no account of its own/);
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

test("R53 offered on the page and changeable later: every signed-in member reads whether it is on; only an administrator is offered the switch, which sends op=assistantset with the opposite value and reads the switch back", async () => {
  let state = { ok: true, on: false, set_by: null, set_at: null };
  const sent = [];
  const make = (administer) => {
    const fetch = async (url, init) => {
      const u = new URL(url, "https://copy.example");
      const op = u.searchParams.get("op");
      const body = init && init.body ? JSON.parse(init.body) : null;
      let out = { result: { ok: true } };
      if (op === "bootstrap") out = { claimed: true, version: "v1" };
      else if (op === "whoami") out = { result: { capabilities: ["contribute"], administer } };
      else if (op === "assistantstate") out = { result: state };
      else if (op === "assistantset") {
        sent.push(body);
        state = { ok: true, on: body.on, set_by: "admin", set_at: "2026-10-06T08:00:00Z" };
        out = { result: { ok: true, ...state } };
      } else if (op === "profiles") out = { result: { ok: true, profiles: [], choices: [] } };
      return { ok: true, status: 200, json: async () => out };
    };
    return pageOver({ html: setupPage({ answered: true, result: { ok: true, group: "river-town" } }),
                      session: { t: "sess-1", e: 0, w: administer ? "admin" : "ruth" }, fetch });
  };
  const member = make(false);
  await settle();
  assert.match(member.el("#as-state").innerHTML, /The assistant is off for this copy\./);
  assert.equal(member.el("#as-choose").hidden, true);
  const admin = make(true);
  await settle();
  assert.equal(admin.el("#as-choose").hidden, false);
  assert.equal(admin.el("#as-toggle").textContent, "Switch the assistant on");
  await admin.el("#as-toggle").fire(); await settle();
  assert.deepEqual(sent, [{ on: true }]);
  assert.match(admin.el("#as-state").innerHTML, /The assistant is on for this copy\. Last set by admin/);
  assert.equal(admin.el("#as-toggle").textContent, "Switch the assistant off");
  /* a read that does not answer offers nothing and says it could not read */
  const silent = pageOver({ html: setupPage({ answered: true, result: { ok: true, group: "river-town" } }),
    session: { t: "s", e: 0, w: "admin" },
    fetch: async (url) => {
      const op = new URL(url, "https://copy.example").searchParams.get("op");
      const out = op === "whoami" ? { result: { capabilities: [], administer: true } } : op === "assistantstate" ? { error: "x" } : { result: { ok: true } };
      return { ok: true, status: 200, json: async () => out };
    } });
  await settle();
  assert.match(silent.el("#as-state").innerHTML, /could not read whether the assistant is on/);
  assert.equal(silent.el("#as-choose").hidden, true);
  /* the page's words say no account is bound and each member connects their own */
  const html = setupPage({ answered: true, result: { ok: true, group: "river-town" } });
  assert.match(html, /This copy holds no account for it: each member who wants it connects\s+their own Claude account or API key/);
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
  assert.deepEqual(mine.map((d) => d.table ?? d.name), INSTANCE_SETUP_TABLE_DECLARATIONS.map((d) => d.name));
  for (const d of mine) assert.equal(d.purge ?? d.classes?.purge, "exempt");
  const disc = mine.find((d) => (d.table ?? d.name) === "assistant_disclosures");
  assert.equal(disc.export ?? disc.classes?.export, "never");
  w.prov.admins = new Set(["admin"]);
  w.m.assistantSet({ on: true, by: "admin" });
  w.m.disclosureShown({ member: "ruth", version: ASSISTANT_DISCLOSURE.version, by: "ruth" });
  w.record.purge({});
  assert.equal(w.m.assistantState().on, true);
  assert.equal(w.m.disclosureOf({ member: "ruth" }).shown, true);
});
