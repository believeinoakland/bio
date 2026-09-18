/* project-sight.control.mjs — the NEGATIVE CONTROL for `test/project-sight.test.mjs`
 * (REC-138 / D-426 / IC-155). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/project-sight.control.mjs            every arm
 *   node test/project-sight.control.mjs <arm>      one arm
 *
 * HOW IT ARMS, and why it never edits a real source. Each arm copies `src/` into a uniquely-named
 * temporary tree, applies its patch there (asserting each anchor occurs EXACTLY ONCE — an arm that
 * did not arm is a finding, not a pass), and runs the suite with PROJECT_SIGHT_SRC pointed at the
 * copy. The real `src/index.mjs` and `src/store.mjs` are hashed (sha256 and byte length) before the
 * first arm and after the last, and the run fails loudly if either moved.
 *
 * EACH ARM BREAKS ONE THING, and what it MUST fail (by label fragment) is DECLARED BEFORE ARMING;
 * every other assertion MUST stay green.
 *
 * RESULTS: see the header of `test/project-sight.test.mjs` and IC-155.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "project-sight.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const SIGHT_LINE = "if (!p || !this.#inSight(p.bundle_id, viewer)) return Store.#noSuchProject(project);";
const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE BRIEF'S CONTROL 1: ONE act's distinguishing answer restored — `cite` resolves its project with
     the bare lookup again, every other act held open. Only cite's two arms may go red. */
  "cite-distinguishing": {
    patches: [["store.mjs", `    ${SIGHT_LINE}\n    /* Through normalizeType`,
               "    if (!p) return Store.#noSuchProject(project);\n    /* Through normalizeType"]],
    mustFail: ["HIDDEN = ABSENT, raw (status, content type, body): op=cite", "NEVER POSITIONAL TO THE UNSIGHTED: op=cite"],
  },

  /* THE BRIEF'S CONTROL 2: the ORDER swapped at `#edgeTransition` — the positional check asked BEFORE
     the sight gate. The gate is still there; C-56.1 now answers first, so sever's and reinstate's
     answers disclose the project, and the C-56-discloses arms must say so. */
  "position-first": {
    patches: [["store.mjs", `a project this viewer cannot see answers as absent. */\n    ${SIGHT_LINE}`,
               "a project this viewer cannot see answers as absent. */\n    if (!p) return Store.#noSuchProject(project);"],
              ["store.mjs", "\"sever\" : \"reinstate\");\n    if (denied) return denied;",
               "\"sever\" : \"reinstate\");\n    if (denied) return denied;\n"
               + `    if (!this.#inSight(p.bundle_id, viewer)) return Store.#noSuchProject(project);`]],
    mustFail: ["HIDDEN = ABSENT, raw (status, content type, body): op=sever", "NEVER POSITIONAL TO THE UNSIGHTED: op=sever",
               "HIDDEN = ABSENT, raw (status, content type, body): op=reinstate", "NEVER POSITIONAL TO THE UNSIGHTED: op=reinstate"],
  },

  /* THE LIAR: not-found to EVERY MEMBER on every project. Every byte-identity arm stays green — that
     is the lie — and the arms of callers who CAN see the project are what must catch it.
     METHOD CORRECTED after the first run (2026-09-18): the first draft lied to every non-machine
     viewer, which included the fixture's own direct store call inviting olga, so the suite threw in
     its fixture and measured nothing (a second variable perturbed). The lie is now told to every
     `member:` viewer; machine credentials and the operator-internal `admin` viewer (the fixture's
     store call, and the founder's session) are spared, so the founder's two arms stay green here and
     the declaration relies on the members' arms. */
  "not-found-to-everyone": {
    patches: [["store.mjs", "  #inSight(bundleId, viewer) {\n    const g = viewerPredicate(viewer);",
               "  #inSight(bundleId, viewer) {\n"
               + "    if (String(viewer ?? \"\").startsWith(\"member:\")\n"
               + "        && this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, bundleId)?.object_type === \"project\") return false;\n"
               + "    const g = viewerPredicate(viewer);"]],
    mustFail: ["SEES, NO ROLE:", "JOINED:"],
  },

  /* THE ROSTER STAMP DROPPED at the control plane: the roster acts receive no viewer, and the store
     fails CLOSED — every person is answered NO_SUCH_PROJECT on them, the owner included. That is what
     makes "the control plane always stamps it, and the store fails closed without it" a measurement. */
  "roster-stamp-dropped": {
    patches: [["index.mjs", "        || PROJECT_ACTIONS.includes(op)\n        || REC30_VIEWER_READS.includes(op)) {",
               "        || REC30_VIEWER_READS.includes(op)) {"]],
    mustFail: ["olga — op=projectinvite", "olga — op=projectowneradd", "olga — op=projectownerremove",
               "olga — op=projectownerrescue", "olga — op=projectfork", "ruth — op=projectfork", "ruth — op=projectownerrescue",
               "the founder — op=projectinvite", "JOINED: iris invites pam", "JOINED: iris's op=projectowneradd",
               "JOINED: iris's op=projectownerremove", "JOINED: iris forks it",
               /* DECLARATION CORRECTED after the first run (2026-09-18), the subject's own consequence
                  and a finding worth keeping: the stamp is ALSO what overwrites a caller's forged
                  `viewer=`. Without it the forged `class:admin` reaches the store, vera SEES the
                  project and is told NOT_THE_OWNER — so the forged-viewer rows go red too. */
               "op=projectinvite with a FORGED viewer="],
  },

  /* THE PROMOTE STAMP DROPPED: `actorIdentity` still arrives, `actorViewer` does not, so the revision
     arm fails CLOSED for every stamped caller — machine credentials included. */
  "promote-stamp-dropped": {
    patches: [["index.mjs", "        delete b.actorViewer;\n        b.actorViewer = viaSession ? sessViewer",
               "        delete b.actorViewer;\n        if (false) b.actorViewer = viaSession ? sessViewer"]],
    mustFail: ["olga — op=promote", "the FOUNDER's session", "JOINED: iris revises", "the ADMIN token still revises it"],
  },

  /* OVER-STRICTNESS: the same sight question asked through the store's OTHER spelling of it,
     `#bundleRedactor` — correct work in a form the suite did not anticipate. Nothing may fail. */
  "sight-via-redactor": {
    patches: [["store.mjs", "    const g = viewerPredicate(viewer);\n    return !!this.#one(`SELECT 1 AS x FROM bundles b WHERE b.bundle_id=? AND (${g.sql})`, bundleId, ...g.args);",
               "    return this.#bundleRedactor(viewer)(bundleId) !== null;"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `project-sight-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, PROJECT_SIGHT_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /project-sight: (\d+) passed, (\d+) failed/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 };
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
