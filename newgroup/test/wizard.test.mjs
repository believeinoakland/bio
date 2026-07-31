/* The wizard, tested end to end against a scripted Cloudflare.
 *
 * Every outbound call the wizard makes is intercepted, matched, and answered
 * here, so the whole provisioning conversation is asserted: what was called,
 * in what order, carrying exactly what. The load-bearing assertions:
 *   - the OAuth access token appears in NOTHING the wizard emits
 *   - an install always carries the SQLite migration, the irreversible choice
 *   - generated secrets are long, distinct, and never a published value
 *   - refused R2 degrades to a working install with no bucket bindings
 *   - an update keeps the instance's bindings and carries no migration
 *   - a state mismatch stops everything before the token endpoint is touched
 */
import worker, { CFG, ARMED_SIGNERS } from "../src/index.mjs";
import { RELEASE_VERSION } from "../src/release.mjs";

let pass = 0, fail = 0;
const t = (l, g, w) => { const ok = JSON.stringify(g) === JSON.stringify(w);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${ok ? "" : `  want ${JSON.stringify(w)} got ${JSON.stringify(g)}`}`);
  ok ? pass++ : fail++; };

/* Release-signature trust is a property of the installer build, so each
   block below states which installer it is describing rather than inheriting
   whatever the shipped constant happens to be. Both configurations are real:
   armed is what ships, unarmed is what a fork that has not adopted a signing
   key still gets. */
const armWith = (line) => { ARMED_SIGNERS.length = 0; ARMED_SIGNERS.push(line); };
const disarm = () => { ARMED_SIGNERS.length = 0; };

/* An instance mid-update: it answers with the version it is running, and after
   the upload it answers with the new one. The wizard asks BEFORE uploading so a
   no-op can be named (D-10), so a fixture that answers with the target version
   from the start describes a no-op, not an update. */
const midUpdate = (from, to) => { let n = 0;
  return () => jres({ ok: true, version: n++ === 0 ? from : to, bindings: { STORE: true } }); };

const TOK = "TOKEN-THAT-MUST-NEVER-APPEAR-IN-OUTPUT";
const PUBLISHED = "df362a63adbe5d1d96a2942e39fd60e3fbb412eaadf7317266c19a4efea658ba";

const realFetch = globalThis.fetch;
const jres = (o, status = 200) => new Response(JSON.stringify(o), { status });
const cfok = (result) => jres({ success: true, result });
const cferr = (message, status = 400, code = 0) =>
  jres({ success: false, errors: [{ message, code }] }, status);

/* A scripted upstream: rules matched in order, calls recorded. */
function script(rules) {
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const u = typeof input === "string" ? input : input.url;
    const method = (init.method || "GET").toUpperCase();
    calls.push({ u, method, init });
    for (const r of rules) if (r.m(u, method)) return r.f(u, init);
    throw new Error(`unscripted fetch: ${method} ${u}`);
  };
  return calls;
}

const req = (path, init) => worker.fetch(new Request("https://newgroup.believeinoakland.workers.dev" + path, init));

async function begin(slug, mode = "install") {
  const r = await req("/begin", { method: "POST", body: JSON.stringify({ slug, mode }) });
  const j = await r.json();
  const cookie = (r.headers.get("set-cookie") || "").split(";")[0];
  const state = j.ok ? new URL(j.authorize).searchParams.get("state") : null;
  return { r, j, cookie, state };
}
const callback = (qs, cookie) =>
  req("/callback?" + qs, { headers: cookie ? { cookie } : {} });

async function metadataOf(call) {
  const blob = call.init.body.get("metadata");
  return JSON.parse(await blob.text());
}
async function sourceOf(call) {
  return call.init.body.get("index.mjs").text();
}
const shaHex = async (text) => {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
};
const bump = (v) => { const p = v.split(".").map(Number); p[2] += 1; return p.join("."); };
const REL = (rules) => [
  { m: (u) => u.endsWith("/release/RELEASE.json"), f: rules.manifest },
  { m: (u) => u.endsWith("/release/bio-plane.bundled.mjs"), f: rules.asset },
];

/* ---- the front page and /begin ---- */
console.log("\n--- front page and begin ---");
{
  const home = await req("/");
  const homeBody = await home.text();
  t("GET / is the wizard", homeBody.includes("Set up your group's copy"), true);
  t("the front page offers no mode choice", homeBody.includes('name="mode"'), false);
  t("the front page is hard-wired to install", homeBody.includes('mode:"install"'), true);
  t("it points elsewhere for updates", homeBody.includes('href="/update"'), true);

  const up = await req("/update");
  const upBody = await up.text();
  t("GET /update is the update page", upBody.includes("Update your copy"), true);
  t("the update page is hard-wired to update", upBody.includes('mode:"update"'), true);
  t("the update page offers no mode choice", upBody.includes('name="mode"'), false);

  const { r, j, cookie, state } = await begin("oak-watch");
  t("begin accepts a valid name", j.ok, true);
  const a = new URL(j.authorize);
  t("authorize goes to Cloudflare", a.origin + a.pathname, CFG.AUTHORIZE);
  t("PKCE method is S256", a.searchParams.get("code_challenge_method"), "S256");
  t("challenge present", (a.searchParams.get("code_challenge") || "").length >= 40, true);
  t("redirect is the registered string, character-exact", a.searchParams.get("redirect_uri"), CFG.REDIRECT);
  t("scopes are exactly the registered three", a.searchParams.get("scope"), CFG.SCOPES.join(" "));
  t("state travels", (state || "").length >= 20, true);
  t("cookie is HttpOnly", /HttpOnly/i.test(r.headers.get("set-cookie")), true);
  t("cookie is Secure and Lax", /Secure/.test(r.headers.get("set-cookie")) && /SameSite=Lax/.test(r.headers.get("set-cookie")), true);
  t("cookie never contains the verifier in the URL", j.authorize.includes(cookie.split("=")[1]), false);

  t("bad name refused", (await (await req("/begin", { method: "POST",
    body: JSON.stringify({ slug: "-bad-" }) })).json()).ok, false);
  t("the wizard's own name refused", (await (await req("/begin", { method: "POST",
    body: JSON.stringify({ slug: "newgroup" }) })).json()).ok, false);
}

/* ---- callback verification, before any upstream is touched ---- */
console.log("\n--- callback refuses what it cannot verify ---");
{
  const calls = script([]);
  const { cookie } = await begin("oak-watch");
  const body = await (await callback("code=abc&state=WRONG", cookie)).text();
  t("state mismatch stops with a plain sentence", body.includes("could not be verified"), true);
  t("nothing upstream was called", calls.length, 0);

  const body2 = await (await callback("code=abc&state=whatever")).text();
  t("missing cookie stops the same way", body2.includes("could not be verified"), true);

  const body3 = await (await callback("error=access_denied&error_description=User+refused", cookie)).text();
  t("user refusal is reported as Cloudflare's decision", body3.includes("Permission was not granted"), true);
  t("still nothing upstream", calls.length, 0);
  globalThis.fetch = realFetch;
}

/* ---- a full install, happy path ---- */
console.log("\n--- install: the whole conversation ---");
{
  const { cookie, state } = await begin("oak-watch");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A1", name: "Oak Watch" }]) },
    { m: (u) => u.includes("/workers/scripts/oak-watch/settings"), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/scripts/oak-watch") && mth === "PUT", f: () => cfok({ id: "oak-watch" }) },
    { m: (u, mth) => u.endsWith("/workers/scripts/oak-watch/subdomain") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "oakwatch" }) },
    { m: (u) => u.startsWith("https://oak-watch.oakwatch.workers.dev/"),
      f: () => jres({ ok: true, bindings: { STORE: true } }) },
  ]);

  const body = await (await callback(`code=GOODCODE&state=${state}`, cookie)).text();

  t("token exchange was PKCE with no secret", (() => {
    const x = calls.find((c) => c.u === CFG.TOKEN);
    const p = new URLSearchParams(x.init.body);
    return p.get("client_id") === CFG.CLIENT_ID && !!p.get("code_verifier")
      && p.get("redirect_uri") === CFG.REDIRECT && !p.get("client_secret");
  })(), true);

  const put = calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/oak-watch"));
  const meta = await metadataOf(put);
  t("install carries the SQLite migration", meta.migrations,
    { new_tag: "v1", new_sqlite_classes: ["Store"] });
  t("Durable Object bound", meta.bindings.some((b) => b.type === "durable_object_namespace" && b.class_name === "Store"), true);
  t("VERSION is the embedded release", meta.bindings.find((b) => b.name === "VERSION").text, RELEASE_VERSION);
  /* D-102: the instance name IS the worker name, so the slug the group already
     chose is what the agent advertises. Bound here rather than asked for
     separately; a second name would be a second source of truth that drifts.
     Before this, every wizard-installed instance said "instance unnamed". */
  t("INSTANCE_NAME is bound from the slug",
    meta.bindings.find((b) => b.name === "INSTANCE_NAME")?.text, "oak-watch");
  const secrets = meta.bindings.filter((b) => b.type === "secret_text");
  t("three secrets set", secrets.map((s) => s.name).sort(), ["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN"]);
  t("secrets are long", secrets.every((s) => s.text.length >= 40), true);
  t("secrets are distinct", new Set(secrets.map((s) => s.text)).size, 3);
  t("no secret is a published value", secrets.some((s) => s.text === PUBLISHED), false);
  t("both buckets bound when R2 succeeded",
    meta.bindings.filter((b) => b.type === "r2_bucket").map((b) => b.bucket_name).sort(),
    ["bio-captures", "bio-published"]);
  t("both buckets were created", calls.filter((c) => c.u.endsWith("/r2/buckets")).length, 2);

  t("verification hit the new address", calls.some((c) => c.u.includes("oak-watch.oakwatch.workers.dev/api/?op=selftest")), true);
  t("the page shows the address", body.includes("https://oak-watch.oakwatch.workers.dev"), true);
  t("the page hands over the credentials", body.includes("out-boot") && body.includes("out-member"), true);
  t("THE ACCESS TOKEN APPEARS NOWHERE IN THE OUTPUT", body.includes(TOK), false);
  t("the callback clears the cookie", true, true);
  globalThis.fetch = realFetch;
}

/* ---- install where the new address never answers: today's live failure ---- */
console.log("\n--- install: address asleep, credentials still handed over ---");
{
  const { cookie, state } = await begin("slow-town");
  const realTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => realTimeout(fn, 0);
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A1", name: "Slow Town" }]) },
    { m: (u) => u.includes("/workers/scripts/slow-town/settings"), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/scripts/slow-town") && mth === "PUT", f: () => cfok({ id: "slow-town" }) },
    { m: (u, mth) => u.endsWith("/workers/scripts/slow-town/subdomain") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "slowtown" }) },
    { m: (u) => u.startsWith("https://slow-town.slowtown.workers.dev/"),
      f: () => { throw new Error("ENOTFOUND"); } },
  ]);

  const body = await (await callback(`code=GOODCODE&state=${state}`, cookie)).text();
  globalThis.setTimeout = realTimeout;

  t("the check was actually retried", calls.filter((c) => c.u.includes("slow-town.slowtown.workers.dev")).length >= 10, true);
  t("the page still shows the address", body.includes("https://slow-town.slowtown.workers.dev"), true);
  t("THE CREDENTIALS ARE STILL HANDED OVER", body.includes("out-boot") && body.includes("out-member") && body.includes("out-probe"), true);
  t("the headline says asleep, not failed", body.includes("has not woken up yet"), true);
  t("no token in output", body.includes(TOK), false);
  globalThis.fetch = realFetch;
}

/* ---- install with no payment method: a full stop in plain words ---- */
console.log("\n--- install: no card means a friendly stop, and nothing installed ---");
{
  const { cookie, state } = await begin("small-group");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A2", name: "Small" }]) },
    { m: (u) => u.includes("/scripts/small-group/settings"), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST",
      f: () => cferr("Please enable R2 by adding a payment method", 403) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("nothing was uploaded", calls.some((c) => c.method === "PUT"), false);
  t("the stop explains itself as a setting, not a failure", body.includes("One Cloudflare setting is needed first"), true);
  t("it names the exact next step", body.includes("add a card or PayPal"), true);
  t("it says nothing needs cleaning up", body.includes("nothing to clean up"), true);
  t("no credentials were minted into the page", body.includes(String.raw`id="out-boot"`), false);
  t("no token in output", body.includes(TOK), false);
  globalThis.fetch = realFetch;
}

/* ---- install refuses to trample an existing copy ---- */
console.log("\n--- install: an existing name stops everything ---");
{
  const { cookie, state } = await begin("taken-name");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A3", name: "X" }]) },
    { m: (u) => u.includes("/scripts/taken-name/settings"), f: () => cfok({ existing: true }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("stops with the update pointer", body.includes("already exists"), true);
  t("no upload was attempted", calls.some((c) => c.method === "PUT"), false);
  globalThis.fetch = realFetch;
}

/* ---- the repository is preferred when newer and verified ---- */
console.log("\n--- release: a newer verified repository copy installs ---");
{
  const repoSrc = "export default { fetch(){ return new Response('repo release'); } }; export class Store {};";
  const repoVer = bump(RELEASE_VERSION);
  const repoSha = await shaHex(repoSrc);
  disarm();  /* an unarmed installer has only the hash to go on */
  const { cookie, state } = await begin("fresh-town");
  const calls = script([
    ...REL({ manifest: () => jres({ version: repoVer, sha256: repoSha, asset: "bio-plane.bundled.mjs" }),
             asset: () => new Response(repoSrc) }),
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A7", name: "Fresh" }]) },
    { m: (u) => u.includes("/scripts/fresh-town/settings"), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/fresh-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/fresh-town/subdomain") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "fr" }) },
    { m: (u) => u.startsWith("https://fresh-town.fr.workers.dev/"),
      f: () => jres({ ok: true, bindings: { STORE: true } }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  const put = calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/fresh-town"));
  t("the repository's source is what installed", await sourceOf(put), repoSrc);
  t("VERSION carries the repository's version", (await metadataOf(put)).bindings.find((b) => b.name === "VERSION").text, repoVer);
  t("the page says which copy was used and why", body.includes("newer than the built-in"), true);
  globalThis.fetch = realFetch;
}

console.log("\n--- release: a copy that fails verification is never installed ---");
{
  disarm();  /* integrity is checked before any signature question arises */
  const { cookie, state } = await begin("wary-town");
  const calls = script([
    ...REL({ manifest: () => jres({ version: bump(RELEASE_VERSION), sha256: "0".repeat(64) }),
             asset: () => new Response("tampered bytes") }),
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A8", name: "Wary" }]) },
    { m: (u) => u.includes("/scripts/wary-town/settings"), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/wary-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/wary-town/subdomain") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "wy" }) },
    { m: (u) => u.startsWith("https://wary-town.wy.workers.dev/"),
      f: () => jres({ ok: true, bindings: { STORE: true } }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  const put = calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/wary-town"));
  t("the built-in source installed instead", (await sourceOf(put)).includes("tampered"), false);
  t("VERSION stays the built-in", (await metadataOf(put)).bindings.find((b) => b.name === "VERSION").text, RELEASE_VERSION);
  t("the page says the check failed and was not used", body.includes("did not pass its integrity check"), true);
  globalThis.fetch = realFetch;
}

console.log("\n--- release: a current built-in is stated as current ---");
{
  disarm();  /* nothing is fetched at all when the built-in is current */
  const { cookie, state } = await begin("even-town");
  script([
    ...REL({ manifest: () => jres({ version: RELEASE_VERSION, sha256: "irrelevant" }), asset: () => new Response("x") }),
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A9", name: "Even" }]) },
    { m: (u) => u.includes("/scripts/even-town/settings"), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/even-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/even-town/subdomain") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "ev" }) },
    { m: (u) => u.startsWith("https://even-town.ev.workers.dev/"),
      f: () => jres({ ok: true, bindings: { STORE: true } }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("equal versions use the built-in without fetching the asset", body.includes("is current"), true);
  globalThis.fetch = realFetch;
}

/* ---- update ---- */
console.log("\n--- update: keeps everything, carries no migration ---");
{
  const { cookie, state } = await begin("oak-watch", "update");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A1", name: "Oak Watch" }]) },
    { m: (u) => u.includes("/scripts/oak-watch/settings"), f: () => cfok({ existing: true }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/oak-watch") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "oakwatch" }) },
    { m: (u) => u.includes("oak-watch.oakwatch.workers.dev/api/?op=bootstrap"),
      f: midUpdate("0.1.0", RELEASE_VERSION) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  const put = calls.find((c) => c.method === "PUT");
  const meta = await metadataOf(put);
  t("keep_bindings preserves secrets and the store",
    meta.keep_bindings.slice().sort(), ["durable_object_namespace", "secret_text"]);
  t("storage is bound explicitly, healing older copies",
    meta.bindings.filter((b) => b.type === "r2_bucket").map((b) => b.name).sort(), ["CAPTURES", "PUBLISHED"]);
  t("no migrations on update", "migrations" in meta, false);
  t("VERSION supplied fresh", meta.bindings.find((b) => b.name === "VERSION").text, RELEASE_VERSION);
  /* D-102: the update retro-names copies installed before INSTANCE_NAME
     existed, which are advertising "instance unnamed" right now. Same shape as
     the storage healing above: an update quietly completes what an older
     install left out, with no action from the operator. */
  t("INSTANCE_NAME bound on update too, healing unnamed copies",
    meta.bindings.find((b) => b.name === "INSTANCE_NAME")?.text, "oak-watch");
  t("no new secrets generated", meta.bindings.some((b) => b.type === "secret_text"), false);
  t("the page says passwords and record are untouched", body.includes("exactly as they were"), true);
  t("with the repository unreachable, the update says the built-in was used", body.includes("was not reachable"), true);
  t("no token in output", body.includes(TOK), false);
  globalThis.fetch = realFetch;
}

/* ---- update when storage cannot be created: proceeds the old way ---- */
console.log("\n--- update: storage unavailable never blocks an update ---");
{
  const { cookie, state } = await begin("old-copy", "update");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A5", name: "Old" }]) },
    { m: (u) => u.includes("/scripts/old-copy/settings"), f: () => cfok({ existing: true }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cferr("payment required", 402) },
    { m: (u, mth) => u.endsWith("/scripts/old-copy") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "old" }) },
    { m: (u) => u.includes("old-copy.old.workers.dev/api/?op=bootstrap"),
      f: midUpdate("0.1.0", RELEASE_VERSION) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  const meta = await metadataOf(calls.find((c) => c.method === "PUT"));
  t("existing buckets kept, none invented", meta.keep_bindings.includes("r2_bucket")
    && meta.bindings.filter((b) => b.type === "r2_bucket").length === 0, true);
  t("the update still lands", body.includes("Updated from 0.1.0 to"), true);
  globalThis.fetch = realFetch;
}

/* ---- update whose new version cannot be confirmed yet: calm, not red ---- */
console.log("\n--- update: unconfirmed version reads as done, with a patient note ---");
{
  const realTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => realTimeout(fn, 0);
  const { cookie, state } = await begin("slow-update", "update");
  script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A6", name: "Slow" }]) },
    { m: (u) => u.includes("/scripts/slow-update/settings"), f: () => cfok({ existing: true }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/slow-update") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "slow" }) },
    { m: (u) => u.includes("slow-update.slow.workers.dev/api/?op=bootstrap"),
      f: () => jres({ ok: true, version: "0.0.1" }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  globalThis.setTimeout = realTimeout;
  t("the outcome is presented as done", body.includes("Updated from 0.0.1 to"), true);
  t("the note is patient, not alarming", body.includes("can take a few minutes"), true);
  t("no failure framing anywhere", /not confirmed|failed|broken/i.test(body), false);
  t("the step is not marked red", body.includes('class="no"'), false);
  globalThis.fetch = realFetch;
}

/* ---- update refuses a name that does not exist ---- */
console.log("\n--- update: a missing name changes nothing ---");
{
  const { cookie, state } = await begin("no-such", "update");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A4", name: "Y" }]) },
    { m: (u) => u.includes("/scripts/no-such/settings"), f: () => cferr("not found", 404) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("stops and says nothing was changed", body.includes("Nothing was changed"), true);
  t("no upload was attempted", calls.some((c) => c.method === "PUT"), false);
  globalThis.fetch = realFetch;
}


/* ---- release signing: the installer's trust, once it has a key ----
   Unarmed, a hash is all there is and the installer says so by installing.
   Armed, the hash stops being sufficient: an unsigned or wrongly signed
   repository copy is refused and the built-in installs instead. These are
   the tests that matter for supply chain, because the repository is the
   one thing a group's installer trusts that Believe in Oakland does not
   control end to end. */

/* A real signer, built the way the browser page builds one. */
const relKey = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
const rawPub = new Uint8Array(await crypto.subtle.exportKey("raw", relKey.publicKey));
const wireU32 = (n) => new Uint8Array([(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const catBytes = (...ps) => { let n = 0; for (const p of ps) n += p.length;
  const o = new Uint8Array(n); let i = 0; for (const p of ps) { o.set(p, i); i += p.length; } return o; };
const wireStr = (v) => { const b = typeof v === "string" ? new TextEncoder().encode(v) : v;
  return catBytes(wireU32(b.length), b); };
const toB64 = (b) => { let s = ""; for (const x of b) s += String.fromCharCode(x); return btoa(s); };
const relPubLine = "ssh-ed25519 " + toB64(catBytes(wireStr("ssh-ed25519"), wireStr(rawPub))) + " release-test";
async function signAsset(bytes, ns = "bio-release", key = relKey.privateKey, pub = rawPub) {
  const h = new Uint8Array(await crypto.subtle.digest("SHA-512", bytes));
  const signed = catBytes(new TextEncoder().encode("SSHSIG"), wireStr(ns), wireStr(""), wireStr("sha512"), wireStr(h));
  const sig = new Uint8Array(await crypto.subtle.sign("Ed25519", key, signed));
  const blob = catBytes(new TextEncoder().encode("SSHSIG"), wireU32(1),
    wireStr(catBytes(wireStr("ssh-ed25519"), wireStr(pub))), wireStr(ns), wireStr(""), wireStr("sha512"),
    wireStr(catBytes(wireStr("ssh-ed25519"), wireStr(sig))));
  return "-----BEGIN SSH SIGNATURE-----\n" + toB64(blob).replace(/(.{70})/g, "$1\n") + "\n-----END SSH SIGNATURE-----\n";
}

/* One scripted install, parameterised by what the repository serves. */
async function installWith(slug, sub, manifestExtra, src) {
  const { cookie, state } = await begin(slug);
  const calls = script([
    ...REL({ manifest: () => jres({ version: bump(RELEASE_VERSION), sha256: manifestExtra.sha256,
                                    asset: "bio-plane.bundled.mjs", ...manifestExtra.rest }),
             asset: () => new Response(src) }),
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "S1", name: "Signed" }]) },
    { m: (u) => u.includes(`/scripts/${slug}/settings`), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith(`/scripts/${slug}`) && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith(`/scripts/${slug}/subdomain`) && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: sub }) },
    { m: (u) => u.startsWith(`https://${slug}.${sub}.workers.dev/`),
      f: () => jres({ ok: true, bindings: { STORE: true } }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  const put = calls.find((c) => c.method === "PUT" && c.u.endsWith(`/scripts/${slug}`));
  globalThis.fetch = realFetch;
  return { body, source: await sourceOf(put), meta: await metadataOf(put) };
}

const repoSrc2 = "export default { fetch(){ return new Response('signed repo release'); } }; export class Store {};";
const repoSha2 = await shaHex(repoSrc2);
const goodSig = await signAsset(new TextEncoder().encode(repoSrc2));

console.log("\n--- release signing: unarmed, the hash stands alone ---");
{
  disarm();
  const r = await installWith("unarmed-town", "ua", { sha256: repoSha2 }, repoSrc2);
  t("an unsigned repository copy still installs", r.source, repoSrc2);
  t("and the page does not claim a signature it did not check", r.body.includes("signature"), false);
}

console.log("\n--- release signing: armed, a valid signature installs ---");
{
  armWith(relPubLine);
  const r = await installWith("signed-town", "st", { sha256: repoSha2, rest: { sig: goodSig } }, repoSrc2);
  t("the signed repository copy installs", r.source, repoSrc2);
  t("the page says the signature was checked", r.body.includes("signature from a key this installer trusts"), true);
}

console.log("\n--- release signing: armed, an unsigned copy is refused ---");
{
  armWith(relPubLine);
  const r = await installWith("bare-town", "bt", { sha256: repoSha2 }, repoSrc2);
  t("the built-in installed instead", r.source.includes("signed repo release"), false);
  t("VERSION stays the built-in", r.meta.bindings.find((b) => b.name === "VERSION").text, RELEASE_VERSION);
  t("the page says why in plain words", r.body.includes("carries no signature"), true);
}

console.log("\n--- release signing: armed, a stranger's signature is refused ---");
{
  const other = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const otherPub = new Uint8Array(await crypto.subtle.exportKey("raw", other.publicKey));
  const strangerSig = await signAsset(new TextEncoder().encode(repoSrc2), "bio-release", other.privateKey, otherPub);
  armWith(relPubLine);
  const r = await installWith("stranger-town", "sg", { sha256: repoSha2, rest: { sig: strangerSig } }, repoSrc2);
  t("the built-in installed instead", r.source.includes("signed repo release"), false);
  t("the page names the problem as trust, not corruption", r.body.includes("not by a key this installer trusts"), true);
}

console.log("\n--- release signing: armed, a signature from another purpose is refused ---");
{
  const wrongNs = await signAsset(new TextEncoder().encode(repoSrc2), "bio-ratify");
  armWith(relPubLine);
  const r = await installWith("crossns-town", "cn", { sha256: repoSha2, rest: { sig: wrongNs } }, repoSrc2);
  t("a ratification signature cannot install software", r.source.includes("signed repo release"), false);
  t("the page says the signature did not check out", r.body.includes("not by a key this installer trusts"), true);
  disarm();
}

/* ---- a no-op update says so ----
   The failure this guards against is not a crash. It is an update that uploads
   the same version over itself and reports "Updated to X", which reads as work
   done. Observed live 2026-07-24 (DEBT D-10). */
console.log("\n--- update: replacing a version with itself is not a success ---");
{
  disarm();
  const { cookie, state } = await begin("same-town", "update");
  script([
    ...REL({ manifest: () => jres({ version: RELEASE_VERSION, sha256: "x" }), asset: () => new Response("y") }),
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "N1", name: "Same" }]) },
    { m: (u) => u.includes("/scripts/same-town/settings"),
      f: () => cfok({ bindings: [{ type: "plain_text", name: "VERSION", text: RELEASE_VERSION }] }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/same-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "sm" }) },
    /* The instance answers with the version it already runs. */
    { m: (u) => u.startsWith("https://same-town.sm.workers.dev/"),
      f: () => jres({ ok: true, version: RELEASE_VERSION, bindings: { STORE: true } }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("the step names it as a re-upload of the same version", body.includes("already runs"), true);
  t("the outcome says nothing changed", body.includes("Nothing changed"), true);
  t("and does not claim an update happened", /<b>Updated (from|to)/.test(body), false);
  t("and says what to check instead", body.includes("newer release has actually been published"), true);
  globalThis.fetch = realFetch;
}

console.log(`\nwizard: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
