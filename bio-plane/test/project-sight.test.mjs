/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/project-sight.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS COPIES OF THE SOURCES while it runs and the battery must not discover it. Re-run in one step from `bio-plane/`: `node test/project-sight.control.mjs [arm]`. Every arm patches a COPY of `src/` (asserting its anchor occurs exactly once) and the real sources are hashed before and after; what each arm MUST fail is declared in the driver before it arms.
   RESULTS, RUN 2026-09-18 in worktree agent-a93cdfa0fe0f8d435 on base dd52609b (real src/index.mjs 658,971 B sha256 176cbfa2cb58…, src/store.mjs 2,604,600 B sha256 5ba1bb4b00b1…, untouched: YES): (a) baseline 92/0 · (b) cite-distinguishing 90/2 — only cite's byte-identity and never-positional arms · (c) position-first 88/4 — the positional check asked before the sight gate at `#edgeTransition`: sever's and reinstate's byte-identity AND never-positional (C-56-discloses) arms · (d) not-found-to-everyone 72/20 — every byte-identity arm stays GREEN (the lie) and the SEES-NO-ROLE and JOINED arms catch it · (e) roster-stamp-dropped 80/12 — without the control plane's viewer stamp the five roster acts disclose again (and a forged `viewer=` is believed): exactly their §1 and §2 arms · (f) promote-stamp-dropped 88/4 — fails closed, machine credentials included · (g) sight-via-redactor 92/0, the over-strictness arm. RECORDED, NOT SMOOTHED: (d) came back NOT AS DECLARED on the first run because its METHOD perturbed the fixture, and was corrected; (e) came back NOT AS DECLARED because its declaration was one row short (the stamp is also what overwrites a forged viewer), and was then REWRITTEN when the store's absent-viewer rule for the roster acts changed from fail-closed to not-asked (`Store#rosterInSight`) after the first full battery showed fail-closed breaking every suite that drives the roster straight at the store. Reasons at each arm in the driver; re-run, every arm AS DECLARED.
   RE-RUN 2026-09-18 by REC-141 in worktree agent-a12cdccbace704eb6 AFTER correcting this suite (P predicted from the plane's PROJ sequence and asserted at the mint; the fork rows send no newId; §6 CORRECTED from the KNOWN `EXISTS` to the refusal, byte-identical to a never-minted id), real src/index.mjs 660,878 B sha256 98368d9756c0…, src/store.mjs 2,636,157 B sha256 9c6222a402cc…, untouched: YES — every arm AS DECLARED: baseline 94/0 · cite-distinguishing 92/2 · position-first 90/4 · not-found-to-everyone 74/20 · roster-stamp-dropped 82/12 · promote-stamp-dropped 90/4 · sight-via-redactor 94/0 (each +2 passes: the mint-equals-prediction arm and §6's second arm).
   RE-RUN 2026-09-19 by REC-141 after BOB #16's opaque-suffix ruling (P can no longer be predicted: the never-minted reads are taken at NEVER, and §1 normalises each read's OWN id to one placeholder), real src/index.mjs 663,811 B sha256 3f4f83fdb5d6…, src/store.mjs 2,648,430 B sha256 d037f85ce689…, untouched: YES — every arm AS DECLARED: baseline 94/0 · cite-distinguishing 92/2 · position-first 90/4 · not-found-to-everyone 74/20 · roster-stamp-dropped 82/12 · promote-stamp-dropped 90/4 · sight-via-redactor 94/0. RECORDED: the first 2026-09-19 run had cite-distinguishing and roster-stamp-dropped NOT AS DECLARED only because §1's label was reworded and the driver matches it by fragment; the label was restored, and the arms then came back as declared.
   RE-RUN 2026-09-23 by D-447 in worktree /home/user/bio (cloud) on base 02603e88 AFTER adding §7 (the ranked read) and three arms, real src/index.mjs 731,481 B sha256 c7d77e7eee13…, src/store.mjs 2,902,978 B sha256 893a1cc99c3b…, src/query.mjs 166,525 B sha256 bdeb4e9c8285… (now hashed too), untouched: YES — baseline 110/0 · cite-distinguishing 108/2 · position-first 106/4 · not-found-to-everyone 88/22 · roster-stamp-dropped 98/12 · publish-raw-bm25 103/7 (THE BRIEF'S CONTROL: the index-wide bm25() published again as `score` — the six hit-bearing digests and NO SCORE IS PUBLISHED fail BY NAME, select-all `ids` and the selection order do NOT) · order-by-index-bm25 105/5 (no score, the ORDER from the index-wide bm25() again — exactly the five orders the hidden revision flips) · tf-over-vis 110/0 (over-strictness) · sight-via-redactor 110/0: AS DECLARED. RECORDED, NOT SMOOTHED: (1) not-found-to-everyone came back NOT AS DECLARED on the first run because §7's hidden revision was iris's session, which that arm lies to — a second variable; §7 now revises by the ADMIN token and the arm is AS DECLARED. (2) promote-stamp-dropped is NOT AS DECLARED (0/1: the suite throws in its fixture, SURFACE_NO_RUN) and it is PRE-EXISTING — the same result on a clean checkout of 02603e88 with §7 absent: the arm drops the promote stamp, which REC-171's surfacing-run fixture (`surfacing-run.mjs`) needs to open its run. Routed with its fix named (create the fixture's inquiry through the store's internal door, the bias set's precedent, or open the run before arming); not changed here.
   RE-RUN 2026-09-24 by D-464 in worktree /home/user/bio (cloud) on base 15b2a4c0 AFTER adding §8 (the counts) and five arms, real src/index.mjs 742,733 B sha256 450e60c61109…, src/store.mjs 2,958,609 B sha256 9a5b205f5a3b…, src/query.mjs 166,525 B sha256 998316465236…, untouched: YES — baseline 125/0 · cite-distinguishing 123/2 · position-first 121/4 · not-found-to-everyone 103/22 · roster-stamp-dropped 113/12 · publish-raw-bm25 118/7 · order-by-index-bm25 120/5 · tf-over-vis 125/0 · stats-whole-store 122/3 (THE BRIEF'S CONTROL: `op=stats` counts the whole store again — the hidden-creation arm fails BY NAME, `A HIDDEN CREATION AND REVISION MOVE NO KEY of vera's op=stats`, with the digest and EXACT arms; searchindexcheck and selectionlist stay green) · indexcheck-whole-index 122/3 · selectionbytes-whole 124/1 · stats-stamp-dropped 122/3 · subtract-for-everyone 125/0 (over-strictness) · sight-via-redactor 125/0: AS DECLARED. BEFORE the fix §8 read 115/7 on the unedited sources (vera's stats moved `bundles, files, history, refs, indexed, projectParticipants`). RECORDED, NOT SMOOTHED: (1) stats-stamp-dropped came back NOT AS DECLARED on its first run (then 121/4, against a store reading an ABSENT stamp as DENY: the ADMIN witness failed and three zeros agreed); that reading was corrected before landing because it zeroed the counters four store-level suites read off the DO route (a never-sent viewer is now an internal call, WHOLE), and the arm was re-declared: dropping the stamp now fails the headline by name. Reason at the arm. (2) promote-stamp-dropped is still NOT AS DECLARED (0/1, SURFACE_NO_RUN in REC-171's fixture) — PRE-EXISTING, D-447's finding (2) above, unchanged by D-464.
   RE-RUN 2026-09-24 by D-486 in worktree /home/user/bio (cloud) on base land/conduct/c19-batch10 @ cff0ede6 AFTER adding §9 (a RUN over a hidden project, the five observation-log tallies) and four arms, real src/index.mjs 786,508 B sha256 4579fae29f93…, src/store.mjs 3,178,998 B sha256 ae571b49b306…, src/query.mjs 166,525 B sha256 998316465236…, untouched: YES — baseline 136/0 · cite-distinguishing 134/2 · position-first 132/4 · not-found-to-everyone 114/22 · roster-stamp-dropped 124/12 · publish-raw-bm25 129/7 · order-by-index-bm25 131/5 · tf-over-vis 136/0 · stats-whole-store 129/7 · indexcheck-whole-index 133/3 · selectionbytes-whole 135/1 · stats-stamp-dropped 130/6 · subtract-for-everyone 136/0 · d486-content-tally-unsubtracted 134/2 (THE ROW'S OWN CONTROL: the predicate dropped from ONE reader — the content tally — and its arms fail BY NAME) · d486-stats-airunlog-unsubtracted 133/3 · d486-meaning-run-ungated 134/2 · d486-predicate-de-morgan 136/0 (over-strictness) · sight-via-redactor 136/0: AS DECLARED. BEFORE the fix §9 read 131/5 on the unedited sources (MEASUREMENTS M-131: vera's `aiRunLog` and `observationsNonLead` moved, all three tallies moved, and the MEANING level published the hidden run's own id in `looked`). RECORDED, NOT SMOOTHED: (1) d486-content-tally-unsubtracted came back NOT AS DECLARED on its first run with THREE undeclared reds, one of them BEFORE its own cause — the patch removed the predicate from the SQL and left its BINDINGS, so the statement threw; corrected to remove both, reason at the arm. (2) §9's residue arm came back GREEN on a second run after failing on the first WITHOUT a line changing: the four watermark keys move only when the fixture's captures and the run's rows fall inside ONE SECOND (the causes normalise to the second, `register.registered` carries milliseconds). Diagnosed, spelled as a CEILING, and routed as D-486 FINDING 2 — an intermittent disclosure is worse than a steady one, not better. (3) stats-whole-store and stats-stamp-dropped came back NOT AS DECLARED because §9 reads two `op=stats` keys their declarations predate; both declarations were EXTENDED (never exempted) and are AS DECLARED. (4) promote-stamp-dropped is still NOT AS DECLARED (0/1, SURFACE_NO_RUN in REC-171's fixture) — PRE-EXISTING, D-447's finding (2), unchanged by D-486.
   RE-RUN 2026-09-24 by D-480 in worktree /home/user/bio (cloud) on base origin/main 58293bf3 merged with land/worker/D-497 @ 29d8409d, AFTER adding §10 (a hidden project's CITATIONS, and a hidden TARGET, in the shared-question candidate page) and three arms, real src/index.mjs 802,067 B sha256 fbdcfb83ed09…, src/store.mjs 3,233,147 B sha256 d0f540dbbadf…, src/query.mjs 166,525 B sha256 998316465236…, untouched: YES — baseline 147/0 · cite-distinguishing 145/2 · position-first 143/4 · not-found-to-everyone 123/24 · roster-stamp-dropped 135/12 · publish-raw-bm25 140/7 · order-by-index-bm25 142/5 · tf-over-vis 147/0 · stats-whole-store 133/14 · indexcheck-whole-index 144/3 · selectionbytes-whole 146/1 · stats-stamp-dropped 141/6 · subtract-for-everyone 147/0 · d486-content-tally-unsubtracted 145/2 · d486-stats-airunlog-unsubtracted 144/3 · d486-meaning-run-ungated 145/2 · d486-predicate-de-morgan 147/0 · d480-citers-ungated 140/7 (THE ROW'S OWN CONTROL: the citer end of the edge ungated again — §10's seven arms fail, headed by `A HIDDEN PROJECT'S CITATIONS MOVE NOTHING`) · d480-targets-ungated 146/1 (the ATTRIBUTION arm: the target end alone, failing `A TARGET VERA CANNOT SEE TAKES NO SLOT` and NOTHING else, with the citer arms either side of it green) · d480-not-in-inverted 147/0 (over-strictness) · sight-via-redactor 147/0: AS DECLARED. BEFORE the fix §10's seven arms fail, measured twice — by `d480-citers-ungated` and by `stats-whole-store`, which neuters `#hiddenSets`' `hid` at source and takes all seven with it. RECORDED, NOT SMOOTHED: (1) `d480-citers-ungated` came back NOT AS DECLARED on its first run and THE ARM WAS RIGHT WHILE THE DECLARATION WAS WRONG — two of §10's arms read `truncOf(...).every((x) => x === false)`, which is TRUE OVER AN EMPTY ARRAY, so with vera's item crowded off her page entirely they PASSED over a feed holding nothing, while a third arm failed for a reason that was not its subject (a digest compared between two reads both missing the item). The SUITE was corrected — every flag is now asserted once per item beside the item COUNT — and the declaration re-taken. (2) `not-found-to-everyone` and `stats-whole-store` came back NOT AS DECLARED on declarations that PREDATE this item: the first has been failing §9's two ADMIN-token arms undeclared since D-486 added them, and the second neuters the ONE predicate both D-464's counts and D-480's candidate page read. Both declarations were EXTENDED, never exempted, and the second is a measurement: `stats-stamp-dropped`, which drops the stamp on `op=stats` alone, leaves §10 wholly green, so the coupling is the predicate and not the door. (3) promote-stamp-dropped is still NOT AS DECLARED (0/1, SURFACE_NO_RUN in REC-171's fixture) — PRE-EXISTING, D-447's finding (2), unchanged by D-464, D-486 or D-480.
   RE-RUN 2026-09-25 by REC-196 in worktree /home/user/bio (cloud) on base origin/main 964da679, AFTER adding §11 (a READ naming a DISCOVERABLE project's own id answers C-70.1, BOB #32's ruling (a)) and six arms, real src/index.mjs 857,558 B sha256 28bfd3677c8c…, src/store.mjs 3,355,514 B sha256 b854b3303ef9…, src/query.mjs 166,525 B sha256 998316465236…, untouched: YES — baseline 205/0 · cite-distinguishing 203/2 · position-first 201/4 · not-found-to-everyone 178/27 · roster-stamp-dropped 193/12 · publish-raw-bm25 198/7 · order-by-index-bm25 200/5 · tf-over-vis 205/0 · stats-whole-store 191/14 · indexcheck-whole-index 202/3 · selectionbytes-whole 204/1 · stats-stamp-dropped 199/6 · subtract-for-everyone 205/0 · d486-content-tally-unsubtracted 203/2 · d486-stats-airunlog-unsubtracted 202/3 · d486-meaning-run-ungated 203/2 · d486-predicate-de-morgan 205/0 · d480-citers-ungated 198/7 · d480-targets-ungated 204/1 · d480-not-in-inverted 205/0 · rec196-existence-read-dropped 180/25 (THE ROW'S OWN CONTROL: the pre-dispatch check disarmed, so a discoverable project's own id reads "does not exist" again — every one of §11's 24 reads fails 11b BY NAME, with 11c) · rec196-hidden-too 171/34 (positional for HIDDEN projects too: §11e's 24 arms and ten of §1's own hidden-equals-absent read arms) · rec196-to-everyone 203/2 (the owner answered C-70.1: 11f, 11f+) · rec196-table-short 203/2 (projectparticipants dropped from the table: the sweep names it, 11g, and its 11b fails) · rec196-roster-viewer-unstamped 204/1 · rec196-no-prefilter 205/0 (over-strictness) · sight-via-redactor 205/0: AS DECLARED. BEFORE the fix, `project-discoverable.test.mjs` §3l measured all eleven of its reads at EXISTENCE byte-identical to a never-minted id. RECORDED, NOT SMOOTHED: (1) rec196-hidden-too came back NOT AS DECLARED on its first run — it ALSO failed ten of this suite's earlier REC-138 read arms, a second witness the declaration had missed; extended. (2) rec196-table-short came back NOT AS DECLARED because §11g's FIRST spelling demanded the route read `viewer`, and `projectparticipants` reads it only through the new check, so the sweep was blind to exactly that drop; the sweep was widened to every id-carrying read route (and seven ungated reads were classified), then AS DECLARED. (3) not-found-to-everyone came back NOT AS DECLARED because §11's fixture set the setting by iris's SESSION, which that arm lies to (D-447's recorded second-variable trap); the fixture now takes the owner's act through the store's internal door and the run-open is non-fatal, and the arm's declaration was EXTENDED by 11d+, 11f and 11f+, which catch it by name. (4) promote-stamp-dropped is still NOT AS DECLARED (0/1, SURFACE_NO_RUN in REC-171's fixture) — PRE-EXISTING, D-447's finding (2), unchanged by REC-196.
   RE-RUN 2026-09-25 by REC-197 in worktree /home/user/bio (cloud) on land/worker/REC-196 @ 82f604d2 (stacked; REC-196 integrated, not yet on main), AFTER adding §12 (a creation and a fork CARRY `visibility`, absent is HIDDEN, a machine's `discoverable` is refused C-97.1 — BOB #32's ruling (b)) and five arms, real src/index.mjs 857,558 B sha256 28bfd3677c8c…, src/store.mjs 3,361,747 B sha256 1662015934e2…, src/query.mjs 166,525 B sha256 998316465236…, untouched: YES (and sha256sum -c of all four sources before/after the run: OK) — baseline 222/0 · cite-distinguishing 220/2 · position-first 218/4 · not-found-to-everyone 187/35 · roster-stamp-dropped 210/12 · publish-raw-bm25 215/7 · order-by-index-bm25 217/5 · tf-over-vis 222/0 · stats-whole-store 208/14 · indexcheck-whole-index 219/3 · selectionbytes-whole 221/1 · stats-stamp-dropped 216/6 · subtract-for-everyone 222/0 · d486-content-tally-unsubtracted 220/2 · d486-stats-airunlog-unsubtracted 219/3 · d486-meaning-run-ungated 220/2 · d486-predicate-de-morgan 222/0 · d480-citers-ungated 215/7 · d480-targets-ungated 221/1 · d480-not-in-inverted 222/0 · rec196-existence-read-dropped 197/25 · rec196-hidden-too 188/34 · rec196-to-everyone 218/4 · rec196-table-short 220/2 · rec196-roster-viewer-unstamped 221/1 · rec196-no-prefilter 222/0 · rec197-absent-discoverable 218/4 (THE ROW'S OWN CONTROL: an absent `visibility` on an owner's creation defaults to DISCOVERABLE — the FAIL-CLOSED arms 12a, 12a+ and 12h fail BY NAME, with 12g) · rec197-machine-may-choose 218/4 (the ownerless refusal disarmed: 12d and 12d+ for the ADMIN and the MEMBER token) · rec197-not-recorded 218/4 (the field accepted and nothing recorded: 12b, 12b+, 12c, 12h+) · rec197-revision-ignored 221/1 (12g) · rec197-setting-as-set 222/0 (over-strictness) · sight-via-redactor 222/0: AS DECLARED. RECORDED, NOT SMOOTHED: (1) rec197-absent-discoverable came back NOT AS DECLARED on its first run — it ALSO failed 12g, whose fixture is 12a's absent-created project; the arm was right and the declaration one row short, so it was extended. (2) not-found-to-everyone and rec196-to-everyone came back NOT AS DECLARED on this item's first full run — §12 reads every creation back through its owner's session, which the first lies to outright and the second answers C-70.1 for a discoverable project; both declarations EXTENDED by name, never exempted. (3) promote-stamp-dropped is still NOT AS DECLARED (0/1, SURFACE_NO_RUN in REC-171's fixture) — PRE-EXISTING, D-447's finding (2), unchanged by REC-197. `project-discoverable.control.mjs` re-run on the same tree, every arm AS DECLARED: baseline 157/0 · widen-viewerPredicate 95/62 · existence-as-absent 123/34 · default-discoverable 96/61 (D-601's re-armed arm, AS DECLARED) · owner-fence-dropped 149/8 · latest-by-max-seq 157/0 · act-not-reindexed 101/56 — after correcting that suite's predecessor fixture (1a0), whose today's-code-over-yesterday's-schema store now also neuters the creation answer's `#visibilityOf` read.
 * ========================================================================
 * REC-138 / D-426 / IC-155 — A PROJECT YOU CANNOT SEE IS A PROJECT THAT DOES NOT EXIST, AT EVERY ACT.
 * Membership Architecture v2 §7.9: an UNINVITED member sees nothing of a project, *"Not its
 * existence, not its name, not its references, not its participants."* IC-141's rule for how that is
 * measured: the answer to a caller without standing is BYTE-IDENTICAL to the answer a nonexistent id
 * receives, compared RAW — status, content type and body.
 *
 * HOW THE COMPARISON IS MADE, AND WHY IT IS THE SAME ID. An answer that echoes the project id could
 * never match a DIFFERENT never-minted id, so each act is asked TWICE with the SAME request: once while
 * the id names nothing, and again after the ADMIN token mints it as a project owned by iris that vera
 * was never invited to. Everything else the request names (selections, the bias set, the question)
 * exists in both reads. What changes between the two reads is the project and nothing else.
 *
 * WHAT WAS WRONG, measured on the unedited tree (`dd52609b` + the claim, 29 acts driven): TEN answered
 * the two reads differently — `promote` (ABSENT vs C-56.1), `cite`, `sever`, `reinstate`
 * (NO_SUCH_PROJECT vs C-56.1), `projectinvite`, `projectowneradd`, `projectownerremove`
 * (NO_SUCH_PROJECT vs NOT_THE_OWNER), `projectownerrescue` (NO_SUCH_PROJECT vs ADMIN_ONLY),
 * `projectfork` (NO_SUCH_PROJECT vs NOT_A_PARTICIPANT) and `airunopen` over a project context
 * (projectless-permitted vs AI_RUN_NOT_PROJECT_MEMBER). The other nineteen already matched.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) answer not-found to EVERYONE. Every byte-identity arm goes green. So §3 drives callers who CAN
 *       see the project and hold no role — an INVITED member, an enrolled administrator, the founder —
 *       and each must get the POSITIONAL refusal (C-56.1, NOT_THE_OWNER, ADMIN_ONLY, NOT_JOINED), and
 *       §4 drives the owner, who must get the real answer.
 *   (2) keep the sight gate but ask it AFTER the positional check. The byte arms still fail then, and
 *       §2 names the finding directly: a positional refusal is never said to a caller who cannot see.
 *   (3) forge the stamp. §1 carries a forged `viewer=` on a roster act and a forged `actorViewer` in a
 *       promote body; both are deleted and re-stamped by the control plane, so both still match.
 *   (4) narrow SIGHT for machines. §5 pins that the ADMIN and MEMBER tokens still act on the project.
 * ========================================================================= */
