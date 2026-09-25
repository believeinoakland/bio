/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/adminvote.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES (src/index.mjs, src/store.mjs) while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/adminvote.control.mjs [arm]`. Each arm is armed ALONE with the other two layers HELD OPEN, and restored from a uniquely-named per-arm pristine copy verified by sha256 AND byte comparison (never `git checkout --`). DECLARED BEFORE ARMING — (a) `baseline`, nothing armed: MUST be green. (b) `stamp-dropped` — THE ROW'S OWN CONTROL: the `by` stamp is WIDENED to honour a caller-sent `by` for a session (`inner.searchParams.get("by") || sessMember`), which is exactly the defect D-136 closes, with the operator fence LEFT STANDING. The three FORGERY arms MUST FAIL BY NAME — `a session caller naming ANOTHER administrator as `by` does not cast that administrator's endorsement`, `… removal vote`, `… capability edit` — and every BEARER refusal MUST stay green, which is what shows the two layers are independent rather than one layer twice. (c) `fence-dropped` — the `is-operator-governance-act` guard alone neutered (`&& false`), stamp LEFT STANDING: all nine BEARER arms MUST FAIL at their named refusals, while `and NOTHING a bearer asked for landed` MUST stay GREEN — because the stamp behind still writes `class:<cls>` and the store still refuses it, so the arm says the fence supplies the SENTENCE and the stamp supplies the REFUSAL. (d) `reach-dropped` — `...GOVERNANCE_ACTIONS` removed from the MEMBER set, the admin set left standing: this measures exactly the difference between *an administrator's session* and *the founder's session*, and every POSITIVE arm MUST FAIL by name — the half of this row that `either alone is worse than neither` names. (e) `caps-ungated` — the roster check removed from `Store#memberCaps` ALONE, the two votes keeping theirs: an ordinary member's capability edit then SUCCEEDS, so `op=membercaps: cai, an ordinary member, is refused NOT_AN_ADMIN` and its two read-backs MUST FAIL while both VOTE arms stay green. This is the arm that tells a stamp that is READ from one merely recorded. (f) `overstrict` (required) — the fence refuses EVERY caller on the three ops (scoped to them, because an unscoped `if (true)` kills the suite before its foot and refutes nothing): every BEARER arm stays green while every SESSION arm MUST FAIL, the only thing that distinguishes a fence that holds from one that refuses everybody. (g) `classkeyed` — THE LIAR THE ROW NAMES: the fence rewritten to refuse by token STRING, so the PROBE class walks straight through — its three bearer arms MUST FAIL and the STRUCTURAL pin MUST FAIL on the env binding it sees in the region. REC-156 ADDS FOUR ARMS, DECLARED BEFORE ARMING (2026-09-21), for `op=memberadd`'s `by` in §8: (h) `memberadd-disjunct-dropped` — THE ROW'S OWN CONTROL: the `memberadd` disjunct removed from the `by` stamp's condition and nothing else, so a caller's typed `by=ruth` reaches the store's relay; the founder's forgery arm `memberadd: a body `by` naming ANOTHER administrator does not cast that administrator's endorsement`, its positive and its store read-back, every bearer arm and its read-back, and the disjunct's STRUCTURAL pin MUST FAIL BY NAME, while the two store-direct arms and every D-136 arm MUST stay green. (i) `memberadd-relay-dropped` — THE LIAR THE ROW NAMES, stamping at the plane while the STORE honours the body: the relay put back to `memberAdd(body || {})` with the stamp LEFT STANDING; every memberadd arm that sends a forged body `by` MUST FAIL, the store-direct pair and the relay's pin included, and the stamp's pin MUST stay green. (j) `memberadd-relay-fallback` — the relay prefers the stamp and FALLS BACK to the body when the query has none: EVERY op-level arm MUST stay green, because the plane always stamps, and only the store-direct no-stamp arm and the relay's pin MUST FAIL — the arm that shows 8e earns its place. (k) `memberadd-overstrict` (required) — the store records NO proposer's endorsement at all: the forged and bearer arms MUST stay green, while the founder's positive, its read-back and the stamped store drive MUST FAIL. AND (b) `stamp-dropped` now also takes down the founder's memberadd forgery, positive and read-back and the disjunct's structural pin, declared, because `memberadd` shares its ONE stamp expression. REC-159 ADDS FOUR ARMS, DECLARED BEFORE ARMING (2026-09-23), for §9, the four §4.9 custodial acts from an enrolled administrator's session: (l) `custodial-stamp-dropped` — THE ROW'S OWN CONTROL, ONE OP'S STAMP DROPPED: the `memberset` relay put back to `memberSet(body || {})`, so ruth's body `by=gus` is recorded, cai (who sends none) is admitted, the admin bearer's body `by=ruth` is recorded and the store-direct stamp never arrives — every memberset arm (9b's two, 9e's memberset refusal and its nothing-landed read-back, 9f's bearer attribution, 9h) MUST FAIL BY NAME while the other three ops' arms stay green. (m) `custodial-roster-dropped` — `#custodialBar` answers null for everybody (the liar the row names: reach without the roster): the four 9e refusals, 9e's read-back and 9h MUST FAIL. (n) `custodial-reach-dropped` — `...CUSTODIAL_ACTIONS` removed from the MEMBER set: every positive §9 arm, 8f's closure and the reach pin MUST FAIL and cai is refused by the gate instead of the roster. (o) `custodial-machine-open` — the class check reads `classes` for every caller: the four MEMBER_TOKEN refusals MUST FAIL, and 9h cascades because that bearer re-activates vic. And the eleven earlier arms each widen by the §9 assertions sharing their site, declared at each arm in the harness. REC-162 ADDS THREE ARMS, DECLARED BEFORE ARMING (2026-09-25), for §10, `governorconfig`'s refusal: (p) `founder-sentence-reverted` — THE ROW'S OWN CONTROL, the administrator sentence restored for a founder-only op: both `10a … reads the FOUNDER'S-SESSION sentence` arms MUST FAIL BY NAME and nothing else. (q) `governorconfig-both-sets` — THE LIAR THE ROW NAMES, the op widened to every member session (member set AND `member` in its class list): both 10a refusals, both sentence arms and the nothing-landed read-back MUST FAIL, 10b stays green. (r) `founder-detail-respelled` (required over-strictness): the founder's-session `detail` rewritten in unseen words, still true — MUST PASS whole. RESULTS: on the line below, written from the harness's own output.
   RESULTS, RUN 2026-09-19 in worktree `.claude/worktrees/d136-conduct8` (branch `worker/d136-conduct8`, base `ad67ff0a`), every restore byte-identical (src/index.mjs 693,372 B sha256 25f6a31c9fb8…; src/store.mjs 2,737,997 B sha256 dc665ca70cdf…): baseline 43/0 · stamp-dropped 31/12 · fence-dropped 33/10 · reach-dropped 24/19 · caps-ungated 40/3 · overstrict 24/19 · classkeyed 39/4 — ALL SEVEN AS DECLARED, no arm failed to arm. THE FIRST RUN HAD FOUR ARMS **NOT AS DECLARED** AND THAT IS RECORDED RATHER THAN SMOOTHED: every discrepancy was a finding about the DECLARATION, none about the subject, and the reasons are written at each arm. The one that mattered ran in the direction that CLOSES a defect — `and gus is still an administrator, because one vote…` was declared to fail in three arms and did not, because it is a READ-BACK that stays true exactly when no removal carries; declaring it to fail would have put a forged EJECTION on the expected side of three arms. THE PRE-ITEM TRACE (this suite run against `origin/main` @ `ad67ff0a`): the suite cannot run at all there — `GOVERNANCE_ACTIONS` does not exist, so §0's floor fails by name and the drive never starts, which is itself the measurement: the acts this file grades had no expression in the plane to grade. RE-RUN 2026-09-21 by the REC-156 worker in worktree `agent-a45dec7af75234c20` (branch `worktree-agent-a45dec7af75234c20`, base `2eaf5ebd`), every restore byte-identical (src/index.mjs 696,088 B sha256 1550bbc29836…; src/store.mjs 2,746,124 B sha256 726d56622e11…): baseline 56/0 · stamp-dropped 40/16 · fence-dropped 46/10 · reach-dropped 37/19 · caps-ungated 53/3 · overstrict 37/19 · classkeyed 52/4 · memberadd-disjunct-dropped 48/8 · memberadd-relay-dropped 46/10 · memberadd-relay-fallback 54/2 · memberadd-overstrict 53/3 — ALL ELEVEN AS DECLARED ON THE FIRST RUN, no arm failed to arm; D-136's seven moved only by the four assertions `stamp-dropped` was declared to gain. REC-156'S PRE-ITEM TRACE (this suite over the two sources at `be829dbd`, restored byte-identical): 45/11 — exactly the eleven memberadd assertions that discriminate fail by name, while the boundary, fixture, drive-floor and known-open pins stay green. AND THE MEASUREMENT BEHIND §8's CORRECTION: this suite AS D-136 LEFT IT, run over the FIXED plane, was 43/0 — the pin said to fail the day the finding closed could not see the fix. RE-RUN 2026-09-23 by the REC-159 worker (cloud session, branch `land/worker/REC-159`, base `a8f6094a`), every restore byte-identical (src/index.mjs 743,212 B sha256 34e02ffdd946…; src/store.mjs 2,954,988 B sha256 15436a7091f4…): baseline 81/0 · stamp-dropped 57/24 · fence-dropped 71/10 · reach-dropped 61/20 · caps-ungated 78/3 · overstrict 61/20 · classkeyed 77/4 · memberadd-disjunct-dropped 59/22 · memberadd-relay-dropped 67/14 · memberadd-relay-fallback 79/2 · memberadd-overstrict 76/5 · custodial-stamp-dropped 75/6 · custodial-roster-dropped 75/6 · custodial-reach-dropped 63/18 · custodial-machine-open 76/5 — ALL FIFTEEN AS DECLARED. ONE FINDING ABOUT THE INSTRUMENT, RECORDED RATHER THAN SMOOTHED: on the first full run `reach-dropped` DID NOT ARM — its anchor (`...GOVERNANCE_ACTIONS,` then REC-146's comment) matched 0 times because REC-159 put `...CUSTODIAL_ACTIONS` between them, and the harness refused to arm, as it is built to; re-anchored on REC-159's comment and re-run alone: 61/20 AS DECLARED. REC-159'S PRE-ITEM TRACE (this suite over the two sources at `a8f6094a`, restored by cp and verified by sha256): 50/19 — every §9 arm fails by name, 8f's closure fails, and the `CUSTODIAL_ACTIONS` subject floor fails on the empty parse, so §9's per-op loops cannot pass vacuously over a plane without the array. RE-RUN 2026-09-25 by the REC-162 worker (cloud session, branch `land/worker/REC-162`, base `8bdf20e6`), every restore byte-identical (src/index.mjs 840,734 B sha256 2a5117236fe7…): baseline 87/0 · stamp-dropped 63/24 · fence-dropped 77/10 · reach-dropped 67/20 · caps-ungated 84/3 · overstrict 67/20 · classkeyed 83/4 · memberadd-disjunct-dropped 65/22 · memberadd-relay-dropped 73/14 · memberadd-relay-fallback 85/2 · memberadd-overstrict 82/5 · custodial-stamp-dropped 81/6 · custodial-roster-dropped 81/6 · custodial-reach-dropped 69/18 · custodial-machine-open 82/5 · founder-sentence-reverted 85/2 · governorconfig-both-sets 82/5 · founder-detail-respelled 87/0 — ALL EIGHTEEN AS DECLARED. TWO FINDINGS ABOUT THE INSTRUMENT, RECORDED RATHER THAN SMOOTHED: (1) on the first full run `stamp-dropped` DID NOT ARM — its anchor matched TWICE on `main` because REC-164 added a byte-identical stamp line for IDENTITY_ACTIONS, so the row's own D-136 control had been silently disarmed since that landing; re-anchored on the governance stamp's own condition and re-run alone: 63/24 AS DECLARED. (2) `governorconfig-both-sets` first widened the MEMBER SET alone and came back NOT AS DECLARED, 83/4: the nothing-landed read-back stayed green because the OPS row's class list is a second fence; the liar that lands an appetite widens both, re-declared onto that and re-run alone: 82/5 AS DECLARED.
 * =========================================================================
 * D-136 — THE SECTION 4.7 VOTE AND THE SECTION 4.9 CAPABILITY EDIT BECOME
 * ACTS A PERSON CAN PERFORM AND NOBODY CAN FORGE.
 *
 * THE DESIGN IS `docs/architecture/BIO_Membership_Architecture_v2.md` §4.7 (the
 * block BOB #17 wrote at `95fb3e4c`, read at the code) with §4.9's capability
 * edit and §5. Its finding, in its own words: `op=adminendorse` and
 * `op=adminremove` carried `classes: ["admin","probe"]` and appeared in NO
 * session set, so the ONLY caller that could cast a 4.7 vote was a bearer
 * credential — and `by` was server-stamped only for `PROJECT_ACTIONS` plus two,
 * which these are not, **so on the one reachable path the CALLER NAMED THE
 * VOTER.** The plane's own comment beside that stamp already stated the rule:
 * *"a caller-supplied `by` is overwritten rather than honoured: 'only an owner
 * may remove' is worth nothing if the caller names who they are."* Read against
 * §4.7 it says: **"every subsequent addition requires the consensus of all
 * existing administrators" is worth nothing if the caller names who consented.**
 *
 * **ONE LANDING, AND THIS SUITE IS WRITTEN SO THAT HALF OF IT CANNOT PASS.**
 * Stamping without reach makes the vote castable by NOBODY (a bearer would stamp
 * as a machine and be refused, with no session route to replace it); reach
 * without stamping leaves it forgeable. So the arms are paired: `reach-dropped`
 * fails the POSITIVE arms and `stamp-dropped` fails the FORGERY arms, and no
 * single edit makes the file green over half an item.
 *
 * **HOW A LIAR PASSES THE ACCEPTS-WHEN, stated before what is checked.** By
 * honouring a sent `by` for a SESSION caller. A suite that only drove the happy
 * path — administrator signs in, votes, is stamped correctly — is green over a
 * plane that would have stamped whatever it was told, because the honest caller
 * sends nothing to disagree with. **So every act is driven TWICE: once cleanly,
 * and once by one administrator's session SENDING ANOTHER ADMINISTRATOR'S ID**,
 * in the body AND in the query, and the evidence is read from the RECORD (whose
 * endorsement was counted, who is still awaited, who is named as a decider) and
 * never from the answer's echo of what was sent.
 *
 * **D-421'S CLASS, AND THE SECOND LAYER.** BOB #14 ruled for op=ratify and
 * op=caseratify (C-32.14 / C-32.15) that no operator bearer token delivers an
 * authored act. A §4.7 vote is that shape with the signature replaced by a
 * roster position, so the bearer classes are refused at the door by name
 * (C-32.17) as well as by the stamp behind it. The class set is DERIVED from
 * `classify()` rather than typed, on C-32.14's own reasoning: a fence keyed on
 * token strings is green against the three bindings anybody thinks to name and
 * a fourth walks straight through.
 *
 * WHAT THIS SUITE CAN AND CANNOT SEE, and the sentence is load-bearing:
 *   - IT CAN SEE every refusal and every stamp these three ops produce through
 *     the REAL control plane, under COMPLETE payloads, with the record read back
 *     after each act.
 *   - IT COULD NOT SEE `op=memberadd` when D-136 wrote it, and SAID so: that op's
 *     `by` also wrote an `admin_votes` row and was not stamped, printed in §8 as a
 *     FINDING with its fix named. CORRECTED 2026-09-21 by REC-156, which closed it:
 *     §8 now drives the stamp, the relay, the founder's session, every bearer class
 *     and the store directly — and says what it STILL cannot see (an ENROLLED
 *     administrator's `memberadd`, which no such caller reaches).
 *   - IT CANNOT SEE the member SURFACE. D-134's half is deliberately unbuilt:
 *     a surface over an act whose voter the caller can name is a second path in,
 *     and it comes after this fence rather than beside it.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { MACHINE_FENCE_CHECKS } from "../checks/bio-checks.mjs";
import { ADMISSION_CHECKS } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const IDX_SRC = readFileSync(IDX, "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

/* THE THREE OPS ARE READ OUT OF THE SOURCE, not typed here. The array is the
   thing that makes the two halves impossible to ship apart, so a suite that
   typed its own copy would be grading a list of its own rather than the plane's
   — and a fourth governance verb added tomorrow is driven the day it lands. */
const govArr = IDX_SRC.match(/const GOVERNANCE_ACTIONS = (\[[^\]]*\])/);
const OPS3 = govArr ? JSON.parse(govArr[1].replace(/'/g, '"')) : [];
console.log("\n--- 0. the subject, DERIVED from the source rather than typed ---");
console.log(`  GOVERNANCE_ACTIONS: ${OPS3.join(", ")}`);
t("GOVERNANCE_ACTIONS parsed and holds the three ops §4.7 and §4.9 assign to a person "
+ "(an empty parse is not a clean one)",
  [OPS3.length >= 3, ["adminendorse", "adminremove", "membercaps"].every((o) => OPS3.includes(o))],
  [true, true]);

/* ================================================= 1. THE STRUCTURAL HALVES
 * Read as TEXT, with comments stripped, so the reasoning written in the region
 * (which names the bearer classes on purpose) is not mistaken for the guard. */
console.log("\n--- 1. structure: the fence, the stamp and the reach, pinned at the source ---");
const region = (name) => {
  const a = IDX_SRC.indexOf(`/* DEC-49 REGION ${name}`), b = IDX_SRC.indexOf(`/* END DEC-49 REGION ${name} */`);
  return a < 0 || b < a ? null : IDX_SRC.slice(a, b).replace(/\/\*[\s\S]*?\*\//g, "");
};
const fence = region("is-operator-governance-act");
t("STRUCTURE: the operator fence refuses on how the caller ARRIVED — its guard is `!viaSession`, "
+ "and it names no class literal, no env binding and no token string, so a binding added tomorrow "
+ "is covered and no spelling here can go stale (C-32.14's shape)",
  fence === null ? "REGION MISSING" : {
    guard: /if \(GOVERNANCE_ACTIONS\.includes\(op\) && !viaSession\)/.test(fence),
    classLiteral: /["'`](admin|member|probe|daemon|ai)["'`]/.test(fence),
    binding: /env\.[A-Z_]+/.test(fence),
    token: /searchParams\.get\(\s*["']token["']\s*\)/.test(fence),
    literalCode: /reason: "OPERATOR_TOKEN_CANNOT_GOVERN"/.test(fence) },
  { guard: true, classLiteral: false, binding: false, token: false, literalCode: true });
/* THE STAMP IS PINNED SEPARATELY FROM THE FENCE, because the whole argument of
   this item is that they are two layers and either alone is a half-landing. */
t("STRUCTURE: the `by` stamp covers the three ops and takes the session's member, never the "
+ "caller's — one expression, set AFTER the caller's parameters were copied",
  /if \(PROJECT_ACTIONS\.includes\(op\) \|\| GOVERNANCE_ACTIONS\.includes\(op\)[\s\S]{0,120}?inner\.searchParams\.set\("by", viaSession \? sessMember/.test(IDX_SRC),
  true);
/* THE REACH IS PINNED AS **BOTH SETS**, which is this item's one design call and
   the thing `reach-dropped` breaks. `SESSION_OPS.admin` means the FOUNDER'S
   password session alone (`kind` is `sess.role === "admin" ? "admin" : "member"`,
   measured and recorded twice in `d270-refusal-truth.test.mjs`), so the admin set
   alone would have handed §4.7's vote to one person while the fence below took
   the bearer route away from every other administrator — leaving a group of three
   unable to add or remove an administrator at all. What decides these acts is the
   ROSTER, and the store asks it against the stamp. */
t("STRUCTURE: the three reach BOTH session sets, so EVERY administrator can cast and not only the "
+ "founder — and the `admin` spread alone would be the row's own failure mode arrived at one "
+ "administrator instead of zero",
  (IDX_SRC.match(/\.\.\.GOVERNANCE_ACTIONS,/g) || []).length, 2);

/* ============================================================== 2. FIXTURE */
const clsStart = IDX_SRC.indexOf("async function classify(token, env) {");
const clsBody = clsStart < 0 ? "" : IDX_SRC.slice(clsStart, IDX_SRC.indexOf("\n}", clsStart));
const BINDINGS = [...clsBody.matchAll(
  /token === env\.([A-Z_]+) && \(await liveToken\(env\.\1\)\)\) return "([a-z]+)"/g)].map((m) => ({ binding: m[1], cls: m[2] }));
const TOKEN_OF = Object.fromEntries(BINDINGS.map((b) => [b.cls, `${b.cls}-d136-${b.binding.toLowerCase()}`]));
console.log(`\n  classify() resolves: ${BINDINGS.map((b) => `${b.binding} -> ${b.cls}`).join(", ")}`);
t("classify() parsed to its env bindings and at least the operator's three are among them "
+ "(the bearer set is DERIVED, so a fourth binding is driven the day it lands)",
  ["admin", "member", "probe"].every((c) => BINDINGS.some((b) => b.cls === c)) && BINDINGS.length >= 3, true);

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: IDX_SRC,
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ...Object.fromEntries(BINDINGS.map((b) => [b.binding, TOKEN_OF[b.cls]])), VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const ADM = TOKEN_OF.admin;

/* D-325: `store=scratch` IS NAMED ON EVERY CALL. The namespace is not fenced for
   any class but PROBE, and a probe refused in `bio` is refused by SCOPE_REFUSED,
   which would prove nothing about this fence — operator-attest.test.mjs's
   reasoning exactly. Sessions resolve against `bio`, so every member is enrolled
   in BOTH stores and the acts address `scratch`, where the roster the act reads
   lives beside the session that drives it. */
const S = "&store=scratch";

const enrol = async (memberId, role, capabilities) => {
  for (const st of ["", S]) {
    /* CORRECTED 2026-09-21 (REC-156), NEVER EXEMPTED: this body carried `by: "admin"`.
       On every path this helper takes it recorded nothing — ruth and gus are the first
       two administrators and cai an ordinary member, so no §4.7 proposal is opened —
       and it now names nothing either: the plane STAMPS `memberadd`'s `by`, and this
       bearer is `class:admin`. A `by` in a fixture's body is a claim about who acted
       that the plane no longer takes from a caller, so it is removed, not kept. */
    const add = await POST(`op=memberadd&token=${ADM}${st}`,
      { memberId, cover: `cover for ${memberId}`, role, capabilities });
    if (!add?.invite) throw new Error(`memberadd ${memberId}${st}: ${JSON.stringify(add)}`);
    const en = await POST(`op=enroll${st}`,
      { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-136` });
    if (!en?.ok) throw new Error(`enroll ${memberId}${st}: ${JSON.stringify(en)}`);
  }
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-136` });
  if (!lg?.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return `token=${lg.token}`;
};

/* Two administrators first (4.2/4.3), and the founder holds ADMIN_TOKEN with no
   roster row of their own — so `ruth` and `gus` are the two whose consensus §4.7
   asks for, alongside the founder. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);
const GUS = await enrol("gus", "admin", ["contribute", "publish"]);
const CAI = await enrol("cai", "member", ["contribute"]);

const roster = async () => (await POST(`op=memberlist&token=${ADM}${S}`))?.members || [];
const rowOf = async (id) => (await roster()).find((m) => m.member_id === id) || null;
const arith = async () => await POST(`op=adminarith&token=${ADM}${S}`);

console.log("\n--- 2. the fixture, floored before anything is judged ---");
const live = await arith();
console.log(`  active administrators in the scratch store: ${live?.live?.administrators}`);
/* MEASURED RATHER THAN ASSUMED, and the first draft of this suite assumed three.
   `#activeAdmins()` prepends the founder ONLY when the store holds a claimed
   root credential, and the scratch store this suite addresses was never claimed
   — so the roster here is ruth and gus, and the founder is not on it. That is
   correct for the fixture and it is why a THIRD administrator is enrolled below
   through the very act under test: removal is impossible at two (4.7), so a
   two-administrator roster cannot exercise the removal arm at all. */
t("two active administrators to begin with — ruth and gus; the founder is not on the scratch "
+ "store's roster because that store was never claimed, which is measured here rather than assumed",
  live?.live?.administrators, 2);

/* ==================================== 3. A PERSON CASTS THE ACTS (the reach)
 * THE HALF `reach-dropped` BREAKS. Before this item no session of any role
 * reached these three, so every assertion in this block was unreachable by
 * construction and the §4.7 vote could be cast by nobody at all. */
console.log("\n--- 3. a signed-in administrator casts each act, and the SERVER says who they are ---");

/* Propose a fourth administrator. The proposal is opened by the founder's bearer
   token deliberately: `op=memberadd` is NOT this item's subject, it already held
   session reach, and opening the proposal from the same place the old suites did
   keeps the thing under test to the three ops. (REC-156, 2026-09-21: `memberadd` is
   §8's subject now, and its session reach is the FOUNDER'S alone. Opened here by the
   bearer still, so §3–§7 grade the three ops and nothing else: a bearer's proposal
   carries no endorsement — its stamp is `class:admin` — so both are awaited.) */
const proposal = await POST(`op=memberadd&token=${ADM}${S}`,
  { memberId: "nell", cover: "the third", role: "admin", capabilities: ["contribute"] });
t("a third administrator opens as a PROPOSAL rather than an invitation, as §4.7 requires",
  proposal?.reason, "CONSENSUS_REQUIRED");
console.log(`  proposal for nell: have ${JSON.stringify(proposal?.have)} awaiting ${JSON.stringify(proposal?.awaiting)}`);
t("with nobody having endorsed it yet, so both administrators are awaited",
  [proposal?.have, proposal?.awaiting], [[], ["gus", "ruth"]]);

const e1 = await POST(`op=adminendorse&${RUTH}${S}`, { memberId: "nell" });
t("ruth's own signed-in session casts a §4.7 endorsement — the act the plane could not offer a "
+ "person at all before this item, and could have offered only the FOUNDER had the reach gone "
+ "into the admin set alone",
  e1?.reason, "CONSENSUS_REQUIRED");
t("and the record counts it as RUTH's, from the session rather than from anything she sent",
  [e1?.have, e1?.awaiting], [["ruth"], ["gus"]]);

/* ================================ 4. THE FORGERY ARM — HOW A LIAR PASSES THIS
 * A happy-path-only suite is green over a plane that honours whatever it is
 * told, because an honest caller sends nothing to disagree with. So: ONE SESSION
 * CALLER SENDS ANOTHER ADMINISTRATOR'S ID, in the body AND in the query, and the
 * evidence is read from the RECORD rather than from the answer's echo. */
console.log("\n--- 4. THE FORGERY: one administrator's session naming ANOTHER as the voter ---");
const forgedEndorse = await POST(`op=adminendorse&${RUTH}${S}&by=gus`, { memberId: "nell", by: "gus" });
t("a session caller naming ANOTHER administrator as `by` does not cast that administrator's "
+ "endorsement — gus is STILL awaited after ruth sends his id in the body and in the query",
  forgedEndorse?.awaiting, ["gus"]);
t("and the consensus tally still names only the administrators who actually endorsed, so \"every "
+ "existing administrator must endorse\" is not satisfiable by typing somebody else's id",
  forgedEndorse?.have, ["ruth"]);
t("and nell is NOT invited on the strength of a forged consensus — the proposal is still proposed",
  (await rowOf("nell"))?.status, "proposed");

/* THE MIRROR, so the arm above is not green over a plane that refuses everyone:
   gus's OWN session completes the consensus and the invitation is issued. */
const e2 = await POST(`op=adminendorse&${GUS}${S}`, { memberId: "nell" });
t("MIRROR: gus's own session completes the consensus and the invitation is issued — the fence "
+ "refuses a forged voter rather than refusing every voter",
  [e2?.ok, typeof e2?.invite], [true, "string"]);
t("and the record names both who endorsed", e2?.endorsedBy, ["gus", "ruth"]);
/* THE THIRD ADMINISTRATOR ENROLS, through the invitation TWO PEOPLE'S SESSIONS
   just issued between them. Removal is impossible at two (4.7), so the removal
   arm below could not be driven at all without this — and the roster it is
   driven over was built BY the act under test rather than around it. */
const nellIn = await POST(`op=enroll${S}`,
  { invite: e2.invite, handle: "nell", password: "nell-passphrase-136" });
t("and nell enrols on it, so the roster the removal arm is driven over was built BY the §4.7 act "
+ "under test rather than around it",
  [nellIn?.ok, (await arith())?.live?.administrators], [true, 3]);

console.log("\n--- 4b. the same forgery at the REMOVAL vote and the CAPABILITY edit ---");
const r1 = await POST(`op=adminremove&${RUTH}${S}&by=gus`,
  { memberId: "gus", by: "gus", reason: "measured forgery arm" });
/* The target may not vote on their own removal. If ruth's `by=gus` were honoured
   on a vote to remove GUS, the plane would answer TARGET_CANNOT_VOTE — so this
   arm reads the refusal code as the discriminator and the tally as the proof. */
t("a session caller naming ANOTHER administrator as `by` does not cast that administrator's "
+ "removal vote — ruth's vote to remove gus is counted as RUTH's, not refused as gus voting on "
+ "himself, which is what the plane would have answered had it honoured what she sent",
  [r1?.reason, r1?.have, r1?.deciders], ["VOTES_SHORT", 1, ["ruth"]]);
t("and gus is still an administrator, because one vote of the two a three-administrator removal "
+ "needs is one vote (4.7's arithmetic, untouched by this item)",
  (await rowOf("gus"))?.role, "admin");

const c1 = await POST(`op=membercaps&${RUTH}${S}&by=gus`,
  { memberId: "cai", capabilities: ["contribute", "publish"], by: "gus" });
t("a session caller naming ANOTHER administrator as `by` does not make the capability edit that "
+ "administrator's — the record names RUTH, who asked",
  [c1?.ok, c1?.by], [true, "ruth"]);
t("and the edit itself still landed, so the arm above measures the STAMP rather than a refusal",
  (await rowOf("cai"))?.capabilities, ["contribute", "publish"]);

/* ======================================= 5. THE ARITHMETIC IS STILL THE RULE
 * The accepts-when's third clause. A fence that quietly loosened §4.7 while
 * making it reachable would be this item defeating its own subject. */
console.log("\n--- 5. the governance arithmetic still refuses an addition without consensus ---");
const partial = await POST(`op=memberadd&token=${ADM}${S}`,
  { memberId: "otto", cover: "the fourth", role: "admin", capabilities: ["contribute"] });
t("an addition is refused for want of consensus and NAMES all three who are still awaited",
  [partial?.reason, partial?.awaiting], ["CONSENSUS_REQUIRED", ["gus", "nell", "ruth"]]);
t("and no invitation is handed out on a partial consensus", partial?.invite, undefined);
const one = await POST(`op=adminendorse&${RUTH}${S}`, { memberId: "otto" });
t("and one real administrator's endorsement is still not consensus — the arithmetic this item "
+ "made reachable is the same arithmetic it was before",
  [one?.reason, one?.have, one?.awaiting], ["CONSENSUS_REQUIRED", ["ruth"], ["gus", "nell"]]);
t("and otto is still only proposed", (await rowOf("otto"))?.status, "proposed");

/* ============================== 6. THE BEARER CLASSES — D-421's CLASS, C-32.17
 * Driven for EVERY class the OPS row admits, derived from `classify()`. */
console.log("\n--- 6. no operator bearer token governs (C-32.17, D-421's ruling applied) ---");
const opsBody = IDX_SRC.slice(IDX_SRC.indexOf("const OPS = {"), IDX_SRC.indexOf("\n};", IDX_SRC.indexOf("const OPS = {")));
const opClasses = (op) => {
  const m = opsBody.match(new RegExp(`^\\s{2}${op}:\\s*\\{\\s*classes:\\s*(\\[[^\\]]*\\])`, "m"));
  return m ? JSON.parse(m[1]) : null;
};
const ROW = MACHINE_FENCE_CHECKS.OPERATOR_TOKEN_CANNOT_GOVERN;
t("the catalogue carries C-32.17 with a canned translation of its own, so the refusal's sentence "
+ "is the record's rather than one typed at the site (DEC-49)",
  [ROW?.check, typeof ROW?.translation === "string" && ROW.translation.trim().split(/\s+/).length >= 20,
   ROW?.where], ["C-32.17", true, "src/index.mjs fetch > is-operator-governance-act"]);

/* THE PAYLOADS ARE COMPLETE AND CURRENT, which is the only way a refusal proves
   anything: `otto` is a LIVE PROPOSAL at this point in the run, so `adminendorse`
   would SUCCEED for an administrator and the refusals below are the fence rather
   than the plane refusing a payload it would have refused anyway (REC-73). */
const PAYLOAD = { adminendorse: { memberId: "otto" },
                  adminremove: { memberId: "gus", reason: "bearer arm" },
                  membercaps: { memberId: "cai", capabilities: ["contribute"] } };
let bearerDrives = 0;
for (const op of OPS3) {
  const admitted = (opClasses(op) || []).filter((c) => BINDINGS.some((b) => b.cls === c));
  console.log(`  op=${op}: OPS admits ${JSON.stringify(opClasses(op))}; bearer classes reaching the handler: ${admitted.join(", ") || "(none)"}`);
  for (const cls of admitted) {
    /* THE PAYLOAD IS COMPLETE AND THE `by` IS A REAL ACTIVE ADMINISTRATOR, which
       is the only way this proves anything: a bearer refused over a payload the
       plane would have refused anyway (REC-73's lesson) measures nothing. Before
       this item every one of these drives SUCCEEDED. */
    const a = await POST(`op=${op}&token=${TOKEN_OF[cls]}${S}&by=ruth`, { ...PAYLOAD[op], by: "ruth" });
    bearerDrives++;
    t(`op=${op}, the operator's \`${cls}\`-class bearer token: refused by name, naming the class it `
    + `refused, and carrying C-32.17's canned sentence rather than one typed at the site`,
      [a?.reason, a?.check, a?.tokenClass, a?.translation, a?.op],
      ["OPERATOR_TOKEN_CANNOT_GOVERN", "C-32.17", cls, ROW.translation, op]);
  }
}
t("the bearer drive is non-empty and covers every class × op the OPS rows admit — an empty drive "
+ "is not a clean one, and this project has measured a headline arm passing over one three times",
  bearerDrives >= OPS3.length, true);
/* AND NOTHING THE BEARERS ASKED FOR LANDED. A refusal that returns 403 while the
   write went through is the shape eleven fences in this repository turned out to
   have; the read-back is what tells a fence from a message. */
t("and NOTHING a bearer asked for landed: gus is still an administrator, otto is still only "
+ "PROPOSED with ruth's single endorsement, and cai still holds the capabilities RUTH's session set",
  [(await rowOf("gus"))?.role, (await rowOf("otto"))?.status, (await rowOf("cai"))?.capabilities],
  ["admin", "proposed", ["contribute", "publish"]]);

/* ============== 7. AN ORDINARY MEMBER IS REFUSED BY THE THING THAT KNOWS
 * Before this item every session got SESSION_ROUTE_NOT_RECORDED — an OMISSION,
 * honestly stated, and this is the item that discharges it. The three reach BOTH
 * sets now, so a plain member passes the gate and the ROSTER refuses them, by
 * name: `expertiseconfirm`'s recorded posture, and the only answer that is true
 * of the caller AND of the rule. */
console.log("\n--- 7. an ordinary member is refused by the ROSTER, naming what is wrong ---");
for (const op of OPS3) {
  const a = await POST(`op=${op}&${CAI}${S}`, PAYLOAD[op]);
  t(`op=${op}: cai, an ordinary member, is refused NOT_AN_ADMIN — the store's answer, not the `
  + `gate's, and the absence D-270 refused to call a decision has stopped being an absence`,
    [a?.reason, a?.by], ["NOT_AN_ADMIN", "cai"]);
}
/* THE MIRROR FOR SECTION 7, so the block above is not green over a plane that
   refuses every session: the same three acts succeeded for ruth in §3 and §4b. */
t("MIRROR: the refusals above are about cai's place on the roster and not about sessions — ruth's "
+ "session performed all three acts in sections 3, 4 and 4b of this same run",
  [(await rowOf("nell"))?.status, (await rowOf("cai"))?.capabilities],
  ["active", ["contribute", "publish"]]);
/* AND NOTHING CAI ASKED FOR LANDED — a 403 over a completed write is the shape
   eleven fences in this repository turned out to have. */
t("and nothing cai asked for landed: gus is still an administrator, otto is still only proposed, "
+ "and cai still holds the capabilities RUTH's session set rather than the ones cai asked for",
  [(await rowOf("gus"))?.role, (await rowOf("otto"))?.status, (await rowOf("cai"))?.capabilities],
  ["admin", "proposed", ["contribute", "publish"]]);

/* ============================ 8. REC-156 — `op=memberadd`'s `by` IS THE SERVER'S
 * CORRECTED 2026-09-21 BY REC-156, NEVER EXEMPTED. Until this landing this section
 * was D-136's BOUNDARY: a printed FINDING that `memberadd`'s `by` was not stamped
 * while `Store#memberAdd` wrote an `admin_votes` ('add') row from it, and two pins
 * said to FAIL THE DAY IT CLOSES. **They could not.** The first asserted that
 * `memberadd` is NOT in `GOVERNANCE_ACTIONS`, and the fix the finding itself named —
 * one disjunct on the stamp — leaves that array exactly as it was; the second only
 * asserted that the stamp's condition parsed. MEASURED rather than reasoned: with the
 * disjunct and the store's relay applied and this section left as it was, the suite
 * ran 43/0 (see the NEGATIVE CONTROL line). A pin that stays green over the fix it
 * guards is a pin coupled to the SHAPE someone expected the fix to take, which is not
 * the thing. What it asserted is still true and is kept below with its reason
 * corrected. The finding's sentence is kept in the PAST TENSE:
 *   "`op=memberadd`'s `by` is NOT server-stamped, and `Store#memberAdd` WRITES AN
 *    `admin_votes` ('add') ROW FROM IT. So the proposer of an administrator can
 *    still record one endorsement in another administrator's name."
 *
 * HOW A LIAR PASSES THE ACCEPTS-WHEN, stated before what is checked: STAMP AT THE
 * PLANE WHILE THE STORE STILL HONOURS A BODY `by`. Every drive through the plane
 * arrives with the query `by` set, so a store that FELL BACK to the body when the
 * query is empty is green over every op-level arm. So the Durable Object is driven
 * DIRECTLY too (8e), and every op-level drive SENDS the forged id in the body AND
 * the query, with the evidence read from the RECORD (who is counted, who is still
 * awaited, what the store's own tally says afterwards) and never from an echo.
 *
 * WHAT THIS SECTION CAN AND CANNOT SEE, and the sentence is load-bearing:
 *   - IT CAN SEE the stamp and the relay at the source, the ONE session that reaches
 *     the op (the founder's), every bearer class the OPS row admits, and the store
 *     with no plane in front of it — each read back from the store's own tally.
 *   - IT CANNOT SEE an ENROLLED administrator's `memberadd`, because no such caller
 *     reaches the stamp: `SESSION_OPS.admin` holds the op and is the FOUNDER'S set
 *     alone, so ruth is refused before the op runs. That is MEASURED in 8f and ROUTED,
 *     not changed here — it is a reach change, which is not this row.
 * ========================================================================= */
console.log("\n--- 8. REC-156: `op=memberadd`'s `by` is the server's, and the store reads only the stamp ---");
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "latin1");
/* 8a. STRUCTURE — the stamp and the relay, each a half without which the other is
   a mechanism believed on the strength of its existence. */
/* CORRECTED 2026-09-23 (REC-159), never exempted: the disjunct was `op === "memberadd"`, and REC-159
   widened it to `CUSTODIAL_ACTIONS.includes(op)` — the four §4.9 acts, `memberadd` first among them.
   Still ONE condition and ONE expression; the array is parsed and asserted to hold `memberadd`. */
const custArr = IDX_SRC.match(/const CUSTODIAL_ACTIONS = (\[[^\]]*\])/);
const CUST4 = custArr ? JSON.parse(custArr[1]) : [];
t("STRUCTURE: the `by` stamp names `memberadd` in its OWN disjunct of the ONE condition — "
+ "`CUSTODIAL_ACTIONS`, which holds it (REC-159) — so the expression that stamps the three §4.7/§4.9 "
+ "acts stamps the proposer too, never a second expression that could drift",
  [/if \(PROJECT_ACTIONS\.includes\(op\) \|\| GOVERNANCE_ACTIONS\.includes\(op\)[^)]*?\|\| CUSTODIAL_ACTIONS\.includes\(op\)\)\s*inner\.searchParams\.set\("by", viaSession \? sessMember/.test(IDX_SRC),
   CUST4.includes("memberadd")],
  [true, true]);
t("STRUCTURE: the store's `memberadd` relay spreads the body and THEN sets `by` from the query, so a "
+ "`by` in the body can never win — D-136's shape for the three ops beside it",
  /memberadd: \(\) => this\.memberAdd\(\{ \.\.\.\(body \|\| \{\}\), by: url\.searchParams\.get\("by"\) \}\)/.test(STORE_SRC),
  true);
t("BOUNDARY, kept and its reason CORRECTED: `memberadd` is NOT in GOVERNANCE_ACTIONS — not because its "
+ "`by` is unstamped (8a) but because that array also spreads MEMBER-set reach and the operator fence, "
+ "and REC-156 moves neither",
  OPS3.includes("memberadd"), false);

/* THE DURABLE OBJECT, reached with no control plane in front of it — founder-sight's
   helper, taking the store's NAME because the plane addresses `bio` and `scratch` as
   two Durable Objects. */
const DO = async (store, path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName(store)).fetch(`http://do/${path}`,
    { method: "POST", body: JSON.stringify(body ?? {}) })).json());
};

