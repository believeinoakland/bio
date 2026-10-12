/* ai-runs T46 (T46-14): R78, the test-instance exception (`testInstance`, `partAdmitted`, the `untested` label recorded at
   the open and answered by R10, R19 and R28); R18 as amended, a member's own sign-in run dispatched for her alone at her
   own act (`dispatchMemberRun`), every other R18 refusal standing. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, OPEN, INQ, PROJ, ORG, T0, sha, agentWorker } from "./world.mjs";
import { AI_RUNS_CHECKS, CIVICSMITH_TEST_SET, untestedLabel } from "../../../src/run-rules/index.mjs";

const PAIR = { CIVICSMITH_TEST_INSTANCE: "biosmoke7", INSTANCE_NAME: "biosmoke7" };
const EMPTY = CIVICSMITH_TEST_SET;          // Civicsmith's own set, v1 with no matters: no bar can be held on it
const refusedMode = (r) => assert.deepEqual([r.started, r.code, r.check], [false, "AI_RUN_MODE_NOT_DEPLOYED", "C-109.1"],
  JSON.stringify(r).slice(0, 300));

async function testWorld(env, opts = {}) {
  const w = world({ env, testSet: EMPTY, bars: [], ...opts });
  await w.group("ann");
  w.bundle(INQ);
  return w;
}

test("R78: testInstance() is true exactly when the environment's CIVICSMITH_TEST_INSTANCE is a string equal to its INSTANCE_NAME, both non-empty; false otherwise and when either cannot be read", async () => {
  const cases = [
    [PAIR, true],
    [{ CIVICSMITH_TEST_INSTANCE: "biosmoke8", INSTANCE_NAME: "biosmoke7" }, false],
    [{ CIVICSMITH_TEST_INSTANCE: "", INSTANCE_NAME: "" }, false],
    [{ CIVICSMITH_TEST_INSTANCE: "", INSTANCE_NAME: "biosmoke7" }, false],
    [{ INSTANCE_NAME: "biosmoke7" }, false],
    [{ CIVICSMITH_TEST_INSTANCE: "biosmoke7" }, false],
    [{ CIVICSMITH_TEST_INSTANCE: "BIOSMOKE7", INSTANCE_NAME: "biosmoke7" }, false],
    [{ CIVICSMITH_TEST_INSTANCE: true, INSTANCE_NAME: "true" }, false],
    [{ CIVICSMITH_TEST_INSTANCE: ["biosmoke7"], INSTANCE_NAME: "biosmoke7" }, false],
    [{}, false],
  ];
  for (const [env, want] of cases) assert.equal(world({ env }).runs.testInstance(), want, JSON.stringify(env));
  /* an environment that cannot be read answers false, never throws */
  const unreadable = {};
  Object.defineProperty(unreadable, "CIVICSMITH_TEST_INSTANCE", { get() { throw new Error("unreadable"); } });
  unreadable.INSTANCE_NAME = "biosmoke7";
  assert.equal(world({ env: unreadable }).runs.testInstance(), false);
});

test("R78: partAdmitted answers run-rules' partAdmittedOn on what this record holds with the instance's testInstance — on an empty set, admitted with the label only on a test instance; a bar held admits unlabelled on either; the chain is never lifted", async () => {
  const off = await testWorld({});
  assert.deepEqual(off.runs.partAdmitted("check"), { admitted: false, untested: null });
  const on = await testWorld(PAIR);
  assert.deepEqual(on.runs.partAdmitted("check"), { admitted: true, untested: untestedLabel("check") });
  assert.equal(on.runs.partAdmitted("check").untested.kind, "untested");
  /* the chain stands: investigate is not admitted until check is verified live, even on a test instance */
  assert.deepEqual(on.runs.partAdmitted("investigate"), { admitted: false, untested: null });
  /* a bar held: admitted unlabelled whatever the instance (the label follows the bar, not the instance) */
  for (const env of [{}, PAIR]) {
    const held = world({ env });
    assert.deepEqual(held.runs.partAdmitted("check"), { admitted: true, untested: null }, JSON.stringify(env));
  }
});