import { statedJSON } from "./stated.mjs";
import { withSurfacingRun } from "./surfacing-run.mjs";   /* REC-171: a deploy token's questions are surfaced inside a run it holds */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { join } from "node:path";

/* The control driver points this at an armed copy of the sources. */
const SRC_DIR = process.env.PROJECT_SIGHT_SRC || fileURLToPath(new URL("../src", import.meta.url));
const IDX = join(SRC_DIR, "index.mjs");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = statedJSON(got) === statedJSON(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${statedJSON(want)}\n         got  ${statedJSON(got)}`}`);
  ok ? pass++ : fail++;
};

const ADM = "adm-rec138", MEM = "mem-rec138";
const mf = withSurfacingRun(new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  /* CORRECTED 2026-09-21 BY D-436 (IC-172), never exempted: INSTANCE_NAME is bound because every install binds it
     (`newgroup`'s upload, D-102), and a store records its producing group from it at its FIRST BOOT. Unbound, the
     store records none and a fork of a project whose document names no group is refused by name (C-64.1) where it used to be handed a literal
     group. 'believe-in-oakland' is this project's own group, the one these fixtures' documents already name. */
  bindings: { INSTANCE_NAME: "believe-in-oakland", ADMIN_TOKEN: ADM, MEMBER_TOKEN: MEM, VERSION: "test" },
}));
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
/* THE RAW ANSWER: status, content type and the body's exact bytes — nothing parsed away. */
const RAW = async (q, body) => {
  const res = await mf.dispatchFetch(`http://x/api/?${q}`,
    body === undefined ? {} : { method: "POST", body: JSON.stringify(body) });
  return { status: res.status, type: res.headers.get("content-type"), body: await res.text() };
};
const parse = (r) => { try { return rP(JSON.parse(r.body)); } catch { return null; } };
const POST = async (q, body) => parse(await RAW(q, body ?? {}));
const DO = async (path, body) => {
  const ns = await mf.getDurableObjectNamespace("STORE");
  return rP(await (await ns.get(ns.idFromName("bio")).fetch(`http://x/${path}`,
    { method: "POST", body: JSON.stringify(body) })).json());
};
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : (r && r.reason) || null;
const E = encodeURIComponent;
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";
const must = (l, r) => { if (!r || r.ok === false) throw new Error(`${l}: ${JSON.stringify(r).slice(0, 700)}`); return r; };
/* Every answer that is a statement about the caller's POSITION in a project. Said to a caller who
   cannot see the project, each one is the oracle this item closes. */
const POSITIONAL = ["PROJECT_ACT_NOT_A_PARTICIPANT", "PROJECT_ACT_NOT_THE_OWNER", "NOT_THE_OWNER", "ADMIN_ONLY",
                    "NOT_A_PARTICIPANT", "NOT_JOINED", "AI_RUN_NOT_PROJECT_MEMBER"];

