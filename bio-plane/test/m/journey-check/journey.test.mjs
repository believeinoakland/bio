/* journey-check R1: the walk run by `npm run journey`, in its two arms. The local arm is walked end to end, from the
   installer over its fake Cloudflare account through the hand-over into a plane under Miniflare, journey 28 and journey 3,
   then every registry screen; the live arm signs in with credentials read from the environment, never printed. */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fakeAccount, AUTHORIZE, TOKEN, API } from "../../../src/journey-check/account.mjs";
import { runLocal, runLive } from "../../../src/journey-check/run.mjs";
import { FAIL } from "../../../src/journey-check/walker.mjs";

const DIR = join(import.meta.dirname, "..", "..", "..", "src", "journey-check");

/* that `--live <address>` selects the live arm is run, not read, in entry.test.mjs (R4's control) */
test("R1: `npm run journey` runs the walk from its directory, on Playwright (Chromium) pinned exactly, with its lock", () => {
  const pkg = JSON.parse(readFileSync(join(DIR, "package.json"), "utf8"));
  assert.equal(pkg.scripts.journey, "node journey.mjs");
  const v = pkg.devDependencies["playwright-core"];
  assert.match(v, /^\d+\.\d+\.\d+$/, "an exact version");
  const lock = JSON.parse(readFileSync(join(DIR, "package-lock.json"), "utf8"));
  assert.equal(lock.packages["node_modules/playwright-core"].version, v);
});

test("R1 (a): the fake Cloudflare account grants a token only for the PKCE verifier its consent was asked with, keeps bindings by type across uploads, and names every call it does not answer", async () => {
  const uploads = [];
  const acct = fakeAccount({ onScript: async (name, s) => uploads.push([name, s.bindings.map((b) => b.name).sort()]) });
  const verifier = "v".repeat(43);
  const challenge = Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))).toString("base64url");
  const consent = await (await acct.handle(new Request(`${AUTHORIZE}?redirect_uri=${encodeURIComponent("https://i.test/callback")}&state=s1&code_challenge=${challenge}&code_challenge_method=S256&scope=a+b`))).text();
  const back = new URL(/href="([^"]+)"/.exec(consent)[1].replace(/&amp;/g, "&"));
  assert.equal(back.searchParams.get("state"), "s1");
  const exchange = (v) => acct.handle(new Request(TOKEN, { method: "POST", body: new URLSearchParams({ code: back.searchParams.get("code"), code_verifier: v, redirect_uri: "https://i.test/callback" }) }));
  /* control: a wrong verifier is refused, and the code stays spent */
  assert.equal((await exchange("w".repeat(43))).status, 400);
  const consent2 = await (await acct.handle(new Request(`${AUTHORIZE}?redirect_uri=${encodeURIComponent("https://i.test/callback")}&state=s2&code_challenge=${challenge}&code_challenge_method=S256`))).text();
  const back2 = new URL(/href="([^"]+)"/.exec(consent2)[1].replace(/&amp;/g, "&"));
  const tok = await (await acct.handle(new Request(TOKEN, { method: "POST", body: new URLSearchParams({ code: back2.searchParams.get("code"), code_verifier: verifier, redirect_uri: "https://i.test/callback" }) }))).json();
  assert.ok(tok.access_token);
  const auth = { authorization: "Bearer " + tok.access_token };
  const put = (meta) => { const fd = new FormData(); fd.append("metadata", new Blob([JSON.stringify(meta)])); fd.append("index.mjs", new Blob(["export default {}"]), "index.mjs");
    return acct.handle(new Request(`${API}/accounts/${acct.account}/workers/scripts/grp`, { method: "PUT", headers: auth, body: fd })); };
  assert.equal((await put({ bindings: [{ type: "secret_text", name: "ADMIN_TOKEN", text: "x" }, { type: "plain_text", name: "VERSION", text: "1" }] })).status, 200);
  assert.equal((await put({ bindings: [{ type: "plain_text", name: "VERSION", text: "2" }], keep_bindings: ["secret_text"] })).status, 200);
  assert.deepEqual(uploads.at(-1), ["grp", ["ADMIN_TOKEN", "VERSION"]], "the secret kept, the plain value restated");
  assert.equal((await acct.handle(new Request(`${API}/accounts/${acct.account}/workers/scripts/grp`, { headers: { authorization: "Bearer nope" } }))).status, 403);
  assert.equal((await acct.handle(new Request(`${API}/accounts/${acct.account}/queues`, { headers: auth }))).status, 599);
  assert.deepEqual(acct.unanswered, [`GET ${API}/accounts/${acct.account}/queues`]);
});

/* The local arm walked once, end to end, shared by the tests that name what it walks (R1 (a), R7, R9–R11, R13, R14). It is
   the tranche's acceptance test: it passes only when every module it walks through does what its steps assert. */
