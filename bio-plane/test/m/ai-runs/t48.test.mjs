/* ai-runs T48 (T48-30; N996 §5; K3195): the account a run carries and its switches are read from `ai-accounts` — its
   `accountFor` (R52, R18, R79), `accountReferenceState` and `groupKeyState` (the wake's decision, R18, R52), `accountUses`
   and `groupKeySwitches` (the dispatch's `suggestions`, R18) — and `credentials` is reached only for the run's own
   credentials and the `ai` credential's row (`aiRunCredentialMint`, `aiRunCredentialsEnd`, `aiCredentialLook`; R14, R18).
   Shown at the interface: with every one of `credentials`' account delegates (its R72) made to throw, each path answers
   as before; control: the same read made to fail in `ai-accounts` changes the answer. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, OPEN, INQ, ORG, sha, agentWorker, SIGNIN_TOKEN } from "./world.mjs";

const TOKEN = "instance-ai-secret-value-t48";
const DELEGATES = ["accountFor", "accountReferenceState", "groupKeyState", "groupKeySwitches", "accountUses", "accountUsesOf",
                   "accountReferenceFor", "aiKeptAway"];
/** `credentials`' account delegates (its R72), each made to throw: a read that still goes through one fails loudly. */
function silenceDelegates(w) {
  const asked = [];
  for (const name of DELEGATES) w.credentials[name] = () => { asked.push(name); throw new Error(`credentials.${name} asked`); };
  return asked;
}
const at = (s) => Date.parse(`2026-07-01T${s}Z`);

/** An organisation run over INQ, carried by ann's act, woken once through a wait source, with the binding `aw`. */
async function wakeWorld(aw, { account = "apikey", suggestions = false } = {}) {
  const w = world({ env: { AGENT_WORKER: aw, INSTANCE_AI_TOKEN: TOKEN, STORE: { idFromName: (n) => `id:${n}` },
                           AI_RUN_DISPATCH_WAIT_MS: "50" } });
  await w.group("ann", account === "apikey" ? {} : { noAccount: ["ann"] });
  if (account === "group") {
    assert.equal((await w.aiAccounts.groupKeySet({ key: "group-key-secret", by: "admin" })).ok, true);
    assert.equal(w.aiAccounts.groupKeySwitch({ on: true, by: "admin" }).ok, true);
    assert.equal(w.aiAccounts.groupKeyNoticeSeen({ member: "member:ann", by: "member:ann" }).ok, true);
    if (suggestions) assert.equal(w.aiAccounts.accountUsesSet({ owner: "group", switch: "suggestions", on: true, by: "admin" }).ok, true);
  } else if (suggestions)
    assert.equal(w.aiAccounts.accountUsesSet({ owner: "member:ann", switch: "suggestions", on: true, by: "member:ann" }).ok, true);
  w.bundle(INQ);
  w.ctx.id = { equals: (x) => x === "id:bio" };
  assert.equal(w.credentials.aiCredentialMint({ who: "admin", tokenId: "tok-org", secretSha: sha(TOKEN), principalKind: "organisation",
    taskScope: "investigative", writes: ["airuntick"], note: "the instance's key" }).ok, true);
  const cred = w.credentials.aiCredentialLook({ secretSha: sha(TOKEN) }).credential;
  const stamp = `${cred.principal}/${cred.tokenId}`;
  const reqs = [{ request: "q1", state: "captured" }];
  w.runs.registerWaitSource("capture-requests", { tickMs: () => 5000, configured: () => true, holds: () => [],
    woken: () => (reqs[0].woken ? [] : ["R1"]), completions: () => reqs.filter((q) => !q.woken), markWoken: () => { reqs[0].woken = true; } });
  return { w, stamp };
}

test("R52 (T48; N996 §5): the open asks ai-accounts.accountFor for the act of the member who started it — every credentials account delegate silenced, a run opens on her own key, on the group's key, and is refused AI_NO_ACCOUNT with none, as before; control: ai-accounts' accountFor failing is AI_NO_ACCOUNT, nothing written", async () => {
  const w = world();
  await w.group("ann", "dan", { noAccount: ["dan"] });
  w.bundle(INQ);
  const asked = silenceDelegates(w);
  const own = await w.runs.open(OPEN());
  assert.equal(own.started, true, JSON.stringify(own).slice(0, 300));
  assert.deepEqual({ ...w.row(`SELECT principal_claude, principal_claude_ref FROM ai_runs WHERE run='R1'`) },
                   { principal_claude: "member:ann", principal_claude_ref: "member:ann" });
  assert.equal((await w.runs.open(OPEN({ run: "D0", principalClaude: "member:dan" }))).code, "AI_NO_ACCOUNT");
  assert.equal((await w.aiAccounts.groupKeySet({ key: "group-key-secret", by: "admin" })).ok, true);
  assert.equal(w.aiAccounts.groupKeySwitch({ on: true, by: "admin" }).ok, true);
  assert.equal(w.aiAccounts.groupKeyNoticeSeen({ member: "member:dan", by: "member:dan" }).ok, true);
  assert.equal((await w.runs.open(OPEN({ run: "D1", principalClaude: "member:dan" }))).started, true);
  assert.equal(w.row(`SELECT principal_claude FROM ai_runs WHERE run='D1'`).principal_claude, "group");
  assert.deepEqual(asked, [], "no credentials account delegate was asked");
  /* control: the read is ai-accounts' — made to fail there, ann's open is refused by name and nothing is written */
  w.aiAccounts.accountFor = async () => { throw new Error("ai-accounts unreadable"); };
  const before = w.dump();
  const refused = await w.runs.open(OPEN({ run: "R2" }));
  assert.deepEqual([refused.started, refused.code], [false, "AI_NO_ACCOUNT"]);
  assert.equal(w.dump(), before);
});

