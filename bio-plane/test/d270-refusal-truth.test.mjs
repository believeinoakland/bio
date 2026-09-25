/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d270-refusal-truth.control.mjs` — deliberately NOT a
   `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it
   (PL-3, PL-4, PL-11, REC-73, D-262 and REC-79's precedent). The harness lives INSIDE this worktree,
   never in the shared scratchpad; every restore is verified by sha256 AND by `cmp` against a
   UNIQUELY-NAMED per-arm pristine copy, printing a byte count under a guarded minimum; a BASELINE arm
   runs FIRST so a run in which every arm reports the same thing is distinguishable from one in which
   the arms worked. Declared before arming — what MUST fail and what MUST NOT. Actual figures are
   written into the control driver's header when it runs, INCLUDING any arm that came back other than
   declared.
   (a) BASELINE — nothing armed. MUST be green; every other arm's figure is read against it.
   (b) THE SPLIT COLLAPSED — `sessionOpGate`'s three outcomes reduced to the single
       `MACHINE_CREDENTIAL_REQUIRED` return `main` carried before D-270. MUST FAIL naming the ROLE
       ops (one since REC-159: `governorconfig`) AND the omission ops BY NAME (none on the real plane since
       REC-155 ruled all seven by §4.10, so the omission is the unruled fixture op `rec155unruled`). This is the arm the row's accepts-when demands, and it
       is the arm that proves this suite grades the DISTINCTION rather than the presence of a code.
   (c) THE DECLARATION EMPTIED — `UNATTENDED_BY_DECISION` set to `{}`. MUST FAIL naming `purge`,
       `cpuprobe`, `capturerequestdrain` and `taskdrain` (and since REC-155 `livefire` and `reproject`),
       which would then be told an omission. This
       is the arm for BOB #17's rule itself: the plane may say "not for a person" ONLY where a
       decision is recorded, so emptying the record must change what the plane says.
   (d) THE DECLARATION INVENTED — `adminendorse` ADDED to `UNATTENDED_BY_DECISION`. MUST FAIL naming
       `adminendorse`. This is the arm in the direction that matters: D-136 exists because the §4.7
       vote IS meant to be cast by a person, and a false rationale here suppresses its own bug report.
   (e) A CODE GOES BACK TO BEING CODELESS — `requiredArgument`'s `reason`/`code` keys dropped, `error`
       left in place. MUST FAIL on the codeless-residue set naming `capture`, `monitor`,
       `pdfstructure`. D-270's own defect, re-armed.
   (f) THE OP WALK GOES BLIND — the `OPS` parse in THIS FILE neutered. MUST FAIL on the op-corpus
       FLOOR, BEFORE any membership claim is made over the empty set, and MUST NOT be able to report
       "0 codeless refusals" as good news.
   (g) THE ADMIN SESSION IS NOT ONE — the admin arm pointed back at a member session. MUST FAIL on the
       ARM-IS-REAL assertion rather than by silently measuring a split of zero. THIS ARM IS A MEASURED
       MISTAKE INHERITED RATHER THAN IMAGINED: the 2026-08-09 D-270 harness used a member whose role
       row said administrator, measured a split of ZERO twice, and would have decided the interface
       question on a corpus that structurally could not contain the answer.
   **RUN 2026-09-19 IN WORKTREE d270-record, TWICE, FIGURES AS THE DRIVER PRINTED THEM.**
   FIRST RUN: SIX of eight as declared — a GREEN 28/0 · b RED 22/6 · d RED 27/1 · e RED 26/2 ·
   f RED 19/9 · g RED 27/1 · h GREEN 28/0; **(b) and (c) came back NOT AS DECLARED and BOTH were
   findings about the INSTRUMENT rather than the subject, recorded rather than smoothed.**
   (b) was RED naming exactly the ops declared, but the DRIVER demanded every patch match once
   and (b) legitimately makes two replacements — the driver's check was wrong, not the arm, and
   it now declares an expected match count per arm. (c) was RED and named NONE of the four ops:
   **the by-name map in section 6 READS `UNATTENDED_BY_DECISION` out of the source and grades the
   plane against it, so emptying the record moves BOTH SIDES of that map together and it agrees
   with itself for free.** The arm was right and the declaration was wrong. The suite gained a
   LITERAL pin of the recorded-decision set in the same turn — which is the thing that can
   actually see the record emptied or invented into — and (c) was re-declared onto it.
   SECOND RUN, after both corrections: **ALL EIGHT AS DECLARED — a GREEN 29/0 · b RED 23/6 ·
   c RED 26/3 · d RED 27/2 · e RED 27/2 · f RED 19/10 · g RED 28/1 · h GREEN 29/0**, every armed
   file byte-identical to its per-arm pristine-of-record by sha256 AND by `cmp`, each above a
   guarded byte floor (680591 for index.mjs, 37736 for this suite).
   RE-RUN 2026-09-23 BY THE REC-159 WORKER (branch `land/worker/REC-159`, base `a8f6094a`) after arm
   (b)'s named ops were CORRECTED — `memberadd` and `signeradd` left the ROLE arm for both session sets,
   so they were replaced by `governorconfig` and `provenanceroute`, declared before arming: **8/8 AS
   DECLARED — a GREEN 33/0 · b RED 27/6 naming governorconfig and provenanceroute · c RED 30/3 ·
   d RED 32/1 · e RED 30/3 · f RED 21/12 · g RED 32/1 · h GREEN 33/0**, every restore sha256 MATCH and
   `cmp` clean (index.mjs 743,212 B; this suite 45,891 B).
   RE-RUN 2026-09-25 BY THE REC-155 WORKER (branch `land/worker/REC-155`, base `8bdf20e6`) after §4.10 emptied the
   real omission arm: arm (b)'s omission op re-declared onto the unruled fixture op, arm (c) widened to the two
   new recorded decisions, both before arming: **8/8 AS DECLARED — a GREEN 35/0 · b RED 29/6 naming
   governorconfig and rec155unruled · c RED 31/4 naming all six recorded ops · d RED 34/1 · e RED 32/3 ·
   f RED 23/12 · g RED 34/1 · h GREEN 35/0** (h now reaches the rewritten site THROUGH the fixture, which reads
   the armed `src/index.mjs` from disk), every restore sha256 MATCH and `cmp` clean (index.mjs 842,163 B; this
   suite 50,607 B).
   RE-RUN 2026-09-25 BY THE REC-162 WORKER (branch `land/worker/REC-162`, base `8bdf20e6`). Arm (b) was
   CORRECTED — the ROLE outcome became two returns, one per set, so it now arms three sites — and two arms
   were ADDED, declared before arming: (i) THE ROW'S OWN CONTROL, the administrator sentence restored for a
   founder-only op, MUST FAIL naming `governorconfig`; (j) OVER-STRICTNESS, the founder's-session `detail`
   respelled, MUST PASS. **10/10 AS DECLARED — a GREEN 34/0 · b RED 26/8 armed 3/3 · c RED 31/3 · d RED 33/1 ·
   e RED 31/3 · f RED 22/12 · g RED 33/1 · h GREEN 34/0 · i RED 33/1 naming governorconfig · j GREEN 34/0**,
   every restore sha256 MATCH and `cmp` clean (index.mjs 840,734 B; this suite 48,254 B at the run, before this
   paragraph was written).
   (h) OVER-STRICTNESS, and this file exists to survive it: a REAL site rewritten to spell its code in
       `code` with NO `reason` at all, the row IMPORTED rather than hand-copied, and an extra key the
       grader has never seen. It MUST PASS. A grader that reports correct work as a violation teaches
       the next author to route around it — measured on 2026-08-09, when this item's ancestor's
       equivalent arm came back RED and the GRADER moved, not the arm.
 * =========================================================================
 * d270-refusal-truth.test.mjs — D-270. **THE SESSION GATE ANSWERED THREE
 * DIFFERENT FACTS WITH ONE SENTENCE, AND THE SENTENCE WAS FALSE FOR TWO OF
 * THEM.**
 *
 * THE RULE THIS SUITE ENFORCES IS BOB #17's, AND ITS HOME IS CITED RATHER THAN
 * RESTATED: `docs/architecture/BIO_Membership_Architecture_v2.md` §4, the §4.7
 * block — *"the plane must not tell a member that this absence is a decision …
 * this verb is not for a person is a design claim the plane may make only where
 * such a decision exists, and here none does."* The generating rule is one
 * line: **a refusal may state only what the system can support.**
 *
 * SO THE GATE HAS THREE OUTCOMES, NOT ONE AND NOT TWO:
 *
 *   (a) `MACHINE_CREDENTIAL_REQUIRED` — *this verb is not for a person.* A
 *       DESIGN CLAIM, sayable ONLY where a decision is RECORDED. The plane holds
 *       the record in `UNATTENDED_BY_DECISION` and CITES it in the refusal, so
 *       the claim and its warrant travel together.
 *   (b) `SESSION_ROLE_CANNOT_REACH_OP` — *your credential does not reach this
 *       verb.* Always sayable, because it is about the CALLER rather than about
 *       the design, and it is COMPUTED from `SESSION_OPS` at the site rather
 *       than declared — so it cannot become false without the gate itself
 *       changing.
 *   (c) `SESSION_ROUTE_NOT_RECORDED` — an OMISSION. Neither of the above:
 *       state the fact, invent no rationale.
 *
 * **WHY (c) HAD TO EXIST, AND IT IS THE WHOLE ARGUMENT.** A member told an
 * absence is a DECISION will not report it as a gap — so the false sentence
 * actively recruits the person who could have caught it into believing there is
 * nothing to catch. `adminendorse`, `adminremove` and `membercaps` are the
 * measured case: D-136 exists precisely because the §4.7 vote IS meant to be
 * cast by a person, and until D-270 the plane told the administrator that the
 * act §4.9 assigns them needs a credential §4.8 says somebody else holds.
 * `docs/archive/research/CAPABILITIES.md` (F-4) recorded that independently and
 * said there is no action a member can take from it.
 *
 * **AND (a) IS NARROWER THAN IT LOOKS.** `op=provenancechain` and
 * `op=provenanceroute` were inside the old sentence's reach, and their OWN OPS
 * rows say the opposite of it in as many words — *"NOT open to `daemon`:
 * deciding that the evidence supports a route is a named member's judgement"*.
 * The plane was telling a member that an op reserved to a named member's
 * judgement is performed by an unattended writer. A two-way split would have
 * made that permanent under a canned translation, which is worse than the bare
 * string it replaced.
 *
 * WHAT THIS SUITE GRADES THAT NOTHING ELSE DOES. `refusal-wire.test.mjs` grades
 * the ENVELOPE (does a received code carry its row). `admission-gate.test.mjs`
 * grades the FAMILY (is every C-38 row driven). The DEC-49 guard grades the SITE
 * against the CATALOGUE. **None of them grades WHICH of three refusals a caller
 * got**, and that is the whole of D-270: a code that does not distinguish has
 * translated nothing. So every assertion below is over a SET OF OPS BY NAME,
 * never over a count and never over "a refusal occurred".
 *
 * WHAT IT CAN AND CANNOT SEE, and the sentence is load-bearing:
 *   - IT CAN SEE every refusal an EMPTY payload provokes from an op in the OPS
 *     table, under a member session and under a real administrator's session.
 *   - IT CANNOT SEE a refusal only a richer payload provokes; a refusal returned
 *     as raw bytes or HTML rather than through `json()`; or the PRE-
 *     AUTHENTICATION surfaces, which no credential reaches. Those are NAMED on
 *     every run rather than assumed absent. CORRECTED 2026-09-23 BY D-278: this
 *     read *"which are D-278's subject"* — true until D-278 landed and false
 *     after, since they are no longer codeless. They are GRADED by
 *     `d278-codeless-refusals.test.mjs`, and section 9 now DRIVES one of them
 *     rather than naming the group as open.
 *   - IT IS NOT A LIVE PROBE. A green harness is not a serving build (D-108).
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ADMISSION_CHECKS, REQUIRED_ARGUMENT_CHECKS } from "../checks/bio-checks.mjs";
import { unruledOpPlane, unruledOpMemberSession, UNRULED_OP } from "./unruled-op-fixture.mjs";

