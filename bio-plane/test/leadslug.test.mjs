/* NEGATIVE CONTROL: DECLARED HERE, RUN BY `test/leadslug.control.mjs` — deliberately NOT a `.test.mjs`, because it EDITS REAL SOURCES while it runs and the battery must not discover it (PL-3's `suggest.control.mjs`, PL-4's `capturerequests.control.mjs` precedent). THE HARNESS LIVES INSIDE THIS WORKTREE and never in a shared scratchpad: a worker's harness was overwritten mid-turn by a concurrent worker on 2026-08-07, and a harness silently replaced between ARM and RESTORE reports a restore it never performed. Every arm is armed ALONE with every other defence held OPEN, every restore is verified BY sha256 AND BY CONTENT (`cmp`), and every arm DECLARES before it runs what MUST fail and what MUST NOT.
   THE ITEM'S SPINE IS ARM (1) — THE `case` SET IS INQUIRY B'S — AND ARM (2) IS THE PLAN ROW'S OWN NAMED CONTROL.
   (1) THE SPINE — THE LEAD IS FILED UNDER THE QUESTION IT BEARS ON. In src/store.mjs #findingsOutOfInquiryLead replace `case: this.#queueAncestors([r.lead_inquiry], viewer),` with `case: this.#queueAncestors([r.target], viewer),` -> the lead files under inquiry A's project instead of inquiry B's, which is EXACTLY the homelessness D-213 was raised about, wearing a home. MUST FAIL: the case-set arms. MUST NOT FAIL: everything about capture, basis absence and options — the item still exists and still says the same things, which is what makes this defect invisible without an arm pointed at it.
   (2) THE PLAN ROW'S NAMED CONTROL — AN UNCATALOGUED SLUG AT THE MINT. In src/store.mjs #findingsOutOfInquiryLead replace `kind: "out-of-inquiry-lead",` with `kind: "N-31",` -> op=queue REFUSES WHOLE with NO_SUCH_KIND (C-31.2). Run a second time with an uncatalogued slug (`kind: "out-of-inquiry-lead-v2",`) -> the same refusal. MUST FAIL: every arm that reads a feed. MUST NOT: nothing else in the tree, because the refusal is at the mint and not at the producer.
   (2b) THE MISFILING HALF, which arm 2 cannot reach. Replace `class: "FINDING",` with `class: "CONDITION",` -> KIND_MISCLASSED (C-31.3) and NOT NO_SUCH_KIND: the kind is real and filed elsewhere, and the two codes must not collapse into one answer.
   (2c) THE SWEEP, and it is the arm that proves this item did more than fix its own instance. Restore the mint to REC-32's CONDITION-only shape (delete the two `classOfKind` clauses and re-add `if (it.class === "CONDITION" && classOfKind(it.kind) !== "CONDITION")`) -> arm 2 and arm 2b BOTH go green while a FINDING minted under `N-31` reaches a member's feed. That is the class the sweep closed.
   (3) THE BASIS ABSENCE IS MEASURED, NOT ASSUMED. In #leadBasisAbsence replace the two COUNT reads' `target_id=?` binding with a literal that matches nothing -> the arm asserting `present` for a document a reading DOES carry fails, while the `absent` arm stays green. The point of the arm is that a walk over an empty corpus reports its verdict triumphantly, so the suite drives BOTH directions and this control proves the instrument can tell them apart.
   (4) THE PURGE, BY CONSEQUENCE (D-113). Delete the `UPDATE capture_requests SET lead_inquiry=NULL WHERE lead_inquiry=?` line from purge's PER-BUNDLE arm -> hygiene.test.mjs STAYS GREEN (it compares TABLE lists and this is a COLUMN), while this suite fails naming a member-facing FINDING still standing after its question was purged. Declared here because the structural check cannot see this defect and only the consequence arm can.
   (5) THE DOOR, BOTH CODES (C-28.14, C-28.15) armed one at a time.
   (6) OVER-STRICTNESS, and these PASS rather than fail: an ordinary request naming NO lead captures exactly as before and produces NO lead item; a lead named as `lead` rather than `lead_inquiry` is accepted (the door reads both spellings); a legacy `focus`/`problem`-typed question is a legal lead (the MAP RULE, so a spelling this item did not anticipate is not refused); and the sibling `capture-completed-unattended` CONDITION for the same row still fires, because two producers over one table is the shape PL-4 established and this item extends rather than replaces. A fence that refuses correct work is a defect in the fence.
 * ========================================================================= */
