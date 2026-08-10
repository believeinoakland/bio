/* D-249 — THE NEGATIVE CONTROL FOR THE PORT PIN. Five arms, one step:
 *
 *     node test/d249-port.control.mjs [baseline|plant|neuter|widen|zero|all]
 *
 * NOT a `.test.mjs`, deliberately: it EDITS REAL SOURCES while it runs, so the
 * battery must not discover it. `register.control.mjs` and
 * `suggest.control.mjs` are the precedent.
 *
 * Each arm is armed ALONE with the others held open. Each DECLARES before it
 * runs what MUST fail and what MUST NOT. Every restore is verified against a
 * UNIQUELY-NAMED per-arm pristine copy by sha256 AND by content, with a byte
 * count printed and a minimum guarded — because two harnesses in this project
 * once reported a restore byte-identical over an EMPTY manifest, caught only
 * because a digest read e3b0c442…, the sha256 of the empty string.
 *
 * THE BASELINE ARM IS NOT DECORATION. A harness here once reported `null` for
 * every arm INCLUDING the baseline, and only the baseline row distinguished
 * six-arms-broken from six-arms-working.
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..");
const HYG = join(DIR, "hygiene.test.mjs");
const VICTIM = join(DIR, "bootstrap.test.mjs");
const arm = process.argv[2] ?? "all";

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

/* CAPTURE TO A FILE, NEVER TO A PIPE, AND THE REASON IS A FINDING THIS CONTROL
 * MADE ABOUT ITSELF (D-282). The first run of the `widen` arm reported a tally
 * of -1 and a verdict of NOT AS DECLARED. The arm was correct and the HARNESS
 * was wrong: `hygiene.test.mjs` ends `process.exit(fail ? 1 : 0)`, and when its
 * stdout is a PIPE those writes are ASYNCHRONOUS, so `process.exit` discards
 * whatever has not flushed. Measured on the same armed tree: 191,434 bytes
 * reached a FILE and only 89,329 bytes reached a PIPE — the missing 102,105
 * bytes being the tail, which is where the tally lives. It is not `maxBuffer`:
 * raising it to 64 MB changed nothing, because the bytes were never written.
 *
 * THIS IS NOT A PROPERTY OF THIS CONTROL. `scripts/battery.mjs` spawns every
 * suite with default stdio, which is a pipe, so ANY suite that fails with a
 * large enough dump loses its own tally under the battery — D-93's shape
 * arriving through a mechanism D-93 never named. Raised as D-282. */
function runHygiene() {
  let out = "";
  const cap = join(ROOT, "test", ".d249-capture.txt");
  try {
    execFileSync("sh", ["-c", `"$0" test/hygiene.test.mjs > "$1" 2>&1`, process.execPath, cap],
      { cwd: ROOT, stdio: ["ignore", "ignore", "ignore"] });
  } catch { /* non-zero exit is expected on an armed run */ }
  try { out = readFileSync(cap, "utf8"); } catch { out = ""; }
  try { unlinkSync(cap); } catch {}
  const m = /hygiene:\s*(\d+)\s*pass,\s*(\d+)\s*fail/.exec(out);
  /* A TypeError inside an assertion goes through NO assertion at all and ends
     the module while the tally reads clean, so a missing tally is reported as
     -1 and NEVER as 0. */
  const tally = m ? { pass: Number(m[1]), fail: Number(m[2]) } : { pass: -1, fail: -1 };
  const failed = [...out.matchAll(/^\s*FAIL\s+(.*)$/gm)].map((x) => x[1].trim());
  return { tally, failed, out };
}

/* A pristine copy per ARM, uniquely named, so two arms can never restore each
   other's bytes — a class of error this project has paid for. */
function pristine(file, armName) {
  const p = `${file}.pristine-${armName}`;
  copyFileSync(file, p);
  const bytes = readFileSync(p).length;
  if (bytes < 1000) throw new Error(`pristine copy for ${armName} is only ${bytes} bytes — refusing to proceed`);
  const d = sha(p);
  if (d === EMPTY_SHA) throw new Error(`pristine copy for ${armName} is EMPTY (${d})`);
  return { path: p, bytes, sha: d };
}

