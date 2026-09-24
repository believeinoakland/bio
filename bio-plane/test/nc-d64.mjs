/* D-64's negative control for `rendered-capture.test.mjs`. Run: `node test/nc-d64.mjs [arm]`.
 *
 * Each arm breaks ONE thing in ONE file, runs the suite, records its tally and the
 * FAIL labels, and restores the file by copy from a uniquely-named pristine copy
 * OUTSIDE this worktree (CORRECTED by D-499; see PRISTINE below), verified by
 * sha256 AND by content with the byte count printed and floored. A baseline row runs first and last. An arm whose patch
 * matched anything but exactly once is reported as NOT ARMED, never as a result. */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, rmSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SUITE = `${ROOT}test/rendered-capture.test.mjs`;
/* CORRECTED by D-499: the pristine copies used to sit at `${ROOT}.nc-d64-pristine`,
   INSIDE the worktree, on the rule as it read when this harness was written. BOB #32
   RULED otherwise on 2026-09-24 (WORKER.md, "KEEP EVERY SCRATCH FILE OUT OF YOUR
   WORKTREE"): a file in the worktree is walked by repository-walking suites, trips
   `gates.mjs` §2e's under-inclusion check and makes the tree DIRTY, so D-293 refuses a
   GREEN verdict — and this harness holds its copies across a SIX-MINUTE suite run, which
   is exactly the window a gate measures in. Out of the worktree, and named for this RUN
   rather than generically, because a shared temp root spans every session on this
   machine and a generic name is an identity nobody owns. */
const PRISTINE = join(tmpdir(), `nc-d64-pristine-${process.pid}-${randomUUID()}`);
mkdirSync(PRISTINE, { recursive: true });   /* CONDUCT #20 at c20-batch24: D-492's mkdtemp line lost to D-499's named path at the union; create it here */
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const ARMS = {
  /* THE ROW'S CONTROL: force `determined` on a page drawing data from a second
     origin. MUST FAIL: B1 (by name), B2, B3, B4, E1. MUST NOT FAIL: A*, C*, D*, I*. */
  determined: { file: "src/render.mjs",
    from: `    for (const [k, o] of [...foreign.entries()].sort())\n      reasons.push(`,
    to:   `    for (const [k, o] of [].sort())\n      reasons.push(` },
  /* A script set nobody recorded read as "none ran". MUST FAIL: D1, D2, D4 (and D3 stays). */
  emptyscripts: { file: "src/render.mjs",
    from: `  let scriptsExecuted = "undetermined", thirdParty = "undetermined";`,
    to:   `  let scriptsExecuted = [], thirdParty = [];` },
  /* THE SHELL AS THE CONTENT: the primary stays the shell. MUST FAIL: A2, A3, A4. */
  shellprimary: { file: "src/index.mjs",
    from: `        sha = rsha; total = rbytes.length; ct = "text/html"; existed = renderedExisted;`,
    to:   `        total = total; ct = ct; existed = existed;` },
  /* OVER-STRICTNESS: the host's own data read as foreign. MUST FAIL: A16 and, SINCE
     D-499, J7 — both are the same correct page refused determination, J7 on the
     timeout page, and D-499 widened this arm's declared set by asserting the
     property twice rather than by changing anything it breaks. Nothing about B–E
     may newly fail. */
  overstrict: { file: "src/render.mjs",
    from: `    for (const d of render.data) if (d.origin !== "same_host") {`,
    to:   `    for (const d of render.data) if (true) {` },
  /* D-499'S CONTROL, the row's own words: record EVERY wait as `condition`, so a
     render that timed out is indistinguishable from one whose condition met. MUST
     FAIL: J2, J3, J4, J4b, J6 (the timeout page), J10, J11 (the unrecognised word),
     J12 (no wait reported). MUST NOT FAIL: J0, J1, J5, J7 (the capture is still
     filed, still graded, still determined), J8, J9, J13, and A–I. */
  waitcondition: { file: "src/render.mjs",
    from: `  const firedClass = waitFiredClass(waitFired, asked.wait);`,
    to:   `  const firedClass = "condition";` },
  /* D-499'S OVER-STRICTNESS ARM: drop the normalisation, so a renderer that spells
     the asked condition with padding and a capital reads as unrecognised. MUST FAIL:
     J13 ALONE — correct work in a spelling the suite did not anticipate. */
  waitcase: { file: "src/render.mjs",
    from: `  const f = fired.trim().toLowerCase();`,
    to:   `  const f = fired;` },
};

const run = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: ROOT, encoding: "utf-8", timeout: 600000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const m = out.match(/rendered-capture: (\d+) pass, (\d+) fail/);
  const fails = [...out.matchAll(/^\s+FAIL\s+(\S+)/gm)].map((x) => x[1]);
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
