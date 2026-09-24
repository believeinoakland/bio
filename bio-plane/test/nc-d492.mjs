/* D-492's negative control for `rendered-capture.test.mjs`. Run: `node test/nc-d492.mjs [arm]`.
 *
 * THE SUBJECT: the render allowance's RESERVATION. `renderAdmit` reserves a render's
 * maximum cost before it runs, so the renders IN FLIGHT are counted against the day's
 * allowance instead of every one of them being admitted against the same `spent_ms`.
 *
 * Each arm breaks ONE thing in ONE file, runs the suite, records its tally and the FAIL
 * labels, and restores the file by copy from a uniquely-named per-arm pristine copy
 * OUTSIDE this worktree (BOB #32, 2026-09-24: a file in the worktree is not inert — it is
 * walked by repository suites, trips the gate's under-inclusion check, and makes the tree
 * dirty), verified by sha256 AND by content with the byte count printed and floored. A
 * baseline row runs first and last. An arm whose patch matched anything but exactly once
 * is reported as NOT ARMED, never as a result. */
import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SUITE = `${ROOT}test/rendered-capture.test.mjs`;
const PRISTINE = mkdtempSync(join(tmpdir(), "nc-d492-pristine-"));
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const ARMS = {
  /* THE ROW'S CONTROL — DROP THE RESERVATION: admit on what has been SPENT, which is
     exactly the rule D-492 replaced. MUST FAIL: J1 (all K admitted, none deferred), J2,
     J3 (no deferral was answered while the renders were in flight), J4, J5 (an unreported
     render no longer holds anything), H2, H3, H4 (the third render is admitted).
     MUST NOT FAIL: H0, H1, J6, and every arm of A-I. */
  noreserve: { file: "src/store.mjs",
    from: `    if (spent + reserved + reserve > allowance)\n      return defer(null);`,
    to:   `    if (spent >= allowance)\n      return defer(null);` },
  /* NEVER RELEASE: the reservation is taken and never given back, so a day's allowance is
     consumed by reservations rather than by time. MUST FAIL: H1 (the second render is
     refused although the first reported and finished), H3, J6 (a release without charge
     no longer happens). MUST NOT FAIL: H0, H2, H4, J1-J5. */
  norelease: { file: "src/store.mjs",
    from: `    const released = Math.min(held, rel);`,
    to:   `    const released = 0;` },
  /* AN UNREPORTED RENDER IS RELEASED, D-492's rule inverted: a render that reported no
     time hands its reservation back for time that may well have been spent.
     MUST FAIL: J5 ALONE. */
  releaseunreported: { file: "src/store.mjs",
    from: `    const n = typeof ms === "number" && Number.isFinite(ms) && ms >= 0 ? Math.ceil(ms) : null;\n    const rel =`,
    to:   `    const n = typeof ms === "number" && Number.isFinite(ms) && ms >= 0 ? Math.ceil(ms) : 0;\n    const rel =` },
  /* OVER-STRICTNESS — a CORRECT reservation in a spelling nobody anticipated: the caller
     sends it as a JSON string rather than a number, which is what an intermediary that
     stringifies numbers would produce. The store must read it and admit exactly as
     before. MUST FAIL: NOTHING. The tally must equal the baseline's. */
  overstrict: { file: "src/index.mjs",
    from: `body: JSON.stringify({ allowanceMs: renderAllowanceMs(env), reserveMs: renderReserved, at: retrieved }) }));`,
    to:   `body: JSON.stringify({ allowanceMs: renderAllowanceMs(env), reserveMs: String(renderReserved), at: retrieved }) }));` },
};

const run = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: ROOT, encoding: "utf-8", timeout: 900000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/rendered-capture: (\d+) pass, (\d+) fail/);
  const fails = [...out.matchAll(/^\s+FAIL\s+(\S+)/gm)].map((x) => x[1]);
  /* A suite that died before its own foot reports -1, never 0 (WORKER.md: a TypeError
     inside an assertion goes through no assertion at all and leaves the tally clean). */
  return { exit: r.status, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, fails };
};

const want = process.argv[2];
const rows = [];
rows.push({ arm: "baseline", ...run() });
for (const [name, a] of Object.entries(ARMS)) {
  if (want && want !== name) continue;
  const path = `${ROOT}${a.file}`;
  const keep = `${PRISTINE}/${name}.${a.file.replace(/\//g, "_")}`;
  copyFileSync(path, keep);
  const before = sha(keep);
  const src = readFileSync(path, "utf-8");
  const count = src.split(a.from).length - 1;
  if (count !== 1) { rows.push({ arm: name, armed: false, matches: count }); continue; }
  writeFileSync(path, src.replace(a.from, a.to));
  const res = run();
  copyFileSync(keep, path);
  const after = sha(path);
  const same = Buffer.compare(readFileSync(keep), readFileSync(path)) === 0;
  const bytes = readFileSync(path).length;
  if (bytes < 1000 || before !== after || !same) { console.error(`RESTORE FAILED for ${name}`); process.exit(3); }
  rows.push({ arm: name, armed: true, ...res, restore: `sha256 ${after.slice(0, 12)} MATCH, cmp IDENTICAL, ${bytes} bytes` });
}
rows.push({ arm: "baseline-last", ...run() });
rmSync(PRISTINE, { recursive: true, force: true });
for (const r of rows) console.log(JSON.stringify(r));
