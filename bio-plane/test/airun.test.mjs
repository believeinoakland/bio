/* NEGATIVE CONTROL: every arm below was RUN on 2026-08-07 by is6-agent, and every restore was verified by CONTENT as well as sha256 — an NC harness in this repository once reported a byte-identical restore over a file that had not been restored. Clean tree: 101 pass, 0 fail.
   (1) THE ITEM'S OWN, AND IT IS FIRST — A RUN KILLED MID-FLIGHT. In src/store.mjs neuter the reaper's tick by making the `ai-run-reap` registry entry a no-op (`tick: (now) => ({ airunreap: { at: null, lapsed: 0, reaped: [] } })`), which is exactly what "the run writes its own log on the way out" amounts to for a run that was killed -> 11 FAIL, 90 pass, and every one NAMES the killed run or what a surface can no longer render: K2c (reaped [] against one named run), K3 (log has 3 entries, not 4 — the terminal one is simply absent), K4 (bound null against "lease"), K5 (state null), K5b (no sentence naming the bound), K6 (still "running" hours after it died), K7 (seqs [1,2,3]), K8 (op=airun publishes no condition), K9 (a late tick REOPENS a dead run), U6 and U7 (the running-session surface has nothing to render about a run that ended). Restored, 101 pass.
   (2) MAKE THE LOG WRITE ONLY ON SUCCESS. In #aiRunTerminate guard the #aiRunAppend call with `stoppedByBound ? null : …` -> 8 FAIL, 93 pass, across TWO runs and nothing else: K3/K4/K5/K5b/K7 name the killed run that left nothing, B3/B4/B5 name the budget-exhausted one. EVERY arm about a run that FINISHED stays GREEN — C1-C4 and F1-F2 do not move — which is the finding as a measurement rather than a sentence: a log that exists only when the run finished is a log about the runs that did not need one. (Noted precisely: the CANCELLED run stays green under this arm because `cancelled` is an ENDING and not a bound, so this mutation does not reach it. The first draft of this line claimed C3 failed; it does not, and the claim is corrected rather than left standing.)
   (3) PUT THE LOG IN bundle.md. Promote a second version of the fixture bundle whose bundle.md body carries a terminal entry's own detail sentence, THROUGH THE REAL op=promote WRITE PATH rather than by hand-writing a files row -> 1 FAIL, 100 pass: ARM L3 names the bundle and the leaked sentence, with the corpus size (1 document, 15 needles) printed beside it so a corpus that shrank to nothing could not read as a clean answer. ARM L4 is the same function's own control in the other direction and is IN the suite, so L3 is a measurement rather than a green light nobody has shown can go red.
   (4) ADD A SECOND ALARM. `this.ctx.storage.setAlarm(Date.now() + 1000)` in aiRunOpen -> 1 FAIL, 100 pass: ARM S4 names the offending byte offset, because the pin is that EVERY arming site lies inside the one #reconcileAlarm. Separately, a `triggers.crons` line in wrangler.jsonc -> 1 FAIL, 100 pass: ARM S5. Both are SCHEDULER.md's one-mechanism rule.
   (5) EACH OF THE SIX C-22 REFUSALS REMOVED ONE AT A TIME from src/airun.mjs, because a control that removes them together proves only that the block exists. C-22.1 -> R1/R1b/R7, 98 pass. C-22.2 -> R2/R2b/R7, 98 pass. C-22.3 -> R3/R7, 99 pass. C-22.4 -> R4/R4b/R7, 98 pass. C-22.5 -> R5/R5b/R5c/R7, 97 pass. C-22.6 -> R6/R7, 99 pass. **C-22.4'S FIRST RUN IS THE ONE TO READ: removing `checkCondition` entirely left this suite GREEN AT 98/98, because a SECOND COPY of the vocabulary test inside `checkObservation` absorbed the control.** The rule had two implementations, so neither had a control that proved anything about it; `checkObservation` now DELEGATES, ARM R4c pins that there is exactly one implementation, and the arm above is what that reads like once it is true. Two of these controls also THREW on `.detail` and `.refused[0]` of undefined and took every arm behind them with them — the reads are null-tolerant now, and R4/R5 run on their own runs so a control that succeeds cannot end the run its successors are using.
   (6) NEUTER THE CONSUMER WALK. Make ARM S1's parse of #schedConsumers return [] -> 3 FAIL, 98 pass: the REACH assertion fails AS A DELTA ([0,-1] against [8,7]) with the corpus printed, rather than an empty registry passing vacuously.
   (7) OVER-STRICTNESS, IN-SUITE: ARM R8 offers two correct observations phrased unlike anything the refusals were written against — a `partial` extraction with `text-undetermined`, and an ungoverned `LOOKED_ABSENT` at the meaning level — and both are ACCEPTED. ARM X4/X5 do the same for the bound function. */
/* IS-6 — THE RUN OBJECT AND ITS OBSERVATION LOG.
 *
 * `INVESTIGATIVE-SESSION.md` §11 (the run is an object), §14b.3 (the scheduler
 * join), §14b.6 (a run is bounded and the bound is RECORDED), §14b.7 (partial
 * results survive). The mechanism is `src/store.mjs`; the vocabulary and the
 * refusals are `src/airun.mjs` and the C-22 family in `checks/bio-checks.mjs`.
 *
 * WHAT THIS SUITE IS ACTUALLY FOR, and it is one sentence: **the failure path
 * is the only one that matters here.** A log that exists only when the run
 * finished is a log about the runs that did not need one. So the arms are
 * ordered by how badly the run ended — killed first, then budget-exhausted,
 * then cancelled, then completed — and the whole battery of them is what stops
 * "the run writes its log on the way out" from being the answer, because a run
 * that is KILLED runs no exit path of its own.
 *
 * THE INSTRUMENT IS THE MOST LIKELY THING TO BE WRONG, so three rules are kept
 * throughout and each has cost this repository real time:
 *
 *   - SETS ARE DRIVEN, NEVER TYPED. The refusal set is read out of
 *     `AI_RUN_CHECKS`, the consumer registry out of `store.mjs`'s own source,
 *     the vocabularies out of `airun.mjs`, and the rendered UI output out of
 *     `civicos-ui/app.html`'s real renderers. A hand copy agrees at zero cost.
 *   - THE REAL PATH AND THE MUTATED PATH GO THROUGH ONE FUNCTION. `leakage()`
 *     below is called on the real corpus and is what the bundle.md negative
 *     control re-runs; there is no second copy of it to be mutated separately.
 *   - EVERY WALK PRINTS ITS CORPUS SIZE and asserts REACH as a delta, so a walk
 *     over nothing is visible rather than green.
 *
 * DRIVEN THROUGH THE CONTROL PLANE (D-43): `op=invitelook` shipped with a
 * ReferenceError while 1276 assertions passed because the suite drove the store.
 * Every op here is reached with its literal written out so scripts/coverage.mjs
 * credits it. The reaper is driven at the Durable Object, because `onAlarm` is
 * a scheduler entry point no control-plane op reaches — which is the point of
 * it.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { AI_RUN_CHECKS } from "../checks/bio-checks.mjs";
import { OBSERVATION_STATES, OBSERVATION_LEVELS, RUN_BOUNDS, RUN_ENDINGS,
         DEFINITIVE_STATES, translationOf, finishedBound } from "../src/airun.mjs";
import { QUEUE_CONDITION_KINDS } from "../src/queuestate.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const INDEX_SRC = readFileSync(IDX, "utf8");
const AIRUN_SRC = readFileSync(fileURLToPath(new URL("../src/airun.mjs", import.meta.url)), "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-is6", MEMBER_TOKEN: "mem-is6", PROBE_TOKEN: "prb-is6",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* NULL-TOLERANT READS. Three of this suite's own controls THREW on `.detail` or
   `.refused[0]` of undefined and took every arm behind them with them — a
   control that dies early hides what it broke and reports one defect as none.
   Every read of a refusal's fields goes through here. */
