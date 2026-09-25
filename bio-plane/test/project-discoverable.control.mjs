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
    /* ANCHOR MOVED 2026-09-24 by D-497, AND THE MOVE IS THIS ARM'S WHOLE POINT RESTATED. The default used to
       live in `#visibilityOf`; it now lives in the ONE statement that derives `project_sight`, which
       `#visibilityOf` reads and the directory JOINS. So flipping it here must move BOTH — the per-project acts
       AND the directory — and the run below is what says it does. That is the property this arm caught
       missing on 2026-09-23 (see the note under `mustFail`), and it is the property D-497 had to keep while
       putting the directory's candidates into SQL. The patch reproduces the old arm's semantics exactly: no
       act reads DISCOVERABLE, an explicit `hidden` act is still honoured. */
    patches: [["store.mjs", "                   THEN 'discoverable' ELSE 'hidden' END,",
               "                   THEN 'discoverable'\n"
               + "                   WHEN (SELECT pv.setting FROM project_visibility pv\n"
               + "                          WHERE pv.project_id = b.bundle_id\n"
               + "                          ORDER BY pv.seq DESC LIMIT 1) = 'hidden' THEN 'hidden'\n"
               + "                   ELSE 'discoverable' END,"]],
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
    /* ANCHOR MOVED 2026-09-24 by D-497, to the same rule's new home: the derivation's correlated subquery
       rather than `#visibilityOf`'s read, which no longer touches the act log at all. The spelling is the
       same one this arm always used — the row holding the project's highest seq. */
    patches: [["store.mjs", "              CASE WHEN (SELECT pv.setting FROM project_visibility pv\n                          WHERE pv.project_id = b.bundle_id\n                          ORDER BY pv.seq DESC LIMIT 1) = 'discoverable'",
               "              CASE WHEN (SELECT pv.setting FROM project_visibility pv\n                          WHERE pv.seq = (SELECT MAX(p2.seq) FROM project_visibility p2\n                                           WHERE p2.project_id = b.bundle_id)) = 'discoverable'"]],
    mustFail: [], mayFail: [],
  },

  /* D-497 — THE INDEX IS A DERIVATION AND NOT A SECOND RECORD, and this arm is what makes that a measurement
     rather than a comment. The owner's act still writes `project_visibility`; only the re-derivation that
     follows it is removed, so the act log and the index disagree from that moment until the next boot. The
     whole of §6 and the EXISTENCE sections rest on an act TAKING EFFECT, so they must fail by name. A green
     here would mean something else is reading the log behind the index's back — which is the second copy
     D-497 exists to remove. */
  "act-not-reindexed": {
    /* ANCHOR MOVED 2026-09-25 by REC-150, and only the anchor: the owner's act now lapses the project's open join
       requests between the re-derivation and the return (§7.14), so the old anchor — the call followed directly by
       the return — no longer occurred. The patch still removes exactly the one re-derivation after the act and
       nothing else, so the arm's subject and declaration are unchanged. */
    patches: [["store.mjs", "    this.#reindexProjectSight(projectId);\n    /* REC-150 (§7.14, \"The request to join\"): SETTING",
               "    /* REC-150 (§7.14, \"The request to join\"): SETTING"]],
    /* RUN 2026-09-24: 112/44, and the FIRST declaration was WRONG in both directions — recorded rather than
       smoothed, because what it got wrong is the useful part. I declared `3a:` and `6f:`, and BOTH PASSED:
       §3a is P's own owner reading P, which needs no sight of an index, and §6f is a refusal vera gets either
       way. What actually fails is §3b (vera's DIRECTORY does not list P, because the owner's act never
       reached the rows the directory joins) and every §3h/§3i act at P (each answers as for a project that
       does not exist instead of C-70.1). That is the arm landing exactly where D-497 moved the reading — on
       the directory and on EXISTENCE — and not on the owner's own view, which never consults the index.
       AND ONE CONSEQUENCE ON THE FIXTURE, declared here rather than left to be discovered: §1a0 fails because
       it COUNTS the calls into the derivation (3, the number D-497 landed) before neutering them for the
       predecessor tree, and this arm removes one of the three. The fixture's guard firing on a deliberate
       removal is the guard working; it is the same line that would catch a call left standing. */
    mustFail: ["3b:", "3h:", "3i:"],
    mayFail: ["1a0:", "3b:", "3h:", "3i:", "6j:", "6k:"],
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
