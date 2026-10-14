/* Ported from credentials' t38.test.mjs (T48-10): ai-accounts R1 (was credentials R22), R2 (R23), R3 (R24), R4 (R25),
   R7 (R35), R18 (R43), R19 (R70). T38 (T38-5; N785's share, N708's remainder, K2200), at the interface: a member's own
   reference is an API key only, the subscription token retired (R1); a member with no reference of their own who is
   connected through their subscription (R18) is served by their own sign-in, `{kind: "signin", level: "member", member}`,
   with no secret, before the group key (R7, which reads R18's fact); a `subscription` reference stored before T38 is
   never answered and is removed at the module's migration, the member's state then showing none (R2). (T47; R19,
   K3060 D10) A sign-in serves only while its token is held here, and `accountFor` answers that token as its `key` for
   the one call it serves. The ask and standing grants (credentials R27, R32) stay in credentials: their arms are not
   ported, and the migration here no longer deletes grants (split map, doubt 5). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, SIGNIN_TOKEN } from "./fixture.mjs";
import { AI_ACCOUNT_CHECKS, ACCOUNT_KINDS } from "../../../src/ai-accounts/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: AI_ACCOUNT_CHECKS[code].check, translation: AI_ACCOUNT_CHECKS[code].translation });
const TOKEN = "sk-ant-oat01-T38-SENTINEL-4c1e";
const signin = (member) => ({ ok: true, kind: "signin", level: "member", member, key: SIGNIN_TOKEN(member) });   /* (T47) R19 (was R70) */

/* A reference of the retired kind, as a store written before T38 holds it (sealed bytes need not open: it is never read). */
const plantSubscription = (w, id) => w.sql.exec(`INSERT INTO account_references (member_id, kind, sealed, iv, set_at, suggestions, standing)
  VALUES (?, 'subscription', 'c2VhbGVk', 'aXY=', '2026-09-01T00:00:00Z', 1, 1)
  ON CONFLICT(member_id) DO UPDATE SET kind='subscription', sealed='c2VhbGVk', iv='aXY=', suggestions=1, standing=1`, id);

test("R1 (was credentials R22): the kind is `apikey` only: `subscription` (and any other) is refused UNKNOWN_ACCOUNT_KIND (C-29.17), after R1's own-act refusals, writing nothing; its words point to the sign-in, never a token", async () => {
  const w = await world().group("ann", "bob");
  assert.deepEqual(ACCOUNT_KINDS, ["apikey"]);
  assert.ok(Object.isFrozen(ACCOUNT_KINDS));
  const before = w.snapshot();
  for (const kind of ["subscription", "Subscription", "setup-token", "signin", "oauth", "", null])
    for (const secret of [TOKEN, ""]) {
      const r = await w.c.accountReferenceSet({ member: "ann", kind, secret, by: "ann" });
      assert.deepEqual(shape(r), refusal("UNKNOWN_ACCOUNT_KIND"), `${String(kind)} ${secret}`);
      assert.ok(!JSON.stringify(r).includes(TOKEN), "never the token");
    }
  /* R1's own-act refusals still come first */
  for (const [member, by, code] of [["ann", "class:ai", "MACHINE_CANNOT_HOLD_ACCOUNT"], ["ann", "bob", "NOT_YOUR_ACCOUNT"],
                                    ["ann", "admin", "NOT_YOUR_ACCOUNT"], ["ghost", "ghost", "ACCOUNT_MEMBER_NOT_ACTIVE"]])
    assert.deepEqual(shape(await w.c.accountReferenceSet({ member, kind: "subscription", secret: TOKEN, by })), refusal(code), `${member} ${by}`);
  assert.equal(w.snapshot(), before, "nothing written");
  /* the words: a subscription is connected by signing in through Claude Code, never pasted as a token */
  const t = AI_ACCOUNT_CHECKS.UNKNOWN_ACCOUNT_KIND.translation;
  assert.match(t, /Connect your own API key, or connect your Claude subscription by signing in through Claude Code\./);
  assert.doesNotMatch(t, /token/i);
  assert.doesNotMatch(AI_ACCOUNT_CHECKS.NO_ACCOUNT.translation, /token/i);
  assert.match(AI_ACCOUNT_CHECKS.NO_ACCOUNT.translation, /sign in with your Claude subscription through Claude Code/);
  /* the key still holds */
  assert.deepEqual((await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" })).kind, "apikey");
});

test("R7 R18 R19 (was credentials R35 R43 R70): a member with no reference of their own who is connected is answered {kind: signin, level: member, member} (T47: with her held token as key), for each of their own acts; their own key comes first, the sign-in before the group key (no notice asked); it writes nothing", async () => {
  const w = await world().group("ann", "bob");
  await w.signin("ann");
  w.c.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" });   /* R14 (was R55): standing off by default */
  const before = w.snapshot();
  for (const kind of ["ask", "draft", "run", "standing"])
    for (const [member, actor] of [["ann", "ann"], ["member:ann", "ann"], ["ann", "member:ann"]]) {
      const r = await w.c.accountFor({ member, act: { kind, member: actor } });
      assert.deepEqual(r, signin("ann"), `${kind} ${member} ${actor}`);
      assert.deepEqual(Object.keys(r), ["ok", "kind", "level", "member", "key"], "(T47; R19) the held token, for this call");
    }
  /* any act but the member's own is refused as before */
  for (const act of [null, { kind: "ask" }, { kind: "ask", member: "bob" }, { kind: "export", member: "ann" }, { kind: "run", member: "class:ai" }])
    assert.deepEqual(shape(await w.c.accountFor({ member: "ann", act })), refusal("NOT_YOUR_ACCOUNT"), JSON.stringify(act));
  assert.equal(w.snapshot(), before, "it writes nothing");
  /* before the group key: on, its notice unread, the sign-in still serves ann; bob, not connected, gets the notice */
  await w.c.groupKeySet({ key: "sk-group", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }), signin("ann"));
  assert.deepEqual(shape(await w.c.accountFor({ member: "bob", act: { kind: "ask", member: "bob" } })), refusal("GROUP_KEY_NOTICE_DUE"));
  /* her own key comes first */
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }),
    { ok: true, kind: "apikey", level: "member", key: "sk-ann" });
  w.c.accountReferenceRemove({ member: "ann", by: "ann" });
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }), signin("ann"));
  /* disconnected: the group key serves her, once she reads its notice */
  w.c.subscriptionDisconnect({ member: "ann", by: "ann" });
  assert.deepEqual(shape(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })), refusal("GROUP_KEY_NOTICE_DUE"));
  w.c.groupKeyNoticeSeen({ member: "ann", by: "ann" });
  assert.equal((await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })).level, "group");
  /* connected again: the sign-in again, before the group key */
  await w.signin("ann");
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "run", member: "ann" } }), signin("ann"));
  /* revoked: the fact is cleared (R27, was credentials R16) and nothing serves her */
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.deepEqual(shape(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })), refusal("ACCOUNT_MEMBER_NOT_ACTIVE"));
});

