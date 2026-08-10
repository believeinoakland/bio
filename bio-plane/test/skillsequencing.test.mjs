/* NEGATIVE CONTROL: SIX arms, declared here and run in one step by `node test/skillsequencing.control.mjs [arm]` from `bio-plane/` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (`suggest.control.mjs`'s precedent, SK-2's and SK-3's shape). Each arm is armed ALONE with the others held open, each DECLARES BEFORE IT RUNS what must fail AND what must stay green, and every restore is verified BY CONTENT as well as by sha256 against a uniquely-named per-arm pristine copy. The arms and their measured results are recorded here after the run:
   (0) BASELINE, clean tree: 26 pass, 0 fail. Not decoration — it is what distinguishes six-arms-working from six-arms-broken, and the harness REFUSES to run an arm over a red baseline.
   (1) **THE ROW'S OWN, AND THE ITEM'S POINT — REMOVE FL-3's GATE.** `nextStep`'s `gate-mode` branch in `agent-worker/src/harness.mjs` stops reading the `deployed` flag, and NOT ONE WORD OF THE SKILL CHANGES -> 21 pass, 5 FAIL: ARM D1, D2, D3, D4, D5 — the whole of BLOCK D and nothing else. **TEN SKILL-SIDE ARMS WERE NAMED AND ALL TEN STAYED GREEN — A1, A2, A3, A4, A5, C1, C2, C3, F1, F2 — while the gate was gone.** The sequencing is still recorded, still verbatim, still cites the row, and still refuses nothing. **That asymmetry IS the row's proof: what refuses an investigate-mode launch is FL-3's table and not this text**, and `mustStayGreen` (SK-3's addition) asserts the green side rather than observing it. DECLARED AS THREE AND MEASURED AS FIVE, and the two extra are kept: D2 is the DISCRIMINATION (with no gate, the deployed and the undeployed mode answer alike) and D5 is the terminator (no gate, no `cancelled` to pin). Under-declaring them would have credited the arm with less than it does.
   (2) THE FLAG FLIPPED WITHOUT THE RECORD MOVING — `MODES.investigate.deployed` set to `true` in the landed harness, `DEPLOYMENT_SEQUENCE.verification_recorded` left `null` -> 21 pass, 5 FAIL: ARM B4 (the tripwire, naming the flip) and D1, D2, D4, D5 (the gate genuinely opens). **This is the arm the item exists to make impossible to do quietly**, and it is the shape a real VF-4 enablement will take — when it fires legitimately, the record moves in the same commit as the flag and all five go green again. It is the arm to run before believing any future enablement.
   (3) THE ORDER REVERSED IN THE RECORD ONLY — `order` written `["investigate", "check"]` and `first_deployed_mode` left alone -> 23 pass, 3 FAIL: ARM A3, ARM A4 and ARM B4. **A3 and A4 are why the DOCUMENT is the expectation**: each parses the first-deployed mode out of a DIFFERENT document's own sentence, so neither can be satisfied by editing the array they are checked against. Written the blind way — "`order[0]` equals `first_deployed_mode`" — both sides would have moved together and this arm would have proved nothing, which is exactly what SK-2's arm (5) and SK-3's arm (3) each found inside their own suites. **THIS ARM ALSO FOUND A DEFECT IN THIS SUITE, and it is the second finding of the same class in one item:** ARM E3 perturbed the pack by writing the LITERAL `["investigate", "check"]`, which is precisely what this arm makes the real value — so the perturbation became a no-op and E3 failed for a reason unrelated to the digest it measures. An arm whose fixture can COINCIDE with its subject is measuring the coincidence. E3 now appends a sentinel and differs whatever the real order says.
   (4) A MODE ADDED TO THE HARNESS AND NOT RECORDED — a third `MODES` entry lands in FL-3's table -> 24 pass, 2 FAIL: ARM B3 (the set, held in BOTH directions — the one-directional form "every recorded mode exists in the table" is blind to this by construction) and ARM B4 (the partition moves with it).
   (5) A GATE WRITTEN INTO THE DOCTRINE — a `MODES`-shaped table, a `deployed` flag and a refusing branch added to `src/skilldoctrine.mjs` -> 25 pass, 1 FAIL: ARM C3, the discrimination, which stops reading as a discrimination the moment both files answer alike. §14b.4 does not exempt a deployment record from the rule that a skill may never hold a gate. ARM C3b stayed GREEN, which is what says the detector was working rather than merely unhappy.
   (6) THE INSTRUMENT ITSELF — neuter the gate detector so it matches nothing, sources untouched -> 24 pass, 2 FAIL: **ARM C3 AND ARM C3b TOGETHER**, which is the whole reason they are a pair. C3 alone would have gone quiet (a doctrine reported as holding no gate is exactly what a blind detector reports), and C3b is what turns that silence into a failure. A detector that finds nothing passes every corpus, and this repository has measured that shape more than once. */
