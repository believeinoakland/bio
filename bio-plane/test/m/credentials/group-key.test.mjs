/* The group's Anthropic API key (R33–R37; K1755, K1756, K1757), at the interface: set, switched and removed only by an
   active administrator, off when first set and off by default, sealed at rest under the copy and never shown,
   exported, logged or answered; its state to administrators in full and `{on}` to other members; serving, through
   `accountFor`, only acts of active members who hold no reference of their own, once each has read its notice; its own
   two switches. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { ACCOUNT_CHECKS, Credentials, credentialsOf } from "../../../src/credentials/index.mjs";
import { notAnAdmin } from "../../../src/membership/index.mjs";

const KEY = "sk-ant-api03-GROUP-SENTINEL-9b1e";
const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check, translation: ACCOUNT_CHECKS[code].translation });
const ask = (member) => ({ kind: "ask", member });

/* ann and bob active members, dee revoked, cal invited; second an administrator; the founder claimed. */
async function groupWorld(opts) {
  const w = await world(opts).group("ann", "bob", "dee");
  assert.equal((await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" })).ok, true);
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  return w;
}
const acts = (w) => w.rows(`SELECT act, detail, actor FROM group_key_acts ORDER BY seq`);

test("R33 groupKeySet, groupKeyRemove, groupKeySwitch: active administrators only (NOT_AN_ADMIN through membership, a machine refused the same); an empty key NO_SECRET; each refusal writing nothing", async () => {
  const w = await groupWorld();
  const before = w.snapshot();
  for (const by of ["ann", "dee", "cal", "nobody", "class:admin", "class:ai", "token:ai", null, ""]) {
    assert.deepEqual(await w.c.groupKeySet({ key: KEY, by }), notAnAdmin(by ?? null, "setting the group's Anthropic API key"), String(by));
    assert.deepEqual(w.c.groupKeyRemove({ by }), notAnAdmin(by ?? null, "removing the group's Anthropic API key"), String(by));
    assert.deepEqual(w.c.groupKeySwitch({ on: true, by }), notAnAdmin(by ?? null, "switching the group's Anthropic API key"), String(by));
  }
  for (const key of [null, undefined, "", "   ", 7])
    assert.deepEqual(shape(await w.c.groupKeySet({ key, by: "second" })), refusal("NO_SECRET"), String(key));
  assert.equal(w.snapshot(), before, "no refusal writes");
  /* an inactive administrator is no administrator */
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.equal((await w.c.groupKeySet({ key: KEY, by: "second" })).reason, "NOT_AN_ADMIN");
  w.sql.exec(`UPDATE members SET status='active' WHERE member_id='second'`);
  /* no seal secret bound: nothing stored */
  const bare = await groupWorld({ sealSecret: null });
  const b0 = bare.snapshot();
  assert.deepEqual(shape(await bare.c.groupKeySet({ key: KEY, by: "admin" })), refusal("ACCOUNT_SEAL_UNAVAILABLE"));
  assert.equal(bare.snapshot(), b0);
});

test("R33 R34 the key held: off when first set and off by default; a replacement keeps the switch; removal switches it off; each act recorded with its administrator and instant, never the key", async () => {
  const w = await groupWorld();
  assert.deepEqual(w.c.groupKeyState({ viewer: "admin" }),
    { ok: true, held: false, on: false, set_at: null, by: null, suggestions: false, standing: false }, "nothing held by default");
  /* switched on before any key: still off */
  assert.deepEqual(w.c.groupKeySwitch({ on: true, by: "admin" }), { ok: true, on: false });
  const s = await w.c.groupKeySet({ key: KEY, by: "second" });
  assert.deepEqual(Object.keys(s).sort(), ["ok", "set_at"]);
  assert.match(s.set_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  assert.deepEqual(w.c.groupKeyState({ viewer: "second" }),
    { ok: true, held: true, on: false, set_at: s.set_at, by: "second", suggestions: false, standing: false }, "off when first set");
  assert.deepEqual(w.c.groupKeySwitch({ on: true, by: "member:second" }), { ok: true, on: true });
  assert.deepEqual(w.c.groupKeySwitch({ on: "yes", by: "admin" }), { ok: true, on: false }, "only `true` is on");
  w.c.groupKeySwitch({ on: true, by: "admin" });
  await w.c.groupKeySet({ key: "sk-ant-second", by: "admin" });
  const st = w.c.groupKeyState({ viewer: "admin" });
  assert.deepEqual([st.held, st.on, st.by], [true, true, "admin"], "a replacement keeps the switch as it was");
  assert.deepEqual((await w.c.accountFor({ member: "bob", act: ask("bob") })).reason, "GROUP_KEY_NOTICE_DUE");
  w.c.groupKeyNoticeSeen({ member: "bob", by: "bob" });
  assert.equal((await w.c.accountFor({ member: "bob", act: ask("bob") })).key, "sk-ant-second", "one key, the newer");
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM group_key`).n, 1);
  assert.deepEqual(w.c.groupKeyRemove({ by: "second" }), { ok: true, removed: true });
  assert.deepEqual(w.c.groupKeyState({ viewer: "admin" }),
    { ok: true, held: false, on: false, set_at: null, by: null, suggestions: false, standing: false });
  assert.deepEqual(w.c.groupKeyRemove({ by: "admin" }), { ok: true, removed: false });
  /* set again after removal: off again */
  await w.c.groupKeySet({ key: KEY, by: "admin" });
  assert.equal(w.c.groupKeyState({ viewer: "admin" }).on, false, "off when set again after removal");
  /* every act, with its administrator; never the key */
  assert.deepEqual(acts(w), [
    { act: "switch", detail: "on", actor: "admin" }, { act: "set", detail: null, actor: "second" },
    { act: "switch", detail: "on", actor: "second" }, { act: "switch", detail: "off", actor: "admin" },
    { act: "switch", detail: "on", actor: "admin" }, { act: "set", detail: null, actor: "admin" },
    { act: "remove", detail: null, actor: "second" }, { act: "remove", detail: null, actor: "admin" },
    { act: "set", detail: null, actor: "admin" }]);
  for (const r of w.rows(`SELECT at FROM group_key_acts`)) assert.match(r.at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
});

test("R34 sealed at rest under the copy: in no table, answer, route, log or error, nor its digest or base64; declared never exported; another seal secret or a row moved opens nothing", async () => {
  const logs = [];
  const orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  for (const k of Object.keys(orig)) console[k] = (...a) => logs.push(a.map(String).join(" "));
  try {
    const w = await groupWorld();
    const answers = [];
    const keep = async (p) => { const r = await p; answers.push(r); return r; };
    await keep(w.c.groupKeySet({ key: KEY, by: "admin" }));
    await keep(w.c.groupKeySet({ key: KEY, by: "ann" }));
    await keep(w.c.groupKeySwitch({ on: true, by: "admin" }));
    for (const viewer of ["admin", "second", "ann", "member:ann", "dee", "class:admin", null])
      await keep(w.c.groupKeyState({ viewer }));
    await keep(w.c.groupKeyNotice({ member: "ann" }));
    await keep(w.c.accountFor({ member: "ann", act: ask("bob") }));
    await keep(w.c.accountFor({ member: "ann", act: ask("ann") }));
    for (const query of ["by=admin&viewer=admin", "by=ann&viewer=ann"])
      for (const op of Object.values(w.ops(query, { key: KEY, on: true, switch: "standing" }))) {
        try { await keep(op()); } catch (e) { answers.push(String(e && e.stack)); }
      }
    await keep(w.c.keyedServices());
    const { createHash } = await import("node:crypto");
    const dump = w.snapshot();
    const said = JSON.stringify(answers) + logs.join("\n");
    const digest = createHash("sha256").update(KEY).digest("hex");
    assert.ok(!dump.includes(KEY) && !dump.includes(digest) && !dump.includes(Buffer.from(KEY).toString("base64")), "in no table");
    assert.ok(!said.includes(KEY) && !said.includes(digest), "in no answer, route, log or error");
    assert.deepEqual(Object.keys(w.row(`SELECT * FROM group_key`)).sort(),
      ["id", "is_on", "iv", "sealed", "set_at", "set_by", "standing", "suggestions"]);
    for (const t of ["group_key", "group_key_acts", "group_key_notices"])
      assert.equal(w.core.declared.get(t).classes.export, "never", t);
    /* the key opens for a served member's act only (the routes above removed it, so it is set and switched on again) */
    await w.c.groupKeySet({ key: KEY, by: "admin" });
    w.c.groupKeySwitch({ on: true, by: "admin" });
    w.c.groupKeyNoticeSeen({ member: "ann", by: "ann" });
    assert.deepEqual(await w.c.accountFor({ member: "ann", act: ask("ann") }), { ok: true, kind: "apikey", level: "group", key: KEY });
    /* under the copy's own seal secret: another opens nothing */
    const other = credentialsOf({ storage: { sql: w.sql } }, { record: w.core, membership: w.m, sealSecret: "another-secret" });
    assert.deepEqual(shape(await other.accountFor({ member: "ann", act: ask("ann") })), refusal("ACCOUNT_SEAL_UNAVAILABLE"));
    /* bound to its owner: a member's sealed reference moved into the group key's row does not open */
    await w.c.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-bob", by: "bob" });
    w.sql.exec(`UPDATE group_key SET sealed=(SELECT sealed FROM account_references WHERE member_id='bob'),
                iv=(SELECT iv FROM account_references WHERE member_id='bob')`);
    assert.deepEqual(shape(await w.c.accountFor({ member: "ann", act: ask("ann") })), refusal("ACCOUNT_SEAL_UNAVAILABLE"));
  } finally { Object.assign(console, orig); }
});

test("R34 R37 groupKeyState: an active administrator (the founder included) reads {held, on, set_at, by} and the two switches; any other active member {on}; anyone else NOT_AN_ADMIN; it writes nothing", async () => {
  const w = await groupWorld();
  await w.c.groupKeySet({ key: KEY, by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  w.c.groupSwitchSet({ switch: "suggestions", on: true, by: "admin" });
  const before = w.snapshot();
  for (const viewer of ["admin", "second", "member:second"]) {
    const s = w.c.groupKeyState({ viewer });
    assert.deepEqual({ ...s, set_at: null }, { ok: true, held: true, on: true, set_at: null, by: "admin", suggestions: true, standing: false }, viewer);
  }
  for (const viewer of ["ann", "member:bob"]) assert.deepEqual(w.c.groupKeyState({ viewer }), { ok: true, on: true }, viewer);
  for (const viewer of ["dee", "cal", "ghost", "class:admin", "class:member", "token:ai", null, undefined, ""])
    assert.deepEqual(w.c.groupKeyState({ viewer }), notAnAdmin(viewer ?? null, "reading the group's Anthropic API key"), String(viewer));
  assert.equal(w.snapshot(), before);
  w.c.groupKeySwitch({ on: false, by: "second" });
  assert.deepEqual(w.c.groupKeyState({ viewer: "ann" }), { ok: true, on: false });
});

test("R35 accountFor: the member's own reference when held ({kind, level: member, key}); else the group key when held and on ({kind: apikey, level: group, key}) for an active member who has read its notice; else NO_ACCOUNT; any act but the member's own NOT_YOUR_ACCOUNT; it writes nothing", async () => {
  const w = await groupWorld();
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ant-api03-ann", by: "ann" });
  const before = w.snapshot();
  /* any act but the member's own ask, run or standing question */
  for (const act of [null, undefined, {}, "ask", { kind: "ask" }, { kind: "ask", member: "bob" }, { kind: "export", member: "ann" },
                     { kind: "run", member: "class:ai" }, { kind: "standing", member: "admin" }])
    assert.deepEqual(shape(await w.c.accountFor({ member: "ann", act })), refusal("NOT_YOUR_ACCOUNT"), JSON.stringify(act));
  for (const member of ["class:ai", "class:daemon", null])
    assert.deepEqual(shape(await w.c.accountFor({ member, act: ask(member) })), refusal("NOT_YOUR_ACCOUNT"), String(member));
  /* the member's own, in agent-model R1's shape, for each of the three acts and either spelling */
  for (const kind of ["ask", "run", "standing"])
    for (const m of ["ann", "member:ann"])
      assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind, member: m } }),
        { ok: true, kind: "apikey", level: "member", key: "sk-ant-api03-ann" }, `${kind} ${m}`);
  /* no account: no reference and no group key, or the group key held but off */
  const none = await w.c.accountFor({ member: "bob", act: ask("bob") });
  assert.deepEqual([shape(none), none.member], [refusal("NO_ACCOUNT"), "bob"]);
  assert.equal(w.snapshot(), before, "it writes nothing");
  await w.c.groupKeySet({ key: KEY, by: "second" });
  assert.equal((await w.c.accountFor({ member: "bob", act: ask("bob") })).reason, "NO_ACCOUNT", "held but off");
  w.c.groupKeySwitch({ on: true, by: "second" });
  /* the group key serves only an active member, after their notice */
  assert.deepEqual(shape(await w.c.accountFor({ member: "bob", act: ask("bob") })), refusal("GROUP_KEY_NOTICE_DUE"));
  for (const m of ["cal", "ghost", "admin"])
    assert.deepEqual(shape(await w.c.accountFor({ member: m, act: ask(m) })), refusal("ACCOUNT_MEMBER_NOT_ACTIVE"), m);
  w.c.groupKeyNoticeSeen({ member: "bob", by: "bob" });
  const served = w.snapshot();
  for (const kind of ["ask", "run", "standing"])
    assert.deepEqual(await w.c.accountFor({ member: "member:bob", act: { kind, member: "bob" } }),
      { ok: true, kind: "apikey", level: "group", key: KEY }, kind);
  assert.equal(w.snapshot(), served, "it writes nothing");
  /* the member's own reference comes first, the group key on or not */
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).level, "member");
  await w.c.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-bob-own", by: "bob" });
  assert.deepEqual(await w.c.accountFor({ member: "bob", act: ask("bob") }), { ok: true, kind: "apikey", level: "member", key: "sk-bob-own" });
  w.c.accountReferenceRemove({ member: "bob", by: "bob" });
  assert.equal((await w.c.accountFor({ member: "bob", act: ask("bob") })).level, "group");
  /* revoked: the group key no longer serves them */
  w.m.memberSet({ memberId: "bob", status: "revoked", by: "admin" });
  assert.deepEqual(shape(await w.c.accountFor({ member: "bob", act: ask("bob") })), refusal("ACCOUNT_MEMBER_NOT_ACTIVE"));
  /* not routed: it is called only by the modules that run the assistant */
  assert.ok(!Object.keys(w.ops()).some((op) => /accountfor/i.test(op)));
});

test("R36 groupKeyNotice answers {due, text} until the member's own groupKeyNoticeSeen records it, once; another's act or a machine's refused as R22; R35 refuses GROUP_KEY_NOTICE_DUE (C-29.27) before it", async () => {
  const w = await groupWorld();
  const n = w.c.groupKeyNotice({ member: "ann" });
  assert.deepEqual(Object.keys(n).sort(), ["due", "ok", "text"]);
  assert.deepEqual([n.ok, n.due, n.text], [true, true, Credentials.GROUP_KEY_NOTICE_TEXT]);
  assert.match(n.text, /questions, and the material read to answer them, go to Anthropic under the group's API account/);
  const before = w.snapshot();
  assert.deepEqual(w.c.groupKeyNotice({ member: "member:ann" }), n);
  for (const [by, code] of [[null, "MACHINE_CANNOT_HOLD_ACCOUNT"], ["class:member", "MACHINE_CANNOT_HOLD_ACCOUNT"],
                            ["bob", "NOT_YOUR_ACCOUNT"], ["second", "NOT_YOUR_ACCOUNT"], ["admin", "NOT_YOUR_ACCOUNT"]])
    assert.deepEqual(shape(w.c.groupKeyNoticeSeen({ member: "ann", by })), refusal(code), String(by));
  assert.deepEqual(shape(w.c.groupKeyNoticeSeen({ member: "dee", by: "dee" })), refusal("ACCOUNT_MEMBER_NOT_ACTIVE"));
  assert.equal(w.snapshot(), before, "no refusal and no reading writes");
  await w.c.groupKeySet({ key: KEY, by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  const due = await w.c.accountFor({ member: "ann", act: ask("ann") });
  assert.deepEqual([shape(due), due.member], [refusal("GROUP_KEY_NOTICE_DUE"), "ann"]);
  assert.deepEqual(w.c.groupKeyNoticeSeen({ member: "ann", by: "member:ann" }), { ok: true, seen: true, already: false });
  assert.match(w.row(`SELECT seen_at FROM group_key_notices WHERE member_id='ann'`).seen_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  assert.deepEqual(w.c.groupKeyNoticeSeen({ member: "ann", by: "ann" }), { ok: true, seen: true, already: true });
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM group_key_notices`).n, 1);
  assert.equal(w.c.groupKeyNotice({ member: "ann" }).due, false);
  assert.equal(w.c.groupKeyNotice({ member: "bob" }).due, true, "each member's own");
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).level, "group");
  assert.equal(w.core.declared.get("group_key_notices").classes.sight, "owner");
});

