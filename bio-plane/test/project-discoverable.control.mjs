/* NEGATIVE CONTROL for `test/project-discoverable.test.mjs` (REC-149 / C-70 / IC-222). Deliberately NOT a
 * `.test.mjs`: it edits COPIES of the sources while it runs and the battery must not discover it.
 *
 * Each arm copies `src/` and `checks/` into a temporary tree, applies its patch there (asserting each anchor
 * occurs EXACTLY ONCE — an arm that did not arm is a finding, never a pass), runs the suite against the copy,
 * and compares what failed with what the arm DECLARED before arming:
 *   mustFail — every fragment must match at least one FAIL line (the defect is caught, by name);
 *   mayFail  — failures the arm is allowed to cause as well (its consequences, declared, not discovered);
 *   anything else that fails is UNDECLARED and the arm is NOT AS DECLARED.
 * The real sources are hashed before and after, and the run says whether they were untouched.
 *
 * Run from `bio-plane/`: `node test/project-discoverable.control.mjs [arm]`. */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "project-discoverable.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/query.mjs", "src/schema.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const ARMS = {
  baseline: { patches: [], mustFail: [], mayFail: [] },

  /* THE ROW'S OWN CONTROL — "How a liar passes it: widening `viewerPredicate` passes the directory arm and leaks
     contents." The participation arm of the ONE compilation point admits every DISCOVERABLE project to every
     member. The contents arms (§5) MUST fail by name. Declared as consequences: the directory no longer lists P
     (the caller now has FULL sight, so P is not a project to join), the acts at P no longer answer C-70.1, and
     the reads at P now answer for a project that exists. */
  "widen-viewerPredicate": {
    patches: [["query.mjs", "             WHERE am.member_id = ? AND am.role = 'admin' AND am.status = 'active'))`,",
               "             WHERE am.member_id = ? AND am.role = 'admin' AND am.status = 'active')\n"
               + "           OR EXISTS (SELECT 1 FROM project_visibility pv WHERE pv.project_id = b.bundle_id\n"
               + "                        AND pv.setting = 'discoverable'))`,"]],
    mustFail: ["5a: CONTENTS: op=list", "5b: CONTENTS: op=list", "5a: CONTENTS: op=backlinks", "5b: CONTENTS: op=backlinks"],
    /* CORRECTED after the first run (2026-09-23), recorded not smoothed: NOT AS DECLARED, because the widening
       reads ANY discoverable row ever written rather than the latest, so once §6 sets P hidden again vera still
       sees it FULLY — §6f (she gets the owner refusal, not C-70.1) and every §6k arm fail. The arm was right and
       the declaration was short; those are its consequences and are declared here. */
    mayFail: ["5a: CONTENTS", "5b: CONTENTS", "3b:", "3h:", "3i:", "3j:", "3l:", "7c:", "6f:", "6k:"],
  },

  /* EXISTENCE ANSWERED AS ABSENT — REC-138's answer kept at a discoverable project: every act says "does not
     exist" about a project the directory just showed. Every §3h arm MUST fail, and §6f. */
  "existence-as-absent": {
    patches: [["store.mjs", "    if (viewer === null || viewer === undefined) return null;\n    return this.#sight(projectId, viewer) === Store.SIGHT_EXISTENCE",
               "    if (true) return null;\n    return this.#sight(projectId, viewer) === Store.SIGHT_EXISTENCE"]],
    mustFail: ["3h: AT EXISTENCE, op=promote", "3h: AT EXISTENCE, op=cite", "3h: AT EXISTENCE, op=projectjoin",
               "3h: AT EXISTENCE, op=airunopen", "3h: AT EXISTENCE, op=projectvisibilityset", "6f:"],
    mayFail: ["3h:", "3i:", "3j:"],
  },

  /* THE DEFAULT FLIPPED — a project with no record reads DISCOVERABLE. The predecessor's projects then show
     themselves to a member who was promised they would not: §1's and §2's arms MUST fail. */
  "default-discoverable": {
    patches: [["store.mjs", "    return r && r.setting === \"discoverable\" ? \"discoverable\" : \"hidden\";",
               "    return r && r.setting === \"hidden\" ? \"hidden\" : \"discoverable\";"]],
    /* FIRST RUN (2026-09-23) NOT AS DECLARED, and it was the SUBJECT that was wrong: 1e and 2e PASSED — the
       directory took its candidates from the visibility table, a second copy of "no record = hidden", so the flipped
       default never reached it. The directory now asks `#sight` over every project; re-run, as declared. */
    mustFail: ["1c:", "1d:", "1e:", "2b: HIDDEN = ABSENT, raw: op=cite", "2e:"],
    /* Second run: 3e and 3g failed undeclared — under the flipped default EVERY project a caller is not in is
       offered (Q to olga, and to both of them the surfacing-run harness's own `REC-171 fixture project`). A
       consequence of the arm, read off the failure text, and declared. */
    mayFail: ["2b:", "2d:", "3b:", "3d:", "3e:", "3g:", "3m:", "6j:", "6k:"],
  },

  /* THE OWNER FENCE DROPPED — anybody who can see the project sets it. §6's refusals MUST fail. */
  "owner-fence-dropped": {
    patches: [["store.mjs", "    if (!this.#isProjectOwner(projectId, by))\n      return refusal(\"PROJECT_VISIBILITY_NOT_THE_OWNER\"",
               "    if (false)\n      return refusal(\"PROJECT_VISIBILITY_NOT_THE_OWNER\""]],
    mustFail: ["6a:", "6b:", "6c:", "6d:", "6e:"],
    /* CORRECTED after the first run (2026-09-23): §6f failed undeclared — with the fence gone, olga's §6a act
       really set P HIDDEN, so vera then met a hidden project (NONE) instead of EXISTENCE. A consequence. */
    mayFail: ["6f:", "6h:", "6i:", "6j:", "6k:", "7c:"],
  },

  /* OVER-STRICTNESS: the latest setting read by a different, correct spelling (the row holding the project's
     highest seq). Correct work in a form the suite did not anticipate — nothing may fail. */
  "latest-by-max-seq": {
    patches: [["store.mjs", "    const r = this.#one(`SELECT setting FROM project_visibility WHERE project_id=? ORDER BY seq DESC LIMIT 1`,\n      projectId);",
               "    const r = this.#one(`SELECT setting FROM project_visibility WHERE seq = (SELECT MAX(seq) FROM project_visibility WHERE project_id=?)`,\n      projectId);"]],
    mustFail: [], mayFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `project-discoverable-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, PROJECT_DISCOVERABLE_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /project-discoverable: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => ![...arm.mustFail, ...arm.mayFail].some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0
                         && (arm.mustFail.length > 0 || failed.length === 0) };
  } finally { rmSync(root, { recursive: true, force: true }); }
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm ${want}; arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }
let bad = 0;
for (const n of names) {
  const r = run(n);
  if (!r.armed) { console.log(`  ARM DID NOT ARM  ${n}: ${r.why}`); bad++; continue; }
  console.log(`  ${r.asDeclared ? "AS DECLARED" : "NOT AS DECLARED"}  ${n}  pass/fail ${r.tally}`
    + (r.missing.length ? `\n      declared to fail but passed: ${JSON.stringify(r.missing)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected)}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
if (!untouched) bad++;
process.exit(bad ? 1 : 0);
