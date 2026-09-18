/* readbudget — the files every session must READ WHOLE, and the size each may not exceed.
 *
 * RULED BY BOB 2026-09-18, asked of the short CLAUDE.md: does it meet all requirements *"including
 * cutting down the size of other files of the record to a managable size so that every session can
 * read/know them in their entirety rather than just scan them?"* Measured that day: CLAUDE.md 44.5 KB,
 * kickoffs/CONDUCT.md 95 KB, BOB.md 41 KB, and ledgers of 0.8–1.3 MB that sessions were told to read.
 * A session that cannot read its required reading reads SOME of it, and the rest of the record is
 * invisible to it while it believes it has read it — the failure `CLAUDE.md` §1 exists to prevent.
 *
 * THE RULE THIS ENFORCES (`CLAUDE.md` §1, *the reading budget*): a file is either READ WHOLE or LOOKED
 * UP, never half of each. The read-whole set is this file's list. Everything else — measurements,
 * interface changes, released claims, closed debt — is reached through a tool by id or subject.
 *
 * THE BUDGETS, and why these numbers: CLAUDE.md + a kickoff + its -NEXT handoff is ~52 KB, about 13k
 * tokens, so a session can hold its whole required reading with the rest of its context free for the
 * work. `QUEUE.md`'s budget is NOT here: `tools/ledger.mjs` already owns it (LED-4), and a second
 * producer of one quantity is the defect BOB.md rule 7 names.
 *
 * WARN UNTIL CUT, THEN FAIL — the same arming `ledger.mjs` uses, and for the same reason: an arm that
 * fails the day it lands blocks every lane on a cut only one lane can make. A file listed in `CUT` is
 * past its cut, and exceeding its budget again FAILS.
 *
 * NEGATIVE CONTROL: `node bio-plane/test/readbudget.test.mjs` — arm (a) lowers a budget below a file's
 * size and the file must be NAMED; arm (b) marks an over-budget file as cut and the verdict must be FAIL.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const BUDGET = {
  "CLAUDE.md": 16 * 1024,
  kickoff: 24 * 1024,
  next: 12 * 1024,
};

/* Files whose cut has landed, by repo-relative path: over budget again is a FAIL, not a WARN. */
export const CUT = new Set(["CLAUDE.md"]);

export function readSet(root = ROOT) {
  const kdir = join(root, "docs/development/kickoffs");
  const out = [{ file: "CLAUDE.md", budget: BUDGET["CLAUDE.md"] }];
  if (existsSync(kdir))
    for (const f of readdirSync(kdir).sort()) {
      if (!f.endsWith(".md") || f === "README.md") continue;
      out.push({ file: `docs/development/kickoffs/${f}`,
                 budget: f.endsWith("-NEXT.md") ? BUDGET.next : BUDGET.kickoff });
    }
  return out;
}

export function check(root = ROOT, { budget = BUDGET, cut = CUT } = {}) {
  const over = [];
  for (const r of readSet(root)) {
    const p = join(root, r.file);
    if (!existsSync(p)) continue;
    const b = r.file === "CLAUDE.md" ? budget["CLAUDE.md"]
            : r.file.endsWith("-NEXT.md") ? budget.next : budget.kickoff;
    const bytes = readFileSync(p).length;
    if (bytes > b) over.push({ file: r.file, bytes, budget: b,
                               verdict: cut.has(r.file) ? "FAIL" : "WARN" });
  }
  return over.sort((a, b) => b.bytes - a.bytes);
}

if (process.argv[1] && process.argv[1].endsWith("readbudget.mjs")) {
  const over = check();
  for (const o of over)
    console.log(`${o.verdict}  ${o.file} is ${o.bytes} B against ${o.budget} B`);
  console.log(`readbudget: ${readSet().length} read-whole file(s), ${over.length} over budget, `
            + `${over.filter((o) => o.verdict === "FAIL").length} failing`);
  process.exit(over.some((o) => o.verdict === "FAIL") ? 1 : 0);
}
