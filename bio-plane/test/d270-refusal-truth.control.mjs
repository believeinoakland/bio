/* D-270's NEGATIVE CONTROL DRIVER. **NOT a `.test.mjs` ON PURPOSE** — it EDITS
 * REAL SOURCES while it runs, and the battery must not discover it (PL-3, PL-4,
 * PL-11, REC-73, D-262 and REC-79's precedent).
 *
 * Run it by hand from `bio-plane/`:  node test/d270-refusal-truth.control.mjs
 *
 * THE DISCIPLINE, and every line of it was paid for by somebody else's arm:
 *   · a BASELINE arm runs FIRST, so a run in which every arm reports the same
 *     thing is distinguishable from one in which the arms actually worked;
 *   · each arm is armed ALONE, the others held open;
 *   · every patch is CHECKED FOR HAVING ARMED — a patch that matched zero times,
 *     or matched more often than declared, is a FINDING and is printed as one.
 *     *An arm that did not arm is a finding*, and D-270's 2026-08 ancestor shipped
 *     two runs where an arm silently did not arm and read as a refutation;
 *   · every restore is verified by sha256 AND by `cmp` against a UNIQUELY-NAMED
 *     per-arm pristine copy, with the byte count printed and floored;
 *   · the harness lives INSIDE this worktree. The shared scratchpad is not
 *     isolated between sessions and `/tmp/<generic>.log` is not yours.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = join(DIR, "..", "src", "index.mjs");
const SUITE = join(DIR, "d270-refusal-truth.test.mjs");
const WORK = join(DIR, ".d270-control");           /* inside this worktree, never /tmp */
rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
const MIN_BYTES = { [SRC]: 400000, [SUITE]: 8000 };

/* THE ARMS, DECLARED BEFORE ANY OF THEM IS ARMED. `expect` is what MUST happen.
   `patch` returns [newText, occurrencesReplaced] so the driver can tell an arm
   that armed from one that quietly did not. */