/* IS-BUILD-PLAN PL-15 / D-213 (ANSWERED 2026-08-06 by Bob, DEC-60) —
 * THE OUT-OF-INQUIRY LEAD: THE FINDING-CLASS SLUG WITH A PRODUCER.
 *
 * THE HOLE. DEC-60's investigative session reads ALL of a project's inquiries
 * and writes only to the SUBJECT one, so evidence bearing on a DIFFERENT
 * question — the same vendor holding three other contracts, met while
 * investigating whether one was competitively bid — had nowhere to go and was
 * dropped BY CONSTRUCTION.
 *
 * THIS IS A FIXTURE-DRIVEN RUN AND THAT IS THE CORRECT SHAPE HERE, SAID PLAINLY
 * RATHER THAN LEFT TO BE NOTICED. There is no investigative-session harness in
 * this tree: IS-9's harness is FL-3's item and has not landed. So the "run"
 * below is a real `ai_runs` row driving the real `op=capturerequest` door and
 * the real drain — every plane path the live session will take — with the
 * session's own reasoning (*this document bears on that other question*) stood
 * in for by the suite naming the lead. What is NOT proven here is that a real
 * session names the right lead, which is a judgement and not a mechanism, and
 * it is FL-3's to prove. Stated so nobody reads a green run here as evidence of
 * something this suite cannot see.
 *
 * WHAT IS ASSERTED, in the order the blocks run:
 *
 *  1. THE VOCABULARY. `out-of-inquiry-lead` is a FINDING in queuestate.mjs and
 *     in NOTIFICATIONS.md's catalogue, and the two agree. FINDING and NOT
 *     CONDITION is DRIVEN: op=queuemute REFUSES the kind, so no member can
 *     silence a lead the team must see.
 *  2. THE DOOR. A lead is optional, must name a question, and may never be the
 *     question the run is working. Both refusals driven by their C-numbers.
 *  3. THE SPINE. Request -> drain -> the lead surfaces on op=queue as a FINDING,
 *     and the capture lands at `collected` and NEVER HIGHER — **with the plan
 *     row's clause corrected by measurement.** A drained capture lands at no
 *     bundle state at all: `op=acquire` writes bytes to R2 and a
 *     `captured_locators` row and creates NO bundle and NO register entry
 *     (MEASURED here 2026-08-08 — `op=stats` reads bundles 0, register 0 after
 *     a successful acquire). `collected` is what a later `promote` makes. So
 *     the item reports `undetermined` off the drain and `collected` once a
 *     promote registers the digest, and BOTH are driven.
 *  4. THE CASE SET IS INQUIRY B'S ANCESTORS AND NOT INQUIRY A'S. The item, in
 *     one block, driven over two projects that both exist and are both visible.
 *  5. NO BASIS ENTRY, AND THE ABSENCE IS MEASURED. All THREE states driven from
 *     three documents in one store — `undetermined` (no document holds these
 *     bytes yet), `absent` (looked for, part of no case) and `present` (a
 *     reading carries it) — because an instrument that only ever sees absence
 *     is the empty-corpus walk reporting its verdict triumphantly.
 *  6. A REAL `basis` AND A REAL `options[]`, with the inquiry-grain gap DECLARED
 *     on the item rather than hidden behind an empty array (D-222).
 *  7. THE MINT REFUSES AN UNKNOWN KIND, and the fence covers EVERY class rather
 *     than CONDITION alone — the sweep, asserted structurally here and DRIVEN
 *     by the control harness.
 *  8. THE PURGE, BY CONSEQUENCE: purge inquiry B and the member-facing lead goes
 *     quiet, which is the half hygiene's D-113 check cannot see.
 *  9. DEC-49: every code this item added carries a complete row, and the driven
 *     set EQUALS the registry for the door's two.
 * ========================================================================= */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { QUEUE_FINDING_KINDS, QUEUE_CONDITION_KINDS, classOfKind } from "../src/queuestate.mjs";
import { CAPTURE_REQUEST_CHECKS, QUEUE_MINT_CHECKS } from "../checks/bio-checks.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const SRC = (f) => join(DIR, "..", "src", f);
const STORE_SRC = readFileSync(SRC("store.mjs"), "utf8");
const SCHEMA_SRC = readFileSync(SRC("schema.mjs"), "utf8");
const NOTIFICATIONS = readFileSync(join(DIR, "..", "..", "docs", "development", "NOTIFICATIONS.md"), "utf8");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
/* NULL-TOLERANT (PL-1's discipline, carried by PL-4): an arm that throws on
   `.code` of undefined takes every arm behind it with it and reports one defect
   as none. */
const codeOf = (r) => (r && typeof r.code === "string") ? r.code : null;

const HOST = "records.alamedacountyca.gov";
const VENDOR = `https://${HOST}/contracts/2026-0042-northbay-engineering.pdf`;
const SECOND = `https://${HOST}/contracts/2026-0043-northbay-engineering.pdf`;
const PLAIN = `https://${HOST}/contracts/2026-0044-unrelated.pdf`;
const LEGACY = `https://${HOST}/contracts/2026-0045-legacy-typed.pdf`;
/* PER-ADDRESS BYTES, and the first draft of this suite got it wrong in a way
   worth recording: one shared body made every capture CONTENT-ADDRESS TO THE
   SAME DIGEST, so a register row written for one document answered for all of
   them and block 5's three-state discrimination silently collapsed into two.
   The store was right and the fixture was lying to it. */
const bodyFor = (url) => {
  const seed = [...url].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 65536, 7);
  return new Uint8Array(4096).map((_, i) => (i * 17 + seed) % 256);
};

const SEEN = [];
let MF;
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-pl15", MEMBER_TOKEN: "mem-pl15", PROBE_TOKEN: "prb-pl15",
              DAEMON_TOKEN: "dmn-pl15", VERSION: "0.60.0", INSTANCE_NAME: "biosmoke-pl15",
              GOVERNOR_APPETITE_PER_MIN: "600000",
              /* Pinned far out of the window so only the hand-driven drain runs
                 and every assertion is deterministic (PL-4's trick). */
              CAPTURE_REQUEST_TICK_MS: "3600000", MONITOR_TICK_MS: "3600000" },
  serviceBindings: { SELF: async (request) => MF.dispatchFetch(request) },
  outboundService(request) {
    SEEN.push({ url: request.url });
    return new Response(bodyFor(request.url), { headers: { "content-type": "application/pdf" } });
  },
});
MF = mf;

const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

const ns = await mf.getDurableObjectNamespace("STORE");
const doStub = ns.get(ns.idFromName("bio"));

