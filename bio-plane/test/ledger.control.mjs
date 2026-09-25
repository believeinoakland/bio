#!/usr/bin/env node
/* LED-2's and LED-6's NEGATIVE CONTROL DRIVER — one arm per property, CONSERVATION FIRST, plus a baseline.
 *
 *   node bio-plane/test/ledger.control.mjs        (from the repo root)
 *
 * Each arm patches ONE property of the subject (`tools/ledger.mjs`, `tools/owed.mjs` or
 * `tools/mintid.mjs`), requires the patch to match EXACTLY ONCE per site (an arm that did not arm
 * is a finding), runs `ledger.test.mjs`, and requires the suite to go RED with its tally printed
 * AND with the named assertion among the failures — a red suite that failed for some other reason
 * is the arm-that-fired-at-the-wrong-thing class, and is scored as a FAILED arm. Every file is
 * restored from a uniquely-named pristine copy in this worktree's own pen (`.led2-harness/`,
 * gitignored), verified by sha256 AND `cmp` AND a floored byte count. Never `git checkout --`.
 *
 * DECLARED BEFORE ARMING — what MUST fail:
 *   C1  conservation by row COUNT            -> "a dropped row and a duplicated row do NOT cancel"
 *   C2  the mover takes one line too many     -> "archive A-2/D-5 was not refused" (each IS refused,
 *                                                CONSERVATION_BROKEN, naming what was lost: the
 *                                                `## AREA` line, and the id D-6)
 *   C2b C2 with the PRE-WRITE check removed   -> the same, and the refusal says READ BACK: the
 *                                                disk check alone catches it and restores
 *   C3  DEBT closed = the August *lacks open* -> "every OPEN spelling"
 *   C4  `blocked` counted a closed state      -> "a `blocked` row is NOT closed"
 *   C5  the per-row budget never exceeded     -> "(b) an open row over 3 KiB is named"
 *   C6  every depends-on token accepted       -> "(c) the unresolved dependencies"
 *   C7  mintid's duplicate check stops reading the archive
 *                                             -> "mintid's duplicate check still sees D-7 twice"
 *   C8  the archive-aware lookup ignores the archive
 *                                             -> "find F-1 answers the new archive"
 *   C9  (OVER-STRICTNESS) the closure word matched case-sensitively
 *                                             -> "every CLOSED spelling reads closed" — correct
 *                                                work in a spelling (`closed 2026-…`) the rule's
 *                                                author might not anticipate must still pass
 *
 * LED-6 (the work pipeline's tool half) adds EIGHTEEN arms, each declared by the assertion it must redden:
 *   P1  the exactly-once check counts PRESENCE in both files     -> "P1 CATCHES an open id twice in the backlog"
 *   P2  the closed-row check blind to the backlog               -> "P2 CATCHES a closed row in the backlog…"
 *   P3  a `blocked` row in the cache never seen                 -> "P3 CATCHES a `blocked` row in the cache"
 *   P3o (OVER-STRICTNESS) the CACHE_ROWS limit read as exclusive -> "...and passes a cache of exactly CACHE_ROWS"
 *   P4  MET collapses to RESOLVES (an open row counts as met)   -> "P4 CATCHES a dependency on an OPEN row…"
 *   P4o (OVER-STRICTNESS) an ARCHIVED done row not counted met   -> "P4 (over-strictness) passes … ARCHIVED done row…"
 *   P5  the budget blind to the backlog                         -> "P5 CATCHES a backlog row over 2 KiB"
 *   P5o (OVER-STRICTNESS) the backlog's 2 KiB applied to the cache -> "P5 (over-strictness) passes a 2.5 KiB CACHE row…"
 *   R1  the refill's backlog splice takes one line too many     -> "refill was not refused", naming B-2 dropped
 *   R1b R1 with the PRE-WRITE check removed                     -> the same, READ BACK, restored byte-identically: YES
 *   R2  the refill ignores state                                -> "...a `blocked` row is skipped, never moved"
 *   R3  the refill ignores depends-on                           -> "...a dependency on a SUPERSEDED row is not met"
 *   R4  the refill ignores the cache's room                     -> "it moved the runnable rows from the TOP…"
 *   R5  the refill's LINE checks removed                        -> "a mover that also carried a NON-ROW line…"
 *   F1  find ignores the backlog                                -> "find F-2 answers the BACKLOG"
 *   F2  find reads the shared archive twice                     -> "find F-0 answers the ARCHIVE — ONCE…"
 *   M1  mintid stops reading the backlog                        -> "mintid's duplicate check READS THE BACKLOG…"
 *   O1  owed stops reading the backlog (judged by owed.test)    -> "a blocked row in the BACKLOG routed to the lane is owed…"
 * M0-119 (the backlog's TAIL, `BACKLOG-LATER.md` — WORK-PIPELINE §2) adds NINE arms, each declared by the assertion it must redden:
 *   T1  the rebalance DROPS the row it demotes (never placed in the tail) -> "THE ACCEPTANCE — every id is in EXACTLY ONE file"
 *   T2  the demoted row goes to the tail's FOOT, not its head (the order breaks)
 *                                                               -> "...IN ORDER: the backlog then the tail read as the ORIGINAL order"
 *   T3  P1 blind to the tail                                    -> "P1 CATCHES an open id in BOTH the backlog and its tail"
 *   T4  the refill blind to the tail (walks BACKLOG.md alone)   -> "refill with no runnable row in BACKLOG.md takes … FROM THE TAIL"
 *   T5  the coord write's rebalance skipped (judged by coord.test) -> "§10 a placement over budget is PUSHED …"
 *   T6  THE ITEM'S CONTROL: the lister's PIPELINE points at BACKLOG.md alone (judged by pipeline-readers.test)
 *                                                               -> "the lister reads the TAIL …" and "a TAIL row naming no design …"
 *   T7  mintid's DEC corpus reads BACKLOG.md alone (judged by pipeline-readers.test)
 *                                                               -> "DEC: an id mentioned ONLY in BACKLOG-LATER.md raises the floor"
 *   T8  find blind to the tail (ledgersFor without it)          -> "find answers a demoted id in the TAIL"
 *   T9  (OVER-STRICTNESS) an ABSENT tail read as UNREADABLE     -> "an ABSENT tail is NAMED absent by the audit …" — a plan with
 *                                                                  no tail file yet is correct work and must pass
 * What MUST NOT fail: the baseline (ledger.test, owed.test, coord.test AND pipeline-readers.test), and every restore.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { ANCHOR_DRY, anchorTable } from "../scripts/anchortable.mjs";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".led2-harness");
const LEDGER = join(REPO, "tools/ledger.mjs");
const OWED = join(REPO, "tools/owed.mjs");
const MINTID = join(REPO, "tools/mintid.mjs");
const COORD = join(REPO, "tools/coord.mjs");
const SUITE = join(REPO, "bio-plane/test/ledger.test.mjs");
const MIN_BYTES = { [LEDGER]: 15000, [OWED]: 8000, [MINTID]: 40000, [COORD]: 30000 };

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

if (!ANCHOR_DRY) mkdirSync(PEN, { recursive: true });   /* M0-197: no pen under the dry read */
const pristine = new Map();
for (const [name, p] of [["ledger", LEDGER], ["owed", OWED], ["mintid", MINTID], ["coord", COORD]]) {
  const copy = join(PEN, `pristine.${name}.mjs`);
  if (!ANCHOR_DRY) writeFileSync(copy, readFileSync(p));  /* M0-197: no pristine copy under the dry read */
  pristine.set(p, { copy, sha: sha(p), bytes: statSync(p).size });
  console.log(`  pristine ${name}: ${statSync(p).size} bytes, sha256 ${sha(p).slice(0, 8)}…`);
}
function restore(p) {
  const { copy, sha: want, bytes } = pristine.get(p);
  writeFileSync(p, readFileSync(copy));
  const got = sha(p), size = statSync(p).size;
  const cmp = spawnSync("cmp", ["-s", p, copy]).status === 0;
  const ok = got === want && cmp && size === bytes && size >= MIN_BYTES[p];
  console.log(`  restored ${p.slice(REPO.length + 1)}: ${size} bytes, sha256 ${got.slice(0, 8)}…, cmp ${cmp ? "identical" : "DIFFERS"} — byte-identical: ${ok ? "YES" : "NO"}`);
  return ok;
}
/* LED-6: an arm may name the suite it reddens (owed's backlog read is judged by `owed.test`); the
   default is `ledger.test`. The tally is read by the suite's own name, so a foreign tally cannot pass. */
