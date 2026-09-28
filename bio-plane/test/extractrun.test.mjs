/* NEGATIVE CONTROL: the SIX arms live in `test/nc-sk8.mjs` and are re-run in one step with `node test/nc-sk8.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work in this repository). Declared before arming, every one RUN, results in this file's own RESULTS line and in the item's report. (a) `baseline` — nothing armed; MUST be green, and it is the row that distinguishes all-arms-broken from all-arms-working. (b) `strengthen` — THE ROW'S OWN DECLARED CONTROL, in `src/extractrun.mjs`: `proposalChain` stops routing through `appendStep` and concatenates the step itself (`[...captureChain, step]`), which is exactly how a producer would "simplify" the call. §1's rule-2 arm MUST FAIL — a proposal whose `ai` step claims a cap STRONGER than the capture's chain is no longer refused by TEXT_CHAIN_STRENGTHENS and lands, and the recorded cap silently improves. It is the sharpest arm here because the hazard of this whole capability is output that looks better than its input. (c) `label` — in `src/store.mjs`, delete the `mint:` line from `extractPropose`'s answer, which drops the label from the WRITE while leaving the read's rows labelled. §3's totality arm MUST FAIL NAMING THE SURFACE rather than reporting a count. (d) `bound` — in `src/store.mjs`, `#mintsBound` answers a DEFAULT ALLOWANCE (`{allowed: 1000, consumed: 0}`) instead of null when a run declared none, which is precisely the invented number §7.3 (5) rules out and the shape a builder reaches for to avoid a refusal. §4's unbounded-run arm MUST FAIL: the run with no `mints` bound produces freely, and nothing would ever end it because `finishedBound` fires only on a row with `allowed > 0`. (e) `coverage` — in `src/store.mjs`, make `extractPropose` ALSO write its refs into `reading_refs` (the plausible "why keep two tables" change). §5's arm MUST FAIL: `op=readingref` — the reverse index every earned tier reads — starts answering the machine's proposed reference, which is *counted as extraction coverage*, the one thing §7.3 (6) rules out. (f) `overstrict` — THE OVER-STRICTNESS DIRECTION: `proposedReadingGrade` promotes a NAME-only proposal from C to B, the ordinary way a new grader silently strengthens what the record claims. Three §2 arms MUST FAIL while every MEMBER-side assertion in §5 and §7 STAYS GREEN — the registered reader's reading, its resolution and its earned A are untouched, because this item adds no grade to anything a member wrote. The promotion is chosen at C→B rather than at B→A deliberately: a B→A arm trips `PROPOSAL_ABOVE_CEILING` and refuses the whole batch, which cascades into arms about other properties and stops the failure being attributable. */
/* RETIRED 2026-09-28 (T7, legacy-tests; K220, BOB's B10): ai-runs R40 (C-109.1) opens no extract run while extract is not deployed, so arms (b)–(f) above declared failures on arms this suite has now retired; `nc-sk8.mjs` keeps them, NOT RUN, naming where each property is now driven, and runs `baseline` alone. The figures below are of their day. */
/* RESULTS, 2026-09-14, SK-8's worker, every arm ALONE with the others held open, every restore verified byte-identically by sha256 AND by content with a byte count printed (`src/store.mjs` 2,037,840 B sha256 3ea0f9838833... - `src/extractrun.mjs` 21,251 B sha256 2bf4d8045793...), never `git checkout --`. **RE-RUN IN FULL ON THE COMMITTED TREE, which is the figure that counts: an earlier pass read 61/0 while this suite still stood at 61 assertions, and a control figure one behind its own subject describes a tree nobody has. baseline 62/0 green - strengthen 60/2 (2/2 declared) - label 60/2 (2/2) - bound 61/1 (1/1) - coverage 61/1 (1/1) - overstrict 59/3 (3/3) - ALL SIX AS DECLARED.** ONE ARM CAME BACK WRONG BEFORE IT CAME BACK RIGHT, and the correction went to the SUBJECT rather than to the assertion, which is the finding worth carrying: `overstrict`'s first cut promoted a name-only proposal from C to B and the sentence assertion STAYED GREEN — because `proposedReadingGrade` wrote each branch's LETTER and its REASON as two independent literals, so the record would have published a B explained by *this proposal names only a NAME* and nothing in this repository could have noticed. A grade and the sentence saying what it rests on are exactly the pair this project must never let drift. The function now decides the letter once and interpolates it INTO its own sentence; the assertion was strengthened to read the letter out of the reason; the arm's anchor follows the corrected shape; and all three declared failures then occurred. The arm also DID NOT ARM once in between (patch matched 0×) — reported by the harness as a finding rather than retried, which is what caught the stale anchor. */

