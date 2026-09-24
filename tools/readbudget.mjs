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
/* M0-110: the handoffs (`*-NEXT.md`) live on `coord` after the cutover — listed and measured through the layer. */
import { listState, readState } from "./coord.mjs";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const BUDGET = {
  "CLAUDE.md": 16 * 1024,
  kickoff: 24 * 1024,
  next: 12 * 1024,
  /* The construct map (BOB #16, 2026-09-19): read whole by BOB, SCHEDULER and CONDUCT. Denser than a kickoff, so its
     own budget, set above its 45 KB size with room for a row per construct, and armed from the day it is set. */
  /* 48 KiB -> 50 KiB (c19-unionfix stopgap, BOB #32 ruling (a), 2026-09-24 02:10Z) -> BACK TO 48 KiB with (b): status.mjs caps
     each cell's first sentence at CELL_CAP (240) at a word boundary, so the map read 44,617 B at 130 claims on 548eb2c5. */
  map: 48 * 1024,
};

/* A WORD budget for one file, on top of its class's byte budget (M0-194, BOB #34 2026-09-24 22:50Z): WORKER.md, read by
   every worker, was cut to one line per rule at HALF its 3,959 words, 1,979. The ruling set it in words, so it is
   measured in words (whitespace-separated, as `wc -w` counts), and the byte budget still applies beside it. */
export const WORD_BUDGET = { "docs/development/kickoffs/WORKER.md": 1979 };

/* Files whose cut has landed, by repo-relative path: over budget again is a FAIL, not a WARN. */
export const CUT = new Set(["CLAUDE.md", "docs/development/kickoffs/BOB.md", "docs/development/kickoffs/CONDUCT.md",
                            "docs/development/ORCHESTRATION.md", "docs/architecture/BIO_System_Design.md",
                            "docs/development/VERIFICATION.md", "docs/development/kickoffs/WORKER.md"]);

/* Read-whole documents outside the kickoffs directory. */
export const READ_WHOLE_DOCS = ["docs/development/ORCHESTRATION.md", "docs/development/VERIFICATION.md"];
export const MAP = "docs/architecture/BIO_System_Design.md";

export function readSet(root = ROOT) {
  const kdir = join(root, "docs/development/kickoffs");
  const out = [{ file: "CLAUDE.md", key: "CLAUDE.md", budget: BUDGET["CLAUDE.md"] }];
  /* Process documents every lane reads whole (BOB #16, 2026-09-19, BOB-NEXT §3 item 2): the kickoff budget. */
  for (const f of READ_WHOLE_DOCS) if (existsSync(join(root, f))) out.push({ file: f, key: "kickoff", budget: BUDGET.kickoff });
  if (existsSync(join(root, MAP))) out.push({ file: MAP, key: "map", budget: BUDGET.map });
  if (existsSync(kdir))
    for (const f of listState(root, "docs/development/kickoffs")) {
      if (!f.endsWith(".md") || f === "README.md") continue;
      const key = f.endsWith("-NEXT.md") ? "next" : "kickoff";
      out.push({ file: `docs/development/kickoffs/${f}`, key, budget: BUDGET[key] });
    }
  return out;
}

export function check(root = ROOT, { budget = BUDGET, cut = CUT, words = WORD_BUDGET } = {}) {
  const over = [];
  for (const r of readSet(root)) {
    const text = readState(root, r.file);
    if (text === null) continue;
    /* ONE assignment of a file to its budget: readSet's KEY, looked up in the budget passed in (so a control can lower
       it). This line used to recompute the class from the filename, a second spelling that gave every file outside
       CLAUDE.md / kickoffs its kickoff budget whatever readSet said (found 2026-09-19 when the map was added). */
    const b = budget[r.key];
    const bytes = Buffer.byteLength(text, "utf8");
    if (bytes > b) over.push({ file: r.file, bytes, budget: b,
                               verdict: cut.has(r.file) ? "FAIL" : "WARN" });
    const w = words[r.file];
    if (w !== undefined) {
      const n = text.split(/\s+/).filter(Boolean).length;
      if (n > w) over.push({ file: r.file, words: n, budget: w, unit: "words",
                             verdict: cut.has(r.file) ? "FAIL" : "WARN" });
    }
  }
  return over.sort((a, b) => (b.bytes ?? 0) - (a.bytes ?? 0));
}

if (process.argv[1] && process.argv[1].endsWith("readbudget.mjs")) {
  const over = check();
  for (const o of over)
    console.log(o.unit === "words" ? `${o.verdict}  ${o.file} is ${o.words} words against ${o.budget} words`
                                   : `${o.verdict}  ${o.file} is ${o.bytes} B against ${o.budget} B`);
  console.log(`readbudget: ${readSet().length} read-whole file(s), ${over.length} over budget, `
            + `${over.filter((o) => o.verdict === "FAIL").length} failing`);
  process.exit(over.some((o) => o.verdict === "FAIL") ? 1 : 0);
}