let localRun = null;
const local = () => (localRun ||= (async () => {
  const out = mkdtempSync(join(tmpdir(), "jc-local-"));
  const r = await runLocal({ out });
  return { r, out, shots: readdirSync(out).filter((f) => f.endsWith(".png")) };
})());
after(async () => { if (localRun) rmSync((await localRun).out, { recursive: true, force: true }); });
const stepsOf = (r, journey) => r.walk.steps.filter((s) => s.journey === journey);
const numbered = (r, journey) => stepsOf(r, journey).filter((s) => /^\d+ · /.test(s.label));

test("R1 (a): the local arm, with no account: the installer over its fake account, the hand-over into a plane under Miniflare, journey 28, journey 3, the journeys to a conclusion and every registry screen drawn; each step screenshotted", { timeout: 2400000 }, async () => {
  const { r, shots } = await local();
  assert.equal(r.ok, true, r.report);
  assert.equal(shots.length, r.walk.steps.length);
  for (const j of ["journey 28", "journey 3", "R9 as administrator", "R10 as member", "R7 as the founder, her handle held"]) assert.ok(stepsOf(r, j).length, j);
});

test("R9: the local arm walks the journey as administrator, steps 1 to 12, each through the screens' own controls, each holding", { timeout: 2400000 }, async () => {
  const { r } = await local();
  const steps = [...numbered(r, "journey 28"), ...numbered(r, "R9 as administrator")];
  const n = [...new Set(steps.map((s) => Number(s.label.split(" · ")[0])))];
  assert.deepEqual(n, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], r.report);
  assert.deepEqual(steps.filter((s) => !s.ok).map((s) => s.label), [], r.report);
});

test("R10: the local arm walks the same journey as a member, on her own subscription: her connection, her run, projectai, planask and Ask", { timeout: 2400000 }, async () => {
  const { r } = await local();
  const steps = stepsOf(r, "R10 as member");
  for (const want of [/connects her own Claude subscription/, /projectai/, /planask/, /^9 · run the assistant/, /^10 · /, /^11 · Ask/])
    assert.ok(steps.some((s) => want.test(s.label) && s.ok), `${want}: ${r.report}`);
  assert.deepEqual(steps.filter((s) => !s.ok).map((s) => s.label), [], r.report);
});

test("R11: the local arm binds agent-worker, the runner's stand-in with the fake model, a stub city site and the test-instance mark: it walks R9", { timeout: 2400000 }, async () => {
  const { r } = await local();
  assert.ok(numbered(r, "R9 as administrator").some((s) => s.label.startsWith("9 · ") && s.ok), r.report);
  assert.ok(numbered(r, "R9 as administrator").some((s) => s.label.startsWith("5 · capture by address") && s.ok), r.report);
});

test("R11 control: with no fake model bound, step 9 fails by name", { timeout: 2400000 }, async () => {
  const out = mkdtempSync(join(tmpdir(), "jc-nomodel-"));
  try {
    const r = await runLocal({ out, model: false, parts: [] });
    const nine = r.walk.steps.find((s) => s.label.startsWith("9 · run the assistant"));
    assert.ok(nine && !nine.ok, r.report);
    assert.ok(r.walk.failures.some((f) => f.step === nine.label), r.report);
    /* the steps before it held: the sign-in answered without a model */
    assert.deepEqual(numbered(r, "R9 as administrator").filter((s) => Number(s.label.split(" · ")[0]) < 9 && !s.ok).map((s) => s.label), [], r.report);
  } finally { rmSync(out, { recursive: true, force: true }); }
});

test("R7: the walk as stated: signed in as the founder, no screen draws admin as a person's name or handle", { timeout: 2400000 }, async () => {
  const { r } = await local();
  assert.ok(r.walk.steps.some((s) => s.journey.startsWith("R7 as the founder")));
  assert.deepEqual(r.walk.failures.filter((f) => f.kind === FAIL.ADMIN_NAME).map((f) => f.detail), []);
});

test("R13: the local arm pairs each step of design journey 29 with the mock's drawing of it", { timeout: 2400000 }, async () => {
  const { r } = await local();
  assert.ok(r.walk.pairs.filter((p) => /journey-29-step-/.test(p)).length >= 14, r.report);
  assert.deepEqual(r.walk.failures.filter((f) => f.kind === FAIL.DESIGN).map((f) => f.detail), []);
});

