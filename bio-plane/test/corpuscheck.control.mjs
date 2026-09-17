/* M0-43 NEGATIVE CONTROL — the coverage audit, armed one variable at a time.
 *
 * Deliberately NOT a `.test.mjs`: the battery's runner discovers `*.test.mjs`, so this
 * driver moves no suite floor (the `m025-arm-census.mjs` / `nc-m036.mjs` /
 * `delegations.control.mjs` precedent). Run it from `bio-plane/`:
 *
 *     node test/corpuscheck.control.mjs
 *
 * THE METHOD HAZARD THIS DRIVER IS BUILT AROUND, and it has bitten this toolchain THREE
 * TIMES against these exact files. The last controls run against `plancheck` were defeated
 * by the METHOD dirtying the tree: a rename and a `chmod 000` each made the run fail on
 * UNPUBLISHED and exit 1 — a NAMED failure that felt like evidence while the subject was
 * never exercised at all. So every arm below drives `tools/corpuscheck.mjs` DIRECTLY, which
 * has no publication check of any kind and therefore cannot fail for a reason the arm did
 * not cause; the one plancheck-level arm runs `--local`, which skips the publication half.
 * Check what ELSE your method changed before believing any arm.
 *
 * RESTORES are cp-aside / cp-back verified by sha256 AND `cmp` AND a floored byte count —
 * never `git checkout --`, which restores to HEAD and would silently discard this session's
 * own uncommitted work in these very files (CLAUDE.md's trap, measured twice in two days).
 *
 * THE ARMS, as a MARKED ORDINAL LIST because `coverage.mjs`'s register refuses an
 * uncountable control declaration (D-233):
 *
 *   ARM 1. Remove a GOVERNED document's row from CORPUS-STANDARD.md §5 while the file still
 *          carries its front matter -> corpuscheck FAILS naming that file UNCLASSIFIED.
 *          THIS IS THE ROW'S OWN ARM: it proves discovery BEAT the hand-kept list rather
 *          than merely agreeing with it. Before M0-43 this edit was silent.
 *   ARM 2. Plant an unclassified .md on DISK under docs/development/ and a second under
 *          docs/development/research/ -> both FAIL by name. The suite's plant is injected
 *          rather than written, so this is the arm that drives the real filesystem walk.
 *   ARM 3. Widen an exclusion pattern to `docs/development/**.md` -> FAILS as too broad.
 *          This is the liar's pattern: without the guard that one row classifies the whole
 *          directory and the audit congratulates itself over everything.
 *   ARM 4. Add an exclusion row naming a GOVERNED document -> FAILS as shadowing.
 *   ARM 5. Blank an exclusion row's reason cell -> FAILS naming that pattern (§6's model is
 *          excluded WITH A REASON, not merely absent).
 *   ARM 6. Point an UNDECIDED row at a file that does not exist -> FAILS. The undecided
 *          list is drained, not left to rot.
 *   ARM 7. Make `population()` skip directories -> the suite's RECURSION arm FAILS and the
 *          governed documents under research/ leave the population. Armed in the TOOL, so
 *          it proves the subdirectory half is load-bearing and not decoration.
 *   ARM 8. OVER-STRICTNESS / baseline: nothing armed, tree restored -> corpuscheck reads
 *          exactly as it does today, 0 fail, and plancheck --local reads 0 fail. A
 *          discovery rule that reclassifies a file nobody asked it to reclassify has made a
 *          decision that belongs to Bob.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, unlinkSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = join(DIR, "..", "..");
const STD = join(ROOT, "docs/architecture/CORPUS-STANDARD.md");
const TOOL = join(ROOT, "tools/corpuscheck.mjs");

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const FLOOR = { [STD]: 8000, [TOOL]: 6000 };

/* A pristine copy under a unique name, restored by CONTENT and verified three ways. */
function guard(path) {
  const keep = `${path}.m043-pristine`;
  copyFileSync(path, keep);
  const before = sha(path), bytes = statSync(path).size;
  if (bytes < (FLOOR[path] ?? 1000)) throw new Error(`ANCHOR FAILED: ${path} is ${bytes} B, below its floor — refusing to arm against a file that is not what it should be`);
  return {
    bytes,
    restore() {
      copyFileSync(keep, path);
      const after = sha(path), okBytes = statSync(path).size === bytes;
      let cmp = true;
      try { execFileSync("cmp", [keep, path]); } catch { cmp = false; }
      unlinkSync(keep);
      const ok = after === before && okBytes && cmp;
      console.log(`      restored byte-identically: ${ok ? "YES" : "NO"} (${bytes} B, sha256 ${before.slice(0, 12)}…, cmp ${cmp ? "equal" : "DIFFERS"})`);
      if (!ok) throw new Error(`RESTORE FAILED for ${path} — stop and fix the tree by hand`);
    },
  };
}

