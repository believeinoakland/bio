// SCHEDULER #13: D-278's design line leads with its governed home, so the cut row keeps it (plancheck ROW NAMES NO DESIGN).
// Rewrites the line in the cut archive's «D-278» block and re-derives the cut row's truncated line by place13's rule.
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const REPO = resolve(process.argv[2]);
const WRITE = process.argv.includes("--write");
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const OLD = "design: `docs/development/INTERFACES.md` I3's **Answers** bullet (BOB #26's PROVISIONAL ruling of 2026-09-22), with DEC-49 as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it.";
const NEW = "design: DEC-49 as `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` rule 10 restates it (every condition has a named code and a canned translation), with `docs/development/INTERFACES.md` I3's **Answers** bullet (BOB #26's PROVISIONAL per-group ruling of 2026-09-22).";
const TAIL = " … (whole text: the cut archive)";
const sectionQuoteOpen = (s) => { const i = s.lastIndexOf('§"'); return i >= 0 && s.indexOf('"', i + 2) < 0; };
const balanced = (s) => ((s.match(/`/g) || []).length % 2 === 0)
  && ((s.match(/\*"/g) || []).length === (s.match(/"\*/g) || []).length) && !sectionQuoteOpen(s)
  && ((s.match(/"/g) || []).length % 2 === 0);
function trunc(line, max) {
  if (line.length <= max + TAIL.length) return line;
  let cut = line.lastIndexOf(" ", max);
  while (cut > 20) {
    let head = line.slice(0, cut).replace(/[\s,;:—–-]+$/, "");
    if (balanced(head)) { if ((head.match(/\*\*/g) || []).length % 2 === 1) head += "**"; return head + TAIL; }
    cut = line.lastIndexOf(" ", cut - 1);
  }
  fail("cannot truncate");
}
const once = (s, a, b, what) => { const n = s.split(a).length - 1; if (n !== 1) fail(`${what}: ${n}`); return s.replace(a, () => b); };
const CF = join(REPO, "docs/archive/ledgers/QUEUE-cut-2026-09-22.md");
const BF = join(REPO, "docs/development/BACKLOG.md");
let c = readFileSync(CF, "utf-8"), b = readFileSync(BF, "utf-8");
c = once(c, "> " + OLD + "\n", "> " + NEW + "\n", "archive line");
const oldCut = trunc(OLD, 110), newCut = trunc(NEW, 110);
b = once(b, "\n" + oldCut + "\n", "\n" + newCut + "\n", "backlog cut line");
if (!/BIO_Assistant_and_AI_Roles_v0_1\.md/.test(newCut)) fail("governed doc lost in the cut line");
console.log("cut line:", newCut);
if (WRITE) { writeFileSync(CF, c); writeFileSync(BF, b); console.log("WRITTEN"); }
