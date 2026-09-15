// UI-59 harness, second instrument: the INVERSE of inventory.mjs. Rather than
// asking "which commits does each UI id own", it asks "which commits touched a
// member surface, and does any UI id claim them" — so a surface change that
// landed under another area's id cannot be scored zero by silence.
import { execFileSync } from "node:child_process";

const ROOT = "/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-a4ad9b33f45a32657";
const git = (a) => execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf8", maxBuffer: 1 << 28 });

// every commit since v33's date that touched a member surface
const commits = git([
  "log", "--since=2026-07-31", "--format=%h|%ad|%s", "--date=short", "--", "civicos-ui/",
]).split("\n").filter(Boolean).map((l) => {
  const [short, date, ...rest] = l.split("|");
  return { short, date, subj: rest.join("|") };
});

const named = [];
const unnamed = [];
for (const c of commits) {
  const m = c.subj.match(/(^|[^0-9A-Za-z-])(UI-\d+[a-z]?)/i);
  if (m) named.push({ ...c, id: m[2].toUpperCase() });
  else unnamed.push(c);
}

console.log(`commits touching civicos-ui/ since 2026-07-31: ${commits.length}`);
console.log(`  naming a UI id in the subject: ${named.length}`);
console.log(`  naming NO UI id in the subject: ${unnamed.length}`);
console.log("");
console.log("--- SURFACE COMMITS THAT NAME NO UI ITEM (my matcher cannot attribute these) ---");
for (const c of unnamed) console.log(`  ${c.short} ${c.date} ${c.subj}`);
console.log("");
const ids = [...new Set(named.map((c) => c.id))].sort(
  (a, b) => Number(a.replace(/\D+/g, "")) - Number(b.replace(/\D+/g, "")),
);
console.log(`--- DISTINCT UI IDS OWNING A SURFACE COMMIT (${ids.length}) ---`);
console.log(ids.join(" "));