test("R1 (b): the live arm reads the administrator's and a member's credentials from the environment and never prints them; control: without them it refuses before any request", async () => {
  const seen = [];
  const server = createServer((req, res) => {
    seen.push(`${req.method} ${req.url}`);
    if (req.url.startsWith("/api/?op=bootstrap")) { res.setHeader("content-type", "application/json"); return res.end(JSON.stringify({ ok: true, test_instance: true })); }
    res.setHeader("content-type", "text/html");
    res.end(`<!doctype html><html><head><link rel="stylesheet" href="/app/assets/civicsmith.css"></head><body><main id="cs-main"><label>Handle <input name="h"></label><label>Password <input type="password" name="p"></label></main></body></html>`);
  });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${server.address().port}`;
  const out = mkdtempSync(join(tmpdir(), "jc-live-"));
  try {
    const none = await runLive({ base, env: {}, out });
    assert.match(none.walk.failures[0].detail, /NO_CREDENTIALS/);
    assert.deepEqual(seen, [], "nothing asked of the instance without credentials");
    const env = { JOURNEY_ADMIN_HANDLE: "ada-admin", JOURNEY_ADMIN_PASSWORD: "admin-secret-password", JOURNEY_MEMBER_HANDLE: "mai-k", JOURNEY_MEMBER_PASSWORD: "member-secret-password" };
    const r = await runLive({ base, env, out });
    assert.ok(seen.includes("GET /api/?op=bootstrap"), "the guard read bootstrap first");
    assert.equal(seen[0], "GET /api/?op=bootstrap");
    /* this stand-in draws no sign-in control, so the walk fails at it, and says so without the credentials */
    assert.equal(r.ok, false);
    assert.ok(r.walk.failures.some((f) => f.kind === FAIL.STEP && /control login|no field|screen/.test(f.detail)), r.report);
    const printed = r.report + readFileSync(join(out, "report.json"), "utf8");
    for (const v of Object.values(env)) if (v.includes("secret")) assert.equal(printed.includes(v), false, "a password printed");
  } finally { server.close(); rmSync(out, { recursive: true, force: true }); }
});

/* A child node process running `code` (an ES module, `RUN` and `LOCAL` the arm's modules); it must end by itself, with no
   open handles, within `deadline` ms. Answers whether it did, its exit code and what it printed. */
const RUN = pathToFileURL(join(DIR, "run.mjs")).href, LOCAL = pathToFileURL(join(DIR, "local.mjs")).href;
function ends(code, deadline) {
  return new Promise((done) => {
    const child = spawn(process.execPath, ["--input-type=module", "-e", `const RUN = ${JSON.stringify(RUN)}, LOCAL = ${JSON.stringify(LOCAL)};\n${code}`],
      { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    const t = setTimeout(() => child.kill("SIGKILL"), deadline);
    child.on("exit", (status, signal) => { clearTimeout(t); done({ ended: signal === null, status, out, err }); });
  });
}
const lastJson = (s) => JSON.parse(s.trim().split("\n").at(-1));
/* the local arm forced to fail as `opts` say; prints what it answered and the handles left once it returned */
const forced = (opts) => `const { runLocal } = await import(RUN);
const { localWorld } = await import(LOCAL);
const out = (await import("node:fs")).mkdtempSync((await import("node:path")).join((await import("node:os")).tmpdir(), "jc-dispose-"));
const r = await runLocal({ out, ${opts} });
(await import("node:fs")).rmSync(out, { recursive: true, force: true });
console.log(JSON.stringify({ ok: r.ok, failures: r.walk.failures, handles: process.getActiveResourcesInfo() }));`;
const DEADLINE = 60000;

test("R1 (a): every way the local arm can stop closes its world, browser and servers; control: a world left open keeps its process alive past the deadline", { timeout: 600000 }, async () => {
  /* control: the check sees open handles. A world started and never closed (its Miniflare instances running) does not end. */
  const leak = await ends(`const { localWorld } = await import(LOCAL); await localWorld(); console.log("started");`, DEADLINE);
  assert.equal(leak.ended, false, "a world left open was not caught: " + leak.err);
  assert.match(leak.out, /started/);

  /* playwright-core unloadable: the world is started, the browser cannot be, the arm says so and closes the world */
  const noPlaywright = await ends(forced(`launch: async () => { throw new Error("playwright-core cannot be loaded (forced)"); }`), DEADLINE);
  assert.equal(noPlaywright.ended, true, "the arm left handles open when the browser could not start: " + noPlaywright.err);
  const a = lastJson(noPlaywright.out);
  assert.equal(a.ok, false);
  assert.ok(a.failures.some((f) => f.kind === FAIL.STEP && /playwright-core cannot be loaded \(forced\)/.test(f.detail)), JSON.stringify(a.failures));

  /* a world that cannot start: nothing is left open, the arm says why */
  const noWorld = await ends(forced(`world: async () => { throw new Error("the world cannot start (forced)"); }`), DEADLINE);
  assert.equal(noWorld.ended, true, noWorld.err);
  assert.ok(lastJson(noWorld.out).failures.some((f) => /the world cannot start \(forced\)/.test(f.detail)));

  /* a walker step that throws: the world refuses every request of the browser, so the installer's first page fails;
     the browser, its pages and the world all close */
  const stepThrows = await ends(forced(`world: async () => { const w = await localWorld();
    return { ...w, route: (ctx, onForeign) => ctx.route("**/*", (r) => { onForeign(r.request().url()); return r.abort("blockedbyclient"); }) }; }`), DEADLINE);
  assert.equal(stepThrows.ended, true, "the arm left handles open after a step threw: " + stepThrows.err);
  const c = lastJson(stepThrows.out);
  assert.equal(c.ok, false);
  assert.ok(c.failures.some((f) => f.kind === FAIL.STEP && f.step === "install: the installer's first page"), JSON.stringify(c.failures));
});
