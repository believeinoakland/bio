/* installer R1–R42, each at the module's interface: the Worker's routes driven with a request, everything it reaches
 * answered by the fixture's stateful account, repository and copy; the embed step's exported functions; the pages it
 * serves, and the invitation page, as a browser receives them. A requirement not yet met is a `test.todo` naming its
 * cause (build/requirements/installer.md).
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import worker, * as installer from "../src/index.mjs";
import { CFG, planeLimits } from "../src/index.mjs";
import { GROUP_SLUG_RE, FLEET_BINDINGS, HOSTING_CONTROL, hostingControlBlock } from "../../bio-plane/src/setup-fleet.mjs";
import { setupPage } from "../../bio-plane/src/setup.mjs";
import { EXAMPLE_SLUG, PUBLISHER, PROFILE_CHOICES, PROFILES_NONE, PAGE_CSS, ASSISTANT_OFFER, DESCRIPTION, WHO } from "../src/ui.mjs";
import { RELEASE_VERSION, RELEASE_SOURCE } from "../src/release.mjs";
import { resolveVersion, checkSignedAsset, embedRelease } from "../scripts/embed-release.mjs";
import { verifySshsig, NS_RELEASE } from "../../bio-plane/src/sshsig.mjs";
import * as jurisdictions from "../../jurisdictions/index.mjs";
import { TOK, ORIGIN, req, begin, callback, cookieOf, cookieValue, b64url, script, realFetch, jres, run, release,
  SIGNER, STRANGER, armWith, disarm, restoreSigners, sha, bump, CAPABLE_SRC, PRE116_SRC, MEMBER_SRC, bindingOf,
  parsePage, LIMITS, LIMITS_STATEMENT, UNSTATED_SRC, BUILTIN_LIMITS, DEFAULT_VERSION, DESCRIPTOR, IMAGE, RUNNER } from "./fixture.mjs";

after(restoreSigners);
const NEXT = bump(RELEASE_VERSION);
const text = async (path) => (await req(path)).text();
const secretsOf = (put) => (put?.meta?.bindings || []).filter((b) => b.type === "secret_text");
/* Every page this suite renders, for R19, R22, R31 and R35, which hold over all of them: its words, and (R35) each page
   as the browser receives it, the streamed page's own scripts included. */
const PAGES = [], RAW = [];
const seen = (x) => { PAGES.push(typeof x === "string" ? x : x.page.words); RAW.push(typeof x === "string" ? x : x.raw); return x; };
const MEMBERS = FLEET_BINDINGS.map(([m]) => m), BINDINGS = FLEET_BINDINGS.map(([, b]) => b);
/* R21's choices are `jurisdictions`' data, shown as data: R22 and R31 hold over every other word of every page, so
   exactly the rendered name and coverage of each choice is taken out before they read a page. */
const withoutChoices = (page) => page.replace(/<span class="pname">[^<]*<\/span>/g, "")
  .replace(/<span class="small pcovers">[^<]*<\/span>/g, "")
  .replace(/<input type="checkbox" name="profile" value="[^"]*">/g, "");
const INVITATION = readFileSync(new URL("../../bio-plane/public/newgroup/index.html", import.meta.url), "utf8");

/* ------------------------------------------------------------------------------------------------ the routes */

test("R1 GET / serves the install page and GET /update the update page; any other path or method is a 404 plain page; no route stores anything", async () => {
  const calls = script([]);
  const home = await req("/"), up = await req("/update");
  const hb = seen(await home.text()), ub = seen(await up.text());
  assert.deepEqual([home.status, up.status], [200, 200]);
  assert.match(home.headers.get("content-type"), /text\/html/);
  assert.ok(hb.includes('mode:"install"') && !hb.includes('mode:"update"'), "the install page begins an install");
  assert.ok(ub.includes('mode:"update"') && !ub.includes('mode:"install"'), "the update page begins an update");
  for (const [path, init] of [["/nothing", {}], ["/update/x", {}], ["/begin", {}], ["/callback", { method: "POST" }],
                              ["/", { method: "POST" }], ["/favicon.ico", {}]]) {
    const r = await req(path, init);
    const b = seen(await r.text());
    assert.equal(r.status, 404, path);
    assert.match(b, /Nothing lives at this address/);
    assert.equal(r.headers.get("set-cookie"), null, `${path} sets nothing`);
  }
  /* Nothing to store into: the pages and a refusal reach no network and set no cookie. */
  assert.equal(home.headers.get("set-cookie"), null);
  assert.deepEqual(calls, []);
  globalThis.fetch = realFetch;
});

test("R2 POST /begin: the slug grammar and the wizard's own name refused 400 in words; a malformed instanceAi refused by name; else PKCE S256, a fresh state, exactly the four scopes (the Containers write scope among them), the registered redirect, and the 15-minute cookie; no field carries a Claude credential", async () => {
  for (const bad of ["", "ab", "-abc", "abc-", "Abc", "a_b", "a".repeat(41), "abc.def", "newgroup", 12345, null]) {
    const r = await req("/begin", { method: "POST", body: JSON.stringify({ slug: bad }) });
    const j = await r.json();
    assert.deepEqual([r.status, j.ok], [400, false], `slug ${JSON.stringify(bad)}`);
    assert.match(j.error, /3 to 40 characters: lower-case letters, digits, and hyphens, starting and ending with a letter or digit/);
    assert.equal(r.headers.get("set-cookie"), null);
  }
  for (const good of ["abc", "a1-b2", "a".repeat(40), "9to5"]) assert.equal((await begin(good)).j.ok, true, good);
  for (const badAi of ["short", "has a space-0123456789", "tab\there-0123456789", "x".repeat(513), "é".repeat(20)]) {
    const r = await req("/begin", { method: "POST", body: JSON.stringify({ slug: "ai-group", instanceAi: badAi }) });
    const j = await r.json();
    assert.deepEqual([r.status, j.ok], [400, false]);
    assert.match(j.error, /organisation AI credential/);
  }
  const AI = "aik-" + "7".repeat(20);
  const a = await begin("oak-watch", "update", { instanceAi: AI });
  const b = await begin("oak-watch", "something-else");
  const u = new URL(a.j.authorize);
  assert.equal(u.origin + u.pathname, CFG.AUTHORIZE);
  assert.deepEqual(Object.fromEntries([...u.searchParams].filter(([k]) => !["state", "code_challenge"].includes(k))), {
    response_type: "code", client_id: CFG.CLIENT_ID, redirect_uri: "https://newgroup.believeinoakland.workers.dev/callback",
    scope: "workers-scripts.write workers-r2.write account-settings.read containers.write", code_challenge_method: "S256" });
  assert.deepEqual(CFG.SCOPES, ["workers-scripts.write", "workers-r2.write", "account-settings.read", "containers.write"]);
  /* R36: a Claude credential sent to /begin is taken nowhere: the cookie holds no trace of it. */
  const CLAUDE = "sk-ant-oat01-" + "q".repeat(40);
  const c = await begin("no-claude", "install", { instanceClaude: CLAUDE, claude: CLAUDE });
  assert.equal(c.j.ok, true);
  assert.ok(!JSON.stringify(cookieValue(c.cookie)).includes(CLAUDE) && !c.r.headers.get("set-cookie").includes(CLAUDE));
  const saved = cookieValue(a.cookie), savedB = cookieValue(b.cookie);
  const challenge = createHash("sha256").update(saved.v).digest("base64url");
  assert.equal(u.searchParams.get("code_challenge"), challenge, "the challenge is S256 of the cookie's verifier");
  assert.equal(saved.s, a.state);
  assert.notEqual(a.state, b.state, "a fresh state each time");
  assert.notEqual(saved.v, savedB.v, "a fresh verifier each time");
  assert.deepEqual([saved.slug, saved.mode, saved.ai, typeof saved.t], ["oak-watch", "update", AI, "number"]);
  assert.deepEqual([savedB.mode, "ai" in savedB], ["install", false], "mode is update, or else install");
  assert.ok(Math.abs(saved.t - Date.now()) < 5000);
  const sc = a.r.headers.get("set-cookie");
  for (const attr of ["HttpOnly", "Secure", "SameSite=Lax", "Max-Age=900", "Path=/"]) assert.ok(sc.includes(attr), attr);
  assert.ok(!a.j.authorize.includes(saved.v), "the verifier never travels in the address");
});

test("R3 GET /callback always clears the cookie; a refusal, a missing code, a missing or unreadable cookie, a state mismatch or a stale cookie create nothing; otherwise it streams the install or the update", async () => {
  const calls = script([]);
  const cleared = (r) => /Max-Age=0/.test(r.headers.get("set-cookie") || "");
  const { cookie, state } = await begin("oak-watch");
  const stale = "bio_wiz=" + b64url(JSON.stringify({ ...cookieValue(cookie), t: Date.now() - 16 * 60 * 1000 }));
  const refused = await callback("error=access_denied&error_description=User+refused", cookie);
  seen(refused);
  assert.ok(cleared(refused.r));
  assert.match(refused.raw, /Permission was not granted/);
  assert.match(refused.raw, /nothing was created/);
  for (const [qs, ck, why] of [[`state=${state}`, cookie, "no code"], [`code=C&state=${state}`, null, "no cookie"],
       [`code=C&state=${state}`, "bio_wiz=%%%not-base64", "unreadable cookie"],
       [`code=C&state=${state}`, "bio_wiz=" + b64url("not json"), "cookie not JSON"],
       ["code=C&state=WRONG", cookie, "state mismatch"], [`code=C&state=${state}`, stale, "older than 15 minutes"]]) {
    const out = await callback(qs, ck);
    seen(out);
    assert.ok(cleared(out.r), why);
    assert.match(out.raw, /could not be verified/, why);
    assert.match(out.raw, /Nothing was created/, why);
  }
  assert.deepEqual(calls, [], "nothing upstream was touched");
  globalThis.fetch = realFetch;
  const inst = seen(await run({ slug: "cb-install" }));
  assert.ok(cleared(inst.r));
  assert.equal(inst.r.headers.get("content-type"), "text/html; charset=utf-8");
  assert.equal(inst.page.steps[0], "auth");
  assert.ok(inst.page.steps.includes("install"));
  const upd = seen(await run({ slug: "cb-update", mode: "update", pre: { "cb-update": [] } }));
  assert.ok(cleared(upd.r));
  assert.ok(upd.page.steps.includes("find") && upd.page.steps.includes("up") && !upd.page.steps.includes("install"));
});

/* ------------------------------------------------------------------------------------------------ the install */

const created = (w) => ({ scripts: [...w.acct.keys()].filter((k) => k !== "bio-plan-probe"), buckets: [...w.buckets] });

test("R4 a refusal at any step before `install` says nothing was created, and nothing was; the plan probe is deleted or named; the first account listed is used and named", async () => {
  const cases = [
    ["auth", { tokenFail: true }], ["acct", { accountsFail: true }], ["acct", { accounts: [] }],
    ["fresh", { settingsFail: true }], ["plan", { plan: "free" }], ["plan", { plan: "unknown" }], ["r2", { r2: "refused" }],
  ];
  for (const [step, opts] of cases) {
    const w = seen(await run({ slug: "early-" + step, ...opts }));
    assert.equal(w.page.status(step), "no", `${step} ${JSON.stringify(opts)}`);
    assert.match(`${w.page.failed.p} ${w.page.failed.d}`, /[Nn]othing was (created|installed)|nothing to clean up/, step);
    assert.deepEqual(created(w), { scripts: [], buckets: [] }, `${step}: nothing exists afterwards`);
    assert.ok(!w.acct.has("bio-plan-probe"), "no probe left behind");
    assert.ok(!w.page.done, "no panel");
  }
  /* R20 at `rel`, the first step after `fresh`: a built-in stating no limits with no usable repository release. */
  if (!BUILTIN_LIMITS.ok) {
    const w = seen(await run({ slug: "early-rel", rel: null }));
    assert.equal(w.page.status("rel"), "no");
    assert.match(w.page.failed.p, /Nothing was created/);
    assert.deepEqual(created(w), { scripts: [], buckets: [] });
    assert.ok(!w.acct.has("bio-plan-probe") && !w.calls.some((c) => c.u.includes("bio-plan-probe")), "refused before the probe");
  }
  const left = seen(await run({ slug: "probe-left", probeDelete: "fail" }));
  assert.equal(left.page.status("plan"), "ok");
  assert.match(left.page.label("plan"), /"bio-plan-probe" could not be deleted/);
  const clean = seen(await run({ slug: "probe-clean" }));
  assert.ok(!clean.acct.has("bio-plan-probe"), "the probe was deleted");
  const two = seen(await run({ slug: "two-accounts", accounts: [{ id: "first", name: "The First" }, { id: "second", name: "The Second" }] }));
  assert.equal(two.page.label("acct"), 'Using the account "The First"');
  assert.ok(two.calls.every((c) => !c.u.includes("/accounts/second")), "only the first account is touched");
  assert.ok(two.calls.some((c) => c.u.includes("/accounts/first/workers/scripts/two-accounts")));
});

test("R5 `fresh`: an existing script named for the slug is refused and nothing is changed; a failed lookup is refused", async () => {
  const pre = { "taken-name": [{ type: "plain_text", name: "VERSION", text: "0.1.0" }] };
  const w = seen(await run({ slug: "taken-name", pre }));
  assert.equal(w.page.status("fresh"), "no");
  assert.match(w.page.failed.h, /An installation named "taken-name" already exists/);
  assert.match(w.page.failed.p, /Nothing was changed/);
  assert.deepEqual(w.acct.get("taken-name"), pre["taken-name"]);
  assert.ok(!w.calls.some((c) => c.method !== "GET" && c.u.startsWith(CFG.API)), "no write of any kind");
  const f = seen(await run({ slug: "lookup-fails", settingsFail: true }));
  assert.equal(f.page.status("fresh"), "no");
  assert.match(f.page.failed.h, /Could not check your account/);
  assert.ok(!f.calls.some((c) => c.method !== "GET" && c.u.startsWith(CFG.API)));
});

