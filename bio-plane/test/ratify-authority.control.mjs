/* ratify-authority.control.mjs — the NEGATIVE CONTROL for `test/ratify-authority.test.mjs`
 * (REC-140 / D-429 / C-58, and C-57.1 / C-56.1 at op=ratify). NOT a `.test.mjs`: the battery
 * must not discover it.
 *
 *   node test/ratify-authority.control.mjs            every arm
 *   node test/ratify-authority.control.mjs <arm>      one arm
 *
 * HOW IT ARMS — `case-authority.control.mjs`'s method, kept. Each arm copies `src/` and
 * `checks/` into a uniquely-named temporary tree, applies its patches there (asserting each
 * anchor occurs EXACTLY ONCE — an arm that did not arm is a finding, not a pass), and runs the
 * suite with RATIFY_AUTHORITY_SRC pointed at the copy. The real `src/index.mjs` and
 * `src/store.mjs` are hashed before the first arm and after the last, and the run fails loudly
 * if either moved.
 *
 * EACH ARM BREAKS ONE THING. DECLARED BEFORE ARMING — what MUST fail (by label fragment);
 * every other assertion MUST stay green.
 *
 * RESULTS: see the header of `test/ratify-authority.test.mjs` and IC-157.
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
const SUITE = join(PLANE, "test", "ratify-authority.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* The helper's delivery question and owner question (`Store#caseAuthority`). */
const DELIVERY = "    if (project && deliveredBy !== \"founder\") {\n"
  + "      const denied = this.#projectAuthority(project, deliveredBy, \"joined\", act);\n"
  + "      if (denied) return denied;\n    }\n";
const OWNER = "    if (!project || !this.#isProjectOwner(project, signer))";
/* op=ratify's call into it, in `publish()`. CORRECTED 2026-09-19 by the D-431 worker: the pinned-finding branch is
   now followed by D-431's outside-a-case block rather than by the edition read, so the anchor names what follows it
   now; the arm still patches the PINNED branch only (the evidence branch ends in its own marked line). */
const FINDING_CALL = "        if (refused) return refused;\n      }\n      /* ===== D-431";
/* D-431: the outside-a-case block's opening (`Store#publish`). */
const RESTING = "        const resting = this.#ratifiedFindingsRestingOn(bundleId);\n";

