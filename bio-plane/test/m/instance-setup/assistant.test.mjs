/* The assistant and each member's disclosure (R53–R55; DEC-172, K1957, K2093; D311), at the module's interface: the
   module over the real record-core, over the REAL credentials and membership for whether the group keeps its material
   away from AI (credentials R51, R52; in credentials' own test world), and its routes through the frame control-plane
   joins them to. Since T36 the assistant has no switch of its own: `assistantset` and `ASSISTANT_ENABLED` are retired.
   The page's words are setup-page's (its R18, R24). */
import test from "node:test";
import assert from "node:assert/strict";
import { boot, frame, providers } from "./fixture.mjs";
import { world as credentialsWorld } from "../credentials/fixture.mjs";
import { ASSISTANT_DISCLOSURE, INSTANCE_SETUP_CHECKS, INSTANCE_SETUP_TABLES, INSTANCE_SETUP_TABLE_DECLARATIONS }
  from "../../../src/setup.mjs";
import * as S from "../../../src/setup.mjs";

const call = async (m, path, body) => (await frame(m, new Request(`http://do/${path}`,
  body === undefined ? undefined : { method: "POST", body: JSON.stringify(body) }))).json();

/* This module over credentials' and membership's own world, the group claimed by its founder `admin`. */
async function over({ env = {}, st = null } = {}) {
  const c = credentialsWorld();
  await c.claim();
  const w = await boot({ env, st, more: { membership: c.m, credentials: c.c } });
  return { ...w, c };
}
const REASON = "We hold tenants' medical letters; none of it may leave our own Civicsmith.";

test("R53 assistantState answers {on, set_by, set_at, reason} from credentials' keep-away (its R52): on, with the three null, while the group does not keep its material away; on: false with the setting's who, when and reason in the administrator's words while it does; on again, the three null, once it is turned off; it writes nothing", async () => {
  const w = await over();
  assert.deepEqual(w.m.assistantState(), { ok: true, on: true, set_by: null, set_at: null, reason: null });
  const before = w.c.snapshot();
  assert.equal(w.c.c.aiKeepAwaySet({ on: true, reason: REASON, by: "admin" }).ok, true);
  const k = w.c.c.aiKeepAwayState();
  const st = w.m.assistantState();
  assert.deepEqual(st, { ok: true, on: false, set_by: k.set_by, set_at: k.set_at, reason: REASON });
  assert.ok(typeof st.set_by === "string" && st.set_by && typeof st.set_at === "string" && st.set_at);
  assert.equal(w.c.c.aiKeepAwaySet({ on: false, by: "admin" }).ok, true);
  assert.deepEqual(w.m.assistantState(), { ok: true, on: true, set_by: null, set_at: null, reason: null });
  /* reads write nothing */
  const mark = w.c.snapshot();
  for (let i = 0; i < 3; i += 1) w.m.assistantState();
  assert.equal(w.c.snapshot(), mark);
  assert.notEqual(before, mark, "the sets themselves were credentials' writes");
});

test("R53 (K2093) any keep-away `on` other than false is read as kept away: a state credentials could not read (on: null), any other value, an answer that is no object, or a provider that throws all answer on: false with set_by, set_at and reason null; assistantState never throws", async () => {
  const st = (keepAway) => ({ ...providers(), credentials: { aiKeepAwayState: keepAway } });
  for (const [why, keepAway] of [
    ["on: null (not read)", () => ({ on: null, reason: null, set_by: null, set_at: null })],
    ["on: undefined", () => ({ reason: "x", set_by: "admin", set_at: "2026-10-08T00:00:00Z" })],
    ["on: a string", () => ({ on: "false", reason: null, set_by: null, set_at: null })],
    ["on: 0", () => ({ on: 0 })],
    ["no object", () => null],
    ["throws", () => { throw new Error("the store did not answer"); }],
  ]) {
    const w = await boot({ prov: st(keepAway) });
    const r = w.m.assistantState();
    assert.deepEqual([r.ok, r.on, r.set_by, r.set_at, r.reason], [true, false, null, null, null], why);
    assert.match(r.detail, /could not be read, so it is read as kept away/, why);
  }
  /* the real setting, unreadable: credentials answers on: null, and this module reads it as kept away */
  const w = await over();
  w.c.db.exec(`DROP TABLE ai_keep_away`);
  assert.equal(w.c.c.aiKeepAwayState().on, null);
  assert.deepEqual([w.m.assistantState().on, w.m.assistantState().reason], [false, null]);
  /* a credentials without the read at all is the same */
  const bare = await boot({ prov: { ...providers(), credentials: {} } });
  assert.equal(bare.m.assistantState().on, false);
});

