/* Ported from credentials' t36.test.mjs (T48-10; split map §6, K874): its account arms, each under its new id with its
   old one kept. The group's setting that keeps its material away from every assistant (R20, R21, were credentials R51,
   R52) and what it refuses (R7, was R35); a member's own account always served otherwise (K1757's "the group's key
   only" retired). The keyed security tools (credentials R29), the tally's totals (R49), its route (R50) and the
   refusal of credentials' grants (credentials R27, R32) stay credentials'. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world } from "./fixture.mjs";
import { AI_ACCOUNT_CHECKS, KEEP_AWAY_REASON, aiAccountsOf } from "../../../src/ai-accounts/index.mjs";
import { notAnAdmin } from "../../../src/membership/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const row = (table, code) => ({ ok: false, reason: code, code, check: table[code].check, translation: table[code].translation });
const ask = (member) => ({ kind: "ask", member });

/* ===== R20, R21 (were credentials R51, R52): keeping the group's material away from AI ===== */

test("R20 (was credentials R51): aiKeepAwaySet: an active administrator only (NOT_AN_ADMIN through membership, a machine refused the same); on: true without a reason of 1 to 2,000 characters, or a reason not a string or over 2,000, AI_KEEP_AWAY_NO_REASON (C-29.32, re-coded in T37); each refusal writing nothing", async () => {
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  assert.deepEqual({ ...KEEP_AWAY_REASON }, { min: 1, max: 2000 });
  const before = w.snapshot();
  for (const by of ["ann", "dee", "nobody", "class:admin", "class:ai", "token:ai", null, ""])
    for (const on of [true, false])
      assert.deepEqual(w.c.aiKeepAwaySet({ on, reason: "r", by }),
        notAnAdmin(by ?? null, "keeping the group's material away from every assistant"), `${String(by)} ${on}`);
  /* the second administrator is refused once no longer active */
  w.sql.exec(`UPDATE members SET status='revoked' WHERE member_id='second'`);
  assert.equal(w.c.aiKeepAwaySet({ on: true, reason: "r", by: "second" }).reason, "NOT_AN_ADMIN");
  w.sql.exec(`UPDATE members SET status='active' WHERE member_id='second'`);
  for (const reason of [undefined, null, "", "   ", "\n", "x".repeat(2001), "é".repeat(2001), 7, ["r"], { r: 1 }]) {
    const r = w.c.aiKeepAwaySet({ on: true, reason, by: "admin" });
    assert.deepEqual(shape(r), row(AI_ACCOUNT_CHECKS, "AI_KEEP_AWAY_NO_REASON"), JSON.stringify(reason)?.slice(0, 30));
    assert.match(r.detail, /Nothing was changed\.$/);
  }
  /* a reason given with off is held to the same bounds */
  for (const reason of ["x".repeat(2001), 7])
    assert.deepEqual(shape(w.c.aiKeepAwaySet({ on: false, reason, by: "admin" })), row(AI_ACCOUNT_CHECKS, "AI_KEEP_AWAY_NO_REASON"));
  assert.equal(w.snapshot(), before, "no refusal writes");
  /* exactly 1 and exactly 2,000 characters (2,000 two-byte characters too) are reasons */
  for (const reason of ["x", "x".repeat(2000), "é".repeat(2000)]) assert.equal(w.c.aiKeepAwaySet({ on: true, reason, by: "admin" }).ok, true);
});