/* SK-8 — AI-PROPOSED READINGS, and the FIRST EMISSION of the `ai(function,
 * version)` step this record designed at CPDF-10 and nothing has ever produced.
 *
 * `EXTRACTION-BREADTH-DESIGN.md` §4's THIRD production row is the subject:
 *
 *   *a proposed reading — entities and facts the registered readers did not find
 *    — with an `ai(function)` step in its chain, the DESIGNED step nothing emits
 *    today; a derivation that weakens: the reading's basis is
 *    `ai(function, version)`, its grade earned by what it names (an identifier
 *    in the text earns B as today; a name C); never A; labelled.*
 *
 * AND `BIO_Assistant_and_AI_Roles_v0_1.md` §7.3 is where it RUNS, which is the
 * half D-358 answered and the half this suite drives hardest:
 *
 *   §7.3 (1) the pilot's exclusion is CORRECTED, not lifted — the pilot mints
 *            nothing because it is READ-ONLY, and nothing here widens it.
 *   §7.3 (2) EXTRACT runs in DEC-62's RUN. §6 drives that from four sides: no
 *            run, a closed run, a run in another mode, and a run that exists.
 *   §7.3 (4) the SUBJECT and OBJECTIVE stay the member's — the run is opened by
 *            a signed-in member and the machine credential cannot open one.
 *   §7.3 (5) MINTS ARE A BOUND. §4 drives the bound to exhaustion and watches
 *            the run END on it, naming it.
 *   §7.3 (6) an uncited machine-minted row is a PROPOSAL: never counted as
 *            extraction coverage (§5), and the minted-to-cited ratio is the
 *            instrument that catches manufacturing (§5 again, in both
 *            directions — a ratio that rises when a member cites).
 *
 * WHAT IS DELIBERATELY NOT HERE:
 *   - the MINT DOOR itself is SK-7's (`content-machine-mint`); this suite
 *     asserts only that it is now CALLED and that its label travels.
 *   - the extent grammar and its refusals are REC-82's / REC-85's; C-45.x is
 *     asserted here only as what a refused mint returns VERBATIM.
 *   - THE ASSISTANT'S OWN LOOP IS NOT BUILT AND IS NOT FAKED. No model runs
 *     here. This suite drives the plane through a real minted `ai` credential —
 *     which is what an assistant would hold — inside a run a member opened. What
 *     is absent is the thing that would decide WHAT to propose, and that absence
 *     is reported rather than papered over with a fixture that pretends.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs";               /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { registerDoc, registerFile } from "./register-doc.mjs";
import { EXTRACT_FUNCTIONS, EXTRACT_RUN_MODE, PROPOSED_READING_CEILING,
         proposedReadingGrade, proposalChain, checkProposedRef,
         mintRatio } from "../src/extractrun.mjs";
import { RUN_BOUNDS, runStatusFor } from "../src/airun.mjs";
/* T7 (legacy-tests; K220): ai-runs R40's open refusal row (C-109.1), read from the module that holds it. */
import { AI_RUNS_CHECKS } from "../src/ai-runs/index.mjs";
import { STEP_KINDS } from "../src/textchain.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-sk8", MEMBER_TOKEN: "mem-sk8", PROBE_TOKEN: "prb-sk8", VERSION: "test" },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const post = async (op, body, tok = "mem-sk8") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}`, { method: "POST", body: JSON.stringify(body ?? {}) })).json());
const get = async (op, qs = "", tok = "mem-sk8") => rP(await (await mf.dispatchFetch(
  `http://x/api/?op=${op}&token=${tok}&${qs}`)).json());

try {

const NOW = "2026-09-14T00:00:00Z", LATER = "2026-09-14T01:00:00Z";

/* ---------------------------------------------------------------- members */
const session = async (memberId, role, caps = ["contribute", "create_projects"]) => {
  const add = await post("memberadd", { memberId, cover: `cover for ${memberId}`, role,
                                        capabilities: caps }, "adm-sk8");
  const en = await post("enroll", { invite: add.invite, handle: memberId,
                                    password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en).slice(0, 300)}`);
  const lg = await post("login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg).slice(0, 300)}`);
  return lg.token;
};
const RUTH = await session("ruth", "admin", ["contribute", "publish", "create_projects"]);
const IRA = await session("ira", "admin");

