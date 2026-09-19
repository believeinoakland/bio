/* project-disclosure.control.mjs — the NEGATIVE CONTROL for `test/project-disclosure.test.mjs`
 * (REC-139 / D-428 / IC-156). NOT a `.test.mjs`: the battery must not discover it.
 *
 *   node test/project-disclosure.control.mjs            every arm
 *   node test/project-disclosure.control.mjs <arm>      one arm
 *
 * HOW IT ARMS, and why it never edits a real source: `project-sight.control.mjs`'s method. Each arm
 * copies `src/` into a uniquely-named temporary tree, applies its patch there (asserting each anchor
 * occurs EXACTLY ONCE — an arm that did not arm is a finding, not a pass), and runs the suite with
 * PROJECT_DISCLOSURE_SRC pointed at the copy. The real `src/index.mjs` and `src/store.mjs` are hashed
 * (sha256 and byte length) before the first arm and after the last; the run fails if either moved.
 *
 * EACH ARM BREAKS ONE THING, and what it MUST fail (by label fragment) is DECLARED BEFORE ARMING;
 * every other assertion MUST stay green.
 *
 * NOT AN ARM, and stated rather than skipped: *"let a caller-chosen id through"*. REC-139 did not build
 * plane-minted project ids (the design does not say whether a supplied id is refused or ignored), so
 * there is no fence to remove; the suite's §4 pinned the creation's EXISTS as KNOWN instead. REC-141 (2026-09-18)
 * built the mint and its fence; that fence's control is `project-mint.control.mjs`, not this driver.
 *
 * RESULTS: see the header of `test/project-disclosure.test.mjs` and IC-156.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "project-disclosure.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
/* REC-145 added `src/airun.mjs`: three of its arms patch a copy of it, so the real one is hashed too. */
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

