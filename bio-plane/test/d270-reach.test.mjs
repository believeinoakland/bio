/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/d270-reach.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3's, PL-4's, PL-11's, REC-73's and D-262's precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in the shared scratchpad; every restore is verified BY sha256 AND BY CONTENT (`cmp`) against a UNIQUELY-NAMED per-arm pristine copy, printing a byte count under a guarded minimum; and a BASELINE arm runs FIRST so a run in which every arm reports the same thing is distinguishable from a run in which the arms worked.
   DECLARED BEFORE ARMING — what MUST fail and what MUST NOT. Actual figures are written into the control driver's header when it runs, INCLUDING any arm that came back other than declared.
   (a) BASELINE — nothing armed. MUST be green, and its assertion count is what every other arm's figure is read against.
   (b) THE SPLIT COLLAPSED — `sessionOpGate`'s administrator branch removed, so all sixteen ops answer `SESSION_CANNOT_REACH_UNATTENDED_OP` again, which is the ONE-SENTENCE state `main` was in before D-270 (with a code bolted on). MUST FAIL naming the five ops that moved. This is the arm that proves the suite grades the DISTINCTION and not merely the presence of a code.
   (c) THE SENTENCE IS REPLACED — the catalogue's translation for `SESSION_CANNOT_REACH_UNATTENDED_OP` is edited to a well-formed sentence that says something else. MUST FAIL on the CONTENT assertions, which are graded against literals in this suite rather than read back out of the catalogue. **RE-DECLARED, AND THE FIRST DECLARATION IS KEPT HERE BECAUSE IT COULD NEVER HAVE BEEN HONOURED.** It first read *"the catalogue's translation is edited, the SITE left alone; MUST FAIL, because the grade is an EQUALITY"* — and came back GREEN. The arm was right and the declaration was wrong: this family's sites READ the row at runtime, so there is ONE source and editing it moves both sides of the equality together. Site/catalogue divergence is STRUCTURALLY IMPOSSIBLE here, which is a real property of the design and also the exact "an equality that costs nothing to produce is not evidence" shape. The suite gained content assertions in the same turn so that something real is graded, and this arm now targets those.
   (d) A CODE GOES BACK TO BEING CODELESS — `requiredArgument`'s `reason`/`code` keys dropped, `error` left in place. MUST FAIL on the codeless-residue set, naming `capture`, `pdfstructure` and `monitor`. This is D-270's own defect, re-armed.
   (e) THE OP WALK GOES BLIND — the `OPS` parse in THIS FILE neutered. MUST FAIL on the op-corpus FLOOR, BEFORE any membership claim is made over the empty set, and MUST NOT be able to report "0 codeless refusals" as good news.
   (f) THE ADMIN SESSION IS NOT ONE — the harness's admin arm pointed back at a member session. MUST FAIL on the arm-is-real assertion rather than by silently measuring a split of zero. THIS ARM IS THIS SUITE'S OWN MEASURED MISTAKE: the D-270 measurement harness used a member whose ROLE ROW said administrator, measured a split of ZERO twice, and would have decided the interface question on a corpus that structurally could not contain the answer.
   (g) OVER-STRICTNESS, and it is the arm this file exists to survive: a REAL site (`tokenClassGate`) rewritten to spell its code in `code` with NO `reason` at all, the row IMPORTED rather than hand-copied, and an extra key the grader has never seen. It MUST PASS. **THIS ARM CAME BACK RED ON ITS FIRST RUN AND THE GRADER MOVED, NOT THE ARM:** the first spelling demanded BOTH `reason` and `code`, which is a field-name requirement DEC-49 does not make and which `refusal-wire.test.mjs`'s own over-strictness arm ships against deliberately. A grader that reports correct work as a violation teaches the next author to route around it.
   RUN 2026-08-09 IN WORKTREE agent-aafee89563a3f2d42, THREE TIMES, figures as the driver PRINTED them, and TWO of the three departures found THIS ITEM'S OWN INSTRUMENT wrong rather than its subject.
   FIRST RUN: five of seven as declared — a GREEN 33/0, b RED 26/7, d RED 28/5, e RED 2/1, f RED 31/2; **(c) GREEN 33/0 against a declared RED** (a divergence that could not exist, because the sites read the catalogue at runtime — see arm (c)) **and (g) RED 32/1 against a declared GREEN** (the grader demanded a field name DEC-49 does not require). Corrected: arm (c) re-declared onto CONTENT assertions that were added to the suite because of it, and arm (g)'s grader widened to read the code from either field.
   SECOND RUN: six of seven — **(c) GREEN 34/0 AGAIN, and the arm still had not armed.** The patch replaced only the FIRST line of a five-line `+` concatenation, so the words the content assertions grade were on the lines it left behind: it matched exactly once, wrote, and could not have been honoured. *An arm that did not arm is a finding.*
   THIRD RUN, after the patch was widened to the whole concatenation: **ALL SEVEN AS DECLARED — a GREEN 34/0 · b RED 27/7 · c RED 32/2 · d RED 29/5 · e RED 2/1 · f RED 32/2 · g GREEN 34/0**, every armed file byte-identical to its per-arm pristine-of-record by sha256 AND by `cmp`, each above a guarded byte floor.
   FOURTH RUN against the FINAL suite (35 assertions, after the C-number pin landed) — RE-RUN rather than adjusted on paper, because a figure carried forward across an edit is a figure nobody measured: **ALL SEVEN AS DECLARED — a GREEN 35/0 · b RED 28/7 · c RED 33/2 · d RED 30/5 · e RED 3/1 · f RED 33/2 · g GREEN 35/0**, and the driver's closing `git status` over the three armed files came back clean.
 * =========================================================================
 * d270-reach.test.mjs — D-270. **THE THREE CONTROL-PLANE GATES, AND THE
 * DISTINCTION THEY NOW DRAW.**
 *
 * WHAT WAS WRONG. D-262 drove the wire and found six ops answering a caller
 * with NO REFUSAL CODE AT ALL — one layer further out than REC-64/REC-79's
 * census of codes with no translation. A refusal with no code cannot be
 * translated, cannot be pinned, and cannot be told apart by a caller from any
 * other refusal that op might make. D-262 deliberately left it, because giving
 * the session gate a code is a DEC-37/DEC-52 interface decision.
 *
 * **THE DECISION, TAKEN ON A MEASUREMENT.** This suite is also the instrument
 * that took it. Driving every op in the OPS table under an ordinary MEMBER
 * session and under an ADMIN session:
 *
 *   - **11 ops** refuse BOTH. No signed-in person of any role reaches them —
 *     the UNATTENDED PATH, DEC-37's `DAEMON_TOKEN` class, *"the class is the
 *     PATH, not the verb"*.
 *   - **5 ops** refuse a MEMBER session and are PERFORMED for an ADMIN session.
 *     **For those five the plane's one sentence — "this operation requires a
 *     machine credential, not a signed-in session" — is FALSE.** A signed-in
 *     session reaches them; this one's role does not.
 *
 * One codeless sentence was answering two conditions and was true of one. That
 * is the same defect `export` already had its own code for
 * (`ROOT_OF_TRUST_REQUIRED`, whose site comment calls the generic message *"true
 * and misleading"*) — fixed there for one op while five siblings kept the wrong
 * sentence, because nothing could see it.
 *
 * WHAT THIS SUITE GRADES THAT NOTHING ELSE DOES. `refusal-wire.test.mjs` grades
 * the ENVELOPE (does a received code carry its row). The DEC-49 guard grades the
 * SITE against the CATALOGUE. Neither grades **which of two refusals a caller
 * got**, and that is the whole of D-270's interface half: a code that does not
 * distinguish is a code that has not translated anything. So every assertion
 * below is over a SET OF OPS BY NAME and over the refusal's OWN SENTENCE, never
 * over a count and never over "a refusal occurred".
 *
 * WHAT IT CAN AND CANNOT SEE, and the sentence is load-bearing:
 *   - IT CAN SEE every refusal an EMPTY payload provokes from an op in the OPS
 *     table, under a member session, an admin session, and a machine credential.
 *   - IT CANNOT SEE a refusal only a richer payload provokes; a refusal returned
 *     as raw bytes/HTML rather than through `json()`; or the PRE-AUTHENTICATION
 *     surfaces (`verify`, `publishedbytes`, `publishedcase`, `knock`,
 *     `bootstrap`), which no credential reaches and which are D-278's subject.
 *     Those are NAMED here rather than assumed absent.
 *   - IT IS NOT A LIVE PROBE. A green harness is not a serving build (D-108).
 * ========================================================================= */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CONTROL_PLANE_REFUSAL_CHECKS } from "../checks/bio-checks.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const INDEX_SRC = readFileSync(SRC("index.mjs"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