/* -------------------------------------------------------------- documents */
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting", "source_status: unchanged",
  "source:", "  locator: in hand", "  authority: synthetic", `  retrieved: ${NOW}`,
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`,
      `    role: ${l.role ?? "supports"}`,
      ...(l.kind ? [`    extent_kind: ${l.kind}`] : []),
      ...(l.page !== undefined ? [`    extent_page: ${l.page}`] : []),
      ...(l.rect ? [`    extent_rect: [${l.rect.join(", ")}]`] : []),
      ...(l.eref ? [`    extent_ref: "${l.eref}"`] : [])])]
  : [];

const inquiryMd = (id, { subject = null, refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "What does ${id} rest on?"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland",
  ...(refs.length ? ["references:", ...refs.flatMap((x) => [`  - target: ${x}`,
      "    rel: cites", "    status: confirmed"])] : ["references: []"]),
  "state_history: []", "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  /* CORRECTED 2026-09-23 by REC-179 (C-66.5): this template said `surfaced_by: agent`, but its questions are created by a member SESSION, which D-78 restamps `human` — so every later revision re-sending the template RELABELLED the question `agent`, the defect REC-179 closes (a revision now carries the value forward or is refused SURFACED_BY_REWRITTEN). The template now says what the record holds. */
  "visuals: []", "surfaced_by: human", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...(subject ? [`subject_entity: ${subject}`] : []),
  ...legLines(legs),
  "---", "",
  "## Question", "", `What does ${id} rest on?`, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

let snapSeq = 0;
const HEAD = new Map();
const promote = async (id, text, type, { register = [], reading = null, tok = RUTH } = {}) => {
  const files = [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }];
  if (reading) {
    /* T4 (legacy-tests; provenance K121): the reading carrier completed to C-18.1's intake shape, which is now
       refused at the write, naming the capture the promotion's own register entry holds, and that capture carried
       in the bundle's files (`register-doc.mjs`). */
    const doc = registerDoc(reading, { file: register[0]?.path });
    const prov = JSON.stringify({ documents: [doc] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
    files.push(registerFile(doc));
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260914T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland",
            current_state: type === "inquiry" ? "open" : "collected",
            created: NOW, last_updated: LATER },
    files, register }, tok);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  HEAD.set(id, r.bundleSha);
  return r;
};

/* A D-252 SCOPED chain, so the capture has a PAGE SET the record can see, and —
   the part this suite needs — a MEASURED cap of C. Every arm about rule 2 is
   about a step trying to claim something stronger than this C. */
const CHAIN = [
  { step: "pixels", extent: { kind: "pages", pages: [0, 1, 2] } },
  { step: "ocr", engine: "tesseract", version: "5.3.4", cap: "C",
    confidence: { basis: "none" }, extent: { kind: "pages", pages: [0, 1, 2] } },
];
const SHA_DOC = sha("sk8-the-document-the-assistant-read");
const DOC = "INFO-2026-8800-proposed";
const INQ = "INQ-2026-8801-proposed";

console.log("\n=== 0. THE GROUND: a captured, READ document, a member's run, a machine's credential ===");

const eOrd = await post("entitycreate",
  { kind: "ordinance", label: "Sewer Fund Transfer Ordinance", aliases: ["ordinance:24680"] }, RUTH);
const ORD = eOrd.entity_id;
t("a subject entity is registered", /^ENT-/.test(ORD || ""), true);

/* THE REGISTERED READER'S OWN READING — one reference, which the recogniser
   matches at A. Everything the machine proposes below is something this reading
   DID NOT FIND, which is §4's table in one word: *entities and facts the
   registered readers did not find*. */
await promote(DOC, infoMd(DOC), "information", {
  reading: { capture: { sha256: SHA_DOC, encoding: "binary", bytes: 10 },
             reading: { content_type: "meeting_calendar", reader_version: 1, found: true, at: NOW,
                        entities: [{ ref: "ordinance:24680", kind: "ordinance", key: "24680",
                                     label: "Ordinance No. 24680" }],
                        facts: {}, text_source: CHAIN } },
  register: [{ path: "snapshots/d.bin", sha256: SHA_DOC, encoding: "binary", bytes: 10 }] });
const rr = await post("resolve", { captureSha: SHA_DOC }, RUTH);
t("the registered reader found ONE reference and the recogniser matched it at A — the member-side "
+ "reading this item must leave untouched",
  [rr.resolved_count, rr.resolved[0].grade], [1, "A"]);
const READING_BEFORE = await get("reading", `sha256=${SHA_DOC}`, RUTH);
const READING_BEFORE_REFS = (READING_BEFORE.reading?.entities || []).map((e) => e.ref).sort();
t("and the reading carries exactly that one reference", READING_BEFORE_REFS, ["ordinance:24680"]);

/* THE INQUIRY THE RUN IS ABOUT, PROMOTED NOW AND WITH NO LEGS YET. It exists
   before the run opens because `op=airun`'s gate is `#bundleGate` on
   `context_id` (D-15) — a run whose context bundle does not exist is invisible
   to every run read, and asserting the run's budget would then be asserting
   nothing. §5 re-promotes it WITH the leg that cites the machine's passage. */
