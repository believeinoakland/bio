/* installer R1–R33, each at the module's interface: the Worker's routes driven with a request, everything it reaches
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
import worker, { CFG, MEMBER_BINDINGS, PLANE_LIMITS } from "../src/index.mjs";
import { EXAMPLE_SLUG, PUBLISHER } from "../src/ui.mjs";
import { RELEASE_VERSION, RELEASE_SOURCE } from "../src/release.mjs";
import { resolveVersion, checkSignedAsset, embedRelease } from "../scripts/embed-release.mjs";
import { verifySshsig, NS_RELEASE } from "../../bio-plane/src/sshsig.mjs";
import * as jurisdictions from "../../jurisdictions/index.mjs";
import { TOK, ORIGIN, req, begin, callback, cookieOf, cookieValue, b64url, script, realFetch, jres, run, release,
  SIGNER, STRANGER, armWith, disarm, restoreSigners, sha, bump, CAPABLE_SRC, PRE116_SRC, MEMBER_SRC, bindingOf,
  parsePage } from "./fixture.mjs";

after(restoreSigners);
const NEXT = bump(RELEASE_VERSION);
const text = async (path) => (await req(path)).text();
const secretsOf = (put) => (put?.meta?.bindings || []).filter((b) => b.type === "secret_text");
/* Every page this suite renders, for R19, R22 and R31, which hold over all of them. */
const PAGES = [];
const seen = (x) => { PAGES.push(typeof x === "string" ? x : x.page.words); return x; };
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

test("R2 POST /begin: the slug grammar and the wizard's own name refused 400 in words; a malformed instanceAi refused by name; else PKCE S256, a fresh state, exactly three scopes, the registered redirect, and the 15-minute cookie", async () => {
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
    scope: "workers-scripts.write workers-r2.write account-settings.read", code_challenge_method: "S256" });
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
  assert.match(w.page.failed.h, /A copy named "taken-name" already exists/);
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
  const before = paid.calls.slice(0, paid.calls.indexOf(probe)).map((c) => `${c.method} ${c.u.replace(CFG.API, "")}`);
  assert.deepEqual(before, [`POST ${CFG.TOKEN}`, "GET /accounts", "GET /accounts/A1/workers/scripts/plan-paid/settings"],
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
  const again = seen(await run({ slug: "r2-again", r2: "exists" }));
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
    const put = w.planePuts[0];
    assert.equal(put.source, from === "repository" ? rel.src : RELEASE_SOURCE, why);
    assert.equal(bindingOf(put, "VERSION").text, from === "repository" ? NEXT : RELEASE_VERSION, why);
    assert.match(w.page.label("rel"), says, why);
  }
  disarm();
  const rel = await release({ version: NEXT, sig: "none", fleet: false });
  const w = seen(await run({ slug: "rel-unarmed", rel }));
  assert.equal(w.planePuts[0].source, rel.src, "unarmed, the hash alone admits it");
  assert.match(w.page.label("rel"), /Its integrity checked out/);
  const bad = await release({ version: NEXT, sig: "none", fleet: false });
  bad.assets["bio-plane.bundled.mjs"] = "tampered";
  assert.equal((await run({ slug: "rel-unarmed-bad", rel: bad })).planePuts[0].source, RELEASE_SOURCE, "nothing that failed is installed");
  restoreSigners();
});

test("R9 `gen`: four fresh 32-byte random credentials; INSTANCE_AI_TOKEN bound only when the operator supplied a valid one, never generated", async () => {
  const a = seen(await run({ slug: "gen-a" })), b = seen(await run({ slug: "gen-b" }));
  const names = (w) => secretsOf(w.planePuts[0]).map((s) => s.name).sort();
  assert.deepEqual(names(a), ["ADMIN_TOKEN", "DAEMON_TOKEN", "MEMBER_TOKEN", "PROBE_TOKEN"]);
  const values = [...secretsOf(a.planePuts[0]), ...secretsOf(b.planePuts[0])].map((s) => s.text);
  for (const v of values) assert.equal(Buffer.from(v, "base64url").length, 32, "32 random bytes, base64url");
  assert.equal(new Set(values).size, 8, "distinct within an install and across installs");
  const AI = "aik-" + "5".repeat(30);
  const ai = seen(await run({ slug: "gen-ai", ai: AI }));
  assert.deepEqual(secretsOf(ai.planePuts[0]).filter((s) => s.name === "INSTANCE_AI_TOKEN").map((s) => s.text), [AI]);
  for (const w of [a, b]) for (const p of w.planePuts) assert.equal(bindingOf(p, "INSTANCE_AI_TOKEN"), null);
});