console.log("\n=== D-270 · the three control-plane gates, and the distinction they draw ===");

/* ====================================================================== 1
 * THE CATALOGUE FAMILY — READ, NOT HAND-COPIED, AND FLOORED.
 * An equality that costs nothing to produce is not evidence, so every sentence
 * asserted below is compared against the IMPORTED row rather than against a
 * copy of it typed here.
 * ==================================================================== */
const ROWS = CONTROL_PLANE_REFUSAL_CHECKS;
const CODES = Object.keys(ROWS).sort();
console.log(`\n--- 1. the catalogue family, imported ---`);
console.log(`    CORPUS: ${CODES.length} row(s): ${CODES.join(", ")}`);
t("the family this item minted is REAL and carries every code the gates use — floored before any "
+ "claim is made over it, because a gate compared against an empty catalogue passes over anything",
  CODES, ["REQUIRED_ARGUMENT_MISSING", "SESSION_CANNOT_REACH_UNATTENDED_OP",
          "SESSION_ROLE_CANNOT_REACH_OP", "TOKEN_CLASS_CANNOT_REACH_OP"]);
t("every row carries a C-number and a canned translation long enough to be a sentence",
  CODES.filter((c) => !/^C-\d+\.\d+$/.test(String(ROWS[c].check || ""))
                   || typeof ROWS[c].translation !== "string" || ROWS[c].translation.length < 40), []);
