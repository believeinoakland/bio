/* NEGATIVE CONTROL (M0-18, run 2026-08-09, worktree agent-a62aec7acd493144e): the
   provenance floor added to this file is armed by `test/provenance-floor.control.mjs`
   — COMMITTED, so it re-runs in one step. 58 of 58 checks as declared over eight arms,
   each armed ALONE with every other defence held open, every restore verified by sha256
   AND by a full byte comparison against a UNIQUELY-NAMED per-arm pristine copy with the
   byte count printed and floored. ARM 2a/2b is armed ON THIS FILE and is the decisive pair: with a phantom in
   src/, a floor at the contaminated count FAILS here and PASSES in the pre-M0-18 spelling.
   TWO ARMS CAME BACK WRONG FIRST AND BOTH FOUND DEFECTS IN THE HARNESS RATHER THAN IN
   THE SUBJECT — the harness pinned the very refusal codes its arm was about to test, and
   spelled an `op=` token that op-claims then read as a real claim. Recorded at their
   sites in the control, not smoothed. */
/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/identity-claims.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3, PL-4, PL-11, REC-73 precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad; every restore is verified BY sha256 AND BY `cmp` against a pristine per-arm copy named uniquely for its arm.
   AND THE FIRST THING THIS DECLARATION OWES IS THE REASON THE ORDINARY ARM IS WORTHLESS HERE: **REC-65's DIFF IS COMMENTS. A behavioural arm cannot fail no matter what this item writes** — delete every corrected sentence and all 124 suites stay green, which is exactly the property that let six false comments stand for months. So the arms below break the CLAIM ITSELF and the INSTRUMENT that reads it, and only arm (5) touches behaviour at all.
   ALL FIVE ARMS RUN 2026-08-08 IN WORKTREE agent-a8c89d200faa387fe, EACH ALONE with the others held open, BASELINE 31/0 RE-MEASURED BEFORE AND AFTER EVERY ARM, every restore verified by sha256 AND by `cmp` against a per-arm pristine copy. FOUR behaved as declared; ONE did not, and it is reported rather than smoothed. Figures below are MEASURED, not predicted.
   (1) PLANT A FENCE THAT DOES NOT EXIST -> restore the pre-DEC-52 condition at ONE stamp site: drop its `IDENTITY-CLAIM:` marker line, leaving "a member's constitutive statement" standing over three ops nothing refuses -> **31/0 becomes 28 pass, 3 FAIL**, naming the FILE and the FIELD (`declaredBy@src/index.mjs` reported DEFECT), and the RULED set loses a member. Restored, 31/0.
   (2) THE INVERSE — A LYING MARKER MUST NOT BUY SILENCE -> keep `IDENTITY-CLAIM: RULED DEC-52` and delete the naming half (`class:<cls>`) from the whole block, which is the doctrine the ruling depends on -> **28 pass, 3 FAIL**, the site falling to DEFECT rather than to a softer verdict. Restored, 31/0. **THE ARM'S OWN FIRST DRAFT WAS THE FINDING:** it removed ONE `class:<cls>` while the block carried another two paragraphs up, so the edit "applied" and would have reported a meaningless pass. An arm whose anchor is too narrow is the same defect as a matcher whose corpus is too narrow, and it was caught only by running it.
   (3) NEUTER THE SWEEP -> make the stamp-site matcher match nothing -> **21 pass, 10 FAIL**, caught by the CORPUS FLOOR with the corpus size PRINTED: `corpus: 0 identity STAMP SITES`. Never reported as a clean estate. Restored, 31/0.
   (4) OVER-STRICTNESS, IN A SPELLING THIS ITEM DID NOT ANTICIPATE -> a comment legitimately describing an ENFORCED constraint must NOT be flagged: `op=taskforward`/`op=taskresolve`'s block says its verbs are "MEMBER actions performed by a PERSON" — a member-actor claim in wording nothing here was written for, carrying NO marker — and it must read TRUE off the store's own fence alone. MUST-NOT-FAIL, and it did not: block (f) stayed GREEN under arms 1, 2 and 5, so the accusing and forgiving directions are independent.
   (5) POLARITY, AND IT IS THE ONE BEHAVIOURAL ARM -> strip the machine principal: the FW-6 stamp writes `""` instead of `class:<cls>`. THE ACT IS PERMITTED; THE ANONYMITY IS NOT — a relation declared by nobody is what DEC-55 det 4 / D-199.4 refuses. **25 pass, 6 FAIL.** **AND THE DECLARATION WAS WRONG, WHICH IS WHY IT IS WRITTEN OUT HERE:** it predicted block 2 would fail and block 1 would be UNMOVED. Block 1 moved too — removing the stamp removes the SITE from the sweep's corpus, so the RULED set lost a member and (c) failed beside block 2's four. The instrument was stricter than its author predicted; a surprising result is a finding about the arm even when the surprise is in the safe direction.
   POLARITY CHECKED THROUGHOUT: every RULED site asserts the act SUCCEEDS and the row NAMES the machine; every ENFORCED-ELSEWHERE site asserts a SPECIFIC code; the OPEN set is compared as a SET so it fails when a site is ADDED and when one is quietly RESOLVED; the corpus is floored before any membership claim is made over it.
 * =========================================================================
 * REC-65 / DEC-52 — THE SIX FIELDS' COMMENTS WERE THE WRONG HALF, AND THIS
 * SUITE IS WHAT HOLDS THE CORRECTION.
 *
 * Bob ruled 2026-08-07: *"allowing the machine to rule doesn't go against
 * doctrine. So it can rule."* A machine credential MAY declare a relation,
 * resolve a reference and thread a progression, directly into the record.
 * REC-46 had measured the opposite claim sitting in six comments — each field
 * described as "a member's constitutive statement" while NOTHING enforced it —
 * and the ruling closes that gap from the other side: the COMMENTS are corrected
 * to match the CODE, and no fence is added to make the old prose true.
 *
 * WHY A COMMENT WAS WORTH A SUITE. A comment describing a constraint that does
 * not exist is a FENCE THAT READS AS PRESENT TO EVERY SUBSEQUENT AUTHOR. This
 * project met that class four times in two days — D-229 (eleven fences that did
 * not fire), REC-73 (ten of twelve acts through under complete payloads), D-228
 * (a documented branch that cannot be reached), IC-33 (a fence tighter than its
 * rule). A false comment is its cheapest form and the easiest to leave.
 *
 * WHAT IS ASSERTED, in three blocks:
 *   1. THE SWEEP, over the real sources. Every place `index.mjs` stamps a
 *      machine identity into an identity field is paired with the CLAIM its own
 *      comment makes and with whether the plane ENFORCES it. Zero unexplained
 *      defects; the RULED, ENFORCED-ELSEWHERE and OPEN sets pinned exactly.
 *   2. THE RECORD NAMES THE MACHINE. The ruled acts are DRIVEN under a machine
 *      credential and must succeed with the principal on the row — and driven a
 *      second time by a signed-in member with the SAME payload, which is what
 *      makes the payload measurably complete rather than merely accepted
 *      (REC-73's technique, and the reason a refusal can be attributed).
 *   3. REACH. The corpus is printed and floored, because a headline assertion
 *      passing over an empty corpus is this session's most-repeated instrument
 *      defect.
 *
 * WHAT THIS SUITE DELIBERATELY DOES NOT DO: add a fence, weaken REC-46's
 * predicate, or extend DEC-52 by analogy to the two acts it does not cover.
 * Those two are reported OPEN and routed, which is a worker's job; ruling on
 * them is not.
 * ========================================================================= */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { sweep, wideClaims } from "../scripts/identity-claims.mjs";
/* M0-18 — ONE mechanism, imported. The reason this suite needed it is at the
   wide-ledger walk in block 3. */
import { readGitProvenance, repoPath, reportProvenance } from "../scripts/provenance.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", f);
const REPO = join(DIR, "..", "..");                  // bio-plane/test -> repo root

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
/* NULL-TOLERANT (PL-1's discipline, PL-11's measured cost): an arm that throws on a
   field of undefined takes every arm behind it with it and reports one defect as none. */