/* 8b/8c. THE FOUNDER'S SESSION — until REC-159 THE ONE SESSION THAT REACHED `memberadd` (every
   administrator's now: §9). The founder is
   an ADMINISTRATOR only in a CLAIMED store (`#activeAdmins` counts `admin` where a claim was
   spent) and a claim writes `bio`, so this arm addresses `bio`, where `enrol` put ruth and
   gus too. Claimed HERE and not at the top: a claim spent before enrolment would have made
   gus the THIRD administrator of `bio`, and his invitation a proposal. */
const claimed = await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-156" });
const fl = await POST("op=login", { password: "founder-passphrase-156" });
const FOUNDER = `token=${fl?.token}`;
t("fixture: the founder claimed `bio` and signed in, so the one session route `memberadd` has "
+ "exists to be driven", [claimed?.ok, typeof fl?.token], [true, "string"]);

/* THE FORGERY AND THE POSITIVE, from ONE drive: the founder's session proposes a fourth
   administrator of `bio` while SENDING RUTH'S ID as `by`, in the body AND the query. */
const pia = await POST(`op=memberadd&${FOUNDER}&by=ruth`,
  { memberId: "pia", cover: "the fourth", role: "admin", capabilities: ["contribute"], by: "ruth" });
console.log(`  pia, proposed by the founder's session sending by=ruth twice: `
  + `${JSON.stringify({ reason: pia?.reason, have: pia?.have, awaiting: pia?.awaiting })}`);
