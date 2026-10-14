/* journey-check (T47-88; R1 (a)): the fake Cloudflare account the local arm's installer runs over, answered over HTTP as
   Cloudflare answers it, and stateful as the installer's own fake is (newgroup/test/fixture.mjs, read, never imported):
   OAuth with PKCE (the consent page a browser is sent to, the token exchange the installer makes), the account list, the
   plan probe, the evidence buckets, each script uploaded with its bindings (`keep_bindings` applied by type), its bytes
   read back, the workers.dev prefix and each script's address, and no Logpush job. The public release repository does
   not answer, so the installer installs its built-in release and says why. Every call it does not answer is recorded as
   `unanswered` and refused, so the walk fails on it rather than passing over it. */

const enc = new TextEncoder();
const b64url = (buf) => Buffer.from(buf).toString("base64url");
const s256 = async (s) => b64url(await crypto.subtle.digest("SHA-256", enc.encode(s)));
const jres = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const ok = (result) => jres({ success: true, errors: [], result });
const no = (message, status = 400, code = 0) => jres({ success: false, errors: [{ code, message }], result: null }, status);

export const API = "https://api.cloudflare.com/client/v4";
export const AUTHORIZE = "https://dash.cloudflare.com/oauth2/auth";
export const TOKEN = "https://dash.cloudflare.com/oauth2/token";
export const RELEASES = "https://raw.githubusercontent.com/";

/* `onScript(name, {bindings, source})` is called after each script upload the account accepts, with the bindings the
   script now holds; the local arm starts or reconfigures the copy from it. `copyFetch(request)` answers a request to a
   script's workers.dev address, once it is enabled. */