const ARMS = [
  { id: "a", file: null, expect: "GREEN",
    what: "BASELINE — nothing armed. Every other arm's figure is read against this one." },

  /* CORRECTED 2026-09-19 (D-136), NEVER EXEMPTED, AND THE CONTROL CAUGHT ITSELF
     BEING DISARMED — which is `CLAUDE.md` M-60 Q9's rule paying for itself: a
     suite coupled to BEHAVIOUR survives a change that silently disarms the
     control coupled to SHAPE. `adminendorse` was named here because it was an
     OMISSION, refused to every session, so collapsing the split changed what it
     was told. D-136 gave it session reach, so `sessionOpGate` now returns early
     for it and it produces NO admission refusal at all — the arm went
     NOT AS DECLARED naming `MISSING[adminendorse]` on the first run after the
     landing, which is the arm working rather than failing.
     `signeradd` REPLACES it rather than the name simply being dropped: the arm's
     value is that it proves the DISTINCTION over more than one op, and a
     one-name arm could be satisfied by a plane that had collapsed everything
     except `memberadd`. `signeradd` is in the ROLE arm, is untouched by this
     item, and is a different family from `memberadd`. */
  /* CORRECTED 2026-09-23 (REC-159), the same way and for the same reason as D-136's correction above:
     `memberadd` and `signeradd` joined BOTH session sets, so the gate returns early for them and
     collapsing the split changes nothing they are told. `governorconfig` (the ROLE arm's one op now)
     and `provenanceroute` (an OMISSION) replace them — still two ops, from two different arms. */
  /* CORRECTED 2026-09-25 (REC-155), a third time and for the same reason: §4.10 (BOB #19) put
     `provenanceroute` in BOTH session sets, so the gate returns early for it and the collapse changes
     nothing it is told — and the real plane's omission arm is now EMPTY. Sentence (c) is driven through
     `unruled-op-fixture.mjs`, which reads THIS file's patched `src/index.mjs` from disk, so the fixture op
     `rec155unruled` replaces it: still two ops, from two different arms. */
  { id: "b", file: SRC, expect: "RED", armedExpect: 2, mustName: ["governorconfig", "rec155unruled"],
    what: "THE SPLIT COLLAPSED — sessionOpGate's three outcomes reduced to the single "
        + "MACHINE_CREDENTIAL_REQUIRED `main` sent before D-270. This is the arm the row's "
        + "accepts-when demands: it proves the suite grades the DISTINCTION, not a code's presence.",
    patch: (s) => {
      let n = 0;
      const out = s.replace(
        /if \(SESSION_OPS\.admin\.has\(op\) \|\| SESSION_OPS\.member\.has\(op\)\)/,
        (m) => { n++; return "if (false && (SESSION_OPS.admin.has(op) || SESSION_OPS.member.has(op)))"; })
        .replace(/const recorded = UNATTENDED_BY_DECISION\[op\];/,
        (m) => { n++; return "const recorded = UNATTENDED_BY_DECISION[op] || 'collapsed';"; });
      return [out, n];
    } },

  /* WIDENED 2026-09-25 (REC-155): §4.10 recorded `livefire` and `reproject`, so emptying the record must
     name them too. */
  { id: "c", file: SRC, expect: "RED", mustName: ["purge", "cpuprobe", "taskdrain", "capturerequestdrain",
                                                  "livefire", "reproject"],
    what: "THE DECLARATION EMPTIED — UNATTENDED_BY_DECISION made empty, so the four ops with a "
        + "recorded decision are told it is an omission. THE ARM FOR BOB'S RULE ITSELF: the plane "
        + "may say 'not for a person' only where a decision is recorded, so emptying the record "
        + "MUST change what the plane says. If it does not, the citation is decorative. "
        + "**RE-DECLARED, AND THE FIRST DECLARATION IS KEPT HERE BECAUSE THE ARM WAS RIGHT AND THE "
        + "DECLARATION WAS WRONG.** It first said this must fail on the by-name map. It came back RED "
        + "for two other reasons and named none of these ops — because that map READS the declaration "
        + "out of the source and grades the plane against it, so emptying the record moves BOTH SIDES "
        + "together and the map agrees with itself for free. The suite gained a LITERAL pin of the "
        + "recorded-decision set in the same turn, which is what this arm now targets.",
    patch: (s) => {
      let n = 0;
      const out = s.replace(/const UNATTENDED_BY_DECISION = \{[\s\S]*?\n\};/,
        (m) => { n++; return "const UNATTENDED_BY_DECISION = {};"; });
      return [out, n];
    } },

  { id: "d", file: SRC, expect: "RED", mustName: ["adminendorse"],
    what: "THE DECLARATION INVENTED — `adminendorse` added to UNATTENDED_BY_DECISION with a "
        + "plausible-looking citation. MUST FAIL. THIS IS THE ARM IN THE DIRECTION THAT MATTERS: "
        + "D-136 exists because §4.7's vote IS meant to be cast by a person, so a rationale "
        + "asserted here is the exact defect the item closes, and it must not pass review quietly.",
    patch: (s) => {
      let n = 0;
      const out = s.replace(/const UNATTENDED_BY_DECISION = \{\n/,
        (m) => { n++; return m + "  adminendorse: \"src/index.mjs, op=adminendorse's OPS row: admin and probe only.\",\n"; });
      return [out, n];
    } },

  { id: "e", file: SRC, expect: "RED", mustName: ["capture", "pdfstructure", "monitor"],
    what: "A CODE GOES BACK TO BEING CODELESS — requiredArgument's `reason` and the row spread "
        + "dropped, `error` left in place. D-270's own defect, re-armed.",
    patch: (s) => {
      let n = 0;
      const out = s.replace(
        /return \{ ok: false, reason: "REQUIRED_ARGUMENT_MISSING",\n\s*\.\.\.requiredArgumentRow\("REQUIRED_ARGUMENT_MISSING"\),\n/,
        (m) => { n++; return "return { ok: false,\n"; });
      return [out, n];
    } },

  { id: "f", file: SUITE, expect: "RED",
    what: "THE OP WALK GOES BLIND — the OPS parse in the SUITE neutered. MUST FAIL on the corpus "
        + "FLOOR, BEFORE any membership claim is made over the empty set, and MUST NOT be able to "
        + "report 'nothing is codeless' as good news.",
    patch: (s) => {
      let n = 0;
      const out = s.replace(/const re = \/\^ {2}\(\[a-z0-9\]\+\):\\s\*\\\{\/gm;/,
        (m) => { n++; return "const re = /^ZZ_NEVER_MATCHES_ZZ/gm;"; });
      return [out, n];
    } },

  { id: "g", file: SUITE, expect: "RED",
    what: "THE ADMIN SESSION IS NOT ONE — the admin arm pointed back at the member session. MUST "
        + "FAIL on the ARM-IS-REAL assertion rather than by silently measuring a split of zero. "
        + "**THIS SUITE MADE THIS EXACT MISTAKE ON ITS FIRST RUN**, as did D-270's 2026-08 "
        + "ancestor, twice. It is armed here so the assertion that caught it stays coupled to it.",
    patch: (s) => {
      let n = 0;
      const out = s.replace(/const ADA = "token=" \+ flog\.result\.token;/,
        (m) => { n++; return "const ADA = DOT;"; });
      return [out, n];
    } },

  { id: "h", file: SRC, expect: "GREEN",
    what: "OVER-STRICTNESS, and this file exists to survive it: a REAL site (the omission arm) "
        + "rewritten to spell its code in `code` with NO `reason` at all, the row read from the "
        + "catalogue rather than hand-copied, and an extra key the grader has never seen. IT MUST "
        + "PASS. A grader that reports correct work as a violation teaches the next author to "
        + "route around it — measured on 2026-08-09, when the equivalent arm came back RED and "
        + "the GRADER moved, not the arm.",
    patch: (s) => {
      let n = 0;
      const out = s.replace(
        /  return refusal\("SESSION_ROUTE_NOT_RECORDED",/,
        (m) => { n++; return `  if (true) { const __r = ADMISSION_CHECKS["SESSION_ROUTE_NOT_RECORDED"];
    return json({ ok: false, code: "SESSION_ROUTE_NOT_RECORDED", check: __r.check,
                  translation: __r.translation, op, sigil: 7,
                  error: "no signed-in session reaches this operation, and no decision on record says why",
                  detail: "Nope — nobody decided this one either way." }, 403); }
  return refusal("SESSION_ROUTE_NOT_RECORDED",`; });
      return [out, n];
    } },
];

const runSuite = () => {
  try {
    const out = execFileSync(process.execPath, [SUITE], { cwd: join(DIR, ".."), encoding: "utf8",
                                                          stdio: ["ignore", "pipe", "pipe"], timeout: 300000 });
    return { code: 0, out };
  } catch (e) { return { code: e.status ?? -1, out: `${e.stdout || ""}${e.stderr || ""}` }; }
};
const tally = (out) => {
  const m = out.match(/(\d+) pass, (\d+) fail/);
  return m ? { pass: +m[1], fail: +m[2] } : { pass: -1, fail: -1 };  /* -1, never 0: a missing tally is not a clean run */
};

console.log("=== D-270 · negative control — arms DECLARED above, run below ===\n");
const results = [];
for (const arm of ARMS) {
  let armed = null, pristinePath = null;
  if (arm.file) {
    pristinePath = join(WORK, `pristine-arm-${arm.id}-${arm.file === SRC ? "index" : "suite"}.mjs`);
    writeFileSync(pristinePath, readFileSync(arm.file));
    const before = readFileSync(arm.file, "utf8");
    const [after, n] = arm.patch(before);
    armed = n;
    writeFileSync(arm.file, after);
  }
  const r = runSuite();
  const tl = tally(r.out);
  const verdict = r.code === 0 ? "GREEN" : "RED";
  /* NAMES: did the failure actually name the ops the declaration said it would? A
     red for the wrong reason is not this arm passing. */
  const failedLines = r.out.split("\n").filter((l) => /^\s*FAIL/.test(l) || /^\s+(want|got)/.test(l)).join("\n");
  const named = (arm.mustName || []).filter((op) => failedLines.includes(op));
  const missing = (arm.mustName || []).filter((op) => !failedLines.includes(op));

  if (arm.file) {
    writeFileSync(arm.file, readFileSync(pristinePath));
    const ok = sha(arm.file) === sha(pristinePath);
    let cmpOk = true;
    try { execFileSync("cmp", [arm.file, pristinePath]); } catch { cmpOk = false; }
    const bytes = readFileSync(arm.file).length;
    const floored = bytes >= (MIN_BYTES[arm.file] || 1);
    console.log(`  restore arm ${arm.id}: sha256 ${ok ? "MATCH" : "**MISMATCH**"} · cmp ${cmpOk ? "clean" : "**DIFFERS**"} · ${bytes} bytes ${floored ? "(above floor)" : "**BELOW FLOOR**"}`);
    if (!ok || !cmpOk || !floored) { console.log("  ABORTING: a restore did not verify."); process.exit(2); }
  }

  const asDeclared = verdict === arm.expect && missing.length === 0
                  && (arm.file === null || armed === (arm.armedExpect ?? 1));
  results.push({ id: arm.id, verdict, expect: arm.expect, tl, armed, named, missing, asDeclared });
  console.log(`ARM ${arm.id}  declared ${arm.expect}  ACTUAL ${verdict}  ${tl.pass}/${tl.fail}`
            + `${arm.file ? `  armed=${armed}/${arm.armedExpect ?? 1}` : ""}`
            + `${arm.mustName ? `  named[${named.join(",")}]${missing.length ? ` MISSING[${missing.join(",")}]` : ""}` : ""}`
            + `  ${asDeclared ? "AS DECLARED" : "*** NOT AS DECLARED ***"}`);
  console.log(`       ${arm.what}\n`);
}

rmSync(WORK, { recursive: true, force: true });
const off = results.filter((r) => !r.asDeclared);
console.log(`\n${results.length - off.length}/${results.length} arms AS DECLARED`
          + (off.length ? `  ·  NOT AS DECLARED: ${off.map((r) => r.id).join(", ")} — a surprising result is a finding about the ARM. Record it; do not smooth it.` : ""));
process.exit(off.length === 0 ? 0 : 1);