t("memberadd: a body `by` naming ANOTHER administrator does not cast that administrator's endorsement "
+ "— ruth is STILL awaited after the founder's session sends her id in the body and in the query",
  [pia?.reason, pia?.proposed, (pia?.awaiting || []).includes("ruth")], ["CONSENSUS_REQUIRED", true, true]);
t("memberadd: the signed-in administrator's proposal records the endorsement as THEM — the founder's "
+ "own session is counted as `admin`, the store's name for the founder, and as nobody else",
  pia?.have, ["admin"]);
/* READ BACK FROM THE STORE, not from the answer: gus endorses at the Durable Object and
   the store tallies the table. A forged row in ruth's name would be in that tally. */
const piaBack = await DO("bio", "adminendorse?by=gus", { memberId: "pia" });
t("memberadd, read back at the store: after gus endorses, the tally names the founder and gus and NOT "
+ "ruth — no row in ruth's name was ever written",
  [piaBack?.have, piaBack?.awaiting], [["admin", "gus"], ["ruth"]]);

/* 8d. EVERY BEARER CLASS THE OPS ROW ADMITS, derived rather than typed (§6's rule). A bearer
   is NOT refused here — REC-156's PROVISIONAL decision, argued at the stamp site in index.mjs
   and BOB's to rule — and that is pinned as a POSITIVE so the day it is ruled otherwise this
   is what moves: the proposal OPENS and records NO endorsement, because the stamp wrote
   `class:<cls>` and no roster holds that name. `scratch`, because PROBE is confined there;
   its roster is ruth, gus and nell. */