/* ---------------------------------------------------------------- fixture */
const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const member = async (id, caps, role = "member") => {
  const add = await POST(`op=memberadd&token=adm-pl15`,
    { memberId: id, cover: `cover for ${id}`, role, capabilities: caps });
  if (!add?.invite) throw new Error(`memberadd ${id}: ${JSON.stringify(add)}`);
  const en = await POST("op=enroll", { invite: add.invite, handle: id, password: `${id}-passphrase-1` });
  if (!en?.ok) throw new Error(`enroll ${id}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${id}`, password: `${id}-passphrase-1` });
  if (!lg?.token) throw new Error(`login ${id}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await member("ruth", ["contribute", "publish", "create_projects"], "admin");
/* A SECOND ADMINISTRATOR before any ordinary member: administrative access is
   shared so losing one person does not lose the group, and the roster refuses
   the second member otherwise. */
await member("gus", ["contribute"], "admin");
const CAROL = await member("carol", ["contribute", "create_projects"]);
const DAVE = await member("dave", ["contribute"]);

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];

const inquiryMd = (id, question, type = "inquiry", schema = "inquiry@1") => ["---",
  `id: ${id}`, `object_type: ${type}`, `schema: ${schema}`,
  `title: "${question}"`, "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next contract cycle",
  "    description: The next award may restate the basis.",
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const projectMd = (id, title, cites) => ["---",
  `id: ${id}`, "object_type: project", "schema: project@1",
  `title: "${title}"`, "current_state: forming", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(cites), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", title, "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Prior contract file ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A document already in the store.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = async (id, text, type, state, tok = RUTH, register = []) => {
  const r = await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `${id}-${sha(text).slice(0, 8)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: LATER } });
  if (!r || r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 600)}`);
  return r;
};

/* INQUIRY A — the question the run is working. INQUIRY B — the question the
   evidence turns out to bear on. Bob's own case: a run investigating whether
   ONE contract was competitively bid meets the same vendor holding others. */
const INQ_A = "INQ-2026-4100-was-0042-competitively-bid";
const INQ_B = "INQ-2026-4200-northbay-holds-how-many";
const INQ_C = "INQ-2026-4300-legacy-typed-question";
const PROJ_A = "PROJ-2026-4100-contract-0042";
const PROJ_B = "PROJ-2026-4200-vendor-concentration";
const INFO_OLD = "INFO-2026-4900-prior-contract-file";
const CAP_OLD = sha("pl15-prior-contract-capture");

await promote(INQ_A, inquiryMd(INQ_A, "Was the 0042 award competitively bid?"), "inquiry", "open");
await promote(INQ_B, inquiryMd(INQ_B, "How many contracts does Northbay hold?"), "inquiry", "open");
/* A LEGACY-TYPED question, for the over-strictness arm: `focus` is the retired
   spelling REC-10 normalises, and a lead naming one must be as legal as a
   canonical `inquiry`. A fence that refuses correct work in a spelling nobody
   anticipated is a defect in the fence. */
await promote(INQ_C, inquiryMd(INQ_C, "The legacy-typed question", "focus", "focus@1"), "focus", "open");
/* A document already in the store that a reading DOES carry — so block 5 can
   drive the `present` direction and prove the absence instrument has teeth. */
await promote(INFO_OLD, infoMd(INFO_OLD), "information", "collected", RUTH,
  [{ sha256: CAP_OLD, path: "snapshots/prior.pdf", encoding: "binary", bytes: 10 }]);

/* TWO PROJECTS, both real, both visible to carol and ruth. This is what makes
   block 4's assertion mean something: if there were only one project, filing
   under A's ancestors and filing under B's would produce the same answer and
   the spine arm would pass over a defect. */
await promote(PROJ_A, projectMd(PROJ_A, "The 0042 award", [INQ_A]), "project", "forming", CAROL);
await promote(PROJ_B, projectMd(PROJ_B, "Vendor concentration", [INQ_B, INFO_OLD]), "project", "forming", CAROL);

const RUN = "RUN-2026-0808-pl15";
/* CORRECTED 2026-08-09 BY PL-18, AND THE OLD FIXTURE IS SAID TO BE WRONG RATHER
   THAN EXEMPTED. Bob ruled (DEC-63) that starting an investigation is licensed
   by PARTICIPATION IN THE PROJECT the question belongs to, with `contribute`
   only the floor beneath it. This fixture had CAROL create both projects (so
   she is their owner and their only participant) and RUTH open the run over
   `INQ_A`, which `PROJ_A` draws on — and RUTH is in no project at all. Under
   the ruling that is now refused with C-22.8, and **the refusal is correct**:
   the suite was driving a member who, from today, may not start that run.

   The fix is to make the fixture LEGAL rather than to move the assertion, and
   it is done THROUGH THE ACTS — carol invites, ruth joins — because a
   participation row written by hand would prove nothing about whether a member
   can actually get one. Nothing about what this suite MEASURES changes: it is
   about out-of-inquiry leads, and ruth still drives every arm below. */
{
  const inv = await GET(`op=projectinvite&token=${CAROL}&projectId=${encodeURIComponent(PROJ_A)}&handle=ruth`);
  if (inv?.ok !== true) throw new Error(`projectinvite ruth -> PROJ_A: ${JSON.stringify(inv)}`);
  const joined = await GET(`op=projectjoin&token=${RUTH}&projectId=${encodeURIComponent(PROJ_A)}`);
  if (joined?.state !== "joined") throw new Error(`projectjoin ruth -> PROJ_A: ${JSON.stringify(joined)}`);
}
{
  const r = await POST(`op=airunopen&token=${RUTH}`, {
    run: RUN, contextType: "inquiry", contextId: INQ_A,
    label: "PL-15 fixture — the run that meets evidence for another question", mode: "check",
    principalClaude: "project", principalClaudeRef: "believe-in-oakland/claude",
    skillVersion: "investigative-session@1", biasManifest: null,
    bounds: [{ bound: "fetches", allowed: 50, unit: "requests" }], leaseMs: 900000 });
  if (r?.started !== true) throw new Error(`airunopen: ${JSON.stringify(r)}`);
}

const request = async (body, tok = RUTH) => POST(`op=capturerequest&token=${tok}`,
  { target: INQ_A, run: RUN, purpose: "investigate", ...body });
const drain = async () => await doStub.captureRequestDrain({ actor: "suite" });
const queueOf = async (tok) => GET(`op=queue&token=${tok}`);
const leadsIn = (q) => ((q && q.items) || []).filter((i) => i.kind === "out-of-inquiry-lead");
/* NULL-TOLERANT DEEP READ (PL-1's discipline, and this suite paid for it). When
   the mint REFUSES — which is exactly what the control harness arms — op=queue
   answers with no `items` at all, so every `leads[0].basis…` below throws a
   TypeError, the suite dies at block 3, and every arm behind it reports NOTHING.
   An arm whose "must not fail" clauses were never evaluated is an arm that
   proved less than it claimed. Measured on this harness's first full run: four
   arms were unjudgeable for this reason. */
const g = (o, path) => path.split(".").reduce((a, k) => (a === null || a === undefined ? null : a[k]), o);

const DRIVEN = new Set();
const drive = (r) => { const c = codeOf(r); if (c && c in CAPTURE_REQUEST_CHECKS) DRIVEN.add(c); return r; };

/* ====================================================================== 1
 * THE VOCABULARY: A FINDING, IN BOTH AUTHORITIES, AND UNMUTEABLE BY DESIGN.
 * ====================================================================== */
console.log("\n--- 1. the slug is a FINDING, in queuestate.mjs and in the catalogue it is transcribed from ---");
{
  t("the slug exists and classOfKind answers FINDING", classOfKind("out-of-inquiry-lead"), "FINDING");
  t("it is in QUEUE_FINDING_KINDS and in NEITHER of the other two vocabularies — one kind, one class",
    ["out-of-inquiry-lead" in QUEUE_FINDING_KINDS, "out-of-inquiry-lead" in QUEUE_CONDITION_KINDS],
    [true, false]);
  t("its entry carries the sentence a member reads instead of the slug (arm E of the DEC-49 guard "
  + "holds every vocabulary term to this)",
    (QUEUE_FINDING_KINDS["out-of-inquiry-lead"] || "").length > 40, true);
  /* THE TWO AUTHORITIES AGREE. queuestate.mjs says of itself that the vocabulary
     is "transcribed from NOTIFICATIONS.md's catalogue and from nowhere else", so
     a slug in the code and not in the catalogue is a vocabulary that has quietly
     acquired a second author. */
  t("NOTIFICATIONS.md's catalogue carries it too, marked [FINDING] — the code half has no authority "
  + "of its own and a slug in one and not the other is a second author appearing",
    [/out-of-inquiry lead/i.test(NOTIFICATIONS), /out-of-inquiry-lead/.test(NOTIFICATIONS)],
    [true, true]);
  /* FINDING AND NOT CONDITION, DRIVEN rather than asserted. This is the whole
     reason the class was chosen: a CONDITION is personally muteable, and one
     member muting a real lead would remove it from their view while the record
     went on believing the team had been told. */
  const m = rP(await (await mf.dispatchFetch(`http://x/api/?op=queuemute&token=${CAROL}`,
    { method: "POST", body: JSON.stringify({ case: PROJ_B, kinds: ["out-of-inquiry-lead"] }) })).json());
  t("a member CANNOT mute it: op=queuemute refuses, because muting is personal and a lead is the "
  + "group's (D-125, DEC-16)", m.ok, false);
  t("and the refusal names the class it actually is rather than only saying no",
    [typeof m.reason === "string", /FINDING/.test(JSON.stringify(m))], [true, true]);
}