test("R6 `plan` is found by upload: a probe with limits.cpu_ms refused 100328 is Free and refused saying Workers Paid and how; any other failure is unknown and refused; Paid is confirmed", async () => {
  const paid = seen(await run({ slug: "plan-paid" }));
  const probe = paid.calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/bio-plan-probe"));
  assert.ok(JSON.parse(await probe.init.body.get("metadata").text()).limits.cpu_ms > 0);
  /* The release is chosen first (R20 with R4: before anything is created); it is read from the public repository, not the account. */
  const before = paid.calls.slice(0, paid.calls.indexOf(probe)).filter((c) => !c.u.startsWith(CFG.RELEASE_LATEST))
    .map((c) => `${c.method} ${c.u.replace(CFG.API, "")}`);
  assert.deepEqual(before, [`POST ${CFG.TOKEN}`, "GET /accounts", "GET /accounts/A1/workers/scripts/plan-paid/settings",
    /* R32's look for another copy: the two buckets and the members, by name, never a plan field. */
    "GET /accounts/A1/r2/buckets/bio-captures", "GET /accounts/A1/r2/buckets/bio-published",
    ...MEMBERS.map((m) => `GET /accounts/A1/workers/scripts/${m}/settings`)],
    "no plan field is read before the probe");
  assert.equal(paid.page.label("plan"), "Workers Paid confirmed");
  const free = seen(await run({ slug: "plan-free", plan: "free" }));
  assert.match(free.page.failed.h, /Workers Paid plan is needed/);
  assert.match(free.page.failed.d, /open Workers & Pages, choose Plans, enable Workers Paid/);
  const unknown = seen(await run({ slug: "plan-unknown", plan: "unknown" }));
  assert.match(unknown.page.failed.h, /Could not verify your account's Workers plan/);
  assert.ok(!unknown.page.words.includes("Workers Paid plan is needed"), "unknown is never said to be Free");
  assert.match(unknown.page.failed.d, /internal error/);
  for (const w of [free, unknown]) assert.ok(!w.page.steps.includes("r2"), "refused before the first creation");
});

test("R7 `r2`: both evidence buckets exist afterwards (\"already exists\" counts), or the install is refused saying a payment method is needed", async () => {
  const w = seen(await run({ slug: "r2-fresh" }));
  assert.deepEqual([...w.buckets].sort(), ["bio-captures", "bio-published"]);
  /* Under R32 an install meets a bucket already there only by a race: one created between R32's look and this step. */
  const again = seen(await run({ slug: "r2-again", r2: "late" }));
  assert.equal(again.page.status("r2"), "ok");
  assert.deepEqual([...again.buckets].sort(), ["bio-captures", "bio-published"]);
  assert.ok(again.page.steps.includes("install"));
  const no = seen(await run({ slug: "r2-refused", r2: "refused" }));
  assert.equal(no.page.status("r2"), "no");
  assert.match(no.page.failed.p, /requires a payment method on the account/);
  assert.match(no.page.failed.d, /add a card or PayPal/);
  assert.ok(!no.acct.has("r2-refused"));
});

test("R8 `rel`: the repository's release installs only when newer, hashing to its manifest and (armed) signed in the release namespace by an armed key; otherwise the built-in installs and the page says why", async () => {
  const cases = [
    ["newer, signed", { version: NEXT }, "repository", /newer than the built-in .* valid signature from a key this installer trusts/],
    ["not newer", { version: RELEASE_VERSION }, "built-in", /The built-in release \(.+\) is current/],
    ["older", { version: "0.0.1" }, "built-in", /is current/],
    ["integrity", { version: NEXT, tamperPlane: true }, "built-in", /did not pass its integrity check, so it was NOT used/],
    ["unsigned", { version: NEXT, sig: "none" }, "built-in", /carries no signature/],
    ["stranger", { version: NEXT, sig: "stranger" }, "built-in", /not by a key this installer trusts \(UNKNOWN_KEY\)/],
    ["wrong namespace", { version: NEXT, sig: "wrong-ns" }, "built-in", /not by a key this installer trusts \(NAMESPACE\)/],
    ["unreachable", null, "built-in", /was not reachable just now/],
  ];
  armWith(SIGNER.line);
  for (const [why, opts, from, says] of cases) {
    let rel = null;
    if (opts) { rel = await release({ ...opts, fleet: false }); if (opts.tamperPlane) rel.assets["bio-plane.bundled.mjs"] = "tampered"; }
    const w = seen(await run({ slug: "rel-" + why.replace(/\W+/g, "-"), rel }));
    assert.match(w.page.label("rel"), says, why);
    const put = w.planePuts[0];
    /* The built-in installs in its place, unless it states no limits, when R20 refuses the act (asserted under R20). */
    if (from === "built-in" && !BUILTIN_LIMITS.ok) { assert.equal(put, undefined, why); continue; }
    assert.equal(put.source, from === "repository" ? rel.src : RELEASE_SOURCE, why);
    assert.equal(bindingOf(put, "VERSION").text, from === "repository" ? NEXT : RELEASE_VERSION, why);
  }
  disarm();
  const rel = await release({ version: NEXT, sig: "none", fleet: false });
  const w = seen(await run({ slug: "rel-unarmed", rel }));
  assert.equal(w.planePuts[0].source, rel.src, "unarmed, the hash alone admits it");
  assert.match(w.page.label("rel"), /Its integrity checked out/);
  const bad = await release({ version: NEXT, sig: "none", fleet: false });
  bad.assets["bio-plane.bundled.mjs"] = "tampered";
  assert.ok((await run({ slug: "rel-unarmed-bad", rel: bad })).planePuts.every((p) => p.source === RELEASE_SOURCE), "nothing that failed is installed");
  restoreSigners();
});

test("R9 `gen`: fresh 32-byte random credentials (the four, and the seal secret, K1541); INSTANCE_AI_TOKEN bound only when the operator supplied a valid one, never generated", async () => {
  const a = seen(await run({ slug: "gen-a" })), b = seen(await run({ slug: "gen-b" }));
  const names = (w) => secretsOf(w.planePuts[0]).map((s) => s.name).sort();
  assert.deepEqual(names(a), ["ACCOUNT_SEAL_SECRET", "ADMIN_TOKEN", "DAEMON_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN"]);
  const values = [...secretsOf(a.planePuts[0]), ...secretsOf(b.planePuts[0])].map((s) => s.text);
  for (const v of values) assert.equal(Buffer.from(v, "base64url").length, 32, "32 random bytes, base64url");
  assert.equal(new Set(values).size, 10, "distinct within an install and across installs");
  const AI = "aik-" + "5".repeat(30);
  const ai = seen(await run({ slug: "gen-ai", ai: AI }));
  assert.deepEqual(secretsOf(ai.planePuts[0]).filter((s) => s.name === "INSTANCE_AI_TOKEN").map((s) => s.text), [AI]);
  for (const w of [a, b]) for (const p of w.planePuts) assert.equal(bindingOf(p, "INSTANCE_AI_TOKEN"), null);
});

test("R10 `install`: the plane uploaded with STORE (SQLite v1), VERSION, INSTANCE_NAME, the credentials, both buckets, SELF, BROWSER, the members present, the limits and the plane's compatibility; a refusal retries once without SELF, else nothing is left", async () => {
  const cfg = readFileSync(new URL("../../bio-plane/wrangler.jsonc", import.meta.url), "utf8");
  const compatDate = cfg.match(/"compatibility_date":\s*"([^"]+)"/)[1];
  const compatFlags = JSON.parse(cfg.match(/"compatibility_flags":\s*(\[[^\]]*\])/)[1]);
  /* Under R32 an install's account holds no member (one that does is refused, below), so the members present are none. */
  const w = seen(await run({ slug: "inst-shape", ai: "aik-" + "3".repeat(20) }));
  const m = w.planePuts[0].meta;
  assert.deepEqual(m.migrations, { new_tag: "v1", new_sqlite_classes: ["Store"] });
  assert.deepEqual([m.main_module, m.compatibility_date, m.compatibility_flags], ["index.mjs", compatDate, compatFlags]);
  assert.deepEqual(m.limits, { ...LIMITS }, "the release's own statement (R20)");
  const by = Object.fromEntries(m.bindings.map((b) => [b.name, b]));
  assert.deepEqual(by.STORE, { type: "durable_object_namespace", name: "STORE", class_name: "Store" });
  assert.equal(by.VERSION.text, DEFAULT_VERSION);
  assert.deepEqual(by.INSTANCE_NAME, { type: "plain_text", name: "INSTANCE_NAME", text: "inst-shape" });
  assert.deepEqual([by.CAPTURES.bucket_name, by.PUBLISHED.bucket_name], ["bio-captures", "bio-published"]);
  assert.deepEqual(by.SELF, { type: "service", name: "SELF", service: "inst-shape" });
  assert.deepEqual(by.BROWSER, { type: "browser", name: "BROWSER" });
  for (const name of BINDINGS) assert.equal(by[name], undefined, `${name}: no member present, none bound`);
  assert.equal(by.INSTANCE_AI_TOKEN.type, "secret_text");
  assert.equal(by.ACCOUNT_SEAL_SECRET.type, "secret_text");
  assert.equal(Object.keys(by).length, 13, "nothing else: " + Object.keys(by).join(","));
  const held = seen(await run({ slug: "inst-held", pre: { "pdf-worker": [{ type: "plain_text", name: "VERSION", text: "0.1.0" }] } }));
  assert.equal(held.planePuts.length, 0, "an account already holding a member is refused (R32), never bound into an install");
  const shy = seen(await run({ slug: "inst-shy", refuseSelf: true }));
  assert.equal(shy.planePuts.length, 1, "the retry landed");
  assert.equal(bindingOf(shy.planePuts[0], "SELF"), null);
  assert.equal(shy.refused.filter((r) => r.startsWith("inst-shy")).length, 1, "retried exactly once");
  assert.match(shy.page.label("install"), /re-check documents on its own schedule — was refused by Cloudflare and was left out.*Running the updater later turns it on/s);
  const no = seen(await run({ slug: "inst-refused", refuseAllPlane: true }));
  assert.equal(no.refused.length, 2, "tried with SELF, then once without");
  assert.equal(no.page.status("install"), "no");
  assert.match(no.page.failed.p, /nothing left behind to clean up/);
  assert.ok(!no.acct.has("inst-refused"));
  assert.ok(!no.page.done);
});

test("R11 `fleet`: members install only from a reachable repository whose signed fleet statement verifies against an armed key and names the plane just installed; each part hashed; an unknown part type refuses that member; sheet-worker installs as any member; every member left out is named; the install never fails over one", async () => {
  armWith(SIGNER.line);
  const full = seen(await run({ slug: "fleet-all", rel: await release({ version: NEXT }) }));
  for (const member of MEMBERS) assert.ok(full.acct.has(member), member);
  assert.deepEqual(full.acct.get("agent-worker").find((b) => b.name === "PLANE"), { type: "service", name: "PLANE", service: "fleet-all" });
  assert.match(full.page.label("fleet"), new RegExp(`All ${MEMBERS.length} capability workers installed and verified`));
  const noneOf = async (why, opts, says, runOpts = {}) => {
    const w = seen(await run({ slug: "fleet-" + why, rel: opts && await release({ version: NEXT, ...opts }), ...runOpts }));
    for (const member of MEMBERS) assert.ok(!w.acct.has(member), `${why}: ${member} not installed`);
    assert.match(w.page.label("fleet"), says, why);
    assert.equal(w.page.status("install"), "ok", `${why}: the plane installed`);
    assert.ok(w.page.done, `${why}: the install finished`);
  };
  /* The two arms that fall back to the built-in run only when it states its limits (else R20 refuses the act). */
  if (BUILTIN_LIMITS.ok) await noneOf("unreachable", null, /was not reachable, so no capability workers were installed/);
  await noneOf("no-fleet", { fleet: false }, /names no capability workers/);
  await noneOf("no-fleetsig", { fleetSig: "none" }, /names no capability workers/);
  await noneOf("dropped", { signedMembers: ["agent-worker", "pdf-worker", "ocr-worker", "extra-worker"] }, /fleet signature did not verify/);
  /* K1905: the words are R40's (T34-84): "a different release of Civicsmith", never "plane". */
  if (BUILTIN_LIMITS.ok) await noneOf("foreign-plane", { sig: "stranger" }, /signed against a different release of Civicsmith than the one just installed/);
  if (BUILTIN_LIMITS.ok) await noneOf("not-newer", { version: RELEASE_VERSION }, /signed against a different release of Civicsmith than the one just installed/);
  disarm();
  await noneOf("unarmed", {}, /carries no signing key/);
  armWith(SIGNER.line);
  const part = seen(await run({ slug: "fleet-part", rel: await release({ version: NEXT, badType: "ocr-worker" }) }));
  assert.ok(!part.acct.has("ocr-worker") && part.acct.has("pdf-worker") && part.acct.has("agent-worker"));
  assert.match(part.page.label("fleet"), /ocr-worker \(part assets\/x\.wasm has module type 'Mystery' this installer does not know/);
  const bytes = seen(await run({ slug: "fleet-hash", rel: await release({ version: NEXT, tamper: "pdf-worker", missing: "agent-worker" }) }));
  assert.ok(!bytes.acct.has("pdf-worker") && !bytes.acct.has("agent-worker") && bytes.acct.has("ocr-worker"));
  const said = bytes.page.label("fleet");
  const rest = MEMBERS.filter((m) => m !== "pdf-worker" && m !== "agent-worker");
  assert.ok(said.startsWith(`${rest.length} capability worker(s) installed (${rest.join(", ")}); 2 left out: `), said);
  assert.ok(said.includes("pdf-worker (pdf-worker failed its integrity check)") && said.includes("agent-worker (agent-worker http 404)"), said);
  assert.ok(bytes.page.done, "the install never fails over a member");
  /* T33-91: sheet-worker installs as any member (inactive until the release that activates it, K1506); a container
     member is R38's. */
  const sheet = seen(await run({ slug: "fleet-sheet", rel: await release({ version: NEXT, members: [...new Set([...MEMBERS, "sheet-worker"])] }) }));
  assert.ok(sheet.acct.has("sheet-worker"));
  assert.match(sheet.page.label("fleet"), new RegExp(`All ${new Set([...MEMBERS, "sheet-worker"]).size} capability workers installed and verified: .*sheet-worker`));
  const ocr = full.calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/ocr-worker"));
  assert.equal(ocr.init.body.get("assets/x.wasm").type, "application/wasm", "a part is uploaded under its stated type");
  restoreSigners();
});

test("R12 `bind`: the plane bound first to the members already present, then the members installed, then (only when one was added) re-uploaded bound to every member present; a refused re-upload is named and the members stay", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const RIGHT = Object.fromEntries(FLEET_BINDINGS.map(([m, b]) => [b, m]));
  const targets = (bindings) => Object.fromEntries(BINDINGS.map((b) => [b, (bindings || []).find((x) => x.name === b)?.service ?? null]));
  const fresh = seen(await run({ slug: "bind-fresh", rel }));
  assert.equal(fresh.planePuts.length, 2);
  assert.deepEqual(targets(fresh.planePuts[0].bindings), Object.fromEntries(BINDINGS.map((b) => [b, null])), "act 1: none present");
  assert.deepEqual(targets(fresh.planePuts[1].bindings), RIGHT, "act 3: every member");
  assert.deepEqual(fresh.refused, [], "never a binding to a worker not yet there");
  const puts = fresh.calls.filter((c) => c.method === "PUT" && /\/workers\/scripts\/[^/]+$/.test(c.u) && !c.u.endsWith("bio-plan-probe"))
    .map((c) => c.u.split("/scripts/")[1]);
  assert.equal(puts[0], "bind-fresh"); assert.equal(puts.at(-1), "bind-fresh");
  assert.deepEqual(puts.slice(1, -1).sort(), MEMBERS.slice().sort(), "act 2 between");
  assert.equal(fresh.planePuts[1].meta.migrations, undefined, "the re-upload takes the update's shape");
  assert.match(fresh.page.label("bind"), /Your group's Civicsmith is connected to/);
  /* Members already present: under R32 only an update meets them (R17 runs `bind` as here), so the first act is shown there. */
  const old = [{ type: "plain_text", name: "VERSION", text: "0.1.0" }];
  const had = seen(await run({ slug: "bind-had", mode: "update", rel,
    pre: { "bind-had": planeBase("bind-had"), ...Object.fromEntries(MEMBERS.map((m) => [m, old])) } }));
  assert.equal(had.planePuts.length, 1, "nothing added, no re-upload");
  assert.deepEqual(targets(had.planePuts[0].bindings), RIGHT, "act 1 binds every member already present");
  const bad = seen(await run({ slug: "bind-refused", rel, refuseRePut: true }));
  assert.equal(bad.page.status("bind"), "no");
  assert.match(bad.page.label("bind"), /installed, but connecting your group's Civicsmith to them was refused/);
  for (const m of MEMBERS) assert.ok(bad.acct.has(m), `${m} stays installed`);
  restoreSigners();
});

test.todo("R13 each member that reads captured bytes is bound to the instance's CAPTURES bucket (not yet met: MULTI-INSTANCE-ISOLATION row 6; installed members get no R2 binding)");

test("R14 `addr`: the account's workers.dev prefix is used; with none, one is registered from the slug (or with a suffix) and said; the address is enabled; a failure says the copy is installed without an address", async () => {
  const has = seen(await run({ slug: "addr-has", subdomain: "grp" }));
  assert.ok(has.enabled.has("addr-has"));
  assert.equal(has.page.events.find((e) => e.k === "ok" && e.id === "addr").label, null, "nothing to say");
  assert.ok(has.calls.some((c) => c.u === "https://addr-has.grp.workers.dev/api/?op=selftest"
    && c.init.headers?.authorization === "Bearer " + bindingOf(has.planePuts[0], "PROBE_TOKEN").text), "the address enabled is the one verified");
  const none = seen(await run({ slug: "addr-none", subdomain: null }));
  assert.equal(none.prefix(), "addr-none");
  assert.match(none.page.label("addr"), /had no web address prefix yet, so it is now "addr-none"/);
  const taken = seen(await run({ slug: "addr-taken", subdomain: null, taken: ["addr-taken"] }));
  assert.match(taken.prefix(), /^addr-taken-[a-z0-9x]{1,4}$/);
  assert.match(taken.page.label("addr"), new RegExp(`so it is now "${taken.prefix()}"`));
  assert.match(taken.page.done, new RegExp(`https://addr-taken\\.${taken.prefix()}\\.workers\\.dev`));
  for (const opts of [{ subdomain: null, subdomainPut: "fail" }, { enableFail: true }]) {
    const w = seen(await run({ slug: "addr-fails", ...opts }));
    assert.equal(w.page.status("addr"), "no");
    assert.match(w.page.failed.h, /installed but has no address yet/);
    assert.match(w.page.failed.p, /without starting over/);
    assert.ok(w.acct.has("addr-fails"), "the copy stays installed");
  }
});

test("R15 `verify`: op=selftest with the probe credential up to ten tries, the credential only in each request's Authorization: Bearer header and in no address; a capable release's parts read back until each answers it, every lagging part named; an incapable release's parts stated undetermined; no success while a part lags", async () => {
  const quiet = seen(await run({ slug: "ver-quiet", copy: { selftest: () => jres({ ok: false }) } }));
  const probe = bindingOf(quiet.planePuts[0], "PROBE_TOKEN").text;
  const tries = quiet.calls.filter((c) => c.u.includes("op=selftest"));
  assert.equal(tries.length, 10);
  /* F1 (K1874): every verify request carries the probe credential in its header, exactly as admission R20 reads it, and
     its address is the bare op. */
  for (const c of tries) {
    assert.equal(c.u, "https://ver-quiet.grp.workers.dev/api/?op=selftest");
    assert.equal(c.init.headers?.authorization, "Bearer " + probe);
  }
  assert.equal(quiet.page.status("verify"), "no");
  assert.match(quiet.page.done, /has not woken up yet/);
  /* The sentinel: in a whole install, verify included, the probe credential (and every other credential the install
     generated, and the Cloudflare token) is in no address of any request the installer makes, and the probe credential
     reaches the copy only in the verify step's header. */
  const ok = seen(await run({ slug: "ver-sentinel" }));
  const secrets = secretsOf(ok.planePuts[0]).map((b) => b.text);
  const sentinel = bindingOf(ok.planePuts[0], "PROBE_TOKEN").text;
  for (const c of ok.calls) for (const v of [...secrets, TOK]) assert.equal(c.u.includes(v), false, `${c.method} ${c.u}`);
  const carried = ok.calls.filter((c) => JSON.stringify(c.init.headers || {}).includes(sentinel));
  assert.ok(carried.length >= 1 && carried.every((c) => c.u === "https://ver-sentinel.grp.workers.dev/api/?op=selftest"),
    "the probe credential travels only to the verify step, in its header");
  assert.equal(ok.page.status("verify"), "ok");
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const all = seen(await run({ slug: "ver-all", rel }));
  assert.equal(all.page.status("verify"), "ok");
  assert.ok(all.calls.some((c) => c.u.includes("op=bootstrap&members=1")));
  assert.match(all.page.done, /Your group's Civicsmith is running\./);
  const lags = [
    [{ storeVersion: "0.1.0" }, "the record store of your group&#39;s Civicsmith still runs 0.1.0"],
    [{ memberVersion: "0.1.0" }, "the capability worker pdf-worker still runs 0.1.0"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, memberVersions: s.members }) }, "record store of your group&#39;s Civicsmith has not reported its version"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: null, memberVersions: s.members }) }, "record store of your group&#39;s Civicsmith cannot say which version it runs"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: s.v }) }, "your group&#39;s Civicsmith did not report its capability workers"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: "0.1.0", storeVersion: s.v, memberVersions: s.members }) }, "the address of your group&#39;s Civicsmith answers 0.1.0"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: s.v, memberVersions: { ...s.members, "ocr-worker": { state: "SILENT" } } }) }, "cannot get an answer from the capability worker ocr-worker, which this step installed"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: s.v, memberVersions: { ...s.members, "ocr-worker": { state: "MISNAMED", name: "pdf-worker" } } }) }, "the connection of your group&#39;s Civicsmith to ocr-worker reaches a different worker (pdf-worker)"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: s.v, memberVersions: { ...s.members, "ocr-worker": { state: "UNBOUND" } } }) }, "ocr-worker was installed, but your group&#39;s Civicsmith holds no connection to it"],
    [{ bootstrap: (q, s) => { const mv = { ...s.members }; delete mv["ocr-worker"]; return jres({ ok: true, version: s.v, storeVersion: s.v, memberVersions: mv }); } }, "ocr-worker was installed, but your group&#39;s Civicsmith does not know it"],
  ];
  for (const [copy, named] of lags) {
    const w = seen(await run({ slug: "ver-lag", rel, copy }));
    assert.equal(w.page.status("verify"), "no", named);
    assert.ok(w.page.done.includes(named), named);
    assert.ok(!w.page.done.includes("Your group's Civicsmith is running."), named);
    assert.ok(w.page.done.includes('id="out-boot"'), "the credentials are still handed over");
  }
  const failed = seen(await run({ slug: "ver-failed", rel: await release({ version: NEXT, missing: "ocr-worker" }) }));
  assert.ok(failed.page.done.includes("ocr-worker could not be installed, so your group&#39;s Civicsmith has no OCR_WORKER connection"));
  const pre = await release({ version: NEXT, src: PRE116_SRC });
  const inc = seen(await run({ slug: "ver-pre", rel: pre }));
  assert.equal(inc.page.status("verify"), "ok");
  assert.match(inc.page.label("verify"), /This release cannot report which version the record store of your group's Civicsmith or its capability workers are running/);
  assert.ok(!inc.calls.some((c) => c.u.includes("op=bootstrap&members=1")), "nothing to read back");
  restoreSigners();
});

