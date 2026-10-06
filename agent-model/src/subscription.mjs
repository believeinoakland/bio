/* R2, R3, R5, R6, R7 — THE SUBSCRIPTION PROVIDER: a member's Claude subscription runs Claude Code, unmodified, in
 * the `agent-runner` container, reached through the Container Durable Object binding the caller passes as
 * `runner` (K1429, K1502). This file never imports the runner; it speaks the runner's wire (agent-runner R1–R4):
 *
 *   one WebSocket per conversation, opened at `RUNNER_URL` through the binding;
 *   → the conversation request `{credential: {kind, secret}, model, system, prompt, tools, max_turns}`;
 *   ← a relay `{tool_use: {id, name, input}}`, answered → `{tool_result: {id, content, is_error?}}` on the same socket;
 *   ← the end `{ok: true, result, stop_reason, num_turns, usage}` or `{ok: false, code, detail}`.
 *
 * THE RELAY KEEPS THE TABLE'S DECISIONS (R7; M-Q4 GO, relay). The model sees only the tools the conversation
 * names; each call it makes is relayed here and performed by the caller's `onTool`, exactly as on the API-key path,
 * so `agent-worker`'s table decides every call. A relayed name the conversation did not offer is answered as an
 * error and performed by no one.
 *
 * THE TRANSCRIPT. The runner keeps no session (agent-runner R1, R9), so each conversation request carries the
 * transcript rendered as text (`prompt`). What happens over the socket is appended to `messages` in the Messages
 * API's own shape, so one transcript serves either provider.
 *
 * THE METER (D-611). Every message this side sends is a request: the conversation request and each `tool_result`
 * are counted, turn and bytes, before they are sent, and one that would pass a bound is not sent. */
import { usageOf, sumUsage, silent, refused } from "./outcome.mjs";

export const RUNNER_URL = "https://agent-runner/conversation";
const ANSWERED = "received";
const AFTER_ANSWER = "not performed: the answer ended this step";

/** The transcript as the text a fresh Claude Code conversation is given. */
export function renderTranscript(messages) {
  const text = (content) => {
    if (!Array.isArray(content)) return String(content ?? "");
    return content.map((b) => {
      if (!b || typeof b !== "object") return String(b ?? "");
      if (b.type === "text") return String(b.text ?? "");
      if (b.type === "tool_use") return `[called ${b.name} with ${JSON.stringify(b.input ?? {})}]`;
      if (b.type === "tool_result")
        return `[result of ${b.tool_use_id}${b.is_error ? " (error)" : ""}: `
          + `${typeof b.content === "string" ? b.content : JSON.stringify(b.content ?? null)}]`;
      return JSON.stringify(b);
    }).join("\n");
  };
  return (Array.isArray(messages) ? messages : [])
    .map((m) => `${m && m.role === "assistant" ? "ASSISTANT" : "USER"}:\n${text(m && m.content)}`).join("\n\n");
}

const systemText = (system) => (Array.isArray(system)
  ? system.map((b) => String((b && b.text) ?? "")).join("\n\n") : String(system ?? ""));
const plainTools = (tools) => (Array.isArray(tools) ? tools : [])
  .map((t) => ({ name: t.name, description: t.description, input_schema: t.input_schema }));

/** The conversation request; the token is its credential field and appears nowhere else (R2, R8). */
function conversationRequest(token, { model, system, messages, tools, maxTurns }) {
  return { credential: { kind: "subscription", secret: token }, model, system: systemText(system),
           prompt: renderTranscript(messages), tools: plainTools(tools), max_turns: maxTurns };
}

/** One connection to the runner, read as a queue. Answers `{send, next, close}` or an outcome; never throws. */
async function openRunner(runner, token) {
  let res;
  try {
    const stub = typeof runner.fetch === "function" ? runner : runner.get(runner.newUniqueId());
    res = await stub.fetch(RUNNER_URL, { headers: { Upgrade: "websocket" } });
  } catch (e) {
    return silent((e && e.message) || e, token);
  }
  const ws = res && res.webSocket;
  if (!ws) return refused(res ? res.status : null, "RUNNER_REFUSED",
    `the runner answered ${res ? res.status : "nothing"} without a connection`, token);
  const queue = [], waiting = [];
  let ended = null;
  const push = (m) => { if (ended) return; if (m.closed) ended = m; const w = waiting.shift(); if (w) w(m); else queue.push(m); };
  try {
    ws.accept();
    ws.addEventListener("message", (ev) => {
      let m;
      try { m = JSON.parse(typeof ev.data === "string" ? ev.data : new TextDecoder().decode(ev.data)); } catch { m = null; }
      push(m && typeof m === "object" ? m : { closed: true, detail: "the runner sent a message that is not JSON" });
    });
    ws.addEventListener("close", (ev) => push({ closed: true, detail: `the runner closed the connection (${ev && ev.code})` }));
    ws.addEventListener("error", () => push({ closed: true, detail: "the runner's connection failed" }));
  } catch (e) {
    return silent((e && e.message) || e, token);
  }
  return {
    send(text) { try { ws.send(text); return true; } catch { push({ closed: true, detail: "the runner's connection failed on send" }); return false; } },
    next() { if (queue.length) return Promise.resolve(queue.shift()); if (ended) return Promise.resolve(ended); return new Promise((r) => waiting.push(r)); },
    close() { try { ws.close(1000, "done"); } catch { /* already closed */ } },
  };
}

