#!/usr/bin/env node
/* decided.control.mjs — M0-97's and D-341's NEGATIVE-CONTROL DRIVER, FIFTEEN ARMS PLUS A BASELINE,
 * for `tools/decided.mjs` and its suite `bio-plane/test/decided.test.mjs`.
 *
 *     node bio-plane/test/decided.control.mjs          # from the repo root: the baseline, then every arm
 *     node bio-plane/test/decided.control.mjs 6        # the baseline, then one arm
 *
 * THE RULES, which are this estate's and not this file's: each arm patches `tools/decided.mjs` ALONE
 * from a pristine tree, and DECLARES before arming which NAMED assertion must fail; the suite must
 * still reach its own foot (a crash is a second variable, not a result), and one assertion that no
 * arm can reach — the oracle's own `git grep` — must stay green, so a red is not collateral. D-331:
 * every anchor is counted in the file BEFORE anything is armed, through `preflight`. Every restore
 * is verified by sha256 AND `cmp` against the arm's own uniquely-named copy in `.m097-harness/`,
 * with the byte count printed and floored; the copy is removed as its restore verifies, and an
 * `exit` hook restores from memory and removes the pen on EVERY exit. Every child is asynchronous,
 * so a signal is honoured when it arrives rather than after the run.
 *
 * THE LIMIT, STATED FIRST (M0-42): nothing here proves a control RAN. The run of record is written,
 * dated and with its figures, into the suite's `NEGATIVE CONTROL:` block and this item's claim.
 */
import "./stdio.mjs";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const TOOL = path.join(REPO, "tools", "decided.mjs");
const SUITE = path.join(REPO, "bio-plane", "test", "decided.test.mjs");
const PEN = path.join(REPO, ".m097-harness");
const ONLY = process.argv[2] || null;
const DECLARED_ARMS = 15;
const FLOOR_BYTES = 20000;

const sha = (b) => createHash("sha256").update(b).digest("hex");
const PRISTINE = fs.readFileSync(TOOL);
const DIGEST = sha(PRISTINE);
if (PRISTINE.length < FLOOR_BYTES || DIGEST === sha(Buffer.alloc(0))) {
  console.log(`** tools/decided.mjs is implausibly small (${PRISTINE.length} B); refusing to arm over it`);
  process.exit(1);
}
console.log(`pristine tools/decided.mjs: ${PRISTINE.length} bytes, sha256 ${DIGEST.slice(0, 12)}…`);

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };

/* ---------------------------------------------------------------- the pen, on every exit */
const WRITTEN = new Set();
process.on("exit", (code) => {
  if (sha(fs.readFileSync(TOOL)) !== DIGEST) {
    fs.writeFileSync(TOOL, PRISTINE);
    console.log(`  exit ${code}: tools/decided.mjs restored from memory — sha256 ${sha(fs.readFileSync(TOOL)) === DIGEST ? "match" : "**MISMATCH**"}`);
  }
  for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); } catch {} }
  try { if (fs.existsSync(PEN) && fs.readdirSync(PEN).length === 0) fs.rmdirSync(PEN); } catch {}
  console.log(`decided.control pen: ${fs.existsSync(PEN) ? `REMAINS at ${PEN}` : "absent"} · exit ${code}`);
});
let CURRENT = null;
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"])
  process.on(sig, () => { if (CURRENT) { try { CURRENT.kill("SIGTERM"); } catch {} } process.exit(130); });

function runSuite() {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SUITE], { cwd: path.join(REPO, "bio-plane"), stdio: ["ignore", "pipe", "pipe"] });
    CURRENT = child;
    const out = [];
    child.stdout.on("data", (d) => out.push(d));
    child.stderr.on("data", (d) => out.push(d));
    child.on("close", (code) => {
      CURRENT = null;
      const text = Buffer.concat(out).toString("utf8");
      const tally = /decided: (\d+) pass, (\d+) fail/.exec(text);
      resolve({ code, text, pass: tally ? +tally[1] : -1, fail: tally ? +tally[2] : -1, foot: !!tally,
                failed: [...text.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((m) => m[1]) });
    });
  });
}
const broke = (s, frag) => s.failed.some((l) => l.includes(frag));
const COLLATERAL = "the oracle ran";

/* ---------------------------------------------------------------- the arms
   Each patch is one quoted string of the file, asserted to occur exactly ONCE before anything arms. */