const det = (r) => (r && typeof r.detail === "string") ? r.detail : "";
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());

const TOK = "mem-is6";
const BUNDLE = "INQ-2026-0801-sewer-fund-transfers";
const SHA_A = "a".repeat(64);
const T0 = "2026-08-07T09:00:00Z";
const ms = (iso) => Date.parse(iso);
const at = (baseIso, plusMs) => new Date(ms(baseIso) + plusMs).toISOString().split(".")[0] + "Z";

/* A real bundle for the runs to be ABOUT, and for the bundle.md arm to have a
   corpus. Deliberately minimal: this suite is not about promotion, and a fixture
   that fails for its own reasons is a fixture that hides the subject. */
const promoteFixture = () => POST(`op=promote&token=${TOK}`, {
  bundleId: BUNDLE, base: null, snapKey: "20260807T090000Z_inbox", author: "ruth",
  meta: { object_type: "inquiry", group: "believe-in-oakland",
          title: "Where did the sewer fund transfers go?",
          current_state: "open", created: T0, last_updated: T0 },
  files: [{ path: "bundle.md", text: `---\nid: ${BUNDLE}\n---\n\n## Question\n\nWhere did the sewer fund transfers go?\n`,
            bytes: 90, sha256: SHA_A }],
  register: [],
});

/* ---------------------------------------------------------------------------
 *  THE ONE LEAKAGE FUNCTION. The real corpus and the negative control's mutated
 *  corpus both go through THIS, so there is no parallel path that could agree
 *  with the real one at zero cost — the sourcing failure measured on UI-38.
 *  Returns the leaks it found, so an arm can NAME the bundle and the sentence
 *  rather than reporting a bare boolean.
 * ------------------------------------------------------------------------- */
const leakage = (bundleTexts, logEntries) => {
  const needles = [];
  for (const e of Array.isArray(logEntries) ? logEntries : []) {
    if (e && typeof e.detail === "string" && e.detail.length > 20) needles.push(e.detail);
    if (e && typeof e.subject === "string" && e.subject.startsWith("observation:")) needles.push(e.subject);
  }
  const leaks = [];
  for (const [id, text] of Object.entries(bundleTexts || {}))
    for (const n of needles)
      if (typeof text === "string" && text.includes(n)) leaks.push({ bundle: id, leaked: n.slice(0, 60) });
  return { leaks, needles: needles.length, corpus: Object.keys(bundleTexts || {}).length };
};

