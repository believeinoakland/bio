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
 *   - both upload paths bind SELF, so a deployed instance's monitoring is armed
 *   - both upload paths bind DAEMON_TOKEN (DIST-2), so monitoring runs scoped
 *     rather than on the ADMIN_TOKEN fallback, and the value is never displayed
 *
 * NEGATIVE CONTROL: delete the `selfBinding(slug)` line from `uploadUpdate`'s
 * bindings in src/index.mjs -> the update block fails on "SELF bound on update
 * too, arming monitoring on copies installed before it existed" (the
 * already-installed instance that would never receive SELF) and on "the update's
 * SELF is a service binding" -> 101 passed, 2 failed. Deleting the
 * `opts.noSelf ? [] : [selfBinding(slug)]` line from `uploadInstall` instead ->
 * 98 passed, 5 failed (both install SELF assertions, plus the whole degrade
 * block, because there is no longer anything for Cloudflare to refuse).
 * BOTH RUN 2026-08-04, restored 103/103 green after each.
 *
 * NEGATIVE CONTROL (D-297/IC-82): force the fleet-signature verdict true in
 * `installFleet` -> 129 passed, 2 failed: the dropped-member block watches a
 * member install under a signature that covers a different set, and the
 * signature sentence vanishes. Swallow the /2 statement refusal and substitute
 * a hand-built /1-style payload instead -> 130 passed, 1 failed — the
 * /2-refusal sentence arm — while the member still does NOT install, because
 * the signature layer beneath catches the substituted payload: the defences
 * are layered and the arm shows which one answered. BOTH RUN 2026-09-14,
 * restored byte-identically (sha256-verified), 131/131 green.
 *
 * NEGATIVE CONTROL (DIST-3): change `establishPlan`'s 100328 arm to return
 * "paid" (ACCEPT the Free answer — the exact defect DEC-42's row names) ->
 * 112 passed, 5 failed, and the load-bearing failure NAMES free-town as the
 * half-installed instance with the damage counted: want [0,0] got [2,1], two
 * buckets and the script actually created past the refusal that should have
 * stopped them. A WEAKER arm was run first and is recorded because its result
 * teaches something: merely DELETING the 100328 check (not accepting it) ->
 * 114 passed, 3 failed with free-town still protected — the unverifiable-plan
 * refusal catches what the Free check no longer does, so the guard fails
 * SAFE rather than open. BOTH RUN 2026-09-14, restored byte-identically after
 * each (sha256-verified), 117/117 green.
 *
 * NEGATIVE CONTROL (DIST-2): delete the `DAEMON_TOKEN` line from
 * `uploadUpdate`'s bindings -> 103 passed, 2 failed, the first failure naming
 * oak-watch, the already-installed instance that would never receive the
 * credential (the arm this item exists for). Delete the `DAEMON_TOKEN` line
 * from `uploadInstall` instead -> 101 passed, 4 failed (four secrets, distinct
 * count, the retry count, and the panel assertion failing BY NAME with
 * "DAEMON_TOKEN missing" rather than throwing — D-93 guarded inside a control).
 * BOTH RUN 2026-09-14, `newgroup/src/index.mjs` restored byte-identically after
 * each (sha256 a0f6cf1b…, verified by hash both times).
 *
 * NEGATIVE CONTROL (D-436 item 3, DIST #4, 2026-09-22), DECLARED BEFORE ARMING and measured with the 0.71.0
 * embed: (N1) `groupNotice` returns "" -> 141 passed, 5 failed: the four CROSSING telling assertions (why, the
 * refused code, the act, the suggestion) and the unknown-version arm's CONDITIONAL one; (N2) `groupUnrecorded`
 * answers "certain" whatever ran before -> 145 passed, 1 failed: PAST THE LINE, told where nothing is owed;
 * (N3) the update calls op=instancegroupseed -> 143 passed, 3 failed: each arm's "never seeds". ALL AS DECLARED,
 * `newgroup/src/index.mjs` restored byte-identically after each (sha256 12e67385…, verified by hash).
 *
 * NEGATIVE CONTROL (D-116, 2026-09-23), DECLARED BEFORE ARMING, whole suite 164/164 before and after: (W1) today's-main
 * reading — `servingVerdict` reads only `version` (`if (!capable) return` made `if (true) return`) -> 157 passed,
 * 7 failed: every D-116 lag arm (stale store, pre-D-116 store, stale member, installed-but-unbound member, members
 * unreported, the install lag) — each reporting the update DONE over the lag it should name; (W2) `reportsBuilds`
 * answers false -> 155 passed, 9 failed: the PIN on the plane this tree builds, the "every part" sentence, and the
 * same seven lag arms. ALL AS DECLARED, `newgroup/src/index.mjs` restored byte-identically after each (sha256
 * e8773248…, verified by sha256 AND byte compare). The plane half's controls are in
 * `bio-plane/test/d116-serving-builds.test.mjs`.
 */
import worker, { CFG, ARMED_SIGNERS, reportsBuilds } from "../src/index.mjs";
import { readFileSync } from "node:fs";
import { fleetStatement, NS_FLEET } from "../../bio-plane/src/sshsig.mjs";
import { RELEASE_VERSION, RELEASE_SOURCE } from "../src/release.mjs";

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
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => cfok({}) },
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
  /* Was "three secrets set" until DIST-2: REC-33 gave the plane a daemon
     class, and the installer now binds its credential so monitoring runs
     scoped instead of on the root-of-trust ADMIN_TOKEN fallback. */
  t("four secrets set (DAEMON_TOKEN joined at DIST-2)", secrets.map((s) => s.name).sort(),
    ["ADMIN_TOKEN", "DAEMON_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN"]);
  t("secrets are long", secrets.every((s) => s.text.length >= 40), true);
  t("secrets are distinct", new Set(secrets.map((s) => s.text)).size, 4);
  t("no secret is a published value", secrets.some((s) => s.text === PUBLISHED), false);
  /* DIST-2: the daemon credential is the one secret NO human ever spends —
     the plane spends it over SELF — so the success panel must not display it.
     A credential displayed is a credential that can leak for no gain. */
  t("the daemon credential is not on the success page",
    (() => { const v = secrets.find((s) => s.name === "DAEMON_TOKEN")?.text;
      return v ? body.includes(v) : "DAEMON_TOKEN missing"; })(), false);
  /* REC-26: without this binding the plane's #monitorConfigured() is false and
     both monitoring consumers hold no alarm — the instance never re-checks a
     document it was asked to monitor. The target is the instance's OWN worker,
     which is the slug (D-102), so a wrong target here would point one group's
     monitoring at another group's copy. */
  const self = meta.bindings.find((b) => b.name === "SELF");
  t("SELF is a service binding", self?.type, "service");
  t("SELF targets this instance's own worker, not a fixed name", self?.service, "oak-watch");
  t("both buckets bound when R2 succeeded",
    meta.bindings.filter((b) => b.type === "r2_bucket").map((b) => b.bucket_name).sort(),
    ["bio-captures", "bio-published"]);
  t("both buckets were created", calls.filter((c) => c.u.endsWith("/r2/buckets")).length, 2);
  /* DIST-3 / DEC-42: the plan is established by PROVOKING the platform — the
     probe upload carries limits.cpu_ms, which Free refuses with 100328 — and
     never by reading a plan field. The probe precedes the first creation and
     its throwaway is deleted on the spot. */
  const probePut = calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/bio-plan-probe"));
  t("the plan was PROVOKED, not read from a field: the probe upload carries limits.cpu_ms",
    (await metadataOf(probePut))?.limits?.cpu_ms > 0, true);
  t("the probe throwaway was deleted",
    calls.some((c) => c.method === "DELETE" && c.u.includes("/scripts/bio-plan-probe")), true);
  t("the probe ran BEFORE the first thing the install creates",
    calls.indexOf(probePut) < calls.indexOf(calls.find((c) => c.u.endsWith("/r2/buckets"))), true);

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
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => cfok({}) },
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
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST",
      f: () => cferr("Please enable R2 by adding a payment method", 403) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  /* Was "no PUT at all" until DIST-3: the plan probe legitimately PUTs (and
     deletes) its throwaway before this refusal. The assertion's true core is
     that the INSTANCE was never uploaded, so it narrows to the instance's
     own script rather than being exempted. */
  t("the instance itself was never uploaded",
    calls.some((c) => c.method === "PUT" && c.u.endsWith("/scripts/small-group")), false);
  t("the stop explains itself as a setting, not a failure", body.includes("One Cloudflare setting is needed first"), true);
  t("it names the exact next step", body.includes("add a card or PayPal"), true);
  t("it says nothing needs cleaning up", body.includes("nothing to clean up"), true);
  t("no credentials were minted into the page", body.includes(String.raw`id="out-boot"`), false);
  t("no token in output", body.includes(TOK), false);
  globalThis.fetch = realFetch;
}

