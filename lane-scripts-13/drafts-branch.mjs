// SCHEDULER #13: build `scheduler13/row-drafts` from files in this scratchpad WITHOUT touching any working tree or index
// (hash-object, mktree, commit-tree), parented on origin/scheduler12/row-drafts so its history is kept. Prints the commit.
// Usage: node drafts-branch.mjs <repo>   (then push <sha>:refs/heads/scheduler13/row-drafts in its own call)
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const REPO = resolve(process.argv[2]);
const S = dirname(fileURLToPath(import.meta.url));
const git = (args, input) => execFileSync("git", args, { cwd: REPO, encoding: "utf8", input }).trim();
const blob = (p) => git(["hash-object", "-w", p]);
const tree = (entries) => git(["mktree"], entries.map(([mode, type, sha, name]) => `${mode} ${type} ${sha}\t${name}`).join("\n") + "\n");
const scripts = ["place13.mjs", "land13.mjs", "m0110.mjs", "sched13.mjs", "fix278.mjs", "drafts-branch.mjs", "wtclean.mjs"];
const drafts = readdirSync(S).filter((f) => /^new-(M0-11[456]|D-278|D-148|D-149)\.md$/.test(f)).sort();
const sTree = tree(scripts.map((f) => ["100644", "blob", blob(join(S, f)), f]));
const dTree = tree(drafts.map((f) => ["100644", "blob", blob(join(S, f)), f]));
const parent = git(["rev-parse", "origin/scheduler12/row-drafts"]);
const base = git(["rev-parse", `${parent}^{tree}`]);
const baseEntries = git(["ls-tree", base]).split("\n").filter(Boolean).map((l) => {
  const [meta, name] = l.split("\t"); const [mode, type, sha] = meta.split(" "); return [mode, type, sha, name];
}).filter((e) => e[3] !== "lane-scripts-13" && e[3] !== "row-drafts-13");
const root = tree([...baseEntries, ["040000", "tree", sTree, "lane-scripts-13"], ["040000", "tree", dTree, "row-drafts-13"]]);
const msg = "scheduler #13: the lane scripts of this session and the drafts it placed (never merged) — lane-scripts-13/ (place13 with --place and --cut apart, land13, m0110, sched13, fix278) beside SCHEDULER #12's lane-scripts/; row-drafts-13/ the full drafts of M0-114, M0-115, M0-116, D-278, D-148 and D-149 as placed\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\n";
const commit = git(["commit-tree", root, "-p", parent, "-F", "-"], msg);
console.log(commit);
