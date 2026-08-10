/* VF-6's NEGATIVE CONTROL DRIVER — three arms, each armed ALONE with the other two
 * held OPEN, run against `test/accepts-without-reading.measure.mjs`.
 *
 * DELIBERATELY NOT A `.test.mjs`, on `d249-port.control.mjs` and `d266.control.mjs`'s
 * precedent: it drives a whole instrument three times over (minutes, not seconds) and
 * `scripts/battery.mjs` must not discover it. This item therefore adds NO suite, and
 * `classified` / `corpus` in the coverage register do not move. Run it directly:
 *
 *     cd bio-plane && node test/accepts-without-reading.control.mjs
 *
 * exit 0 = every arm behaved as declared.
 *
 * WHY THE ARMS ARE FLAGS AND NOT SOURCE EDITS, said rather than left to be noticed.
 * The subject under control here is the INSTRUMENT'S OWN HONESTY — the composition
 * that turns a census into a published sentence — and each arm makes that composition
 * really produce its defective output. The check that fires is the SAME function that
 * runs in the baseline, never a stub, and the instrument really exits non-zero. What
 * an arm does NOT do is edit `src/**`: this item is READ ONLY on the plane, so there
 * is no source to restore and no sha256 to verify, which is why this driver has no
 * restore discipline where `refselectivity.control.mjs` has one.
 *
 * THE GUARD THIS DRIVER CARRIES. Every run's output must contain the instrument's own
 * FOOT line (`accepts-without-reading: N pass, M fail`). A run that died halfway
 * prints a partial log that reads exactly like a clean one, and readingname.test.mjs
 * paid for that lesson already: arm (a) there reported 5 failures and hid 13, because
 * the suite threw and ended the module while nothing had failed. An arm that produces
 * NO FOOT LINE is reported as INCONCLUSIVE here, never as a pass and never as a fail.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const INSTRUMENT = fileURLToPath(new URL("./accepts-without-reading.measure.mjs", import.meta.url));
const FOOT = /^accepts-without-reading: (\d+) pass, (\d+) fail · answer (.+)$/m;

const run = (args) => {
  const r = spawnSync(process.execPath, [INSTRUMENT, ...args], { encoding: "utf8", timeout: 300000 });
  const out = `${r.stdout || ""}${r.stderr || ""}`;
  const m = FOOT.exec(out);
  return { code: r.status, out,
           foot: m ? { pass: Number(m[1]), fail: Number(m[2]), answer: m[3] } : null };
};

let bad = 0;
/* `detail` is the WHY-IT-MATTERS, and it prints only when the assertion did NOT hold.
   Printing it beside an OK reads as though the bad thing happened — the first run of
   this driver did exactly that ("OK … the failure gave no reason") and an operator
   scanning the log would have read five passes as five problems. */
const say = (ok, label, detail) => {
  if (!ok) bad++;
  console.log(`  ${ok ? "OK  " : "BAD "}  ${label}${!ok && detail ? `\n          ${detail}` : ""}`);
};

console.log("\n=== VF-6 · negative controls, each armed ALONE ===");

/* ------------------------------------------------------------------ BASELINE */
console.log("\n--- BASELINE (no arm) ---");
const base = run([]);
if (!base.foot) {
  console.log(base.out);
  console.error("BASELINE produced no FOOT line — INCONCLUSIVE, and nothing below can be read against it.");
  process.exit(2);
}
console.log(`  baseline: ${base.foot.pass} pass, ${base.foot.fail} fail · answer ${base.foot.answer} · exit ${base.code}`);
say(base.code === 0 && base.foot.fail === 0, "the instrument is GREEN unarmed", `exit ${base.code}, ${base.foot.fail} fail`);
say(base.foot.answer === "undetermined",
  "and its unarmed answer is the WORD 'undetermined', not a number",
  `answer was ${base.foot.answer}`);