/* CORRECTED 2026-09-23 (REC-159): the bearer classes are read from the row's `machineClasses`, which
   REC-159 added when `member` joined `classes` for an enrolled administrator's SESSION. `classes` now
   names the member KIND a session resolves to; `machineClasses` names the bearers the op admits — the
   same `admin` and `probe` as before. The MEMBER_TOKEN bearer is refused, driven in §9. */
const machineClassesOf = (op) => {
  const m = opsBody.match(new RegExp(`^\\s{2}${op}:\\s*\\{[^\\n]*?machineClasses:\\s*(\\[[^\\]]*\\])`, "m"));
  return m ? JSON.parse(m[1]) : null;
};
const MA_CLASSES = (machineClassesOf("memberadd") || []).filter((c) => BINDINGS.some((b) => b.cls === c));
console.log(`  op=memberadd: OPS machineClasses ${JSON.stringify(machineClassesOf("memberadd"))}; bearer classes driven: `
  + `${MA_CLASSES.join(", ") || "(none)"}`);
let maDrives = 0;
for (const cls of MA_CLASSES) {
  const id = `quinn-${cls}`;
  const b = await POST(`op=memberadd&token=${TOKEN_OF[cls]}${S}&by=ruth`,
    { memberId: id, cover: `proposed by the ${cls} bearer`, role: "admin", capabilities: ["contribute"], by: "ruth" });
  maDrives++;
  t(`memberadd, the operator's \`${cls}\`-class bearer token naming ruth as \`by\`: the proposal OPENS and `
  + `records NO endorsement, not ruth's and not anybody's (REC-156's provisional: a bearer is not refused)`,
    [b?.reason, b?.proposed, b?.have, (b?.awaiting || []).includes("ruth")], ["CONSENSUS_REQUIRED", true, [], true]);
  const back = await DO("scratch", "adminendorse?by=gus", { memberId: id });
  t(`memberadd, the \`${cls}\` bearer's proposal read back at the store: gus's endorsement is the ONLY one`,
    back?.have, ["gus"]);
}
t("the bearer memberadd drive is non-empty and covers every class the OPS row admits — the operator's "
+ "`admin` class among them (an empty drive is not a clean one)",
  [maDrives >= 1, maDrives === MA_CLASSES.length, MA_CLASSES.includes("admin")], [true, true, true]);