await promote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC] }), "inquiry");

/* THE CREDENTIAL AN ASSISTANT WOULD HOLD, and the SCOPE IT DECLARES IS THE
   PRODUCTION OP — not `contentmint`. That is §7.3 (2) visible in a credential:
   the machine reaches the mint door THROUGH the run's act, so the act a member
   authorises is the production, and the mint happens inside it under the run's
   bound. */
const mintCred = async (writes, tokenId) => post("aicredentialmint",
  { tokenId, principalKind: "member", principalMember: "ruth", taskScope: "extract",
    writes, note: `the EXTRACT agent: proposes readings, ${writes.join(" + ") || "reads only"}` }, RUTH);
const EXTRACTOR = await mintCred(["extractpropose"], "extractor");
t("a member mints an `ai` credential whose declared scope is the EXTRACT production and nothing "
+ "else — not the mint door, which it reaches only through the run",
  [EXTRACTOR.ok, EXTRACTOR.credential.writes, EXTRACTOR.credential.principal],
  [true, ["extractpropose"], "member:ruth"]);
const AK = EXTRACTOR.token;

/* THE RUN, OPENED BY A MEMBER. §7.3 (4): the subject and the objective are the
   member's and a run begins on a member's act. The `mints` bound is declared
   HERE, by the member, which is §7.3 (5) — the budget is part of what the
   member authorises rather than a number the plane invents.
   RE-PINNED 2026-09-28 (T7, legacy-tests; K220, BOB's B10): ai-runs R40 (C-109.1)
   refuses to OPEN a run in a mode the one deployment order has not deployed, and
   `extract` is not deployed (`DEPLOYED_MODES` is ["check"] until its verification
   is recorded) — approved behaviour. So the member's open is now asserted REFUSED,
   by its code and check, with nothing written; every arm below that needed this run
   to produce under is RETIRED to run-productions' and extraction's own tests, named
   at each. The arms that still reach their claim without an extract run are kept. */
const RUN = "RUN-2026-0914-extract";
const started = await post("airunopen", {
  run: RUN, contextType: "inquiry", contextId: INQ,
  label: "sewer fund — find the passages on point", mode: EXTRACT_RUN_MODE,
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null,
  bounds: [{ bound: "mints", allowed: 3, unit: "passages" },
           { bound: "fetches", allowed: 10, unit: "requests" }],
  leaseMs: 600000, at: NOW }, RUTH);
const MODE_ROW = AI_RUNS_CHECKS.AI_RUN_MODE_NOT_DEPLOYED;
t("A MEMBER'S EXTRACT RUN IS REFUSED AT THE OPEN WHILE EXTRACT IS NOT DEPLOYED — ai-runs R40, "
+ "AI_RUN_MODE_NOT_DEPLOYED, C-109.1, with its translation and the deployed modes named",
  [started.started, started.code, started.check, started.translation, started.mode,
   (started.deployed || []).includes(EXTRACT_RUN_MODE), (started.deployed || []).includes("check")],
  [false, "AI_RUN_MODE_NOT_DEPLOYED", "C-109.1", MODE_ROW?.translation, EXTRACT_RUN_MODE, false, true]);
t("and NOTHING WAS WRITTEN: the refused run is absent from `op=airun` and has no log",
  [(await get("airun", `run=${RUN}`, RUTH))?.session ?? null,
   ((await get("airunlog", `run=${RUN}&limit=500`, RUTH))?.entries || []).length],
  [null, 0]);
t("`mints` is a bound in the table the run already has, and the plane classifies a run that ends "
+ "on it as STOPPED — no new vocabulary, which was §7.3 (5)'s own test",
  [Object.prototype.hasOwnProperty.call(RUN_BOUNDS, "mints"), runStatusFor("mints")],
  [true, "stopped"]);

/* ============ 1. THE STEP, EMITTED FOR THE FIRST TIME, AND RULE 2 ========= */

console.log("\n=== 1. the `ai(function, version)` step: EMITTED, and it WEAKENS — never strengthens ===");

t("the step kind was DESIGNED at CPDF-10 and is a DERIVATION, which is what makes rule 2 apply "
+ "to it at all",
  [STEP_KINDS.ai?.role, Object.keys(EXTRACT_FUNCTIONS)], ["derivation", ["propose-reading"]]);

