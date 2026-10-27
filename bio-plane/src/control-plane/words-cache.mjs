/* control-plane R116, R127 (fix round 2, C15; fix round 8, G114; K4317, K4811 (7), K4814 (1), K4817): THE INTERFACE WORDS ARE KEPT PER BROWSER, RELEASE, LANGUAGE AND
   ADOPTIONS, AND SENT COMPRESSED. `op=interfacewords` answers the words of a language (translations R19), and the shell asks for them at every load. The key the
   browser holds them under is the address: `v` is `<release>~<language>~<words_version>`, the release this Worker serves (`env.VERSION`, R1), the language the
   owner's answer is in and the stamp of the team's adoptions the owner states beside it (translations R20), so a change of release, of language or of an
   adoption is a new address and no stale words are served for a year. A request whose `v` is exactly that is answered with a cache lifetime of a year,
   `immutable`, a validator (`etag`) that answers an ask anyway as unchanged, and a `vary` that names `Accept-Encoding` alone: the bearer token is no part of the
   key, so a second sign-in in the same browser is served from its cache. Any other `v`, or none, is answered `private, no-cache`. The body is gzip-compressed
   for a caller that accepts it. `private`, because the words are read under a session: nothing here changes who may read them or the gates of R66, which have all
   run before the answer is made. An answer that is not the words (a refusal) is left exactly as it came.
   The answer is read for its key, never parsed whole: the owner states its fields near the head of the answer, so a bounded prefix names them, and the rest of the
   body goes on to the caller unread (compressed on the way). Only an answer whose head does not state them is read whole, as it always was. */

/* a year, the longest a cache is asked to keep anything */
export const WORDS_MAX_AGE = 31536000;
/* the head of the answer read for the key; the words come after the fields that name them */
const PEEK_BYTES = 8 * 1024;
const PART = /^[^~\s]{1,64}$/;

const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

/* `If-None-Match` names the validator (weak comparison, RFC 9110 §13.1.2), or `*` */
const holds = (header, tag) => typeof header === "string"
  && header.split(",").some((t) => { const x = t.trim(); return x === "*" || x.replace(/^W\//, "") === tag.replace(/^W\//, ""); });

/* the first `limit` bytes of a body and the whole body again, the prefix put back in front of the rest of the stream; `whole` when the body ended within the prefix */
async function peek(body, limit) {
  const reader = body.getReader();
  const chunks = [];
  let n = 0, ended = false;
  while (n < limit) {
    const r = await reader.read();
    if (r.done) { ended = true; break; }
    chunks.push(r.value);
    n += r.value.length;
  }
  const prefix = new Uint8Array(n);
  let at = 0;
  for (const c of chunks) { prefix.set(c, at); at += c.length; }
  const stream = new ReadableStream({
    start(c) { for (const ch of chunks) c.enqueue(ch); if (ended) c.close(); },
    async pull(c) { if (ended) return; const r = await reader.read(); if (r.done) { ended = true; c.close(); } else c.enqueue(r.value); },
    cancel(reason) { return reader.cancel(reason); },
  });
  return { prefix, stream, whole: ended };
}

/* the two fields of the answer's head, the language and the stamp: a JSON string each, or null when the head does not state them */
function fieldsOf(text) {
  const field = (name) => {
    const m = new RegExp(`"${name}"\\s*:\\s*("(?:[^"\\\\]|\\\\.)*"|null)`).exec(text);
    if (!m) return undefined;
    try { return JSON.parse(m[1]); } catch { return undefined; }
  };
  return { language: field("language"), words_version: field("words_version") };
}

/* what the head of a 200 JSON answer says it is: `refusal`, or `words` with the two fields, or null when it cannot say */
function classify(text, whole) {
  if (!/^\s*\{\s*"ok"\s*:\s*true\b/.test(text) || /"ok"\s*:\s*false\b/.test(text)) return null;
  const { language, words_version } = fieldsOf(text);
  if (language === undefined || words_version === undefined) return whole ? { kind: "other" } : null;
  return { kind: "words", language, words_version };
}

/* the answer read whole, as it always was, for an answer whose head does not state its fields */
function parsed(bytes) {
  let answer;
  try { answer = JSON.parse(new TextDecoder().decode(bytes)); } catch { return { kind: "other" }; }
  if (!answer || typeof answer !== "object" || answer.ok !== true || !answer.result || typeof answer.result !== "object" || answer.result.ok === false) return { kind: "other" };
  return { kind: "words", language: answer.result.language, words_version: answer.result.words_version };
}

/** The answer of `op=interfacewords`, `res`, as the door sends it: `{res, table}`, `table` true when the answer is the words (so the door's tallies, which look
 *  for a refusal, have nothing to read in it). `req`, `env`: the request and the Worker environment. */
export async function interfaceWordsCache(res, req, env) {
  if (!res || req.method !== "GET" || res.status !== 200 || !res.body || !/application\/json/i.test(res.headers.get("content-type") || "")) return { res, table: false };
  const { prefix, stream, whole } = await peek(res.body, PEEK_BYTES);
  let seen = classify(new TextDecoder().decode(prefix), whole);
  let body = stream;
  if (seen === null) {
    /* the head does not say: read the answer whole and judge it, as before; the bytes go on to the caller unchanged */
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    seen = parsed(bytes);
    body = new Response(bytes).body;
  }
  if (seen.kind !== "words") return { res: new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers }), table: false };
  const version = env && typeof env.VERSION === "string" ? env.VERSION : "";
  /* R127 (K4853): a viewer with no language (`null`) is the EMPTY part of the key, `<release>~~<words_version>`, as the shell names it */
  const stated = (seen.language === null || (typeof seen.language === "string" && PART.test(seen.language))) && typeof seen.words_version === "string" && PART.test(seen.words_version);
  const key = version && !version.includes("~") && stated ? `${version}~${seen.language ?? ""}~${seen.words_version}` : null;
  const kept = key !== null && new URL(req.url).searchParams.get("v") === key;
  const headers = new Headers(res.headers);
  const acceptsGzip = /\bgzip\b/i.test(req.headers.get("accept-encoding") || "") && typeof CompressionStream === "function";
  if (kept) {
    const tag = `W/"${hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key))).slice(0, 32)}"`;
    headers.set("cache-control", `private, max-age=${WORDS_MAX_AGE}, immutable`);
    headers.set("etag", tag);
    headers.set("vary", "Accept-Encoding");
    if (holds(req.headers.get("if-none-match"), tag)) {
      try { await body.cancel(); } catch { /* the answer is not wanted */ }
      headers.delete("content-length"); headers.delete("content-type");
      return { res: new Response(null, { status: 304, headers }), table: true };
    }
  } else {
    headers.set("cache-control", "private, no-cache");
  }
  if (acceptsGzip) {
    headers.delete("content-length");
    headers.set("content-encoding", "gzip");
    if (!/accept-encoding/i.test(headers.get("vary") || "")) headers.set("vary", [headers.get("vary"), "Accept-Encoding"].filter(Boolean).join(", "));
    return { res: new Response(body.pipeThrough(new CompressionStream("gzip")), { status: 200, headers }), table: true };
  }
  return { res: new Response(body, { status: 200, headers }), table: true };
}
