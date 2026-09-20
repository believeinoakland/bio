/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/adminvote.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES (src/index.mjs, src/store.mjs) while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/adminvote.control.mjs [arm]`. Each arm is armed ALONE with the other two layers HELD OPEN, and restored from a uniquely-named per-arm pristine copy verified by sha256 AND byte comparison (never `git checkout --`). DECLARED BEFORE ARMING — (a) `baseline`, nothing armed: MUST be green. (b) `stamp-dropped` — THE ROW'S OWN CONTROL: the `by` stamp is WIDENED to honour a caller-sent `by` for a session (`inner.searchParams.get("by") || sessMember`), which is exactly the defect D-136 closes, with the operator fence LEFT STANDING. The three FORGERY arms MUST FAIL BY NAME — `a session caller naming ANOTHER administrator as `by` does not cast that administrator's endorsement`, `… removal vote`, `… capability edit` — and every BEARER refusal MUST stay green, which is what shows the two layers are independent rather than one layer twice. (c) `fence-dropped` — the `is-operator-governance-act` guard alone neutered (`&& false`), stamp LEFT STANDING: all nine BEARER arms MUST FAIL at their named refusals, while `and NOTHING a bearer asked for landed` MUST stay GREEN — because the stamp behind still writes `class:<cls>` and the store still refuses it, so the arm says the fence supplies the SENTENCE and the stamp supplies the REFUSAL. (d) `reach-dropped` — `...GOVERNANCE_ACTIONS` removed from the MEMBER set, the admin set left standing: this measures exactly the difference between *an administrator's session* and *the founder's session*, and every POSITIVE arm MUST FAIL by name — the half of this row that `either alone is worse than neither` names. (e) `caps-ungated` — the roster check removed from `Store#memberCaps` ALONE, the two votes keeping theirs: an ordinary member's capability edit then SUCCEEDS, so `op=membercaps: cai, an ordinary member, is refused NOT_AN_ADMIN` and its two read-backs MUST FAIL while both VOTE arms stay green. This is the arm that tells a stamp that is READ from one merely recorded. (f) `overstrict` (required) — the fence refuses EVERY caller on the three ops (scoped to them, because an unscoped `if (true)` kills the suite before its foot and refutes nothing): every BEARER arm stays green while every SESSION arm MUST FAIL, the only thing that distinguishes a fence that holds from one that refuses everybody. (g) `classkeyed` — THE LIAR THE ROW NAMES: the fence rewritten to refuse by token STRING, so the PROBE class walks straight through — its three bearer arms MUST FAIL and the STRUCTURAL pin MUST FAIL on the env binding it sees in the region. RESULTS: on the line below, written from the harness's own output.
   RESULTS, RUN 2026-09-19 in worktree `.claude/worktrees/d136-conduct8` (branch `worker/d136-conduct8`, base `ad67ff0a`), every restore byte-identical (src/index.mjs 693,372 B sha256 25f6a31c9fb8…; src/store.mjs 2,737,997 B sha256 dc665ca70cdf…): baseline 43/0 · stamp-dropped 31/12 · fence-dropped 33/10 · reach-dropped 24/19 · caps-ungated 40/3 · overstrict 24/19 · classkeyed 39/4 — ALL SEVEN AS DECLARED, no arm failed to arm. THE FIRST RUN HAD FOUR ARMS **NOT AS DECLARED** AND THAT IS RECORDED RATHER THAN SMOOTHED: every discrepancy was a finding about the DECLARATION, none about the subject, and the reasons are written at each arm. The one that mattered ran in the direction that CLOSES a defect — `and gus is still an administrator, because one vote…` was declared to fail in three arms and did not, because it is a READ-BACK that stays true exactly when no removal carries; declaring it to fail would have put a forged EJECTION on the expected side of three arms. THE PRE-ITEM TRACE (this suite run against `origin/main` @ `ad67ff0a`): the suite cannot run at all there — `GOVERNANCE_ACTIONS` does not exist, so §0's floor fails by name and the drive never starts, which is itself the measurement: the acts this file grades had no expression in the plane to grade.
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
 *   - IT CANNOT SEE anything about `op=memberadd`, whose `by` ALSO writes an
 *     `admin_votes` row and is NOT stamped. That is measured and printed below
 *     as a FINDING with its fix named; it is a defect of the same class in an op
 *     this row does not name, and inventing a fix for it here would be widening
 *     the item rather than landing it.
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
    const add = await POST(`op=memberadd&token=${ADM}${st}`,
      { memberId, cover: `cover for ${memberId}`, role, capabilities, by: "admin" });
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
   keeps the thing under test to the three ops. */
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

/* ========================================================== 8. THE BOUNDARY
 * STATED RATHER THAN LEFT TO BE REDISCOVERED, and it is a FINDING about an op
 * this row does not name. */
console.log("\n--- 8. FINDING: the boundary of this item, measured rather than assumed ---");
const memberaddStamped = /if \(PROJECT_ACTIONS\.includes\(op\) \|\| GOVERNANCE_ACTIONS\.includes\(op\)[\s\S]{0,200}?\n/.exec(IDX_SRC);
console.log("  FINDING — `op=memberadd`'s `by` is NOT server-stamped, and `Store#memberAdd` WRITES AN");
console.log("  `admin_votes` ('add') ROW FROM IT. So the proposer of an administrator can still record");
console.log("  one endorsement in another administrator's name. It is the SAME class D-136 closes, in a");
console.log("  FOURTH op the row does not name; the fix is one disjunct (`op === \"memberadd\"` on the");
console.log("  stamp) plus the two suites that send `by` in that op's body. NOT DONE HERE: widening the");
console.log("  item is not landing it, and an undeclared reach or stamp change is an interface change");
console.log("  wearing this one's costume. REPORTED to CONDUCT with the fix named.");
/* PINNED DELIBERATELY, so the boundary is a decision rather than an oversight,
   and so the note above is READ on the day somebody closes it. When `memberadd`
   joins the stamp this assertion fails by name and this comment is the reason. */
t("BOUNDARY, pinned deliberately: `memberadd` is NOT in GOVERNANCE_ACTIONS — this item stamps the "
+ "three ops §4.7 and §4.9 name and no more. When the FINDING above is closed, THIS assertion is "
+ "the one that fails, and the note beside it is the reason it was left",
  OPS3.includes("memberadd"), false);
t("and the stamp's condition was found and parsed, so the finding above rests on a search that "
+ "COMPILED rather than on one that quietly matched nothing",
  memberaddStamped !== null, true);

/* DISPOSE, AND IT IS NOT HOUSEKEEPING. Without it the assertions all print, the
   tally reads clean, and the PROCESS NEVER EXITS — a suite that hangs after its
   own foot is indistinguishable, to the battery and to a reader watching a
   terminal, from one still doing work. Measured here on this suite's first
   complete run: 43 pass, 0 fail, and then nothing, twice, with a `workerd`
   left behind each time. `operator-attest.test.mjs`' foot is the shape. */
await mf.dispose();
console.log(`\nadminvote: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
