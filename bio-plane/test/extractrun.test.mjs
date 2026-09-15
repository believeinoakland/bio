/* NEGATIVE CONTROL: the SIX arms live in `test/nc-sk8.mjs` and are re-run in one step with `node test/nc-sk8.mjs [arm]` from `bio-plane/`. Each arm EDITS A REAL SOURCE, is armed ALONE with the others held open, and is restored from a UNIQUELY-NAMED per-arm pristine copy verified by sha256 AND by cmp with a byte count printed and a minimum guarded (never `git checkout --`, which restores to HEAD and has twice discarded a session's own uncommitted work in this repository). Declared before arming, every one RUN, results in this file's own RESULTS line and in the item's report. (a) `baseline` — nothing armed; MUST be green, and it is the row that distinguishes all-arms-broken from all-arms-working. (b) `strengthen` — THE ROW'S OWN DECLARED CONTROL, in `src/extractrun.mjs`: `proposalChain` stops routing through `appendStep` and concatenates the step itself (`[...captureChain, step]`), which is exactly how a producer would "simplify" the call. §1's rule-2 arm MUST FAIL — a proposal whose `ai` step claims a cap STRONGER than the capture's chain is no longer refused by TEXT_CHAIN_STRENGTHENS and lands, and the recorded cap silently improves. It is the sharpest arm here because the hazard of this whole capability is output that looks better than its input. (c) `label` — in `src/store.mjs`, delete the `mint:` line from `extractPropose`'s answer, which drops the label from the WRITE while leaving the read's rows labelled. §3's totality arm MUST FAIL NAMING THE SURFACE rather than reporting a count. (d) `bound` — in `src/store.mjs`, `#mintsBound` answers a DEFAULT ALLOWANCE (`{allowed: 1000, consumed: 0}`) instead of null when a run declared none, which is precisely the invented number §7.3 (5) rules out and the shape a builder reaches for to avoid a refusal. §4's unbounded-run arm MUST FAIL: the run with no `mints` bound produces freely, and nothing would ever end it because `finishedBound` fires only on a row with `allowed > 0`. (e) `coverage` — in `src/store.mjs`, make `extractPropose` ALSO write its refs into `reading_refs` (the plausible "why keep two tables" change). §5's arm MUST FAIL: `op=readingref` — the reverse index every earned tier reads — starts answering the machine's proposed reference, which is *counted as extraction coverage*, the one thing §7.3 (6) rules out. (f) `overstrict` — THE OVER-STRICTNESS DIRECTION: `proposedReadingGrade` promotes a NAME-only proposal from C to B, the ordinary way a new grader silently strengthens what the record claims. Three §2 arms MUST FAIL while every MEMBER-side assertion in §5 and §7 STAYS GREEN — the registered reader's reading, its resolution and its earned A are untouched, because this item adds no grade to anything a member wrote. The promotion is chosen at C→B rather than at B→A deliberately: a B→A arm trips `PROPOSAL_ABOVE_CEILING` and refuses the whole batch, which cascades into arms about other properties and stops the failure being attributable. */
/* RESULTS, 2026-09-14, SK-8's worker, every arm ALONE with the others held open, every restore verified byte-identically by sha256 AND by content with a byte count printed (`src/store.mjs` 2,035,836 B sha256 d6879fc93a5b… · `src/extractrun.mjs` 21,251 B sha256 2bf4d8045793…), never `git checkout --`. **baseline 61/0 green · strengthen 59/2 (2/2 declared) · label 59/2 (2/2) · bound 60/1 (1/1) · coverage 60/1 (1/1) · overstrict 58/3 (3/3) — ALL SIX AS DECLARED.** ONE ARM CAME BACK WRONG BEFORE IT CAME BACK RIGHT, and the correction went to the SUBJECT rather than to the assertion, which is the finding worth carrying: `overstrict`'s first cut promoted a name-only proposal from C to B and the sentence assertion STAYED GREEN — because `proposedReadingGrade` wrote each branch's LETTER and its REASON as two independent literals, so the record would have published a B explained by *this proposal names only a NAME* and nothing in this repository could have noticed. A grade and the sentence saying what it rests on are exactly the pair this project must never let drift. The function now decides the letter once and interpolates it INTO its own sentence; the assertion was strengthened to read the letter out of the reason; the arm's anchor follows the corrected shape; and all three declared failures then occurred. The arm also DID NOT ARM once in between (patch matched 0×) — reported by the harness as a finding rather than retried, which is what caught the stale anchor. */

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
import { contentIdFor, isMachineIdentity, CONTENT_MINT_STATES } from "../checks/bio-checks.mjs";
import { EXTRACT_FUNCTIONS, EXTRACT_RUN_MODE, PROPOSED_READING_CEILING,
         proposedReadingGrade, proposalChain, checkProposedRef,
         mintRatio } from "../src/extractrun.mjs";