test("R10 `install`: the plane uploaded with STORE (SQLite v1), VERSION, INSTANCE_NAME, the credentials, both buckets, SELF, BROWSER, the members present, the limits and the plane's compatibility; a refusal retries once without SELF, else nothing is left", async () => {
  const cfg = readFileSync(new URL("../../bio-plane/wrangler.jsonc", import.meta.url), "utf8");
  const compatDate = cfg.match(/"compatibility_date":\s*"([^"]+)"/)[1];
  const compatFlags = JSON.parse(cfg.match(/"compatibility_flags":\s*(\[[^\]]*\])/)[1]);
  const pre = { "pdf-worker": [{ type: "plain_text", name: "VERSION", text: "0.1.0" }] };
  const w = seen(await run({ slug: "inst-shape", pre, ai: "aik-" + "3".repeat(20) }));
  const m = w.planePuts[0].meta;
  assert.deepEqual(m.migrations, { new_tag: "v1", new_sqlite_classes: ["Store"] });
  assert.deepEqual([m.main_module, m.compatibility_date, m.compatibility_flags], ["index.mjs", compatDate, compatFlags]);
  assert.deepEqual(m.limits, { ...PLANE_LIMITS });
  const by = Object.fromEntries(m.bindings.map((b) => [b.name, b]));
  assert.deepEqual(by.STORE, { type: "durable_object_namespace", name: "STORE", class_name: "Store" });
  assert.equal(by.VERSION.text, RELEASE_VERSION);
  assert.deepEqual(by.INSTANCE_NAME, { type: "plain_text", name: "INSTANCE_NAME", text: "inst-shape" });
  assert.deepEqual([by.CAPTURES.bucket_name, by.PUBLISHED.bucket_name], ["bio-captures", "bio-published"]);
  assert.deepEqual(by.SELF, { type: "service", name: "SELF", service: "inst-shape" });
  assert.deepEqual(by.BROWSER, { type: "browser", name: "BROWSER" });
  assert.deepEqual(by.PDF_WORKER, { type: "service", name: "PDF_WORKER", service: "pdf-worker" }, "a member already present is bound");
  assert.equal(by.AGENT_WORKER, undefined, "a member not present is not");
  assert.equal(by.INSTANCE_AI_TOKEN.type, "secret_text");
  assert.equal(Object.keys(by).length, 13, "nothing else: " + Object.keys(by).join(","));
  const shy = seen(await run({ slug: "inst-shy", refuseSelf: true }));
  assert.equal(shy.planePuts.length, 1, "the retry landed");
  assert.equal(bindingOf(shy.planePuts[0], "SELF"), null);
  assert.equal(shy.refused.filter((r) => r.startsWith("inst-shy")).length, 1, "retried exactly once");
  assert.match(shy.page.label("install"), /re-check documents on its own schedule — was refused by Cloudflare and was left out.*Running the updater on this copy later turns it on/s);
  const no = seen(await run({ slug: "inst-refused", refuseAllPlane: true }));
  assert.equal(no.refused.length, 2, "tried with SELF, then once without");
  assert.equal(no.page.status("install"), "no");
  assert.match(no.page.failed.p, /nothing left behind to clean up/);
  assert.ok(!no.acct.has("inst-refused"));
  assert.ok(!no.page.done);
});

