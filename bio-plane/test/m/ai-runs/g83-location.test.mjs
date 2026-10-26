/* ai-runs R18, R28 (G83; K4746, K4747; fix round 7): a woken run looks the instance's credential up at the `bio` room from the
   `scratch` object (`#credentialLook`), and the room's id is compared with the object's own (`#ownNamespace`). The team's room
   is named with its generation and passed a location hint, as `runtime-limits` R28 states, so both calls take the helper's
   names. A recording `env.STORE` answers every `idFromName` and `get`, so the arguments are read, not the behaviour. */
import test from "node:test";
import assert from "node:assert/strict";
import { world, OPEN, INQ, ORG, sha, agentWorker } from "./world.mjs";

const TOKEN = "instance-ai-secret-value-g83";
const WAKE_AT = Date.parse("2026-07-01T00:00:10Z");

/** A store that records each `idFromName` and each `get` with the arguments it was given, and answers a credential look with no row. */
function recordingStore(log) {
  return {
    idFromName: (name) => { log.push(["idFromName", name]); return `id:${name}`; },
    get: (id, ...options) => {
      log.push(["get", id, options]);
      return { fetch: async () => new Response(JSON.stringify({ ok: true, result: { found: false } })) };
    },
  };
}

/** A capture-requests wait source with one completed request for run R1, so the wake reaches the resumer. */
function waitSource() {
  const reqs = { R1: [{ request: "q1", state: "captured" }] };
  return {
    tickMs: () => 5000,
    configured: () => true,
    holds: () => [],
    woken: () => Object.keys(reqs).filter((run) => reqs[run].some((q) => q.state !== "pending" && !q.woken)),
    completions: (run) => (reqs[run] || []).filter((q) => q.state !== "pending" && !q.woken).map((q) => ({ request: q.request, state: q.state })),
    markWoken: (ids, iso) => { for (const rs of Object.values(reqs)) for (const q of rs) if (ids.includes(q.request)) q.woken = iso; },
  };
}

/** A woken run over the room `room` (the name the scratch object has, `scratch` or its generation's name), with the env given. */
async function wokenRun(env, room) {
  const w = world({ env });
  await w.group("ann");
  w.bundle(INQ);
  const minted = w.credentials.aiCredentialMint({ who: "admin", tokenId: "tok-org", secretSha: sha(TOKEN), principalKind: "organisation",
    taskScope: "investigative", writes: ["airuntick"], note: "the instance's key" });
  assert.equal(minted.ok, true, JSON.stringify(minted));
  w.ctx.id = { equals: (x) => x === `id:${room}` };
  await w.runs.open(OPEN({ principalPlane: ORG }));
  w.runs.registerWaitSource("capture-requests", waitSource());
  return (await w.runs.wake(WAKE_AT)).wakes[0];
}

const gets = (log) => log.filter(([kind]) => kind === "get");

test("G83 (K4746, K4747; R18, R28): with STORE_LOCATION the credential look at the bio room passes its location hint; with an allowed value only", async () => {
  const agent = agentWorker();
  const log = [];
  const env = { AGENT_WORKER: agent, INSTANCE_AI_TOKEN: TOKEN, STORE: recordingStore(log), STORE_LOCATION: "wnam" };
  const decision = await wokenRun(env, "scratch");
  assert.equal(decision.resume, "INSTANCE_AI_CREDENTIAL_NOT_ON_RECORD", "the look-up reached the room and found no row");
  assert.deepEqual(gets(log), [["get", "id:bio", [{ locationHint: "wnam" }]]], "one look-up, at bio, with the hint");
  assert.equal(agent.calls.length, 0, "no withheld run reached the binding");

  /* control: a value the allow-list does not name is no hint, and the call is as it was before */
  for (const bogus of ["bogus", "WNAM", " wnam", ""]) {
    const bad = [];
    await wokenRun({ ...env, STORE: recordingStore(bad), STORE_LOCATION: bogus }, "scratch");
    assert.deepEqual(gets(bad), [["get", "id:bio", []]], `${JSON.stringify(bogus)} passes no hint`);
  }
});

test("G83 (K4746, K4747; R18, R28): with STORE_GENERATION the room is named bio~g2 and the object is still recognised as scratch", async () => {
  const log = [];
  const env = { AGENT_WORKER: agentWorker(), INSTANCE_AI_TOKEN: TOKEN, STORE: recordingStore(log), STORE_GENERATION: "2" };
  const decision = await wokenRun(env, "scratch~g2");
  assert.notEqual(decision.resume, "NAMESPACE_UNDETERMINED", "the object's id is the generation's id, so its namespace is known");
  assert.equal(decision.resume, "INSTANCE_AI_CREDENTIAL_NOT_ON_RECORD");
  assert.deepEqual(gets(log), [["get", "id:bio~g2", []]], "the look-up is at the generation's room, with no hint when none is set");
  assert.ok(log.some((entry) => entry[0] === "idFromName" && entry[1] === "bio~g2"), "the room is named bio~g2");
});

test("G83 (K4746, K4747; R18, R28): with neither binding the calls are exactly as before: the bio room by its plain name, one argument to get", async () => {
  const log = [];
  const env = { AGENT_WORKER: agentWorker(), INSTANCE_AI_TOKEN: TOKEN, STORE: recordingStore(log) };
  const decision = await wokenRun(env, "scratch");
  assert.equal(decision.resume, "INSTANCE_AI_CREDENTIAL_NOT_ON_RECORD");
  assert.deepEqual(gets(log), [["get", "id:bio", []]]);
});
