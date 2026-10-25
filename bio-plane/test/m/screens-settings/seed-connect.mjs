/* The world `connect` and the AI account panel are tested in (K4990, K5054): the team's real store (`storeWorld`), the states
   the old tables scripted made by the real acts that make them, and the platform's one external party, the team's agent-worker
   (`env.AGENT_WORKER`: the runner that answers a member's sign-in and the model that answers an ask), a double.
   Nothing here answers another module's op: `reauth`, `disclosureshown`, `accountreferenceset`, `groupkeyset`, `groupkeyswitch`,
   `ailimitset`, `aikeepaway` and `subscriptionsignin` are the owners' own acts, made through the door as a member or the founder. */
import { storeWorld } from "./kit.mjs";

/** The binding that unseals a held account (`env.ACCOUNT_SEAL_SECRET`; the platform's secret, a value of any length). */
export const SEAL = "a-long-seal-secret-for-the-settings-test-only";
/** A runner's answers to a sign-in, as agent-worker's `/signin` gives them (agent-worker R84): the address Anthropic's page is at, and a held token. */
export const SIGNIN_ADDRESS = "https://claude.ai/oauth/authorize?x=1";
export const SIGNIN_TOKEN = "sk-ant-oat01-" + "t".repeat(40);
/** What one model call costs: a counted ask's usage as agent-worker reports it to `askusage` (ai-use R1). */
export const CALL = Object.freeze({ usage: { input_tokens: 1000, output_tokens: 200, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, total_cost_usd: 0.8 }, calls: 1 });

const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/** The team's agent-worker as the platform gives it (`env.AGENT_WORKER`), driven from outside: what it answers to a sign-in step and to an ask is
 *  `signin(step, payload)` and `ask(payload)`, which a test replaces; `sent` lists what reached it. `/version` says its runner is bound
 *  (`runner: true`, instance-setup R17), as an installed runner does. An ask it answers makes the call it reports to the store's `askusage`
 *  (the model's own count, for the member the ask's account names), as the real agent-worker does under the ask's grant. */
export function agentWorker(opts = {}) {
  const runner = "runner" in opts ? opts.runner : true, version = opts.version || {};
  const aw = {
    world: null,
    sent: [],
    runner,
    version,
    usage: CALL,
    signin: (step) => (step === "start" ? { ok: true, address: SIGNIN_ADDRESS }
      : step === "code" ? { ok: true, connected: true, token: SIGNIN_TOKEN, valid_for: "1 year" } : { ok: true }),
    ask: () => ({ event: "answer", ok: true }),
    /** The model's count of one call it made for `member`, to the store's `askusage` route (ai-use R1), the route the door's draft path posts to too. */
    count: (member) => aw.world.store.dispatch(new Request(`http://do/askusage?viewer=${encodeURIComponent(member)}`, { method: "POST",
      headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: "ask", ...aw.usage }) })),
    async fetch(url, init) {
      const path = new URL(url).pathname;
      if (path === "/version") return reply({ name: "agent-worker", version: "a-1", ...(aw.runner === undefined ? {} : { runner: aw.runner }), ...aw.version });
      const body = JSON.parse(init.body);
      aw.sent.push({ path, body });
      if (path === "/signin") {
        const out = await aw.signin(body.step, body);
        if (out instanceof Error) throw out;
        return reply(out, out.ok === false ? out.status || 409 : 200);
      }
      if (path === "/ask") {
        const out = aw.ask(body);
        if (out.event === "answer" && out.ok === true && aw.usage) await aw.count(body.account.member);
        return new Response(JSON.stringify(out) + "\n", { status: 200, headers: { "content-type": "application/x-ndjson" } });
      }
      return reply({ ok: false, reason: "BAD_REQUEST" }, 400);
    },
  };
  return aw;
}

/** A team: the founder (its one active administrator) and `dev` (a member), over a world whose platform holds the seal, the agent-worker
 *  (`worker: false` binds none) and, when `testInstance`, the test-instance mark that lets an ask reach the model (ai-runs R29, R40) and keeps the sign-in door's trace (signin-door R5). */
export async function team({ worker = agentWorker(), testInstance = false, env = {} } = {}) {
  const w = await storeWorld({ env: { ACCOUNT_SEAL_SECRET: SEAL, ...(testInstance ? { CIVICSMITH_TEST_INSTANCE: "test", INSTANCE_NAME: "test" } : {}),
    ...(worker ? { AGENT_WORKER: worker } : {}), ...env } });
  if (worker) worker.world = w;
  const founder = await w.signIn("founder");
  const dev = await w.signIn("dev", { capabilities: ["contribute"] });
  return { w, founder, dev, worker };
}

/** The act that asks the password again (credentials R64): connecting an account and setting the team's key ask it. */
export const reauth = (as) => as.act("reauth", { body: { password: as.password } });