const val = (o, k) => (o && typeof o === "object" && k in o) ? o[k] : null;

const INDEX_SRC = readFileSync(SRC("src/index.mjs"), "utf8");
const STORE_SRC = readFileSync(SRC("src/store.mjs"), "utf8");

let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("src/index.mjs"), script: INDEX_SRC,
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec65", MEMBER_TOKEN: "mem-rec65", PROBE_TOKEN: "prb-rec65",
              VERSION: "test", INSTANCE_NAME: "biosmoke-rec65" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

/* =====================================================================
   BLOCK 1 — THE SWEEP: which comments claim a constraint on WHO may write,
   and which of those the code actually enforces.
   ===================================================================== */
console.log("\n--- 1. the sweep: the corpus, printed before anything is claimed over it ---");
const S = sweep(INDEX_SRC, STORE_SRC);
const sites = S.sites;
const fencedCount = [...S.enforcement.values()].filter((v) => v.fenced).length;
console.log(`  corpus: ${sites.length} identity STAMP SITES in src/index.mjs · `
  + `${S.enforcement.size} ops in store.mjs's dispatch table · ${fencedCount} of them carrying a machine fence · `
  + `${S.opsTable.size} ops in the OPS table`);
for (const s of sites)
  console.log(`    ${String(s.line).padStart(5)}  ${s.field.padEnd(12)} ${s.verdict.padEnd(20)} `
    + `writes=${s.writeOps.length} fenced=${s.enforcedOps.length} undetermined=${s.undeterminedOps.length}`);

