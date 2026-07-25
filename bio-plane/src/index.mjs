import { SCHEMA } from "./schema.mjs";
import { livefire } from "./livefire.mjs";
import { SETUP_HTML } from "./setup.mjs";
import { SIGN_HTML } from "./signpage.mjs";
import { liveToken } from "./tokens.mjs";
import { runGate, GATE_VERSION } from "./gate.mjs";
import { verifySshsig, ratifyStatement, NS_RATIFY } from "./sshsig.mjs";
/* The locator fence, taken from the catalog rather than restated: https only,
   public hosts only, no credentials in the authority, no bare IPs, no localhost.
   It is the one bound between a member typing a URL and this Worker fetching it,
   so it must be the same function the checker uses on the queue. */
import { isPublicHttpsLocator } from "../checks/bio-checks.mjs";
export { Store } from "./store.mjs";
export { PUBLISHED_TOKEN_HASHES, liveToken } from "./tokens.mjs";

/* BIO plane, control plane entry.
 *
 * Secret discipline, which is a design constraint rather than a convention:
 *
 *   1. No module reads a credential at import time. Every secret arrives as a
 *      binding on env, so the whole tree loads and the whole battery runs with
 *      no secrets present at all. That is what makes the local suite
 *      credential-free by construction rather than by accident.
 *   2. R2 credentials never leave the Worker. The Worker holds the bucket as a
 *      BINDING, not as an access key, so there is no key to leak, rotate, or
 *      hand to anyone. Nothing outside Cloudflare ever signs an R2 request.
 *   3. Callers present a token whose CLASS bounds what it can do. A probe-class
 *      token can read and can touch only the scratch namespace. If it leaks it
 *      buys nothing.
 *
 * Token classes, extending the accelerator's tokenClass_ rather than replacing
 * it:
 *   admin   every op, including promotion against the live store
 *   member  read, lease, allocid, promote within the member's group
 *   probe   read-only ops, plus writes confined to the scratch namespace
 *   public  published-scope reads only
 */

const OPS = {
  //  op          class allowed              mutating
  selftest:   { classes: ["admin", "member", "probe", "public"], mutating: false },
  livefire:   { classes: ["admin", "probe"],                     mutating: true  },
  index:      { classes: ["admin", "member", "probe", "public"], mutating: false },
  list:       { classes: ["admin", "member", "probe"],           mutating: false },
  image:      { classes: ["admin", "member", "probe"],           mutating: false },
  file:       { classes: ["admin", "member", "probe"],           mutating: false },
  dangling:   { classes: ["admin", "member", "probe"],           mutating: false },
  stats:      { classes: ["admin", "member", "probe"],           mutating: false },
  promote:    { classes: ["admin", "member", "probe"],           mutating: true  },
  allocid:    { classes: ["admin", "member", "probe"],           mutating: true  },
  lease:      { classes: ["admin", "member", "probe"],           mutating: true  },
  purge:      { classes: ["admin", "probe"],                     mutating: true  },
  capture:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* Acquisition: the fetch layer the intake doctrine calls M2'. It writes bytes
     and no bundle state, because the doctrine is explicit that no intake path
     writes live state and the daemon and the member are writers like any other. */
  acquire:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* Write arc. Ratification's authority is the SSHSIG itself, checked
     against the registered signers; the token or session only reaches the
     surface. Member and signer administration is admin-only. Probe class
     reaches everything so the whole write arc is exercisable against
     scratch, whose Durable Object is a different instance with its own
     member tables, so scratch enrollment can never touch the live roster. */
  ratify:       { classes: ["admin", "member", "probe"],           mutating: true  },
  publishedlist:{ classes: ["admin", "member", "probe", "public"], mutating: false },
  inbox:        { classes: ["admin", "member", "probe"],           mutating: false },
  inboxget:     { classes: ["admin", "member", "probe"],           mutating: false },
  inboxresolve: { classes: ["admin", "member", "probe"],           mutating: true  },
  memberadd:    { classes: ["admin", "probe"],                     mutating: true  },
  memberlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  memberset:    { classes: ["admin", "probe"],                     mutating: true  },
  signeradd:    { classes: ["admin", "probe"],                     mutating: true  },
  signerlist:   { classes: ["admin", "member", "probe"],           mutating: false },
  signerset:    { classes: ["admin", "probe"],                     mutating: true  },
  /* The bootstrap trio and the doorbell are the unauthenticated surface.
     Each enforces its own gate: bootstrap reveals nothing but
     claimed/unclaimed, claim requires the bootstrap secret and refuses once
     spent, login requires the password, enroll requires a live one-time
     invite. verify answers only from the published projection, which has
     never seen unratified material, so there is nothing to leak. knock
     lands in a quarantined inbox, size-capped and rate-limited; the worst
     case under attack is a full inbox. */
  bootstrap:  { classes: null,                                   mutating: false },
  claim:      { classes: null,                                   mutating: true  },
  login:      { classes: null,                                   mutating: false },
  enroll:     { classes: null,                                   mutating: true  },
  verify:     { classes: null,                                   mutating: false },
  knock:      { classes: null,                                   mutating: true  },
};