try {

/* ============================================================== FIXTURE */
must("claim", await POST("op=claim", { bootstrapToken: ADM, password: "founder-passphrase-138" }));
const FOUNDER = (await POST("op=login", { password: "founder-passphrase-138" })).token;
const CAPS = ["contribute", "publish", "create_projects"];
const enrol = async (memberId, role) => {
  const add = await POST(`op=memberadd&token=${ADM}`, { memberId, cover: `cover for ${memberId}`, role, capabilities: CAPS });
  must(`enroll ${memberId}`, await POST("op=enroll", { invite: add && add.invite, handle: memberId, password: `${memberId}-pass-138` }));
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-pass-138` });
  if (!lg || !lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
/* The founder counts as the first administrator, so the second must be one too (ADMINS_FIRST). */
const RUTH = await enrol("ruth", "admin");
const IRIS = await enrol("iris", "member");   /* the project's owner */
const VERA = await enrol("vera", "member");   /* NEVER invited: the caller who cannot see it */
const OLGA = await enrol("olga", "member");   /* INVITED, never joins: sees the skeleton, holds no role */
await enrol("pam", "member");                 /* a member iris may invite in §4 */

const infoMd = (id) => ["---", `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high", "group: believe-in-oakland", "references: []",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "", "## Provenance Notes", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
const scalar = (k, v) => v === null ? [`    ${k}: null`] : typeof v === "boolean" ? [`    ${k}: ${v}`] : [`    ${k}: "${String(v)}"`];
const inquiryMd = (id, basis) => ["---", `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the sewer fund transfer follow the adopted process?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`, "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references:", `  - target: ${basis}`, "    rel: cites", "    status: confirmed",
  "state_history: []", "annotations_open: 0", "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""', "recheck_triggers:",
  "  - text: Revisit after the next budget cycle", "    description: The adopted budget may restate the transfer basis.",
  "basis:", `  - target: ${basis}`, "    role: supports", "basis_versions:", '  - name: "v1"',
  ...scalar("description", "the ledger reading"), ...scalar("relationship", "and"), ...scalar("state", "suggested"),
  ...scalar("derived_from", null), ...scalar("hidden", false), ...scalar("claim", "The transfer followed the adopted process."),
  ...scalar("author", "iris"), ...scalar("at", NOW), "basis_version_grounds:", '  - version: "v1"',
  ...scalar("ground", "g1"), ...scalar("asserted_by", "iris"), ...scalar("at", NOW),
  "basis_version_legs:", '  - version: "v1"', ...scalar("target", basis), ...scalar("role", "supports"),
  ...scalar("ground", "g1"), ...scalar("grade", "B"), ...scalar("grade_axis", "capture"), ...scalar("grade_source", "capture"),
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "", "## Conclusion", "",
  "## What Would Falsify This", "", "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");
/* CORRECTED 2026-09-18 (REC-141, IC-158): `id` null builds a CREATION's bytes, which carry no `id:` line —
   the plane mints the project's id and writes it (C-59.2 refuses bytes already carrying one). */
/* D-563: `title` is the project's NAME, stated in its document — 7.1 scans the document's title, not a label. */
const projectMd = (id, cites = [], summary = "A project.", title = "Hidden project 9138") => ["---", ...(id === null ? [] : [`id: ${id}`]), "object_type: project",
  `title: "${title}"`, "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  ...(cites.length ? ["references:", ...cites.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
                   : ["references: []"]),
  "required_strength:", "  capture: B", "  connection: C", "---", "", "## Summary", "", summary, "",
  "## Session Log", ""].join("\n");
/* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: the label `Bundle ${id}` contradicted every document's own
   title and is now refused; the label names none, and each bundle is titled by its document. */
const meta = (id, type, state) => ({ object_type: type, group: "believe-in-oakland",
  current_state: state, created: NOW, last_updated: LATER });
const pkg = (id, text, type, state, base, snapKey) => ({ bundleId: id, base, snapKey,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: meta(id, type, state) });
let seq = 0;
const promoteAs = (tok, id, text, type, state, base = null) =>
  POST(`op=promote&token=${tok}`, pkg(id, text, type, state, base, `${id}-${++seq}`));
const shaOf = async (id) => (parse(await RAW(`op=list&token=${ADM}&limit=1000`)) || {})
  .bundles?.find((b) => b.bundle_id === id)?.bundle_sha ?? null;

const LEDGER = "INFO-2026-9138-ledger", MINUTES = "INFO-2026-9138-minutes";
for (const d of [LEDGER, MINUTES]) must(d, await promoteAs(ADM, d, infoMd(d), "information", "collected"));
const INQ = "INQ-2026-9138-transfer";
must("inquiry", await promoteAs(ADM, INQ, inquiryMd(INQ, LEDGER), "inquiry", "open"));
must("iris accepts v1", await POST(`op=versionaccept&token=${IRIS}&target=${E(INQ)}&version=v1&reason=${E("borne out")}`, {}));
const BIAS = "BIAS-2026-9138-lens";
const biasMd = (state) => ["---", `id: "${BIAS}"`, 'object_type: "bias"', 'schema: "bias@1"', 'title: "Project lens"',
  `current_state: "${state}"`, `prior_state: ${state === "draft" ? "null" : '"draft"'}`, `created: "${NOW}"`,
  `last_updated: "${LATER}"`, "produced_by:", '  mode: "human"', '  capability_tier: "member"',
  'group: "believe-in-oakland"', "references: []", "state_history: []", "annotations_open: 0", "reeval_pending:",
  "  flag: false", "  since: null", "  source: null", "visuals: []", "statements:", '  - id: "p1"',
  '    kind: "scrutiny"', '    subject: "ENT-2026-0011"',
  '    text: "Figures from the fund\'s own dashboard need the underlying ledger before they bear load."',
  '    justification: "The dashboard is produced by the body under examination."', "    citations: []",
  "    locked: false", "---", "", "## Statements", "", "The lens.", "", "## Adoption", "", "Adopted.", "",
  "## What This Does Not Enforce", "", "BIO checks that each statement names a registered subject. It does NOT "
  + "check whether a second source was independent of the first.", "", "## Session Log", "", "## Review Notes", ""].join("\n");
/* The bias set's revision goes straight to the store (an internal write carries no stamp), so the
   fixture does not depend on the promote stamp a control arm removes. */
const bd = must("bias draft", await promoteAs(VERA, BIAS, biasMd("draft"), "bias", "draft"));
must("bias proposed", await DO("promote", { ...pkg(BIAS, biasMd("proposed"), "bias", "proposed", bd.bundleSha, "rec138-bias"),
                                            author: "vera" }));

/* vera's selections, made ONCE and reused, so the handle is the same string in both reads. */
const vSel = async (id) => must(`vera selects ${id}`, await POST(`op=select&token=${VERA}&kind=enumerated`, { ids: [id] })).handle;
const V_MIN = await vSel(MINUTES), V_LED = await vSel(LEDGER);

/* CORRECTED 2026-09-19 (REC-141, IC-158, as corrected by BOB #16's *"A MINTED ID CARRIES NO COUNT"*): P was
   CHOSEN ("PROJ-2026-9138-hidden") and minted at that id after the never-minted read. The plane now MINTS a
   project's id with an OPAQUE random suffix and refuses a creation naming one, so the id can be neither chosen nor
   predicted (the 2026-09-18 correction predicted it from `allocId`'s counter — the count BOB #16 ruled out). So the
   never-minted reads are taken at NEVER, an id of the minted shape that names nothing, and the hidden reads at the
   minted P; P starts as NEVER and is reassigned at the mint. §1 then compares the two bodies with each read's OWN id
   replaced by one placeholder — the id is the only thing the two reads differ in by construction, so it is the only
   thing normalised (`project-disclosure.test.mjs`' precedent for a run id). An answer that echoes the caller's own
   id discloses nothing; any other byte that differs still fails. */
const YEAR = new Date().toISOString().slice(0, 4);
const NEVER = `PROJ-${YEAR}-0000-hidden-project-9138`;
let P = NEVER;
const REVISE_OF = () => pkg(P, projectMd(P, [LEDGER], "A revision."), "project", "forming", "0".repeat(64), "rec138-fixed-snap");

/* ============================================ THE ACTS, as ONE table — vera's request for each.
   Every request is well-formed enough to REACH its project resolution. Nineteen of these already
   answered alike before this item; they are pinned so that stays true. */
const ACTS = [
  ["promote (a revision)", () => RAW(`op=promote&token=${VERA}`, REVISE_OF())],
  ["promote with a FORGED actorViewer", () => RAW(`op=promote&token=${VERA}`, { ...REVISE_OF(), actorViewer: `class:admin` })],
  ["cite", () => RAW(`op=cite&token=${VERA}&project=${P}&handle=${V_MIN}&note=${E("the minutes")}`, {})],
  ["sever", () => RAW(`op=sever&token=${VERA}&project=${P}&handle=${V_LED}&reason=${E("superseded")}`, {})],
  ["reinstate", () => RAW(`op=reinstate&token=${VERA}&project=${P}&handle=${V_LED}&reason=${E("back in")}`, {})],
  ["versioncurrent", () => RAW(`op=versioncurrent&token=${VERA}&target=${E(INQ)}&version=v1&project=${P}`, {})],
  ["conclude&project=", () => RAW(`op=conclude&token=${VERA}&target=${E(INQ)}&project=${P}&falsifier=${E("a rescinding minute")}`, {})],
  ["proposedispose (project-scoped)", () => RAW(`op=proposedispose&token=${VERA}`, { project: P, finding: "F-1", to: "deferred", reason: "waiting" })],
  ["biasadopt scope=project", () => RAW(`op=biasadopt&token=${VERA}&bundleId=${BIAS}&scope=project&scopeId=${P}`)],
  ["biasmanifest scope=project", () => RAW(`op=biasmanifest&token=${VERA}&scope=project&scopeId=${P}`)],
  ["basisversions&project=", () => RAW(`op=basisversions&token=${VERA}&id=${E(INQ)}&project=${P}`)],
  ["versionstrength&project=", () => RAW(`op=versionstrength&token=${VERA}&id=${E(INQ)}&version=v1&project=${P}`)],
  ["strengthbarof&project=", () => RAW(`op=strengthbarof&token=${VERA}&project=${P}`)],
  ["publish&project=", () => RAW(`op=publish&token=${VERA}&project=${P}`, {})],
  ["casedraft", () => RAW(`op=casedraft&token=${VERA}`, { project: P })],
  ["airunopen over a project context", () => RAW(`op=airunopen&token=${VERA}`, { run: "RUN-rec138-1", contextType: "project", contextId: P })],
  ["airuns over a project context", () => RAW(`op=airuns&token=${VERA}&contextType=project&contextId=${P}`)],
  ["projectinvite", () => RAW(`op=projectinvite&token=${VERA}&projectId=${P}&handle=pam`)],
  ["projectinvite with a FORGED viewer=", () => RAW(`op=projectinvite&token=${VERA}&projectId=${P}&handle=pam&viewer=${E("class:admin")}`)],
  ["projectjoin", () => RAW(`op=projectjoin&token=${VERA}&projectId=${P}`)],
  ["projectleave", () => RAW(`op=projectleave&token=${VERA}&projectId=${P}`)],
  ["projectremove", () => RAW(`op=projectremove&token=${VERA}&projectId=${P}&handle=olga`)],
  ["projectowneradd", () => RAW(`op=projectowneradd&token=${VERA}&projectId=${P}&handle=olga`)],
  ["projectownerremove", () => RAW(`op=projectownerremove&token=${VERA}&projectId=${P}&handle=iris&reason=${E("r")}`)],
  ["projectownerrescue", () => RAW(`op=projectownerrescue&token=${VERA}&projectId=${P}&handle=olga&reason=${E("r")}`)],
  ["projectownerarith", () => RAW(`op=projectownerarith&token=${VERA}&projectId=${P}`)],
  /* CORRECTED 2026-09-18 (REC-141): no `newId` — a named one is now refused (C-59.3) before sight is asked. */
  ["projectfork", () => RAW(`op=projectfork&token=${VERA}&projectId=${P}&title=${E("A fork")}`)],
  ["projectparticipants", () => RAW(`op=projectparticipants&token=${VERA}&projectId=${P}`)],
  ["affordances target=", () => RAW(`op=affordances&token=${VERA}&target=${P}`)],
  ["image id=", () => RAW(`op=image&token=${VERA}&id=${P}`)],
  ["file id=", () => RAW(`op=file&token=${VERA}&id=${P}&path=bundle.md`)],
];

const absent = [];
for (const [, f] of ACTS) absent.push(await f());
t("the id names nothing yet (so the first read IS the never-minted answer)", await shaOf(P), null);

/* MINT the project: created by the ADMIN token, owned by iris, olga invited. vera is never invited. */
/* CORRECTED 2026-09-19 (REC-141): created with NO id; the plane mints it, and P becomes the minted id. */
{
  const { bundleId: _chosen, ...create } = pkg(P, projectMd(null, [LEDGER]), "project", "forming", null, `${P}-${++seq}`);
  const minted = must("mint the project", await POST(`op=promote&token=${ADM}`, create));
  t("the plane minted an id of the canonical shape, and it is not the never-minted one read above",
    [/^PROJ-\d{4}-\d{4}-hidden-project-9138$/.test(String(minted.bundleId)), minted.bundleId !== NEVER], [true, true]);
  P = minted.bundleId;
}
must("iris owns it", await DO("projectclaimowner", { projectId: P, memberId: "iris" }));
/* Straight to the store for the same reason: iris is the positional actor (`by`), and the viewer is
   the operator-internal `admin` one — a fixture's setup act, not a caller's. */
must("iris invites olga", await DO(`projectinvite?projectId=${P}&handle=olga&by=iris&viewer=admin`, {}));
t("and now it exists", typeof (await shaOf(P)), "string");

const hidden = [];
for (const [, f] of ACTS) hidden.push(await f());
console.log(`  corpus: ${ACTS.length} acts, each read twice by vera (never-minted, then hidden)`);
t("the table is not empty and was read in full both times (floor: 31 acts)",
  [ACTS.length >= 31, absent.length === ACTS.length, hidden.length === ACTS.length], [true, true, true]);

/* ======================================================== 1. HIDDEN = ABSENT, RAW */
console.log("\n--- 1. an uninvited member's answer on a hidden project is BYTE-IDENTICAL to a never-minted id's ---");
ACTS.forEach(([name], i) => {
  const a = absent[i], h = hidden[i];
  /* Each read's own id -> one placeholder (see P's comment); nothing else is normalised. */
  const idless = (body, id) => body.split(id).join("<PROJECT-ID>");
  t(`HIDDEN = ABSENT, raw (status, content type, body): op=${name}`,
    { status: h.status, type: h.type, sha: sha(idless(h.body, P)) }, { status: a.status, type: a.type, sha: sha(idless(a.body, NEVER)) });
});

/* ======================================================== 2. POSITION NEVER SPEAKS FIRST */
console.log("\n--- 2. a positional refusal is never said to a caller who cannot see the project ---");
/* A positional answer the NEVER-MINTED id also receives discloses nothing (`projectleave`'s
   NOT_A_PARTICIPANT, `projectremove`'s NOT_THE_OWNER and `biasadopt`'s C-56.2 are said to a
   non-participant of ANY id, before this item and after it). What is an oracle is a positional
   answer that ONLY an existing project draws — that is what C-56.1 was, for four acts. */
ACTS.forEach(([name], i) => {
  const c = codeOf(parse(hidden[i])), a = codeOf(parse(absent[i]));
  t(`NEVER POSITIONAL TO THE UNSIGHTED: op=${name} (hidden ${c}, never-minted ${a})`,
    POSITIONAL.includes(c) && c !== a, false);
});

/* ======================================================== 3. SEES IT, HOLDS NO ROLE */
console.log("\n--- 3. a caller who CAN see the project and holds no role gets the POSITIONAL answer (the liar's arm) ---");
{
  const sel = async (tok, id) => (await POST(`op=select&token=${tok}&kind=enumerated`, { ids: [id] })).handle;
  const O_MIN = await sel(OLGA, MINUTES), O_LED = await sel(OLGA, LEDGER);
  const base = await shaOf(P);
  t("SEES, NO ROLE: olga (INVITED, not joined — §7.5 view rights) — op=cite answers C-56.1",
    codeOf(await POST(`op=cite&token=${OLGA}&project=${P}&handle=${O_MIN}&note=${E("n")}`, {})), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: olga — op=sever answers C-56.1",
    codeOf(await POST(`op=sever&token=${OLGA}&project=${P}&handle=${O_LED}&reason=${E("r")}`, {})), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: olga — op=reinstate answers C-56.1",
    codeOf(await POST(`op=reinstate&token=${OLGA}&project=${P}&handle=${O_LED}&reason=${E("r")}`, {})), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: olga — op=promote (a revision at the real base) answers C-56.1",
    codeOf(await promoteAs(OLGA, P, projectMd(P, [LEDGER], "olga's edit"), "project", "forming", base)), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: olga — op=projectinvite answers NOT_THE_OWNER",
    codeOf(await POST(`op=projectinvite&token=${OLGA}&projectId=${P}&handle=pam`)), "NOT_THE_OWNER");
  t("SEES, NO ROLE: olga — op=projectowneradd answers NOT_THE_OWNER",
    codeOf(await POST(`op=projectowneradd&token=${OLGA}&projectId=${P}&handle=pam`)), "NOT_THE_OWNER");
  t("SEES, NO ROLE: olga — op=projectownerremove answers NOT_THE_OWNER",
    codeOf(await POST(`op=projectownerremove&token=${OLGA}&projectId=${P}&handle=iris&reason=${E("r")}`)), "NOT_THE_OWNER");
  t("SEES, NO ROLE: olga — op=projectownerrescue answers ADMIN_ONLY (§7.13 is an administrator's)",
    codeOf(await POST(`op=projectownerrescue&token=${OLGA}&projectId=${P}&handle=pam&reason=${E("r")}`)), "ADMIN_ONLY");
  t("SEES, NO ROLE: olga — op=projectfork answers NOT_JOINED",
    codeOf(await POST(`op=projectfork&token=${OLGA}&projectId=${P}&title=${E("olga fork")}`)), "NOT_JOINED");
  t("SEES, NO ROLE: olga — op=airunopen over the project answers AI_RUN_NOT_PROJECT_MEMBER",
    codeOf(await POST(`op=airunopen&token=${OLGA}`, { run: "RUN-rec138-o", contextType: "project", contextId: P })),
    "AI_RUN_NOT_PROJECT_MEMBER");
  const R_MIN = await sel(RUTH, MINUTES);
  t("SEES, NO ROLE: ruth (an enrolled administrator, not in it — §7.3 sight) — op=cite answers C-56.1",
    codeOf(await POST(`op=cite&token=${RUTH}&project=${P}&handle=${R_MIN}&note=${E("n")}`, {})), "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: ruth — op=projectfork answers NOT_A_PARTICIPANT",
    codeOf(await POST(`op=projectfork&token=${RUTH}&projectId=${P}&title=${E("ruth fork")}`)), "NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: ruth — op=projectownerrescue answers OWNERS_ARE_ACTIVE (it reached §7.13's condition)",
    codeOf(await POST(`op=projectownerrescue&token=${RUTH}&projectId=${P}&handle=pam&reason=${E("r")}`)), "OWNERS_ARE_ACTIVE");
  t("SEES, NO ROLE: the FOUNDER's session (the administrator's viewer, IC-149) — op=promote answers C-56.1, not ABSENT",
    codeOf(await promoteAs(FOUNDER, P, projectMd(P, [LEDGER], "founder's edit"), "project", "forming", base)),
    "PROJECT_ACT_NOT_A_PARTICIPANT");
  t("SEES, NO ROLE: the founder — op=projectinvite answers NOT_THE_OWNER, not NO_SUCH_PROJECT",
    codeOf(await POST(`op=projectinvite&token=${FOUNDER}&projectId=${P}&handle=pam`)), "NOT_THE_OWNER");
}

/* ======================================================== 4. THE OWNER GETS THE REAL ANSWER */
console.log("\n--- 4. a JOINED member (the owner) gets the real answer ---");
{
  const sel = async (id) => (await POST(`op=select&token=${IRIS}&kind=enumerated`, { ids: [id] })).handle;
  t("JOINED: iris cites the minutes into her project", (await POST(`op=cite&token=${IRIS}&project=${P}&handle=${await sel(MINUTES)}&note=${E("n")}`, {}))?.ok, true);
  t("JOINED: iris severs the ledger", (await POST(`op=sever&token=${IRIS}&project=${P}&handle=${await sel(LEDGER)}&reason=${E("r")}`, {}))?.ok, true);
  t("JOINED: iris reinstates it", (await POST(`op=reinstate&token=${IRIS}&project=${P}&handle=${await sel(LEDGER)}&reason=${E("r")}`, {}))?.ok, true);
  t("JOINED: iris revises the project's document",
    (await promoteAs(IRIS, P, projectMd(P, [LEDGER, MINUTES], "iris's revision"), "project", "forming", await shaOf(P)))?.ok, true);
  t("JOINED: iris invites pam", (await POST(`op=projectinvite&token=${IRIS}&projectId=${P}&handle=pam`))?.ok, true);
  t("JOINED: iris's op=projectowneradd reaches the handle (NO_SUCH_HANDLE for one that names nobody)",
    codeOf(await POST(`op=projectowneradd&token=${IRIS}&projectId=${P}&handle=nobody-138`)), "NO_SUCH_HANDLE");
  t("JOINED: iris's op=projectownerremove reaches the handle too",
    codeOf(await POST(`op=projectownerremove&token=${IRIS}&projectId=${P}&handle=nobody-138&reason=${E("r")}`)), "NO_SUCH_HANDLE");
  t("JOINED: iris forks it", (await POST(`op=projectfork&token=${IRIS}&projectId=${P}&title=${E("iris fork")}`))?.ok, true);
  t("JOINED: iris's op=airunopen passes the project gate (the next check, the principals, is what answers)",
    codeOf(await POST(`op=airunopen&token=${IRIS}`, { run: "RUN-rec138-i", contextType: "project", contextId: P })),
    "AI_RUN_CAPABILITY_UNAVAILABLE");
}

/* ======================================================== 5. MACHINE CREDENTIALS */
console.log("\n--- 5. machine credentials are unchanged: they see every project and hold no position ---");
{
  const h = (await POST(`op=select&token=${MEM}&kind=enumerated`, { ids: [MINUTES] })).handle;
  t("the MEMBER token still cites into the project", (await POST(`op=cite&token=${MEM}&project=${P}&handle=${h}&note=${E("m")}`, {}))?.ok, true);
  t("the ADMIN token still revises it",
    (await promoteAs(ADM, P, projectMd(P, [LEDGER, MINUTES], "admin token's revision"), "project", "forming", await shaOf(P)))?.ok, true);
}

/* ======================================================== 6. A CREATION AT A HIDDEN ID (D-428's creation half) */
console.log("\n--- 6. CLOSED BY REC-141 (D-428's creation half): a CREATION naming a hidden id answers as one naming a free id ---");
{
  /* PINNED AS MEASURED so a change to it is noticed. A creation at a never-minted id CREATES it, so no
     answer to a creation at a hidden id can be byte-identical to that; the id space is shared and one
     id cannot be two bundles. D-428 carries it (and NAME_TAKEN, 7.1's instance-wide uniqueness).
     2026-09-18, REC-139: NAME_TAKEN no longer names the other project's id or title (IC-156,
     `project-disclosure.test.mjs`); plane-minted ids, which would close THIS pin, are decided and not
     built — the design does not say whether a supplied id is refused or ignored. */
  /* CORRECTED 2026-09-18 (REC-141, IC-158). This pinned `EXISTS` AS MEASURED, as KNOWN: a creation at a hidden id
     said the id was taken, because the caller chose ids and one id cannot be two bundles. The plane now MINTS
     project ids (Membership v2 §7, BOB #15), so a creation that names one is refused BEFORE any id is looked up —
     one answer, taken or not, echoing no id. The old pin was right about the old plane and is wrong about this one. */
  const r = await RAW(`op=promote&token=${VERA}`, pkg(P, projectMd(null), "project", "forming", null, "rec138-create"));
  const FREE = P.replace(/-\d{4}-hidden/, "-9999-hidden");
  const f = await RAW(`op=promote&token=${VERA}`, pkg(FREE, projectMd(null), "project", "forming", null, "rec138-create"));
  t("REC-141: vera's CREATION at the hidden project's id is refused PROJECT_ID_SUPPLIED, not EXISTS", codeOf(parse(r)), "PROJECT_ID_SUPPLIED");
  t("REC-141: and it is BYTE-IDENTICAL to her creation at a never-minted id",
    { status: r.status, type: r.type, sha: sha(r.body) }, { status: f.status, type: f.type, sha: sha(f.body) });
}

/* ======================================================== 7. THE RANKED READ (D-447) */
console.log("\n--- 7. D-447: revising a project vera cannot see moves NOTHING in vera's search answer ---");
{
  /* WHAT WAS WRONG, measured at the op on the unedited tree (`02603e88`, this section run before any source changed):
     the page's `hits[].score` was `bm25(bundles_fts)`, whose IDF and average row length are statistics of the WHOLE
     index — hidden projects included. Revising P (which vera cannot see) moved the score of EVERY one of vera's visible
     hits for every text query, and moved the ORDER of `culvert OR levy` (and of its select-all `ids`), so a member
     could watch a project they are not invited to change by watching their own results. The fix ranks over what the
     viewer can see (`visibleBm25` in query.mjs) and publishes the ORDER only.
     THE FIXTURE IS BUILT TO MOVE AN ORDER, not just a number: SHORT says `culvert` once in a short body, LONG three
     times in a long one, OTHER says `levy` twice. Under a corpus-wide statistic the revision below (a long body full of
     both words) re-weights the two terms and re-balances length, which is what flipped OTHER and LONG when measured. */
  const filler = (n) => Array.from({ length: n }, (_, i) => `word${i % 97}`).join(" ");
  const infoWith = (id, body) => infoMd(id).replace("A captured document.", body);
  const SHORT = "INFO-2026-9447-short", LONG = "INFO-2026-9447-long", OTHER = "INFO-2026-9447-other";
  must("SHORT", await promoteAs(ADM, SHORT, infoWith(SHORT, "culvert levy noted."), "information", "collected"));
  must("LONG", await promoteAs(ADM, LONG, infoWith(LONG, `culvert culvert culvert ${filler(120)}`), "information", "collected"));
  must("OTHER", await promoteAs(ADM, OTHER, infoWith(OTHER, `levy levy of funds ${filler(30)}`), "information", "collected"));
  const QS = ["q=culvert", "q=levy", `q=${E("culvert OR levy")}`, `q=${E("culvert levy")}`,
              `q=${E("culvert OR levy")}&mode=ids`, `q=${E("culvert OR levy")}&sort=relevance&dir=desc`,
              `q=${E("culvert OR levy")}&limit=1&offset=1`];
  const readAll = async (tok) => { const o = []; for (const q of QS) o.push(await RAW(`op=search&token=${tok}&${q}`)); return o; };
  const selOrder = async () => {
    const h = must("vera's query selection", await POST(`op=select&token=${VERA}&kind=query&q=${E("culvert OR levy")}`, {})).handle;
    const r = parse(await RAW(`op=selection&token=${VERA}&handle=${h}`));
    return (r?.members || r?.items || r?.ids || []).map((m) => (typeof m === "string" ? m : m.bundle_id));
  };
  const vBefore = await readAll(VERA), aBefore = await readAll(ADM), sBefore = await selOrder();
  const hits0 = parse(vBefore[2])?.hits || [];
  console.log(`  corpus: ${QS.length} searches by vera; 'culvert OR levy' answers ${hits0.length} hits: ${hits0.map((h) => h.bundle_id).join(", ")}`);
  t("the fixture is live: vera's 'culvert OR levy' finds all three visible documents and not the project",
    hits0.map((h) => h.bundle_id).sort(), [LONG, OTHER, SHORT].sort());
  t("the query selection is live (floor: three members)", sBefore.length, 3);

  const base = await shaOf(P);
  /* By the ADMIN token, not iris's session: WHO revises is not the variable here, and the `not-found-to-everyone`
     control arm lies to every member's session — a member's revision there made this fixture throw (measured). */
  must("the hidden project is revised, heavy in both words",
    await promoteAs(ADM, P, projectMd(P, [LEDGER, MINUTES], `culvert levy ${filler(2000)} levy levy levy culvert`), "project", "forming", base));
  t("the hidden revision LANDED (P's sha moved)", (await shaOf(P)) !== base, true);
  const vAfter = await readAll(VERA), aAfter = await readAll(ADM), sAfter = await selOrder();
  /* THE WITNESS: the same searches by a credential that CAN see P do move — so the index took the revision, and the
     byte-identity below is not an equality that cost nothing (two reads of an index nothing changed). */
  t("the index SAW the revision: the ADMIN token's 'culvert OR levy' answer moved (it can see P)",
    sha(aAfter[2].body) !== sha(aBefore[2].body), true);
  QS.forEach((q, i) => {
    t(`A HIDDEN REVISION MOVES NOTHING: op=search&${decodeURIComponent(q)} (status, content type, body, by digest)`,
      { status: vAfter[i].status, type: vAfter[i].type, sha: sha(vAfter[i].body) },
      { status: vBefore[i].status, type: vBefore[i].type, sha: sha(vBefore[i].body) });
  });
  t("A HIDDEN REVISION MOVES NOTHING: the order of a query selection's members", sAfter, sBefore);

  /* THE ANSWER PUBLISHES AN ORDER AND NO SCORE (IC for D-447): a number carried on a hit is either the corpus's
     statistic (the leak) or a derivation a reader would compare across answers. */
  const every = [...vBefore, ...vAfter].flatMap((r) => parse(r)?.hits || []);
  t(`NO SCORE IS PUBLISHED: none of the ${every.length} hits vera was served carries a 'score' key (floor: 20 hits)`,
    [every.length >= 20, every.filter((h) => "score" in h).length], [true, 0]);
  /* OVER-STRICTNESS: an order computed over the visible set is still RELEVANCE, and it is still LIVE. */
  t("STILL RELEVANCE: the document saying 'culvert' three times ranks above the one saying it once",
    (parse(vAfter[0])?.hits || []).map((h) => h.bundle_id), [LONG, SHORT]);
  t("STILL RELEVANCE: descending relevance is the exact reverse of ascending",
    (parse(vAfter[5])?.hits || []).map((h) => h.bundle_id), (parse(vAfter[2])?.hits || []).map((h) => h.bundle_id).reverse());
  must("a VISIBLE revision", await promoteAs(ADM, SHORT, infoWith(SHORT, "culvert culvert culvert culvert culvert levy noted."), "information", "collected", await shaOf(SHORT)));
  t("STILL LIVE: a revision vera CAN see does move vera's order (SHORT now says 'culvert' most and ranks first)",
    (parse(await RAW(`op=search&token=${VERA}&q=culvert`))?.hits || []).map((h) => h.bundle_id), [SHORT, LONG]);
}

/* ======================================================== 8. THE COUNTS (D-464) */
console.log("\n--- 8. D-464: creating and revising a project vera cannot see moves NOTHING in vera's counts ---");
{
  /* WHAT WAS WRONG, measured at the op on the unedited tree (`15b2a4c0`, this section run before any source changed;
     MEASUREMENTS M-122 first saw it): `op=stats` counted every table over the WHOLE store and `op=searchindexcheck`'s
     `counts.indexed` counted the whole text index, so a member diffing their own counts across a colleague's work
     learned that a project they were never invited to had been CREATED (`bundles`, `files`, `history`, `refs`,
     `indexed`, `projectParticipants`) and REVISED (`history`, `files`, `refs`) — §7.9's *"Not its existence"*,
     arriving by an aggregate. The fix counts through the caller's own `viewerPredicate` (`Store#viewerCounts`), the
     one sight rule, so every class but a filtered member session gets the count it always got.
     THE ACTS are the ones that write a project's rows: the creation (by the ADMIN token), an owner claimed, a member
     invited, and a revision that cites a second document. None of them is vera's, and she is never invited. */
  const READS = ["op=stats", "op=searchindexcheck", "op=searchindexcheck&limit=1", "op=selectionlist"];
  const readAll = async (tok) => { const o = []; for (const q of READS) o.push(await RAW(`${q}&token=${tok}`)); return o; };
  const vBefore = await readAll(VERA), aBefore = await readAll(ADM);
  const s0 = parse(vBefore[0]) || {};
  const keys = Object.keys(s0);
  console.log(`  corpus: ${READS.length} count reads by vera; op=stats answers ${keys.length} keys (bundles ${s0.bundles}, indexed ${s0.indexed})`);
  t("the counts are live: vera's op=stats is an answer of counts (floor: 40 keys, and she already sees documents)",
    [keys.length >= 40, s0.bundles > 0, s0.indexed > 0], [true, true, true]);
  /* CORRECTED 2026-09-25 (D-563, C-86.3), never exempted: its name `Hidden project 9464` rode on the LABEL over a
     document titled `Hidden project 9138`; 7.1 now scans the document's title, so the name is written there. */
  const { bundleId: _none, ...create } = pkg(NEVER,
    projectMd(null, [LEDGER], undefined, "Hidden project 9464"),
    "project", "forming", null, `d464-${++seq}`);
  const q = must("a second hidden project is minted", await POST(`op=promote&token=${ADM}`, create)).bundleId;
  must("iris owns it", await DO("projectclaimowner", { projectId: q, memberId: "iris" }));
  must("iris invites olga", await DO(`projectinvite?projectId=${q}&handle=olga&by=iris&viewer=admin`, {}));
  const qBase = await shaOf(q);
  must("and it is revised, citing a second document",
    await promoteAs(ADM, q, projectMd(q, [LEDGER, MINUTES], "A revision.", "Hidden project 9464"), "project", "forming", qBase));
  t("the hidden revision LANDED (its sha moved)", (await shaOf(q)) !== qBase, true);
  /* And iris, who owns it, SELECTS it: `op=selectionlist`'s `bytes` summed every owner's selection rows. */
  must("iris selects the hidden project", await POST(`op=select&token=${IRIS}&kind=enumerated`, { ids: [q] }));
  const vAfter = await readAll(VERA), aAfter = await readAll(ADM);
  /* THE WITNESS: the ADMIN token, which sees every project, counts them — so the rows were written, and the identity
     below is not two reads of a store nothing changed. */
  const a0 = parse(aBefore[0]) || {}, a1 = parse(aAfter[0]) || {};
  t("the store SAW the acts: the ADMIN token's bundles, history, refs, indexed and projectParticipants all moved",
    ["bundles", "history", "refs", "indexed", "projectParticipants"].filter((k) => a1[k] === a0[k]), []);
  t("the store SAW the acts: the ADMIN token's searchindexcheck counts.indexed moved",
    parse(aAfter[1])?.counts?.indexed > parse(aBefore[1])?.counts?.indexed, true);
  t("the store SAW the acts: the ADMIN token's selectionlist bytes moved (iris's selection of it)",
    parse(aAfter[3])?.bytes > parse(aBefore[3])?.bytes, true);
  const s1 = parse(vAfter[0]) || {};
  t("A HIDDEN CREATION AND REVISION MOVE NO KEY of vera's op=stats (the keys that moved, by name)",
    keys.filter((k) => JSON.stringify(s1[k]) !== JSON.stringify(s0[k])), []);
  READS.forEach((r, i) => {
    t(`A HIDDEN CREATION AND REVISION MOVE NOTHING: ${r} (status, content type, body, by digest)`,
      { status: vAfter[i].status, type: vAfter[i].type, sha: sha(vAfter[i].body) },
      { status: vBefore[i].status, type: vBefore[i].type, sha: sha(vBefore[i].body) });
  });
  /* PARITY STILL MEANS PARITY for the reader: her `indexed` is her `keyed` (no orphan, no hidden row). */
  const c1 = parse(vAfter[1])?.counts || {};
  t("vera's searchindexcheck is still a parity check over what she can see: indexed = keyed, and ok",
    [c1.indexed === c1.keyed, parse(vAfter[1])?.ok], [true, true]);
  /* OVER-STRICTNESS: a count through the viewer is still a COUNT, and still LIVE — a document vera CAN see moves it. */
  const VIS = "INFO-2026-9464-visible";
  must("a VISIBLE document", await promoteAs(ADM, VIS, infoMd(VIS), "information", "collected"));
  const s2 = parse(await RAW(`op=stats&token=${VERA}`)) || {}, c2 = parse(await RAW(`op=searchindexcheck&token=${VERA}`))?.counts || {};
  /* `history` is not in this list: a CREATION writes no prior version (measured — it moved 0 here before the fix too). */
  t("STILL LIVE: a document vera CAN see moves her bundles, files, register and indexed by exactly one each",
    ["bundles", "files", "register", "indexed"].map((k) => s2[k] - s1[k]), [1, 1, 1, 1]);
  t("STILL LIVE: and her searchindexcheck counts.indexed and keyed by one each",
    [c2.indexed - c1.indexed, c2.keyed - c1.keyed], [1, 1]);
  /* OVER-STRICTNESS: a credential the gate does not filter keeps the WHOLE count — the MEMBER token is instance-level
     and the ADMIN token the operator (viewerPredicate's machine arm), and an enrolled ADMINISTRATOR sees every
     project (§7.9). Each must equal the ADMIN token's own figure, hidden project included. */
  const whole = parse(await RAW(`op=stats&token=${ADM}`)) || {};
  const mem = parse(await RAW(`op=stats&token=${MEM}`)) || {}, ruth = parse(await RAW(`op=stats&token=${RUTH}`)) || {};
  /* And the difference between the whole count and vera's is EXACTLY the bundles her own list does not show — the
     count is the list's size, not a looser or a tighter number (the hidden set is read, not assumed). */
  const ids = async (tok) => new Set(((parse(await RAW(`op=list&token=${tok}&limit=1000`)) || {}).bundles || []).map((b) => b.bundle_id));
  const allIds = await ids(ADM), veraIds = await ids(VERA);
  const unseen = [...allIds].filter((i) => !veraIds.has(i));
  console.log(`  bundles vera's list does not show: ${unseen.length} (${unseen.join(", ")})`);
  t("WHOLE FOR THE UNFILTERED: the MEMBER token and ruth (an administrator) count what the ADMIN token counts",
    ["bundles", "history", "refs", "indexed", "projectParticipants"].map((k) => mem[k] === whole[k] && ruth[k] === whole[k]),
    [true, true, true, true, true]);
  t("EXACT: the ADMIN token's bundles less vera's is the number of bundles her list does not show, and it includes both hidden projects (floor: 2)",
    [whole.bundles - s2.bundles, unseen.length >= 2, unseen.includes(P) && unseen.includes(q), allIds.size === whole.bundles],
    [unseen.length, true, true, true]);
}

console.log("\n--- 9. D-486 / BOB #32: a RUN over a project vera cannot see moves NOTHING in her five tallies ---");
{
  /* WHAT WAS WRONG, and D-464 ROUTED IT RATHER THAN DECIDING IT (§8's own comment, and
     `BIO_Membership_Architecture_v2.md` §7's line: *NOT decided and stated*). D-464 took every count whose rows NAME
     a bundle through the caller's sight, and left the five that count the OBSERVATION LOG whole, because whether a
     hidden project's run output belongs to the shared evidence corpus or to the project was a design question, not
     an implementation choice. **BOB #32 ruled it on 2026-09-24 at 02:30Z:** *a hidden project's run output is the
     PROJECT'S THINKING until something outside uses it; the bytes stay shared, only the run's attribution is
     withheld.* So the five readers subtract the LOG ROWS of a run whose context is a project the caller cannot
     see — and nothing else: the capture, the content row and the reading such a run produced stay in every corpus
     count they were ever in, which is the `STILL LIVE` arm at the foot.
     THE FIVE READERS, and they are the whole class rather than a list of the ones that came to mind: a sweep of
     `store.mjs` for an aggregate over `observation_log` finds exactly five — `op=stats`' `aiRunLog` and
     `observationsNonLead`, and the document, content and meaning frontier tallies. `op=purge`'s `observations` is
     the sixth and stays WHOLE on purpose (§5: the purge proof's own count stays whole); the internet level's tally
     was already scoped to the viewer (REC-129, IC-143) and counts no run row. */
  const READS = ["op=stats", "op=frontier&level=document&limit=500",
                 "op=frontier&level=content&limit=500", "op=frontier&level=meaning&limit=500"];
  const readAll = async (tok) => { const o = []; for (const q of READS) o.push(await RAW(`${q}&token=${tok}`)); return o; };
  const TALLY = (r) => JSON.stringify(parse(r)?.tally ?? null);
  const FIVE = (rs) => { const st = parse(rs[0]) || {};
    return [st.aiRunLog, st.observationsNonLead, TALLY(rs[1]), TALLY(rs[2]), TALLY(rs[3])]; };

  const vBefore = await readAll(VERA), aBefore = await readAll(ADM);
  console.log(`  vera's five before: aiRunLog=${FIVE(vBefore)[0]} observationsNonLead=${FIVE(vBefore)[1]} `
            + `document=${FIVE(vBefore)[2]} content=${FIVE(vBefore)[3]} meaning=${FIVE(vBefore)[4]}`);
  t("the five readers ANSWER AT ALL for vera before anything is written (a tuple of undefineds would make every "
  + "identity below an equality between two absences — the costs-nothing rule)",
    FIVE(vBefore).map((x) => x !== undefined && x !== null && x !== "null"), [true, true, true, true, true]);

  const openRun = async (tok, run, contextType, contextId) => POST(`op=airunopen&token=${tok}`, {
    run, contextType, contextId, label: "evidence sweep", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 20, unit: "requests" }], leaseMs: 600000 });
  /* ONE ROW AT EACH OF THE THREE BUNDLE LEVELS, so all three frontier tallies are driven rather than one and the
     other two argued from it. Each is `LOOKED_ABSENT`: the run looked and found nothing, which is the state that
     makes the row a COVERAGE claim and therefore exactly the disclosure §7.9 refuses to make about a hidden
     project. `subject_kind` is `unstated` for every run row by `#aiRunAppend`'s design — not this suite's choice. */
  const LOOK = (n) => [
    { level: "document", subject: `https://example.gov/d486-${n}`, state: "LOOKED_ABSENT" },
    { level: "content",  subject: sha(`d486-capture-${n}`),        state: "LOOKED_ABSENT" },
    { level: "meaning",  subject: `ENT-2026-9486-${n}`,            state: "LOOKED_ABSENT" }];

  const HIDDEN_RUN = "RUN-2026-9486-hidden";
  must("iris, who OWNS the hidden project, opens a run over it", await openRun(IRIS, HIDDEN_RUN, "project", P));
  must("and the run looks at all three bundle levels",
       await POST(`op=airuntick&token=${IRIS}`, { run: HIDDEN_RUN, consume: { fetches: 3 }, log: LOOK("hidden") }));

  const vAfter = await readAll(VERA), aAfter = await readAll(ADM);
  /* THE WITNESS, AND IT IS THE WHOLE DIFFERENCE BETWEEN THIS ARM AND AN EQUALITY THAT COSTS NOTHING: the ADMIN
     token sees every project, so its own five figures MOVE on exactly the acts vera's must not see. Without this
     the identity below would pass over a run that never wrote a row. */
  t("THE ARM IS ARMED: the ADMIN token's five all MOVED on the hidden run (the ones that did NOT move, by name)",
    ["aiRunLog", "observationsNonLead", "tally:document", "tally:content", "tally:meaning"]
      .filter((k, i) => FIVE(aAfter)[i] === FIVE(aBefore)[i]), []);
  t("A HIDDEN PROJECT'S RUN MOVES NONE OF VERA'S FIVE (the ones that moved, by name)",
    ["aiRunLog", "observationsNonLead", "tally:document", "tally:content", "tally:meaning"]
      .filter((k, i) => FIVE(vAfter)[i] !== FIVE(vBefore)[i]), []);
  /* THE WHOLE ANSWER, KEY BY KEY, AND THE RESIDUE IS PINNED BY NAME RATHER THAN ROUNDED OFF. Two of the four
     reads are byte-identical; the other two still move FOUR keys, and this arm names exactly which, so it fails
     loudly in BOTH directions — if a later landing fixes the residue, or if it grows. A digest-only arm would have
     said "two reads moved" and left the next reader to find out what; that is the narrowed-unknown this project
     asks for instead of a rounded pass. THE RESIDUE IS `D-486 FINDING 2`, ROUTED TO BOB IN THIS ITEM'S REPORT AND
     NOT FIXED HERE BECAUSE ITS FIX NEEDS A DESIGN CALL: `#missingContentCause` and `#missingMeaningCause` classify
     an absent look by comparing the subject's entry date against `MIN(at)` over the WHOLE log at that level, so a
     hidden project's run writing the earliest row at a level re-dates that watermark and flips an outsider's
     `missing_cause` from `purged` to `never_looked` for subjects that have nothing to do with it. Taking the
     watermark through the caller's sight is the one-line fix and it is EXACTLY the change `OBSERVATION-LOG-DESIGN`
     §6 argues against for the tally — a signed completeness statement (D-196) would then depend on who computed
     it, so two signings of one case could disagree about what was searched. That is Bob's to rule, not a worker's. */
  const KEYDIFF = (i) => { const A = parse(vBefore[i]) || {}, B = parse(vAfter[i]) || {};
    return [...new Set([...Object.keys(A), ...Object.keys(B)])]
      .filter((k) => JSON.stringify(A[k]) !== JSON.stringify(B[k])).sort(); };
  READS.forEach((r, i) => { const d = KEYDIFF(i); if (d.length) console.log(`  residue on ${r}: ${d.join(", ")}`); });
  t("A HIDDEN PROJECT'S RUN MOVES NOTHING AT ALL in op=stats and in the DOCUMENT frontier (status, type, body, by digest)",
    [0, 1].map((i) => ({ status: vAfter[i].status, type: vAfter[i].type, sha: sha(vAfter[i].body) })),
    [0, 1].map((i) => ({ status: vBefore[i].status, type: vBefore[i].type, sha: sha(vBefore[i].body) })));
  /* A SURPRISING GREEN IS A FINDING ABOUT THE ARM, AND THIS ONE IS RECORDED RATHER THAN SMOOTHED (D-486, measured
     twice in the same worktree twenty minutes apart). The first spelling of this arm pinned the residue to EXACTLY
     those four keys and came back `[[], []]` on a later run — the residue had vanished without a line changing.
     IT IS A WALL-CLOCK RACE, and diagnosing it is worth more than the arm was: `#missingContentCause` and
     `#missingMeaningCause` normalise BOTH sides to the SECOND before comparing (REC-94's inherited defect note),
     while `register.registered` carries milliseconds and a run row's `at` does not. So when the fixture's captures
     register and the run's rows land inside ONE SECOND, `entered >= firstAt` flips and four keys reclassify; when
     the second boundary falls between them, nothing moves. **The residue is therefore real but intermittent, which
     makes it WORSE than a steady one, not better** — a disclosure that appears on some runs and not others is the
     kind a reader cannot reproduce and will conclude was imagined. It is carried in FINDING 2's routing.
     SO THE ARM IS SPELLED AS A CEILING, NOT AN EQUALITY: every key that moves must be one of the four the
     watermark can reach. That holds under either timing, and it still fails loudly on the two regressions this
     pin exists for — a fifth key moving, or the `tally` moving at all. The `tally`, `looked` and `by_subject_kind`
     are named explicitly beside it, because those are D-486's own subject and a ceiling that merely excluded them
     by arithmetic would not say so to the next reader. */
  const WATERMARK = ["missing_unexplained", "missing_unexplained_count", "never_looked", "never_looked_count"];
  t("THE TALLY — D-486's OWN SUBJECT — AND EVERY OTHER PUBLISHED FIELD OF THE CONTENT AND MEANING ANSWERS IS "
  + "UNMOVED. What may still move is the four WATERMARK-derived keys and NOTHING else (D-486 FINDING 2, routed to "
  + "BOB above): the arm is a ceiling because the residue is intermittent by a wall-clock race, and a fifth key "
  + "moving — or `tally`, `looked` or `by_subject_kind` moving — is a REGRESSION this arm names",
    [KEYDIFF(2).filter((k) => !WATERMARK.includes(k)), KEYDIFF(3).filter((k) => !WATERMARK.includes(k)),
     [2, 3].flatMap((i) => ["tally", "looked", "by_subject_kind"].filter((k) => KEYDIFF(i).includes(k)))],
    [[], [], []]);
  t("AND THE RESIDUE IS A RECLASSIFICATION, NEVER A DISCLOSURE OF THE RUN ITSELF: neither answer names the hidden "
  + "run, its id, its project or its subjects anywhere in its bytes — which is the half of §7.9 that would be a "
  + "leak rather than a wrong word, and the reason FINDING 2 is routed and not treated as this item's failure",
    [2, 3].flatMap((i) => [HIDDEN_RUN, P, "ENT-2026-9486-hidden"].map((needle) => vAfter[i].body.includes(needle))),
    [false, false, false, false, false, false]);

  /* OVER-STRICTNESS, ARM 1 — A PREDICATE THAT SUBTRACTED EVERY RUN WOULD PASS EVERY ARM ABOVE. A run over a
     context that is NOT a project is nobody's hidden thinking, and its rows must still reach vera. */
  const OPEN_RUN = "RUN-2026-9486-inquiry";
  must("iris opens a run over the INQUIRY, which vera can see", await openRun(IRIS, OPEN_RUN, "inquiry", INQ));
  must("and it looks at all three levels too",
       await POST(`op=airuntick&token=${IRIS}`, { run: OPEN_RUN, consume: { fetches: 3 }, log: LOOK("open") }));
  const vOpen = await readAll(VERA);
  t("STILL LIVE: a run over a context vera CAN see moves all five of her figures (the ones that did NOT move, by name)",
    ["aiRunLog", "observationsNonLead", "tally:document", "tally:content", "tally:meaning"]
      .filter((k, i) => FIVE(vOpen)[i] === FIVE(vAfter)[i]), []);
  t("STILL LIVE, EXACT: her aiRunLog and observationsNonLead each rose by exactly the three rows that run wrote",
    [FIVE(vOpen)[0] - FIVE(vAfter)[0], FIVE(vOpen)[1] - FIVE(vAfter)[1]], [3, 3]);

  /* OVER-STRICTNESS, ARM 2 — WHOLE FOR THE UNFILTERED. `viewerPredicate` filters an identified member session and
     nothing else, so the MEMBER token, the ADMIN token and ruth (an enrolled ADMINISTRATOR, who sees every
     project per §7.9) must each count the hidden run's rows. A fence tighter than its rule is not a safer fence. */
  const whole = await readAll(ADM), mem = await readAll(MEM), ruth = await readAll(RUTH);
  t("WHOLE FOR THE UNFILTERED: the MEMBER token and ruth (an administrator) read the ADMIN token's own five",
    [JSON.stringify(FIVE(mem)) === JSON.stringify(FIVE(whole)),
     JSON.stringify(FIVE(ruth)) === JSON.stringify(FIVE(whole))], [true, true]);
  /* AND THE SUBTRACTION IS EXACTLY THE HIDDEN RUN'S ROWS — read out of the run's own log rather than assumed
     from the number this suite wrote, so the arm cannot agree with itself. */
  const hiddenRows = (parse(await RAW(`op=airunlog&token=${ADM}&run=${E(HIDDEN_RUN)}&limit=500`))?.entries || []).length;
  console.log(`  the hidden run's own log holds ${hiddenRows} rows; vera's aiRunLog is ${FIVE(vOpen)[0]}, the ADMIN token's ${FIVE(whole)[0]}`);
  t("EXACT: the ADMIN token's aiRunLog less vera's is the hidden run's own row count (floor: 3), and the same for "
  + "observationsNonLead — the count is the rows, not a looser or a tighter number",
    [FIVE(whole)[0] - FIVE(vOpen)[0], FIVE(whole)[1] - FIVE(vOpen)[1], hiddenRows >= 3],
    [hiddenRows, hiddenRows, true]);

  /* THE BYTES STAY SHARED — BOB #32's ruling has TWO halves and an arm for one of them is half a pin. A capture the
     hidden run's project produced is EVIDENCE, and evidence is the shared corpus's: it must still be in vera's
     document count. This is driven with a register write under the hidden project's own run, then read off the
     corpus counter `op=stats` publishes for her. */
  const s1 = parse(await RAW(`op=stats&token=${VERA}`)) || {};
  must("the hidden run's project captures a document, and it is EVIDENCE rather than thinking",
       await promoteAs(ADM, "INFO-2026-9486-evidence", infoMd("INFO-2026-9486-evidence"), "information", "collected"));
  const s2 = parse(await RAW(`op=stats&token=${VERA}`)) || {};
  t("THE BYTES STAY SHARED: the evidence moves vera's bundles, files, register and indexed by one each, while her "
  + "aiRunLog and observationsNonLead do not move (a capture is not a run row)",
    [s2.bundles - s1.bundles, s2.files - s1.files, s2.register - s1.register, s2.indexed - s1.indexed,
     s2.aiRunLog - s1.aiRunLog, s2.observationsNonLead - s1.observationsNonLead],
    [1, 1, 1, 1, 0, 0]);
}