test("R7 (was credentials R35): while the group keeps its material away the sign-in is refused AI_KEPT_AWAY like every account, before the fact is read", async () => {
  const w = await world().group("ann");
  await w.signin("ann");
  w.c.aiKeepAwaySet({ on: true, reason: "an order", by: "admin" });
  const r = await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } });
  assert.deepEqual([r.reason, r.keep_away.reason], ["AI_KEPT_AWAY", "an order"]);
  w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }), signin("ann"));
});

test("R7 R2 R3 R4 (was credentials R35 R23 R24 R25): a `subscription` reference stored before T38 is never answered, and the migration removes it; the member's state then shows none; another member's key stands; a later boot changes nothing", async () => {
  const w = await world().group("ann", "bob", "cy");
  await w.c.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-bob", by: "bob" });
  w.c.accountUsesSet({ owner: "member:bob", switch: "standing", on: true, by: "bob" });
  plantSubscription(w, "ann");
  plantSubscription(w, "cy");
  await w.signin("cy");
  /* never answered, even before the migration runs */
  const ask = (m) => ({ kind: "ask", member: m });
  assert.deepEqual(shape(await w.c.accountFor({ member: "ann", act: ask("ann") })), refusal("NO_ACCOUNT"));
  assert.deepEqual(shape(await w.c.accountReferenceFor({ member: "ann", act: ask("ann") })), refusal("NO_ACCOUNT"));
  assert.deepEqual(await w.c.accountFor({ member: "cy", act: ask("cy") }), signin("cy"), "the connected member's sign-in, not the token");
  const st = w.c.accountReferenceState({ member: "ann", viewer: "ann" });
  assert.deepEqual([st.held, st.kind, st.suggestions, st.standing], [false, null, false, false]);
  assert.deepEqual(shape(w.c.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" })), refusal("NO_ACCOUNT"));
  /* the migration removes them */
  w.c.migrate();
  assert.deepEqual(w.rows(`SELECT member_id, kind FROM account_references ORDER BY member_id`), [{ member_id: "bob", kind: "apikey" }]);
  for (const id of ["ann", "cy"])
    assert.deepEqual(w.c.accountReferenceState({ member: id, viewer: id }),
      { ok: true, held: false, kind: null, set_at: null, suggestions: false, standing: false, uses: null,
        subscription: id === "cy" ? { connected: true, since: w.c.accountReferenceState({ member: "cy", viewer: "cy" }).subscription.since,
                                      held: true, uses: { ask: true, draft: true, run: true, standing: false, explore: "no", enquire: true, read: true, transcribe: true, account: true, suggestions: false } }
                                  : { connected: false, since: null, held: false, uses: null } }, id);
  assert.deepEqual(await w.c.accountFor({ member: "bob", act: ask("bob") }), { ok: true, kind: "apikey", level: "member", key: "sk-bob" });
  const after = w.snapshot();
  w.c.migrate();
  assert.equal(w.snapshot(), after, "a later boot changes nothing");
});

test("R18 R19 (was credentials R43 R70): the connected fact is what R7 reads: (T47) recorded with its held token, cleared by the member's own disconnect and by revocation; it holds no login, and R7's answer carries only the held token", async () => {
  const w = await world().group("ann");
  assert.equal(w.c.subscriptionConnected({ member: "ann", token: TOKEN }).reason, "SUBSCRIPTION_LOGIN_REFUSED");
  assert.equal((await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })).reason, "NO_ACCOUNT", "a refused call records nothing");
  await w.signin("ann");
  const r = await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } });
  assert.deepEqual(r, signin("ann"));
  assert.ok(!JSON.stringify([r, w.snapshot()]).includes(TOKEN));
  assert.ok(!w.snapshot().includes(SIGNIN_TOKEN("ann")), "(T47; R19) the held token only sealed");
});
