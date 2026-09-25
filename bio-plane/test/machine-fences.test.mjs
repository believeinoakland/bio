/* NEGATIVE CONTROL (M0-18, run 2026-08-09, worktree agent-a62aec7acd493144e): the
   provenance floor added to this file is armed by `test/provenance-floor.control.mjs`
   — COMMITTED, so it re-runs in one step. 58 of 58 checks as declared over eight arms,
   each armed ALONE with every other defence held open, every restore verified by sha256
   AND by a full byte comparison against a UNIQUELY-NAMED per-arm pristine copy with the
   byte count printed and floored. ARM 6 (three stages) is armed on this file and is a DIFFERENT exposure from the
   floors: a pin owed to an uncommitted file FAILS here and PASSES in the pre-M0-18 spelling.
   TWO ARMS CAME BACK WRONG FIRST AND BOTH FOUND DEFECTS IN THE HARNESS RATHER THAN IN
   THE SUBJECT — the harness pinned the very refusal codes its arm was about to test, and
   spelled an `op=` token that op-claims then read as a real claim. Recorded at their
   sites in the control, not smoothed.
   RE-RUN 2026-09-21 by D-355: 55 of 58 before any edit. ARM 6 stage 1 learned SEVEN codes where its literal said at
   least eight: at `ae0ae418` (2026-09-10, CASE-5) this file's 300-character identity window stopped reading
   `EDITION_NOT_INCREMENTED` in `publish` as an identity refusal, so seven of REC-78's eight pins stay load-bearing
   here. Stage 1 now asserts the set is non-empty and owned by the moved pinners, and 6b proves it complete.
   After: 59 of 59 control checks as declared, exit 0. */
/* NEGATIVE CONTROL (REC-189, block xiv, RUN 2026-09-24 over origin/main 3f4b8f8c, each arm ALONE on src/store.mjs's
   `is-machine-set-risk-tier` region, restored from a uniquely-named per-arm pristine copy and verified by sha256 AND cmp,
   2,953,960 bytes, floored; baseline 56 pass / 0 fail before and after, harness outside the shared scratchpad):
   (A) THE ROW'S CONTROL — the machine-identity clause neutered to `false` -> 52 pass, 4 FAIL, as declared: the pin
   "MACHINE_CANNOT_SET_RISK_TIER — the machine is refused BY NAME", "the record did not move under the machine's call",
   "…from undetermined the machine still cannot state 1", and block 3's "every one of them answered with its OWN name";
   the member arm and both carry-forward arms stayed GREEN. (B) THE LIAR the row names — refuse EVERY machine promote of
   an action (the tier clauses dropped) -> 54 pass, 2 FAIL, as declared: "a machine credential's revision that CARRIES
   THE MEMBER'S TIER FORWARD UNCHANGED lands" and "…stating the tier UNDETERMINED lands"; the pin and the member arm
   stayed green. (C) THE ROW'S WORDS READ LITERALLY — the identity clause DELETED, so the fence asks only whether the
   tier changed -> the suite DIES before its foot (tally -1): block (v)'s fixture, a signed-in MEMBER creating an action
   at tier 1, is refused and `mustPromote` throws. Declared as "the member path fails"; it failed at a fixture rather
   than at a named assertion, recorded as found. */
/* NEGATIVE CONTROL (BOB #32's ruling of 2026-09-24 01:44Z, paid by CONDUCT #19's c19-batch10 worker in the block now
   numbered xv, RUN 2026-09-24 on the merged tree, ONE arm ALONE on src/store.mjs's `is-machine-set-risk-tier` region,
   restored by cp from the uniquely-named pristine copy `store.pristine.nc-bob32.mjs` and verified by sha256
   (3b46f02f4c65…, 3,166,440 B) AND cmp: IDENTICAL, HASH-MATCH). Baseline 59 pass / 0 fail. Declared before arming: the
   drop arm MUST fail by name; the carry-forward, the never-set "leaves it undetermined" and "cannot state 1" arms, the
   pin and the member arm MUST NOT. (D) RE-ADMIT THE DROP — the `|| heldTierSet` disjunct removed, so a machine may again
   state `undetermined` over a member's tier -> 58 pass, 1 FAIL, AS DECLARED: "a machine credential's revision DROPPING
   A MEMBER'S TIER TO UNDETERMINED is refused by name, and the member's tier stands". Arms (A)–(C) above were run on the
   branch before the ruling; (B)'s second named arm ("…stating the tier UNDETERMINED lands") is the assertion the ruling
   CORRECTED, and "…from undetermined the machine still cannot state 1" now stands on a never-set tier. */
/* NEGATIVE CONTROL (D-503, block 3b's five arms, DECLARED IN `test/machine-fences.control.mjs` arms (6)-(10) and RUN
   2026-09-24 on branch land/worker/D-503 over origin/main 68fecb8d, each arm ALONE with every other defence held open,
   every restore verified by sha256 AND by content by the harness's own `restoreAll`; BASELINE 87 pass / 0 fail before
   each). **ALL FIVE BEHAVED AS DECLARED**, and the figures are the ones the harness PRINTED:
   (6) DROP THE `ai` FENCE AT op=caseratify -> 84/3 as declared: the MACHINE_CANNOT_RATIFY_CASE pin and its
       catalogue-sentence twin fail by name, and the set arm names the pair. Its `got` is the arm's content:
       `OPERATOR_TOKEN_CANNOT_RATIFY_CASE` — the act is DOUBLY FENCED, so "the case is NOT committed" stayed GREEN as
       declared. A control that had only asked "did anything land" would have read this edit as no effect at all.
   (7) DROP THE SESSION FENCE AT op=ratify -> 83/4 as declared, and the fourth failure is the reason the fence exists:
       "the finding is STILL not published" went RED — **a bearer token PUBLISHED the finding** (`got: true`). Nothing
       else stands between an operator's token and the published corpus. op=caseratify's arms and MACHINE_CANNOT_RATIFY
       stayed green. RECORDED RATHER THAN DECLARED, because the arm could not predict it: ruth's own call afterwards
       answers `RATIFY_FINDING_NOT_IN_A_RATIFIED_CASE` — the act she was going to perform had already been performed by
       a credential that is not her.
   (8) DROP THE GOVERNANCE FENCE -> 84/3 as declared, `got: NOT_AN_ADMIN`, and "nothing the bearer asked for landed"
       stayed GREEN — D-136's own argument arriving as a measurement: the `by` stamp behind the fence still refuses, with
       a sentence that is CORRECT AND FALSE (a token is not a person who failed to be an administrator).
   (9) OVER-STRICTNESS — the op=caseratify fence widened from the `ai` class to EVERY caller -> 82/5 as declared: BOTH
       member twins fail (ruth cannot commit her own signed bytes, and her ratification then fails behind it) and the
       OPERATOR pin fails because the bearer is now answered with the MACHINE's code — a fence lying about which caller
       it refused. The MACHINE pin stayed green, which is why only the member arm can tell a fence from a wall.
   (10) A SIXTH FENCE ARRIVES UNDRIVEN — one literal planted in `src/index.mjs` -> 86/1 as declared: 3b's equality alone
       fails, naming `MACHINE_CANNOT_ARRIVE_UNMEASURED`, and every pin stayed green (the arm moved no fence). This is the
       failure block 3b exists for and the one no instrument in this file could see before it.
   ONE ARM CAME BACK WRONG AND IT IS NOT D-503's — arm (2), the REGRESSION SENTINEL, pre-existing on origin/main
   68fecb8d and reported rather than smoothed. Its second assertion, "and NOTHING was declared by the machine's call",
   STAYED GREEN when the declaration says it must fail. **DIAGNOSED BY DRIVING, not by reading:** with the identity
   predicate neutered the machine's `op=strengthbar` answered
   `{ok:true, group:"biosmoke-rec73", capture:"B", connection:"C", author:"token:ai"}` — **the machine DID set the
   group's required evidentiary strength**, which is the exact fact the sentinel exists to catch. The assertion missed it
   because `barOf()` reads `group=believe-in-oakland` while the act, whose payload names no group, writes to the store's
   PRODUCING group (`#producingGroup()`, the INSTANCE_NAME binding `biosmoke-rec73`) — D-436's rule that "the default is
   the store's recorded group, never a literal" moved the write and nothing moved the read-back with it. So block (ix)'s
   guard and its read-back are BOTH passing over the wrong group, and the arm's declaration was RIGHT. THE FIX WAS
   NAMEABLE AND WAS NOT TAKEN HERE, because it was outside that row: name the group in the act's payload so the write
   and the read-back address the same one, then re-run the arm, which should then fail as declared. Reported to CONDUCT,
   placed by SCHEDULER, and **TAKEN 2026-09-24 BY D-509**, whose own declaration is the block below; the D-503 worker's
   diagnosis and its named fix were both confirmed by running them, and the paragraph above is left as it was written
   rather than rewritten into hindsight. */
/* NEGATIVE CONTROL (D-509, THE SENTINEL'S OWN ARM, RUN TWICE — the whole harness `test/machine-fences.control.mjs`,
   all ten arms, 2026-09-24 on branch land/worker/D-509 over origin/main e9b21be66, every restore verified by sha256
   AND by content by the harness's own `restoreAll`, baseline 87 pass / 0 fail before each arm).
   BEFORE THE FIX, MEASURED ON THIS TREE RATHER THAN TAKEN FROM THE ROW: ten arms run, ONE behaved differently from its
   declaration — the sentinel arm, whose second assertion "and NOTHING was declared by the machine's call" stayed GREEN
   with the identity predicate neutered; the harness exited 1. That reproduced D-503's report exactly.
   AFTER: ten arms run, ZERO behaved differently from their declaration, and the harness exited 0. The sentinel arm now
   takes down BOTH of the assertions it declares — the MACHINE_CANNOT_DECLARE pin AND the read-back — which is the whole
   of what this row bought: a machine getting past the refusal and a machine changing what the group requires of its own
   evidence are two facts, and only the second one was unpinned.
   WHAT MOVED, AND IT IS EXACTLY ONE FAILURE IN EXACTLY THE TWO ARMS THAT NEUTER THE IDENTITY PREDICATE: the item arm
   49 pass / 38 fail -> 48 pass / 39 fail, and the sentinel arm 56 pass / 31 fail -> 55 pass / 32 fail. Every other
   arm's printed figure is unchanged (85/2, 85/2, 87/0, 84/3, 83/4, 84/3, 82/5, 86/1), so the edit moved the sentinel
   and nothing else — the over-strictness arm's 87/0 is the direct evidence that naming the group refuses no correct work.
   AND THE RE-MEASUREMENT THIS ROW REQUIRED, BECAUSE A GROUP-WIDE BAR DECLARED MID-SUITE COULD HAVE GATED WHAT RUNS
   AFTER BLOCK ix: the whole suite reads 87 pass / 0 fail both before and after, and a line-for-line diff of the two
   runs' output moves TWO LABELS AND NO VERDICT. MOVE_VERSION, REVIEW, SET_LAWS and SET_RISK_TIER — and every member
   twin below them — are GREEN in both. The reading that agrees with the measurement, stated as the reading and not as
   the evidence: `group_strength_bar` has exactly two sites in `src/store.mjs`, this write and `strengthBarOf`'s read,
   and DEC-72 withdrew the group bar as a publication bar, leaving it the SEED a new project starts from.
   WHAT THIS BLOCK DOES NOT CLAIM: the arms were not re-derived, only re-run. Their declarations are unchanged and live
   in the harness; this block records what running them produced. */
