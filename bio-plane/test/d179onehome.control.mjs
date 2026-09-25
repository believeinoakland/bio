/* d179onehome.control.mjs — the NEGATIVE CONTROL for `test/d179onehome.test.mjs` (D-179, C-53.13).
 * NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/d179onehome.control.mjs            every arm
 *   node test/d179onehome.control.mjs <arm>      one arm
 *
 * project-sight.control.mjs's method exactly: each arm copies `src/`, `checks/` and `docprofile/` into a
 * uniquely-named temporary tree, patches the COPY (each anchor must occur EXACTLY ONCE — an arm that did not arm is a
 * finding), and runs the suite with D179_SRC pointed at it. The real `src/store.mjs` and `checks/bio-checks.mjs` are
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
const SUITE = join(PLANE, "test", "d179onehome.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/store.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: the refusal dropped. The second registration lands and MOVES A's row. */
  drop: {
    patches: [["store.mjs", "    /* DEC-49 REGION is-register-home */\n    if (homes.length) {",
               "    /* DEC-49 REGION is-register-home */\n    if (false && homes.length) {"]],
    mustFail: ["B registering A's bytes is REFUSED BY NAME", "and it names the capture",
               "an administrator's SESSION registering", "vera (never invited) registering",
               "THE FIRST BUNDLE'S REGISTER ROW IS BYTE-IDENTICAL AFTER",
               "and the hidden project's row too", "and no register row names B or C", "and neither B nor C was created",
               /* B now exists (created in §1), so §3's creation of B meets EXISTS, and X lives under B, not A */
               "B registering NEW bytes LANDS", "and X is still home under A, Z under B",
               "and is told NO bundle"],
    /* DECLARATION CORRECTED after the first run (the arm was right, the declaration wrong): it also named §4's two
       arms, but with no fence at all D's registration of X LANDS whoever holds it, so §4 stays green here. */
  },

  /* THE HOLDER-EXISTS JOIN DROPPED. Declared to stay GREEN: purge deletes a bundle's register rows with it, so no op
     leaves a register row whose bundle is gone for the join to skip — the join is defence for an orphan row made some
     other way (`registerAudit` counts that class as `orphan`), and this arm MEASURES that it is not reachable here. */
  nojoin: {
    patches: [["store.mjs", "FROM register r JOIN bundles b ON b.bundle_id = r.bundle_id\n        WHERE r.bundle_id <> ?",
               "FROM register r\n        WHERE r.bundle_id <> ?"]],
    mustFail: [],
  },

  /* D-15 BROKEN: the holder named to every caller. Only the told-no-bundle arm may fail. */
  disclose: {
    patches: [["store.mjs", "const named = !caller || this.#inSight(h.bundle_id, viewing.viewer ?? null);",
               "const named = true;"]],
    mustFail: ["and is told NO bundle"],
  },

  /* OVER-STRICTNESS: the SAME bundle asked too — a revision re-registering its own bytes is refused. */
  sameowner: {
    patches: [["store.mjs", "        WHERE r.bundle_id <> ? AND r.capture_sha IN (SELECT value FROM json_each(?)) LIMIT ?`,\n      bundleId,",
               "        WHERE r.bundle_id <> ('x' || ?) AND r.capture_sha IN (SELECT value FROM json_each(?)) LIMIT ?`,\n      bundleId,"]],
    mustFail: ["a REVISION of A re-registering its own bytes LANDS"],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). The arms patch a COPY of src/. */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d179onehome-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D179_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /d179onehome: (\d+) passed, (\d+) failed/.exec(out);
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