/* THE FLOOR FIRST. A matcher narrowed to nothing reports a beautiful zero defects over
   an empty corpus — measured in this project as a headline assertion PASSING over a walk
   that read zero files. Every claim below is made only after the corpus is floored. */
t("(a) the sweep reaches the stamp sites at all — corpus floored, never assumed",
  sites.length >= 18, true);
t("(a) the store's dispatch table is read and non-trivial", S.enforcement.size >= 150, true);
t("(a) machine fences ARE found — a fence detector that finds none would pass everything",
  fencedCount >= 15, true);
t("(a) the OPS table is read, which is what separates a write from a read scope",
  S.opsTable.size >= 150, true);

const nameOf = (s) => `${s.field}@src/index.mjs`;
const setOf = (v) => sites.filter((s) => s.verdict === v).map(nameOf).sort();

/* THE HEADLINE. A member-actor claim over a field the code lets a machine write, with no
   accounting for why, is the defect this item exists to remove. */
t("(b) NO comment claims a member-only constraint the code does not enforce",
  setOf("DEFECT"), []);

/* AND THE SETS, PINNED EXACTLY — not as counts. A count moves for two reasons and says
   which only by accident; a set names the site. Each of these fails when a member is
   ADDED and when one is quietly REMOVED, which is the mechanical expiry M0-12's ledger
   technique exists for. */
t("(c) DEC-52's ruled acts, exactly — the four sites where the machine MAY rule",
  setOf("RULED"),
  ["declaredBy@src/index.mjs", "declaredBy@src/index.mjs", "resolvedBy@src/index.mjs", "threadedBy@src/index.mjs"]);
t("(c) and every RULED site names a DEC and carries the naming half the ruling rests on",
  sites.filter((s) => s.verdict === "RULED").map((s) => [s.markerDec, s.principalNamed]),
  [["DEC-52", true], ["DEC-52", true], ["DEC-52", true], ["DEC-52", true]]);
t("(c) a RULED site must NOT sit over a fenced op — a fence would contradict the ruling",
  sites.filter((s) => s.verdict === "RULED").every((s) => s.enforcedOps.length === 0), true);

t("(d) ENFORCED-ELSEWHERE: the expertise pair, refused but NOT as a machine",
  setOf("ENFORCED-ELSEWHERE"), ["by@src/index.mjs", "memberId@src/index.mjs"]);
t("(d) and each names the code that actually fires, so a code that stops firing fails",
  [...new Set(sites.filter((s) => s.verdict === "ENFORCED-ELSEWHERE").flatMap((s) => s.markerCodes))].sort(),
  ["ADMIN_ONLY", "NO_SUCH_MEMBER"]);

/* THE OPEN LEDGER. Two sites make a member-only claim that nothing enforces AND that
   DEC-52 does not reach. REC-65 neither fenced them nor extended the ruling by analogy —
   both would be a worker deciding doctrine — so they are NAMED here and routed. This
   assertion fails when a third arrives AND when one of these is resolved. */
t("(e) the KNOWN-OPEN set, pinned by name: DEC-52's reasoning raises these and answers neither",
  setOf("OPEN"), ["author@src/index.mjs", "decidedBy@src/index.mjs"]);
t("(e) the open sites are exactly op=provenancechain and op=proposedispose",
  sites.filter((s) => s.verdict === "OPEN").flatMap((s) => s.unfencedOps).filter((o) => o === "provenancechain" || o === "proposedispose").sort(),
  ["proposedispose", "provenancechain"]);

