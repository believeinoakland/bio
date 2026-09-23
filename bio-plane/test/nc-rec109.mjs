/* REC-109's NEGATIVE CONTROL DRIVER — `node test/nc-rec109.mjs [arm|all]`.
 *
 * INSIDE THIS WORKER'S OWN WORKTREE, never a shared scratchpad: two workers have
 * reported the shared one is not isolated between sessions.
 *
 * EACH ARM ALONE, every other defence held open. Each mutation passes an
 * anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard. Every
 * restore is verified by sha256 AND by `cmp` against a PRISTINE copy named
 * UNIQUELY PER ARM, with a byte count printed and a minimum guarded — because
 * `git checkout --` restores to HEAD and has twice silently discarded a
 * session's own uncommitted work in this repository.
 *
 * AN OPENING AND A CLOSING BASELINE ROW BRACKET THE RUN. A harness that reported
 * the same answer for every arm INCLUDING the baseline is on record here, and
 * without a baseline row five reds read exactly like five arms working.
 *
 * TWO OF THE FIVE ARMS ARE DECLARED STRUCTURAL-ONLY BEFORE THEY RUN, and that
 * declaration is the point rather than an excuse. `overfetch` and `missinglist`
 * are NOT behaviourally drivable on this suite's four-capture fixture — the
 * reasons are on each arm — so they are caught by a source pin and nothing else.
 * Declaring that up front is what stops a structural-only green from being read
 * later as a behavioural one.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./observation-content.test.mjs", import.meta.url));
const MIN_BYTES = 500000;
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* Each arm: [file, anchor, replacement, declared]. */
/* RE-ANCHORED 2026-09-23 BY D-389, SUBJECTS UNCHANGED. D-389 moved the content arm's raw fetch, gate, cut and
   page claim into `#frontierPage` (the one over-fetch the three bundle arms share) and rewrote the arm's
   `truncated` as `never.length > cap || unexplained.length > cap || latest.truncated`. Every anchor below that
   named the old text would have been refused by the occurs-exactly-once guard at ZERO — an arm that cannot arm.
   Each is re-pointed at the SAME subject in the new spelling: `rawflag` still reads the RAW supply against the
   bound for the content arm alone; `fence` still drops the content gate; `missinglist` still claims over
   `missing`; `overfetch` still narrows the content factor to `cap + 1`; `unexplained` still drops that disjunct. */
