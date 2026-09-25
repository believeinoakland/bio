/* REC-203's negative-control driver, declared in `rec203-idspaces.test.mjs`'s NEGATIVE CONTROL header.
 *   node test/nc-rec203.mjs [baseline|independence|fundbare|formjoin|overstrict]
 * ONE arm per run, ALONE. The arm edits a real source with an anchor that must match EXACTLY ONCE, runs the suite,
 * and restores the file from a uniquely-named pristine copy, verified by sha256 AND byte comparison. */
import { readFileSync, writeFileSync, copyFileSync, rmSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { tmpdir } from "node:os";

const SRC = fileURLToPath(new URL("../src/", import.meta.url));
const SUITE = fileURLToPath(new URL("./rec203-idspaces.test.mjs", import.meta.url));
const ID = join(SRC, "idspaces.mjs");
const ARMS = {
  baseline: [],
  independence: [[ID, "if (a.system.origin === b.system.origin)", "if (a.system.host === b.system.host)"]],
  fundbare: [[ID, "if (!na || !nb)\n", "if (false)\n"]],
  formjoin: [[ID, "if (a.rec.form !== b.rec.form)", "if (false)"]],
  overstrict: [[ID, "if (a.system.origin === b.system.origin)", "if (b.system.origin === a.system.origin)"]],
};
const arm = process.argv[2] || "baseline";
if (!ARMS[arm]) { console.error(`unknown arm ${arm}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
const digest = (b) => createHash("sha256").update(b).digest("hex");
const dir = mkdtempSync(join(tmpdir(), `nc-rec203-${arm}-`));
const saved = [];
let code = 3;
try {
  for (const [file, anchor, repl] of ARMS[arm]) {
    const before = readFileSync(file);
    const text = before.toString("utf8");
    const n = text.split(anchor).length - 1;
    if (n !== 1) throw new Error(`arm ${arm}: anchor matched ${n} times in ${file} — THE ARM DID NOT ARM`);
    const pristine = join(dir, `pristine-${arm}-${saved.length}.mjs`);
    copyFileSync(file, pristine);
    saved.push([file, pristine, digest(before), before.length]);
    writeFileSync(file, text.replace(anchor, repl));
  }
  const r = spawnSync(process.execPath, [SUITE], { encoding: "utf8" });
  const out = (r.stdout || "") + (r.stderr || "");
  for (const l of out.split("\n")) if (/^\s+FAIL\s|: \d+ pass, \d+ fail$/.test(l)) console.log(l);
  const foot = /rec203-idspaces: (\d+) pass, (\d+) fail/.exec(out);
  console.log(`ARM ${arm}: ${foot ? `${foot[1]}/${foot[2]}` : "NO FOOT (-1)"} exit ${r.status}`);
  code = r.status;
} finally {
  for (const [file, pristine, want, bytes] of saved) {
    copyFileSync(pristine, file);
    const got = readFileSync(file);
    const same = digest(got) === want && Buffer.compare(got, readFileSync(pristine)) === 0 && got.length === bytes && bytes > 1000;
    console.log(`restored ${file.replace(SRC, "src/")}: ${got.length} B sha256 ${digest(got).slice(0, 12)}… ${same ? "IDENTICAL" : "MISMATCH"}`);
    if (!same) code = 4;
  }
  rmSync(dir, { recursive: true, force: true });
}
process.exit(code);
