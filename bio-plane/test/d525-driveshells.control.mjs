/* D-525's NEGATIVE CONTROL DRIVER — six arms plus a baseline, re-runnable in one step:
 *
 *     node test/d525-driveshells.control.mjs          # every arm, in order
 *     node test/d525-driveshells.control.mjs e        # one arm
 *
 * DELIBERATELY NOT A `.test.mjs`: it EDITS REAL SOURCES, and a file the battery
 * discovers must never rewrite `src/` underneath the suites running beside it.
 *
 * THE RULES THIS PROJECT PAID FOR, obeyed here:
 *   1. PRISTINE COPIES OUTSIDE THE WORKTREE (BOB #32, 2026-09-24: a file in the
 *      worktree is walked by repository-reading suites), in a directory made
 *      fresh for this run and named for this item and each arm.
 *   2. EVERY RESTORE VERIFIED BY sha256 AND BY CONTENT, byte count printed and
 *      FLOORED — a harness once reported a byte-identical restore of an empty file.
 *   3. EACH PATCH MUST MATCH EXACTLY ONCE, or the arm is reported NOT ARMED:
 *      an arm that did not arm is a finding, never a result.
 *   4. THE SUITE'S OUTPUT GOES TO A FILE, NEVER A PIPE (D-282), and a run with no
 *      tally line is reported as -1, never 0.
 *
 * DECLARED BEFORE ARMING — what each arm asks, and what MUST fail or pass:
 *   (a) BASELINE, nothing armed: MUST be green.
 *   (b) THE REMEDY SKIPPED (the row's own control: no source edit, the suite told
 *       not to re-acquire A): MUST fail with the two-tick arm reading `modified`.
 *   (c) THE CLASSIFIER BLIND TO THE PLANE'S RETRIEVAL RECORD: MUST fail at "A rests
 *       on the plane's own record" — A is still found, on the register alone, which
 *       is exactly why that arm asserts WHICH fact the verdict rests on.
 *   (d) A RECORDED SHELL SCORED AS AN EXPORT: MUST fail at ACCEPTS-WHEN (1).
 *   (e) THE BASELINE-ROW RULE DRIFTS FROM THE MONITOR'S (the document-address row
 *       preferred over the export's): MUST fail at THE PIN after the remedy — the
 *       behavioural pin that stands in for shared code (drive.mjs says why).
 *   (f) THE D-15 STAMP DROPPED from op=driveshells: the store is handed no viewer
 *       and fails closed, so the sweep MUST name nothing and fail at ACCEPTS-WHEN (1).
 *   (g) OVER-STRICTNESS: the declared-type test rebuilt in a spelling the suite was
 *       not written around. MUST PASS, whole.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SUITE = join(ROOT, "test", "d525-driveshells.test.mjs");
const DRIVE = join(ROOT, "src", "drive.mjs");
const INDEX = join(ROOT, "src", "index.mjs");
const PEN = mkdtempSync(join(tmpdir(), "d525-control-"));
const FLOOR = { [DRIVE]: 10000, [INDEX]: 100000 };
const sha = (b) => createHash("sha256").update(b).digest("hex");

const ARMS = {
  a: { name: "BASELINE (nothing armed)", must: "pass", patches: [] },
  b: { name: "THE REMEDY SKIPPED (D525_SKIP_REACQUIRE=1)", must: "fail", patches: [],
       env: { D525_SKIP_REACQUIRE: "1" }, expect: "ACCEPTS-WHEN (2)" },
  c: { name: "THE CLASSIFIER BLIND TO THE RETRIEVAL RECORD", must: "fail", expect: "A rests on the plane's own record",
       patches: [[DRIVE, "const fromPage = fetched.some(", "const fromPage = false && fetched.some("]] },
  d: { name: "A RECORDED SHELL SCORED AS AN EXPORT", must: "fail", expect: "ACCEPTS-WHEN (1)",
       patches: [[DRIVE, 'return { verdict: docSaid ? "undetermined" : "shell", ...facts,',
                         'return { verdict: docSaid ? "undetermined" : "export", ...facts,']] },
  e: { name: "THE BASELINE-ROW RULE DRIFTS FROM THE MONITOR'S", must: "fail", expect: "THE PIN, after the remedy",
       patches: [[DRIVE, "  return (drive && drive.harvestable ? docs.find((d) => d.locator === drive.exportAddress) : null)\n    || docs.find((d) => d.locator === locator) || null;",
                         "  return docs.find((d) => d.locator === locator)\n    || (drive && drive.harvestable ? docs.find((d) => d.locator === drive.exportAddress) : null) || null;"]] },
  f: { name: "THE D-15 STAMP DROPPED", must: "fail", expect: "ACCEPTS-WHEN (1)",
       patches: [[INDEX, '        || op === "driveshells"\n', ""]] },
  g: { name: "OVER-STRICTNESS: the declared-type test respelled", must: "pass",
       patches: [[DRIVE, "(declared !== null && HTML_TYPE.test(declared))",
                         '(declared !== null && ["text/html", "application/xhtml+xml"].includes(declared.split(";")[0].trim().toLowerCase()))']] },
};

function runSuite(arm, env = {}) {
  const out = join(PEN, `d525-arm-${arm}.log`);
  const r = spawnSync(process.execPath, [SUITE], { cwd: ROOT, env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024, timeout: 300000 });
  const text = (r.stdout || "").toString() + (r.stderr || "").toString();
  writeFileSync(out, text);
  const m = /(\d+) passed, (\d+) failed/.exec(text);
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status, text, out };
}

const only = process.argv[2];
const rows = [];
for (const [key, arm] of Object.entries(ARMS)) {
  if (only && key !== only) continue;
  const pristine = {};
  let armed = true;
  for (const [file] of arm.patches) if (!pristine[file]) {
    const bytes = readFileSync(file);
    const copy = join(PEN, `d525-arm-${key}-${file.split("/").pop()}.pristine`);
    writeFileSync(copy, bytes);
    pristine[file] = { copy, sha: sha(bytes), bytes: bytes.length };
  }
  for (const [file, from, to] of arm.patches) {
    const src = readFileSync(file, "utf8");
    const n = src.split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`  (${key}) NOT ARMED: anchor occurs ${n} times in ${file}`); break; }
    writeFileSync(file, src.replace(from, to));
  }
  const res = armed ? runSuite(key, arm.env) : { pass: -1, fail: -1, text: "", out: null };
  /* RESTORE, verified by sha256 AND by content, floored. */
  const restores = [];
  for (const [file, p] of Object.entries(pristine)) {
    const bytes = readFileSync(p.copy);
    writeFileSync(file, bytes);
    const now = readFileSync(file);
    const ok = sha(now) === p.sha && Buffer.compare(now, bytes) === 0 && now.length === p.bytes && now.length >= FLOOR[file];
    restores.push(`${file.split("/").pop()} ${ok ? "MATCH/IDENTICAL" : "MISMATCH"} ${now.length} B ${p.sha.slice(0, 16)}…`);
    if (!ok) { console.log(`RESTORE FAILED for ${file} — stopping`); process.exit(3); }
  }
  const failedAt = (res.text.match(/^\s+FAIL\s+(.*)$/gm) || []).map((l) => l.replace(/^\s+FAIL\s+/, "").slice(0, 90));
  const verdict = !armed ? "NOT ARMED"
    : arm.must === "pass" ? (res.fail === 0 && res.pass > 0 ? "AS DECLARED" : "WRONG")
    : (res.fail > 0 && failedAt.some((l) => l.startsWith(arm.expect)) ? "AS DECLARED" : "WRONG");
  rows.push({ key, name: arm.name, must: arm.must, pass: res.pass, fail: res.fail, verdict, failedAt, restores });
  console.log(`(${key}) ${arm.name}: DECLARED ${arm.must}${arm.expect ? ` at "${arm.expect}"` : ""}; `
    + `ACTUAL ${res.pass}/${res.fail} — ${verdict}`);
  for (const l of failedAt) console.log(`      FAIL ${l}`);
  for (const r of restores) console.log(`      restore ${r}`);
}
rmSync(PEN, { recursive: true, force: true });
const wrong = rows.filter((r) => r.verdict !== "AS DECLARED");
console.log(`\ncontrol: ${rows.length} row(s), ${rows.length - wrong.length} as declared, ${wrong.length} not`);
process.exit(wrong.length ? 1 : 0);
