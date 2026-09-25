/* rec169-consume.control.mjs — the NEGATIVE CONTROL for `test/rec169-consume.test.mjs`
 * (REC-169, INVESTIGATIVE-SESSION.md §14b.6 and §11 item 5 rule 2).
 *
 * Deliberately NOT a `.test.mjs`: it patches COPIES of `src/` while it runs, and the battery must not discover it.
 * Run from `bio-plane/`: `node test/rec169-consume.control.mjs [arm]`. D-85's driver's shape: every arm patches a COPY
 * of `src/` and `checks/` in a fresh temporary tree, asserting each anchor occurs EXACTLY ONCE (or the arm reports it
 * did not arm), runs the suite against the copy, and compares the failing arms with what was DECLARED before arming —
 * missing and unexpected failures are both printed. The real sources are hashed (byte count and sha256) before and
 * after, so a control that touched them says so; nothing is ever restored because nothing real is ever edited. Each
 * arm breaks ONE thing (the liar's one thing is a clamp, which takes the refusal out and puts the clamp in).
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
const SUITE = join(PLANE, "test", "rec169-consume.test.mjs");
const digest = (p) => { const b = readFileSync(p); return `${b.length} B sha256 ${createHash("sha256").update(b).digest("hex").slice(0, 12)}`; };
const REAL = ["src/index.mjs", "src/store.mjs", "src/airun.mjs", "checks/bio-checks.mjs"].map((f) => join(PLANE, f));
const before = REAL.map(digest);

/* THE ANCHORS, each occurring once. */
const TICK_CHECK = "    if (badConsume)\n";
const SEED_CHECK = "    if (badSeed)\n";
const OFF = "    if (false)\n";
const WRITE = "          run, k, v, v);";
const WRITE_CLAMPED = "          run, k, Math.max(0, Math.floor(Number(v)) || 0), Math.max(0, Math.floor(Number(v)) || 0));";
const SHAPE = "Number.isSafeInteger(v) && v >= 0))";
const SHAPE_SIGNED = "Number.isSafeInteger(v)))";
const SHAPE_FINITE = "Number.isFinite(v) && v >= 0))";
const SHAPE_RESPELT = "Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER))";
const PLANE_CHECK = "    if (v !== 0 && PLANE_COUNTED_BOUNDS.includes(b))\n";
const LIST = 'Object.freeze(["mints", "surfaces"])';
const LIST_SHORT = 'Object.freeze(["mints"])';

const N_ALL = ["ARM N1 ", "ARM N2 ", "ARM N3 ", "ARM N4 ", "ARM N5 ", "ARM N6 ", "ARM N7 ", "ARM N8 ", "ARM N9 ",
               "ARM N10 ", "ARM N11 ", "ARM N12:"];
