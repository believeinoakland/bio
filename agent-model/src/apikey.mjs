/* R2, R3, R4, R5 — THE API-KEY PROVIDER: one turn to the Messages API, the member's own key in one header.
 *
 * This member depends on nothing from npm, so the call is the raw Messages API by `fetch`. The key arrives with
 * the call and goes into `x-api-key` and nowhere else (R8): not the body, not an outcome, not a log line.
 *
 * CACHING (R4; ladders §9.4 Q0). Every request marks its stable prefix cacheable, so a request that repeats it is
 * billed as a cache read: one breakpoint after the tool definitions, one after the system prompt (the skill pack's
 * resident layer sits inside it), and one on the transcript's last message, so a conversation's later turns read
 * its earlier ones from the cache too. Four breakpoints are the API's limit; this uses three. Only uncached input
 * counts toward the input-tokens-per-minute limit (assistant-substrate §4), so the marks also stretch the rate. */
import { usageOf, silent, refused } from "./outcome.mjs";

export const MODEL_ENDPOINT = "https://api.anthropic.com/v1/messages";
export const MODEL_API_VERSION = "2023-06-01";
const EPHEMERAL = Object.freeze({ type: "ephemeral" });

const marked = (block) => ({ ...block, cache_control: EPHEMERAL });

/** The system prompt as blocks, its last block marked. */
function cachedSystem(system) {
  if (system == null || system === "") return undefined;
  const blocks = Array.isArray(system) ? system.map((b) => ({ ...b })) : [{ type: "text", text: String(system) }];
  if (blocks.length) blocks[blocks.length - 1] = marked(blocks[blocks.length - 1]);
  return blocks;
}

/** The transcript with its last message's last block marked; the caller's array is never touched. */
function cachedMessages(messages) {
  const list = Array.isArray(messages) ? messages.slice() : [];
  const i = list.length - 1;
  if (i < 0) return list;
  const m = list[i];
  const blocks = Array.isArray(m.content) ? m.content.map((b) => ({ ...b })) : [{ type: "text", text: String(m.content ?? "") }];
  if (blocks.length) blocks[blocks.length - 1] = marked(blocks[blocks.length - 1]);
  list[i] = { ...m, content: blocks };
  return list;
}

/** R4 — a Messages API body with its prefix marked cacheable. Pure: the body passed in is not changed. */
export function withCache(body) {
  const out = { ...body };
  const system = cachedSystem(body.system);
  if (system) out.system = system; else delete out.system;
  if (Array.isArray(body.tools) && body.tools.length) {
    out.tools = body.tools.map((t) => ({ ...t }));
    out.tools[out.tools.length - 1] = marked(out.tools[out.tools.length - 1]);
  }
  out.messages = cachedMessages(body.messages);
  return out;
}

/** ONE TURN, already serialized (the caller counted its bytes, D-611). Never throws (R3). */
export async function apikeyTurn(key, serialized) {
  let res;
  try {
    res = await fetch(MODEL_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": MODEL_API_VERSION },
      body: serialized,
    });
  } catch (e) {
    return silent((e && e.message) || e, key);
  }
  let body = null;
  try { body = await res.json(); } catch { body = null; }
  if (body == null || typeof body !== "object")
    return { ...silent(`the model API answered ${res.status} with a body that is not JSON`, key), usage: usageOf(null) };
  const usage = usageOf(body.usage);
  /* A 429 (a rate limit, or `enforced_spend_limit_reached`) is a plain refusal like any other status: the run's
     ceiling and the member's own account decide what happens next, never a retry here. */
  if (res.status !== 200)
    return { ...refused(res.status, body?.error?.type ?? null, body?.error?.message ?? "", key), usage };
  if (body.stop_reason === "refusal")
    return { ...refused(200, "refusal", body?.stop_details?.explanation ?? "", key), usage };
  return { result: body, usage };
}
