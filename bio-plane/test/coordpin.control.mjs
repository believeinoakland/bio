#!/usr/bin/env node
/* M0-136's NEGATIVE CONTROL DRIVER — each suite that reads `coord` at the PIN (`./coordpin.mjs`) pointed BACK at the
 * live ref, alone, and its planted-ref arm must fail BY NAME.
 *
 *   node bio-plane/test/coordpin.control.mjs [unit ...]     (from the repo root; no unit = all five)
 *
 * WHAT EACH ARM DOES. It inserts one line after the suite's `./coordpin.mjs` import —
 * `process.env.BIO_COORD_REF = "origin/coord";` — which is exactly "the suite reads the live ref again": every coord read
 * in the suite, and every CLI it spawns, then resolves `origin/coord`. Declared before arming:
 *   MUST FAIL   "…reads the PINNED coord commit, never a ref name" and "…verdict is IDENTICAL whatever origin/coord
 *               holds" — the planted-ref arm, which now reads ABSENT, THE PIN and THE PLANTED COMMIT as three verdicts.
 *   MUST NOT    any other assertion (the suite's own arms passed over the live ref before M0-136, and still do while the
 *               live ref agrees with them), and the suite must reach its foot.
 * THE OVER-STRICTNESS ARM (S0). The same line naming the PIN'S OWN full id instead: a suite that spells its pin out
 * rather than taking the helper's must PASS, so the arm is keyed to WHAT is read, not to how the suite imports it.
 * Every restore is verified by sha256 AND `cmp` AND a floored byte count, against a per-arm pristine copy.
 */
import { readFileSync, writeFileSync, mkdtempSync, statSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { COORD_PIN } from "./coordpin.mjs";

/* Importing the helper set the override in THIS process; a suite must earn its pin itself, so no child inherits it. */
delete process.env.BIO_COORD_REF;
const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = mkdtempSync(join(tmpdir(), "coordpin-control-"));
const ANCHOR = 'import { plantedCoord, assertPlanted, REPO as PIN_REPO } from "./coordpin.mjs";';
const UNITS = { owed: /owed: (\d+) pass, (\d+) fail/, readbudget: /readbudget: (\d+) pass, (\d+) fail/,
  "op-claims": /op-claims: (\d+) pass, (\d+) fail/, decided: /decided: (\d+) pass, (\d+) fail/,
  mintid: /^(\d+) pass, (\d+) fail/m };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(UNITS);

let pass = 0, fail = 0;
const t = (label, got, exp) => {
  const ok = JSON.stringify(got) === JSON.stringify(exp);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(exp)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const run = (unit) => {
  const r = spawnSync(process.execPath, [join(REPO, `bio-plane/test/${unit}.test.mjs`)],
    { cwd: join(REPO, "bio-plane"), encoding: "utf8", maxBuffer: 1 << 28 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = out.match(UNITS[unit]);
  return { status: r.status, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1,
    failed: [...out.matchAll(/^\s*FAIL\s+(.+)$/gm)].map((x) => x[1]) };
};
const ARMS = [
  { id: "S0", line: `process.env.BIO_COORD_REF = "${COORD_PIN}";   /* M0-136 CONTROL: the pin spelled out */`, fails: false },
  { id: "L1", line: 'process.env.BIO_COORD_REF = "origin/coord";   /* M0-136 CONTROL: pointed back at the LIVE ref */', fails: true },
];
const MUST = ["reads the PINNED coord commit, never a ref name", "is IDENTICAL whatever origin/coord holds"];

for (const unit of want) {
  const SUITE = join(REPO, `bio-plane/test/${unit}.test.mjs`);
  console.log(`\n=== ${unit} ===`);
  const base = run(unit);
  t(`${unit} · BASELINE green and at its foot`, [base.status, base.fail, base.pass > 10], [0, 0, true]);
  for (const a of ARMS) {
    const pristine = join(PEN, `${unit}.${a.id}.pristine`);
    writeFileSync(pristine, readFileSync(SUITE));
    const P = { sha: sha(SUITE), bytes: statSync(SUITE).size };
    const src = readFileSync(SUITE, "utf8");
    const hits = src.split(ANCHOR).length - 1;
    t(`${unit} · ${a.id} ARMED (anchor matched exactly once)`, hits, 1);
    if (hits === 1) writeFileSync(SUITE, src.replace(ANCHOR, `${ANCHOR}\n${a.line}`));
    const s = run(unit);
    if (a.fails) {
      for (const m of MUST) t(`${unit} · ${a.id} FAILS BY NAME at "…${m}"`, s.failed.some((l) => l.includes(m)), true);
      t(`${unit} · ${a.id} ...and NOTHING ELSE fails (the arm moved one variable)`,
        s.failed.filter((l) => !MUST.some((m) => l.includes(m))), []);
      t(`${unit} · ${a.id} ...and the suite reached its foot to say so`, [s.status, s.pass > 10], [1, true]);
    } else {
      t(`${unit} · ${a.id} OVER-STRICTNESS: the pin spelled out in the suite still PASSES`, [s.status, s.fail], [0, 0]);
    }
    console.log(`  ${unit} · ${a.id}: exit ${s.status}, ${s.pass} pass / ${s.fail} fail`);
    writeFileSync(SUITE, readFileSync(pristine));
    const cmp = spawnSync("cmp", ["-s", SUITE, pristine]).status === 0;
    const size = statSync(SUITE).size;
    t(`${unit} · ${a.id} RESTORED (sha256 ${P.sha.slice(0, 8)}…, cmp identical, ${size} bytes >= 2000)`,
      [sha(SUITE) === P.sha, cmp, size === P.bytes && size >= 2000], [true, true, true]);
  }
}
rmSync(PEN, { recursive: true, force: true });
console.log(`\ncoordpin.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