test("R16 the final panel shows the address, the one-time password and the member and probe credentials once; never DAEMON_TOKEN, ACCOUNT_SEAL_SECRET, INSTANCE_AI_TOKEN or the Cloudflare token; it hands over with the one-time password in the fragment", async () => {
  const AI = "aik-" + "c".repeat(24);
  const w = seen(await run({ slug: "panel", ai: AI }));
  const s = Object.fromEntries(secretsOf(w.planePuts[0]).map((b) => [b.name, b.text]));
  const count = (hay, needle) => hay.split(needle).length - 1;
  assert.equal(count(w.raw, s.ADMIN_TOKEN), 1);
  assert.equal(count(w.raw, s.MEMBER_TOKEN), 1);
  assert.equal(count(w.raw, s.PROBE_TOKEN), 1);
  for (const hidden of [s.DAEMON_TOKEN, s.ACCOUNT_SEAL_SECRET, s.INSTANCE_AI_TOKEN, TOK]) assert.equal(w.raw.includes(hidden), false);
  assert.equal(typeof s.ACCOUNT_SEAL_SECRET, "string", "the seal secret was bound (K1541)");
  assert.match(w.page.done, /id="out-url">https:\/\/panel\.grp\.workers\.dev</);
  assert.match(w.page.done, /id="out-boot">/);
  assert.match(w.page.done, /<button id="handover" data-url="https:\/\/panel\.grp\.workers\.dev\/">/);
  assert.ok(w.raw.includes(`location.href=h.dataset.url+"#boot="+encodeURIComponent(document.getElementById("out-boot").textContent)`));
});