const COUNT_LINE = "    return { ...g, projects: projects.filter((p) => this.#inSight(p, viewer)).length };";
const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE BRIEF'S CONTROL 1: the other project's id and title restored in `promote`'s NAME_TAKEN, fork's
     held open. Only the CREATE arms and the one-answer arm may go red. */
  "restore-title": {
    patches: [["store.mjs", "          return { ok: false, reason: \"NAME_TAKEN\",\n                   detail: \"a project by that name",
               "          return { ok: false, reason: \"NAME_TAKEN\", bundleId: clash.bundle_id, title: clash.title,\n                   detail: \"a project by that name"]],
    mustFail: ["CREATE: the refusal carries NO bundleId", "CREATE: neither the hidden id", "ONE ANSWER:"],
  },

  /* The same at `forkProject` alone — the second site is driven, not assumed to follow the first. */
  "restore-title-fork": {
    patches: [["store.mjs", "    if (clash) return { ok: false, reason: \"NAME_TAKEN\",\n      detail:",
               "    if (clash) return { ok: false, reason: \"NAME_TAKEN\", bundleId: clash.bundle_id, title: clash.title,\n      detail:"]],
    mustFail: ["FORK: the refusal carries NO bundleId", "FORK: neither the hidden id"],
  },

  /* THE BRIEF'S CONTROL 2: count hidden projects in the run report again. sam's two byte-identity arms
     and the liar's arm (which pins his count at 1) must go red; olga's, ruth's and the machine's counts
     are the same either way, so they must stay green. */
  /* DECLARATION WIDENED 2026-09-19 by REC-145, from its own run (21/6): REC-145's §3 arms state a
     count too, over questions only UNSEEN projects cite (sam's only-hidden question: 1, not 0; nora's
     doubly-cited one: 2, not 0), so they catch this arm as well — nora's byte-identity arm included,
     because her uncited question still reads 0. Three more catchers of the same defect, not a new one. */
  "count-hidden": {
    patches: [["store.mjs", COUNT_LINE, "    return g;"]],
    mustFail: ["sam (never invited to the hidden project): airunopen", "sam: airuntick", "THE LIAR'S ARM",
               "sam over a question ONLY a project he cannot see cites is PERMITTED", "REC-145 PERMITTED: nora",
               "REC-145 NO BIT: nora"],
  },

  /* THE LIAR (b): report ZERO projects to everyone. Every byte-identity arm stays GREEN — that is the
     lie — and the arms of callers who CAN see a citing project are what must catch it. */
  "report-nothing": {
    patches: [["store.mjs", COUNT_LINE, "    return { ...g, projects: 0 };"]],
    mustFail: ["THE LIAR'S ARM", "SEES IT: olga", "SEES IT: ruth", "MACHINE CREDENTIAL"],
  },

  /* RETIRED 2026-09-19 by REC-145: REC-139's arm "gate-over-sight" (the verdict computed over the
     projects in sight only) was a LIAR under REC-139's reading of DEC-63 and is a no-op under Bob's
     amendment — over a question the verdict consults no project at all, and over a project context the
     one project is asked for participation, which sight does not change. An arm that can no longer fail
     is not a control; it is replaced by the two below, which break what REC-145 built. */

  /* REC-145 — THE ROW'S NEGATIVE CONTROL: restore the project consult for an inquiry context (the one
     predicate both the store and the pure gate read answers "consult" for EVERY kind). The PERMITTED arms
     must fail by name: sam over the only-hidden question, nora over the doubly-cited one, and the liar's
     arm in §2 (whose ground goes back to PARTICIPANT). Nora's byte-identity arm is declared to STAY
     GREEN, and it is a finding about that arm, recorded rather than smoothed: restored, the consult
     refuses her over the cited question AND over the uncited one (she joined nothing, and with no
     PROJECTLESS ground left an empty set refuses too), so the two answers are identical refusals. The
     byte arm proves NO BIT; only the PERMITTED arm proves the permission. RUN 2026-09-19: 24/3, as declared. */
  "inquiry-consults-projects": {
    patches: [["airun.mjs", "  return String(contextType ?? \"\") === \"project\";\n}", "  return true;\n}"]],
    mustFail: ["THE LIAR'S ARM", "sam over a question ONLY a project he cannot see cites is PERMITTED",
               "REC-145 PERMITTED: nora"],
  },

  /* REC-145 — THE ROW'S LIAR: drop the gate for EVERY context. Every permitted arm stays green (that is
     the lie); the project-context refusal must catch it, and nothing else may move. */
  "gate-dropped-everywhere": {
    patches: [["airun.mjs", "  return String(contextType ?? \"\") === \"project\";\n}", "  return false;\n}"]],
    mustFail: ["REC-145 PROJECT CONTEXT KEEPS THE GATE"],
  },

  /* REC-145 OVER-STRICTNESS: the same rule in a spelling the suite did not anticipate — gate every kind
     that is NOT a question, rather than only the kind that IS a project. Over the two vocabularied kinds
     the two spellings agree, so nothing may fail. */
  "consult-unless-inquiry": {
    patches: [["airun.mjs", "  return String(contextType ?? \"\") === \"project\";\n}", "  return String(contextType ?? \"\") !== \"inquiry\";\n}"]],
    mustFail: [],
  },

  /* THE CONTROL PLANE'S STAMP DROPPED: the three run verbs receive no viewer, the store fails closed and
     states NO project — never every one. The visible-count arms go red (sam's, olga's, ruth's, and the
     machine's, whose viewer is stamped by the same line); the byte-identity arms stay green (0 = 0). */
  /* DECLARATION WIDENED 2026-09-19 by REC-153, from this arm's own run (19/9): REC-153's context-kind check
     asks the caller's SIGHT through the same stamp and FAILS CLOSED without it, so with the stamp dropped
     every open is refused as for an absent context — the run-started arms (sam's, nora's, the joined-owner
     over-strictness arm, and the project-context arm's olga half) fail too. The same defect, caught earlier
     and louder: the stamp's absence is still never read as "every project". */
  "run-stamp-dropped": {
    patches: [["index.mjs", "        || RUN_VERB_ACTIONS.includes(op)\n", ""]],
    mustFail: ["THE LIAR'S ARM", "SEES IT: olga", "SEES IT: ruth", "MACHINE CREDENTIAL", "THE RUN STARTED both times",
               "sam over a question ONLY a project he cannot see cites is PERMITTED", "REC-145 PERMITTED: nora",
               "REC-145 PROJECT CONTEXT KEEPS THE GATE", "REC-145 OVER-STRICTNESS"],
  },

  /* OVER-STRICTNESS: the same sight question asked through the store's OTHER spelling of it,
     `#bundleRedactor` — correct work in a form the suite did not anticipate. Nothing may fail. */
  "sight-via-redactor": {
    patches: [["store.mjs", COUNT_LINE,
               "    const keep = this.#bundleRedactor(viewer);\n    return { ...g, projects: projects.filter((p) => keep(p) !== null).length };"]],
    mustFail: [],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `project-disclosure-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, PROJECT_DISCLOSURE_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /project-disclosure: (\d+) passed, (\d+) failed/.exec(out);
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
