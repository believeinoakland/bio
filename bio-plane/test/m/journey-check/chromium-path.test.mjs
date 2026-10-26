/* journey-check R1: the Chromium the walk launches is the one `CHROMIUM` names; else the pinned build when it is on disk;
   else the environment's own Chromium when that exists, so a container never decides a result (K4787, K4847). */
import { test } from "node:test";
import assert from "node:assert/strict";
import { chromiumPath, FALLBACK_CHROMIUM, browser } from "../../../src/journey-check/run.mjs";

const PINNED = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const on = (...paths) => (p) => paths.includes(p);

test("R1: the launch's Chromium: CHROMIUM wins; the pinned build when present; else the fallback when it exists; else none", () => {
  assert.equal(chromiumPath({ env: { CHROMIUM: "/x/chrome" }, pinned: PINNED, exists: on() }), "/x/chrome", "CHROMIUM wins even when nothing exists");
  assert.equal(chromiumPath({ env: { CHROMIUM: "/x/chrome" }, pinned: PINNED, exists: on(PINNED, FALLBACK_CHROMIUM) }), "/x/chrome");
  assert.equal(chromiumPath({ env: {}, pinned: PINNED, exists: on(PINNED, FALLBACK_CHROMIUM) }), undefined, "the pinned build is used as pinned");
  assert.equal(chromiumPath({ env: {}, pinned: PINNED, exists: on(FALLBACK_CHROMIUM) }), FALLBACK_CHROMIUM, "pinned build absent: the fallback");
  assert.equal(chromiumPath({ env: {}, pinned: PINNED, exists: on() }), undefined, "neither on disk: today's behaviour");
  assert.equal(chromiumPath({ env: { CHROMIUM: "" }, pinned: PINNED, exists: on(FALLBACK_CHROMIUM) }), FALLBACK_CHROMIUM, "an empty CHROMIUM names none");
  assert.equal(FALLBACK_CHROMIUM, "/opt/pw-browsers/chromium");
});

test("R1: browser() launches in this container with CHROMIUM unset", async () => {
  const saved = process.env.CHROMIUM; delete process.env.CHROMIUM;
  try { const b = await browser(); assert.ok(b.isConnected()); await b.close(); }
  finally { if (saved !== undefined) process.env.CHROMIUM = saved; }
});