/* SK-4 — CHECK DEPLOYS FIRST. THE SUITE.
 *
 * `IS-BUILD-PLAN.md` SK-4; `INVESTIGATIVE-SESSION.md` §2 and §14b.4;
 * `docs/archive/IS-SWEEP-2026-08-07.md` §4b item 7; DEC-24 and DEC-55. The
 * subject is the `DEPLOYMENT_SEQUENCE` half of `src/skilldoctrine.mjs`, merged
 * into SK-1's pack by `src/skillpack.mjs`.
 *
 * WHAT THIS SUITE IS FOR, IN ONE SENTENCE. The row's constraint is that **SK-4
 * RECORDS the sequencing and the gate is a row in FL-3's landed table** — so the
 * thing to measure is not whether a gate exists (FL-3 already proved that) but
 * whether the RECORD and the GATE still say the same thing, and whether the
 * record has quietly grown a second gate of its own.
 *
 * THE TWO INSTRUMENTS, AND EACH IS RUN ON A FIXTURE THAT MUST TRIP IT:
 *
 *   - A LOOKUP. Every authored span is looked up in the document it was copied
 *     from, through SK-1's normaliser — because a session cannot verify its own
 *     copying by re-reading it. ARM A2 proves the lookup can MISS.
 *   - A DEREFERENCE. `GATE_ADDRESS` names a file, four exports and a row KEY,
 *     and this suite resolves that address against the LANDED module rather than
 *     against anything the doctrine says about it.
 *
 * **THE DOCUMENT IS THE EXPECTATION, NEVER THE ARRAY — and this is carried from
 * two predecessors that each found the same defect in their own work.** SK-2's
 * arm (5) and SK-3's arm (3) each found an assertion blind by construction: an
 * expected set derived from the subject under test, so both sides moved together
 * and the arm proved nothing. Applied here, the temptation is obvious and would
 * have been invisible: `order[0] === first_deployed_mode` is an equality that
 * costs nothing to produce. ARM A3 and ARM A4 therefore PARSE the first-deployed
 * mode out of two different documents' own sentences, and ARM B3/B4 hold the
 * order against FL-3's landed flags in BOTH directions. Nothing in BLOCK A or
 * BLOCK B takes its expectation from the object it is checking.
 *
 * WHAT IS DRIVEN AND WHAT IS NOT, STATED SO NEITHER IS READ AS AN OVERSIGHT.
 * Most subjects here are source-level facts: a span of a document, an export of
 * a landed module, the return of a PURE function (`nextStep` is pure by FL-3's
 * own declaration — *"same state in, same step out, every time"*). BLOCK E is
 * driven through the CONTROL PLANE, because the pack is rendered against
 * `op=affordances`' published vocabulary and a suite that called `renderPack`
 * with a hand-made argument would be asserting its own fixture. **There is no
 * op that gates a MODE** — that is BLOCK F's finding about the record, measured
 * rather than assumed, and it is why BLOCK D drives the fleet member's table
 * instead of an endpoint.
 *
 * THE LIMIT IS PRINTED EVERY RUN, IN BLOCK G, and nothing below claims anything
 * about a live run. SK-2 set that pattern with its unsampled-run limit and it is
 * the pattern followed here.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import "./stdio.mjs";   /* D-282: a suite's own exit must not discard the suite's own output */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import * as CATALOGUE from "../checks/bio-checks.mjs";

/* THE ESTATE'S ONE LEXER, IMPORTED AND NOT COPIED — `declared-source.mjs`'s own
   header records why a third reader of this shape would be a defect.
 *
 * IT IS CALLED IN THE STRINGS-BLANKED MODE, AND THAT IS A NARROWING THIS SUITE
 * MADE AFTER ITS OWN DETECTOR FIRED ON ITS OWN DOCTRINE — the narrowing is the
 * finding rather than a repair, exactly as SK-2 recorded for its scanner. Run
 * with strings KEPT (`codeOnly`'s mode, which is right for `declared-source`'s
 * own subject because a check id LIVES in a string), the gate detector reported
 * TWO of its three shapes inside `skilldoctrine.mjs` — every one of them from
 * the record's own authored prose, which necessarily uses the words `mode` and
 * `deployed` to say where the gate is. **A doctrine module's authored text lives
 * in STRING LITERALS, so a detector that reads strings is reading prose and not
 * implementation**, and it would have pushed the next author to describe the
 * fence around its own vocabulary. `strip(src, { strings: true })` is the same
 * estate lexer in the mode this subject needs; a `deployed: true` flag and a
 * `MODES` table are object literals and survive it, which is what ARM C3 then
 * measures in the harness. */
