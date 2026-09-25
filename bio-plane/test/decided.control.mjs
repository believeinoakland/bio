#!/usr/bin/env node
/* decided.control.mjs — the NEGATIVE-CONTROL DRIVER of M0-97, D-341 and M0-99, 23 ARMS PLUS A BASELINE,
 * for `tools/decided.mjs`, the repository's `.gitignore` line for its index, and the suite
 * `bio-plane/test/decided.test.mjs`.
 *
 *     node bio-plane/test/decided.control.mjs          # from the repo root: the baseline, then every arm
 *     node bio-plane/test/decided.control.mjs 6        # the baseline, then one arm
 *
 * THE RULES, which are this estate's and not this file's: each arm patches ONE subject ALONE from a
 * pristine tree — `tools/decided.mjs` for arms 1–15 and 17–23, the repository's `.gitignore` for
 * arm 16 (M0-99: the line that keeps the index out of the committed tree) — and DECLARES before
 * arming which NAMED assertion must fail; the suite must still reach its own foot (a crash is a
 * second variable, not a result), and one assertion that no arm can reach — the oracle's own
 * `git grep` — must stay green, so a red is not collateral. D-331: every anchor is counted in the
 * file it patches BEFORE anything is armed, through `preflight`. Every restore is verified by
 * sha256 AND `cmp` against the arm's own uniquely-named copy in `.m097-harness/`, with the byte count
 * printed and floored; the copy is removed as its restore verifies, and an `exit` hook restores
 * every subject from memory and removes the pen on EVERY exit. Every child is asynchronous, so a
 * signal is honoured when it arrives rather than after the run.
 *
 * THE LIMIT, STATED FIRST (M0-42): nothing here proves a control RAN. The run of record is written,
 * dated and with its figures, into the suite's `NEGATIVE CONTROL:` block and each item's claim.
 */
import "./stdio.mjs";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawn, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { preflight } from "../scripts/armdecay.mjs";
import { anchorTable } from "../scripts/anchortable.mjs";

const REPO = fileURLToPath(new URL("../../", import.meta.url));
const TOOL = path.join(REPO, "tools", "decided.mjs");
const IGNORE = path.join(REPO, ".gitignore");
const SUITE = path.join(REPO, "bio-plane", "test", "decided.test.mjs");
const PEN = path.join(REPO, ".m097-harness");
const ONLY = process.argv[2] || null;
const DECLARED_ARMS = 23;

const sha = (b) => createHash("sha256").update(b).digest("hex");
/* THE SUBJECTS, each held in memory with its digest and a floor its restore must clear — so a
   restore over a truncated or empty file (`e3b0c442…`) can never read as byte-identical. */
const SUBJECTS = new Map([[TOOL, { name: "tools/decided.mjs", floor: 20000 }], [IGNORE, { name: ".gitignore", floor: 5000 }]]);
for (const [file, s] of SUBJECTS) {
  s.pristine = fs.readFileSync(file);
  s.digest = sha(s.pristine);
  if (s.pristine.length < s.floor || s.digest === sha(Buffer.alloc(0))) {
    console.log(`** ${s.name} is implausibly small (${s.pristine.length} B); refusing to arm over it`);
    process.exit(1);
  }
  console.log(`pristine ${s.name}: ${s.pristine.length} bytes, sha256 ${s.digest.slice(0, 12)}…`);
}

let pass = 0, fail = 0;
const t = (label, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); ok ? pass++ : fail++; };