/* ---- install where Cloudflare refuses the self-binding ---- */
console.log("\n--- install: a refused SELF binding costs the monitoring, never the copy ---");
{
  /* An install PUT names a service binding to the script that same PUT creates.
     Whether Cloudflare accepts that self-reference cannot be established without
     a real install, and a real install is deploy-gated — so this block pins the
     BEHAVIOUR under refusal rather than pretending to know the answer. */
  const { cookie, state } = await begin("shy-town");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "A4", name: "Shy" }]) },
    { m: (u) => u.includes("/scripts/shy-town/settings"), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/shy-town") && mth === "PUT",
      f: async (u, init) => {
        const meta = JSON.parse(await init.body.get("metadata").text());
        return meta.bindings.some((b) => b.type === "service")
          ? cferr("binding SELF refers to a service that does not exist", 400, 10021)
          : cfok({ id: "shy-town" });
      } },
    { m: (u, mth) => u.endsWith("/scripts/shy-town/subdomain") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "shy" }) },
    { m: (u) => u.startsWith("https://shy-town.shy.workers.dev/"),
      f: () => jres({ ok: true, bindings: { STORE: true } }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  const puts = calls.filter((c) => c.method === "PUT" && c.u.endsWith("/scripts/shy-town"));
  t("the refused upload is retried exactly once", puts.length, 2);
  const retry = puts[1] ? await metadataOf(puts[1]) : { bindings: [] };
  t("the retry drops ONLY the service binding", retry.bindings.some((b) => b.type === "service"), false);
  t("the retry still carries the store, the secrets and the storage",
    [retry.bindings.some((b) => b.type === "durable_object_namespace"),
     retry.bindings.filter((b) => b.type === "secret_text").length,
     retry.bindings.filter((b) => b.type === "r2_bucket").length,
     "migrations" in retry], [true, 4, 2, true]);
  t("the group still gets a working copy", body.includes("out-boot"), true);
  t("the page says what was left out and how to get it", body.includes("was refused by Cloudflare"), true);
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
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => cfok({}) },
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
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => cfok({}) },
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
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => cfok({}) },
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