console.log("\n--- 10. D-480: a hidden project's CITATIONS take no slot in vera's shared-question candidates ---");
{
  /* WHAT WAS WRONG, and D-464's worker found it while D-464 was being measured (routed with its fix in D-464's
     report; `BIO_Membership_Architecture_v2.md` §7 item 7.9). `Store#queueSharedInquiryCandidates` grouped over the
     UNGATED `refs` table and took the first `QUEUE_SHARED_INQUIRIES_MAX` (64) target ids in `target_id` order. Two
     consequences, neither of which the later gate in `#projectsDrawingOn` can undo, because both happen at the
     page's EDGE rather than among the candidates it reaches:
       (1) a question only a HIDDEN project pair shares becomes a candidate and TAKES A SLOT, displacing a question
           the caller can see past the cap — so a divergence she is entitled to read DISAPPEARS from her feed; and
       (2) `bounds.inquiries_truncated`, published on every item this feed mints, FLIPS — a count-shaped side
           channel, D-447's and D-464's class: §7.9's *"Not its existence"* arriving as an aggregate.
     THE FIXTURE ARMS BOTH AT ONCE, and deliberately over-shoots rather than balancing on the cap: TWO hidden
     projects jointly cite 70 filler questions whose ids sort BEFORE vera's own shared question, so ungated they
     fill the whole page and her question is never reached at all. Nothing here needs the fillers to EXIST as
     bundles — a `references[]` entry for a document nobody has captured is the common case in this record, and it
     is exactly what `refs` projects — which is also why the fix may not fail closed on an absent target. */
  const FILLERS = 70;
  const fill = (n) => `INQ-2026-9480-a${String(n).padStart(2, "0")}`;
  const QQ = "INQ-2026-9480-zz-shared";        /* sorts AFTER every filler: the question that is crowded out */
  must("vera's own shared question", await promoteAs(ADM, QQ, inquiryMd(QQ, LEDGER), "inquiry", "open"));
  const mintProject = async (title, cites) => {
    /* D-563: the name goes in the DOCUMENT — 7.1 now scans the document's title, and a label naming each project
       apart over one shared document title would be refused (C-86.3) or collide (NAME_TAKEN). */
    const md = projectMd(null, cites, undefined, title);
    const { bundleId: _n, ...c } = pkg(NEVER, md, "project", "forming", null, `d480-${++seq}`);
    return must(`mint ${title}`, await POST(`op=promote&token=${ADM}`, c)).bundleId;
  };
  /* TWO projects vera PARTICIPATES IN (she owns them), so the divergence below is hers to read. */
  const VA = await mintProject("Vera oversight 9480", [QQ]);
  const VB = await mintProject("Vera budget 9480", [QQ]);
  for (const [pid, nm] of [[VA, "VA"], [VB, "VB"]])
    must(`vera owns ${nm}`, await DO("projectclaimowner", { projectId: pid, memberId: "vera" }));
  must("vera accepts the reading", await POST(`op=versionaccept&token=${VERA}&target=${E(QQ)}&version=v1&reason=${E("borne out")}`, {}));
  must("and VA stands on it while VB stands on nothing — the divergence",
       await POST(`op=versioncurrent&token=${VERA}&target=${E(QQ)}&version=v1&project=${E(VA)}`, {}));

  const KIND = "stance-changed-here-not-elsewhere";
  /* `now` IS PINNED, AND THE FIRST RUN OF THIS SECTION IS WHY. Without it the two reads differed at exactly one
     path — `items[0].age.ms`, 405 -> 494 — which is the WALL CLOCK and not a disclosure. A digest arm that a
     passing clock can fail is an instrument that cries wolf, so the item's age is taken from a fixed instant the
     way the rest of this fixture takes its dates. The diff is PRINTED rather than left as two hashes, because a
     digest that moves says only that something did. */
  const NOWMS = Date.parse("2026-07-03T00:00:00Z");
  const readQ = async (tok) => RAW(`op=queue&token=${tok}&limit=500&now=${NOWMS}`);
  const paths = (x, y, at = "") => {
    if (statedJSON(x) === statedJSON(y)) return [];
    if (x === null || y === null || typeof x !== "object" || typeof y !== "object" || Array.isArray(x) !== Array.isArray(y))
      return [`${at} ${statedJSON(x)?.slice(0, 60)} -> ${statedJSON(y)?.slice(0, 60)}`];
    const ks = [...new Set([...Object.keys(x), ...Object.keys(y)])];
    return ks.flatMap((k) => (k in x && k in y) ? paths(x[k], y[k], `${at}.${k}`) : [`${at}.${k} (added or removed)`]);
  };
  const itemsOf = (r) => { const q = parse(r); return (q && Array.isArray(q.items)) ? q.items : []; };
  const mine = (r) => itemsOf(r).filter((i) => i && i.kind === KIND && String(i.id || "").includes(QQ));
  const boundsOf = (r) => mine(r).map((i) => i?.basis?.bounds);
  const truncOf = (r) => boundsOf(r).map((b) => b?.inquiries_truncated);
  const examinedOf = (r) => { const b = boundsOf(r)[0]; return b ? b.inquiries_examined : -1; };
  /* The expected flag ONCE PER ITEM, so an arm cannot be satisfied by an empty list of items. */
  const TRUNC = (v) => Array.from({ length: n0 }, () => v);
  const capOf = (r) => { const b = boundsOf(r)[0]; return b ? b.inquiries_bound : -1; };

  const vBefore = await readQ(VERA), aBefore = await readQ(ADM);
  const n0 = mine(vBefore).length;
  console.log(`  corpus: vera's op=queue carries ${itemsOf(vBefore).length} items, ${n0} of them this question's divergence`);
  t("the fixture is live: vera's feed carries her shared question's divergence, and it is NOT truncated (floor: 1 item)",
    [n0 >= 1, truncOf(vBefore).every((x) => x === false)], [true, true]);

  /* THE HIDDEN CROWDING. Two projects iris owns and vera is never invited to, citing the same 70 filler questions,
     so each filler has TWO distinct citers and qualifies as SHARED on the ungated table. */
  const cites = Array.from({ length: FILLERS }, (_, i) => fill(i + 1));
  const H1 = await mintProject("Hidden crowder 9480 a", cites);
  const H2 = await mintProject("Hidden crowder 9480 b", cites);
  for (const [pid, nm] of [[H1, "H1"], [H2, "H2"]])
    must(`iris owns ${nm}`, await DO("projectclaimowner", { projectId: pid, memberId: "iris" }));
  t("the crowding LANDED: both hidden projects exist and vera's own project list does not show them",
    [typeof (await shaOf(H1)), typeof (await shaOf(H2)),
     ((parse(await RAW(`op=list&token=${VERA}&limit=1000`)) || {}).bundles || []).some((b) => b.bundle_id === H1 || b.bundle_id === H2)],
    ["string", "string", false]);

  const vAfter = await readQ(VERA), aAfter = await readQ(ADM);
  /* THE WITNESS: a credential the gate does not filter DOES see the crowding — the 70 questions really are shared
     on the ungated table, so the byte-identity below is not an equality that cost nothing. */
  t("the store SAW the crowding: the ADMIN token's queue moved (it can see both hidden projects)",
    sha(aAfter.body) !== sha(aBefore.body), true);
  t("the store SAW the crowding: the ADMIN token's own divergence item is now TRUNCATED, or gone from its page",
    [mine(aBefore).length >= 1, truncOf(aBefore).every((x) => x === false),
     mine(aAfter).length === 0 || truncOf(aAfter).every((x) => x === true)], [true, true, true]);

  const moved = paths(parse(vBefore), parse(vAfter));
  if (moved.length) console.log(`  vera's queue moved at: ${moved.slice(0, 8).join(" | ")}`);
  t("A HIDDEN PROJECT'S CITATIONS MOVE NOTHING: vera's op=queue (status, content type, body, by digest)",
    { status: vAfter.status, type: vAfter.type, sha: sha(vAfter.body) },
    { status: vBefore.status, type: vBefore.type, sha: sha(vBefore.body) });
  t("A HIDDEN PROJECT'S CITATIONS TAKE NO SLOT: her divergence item is still there, and still says NOT truncated",
    [mine(vAfter).length, truncOf(vAfter).every((x) => x === false)], [n0, true]);

  /* ---------------- THE OTHER END OF THE EDGE: a TARGET the caller cannot see (the same sentence).
     A question the caller cannot see is dropped by `#queueSharedInquiry` and mints nothing — but until this landing
     it still spent a slot on the way there. The shape is a PROJECT cited by two bundles the caller can see, which is
     the only target this gate hides, and a `PROJ-` id sorts after every `INQ-` one, so it can only ever be the row
     that tips the page over its cap. That makes the bound the whole observable, and it is why this arm is driven at
     the CAP rather than by a digest: vera's visible candidates are filled to EXACTLY the bound the plane publishes,
     and then one more target is added at each end of the sight rule. */
  const capacity = capOf(vAfter), examined = examinedOf(vAfter);
  const need = capacity - examined;
  console.log(`  vera's visible candidates: ${examined} of a published bound of ${capacity} — ${need} filler questions to reach it`);
  t("the bound is the plane's own published figure and there is room to fill it (floor: 1, and it is not truncated)",
    [capacity > 1, need >= 1, truncOf(vAfter).every((x) => x === false)], [true, true, true]);
  const cFill = Array.from({ length: need }, (_, i) => `INQ-2026-9480-c${String(i + 1).padStart(3, "0")}`);
  /* VA and VB are revised together, so every filler has TWO visible citers and is genuinely shared.
     THE STANCE IS RE-MADE AFTER EVERY REVISION, and the first run of this section is why: `projectMd` writes no
     `current_versions` block, so a revision of VA's bytes DROPS the pointer §7 makes a project's own dated property
     — the divergence then vanishes and every bound below reads `-1` over a feed with no item in it. The act, not a
     hand-authored row, puts it back, which is also the product's own order (`op=versioncurrent`). */
  const reviseVis = async (extra) => {
    /* D-563: each revision states its project's own name — the document's title is the name 7.1 holds unique. */
    for (const [pid, nm, title] of [[VA, "VA", "Vera oversight 9480"], [VB, "VB", "Vera budget 9480"]])
      must(`revise ${nm}`, await promoteAs(ADM, pid, projectMd(pid, [QQ, ...cFill, ...extra], undefined, title), "project", "forming", await shaOf(pid)));
    must("VA stands on the reading again",
         await POST(`op=versioncurrent&token=${VERA}&target=${E(QQ)}&version=v1&project=${E(VA)}`, {}));
  };
  await reviseVis([]);
  const vFull = await readQ(VERA);
  t("THE PAGE IS EXACTLY FULL: vera's visible candidates now equal the published bound, and nothing is truncated",
    [examinedOf(vFull), truncOf(vFull), mine(vFull).length], [capacity, TRUNC(false), n0]);

  await reviseVis([H1]);
  const vHidTarget = await readQ(VERA);
  /* THE COUNT IS ASSERTED BESIDE THE FLAG, AND THE `d480-citers-ungated` CONTROL ARM IS WHY. The first spelling
     of this arm and the one below read `truncOf(...).every((x) => x === false)`, which is TRUE OVER AN EMPTY
     ARRAY — so with the citer half broken, and vera's item pushed off her page entirely, both arms passed over a
     feed that had nothing in it. The arm was right and the declaration was wrong; recorded rather than smoothed,
     and this file's own rule about headline assertions over an empty corpus applied where it was missing. */
  t("A TARGET VERA CANNOT SEE TAKES NO SLOT: citing the hidden project itself leaves her page full and untruncated",
    [mine(vHidTarget).length, examinedOf(vHidTarget), truncOf(vHidTarget)], [n0, capacity, TRUNC(false)]);

  /* STILL LIVE, and it is the arm that stops the target half from being "a target never counts": the SAME act
     against a project she CAN see does tip the page over its bound. */
  const VP = await mintProject("Vera visible target 9480", []);
  must("vera owns VP", await DO("projectclaimowner", { projectId: VP, memberId: "vera" }));
  await reviseVis([H1, VP]);
  const vVisTarget = await readQ(VERA);
  t("STILL LIVE: a target she CAN see DOES take a slot — the same act tips her page past its bound and says so",
    [mine(vVisTarget).length, examinedOf(vVisTarget), truncOf(vVisTarget)], [n0, capacity, TRUNC(true)]);

  /* OVER-STRICTNESS, and it is the arm that stops the whole section from passing over a feed that never moves:
     crowding vera CAN see must still reach her bound. Two projects SHE owns cite 70 fillers of their own. */
  const cites2 = Array.from({ length: FILLERS }, (_, i) => `INQ-2026-9480-b${String(i + 1).padStart(2, "0")}`);
  const VC = await mintProject("Vera crowder 9480 a", cites2);
  const VD = await mintProject("Vera crowder 9480 b", cites2);
  for (const [pid, nm] of [[VC, "VC"], [VD, "VD"]])
    must(`vera owns ${nm}`, await DO("projectclaimowner", { projectId: pid, memberId: "vera" }));
  const vVis = await readQ(VERA);
  t("STILL LIVE: crowding vera CAN see does reach her — her queue moves, and her own question is crowded off "
  + "her page (the same consequence the hidden crowding must NOT have)",
    [sha(vVis.body) !== sha(vVisTarget.body), mine(vVis).length], [true, 0]);
}