function restore(file, snap, armName) {
  copyFileSync(snap.path, file);
  const after = sha(file);
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", file, snap.path]); cmpOk = true; } catch { cmpOk = false; }
  const bytes = readFileSync(file).length;
  const ok = after === snap.sha && cmpOk && bytes === snap.bytes && bytes >= 1000;
  console.log(`    restore[${armName}]: sha256 ${after.slice(0, 8)}… ${after === snap.sha ? "EQUAL" : "*** DIFFERS ***"}` +
    ` · cmp ${cmpOk ? "IDENTICAL" : "*** DIFFERS ***"} · ${bytes} bytes (pristine ${snap.bytes})` +
    ` · ${ok ? "OK" : "*** RESTORE FAILED ***"}`);
  unlinkSync(snap.path);
  if (!ok) throw new Error(`restore failed for ${armName}`);
}

const results = [];
const record = (name, declared, r, verdict) => {
  results.push({ name, declared, tally: r.tally, failed: r.failed, verdict });
  console.log(`    tally: ${r.tally.pass} pass, ${r.tally.fail} fail`);
  if (r.failed.length) for (const f of r.failed) console.log(`    FAILED: ${f}`);
  console.log(`    VERDICT: ${verdict}\n`);
};

/* ---------------- baseline ---------------- */
if (arm === "all" || arm === "baseline") {
  console.log("=== ARM baseline — nothing armed ===");
  console.log("  DECLARED MUST NOT FAIL: everything. Expect 594 pass, 0 fail.");
  const r = runHygiene();
  record("baseline", "594/0, no failures", r,
    r.tally.fail === 0 && r.tally.pass > 500 ? "as declared" : "*** NOT AS DECLARED ***");
}

/* ---------------- plant: a REAL pin in a REAL suite ---------------- */
if (arm === "all" || arm === "plant") {
  console.log("=== ARM plant — put a real fixed port into a real suite ===");
  console.log("  DECLARED MUST FAIL: the CORPUS arm, naming bootstrap.test.mjs and 8787.");
  console.log("  DECLARED MUST NOT FAIL: the reach arm and the over-strictness arm.");
  const snap = pristine(VICTIM, "plant");
  const src = readFileSync(VICTIM, "utf8");
  /* Planted in the Miniflare options, which is exactly where a real one would
     be written — not in a comment, where it would prove less. */
  const armed = src.replace("  defaultPersistRoot: PERSIST,", "  port: 8787,\n  defaultPersistRoot: PERSIST,");
  if (armed === src) { restore(VICTIM, snap, "plant"); throw new Error("plant arm NEVER ARMED — anchor not found. That is a finding."); }
  writeFileSync(VICTIM, armed);
  const r = runHygiene();
  const corpusFired = r.failed.some((f) => /no suite pins a fixed port/.test(f) && /bootstrap/.test(f));
  const reachHeld = !r.failed.some((f) => /planted pins/.test(f));
  const strictHeld = !r.failed.some((f) => /innocent forms/.test(f));
  record("plant", "corpus FAILS naming bootstrap+8787; reach and over-strictness HOLD", r,
    corpusFired && reachHeld && strictHeld ? "as declared" : "*** NOT AS DECLARED ***");
  restore(VICTIM, snap, "plant");
}

/* ---------------- neuter: a detector that reads nothing ---------------- */
if (arm === "all" || arm === "neuter") {
  console.log("=== ARM neuter — make the detector match nothing ===");
  console.log("  DECLARED MUST FAIL: the REACH arm (4 planted pins).");
  console.log("  DECLARED MUST NOT FAIL: the corpus arm — and THAT IS THE POINT.");
  console.log("  A detector that finds nothing passes a clean corpus, which is why a");
  console.log("  reach arm exists at all.");
  const snap = pristine(HYG, "neuter");
  const src = readFileSync(HYG, "utf8");
  const armed = src.replace(/const PORT_PIN = \/.*\/g;/, "const PORT_PIN = /(?!)/g;");
  if (armed === src) { restore(HYG, snap, "neuter"); throw new Error("neuter arm NEVER ARMED — PORT_PIN not matched. That is a finding."); }
  writeFileSync(HYG, armed);
  const r = runHygiene();
  const reachFired = r.failed.some((f) => /planted pins/.test(f));
  const corpusHeld = !r.failed.some((f) => /no suite pins a fixed port/.test(f));
  record("neuter", "reach FAILS; corpus HOLDS", r,
    reachFired && corpusHeld ? "as declared" : "*** NOT AS DECLARED ***");
  restore(HYG, snap, "neuter");
}

