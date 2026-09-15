/* CAP-9's NEGATIVE CONTROL HARNESS. Declared in `test/capture-pagecount.test.mjs`,
 * run from `bio-plane/` in one step:
 *
 *     node test/nc-cap9.mjs             # every arm, in order, baseline first
 *     node test/nc-cap9.mjs drop        # one arm
 *
 * NOT a `.test.mjs` and NOT a fleet suite, deliberately: it EDITS REAL SOURCES
 * while it runs, so neither the battery's discovery nor `coverage.mjs`'s fleet
 * walk must find it — the `nc-rec82.mjs` / `owed-controls.control.mjs`
 * precedent, and it is named the same way to the same effect.
 *
 * THE RULES THIS HARNESS OBEYS, each with its receipt in WORKER.md:
 *   - ONE ARM AT A TIME, every other defence held OPEN.
 *   - A BASELINE ROW that arms nothing. It is the only row that distinguishes
 *     five-arms-broken from five-arms-working.
 *   - EVERY ARM DECLARES, BEFORE IT RUNS, what MUST fail and what MUST NOT.
 *   - EVERY ARM REPORTS WHETHER IT ARMED (the patch's match count; a count that
 *     is not exactly 1 is a FINDING, not a retry).
 *   - EVERY RESTORE is verified against a UNIQUELY-NAMED per-arm pristine copy
 *     by sha256 AND by CONTENT, with a byte count printed and a minimum
 *     guarded. `git checkout --` is never used: it restores to HEAD, not to
 *     what was there, and has twice discarded a session's own uncommitted work.
 *   - A SURPRISING GREEN IS A FINDING ABOUT THE ARM and is printed, not smoothed.
 *
 * THE TWO DIRECTIONS THIS ITEM HAS TO PROVE, and why there are five arms rather
 * than one: `drop` breaks the WRITER (the count never reaches the reading) and
 * `prefer` breaks the READER (the count is there and is ignored) — two different
 * failures that a single arm would have collapsed into one. `overstrict` arms the
 * direction that refuses CORRECT work. `derived` proves this suite still
 * exercises the pre-CAP-9 derivation this landing must not remove.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const PLANE = join(DIR, "..");
const REPO = join(PLANE, "..");
/* The pristine copies live INSIDE this worktree, in a DOT-directory so neither
   the battery's discovery nor the fleet walk can enrol what it holds — and never
   in the shared scratchpad, which is NOT isolated between sessions and has had a
   harness overwritten mid-turn by a concurrent worker. */
const SAFE = join(REPO, ".cap9-control-pristine");
mkdirSync(SAFE, { recursive: true });

const INDEX = join(PLANE, "src/index.mjs");
const STORE = join(PLANE, "src/store.mjs");
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = 20000;   // both files are hundreds of KB; a restore over a stub must fail loudly.

/* The subject: this item's own suite, run alone. Captured to a FILE and not a
   pipe — D-282: a suite that calls process.exit() discards unflushed PIPE
   writes, and a control whose tally reads -1 because of it reports the wrong
   arm as wrong. */