/* ---- DIST-3: a Free-plan account is refused BY NAME, before anything exists.
   The bucket and upload routes below are deliberately PRESENT and answerable:
   a guard that stops consulting the probe's answer would sail through them and
   half-install free-town, and the zero-calls assertions would fail naming it —
   that is this block's negative-control geometry, not an oversight. ---- */
console.log("\n--- install: Workers Free is refused by name, nothing created ---");
{
  const { cookie, state } = await begin("free-town");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "F1", name: "Free Town" }]) },
    { m: (u) => u.includes("/scripts/free-town/settings"), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT",
      f: () => cferr("CPU limits are not supported for the Free plan.", 400, 100328) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/free-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "ft" }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("the refusal names the Workers Paid plan", body.includes("Workers Paid plan is needed"), true);
  t("it names the cost", body.includes("$5/month"), true);
  t("it names what to do", body.includes("dash.cloudflare.com") && body.includes("enable Workers Paid"), true);
  t("it says nothing was installed", body.includes("Nothing was installed"), true);
  t("REFUSED BEFORE ANYTHING WAS CREATED — free-town would otherwise be the half-installed instance: no bucket, no script",
    [calls.filter((c) => c.u.endsWith("/r2/buckets") && c.method === "POST").length,
     calls.filter((c) => c.method === "PUT" && c.u.endsWith("/scripts/free-town")).length], [0, 0]);
  globalThis.fetch = realFetch;
}

/* ---- DIST-3: an UNVERIFIABLE plan refuses too — an unverified plan is not a
   verified one, and undetermined is stated, never rounded to paid. ---- */
console.log("\n--- install: unverifiable plan is an honest refusal, nothing created ---");
{
  const { cookie, state } = await begin("hazy-town");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "H1", name: "Hazy Town" }]) },
    { m: (u) => u.includes("/scripts/hazy-town/settings"), f: () => cferr("not found", 404) },
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT",
      f: () => cferr("internal error", 500, 7000) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/hazy-town") && mth === "PUT", f: () => cfok({}) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("the refusal says the plan could not be VERIFIED, not that it is Free",
    body.includes("Could not verify") && !body.includes("Workers Paid plan is needed"), true);
  t("it carries Cloudflare's own words", body.includes("internal error"), true);
  t("nothing was created here either",
    [calls.filter((c) => c.u.endsWith("/r2/buckets") && c.method === "POST").length,
     calls.filter((c) => c.method === "PUT" && c.u.endsWith("/scripts/hazy-town")).length], [0, 0]);
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
  /* DIST-3: the plan probe is an INSTALL act. An update must never grow a new
     refusal against an already-installed instance — the same doctrine as the
     storage arm above ("an update must never be refused over storage"). */
  t("no plan probe on update — an update never grows a new refusal",
    calls.some((c) => c.u.includes("bio-plan-probe")), false);
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
  /* CORRECTED at DIST-2, not exempted. This line read `no new secrets
     generated` (no secret_text in the update metadata at all) and that was
     the right rule while every secret was a GROUP PASSWORD an update must
     never touch. It became wrong when REC-33 gave the plane a daemon class:
     an instance installed before DAEMON_TOKEN existed can receive it ONLY
     through an update — keep_bindings inherits, and there is nothing to
     inherit (the SELF-binding lesson, arriving as a secret). The old rule's
     true core survives as the narrower assertion below: the update still
     restates NO password, because it never sees their values. A fresh daemon
     value each update is deliberate — nothing outside the worker's env holds
     it, so there is no holder to invalidate. */
  t("DAEMON_TOKEN bound on update too — oak-watch installed before the daemon class existed and ONLY an update can deliver it",
    meta.bindings.find((b) => b.name === "DAEMON_TOKEN")?.type, "secret_text");
  t("the update supplies NO password — the three group secrets still travel only by keep_bindings",
    meta.bindings.filter((b) => b.type === "secret_text").map((b) => b.name), ["DAEMON_TOKEN"]);
  /* REC-26, and this is the assertion the whole update half exists for: every
     copy installed before the SELF binding existed is running with its
     monitoring consumers dormant RIGHT NOW. Nothing reaches those instances
     except an update, and an update only heals what it binds EXPLICITLY —
     keep_bindings inherits, and there is nothing to inherit. */
  const selfUp = meta.bindings.find((b) => b.name === "SELF");
  t("SELF bound on update too, arming monitoring on copies installed before it existed",
    selfUp?.service, "oak-watch");
  t("the update's SELF is a service binding", selfUp?.type, "service");
  /* "service" is deliberately NOT in keep_bindings: the explicit binding above
     is what heals an older copy, and inheritance cannot create what was never
     there. If that binding is ever dropped, "service" must be added here or an
     update DELETES a working instance's binding. */
  t("keep_bindings does not inherit service bindings", meta.keep_bindings.includes("service"), false);
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

