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

/* ===== R72: the transitional delegates to ai-accounts (retired T53; kept answered until their users re-point) ===== */

const A = await import("../../../src/ai-accounts/index.mjs");
const C = await import("../../../src/credentials/index.mjs");
const CHECKS = await import("../../../src/credentials/checks.mjs");

/* R72 retired (T53, K5457): what ai-accounts retired is gone from credentials; the services it still has and users still
   call by credentials' name stay answered, the same object, until those users re-point. */
test("R72 (retired) the delegates left are exactly the services ai-accounts still answers, each passing its arguments unchanged and answering ai-accounts' own answer; none of what ai-accounts retired is answered here", async () => {
  const w = await world().group("ann");
  assert.ok(Object.isFrozen(C.MOVED_TO_AI_ACCOUNTS));
  for (const name of C.MOVED_TO_AI_ACCOUNTS) {
    assert.equal(typeof A.AiAccounts.prototype[name], "function", `${name} is still ai-accounts'`);
    const seen = [];
    const answer = { sentinel: name };
    const real = w.c.accounts[name];
    w.c.accounts[name] = (...a) => { seen.push(a); return answer; };
    try {
      const args = [{ member: "ann", by: "ann", n: name }, "second", 3];
      assert.equal(w.c[name](...args), answer, `${name}: ai-accounts' own answer`);
      assert.deepEqual(seen, [args], `${name}: asked once, its arguments unchanged`);
    } finally { w.c.accounts[name] = real; }
  }
  for (const gone of ["accountReferenceSet", "accountReferenceRemove", "accountReferenceState", "accountReferenceFor", "subscriptionConnected",
                      "subscriptionDisconnect", "subscriptionTokenHold", "subscriptionTokenRefused", "groupKeySet", "groupKeyRemove",
                      "groupKeySwitch", "groupKeyState", "groupKeySwitches", "groupKeyNotice", "groupKeyNoticeSeen", "projectKeySet",
                      "projectSigninSet", "projectAccountRemove", "projectAccountSwitch", "projectAccountState", "projectKeyNotice",
                      "projectKeyNoticeSeen", "projectAccountsSuspended"])
    assert.equal(typeof w.c[gone], "undefined", `${gone} left with ai-accounts' R8, R12, R13, R18 and R35`);
  for (const name of ["sealText", "unsealText", "accountActBar", "accountServing", "servingAccountOf", "onAccountCleared", "start", "migrate"])
    assert.ok(!C.MOVED_TO_AI_ACCOUNTS.includes(name), `${name} is a seam or a lifecycle call, not a delegate`);
});

test("R72 USE_KINDS and a frozen ACCOUNT_CHECKS view are re-exported from index.mjs only: the view is ai-accounts' AI_ACCOUNT_CHECKS with this module's own C-29 rows, each row the holder's own object; checks.mjs holds only its own; control: no other moved constant is answered", () => {
  assert.equal(C.USE_KINDS, A.USE_KINDS, "ai-accounts' own, the same frozen list");
  const own = CHECKS.ACCOUNT_CHECKS;
  assert.ok(Object.isFrozen(C.ACCOUNT_CHECKS));
  assert.deepEqual(Object.keys(C.ACCOUNT_CHECKS).sort(), [...Object.keys(A.AI_ACCOUNT_CHECKS), ...Object.keys(own)].sort());
  for (const [code, r] of Object.entries(A.AI_ACCOUNT_CHECKS)) assert.equal(C.ACCOUNT_CHECKS[code], r, code);
  for (const [code, r] of Object.entries(own)) assert.equal(C.ACCOUNT_CHECKS[code], r, code);
  assert.ok(Object.keys(own).every((k) => !(k in A.AI_ACCOUNT_CHECKS)), "no code in both");
  assert.notEqual(CHECKS.ACCOUNT_CHECKS, C.ACCOUNT_CHECKS, "checks.mjs answers its own rows, never the view");
  assert.ok(!("NOT_YOUR_ACCOUNT" in CHECKS.ACCOUNT_CHECKS) && "NOT_YOUR_ACCOUNT" in C.ACCOUNT_CHECKS);
  for (const k of ["ACCOUNT_SWITCHES", "EXPLORE_VALUES", "USE_SWITCHES", "KEEP_AWAY_REASON", "SIGNIN_TOKEN_LENGTH",
                   "AI_WORDS", "CREDENTIALS_PROJECT_TABLES", "CREDENTIALS_HISTORY_TABLE"])
    assert.ok(!(k in C) && !(k in CHECKS), `${k} is not answered here`);
});

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
  for (const t of ["ai_accounts", "account_changes", "ai_account_lists"])
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

test("R73 the notice is told inside ai-accounts' act, credentials' listener first, and a later listener that throws leaves the act and credentials' work standing", async () => {
  const { w, mint } = await runs(["ann"]);
  await w.served("ann");
  w.c.accounts.accountUsesSet({ account_id: w.idOf("member:ann"), switch: "standing", on: true, by: "ann" });
  const g = await w.c.aiGrantMintStanding({ member: "ann", question: "q" });
  const run = mint("ann");
  /* a second module's listener, registered after credentials', that throws */
  const notices = [];
  w.c.accounts.onAccountCleared("zz-probe", (n) => { notices.push(n); throw new Error("a listener that throws"); });
  assert.ok(w.removeAccounts("member:ann", "ann").every((r) => r.ok === true), "the act stands");
  assert.deepEqual(notices.map((n) => [n.member, n.why]), [["ann", "removed"]]);
  assert.equal((await w.c.aiGrantHeld({ token: g.token })).ok, false, "credentials' listener ran before the throwing one");
  assert.equal(look(w, run.token).revoked, true, "and its run credential revocation stands");
});

test("R73 ACCOUNT_CLEARED_WHY holds the five reasons ai-accounts R26 sends, frozen", async () => {
  assert.deepEqual([...C.ACCOUNT_CLEARED_WHY], ["removed", "disconnected", "revoked", "refused", "unresolved"]);
  assert.ok(Object.isFrozen(C.ACCOUNT_CLEARED_WHY));
});

test("R73 ACCOUNT_CLEARED_WHY holds the five reasons ai-accounts R26 sends, frozen (each is driven through its real act in t50-signin.test.mjs)", async () => {
  assert.deepEqual([...C.ACCOUNT_CLEARED_WHY], ["removed", "disconnected", "revoked", "refused", "unresolved"]);
  assert.ok(Object.isFrozen(C.ACCOUNT_CLEARED_WHY));
});

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