/* ----------------------------------------------- ARM 1 · proxy-as-quantity */
/* THE ARM THIS ITEM EXISTS FOR. State the proxy AS the quantity — "members accept
   without reading N% of the time" — with the proxy unnamed and its blind spot
   dropped. The instrument's own honesty assertion must FAIL, and it must fail NAMING
   the proxy that was silently substituted: a caveat that does not travel with the
   number leaves a number that is worse than nothing. */
console.log("\n--- ARM 1 · proxy-as-quantity (the arm this item exists for) ---");
const a1 = run(["--arm=proxy-as-quantity"]);
if (!a1.foot) { console.log(a1.out); say(false, "ARM 1 produced no FOOT line — INCONCLUSIVE", ""); }
else {
  console.log(`  armed: ${a1.foot.pass} pass, ${a1.foot.fail} fail · exit ${a1.code}`);
  say(a1.code !== 0 && a1.foot.fail > 0, "the instrument FAILS when the proxy is stated as the quantity",
    `exit ${a1.code}, ${a1.foot.fail} fail — a green run here would mean the honesty check is decorative`);
  say(/HONESTY/.test(a1.out) && /FAIL {2}HONESTY/.test(a1.out),
    "and it is the HONESTY assertion that fires, not some unrelated check",
    "no FAIL on the HONESTY line");
  say(/NO PROXY NAMED/.test(a1.out) && /time-to-accept/.test(a1.out.split("--- THE ANSWER")[1] || ""),
    "and the failure NAMES the proxy that was silently substituted",
    "the failure did not name the proxy — a control that fails without saying WHAT was traded teaches nothing");
  say(/WHAT THIS MISSES/.test(a1.out.split("--- THE ANSWER")[1] || "") === false
      || /NO 'WHAT THIS MISSES' clause/.test(a1.out),
    "and the dropped caveat is reported as its own defect, separately from the unnamed proxy",
    "the missing-caveat problem was not raised");
  say(base.foot.answer === "undetermined" && /Members accept without reading/.test(a1.out),
    "AND THE SENTENCE THE ARM COMPOSES IS THE OVERCLAIM VERBATIM — DEC-53's own words turned into a claim",
    "the arm did not compose the overclaiming sentence, so it controlled nothing");
  /* A FINDING THIS ARM PRODUCED THAT THE AUTHOR DID NOT PREDICT, recorded rather than
     smoothed: this arm fails TWO checks, not one. `sentence()` is the single
     composition point for BOTH the undetermined path and the rate path, so arming
     proxy-as-quantity also makes the RATE path compose a sentence its own honesty
     check rejects — which `vacuity()` notices, because it composes the rate sentence
     and re-runs `honesty()` on it. The cascade is CORRECT and is the stronger result:
     the overclaim is caught on the path the instrument would publish today AND on the
     path it would publish the day a signal exists. Reporting "1 fail" here would have
     been an under-count of what the control actually saw. */
  say(/vacuity {2}the RATE path composes a sentence its own honesty check rejects/.test(a1.out)
      && a1.foot.fail === 2,
    "and it CASCADES into the vacuity check — the overclaim is caught on the rate path too, so this arm fails TWO checks",
    `expected 2 fails with a vacuity cascade, saw ${a1.foot.fail}`);
}

/* ------------------------------------------------- ARM 2 · absence-as-zero */
/* Feed the instrument the fixture where NO read/unread signal exists at all — which is
   the BASELINE fixture, because that is what this record is — and report the absence
   as `0%`. The absence assertion must FAIL: an absent signal and a measured zero are
   different facts and must not read alike. */