try {

/* ========================================================================= *
 *  ARM V · THE VOCABULARIES, and that the plane holds exactly one copy of each
 * ========================================================================= */
console.log("\n--- ARM V · D-129's vocabulary, D-104's split, §14b.6's bounds ---");
{
  const states = Object.keys(OBSERVATION_STATES);
  console.log(`  corpus: ${states.length} observation states, ${Object.keys(RUN_BOUNDS).length} bounds, `
    + `${Object.keys(RUN_ENDINGS).length} endings, ${Object.keys(AI_RUN_CHECKS).length} refusals`);
  t("ARM V1: D-129's four states, plus SWH's `partial`, and nothing else",
    states.sort(), ["LOOKED_ABSENT", "LOOKED_INDETERMINATE", "NEVER_LOOKED", "PRESENT", "partial"]);
  t("ARM V2: every state carries a MEANING a refusal and a reader can both use — a bare enum would "
    + "leave the vocabulary undefined at the only place anyone reads it",
    states.filter((s) => typeof OBSERVATION_STATES[s] !== "string" || OBSERVATION_STATES[s].length < 20), []);
  /* THE DEFINITIVE SET IS NAMED ONCE. C-22.2 and C-22.3 both turn on it, so a
     sixth state added later inherits both refusals or fails loudly, instead of
     escaping two checks that each hard-coded four literals. */
  t("ARM V3: exactly two states are DEFINITIVE about the world",
    [...DEFINITIVE_STATES].sort(), ["LOOKED_ABSENT", "PRESENT"]);
  t("ARM V4: the four levels CLAUDE.md names are the four the log records",
    Object.keys(OBSERVATION_LEVELS).sort(), ["content", "document", "internet", "meaning"]);
  /* §14b.6 lists three; `lease` and `runtime` are the two this build adds, each
     with its reason at the declaration. Asserted as a SET so a bound added
     without a reason cannot slip in unnoticed. */
  t("ARM V5: the bound vocabulary is §14b.6's three plus lease and runtime",
    Object.keys(RUN_BOUNDS).sort(), ["fetches", "lease", "runtime", "subsessions", "wallclock"]);
  t("ARM V6: an ENDING is not a bound — 'a member stopped it' and 'the budget ran out' are "
    + "different facts and the vocabularies are kept apart",
    Object.keys(RUN_ENDINGS).sort(), ["cancelled", "completed"]);
  t("ARM V7: `runtime-ceiling-reached` is the record's OWN word, read live from queuestate.mjs "
    + "and never copied here",
    Object.prototype.hasOwnProperty.call(QUEUE_CONDITION_KINDS, "runtime-ceiling-reached"), true);
  /* IS-9(d) owns the QUEUE-FEED producer. This item publishes the run record
     that names the condition and deliberately emits no queue item, and that
     boundary is asserted rather than promised. */
  t("ARM V8: IS-6 mints NO new condition kind — every kind airun.mjs can emit is already in the "
    + "record's vocabulary",
    [...AIRUN_SRC.matchAll(/"([a-z]+(?:-[a-z]+)+)"/g)].map((m) => m[1])
      .filter((s) => s.includes("-") && /^[a-z-]+$/.test(s))
      .filter((s) => !Object.prototype.hasOwnProperty.call(QUEUE_CONDITION_KINDS, s))
      .filter((s) => s === "client-rendered-shell" || s === "runtime-ceiling-reached"), []);
}

/* ========================================================================= *
 *  ARM D · DEC-49 — every refusal carries a C-NUMBER, a CODE and a TRANSLATION
 * ========================================================================= */
console.log("\n--- ARM D · DEC-49: a code with a canned translation, read from ONE place ---");
{
  const codes = Object.keys(AI_RUN_CHECKS);
  console.log(`  corpus: ${codes.length} refusable conditions in the C-22 family`);
  /* CORRECTED 2026-08-08 BY SK-1, AND STATED RATHER THAN QUIETLY REWORDED. This
     arm read SIX and named the six IS-6 minted. The family now holds SEVEN:
     SK-1 added C-22.7 (`AI_RUN_SKILL_VERSION_UNNAMED`), the run's THIRD
     condition, refused at the open beside the two principals. It belongs in
     THIS family — it is a fact about the run object — and a new `*_CHECKS`
     family would have been a floor in `civicos-ui/check-refusal-codes.mjs`
     bought for one row. The count is corrected rather than exempted: an arm
     that stopped counting the family it exists to count would be a pin nobody
     is holding. */
  t("ARM D1: the C-22 family is SEVEN C-numbers — IS-6's six and SK-1's skill-version condition",
    codes.map((c) => AI_RUN_CHECKS[c].check).sort(),
    ["C-22.1", "C-22.2", "C-22.3", "C-22.4", "C-22.5", "C-22.6", "C-22.7"]);
  t("ARM D2: every code carries a CANNED TRANSLATION — an untranslated code must not exist to be sent",
    codes.filter((c) => typeof AI_RUN_CHECKS[c].translation !== "string"
                     || AI_RUN_CHECKS[c].translation.length < 40), []);
  /* CORRECTED 2026-08-08 BY SK-1 for D1's reason, and the WIDENING IS NAMED
     RATHER THAN OPEN: the enforcement site must still be a PURE check module in
     `src/`, and the two that exist are named. This is not `where`-anything — a
     row pointing at a site the DEC-49 guard cannot resolve is the defect PL-4
     measured (a `where` naming a function that does not exist), and that guard
     opens both of these files and reads them. */
  t("ARM D3: every allocation NAMES ITS ENFORCEMENT SITE in a pure check module, so the catalogue "
    + "can be walked to the code",
    codes.filter((c) => !/^src\/(airun|skillpack)\.mjs /.test(AI_RUN_CHECKS[c].where || "")), []);
  /* THE MAP IS READ FROM ONE PLACE. airun.mjs must not spell a translation of
     its own — a hand copy agrees at zero cost, measured five times. */
  t("ARM D4: airun.mjs holds NO second copy of any translation",
    codes.filter((c) => AIRUN_SRC.includes(AI_RUN_CHECKS[c].translation.slice(0, 40))), []);
  t("ARM D5: the resolver returns the catalogue's own sentence, so a surface renders a code it "
    + "RECEIVED rather than one it computed (DEC-8 as amended by DEC-49)",
    codes.filter((c) => translationOf(c) !== AI_RUN_CHECKS[c].translation), []);
  t("ARM D6: and an unknown code resolves to null rather than to a plausible sentence",
    translationOf("AI_LOG_NOT_A_REAL_CODE"), null);
}

/* ========================================================================= *
 *  ARM S · THE SCHEDULER JOIN — ONE APPENDED ENTRY, NO SECOND ALARM, NO CRON
 * ========================================================================= */
console.log("\n--- ARM S · SCHEDULER.md's one mechanism ---");
{
  /* The registry is PARSED out of store.mjs rather than described, and REACH is
     asserted as a DELTA with the corpus printed: a parse that matched nothing
     would otherwise report an empty registry as a clean answer. */
  const regBody = (() => {
    const i = STORE_SRC.indexOf("#schedConsumers(probe) {");
    const j = STORE_SRC.indexOf("\n    for (const name of Object.keys(probe", i);
    return i > -1 && j > i ? STORE_SRC.slice(i, j) : "";
  })();
  const names = [...regBody.matchAll(/\{ name: "([a-z-]+)"/g)].map((m) => m[1]);
  console.log(`  corpus: ${names.length} consumers on the one alarm — ${names.join(", ")}`);
  /* CORRECTED 2026-08-08 BY PL-4, NOT EXEMPTED. The delta was 8-was-7 when IS-6
     landed the reaper; PL-4 appended `capture-request-drain` as the NINTH, so
     the corpus is 9. THE SHAPE OF THE ARM IS UNCHANGED and that is the point: it
     is still a DELTA with the corpus printed, so a parse that matched nothing
     still cannot report an empty registry as a clean answer, and this item's own
     entry still has to be the LAST one with every predecessor untouched. */
  t("ARM S1 (REACH, as a delta): the registry parse reaches 9 consumers, was 8 before PL-4 "
    + "appended the capture-request drain",
    [names.length, names.length - 1], [9, 8]);
  t("ARM S2: the investigative run joined as ONE appended entry",
    names.filter((n) => n === "ai-run-reap").length, 1);
  t("ARM S2b (PL-4): and the capture-request drain joined as ONE appended entry too — no second "
    + "alarm and no cron, which ARM S4 and ARM S5 hold over the whole plane",
    names.filter((n) => n === "capture-request-drain").length, 1);
  t("ARM S3: and every consumer that came before it is untouched",
    names.slice(0, 7), ["selection-sweep", "task-drain", "archive-monitor", "connection-derive",
                        "overdue-scan", "queue-renotify", "monitor-cadence"]);
  t("ARM S3b (PL-4): the reaper is still the EIGHTH, so the new entry was APPENDED rather than "
    + "inserted — an insertion would renumber every consumer a later delta names",
    names[7], "ai-run-reap");
  /* NO SECOND ALARM. SCHEDULER.md: "Do NOT add a second alarm or a cron; that is
     the decision this file records." The pin is over the WHOLE plane's source
     and it is a count, so a second arming site anywhere fails it by name. */
  /* CORRECTED ON FIRST RUN, and recorded rather than quietly fixed: this arm
     first asserted ONE `setAlarm` call site and the plane has TWO — the exact
     branch and the pull-earlier branch, BOTH inside `#reconcileAlarm`. The
     count was wrong about the population while being right about the shape,
     which is the failure mode a re-derivation would have "confirmed". The pin
     that actually states SCHEDULER.md's rule is not a count at all: it is that
     every arming site in the plane lies inside the ONE reconcile. */
  const recFrom = STORE_SRC.indexOf("async #reconcileAlarm(");
  const recTo = STORE_SRC.indexOf("\n  async #probeState(", recFrom);
  const armSites = [...STORE_SRC.matchAll(/storage\.setAlarm\(/g)].map((m) => m.index);
  console.log(`  corpus: ${armSites.length} arming sites in store.mjs, reconcile spans `
    + `${recFrom}..${recTo}`);
  t("ARM S4a: the reconcile is locatable and there ARE arming sites to place — an unlocatable "
    + "reconcile would make the pin below vacuous", recFrom > -1 && recTo > recFrom && armSites.length > 0, true);
  t("ARM S4: EVERY place the plane arms the alarm is inside the ONE reconcile — a second alarm "
    + "armed anywhere else fails here by position (SCHEDULER.md's one-mechanism rule)",
    armSites.filter((i) => i < recFrom || i > recTo), []);
  /* NO CRON. A cron line in wrangler.jsonc would be a SECOND scheduler beside
     the alarm, which is the sprawl REC-1 decided against. */
  const wrangler = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8");
  t("ARM S5: no cron trigger exists", /"crons"\s*:/.test(wrangler), false);
  t("ARM S6: the reaper is an INTERVAL consumer — due only when a lease has actually lapsed, so it "
    + "fires at its own moment and no other's",
    /name: "ai-run-reap",[\s\S]{0,200}?due:\s*\(now\)\s*=>\s*this\.#aiRunReapPending\(now\)\s*>\s*0/.test(regBody), true);
  t("ARM S7: and it SELF-TERMINATES — its wake is null when no run is in flight",
    /#aiRunReapWake\(now\)\s*\{[\s\S]{0,240}?return null;/.test(STORE_SRC), true);
}

/* ========================================================================= *
 *  THE LIVE PLANE
 * ========================================================================= */
const pr = await promoteFixture();
t("fixture: the inquiry the runs are about is in the store", pr && pr.ok === true, true);

/* ------------------------------------------------------------------------- *
 *  ARM K · THE RUN KILLED MID-FLIGHT — the negative control the design names,
 *  run here as a POSITIVE arm because it is the behaviour, not only the check.
 *
 *  Nothing "kills" the run in a test the way a Worker eviction would; what a
 *  kill IS, mechanically, is a run that stops heartbeating. So the run opens,
 *  ticks once with real observations, and then does NOTHING — no close, no
 *  further tick — and the clock is advanced past its lease. Everything after
 *  that is the plane's, and the run contributes not one instruction to it.
 * ------------------------------------------------------------------------- */
console.log("\n--- ARM K · a run KILLED mid-flight: its log must EXIST and NAME THE BOUND ---");
const KILLED = "RUN-2026-0807-killed";
{
  /* `started`, not `opened` — see the note at store.mjs aiRunOpen: REC-58's
     repo-wide `.opened` walk cannot tell a case's field from a run's, and the
     collision is avoided here rather than by weakening that measurement. */
  const started = await POST(`op=airunopen&token=${TOK}`, {
    run: KILLED, contextType: "inquiry", contextId: BUNDLE,
    label: "sewer fund — evidence sweep", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 40, unit: "requests" },
             { bound: "subsessions", allowed: 4, unit: "sessions" }],
    state: { queue: ["budget-2024", "budget-2025"] },
    leaseMs: 60000, at: T0,
  });
  t("ARM K1: the run starts, running, on tick one",
    [started.started, started.status, started.ticks], [true, "running", 1]);

  /* It does REAL work first, so what the arms below prove is that the log
     SURVIVED the kill (§14b.7) and not merely that a terminal row appeared. */
  const ticked = await POST(`op=airuntick&token=${TOK}`, {
    run: KILLED, at: at(T0, 5000), leaseMs: 60000,
    state: { queue: ["budget-2025"] },
    consume: { fetches: 7, subsessions: 1 },
    log: [
      { level: "meaning", subject: "observation:sewer-transfers-finding", state: "NEVER_LOOKED",
        detail: "the framework layer holds no finding about sewer fund transfers; nothing was extracted to derive one from" },
      { level: "document", subject: "observation:budget-2024", state: "PRESENT",
        detail: "the store holds the adopted 2024 budget and it names the transfer line" },
      { level: "internet", subject: "observation:controller-portal", state: "LOOKED_INDETERMINATE",
        governed: true, condition: "governor-holding-host",
        detail: "our own pacing held the controller portal, so nothing can be concluded about what it serves" },
    ],
  });
  /* `ticks` is 2, not 3: an OPEN is tick one, exactly as capture_sessions counts
     its first save. Pinned as the shape the run inherits rather than corrected
     to whatever the code happened to answer. */
  t("ARM K2: it ticks, appends three observations and refuses none",
    [ticked.ticked, ticked.ticks, ticked.appended, ticked.refused.length], [true, 2, 3, 0]);

  /* AND NOW IT DIES. No close. No tick. The clock moves past the lease and the
     ONE alarm fires — this is the third party that observes the death, and it
     is the whole of §14b.6's guarantee. */
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  /* Driven exactly as scheduler.test.mjs drives it: `onAlarm(now)` with a pinned
     virtual clock, which is what workerd calls. Nothing here is a stand-in for
     the alarm — it IS the alarm's body. */
  const alarm = await obj.onAlarm(ms(at(T0, 120000)));
  t("ARM K2b: the alarm's own account of itself NAMES the reaper rather than reporting it as a probe",
    !!(alarm && alarm.airunreap), true);
  t("ARM K2c: and it reports exactly one lapsed run reaped, by name",
    alarm.airunreap && alarm.airunreap.reaped, [{ run: KILLED, terminated: true, bound: "lease" }]);

  const log = await GET(`op=airunlog&token=${TOK}&run=${KILLED}`);
  const terminal = log.entries.filter((e) => e.terminal);
  t("ARM K3: the KILLED run's log EXISTS", log.entries.length, 4);
  t("ARM K3b: and the three observations it made before dying SURVIVED (§14b.7)",
    log.entries.filter((e) => !e.terminal).map((e) => e.state),
    ["NEVER_LOOKED", "PRESENT", "LOOKED_INDETERMINATE"]);
  t("ARM K4: and its terminal entry NAMES THE BOUND that stopped it",
    terminal.length === 1 ? terminal[0].bound : null, "lease");
  /* The heldMatch discipline, and it is the reason the whole vocabulary exists:
     a run that did not finish looking may not answer with a definitive absence.
     PRESENT survives, because a document the run did hold does not stop
     existing because the run ran out of time afterwards. */
  t("ARM K5: the killed run's search state is PRESENT — it did find something before it died, and "
    + "a bound reached afterwards does not un-find it",
    terminal.length === 1 ? terminal[0].state : null, "PRESENT");
  t("ARM K5b: and the terminal entry SAYS which bound in words, not only in a field",
    terminal.length === 1 && terminal[0].detail.includes("'lease'"), true);
  t("ARM K6: the run is out of `running`", log.status, "stopped");
  t("ARM K7: the log is APPEND-ONLY — the terminal entry is the LAST seq, not an overwrite",
    log.entries.map((e) => e.seq), [1, 2, 3, 4]);

  const read = await GET(`op=airun&token=${TOK}&run=${KILLED}`);
  t("ARM K8: op=airun publishes the condition a surface renders",
    read.session.condition && read.session.condition.bound, "lease");
  t("ARM K9: a tick arriving after the run ended is a STATED no-op and does not reopen it",
    (await POST(`op=airuntick&token=${TOK}`, { run: KILLED, at: at(T0, 200000) })).ticked, false);
}

/* ------------------------------------------------------------------------- *
 *  ARM B · A BUDGET EXHAUSTED MID-TICK. The tick that spends the last of a
 *  budget is the tick that ends the run: a run cannot overspend and then
 *  decline to say so.
 * ------------------------------------------------------------------------- */
console.log("\n--- ARM B · a bound reached: the run ends and the log names WHICH ---");
const SPENT = "RUN-2026-0807-spent";
{
  /* CORRECTED 2026-08-08 BY SK-1, AND EVERY FIXTURE BELOW WITH IT. `skillVersion`
     was OPTIONAL when this suite was written: the column existed and a run that
     named nothing opened anyway. SK-1 makes it the run's THIRD CONDITION
     alongside the two principals (§11, C-22.7), so a fixture that names none is
     now a refused run rather than a run under unknown instructions. The
     assertion is corrected rather than exempted — a run object none of these
     arms could interpret is exactly what the requirement exists to stop. */
  await POST(`op=airunopen&token=${TOK}`, {
    run: SPENT, contextType: "inquiry", contextId: BUNDLE, mode: "check",
    principalClaude: "member", principalClaudeRef: "ruth@believe-in-oakland",
    skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 3, unit: "requests" }],
    state: {}, leaseMs: 3600000, at: T0,
  });
  const spend = await POST(`op=airuntick&token=${TOK}`, {
    run: SPENT, at: at(T0, 1000), consume: { fetches: 3 },
    log: [{ level: "internet", subject: "observation:portal-search", state: "LOOKED_ABSENT",
            detail: "three searches of the controller portal returned nothing naming the transfers" }],
  });
  t("ARM B1: the tick that spends the last of a budget also ENDS the run",
    spend.ended && spend.ended.terminated, true);
  t("ARM B2: and it names the bound it spent", spend.ended && spend.ended.bound, "fetches");
  const log = await GET(`op=airunlog&token=${TOK}&run=${SPENT}`);
  const term = log.entries.find((e) => e.terminal);
  t("ARM B3: the log EXISTS for a run that never called close", log.entries.length, 2);
  t("ARM B4: and its terminal entry names the bound", term ? term.bound : null, "fetches");
  /* THE OVERRIDE. Every observation it made was LOOKED_ABSENT, but a BOUND
     stopped it — so the run's own account of its search may not be a definitive
     absence. Not found and did not finish looking are different facts. */
  t("ARM B5: LOOKED_ABSENT is DOWNGRADED to LOOKED_INDETERMINATE because a bound stopped the search — "
    + "the run did not finish looking, and only one of those licenses a conclusion",
    term ? term.state : null, "LOOKED_INDETERMINATE");
  t("ARM B6: the observation itself is UNCHANGED — the downgrade is the RUN's account of its search, "
    + "never a rewrite of what it saw (the log is append-only)",
    log.entries.filter((e) => !e.terminal).map((e) => e.state), ["LOOKED_ABSENT"]);
  const read = await GET(`op=airun&token=${TOK}&run=${SPENT}`);
  t("ARM B7: the budget publishes ALLOWED and CONSUMED separately, so no surface has to derive",
    read.session.budget, [{ bound: "fetches", allowed: 3, consumed: 3, unit: "requests" }]);
}

/* ------------------------------------------------------------------------- *
 *  ARM C · CANCELLED, and ARM F · COMPLETED. The two ENDINGS that are not
 *  bounds — proving the vocabulary is not one word wearing two hats.
 * ------------------------------------------------------------------------- */
console.log("\n--- ARM C/F · the two endings that are not bounds ---");
{
  const CANCELLED = "RUN-2026-0807-cancelled";
  await POST(`op=airunopen&token=${TOK}`, {
    run: CANCELLED, contextType: "project", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: "investigative-session@1",
    bounds: [{ bound: "wallclock", allowed: 600000, unit: "ms" }],
    state: {}, at: T0 });
  const c = await POST(`op=airunclose&token=${TOK}`, { run: CANCELLED, bound: "cancelled", at: at(T0, 9000) });
  t("ARM C1: a member stopping a run is an ENDING and is accepted", [c.terminated, c.bound], [true, "cancelled"]);
  const cl = await GET(`op=airunlog&token=${TOK}&run=${CANCELLED}`);
  t("ARM C2: a cancelled run with no observations at all still leaves a log", cl.entries.length, 1);
  t("ARM C3: and it says so honestly — NEVER_LOOKED, not an absence it did not establish",
    cl.entries[0].state, "NEVER_LOOKED");
  t("ARM C4: the run is `finished` rather than `stopped`, because no bound was reached", cl.status, "finished");

  const DONE = "RUN-2026-0807-done";
  await POST(`op=airunopen&token=${TOK}`, {
    run: DONE, contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 100 }], state: {}, at: T0 });
  await POST(`op=airuntick&token=${TOK}`, { run: DONE, at: at(T0, 1000), consume: { fetches: 2 },
    log: [{ level: "content", subject: "observation:budget-2024-table", state: "partial",
            condition: "text-undetermined",
            detail: "the transfer table extracted at 88 per cent; the remaining rows are over the envelope" }] });
  const f = await POST(`op=airunclose&token=${TOK}`, { run: DONE, bound: "completed", at: at(T0, 2000) });
  t("ARM F1: a completed run closes on `completed`", [f.terminated, f.bound], [true, "completed"]);
  t("ARM F2: and its search state is `partial`, taken from what it actually recorded rather than "
    + "declared about itself", f.state, "partial");
}

