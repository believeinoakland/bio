// UI-59 harness, third instrument: for each UI id, the commits that touched
// civicos-ui/, split into SURFACE files (what a member sees) and HARNESS files
// (civicos-ui/test/**). The split is what decides whether an item owes a ledger
// entry: an item that moved only the harness is a measurement, and the brief's
// over-strictness arm says a measurement is NOT required to have one.
import { execFileSync } from "node:child_process";

const ROOT = "/Users/sparky/ClaudeCodeBIO/bio/.claude/worktrees/agent-a4ad9b33f45a32657";
const git = (a) => execFileSync("git", ["-C", ROOT, ...a], { encoding: "utf8", maxBuffer: 1 << 28 });

const log = git(["log", "--format=%H|%h|%ad|%s", "--date=short"]).split("\n").filter(Boolean)
  .map((l) => { const [full, short, date, ...r] = l.split("|"); return { full, short, date, subj: r.join("|") }; });

const cache = new Map();
const filesOf = (sha) => {
  if (!cache.has(sha)) cache.set(sha, git(["show", "--format=", "--name-only", sha]).split("\n").filter(Boolean));
  return cache.get(sha);
};

const IDS = [];
for (let n = 1; n <= 62; n++) IDS.push(`UI-${n}`);
IDS.push("UI-17a");

for (const id of IDS) {
  const n = id.slice(3);
  const re = new RegExp(`(^|[^0-9A-Za-z-])UI-${n}([^0-9A-Za-z]|$)`, "i");
  const hits = [];
  for (const c of log) {
    if (!re.test(c.subj)) continue;
    const files = filesOf(c.full).filter((f) => f.startsWith("civicos-ui/"));
    if (!files.length) continue;
    const surface = files.filter((f) => !f.startsWith("civicos-ui/test/"));
    const harness = files.filter((f) => f.startsWith("civicos-ui/test/"));
    hits.push({ ...c, surface, harness });
  }
  if (!hits.length) { console.log(`${id}\tNO-SURFACE-COMMIT`); continue; }
  const anySurface = hits.some((h) => h.surface.length);
  console.log(`${id}\t${anySurface ? "SURFACE" : "HARNESS-ONLY"}`);
  for (const h of hits) {
    console.log(`   ${h.short} ${h.date} | ${h.subj}`);
    if (h.surface.length) console.log(`      surface: ${h.surface.map((f) => f.replace("civicos-ui/", "")).join(", ")}`);
    if (h.harness.length) console.log(`      harness: ${h.harness.map((f) => f.replace("civicos-ui/test/", "")).join(", ")}`);
  }
}
