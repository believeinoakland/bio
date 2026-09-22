import fs from "node:fs";
import { execSync } from "node:child_process";
const p = "docs/development/QUEUE.md";
const L = fs.readFileSync(p, "utf8").split("\n");
const a = L.findIndex((l) => l.startsWith("<<<<<<< ")), m = L.indexOf("======="), z = L.findIndex((l) => l.startsWith(">>>>>>> "));
const up = L.slice(a + 1, m), ours = L.slice(m + 1, z);
if (ours.length !== 1 || !ours[0].startsWith("### M0-99 · queued — ")) throw new Error("ours shape");
const last = up[up.length - 1];
if (!last.startsWith("### M0-99 · running — ")) throw new Error("upstream's last line is not M0-99's running heading");
// the four rows upstream still lists must be exactly the rows as they stood at the completion's base (only archived since)
const base = execSync("git show 9d330478:docs/development/QUEUE.md", { encoding: "utf8" });
const removed = up.slice(0, -1).join("\n").replace(/\n+$/, "");
if (!base.includes(removed)) throw new Error("upstream changed one of the four archived rows — carry by hand");
const out = [...L.slice(0, a), last, ...L.slice(z + 1)];
fs.writeFileSync(p, out.join("\n"));
console.log("kept the archive's removals; carried M0-99's running heading");