/* ------------------------------------------------------------------------- *
 *  ARM R · THE SIX REFUSALS, one at a time, each naming its own C-number.
 * ------------------------------------------------------------------------- */
console.log("\n--- ARM R · the C-22 refusals, each fired through the op ---");
const REFUSED = "RUN-2026-0807-refusals";
{
  await POST(`op=airunopen&token=${TOK}`, {
    run: REFUSED, contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: "investigative-session@1",
    bounds: [], state: {}, at: T0 });
  /* NULL-TOLERANT ON PURPOSE. Under a negative control the run this ticks may
     already have ended, and `refused` is then absent — a bare `r.refused[0]`
     throws on undefined and takes every arm behind it with it, which is how a
     control stops NAMING what it broke and starts hiding it. Measured here: the
     C-22.4 arm's first control threw at this line. */
  const tryEntry = async (entry, run = REFUSED) => {
    const r = await POST(`op=airuntick&token=${TOK}`, { run, at: at(T0, 1000), log: [entry] });
    return (r && Array.isArray(r.refused) && r.refused[0]) || null;
  };

  const r1 = await tryEntry({ level: "document", subject: "x", state: "MAYBE_ABSENT" });
  t("ARM R1 (C-22.1): a state outside D-129's vocabulary is refused",
    r1 && [r1.check, r1.code], ["C-22.1", "AI_LOG_STATE_UNKNOWN"]);
  t("ARM R1b: and the refusal NAMES the five legal values rather than only saying no",
    [det(r1).includes("NEVER_LOOKED"), det(r1).includes("partial")], [true, true]);

  const r2 = await tryEntry({ level: "internet", subject: "x", state: "LOOKED_ABSENT", governed: true });
  t("ARM R2 (C-22.2): a GOVERNED observation may not claim a definitive absence — our governor "
    + "refusing is not the source failing (D-104)",
    r2 && [r2.check, r2.code], ["C-22.2", "AI_LOG_GOVERNED_ABSENCE"]);
  const r2b = await tryEntry({ level: "internet", subject: "x", state: "PRESENT", governed: true });
  t("ARM R2b: and it is refused in the OTHER definitive direction too — a governed fetch cannot "
    + "establish presence either", r2b && r2b.check, "C-22.2");

  const r3 = await tryEntry({ level: "document", subject: "x", state: "PRESENT",
                              condition: "client-rendered-shell" });
  t("ARM R3 (C-22.3): a client-rendered shell is LOOKED_INDETERMINATE and never PRESENT",
    r3 && [r3.check, r3.code], ["C-22.3", "AI_LOG_SHELL_PRESENT"]);

  /* C-22.4 IS REACHED THROUGH TWO DOORS AND HAS ONE IMPLEMENTATION, and that is
     this item's own negative control talking. The first version of this file
     checked the condition vocabulary in TWO places — once for a run's ending and
     once for a log entry's — and removing one of them left the suite green at
     98/98, because the other absorbed the control. Both arms below now fail
     together when the one function is neutered, which is what a control over a
     single rule should do; the arm that proves there IS only one function is
     R4c, and without it these two would go back to agreeing at zero cost. */
  /* ON ITS OWN RUN, so that when the control is applied and this close SUCCEEDS
     it does not end the run every arm after it is using. An arm that knocks out
     its successors reports one defect as eight. */
  const R4RUN = "RUN-2026-0807-condition";
  await POST(`op=airunopen&token=${TOK}`, {
    run: R4RUN, contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: "investigative-session@1",
    bounds: [], state: {}, at: T0 });
  const r4 = await POST(`op=airunclose&token=${TOK}`,
    { run: R4RUN, bound: "completed", condition: "the-portal-was-being-difficult", at: at(T0, 2000) });
  t("ARM R4 (C-22.4, door one — a RUN's ending): a condition outside the record's vocabulary is refused",
    [r4.check, r4.code, r4.terminated], ["C-22.4", "AI_RUN_CONDITION_UNKNOWN", false]);
  const r4b = await tryEntry({ level: "document", subject: "x", state: "LOOKED_INDETERMINATE",
                               condition: "the-pdf-was-being-difficult" });
  t("ARM R4b (C-22.4, door two — a LOG ENTRY's condition): the same rule, refused the same way",
    r4b && [r4b.check, r4b.code], ["C-22.4", "AI_RUN_CONDITION_UNKNOWN"]);
  t("ARM R4c: and there is exactly ONE implementation of it — the entry check DELEGATES rather than "
    + "restating, which is what makes R4 and R4b controls rather than two copies agreeing",
    [...AIRUN_SRC.matchAll(/hasOwnProperty\.call\(conditionKinds/g)].length, 1);

  /* On its own run, for the reason stated at R4: under its control this close
     SUCCEEDS, and it must not end the run the arms after it are using. */
  const R5RUN = "RUN-2026-0807-unnamed";
  await POST(`op=airunopen&token=${TOK}`, {
    run: R5RUN, contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: "investigative-session@1",
    bounds: [], state: {}, at: T0 });
  const r5 = await POST(`op=airunclose&token=${TOK}`, { run: R5RUN, bound: "", at: at(T0, 2000) });
  t("ARM R5 (C-22.5): a run may not leave `running` without saying what stopped it — THE ITEM'S "
    + "own refusal", [r5.check, r5.code, r5.terminated], ["C-22.5", "AI_RUN_BOUND_UNNAMED", false]);
  t("ARM R5b: and the refusal names both vocabularies, so the caller learns what it may say",
    [det(r5).includes("fetches"), det(r5).includes("cancelled")], [true, true]);
  /* AND THE SILENCE ITSELF. `bound` absent entirely, not merely empty: a caller
     that says nothing at all must be refused the same way, because "completed"
     inferred from silence is the manufactured fact this whole design refuses. */
  const R5RUN2 = "RUN-2026-0807-silent";
  await POST(`op=airunopen&token=${TOK}`, {
    run: R5RUN2, contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "instance", skillVersion: "investigative-session@1",
    bounds: [], state: {}, at: T0 });
  const r5c = await POST(`op=airunclose&token=${TOK}`, { run: R5RUN2, at: at(T0, 2000) });
  t("ARM R5c: a close that names NOTHING is refused identically — silence is not `completed`",
    [r5c.check, r5c.terminated], ["C-22.5", false]);

  const r6 = await tryEntry({ level: "document", subject: "x", state: "PRESENT", bundle: BUNDLE });
  t("ARM R6 (C-22.6): an entry offered for a BUNDLE is refused at the one append site",
    r6 && [r6.check, r6.code], ["C-22.6", "AI_LOG_NOT_A_BUNDLE"]);

  t("ARM R7: every refusal that reached a caller carried its CANNED TRANSLATION (DEC-49)",
    [r1, r2, r2b, r3, r4, r4b, r5, r6].filter((r) => !r || translationOf(r.code) !== r.translation), []);
  /* THE OVER-STRICTNESS ARM. A genuinely correct alternative, phrased unlike
     anything above, must PASS — otherwise these six are a wall rather than a
     set of rules. */
  const okEntry = await POST(`op=airuntick&token=${TOK}`, { run: REFUSED, at: at(T0, 3000), log: [
    { level: "content", subject: "observation:minutes-2023", state: "partial",
      governed: false, condition: "text-undetermined",
      detail: "a scanned minute book yielded most of its text and CID fonts defeated the rest" },
    { level: "meaning", subject: "observation:no-finding-yet", state: "LOOKED_ABSENT",
      detail: "the framework layer genuinely holds no finding here, and we reached it ungoverned" },
  ] });
  t("ARM R8 (over-strictness): two correct observations phrased unlike anything above are ACCEPTED",
    [okEntry.appended, Array.isArray(okEntry.refused) ? okEntry.refused.length : null], [2, 0]);
  await POST(`op=airunclose&token=${TOK}`, { run: REFUSED, bound: "runtime",
    condition: "runtime-ceiling-reached", at: at(T0, 4000) });
}

/* ------------------------------------------------------------------------- *
 *  ARM L · THE LOG IS NEVER IN bundle.md.
 * ------------------------------------------------------------------------- */
console.log("\n--- ARM L · the observation log is never written into bundle.md (§11) ---");
{
  const list = await GET(`op=list&token=${TOK}`);
  const ids = (list.bundles || list || []).map((b) => b.bundle_id || b.id).filter(Boolean);
  const texts = {};
  for (const id of ids) {
    const f = await GET(`op=file&token=${TOK}&id=${id}&path=bundle.md`);
    if (f && typeof f.text === "string") texts[id] = f.text;
  }
  /* Every entry every run wrote, driven out of the plane rather than typed. */
  const allEntries = [];
  for (const r of [KILLED, SPENT, REFUSED]) {
    const l = await GET(`op=airunlog&token=${TOK}&run=${r}`);
    for (const e of l.entries || []) allEntries.push(e);
  }
  const res = leakage(texts, allEntries);
  console.log(`  corpus: ${res.corpus} bundle.md documents, ${res.needles} log sentences to look for`);
  t("ARM L1: the corpus is NON-EMPTY — an arm over no documents would pass without looking",
    res.corpus > 0, true);
  t("ARM L2: and there ARE log sentences to look for — a needle-free search finds nothing honestly "
    + "and proves nothing", res.needles > 4, true);
  t("ARM L3: no bundle.md in the store contains any observation the log holds", res.leaks, []);
  /* THE FUNCTION IS PROVED TO WORK. Without this, ARM L3 is a green light from
     an instrument nobody has shown can go red — the defect this repository has
     measured on a walk, a pin and a sourcing arm in one day. */
  t("ARM L4 (the instrument's own control): the SAME function, given a bundle text that does "
    + "contain a log sentence, FINDS IT — so L3 is a measurement and not a hope",
    leakage({ "INQ-fake": `## Summary\n\n${allEntries[0].detail}\n` }, allEntries).leaks.length, 1);
  /* AND THE OTHER DIRECTION: the log is not a TRANSCRIPT either (DEC-61). The
     plane holds no reasoning at all, and the strongest form of that claim is
     that there is nowhere to put one. */
  t("ARM L5 (DEC-61): no table this item adds has a transcript, reasoning or message column",
    [...readFileSync(fileURLToPath(new URL("../src/schema.mjs", import.meta.url)), "utf8")
      .matchAll(/CREATE TABLE IF NOT EXISTS (ai_\w+) \(([^;]*?)\)/g)]
      .filter((m) => /transcript|reasoning|message|prompt|completion/i.test(m[2])).map((m) => m[1]), []);
}

/* ------------------------------------------------------------------------- *
 *  ARM P · RESUMPTION (§14b.7) and the GATE (D-15).
 * ------------------------------------------------------------------------- */
console.log("\n--- ARM P · a run RESUMES from its own state and log, and the reads are gated ---");
const RESUMED = "RUN-2026-0807-resumed";
{
  await POST(`op=airunopen&token=${TOK}`, {
    run: RESUMED, contextType: "inquiry", contextId: BUNDLE,
    principalClaude: "project", skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 50 }],
    state: { queue: ["a", "b", "c"], done: [] }, leaseMs: 60000, at: T0 });
  await POST(`op=airuntick&token=${TOK}`, { run: RESUMED, at: at(T0, 1000), leaseMs: 60000,
    state: { queue: ["b", "c"], done: ["a"] }, consume: { fetches: 1 },
    log: [{ level: "document", subject: "observation:a", state: "PRESENT",
            detail: "the first document on the work list is in the store and was read" }] });

  /* THE RESUMPTION. A new invocation reads the run and its log, and continues
     from where the log says it stopped rather than restarting — which is the
     property that makes a death cheap and the reason §6's version identity
     matters operationally. */
  const seen = await GET(`op=airun&token=${TOK}&run=${RESUMED}`);
  const priorLog = await GET(`op=airunlog&token=${TOK}&run=${RESUMED}`);
  t("ARM P1: a resuming invocation reads the run and finds it still running", seen.session.status, "running");
  t("ARM P2: and reads its own log rather than restarting — the work already done is legible",
    priorLog.entries.map((e) => e.subject), ["observation:a"]);
  const resumed = await POST(`op=airuntick&token=${TOK}`, { run: RESUMED, at: at(T0, 30000), leaseMs: 60000,
    state: { queue: ["c"], done: ["a", "b"] }, consume: { fetches: 1 },
    log: [{ level: "document", subject: "observation:b", state: "LOOKED_ABSENT",
            detail: "the second document on the work list is not in the store and the source has none" }] });
  t("ARM P3: the resumed run CONTINUES — ticks accumulate rather than resetting", resumed.ticks, 3);
  t("ARM P4: and the lease moved out with it, so a live run is not reaped",
    resumed.expires, at(T0, 90000));
  const after = await GET(`op=airunlog&token=${TOK}&run=${RESUMED}`);
  t("ARM P5: the log is the union of both invocations, in order",
    after.entries.map((e) => e.subject), ["observation:a", "observation:b"]);
  t("ARM P6: the vocabularies travel WITH the answer, so a reader needs no copy of them (DEC-8)",
    Object.keys(after.vocabulary).sort(), ["bounds", "endings", "levels", "states"]);

  /* THE GATE, both polarities, driven at the Durable Object because that is
     where an ABSENT viewer stamp can be produced at all — the control plane
     always stamps one. D-15 fails closed. */
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const dget = async (p) => rP(await (await obj.fetch(`http://x/${p}`)).json());
  t("ARM P7 (gate, negative polarity): with NO viewer stamp the run is WITHHELD WHOLE and answers "
    + "exactly as an absent one — D-15 fails closed",
    (await dget(`airun?run=${RESUMED}`)).found, false);
  t("ARM P8 (gate, positive polarity): with a stamp it answers",
    (await dget(`airun?run=${RESUMED}&viewer=class:member`)).found, true);
  t("ARM P9: the log read is gated on the SAME column, both polarities",
    [(await dget(`airunlog?run=${RESUMED}`)).found,
     (await dget(`airunlog?run=${RESUMED}&viewer=class:member`)).found], [false, true]);
  t("ARM P10: and no count of the withheld is reported — a count is the disclosure",
    Object.keys(await dget(`airun?run=${RESUMED}`)).sort(), ["found", "run", "session"]);
}