test("R78, R40, R10, R19, R28: an open in mode check on Civicsmith's empty set on a test instance opens, recording and answering the untested label at the open; read and runFor answer it; control: the variable biosmoke8, empty or absent is refused C-109.1 with nothing written", async () => {
  const w = await testWorld(PAIR);
  const label = untestedLabel("check");
  const o = await w.runs.open(OPEN());
  assert.equal(o.started, true, JSON.stringify(o));
  assert.deepEqual(o.untested, label, "R10's answer carries the label");
  assert.deepEqual(JSON.parse(w.row(`SELECT untested FROM ai_runs WHERE run='R1'`).untested), { ...label },
    "recorded at the open (R32)");
  assert.deepEqual((await w.runs.read({ run: "R1", viewer: "admin" })).session.untested, label, "R19's session.untested");
  assert.deepEqual(w.runs.runFor("R1", "admin").untested, label, "R28's runFor carries the label");
  /* recorded, never derived later: the instance ceasing to be a test instance does not remove the run's label */
  w.runs.env = {};
  assert.deepEqual((await w.runs.read({ run: "R1", viewer: "admin" })).session.untested, label);
  assert.deepEqual(w.runs.runFor("R1", "admin").untested, label);
  /* controls: not a test instance, refused C-109.1, nothing written */
  for (const env of [{ CIVICSMITH_TEST_INSTANCE: "biosmoke8", INSTANCE_NAME: "biosmoke7" },
                     { CIVICSMITH_TEST_INSTANCE: "", INSTANCE_NAME: "biosmoke7" },
                     { INSTANCE_NAME: "biosmoke7" }]) {
    const x = await testWorld(env);
    const before = x.dump();
    refusedMode(await x.runs.open(OPEN()));
    assert.equal(x.dump(), before, `nothing written (${JSON.stringify(env)})`);
    assert.equal(x.count("ai_runs"), 0);
  }
});

test("R78: a CIVICSMITH_TEST_INSTANCE (or INSTANCE_NAME) in the open's body or query is ignored — only the Worker environment is read", async () => {
  const w = await testWorld({ INSTANCE_NAME: "biosmoke7" });
  const before = w.dump();
  refusedMode(await w.op("airunopen", { principal: ORG, viewer: "admin", CIVICSMITH_TEST_INSTANCE: "biosmoke7" },
    { ...OPEN({ principalPlane: undefined, viewer: undefined }), ...PAIR, env: PAIR }));
  refusedMode(await w.runs.open({ ...OPEN(), ...PAIR }));
  assert.equal(w.dump(), before, "nothing written");
  assert.equal(w.runs.testInstance(), false);
});

test("R78, R10, R19, R28: a run the bar admitted carries no label — untested is null on the open's answer, the read and runFor, on a test instance too", async () => {
  const w = world({ env: PAIR });
  await w.group("ann"); w.bundle(INQ);
  const o = await w.runs.open(OPEN());
  assert.deepEqual([o.started, o.untested], [true, null]);
  assert.equal((await w.runs.read({ run: "R1", viewer: "admin" })).session.untested, null);
  assert.equal(w.runs.runFor("R1", "admin").untested, null);
  assert.equal(w.row(`SELECT untested FROM ai_runs WHERE run='R1'`).untested, null);
});

test("R78, R23's input: an exploring run's origin is judged with investigate's admission through partAdmitted — refused while check is unverified even on a test instance; once check is verified live, admitted on the exception; control: the same record on a non-test instance stays refused", async () => {
  const { stepsStub } = await import("./world.mjs");
  const own = { origin: "explore", place: { questions: [INQ] }, work: "find the fee schedule" };
  for (const [env, opens] of [[PAIR, true], [{}, false]]) {
    const w = world({ env, testSet: EMPTY, bars: [], steps: stepsStub() });
    await w.group("ann"); w.bundle(INQ);
    assert.equal((await w.runs.open(OPEN({ run: "S", ...own }))).code, env === PAIR ? "AI_RUN_EXPLORE_NOT_DEPLOYABLE" : "AI_RUN_MODE_NOT_DEPLOYED");
    if (env !== PAIR) { assert.equal(w.runs.partAdmitted("investigate").admitted, false); continue; }
    await w.runs.open(OPEN({ run: "V" }));
    assert.equal(w.runs.verificationRecord({ mode: "check", run: "V", evidence: ["seen live"], by: "member:ann", at: T0 }).ok, true);
    assert.deepEqual(w.runs.partAdmitted("investigate"), { admitted: true, untested: untestedLabel("investigate") });
    const x = await w.runs.open(OPEN({ run: "X", ...own }));
    assert.equal(x.started, opens, JSON.stringify(x));
  }
  /* control: with check verified on a non-test instance holding no bar, investigate is still not admitted */
  const plain = world({ env: {}, testSet: EMPTY, bars: [], deployedModes: ["check"] });
  await plain.group("ann"); plain.bundle(INQ);
  assert.equal(plain.runs.partAdmitted("investigate").admitted, false);
});

