/* REC-77's NEGATIVE CONTROLS, RUN — the four arms `QUEUE.md`'s REC-77 row names.
 *
 * Run it:  node test/refselectivity.control.mjs      (exit 0 = every arm behaved)
 *
 * WHY THIS FILE EXISTS RATHER THAN A PARAGRAPH IN A REPORT. Every arm below is
 * declared BEFORE it is run (`mustFail`, and WHICH assertion must name it), each
 * is armed ALONE with the others held open, and every restore is verified TWICE
 * — by sha256 AND by a byte comparison against a UNIQUELY NAMED per-arm pristine
 * copy. The per-arm naming is not tidiness: a shared `*.pristine` name across
 * arms means arm (d) restores from whatever arm (c) left, and the check compares
 * a file to itself.
 *
 * THE HAZARDS THIS HARNESS IS BUILT AGAINST, each one a receipt from this
 * repository rather than a precaution:
 *   - AN ARM THAT NEVER ARMED. A string replacement that matched nothing runs
 *     the unmodified suite and reports a clean green. Every arm asserts its edit
 *     CHANGED THE FILE (length and sha256 both move) before the suite runs, and
 *     the harness fails loudly if it did not.
 *   - AN ARM THAT COULD NEVER HAVE BEEN HONOURED. An arm whose subject the suite
 *     cannot see fails for the wrong reason, so each arm declares the assertion
 *     LABEL it must produce and the harness checks that label appears among the
 *     failures — not merely that the count went up.
 *   - A RESTORE THAT COMPARED TWO EMPTY FILES. A restore check once used a
 *     BSD-absent flag, produced an empty manifest, compared two empty files and
 *     reported the sha256 of the empty string. Every pristine copy here is
 *     length-checked against a floor before it is trusted.
 *   - A SUITE THAT ENDED WITHOUT REACHING ITS FOOT. A TypeError inside an
 *     assertion ends the module while the tally reads clean. The harness refuses
 *     any run whose output does not carry the suite's own FOOT line.
 *
 * A SURPRISING GREEN IS A FINDING ABOUT THE ARM, not a nuisance. Where one came
 * back other than declared it is recorded in the table at the foot of
 * `readingname.test.mjs`'s `NEGATIVE CONTROL:` header, not smoothed away. */