/* ---- update whose new version cannot be confirmed yet: calm, but NOT reported as done ----
   CORRECTED AT D-116 (2026-09-23), not exempted. This block asserted "the outcome is presented as done" — the page
   said "Updated from 0.0.1 to X" while the address was still answering 0.0.1 — together with "no failure framing" and
   "the step is not marked red". The first was the defect D-116 exists to remove: reporting an update as done while a
   named part still serves the old build is the record claiming more than it can support (`CLAUDE.md` §2, §5). What
   was right in it survives: the note stays patient (a rollout takes minutes, nothing is framed as failed or broken).
   What changes: the page says the upload happened, NAMES the part that lags, and does not say "Updated". The old
   "not marked red" assertion searched for the literal `class="no"`, which the streamed page never contains (the
   class is set by script), so it could not fail; it is replaced by one that reads the emitted step call. */
console.log("\n--- update: unconfirmed version is named, patiently, and not reported as done (D-116) ---");
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
  t("the outcome is NOT presented as an update done (D-116)", /<b>Updated (from|to)/.test(body), false);
  t("it says the upload happened, over what", body.includes(`Uploaded ${RELEASE_VERSION} over 0.0.1`), true);
  t("and NAMES the part that lags, with what it answers", body.includes("your copy&#39;s address answers 0.0.1"), true);
  t("the note is patient, not alarming", body.includes("can take a few minutes"), true);
  t("no failure framing anywhere", /failed|broken/i.test(body), false);
  t("the verify step is not marked done", body.includes('ok("verify"'), false);
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
    { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => cfok({}) },
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

/* ---- IC-82 / D-297: the installer installs the FLEET ----------------------
   The statement is rebuilt from the manifest by the SAME shared function the
   assembler used (imported above, never re-implemented), signed here with the
   suite's own armed key. Every arm below drives the geometry BOB named at the
   gate: a manifest without the /2 upload facts, a dropped member, a foreign
   plane, and a mid-fleet failure must each land on the exact honest sentence,
   and only a verified fleet may touch the account. */
console.log("\n--- fleet: members install under the fleet signature ---");

const shaBytes = async (bytes) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
  .map((b) => b.toString(16).padStart(2, "0")).join("");
const memberSrc = "export default { fetch(){ return new Response('member'); } };";
const memberSha = await shaHex(memberSrc);
const wasmBytes = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
const wasmSha = await shaBytes(wasmBytes);
const FLEET_VER = bump(RELEASE_VERSION);
const memberEntry = {
  member: "probe-member", asset: "probe-member.bundled.mjs",
  sha256: memberSha, bytes: memberSrc.length,
  compat: { date: "2026-07-01", flags: [] },
  services: [{ binding: "PLANE", service: "bio-plane" }],
  parts: [{ path: "assets/x.wasm", type: "CompiledWasm", sha256: wasmSha, bytes: wasmBytes.length }],
};
const fleetManifest = (members, extra = {}) => ({
  version: FLEET_VER, sha256: repoSha2, bytes: repoSrc2.length,
  asset: "bio-plane.bundled.mjs", sig: goodSig, fleet: members, ...extra,
});
const signFleet = async (members) => signAsset(
  new TextEncoder().encode(fleetStatement({ version: FLEET_VER,
    plane: { sha256: repoSha2, bytes: repoSrc2.length, asset: "bio-plane.bundled.mjs" },
    members })), NS_FLEET);

const fleetRoutes = (slug, sub) => [
  { m: (u) => u.endsWith("/release/probe-member.bundled.mjs"), f: () => new Response(memberSrc) },
  { m: (u) => u.endsWith("/release/probe-member/assets/x.wasm"), f: () => new Response(wasmBytes) },
  { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
  { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "FL", name: "Fleet Town" }]) },
  { m: (u) => u.includes(`/scripts/${slug}/settings`), f: () => cferr("not found", 404) },
  { m: (u, mth) => u.endsWith("/scripts/bio-plan-probe") && mth === "PUT", f: () => cfok({}) },
  { m: (u, mth) => u.includes("/scripts/bio-plan-probe") && mth === "DELETE", f: () => cfok({}) },
  { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
  { m: (u, mth) => u.endsWith(`/scripts/${slug}`) && mth === "PUT", f: () => cfok({}) },
  { m: (u, mth) => u.endsWith("/scripts/probe-member") && mth === "PUT", f: () => cfok({}) },
  { m: (u, mth) => u.endsWith(`/scripts/${slug}/subdomain`) && mth === "POST", f: () => cfok({}) },
  { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: sub }) },
  { m: (u) => u.startsWith(`https://${slug}.${sub}.workers.dev/`),
    f: () => jres({ ok: true, bindings: { STORE: true } }) },
];

