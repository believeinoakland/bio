/* Ported from credentials' t47-signin.test.mjs (T48-10; split map §6, K874): its account arms, each under its new id
   with its old one kept. The held sign-in token (R19, was credentials R70) and R71's clarifications (3) and (4) (R31).
   Sessions by device and inactivity (credentials R65), the password asked again (R66), sign-in by handle (R67),
   recovery codes (R68) and the reset link (R69) stay credentials'. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { world, SIGNIN_TOKEN } from "./fixture.mjs";
import { AI_ACCOUNT_CHECKS, SIGNIN_TOKEN_LENGTH } from "../../../src/ai-accounts/index.mjs";

/* Date.now moved for the length of `fn`. */
const at = async (ms, fn) => { const real = Date.now; Date.now = () => ms; try { return await fn(); } finally { Date.now = real; } };
const sha = (text) => createHash("sha256").update(String(text)).digest("hex");
const T0 = Date.parse("2026-10-13T08:00:00Z");
const row = (code) => [false, code, AI_ACCOUNT_CHECKS[code].check, AI_ACCOUNT_CHECKS[code].translation];
const said = (r) => [r.ok, r.code, r.check, r.translation];

/* ===== R19 (was credentials R70): the held sign-in token ===== */

test("R19 R31 (was credentials R70 R71): subscriptionTokenHold seals the token under the member and records the fact, answering {ok, since}; refused ACCOUNT_MEMBER_NOT_ACTIVE and SUBSCRIPTION_TOKEN_MALFORMED (C-29.45), each writing nothing; the claimed founder holds one (R31, was R71 (3)); no route reaches it", async () => {
  assert.deepEqual(SIGNIN_TOKEN_LENGTH, { min: 20, max: 2000 });
  const fresh = world();
  assert.equal((await fresh.c.subscriptionTokenHold({ member: "admin", token: SIGNIN_TOKEN("admin") })).code,
    "ACCOUNT_MEMBER_NOT_ACTIVE", "an unclaimed founder holds nothing");
  const w = await world().group("ann", "dee");
  w.m.memberSet({ memberId: "dee", status: "revoked", by: "admin" });
  const before = w.snapshot();
  for (const member of ["dee", "ghost", "class:ai", "token:ai", null, ""])
    assert.deepEqual(said(await w.c.subscriptionTokenHold({ member, token: SIGNIN_TOKEN("x") })), row("ACCOUNT_MEMBER_NOT_ACTIVE"), String(member));
  for (const token of ["x".repeat(19), "x".repeat(2001), null, 7, ""])
    assert.deepEqual(said(await w.c.subscriptionTokenHold({ member: "ann", token })), row("SUBSCRIPTION_TOKEN_MALFORMED"), String(token).slice(0, 30));
  assert.equal(w.snapshot(), before, "writing nothing");
  for (const token of ["x".repeat(20), "y".repeat(2000)]) assert.equal((await w.c.subscriptionTokenHold({ member: "ann", token })).ok, true);
  const r = await at(T0, () => w.c.subscriptionTokenHold({ member: "member:ann", token: SIGNIN_TOKEN("ann") }));
  assert.deepEqual(r, { ok: true, since: "2026-10-13T08:00:00Z" });
  assert.ok(!w.snapshot().includes(SIGNIN_TOKEN("ann")) && !w.snapshot().includes(sha(SIGNIN_TOKEN("ann"))), "sealed, no digest");
  assert.equal((await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })).key, SIGNIN_TOKEN("ann"),
    "replacing any earlier one");
  const f = await w.c.subscriptionTokenHold({ member: "admin", token: SIGNIN_TOKEN("admin") });
  assert.equal(f.ok, true, "R31: the claimed founder");
  assert.equal((await w.c.accountFor({ member: "admin", act: { kind: "ask", member: "admin" } })).key, SIGNIN_TOKEN("admin"));
  assert.equal(w.c.subscriptionDisconnect({ member: "admin", by: "admin" }).disconnected, true, "and drops it");
  assert.ok(!Object.keys(w.ops()).some((op) => /token|subscriptionconnected|accountfor/.test(op)), "no route");
});

test("R19 (was credentials R70): accountFor answers a held sign-in {kind: signin, level, member, key} for the one call; a connected fact with no token held answers not connected, and SIGNIN_NOT_HELD (C-29.44) where a sign-in account is otherwise chosen; control: an API-key reference unchanged", async () => {
  const w = await world().group("ann", "bob", "cy");
  w.project("S", "cy");
  w.c.subscriptionConnected({ member: "ann" });   /* a fact with no token, as every connection before T47 */
  assert.equal((await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })).reason, "NO_ACCOUNT", "not connected");
  assert.equal(w.c.accountReferenceState({ member: "ann", viewer: "ann" }).subscription.connected, false);
  await w.c.groupKeySet({ key: "sk-group", by: "admin" });
  w.c.groupKeySwitch({ on: true, by: "admin" });
  w.c.groupKeyNoticeSeen({ member: "ann", by: "ann" });
  assert.equal((await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } })).level, "group", "the cascade goes on");
  await w.signin("ann");
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "run", member: "ann" } }),
    { ok: true, kind: "signin", level: "member", member: "ann", key: SIGNIN_TOKEN("ann") });
  /* a project's sign-in account whose member's token is not held (connected before T47): SIGNIN_NOT_HELD, never the next */
  await w.signin("cy");
  assert.equal(w.c.projectSigninSet({ project: "S", by: "cy" }).ok, true);
  w.c.projectAccountSwitch({ project: "S", on: true, by: "cy" });
  const act = { kind: "ask", member: "cy", project: "S" };
  assert.equal((await w.c.accountFor({ member: "cy", act })).key, SIGNIN_TOKEN("cy"));
  w.sql.exec(`UPDATE subscription_connections SET sealed=NULL, iv=NULL WHERE member_id='cy'`);
  const r = await w.c.accountFor({ member: "cy", act });
  assert.deepEqual(said(r), row("SIGNIN_NOT_HELD"));
  assert.equal(r.member, "cy");
  /* control: an API key */
  await w.c.accountReferenceSet({ member: "bob", kind: "apikey", secret: "sk-bob", by: "bob" });
  assert.deepEqual(await w.c.accountFor({ member: "bob", act: { kind: "ask", member: "bob" } }),
    { ok: true, kind: "apikey", level: "member", key: "sk-bob" });
});