/* ======================================================== 11. A READ NAMING A DISCOVERABLE PROJECT'S OWN ID (REC-196) */
console.log("\n--- 11. REC-196 / BOB #32 (a): a read naming a DISCOVERABLE project's own id is answered positionally ---");
{
  /* WHAT WAS WRONG. REC-149 refused every ACT at EXISTENCE positionally (C-70.1) and left every READ that names a
     project by id answering as for a project that does not exist — so the member the directory had just shown a
     project to was told by the record that it does not exist. BOB #32 ruled on 2026-09-23 23:08Z (Membership v2
     §7.14, (a)): *a read naming a discoverable PROJECT'S OWN id is answered POSITIONALLY at EXISTENCE, exactly like
     an act; a read naming anything INSIDE the project answers exactly as it does today; `viewerPredicate` stays
     unchanged.* Measured on the unedited tree through `project-discoverable.test.mjs` §3l: all eleven of its reads
     answered byte-identically to a never-minted id at EXISTENCE.
     HOW A LIAR PASSES, stated before what this checks:
       (1) answer "does not exist" for the project itself (the old answer kept) — 11b demands C-70.1 of every read,
           and the control's `rec196-existence-read-dropped` arm is exactly that;
       (2) answer positionally for EVERYTHING, contents included — 11d reads a RUN inside the project and demands
           the absent answer, byte for byte, and 11e demands a HIDDEN project still absent;
       (3) answer positionally to everybody — 11f demands the owner's real answer from every read;
       (4) cover the reads somebody thought of — 11g sweeps every gated read op into the store's two tables. */
  const TITLE_D = "Discoverable roads project 9196";
  /* CORRECTED at the c22-batch29 union (CONDUCT #22), never exempted: REC-196's fixture named D only in the ENVELOPE,
     over a document titled "Hidden project 9138". Since D-563 promote takes the document's title, so D collided with
     the hidden project's name (NAME_TAKEN). The document now carries TITLE_D itself, and the envelope agrees. */
  const { bundleId: _n, ...c } = pkg(NEVER, projectMd(null, [LEDGER], undefined, TITLE_D), "project", "forming", null, `rec196-${++seq}`);
  const D = must("mint D", await POST(`op=promote&token=${ADM}`, { ...c, meta: { ...c.meta, title: TITLE_D } })).bundleId;
  must("iris owns D", await DO("projectclaimowner", { projectId: D, memberId: "iris" }));
  /* The setting is iris's OWNER's act, taken through the store's INTERNAL door (a viewer never sent is not asked,
     `#rosterInSight`'s precedent) rather than her session — so the `not-found-to-everyone` control arm, which lies
     to every member session, perturbs the SUBJECT and not this fixture (D-447's recorded second-variable trap). */
  must("iris sets D discoverable",
       await DO(`projectvisibilityset?projectId=${E(D)}&setting=discoverable&by=iris&reason=${E("open to all")}`, {}));
  const RUN_D = "RUN-2026-9196-inside", RUN_NEVER = "RUN-2026-9196-never";
  /* NOT `must`: a control arm that hides D from iris refuses this open, and that must fail 11d+ BY NAME rather
     than throw the suite before its foot. */
  const opened = await POST(`op=airunopen&token=${IRIS}`, {
    run: RUN_D, contextType: "project", contextId: D, label: "roads sweep", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude", skillVersion: "investigative-session@1",
    bounds: [{ bound: "fetches", allowed: 20, unit: "requests" }], leaseMs: 600000 });

  /* EVERY READ `Store.PROJECT_NAMING_READS` NAMES THAT A CALLER REACHES AS AN OP, each asked of the id X in the
     parameter the table names. `gatefacts` and `affordancefacts` are store routes: the second is reached through
     `op=affordances`, the first only by `op=ratify`, which is an act and REC-149's. */
  const NAMING = (X) => [
    ["image", `op=image&id=${X}`], ["file", `op=file&id=${X}&path=bundle.md`], ["projection", `op=projection&id=${X}`],
    ["excludedby", `op=excludedby&id=${X}`], ["backlinks", `op=backlinks&target=${X}`],
    ["reevaluations", `op=reevaluations&target=${X}`], ["inquirystrength", `op=inquirystrength&id=${X}`],
    ["earnedbasis", `op=earnedbasis&id=${X}&targets=${LEDGER}`],
    ["partitionindependence", `op=partitionindependence&id=${X}&partition=${E("[]")}`],
    ["narrowcandidates", `op=narrowcandidates&target=${X}&version=v1&ord=0`],
    ["versionnotice", `op=versionnotice&target=${X}`], ["basisversions", `op=basisversions&id=${E(INQ)}&project=${X}`],
    ["versionstrength", `op=versionstrength&id=${E(INQ)}&version=v1&project=${X}`],
    ["strengthbarof", `op=strengthbarof&project=${X}`], ["extractproposals", `op=extractproposals&bundle=${X}`],
    ["capturerequests", `op=capturerequests&target=${X}`], ["tasks", `op=tasks&refers=${X}`],
    ["biasmanifest", `op=biasmanifest&scope=project&scopeId=${X}`],
    ["airuns", `op=airuns&contextType=project&contextId=${X}`], ["casedrafts", `op=casedrafts&project=${X}`],
    ["affordances", `op=affordances&target=${X}`], ["projectownerarith", `op=projectownerarith&projectId=${X}`],
    ["projectvisibility", `op=projectvisibility&projectId=${X}`],
    ["projectparticipants", `op=projectparticipants&projectId=${X}`],
  ];
  const readAll = async (tok, X) => { const o = []; for (const [, q] of NAMING(X)) o.push(await RAW(`${q}&token=${tok}`)); return o; };
  const vD = await readAll(VERA, D);
  console.log(`  corpus: ${NAMING(D).length} reads naming a project by its own id`);
  t("11a: the corpus is not empty (floor: 24 reads)", NAMING(D).length >= 24, true);
  NAMING(D).forEach(([name], i) => { const r = parse(vD[i]);
    t(`11b: AT EXISTENCE, op=${name} naming D's own id answers C-70.1, naming D by its id and name`,
      [codeOf(r), r && r.check, r && r.project, r && r.name], ["PROJECT_SEEN_NOT_A_PARTICIPANT", "C-70.1", D, TITLE_D]); });
  const allowed = ["ok", "reason", "code", "check", "translation", "detail", "project", "name", "store", "tokenClass"];
  t("11c: and each carries NOTHING about D beyond its id and name (no owner, participant, state, run)",
    vD.map((r, i) => [NAMING(D)[i][0], Object.keys(parse(r) || {}).filter((k) => !allowed.includes(k)),
                      /iris|forming|roads sweep|9196-inside/.test(r.body)])
      .filter(([, extra, named]) => extra.length || named), []);

  /* CONTENTS KEEP THE EXISTENCE ANSWER: a run INSIDE D is D's thinking, and its existence is contents. */
  const idless = (body, id) => body.split(id).join("<ID>");
  const inside = await RAW(`op=airun&token=${VERA}&run=${RUN_D}`), never = await RAW(`op=airun&token=${VERA}&run=${RUN_NEVER}`);
  t("11d: INSIDE THE PROJECT: vera's op=airun of the run over D is byte-identical to a run id that names nothing",
    { status: inside.status, sha: sha(idless(inside.body, RUN_D)) }, { status: never.status, sha: sha(idless(never.body, RUN_NEVER)) });
  t("11d+: and that read is not blind — iris reads her own run over D",
    [opened && opened.ok !== false, parse(inside)?.found,
     (({ run, found }) => [run, found])(parse(await RAW(`op=airun&token=${IRIS}&run=${RUN_D}`)) || {})],
    [true, false, [RUN_D, true]]);

  /* A HIDDEN project is untouched by the ruling: P, which vera was never invited to, answers every one of these
     reads byte-identically to a never-minted id. */
  const vP = await readAll(VERA, P), vN = await readAll(VERA, NEVER);
  NAMING(P).forEach(([name], i) => t(`11e: HIDDEN = ABSENT, raw: op=${name} naming hidden P`,
    { status: vP[i].status, sha: sha(idless(vP[i].body, P)) }, { status: vN[i].status, sha: sha(idless(vN[i].body, NEVER)) }));

  /* Those with full sight are unchanged: the owner is never answered positionally by any of them. */
  const iD = await readAll(IRIS, D);
  t("11f: the OWNER is answered by every read (none says C-70.1 to iris)",
    iD.map((r, i) => [NAMING(D)[i][0], codeOf(parse(r))]).filter(([, cd]) => cd === "PROJECT_SEEN_NOT_A_PARTICIPANT"), []);
  t("11f+: and the roster read gives her the real roster", (parse(iD[NAMING(D).findIndex(([n]) => n === "projectparticipants")])
    ?.participants || []).map((p) => p.handle), ["iris"]);

  /* 11g — THE SWEEP, AND IT IS WHAT KEEPS THE TABLE FROM GOING STALE. Every op `index.mjs` marks `mutating: false`
     whose store route reads a parameter of an id-carrying name must be classified in
     EXACTLY ONE of `Store.PROJECT_NAMING_READS` (a bundle id, so it can name a project) or
     `Store.PROJECT_NAMING_READS_NOT` (never a bundle id, with its reason). WHAT THIS CANNOT SEE, stated: a read the
     control plane COMPOSES under a different route name (`affordances` → `affordancefacts` is mapped by hand
     below); a parameter whose name is not in `IDISH`; a route that takes its id from the body under another name.
     Unclassified routes are PRINTED by name, never scored zero.
     THE FIRST SPELLING ALSO DEMANDED THAT THE ROUTE READ `viewer`, AND THE `rec196-table-short` CONTROL ARM FOUND IT
     BLIND: `projectparticipants` reads its viewer ONLY through this item's pre-dispatch check, never in its own route,
     so dropping it from the table passed the sweep. Recorded, not smoothed; the viewer condition is gone, and the
     ungated id-carrying reads are classified too. */
  const src = (f) => readFileSync(join(SRC_DIR, f), "latin1");
  const reads = new Set([...src("index.mjs").matchAll(/^\s+([a-z0-9]+):\s*\{\s*classes:[^}]*mutating:\s*false/gm)].map((m) => m[1]));
  const lines = src("store.mjs").split("\n");
  const at = lines.findIndex((l) => /^      const map = \{/.test(l));
  const routes = {}; let cur = null;
  for (let i = at + 1; i < lines.length && !/^      \};/.test(lines[i]); i++) {
    const m = lines[i].match(/^        ([a-z0-9]+): /);
    if (m) { cur = m[1]; routes[cur] = ""; }
    if (cur) routes[cur] += lines[i];
  }
  const table = (name) => { const m = src("store.mjs").match(new RegExp(`static ${name} = Object\\.freeze\\((\\{[\\s\\S]*?\\})\\);`));
    return m ? Function(`return (${m[1]});`)() : null; };
  const NAMES = table("PROJECT_NAMING_READS"), NOT = table("PROJECT_NAMING_READS_NOT");
  const IDISH = ["id", "target", "projectId", "project", "bundleId", "bundle", "scopeId", "contextId", "address",
                 "run", "case", "draft", "refers", "sha256", "content", "entity"];
  const ALIAS = { affordances: "affordancefacts" };
  const gated = [], unrouted = [];
  for (const op of [...reads].sort()) {
    const route = routes[ALIAS[op] || op];
    if (route === undefined) { unrouted.push(op); continue; }
    const ps = [...route.matchAll(/searchParams\.get\("([a-zA-Z0-9]+)"\)/g)].map((m) => m[1]);
    if (ps.some((p) => IDISH.includes(p))) gated.push(ALIAS[op] || op);
  }
  console.log(`  sweep: ${reads.size} read ops; ${gated.length} routes carry an id-named parameter; `
            + `${unrouted.length} composed in the control plane with no store route of their name (not swept): ${unrouted.join(", ")}`);
  t("11g0: the sweep is not blind (the tables parsed; floors: 20 id-carrying reads, 24 naming reads)",
    [!!NAMES, !!NOT, gated.length >= 20, Object.keys(NAMES || {}).length >= 24], [true, true, true, true]);
  t("11g: every read carrying an id-named parameter is classified (unclassified, by name)",
    gated.filter((r) => !(r in (NAMES || {})) && !(r in (NOT || {}))), []);
  t("11g+: and none is classified twice", Object.keys(NAMES || {}).filter((r) => r in (NOT || {})), []);
  t("11g++: every classified name is a real store route", [...Object.keys(NAMES || {}), ...Object.keys(NOT || {})]
    .filter((r) => routes[r] === undefined), []);
}

