// Carry BOTH sides of a tail-append conflict in CLAIMS.md: upstream's (HEAD) block, a blank line, then ours.
import fs from "node:fs";
const p = "docs/development/CLAIMS.md";
const s = fs.readFileSync(p, "utf8");
const lines = s.split("\n");
const a = lines.findIndex((l) => l.startsWith("<<<<<<< "));
const m = lines.findIndex((l) => l === "=======");
const b = lines.findIndex((l) => l.startsWith(">>>>>>> "));
if (a < 0 || m < a || b < m) throw new Error("markers not found in order");
if (lines.filter((l) => /^(<<<<<<<|>>>>>>>) /.test(l) || l === "=======").length !== 3) throw new Error("more than one conflict");
const theirs = lines.slice(a + 1, m);   // HEAD = upstream during a rebase
const ours = lines.slice(m + 1, b);
const trim = (arr) => { while (arr.length && arr[arr.length - 1] === "") arr.pop(); return arr; };
const merged = [...lines.slice(0, a), ...trim(theirs), "", ...ours, ...lines.slice(b + 1)];
fs.writeFileSync(p, merged.join("\n"));
console.log("carried: upstream", theirs.length, "lines; ours", ours.length, "lines");
