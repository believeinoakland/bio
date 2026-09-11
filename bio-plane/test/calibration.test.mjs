/* CPDF-13 — THE CALIBRATION CONSTRUCT, ITS CHAIN REFERENCE, AND THE SCHEDULED
 * RE-PROBE (D-183, D-253).
 *
 * WHAT THIS SUITE PROVES AND WHAT IT CANNOT, said first because the honest
 * boundary is the deliverable:
 *
 *   IT PROVES the construct end to end THROUGH THE OPS — a calibration that
 *   cannot be recorded without a probe run behind it, a transcription whose
 *   chain NAMES the measurement its grade rests on, a second calibration
 *   measuring WORSE raising a re-evaluation obligation that names exactly the
 *   transcriptions bound to the superseded one and moves NO grade, a
 *   calibration measuring BETTER raising nothing at all, an announcement that
 *   can only ever SHORTEN the interval to the next probe, and the eleventh
 *   REC-1 alarm consumer registering, firing at its own cadence and
 *   self-terminating.
 *
 *   IT MEASURES NO ENGINE AND PROVES NO FIDELITY. There is no derivation engine
 *   in this repository — CPDF-11 returned NO-GO on Moondream (DEC-42) and the
 *   tesseract fleet member is CPDF-12's. Every calibration below is a SYNTHETIC
 *   measurement handed to the construct, which is evidence about THE
 *   CONSTRUCT AND ITS RULES and not about any engine's accuracy. A green here
 *   is not a calibrated engine and is named that way at every arm so no later
 *   reader reads it as one. The floor a real engine is scored against stays
 *   CPDF-9's (99.96% char, 90/90 digits, zero minted) and lives in
 *   MEASUREMENTS.md.
 *
 *   AND IT CANNOT SEE WHETHER THE CADENCE IS RIGHT. Thirty days is a CHOSEN
 *   constant, not a measured one: nobody has measured how fast a derivation
 *   engine drifts, and this suite proves only that the number is declared in
 *   one place, is what the consumer uses, and is what the surface reports.
 *   A measurement of real drift would move it, and that is stated in
 *   `calibration.mjs` rather than hidden behind a green test.
 *
 * EVERY ARM IS DRIVEN THROUGH AN OP, NEVER ASSERTED AT THE STORE, except the
 * pure-function arms of `calibration.mjs` which are marked as such. `op=invitelook`
 * shipped with a ReferenceError while 1,276 assertions passed, and a store-level
 * test is not evidence a caller can reach the feature.
 *
 * THE TWO NEGATIVE CONTROLS THE ITEM NAMES ARE BOTH ARMED BY ADDING CODE, NOT
 * BY REMOVING IT, and that is a finding about the design worth stating before
 * the arms: there is no guard to delete that would make the drift handler
 * re-grade, because the handler writes nothing at all — an arm has to INSERT the
 * write. Likewise nothing consults a signal when computing a cap, so making a
 * changelog mark a calibration current means ADDING a path from
 * `calibration_signals` into `calibrations`. An arm that must build a defect to
 * expose one says more about the shape than an arm that unplugs a fence.
 *
 * NEGATIVE CONTROL: RUN IT WITH `node test/calibration.control.mjs [arm]` — the driver is COMMITTED beside this suite, it arms each arm ALONE with every other defence held open, it DECLARES before each what MUST and MUST NOT fail, and it verifies every restore by sha256 AND by `cmp` against a UNIQUELY-NAMED per-arm pristine copy taken INSIDE THIS WORKTREE (never a shared scratchpad: PL-10's harness was overwritten mid-turn by a concurrent worker, and UI-38 met an NC harness reporting a byte-identical restore over a file it had not restored), with a byte count printed and a 1,000-byte minimum guarded. FOUR ARMS plus a BASELINE, ALL RUN 2026-09-10 against a BASELINE row of 110 pass / 0 fail / foot REACHED, and the tree measured back at 110/0 afterwards. (a) `regrade` — THE ITEM'S NC (1): make the drift handler re-grade, by INSERTING an `UPDATE reading_text_source SET derivation_cap` for every obligation it raised -> MEASURED 109/1, the ONE failure being "NO MACHINE MINTS A GRADE (DEC-4)" and the obligation arms all still green, which is the point: naming the work and doing it are separable and this suite pins the second. (b) `changelog` — THE ITEM'S NC (2): let a changelog signal alone mark a calibration current with no probe run, by INSERTING the mint a well-meaning author would write (carry the last cap forward under the announced version) -> MEASURED 108/2, both failures the "A CLAIM IS NOT A MEASUREMENT" arms, while the separate fence that refuses a signal CARRYING a fidelity stayed green. (c) `delay` — rule 4's direction: let a signal push a probe OUT. (d) `overstrict` — THE OVER-STRICTNESS ARM: refuse fields the construct does not recognise, a fence tighter than its rule -> MEASURED 109/1, exactly the over-strictness assertion, with every real refusal still refusing. **BOTH NC ARMS THE ITEM NAMES ARE ARMED BY ADDING CODE RATHER THAN REMOVING IT, and that is a finding about the design rather than a quirk of the harness: the drift handler writes nothing at all, so there is no guard to delete — a defect has to be BUILT.** **TWO ARMS CAME BACK OTHER THAN DECLARED ON THEIR FIRST RUN AND BOTH FOUND THE INSTRUMENT WRONG, NOT THE SUBJECT, and both are kept rather than smoothed.** (c) FIRST PATCHED ONLY the loop's `<` comparison and measured 110/0 — NOTHING FAILED — because rule 4 is enforced TWICE, by that comparison and again by the closing `Math.min(at, cadenceAt)`, so either guard alone makes the other unfalsifiable through the function and arming one PASSES FOR FREE. Armed TOGETHER (the textchain.test.mjs D-252 precedent) it MEASURED 106/4: the three interval arms plus, unexpectedly, "the calibration consumer fires on the alarm" — because a signal that can push a probe out pushes it past the alarm instant and the consumer stops being due, which is the defect's real downstream reach and is worth more than the three arms that were aimed at it. Its needles were ALSO mis-spelled from memory on that run ("cannot push it out" against a label reading "cannot push the interval out"), scoring the arm NOT-AS-DECLARED by the harness's own typo. (d) FIRST tightened the SHARED `present` predicate to require an object — and `probe_id` is a STRING riding that same predicate, so every valid calibration was refused, the suite DIED downstream and the driver reported `-1 pass / -1 fail / foot false`. **That -1 is the whole reason a missing tally is never reported as 0**: a harness trusting a count would have read a beautiful zero-failure run off a module that never reached its own foot. Narrowed, re-run, as declared.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  checkCalibration, checkSignal, compare, drifted, driftObligations, nextProbeDue,
  cadenceSentence, DRIFT, CALIBRATION_CADENCE_MS,
} from "../src/calibration.mjs";
import { calibrationsOf } from "../src/textchain.mjs";
import { CALIBRATION_CHECKS } from "../checks/bio-checks.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

let pass = 0, fail = 0, reachedFoot = false;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) { console.log(`         want ${JSON.stringify(want)}`);
             console.log(`         got  ${JSON.stringify(got)}`); }
};

/* A MEASUREMENT THE CONSTRUCT WILL ACCEPT. Synthetic — see the header. The
   probe inputs and scores are real objects rather than placeholder strings
   because the rule under test is that they must be THERE and must be stored,
   and a test that passed an empty object would be testing a weaker rule. */