/* THE OVER-STRICTNESS ARM, BUILT IN RATHER THAN BOLTED ON. `op=taskforward` /
   `op=taskresolve` describe their verbs as "MEMBER actions performed by a PERSON" — a
   member-actor claim in a spelling this item was not written for — and they carry NO
   marker. They must read TRUE off the store's own fence and nothing else. A sweep that
   flagged them would be wrong in the accusing direction, which is the harder error to
   notice because it looks like diligence. */
const taskSite = sites.find((s) => s.writeOps.includes("taskforward"));
t("(f) over-strictness: an ENFORCED constraint in an unanticipated spelling is NOT flagged",
  [val(taskSite, "verdict"), val(taskSite, "marker"), val(taskSite, "memberActor")],
  ["CLEAR", null, false]);
t("(f) and the fence it rests on is real: taskforward/taskresolve refuse a machine BY NAME",
  [val(S.enforcement.get("taskforward"), "fenced"), val(S.enforcement.get("taskresolve"), "fenced")],
  [true, true]);
/* `taskdrain` sits in the same set and is deliberately UNFENCED — routing an event into a
   task is the daemon's job. The sweep must show the difference rather than average it. */
t("(f) and `taskdrain`, in the same set, is deliberately unfenced — the sweep shows the split",
  [val(taskSite, "enforcedOps"), val(taskSite, "unfencedOps")], [["taskforward", "taskresolve"], ["taskdrain"]]);

/* =====================================================================
   BLOCK 2 — THE RECORD NAMES THE MACHINE. Driven, not read.
   ===================================================================== */