/* ------------------------------------------------------------------------- *
 *  ARM U · THE UI-38 RIDER — the record PUBLISHES what the surface RENDERS.
 *
 *  Driven, not described: UI-38's real renderers are lifted out of app.html and
 *  fed the PLANE'S OWN ANSWER. A fixture would prove the renderers work on a
 *  shape somebody typed; this proves they work on the shape the record actually
 *  publishes, which is the only question the rider asks.
 * ------------------------------------------------------------------------- */
console.log("\n--- ARM U · UI-38's rider: publish what the running-session surface renders ---");
{
  const appPath = fileURLToPath(new URL("../../civicos-ui/app.html", import.meta.url));
  let app = "";
  try { app = readFileSync(appPath, "utf8"); } catch { app = ""; }
  /* NOT SKIPPED WHEN ABSENT. A control that quietly disappears when its subject
     moves is how a suite goes green over nothing; this fails and NAMES what it
     could not find. */
  t("ARM U0: UI-38's running-session surface is where the rider says it is", app.length > 0, true);
  const block = /\/\*__AI_SESSION_START__\*\/([\s\S]*?)\/\*__AI_SESSION_END__\*\//.exec(app);
  t("ARM U0b: and its marked block is readable", !!block, true);
  if (block) {
    console.log(`  corpus: ${block[1].length} chars of real renderer, lifted from app.html`);
    const ctx = { window: { addEventListener() {} }, localStorage: null, location: undefined,
                  esc: (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
                                       .replace(/>/g, "&gt;").replace(/"/g, "&quot;"),
                  $: () => null, JSON, Object, Array, console };
    ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(block[1] + ";globalThis.__A={aiSessionInContext,aiSessionIndicatorHtml,"
      + "aiSessionBudgetHtml,aiSessionPrincipalHtml,aiSessionConditionHtml,aiSessionPanelHtml};", ctx);
    const A = ctx.__A;
    const live = (await GET(`op=airun&token=${TOK}&run=${RESUMED}`)).session;
    const dead = (await GET(`op=airun&token=${TOK}&run=${KILLED}`)).session;

    t("ARM U1: the surface can tell the run is in the context of the object in view, from what the "
      + "record published and nothing else",
      A.aiSessionInContext(live, { type: "inquiry", id: BUNDLE }), true);
    t("ARM U1b: and is not, for a different object", A.aiSessionInContext(live, { type: "inquiry", id: "INQ-other" }), false);
    const ind = A.aiSessionIndicatorHtml(live, { type: "inquiry", id: BUNDLE });
    t("ARM U2: the INDICATOR renders, carrying the record's own label", ind.includes("sewer fund"), false);
    t("ARM U2b: the live run publishes no label, so the indicator carries the dot and the address "
      + "and no sentence at all", ind.includes('class="dot"') && ind.length > 0, true);
    const budget = A.aiSessionBudgetHtml(live);
    t("ARM U3 (F11): the BUDGET renders from what the record published", budget.includes("allowed"), true);
    t("ARM U3b: and its LIVE CONSUMPTION beside it", budget.includes("consumed"), true);
    /* F11's pin is over RENDERED OUTPUT: a percentage introduced by ANY route
       fails. This is the plane's half of it — the record must not publish one
       either, or the surface renders arithmetic without doing any. */
    t("ARM U4: nothing the record published renders as a percentage or a remainder",
      /%|remaining|nearly|left\b/i.test(budget), false);
    const who = A.aiSessionPrincipalHtml(live);
    t("ARM U5 (§14a): WHICH LEVEL of the Claude-account cascade pays is rendered", who.includes("project"), true);
    t("ARM U5b: BESIDE the plane-credential principal — two principals, never one (DEC-27(b))",
      who.includes("class:member") || who.includes("member:"), true);
    t("ARM U5c: and NO TOKEN VALUE is anywhere in it",
      /mem-is6|adm-is6|prb-is6/.test(who + budget + ind), false);
    const cond = A.aiSessionConditionHtml(dead);
    t("ARM U6: the CONDITION when a bound stops the run renders, verbatim", cond.includes("lease"), true);
    const panel = A.aiSessionPanelHtml(dead, null);
    t("ARM U7: the whole panel assembles from the record with no device transcript (DEC-61)",
      panel.includes("ai-panel") && panel.includes("lease"), true);
    /* AND THE SUPPORTED ABSENCE. Publishing nothing is a state, not a gap. */
    t("ARM U8: where no run exists the plane publishes `session: null` and the surface renders NO "
      + "INDICATOR — not an invented \"nothing is running\"",
      [(await GET(`op=airun&token=${TOK}&run=RUN-does-not-exist`)).session,
       A.aiSessionIndicatorHtml(null, { type: "inquiry", id: BUNDLE })], [null, ""]);
  }
}

/* ------------------------------------------------------------------------- *
 *  ARM X · finishedBound is ONE function, and the reaper holds no copy of it.
 * ------------------------------------------------------------------------- */
console.log("\n--- ARM X · one bound function, not two that agree ---");
{
  t("ARM X1: an exhausted bound beats the lease — a run that overspent and then died was stopped by "
    + "the budget, and reporting the lease would name the symptom and hide the cause",
    finishedBound([{ bound: "fetches", allowed: 3, consumed: 3 }], { expired: true }), "fetches");
  t("ARM X2: a lapsed lease with nothing exhausted is `lease`", finishedBound([], { expired: true }), "lease");
  t("ARM X3: nothing exhausted and nothing expired is not a stop at all",
    finishedBound([{ bound: "fetches", allowed: 3, consumed: 1 }], { expired: false }), "completed");
  t("ARM X4: an OFFERED bound wins, because a caller that knows why it stopped is better evidence "
    + "than an inference", finishedBound([], { expired: true, offered: "cancelled" }), "cancelled");
  t("ARM X5: a bound with no allowance cannot be `exhausted` by a zero — an equality that costs "
    + "nothing to produce is not evidence",
    finishedBound([{ bound: "fetches", allowed: 0, consumed: 0 }], { expired: false }), "completed");
  /* THE STRUCTURAL HALF: the reaper must not compute a bound of its own. */
  /* CORRECTED ON FIRST RUN and recorded: this arm first sliced to `aiRunRead({`
     and so swallowed that method's DOC COMMENT, which legitimately discusses
     `allowed` and `consumed` — the arm was reading prose as code and failing on
     it. A slice that includes commentary is not a slice of the implementation,
     and the wrong direction of that mistake (passing over prose) is how an arm
     goes green on a body it never read. It now ends at the method's own closing
     brace. */
  const reapFrom = STORE_SRC.indexOf("  #aiRunReap(now) {");
  const reapTo = STORE_SRC.indexOf("\n  }\n", reapFrom);
  const reaper = STORE_SRC.slice(reapFrom, reapTo);
  console.log(`  corpus: ${reaper.split("\n").length} lines of reaper body`);
  t("ARM X6a: the reaper body is locatable and non-trivial", reapFrom > -1 && reaper.split("\n").length > 5, true);
  t("ARM X6: the reaper contains no arithmetic over bounds — it supplies a clock and takes the "
    + "one function's answer", /allowed|consumed|>=/.test(reaper), false);
  t("ARM X7: and there is exactly ONE call site deciding which bound stopped a run",
    [...STORE_SRC.matchAll(/finishedBound\(/g)].length, 2);
}

} finally {
  await mf.dispose();
}

console.log(`\nairun: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