import { strip } from "../scripts/walkfloor.mjs";
import { renderPack, packVersion } from "../src/skillpack.mjs";
import { RUN_ENDINGS, RUN_BOUNDS } from "../src/airun.mjs";
import { DEPLOYMENT_SEQUENCE, GATE_ADDRESS, SEQUENCING_SOURCE,
         SEQUENCING_ALSO_NAMED_IN, CLAUSES, PROHIBITIONS,
         controlFlowAuthority, judgementLayers } from "../src/skilldoctrine.mjs";

/* FL-3's LANDED TABLE, IMPORTED BY THE SUITE AND NEVER BY THE DOCTRINE. The
   plane's Worker must not bundle a fleet member (`harness.mjs`'s own reasoning
   for pinning `LEVELS` rather than importing `airun.mjs`, inverted); a SUITE has
   no bundle and may read both sides, which is what makes the source pin
   checkable at all. */
import * as HARNESS from "../../agent-worker/src/harness.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const readRepo = (p) => readFileSync(join(REPO, p), "utf8");
const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-sk4", MEMBER_TOKEN: "mem-sk4", PROBE_TOKEN: "prb-sk4",
              VERSION: "test", TASK_DRAIN_DELAY_MS: "600000" },
});
const TOK = "mem-sk4";
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/** Markdown normalised to one line — SK-1's normaliser, unchanged, so a quoted
 *  span can be looked for in the document it was quoted from. */