/* What a signed-in browser session may do, the write arc's evolution of the
   read-only session rule. Intake is browser-writable: it is append-only,
   CAS-protected, history-preserving, and runs through the same promote path
   as everything else. Publishing requires a registered key's signature
   regardless of how the caller authenticated, and purge stays reachable
   only by machine credential. Member sessions get intake and review; admin
   sessions additionally manage the roster and keys. */
const SESSION_OPS = {
  member: new Set(["promote", "lease", "allocid", "capture", "acquire", "ratify",
                   "inbox", "inboxget", "inboxresolve"]),
  admin:  new Set(["promote", "lease", "allocid", "capture", "acquire", "ratify",
                   "inbox", "inboxget", "inboxresolve",
                   "memberadd", "memberset", "signeradd", "signerset"]),
};

const KNOCK = {
  windowMs: 10 * 60 * 1000,
  perIp: 12,          // knocks per source per window
  global: 300,        // knocks per instance per window; bounds hostile R2 writes
  maxBytes: 8 * 1024 * 1024,   // with R2: enough for a captured PDF
  maxInline: 64 * 1024,        // without R2: inline into the DO, small only
};

const SCRATCH = "scratch";

async function fingerprint(v) {
  if (!v) return null;
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(b)].slice(0, 8).map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function classify(token, env) {
  if (!token) return null;
  if (token === env.ADMIN_TOKEN && (await liveToken(env.ADMIN_TOKEN))) return "admin";
  if (token === env.MEMBER_TOKEN && (await liveToken(env.MEMBER_TOKEN))) return "member";
  if (token === env.PROBE_TOKEN && (await liveToken(env.PROBE_TOKEN))) return "probe";
  if (token === env.PUBLIC_TOKEN && (await liveToken(env.PUBLIC_TOKEN))) return "public";
  return null;
}

/* A probe-class token may mutate, but only inside the scratch namespace. This
   is what lets an automated caller exercise the real write path, including the
   CAS, against the real deployment, without any ability to touch live state. */
/* A probe-class caller is confined to the scratch namespace. Confinement is by
   REFUSAL, not by silent redirection: a caller that believes it addressed the
   live store must be told it did not, rather than quietly succeeding somewhere
   else. Defaulting with no store parameter is scratch. */
function scopeFor(cls, url) {
  const asked = url.searchParams.get("store");
  if (cls === "probe") return asked && asked !== SCRATCH ? { error: `probe class is confined to the ${SCRATCH} namespace, refused request for ${JSON.stringify(asked)}` } : { name: SCRATCH };
  return { name: asked === SCRATCH ? SCRATCH : "bio" };
}