const SRC = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const INDEX_SRC = readFileSync(SRC, "utf8");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC, script: INDEX_SRC,
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  /* R2 IS BOUND, and it is not boilerplate here: `op=capture` and
     `op=pdfstructure` test `env.CAPTURES?.get` BEFORE they test their argument,
     so without the bucket both answer "R2 is not configured on this instance"
     and section 8 measures the wrong refusal entirely. Its first run did exactly
     that and reported the argument complaint as missing on two of three ops. */
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "t-admin-1", MEMBER_TOKEN: "t-member-1", PROBE_TOKEN: "t-probe-1", VERSION: "test" },
});

const GET = async (q) => (await mf.dispatchFetch("http://x/api/?" + q)).json();
const POST = async (q, body) => (await mf.dispatchFetch("http://x/api/?" + q,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

try {

/* ====================================================================== 1
 * THE CATALOGUE ROWS — IMPORTED, NEVER HAND-COPIED, AND FLOORED FIRST.
 * A hand copy agrees with its original for free; this project has measured that
 * five times. And a headline assertion over an EMPTY family passes and says
 * nothing — measured three times — so the floor comes before any claim.
 * ==================================================================== */
console.log("\n=== D-270 · the session gate's three outcomes, and the truth of each ===");
console.log("\n--- 1. the rows, imported and floored ---");
const NEEDED = ["MACHINE_CREDENTIAL_REQUIRED", "SESSION_ROLE_CANNOT_REACH_OP", "SESSION_ROUTE_NOT_RECORDED"];
console.log(`    ADMISSION_CHECKS: ${Object.keys(ADMISSION_CHECKS).length} rows`);
console.log(`    REQUIRED_ARGUMENT_CHECKS: ${Object.keys(REQUIRED_ARGUMENT_CHECKS).length} row(s)`);
/* A LIAR PASSES THIS most cheaply by adding three empty rows. That does not make
   the world right, so the shape of each row is asserted beside its presence. */
t("the gate's three rows all exist — a two-way split would be short by one, which is exactly what "
+ "IC-55 proposed in 2026-08 and what BOB #17's ruling corrects",
  NEEDED.filter((c) => !ADMISSION_CHECKS[c]), []);
t("and each carries a C-38 number and a translation long enough to be a sentence",
  NEEDED.filter((c) => !/^C-38\.\d+$/.test(String(ADMISSION_CHECKS[c]?.check || ""))
                    || String(ADMISSION_CHECKS[c]?.translation || "").trim().split(/\s+/).length < 12), []);
t("the argument-complaint row exists and carries its own C-61 number",
  [REQUIRED_ARGUMENT_CHECKS.REQUIRED_ARGUMENT_MISSING?.check,
   typeof REQUIRED_ARGUMENT_CHECKS.REQUIRED_ARGUMENT_MISSING?.translation],
  ["C-61.1", "string"]);
/* THE SWAP ARM. Nothing else in the repository refuses an exchange of C-numbers
   WITHIN one family — arm A of the DEC-49 guard refuses a number claimed by two
   families, and a swap inside one leaves every guard green while `op=audit`
   attributes each refusal to the other one's check. */
t("each C-number sits under the code it was minted for — a swap inside one family is invisible to "
+ "every other guard and would misattribute the check op=audit reports",
  NEEDED.map((c) => `${c}=${ADMISSION_CHECKS[c].check}`),
  ["MACHINE_CREDENTIAL_REQUIRED=C-38.3",
   "SESSION_ROLE_CANNOT_REACH_OP=C-38.7",
   "SESSION_ROUTE_NOT_RECORDED=C-38.8"]);

/* ====================================================================== 2
 * THE OPS AND THE DECLARATION — PARSED OUT OF THE PLANE'S OWN SOURCE, FLOORED,
 * PRINTED. A hand list goes stale the day a new op lands, and that staleness is
 * what produced D-270 in the first place.
 *
 * STATED PLAINLY, BECAUSE IT IS WHAT LETS A READER TELL A CLEAN RESULT FROM A
 * WALK LOOKING IN THE WRONG PLACE: this parse reads `SESSION_OPS`' two sets with
 * every `...SPREAD` resolved against the const it names, and the `OPS` table by
 * BRACE MATCHING rather than by a line regex. A line regex was tried first and
 * read 103 rows where there are 195, calling every one mutating — it would have
 * reported the five role-gated ops as two, and nothing downstream would have
 * looked wrong. UNRESOLVED SPREADS ARE COUNTED AND ASSERTED ZERO: an unresolved
 * spread silently UNDERCOUNTS both sets, which moves ops into the wrong arm.
 * ==================================================================== */
console.log("\n--- 2. the op corpus, parsed out of the plane's own table ---");
const sessBlk = (() => { const i = INDEX_SRC.indexOf("const SESSION_OPS = {");
  return i < 0 ? "" : INDEX_SRC.slice(i, INDEX_SRC.indexOf("\n};", i)); })();
const mIdx = sessBlk.indexOf("member: new Set(["), aIdx = sessBlk.search(/admin:\s+new Set\(\[/);
const listOf = (n) => { const m = INDEX_SRC.match(new RegExp(`const ${n} = \\[([^\\]]*)\\]`));
  return m ? [...m[1].matchAll(/"([a-z0-9]+)"/g)].map((x) => x[1]) : null; };
let unresolvedSpreads = 0;
const expand = (blk) => {
  const s = new Set([...blk.matchAll(/"([a-z0-9]+)"/g)].map((m) => m[1]));
  for (const sp of [...blk.matchAll(/\.\.\.([A-Z_]+)/g)].map((m) => m[1])) {
    const v = listOf(sp);
    if (v === null) { unresolvedSpreads++; continue; }
    v.forEach((o) => s.add(o));
  }
  return s;
};
const MEMBER_SET = mIdx >= 0 && aIdx >= 0 ? expand(sessBlk.slice(mIdx, aIdx)) : new Set();
const ADMIN_SET  = mIdx >= 0 && aIdx >= 0 ? expand(sessBlk.slice(aIdx))       : new Set();

const opsBody = (() => { const i = INDEX_SRC.indexOf("const OPS = {");
  return i < 0 ? "" : INDEX_SRC.slice(i + "const OPS = {".length); })();
const OPROWS = new Map();
{
  const re = /^  ([a-z0-9]+):\s*\{/gm;
  let m;
  while ((m = re.exec(opsBody)) !== null) {
    let k = m.index + m[0].length - 1, dep = 0;
    for (; k < opsBody.length; k++) {
      if (opsBody[k] === "{") dep++;
      else if (opsBody[k] === "}") { dep--; if (dep === 0) break; }
    }
    OPROWS.set(m[1], opsBody.slice(m.index, k + 1));
  }
}
const MUTATING = [...OPROWS].filter(([, b]) => /\bmutating:\s*true/.test(b)).map(([n]) => n);
const classesOf = (n) => { const c = (OPROWS.get(n) || "").match(/classes:\s*\[([^\]]*)\]/);
  return c ? [...c[1].matchAll(/"([a-z]+)"/g)].map((x) => x[1]) : []; };

/* THE DECLARATION, read out of the plane's own source. It is read rather than
   copied for the same reason the rows are imported: a copy agrees for free. */
const declBlk = (() => { const i = INDEX_SRC.indexOf("const UNATTENDED_BY_DECISION = {");
  return i < 0 ? "" : INDEX_SRC.slice(i, INDEX_SRC.indexOf("\n};", i)); })();
const DECLARED = new Set([...declBlk.matchAll(/^\s{2}([a-z0-9]+):\s*"/gm)].map((m) => m[1]));

console.log(`    SESSION_OPS: member ${MEMBER_SET.size} · admin ${ADMIN_SET.size} · unresolved spreads ${unresolvedSpreads}`);
console.log(`    OPS: ${OPROWS.size} rows parsed · ${MUTATING.length} mutating`);
console.log(`    UNATTENDED_BY_DECISION: ${DECLARED.size} op(s) — ${[...DECLARED].sort().join(" ")}`);

/* THE FLOOR COMES BEFORE ANY MEMBERSHIP CLAIM. A liar passes every set
   assertion below over an EMPTY corpus, so the corpus is floored FIRST and the
   floors are deliberately far under today's figures — a floor at today's exact
   number is a ratchet nobody meant to write. */
t("the op table parsed — floored BEFORE any claim is made over it, because every set assertion "
+ "below is vacuously true over an empty parse and 'nothing is codeless' would read as good news",
  [OPROWS.size > 150, MUTATING.length > 80, MEMBER_SET.size > 80, ADMIN_SET.size > 80], [true, true, true, true]);
t("every SESSION_OPS spread resolved — an unresolved one silently UNDERCOUNTS both sets and moves "
+ "ops into the wrong arm of the split, which no assertion downstream could see",
  unresolvedSpreads, 0);

/* ====================================================================== 3
 * THE THREE ARMS, DERIVED FROM THE SOURCE — the denominator every by-name
 * assertion below is read against.
 * ==================================================================== */
/* WHICH OPS ACTUALLY REACH THIS GATE, and the exclusions are STRUCTURAL, NAMED,
   and then CHECKED BY DRIVING rather than taken on trust. The first run of this
   suite predicted the gate's corpus from `SESSION_OPS` alone and was wrong about
   five ops — which is a finding about the instrument and is recorded here rather
   than smoothed away, because a denominator quietly fitted to the answer is how
   a walk comes to grade whatever the code happens to do.

   (1) `classes: null` is UNGATED. `op=reviewcopy` and `op=reviewcomment` carry a
       secret instead of a credential and pass the admission gate entirely; the
       first run saw `NO_REVIEW_COPY` and counted it as a gate answer.
   (2) `op=export` is intercepted ABOVE the session gate by section 8.1's own
       `ROOT_OF_TRUST_REQUIRED`, which exists because the generic sentence was
       "true and misleading" for it — the same defect this item generalises, and
       already fixed for that one op.
   (3) The PRE-AUTHENTICATION ops are reached with no session at all, so no
       session token can carry a caller to this gate. Their own refusals are
       coded by D-278 and graded in `d278-codeless-refusals.test.mjs` (CORRECTED
       2026-09-23: this read "They are D-278's subject", an open item it no
       longer is).
   Every excluded op is DRIVEN below and asserted to answer something OTHER than
   a gate code, so the exclusion is a claim this suite checks rather than a hole
   it leaves. */
const UNGATED = [...OPROWS].filter(([, b]) => /classes:\s*null/.test(b)).map(([n]) => n).sort();
const ABOVE_THE_GATE = ["export"];
const PRE_AUTH = ["claim", "enroll", "knock", "bootstrap", "login"];
const EXCLUDED = new Set([...UNGATED, ...ABOVE_THE_GATE, ...PRE_AUTH]);
const REACHES_GATE = (o) => !EXCLUDED.has(o);

const ROLE_OPS      = MUTATING.filter((o) => REACHES_GATE(o) && ADMIN_SET.has(o) !== MEMBER_SET.has(o)).sort();
const NO_SESSION    = MUTATING.filter((o) => REACHES_GATE(o) && !ADMIN_SET.has(o) && !MEMBER_SET.has(o)).sort();
const UNATTENDED    = NO_SESSION.filter((o) => DECLARED.has(o)).sort();
const OMITTED       = NO_SESSION.filter((o) => !DECLARED.has(o)).sort();
console.log("\n--- 3. the three arms, derived from SESSION_OPS and the declaration ---");
console.log(`    excluded from the gate's corpus, structurally: ungated ${UNGATED.join(" ") || "(none)"}`);
console.log(`      · above the gate ${ABOVE_THE_GATE.join(" ")} · pre-authentication ${PRE_AUTH.join(" ")}`);
console.log(`    (b) ROLE-GATED      ${ROLE_OPS.length}: ${ROLE_OPS.join(" ")}`);
console.log(`    (a) BY DECISION     ${UNATTENDED.length}: ${UNATTENDED.join(" ")}`);
console.log(`    (c) OMISSION        ${OMITTED.length}: ${OMITTED.join(" ")}`);
/* THE FIVE ARE PINNED BY NAME. This is the assertion that stops the arms from
   being re-derived into agreement with whatever the code happens to do: it is a
   literal, and it fails if an op moves between arms for any reason at all,
   including a correct one — at which point somebody comes and says which. */
/* CORRECTED 2026-09-23 BY REC-159, and this line failing was the line WORKING, as the paragraph above
   says it is meant to. The five D-270 measured were `governorconfig`, `memberadd`, `memberset`,
   `signeradd` and `signerset`. Membership v2 §4.9 gives the last four to EVERY administrator, and
   REC-159 moved them into BOTH session sets on D-136's footing (the roster refuses a non-administrator
   NOT_AN_ADMIN, against a stamped `by`), so they DEPARTED this arm — pinned below in the both-sets arm
   by name. `governorconfig` stays: it is the OPERATOR's act, RULED by BOB #23 (§4.9), and the one op
   the founder's session alone reaches. What its refusal SAYS was REC-162's item (2026-09-25): the founder's session, graded in
   §5. Still a literal. */
t("the ROLE-GATED arm is exactly the one op the FOUNDER'S session alone reaches — `governorconfig`, "
+ "the operator's (§4.9, BOB #23) — after REC-159 moved D-270's other four into both sets; pinned as "
+ "a literal SET so an arrival or a departure is looked at",
  ROLE_OPS, ["governorconfig"]);
/* ADDED 2026-09-19 (D-136). THE PIN ABOVE DID ITS JOB AND THIS IS WHAT IT
   CAUGHT. D-136 gave `adminendorse`, `adminremove` and `membercaps` session
   reach, and this suite went red until somebody looked at where they landed —
   which is the whole point of pinning a literal. They landed in NEITHER arm,
   deliberately: they are in BOTH of `SESSION_OPS`' sets, because
   `SESSION_OPS.admin` means the FOUNDER'S password session alone (`kind` is
   `sess.role === "admin" ? "admin" : "member"`, the measurement §4 of this file
   records twice) and §4.7 gives the vote to EVERY administrator. What decides
   them is the ROSTER, asked by the store against a server-stamped `by`.
   **AN OP IN BOTH SETS IS A THIRD SHAPE AND IT IS COUNTED RATHER THAN
   IGNORED.** Without this arm the three would simply have vanished from this
   file's three-way partition, and a regression that put them back beyond every
   session would leave all three arms green while saying nothing. */
const BOTH_SETS = MUTATING.filter((o) => REACHES_GATE(o) && ADMIN_SET.has(o) && MEMBER_SET.has(o)).sort();
t("D-136's three reach BOTH session sets and are therefore in NEITHER role arm — the roster "
+ "decides them, not the gate, which is `expertiseconfirm`'s recorded posture "
+ "(BIO_Membership_Architecture_v2.md §4.7 / §4.9)",
  ["adminendorse", "adminremove", "membercaps"].filter((o) => !BOTH_SETS.includes(o)), []);
/* ADDED 2026-09-23 (REC-159): the four that left the ROLE arm, pinned where they went, by name — so a
   regression that dropped them from the member set fails HERE as well as re-entering the ROLE literal. */
t("REC-159's four §4.9 custodial acts reach BOTH session sets and are in NEITHER role arm — the roster "
+ "decides them against a stamped `by` (BIO_Membership_Architecture_v2.md §4.9)",
  ["memberadd", "memberset", "signeradd", "signerset"].filter((o) => !BOTH_SETS.includes(o)), []);
/* ADDED 2026-09-25 (REC-155): §4.10's five, pinned where BOB #19's ruling put them, by name — so a regression
   that dropped one from either set fails HERE, and not only as an omission reappearing below. */
t("REC-155's five — the provenance pair and the three calibration writes — reach BOTH session sets and are "
+ "in NEITHER role arm: none is the founder's act (BIO_Membership_Architecture_v2.md §4.10, BOB #19)",
  ["provenancechain", "provenanceroute", "calibrate", "calibrationsubject", "calibrationsignal"]
    .filter((o) => !BOTH_SETS.includes(o)), []);
t("and every declared op is one no session reaches — a declaration over an op a session DOES reach "
+ "would be a recorded decision contradicted by the table it sits in",
  [...DECLARED].filter((o) => !NO_SESSION.includes(o)), []);
/* **THE RECORDED-DECISION ARM IS PINNED AS A LITERAL, AND CONTROL ARM (c) IS WHY.**
   The by-name map in section 6 reads `UNATTENDED_BY_DECISION` out of the source
   and grades the plane against it — so when the declaration moves, BOTH SIDES OF
   THAT MAP MOVE TOGETHER and it goes green over a plane whose record has been
   emptied. Arm (c) measured exactly that: it was declared to fail naming these
   four ops, and it failed for two entirely different reasons instead. The arm was
   right and the declaration was wrong. This is the "an equality that costs nothing
   to produce is not evidence" shape arriving inside the item that quotes it, and
   the literal below is what makes the emptying visible BY NAME. Adding an op here
   is recording a decision, so this line is meant to fail when one is recorded. */
/* CORRECTED 2026-09-21 BY D-436, and this line failing is the line WORKING, as the paragraph above says it is meant
   to: D-436 RECORDED a fifth decision — `instancegroupseed` is the root of trust's act, cited to its own OPS row, and
   stated PROVISIONAL there and in IC-172. The four the pin named were found at the artifact; the fifth was made by the
   item that adds the op, which is the one act this table allows ("recording a decision"). Not a relaxation: the
   literal still names every op, so an emptied or invented record still fails BY NAME. */
/* CORRECTED 2026-09-25 BY REC-155, the line working again: BOB #19 RECORDED two more decisions
   (`BIO_Membership_Architecture_v2.md` §4.10) — `livefire` and `reproject` are unattended BY DECISION, each
   cited to the artifact §4.10 quotes. Still a literal naming every op. */
t("the RECORDED-DECISION arm is exactly the seven ops a decision is RECORDED for, pinned as a literal "
+ "— because the map that grades it reads the same declaration it grades against, and so cannot "
+ "see the record being emptied or invented into",
  UNATTENDED, ["capturerequestdrain", "cpuprobe", "instancegroupseed", "livefire", "purge", "reproject",
               "taskdrain"]);

/* ====================================================================== 4
 * THE SESSIONS. A MEMBER'S AND A REAL ADMINISTRATOR'S.
 *
 * THE ADMIN ARM IS ASSERTED REAL BEFORE IT IS USED, and that assertion exists
 * because of a measured mistake rather than a hypothetical one: the 2026-08-09
 * harness used a member enrolled with `role: "admin"` and measured a split of
 * ZERO twice, because `kind` is `sess.role === "admin" ? "admin" : "member"`
 * and an enrolled member holds `member:<id>`. Neither zero had anything to do
 * with the plane. An arm that cannot tell the two apart reports "no split" for
 * a plane that has one, which is the direction that CLOSES an open defect.
 * ==================================================================== */
console.log("\n--- 4. the two sessions, and the admin arm asserted REAL before it is used ---");
const member = async (id, caps, role = "member") => {
  const add = await POST("op=memberadd&token=t-admin-1",
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add.result?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.result.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en.result?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg.result?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return "token=" + lg.result.token;
};
/* Two administrators first: there are no ordinary members until two exist
   (Membership Architecture 4.2/4.3), and the founder holds ADMIN_TOKEN with no
   roster row of their own. */
await member("ada", ["contribute", "publish", "create_projects"], "admin");
await member("ben", ["contribute"], "admin");
const DOT = await member("dot", ["contribute"], "member");

/* **THE ADMINISTRATOR'S SESSION COMES FROM `op=claim` + `op=login` WITH
   `role: "admin"`, AND NOT FROM AN ENROLLED MEMBER WHOSE ROSTER ROW SAYS
   ADMINISTRATOR.** `kind` is `sess.role === "admin" ? "admin" : "member"`, and
   an enrolled member holds `member:<id>` however their row reads.
   THIS SUITE MADE THAT EXACT MISTAKE ON ITS FIRST RUN and is recording it rather
   than quietly fixing it: `ada` was enrolled with `role: "admin"`, used as the
   administrator arm, and the pair assertion below went RED naming both halves
   refused. It is the same mistake the 2026-08-09 D-270 harness made twice, in a
   worktree 1573 commits away, and it is why that assertion is a PAIR. An arm
   that cannot tell the two kinds apart measures a split of zero over a plane
   that has one — the direction that CLOSES an open defect. */
await POST("op=claim", { bootstrapToken: "t-admin-1", password: "founder-passphrase-1" });
const flog = await POST("op=login", { role: "admin", password: "founder-passphrase-1" });
if (!flog.result?.token) throw new Error(`founder login: ${JSON.stringify(flog)}`);
const ADA = "token=" + flog.result.token;

const GATE_CODES = new Set(NEEDED);
const gateAnswer = async (op, session) => {
  const r = await POST(`op=${op}&${session}`, {});
  return { reason: r.reason ?? r.code ?? null, translation: r.translation ?? null,
           check: r.check ?? null, error: r.error ?? null, detail: r.detail ?? null,
           recorded: r.recorded ?? null, reachedBy: r.reachedBy ?? null, role: r.role ?? null };
};
/* RE-POINTED 2026-09-23 (REC-159), never exempted: this pair drove `op=memberset`, which now reaches
   BOTH sets — `dot` would pass the gate and be refused by the ROSTER, so the pair would read
   [false, false] over a plane whose split is intact. `op=governorconfig` is the one op left in the
   founder's set alone, so it is the op that can still tell the two KINDS apart.
   THE ARM-IS-REAL ASSERTION. `op=governorconfig` is refused to `dot` and ADMITTED for
   `ada`: if this pair ever agrees, the two sessions are the same kind and every
   split figure below is meaningless. It is asserted as a PAIR, because either
   half alone is satisfied by a gate that refuses everybody or one that refuses
   nobody. */
{
  const asMember = await gateAnswer("governorconfig", DOT);
  const asAdmin = await gateAnswer("governorconfig", ADA);
  t("the admin session is REALLY an administrator's — the member is refused at the gate and the "
  + "administrator is NOT, asserted as a PAIR because either half alone passes over a gate that "
  + "refuses everybody or one that refuses nobody (a split of zero was measured TWICE in 2026-08 "
  + "by a harness whose 'admin' was a member with an admin role row)",
    [GATE_CODES.has(asMember.reason), GATE_CODES.has(asAdmin.reason)], [true, false]);
}

/* ====================================================================== 5
 * (b) YOUR CREDENTIAL DOES NOT REACH THIS VERB — the five, EACH BY NAME.
 *
 * HOW A LIAR PASSES THIS MOST CHEAPLY: give every refusal in the plane the code
 * `SESSION_ROLE_CANNOT_REACH_OP`. That would make this block green and the world
 * WRONG, so the map below is asserted as a whole — every op's code, by name, in
 * one object — and section 7 asserts that the three codes are actually
 * DIFFERENT across the arms. One generic code for all of them fails there.
 * ==================================================================== */
console.log("\n--- 5. (b) a signed-in person DOES perform these, from the session the set names (the founder's since REC-162) ---");
const roleAnswers = {};
for (const op of ROLE_OPS) roleAnswers[op] = await gateAnswer(op, DOT);
t("each of the five answers a MEMBER session with SESSION_ROLE_CANNOT_REACH_OP — pinned BY NAME "
+ "per op, never as a count, because a count is satisfied by five refusals of any kind",
  Object.fromEntries(ROLE_OPS.map((o) => [o, roleAnswers[o].reason])),
  Object.fromEntries(ROLE_OPS.map((o) => [o, "SESSION_ROLE_CANNOT_REACH_OP"])));
t("and each carries C-38.7 and the CANNED TRANSLATION from its row, compared against the IMPORTED "
+ "row rather than a sentence typed here — a hand copy agrees with its original for free",
  ROLE_OPS.filter((o) => roleAnswers[o].check !== ADMISSION_CHECKS.SESSION_ROLE_CANNOT_REACH_OP.check
                      || roleAnswers[o].translation !== ADMISSION_CHECKS.SESSION_ROLE_CANNOT_REACH_OP.translation), []);
/* THE SENTENCE IS TRUE, ASSERTED IN WORDS. The old one said a machine credential
   was required; an administrator's browser performs every one of these. */
/* NARROWED, AND THE FIRST SPELLING IS RECORDED BECAUSE IT CAUGHT ITS OWN
   CORRECTION. This arm first scanned the whole answer for `/machine credential/i`
   and went RED on all five — because the NEW translation says, in as many words,
   *"No machine credential is needed and finding one is not the way through"*.
   The correction quoted the token it was correcting. WORKER.md names that exact
   receipt, and it arrived inside the item that quotes it. So the arm now grades
   the CLAIM rather than the token: what must be gone is the sentence asserting
   that a machine credential IS required. The positive half is asserted
   separately below, so this narrowing does not merely buy a green. */
t("and NONE of the five still CLAIMS a machine credential is required — that sentence was FALSE "
+ "for exactly these five, and a canned translation would have made it permanent",
  ROLE_OPS.filter((o) => /requires a machine credential|needs a machine credential|it needs a machine/i
    .test(String(roleAnswers[o].error || "") + " " + String(roleAnswers[o].translation || ""))), []);
/* THE POSITIVE HALF, so the narrowing above does not merely buy a green: the
   refusal must say the thing that IS true. */
/* CORRECTED 2026-09-25 BY REC-162, NEVER EXEMPTED. This asserted each translation matched
   `/administrator/` — "names the administrator as the route". After REC-159 the ROLE arm is
   `governorconfig` alone, which the FOUNDER'S session alone reaches (Membership v2 §4.9, RULED the
   operator's by BOB #23), and an enrolled administrator holds a MEMBER'S session: the sentence that
   named the administrator as the route was false of every enrolled administrator it refused. The
   route is a SESSION, derived from the set that holds the op, so the assertion now reads the
   sentence and the `reachedBy` the gate derived, and the member-session refusal is driven to say
   the founder's session. */
t("and each names the SESSION that reaches it, derived from the set that holds it — the founder's "
+ "where `SESSION_OPS.admin` alone holds the op — and never calls the op an administrator's",
  ROLE_OPS.filter((o) => {
    const founderOnly = ADMIN_SET.has(o) && !MEMBER_SET.has(o);
    const want = founderOnly ? /reserved to the founder's session/ : /reserved to a member's own session/;
    return !want.test(String(roleAnswers[o].error || ""))
      || /administrator of this group/i.test(String(roleAnswers[o].error || ""))
      || /this session's role is/i.test(String(roleAnswers[o].detail || ""));
  }), []);
/* REC-162: the field the gate derived agrees with the set, and `role` — which read 'member' of an
   enrolled administrator — is not sent at all. */
t("and each carries `reachedBy` naming that session, and no `role` field calling the caller a member",
  Object.fromEntries(ROLE_OPS.map((o) => [o, [roleAnswers[o].reachedBy, roleAnswers[o].role]])),
  Object.fromEntries(ROLE_OPS.map((o) => [o,
    [ADMIN_SET.has(o) && !MEMBER_SET.has(o) ? "founder" : "member", null]])));

/* ====================================================================== 6
 * (a) THIS VERB IS NOT FOR A PERSON — only where RECORDED, and the refusal
 *     CITES the record. (c) OTHERWISE, THE FACT AND NO RATIONALE.
 *
 * HOW A LIAR PASSES SECTION 6 MOST CHEAPLY: declare every no-session op in
 * `UNATTENDED_BY_DECISION` with a citation string of `"x"`. That makes the (a)
 * block green and the (c) block EMPTY — so (c) is floored non-empty below, and
 * the citation is asserted to be a real reference rather than any string.
 * ==================================================================== */
console.log("\n--- 6. (a) by recorded decision, and (c) the omissions ---");
const noSessionAnswers = {};
for (const op of NO_SESSION) noSessionAnswers[op] = await gateAnswer(op, DOT);
t("every op no session reaches answers with the code its arm calls for, EACH BY NAME — this is the "
+ "assertion a single generic code for all of them cannot satisfy, because the two arms want "
+ "DIFFERENT codes and the map is compared whole",
  Object.fromEntries(NO_SESSION.map((o) => [o, noSessionAnswers[o].reason])),
  Object.fromEntries(NO_SESSION.map((o) => [o,
    DECLARED.has(o) ? "MACHINE_CREDENTIAL_REQUIRED" : "SESSION_ROUTE_NOT_RECORDED"])));
/* THE OMISSION ARM IS FLOORED NON-EMPTY. If it were empty, the assertion above
   would be a statement about the (a) arm alone and BOB #17's third sentence
   would be untested — which is the precise shape of the two-way split this item
   replaces. */
/* CORRECTED 2026-09-25 BY REC-155, NEVER EXEMPTED — AND THE FLOOR'S PURPOSE IS KEPT BY MOVING IT, NOT
   DROPPING IT. This asserted the (c) arm NON-EMPTY on the real plane, so the map above could not become a
   test of (a) alone. Its seven members were exactly the seven ops §4.10 RULED (BOB #19): five joined both
   session sets and two were recorded unattended by decision. So on this plane the omission arm is EMPTY,
   and that is the ruling landing rather than the arm going blind — pinned as a literal below, so the next
   op anybody adds without a ruling is LOOKED AT here. What the floor protected — that sentence (c) is
   actually DRIVEN, a third code and not a two-way split — is now driven through `unruled-op-fixture.mjs`:
   the real gate and the real row, over one op the real tables have never heard of, which is exactly the
   case (c) exists for (`UNATTENDED_BY_DECISION`'s header: *"an op added tomorrow ... gets (c)"*). */
t("the OMISSION arm is EMPTY on the real plane, pinned as a literal — §4.10 ruled all seven of its members "
+ "(BOB #19), so an op arriving here is an op nobody ruled on and is meant to be looked at",
  OMITTED, []);
const fx = unruledOpPlane({ ADMIN_TOKEN: "t-admin-1", MEMBER_TOKEN: "t-member-1", PROBE_TOKEN: "t-probe-1",
                            VERSION: "test" });
let unruled;
try {
  const FXS = await unruledOpMemberSession(fx, "t-admin-1");
  const r = await (await fx.dispatchFetch(`http://x/api/?op=${UNRULED_OP}&${FXS}`,
    { method: "POST", body: "{}" })).json();
  unruled = { reason: r.reason ?? r.code ?? null, translation: r.translation ?? null, check: r.check ?? null,
              detail: r.detail ?? null, recorded: r.recorded ?? null };
} finally { await fx.dispose(); }
console.log(`    (c) driven through the unruled fixture op '${UNRULED_OP}': ${unruled.reason}`);
t(`and sentence (c) is still DRIVEN — '${UNRULED_OP}', an op no session reaches and no decision explains, `
+ "answers SESSION_ROUTE_NOT_RECORDED with C-38.8's canned translation and cites NO record",
  [unruled.reason, unruled.check, unruled.translation === ADMISSION_CHECKS.SESSION_ROUTE_NOT_RECORDED.translation,
   unruled.recorded],
  ["SESSION_ROUTE_NOT_RECORDED", ADMISSION_CHECKS.SESSION_ROUTE_NOT_RECORDED.check, true, null]);
/* CORRECTED 2026-09-19 (D-136), NEVER EXEMPTED, AND THE ASSERTION IS NOW THE
   ONE IT ALWAYS MEANT. It read *the omission arm holds D-136's three* — true of
   a plane where §4.7's vote could be cast by nobody, and it was the plane, not
   the rule, that this file was grading. D-136 landed the fence, so the three are
   REACHABLE by an administrator's session and the honest answer to a member has
   become (b), which names the administrator as the route.
   **THE DIRECTION IS ASSERTED, NOT DROPPED, AND THAT IS THE WHOLE CORRECTION.**
   Deleting the arm would leave nothing watching the three ops D-270's argument
   is built on, and a regression that put them back beyond every session would
   pass in silence. So it is INVERTED: they must be ABSENT from (c) and PRESENT
   in (b). A revert of D-136 fails this by name, and so does a half-revert that
   removes the reach while leaving the stamp. */
t("D-136's three are NO LONGER omissions — §4.7's vote is a person's act now, so the plane has "
+ "stopped having to say the record holds no decision about them "
+ "(BIO_Membership_Architecture_v2.md §4.7 / §4.9)",
  ["adminendorse", "adminremove", "membercaps"].filter((o) => OMITTED.includes(o)), []);
t("and they are REACHABLE rather than merely gone from this arm — an op that vanished from all "
+ "three arms would satisfy the assertion above while reaching nobody at all, which is the exact "
+ "state D-136 was raised about",
  ["adminendorse", "adminremove", "membercaps"].filter((o) => !BOTH_SETS.includes(o)), []);
/* THE CONTRADICTED PAIR, named because their own OPS rows say the opposite of
   the sentence they used to receive. */
/* CORRECTED 2026-09-25 BY REC-155, NEVER EXEMPTED, and INVERTED rather than dropped — D-136's move above,
   made again. This asserted the pair IN the omission arm: true while no session reached them. §4.10 (BOB
   #19) gave them session reach, since their OPS rows call the act *"a named member's judgement"* and a
   session is the one caller carrying a name. So they must be ABSENT from (c) and PRESENT in both sets. */
t("and op=provenancechain and op=provenanceroute, whose own OPS rows say 'NOT open to daemon: deciding "
+ "that the evidence supports a route is a named member's judgement', are NO LONGER omissions — a "
+ "signed-in member reaches both (§4.10, REC-155)",
  ["provenancechain", "provenanceroute"].filter((o) => OMITTED.includes(o) || !BOTH_SETS.includes(o)), []);
/* THE OMISSION SAYS NOTHING ABOUT DESIGN. This is the whole of sentence (c). */
t("an OMISSION refusal makes NO design claim — it never says the verb is not for a person, because "
+ "a member told an absence is a decision will not report it as the gap it is",
  /* REC-155: the real omission arm is empty, so the fixture's answer is graded too — else this is vacuous. */
  [...OMITTED.map((o) => [o, noSessionAnswers[o]]), [UNRULED_OP, unruled]]
    .filter(([, a]) => /not for a person|unattended writer|not by a person/i
      .test(String(a.translation || "") + String(a.detail || ""))).map(([o]) => o), []);
/* AND (a) CARRIES ITS WARRANT. The claim and the record that licenses it travel
   together, so a reader can check the plane's design claim at its source. */
t("a BY-DECISION refusal CITES the record that licenses it, and the citation names a real file — a "
+ "design claim whose warrant the caller cannot check is the claim without the record",
  UNATTENDED.filter((o) => !/\.mjs|\.md/.test(String(noSessionAnswers[o].recorded || ""))), []);
t("and the by-decision arm is non-empty, so the citation assertion above is not vacuous",
  UNATTENDED.length > 0, true);

/* ====================================================================== 7
 * THE THREE ARE ACTUALLY THREE. The assertion the row's 'how a liar passes it'
 * names: one generic code for all of them.
 * ==================================================================== */
console.log("\n--- 7. the three codes are three, and the sentences are three ---");
/* REC-155: the fixture's answer joins the real corpus here — (c) has no live producer on the real plane
   since §4.10, and dropping it would turn this into the two-way split it exists to refuse. */
const seen = [...new Set([...ROLE_OPS.map((o) => roleAnswers[o].reason),
                          ...NO_SESSION.map((o) => noSessionAnswers[o].reason),
                          unruled.reason])].sort();
t("the gate sends THREE DISTINCT codes over its corpus — one generic code for every op is how a "
+ "liar passes every by-name map above, and it is what `main` did until this item",
  seen, ["MACHINE_CREDENTIAL_REQUIRED", "SESSION_ROLE_CANNOT_REACH_OP", "SESSION_ROUTE_NOT_RECORDED"]);
/* THE EXCLUSIONS ARE CHECKED, NOT TRUSTED. Every op section 3 removed from the
   denominator is driven here and must answer something that is NOT a gate code.
   Without this the exclusion list is a place to hide an op whose answer is
   inconvenient, which is precisely how a denominator gets fitted to its answer. */
const excludedAnswers = {};
for (const o of [...EXCLUDED].filter((o) => OPROWS.has(o)).sort())
  excludedAnswers[o] = (await gateAnswer(o, DOT)).reason;
t("and every op excluded from the gate's corpus really is answered by something else — the "
+ "exclusions are DRIVEN rather than trusted, because an untested exclusion list is where an "
+ "inconvenient answer goes to be forgotten",
  Object.entries(excludedAnswers).filter(([, r]) => GATE_CODES.has(r)).map(([o]) => o), []);
t("and no two of the three share a translation — two conditions under one sentence is a member "
+ "being told the same thing about different facts, which is DEC-49's own argument",
  new Set(NEEDED.map((c) => ADMISSION_CHECKS[c].translation)).size, 3);

/* ====================================================================== 8
 * THE CODELESS RESIDUE — D-270's other half, and the corpus is THREE today,
 * not the six its row names. The set-pin in `refusal-wire.test.mjs` was already
 * struck once, at integration on 2026-08-09, when REC-79's admission family gave
 * the SESSION-GATE three a code.
 * ==================================================================== */
console.log("\n--- 8. the three refusing a missing argument with a bare `error` string ---");
const ARG = { capture: `op=capture&${DOT}`, pdfstructure: `op=pdfstructure&${DOT}`, monitor: `op=monitor&${DOT}` };
const argAnswers = {};
for (const [op, q] of Object.entries(ARG)) {
  const r = await POST(q, {});
  argAnswers[op] = { reason: r.reason ?? r.code ?? null, check: r.check ?? null,
                     translation: r.translation ?? null, error: r.error ?? null, argument: r.argument ?? null };
}
t("each of the three answers with the DEC-49 row — pinned BY NAME per op, because a count of three "
+ "coded refusals is satisfied by three refusals of any op at all",
  Object.fromEntries(Object.keys(ARG).map((o) => [o, argAnswers[o].reason])),
  Object.fromEntries(Object.keys(ARG).map((o) => [o, "REQUIRED_ARGUMENT_MISSING"])));
t("and each carries C-61.1 and the canned translation from the imported row",
  Object.keys(ARG).filter((o) => argAnswers[o].check !== REQUIRED_ARGUMENT_CHECKS.REQUIRED_ARGUMENT_MISSING.check
    || argAnswers[o].translation !== REQUIRED_ARGUMENT_CHECKS.REQUIRED_ARGUMENT_MISSING.translation), []);
/* ONE CODE, THREE SITES, TOLD APART BY `argument`. `AI_BEYOND_TASK_SCOPE` is the
   standing precedent for one code whose producers are distinguished by a field,
   and it is the honest shape here: the CONDITION is one condition. */
t("and each names the argument it wanted, which is what tells one site from another under one code "
+ "(op=capture and op=pdfstructure want sha256; op=monitor wants bundleId)",
  Object.fromEntries(Object.keys(ARG).map((o) => [o, argAnswers[o].argument])),
  { capture: "sha256", pdfstructure: "sha256", monitor: "bundleId" });
/* ADDITIVE ON THE WIRE. The legacy sentence survives byte-identical at all
   three, passed in from the site rather than rebuilt, so nothing reading `error`
   moves. */
t("and the pre-D-270 `error` sentence is BYTE-IDENTICAL at all three, so the code is purely "
+ "additive for every consumer already reading that field",
  Object.fromEntries(Object.keys(ARG).map((o) => [o, argAnswers[o].error])),
  { capture: "capture requires sha256=<64 lowercase hex>",
    pdfstructure: "pdfstructure requires sha256=<64 lowercase hex>",
    monitor: "monitor needs a bundleId" });

/* ====================================================================== 9
 * WHAT THIS WALK COULD NOT SEE — NAMED, never assumed absent.
 * ==================================================================== */
console.log("\n--- 9. the residue this walk cannot see, named rather than assumed absent ---");
console.log(`    PRE-AUTHENTICATION surfaces are reached with NO credential and are outside this walk:`);
console.log(`      verify, publishedbytes, publishedcase, knock, claim — coded by D-278 and graded in`);
console.log(`      d278-codeless-refusals.test.mjs; bootstrap is a status read and refuses nothing D-278 coded.`);
/* CORRECTED 2026-09-23 BY D-278, NEVER EXEMPTED. The line above named this group as
   D-278's OPEN subject. A naming that goes stale the day its item lands is the
   thing this file exists to stop, so the naming is now CHECKED at one site: the
   pre-authentication sha256 complaint `refusal-wire.test.mjs` and this file both
   pointed at answers the C-61.1 row, with its pre-D-278 sentence kept. */
{
  const v = await (await mf.dispatchFetch("http://x/api/?op=verify")).json();
  t("the pre-authentication group is CODED now, not open — op=verify's argument complaint answers C-61.1 "
  + "beside its byte-identical sentence (D-278; its full grading is d278-codeless-refusals.test.mjs)",
    [v.reason, v.check, v.error],
    ["REQUIRED_ARGUMENT_MISSING", REQUIRED_ARGUMENT_CHECKS.REQUIRED_ARGUMENT_MISSING.check,
     "verify requires sha256=<64 lowercase hex>"]);
}
console.log(`    An EMPTY payload only provokes refusals sitting ABOVE the payload complaints.`);
console.log(`    Refusals returned as raw bytes or HTML rather than through json() are outside it.`);
console.log(`    It is NOT a live probe: a green harness is not a serving build (D-108).`);
t("the walk drove a real corpus — printed above and floored here, because 'no false sentence found' "
+ "over an empty drive is the blind walk this assertion exists to tell apart from a clean one",
  /* CORRECTED 2026-09-23 (REC-159): the floor was 15 under a measured 17; REC-159 moved four ops out of
     the ROLE arm into both sets, which this walk does not drive through the gate, so the measured
     corpus is 13 (1 + 12) and the floor keeps the same margin of two beneath it.
     CORRECTED 2026-09-25 (REC-155): §4.10 moved five of the twelve no-session ops into both sets, so the
     measured corpus is 8 (1 + 7), printed in section 3; the floor keeps the same margin of two. */
  [ROLE_OPS.length + NO_SESSION.length >= 6, Object.keys(argAnswers).length, unresolvedSpreads],
  [true, 3, 0]);

console.log(`\n${fail === 0 ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`);
} finally {
  await mf.dispose();
}
process.exit(fail === 0 ? 0 : 1);
