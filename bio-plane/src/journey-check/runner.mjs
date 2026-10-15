/* journey-check R11 (K3351): the local arm's stand-in for `agent-runner`, run under Miniflare from this file (never
   imported by the plane or agent-worker) and bound as agent-worker's `RUNNER`, the Container Durable Object binding
   (agent-worker R35). It answers `agent-runner`'s contract as that module's requirements state it, so agent-worker,
   agent-model and the plane run unchanged above it:
   - the sign-in (agent-runner R17–R21 as R27 and R31 amend them): `POST /signin` answers an attempt and the sign-in
     address, `POST /signin/code` takes the code the person typed and answers the token it mints, once; `/signin/state`
     and `/signout` as stated. The address is on an Anthropic host, as R17 requires; nothing in the walk opens it;
   - the conversation (R1–R4, R28): a WebSocket at `/conversation`, its first message the conversation request; the
     credential must carry the token this instance minted for that member (R28), else `SIGNIN_NOT_HELD` or
     `SIGNIN_TOKEN_REFUSED`; the fake model (`fake-model.mjs`) then relays tool calls and ends with R4's answer;
   - `GET /version` (R5) and 404 `UNKNOWN` for anything else (R6).
   With `FAKE_MODEL` set to `off` the sign-in still answers and every conversation ends `{ok: false, code:
   "NO_FAKE_MODEL"}`: R11's control, a walk with no fake model bound. Nothing here logs a code, a token or a body. */
import { conversation } from "./fake-model.mjs";

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const CODE_RE = /^[^\u0000-\u001f\u007f]{1,2000}$/;
const memberOk = (m) => typeof m === "string" && m.length > 0 && m.length <= 200;
/* The sign-in address this stand-in states (the same as signin.mjs's `SIGNIN_ADDRESS`; a Worker module exports only its
   handler and class, so it is written here again). */
const SIGNIN_ADDRESS = "https://claude.ai/oauth/authorize?code=true&client_id=journey-check-local-arm";
const refuse = (code, status, detail) => json({ ok: false, code, detail, trace: crypto.randomUUID(), trace_detail: { ms: 0, cold: false, uptime_s: 0 } }, status);

/* Every token a sign-in minted here, by its member (the instances of this class share one isolate in the local arm) */
const MINTED = new Map();
/* A member as the door names it (`member:<id>`) or bare: one member */
const memberKey = (m) => String(m).replace(/^member:/, "");