function flatten(md) {
  return md.split("\n").map((l) => l.replace(/^[\s>]*[-*]?\s*/, "")).join(" ")
           .replace(/[*_`]/g, "").replace(/\s+/g, " ");
}

/** THE GATE DETECTOR. ONE function, run over BOTH files' code halves, so the
 *  discrimination in ARM C3 is a measurement and not two different opinions.
 *
 *  IT IS A BOUNDARY, NOT A PROSE JUDGE, and the limit is worth stating: it looks
 *  for the three things a mode gate cannot be built without — a mode vocabulary
 *  keyed by name, a `deployed` predicate, and a branch that refuses on it. A
 *  gate written in some fourth shape would slip past it, which is why ARM C3 is
 *  a DISCRIMINATION between two real files rather than a clean-bill-of-health
 *  over one. A detector that finds nothing passes every corpus. */
const GATE_SHAPES = [
  { name: "a deployed flag", re: /\bdeployed\s*[:=]/ },
  { name: "a mode vocabulary", re: /\bMODES\b\s*=|\bMODES\s*\[/ },
  { name: "a refusal branch on a mode", re: /\bmode\b[^\n]{0,60}\bdeployed\b|\bdeployed\b[^\n]{0,60}\bmode\b/ },
];
function gateShapes(source) {
  const code = strip(source, { strings: true });
  return GATE_SHAPES.filter((g) => g.re.test(code)).map((g) => g.name);
}

const DESIGN = flatten(readRepo(SEQUENCING_SOURCE));
const SWEEP  = flatten(readRepo(SEQUENCING_ALSO_NAMED_IN));
const DOCTRINE_SRC = readRepo("bio-plane/src/skilldoctrine.mjs");
const HARNESS_SRC  = readRepo(GATE_ADDRESS.file);
const SCHEMA_SRC   = readRepo("bio-plane/src/schema.mjs");
const CHECKS_SRC   = readRepo("bio-plane/checks/bio-checks.mjs");

/* ==========================================================================
   BLOCK A — THE SEQUENCING IS RECORDED, AND IT IS THE DOCUMENTS' SEQUENCING.
   ======================================================================== */
console.log("\nBLOCK A — the ruling, looked up in the two documents that carry it");

const SPANS = {
  text: DESIGN, role: DESIGN, because: DESIGN, satisfies: DESIGN,
  also_named_in: SWEEP,
};
const missing = Object.entries(SPANS)
  .filter(([k, doc]) => !doc.includes(DEPLOYMENT_SEQUENCE[k]))
  .map(([k]) => k);
console.log(`  corpus: ${Object.keys(SPANS).length} authored span(s) looked up across 2 document(s) `
          + `(${DESIGN.length} and ${SWEEP.length} normalised characters)`);

t("ARM A1: every authored span of the deployment record is VERBATIM in the document it names — "
  + "four in the design's §2, one in the sweep's §4b item 7. A paraphrase fails here, and nothing "
  + "else in this suite can see one",
  missing, []);

t("ARM A2: THE LOOKUP CAN MISS — the SAME normaliser and search over a sentence that is not in "
  + "either document returns false. Without this, ARM A1 could be passing over a search that "
  + "matches anything",
  [DESIGN.includes("INVESTIGATE IS THE FIRST DEPLOYED MODE"),
   SWEEP.includes("deploy the fresh-investigation mode first")],
  [false, false]);

/* THE DOCUMENT IS THE EXPECTATION. Both arms below derive the mode NAME from a
   document's own sentence; neither reads `order` or `first_deployed_mode` to
   decide what it expects. */
const fromDesign = (DESIGN.match(/\b([A-Z]{3,})\s+IS\s+THE\s+FIRST\s+DEPLOYED\s+MODE\b/) || [])[1];
const fromSweep  = (SWEEP.match(/\b([A-Z]{3,})\s+is\s+the\s+investigative\s+session's\s+first\s+DEPLOYED\s+MODE\b/) || [])[1];

t("ARM A3 (THE DESIGN DOCUMENT IS THE EXPECTATION): §2's own sentence is PARSED for the name of "
  + "the first deployed mode, and the record's `first_deployed_mode` and `order[0]` must both be "
  + "it. Derived from the document, never from the array — the blind form of this arm reads "
  + "`order[0] === first_deployed_mode`, which both sides satisfy at zero cost",
  [fromDesign, (fromDesign || "").toLowerCase() === DEPLOYMENT_SEQUENCE.first_deployed_mode,
   (fromDesign || "").toLowerCase() === DEPLOYMENT_SEQUENCE.order[0]],
  ["CHECK", true, true]);

t("ARM A4 (AND A SECOND DOCUMENT, PHRASING IT DIFFERENTLY): the sweep's §4b item 7 is parsed for "
  + "the same fact and must yield the same mode. One pin proves a sentence was copied; two prove "
  + "the RULING is the one both surfaces carry, so a sequencing reversed on either fails here "
  + "rather than in a review nobody re-runs",
  [fromSweep, (fromSweep || "").toLowerCase() === DEPLOYMENT_SEQUENCE.order[0]],
  ["CHECK", true]);

t("ARM A5: the record names WHO owns the enabling condition and does not claim it. VF-4 waits on "
  + "DS-4, which is DIST's lane — a record that read as though this area could enable the second "
  + "mode would be claiming ground it has none of",
  [/VF-4/.test(DEPLOYMENT_SEQUENCE.enabling_condition_owned_by),
   /DS-4/.test(DEPLOYMENT_SEQUENCE.enabling_condition_owned_by),
   DEPLOYMENT_SEQUENCE.verification_recorded],
  [true, true, null]);

/* ==========================================================================
   BLOCK B — THE ADDRESS DEREFERENCES, AND THE RECORD MATCHES THE LANDED TABLE.
   ======================================================================== */
console.log("\nBLOCK B — the gate's address resolved against FL-3's landed module");

t("ARM B1: every export `GATE_ADDRESS` names exists in the landed harness. This is the SOURCE PIN "
  + "that replaces an import the plane's bundle must not have — a row renamed or an export dropped "
  + "in FL-3's lane fails HERE rather than leaving a doctrine citation pointing nowhere",
  [typeof HARNESS[GATE_ADDRESS.modes_export], typeof HARNESS[GATE_ADDRESS.table_export],
   typeof HARNESS[GATE_ADDRESS.first_step_export], typeof HARNESS[GATE_ADDRESS.decision_function],
   Object.prototype.hasOwnProperty.call(HARNESS.CONTROL_FLOW, GATE_ADDRESS.row)],
  ["object", "object", "string", "function", true]);

t("ARM B2: the gate is the FIRST row every run takes, read from the harness's own `FIRST_STEP`. "
  + "The record's `why_it_is_first` — that a run in an undeployed mode terminates before it has "
  + "spent anything — is only true while this holds, so it is measured and not assumed",
  [HARNESS.FIRST_STEP, HARNESS.FIRST_STEP === GATE_ADDRESS.row,
   HARNESS.CONTROL_FLOW[GATE_ADDRESS.row].judged],
  ["gate-mode", true, null]);

const recorded = [...DEPLOYMENT_SEQUENCE.order].sort();
const landed = Object.keys(HARNESS.MODES).sort();
console.log(`  corpus: ${landed.length} mode(s) in the landed table (${landed.join(", ")}) · `
          + `${DEPLOYMENT_SEQUENCE.order.length} recorded in the sequencing`);

t("ARM B3: the recorded modes and the landed table's modes are the SAME SET, held in BOTH "
  + "directions. A mode added to FL-3's table and not recorded fails here; a mode recorded and not "
  + "in the table fails here. The one-directional form is blind to the first case by construction",
  [recorded, landed], [landed, recorded]);

/* THE TRIPWIRE. It is meant to fire the day the flag flips, and the label says
   what to do when it does. */
const deployedNow = Object.entries(HARNESS.MODES).filter(([, m]) => m.deployed).map(([k]) => k).sort();
const notDeployed = Object.entries(HARNESS.MODES).filter(([, m]) => !m.deployed).map(([k]) => k).sort();

t("ARM B4 (THE TRIPWIRE, AND IT IS MEANT TO FIRE): index 0 of the recorded order is the ONLY mode "
  + "the landed table has deployed, every later index is not deployed, and `verification_recorded` "
  + "is null exactly while that is so. WHEN VF-4 VERIFIES CHECK'S FIRST LIVE RUN AND FL-3 FLIPS "
  + "`investigate.deployed`, THIS ARM GOES RED UNTIL THE RECORD MOVES IN THE SAME COMMIT — which "
  + "is the point: a deployment that changed the order without changing the record is exactly what "
  + "this row exists to make impossible to do quietly",
  [deployedNow, notDeployed,
   DEPLOYMENT_SEQUENCE.verification_recorded === null],
  [[DEPLOYMENT_SEQUENCE.order[0]], DEPLOYMENT_SEQUENCE.order.slice(1).sort(), true]);

t("ARM B5: the second mode enables by an EDIT UNDER REVIEW and the record says so. A mode a "
  + "request parameter could enable would be a gate the caller holds, and the landed table's own "
  + "flags are literal booleans rather than anything read from a request",
  [/EDIT to the landed table under review/.test(DEPLOYMENT_SEQUENCE.enables_how),
   /deployed:\s*true/.test(HARNESS_SRC), /deployed:\s*false/.test(HARNESS_SRC)],
  [true, true, true]);

/* ==========================================================================
   BLOCK C — THE GATE IS NOT HERE, AND THAT IS MEASURED RATHER THAN ASSERTED.
   ======================================================================== */
console.log("\nBLOCK C — a skill may never hold a gate, measured over the doctrine's CODE half");

const authoredFields = ["text", "role", "because", "satisfies", "also_named_in",
                        "enabling_condition", "enabling_condition_owned_by", "enables_how",
                        "does_not_reach", "holds_no_gate"];
const tripped = authoredFields
  .map((f) => [f, controlFlowAuthority(String(DEPLOYMENT_SEQUENCE[f] ?? ""))])
  .filter(([, hits]) => hits.length)
  .map(([f, hits]) => `${f}: ${hits.join(", ")}`);
const gateAddressText = Object.values(GATE_ADDRESS).map(String).join(" ");

t("ARM C1: no authored field of the deployment record carries control-flow authority, measured "
  + "with SK-2's EXPORTED scanner — never a second scanner, which would be measuring its own "
  + "opinion. The gate's own address text is scanned too: naming a gate is permitted, holding one "
  + "is not",
  [tripped, controlFlowAuthority(gateAddressText)], [[], []]);

t("ARM C2: THE SCANNER STILL WORKS — the same function over a fixture that must trip it. Without "
  + "this, ARM C1 is a walk that reads nothing and passes everything, which is the shape every "
  + "blind check in this repository has had",
  controlFlowAuthority("Run at most three passes, then stop the search when you are satisfied.").length > 0,
  true);

const doctrineShapes = gateShapes(DOCTRINE_SRC);
const harnessShapes = gateShapes(HARNESS_SRC);
console.log(`  MEASURED — doctrine, comments AND strings blanked: ${DOCTRINE_SRC.length} raw chars, `
          + `gate shapes ${JSON.stringify(doctrineShapes)}`);
console.log(`  MEASURED — harness,  comments AND strings blanked: ${HARNESS_SRC.length} raw chars, `
          + `gate shapes ${JSON.stringify(harnessShapes)}`);

/* THE NARROWING, PRINTED RATHER THAN LEFT SILENT. An exclusion nobody can see is
   the over-strict mirror of the defect the detector exists for, so what the
   strings-KEPT reading would have reported is shown beside what is asserted. */
const doctrineWithStrings = GATE_SHAPES
  .filter((g) => g.re.test(readRepo("bio-plane/src/skilldoctrine.mjs"))).map((g) => g.name);
console.log(`  NARROWING, STATED: reading the doctrine's STRINGS too would report `
          + `${JSON.stringify(doctrineWithStrings)} — every one of them from the record's own prose `
          + `about where the gate is. That is why the strings-blanked mode is the honest one here.`);

t("ARM C3 (THE DISCRIMINATION, AND IT IS THE ITEM'S WHOLE CONSTRAINT): the SAME detector over both "
  + "files finds ALL THREE gate shapes in FL-3's harness and NONE in this area's doctrine. Stated "
  + "as 'the skill holds no gate' this would be nearly unfalsifiable — a text file holds nothing — "
  + "so it is asserted as a difference between two real files, both measured, through one function",
  [doctrineShapes, harnessShapes.length],
  [[], GATE_SHAPES.length]);

t("ARM C3b: THE DETECTOR REACHES — a fixture holding a real mode gate trips all three shapes. A "
  + "detector that finds nothing passes every corpus, so ARM C3's empty result on the doctrine is "
  + "only worth something with this beside it",
  gateShapes('const MODES = { check: { deployed: true } };\n'
           + 'function go(s) { const mode = MODES[s.mode]; if (!mode.deployed) return "close"; }\n').length,
  GATE_SHAPES.length);

t("ARM C4: the doctrine cites the row by ADDRESS and holds no C-number for it, because there is "
  + "none to hold. `enforced_by` is empty and `enforced_by_row` resolves to the landed table",
  [DEPLOYMENT_SEQUENCE.enforced_by,
   DEPLOYMENT_SEQUENCE.enforced_by_row.startsWith(GATE_ADDRESS.file),
   DEPLOYMENT_SEQUENCE.enforced_by_row.includes(GATE_ADDRESS.row)],
  [[], true, true]);

/* ==========================================================================
   BLOCK D — THE PLAN ROW'S NEGATIVE CONTROL, RUN IN THE SUITE.

   The row reads: *"attempt an investigate-mode launch before CHECK's
   verification is recorded → the deployment gate refuses."* That is runnable
   TODAY, because `nextStep` is pure and the flag is landed — so it is RUN here
   every time rather than being left to the control harness alone.
   ======================================================================== */
console.log("\nBLOCK D — an investigate-mode launch, driven through FL-3's landed decision function");

const investigate = HARNESS.nextStep({ step: "gate-mode", mode: "investigate", pass: 0, maxPasses: 3 });
const check = HARNESS.nextStep({ step: "gate-mode", mode: "check", pass: 0, maxPasses: 3 });
const absent = HARNESS.nextStep({ step: "gate-mode", pass: 0, maxPasses: 3 });
const nonsense = HARNESS.nextStep({ step: "gate-mode", mode: "CHECK ", pass: 0, maxPasses: 3 });

t("ARM D1 (THE ROW'S NEGATIVE CONTROL): an investigate-mode launch attempted before CHECK's "
  + "verification is recorded is REFUSED — the run closes at the gate, and the reason it logs is "
  + "the sequencing itself rather than a budget or an error",
  [investigate.step, investigate.bound,
   /is not deployed/.test(investigate.why), /CHECK is the first deployed mode/.test(investigate.why)],
  ["close", "cancelled", true, true]);

t("ARM D2 (THE DISCRIMINATION, because a gate that refused everything would refuse nothing "
  + "meaningful): the SAME function on the SAME step with the deployed mode PROCEEDS. The refusal "
  + "costs something to produce, which is `CLAUDE.md`'s rule turned on this project's own gate",
  [check.step, check.bound ?? null, investigate.step === check.step],
  ["resume", null, false]);

t("ARM D3: the gate is not a denylist of one word — an ABSENT mode and a mode that is merely "
  + "mis-spelled are both refused. A gate that only knew the string `investigate` would pass every "
  + "future mode by default, which is the direction this failure runs in",
  [absent.step, absent.bound, nonsense.step, nonsense.bound],
  ["close", "cancelled", "close", "cancelled"]);

/* THE ORDERING CLAIM, MEASURED. The harness's own comment says the gate runs
   "before any bound is consulted"; a run that reported a budget instead would
   misname why it stopped, which §14b.6 exists to prevent. */
const investigateBroke = HARNESS.nextStep({
  step: "gate-mode", mode: "investigate", pass: 9, maxPasses: 3,
  budget: { fetches: { spent: 999, limit: 1 } },
});

t("ARM D4: the gate is reached BEFORE any bound. A run in an undeployed mode whose budget is also "
  + "exhausted still stops on the MODE — so a run that was never allowed to start can never be "
  + "reported as one that ran out of something",
  [investigateBroke.step, investigateBroke.bound, /is not deployed/.test(investigateBroke.why)],
  ["close", "cancelled", true]);

/* THE FINDING, ASSERTED SO IT CANNOT BE LOST. See BLOCK G and the DELEGATION. */
t("ARM D5 (A NAMED TRIPWIRE ON A FINDING, NOT AN ENDORSEMENT): the gate's refusal is recorded "
  + "under the ending `cancelled`, which the plane's own vocabulary defines as 'a member stopped "
  + "it' — a member did not. And `mode-not-deployed`, which FL-3's own header says a refused run "
  + "terminates on, is in NEITHER the plane's endings NOR its bounds. Both facts are measured here "
  + "so the misattribution is published rather than implied; WHEN FLEET CORRECTS IT THIS ARM GOES "
  + "RED AND MUST BE UPDATED WITH THE FIX, which is the only way a finding does not rot",
  [investigate.bound, RUN_ENDINGS[investigate.bound],
   Object.prototype.hasOwnProperty.call(RUN_ENDINGS, "mode-not-deployed"),
   Object.prototype.hasOwnProperty.call(RUN_BOUNDS, "mode-not-deployed"),
   HARNESS_SRC.includes("mode-not-deployed")],
  ["cancelled", "a member stopped it", false, false, true]);

/* ==========================================================================
   BLOCK E — THE PACK CARRIES IT, AND THE VERSION MOVES WHEN IT MOVES.
   ======================================================================== */
console.log("\nBLOCK E — the record reaches SK-1's pack through SK-2's spread, with no edit in the pack");

const layers = judgementLayers();
/* RENDERED AGAINST THE PLANE'S OWN PUBLISHED VOCABULARY, read through the
   control plane (D-43): `op=affordances` is reached with its literal written out
   so `scripts/coverage.mjs` credits it. `renderPack` REFUSES an empty vocabulary
   by design, so a hand-made argument here would be a fixture asserting itself. */
const pack = renderPack(await GET(`op=affordances&token=${TOK}`), CATALOGUE);
const packJson = JSON.stringify(pack);

t("ARM E1: the deployment record is a disclosed layer, it reaches the PACK, and it carries the "
  + "gate's ADDRESS rather than the gate's answer — a run reading this layer learns where the fence "
  + "is instead of being told what it says",
  [Object.prototype.hasOwnProperty.call(layers, "deployment_sequence"),
   packJson.includes(GATE_ADDRESS.file), packJson.includes(GATE_ADDRESS.row),
   packJson.includes(DEPLOYMENT_SEQUENCE.text)],
  [true, true, true, true]);

t("ARM E2: the layer declares its sourcing as authored and states in the pack itself that it is "
  + "INSTRUCTION holding no flag. A layer that read like a fence beside six that are honest about "
  + "themselves is the defect §14b.4 names wearing a citation",
  [layers.deployment_sequence.sourcing,
   /holds no flag/.test(layers.deployment_sequence.body.note),
   /INSTRUCTION/.test(layers.deployment_sequence.body.note)],
  ["authored", true, true]);

/* THE VERSION MOVES WHEN THE RECORD MOVES, measured by MOVING it — SK-3's ARM E
   shape. A version asserted to be "computed over the content" without a
   perturbation is an equality that costs nothing to produce.
 *
 * THE PERTURBATION IS GUARANTEED DIFFERENT, AND THAT IS A CORRECTION MADE BY
 * RUNNING THE CONTROL. It was first written as `order = ["investigate", "check"]`
 * — a LITERAL — so control arm (3), which reverses the real order to exactly
 * that, made the perturbation a NO-OP and this arm failed for a reason that had
 * nothing to do with the digest. An arm whose fixture can coincide with its
 * subject is measuring the coincidence. It now appends a sentinel, so the
 * perturbed pack differs from the real one whatever the real one says. */
const moved = JSON.parse(JSON.stringify(pack));
moved.disclosed.deployment_sequence.body.sequence.order =
  [...moved.disclosed.deployment_sequence.body.sequence.order, "a-mode-no-table-holds"];

t("ARM E3: the pack's VERSION is a digest over what it RENDERS, so this record moved it with "
  + "nobody bumping anything — measured by perturbing the rendered order and watching the version "
  + "change. A version that did not move would mean two different packs answering to one string",
  [typeof packVersion(pack), packVersion(pack) === packVersion(pack),
   packVersion(moved) !== packVersion(pack)],
  ["string", true, true]);

await mf.dispose();

/* ==========================================================================
   BLOCK F — THE TALLY, AND SK-4's BACKING IS A THIRD KIND.
   ======================================================================== */
console.log("\nBLOCK F — how much of this skill carries no code, and what kind of code the rest carries");

const instructionOnlyC = CLAUSES.filter((c) => c.enforced_by.length === 0);
const instructionOnlyP = PROHIBITIONS.filter((p) => p.enforced_by.length === 0);
const totalItems = CLAUSES.length + PROHIBITIONS.length + 1;
const totalInstructionOnly = instructionOnlyC.length + instructionOnlyP.length;
const cNumberBacked = CLAUSES.filter((c) => c.enforced_by.length > 0).length
                    + PROHIBITIONS.filter((p) => p.enforced_by.length > 0).length;

console.log(`  MEASURED — CLAUSES: ${instructionOnlyC.length} of ${CLAUSES.length} INSTRUCTION ONLY `
          + `(${instructionOnlyC.map((c) => c.id).join(", ")})`);
console.log(`  MEASURED — PROHIBITIONS: ${instructionOnlyP.length} of ${PROHIBITIONS.length} `
          + `INSTRUCTION ONLY (${instructionOnlyP.map((p) => p.id).join(", ") || "(none)"})`);
console.log(`  MEASURED — SK-4's RECORD: 1 item, backed by CODE THAT IS NOT A C-NUMBER `
          + `(${DEPLOYMENT_SEQUENCE.enforced_by_row})`);
console.log(`  MEASURED — THE SKILL AS A WHOLE: ${totalItems} doctrine items · `
          + `${totalInstructionOnly} carry no code at all · ${cNumberBacked} are backed by a `
          + `C-number · 1 is backed by a control-flow ROW. **The three are printed separately `
          + `because a control-flow row is code but is NOT a refusal at the record's edge, and `
          + `tallying it as one would overstate exactly the thing this row is about.**`);

t("ARM F1: SK-4 adds no instruction-only item and does not move SK-2's and SK-3's published "
  + "figures. The total rises by one and the uncoded count does not",
  [totalItems, totalInstructionOnly, instructionOnlyC.length, instructionOnlyP.length,
   DEPLOYMENT_SEQUENCE.enforced_by.length === 0 && DEPLOYMENT_SEQUENCE.enforced_by_row.length > 0],
  [16, 4, 3, 1, true]);

/* THE RESIDUE IS NOT MERELY STATED, IT IS RE-MEASURED. The record claims that
   `ai_runs.mode` is free text with no check over it; a claim like that is
   exactly the kind that is true when written and quietly false a month later. */
const modeColumn = /\n\s*mode\s+TEXT\s*,/.test(SCHEMA_SRC);
const modeCheckedAnywhere = /['"]?\bmode\b['"]?\s*(?:===|!==)\s*['"](?:check|investigate)['"]/.test(CHECKS_SRC)
                         || /AI_RUN_MODE/.test(CHECKS_SRC);

t("ARM F2 (THE RESIDUE, RE-MEASURED RATHER THAN BELIEVED): the record says the gate does not reach "
  + "the RECORD, because `ai_runs.mode` is free text with no vocabulary check and no C-number over "
  + "it. Both halves are measured against the landed schema and the landed catalogue every run — a "
  + "residue asserted once and never re-read is how a partial fence starts reading as a whole one",
  [modeColumn, modeCheckedAnywhere,
   /ai_runs\.mode/.test(DEPLOYMENT_SEQUENCE.does_not_reach),
   /a DEPLOYMENT/.test(DEPLOYMENT_SEQUENCE.does_not_reach)],
  [true, false, true, true]);

t("ARM F3: `does_not_reach` is present and substantial on this record, which is SK-3's standard "
  + "applied to an ENFORCED item — a partial fence read as a whole one is worse than an unenforced "
  + "rule read as unenforced, and this fence is more partial than most",
  [typeof DEPLOYMENT_SEQUENCE.does_not_reach, DEPLOYMENT_SEQUENCE.does_not_reach.length > 400,
   /holds_no_gate/.test(Object.keys(DEPLOYMENT_SEQUENCE).join(" "))],
  ["string", true, true]);

/* ==========================================================================
   BLOCK G — THE LIMIT. PRINTED EVERY RUN, SO IT CANNOT BECOME A CLAIM.
   ======================================================================== */
console.log("\nBLOCK G — WHAT THIS SUITE DOES NOT ESTABLISH, printed every run");
console.log(`  SK-4's accepts-when has TWO halves and only one of them is reachable at this commit.

  NOT REACHED — "the first live run in scratch targets a concluded inquiry". THERE IS NO LIVE
    RUN. That half is VF-4's, VF-4 waits on DS-4, and DS-4 is DIST's gated deploy in a different
    session. Nothing in this suite drives a deployed anything: every subject above is a document
    span, a landed export, or the return of a pure function. **No assertion here should be read
    as evidence that a run has ever executed in any mode**, and none is written so it could be.

  REACHED, AND ONLY IN THE STATIC SENSE — "the deployment record shows CHECK enabled before
    investigate". What EXISTS to be read today is the landed table's flags: CHECK deployed,
    investigate not. ARM B3/B4 hold the record to those flags in both directions and ARM B4 is
    the tripwire on the flip. What does NOT exist is a RELEASE NOTE, because nothing has been
    released — so "before" is verified as an ORDER THAT HOLDS rather than as a sequence of two
    observed deployments. Those are different claims and this suite makes only the first.

  AND THE GATE'S OWN REACH IS SMALL, WHICH IS BY DESIGN AND IS STILL A LIMIT (ARM F2 measures
    it): what refuses an undeployed mode is one row inside one fleet member's own control flow.
    The plane stores \`ai_runs.mode\` as free text and no C-number refuses a value, so a caller
    that never runs this harness is not gated by it at all.`);

console.log(`\nskillsequencing: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