/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/machine-fences.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3's, PL-4's and PL-11's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad, and every restore is verified BY sha256 AND BY CONTENT.
   ALL FIVE ARMS RUN 2026-08-08 IN WORKTREE agent-a75c0395e77e7eaed, every one behaving as declared, baseline 45/0 before each. Figures below are MEASURED.
   (1) NEUTER THE PREDICATE — `isMachineStamp` returns false in checks/bio-checks.mjs — and ALL TWELVE complete-payload arms FAIL NAMING THE MACHINE REFUSAL, not a payload complaint -> 15 pass, 30 FAIL. **AND HERE IS WHAT THE COMPLETE PAYLOAD BOUGHT, WHICH IS MORE THAN THE ITEM PREDICTED: TEN OF THE TWELVE ACTS THEN WENT ALL THE WAY THROUGH.** The machine RELEASED a collected document to `verified`, CONCLUDED a question, REOPENED one, PUBLISHED a case at edition 1, MOVED an action, wrote a CORRESPONDENCE entry at ord 0, DIVIDED a question into two children, GROUPED a basis, SET THE GROUP'S REQUIRED EVIDENTIARY STRENGTH (`author: token:ai` in the row, read back), and ACCEPTED a reading. Under PL-11's payloads the same edit produced ONE success and eleven payload complaints; under these it produces ten. **THE TWO THAT DID NOT: `taskforward` and `taskresolve`, both answering `NOT_YOURS` — REC-4's assignee fence catching what the machine fence let past.** Those two verbs are the only pair in the family with a SECOND independent fence behind the first, and nobody knew that until the arm was run with a payload good enough to reach it.
   (2) THE SENTINEL, ISOLATED — short-circuit `isMachineIdentity` for `token:` instead -> 17 pass, 28 FAIL, and `MACHINE_CANNOT_DECLARE` falls with it. It is the one act PL-11 measured going ALL THE WAY THROUGH, so it is the regression sentinel; the arm takes down BOTH its pin and the read-back that finds the bar declared, because a machine getting past a refusal and a machine changing what the group requires of its own evidence are two different facts.
   (3) THE SWEEP MUST BE ABLE TO GO BLIND AND SAY SO — make the identity predicate match nothing -> **43 pass, 2 FAIL, RE-MEASURED 2026-08-08 BY REC-78 IN WORKTREE agent-ae602f80abcaf9e01, all five arms re-run and every one still behaving as declared.** It read 42/3 when this suite expected a set of EIGHT unpinned codes: a blind walk found none of them, so the set arm failed too and was counted as a third failure. REC-78 pinned all eight and the expectation is now the EMPTY set, which a blind walk satisfies by accident — so that arm no longer fails here and the corpus FLOOR is the whole of what catches blindness. **THE ARM IS UNCHANGED AND STILL BEHAVES AS DECLARED; the figure moved because the SUBJECT moved, and it is recorded rather than smoothed.**
   (4) A THIRTEENTH FENCE MUST NOT ARRIVE UNMEASURED — drop `MACHINE_CANNOT_GROUND` out of the driven set -> 43 pass, 2 FAIL, naming the code and the count.
   (5) OVER-STRICTNESS, and it is not a separate arm because it is BUILT INTO EVERY PIN: each of the twelve payloads is driven a SECOND time by a signed-in MEMBER and must SUCCEED -> 45/0, all twelve member arms green. That is what makes a payload complete rather than merely valid.
   POLARITY: every pin asserts a specific code and its member twin asserts ok:true, so an arm cannot pass by asserting nothing; the harvest is asserted NON-EMPTY before it is compared; the sweep's corpus is floored on size before any membership claim is made over it.
   AND THE INSTRUMENT FAILED FIRST, INSIDE ITS OWN SWEEP. Block 4's unpinned-set arm reads `test/` for quoted codes, and on the first run it read THIS FILE — whose expected set is a literal array of exactly those codes — so every one of them counted as PINNED BY A SUITE and the arm reported an empty set. REC-73's own subject, arriving inside REC-73's own sweep, found the only way it could be: by running it.
 * =========================================================================
 * REC-73 / D-229 — THE TWELVE `MACHINE_CANNOT_*` FENCES, PROVED RATHER THAN
 * BELIEVED.
 *
 * WHY THIS SUITE EXISTS, AND IT IS AN INSTRUMENT FINDING RATHER THAN A DEFECT
 * REPORT. PL-11 ran DEC-55.5's second half for the first time in this project —
 * not *do the refusals fire* but *does removing the predicate make them all
 * pass* — and one edit disarmed all twelve. It then did the thing that turns a
 * pass into a finding: it recorded WHAT EACH ACT ANSWERED INSTEAD. Every one
 * fell through to an ordinary payload complaint sitting behind the fence
 * (`NO_ACKNOWLEDGMENT`, `NO_CONCLUSION`, `NO_REASON`, `NO_TARGET`,
 * `NO_PARTITION`, `NO_SUCH_TASK`, `VERSION_ACT_NO_SUCH_VERSION`), and NOT ONE
 * was refused AS A MACHINE. The twelfth is the proof rather than the exception:
 * `MACHINE_CANNOT_DECLARE` FULLY SUCCEEDED and a machine SET THE GROUP'S
 * REQUIRED EVIDENTIARY STRENGTH, because its payload happened to be complete.
 *
 * SO THE DEFECT WAS IN THE INSTRUMENT, NOT IN THE PLANE. Every one of the twelve
 * fences fires today and always did. What had never been shown is that the FENCE
 * is what fires — a refusal driven under a payload the plane would have refused
 * anyway has been shown to refuse, and has not been shown to be the thing that
 * refuses. THIS IS THE SHARPEST INSTANCE OF THIS SESSION'S MOST-REPEATED
 * FINDING: AN INSTRUMENT THAT PROVES LESS THAN IT APPEARS TO.
 *
 * WHAT THIS SUITE DOES ABOUT IT, IN ONE SENTENCE: it drives each of the twelve
 * acts under a COMPLETE payload — one that would otherwise SUCCEED, which is
 * what `MACHINE_CANNOT_DECLARE` proved is possible — and asserts the refusal by
 * name; then drives the SAME payload as a signed-in member and asserts it
 * succeeds. The member arm is not decoration: it is the EVIDENCE that the
 * payload was complete, measured rather than asserted, and it is the
 * over-strictness arm at the same time.
 *
 * WHAT IS DELIBERATELY NOT DONE: REC-46's predicate is not weakened, rewritten
 * or widened, and no new fence is added. REC-46 is why this was measurable in
 * ONE edit rather than eleven, and it is the only reason the question was ever
 * asked. The fences were believed on the strength of their first half; that is
 * a fact about the controls, and the controls are what this item moves.
 *
 * THE BLOCKS:
 *   1. THE HARVEST. The twelve are read OUT OF `store.mjs`, never typed, so a
 *      thirteenth cannot arrive unmeasured — asserted non-empty, and asserted
 *      EQUAL to the set actually driven below.
 *   2. THE TWELVE, each with a complete payload: machine refused BY NAME, the
 *      record UNMOVED, and the same payload accepted from a member.
 *   3. THE SWEEP. Which OTHER refusals are believed on the strength of their
 *      first half — a walk over every refusal `store.mjs` mints, reporting how
 *      much each one SHADOWS and whether any suite pins it at all.
 *
 * AND ONE BLOCK THIS ITEM DID NOT WRITE: 3b, ADDED 2026-09-24 BY D-503. Blocks 1
 * to 3 read `src/store.mjs` ALONE, so the completeness equality that makes "a
 * thirteenth fence cannot arrive unmeasured" true could never see a fence minted
 * in `src/index.mjs` — where five of them are. 3b harvests those five, DRIVES
 * each through its op under a payload a human then succeeds with, and holds the
 * same equality over them. Its own header says what the row that asked for it
 * got wrong, and what was actually missing.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";  /* D-503 block 3b: op=ratify's authority is a REAL SSHSIG */
import { tmpdir } from "node:os";                              /* D-503 block 3b: the key directory, OUTSIDE the worktree */
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
/* M0-18 — ONE mechanism, imported. This suite's exposure is NOT its siblings'
   and the difference is argued in full at the pin roster walk in block 4. */
import { readGitProvenance, repoPath, reportProvenance } from "../scripts/provenance.mjs";
import { isMachineIdentity, isMachineStamp, MACHINE_FENCE_CHECKS } from "../checks/bio-checks.mjs";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";
import { withAdoptableReading, adoptedVersionParam } from "./adoptable-reading.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(DIR, "..", "..");                  // bio-plane/test -> repo root
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT (PL-1's discipline, PL-4's restatement, PL-11's measured cost):
   an arm that throws on `.code` of undefined takes every arm behind it with it
   and reports one defect as none. */
const codeOf = (r) => (r && typeof r.reason === "string") ? r.reason
                    : (r && typeof r.code === "string") ? r.code : null;

/* Comments BLANKED length-preservingly before any source walk: this file's
   subject is named in dozens of comments inside the spans it walks, and a walk
   over raw source would read a fence's own explanation as a refusal site. */
const decomment = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
  .replace(/(^|[^:])\/\/[^\n]*/gm, (m, p) => p + " ".repeat(m.length - p.length));
const STORE_BARE = decomment(STORE_SRC);

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec73", MEMBER_TOKEN: "mem-rec73", PROBE_TOKEN: "prb-rec73",
              DAEMON_TOKEN: "dmn-rec73", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-rec73",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              /* The DO's own drain alarm would race the manual drain the task
                 arms need, and steal the task they were about to act on.
                 task-fence.test.mjs pins it for the same reason. */
              TASK_DRAIN_DELAY_MS: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response(new Uint8Array(2048), { headers: { "content-type": "application/pdf" } }); },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());

try {

/* ---------------------------------------------------------------- fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-rec73",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* 4.2/4.3: the second member of a group must be an administrator, and there are
   no ordinary members until TWO exist. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
const GUS = await enrol("gus", "admin", ["contribute", "publish"]);
const ANNA = await enrol("anna", "member", ["contribute"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const GROUP = "believe-in-oakland";

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role}`])]
  : [];

const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open", refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  `group: ${GROUP}`, ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  `group: ${GROUP}`, "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const actionMd = (id) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Action ${id}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  `group: ${GROUP}`, "references: []", "state_history: []",
  "action_kind: cpra_request", "risk_tier: 1",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "", "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

/* CORRECTED 2026-09-23 by M0-132, never exempted: this snap key's suffix was drawn from `Math.random`, and the key is
   half of the PRIMARY KEY (bundle_id, snap_key) of `manifest` and `history`, which `promote` writes `INSERT OR
   REPLACE`: two writes to one bundle drawing the same suffix are not refused, the second SILENTLY REPLACES the
   first's rows, so a version the suite wrote could vanish by the draw rather than the code (`TREE-SHARING.md` §3). A
   per-suite COUNTER cannot repeat. */
let snapKeySeq = 0;
const promote = async (id, text, type, tok = RUTH, extraMeta = {}, extraFiles = [], register = []) =>
  POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null,
    snapKey: `${id}-${String(++snapKeySeq).padStart(6, "0")}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }, ...extraFiles],
    register,
    meta: { object_type: type, group: GROUP,
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER, ...extraMeta } });

const mustPromote = async (id, text, type, tok = RUTH, extraMeta = {}, extraFiles = [], register = []) => {
  const a = await promote(id, text, type, tok, extraMeta, extraFiles, register);
  if (!a.ok) throw new Error(`promote ${id}: ${JSON.stringify(a).slice(0, 700)}`);
  return a;
};

const stateOf = async (id) =>
  ((await GET(`op=list&token=${RUTH}`)) || []).find((b) => b.bundle_id === id)?.current_state ?? null;

/* THE BROAD CREDENTIAL, AND WHY IT IS THE RIGHT INSTRUMENT — PL-11's block 8
   reasoning, one layer down. A credential refused at the CREDENTIAL layer
   absorbs a control aimed at the IDENTITY layer, so the scope here is one a
   MEMBER AUTHORED naming exactly the twelve ops (every one of which is an op a
   member reaches, so the scope is legitimate and the gate admits it). And the
   principal is MEMBER-SCOPED on purpose: an `ai` credential's viewer stamp IS
   its principal (`member:ruth`), so this machine SEES everything Ruth sees.
   That is what makes "complete payload" mean what it says — with the fence
   removed there is nothing else left to refuse the call. */
const MACHINE_OPS = ["release", "conclude", "reopen", "publish", "actionmove", "actioncorrespond",
                     "inquirydivide", "inquiryground", "strengthbar", "versionaccept",
                     "taskforward", "taskresolve",
                     /* REC-126 / C-32.16: the review copy's draft act. */
                     "casedraft",
                     /* D-149 / C-32.18: stating an action's governing laws. */
                     "actionlaws",
                     /* REC-189 / C-32.19 (minted C-32.18): the substrate write, so the risk-tier fence is reached. */
                     "promote",
                     /* `select` is not one of the twelve. It is here because a
                        selection is readable ONLY by the credential that made
                        it (`owner` is server-stamped, `class:ai` for this one),
                        so a handle Ruth made would be refused NOT_YOURS to the
                        machine — and release's arm would then be measuring the
                        selection's ownership rather than the fence. The machine
                        makes its own handle over the SAME ids. */
                     "select"];
const minted = await POST(`op=aicredentialmint&token=${RUTH}`, {
  tokenId: "rec73-complete-payload", principalKind: "member", principalMember: "ruth",
  taskScope: "REC-73's own: the twelve acts, driven with payloads that would otherwise succeed",
  writes: MACHINE_OPS,
  note: "REC-73 / D-229. A member authored this scope so the credential layer is held OPEN and what "
      + "answers these calls is the identity fence rather than the gate in front of it." });
if (!minted?.ok) throw new Error(`mint: ${JSON.stringify(minted).slice(0, 500)}`);
const AI = minted.token;

console.log("\n=== REC-73 / D-229 · the twelve MACHINE_CANNOT_* fences, under COMPLETE payloads ===");
console.log(`  the machine: an \`ai\` credential, member-scoped to ruth, authored scope naming ${MACHINE_OPS.length} ops (the twelve acts, plus op=select)`);
console.log(`  author stamp \`token:ai\`, viewer stamp \`member:ruth\` — it sees what she sees, so nothing`);
console.log(`  but the fence can be what refuses these calls.`);