const ARMS = {
  baseline: { patches: [], mustFail: [] },

  /* THE ROW'S CONTROL: drop the tick's check. The refund lands (D1-D3), every malformed figure is written (N), the
     mixed tick spends its good half (M), and a plane-counted bound takes the caller's figure (P). */
  "drop-check": {
    patches: [["store.mjs", TICK_CHECK, OFF]],
    mustFail: ["ARM D1 ", "ARM D2 ", "ARM D3 ", ...N_ALL, "ARM M1 ", "ARM M2 ", "ARM P1:", "ARM P2:", "ARM P3 "],
  },

  /* THE LIAR: refuse nothing, clamp every figure to a non-negative integer. The bound never goes DOWN — D3's bound
     reads [1, 1] and its second question does not exist — which is why a bound-did-not-move assertion alone could
     never be the test. What fails is every arm asking for the refusal BY NAME, the witnesses (the tick counted and
     the log grew under a tick the caller was told succeeded), and the mixed tick (the clamp spent its good half).
     DECLARATION CORRECTED AT THE FIRST RUN (2026-09-23), THE ARM RIGHT: D3 fails too, reading SURFACE_RUN_NOT_RUNNING
     for SURFACE_BOUND_REACHED — the clamped tick was ACCEPTED, and an accepted tick over an exhausted bound ENDS the
     run (`finishedBound`): the liar changed the run's status under a caller told its tick was fine. */
  clamp: {
    patches: [["store.mjs", TICK_CHECK, OFF], ["store.mjs", WRITE, WRITE_CLAMPED]],
    mustFail: ["ARM D1 ", "ARM D2 ", "ARM D3 ", ...N_ALL, "ARM M1 ", "ARM M2 ", "ARM P1:", "ARM P2:", "ARM P3 "],
  },

  /* The open's seed unguarded: a pre-refunded open, a fraction, a string and a plane-counted seed all open. */
  "open-seed-dropped": { patches: [["store.mjs", SEED_CHECK, OFF]], mustFail: ["ARM S1 ", "ARM S2:", "ARM S3:"] },

  /* The sign alone: a negative integer is a count. DECLARATION CORRECTED AT THE FIRST RUN (2026-09-23), THE ARM
     RIGHT: D2 and D3 STAY GREEN and D1 fails reading AI_RUN_BOUND_PLANE_COUNTED — `surfaces` is plane-counted, so its
     refund is refused a SECOND time, by C-22.14. A plane-counted bound's refund is closed twice; a caller-counted
     one's (N1, N9, M) only by the sign, and that is where this arm lands. */
  "no-negative": {
    patches: [["airun.mjs", SHAPE, SHAPE_SIGNED]],
    mustFail: ["ARM D1 ", "ARM N1 ", "ARM N9 ", "ARM N11 ", "ARM N12:", "ARM M1 ", "ARM M2 ", "ARM S1 "],
  },

  /* Integrality alone: a finite non-negative number is a count (1.5, 2^53, a 0.5 seed). DECLARATION CORRECTED AT
     THE FIRST RUN (2026-09-23), THE ARM RIGHT: N12 fails too — N10's 2^53 LANDS, exhausts the run's `fetches` and
     ENDS it, so N12's tick meets an ended run: the overspend seen from the status, not a second variable. */
  "no-integer": {
    patches: [["airun.mjs", SHAPE, SHAPE_FINITE]],
    mustFail: ["ARM N2 ", "ARM N10 ", "ARM N11 ", "ARM N12:", "ARM S2:"],
  },

  /* The plane-counted refusal dropped: the caller writes `surfaces` and `mints`. */
  "no-plane-counted": {
    patches: [["airun.mjs", PLANE_CHECK, OFF]],
    mustFail: ["ARM P1:", "ARM P2:", "ARM P3 ", "ARM S3:"],
  },

  /* The list forgets `surfaces` — the census off the store's source catches it, and so does the op. */
  census: {
    patches: [["airun.mjs", LIST, LIST_SHORT]],
    mustFail: ["ARM C2:", "ARM P1:", "ARM P3 ", "ARM S3:"],
  },

  /* OVER-STRICTNESS: the same rule in a spelling the suite did not anticipate. Nothing may fail. */
  overstrict: { patches: [["airun.mjs", SHAPE, SHAPE_RESPELT]], mustFail: [] },
};
/* M0-197: the arms' anchors as data (each patches a COPY of src/; counted in the real file it copies). */
anchorTable(Object.entries(ARMS).flatMap(([arm, a]) => a.patches.map(([file, find, put]) => ({ arm, file: join(PLANE, "src", file), find, put }))));

const run = (name) => {
  const arm = ARMS[name];
  const root = mkdtempSync(join(tmpdir(), `rec169-${name}-`));
  try {
    const tree = join(root, "tree");
    cpSync(join(PLANE, "src"), join(tree, "bio-plane", "src"), { recursive: true });
    cpSync(join(PLANE, "checks"), join(tree, "bio-plane", "checks"), { recursive: true });
    cpSync(join(REPO, "docprofile"), join(tree, "docprofile"), { recursive: true });
    for (const [file, from, to] of arm.patches) {
      const p = join(tree, "bio-plane", "src", file);
      const s = readFileSync(p, "latin1");
      const n = s.split(from).length - 1;
      if (n !== 1) return { name, armed: false, why: `anchor in ${file} occurs ${n} times: ${from.slice(0, 70)}` };
      writeFileSync(p, s.split(from).join(to), "latin1");
    }
    const r = spawnSync(process.execPath, [SUITE], { env: { ...process.env, REC169_SRC: join(tree, "bio-plane", "src") },
                                                     encoding: "utf8", maxBuffer: 64 << 20 });
    const out = r.stdout || "";
    const tally = /rec169-consume: (\d+) pass, (\d+) fail/.exec(out);
    const failed = out.split("\n").filter((l) => /^\s+FAIL\s/.test(l)).map((l) => l.replace(/^\s+FAIL\s+/, ""));
    /* NC_VERBOSE=1 prints every FAIL with its want/got, so a surprising arm is read rather than guessed at. */
    if (process.env.NC_VERBOSE) console.log(out.split("\n").filter((l, i, a) => /^\s+FAIL\s/.test(l)
      || /^\s+FAIL\s/.test(a[i - 1] ?? "") || /^\s+FAIL\s/.test(a[i - 2] ?? "")).join("\n"));
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
    + (r.unexpected.length ? `\n      failed but not declared: ${JSON.stringify(r.unexpected.map((u) => u.slice(0, 60)))}` : ""));
  if (!r.asDeclared) bad++;
}
const after = REAL.map(digest);
const untouched = before.every((d, i) => d === after[i]);
console.log(`\nreal sources: ${REAL.map((p, i) => `${p.split("/").slice(-1)[0]} ${after[i]}`).join(" · ")} — untouched: ${untouched ? "YES" : "NO"}`);
process.exit(bad || !untouched ? 1 : 0);
