/* rec207-bias-debt-settle.control.mjs — the NEGATIVE CONTROL for `test/rec207-bias-debt-settle.test.mjs`
 * (REC-207; BOB #32's ruling of 2026-09-23 23:42Z on what settles a bias-debt obligation).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/rec207-bias-debt-settle.control.mjs [arm]`. D-86's driver's shape, unchanged:
 * every arm patches a COPY of `src/` and `checks/` in a fresh temporary tree, asserting each anchor occurs EXACTLY
 * the declared number of times (or the arm reports it DID NOT ARM), runs the suite against the copy, and compares
 * what failed with what was DECLARED before arming — a declared failure that passed, an undeclared failure, and a
 * declared PASS that failed are all printed. The real sources are hashed (byte count and sha256) before and after,
 * so a control that touched them says so; nothing real is ever edited, so nothing is ever restored.
 *
 * EACH ARM BREAKS ONE THING. The row's own control is `discharge-any-rerun`, and it is written in its NARROWEST
 * form — the lens comparison alone, with the undetermined guard left standing — because an arm that also removed
 * that guard would move two variables and refute nothing about either.
 *
 * RESULTS: recorded on the suite's `NEGATIVE CONTROL:` line.
 */
import { readFileSync, writeFileSync, mkdtempSync, cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PLANE = fileURLToPath(new URL("..", import.meta.url));
const REPO = fileURLToPath(new URL("../..", import.meta.url));
const SUITE = join(PLANE, "test", "rec207-bias-debt-settle.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/schema.mjs", "src/queuestate.mjs", "checks/bio-checks.mjs"]
  .map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE ANCHORS, each read from the source it patches and each declared with the number of times it occurs. */
/* (1) The re-run discharge's lens comparison — "a re-run under any other lens discharges nothing". */
const OTHER_LENS = "    if (formed !== inForce)\n";
const OTHER_LENS_OFF = "    if (false)\n";
/* (2) The guard that refuses to read two absent hashes as agreement. */
const UNDET = "    if (formed == null || inForce == null)\n";
const UNDET_OFF = "    if (false && (formed == null || inForce == null))\n";
/* (3) The required stated reason. */
const NO_REASON = '    if (!said)\n      return refusal("BIAS_DEBT_NO_REASON",\n';
const NO_REASON_OFF = '    if (false)\n      return refusal("BIAS_DEBT_NO_REASON",\n';
/* (4) The append-only settlement row — the RECORD half of "each is RECORDED". */
const APPEND = "    this.sql.exec(\n      `INSERT INTO bias_debt_settlements (run, kind, at, actor, reason, by_run, lens_then, lens_now)\n";
const APPEND_OFF = "    if (false) this.sql.exec(\n      `INSERT INTO bias_debt_settlements (run, kind, at, actor, reason, by_run, lens_then, lens_now)\n";
/* (5) The hold: a settlement made by an authored act survives a sweep over the same lens delta. */
const HELD = "        } else if (prior.cleared_at != null && SETTLED_BY_AN_ACT.has(prior.settled_kind)\n";
const HELD_OFF = "        } else if (false && SETTLED_BY_AN_ACT.has(prior.settled_kind)\n";
/* (6) The machine fence at the resolve. */
const MACHINE = "    if (isMachineStamp(who))\n";
const MACHINE_OFF = "    if (false)\n";
/* (7) The sight half of the re-run link's existence check. */
const SIGHT = "      if (!target || !this.#aiRunInSight(reRuns, viewer))\n";
const SIGHT_OFF = "      if (!target)\n";
/* (8) The context half of the same check. */
const CONTEXT = '      if (target.context_type !== String(contextType) || target.context_id !== String(contextId))\n';
const CONTEXT_OFF = "      if (false)\n";
/* (9) The queue's door for a bias-debt obligation. */
const DOOR = '               instead: item.kind === "bias-debt" ? "biasdebtresolve" : "taskresolve",\n';
const DOOR_OFF = '               instead: "taskresolve",\n';
/* (10) OVER-STRICTNESS: the same comparison in a spelling the suite did not anticipate. */
const OTHER_LENS_SPELT = "    if (!(formed === inForce))\n";

const ARMS = {
  baseline: { patches: [], mustFail: [], mustPass: ["ARM R3 ", "ARM O1 ", "ARM S2 "] },

  /* THE ROW'S CONTROL, verbatim: *discharge on any re-run, and the other-lens arm fails by name.* The lens
     comparison alone is removed, so a re-run formed under a stale lens settles the debt anyway. ARM O1 fails
     BY NAME. ARM O2 must STAY GREEN — its run was handed nothing and is caught by the undetermined guard,
     which this arm leaves standing — and that asymmetry is what makes this evidence rather than an outcome
     that cost nothing: a blanket "discharge everything" would have failed both and told us less. */
  "discharge-any-rerun": {
    patches: [["store.mjs", OTHER_LENS, OTHER_LENS_OFF, 1]],
    mustFail: ["ARM O1 "],
    mustPass: ["ARM O2 ", "ARM R3 ", "ARM R4 "],
  },

  /* THE OTHER HALF OF THE SAME RULE: two absent hashes read as agreement. A re-run handed NO lens discharges
     the debt, which is the equality-that-costs-nothing failure in its exact shape. ARM O2 by name; ARM O1
     stays green, because a stale hand still has a hash to disagree with. */
  "undetermined-discharges": {
    patches: [["store.mjs", UNDET, UNDET_OFF, 1]],
    mustFail: ["ARM O2 "],
    mustPass: ["ARM O1 ", "ARM R3 "],
  },

  /* THE REQUIRED REASON DROPPED: a resolve with no reason settles the obligation. ARM S2 fails BY NAME and
     S2b with it (the debt it named is gone), which is the row's accepts-when in the catching direction.
     DECLARED FIRST AS `[S2, S2b]` FAILING WITH `[S3, S4]` GREEN, AND THAT DECLARATION WAS WRONG — recorded
     rather than smoothed. S3, S4 and S5 fail too, and the cause is the SUITE'S SHAPE and not the subject:
     ARM S runs against one store in sequence, so the very first act in it — the reasonless resolve this arm
     lets through — settles the obligation that S3 and S4 were going to act on, and both then meet
     ALREADY_SETTLED. Everything after ARM S is untouched, which is what says the cascade is local. */
  "no-reason-required": {
    patches: [["store.mjs", NO_REASON, NO_REASON_OFF, 1]],
    mustFail: ["ARM S2 ", "ARM S2b", "ARM S3 ", "ARM S4 ", "ARM S5 "],
    mustPass: ["ARM S6 ", "ARM S7 ", "ARM S8 ", "ARM R3 ", "ARM O1 "],
  },

  /* RECORDED, BUT NOT REALLY: the settlement row is not appended, while `bias_debts` is still stamped. THE
     ANSWER STILL CLAIMS IT — ARM S4 reads the object the act returned and stays GREEN — and every arm that
     goes to the RECORD fails. That pair is the whole reason this suite reads `op=biasdebt` rather than
     trusting the act's own answer: a claim and a record are two different facts. ARM C3 fails with them
     and for the same reason — it reads the settlement COUNT beside the refusal it names — while C1 and C2,
     which read the CATALOGUE, stay green. Declared after the arm printed it, not smoothed. */
  "settlement-not-appended": {
    patches: [["store.mjs", APPEND, APPEND_OFF, 1]],
    mustFail: ["ARM S5 ", "ARM S7 ", "ARM C3 ", "ARM R4 ", "ARM L1 ", "ARM L2 ", "ARM N1 "],
    mustPass: ["ARM S4 ", "ARM S6 ", "ARM C1 ", "ARM C2 ", "ARM R3 ", "ARM O1 "],
  },

  /* THE HOLD REMOVED: the next sweep over an unmoved lens delta re-raises what a member already answered.
     ARM H1 by name — the member is asked the same question again, which is the nagging DEC-69 refuses.
     DECLARED FIRST AS `[H1]` ALONE, AND THAT WAS WRONG: L2 and N1 fail with it, and the reason is the
     mechanism rather than the suite. Re-raising the settled debt CLEARS its `settled_kind` (that is what
     restating is), so by ARM L the resolve no longer names itself as what settled the obligation and by
     ARM N the debt this arm re-raised is already open. The two are the same defect seen later, and their
     failing is the hold being load-bearing beyond the tick that drops it. ARM C3 joins them for the same
     cause: it reads the settled debt's settlement COUNT, and a re-raised debt no longer reads as settled.
     Declared after the arm printed it, and recorded rather than smoothed. */
  "held-dropped": {
    patches: [["store.mjs", HELD, HELD_OFF, 1]],
    mustFail: ["ARM H1 ", "ARM C3 ", "ARM L2 ", "ARM N1 "],
    mustPass: ["ARM S4 ", "ARM S5 ", "ARM C1 ", "ARM C2 ", "ARM R3 ", "ARM O1 "],
  },

  /* THE MACHINE FENCE REMOVED: an admin CREDENTIAL settles a member's obligation. ARM S3 by name.
     DECLARED FIRST AS `[S3]` ALONE WITH S4 GREEN, AND THAT WAS WRONG for `no-reason-required`'s reason one
     act later: the credential's resolve now SUCCEEDS, so the obligation alice was going to settle in S4 is
     already gone and she meets ALREADY_SETTLED. S2 stays green — the reasonless act is still refused, which
     is the pair that says this arm moved the machine fence and nothing else. */
  "machine-allowed": {
    patches: [["store.mjs", MACHINE, MACHINE_OFF, 1]],
    mustFail: ["ARM S3 ", "ARM S4 ", "ARM S5 "],
    mustPass: ["ARM S2 ", "ARM S6 ", "ARM S7 ", "ARM R3 "],
  },

  /* THE SIGHT HALF OF THE LINK'S EXISTENCE CHECK REMOVED: a member who cannot see the named run is told it
     is in another context, which establishes that it EXISTS. ARM G5 by name. ARM G2 must stay GREEN — that
     run genuinely does not exist — and that is what makes G5 a measurement of sight rather than of spelling. */
  "sight-dropped": {
    patches: [["store.mjs", SIGHT, SIGHT_OFF, 1]],
    mustFail: ["ARM G5 "],
    mustPass: ["ARM G2 ", "ARM G1 ", "ARM G3 "],
  },

  /* THE CONTEXT CHECK REMOVED: a re-run may name work in another question, whose lens is another lens.
     ARM G3 by name, and G5 with it (alice's half expects that refusal). */
  "context-check-dropped": {
    patches: [["store.mjs", CONTEXT, CONTEXT_OFF, 1]],
    mustFail: ["ARM G3 ", "ARM G5 "],
    mustPass: ["ARM G1 ", "ARM G2 ", "ARM G4 "],
  },

  /* THE QUEUE'S DOOR PUT BACK AS IT WAS: every OBLIGATION named `taskresolve`, including the one that has no
     task to resolve. ARM Q1 by name — the row's headline, in the catching direction. */
  "door-taskresolve": {
    patches: [["store.mjs", DOOR, DOOR_OFF, 1]],
    mustFail: ["ARM Q1 "],
    mustPass: ["ARM S4 ", "ARM R3 "],
  },

  /* OVER-STRICTNESS: the lens comparison written in a spelling this suite did not anticipate. Correct work
     must PASS — an arm that went red here would mean the suite is pinning a form and not a behaviour. */
  spelling: {
    patches: [["store.mjs", OTHER_LENS, OTHER_LENS_SPELT, 1]],
    mustFail: [],
    mustPass: ["ARM O1 ", "ARM O2 ", "ARM R3 ", "ARM R4 "],
  },
};

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec207-${name.replace(/\W/g, "_")}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    cpSync(join(REPO, "jurisdictions"), join(tree, "jurisdictions"), { recursive: true });
    for (const [file, from, to, times] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== times) return { name, armed: false, why: `anchor in ${file} occurs ${n} times, declared ${times}: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, REC207_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /rec207-bias-debt-settle: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    const passed = out.split("\n").filter((l) => /^\s+PASS\s/.test(l)).map((l) => l.replace(/^\s+PASS\s+/, ""));
    const missing = arm.mustFail.filter((m) => !failed.some((f) => f.includes(m)));
    const unexpected = failed.filter((f) => !arm.mustFail.some((m) => f.includes(m)));
    const notPassed = arm.mustPass.filter((m) => !passed.some((f) => f.includes(m)));
    return { name, armed: true, tally: tally ? `${tally[1]}/${tally[2]}` : "NO TALLY (-1)", missing, unexpected, notPassed,
             asDeclared: !!tally && missing.length === 0 && unexpected.length === 0 && notPassed.length === 0 };
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
    + (r.notPassed.length ? `\n      declared to pass but did not: ${JSON.stringify(r.notPassed)}` : "")
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected.map((u) => u.slice(0, 60)))}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
