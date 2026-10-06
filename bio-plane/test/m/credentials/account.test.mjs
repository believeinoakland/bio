/* Each member's own Claude account reference (R22–R26; T33-20, T33-20b, K1502, K1503, K1547), at the interface: an API
   key or a subscription token, held only by the member's own act, sealed at rest under that member, never shown or exported, unsealed only for that member's own
   asks, runs and standing questions; the member's two switches; no group, project or instance level. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, SEAL } from "./fixture.mjs";
import { ACCOUNT_CHECKS, ACCOUNT_KINDS, ACCOUNT_SWITCHES, credentialsOf } from "../../../src/credentials/index.mjs";

const SENTINEL = "sk-ant-SENTINEL-7f3a9c";
const SUB = "sk-ant-oat01-SUBSCRIPTION-SENTINEL-51d2";   /* a subscription token's shape, from `claude setup-token` */
const refusal = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check,
                             translation: ACCOUNT_CHECKS[code].translation });
const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const set = (w, member, by, extra = {}) => w.c.accountReferenceSet({ member, kind: "apikey", secret: SENTINEL, by, ...extra });

/* ann and bob active; cal invited, never enrolled; dee revoked; second an administrator; the founder claimed. */
async function accountWorld(opts) {
  const w = await world(opts).group("ann", "bob", "dee");
  assert.equal((await w.m.memberAdd({ memberId: "cal", cover: "c", by: "admin" })).ok, true);
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  return w;
}