test("R53 (T36) the switch is retired: no assistantSet and no op=assistantset; op=assistantstate answers the derived state; the first boot reads no ASSISTANT_ENABLED, so a binding left set, on or off, changes nothing at any boot; rows the switch wrote are kept and no longer read", async () => {
  const w = await over({ env: { ASSISTANT_ENABLED: "off" } });
  assert.equal("assistantSet" in w.m, false);
  assert.equal("ASSISTANT_INSTALLER" in S, false);
  assert.equal("ASSISTANT_SWITCH_MALFORMED" in INSTANCE_SETUP_CHECKS, false);
  assert.equal("assistant" in w.started, false, "the first boot records nothing about the assistant");
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM assistant_switch`).get().n, 0);
  assert.equal(w.m.assistantState().on, true, "ASSISTANT_ENABLED=off bound at the first boot is not read");
  const routes = Object.keys(S.instanceSetupOps(w.m, new URL("http://do/"), null));
  assert.equal(routes.includes("assistantset"), false);
  assert.ok(routes.includes("assistantstate"));
  const set = await frame(w.m, new Request("http://do/assistantset?by=admin", { method: "POST", body: JSON.stringify({ on: false }) }));
  assert.equal(set, null, "assistantset is no route of this module's");
  const state = await call(w.m, "assistantstate");
  assert.deepEqual([state.ok, state.result.on, state.result.reason], [true, true, null]);
  /* a row the retired switch wrote (an older store's) is kept, and no longer read: keep-away alone decides */
  w.st.db.prepare(`INSERT INTO assistant_switch (on_, set_by, set_at) VALUES (0, 'installer', '2026-10-01T00:00:00Z')`).run();
  assert.equal(w.m.assistantState().on, true);
  w.c.c.aiKeepAwaySet({ on: true, reason: REASON, by: "admin" });
  w.st.db.prepare(`INSERT INTO assistant_switch (on_, set_by, set_at) VALUES (1, 'admin', '2026-10-02T00:00:00Z')`).run();
  assert.equal(w.m.assistantState().on, false);
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM assistant_switch`).get().n, 2, "kept");
  /* a later boot with the binding changed to on reads it no more than the first did */
  const later = await boot({ st: w.st, env: { ASSISTANT_ENABLED: "on" }, more: { membership: w.c.m, credentials: w.c.c } });
  assert.equal("assistant" in later.started, false);
  assert.equal(later.m.assistantState().on, false);
  /* enabling binds nothing: the state names no account and no secret */
  assert.deepEqual(Object.keys(later.m.assistantState()).sort(), ["ok", "on", "reason", "set_at", "set_by"]);
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

