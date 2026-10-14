/* journey-check R11 (K3351): the local arm's stand-in for agent-runner, run under Miniflare as the local arm runs it
   (bound by its class, from its file), driven at the interface agent-worker reaches it by: the sign-in steps of
   agent-runner R17–R21 as R27 and R31 amend them, and a conversation over its WebSocket (R1–R4, R28) with the fake model
   relaying a tool call and answering by the tool its prompt names. Control: with no fake model bound, a conversation on
   a held token ends NO_FAKE_MODEL. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Miniflare } from "miniflare";
import { RUNNER_ENTRY } from "../../../src/journey-check/local.mjs";
import { conversation, answerTool, fill, gather } from "../../../src/journey-check/fake-model.mjs";

const worlds = [];
after(async () => { for (const w of worlds) await w.dispose().catch(() => {}); });

/* agent-worker's view of the binding: a namespace whose instance is named by the member (agent-worker R66) */
async function runnerOf({ model = true } = {}) {
  const mf = new Miniflare({ workers: [{ name: "agent-runner", scriptPath: RUNNER_ENTRY, script: readFileSync(RUNNER_ENTRY, "utf8"),
    compatibilityDate: "2026-07-01", modules: true, modulesRoot: "/", modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
    bindings: { FAKE_MODEL: model ? "on" : "off", VERSION: "0.84.0" }, durableObjects: { RUNNER: { className: "AgentRunner" } } }] });
  worlds.push(mf);
  const ns = await mf.getDurableObjectNamespace("RUNNER", "agent-runner");
  return (member) => ns.get(ns.idFromName(member));
}
const post = async (stub, path, body) => { const r = await stub.fetch(`https://agent-runner${path}`, { method: "POST", body: JSON.stringify(body) }); return { status: r.status, body: await r.json() }; };

/* one conversation: sends `request`, answers each relayed call with `answer(call)`, and answers what came back */
async function converse(stub, request, answer = () => "{}") {
  const res = await stub.fetch("https://agent-runner/conversation", { headers: { Upgrade: "websocket" } });
  const ws = res.webSocket;
  ws.accept();
  const seen = [];
  return new Promise((done) => {
    ws.addEventListener("message", (ev) => {
      const m = JSON.parse(ev.data);
      seen.push(m);
      if (m.tool_use) ws.send(JSON.stringify({ tool_result: { id: m.tool_use.id, content: answer(m.tool_use) } }));
      else done(seen);
    });
    ws.send(JSON.stringify(request));
  });
}

test("R11: the runner stand-in answers the sign-in as agent-runner's contract states: start (an Anthropic address and an attempt), code (the token, once), state and sign-out; refusals by code", async () => {
  const runner = await runnerOf();
  const s = runner("member:ana");
  const start = await post(s, "/signin", { member: "member:ana" });
  assert.equal(start.status, 200);
  assert.equal(new URL(start.body.address).host, "claude.ai");
  assert.match(start.body.attempt, /^[0-9a-f-]{36}$/);
  assert.deepEqual((await post(s, "/signin/state", { member: "member:ana" })).body.waiting, true);
  assert.equal((await post(s, "/signin/code", { member: "member:ana", code: "x", attempt: "another" })).body.code, "ATTEMPT_SUPERSEDED");
  assert.equal((await post(s, "/signin/code", { member: "member:ana", code: "two\nlines", attempt: start.body.attempt })).body.code, "BAD_CODE");
  assert.equal((await post(s, "/signin/code", { member: "member:bo", code: "x" })).body.code, "NOT_THIS_MEMBER");
  const code = await post(s, "/signin/code", { member: "member:ana", code: "journey-code#state", attempt: start.body.attempt });
  assert.equal(code.status, 200);
  assert.equal(code.body.connected, true);
  assert.match(code.body.token, /^[A-Za-z0-9._-]{20,2000}$/);
  /* the token is answered once: no later answer carries it */
  for (const later of [await post(s, "/signin/state", { member: "member:ana" }), await post(s, "/signout", { member: "member:ana" }),
    await post(s, "/signin/code", { member: "member:ana", code: "again" })])
    assert.equal(JSON.stringify(later.body).includes(code.body.token), false);
  assert.equal((await post(s, "/signin/code", { member: "member:ana", code: "again" })).body.code, "NO_SIGNIN_WAITING");
  assert.equal((await post(s, "/signin", { member: "" })).body.code, "BAD_MEMBER");
  const v = await (await s.fetch("https://agent-runner/version")).json();
  assert.deepEqual([v.name, v.version, v.capabilities], ["agent-runner", "0.84.0", ["image"]]);
  assert.equal((await s.fetch("https://agent-runner/elsewhere")).status, 404);
});

