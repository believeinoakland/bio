/* d511-replay-server-word.control.mjs — the NEGATIVE CONTROL for section 8 of `test/risk-tier.test.mjs` and for
 * its arm (ix) (D-511, INVESTIGATIVE-SESSION.md §11 item 5, "`replay` IS THE SERVER'S WORD, NEVER THE CALLER'S",
 * RULED 2026-09-24 by BOB #33 on D-505's finding).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/d511-replay-server-word.control.mjs [arm]`. REC-173's driver's shape, because
 * that is the harness this family already has: every arm patches a COPY of `src/` and `checks/` in a fresh
 * temporary tree, asserts its anchor occurs EXACTLY ONCE (or the arm reports that it did not arm), runs the suite
 * against the copy through `D511_SRC`, and compares the failing arms with what was DECLARED before arming —
 * missing and unexpected failures are both printed. The real sources are hashed (byte count and sha256) before and
 * after; nothing real is ever edited, so no `git checkout --` can discard anybody's work.
 *
 * WHY THE BREAKING ARMS DO NOT DELETE THE LINE. Arm (ζ) of section 8 pins that `index.mjs` deletes a caller's
 * `replay` in exactly ONE place, and an arm that removed the line would fail that pin for a reason that is about
 * the MATCHER and not about the rule — a control that moves a second variable refutes nothing (CLAUDE.md §5). So
 * every arm here keeps the statement and changes its CONDITION, which is the thing under test.
 *
 * RESULTS: recorded on the suite's `NEGATIVE CONTROL:` line.
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
const SUITE = join(PLANE, "test", "risk-tier.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/setup.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE SUBJECT: one statement in `op=promote`'s stamp block in `index.mjs`. */
const FENCE = 'if (viaSession || cls !== "admin") delete b.replay;';

const IX = "D-511 (the inversion of D-505's residue arm)";
const IX_ALL = [IX, "…and NOTHING landed: no bundle of that id exists to project",
                "…and no search at risk:1 finds it either"];
const BETA = "D-511 (β), THE SESSION HALF";
const GAMMA = "D-511 (γ):";
/* D-512 INVERTED arm (δ) and its residue arm (BOB #33's step (2) built), so the labels this control names moved with
   them: (δ) is now the admin's bare replay REFUSED C-66.6, the migration path is its over-strictness arm, and the
   second condition is the member token carrying proof. */
const DELTA = "D-512 (δ), THE INVERSION OF D-511'S RESIDUE ARM";
const DELTA_PATH = "D-512 (δ) OVER-STRICTNESS, THE MIGRATION PATH";
const DELTA_SECOND = "D-512 (δ), THE SECOND CONDITION";
const EPSILON = "D-511 (ε) OVER-STRICTNESS";

const ARMS = {
  baseline: { patch: null, mustFail: [] },

  /* THE ROW'S CONTROL, and the one its QUEUE row names: drop the class test, so no caller's `replay` is ever
     removed — the tree as it stood before D-511. Arm (ix) must fail BY NAME, which is what D-505 wrote it for.
     The session's flag then reaches the store too, so the history calls her act a replay (β); and the probe's
     lands (γ). The admin arms (δ, ε) and the residue arm must NOT move: that class was always exempt.
     RE-DECLARED 2026-09-24 by D-512, after its first run on D-512's tree came back NOT AS DECLARED (86/4): with step
     (2) built, a non-admin's flag that step (1) no longer removes reaches the verification, which is asked only for
     the admin class, and is REFUSED REPLAY_UNVERIFIED (C-66.6) instead of reaching its fence. So arm (ix)'s NAMED
     refusal fails (C-66.6, not C-32.19), (β) fails (the founder's act is refused, not recorded `promotion`), (γ)
     fails, and (δ)'s second-condition arm fails (the member's proven replay is refused C-66.6, not C-32.19) — while
     (ix)'s "nothing landed" and "no search finds it" arms now STAY GREEN, as declared: nothing lands, because the
     second fence holds. That is step (2)'s defence in depth, measured, not a gap in this arm. */
  "no-fence": { patch: ['if (false) delete b.replay;'], mustFail: [IX, BETA, GAMMA, DELTA_SECOND] },

  /* THE SESSION HALF ALONE, and this is the arm that proves `!viaSession` is load-bearing rather than belt and
     braces: an ADMIN-ROLE member's session arrives as `cls === "admin"` exactly as the deploy token does, so
     without the session test her browser keeps the root of trust's exemption. ONLY (β) may fail. */
  "any-session": { patch: ['if (cls !== "admin") delete b.replay;'], mustFail: [BETA] },

  /* THE CLASS HALF ALONE — a fence TIGHTER than the rule, which is the direction "safer" hides in: every caller's
     flag is deleted, the migration's included. (δ) and the residue arm must fail; arm (ix), (β), (γ) and (ε) must
     NOT, because they are already about callers who never had the exemption. */
  /* RE-DECLARED 2026-09-24 by D-512 (the labels moved with the inversion, above): the admin's bare flag is then
     removed rather than refused, so it meets C-32.19 instead of C-66.6 (δ fails), and the admin's PROVEN replay
     loses its flag too, so the migration path is refused C-32.19 (its over-strictness arm fails). The residue arm
     ("nothing landed") stays green — a tighter fence writes nothing. */
  "any-class": { patch: ["delete b.replay;"], mustFail: [DELTA, DELTA_PATH] },

  /* OVER-STRICTNESS: the SAME rule in a spelling the suite did not anticipate. Nothing may fail — the arms are
     coupled to behaviour, not to an expression, and arm (ζ) pins the delete's shape and not its guard. */
  "respelled": { patch: ['if (!(!viaSession && cls === "admin")) delete b.replay;'], mustFail: [] },
};

/* M0-197: the arms' anchors as data, for tools/anchordrift.mjs (a no-op outside its dry read). */
anchorTable(Object.entries(ARMS).filter(([, a]) => a.patch).map(([arm, a]) => ({ arm, file: join(PLANE, "src", "index.mjs"), find: FENCE, put: a.patch[0] })));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `d511-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    if (arm.patch) {
      const p = join(tree, "bio-plane", "src", "index.mjs");
      const s = readFileSync(p, "latin1");
      const n = s.split(FENCE).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in index.mjs occurs ${n} times: ${FENCE}` };
      writeFileSync(p, s.split(FENCE).join(arm.patch[0]), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, D511_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /risk-tier: (\d+) pass, (\d+) fail/.exec(out);
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
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected.map((u) => u.slice(0, 70)))}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
