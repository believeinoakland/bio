/* THE NEGATIVE-CONTROL DRIVER FOR `sufficiency-state.test.mjs` (PL-17 / DEC-65).
 *
 * DELIBERATELY NOT A `.test.mjs`. It EDITS REAL SOURCES while it runs, so
 * neither the battery nor a fleet walk must discover it. Run it by hand:
 *
 *     node test/sufficiency-state.control.mjs        # from bio-plane/
 *
 * WHAT IT DOES, and every clause is a practice this repository paid for:
 *   - each arm is armed ALONE, with every other defence held OPEN;
 *   - every arm DECLARES, before arming, what MUST fail and what MUST NOT;
 *   - there is a BASELINE arm that patches nothing, because a harness whose
 *     arms all report the same thing cannot be told from one where none armed;
 *   - every restore is verified by sha256 AND by `cmp` (a byte comparison
 *     catches what a digest of the wrong snapshot cannot), against pristine
 *     copies named by the ARM as well as by the path — two snapshots of one
 *     file named from the path alone is how one driver overwrote its own;
 *   - byte counts are printed and FLOORED, and the empty-string sha256 is
 *     refused outright, because two harnesses once reported a restore
 *     byte-identical over an EMPTY manifest;
 *   - a patch that matches ZERO times is a FINDING and is reported as one: an
 *     arm that did not arm proves nothing about the arm it stands for;
 *   - the suite's tally is read from its FOOT. A run that never reached the
 *     foot reports `-1`, never `0` — a `TypeError` inside an assertion goes
 *     through no assertion at all and ends the module with a clean-looking
 *     tally.
 *
 * ================== RESULTS, RUN 2026-08-09 (PL-17) ==================
 * Whole: 35 pass, 0 fail. Eight arms, each ALONE. Written into the header
 * after the run, including the arms that came back other than declared.
 *
 *   (0) BASELINE, nothing patched -> 35 pass, 0 fail, AS DECLARED. It is here
 *       so that "every arm fired" can be told apart from "every arm was
 *       measuring a broken tree".
 *   (1) THE ITEM'S OWN — MAKE THE NEW STATE A CLAIM. Delete the `unclaimed`
 *       arm from `sufficiencyClaimState`, so the minted value falls through to
 *       `claimed`. DECLARED MUST FAIL: the back-door assertions and the
 *       totality. DECLARED MUST NOT: the published words, the op, and block 7
 *       (the gates are untouched by this patch). -> 30 pass, **5** FAIL (six
 *       were declared; the count was a guess written before the run and the
 *       NAMES are what matter, so the driver now prints them). The headline is
 *       the item's own sentence, measured: the value whose entire meaning is
 *       *nobody claimed this* read as a member's claim, and
 *       `isSufficiencyClaimed` — the one predicate every future consumer is
 *       told to ask — answered TRUE for it.
 *   (2) COLLAPSE "NOBODY SAID" INTO "THE RECORD DOES NOT SAY". Blank returns
 *       `unclaimed`. DECLARED MUST FAIL: block 3 both directions, and the
 *       totality. DECLARED MUST NOT: the back-door arms, because a blank still
 *       is not a claim either way. -> 32 pass, **3** FAIL (four declared, same
 *       correction as arm 1), on the declared assertions. This is the arm for
 *       DEC-65's own words — *distinct from both a member's affirmative claim
 *       AND from a silent default* — and it fails on the second half, which is
 *       the half a reader is most likely to think is cosmetic.
 *   (3) MAKE THE VALUE A MACHINE STAMP. Add `'none:'` to
 *       `MACHINE_STAMP_PREFIXES`. DECLARED MUST FAIL: the collision pin ONLY
 *       (three assertions). DECLARED MUST NOT: blocks 1, 2 and 3, because
 *       `sufficiencyClaimState` tests the minted value BEFORE it asks
 *       `isMachineIdentity` — the arm ordering the mint's comment claims is
 *       load-bearing.
 *       -> **NOT AS DECLARED: 30 pass, 5 FAIL.** The declared three fell, and
 *       the classification held exactly as declared — so the comment about the
 *       arm ordering is PROVEN rather than asserted, which is what this arm was
 *       for. But TWO MORE fell that the declaration did not anticipate, and
 *       they are a real finding about the DESIGN rather than about the
 *       instrument: block 7's two gate pins flipped, because with `none:` a
 *       machine prefix, **C-25.6 starts REFUSING the minted value without a
 *       line of C-25.6 changing.** That is a fail-closed shape available to the
 *       next item at the cost of one array entry — and it is the WRONG one,
 *       which is why it is written down here rather than taken: it makes the
 *       record say *a machine claimed this* about a value whose entire meaning
 *       is that nobody did. "A machine said" and "nobody said" are different
 *       findings. The arm is kept, and its surprise is recorded, not smoothed.
 *   (4) PUBLISH A COPY INSTEAD OF THE IMPORT. Replace
 *       `sufficiency_claim_states: SUFFICIENCY_CLAIM_STATES` with a literal
 *       copy of the same four texts. DECLARED MUST FAIL: the identity pin and
 *       the no-literal pin. DECLARED MUST NOT: the through-the-op arm. ->
 *       33 pass, 2 FAIL, AS DECLARED — and NOTE WHAT DOES NOT FAIL: every wire
 *       assertion PASSES, because an identical copy agrees at zero cost. That
 *       is REC-35's finding restated for a fifth vocabulary, and the structural
 *       pin is the whole of this control.
 *   (5) BREAK A TEXT — set the `unclaimed` sentence to its own key. DECLARED
 *       MUST FAIL: the phrase rule and the restates-its-key rule. DECLARED MUST
 *       NOT: the identity pin, which compares objects and not their contents.
 *       -> 33 pass, 2 FAIL, AS DECLARED. This arm exists because arm E of
 *       `civicos-ui/check-refusal-codes.mjs` does NOT reach this vocabulary
 *       (measured — see the suite's own note), so these rules are enforced HERE
 *       or nowhere.
 *   (6) OVER-STRICTNESS — re-spell the minted value
 *       (`none:no-independent-sufficiency-claim`), which is correct work in a
 *       spelling the suite did not anticipate. DECLARED: EVERYTHING PASSES.
 *       -> **NOT AS DECLARED ON ITS FIRST RUN: 33 pass, 2 FAIL.** The finding
 *       is about the INSTRUMENT and not the subject, and it is the reason this
 *       arm is mandatory: the suite's corpus HAND-TYPED two case variants of
 *       the value (`"None:Independent-Sufficiency"`), so a re-spelling left
 *       them behind reading as member names. Corrected to derive every variant
 *       from the constant, re-run -> 35 pass, 0 fail, as declared. A hand-typed
 *       variant of a minted literal agrees for free until the literal moves.
 *   (7) WIRE THE STATE INTO C-25.6, which is the NEXT item's change made here
 *       for one run only: `isMachineIdentity(g.asserted_by)` ->
 *       `!isSufficiencyClaimed(g.asserted_by)` in `basisVersionFindings`.
 *       DECLARED MUST FAIL: block 7's inert pin and the sweep's
 *       nothing-consumes-it pin — because those two are written to fail exactly
 *       when the state stops being inert.
 *       -> **NOT AS DECLARED ON ITS FIRST RUN: it failed the inert pin and the
 *       sweep's REACH FLOOR, while the nothing-consumes-it assertion went on
 *       PASSING — over a site that had just started consuming it.** The finding
 *       is about the instrument and it is the sharpest one in this item: the
 *       sweep matcher recognised an asking site by `isMachineIdentity`, the
 *       spelling the sites happen to use TODAY, so converting a site made it
 *       VANISH from the sweep rather than flip its verdict. A classifier
 *       grading one literal hides exactly what it was built to find. The
 *       matcher now names every predicate that can do the judging — the old one
 *       and the ones this item minted — and the arm re-ran -> 33 pass, 2 FAIL
 *       on the two DECLARED assertions.
 *       **This arm is the evidence that block 7 is a live pin and not a
 *       comment**: the item that lands DEC-65's shape (b) will see these two
 *       fail, and CORRECTS them with a note saying why the old expectation was
 *       right when it was written. It is not an exemption and must not become
 *       one.
 * ====================================================================
 */