/** The end of a conversation that gave no answer, as an outcome (R3) or `exhausted` (R6). */
function ending(m, usage, token) {
  if (m.ok === false)
    return m.code === "MAX_TURNS" ? { exhausted: true, usage } : { ...refused(null, m.code ?? null, m.detail ?? "", token), usage };
  if (m.stop_reason === "refusal") return { ...refused(200, "refusal", m.result ?? "", token), usage };
  return null;
}

/** modelCall's subscription arm: ONE TURN. The conversation is offered one turn; the first relayed call is that
 *  turn's answer, returned as a Messages-shaped `tool_use` block, and the connection is closed (which aborts the
 *  query, agent-runner R4), so no tool is performed here and no usage was stated for it. */
export async function subscriptionTurn(token, runner, body) {
  const serialized = JSON.stringify(conversationRequest(token, {
    model: body.model, system: body.system, messages: body.messages, tools: body.tools, maxTurns: 1 }));
  const conn = await openRunner(runner, token);
  if (!conn.send) return conn;
  conn.send(serialized);
  const m = await conn.next();
  conn.close();
  if (m.closed) return { ...silent(m.detail, token), usage: usageOf(null) };
  if (m.tool_use) {
    const u = m.tool_use;
    return { result: { content: [{ type: "tool_use", id: u.id, name: u.name, input: u.input ?? {} }], stop_reason: "tool_use" },
             usage: usageOf(null) };
  }
  const usage = usageOf(m.usage);
  const end = ending(m, usage, token);
  if (end) return end.exhausted ? { ...refused(null, "MAX_TURNS", "the turn ended on the runner's turn limit", token), usage } : end;
  return { result: { content: [{ type: "text", text: String(m.result ?? "") }], stop_reason: m.stop_reason ?? null }, usage };
}

/** converse's subscription arm (R6, R7). `charge(serialized)` is the meter: it answers `{stopped}` when the
 *  message may not be sent, else counts it and answers null. */
export async function subscriptionConverse({ token, runner, model, system, messages, tools, finalTool, onTool,
                                             maxTurns, charge }) {
  const offered = new Set(plainTools(tools).map((t) => t.name));
  let usage = null;
  let k = 0;
  const unstated = () => sumUsage(usage, usageOf(null));
  while (k < maxTurns) {
    const serialized = JSON.stringify(conversationRequest(token, { model, system, messages, tools, maxTurns: maxTurns - k }));
    const stop = charge(serialized);
    if (stop) return { ...stop, usage };
    k += 1;
    const conn = await openRunner(runner, token);
    if (!conn.send) return { ...conn, usage: conn.silent ? usage : unstated() };
    conn.send(serialized);
    let answer = null;
    for (;;) {
      const m = await conn.next();
      if (m.closed) {
        /* The end never came, so this conversation's usage is unknown: its figures are null, never 0. */
        if (answer) return { answer, usage: unstated() };
        return { ...silent(m.detail, token), usage: unstated() };
      }
      if (m.tool_use) {
        const u = m.tool_use;
        const input = u.input && typeof u.input === "object" ? u.input : {};
        messages.push({ role: "assistant", content: [{ type: "tool_use", id: u.id, name: u.name, input }] });
        let content, isError = false;
        if (answer) { content = AFTER_ANSWER; isError = true; }
        else if (u.name === finalTool) { answer = input; content = ANSWERED; }
        else if (!offered.has(u.name)) { content = `'${String(u.name)}' is not a tool of this conversation`; isError = true; }
        else {
          const r = await onTool(u.name, input);
          if (r && r.halt) { conn.close(); return r.halt; }
          content = JSON.stringify(r?.content ?? null);
          isError = !!r?.error;
        }
        messages.push({ role: "user", content: [{ type: "tool_result", tool_use_id: u.id, content,
                                                   ...(isError ? { is_error: true } : {}) }] });
        const out = JSON.stringify({ tool_result: { id: u.id, content, ...(isError ? { is_error: true } : {}) } });
        const halt = k >= maxTurns ? { exhausted: true } : charge(out);
        if (halt) {
          conn.close();
          return answer ? { answer, usage: unstated() } : { ...halt, usage: unstated() };
        }
        k += 1;
        conn.send(out);
        continue;
      }
      conn.close();
      usage = sumUsage(usage, usageOf(m.usage));
      if (answer) return { answer, usage };
      const end = ending(m, usage, token);
      if (end) return end;
      /* The model ended without answering: say what it said, ask again, in a fresh conversation. */
      messages.push({ role: "assistant", content: [{ type: "text", text: String(m.result || "(no answer)") }] });
      messages.push({ role: "user", content: `Answer by calling the \`${finalTool}\` tool.` });
      break;
    }
  }
  return { exhausted: true, usage };
}
