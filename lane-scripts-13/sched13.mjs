// SCHEDULER #13: kickoffs/SCHEDULER.md — M0-99's DELEGATION item 9 (two DECIDED.md sentences its landing made false),
// and the durable mechanics SCHEDULER #12's handoff said lived nowhere but the handoff (ORCHESTRATION.md, "WHICH OF THE TWO").
// Usage: node sched13.mjs <repo> [--write]
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
const REPO = resolve(process.argv[2]);
const WRITE = process.argv.includes("--write");
const P = join(REPO, "docs/development/kickoffs/SCHEDULER.md");
const fail = (m) => { console.error("ABORT: " + m); process.exit(1); };
const once = (s, a, b, what) => { const n = s.split(a).length - 1; if (n !== 1) fail(`${what}: ${n} occurrences`); return s.replace(a, () => b); };
let t = readFileSync(P, "utf-8");
const before = Buffer.byteLength(t);
t = once(t, "`docs/DECIDED.md` conflicts are regenerated,\n  never merged; the push guard refuses a stale one.",
  "`docs/DECIDED.md` is not committed (M0-99,\n  2026-09-22): a pre-M0-99 side's copy is dropped, so take the deletion (corrected by SCHEDULER #13).", "sentence 1");
t = once(t, "`docs/DECIDED.md` is regenerated, never merged. This bit",
  "`docs/DECIDED.md` is not committed (M0-99): take the deletion. This bit", "sentence 2");
const ADD = `- **THE PUSH GUARD REFUSES A COMMIT WHOSE TREE CARRIES A RED GATE RECORD, ON ANY REF** (SCHEDULER #12, 2026-09-22): a
  drafts-branch push of it is refused too. Park work from a RED tree as a \`format-patch\` on a drafts branch, and read a
  push's result before any reset (a chained reset once left a commit recoverable only from the reflog).
- **\`mintid.test\` FAILS WHEN A CORPUS FILE NAMES AN ID ABOVE ITS NAMESPACE'S HIGHEST ALLOCATION SITE** (a \`### <ID> ·\`
  heading, a \`| D-n |\` row, an \`## M-n ·\` entry; SCHEDULER #12): mint only what you place in the same landing, and draft
  a row under a placeholder id until then.
- **A ROW OR A SUITE CITED ON \`main\` CAN EXIST ONLY ON AN UNMERGED BRANCH** (SCHEDULER #12 and #13, 2026-09-22): \`main\`
  cited D-278 seven times while its row lived on \`484ed359\`, and BOB #26's ruling names \`d270-reach.test.mjs\`, which
  \`main\` holds as \`d270-refusal-truth.test.mjs\`. \`ledger.mjs find\` answering "not found" and \`git ls-files\` are the
  checks: carry the row verbatim, and name the file \`main\` has.
- **THE LANE'S SCRIPTS LIVE ON A DRAFTS BRANCH, NEVER ON \`main\`** (\`origin/scheduler<N>/row-drafts\`, \`lane-scripts/\`):
  the placement with the balanced foot cut, the DEBT doors, the inbox drain. A held landing is REGENERATED on the current
  tree by its scripts, never applied as a stale patch. **A landing's order** (SCHEDULER #13): the \`done\` words and
  \`archive\` each; place the new rows WITHOUT cutting; \`refill\`; THEN cut the foot to budget, since a cut before the
  refill spends a product row's text on bytes the refill frees; then the drains, the DEBT doors, and \`archive\` those.

`;
t = once(t, "\n## Checks before every push\n", "\n" + ADD + "## Checks before every push\n", "checks heading");
t = t.replace(/\n\n\n## Checks before every push/, "\n\n## Checks before every push");
console.log("SCHEDULER.md", before, "->", Buffer.byteLength(t));
if (WRITE) { writeFileSync(P, t); console.log("WRITTEN"); }
