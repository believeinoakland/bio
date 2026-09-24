/* REC-110's NEGATIVE CONTROL DRIVER — `node test/nc-rec110.mjs [arm|all]`.
 *
 * INSIDE THIS WORKER'S OWN WORKTREE, never a shared scratchpad.
 *
 * **WHAT THIS DRIVER HAS TO PROVE IS UNUSUAL AND IS WORTH SAYING FIRST.** REC-110
 * ruled D-386 (a): the `tally` STAYS UNGATED. A decided-NOT-to-act outcome leaves
 * no new behaviour behind, so there is no fix to remove and the ordinary arm —
 * *delete the fix, watch the suite go red* — has nothing to bite on. **The whole
 * value of the ruling is therefore carried by the PIN**, and these arms exist to
 * show the pin FAILS when a later session quietly changes its mind. An
 * undocumented reversal on a disclosure question is precisely what this row was
 * opened to prevent, so a pin that cannot detect one is worth nothing at all.
 *
 * THE TWO REFUSED ROUTES ARE ARMED SEPARATELY, BECAUSE ONE ARM CANNOT SEE BOTH.
 * D-386's option (b) had two spellings — GATE the field, or silently NARROW what
 * it counts — and they fail differently: gating makes the tally follow the
 * READER (J1), narrowing makes it follow the BOUND (J2). `bound` below is the
 * arm that matters most, because it narrows WITHOUT gating and so walks straight
 * past J1: it is the proof that J2 carries value J1 cannot.
 *
 * EACH ARM ALONE, every other defence held open. Each mutation passes an
 * anchor-occurs-EXACTLY-ONCE guard and a bytes-really-changed guard. Every
 * restore is verified by sha256 AND by `cmp` against a PRISTINE copy named
 * UNIQUELY PER ARM, with a byte count printed and a minimum guarded — because
 * `git checkout --` restores to HEAD and has twice silently discarded a
 * session's own uncommitted work in this repository.
 *
 * AN OPENING AND A CLOSING BASELINE ROW BRACKET THE RUN, and all THREE suites
 * are driven on EVERY arm — the ruling is one ruling at three sites, and an arm
 * that ran one suite would call the other two levels pinned without looking.
 */
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITES = [
  ["log",     fileURLToPath(new URL("./observation-log.test.mjs", import.meta.url)),     /observation-log: (-?\d+) pass, (-?\d+) fail/],
  ["content", fileURLToPath(new URL("./observation-content.test.mjs", import.meta.url)), /observation-content: (-?\d+) pass, (-?\d+) fail/],
  ["meaning", fileURLToPath(new URL("./observation-meaning.test.mjs", import.meta.url)), /observation-meaning: (-?\d+) pass, (-?\d+) fail/],
];
const MIN_BYTES = 500000;
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* The document arm's tally, verbatim — the anchor for three of the four arms.
 * CORRECTED 2026-09-24 BY D-486, NEVER EXEMPTED. It read the pre-D-486 three lines; BOB #32's ruling adds
 * `#hiddenRunTail(viewer)` to the statement and its bindings to the call, so the old anchor matched ZERO times
 * and every arm resting on it would have "passed" WITHOUT ARMING — which this file's own rule calls a finding,
 * not a pass. THE ARMS THEMSELVES ARE UNCHANGED IN MEANING: each still gates, narrows, unsays or perturbs the
 * DOCUMENT arm's tally, and (a), (b) and (d) keep D-486's subtraction in place while they do it, so they
 * measure REC-110's ruling and not D-486's. `armed()` below is what would have caught a stale anchor; it is
 * cheaper to keep the anchor true. */
const DOC_TALLY =
  "    const tally = {};\n"
+ "    for (const row of this.#rows(\n"
+ "      `SELECT state, COUNT(*) n FROM observation_log WHERE level = 'document'${hidTail.sql} GROUP BY state`,\n"
+ "      ...hidTail.args))\n"
+ "      tally[row.state] = row.n;";

