// UI-59 harness: inventory every UI-<n> item's landing commits and whether they
// touched a member surface under civicos-ui/. Runs inside this worktree only.
import { execFileSync } from "node:child_process";

const ROOT = "/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-a4ad9b33f45a32657";
const git = (args) =>
  execFileSync("git", ["-C", ROOT, ...args], { encoding: "utf8", maxBuffer: 1 << 28 });

const log = git(["log", "--format=%H|%h|%ad|%s", "--date=short"])
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    const [full, short, date, ...rest] = l.split("|");
    return { full, short, date, subj: rest.join("|") };
  });

const filesCache = new Map();
const filesOf = (sha) => {
  if (!filesCache.has(sha)) {
    filesCache.set(
      sha,
      git(["show", "--format=", "--name-only", sha]).split("\n").filter(Boolean),
    );
  }
  return filesCache.get(sha);
};

const MAX = Number(process.argv[2] || 62);
const report = [];
for (let n = 1; n <= MAX; n++) {
  const id = `UI-${n}`;
  // Case-INSENSITIVE: `a63c1b5` spells it `ui-54` in lower case, and a
  // case-sensitive matcher scored that item zero — found by the over-strictness
  // arm, not by the subject. The trailing class excludes a digit AND a letter so
  // `UI-17` does not swallow `UI-17a`.
  const re = new RegExp(`(^|[^0-9A-Za-z-])UI-${n}([^0-9A-Za-z]|$)`, "i");
  const rows = log
    .filter((c) => re.test(c.subj))
    .map((c) => {
      const files = filesOf(c.full);
      return {
        ...c,
        ui: files.filter((f) => f.startsWith("civicos-ui/")),
        nFiles: files.length,
      };
    });
  report.push({ id, n, rows });
}

for (const { id, rows } of report) {
  if (!rows.length) {
    console.log(`${id}\tNO-COMMIT-NAMES-IT`);
    continue;
  }
  const touching = rows.filter((r) => r.ui.length);
  console.log(`${id}\t${rows.length} commit(s), ${touching.length} touching civicos-ui/`);
  for (const r of rows) {
    console.log(`   ${r.short} ${r.date} ui:${r.ui.length}/${r.nFiles} ${r.subj}`);
    if (r.ui.length) console.log(`        ${r.ui.join(" ")}`);
  }
}