test("R11 `fleet`: members install only from a reachable repository whose signed fleet statement verifies against an armed key and names the plane just installed; each part hashed; an unknown part type refuses that member; every member left out is named; the install never fails over one", async () => {
  armWith(SIGNER.line);
  const full = seen(await run({ slug: "fleet-all", rel: await release({ version: NEXT }) }));
  for (const member of Object.keys(MEMBER_BINDINGS)) assert.ok(full.acct.has(member), member);
  assert.deepEqual(full.acct.get("agent-worker").find((b) => b.name === "PLANE"), { type: "service", name: "PLANE", service: "fleet-all" });
  assert.match(full.page.label("fleet"), /All 3 capability workers installed and verified/);
  const noneOf = async (why, opts, says, runOpts = {}) => {
    const w = seen(await run({ slug: "fleet-" + why, rel: opts && await release({ version: NEXT, ...opts }), ...runOpts }));
    for (const member of Object.keys(MEMBER_BINDINGS)) assert.ok(!w.acct.has(member), `${why}: ${member} not installed`);
    assert.match(w.page.label("fleet"), says, why);
    assert.equal(w.page.status("install"), "ok", `${why}: the plane installed`);
    assert.ok(w.page.done, `${why}: the install finished`);
  };
  await noneOf("unreachable", null, /was not reachable, so no capability workers were installed/);
  await noneOf("no-fleet", { fleet: false }, /names no capability workers/);
  await noneOf("no-fleetsig", { fleetSig: "none" }, /names no capability workers/);
  await noneOf("dropped", { signedMembers: ["agent-worker", "pdf-worker", "ocr-worker", "extra-worker"] }, /fleet signature did not verify/);
  await noneOf("foreign-plane", { sig: "stranger" }, /signed against a different plane than the one just installed/);
  await noneOf("not-newer", { version: RELEASE_VERSION }, /signed against a different plane than the one just installed/);
  disarm();
  await noneOf("unarmed", {}, /carries no signing key/);
  armWith(SIGNER.line);
  const part = seen(await run({ slug: "fleet-part", rel: await release({ version: NEXT, badType: "ocr-worker" }) }));
  assert.ok(!part.acct.has("ocr-worker") && part.acct.has("pdf-worker") && part.acct.has("agent-worker"));
  assert.match(part.page.label("fleet"), /ocr-worker \(part assets\/x\.wasm has module type 'Mystery' this installer does not know/);
  const bytes = seen(await run({ slug: "fleet-hash", rel: await release({ version: NEXT, tamper: "pdf-worker", missing: "agent-worker" }) }));
  assert.ok(!bytes.acct.has("pdf-worker") && !bytes.acct.has("agent-worker") && bytes.acct.has("ocr-worker"));
  const said = bytes.page.label("fleet");
  assert.match(said, /^1 capability worker\(s\) installed \(ocr-worker\); 2 left out: /);
  assert.ok(said.includes("pdf-worker (pdf-worker failed its integrity check)") && said.includes("agent-worker (agent-worker http 404)"), said);
  assert.ok(bytes.page.done, "the install never fails over a member");
  const ocr = full.calls.find((c) => c.method === "PUT" && c.u.endsWith("/scripts/ocr-worker"));
  assert.equal(ocr.init.body.get("assets/x.wasm").type, "application/wasm", "a part is uploaded under its stated type");
  restoreSigners();
});

test("R12 `bind`: the plane bound first to the members already present, then the members installed, then (only when one was added) re-uploaded bound to every member present; a refused re-upload is named and the members stay", async () => {
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const RIGHT = Object.fromEntries(Object.entries(MEMBER_BINDINGS).map(([m, b]) => [b, m]));
  const targets = (bindings) => Object.fromEntries(Object.values(MEMBER_BINDINGS).map((b) => [b, (bindings || []).find((x) => x.name === b)?.service ?? null]));
  const fresh = seen(await run({ slug: "bind-fresh", rel }));
  assert.equal(fresh.planePuts.length, 2);
  assert.deepEqual(targets(fresh.planePuts[0].bindings), { AGENT_WORKER: null, PDF_WORKER: null, OCR_WORKER: null }, "act 1: none present");
  assert.deepEqual(targets(fresh.planePuts[1].bindings), RIGHT, "act 3: every member");
  assert.deepEqual(fresh.refused, [], "never a binding to a worker not yet there");
  const puts = fresh.calls.filter((c) => c.method === "PUT" && /\/workers\/scripts\/[^/]+$/.test(c.u) && !c.u.endsWith("bio-plan-probe"))
    .map((c) => c.u.split("/scripts/")[1]);
  assert.equal(puts[0], "bind-fresh"); assert.equal(puts.at(-1), "bind-fresh");
  assert.deepEqual(puts.slice(1, -1).sort(), Object.keys(MEMBER_BINDINGS).sort(), "act 2 between");
  assert.equal(fresh.planePuts[1].meta.migrations, undefined, "the re-upload takes the update's shape");
  assert.match(fresh.page.label("bind"), /Your copy is connected to/);
  const old = [{ type: "plain_text", name: "VERSION", text: "0.1.0" }];
  const had = seen(await run({ slug: "bind-had", rel, pre: Object.fromEntries(Object.keys(MEMBER_BINDINGS).map((m) => [m, old])) }));
  assert.equal(had.planePuts.length, 1, "nothing added, no re-upload");
  assert.deepEqual(targets(had.planePuts[0].bindings), RIGHT);
  const bad = seen(await run({ slug: "bind-refused", rel, refuseRePut: true }));
  assert.equal(bad.page.status("bind"), "no");
  assert.match(bad.page.label("bind"), /installed, but connecting your copy to them was refused/);
  for (const m of Object.keys(MEMBER_BINDINGS)) assert.ok(bad.acct.has(m), `${m} stays installed`);
  restoreSigners();
});

test.todo("R13 each member that reads captured bytes is bound to the instance's CAPTURES bucket (not yet met: MULTI-INSTANCE-ISOLATION row 6; installed members get no R2 binding)");

test("R14 `addr`: the account's workers.dev prefix is used; with none, one is registered from the slug (or with a suffix) and said; the address is enabled; a failure says the copy is installed without an address", async () => {
  const has = seen(await run({ slug: "addr-has", subdomain: "grp" }));
  assert.ok(has.enabled.has("addr-has"));
  assert.equal(has.page.events.find((e) => e.k === "ok" && e.id === "addr").label, null, "nothing to say");
  assert.ok(has.calls.some((c) => c.u === "https://addr-has.grp.workers.dev/api/?op=selftest&token=" + bindingOf(has.planePuts[0], "PROBE_TOKEN").text));
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

test("R15 `verify`: op=selftest with the probe credential up to ten tries; a capable release's parts read back until each answers it, every lagging part named; an incapable release's parts stated undetermined; no success while a part lags", async () => {
  const quiet = seen(await run({ slug: "ver-quiet", copy: { selftest: () => jres({ ok: false }) } }));
  const probe = bindingOf(quiet.planePuts[0], "PROBE_TOKEN").text;
  const tries = quiet.calls.filter((c) => c.u.includes("op=selftest"));
  assert.equal(tries.length, 10);
  assert.ok(tries.every((c) => c.u.endsWith("&token=" + probe)));
  assert.equal(quiet.page.status("verify"), "no");
  assert.match(quiet.page.done, /has not woken up yet/);
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT });
  const all = seen(await run({ slug: "ver-all", rel }));
  assert.equal(all.page.status("verify"), "ok");
  assert.ok(all.calls.some((c) => c.u.includes("op=bootstrap&members=1")));
  assert.match(all.page.done, /Your copy is running\./);
  const lags = [
    [{ storeVersion: "0.1.0" }, "your copy&#39;s record store still runs 0.1.0"],
    [{ memberVersion: "0.1.0" }, "the capability worker pdf-worker still runs 0.1.0"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, memberVersions: s.members }) }, "record store has not reported its version"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: null, memberVersions: s.members }) }, "record store cannot say which version it runs"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: s.v }) }, "your copy did not report its capability workers"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: "0.1.0", storeVersion: s.v, memberVersions: s.members }) }, "your copy&#39;s address answers 0.1.0"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: s.v, memberVersions: { ...s.members, "ocr-worker": { state: "SILENT" } } }) }, "cannot get an answer from the capability worker ocr-worker, which this step installed"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: s.v, memberVersions: { ...s.members, "ocr-worker": { state: "MISNAMED", name: "pdf-worker" } } }) }, "your copy&#39;s connection to ocr-worker reaches a different worker (pdf-worker)"],
    [{ bootstrap: (q, s) => jres({ ok: true, version: s.v, storeVersion: s.v, memberVersions: { ...s.members, "ocr-worker": { state: "UNBOUND" } } }) }, "ocr-worker was installed, but your copy holds no connection to it"],
    [{ bootstrap: (q, s) => { const mv = { ...s.members }; delete mv["ocr-worker"]; return jres({ ok: true, version: s.v, storeVersion: s.v, memberVersions: mv }); } }, "ocr-worker was installed, but your copy does not know it"],
  ];
  for (const [copy, named] of lags) {
    const w = seen(await run({ slug: "ver-lag", rel, copy }));
    assert.equal(w.page.status("verify"), "no", named);
    assert.ok(w.page.done.includes(named), named);
    assert.ok(!w.page.done.includes("Your copy is running."), named);
    assert.ok(w.page.done.includes('id="out-boot"'), "the credentials are still handed over");
  }
  const failed = seen(await run({ slug: "ver-failed", rel: await release({ version: NEXT, missing: "ocr-worker" }) }));
  assert.ok(failed.page.done.includes("ocr-worker could not be installed, so your copy has no OCR_WORKER connection"));
  const pre = await release({ version: NEXT, src: PRE116_SRC });
  const inc = seen(await run({ slug: "ver-pre", rel: pre }));
  assert.equal(inc.page.status("verify"), "ok");
  assert.match(inc.page.label("verify"), /This release cannot report which version your copy's record store or its capability workers are running/);
  assert.ok(!inc.calls.some((c) => c.u.includes("op=bootstrap&members=1")), "nothing to read back");
  restoreSigners();
});