test("R19 R31 R27 (was credentials R70 R71, R16): the token is dropped with the fact on disconnection, revocation and Anthropic's refusal (refused_at, connected false, her projects' sign-in accounts cleared); removing a project's sign-in account leaves it (R31, was R71 (4)); each change in R16's history, never the token", async () => {
  const w = await world().group("ann", "bob", "cy");
  w.project("S", "ann");
  /* R31 (was R71 (4)): the project's account removed or replaced, her own token stays */
  await w.signin("ann");
  assert.equal(w.c.projectSigninSet({ project: "S", by: "ann" }).ok, true);
  assert.equal(w.c.projectAccountRemove({ project: "S", by: "ann" }).ok, true);
  assert.equal(w.c.accountReferenceState({ member: "ann", viewer: "ann" }).subscription.held, true, "removal leaves hers");
  assert.equal(w.c.projectSigninSet({ project: "S", by: "ann" }).ok, true);
  assert.equal((await w.c.projectKeySet({ project: "S", key: "sk-project", by: "ann" })).ok, true);
  assert.equal(w.c.accountReferenceState({ member: "ann", viewer: "ann" }).subscription.held, true, "replacement leaves hers");
  /* refused at Anthropic */
  assert.equal(w.c.projectSigninSet({ project: "S", by: "ann" }).ok, true);
  const r = await at(T0, () => w.c.subscriptionTokenRefused({ member: "ann" }));
  assert.deepEqual(r, { ok: true, dropped: true });
  assert.deepEqual(w.c.accountReferenceState({ member: "ann", viewer: "ann" }).subscription,
    { connected: false, since: null, held: false, refused_at: "2026-10-13T08:00:00Z", uses: null });
  assert.equal(w.row(`SELECT sealed FROM subscription_connections WHERE member_id='ann'`).sealed, null);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM project_accounts WHERE project_id='S'`).n, 0, "her projects' sign-in accounts cleared");
  assert.deepEqual(w.c.subscriptionTokenRefused({ member: "ann" }), { ok: true, dropped: false });
  assert.deepEqual(w.c.subscriptionTokenRefused({ member: null }), { ok: true, dropped: false });
  /* a new sign-in clears refused_at */
  await w.signin("ann");
  assert.equal("refused_at" in w.c.accountReferenceState({ member: "ann", viewer: "ann" }).subscription, false);
  /* disconnection and revocation */
  await w.signin("bob");
  assert.equal(w.c.subscriptionDisconnect({ member: "bob", by: "bob" }).disconnected, true);
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM subscription_connections WHERE member_id='bob'`).n, 0);
  await w.signin("cy");
  w.m.memberSet({ memberId: "cy", status: "revoked", by: "admin" });
  assert.equal(w.row(`SELECT COUNT(*) AS n FROM subscription_connections WHERE member_id='cy'`).n, 0);
  const hist = w.c.accountHistory({ owner: "member:ann", viewer: "ann" }).changes.map((c) => [c.change, c.why ?? null]);
  assert.deepEqual(hist.filter(([c]) => c === "removed"), [["removed", "refused"]]);
  assert.ok(!w.snapshot().includes("sentinel"), "no token in any row, the history included");
});

test("R19 (was credentials R70): valid_until is answered when the binary stated a whole number of days or years, else omitted; a sentinel token is absent from every answer, log and history row", async () => {
  const w = await world().group("ann", "bob");
  const logs = [];
  const orig = { log: console.log, warn: console.warn, error: console.error, info: console.info };
  for (const k of Object.keys(orig)) console[k] = (...a) => logs.push(a.map(String).join(" "));
  const answers = [];
  try {
    for (const [validFor, want] of [["1 year", "2027-10-13T08:00:00Z"], ["30 days", "2026-11-12T08:00:00Z"], [365, "2027-10-13T08:00:00Z"],
                                    ["forever", undefined], [null, undefined], ["1.5 years", undefined], [0, undefined]]) {
      answers.push(await at(T0, () => w.signin("ann", validFor)));
      const st = w.c.accountReferenceState({ member: "ann", viewer: "ann" });
      answers.push(st);
      assert.equal(st.subscription.valid_until, want, String(validFor));
    }
    answers.push(w.c.accountHistory({ owner: "member:ann", viewer: "ann" }), w.c.accountUses({ owner: "member:ann", viewer: "ann" }),
                 w.c.accountUsesOf({ owner: "member:ann" }));
    for (const op of Object.values(w.ops("by=ann&viewer=member:ann&member=ann&owner=member:ann", {})))
      try { answers.push(await op()); } catch { /* an op needing more */ }
  } finally { Object.assign(console, orig); }
  const dump = JSON.stringify(answers) + logs.join("\n") + w.snapshot();
  assert.ok(!dump.includes(SIGNIN_TOKEN("ann")) && !dump.includes(sha(SIGNIN_TOKEN("ann"))), "nowhere");
});