/* ====================================================================== 2
 * THE DOOR: OPTIONAL, MUST NAME A QUESTION, AND NEVER THE ONE BEING WORKED.
 * ====================================================================== */
console.log("\n--- 2. the door: a lead is optional, names a question, and is never the target ---");
{
  const notAQuestion = drive(await request({ address: PLAIN, lead_inquiry: INFO_OLD }));
  t("a lead naming a DOCUMENT is refused by name (C-28.14) — a notification filed on a document has "
  + "no question and nobody to reach", [notAQuestion.ok, codeOf(notAQuestion)],
    [false, "CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY"]);
  t("and the refusal carries its C-number and the canned translation a surface renders verbatim",
    [notAQuestion.check, notAQuestion.translation === CAPTURE_REQUEST_CHECKS
      .CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY.translation], ["C-28.14", true]);

  const nowhere = drive(await request({ address: PLAIN, lead_inquiry: "INQ-2026-9999-nothing" }));
  t("a lead naming nothing at all is the same refusal — absent and unreadable answer identically",
    codeOf(nowhere), "CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY");

  const itself = drive(await request({ address: PLAIN, lead_inquiry: INQ_A }));
  t("a lead pointing back at the question the run is working is refused by name (C-28.15) — that is "
  + "ordinary evidence, and a lead pointing here would tell this question that evidence for a "
  + "different one was found, about itself",
    [itself.ok, codeOf(itself), itself.check], [false, "CAPTURE_REQUEST_LEAD_IS_THE_TARGET", "C-28.15"]);

  t("no refused request left this instance — the door writes a row and fetches nothing, and three "
  + "refusals are three rows never written", SEEN.length, 0);
}

/* ====================================================================== 3
 * THE SPINE: REQUEST -> DRAIN -> `collected`, AND THE LEAD SURFACES.
 * ====================================================================== */
console.log("\n--- 3. the spine: the capture lands at `collected` and never higher, and the lead surfaces ---");
let LEAD_REQ = null;
{
  const r = await request({ address: VENDOR, lead_inquiry: INQ_B });
  t("the door accepts a lead naming ANOTHER question, and echoes what it stored",
    [r.ok, r.state, r.target, r.lead_inquiry], [true, "requested", INQ_A, INQ_B]);
  LEAD_REQ = r.request;

  const d = await drain();
  t("the drain captured it", [d.captured.length, d.refused.length], [1, 0]);
  t("and exactly one request left the instance", SEEN.length, 1);

  const q = await queueOf(CAROL);
  /* ASKED SEPARATELY FROM "is the lead there", because the two failures are
     different facts and a control harness has to be able to tell them apart: a
     REFUSED feed (the mint turning the whole answer away) and an ANSWERED feed
     carrying an item under a kind nothing recognises look identical if the only
     assertion is a count. */
  t("op=queue ANSWERS — the mint admitted every item it was handed", q.ok, true);
  const leads = leadsIn(q);
  t("op=queue carries exactly one out-of-inquiry lead", leads.length, 1);
  t("it is a FINDING — so it leaves the list only by an authored, attributed act",
    g(leads[0], "class"), "FINDING");
  t("its id names the request it derives from, so two producers over one table cannot collide",
    g(leads[0], "id"), `FINDING::out-of-inquiry-lead::${LEAD_REQ}`);

  /* MEASURED, AND IT CORRECTS THE PLAN ROW'S CLAUSE RATHER THAN RESTATING IT.
     PL-15's acceptance says "the capture landed at `collected`". A DRAINED
     capture lands at NO bundle state at all: `op=acquire` writes the bytes to
     R2 and a `captured_locators` row and creates NO bundle and NO register
     entry (MEASURED in this worktree 2026-08-08 — `op=stats` reads bundles 0,
     register 0 after a successful acquire). A bundle at `collected` is what a
     later `promote` makes, registering the capture under a document.

     SO THE HONEST ANSWER HERE IS `undetermined`, AND THE ITEM SAYS SO. This is
     the sparse-record rule at exactly the level it was written for: no register
     row does NOT mean the document is part of nothing, it means there is no
     document yet to ask about. An item reporting `absent` here would be
     claiming more than the record can support — the defect class this project
     ranks above a missing feature. */
  const be = g(leads[0], "basis.basis_entry") || {};
  t("straight off the drain the basis question is UNDETERMINED and says which absence it is: the "
  + "bytes are held and no document in this store carries them yet, so there is nothing whose place "
  + "in a case could be asked. `absent` here would be an overclaim",
    [be.state, be.reason, be.bundle_id], ["undetermined", "unregistered_capture", null]);
}

