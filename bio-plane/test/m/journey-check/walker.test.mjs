/* journey-check R2: the walk's failures, each driven at the walker's interface in a real browser over a small world of
   pages (the copy's address, a foreign address, legacy-ui's), each with a control that holds. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { Walk, FAIL, INTERFACE_MARK, SETUP_PAGE_TITLE, documentKind } from "../../../src/journey-check/walker.mjs";
import { drawnState, sweepScreens, registryScreens, EXCEPTED } from "../../../src/journey-check/screens.mjs";
import { browser } from "../../../src/journey-check/run.mjs";

const COPY = "https://grp.test.workers.dev";
const page = (body, title = "Civicsmith") => `<!doctype html><html><head><title>${title}</title><link rel="stylesheet" href="${INTERFACE_MARK}"></head><body>${body}</body></html>`;
const SECRET = "the-member-password-123";
const WORLD = {
  "/app": page(`<main id="cs-main"><p>home</p><script>fetch("/api/?op=queue")</script></main>`),
  "/app/refused": page(`<main id="cs-main"><script>fetch("/api/?op=enroll")</script></main>`),
  "/app/missing": page(`<main id="cs-main"><script>fetch("/gone.png")</script></main>`),
  "/app/throws": page(`<main id="cs-main"><script>null.f()</script></main>`),
  "/app/foreign": page(`<main id="cs-main"><img src="https://elsewhere.example/x.png"></main>`),
  "/app/legacy": page(`<main id="cs-main"><img src="https://civicos.grp.workers.dev/app.html"></main>`),
  "/": `<!doctype html><html><head><title>${SETUP_PAGE_TITLE}</title></head><body>setup</body></html>`,
  "/other": `<!doctype html><html><head><title>x</title></head><body>an old page</body></html>`,
};
const API = { queue: { ok: true, items: [] }, enroll: { ok: false, code: "HANDLE_TAKEN" } };

let B, dir;
before(async () => { B = await browser(); dir = mkdtempSync(join(tmpdir(), "jc-walker-")); });
after(async () => { await B.close(); rmSync(dir, { recursive: true, force: true }); });

async function walked(path, { expect = [] } = {}) {
  const walk = new Walk({ out: join(dir, String(Math.random()).slice(2)), arm: "local" });
  walk.copyHost = new URL(COPY).host;
  walk.keepSecret(SECRET);
  const ctx = await B.newContext();
  await ctx.route("**/*", async (r) => {
    const u = new URL(r.request().url());
    if (u.origin !== COPY) { walk.foreign(u.href); return r.abort("blockedbyclient"); }
    if (u.pathname === "/api/") { const j = API[u.searchParams.get("op")]; return r.fulfill({ status: j.ok ? 200 : 409, contentType: "application/json", body: JSON.stringify(j) }); }
    if (u.pathname === INTERFACE_MARK) return r.fulfill({ status: 200, contentType: "text/css", body: "main{}" });
    if (WORLD[u.pathname]) return r.fulfill({ status: 200, contentType: "text/html", body: WORLD[u.pathname] });
    return r.fulfill({ status: 404, body: "not found" });
  });
  const p = walk.watch(await ctx.newPage());
  await walk.step(p, `open ${path} (${SECRET})`, async (pg) => { await pg.goto(COPY + path); }, { expect }).catch(() => {});
  await ctx.close();
  return walk;
}
const kinds = (w) => w.failures.map((f) => f.kind);

test("R2: a clean step passes and is screenshotted into the output directory; its report is written beside it", async () => {
  const w = await walked("/app");
  assert.deepEqual(w.failures, []);
  assert.equal(w.steps.length, 1);
  assert.ok(w.steps[0].ok);
  assert.ok(existsSync(join(w.out, w.steps[0].screenshot)), "the screenshot is on disk");
  w.report();
  assert.ok(existsSync(join(w.out, "report.txt")));
});

test("R2: an `ok: false` the step does not expect fails the walk; control: the same refusal, expected by the step, does not", async () => {
  const w = await walked("/app/refused");
  assert.deepEqual(kinds(w), [FAIL.REFUSED]);
  assert.match(w.failures[0].detail, /op=enroll answered ok: false \(HANDLE_TAKEN, HTTP 409\)/);
  assert.deepEqual((await walked("/app/refused", { expect: ["HANDLE_TAKEN"] })).failures, []);
});

test("R2: any 4xx or 5xx fails the walk; control: a status the step expects does not", async () => {
  const w = await walked("/app/missing");
  assert.deepEqual(kinds(w), [FAIL.HTTP]);
  assert.match(w.failures[0].detail, /gone\.png answered HTTP 404/);
  assert.deepEqual((await walked("/app/missing", { expect: [404] })).failures, []);
});

test("R2: a page whose script throws fails the walk", async () => {
  const w = await walked("/app/throws");
  assert.deepEqual(kinds(w), [FAIL.SCRIPT]);
});

