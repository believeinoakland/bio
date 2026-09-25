/* homecensus.control.mjs — the NEGATIVE CONTROL for `test/homecensus.test.mjs` (REC-190, op=homecensus).
 * NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/homecensus.control.mjs            every arm
 *   node test/homecensus.control.mjs <arm>      one arm
 *
 * project-sight.control.mjs's method exactly: each arm copies `src/`, `checks/` and `docprofile/` into a
 * uniquely-named temporary tree, patches the COPY (each anchor must occur EXACTLY ONCE — an arm that did not arm is a
X the suite with REC190_SRC pointed at it. The real `src/store.mjs` and `checks/bio-checks.mjs` are
 * hashed before the first arm and after the last; the run fails loudly if either moved.
 *
 * WHAT EACH ARM MUST FAIL (by label fragment) IS DECLARED BEFORE ARMING; every other assertion MUST stay green.
 * RESULTS: the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { anchorTable } from "../scripts/anchortable.mjs";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "homecensus.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/store.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const PRED = "        if (home.bundle_id === r.bundle_id) continue;                     /* the different-bundle predicate */";
const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: the different-bundle predicate removed. Every row carrying a registered sha is listed, the
     home's own included, so the seeded store lists A's X rows AND B's own Y row. A was promoted before B, so X (A's
     row) is still listed first and the two first-entry arms are declared to HOLD. */
  nopred: {
    patches: [["store.mjs", PRED, "        /* REC-190 CONTROL: the different-bundle predicate removed */"]],
    mustFail: ["a clean store lists NONE", "the displaced row is found", "counted whole",
               "B's own capture Y and the shared notes are still NOT listed", "it is counted apart", "limit=0 lists no sha"],
  },

  /* THE LIAR (the row's accepts-when): the register's homes PLUS every sha carried by more than one bundle, homed at
     the greatest bundle id. It still finds the seeded move (X is homed by the register), so the moved-row arm alone
     cannot tell it from the truth; the CLEAN-STORE arm must read it by name.
     DECLARATION CORRECTED after the first run (the arm was right, the declaration wrong): it named the two first-entry
     arms as failing, on the belief that `files` walks in (bundle_id, path) order and A's data/notes.md precedes
     snapshots/doc.txt. The scan walks in INSERTION order (rowid; the primary key is a separate index), and the fixture
     sends snapshots/doc.txt before data/notes.md, so X is still listed first and those two arms HOLD. */
  liar: {
    patches: [["store.mjs", "    const bySha = new Map();\n    const walk = (table) => {\n      const out = { rows: 0, displaced: 0 };",
               "    const bySha = new Map();\n    const LIAR = new Map();\n    for (const r of this.sql.exec(`SELECT sha256, max(bundle_id) AS m, min(path) AS p FROM files GROUP BY sha256 HAVING count(DISTINCT bundle_id) > 1`)) LIAR.set(String(r.sha256).toLowerCase(), { bundle_id: r.m, path: r.p });\n    const walk = (table) => {\n      const out = { rows: 0, displaced: 0 };"],
              ["store.mjs", "        const home = homes.get(s);\n        if (!home) continue;\n        if (home.bundle_id === r.bundle_id) continue;",
               "        const home = homes.get(s) ?? LIAR.get(s);\n        if (!home) continue;\n        if (home.bundle_id === r.bundle_id) continue;"]],
    mustFail: ["a clean store lists NONE", "the displaced row is found", "counted whole", "B's own capture Y and the shared notes are still NOT listed",
               "it is counted apart", "limit=0 lists no sha"],
  },

  /* THE HOLDER-EXISTS CHECK dropped: a register row naming a bundle that is gone becomes a home. §4 and after.
     DECLARATION CORRECTED after the first run (the arm was right, the declaration wrong): it said only §4 may fail, but
     the orphan row §4 seeds is still there in §5, so `limit=0`'s whole count moves with it. */
  noexists: {
    patches: [["store.mjs", "      if (r.present === null) { reg.home_absent++; continue; }",
               "      if (false) { reg.home_absent++; continue; }"]],
    mustFail: ["it is counted apart", "limit=0 lists no sha"],
  },

  /* OVER-STRICTNESS: a fence tighter than its rule — a displaced row counted only when it sits at the register's
     PATH. The seeded move changed the path (B registered under its own), so the displaced row is MISSED. */
  overpath: {
    patches: [["store.mjs", PRED, "        if (home.bundle_id === r.bundle_id || home.path !== r.path) continue;"]],
    mustFail: ["the displaced row is found", "and every row of A's that carries it", "and the home's register path",
               "counted whole", "it is counted apart", "limit=0 lists no sha"],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `homecensus-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "utf8");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.replace(from, () => to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, REC190_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /homecensus: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", exit: r.status, missing, unexpected,
             firstFail: failed[0] ?? null, asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
const results = names.map(run);
for (const r of results) console.log(JSON.stringify(r));
const after = REAL.map(digest);
console.log(`real sources before: ${before.join(" · ")}`);
console.log(`real sources after:  ${after.join(" · ")}`);
const untouched = before.every((d, i) => d === after[i]);
console.log(`untouched: ${untouched ? "YES" : "NO — A REAL SOURCE MOVED"}`);
process.exit(untouched && results.every((r) => r.armed && r.asDeclared) ? 0 : 1);