function corpuscheck() {
  try {
    const out = execFileSync("node", [TOOL], { cwd: ROOT, encoding: "utf8" });
    return { code: 0, out };
  } catch (e) { return { code: e.status, out: `${e.stdout || ""}${e.stderr || ""}` }; }
}

let armed = 0, asDeclared = 0;
const arm = (n, what, run) => {
  armed++;
  console.log(`\nARM ${n} — ${what}`);
  const ok = run();
  console.log(`      ${ok ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`);
  if (ok) asDeclared++;
};

/* ---- anchors validated BEFORE anything is armed ------------------------------------- */
const std0 = readFileSync(STD, "utf8");
const ANCHORS = {
  govRow: "| `docs/development/SCHEDULER.md` |",
  excRow: "| `docs/development/QUEUE.md` | ledger |",
  undRow: "| `docs/development/MILESTONES.md` |",
  walk: "else if (e.endsWith(\".md\")) out.push(r);",
};
for (const [k, v] of Object.entries(ANCHORS)) {
  const hay = k === "walk" ? readFileSync(TOOL, "utf8") : std0;
  if (!hay.includes(v)) throw new Error(`ANCHOR ${k} not found — the arms would not arm; fix the anchor, do not proceed`);
}
const base = corpuscheck();
console.log(`BASELINE  exit ${base.code} · ${base.out.trim().split("\n").pop()}`);
if (base.code !== 0) throw new Error("BASELINE IS RED — establish the tree before arming anything");

/* ---- ARM 1 --------------------------------------------------------------------------- */
arm(1, "a GOVERNED document's §5 row removed, file still carrying front matter", () => {
  const g = guard(STD);
  try {
    const line = std0.split("\n").find((l) => l.startsWith(ANCHORS.govRow));
    writeFileSync(STD, std0.split("\n").filter((l) => l !== line).join("\n"));
    const r = corpuscheck();
    const named = /UNCLASSIFIED — docs\/development\/SCHEDULER\.md/.test(r.out);
    console.log(`      exit ${r.code} · named the de-rowed file: ${named ? "YES" : "NO"}`);
    return r.code === 1 && named;
  } finally { g.restore(); }
});

/* ---- ARM 2 --------------------------------------------------------------------------- */
arm(2, "an unclassified .md planted ON DISK, top level and in a subdirectory", () => {
  const a = join(ROOT, "docs/development/M043-CONTROL-PLANT.md");
  const b = join(ROOT, "docs/development/research/M043-CONTROL-PLANT-SUB.md");
  try {
    writeFileSync(a, "# A planted design\n\nNot in any table.\n");
    writeFileSync(b, "# A planted design in a subdirectory\n\nNot in any table.\n");
    const r = corpuscheck();
    const hitA = /UNCLASSIFIED — docs\/development\/M043-CONTROL-PLANT\.md/.test(r.out);
    const hitB = /UNCLASSIFIED — docs\/development\/research\/M043-CONTROL-PLANT-SUB\.md/.test(r.out);
    console.log(`      exit ${r.code} · top level: ${hitA ? "NAMED" : "MISSED"} · subdirectory: ${hitB ? "NAMED" : "MISSED"}`);
    return r.code === 1 && hitA && hitB;
  } finally {
    for (const p of [a, b]) if (existsSync(p)) unlinkSync(p);
    console.log(`      plants removed: ${!existsSync(a) && !existsSync(b) ? "YES" : "NO"}`);
  }
});

/* ---- ARM 3 --------------------------------------------------------------------------- */
arm(3, "an exclusion pattern widened to `docs/development/**.md` — the liar's pattern", () => {
  const g = guard(STD);
  try {
    writeFileSync(STD, std0.replace(ANCHORS.excRow, "| `docs/development/**.md` | ledger |"));
    const r = corpuscheck();
    const named = /is too broad/.test(r.out) && /docs\/development\/\*\*\.md/.test(r.out);
    console.log(`      exit ${r.code} · refused the broad pattern: ${named ? "YES" : "NO"}`);
    return r.code === 1 && named;
  } finally { g.restore(); }
});

