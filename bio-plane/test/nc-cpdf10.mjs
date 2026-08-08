/* CPDF-10's NEGATIVE-CONTROL DRIVER. Deliberately NOT a `.test.mjs`: it EDITS
 * REAL SOURCES while it runs, and neither the battery nor the fleet walk must
 * discover it (PL-3/PL-4/PL-11/FL-2/CPDF-9's precedent).
 *
 * FIVE ARMS, EACH ARMED ALONE WITH THE OTHERS HELD OPEN. Each arm declares
 * BEFORE it runs what MUST fail and what MUST NOT, and the run prints both so a
 * surprise is a finding rather than something the driver smooths over.
 *
 * EVERY RESTORE IS VERIFIED BY sha256 AND BY BYTE COMPARISON against a
 * UNIQUELY-NAMED per-arm pristine copy, with the byte count printed and a
 * minimum guarded — because two harnesses in this repository once reported a
 * restore byte-identical OVER AN EMPTY MANIFEST, caught only because a digest
 * read e3b0c442, the sha256 of the empty string.
 *
 * A BASELINE ROW IS RUN FIRST. A harness whose first run reports the same thing
 * for every arm INCLUDING the baseline cannot tell six-arms-broken from
 * six-arms-working, and only the baseline row distinguishes them.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const SUITE = "test/textchain.test.mjs";
const sha = (b) => createHash("sha256").update(b).digest("hex");

function run() {
  try {
    const out = execFileSync("node", [SUITE], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return parse(out);
  } catch (e) {
    return parse((e.stdout || "") + (e.stderr || ""));
  }
}
function parse(out) {
  const m = /textchain: (\d+) passed, (\d+) failed/.exec(out);
  /* A MISSING TALLY IS -1, NEVER 0. A module that died before its foot has no
     count, and reporting that as zero failures is the exact way a TypeError
     inside an assertion reads as a clean run. */
  if (!m) return { pass: -1, fail: -1, foot: false };
  return { pass: Number(m[1]), fail: Number(m[2]), foot: !/NEVER REACHED ITS FOOT/.test(out) };
}

const ARMS = [
  { name: "a. the monotone rule (appendStep's rank comparison)",
    file: "src/textchain.mjs",
    from: `if (step.cap != null && have != null && rank(step.cap) != null && rank(step.cap) < rank(have))`,
    to:   `if (false)`,
    mustFail: "the RULE 2 arms — a stronger step is no longer refused",
    mustNotFail: "the chain-shape arms, the confidence arms, the attestation arms" },

  { name: "b. the floor DISCARDS the text (undeterminedRegion)",
    file: "src/textchain.mjs",
    from: `  const { text, confidence, ...rest } = region;\n  return { ...rest, text: null, undetermined: true, why, confidence: "none" };`,
    to:   `  const { confidence, ...rest } = region;\n  return { ...rest, undetermined: true, why, confidence: "none" };`,
    mustFail: "the RULE 4 discard arms, and the seam's below-floor arm",
    mustNotFail: "the anchor arms, the monotone arms, the attestation arms" },

  { name: "c. the pseudo-confidence fence (checkConfidence's basis test)",
    file: "src/textchain.mjs",
    from: `  if (!Object.prototype.hasOwnProperty.call(CONFIDENCE_BASES, confidence.basis))`,
    to:   `  if (false)`,
    mustFail: "the RULE 3 pseudo arms and the seam's self-reported arm",
    mustNotFail: "the monotone arms, the anchor arms, the attestation arms" },

  { name: "d. the machine-credential fence (checkAttestation's isMachineIdentity arm)",
    file: "src/textchain.mjs",
    from: `  if (isMachineIdentity(a.member))`,
    to:   `  if (false)`,
    mustFail: "the machine-stamp and class-stamp attestation arms",
    mustNotFail: "the extent arms, the chain arms, the confidence arms" },

  { name: "e. extentCovers defaults to COVERING instead of not covering",
    file: "src/textchain.mjs",
    from: `  if (!Object.prototype.hasOwnProperty.call(EXTENT_KINDS, extent.kind)) return false;`,
    to:   `  if (!Object.prototype.hasOwnProperty.call(EXTENT_KINDS, extent.kind)) return true;`,
    mustFail: "the scoping arms — an unknown extent kind now covers everything",
    mustNotFail: "the chain arms, the confidence arms, the machine-credential arm" },

  { name: "f. Tier 1 stops NAMING the image-only page (pdfstructure's marker)",
    file: "src/pdfstructure.mjs",
    from: `  if (!text.length && !undetermined.length && !fontDict && pageDrawsImage(doc, resources)) {`,
    to:   `  if (false) {`,
    mustFail: "EVERY Tier-3 arm — the scan is no longer routed at all, which is the state this item found the plane in",
    mustNotFail: "the pure textchain unit arms (they import no PDF)" },
];

console.log("CPDF-10 NEGATIVE CONTROLS — each arm ALONE, others held open\n");
const base = run();
console.log(`BASELINE            pass=${base.pass} fail=${base.fail} foot=${base.foot}`);
if (base.fail !== 0 || base.pass < 100) {
  console.log("REFUSING TO PROCEED: the baseline is not green, so no arm below would mean anything.");
  process.exit(2);
}

let surprises = 0;
for (const arm of ARMS) {
  const pristine = readFileSync(arm.file);
  const pristineSha = sha(pristine);
  /* GUARD THE MINIMUM. A pristine copy of nothing restores to nothing and
     compares equal for free. */
  if (pristine.length < 2000) {
    console.log(`  ${arm.name}: PRISTINE COPY TOO SMALL (${pristine.length} bytes) — refusing`);
    process.exit(3);
  }
  const src = pristine.toString("utf8");
  const hits = src.split(arm.from).length - 1;
  console.log(`\n${arm.name}`);
  console.log(`  pristine ${arm.file}: ${pristine.length} bytes, sha256 ${pristineSha.slice(0, 12)}…`);
  console.log(`  MUST FAIL:     ${arm.mustFail}`);
  console.log(`  MUST NOT FAIL: ${arm.mustNotFail}`);
  /* AN ARM THAT DID NOT ARM IS A FINDING, and it is printed as one rather than
     being allowed to look like a clean pass. */
  if (hits !== 1) {
    console.log(`  *** DID NOT ARM: the anchor matched ${hits} times (expected exactly 1). THIS IS A FINDING.`);
    surprises++;
    continue;
  }
  writeFileSync(arm.file, src.replace(arm.from, arm.to));
  const armed = run();
  writeFileSync(arm.file, pristine);
  const back = readFileSync(arm.file);
  const ok = sha(back) === pristineSha && Buffer.compare(back, pristine) === 0;
  console.log(`  ARMED  pass=${armed.pass} fail=${armed.fail} foot=${armed.foot}`);
  console.log(`  RESTORE verified: sha256 ${ok ? "MATCH" : "MISMATCH"} · cmp ${Buffer.compare(back, pristine) === 0 ? "IDENTICAL" : "DIFFERS"} · ${back.length} bytes`);
  if (!ok) { console.log("  *** RESTORE FAILED — stopping."); process.exit(4); }
  if (armed.fail <= 0) {
    console.log(`  *** SURPRISE: the arm did not make the suite fail (fail=${armed.fail}). RECORDED, NOT SMOOTHED.`);
    surprises++;
  }
  if (!armed.foot) {
    console.log(`  *** SURPRISE: the suite did not reach its FOOT under this arm — a death, not a failure.`);
    surprises++;
  }
}
console.log(`\nsurprises: ${surprises}`);
