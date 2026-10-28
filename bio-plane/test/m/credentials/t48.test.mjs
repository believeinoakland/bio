/* T48 (T48-11; N996, N1045; K3101, K3150): the reset link's member read from the query when the body names none
   (R71 (6)), the transitional delegates to `ai-accounts` (R72) and the `onAccountCleared` registration (R73). Each test
   drives the module at its interface. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { world, PASSWORD, sha } from "./fixture.mjs";

test("R71 (6) passwordresetlink takes member from the body, or, when the body names none, from the query; by is the stamp, never the body's; control: neither names one, RESET_LINK_MEMBER_NOT_ACTIVE", async () => {
  const w = await world().group("ann", "bob");
  assert.equal(w.ops("by=second&member=ann").passwordresetlink().member, "ann", "no body: the query's");
  assert.equal(w.ops("by=second&member=ann", {}).passwordresetlink().member, "ann", "a body naming none: the query's");
  assert.equal(w.ops("by=second&member=ann", { member: 7 }).passwordresetlink().member, "ann", "a body member not a string names none");
  assert.equal(w.ops("by=second&member=ann", { member: "bob" }).passwordresetlink().member, "bob", "the body's wins");
  assert.equal(w.ops("by=ann&member=bob", { by: "second" }).passwordresetlink().reason, "NOT_AN_ADMIN", "by never from the body");
  assert.equal(w.ops("member=bob", { member: "bob", by: "second" }).passwordresetlink().reason, "NOT_AN_ADMIN", "nor from member");
  assert.equal(w.ops("by=second").passwordresetlink().code, "RESET_LINK_MEMBER_NOT_ACTIVE", "control: no member named");
});

/* ===== the factory makes ai-accounts (its R32); R72, the transitional delegates, is retired (T53, K5457) ===== */

const A = await import("../../../src/ai-accounts/index.mjs");
const C = await import("../../../src/credentials/index.mjs");

test("R73 credentialsOf makes ai-accounts on the same storage with the seal secret it is given, and migrate runs ai-accounts' migrate first; control: a world with no seal secret seals nothing", async () => {
  const w = world();
  assert.equal(w.c.accounts, A.aiAccountsOf(w.ctx), "the storage's one ai-accounts");
  assert.equal(w.c.accounts.membership, w.m, "over the same membership");
  assert.equal((await w.c.accounts.sealText({ owner: "group:x", kind: "key", text: "t" })).ok, true, "the seal secret was passed");
  const bare = world({ sealSecret: null });
  assert.equal((await bare.c.accounts.sealText({ owner: "group:x", kind: "key", text: "t" })).code, "ACCOUNT_SEAL_UNAVAILABLE");
  /* ai-accounts' tables exist and are declared after credentials' migrate; its migrate ran first */
  const order = [];
  const real = w.c.accounts.migrate.bind(w.c.accounts);
  const own = w.c.declareTables.bind(w.c);
  w.c.accounts.migrate = () => { order.push("ai-accounts"); return real(); };
  w.c.declareTables = () => { order.push("credentials"); return own(); };
  w.c.migrate();
  assert.deepEqual(order, ["ai-accounts", "credentials"]);
  for (const t of ["account_references", "group_key", "subscription_connections", "project_accounts", "account_changes"])
    assert.ok(w.row(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, t), t);
});

/* ===== R73: the onAccountCleared registration ===== */

test("R73 at start credentials registers once with ai-accounts.onAccountCleared; a second start is refused LISTENER_DECLARED and changes nothing", async () => {
  const w = world();
  const again = w.c.start();
  assert.deepEqual([again.cleared.ok, again.cleared.reason, again.cleared.module], [false, "LISTENER_DECLARED", "credentials"]);
});

const look = (w, t) => w.c.aiCredentialLook({ secretSha: sha(t) }).credential;
const runs = async (names) => {
  const w = await world().group(...names);
  const mint = (m) => w.c.aiRunCredentialMint({ member: m, run: `RUN-${m}`, writes: ["airuntick"] });
  return { w, mint };
};

test("R73 a sign-in cleared by her disconnection revokes the member's live run credentials, inside the act, naming its actor, and no one else's; control: another member's run credential and her own R12 credential stay live", async () => {
  const { w, mint } = await runs(["ann", "bob"]);
  await w.signin("ann");
  const a = mint("ann");
  const b = mint("bob");
  const own = w.c.aiCredentialMint({ who: "ann", tokenId: "ann-own", secretSha: "c".repeat(64), principalKind: "member" });
  assert.equal(own.ok, true);
  assert.equal(look(w, a.token).revoked, false);
  assert.equal(w.c.accounts.subscriptionDisconnect({ member: "ann", by: "ann" }).disconnected, true);
  assert.deepEqual([look(w, a.token).revoked, look(w, a.token).revokedBy], [true, "ann"], "revoked in the act, by its actor");
  assert.equal(look(w, b.token).revoked, false, "control: bob's");
  assert.equal(w.c.aiCredentialLook({ secretSha: "c".repeat(64) }).credential.revoked, false, "control: her R12 credential");
});

test("R73 a reference removed revokes the member's run credentials as a sign-in cleared does (every account of hers clears the same way), and no one else's", async () => {
  const { w, mint } = await runs(["ann", "bob"]);
  await w.c.accounts.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  const a = mint("ann");
  const b = mint("bob");
  assert.equal(w.c.accounts.accountReferenceRemove({ member: "ann", by: "ann" }).ok, true);
  assert.equal(look(w, a.token).revoked, true, "removed");
  assert.equal(look(w, b.token).revoked, false, "control: bob's run is on his own account");
});