export function fakeAccount({ name = "Journey test account", onScript = async () => {}, copyFetch = null } = {}) {
  const ACCT = "acct" + "0".repeat(28);
  const scripts = new Map();           /* name -> {bindings, source} */
  const buckets = new Set();
  const enabled = new Set();
  const grants = new Map();            /* code -> {challenge, redirect, state} */
  const tokens = new Set();
  const unanswered = [];
  const calls = [];
  let prefix = null;

  /* The consent page Cloudflare would show: what is asked, and one "Allow" that returns to the installer. */
  async function consent(url) {
    const u = new URL(url);
    const q = u.searchParams;
    const code = "code-" + b64url(crypto.getRandomValues(new Uint8Array(12)));
    grants.set(code, { challenge: q.get("code_challenge"), method: q.get("code_challenge_method"), redirect: q.get("redirect_uri"),
      client: q.get("client_id") });
    const back = new URL(q.get("redirect_uri"));
    back.searchParams.set("code", code);
    back.searchParams.set("state", q.get("state") || "");
    const scopes = (q.get("scope") || "").split(" ").filter(Boolean);
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Allow access (test account)</title></head>
<body><main><h1>Allow access to ${name}</h1><p>This is the walk's stand-in for Cloudflare's own consent page.</p>
<ul>${scopes.map((s) => `<li>${s.replace(/[<>&]/g, "")}</li>`).join("")}</ul>
<a id="allow" href="${back.href.replace(/"/g, "&quot;")}">Allow</a></main></body></html>`,
      { status: 200, headers: { "content-type": "text/html; charset=utf-8" } });
  }

  async function token(req) {
    const form = new URLSearchParams(await req.text());
    const g = grants.get(form.get("code"));
    if (!g) return jres({ error: "invalid_grant", error_description: "unknown code" }, 400);
    grants.delete(form.get("code"));
    if (g.method !== "S256" || (await s256(form.get("code_verifier") || "")) !== g.challenge)
      return jres({ error: "invalid_grant", error_description: "PKCE verifier does not match" }, 400);
    if (form.get("redirect_uri") !== g.redirect) return jres({ error: "invalid_grant", error_description: "redirect differs" }, 400);
    const t = "tok-" + b64url(crypto.getRandomValues(new Uint8Array(24)));
    tokens.add(t);
    return jres({ access_token: t, token_type: "bearer", expires_in: 3600,
      scope: "workers-scripts.write workers-r2.write account-settings.read containers.write connectivity-directory.bind" });
  }

  async function putScript(nameOf, req) {
    const form = await req.formData();
    const meta = JSON.parse(await form.get("metadata").text());
    const source = await form.get("index.mjs").text();
    const explicit = meta.bindings || [];
    for (const b of explicit) if (b.type === "service" && b.service !== nameOf && !scripts.has(b.service))
      return no(`Service binding '${b.name}' references Worker '${b.service}' which was not found`, 400, 10143);
    if (nameOf === "bio-plan-probe") { scripts.set(nameOf, { bindings: [], source, probe: true }); return ok({ id: nameOf }); }
    const kept = (scripts.get(nameOf)?.bindings || []).filter((b) => (meta.keep_bindings || []).includes(b.type)
      && !explicit.some((x) => x.name === b.name));
    const bindings = [...explicit, ...kept];
    scripts.set(nameOf, { bindings, source, meta });
    await onScript(nameOf, { bindings, source, meta });
    return ok({ id: nameOf });
  }

  async function api(req, path) {
    const m = req.method;
    let x;
    if (m === "GET" && path === "/accounts") return ok([{ id: ACCT, name }]);
    if (!path.startsWith(`/accounts/${ACCT}/`)) return null;
    const rest = path.slice(`/accounts/${ACCT}`.length);
    if ((x = /^\/workers\/scripts\/([^/]+)$/.exec(rest))) {
      if (m === "PUT") return putScript(x[1], req);
      if (m === "DELETE") { scripts.delete(x[1]); return ok({}); }
      if (m === "GET") return scripts.has(x[1]) ? new Response(scripts.get(x[1]).source,
        { headers: { "content-type": "application/javascript+module" } }) : no("not found", 404, 10007);
    }
    if ((x = /^\/workers\/scripts\/([^/]+)\/settings$/.exec(rest)) && m === "GET")
      return scripts.has(x[1]) ? ok({ bindings: scripts.get(x[1]).bindings.map(({ text, ...b }) => b) }) : no("not found", 404, 10007);
    if ((x = /^\/workers\/scripts\/([^/]+)\/subdomain$/.exec(rest)) && m === "POST") {
      if (!scripts.has(x[1])) return no("not found", 404, 10007);
      enabled.add(x[1]); return ok({ enabled: true });
    }
    if (rest === "/workers/subdomain" && m === "GET") return prefix ? ok({ subdomain: prefix }) : no("no subdomain", 404, 10007);
    if (rest === "/workers/subdomain" && m === "PUT") { prefix = (await req.json()).subdomain; return ok({ subdomain: prefix }); }
    if ((x = /^\/r2\/buckets\/([^/]+)$/.exec(rest)) && m === "GET")
      return buckets.has(x[1]) ? ok({ name: x[1] }) : no("The specified bucket does not exist.", 404, 10006);
    if (rest === "/r2/buckets" && m === "POST") {
      const { name: b } = await req.json();
      if (buckets.has(b)) return no("The bucket you tried to create already exists", 409, 10004);
      buckets.add(b); return ok({ name: b });
    }
    if (rest === "/logpush/jobs" && m === "GET") return ok([]);
    if (rest.startsWith("/workers/durable_objects/namespaces") && m === "GET")
      return ok([...scripts].filter(([, s]) => s.meta?.migrations).map(([n]) => ({ id: "ns-" + n, script: n, class: "Store" })));
    return null;
  }

  /* Answers one outbound request of the installer (Miniflare's outbound service), or a browser's request to the consent
     page. Anything it does not know is recorded and refused. */
  async function handle(req) {
    const url = req.url;
    calls.push(`${req.method} ${url.replace(/[?#].*$/, "")}`);
    if (url.startsWith(AUTHORIZE)) return consent(url);
    if (url === TOKEN && req.method === "POST") return token(req);
    if (url.startsWith(RELEASES)) return new Response("not found", { status: 404 });
    if (url.startsWith(API + "/")) {
      const auth = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
      if (!tokens.has(auth)) return no("Authentication error", 403, 10000);
      const r = await api(req, new URL(url).pathname.slice("/client/v4".length));
      if (r) return r;
    }
    const host = new URL(url).host;
    const at = /^([a-z0-9-]+)\.([a-z0-9-]+)\.workers\.dev$/.exec(host);
    if (at && at[2] === prefix && enabled.has(at[1]) && copyFetch) return copyFetch(req);
    unanswered.push(`${req.method} ${url}`);
    return new Response("the walk's fake account does not answer this", { status: 599 });
  }

  return { handle, scripts, buckets, unanswered, calls, account: ACCT, prefix: () => prefix,
    addressOf: (slug) => (prefix && enabled.has(slug) ? `https://${slug}.${prefix}.workers.dev` : null) };
}