const ARMS = [
  { id: "1", title: "the register-entry pass never files an entry",
    patches: [["      if (!entries || e.verdict !== \"ruling\") continue;", "      if (true) continue;"]],
    mustBreak: "EVERY ANSWERED OR ENACTED ENTRY IS RETURNED", naming: "DEC-70", alsoBreak: ["DEC-70 IS RETURNED"] },
  { id: "2", title: "MARKER lower-cased, the entry pass intact",
    patches: [["CONCEDED)\\b(?!\\.md\\b)/;", "CONCEDED)\\b(?!\\.md\\b)/i;"]],
    mustBreak: "LOWERCASE PROSE IS NOT A RULING" },
  { id: "3", title: "THE ROW'S LIAR — the entry pass REPLACED by a lower-cased MARKER, one alternative implementation",
    patches: [["      if (!entries || e.verdict !== \"ruling\") continue;", "      if (true) continue;"],
              ["CONCEDED)\\b(?!\\.md\\b)/;", "CONCEDED)\\b(?!\\.md\\b)/i;"]],
    mustBreak: "THE INDEX GROWS ONLY BY THE ENTRIES IT DID NOT FILE BEFORE",
    alsoBreak: ["LOWERCASE PROSE IS NOT A RULING", "EVERY ANSWERED OR ENACTED ENTRY IS RETURNED"] },
  { id: "4", title: "the verdict ignored: every entry carrying `decided:` filed, deferred included",
    patches: [["      if (!entries || e.verdict !== \"ruling\") continue;", "      if (!entries || (e.verdict !== \"ruling\" && !e.decided)) continue;"]],
    mustBreak: "A DEFERRED ENTRY IS NOT RETURNED", naming: "filed: DEC-2" },
  { id: "5", title: "the already-filed check dropped",
    patches: [["      if (filedHere.has(`${src.line}|${e.id}`)) continue;\n", ""]],
    mustBreak: "FILES NONE TWICE — an entry whose answer line a marker already filed" },
  { id: "6", title: "D-341's OWN CONTROL — the window's stop dropped whole, both edges",
    patches: [["        if (HEADING.test(lines[k])) break;\n        if (BLANK.test(lines[k])) { if (title && !tail.length) continue; break; }\n", ""]],
    mustBreak: "A CLAIM APPENDED AFTER A TRAILING released: LINE", alsoBreak: ["NO RULING IN THE REAL INDEX QUOTES A HEADING"] },
  { id: "7", title: "the heading edge alone dropped",
    patches: [["        if (HEADING.test(lines[k])) break;\n", ""]],
    mustBreak: "A CLAIM APPENDED WITH NO BLANK LINE" },
  { id: "8", title: "the blank-line edge alone dropped",
    patches: [["        if (BLANK.test(lines[k])) { if (title && !tail.length) continue; break; }\n", ""]],
    mustBreak: "THE NEXT PARAGRAPH IS NOT ABSORBED" },
  { id: "9", title: "THE ROW'S OTHER LIAR — the window stops at every line break",
    patches: [["        tail.push(lines[k]);\n", "        break;\n"]],
    mustBreak: "A HAND-WRAPPED RULING QUOTES WHOLE" },
  { id: "10", title: "the heading test narrowed to the row's literal `^#`",
    patches: [["const HEADING = /^#{1,6}(?:\\s|$)/;", "const HEADING = /^#/;"]],
    mustBreak: "A LINE OPENING ON A SESSION NUMBER IS NOT A HEADING" },
  { id: "11", title: "the title rule dropped: a heading's blank line ends it too",
    patches: [["const TITLES = (line) => HEADING.test(line) || /:[*_`]*\\s*$/.test(line);", "const TITLES = (line) => false;"]],
    mustBreak: "A TITLE'S RULING IS FILED UNDER THE ID ITS SECTION OPENS WITH" },
  { id: "12", title: "the search context's fix reverted: the window cut at 4,000 characters from its start",
    patches: [["        ctx: (win.length <= 4000 ? win : `${win.slice(0, 4000)} ${line}`).toLowerCase(),", "        ctx: win.slice(0, 4000).toLowerCase(),"]],
    mustBreak: "A LONG LEDGER ROW IS FOUND BY ITS OWN WORDS", alsoBreak: ["every marker row's context holds its own line"] },
  { id: "13", title: "the id query reverted to a bare substring",
    patches: [["  if (ID_ONLY.test(bare)) {", "  if (false) {"]],
    mustBreak: "AN ID QUERY MATCHES THE WHOLE ID" },
  { id: "14", title: "an entry's date borrowed from the whole entry instead of its `decided:` field",
    patches: [["        date: (DATE.exec(e.decided.value) || [])[1] || null,", "        date: (DATE.exec(e.ctx) || [])[1] || null,"]],
    mustBreak: "AN UNDATED decided: STAYS UNDATED", alsoBreak: ["`decided.mjs DEC-73` returns the entry, undated"] },
  { id: "15", title: "an entry's FIRST answer read instead of its last — `plancheck`'s reading, which only asks whether a field exists",
    patches: [["    last = { line: k + 1, value: parts.join(\" \").trim() };", "    return { line: k + 1, value: parts.join(\" \").trim() };"]],
    mustBreak: "AN ENTRY ANSWERED TWICE IS ONE RULING, QUOTING THE LAST ANSWER", alsoBreak: ["DEC-31 — DEFERRED on 2026-08-03"] },
];
if (ARMS.length !== DECLARED_ARMS) { console.log(`** ${ARMS.length} arms in the table against ${DECLARED_ARMS} declared — the head is wrong`); process.exit(1); }

