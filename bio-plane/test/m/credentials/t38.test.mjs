/* T38 (T38-5; N785's share, N708's remainder, K2200), at the interface: a member's own reference is an API key only, the
   subscription token retired (R22); a member with no reference of their own who is connected through their subscription
   (R43) is served by their own sign-in, `{kind: "signin", level: "member", member}`, with no secret, before the group key
   (R35, which reads R43's fact); a `subscription` reference stored before T38 is never answered and is removed at the
   module's migration, the member's state then showing none (R23). The ask grant mints for a member a sign-in serves
   (R27); their standing questions are refused STANDING_SWITCH_OFF, no switch governing a sign-in (R32; K2275). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD } from "./fixture.mjs";
import { ACCOUNT_CHECKS, ACCOUNT_KINDS } from "../../../src/credentials/index.mjs";

const shape = (r) => ({ ok: r.ok, reason: r.reason, code: r.code, check: r.check, translation: r.translation });
const refusal = (code) => ({ ok: false, reason: code, code, check: ACCOUNT_CHECKS[code].check, translation: ACCOUNT_CHECKS[code].translation });
const TOKEN = "sk-ant-oat01-T38-SENTINEL-4c1e";
const signin = (member) => ({ ok: true, kind: "signin", level: "member", member });

/* A reference of the retired kind, as a store written before T38 holds it (sealed bytes need not open: it is never read). */
const plantSubscription = (w, id) => w.sql.exec(`INSERT INTO account_references (member_id, kind, sealed, iv, set_at, suggestions, standing)
  VALUES (?, 'subscription', 'c2VhbGVk', 'aXY=', '2026-09-01T00:00:00Z', 1, 1)
  ON CONFLICT(member_id) DO UPDATE SET kind='subscription', sealed='c2VhbGVk', iv='aXY=', suggestions=1, standing=1`, id);

test("R22 the kind is `apikey` only: `subscription` (and any other) is refused UNKNOWN_ACCOUNT_KIND (C-29.17), after R22's own-act refusals, writing nothing; its words point to the sign-in, never a token", async () => {
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
  /* R22's own-act refusals still come first */
  for (const [member, by, code] of [["ann", "class:ai", "MACHINE_CANNOT_HOLD_ACCOUNT"], ["ann", "bob", "NOT_YOUR_ACCOUNT"],
                                    ["ann", "admin", "NOT_YOUR_ACCOUNT"], ["ghost", "ghost", "ACCOUNT_MEMBER_NOT_ACTIVE"]])
    assert.deepEqual(shape(await w.c.accountReferenceSet({ member, kind: "subscription", secret: TOKEN, by })), refusal(code), `${member} ${by}`);
  assert.equal(w.snapshot(), before, "nothing written");
  /* the words: a subscription is connected by signing in through Claude Code, never pasted as a token */
  const t = ACCOUNT_CHECKS.UNKNOWN_ACCOUNT_KIND.translation;
  assert.match(t, /Connect your own API key, or connect your Claude subscription by signing in through Claude Code\./);
  assert.doesNotMatch(t, /token/i);
  assert.doesNotMatch(ACCOUNT_CHECKS.NO_ACCOUNT.translation, /token/i);
  assert.match(ACCOUNT_CHECKS.NO_ACCOUNT.translation, /sign in with your Claude subscription through Claude Code/);
  /* the key still holds */
  assert.deepEqual((await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" })).kind, "apikey");
});

test("R35 R43 a member with no reference of their own who is connected is answered {kind: signin, level: member, member}, carrying no secret, for each of their own acts; their own key comes first, the sign-in before the group key (no notice asked); it writes nothing", async () => {
  const w = await world().group("ann", "bob");
  w.c.subscriptionConnected({ member: "ann" });
  const before = w.snapshot();
  for (const kind of ["ask", "run", "standing"])
    for (const [member, actor] of [["ann", "ann"], ["member:ann", "ann"], ["ann", "member:ann"]]) {
      const r = await w.c.accountFor({ member, act: { kind, member: actor } });
      assert.deepEqual(r, signin("ann"), `${kind} ${member} ${actor}`);
      assert.deepEqual(Object.keys(r), ["ok", "kind", "level", "member"], "no key, no secret");
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
  w.c.subscriptionConnected({ member: "ann" });
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "run", member: "ann" } }), signin("ann"));
  /* revoked: the fact is cleared (R16) and nothing serves her */
  w.m.memberSet({ memberId: "ann", status: "revoked", by: "admin" });
  assert.deepEqual(shape(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })), refusal("ACCOUNT_MEMBER_NOT_ACTIVE"));
});

test("R35 while the group keeps its material away the sign-in is refused AI_KEPT_AWAY like every account, before the fact is read", async () => {
  const w = await world().group("ann");
  w.c.subscriptionConnected({ member: "ann" });
  w.c.aiKeepAwaySet({ on: true, reason: "an order", by: "admin" });
  const r = await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } });
  assert.deepEqual([r.reason, r.keep_away.reason], ["AI_KEPT_AWAY", "an order"]);
  w.c.aiKeepAwaySet({ on: false, by: "admin" });
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }), signin("ann"));
});