/* ---------------- widen: the naive spelling, any 4-digit number ---------------- */
if (arm === "all" || arm === "widen") {
  console.log("=== ARM widen — grade any 4-digit number as a port (the naive matcher) ===");
  console.log("  DECLARED MUST FAIL: the OVER-STRICTNESS arm, and the corpus arm should");
  console.log("  flood with false findings from dates and ids.");
  console.log("  This is the arm that decides the check is usable rather than merely strict.");
  const snap = pristine(HYG, "widen");
  const src = readFileSync(HYG, "utf8");
  const armed = src.replace(/const PORT_PIN = \/.*\/g;/, "const PORT_PIN = /(\\d{4})(?!\\d)/g;");
  if (armed === src) { restore(HYG, snap, "widen"); throw new Error("widen arm NEVER ARMED. That is a finding."); }
  writeFileSync(HYG, armed);
  const r = runHygiene();
  const strictFired = r.failed.some((f) => /innocent forms/.test(f));
  const corpusFlooded = r.failed.some((f) => /no suite pins a fixed port/.test(f));
  const n = /no suite pins a fixed port \((\d+) found/.exec(r.out);
  console.log(`    false findings over the real corpus: ${n ? n[1] : "unreported"}`);
  record("widen", "over-strictness FAILS; corpus floods", r,
    strictFired && corpusFlooded ? "as declared" : "*** NOT AS DECLARED ***");
  restore(HYG, snap, "widen");
}

/* ---------------- zero: stop treating port 0 as derived ---------------- */
if (arm === "all" || arm === "zero") {
  console.log("=== ARM zero — remove the `port 0 is derived` exclusion ===");
  console.log("  DECLARED MUST FAIL: the OVER-STRICTNESS arm, because `port: 0` and");
  console.log("  `.listen(0` are the estate's own way of asking the kernel for a free port.");
  console.log("  This arm exists because that single predicate is what makes the check");
  console.log("  safe to be strict about every other number.");
  const snap = pristine(HYG, "zero");
  const src = readFileSync(HYG, "utf8");
  const armed = src.replace('    if (n !== "0") pinnedPort.push(`${f}: ${n}`);', "    pinnedPort.push(`${f}: ${n}`);")
    .replace('.map((m) => m[1] ?? m[2] ?? m[3]).filter((n) => n !== "0");', ".map((m) => m[1] ?? m[2] ?? m[3]);");
  if (armed === src) { restore(HYG, snap, "zero"); throw new Error("zero arm NEVER ARMED. That is a finding."); }
  writeFileSync(HYG, armed);
  const r = runHygiene();
  const strictFired = r.failed.some((f) => /innocent forms/.test(f));
  record("zero", "over-strictness FAILS on port 0", r,
    strictFired ? "as declared" : "*** NOT AS DECLARED — a surprising green is a finding about the ARM ***");
  restore(HYG, snap, "zero");
}

console.log("=== SUMMARY ===");
for (const r of results) {
  console.log(`  ${r.name.padEnd(10)} ${String(r.tally.pass).padStart(4)}/${r.tally.fail}  ${r.verdict}`);
}
const bad = results.filter((r) => /NOT AS DECLARED/.test(r.verdict));
console.log(`\n  ${results.length} arm(s) run · ${bad.length} behaved other than declared`);
/* A restore left behind is a defect the next session inherits. */
for (const f of [HYG, VICTIM]) {
  for (const a of ["baseline", "plant", "neuter", "widen", "zero"]) {
    if (existsSync(`${f}.pristine-${a}`)) console.log(`  *** LEFTOVER pristine copy: ${f}.pristine-${a}`);
  }
}
process.exit(bad.length ? 1 : 0);