/* ------------------------------------------------------------------------
   AND NOW THE `collected` HALF, reached by the act that actually produces it.
   A promote registering the captured digest under an INFO bundle is what puts
   a capture into the corpus, and the intake doctrine caps it at `collected` —
   sweep material never ratifies itself. */
const DOC_V = "INFO-2026-4901-northbay-0042-contract";
{
  const rows = await GET(`op=capturerequests&token=${RUTH}&run=${RUN}`);
  const row = rows.requests.find((r) => r.request === LEAD_REQ);
  t("the row is `captured` and carries the digest the daemon filed",
    [row.state, typeof row.capture_sha === "string" && row.capture_sha.length === 64],
    ["captured", true]);
  await promote(DOC_V, infoMd(DOC_V), "information", "collected", RUTH,
    [{ sha256: row.capture_sha, path: "snapshots/northbay-0042.pdf", encoding: "binary", bytes: 4096 }]);
  const be = g(leadsIn(await queueOf(CAROL)).find((i) => g(i, "basis.address") === VENDOR),
               "basis.basis_entry") || {};
  t("once the capture IS registered under a document, the lead reports that document and its state — "
  + "`collected` and NEVER higher, an entry to the store rather than to a leg of any claim "
  + "(D-213, the intake doctrine)", [be.bundle_id, be.bundle_state], [DOC_V, "collected"]);
}

/* ====================================================================== 4
 * THE ITEM: THE `case` SET IS INQUIRY B'S ANCESTORS AND NOT INQUIRY A'S.
 * ====================================================================== */
console.log("\n--- 4. the case set derives from inquiry B's ancestors, NOT inquiry A's ---");
{
  const lead = leadsIn(await queueOf(CAROL))[0] || {};
  const homes = (g(lead, "case.ancestors") || []).map((a) => a.id).sort();
  t("its homes are inquiry B's project", homes, [PROJ_B]);
  t("and inquiry A's project appears NOWHERE in the item — not as a home, not in the subject, not "
  + "anywhere in the answer this member receives. Filing it under the question the run happened to "
  + "be working is precisely what made these leads homeless (D-213)",
    JSON.stringify(lead).includes(PROJ_A), false);
  t("the item is NOT ungrouped: it has a real home, which is the whole difference between a lead "
  + "with a producer and D-194's authored frontier", g(lead, "case.ungrouped"), false);
  /* BOTH QUESTIONS ARE NAMED AND THEY ARE NAMED APART. A single `inquiry` field
     would collapse the distinction the item exists for. */
  t("the basis names BOTH questions, under two different keys",
    [g(lead, "basis.found_while_working"), g(lead, "basis.bears_on")], [INQ_A, INQ_B]);
  t("and the subject points at the question the evidence is ABOUT, never at the one being worked",
    g(lead, "subject.inquiry"), INQ_B);

  /* D-15's posture, at the one level the gate actually operates: only PROJECT
     bundles are participation-gated (query.mjs viewerPredicate), so the honest
     arm is that an uninvited member gets the finding — it is the record's own
     question about the world — with the project named nowhere in it. */
  const daveLead = leadsIn(await queueOf(DAVE))[0] || null;
  t("dave, never invited to either project, still receives the lead — a FINDING stands for every "
  + "member, because it is a fact about the world and not about a reader", !!daveLead, true);
  t("and neither project's id appears anywhere in his answer (REC-30: withheld whole, with no count, "
  + "because a count is the leak)",
    [JSON.stringify(daveLead).includes(PROJ_B), JSON.stringify(daveLead).includes(PROJ_A)],
    [false, false]);
  /* AND THE TWO ABSENCES ARE DISTINGUISHED, which is the same discipline the
     basis question obeys one block down. Dave's answer is UNDETERMINED with
     `out_of_view`, NOT `ungrouped`: an ancestor he may not see is not the same
     fact as no ancestor existing, and reporting the second would tell him the
     question sits under nothing when the truth is that we are not saying. */
  t("and the absence is the RIGHT absence: undetermined with `out_of_view`, never `ungrouped` — a "
  + "home withheld and a home that does not exist are different facts and only one of them is his",
    [g(daveLead, "case.state"), g(daveLead, "case.reasons"), g(daveLead, "case.ungrouped")],
    ["undetermined", ["out_of_view"], false]);
}

/* ====================================================================== 5
 * NO BASIS ENTRY — AND THE ABSENCE IS MEASURED, IN ALL THREE DIRECTIONS.
 *
 * THE INSTRUMENT IS DRIVEN OVER A REAL DIFFERENCE OR IT IS NOT DRIVEN. A walk
 * that only ever meets absence reports its verdict triumphantly and proves
 * nothing, so this block produces all three answers `#leadBasisAbsence` can
 * give — undetermined, absent, present — from three documents in the same
 * store, read through the same member-facing field.
 * ====================================================================== */