const TOOLS = [
  { name: "read_facts", description: "the facts", input_schema: { type: "object", properties: {} } },
  { name: "judge_plan", description: "plan", input_schema: { type: "object", properties: {
    targets: { type: "array", items: { type: "object", properties: { level: { type: "string", enum: ["document", "meaning"] } } } },
    observed: { type: "string", enum: ["absent", "present"] } } } },
  { name: "judge_compose", description: "compose", input_schema: { type: "object", properties: { candidates: { type: "array" } } } },
];
async function signedIn(runner, member) {
  const s = runner(member);
  const { body } = await post(s, "/signin", { member });
  return { s, token: (await post(s, "/signin/code", { member, code: "c", attempt: body.attempt })).body.token };
}

test("R11: a conversation runs only on the token the sign-in minted for that member (SIGNIN_NOT_HELD, SIGNIN_TOKEN_REFUSED); on it, the fake model reads its facts and answers by the tool its prompt names, ending as R4 states", async () => {
  const runner = await runnerOf();
  const { s, token } = await signedIn(runner, "member:ana");
  const req = (secret) => ({ credential: { kind: "signin", member: "member:ana", ...(secret === undefined ? {} : { secret }) }, model: "m",
    system: "s", prompt: "STEP plan: … Answer by calling judge_plan.", tools: TOOLS, max_turns: 6 });
  assert.equal((await converse(s, req()))[0].code, "SIGNIN_NOT_HELD");
  assert.equal((await converse(s, req("sk-ant-oat01-not-this-one")))[0].code, "SIGNIN_TOKEN_REFUSED");
  assert.equal((await converse(runner("member:bo"), { ...req(token), credential: { kind: "signin", member: "member:bo", secret: token } }))[0].code, "SIGNIN_TOKEN_REFUSED");
  assert.equal((await converse(s, { ...req(token), credential: { kind: "apikey", secret: "k" } }))[0].code, "NO_CREDENTIAL");
  const seen = await converse(s, req(token), (u) => (u.name === "read_facts" ? JSON.stringify({ target: "INQ-2026-0001-x" }) : "received"));
  assert.deepEqual(seen.map((m) => (m.tool_use ? m.tool_use.name : m.ok)), ["read_facts", "judge_plan", true]);
  assert.deepEqual(seen[1].tool_use.input, { observed: "present" });
  const end = seen.at(-1);
  assert.deepEqual(Object.keys(end).sort(), ["num_turns", "ok", "result", "stop_reason", "usage"]);
  assert.equal(end.num_turns, 3);
});

test("R11 control: with no fake model bound, the sign-in still answers and a conversation on the held token ends NO_FAKE_MODEL", async () => {
  const runner = await runnerOf({ model: false });
  const { s, token } = await signedIn(runner, "member:ana");
  assert.ok(token);
  const seen = await converse(s, { credential: { kind: "signin", member: "member:ana", secret: token }, prompt: "Answer by calling judge_plan.", tools: TOOLS, max_turns: 4 });
  assert.deepEqual(seen.map((m) => m.code), ["NO_FAKE_MODEL"]);
});

test("R11: the fake model answers by the tool the conversation names, else the one answer tool it offers; it fills the tool's schema from what it read", () => {
  assert.equal(answerTool({ prompt: "… Answer by calling judge_compose.", tools: TOOLS }), "judge_compose");
  assert.equal(answerTool({ prompt: "Search, then report.", system: "Search with the meaningrows tool, then call report once.",
    tools: [{ name: "meaningrows" }, { name: "report" }] }), "report");
  assert.equal(answerTool({ prompt: "Ask.", tools: [{ name: "search" }, { name: "answer" }] }), "answer");
  const read = gather([{ citations: [{ address: "https://www.lakeshore-city.example/housing/notices/2026-118" }],
    text: "The landlord must repair the roof of 14 Lakeshore Row within 28 days of this notice." }]);
  const v = fill({ type: "object", required: ["state", "summary"], properties: { state: { type: "string", enum: ["absent", "found"] },
    summary: { type: "string", maxLength: 60 }, citations: { type: "array", items: { type: "object", properties: { address: { type: "string" } } } } } }, read);
  assert.equal(v.state, "found");
  assert.ok(v.summary.length <= 60);
  assert.deepEqual(v.citations, [{ address: "https://www.lakeshore-city.example/housing/notices/2026-118" }]);
  /* control: with nothing read, it cites nothing and says so */
  const none = fill({ type: "object", properties: { citations: { type: "array" }, summary: { type: "string" } } }, gather([]));
  assert.deepEqual(Object.keys(none), ["summary"]);
  /* a conversation whose turns run out answers with what it has: the answer is its last call */
  const g = conversation({ prompt: "Answer by calling judge_plan.", tools: TOOLS, max_turns: 2 });
  assert.equal(g.next().value.name, "judge_plan");
});