const ARMS = {
  /* THE DEFECT ITSELF, AND THE ARM TAKES THE FLAG AND NOTHING ELSE. `page` is
     now the GATED list, so restoring D-385's semantics means going back to the
     supply explicitly — which is precisely what the defective line did by
     reading a raw fetch that had not yet been filtered. One variable moves. */
  /* THE ANCHOR CARRIES THE THIRD DISJUNCT'S LINE, AND THAT IS NOT DECORATION.
     The first draft anchored on `truncated: page.length > cap || never.length >
     cap` alone and the occurs-EXACTLY-ONCE guard refused it at 2 — the DOCUMENT
     arm one screen down publishes the same corrected expression, and a six-space
     prefix is a substring of its thirteen-space one. An arm that patched both
     would have measured two methods and reported one. */
  rawflag: [STORE,
    "      truncated: never.length > cap || unexplained.length > cap\n              || latest.truncated,",
    "      truncated: never.length > cap || unexplained.length > cap\n              || this.#frontierLatest("
    + "\"content\", { limit: (cap + 1) * 2, subjectKind: \"capture\" }).length > cap,",
    "MUST FAIL G1 — and it must fail PRINTING BOTH COUNTS, the gated 3 and the supply 4. "
    + "MUST NOT FAIL G1c G2 G3b G4 G4b: the entitled viewer's answers do not move, which is this "
    + "item's over-strictness pair in the orthogonal direction. "
    + "*** DECLARATION CORRECTED AFTER RUNNING, AND THE CORRECTION IS THE RECORD: this arm was "
    + "first declared MUST NOT FAIL G5b and it failed G5b, 2 reds against 1 declared. THE ARM AND "
    + "THE SUITE WERE BOTH RIGHT AND THE DECLARATION WAS WRONG — G5b is a source pin on the exact "
    + "`truncated:` expression this arm rewrites, so a pin naming that expression MUST go red when "
    + "the expression moves. Declaring otherwise was asking a structural pin to be blind to a "
    + "structural change. Actual: G1 G5b. ***"],

  /* THE DATA ARM. REC-94's leak passed a flag-only arm because `capture_held`
     was already false, and REC-103 inherited that lesson; this one is armed
     against the ROWS. Dropping the visibility filter puts the private project's
     capture into an uninvited member's own list. */
  fence: [STORE,
    "                                      (r) => seen(r.subject));",
    "                                      (r) => true || seen(r.subject));",
    "MUST FAIL G0 G1 G1b G4b — the withheld capture appears BY NAME in an uninvited member's "
    + "rows. MUST NOT FAIL G1c G4: the entitled viewer sees exactly what it saw. (RE-RUN 2026-09-23 "
    + "BY D-389: ACTUAL G0 G1 G1b G4b J0 — J0 is REC-110's later arm, which asserts the uninvited "
    + "member really IS withheld from a row, so dropping the fence fails it by construction)"],

  /* STRUCTURAL-ONLY, DECLARED BEFORE RUNNING. The second disjunct compares
     against `missing`, which this method SPLITS by §5.1's cause and never pages.
     It is not behaviourally drivable here because this fixture's `missing` holds
     exactly ONE row (`SHA_UNREAD`) and `unexplained` is EMPTY, so `missing`,
     `never` and `unexplained` cannot straddle any bound the op will accept —
     `cap` floors at 1 and 1 is not greater than 1. Driving it needs a `pre_log`
     or `purged` fixture, which is `#missingContentCause`'s region and not this
     row's. NAMED rather than silently scored as driven. */
  missinglist: [STORE,
    "      truncated: never.length > cap || unexplained.length > cap\n              || latest.truncated,",
    "      truncated: missing.length > cap || latest.truncated,",
    "MUST FAIL G5b, STRUCTURALLY AND ONLY STRUCTURALLY — both halves of it, since the corrected "
    + "form stops matching and the old form starts. Declared NOT behaviourally drivable on this "
    + "fixture and the reason is at the arm"],

  /* *** THE ARM THAT PROVED MORE THAN IT WAS DECLARED TO, AND IT IS THIS
     CONTROL'S MOST USEFUL RESULT. It was declared STRUCTURAL-ONLY and
     BEHAVIOURALLY INVISIBLE, on the reasoning that a four-row supply sits under
     both `cap + 1` and `(cap + 1) * 2`. THAT REASONING WAS WRONG, and it was
     wrong about which quantity the over-fetch protects. It protects THE ANSWER,
     not just the flag: `cap + 1` is the bound on the RAW fetch, so at a bound of
     2 the raw page is 3 rows, the fence drops one of them, and an uninvited
     member receives TWO rows while being entitled to THREE — and is then told
     `truncated: false`, which is the false-coverage direction this whole table
     exists to refuse. The suite caught it behaviourally at G2 and G3b without
     being written for it. *** */
  overfetch: [STORE,
    "    const latest = this.#frontierPage(\"content\", cap, { limit: (cap + 1) * 2, subjectKind: \"capture\" },",
    "    const latest = this.#frontierPage(\"content\", cap, { limit: cap + 1, subjectKind: \"capture\" },",
    "DECLARED: MUST FAIL G5, structurally and only structurally; behaviourally invisible at this "
    + "corpus. ACTUAL: G2 G3b G5 — THE DECLARATION WAS WRONG IN THE INFORMATIVE DIRECTION. The "
    + "over-fetch is load-bearing on the ANSWER and not only on the flag; see the note above. "
    + "Recorded rather than smoothed. *** RE-RUN 2026-09-23 BY D-389: ACTUAL G1 G5, and the move is "
    + "D-389 WORKING, not drift. At a bound of 2 the narrowed raw fetch (3) now comes back FULL over "
    + "the supply of 4, so the short page reads `truncated: TRUE` — G2 and G3b stop catching it because "
    + "the false-coverage answer they caught is gone. At a bound of 3 the raw fetch (4) is full at "
    + "EXACTLY the supply, so the uninvited member reads TRUE over a complete list and G1 goes red: "
    + "the fail-safe over-report D-389 accepts. The narrowed over-fetch now costs PRECISION, never "
    + "a coverage lie ***"],

  /* THE THIRD DISJUNCT ALONE. `missing_unexplained` is cut at the bound like the
     other two lists, so a claim that omits it is the same class one list over. */
  unexplained: [STORE,
    "      truncated: never.length > cap || unexplained.length > cap\n",
    "      truncated: never.length > cap || false\n",
    "MUST FAIL G5b structurally. Declared NOT behaviourally drivable: `unexplained` is EMPTY on "
    + "this fixture, for the reason `missinglist` states"],
};