console.log("\n--- 5. the store entry with NO basis entry, and the absence is MEASURED (three states) ---");
const INQ_D = "INQ-2026-4400-does-northbay-perform";
{
  let queueSnapshot = await queueOf(CAROL);
  const be = g(leadsIn(queueSnapshot).find((i) => g(i, "basis.address") === VENDOR),
               "basis.basis_entry") || {};
  t("the basis entry is ABSENT, and the reason says WHICH absence it is — not made part of the case, "
  + "rather than nobody having looked (CLAUDE.md: absence at one level is not evidence of absence at "
  + "the next, and saying which is a first-class obligation)",
    [be.state, be.reason], ["absent", "not_made_part_of_the_case"]);
  t("and it is a COUNT this producer took rather than a field it left empty — BOTH basis projections "
  + "asked (the current basis AND every proposed reading's legs), both zero",
    [be.basis_legs, be.version_legs], [0, 0]);

  /* A SECOND LEAD whose capture is never registered, so the UNDETERMINED state
     stands beside the ABSENT one in the same answer. Two leads that read the
     same word would prove the field is constant, not that it is measured. */
  const second = await request({ address: SECOND, lead_inquiry: INQ_B });
  t("fixture: a second lead requested", second.ok, true);
  await drain();
  queueSnapshot = await queueOf(CAROL);
  const two = leadsIn(queueSnapshot);
  t("two leads now stand", two.length, 2);
  t("and they report DIFFERENT basis states from the same field, in the same answer: the registered "
  + "capture is `absent` (looked for, not part of any case) and the unregistered one is "
  + "`undetermined` (no document to ask about). An instrument that could not tell those apart would "
  + "report one of them wrongly and nothing would say so",
    two.map((i) => g(i, "basis.basis_entry.state")).sort(), ["absent", "undetermined"]);

  /* THE THIRD STATE, and it is the one that proves the counter reads the tables
     rather than returning a constant. A new question resting on the captured
     document gives `inquiry_basis` a row whose `target_id` is that document,
     and the SAME field must flip to `present` with a non-zero count. */
  const legMd = ["---",
    `id: ${INQ_D}`, "object_type: inquiry", "schema: inquiry@1",
    `title: "Does Northbay perform on what it holds?"`, "current_state: open", "prior_state: null",
    `created: "${NOW}"`, `last_updated: "${LATER}"`,
    "produced_by:", "  mode: agent", "  capability_tier: high",
    /* C-6.3: an inquiry carrying a basis leg carries the same target as a
       reference, so the two projections cannot disagree. */
    "group: believe-in-oakland", ...refLines([DOC_V]), "state_history: []",
    "annotations_open: 0",
    "reeval_pending:", "  flag: false", "  since: null", "  source: null",
    "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
    "recheck_triggers:", "  - text: Revisit after the next contract cycle",
    "    description: The next award may restate the basis.",
    /* `hunch` and not `resolution`: an EARNED grade is one a question naming no
       subject entity cannot claim (REC-18), and hunch is the honest name for an
       authored connection grade — it carries an author and a date (DEC-15). */
    "basis:", `  - target: ${DOC_V}`, "    role: supports", "    grade: B",
    "    grade_axis: connection", "    grade_source: hunch",
    "    author: suite", "    date: 2026-08-08",
    "---", "",
    "## Question", "", "Does Northbay perform on what it holds?", "",
    "## What It Rests On", "", "## Conclusion", "",
    "## What Would Falsify This", "", "## Session Log", "",
    `### Session ${LATER} | Formation | agent`,
    "Trigger: surfacing", "Changes: created.", "",
    "## Review Notes", ""].join("\n");
  const made = await POST(`op=promote&token=${RUTH}`, {
    bundleId: INQ_D, base: null, snapKey: `${INQ_D}-withleg`,
    files: [{ path: "bundle.md", text: legMd, bytes: legMd.length, sha256: sha(legMd) }],
    register: [],
    meta: { object_type: "inquiry", group: "believe-in-oakland", title: `Bundle ${INQ_D}`,
            current_state: "open", created: NOW, last_updated: LATER } });
  /* The refusal text rides the assertion rather than a bare `false`, because a
     fixture that fails silently sends the next reader to the producer to look
     for a defect the fixture caused (C-6.3 refused the first draft of this
     bundle and the message is what said so). */
  t("fixture: a NEW question is promoted resting on the captured document",
    made.ok !== false || JSON.stringify(made).slice(0, 300), true);
  const after = g(leadsIn(await queueOf(CAROL)).find((i) => g(i, "basis.address") === VENDOR),
                  "basis.basis_entry") || {};
  t("the SAME field now reads `present`, with the count that made it so — so the `absent` above was "
  + "a measurement of an empty set and not a constant this producer always prints",
    [after.state, after.reason, after.basis_legs > 0], ["present", "carried_by_a_reading", true]);
  t("and the item is still emitted rather than suppressed: it is the record of an observation "
  + "somebody made, and that stays true after the document becomes evidence",
    leadsIn(await queueOf(CAROL)).length, 2);
}

/* ====================================================================== 6
 * A REAL `basis`, A REAL `options[]`, AND THE GRAIN GAP DECLARED (D-222).
 * ====================================================================== */
console.log("\n--- 6. a real basis and a real options[], with the inquiry-grain gap DECLARED ---");
{
  const lead = leadsIn(await queueOf(CAROL)).find((i) => g(i, "basis.address") === VENDOR) || {};
  t("the basis names its source table, the request, the run and the address — nothing here is a "
  + "sentence a surface would have to parse",
    [g(lead, "basis.source"), g(lead, "basis.request") === LEAD_REQ, g(lead, "basis.run"),
     g(lead, "basis.address")],
    ["capture_requests", true, RUN, VENDOR]);
  t("BOTH principals are named through the one composer (DEC-27(b), DEC-55.4): the act is the "
  + "daemon's, machine-shaped, at the session's request",
    [g(lead, "basis.attribution.ok"), /^token:/.test(g(lead, "basis.attribution.actor") || ""),
     typeof g(lead, "basis.attribution.statement") === "string"], [true, true, true]);
  t("the age is DETERMINED from the capture's own instant rather than from the read's clock",
    g(lead, "age.state"), "determined");
  t("options[] is REAL — acts this record can actually perform, on inquiry B",
    (g(lead, "options") || []).length > 0, true);
  t("and the grain gap is DECLARED on the item rather than hidden behind an empty array: the acts a "
  + "member would most want here are at INQUIRY grain and do not exist yet (D-222)",
    [g(lead, "options_grain.offered"), g(lead, "options_grain.missing")], ["document", "inquiry"]);
  /* THE SIBLING PRODUCER STILL FIRES. PL-4's `#conditionsCaptureRequested` walks
     the SAME table and files on `target`. Two producers, one table, two homes,
     and a surface assuming one producer per kind reads the second as a
     duplicate — which is why both are asserted together here. */
  const q = await queueOf(CAROL);
  const sibling = ((q && q.items) || []).filter((i) => i.kind === "capture-completed-unattended");
  t("the SIBLING producer over the same table still fires, and files under inquiry A's side — two "
  + "producers, one table, two different homes, and that difference is why both exist",
    sibling.length > 0, true);
  t("and the two are different CLASSES, so nothing can read one as a duplicate of the other",
    [...new Set([...sibling.map((i) => i.class), g(lead, "class")])].sort(), ["CONDITION", "FINDING"]);
}

/* ====================================================================== 7
 * THE MINT REFUSES AN UNKNOWN KIND — FOR EVERY CLASS, NOT CONDITION ALONE.
 * ====================================================================== */