/* RETIRED 2026-09-28 (T7, legacy-tests; K220, BOB's B10) — no extract run opens, so no production lands. Each arm, and
   the test that covers it:
   - "THE EXTRACT RUN PROPOSES A READING AND THE ACT LANDS", "the proposal's basis is the capture's own chain with ONE
     `ai` step appended", "and the chain's derivation cap is UNCHANGED at the capture's C": run-productions
     `test/m/run-productions/extract.test.mjs` "R11: success writes one proposed reading per reference in one
     transaction, with the run, the proposer stamp, the chain with ai(fn, version) and its cap, and earned B or C
     computed", and extraction `test/m/extraction/rules.test.mjs` "R43 R44: proposalChain appends ai(fn, version)
     through appendStep, refusing no capture chain and a cap that is not a grade, an absent cap undetermined; …".
   - "the whole chain says what happened" (describeChain's sentence over the op's chain): no op-level cover; the
     sentence is textchain's and the chain it reads is R43's.
   - "A STEP CLAIMING A CAP STRONGER THAN ITS INPUT IS REFUSED BY NAME" and "and the refusal says WHY": extract.test.mjs
     "R10, R13: refusals in order, …" (`cap: "A"` -> TEXT_CHAIN_STRENGTHENS, check C-35.6) and rules.test.mjs "R43 R44: …"
     (appendStep's refusal returned); the refusal's sentence itself is not asserted there.
   - "a WEAKER cap is accepted": rules.test.mjs "R43 R44: …" asserts only the absent cap; not covered at the op.
   - "a step naming NO function … UNKNOWN_FUNCTION", "and a function with no VERSION is refused": rules.test.mjs "R41:
     the EXTRACT role's vocabulary: its run mode, the functions something emits, and the refusals of an unknown
     function and a missing version", and extract.test.mjs "R10, R13: …" (`fn: "invent"` -> UNKNOWN_FUNCTION). */

/* ================== 2. GRADED BY WHAT IT NAMES, NEVER A ================= */

console.log("\n=== 2. graded by what it NAMES: an identifier earns B, a name earns C, never A ===");

/* RETIRED 2026-09-28 (T7, legacy-tests; K220): "the proposal naming an identifier … earns B", "the proposal naming
   only a NAME earns C" and "and each row SAYS what it earned AND the letter it earned" — extract.test.mjs "R11: …"
   (earned B for a kind and key, C for a name) and rules.test.mjs "R42 R44: a proposed reading's grade is computed,
   never taken: kind and key B, a label alone C, nothing null, the sentence from the letter; …". */
t(`no proposal may reach A — the ceiling is ${PROPOSED_READING_CEILING} and it is a property of the `
+ "grader, not a filter applied afterwards",
  [PROPOSED_READING_CEILING,
   proposedReadingGrade({ refKind: "contract", refKey: "C-1", label: "anything" }).grade,
   proposedReadingGrade({ label: "a name" }).grade,
   proposedReadingGrade({}).grade],
  ["B", "B", "C", null]);
/* RETIRED 2026-09-28 (T7, legacy-tests; K220): "A CALLER OFFERING ITS OWN GRADE IS REFUSED BY NAME", "a proposal naming
   NEITHER an identifier nor a name is refused" and "the refusal names the ORDINAL of the entry it refused" —
   rules.test.mjs "R42 R44: …" (GRADE_OFFERED, PROPOSAL_NAMES_NOTHING) and extract.test.mjs "R10, R13: …" (GRADE_OFFERED
   at_index 1, the batch refused whole: nothing written on any). */

/* ====================== 3. LABELLED, ON EVERY SURFACE =================== */

console.log("\n=== 3. labelled as machine work on EVERY surface that can emit one ===");

/* RETIRED 2026-09-28 (T7, legacy-tests; K220): the totality walk "EVERY proposed-reading row on EVERY surface carries
   the plane's own machine-work label", its floor "and the corpus is NOT EMPTY", "the label is the plane's own
   PREDICATE", "and the write's answer says … these are proposals and not coverage" and "the CONTENT ROW the run minted
   is labelled by the SAME helper" — with no production there is no row to label. extract.test.mjs "R11: success
   writes …" (the answer's `mint.machine_work` and `says`), "R11: a reference with a position is minted as a content
   row by content, labelled machine work; …" and "R12: neither run nor bundle is EXTRACT_NO_SCOPE; the list is newest
   first, …, each labelled a machine's proposal" (every listed row's `mint.machine_work` and sentence). */

/* ========================= 4. MINTS ARE A BOUND ========================= */

