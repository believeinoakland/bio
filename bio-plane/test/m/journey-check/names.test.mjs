/* journey-check R7 (N1072; K3265; DEC-230 (3)): signed in as the founder, no screen draws `admin` as a person's name or
   handle; DEC-230's own step for a founder with no handle is the one exception. The check is driven over fixture screens
   in a real browser through the sweep the walk runs; the walk itself is run in journey.test.mjs. */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { word } from "../../../src/setup-words/index.mjs";
import { Walk, FAIL, INTERFACE_MARK } from "../../../src/journey-check/walker.mjs";
import { sweepAsFounder } from "../../../src/journey-check/journeys.mjs";
import { adminAsName, ADMIN_WORDS } from "../../../src/journey-check/screens.mjs";
import { browser } from "../../../src/journey-check/run.mjs";

const COPY = "https://grp.test.workers.dev";
let B, dir;
before(async () => { B = await browser(); dir = mkdtempSync(join(tmpdir(), "jc-names-")); });
after(async () => { await B?.close(); rmSync(dir, { recursive: true, force: true }); });

/* a sweep as the founder over screens `screens` ({id: html}) */
async function swept(screens, { handle }) {
  const walk = new Walk({ out: join(dir, String(Math.random()).slice(2)), arm: "local" });
  walk.copyHost = new URL(COPY).host;
  const ctx = await B.newContext();
  await ctx.route("**/*", (r) => {
    const u = new URL(r.request().url());
    if (u.pathname === INTERFACE_MARK) return r.fulfill({ status: 200, contentType: "text/css", body: "main{}" });
    const id = u.pathname === "/app" ? "home" : u.pathname.slice(5);
    return r.fulfill({ status: 200, contentType: "text/html", body: `<!doctype html><html><head><link rel="stylesheet" href="${INTERFACE_MARK}"></head><body><main id="cs-main" data-screen="${id}">${screens[id]}</main></body></html>` });
  });
  const p = walk.watch(await ctx.newPage());
  await sweepAsFounder(walk, p, COPY, { handle, screens: Object.keys(screens).map((id) => ({ id })) });
  await ctx.close();
  return walk.failures.filter((f) => f.kind === FAIL.ADMIN_NAME);
}

test("R7: a screen drawing admin as a name or handle fails the sweep, with a handle held and with none; control: the founder's own handle, and administrator, pass", async () => {
  const screens = { projects: "<p>Owner: admin</p>", account: "<p>Your handle</p><p>admin</p>", members: "<p>rosa-l · administrator</p>", home: "<p>Owner: rosa-l</p>" };
  for (const handle of ["rosa-l", null]) {
    const f = await swept(screens, { handle });
    assert.deepEqual(f.map((x) => x.step).sort(), ["screen account", "screen projects"], JSON.stringify(f));
  }
});

test("R7: DEC-230's own words for a founder with no handle are the one exception, and only while she has none", async () => {
  const step = `<p>${word("founder.handle.says")}</p><p>${word("founder.handle.later.help")}</p>`;
  assert.deepEqual(await swept({ setup: step }, { handle: null }), []);
  /* control: the same words drawn to a founder who holds a handle fail; so does admin outside them */
  assert.equal((await swept({ setup: step }, { handle: "rosa-l" })).length, 1);
  assert.equal((await swept({ setup: step + "<p>Signed in as admin.</p>" }, { handle: null })).length, 1);
});

test("R7: what counts as admin drawn as a name: the word alone, lower case; not administrator, admin-led, an address or Admin opening a sentence", () => {
  assert.equal(adminAsName("Owner: admin · 1 busy").length, 1);
  assert.equal(adminAsName("Your handle is admin.").length, 1);
  assert.deepEqual(adminAsName("The administrator, admin-tools, https://x.test/admin/y, Admin settings"), []);
  assert.deepEqual(ADMIN_WORDS, ["founder.handle.says", "founder.handle.later.help"]);
});

test("R7 (K3380): what the walk cannot walk here it notes in its report, as a note and never a failure", () => {
  const walk = new Walk({ out: join(dir, "notes"), arm: "local" });
  walk.notes.push("R7 with no handle: not walkable here (the claim took a handle)");
  const text = walk.report();
  assert.match(text, /^note: R7 with no handle: not walkable here \(the claim took a handle\)$/m);
  assert.match(text, /0 failures/);
});