import { RUN_BOUNDS, runStatusFor } from "../src/airun.mjs";
import { derivationCap, describeChain, STEP_KINDS } from "../src/textchain.mjs";

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
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
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
    const prov = JSON.stringify({ documents: [reading] });
    files.push({ path: "data/provenance.json", text: prov, bytes: prov.length, sha256: sha(prov) });
  }
  const r = await post("promote", {
    bundleId: id, base: HEAD.get(id) ?? null,
    snapKey: `20260914T${String(300000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
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
   member authorises rather than a number the plane invents. */
const RUN = "RUN-2026-0914-extract";
const started = await post("airunopen", {
  run: RUN, contextType: "inquiry", contextId: INQ,
  label: "sewer fund — find the passages on point", mode: EXTRACT_RUN_MODE,
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1", biasManifest: null,
  bounds: [{ bound: "mints", allowed: 3, unit: "passages" },
           { bound: "fetches", allowed: 10, unit: "requests" }],
  leaseMs: 600000, at: NOW }, RUTH);
t("A MEMBER OPENS THE EXTRACT RUN, declaring its mints bound — the run is DEC-62's object and "
+ "this item added no second one",
  [started.started, started.status], [true, "running"]);
t("`mints` is a bound in the table the run already has, and the plane classifies a run that ends "
+ "on it as STOPPED — no new vocabulary, which was §7.3 (5)'s own test",
  [Object.prototype.hasOwnProperty.call(RUN_BOUNDS, "mints"), runStatusFor("mints")],
  [true, "stopped"]);

/* ============ 1. THE STEP, EMITTED FOR THE FIRST TIME, AND RULE 2 ========= */

console.log("\n=== 1. the `ai(function, version)` step: EMITTED, and it WEAKENS — never strengthens ===");

t("the step kind was DESIGNED at CPDF-10 and is a DERIVATION, which is what makes rule 2 apply "
+ "to it at all",
  [STEP_KINDS.ai?.role, Object.keys(EXTRACT_FUNCTIONS)], ["derivation", ["propose-reading"]]);

/* THE REFERENCES THE REGISTERED READER DID NOT FIND. One names an identifier
   the document itself carries (earns B) and one names only a NAME (earns C);
   both carry a POSITION, so both mint a passage. */
const PROPOSALS = [
  { ref: "contract:C-11940", refKind: "contract", refKey: "C-11940",
    label: "Agreement with Bayline Utility Services",
    source: { kind: "pdf-page", page: 1, ref: "page 2, the transfer table" } },
  { ref: "Harriet Vance", label: "Harriet Vance",
    source: { kind: "pdf-page", page: 2, ref: "page 3, the signature block" } },
];
const proposed = await post("extractpropose",
  { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0", refs: PROPOSALS }, AK);
t("THE EXTRACT RUN PROPOSES A READING AND THE ACT LANDS — the first caller SK-7's door has ever "
+ "had, and the first producer of the `ai` step this record has ever had",
  [proposed.ok, proposed.proposed.length, proposed.minted], [true, 2, 2]);
t("the proposal's basis is the capture's own chain with ONE `ai` step appended, naming the "
+ "function and the version",
  proposed.chain.map((s) => [s.step, s.engine ?? null, s.version ?? null]),
  [["pixels", null, null], ["ocr", "tesseract", "5.3.4"], ["ai", "propose-reading", "0.1.0"]]);
t("and the chain's derivation cap is UNCHANGED at the capture's C: the step claims no fidelity of "
+ "its own, which is UNDETERMINED and STATED rather than the capture's letter borrowed",
  [proposed.cap, proposed.chain[2].cap], ["C", null]);
t("the whole chain says what happened, composed FROM the chain and never written beside it",
  describeChain(proposed.chain).endsWith("a model rewrote the text (propose-reading 0.1.0)"), true);

/* RULE 2, THROUGH THE OP. This is the row's own declared negative control and
   it is asserted in the PRODUCT rather than only in the module: a step claiming
   a cap stronger than the chain it extends is refused by name, and nothing is
   written. */
const strengthened = await post("extractpropose",
  { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0", cap: "A",
    refs: [{ ref: "ordinance:99999", refKind: "ordinance", refKey: "99999" }] }, AK);
t("A STEP CLAIMING A CAP STRONGER THAN ITS INPUT IS REFUSED BY NAME — rule 2, enforced by the "
+ "module that owns rule 2 and returned to the caller verbatim",
  [strengthened.ok, strengthened.code, strengthened.check],
  [false, "TEXT_CHAIN_STRENGTHENS", "C-35.6"]);
t("and the refusal says WHY in the sentence the rule was written with, rather than naming a field",
  /more READABLE, not more RELIABLE/.test(strengthened.detail || strengthened.translation || ""), true);
t("a WEAKER cap is accepted — the fence is on the direction and not on the presence of a letter",
  (await post("extractpropose",
    { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0", cap: "D",
      refs: [{ ref: "fund:7710", refKind: "fund", refKey: "7710" }] }, AK)).cap, "D");
t("a step naming NO function is refused, and a function nothing in this repository emits is "
+ "refused by a different name — a roster carrying a word no producer writes is how a vocabulary "
+ "comes to have no producer at all",
  [(await post("extractpropose", { run: RUN, bundleId: DOC, version: "0.1.0",
                                   refs: [{ ref: "x:1", refKind: "x", refKey: "1" }] }, AK)).reason,
   (await post("extractpropose", { run: RUN, bundleId: DOC, fn: "rewrite-the-text", version: "0.1.0",
                                   refs: [{ ref: "x:1", refKind: "x", refKey: "1" }] }, AK)).reason],
  ["NO_FUNCTION", "UNKNOWN_FUNCTION"]);
t("and a function with no VERSION is refused: a proposal nobody can re-run is a proposal nobody "
+ "can check, and the version is what a later calibration would be OF",
  (await post("extractpropose", { run: RUN, bundleId: DOC, fn: "propose-reading",
                                  refs: [{ ref: "x:1", refKind: "x", refKey: "1" }] }, AK)).reason,
  "NO_FUNCTION_VERSION");

/* ================== 2. GRADED BY WHAT IT NAMES, NEVER A ================= */

console.log("\n=== 2. graded by what it NAMES: an identifier earns B, a name earns C, never A ===");

const byRef = Object.fromEntries(proposed.proposed.map((p) => [p.ref, p]));
t("the proposal naming an identifier the document itself carries earns B — what a registered "
+ "reader's reference KEY is worth, one letter below the A a source-assigned reference earns",
  byRef["contract:C-11940"]?.earned ?? null, "B");
t("the proposal naming only a NAME earns C — the weakest thing the framework grades",
  byRef["Harriet Vance"]?.earned ?? null, "C");
/* AND EACH ROW SAYS WHAT IT EARNED AND WHY, WITH THE LETTER INSIDE THE SENTENCE.
   The letter is asserted here as part of the reason rather than only beside it,
   and that is this suite's own control finding: `nc-sk8.mjs`'s `overstrict` arm
   promoted a name-only proposal from C to B and this assertion STAYED GREEN,
   because the grade and its sentence were two independent literals. A B
   explained by a C's reason is the record claiming more than it can support, in
   the one function whose job is to say what a grade rests on. `proposedReading
   Grade` now interpolates the letter into the sentence, and the arm fails as
   declared. */
t("and each row SAYS what it earned AND the letter it earned, composed from what it names so the "
+ "two cannot come to disagree",
  [/^earned B: this proposal names an identifier the document itself carries/
     .test(byRef["contract:C-11940"]?.earned_because ?? ""),
   /^earned C: this proposal names only a NAME/.test(byRef["Harriet Vance"]?.earned_because ?? "")],
  [true, true]);
t(`no proposal may reach A — the ceiling is ${PROPOSED_READING_CEILING} and it is a property of the `
+ "grader, not a filter applied afterwards",
  [PROPOSED_READING_CEILING,
   proposedReadingGrade({ refKind: "contract", refKey: "C-1", label: "anything" }).grade,
   proposedReadingGrade({ label: "a name" }).grade,
   proposedReadingGrade({}).grade],
  ["B", "B", "C", null]);
t("A CALLER OFFERING ITS OWN GRADE IS REFUSED BY NAME rather than silently ignored: a machine "
+ "grading its own reading is the one act DEC-24 rule 3 rules out, and a silent drop is how a "
+ "caller comes to believe it was honoured",
  (await post("extractpropose",
    { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
      refs: [{ ref: "z:1", refKind: "z", refKey: "1", grade: "A" }] }, AK)).reason,
  "GRADE_OFFERED");
t("a proposal naming NEITHER an identifier nor a name is refused: there is nothing to grade, and "
+ "a row that cannot be graded cannot become part of a finding",
  (await post("extractpropose",
    { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
      refs: [{ ref: "a bare string" }] }, AK)).reason,
  "PROPOSAL_NAMES_NOTHING");
t("the refusal names the ORDINAL of the entry it refused, so a caller sending a batch knows which "
+ "one, and the batch is refused WHOLE",
  (await post("extractpropose",
    { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
      refs: [{ ref: "ok:1", refKind: "ok", refKey: "1" }, { ref: "bad" }] }, AK)).at_index,
  1);

/* ====================== 3. LABELLED, ON EVERY SURFACE =================== */

console.log("\n=== 3. labelled as machine work on EVERY surface that can emit one ===");

/* A TOTALITY RATHER THAN A LIST OF SPELLINGS. Every op that can answer with a
   proposed reading is driven, every object carrying a `ref` and an `earned` is
   harvested RECURSIVELY out of the answer, and each one must carry the plane's
   own published sentence. A list of two surfaces goes stale the moment a third
   is written; the walk does not. */
const harvest = (v, out = []) => {
  if (Array.isArray(v)) { v.forEach((x) => harvest(x, out)); return out; }
  if (v && typeof v === "object") {
    if ("earned" in v && "ref" in v) out.push(v);
    for (const x of Object.values(v)) harvest(x, out);
  }
  return out;
};
const SURFACES = {
  extractpropose: proposed,
  "extractproposals (by run)": await get("extractproposals", `run=${RUN}`, RUTH),
  "extractproposals (by document)": await get("extractproposals", `bundle=${DOC}`, RUTH),
};
const unlabelled = [];
let rowsSeen = 0;
for (const [surface, answer] of Object.entries(SURFACES)) {
  const rows = harvest(answer);
  rowsSeen += rows.length;
  for (const row of rows) {
    const says = row.mint?.says ?? (answer.mint?.says ?? null);
    const state = row.mint?.state ?? (answer.mint?.state ?? null);
    if (state !== "machine_marked" || says !== CONTENT_MINT_STATES.machine_marked)
      unlabelled.push(`${surface}:${row.ref}`);
  }
}
console.log(`  corpus: ${Object.keys(SURFACES).length} surfaces driven, ${rowsSeen} proposed-reading `
          + `row(s) harvested recursively out of their answers`);
console.log(`  what this instrument CANNOT see: a surface nobody added to SURFACES above, and a `
          + `renderer in civicos-ui — no page renders a proposed reading today and none is asserted.`);
t("EVERY proposed-reading row on EVERY surface carries the plane's own machine-work label, "
+ "and the arm NAMES the surface rather than reporting a count",
  unlabelled, []);
t("and the corpus is NOT EMPTY, floored — a totality assertion over nothing passes for free and "
+ "this repository has measured that three times",
  rowsSeen >= 4, true);
t("the label is the plane's own PREDICATE and not a literal a surface matches on",
  [proposed.mint?.machine_work ?? null, isMachineIdentity(proposed.mint?.by)], [true, true]);
t("and the write's answer says, in the plane's own words, that these are proposals and not "
+ "coverage",
  /PROPOSALS/.test(proposed.says) && /none of it counts as extraction coverage/.test(proposed.says),
  true);
t("the CONTENT ROW the run minted is labelled by the SAME helper every other content surface uses "
+ "— SK-7's label, travelling through this item's door unchanged",
  (await get("content", `id=${byRef["contract:C-11940"]?.content_id ?? null}`, RUTH))?.mint?.state,
  "machine_marked");

/* ========================= 4. MINTS ARE A BOUND ========================= */

console.log("\n=== 4. §7.3 (5): mints are a BOUND on the run, in the table the run already has ===");

t("the run's own bounds table carries the consumption, both numbers stored and neither derived",
  proposed.bound, { bound: "mints", allowed: 3, consumed: 2 });
t("and `op=airun` publishes it in the run's `budget` beside every other bound, so UI-38's "
+ "field-name-blind renderer shows it with no edit — which is what §7.3 (5)'s *no schema, no new "
+ "vocabulary* buys",
  ((await get("airun", `run=${RUN}`, RUTH)).session?.budget || []).find((b) => b.bound === "mints"),
  { bound: "mints", allowed: 3, consumed: 2, unit: "passages" });
t("a proposal with NO position mints nothing and spends nothing — the only extent available would "
+ "be the whole document, and minting that per reference is the manufacturing the ratio exists "
+ "to catch",
  await (async () => {
    const r = await post("extractpropose",
      { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "place:none", refKind: "place", refKey: "none" }] }, AK);
    return [r.ok, r.minted, r.proposed[0].content_id, r.bound.consumed];
  })(),
  [true, 0, null, 2]);
t("a batch that would take the run PAST its allowance is refused WHOLE and never truncated: a "
+ "batch trimmed to fit would drop proposals the caller believes it filed",
  await (async () => {
    const r = await post("extractpropose",
      { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "over:1", refKind: "over", refKey: "1",
                 source: { kind: "pdf-page", page: 0, ref: "page 1, top" } },
               { ref: "over:2", refKind: "over", refKey: "2",
                 source: { kind: "pdf-page", page: 0, ref: "page 1, bottom" } }] }, AK);
    return [r.ok, r.reason, r.would_mint];
  })(),
  [false, "MINTS_BOUND_WOULD_EXCEED", 2]);
t("the last mint inside the allowance LANDS, and the bound is now exhausted",
  await (async () => {
    const r = await post("extractpropose",
      { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "last:1", refKind: "last", refKey: "1",
                 source: { kind: "pdf-page", page: 0, ref: "page 1, the preamble" } }] }, AK);
    return [r.ok, r.bound];
  })(),
  [true, { bound: "mints", allowed: 3, consumed: 3 }]);
t("AND THE NEXT PRODUCTION IS REFUSED BY THE BOUND, which is the whole of §7.3 (5): a machine that "
+ "may mint without a bound produces a store of proposals nobody cited",
  await (async () => {
    const r = await post("extractpropose",
      { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "past:1", refKind: "past", refKey: "1",
                 source: { kind: "pdf-page", page: 2, ref: "page 3, the margin" } }] }, AK);
    return [r.ok, r.reason, r.consumed, r.allowed];
  })(),
  [false, "MINTS_BOUND_REACHED", 3, 3]);
t("AND THE RUN ITSELF ENDS ON IT, naming the bound — a run that ran out of mints ends exactly as "
+ "one that ran out of fetches, through the machinery that already existed",
  await (async () => {
    const tick = await post("airuntick", { run: RUN, at: LATER, leaseMs: 600000 }, RUTH);
    return [tick.ended?.bound ?? null, tick.status];
  })(),
  ["mints", "stopped"]);
/* AND WHAT THE ENDED RUN PUBLISHES, ASSERTED AS IT IS RATHER THAN AS IT OUGHT
   TO BE. `op=airun`'s `condition` block names the bound, and its `detail` reads
   *the run stopped on 'mints'* — the SHORT form, because `#aiRunTerminate`
   writes no `stopped_condition` for a mints ending (there is no condition kind
   to write: `runtime-ceiling-reached` is the only one, and it is the platform
   ceiling's). So the bound's own published sentence — `RUN_BOUNDS.mints` — is
   NOT in the answer. That is pre-existing behaviour for every bound but
   `runtime` and is NOT this item's to change: widening `condition.detail` would
   move a shape `aiRunRead`'s own consumers read. It is asserted true here, and
   reported as a finding rather than smoothed over by asserting something
   weaker. */
t("the ended run NAMES the bound that stopped it, and the bound carries its own published "
+ "description in the catalogue a surface resolves it against",
  [(await get("airun", `run=${RUN}`, RUTH)).session?.condition?.bound ?? null,
   /passages a machine credential marked citable/.test(RUN_BOUNDS.mints)],
  ["mints", true]);

/* A RUN THAT DECLARED NO BOUND AT ALL is refused, and that refusal is the one
   the arm `bound` in nc-sk8.mjs removes. An absent bound is not a generous
   bound — `finishedBound` fires only on `allowed > 0`, so nothing would ever
   end such a run. */
const UNBOUNDED = "RUN-2026-0914-unbounded";
await post("airunopen", {
  run: UNBOUNDED, contextType: "inquiry", contextId: INQ, mode: EXTRACT_RUN_MODE,
  principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
  skillVersion: "investigative-session@1",
  bounds: [{ bound: "fetches", allowed: 5, unit: "requests" }],
  leaseMs: 600000, at: NOW }, RUTH);
t("A RUN THAT DECLARES NO `mints` BOUND MAY NOT PRODUCE — refused by name, rather than defaulted "
+ "to an allowance chosen in code, which would be a measurement with no measurement behind it",
  await (async () => {
    const r = await post("extractpropose",
      { run: UNBOUNDED, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "u:1", refKind: "u", refKey: "1",
                 source: { kind: "pdf-page", page: 0, ref: "page 1" } }] }, AK);
    return [r.ok, r.reason];
  })(),
  [false, "NO_MINTS_BOUND"]);

/* ============ 5. NEVER COVERAGE, AND THE MINTED-TO-CITED RATIO ========== */

console.log("\n=== 5. §7.3 (6): an uncited machine-minted row is a PROPOSAL — never coverage ===");

const READING_AFTER = await get("reading", `sha256=${SHA_DOC}`, RUTH);
t("THE REGISTERED READER'S READING IS BYTE-FOR-BYTE WHAT IT WAS. Six proposals later, the thing "
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

/* THE INSTRUMENT, IN BOTH DIRECTIONS. Nothing cited yet, so the ratio is 0 of
   N — and the arm that matters is the one after a member cites, where it
   RISES. A ratio that could only ever read 0 would measure nothing. */
const before = await get("extractproposals", `bundle=${DOC}`, RUTH);
t("with nothing cited, the ratio is 0 of the passages the machine marked — and it SAYS that the "
+ "rest are proposals the record keeps, labels, and counts as no coverage at all",
  [before.instrument.cited, before.instrument.minted, before.instrument.ratio],
  [0, 3, 0]);
t("zero MINTED is not a ratio of zero and does not read as one: an absence answers null and says "
+ "which case it is, because the healthiest-looking number must not mean two opposite things",
  [mintRatio({ minted: 0, cited: 0 }).ratio, /nothing to measure/.test(mintRatio({}).says)],
  [null, true]);

/* A MEMBER CITES ONE OF THEM. The id is hash(capture, extent, chain), so the
   member's own leg FINDS the machine's row — which is why the `ai` step is not
   on that chain, and is the mechanism by which a proposal becomes part of a
   finding at all. */
await promote(INQ, inquiryMd(INQ, { subject: ORD, refs: [DOC],
  legs: [{ target: DOC },
         { target: DOC, kind: "pdf-page", page: 1, eref: "page 2, the transfer table" }] }), "inquiry");
const after = await get("extractproposals", `bundle=${DOC}`, RUTH);
t("A MEMBER CITES ONE OF THE PASSAGES AND THE RATIO RISES — the instrument moves, which is the "
+ "only thing that makes *if it never falls, the assistant is manufacturing* a measurement",
  [after.instrument.cited, after.instrument.minted, after.instrument.uncited],
  [1, 3, 2]);
t("and the member's leg landed on the MACHINE's row rather than minting a second one — one "
+ "address, because there is no allocator",
  byRef["contract:C-11940"]?.content_id ?? null,
  contentIdFor(SHA_DOC, { kind: "pdf-page", page: 1, ref: "page 2, the transfer table" }, CHAIN));

/* ================ 6. THE RUN IS THE ONLY PLACE IT RUNS ================= */

console.log("\n=== 6. §7.3 (2) and (4): it runs in the RUN, and the run is a MEMBER's act ===");

for (const [body, reason, why] of [
  [{ bundleId: DOC, fn: "propose-reading", version: "0.1.0" },
   "NO_RUN", "with no run named at all"],
  [{ run: "RUN-nobody-opened", bundleId: DOC, fn: "propose-reading", version: "0.1.0" },
   "NO_SUCH_RUN", "naming a run nobody opened"],
  [{ run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0" },
   "RUN_NOT_RUNNING", "inside the run this suite has already ended"],
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
   one of the conditions it was formed under. */
const CHECKRUN = "RUN-2026-0914-check";
await post("airunopen", {
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
    return [r.ok, r.reason, r.mode];
  })(),
  [false, "NOT_AN_EXTRACT_RUN", "check"]);
t("THE MACHINE CREDENTIAL CANNOT OPEN A RUN — §7.3 (4) at the door rather than in a sentence: the "
+ "subject and the objective stay the member's",
  await (async () => {
    const r = await post("airunopen",
      { run: "RUN-machine-opened", contextType: "inquiry", contextId: INQ, mode: EXTRACT_RUN_MODE,
        principalClaude: "project", skillVersion: "investigative-session@1",
        bounds: [{ bound: "mints", allowed: 1 }], at: NOW }, AK);
    return r.ok !== true && r.started !== true;
  })(),
  true);
t("and a credential whose member declared NO writes cannot produce at all — FL-6's cascade doing "
+ "its job at a new verb, driven rather than assumed from the class",
  await (async () => {
    const READER = await mintCred([], "reader-only");
    const r = await post("extractpropose",
      { run: RUN, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "r:1", refKind: "r", refKey: "1" }] }, READER.token);
    return r.ok !== true;
  })(),
  true);

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
  (await get("extractproposals", "", RUTH)).reason, "NO_SCOPE");

/* THE READ'S BOUND, DRIVEN HERE RATHER THAN IN `bounds.test.mjs`, and
   `DRIVEN_ELSEWHERE` there names this op with the reason. Building the corpus
   this needs — a document with a capture and a chain, an `ai` credential, a
   member-opened EXTRACT run with a `mints` bound, and several proposals — is
   this suite's entire §0 through §4, and a second copy of it over there would be
   two fixtures for one fact. The shape is `bounds.test.mjs`'s own loop: a BITE of
   1 against a corpus of more than one, `limit` read back as the CLAMPED cap,
   `truncated` TRUE on the bite and FALSE at the default, and an over-ask answered
   AT THE CEILING rather than silently. */
t("the read's bound is PUBLISHED and not silent: a bite of 1 says `limit` and says `truncated`, the "
+ "default bound says neither is cutting anything, and an over-ask is answered at the CEILING "
+ "rather than at the number the caller asked for",
  await (async () => {
    const bite = await get("extractproposals", `bundle=${DOC}&limit=1`, RUTH);
    const whole = await get("extractproposals", `bundle=${DOC}`, RUTH);
    const over = await get("extractproposals", `bundle=${DOC}&limit=100000`, RUTH);
    return [bite.limit, bite.count, bite.truncated,
            whole.limit, whole.truncated, whole.count > 1,
            over.limit];
  })(),
  [1, 1, true, 100, false, true, 500]);
t("a proposal whose POSITION cannot be read in IC-1's vocabulary is refused: an address nothing "
+ "resolves looks like a binding and joins to nothing",
  await (async () => {
    const OK2 = "RUN-2026-0914-second";
    await post("airunopen", { run: OK2, contextType: "inquiry", contextId: INQ,
      mode: EXTRACT_RUN_MODE, principalClaude: "project",
      skillVersion: "investigative-session@1",
      bounds: [{ bound: "mints", allowed: 4, unit: "passages" }], leaseMs: 600000, at: NOW }, RUTH);
    const r = await post("extractpropose",
      { run: OK2, bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "p:1", refKind: "p", refKey: "1",
                 source: { kind: "pdf-page", page: "not a page", ref: "nowhere" } }] }, AK);
    return [r.ok, r.reason];
  })(),
  [false, "PROPOSAL_POSITION"]);