const probeInputs = (n) => ({ corpus: "cpdf13-synthetic", pages: n,
                              ground_truth_sha: "0".repeat(64) });
const scores = (cer) => ({ char_error_rate: cer, minted_digits: 0, pages_scored: 4 });
const cal = (over = {}) => ({
  engine: "pdfjs", version: "4.2.67", at: "2026-09-01T00:00:00Z", cap: "C",
  probe_id: "cpdf13-fidelity-v1", probe_inputs: probeInputs(4), scores: scores(0.02),
  measured_by: "test/calibration.test.mjs (synthetic — measures no engine)", ...over,
});

/* ===================================================================== *
 * PART 1 — THE CONSTRUCT, as pure functions. Marked as NOT driven through an
 * op, because the ops in part 2 are what prove a caller can reach any of it.
 * ===================================================================== */
console.log("\n--- RULE 1: A CALIBRATION IS A MEASUREMENT, NEVER A CLAIM (pure) ---");
t("a well-formed calibration passes", checkCalibration(cal()), null);
t("one that names no engine is refused by name", checkCalibration(cal({ engine: "" }))?.code,
  "CAL_UNNAMED");
t("and one that names no VERSION is refused identically — a service retrains under one name",
  checkCalibration(cal({ version: "" }))?.code, "CAL_UNNAMED");
t("an undated measurement is refused: a fidelity letter is a fact about an engine AT A DATE",
  checkCalibration(cal({ at: "" }))?.code, "CAL_UNDATED");
t("NO PROBE ID -> refused, and the refusal names the rule rather than the field",
  [checkCalibration(cal({ probe_id: "" }))?.code,
   /A MEASUREMENT, NEVER A CLAIM/.test(checkCalibration(cal({ probe_id: "" })).detail)],
  ["CAL_NO_PROBE", true]);
t("NO PROBE INPUTS -> refused: two runs over different corpora are two measurements in one name",
  checkCalibration(cal({ probe_inputs: {} }))?.code, "CAL_NO_PROBE");
t("NO SCORES -> refused: the letter is stored so a later reader can DISAGREE with it",
  checkCalibration(cal({ scores: null }))?.code, "CAL_NO_PROBE");
t("an unattributed measurement is refused too", checkCalibration(cal({ measured_by: "" }))?.code,
  "CAL_NO_PROBE");
t("a cap outside BASIS_GRADES is refused — a calibration invents no scale of its own",
  checkCalibration(cal({ cap: "excellent" }))?.code, "CAL_SHAPE");
/* THE ONE THAT LOOKS LIKE A GAP AND IS NOT. */
t("cap: null is LEGAL — a probe that ran and found the fidelity undetermined MEASURED that, dated",
  checkCalibration(cal({ cap: null })), null);