console.log("\n--- ARM 2 · absence-as-zero ---");
const a2 = run(["--arm=absence-as-zero"]);
if (!a2.foot) { console.log(a2.out); say(false, "ARM 2 produced no FOOT line — INCONCLUSIVE", ""); }
else {
  console.log(`  armed: ${a2.foot.pass} pass, ${a2.foot.fail} fail · exit ${a2.code} · answer ${a2.foot.answer}`);
  say(a2.code !== 0 && a2.foot.fail > 0, "the instrument FAILS when an absent signal is published as a measured zero",
    `exit ${a2.code}, ${a2.foot.fail} fail`);
  say(/FAIL {2}ABSENCE/.test(a2.out), "and it is the ABSENCE assertion that fires", "no FAIL on the ABSENCE line");
  say(a2.foot.answer === "0%", "the arm really did publish '0%' — the defect was produced, not simulated",
    `answer was ${a2.foot.answer}`);
  say(/different facts about the world/.test(a2.out),
    "and the failure says WHY the two must not read alike", "the failure gave no reason");
  /* The census itself must be unchanged by this arm: the arm is about PUBLICATION, and
     an arm that also moved the measurement would not isolate the defect it names. */
  say(/P1  ABSENT/.test(a2.out) && /P4  ABSENT/.test(a2.out),
    "and the census still reads ABSENT — the arm changed the PUBLICATION, not the measurement",
    "the arm moved the census too, so it isolates nothing");
}

/* ------------------------------------------------------- ARM 3 · vacuity */
/* OVER-STRICTNESS. Hardwire the answer to `undetermined` regardless of the census. An
   instrument that answers `undetermined` whatever it is fed has measured nothing, and
   its `undetermined` is worth as little as a fabricated rate. This arm is what makes
   the baseline's `undetermined` a READING rather than the only sentence this file can
   produce — the CLAUDE.md rule that a suite which does not fail when you break its
   subject is not a suite, pointed at an instrument whose result is an absence. */
console.log("\n--- ARM 3 · vacuity (over-strictness) ---");
const a3 = run(["--arm=vacuity"]);
if (!a3.foot) { console.log(a3.out); say(false, "ARM 3 produced no FOOT line — INCONCLUSIVE", ""); }
else {
  console.log(`  armed: ${a3.foot.pass} pass, ${a3.foot.fail} fail · exit ${a3.code}`);
  say(a3.code !== 0 && a3.foot.fail > 0,
    "the instrument FAILS when its answer stops being read off the census",
    `exit ${a3.code}, ${a3.foot.fail} fail — a green run here would mean the baseline's 'undetermined' proves nothing`);
  say(/FAIL {2}VACUITY/.test(a3.out), "and it is the VACUITY assertion that fires", "no FAIL on the VACUITY line");
  say(/has measured nothing/.test(a3.out),
    "and the failure states the cost: an instrument that always answers 'undetermined' has measured nothing",
    "the failure gave no reason");
  say(a3.foot.answer === "undetermined" && base.foot.answer === "undetermined",
    "AND THE ARMED ANSWER IS INDISTINGUISHABLE FROM THE BASELINE'S — which is exactly why this arm had to exist: "
    + "the ANSWER cannot tell a measured undetermined from a hardwired one, and only this control can",
    `armed ${a3.foot.answer} vs baseline ${base.foot.answer}`);
}

/* -------------------------------------------------------------- one more guard */
/* Each arm was armed ALONE. Stated as a fact about this file rather than a promise:
   every `run()` above passes exactly one `--arm=`, and the instrument REFUSES an
   unknown arm name (exit 2), so a typo cannot silently produce a baseline run
   masquerading as an armed one. */
console.log("\n--- the guard on the arms themselves ---");
const typo = run(["--arm=nosuchthing"]);
say(typo.code === 2 && !typo.foot,
  "an unknown arm name is REFUSED (exit 2) rather than ignored — a typo cannot produce a baseline run wearing an arm's name",
  `exit ${typo.code}`);

console.log(`\naccepts-without-reading.control: ${bad === 0 ? "every arm behaved as declared" : `${bad} arm assertion(s) did NOT behave as declared`}`);
process.exit(bad === 0 ? 0 : 1);