/* 8e. THE STORE, WITH NO PLANE IN FRONT OF IT — the liar's own path. */
const rhea = await DO("scratch", "memberadd",
  { memberId: "rhea", cover: "no stamp", role: "admin", capabilities: ["contribute"], by: "ruth" });
t("the STORE: a body `by` with NO stamp beside it records NO endorsement — an absent stamp is read as "
+ "nobody, never as the body's answer",
  [rhea?.reason, rhea?.have], ["CONSENSUS_REQUIRED", []]);
const saul = await DO("scratch", "memberadd?by=gus",
  { memberId: "saul", cover: "stamped", role: "admin", capabilities: ["contribute"], by: "ruth" });
t("the STORE: with a stamp beside it, the STAMP names the endorser and the body's `by` is overwritten",
  [saul?.reason, saul?.have], ["CONSENSUS_REQUIRED", ["gus"]]);

/* 8f. CLOSED 2026-09-23 BY REC-159 — CORRECTED WITH ITS REASON, NEVER EXEMPTED, as the paragraph below
   asked. The assertion pinned SESSION_ROLE_CANNOT_REACH_OP for ruth; REC-159 moved `memberadd`,
   `memberset`, `signeradd` and `signerset` into both session sets (§9 grades all four), so ruth's
   session now reaches the op and the store answers. The original text is kept, past tense:
   WHAT WAS STILL NOT CLOSED, MEASURED AND ROUTED — and pinned so it is READ the day it is.
   `memberadd` reaches the FOUNDER'S session alone: an ENROLLED administrator is refused at
   the session gate before the op runs, with a sentence saying the op is reserved to an
   administrator — which ruth IS. Membership v2 §4.9 gives "add a member" to every
   administrator. The fix is D-136's shape (both session sets, a stamped `by` the roster
   answers) and it moves reach, so it is ROUTED by REC-156's DELEGATION in CLAIMS.md rather
   than taken. WHEN THAT LANDS THIS ASSERTION FAILS, and this comment is the reason it was
   left: correct it with a dated reason, never exempt it. */