/* OVER-STRICTNESS: a correct measurement in a spelling this item did not write. */
t("OVER-STRICTNESS: probe inputs and scores given as JSON STRINGS are accepted",
  checkCalibration(cal({ probe_inputs: '{"corpus":"x"}', scores: '{"cer":0.01}' })), null);
t("OVER-STRICTNESS: extra fields the construct does not know are not refused",
  checkCalibration(cal({ dpi: 300, operator_note: "ran twice" })), null);

console.log("\n--- RULE 2: THE ASYMMETRY (pure) ---");
const c1 = { ...cal(), calibration_id: "CAL-1", cap: "C" };
const worse = { ...cal({ at: "2026-10-01T00:00:00Z", cap: "D" }), calibration_id: "CAL-2" };
const better = { ...cal({ at: "2026-10-01T00:00:00Z", cap: "B" }), calibration_id: "CAL-3" };
t("the FIRST calibration drifts from nothing", compare(c1, null), DRIFT.SAME);
t("a weaker letter is WORSE", compare(worse, c1), DRIFT.WORSE);
t("a stronger letter is BETTER", compare(better, c1), DRIFT.BETTER);
t("the same letter is SAME", compare({ ...c1, calibration_id: "CAL-4" }, c1), DRIFT.SAME);
t("LOSING a bound (letter -> undetermined) is WORSE, not 'one weaker'",
  compare({ ...cal({ cap: null }), calibration_id: "CAL-5" }, c1), DRIFT.WORSE);
t("GAINING one (undetermined -> letter) is BETTER",
  compare(c1, { ...cal({ cap: null }), calibration_id: "CAL-0" }), DRIFT.BETTER);
t("two undetermineds are SAME — an engine nobody can measure raises nothing every month",
  compare({ ...cal({ cap: null }), calibration_id: "CAL-6" },
          { ...cal({ cap: null }), calibration_id: "CAL-0" }), DRIFT.SAME);
t("a DIFFERENT engine is INCOMPARABLE — an accidental cross-engine compare would name the wrong text",
  compare({ ...cal({ engine: "tesseract" }), calibration_id: "CAL-7" }, c1), DRIFT.INCOMPARABLE);
t("and a malformed one is INCOMPARABLE rather than assumed worse",
  compare({ ...cal({ probe_id: "" }), calibration_id: "CAL-8" }, c1), DRIFT.INCOMPARABLE);

console.log("\n--- WHAT EACH VERDICT MAY CAUSE, AND `regrades` IS FALSE ON EVERY BRANCH ---");
t("WORSE raises an obligation and re-grades NOTHING",
  [drifted(DRIFT.WORSE).raises_obligation, drifted(DRIFT.WORSE).regrades], [true, false]);
t("BETTER raises NOTHING — a grade rises only by an authored act (DEC-4)",
  [drifted(DRIFT.BETTER).raises_obligation, drifted(DRIFT.BETTER).regrades], [false, false]);
t("SAME raises nothing", [drifted(DRIFT.SAME).raises_obligation, drifted(DRIFT.SAME).regrades],
  [false, false]);
t("INCOMPARABLE raises nothing",
  [drifted(DRIFT.INCOMPARABLE).raises_obligation, drifted(DRIFT.INCOMPARABLE).regrades],
  [false, false]);
/* THE TOTALITY ARM. Not four hand-listed branches: every verdict the construct
   can produce, walked, so a FIFTH verdict added later cannot quietly arrive with
   `regrades: true`. */
t("TOTALITY: no verdict the construct can produce re-grades anything",
  Object.values(DRIFT).filter((v) => drifted(v).regrades !== false), []);
t("TOTALITY: exactly ONE verdict raises an obligation, and it is WORSE",
  Object.values(DRIFT).filter((v) => drifted(v).raises_obligation), [DRIFT.WORSE]);

console.log("\n--- RULE 3: THE OBLIGATION NAMES EXACTLY THE AFFECTED, AND NOTHING ELSE (pure) ---");
const sups = [
  { superseded: c1, current: worse, verdict: DRIFT.WORSE },
  { superseded: { ...c1, calibration_id: "CAL-10", engine: "other" },
    current: { ...better, engine: "other", calibration_id: "CAL-11" }, verdict: DRIFT.BETTER },
];
const bound = [
  { id: "sha-a", calibration_id: "CAL-1" },     /* bound to the SUPERSEDED-BY-WORSE one */
  { id: "sha-b", calibration_id: "CAL-10" },    /* bound to a BETTER-superseded one */
  { id: "sha-c", calibration_id: "CAL-99" },    /* bound to one nothing superseded */
  { id: "sha-d", calibration_id: null },        /* bound to NO calibration at all */
];
const obs = driftObligations(sups, bound);
t("exactly the transcription bound to the WORSE-superseded calibration is named",
  obs.map((o) => o.id), ["sha-a"]);
t("and it carries BOTH caps side by side, so a member can weigh it without a second lookup",
  [obs[0].cap_when_graded, obs[0].cap_now_measured], ["C", "D"]);
t("and it says, in the row itself, that nothing was re-graded", obs[0].regraded, false);
t("it reuses REC-17's triple rather than minting a second vocabulary",
  [obs[0].reeval.flag, obs[0].reeval.source], [true, "calibration"]);