console.log("\n=== 4. §7.3 (5): mints are a BOUND on the run, in the table the run already has ===");

/* RETIRED 2026-09-28 (T7, legacy-tests; K220): every arm here produced under the extract run. "the run's own bounds
   table carries the consumption" and "a proposal with NO position mints nothing and spends nothing": extract.test.mjs
   "R11: a reference with a position is minted …; mints is consumed through ai-runs by the rows newly minted and by
   nothing else; a refused mint is recorded, never dropped, and spends nothing". "a batch that would take the run PAST
   its allowance is refused WHOLE", "AND THE NEXT PRODUCTION IS REFUSED BY THE BOUND" and "A RUN THAT DECLARES NO
   `mints` BOUND MAY NOT PRODUCE": extract.test.mjs "R10, R13: …" (MINTS_BOUND_WOULD_EXCEED with allowed/consumed/
   would_mint, MINTS_BOUND_REACHED, NO_MINTS_BOUND for no bound and for a zero one). "the last mint inside the
   allowance LANDS", "`op=airun` publishes it in the run's `budget`", "AND THE RUN ITSELF ENDS ON IT" and "the ended run
   NAMES the bound": not covered by run-productions' tests (the run's budget and ending are ai-runs'); an extract run
   cannot exist to end on `mints` until extract deploys. */

/* ============ 5. NEVER COVERAGE, AND THE MINTED-TO-CITED RATIO ========== */

console.log("\n=== 5. §7.3 (6): an uncited machine-minted row is a PROPOSAL — never coverage ===");

const READING_AFTER = await get("reading", `sha256=${SHA_DOC}`, RUTH);
/* RE-PINNED 2026-09-28 (T7, legacy-tests; K220): the label said "Six proposals later"; none can land now (§0), so the
   member-side arms of §5 hold what they held, over no machine proposal. */
t("THE REGISTERED READER'S READING IS BYTE-FOR-BYTE WHAT IT WAS after everything above — the thing "
+ "every coverage question reads is unmoved — the separation is STRUCTURAL and not a predicate "
+ "somebody has to remember to apply",
  JSON.stringify(READING_AFTER.reading) === JSON.stringify(READING_BEFORE.reading), true);
t("and `op=readingref` — the reverse index every earned tier reads — does not answer the "
+ "machine's reference, while it still answers the reader's own",
  [((await get("readingref", "ref=contract:C-11940", RUTH)).documents || []).length,
   ((await get("readingref", "ref=ordinance:24680", RUTH)).documents || []).length],
  [0, 1]);
t("the recogniser's own answer for the document is unchanged: one resolution, at A",
  await (async () => {
    const res = await get("resolutions", `sha256=${SHA_DOC}`, RUTH);
    return [(res.resolutions || []).length, (res.resolutions || [])[0]?.grade ?? null];
  })(),
  [1, "A"]);

/* RETIRED 2026-09-28 (T7, legacy-tests; K220): "with nothing cited, the ratio is 0 of the passages the machine marked"
   and "A MEMBER CITES ONE OF THE PASSAGES AND THE RATIO RISES" — extract.test.mjs "R12: the minted-to-cited ratio is
   over the machine-minted content rows of the scope's documents the viewer may see (at most 64), a row cited when a
   member's leg or version leg names it; …" (0 -> 2 of 3 as legs cite). "and the member's leg landed on the MACHINE's
   row rather than minting a second one" — no op-level cover (content's id-by-content is content's; R12 inserts the
   leg's content_id directly). */
t("zero MINTED is not a ratio of zero and does not read as one: an absence answers null and says "
+ "which case it is, because the healthiest-looking number must not mean two opposite things",
  [mintRatio({ minted: 0, cited: 0 }).ratio, /nothing to measure/.test(mintRatio({}).says)],
  [null, true]);

/* A MEMBER CITES THE DOCUMENT, at the page the machine would have proposed — a member's act, kept so §7's member-side
   arm reads a question that rests on the document. */
await promote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC],
  legs: [{ target: DOC },
         { target: DOC, kind: "pdf-page", page: 1, eref: "page 2, the transfer table" }] }), "inquiry");

/* ================ 6. THE RUN IS THE ONLY PLACE IT RUNS ================= */

console.log("\n=== 6. §7.3 (2) and (4): it runs in the RUN, and the run is a MEMBER's act ===");

/* KEPT: the two refusals that answer BEFORE any run is read still reach their claim with no extract run open. The
   third row ("inside the run this suite has already ended", RUN_NOT_RUNNING) is RETIRED 2026-09-28 (T7, legacy-tests;
   K220): the run never opened, so it answers NO_SUCH_RUN — extract.test.mjs "R10, R13: …" (RUN-ENDED ->
   RUN_NOT_RUNNING). */