/* ---- R18 (T46; N919; Bob's, K2892): a member's own sign-in run, dispatched for her alone at her act ---- */

const TOKEN_M = `aik-${"a".repeat(64)}`;
const TOKEN_B = `aik-${"b".repeat(64)}`;

/** A world where ann's run was opened on her own `ai` credential (`member:ann/tok-m`), in the `bio` object, with the
 *  agent-worker binding `aw`; `account` is how ann's act is served: her own sign-in (`signin`), her API-key reference
 *  (`apikey`), or the group's key (`group`). */
async function memberWorld(aw, { account = "signin", mode = "check", env = {}, opts = {} } = {}) {
  const w = world({ env: { AGENT_WORKER: aw, STORE: { idFromName: (n) => `id:${n}` }, AI_RUN_DISPATCH_WAIT_MS: "50", ...env },
                    ...(mode === "plan" ? { deployedModes: ["check", "plan"] } : {}), ...opts });
  await w.group("ann", "bob", { noAccount: ["ann", "bob"] });
  if (account === "signin") assert.equal(w.credentials.subscriptionConnected({ member: "member:ann" }).ok, true);
  if (account === "apikey") await w.account("ann");
  if (account === "group") {
    assert.equal((await w.credentials.groupKeySet({ key: "group-key-secret", by: "admin" })).ok, true);
    assert.equal(w.credentials.groupKeySwitch({ on: true, by: "admin" }).ok, true);
    assert.equal(w.credentials.groupKeyNoticeSeen({ member: "member:ann", by: "member:ann" }).ok, true);
  }
  await w.account("bob");
  for (const [who, tok, s] of [["ann", "tok-m", TOKEN_M], ["bob", "tok-b", TOKEN_B]]) {
    const m = w.credentials.aiCredentialMint({ who, tokenId: tok, secretSha: sha(s), principalKind: "member",
      taskScope: "investigative", writes: ["airuntick"], note: `${who}'s own key` });
    assert.equal(m.ok, true, JSON.stringify(m));
  }
  w.ctx.id = { equals: (x) => x === "id:bio" };
  w.bundle(INQ);
  const stamp = (() => { const c = w.credentials.aiCredentialLook({ secretSha: sha(TOKEN_M) }).credential; return `${c.principal}/${c.tokenId}`; })();
  if (mode === "plan") {
    w.project(PROJ, "ann");
    assert.equal(w.runs.registerOpenCheck("action-plans", "plan", () => null).ok, true);
    const o = await w.runs.open(OPEN({ mode: "plan", plan: "PLN-2026-0001", contextType: "project", contextId: PROJ,
      principalPlane: stamp, principalClaude: "member:ann", actor: "ann", viewer: "member:ann" }));
    assert.equal(o.started, true, JSON.stringify(o));
  } else {
    const o = await w.runs.open(OPEN({ mode, principalPlane: stamp, principalClaude: "member:ann", actor: "member:ann", viewer: "member:ann" }));
    assert.equal(o.started, true, JSON.stringify(o));
  }
  return { w, stamp };
}
const runLog = (w) => w.rows(`SELECT * FROM observation_log WHERE authority_kind='run' AND authority='R1' ORDER BY seq`);

test("R18 (T46; K2892): a check run a member opened on her own credential, served by her own sign-in, dispatched at her act through dispatchMemberRun, reaches the binding once with her account and her credential and no other member's; no secret enters the record or the answer", async () => {
  const aw = agentWorker();
  const { w } = await memberWorld(aw);
  const d = await w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M, at: "2026-07-01T00:01:00Z" });
  assert.deepEqual([d.found, d.dispatched, d.dispatch.state], [true, true, "DISPATCHED"], JSON.stringify(d));
  assert.equal(aw.calls.length, 1);
  assert.equal(aw.calls[0].url, "https://agent-worker/run");
  assert.deepEqual(aw.calls[0].body, { run_id: "R1", store: "bio", credential: TOKEN_M,
    account: { kind: "signin", level: "member", member: "member:ann", suggestions: false } });
  assert.equal("secret" in aw.calls[0].body.account, false, "a sign-in carries no secret key");
  assert.equal(JSON.stringify(aw.calls[0].body).includes("bob"), false, "no other member's account or credential");
  for (const t of ["ai_runs", "observation_log"])
    assert.equal(JSON.stringify(w.rows(`SELECT * FROM ${t}`)).includes(TOKEN_M), false, "the credential enters no record");
  assert.equal(JSON.stringify(d).includes(TOKEN_M), false, "nor the answer");
  /* her sign-in's own suggestions switch rides with it (agent-worker R6 as T46 amends it) */
  assert.equal(w.credentials.accountUsesSet({ owner: "member:ann", switch: "suggestions", on: true, by: "member:ann" }).ok, true);
  await w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M });
  assert.equal(aw.calls[1].body.account.suggestions, true);
});