test("R16 the final panel shows the address, the one-time password and the member and probe credentials once; never DAEMON_TOKEN, INSTANCE_AI_TOKEN or the Cloudflare token; it hands over with the one-time password in the fragment", async () => {
  const AI = "aik-" + "c".repeat(24);
  const w = seen(await run({ slug: "panel", ai: AI }));
  const s = Object.fromEntries(secretsOf(w.planePuts[0]).map((b) => [b.name, b.text]));
  const count = (hay, needle) => hay.split(needle).length - 1;
  assert.equal(count(w.raw, s.ADMIN_TOKEN), 1);
  assert.equal(count(w.raw, s.MEMBER_TOKEN), 1);
  assert.equal(count(w.raw, s.PROBE_TOKEN), 1);
  for (const hidden of [s.DAEMON_TOKEN, s.INSTANCE_AI_TOKEN, TOK]) assert.equal(w.raw.includes(hidden), false);
  assert.match(w.page.done, /id="out-url">https:\/\/panel\.grp\.workers\.dev</);
  assert.match(w.page.done, /id="out-boot">/);
  assert.match(w.page.done, /<button id="handover" data-url="https:\/\/panel\.grp\.workers\.dev\/">/);
  assert.ok(w.raw.includes(`location.href=h.dataset.url+"#boot="+encodeURIComponent(document.getElementById("out-boot").textContent)`));
});