const selected = ARMS.filter((a) => !ONLY || a.id === ONLY);
if (ONLY && !selected.length) { console.log(`** no arm ${ONLY}`); process.exit(1); }
const rows = preflight("decided.control", ARMS.map((a) => ({ id: a.id, anchors: a.patches.map(([needle]) => ({ file: TOOL, needle })) })),
  { fatalFor: selected.map((a) => a.id) });
const dead = rows.filter((r) => r.n !== r.want && selected.some((a) => a.id === r.id));
if (dead.length) { console.log(`** ${dead.length} anchor(s) of the selected arm(s) are not live — REFUSED TO ARM BLIND`); process.exit(1); }

function restore(id) {
  fs.writeFileSync(TOOL, PRISTINE);
  const now = fs.readFileSync(TOOL);
  const copy = path.join(PEN, `arm${id}--decided.mjs`);
  let cmp = true;
  try { execFileSync("cmp", ["-s", TOOL, copy]); } catch { cmp = false; }
  const ok = sha(now) === DIGEST && cmp && now.length >= FLOOR_BYTES;
  t(`arm ${id} · RESTORED byte-identically (${now.length} B, floor ${FLOOR_BYTES}, sha256 ${ok ? "match" : "**MISMATCH**"}, cmp ${cmp ? "identical" : "DIFFERS"})`, ok);
  if (ok) { fs.rmSync(copy, { force: true }); WRITTEN.delete(copy); }
  return ok;
}

/* ---------------------------------------------------------------- the run */
console.log("\n--- ARM BASELINE · nothing armed ---");
{
  const s = await runSuite();
  t(`baseline · the suite reached its foot and is GREEN (${s.pass} pass, ${s.fail} fail, exit ${s.code})`, s.foot && s.fail === 0 && s.code === 0 && s.pass > 30);
}
let armsRun = 0;
for (const a of selected) {
  console.log(`\n--- ARM ${a.id} · ${a.title} (armed ALONE) ---`);
  console.log(`    DECLARED: "${a.mustBreak}" FAILS${a.naming ? `, naming ${a.naming}` : ""}; "${COLLATERAL}" stays green; the suite reaches its foot`);
  fs.mkdirSync(PEN, { recursive: true });
  const copy = path.join(PEN, `arm${a.id}--decided.mjs`);
  fs.writeFileSync(copy, PRISTINE); WRITTEN.add(copy);
  let src = PRISTINE.toString("utf8"), armed = true;
  for (const [from, to] of a.patches) {
    const n = src.split(from).length - 1;
    if (n !== 1) { armed = false; break; }
    src = src.replace(from, () => to);
  }
  t(`arm ${a.id} · ARMED (${a.patches.length} patch${a.patches.length === 1 ? "" : "es"}, each matched exactly once)`, armed);
  if (armed) {
    fs.writeFileSync(TOOL, src);
    const s = await runSuite();
    armsRun++;
    const hit = s.failed.find((l) => l.includes(a.mustBreak));
    t(`arm ${a.id} · "${a.mustBreak}" FAILS`, !!hit);
    if (a.naming) t(`arm ${a.id} · ...naming ${a.naming}`, !!hit && hit.includes(a.naming));
    for (const x of a.alsoBreak || []) t(`arm ${a.id} · ...and "${x}" fails with it`, broke(s, x));
    t(`arm ${a.id} · the suite reached its foot (${s.pass} pass, ${s.fail} fail)`, s.foot);
    t(`arm ${a.id} · the red is not collateral ("${COLLATERAL}" stays green)`, !broke(s, COLLATERAL));
    console.log(`    ACTUAL: ${s.failed.length} failing assertion(s): ${s.failed.map((l) => l.slice(0, 70)).join(" | ")}`);
  }
  if (!restore(a.id)) { console.log("** a restore did not verify; stopping before the next arm measures an unsound tree"); process.exit(1); }
}

console.log("\n--- CLOSING · every arm restored ---");
{
  const s = await runSuite();
  t(`closing · the suite is GREEN again, so no arm leaked (${s.pass} pass, ${s.fail} fail)`, s.foot && s.fail === 0 && s.code === 0);
  t(`closing · tools/decided.mjs is the pristine file (sha256 ${DIGEST.slice(0, 12)}…)`, sha(fs.readFileSync(TOOL)) === DIGEST);
}
t(`the arm tally held: ${armsRun} run of ${selected.length} selected${ONLY ? "" : ` · ${DECLARED_ARMS} declared`}`, armsRun === selected.length && (ONLY || armsRun === DECLARED_ARMS));
console.log(`\ndecided.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
