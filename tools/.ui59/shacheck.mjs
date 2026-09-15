// UI-59: every backtick-wrapped short sha in the backfill must resolve to a real
// commit in this repository. A ledger entry naming a commit that does not exist is
// worse than one naming none — it reads as a receipt.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const ROOT = "/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-a4ad9b33f45a32657";
const text = readFileSync(`${ROOT}/docs/development/CIVICOS_UI_STATE.md`, "utf8");
// only the backfill region: from the top down to the 2026-08-04 amendment
const region = text.split("> **Amendment, 2026-08-04")[0];
const shas = [...new Set([...region.matchAll(/`([0-9a-f]{7})`/g)].map((m) => m[1]))];
if (!shas.length) { console.error("FATAL: no shas found — refusing to report clean over an empty set"); process.exit(2); }

let bad = 0;
for (const s of shas) {
  try {
    const t = execFileSync("git", ["-C", ROOT, "cat-file", "-t", s], { encoding: "utf8" }).trim();
    if (t !== "commit") { console.log(`  NOT A COMMIT  ${s} -> ${t}`); bad++; }
  } catch {
    console.log(`  UNRESOLVABLE  ${s}`);
    bad++;
  }
}
console.log(`shas cited in the backfill: ${shas.length}; unresolvable or non-commit: ${bad}`);
process.exit(bad ? 1 : 0);
