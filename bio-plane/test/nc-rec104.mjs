/* REC-104's NEGATIVE CONTROL HARNESS. Declared in `test/content-chain-kind.test.mjs`
 * and `test/content-arm.test.mjs`, run from `bio-plane/` in one step:
 *
 *     node test/nc-rec104.mjs             # every arm, in order, baseline first
 *     node test/nc-rec104.mjs parseback   # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it. `nc-rec90.mjs`'s shape, and a deliberate COPY rather than an
 * import — a control harness that shares machinery with another item's harness
 * shares that harness's defects.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing, and it is RUN TWICE: the second run is
 *     the A/A arm for the answer digest (below), without which a digest that
 *     moved between two arms could be a digest that moves between any two runs.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count; a count that
 *     is not exactly 1 is a FINDING, not a retry).
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy by
 *     sha256 AND by CONTENT, with a byte count printed and a minimum guarded.
 *     `git checkout --` is never used.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 *
 * THE OVER-STRICTNESS ARM IS `preitem`, and it is the one this item's row asks for
 * by name: "every `content:` query answers byte-identically to its pre-item answer
 * on the committed fixture". `content-arm.test.mjs` §11 prints a sha256 over the
 * answers of every `content:` query it asks. `preitem` swaps in the three plane
 * sources exactly as they stood at the commit this item was built on (read with
 * `git show`, never typed) and runs the SAME suite: its section-11 digest must
 * EQUAL the baseline's, while the sections that assert the column exists must
 * FAIL — the pre-item tree has no column, and a `preitem` run that stayed green
 * would mean the suite cannot tell the two trees apart.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { controlPen } from "./pen.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* THE PEN IS OUTSIDE THE WORKTREE (M0-182, BOB #32). `controlPen` is `mkdtempSync` under the system
   temp root, so neither the battery's discovery nor the fleet walk can enrol what it holds, and the
   tree stays CLEAN while the control runs — which matters because since D-293 a gate on a dirty tree
   RECORDS NOTHING. `mkdtemp`, not a fixed name, is what keeps it isolated: the shared scratchpad and
   `/tmp` are not isolated between sessions, and a harness there was once overwritten mid-turn by a
   concurrent worker. */
const SAFE = controlPen("rec104");
mkdirSync(SAFE, { recursive: true });

/* THE COMMIT THIS ITEM WAS BUILT ON. Pinned, never `origin/main`: a moving ref
   would make `preitem` measure whatever landed since, and the digest comparison
   would stop being about this item. */
const PRE_ITEM = "694f0a7fc53ca550624a308d01864a5ae18e0e28";