/* ======================================================================== §12
 * REC-197 — A CREATION CARRIES ITS SETTING, AND AN OWNERLESS CREATION CANNOT CHOOSE ONE (Membership v2 §7.14,
 * RULED by BOB #32 (b), 2026-09-23: *"create and fork take one optional field, `visibility` (`discoverable` or
 * `hidden`), and an absent one is HIDDEN. A MACHINE credential never sets it … its creation is therefore HIDDEN,
 * and a `visibility=discoverable` it sends is refused by name."*). Driven through the OPS — `op=promote` (the
 * creation: a project bundle with no base) and `op=projectfork` — and read back through `op=projectvisibility`
 * and vera's `op=projectdirectory`, never through the store.
 *
 * HOW A LIAR PASSES THE OBVIOUS TEST, stated before what this checks:
 *   (1) default to DISCOVERABLE. Every arm that SENDS a value still passes. So 12a (the FAIL-CLOSED arm) creates
 *       with the field ABSENT and asks the record — the setting, the history and vera's directory — and 12h asks
 *       the same of a FORK sent without it, whose origin is DISCOVERABLE (so inheritance is a liar too).
 *   (2) ACCEPT the field and record nothing. The answer can still say `discoverable` if it echoes the request;
 *       so 12b reads it back through `op=projectvisibility`'s HISTORY (set_by iris) and vera's directory.
 *   (3) let a machine choose. 12d drives the ADMIN and MEMBER deploy tokens with `discoverable` and demands the
 *       refusal BY NAME (C-97.1) with its canned translation, and that NO project was created.
 *   (4) refuse too much. 12e: a machine's creation with no field, or with `hidden`, still lands, HIDDEN, with no
 *       owner's act recorded (it asked for exactly what an ownerless creation gets).
 * WHAT THIS CANNOT SEE: an internal store caller that promotes a project with `ownerMemberId` it did not get from
 * a session — the control plane's stamp is what makes ownerlessness mean "machine", and REC-79's admission suite
 * owns that stamp. */
{
  const projMd12 = (title) => projectMd(null).replace('title: "Hidden project 9138"', `title: "${title}"`);
  const create12 = (tok, title, vis) => {
    const text = projMd12(title);
    return POST(`op=promote&token=${tok}`, {
      base: null, snapKey: `rec197-${++seq}`,
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
      meta: { ...meta(null, "project", "forming"), title },
      ...(vis === undefined ? {} : { visibility: vis }) });
  };
  const visOf = async (id) => parse(await RAW(`op=projectvisibility&token=${IRIS}&projectId=${E(id)}`));
  const listed = async () => ((parse(await RAW(`op=projectdirectory&token=${VERA}`)) || {}).projects || []).map((p) => p.id);
  const projCount = async () => ((parse(await RAW(`op=list&token=${ADM}&limit=1000`)) || {}).bundles || [])
    .filter((b) => b.object_type === "project").length;

  /* 12a — THE FAIL-CLOSED ARM. */
  const a = must("12a create", await create12(IRIS, "REC-197 absent"));
  const va = await visOf(a.bundleId);
  t("12a: FAIL-CLOSED — a member's creation with NO visibility field is created HIDDEN (answer, setting, no act recorded)",
    [a.visibility, va && va.setting, va && va.recorded, va && va.history && va.history.length], ["hidden", "hidden", false, 0]);
  t("12a+: FAIL-CLOSED — and the uninvited member's directory does not list it", (await listed()).includes(a.bundleId), false);

  /* 12b — the owner's choice, recorded as the owner's act. */
  const b = must("12b create", await create12(IRIS, "REC-197 discoverable", "discoverable"));
  const vb = await visOf(b.bundleId);
  t("12b: a member's creation with visibility=discoverable is DISCOVERABLE, recorded as iris's act",
    [b.visibility, vb && vb.setting, vb && vb.history && vb.history.map((h) => [h.setting, h.set_by])],
    ["discoverable", "discoverable", [["discoverable", "iris"]]]);
  t("12b+: and vera's directory lists it by id and name", (await listed()).includes(b.bundleId), true);

  /* 12c — `hidden` chosen is recorded as chosen. */
  const c = must("12c create", await create12(IRIS, "REC-197 hidden", "hidden"));
  const vc = await visOf(c.bundleId);
  t("12c: visibility=hidden is HIDDEN and recorded as the owner's choice",
    [c.visibility, vc && vc.setting, vc && vc.recorded, vc && vc.history && vc.history.map((h) => h.set_by)],
    ["hidden", "hidden", true, ["iris"]]);

  /* 12d — the machine refusal, by name, and nothing created. */
  for (const [who, tok] of [["ADMIN", ADM], ["MEMBER", MEM]]) {
    const before = await projCount();
    const r = await create12(tok, `REC-197 machine ${who}`, "discoverable");
    t(`12d: a MACHINE credential (${who} token) sending visibility=discoverable is refused BY NAME`,
      [r && r.ok, codeOf(r), r && r.check, typeof (r && r.translation) === "string" && r.translation.length > 40],
      [false, "PROJECT_VISIBILITY_NO_OWNER", "C-97.1", true]);
    /* The count is floored: a list that carried no object_type would count 0 before and after, for free. */
    t(`12d+: and nothing was created (${who}; the count is of a non-empty list)`, [await projCount(), before > 0], [before, true]);
  }

  /* 12e — OVER-STRICTNESS: the machine's creation itself is not refused. */
  const e0 = must("12e absent", await create12(ADM, "REC-197 machine absent"));
  const e1 = must("12e hidden", await create12(ADM, "REC-197 machine hidden", "hidden"));
  const ve0 = parse(await RAW(`op=projectvisibility&token=${ADM}&projectId=${E(e0.bundleId)}`));
  const ve1 = parse(await RAW(`op=projectvisibility&token=${ADM}&projectId=${E(e1.bundleId)}`));
  t("12e: a machine's creation with no field, or with hidden, LANDS HIDDEN with no owner's act recorded",
    [e0.visibility, e1.visibility, ve0 && ve0.recorded, ve1 && ve1.recorded, e0.owner, e1.owner],
    ["hidden", "hidden", false, false, null, null]);

  /* 12f — a value that is not a setting. */
  { const before = await projCount();
    const r = await create12(IRIS, "REC-197 unknown", "Discoverable");
    t("12f: visibility=\"Discoverable\" is not a setting — refused C-70.3 by name, the owner's act's own row",
      [r && r.ok, codeOf(r), r && r.check], [false, "PROJECT_VISIBILITY_UNKNOWN_SETTING", "C-70.3"]);
    t("12f+: and nothing was created (the count is of a non-empty list)", [await projCount(), before > 0], [before, true]); }

  /* 12g — the field on a REVISION is refused, never silently ignored. */
  { const text = projMd12("REC-197 absent").replace("---\n", `---\nid: ${a.bundleId}\n`).replace("A project.", "Revised.");
    const r = await POST(`op=promote&token=${IRIS}`, { bundleId: a.bundleId, base: a.bundleSha, snapKey: `rec197-${++seq}`,
      files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }], register: [],
      meta: { ...meta(a.bundleId, "project", "forming"), title: "REC-197 absent" }, visibility: "discoverable" });
    const v = await visOf(a.bundleId);
    t("12g: visibility on a REVISION is refused by name (C-97.2), and the setting did not move",
      [r && r.ok, codeOf(r), r && r.check, v && v.setting, v && v.recorded],
      [false, "PROJECT_VISIBILITY_NOT_A_CREATION", "C-97.2", "hidden", false]); }

  /* 12h — the FORK: a creation, its forker chooses, it does not inherit. The origin is DISCOVERABLE (b). */
  { const f0 = await POST(`op=projectfork&token=${IRIS}&projectId=${E(b.bundleId)}&title=${E("REC-197 fork absent")}`);
    const v0 = f0 && f0.newId ? await visOf(f0.newId) : null;
    t("12h: FAIL-CLOSED — a fork with NO visibility of a DISCOVERABLE project is HIDDEN (not inherited)",
      [f0 && f0.ok, f0 && f0.visibility, v0 && v0.setting, v0 && v0.recorded], [true, "hidden", "hidden", false]);
    const f1 = await POST(`op=projectfork&token=${IRIS}&projectId=${E(c.bundleId)}&title=${E("REC-197 fork chosen")}&visibility=discoverable`);
    const v1 = f1 && f1.newId ? await visOf(f1.newId) : null;
    t("12h+: a fork with visibility=discoverable of a HIDDEN project is DISCOVERABLE, the forker's act",
      [f1 && f1.ok, f1 && f1.visibility, v1 && v1.history && v1.history.map((h) => [h.setting, h.set_by])],
      [true, "discoverable", [["discoverable", "iris"]]]);
    const f2 = await POST(`op=projectfork&token=${IRIS}&projectId=${E(c.bundleId)}&title=${E("REC-197 fork bad")}&visibility=public`);
    t("12h++: a fork with visibility=public is refused C-70.3 by name", [f2 && f2.ok, codeOf(f2)],
      [false, "PROJECT_VISIBILITY_UNKNOWN_SETTING"]); }

  /* 12i — the owner's act still answers C-70.3 through the shared helper, project echoed as before. */
  { const r = await POST(`op=projectvisibilityset&token=${IRIS}&projectId=${E(c.bundleId)}&setting=public`);
    t("12i: the owner's act with an unknown setting still answers C-70.3, naming its project",
      [r && r.ok, codeOf(r), r && r.check, r && r.project], [false, "PROJECT_VISIBILITY_UNKNOWN_SETTING", "C-70.3", c.bundleId]); }
}

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack || e}`);
  fail++;
} finally {
  await mf.dispose();
}
console.log(`\nproject-sight: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
