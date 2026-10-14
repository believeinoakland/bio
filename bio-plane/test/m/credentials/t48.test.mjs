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

/* ===== R72: the transitional delegates to ai-accounts ===== */

const A = await import("../../../src/ai-accounts/index.mjs");
const C = await import("../../../src/credentials/index.mjs");
const CHECKS = await import("../../../src/credentials/checks.mjs");

/* Every service of ai-accounts' R1–R23: the public methods of its class, less the seams credentials itself calls (its
   R24–R26) and the lifecycle (`start`, `migrate`, `declareTables`). */
const SEAMS = ["sealText", "unsealText", "accountActBar", "accountServing", "servingAccountOf", "notYourAccount", "noAccount",
  "accountMemberNotActive", "onAccountCleared"];
const MOVED = Object.getOwnPropertyNames(A.AiAccounts.prototype)
  .filter((n) => n !== "constructor" && !["start", "migrate", "declareTables"].includes(n) && !SEAMS.includes(n)).sort();

test("R72 one delegate per moved service: every service of ai-accounts' R1–R23 is answered by credentials, passing its arguments unchanged and answering ai-accounts' own answer, the same object (a promise included); control: a seam or a lifecycle call is not delegated", async () => {
  assert.equal(MOVED.length, 36);
  assert.deepEqual([...C.MOVED_TO_AI_ACCOUNTS].sort(), MOVED, "the delegates are exactly ai-accounts' moved services");
  assert.ok(Object.isFrozen(C.MOVED_TO_AI_ACCOUNTS));
  const w = await world().group("ann");
  for (const name of MOVED) {
    const seen = [];
    const answer = { sentinel: name };
    const real = w.c.accounts[name];
    w.c.accounts[name] = (...a) => { seen.push(a); return answer; };
    try {
      const args = [{ member: "ann", by: "ann", n: name }, "second", 3];
      assert.equal(w.c[name](...args), answer, `${name}: ai-accounts' own answer`);
      assert.equal(seen.length, 1, `${name}: asked once`);
      assert.deepEqual(seen[0], args, `${name}: its arguments unchanged`);
      assert.equal(seen[0][0], args[0], `${name}: the same object`);
    } finally { w.c.accounts[name] = real; }
  }
  for (const name of [...SEAMS, "start", "migrate"])
    assert.ok(!C.MOVED_TO_AI_ACCOUNTS.includes(name), `${name} is not a delegate`);
  /* real calls: each answers as ai-accounts answers, byte for byte */
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-r72", by: "ann" });
  for (const [name, a] of [["accountReferenceState", { member: "ann", viewer: "member:ann" }], ["aiKeepAwayState", undefined],
                           ["groupKeySwitches", undefined], ["accountUsesOf", { owner: "member:ann" }], ["aiKeptAway", {}],
                           ["groupKeyState", { viewer: "member:second" }], ["projectsKeptAway", { use: "ask" }]])
    assert.deepEqual(await w.c[name](a), await w.c.accounts[name](a), name);
  assert.deepEqual(await w.c.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }),
    await w.c.accounts.accountFor({ member: "ann", act: { kind: "ask", member: "ann" } }));
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
  for (const k of ["ACCOUNT_KINDS", "ACCOUNT_SWITCHES", "EXPLORE_VALUES", "USE_SWITCHES", "KEEP_AWAY_REASON", "SIGNIN_TOKEN_LENGTH",
                   "AI_WORDS", "CREDENTIALS_PROJECT_TABLES", "CREDENTIALS_HISTORY_TABLE"])
    assert.ok(!(k in C) && !(k in CHECKS), `${k} is not answered here`);
});

test("R72 credentialsOps answers the 24 moved op names through the delegates, each as ai-accounts' own route map answers it, its own ops after them and none sharing a name; control: an own op is credentials'", async () => {
  const w = await world().group("ann");
  const url = (q) => new URL(`http://x/?${q}`);
  const movedOps = Object.keys(A.aiAccountsOps(w.c.accounts, url(""), null, {}));
  assert.equal(movedOps.length, 24);
  const ops = Object.keys(w.ops());
  for (const op of movedOps) assert.ok(ops.includes(op), op);
  assert.equal(ops.length, 52, "the 24 moved and the 28 own");
  /* each moved op calls the delegate, which answers ai-accounts' own: a sentinel through both maps, the same arguments */
  for (const op of movedOps) {
    const calls = [];
    const saved = {};
    for (const name of C.MOVED_TO_AI_ACCOUNTS) {
      saved[name] = w.c.accounts[name];
      w.c.accounts[name] = (...a) => { calls.push([name, a]); return { sentinel: op }; };
    }
    try {
      const q = "by=ann&viewer=member:ann&member=ann&owner=member:ann&project=P&limit=5";
      const body = { member: "ann", secret: "sk-x", on: true, project: "P" };
      const viaCred = w.ops(q, body)[op]();
      const viaThem = A.aiAccountsOps(w.c.accounts, url(q), body, {})[op]();
      assert.deepEqual(viaCred, { sentinel: op }, op);
      assert.deepEqual(viaThem, viaCred, op);
      assert.equal(calls.length, 2, op);
      assert.deepEqual(calls[0], calls[1], `${op}: the same service, the same arguments`);
    } finally { Object.assign(w.c.accounts, saved); }
  }
  /* control: an own op of credentials' is answered by its own code */
  assert.equal(w.ops("by=second&member=ann").passwordresetlink().member, "ann");
});

