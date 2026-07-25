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
import { isPublicHttpsLocator, parseFrontmatter, createSha256 } from "../checks/bio-checks.mjs";
import { timestampRequest, parseTimestampResponse, TSA_ENDPOINTS,
         TSA_CONTENT_TYPE, TSA_ACCEPT,
         ARCHIVE_SAVE_BASE, ARCHIVE_SERVICE, archiveLocatorFrom } from "./tsa.mjs";
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
 *
 * There is deliberately no public class. A credential handed to the public is
 * not a credential: to be public it must be widely distributed, and once
 * distributed it bounds nothing. It bought two ops and cost one real defect,
 * because the class existing invited op=index onto its list while op=index reads
 * the working corpus (D-30). The public surface is protected STRUCTURALLY
 * instead, by the classes:null ops below, each of which enforces its own gate
 * and answers only from the published projection. Safety comes from WHERE an op
 * reads, not from who holds a token.
 */

const OPS = {
  //  op          class allowed              mutating
  selftest:   { classes: ["admin", "member", "probe"],           mutating: false },
  livefire:   { classes: ["admin", "probe"],                     mutating: true  },
  /* op=index reads the `bundles` table, which is WORKING corpus, so it is not a
     published-scope read and the public class must not have it. A title is the
     leak that matters: it names what the group is looking into, and the state
     says how far along they are, both before there is anything to answer. The
     public surface for a listing is `publishedlist`, which reads the projection
     that has never held unratified material. Asserted in test/fence.test.mjs. */
  index:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* S-10 step 1. The metadata projection the retrieval surface filters and sorts
     on, including source.locator and source.authority, which Bob settled as
     searchable. Working corpus, so member class and above, never public: the
     same fence that governs op=index governs this. */
  projection: { classes: ["admin", "member", "probe"],           mutating: false },
  reproject:  { classes: ["admin", "probe"],                     mutating: true  },
  /* S-10 steps 2 to 4: the retrieval surface. It reads the WORKING corpus, so it
     is member class and above and never public, exactly like op=index and
     op=projection. There is no public token class to grant it to and there must
     never be one: a search result carries titles, states, locators and
     authorities, which together name what the group is looking into and how far
     along it is, before there is anything to answer.
     `viewer` is stamped below from the authenticated identity and a
     caller-supplied value is overwritten, because the D-15 visibility gate is
     only a gate if the caller cannot choose whose view it compiles. */
  search:     { classes: ["admin", "member", "probe"],           mutating: false },
  /* The vocabulary of the query language, so a UI builds its controls from the
     plane rather than from a copy that drifts. Working-corpus field names, so
     the same fence applies. */
  searchfields:{ classes: ["admin", "member", "probe"],          mutating: false },
  /* The verifier for "the index cannot diverge from the corpus": it re-derives
     the expected text row for every bundle and compares. Read-only. */
  searchindexcheck: { classes: ["admin", "member", "probe"],     mutating: false },
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
  /* Co-attestation. Asks a timestamp authority to attest that a capture existed
     at a claimed instant, which is the one part of provenance a group cannot
     fabricate for itself. */
  attest:     { classes: ["admin", "member", "probe"],           mutating: true  },
  /* The monitor. Checks whether a monitored source still serves what was
     captured and records the answer as a mechanical monitor-tick, inside the
     field set C-20.1 holds that operation to. */
  monitor:    { classes: ["admin", "member", "probe"],           mutating: true  },
  /* A conformance pass over the whole store, run inside the Durable Object where
     the images already are. Read-only, paginated, and resumable by cursor. */
  audit:      { classes: ["admin", "member", "probe"],           mutating: false },
  /* Write arc. Ratification's authority is the SSHSIG itself, checked
     against the registered signers; the token or session only reaches the
     surface. Member and signer administration is admin-only. Probe class
     reaches everything so the whole write arc is exercisable against
     scratch, whose Durable Object is a different instance with its own
     member tables, so scratch enrollment can never touch the live roster. */
  ratify:       { classes: ["admin", "member", "probe"],           mutating: true  },
  publishedlist:{ classes: ["admin", "member", "probe"],           mutating: false },
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
  member: new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "inbox", "inboxget", "inboxresolve", "audit"]),
  admin:  new Set(["promote", "lease", "allocid", "capture", "acquire", "attest", "monitor", "ratify",
                   "inbox", "inboxget", "inboxresolve", "audit",
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

      /* Streamed in parts, so peak residency is one part rather than the whole
         document. The 39.6MB budget book in the real record is the case that
         forced this: a Worker that must hold a document to hash it cannot
         capture the documents a city actually publishes.
         *
         * The incremental hasher is the CATALOG'S, the same one C-18.6 uses to
         * verify parts on the way back out. If the plane hashed the whole with
         * WebCrypto and the catalog rehashed the parts with its own
         * implementation, a disagreement between the two would look like
         * tampering. Using one hasher for both makes that class of false alarm
         * impossible.
         *
         * A single part under the inline bound stays a single capture, so the
         * common case is unchanged and the parts shape appears only when a
         * document actually needs it. */
      const PART = 8 * 1024 * 1024;
      const MAX = 256 * 1024 * 1024;
      const whole = createSha256();
      const parts = [];
      let total = 0, held = [], heldBytes = 0, oversize = false;

      const flush = async () => {
        if (!heldBytes) return;
        const buf = new Uint8Array(heldBytes);
        let at = 0; for (const c of held) { buf.set(c, at); at += c.length; }
        held = []; heldBytes = 0;
        const d = await crypto.subtle.digest("SHA-256", buf);
        const psha = [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
        if (!(await env.CAPTURES.head(`${storeName}/captures/${psha}`)))
          await env.CAPTURES.put(`${storeName}/captures/${psha}`, buf, { sha256: d });
        parts.push({ sha256: psha, bytes: buf.length });
      };

      const reader = res.body && res.body.getReader ? res.body.getReader() : null;
      if (!reader) return json({ ok: false, reason: "NO_BODY", locator }, 502);
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > MAX) { oversize = true; break; }
        whole.update(value);
        held.push(value); heldBytes += value.length;
        if (heldBytes >= PART) await flush();
      }
      if (oversize) {
        try { await reader.cancel(); } catch { /* the source may already be gone */ }
        return json({ ok: false, reason: "TOO_LARGE", bytes: total, maxBytes: MAX,
                      detail: "the document exceeds what this surface will capture even in parts" }, 413);
      }
      await flush();
      if (total === 0) return json({ ok: false, reason: "EMPTY", locator }, 502);
      const sha = whole.hex();

      /* One part and small enough to be a plain capture: store the whole under
         its own hash so the ordinary single-file shape still applies. */
      let existed = false, multipart = parts.length > 1;
      if (!multipart) {
        const only = parts[0];
        if (only.sha256 !== sha) {
          /* Cannot happen: one part IS the whole. Asserted rather than assumed,
             because a mismatch here would mean the incremental hasher and
             WebCrypto disagree, and that would be worth knowing loudly. */
          return json({ ok: false, reason: "HASH_DISAGREEMENT",
                        detail: "the incremental hash and the block hash of the same bytes differ" }, 500);
        }
        existed = !!(await env.CAPTURES.head(`${storeName}/captures/${sha}`));
      }

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
            method: multipart
              ? `bio-plane acquire, https fetch, streamed in ${parts.length} parts, hashed at receipt`
              : "bio-plane acquire, https fetch, hashed at receipt",
            grade: "B",
            actor_class: viaSession ? "member" : (cls === "probe" ? "session" : "daemon"),
            /* Over the reassembled whole, which is what C-18.1 requires of a
               parted document and what C-18.6 checks by streaming the parts. */
            sha256: sha, encoding: "binary", bytes: total,
            ...(ct ? { content_type: ct } : {}),
          },
          ...(multipart ? { parts: parts.map((p, i) => ({
            file: `snapshots/${name}.part${String(i).padStart(3, "0")}`,
            sha256: p.sha256, bytes: p.bytes })) } : {}),
          origin: { kind: body.matchedSweep ? "sweep" : "named_request",
                    ...(body.matchedSweep ? { matched_sweep: body.matchedSweep, deeming_actor: sessMember || cls } : {}) },
          attestation_attempts: [],
        },
        ...(multipart ? { parts: parts.length } : {}),
        note: "Grade B: bytes as fetched, hashed at receipt. Grade A needs a chain-of-custody web archive, which this surface cannot produce. Co-attestation raises B toward evidentiary weight.",
        store: storeName, tokenClass: cls,
      }, 200);
    }

    /* Co-attestation over a capture hash.
     *
     * The doctrine's asymmetry: a self-recorded hash proves integrity since
     * capture and nothing about origin, because it is the group attesting to
     * itself. A timestamp token is issued by somebody the group does not
     * control, so it proves the capture EXISTED at the claimed instant, which
     * is the part an attacker holding a write token cannot forge.
     *
     * Every attempt is recorded, successes and failures alike, in the shape
     * C-18.1 requires. The doctrine is explicit that a failed attempt is
     * recorded with its reason and never omitted: a provenance register showing
     * no attempt and one showing an attempt that failed are different claims,
     * and collapsing them would let an absence read as a success.
     */
    if (op === "attest") {
      if (req.method !== "POST") return json({ ok: false, error: "attest is a POST" }, 405);
      if (typeof env.CAPTURES?.put !== "function")
        return json({ ok: false, error: "this instance has no evidence storage configured" }, 503);
      const body = await req.json().catch(() => null);
      const sha = typeof body?.sha256 === "string" ? body.sha256.toLowerCase() : "";
      if (!/^[0-9a-f]{64}$/.test(sha))
        return json({ ok: false, reason: "BAD_SHA", detail: "attest takes the sha256 of a capture already in the store" }, 400);
      if (!(await env.CAPTURES.head(`${storeName}/captures/${sha}`)))
        return json({ ok: false, reason: "NO_SUCH_CAPTURE",
                      detail: "nothing in this store has that hash; capture the document before attesting it" }, 404);

      const attempts = [];
      let token = null, tokenSha = null, service = null;
      for (const endpoint of TSA_ENDPOINTS) {
        const attempted = new Date().toISOString().split(".")[0] + "Z";
        try {
          const { der } = timestampRequest(sha);
          const res = await fetch(endpoint, {
            method: "POST", body: der,
            headers: { "content-type": TSA_CONTENT_TYPE, accept: TSA_ACCEPT },
          });
          if (!res.ok) {
            attempts.push({ service: endpoint, attempted, ok: false, note: `http ${res.status}` });
            continue;
          }
          const parsed = parseTimestampResponse(new Uint8Array(await res.arrayBuffer()), sha);
          if (!parsed.ok) {
            attempts.push({ service: endpoint, attempted, ok: false, note: parsed.reason });
            continue;
          }
          const digest = await crypto.subtle.digest("SHA-256", parsed.token);
          tokenSha = [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
          await env.CAPTURES.put(`${storeName}/captures/${tokenSha}`, parsed.token, { sha256: digest });
          token = parsed.token; service = endpoint;
          attempts.push({ service: endpoint, attempted, ok: true, kind: "rfc3161",
                          token_sha256: tokenSha, token_bytes: parsed.token.length });
          break;
        } catch (e) {
          attempts.push({ service: endpoint, attempted, ok: false, note: String(e && e.message || e).slice(0, 120) });
        }
      }

      /* The opt-in second path. Off unless the caller asks, because asking a
         public archive to fetch a URL publishes the fact of interest, and that
         is a tactical judgement rather than a default. */
      let archive = null;
      if (body.archive === true) {
        const attempted = new Date().toISOString().split(".")[0] + "Z";
        const locator = typeof body.locator === "string" ? body.locator : "";
        if (!isPublicHttpsLocator(locator)) {
          attempts.push({ service: ARCHIVE_SERVICE, attempted, ok: false,
                          note: "no public https locator to archive" });
        } else {
          try {
            const res = await fetch(ARCHIVE_SAVE_BASE + locator, { redirect: "follow" });
            const archived = archiveLocatorFrom(res, locator);
            if (res.ok && archived) {
              archive = { service: ARCHIVE_SERVICE, locator: archived };
              attempts.push({ service: ARCHIVE_SERVICE, attempted, ok: true,
                              kind: "co-archive", archived_locator: archived });
            } else {
              attempts.push({ service: ARCHIVE_SERVICE, attempted, ok: false,
                              note: res.ok ? "archived but returned no locator" : `http ${res.status}` });
            }
          } catch (e) {
            attempts.push({ service: ARCHIVE_SERVICE, attempted, ok: false,
                            note: String(e && e.message || e).slice(0, 120) });
          }
        }
      }

      return json({
        ok: !!token,
        attempts,
        ...(archive ? { archive } : {}),
        ...(token ? {
          attestation: {
            file: `snapshots/timestamp-${tokenSha.slice(0, 12)}.tsr`,
            kind: "rfc3161", service, sha256: tokenSha, bytes: token.length,
            over: sha,
          },
          note: "A trusted timestamp over the capture hash. Anyone can check it with openssl ts -verify against the authority's certificate; this plane obtains and stores it, and does not claim to have verified the signature.",
        } : {
          reason: "NO_ATTESTATION",
          note: "Every attempt was recorded. A register showing a failed attempt and one showing no attempt are different claims, so the failures above belong in the document rather than being dropped.",
        }),
        store: storeName, tokenClass: cls,
      }, token ? 200 : 502);
    }

    /* Monitoring: has the source changed under us?
     *
     * What this writes is deliberately narrow. MECHANICAL_FIELD_SETS lets a
     * monitor-tick touch source_status, monitoring.last_checked, the three
     * reeval_pending fields, and last_updated. It may not record the new
     * document's hash, and that absence is the design rather than an oversight:
     * detecting that a source moved is mechanical, deciding what the new version
     * means is not. So the tick raises a flag and a human or a session decides
     * whether to capture the new bytes. This is the escalation ladder in one
     * operation.
     *
     * It writes through promote like every other writer, marked mechanical, so
     * C-20.1 audits it from the history diff rather than taking its word.
     */
    if (op === "monitor") {
      if (req.method !== "POST") return json({ ok: false, error: "monitor is a POST" }, 405);
      const body = await req.json().catch(() => null);
      const bundleId = body?.bundleId;
      if (typeof bundleId !== "string" || !bundleId)
        return json({ ok: false, error: "monitor needs a bundleId" }, 400);

      const stub0 = env.STORE.get(env.STORE.idFromName(storeName));
      const img = (await (await stub0.fetch(`http://do/image?id=${encodeURIComponent(bundleId)}`)).json()).result;
      if (!img || typeof img["bundle.md"] !== "string")
        return json({ ok: false, reason: "ABSENT", bundleId }, 404);
      const live = img["bundle.md"];
      const fm = parseFrontmatter(live).data || {};
      if (!fm.monitoring || fm.monitoring.enabled !== true)
        return json({ ok: false, reason: "NOT_MONITORED",
                      detail: "this bundle does not ask to be monitored" }, 409);
      const locator = fm.source?.locator;
      if (typeof locator !== "string" || !isPublicHttpsLocator(locator))
        return json({ ok: false, reason: "NO_LOCATOR",
                      detail: "monitoring needs a public https locator in source.locator" }, 409);

      /* The baseline is whatever the provenance register says was captured from
         this locator. Without one there is nothing to compare against, and the
         tick says so rather than guessing at a status. */
      let baseline = null;
      try {
        const reg = JSON.parse(img["data/provenance.json"] || "{}");
        const match = (reg.documents || []).find((d) => d && d.locator === locator);
        baseline = match?.capture?.sha256 || null;
      } catch { /* C-14.3 reports unparsable JSON; monitoring just has no baseline */ }

      const checked = new Date().toISOString().split(".")[0] + "Z";
      let status = null, note = null, seen = null;
      try {
        const res = await fetch(locator, { redirect: "follow", headers: { "user-agent": "bio-monitor" } });
        if (res.status === 404 || res.status === 410) { status = "removed"; note = `the source answered ${res.status}`; }
        else if (!res.ok) { note = `the source answered ${res.status}`; }
        else {
          const bytes = new Uint8Array(await res.arrayBuffer());
          const d = await crypto.subtle.digest("SHA-256", bytes);
          seen = [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
          if (!baseline) note = "no captured baseline to compare against; recorded the check only";
          else if (seen === baseline) { status = "unchanged"; note = "the source still serves the captured bytes"; }
          else { status = "modified"; note = "the source no longer serves the captured bytes"; }
        }
      } catch (e) {
        note = "the source could not be reached: " + String(e && e.message || e).slice(0, 90);
      }

      /* Rewrite ONLY the permitted fields, line by line, so nothing else can
         move by accident. A mechanical writer that rebuilt the document from a
         parse would reformat it, and reformatting is a change. */
      const flags = status === "modified" || status === "removed";
      const out = [];
      let fence = 0, inMon = false, inRe = false;
      for (const line of live.split("\n")) {
        if (line === "---" && fence < 2) { fence++; inMon = inRe = false; out.push(line); continue; }
        if (fence === 1) {
          if (/^[a-zA-Z_]/.test(line)) { inMon = /^monitoring:/.test(line); inRe = /^reeval_pending:/.test(line); }
          if (status && /^source_status:/.test(line)) { out.push("source_status: " + status); continue; }
          if (/^last_updated:/.test(line)) { out.push("last_updated: " + checked); continue; }
          if (inMon && /^\s+last_checked:/.test(line)) { out.push("  last_checked: " + checked); continue; }
          if (inRe && flags && /^\s+flag:/.test(line)) { out.push("  flag: true"); continue; }
          if (inRe && flags && /^\s+since:/.test(line)) { out.push("  since: " + checked); continue; }
          if (inRe && flags && /^\s+source:/.test(line)) { out.push("  source: source_status"); continue; }
        }
        out.push(line);
      }
      let text = out.join("\n");
      if (!/^\s+last_checked:/m.test(text) && /^monitoring:/m.test(text))
        text = text.replace(/^monitoring:/m, "monitoring:\n  last_checked: " + checked);

      /* The Session Log is the one body surface a mechanical writer may add to,
         and C-13.2 requires an entry whenever last_updated moves. */
      const entry = "### Session " + checked + "\n\nMonitor tick: " + (note || "checked") + "\n";
      const at = text.indexOf("## Session Log");
      if (at < 0) text += "\n## Session Log\n\n" + entry;
      else {
        const nxt = text.indexOf("\n## ", at + 1);
        const cut = nxt === -1 ? text.length : nxt + 1;
        text = text.slice(0, cut) + entry + "\n" + text.slice(cut);
      }

      const carried = [];
      for (const [path, v] of Object.entries(img)) {
        if (path === "bundle.md" || path.startsWith("_history/")) continue;
        if (typeof v === "string") {
          const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
          carried.push({ path, text: v, bytes: v.length,
                         sha256: [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("") });
        } else carried.push({ path, blobSha: v.blobSha, sha256: v.sha256, bytes: v.bytes });
      }
      const liveSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(live)))]
        .map((x) => x.toString(16).padStart(2, "0")).join("");
      const textSha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)))]
        .map((x) => x.toString(16).padStart(2, "0")).join("");
      const stamp = checked.replace(/[-:]/g, "") + "_" +
        [...crypto.getRandomValues(new Uint8Array(4))].map((x) => x.toString(16).padStart(2, "0")).join("");

      const promoted = await (await stub0.fetch("http://do/promote", { method: "POST", body: JSON.stringify({
        bundleId, base: liveSha, snapKey: stamp, author: "bio-monitor",
        writer: "mechanical", operation: "monitor-tick",
        meta: { object_type: fm.object_type, group: fm.group || "believe-in-oakland",
                title: fm.title, current_state: fm.current_state, prior_state: fm.prior_state ?? null,
                created: fm.created, last_updated: checked },
        /* Every OTHER file carried forward untouched. promote writes a whole
           image, so a writer that mentions one file deletes the rest: the first
           version of this tick removed the provenance register, which took the
           monitoring baseline with it and left an information@2 bundle with no
           register at all. A mechanical writer silently destroying evidence is
           the worst thing in this system, and the shape of promote made it the
           DEFAULT behaviour of a careless caller. */
        files: [
          { path: "bundle.md", text, bytes: text.length, sha256: textSha },
          ...carried,
        ],
        register: [],
      }) })).json();

      return json({
        ok: !!promoted.result?.ok,
        checked, status, note, baseline, seen,
        reeval_raised: flags,
        ...(promoted.result?.ok ? { revision: promoted.result.bundleSha } : { reason: promoted.result?.reason, detail: promoted.result?.detail }),
        note2: "A tick records that the source moved. It does not capture the new version: what a change MEANS is not a mechanical judgement.",
        store: storeName, tokenClass: cls,
      }, promoted.result?.ok ? 200 : 409);
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
    /* D-15: whose view a query compiles for is decided by the SERVER, from the
       credential that authenticated, and set AFTER the caller's parameters were
       copied so a caller-supplied `viewer` is overwritten rather than honoured.
       The gate is flat member scope today and returns true for a member; when
       projects and positions land it returns a real predicate and this is still
       the only place the identity comes from. A viewer the compiler does not
       recognise compiles to a deny predicate, so the failure mode of a missing
       stamp is an empty result rather than an unfiltered one. */
    if (op === "search") inner.searchParams.set("viewer", viaSession ? `member:${sessMember}` : `class:${cls}`);
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