test("R35 R23 R24 R25 a `subscription` reference stored before T38 is never answered, and the migration removes it, with the standing grants minted for that member; the member's state then shows none; another member's key stands; a later boot changes nothing", async () => {
  const w = await world().group("ann", "bob", "cy");
  await w.c.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-bob", by: "bob" });
  w.c.accountSwitchSet({ member: "bob", switch: "standing", on: true, by: "bob" });
  const bobStanding = (await w.c.aiGrantMintStanding({ member: "bob", question: "q" })).token;
  plantSubscription(w, "ann");
  plantSubscription(w, "cy");
  w.c.subscriptionConnected({ member: "cy" });
  /* a standing grant of ann's, minted while her token served (as a store before T38 may hold) */
  w.sql.exec(`INSERT INTO ai_grants (grant_sha, member_id, session, expires, kind) VALUES (?, 'ann', '', ?, 'standing')`,
    "a".repeat(64), Date.now() + 600e3);
  /* never answered, even before the migration runs */
  const ask = (m) => ({ kind: "ask", member: m });
  assert.deepEqual(shape(await w.c.accountFor({ member: "ann", act: ask("ann") })), refusal("NO_ACCOUNT"));
  assert.deepEqual(shape(await w.c.accountReferenceFor({ member: "ann", act: ask("ann") })), refusal("NO_ACCOUNT"));
  assert.deepEqual(await w.c.accountFor({ member: "cy", act: ask("cy") }), signin("cy"), "the connected member's sign-in, not the token");
  const st = w.c.accountReferenceState({ member: "ann", viewer: "ann" });
  assert.deepEqual([st.held, st.kind, st.suggestions, st.standing], [false, null, false, false]);
  assert.deepEqual(shape(w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" })), refusal("NO_ACCOUNT"));
  assert.deepEqual(shape(await w.c.aiGrantMintStanding({ member: "ann", question: "q" })), refusal("NO_ACCOUNT"));
  /* the migration removes them, and ann's standing grant with hers */
  w.c.migrate();
  assert.deepEqual(w.rows(`SELECT member_id, kind FROM account_references ORDER BY member_id`), [{ member_id: "bob", kind: "apikey" }]);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM ai_grants WHERE member_id='ann'`).n, 0);
  assert.equal((await w.c.aiGrantAdmit({ token: bobStanding, op: "search" })).ok, true, "another member's standing grant stands");
  for (const id of ["ann", "cy"])
    assert.deepEqual(w.c.accountReferenceState({ member: id, viewer: id }),
      { ok: true, held: false, kind: null, set_at: null, suggestions: false, standing: false,
        subscription: id === "cy" ? { connected: true, since: w.c.accountReferenceState({ member: "cy", viewer: "cy" }).subscription.since }
                                  : { connected: false, since: null } }, id);
  assert.deepEqual(await w.c.accountFor({ member: "bob", act: ask("bob") }), { ok: true, kind: "apikey", level: "member", key: "sk-bob" });
  const after = w.snapshot();
  w.c.migrate();
  assert.equal(w.snapshot(), after, "a later boot changes nothing");
});

test("R43 the connected fact is what R35 reads: recorded by subscriptionConnected, cleared by the member's own disconnect and by revocation; it holds no login, and R35's answer carries none", async () => {
  const w = await world().group("ann");
  const s = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  assert.equal(typeof s, "string");
  assert.equal(w.c.subscriptionConnected({ member: "ann", token: TOKEN }).reason, "SUBSCRIPTION_LOGIN_REFUSED");
  assert.equal((await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })).reason, "NO_ACCOUNT", "a refused call records nothing");
  w.c.subscriptionConnected({ member: "ann" });
  const r = await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } });
  assert.deepEqual(r, signin("ann"));
  assert.ok(!JSON.stringify([r, w.snapshot()]).includes(TOKEN));
});

test("R27 R32 R25 a member served by their own sign-in is granted an ask (no notice asked, the group key on or off); refused NO_ACCOUNT once disconnected with no other account; their standing questions refused STANDING_SWITCH_OFF, minting nothing, since no switch governs a sign-in", async () => {
  const w = await world().group("ann", "bob");
  w.c.subscriptionConnected({ member: "ann" });
  const s = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  const mint = () => w.c.aiGrantMint({ member: "ann", by: "ann", session: s });
  const g = await mint();
  assert.deepEqual(Object.keys(g).sort(), ["expires", "ok", "token"]);
  assert.equal((await w.c.aiGrantAdmit({ token: g.token, op: "search" })).viewer, "member:ann");
  await w.c.groupKeySet({ key: "sk-group", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  w.c.groupSwitchSet({ switch: "standing", on: true, by: "admin" });
  assert.equal((await mint()).ok, true, "the group key's notice is not asked: the sign-in serves her");
  /* R22's refusals still come first */
  assert.deepEqual(shape(await w.c.aiGrantMint({ member: "ann", by: "bob", session: s })), refusal("NOT_YOUR_ACCOUNT"));
  /* R32: no switch governs a sign-in; R25's switch belongs to a reference she does not hold */
  const before = w.snapshot();
  const st = await w.c.aiGrantMintStanding({ member: "ann", question: "what is new?" });
  assert.deepEqual([shape(st), st.member], [refusal("STANDING_SWITCH_OFF"), "ann"]);
  assert.match(st.detail, /member's own sign-in, which has no standing switch/);
  assert.deepEqual(shape(w.c.accountSwitchSet({ member: "ann", switch: "standing", on: true, by: "ann" })), refusal("NO_ACCOUNT"));
  assert.equal(w.snapshot(), before, "nothing minted or written");
  /* disconnected, the group key off: no account, no grant */
  w.c.subscriptionDisconnect({ member: "ann", by: "ann" });
  w.c.groupKeySwitch({ on: false, by: "admin" });
  assert.deepEqual(shape(await mint()), refusal("NO_ACCOUNT"));
  assert.match(ACCOUNT_CHECKS.NO_ACCOUNT.translation, /Claude subscription/);
  assert.match((await mint()).detail, /not connected through their subscription/);
});