test("R55 (T36) while assistantState answers on: false every ask and run is refused by name through assistantGate (ASSISTANT_OFF, C-119.5), carrying the keep-away reason in the administrator's words, who set it and when; null, and said so, when the state could not be read; on, the gate answers null; turning keep-away off ends nothing recorded and starts nothing", async () => {
  const w = await over();
  assert.equal(w.m.assistantGate(), null);
  w.m.disclosureShown({ member: "admin", version: ASSISTANT_DISCLOSURE.version, by: "admin" });
  w.c.c.aiKeepAwaySet({ on: true, reason: REASON, by: "admin" });
  const k = w.c.c.aiKeepAwayState();
  const off = w.m.assistantGate();
  assert.deepEqual([off.ok, off.reason, off.code, off.check], [false, "ASSISTANT_OFF", "ASSISTANT_OFF", "C-119.5"]);
  assert.equal(off.translation, INSTANCE_SETUP_CHECKS.ASSISTANT_OFF.translation);
  assert.deepEqual(off.keep_away, { reason: REASON, set_by: k.set_by, set_at: k.set_at });
  assert.deepEqual([off.set_by, off.set_at], [k.set_by, k.set_at]);
  assert.ok(off.detail.includes(k.set_at) && off.detail.includes(k.set_by), off.detail);
  assert.match(off.detail, /keep your group's material away from every assistant, for the reason given with this answer/);
  /* whoever asks: the gate takes no caller, so no account or class changes it */
  assert.deepEqual(w.m.assistantGate({ member: "admin", account: { kind: "apikey" } }), off);
  /* turning it off ends nothing recorded (the disclosure stays) and starts nothing (the gate writes nothing) */
  const mark = w.c.snapshot();
  w.m.assistantGate();
  assert.equal(w.c.snapshot(), mark);
  w.c.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.equal(w.m.assistantGate(), null);
  assert.equal(w.m.disclosureOf({ member: "admin" }).shown, true);
  /* a state that could not be read: refused, the reason, who and when null, stated so */
  w.c.db.exec(`DROP TABLE ai_keep_away`);
  const unread = w.m.assistantGate();
  assert.deepEqual([unread.reason, unread.keep_away, unread.read], ["ASSISTANT_OFF", { reason: null, set_by: null, set_at: null }, false]);
  assert.match(unread.detail, /could not be read, so it is read as kept away.*No reason is known\./);
});

test("R55 (T36) the draft (R65) is refused ASSISTANT_OFF with the reason while the group keeps its material away, whatever account the door resolved, and is reached past it once keep-away is off", async () => {
  const w = await over();
  const ASSISTANT = { on: true, account: { kind: "apikey", level: "group" } };
  const ANSWERS = [{ question: "What does your group work on?", text: "We read the port's contracts." }];
  w.c.c.aiKeepAwaySet({ on: true, reason: REASON, by: "admin" });
  const r = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, viewer: "admin", by: "admin" });
  assert.deepEqual([r.ok, r.reason, r.keep_away.reason], [false, "ASSISTANT_OFF", REASON]);
  w.c.c.aiKeepAwaySet({ on: false, by: "admin" });
  const past = await w.m.groupDescriptionDraft({ answers: ANSWERS, assistant: ASSISTANT, viewer: "admin", by: "admin" });
  assert.equal(past.reason, "ASSISTANT_DRAFT_UNAVAILABLE", "no turn handed in: past every refusal");
});

test("R28 R41 R53 R54 every table is declared explicitly to record-core (declareTable, its R21) exempt from purge, the retired switch's kept rows and the disclosures among them, the disclosures never exported", async () => {
  const w = await boot();
  assert.equal(w.started.purge.ok, true);
  const mine = w.record.declaredTables().filter((d) => d.module === "instance-setup");
  assert.deepEqual(mine.map((d) => d.name), INSTANCE_SETUP_TABLE_DECLARATIONS.map((d) => d.name));
  for (const d of mine) assert.equal(d.purge, INSTANCE_SETUP_TABLES.includes(d.name) ? "exempt" : "clear", d.name);
  assert.deepEqual(mine.filter((d) => d.purge === "clear").map((d) => d.name), ["seed_entities", "seed_lines", "seed_offices", "seed_bodies"]);
  const disc = mine.find((d) => d.name === "assistant_disclosures");
  assert.equal(disc.export, "never");
  w.st.db.prepare(`INSERT INTO assistant_switch (on_, set_by, set_at) VALUES (1, 'admin', '2026-10-01T00:00:00Z')`).run();
  w.m.disclosureShown({ member: "ruth", version: ASSISTANT_DISCLOSURE.version, by: "ruth" });
  w.record.purge({});
  assert.equal(w.st.db.prepare(`SELECT count(*) n FROM assistant_switch`).get().n, 1, "the kept rows survive a purge");
  assert.equal(w.m.disclosureOf({ member: "ruth" }).shown, true);
});
