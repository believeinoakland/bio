/* control-plane R126 (T51, fix round 6, G30; B-21; K4428, K4609; `interface-shell` R126): the front page names its own work.
   `page()` writes one structured log line per front page, `{event: "control-plane.page", ...pageWork(), ms}`: counts, not CPU
   times (R-CLOCK, a Worker's clock does not see synchronous work). Through the real `GET /` door, the first draw in this process
   (this file is its own process) is the one that composes the script, takes its hash and runs the checks. */
import "../../sandbox.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { call, world } from "./harness.mjs";

const LINE = "control-plane.page";

/* the lines `console.log` receives while `run` goes, parsed; anything else printed is left to the real console */
async function logged(run) {
  const real = console.log, lines = [];
  console.log = (...a) => {
    const s = a.length === 1 && typeof a[0] === "string" ? a[0] : null;
    let o = null;
    try { o = s ? JSON.parse(s) : a.length === 1 && a[0] && typeof a[0] === "object" ? a[0] : null; } catch { o = null; }
    if (o && o.event === LINE) lines.push(o); else real(...a);
  };
  try { await run(); } finally { console.log = real; }
  return lines;
}

test("R126 (G30): twenty front pages through `GET /` log twenty `control-plane.page` lines whose counts of scripts composed and hashes taken stay at one after the first; control: `/version`, the favicon and an unknown op log no page line", async () => {
  const { env } = world();
  const lines = await logged(async () => {
    for (let i = 0; i < 20; i++) {
      const r = await call(env, { path: "/" });
      assert.equal(r.status, 200, `page ${i}`);
      assert.match(r.headers.get("content-type"), /^text\/html/);
    }
  });
  assert.equal(lines.length, 20, "one line per front page");
  for (const [i, l] of lines.entries()) {
    for (const k of ["scripts", "hashes", "checks"]) assert.ok(Number.isInteger(l[k]) && l[k] >= 0, `line ${i}: ${k} is a count`);
    assert.ok(Number.isFinite(l.ms) && l.ms >= 0, `line ${i}: ms`);
    assert.equal(l.scripts, 1, `line ${i}: the script is composed once for the release`);
    assert.equal(l.hashes, 1, `line ${i}: its hash is taken once for the release`);
    assert.equal(l.checks, 1, `line ${i}: the screens and guide are checked once for the release`);
  }
  /* controls: a route that is not a page draws no line */
  const others = await logged(async () => {
    await call(env, { path: "/version" });
    await call(env, { path: "/favicon.ico" });
    await call(env, { path: "/api/no-such-op" });
  });
  assert.equal(others.length, 0, "only a page logs a page line");
});
