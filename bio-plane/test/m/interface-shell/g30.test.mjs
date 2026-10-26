/* interface-shell R126 (fix round 6, G30; B-21; K4428): the front page is composed from work done once per release. `GET /` used to hash the whole
   script twice (control-plane's `page()` and `interfacePage`) and re-check every screen, 100 to 180 ms of synchronous CPU a request that contended
   with uploads and a walk's parallel reads. The real screens of the nine modules are composed through the module's entries the way control-plane's
   `page()` and `appScript` call them; the work is counted (`pageWork`), never timed: the Worker's clock is frozen during synchronous work (R-CLOCK).
   Each test was seen failing first. */
import "./register.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { interfacePage, interfaceScript, interfaceScriptHash, pageWork, scriptPath } from "../../../src/interface-shell/index.mjs";
import { HOME } from "./screens.fixture.mjs";

const MODS = ["screens-settings", "screens-intake", "screens-daily", "screens-inquiry", "screens-entry", "screens-wizards", "screens-investigate", "screens-publish", "screens-action"];
const REAL = []; let GUIDE = null;
for (const m of MODS) { const x = await import(`../../../src/${m}/index.mjs`); REAL.push(...x.SCREENS); if (x.GUIDE) GUIDE = x.GUIDE; }
/* control-plane's `appOptions(env)`: a fresh options object on every request, holding the same guide */
const options = (extra = {}) => ({ guide: GUIDE, version: "r6", ...extra });
const since = (before) => { const now = pageWork(); return { scripts: now.scripts - before.scripts, hashes: now.hashes - before.hashes, checks: now.checks - before.checks }; };
const sha256b64 = (text) => "sha256-" + createHash("sha256").update(text, "utf8").digest("base64");
/* what one `GET /` does in control-plane's door (`page()`): the hash for the page policy, then the page; and what one script fetch does */
const getFront = () => { const hash = interfaceScriptHash(REAL, options()); const html = interfacePage(REAL, options({ testInstance: true })); return { hash, html }; };
const getScript = () => interfaceScript(REAL, options());

test("R126 (G30) the script, its hash and the screen checks are done once for a release: twenty front pages and twenty script fetches add one script, one hash and one check", () => {
  const before = pageWork();
  const first = getFront();
  for (let i = 0; i < 19; i++) getFront();
  const bytes = getScript().length;
  for (let i = 0; i < 19; i++) getScript();
  assert.ok(bytes > 1_000_000, "the real screens' script, not a stand-in");
  assert.deepEqual(since(before), { scripts: 1, hashes: 1, checks: 1 }, "forty answers, one compose, one hash, one check");
  assert.match(first.html, new RegExp(`integrity="${first.hash.replace(/[+/]/g, "\\$&")}"`));
});

test("R126 (G30) control: the hash is the SHA-256 of the script's UTF-8 bytes, base64, as the page policy names it; the page's integrity is the same string", () => {
  const { hash, html } = getFront();
  assert.equal(hash, sha256b64(getScript()));
  assert.ok(html.includes(`integrity="${hash}"`));
  assert.ok(html.includes(`src="${scriptPath("r6")}"`));
});

test("R126 (G30) control: a hit hands back the very script a fresh compose made (kept, not rebuilt), and a different set of screens is another release: composed, checked and hashed again, with its own hash", () => {
  const before = pageWork();
  const a = interfaceScript(REAL, options());
  assert.equal(since(before).scripts, 0, "already composed");
  assert.equal(interfaceScript(REAL, options()), a);
  const other = [HOME];
  const hashA = interfaceScriptHash(REAL, options());
  const b = interfaceScript(other, {});
  const hashB = interfaceScriptHash(other, {});
  assert.notEqual(b, a);
  assert.notEqual(hashB, hashA);
  assert.equal(hashB, sha256b64(b));
  const mid = pageWork();
  assert.equal(interfaceScriptHash(other, {}), hashB);
  assert.equal(pageWork().hashes, mid.hashes, "the new release's hash is also kept");
  assert.equal(interfaceScriptHash(REAL, options()), hashA, "going back to the first set recomposes it to the same bytes, hash and all");
  assert.equal(interfaceScript(REAL, options()), a);
});

test("R126 (G30) control: a broken screen is refused on every ask, never served from a kept script, and leaves the kept release as it was", () => {
  const good = interfaceScript(REAL, options());
  const bad = [{ ...HOME, id: "nowhere" }];
  assert.throws(() => interfacePage(bad), /nowhere.*SCREEN_REGISTRY/);
  assert.throws(() => interfacePage(bad), /nowhere.*SCREEN_REGISTRY/, "a second ask is refused as the first");
  assert.throws(() => interfaceScriptHash(bad), /nowhere/);
  assert.equal(interfaceScript(REAL, options()), good);
  assert.throws(() => interfaceScript(REAL, { guide: { render: () => "", acts: [{ op: "notanop" }] } }), /notanop/, "a broken guide is refused too");
});