test("R2: the setup page or any other document that is not the interface, reached on the copy, fails as an old page; legacy-ui's address fails as one; any other address outside the walk fails", async () => {
  const setup = await walked("/");
  assert.deepEqual(kinds(setup), [FAIL.OLD_PAGE]);
  assert.match(setup.failures[0].detail, /is the setup page/);
  const other = await walked("/other");
  assert.deepEqual(kinds(other), [FAIL.OLD_PAGE]);
  assert.match(other.failures[0].detail, /is not the interface page/);
  const legacy = await walked("/app/legacy");
  assert.deepEqual(kinds(legacy), [FAIL.OLD_PAGE]);
  assert.match(legacy.failures[0].detail, /legacy-ui/);
  const foreign = await walked("/app/foreign");
  assert.deepEqual(kinds(foreign), [FAIL.ADDRESS]);
  /* control: the interface page itself is no old page */
  assert.equal(documentKind(WORLD["/app"]), "interface");
  assert.equal(documentKind(WORLD["/"]), "setup-page");
});

test("R2: no failure, step label or report carries a secret the walk holds", async () => {
  const w = await walked("/app/refused");
  const text = w.report() + readFileSync(join(w.out, "report.json"), "utf8");
  assert.equal(text.includes(SECRET), false);
  assert.ok(text.includes("[secret]"), "control: the label's secret is replaced, not dropped");
});

test("R2: the output directory is generated and never committed (ignored by git)", () => {
  const root = join(import.meta.dirname, "..", "..", "..", "..");
  const ignored = execFileSync("git", ["-C", root, "check-ignore", "bio-plane/src/journey-check/out/local/01-x.png"], { encoding: "utf8" });
  assert.match(ignored, /out\/local\/01-x\.png/);
});

/* ---- a registry screen not drawn ---- */

const DRAWS = {
  drawn: `<main id="cs-main"><nav class="cs-crumbs"><ol><li><a href="/app">Home</a></li><li><span aria-current="page">Members</span></li></ol></nav><h1 class="t-title">Members</h1><table><tr><td>ann</td></tr></table></main>`,
  unknown: `<main id="cs-main"><nav class="cs-crumbs"><ol><li><span aria-current="page">Nothing here</span></li></ol></nav><p class="cs-state" data-state="empty">Nothing here</p></main>`,
  later: `<main id="cs-main"><nav class="cs-crumbs"><ol><li><span aria-current="page">People</span></li></ol></nav><h1 class="t-title">People</h1><p class="cs-state" data-state="empty">People comes later.</p></main>`,
  failed: `<main id="cs-main"><nav class="cs-crumbs"><ol><li>x</li></ol></nav><p class="cs-state" data-state="failed">Failed</p></main>`,
  blank: `<main id="cs-main"></main>`,
  marked: `<main id="cs-main" data-screen="members"><p>x</p></main>`,
};
async function drawn(html, id) {
  const ctx = await B.newContext();
  const p = await ctx.newPage();
  await p.setContent(`<!doctype html><html><head><link rel="stylesheet" href="${INTERFACE_MARK}"></head><body>${html}</body></html>`);
  const st = await drawnState(p, id);
  await ctx.close();
  return st;
}

test("R2: a registry screen the shell does not draw fails: its \"Nothing here\" for a screen it does not hold, a place that comes later, a failed draw, a blank page; control: a drawn screen holds", async () => {
  assert.equal((await drawn(DRAWS.drawn, "members")).drawn, true);
  for (const k of ["unknown", "later", "failed", "blank"]) assert.equal((await drawn(DRAWS[k], "members")).drawn, false, k);
  /* the frame's own mark decides when it is drawn */
  assert.equal((await drawn(DRAWS.marked, "members")).drawn, true);
  assert.equal((await drawn(DRAWS.marked, "account")).drawn, false);
  /* a page that is not the interface draws no screen, whatever it holds */
  const ctx = await B.newContext();
  const p = await ctx.newPage();
  await p.setContent(`<!doctype html><html><body>${DRAWS.drawn}</body></html>`);
  assert.equal((await drawnState(p, "members")).drawn, false);
  await ctx.close();
});

test("R2 (K3137): the sweep opens every registry screen but `site` and the `dash-*` treatments (and the installer's own two pages, walked in the journey)", () => {
  const all = registryScreens().map((s) => s.id);
  const swept = sweepScreens().map((s) => s.id);
  assert.deepEqual(EXCEPTED, ["site", "dash-home", "dash-action", "dash-project"]);
  assert.deepEqual(all.filter((id) => !swept.includes(id)).sort(), ["dash-action", "dash-home", "dash-project", "install", "site", "update"]);
  for (const id of ["front", "setup", "join", "home", "members", "account", "capture", "doorbell", "published"]) assert.ok(swept.includes(id), id);
});