/* ====================================================================== 1
 * THE HARVEST — PRODUCED BY READING THE PLANE, NEVER BY TYPING.
 * ==================================================================== */
console.log("\n--- 1. the twelve are harvested from source, so a thirteenth cannot arrive unmeasured ---");
const HARVEST = [...new Set([...STORE_BARE.matchAll(/"(MACHINE_CANNOT_[A-Z_]+)"/g)].map((m) => m[1]))].sort();
t("the harvest found a REAL family and not an empty set — the guard is the evidence, never the "
+ "equality that follows it", HARVEST.length >= 12, true);
t("`token:ai` is caught by REC-46's ONE predicate, which is why one edit disarms the whole family "
+ "and why this suite had to be written",
  [isMachineStamp("token:ai"), isMachineIdentity("token:ai")], [true, true]);

/* ====================================================================== 2
 * THE TWELVE. Each fixture is built so that the payload below WOULD SUCCEED.
 * ==================================================================== */
console.log("\n--- 2. each act: a COMPLETE payload, refused BY NAME as a machine, then accepted from a member ---");

/* Every act registers itself here. `op` is spelled as a LITERAL `op=<name>` at
   the call site as well, because scripts/coverage.mjs reads op reach out of the
   suite sources and an op reached only through a template hole reads as
   UNREACHED (D-43's class arriving through the test rather than the plane). */
const DRIVEN = [];
/* Each act reports the payload it was driven under and what it answered, so the
   suite's own output is the record D-229 asked for rather than a tally. */
const fence = (code, payload, machineAnswer) => {
  DRIVEN.push({ code, payload, machineAnswer });
  t(`${code} — the machine is refused BY NAME under a COMPLETE payload: ${payload}`,
    machineAnswer, code);
};

/* -------------------------------------------------------- (i) RELEASE */
{
  const DOC = "INFO-2026-7300-release";
  const ds = JSON.stringify({ v: 1 });
  const snap = "<html>snapshot</html>";
  const md = infoMd(DOC).replace("visuals: []",
    `visuals: []\ncontent_hash: "sha256:${sha("release body")}"`);
  await mustPromote(DOC, md, "information", RUTH, {}, [
    { path: "data/dataset.json", text: ds, bytes: ds.length, sha256: sha(ds) },
    { path: "snapshots/page.html", text: snap, bytes: snap.length, sha256: sha(snap) }]);
  const ACK = encodeURIComponent("homogeneous batch of one, bulk-release risks weighed");
  const MIT = encodeURIComponent("sender domain verified by hand against the portal");

  const mh = (await POST(`op=select&token=${AI}&kind=enumerated`, { ids: [DOC] })).handle;
  const m = await GET(`op=release&token=${AI}&handle=${mh}&acknowledgment=${ACK}&mitigation=${MIT}`);
  fence("MACHINE_CANNOT_RELEASE",
    "a collected Information carrying a well-formed content_hash, data/dataset.json and a "
    + "snapshots/ file, in the machine's OWN selection, with both the acknowledgment and the "
    + "mitigation authored", codeOf(m));

  const rh = (await POST(`op=select&token=${RUTH}&kind=enumerated`, { ids: [DOC] })).handle;
  const r = await GET(`op=release&token=${RUTH}&handle=${rh}&acknowledgment=${ACK}&mitigation=${MIT}`);
  t("  and the SAME payload releases for a signed-in member, which is what makes it COMPLETE — and "
  + "proves in the same breath that the machine's call wrote nothing",
    [r.ok, r.released, r.weight, await stateOf(DOC)], [true, [DOC], "refuse", "verified"]);
}

/* -------------------------------------------------------- (ii) CONCLUDE */
{
  const DOC = "INFO-2026-7300-conclude-basis";
  const INQ = "INQ-2026-7300-conclude";
  await mustPromote(DOC, infoMd(DOC), "information");
  /* CORRECTED 2026-09-18 (REC-136, INVESTIGATIVE-SESSION.md §7.1 item 6): a
     conclusion drawn with no project NAMES the accepted reading whose claim it
     adopts, and an unnamed one is refused NO_CLAIM. The payload below was
     COMPLETE without it because the act took none; it no longer is, and the
     member half would now be refused NO_CLAIM — so the inquiry carries an
     accepted reading (`withAdoptableReading`) and BOTH calls name it. The
     machine half is unchanged in what it proves: the fence answers first, and
     the same payload succeeding for a member is what makes it complete. */
  await mustPromote(INQ, withAdoptableReading(inquiryMd(INQ, { refs: [DOC], legs: [{ target: DOC, role: "supports" }] })),
    "inquiry");
  const CONCL = encodeURIComponent("The transfer rests on a 1998 resolution never rescinded");
  const FALS = encodeURIComponent("A rescinding resolution, or a memo naming a different authority");
  const VER = adoptedVersionParam();

  const m = await GET(`op=conclude&token=${AI}&target=${INQ}&conclusion=${CONCL}&falsifier=${FALS}${VER}`);
  fence("MACHINE_CANNOT_CONCLUDE",
    "an OPEN inquiry carrying one basis leg, with the conclusion AND the falsifier both authored, "
    + "naming the accepted reading whose claim it adopts",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(INQ), "open");

  const r = await GET(`op=conclude&token=${RUTH}&target=${INQ}&conclusion=${CONCL}&falsifier=${FALS}${VER}`);
  t("  and the SAME payload concludes for a signed-in member, attributed to her by the server",
    [r.ok, r.from, r.to, r.basis_legs, r.author], [true, "open", "concluded", 1, "ruth"]);
}

/* -------------------------------------------------------- (iii) REOPEN */
{
  const DOC = "INFO-2026-7300-reopen-basis";
  const INQ = "INQ-2026-7300-reopen";
  await mustPromote(DOC, infoMd(DOC), "information");
  await mustPromote(INQ, inquiryMd(INQ, { refs: [DOC], legs: [{ target: DOC, role: "supports" }] }), "inquiry");
  /* The disposition is taken through the act that creates it, so what is
     reopened is a real deferral with a real authored reason. */
  const h = (await POST(`op=select&token=${RUTH}&kind=enumerated`, { ids: [INQ] })).handle;
  const dp = await GET(`op=dispose&token=${RUTH}&handle=${h}&to=deferred&reason=${encodeURIComponent("waiting on the audit")}`);
  if (!dp.ok) throw new Error(`dispose: ${JSON.stringify(dp).slice(0, 400)}`);
  const WHY = encodeURIComponent("the audit landed and it names the transfer");

  const m = await GET(`op=reopen&token=${AI}&target=${INQ}&reason=${WHY}`);
  fence("MACHINE_CANNOT_REOPEN",
    "a DEFERRED inquiry — reopenable, which is the state this act needs — with the reason authored",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(INQ), "deferred");

  const r = await GET(`op=reopen&token=${RUTH}&target=${INQ}&reason=${WHY}`);
  t("  and the SAME payload reopens for a signed-in member",
    [r.ok, r.from, r.to, r.author], [true, "deferred", "open", "ruth"]);
}