/* WHICH C-NUMBER SITS UNDER WHICH CODE, PINNED AS LITERALS. The four are written
   out here rather than read back, and that is not the hand-copy shape: arm A of
   the DEC-49 guard refuses a C-number claimed by TWO families, and nothing
   refuses a SWAP WITHIN one — C-39.1 and C-39.2 exchanged between the two
   session codes would leave every guard green while `op=audit` attributed each
   refusal to the other one's check. It is also what makes these four numbers
   NAMED to `scripts/coverage.mjs`, whose CHECKS arm reported C-39.2 and C-39.3
   as *"never named by an assertion"* until this line existed — exercised only in
   the direction that passes, which is the C-20.1 defect class exactly. */
t("each C-number sits under the code it was minted for — a swap inside one family is invisible to "
+ "every other guard and would misattribute the check op=audit reports",
  CODES.map((c) => `${c}=${ROWS[c].check}`),
  ["REQUIRED_ARGUMENT_MISSING=C-39.4",
   "SESSION_CANNOT_REACH_UNATTENDED_OP=C-39.1",
   "SESSION_ROLE_CANNOT_REACH_OP=C-39.2",
   "TOKEN_CLASS_CANNOT_REACH_OP=C-39.3"]);

/* ====================================================================== 2
 * THE OPS — PARSED OUT OF THE PLANE'S OWN TABLE, FLOORED, PRINTED.
 * A hand list would go stale the day a new op lands, which is the staleness
 * that produced D-270 in the first place.
 * ==================================================================== */
const OPS_BLOCK = INDEX_SRC.slice(INDEX_SRC.indexOf("const OPS = {"),
                                  INDEX_SRC.indexOf("\n};", INDEX_SRC.indexOf("const OPS = {")));