export class AgentRunner {
  constructor(state, env) { this.state = state; this.env = env; this.waiting = null; }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/version")
      return json({ ok: true, name: "agent-runner", version: this.env.VERSION || "0.0.0", capabilities: ["image"] });
    if (url.pathname === "/conversation" && request.headers.get("upgrade") === "websocket") return this.converse();
    const step = { "/signin": "start", "/signin/code": "code", "/signin/state": "state", "/signout": "signout" }[url.pathname];
    if (request.method !== "POST" || !step) return refuse("UNKNOWN", 404, "no such route");
    let body;
    try { body = await request.json(); } catch { return refuse("BAD_REQUEST", 400, "the request was not JSON"); }
    if (!memberOk(body && body.member)) return refuse("BAD_MEMBER", 400, "no member was named");
    const member = body.member;
    const trace = { trace: crypto.randomUUID(), trace_detail: { ms: 1, cold: false, uptime_s: 1 } };
    if (step === "start") {
      if (this.waiting && this.waiting.member !== member) return refuse("NOT_THIS_MEMBER", 409, "a sign-in is waiting for someone else");
      this.waiting = { member, attempt: crypto.randomUUID() };
      return json({ ok: true, address: SIGNIN_ADDRESS, attempt: this.waiting.attempt, ...trace });
    }
    if (step === "code") {
      if (this.waiting && this.waiting.member !== member) return refuse("NOT_THIS_MEMBER", 409, "a sign-in is waiting for someone else");
      if (!this.waiting) return refuse("NO_SIGNIN_WAITING", 409, "no sign-in is waiting; start again");
      if (body.attempt !== undefined && body.attempt !== this.waiting.attempt) return refuse("ATTEMPT_SUPERSEDED", 409, "a later sign-in replaced this one");
      if (typeof body.code !== "string" || !CODE_RE.test(body.code)) return refuse("BAD_CODE", 400, "the code was not one line");
      const { attempt } = this.waiting;
      this.waiting = null;
      const token = "sk-ant-oat01-journey-" + Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");
      MINTED.set(token, memberKey(member));
      return json({ ok: true, connected: true, member, attempt, token, valid_for: "1 year", ...trace });
    }
    if (step === "state") return json({ ok: true, connected: false, waiting: !!(this.waiting && this.waiting.member === member), member, ...trace });
    if (this.waiting && this.waiting.member === member) this.waiting = null;
    return json({ ok: true, connected: false, member, ...trace });
  }

  converse() {
    const [client, server] = Object.values(new WebSocketPair());
    server.accept();
    const send = (o) => { try { server.send(JSON.stringify(o)); } catch { /* closed */ } };
    let gen = null, turns = 0, max = 1;
    /* one line per conversation when it ends, for the walk's debugging (JOURNEY_DEBUG): the tools offered, the calls made
       and how it ended, by name and code only; never a prompt, a result, an input or the token */
    const calls = [];
    let offered = [];
    const end = (o) => {
      send(o);
      if (this.env.JOURNEY_DEBUG) console.log(JSON.stringify({ event: "journey.runner", offered, calls, ok: o.ok, code: o.code ?? null }));
      try { server.close(1000, "done"); } catch { /* closed */ }
    };
    const advance = (result) => {
      let r;
      try { r = gen.next(result); } catch (e) { return end({ ok: false, code: "FAKE_MODEL_FAILED", detail: String(e && e.message).slice(0, 300) }); }
      if (r.done) return end({ ok: true, result: String(r.value ?? ""), stop_reason: "end_turn", num_turns: turns + 1, usage: usage() });
      if (turns + 1 >= max) return end({ ok: false, code: "MAX_TURNS", detail: "the turn limit was reached" });
      turns += 1;
      calls.push(r.value.name);
      send({ tool_use: { id: `toolu_journey_${turns}`, name: r.value.name, input: r.value.input ?? {} } });
    };
    server.addEventListener("message", async (ev) => {
      let m;
      try { m = JSON.parse(typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data)); } catch { return end({ ok: false, code: "BAD_REQUEST", detail: "not JSON" }); }
      if (!gen) {
        const c = m && m.credential;
        if (!c || c.kind !== "signin" || !memberOk(c.member)) return end({ ok: false, code: "NO_CREDENTIAL", detail: "no sign-in credential" });
        if (typeof c.secret !== "string" || !c.secret) return end({ ok: false, code: "SIGNIN_NOT_HELD", detail: "no token was handed down" });
        /* agent-runner R28: the instance holds nothing; the token arrives with the conversation (credentials holds it).
           Standing in for Anthropic, which accepts only a token it minted for that account, the stand-in accepts only
           a token it minted at that member's sign-in, whichever instance ran it. */
        if (MINTED.get(c.secret) !== memberKey(c.member))
          return end({ ok: false, code: "SIGNIN_TOKEN_REFUSED", detail: "the token is not one this sign-in minted" });
        if (this.env.FAKE_MODEL === "off") return end({ ok: false, code: "NO_FAKE_MODEL", detail: "the local arm's runner has no fake model bound" });
        max = Math.max(1, Number(m.max_turns) || 1);
        offered = (m.tools || []).map((t) => t && t.name);
        gen = conversation({ system: m.system, prompt: m.prompt, tools: m.tools || [], max_turns: max });
        return advance(undefined);
      }
      if (m && m.tool_result) {
        /* JOURNEY_DEBUG=facts: the facts a compose or adjust step is handed, for shaping the fake model; the walk's own
           fixtures, never a token */
        if (this.env.JOURNEY_DEBUG === "facts" && offered.includes("judge_compose") && calls[calls.length - 1] === "read_facts")
          console.log(JSON.stringify({ event: "journey.facts", calls, facts: String(typeof m.tool_result.content === "string"
            ? m.tool_result.content : JSON.stringify(m.tool_result.content)).slice(0, 6000) }));
        return advance(m.tool_result);
      }
      return end({ ok: false, code: "BAD_REQUEST", detail: "expected a tool_result" });
    });
    return new Response(null, { status: 101, webSocket: client });
  }
}
const usage = () => ({ input_tokens: 100, output_tokens: 20, cache_read_input_tokens: 0, cache_creation_input_tokens: 0, total_cost_usd: null });

/* agent-runner R15: the Worker's own handler reaches no instance. */
export default { fetch: () => json({ ok: false, code: "UNKNOWN" }, 404) };