/* Each arm: [file, anchor, replacement, declared]. */
const ARMS = {
  /* (a) GATE IT — option (b)'s first spelling, in the crudest honest form: a
     caller who is not the machine credential gets a tally over nothing. */
  gate: [STORE, DOC_TALLY,
    DOC_TALLY
    + "\n    if (viewerPredicate(viewer).scope !== \"member\")\n"
    + "      for (const k of Object.keys(tally)) delete tally[k];",
    "MUST FAIL log J1 (the tally follows the READER). MUST NOT FAIL log J2 — a gated tally still "
    + "does not follow the bound, which is why J2 cannot be the arm for this route"],

  /* (b) NARROW IT — option (b)'s SECOND spelling, and the arm that matters most.
     It counts an UNGATED but BOUND-CUT list, so every viewer still agrees and J1
     stays green over a real change of meaning. This is the silent value change
     inside an unchanged envelope that IC-118's rule names. */
  bound: [STORE, DOC_TALLY,
    /* D-486: the bound-cut list is still UNGATED across readers (that is what makes this arm J2's and not
       J1's), so `hidTail` is simply not consulted here — the arm replaces the whole statement. */
    "    const tally = {};\n"
    + "    for (const r of this.#frontierLatest(\"document\", { limit: cap, subjectKind: \"address\" }))\n"
    + "      tally[r.state] = (tally[r.state] || 0) + 1;",
    "MUST FAIL log J2 (the tally follows the BOUND). **MUST NOT FAIL log J1** — it is ungated, so "
    + "every viewer still agrees. THE ARM THAT PROVES J2 CARRIES VALUE J1 CANNOT"],

  /* (c) UNSAY IT — the decision deleted from a site while the behaviour stays
     correct. The row's requirement is that the next reader meets the DECISION,
     so a pin that only watched behaviour would pass over exactly this. */
  unsay: [STORE, "REC-110, 2026-09-17, D-386 CLOSED. **THE WHOLE REASONING IS AT THE\n"
    + "       DOCUMENT ARM'S TALLY IN `frontier` AND IS DELIBERATELY NOT RESTATED HERE:**",
    "the posture here is not written down.",
    "MUST FAIL content J3 (the site stops carrying the ruling). MUST NOT FAIL any J1/J2 anywhere "
    + "— behaviour is untouched, which is the point: this arm is about the RECORD, not the code"],

  /* (d) OVER-STRICTNESS, AND IT IS THE ARM THAT KEEPS THE PIN HONEST. The tally's
     VALUES change legitimately — no gating, no narrowing — and every J arm must
     stay GREEN. The pin asserts INVARIANCE ACROSS READER AND BOUND, never a
     particular number, and a pin that reddened here would be tighter than its
     rule and would block correct work later. */
  overstrict: [STORE, DOC_TALLY,
    "    const tally = {};\n"
    + "    for (const row of this.#rows(\n"
    + "      `SELECT state, COUNT(*) n FROM observation_log WHERE level = 'document'${hidTail.sql} GROUP BY state`,\n"
    + "      ...hidTail.args))\n"
    + "      tally[row.state] = row.n + 1000;",
    "MUST NOT FAIL ANYTHING. The values move; the invariance does not. A red here means the pin "
    + "is tighter than its rule"],
};

const runSuite = (path) => {
  try {
    const out = execFileSync(process.execPath, [path], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { text: out, code: 0 };
  } catch (e) { return { text: `${e.stdout || ""}${e.stderr || ""}`, code: e.status ?? -1 }; }
};

const report = (label) => {
  const all = [];
  for (const [name, path, foot] of SUITES) {
    const r = runSuite(path);
    const f = foot.exec(r.text);
    const failed = [...r.text.matchAll(/^ {2}FAIL {2}([A-Z]?\w+):/gm)].map((m) => m[1]);
    /* A SUITE THAT DID NOT REACH ITS OWN FOOT REPORTS -1 AND NEVER 0, and the
       driver reads that sentinel rather than the exit status: a TypeError inside
       an assertion goes through NO assertion at all and leaves the tally clean. */
    console.log(`  ${label.padEnd(11)} ${name.padEnd(8)} exit=${String(r.code).padEnd(3)} `
      + `${f ? `${f[1]} pass / ${f[2]} fail` : "NO FOOT — the suite did not reach its own tally"}`
      + `  failing: ${failed.length ? failed.join(" ") : "(none)"}`);
    all.push(...failed.map((x) => `${name} ${x}`));
  }
  return all;
};

const want = process.argv[2] || "all";
console.log(`REC-110 negative control · ${new Date().toISOString()}`);
console.log(`store.mjs ${statSync(STORE).size} bytes · sha ${sha(STORE).slice(0, 16)}`);

console.log("\nOPENING BASELINE");
report("BASELINE");

for (const [name, [file, anchor, repl, declared]] of Object.entries(ARMS)) {
  if (want !== "all" && want !== name) continue;
  const pristine = `${file}.pristine-rec110-${name}`;
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
  report(name);
  copyFileSync(pristine, file);
  const ok = sha(file) === beforeSha;
  let cmpOk = false;
  try { execFileSync("cmp", ["-s", file, pristine]); cmpOk = true; } catch { cmpOk = false; }
  console.log(`  restored byte-identically: ${ok && cmpOk ? "YES" : "NO"} `
    + `(sha ${ok ? "match" : "MISMATCH"}, cmp ${cmpOk ? "match" : "MISMATCH"}, ${statSync(file).size} bytes)`);
  if (!ok || !cmpOk) throw new Error(`REFUSED: arm ${name} did not restore — STOP, the tree is dirty`);
  unlinkSync(pristine);
}

console.log("\nCLOSING BASELINE");
report("BASELINE");