const OP_ROWS = [...OPS_BLOCK.matchAll(/^ {2}([a-z0-9]+):\s*\{\s*classes:\s*(null|\[([^\]]*)\]),\s*mutating:\s*(true|false)/gm)]
  .map((m) => ({ op: m[1],
                 classes: m[2] === "null" ? null : m[3].split(",").map((s) => s.trim().replace(/"/g, "")).filter(Boolean),
                 mutating: m[4] === "true" }));
const DRIVEN_OPS = OP_ROWS.filter((r) => r.classes);
console.log(`\n--- 2. the op surface, parsed out of index.mjs's OPS table (never typed here) ---`);
console.log(`    CORPUS: ${OP_ROWS.length} op row(s) parsed · ${DRIVEN_OPS.length} carry a class list and are driven`);
/* THE FLOOR COMES BEFORE EVERY CLAIM MADE OVER THE SET. A totality assertion
   that passed over an empty corpus is a thing this project has measured three
   times, and "0 codeless refusals" over 0 ops is the shape it would take here. */
t("the OPS table was actually READ — a silent parse failure would make every drive below vacuous "
+ "and would report ZERO CODELESS REFUSALS as good news", OP_ROWS.length >= 120, true);
if (OP_ROWS.length < 120) {
  console.log("\n  HALTED: the op corpus is below its floor. Nothing below can mean anything over a "
            + "corpus this walk cannot see, so nothing below is claimed.");
  console.log(`\nFAILED  ${pass} pass, ${fail} fail`);
  process.exit(1);
}

/* NOT DRIVEN, AND NAMED RATHER THAN OMITTED. These surfaces are reached with no
   credential at all, so no session/class gate applies and this suite's drive
   cannot provoke them. They are still codeless and they are D-278's subject. */
const PRE_AUTH_SURFACES = ["bootstrap", "knock", "publishedbytes", "publishedcase", "verify"];
console.log(`    NOT DRIVEN (pre-authentication, no credential reaches them — D-278): ${PRE_AUTH_SURFACES.join(", ")}`);

/* ====================================================================== 3
 * THE DRIVE.
 * ==================================================================== */
let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: INDEX_SRC,
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d270", MEMBER_TOKEN: "mem-d270", PROBE_TOKEN: "prb-d270",
              DAEMON_TOKEN: "dmn-d270", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-d270",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              /* the DO's own drain alarm would race the sweep and change what an
                 op answers mid-walk — task-fence.test.mjs pins it for the same
                 reason. */
              TASK_DRAIN_DELAY_MS: "600000",
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService() { return new Response(new Uint8Array(2048), { headers: { "content-type": "application/pdf" } }); },
});
MF = mf;
const RAW = async (q, body) => {
  const res = body === undefined
    ? await mf.dispatchFetch(`http://x/api/?${q}`)
    : await mf.dispatchFetch(`http://x/api/?${q}`, { method: "POST", body: JSON.stringify(body) });
  let parsed = null;
  try { parsed = await res.json(); } catch { parsed = null; }
  return { status: res.status, body: parsed };
};
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP((await RAW(q, body ?? {})).body);