test("R18 (T46; K2892): a plan run on her own sign-in is dispatched the same way", async () => {
  const aw = agentWorker();
  const { w } = await memberWorld(aw, { mode: "plan" });
  const d = await w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M });
  assert.equal(d.dispatched, true, JSON.stringify(d));
  assert.deepEqual(aw.calls.map((c) => c.body.account), [{ kind: "signin", level: "member", member: "member:ann", suggestions: false }]);
});

test("R18 (T46) controls: another member's `by` is AI_RUN_NOT_PRINCIPAL; absent or invisible {found: false}; an ended run {dispatched: false, status}; the same member on the group's key or her API-key reference withheld MEMBER_PRINCIPAL_RUN; a mode other than check or plan MEMBER_RUN_MODE_NOT_ADMITTED; no credential, another's or a revoked one refused — no call counted on any, nothing written", async () => {
  const aw = agentWorker();
  const { w, stamp } = await memberWorld(aw);
  const before = w.dump();
  const disp = (o) => w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M, ...o });
  const notPrincipal = await disp({ by: "member:bob", credential: TOKEN_B });
  assert.deepEqual([notPrincipal.dispatched, notPrincipal.code, notPrincipal.check],
                   [false, "AI_RUN_NOT_PRINCIPAL", AI_RUNS_CHECKS.AI_RUN_NOT_PRINCIPAL.check]);
  assert.equal((await disp({ by: ORG, viewer: "member:ann" })).code, "AI_RUN_NOT_PRINCIPAL", "a machine is no member");
  assert.deepEqual(await disp({ run: "NOPE" }), { run: "NOPE", found: false, note: "no such run: it either never existed or was purged" });
  assert.equal((await disp({ run: "" })).found, false);
  /* invisible answers as absent: a sight that sees no run (an unrecognised stamp fails closed, R19) */
  const hidden = await disp({ viewer: "who-knows" });
  assert.deepEqual(hidden, { run: "R1", found: false, note: "no such run: it either never existed or was purged" });
  /* no credential, another member's, one not on record: nothing sent */
  assert.equal((await disp({ credential: null })).withheld, "MEMBER_PRINCIPAL_RUN");
  assert.equal((await disp({ credential: TOKEN_B })).code, "AI_RUN_NOT_PRINCIPAL", "bob's credential is not this run's");
  assert.equal((await disp({ credential: `aik-${"c".repeat(64)}` })).code, "AI_RUN_NOT_PRINCIPAL", "not on record");
  assert.equal(w.dump(), before, "nothing written");
  assert.equal(aw.calls.length, 0, "no call counted");
  /* revoked: refused, nothing sent */
  const rv = await memberWorld(agentWorker());
  rv.w.credentials.aiCredentialRevoke({ who: "ann", tokenId: "tok-m" });
  assert.equal((await rv.w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M })).code, "AI_RUN_NOT_PRINCIPAL");
  /* the same member on the group's key, or on her own API-key reference: withheld MEMBER_PRINCIPAL_RUN, nothing sent */
  for (const account of ["group", "apikey"]) {
    const x = await memberWorld(aw, { account });
    const b = x.w.dump();
    const r = await x.w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M });
    assert.deepEqual([r.dispatched, r.withheld], [false, "MEMBER_PRINCIPAL_RUN"], account);
    assert.equal(x.w.dump(), b, `nothing written (${account})`);
  }
  assert.equal(aw.calls.length, 0, "no call counted");
  /* every other R18 ground stands */
  const unbound = await memberWorld(null);
  assert.equal((await unbound.w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M })).withheld, "AGENT_WORKER_UNBOUND");
  const elsewhere = await memberWorld(aw);
  elsewhere.w.ctx.id = { equals: () => false };
  assert.equal((await elsewhere.w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M })).withheld, "NAMESPACE_UNDETERMINED");
  assert.equal(aw.calls.length, 0);
  /* an ended run */
  assert.equal((await w.runs.close({ run: "R1", bound: "completed", caller: stamp, viewer: "member:ann", actor: "member:ann" })).terminated, true);
  const ended = await disp({});
  assert.deepEqual([ended.found, ended.dispatched, ended.status], [true, false, "finished"]);
  assert.equal(aw.calls.length, 0);
});

