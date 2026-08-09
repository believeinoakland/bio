/* THE NEGATIVE-CONTROL DRIVER FOR `dec65-single-part.test.mjs` (PL-19 / DEC-65).
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so
 * neither the battery nor a fleet walk must discover it. Run it by hand:
 *
 *     node test/dec65-single-part.control.mjs        # from bio-plane/
 *
 * THE PRACTICES, every one of which this repository paid for:
 *   - each arm is armed ALONE, with every other defence held OPEN;
 *   - every arm DECLARES, before arming, what MUST fail and what MUST NOT;
 *   - a BASELINE arm patches nothing, because a harness whose arms all report
 *     the same thing cannot be told from one where none of them armed;
 *   - an OVER-STRICTNESS arm, in which correct work in a spelling the item did
 *     not anticipate MUST PASS — a fence tighter than its rule is not a safer
 *     fence, it is an undeclared interface change wearing the costume of
 *     caution;
 *   - every restore verified by sha256 AND by `cmp`, against pristine copies
 *     named by the ARM as well as by the PATH — two snapshots of one file named
 *     from the path alone is how a driver silently overwrote its own;
 *   - byte counts printed and FLOORED, and the empty-string sha256 refused
 *     outright, because two harnesses once reported a restore byte-identical
 *     over an EMPTY manifest;
 *   - a patch matching ZERO times is a FINDING and is reported as one;
 *   - the tally is read from the suite's FOOT, and a run that never reached it
 *     reports `-1` and never `0`.
 *
 * ================== RESULTS, RUN 2026-08-09 (PL-19) ==================
 * Whole: 37 pass, 0 fail. Seven arms, each ALONE, with every other defence held
 * OPEN. Every restore verified by sha256 AND `cmp`, zero restore problems.
 *
 * WRITTEN INTO THIS HEADER AFTER THE RUN, AND **THREE ARMS CAME BACK OTHER THAN
 * DECLARED. ALL THREE ARE RECORDED HERE RATHER THAN SMOOTHED**, because a
 * surprising result is a finding about the ARM and two of these are findings
 * about the PLANE.
 *
 *   (0) BASELINE, nothing patched -> 37 pass, 0 fail, AS DECLARED. The row that
 *       tells "every arm fired" from "every arm was measuring a broken tree".
 *
 *   (1) THE ENDPOINT GUARD REVERTED TO WHAT FL-3 MEASURED — `isMachineIdentity
 *       (who) && !singlePart` back to `isMachineIdentity(who)`, which refuses on
 *       any leg at all. DECLARED MUST FAIL: block 2's landing arm and everything
 *       downstream needing a landed machine version. DECLARED MUST NOT: block 4
 *       (the document gate) and block 8.
 *       -> 28 pass, 9 FAIL, AS DECLARED; blocks 4 and 8 green.
 *       **THIS IS THE ARM THAT PROVES THE ITEM HAD TO BE ONE ITEM.** C-25.6 is
 *       fully wired here and ONLY the guard is reverted, and the feature is
 *       completely unreachable through the op — which is exactly what would have
 *       shipped had the check been amended alone: a change that lands, passes
 *       its own suite, and changes no behaviour a caller can reach. FL-3's
 *       measurement, re-measured.
 *
 *   (2) THE LICENCE WIDENED — `!singlePart` dropped, so a machine may compose
 *       ANY number of parts. DECLARED MUST FAIL: the two-part refusal arm, and
 *       ONLY that. The arm exists for the sentence DEC-65 and PL-17 both
 *       insisted on: *several parts, none of them claimed, is a different thing
 *       and this state does not license it.*
 *       -> **NOT AS DECLARED: 32 pass, 5 FAIL.** The declared arm fell. FOUR
 *       MORE fell, and they are a finding about the PLANE rather than the
 *       instrument: the widened guard also stops refusing the legs-with-NO-part
 *       and the one-part-declared-TWICE submissions, which then travel on to
 *       `promote` and are refused there — in ANOTHER FAMILY'S WORDS, about a
 *       document this endpoint had already composed. **So the two sites are not
 *       redundant and the arm says which job each does**: the guard's job is to
 *       refuse the act in the words of the act, and C-25.6's is to hold the
 *       bound at the document. That is the failure mode PL-3's guard was built
 *       for, reproduced by widening it.
 *
 *   (3) THE STAMP REVERTED — `#suggestionPersisted` writes `fs(author ?? "")`
 *       again, so a machine's ground row would carry `token:member`. DECLARED
 *       MUST FAIL: block 3's stamp arms and the cross-op read.
 *       -> 28 pass, 9 FAIL. The declared arms are among them, and MORE fell for
 *       a reason worth stating: **the submission does not land at all.** The
 *       endpoint composes a document whose ground row names a machine, and
 *       C-25.6 — still correctly bounded — refuses the whole promotion. So the
 *       overclaim DEC-65 was raised about **cannot reach the record even with
 *       the guard wide open**: the two sites fail CLOSED against each other,
 *       which is a stronger property than either was designed for and is
 *       recorded because nobody declared it.
 *
 *   (4) C-25.6's LICENCE REMOVED — `noClaim` forced to `false`, which was
 *       DECLARED as "the minted value is refused at the gate again" and MUST
 *       FAIL block 4's single-part acceptance.
 *       -> **NOT AS DECLARED: 34 pass, 3 FAIL, and block 4's acceptance PASSED.**
 *       THE DECLARATION WAS WRONG ABOUT WHAT THE PATCH DOES, and the correction
 *       is the useful part. With `noClaim` false the machine arm is reached, and
 *       it asks only *non-blank and not a machine* — which the minted value
 *       satisfies. So this patch does not refuse the value; it returns C-25.6 to
 *       exactly the state PL-17 left it in, where the value passes for a reason
 *       nobody chose. What actually falls is the BOUND: the two-part refusal at
 *       the gate disappears, and the sweep's "exactly one site consumes the
 *       state" goes with it. **The check half's contribution is therefore not
 *       admitting the value — the endpoint's stamp would land it anyway — it is
 *       REFUSING IT ON A MULTI-PART VERSION.** That is the half a hand-authored
 *       document reaches, which PL-3's guard cannot police at all.
 *
 *   (5) THE WRONG FIX PL-17 RECORDED, TAKEN ON PURPOSE FOR ONE RUN — `'none:'`
 *       added to `MACHINE_STAMP_PREFIXES`. PL-17 measured that this makes C-25.6
 *       refuse the minted value with no line of C-25.6 changing, and wrote it
 *       down so the next item would not reach for it. DECLARED MUST FAIL:
 *       everything depending on the value being admitted, plus the identity pins.
 *       -> **NOT AS DECLARED: 36 pass, 1 FAIL — and the surprise is the most
 *       useful result in this driver.** The wrong fix NO LONGER WORKS AS A FIX
 *       AT ALL. PL-19 wired C-25.6 through `isSufficiencyUnclaimed`, and
 *       `sufficiencyClaimState` tests the minted value BEFORE it asks
 *       `isMachineIdentity` — so with `none:` a machine prefix the value is
 *       still admitted, the licence still works end to end, and the ONLY thing
 *       that falls is the pin asserting the stamped value is not a machine
 *       identity. **PL-17's comment claims that arm ordering is load-bearing;
 *       this is that claim MEASURED against the exact patch it was written to
 *       survive.** The one-line change is now purely a defect — it makes the
 *       record read *a machine claimed this* about a value meaning *nobody did*,
 *       and it no longer even buys the fail-closed behaviour that made it
 *       tempting. Kept, so a future reader sees both halves.
 *
 *   (6) OVER-STRICTNESS — the minted value RE-SPELLED
 *       (`none:no-independent-sufficiency-claim`), which is correct work in a
 *       spelling neither PL-17 nor this item anticipated. DECLARED: EVERYTHING
 *       PASSES, because every spelling in the suite is DERIVED from the constant
 *       and the over-strictness member is a REAL ENROLLED MEMBER rather than a
 *       string handed to a predicate. -> 37 pass, 0 fail, AS DECLARED.
 * ====================================================================
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const CHECKS = fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url));
const STORE = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./dec65-single-part.test.mjs", import.meta.url));
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const MIN_BYTES = { [CHECKS]: 200_000, [STORE]: 800_000 };

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* THE ARMS. `find` must match EXACTLY ONCE — a patch matching zero times never
   armed, and one matching twice armed something nobody declared. */