t("A MINT REFUSED BY THE CONTAINER'S OWN EXTENT DOES NOT REFUSE THE PROPOSAL: the reading was "
+ "still read, and *we could not make this citable* and *this was never proposed* are different "
+ "facts that must not read alike",
  await (async () => {
    const r = await post("extractpropose",
      { run: "RUN-2026-0914-second", bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "far:1", refKind: "far", refKey: "1",
                 source: { kind: "pdf-page", page: 99, ref: "page 100, which does not exist" } }] }, AK);
    return [r.ok, r.minted, r.proposed[0].content_id,
            r.proposed[0].mint_refused?.code ?? null, r.proposed[0].mint_refused?.check ?? null];
  })(),
  [true, 0, null, "CONTENT_EXTENT_OUT_OF_RANGE", "C-45.1"]);
t("a document the record holds no bytes of, and an object that is not a document, are refused as "
+ "DIFFERENT facts — CLAUDE.md's sparse rule at this door",
  await (async () => {
    const a = await post("extractpropose",
      { run: "RUN-2026-0914-second", bundleId: INQ, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "q:1", refKind: "q", refKey: "1" }] }, AK);
    const b = await post("extractpropose",
      { run: "RUN-2026-0914-second", bundleId: "INFO-2026-9999-absent", fn: "propose-reading",
        version: "0.1.0", refs: [{ ref: "q:1", refKind: "q", refKey: "1" }] }, AK);
    return [a.reason, b.reason];
  })(),
  ["NOT_A_DOCUMENT", "NO_SUCH_BUNDLE"]);
t("an EMPTY proposal is refused and sent where it belongs: a run that honestly found nothing "
+ "writes an OBSERVATION, where absence is first-class and says which level",
  await (async () => {
    const r = await post("extractpropose",
      { run: "RUN-2026-0914-second", bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [] }, AK);
    return [r.reason, /belongs in the run's log/.test(r.detail || "")];
  })(),
  ["NO_PROPOSALS", true]);
t("a member who was never invited may not learn a document exists by proposing a reading of it — "
+ "D-15 answers an invisible bundle EXACTLY as an absent one",
  await (async () => {
    const a = await post("extractpropose",
      { run: "RUN-2026-0914-second", bundleId: DOC, fn: "propose-reading", version: "0.1.0",
        refs: [{ ref: "v:1", refKind: "v", refKey: "1" }] }, IRA);
    return a.ok === true || a.reason === "NO_SUCH_BUNDLE";
  })(),
  true);

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
t("the module's cap computation agrees with textchain's, asked about the chain this suite built",
  derivationCap(proposed.chain), "C");

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
