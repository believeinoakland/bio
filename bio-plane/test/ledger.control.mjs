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
 *   P3o (OVER-STRICTNESS) the 8-row limit read as exclusive      -> "...and passes a cache of exactly 8"
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
 * What MUST NOT fail: the baseline (ledger.test AND owed.test), and every restore.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PEN = join(REPO, ".led2-harness");
const LEDGER = join(REPO, "tools/ledger.mjs");
const OWED = join(REPO, "tools/owed.mjs");
const MINTID = join(REPO, "tools/mintid.mjs");
const SUITE = join(REPO, "bio-plane/test/ledger.test.mjs");
const MIN_BYTES = { [LEDGER]: 15000, [OWED]: 8000, [MINTID]: 40000 };

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

mkdirSync(PEN, { recursive: true });
const pristine = new Map();
for (const [name, p] of [["ledger", LEDGER], ["owed", OWED], ["mintid", MINTID]]) {
  const copy = join(PEN, `pristine.${name}.mjs`);
  writeFileSync(copy, readFileSync(p));
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
const suite = (path = SUITE) => {
  const r = spawnSync(process.execPath, [path], { cwd: REPO, encoding: "utf8" });
  const out = r.stdout || "";
  const name = path.endsWith("owed.test.mjs") ? "owed" : "ledger";
  const m = out.match(new RegExp(`${name}: (\\d+) pass, (\\d+) fail`));
  return { out, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, status: r.status };
};
const failed = (out, label) => out.split("\n").some((l) => l.startsWith(`  FAIL  ${label}`));

console.log("\n--- BASELINE · nothing armed ---");
{
  const s = suite();
  t("baseline · the suite reached its tally and is GREEN", [s.pass > 50, s.fail, s.status], [true, 0, 0]);
  const so = suite(OWED_SUITE);
  t("baseline · owed.test (arm O1's suite) reached its tally and is GREEN", [so.pass > 30, so.fail, so.status], [true, 0, 0]);
  console.log(`  baseline suite: ${s.pass} pass, ${s.fail} fail`);
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
       subject, and `linesConserved` is its fix; the arm now requires the refusal to NAME both
       losses: the heading (lines) in the QUEUE fixture and D-6 (ids) in the DEBT one. */
    mustFail: ["archive A-2 was not refused", "archive D-5 was not refused"],
    mustSay: /lost ×1: \\?"## AREA[\s\S]*D-6 \(1 -> 0\)/ },
  { id: "C2b", title: "THE SAME, WITH THE PRE-WRITE CHECK REMOVED — only the read-back check stands",
    patches: [[LEDGER, "out.splice(r.start, r.end - r.start);", "out.splice(r.start, r.end - r.start + 1);"],
              [LEDGER, "  if (!planned.ok)\n", "  if (false)\n"]],
    mustFail: ["archive A-2 was not refused", "archive D-5 was not refused"],
    mustSay: /READ BACK[\s\S]*lost ×1: \\?"## AREA[\s\S]*restored byte-identically: YES[\s\S]*READ BACK[\s\S]*D-6 \(1 -> 0\)[\s\S]*restored byte-identically: YES/ },
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
    patches: [[MINTID, `const allocationCorpus = (corpus) => corpus.flatMap((rel) => (rel === "docs/archive/" ? ARCHIVE_TARGETS : [rel]));`,
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
    patches: [[LEDGER, "const P1 = [...counts.values()].filter((e) => e.cache + e.backlog !== 1);",
      "const P1 = [...counts.values()].filter((e) => e.cache > 0 && e.backlog > 0);"]],
    mustFail: ["P1 CATCHES an open id twice in the backlog"] },
  { id: "P2", title: "P2 BLIND TO THE BACKLOG — only the cache's closed rows are seen",
    patches: [[LEDGER, "...b.filter((r) => r.closed).map((r) => ({ id: r.id, state: r.state, where: \"backlog\"",
      "...[].filter((r) => r.closed).map((r) => ({ id: r.id, state: r.state, where: \"backlog\""]],
    mustFail: ["P2 CATCHES a closed row in the backlog AND one in the cache"] },
  { id: "P3", title: "P3 NEVER SEES A `blocked` ROW IN THE CACHE",
    patches: [[LEDGER, "for (const r of c) if (r.state === \"blocked\") P3.push(", "for (const r of c) if (false) P3.push("]],
    mustFail: ["P3 CATCHES a `blocked` row in the cache"] },
  { id: "P3o", title: "OVER-STRICTNESS — P3 refuses a cache of EXACTLY 8 (the limit read as exclusive)",
    patches: [[LEDGER, "if (c.length > CACHE_ROWS) P3.push(", "if (c.length >= CACHE_ROWS) P3.push("]],
    mustFail: ["...and passes a cache of exactly 8"] },
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
    patches: [[LEDGER, "for (const [ledger, text, rows] of [[LEDGERS.QUEUE, cache, c], [LEDGERS.BACKLOG, backlog, b]]) {",
      "for (const [ledger, text, rows] of [[LEDGERS.QUEUE, cache, c]]) {"]],
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
    patches: [[LEDGER, "? [...PIPELINE, LEDGERS.DEBT] : [...PIPELINE]);", "? [...PIPELINE, LEDGERS.DEBT] : [LEDGERS.QUEUE]);"]],
    mustFail: ["find F-2 answers the BACKLOG"] },
  { id: "F2", title: "FIND READS THE SHARED ARCHIVE TWICE — every archived row answers twice",
    patches: [[LEDGER, "if (seen.has(rel)) continue;", "if (false) continue;"]],
    mustFail: ["find F-0 answers the ARCHIVE — ONCE, though two ledgers share that archive file"] },
  { id: "M1", title: "mintid STOPS READING THE BACKLOG — an id there can be allocated twice unseen",
    patches: [[MINTID, "  \"docs/development/BACKLOG.md\",\n  \"docs/development/MILESTONES.md\",", "  \"docs/development/MILESTONES.md\","]],
    mustFail: ["mintid's duplicate check READS THE BACKLOG — REC-7 in the cache and the backlog is seen twice"] },
  { id: "O1", title: "owed STOPS READING THE BACKLOG — after the migration every blocked row is there, and the list empties",
    suite: OWED_SUITE,
    patches: [[OWED, "[[SOURCES.queue, \"QUEUE\"], [SOURCES.backlog, \"BACKLOG\"]]", "[[SOURCES.queue, \"QUEUE\"]]"]],
    mustFail: ["an unreadable BACKLOG is NAMED too (LED-6)", "a blocked row in the BACKLOG routed to the lane is owed, sourced BACKLOG (LED-6)"] },
];

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
}
/* The pen is removed on a clean run and KEPT on a red one, where the pristine copies are the evidence. */
if (!fail) rmSync(PEN, { recursive: true, force: true });
else console.log(`  pen KEPT at ${PEN} — the pristine copies are the evidence of a red run`);
console.log(`\nledger.control: ${pass} pass, ${fail} fail  (${ARMS.length} arms plus a baseline)`);
process.exit(fail ? 1 : 0);