for (const [body, reason, why] of [
  [{ bundleId: DOC, fn: "propose-reading", version: "0.1.0" },
   "NO_RUN", "with no run named at all"],
  [{ run: "RUN-nobody-opened", bundleId: DOC, fn: "propose-reading", version: "0.1.0" },
   "NO_SUCH_RUN", "naming a run nobody opened"],
]) {
  const r = await post("extractpropose",
    { ...body, refs: [{ ref: "n:1", refKind: "n", refKey: "1" }] }, AK);
  t(`a production ${why} is refused by name`, [r.ok, r.reason], [false, reason]);
}
t("and the refusal for an absent run SAYS that a run begins on a member's act — the sentence "
+ "DEC-24 rule 2 is, written where a machine meets it",
  /A run begins on a MEMBER's act/.test(
    (await post("extractpropose", { run: "RUN-nobody-opened", bundleId: DOC, fn: "propose-reading",
                                    version: "0.1.0", refs: [{ ref: "n:1", refKind: "n", refKey: "1" }] },
                AK)).detail || ""),
  true);

/* A RUN IN ANOTHER MODE. `check` is the deployed investigative mode; its run is
   a perfectly good run and it may not produce readings, because a run's mode is
   one of the conditions it was formed under. KEPT: a check run still opens. */
const CHECKRUN = "RUN-2026-0914-check";
const checkOpened = await post("airunopen", {
  run: CHECKRUN, contextType: "inquiry", contextId: INQ, mode: "check",
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1",
  bounds: [{ bound: "mints", allowed: 5, unit: "passages" }],
  leaseMs: 600000, at: NOW }, RUTH);
t("A RUN IN ANOTHER MODE MAY NOT PRODUCE A READING even with a mints bound declared — a run's "
+ "mode is a condition it was formed under and is read back, never widened by the work",
  await (async () => {
    const r = await post("extractpropose",
      { run: CHECKRUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "c:1", refKind: "c", refKey: "1" }] }, AK);
    /* 2026-09-28 (T7, K220): the check run's own open is asserted beside the refusal, so the arm cannot pass over a
       run that never opened (it would then read NO_SUCH_RUN, not NOT_AN_EXTRACT_RUN — but say it). */
    return [checkOpened.started, r.ok, r.reason, r.mode];
  })(),
  [true, false, "NOT_AN_EXTRACT_RUN", "check"]);
t("THE MACHINE CREDENTIAL CANNOT OPEN A RUN — §7.3 (4) at the door rather than in a sentence: the "
+ "subject and the objective stay the member's",
  /* RE-PINNED 2026-09-28 (T7, legacy-tests; K220): the machine's open asked for `extract`, which ai-runs R40 now
     refuses for ANY opener, so the arm would pass on the mode alone. It asks for the DEPLOYED mode, so what refuses it
     is the credential; and it still asserts no run exists after. */
  await (async () => {
    const r = await post("airunopen",
      { run: "RUN-machine-opened", contextType: "inquiry", contextId: INQ, mode: "check",
        principalClaude: "project", skillVersion: "investigative-session@1",
        bounds: [{ bound: "mints", allowed: 1 }], at: NOW }, AK);
    const after = (await get("airun", "run=RUN-machine-opened", RUTH))?.session ?? null;
    return [r.ok !== true && r.started !== true, r.code === "AI_RUN_MODE_NOT_DEPLOYED", after];
  })(),
  [true, false, null]);
t("and a credential whose member declared NO writes cannot produce at all — FL-6's cascade doing "
+ "its job at a new verb, driven rather than assumed from the class",
  /* RE-PINNED 2026-09-28 (T7, legacy-tests; K220): this arm produced under RUN, which no longer opens, so any
     credential would be refused (NO_SUCH_RUN). It produces under the CHECK run, whose production a credential WITH the
     write reaches (NOT_AN_EXTRACT_RUN, the arm above), and asserts the no-writes credential never reaches that door. */
  await (async () => {
    const READER = await mintCred([], "reader-only");
    const r = await post("extractpropose",
      { run: CHECKRUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "r:1", refKind: "r", refKey: "1" }] }, READER.token);
    return [r.ok !== true, (r.reason ?? r.code) !== "NOT_AN_EXTRACT_RUN"];
  })(),
  [true, true]);

/* ===================== 7. OVER-STRICTNESS, AND THE HONEST EDGES ========= */

console.log("\n=== 7. the other direction: what this item must NOT have touched ===");