test("R22 accountReferenceSet: refusals in order, each writing nothing; the member's own act holds one reference, replacing any earlier one; the answer never the secret", async () => {
  const w = await accountWorld();
  const before = w.snapshot();
  /* MACHINE_CANNOT_HOLD_ACCOUNT first: no member behind the caller */
  for (const by of [null, undefined, "", "class:admin", "class:member", "class:ai", "token:ai", "token:member"])
    assert.deepEqual(shape(await set(w, "ann", by)), refusal("MACHINE_CANNOT_HOLD_ACCOUNT"), String(by));
  /* NOT_YOUR_ACCOUNT: any other member, an administrator or the founder */
  for (const by of ["bob", "second", "admin", "member:bob", "nobody"])
    assert.deepEqual(shape(await set(w, "ann", by)), refusal("NOT_YOUR_ACCOUNT"), by);
  /* ACCOUNT_MEMBER_NOT_ACTIVE: invited, revoked, absent (the founder holds no roster row) */
  for (const id of ["cal", "dee", "ghost", "admin"])
    assert.deepEqual(shape(await set(w, id, id)), refusal("ACCOUNT_MEMBER_NOT_ACTIVE"), id);
  /* UNKNOWN_ACCOUNT_KIND for anything but the two kinds; NO_SECRET, for either kind */
  for (const kind of [null, undefined, "", "APIKEY", "Subscription", "subscription ", "setup-token", "oauth", "organisation", 7])
    assert.deepEqual(shape(await w.c.accountReferenceSet({ member: "ann", kind, secret: SENTINEL, by: "ann" })),
      refusal("UNKNOWN_ACCOUNT_KIND"), String(kind));
  for (const kind of ["apikey", "subscription"])
    for (const secret of [null, undefined, "", "   ", 7])
      assert.deepEqual(shape(await w.c.accountReferenceSet({ member: "ann", kind, secret, by: "ann" })),
        refusal("NO_SECRET"), `${kind} ${String(secret)}`);
  /* the refusals R22 names come before the kind, for a subscription token as for a key */
  for (const [member, by, code] of [["ann", "class:ai", "MACHINE_CANNOT_HOLD_ACCOUNT"], ["ann", "second", "NOT_YOUR_ACCOUNT"],
                                    ["ann", "admin", "NOT_YOUR_ACCOUNT"], ["dee", "dee", "ACCOUNT_MEMBER_NOT_ACTIVE"],
                                    ["organisation", "ann", "ACCOUNT_LEVEL_MEMBER_ONLY"]])
    assert.deepEqual(shape(await w.c.accountReferenceSet({ member, kind: "subscription", secret: SUB, by })), refusal(code),
      `subscription ${member} by ${by}`);
  assert.equal(w.snapshot(), before, "no refusal writes");
  /* the two kinds (K1547); the held-back refusal is retired */
  assert.deepEqual(ACCOUNT_KINDS, ["apikey", "subscription"]);
  assert.ok(Object.isFrozen(ACCOUNT_KINDS));
  assert.ok(!("ACCOUNT_KIND_NOT_OFFERED" in ACCOUNT_CHECKS));
  /* the member's own act, by either spelling of the stamp */
  const ok = await set(w, "ann", "ann");
  assert.deepEqual(Object.keys(ok).sort(), ["kind", "ok", "set_at"]);
  assert.deepEqual([ok.ok, ok.kind], [true, "apikey"]);
  assert.match(ok.set_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  assert.equal((await w.c.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-bob", by: "member:bob" })).ok, true);
  /* replacing: one row, the new secret */
  assert.equal((await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann-2", by: "ann" })).ok, true);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM account_references WHERE member_id='ann'`).n, 1);
  assert.equal((await w.c.accountReferenceFor({ member: "ann", act: { kind: "ask", member: "ann" } })).secret, "sk-ann-2");
  /* the subscription kind (T33-20b): held by the member's own act, answering the same shape, never the token */
  const sub = await w.c.accountReferenceSet({ member: "ann", kind: "subscription", secret: SUB, by: "member:ann" });
  assert.deepEqual(Object.keys(sub).sort(), ["kind", "ok", "set_at"]);
  assert.deepEqual([sub.ok, sub.kind], [true, "subscription"]);
  assert.match(sub.set_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  /* one reference per member, whichever kind: a token replaces a key, and a key replaces a token, switches kept (R25) */
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" });
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM account_references WHERE member_id='ann'`).n, 1);
  assert.deepEqual(await w.c.accountReferenceFor({ member: "ann", act: { kind: "run", member: "ann" } }),
    { ok: true, kind: "subscription", secret: SUB });
  assert.equal((await set(w, "ann", "ann")).kind, "apikey");
  assert.deepEqual(await w.c.accountReferenceFor({ member: "ann", act: { kind: "ask", member: "ann" } }),
    { ok: true, kind: "apikey", secret: SENTINEL });
  assert.equal((await w.c.accountReferenceSet({ member: "ann", kind: "subscription", secret: SUB, by: "ann" })).ok, true);
  const st = w.c.accountReferenceState({ member: "ann", viewer: "ann" });
  assert.deepEqual([st.held, st.kind, st.suggestions, st.standing], [true, "subscription", false, true]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM account_references WHERE member_id='ann'`).n, 1);
  /* bob's own reference stood through all of ann's */
  assert.deepEqual(await w.c.accountReferenceFor({ member: "bob", act: { kind: "ask", member: "bob" } }),
    { ok: true, kind: "apikey", secret: "sk-bob" });
});

test("R22 R25 accountReferenceRemove: the same refusals, by the member's own act only; removing turns both switches off; a member with no reference has no assistant", async () => {
  const w = await accountWorld();
  await set(w, "ann", "ann");
  w.c.accountSwitchSet({ member: "ann", switch: "suggestions", on: true, by: "ann" });
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" });
  const before = w.snapshot();
  for (const [by, code] of [[null, "MACHINE_CANNOT_HOLD_ACCOUNT"], ["class:ai", "MACHINE_CANNOT_HOLD_ACCOUNT"],
                            ["bob", "NOT_YOUR_ACCOUNT"], ["second", "NOT_YOUR_ACCOUNT"], ["admin", "NOT_YOUR_ACCOUNT"]])
    assert.deepEqual(shape(w.c.accountReferenceRemove({ member: "ann", by })), refusal(code), String(by));
  assert.deepEqual(shape(w.c.accountReferenceRemove({ member: "dee", by: "dee" })), refusal("ACCOUNT_MEMBER_NOT_ACTIVE"));
  assert.deepEqual(shape(w.c.accountReferenceRemove({ member: "organisation", by: "ann" })), refusal("ACCOUNT_LEVEL_MEMBER_ONLY"));
  assert.equal(w.snapshot(), before, "no refusal writes");
  assert.deepEqual(w.c.accountReferenceRemove({ member: "ann", by: "ann" }), { ok: true, removed: true });
  assert.deepEqual(w.c.accountReferenceState({ member: "ann", viewer: "member:ann" }),
    { ok: true, held: false, kind: null, set_at: null, suggestions: false, standing: false });
  assert.deepEqual(w.c.accountReferenceRemove({ member: "ann", by: "ann" }), { ok: true, removed: false });
  assert.equal((await w.c.accountReferenceFor({ member: "ann", act: { kind: "ask", member: "ann" } })).reason, "NO_ACCOUNT");
  /* a subscription token is removed the same way, by the same act only */
  await w.c.accountReferenceSet({ member: "ann", kind: "subscription", secret: SUB, by: "ann" });
  w.c.accountSwitchSet({ member: "ann", switch: "suggestions", on: true, by: "ann" });
  assert.deepEqual(shape(w.c.accountReferenceRemove({ member: "ann", by: "second" })), refusal("NOT_YOUR_ACCOUNT"));
  assert.deepEqual(w.c.accountReferenceRemove({ member: "ann", by: "member:ann" }), { ok: true, removed: true });
  assert.equal((await w.c.accountReferenceFor({ member: "ann", act: { kind: "run", member: "ann" } })).reason, "NO_ACCOUNT");
  /* a new reference starts with both switches off */
  await set(w, "ann", "ann");
  const s = w.c.accountReferenceState({ member: "ann", viewer: "ann" });
  assert.deepEqual([s.held, s.suggestions, s.standing], [true, false, false]);
});

test("R23 the reference, an API key or a subscription token, is sealed under its member: stored only encrypted, no digest, never in any answer, list, log, error or export; its state to the member alone", async () => {
  const logs = [];
  const orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  for (const k of Object.keys(orig)) console[k] = (...a) => logs.push(a.map(String).join(" "));
  try {
    const w = await accountWorld();
    const answers = [];
    const keep = async (p) => { const r = await p; answers.push(r); return r; };
    await keep(set(w, "ann", "ann"));
    await keep(set(w, "ann", "bob"));                                   // a refusal
    await keep(w.c.accountReferenceSet({ member: "bob", kind: "subscription", secret: SUB, by: "bob" }));
    await keep(w.c.accountReferenceSet({ member: "bob", kind: "subscription", secret: SUB, by: "ann" }));   // a refusal
    await keep(w.c.accountSwitchSet({ member: "ann", switch: "suggestions", on: true, by: "ann" }));
    for (const viewer of ["ann", "member:ann", "bob", "second", "admin", "class:admin", null])
      await keep(w.c.accountReferenceState({ member: "ann", viewer }));
    await keep(w.c.accountReferenceFor({ member: "ann", act: { kind: "ask", member: "bob" } }));
    await keep(w.c.accountReferenceFor({ member: "bob", act: { kind: "standing", member: "ann" } }));
    for (const viewer of ["bob", "ann", "second"]) await keep(w.c.accountReferenceState({ member: "bob", viewer }));
    for (const op of Object.values(w.ops("by=ann&member=ann&viewer=member:ann"))) {
      try { await keep(op()); } catch (e) { answers.push(String(e && e.stack)); }
    }
    await keep(w.c.signerList()); await keep(w.c.aiCredentials({})); await keep(w.c.keyedServices());
    /* stored only encrypted: no column of any table carries the secret, nor its SHA-256 */
    const { createHash } = await import("node:crypto");
    const dump = w.snapshot();
    const said = JSON.stringify(answers) + logs.join("\n");
    for (const secret of [SENTINEL, SUB]) {
      const digest = createHash("sha256").update(secret).digest("hex");
      assert.ok(!dump.includes(secret), "the secret is in no table");
      assert.ok(!dump.includes(digest), "nor its digest");
      assert.ok(!dump.includes(Buffer.from(secret).toString("base64")), "nor its plain base64");
      /* no answer, error or log carries it or its digest */
      assert.ok(!said.includes(secret) && !said.includes(digest), secret);
    }
    for (const id of ["ann", "bob"]) {
      const row = w.row(`SELECT * FROM account_references WHERE member_id=?`, id);
      assert.deepEqual(Object.keys(row).sort(), ["iv", "kind", "member_id", "sealed", "set_at", "standing", "suggestions"]);
    }
    assert.equal(w.row(`SELECT kind FROM account_references WHERE member_id='bob'`).kind, "subscription");
    assert.equal(w.c.accountReferenceState({ member: "bob", viewer: "member:bob" }).kind, "subscription");
    assert.deepEqual(shape(w.c.accountReferenceState({ member: "bob", viewer: "second" })), refusal("NOT_YOUR_ACCOUNT"));
    /* its table is declared never exported, seen by its owner alone (R30) */
    const d = w.core.declared.get("account_references").classes;
    assert.deepEqual([d.export, d.sight], ["never", "owner"]);
    /* state: the member alone, by either spelling; any other viewer NOT_YOUR_ACCOUNT, writing nothing */
    const mine = w.c.accountReferenceState({ member: "ann", viewer: "member:ann" });
    assert.deepEqual({ ...mine, set_at: null }, { ok: true, held: true, kind: "apikey", set_at: null, suggestions: true, standing: false });
    assert.deepEqual(w.c.accountReferenceState({ member: "ann", viewer: "ann" }), mine);
    const before = w.snapshot();
    for (const viewer of ["bob", "second", "admin", "member:admin", "class:admin", "class:ai", "", null, undefined])
      assert.deepEqual(shape(w.c.accountReferenceState({ member: "ann", viewer })), refusal("NOT_YOUR_ACCOUNT"), String(viewer));
    assert.equal(w.snapshot(), before);
    /* sealed UNDER ITS MEMBER AND ITS KIND: a token relabelled a key does not open */
    w.sql.exec(`UPDATE account_references SET kind='apikey' WHERE member_id='bob'`);
    assert.equal((await w.c.accountReferenceFor({ member: "bob", act: { kind: "ask", member: "bob" } })).reason,
      "ACCOUNT_SEAL_UNAVAILABLE");
    w.sql.exec(`UPDATE account_references SET kind='subscription' WHERE member_id='bob'`);
    assert.deepEqual(await w.c.accountReferenceFor({ member: "bob", act: { kind: "ask", member: "bob" } }),
      { ok: true, kind: "subscription", secret: SUB });
    /* sealed UNDER ITS MEMBER: bob's row moved under ann does not open, so no other member's act reaches it */
    w.sql.exec(`UPDATE account_references SET sealed=(SELECT sealed FROM account_references WHERE member_id='bob'),
                iv=(SELECT iv FROM account_references WHERE member_id='bob') WHERE member_id='ann'`);
    assert.equal((await w.c.accountReferenceFor({ member: "ann", act: { kind: "ask", member: "ann" } })).reason,
      "ACCOUNT_SEAL_UNAVAILABLE");
    /* and under the copy's own seal secret: another secret opens nothing */
    const other = credentialsOf({ storage: { sql: w.sql } }, { record: w.core, membership: w.m, sealSecret: "another-secret" });
    assert.equal((await other.accountReferenceFor({ member: "bob", act: { kind: "ask", member: "bob" } })).reason,
      "ACCOUNT_SEAL_UNAVAILABLE");
  } finally { Object.assign(console, orig); }
});

test("R23 with no seal secret bound a reference of either kind is neither stored nor read (ACCOUNT_SEAL_UNAVAILABLE), writing nothing", async () => {
  const w = await accountWorld({ sealSecret: null });
  const before = w.snapshot();
  assert.deepEqual(shape(await set(w, "ann", "ann")), refusal("ACCOUNT_SEAL_UNAVAILABLE"));
  assert.deepEqual(shape(await w.c.accountReferenceSet({ member: "ann", kind: "subscription", secret: SUB, by: "ann" })),
    refusal("ACCOUNT_SEAL_UNAVAILABLE"));
  assert.equal(w.snapshot(), before);
  assert.ok(SEAL.length > 0);
});

test("R24 accountReferenceFor unseals a key or a token only for the member's own ask, run or standing question; any other act NOT_YOUR_ACCOUNT; none NO_ACCOUNT by name", async () => {
  const w = await accountWorld();
  await set(w, "ann", "ann");
  for (const kind of ["ask", "run", "standing"])
    for (const member of ["ann", "member:ann"])
      assert.deepEqual(await w.c.accountReferenceFor({ member: "ann", act: { kind, member } }),
        { ok: true, kind: "apikey", secret: SENTINEL }, `${kind} ${member}`);
  const before = w.snapshot();
  for (const act of [null, undefined, {}, { kind: "ask" }, { kind: "ask", member: "bob" }, { kind: "run", member: "second" },
                     { kind: "standing", member: "admin" }, { kind: "export", member: "ann" }, { kind: "ask", member: "class:ai" },
                     { kind: "run", member: "organisation" }, "ask"])
    assert.deepEqual(shape(await w.c.accountReferenceFor({ member: "ann", act })), refusal("NOT_YOUR_ACCOUNT"), JSON.stringify(act));
  const none = await w.c.accountReferenceFor({ member: "bob", act: { kind: "run", member: "bob" } });
  assert.deepEqual([shape(none), none.member], [refusal("NO_ACCOUNT"), "bob"]);
  assert.match(none.detail, /no assistant/);
  assert.equal(w.snapshot(), before, "it writes nothing");
  /* a subscription token likewise: only for bob's own ask, run or standing question, answered with its kind */
  await w.c.accountReferenceSet({ member: "bob", kind: "subscription", secret: SUB, by: "bob" });
  for (const kind of ["ask", "run", "standing"])
    for (const member of ["bob", "member:bob"])
      assert.deepEqual(await w.c.accountReferenceFor({ member: "bob", act: { kind, member } }),
        { ok: true, kind: "subscription", secret: SUB }, `${kind} ${member}`);
  const held = w.snapshot();
  for (const act of [null, { kind: "ask" }, { kind: "ask", member: "ann" }, { kind: "run", member: "second" },
                     { kind: "standing", member: "admin" }, { kind: "export", member: "bob" }, { kind: "run", member: "class:ai" }])
    assert.deepEqual(shape(await w.c.accountReferenceFor({ member: "bob", act })), refusal("NOT_YOUR_ACCOUNT"), JSON.stringify(act));
  assert.deepEqual(await w.c.accountReferenceFor({ member: "ann", act: { kind: "ask", member: "ann" } }),
    { ok: true, kind: "apikey", secret: SENTINEL }, "each member's own, whatever the other holds");
  assert.equal(w.snapshot(), held, "it writes nothing");
});

test("R25 accountSwitchSet: two switches, off by default, set only by the member's own act; UNKNOWN_SWITCH; a member with no reference NO_ACCOUNT; nothing for another member", async () => {
  const w = await accountWorld();
  assert.deepEqual(ACCOUNT_SWITCHES, ["suggestions", "standing"]);
  await set(w, "ann", "ann");
  await set(w, "bob", "bob");
  const st = (m) => { const s = w.c.accountReferenceState({ member: m, viewer: m }); return [s.suggestions, s.standing]; };
  assert.deepEqual([st("ann"), st("bob")], [[false, false], [false, false]], "off by default");
  const before = w.snapshot();
  for (const [by, code] of [[null, "MACHINE_CANNOT_HOLD_ACCOUNT"], ["class:admin", "MACHINE_CANNOT_HOLD_ACCOUNT"],
                            ["bob", "NOT_YOUR_ACCOUNT"], ["second", "NOT_YOUR_ACCOUNT"], ["admin", "NOT_YOUR_ACCOUNT"]])
    assert.deepEqual(shape(w.c.accountSwitchSet({ member: "ann", switch: "suggestions", on: true, by })), refusal(code), String(by));
  for (const name of [null, "", "Suggestions", "standing; DROP TABLE x", "budget"]) {
    const r = w.c.accountSwitchSet({ member: "ann", switch: name, on: true, by: "ann" });
    assert.deepEqual(shape(r), refusal("UNKNOWN_SWITCH"), String(name));
  }
  assert.deepEqual(shape(w.c.accountSwitchSet({ member: "dee", switch: "standing", on: true, by: "dee" })), refusal("ACCOUNT_MEMBER_NOT_ACTIVE"));
  assert.equal(w.snapshot(), before, "no refusal writes");
  assert.deepEqual(w.c.accountSwitchSet({ member: "ann", switch: "suggestions", on: true, by: "ann" }), { ok: true, switch: "suggestions", on: true });
  assert.deepEqual([st("ann"), st("bob")], [[true, false], [false, false]], "the member's own, nobody else's");
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "member:ann" });
  assert.deepEqual(st("ann"), [true, true]);
  /* only `true` is on */
  w.c.accountSwitchSet({ member: "ann", switch: "standing", on: "yes", by: "ann" });
  assert.deepEqual(st("ann"), [true, false]);
  /* a replacement keeps them; removal turns both off */
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-2", by: "ann" });
  assert.deepEqual(st("ann"), [true, false]);
  w.c.accountReferenceRemove({ member: "ann", by: "ann" });
  assert.deepEqual(st("ann"), [false, false]);
  /* belongs to the reference: with none, NO_ACCOUNT, nothing written */
  const n = w.snapshot();
  assert.deepEqual(shape(w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" })), refusal("NO_ACCOUNT"));
  assert.equal(w.snapshot(), n);
});

test("R26 no group, project or instance level: a set naming any principal but a member is ACCOUNT_LEVEL_MEMBER_ONLY, writing nothing; only member rows exist", async () => {
  const w = await accountWorld();
  const before = w.snapshot();
  for (const [member, level] of [["organisation", null], ["PROJ-2026-0001", null], ["class:ai", null], ["ann", "organisation"],
                                 ["ann", "project"], ["ann", "instance"], ["ann", "group"]])
    assert.deepEqual(shape(await w.c.accountReferenceSet({ member, level, kind: "apikey", secret: SENTINEL, by: "ann" })),
      refusal("ACCOUNT_LEVEL_MEMBER_ONLY"), `${member} ${level}`);
  assert.equal(w.snapshot(), before);
  assert.equal((await set(w, "ann", "ann", { level: "member" })).ok, true, "the member level is the one level");
  const m = await w.m.memberAdd({ memberId: "proj-x", cover: "c", by: "admin" });
  assert.equal(m.ok, true);
  /* the table holds member ids only, and every service is keyed by a member */
  assert.deepEqual(w.rows(`SELECT member_id FROM account_references`).map((r) => r.member_id), ["ann"]);
  for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(w.c)))
    assert.ok(!/group|project|instance|organisation/i.test(name) || !/account/i.test(name), name);
});