import { readFileSync, writeFileSync, copyFileSync, unlinkSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const CHECKS = fileURLToPath(new URL("../checks/bio-checks.mjs", import.meta.url));
const AFFORD = fileURLToPath(new URL("../src/affordances.mjs", import.meta.url));
const SUITE = fileURLToPath(new URL("./sufficiency-state.test.mjs", import.meta.url));
const EMPTY_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const MIN_BYTES = { [CHECKS]: 200_000, [AFFORD]: 40_000 };

const sha = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

/* THE ARMS. `find` must match EXACTLY ONCE — a patch that matches zero times
   never armed, and one that matches twice armed something nobody declared. */
const ARMS = [
  { id: "0-baseline", what: "nothing patched — the row that tells six-arms-broken from six-arms-working", patches: [] },
  { id: "1-state-is-a-claim", what: "the minted no-claim value falls through to `claimed`",
    patches: [[CHECKS, "  if (s.toLowerCase() === SUFFICIENCY_UNCLAIMED) return 'unclaimed';\n", ""]] },
  { id: "2-blank-is-the-value", what: "a blank field reads as the explicit no-claim state",
    patches: [[CHECKS, "  if (s === '') return 'unstated';", "  if (s === '') return 'unclaimed';"]] },
  { id: "3-value-is-a-machine-stamp", what: "`none:` joins the machine prefixes",
    patches: [[CHECKS, "export const MACHINE_STAMP_PREFIXES = [MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX];",
               "export const MACHINE_STAMP_PREFIXES = [MACHINE_AUTHOR_PREFIX, MACHINE_CLASS_PREFIX, 'none:'];"]] },
  { id: "4-published-as-a-copy", what: "the vocabulary is published as a literal copy instead of the import",
    patches: [[AFFORD, "  sufficiency_claim_states: SUFFICIENCY_CLAIM_STATES,",
               "  sufficiency_claim_states: {\n"
               + "    claimed:        'a member said this group of reasons would carry the answer on its own, and the record holds their name and the date',\n"
               + "    unclaimed:      'nobody said this group of reasons would carry the answer on its own, and the record states that outright rather than leaving it blank',\n"
               + "    unstated:       'the record does not say whether anyone claimed this group of reasons would carry the answer on its own',\n"
               + "    machine_stamped: 'a machine credential stands where the name of the member making that claim has to be, so no member has claimed anything here',\n"
               + "  },"]] },
  { id: "5-text-restates-its-key", what: "a published state's sentence becomes its own machine word",
    patches: [[CHECKS, "  unclaimed:      'nobody said this group of reasons would carry the answer on its own, and the record states that outright rather than leaving it blank',",
               "  unclaimed:      'unclaimed',"]] },
  { id: "6-over-strictness", what: "the value RE-SPELLED — correct work in a spelling the suite did not anticipate MUST PASS",
    patches: [[CHECKS, "export const SUFFICIENCY_UNCLAIMED = 'none:independent-sufficiency';",
               "export const SUFFICIENCY_UNCLAIMED = 'none:no-independent-sufficiency-claim';"]] },
  { id: "7-wire-it-into-c-25-6", what: "the NEXT item's change, for one run: C-25.6 consumes the state",
    patches: [[CHECKS, "    if (typeof g.asserted_by !== 'string' || g.asserted_by.trim() === '' || isMachineIdentity(g.asserted_by)) {",
               "    if (!isSufficiencyClaimed(g.asserted_by)) {"]] },
];

/* THE TALLY, READ FROM THE SUITE'S OWN FOOT. Absent means the module ended
   before its last line, and that is `-1` rather than `0`. */
function runSuite() {
  let out = "";
  try {
    out = execFileSync(process.execPath, [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) { out = String(e.stdout ?? "") + String(e.stderr ?? ""); }
  const m = /sufficiency-state\.test\.mjs\s+(\d+) pass, (\d+) fail/.exec(out);
  if (!m) return { pass: -1, fail: -1, out };
  return { pass: Number(m[1]), fail: Number(m[2]), out };
}

let problems = 0;
console.log("PL-17 / DEC-65 — negative controls for the third `asserted_by` state\n");

for (const arm of ARMS) {
  const touched = [...new Set(arm.patches.map(([p]) => p))];
  const pristine = new Map();
  /* PER-ARM, UNIQUELY NAMED BY ARM **AND** PATH. Two snapshots of one file
     named from the path alone is how a driver silently overwrote its own. */
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
  /* NAME WHAT FELL, always. A count says an arm fired; only the names say it
     fired on what it was declared against, and the arms whose declarations were
     wrong in this driver's own header were caught exactly by reading these. */
  if (r.out) for (const line of r.out.split("\n").filter((l) => l.includes("FAIL  ")))
    console.log(`       ${line.trim().slice(6, 130)}`);

  /* RESTORE, THEN VERIFY BY BOTH INSTRUMENTS. `cmp` catches what a digest of
     the wrong snapshot cannot. */
  for (const [p, { snap, digest, bytes }] of pristine) {
    copyFileSync(snap, p);
    const back = sha(p);
    if (back !== digest) { console.log(`  !! ${arm.id}: ${p} did NOT restore (sha256 ${back.slice(0, 12)} != ${digest.slice(0, 12)})`); problems++; }
    try { execFileSync("cmp", ["-s", p, snap]); }
    catch { console.log(`  !! ${arm.id}: ${p} differs from its pristine copy by CONTENT, which the digest above did not see`); problems++; }
    if (readFileSync(p).length !== bytes) { console.log(`  !! ${arm.id}: ${p} restored at the wrong byte count`); problems++; }
    unlinkSync(snap);
    if (existsSync(snap)) { console.log(`  !! ${arm.id}: pristine copy ${snap} survived the run`); problems++; }
  }
}

console.log(`\n${problems === 0 ? "controls complete" : `controls complete WITH ${problems} PROBLEM(S) — read them, do not smooth them`}`);
process.exitCode = problems ? 1 : 0;