/* -------------------------------------------------------- (iv) PUBLISH */
{
  const CAP = "INFO-2026-7300-publish-capture";
  const CONN = "INFO-2026-7300-publish-connection";
  const LEFT = "INFO-2026-7300-publish-left-out";
  const INQ = "INQ-2026-7300-publish";
  for (const d of [CAP, CONN, LEFT])
    await mustPromote(d, infoMd(d), "information", RUTH, {}, [],
      [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${d}`), encoding: "binary", bytes: 10 }]);
  const legs = ["basis:",
    `  - target: ${CAP}`, "    role: supports", "    grade: B", "    grade_axis: capture", "    grade_source: capture",
    `  - target: ${CONN}`, "    role: supports", "    grade: C", "    grade_axis: connection",
    "    grade_source: hunch", "    author: ruth", "    date: 2026-08-04"].join("\n");
  const md = inquiryMd(INQ, { question: "Was the sewer transfer authorised?", refs: [CAP, CONN] })
    .replace("---\n\n## Question", `${legs}\n---\n\n## Question`);
  /* CORRECTED 2026-09-18 (REC-136, §7.1 item 6): the conclusion this fixture
     draws names an accepted reading, which the inquiry now carries. Fixture, not subject. */
  await mustPromote(INQ, withAdoptableReading(md), "inquiry");
  const cn = await GET(`op=conclude&token=${RUTH}&target=${INQ}`
    + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
    + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
    + adoptedVersionParam());
  if (!cn.ok) throw new Error(`conclude for publish: ${JSON.stringify(cn).slice(0, 400)}`);

  /* ADDED 2026-08-10, CASE-2 / DEC-72: publication is a PRODUCTION OF A PROJECT
     and is fenced to a project OWNER. Fixture, not subject — this block's
     subject is the MACHINE fence, and the payload exists so that ONLY the
     credential can be what refuses it. RUTH owns it and is the member half of
     the pair below; the project declares no bar, so nothing is newly gated. */
  const PUB_PRJ = await makePublishingProject({
    post: POST, mf, sha, machineToken: "adm-rec73", owner: "ruth",
    /* CORRECTED 2026-09-18 (REC-141, IC-158): a project's id is MINTED by the plane (Membership v2 §7);
       the fixture takes a `name` and returns the minted id. */
    name: "PROJ-2026-7300-publish", created: NOW, updated: LATER });
  const BODY = { target: INQ, project: PUB_PRJ, roles: { [INQ]: "load_bearing" },
    scope: "Whether the FY2024 sewer transfer was authorised, on the documents in hand.",
    statement: "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.",
    excluded: [{ target: LEFT, description: "the FY2023 comparison memo",
                 reason: "a records request for it is still outstanding with the City Clerk" }],
    subjectPosition: "sought_and_answered",
    subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
    biasAcknowledgement: "This group holds a declared position that fund transfers should be adopted in "
                       + "public session, and edition 1 reads the FY2024 record through it." };

  const m = await POST(`op=publish&token=${AI}`, BODY);
  fence("MACHINE_CANNOT_PUBLISH",
    "a CONCLUDED inquiry with both graded axes, and every authored field the ceremony asks for — "
    + "scope, completeness statement, exclusion rows, subject position, its justification and the "
    + "bias acknowledgement",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(INQ), "concluded");

  const r = await POST(`op=publish&token=${RUTH}`, BODY);
  /* CORRECTED 2026-09-10 (CASE-4 / DEC-72), never exempted. `to: "published"` is
     gone from op=publish's answer with the state it named — DEC-72 ends
     `published` as an inquiry lifecycle state and publication moves no state at
     all. What this arm is about is the FENCE (a machine cannot publish; the same
     payload succeeds for a person) and that is untouched; the destination-state
     field is replaced by the CASE the act actually produced, which is what the
     act now reports. */
  t("  and the SAME payload publishes at EDITION 1 for a signed-in member holding `publish`",
    [r.ok, r.edition, !!r.caseId, r.completeness?.author], [true, 1, true, "ruth"]);
}

/* -------------------------------------------------------- (v) MOVE_ACTION */
{
  const ACT = "ACTN-2026-7300-move";
  await mustPromote(ACT, actionMd(ACT), "action", RUTH, { current_state: "planned" });
  const WHY = encodeURIComponent("the finding is concluded and the records request goes out today");

  const m = await GET(`op=actionmove&token=${AI}&target=${ACT}&to=active&reason=${WHY}`);
  fence("MACHINE_CANNOT_MOVE_ACTION",
    "a PLANNED action moved to `active` — a legal edge in the catalog's own table — with the reason "
    + "authored, and no resolution, which is exactly what a non-resolving move requires",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(ACT), "planned");

  const r = await GET(`op=actionmove&token=${RUTH}&target=${ACT}&to=active&reason=${WHY}`);
  t("  and the SAME payload moves the action for a signed-in member",
    [r.ok, r.from, r.to, r.author], [true, "planned", "active", "ruth"]);
}

/* -------------------------------------------------------- (vi) CORRESPOND */
{
  const ACT = "ACTN-2026-7300-correspond";
  await mustPromote(ACT, actionMd(ACT), "action", RUTH, { current_state: "planned" });
  const q = `&target=${ACT}&direction=sent&at=2026-08-11&medium=email&party=${encodeURIComponent("City Clerk")}`
    + `&account=${encodeURIComponent("We sent the request by email and kept the send receipt.")}`;

  const m = await GET(`op=actioncorrespond&token=${AI}${q}`);
  fence("MACHINE_CANNOT_CORRESPOND",
    "an action, a legal direction, a well-formed date, and a NAMED ACCOUNT — the testimony arm, "
    + "where the author IS the evidence, which is precisely why a machine may not take it",
    codeOf(m));

  const r = await GET(`op=actioncorrespond&token=${RUTH}${q}`);
  t("  and the SAME payload records the entry for a signed-in member — `ord` 0 is the proof the "
  + "machine's call appended nothing, measured rather than assumed",
    [r.ok, r.ord, r.held_as, r.author], [true, 0, "testimony", "ruth"]);
}

/* -------------------------------------------------------- (vii) DIVIDE */
{
  const A = "INFO-2026-7300-divide-a", B = "INFO-2026-7300-divide-b";
  const INQ = "INQ-2026-7300-divide";
  const KID_A = "INQ-2026-7300-authority", KID_B = "INQ-2026-7300-signature";
  for (const d of [A, B]) await mustPromote(d, infoMd(d), "information");
  await mustPromote(INQ, inquiryMd(INQ, { question: "Was it authorised, and did anyone sign it?",
    refs: [A, B], legs: [{ target: A, role: "supports" }, { target: B, role: "supports" }] }), "inquiry");
  const BODY = {
    reason: "This was two questions: whether the transfer was authorised at all, and who signed it.",
    children: [{ id: KID_A, question: "Was the FY2024 sewer fund transfer authorised?", legs: [0] },
               { id: KID_B, question: "Did anyone with delegated authority sign the memo?", legs: [1] }] };

  const m = await POST(`op=inquirydivide&token=${AI}&target=${INQ}`, BODY);
  fence("MACHINE_CANNOT_DIVIDE",
    "an OPEN inquiry with two basis legs, a reason, TWO children with canonical INQ- ids that do "
    + "not yet exist, each with its own authored question, and EVERY leg apportioned a home",
    codeOf(m));
  t("  the record did not move under the machine's call", await stateOf(INQ), "open");

  const r = await POST(`op=inquirydivide&token=${RUTH}&target=${INQ}`, BODY);
  t("  and the SAME payload divides for a signed-in member — the children the machine did NOT "
  + "create are created here, which is the same fact from the other side",
    [r.ok, r.to, r.terminal, r.into, r.apportioned_by],
    [true, "divided", true, [KID_A, KID_B], "ruth"]);
}

/* -------------------------------------------------------- (viii) GROUND */
{
  const A = "INFO-2026-7300-ground-a", B = "INFO-2026-7300-ground-b";
  const INQ = "INQ-2026-7300-ground";
  for (const d of [A, B]) await mustPromote(d, infoMd(d), "information");
  await mustPromote(INQ, inquiryMd(INQ, { refs: [A, B],
    legs: [{ target: A, role: "supports" }, { target: B, role: "supports" }] }), "inquiry");
  const BODY = { grounds: [{ ground: "charter", legs: [0] }, { ground: "code", legs: [1] }] };

  const m = await POST(`op=inquiryground&token=${AI}&target=${INQ}`, BODY);
  fence("MACHINE_CANNOT_GROUND",
    "an inquiry with two basis legs and a TOTAL partition over them — every leg in exactly one "
    + "group, both labels legal, and no reason owed because there is no earlier structure",
    codeOf(m));

  const r = await POST(`op=inquiryground&token=${RUTH}&target=${INQ}`, BODY);
  t("  and the SAME payload groups for a signed-in member — `authored` rather than `restructured` "
  + "is the proof the machine's call wrote no structure for this one to revise",
    [r.ok, r.act, r.grouped, r.grounds?.map((x) => x.asserted_by)],
    [true, "authored", true, ["ruth", "ruth"]]);
}

/* --------------------------------------------------- (ix) DECLARE — THE SENTINEL */
{
  /* THE ONE THAT WENT ALL THE WAY THROUGH. PL-11's arm (1) recorded that with
     the predicate neutered a machine SET THE GROUP'S REQUIRED EVIDENTIARY
     STRENGTH — no payload complaint behind it, because this act's payload was
     already complete. It needs no fixture at all, which is exactly why it was
     the one that succeeded. */
  const barOf = async () => (await GET(`op=strengthbarof&token=${RUTH}&group=${GROUP}`))?.bar ?? null;
  t("  no bar is declared for this group before either call — the guard, so 'it was set' cannot be "
  + "true before the act", await barOf(), null);
  /* D-509: `group: GROUP` IS LOAD-BEARING AND ITS ABSENCE WAS A FALSE GREEN. Without it this act
     names no group, so D-436's default sends the write to the STORE'S PRODUCING group
     (`#producingGroup()`, the INSTANCE_NAME binding `biosmoke-rec73`) while `barOf()` above reads
     back `group=believe-in-oakland`. The read-back below then found `null` whatever the act did,
     so the sentinel's second assertion PASSED OVER THE WRONG GROUP and stayed green under the
     control's arm (2) — measured on origin/main e9b21be66, where a machine with the identity
     predicate neutered DID set the bar and the suite said nothing was declared. Naming the group
     puts the write and the read-back on the same one. It is also the group every fixture in this
     file is promoted into, so the bar this block leaves behind is the one a reader would expect. */
  const BODY = { group: GROUP, capture: "B", connection: "C" };

  const m = await POST(`op=strengthbar&token=${AI}`, BODY);
  fence("MACHINE_CANNOT_DECLARE",
    /* CORRECTED 2026-09-24 by D-509. It read "and the group defaulted", which was true of the
       payload and was the reason the read-back below could not see the act: the default is the
       PRODUCING group and the read-back names this one. The payload now names the group, so the
       sentence does too — an old assertion's description that outlives the payload it describes
       is how a suite comes to say something it no longer tests. */
    "a legal grade on BOTH axes and the group NAMED — the payload PL-11 measured going all the "
    + "way through, which is why this act is the regression sentinel rather than the exception",
    codeOf(m));
  t("  and NOTHING was declared by the machine's call — the sentinel's whole point, since this is "
  + "the act PL-11 measured going through", await barOf(), null);

  const r = await POST(`op=strengthbar&token=${RUTH}`, BODY);
  /* D-509 ADDED `r.group` TO THIS TUPLE. The member twin is the only arm that can say WHERE the
     write landed, and pinning it here is what makes the read-back above address the same row as
     the act rather than agreeing with it for free — the property whose absence made the sentinel
     unable to fail. A future default that moves the write again turns this suite red by name
     instead of turning the control quietly green. */
  t("  and the SAME payload sets the group's required strength for a signed-in member holding `publish`, "
  + "ON THE GROUP THE PAYLOAD NAMED — which is the group `barOf()` reads",
    [r.ok, r.group, r.capture, r.connection, r.author], [true, GROUP, "B", "C", "ruth"]);
}

/* -------------------------------------------------------- (x) MOVE_VERSION */
{
  const L = "INFO-2026-7300-version-ledger";
  const INQ = "INQ-2026-7300-version";
  await mustPromote(L, infoMd(L), "information", RUTH, {}, [],
    [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${L}`), encoding: "binary", bytes: 10 }]);
  const versions = ["basis_versions:",
    '  - name: "opening account"',
    '    description: "The first reading: the ledger shows the transfer."',
    '    relationship: "and"', '    state: "suggested"', "    derived_from: null",
    "    hidden: false", '    run: "AIRUN-2026-7300-first"', '    author: "ruth"', `    at: "${NOW}"`,
    "basis_version_grounds:",
    '  - version: "opening account"', '    ground: "paper trail"', '    asserted_by: "ruth"', `    at: "${NOW}"`,
    "basis_version_legs:",
    '  - version: "opening account"', `    target: "${L}"`, '    role: "supports"',
    '    ground: "paper trail"', '    grade: "B"', '    grade_axis: "capture"', '    grade_source: "capture"',
  ].join("\n");
  const md = inquiryMd(INQ, { refs: [L] }).replace("---\n\n## Question", `${versions}\n---\n\n## Question`);
  await mustPromote(INQ, md, "inquiry");
  const stateOfVersion = async () => {
    const set = await GET(`op=basisversions&token=${RUTH}&id=${INQ}`);
    return (set?.versions || []).find((v) => v.name === "opening account")?.state ?? null;
  };
  t("  the reading starts SUGGESTED, so there is a real move for this act to make",
    await stateOfVersion(), "suggested");
  const q = `&target=${INQ}&version=${encodeURIComponent("opening account")}`;

  const m = await POST(`op=versionaccept&token=${AI}${q}`, {});
  fence("MACHINE_CANNOT_MOVE_VERSION",
    "an inquiry the machine can SEE, holding a reading by that exact name, in `suggested` — the "
    + "state `accept` moves from — with no reason owed on this verb",
    codeOf(m));
  t("  the reading did not move under the machine's call", await stateOfVersion(), "suggested");

  const r = await POST(`op=versionaccept&token=${RUTH}${q}`, {});
  t("  and the SAME payload accepts the reading for a signed-in member",
    [r.ok, await stateOfVersion()], [true, "accepted"]);
}

/* ------------------------------------------------ (xi)/(xii) FORWARD, RESOLVE */
{
  /* A task exists only by the route its producer has: enqueued at the Durable
     Object by the capture path, filed by a promote, and drained. There is no
     control-plane `op=taskenqueue` — deliberately (index.mjs says so) — so the
     fixture reaches past the door the same way task-fence.test.mjs does. */
  const ns = await mf.getDurableObjectNamespace("STORE");
  const obj = ns.get(ns.idFromName("bio"));
  const doPost = async (op, body) => (await obj.fetch(`http://x/${op}`,
    { method: "POST", body: JSON.stringify(body) })).json();
  const AT = "2026-07-31T12:00:00Z";
  let n = 0;
  const makeTask = async () => {
    n++;
    const cap = (n + 0x7300).toString(16).padStart(64, "0");
    const bundle = `INFO-2026-7300-task-fixture-${n}`;
    await doPost("taskenqueue", { kind: "authority-undetermined", captureSha: cap,
      subject: "https://www.oaklandca.gov/documents/agenda.pdf", at: AT });
    await mustPromote(bundle, infoMd(bundle), "information", RUTH, {}, [],
      [{ sha256: cap, path: "snapshots/agenda.pdf", encoding: "binary", bytes: 10 }]);
    /* The drain is the consumer and is a MACHINE op by declaration — a
       signed-in session is refused it, which is the plane saying that filing
       the queue is not a member's act. So the fixture uses the machine
       credential the harness binds, exactly as queue-state.test.mjs does. */
    const d = await POST("op=taskdrain&token=mem-rec73", { now: AT });
    const made = (d?.created || []).find((c) => c.refers_to === bundle);
    if (!made) throw new Error(`drain created no task for ${bundle}: ${JSON.stringify(d).slice(0, 400)}`);
    return made.id;
  };
  const rowOf = async (id) =>
    ((await GET(`op=tasks&token=${RUTH}`))?.tasks || []).find((x) => x.id === id) ?? null;

  const taskF = await makeTask();
  const fBody = { id: taskF, to: "anna", now: AT };
  const mf1 = await POST(`op=taskforward&token=${AI}`, fBody);
  fence("MACHINE_CANNOT_FORWARD",
    "a REAL drained task by its real id, forwarded to an ACTIVE member who is not already its "
    + "assignee — the payload the assignee herself succeeds with two lines below",
    codeOf(mf1));
  t("  the task did not move under the machine's call",
    [(await rowOf(taskF))?.assignee, (await rowOf(taskF))?.status], ["ruth", "open"]);
  const rf = await POST(`op=taskforward&token=${RUTH}`, fBody);
  t("  and the SAME payload forwards it for the signed-in assignee", [rf.ok, rf.assignee], [true, "anna"]);

  const taskR = await makeTask();
  const rBody = { id: taskR, now: AT };
  const mr1 = await POST(`op=taskresolve&token=${AI}`, rBody);
  fence("MACHINE_CANNOT_RESOLVE",
    "a REAL drained task by its real id, in `open`, resolved by a caller the fence would otherwise "
    + "admit — the assignee's own payload",
    codeOf(mr1));
  t("  the task did not move under the machine's call", (await rowOf(taskR))?.status, "open");
  const rr = await POST(`op=taskresolve&token=${RUTH}`, rBody);
  t("  and the SAME payload resolves it for the signed-in assignee", [rr.ok, rr.status], [true, "resolved"]);
}

/* -------------------------------------------------------- (xiii) REVIEW */
{
  /* REC-126 / C-32.16. The review copy's authoring acts refuse a machine before
     anything else, because the act is ADDRESSED and ATTRIBUTED (§6A.2). The
     payload is one the project's OWNER succeeds with two lines below — a project
     she owns and every argument `op=publish` would take — so only the credential
     can be what refuses it. All three authoring acts (`casedraft`, `reviewgrant`,
     `reviewrevoke`) enter through the store's `reviewAct`, where the fence stands
     once; `casedraft` is the one driven here, and `reviewcopy.test.mjs` drives the
     grant's fence by name. */
  const REV_PRJ = await makePublishingProject({
    post: POST, mf, sha, machineToken: "adm-rec73", owner: "ruth",
    /* CORRECTED 2026-09-18 (REC-141, IC-158): the id is MINTED by the plane; `name`, and the return value. */
    name: "PROJ-2026-7300-review", created: NOW, updated: LATER });
  const BODY = { project: REV_PRJ, targets: ["INQ-2026-7300-review"], roles: { "INQ-2026-7300-review": "load_bearing" },
    scope: "Whether the transfer was authorised.", statement: "This draft covers the transfer only.",
    excluded: [], subjectPosition: "sought_and_answered", subjectJustification: "We asked and printed the answer.",
    biasAcknowledgement: "This group holds that transfers should be adopted in public." };
  const m = await POST(`op=casedraft&token=${AI}`, BODY);
  fence("MACHINE_CANNOT_REVIEW",
    "a project the member OWNS and every argument op=publish would take — the payload the owner drafts "
    + "with on the next line",
    codeOf(m));
  const r = await POST(`op=casedraft&token=${RUTH}`, BODY);
  t("  and the SAME payload drafts the case for the signed-in owner",
    [r.ok, typeof r.draftId, r.project], [true, "string", REV_PRJ]);
}

/* -------------------------------------------------------- (xiv) SET_LAWS */
{
  /* D-149 / C-32.18. Stating which laws govern an action's request is a member's authored act; the payload is
     one a signed-in member succeeds with on the next line — a real action, two well-formed citations at two
     legal levels — so only the credential can be what refuses it. */
  const ACT = "ACTN-2026-7300-laws";
  await mustPromote(ACT, actionMd(ACT), "action", RUTH, { current_state: "planned" });
  const BODY = { laws: [{ level: "state", citation: "Cal. Gov. Code § 7920.000 et seq." },
                        { level: "local", citation: "Oakland Municipal Code ch. 2.20" }] };
  const m = await POST(`op=actionlaws&token=${AI}&target=${ACT}`, BODY);
  fence("MACHINE_CANNOT_SET_LAWS",
    "a real action and two well-formed citations at two legal levels — the payload the member sets the list "
    + "with on the next line",
    codeOf(m));
  const r = await POST(`op=actionlaws&token=${RUTH}&target=${ACT}`, BODY);
  t("  and the SAME payload sets the list for a signed-in member, stamped with her name",
    [r.ok, r.by, r.laws?.length], [true, "ruth", 2]);
}

/* ------------------------------------------------ (xv) SET_RISK_TIER */
{
  /* REC-189 / C-32.19 (minted C-32.18; renumbered at c19-batch10, D-149 holding C-32.18) — D-182's ruling on the write side (BOB #21: *"Only a member's authored act sets 1, 2
     or 3"*). NOT an act: the fence stands inside `promote`'s action block and refuses a CHANGE of tier by a
     machine, never a presence. So this block carries more arms than its siblings, because the liar the row
     names — refusing EVERY machine promote of an action — passes a pin and fails only an arm that asks
     whether a machine's carry-forward still lands. Each arm is a REVISION of one action a member created at
     tier 1 (`actionMd`), promoted on the version it replaces, so nothing but the tier and the credential moves. */
  const ACT = "ACTN-2026-7300-risk-tier";
  await mustPromote(ACT, actionMd(ACT), "action", RUTH, { current_state: "planned" });
  const view = async () => {
    const p = rP(await (await mf.dispatchFetch(`http://x/api/?op=projection&token=${RUTH}&id=${ACT}`)).json());
    return { sha: p?.bundle_sha ?? null, tier: p?.action?.risk_tier ?? null };
  };
  const revise = async (tok, tierLine, plan) => {
    const { sha: base } = await view();
    let text = actionMd(ACT).replace("risk_tier: 1", tierLine);
    if (plan) text = text.replace("Ask for the transfer ledger.", plan);
    return POST(`op=promote&token=${tok}`, {
      bundleId: ACT, base, snapKey: `${ACT}-${String(++snapKeySeq).padStart(6, "0")}`,
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
      meta: { object_type: "action", group: GROUP, current_state: "planned",
              created: NOW, last_updated: LATER } });
  };
  const v0 = await view();
  t("  a member created the action at tier 1, so there is a stated tier to carry and one to change",
    v0.tier, 1);

  const m = await revise(AI, "risk_tier: 2");
  fence("MACHINE_CANNOT_SET_RISK_TIER",
    "a revision of a member's action, on the version it replaces, well-formed in every field, changing "
    + "risk_tier 1 -> 2 — the change a signed-in member lands below through op=actionrisktier",
    codeOf(m));
  const v1 = await view();
  t("  the record did not move under the machine's call: still tier 1, on the same version (the refusal "
  + "says NOTHING WAS WRITTEN, and this is what makes that sentence true rather than hoped)",
    [v1.tier, !!v0.sha && v1.sha === v0.sha], [1, true]);

  /* THE LIAR'S ARM (the row's own): a fence refusing every machine promote of an action passes the pin
     above and fails HERE. The machine revises the plan and carries the member's tier forward unchanged. */
  const carry = await revise(AI, "risk_tier: 1", "Ask for the transfer ledger and the FY2023 memo.");
  t("a machine credential's revision that CARRIES THE MEMBER'S TIER FORWARD UNCHANGED lands — the fence "
  + "refuses a change of tier, never a machine promote of an action",
    [carry.ok, (await view()).tier], [true, 1]);
  /* BOB #32 (2026-09-24 01:44Z), paid at c19-batch10 — CORRECTED, never exempted: this arm used to assert that a
     machine's revision stating the tier UNDETERMINED lands over the member's 1. The ruling reads that as the machine
     REMOVING a member's judgement, which is writing the tier: once a member has set one, a machine may not drop it
     to undetermined. The old assertion described the defect the ruling closes. */
  const dropped = await revise(AI, "risk_tier: undetermined", "Ask for the transfer ledger and the FY2023 memo.");
  t("a machine credential's revision DROPPING A MEMBER'S TIER TO UNDETERMINED is refused by name, and the "
  + "member's tier stands (BOB #32: once a member set it, the machine may not write it at all)",
    [codeOf(dropped), (await view()).tier], ["MACHINE_CANNOT_SET_RISK_TIER", 1]);
  /* OVER-STRICTNESS, the half of the ruling that must still pass: where NO MEMBER EVER SET a tier, the machine may
     leave it undetermined. A second action, created by a member with the tier unstated, revised by the machine. */
  const ACT2 = "ACTN-2026-7301-risk-tier-unset";
  const unsetMd = actionMd(ACT2).replace("risk_tier: 1", "risk_tier: undetermined");
  await mustPromote(ACT2, unsetMd, "action", RUTH, { current_state: "planned" });
  const view2 = async () => {
    const p = rP(await (await mf.dispatchFetch(`http://x/api/?op=projection&token=${RUTH}&id=${ACT2}`)).json());
    return { sha: p?.bundle_sha ?? null, tier: p?.action?.risk_tier ?? null };
  };
  const { sha: base2 } = await view2();
  const leftText = unsetMd.replace("Ask for the transfer ledger.", "Ask for the transfer ledger and the FY2023 memo.");
  const left = await POST(`op=promote&token=${AI}`, {
    bundleId: ACT2, base: base2, snapKey: `${ACT2}-${String(++snapKeySeq).padStart(6, "0")}`,
    files: [{ path: "bundle.md", text: leftText, bytes: leftText.length, sha256: sha(leftText) }], register: [],
    meta: { object_type: "action", group: GROUP, current_state: "planned",
            created: NOW, last_updated: LATER } });
  t("a machine credential's revision LEAVING UNDETERMINED A TIER NO MEMBER EVER SET lands, and reads undetermined",
    [left.ok, (await view2()).tier], [true, "undetermined"]);
  /* …and on that same never-set tier the machine still cannot STATE one: the change is asked of the version it
     replaces (this arm stood before the ruling as "from undetermined the machine still cannot state 1"). */
  const { sha: base3 } = await view2();
  const setText = leftText.replace("risk_tier: undetermined", "risk_tier: 1");
  const set1 = await POST(`op=promote&token=${AI}`, {
    bundleId: ACT2, base: base3, snapKey: `${ACT2}-${String(++snapKeySeq).padStart(6, "0")}`,
    files: [{ path: "bundle.md", text: setText, bytes: setText.length, sha256: sha(setText) }], register: [],
    meta: { object_type: "action", group: GROUP, current_state: "planned",
            created: NOW, last_updated: LATER } });
  t("…and on a never-set tier the machine still cannot state 1 — refused by the same name",
    [codeOf(set1), (await view2()).tier], ["MACHINE_CANNOT_SET_RISK_TIER", "undetermined"]);

  /* CORRECTED 2026-09-24 by REC-214 (BOB #33, "Risk-tier revision"), never exempted: this arm asserted that the
     SAME plain-promote payload LANDS for a signed-in member. That was the over-strictness half of C-32.19 when it
     was written, and it is now the silent overwrite the ruling closes: a member's revision of a tier is an
     authored act with a REQUIRED reason and an append-only history (op=actionrisktier), and promote refuses the
     plain revision BY A DIFFERENT NAME (RISK_TIER_REWRITTEN, C-90.1) — which is what keeps this arm's point: the
     machine's refusal is about WHO, and the member is not refused by it. The member's act then lands the 2. */
  const r = await revise(RUTH, "risk_tier: 2");
  t("  and the SAME payload from a signed-in member is NOT refused as a machine — it is refused RISK_TIER_REWRITTEN "
  + "(after intake a tier moves only through op=actionrisktier), and the tier stands",
    [codeOf(r), (await view()).tier], ["RISK_TIER_REWRITTEN", 1]);
  const ra = await POST(`op=actionrisktier&token=${RUTH}&target=${ACT}`, { tier: 2, reason: "the member re-assessed it" });
  t("  and the member's own act lands risk_tier 2, read back through op=projection",
    [ra && ra.ok, (await view()).tier], [true, 2]);
}

/* ====================================================================== 3
 * THE SWEEP AND THE COMPLETENESS ARM.
 * ==================================================================== */
console.log("\n--- 3. the driven set IS the harvested set: a thirteenth fence cannot arrive unmeasured ---");
{
  const drivenCodes = DRIVEN.map((d) => d.code).sort();
  /* MOVED 12 -> 13 on 2026-09-18 by REC-126 (C-32.16 MACHINE_CANNOT_REVIEW, block xiii).
     MOVED 13 -> 14 on 2026-09-23 by D-149 (C-32.18 MACHINE_CANNOT_SET_LAWS, block xiv).
     MOVED 14 -> 15 at c19-batch10 by REC-189 (C-32.19 MACHINE_CANNOT_SET_RISK_TIER, minted C-32.18, block xv). */
  t("(fifteen fences were actually driven — the guard before the equality, because two empty sets are "
  + "equal and prove nothing)", drivenCodes.length, 15);
  /* CORRECTED 2026-09-24 by D-503, never exempted: this label read "EVERY MACHINE_CANNOT_* THE PLANE
     can mint", and that is wider than the arm can support. `HARVEST` reads `src/store.mjs` ALONE, and
     the plane mints five more fence codes in `src/index.mjs` (the two MACHINE_CANNOT_RATIFY* and the
     three OPERATOR_TOKEN_CANNOT_*) which this equality has never been able to see. Those are block
     3b's, harvested and driven there; the two arms together are the whole plane, and neither claims
     to be. The old wording was the defect this file exists to find, in this file. */
  t("EVERY MACHINE_CANNOT_* `src/store.mjs` mints was driven under a COMPLETE payload — the codes "
  + "`src/index.mjs` mints are block 3b's, and were outside this corpus, not inside it (D-503)",
    HARVEST.filter((c) => !drivenCodes.includes(c)), []);
  t("and nothing was driven that the plane does not mint", drivenCodes.filter((c) => !HARVEST.includes(c)), []);
  t("every one of them answered with its OWN name — this is the whole item, stated once as a set",
    DRIVEN.filter((d) => d.machineAnswer !== d.code).map((d) => [d.code, d.machineAnswer]), []);
}

/* ===================================================================== 3b
 * D-503 — THE FIVE FENCES `src/index.mjs` MINTS, DRIVEN THROUGH THE OP.
 *
 * WHAT THE ROW SAID, AND WHAT WAS MEASURED. The row reads *"the authority
 * boundary that no machine attests, with five of its fences asserted by
 * nothing"*. **Measured on this tree that premise is FALSE, and it is corrected
 * here rather than repeated**: every one of the five is already driven through
 * its op, under a complete payload, by a named suite —
 * `machine-attest.test.mjs` (REC-123) drives MACHINE_CANNOT_RATIFY C-32.12 and
 * MACHINE_CANNOT_RATIFY_CASE C-32.13 with an `ai` credential carrying a
 * registered member's REAL signature; `operator-attest.test.mjs` (REC-125)
 * drives OPERATOR_TOKEN_CANNOT_RATIFY C-32.14 and
 * OPERATOR_TOKEN_CANNOT_RATIFY_CASE C-32.15 for every bearer class
 * `classify()` resolves, and `ratify.test.mjs` pins C-32.14 again;
 * `adminvote.test.mjs` (D-136) drives OPERATOR_TOKEN_CANNOT_GOVERN C-32.17
 * across class x op with a live proposal as its payload.
 *
 * WHAT *IS* ASSERTED BY NOTHING IS THE COMPLETENESS, AND IT IS THIS FILE'S OWN.
 * Block 1 harvests `src/store.mjs` ALONE. So block 3's equality — the guard that
 * makes *"a thirteenth fence cannot arrive unmeasured"* true — has never been
 * able to SEE a fence minted in `src/index.mjs`, and a sixth one landing there
 * undriven would have read exactly like the five standing. D-494 found the same
 * blindness one level up, in the CATALOGUE walk, and widened that harvest to
 * both sources; its note says plainly what it could not do — *"IT IS A SOURCE
 * WALK, not a drive. That a fence is MINTED says nothing about whether the act
 * reaches it; `test/machine-fences.test.mjs` grades the fence against the act."*
 * That sentence names this file, and until this block it was not true of
 * `index.mjs`. Block 3's own label carried the same over-claim (*"EVERY
 * MACHINE_CANNOT_* the plane can mint"* over a store-only corpus) and is
 * corrected at its site, not exempted.
 *
 * SO THIS IS NOT A SECOND COPY OF THOSE THREE SUITES AND MUST NOT BE READ AS
 * ONE. Their findings are theirs and none is re-derived here: not REC-123's
 * trace on the pre-item tree, not REC-125's bearer-class census, not D-136's
 * governance arithmetic. What is new is that all five are driven in the ONE file
 * that holds the harvest-to-drive equality, from ONE fixture, so that equality
 * has something of its own to stand on. **Two instruments over one variable is
 * agreement, not evidence** (CLAUDE.md §5), and that is stated rather than
 * traded on: if an arm here and its twin there ever disagree, the fence moved.
 *
 * THE PAYLOAD IS COMPLETE AND THE MEMBER TWIN IS THE PROOF OF IT — REC-73's
 * lesson, unchanged. Each act is driven by the MACHINE (`ai`), then by the
 * OPERATOR's bearer token, then by RUTH'S OWN SIGNED-IN SESSION, which must
 * SUCCEED. The two refusals are therefore the FENCE and not a payload complaint
 * standing behind it, and the member arm is the over-strictness arm at the same
 * time. The order is deliberate: a ratification is SPENT once it lands, so the
 * human arm is last; and between the arms the record is READ BACK, because a 403
 * returned over a write that went through is the shape eleven fences in this
 * repository turned out to have.
 *
 * WHAT THIS BLOCK CANNOT DO, STATED RATHER THAN DISCOVERED. `op=ratify` and
 * `op=caseratify` rest on a REAL SSHSIG, so with no `ssh-keygen` on PATH their
 * four arms cannot be driven at all — a caller refused over a signature it could
 * never have presented proves nothing. They are then SKIPPED BY NAME and the
 * equality below carries them as NOT DRIVEN, so it reports a hole instead of
 * passing over one; the arm still FAILS, by name, on any fence the harvest finds
 * that neither ran nor was skipped. And the harvest is a walk over LITERALS with
 * comments blanked: it cannot see a code assembled from a template, which
 * `refusal-wire.test.mjs` 3b gates at empty for both sources.
 * ==================================================================== */
console.log("\n--- 3b. D-503 · the five fences src/index.mjs mints, DRIVEN through the op ---");
{
  const INDEX_BARE = decomment(readFileSync(SRC("index.mjs"), "utf8"));
  const INDEX_HARVEST = [...new Set([...INDEX_BARE.matchAll(/"((?:MACHINE|OPERATOR_TOKEN)_CANNOT_[A-Z_]+)"/g)]
    .map((m) => m[1]))].sort();
  console.log(`    src/index.mjs mints ${INDEX_HARVEST.length} fence code(s): ${INDEX_HARVEST.join(", ")}`);
  t("the src/index.mjs harvest found a REAL set and not an empty one — the guard BEFORE the equality, "
  + "because two empty sets agree for free and this project has measured a headline arm passing over an "
  + "empty corpus three times",
    INDEX_HARVEST.length >= 5, true);

  const IDX_DRIVEN = [];            /* { code, answer } — what was actually driven */
  const IDX_SKIPPED = [];           /* { code, why }    — what could not be, BY NAME */
  const idxFence = (code, payload, answer) => {
    IDX_DRIVEN.push({ code, answer });
    t(`${code} — refused BY NAME through the op, under a COMPLETE payload: ${payload}`, answer, code);
  };
  /* The refusal's SENTENCE is the catalogue's, never one typed at the site (DEC-49),
     so each pin asks the row rather than repeating its words here. */
  const catGot = (r, code) => [r && r.check, r && r.translation === MACHINE_FENCE_CHECKS[code]?.translation];
  const catWant = (code) => [MACHINE_FENCE_CHECKS[code]?.check, true];

  /* ---------------------------------------- (a)+(b) THE TWO RATIFICATION ACTS */
  if (spawnSync("ssh-keygen", ["-Q"]).error) {
    for (const c of ["MACHINE_CANNOT_RATIFY", "MACHINE_CANNOT_RATIFY_CASE",
                     "OPERATOR_TOKEN_CANNOT_RATIFY", "OPERATOR_TOKEN_CANNOT_RATIFY_CASE"])
      IDX_SKIPPED.push({ code: c, why: "ssh-keygen is not on PATH" });
    console.log("  SKIP  the four ratification fences — ssh-keygen is not on PATH, and their authority is a "
              + "REAL member signature; a caller refused over a signature it could never have presented "
              + "proves nothing about the fence");
  } else {
    const kdir = mkdtempSync(join(tmpdir(), "d503-machine-fences-"));
    const mkKey = (who) => {
      execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", who, "-f", join(kdir, who), "-q"]);
      return readFileSync(join(kdir, `${who}.pub`), "utf8").trim().split(/\s+/)[1];
    };
    /* THE STATEMENTS ARE WRITTEN OUT IN ASCII rather than imported from
       `src/sshsig.mjs`: an expectation taken from the thing under test agrees
       with it for free (CLAUDE.md §5). */
    let sigSeq = 0;
    const signBytes = (who, text) => {
      const f = join(kdir, `d503-stmt-${++sigSeq}`);
      writeFileSync(f, text);
      execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(kdir, who), "-n", "bio-ratify", f],
        { stdio: ["ignore", "ignore", "ignore"] });
      return readFileSync(`${f}.sig`, "utf8");
    };
    const reg = await POST("op=signeradd&token=adm-rec73",
      { keyB64: mkKey("ruth"), memberId: "ruth", comment: "ruth laptop (D-503)" });
    if (!reg || reg.ok === false) throw new Error(`signeradd: ${JSON.stringify(reg).slice(0, 400)}`);

    /* The ground: a real case, authored by RUTH, awaiting her signature. Its own
       fixture rather than block (iv)'s, so nothing this block drives can move
       what an earlier arm already asserted about that case. */
    const D503_PRJ = await makePublishingProject({
      post: POST, mf, sha, machineToken: "adm-rec73", owner: "ruth",
      name: "PROJ-2026-7303-d503-ratify", created: NOW, updated: LATER });
    const DOC = "INFO-2026-7303-d503-memo", LEAD = "INQ-2026-7303-d503-lead";
    await mustPromote(DOC, infoMd(DOC), "information");
    await mustPromote(LEAD, withAdoptableReading(
      inquiryMd(LEAD, { question: "Was the FY2024 transfer authorised?", refs: [DOC],
                        legs: [{ target: DOC, role: "supports" }] })), "inquiry");
    const cn = await GET(`op=conclude&token=${RUTH}&target=${LEAD}`
      + `&conclusion=${encodeURIComponent("The transfer rests on a memo nobody adopted.")}`
      + `&falsifier=${encodeURIComponent("An adopted resolution naming the transfer would overturn this.")}`
      + adoptedVersionParam());
    if (!cn || cn.ok === false) throw new Error(`conclude: ${JSON.stringify(cn).slice(0, 400)}`);
    const pub = await POST(`op=publish&token=${RUTH}`, {
      project: D503_PRJ, targets: [LEAD], roles: allLoadBearing({ targets: [LEAD] }),
      scope: "Whether the FY2024 transfer was authorised, on the documents in hand.",
      statement: "This case covers the FY2024 transfer only, on the documents in hand at edition 1.",
      excluded: [], subjectPosition: "sought_and_answered",
      subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
      biasAcknowledgement: "This group holds that transfers should be adopted in public session." });
    if (!pub || pub.ok === false || !pub.caseDocument || !/^[0-9a-f]{64}$/.test(String(pub.caseDocument.doc_sha)))
      throw new Error(`publish: ${JSON.stringify(pub).slice(0, 800)}`);

    /* A SECOND `ai` credential, scoped to the two acts — the block-2 credential's
       scope names neither, and a call refused at the CREDENTIAL layer would absorb
       a control aimed at the IDENTITY layer (PL-11's block 8, REC-123's restatement).
       Member-authored and member-scoped for the reason block 2 states at its mint. */
    const ratMint = await POST(`op=aicredentialmint&token=${RUTH}`, {
      tokenId: "d503-ratifier", principalKind: "member", principalMember: "ruth",
      taskScope: "D-503: the two ratification acts, driven under payloads that would otherwise succeed",
      writes: ["ratify", "caseratify"],
      note: "D-503. A member authored this scope so the credential layer is held OPEN and what answers "
          + "these calls is the identity fence rather than the gate in front of it." });
    if (!ratMint || ratMint.ok !== true) throw new Error(`aicredentialmint: ${JSON.stringify(ratMint).slice(0, 400)}`);
    const AI_R = ratMint.token;
    t("the ratifying `ai` credential's scope NAMES both acts, so nothing in front of the fence can be "
    + "what refuses these calls", (ratMint.credential || {}).writes, ["caseratify", "ratify"]);

    /* -------------------------------------------------------- (a) caseratify */
    const CD = pub.caseDocument;
    const caseBody = { caseId: CD.case_id, edition: CD.edition, expectedSha: CD.doc_sha,
                       sig: signBytes("ruth", `bio-ratify-case ${CD.case_id} ${CD.edition} ${CD.doc_sha}\n`) };
    const caseSays = async () => codeOf(await GET(`op=publishedcase&id=${CD.case_id}`));
    t("  the ground for (a): a case document authored by ruth at edition 1 awaits her signature, and "
    + "nothing about it is published", [CD.edition, await caseSays()], [1, "NOT_PUBLISHED"]);

    const mc = await POST(`op=caseratify&token=${AI_R}`, caseBody);
    idxFence("MACHINE_CANNOT_RATIFY_CASE",
      "a real case document at edition 1, with ruth's REGISTERED key's valid signature over that "
      + "document's own doc_sha, carried by an `ai` credential whose member-authored scope NAMES op=caseratify",
      codeOf(mc));
    t("  ...carrying the catalogue's check and its canned sentence rather than one typed at the site",
      catGot(mc, "MACHINE_CANNOT_RATIFY_CASE"), catWant("MACHINE_CANNOT_RATIFY_CASE"));
    t("  and the case is NOT committed under the machine's call — the public read still answers NOT_PUBLISHED",
      await caseSays(), "NOT_PUBLISHED");

    const oc = await POST("op=caseratify&token=adm-rec73", caseBody);
    idxFence("OPERATOR_TOKEN_CANNOT_RATIFY_CASE",
      "THE SAME signed bytes, carried by the operator's `admin`-class bearer token — a credential that "
      + "arrived through no one's session", codeOf(oc));
    t("  ...naming the class it refused, with the catalogue's check and canned sentence",
      [oc && oc.tokenClass, ...catGot(oc, "OPERATOR_TOKEN_CANNOT_RATIFY_CASE")],
      ["admin", ...catWant("OPERATOR_TOKEN_CANNOT_RATIFY_CASE")]);
    t("  and the case is STILL not committed", await caseSays(), "NOT_PUBLISHED");

    const hc = await POST(`op=caseratify&token=${RUTH}`, caseBody);
    t("  OVER-STRICTNESS, and the evidence the payload was COMPLETE: ruth committing THE SAME signed "
    + "bytes through her OWN signed-in session SUCCEEDS, and the record names her",
      [codeOf(hc), hc && hc.ok, hc && hc.attestor && hc.attestor.member], [null, true, "ruth"]);

    /* ------------------------------------------------------------ (b) ratify */
    const listed = await GET(`op=list&token=${RUTH}&limit=1000`);
    const leadSha = (Array.isArray(listed) ? listed : (listed && listed.bundles) || [])
      .find((b) => b.bundle_id === LEAD)?.bundle_sha ?? null;
    if (!/^[0-9a-f]{64}$/.test(String(leadSha))) throw new Error(`no bundle_sha for ${LEAD}`);
    const ratBody = { bundleId: LEAD, expectedSha: leadSha,
                      sig: signBytes("ruth", `bio-ratify ${LEAD} ${leadSha}\n`) };
    const publishedIds = async () => ((await GET("op=publishedmanifest"))?.published || [])
      .map((b) => b.bundle_id).filter(Boolean);
    t("  the ground for (b): the finding is not in the published manifest",
      (await publishedIds()).includes(LEAD), false);

    const mr = await POST(`op=ratify&token=${AI_R}`, ratBody);
    idxFence("MACHINE_CANNOT_RATIFY",
      "a concluded finding at the exact revision the caller states it reviewed, with ruth's REGISTERED "
      + "key's valid signature over that revision's sha, carried by an `ai` credential whose "
      + "member-authored scope NAMES op=ratify", codeOf(mr));
    t("  ...carrying the catalogue's check and its canned sentence",
      catGot(mr, "MACHINE_CANNOT_RATIFY"), catWant("MACHINE_CANNOT_RATIFY"));
    t("  and the finding is NOT published under the machine's call",
      (await publishedIds()).includes(LEAD), false);

    const or = await POST("op=ratify&token=adm-rec73", ratBody);
    idxFence("OPERATOR_TOKEN_CANNOT_RATIFY",
      "THE SAME signed bytes, carried by the operator's `admin`-class bearer token", codeOf(or));
    t("  ...naming the class it refused, with the catalogue's check and canned sentence",
      [or && or.tokenClass, ...catGot(or, "OPERATOR_TOKEN_CANNOT_RATIFY")],
      ["admin", ...catWant("OPERATOR_TOKEN_CANNOT_RATIFY")]);
    t("  and the finding is STILL not published", (await publishedIds()).includes(LEAD), false);

    const hr = await POST(`op=ratify&token=${RUTH}`, ratBody);
    t("  OVER-STRICTNESS, and the evidence the payload was COMPLETE: ruth ratifying THE SAME signed "
    + "bytes through her OWN signed-in session SUCCEEDS, and the finding is published",
      [codeOf(hr), hr && hr.ok, (await publishedIds()).includes(LEAD)], [null, true, true]);
  }

  /* ------------------------------------------------- (c) THE GOVERNANCE FENCE */
  {
    /* THE ACTS ARE READ OUT OF THE PLANE, never typed: a fourth governance act is
       driven the day it lands rather than the day somebody remembers this list. */
    const GOV = JSON.parse((/const GOVERNANCE_ACTIONS = (\[[^\]]*\]);/.exec(INDEX_BARE) || [])[1] || "null");
    t("GOVERNANCE_ACTIONS was READ OUT OF src/index.mjs and names op=membercaps — an unparsed list "
    + "would drive nothing while reading like a clean arm",
      Array.isArray(GOV) && GOV.length >= 3 && GOV.includes("membercaps"), true);
    const capsOf = async (who) => {
      const row = ((await POST(`op=memberlist&token=${RUTH}`))?.members || [])
        .find((m) => m.member_id === who) || null;
      return row ? (row.capabilities ?? null) : null;
    };
    const BEFORE = await capsOf("anna");
    const CAPS = ["contribute", "publish"];
    t("  the ground for (c): anna is on the roster and does NOT yet hold `publish`, so the edit below "
    + "is a real change and not a no-op dressed as one",
      [Array.isArray(BEFORE), (BEFORE || []).includes("publish")], [true, false]);

    const ob = await POST("op=membercaps&token=adm-rec73&by=ruth", { memberId: "anna", capabilities: CAPS, by: "ruth" });
    idxFence("OPERATOR_TOKEN_CANNOT_GOVERN",
      "a capability edit naming a real roster member and a real active administrator as its `by`, "
      + "carried by the operator's `admin`-class bearer token", codeOf(ob));
    t("  ...naming the class it refused, with the catalogue's check and canned sentence",
      [ob && ob.tokenClass, ...catGot(ob, "OPERATOR_TOKEN_CANNOT_GOVERN")],
      ["admin", ...catWant("OPERATOR_TOKEN_CANNOT_GOVERN")]);
    t("  and nothing the bearer asked for landed: anna's capabilities are the ones she had",
      await capsOf("anna"), BEFORE);

    const hb = await POST(`op=membercaps&token=${RUTH}`, { memberId: "anna", capabilities: CAPS });
    t("  OVER-STRICTNESS, and the evidence the payload was COMPLETE: ruth making THE SAME edit through "
    + "her OWN signed-in session SUCCEEDS, and anna holds `publish` on the read-back",
      [codeOf(hb), hb && hb.ok, ((await capsOf("anna")) || []).includes("publish")], [null, true, true]);
  }

  /* ------------------------------------------------------------ THE EQUALITY */
  const idxCodes = [...new Set(IDX_DRIVEN.map((d) => d.code))].sort();
  const skippedCodes = [...new Set(IDX_SKIPPED.map((s) => s.code))].sort();
  console.log(`    driven through the op: ${idxCodes.join(", ") || "(none)"}`);
  for (const s of IDX_SKIPPED) console.log(`    NOT DRIVEN: ${s.code} — ${s.why}`);
  t("(the drive is NON-EMPTY — the guard before the equality, since an empty driven set would satisfy "
  + "every comparison below for free)", idxCodes.length >= 1, true);
  t("D-503 · EVERY fence src/index.mjs mints was DRIVEN THROUGH ITS OP under a complete payload, and a "
  + "code this run could not reach is carried BY NAME as SKIPPED rather than passed over. A SIXTH fence "
  + "minted there with nothing driving it fails HERE, naming itself",
    INDEX_HARVEST.filter((c) => !idxCodes.includes(c)), skippedCodes);
  t("and nothing was driven that src/index.mjs does not mint — the other direction, so a fence deleted "
  + "from the plane while an arm still passes over it is a NAME here",
    idxCodes.filter((c) => !INDEX_HARVEST.includes(c)), []);
  t("every one of them answered with its OWN name, stated once as a set",
    IDX_DRIVEN.filter((d) => d.answer !== d.code).map((d) => [d.code, d.answer]), []);
}

/* ====================================================================== 4
 * THE SWEEP — WHICH OTHER REFUSALS ARE BELIEVED ON THE STRENGTH OF THEIR
 * FIRST HALF.
 *
 * WHAT THE INSTRUMENT IS. A refusal that sits in front of other refusals in the
 * same method SHADOWS them: while it fires, nothing behind it can. So a control
 * that drives it with a payload the plane would have refused anyway has shown
 * that the refusal FIRES and has not shown that the refusal is WHAT FIRES. This
 * walk measures the shadow — how many distinct refusals sit BEHIND each one in
 * its own method — and reports which of them any suite pins at all.
 *
 * AND WHAT IT CANNOT SEE, STATED RATHER THAN DISCOVERED. It cannot tell a
 * complete payload from an incomplete one: that is the judgement REC-73 made by
 * hand for twelve acts, and no walk over source can make it. It reads a method
 * as the span between two headers at class indent, so a refusal inside a nested
 * helper is attributed to the enclosing method. And it decides "pinned" by
 * looking for the code as a quoted literal in `test/`, so a suite that asserts a
 * code through a variable reads as no pin at all. Every one of those errs
 * towards reporting MORE work than exists, which is the safe direction for an
 * instrument whose subject is instruments.
 * ==================================================================== */
console.log("\n--- 4. the sweep: an instrument that proves less than it appears to, looked for elsewhere ---");
{
  const heads = [...STORE_BARE.matchAll(/^ {2}(?:static\s+)?(?:async\s+)?(#?[A-Za-z_$][\w$]*)\s*\(/gm)]
    .filter((m) => !/^(if|for|while|switch|catch|return|constructor)$/.test(m[1]));
  const methods = heads.map((h, i) => ({
    name: h[1], body: STORE_BARE.slice(h.index, i + 1 < heads.length ? heads[i + 1].index : STORE_BARE.length) }));
  const CODE = /(?:reason:\s*"([A-Z][A-Z0-9_]{2,})"|\brefusals?\s*\(\s*"([A-Z][A-Z0-9_]{2,})"|\brefuse\s*\(\s*"([A-Z][A-Z0-9_]{2,})")/g;
  /* An IDENTITY guard: the 300 characters in front of the refusal ask WHO the
     caller is rather than WHAT they sent. Deliberately generous — see the
     header's note on which direction this errs in. */
  const IDENTITY = /isMachineIdentity|isMachineStamp|isAdminMember|#isAdmin|\bactor\b|\bauthor\b|\bwho\b|\bviewer\b|principal|assignee|owner/;

  /* THIS FILE IS EXCLUDED FROM THE CORPUS IT READS, AND IT WAS NOT A
     PRECAUTION — it was measured. The expected set below is a literal array of
     quoted codes, so on the first run every one of them read as PINNED BY A
     SUITE and the arm reported an empty set: the instrument had cited itself as
     the evidence. That is REC-73's own subject arriving inside REC-73's own
     sweep, found the only way it could be — by running it. A mention here is
     not a pin, and the walk now says so. */
  const SELF = "machine-fences.test.mjs";

  /* ---- M0-18 · THIS WALK IS A DIFFERENT EXPOSURE FROM ITS SIX SIBLINGS, AND
   * IT NEEDED A DIFFERENT ANSWER. STATED HERE RATHER THAN COLLAPSED INTO THEM.
   *
   * The six walks M0-18 guarded elsewhere in this battery all FLOOR on what they
   * found, so a phantom could only push a floor UP and the fix was to compute the
   * floor over `git ls-tree HEAD` while the sweep kept reading the whole tree.
   * NOTHING HERE FLOORS ON THIS WALK. `methods` and `rows` come from
   * `STORE_BARE`, a `readFileSync` of one named path, and no arrival can inflate
   * those — the floor two blocks down is not this walk's, and the comment beside
   * it saying "the corpus this is claimed over is floored above" was WRONG about
   * WHICH corpus and is corrected below.
   *
   * WHAT THIS WALK DOES IS SATISFY A REQUIREMENT, WHICH FAILS IN THE GENEROUS
   * DIRECTION. `pinned()` asks whether ANY suite in this directory quotes a
   * refusal code, and the `unpinned` arm at the foot of this block demands the
   * answer be EMPTY. A phantom `.mjs` deposited into `test/` — `refs/stash` is
   * repository-wide across all sixty worktrees and `push -u` carries untracked
   * files (D-238, measured) — can only ADD strings, so it can only SHRINK
   * `unpinned`. A ratchet whose whole stated virtue is that it "cannot drift
   * either way" could therefore be satisfied by a file no other checkout has.
   * Blindness fails safe here (an empty walk pins nothing and `unpinned` grows,
   * loudly); ARRIVAL fails generous, and generous is the direction this project
   * treats as the serious one.
   *
   * SO `pinned()` ASKS ONLY THE COMMIT, AND THAT IS THE OPPOSITE NARROWING FROM
   * THE SIX. There it would have hidden a finding; here it is what makes the
   * finding visible, because a pin nobody has committed is a pin no other
   * checkout can see — the repository is the channel.
   *
   * THE COST, STATED BEFORE IT IS PAID rather than discovered by whoever pays it:
   * a worker who WRITES a pinning suite and has not committed it yet sees this
   * arm go RED. `scripts/provenance.mjs` deliberately REPORTS rather than fails
   * for exactly that reason, and this file departs from that provisional on one
   * ground: the report-only argument is about an instrument that would red on ANY
   * uncommitted suite, and this arm reds only when an uncommitted file is the
   * SOLE pin for a shadowing identity refusal. That is a narrow, true and
   * one-step-fixable state, and the failure NAMES the file and the code rather
   * than saying the count moved. THE ALTERNATIVE, if that proves wrong in
   * practice: assert on `unpinnedTree` and merely PRINT `unpinnedHead`. Reversing
   * costs one line, and the two sets are computed separately here so that it is
   * one line. */
  const TEST_FILES = readdirSync(DIR).filter((f) => f.endsWith(".mjs") && f !== SELF);
  const PROV = readGitProvenance(REPO);
  const committed = (f) => PROV.inHead === null ? true : PROV.inHead.has(repoPath(REPO, join(DIR, f)));
  const readOf = (f) => readFileSync(join(DIR, f), "utf8");
  const TESTS = TEST_FILES.map(readOf);
  const TESTS_HEAD = TEST_FILES.filter(committed).map(readOf);
  const pinnedTree = (code) => TESTS.some((s) => s.includes(`"${code}"`));
  const pinned = (code) => TESTS_HEAD.some((s) => s.includes(`"${code}"`));
  /* SAY UNVERIFIED, NEVER CLEAN (D-233). When git cannot answer, `committed()`
     says true for everything, the two rosters collapse, and this arm degrades to
     exactly its pre-M0-18 behaviour — which is the honest degradation and is
     asserted below rather than assumed. */
  const PIN_HEAD_SAYS = PROV.inHead === null
    ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so `pinned()` read the whole working tree and this is NOT a claim about any commit"
    : `in the commit at HEAD (${PROV.headSha})`;

  const rows = [];
  for (const m of methods) {
    const seq = [];
    for (const h of m.body.matchAll(CODE)) {
      const c = h[1] || h[2] || h[3];
      if (!seq.some((s) => s.code === c)) seq.push({ code: c, at: h.index });
    }
    seq.forEach((s, i) => {
      if (!IDENTITY.test(m.body.slice(Math.max(0, s.at - 300), s.at))) return;
      rows.push({ method: m.name, code: s.code, shadows: seq.length - 1 - i,
        pinned: pinned(s.code), pinnedTree: pinnedTree(s.code) });
    });
  }
  /* REC-214, AN EXTENSION OF THE WALK AND NOT AN EXEMPTION. C-32.19's region moved into ONE private helper,
     `#machineRiskTierRefusal`, that two methods ask first (`promote`'s action block and `actionRiskTier`) —
     DEC-49's one-code-one-site rule, which a code inlined in two bodies would break. Read method by method, the
     helper's body holds that one refusal and nothing behind it, so the walk scored the fence as shadowing NOTHING
     while in both callers it stands in front of every payload complaint. So a fence found in a PRIVATE helper is
     ALSO attributed to each `this.#helper(` call site, with the distinct refusals that sit behind the call in the
     caller — which is what "shadows" has always meant. The helper's own row stays; the fence arm below judges
     each code by its DEEPEST site. It still errs towards more work, the header's safe direction: a helper nobody
     calls keeps its zero. */
  for (const hr of rows.filter((r) => r.method.startsWith("#")).slice()) {
    for (const m of methods) {
      if (m.name === hr.method) continue;
      const call = m.body.indexOf(`this.${hr.method}(`);
      if (call < 0) continue;
      const behind = new Set();
      for (const h of m.body.slice(call).matchAll(CODE)) {
        const c = h[1] || h[2] || h[3];
        if (c !== hr.code) behind.add(c);
      }
      rows.push({ method: `${m.name} -> ${hr.method}`, code: hr.code, shadows: behind.size,
        pinned: hr.pinned, pinnedTree: hr.pinnedTree });
    }
  }
  /* THE CORPUS IS FLOORED BEFORE ANY CLAIM IS MADE OVER IT. A walk that stopped
     yielding would otherwise report "nothing believed on half its evidence" and
     read as good news — REC-70's blind ratchet, one instrument over.
     CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED, and the correction is about
     WHICH corpus this arm floors: `methods` and `rows` are read out of
     `STORE_BARE`, a `readFileSync` of ONE named path, so this line has never said
     anything about the `readdirSync` of `test/` that feeds `pinned()`. The old
     note at the `unpinned` arm claimed it did. The pin roster is floored
     separately, immediately below, which is what that note was reaching for. */
  t("(the walk reached a real corpus: methods, and identity-flavoured refusals inside them — read out of "
  + "store.mjs by name, so this floor is NOT a statement about the test/ walk below it)",
    [methods.length >= 300, rows.length >= 90], [true, true]);
  console.log(`  pin roster: ${TEST_FILES.length} suite(s) in test/ walked, ${TESTS_HEAD.length} of them `
    + `${PIN_HEAD_SAYS} — \`pinned()\` reads THOSE`);
  reportProvenance({
    prov: PROV,
    items: TEST_FILES.map((f) => ({ path: repoPath(REPO, join(DIR, f)), what: f,
      counted: "read as a source of refusal-code pins" })),
    instrument: "the pin roster walk",
    corpus: `${TEST_FILES.length} suite(s) walked, ${TESTS_HEAD.length} of them in the commit`,
    totals: PROV.inHead === null ? [] : [
      { label: "pinning suites", contaminated: TEST_FILES.length, reproducible: TESTS_HEAD.length, source: "suites" },
    ],
  });
  /* AND THE PIN ROSTER REACHED SOMETHING. `pinned()` returning false for
     everything makes `unpinned` GROW, which fails loudly — but it would fail
     while naming eight codes rather than naming the blind walk, and the next
     reader would go looking for the wrong defect. Floored so the blindness is
     reported as blindness. */
  t(`(and the PIN ROSTER reached a real corpus — a walk that read nothing would fail the arm below `
  + `while naming codes instead of naming itself: ${TESTS_HEAD.length} suite(s) ${PIN_HEAD_SAYS})`,
    TESTS_HEAD.length >= 50, true);

  const fences = rows.filter((r) => r.code.startsWith("MACHINE_CANNOT_"));
  t("the walk SEES the class it was built from — all twelve fences are identity guards it found",
    [...new Set(fences.map((r) => r.code))].sort(), HARVEST);
  t("and EVERY ONE of them shadows at least one payload complaint, which is the whole reason a "
  + "complete payload was needed to prove any of them",
    [...new Set(fences.map((r) => r.code))]
      .filter((c) => Math.max(...fences.filter((r) => r.code === c).map((r) => r.shadows)) < 1), []);

  const shadowing = rows.filter((r) => r.shadows >= 1 && !r.code.startsWith("MACHINE_CANNOT_"));
  const unpinned = [...new Set(shadowing.filter((r) => !r.pinned).map((r) => r.code))].sort();
  /* M0-18: the same answer over the WHOLE working tree, kept so the DIFFERENCE
     is nameable. A code in `pinnedOnlyByUncommitted` is one this checkout can
     see pinned and no other checkout can — the phantom's signature, and the
     thing the failure message must say instead of "a code went unpinned". */
  const unpinnedTree = [...new Set(shadowing.filter((r) => !r.pinnedTree).map((r) => r.code))].sort();
  const pinnedOnlyByUncommitted = unpinned.filter((c) => !unpinnedTree.includes(c));
  console.log(`  ${rows.length} identity-flavoured refusals across ${methods.length} methods; `
    + `${shadowing.length} of them shadow something and are NOT part of the twelve.`);
  console.log("  the ten deepest shadows outside the family, which is where this class lives next:");
  for (const r of [...shadowing].sort((a, b) => b.shadows - a.shadows).slice(0, 10))
    console.log(`    ${r.code.padEnd(32)} ${r.method.padEnd(26)} shadows ${String(r.shadows).padEnd(3)} `
      + `${r.pinned ? "pinned by a suite" : "** NO SUITE PINS IT AT ALL **"}`);
  /* WORSE THAN BELIEVED ON HALF ITS EVIDENCE: not measured at all. Pinned as an
     EXACT SET rather than a ceiling, so it must be moved deliberately in BOTH
     directions — a ceiling with slack is not a ratchet (PL-4 measured one 19
     codes low that had already flipped a control from RED to GREEN). To move
     it: name the code, say whether it was pinned or removed, and date it.

     MOVED 2026-08-08 BY REC-78, FROM EIGHT TO NONE, and every member of the set
     moved for the SAME reason — PINNED, none removed. All eight are now driven
     in `test/shadowed-refusals.test.mjs`, each under a payload complete but for
     the one condition it guards, each followed by the same act driven to
     success: BAD_HANDLE (enroll), EDITION_NOT_INCREMENTED (ratify), LEASE_HELD
     (actioncorrespond), NOT_ACTIVE (projectowneradd), NOT_AN_OWNER
     (projectownerremove), NO_AUTHOR (provenancechain, at the Durable Object
     route — REC-78 measured that NO caller class can reach it through the op,
     and pins the unreachability beside it), NO_CASE (queuemute), NO_OWNERS
     (projectownerrescue).

     THE EMPTY SET IS STILL A SET AND STILL FAILS IN BOTH DIRECTIONS. A ninth
     unpinned identity refusal appearing fails this arm; deleting REC-78's suite
     puts all eight back and fails it too, because `pinned()` reads `test/` and
     nothing else.

     CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED, AND THE OLD NOTE HERE WAS
     WRONG ABOUT WHICH CORPUS DEFENDED THIS ARM. It read: *"the corpus this is
     claimed over is floored above, so an empty answer produced by a walk that
     went blind is caught before it gets here."* The floor above is over
     `methods` and `rows`, both read out of `store.mjs` BY NAME. The walk that
     can go blind is the `readdirSync` of `test/` behind `pinned()`, and nothing
     floored it. That floor now exists, immediately after the report — the note
     was reaching for a defence that had not been built.

     AND BLINDNESS WAS NEVER THIS ARM'S EXPOSURE ANYWAY. A pin roster that read
     NOTHING makes `unpinned` GROW and fails loudly. What could pass quietly is
     the opposite: an ARRIVAL. `pinned()` now asks `git ls-tree HEAD`, so a pin
     living only in an uncommitted file no longer satisfies this set, and the
     arm below names that case as itself rather than as a missing pin. The full
     argument, its cost, and the one-line way to reverse it are at the pin roster
     walk above. */
  t("the identity refusals that shadow something and that NO suite pins at all — MEASURED "
  + "2026-08-08 by REC-73, moved to EMPTY 2026-08-08 by REC-78 which pinned all eight, and this is "
  + "a set rather than a count so it cannot drift either way. M0-18: a pin is a pin IN THE COMMIT, "
  + `because a pin no other checkout can see is not one (${PIN_HEAD_SAYS})`,
    unpinned, []);
  /* NAMED SEPARATELY so the two failures do not read alike. A code here is
     pinned in this tree and in no commit — the arm above will already be red,
     and this is the sentence that says WHY, so nobody goes looking for a missing
     assertion that is sitting uncommitted in their own working directory. */
  t("...and no code owes its pin to a file that is in no commit — a pin that arrived rather than being "
  + "written here would satisfy the set above for free, which is D-238's payload in the generous direction",
    pinnedOnlyByUncommitted, []);
}

console.log(`\n${fail === 0 ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`);
} finally {
  await mf.dispose();
}
process.exit(fail === 0 ? 0 : 1);
