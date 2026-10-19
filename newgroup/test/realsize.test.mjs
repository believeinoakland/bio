/* installer R33 at the release's real size (K3441; the 0.85.0 plane is 21.4 MB; a Worker has 128 MB).
 *
 * Two things, both at the module's interface and both failing on the installer as it was before K3441:
 *  1. The read-back's hash. The install and the update read the uploaded script back and hash the module part of the answer
 *     over its bytes as downloaded. A ~21 MB multipart answer whose part holds bytes 0x80-0x9F (UTF-8 continuation bytes, as a
 *     module with any accented or typographic character has) hashes equal to the release, whether the answer is multipart or
 *     the module itself; a different byte is still named. (Driven through the fixture's stateful account, as the other R33
 *     arms are.)
 *  2. The memory bound. The installer's built bundle runs an install and an update, against the built-in release and against
 *     a 21 MB release served by the repository, in a child Node process that stands for a Worker (`realsize-child.mjs`): the
 *     live memory, with the bundle's own 21 MB release already in it, never reaches 128 MB (nor does the act's growth of the
 *     process's resident high-water mark), and every act ends as it should.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { bundleOptions } from "../scripts/build.mjs";
import { RELEASE_VERSION } from "../src/release.mjs";
import { word } from "../src/words.mjs";
import { RELEASE_SOURCE } from "./release-text.mjs";
import { planeLimits, reportsBuilds } from "../src/index.mjs";
import { fleetStatement, NS_FLEET } from "../../bio-plane/src/sshsig.mjs";
import { run, release, armWith, restoreSigners, SIGNER, bump, sha } from "./fixture.mjs";

after(restoreSigners);
const NEXT = bump(RELEASE_VERSION);
const WORKER_MB = 128;
/* R33 (T51; N1240): the live memory of an install and of an update at the release's real size stays below 112 MB of the 128. */
const LIVE_MB = 112;
const here = (f) => fileURLToPath(new URL(f, import.meta.url));

/* The release's real size, with bytes 0x80-0x9F in it as UTF-8 writes U+0080..U+009F, and still stating its limits and
   its build fields (R20, R15). */
const C1 = String.fromCharCode(...Array.from({ length: 32 }, (_, i) => 0x80 + i));
const REAL = RELEASE_SOURCE + `\n/* R33 real-size release ${NEXT}: ${C1} */\n`;
const realSized = () => {
  const b = new TextEncoder().encode(REAL);
  assert.ok(b.length > 21e6, "the release is the real size: " + b.length);
  assert.ok(b.some((x) => x >= 0x80 && x <= 0x9f), "its bytes include 0x80-0x9F");
  assert.ok(planeLimits(REAL).ok && reportsBuilds(REAL), "it states its limits and reports builds");
  return b.length;
};