const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE BRIEF'S CONTROL 1: project bundles re-admitted. Every project-bundle arm publishes. */
  "readmit-project-bundles": {
    patches: [["index.mjs", "      if (normalizeType(facts.row.object_type) === \"project\")\n",
               "      if (false)\n"]],
    mustFail: ["PROJECT BUNDLE"],
  },

  /* THE BRIEF'S CONTROL 2: the owner check dropped (in the ONE helper, so both doors lose it;
     this suite drives only op=ratify's). A non-owner's signature publishes E's finding. */
  "no-owner-check": {
    patches: [["store.mjs", OWNER, "    if (!project)"]],
    mustFail: ["NON-OWNER:"],
  },

  /* THE BRIEF'S CONTROL 3: the delivery check dropped. The outside administrator publishes A's
     finding with iris's signature; wen and vic then meet an already-published sha (a retry),
     and ruth's retry answers `existed`. */
  "no-delivery-check": {
    patches: [["store.mjs", DELIVERY, "    /* armed: the delivery check removed */\n"]],
    mustFail: ["OUTSIDE ADMINISTRATOR:", "INVITED, NOT JOINED:", "UNINVITED:", "DELIVERY: and nothing",
               "RETRY: ruth re-sends"],
  },

  /* THE BRIEF'S CONTROL 4: role before visibility. The ratifier's viewer is not sent to the
     gate facts, so a hidden project's bundle reaches the TYPE refusal (and a stale sha would
     reach RATIFY_STALE, naming its real sha). Only the two sight arms that compare the answer
     may go red. */
  "type-before-sight": {
    patches: [["index.mjs", "gatefacts?id=${encodeURIComponent(body.bundleId)}&viewer=${ratViewer}`",
               "gatefacts?id=${encodeURIComponent(body.bundleId)}`"]],
    mustFail: ["SIGHT: vic", "SIGHT: and carrying"],
  },

  /* THE LIAR THE ROW NAMES: refuse every pinned finding. Every refusal arm STAYS GREEN (that is
     the lie); the three ALLOWED arms, their publication checks, and the joined member's retry
     MUST go red. */
  "refuse-every-finding": {
    patches: [["store.mjs", FINDING_CALL,
               "        refused = refused || { ok: false, reason: \"PROJECT_ACT_NOT_A_PARTICIPANT\" };\n" + FINDING_CALL]],
    mustFail: ["ALLOWED", "RETRY: the same act by a joined member"],
  },

  /* THE ASKED-AFTER-THE-RETRY ARM: the finding's questions moved below the idempotent retry
     (asked only for new bytes). Only ruth's retry may go red. */
  "authority-after-retry": {
    patches: [["store.mjs", "      const pinnedBy = this.#pinnedCaseEditionsOf(bundleId, bundleSha);\n      if (pinnedBy.length) {",
               "      const pinnedBy = this.#pinnedCaseEditionsOf(bundleId, bundleSha);\n"
               + "      if (pinnedBy.length && !this.#one(`SELECT 1 AS x FROM published_bundles WHERE bundle_id=? AND bundle_sha=?`, bundleId, bundleSha)) {"]],
    mustFail: ["RETRY: ruth re-sends"],
  },

  /* D-431 — THE ROW'S CONTROL 1: an UNPINNED finding re-admitted. The (a) refusal is skipped for an
     inquiry no ratified case rests on, so it falls through to the commit. Only the (a) arms may go red
     (the loose inquiry and P's prepared finding publish; iris's second attempt at P is then a retry). */
  "readmit-unpinned-finding": {
    patches: [["store.mjs", RESTING + "        if (!resting.length) {\n",
               RESTING + "        if (!resting.length && normalizeType((this.#one(`SELECT object_type FROM bundles WHERE bundle_id=?`, bundleId) || {}).object_type) !== \"inquiry\") {\n"]],
    mustFail: ["OUTSIDE A CASE (a)"],
  },

  /* D-431 — THE ROW'S CONTROL 2: the refusal reads a DIFFERENT edge set from the serving — the finding's
     BASIS legs instead of `Store.publishedGraphEdges`. Every bundle G's finding only REFERENCES is then
     refused C-58.3: the identity arms (behavioural and structural) MUST go red, with the evidence arms over
     those bundles and 8b's two (both referenced only). */
  "rests-on-reads-basis": {
    patches: [["store.mjs", "if (Store.publishedGraphEdges(fm).some((e) => e.disclosure === \"serve\" && e.to === bundleId))",
               "if ((Array.isArray(fm.basis) ? fm.basis : []).some((l) => l && l.target === bundleId))"]],
    mustFail: ["IDENTITY", "EVIDENCE ALLOWED: gus", "EVIDENCE NON-OWNER", "EVIDENCE OUTSIDE ADMINISTRATOR", "EVIDENCE UNINVITED", "ANY OWNER"],
  },

  /* D-431 — THE LIAR THE ROW NAMES, on the evidence side: refuse every bundle outside a pinned finding.
     Every (a)/(b) refusal arm STAYS GREEN (that is the lie); every evidence arm that must COMMIT goes red,
     the authority arms over evidence (now answered C-58.3 instead of by the case's authority) and the
     graph identity. */
  "refuse-every-evidence": {
    patches: [["store.mjs", RESTING + "        if (!resting.length) {\n", RESTING + "        if (true) {\n"]],
    mustFail: ["EVIDENCE ALLOWED", "EVIDENCE NON-OWNER", "EVIDENCE OUTSIDE ADMINISTRATOR", "EVIDENCE UNINVITED",
               "IDENTITY (ALLOWED", "ANY OWNER"],
  },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read); each arm patches a copy of src/. */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `ratify-authority-${name}-`));
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
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, RATIFY_AUTHORITY_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /ratify-authority: (\d+) pass, (\d+) fail/.exec(out);
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
