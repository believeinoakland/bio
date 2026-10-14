/* journey-check R5, R6: the live arm against a fake plane over HTTP (fake-plane.mjs). R5: it reaches the instance
   directly, signs in as the administrator and as a member, and fails unless `whoami` answers each as that role; each role
   walks every working screen, the administrator drawn the acts only an administrator is. R6: each working screen, at 1280
   and 390 px, is paired with the design mock's drawing of it, and fails on the five limits. The mock is drawn at the
   checkout's own commit, whose `layouts.html` is the registry's (the interface's ASSETS_COMMIT is the release's). */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { runLive, browser, directFetch } from "../../../src/journey-check/run.mjs";
import { FAIL } from "../../../src/journey-check/walker.mjs";
import { sweepScreens } from "../../../src/journey-check/screens.mjs";
import { developerWords, assetsCommit, designMock, WIDTHS } from "../../../src/journey-check/design.mjs";
import { fakePlane } from "./fake-plane.mjs";

const SRC = join(import.meta.dirname, "..", "..", "..", "src", "journey-check");
const COMMIT = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const ENV = { JOURNEY_ADMIN_HANDLE: "ada", JOURNEY_ADMIN_PASSWORD: "admin-password-x", JOURNEY_MEMBER_HANDLE: "mai", JOURNEY_MEMBER_PASSWORD: "member-password-x" };
const WORKING = sweepScreens().filter((s) => s.frame === "working" || s.frame === "dock");
const only = (...ids) => sweepScreens().filter((s) => ids.includes(s.id));
const kinds = (r) => r.walk.failures.map((f) => f.kind);

let dir;
before(() => { dir = mkdtempSync(join(tmpdir(), "jc-live-")); });
after(() => rmSync(dir, { recursive: true, force: true }));

async function walked(plane, opts = {}) {
  const fp = await fakePlane(plane);
  try { return await runLive({ base: fp.base, env: ENV, out: join(dir, String(Math.random()).slice(2)), commit: COMMIT, ...opts }); }
  finally { await fp.close(); }
}

/* the control of R5 and R6 at once: correct roles, a plane matching its design, every working screen */
let clean = null;
const cleanWalk = async () => (clean ||= await walked({ admins: { ada: true } }));

test("R5 control and R6 control: correct roles pass; each role walks every working screen, each paired with the design mock at 1280 and 390 px", { timeout: 900000 }, async () => {
  const r = await cleanWalk();
  assert.equal(r.ok, true, r.report);
  for (const role of ["administrator", "member"]) {
    const walkedScreens = r.walk.steps.filter((s) => s.journey === `as ${role}` && s.label.startsWith("screen ")).map((s) => s.label.slice(7));
    assert.deepEqual(walkedScreens, WORKING.map((s) => s.id), `the ${role} walked every working screen`);
    for (const s of WORKING) for (const w of WIDTHS) {
      const file = `pairs/${role}-${s.id}-${w}.png`;
      assert.ok(r.walk.pairs.includes(file), file);
      assert.ok(existsSync(join(r.walk.out, file)), file);
    }
  }
  assert.equal(r.walk.pairs.length, WORKING.length * WIDTHS.length * 2);
  assert.match(r.report, new RegExp(`${r.walk.pairs.length} pairs, LIVE beside DESIGN`), "the pairs are listed for BOB");
  for (const v of Object.values(ENV)) assert.equal(r.report.includes(v), false, "a credential printed");
});