t("a MEMBER's own basis leg still earns its capture-axis grade from the capture, untouched by "
+ "anything a machine proposed about the same document",
  await (async () => {
    const eb = await get("earnedbasis", `id=${INQ}`, RUTH);
    return eb.ok !== false;
  })(),
  true);
t("`op=extractproposals` refuses an UNSCOPED listing — an enumeration of every proposal in the "
+ "record would be a scan and a number nobody can act on",
  /* RE-PINNED 2026-09-28 (LEGACY-TESTS #4): RUN-PRODUCTIONS #1's R13 (K163, LEGACY-CHECKS #2 REPORT 2) mints
     this refusal as `EXTRACT_NO_SCOPE`, a C-104 row of its own, in place of the bare `NO_SCOPE`. */
  (await get("extractproposals", "", RUTH)).reason, "EXTRACT_NO_SCOPE");

/* RETIRED 2026-09-28 (T7, legacy-tests; K220) — each needed an extract run to produce under:
   - "the read's bound is PUBLISHED and not silent" (a bite of 1 over more than one proposal): extract.test.mjs "R12:
     neither run nor bundle is EXTRACT_NO_SCOPE; the list is newest first, limit clamped to [1, 500], 100 by default,
     with truncated, …".
   - "a proposal whose POSITION cannot be read in IC-1's vocabulary is refused": rules.test.mjs "R42 R44: …"
     (PROPOSAL_POSITION).
   - "A MINT REFUSED BY THE CONTAINER'S OWN EXTENT DOES NOT REFUSE THE PROPOSAL": extract.test.mjs "R11: a reference
     with a position is minted …; a refused mint is recorded, never dropped, and spends nothing"
     (CONTENT_EXTENT_OUT_OF_RANGE, C-45.1, the proposal kept).
   - "a document the record holds no bytes of, and an object that is not a document, are refused as DIFFERENT facts":
     extract.test.mjs "R10, R13: …" (NOT_A_DOCUMENT, NO_SUCH_BUNDLE, NO_BYTES_HELD).
   - "an EMPTY proposal is refused and sent where it belongs": extract.test.mjs "R10, R13: …" (NO_PROPOSALS); its
     sentence ("belongs in the run's log") is not asserted there.
   - "a member who was never invited may not learn a document exists by proposing a reading of it": extract.test.mjs
     "R10, R13: …" (a bundle the viewer cannot see answers NO_SUCH_BUNDLE exactly as an absent one but for the id; a
     run another principal holds -> AI_RUN_NOT_PRINCIPAL). */

/* THE MODULE'S OWN PREDICATES, driven directly so a refusal that the op path
   cannot reach is still measured. `PROPOSAL_ABOVE_CEILING` is unreachable from
   `proposedReadingGrade` today by construction, and is kept as a refusal rather
   than a comment so that widening the grade rule meets something that fires. */
t("the ceiling is a REFUSAL and not a comment: it is driven directly, because the day somebody "
+ "widens the grade rule it must be a thing that fires rather than a sentence to re-read",
  [checkProposedRef({ ref: "x:1", refKind: "x", refKey: "1" }),
   proposalChain(CHAIN, { fn: "propose-reading", version: "1", cap: "Z" }).reason],
  [null, "CAP_NOT_A_GRADE"]);
t("and a capture with NO chain cannot be proposed over: there is nothing for an `ai` step to "
+ "extend, and a derivation of text with no stated provenance rests on nothing",
  proposalChain(null, { fn: "propose-reading", version: "1" }).reason, "NO_CAPTURE_CHAIN");
/* RETIRED 2026-09-28 (T7, legacy-tests; K220): "the module's cap computation agrees with textchain's, asked about the
   chain this suite built" — the suite builds no chain through the op now; extract.test.mjs "R11: success writes …"
   (the answer's cap C from the chain) and rules.test.mjs "R43 R44: …". */

} catch (e) {
  console.log(`  FAIL  the suite threw before its foot: ${e && e.stack ? e.stack.slice(0, 900) : e}`);
  fail += 1;
} finally {
  /* `hygiene.test.mjs` holds every suite to this: a Miniflare instance that is
     never disposed leaves a workerd process behind, and a battery that leaks one
     per suite is how a machine comes to look busy with nothing running. */
  await mf.dispose();
}

/* THE FOOT. A TypeError inside an assertion goes through no assertion at all and
   ends the module while the tally reads clean, so this line existing at all is
   part of what the count means (WORKER.md's receipt; this suite's own
   `overstrict` arm is the reason every `mint` and `byRef` read above is
   optional-chained). */
console.log(`\n  ${pass} pass, ${fail} fail`);
process.exit(fail === 0 ? 0 : 1);