/** `as` reads the disclosure of what connecting means (instance-setup R54), as the page's "I have read it" does. */
export async function disclose(as) {
  const who = as.member === "admin" ? "admin" : "member:" + as.member;
  const d = await as.read("disclosureof", { query: { member: who } });
  return as.act("disclosureshown", { body: { member: who, version: d.version } });
}

/** The team's key serves its members: the founder sets it and switches it on (ai-accounts R5, R6), `limits` set on the group (ailimitset). */
export async function teamKey(t, limits = []) {
  await reauth(t.founder);
  await t.founder.act("groupkeyset", { body: { key: "sk-ant-api03-TEAM-KEY-0123456789abcdef" } });
  await t.founder.act("groupkeyswitch", { body: { on: true } });
  for (const l of limits) await t.founder.act("ailimitset", { body: { owner: "group", ...l } });
}

/** `as` connects an API key of their own (ai-accounts R1, R2): the disclosure first, then the password again, then the key. The account is named
 *  in the body, as ai-accounts' route reads it (see the report: the page's act names none). */
export async function ownKey(as, secret = "sk-ant-api03-OWN-KEY-0123456789abcdef") {
  await disclose(as);
  await reauth(as);
  return as.act("accountreferenceset", { body: { member: "member:" + as.member, kind: "apikey", secret } });
}

/** `as` signs in with their Claude subscription through the runner, the real `subscriptionsignin` (signin-door R1, R4): the code is exchanged and the
 *  token held. */
export async function signedIn(as) {
  await disclose(as);
  await reauth(as);
  await as.act("subscriptionsignin", { body: { step: "start" } });
  return as.act("subscriptionsignin", { body: { step: "code", code: "THE-CODE-FROM-ANTHROPIC" } });
}

/** A conversation the model answered, counted to the account that served `as` (the ask's account), `n` times: the real ask through the door. */
export async function ask(t, as, n = 1) {
  for (let i = 0; i < n; i++) {
    const r = await t.w.door({ url: "/api/?op=ask", init: { method: "POST", headers: { authorization: "Bearer " + as.token, "content-type": "application/json" },
      body: JSON.stringify({ question: "Who holds the clerk's office?", conversation: [] }) } }, as);
    if (r.status !== 200) throw new Error("the ask was refused: " + JSON.stringify(r.json || r.type));
  }
}

/** The model's count of `n` calls it made for `as`, with no ask before them: for a member who has not yet read the team key's notice, whom no ask
 *  reaches the model for (ai-accounts R8), the use being counted all the same to the account `usageOwner` names. */
export async function counted(t, as, n = 1) {
  for (let i = 0; i < n; i++) {
    const r = await t.worker.count("member:" + as.member);
    if (r.status !== 200) throw new Error("the count was refused: " + (await r.text()));
  }
}

/** Faults a test lays on a read a world cannot make fail (a read that answers nothing). */
export const SILENT = Object.freeze({ aikeepawaystate: "none", assistantstate: "none" });

/** A team whose member has read what connecting means and given the password again: ready to sign in, or to set a key, from the page. */
export async function connecting(opts) {
  const t = await team(opts);
  await disclose(t.dev);
  await reauth(t.dev);
  return t;
}

/** The reference the sign-in door put on its last answer (signin-door R3), read from the trace a test instance keeps (R5), by an administrator. */
export async function lastTrace(t) {
  const lines = (await t.founder.read("signintrace")).lines;
  return lines[lines.length - 1].trace;
}

/** The one thing a world cannot give: what a member has used of a limit that binds them. `ai-use` R4's `aiUsageMine` answers each limit's `scope`, `unit`,
 *  `period`, `amount` and `reached` and no `used`, which the screen reads (screens-settings R37, R49, R50). This is `as`'s own real answer
 *  to `aiusage`, with `used` added to each limit of the payers, as the screen's table of reads (`table`) answers it; the read of an owner
 *  (`aiusage` with `owner`) is the world's real answer unchanged. Reported to the lead as a world gap. */
export const withUsed = (t, as, used) => async (q) => {
  const answered = await t.w.door({ url: "/api/?" + new URLSearchParams({ op: "aiusage", ...q }) }, as);
  const r = answered.json && answered.json.result;
  return q.owner || !r || !r.payers ? answered.json
    : { ...answered.json, result: { ...r, payers: r.payers.map((p) => ({ ...p, limits: p.limits.map((l) => ({ ...l, used })) })) } };
};

/** A fault at the page's edge: the sign-in door's answer to `steps` never comes (`"pending"`); its other steps (the state read) are the world's own
 *  answers. A runner that never answers cannot be a double, for the page's harness waits for the door while it works. */
export const unanswered = (t, as, ...steps) => async (q, b) => (steps.includes(b.step) ? "pending"
  : (await t.w.door({ url: "/api/?op=subscriptionsignin", init: { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) } }, as)).json);