test("R33 at the release's real size (~21 MB): the read-back, as a multipart body or as the module itself, whose module holds bytes 0x80-0x9F, hashes equal to the release, for a repository release and for the built-in one; a changed byte is still named", async () => {
  realSized();
  armWith(SIGNER.line);
  const rel = await release({ version: NEXT, src: REAL, fleet: false });
  const want = await sha(REAL);
  const MISMATCH = new RegExp(`is not the ${NEXT.replace(/\./g, "\\.")} release&#39;s own bytes \\(read back, it hashes to [0-9a-f]{16}…; the release hashes to ${want.slice(0, 16)}…\\)`);
  for (const readBack of ["multipart", "raw"]) {
    const w = await run({ slug: "rs-repo", rel, readBack });
    assert.equal(w.planePuts.length, 2, readBack);
    assert.equal(w.planePuts[0].source, REAL, `${readBack}: the repository release installed, byte for byte`);
    assert.equal(w.page.status("verify"), "ok", readBack);
    assert.ok(w.page.done.includes(RUNNING), readBack);
    assert.ok(!/is not the [0-9.]+ release&#39;s own bytes|could not be read back/.test(w.page.done), `${readBack}: no lag named`);
  }
  /* The built-in release (no repository answering): the same, at the size Bob's install met. */
  for (const readBack of ["multipart", "raw"]) {
    const w = await run({ slug: "rs-builtin", rel: null, readBack });
    assert.equal(w.planePuts[0].source, RELEASE_SOURCE, `${readBack}: the built-in release installed`);
    assert.equal(w.page.status("verify"), "ok", `built-in, ${readBack}`);
    assert.ok(!/is not the [0-9.]+ release&#39;s own bytes|could not be read back/.test(w.page.done), `built-in, ${readBack}: no lag named`);
  }
  /* A mismatch is named, however the answer is shaped, and no success is claimed. */
  for (const readBack of ["differ", "fail"]) {
    const w = await run({ slug: "rs-bad", rel, readBack });
    assert.match(w.page.done, readBack === "differ" ? MISMATCH : /could not be read back/, readBack);
    assert.ok(!w.page.done.includes(RUNNING), `${readBack}: no success claimed`);
    assert.equal(w.page.status("verify"), "no", readBack);
  }
  restoreSigners();
});

/* ---- the memory bound ---- */

/* The finished panel's headline, by its key, as the panel escapes it. */
const RUNNING = word("installer.success.running").replace(/'/g, "&#39;");
const dir = mkdtempSync(join(tmpdir(), "r33-"));
after(() => rmSync(dir, { recursive: true, force: true }));
let bundle = null, repo = null, repoFleet = null;
const real = here("../../release");
const prepare = async () => {
  if (bundle) return;
  /* The file a Worker would run: the installer built as `npm run build` builds it (ASCII source, the release as one literal, the
     word rows cut to the installer's own keys, R72). */
  await build({ ...(await bundleOptions()), outfile: join(dir, "installer.mjs") });
  bundle = join(dir, "installer.mjs");
  /* A signed 21 MB release for the repository to serve: newer than the built-in, naming no fleet. */
  const bytes = Buffer.from(REAL);
  writeFileSync(join(dir, "bio-plane.bundled.mjs"), bytes);
  const manifest = { version: NEXT, sha256: createHash("sha256").update(bytes).digest("hex"),
    bytes: bytes.length, asset: "bio-plane.bundled.mjs", sig: await SIGNER.sign(new Uint8Array(bytes)) };
  writeFileSync(join(dir, "RELEASE.json"), JSON.stringify(manifest));
  /* The same release naming the real 0.85.0 fleet (its members and parts as committed under release/, the largest 6 MB), the
     fleet statement signed by the test key. */
  const fleet = JSON.parse(readFileSync(join(real, "RELEASE.json"), "utf8")).fleet;
  const plane = { sha256: manifest.sha256, bytes: manifest.bytes, asset: manifest.asset };
  writeFileSync(join(dir, "RELEASE-fleet.json"), JSON.stringify({ ...manifest, fleet,
    fleetSig: await SIGNER.sign(fleetStatement({ version: NEXT, plane, members: fleet }), NS_FLEET) }));
  repo = { manifest: join(dir, "RELEASE.json"), asset: "bio-plane.bundled.mjs", file: join(dir, "bio-plane.bundled.mjs") };
  repoFleet = { ...repo, manifest: join(dir, "RELEASE-fleet.json"), extra: real };
};
async function child(scenario) {
  await prepare();
  const cfg = { bundle, real, dir: join(dir, "scripts-" + scenario.slug), mode: "install", readBack: "multipart", ...scenario,
    ...(scenario.repo ? { repo: scenario.repo === "fleet" ? repoFleet : repo, signer: SIGNER.line } : {}) };
  const out = execFileSync(process.execPath, ["--expose-gc", here("./realsize-child.mjs"), JSON.stringify(cfg)],
    { encoding: "utf8", maxBuffer: 1 << 24, timeout: 300000 });
  return JSON.parse(out.trim().split("\n").at(-1));
}
const within = (r, what) => {
  if (process.env.R33_REPORT) console.log(`R33 peak: ${what}: ${r.peakMB} MB live (baseline ${r.baselineMB}), resident growth ${r.rssGrowthMB} MB; ${JSON.stringify(r.samples)}`);
  assert.ok(r.peakMB < LIVE_MB, `${what}: live memory peaked at ${r.peakMB} MB (baseline ${r.baselineMB} MB; limit ${LIVE_MB} MB): ${JSON.stringify(r.samples)}`);
  /* And what the act added to the process's resident high-water mark, which sees what no sample point does. */
  assert.ok(r.rssGrowthMB < WORKER_MB, `${what}: the act took the process ${r.rssGrowthMB} MB above where loading the installer left it (limit ${WORKER_MB} MB)`);
};
/* R61: the built-in release carries its own fleet statement, so it names the real fleet as the repository's "fleet" release does. */
const namesFleet = (scenario) => scenario.repo === "fleet" || !scenario.repo;
/* A release naming the real fleet leaves its two container members out (their images are not yet published where an account can
   pull them, R38), names them at the fleet step, and R15 then confirms: they are no lag (K3793). Nothing about the read-back. */
const finished = (r, what, fleet = false) => {
  assert.equal(r.failed, null, `${what}: no stop`);
  assert.equal(r.byteLag, false, `${what}: no byte lag named`);
  assert.equal(r.mismatch, false, `${what}: no mismatch named`);
  assert.equal(r.unread, false, `${what}: nothing unread`);
  assert.equal(r.verify, "ok", `${what}: verify ok ${JSON.stringify({ lags: r.lags, fleet: r.fleet })}`);
  if (fleet) for (const m of ["agent-runner", "file-scanner"]) assert.match(r.fleet || "", new RegExp(m), `${what}: ${m} named left out at the fleet step`);
};

test("R33 the install keeps within a Worker's 128 MB at the release's real size: the built-in 0.85.0 release (read back as multipart, and as the module itself) and a 21 MB release from the repository", async () => {
  realSized();
  for (const [what, scenario, version] of [
    ["install, built-in, multipart read-back", { slug: "rs-a", readBack: "multipart" }, RELEASE_VERSION],
    ["install, built-in, raw read-back", { slug: "rs-b", readBack: "raw" }, RELEASE_VERSION],
    ["install, repository release", { slug: "rs-c", repo: true }, NEXT],
    ["install, repository release with the real fleet", { slug: "rs-h", repo: "fleet" }, NEXT],
  ]) {
    const r = await child(scenario);
    within(r, what); finished(r, what, namesFleet(scenario));
    assert.equal(r.install, "ok", what);
    assert.equal(r.uploads, 2, `${what}: the install upload and the re-upload both ran`);
    assert.equal(r.version, version, `${what}: the release installed`);
    assert.equal(r.running, true, `${what}: success claimed because every check passed`);
    if (namesFleet(scenario)) assert.deepEqual([...r.members].sort(), ["agent-worker", "ocr-worker", "pdf-worker", "sheet-worker"],
      `${what}: the members that can install did (the two container members are left out until their images are published)`);
  }
});

test("R33 the update keeps within a Worker's 128 MB at the release's real size: the built-in release and a 21 MB release from the repository", async () => {
  realSized();
  for (const [what, scenario, version] of [
    ["update, built-in", { slug: "rs-d", mode: "update", pre: ["rs-d"], before: "0.70.0", chosen: RELEASE_VERSION }, RELEASE_VERSION],
    ["update, repository release", { slug: "rs-e", mode: "update", pre: ["rs-e"], before: RELEASE_VERSION, chosen: NEXT, repo: true }, NEXT],
    ["update, repository release with the real fleet", { slug: "rs-i", mode: "update", pre: ["rs-i"], before: RELEASE_VERSION, chosen: NEXT, repo: "fleet" }, NEXT],
  ]) {
    const r = await child(scenario);
    within(r, what); finished(r, what, namesFleet(scenario));
    assert.equal(r.up, "ok", what);
    assert.equal(r.version, version, `${what}: the release uploaded`);
  }
});

test("R33 at the real size under the same bound, a read-back that differs by one byte is named and no success is claimed, for the install and for the update", async () => {
  realSized();
  for (const [what, scenario] of [
    ["install", { slug: "rs-f", readBack: "multipart", differ: true }],
    ["update", { slug: "rs-g", mode: "update", pre: ["rs-g"], before: "0.70.0", chosen: RELEASE_VERSION, readBack: "multipart", differ: true }],
  ]) {
    const r = await child(scenario);
    within(r, what);
    assert.equal(r.byteLag, true, `${what}: the mismatch is named`);
    assert.equal(r.mismatch, true, `${what}: with both hashes`);
    assert.equal(r.verify, "no", `${what}: no success claimed`);
  }
});