const OWED_SUITE = join(REPO, "bio-plane/test/owed.test.mjs");
/* M0-119: the tail's arms are judged by coord.test (the placement through a real write) and pipeline-readers.test (the
   readers); the tally is read by the suite's own name, taken from its file name. */
const COORD_SUITE = join(REPO, "bio-plane/test/coord.test.mjs");
const READERS_SUITE = join(REPO, "bio-plane/test/pipeline-readers.test.mjs");
const suite = (path = SUITE) => {
  const r = spawnSync(process.execPath, [path], { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28 });
  const out = r.stdout || "";
  const name = path.split("/").pop().replace(/\.test\.mjs$/, "");
  const m = out.match(new RegExp(`${name}: (\\d+) pass, (\\d+) fail`));
  return { out, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, status: r.status };
};
const failed = (out, label) => out.split("\n").some((l) => l.startsWith(`  FAIL  ${label}`));

console.log("\n--- BASELINE · nothing armed ---");
if (!ANCHOR_DRY) {   /* M0-197: no suite runs under the dry read */
  const s = suite();
  t("baseline · the suite reached its tally and is GREEN", [s.pass > 50, s.fail, s.status], [true, 0, 0]);
  const so = suite(OWED_SUITE);
  t("baseline · owed.test (arm O1's suite) reached its tally and is GREEN", [so.pass > 30, so.fail, so.status], [true, 0, 0]);
  const sc = suite(COORD_SUITE), sr = suite(READERS_SUITE);
  t("baseline · coord.test (arm T5's suite) reached its tally and is GREEN", [sc.pass > 50, sc.fail, sc.status], [true, 0, 0]);
  t("baseline · pipeline-readers.test (arms T6, T7's suite) reached its tally and is GREEN", [sr.pass > 40, sr.fail, sr.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail; coord ${sc.pass}/${sc.fail}; pipeline-readers ${sr.pass}/${sr.fail}`);
}

const ARMS = [
  { id: "C1", title: "CONSERVATION BY ROW COUNT — the liar: a dropped row and a duplicated row cancel",
    patches: [[LEDGER, "  return { ok: dropped.length === 0 && gained.length === 0, dropped, gained };",
      "  const sum = (m) => [...m.values()].reduce((s, n) => s + n, 0);\n  return { ok: sum(before) === sum(after), dropped: [], gained: [] };"]],
    mustFail: ["a dropped row and a duplicated row do NOT cancel", "...and NAMES the dropped id"] },
  { id: "C2", title: "THE MOVER DROPS A ROW — it takes one line too many, the next row's heading",
    patches: [[LEDGER, "out.splice(r.start, r.end - r.start);", "out.splice(r.start, r.end - r.start + 1);"]],
    /* FIRST RUN, 2026-09-18: this arm's suite went red but the ARCHIVER did not refuse — the extra
       line was an `## AREA` heading, invisible to the id multiset. That was a finding about the
       subject, and `linesConserved` is its fix; the arm required the refusal to NAME both losses:
       the heading (lines) in the QUEUE fixture and D-6 (ids) in the DEBT one.
       NARROWED 2026-09-24 by M0-140: the DEBT half is gone with the construct — §1 no longer moves a DEBT row,
       because no ledger the archiver holds has one to move. The LINE loss (the `## AREA` heading, invisible to the
       id multiset) is the half this arm was written for and it is intact; the ID loss is still driven by C1's
       drop-one-duplicate-one liar over the QUEUE grammar. */
    mustFail: ["archive A-2 was not refused"],
    mustSay: /lost ×1: \\?"## AREA/ },
  { id: "C2b", title: "THE SAME, WITH THE PRE-WRITE CHECK REMOVED — only the read-back check stands",
    patches: [[LEDGER, "out.splice(r.start, r.end - r.start);", "out.splice(r.start, r.end - r.start + 1);"],
              [LEDGER, "  if (!planned.ok)\n", "  if (false)\n"]],
    /* NARROWED 2026-09-24 by M0-140 with C2, for the same reason and to the same half. */
    mustFail: ["archive A-2 was not refused"],
    mustSay: /READ BACK[\s\S]*lost ×1: \\?"## AREA[\s\S]*restored byte-identically: YES/ },
  { id: "C3", title: "DEBT CLOSED REVERTS TO THE AUGUST DEFINITION — the last cell lacks `open`",
    patches: [[OWED, `  const d = String(disposition || "").replace(/\\*\\*/g, "").trim();\n`,
      `  const d = String(disposition || "").replace(/\\*\\*/g, "").trim();\n  return d !== "" && !/\\bopen\\b/i.test(d);\n`]],
    mustFail: ["every OPEN spelling"] },
  { id: "C4", title: "`blocked` COUNTED AS A CLOSED QUEUE STATE",
    patches: [[LEDGER, `new Set(["done", "superseded"]);`, `new Set(["done", "superseded", "blocked"]);`]],
    mustFail: ["a `blocked` row is NOT closed"] },
  { id: "C5", title: "THE PER-ROW BUDGET NEVER EXCEEDED",
    patches: [[LEDGER, "if (r.open && r.bytes > BUDGET[l.name].row)", "if (false)"]],
    mustFail: ["(b) an open row over 3 KiB is named"] },
  { id: "C6", title: "EVERY depends-on TOKEN ACCEPTED",
    patches: [[LEDGER, "export function resolveDependency(token, { repo = ROOT, claims = null } = {}) {\n",
      "export function resolveDependency(token, { repo = ROOT, claims = null } = {}) {\n  return { ok: true, how: \"liar\" };\n"]],
    mustFail: ["(c) the unresolved dependencies"] },
  { id: "C7", title: "mintid's DUPLICATE CHECK STOPS READING THE ARCHIVE (raw iteration again)",
    /* REPOINTED 2026-09-23 (M0-100): the definition now takes `repo` and also expands the per-entry ledgers'
       directories, over two lines; the arm still reverts it to RAW iteration, which is the thing it breaks. */
    patches: [[MINTID, `const allocationCorpus = (corpus, repo = REPO_ROOT) => corpus.flatMap((rel) => (rel === "docs/archive/" ? ARCHIVE_TARGETS
  : rel.endsWith("/") && !isAbsolute(rel) ? expandCorpus([rel], repo).map((p) => relative(repo, p).split(sep).join("/")) : [rel]));`,
      `const allocationCorpus = (corpus) => corpus;`]],
    mustFail: ["mintid's duplicate check still sees D-7 twice"] },
  { id: "C8", title: "THE ARCHIVE-AWARE LOOKUP IGNORES THE ARCHIVE",
    patches: [[LEDGER, `...archiveFiles(ledger, { repo }).map((f) => [f, "archive"])]`, `...[]]`],
              [LEDGER, "for (const f of archiveFiles(LEDGERS.QUEUE, { repo })) {", "for (const f of []) {"]],
    mustFail: ["find F-1 answers the new archive", "archivedQueueIds carries both"] },
  { id: "C9", title: "OVER-STRICTNESS — the closure word matched case-SENSITIVELY",
    patches: [[OWED, "const CLOSURE_HEAD = /^(?:CLOSED|FIXED|RESOLVED|SUPERSEDED)\\b/i;",
      "const CLOSURE_HEAD = /^(?:CLOSED|FIXED|RESOLVED|SUPERSEDED)\\b/;"]],
    mustFail: ["every CLOSED spelling reads closed"] },

  /* ------------------------------------------------ LED-6: the five invariants, each with its liar */
  { id: "P1", title: "P1's LIAR — an id counted by PRESENCE in both files, so one open twice in the backlog passes",
    /* REPOINTED 2026-09-22 (M0-119): P1 now counts three files; the liar is the same — presence in two. */
    patches: [[LEDGER, "const P1 = [...counts.values()].filter((e) => e.cache + e.backlog + e.tail !== 1);",
      "const P1 = [...counts.values()].filter((e) => e.cache > 0 && e.backlog > 0);"]],
    mustFail: ["P1 CATCHES an open id twice in the backlog"] },
  { id: "P2", title: "P2 BLIND TO THE BACKLOG — only the cache's closed rows are seen",
    patches: [[LEDGER, "...b.filter((r) => r.closed).map((r) => ({ id: r.id, state: r.state, where: \"backlog\"",
      "...[].filter((r) => r.closed).map((r) => ({ id: r.id, state: r.state, where: \"backlog\""]],
    mustFail: ["P2 CATCHES a closed row in the backlog AND one in the cache"] },
  { id: "P3", title: "P3 NEVER SEES A `blocked` ROW IN THE CACHE",
    patches: [[LEDGER, "for (const r of c) if (r.state === \"blocked\") P3.push(", "for (const r of c) if (false) P3.push("]],
    mustFail: ["P3 CATCHES a `blocked` row in the cache"] },
  { id: "P3h", title: "HELD ROWS COUNTED — P3 charges an `integrated` row to the cache's slots (SCHEDULER #16, 2026-09-23)",
    patches: [[LEDGER, "const working = c.filter((r) => !HELD_QUEUE_STATES.has(r.state));", "const working = c;"]],
    mustFail: ["INTEGRATED: P3 passes CACHE_ROWS working rows beside 5 `integrated` ones"] },
  { id: "P3o", title: "OVER-STRICTNESS — P3 refuses a cache of EXACTLY CACHE_ROWS (the limit read as exclusive)",
    patches: [[LEDGER, "if (working.length > CACHE_ROWS) P3.push(", "if (working.length >= CACHE_ROWS) P3.push("]],   /* re-aimed 2026-09-23 by SCHEDULER #16: P3 now counts `working` (rows not `integrated`) */
    mustFail: ["...and passes a cache of exactly CACHE_ROWS"] },
  { id: "P4", title: "P4's LIAR — MET collapses to RESOLVES: a dependency on an OPEN row counts as met",
    patches: [[LEDGER, "if (open.length) return { met: false, why:", "if (open.length) return { met: true, why:"]],
    /* FIRST RUN, 2026-09-18: the suite went red on the REFILL assertion but NOT on the P4 one — the P4
       fixture judged texts against a repository holding neither, so the "open" dependency was unmet
       because it was NOWHERE. A finding about the fixture (ledger.test section 11), fixed there. */
    mustFail: ["P4 CATCHES a dependency on an OPEN row, a SUPERSEDED row and a row that is NOWHERE",
               "...and R-5 is unmet because B-1 is OPEN — not because B-1 cannot be found",
               "...a row waiting on an OPEN row (B-1, moved this very refill) is not runnable"] },
  { id: "P4o", title: "OVER-STRICTNESS — a done row counts as met only while it is LIVE, not once archived",
    patches: [[LEDGER, "const done = found.find((f) => f.state === \"done\" || f.state === \"closed\");",
      "const done = found.find((f) => (f.state === \"done\" || f.state === \"closed\") && f.where !== \"archive\");"]],
    mustFail: ["P4 (over-strictness) passes a dependency on an ARCHIVED done row and a BUILT claim",
               "it moved the runnable rows from the TOP, in backlog order, until the cache held 6"] },
  { id: "P5", title: "P5 BLIND TO THE BACKLOG — only the cache is measured",
    /* REPOINTED 2026-09-22 (M0-119): the loop names the tail too; the arm drops the BACKLOG from it, as before. */
    patches: [[LEDGER, "for (const [ledger, text, rows] of [[LEDGERS.QUEUE, cache, c], [LEDGERS.BACKLOG, backlog, b], [LEDGERS.LATER, later ?? \"\", lt]]) {",
      "for (const [ledger, text, rows] of [[LEDGERS.QUEUE, cache, c], [LEDGERS.LATER, later ?? \"\", lt]]) {"]],
    mustFail: ["P5 CATCHES a backlog row over 2 KiB"] },
  { id: "P5o", title: "OVER-STRICTNESS — the backlog's 2 KiB row budget applied to the cache",
    patches: [[LEDGER, "const B = BUDGET[ledger.name];", "const B = BUDGET.BACKLOG;"]],
    mustFail: ["P5 (over-strictness) passes a 2.5 KiB CACHE row — the cache's row budget is 3 KiB"] },

  /* ------------------------------------------------------------- LED-6: the refill and the lookup */
  { id: "R1", title: "THE REFILL DROPS A ROW — the backlog splice takes one line too many (the next row's heading)",
    patches: [[LEDGER, "const span = r.end - r.start;", "const span = r.end - r.start + 1;"]],
    mustFail: ["refill was not refused (a refusal here names what did not conserve)"],
    mustSay: /the planned refill does not conserve[^\n]*ids dropped: B-2 \(1 -> 0\)/ },
  { id: "R1b", title: "THE SAME, WITH THE PRE-WRITE CHECK REMOVED — only the read-back check stands",
    patches: [[LEDGER, "const span = r.end - r.start;", "const span = r.end - r.start + 1;"],
              [LEDGER, "if (!planned.ok) throw refusal(\"CONSERVATION_BROKEN\", `the planned refill",
                       "if (false) throw refusal(\"CONSERVATION_BROKEN\", `the planned refill"]],
    mustFail: ["refill was not refused (a refusal here names what did not conserve)"],
    mustSay: /did not conserve what was READ BACK[^\n]*ids dropped: B-2 \(1 -> 0\)[^\n]*restored byte-identically: YES/ },
  { id: "R2", title: "THE REFILL IGNORES STATE — a `blocked` row is moved",
    patches: [[LEDGER, "if (r.state === \"blocked\") { skip(", "if (false) { skip("],
              [LEDGER, "if (r.state !== \"queued\") { skip(", "if (false) { skip("]],
    mustFail: ["...a `blocked` row is skipped, never moved"] },
  { id: "R3", title: "THE REFILL IGNORES depends-on — an unmet row is moved",
    patches: [[LEDGER, "if (!m.met) { skip(", "if (false) { skip("]],
    mustFail: ["...a dependency on a SUPERSEDED row is not met"] },
  { id: "R4", title: "THE REFILL IGNORES THE CACHE'S ROOM — it drains the backlog past 8",
    patches: [[LEDGER, "if (take.length >= room) break;", "if (false) break;"]],
    mustFail: ["it moved the runnable rows from the TOP, in backlog order, until the cache held 6"] },
  { id: "R5", title: "THE REFILL'S LINE CHECK REMOVED — a mover carrying a non-row line out of the backlog conserves every id",
    patches: [[LEDGER, "ok: ids.ok && !backlogOff.length && !cacheOff.length && !notMoved.length", "ok: ids.ok && !notMoved.length"]],
    mustFail: ["a mover that also carried a NON-ROW line out of the backlog is refused by the line check though every id conserves"] },
  { id: "F1", title: "FIND IGNORES THE BACKLOG — an id there is reported nowhere",
    /* M0-140: `LEDGERS.DEBT` is `DEBT_ARCHIVE` now — the retired ledger's archive-only descriptor. */
    patches: [[LEDGER, "? [...PIPELINE, DEBT_ARCHIVE] : [...PIPELINE]);", "? [...PIPELINE, DEBT_ARCHIVE] : [LEDGERS.QUEUE]);"]],
    mustFail: ["find F-2 answers the BACKLOG"] },
  { id: "F2", title: "FIND READS THE SHARED ARCHIVE TWICE — every archived row answers twice",
    patches: [[LEDGER, "if (seen.has(rel)) continue;", "if (false) continue;"]],
    mustFail: ["find F-0 answers the ARCHIVE — ONCE, though two ledgers share that archive file"] },
  { id: "M1", title: "mintid STOPS READING THE BACKLOG — an id there can be allocated twice unseen",
    /* REPOINTED 2026-09-22 (M0-119): the tail's entry now follows BACKLOG.md's in the list; the arm drops BACKLOG.md alone. */
    patches: [[MINTID, "  \"docs/development/BACKLOG.md\",\n  /* M0-119:", "  /* M0-119:"]],
    mustFail: ["mintid's duplicate check READS THE BACKLOG — REC-7 in the cache and the backlog is seen twice"] },
  { id: "O1", title: "owed STOPS READING THE BACKLOG — after the migration every blocked row is there, and the list empties",
    suite: OWED_SUITE,
    /* REPOINTED 2026-09-19 (M0-73): owed reads the plan's files over ledger.mjs' `PIPELINE` (cache, then
       backlog) and takes its rows from `pipelineRows`; the arm drops the backlog from that loop — the
       same property, at its one site. The old anchor went to ZERO (m025-arm-anchor-witness A4 caught it). */
    patches: [[OWED, "  for (const l of PIPELINE) {", "  for (const l of PIPELINE.slice(0, 1)) {"]],
    mustFail: ["an unreadable BACKLOG is NAMED too (LED-6)", "a blocked row in the BACKLOG routed to the lane is owed, sourced BACKLOG (LED-6)"] },

  /* ------------------------------------------------------------- M0-119: the backlog's tail */
  { id: "T1", title: "THE REBALANCE DROPS THE ROW IT DEMOTES — it leaves BACKLOG.md and reaches no file",
    patches: [[LEDGER, "    T = atHead(T, rowLines(linesOf(B).lines, r));\n", "    T = T;\n"]],
    mustFail: ["THE ACCEPTANCE — every id is in EXACTLY ONE file", "rebalance on disk was not refused"] },
  { id: "T2", title: "THE ORDER BREAKS — a demoted row goes to the tail's FOOT instead of its head",
    patches: [[LEDGER, "    T = atHead(T, rowLines(linesOf(B).lines, r));\n", "    T = atFoot(T, rowLines(linesOf(B).lines, r));\n"]],
    mustFail: ["...IN ORDER: the backlog then the tail read as the ORIGINAL order"] },
  { id: "T3", title: "P1 BLIND TO THE TAIL — an id open in the backlog AND its tail passes",
    patches: [[LEDGER, "for (const [rows, where] of [[c, \"cache\"], [b, \"backlog\"], [lt, \"tail\"]])", "for (const [rows, where] of [[c, \"cache\"], [b, \"backlog\"]])"]],
    mustFail: ["P1 CATCHES an open id in BOTH the backlog and its tail"] },
  { id: "T4", title: "THE REFILL BLIND TO THE TAIL — it walks BACKLOG.md alone",
    patches: [[LEDGER, "...queueRows(later ?? \"\").map((r) => ({ ...r, from: \"tail\" }))];", "];"]],
    mustFail: ["refill with no runnable row in BACKLOG.md takes the order's next runnable row FROM THE TAIL"] },
  { id: "T5", title: "THE PLACEMENT'S REBALANCE SKIPPED — a coord write over budget meets the ledger checks unbalanced",
    suite: COORD_SUITE,
    patches: [[COORD, "if (rebalance && !intents.some((it) => it.op === \"rebalance\"))", "if (false)"]],
    mustFail: ["§10 a placement over budget is PUSHED — the ledger checks pass, the tail moved rather than the budget failing"] },
  { id: "T6", title: "THE ITEM'S CONTROL — the lister points at BACKLOG.md alone: PIPELINE without the tail",
    suite: READERS_SUITE,
    patches: [[LEDGER, "export const PIPELINE = [LEDGERS.QUEUE, LEDGERS.BACKLOG, LEDGERS.LATER];", "export const PIPELINE = [LEDGERS.QUEUE, LEDGERS.BACKLOG];"]],
    mustFail: ["the lister reads the TAIL: a tail row is read, tagged `tail`, AFTER every backlog row (one order)",
               "a TAIL row naming no design FAILS by name, and names BACKLOG-LATER.md"] },
  { id: "T7", title: "mintid's DEC CORPUS READS BACKLOG.md ALONE — an id placed only in the tail sets no floor",
    suite: READERS_SUITE,
    patches: [[MINTID, "\"docs/development/DECISIONS.md\", \"docs/development/QUEUE.md\", \"docs/development/BACKLOG.md\", \"docs/development/BACKLOG-LATER.md\"]",
                       "\"docs/development/DECISIONS.md\", \"docs/development/QUEUE.md\", \"docs/development/BACKLOG.md\"]"]],
    mustFail: ["DEC: an id mentioned ONLY in BACKLOG-LATER.md raises the floor", "THE TAIL CLASS: no mintid corpus names the backlog without its tail"] },
  { id: "T8", title: "FIND BLIND TO THE TAIL — a demoted id is reported nowhere",
    patches: [[LEDGER, "? [...PIPELINE, DEBT_ARCHIVE] : [...PIPELINE]);", "? [...PIPELINE, DEBT_ARCHIVE] : [LEDGERS.QUEUE, LEDGERS.BACKLOG]);"]],
    mustFail: ["find answers a demoted id in the TAIL"] },
  { id: "T9", title: "OVER-STRICTNESS — an ABSENT tail read as UNREADABLE (a plan with no tail yet is correct work)",
    patches: [[LEDGER, "return t === null && l.optional ? { text: \"\", absent: true }", "return false ? { text: \"\", absent: true }"]],
    mustFail: ["an ABSENT tail is NAMED absent by the audit, never unreadable, and scored as empty"] },
];

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap((a) => a.patches.map(([file, find, put]) => ({ arm: a.id, file, find, put }))));

for (const a of ARMS) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  const touched = [...new Set(a.patches.map(([p]) => p))];
  let armed = true;
  for (const [p, from, to] of a.patches) {
    const src = readFileSync(p, "utf8");
    const hits = src.split(from).length - 1;
    if (hits !== 1) { armed = false; console.log(`  anchor matched ${hits} time(s) in ${p.slice(REPO.length + 1)}`); continue; }
    writeFileSync(p, src.replace(from, to));
  }
  t(`${a.id} · the arm ARMED (every patch matched exactly once)`, armed, true);
  const s = suite(a.suite);
  t(`${a.id} · the suite reached its tally (a crash is not a red suite)`, s.pass >= 0, true);
  t(`${a.id} · the suite went RED`, [s.fail > 0, s.status !== 0], [true, true]);
  for (const label of a.mustFail) t(`${a.id} · FAILS BY NAME: "${label}"`, failed(s.out, label), true);
  if (a.mustSay) t(`${a.id} · the failure says ${a.mustSay}`, a.mustSay.test(s.out), true);
  console.log(`  armed suite: ${s.pass} pass, ${s.fail} fail`);
  for (const p of touched) t(`${a.id} · RESTORED ${p.slice(REPO.length + 1)} byte-identically`, restore(p), true);
}

console.log("\n--- AFTER · every file restored, the suite green again ---");
{
  const s = suite();
  t("after · the suite is GREEN on the restored tree", [s.fail, s.status], [0, 0]);
  const so = suite(OWED_SUITE);
  t("after · owed.test (arm O1's suite) is GREEN on the restored tree", [so.pass > 30, so.fail, so.status], [true, 0, 0]);
  const sc = suite(COORD_SUITE), sr = suite(READERS_SUITE);
  t("after · coord.test and pipeline-readers.test are GREEN on the restored tree", [sc.fail, sc.status, sr.fail, sr.status], [0, 0, 0, 0]);
}
/* The pen is removed on a clean run and KEPT on a red one, where the pristine copies are the evidence. */
if (!fail) rmSync(PEN, { recursive: true, force: true });
else console.log(`  pen KEPT at ${PEN} — the pristine copies are the evidence of a red run`);
console.log(`\nledger.control: ${pass} pass, ${fail} fail  (${ARMS.length} arms plus a baseline)`);
process.exit(fail ? 1 : 0);