try {

const enrol = async (memberId, role, capabilities) => {
  const add = await POST(`op=memberadd&token=adm-d270`, { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll", { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* 4.2/4.3: the second member of a group must be an administrator, and there are
   no ordinary members until TWO exist. */
await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
await enrol("gus", "admin", ["contribute", "publish"]);
const MEMBER = await enrol("nell", "member", ["contribute", "publish"]);

/* THE ADMIN SESSION IS `role: "admin"` — the steward's, claimed from the
   bootstrap credential. NOT a member whose ROLE ROW says administrator: the gate
   reads `sess.role === "admin" ? "admin" : "member"`, so Ruth still holds
   `member:ruth` and is gated as a MEMBER. **This suite's own measurement harness
   used Ruth as the admin arm and measured a split of ZERO, twice**, and the zero
   had nothing to do with the plane. Arm (f) of the control re-arms exactly that
   mistake so a future edit cannot make it silently. */
await POST("op=claim", { bootstrapToken: "adm-d270", password: "steward-passphrase-1" });
const alg = await POST("op=login", { role: "admin", password: "steward-passphrase-1" });
if (!alg?.token) throw new Error(`admin login: ${JSON.stringify(alg)}`);
const ADMIN = alg.token;

/* THE ARM-IS-REAL ASSERTION, and it is the reason arm (f) exists. A member
   session and an admin session that are the same thing measure a split of zero
   and report it as a finding. Driven rather than inferred: `op=memberadd` is
   the sharpest available discriminator — a member session may not, an admin
   session may. */
{
  const asAdmin = (await RAW(`op=memberadd&token=${ADMIN}`, { memberId: "arm-is-real", cover: "arm" })).body;
  const asMember = (await RAW(`op=memberadd&token=${MEMBER}`, { memberId: "arm-is-real-2", cover: "arm" })).body;
  t("the two session arms are ACTUALLY DIFFERENT — the admin arm PERFORMS an act the member arm is "
  + "refused, so a split measured below is a property of the plane and not of this harness",
    [rP(asAdmin)?.ok === true, asMember?.ok === false], [true, true]);
}

console.log("\n--- 3. the drive: every classed op, empty payload, as a MEMBER and as an ADMIN ---");
const GOT = { member: new Map(), admin: new Map() };   /* op -> refusal envelope */
const CODELESS = [];                                   /* ok:false with no code of any kind */
let calls = 0, refusals = 0;
for (const [who, tok] of [["admin", ADMIN], ["member", MEMBER]]) {
  for (const row of DRIVEN_OPS) {
    const wire = row.mutating ? (await RAW(`op=${row.op}&token=${tok}`, {})).body
                              : (await RAW(`op=${row.op}&token=${tok}`)).body;
    calls++;
    const cands = [];
    if (wire && wire.ok === false) cands.push(wire);
    if (wire && wire.result && typeof wire.result === "object" && !Array.isArray(wire.result)
        && wire.result.ok === false) cands.push(wire.result);
    for (const r of cands) {
      refusals++;
      const code = typeof r.reason === "string" ? r.reason : typeof r.code === "string" ? r.code : null;
      if (!code) {
        CODELESS.push({ who, op: row.op,
                        said: typeof r.error === "string" ? r.error.slice(0, 90) : `<${typeof r.error}>` });
        continue;
      }
      if (!GOT[who].has(row.op)) GOT[who].set(row.op, { ...r, code });
    }
  }
}
console.log(`    DRIVEN: ${calls} call(s) over ${DRIVEN_OPS.length} op(s) × 2 sessions · ${refusals} refusal envelope(s)`);
t("the drive actually reached the plane and refusals actually came back — floored before any claim "
+ "is made over what came back", [calls >= 240, refusals >= 100], [true, true]);

/* ====================================================================== 4
 * D-270's RESIDUE, CLOSED — AND STILL PINNED AS A SET.
 * ==================================================================== */
console.log("\n--- 4. the codeless residue D-270 named ---");
console.log(`    REFUSALS CARRYING NO CODE AT ALL: ${CODELESS.length}`);
for (const c of CODELESS) console.log(`      no-code  op=${c.op} (${c.who})  said: "${c.said}"`);
/* A SET AND NOT A COUNT, in BOTH directions exactly as D-262 pinned it: a NEW
   codeless refusal fails this line and must be looked at. What changed is the
   expected value — it was six ops, it is now none — and the six were struck WITH
   their reason rather than exempted (D-270's row carries it). */
t("NO op answers a signed-in caller with a refusal carrying no code at all — this is D-270's residue "
+ "closed, pinned as a SET so a seventh arrival fails here rather than accumulating",
  [...new Set(CODELESS.map((c) => c.op))].sort(), []);

/* ====================================================================== 5
 * THE SPLIT, BY NAME. THE ASSERTION THIS ITEM EXISTS FOR.
 * ==================================================================== */
console.log("\n--- 5. the session gate answers TWO conditions, and which one is graded BY OP NAME ---");
const withCode = (who, code) => [...GOT[who].entries()].filter(([, r]) => r.code === code).map(([op]) => op).sort();
const unattendedM = withCode("member", "SESSION_CANNOT_REACH_UNATTENDED_OP");
const unattendedA = withCode("admin", "SESSION_CANNOT_REACH_UNATTENDED_OP");
const roleM = withCode("member", "SESSION_ROLE_CANNOT_REACH_OP");
const roleA = withCode("admin", "SESSION_ROLE_CANNOT_REACH_OP");
console.log(`    member session · unattended-path refusal (${unattendedM.length}): ${unattendedM.join(" ")}`);
console.log(`    admin  session · unattended-path refusal (${unattendedA.length}): ${unattendedA.join(" ")}`);
console.log(`    member session · role refusal          (${roleM.length}): ${roleM.join(" ")}`);
console.log(`    admin  session · role refusal          (${roleA.length}): ${roleA.join(" ")}`);

t("THE ELEVEN — no signed-in session of ANY role reaches these, so they carry the UNATTENDED-PATH "
+ "code. Pinned by NAME: an op leaving or joining this set is a change to who can drive this "
+ "instance and must be read, not counted",
  unattendedM,
  ["adminendorse", "adminremove", "capturerequestdrain", "cpuprobe", "livefire", "membercaps",
   "provenancechain", "provenanceroute", "purge", "reproject", "taskdrain"]);
t("...and an ADMINISTRATOR's session is refused the SAME eleven with the SAME code — which is what "
+ "makes 'unattended' a true word here rather than a nicer way of saying 'not you'",
  unattendedA, unattendedM);
t("THE FIVE — a signed-in session DOES reach these; a member's does not. Before D-270 all sixteen "
+ "got one sentence, and for these five that sentence was FALSE",
  roleM, ["governorconfig", "memberadd", "memberset", "signeradd", "signerset"]);
t("...and an administrator's session is refused NONE of them, which is the measurement the whole "
+ "split rests on: if this were non-empty the two codes would be one condition wearing two names",
  roleA, []);

/* ====================================================================== 6
 * THE SENTENCES. NOT "A REFUSAL OCCURRED" — THE WORDS A CALLER RECEIVED.
 * ==================================================================== */
console.log("\n--- 6. the sentences a caller actually receives ---");
/* THE CODE IS READ FROM EITHER `reason` OR `code`, and that is CONTROL ARM (g)'s
   correction rather than a preference. The first spelling of this grader
   demanded BOTH fields, and arm (g) — a real site rewritten to carry the code in
   `code` alone — came back RED against a declared GREEN. DEC-49 requires a CODE,
   not a field name, and `refusal-wire.test.mjs`'s own over-strictness arm ships
   exactly that shape and demands it be graded clean. A grader that reports
   correct work as a violation teaches the next author to route around it, so the
   grader moved and the arm stood. */
const codeOf = (r) => typeof r.reason === "string" ? r.reason
                    : typeof r.code === "string" ? r.code : null;
const graded = (r, code) => [
  r.ok, codeOf(r), r.check, r.translation === ROWS[code].translation,
  typeof r.detail === "string" && r.detail.length > 40,
];
const want = (code) => [false, code, ROWS[code].check, true, true];

/* THE EQUALITY ABOVE COSTS NOTHING ON ITS OWN AND IS NOT LEFT TO CARRY THE
   SENTENCE — CONTROL ARM (c)'s finding, recorded rather than smoothed.
   Arm (c) planted a divergent translation in the CATALOGUE and left the SITE
   alone, declared RED, and came back GREEN. **The arm was right and the
   declaration was wrong: this family's sites READ the row at runtime, so a
   site/catalogue divergence is structurally impossible here** — there is one
   source and editing it moves both sides of the comparison together. That is a
   real property of the design (it is why D-262's DIVERGENT check has nothing to
   catch in this family) and it is also exactly the "an equality that costs
   nothing to produce is not evidence" shape.
   So the sentences are ALSO graded on their CONTENT, against literals written
   here and not read from the catalogue. Arm (c) was re-declared to target those,
   and it goes RED. */
const SENTENCE_CONTENT = [
  ["SESSION_CANNOT_REACH_UNATTENDED_OP", /containment/i, /credential/i],
  ["SESSION_ROLE_CANNOT_REACH_OP", /administrator/i, /signed-in session/i],
  ["TOKEN_CLASS_CANNOT_REACH_OP", /credential/i, /kind/i],
  ["REQUIRED_ARGUMENT_MISSING", /left out|missing/i, /nothing was written/i],
];
t("each canned translation SAYS the thing its code is for, graded against literals written in this "
+ "suite rather than read back out of the catalogue — the equality above agrees with itself for "
+ "free, and this is the half that cannot",
  SENTENCE_CONTENT.filter(([c, a, b]) => !(a.test(ROWS[c].translation) && b.test(ROWS[c].translation)))
                  .map(([c]) => c), []);

{
  const purge = GOT.member.get("purge");
  t("op=purge, member session: the envelope carries the code, its C-number, and the catalogue's OWN "
  + "translation — compared against the imported row, because a hand copy agrees for free",
    graded(purge, "SESSION_CANNOT_REACH_UNATTENDED_OP"), want("SESSION_CANNOT_REACH_UNATTENDED_OP"));
  t("...and the LEGACY SENTENCE is byte-identical, which is what makes this code purely additive "
  + "for the thirty `reason || error` reads measured in civicos-ui/app.html",
    purge.error, "this operation requires a machine credential, not a signed-in session");
  t("...and its detail names DEC-37's daemon class as the reason rather than restating the code",
    /DAEMON_TOKEN/.test(purge.detail) && /unattended/i.test(purge.detail), true);
  /* DEC-52 IS A CONSTRAINT ON THE WORDING, not background. Bob ruled 2026-08-07
     that the machine may rule, so a refusal implying a person is trusted LESS
     than a machine would contradict a standing decision in member-facing words.
     What is graded is the MEMBER-FACING SENTENCE — the canned translation — and
     not `detail`, which is developer-facing prose and cites the ruling by name.

     **THIS ARM CAUGHT ITS OWN CORRECTION ON ITS FIRST RUN AND IT IS RECORDED
     RATHER THAN SMOOTHED.** The first spelling scanned translation AND detail
     for `/trusted more|less trusted/`, and went RED — because `detail` says, in
     as many words, *"Nothing here says a machine is trusted more than a person
     (DEC-52 rules the opposite)"*. The check matched the token it was
     correcting: WORKER.md names exactly this receipt, and it arrived inside the
     item that quotes it. Narrowed to the sentence a member actually reads, with
     the positive half asserted separately below so the narrowing does not just
     buy a green. */
  t("...and the MEMBER-FACING SENTENCE makes no claim that a machine is trusted more than a person — "
  + "DEC-52 ruled the opposite, and this is what keeps the wording inside the ruling",
    /trusted more|less trusted|machines only|not trusted/i
      .test(ROWS.SESSION_CANNOT_REACH_UNATTENDED_OP.translation), false);
  t("...and it says WHY positively rather than only avoiding the wrong words — a containment choice "
  + "about which credential the verb is addressed to, which is DEC-37's argument and not a judgement "
  + "about the caller",
    [/containment/i.test(ROWS.SESSION_CANNOT_REACH_UNATTENDED_OP.translation),
     /credential/i.test(ROWS.SESSION_CANNOT_REACH_UNATTENDED_OP.translation),
     /DEC-52/.test(purge.detail)], [true, true, true]);
}
{
  const ma = GOT.member.get("memberadd");
  t("op=memberadd, member session: the ROLE code, its C-number and the catalogue's translation",
    graded(ma, "SESSION_ROLE_CANNOT_REACH_OP"), want("SESSION_ROLE_CANNOT_REACH_OP"));
  t("...and the SENTENCE IS THE CORRECTED ONE. This is the breaking half of IC-55 and it is asserted "
  + "as words: a consumer switching on the old string here was switching on a false statement",
    ma.error, "this operation is reserved to an administrator of this group");
  t("...and the old, false sentence is GONE from this refusal entirely — asserted rather than "
  + "assumed, because leaving it beside the new one is how two wordings for one condition begin",
    JSON.stringify(ma).includes("requires a machine credential"), false);
  t("...and the detail says who CAN do it, which is the half a refusal owes a member who is stuck",
    /administrator/i.test(ma.detail), true);
}
{
  /* THE CLASS GATE. `registeraudit` is a READ, so the session gate (mutating
     ops only) never sees it and the class ACL is what answers — measured
     member-facing, and NOT one of the six D-270's row named. */
  const ra = GOT.member.get("registeraudit");
  t("op=registeraudit, member session: the CLASS code — a third distinct answer, and one the six "
  + "ops in D-270's row did not include because that sweep drove only member-class ops",
    graded(ra, "TOKEN_CLASS_CANNOT_REACH_OP"), want("TOKEN_CLASS_CANNOT_REACH_OP"));
  t("...and its legacy sentence is byte-identical too", ra.error, "forbidden for token class");
  t("...and the detail NAMES the classes the op does admit, so the answer is checkable rather than "
  + "an assertion about the caller", /admits/.test(ra.detail) && ra.cls === "member", true);
}

/* ------------------------------------------------- the argument complaints */
console.log("\n--- 7. the three argument refusals: ONE code, told apart by `detail` ---");
const ARG = [
  ["capture", `op=capture&token=${MEMBER}&sha256=nope`, "sha256", "capture requires sha256=<64 lowercase hex>"],
  ["pdfstructure", `op=pdfstructure&token=${MEMBER}&sha256=nope`, "sha256", "pdfstructure requires sha256=<64 lowercase hex>"],
  ["monitor", `op=monitor&token=${MEMBER}`, "bundleId", "monitor needs a bundleId"],
];
const argSeen = [];
for (const [op, q, argument, legacy] of ARG) {
  const r = (await RAW(q, op === "monitor" ? {} : undefined)).body;
  argSeen.push({ op, argument: r?.argument, detail: r?.detail });
  t(`op=${op}: the argument code, its C-number and the catalogue's translation`,
    graded(r, "REQUIRED_ARGUMENT_MISSING"), want("REQUIRED_ARGUMENT_MISSING"));
  t(`op=${op}: its LEGACY SENTENCE is byte-identical — three sites kept their own words and gained `
  + `one code between them`, r.error, legacy);
  t(`op=${op}: and \`argument\` NAMES which one is missing, which is what lets one code serve three `
  + `producers — AI_BEYOND_TASK_SCOPE's precedent, pinned the same way`, r.argument, argument);
}
/* THE PRECEDENT'S OTHER HALF: one code is only honest if the producers stay
   distinguishable. If `detail` ever collapsed too, the answer would name a
   condition without naming its cause. */
t("the three producers of the ONE argument code remain DISTINGUISHABLE by `detail` — a shared code "
+ "whose producers read identically is a code that has stopped answering the question",
  new Set(argSeen.map((a) => a.detail)).size, 3);

/* ====================================================================== 8
 * THE OVER-STRICTNESS ARM, BUILT IN. Correct work in a spelling this file did
 * not anticipate must be graded CLEAN.
 * ==================================================================== */
console.log("\n--- 8. over-strictness: correct work in an unanticipated spelling must NOT be flagged ---");
{
  /* Five things this suite's grader was not written around, at once: the code
     spelled in `code` with NO `reason` at all; the row IMPORTED rather than
     hand-copied; a `detail` worded unlike anything in this repository; extra
     keys the grader has never seen; and NO `error` key, since `error` is a
     legacy courtesy and not a DEC-49 requirement. It must read as CODED. */
  const row = ROWS.TOKEN_CLASS_CANNOT_REACH_OP;
  const exotic = { ok: false, code: "TOKEN_CLASS_CANNOT_REACH_OP", check: row.check,
                   translation: row.translation, detail: "Nope — wrong sort of key for this door, sorry.",
                   weight: "refuse", sigil: 7 };
  t("a refusal spelled in `code` rather than `reason`, carrying the row itself, worded unlike "
  + "anything here, with keys this grader has never seen and NO `error` at all, is graded as CODED "
  + "and correctly translated — a grader that reported correct work as a violation would teach the "
  + "next author to route around it",
    [codeOf(exotic) === "TOKEN_CLASS_CANNOT_REACH_OP",
     exotic.translation === ROWS[codeOf(exotic)].translation,
     exotic.check === ROWS[codeOf(exotic)].check,
     CODELESS.length],
    [true, true, true, 0]);
}

console.log(`\n${fail === 0 ? "OK" : "FAILED"}  ${pass} pass, ${fail} fail`);
} finally {
  await mf.dispose();
}
process.exit(fail === 0 ? 0 : 1);
