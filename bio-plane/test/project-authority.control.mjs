/* project-authority.control.mjs — the NEGATIVE CONTROL for `test/project-authority.test.mjs`
 * (REC-134 / IC-152 / C-56). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/project-authority.control.mjs            every arm
 *   node test/project-authority.control.mjs <arm>      one arm
 *
 * HOW IT ARMS, and why it never edits a real source. Each arm copies `src/` into a
 * uniquely-named temporary tree, applies ONE patch there (asserting its anchor occurs
 * EXACTLY ONCE — an arm that did not arm is a finding, not a pass), and runs the suite
 * with PROJECT_AUTHORITY_SRC pointed at the copy. The real `src/index.mjs`,
 * `src/store.mjs` and `src/affordances.mjs` are hashed (sha256 and byte length) before
 * the first arm and after the last, and the run fails loudly if any moved.
 *
 * EACH ARM BREAKS ONE THING (CLAUDE.md: a control whose method perturbs a second variable
 * produces a refutation more confident than the finding). DECLARED BEFORE ARMING — what
 * MUST fail (by label fragment); every other assertion MUST stay green.
 *
 * RESULTS: see the header of `test/project-authority.test.mjs` and IC-152.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "project-authority.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/affordances.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const REFUSED_ALL = ["REFUSED:"];
const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE SUBJECT REMOVED: the one helper answers "proceed" for everybody. Every act is back to the
     pre-fix behaviour, which is also the measurement that the defect existed: each REFUSED arm is
     an act that SUCCEEDS without the check. */
  "no-check": {
    patches: [["store.mjs", "    const who = this.#positionalMember(null, identity);\n    if (who === null) return null;",
               "    const who = this.#positionalMember(null, identity);\n    if (who === null || true) return null;"]],
    mustFail: [...REFUSED_ALL, "the refusal carries", "and nothing was written", "and P_OUT stands on nothing",
               "vera is INVITED", "vera's op=promote", "ruth may NOT adopt", "and the rescue did not make ruth",
               "a caller naming", "nor is an `identity`"],
  },

  /* THE BRIEF'S CONTROL 1: the positional check removed from ONE enumerated act (cite), every other
     act's check held open. Only cite's arms may go red. */
  "cite-unchecked": {
    patches: [["store.mjs", "      const denied = this.#projectAuthority(p.bundle_id, identity, \"joined\", \"cite\");\n      if (denied) return denied;",
               "      /* armed: cite's check removed */"]],
    mustFail: ["REFUSED: the founder (not in P_OUT) — op=cite", "REFUSED: ruth (not in P_OUT) — op=cite",
               "the refusal carries", "and nothing was written", "vera is INVITED", "and the rescue did not make ruth",
               "a caller naming"],
  },

  /* THE BRIEF'S CONTROL 2: the positional check APPLIED to §7.13's path. The rescue is the one act an
     administrator performs on a project it is not in, so it must go red — and nothing else may. */
  "rescue-checked": {
    patches: [["store.mjs", "    const owners = this.#owners(projectId);\n    if (!owners.length)\n      return { ok: false, reason: \"NO_OWNERS\",",
               "    { const denied = this.#projectAuthority(projectId, `member:${by}`, \"joined\", \"projectownerrescue\");\n"
               + "      if (denied) return denied; }\n"
               + "    const owners = this.#owners(projectId);\n    if (!owners.length)\n      return { ok: false, reason: \"NO_OWNERS\","]],
    mustFail: ["while olga (P_RES's only owner) is ACTIVE", "§7.13 needs a reason", "RESCUE: ruth, NOT in P_RES",
               "RESCUE: the founder, NOT in P_RES2"],
  },

  /* THE STAMP DROPPED from one act at the control plane: an absent identity is not asked (the
     internal-caller rule), so a dropped stamp would silently open that act. This arm is what makes
     "the control plane always stamps it" a measurement rather than a belief. */
  "stamp-dropped": {
    patches: [["index.mjs", "const POSITIONAL_ACTS = [\"cite\", \"sever\", \"reinstate\", \"versioncurrent\", \"proposedispose\", \"biasadopt\"];",
               "const POSITIONAL_ACTS = [\"cite\", \"sever\", \"reinstate\", \"proposedispose\", \"biasadopt\"];"]],
    mustFail: ["REFUSED: the founder (not in P_OUT) — op=versioncurrent", "REFUSED: ruth (not in P_OUT) — op=versioncurrent",
               "and P_OUT stands on nothing"],
  },

  /* LIAR 2: the position asked of the VIEWER. The founder's viewer is the bare `admin`, which carries
     no member, so the check asks nobody and the FOUNDER walks through; ruth's viewer names her and she
     stays refused. (The promote stamp is a separate line and is held open.) */
  "position-from-viewer": {
    patches: [["index.mjs", "    if (POSITIONAL_ACTS.includes(op))\n      inner.searchParams.set(\"identity\",\n        viaSession ? sessIdentity",
               "    if (POSITIONAL_ACTS.includes(op))\n      inner.searchParams.set(\"identity\",\n        viaSession ? sessViewer"]],
    mustFail: ["REFUSED: the founder (not in P_OUT) — op=cite", "REFUSED: the founder (not in P_OUT) — op=sever",
               "REFUSED: the founder (not in P_OUT) — op=reinstate", "REFUSED: the founder (not in P_OUT) — op=versioncurrent",
               "REFUSED: the founder (not in P_OUT) — op=proposedispose", "REFUSED: the founder (not in P_OUT) — op=biasadopt"],
  },

  /* LIAR 1 — OVER-STRICTNESS: every administrator refused everywhere, in the SAME codes. Every
     refusal arm stays green (that is the lie); the in-project arms are what must catch it. */
  "refuse-every-admin": {
    patches: [["store.mjs", "    const who = this.#positionalMember(null, identity);\n    if (who === null) return null;",
               "    const who = this.#positionalMember(null, identity);\n    if (who === null) return null;\n"
               + "    if (this.#isAdminMember(who)) return { ok: false, reason: need === \"owner\" ? \"PROJECT_ACT_NOT_THE_OWNER\" : "
               + "\"PROJECT_ACT_NOT_A_PARTICIPANT\", code: need === \"owner\" ? \"PROJECT_ACT_NOT_THE_OWNER\" : \"PROJECT_ACT_NOT_A_PARTICIPANT\", "
               + "check: need === \"owner\" ? \"C-56.2\" : \"C-56.1\" };"]],
    mustFail: ["ALLOWED:", "the founder's make-current landed", "ruth may cite into P_JOIN"],
  },

  /* DEC-8: the pre-flight left un-narrowed on the project arm of cite and sever. */
  "preflight-unnarrowed": {
    patches: [["affordances.mjs", "(ty === \"project\" && f.project_participant !== false)\n                     || ty === \"inquiry\"",
               "ty === \"project\"\n                     || ty === \"inquiry\""],
              ["affordances.mjs", "(ty === \"project\" && f.cites_out.confirmed > 0 && f.project_participant !== false)",
               "(ty === \"project\" && f.cites_out.confirmed > 0)"]],
    mustFail: ["the founder: on P_OUT (not in it)", "ruth: on P_OUT (not in it)"],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `project-authority-${name}-`));
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
      writeFileSync(p, s.replace(from, to));
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, PROJECT_AUTHORITY_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /project-authority: (\d+) passed, (\d+) failed/.exec(out);
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