const runSuite = () => {
  const r = spawnSync(process.execPath, ["test/capture-pagecount.test.mjs"],
    { cwd: PLANE, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = /(\d+) pass, (\d+) fail/.exec(out);
  /* A TypeError inside an assertion goes through no assertion at all and ends
     the module while the tally reads clean, so a MISSING tally is reported as
     -1 and never as 0 — the suite did not reach its own FOOT. */
  return { pass: m ? +m[1] : -1, fail: m ? +m[2] : -1, exit: r.status,
           failing: out.split("\n").filter((l) => l.includes("FAIL  ")).map((l) => l.trim()) };
};

/** Apply exactly one textual patch, reporting the match count. */
function arm(file, find, replace) {
  const src = readFileSync(file, "utf8");
  const n = src.split(find).length - 1;
  if (n !== 1) return { armed: false, matches: n };
  writeFileSync(file, src.replace(find, replace));
  return { armed: true, matches: n };
}

const ARMS = {
  baseline: {
    files: [], why: "nothing armed — the row that distinguishes five-arms-broken from five-arms-working",
    mustFail: [], mustPass: "everything", patch: () => ({ armed: true, matches: 0 }),
  },
  drop: {
    files: [INDEX],
    why: "THE ARM THAT PROVES THE GAP WAS REAL — drop the page count from the persisted reading, which is exactly what the record held before this item. C-45.1 then cannot fire on a freshly acquired PDF",
    mustFail: ["the reading carries the page count the fixture was BUILT with",
               "it carries the page count THROUGH THE OP",
               "a leg naming page 10 of a three-page document is REFUSED BY NAME"],
    mustPass: "the two-absences arm (an HTML capture still never gets the key) and every synthetic-reading arm — the writer is broken, not the reader",
    patch: () => arm(INDEX,
      "reading.page_count = Number.isInteger(pageCount) && pageCount > 0 ? pageCount : null;",
      "reading.page_count = null;"),
  },
  prefer: {
    files: [STORE],
    why: "break the READER rather than the writer — the count is on the reading and `#pageSetForCapture` ignores it, falling back to the derived union",
    mustFail: ["a leg naming page 10 of a three-page document is REFUSED BY NAME",
               "the row records the page count it was minted against",
               "page 5 is refused against the STORED count of 3, not the chain's floor of 6"],
    mustPass: "the acquire and persist arms — the count still reaches the reading, which is what separates this failure from `drop`'s",
    patch: () => arm(STORE,
      "if (Number.isInteger(stored) && stored > 0) return stored;",
      "if (false) return stored;"),
  },
  overstrict: {
    files: [STORE],
    why: "THE OVER-STRICTNESS DIRECTION — answer 1 instead of null where the record holds no page set, so a page citation on a document whose page set was never recorded is refused and a null row is defaulted to a number. A fence tighter than its rule is not a safer fence",
    mustFail: ["a page-8 citation on a capture with no recorded page set MINTS, not refused",
               "its page count is stated NULL, never defaulted to a number"],
    mustPass: "every refusal arm above — the arm must break correct work and nothing else",
    patch: () => arm(STORE,
      "return max < 0 ? null : max + 1;",
      "return max < 0 ? 1 : max + 1;"),
  },
  derived: {
    files: [STORE],
    why: "neuter the SCOPED-CHAIN union, the pre-CAP-9 mechanism this landing must not remove — a mixed document's page set then comes from nowhere",
    mustFail: ["the scoped chain's own page set still refuses an out-of-range extent",
               "naming the union it was derived from"],
    mustPass: "every stored-count arm, including the precedence arm — the stored figure is preferred and never reaches this code",
    patch: () => arm(STORE,
      "for (const p of e.pages) if (Number.isInteger(p) && p > max) max = p;",
      "for (const p of e.pages) if (false) max = p;"),
  },
};

const want = process.argv[2];
const names = want ? [want] : Object.keys(ARMS);
if (want && !ARMS[want]) { console.error(`unknown arm '${want}'. arms: ${Object.keys(ARMS).join(", ")}`); process.exit(2); }

let finding = 0;
for (const name of names) {
  const a = ARMS[name];
  console.log(`\n===== ARM ${name} =====`);
  console.log(`  WHY        ${a.why}`);
  console.log(`  MUST FAIL  ${a.mustFail.length ? a.mustFail.join(" | ") : "(nothing — baseline)"}`);
  console.log(`  MUST PASS  ${a.mustPass}`);
  /* Pristine copies, UNIQUELY NAMED PER ARM, taken before the patch. */
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
  if (!armed.armed && name !== "baseline") {
    console.log(`  FINDING    the arm DID NOT ARM. An arm that did not arm is a finding, never a retry.`);
    finding++;
  }
  const r = runSuite();
  console.log(`  RESULT     ${r.pass} pass, ${r.fail} fail, exit ${r.exit}`);
  for (const l of r.failing) console.log(`             ${l}`);
  /* Restore, and MEASURE the restore. */
  for (const s of saved) {
    copyFileSync(s.dest, s.f);
    const back = sha(s.f);
    const sameBytes = readFileSync(s.f).equals(readFileSync(s.dest));
    console.log(`  RESTORED   ${s.f.replace(REPO + "/", "")}  byte-identically: ${back === s.sha && sameBytes ? "YES" : "NO"}  ${statSync(s.f).size} bytes  sha256 ${back.slice(0, 12)}…`);
    if (!(back === s.sha && sameBytes)) { console.log("  FINDING    restore FAILED — stopping before the next arm measures the wrong tree"); process.exit(2); }
  }
  /* The declared verdict, checked. */
  if (name === "baseline") {
    const ok = r.fail === 0 && r.pass > 0;
    console.log(`  VERDICT    ${ok ? "AS DECLARED — green" : "NOT AS DECLARED"}`);
    if (!ok) finding++;
  } else {
    const hit = a.mustFail.filter((m) => r.failing.some((l) => l.includes(m)));
    const ok = r.fail > 0 && hit.length === a.mustFail.length;
    console.log(`  VERDICT    ${ok ? "AS DECLARED" : "NOT AS DECLARED"} — ${hit.length}/${a.mustFail.length} declared failure(s) present, ${r.fail} total failing`);
    if (!ok) finding++;
  }
}
console.log(`\n${finding === 0 ? "every arm AS DECLARED" : `${finding} arm(s) NOT AS DECLARED — a surprising result is a finding about the ARM, recorded rather than smoothed`}`);
process.exit(0);