const ruthAdds = await POST(`op=memberadd&${RUTH}${S}`,
  { memberId: "tess", cover: "ruth's proposal", role: "member", capabilities: ["contribute"] });
console.log(`  ruth (an ENROLLED administrator) at op=memberadd: `
  + `${JSON.stringify({ reason: ruthAdds?.reason, role: ruthAdds?.role, error: ruthAdds?.error })}`);
t("CLOSED BY REC-159: an enrolled administrator's session REACHES `memberadd` and the invitation is "
+ "issued — the refusal that called the op an administrator's, to an administrator, is gone",
  [ruthAdds?.ok, typeof ruthAdds?.invite, ruthAdds?.reason], [true, "string", undefined]);

/* ============================ 9. REC-159 — §4.9's CUSTODIAL ACTS ARE EVERY ADMINISTRATOR'S
 * `BIO_Membership_Architecture_v2.md` §4.9 gives adding a member, setting a member's status and
 * managing signing keys to EVERY administrator; §4.7's block *"WHAT IS STILL NOT CLOSED"* named the
 * fix and 8f above pinned the defect. REC-159 applies D-136's call again: `memberadd`, `memberset`,
 * `signeradd` and `signerset` (`CUSTODIAL_ACTIONS`) reach BOTH session sets, their `by` is the
 * SERVER'S stamp, and the store refuses a member-named `by` that is not an active administrator,
 * NOT_AN_ADMIN, before it looks anything up. SCOPE AMENDED by BOB #31: `memberset`, `signeradd` and
 * `signerset` record the stamped actor in a new `status_by` column, and a row no stamp ever touched
 * reads `not recorded`.
 *
 * HOW A LIAR PASSES THE ACCEPTS-WHEN, stated before what is checked: WIDEN THE REACH WITHOUT THE
 * ROSTER, so any member's session performs the acts; or HONOUR A SENT `by`, so an administrator's
 * session writes somebody else's name into the record. So every positive arm below is also a FORGERY
 * arm — ruth's session sends gus's id in the body AND the query — and the evidence is READ BACK from
 * the record (`op=memberlist`, `op=signerlist`, the §4.7 tally), never from an echo; and an ORDINARY
 * member drives all four with COMPLETE payloads that would succeed for an administrator, and nothing
 * they asked for may land. `scratch`, named on every call, where ruth, gus and nell are the active
 * administrators and cai an ordinary member. */