test("R34 the wizard's last screen shows, before the hand-over to your group's Civicsmith where the founder chooses a password, instance-setup R47's block in DEC-109's words (the same export), and asks for and records no acknowledgement; it names what it hands over to as \"your group's Civicsmith\" (R40)", async () => {
  const escd = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  /* DEC-109's five points, each held in the one export both pages read. The words are instance-setup's (R47, which its
     own T34 job re-words for DEC-149), so each point is read by its meaning, not its exact wording. */
  const S = HOSTING_CONTROL.sentences;
  for (const [i, says] of [[0, /hosting account.*controls.*replace the one-time password.*claim.*again.*read everything.*lock everyone else out.*no vote of the group's administrators can stop them/s],
      [1, /group account.*not anyone's personal login/], [2, /at least one other trusted person/],
      [3, /someone other than the group's administrators hold it/], [4, /same account is the way back in if the password you choose is lost/]])
    assert.match(S[i], says, `point ${i + 1}`);
  const block = hostingControlBlock("notice");
  armWith(SIGNER.line);
  /* Every ending of the install that hands over: running, lagging, asleep. */
  const ends = [seen(await run({ slug: "last-ok", rel: await release({ version: NEXT }) })),
    seen(await run({ slug: "last-lag", rel: await release({ version: NEXT }), copy: { storeVersion: "0.1.0" } })),
    seen(await run({ slug: "last-asleep", copy: { selftest: () => jres({ ok: false }) } }))];
  restoreSigners();
  for (const w of ends) {
    const done = w.page.done;
    const at = done.indexOf(block), hand = done.indexOf('<button id="handover"');
    assert.ok(at > 0 && hand > at, "the block, whole, before the hand-over");
    /* R40: the hand-over names what it hands over to as "your group's Civicsmith". */
    assert.ok(done.includes(`>Go to your group&#39;s Civicsmith and finish setup</button>`), "the hand-over's words");
    assert.equal(done.split(block).length - 1, 1, "shown once");
    for (const s of [HOSTING_CONTROL.heading, ...S]) assert.ok(done.slice(0, hand).includes(escd(s)), s);
    /* The reassurance-only paragraph it replaces is gone. */
    assert.ok(!done.includes("you are not locked out"), "the old paragraph is gone");
    /* No acknowledgement: no control but the copy buttons and the hand-over, nothing gating it, nothing sent. */
    assert.deepEqual([...done.matchAll(/<(input|select|textarea)\b/g)].length, 0, "no input of any kind");
    assert.deepEqual([...done.matchAll(/<button\b[^>]*>/g)].map((m) => m[0]).filter((b) => !/class="copy"/.test(b)),
      [`<button id="handover" data-url="${done.match(/data-url="([^"]*)"/)[1]}">`], "the hand-over is the only other control, never disabled");
  }
  assert.ok(!w0(ends).raw.includes("acknowledg"), "nothing on the page asks for an acknowledgement");
  /* The very words instance-setup's claim page shows (R47): the same block from the same export. */
  const claim = setupPage({ answered: true, result: { ok: true, group: null } });
  assert.ok(claim.includes(block), "the claim page shows the same block");
});
const w0 = (ends) => ({ raw: ends.map((w) => w.raw).join("\n") });

/* ------------------------------------------------------------------------------------------------ the update */

const planeBase = (slug, v = "0.1.0") => [{ type: "durable_object_namespace", name: "STORE", class_name: "Store" },
  { type: "plain_text", name: "VERSION", text: v }, { type: "secret_text", name: "ADMIN_TOKEN", text: "admin-kept" },
  { type: "secret_text", name: "MEMBER_TOKEN", text: "member-kept" }, { type: "secret_text", name: "PROBE_TOKEN", text: "probe-kept" },
  { type: "service", name: "SELF", service: slug }];

test("R17 the update: no script refused unchanged; buckets where possible; the release chosen as R8; the version before read; the credentials, store and buckets kept and the rest restated; a refused upload leaves the copy; fleet, bind, verify as install; a no-op says so", async () => {
  const none = seen(await run({ slug: "upd-none", mode: "update" }));
  assert.equal(none.page.status("find"), "no");
  assert.match(none.page.failed.h, /No installation named "upd-none" exists/);
  assert.ok(!none.calls.some((c) => c.method !== "GET" && c.u.startsWith(CFG.API)));
  const AI = "aik-" + "u".repeat(20);
  const w = seen(await run({ slug: "upd", mode: "update", pre: { upd: planeBase("upd") }, ai: AI }));
  assert.ok(w.calls.findIndex((c) => c.u.endsWith("/api/?op=bootstrap")) < w.calls.findIndex((c) => c.method === "PUT"), "before is read first");
  const m = w.planePuts[0].meta;
  assert.equal("migrations" in m, false);
  assert.deepEqual(m.keep_bindings.slice().sort(), ["durable_object_namespace", "secret_text"]);
  const by = Object.fromEntries(m.bindings.map((b) => [b.name, b]));
  /* K1541: the copy held no seal secret (its settings say so), so the update gives it one. */
  assert.deepEqual(Object.keys(by).sort(), ["ACCOUNT_SEAL_SECRET", "BROWSER", "CAPTURES", "DAEMON_TOKEN", "INSTANCE_AI_TOKEN", "INSTANCE_NAME", "PUBLISHED", "SELF", "VERSION"]);
  assert.deepEqual([by.VERSION.text, by.INSTANCE_NAME.text, by.SELF.service, by.INSTANCE_AI_TOKEN.text], [DEFAULT_VERSION, "upd", "upd", AI]);
  assert.deepEqual(m.limits, { ...LIMITS }, "the release's limits restated (R20)");
  assert.equal(Buffer.from(by.DAEMON_TOKEN.text, "base64url").length, 32);
  const kept = Object.fromEntries(w.acct.get("upd").filter((b) => b.type === "secret_text").map((b) => [b.name, b.text]));
  assert.deepEqual([kept.ADMIN_TOKEN, kept.MEMBER_TOKEN, kept.PROBE_TOKEN], ["admin-kept", "member-kept", "probe-kept"]);
  assert.match(w.page.done, new RegExp(`Updated from 0\\.1\\.0 to ${DEFAULT_VERSION.replace(/\./g, "\\.")}`));
  const noR2 = seen(await run({ slug: "upd-nor2", mode: "update", pre: { "upd-nor2": planeBase("upd-nor2") }, r2: "refused" }));
  const mm = noR2.planePuts[0].meta;
  assert.ok(mm.keep_bindings.includes("r2_bucket") && !mm.bindings.some((b) => b.type === "r2_bucket"), "buckets kept, not re-bound");
  assert.equal(noR2.page.status("up"), "ok", "never refused over storage");
  const refused = seen(await run({ slug: "upd-ref", mode: "update", pre: { "upd-ref": planeBase("upd-ref") }, refuseUpdate: true }));
  assert.match(refused.page.failed.p, /still running the version it had before. Nothing about it changed/);
  assert.deepEqual(refused.acct.get("upd-ref"), planeBase("upd-ref"));
  armWith(SIGNER.line);
  const fl = seen(await run({ slug: "upd-fleet", mode: "update", pre: { "upd-fleet": planeBase("upd-fleet") }, rel: await release({ version: NEXT }) }));
  for (const member of MEMBERS) assert.ok(fl.acct.has(member), member);
  assert.deepEqual(fl.planePuts.at(-1).bindings.filter((b) => BINDINGS.includes(b.name)).length, BINDINGS.length);
  assert.equal(fl.page.status("verify"), "ok");
  assert.match(fl.page.done, /Every part of your group's Civicsmith answers/);
  restoreSigners();
  const same = seen(await run({ slug: "upd-same", mode: "update", pre: { "upd-same": planeBase("upd-same", DEFAULT_VERSION) } }));
  assert.match(same.page.label("up") ?? same.page.events.find((e) => e.id === "up").label, /already runs/);
  assert.match(same.page.done, /Nothing changed: your group&#39;s Civicsmith was already running/);
  assert.ok(!/<b>Updated (from|to)/.test(same.page.done));
});

test("R18 an update crossing the first group-recording release (0.71.0) tells the seed act, what is refused until it is done, the installed name only as a suggestion; conditional when the version before is unknown; never performed", async () => {
  const groupCalls = (w) => w.calls.filter((c) => /op=instancegroup/.test(c.u));
  const cross = seen(await run({ slug: "cross", mode: "update", pre: { cross: planeBase("cross", "0.70.0") } }));
  assert.match(cross.page.done, /One thing this update does not do for you/);
  assert.match(cross.page.done, /Your group&#39;s Civicsmith ran 0\.70\.0 before this update/);
  assert.match(cross.page.done, /GROUP_UNDETERMINED/);
  assert.match(cross.page.done, /POST https:\/\/cross\.grp\.workers\.dev\/api\/\?op=instancegroupseed<\/span>/);
  /* F1 (K1874): the act is told with the credential in its header, never in the address. */
  assert.match(cross.page.done, /in its header, never in the address/);
  assert.match(cross.page.done, /Authorization: Bearer &hellip;/);
  assert.ok(!/token=/.test(cross.page.done), "no credential in the address it tells");
  assert.match(cross.page.done, /store=scratch/);
  assert.match(cross.page.done, /A suggestion, not a default: your group&#39;s Civicsmith was installed under the name <span class="mono">cross<\/span>/);
  const fog = seen(await run({ slug: "fog", mode: "update", pre: { fog: planeBase("fog", "0.70.0") }, copy: { before: null } }));
  assert.match(fog.page.done, /could not read which version your group&#39;s Civicsmith ran before this update, so it cannot tell whether this\napplies to you/);
  const past = seen(await run({ slug: "past", mode: "update", pre: { past: planeBase("past", "0.71.0") } }));
  assert.ok(!past.page.done.includes("op=instancegroupseed"));
  const same = seen(await run({ slug: "same", mode: "update", pre: { same: planeBase("same", DEFAULT_VERSION) } }));
  assert.ok(!same.page.done.includes("op=instancegroupseed"), "a no-op tells nothing");
  for (const w of [cross, fog, past, same]) assert.deepEqual(groupCalls(w), [], "never seeded, never asked");
});

/* ------------------------------------------------------------------------------------------------ custody and the release */

test("R19 the Cloudflare token and every credential appear in no page, log or error text but R16's panel; text from the management API is escaped", async () => {
  const logs = [];
  const orig = { log: console.log, error: console.error, warn: console.warn };
  for (const k of Object.keys(orig)) console[k] = (...a) => logs.push(a.join(" "));
  const hostile = [{ id: "A1", name: `</script><script>window.pwned=1</script><img src=x onerror=alert(1)>` }];
  let w;
  try { w = seen(await run({ slug: "custody", accounts: hostile, ai: "aik-" + "h".repeat(20) })); }
  finally { Object.assign(console, orig); }
  const s = secretsOf(w.planePuts[0]);
  const shown = new Set(["ADMIN_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN"]);
  const outsidePanel = w.raw.replace(/<script>done\([\s\S]*?\)<\/script>/, "");
  for (const b of s) {
    assert.equal(outsidePanel.includes(b.text), false, `${b.name} outside the panel`);
    if (!shown.has(b.name)) assert.equal(w.raw.includes(b.text), false, b.name);
  }
  assert.equal(w.raw.includes(TOK), false);
  assert.equal(logs.some((l) => l.includes(TOK) || s.some((b) => l.includes(b.text))), false);
  assert.equal((w.raw.match(/<\/script>/g) || []).length, (w.raw.match(/<script>/g) || []).length, "no script element closed early");
  assert.ok(!/<img src=x/.test(w.raw), "no markup from the account's name reaches the page");
  assert.equal(w.page.label("acct"), `Using the account "${hostile[0].name}"`, "it arrives as text");
  const bad = seen(await run({ slug: "custody-refused", refuseAllPlane: true }));
  assert.ok(!bad.raw.includes("<b>by the fake</b>"), "an API error's markup is escaped");
  assert.match(bad.page.failed.d, /<b>by the fake<\/b>/);
  const plain = await (await req("/callback?error=x&error_description=%3Cscript%3Ealert(1)%3C%2Fscript%3E")).text();
  assert.ok(!plain.includes("<script>alert(1)") && plain.includes("&lt;script&gt;"));
});

test("R20 the plane's limits are read from the signed release R8 chose and sent exactly, on install and update; a release stating none or unreadably is passed over by name, and with a built-in stating none the act is refused before anything is created; the fleet statement is unchanged", async () => {
  const plane = (stmt, q = '"') => `export default { fetch(){ return Response.json({ storeVersion: 'x', memberVersions: {} }); } }; export class Store {}; export const S = ${q}${stmt}${q};`;
  const limitsOf = (w) => w.planePuts.map((p) => p.meta.limits);
  armWith(SIGNER.line);
  /* Exactly the release's statement, whatever it says, in any quote style a bundler prints: the installer has no value of its own. */
  for (const [stmt, q, want] of [[LIMITS_STATEMENT, '"', LIMITS], ["bio-plane-limits/1 cpu_ms=30000 subrequests=500", "'", { cpu_ms: 30000, subrequests: 500 }],
      ["bio-plane-limits/1 subrequests=7", "`", { subrequests: 7 }]]) {
    const rel = await release({ version: NEXT, src: plane(stmt, q) + ` const again = "${stmt}";` });
    const i = seen(await run({ slug: "lim-install", rel }));
    assert.equal(i.planePuts.length, 2, "the install PUT and its step-3 re-PUT");
    assert.deepEqual(limitsOf(i), [want, want], stmt);
    const u = seen(await run({ slug: "lim-update", mode: "update", pre: { "lim-update": planeBase("lim-update") }, rel }));
    assert.ok(u.planePuts.length >= 1);
    assert.ok(limitsOf(u).every((l) => JSON.stringify(l) === JSON.stringify(want)), stmt);
  }
  /* A verified release stating none, or stating them unreadably, is not used, and the page names why as R8 names a failed one. */
  const bad = [[UNSTATED_SRC, /states no limits for your group's Civicsmith to run under, so it was NOT used/],
    [plane("bio-plane-limits/1 subrequests=10000") + ' const b = "bio-plane-limits/1 subrequests=500";', /states the limits your group's Civicsmith runs under unreadably \(it states them 2 different ways\)/],
    [plane("bio-plane-limits/1 subrequests=10000 cpu_ms=5"), /unreadably .*keys sorted/],
    [plane("bio-plane-limits/1 subrequests=0"), /unreadably/], [plane("bio-plane-limits/1 subrequests=ten"), /unreadably/],
    [plane("bio-plane-limits/1 subrequests=1 subrequests=2"), /unreadably/]];
  for (const [src, says] of bad) {
    const rel = await release({ version: NEXT, src });
    const w = seen(await run({ slug: "lim-bad", rel }));
    assert.match(w.page.label("rel"), says);
    assert.ok(w.planePuts.every((p) => p.source !== src), "never installed");
    if (BUILTIN_LIMITS.ok) {
      assert.ok(w.planePuts.length > 0 && w.planePuts.every((p) => p.source === RELEASE_SOURCE), "the built-in stands in");
      assert.deepEqual(limitsOf(w)[0], { ...BUILTIN_LIMITS.limits });
    } else {
      /* This tree's built-in states none either: the install is refused by name, and nothing exists afterwards. */
      assert.equal(w.page.status("rel"), "no");
      assert.match(w.page.failed.p, /Nothing was created/);
      assert.match(w.page.failed.p, new RegExp(`built-in release \\(${RELEASE_VERSION.replace(/\./g, "\\.")}\\) states no limits for your group's Civicsmith`));
      assert.deepEqual([[...w.acct.keys()], [...w.buckets]], [[], []], "no script, no bucket, no probe");
      assert.ok(!w.page.done);
      const u = seen(await run({ slug: "lim-upd", mode: "update", pre: { "lim-upd": planeBase("lim-upd") }, rel }));
      assert.match(u.page.failed.p, /still running the version it had before. Nothing about it changed/);
      assert.deepEqual(u.acct.get("lim-upd"), planeBase("lim-upd"), "the copy as it was");
      assert.equal(u.planePuts.length, 0);
    }
  }
  /* The plane this tree builds states its limits as this reads them (control-plane's statement, K737), equal to
     `bio-plane/wrangler.jsonc`'s `limits`: built here by the bundler's own recipe, the bytes a release would sign. */
  const { buildMember, planeMember } = await import("../../bio-plane/scripts/fleet-bundle.mjs");
  const built = await buildMember(planeMember(), { write: false });
  const cfgText = readFileSync(new URL("../../bio-plane/wrangler.jsonc", import.meta.url), "utf8");
  const cfgLimits = JSON.parse(cfgText.match(/"limits":\s*(\{[^}]*\})/)[1]);
  assert.deepEqual(planeLimits(new TextDecoder().decode(built.bytes)), { ok: true, limits: cfgLimits });
  /* Nothing is added to the fleet statement: the limits ride in the plane bytes, so the /2 statement an older installer
     rebuilds from the manifest is the one signed, and the fleet installs. */
  const rel = await release({ version: NEXT });
  const keys = Object.keys(rel.manifest).sort();
  assert.deepEqual(keys, ["asset", "bytes", "fleet", "fleetSig", "sha256", "sig", "version"]);
  const w = seen(await run({ slug: "lim-fleet", rel }));
  assert.match(w.page.label("fleet"), new RegExp(`All ${MEMBERS.length} capability workers installed and verified`));
  restoreSigners();
});
test("R21 the install offers the held non-test jurisdiction profiles by name and coverage, none preselected, and binds the chosen ids as JURISDICTION_PROFILES; choosing none is allowed and said; an update never changes them", async () => {
  /* The offer: every held profile but the test ones, each by name and coverage, none checked; and what none means. */
  const held = jurisdictions.list();
  const offered = held.filter((p) => !p.test);
  assert.ok(offered.length > 0 && held.some((p) => p.test), "both kinds are held, so the filter is exercised");
  assert.deepEqual(PROFILE_CHOICES.map((p) => [p.id, p.name, [...p.covers]]), offered.map((p) => [p.id, p.name, p.covers]));
  const home = await text("/"), upd = await text("/update");
  const boxes = [...home.matchAll(/<input type="checkbox" name="profile" value="([^"]*)"([^>]*)>/g)];
  assert.deepEqual(boxes.map((m) => m[1]), offered.map((p) => p.id));
  assert.ok(boxes.every((m) => !/checked/.test(m[2])), "none preselected");
  for (const p of offered) {
    assert.ok(home.includes(`<span class="pname">${p.name}</span>`), p.id);
    assert.ok(home.includes(`<span class="small pcovers">covers ${p.covers.join(", ")}</span>`), p.id);
  }
  for (const p of held.filter((x) => x.test)) assert.ok(!home.includes(p.id) && !home.includes(p.name), `${p.id} not offered`);
  assert.ok(home.includes(PROFILES_NONE) && /Choosing none is allowed/.test(PROFILES_NONE));
  assert.ok(!upd.includes('type="checkbox" name="profile"'), "an update offers no choice");
  assert.ok(home.includes("profiles:chosen"), "the install page sends the choice");
  /* /begin refuses, by name, what it cannot bind: a profile not offered (unknown, or a test profile), a repeat, not a
     list, and any choice on an update. */
  const ids = offered.map((p) => p.id);
  const testId = held.find((p) => p.test).id;
  for (const [profiles, mode, says] of [[["no-such-profile"], "install", /Not a jurisdiction profile this installer offers: "no-such-profile"/],
      [[testId], "install", new RegExp(`Not a jurisdiction profile this installer offers: "${testId}"`)],
      [[ids[0], ids[0]], "install", /chosen twice/], [ids[0], "install", /must be a list/], [[7], "install", /offers: 7/],
      [ids, "update", /An update never changes which jurisdiction profiles/]]) {
    const r = await req("/begin", { method: "POST", body: JSON.stringify({ slug: "prof-refused", mode, profiles }) });
    const j = await r.json();
    assert.deepEqual([r.status, j.ok], [400, false], JSON.stringify(profiles));
    assert.match(j.error, says);
    assert.equal(r.headers.get("set-cookie"), null);
  }
  /* The binding: the chosen ids, in the order given, on the install's plane uploads, the step-3 re-upload included,
     so the copy holds it at its first boot. */
  const chosen = await begin("prof-chosen", "install", { profiles: ids });
  assert.equal(chosen.j.ok, true);
  assert.deepEqual(cookieValue(chosen.cookie).p, ids);
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const w = seen(await run({ slug: "prof-chosen", rel, cookie: chosen.cookie, state: chosen.state }));
  restoreSigners();
  assert.equal(w.planePuts.length, 2, "the install PUT and its step-3 re-PUT");
  for (const put of w.planePuts) assert.deepEqual(bindingOf(put, "JURISDICTION_PROFILES"), { type: "plain_text", name: "JURISDICTION_PROFILES", text: ids.join(",") });
  assert.equal(w.acct.get("prof-chosen").filter((b) => b.name === "JURISDICTION_PROFILES").length, 1, "the copy holds it after the act");
  /* None chosen (an empty list, or none sent) binds nothing, and the install proceeds. */
  for (const extra of [{ profiles: [] }, {}]) {
    const b = await begin("prof-none", "install", extra);
    assert.equal(b.j.ok, true);
    const n = seen(await run({ slug: "prof-none", cookie: b.cookie, state: b.state }));
    assert.ok(n.page.done, "the install proceeds");
    for (const put of n.planePuts) assert.equal(bindingOf(put, "JURISDICTION_PROFILES"), null);
  }
  /* An update never sends it, whatever the copy holds. */
  const held0 = [...planeBase("prof-upd"), { type: "plain_text", name: "JURISDICTION_PROFILES", text: ids.join(",") }];
  armWith(SIGNER.line);
  const u = seen(await run({ slug: "prof-upd", mode: "update", pre: { "prof-upd": held0 }, rel: await release({ version: NEXT }) }));
  restoreSigners();
  assert.ok(u.planePuts.length >= 1);
  for (const put of u.planePuts) assert.equal((put.meta.bindings || []).some((b) => b.name === "JURISDICTION_PROFILES"), false);
});

test("R22 every page names Civicsmith and the installing group, by its chosen name once chosen, and never the old name; Believe in Oakland is named on no page (K262), the installer's own address staying where it runs; its pages say it is run by the publisher of Civicsmith releases; the example name is not a place", async () => {
  const before = { "/": await text("/"), "/update": await text("/update"), "404": await text("/nowhere"), invitation: INVITATION };
  assert.equal(PUBLISHER, "This installer is run by the publisher of Civicsmith releases.");
  for (const [where, page] of Object.entries(before)) {
    assert.match(page, /Civicsmith/, where);
    assert.match(page, /your group/i, `${where} speaks to the group`);
    assert.ok(page.includes("This installer is run by the publisher of Civicsmith releases."), `${where} says the publisher runs it`);
  }
  assert.match(before["/"], /<title>Set up your group's Civicsmith<\/title>/);
  assert.match(before["/update"], /<title>Update your group's Civicsmith<\/title>/);
  assert.match(before.invitation, /<title>Start your group's own Civicsmith<\/title>/);
  assert.ok(before.invitation.includes('href="https://newgroup.believeinoakland.workers.dev/"'), "the address stays where it runs");
  for (const path of ["/", "/update"]) assert.ok(before[path].includes(`placeholder="${EXAMPLE_SLUG}"`), path);
  const places = jurisdictions.list().flatMap((p) => p.covers).flatMap((c) => c.toLowerCase().split(/\W+/)).filter((x) => x.length > 2);
  assert.ok(places.length > 0, "the held profiles name places to compare with");
  assert.deepEqual(EXAMPLE_SLUG.split("-").filter((w) => places.includes(w)), [], "the example is not a place");
  const named = seen(await run({ slug: "river-keepers" }));
  const upd = seen(await run({ slug: "river-keepers", mode: "update", pre: { "river-keepers": planeBase("river-keepers", "0.70.0") } }));
  for (const w of [named, upd]) {
    assert.match(w.raw, /Civicsmith &middot; installer/);
    assert.match(w.raw, /For the group <b class="mono" id="group">river-keepers<\/b>/);
    assert.ok(w.raw.includes(PUBLISHER));
  }
  const { cookie } = await begin("river-keepers");
  const denied = seen(await callback("error=access_denied", cookie));
  assert.match(denied.raw, /Civicsmith/);
  assert.match(denied.raw, /For the group <b class="mono" id="group">river-keepers<\/b>/);
  /* Over every page rendered anywhere in this suite (K262): no page names a third party, and none the product's old name
     (DEC-124). The publisher is said to run the installer without being named, and the only trace of its name is the
     installer's own address, which stays. */
  for (const page of [...PAGES, ...Object.values(before)].map(withoutChoices)) {
    assert.match(page, /Civicsmith/, page.slice(0, 120));
    assert.equal(/civic ?os\b/i.test(page), false, page.match(/.{0,60}civic ?os\b.{0,40}/i)?.[0]);
    const rest = page.replace(/newgroup\.believeinoakland\.workers\.dev/g, "");
    assert.equal(/believe in oakland|oakland|biosmoke/i.test(rest), false, rest.match(/.{0,60}(oakland|biosmoke).{0,40}/i)?.[0]);
  }
});

test("R23 the install and invitation pages state the prerequisites the install enforces: Workers Paid and a payment method, and for the assistant through a member's own subscription the Containers permission; and never that no card is needed or storage is optional", async () => {
  const home = await text("/");
  for (const [where, page] of [["install page", home], ["invitation page", INVITATION]]) {
    const words = page.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    assert.match(words, /Workers Paid plan/, where);
    assert.match(words, /\$5 a month/, where);
    assert.match(words, /payment method on the account/, where);
    assert.equal(/no card|card is needed|free Cloudflare account|stays free|optional extra|everything still works/i.test(words), false, where);
    /* T33-91: for the assistant through a member's own subscription, the Containers permission the install asks (R38). */
    assert.match(words, /Workers Containers permission/, where);
    assert.match(words, /member's own Claude subscription/, where);
    assert.match(words, /used only with an API key: a member's own, or your group's/, where);
  }
  const free = seen(await run({ slug: "pre-free", plan: "free" }));
  assert.match(free.page.failed.p, /Workers Paid plan \(\$5\/month\), paid with a payment method on the account/);
  assert.ok(!/already has a payment method/.test(free.page.failed.p), "the plan refusal claims no card it has not seen");
});

test.todo("R24 an install never shares another copy's buckets and never overwrites its fleet workers in the same account (not yet met: MULTI-INSTANCE-ISOLATION, K102; the buckets and the members have fixed names)");

test("R17 (K1541) an update gives a copy that holds no seal secret a fresh one, keeps one it holds unrestated, and sends none when the copy's settings cannot be read, saying which", async () => {
  const none = seen(await run({ slug: "seal-none", mode: "update", pre: { "seal-none": planeBase("seal-none") } }));
  const sent = (w) => w.planePuts.flatMap((p) => (p.meta.bindings || []).filter((b) => b.name === "ACCOUNT_SEAL_SECRET"));
  assert.equal(sent(none).length, 1);
  assert.equal(Buffer.from(sent(none)[0].text, "base64url").length, 32);
  assert.equal(none.raw.includes(sent(none)[0].text), false, "never shown");
  assert.match(none.page.label("keys"), /now holds the secret that seals each member's own Claude account or API key/);
  const OLD = { type: "secret_text", name: "ACCOUNT_SEAL_SECRET", text: "seal-kept" };
  const held = seen(await run({ slug: "seal-held", mode: "update", pre: { "seal-held": [...planeBase("seal-held"), OLD] } }));
  assert.equal(sent(held).length, 0, "never restated over one held");
  assert.deepEqual(held.acct.get("seal-held").filter((b) => b.name === "ACCOUNT_SEAL_SECRET"), [OLD], "kept unchanged");
  assert.match(held.page.label("keys"), /already held the secret .* kept unchanged/);
  const blind = seen(await run({ slug: "seal-blind", mode: "update", pre: { "seal-blind": planeBase("seal-blind") }, settingsBlind: true }));
  assert.equal(sent(blind).length, 0, "unknown is not none");
  assert.equal(blind.page.status("keys"), "no");
  assert.match(blind.page.label("keys"), /could not be read.*Nothing was sent or removed/s);
  assert.equal(blind.page.status("up"), "ok", "the update itself proceeds");
});

/* ------------------------------------------------------------------------------------------------ the assistant and the container member */

test("R36 neither the install nor the update takes, generates, binds or shows a Claude credential, the group's API key included (set inside the group's Civicsmith by an administrator, K1755); an update removes one held before, and names a removal refused; INSTANCE_AI_TOKEN is unchanged", async () => {
  const CLAUDE = "sk-ant-oat01-" + "z".repeat(40), KEY = "sk-ant-api03-" + "k".repeat(40);
  const b = await begin("r36-install", "install", { instanceClaude: CLAUDE, groupKey: KEY, anthropicApiKey: KEY });
  assert.equal(b.j.ok, true);
  assert.ok(![CLAUDE, KEY].some((x) => JSON.stringify(cookieValue(b.cookie)).includes(x)), "the cookie keeps neither");
  const i = seen(await run({ slug: "r36-install", cookie: b.cookie, state: b.state }));
  for (const put of i.planePuts) assert.equal((put.meta.bindings || []).some((x) => /CLAUDE|ANTHROPIC|API_KEY/.test(x.name)), false);
  for (const put of i.planePuts) assert.equal((put.meta.bindings || []).some((x) => x.text === KEY || x.text === CLAUDE), false);
  assert.equal(i.raw.includes(CLAUDE) || i.raw.includes(KEY), false);
  /* The page says where each way to the assistant is set: the group's key by an administrator, a member's own by the member, both inside it. */
  assert.match(i.page.label("assist"), /This installer takes and binds no Claude account or key/);
  assert.match(i.page.label("assist"), /your group's own Anthropic API key, which an administrator sets inside your group's Civicsmith/);
  assert.match(i.page.label("assist"), /each member's own Claude subscription or API key, which the member connects there, or both/);
  /* An update of a copy holding the retired credential removes it, and says so; one holding none deletes nothing. */
  const pre = [...planeBase("r36-upd"), { type: "secret_text", name: "INSTANCE_CLAUDE_TOKEN", text: CLAUDE }];
  const u = seen(await run({ slug: "r36-upd", mode: "update", pre: { "r36-upd": pre } }));
  for (const put of u.planePuts) assert.equal((put.meta.bindings || []).some((x) => x.name === "INSTANCE_CLAUDE_TOKEN"), false, "never restated");
  assert.deepEqual(u.deleted, ["r36-upd/INSTANCE_CLAUDE_TOKEN"]);
  assert.equal(u.acct.get("r36-upd").some((x) => x.name === "INSTANCE_CLAUDE_TOKEN"), false, "none left behind");
  assert.match(u.page.label("keys"), /Claude credential an earlier installer bound into your group's Civicsmith was removed/);
  assert.equal(u.raw.includes(CLAUDE), false);
  const clean = seen(await run({ slug: "r36-clean", mode: "update", pre: { "r36-clean": planeBase("r36-clean") } }));
  assert.deepEqual(clean.deleted, []);
  const stuck = seen(await run({ slug: "r36-stuck", mode: "update", pre: { "r36-stuck": pre.map((x) => x.name === "SELF" ? { ...x, service: "r36-stuck" } : x) }, refuseSecretDelete: true }));
  assert.equal(stuck.page.status("keys"), "no");
  assert.match(stuck.page.label("keys"), /removing it was refused .* Remove the secret INSTANCE_CLAUDE_TOKEN/s);
  assert.ok(!stuck.raw.includes("<i>by the fake</i>"), "the API's words are escaped");
  /* The organisation `ai` credential is untouched by R36. */
  const AI = "aik-" + "w".repeat(20);
  const ai = seen(await run({ slug: "r36-ai", ai: AI }));
  assert.deepEqual(secretsOf(ai.planePuts[0]).filter((x) => x.name === "INSTANCE_AI_TOKEN").map((x) => x.text), [AI]);
});

test("R37 the install page offers the assistant as optional, nothing preselected, saying it is off unless chosen; that once on it is reached through the group's API key (set by an administrator) or each member's own account (connected by the member), or both, chosen at setup; and that each member is told what goes to Anthropic before their first use; the choice is bound as ASSISTANT_ENABLED for the first boot, none bound when none is made; an update never changes it", async () => {
  const home = await text("/"), upd = await text("/update");
  const radios = [...home.matchAll(/<input type="radio" name="assistant" value="([^"]*)"([^>]*)>/g)];
  assert.deepEqual(radios.map((m) => m[1]), ["on", "off"]);
  assert.ok(radios.every((m) => !/checked/.test(m[2])), "nothing preselected");
  assert.ok(home.includes(ASSISTANT_OFFER));
  const words = ASSISTANT_OFFER.replace(/\s+/g, " ");
  assert.match(words, /off unless your group chooses it/);
  /* K1755, K1851: the two ways in, both set inside the group's Civicsmith, and the choice among them (or none) at its setup. */
  assert.match(words, /Once it is on, it is reached through your group's own Anthropic API key, which an administrator sets inside your group's Civicsmith/);
  assert.match(words, /or through each member's own Claude subscription or API key, which the member connects there, or both/);
  assert.match(words, /Which of these, or no AI at all, is chosen when your group's Civicsmith is set up/);
  /* credentials R36: each member told before their first use, under either way. */
  assert.match(words, /Each member is told what goes to Anthropic before their first use: when they connect their own account, or before their first question under your group's key/);
  assert.match(words, /This installer takes no Claude credential of any kind/);
  assert.ok(!upd.includes('type="radio" name="assistant"'), "the update page offers no choice");
  for (const [v, mode, says] of [["maybe", "install", /choose one of the two, or neither/], [true, "install", /choose one/],
      ["on", "update", /An update never changes whether your group's Civicsmith offers the assistant/]]) {
    const r = await req("/begin", { method: "POST", body: JSON.stringify({ slug: "as-refused", mode, assistant: v }) });
    assert.deepEqual([r.status, (await r.json()).ok], [400, false], String(v));
    assert.equal(r.headers.get("set-cookie"), null);
  }
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  for (const choice of ["on", "off"]) {
    const b = await begin("as-" + choice, "install", { assistant: choice });
    const w = seen(await run({ slug: "as-" + choice, rel, cookie: b.cookie, state: b.state }));
    assert.equal(w.planePuts.length, 2);
    for (const put of w.planePuts) assert.deepEqual(bindingOf(put, "ASSISTANT_ENABLED"), { type: "plain_text", name: "ASSISTANT_ENABLED", text: choice });
    assert.match(w.page.label("assist"), choice === "on" ? /You chose to offer the assistant/ : /You chose not to offer the assistant for now, so it is off/);
  }
  const n = seen(await run({ slug: "as-none", rel }));
  for (const put of n.planePuts) assert.equal(bindingOf(put, "ASSISTANT_ENABLED"), null);
  assert.match(n.page.label("assist"), /No choice was made about the assistant, so it is off/);
  const u = seen(await run({ slug: "as-upd", mode: "update", rel,
    pre: { "as-upd": [...planeBase("as-upd"), { type: "plain_text", name: "ASSISTANT_ENABLED", text: "on" }] } }));
  for (const put of u.planePuts) assert.equal(bindingOf(put, "ASSISTANT_ENABLED"), null, "an update never sends it");
  restoreSigners();
});

test("R38 a container member installs only with the Containers scope granted, Workers Paid, and a public image pinned by digest under the default policy, through the Containers API, with its class bound into the members it names; any condition failing leaves it out, named, and the install never fails over it", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT, container: true });
  const RUNNER_BINDING = { type: "durable_object_namespace", name: "RUNNER", class_name: "AgentRunner", script_name: RUNNER };
  const runnerOf = (w) => (w.acct.get("agent-worker") || []).filter((b) => b.name === "RUNNER");
  /* All conditions hold: the Worker with its class's migration, the application with the image under `default`, and
     agent-worker bound to the class. */
  const ok = seen(await run({ slug: "box-ok", rel }));
  const put = ok.calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/" + RUNNER));
  const meta = JSON.parse(await put.init.body.get("metadata").text());
  assert.deepEqual(meta.migrations, { new_tag: "v1", new_sqlite_classes: ["AgentRunner"] });
  assert.equal(put.init.body.get("container.json"), null, "the descriptor is read, never uploaded");
  assert.deepEqual(ok.apps.map(({ id, ...a }) => a), [{ name: RUNNER, scheduling_policy: "default", instances: 0,
    max_instances: DESCRIPTOR.max_instances, configuration: { image: IMAGE }, durable_objects: { namespace_id: `ns-${RUNNER}-AgentRunner` } }]);
  assert.deepEqual(runnerOf(ok), [RUNNER_BINDING]);
  assert.deepEqual(ok.refused, []);
  assert.match(ok.page.label("fleet"), new RegExp(`All ${new Set([...MEMBERS, RUNNER]).size} capability workers installed and verified`));
  const upload = (w) => w.calls.filter((c) => c.method === "PUT" && /\/workers\/scripts\/[^/]+$/.test(c.u)).map((c) => c.u.split("/scripts/")[1]);
  assert.ok(upload(ok).indexOf(RUNNER) < upload(ok).indexOf("agent-worker"), "the container before the member bound to it");
  /* Each condition failing: left out, named, the copy serving the assistant by members' own API keys, the rest installed. */
  const PAID_NOTE = /your group's Civicsmith offers the assistant only through an API key \(a member's own, or your group's\)/;
  const leftOut = async (why, opts, says) => {
    const w = seen(await run({ slug: "box-" + why, rel, ...opts }));
    assert.equal(w.apps.length, 0, why);
    assert.equal(runnerOf(w).length, 0, `${why}: agent-worker installed without RUNNER`);
    assert.ok(w.acct.has("agent-worker") && w.acct.has("pdf-worker"), `${why}: the rest installed`);
    assert.match(w.page.label("fleet"), new RegExp(`left out: ${RUNNER} \\([^;]*${says.source}`), why);
    assert.match(w.page.label("fleet"), PAID_NOTE, why);
    assert.ok(w.page.done, `${why}: the install finished`);
    return w;
  };
  await leftOut("noscope", { grantedScope: "workers-scripts.write workers-r2.write account-settings.read" }, /the permission you approved does not include Workers Containers/);
  /* A token response stating no scope: one read of the Containers API decides. */
  const asked = seen(await run({ slug: "box-asked", rel, grantedScope: null }));
  assert.equal(asked.apps.length, 1, "a read that answers means the scope is held");
  await leftOut("unasked", { grantedScope: null, containers: "read" }, /the permission you approved could not be shown to include Workers Containers \(Authentication error\)/);
  for (const [why, d, says] of [
      ["unpinned", { ...DESCRIPTOR, image: "docker.io/civicos/agent-runner:latest" }, /its image is not a public registry image pinned by its sha256 digest/],
      ["private", { ...DESCRIPTOR, image: "registry.cloudflare.com/acct/agent-runner@sha256:" + "b".repeat(64) }, /its image is not a public registry image/],
      ["policy", { ...DESCRIPTOR, scheduling_policy: "durable_object" }, /its scheduling policy is not the default one/],
      ["noclass", { ...DESCRIPTOR, class_name: "" }, /names no class/], ["max", { ...DESCRIPTOR, max_instances: 0 }, /no maximum number of instances/],
      ["bind", { ...DESCRIPTOR, bind: [{ member: "agent-worker", binding: "runner" }] }, /names its bindings unreadably/],
      ["garbled", "{not json", /its container description does not parse/]]) {
    const w = await leftOut(why, { rel: await release({ version: NEXT, container: true, descriptor: d }) }, says);
    assert.equal(w.calls.some((c) => c.u.includes("/containers/")), false, `${why}: the Containers API untouched`);
  }
  const created = await leftOut("refused", { containers: "create" }, /application refused/);
  assert.ok(created.acct.has(RUNNER), "the Worker uploaded is named, not hidden: the class exists, unused");
  /* A part type an installer does not know leaves one member out (R11): what an older installer does with this one. */
  /* The descriptor's hash is covered by the fleet signature: bytes that differ are refused like any part. */
  const tampered = await release({ version: NEXT, container: true });
  tampered.assets[`${RUNNER}/container.json`] = JSON.stringify({ ...DESCRIPTOR, image: "docker.io/evil/x@sha256:" + "c".repeat(64) });
  await leftOut("tampered", { rel: tampered }, /agent-runner container\.json failed its integrity check/);
  /* An update: re-consent. Without the scope, everything else updates and the container is named; a container held
     from before keeps its binding; with the scope and Paid, the application is rolled out to the image. */
  const old = [{ type: "plain_text", name: "VERSION", text: "0.1.0" }];
  const preAll = { "box-upd": planeBase("box-upd"), ...Object.fromEntries(MEMBERS.map((m) => [m, old])), [RUNNER]: old };
  const noScope = seen(await run({ slug: "box-upd", mode: "update", rel, pre: preAll, preClasses: { [RUNNER]: ["AgentRunner"] },
    preApps: [{ id: "app9", name: RUNNER }], grantedScope: "workers-scripts.write workers-r2.write account-settings.read" }));
  assert.equal(noScope.page.status("up"), "ok");
  assert.match(noScope.page.label("fleet"), /agent-runner \(the permission you approved does not include Workers Containers/);
  assert.equal(noScope.calls.some((c) => c.u.includes("bio-plan-probe")), false, "no plan probe without the scope");
  assert.deepEqual(runnerOf(noScope), [RUNNER_BINDING], "a container held from before keeps serving its member");
  assert.deepEqual(noScope.rollouts, []);
  const rolled = seen(await run({ slug: "box-upd", mode: "update", rel, pre: preAll, preClasses: { [RUNNER]: ["AgentRunner"] },
    preApps: [{ id: "app9", name: RUNNER }] }));
  assert.ok(rolled.calls.some((c) => c.u.includes("bio-plan-probe")), "an update establishes the plan as R6 does");
  assert.deepEqual(rolled.rollouts.map((r) => [r.id, r.target_configuration.image]), [["app9", IMAGE]]);
  const rerun = JSON.parse(await rolled.calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/" + RUNNER)).init.body.get("metadata").text());
  assert.equal("migrations" in rerun, false, "the class's migration is never restated");
  assert.deepEqual(rolled.refused, []);
  const free = seen(await run({ slug: "box-upd", mode: "update", rel, pre: preAll, preClasses: { [RUNNER]: ["AgentRunner"] }, plan: "free" }));
  assert.equal(free.page.status("up"), "ok", "an update never grows a refusal");
  assert.match(free.page.label("fleet"), /agent-runner \(your account is on Workers Free, and containers need Workers Paid/);
  restoreSigners();
});

/* ------------------------------------------------------------------------------------------------ the embed step */

const planeFiles = (dir, { pkgV = "1.2.3", cfgV = pkgV, secrets = "ADMIN_TOKEN=published-admin-value\n" } = {}) => {
  mkdirSync(join(dir, "plane", "dist"), { recursive: true });
  writeFileSync(join(dir, "plane", "package.json"), JSON.stringify({ name: "bio-plane", version: pkgV }));
  writeFileSync(join(dir, "plane", "wrangler.jsonc"), `{ // the plane\n "vars": { "VERSION": "${cfgV}" } }`);
  writeFileSync(join(dir, "plane", "dist", "SECRETS.txt"), secrets);
};

test("R25 resolveVersion returns package.json's version, and throws naming the files and what to change when it is not semver, when the plane's config declares no VERSION, or when that VERSION differs", () => {
  const pkg = (v) => JSON.stringify({ version: v }), cfg = (v) => `{ "vars": { "VERSION": "${v}" } }`;
  assert.equal(resolveVersion({ packageJson: pkg("0.48.0"), wranglerJsonc: cfg("0.48.0") }), "0.48.0");
  assert.equal(resolveVersion({ packageJson: pkg("1.0.0-rc.1"), wranglerJsonc: cfg("1.0.0-rc.1") }), "1.0.0-rc.1");
  const throws = (p, c) => { try { resolveVersion({ packageJson: p, wranglerJsonc: c }); return null; } catch (e) { return e.message; } };
  for (const v of ["latest", "1.2", "", undefined]) assert.match(throws(pkg(v), cfg("1.2.3")), /bio-plane\/package\.json has no usable "version"/);
  assert.match(throws("{not json", cfg("1.2.3")), /bio-plane\/package\.json does not parse/);
  assert.match(throws(pkg("1.2.3"), '{ "vars": {} }'), /bio-plane\/wrangler\.jsonc declares no VERSION var.*agree with package\.json \(1\.2\.3\)/s);
  for (const other of ["1.2.2", "1.2.4"]) {
    const m = throws(pkg("1.2.3"), cfg(other));
    assert.match(m, /bio-plane\/package\.json +1\.2\.3 +<- authority/);
    assert.match(m, new RegExp(`bio-plane/wrangler\\.jsonc +${other.replace(/\./g, "\\.")}`));
    assert.match(m, /Set wrangler\.jsonc to "VERSION": "1\.2\.3"/);
  }
});

test("R26 checkSignedAsset returns null only for the signed release of that version, else the reason; the embed refuses a release carrying a published token value and writes release.mjs as generated", async () => {
  const src = "export default {}; // the plane 1.2.3";
  const bytes = new TextEncoder().encode(src);
  const good = { version: "1.2.3", sha256: await sha(src), asset: "bio-plane.bundled.mjs", sig: await SIGNER.sign(bytes) };
  const signers = [SIGNER.line];
  assert.equal(await checkSignedAsset({ manifest: good, bytes, version: "1.2.3", signers }), null);
  const why = async (o) => checkSignedAsset({ manifest: good, bytes, version: "1.2.3", signers, ...o });
  assert.match(await why({ manifest: null }), /missing or does not parse/);
  const unsigned = await why({ version: "1.2.4" });
  assert.match(unsigned, /RELEASE\.json is "1\.2\.3" but bio-plane\/package\.json is 1\.2\.4/);
  /* The refusal names the command that cuts and signs a release, as the operator runs it from the repository root. */
  assert.ok(unsigned.includes("cut and sign 1.2.4 (node bio-plane/scripts/release-assemble.mjs --sign)"), unsigned);
  assert.ok(existsSync(new URL("../../bio-plane/scripts/release-assemble.mjs", import.meta.url)), "the command it names exists");
  assert.match(await why({ bytes: new TextEncoder().encode(src + " ") }), /hashes .* but RELEASE\.json records/);
  assert.match(await why({ signers: [] }), /lists no ARMED_SIGNERS/);
  assert.match(await why({ manifest: { ...good, sig: "" } }), /carries no signature/);
  assert.match(await why({ manifest: { ...good, sig: await STRANGER.sign(bytes) } }), /does not verify .*UNKNOWN_KEY/);
  assert.match(await why({ manifest: { ...good, sig: await SIGNER.sign(bytes, "bio-ratify") } }), /does not verify .*NAMESPACE/);
  const dir = mkdtempSync(join(tmpdir(), "embed-"));
  planeFiles(dir);
  mkdirSync(join(dir, "release"));
  writeFileSync(join(dir, "release", "RELEASE.json"), JSON.stringify(good));
  writeFileSync(join(dir, "release", "bio-plane.bundled.mjs"), src);
  const out = join(dir, "out", "release.mjs");
  const args = { planeDir: join(dir, "plane"), releaseDir: join(dir, "release"), out, signers };
  assert.deepEqual(await embedRelease(args), { version: "1.2.3", sha256: good.sha256, chars: src.length });
  const written = readFileSync(out, "utf8");
  assert.match(written, /^\/\* GENERATED by scripts\/embed-release\.mjs\. Do not edit\. \*\/\n/);
  const mod = await import(out + "?v=1");
  assert.deepEqual([mod.RELEASE_VERSION, mod.RELEASE_SOURCE], ["1.2.3", src]);
  const leaky = "export default {}; // published-admin-value";
  writeFileSync(join(dir, "release", "bio-plane.bundled.mjs"), leaky);
  writeFileSync(join(dir, "release", "RELEASE.json"), JSON.stringify({ ...good, sha256: await sha(leaky), sig: await SIGNER.sign(leaky) }));
  await assert.rejects(embedRelease({ ...args, out: join(dir, "leak.mjs") }), /published token value found in the bundled release; refusing to embed/);
  assert.equal(existsSync(join(dir, "leak.mjs")), false, "nothing written");
  await assert.rejects(embedRelease({ ...args, signers: [STRANGER.line], out: join(dir, "x.mjs") }), /does not verify/);
  /* The shipped installer: its embed is the signed release it names, verified by the shipped keys. */
  const root = new URL("../../release/", import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL("RELEASE.json", root), "utf8"));
  const real = readFileSync(new URL(manifest.asset, root));
  restoreSigners();
  assert.equal(await checkSignedAsset({ manifest, bytes: real, version: manifest.version }), null);
  assert.deepEqual([RELEASE_VERSION, createHash("sha256").update(RELEASE_SOURCE).digest("hex")], [manifest.version, manifest.sha256]);
});

/* ------------------------------------------------------------------------------------------------ invariants */

const config = () => JSON.parse(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8")
  .replace(/^\s*\/\/.*$/gm, ""));

test("R27 the installer Worker declares no binding of any kind", async () => {
  const c = config();
  const BINDING_KEYS = ["vars", "kv_namespaces", "r2_buckets", "d1_databases", "durable_objects", "services", "queues",
    "analytics_engine_datasets", "ai", "browser", "vectorize", "hyperdrive", "mtls_certificates", "dispatch_namespaces",
    "send_email", "workflows", "tail_consumers", "unsafe", "secrets_store_secrets", "images", "version_metadata", "assets"];
  assert.deepEqual(Object.keys(c).filter((k) => BINDING_KEYS.includes(k)), []);
  assert.deepEqual(Object.keys(c).sort(), ["$schema", "account_id", "compatibility_date", "main", "name", "observability"]);
  /* And it runs with no environment at all. */
  const r = await worker.fetch(new Request(ORIGIN + "/"), undefined);
  assert.equal(r.status, 200);
});

test("R28 its configuration pins the project's Cloudflare account", () => {
  assert.equal(config().account_id, "20b533579290b9b93168345edd3b7f72");
});

test("R29 one verifier: the installer accepts a release signature exactly when signatures' verifySshsig does", async () => {
  armWith(SIGNER.line);
  const cases = [["good", true], ["stranger", false], ["wrong-ns", false]];
  for (const [sig, _] of cases) {
    const rel = await release({ version: NEXT, sig, fleet: false });
    const verdict = (await verifySshsig(rel.manifest.sig, new TextEncoder().encode(rel.src), NS_RELEASE, [SIGNER.line])).ok;
    const w = await run({ slug: "one-verifier", rel });
    assert.equal(w.planePuts[0]?.source === rel.src, verdict, sig);
    const embed = await checkSignedAsset({ manifest: rel.manifest, bytes: new TextEncoder().encode(rel.src), version: NEXT, signers: [SIGNER.line] });
    assert.equal(embed === null, verdict, `embed ${sig}`);
  }
  restoreSigners();
});

test("R30 the slug grammar and the member binding names are instance-setup's, imported, never copied: /begin accepts exactly GROUP_SLUG_RE's slugs (less its own name), the plane is bound under exactly FLEET_BINDINGS' names, and the installer exports no grammar or table of its own", async () => {
  /* The grammar: every length from 0 to 42, and every printable ASCII character (and two beyond it) at the start, the
     middle and the end of a slug, each accepted by /begin exactly when GROUP_SLUG_RE accepts it. */
  const chars = [...Array(95)].map((_, i) => String.fromCharCode(32 + i)).concat(["é", "\u2028"]);
  const corpus = [...Array(43)].map((_, n) => "a".repeat(n))
    .concat(chars.flatMap((c) => [c + "bc", "a" + c + "c", "ab" + c]), ["newgroup", "a-b-c", "0-0", "--a", "a--b"]);
  let accepted = 0;
  for (const slug of corpus) {
    const r = await req("/begin", { method: "POST", body: JSON.stringify({ slug }) });
    const want = GROUP_SLUG_RE.test(slug) && slug !== "newgroup";
    assert.equal(r.status === 200, want, JSON.stringify(slug));
    if (want) accepted++;
  }
  assert.ok(accepted > 60 && accepted < corpus.length - 60, "the corpus holds both sides of the grammar");
  /* The binding names: a full install binds the plane to each member under exactly FLEET_BINDINGS' name, and to
     nothing else but SELF. */
  assert.ok(FLEET_BINDINGS.length > 0);
  armWith(SIGNER.line);
  const w = seen(await run({ slug: "r30-names", rel: await release({ version: NEXT }) }));
  restoreSigners();
  const services = w.planePuts.at(-1).bindings.filter((b) => b.type === "service");
  assert.deepEqual(services.filter((b) => b.name !== "SELF").map((b) => [b.service, b.name]).sort(),
    FLEET_BINDINGS.map(([m, b]) => [m, b]).sort());
  /* Never copied: nothing the installer exports is a slug grammar or a member binding table. */
  const table = JSON.stringify(Object.fromEntries(FLEET_BINDINGS));
  for (const [name, v] of Object.entries(installer)) {
    assert.ok(!(v instanceof RegExp), `${name} is a grammar of its own`);
    assert.ok(!(v && typeof v === "object" && (JSON.stringify(v) === JSON.stringify(FLEET_BINDINGS) || JSON.stringify(v) === table)),
      `${name} is a binding table of its own`);
  }
});

test("R31 no place is named in the installer's behaviour: no page it serves or streams names a place a held profile covers", async () => {
  const places = new Set(jurisdictions.list().flatMap((p) => p.covers).flatMap((c) => c.toLowerCase().split(/\W+/)).filter((x) => x.length > 2));
  assert.ok(places.size > 0);
  const pages = [...PAGES, await text("/"), await text("/update"), await text("/elsewhere"), INVITATION];
  assert.ok(pages.length > 40, "the pages this suite rendered");
  for (const page of pages.map(withoutChoices)) {
    const words = page.replace(/newgroup\.believeinoakland\.workers\.dev/g, "")
      .toLowerCase().split(/[^a-z]+/);
    assert.deepEqual(words.filter((w) => places.has(w)), [], page.slice(0, 120));
  }
});

test("R32 until installs are isolated, an install into an account already holding a copy (either evidence bucket, or a fleet worker) is refused before anything is created, saying one copy per account is supported for now; an empty account installs; an update is not refused by it", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT, members: [...MEMBERS, "extra-worker"] });
  const old = [{ type: "plain_text", name: "VERSION", text: "0.1.0" }];
  /* Nothing written: no call but a read reached the account, and the account is exactly as it was. */
  const untouched = (w, pre, preBuckets, why) => {
    assert.deepEqual(w.calls.filter((c) => c.method !== "GET" && c.u.startsWith(CFG.API)).map((c) => `${c.method} ${c.u}`), [], why);
    assert.deepEqual([...w.acct.keys()].sort(), Object.keys(pre).sort(), why);
    for (const [k, v] of Object.entries(pre)) assert.deepEqual(w.acct.get(k), v, why);
    assert.deepEqual([...w.buckets].sort(), preBuckets.slice().sort(), why);
    assert.ok(!w.page.done, why);
  };
  const cases = [
    ["bucket bio-captures", {}, ["bio-captures"], /the evidence bucket bio-captures/],
    ["bucket bio-published", {}, ["bio-published"], /the evidence bucket bio-published/],
    ["both buckets", {}, ["bio-captures", "bio-published"], /the evidence bucket bio-captures, the evidence bucket bio-published/],
    ...MEMBERS.map((m) => [`worker ${m}`, { [m]: old }, [], new RegExp(`the capability worker ${m}`)]),
    /* A member the chosen release names beyond those the plane binds is looked for too, before the plan probe. */
    ["worker extra-worker", { "extra-worker": old }, [], /the capability worker extra-worker/],
  ];
  for (const [why, pre, preBuckets, names] of cases) {
    const w = seen(await run({ slug: "one-copy", rel, pre, preBuckets }));
    assert.equal(w.page.status("fresh"), "no", why);
    assert.match(w.page.failed.p, /One installation of Civicsmith per Cloudflare account is supported for now/, why);
    assert.match(w.page.failed.p, names, why);
    assert.match(w.page.failed.p, /Nothing was created or changed/, why);
    assert.ok(!w.calls.some((c) => c.u.includes("bio-plan-probe")), `${why}: refused before the plan probe`);
    untouched(w, pre, preBuckets, why);
  }
  /* A lookup that cannot say is refused too: an absence not established is not established. */
  for (const name of ["bio-published", "ocr-worker", "extra-worker"]) {
    const w = seen(await run({ slug: "one-unread", rel, lookupFail: [name] }));
    assert.equal(w.page.status("fresh"), "no", name);
    assert.match(w.page.failed.h, /Could not check your account/, name);
    untouched(w, {}, [], name);
  }
  /* The negative control: an empty account installs exactly as before, members and all. */
  const empty = seen(await run({ slug: "one-empty", rel }));
  assert.equal(empty.page.status("fresh"), "ok");
  assert.deepEqual([...empty.buckets].sort(), ["bio-captures", "bio-published"]);
  for (const m of [...MEMBERS, "extra-worker"]) assert.ok(empty.acct.has(m), m);
  assert.equal(empty.page.status("install"), "ok");
  assert.ok(empty.page.done.includes('id="out-boot"'));
  assert.ok(!empty.page.words.includes("One installation of Civicsmith per"));
  /* An update is not an install: a copy with its buckets and its members is updated, not refused. */
  const up = seen(await run({ slug: "one-upd", mode: "update", rel, preBuckets: ["bio-captures", "bio-published"],
    pre: { "one-upd": planeBase("one-upd"), ...Object.fromEntries(MEMBERS.map((m) => [m, old])) } }));
  assert.ok(!up.page.words.includes("One installation of Civicsmith per"));
  assert.equal(up.page.status("up"), "ok");
  assert.ok(up.page.done && up.planePuts.length >= 1, "the update ran to its end");
  restoreSigners();
});

test("R33 the install and the update read back the uploaded plane's content and compare its hash with the release's; a mismatch, or a script that cannot be read back, is named on the page and no success is claimed; a matching read-back succeeds", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const want = await sha(rel.src);
  const MISMATCH = new RegExp(`is not the ${NEXT.replace(/\./g, "\\.")} release&#39;s own bytes \\(read back, it hashes to [0-9a-f]{16}…; the release hashes to ${want.slice(0, 16)}…\\)`);
  /* Install: matching, as the module itself or as a multipart body, after every plane upload (the install PUT and its
     step-3 re-PUT); and a first read that differs, then matches, is a match. */
  for (const readBack of ["raw", "multipart", "differ-once"]) {
    const w = seen(await run({ slug: "rb-ok", rel, readBack }));
    assert.equal(w.planePuts.length, 2, readBack);
    assert.ok(w.reads.filter((n) => n === "rb-ok").length >= 2, `${readBack}: read back after each plane upload`);
    assert.equal(w.page.status("verify"), "ok", readBack);
    assert.match(w.page.done, /Your group's Civicsmith is running\./, readBack);
  }
  const reads = [];
  for (const [readBack, named] of [["differ", MISMATCH], ["fail", /could not be read back, so it is not confirmed to be the [0-9.]+ release&#39;s own bytes/]]) {
    const w = seen(await run({ slug: "rb-bad", rel, readBack }));
    reads.push(w.reads.length);
    assert.match(w.page.done, named, readBack);
    assert.ok(!w.page.done.includes("Your group's Civicsmith is running."), `${readBack}: no success claimed`);
    assert.equal(w.page.status("verify"), "no", readBack);
    assert.ok(w.page.done.includes('id="out-boot"'), `${readBack}: the credentials are still handed over`);
    /* With the address silent too, the mismatch is still named. */
    const quiet = seen(await run({ slug: "rb-quiet", rel, readBack, copy: { selftest: () => jres({ ok: false }) } }));
    assert.match(quiet.page.done, named, `${readBack}, address silent`);
    assert.match(quiet.page.done, /has not woken up yet/);
  }
  /* Update: the same, on its plane upload. */
  const base = (slug) => ({ [slug]: planeBase(slug) });
  const good = seen(await run({ slug: "rb-upd", mode: "update", rel, pre: base("rb-upd") }));
  assert.ok(good.reads.includes("rb-upd"));
  assert.match(good.page.done, /<b>Updated from 0\.1\.0 to/);
  for (const [readBack, named] of [["differ", MISMATCH], ["multipart", null]]) {
    const w = seen(await run({ slug: "rb-upd", mode: "update", rel, readBack, pre: base("rb-upd") }));
    if (!named) { assert.match(w.page.done, /<b>Updated from 0\.1\.0 to/, readBack); continue; }
    assert.match(w.page.done, named, readBack);
    assert.ok(!/<b>Updated (from|to)/.test(w.page.done), "no success claimed");
    assert.equal(w.page.status("verify"), "no");
  }
  /* An update whose copy has no address to ask still names the mismatch. */
  const noAddr = seen(await run({ slug: "rb-noaddr", mode: "update", rel, readBack: "differ", subdomain: null, pre: base("rb-noaddr") }));
  assert.match(noAddr.page.done, MISMATCH);
  assert.ok(!/<b>Updated (from|to)/.test(noAddr.page.done));
  restoreSigners();
});

/* ------------------------------------------------------------------------------------------------ nothing loaded from elsewhere */

/* R35: every load a page names, with its value: any `src`, `srcset`, `poster`, `data` or `background`; any `href` but a
   link's (`<a>`, which the reader follows: not a load); any CSS `@import` or `url()`; any script `fetch` or `import()`.
   One on another origin is one whose value names a scheme (other than `data:`, `blob:`, `about:`) or starts `//`. */
const loadsIn = (page) => {
  const out = [];
  for (const [, tag, attrs] of page.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi))
    for (const a of attrs.matchAll(/(?:^|\s)(src|srcset|poster|data|background|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
      if (tag.toLowerCase() === "a" && a[1].toLowerCase() === "href") continue;
      const v = a[2] ?? a[3] ?? a[4];
      out.push(...(a[1].toLowerCase() === "srcset" ? v.split(",").map((x) => x.trim().split(/\s+/)[0]) : [v]));
    }
  for (const m of page.matchAll(/@import\s+(?:url\(\s*)?["']?([^"')\s;]+)/gi)) out.push(m[1]);
  for (const m of page.matchAll(/url\(\s*["']?([^"')]+)/gi)) out.push(m[1].trim());
  for (const m of page.matchAll(/\b(?:fetch|import)\(\s*["'`]([^"'`]+)/g)) out.push(m[1]);
  return out;
};
const elsewhere = (v) => /^\s*\/\//.test(v) || (/^\s*[a-z][a-z0-9+.-]*:/i.test(v) && !/^\s*(data|blob|about):/i.test(v));

test("R35 every page the installer serves, and the invitation page, names no resource on another origin in any src, href, @import or url(); typefaces are the device's; a link the reader follows is not a load", async () => {
  /* The reading itself: it finds each kind of load on another origin, the invitation page's old Google Fonts head among
     them, and passes a link, a same-origin load and a fetch of the installer's own route. */
  const OLD_HEAD = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces&display=swap" rel="stylesheet">`;
  assert.deepEqual(loadsIn(OLD_HEAD).filter(elsewhere), ["https://fonts.googleapis.com", "https://fonts.gstatic.com",
    "https://fonts.googleapis.com/css2?family=Fraunces&display=swap"]);
  for (const bad of [`<script src="https://cdn.example/x.js"></script>`, `<img src=//cdn.example/x.png>`,
      `<img srcset="/a.png 1x, https://cdn.example/b.png 2x">`, `<style>@import "https://cdn.example/x.css";</style>`,
      `<style>@import url(https://cdn.example/x.css);</style>`, `<style>body{background:url('//cdn.example/x.png')}</style>`,
      `<style>@font-face{src:url(https://fonts.gstatic.com/x.woff2)}</style>`, `<script>fetch("https://api.example/x")</script>`])
    assert.ok(loadsIn(bad).filter(elsewhere).length >= 1, bad);
  for (const fine of [`<a href="https://dash.cloudflare.com/sign-up" rel="noopener">`, `<a class="btn" href='https://newgroup.example/'>`,
      `<link rel="stylesheet" href="/x.css">`, `<script>fetch("/begin",{method:"POST"})</script>`, `<button data-url="https://x.example/">`,
      `<img src="data:image/png;base64,AAAA">`])
    assert.deepEqual(loadsIn(fine).filter(elsewhere), [], fine);

  /* Every page: the install and update pages, a 404, every page the suite above streamed or answered (the progress pages
     of every install and update, with their panels, and the callback's refusals), and the invitation page. */
  const pages = [await text("/"), await text("/update"), await text("/elsewhere"), ...RAW, ...PAGES, INVITATION];
  assert.ok(RAW.length > 40, "the pages this suite rendered");
  for (const page of pages) assert.deepEqual(loadsIn(page).filter(elsewhere), [], page.slice(0, 160));
  /* Typefaces are the device's: no page declares a face to fetch, and the invitation page's stacks are the Worker's own. */
  for (const page of pages) assert.equal(/@font-face/i.test(page), false, page.slice(0, 160));
  const stacks = (css) => [...css.matchAll(/--(display|body|mono):([^;]+);/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(stacks(INVITATION).filter(([k]) => k !== "display"), stacks(PAGE_CSS));
  assert.ok(/(--display:|font-family:)Georgia,serif/.test(INVITATION) && PAGE_CSS.includes("font-family:Georgia,serif"));
  /* A link the reader follows stays: the hosting provider's sign-up, and the installer's own address. */
  assert.ok(INVITATION.includes('<a href="https://dash.cloudflare.com/sign-up"'));
  assert.ok(INVITATION.includes('href="https://newgroup.believeinoakland.workers.dev/"'));
});

/* ------------------------------------------------------------------------------------------------ a member's own limits */

test("R39 a fleet member's limits are read from its signed bundle (`bio-member-limits/1 …`) and sent exactly at its upload, on install and update, the installer holding no value of its own; a member stating none is uploaded with none; one stating them unreadably is left out, named, and the install never fails over it; the fleet statement is unchanged", async () => {
  const member = (stmt, q = '"') => `export default { fetch(){ return new Response('member'); } }; export const L = ${q}${stmt}${q};`;
  const SHEET = "sheet-worker", ALL = [...new Set([...MEMBERS, SHEET])];
  const putOf = async (w, name) => {
    const c = w.calls.filter((x) => x.method === "PUT" && x.u.endsWith("/workers/scripts/" + name)).at(-1);
    return c ? JSON.parse(await c.init.body.get("metadata").text()) : null;
  };
  armWith(SIGNER.line);
  /* Exactly the bundle's statement, in any quote style a bundler prints, on the install and on the update; a member that
     states none is uploaded with no limits, as before. */
  for (const [stmt, q, want] of [["bio-member-limits/1 cpu_ms=300000", '"', { cpu_ms: 300000 }],
      ["bio-member-limits/1 cpu_ms=30000 subrequests=50", "'", { cpu_ms: 30000, subrequests: 50 }], ["bio-member-limits/1 cpu_ms=7", "`", { cpu_ms: 7 }]]) {
    const rel = await release({ version: NEXT, members: ALL, memberSrc: { [SHEET]: member(stmt, q) + ` const again = "${stmt}";` } });
    const i = seen(await run({ slug: "mlim-install", rel }));
    assert.deepEqual((await putOf(i, SHEET)).limits, want, stmt);
    for (const m of ALL.filter((x) => x !== SHEET)) assert.equal("limits" in (await putOf(i, m)), false, `${m} states none, so none is sent`);
    assert.match(i.page.label("fleet"), new RegExp(`All ${ALL.length} capability workers installed and verified`), stmt);
    const u = seen(await run({ slug: "mlim-update", mode: "update", pre: { "mlim-update": planeBase("mlim-update") }, rel }));
    assert.deepEqual((await putOf(u, SHEET)).limits, want, `update: ${stmt}`);
  }
  /* A container member is uploaded with its own limits too (R38's upload). */
  const boxed = await release({ version: NEXT, container: true, memberSrc: { [RUNNER]: member("bio-member-limits/1 cpu_ms=900") } });
  const box = seen(await run({ slug: "mlim-box", rel: boxed }));
  assert.deepEqual((await putOf(box, RUNNER)).limits, { cpu_ms: 900 });
  /* Unreadable: that member is left out, named with why; every other member installs; the install finishes. */
  for (const [src, says] of [[member("bio-member-limits/1 cpu_ms=300000") + ' const b = "bio-member-limits/1 cpu_ms=5";', /states its limits unreadably \(it states them 2 different ways\)/],
      [member("bio-member-limits/1 subrequests=5 cpu_ms=5"), /states its limits unreadably .*keys sorted/], [member("bio-member-limits/1 cpu_ms=0"), /unreadably/],
      [member("bio-member-limits/1 cpu_ms=lots"), /unreadably/], [member("bio-member-limits/1 cpu_ms=1 cpu_ms=2"), /unreadably/]]) {
    const w = seen(await run({ slug: "mlim-bad", rel: await release({ version: NEXT, members: ALL, memberSrc: { [SHEET]: src } }) }));
    assert.ok(!w.acct.has(SHEET), "left out");
    for (const m of ALL.filter((x) => x !== SHEET)) assert.ok(w.acct.has(m), `${m} still installs`);
    assert.match(w.page.label("fleet"), new RegExp(`left out: ${SHEET} \\(its bundle states its limits unreadably`));
    assert.match(w.page.label("fleet"), says);
    assert.ok(w.page.done, "the install never fails over a member");
  }
  /* The two statements are never read as each other: a member's in the plane is not the plane's, a plane's in a member is not the member's. */
  assert.deepEqual(installer.memberLimits(member("bio-plane-limits/1 subrequests=10000")), { ok: true, limits: null });
  assert.deepEqual(planeLimits(UNSTATED_SRC + ' const m = "bio-member-limits/1 cpu_ms=300000";'), { ok: false, why: "none" });
  /* Nothing is added to the fleet statement: the limits ride in the member bytes its hash covers, so the /2 statement an
     older installer rebuilds is the one signed, and the manifest's keys are as before. */
  const rel = await release({ version: NEXT, members: ALL, memberSrc: { [SHEET]: member("bio-member-limits/1 cpu_ms=300000") } });
  assert.deepEqual(Object.keys(rel.manifest).sort(), ["asset", "bytes", "fleet", "fleetSig", "sha256", "sig", "version"]);
  assert.deepEqual(Object.keys(rel.manifest.fleet.find((m) => m.member === SHEET)).sort(), ["asset", "bytes", "compat", "member", "parts", "services", "sha256"]);
  restoreSigners();
  /* The member this tree builds states its limits as this reads them (`sheet-worker` R17), equal to its own
     `wrangler.jsonc`'s `limits`: built here by the bundler's own recipe, the bytes a release would sign. */
  const { discoverMembers, buildMember } = await import("../../bio-plane/scripts/fleet-bundle.mjs");
  const sheet = discoverMembers().find((m) => m.name === SHEET);
  const built = await buildMember(sheet, { write: false });
  const cfgLimits = JSON.parse(readFileSync(new URL("../../sheet-worker/wrangler.jsonc", import.meta.url), "utf8").match(/"limits":\s*(\{[^}]*\})/)[1]);
  assert.deepEqual(installer.memberLimits(built.bytes), { ok: true, limits: cfgLimits });
});

/* ------------------------------------------------------------------------------------------------ the words members and founders see */

/* R40: a page's member- and founder-facing words: no style or script, no markup; the hosting block (instance-setup's
   export, R34, its words that module's), codes, binding and field names, and identifiers taken out; and the meanings of
   "copy" R40 keeps (a release's built-in or repository copy; the Copy buttons) and BOB's kept line ("someone else's
   servers", K1785) taken out. What is left must never call the group's own Civicsmith a copy, instance, plane or server. */
const blockText = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const memberWords = (page) => {
  let t = page.replace(/<style>[\s\S]*?<\/style>/g, " ").replace(/<script>[\s\S]*?<\/script>/g, " ");
  for (const x of [HOSTING_CONTROL.heading, ...HOSTING_CONTROL.sentences]) t = t.split(blockText(x)).join(" ").split(x).join(" ");
  t = t.replace(/<button class="copy"[^>]*>Copy<\/button>/g, " ").replace(/<[^>]+>/g, " ").replace(/&#39;/g, "'").replace(/&amp;/g, "&");
  t = t.replace(/(repository's|built-in) copy/g, " ").replace(/someone else's servers/g, " ").replace(/number of instances/g, " ");
  return t.replace(/\b[A-Z][A-Z0-9_]{2,}\b/g, " ").replace(/\S*[-_=/.:]\S*/g, (w) => /[a-z][-_=/.:][a-z]/i.test(w) ? " " : w);
};
test("R40 every member- or founder-facing string the installer serves (the install and update pages, every step and refusal, the final panel and last screen, the invitation page) says \"your group's Civicsmith\" or needs no name, never copy, instance, plane or server for it; \"installation\" only where the hosting is the subject", async () => {
  /* The reading finds each word it is for, and passes the meanings R40 keeps. */
  for (const bad of ["Your copy is running.", "the plane itself installed", "on this instance", "our servers", "Go to my copy"])
    assert.match(memberWords(`<p>${bad}</p>`), /\b(copy|instance|plane|servers?)\b/i, bad);
  for (const fine of ["The repository's copy carries no signature", "the installer used its built-in copy", "the binding INSTANCE_NAME",
      `<button class="copy" data-copy="out-url">Copy</button>`, "bio-plane.bundled.mjs", "op=instancegroupseed", "someone else's servers"])
    assert.doesNotMatch(memberWords(`<p>${fine}</p>`), /\b(copy|instance|plane|servers?)\b/i, fine);
  /* Every page: the install and update pages, a 404, every page the suite above streamed or answered (the progress pages
     of every install and update with their steps, refusals and panels, the callback's refusals), and the invitation page. */
  const pages = [await text("/"), await text("/update"), await text("/elsewhere"), ...RAW, ...PAGES, INVITATION];
  assert.ok(RAW.length > 40, "the pages this suite rendered");
  for (const page of pages) {
    const words = memberWords(page);
    const hit = words.match(/.{0,60}\b(copy|copies|instance|instances|plane|planes|server|servers)\b.{0,40}/i);
    assert.equal(hit, null, hit?.[0]);
  }
  /* Each changed string by name: the pages' titles, the last screen's hand-over, R32's sentence, R14's address step, the
     refusal pages, the assistant's words, and the limits' refusal. */
  const home = await text("/"), upd = await text("/update");
  for (const [page, want] of [[home, "<title>Set up your group's Civicsmith</title>"], [home, "<h2>Name your group's Civicsmith</h2>"],
      [upd, "<title>Update your group's Civicsmith</title>"], [upd, "The name your group's Civicsmith was installed under"],
      [INVITATION, "<title>Start your group's own Civicsmith</title>"], [INVITATION, ">Set up my group's Civicsmith</a>"],
      [await text("/elsewhere"), "Setting up your group&#39;s Civicsmith."]])
    assert.ok(page.includes(want), want);
  assert.match(ASSISTANT_OFFER.replace(/\s+/g, " "), /inside your group's Civicsmith/);
  const done = seen(await run({ slug: "r40-words" }));
  assert.ok(done.page.done.includes(">Go to your group&#39;s Civicsmith and finish setup</button>"));
  assert.match(done.page.done, /<b>Your group's Civicsmith is running\.<\/b>/);
  assert.match(done.raw, /<title>Setting up your group&#39;s Civicsmith<\/title>/);
  assert.equal(done.page.events.find((e) => e.k === "step" && e.id === "fleet").label, "Installing the capability workers beside your group's Civicsmith");
  const one = seen(await run({ slug: "r40-one", preBuckets: ["bio-captures"] }));
  assert.equal(one.page.failed.h, "Your Cloudflare account already holds an installation of Civicsmith");
  assert.match(one.page.failed.p, /^One installation of Civicsmith per Cloudflare account is supported for now: /);
  const up = seen(await run({ slug: "r40-up", mode: "update", pre: { "r40-up": planeBase("r40-up") } }));
  assert.match(up.raw, /<title>Updating your group&#39;s Civicsmith<\/title>/);
  assert.equal(up.page.events.find((e) => e.k === "step" && e.id === "find").label, `Finding your group's Civicsmith, installed as "r40-up"`);
  assert.equal(up.page.events.find((e) => e.k === "step" && e.id === "addr").label, "Finding the address of your group's Civicsmith");
  assert.ok(up.page.done.includes(">Open your group&#39;s Civicsmith</a>"));
  /* "Copy" keeps its other meaning: the release the installer carries is still its built-in copy. */
  armWith(SIGNER.line);
  const tamper = await release({ version: NEXT, fleet: false }); tamper.assets["bio-plane.bundled.mjs"] = "tampered";
  const kept = seen(await run({ slug: "r40-kept", rel: tamper }));
  restoreSigners();
  assert.match(kept.page.label("rel"), /The repository's copy did not pass its integrity check/);
});

/* ------------------------------------------------------------------------------------------------ the short name and the description */

/* R41: a page's own script, run as a browser runs it, against a stand-in for the few elements it touches: each element
   with an id, and each checkbox and radio by name. `fetch` and `location` are recorded; a click runs its listeners. */
function pageWorld(page) {
  const els = new Map(), inputs = [];
  const make = (tag, attrs) => {
    const el = { tag, attrs, value: "", checked: false, disabled: false, textContent: "", dataset: {}, open: false, on: {},
      selectionStart: 0, addEventListener(k, f) { (this.on[k] ||= []).push(f); }, focus() {}, setSelectionRange() {},
      showModal() { this.open = true; }, close() { this.open = false; },
      async click() { if (this.disabled) return; for (const f of this.on.click || []) await f({ target: this }); } };
    return el;
  };
  for (const [, tag, attrs] of page.matchAll(/<([a-z]+)\b([^>]*)>/g)) {
    const id = attrs.match(/\bid="([^"]+)"/)?.[1], name = attrs.match(/\bname="([^"]+)"/)?.[1];
    const el = make(tag, attrs);
    if (id) els.set(id, el);
    if (tag === "input" && name) inputs.push(Object.assign(el, { name, value: attrs.match(/\bvalue="([^"]*)"/)?.[1] ?? "" }));
  }
  const document = {
    querySelector: (q) => q.startsWith("#") ? els.get(q.slice(1)) ?? null
      : inputs.find((i) => q === `input[name="${i.name}"]:checked` && i.checked) ?? null,
    querySelectorAll: (q) => inputs.filter((i) => q === `input[name="${i.name}"]`),
    getElementById: (id) => els.get(id) ?? null,
  };
  const sent = [], location = { href: null };
  const fetch = async (url, init) => { sent.push({ url, body: JSON.parse(init.body) });
    return { json: async () => ({ ok: true, authorize: "https://dash.cloudflare.com/oauth2/auth?x=1" }) }; };
  const [js] = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  new Function("document", "fetch", "location", js)(document, fetch, location);
  return { el: (id) => els.get(id), sent, location };
}

test("R41 the install page's act that chooses the short name shows the Irreversible weight (its word beside its mark); before /begin is sent in install mode a full dialog states the choice is permanent and names the short name typed; only the confirming act sends /begin, closing sends nothing; the update page shows neither", async () => {
  const home = await text("/"), upd = await text("/update");
  const PIPS = /<span class="pips" aria-hidden="true">(?:<i class="on"><\/i>){5}<\/span>Irreversible<\/span>/;
  /* The weight: five pips, the word beside them, on the button that chooses the short name and on the dialog's confirming act. */
  const go = home.match(/<button id="go">([\s\S]*?)<\/button>/)[1];
  assert.match(go, PIPS, "the act choosing the short name carries the Irreversible weight");
  const yes = home.match(/<button type="button" id="confirm-yes">([\s\S]*?)<\/button>/)[1];
  assert.match(yes, PIPS, "and so does the act that confirms it");
  /* The dialog's words: the short name becomes the address and the worker's name and stands beside every signature; it
     can never be changed but by installing a new Civicsmith and starting again. */
  const dialog = home.match(/<dialog id="confirm"[\s\S]*?<\/dialog>/)[0];
  const words = dialog.replace(/<[^>]+>/g, " ").replace(/&ldquo;|&rdquo;/g, "\"").replace(/\s+/g, " ");
  assert.match(words, /is permanent/);
  assert.match(words, /in every address of your group's Civicsmith/);
  assert.match(words, /beside every signature/);
  assert.match(words, /becomes the name of its worker in your Cloudflare account/);
  assert.match(words, /can never be changed, by you or anyone, without installing a new Civicsmith and starting again/);
  assert.ok(!/ceremony|publish/i.test(words), "not a publication, no ceremony (DEC-143)");
  /* The behaviour, as the page's own script does it. */
  const w = pageWorld(home);
  w.el("slug").value = "River Keepers!";
  await w.el("go").click();
  assert.deepEqual(w.sent, [], "pressing the act sends nothing yet");
  assert.equal(w.el("confirm").open, true, "the full dialog opens");
  assert.equal(w.el("confirm-name").textContent, "river-keepers", "it names the short name typed, as it will be sent");
  await w.el("confirm-no").click();
  assert.deepEqual([w.sent, w.el("confirm").open, w.location.href], [[], false, null], "closing it sends nothing");
  await w.el("go").click();
  w.el("slug").value = "something-else";
  await w.el("confirm-yes").click();
  assert.equal(w.sent.length, 1, "only the confirming act sends /begin");
  assert.deepEqual([w.sent[0].url, w.sent[0].body.slug, w.sent[0].body.mode], ["/begin", "river-keepers", "install"], "the name the dialog named");
  assert.equal(w.el("confirm").open, false);
  assert.equal(w.location.href, "https://dash.cloudflare.com/oauth2/auth?x=1");
  /* A name too short opens nothing. */
  const short = pageWorld(home);
  short.el("slug").value = "ab";
  await short.el("go").click();
  assert.deepEqual([short.sent, short.el("confirm").open], [[], false]);
  /* The update chooses no short name: no weight, no dialog, /begin sent at once. */
  assert.ok(!upd.includes("Irreversible") && !upd.includes('class="pips"') && !upd.includes("<dialog"), "the update page shows neither");
  const u = pageWorld(upd);
  u.el("slug").value = "river-keepers";
  await u.el("go").click();
  assert.deepEqual(u.sent.map((x) => [x.url, x.body.mode]), [["/begin", "update"]]);
});

test("R42 where the installer's pages and the invitation page say in one line what Civicsmith is, the line is exactly DEC-146's description, with its second line where there is room; no page says \"civic groups\" alone or \"and other organisations\"", async () => {
  /* The two lines, exactly as R42 (and public-read R30) state them. */
  const LINE = "Free software for groups that check whether government keeps its own rules and promises.";
  const SECOND = "Neighbourhood and issue groups, newsrooms, professional associations, and public offices checking their own work.";
  assert.deepEqual([DESCRIPTION, WHO], [LINE, SECOND]);
  const home = await text("/");
  for (const [where, page] of [["install page", home], ["invitation page", INVITATION]]) {
    assert.ok(page.includes(`<meta name="description" content="${LINE}">`), `${where}: its description`);
    assert.equal([...page.matchAll(/<p class="what">([^<]*)<\/p>/g)].map((m) => m[1]).join("|"), LINE, `${where}: the one line`);
    assert.equal([...page.matchAll(/<p class="small who">([^<]*)<\/p>/g)].map((m) => m[1]).join("|"), SECOND, `${where}: the second line`);
    /* The page's one-line descriptions before DEC-146 are gone. */
    assert.ok(!/accountability record|tamper-evident record/.test(page), where);
  }
  /* Every page this suite rendered, and the update page and a 404. */
  const pages = [home, await text("/update"), await text("/elsewhere"), ...RAW, ...PAGES, INVITATION];
  assert.ok(RAW.length > 40, "the pages this suite rendered");
  for (const page of pages) {
    const words = page.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    assert.equal(/\bcivic groups\b/i.test(words), false, words.match(/.{0,60}civic groups.{0,40}/i)?.[0]);
    assert.equal(/\band other organi[sz]ations\b/i.test(words), false, words.match(/.{0,60}other organi[sz]ations.{0,40}/i)?.[0]);
  }
});