test("R37 groupSwitchSet: the group key's own suggestions and standing, off by default, set by an active administrator only; UNKNOWN_SWITCH; they govern acts the group key serves, a member's own switches the acts their reference serves; removing the key turns both off", async () => {
  const w = await groupWorld();
  const g = () => { const s = w.c.groupKeyState({ viewer: "admin" }); return [s.suggestions, s.standing]; };
  assert.deepEqual(g(), [false, false], "off by default");
  const before = w.snapshot();
  for (const by of ["ann", "dee", "class:admin", null])
    assert.deepEqual(w.c.groupSwitchSet({ switch: "standing", on: true, by }),
      notAnAdmin(by, "switching the group key's assistant settings"), String(by));
  for (const name of [null, "", "Standing", "budget", "standing; DROP TABLE x"])
    assert.deepEqual(shape(w.c.groupSwitchSet({ switch: name, on: true, by: "admin" })), refusal("UNKNOWN_SWITCH"), String(name));
  assert.equal(w.snapshot(), before, "no refusal writes");
  assert.deepEqual(w.c.groupSwitchSet({ switch: "suggestions", on: true, by: "second" }), { ok: true, switch: "suggestions", on: true });
  assert.deepEqual(g(), [true, false]);
  assert.deepEqual(w.c.groupSwitchSet({ switch: "standing", on: "yes", by: "admin" }), { ok: true, switch: "standing", on: false });
  w.c.groupSwitchSet({ switch: "standing", on: true, by: "admin" });
  assert.deepEqual(g(), [true, true]);
  assert.deepEqual(acts(w).slice(-3), [{ act: "switch:suggestions", detail: "on", actor: "second" },
    { act: "switch:standing", detail: "off", actor: "admin" }, { act: "switch:standing", detail: "on", actor: "admin" }]);
  /* they govern the group key's acts, not a member's own: ann's standing switch stays hers */
  await w.c.groupKeySet({ key: KEY, by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  assert.equal(w.c.accountReferenceState({ member: "ann", viewer: "ann" }).standing, false);
  assert.equal((await w.c.aiGrantMintStanding({ member: "ann", question: "q" })).reason, "STANDING_SWITCH_OFF", "her own switch governs her");
  assert.equal((await w.c.aiGrantMintStanding({ member: "bob", question: "q" })).ok, true, "the group key's governs bob");
  w.c.groupSwitchSet({ switch: "standing", on: false, by: "admin" });
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" });
  assert.equal((await w.c.aiGrantMintStanding({ member: "ann", question: "q" })).ok, true);
  assert.equal((await w.c.aiGrantMintStanding({ member: "bob", question: "q" })).reason, "STANDING_SWITCH_OFF");
  /* R25: a member's switch is still theirs alone; an administrator cannot set it */
  assert.equal(w.c.accountSwitchSet({ member: "ann", switch: "suggestions", on: true, by: "admin" }).reason, "NOT_YOUR_ACCOUNT");
  /* removing the key turns both off */
  w.c.groupSwitchSet({ switch: "suggestions", on: true, by: "admin" });
  w.c.groupSwitchSet({ switch: "standing", on: true, by: "admin" });
  w.c.groupKeyRemove({ by: "admin" });
  assert.deepEqual(g(), [false, false]);
});