test("R18 (T46; K2920): a run of a mode other than check or plan on her own sign-in is withheld MEMBER_RUN_MODE_NOT_ADMITTED, nothing sent", async () => {
  const aw = agentWorker();
  const w = world({ env: { AGENT_WORKER: aw, STORE: { idFromName: (n) => `id:${n}` } }, deployedModes: ["check", "investigate"] });
  await w.group("ann", { noAccount: ["ann"] });
  assert.equal(w.credentials.subscriptionConnected({ member: "member:ann" }).ok, true);
  w.credentials.aiCredentialMint({ who: "ann", tokenId: "tok-m", secretSha: sha(TOKEN_M), principalKind: "member",
    taskScope: "investigative", writes: ["airuntick"], note: "ann's key" });
  w.ctx.id = { equals: (x) => x === "id:bio" };
  w.bundle(INQ);
  await w.runs.open(OPEN({ run: "V" }));
  assert.equal(w.runs.verificationRecord({ mode: "check", run: "V", evidence: ["seen live"], by: "member:ann", at: T0 }).ok, true);
  const o = await w.runs.open(OPEN({ mode: "investigate", principalPlane: "member:ann/tok-m", principalClaude: "member:ann",
                                     actor: "member:ann", viewer: "member:ann" }));
  assert.equal(o.started, true, JSON.stringify(o));
  const before = w.dump();
  const r = await w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M });
  assert.deepEqual([r.dispatched, r.code, r.mode], [false, "MEMBER_RUN_MODE_NOT_ADMITTED", "investigate"]);
  /* its row, run-rules R32 (C-22.30), read by key (B3) */
  assert.deepEqual([r.check, r.translation], [AI_RUNS_CHECKS.MEMBER_RUN_MODE_NOT_ADMITTED.check, AI_RUNS_CHECKS.MEMBER_RUN_MODE_NOT_ADMITTED.translation]);
  assert.equal(r.check, "C-22.30");
  assert.equal(w.dump(), before);
  assert.equal(aw.calls.length, 0);
});

test("R18 (T46): the wake still withholds a member's own sign-in run as MEMBER_PRINCIPAL_RUN, no call counted; and a dispatch at her act whose call is refused or incomplete appends the wake's one entry saying the run is still resumable, one still running at the bound appends nothing", async () => {
  const aw = agentWorker();
  const { w } = await memberWorld(aw);
  const reqs = { R1: [{ request: "q1", state: "captured" }] };
  w.runs.registerWaitSource("capture-requests", { tickMs: () => 5000, holds: () => [], woken: () => (reqs.R1[0].woken ? [] : ["R1"]),
    completions: () => reqs.R1.filter((q) => !q.woken), markWoken: () => { reqs.R1[0].woken = true; } });
  const woke = await w.runs.wake(Date.parse("2026-07-01T00:00:10Z"));
  assert.deepEqual([woke.wakes[0].resume, woke.dispatched], ["MEMBER_PRINCIPAL_RUN", 0]);
  assert.equal(aw.calls.length, 0);
  for (const answer of [{ status: 403, body: { ok: false, reason: "NO" } }, "throw"]) {
    const x = await memberWorld(agentWorker(answer));
    const r = await x.w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M });
    assert.deepEqual([r.dispatched, r.dispatch.state], [false, answer === "throw" ? "SILENT" : "REFUSED"]);
    const rows = runLog(x.w);
    assert.equal(rows.length, 1);
    assert.match(rows[0].detail, /did not complete .*still resumable/);
  }
  const slow = await memberWorld(agentWorker("hang"));
  const r = await slow.w.runs.dispatchMemberRun({ run: "R1", by: "member:ann", credential: TOKEN_M });
  assert.deepEqual([r.dispatched, r.dispatch.state, runLog(slow.w).length], [true, "RUNNING", 0]);
});
