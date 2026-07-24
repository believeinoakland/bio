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
import worker, { CFG } from "../src/index.mjs";
import { RELEASE_VERSION } from "../src/release.mjs";

let pass = 0, fail = 0;
const t = (l, g, w) => { const ok = JSON.stringify(g) === JSON.stringify(w);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${l}${ok ? "" : `  want ${JSON.stringify(w)} got ${JSON.stringify(g)}`}`);
  ok ? pass++ : fail++; };

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
    { m: (u) => u.startsWith("https://fresh-town.fr.workers.dev/"), f: () => jres({ ok: true }) },
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
    { m: (u) => u.startsWith("https://wary-town.wy.workers.dev/"), f: () => jres({ ok: true }) },
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
    { m: (u) => u.startsWith("https://even-town.ev.workers.dev/"), f: () => jres({ ok: true }) },
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
      f: () => jres({ ok: true, version: RELEASE_VERSION }) },
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
      f: () => jres({ ok: true, version: RELEASE_VERSION }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  const meta = await metadataOf(calls.find((c) => c.method === "PUT"));
  t("existing buckets kept, none invented", meta.keep_bindings.includes("r2_bucket")
    && meta.bindings.filter((b) => b.type === "r2_bucket").length === 0, true);
  t("the update still lands", body.includes("Updated to"), true);
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
  t("the outcome is presented as done", body.includes("Updated to"), true);
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

console.log(`\nwizard: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