const STORE = join(PLANE, "src/store.mjs");
const QUERY = join(PLANE, "src/query.mjs");
const SCHEMA = join(PLANE, "src/schema.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;

/* Each suite captured to a FILE-equivalent buffer, not a pipe — D-282. A MISSING
   tally is reported as -1 and never as 0: the suite did not reach its own FOOT. */
const runSuite = (file) => {
  const r = spawnSync(process.execPath, [file],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  const d = /REPORT content-answers sha256 ([0-9a-f]{64}) over (\d+) queries/.exec(out);
  return { file, pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           digest: d ? d[1] : null, queries: d ? +d[2] : 0,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()),
           /* When the suite did not reach its foot, the reason is in its last lines and
              is printed: a crash is a finding about the SUITE, not a failure by name. */
           tail: m ? [] : out.trimEnd().split("\n").slice(-6) };
};
const SUITES = ["test/content-arm.test.mjs", "test/content-chain-kind.test.mjs"];

function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

/* D-686 (BOB #35, 2026-09-25) SUPERSEDED FOUR OF THIS HARNESS'S ARMS, and they are MOVED, not dropped.
   `firststep` and `nowriter` broke REC-104's GENERATED column — made it read the chain's first step, or
   made it a plain column nobody writes — and D-686 replaced that column with a plain one written at mint
   by `textchain.mjs` `chainKindFor`, so the text they patched no longer exists. `nomigrate` and `xinfo`
   anchored on a migration block D-686 rewrote. Their properties are D-686's now and are armed in
   `test/nc-d686.mjs`: the column untrue of its unit (`generated`, `wholechain`), the unwritten plain
   column (`nowrite`), the migration disabled (`nomigrate`) and the guard reading `table_info` (`xinfo`).
   What REMAINS here is REC-104's own: the parse kept beside the column (`parseback`) and the pre-item
   over-strictness digest (`preitem`). */
const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes arms-broken from arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  baseline2: {
    files: [], why: "nothing armed, AGAIN — the A/A arm: the answer digest must be identical across "
       + "two untouched runs, or a digest that differs under `preitem` proves nothing",
    mustFail: [], mustPass: "everything, and the SAME digest as `baseline`",
    patch: () => ({ armed: true, matches: 0 }),
  },
  parseback: {
    files: [QUERY],
    why: "THE PARSE KEPT BESIDE THE COLUMN. `chain_last` goes back to parsing the blob while the filter "
       + "reads the column — two answers to one question, the mirror-and-drift class the row forbids. "
       + "Behaviourally INVISIBLE on a correct tree (both agree), so only the structural pin can see it",
    mustFail: ["query.mjs holds NO json_extract over the chain column anywhere in its code",
               "the rows=content projection reads `chain_last` off the column too"],
    mustPass: "every behavioural assertion in both suites — they agree for free when both answers are "
            + "right, which is exactly why the structural pin exists",
    /* RE-ANCHORED BY REC-121: `chain_last` became a CASE (a bytes row says
       `does-not-apply`), so the old anchor `chain_last: \`m.chain_kind\`,` matched
       ZERO times and this arm would have read ARMED NO. The parse goes back into
       the text-row branch, which is where it would bite. */
    patch: () => arm(QUERY, "+ `ELSE m.chain_kind END`,", "+ `ELSE json_extract(m.chain, '$[#-1].step') END`,"),
  },
  preitem: {
    files: [QUERY, SCHEMA, STORE],
    why: "OVER-STRICTNESS: the three plane sources exactly as they stood at the commit this item was "
       + "built on. The `content-arm.test.mjs` §11 digest must EQUAL the baseline's — the column "
       + "changes how the question is answered and never which rows answer it",
    mustFail: ["the `chain` sub-field reads the COLUMN"],
    mustPass: "the section-11 answer digest, byte-identical to `baseline`'s",
    digestMustMatch: true,
    patch: () => {
      for (const f of [QUERY, SCHEMA, STORE])
        writeFileSync(f, execFileSync("git", ["show", `${PRE_ITEM}:bio-plane/src/${f.split("/").pop()}`],
          { cwd: REPO, maxBuffer: 64 * 1024 * 1024 }));
      return { armed: true, matches: 3 };
    },
  },
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0, baseDigest = null;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  const saved = a.files.map((f) => {
    const dest = join(SAFE, `${name}.${f.split("/").pop()}`);
    copyFileSync(f, dest);
    return { f, dest, sha: sha(f), bytes: statSync(f).size };
  });
  for (const s of saved) {
    console.log(`  PRISTINE   ${s.f.replace(REPO + "/", "")}  ${s.bytes} bytes  sha256 ${s.sha.slice(0, 12)}…`);
    if (s.bytes < MIN_BYTES) { console.log(`  FINDING    pristine copy is under ${MIN_BYTES} bytes — refusing to proceed`); process.exit(2); }
  }
  const armed = a.patch();
  console.log(`  ARMED      ${armed.armed ? "yes" : "NO"}  (patch matched ${armed.matches}×)`);
  if (!armed.armed) { console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`); finding++; }
  const results = SUITES.map(runSuite);
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const same = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && same ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && same)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  let fails = 0;
  const failing = [];
  for (const r of results) {
    console.log(`  RESULT     ${r.file}: ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`
              + (r.digest ? `  digest ${r.digest.slice(0, 16)}… over ${r.queries} queries` : ""));
    for (const l of r.failing) console.log(`             ${l}`);
    for (const l of r.tail) console.log(`             NO FOOT | ${l}`);
    fails += Math.max(r.fail, 0) + (r.pass < 0 ? 1 : 0);
    failing.push(...r.failing);
  }
  const digest = results[0].digest;
  if (name === "baseline") baseDigest = digest;
  let ok;
  if (name === "baseline" || name === "baseline2") {
    ok = fails === 0 && results.every((r) => r.pass > 0) && !!digest
      && (name === "baseline" || !baseDigest || digest === baseDigest);
    if (name === "baseline2" && baseDigest) console.log(`  A/A        digest ${digest === baseDigest ? "IDENTICAL" : "DIFFERENT"} across two untouched runs`);
  } else {
    const hit = a.mustFail.filter((m) => failing.some((l) => l.includes(m)));
    ok = fails > 0 && hit.length === a.mustFail.length;
    for (const m of a.mustFail.filter((x) => !failing.some((l) => l.includes(x))))
      console.log(`  MISSING    declared failure did NOT occur: ${m}`);
    if (a.digestMustMatch) {
      const same = !!digest && digest === baseDigest;
      console.log(`  DIGEST     pre-item ${digest ? digest.slice(0, 16) + "…" : "(none printed)"} vs baseline ${baseDigest ? baseDigest.slice(0, 16) + "…" : "(not run — run the harness whole)"}: ${same ? "IDENTICAL" : "DIFFERENT"}`);
      ok = ok && same;
    }
  }
  console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"}`);
  if (!ok) finding++;
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