test("R18, R52, R79 (T48): the wake's decision and dispatch read ai-accounts alone — the account (its accountFor, a key carried as secret), whether one serves (accountReferenceState, groupKeyState) and the suggestions switch (accountUses, groupKeySwitches); with credentials' delegates silenced each dispatches as before; control: ai-accounts' switch read failing reads as off, and its states failing withholds NO_ACCOUNT", async () => {
  const cases = [
    ["apikey", false, { kind: "apikey", level: "member", secret: "secret-of-ann", member: "member:ann", suggestions: false }],
    ["apikey", true, { kind: "apikey", level: "member", secret: "secret-of-ann", member: "member:ann", suggestions: true }],
    ["group", false, { kind: "apikey", level: "group", secret: "group-key-secret", member: "member:ann", suggestions: false }],
    ["group", true, { kind: "apikey", level: "group", secret: "group-key-secret", member: "member:ann", suggestions: true }],
  ];
  for (const [account, suggestions, want] of cases) {
    const aw = agentWorker();
    const { w, stamp } = await wakeWorld(aw, { account, suggestions });
    await w.runs.open(OPEN({ principalPlane: stamp }));
    const asked = silenceDelegates(w);
    const k = await w.runs.wake(at("00:00:10"));
    assert.deepEqual([k.wakes[0].resume, k.wakes[0].dispatch.state], ["DISPATCH", "DISPATCHED"], `${account} ${suggestions}`);
    assert.deepEqual(aw.calls[0].body.account, want, `${account} ${suggestions}`);
    assert.deepEqual(asked, [], `${account} ${suggestions}: no credentials account delegate was asked`);
  }
  /* control: the switch read failing in ai-accounts reads as off (anything but an explicit on is off) */
  const aw = agentWorker();
  const g = await wakeWorld(aw, { account: "group", suggestions: true });
  await g.w.runs.open(OPEN({ principalPlane: g.stamp }));
  g.w.aiAccounts.groupKeySwitches = () => { throw new Error("ai-accounts unreadable"); };
  await g.w.runs.wake(at("00:00:10"));
  assert.equal(aw.calls[0].body.account.suggestions, false);
  /* control: whether an account serves is ai-accounts' — its two states failing, the woken run is withheld NO_ACCOUNT */
  const aw2 = agentWorker();
  const n = await wakeWorld(aw2);
  await n.w.runs.open(OPEN({ principalPlane: n.stamp }));
  n.w.aiAccounts.accountReferenceState = () => { throw new Error("x"); };
  n.w.aiAccounts.groupKeyState = () => { throw new Error("x"); };
  assert.equal((await n.w.runs.wake(at("00:00:10"))).wakes[0].resume, "NO_ACCOUNT");
  assert.equal(aw2.calls.length, 0);
});

test("R18, R79, R14 (T48): a member's run dispatched at her act reads her held sign-in from ai-accounts and keeps credentials for the segment's credential alone — minted, and ended with the run; with credentials' account delegates silenced it dispatches and ends as before", async () => {
  const aw = agentWorker();
  const w = world({ env: { AGENT_WORKER: aw, STORE: { idFromName: (n) => `id:${n}` }, AI_RUN_DISPATCH_WAIT_MS: "50" } });
  await w.group("ann", { noAccount: ["ann"] });
  await w.signin("ann");
  w.ctx.id = { equals: (x) => x === "id:bio" };
  w.bundle(INQ);
  assert.equal((await w.runs.open(OPEN({ principalPlane: "member:ann", principalClaude: "member:ann", actor: "member:ann",
                                         viewer: "member:ann" }))).started, true);
  const asked = silenceDelegates(w);
  const d = await w.runs.dispatchMemberRun({ run: "R1", by: "member:ann" });
  assert.deepEqual([d.dispatched, d.dispatch.state], [true, "DISPATCHED"], JSON.stringify(d).slice(0, 300));
  assert.deepEqual(aw.calls[0].body.account, { kind: "signin", level: "member", secret: SIGNIN_TOKEN("ann"), member: "member:ann",
                                               suggestions: false });
  const minted = w.credentials.aiCredentialLook({ secretSha: sha(aw.calls[0].body.credential) }).credential;
  assert.deepEqual([minted.run, minted.revoked], ["R1", false], "the segment's credential is credentials'");
  const c = await w.runs.close({ run: "R1", bound: "completed", caller: "member:ann", viewer: "member:ann", actor: "member:ann" });
  assert.equal(c.terminated, true);
  assert.equal(w.credentials.aiCredentialLook({ secretSha: sha(aw.calls[0].body.credential) }).credential.revoked, true,
    "R14: ended with the run, through credentials");
  assert.deepEqual(asked, [], "no credentials account delegate was asked");
  void ORG;
});
