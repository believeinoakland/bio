/* control-plane R116 (fix round 2, C15; amends R66): THE INTERFACE WORDS ARE KEPT FOR THE RELEASE AND SENT COMPRESSED. `op=interfacewords`
   answers every interface word in a language (6.2 MB raw, measured), and the shell asks for them on every screen. The release is the
   version (`env.VERSION`, R1): a request that names it (`v`, as the shell sends it) is answered with a cache lifetime of a year, `immutable`,
   so a caller that holds the release's words asks no more, and a validator (`etag`) that answers an ask anyway as unchanged; a new
   release is a new `v`, so its words are fetched afresh. The body is gzip-compressed for a caller that accepts it, the same words
   either way. `private`, and `vary: authorization`, because the words are read under a session: nothing here changes who may read them
   or the gates of R66, which have all run before the answer is made. An answer that is not the words (a refusal, a request naming
   another release or none) is left exactly as it came. */

/* a year, the longest a cache is asked to keep anything */
export const WORDS_MAX_AGE = 31536000;

const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");

/* `If-None-Match` names the validator (weak comparison, RFC 9110 §13.1.2), or `*` */
const holds = (header, tag) => typeof header === "string"
  && header.split(",").some((t) => { const x = t.trim(); return x === "*" || x.replace(/^W\//, "") === tag.replace(/^W\//, ""); });

/** The answer of `op=interfacewords`, `res`, as the door sends it. `req`, `env`: the request and the Worker environment. */
export async function interfaceWordsCache(res, req, env) {
  if (!res || req.method !== "GET" || res.status !== 200) return res;
  const version = env && typeof env.VERSION === "string" ? env.VERSION : "";
  if (!version || new URL(req.url).searchParams.get("v") !== version) return res;
  const bytes = await res.clone().arrayBuffer();
  let answer;
  try { answer = JSON.parse(new TextDecoder().decode(bytes)); } catch { return res; }
  if (!answer || typeof answer !== "object" || answer.ok !== true || answer.result?.ok === false) return res;
  const tag = `W/"${version}.${hex(await crypto.subtle.digest("SHA-256", bytes)).slice(0, 32)}"`;
  const headers = new Headers(res.headers);
  headers.set("cache-control", `private, max-age=${WORDS_MAX_AGE}, immutable`);
  headers.set("etag", tag);
  headers.set("vary", "Authorization, Accept-Encoding");
  if (holds(req.headers.get("if-none-match"), tag)) {
    headers.delete("content-length"); headers.delete("content-type");
    return new Response(null, { status: 304, headers });
  }
  headers.delete("content-length");
  if (/\bgzip\b/i.test(req.headers.get("accept-encoding") || "") && typeof CompressionStream === "function") {
    headers.set("content-encoding", "gzip");
    return new Response(new Response(bytes).body.pipeThrough(new CompressionStream("gzip")), { status: 200, headers });
  }
  return new Response(bytes, { status: 200, headers });
}