t("ABSENCE ARM: a BETTER supersession names nobody",
  obs.filter((o) => o.id === "sha-b").length, 0);
t("ABSENCE ARM: a calibration nothing superseded names nobody",
  obs.filter((o) => o.id === "sha-c").length, 0);
t("ABSENCE ARM: text resting on NO calibration is not swept in by naming the same engine",
  obs.filter((o) => o.id === "sha-d").length, 0);
t("THE EMPTY CORPUS IS NOT A PASS: with no supersessions the answer is empty for the right reason",
  [driftObligations([], bound).length, bound.length], [0, 4]);

console.log("\n--- RULE 4: AN ANNOUNCEMENT MAY ONLY SHORTEN THE INTERVAL (pure) ---");
const LAST = 1_000_000_000_000;
const cadence = nextProbeDue({ lastAt: LAST });
t("with no signal the next probe is exactly one cadence out",
  cadence.at - LAST, CALIBRATION_CADENCE_MS);
t("and the cadence is the DECLARED constant, read from one place", cadence.from, "cadence");
t("a signal asking EARLIER pulls it in",
  nextProbeDue({ lastAt: LAST, signals: [{ probe_by: LAST + 1000 }] }).at, LAST + 1000);
/* THE ARM THE WHOLE CLAUSE EXISTS FOR. */
t("A SIGNAL ASKING LATER CANNOT PUSH IT OUT — there is no arithmetic that returns a later instant",
  nextProbeDue({ lastAt: LAST, signals: [{ probe_by: LAST + CALIBRATION_CADENCE_MS * 10 }] }).at,
  LAST + CALIBRATION_CADENCE_MS);
t("and neither can a hundred of them",
  nextProbeDue({ lastAt: LAST,
    signals: Array.from({ length: 100 }, () => ({ probe_by: LAST + 1e12 })) }).at,
  LAST + CALIBRATION_CADENCE_MS);
t("a NEVER-PROBED engine is due IMMEDIATELY, not a cadence from a measurement that does not exist",
  [nextProbeDue({ lastAt: null }).at, nextProbeDue({ lastAt: null }).from], [0, "never-probed"]);
t("a signal carrying a CAP is refused — it is trying to be a calibration",
  checkSignal({ engine: "pdfjs", source: "vendor changelog", cap: "B" })?.code,
  "CAL_SIGNAL_CLAIMS_MEASUREMENT");
t("a signal carrying SCORES is refused identically",
  checkSignal({ engine: "pdfjs", source: "vendor changelog", scores: { cer: 0.001 } })?.code,
  "CAL_SIGNAL_CLAIMS_MEASUREMENT");
t("a signal naming no source is refused — it is somebody else's claim and is kept attributed",
  checkSignal({ engine: "pdfjs" })?.code, "CAL_SIGNAL_SHAPE");
t("OVER-STRICTNESS: a plain, honest announcement passes",
  checkSignal({ engine: "pdfjs", source: "github.com/mozilla/pdf.js releases",
                detail: "4.3.0 released" }), null);
t("the cadence sentence is composed FROM the constant and cannot drift from it",
  cadenceSentence(), `one probe per calibratable engine every ${
    CALIBRATION_CADENCE_MS / 86_400_000} day(s), on this instance's own account`);

console.log("\n--- DEC-49: EVERY REFUSAL CARRIES A CODE AND A CANNED TRANSLATION ---");
const CODES_USED = ["CAL_SHAPE", "CAL_UNNAMED", "CAL_UNDATED", "CAL_NO_PROBE",
                    "CAL_SIGNAL_SHAPE", "CAL_SIGNAL_CLAIMS_MEASUREMENT", "CAL_CANNOT_REGRADE"];
t("every code the construct can mint has a row", CODES_USED.filter((c) => !CALIBRATION_CHECKS[c]), []);
t("the family is exactly those codes — no orphan rows",
  Object.keys(CALIBRATION_CHECKS).sort(), [...CODES_USED].sort());
t("every row carries a C-42 number",
  Object.values(CALIBRATION_CHECKS).filter((r) => !/^C-42\.\d+$/.test(r.check)).length, 0);
t("every row carries a member-facing translation",
  Object.values(CALIBRATION_CHECKS).filter((r) => typeof r.translation !== "string"
                                                || r.translation.length < 40).length, 0);
t("every row names the SMALLEST SPAN — a REGION, never a whole file",
  Object.values(CALIBRATION_CHECKS).filter((r) => !/ > is-calibration-/.test(r.where)).length, 0);
/* EACH C-NUMBER READ OFF A REFUSAL THE CODE PATH PRODUCED, never off the table
   beside it — a hand copy of a catalogue agrees with the catalogue for free. */
