/* NEGATIVE CONTROL for `test/project-discoverable.test.mjs` (REC-149 / C-70 / IC-231). Deliberately NOT a
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
    /* EXTENDED 2026-09-25 by REC-196: "3l+:" is §3l's companion arm (a C-70.1 carries nothing more), and it falls with
       §3l under a widened predicate for the same reason — nobody is at EXISTENCE any more. */
    mayFail: ["5a: CONTENTS", "5b: CONTENTS", "3b:", "3h:", "3i:", "3j:", "3l:", "3l+:", "7c:", "6f:", "6k:"],
  },

  /* EXISTENCE ANSWERED AS ABSENT — REC-138's answer kept at a discoverable project: every act says "does not
     exist" about a project the directory just showed. Every §3h arm MUST fail, and §6f. */
  /* RETIRED 2026-09-26 (T3, legacy-tests; K84 (2)): the arm existence-as-absent mutated the EXISTENCE answer (`if (viewer === null || viewer === undefined) return null;` ... `SIGHT_EXISTENCE`) in src/store.mjs, which moved to src/membership/index.mjs (grep `viewer === null || viewer === undefined`); its anchor no longer occurs and it cannot arm. */

  /* THE DEFAULT FLIPPED — a project with no record reads DISCOVERABLE. The predecessor's projects then show
     themselves to a member who was promised they would not: §1's and §2's arms MUST fail. */
  /* RETIRED 2026-09-26 (T3, legacy-tests; K84 (2)): the arm default-discoverable mutated the `project_sight` derivation's default (`THEN 'discoverable' ELSE 'hidden' END`) in src/store.mjs, which moved to src/membership/index.mjs (grep `THEN 'discoverable' ELSE 'hidden' END`); its anchor no longer occurs and it cannot arm. */

  /* THE OWNER FENCE DROPPED — anybody who can see the project sets it. §6's refusals MUST fail. */
  /* RETIRED 2026-09-26 (T3, legacy-tests; K84 (2)): the arm owner-fence-dropped mutated the visibility act's owner fence (`PROJECT_VISIBILITY_NOT_THE_OWNER`) in src/store.mjs, which moved to src/membership/index.mjs (grep `PROJECT_VISIBILITY_NOT_THE_OWNER`, `reindexProjectSight(projectId)`); its anchor no longer occurs and it cannot arm. */

  /* OVER-STRICTNESS: the latest setting read by a different, correct spelling (the row holding the project's
     highest seq). Correct work in a form the suite did not anticipate — nothing may fail. */
  /* RETIRED 2026-09-26 (T3, legacy-tests; K84 (2)): the arm latest-by-max-seq mutated the `project_sight` derivation's latest-setting subquery (`SELECT pv.setting FROM project_visibility pv`) in src/store.mjs, which moved to src/membership/index.mjs (grep `SELECT pv.setting FROM project_visibility pv`); its anchor no longer occurs and it cannot arm. */

  /* D-497 — THE INDEX IS A DERIVATION AND NOT A SECOND RECORD, and this arm is what makes that a measurement
     rather than a comment. The owner's act still writes `project_visibility`; only the re-derivation that
     follows it is removed, so the act log and the index disagree from that moment until the next boot. The
     whole of §6 and the EXISTENCE sections rest on an act TAKING EFFECT, so they must fail by name. A green
     here would mean something else is reading the log behind the index's back — which is the second copy
     D-497 exists to remove. */
  /* RETIRED 2026-09-26 (T3, legacy-tests; K84 (2)): the arm act-not-reindexed mutated the visibility act's re-derivation (`this.#reindexProjectSight(projectId)`) in src/store.mjs, which moved to src/membership/index.mjs (grep `PROJECT_VISIBILITY_NOT_THE_OWNER`, `reindexProjectSight(projectId)`); its anchor no longer occurs and it cannot arm. */
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `project-discoverable-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(REPO, "jurisdictions"), join(tree, "jurisdictions"), { recursive: true });
    /* the plane imports pdf-pixels' crop from beside it (content R32, T5): the mirror carries it (T5-12). */
    cpSync(join(REPO, "pdf-worker", "src"), join(tree, "pdf-worker", "src"), { recursive: true });
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
