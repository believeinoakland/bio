/* journey-check R11: the local arm's stand-in for Anthropic's own sign-in page, which the connect screen opens in a new
   tab at the address the runner stand-in (runner.mjs) states. local.mjs serves it at `SIGNIN_PAGE`, as account.mjs's
   consent page stands in for Cloudflare's: it shows a code to copy, as Anthropic's page does after approval. */
export const SIGNIN_PAGE = "https://claude.ai/oauth/authorize";
export const SIGNIN_ADDRESS = SIGNIN_PAGE + "?code=true&client_id=journey-check-local-arm";

export function signinPage() {
  const code = "journey-" + Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, "0")).join("")
    + "#state-" + Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, "0")).join("");
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Authorize (test sign-in)</title></head>
<body><main><h1>Signed in (the walk's stand-in for Anthropic's page)</h1><p>Paste this code into your application:</p>
<pre id="signin-code" data-secret>${code}</pre></main></body></html>`, { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
}