const CHECK_ARMS = [
  ["C-42.1", () => checkCalibration(cal({ cap: "excellent" }))],
  ["C-42.2", () => checkCalibration(cal({ engine: "" }))],
  ["C-42.3", () => checkCalibration(cal({ at: "" }))],
  ["C-42.4", () => checkCalibration(cal({ probe_id: "" }))],
  ["C-42.5", () => checkSignal({ engine: "" })],
  ["C-42.6", () => checkSignal({ engine: "pdfjs", source: "a blog", cap: "A" })],
];
for (const [number, drive] of CHECK_ARMS) {
  const r = drive();
  t(`${number} is carried by the refusal the code path produced, not read off the table`,
    [r?.check, typeof r?.translation === "string" && r.translation.length > 40], [number, true]);
}
/* C-42.7 is the STORE's and is driven through the op in part 2 — named here so
   the reach arm below can see that every row was driven somewhere. */
let sawRegradeRefusal = null;

/* ===================================================================== *
 * PART 2 — THROUGH THE OPS. Everything above is a pure function; nothing above
 * is evidence that a caller can reach any of it.
 * ===================================================================== */
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cal", MEMBER_TOKEN: "mem-cal", PROBE_TOKEN: "prb-cal",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
});
/* THE CONTROL PLANE WRAPS A STORE ANSWER IN `result`, and the unwrap is written
   as `?? raw` rather than as `.result` so a refusal the control plane itself
   composed — an admission-gate refusal, which is NOT wrapped — still arrives
   whole instead of as `undefined`. A helper that silently returned undefined for
   the un-wrapped shape would turn every gate refusal into a passing assertion
   about nothing. */
const raw = async (q, init) => (await (await mf.dispatchFetch(`http://x/api/?${q}`, init)).json());
const api = async (q, init) => { const r = await raw(q, init); return r && r.result ? r.result : r; };
const post = (q, body) => api(q, { method: "POST", body: JSON.stringify(body) });

/* PLANT A TRANSCRIPTION THE WAY ONE REALLY ARRIVES: `op=promote` with a
   `data/provenance.json` carrying a document whose reading holds the chain.
   `#writeReadings` reads it and `#writeTextSource` projects it, so the
   `calibrations` column this item's join depends on is computed by the plane
   rather than written by the test. A test that INSERTed the row would prove the
   query and nothing about the projection that feeds it. */