/* ------------------------------------------------------------------------------------------------ the update */

const planeBase = (slug, v = "0.1.0") => [{ type: "durable_object_namespace", name: "STORE", class_name: "Store" },
  { type: "plain_text", name: "VERSION", text: v }, { type: "secret_text", name: "ADMIN_TOKEN", text: "admin-kept" },
  { type: "secret_text", name: "MEMBER_TOKEN", text: "member-kept" }, { type: "secret_text", name: "PROBE_TOKEN", text: "probe-kept" },
  { type: "service", name: "SELF", service: slug }];

test("R17 the update: no script refused unchanged; buckets where possible; the release chosen as R8; the version before read; the credentials, store and buckets kept and the rest restated; a refused upload leaves the copy; fleet, bind, verify as install; a no-op says so", async () => {
  const none = seen(await run({ slug: "upd-none", mode: "update" }));
  assert.equal(none.page.status("find"), "no");
  assert.match(none.page.failed.h, /No copy named "upd-none" exists/);
  assert.ok(!none.calls.some((c) => c.method !== "GET" && c.u.startsWith(CFG.API)));
  const AI = "aik-" + "u".repeat(20);
  const w = seen(await run({ slug: "upd", mode: "update", pre: { upd: planeBase("upd") }, ai: AI }));
  assert.ok(w.calls.findIndex((c) => c.u.endsWith("/api/?op=bootstrap")) < w.calls.findIndex((c) => c.method === "PUT"), "before is read first");
  const m = w.planePuts[0].meta;
  assert.equal("migrations" in m, false);
  assert.deepEqual(m.keep_bindings.slice().sort(), ["durable_object_namespace", "secret_text"]);
  const by = Object.fromEntries(m.bindings.map((b) => [b.name, b]));
  assert.deepEqual(Object.keys(by).sort(), ["BROWSER", "CAPTURES", "DAEMON_TOKEN", "INSTANCE_AI_TOKEN", "INSTANCE_NAME", "PUBLISHED", "SELF", "VERSION"]);
  assert.deepEqual([by.VERSION.text, by.INSTANCE_NAME.text, by.SELF.service, by.INSTANCE_AI_TOKEN.text], [RELEASE_VERSION, "upd", "upd", AI]);
  assert.equal(Buffer.from(by.DAEMON_TOKEN.text, "base64url").length, 32);
  const kept = Object.fromEntries(w.acct.get("upd").filter((b) => b.type === "secret_text").map((b) => [b.name, b.text]));
  assert.deepEqual([kept.ADMIN_TOKEN, kept.MEMBER_TOKEN, kept.PROBE_TOKEN], ["admin-kept", "member-kept", "probe-kept"]);
  assert.match(w.page.done, new RegExp(`Updated from 0\\.1\\.0 to ${RELEASE_VERSION.replace(/\./g, "\\.")}`));
  const noR2 = seen(await run({ slug: "upd-nor2", mode: "update", pre: { "upd-nor2": planeBase("upd-nor2") }, r2: "refused" }));
  const mm = noR2.planePuts[0].meta;
  assert.ok(mm.keep_bindings.includes("r2_bucket") && !mm.bindings.some((b) => b.type === "r2_bucket"), "buckets kept, not re-bound");
  assert.equal(noR2.page.status("up"), "ok", "never refused over storage");
  const refused = seen(await run({ slug: "upd-ref", mode: "update", pre: { "upd-ref": planeBase("upd-ref") }, refuseUpdate: true }));
  assert.match(refused.page.failed.p, /still running the version it had before. Nothing about it changed/);
  assert.deepEqual(refused.acct.get("upd-ref"), planeBase("upd-ref"));
  armWith(SIGNER.line);
  const fl = seen(await run({ slug: "upd-fleet", mode: "update", pre: { "upd-fleet": planeBase("upd-fleet") }, rel: await release({ version: NEXT }) }));
  for (const member of Object.keys(MEMBER_BINDINGS)) assert.ok(fl.acct.has(member), member);
  assert.deepEqual(fl.planePuts.at(-1).bindings.filter((b) => Object.values(MEMBER_BINDINGS).includes(b.name)).length, 3);
  assert.equal(fl.page.status("verify"), "ok");
  assert.match(fl.page.done, /Every part of your copy answers/);
  restoreSigners();
  const same = seen(await run({ slug: "upd-same", mode: "update", pre: { "upd-same": planeBase("upd-same", RELEASE_VERSION) } }));
  assert.match(same.page.label("up") ?? same.page.events.find((e) => e.id === "up").label, /already runs/);
  assert.match(same.page.done, /Nothing changed: your copy was already running/);
  assert.ok(!/<b>Updated (from|to)/.test(same.page.done));
});

