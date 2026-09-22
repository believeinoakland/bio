// Read-only: D-398 condition 2 for a predecessor's worktree — is its tree clean, and what is its HEAD?
import { execFileSync } from "node:child_process";
const wt = process.argv[2];
const run = (args) => execFileSync("git", args, { cwd: wt, encoding: "utf8" });
const status = run(["status", "--porcelain", "--untracked-files=all"]);
const head = run(["rev-parse", "HEAD"]).trim();
const lines = status.split("\n").filter(Boolean);
console.log(`worktree ${wt}`);
console.log(`HEAD ${head}`);
console.log(`porcelain lines: ${lines.length}`);
for (const l of lines.slice(0, 20)) console.log(`  ${l}`);