console.log("\n--- 9. REC-159: an enrolled administrator performs §4.9's four acts from her own session ---");
t("the subject, DERIVED from the source: `CUSTODIAL_ACTIONS` holds exactly the four §4.9 acts, and none "
+ "of them is in GOVERNANCE_ACTIONS (whose operator fence would refuse the bearer BOB #22 ruled keeps them)",
  [[...CUST4].sort(), CUST4.filter((o) => OPS3.includes(o))],
  [["memberadd", "memberset", "signeradd", "signerset"], []]);
t("STRUCTURE: the four reach BOTH session sets — spread once into each, like GOVERNANCE_ACTIONS",
  (IDX_SRC.match(/\.\.\.CUSTODIAL_ACTIONS,/g) || []).length, 2);
t("STRUCTURE: each of the four rows admits the `member` KIND for a session and bounds a bearer by "
+ "`machineClasses` to the operator's `admin` and `probe`, the classes it held before",
  Object.fromEntries(CUST4.map((o) => [o, [opClasses(o), machineClassesOf(o)]])),
  Object.fromEntries(CUST4.map((o) => [o, [["admin", "member", "probe"], ["admin", "probe"]]])));
const signers = async () => (await POST(`op=signerlist&token=${ADM}${S}`))?.signers || [];
const keyRow = async (k) => (await signers()).find((r) => r.key_b64 === k) || null;
const KEY_RUTH = "AAAAC3NzaC1lZDI1NTE5AAAAIrec159ruthregisterscai";
const KEY_CAI = "AAAAC3NzaC1lZDI1NTE5AAAAIrec159caiasksforthis";

/* 9a. memberadd — ruth invites an ordinary member, and proposes an administrator. */
const vic = await POST(`op=memberadd&${RUTH}${S}&by=gus`,
  { memberId: "vic", cover: "ruth's invitee", role: "member", capabilities: ["contribute"], by: "gus" });
t("9a memberadd: ruth's own session issues an invitation — the act 8f pinned as refused",
  [vic?.ok, typeof vic?.invite], [true, "string"]);
const uma = await POST(`op=memberadd&${RUTH}${S}&by=gus`,
  { memberId: "uma", cover: "ruth's proposal", role: "admin", capabilities: ["contribute"], by: "gus" });
t("9a memberadd: ruth's proposal of an administrator records HER endorsement and not gus's, whose id "
+ "she sent in the body and the query",
  [uma?.reason, uma?.have, (uma?.awaiting || []).includes("gus")], ["CONSENSUS_REQUIRED", ["ruth"], true]);
const umaBack = await DO("scratch", "adminendorse?by=nell", { memberId: "uma" });
t("9a memberadd, read back at the store: after nell endorses, the tally is ruth and nell, and gus is "
+ "still awaited — no row in gus's name was written",
  [umaBack?.have, umaBack?.awaiting], [["nell", "ruth"], ["gus"]]);

/* 9b. memberset — ruth revokes vic's invitation. */
const vicSet = await POST(`op=memberset&${RUTH}${S}&by=gus`, { memberId: "vic", status: "revoked", by: "gus" });
t("9b memberset: ruth's own session sets a member's status, and the answer names HER",
  [vicSet?.ok, vicSet?.by], [true, "ruth"]);
t("9b memberset, read back from the roster: vic is revoked and `status_by` is ruth, not the gus she sent",
  [(await rowOf("vic"))?.status, (await rowOf("vic"))?.status_by], ["revoked", "ruth"]);

/* 9c. signeradd — ruth registers a key for cai. */
const kAdd = await POST(`op=signeradd&${RUTH}${S}&by=gus`,
  { keyB64: KEY_RUTH, memberId: "cai", comment: "rec-159", by: "gus" });
t("9c signeradd: ruth's own session registers a signing key, and the answer names HER",
  [kAdd?.ok, kAdd?.by], [true, "ruth"]);
t("9c signeradd, read back from the signer roster: the key is active and `status_by` is ruth",
  [(await keyRow(KEY_RUTH))?.status, (await keyRow(KEY_RUTH))?.status_by], ["active", "ruth"]);

