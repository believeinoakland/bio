#!/usr/bin/env node
/* nc-d557.mjs — the NEGATIVE CONTROL for `d557-census-judged-text.test.mjs` (D-557).
 * Deliberately NOT a `.test.mjs`: it EDITS A REAL SOURCE (`scripts/fw20-decode-census.mjs`) while it runs,
 * and the battery must not discover it. The harness is nc-d536's, copied: every arm armed ALONE; a patch
 * must match EXACTLY ONCE or the arm is NOT ARMED and nothing runs; the restore is `copyFileSync` from a
 * UNIQUELY-NAMED per-arm pristine copy held OUTSIDE the worktree, verified by sha256 AND byte comparison with
 * the byte count printed and floored; the result is read from the suite's OWN foot line (none -> -1/-1).
 *
 *   node test/nc-d557.mjs          # every arm, in order
 *   node test/nc-d557.mjs plain    # one arm (plus the baseline)
 *
 * DECLARED BEFORE ARMING — what MUST fail and what MUST NOT, by label:
 *   baseline   nothing armed; MUST be green — the row that tells all-broken from all-working.
 *   plain      THE ROW'S OWN CONTROL: the census judges the PLAIN `op=pdfstructure` answer again (the text
 *              before D-557). The TIER-3 arm MUST FAIL BY NAME — the tier-3 text judged reads empty — and so
 *              must the digest arm and the every-row arm; the born-digital page's arms (the over-strictness
 *              direction) MUST NOT.
 *   texttier   the label is read off the document's `text_tier` again. The MIXED LABEL arm MUST FAIL (one
 *              number for two tiers of text); the TIER-3 text arm MUST NOT — the text judged is unchanged.
 *
 * RESULTS — RUN 2026-09-25 by D-557's worker on the tree this suite landed on (from the run's printout):
 *   3 arms, 0 NOT AS DECLARED — baseline 16/0 · plain 12/4 (TIER-3 TEXT JUDGED by name, the digest arm,
 *   the mixed document's both-pages arm, and NO ROW IS LABELLED TIER 3 UNLESS…; the born-digital arms stayed
 *   green) · texttier 15/1 (exactly THE MIXED LABEL). Every restore byte-identical by sha256 AND by byte
 *   comparison (fw20-decode-census.mjs 11,402 B sha256 4387382e…).
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HOLD = join(process.env.NC_HOLD || tmpdir(), `nc-d557-pristine-${process.pid}`);
const sha = (b) => createHash("sha256").update(b).digest("hex");
const CENSUS = join(ROOT, "scripts/fw20-decode-census.mjs");

const TIER3 = "TIER-3 TEXT JUDGED";
const BORN = "the born-digital page is judged on its own text layer";
const BORN1 = "and it is labelled tier 1 by the plane, from its producer";
const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: [TIER3, BORN, "THE MIXED LABEL"] },
  plain: {
    patches: [[CENSUS, "        const judged = j.pages;\n", "        const judged = plain;\n"]],
    mustFail: [TIER3, "the judged text IS the text the reading classified", "NO ROW IS LABELLED TIER 3 UNLESS"],
    mustPass: [BORN, BORN1],
  },
  texttier: {
    patches: [[CENSUS, "    reader: glyphs && tiers.some((t) => t != null)\n",
                       "    reader: doc && doc.reading ? `plane (text tier ${doc.reading.text_tier})` : glyphs && tiers.some((t) => t != null)\n"]],
    mustFail: ["THE MIXED LABEL"],
    mustPass: [TIER3, BORN, BORN1],
  },
};

function runSuite() {
  const r = spawnSync(process.execPath, ["test/d557-census-judged-text.test.mjs"], { cwd: ROOT, encoding: "utf8", maxBuffer: 64 << 20 });
  const out = (r.stdout || "") + (r.stderr || "");
  const foot = out.match(/d557: (\d+) passed, (\d+) failed\s*$/m);
  const fails = [...out.matchAll(/^\s+FAIL\s+(.*)$/gm)].map((m) => m[1]);
  const passes = [...out.matchAll(/^\s+PASS\s+(.*)$/gm)].map((m) => m[1]);
  return { pass: foot ? +foot[1] : -1, fail: foot ? +foot[2] : -1, fails, passes,
           foot: !!foot && !/SUITE ENDED BEFORE ITS OWN FOOT/.test(out), exit: r.status };
}

const only = process.argv[2];
const order = only ? ["baseline", only] : Object.keys(ARMS);
if (only && !ARMS[only]) { console.error(`unknown arm ${only}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
mkdirSync(HOLD, { recursive: true });
const report = [];
let wrong = 0;
for (const name of order) {
  const arm = ARMS[name];
  const files = [...new Set(arm.patches.map((p) => p[0]))];
  const kept = files.map((f) => {
    const copy = join(HOLD, `${name}.${f.split("/").pop()}.pristine`);
    copyFileSync(f, copy);
    return { f, copy, digest: sha(readFileSync(f)), bytes: statSync(f).size };
  });
  let armed = true;
  for (const [f, from, to] of arm.patches) {
    const src = readFileSync(f, "utf8");
    const n = src.split(from).length - 1;
    if (n !== 1) { armed = false; console.log(`  arm ${name}: patch matched ${n} times in ${f} — NOT ARMED`); break; }
    writeFileSync(f, src.replace(from, to));
  }
  const res = armed ? runSuite() : null;
  /* RESTORE, and it is only believed when measured. */
  for (const k of kept) {
    copyFileSync(k.copy, k.f);
    const back = readFileSync(k.f), orig = readFileSync(k.copy);
    const same = sha(back) === k.digest && Buffer.compare(back, orig) === 0 && back.length === k.bytes;
    console.log(`  restore ${k.f.split("/").slice(-2).join("/")}: ${back.length} B sha256 ${sha(back).slice(0, 12)}… `
              + `restored byte-identically: ${same ? "YES" : "NO"}`);
    if (!same || back.length < 4000) { console.error("RESTORE FAILED — stop and repair by hand"); process.exit(3); }
    rmSync(k.copy);
  }
  if (!res) { report.push(`${name}: NOT ARMED`); wrong++; continue; }
  const failedAll = (label) => res.fails.some((f) => f.includes(label));
  const passedAll = (label) => res.passes.some((p) => p.includes(label));
  const missFail = arm.mustFail.filter((l) => !failedAll(l));
  const missPass = arm.mustPass.filter((l) => !passedAll(l));
  const asDeclared = res.foot && missFail.length === 0 && missPass.length === 0
                   && (name === "baseline" ? res.fail === 0 : res.fail > 0);
  if (!asDeclared) wrong++;
  const line = `${name}: ${res.pass}/${res.fail}${res.foot ? "" : " (NO FOOT)"} — ${asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}`
             + (missFail.length ? ` · did NOT fail: ${missFail.join(" | ")}` : "")
             + (missPass.length ? ` · did NOT pass: ${missPass.join(" | ")}` : "");
  console.log(line);
  if (res.fails.length && name !== "baseline") console.log(`    failed: ${res.fails.join(" | ")}`);
  report.push(line);
}
rmSync(HOLD, { recursive: true, force: true });
console.log(`\nnc-d557: ${order.length} arm(s) run, ${wrong} not as declared\n  ${report.join("\n  ")}`);
process.exit(wrong ? 1 : 0);