test("R72 credentialsOf makes ai-accounts on the same storage with the seal secret it is given, and migrate runs ai-accounts' migrate first; control: a world with no seal secret seals nothing", async () => {
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

test("R73 a sign-in cleared by her disconnection revokes the member's live run credentials, inside the act, and no one else's; control: another member's run credential and her own R12 credential stay live", async () => {
  const w = await world().group("ann", "bob");
  await w.signin("ann");
  const a = w.c.aiRunCredentialMint({ member: "ann", run: "RUN-A", writes: ["airuntick"] });
  const b = w.c.aiRunCredentialMint({ member: "bob", run: "RUN-B", writes: ["airuntick"] });
  const own = w.c.aiCredentialMint({ who: "ann", tokenId: "ann-own", secretSha: "c".repeat(64), principalKind: "member" });
  assert.equal(own.ok, true);
  const look = (t) => w.c.aiCredentialLook({ secretSha: sha(t) }).credential;
  assert.equal(look(a.token).revoked, false);
  assert.equal(w.c.subscriptionDisconnect({ member: "ann", by: "ann" }).disconnected, true);
  assert.deepEqual([look(a.token).revoked, look(a.token).revokedBy], [true, "ann"], "revoked in the act, by its actor");
  assert.equal(look(b.token).revoked, false, "control: bob's");
  assert.equal(w.c.aiCredentialLook({ secretSha: "c".repeat(64) }).credential.revoked, false, "control: her R12 credential");
});

test("R73 a reference removed ends her standing grants, and a sign-in cleared while no reference is held ends them too; control: a sign-in cleared while her reference is held leaves her standing grant, and her ask grant is never ended by it", async () => {
  const w = await world().group("ann", "bob");
  const held = async (t) => (await w.c.aiGrantHeld({ token: t })).ok === true;
  /* a reference removed */
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  w.c.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" });
  const s = (await w.c.login({ role: "member:ann", password: PASSWORD("ann") })).token;
  const ask = await w.c.aiGrantMint({ member: "ann", by: "ann", session: s });
  const g1 = await w.c.aiGrantMintStanding({ member: "ann", question: "q" });
  assert.equal(await held(g1.token), true);
  /* control: her sign-in cleared while the reference is held leaves the standing grant */
  await w.signin("ann");
  assert.equal(w.c.subscriptionDisconnect({ member: "ann", by: "ann" }).disconnected, true);
  assert.equal(await held(g1.token), true, "reference_held: the grant stands");
  w.c.accountReferenceRemove({ member: "ann", by: "ann" });
  assert.equal(await held(g1.token), false, "the reference removed ends it");
  assert.equal(await held(ask.token), true, "control: an ask's grant is not a standing one");
  /* a sign-in cleared while no reference is held */
  await w.signin("bob");
  w.c.accountUsesSet({ owner: "member:bob", switch: "standing", on: true, by: "bob" });
  const g2 = await w.c.aiGrantMintStanding({ member: "bob", question: "q" });
  assert.equal(await held(g2.token), true);
  w.c.subscriptionDisconnect({ member: "bob", by: "bob" });
  assert.equal(await held(g2.token), false, "her sign-in served it: ended");
});

test("R73 the notice is told inside ai-accounts' act, credentials' listener first, and a later listener that throws leaves the act and credentials' work standing; control: a reference removed revokes no run credential", async () => {
  const w = await world().group("ann");
  await w.c.accountReferenceSet({ member: "ann", kind: "apikey", secret: "sk-ann", by: "ann" });
  w.c.accountUsesSet({ owner: "member:ann", switch: "standing", on: true, by: "ann" });
  const g = await w.c.aiGrantMintStanding({ member: "ann", question: "q" });
  const run = w.c.aiRunCredentialMint({ member: "ann", run: "RUN-X", writes: ["airuntick"] });
  /* a second module's listener, registered after credentials', that throws */
  const notices = [];
  w.c.accounts.onAccountCleared("zz-probe", (n) => { notices.push(n); throw new Error("a listener that throws"); });
  assert.equal(w.c.accountReferenceRemove({ member: "ann", by: "ann" }).ok, true, "the act stands");
  assert.deepEqual(notices.map((n) => [n.member, n.account, n.reference_held]), [["ann", "reference", false]]);
  assert.equal((await w.c.aiGrantHeld({ token: g.token })).ok, false, "credentials' listener ran before the throwing one");
  assert.equal(w.c.aiCredentialLook({ secretSha: sha(run.token) }).credential.revoked, false, "a reference removed revokes no run credential");
});
