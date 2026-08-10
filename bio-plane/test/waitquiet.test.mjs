/* NEGATIVE CONTROL: driven, and driven against the PREDICATE rather than against
   the machine — which is itself a correction this suite earned.
   Its first version asserted `--check` reads QUIET. That passed alone and FAILED
   INSIDE THE BATTERY, because during a full run there are eight suites and a
   crowd of workerd processes, so the machine is legitimately busy. It was
   asserting a property of the MACHINE while running on a contended one: green in
   isolation, red in company, and the reverse of the usual stale-figure hazard.
   The arms now test what the tool DECIDES, on command lines supplied to it, which
   is deterministic under any load. One live arm still drives a real process,
   asserted BY PID rather than by an empty roster, so it cannot be disturbed by
   whatever else is running.
   ARMS: (1) the three deadlocked shapes are NOT batteries · (2) THE REGRESSION —
   a shell whose command line contains `scripts/battery.mjs` is not a battery ·
   (3) proves arm 2 is armed: the OLD substring predicate DOES match those shapes ·
   (4) over-strictness, a real battery-shaped command IS a battery, and a live
   process is found BY PID (the direction that would release a wait too early) ·
   (5) the tool excludes ITSELF positionally, including from a path that merely
   contains its own name — the bug its first draft shipped. */
import { spawn } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import "./sandbox.mjs";
import { classify, isWaiter, busyProcesses } from "../../tools/waitquiet.mjs";

let pass = 0, fail = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) console.log(`        got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
};

console.log("\n--- waitquiet: a wait that can fail, and cannot match itself ---");

/* The three real command lines that deadlocked on 2026-08-09, verbatim in shape. */
const DEADLOCKED = [
  `/bin/zsh -c eval 'until ! pgrep -f "scripts/battery.mjs" >/dev/null 2>&1; do sleep 10; done; echo DONE'`,
  `/bin/zsh -c until ! pgrep -f "scripts/battery.mjs"; do sleep 15; done; grep -E "suites green" out.txt`,
  `/bin/sh -c while pgrep -f scripts/battery.mjs; do sleep 20; done && node scripts/battery.mjs`,
];

t("ARM 1: none of the three deadlocked waiter shapes is classified as a battery",
  DEADLOCKED.map(classify), [false, false, false]);

t("ARM 2 (REGRESSION): a shell whose command line CONTAINS `scripts/battery.mjs` is not a "
  + "battery — the executable is a shell and argv[1] is `-c`, and the test is POSITIONAL",
  classify(`/bin/zsh -c node tools/x.mjs # scripts/battery.mjs`), false);

/* Arm 2 is only meaningful if the old predicate really did match these. */
const OLD = (cmd) => cmd.includes("scripts/battery.mjs");
t("ARM 3 (proves ARM 2 is armed): the OLD substring predicate matches all three deadlocked "
  + "shapes — the defect is reproduced here, not described",
  DEADLOCKED.map(OLD), [true, true, true]);

/* ARM 4 — over-strictness, in the direction that releases a wait too early. */
{
  const real = [
    "node /repo/bio-plane/scripts/battery.mjs",
    "/opt/homebrew/bin/node /a/b/scripts/battery.mjs hygiene",
    "/usr/local/bin/workerd serve --socket-addr",
  ];
  t("ARM 4a (over-strictness): real battery-shaped and workerd command lines ARE classified busy",
    real.map(classify), [true, true, true]);

  const dir = mkdtempSync(join(tmpdir(), "wq-live-"));
  mkdirSync(join(dir, "scripts"), { recursive: true });
  const stub = join(dir, "scripts", "battery.mjs");
  writeFileSync(stub, "setTimeout(() => {}, 20000);\n");
  const child = spawn("node", [stub], { detached: true, stdio: "ignore" });
  try {
    await new Promise((r) => setTimeout(r, 900));
    const pids = busyProcesses().map((b) => b.pid);
    t("ARM 4b (live, asserted BY PID so other suites' load cannot disturb it): a REAL "
      + "battery-shaped process is found",
      pids.includes(child.pid), true);
  } finally {
    try { process.kill(-child.pid); } catch { try { child.kill(); } catch {} }
    rmSync(dir, { recursive: true, force: true });
  }
}

/* ARM 5 — the tool must exclude ITSELF, and positionally. Its first draft used
   `cmd.includes("waitquiet")`, which swallowed a fixture living under a directory
   named `waitquiet-arm4-…` and made the tool read blind. */
{
  t("ARM 5a: the tool recognises itself positionally",
    isWaiter("node /repo/tools/waitquiet.mjs --check"), true);
  t("ARM 5b: a battery running from a path that merely CONTAINS the tool's name is NOT the "
    + "tool — the substring exclusion that shipped in the first draft read blind here",
    [isWaiter("node /tmp/waitquiet-arm4-xyz/scripts/battery.mjs"),
     classify("node /tmp/waitquiet-arm4-xyz/scripts/battery.mjs")],
    [false, true]);
}

console.log(`\nwaitquiet: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