const run = () => {
  try {
    const out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { text: out, code: 0 };
  } catch (e) { return { text: `${e.stdout || ""}${e.stderr || ""}`, code: e.status ?? -1 }; }
};
const report = (label, r) => {
  const foot = /observation-content: (-?\d+) pass, (\d+) fail/.exec(r.text);
  const failed = [...r.text.matchAll(/^ {2}FAIL {2}(\w+):/gm)].map((m) => m[1]);
  console.log(`  ${label.padEnd(12)} exit=${String(r.code).padEnd(3)} `
    + `${foot ? `${foot[1]} pass / ${foot[2]} fail` : "NO FOOT — the suite did not reach its own tally (report -1, never 0)"}`
    + `  failing: ${failed.length ? failed.join(" ") : "(none)"}`);
  return failed;
};

const want = process.argv[2] || "all";
console.log(`REC-109 negative control · ${new Date().toISOString()}`);
console.log(`store.mjs ${statSync(STORE).size} bytes · sha ${sha(STORE).slice(0, 16)}`);

report("BASELINE", run());

for (const [name, [file, anchor, repl, declared]] of Object.entries(ARMS)) {
  if (want !== "all" && want !== name) continue;
  const pristine = `${file}.pristine-rec109-${name}`;
  copyFileSync(file, pristine);
  const before = readFileSync(file, "utf8");
  const beforeSha = sha(file);
  if (statSync(pristine).size < MIN_BYTES)
    throw new Error(`REFUSED: pristine copy for ${name} is ${statSync(pristine).size} bytes, under the floor`);
  const n = before.split(anchor).length - 1;
  if (n !== 1) throw new Error(`REFUSED: arm ${name}'s anchor occurs ${n} times, not once — an arm that `
    + `patches zero sites or two is a finding about the arm`);
  writeFileSync(file, before.replace(anchor, repl));
  if (sha(file) === beforeSha) throw new Error(`REFUSED: arm ${name} changed no bytes`);
  console.log(`\n  ARM ${name} — ${declared}`);
  report(name, run());
  copyFileSync(pristine, file);
  const ok = sha(file) === beforeSha;
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", file, pristine]); cmpOk = true; } catch { cmpOk = false; }
  console.log(`  restored byte-identically: ${ok && cmpOk ? "YES" : "NO"} `
    + `(sha ${ok ? "match" : "MISMATCH"}, cmp ${cmpOk ? "match" : "MISMATCH"}, ${statSync(file).size} bytes)`);
  if (!ok || !cmpOk) throw new Error(`REFUSED: arm ${name} did not restore — STOP, the tree is dirty`);
  unlinkSync(pristine);
}

report("BASELINE", run());