import { readFileSync, writeFileSync, copyFileSync, statSync, unlinkSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const STORE = HERE + "../src/store.mjs";
const SUITE = HERE + "readingname.test.mjs";
const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const FOOT = /^readingname: (\d+) pass, (\d+) fail$/m;
/* A pristine copy shorter than this is not a copy of anything — the empty-file
   comparison that once reported byte-identical. */
const FLOOR = { [STORE]: 1_000_000, [SUITE]: 40_000 };

let bad = 0;
const say = (s = "") => console.log(s);

/* Run the suite and READ ITS FOOT. A tally taken from anything but the suite's
   own last line can be the tally of a module that died mid-file. */
function runSuite() {
  let out = "";
  try {
    out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { out = `${e.stdout || ""}${e.stderr || ""}`; }
  const m = out.match(FOOT);
  if (!m) return { reachedFoot: false, pass: null, fail: null, failures: [], out };
  return {
    reachedFoot: true, pass: Number(m[1]), fail: Number(m[2]),
    failures: [...out.matchAll(/^ {2}FAIL {2}(.+)$/gm)].map((x) => x[1].trim()), out,
  };
}

/* ONE ARM: copy pristine (uniquely named), edit, PROVE the edit landed, run,
   restore, VERIFY the restore by sha256 AND by bytes. */
function arm({ id, what, file, from, to, mustFail, mustName }) {
  const pristine = `${file}.rec77-nc-${id}.pristine`;
  copyFileSync(file, pristine);
  const sha0 = sha(file), len0 = statSync(file).size;
  if (len0 < FLOOR[file]) { say(`  (${id}) HARNESS FAILURE: ${file} is ${len0} bytes, below the floor — nothing was measured`); bad++; unlinkSync(pristine); return; }

  const src = readFileSync(file, "utf8");
  if (!src.includes(from)) {
    say(`  (${id}) THE ARM NEVER ARMED: the target text is not in ${file.split("/").pop()} — nothing was broken, so a green below would mean nothing`);
    bad++; unlinkSync(pristine); return;
  }
  writeFileSync(file, src.replace(from, to));
  const sha1 = sha(file);
  if (sha1 === sha0) { say(`  (${id}) THE ARM NEVER ARMED: the file is byte-identical after the edit`); bad++; copyFileSync(pristine, file); unlinkSync(pristine); return; }

  const r = runSuite();
  copyFileSync(pristine, file);
  const sha2 = sha(file);
  let cmpOk = true;
  try { execFileSync("cmp", ["-s", file, pristine]); } catch { cmpOk = false; }
  const restored = sha2 === sha0 && cmpOk;
  unlinkSync(pristine);

  const named = r.failures.some((f) => f.includes(mustName));
  const ok = r.reachedFoot && (mustFail ? (r.fail > 0 && named) : r.fail === 0);
  if (!ok || !restored) bad++;
  say(`  (${id}) ${what}`);
  say(`        declared: MUST ${mustFail ? "FAIL" : "PASS"}${mustFail ? `, naming "${mustName.slice(0, 60)}…"` : ""}`);
  say(`        actual:   ${r.reachedFoot ? `${r.pass} pass, ${r.fail} fail` : "THE SUITE NEVER REACHED ITS FOOT — the tally is not evidence"}`
    + `${mustFail ? ` · the declared assertion ${named ? "DID" : "DID NOT"} name it` : ""}`);
  if (r.fail) for (const f of r.failures.slice(0, 6)) say(`          FAIL: ${f}`);
  say(`        restore:  sha256 ${sha2 === sha0 ? "identical" : "DIFFERS"} · cmp ${cmpOk ? "byte-identical" : "DIFFERS"} · pristine was ${len0} bytes`);
  say(`        verdict:  ${ok && restored ? "as declared" : "NOT AS DECLARED — this is a finding, read it"}`);
  say();
}

say("REC-77 negative controls · " + new Date().toISOString().slice(0, 10));
say("baseline (nothing armed):");
{
  const b = runSuite();
  if (!b.reachedFoot || b.fail !== 0) { say(`  BASELINE IS NOT GREEN (${b.pass} pass, ${b.fail} fail, foot ${b.reachedFoot}) — every arm below would be unreadable`); bad++; }
  else say(`  ${b.pass} pass, 0 fail — the arms below are read as a DELTA against this\n`);
}

/* (1) NEUTER THE DISCRIMINATOR. The vacuous alias must be OFFERED AGAIN. */
arm({
  id: "a", file: STORE,
  what: "NEUTER THE DISCRIMINATOR — nothing is ever uninformative, so `Legislation` is offered every reference in the document again",
  from: "static #isUninformative(reach, corpus) { return corpus > 1 && reach >= corpus; }",
  to:   "static #isUninformative(reach, corpus) { return false && corpus > 1 && reach >= corpus; }",
  mustFail: true,
  mustName: "THE VACUOUS ALIAS IS NOT OFFERED",
});

/* (2) THE ARM THIS ITEM TURNS ON. Over-strictness: withhold EVERY partial. The
   1-of-41 identifier — the best correspondence in the corpus in substance — is
   lost, and a fix that does this has traded a false offer for a lost one, which
   on a record whose product is trustworthiness is the worse trade. */
arm({
  id: "b", file: STORE,
  what: "OVER-STRICT — withhold every partial that reaches anything at all; the 1-of-41 identifier is LOST",
  from: "static #isUninformative(reach, corpus) { return corpus > 1 && reach >= corpus; }",
  to:   "static #isUninformative(reach, corpus) { return corpus > 1 && reach >= 1; }",
  mustFail: true,
  mustName: "THE GOOD IDENTIFIER IS STILL OFFERED",
});

/* (3) PIN THE DISCRIMINATOR TO A LITERAL taken from M-4's document. Note what
   this arm demonstrates: on THIS corpus it changes NO behaviour — 41/41 is over
   any threshold and 1/41 is under one — so every behavioural arm goes on
   passing, and only the structural pin on the rule's own text can see it. That
   is the point of the arm, and it is the fifth time this project has measured
   that a copy which agrees today agrees at zero cost. */
arm({
  id: "c", file: STORE,
  what: "PIN THE THRESHOLD — hard-code M-4's 67.5% instead of computing reach against the corpus",
  from: "static #isUninformative(reach, corpus) { return corpus > 1 && reach >= corpus; }",
  to:   "static #isUninformative(reach, corpus) { return corpus > 1 && reach / corpus >= 0.675; }",
  mustFail: true,
  mustName: "THE RULE IS CORPUS-RELATIVE",
});

/* (4) NEUTER THE WALK. The class sweep's detector is blinded; its REACH must
   fall to zero as a DELTA, with the corpus still printed beside it, so the
   difference between "measured, and it is clean" and "looked at nothing" is
   visible on the page rather than inferred. */
arm({
  id: "d", file: SUITE,
  what: "NEUTER THE SWEEP'S DETECTOR — the walk finds nothing and must say so as a DELTA, with its corpus still printed",
  from: `/(?:^|[^\\w.])((?:Store\\.)?#?[A-Z][A-Z_]{2,})\\.indexOf\\(/gm`,
  to:   `/(?:^|[^\\w.])((?:Store\\.)?#?[A-Z][A-Z_]{2,})\\.zzqNeverMatches\\(/gm`,
  mustFail: true,
  mustName: "SWEEP GUARD",
});

say(bad ? `${bad} arm(s) did NOT behave as declared — read the verdicts above` : "every arm behaved as declared");
process.exit(bad ? 1 : 0);