test("R73 a reference removed ends her standing grants, and a sign-in cleared while no reference is held ends them too; control: a sign-in cleared while her reference is held leaves her standing grant, and her ask grant is never ended by it", async () => {
  const w = await world().group("ann", "bob");
  const held = async (t) => (await w.c.aiGrantHeld({ token: t })).ok === true;
  /* a reference removed */
  await w.c.accounts.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  w.c.accounts.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" });
  const s = (await w.c.login({ handle: "ann", password: PASSWORD("ann") })).token;
  const ask = await w.c.aiGrantMint({ member: "ann", by: "ann", session: s });
  const g1 = await w.c.aiGrantMintStanding({ member: "ann", question: "q" });
  assert.equal(await held(g1.token), true);
  /* control: her sign-in cleared while the reference is held leaves the standing grant */
  await w.signin("ann");
  assert.equal(w.c.accounts.subscriptionDisconnect({ member: "ann", by: "ann" }).disconnected, true);
  assert.equal(await held(g1.token), true, "another account of hers still serves: the grant stands");
  w.c.accounts.accountReferenceRemove({ member: "ann", by: "ann" });
  assert.equal(await held(g1.token), false, "the reference removed ends it");
  assert.equal(await held(ask.token), true, "control: an ask's grant is not a standing one");
  /* a sign-in cleared while no reference is held */
  await w.signin("bob");
  w.c.accounts.accountUsesSet({ owner: "member:bob", switch: "standing", on: true, by: "bob" });
  const g2 = await w.c.aiGrantMintStanding({ member: "bob", question: "q" });
  assert.equal(await held(g2.token), true);
  w.c.accounts.subscriptionDisconnect({ member: "bob", by: "bob" });
  assert.equal(await held(g2.token), false, "her sign-in served it: ended");
});

test("R73 the notice is told inside ai-accounts' act, credentials' listener first, and a later listener that throws leaves the act and credentials' work standing", async () => {
  const { w, mint } = await runs(["ann"]);
  await w.c.accounts.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  w.c.accounts.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" });
  const g = await w.c.aiGrantMintStanding({ member: "ann", question: "q" });
  const run = mint("ann");
  /* a second module's listener, registered after credentials', that throws */
  const notices = [];
  w.c.accounts.onAccountCleared("zz-probe", (n) => { notices.push(n); throw new Error("a listener that throws"); });
  assert.equal(w.c.accounts.accountReferenceRemove({ member: "ann", by: "ann" }).ok, true, "the act stands");
  assert.deepEqual(notices.map((n) => [n.member, n.why]), [["ann", "removed"]]);
  assert.equal((await w.c.aiGrantHeld({ token: g.token })).ok, false, "credentials' listener ran before the throwing one");
  assert.equal(look(w, run.token).revoked, true, "and its run credential revocation stands");
});

test("R73 ACCOUNT_CLEARED_WHY holds the five reasons ai-accounts R26 sends, frozen", async () => {
  assert.deepEqual([...C.ACCOUNT_CLEARED_WHY], ["removed", "disconnected", "revoked", "refused", "unresolved"]);
  assert.ok(Object.isFrozen(C.ACCOUNT_CLEARED_WHY));
});

/* The paths below take `ai-accounts` R26's notice as the provider sends it: with an account's own id, an owner who is not
   a member, and `other_account_serves`. They are driven through the provider's real acts once its job lands (T53). */
test.todo("R73 an account cleared, refused, revoked or found to resolve to nothing revokes the run credentials carrying its account_id, for each why; control: a run on another account keeps its credential, and an account cleared while another still serves leaves the standing grant (awaits ai-accounts R26)");

/* ===== R63: the run credential's account (T53; K5457) ===== */

test("R63 aiRunCredentialMint records the account that serves the segment on the credential's row, given by ai-runs and never read from a caller; none given records none; control: an account_id that is not a non-empty string is AI_RUN_CREDENTIAL_MALFORMED naming account_id, minting nothing", async () => {
  const { w } = await runs(["ann"]);
  const row = (token) => w.row(`SELECT account_id, run FROM ai_credentials WHERE secret_sha=?`, sha(token));
  const withAccount = w.c.aiRunCredentialMint({ member: "ann", run: "RUN-1", writes: ["airuntick"], account_id: "acct-1" });
  assert.equal(withAccount.ok, true);
  assert.deepEqual({ ...row(withAccount.token) }, { account_id: "acct-1", run: "RUN-1" });
  const none = w.c.aiRunCredentialMint({ member: "ann", run: "RUN-2", writes: ["airuntick"] });
  assert.equal(row(none.token).account_id, null);
  assert.equal(Object.hasOwn(none, "account_id"), false, "the answer is as it was: the account is the row's");
  const before = w.snapshot();
  for (const account_id of ["", "  ", 7, {}, []]) {
    const r = w.c.aiRunCredentialMint({ member: "ann", run: "RUN-3", writes: ["airuntick"], account_id });
    assert.deepEqual([r.ok, r.code, r.what], [false, "AI_RUN_CREDENTIAL_MALFORMED", "account_id"], String(account_id));
  }
  assert.equal(w.snapshot(), before);
});