test("R5: a member credential given as the administrator fails the walk: whoami answers it administer: false", { timeout: 300000 }, async () => {
  const r = await walked({ admins: { ada: true } }, { env: { ...ENV, JOURNEY_ADMIN_HANDLE: "mai" }, screens: only("members") });
  assert.equal(r.ok, false);
  assert.deepEqual(kinds(r), [FAIL.ROLE]);
  assert.match(r.walk.failures[0].detail, /administrator's credential signs in a session whoami answers with administer: false/);
  /* and an administrator given as the member fails as well */
  const swapped = await walked({ admins: { ada: true, mai: true } }, { screens: only("members") });
  assert.deepEqual(kinds(swapped), [FAIL.ROLE]);
  assert.match(swapped.walk.failures[0].detail, /member's credential .* administer: true/);
});

test("R5: an administrator drawn no act the member is not drawn fails the walk (its walk did not administer); control: the clean walk's administrator is drawn memberadd on Members, the member is not", { timeout: 300000 }, async () => {
  const r = await walked({ admins: { ada: true }, adminActs: false }, { screens: only("members", "queue") });
  assert.deepEqual(kinds(r), [FAIL.ROLE]);
  assert.match(r.walk.failures[0].detail, /did not administer/);
  assert.equal((await cleanWalk()).ok, true);
});

test("R5: it reaches the instance directly: an environment proxy sees none of the walk's requests, Node's or Chromium's; control: Node's own fetch and a Chromium launched without it go through that proxy", { timeout: 300000 }, async () => {
  const hits = [];
  const proxy = createServer((req, res) => { hits.push(req.url); res.writeHead(502); res.end(); });
  await new Promise((ok) => proxy.listen(0, "127.0.0.1", ok));
  const fp = await fakePlane({ admins: { ada: true } });
  try {
    const P = `http://127.0.0.1:${proxy.address().port}`;
    /* a host that is not a loopback literal, so Chromium would send it to a proxy; the browser maps it to the fake plane */
    const host = `grp.test:${new URL(fp.base).port}`;
    const child = (direct) => new Promise((done) => {
      const code = `const { runLive, browser, directFetch } = await import(${JSON.stringify(pathToFileURL(join(SRC, "run.mjs")).href)});
const rule = ["--host-resolver-rules=MAP grp.test 127.0.0.1"];
const r = await runLive({ base: "http://${host}", env: ${JSON.stringify(ENV)}, out: ${JSON.stringify(join(dir, "proxy-" + direct))},
  commit: ${JSON.stringify(COMMIT)}, screens: [{ id: "members", frame: "working" }],
  fetchOf: (q) => directFetch(new Request(q.url.replace("grp.test", "127.0.0.1"), q)),
  launch: (o) => browser(${direct} ? { ...o, args: rule } : { args: rule }) });
const viaFetch = await fetch(${JSON.stringify(fp.base)} + "/api/?op=bootstrap").then((x) => x.status, () => "refused");
const viaDirect = await directFetch(new Request(${JSON.stringify(fp.base)} + "/api/?op=bootstrap")).then((x) => x.status);
console.log(JSON.stringify({ ok: r.ok, kinds: r.walk.failures.map((f) => f.kind), viaFetch, viaDirect }));`;
      const c = spawn(process.execPath, ["--input-type=module", "-e", code], { stdio: ["ignore", "pipe", "pipe"],
        env: { ...process.env, NODE_USE_ENV_PROXY: "1", HTTP_PROXY: P, http_proxy: P, HTTPS_PROXY: P, https_proxy: P, NO_PROXY: "", no_proxy: "" } });
      let out = "", err = "";
      c.stdout.on("data", (d) => (out += d)); c.stderr.on("data", (d) => (err += d));
      c.on("exit", () => { try { done(JSON.parse(out.trim().split("\n").at(-1))); } catch { done({ err }); } });
    });
    const direct = await child(true);
    const directHits = hits.splice(0);
    assert.equal(direct.ok, true, JSON.stringify(direct));
    assert.equal(direct.viaDirect, 200);
    /* control: Node's own fetch follows the environment's proxy */
    assert.deepEqual(directHits, [`${fp.base}/api/?op=bootstrap`], "only the control's own fetch reached the proxy");
    const proxied = await child(false);
    assert.equal(proxied.ok, false, "a Chromium launched without the direct arguments reached the instance through the proxy");
    assert.ok(hits.some((h) => h.startsWith(`http://${host}/`)), JSON.stringify(hits));
  } finally { await fp.close(); proxy.close(); }
});

test("R6: a fixture page that overflows fails, and so does each other limit, on its own screen and width; control: the same plane without the flaw passes (the clean walk)", { timeout: 300000 }, async () => {
  const flaws = { members: "wide", queue: "tabs", home: "class", account: "band", capture: "words" };
  const r = await walked({ admins: { ada: true }, flaws }, { screens: only(...Object.keys(flaws)) });
  const at = (kind) => [...new Set(r.walk.failures.filter((f) => f.kind === kind).map((f) => f.detail.replace(/: .*/, "")))].sort();
  assert.deepEqual(at(FAIL.WIDER), ["members at 1280px", "members at 390px"]);
  assert.deepEqual(at(FAIL.TABS), ["queue at 390px"], "tabs not at the viewport's foot, judged at 390 px only");
  assert.deepEqual(at(FAIL.CLASS), ["home at 1280px", "home at 390px"]);
  assert.deepEqual(at(FAIL.BAND), ["account at 1280px", "account at 390px"]);
  assert.deepEqual(at(FAIL.WORDS), ["capture at 1280px", "capture at 390px"]);
  assert.match(r.walk.failures.find((f) => f.kind === FAIL.WORDS).detail, /a refusal code: NO_CALC/);
  assert.match(r.walk.failures.find((f) => f.kind === FAIL.CLASS).detail, /p\.cs-unstyled: no loaded stylesheet defines the class/);
  assert.equal(r.walk.failures.length, 2 * (2 + 1 + 2 + 2 + 2), r.report);
  assert.equal((await cleanWalk()).ok, true);
});

test("R6: a working screen the design mock does not draw fails; control: one it draws is paired", { timeout: 300000 }, async () => {
  const r = await walked({ admins: { ada: true } }, { screens: [{ id: "no-such-screen", frame: "working" }, ...only("members")] });
  const design = r.walk.failures.filter((f) => f.kind === FAIL.DESIGN).map((f) => f.detail);
  assert.ok(design.length >= 1 && design.every((d) => /^no-such-screen: the design mock at [0-9a-f]+ draws no such screen$/.test(d)), r.report);
  assert.ok(r.walk.pairs.includes("pairs/administrator-members-390.png"));
});

test("R6: each pair is one image, LIVE on the left and DESIGN on the right, the mock read from git at its commit", { timeout: 120000 }, async () => {
  const r = await cleanWalk();
  const png = readFileSync(join(r.walk.out, "pairs/administrator-members-1280.png"));
  const width = png.readUInt32BE(16);
  assert.ok(width > 1280 + 1180, `a pair holds both drawings side by side (${width}px)`);
  /* the mock at a commit is that commit's layouts.html, whatever the working copy holds */
  const b = await browser();
  try {
    const m = await designMock(b, { dir: join(dir, "mock"), commit: COMMIT });
    assert.equal(m.commit, COMMIT);
    assert.ok(readFileSync(join(dir, "mock", `layouts-${COMMIT}.html`)).equals(execFileSync("git", ["show", `${COMMIT}:docs/development/ux-substrate/layouts.html`], { maxBuffer: 64 << 20 })));
    assert.ok(await m.draw("members", 390));
    assert.equal(await m.draw("no-such-screen", 390), null);
    await m.close();
  } finally { await b.close(); }
  /* by default, the interface's ASSETS_COMMIT, a commit git holds */
  assert.match(assetsCommit(), /^[0-9a-f]{7,40}$/);
  assert.equal(execFileSync("git", ["cat-file", "-t", assetsCommit()], { encoding: "utf8" }).trim(), "commit");
});

test("R6: text a person must never read: a slug, a language tag, a record id, a refusal code; control: words, two-part compounds and addresses pass", () => {
  const found = (t, o) => developerWords(t, o).map((w) => `${w.what}: ${w.word}`);
  assert.deepEqual(found("Welcome to believe-in-oakland"), ["a slug: believe-in-oakland"]);
  assert.deepEqual(found("Group biosmoke7", { slugs: ["biosmoke7"] }), ["a slug: biosmoke7"]);
  assert.deepEqual(found("the key display_name"), ["a slug: display_name"]);
  assert.deepEqual(found("Language: en-US"), ["a language tag: en-US"]);
  assert.deepEqual(found("Spanish (es-419) or zh-Hant"), ["a language tag: es-419", "a language tag: zh-Hant"]);
  assert.deepEqual(found("by its record id PROJ-2026-0042"), ["a record id: PROJ-2026-0042"]);
  assert.deepEqual(found("ENT-2026-abcdefghij012345 was linked"), ["a record id: ENT-2026-abcdefghij012345"]);
  assert.deepEqual(found("Could not read this, because NO_CALC"), ["a refusal code: NO_CALC"]);
  /* control */
  assert.deepEqual(found("Sign in, kept signed in. A well-known step-by-step guide. Explain promptly. 0 TO DO. Page 3 of 7. Since 2026-10-14."), []);
  assert.deepEqual(found("Your address: https://believe-in-oakland.civic7.workers.dev/app, or mail ops-team-2@example.org", { slugs: ["believe-in-oakland"] }), []);
  assert.deepEqual(found("biosmoke7s is another word", { slugs: ["biosmoke7"] }), []);
});
