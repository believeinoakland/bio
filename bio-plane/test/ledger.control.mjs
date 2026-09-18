#!/usr/bin/env node
/* LED-2's NEGATIVE CONTROL DRIVER — one arm per property, CONSERVATION FIRST, plus a baseline.
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
 * What MUST NOT fail: the baseline, and every restore.
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
const suite = () => {
  const r = spawnSync(process.execPath, [SUITE], { cwd: REPO, encoding: "utf8" });
  const out = r.stdout || "";
  const m = out.match(/ledger: (\d+) pass, (\d+) fail/);
  return { out, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, status: r.status };
};
const failed = (out, label) => out.split("\n").some((l) => l.startsWith(`  FAIL  ${label}`));

console.log("\n--- BASELINE · nothing armed ---");
{
  const s = suite();
  t("baseline · the suite reached its tally and is GREEN", [s.pass > 50, s.fail, s.status], [true, 0, 0]);
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
  const s = suite();
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
}
/* The pen is removed on a clean run and KEPT on a red one, where the pristine copies are the evidence. */
if (!fail) rmSync(PEN, { recursive: true, force: true });
else console.log(`  pen KEPT at ${PEN} — the pristine copies are the evidence of a red run`);
console.log(`\nledger.control: ${pass} pass, ${fail} fail  (${ARMS.length} arms plus a baseline)`);
process.exit(fail ? 1 : 0);