test("R20 R21 (were credentials R51 R52): each set is appended with its on, reason, who and when, never replacing an earlier one, and answers the state; aiKeepAwayState answers the latest set, the reason in the administrator's words, null when none; off with nulls before any set; it writes nothing and never throws", async () => {
  const w = await world().group("ann");
  const none = { on: false, reason: null, set_by: null, set_at: null, uses: ["ask", "draft", "run", "standing", "explore", "enquire", "read", "transcribe", "account"] };
  assert.deepEqual(w.c.aiKeepAwayState(), none, "off by default");
  const words = "  We are under a confidentiality order until the hearing; \"no AI\" until 1 March.  ";
  const on = w.c.aiKeepAwaySet({ on: true, reason: words, by: "member:second" });
  assert.deepEqual(Object.keys(on).sort(), ["ok", "on", "reason", "set_at", "set_by", "uses"]);
  assert.deepEqual({ ...on, set_at: null, uses: null }, { ok: true, on: true, reason: words, set_by: "second", set_at: null, uses: null }, "in the administrator's words as set");
  assert.match(on.set_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  const before = w.snapshot();
  assert.deepEqual(w.c.aiKeepAwayState(), { on: true, reason: words, set_by: "second", set_at: on.set_at, uses: none.uses });
  assert.equal(w.snapshot(), before, "the state writes nothing");
  const off = w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.deepEqual({ ...off, set_at: null }, { ok: true, on: false, reason: null, set_by: "admin", set_at: null, uses: none.uses }, "null when none was given");
  assert.equal(w.c.aiKeepAwaySet({ on: "yes", reason: "only `true` is on", by: "admin" }).on, false);
  const again = w.c.aiKeepAwaySet({ on: true, reason: "second reason", by: "admin" });
  assert.deepEqual(w.c.aiKeepAwayState(), { on: true, reason: "second reason", set_by: "admin", set_at: again.set_at, uses: none.uses });
  /* appended: every set kept, in order */
  assert.deepEqual(w.rows(`SELECT is_on, reason, set_by FROM ai_keep_away ORDER BY seq`).map((r) => [r.is_on, r.reason, r.set_by]),
    [[1, words, "second"], [0, null, "admin"], [0, "only `true` is on", "admin"], [1, "second reason", "admin"]]);
  for (const r of w.rows(`SELECT set_at FROM ai_keep_away`)) assert.match(r.set_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  const d = w.core.declared.get("ai_keep_away").classes;
  assert.deepEqual([d.purge, d.sight], ["exempt", "group"]);
  /* never throws: a setting it cannot read is not known (on: null), never off */
  w.sql.exec(`DROP TABLE ai_keep_away`);
  assert.deepEqual(w.c.aiKeepAwayState(), { on: null, reason: null, set_by: null, set_at: null, uses: null });
  const broken = Object.create(Object.getPrototypeOf(w.c));
  assert.deepEqual(w.c.aiKeepAwayState.call(broken), { on: null, reason: null, set_by: null, set_at: null, uses: null });
});

test("R20 R21 (were credentials R51 R52): the routes: aikeepaway takes `by` from the query over the body; aikeepawaystate answers the state, whoever the plane admits (every active member, by its spec)", async () => {
  const w = await world().group("ann");
  assert.equal(w.ops("by=ann", { on: true, reason: "r", by: "admin" }).aikeepaway().reason, "NOT_AN_ADMIN", "the stamp wins");
  const set = w.ops("by=second", { on: true, reason: "a reason", by: "ann" }).aikeepaway();
  assert.deepEqual([set.ok, set.on, set.reason, set.set_by], [true, true, "a reason", "second"]);
  assert.deepEqual(w.ops("viewer=ann").aikeepawaystate(), w.c.aiKeepAwayState());
  assert.deepEqual(w.ops().aikeepawaystate().on, true);
});

/* ===== R7 (was credentials R35): keep-away refuses every account; otherwise a member's own is always served ===== */

async function servedWorld() {
  const w = await world().group("ann", "bob");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ant-api03-ANN", by: "ann" });
  w.c.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" });
  await w.c.groupKeySet({ key: "sk-ant-api03-GROUP", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  w.c.accountUsesSet({ owner: "group", switch: "standing", on: true, by: "admin" });
  w.c.groupKeyNoticeSeen({ member: "bob", by: "bob" });
  return w;
}

test("R7 R21 (was credentials R35 R52): while the group keeps its material away every account is refused AI_KEPT_AWAY (C-29.31) with R21's reason, who and when, before any account is read: the member's own reference and the group key alike, for every act and every caller", async () => {
  const w = await servedWorld();
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).level, "member");
  assert.equal((await w.c.accountFor({ member: "bob", act: ask("bob") })).level, "group");
  const set = w.c.aiKeepAwaySet({ on: true, reason: "A confidentiality order.", by: "second" });
  const keepAway = { reason: "A confidentiality order.", set_by: "second", set_at: set.set_at };
  const want = (r, label) => {
    assert.deepEqual(shape(r), row(AI_ACCOUNT_CHECKS, "AI_KEPT_AWAY"), label);
    assert.deepEqual(r.keep_away, keepAway, label);
  };
  /* the refusal carries the setting's reason, who and when, as R21 answers them */
  const kept = await w.c.accountFor({ member: "ann", act: ask("ann") });
  assert.deepEqual(Object.keys(kept).sort(), ["check", "code", "detail", "keep_away", "ok", "reason", "translation"]);
  const { on, uses, ...state } = w.c.aiKeepAwayState();
  assert.deepEqual([on, kept.keep_away], [true, state]);
  const before = w.snapshot();
  for (const [member, act] of [["ann", ask("ann")], ["ann", { kind: "run", member: "ann" }], ["ann", { kind: "standing", member: "ann" }],
                               ["bob", ask("bob")], ["bob", { kind: "run", member: "bob" }], ["ann", ask("bob")], ["class:ai", ask("class:ai")],
                               ["ghost", ask("ghost")], [null, null]]) {
    want(await w.c.accountFor({ member, act }), `accountFor ${member} ${JSON.stringify(act)}`);
    want(await w.c.accountReferenceFor({ member, act }), `accountReferenceFor ${member}`);
  }
  assert.equal(w.snapshot(), before, "nothing read, unsealed or written");
  /* before any account is read: a reference that would not open is not reached */
  const other = aiAccountsOf({ storage: { sql: w.sql } }, { record: w.core, membership: w.m, sealSecret: "another-secret" });
  want(await other.accountFor({ member: "ann", act: ask("ann") }), "before the seal");
  /* turned off: served again, each as before */
  w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.equal((await w.c.accountFor({ member: "ann", act: ask("ann") })).level, "member");
  assert.equal((await w.c.accountFor({ member: "bob", act: ask("bob") })).level, "group");
  /* a setting that cannot be read keeps everything away (fail closed), naming that it could not be read */
  w.sql.exec(`DROP TABLE ai_keep_away`);
  const unread = await w.c.accountFor({ member: "ann", act: ask("ann") });
  assert.deepEqual([shape(unread), unread.keep_away], [row(AI_ACCOUNT_CHECKS, "AI_KEPT_AWAY"), { reason: null, set_by: null, set_at: null }]);
  assert.match(unread.detail, /could not be read/);
});

test("R7 R21 (was credentials R35 R52): the refusal carries the reason R21 answers, in the administrator's words", async () => {
  const w = await servedWorld();
  const words = "Our counsel asked us to keep case material away from every AI service until the appeal is decided.";
  w.c.aiKeepAwaySet({ on: true, reason: words, by: "admin" });
  for (const r of [await w.c.accountFor({ member: "ann", act: ask("ann") }), await w.c.accountFor({ member: "bob", act: ask("bob") })]) {
    assert.equal(r.reason, "AI_KEPT_AWAY");
    assert.equal(r.keep_away.reason, words);
    assert.equal(r.keep_away.reason, w.c.aiKeepAwayState().reason);
  }
});

test("R7 (was credentials R35): otherwise a member's own reference is always answered when held, whatever the group key's state (absent, held and off, on, its notice unread, removed): K1757's \"the group's key only\" retired", async () => {
  const w = await world().group("ann", "bob");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ANN-own", by: "ann" });
  const own = { ok: true, kind: "apikey", level: "member", key: "sk-ANN-own" };
  const served = async (label) => assert.deepEqual(await w.c.accountFor({ member: "ann", act: ask("ann") }), own, label);
  await served("no group key");
  await w.c.groupKeySet({ key: "sk-GROUP", by: "admin" });
  await served("the group key held and off");
  w.c.groupKeySwitch({ on: true, by: "admin" });
  await served("the group key on, ann's notice unread");
  w.c.groupKeyNoticeSeen({ member: "ann", by: "ann" });
  await served("the group key on, notice read");
  w.c.aiKeepAwaySet({ on: false, reason: "never on", by: "admin" });
  await served("keep-away set off");
  w.c.groupKeyRemove({ by: "admin" });
  await served("the group key removed");
  /* bob's own key likewise, the group key gone; and with none he is served by nothing */
  assert.equal((await w.c.accountFor({ member: "bob", act: { kind: "run", member: "bob" } })).reason, "NO_ACCOUNT");
  await w.c.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-BOB-own", by: "bob" });
  assert.deepEqual(await w.c.accountFor({ member: "bob", act: { kind: "run", member: "bob" } }),
    { ok: true, kind: "apikey", level: "member", key: "sk-BOB-own" });
});