console.log("\n--- 2. a machine-written constitutive act NAMES its machine principal ---");
const enrol = async (id, role, caps) => {
  const add = await POST("op=memberadd&token=adm-rec65", { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  await POST("op=enroll", { invite: val(add, "invite"), handle: id, password: `${id}-passphrase-1` });
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  return val(lg, "token");
};
/* 4.2/4.3: the second member of a group must be an administrator. */
const RUTH = await enrol("ruth", "admin", ["contribute", "publish", "create_projects"]);
const GUS = await enrol("gus", "admin", ["contribute", "publish"]);

const ENT = (label) => ({ kind: "office", label, aliases: [] });
const REL = (a, b) => ({ fromEntity: a, toEntity: b, relation: "member_of",
  justification: "the auditor sits inside the finance department per the charter",
  citation: "Oakland City Charter s 401" });
const PROG = (key) => ({ progressionKey: key, label: "Procurement", stages: [
  { key: "solicit", label: "Solicitation", cardinality: "1", required: "always" },
  { key: "award", label: "Award", cardinality: "0..1", required: "usually" }] });

/* THE MACHINE ARM. `mem-rec65` is the MEMBER_TOKEN class — a machine credential, not a
   session — so the control plane stamps `class:member` and the store receives it. */
const mEnt = await POST("op=entitycreate&token=mem-rec65", ENT("Office of the City Auditor"));
const mEnt2 = await POST("op=entitycreate&token=mem-rec65", ENT("Budget Office"));
const mAli = await POST("op=entityalias&token=mem-rec65", { entityId: val(mEnt, "entity_id"), alias: "City Auditor" });
const mRel = await POST("op=relationdeclare&token=mem-rec65", REL(val(mEnt, "entity_id"), val(mEnt2, "entity_id")));
const mPro = await POST("op=progressiondefine&token=mem-rec65", PROG("procurement"));

t("(g) DEC-52 enacted: a MACHINE credential declares a relation and it LANDS",
  [val(mEnt, "ok"), val(mAli, "ok"), val(mRel, "ok"), val(mPro, "ok")], [true, true, true, true]);
t("(g) and the RELATION row names the machine principal — never a person's name",
  val(mRel, "declared_by"), "class:member");
t("(g) and the PROGRESSION DEFINITION row names it too",
  val(mPro, "declared_by"), "class:member");
const entRead = await POST("op=entity&token=mem-rec65&id=" + val(mEnt, "entity_id"), {});
t("(g) and the ENTITY row, read back through the plane, names it",
  val(val(entRead, "entity"), "declared_by"), "class:member");

/* VISIBLY MACHINE-ATTRIBUTED (D-82's look-derived rule). A name is not enough: it must
   be DISTINGUISHABLE from a member's, or the two claims collapse into one. `class:` is a
   prefix no member id can carry, and the member arm below is what proves that. */
const sEnt = await POST(`op=entitycreate&token=${RUTH}`, ENT("Department of Transportation"));
const sEnt2 = await POST(`op=entitycreate&token=${RUTH}`, ENT("Capital Programs"));
const sRel = await POST(`op=relationdeclare&token=${RUTH}`, REL(val(sEnt, "entity_id"), val(sEnt2, "entity_id")));
const sPro = await POST(`op=progressiondefine&token=${RUTH}`, PROG("permitting"));
t("(h) THE SAME PAYLOAD from a signed-in MEMBER succeeds — which is what makes it complete",
  [val(sEnt, "ok"), val(sRel, "ok"), val(sPro, "ok")], [true, true, true]);
t("(h) and the member's row carries the MEMBER id, so the two acts are distinguishable",
  [val(sRel, "declared_by"), val(sPro, "declared_by")], ["ruth", "ruth"]);
t("(h) visibly machine-attributed: the machine's stamp carries the class prefix, the member's does not",
  [String(val(mRel, "declared_by")).startsWith("class:"), String(val(sRel, "declared_by")).startsWith("class:")],
  [true, false]);
t("(h) and the machine is NEVER anonymous — the act is permitted, the anonymity is not",
  [val(mRel, "declared_by"), val(mPro, "declared_by")].every((v) => typeof v === "string" && v.length > 0), true);

console.log("\n--- 2b. the expertise pair: refused, but NOT as a machine (the marker's claim, driven) ---");
const mExpD = await POST("op=expertisedeclare&token=mem-rec65", { label: "CPA" });
const sExpD = await POST(`op=expertisedeclare&token=${RUTH}`, { label: "CPA" });
const mExpC = await POST("op=expertiseconfirm&token=adm-rec65", { memberId: "ruth", label: "CPA" });
const sExpC = await POST(`op=expertiseconfirm&token=${GUS}`, { memberId: "ruth", label: "CPA" });
t("(i) a machine credential is REFUSED at both expertise acts",
  [val(mExpD, "ok"), val(mExpC, "ok")], [false, false]);
t("(i) and what refuses is the MEMBERSHIP guard, named — not a machine fence (D-229's shape)",
  [val(mExpD, "reason"), val(mExpC, "reason")], ["NO_SUCH_MEMBER", "ADMIN_ONLY"]);
t("(i) the same payloads succeed for a member and an administrator, so the refusal is attributable",
  [val(sExpD, "ok"), val(sExpC, "ok")], [true, true]);

console.log("\n--- 2c. the OPEN pair: measured, reported, not decided ---");
const mDis = await POST("op=proposedispose&token=mem-rec65",
  { progressionKey: "procurement", stageKey: "award", to: "deferred",
    reason: "not now, revisit after the budget cycle closes" });
t("(j) OPEN and measured: a machine DISPOSES the record's own derived question today",
  [val(mDis, "ok"), val(mDis, "decided_by")], [true, "class:member"]);
t("(j) which is why it is pinned OPEN above rather than blessed by analogy with DEC-52",
  (sites.find((s) => s.writeOps.includes("proposedispose")) || {}).verdict, "OPEN");

/* =====================================================================
   BLOCK 3 — REACH. What the matcher can and cannot see, as numbers.
   ===================================================================== */
console.log("\n--- 3. reach: the wide ledger, printed, and NOT judged ---");
const files = [];
for (const d of ["src", "checks"])
  for (const f of readdirSync(SRC(d))) if (f.endsWith(".mjs")) files.push([`${d}/${f}`, readFileSync(SRC(`${d}/${f}`), "utf8")]);
const wide = wideClaims(files);
const byFile = {};
for (const w of wide) byFile[w.file] = (byFile[w.file] || 0) + 1;

/* ---- M0-18 · THE FLOOR IS THE REPRODUCIBLE FIGURE, THE LEDGER IS NOT --------
 * This walk read `src/` and `checks/` off the WORKING TREE and floored on both
 * what it found and what it found IN what it found. `refs/stash` is
 * repository-wide across all sixty worktrees and `git stash push -u` carries
 * untracked files, so a phantom `.mjs` beside `store.mjs` was counted into
 * `files` and its comment lines into `wide` — the two figures floored below
 * (D-238, measured). An arrival can only push those floors UP, and a floor moved
 * to a contaminated figure is permanently too high and gets switched off.
 *
 * THE LEDGER IS STILL REPORTED OVER THE WHOLE WORKING TREE. A member-actor claim
 * written in a file nobody has committed yet is still a claim, and it still
 * belongs in the printed ledger — that is the half that must not narrow. Only
 * the two FLOORS narrow to `git ls-tree HEAD`. */
const PROV = readGitProvenance(REPO);
const relOf = ([rel]) => repoPath(REPO, SRC(rel));
const inCommit = (row) => PROV.inHead === null ? true : PROV.inHead.has(relOf(row));
const FILES_REPRO = files.filter(inCommit);
const REPRO_NAMES = new Set(FILES_REPRO.map(([rel]) => rel));
const wideRepro = wide.filter((w) => REPRO_NAMES.has(w.file));
/* SAY UNVERIFIED, NEVER CLEAN (D-233) — in the assertion's own prose, not only
   in the report. */
const HEAD_SAYS = PROV.inHead === null
  ? "UNVERIFIED — git could not answer `ls-tree HEAD`, so this is the whole working-tree walk and is NOT a claim about any commit"
  : `in the commit at HEAD (${PROV.headSha})`;

console.log(`  wide ledger: ${files.length} source files walked · ${wide.length} comment lines make a member-actor claim`);
console.log(`    ${JSON.stringify(byFile)}`);
console.log(`  wide ledger, REPRODUCIBLE: ${FILES_REPRO.length} of ${files.length} file(s) and ${wideRepro.length} `
          + `of ${wide.length} claim line(s) are ${HEAD_SAYS} — floors 24 / 80 apply to THESE`);
reportProvenance({
  prov: PROV,
  items: files.map((row) => ({ path: relOf(row), what: row[0],
    counted: `${byFile[row[0]] || 0} member-actor claim line(s)` })),
  instrument: "the wide-ledger walk",
  corpus: `${files.length} source file(s) walked, ${FILES_REPRO.length} of them in the commit`,
  totals: PROV.inHead === null ? [] : [
    { label: "source files", contaminated: files.length, reproducible: FILES_REPRO.length, source: "files" },
    { label: "claim lines", contaminated: wide.length, reproducible: wideRepro.length, source: "files" },
  ],
});

/* CORRECTED 2026-08-09 BY M0-18, NEVER EXEMPTED: both floors were computed over
   the working tree, where an untracked arrival raises them and nothing said so.
   The questions are unchanged; the corpus they are asked about is now the one
   another checkout at this HEAD reproduces. */
t(`(k) the wide walk reads the whole plane, not a fragment — corpus floored over the files another `
+ `checkout REPRODUCES (${FILES_REPRO.length} of ${files.length}, ${HEAD_SAYS})`,
  FILES_REPRO.length >= 24, true);
t(`(k) and it finds the class it is looking for, floored as a DELTA rather than an absolute, over that `
+ `same reproducible corpus (${wideRepro.length} of ${wide.length} claim lines)`,
  wideRepro.length >= 80, true);
t("(k) the provenance check either verified against `git ls-tree HEAD` or reported UNVERIFIED — never a "
+ "silent third state, and under UNVERIFIED both pairs of figures COLLAPSE rather than reading zero",
  [PROV.inHead instanceof Set || PROV.inHead === null,
   PROV.inHead === null ? FILES_REPRO.length === files.length && wideRepro.length === wide.length : true],
  [true, true]);
/* STATED RATHER THAN DISCOVERED: the wide ledger is REPORTED and never judged. It cannot
   tell which act a free-standing sentence governs, and guessing would be the over-strict
   direction. The judged corpus is block 1's stamp sites, where the act is unambiguous. */
t("(k) the judged corpus is a strict subset of the wide one — the ledger is evidence, not a gate",
  sites.length < wide.length, true);

} finally {
  await mf.dispose();
}

console.log(`\n${pass} pass, ${fail} fail`);
/* `process.exit`, not `exitCode` — `hygiene.test.mjs` requires every suite to END ON ITS
   OWN RESULT, and it caught this file on the first battery run. A workerd instance that
   outlives the assertions can hold the process open and turn a red suite into a hang,
   which reports as neither pass nor fail. */
process.exit(fail ? 1 : 0);
