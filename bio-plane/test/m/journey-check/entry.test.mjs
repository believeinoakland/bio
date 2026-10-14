/* journey-check R4: `journey.mjs` runs its journey only when executed directly (its own file the process's entry), never on
   import: importing it starts no walk, opens no browser or server, and does not exit the process. */
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, symlinkSync } from "node:fs";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const JOURNEY = join(import.meta.dirname, "..", "..", "..", "src", "journey-check", "journey.mjs");

/* `node <args>`, which must end by itself within `deadline` ms: whether it did, its status and what it printed */
/* the child's credentials are stand-ins, never the environment's own */
const ENV = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("JOURNEY_"))),
  JOURNEY_ADMIN_HANDLE: "ada", JOURNEY_ADMIN_PASSWORD: "admin-pass-xyz", JOURNEY_MEMBER_HANDLE: "mai", JOURNEY_MEMBER_PASSWORD: "member-pass-xyz" };
function run(args, deadline = 60000) {
  return new Promise((done) => {
    const child = spawn(process.execPath, args, { stdio: ["ignore", "pipe", "pipe"], env: ENV });
    let out = "", err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    const t = setTimeout(() => child.kill("SIGKILL"), deadline);
    child.on("exit", (status, signal) => { clearTimeout(t); done({ ended: signal === null, status, out, err }); });
  });
}

test("R4: importing journey.mjs starts nothing: no walk, no browser or server, no exit; the importer goes on and its process ends by itself", async () => {
  const dir = mkdtempSync(join(tmpdir(), "jc-entry-"));
  try {
    const script = join(dir, "importer.mjs");
    /* the importer prints after the import (so the import did not exit), and what remains open (so nothing was started) */
    writeFileSync(script, `const before = process.getActiveResourcesInfo();
const m = await import(${JSON.stringify(pathToFileURL(JOURNEY).href)});
const after = process.getActiveResourcesInfo();
for (const h of before) after.splice(after.indexOf(h), 1);
console.log(JSON.stringify({ exports: Object.keys(m).sort(), handles: after }));
console.log("still running");`);
    const r = await run([script, "--live", "http://127.0.0.1:9"], 30000);
    assert.equal(r.ended, true, "the importing process did not end by itself: " + r.err);
    assert.equal(r.status, 0, r.err);
    const [first, second] = r.out.trim().split("\n");
    assert.deepEqual(JSON.parse(first).exports, ["isEntry", "main"]);
    assert.deepEqual(JSON.parse(first).handles, [], "a handle (a server, a browser, a timer) was opened by the import");
    assert.equal(second, "still running");
    assert.equal(r.out.includes("journey-check ("), false, "a walk's report was printed");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("R4 control: running journey.mjs directly starts the walk (`--live <address>` the live arm, reading bootstrap); so does running it through a link", async () => {
  const seen = [];
  const server = createServer((req, res) => { seen.push(req.url); res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ ok: true, test_instance: false })); });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const dir = mkdtempSync(join(tmpdir(), "jc-entry-"));
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const r = await run([JOURNEY, "--live", base, "--out", join(dir, "out")]);
    assert.equal(r.ended, true, r.err);
    assert.equal(r.status, 1, "a refused walk exits 1");
    assert.match(r.out, /^journey-check \(live\): 0 steps, 1 failures/);
    assert.match(r.out, /NOT_A_TEST_INSTANCE/);
    assert.deepEqual(seen, ["/api/?op=bootstrap"]);
    assert.ok(existsSync(join(dir, "out", "report.txt")), "the report written to --out");
    assert.match(readFileSync(join(dir, "out", "report.txt"), "utf8"), /NOT_A_TEST_INSTANCE/);
    const link = join(dir, "journey-link.mjs");
    symlinkSync(JOURNEY, link);
    const viaLink = await run([link, "--live", base, "--out", join(dir, "out2")]);
    assert.equal(viaLink.status, 1);
    assert.match(viaLink.out, /NOT_A_TEST_INSTANCE/);
  } finally { server.close(); rmSync(dir, { recursive: true, force: true }); }
});