/* 9d. signerset — ruth revokes that key. */
const kSet = await POST(`op=signerset&${RUTH}${S}&by=gus`, { keyB64: KEY_RUTH, status: "revoked", by: "gus" });
t("9d signerset: ruth's own session revokes a key, and the answer names HER",
  [kSet?.ok, kSet?.by], [true, "ruth"]);
t("9d signerset, read back from the signer roster: the key is revoked and `status_by` is ruth",
  [(await keyRow(KEY_RUTH))?.status, (await keyRow(KEY_RUTH))?.status_by], ["revoked", "ruth"]);

/* 9e. AN ORDINARY MEMBER, refused BY NAME at all four, with payloads that would succeed for an
   administrator: cai invites, re-activates vic, registers a key of his own and re-activates ruth's. */
const CAI_ASKS = {
  memberadd: { memberId: "wes", cover: "cai's invitee", role: "member", capabilities: ["contribute"] },
  memberset: { memberId: "vic", status: "active" },
  signeradd: { keyB64: KEY_CAI, memberId: "cai", comment: "cai's own" },
  signerset: { keyB64: KEY_RUTH, status: "active" },
};
for (const op of CUST4) {
  const a = await POST(`op=${op}&${CAI}${S}`, CAI_ASKS[op]);
  t(`9e op=${op}: cai, an ordinary member, is refused NOT_AN_ADMIN by the roster — not by the gate, `
  + `and not with a sentence calling the op somebody else's`,
    [a?.reason, a?.by], ["NOT_AN_ADMIN", "cai"]);
}
t("9e and NOTHING cai asked for landed: wes was never invited, vic is still revoked by ruth, cai holds no "
+ "key of his own, and ruth's revocation of the key she registered stands",
  [await rowOf("wes"), (await rowOf("vic"))?.status, await keyRow(KEY_CAI), (await keyRow(KEY_RUTH))?.status],
  [null, "revoked", null, "revoked"]);

/* 9f. THE BEARERS. The operator's `admin` bearer keeps all four (BOB #22), recorded as the credential
   and never as a person; the MEMBER_TOKEN bearer, which `member` in `classes` would otherwise have let
   in, is refused exactly as it was before. */
const bSet = await POST(`op=memberset&token=${ADM}${S}&by=ruth`, { memberId: "vic", status: "revoked", by: "ruth" });
t("9f the operator's `admin` bearer still sets a status, and the record names the CREDENTIAL, "
+ "`class:admin`, not the ruth it sent",
  [bSet?.ok, (await rowOf("vic"))?.status_by], [true, "class:admin"]);
for (const op of CUST4) {
  const a = await POST(`op=${op}&token=${TOKEN_OF.member}${S}`, CAI_ASKS[op]);
  t(`9f op=${op}: the MEMBER_TOKEN bearer is refused CLASS_FORBIDDEN, as before REC-159 — the session `
  + `grant is not a bearer grant`,
    a?.reason, "CLASS_FORBIDDEN");
}

/* 9g. `not recorded`, STATED. A member whose status no stamped act has set reads it, and so does a key
   registered with no plane in front of the store — the route that stamps nothing. */
t("9g a member row no custodial act has touched reads `status_by: not recorded` rather than a guess",
  (await rowOf("cai"))?.status_by, "not recorded");
await DO("scratch", "signeradd", { keyB64: "AAAAC3NzaC1lZDI1NTE5AAAAIrec159nostamp", memberId: "cai", by: "ruth" });
t("9g a key registered at the store with NO stamp reads `not recorded` — the body's `by` is never taken",
  (await keyRow("AAAAC3NzaC1lZDI1NTE5AAAAIrec159nostamp"))?.status_by, "not recorded");

/* 9h. THE STORE ASKS THE ROSTER ITSELF — with no plane in front of it, a stamp naming a
   non-administrator is refused, so the reach cannot be widened by going round the plane. */
const direct = await DO("scratch", "memberset?by=cai", { memberId: "vic", status: "active" });
t("9h the STORE: a stamped `by` naming an ordinary member is refused NOT_AN_ADMIN before anything is "
+ "looked up, and vic stays revoked",
  [direct?.reason, (await rowOf("vic"))?.status], ["NOT_AN_ADMIN", "revoked"]);

/* ============================ 10. REC-162 — `governorconfig` IS THE OPERATOR'S, AND ITS REFUSAL SAYS SO
 * `BIO_Membership_Architecture_v2.md` §4.9, *AND ADMINISTRATORS DO NOT RUN THE INSTANCE* (RULED by BOB #23):
 * setting a host's appetite is the founder's session's and the ADMIN_TOKEN holder's, never a roster
 * position's. After REC-159 it is the ONE op `SESSION_OPS.admin` alone holds, and until REC-162 its
 * refusal told an enrolled administrator the op *"is reserved to an administrator of this group"* and that
 * their role was `member` — false of ruth. It must name the FOUNDER'S session.
 *
 * HOW A LIAR PASSES IT: move `governorconfig` into BOTH session sets, so nobody is told anything false
 * because nobody is refused. So the enrolled administrator is asserted STILL REFUSED, and nothing they or
 * cai asked for may land — read back from `op=governorstate`, never from the answer. And the positive
 * pair: the founder's session and the ADMIN_TOKEN bearer still set an appetite. `scratch`, named on
 * every call. */
console.log("\n--- 10. REC-162: `governorconfig` refuses every member session with the founder's-session sentence ---");
const GOV = (h, n) => `op=governorconfig&host=${h}&appetite_per_min=${n}${S}`;
const govOf = async (h) => ((await POST(`op=governorstate&host=${h}&${RUTH}${S}`))?.hosts || [])[0]?.appetite_per_min ?? null;
for (const [who, sess] of [["ruth (an ENROLLED administrator)", RUTH], ["cai (an ordinary member)", CAI]]) {
  const g = await POST(`${GOV("rec162-refused.example", 7)}&${sess}`);
  console.log(`  ${who} at op=governorconfig: ${JSON.stringify({ reason: g?.reason, error: g?.error, session: g?.session, reachedBy: g?.reachedBy, role: g?.role })}`);
  t(`10a ${who} is REFUSED governorconfig at the gate — the operator's act (§4.9, BOB #23), so an `
  + `administrator is refused it exactly as a member is`,
    [g?.ok, g?.reason], [false, "SESSION_ROLE_CANNOT_REACH_OP"]);
  t(`10a ${who} reads the FOUNDER'S-SESSION sentence, with the session that reaches it named, and is `
  + `never told the op is an administrator's or that their role is \`member\``,
    [/reserved to the founder's session/.test(g?.error || ""), /administrator of this group/i.test(g?.error || ""),
     /this session's role is/i.test(g?.detail || ""), g?.reachedBy, g?.session, g?.role,
     g?.translation === ADMISSION_CHECKS.SESSION_ROLE_CANNOT_REACH_OP.translation],
    [true, false, false, "founder", "member", undefined, true]);
}
t("10a and NOTHING either of them asked for landed: the host they named holds no configured appetite",
  await govOf("rec162-refused.example"), null);
const gF = await POST(`${GOV("rec162-founder.example", 11)}&${FOUNDER}`);
const gB = await POST(`${GOV("rec162-bearer.example", 13)}&token=${ADM}`);
t("10b the founder's session and the ADMIN_TOKEN bearer still set an appetite, read back from the record",
  [gF?.ok, gB?.ok, await govOf("rec162-founder.example"), await govOf("rec162-bearer.example")],
  [true, true, 11, 13]);

/* DISPOSE, AND IT IS NOT HOUSEKEEPING. Without it the assertions all print, the
   tally reads clean, and the PROCESS NEVER EXITS — a suite that hangs after its
   own foot is indistinguishable, to the battery and to a reader watching a
   terminal, from one still doing work. Measured here on this suite's first
   complete run: 43 pass, 0 fail, and then nothing, twice, with a `workerd`
   left behind each time. `operator-attest.test.mjs`' foot is the shape. */
await mf.dispose();
console.log(`\nadminvote: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