/* ---- ARM 4 --------------------------------------------------------------------------- */
arm(4, "an exclusion row naming a GOVERNED document", () => {
  const g = guard(STD);
  try {
    writeFileSync(STD, std0.replace(ANCHORS.excRow,
      "| `docs/development/SCHEDULER.md` | ledger | a reason long enough to pass the length check |\n" + ANCHORS.excRow));
    const r = corpuscheck();
    const named = /shadows governed document/.test(r.out) && /SCHEDULER\.md/.test(r.out);
    console.log(`      exit ${r.code} · refused the shadow: ${named ? "YES" : "NO"}`);
    return r.code === 1 && named;
  } finally { g.restore(); }
});

/* ---- ARM 5 --------------------------------------------------------------------------- */
arm(5, "an exclusion row's reason cell blanked", () => {
  const g = guard(STD);
  try {
    const line = std0.split("\n").find((l) => l.startsWith(ANCHORS.excRow));
    writeFileSync(STD, std0.replace(line, "| `docs/development/QUEUE.md` | ledger |  |"));
    const r = corpuscheck();
    const named = /carries no reason/.test(r.out) && /QUEUE\.md/.test(r.out);
    console.log(`      exit ${r.code} · refused the reasonless exclusion: ${named ? "YES" : "NO"}`);
    return r.code === 1 && named;
  } finally { g.restore(); }
});

/* ---- ARM 6 --------------------------------------------------------------------------- */
arm(6, "an UNDECIDED row pointed at a file that does not exist", () => {
  const g = guard(STD);
  try {
    const line = std0.split("\n").find((l) => l.startsWith(ANCHORS.undRow));
    writeFileSync(STD, std0.replace(line, line.replace("MILESTONES.md", "MILESTONES-GONE.md")));
    const r = corpuscheck();
    const named = /names a file that does not exist/.test(r.out) && /MILESTONES-GONE\.md/.test(r.out);
    console.log(`      exit ${r.code} · refused the stale row: ${named ? "YES" : "NO"}`);
    return r.code === 1 && named;
  } finally { g.restore(); }
});

/* ---- ARM 7 --------------------------------------------------------------------------- */
arm(7, "`population()` made NON-RECURSIVE in the tool — is the subdirectory half load-bearing?", () => {
  const g = guard(TOOL);
  try {
    const src = readFileSync(TOOL, "utf8");
    writeFileSync(TOOL, src.replace("if (statSync(join(ROOT, r)).isDirectory()) walk(r);",
      "if (statSync(join(ROOT, r)).isDirectory()) continue;"));
    let suite;
    try {
      execFileSync("node", ["test/corpuscheck.test.mjs"], { cwd: join(ROOT, "bio-plane"), encoding: "utf8" });
      suite = { code: 0, out: "" };
    } catch (e) { suite = { code: e.status, out: `${e.stdout || ""}` }; }
    const armFailed = /FAIL {2}population\(\) is RECURSIVE/.test(suite.out);
    console.log(`      suite exit ${suite.code} · the RECURSION arm failed: ${armFailed ? "YES" : "NO"}`);
    return suite.code === 1 && armFailed;
  } finally { g.restore(); }
});

/* ---- ARM 8 --------------------------------------------------------------------------- */
arm(8, "OVER-STRICTNESS — nothing armed, the restored tree must read exactly as it did", () => {
  const r = corpuscheck();
  const same = r.out === base.out && r.code === 0;
  let pl;
  try { pl = execFileSync("node", ["tools/plancheck.mjs", "--local"], { cwd: ROOT, encoding: "utf8" }); }
  catch (e) { pl = `${e.stdout || ""}EXIT ${e.status}`; }
  const plGreen = /plancheck: 0 fail/.test(pl);
  console.log(`      corpuscheck output byte-identical to baseline: ${same ? "YES" : "NO"}`);
  console.log(`      plancheck --local 0 fail: ${plGreen ? "YES" : "NO"}`);
  console.log(`      ${base.out.trim().split("\n").pop()}`);
  return same && plGreen;
});

console.log(`\nM0-43 control: ${armed} arm(s) armed, ${asDeclared} AS DECLARED, ${armed - asDeclared} not.`);
process.exit(armed === asDeclared ? 0 : 1);