const NOW = "2026-09-01T00:00:00Z";
const bundleMd = (id) => [
  "---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Calibration ${id}"`, "current_state: collected", "prior_state: null",
  `created: ${NOW}`, `last_updated: ${NOW}`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null",
  "  source: null", "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none", "---", "",
  "## Summary", "", "Calibration bundle.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", "",
].join("\n");
const sha256 = (v) => createHash("sha256").update(v).digest("hex");
let snapSeq = 0;
const promoteReading = async (id, captureSha, chain) => {
  const md = bundleMd(id);
  const prov = JSON.stringify({ documents: [{
    capture: { sha256: captureSha, bytes: 1024, retrieved: NOW },
    reading: { content_type: "agenda", reader_version: 1, read_from_text: true,
               found: false, entities: [], facts: {}, at: NOW,
               text_source: chain, text_tier: 3, text_container: "pdf",
               basis: "planted by test/calibration.test.mjs" } }] });
  const r = await post(`op=promote&token=mem-cal`, {
    bundleId: id, base: null,
    snapKey: `20260901T0100${String(++snapSeq).padStart(2, "0")}Z_aaaa1111`, author: "cpdf13",
    meta: { object_type: "information", group: "believe-in-oakland", title: `Calibration ${id}`,
            current_state: "collected", created: NOW, last_updated: NOW },
    files: [
      { path: "bundle.md", text: md, bytes: md.length, sha256: sha256(md) },
      { path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha256(prov) },
    ],
    register: [],
  });
  return r;
};

console.log("\n--- THROUGH THE OP: REGISTERING A SUBJECT IS NOT MEASURING IT ---");
const reg = await post("op=calibrationsubject&token=mem-cal",
  { engine: "pdfjs", version: "4.2.67", probe_id: "cpdf13-fidelity-v1" });
t("op=calibrationsubject registers an engine this instance can probe", reg.ok, true);
t("and says plainly that registering is not measuring", reg.measured, false);
t("a never-probed subject is due IMMEDIATELY — the Tier-2 pdf.js case exactly",
  reg.next_probe.from, "never-probed");
t("the surface reports the DECLARED cadence, the same constant the consumer uses",
  reg.cadence_ms, CALIBRATION_CADENCE_MS);
const regBad = await post("op=calibrationsubject&token=mem-cal", { engine: "pdfjs" });
t("a subject with no PROBE named is refused — a promise to measure by unstated means",
  regBad.reason, "CAL_NO_PROBE");

console.log("\n--- THROUGH THE OP: A CALIBRATION IS A MEASUREMENT, NEVER A CLAIM ---");
const noProbe = await post("op=calibrate&token=mem-cal",
  { engine: "pdfjs", version: "4.2.67", at: "2026-09-01T00:00:00Z", cap: "C",
    measured_by: "the vendor's release notes say it got better" });
t("op=calibrate REFUSES a calibration with no probe run behind it", noProbe.reason, "CAL_NO_PROBE");
t("and the refusal carries the C-number and the canned translation a member reads",
  [noProbe.check, typeof noProbe.translation === "string" && noProbe.translation.length > 40],
  ["C-42.4", true]);
const first = await post("op=calibrate&token=mem-cal", cal());
t("a real measurement is recorded and gets an id", /^CAL-\d+$/.test(first.calibration_id || ""), true);
t("the FIRST one supersedes nothing and raises nothing",
  [first.supersedes, first.obligations_raised, first.drift.verdict],
  [null, 0, DRIFT.SAME]);
const listed = await api("op=calibrations&token=mem-cal&engine=pdfjs");
t("op=calibrations reads it back", listed.count, 1);
t("AND THE PROBE INPUTS AND SCORES ARE STORED WITH IT — the item's clause (a)",
  [listed.calibrations[0].probe_inputs.corpus, listed.calibrations[0].scores.char_error_rate],
  ["cpdf13-synthetic", 0.02]);
t("the subject's next probe is now a CADENCE out rather than immediate",
  listed.subjects[0].next_probe.from, "cadence");

console.log("\n--- CLAUSE (b): A TRANSCRIPTION NAMES THE MEASUREMENT ITS GRADE RESTS ON ---");
/* The chain is composed by index.mjs's `ocrTextFromMember`, which is exercised
   end to end against a stub OCR member in textchain.test.mjs. HERE the binding
   is driven at the shape level — the chain carries the reference, the reader
   finds it, and the projection joins on it — and the acquire-path wiring is
   asserted STRUCTURALLY below rather than claimed. */
const boundChain = [
  { step: "pixels", cap: "C", measured_by: "MEASUREMENTS.md", calibration: first.calibration_id },
  { step: "ocr", engine: "pdfjs", version: "4.2.67", cap: "C",
    measured_by: "MEASUREMENTS.md", calibration: first.calibration_id },
];
t("the chain NAMES its calibration, once, deduped across the steps that share it",
  calibrationsOf(boundChain), [first.calibration_id]);
const idxSrc = readFileSync(SRC, "utf8");
t("STRUCTURAL: the acquire path joins the member's engine+version to a LIVE calibration",
  /superseded_by == null/.test(idxSrc) && /calibration: calRef/.test(idxSrc), true);
t("STRUCTURAL: and it fails open to NULL rather than to the nearest available number",
  /let calRef = null;/.test(idxSrc), true);

console.log("\n--- CLAUSE (d): A WORSE CALIBRATION RAISES AN OBLIGATION AND RE-GRADES NOTHING ---");
/* THE TRANSCRIPTIONS ARE PLANTED THROUGH `op=promote`, which is the REAL path a
   reading reaches the store by: `#writeReadings` reads `data/provenance.json`
   and `#writeTextSource` projects the chain. Nothing here reaches into a table.
   THREE documents, and the two that must NOT be named matter as much as the one
   that must:
     BOUND   — its chain names CAL-1, the calibration about to be superseded.
     UNBOUND — the SAME engine, the same cap, and NO calibration reference. It is
               the pre-CPDF-13 shape and it must not be swept in for sharing an
               engine name, because it never rested on the measurement.
     OTHER   — bound to a calibration of a different engine entirely. */
const BOUND_SHA = "b".repeat(64), UNBOUND_SHA = "c".repeat(64), OTHER_SHA = "d".repeat(64);
await promoteReading("INFO-2026-0001-cal", BOUND_SHA, [
  { step: "pixels", cap: "C", measured_by: "MEASUREMENTS.md", calibration: first.calibration_id },
  { step: "ocr", engine: "pdfjs", version: "4.2.67", cap: "C",
    measured_by: "MEASUREMENTS.md", calibration: first.calibration_id }]);
await promoteReading("INFO-2026-0002-cal", UNBOUND_SHA, [
  { step: "pixels", cap: "C", measured_by: "MEASUREMENTS.md 2026-08-03" },
  { step: "ocr", engine: "pdfjs", version: "4.2.67", cap: "C",
    measured_by: "MEASUREMENTS.md 2026-08-03" }]);
await promoteReading("INFO-2026-0003-cal", OTHER_SHA, [
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C", calibration: "CAL-999" }]);
const planted = await api("op=textprovenance&token=mem-cal");
t("THE CORPUS IS NON-EMPTY AND IS PRINTED: three transcriptions planted through op=promote",
  planted.documents.length >= 3, true);
console.log(`    planted corpus: ${planted.documents.map((d) => d.capture_sha.slice(0, 4)).join(", ")}`);
const second = await post("op=calibrate&token=mem-cal",
  cal({ at: "2026-10-01T00:00:00Z", cap: "D", scores: scores(0.31) }));
t("the second measurement supersedes the first", second.supersedes, first.calibration_id);
t("and the verdict is WORSE", second.drift.verdict, DRIFT.WORSE);
t("IT RAISES A RE-EVALUATION OBLIGATION", second.drift.raises_obligation, true);
t("AND IT RE-GRADES NOTHING — the echo says so in a field, not by omission",
  [second.drift.regrades, second.regraded], [false, 0]);
const drift = await api("op=calibrationdrift&token=mem-cal");
t("op=calibrationdrift names EXACTLY the transcription bound to the SUPERSEDED calibration",
  drift.obligations.map((o) => o.capture_sha), [BOUND_SHA]);
t("and it names the calibration it was graded under and the one that replaced it",
  [drift.obligations[0].superseded_calibration, drift.obligations[0].current_calibration],
  [first.calibration_id, second.calibration_id]);
/* THE ABSENCES, ASSERTED AS HARD AS THE PRESENCE — the item's acceptance is that
   the set is EXACT, and a query naming everything would pass a presence test. */
t("ABSENCE: a transcription by the SAME ENGINE resting on NO calibration is NOT named",
  drift.obligations.filter((o) => o.capture_sha === UNBOUND_SHA).length, 0);
t("ABSENCE: a transcription bound to a DIFFERENT engine's calibration is NOT named",
  drift.obligations.filter((o) => o.capture_sha === OTHER_SHA).length, 0);
t("the answer states `regraded: 0` even when it is non-empty", drift.regraded, 0);
/* THE GRADE PIN — the item's acceptance, driven rather than described. */
const afterCap = await api("op=textprovenance&token=mem-cal");
t("NO MACHINE MINTS A GRADE (DEC-4): the bound transcription's derivation_cap did NOT move when "
  + "the drift handler ran — a worse measurement names the work, it does not do it",
  (afterCap.documents.find((d) => d.capture_sha === BOUND_SHA) || {}).derivation_cap, "C");
t("NO MACHINE MINTS A GRADE (DEC-4): nor did the unbound one's, which nothing claimed either way",
  (afterCap.documents.find((d) => d.capture_sha === UNBOUND_SHA) || {}).derivation_cap, "C");

console.log("\n--- CLAUSE (d), THE OTHER HALF: A BETTER CALIBRATION RAISES NOTHING ---");
const third = await post("op=calibrate&token=mem-cal",
  cal({ at: "2026-11-01T00:00:00Z", cap: "B", scores: scores(0.005) }));
t("the third measurement is BETTER than the second", third.drift.verdict, DRIFT.BETTER);
t("IT RAISES NOTHING AT ALL", [third.drift.raises_obligation, third.obligations_raised],
  [false, 0]);
t("and it re-grades nothing either — a grade RISES only by an authored act",
  [third.drift.regrades, third.regraded], [false, 0]);
const drift2 = await api("op=calibrationdrift&token=mem-cal");
t("the standing obligation is STILL exactly the one the WORSE measurement raised, unchanged",
  drift2.obligations.map((o) => o.superseded_calibration), [first.calibration_id]);
t("the BETTER supersession added no obligation of its own",
  drift2.obligations.filter((o) => o.superseded_calibration === second.calibration_id).length, 0);

console.log("\n--- DEC-4 AT THE DOOR: A CALLER MAY NOT ASK A MEASUREMENT TO MOVE A GRADE ---");
const asked = await post("op=calibrate&token=mem-cal", cal({ at: "2026-12-01T00:00:00Z", regrade: true }));
sawRegradeRefusal = asked;
t("op=calibrate REFUSES a caller asking it to re-grade", asked.reason, "CAL_CANNOT_REGRADE");
t("and it is refused in BOTH directions — the downgrade is the one people expect to be allowed",
  (await post("op=calibrate&token=mem-cal",
    cal({ at: "2026-12-01T00:00:00Z", cap: "D", apply_to_transcriptions: true }))).reason,
  "CAL_CANNOT_REGRADE");
t("C-42.7 is carried by the refusal the store produced",
  [asked.check, typeof asked.translation === "string" && asked.translation.length > 40],
  ["C-42.7", true]);
/* THE REACH ARM, now that every row has been driven somewhere. */
t("REACH: every row in C-42 was DRIVEN by an arm above, none skipped",
  CODES_USED.filter((c) => !CHECK_ARMS.some(([n]) => n === CALIBRATION_CHECKS[c].check)
                        && c !== "CAL_CANNOT_REGRADE"), []);
t("and CAL_CANNOT_REGRADE was driven through the OP, not asserted at the store",
  sawRegradeRefusal.reason, "CAL_CANNOT_REGRADE");

console.log("\n--- CLAUSE (e): AN ANNOUNCEMENT WATCH, THROUGH THE OP ---");
const beforeSig = await api("op=calibrations&token=mem-cal&engine=pdfjs");
const sigDue = beforeSig.subjects[0].next_probe.at;
const sig = await post("op=calibrationsignal&token=mem-cal",
  { engine: "pdfjs", source: "github.com/mozilla/pdf.js releases", detail: "4.3.0 released",
    probe_by_ms: 0 });
t("op=calibrationsignal records the announcement", sig.ok, true);
t("IT CHANGED NO GRADE and did not stand in for a probe",
  [sig.changed_grades, sig.stood_in_for_probe], [0, false]);
t("IT SHORTENED the interval to the next probe", sig.next_probe.at < sigDue, true);
t("and the answer says the signal is why", sig.next_probe.from, "signal");
const sigBad = await post("op=calibrationsignal&token=mem-cal",
  { engine: "pdfjs", source: "the vendor's blog", cap: "A" });
t("an announcement carrying a FIDELITY is refused at the door",
  sigBad.reason, "CAL_SIGNAL_CLAIMS_MEASUREMENT");
const afterSig = await api("op=calibrations&token=mem-cal&engine=pdfjs");
t("A CLAIM IS NOT A MEASUREMENT: the announcement did NOT make a calibration current — no probe "
  + "ran, so the calibration count is unchanged",
  afterSig.count, beforeSig.count);
t("A CLAIM IS NOT A MEASUREMENT: nor did it change the live calibration's cap",
  afterSig.calibrations.find((c) => c.superseded_by == null).cap,
  beforeSig.calibrations.find((c) => c.superseded_by == null).cap);
t("A CLAIM IS NOT A MEASUREMENT: the live calibration is still the one a PROBE produced",
  afterSig.calibrations.find((c) => c.superseded_by == null).probe_id, "cpdf13-fidelity-v1");
/* A SIGNAL CANNOT PUSH A PROBE OUT, driven through the op rather than only in
   the pure function above. */
const laterSig = await post("op=calibrationsignal&token=mem-cal",
  { engine: "pdfjs", source: "a mailing list", probe_by_ms: 4_000_000_000_000 });
t("a signal asking for a LATER probe cannot push the interval out",
  laterSig.next_probe.at <= sigDue, true);

console.log("\n--- CLAUSE (c): THE ELEVENTH ALARM CONSUMER, PER SCHEDULER.md ---");
const stub = await mf.getDurableObjectNamespace("STORE");
/* Driven through the DO's own onAlarm with a pinned virtual clock, exactly as
   the task-drain and scheduler suites drive theirs. */
const id = stub.idFromName("bio");
const doStub = stub.get(id);
const T0 = 2_000_000_000_000;
const fired = await doStub.onAlarm(T0);
t("the calibration consumer fires on the alarm and reports itself by name",
  !!(fired && fired.ran && fired.ran.some
     ? fired.ran.some((r) => r && r.calibration) : (fired && fired.calibration !== undefined)),
  true);

console.log("\n--- SELF-TERMINATION: AN INSTANCE WITH NO SUBJECT HOLDS NO ALARM ---");
const mfBare = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: readFileSync(SRC, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-cal", MEMBER_TOKEN: "mem-cal", PROBE_TOKEN: "prb-cal",
              VERSION: "test", GOVERNOR_APPETITE_PER_MIN: "600000",
              GOVERNOR_SUBRESOURCE_STAGGER_MS: "0" },
});
const bareRaw = await (await mfBare.dispatchFetch(
  "http://x/api/?op=calibrations&token=mem-cal")).json();
const bareOut = bareRaw && bareRaw.result ? bareRaw.result : bareRaw;
t("an instance that has registered nothing has no subject and no probe scheduled",
  [bareOut.subjects.length, bareOut.count], [0, 0]);
t("and it SAYS so, rather than reporting a schedule nobody asked for",
  /holds no alarm at all/.test(bareOut.why), true);
t("the cadence is still stated, so a group can read the cost before turning anything on",
  bareOut.cadence_ms, CALIBRATION_CADENCE_MS);

console.log("\n--- THE COST, STATED (clause (c)'s 'so no group discovers it as a surprise') ---");
const schedDoc = readFileSync(fileURLToPath(
  new URL("../../docs/development/SCHEDULER.md", import.meta.url)), "utf8");
t("SCHEDULER.md names the calibration consumer", /calibration-reprobe/.test(schedDoc), true);
t("and states the cost as one probe per cadence on the instance's own account",
  /ONE PROBE PER/i.test(schedDoc) && /own account/i.test(schedDoc), true);
t("and names the constant rather than re-typing the number",
  /CALIBRATION_CADENCE_MS/.test(schedDoc), true);

reachedFoot = true;
await mf.dispose();
await mfBare.dispose();

/* ======================================================================
 * NEGATIVE CONTROL — RUN 2026-09-10. The arms, their DECLARED outcomes and what
 * they MEASURED live in the `NEGATIVE CONTROL:` line at the head of this file
 * (one line, so `coverage.mjs`'s register reads it and the next session re-runs
 * the whole block in one step) and in `test/calibration.control.mjs`, which
 * declares each arm's must-fail and must-pass BEFORE running it — so the
 * declaration cannot be written after the measurement.
 *
 * BASELINE 110/0/foot-reached · FOUR ARMS · 0 came back other than declared on
 * the final run · every restore sha256-MATCH and cmp-IDENTICAL against a
 * uniquely-named per-arm pristine copy, byte counts printed, 1,000-byte floor
 * guarded · tree measured back at 110/0 afterwards.
 *
 * TWO ARMS FOUND THE INSTRUMENT WRONG RATHER THAN THE SUBJECT on their first
 * run, and both are recorded in the head line rather than smoothed: one proved
 * rule 4 is enforced at TWO sites and therefore unfalsifiable one site at a
 * time, and one reported `-1 pass / -1 fail / foot false` for a suite that DIED
 * — which is the reading a harness trusting a count could not have had.
 * ====================================================================== */

console.log(`\ncalibration: ${pass} passed, ${fail} failed${
  reachedFoot ? "" : " — NEVER REACHED ITS FOOT"}`);
process.exit(fail ? 1 : 0);