const ARMS = [
  { id: "0-baseline", what: "nothing patched — the row that tells seven-arms-broken from seven-arms-working",
    patches: [] },
  { id: "1-guard-reverted", what: "PL-3's guard back to refusing on ANY leg — the state of the world FL-3 measured",
    patches: [[STORE, "(isMachineIdentity(who) && !singlePart)", "(isMachineIdentity(who))"]] },
  { id: "2-licence-widened", what: "the guard admits ANY number of parts — the widening DEC-65 forbids",
    patches: [[STORE, "if ((declared.length || needsPartition) && (!who || (isMachineIdentity(who) && !singlePart)))",
               "if ((declared.length || needsPartition) && (!who))"]] },
  { id: "3-stamp-reverted", what: "a machine's ground row carries the machine's own identity again",
    patches: [[STORE, "        asserted_by: isMachineIdentity(author) ? SUFFICIENCY_UNCLAIMED : fs(author ?? \"\"),",
               "        asserted_by: fs(author ?? \"\"),"]] },
  { id: "4-check-licence-removed", what: "C-25.6 refuses the minted value again — the check half alone",
    patches: [[CHECKS, "    const noClaim = typeof g.asserted_by === 'string' && isSufficiencyUnclaimed(g.asserted_by);",
               "    const noClaim = false;"]] },
  { id: "5-the-wrong-fix", what: "`none:` joins MACHINE_STAMP_PREFIXES — the fail-closed shape PL-17 recorded so nobody would take it",
    patches: [[CHECKS, "export const MACHINE_STAMP_PREFIXES = [MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX];",
               "export const MACHINE_STAMP_PREFIXES = [MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX, 'none:'];"]] },
  { id: "6-over-strictness", what: "the value RE-SPELLED — correct work in a spelling nobody anticipated MUST PASS",
    patches: [[CHECKS, "export const SUFFICIENCY_UNCLAIMED = 'none:independent-sufficiency';",
               "export const SUFFICIENCY_UNCLAIMED = 'none:no-independent-sufficiency-claim';"]] },
];