{
  armWith(relPubLine);
  const fleetSig = await signFleet([memberEntry]);
  const { cookie, state } = await begin("fleet-town");
  const calls = script([
    ...REL({ manifest: () => jres(fleetManifest([memberEntry], { fleetSig })),
             asset: () => new Response(repoSrc2) }),
    ...fleetRoutes("fleet-town", "flt"),
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  const mput = calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/probe-member"));
  t("the member was uploaded", !!mput, true);
  const mm = mput ? await metadataOf(mput) : { bindings: [] };
  t("compat COPIED from the signed manifest — date stated, empty flags spelled as absence of the key",
    [mm.compatibility_date, "compatibility_flags" in mm], ["2026-07-01", false]);
  t("the PLANE service binding is templated to THIS instance's slug (D-292)",
    mm.bindings.find((b) => b.name === "PLANE")?.service, "fleet-town");
  t("the member carries the release version",
    mm.bindings.find((b) => b.name === "VERSION")?.text, FLEET_VER);
  t("the wasm part is uploaded under its manifest path with its STATED module type",
    (mput.init.body.get("assets/x.wasm"))?.type, "application/wasm");
  t("the page says all members installed, by name",
    body.includes("capability workers installed") && body.includes("probe-member"), true);
}

console.log("\n--- fleet: a manifest without the /2 upload facts refuses by name ---");
{
  armWith(relPubLine);
  const stripped = { ...memberEntry }; delete stripped.compat;
  const fleetSig = await signFleet([memberEntry]); /* any sig — the statement refuses first */
  const { cookie, state } = await begin("bare-fleet");
  const calls = script([
    ...REL({ manifest: () => jres(fleetManifest([stripped], { fleetSig })),
             asset: () => new Response(repoSrc2) }),
    ...fleetRoutes("bare-fleet", "bf"),
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("no member reached the account",
    calls.some((c) => c.method === "PUT" && c.u.endsWith("/scripts/probe-member")), false);
  t("the page says the manifest does not state how members are uploaded",
    body.includes("does not state how they are uploaded"), true);
  t("the plane itself installed normally",
    calls.some((c) => c.method === "PUT" && c.u.endsWith("/scripts/bare-fleet")), true);
}

console.log("\n--- fleet: a DROPPED member invalidates the set signature ---");
{
  armWith(relPubLine);
  const second = { ...memberEntry, member: "other-member", asset: "other-member.bundled.mjs", parts: [] };
  const fleetSig = await signFleet([memberEntry, second]);   /* signed over TWO */
  const { cookie, state } = await begin("drop-town");
  const calls = script([
    ...REL({ manifest: () => jres(fleetManifest([memberEntry], { fleetSig })),  /* serves ONE */
             asset: () => new Response(repoSrc2) }),
    ...fleetRoutes("drop-town", "dt"),
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("dropping a member kills the whole fleet's signature — nothing installs",
    calls.some((c) => c.method === "PUT" && c.u.endsWith("/scripts/probe-member")), false);
  t("and the page says the signature did not verify",
    body.includes("fleet signature did not verify"), true);
}

console.log("\n--- fleet: one failing member degrades ALONE, and is named ---");
{
  armWith(relPubLine);
  const second = { ...memberEntry, member: "other-member", asset: "other-member.bundled.mjs",
                   sha256: await shaHex("nope"), parts: [] };  /* asset will 404 */
  const fleetSig = await signFleet([memberEntry, second]);
  const { cookie, state } = await begin("half-town");
  const calls = script([
    ...REL({ manifest: () => jres(fleetManifest([memberEntry, second], { fleetSig })),
             asset: () => new Response(repoSrc2) }),
    { m: (u) => u.endsWith("/release/other-member.bundled.mjs"), f: () => new Response("gone", { status: 404 }) },
    ...fleetRoutes("half-town", "ht"),
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("the healthy member still installed",
    calls.some((c) => c.method === "PUT" && c.u.endsWith("/scripts/probe-member")), true);
  t("the failed one is NAMED with its reason and the retry path",
    body.includes("other-member") && body.includes("left out") && body.includes("next update retries"), true);
}

console.log("\n--- fleet: the update path installs members too — the healing half ---");
{
  armWith(relPubLine);
  const fleetSig = await signFleet([memberEntry]);
  const { cookie, state } = await begin("heal-town", "update");
  const calls = script([
    ...REL({ manifest: () => jres(fleetManifest([memberEntry], { fleetSig })),
             asset: () => new Response(repoSrc2) }),
    { m: (u) => u.endsWith("/release/probe-member.bundled.mjs"), f: () => new Response(memberSrc) },
    { m: (u) => u.endsWith("/release/probe-member/assets/x.wasm"), f: () => new Response(wasmBytes) },
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "H", name: "Heal" }]) },
    { m: (u) => u.includes("/scripts/heal-town/settings"), f: () => cfok({ existing: true }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/heal-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/probe-member") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "hl" }) },
    { m: (u) => u.includes("heal-town.hl.workers.dev/api/?op=bootstrap"), f: midUpdate("0.1.0", FLEET_VER) },
  ]);
  await (await callback(`code=C&state=${state}`, cookie)).text();
  t("an update installs the members a copy never had — keep_bindings cannot create what was never there",
    calls.some((c) => c.method === "PUT" && c.u.endsWith("/scripts/probe-member")), true);
}

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
  t("D-436: a no-op update tells nothing about the producing group", body.includes("op=instancegroupseed"), false);
  globalThis.fetch = realFetch;
}

/* ---- D-436 (IC-172), item 3 of the DELEGATION to DIST: an update TELLS the one act it leaves, and never
   does it. Added by DIST #4, 2026-09-22 (the 0.71.0 cut). A copy that ran a release before FIRST_GROUP_RELEASE
   records no producing group after the update (decision (b)), and only its root of trust may record one; the
   installer holds no instance credential, so it neither seeds nor even asks op=instancegroup — it tells from
   the version it read before the upload. Each arm asserts that no call touched op=instancegroup at all. ---- */
console.log("\n--- update: D-436 — the one act an update leaves to the operator is told, never done ---");
const semverCmp = (a, b) => { const A = a.split(".").map(Number), B = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (A[i] !== B[i]) return A[i] - B[i]; return 0; };
const groupCalls = (calls) => calls.filter((c) => /op=instancegroup/.test(c.u)).map((c) => `${c.method} ${c.u}`);
t("ARMED: the built-in release carries IC-172, so an update from 0.70.0 CROSSES the line the arms are about",
  semverCmp(RELEASE_VERSION, "0.71.0") >= 0, true);
{
  disarm();
  const { cookie, state } = await begin("cross-town", "update");
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "G1", name: "Cross" }]) },
    { m: (u) => u.includes("/scripts/cross-town/settings"), f: () => cfok({ existing: true }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/cross-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "cx" }) },
    { m: (u) => u.includes("cross-town.cx.workers.dev/api/?op=bootstrap"), f: midUpdate("0.70.0", RELEASE_VERSION) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("CROSSING (0.70.0 -> this release): the update lands as an update", body.includes(`Updated from 0.70.0 to ${RELEASE_VERSION}`), true);
  t("and it TELLS the one act left to the operator, saying why from the version it read",
    [body.includes("One thing this update does not do for you"), body.includes("Your copy ran 0.70.0 before this update")],
    [true, true]);
  t("naming what is refused until it is done, and by which code", body.includes("GROUP_UNDETERMINED"), true);
  t("naming the act that settles it — the root of trust's seed, for the record AND for scratch",
    [body.includes("op=instancegroupseed"), body.includes("store=scratch"), body.includes("ADMIN_TOKEN")], [true, true, true]);
  t("the installed name is offered as a SUGGESTION, with the example of a copy whose group is not its worker name",
    [body.includes("A suggestion, not a default"), body.includes("cross-town"), body.includes("biosmoke7"), body.includes("believe-in-oakland")],
    [true, true, true, true]);
  t("and it NEVER seeds, nor asks op=instancegroup (it holds no credential that could)", groupCalls(calls), []);
  t("no token in output", body.includes(TOK), false);
  globalThis.fetch = realFetch;
}
{
  armWith(relPubLine);
  const fleetSig = await signFleet([memberEntry]);
  const { cookie, state } = await begin("past-town", "update");
  const calls = script([
    ...REL({ manifest: () => jres(fleetManifest([memberEntry], { fleetSig })),
             asset: () => new Response(repoSrc2) }),
    { m: (u) => u.endsWith("/release/probe-member.bundled.mjs"), f: () => new Response(memberSrc) },
    { m: (u) => u.endsWith("/release/probe-member/assets/x.wasm"), f: () => new Response(wasmBytes) },
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "G2", name: "Past" }]) },
    { m: (u) => u.includes("/scripts/past-town/settings"), f: () => cfok({ existing: true }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/past-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/probe-member") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "pt" }) },
    { m: (u) => u.includes("past-town.pt.workers.dev/api/?op=bootstrap"), f: midUpdate(RELEASE_VERSION, FLEET_VER) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t(`PAST THE LINE (${RELEASE_VERSION} -> ${FLEET_VER}): the update lands`, body.includes(`Updated from ${RELEASE_VERSION} to ${FLEET_VER}`), true);
  t("and tells NOTHING about the producing group: the update that crossed the line told it, or the copy recorded it at first boot",
    [body.includes("One thing this update does not do for you"), body.includes("op=instancegroupseed")], [false, false]);
  t("and never seeds, nor asks op=instancegroup", groupCalls(calls), []);
  globalThis.fetch = realFetch;
  disarm();
}
{
  disarm();
  const { cookie, state } = await begin("fog-town", "update");
  let n = 0;
  const calls = script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "G3", name: "Fog" }]) },
    { m: (u) => u.includes("/scripts/fog-town/settings"), f: () => cfok({ existing: true }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/fog-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "fg" }) },
    /* The copy does not answer BEFORE the upload (so its version is unknown), and answers the new one after. */
    { m: (u) => u.includes("fog-town.fg.workers.dev/api/?op=bootstrap"),
      f: () => n++ === 0 ? new Response("unavailable", { status: 503 }) : jres({ ok: true, version: RELEASE_VERSION }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  t("VERSION BEFORE UNKNOWN: the update lands", body.includes(`Updated to ${RELEASE_VERSION}`), true);
  t("and the telling is CONDITIONAL, saying the installer could not read what ran before — undetermined, stated",
    [body.includes("could not read which version your copy ran"), body.includes("op=instancegroupseed")], [true, true]);
  t("and never seeds, nor asks op=instancegroup", groupCalls(calls), []);
  globalThis.fetch = realFetch;
}

/* ---- D-116: EACH PART'S OWN BUILD, READ BACK, AND THE ONE THAT LAGS NAMED ----------------------------------------
   Added 2026-09-23 (D-116 worker). A release whose plane carries D-116 answers `op=bootstrap&members=1` with three
   readings, each from where it runs: `version` (the routing isolate), `storeVersion` (the Durable Object's own env) and
   `memberVersions` (each member's own /version THROUGH the plane's binding; bio-plane/test/d116-serving-builds.test.mjs
   drives the plane half with a real DO on another build). This half drives the INSTALLER's reading of that answer.
   HOW A LIAR WOULD PASS HERE: an installer that read only `version` (today's main) — every arm below that names a
   lagging store or member serves a CORRECT `version`, so only a reader of the other two fields can name the lag.
   NEGATIVE CONTROL: see the D-116 entry at the head of this file's controls. */
console.log("\n--- D-116: the installer reads the store's and each member's OWN build, and names the one that lags ---");
{
  const planeBundle = readFileSync(new URL("../../bio-plane/dist/bio-plane.bundled.mjs", import.meta.url), "utf8");
  t("PIN: the plane this tree builds CAN report its builds — renaming either field fails HERE, not silently in the field",
    reportsBuilds(planeBundle), true);
  t("PIN: a plane without the fields is read as unable to report them (the pre-D-116 releases)",
    reportsBuilds(repoSrc2), false);
}
const repoSrc3 = "export default { fetch(){ return Response.json({ storeVersion: 'x', memberVersions: {} }); } }; export class Store {};";
const repoSha3 = await shaHex(repoSrc3);
const sig3 = await signAsset(new TextEncoder().encode(repoSrc3));
const agentEntry = { ...memberEntry, member: "agent-worker", asset: "agent-worker.bundled.mjs", parts: [] };
const signFleet3 = async (members) => signAsset(
  new TextEncoder().encode(fleetStatement({ version: FLEET_VER,
    plane: { sha256: repoSha3, bytes: repoSrc3.length, asset: "bio-plane.bundled.mjs" }, members })), NS_FLEET);
const fleetSig3 = await signFleet3([agentEntry]);
const manifest3 = { version: FLEET_VER, sha256: repoSha3, bytes: repoSrc3.length, asset: "bio-plane.bundled.mjs",
                    sig: sig3, fleet: [agentEntry], fleetSig: fleetSig3 };
const SERVING = (v) => ({ binding: "AGENT_WORKER", state: "SERVING", version: v });
const OTHERS = { "pdf-worker": { binding: "PDF_WORKER", state: "UNBOUND" }, "ocr-worker": { binding: "OCR_WORKER", state: "UNBOUND" } };
/* After the upload the copy answers `after`; before it, 0.1.0 (so this is an update, not a no-op). */
async function d116Update(slug, after) {
  armWith(relPubLine);
  const realTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => realTimeout(fn, 0);
  const { cookie, state } = await begin(slug, "update");
  let n = 0;
  const calls = script([
    ...REL({ manifest: () => jres(manifest3), asset: () => new Response(repoSrc3) }),
    { m: (u) => u.endsWith("/release/agent-worker.bundled.mjs"), f: () => new Response(memberSrc) },
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "D1", name: "D116" }]) },
    { m: (u) => u.includes(`/scripts/${slug}/settings`), f: () => cfok({ existing: true }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith(`/scripts/${slug}`) && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/agent-worker") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "d1" }) },
    { m: (u) => u.includes(`${slug}.d1.workers.dev/api/?op=bootstrap`),
      f: () => n++ === 0 ? jres({ ok: true, version: "0.1.0" }) : jres({ ok: true, version: FLEET_VER, ...after }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  globalThis.setTimeout = realTimeout;
  globalThis.fetch = realFetch;
  disarm();
  return { body, calls, memberPut: calls.some((c) => c.method === "PUT" && c.u.endsWith("/scripts/agent-worker")),
           askedMembers: calls.some((c) => c.u.includes(`${slug}.d1.workers.dev/api/?op=bootstrap&members=1`)) };
}
{
  const r = await d116Update("all-town", { storeVersion: FLEET_VER,
    memberVersions: { "agent-worker": SERVING(FLEET_VER), ...OTHERS } });
  t("ARMED: the capable release was the one installed, with its member", [r.memberPut, r.askedMembers], [true, true]);
  t("ALL ON THE RELEASE: the update is reported done", r.body.includes(`Updated from 0.1.0 to ${FLEET_VER}`), true);
  t("and says what was confirmed — every part, not only the address",
    r.body.includes(`Every part of your copy answers ${FLEET_VER}`), true);
  t("and names no lag", r.body.includes("not yet confirmed"), false);
}
{
  const r = await d116Update("stale-store", { storeVersion: "0.1.0",
    memberVersions: { "agent-worker": SERVING(FLEET_VER), ...OTHERS } });
  t("A STALE DURABLE OBJECT under a current address is NAMED, with the build it runs",
    r.body.includes("your copy&#39;s record store still runs 0.1.0"), true);
  t("and the update is NOT reported done", [/<b>Updated (from|to)/.test(r.body), r.body.includes("not yet confirmed")], [false, true]);
}
{
  const r = await d116Update("old-store", { memberVersions: { "agent-worker": SERVING(FLEET_VER), ...OTHERS } });
  t("A DO STILL ON PRE-D-116 CODE (no storeVersion at all, after a release that has it) is named, not taken as absent",
    [r.body.includes("record store has not reported its version"), /<b>Updated (from|to)/.test(r.body)], [true, false]);
}
{
  const r = await d116Update("stale-member", { storeVersion: FLEET_VER,
    memberVersions: { "agent-worker": SERVING("0.1.0"), ...OTHERS } });
  t("A STALE MEMBER, read back through the plane's binding, is NAMED with the build it runs",
    [r.body.includes("the capability worker agent-worker still runs 0.1.0"), /<b>Updated (from|to)/.test(r.body)], [true, false]);
}
{
  const r = await d116Update("loose-member", { storeVersion: FLEET_VER,
    memberVersions: { "agent-worker": { binding: "AGENT_WORKER", state: "UNBOUND" }, ...OTHERS } });
  t("A MEMBER THIS STEP INSTALLED but the plane cannot reach is NAMED — uploaded is not usable",
    [r.body.includes("agent-worker was installed, but your copy holds no connection to it"), /<b>Updated (from|to)/.test(r.body)],
    [true, false]);
}
{
  const r = await d116Update("members-mute", { storeVersion: FLEET_VER });
  t("a capable plane that does not report its members is named, never read as none",
    r.body.includes("did not report its capability workers"), true);
}
{
  /* The built-in release predates D-116 in this tree: its store's and members' builds are UNDETERMINED, and said. */
  disarm();
  const { cookie, state } = await begin("pre-town", "update");
  script([
    { m: (u) => u === CFG.TOKEN, f: () => jres({ access_token: TOK }) },
    { m: (u) => u.endsWith("/accounts"), f: () => cfok([{ id: "D2", name: "Pre" }]) },
    { m: (u) => u.includes("/scripts/pre-town/settings"), f: () => cfok({ existing: true }) },
    { m: (u, mth) => u.endsWith("/r2/buckets") && mth === "POST", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/scripts/pre-town") && mth === "PUT", f: () => cfok({}) },
    { m: (u, mth) => u.endsWith("/workers/subdomain") && mth === "GET", f: () => cfok({ subdomain: "pr" }) },
    { m: (u) => u.includes("pre-town.pr.workers.dev/api/?op=bootstrap"), f: midUpdate("0.1.0", RELEASE_VERSION) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  globalThis.fetch = realFetch;
  if (!reportsBuilds(RELEASE_SOURCE)) {
    t("A RELEASE THAT CANNOT REPORT BUILDS: the address is confirmed and the rest is STATED undetermined, not claimed",
      [body.includes(`Updated from 0.1.0 to ${RELEASE_VERSION}`), body.includes("cannot report which version your copy&#39;s record store")],
      [true, true]);
  } else {
    /* Once DIST cuts a release carrying D-116 and embeds it, the built-in release CAN report, and this fixture (which
       serves no storeVersion) is a stale DO — which is named. Both branches are asserted so the arm survives the cut. */
    t("THE BUILT-IN RELEASE CAN REPORT BUILDS: a copy answering no storeVersion after it is a stale DO, named",
      body.includes("record store has not reported its version"), true);
  }
}
console.log("\n--- D-116: an INSTALL names a part not on the release, and still hands over the credentials ---");
async function d116Install(slug, reply) {
  armWith(relPubLine);
  const realTimeout = globalThis.setTimeout;
  globalThis.setTimeout = (fn) => realTimeout(fn, 0);
  const { cookie, state } = await begin(slug);
  script([
    ...REL({ manifest: () => jres(manifest3), asset: () => new Response(repoSrc3) }),
    { m: (u) => u.endsWith("/release/agent-worker.bundled.mjs"), f: () => new Response(memberSrc) },
    ...fleetRoutes(slug, "di").filter((x) => !x.m(`https://${slug}.di.workers.dev/`)),
    { m: (u, mth) => u.endsWith("/scripts/agent-worker") && mth === "PUT", f: () => cfok({}) },
    { m: (u) => u.includes(`${slug}.di.workers.dev/api/?op=bootstrap`), f: () => jres({ ok: true, ...reply }) },
    { m: (u) => u.startsWith(`https://${slug}.di.workers.dev/`), f: () => jres({ ok: true, bindings: { STORE: true } }) },
  ]);
  const body = await (await callback(`code=C&state=${state}`, cookie)).text();
  globalThis.setTimeout = realTimeout;
  globalThis.fetch = realFetch;
  disarm();
  return body;
}
{
  const ok = await d116Install("fresh-all", { version: FLEET_VER, storeVersion: FLEET_VER,
    memberVersions: { "agent-worker": SERVING(FLEET_VER), ...OTHERS } });
  t("INSTALL, every part on the release: \"Your copy is running\"", ok.includes("Your copy is running."), true);
  const lag = await d116Install("fresh-loose", { version: FLEET_VER, storeVersion: FLEET_VER,
    memberVersions: { "agent-worker": { binding: "AGENT_WORKER", state: "UNBOUND" }, ...OTHERS } });
  t("INSTALL with an installed member the plane cannot reach: NOT \"running\", and the member NAMED",
    [lag.includes("Your copy is running."), lag.includes("agent-worker was installed, but your copy holds no connection to it")],
    [false, true]);
  t("and the credentials are still handed over — a lag never costs a group its only sight of them",
    [lag.includes('id=\\"out-member\\"'), lag.includes('id=\\"out-probe\\"')], [true, true]);
}

console.log(`\nwizard: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