/* ---------------------------------------------------------------- the pen, on every exit */
const WRITTEN = new Set();
process.on("exit", (code) => {
  for (const [file, s] of SUBJECTS) {
    if (sha(fs.readFileSync(file)) === s.digest) continue;
    fs.writeFileSync(file, s.pristine);
    console.log(`  exit ${code}: ${s.name} restored from memory — sha256 ${sha(fs.readFileSync(file)) === s.digest ? "match" : "**MISMATCH**"}`);
  }
  for (const p of WRITTEN) { try { fs.rmSync(p, { force: true }); } catch {} }
  /* `rmdirSync` alone, never a listing first: it refuses a non-empty directory, so a copy kept after a
     failed restore stays as evidence — and `hygiene.test.mjs` fails any new `readdirSync` walk by name
     (it failed this driver's first draft: "every walk of this class is GUARDED or NAMED"). */
  try { if (fs.existsSync(PEN)) fs.rmdirSync(PEN); } catch {}
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
  /* M0-99's arms, added 2026-09-22. A patch's third element names the file it writes; none means
     `tools/decided.mjs`. Arm 16 is the row's own: the repository's ignore line removed, so every
     fixture that copies the real `.gitignore` commits its index again and the two branches conflict. */
  { id: "16", title: "M0-99's OWN CONTROL — the `.gitignore` line removed: the index is committed again",
    patches: [["\ndocs/DECIDED.md\n", "\n", IGNORE]],
    mustBreak: "THE ACCEPTANCE — rulings edited on two branches MERGE WITH NO DECIDED.md CONFLICT",
    alsoBreak: ["...AND ITS OWN .gitignore IGNORES IT", "...and no commit on either branch, nor the merge, carries the index"] },
  { id: "17", title: "the freshness call never writes",
    patches: [["  if (write && state !== \"current\") {", "  if (false) {"]],
    mustBreak: "THE FRESHNESS CALL WRITES AN ABSENT INDEX", alsoBreak: ["A STALE INDEX IS REWRITTEN"] },
  { id: "18", title: "the freshness call rewrites a CURRENT index — the tree is touched when nothing moved",
    patches: [["  if (write && state !== \"current\") {", "  if (write) {"]],
    mustBreak: "A CURRENT INDEX IS NOT REWRITTEN" },
  { id: "19", title: "the predicate blind to a TRACKED index — the liar's own arm, plancheck 2b's premise",
    patches: [["    tracked: ls.status === 0 && (ls.stdout || \"\").trim() !== \"\",", "    tracked: false,"]],
    mustBreak: "...and the predicate plancheck arm 2b reads NAMES it" },
  { id: "20", title: "any ignore rule counts — a per-clone exclude read as the repository ignoring it",
    patches: [["  const carried = !!rule && !rule[1].startsWith(\"/\") && /(^|\\/)\\.gitignore$/.test(rule[1])\n    && git([\"ls-files\", \"--\", rule[1]]).stdout.trim() === rule[1];",
               "  const carried = !!rule;"]],
    mustBreak: "A RULE IN .git/info/exclude IS NOT THE REPOSITORY IGNORING IT" },
  { id: "21", title: "a NEGATED rule read as an ignore",
    patches: [["    ignored: carried && !rule[3].startsWith(\"!\"),", "    ignored: carried,"]],
    mustBreak: "A NEGATED RULE IS NOT AN IGNORE" },
  { id: "22", title: "`--check` falls through to the query — the retired flag answers as a phrase, exit 0",
    patches: [["} else if (arg === \"--check\") {", "} else if (false) {"]],
    mustBreak: "`--check` is RETIRED, LOUDLY" },
  { id: "23", title: "OVER-STRICTNESS's own control — only the ROOT `.gitignore` counts",
    patches: [["/(^|\\/)\\.gitignore$/.test(rule[1])", "/^\\.gitignore$/.test(rule[1])"]],
    mustBreak: "OVER-STRICTNESS: a rule in a NESTED, committed .gitignore" },
];
if (ARMS.length !== DECLARED_ARMS) { console.log(`** ${ARMS.length} arms in the table against ${DECLARED_ARMS} declared — the head is wrong`); process.exit(1); }

const selected = ARMS.filter((a) => !ONLY || a.id === ONLY);
if (ONLY && !selected.length) { console.log(`** no arm ${ONLY}`); process.exit(1); }
const fileOf = (patch) => patch[2] || TOOL;
/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(ARMS.flatMap((a) => a.patches.map((p) => ({ arm: a.id, file: fileOf(p), find: p[0], put: p[1] }))));
const rows = preflight("decided.control", ARMS.map((a) => ({ id: a.id, anchors: a.patches.map((p) => ({ file: fileOf(p), needle: p[0] })) })),
  { fatalFor: selected.map((a) => a.id) });
const dead = rows.filter((r) => r.n !== r.want && selected.some((a) => a.id === r.id));
if (dead.length) { console.log(`** ${dead.length} anchor(s) of the selected arm(s) are not live — REFUSED TO ARM BLIND`); process.exit(1); }

const copyOf = (id, file) => path.join(PEN, `arm${id}--${SUBJECTS.get(file).name.replace(/\//g, "_")}`);
/* Every subject the arm patched is restored and verified; the others are verified untouched, so an
   arm that wrote a second file is caught at its own restore rather than at the next arm's. */
function restore(id, touched) {
  let all = true;
  for (const [file, s] of SUBJECTS) {
    if (touched.has(file)) fs.writeFileSync(file, s.pristine);
    const now = fs.readFileSync(file);
    const copy = touched.has(file) ? copyOf(id, file) : null;
    let cmp = true;
    if (copy) { try { execFileSync("cmp", ["-s", file, copy]); } catch { cmp = false; } }
    const ok = sha(now) === s.digest && cmp && now.length >= s.floor;
    t(`arm ${id} · ${s.name} ${copy ? "RESTORED" : "untouched"} byte-identically (${now.length} B, floor ${s.floor}, sha256 ${ok ? "match" : "**MISMATCH**"}${copy ? `, cmp ${cmp ? "identical" : "DIFFERS"}` : ""})`, ok);
    if (ok && copy) { fs.rmSync(copy, { force: true }); WRITTEN.delete(copy); }
    all = all && ok;
  }
  return all;
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
  const touched = new Set(a.patches.map(fileOf));
  const next = new Map();
  for (const file of touched) {
    const copy = copyOf(a.id, file);
    fs.writeFileSync(copy, SUBJECTS.get(file).pristine); WRITTEN.add(copy);
    next.set(file, SUBJECTS.get(file).pristine.toString("utf8"));
  }
  let armed = true;
  for (const p of a.patches) {
    const src = next.get(fileOf(p));
    const n = src.split(p[0]).length - 1;
    if (n !== 1) { armed = false; break; }
    next.set(fileOf(p), src.replace(p[0], () => p[1]));
  }
  t(`arm ${a.id} · ARMED (${a.patches.length} patch${a.patches.length === 1 ? "" : "es"} in ${[...touched].map((f) => SUBJECTS.get(f).name).join(", ")}, each matched exactly once)`, armed);
  if (armed) {
    for (const [file, src] of next) fs.writeFileSync(file, src);
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
  if (!restore(a.id, touched)) { console.log("** a restore did not verify; stopping before the next arm measures an unsound tree"); process.exit(1); }
}

console.log("\n--- CLOSING · every arm restored ---");
{
  const s = await runSuite();
  t(`closing · the suite is GREEN again, so no arm leaked (${s.pass} pass, ${s.fail} fail)`, s.foot && s.fail === 0 && s.code === 0);
  for (const [file, sub] of SUBJECTS)
    t(`closing · ${sub.name} is the pristine file (sha256 ${sub.digest.slice(0, 12)}…)`, sha(fs.readFileSync(file)) === sub.digest);
}
t(`the arm tally held: ${armsRun} run of ${selected.length} selected${ONLY ? "" : ` · ${DECLARED_ARMS} declared`}`, armsRun === selected.length && (ONLY || armsRun === DECLARED_ARMS));
console.log(`\ndecided.control: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