test("R18 an update crossing the first group-recording release (0.71.0) tells the seed act, what is refused until it is done, the installed name only as a suggestion; conditional when the version before is unknown; never performed", async () => {
  const groupCalls = (w) => w.calls.filter((c) => /op=instancegroup/.test(c.u));
  const cross = seen(await run({ slug: "cross", mode: "update", pre: { cross: planeBase("cross", "0.70.0") } }));
  assert.match(cross.page.done, /One thing this update does not do for you/);
  assert.match(cross.page.done, /Your copy ran 0\.70\.0 before this update/);
  assert.match(cross.page.done, /GROUP_UNDETERMINED/);
  assert.match(cross.page.done, /POST https:\/\/cross\.grp\.workers\.dev\/api\/\?op=instancegroupseed/);
  assert.match(cross.page.done, /store=scratch/);
  assert.match(cross.page.done, /A suggestion, not a default: this copy was installed under the name <span class="mono">cross<\/span>/);
  const fog = seen(await run({ slug: "fog", mode: "update", pre: { fog: planeBase("fog", "0.70.0") }, copy: { before: null } }));
  assert.match(fog.page.done, /could not read which version your copy ran before this update, so it cannot tell whether this\napplies to you/);
  const past = seen(await run({ slug: "past", mode: "update", pre: { past: planeBase("past", "0.71.0") } }));
  assert.ok(!past.page.done.includes("op=instancegroupseed"));
  const same = seen(await run({ slug: "same", mode: "update", pre: { same: planeBase("same", RELEASE_VERSION) } }));
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

test.todo("R20 the plane's limits are carried from the signed release; a release stating none is refused by name, and an older installer still verifies its fleet signature (not yet met: DIST-15; PLANE_LIMITS is a constant pinned to the plane's config)");
test.todo("R21 the install offers the held non-test jurisdiction profiles by name and coverage, none preselected, and binds the chosen ids as JURISDICTION_PROFILES; choosing none is allowed and said; an update never changes them (not yet met: N10, which needs instance-setup R13)");

test("R22 every page names CivicOS and the installing group, by its chosen name once chosen; no page names a third party (K262); the installer's own address stays, and its pages say it is run by the publisher of CivicOS releases; the example name is not a place", async () => {
  const before = { "/": await text("/"), "/update": await text("/update"), "404": await text("/nowhere"), invitation: INVITATION };
  for (const [where, page] of Object.entries(before)) {
    assert.match(page, /CivicOS/, where);
    assert.match(page, /your group/i, `${where} speaks to the group`);
    assert.ok(page.includes(PUBLISHER), `${where} says the publisher runs it`);
  }
  assert.match(before["/"], /<title>Set up your group's copy of CivicOS<\/title>/);
  assert.match(before["/update"], /<title>Update your copy of CivicOS<\/title>/);
  assert.match(before.invitation, /<title>Start your group's copy — CivicOS<\/title>/);
  assert.ok(before.invitation.includes('href="https://newgroup.believeinoakland.workers.dev/"'), "the address stays where it runs");
  for (const path of ["/", "/update"]) assert.ok(before[path].includes(`placeholder="${EXAMPLE_SLUG}"`), path);
  const places = jurisdictions.list().flatMap((p) => p.covers).flatMap((c) => c.toLowerCase().split(/\W+/)).filter((x) => x.length > 2);
  assert.ok(places.length > 0, "the held profiles name places to compare with");
  assert.deepEqual(EXAMPLE_SLUG.split("-").filter((w) => places.includes(w)), [], "the example is not a place");
  const named = seen(await run({ slug: "river-keepers" }));
  const upd = seen(await run({ slug: "river-keepers", mode: "update", pre: { "river-keepers": planeBase("river-keepers", "0.70.0") } }));
  for (const w of [named, upd]) {
    assert.match(w.raw, /CivicOS &middot; installer/);
    assert.match(w.raw, /For the group <b class="mono" id="group">river-keepers<\/b>/);
    assert.ok(w.raw.includes(PUBLISHER));
  }
  const { cookie } = await begin("river-keepers");
  const denied = seen(await callback("error=access_denied", cookie));
  assert.match(denied.raw, /CivicOS/);
  assert.match(denied.raw, /For the group <b class="mono" id="group">river-keepers<\/b>/);
  /* Over every page rendered anywhere in this suite (K262): no page names a third party. The publisher is said to run
     the installer without being named, and the only trace of its name is the installer's own address, which stays. */
  for (const page of [...PAGES, ...Object.values(before)]) {
    const rest = page.replace(/newgroup\.believeinoakland\.workers\.dev/g, "");
    assert.equal(/believe in oakland|oakland|biosmoke/i.test(rest), false, rest.match(/.{0,60}(oakland|biosmoke).{0,40}/i)?.[0]);
  }
});

test("R23 the install and invitation pages state the prerequisites the install enforces: Workers Paid and a payment method, and never that no card is needed or storage is optional", async () => {
  const home = await text("/");
  for (const [where, page] of [["install page", home], ["invitation page", INVITATION]]) {
    const words = page.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    assert.match(words, /Workers Paid plan/, where);
    assert.match(words, /\$5 a month/, where);
    assert.match(words, /payment method on the account/, where);
    assert.equal(/no card|card is needed|free Cloudflare account|stays free|optional extra|everything still works/i.test(words), false, where);
  }
  const free = seen(await run({ slug: "pre-free", plan: "free" }));
  assert.match(free.page.failed.p, /Workers Paid plan \(\$5\/month\), paid with a payment method on the account/);
  assert.ok(!/already has a payment method/.test(free.page.failed.p), "the plan refusal claims no card it has not seen");
});

test.todo("R24 an install never shares another copy's buckets and never overwrites its fleet workers in the same account (not yet met: MULTI-INSTANCE-ISOLATION, K102; the buckets and the members have fixed names)");

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
  assert.match(await why({ version: "1.2.4" }), /RELEASE\.json is "1\.2\.3" but bio-plane\/package\.json is 1\.2\.4/);
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
    assert.equal(w.planePuts[0].source === rel.src, verdict, sig);
    const embed = await checkSignedAsset({ manifest: rel.manifest, bytes: new TextEncoder().encode(rel.src), version: NEXT, signers: [SIGNER.line] });
    assert.equal(embed === null, verdict, `embed ${sig}`);
  }
  restoreSigners();
});

test.todo("R30 the slug grammar and the member binding names are instance-setup's, imported, never copied (not yet met: instance-setup is not extracted, T8 has no job for it; the installer copies GROUP_SLUG_RE, which legacy-store holds, and FLEET_BINDINGS, which legacy-index holds unexported)");

test("R31 no place is named in the installer's behaviour: no page it serves or streams names a place a held profile covers", async () => {
  const places = new Set(jurisdictions.list().flatMap((p) => p.covers).flatMap((c) => c.toLowerCase().split(/\W+/)).filter((x) => x.length > 2));
  assert.ok(places.size > 0);
  const pages = [...PAGES, await text("/"), await text("/update"), await text("/elsewhere"), INVITATION];
  assert.ok(pages.length > 40, "the pages this suite rendered");
  for (const page of pages) {
    const words = page.replace(/newgroup\.believeinoakland\.workers\.dev/g, "")
      .toLowerCase().split(/[^a-z]+/);
    assert.deepEqual(words.filter((w) => places.has(w)), [], page.slice(0, 120));
  }
});

test.todo("R32 until installs are isolated, an install into an account already holding a copy (either bucket, or a fleet worker) is refused before anything is created, saying one copy per account is supported for now (not yet met: K102)");
test.todo("R33 the install and the update read back the uploaded script's content and compare its hash with the release, naming a mismatch and claiming no success (not yet met: K102)");