console.log("\n--- 7. the mint refuses an unknown kind, and the fence covers EVERY class (the sweep) ---");
{
  t("every kind every producer emits is one the catalogue names, and is minted under the class the "
  + "catalogue files it under — asked of the LIVE feed, not of a source literal",
    (((await queueOf(CAROL)) || {}).items || []).filter((i) => classOfKind(i.kind) !== i.class), []);
  /* THE SWEEP, ASSERTED STRUCTURALLY. The old fence read
     `it.class === "CONDITION" && classOfKind(...)`, so it judged one class of
     three. The new one judges the kind of EVERY item, whatever its class. */
  const region = STORE_SRC.slice(STORE_SRC.indexOf("DEC-49 REGION is-queue-mint"),
                                 STORE_SRC.indexOf("END DEC-49 REGION is-queue-mint"));
  t("the mint's governed region exists and is a REGION rather than the whole of queueFeed — a "
  + "whole-function `where` conscripts refusals that arrive later (REC-71)",
    region.length > 200, true);
  t("and it judges the kind of EVERY item: no clause in it is guarded on a single class, which is "
  + "the defect REC-32's CONDITION-only fence left standing for the other two",
    /it\.class === "CONDITION"/.test(region), false);
  t("its two kind refusals say WHICH failure happened — unknown is not the same as misfiled, and "
  + "collapsing them would be the gate that pressures somebody into guessing",
    [/NO_SUCH_KIND/.test(region), /KIND_MISCLASSED/.test(region)], [true, true]);
  t("all three codes are STRING LITERALS at their sites, which is what lets the DEC-49 guard COMPARE "
  + "them rather than read past them (a code held in a variable is invisible to it)",
    [/refusal\("NO_CLASS"/.test(region), /refusal\("NO_SUCH_KIND"/.test(region),
     /refusal\("KIND_MISCLASSED"/.test(region)], [true, true, true]);
  /* EACH C-NUMBER NAMED LITERALLY, and the reason is `scripts/coverage.mjs`
     rather than tidiness: it counts a check as NAMED only when an assertion
     mentions its number, and a regex over the shape `C-31.\d` satisfies nothing.
     A check named by no assertion is one exercised only in the direction that
     passes — the C-20.1 class, where the audit was clean because it was not
     looking. C-31.1 was exactly that after the block below was written, and
     `--strict` said so. */
  t("C-31.1 is the classless item, C-31.2 the kind no catalogue names, C-31.3 the kind filed "
  + "under another class — three numbers, three distinct facts, and each pinned to its own code "
  + "so a renumbering cannot quietly swap two of them",
    [QUEUE_MINT_CHECKS.NO_CLASS.check, QUEUE_MINT_CHECKS.NO_SUCH_KIND.check,
     QUEUE_MINT_CHECKS.KIND_MISCLASSED.check], ["C-31.1", "C-31.2", "C-31.3"]);
  t("and every one carries a complete DEC-49 row: a C-number, the smallest span that enforces it, "
  + "and the sentence a member reads",
    Object.entries(QUEUE_MINT_CHECKS).map(([k, v]) =>
      [k, /^C-31\.\d+$/.test(v.check), v.where.includes("is-queue-mint"), v.translation.length > 60]),
    [["NO_CLASS", true, true, true], ["NO_SUCH_KIND", true, true, true],
     ["KIND_MISCLASSED", true, true, true]]);
  /* THE REFUSAL IS WHOLE. A feed quietly one item shorter is indistinguishable
     from nobody caring — the same argument the mute block makes about reporting
     its own suppressions. */
  t("the mint returns a refusal for the WHOLE answer rather than dropping the offending item",
    /return refusal\("NO_SUCH_KIND"/.test(region), true);
  /* THE ORDER IS THE FENCE, and this pin exists because the control found the
     hole rather than the reader. The mute loop REMOVES items, so while it ran
     first, an item a member had muted never reached the mint — and the one case
     that matters is exactly reachable: a FINDING minted under a kind the
     catalogue files as a CONDITION is precisely what op=queuemute's write fence
     accepts, so the worst misfiling could be muted away with the mint blind to
     it. Asserted over the source because "before" is a claim about ORDER and no
     behavioural arm over a correct feed can see it. */
  t("the mint runs BEFORE the personal mute loop: an item a member muted must still be validated, "
  + "because what a producer MINTS is a different question from what survives one member's "
  + "preferences — and the misclassed FINDING is exactly the item a mute could have hidden",
    STORE_SRC.indexOf("DEC-49 REGION is-queue-mint")
      < STORE_SRC.indexOf("const mutes = this.#queueMutes(me);"), true);
}

/* ====================================================================== 8
 * THE PURGE, PROVED BY CONSEQUENCE — THE HALF hygiene CANNOT SEE (D-113).
 * ====================================================================== */
console.log("\n--- 8. purge inquiry B and the lead goes quiet, for EVERY viewer (D-113, by consequence) ---");
{
  t("fixture: leads stand before the purge", leadsIn(await queueOf(CAROL)).length, 2);
  const p = await GET(`op=purge&token=adm-pl15&confirm=bio&bundleId=${INQ_B}`);
  t("inquiry B is purged", p.ok, true);
  const after = await queueOf(CAROL);
  t("every lead filed under it is gone from a MEMBER's feed", leadsIn(after).length, 0);
  t("the feed itself is still healthy — the leads went, nothing else did", after.ok, true);

  /* THE HALF THE MEMBER VIEW CANNOT PROVE, AND THIS SUITE FOUND IT BY RUNNING
     THE CONTROL RATHER THAN BY READING THE CODE. `#bundleGate` compiles an
     EXISTS over `bundles` for an identified member, so a lead pointing at a
     purged question is filtered out of a member's feed whether or not purge
     cleared the column — the member-facing arm alone would have passed over a
     missing purge clause and reported a clean verdict. It is recorded here
     rather than smoothed, because an arm that comes back green when red was
     predicted is a finding about the arm.

     A MACHINE CREDENTIAL IS THE VIEWER THAT SEES THE DIFFERENCE. `#bundleGate`
     returns `1=1` for a machine class — deliberately, and for the reason D-15
     states: there is no person behind an instance-level token whose
     participation could be checked. So the operator view is where a stale
     `lead_inquiry` actually surfaces, and it is the arm that has teeth. */
  const machine = await GET(`op=queue&token=mem-pl15`);
  t("and gone from the OPERATOR view too — the viewer whose gate is `1=1` and therefore the only "
  + "one that can see a stale pointer at all. THIS is the assertion the per-bundle purge clause "
  + "buys: hygiene compares TABLE lists and stays GREEN, the member gate hides the row by accident, "
  + "and only this arm fails when the column is left uncleared",
    [machine.ok, leadsIn(machine).length], [true, 0]);

  /* AND AT THE ROW, because a feed going quiet is a consequence and the stale
     pointer is the fact. PL-3's own reason for `suggest_refusals`' per-bundle
     DELETE applies unchanged: a later bundle allocated a colliding id would
     inherit somebody else's lead and a member working a brand-new question
     would be told about a document captured for a question that no longer
     exists. */
  const rows = await GET(`op=capturerequests&token=${RUTH}&run=${RUN}`);
  /* THE FIELD IS PUBLISHED, ASSERTED BEFORE IT IS FILTERED ON. This is not
     ceremony: the arm below filtered on `lead_inquiry` while op=capturerequests
     did not publish it, so it counted zero for every input and would have
     passed over a missing purge clause exactly as happily as over a correct
     one. A filter over a field nobody sends is the arm that asserts nothing. */
  t("op=capturerequests PUBLISHES the lead, so the filter below is over a field that exists — a "
  + "filter over a field nobody sends counts zero for every input and proves nothing",
    (rows.requests || []).every((r) => "lead_inquiry" in r), true);
  t("no surviving request still names the purged question — the pointer is CLEARED, not merely "
  + "hidden, so a later bundle allocated a colliding id cannot inherit somebody else's lead",
    (rows.requests || []).filter((r) => r.lead_inquiry === INQ_B).length, 0);
  t("and the capture requests THEMSELVES survive, because they are accountable to inquiry A and A "
  + "still exists: purging B clears the observation, not the record of the fetch",
    (rows.requests || []).length > 0, true);
}

/* ====================================================================== 9
 * OVER-STRICTNESS AND DEC-49's REGISTRY.
 * ====================================================================== */
console.log("\n--- 9. over-strictness: correct work in spellings this item did not anticipate ---");
{
  const plain = await request({ address: PLAIN });
  t("a request naming NO lead is accepted exactly as before — the lead is optional and its absence "
  + "is the common case", [plain.ok, plain.lead_inquiry], [true, null]);
  await drain();
  t("and it produces NO lead item: nothing is minted for a request that made no observation",
    leadsIn(await queueOf(CAROL)).length, 0);

  const alt = await request({ address: LEGACY, lead: INQ_C });
  t("`lead` is accepted as well as `lead_inquiry` — a caller using the shorter spelling is doing "
  + "correct work", alt.ok, true);
  t("and a LEGACY-typed question (`focus`, REC-10's retired spelling) is a legal lead: the door asks "
  + "the catalog through normalizeType, so a spelling this item did not anticipate is not refused",
    alt.lead_inquiry, INQ_C);
  await drain();
  t("it surfaces as a lead like any other", leadsIn(await queueOf(CAROL)).length, 1);

  console.log("\n--- 9b. DEC-49: the driven set EQUALS the registry for the codes this item added ---");
  t("both door codes were DRIVEN by this suite, not merely declared — a refusal nobody can drive is "
  + "a refusal nobody can prove fires",
    [...DRIVEN].filter((c) => /^CAPTURE_REQUEST_LEAD_/.test(c)).sort(),
    ["CAPTURE_REQUEST_LEAD_IS_THE_TARGET", "CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY"]);
  t("and each carries a complete row in PL-4's family — added there rather than to a new one, "
  + "because they are enforced inside THAT family's governed span (SK-1's rule: a family is a floor)",
    ["CAPTURE_REQUEST_LEAD_NOT_AN_INQUIRY", "CAPTURE_REQUEST_LEAD_IS_THE_TARGET"].map((k) =>
      [/^C-28\.\d+$/.test(CAPTURE_REQUEST_CHECKS[k].check),
       CAPTURE_REQUEST_CHECKS[k].where.includes("is-capture-request"),
       CAPTURE_REQUEST_CHECKS[k].translation.length > 60]),
    [[true, true, true], [true, true, true]]);
  /* THE MINT'S THREE ARE NOT DRIVABLE THROUGH ANY LIVE CALLER PATH AND THAT IS
     REPORTED RATHER THAN SMOOTHED. Every producer emits a literal kind, so no
     request a caller can make reaches these branches — they guard a FUTURE
     producer, which is where a mint fence earns its keep. PL-14's C-30.7/C-30.8
     are the precedent and the distinction it drew is the one that matters:
     these are NOT the empty gate PL-4 deleted (a condition the code cannot
     produce), because an ordinary edit to any producer produces them, and
     `leadslug.control.mjs` arms exactly that edit and records what failed. */
  t("the mint's three codes are declared UNDRIVABLE by a live caller and are driven by the control "
  + "harness instead — stated here so nobody later reads their absence from the driven set as a gap",
    Object.keys(QUEUE_MINT_CHECKS).sort(), ["KIND_MISCLASSED", "NO_CLASS", "NO_SUCH_KIND"]);

  console.log("\n--- 9c. the schema traps, asserted over this column's own span ---");
  const tbl = SCHEMA_SRC.indexOf("CREATE TABLE IF NOT EXISTS capture_requests");
  const body = SCHEMA_SRC.slice(tbl, SCHEMA_SRC.indexOf("\n);", tbl));
  t("the column is declared and is NULLABLE — a non-null default would invent an observation nobody "
  + "made, and on THIS column that would mint a notification out of a migration",
    /lead_inquiry\s+TEXT\s*$/m.test(body), true);
  t("it is backfilled by #migrate's ADD COLUMN list, so a store migrated forward and a fresh install "
  + "present the same table", /\["capture_requests", "lead_inquiry", "TEXT"\]/.test(STORE_SRC), true);
  t("purge clears it in the per-bundle arm as well as the whole-store one — the column names a "
  + "SECOND bundle id and the whole-store DELETE cannot be the only cover",
    /UPDATE capture_requests SET lead_inquiry=NULL WHERE lead_inquiry=\?/.test(STORE_SRC), true);
}

} catch (e) {
  console.log(`  FAIL  the suite threw: ${e && e.stack ? e.stack : e}`);
  fail++;
} finally {
  await mf.dispose();
}

console.log(`\n${pass} pass, ${fail} fail`);
/* ENDS ON ITS OWN RESULT (hygiene.test.mjs's rule): the exit code IS the failure
   count, so a suite whose process merely finished cannot be mistaken for one
   that finished GREEN. */
process.exit(fail ? 1 : 0);