/* THE TALLY, READ FROM THE SUITE'S OWN FOOT. Absent means the module ended
   before its last line — a `TypeError` inside an assertion goes through no
   assertion at all — and that is `-1` rather than `0`. */
function runSuite() {
  let out = "";
  try {
    out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { out = String(e.stdout ?? "") + String(e.stderr ?? ""); }
  const m = /dec65-single-part\.test\.mjs\s+(\d+) pass, (\d+) fail/.exec(out);
  if (!m) return { pass: -1, fail: -1, out };
  return { pass: Number(m[1]), fail: Number(m[2]), out };
}

let problems = 0;
console.log("PL-19 / DEC-65 shape (b) — negative controls for the single-part licence\n");

for (const arm of ARMS) {
  const touched = [...new Set(arm.patches.map(([p]) => p))];
  const pristine = new Map();
  for (const p of touched) {
    const snap = `${p}.pristine.${arm.id}`;
    copyFileSync(p, snap);
    const bytes = readFileSync(snap).length;
    const digest = sha(snap);
    if (digest === EMPTY_SHA || bytes < (MIN_BYTES[p] ?? 1)) {
      console.log(`  !! ${arm.id}: pristine copy of ${p} is ${bytes} byte(s), digest ${digest.slice(0, 12)} — REFUSED (a restore verified over an empty file verifies nothing)`);
      problems++;
    }
    pristine.set(p, { snap, digest, bytes });
  }

  let armed = true;
  for (const [p, find, replace] of arm.patches) {
    const src = readFileSync(p, "utf8");
    const hits = src.split(find).length - 1;
    if (hits !== 1) {
      console.log(`  !! ${arm.id}: patch matched ${hits} time(s) in ${p} — AN ARM THAT DID NOT ARM IS A FINDING, and this arm proves nothing`);
      problems++; armed = false; break;
    }
    writeFileSync(p, src.replace(find, replace));
  }

  const r = armed ? runSuite() : { pass: -1, fail: -1 };
  const note = arm.id === "0-baseline" ? "(baseline)"
             : arm.id === "6-over-strictness" ? "(MUST be all-pass)"
             : "(MUST fail)";
  console.log(`  ${arm.id.padEnd(26)} ${String(r.pass).padStart(3)} pass, ${String(r.fail).padStart(2)} fail  ${note}  — ${arm.what}`);
  if (r.pass === -1) { console.log(`     !! the suite did not reach its FOOT — the tally is -1 and not 0`); problems++; }
  /* NAME WHAT FELL, always. A count says an arm fired; only the NAMES say it
     fired on what it was declared against, and every wrong declaration in this
     header was caught exactly by reading these. */
  if (r.out) for (const line of r.out.split("\n").filter((l) => l.includes("FAIL  ")))
    console.log(`       ${line.trim().slice(6, 120)}`);

  for (const [p, { snap, digest, bytes }] of pristine) {
    copyFileSync(snap, p);
    const back = sha(p);
    if (back !== digest) { console.log(`  !! ${arm.id}: ${p} did NOT restore (sha256 ${back.slice(0, 12)} != ${digest.slice(0, 12)})`); problems++; }
    try { execFileSync("cmp", ["-s", p, snap]); }
    catch { console.log(`  !! ${arm.id}: ${p} differs from its pristine copy by CONTENT, which the digest above did not see`); problems++; }
    if (readFileSync(p).length !== bytes) { console.log(`  !! ${arm.id}: ${p} restored at the wrong byte count`); problems++; }
    console.log(`     restored ${p.split("/").pop()} — ${bytes} byte(s), sha256 ${digest.slice(0, 12)}, cmp clean`);
    unlinkSync(snap);
    if (existsSync(snap)) { console.log(`  !! ${arm.id}: pristine copy ${snap} survived the run`); problems++; }
  }
}

console.log(`\n${problems === 0 ? "controls complete" : `controls complete WITH ${problems} PROBLEM(S) — read them, do not smooth them`}`);
process.exitCode = problems ? 1 : 0;
