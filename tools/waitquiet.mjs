#!/usr/bin/env node
/* Wait until this machine is quiet enough to take a measurement — and DO NOT
 * MATCH YOURSELF while doing it.
 *
 * WHY THIS EXISTS, and it is a measured failure rather than a convenience.
 * Up to eight workers share one machine and one clone, so a worker that wants an
 * uncontended figure has to wait for other batteries to finish. Nothing supported
 * that, so workers hand-rolled it, and on 2026-08-09 three of them sat in
 *
 *     until ! pgrep -f "scripts/battery.mjs"; do sleep 10; done
 *
 * FOREVER. `pgrep -f` matches the FULL COMMAND LINE, and the waiter's own command
 * line contains the string it is searching for — so each loop found itself, slept,
 * and found itself again. The three also matched each other, which made the count
 * look like real work. There was no battery running at all: `workerd` was at zero.
 * They spun for hours after their item had already merged, and nothing noticed,
 * because a wait that cannot fail is indistinguishable from one that has not
 * finished yet.
 *
 * A RULE WOULD NOT HAVE FIXED THIS. `kickoffs/WORKER.md` records that the vigilance
 * fix was tried for `git stash` and for id allocation and failed both times; what
 * worked was `tools/mintid.mjs` — a command, not a warning. This is that shape
 * again: the brief now names this tool instead of describing the hazard.
 *
 * THE THREE PROPERTIES THAT MAKE IT CORRECT, each driven by
 * `bio-plane/test/waitquiet.test.mjs` rather than asserted here:
 *
 *   1. IT CANNOT MATCH ITSELF. It never greps a command line for a filename.
 *      It looks for what a battery IS — a `node` process whose argv runs
 *      `scripts/battery.mjs`, or a `workerd` a battery spawned — and it excludes
 *      its own pid, its whole ancestor chain, and anything running this file.
 *   2. IT IS BOUNDED. A wait that cannot give up cannot report that it gave up.
 *      On timeout it exits 2 and NAMES what it was still seeing.
 *   3. ITS NEGATIVE CONTROL IS A FLAG. `--check` answers once and prints the
 *      roster. Run it on a quiet machine: if it still reports busy, the predicate
 *      is broken and would never have released you. That control costs one command
 *      and is the one nobody ran.
 *
 * usage:
 *   node tools/waitquiet.mjs                 wait (default timeout 900s)
 *   node tools/waitquiet.mjs --timeout 300   wait, giving up after 300s
 *   node tools/waitquiet.mjs --check         answer once; 0 = quiet, 1 = busy
 */
import { execFileSync } from "node:child_process";

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(n); return i === -1 ? null : (argv[i + 1] ?? ""); };
const CHECK = argv.includes("--check");
const TIMEOUT_S = Number(flag("--timeout") ?? 900);
const POLL_MS = 3000;

/** Every pid from here to init, so the shell that invoked us is never counted. */
function ancestry() {
  const chain = new Set([process.pid]);
  let pid = process.pid;
  for (let hop = 0; hop < 40; hop++) {
    let ppid;
    try {
      ppid = Number(execFileSync("ps", ["-o", "ppid=", "-p", String(pid)], { encoding: "utf8" }).trim());
    } catch { break; }
    if (!ppid || ppid <= 1 || chain.has(ppid)) break;
    chain.add(ppid);
    pid = ppid;
  }
  return chain;
}

/* A battery is a NODE process whose FIRST ARGUMENT is scripts/battery.mjs, or a
   workerd one spawned. Both are things a waiter IS NOT — which is the point.
   THE TEST IS POSITIONAL, NOT A SUBSTRING, AND THAT IS THE WHOLE DESIGN.
   The executable must BE node and argv[1] must BE the battery path. A shell that
   merely MENTIONS `scripts/battery.mjs` somewhere in its command line — which is
   precisely what the three deadlocked waiters were — cannot satisfy that, because
   its executable is zsh and its argv[1] is `-c`.
   A substring test (`/\bnode\b[\s\S]*battery\.mjs/`) would pass this file's arms 1-3
   and still deadlock the first waiter whose command happens to contain the word
   `node`. Measured 2026-08-09: the first draft of this matcher anchored on
   `(^|\/)node` and was BLIND, because `ps` prints `<pid> node /path/...` and `node`
   is preceded by a SPACE. Arm 4 caught it — the over-strictness arm, in the
   direction that would have released a wait too early. */
const NODEISH = /^node(\d[\d.]*)?$/;
const base = (p) => p.slice(p.lastIndexOf("/") + 1);

/** Is this process THIS tool? argv[1] must BE the tool, not merely mention it. */
export function isWaiter(cmd) {
  const argv = cmd.trim().split(/\s+/);
  if (!argv.length) return false;
  if (!NODEISH.test(base(argv[0]))) return false;
  return argv.length > 1 && /(^|\/)tools\/waitquiet\.mjs$/.test(argv[1]);
}

export function classify(cmd) {
  const argv = cmd.trim().split(/\s+/);
  if (!argv.length) return false;
  const exe = base(argv[0]);
  if (NODEISH.test(exe)) return argv.length > 1 && /(^|\/)scripts\/battery\.mjs$/.test(argv[1]);
  return exe === "workerd";
}

export function busyProcesses() {
  let out = "";
  try { out = execFileSync("ps", ["-eo", "pid=,command="], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }); }
  catch { return []; }
  const mine = ancestry();
  const found = [];
  for (const line of out.split("\n")) {
    const m = /^\s*(\d+)\s+(.*)$/.exec(line);
    if (!m) continue;
    const pid = Number(m[1]), cmd = m[2];
    if (mine.has(pid)) continue;                 // never ourselves or our shell
    /* Never another waiter — and POSITIONALLY, for the reason this whole file
       exists. A substring test here (`cmd.includes("waitquiet")`) was the first
       draft and it was WRONG IN THE SAME WAY as the defect being fixed: arm 4's
       fixture lives under a temp directory named `waitquiet-arm4-…`, so the
       exclusion swallowed the very process the arm had just started, and the tool
       read BLIND. Caught 2026-08-09 by arm 4, in the line written to prevent it. */
    if (isWaiter(cmd)) continue;
    if (classify(cmd)) found.push({ pid, cmd: cmd.slice(0, 100) });
  }
  return found;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const t0 = Date.now();
  if (CHECK) {
    const busy = busyProcesses();
    console.log(busy.length
      ? `BUSY: ${busy.length} process(es)\n` + busy.map((b) => `  ${b.pid}  ${b.cmd}`).join("\n")
      : "QUIET: no battery and no workerd running (excluding this process and its ancestors)");
    process.exit(busy.length ? 1 : 0);
  }
  let last = -1;
  for (;;) {
    const busy = busyProcesses();
    if (!busy.length) {
      console.log(`quiet after ${Math.round((Date.now() - t0) / 1000)}s`);
      process.exit(0);
    }
    if (busy.length !== last) {
      console.log(`waiting: ${busy.length} running — ${busy.map((b) => b.pid).join(", ")}`);
      last = busy.length;
    }
    if ((Date.now() - t0) / 1000 > TIMEOUT_S) {
      console.error(`GAVE UP after ${TIMEOUT_S}s, still seeing ${busy.length}:`);
      for (const b of busy) console.error(`  ${b.pid}  ${b.cmd}`);
      console.error("A wait that cannot give up cannot report that it gave up. This is that report.");
      process.exit(2);
    }
    await new Promise((r) => setTimeout(r, POLL_MS));
  }
}