const json = (o, status = 200) =>
  new Response(JSON.stringify(o, null, 1), {
    status, headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === "OPTIONS")
      return new Response(null, { status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type" } });

    /* The API lives under /api so the instance can serve its own setup UI at
       the root. A bare GET of / with no op parameter is a person in a browser
       and gets the page. The legacy root query API (/?op=...) still answers,
       for the one deployment that predates this, and should be dropped once
       that instance is gone. */
    /* The signing page, served by the group's own instance. It is the same
       self-contained file that ships in tools/, with no network calls, and
       it holds no secret: keys are made and used in the visitor's browser.
       Serving it means the instance can LINK to it, which is the difference
       between a step an ordinary person can follow and one they cannot. */
    /* Which version is this? A plain GET, no token, no op parameter, no JSON
       field to know the name of. `op=bootstrap` has always carried the version
       and always will, but "call bootstrap and read the version field" is not
       something anyone should have to be told, and the question gets asked
       after every update. */
    if (req.method === "GET" && (url.pathname === "/version" || url.pathname === "/version/"))
      return new Response((env.VERSION || "0.0.0") + "\n",
        { headers: { "content-type": "text/plain; charset=utf-8",
                     "access-control-allow-origin": "*" } });
    if (req.method === "GET" && (url.pathname === "/sign" || url.pathname === "/sign/"))
      return new Response(SIGN_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
    if (req.method === "GET" && !url.pathname.startsWith("/api")
        && (url.pathname === "/" || url.pathname === "") && !url.searchParams.get("op"))
      return new Response(SETUP_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });

    const path = url.pathname.replace(/^\/api\/?/, "/");
    const op = url.searchParams.get("op") || path.slice(1) || "selftest";
    const spec = OPS[op];
    if (!spec) return json({ ok: false, error: "unknown op", op }, 400);

    /* Unauthenticated by design. Each one gates itself. */
    if (spec.classes === null) {
      const fp = await fingerprint(env.ADMIN_TOKEN);
      const stub = env.STORE.get(env.STORE.idFromName("bio"));
      if (op === "claim") {
        const body = await req.json().catch(() => ({}));
        if (!env.ADMIN_TOKEN) return json({ ok: false, error: "instance has no bootstrap credential set" }, 409);
        if (!(await liveToken(env.ADMIN_TOKEN)))
          return json({ ok: false, error: "bootstrap credential is a published repository value and can never arm a claim; set a fresh ADMIN_TOKEN in the Cloudflare dashboard" }, 409);
        if (body.bootstrapToken !== env.ADMIN_TOKEN)
          return json({ ok: false, error: "bootstrap credential does not match" }, 403);
        const r = await stub.fetch(new Request(`http://do/claim?fp=${fp}`, {
          method: "POST", body: JSON.stringify({ role: "admin", password: body.password }) }));
        return json(await r.json(), 200);
      }
      if (op === "login") {
        const body = await req.json().catch(() => ({}));
        const r = await stub.fetch(new Request("http://do/login", {
          method: "POST", body: JSON.stringify({ role: body.role || "admin", password: body.password }) }));
        return json(await r.json(), 200);
      }
      if (op === "enroll") {
        const body = await req.json().catch(() => ({}));
        const r = await stub.fetch(new Request("http://do/enroll", {
          method: "POST", body: JSON.stringify(body) }));
        return json(await r.json(), 200);
      }
      /* 7a. Anyone, no token, no session. The DO consults only the
         published projection. */
      if (op === "verify") {
        const sha = (url.searchParams.get("sha256") || "").toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(sha))
          return json({ ok: false, error: "verify requires sha256=<64 lowercase hex>" }, 400);
        const r = await stub.fetch(new Request(`http://do/verify?sha256=${sha}`));
        const out = await r.json();
        return json({ ok: true, ...out.result }, 200);
      }
      /* 7b. Anyone, no token, no session. Size-capped, rate-limited, and
         confined to the inbox namespace: payload bytes land under
         bio/inbox/<sha256> in the working bucket and nowhere else, the way
         probe is confined to scratch. Nothing is read back out except by a
         signed-in member. */
      if (op === "knock") {
        if (req.method !== "POST") return json({ ok: false, error: "knock is a POST" }, 405);
        const raw = await req.arrayBuffer();
        if (raw.byteLength > KNOCK.maxBytes + 4096)
          return json({ ok: false, reason: "TOO_LARGE", maxBytes: KNOCK.maxBytes }, 413);
        let body; try { body = JSON.parse(new TextDecoder().decode(raw)); } catch { body = null; }
        if (!body || (typeof body.contentB64 !== "string" && typeof body.contentText !== "string"))
          return json({ ok: false, error: "knock requires contentB64 or contentText, plus optional note and contact" }, 400);
        let bytes;
        try {
          bytes = body.contentB64 !== undefined
            ? Uint8Array.from(atob(body.contentB64), (c) => c.charCodeAt(0))
            : new TextEncoder().encode(body.contentText);
        } catch { return json({ ok: false, error: "contentB64 is not valid base64" }, 400); }
        if (bytes.length === 0) return json({ ok: false, reason: "EMPTY" }, 400);
        const r2 = typeof env.CAPTURES?.put === "function";
        const cap = r2 ? KNOCK.maxBytes : KNOCK.maxInline;
        if (bytes.length > cap)
          return json({ ok: false, reason: "TOO_LARGE", maxBytes: cap,
                        detail: r2 ? undefined : "this instance stores knocks inline; large material needs its evidence storage configured" }, 413);
        const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
          .map((x) => x.toString(16).padStart(2, "0")).join("");
        const win = Math.floor(Date.now() / KNOCK.windowMs);
        const ipHash = (await fingerprint(req.headers.get("cf-connecting-ip") || "unknown")) || "unknown";
        const knockId = `KNOCK-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}`;
        const rec = await (await stub.fetch(new Request("http://do/knock", {
          method: "POST", body: JSON.stringify({
            knockId, sha256: sha, bytes: bytes.length,
            content: r2 ? null : new TextDecoder().decode(bytes),
            inR2: r2, note: body.note, contact: body.contact,
            ipBucket: `ip:${ipHash}:${win}`, globalBucket: `all:${win}`,
            perIpLimit: KNOCK.perIp, globalLimit: KNOCK.global,
          }) }))).json();
        if (!rec.result?.ok) return json({ ok: false, ...rec.result }, 429);
        if (r2) await env.CAPTURES.put(`bio/inbox/${sha}`, bytes,
          { sha256: await crypto.subtle.digest("SHA-256", bytes) });
        return json({ ok: true, knockId, sha256: sha, bytes: bytes.length,
                      received: "Your material is in the group's inbox awaiting member review." }, 200);
      }
      const r = await stub.fetch(new Request(`http://do/bootstrap?fp=${fp}`));
      const out = await r.json();
      return json({ ok: true, service: "bio-plane", version: env.VERSION || "0.0.0",
                    bootstrapConfigured: await liveToken(env.ADMIN_TOKEN), ...out.result }, 200);
    }

    let cls = await classify(url.searchParams.get("token"), env);
    let viaSession = false;
    let sessMember = null;
    /* A browser signed in with a password holds a session token, not a
       machine credential. The write arc opens INTAKE to sessions: promote,
       lease, allocid, capture, ratify, and inbox review run through the
       same gated paths as machine callers, with authorship stamped
       server-side from the session identity so a browser can never claim
       to be someone else. Everything outside SESSION_OPS, purge above all,
       still requires a machine credential. capture is nominally mutating
       because of its PUT path; its GET is a read and is treated as one. */
    if (!cls) {
      const t = url.searchParams.get("token");
      if (t && /^[0-9a-f]{64}$/.test(t)) {
        const st = env.STORE.get(env.STORE.idFromName("bio"));
        const r = await (await st.fetch(`http://do/session?t=${t}`)).json();
        const sess = r?.result?.session;
        if (sess) {
          const kind = sess.role === "admin" ? "admin" : "member";
          if (spec.mutating && !(op === "capture" && req.method === "GET")
              && !SESSION_OPS[kind].has(op))
            return json({ ok: false, error: "this operation requires a machine credential, not a signed-in session", op }, 403);
          cls = kind;
          sessMember = sess.role.startsWith("member:") ? sess.role.slice(7) : sess.role;
          viaSession = true;
        }
      }
    }
    if (!cls) return json({ ok: false, error: "unauthenticated" }, 401);
    if (!spec.classes.includes(cls)) return json({ ok: false, error: "forbidden for token class", op, cls }, 403);

    const scope = scopeFor(cls, url);
    if (scope.error) return json({ ok: false, error: scope.error, tokenClass: cls }, 403);
    const storeName = scope.name;

    /* selftest reports deployment health as JSON, so "did the deploy work" is a
       link rather than a command. It asserts every binding is present and that
       the store answers, and it never returns a secret. */
    if (op === "selftest") {
      /* R2 is optional by design: a new group has nothing over the spill
         threshold, so everything lives in SQLite and no card is needed.
         "Not configured" is a first-class healthy state, distinct from
         "configured and broken", which stays a failure. Fence doctrine
         survives because the buckets are only ever added as a pair. */
      const r2Configured = typeof env.CAPTURES?.get === "function"
                        && typeof env.PUBLISHED?.get === "function";
      const out = {
        ok: true, service: "bio-plane", version: env.VERSION || "0.0.0",
        time: new Date().toISOString(), tokenClass: cls,
        bindings: {
          STORE: typeof env.STORE?.idFromName === "function",
          CAPTURES: typeof env.CAPTURES?.get === "function" ? true : "not configured",
          PUBLISHED: typeof env.PUBLISHED?.get === "function" ? true : "not configured",
          ADMIN_TOKEN: await liveToken(env.ADMIN_TOKEN),
          MEMBER_TOKEN: await liveToken(env.MEMBER_TOKEN),
          PROBE_TOKEN: await liveToken(env.PROBE_TOKEN),
        },
        r2Configured,
        schemaChars: SCHEMA.length,
      };
      /* Half a fence is a defect, not an option. */
      if ((typeof env.CAPTURES?.get === "function") !== (typeof env.PUBLISHED?.get === "function")) {
        out.ok = false;
        out.r2 = "MISCONFIGURED: one bucket bound without the other; the fence requires both or neither";
      }
      try {
        const r = await env.STORE.get(env.STORE.idFromName(storeName)).fetch("http://x/stats");
        out.store = (await r.json()).result;
      } catch (e) { out.ok = false; out.store = "ERR " + String(e && e.message || e); }
      if (r2Configured) {
        try {
          const key = `${SCRATCH}/selftest-${Date.now()}`;
          await env.CAPTURES.put(key, "ok");
          const back = await env.CAPTURES.get(key);
          out.captures = (await back.text()) === "ok" ? "read-write ok" : "MISMATCH";
          await env.CAPTURES.delete(key);
        } catch (e) { out.ok = false; out.captures = "ERR " + String(e && e.message || e); }
      } else {
        out.captures = "not configured";
      }
      /* Required for health: the store and three live token bindings. R2 is
         reported but not required. */
      out.bindingsAllPresent =
        out.bindings.STORE === true && out.bindings.ADMIN_TOKEN === true
        && out.bindings.MEMBER_TOKEN === true && out.bindings.PROBE_TOKEN === true;
      if (!out.bindingsAllPresent) out.ok = false;
      return json(out, out.ok ? 200 : 500);
    }

    /* purge is the only destructive op. It refuses unless the caller names the
       store it resolved to, so a purge can never land somewhere the caller did
       not mean. Probe class reaches it, but scopeFor has already confined probe
       to scratch, so probe can only ever confirm "scratch". */
    if (op === "purge") {
      const confirm = url.searchParams.get("confirm");
      if (confirm !== storeName)
        return json({ ok: false, error: "purge requires confirm=<store>", expected: storeName,
                      got: confirm, tokenClass: cls, store: storeName }, 400);
    }

    if (op === "livefire") {
      const out = await livefire(env, storeName);
      return json(out, out.ok ? 200 : 500);
    }

    /* capture is the one op that moves bytes. PUT or POST writes capture
       content to the working bucket, content-addressed by its SHA-256 and
       verified server-side against the received body, so a caller can never
       land bytes under the wrong name. Existing keys are immutable: a re-put
       of identical content answers ok with existed true and writes nothing.
       GET reads the bytes back and honours a Range header. The DO is not
       involved: the register row that NAMES a capture travels inside a
       promote package; this op only moves the bytes the row names. Keys live
       under `<store>/captures/<sha256>`, so probe confinement to the scratch
       store confines its captures mechanically, the same way as everything
       else. Publishing to the PUBLISHED bucket is the publisher's act during
       ratification and deliberately has no op here. */
    if (op === "capture") {
      if (typeof env.CAPTURES?.get !== "function")
        return json({ ok: false, error: "R2 is not configured on this instance" }, 503);
      const sha = (url.searchParams.get("sha256") || "").toLowerCase();
      if (!/^[0-9a-f]{64}$/.test(sha))
        return json({ ok: false, error: "capture requires sha256=<64 lowercase hex>" }, 400);
      const key = `${storeName}/captures/${sha}`;
      if (req.method === "PUT" || req.method === "POST") {
        const body = new Uint8Array(await req.arrayBuffer());
        const digest = [...new Uint8Array(await crypto.subtle.digest("SHA-256", body))]
          .map((x) => x.toString(16).padStart(2, "0")).join("");
        if (digest !== sha)
          return json({ ok: false, reason: "INTEGRITY", detail: "body hash does not match the sha256 parameter",
                        expected: sha, got: digest, store: storeName, tokenClass: cls }, 400);
        const existing = await env.CAPTURES.head(key);
        if (existing)
          return json({ ok: true, sha256: sha, bytes: existing.size, existed: true, store: storeName, tokenClass: cls });
        await env.CAPTURES.put(key, body, { sha256: await crypto.subtle.digest("SHA-256", body) });
        return json({ ok: true, sha256: sha, bytes: body.length, existed: false, store: storeName, tokenClass: cls });
      }
      const wantRange = req.headers.get("range");
      const obj = await env.CAPTURES.get(key, wantRange ? { range: req.headers } : undefined);
      const dl = (url.searchParams.get("dl") || "").replace(/[^\w.\- ]/g, "").slice(0, 120);
      if (!obj)
        return json({ ok: false, reason: "NOT_FOUND", sha256: sha, store: storeName, tokenClass: cls }, 404);
      return new Response(obj.body, {
        status: wantRange ? 206 : 200,
        headers: { "content-type": "application/octet-stream",
                   "access-control-allow-origin": "*", "x-capture-sha256": sha,
                   ...(dl ? { "content-disposition": `attachment; filename="${dl}"` } : {}) },
      });
    }

    /* Acquisition: the fetch layer the intake doctrine calls M2'.
     *
     * What it produces is Grade B and says so. The doctrine's Section 3 is
     * precise: Grade B is "the document bytes as fetched by a capable surface,
     * hashed at receipt, with locator and instant", and Grade A requires a WACZ
     * or equivalent chain-of-custody capture of the source as served, which a
     * Worker cannot produce. Claiming A here would be the one thing the grading
     * scheme exists to prevent, since "a claim about evidence is only as strong
     * as its weakest named layer".
     *
     * It writes no bundle state. The doctrine: "No intake path writes live
     * state; the daemon and the member are writers like every writer." So this
     * returns a provenance document and the caller promotes it.
     */
    if (op === "acquire") {
      if (req.method !== "POST") return json({ ok: false, error: "acquire is a POST" }, 405);
      if (typeof env.CAPTURES?.put !== "function")
        return json({ ok: false, error: "this instance has no evidence storage configured" }, 503);
      const body = await req.json().catch(() => null);
      const locator = body?.locator;
      if (typeof locator !== "string" || !isPublicHttpsLocator(locator))
        return json({ ok: false, reason: "BAD_LOCATOR",
                      detail: "a locator must be https on a public host: no bare IP address, no localhost, no credentials in the address" }, 400);
      if (typeof body?.authority !== "string" || !body.authority.trim())
        return json({ ok: false, reason: "NO_AUTHORITY",
                      detail: "record who issued the document; the capture chain and the source are separate claims and both are named" }, 400);

      const retrieved = new Date().toISOString().split(".")[0] + "Z";
      let res;
      try {
        res = await fetch(locator, { redirect: "follow", headers: { "user-agent": "bio-acquire" } });
      } catch (e) {
        return json({ ok: false, reason: "FETCH_FAILED", detail: String(e && e.message || e), locator }, 502);
      }
      if (!res.ok)
        return json({ ok: false, reason: "SOURCE_REFUSED", status: res.status, locator }, 502);

      /* Bounded because a Worker holds this in memory to hash it. Beyond the
         cap the document goes in as parts, which the catalog supports and which
         streams through its incremental hash one part at a time; that path is
         the client's, not this one's. */
      const MAX = 20 * 1024 * 1024;
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.length > MAX)
        return json({ ok: false, reason: "TOO_LARGE", bytes: bytes.length, maxBytes: MAX,
                      detail: "acquire holds the document in memory to hash it; a document this size is captured as registered parts instead" }, 413);
      if (bytes.length === 0)
        return json({ ok: false, reason: "EMPTY", locator }, 502);

      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const sha = [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
      const key = `${storeName}/captures/${sha}`;
      const existed = !!(await env.CAPTURES.head(key));
      if (!existed) await env.CAPTURES.put(key, bytes, { sha256: digest });

      const ct = (res.headers.get("content-type") || "").split(";")[0].trim();
      const name = (body.file || locator.split("/").pop() || "capture")
        .replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 100) || "capture";

      /* The shape C-18.1 requires, assembled here so the caller does not have to
         know it and cannot get it subtly wrong. */
      return json({
        ok: true, existed,
        document: {
          file: `snapshots/${name}`,
          locator, authority: body.authority.trim(), retrieved,
          capture: {
            method: "bio-plane acquire, https fetch, hashed at receipt",
            grade: "B",
            actor_class: viaSession ? "member" : (cls === "probe" ? "session" : "daemon"),
            sha256: sha, encoding: "binary", bytes: bytes.length,
            ...(ct ? { content_type: ct } : {}),
          },
          origin: { kind: body.matchedSweep ? "sweep" : "named_request",
                    ...(body.matchedSweep ? { matched_sweep: body.matchedSweep, deeming_actor: sessMember || cls } : {}) },
          attestation_attempts: [],
        },
        note: "Grade B: bytes as fetched, hashed at receipt. Grade A needs a chain-of-custody web archive, which this surface cannot produce. Co-attestation raises B toward evidentiary weight.",
        store: storeName, tokenClass: cls,
      }, 200);
    }

    const stub = env.STORE.get(env.STORE.idFromName(storeName));

    /* Ratification: the act that moves a bundle into the published corpus.
       The authority is the SSHSIG over the canonical statement, verified
       against the registered active signers; the token or session only
       reached this surface. The caller states the sha it reviewed, so
       ratification has its own CAS: nobody can ratify a revision they have
       not seen. Order of operations is deliberate: verify everything, then
       commit the published rows, then copy bytes to the published bucket.
       A failure mid-copy leaves rows that a re-ratification converges. */
    if (op === "ratify") {
      const body = await req.json().catch(() => null);
      if (!body?.bundleId || !body?.expectedSha || typeof body?.sig !== "string")
        return json({ ok: false, reason: "MALFORMED", detail: "ratify requires bundleId, expectedSha, and sig (armored SSH signature)" }, 400);

      const facts = (await (await stub.fetch(`http://do/gatefacts?id=${encodeURIComponent(body.bundleId)}`)).json()).result;
      if (!facts.ok) return json({ ...facts, store: storeName, tokenClass: cls }, 404);
      if (facts.row.bundle_sha !== body.expectedSha)
        return json({ ok: false, reason: "RATIFY_STALE",
                      detail: "the bundle has changed since it was reviewed; read it again and re-sign",
                      expected: facts.row.bundle_sha, got: body.expectedSha, store: storeName, tokenClass: cls }, 409);

      if (!facts.signers.length)
        return json({ ok: false, reason: "NO_SIGNERS",
                      detail: "no active registered signing keys; an admin must register a member key before anything can be ratified",
                      store: storeName, tokenClass: cls }, 409);
      const sv = await verifySshsig(body.sig, ratifyStatement(body.bundleId, body.expectedSha),
                                    NS_RATIFY, facts.signers.map((s) => s.key_b64));
      if (!sv.ok)
        return json({ ok: false, reason: "SIG_" + sv.reason,
                      ...(sv.keyB64 ? { keyB64: sv.keyB64 } : {}),
                      ...(sv.detail ? { detail: sv.detail } : {}),
                      store: storeName, tokenClass: cls }, 403);
      const attestor = facts.signers.find((s) => s.key_b64 === sv.keyB64);

      const image = (await (await stub.fetch(`http://do/image?id=${encodeURIComponent(body.bundleId)}`)).json()).result;
      const r2 = typeof env.CAPTURES?.head === "function";
      /* The catalog resolves references against the whole store, so it needs
         to know which identifiers exist. One cheap query rather than a probe
         per reference. */
      const known = new Set(((await (await stub.fetch("http://do/list")).json()).result || [])
        .map((b) => b.bundle_id));
      const gate = await runGate({
        bundleId: body.bundleId, image, knownIds: known,
        registers: facts.registers,
        hasCapture: async (sha) => {
          if (!r2) return { present: false, bytes: 0 };
          const h = await env.CAPTURES.head(`${storeName}/captures/${sha}`);
          return h ? { present: true, bytes: h.size } : { present: false, bytes: 0 };
        },
      });
      if (!gate.ok)
        return json({ ok: false, reason: "GATE_REFUSED", gateVersion: gate.gateVersion,
                      findings: gate.findings, store: storeName, tokenClass: cls }, 409);

      const shas = [];
      for (const [path, v] of Object.entries(image)) {
        if (path.startsWith("_history/")) continue;
        if (typeof v === "string") {
          const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)))]
            .map((x) => x.toString(16).padStart(2, "0")).join("");
          shas.push({ sha256: sha, path, kind: path === "bundle.md" ? "bundle" : "file",
                      bytes: new TextEncoder().encode(v).length, text: v });
        } else {
          shas.push({ sha256: v.blobSha, path, kind: "capture" });
        }
      }

      const pub = (await (await stub.fetch(new Request("http://do/publish", {
        method: "POST", body: JSON.stringify({
          bundleId: body.bundleId, bundleSha: body.expectedSha,
          attestorKey: sv.keyB64, attestorMember: attestor?.member_id ?? sessMember,
          gateVersion: gate.gateVersion, sigArmored: body.sig,
          shas: shas.map(({ text, ...s }) => s),
        }) }))).json()).result;
      if (!pub?.ok) return json({ ok: false, reason: "PUBLISH_FAILED", detail: pub, store: storeName, tokenClass: cls }, 500);

      /* The fence: ratified bytes land content-addressed in the published
         bucket, so the published corpus is self-contained. Existing keys
         are immutable and skipped; captures stream across from the working
         bucket where their presence was just gate-verified. */
      let copied = 0, present = 0, r2state = "not configured";
      if (typeof env.PUBLISHED?.put === "function" && r2) {
        r2state = "ok";
        for (const s of shas) {
          const key = `${storeName}/published/${s.sha256}`;
          if (await env.PUBLISHED.head(key)) { present++; continue; }
          if (s.kind === "capture") {
            const obj = await env.CAPTURES.get(`${storeName}/captures/${s.sha256}`);
            if (!obj) { r2state = "INCOMPLETE: capture vanished between gate and copy"; continue; }
            await env.PUBLISHED.put(key, obj.body);
          } else {
            await env.PUBLISHED.put(key, new TextEncoder().encode(s.text));
          }
          copied++;
        }
      }

      return json({ ok: true, bundleId: body.bundleId, bundleSha: body.expectedSha,
                    existed: pub.existed, ratifiedAt: pub.ratifiedAt,
                    attestor: attestor?.member_id ?? null, gateVersion: gate.gateVersion,
                    published: { shas: shas.length, copied, alreadyPresent: present, r2: r2state },
                    store: storeName, tokenClass: cls }, 200);
    }

    /* A few ops read better at the edge than they do inside the store, so
       the public name and the internal name differ. The map is the only
       place that difference lives. */
    const DO_PATH = { inbox: "inboxlist", memberlist: "memberlist", signerlist: "signerlist" };
    const inner = new URL("http://x/" + (DO_PATH[op] || op));
    for (const [k, v] of url.searchParams) if (k !== "token" && k !== "op") inner.searchParams.set(k, v);
    /* Authorship from a session is stamped by the server, never taken from
       the request: a browser cannot write history as someone else. */
    if (viaSession && op === "lease") inner.searchParams.set("actor", sessMember);
    let passBody = req.method === "POST" ? await req.text() : undefined;
    if (viaSession && op === "promote" && passBody) {
      try { const b = JSON.parse(passBody); b.author = sessMember; passBody = JSON.stringify(b); }
      catch { /* the DO will refuse the malformed body with its own words */ }
    }
    /* Who dispositioned a knock is part of the record. A session signs its
       own name; a machine credential says so plainly rather than borrowing
       a person's. */
    if (op === "inboxresolve" && passBody) {
      try {
        const b = JSON.parse(passBody);
        b.by = viaSession ? sessMember : `token:${cls}`;
        passBody = JSON.stringify(b);
      } catch { /* the DO will refuse the malformed body with its own words */ }
    }
    const res = await stub.fetch(new Request(inner, { method: req.method, body: passBody }));
    const body = await res.json();
    return json({ ...body, store: storeName, tokenClass: cls }, res.status);
  },
};
