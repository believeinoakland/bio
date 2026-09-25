/* NEGATIVE CONTROL: (RUN 2026-09-25 by WORKER D-147, each arm ALONE through a harness that copied a uniquely-named per-arm pristine file, armed it by an anchor asserted to match exactly once, ran this suite, and restored it verified by sha256 AND cmp with a byte count printed — checks/bio-checks.mjs c730c511… 980,181 B, src/store.mjs fc2bb576… 3,356,700 B; re-run after the last store edit, identical tallies) (0) baseline, nothing armed -> 65 pass / 0 fail. (a) THE ROW'S OWN — default a due date from the action's KIND in `requestLifecycleOf` (a cpra_request entry with none stated reads due ten days after it, cited `CPRA`). DECLARED: section 2's UNDETERMINED ARM fails by name, with section 3's no-law-encoded arms; sections 4 and 6 do not move. ACTUAL -> 59/6: "UNDETERMINED ARM: on a cpra_request action, every entry with no stated due date reads undetermined — none computed", its sentence arm, the three section-3 kind arms, and section 5's not-stated read (OLD is a cpra_request too); nothing in 4 or 6. Section 1's `passed_unanswered` stayed GREEN because the armed default reads `open` — which is why the undetermined arm, not the passed list, carries this control. (b) OVER-STRICTNESS — drop `none_stated` from CORRESPONDENCE_OUTCOMES. DECLARED: the over-strictness arm fails. ACTUAL -> 63/2: it, and the published vocabulary's literal. (c) drop the op's citation-on-the-list judgement (`onList = cited ? listed.includes(cited) : true` -> `true`). DECLARED: the DUE_CITE_NOT_GOVERNING arms fail. ACTUAL -> 58/7: both refusal arms, the code tally, "every code of the family was driven", and three downstream arms that move because the refused entries were then WRITTEN. (d) drop the lifecycle arm from `correspondenceFindings`. DECLARED: the catalog and promote arms fail and the op's refusals do not. ACTUAL -> 63/2, exactly those two. */
/* D-147: A RECORDS REQUEST IS ONE ROUND TRIP (BOB #27, 2026-09-22; `BIO_Case_Making_v0_1.md` §2,
 * *THE RECORDS-REQUEST LIFECYCLE*), on D-148's entry grammar and bound by D-149.
 *
 * `awaiting_response` hid the fee estimate, the waiver decision, a partial production and the appeal. Each
 * stage after the request is now its OWN correspondence entry naming the entry it answers or follows (`stage`,
 * `follows`); a decision carries its OUTCOME in a closed vocabulary; a member may state the date the NEXT stage
 * is due with its citation (`due_by`, `due_cite`), which must be one of the action's D-149 governing laws. The
 * plane derives only the days between entries and that a stated date passed with nothing following it.
 *
 * WHAT THIS SUITE HOLDS THE ROW TO, its accepts-when in order:
 *   1. a request, a fee estimate, a waiver decision, a partial production and an appeal read back as ONE DATED
 *      CHAIN through op=projection's action block;
 *   2. an entry with no stated due date reads UNDETERMINED, with the plane's sentence — on a cpra_request
 *      action, whose KIND is the one a liar would compute a clock from (the row's negative control);
 *   3. a stated date passed with no answer is DERIVED, and NO LAW IS ENCODED: two actions differing only in
 *      kind read the same chain, and the reader never consults the kind;
 *   4. the grammar refuses BY NAME at the op, at the catalog (C-2.10 carrying the C-94 code) and at promote;
 *      a due date citing a law not on the action's list is refused at the op;
 *   5. OVER-STRICTNESS: an entry written before this row, a non-response naming what it awaited, and a citation
 *      with a section sign and spaces all land; an entry with no lifecycle parameter writes no lifecycle key;
 *   6. the two closed sets are published by op=affordances as the SAME objects the catalog judges against.
 * Every op is driven through the CONTROL PLANE, a real caller's only route (D-43).
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, parseFrontmatter, lifecycleFindings, requestLifecycleOf, LIFECYCLE_CHECKS,
         CORRESPONDENCE_STAGES, CORRESPONDENCE_OUTCOMES, DUE_UNDETERMINED_SAYS } from "../checks/bio-checks.mjs";
import { VOCABULARIES } from "../src/affordances.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));

/* The store's ambient clock is PINNED: nothing in this suite reads the wall. */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const AS_OF = Date.parse("2026-08-20T00:00:00Z");

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-d147", MEMBER_TOKEN: "mem-d147", PROBE_TOKEN: "prb-d147",
              VERSION: "test", BIO_NOW_MS: String(AS_OF) },
});

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};
const sha = (v) => createHash("sha256").update(v).digest("hex");
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => (await mf.dispatchFetch(`http://x/api/?${q}`)).json();
const POST = async (q, body) => (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json();
const qs = (o) => Object.entries(o).filter(([, v]) => v !== undefined)
  .map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join("");

/* The ops under test, UNINTERPOLATED so coverage credits them where a caller reaches them. */
const correspond = async (tok, p) => rP(await GET(`op=actioncorrespond&token=${tok}${qs(p)}`));
const setLaws = async (tok, target, laws) =>
  rP(await POST(`op=actionlaws&token=${tok}&target=${encodeURIComponent(target)}`, { laws }));
const projection = async (tok, id) =>
  rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}&now=${AS_OF}`));
const bytesOf = async (tok, id) => {
  const d = rP(await GET(`op=file&token=${tok}&id=${encodeURIComponent(id)}&path=bundle.md`));
  return typeof d === "string" ? d : (d?.text ?? d?.content ?? "");
};
const lifecycle = async (id) => (await projection(NADIA, id))?.action?.lifecycle;

const actionMd = (id, { kind = "cpra_request", correspondence = [] } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Records request ${id}"`, "current_state: active", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  `action_kind: ${kind}`, "risk_tier: 1",
  "counterparty:", "  state: named", "  name: City Clerk",
  ...(correspondence.length ? ["correspondence:", ...correspondence.flatMap((e) =>
    [`  - direction: ${e.direction}`, ...Object.entries(e).filter(([k]) => k !== "direction")
      .map(([k, v]) => `    ${k}: ${typeof v === "string" && !["at", "author", "stage", "outcome"].includes(k) ? `"${v}"` : v}`)])] : []),
  "---", "",
  "## Plan", "", "Ask for the police overtime ledger.", "",
  "## Status", "", "## Correspondence", "",
  "## Session Log", "", `### Session ${LATER} | Formation | nadia`,
  "Trigger: intake", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

/* ------------------------------------------------------------- the roster */
const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-d147",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");        // the 4.2 two-administrator floor

let snapKeySeq = 0;   /* a per-suite COUNTER, never Math.random (M0-132) */
const promote = async (tok, id, text, base = null) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}-${String(++snapKeySeq).padStart(4, "0")}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    /* CORRECTED at the c22-batch29 union (CONDUCT #22), never exempted: D-563 (C-86.3) refuses an envelope title the
       held document contradicts, and D-147 was written on a base without it, so `title: \`Bundle ${id}\`` against
       the document's "Records request …" made every promote here ENVELOPE_TITLE_DISAGREES. The envelope's title is
       dropped exactly as D-563 dropped it in its 177 fixtures (actionquote.test.mjs's shape): promote derives it. */
    meta: { object_type: "action", group: "believe-in-oakland",
            current_state: "active", created: NOW, last_updated: LATER },
  }));

const CPRA = "Cal. Gov. Code § 7922.535";
const SUNSHINE = "Oakland Mun. Code ch. 2.20";
const ACT = "ACTN-2026-1470-overtime-ledger";       // the chain, a cpra_request
const TWIN = "ACTN-2026-1471-overtime-twin";        // the same chain, another kind
const OLD = "ACTN-2026-1472-pre-lifecycle";         // entries with no lifecycle key at all

/* =====================================================================
   0. THE GROUND: three actions; the governing laws stated by a member (D-149).
   ===================================================================== */
console.log("--- 0. the ground ---");
{
  t(`${ACT} lands (cpra_request)`, (await promote(NADIA, ACT, actionMd(ACT))).ok, true);
  t(`${TWIN} lands (another kind, the same everything else)`,
    (await promote(NADIA, TWIN, actionMd(TWIN, { kind: "letter" }))).ok, true);
  t(`${OLD} lands`, (await promote(NADIA, OLD, actionMd(OLD))).ok, true);
  for (const id of [ACT, TWIN])
    t(`${id}: a member states its governing laws (state and local)`,
      (await setLaws(NADIA, id, [{ level: "state", citation: CPRA }, { level: "local", citation: SUNSHINE }])).ok, true);
}

/* =====================================================================
   1. ONE DATED CHAIN: request, fee estimate, waiver request and decision, partial production, appeal.
   ===================================================================== */
console.log("\n--- 1. one dated chain ---");
const CHAIN = [
  { direction: "sent", at: "2026-07-03", account: "Emailed the records request.", stage: "request",
    due_by: "2026-07-13", due_cite: CPRA },
  { direction: "received", at: "2026-07-10", account: "The clerk estimated the fee.", stage: "fee_estimate",
    follows: "0", quote_amount: "1,083.00", quote_currency: "USD", quote_answers: "0" },
  { direction: "sent", at: "2026-07-12", account: "Asked for the fee to be waived.", stage: "fee_waiver_request",
    follows: "1" },
  { direction: "received", at: "2026-07-20", account: "The clerk refused the waiver.",
    stage: "fee_waiver_decision", follows: "2", outcome: "denied" },
  { direction: "received", at: "2026-07-25", account: "The clerk produced part of the ledger.",
    stage: "production", follows: "0", outcome: "partial", exemptions: "Gov. Code 7927.705; personnel records" },
  { direction: "sent", at: "2026-07-28", account: "Appealed the waiver decision.", stage: "appeal",
    follows: "3", due_by: "2026-08-10", due_cite: SUNSHINE },
];
for (const id of [ACT, TWIN]) {
  for (const [i, e] of CHAIN.entries()) {
    const r = await correspond(NADIA, { target: id, ...e });
    t(`${id}: entry ${i} (${e.stage}) records`, [r.ok, r.ord, r.reason ?? null], [true, i, null]);
  }
}
{
  const text = await bytesOf(NADIA, ACT);
  const led = parseFrontmatter(text).data?.correspondence || [];
  t("the stages are in the SIGNED BYTES, each naming the entry it follows",
    led.map((e) => [e.stage, e.follows ?? null, e.outcome ?? null]),
    [["request", null, null], ["fee_estimate", 0, null], ["fee_waiver_request", 1, null],
     ["fee_waiver_decision", 2, "denied"], ["production", 0, "partial"], ["appeal", 3, null]]);
  t("...and the due dates with their citations, as the member stated them",
    [led[0].due_by, led[0].due_cite, led[5].due_by, led[5].due_cite], ["2026-07-13", CPRA, "2026-08-10", SUNSHINE]);

  const lc = await lifecycle(ACT);
  t("READ BACK AS ONE DATED CHAIN through op=projection: ord, date, stage, the entry followed, the days since it",
    (lc?.entries || []).map((e) => [e.ord, e.at, e.stage, e.follows, e.elapsed_days]),
    [[0, "2026-07-03", "request", null, null], [1, "2026-07-10", "fee_estimate", 0, 7],
     [2, "2026-07-12", "fee_waiver_request", 1, 2], [3, "2026-07-20", "fee_waiver_decision", 2, 8],
     [4, "2026-07-25", "production", 0, 22], [5, "2026-07-28", "appeal", 3, 8]]);
  t("...and what followed each, both ways",
    (lc?.entries || []).map((e) => e.followed_by), [[1, 4], [2], [3], [5], [], []]);
  t("the decision's and the production's outcomes read as the body gave them; the exemptions verbatim",
    [lc?.entries?.[3]?.outcome, lc?.entries?.[4]?.outcome, lc?.entries?.[4]?.exemptions],
    ["denied", "partial", "Gov. Code 7927.705; personnel records"]);
  t("the fee estimate carries D-148's quote as quoted", lc?.entries?.[1]?.quote, { amount: "1,083.00", currency: "USD" });
  t("the read is as of the pinned instant", lc?.as_of, "2026-08-20");

  /* THE DERIVED HALF: a stated date met, and a stated date passed with nothing following it. */
  t("a stated due date that an entry followed by that date reads followed_by_due, citation on the list",
    lc?.entries?.[0]?.due, { state: "stated", by: "2026-07-13", cite: CPRA, on_list: true, status: "followed_by_due" });
  t("A STATED DATE PASSED WITH NO ANSWER IS DERIVED: the appeal's, ten days past",
    lc?.entries?.[5]?.due, { state: "stated", by: "2026-08-10", cite: SUNSHINE, on_list: true,
                            status: "passed_unanswered", days_past: 10 });
  t("...and it is the only one the chain lists as passed", lc?.passed_unanswered, [5]);
  t("an unanswered entry says how long it has waited, counted from its own date", lc?.entries?.[5]?.days_since, 23);
}

/* =====================================================================
   2. THE UNDETERMINED ARM — the row's negative control is aimed here.
   ===================================================================== */
console.log("\n--- 2. an entry with no stated due date reads UNDETERMINED ---");
{
  const lc = await lifecycle(ACT);
  const undetermined = (lc?.entries || []).filter((e) => e.due?.state === "undetermined").map((e) => e.ord);
  t("UNDETERMINED ARM: on a cpra_request action, every entry with no stated due date reads undetermined — none computed",
    undetermined, [1, 2, 3, 4]);
  t("...each with the plane's own sentence and no date at all",
    (lc?.entries || []).filter((e) => e.due?.state === "undetermined").map((e) => [Object.keys(e.due), e.due.says]),
    [1, 2, 3, 4].map(() => [["state", "says"], DUE_UNDETERMINED_SAYS]));
  t("the sentence says the clock is not computed from the kind", /not from the action's kind/.test(DUE_UNDETERMINED_SAYS), true);
}

/* =====================================================================
   3. NO LAW IS ENCODED.
   ===================================================================== */
console.log("\n--- 3. no law is encoded ---");
{
  const a = await lifecycle(ACT), b = await lifecycle(TWIN);
  t("two actions differing ONLY in kind (cpra_request, letter) read the SAME chain, due dates included",
    JSON.stringify(a?.entries), JSON.stringify(b?.entries));
  t("the floor: the compared chain is not empty", (a?.entries || []).length, 6);
  const fm = parseFrontmatter(actionMd(ACT, { correspondence: [
    { direction: "sent", at: "2026-07-03", account: "x", author: "member:nadia", stage: "request" }] })).data;
  t("the reader over bytes, the kind changed to every value a clock could hang on, answers the same",
    ["cpra_request", "letter", "foia_request", "records_request"].map((k) =>
      JSON.stringify(requestLifecycleOf({ ...fm, action_kind: k }, "2026-09-01").entries)).every((s, _, all) => s === all[0]),
    true);
  t("...and that entry, with no due date stated, reads undetermined at every kind",
    requestLifecycleOf(fm, "2026-09-01").entries[0].due.state, "undetermined");
  t("the chain's own sentence says it encodes no law's clock", /encodes no law's clock/.test(a?.says || ""), true);
}

/* =====================================================================
   4. REFUSED BY NAME — at the op, at the catalog, and at promote.
   ===================================================================== */
console.log("\n--- 4. refused by name ---");
{
  const base = { target: ACT, at: "2026-08-01", account: "An entry." };
  const cases = [
    ["a received stage on a sent entry", { direction: "sent", stage: "denial", follows: "0" }, "STAGE_NOT_OF_DIRECTION"],
    ["a stage on a non-response", { direction: "no_response", stage: "request" }, "STAGE_NOT_OF_DIRECTION"],
    ["a stage after the request naming nothing it follows", { direction: "received", stage: "acknowledgement" },
     "FOLLOWS_NO_ENTRY"],
    ["a stage following an entry that does not exist", { direction: "received", stage: "acknowledgement", follows: "99" },
     "FOLLOWS_NO_ENTRY"],
    ["an appeal naming a request, not a decision", { direction: "sent", stage: "appeal", follows: "0" },
     "APPEAL_NAMES_NO_DECISION"],
    ["an outcome on a sent entry", { direction: "sent", stage: "fee_waiver_request", follows: "3", outcome: "granted" },
     "OUTCOME_NOT_ON_RECEIVED"],
    ["an outcome outside the vocabulary", { direction: "received", stage: "appeal_decision", follows: "5",
      outcome: "mostly_granted" }, "OUTCOME_NOT_IN_VOCABULARY"],
    ["a decision with no outcome", { direction: "received", stage: "appeal_decision", follows: "5" },
     "DECISION_WITHOUT_OUTCOME"],
    ["a fee estimate with no quote", { direction: "received", stage: "fee_estimate", follows: "0" },
     "FEE_ESTIMATE_WITHOUT_QUOTE"],
    ["a due date with no citation", { direction: "received", stage: "extension_notice", follows: "0",
      due_by: "2026-08-30" }, "DUE_HALF_STATED"],
    ["a due date that is not a date", { direction: "received", stage: "extension_notice", follows: "0",
      due_by: "soon", due_cite: CPRA }, "DUE_NOT_A_DATE"],
    ["a due date citing a law NOT among the action's stated laws", { direction: "received", stage: "extension_notice",
      follows: "0", due_by: "2026-08-30", due_cite: "5 U.S.C. § 552" }, "DUE_CITE_NOT_GOVERNING"],
    ["exemptions the grammar cannot hold", { direction: "received", stage: "denial", follows: "0", outcome: "denied",
      exemptions: "the \"deliberative\" exemption" }, "LIFECYCLE_TEXT_UNWRITABLE"],
  ];
  const before = (await lifecycle(ACT))?.entries?.length;
  const seen = {};
  for (const [label, e, code] of cases) {
    const r = await correspond(NADIA, { ...base, ...e });
    t(`refused BY NAME: ${label}`, [r.ok, r.reason, r.code, r.check, typeof r.translation],
      [false, code, code, LIFECYCLE_CHECKS[code].check, "string"]);
    seen[r.code] = r.check;
  }
  t("each op refusal carries its own C-94 number, read back off the refusal the op returned", seen, {
    STAGE_NOT_OF_DIRECTION: "C-94.1", FOLLOWS_NO_ENTRY: "C-94.2", APPEAL_NAMES_NO_DECISION: "C-94.3",
    OUTCOME_NOT_ON_RECEIVED: "C-94.4", OUTCOME_NOT_IN_VOCABULARY: "C-94.5", DECISION_WITHOUT_OUTCOME: "C-94.6",
    FEE_ESTIMATE_WITHOUT_QUOTE: "C-94.7", DUE_HALF_STATED: "C-94.8", DUE_NOT_A_DATE: "C-94.9",
    DUE_CITE_NOT_GOVERNING: "C-94.10", LIFECYCLE_TEXT_UNWRITABLE: "C-94.11" });
  t("every code of the family was driven", Object.keys(seen).sort(), Object.keys(LIFECYCLE_CHECKS).sort());
  t("nothing was written by any refusal", (await lifecycle(ACT))?.entries?.length, before);
  const noLaws = await correspond(NADIA, { target: OLD, direction: "sent", at: "2026-08-01", account: "Request.",
    stage: "request", due_by: "2026-08-11", due_cite: CPRA });
  t("an action with NO governing laws stated cannot carry a cited due date: refused, and says what IS listed",
    [noLaws.ok, noLaws.reason, noLaws.governing_laws], [false, "DUE_CITE_NOT_GOVERNING", []]);
  t("...and the lease was given back: the next entry records at once",
    (await correspond(NADIA, { target: ACT, direction: "received", at: "2026-08-15",
      account: "The clerk acknowledged the appeal.", stage: "acknowledgement", follows: "5" })).ok, true);

  /* THE CATALOG, over bytes: the same rule reports C-2.10 carrying the C-94 code. */
  const BAD = "ACTN-2026-1473-bad-bytes";
  const bad = actionMd(BAD, { correspondence: [
    { direction: "sent", at: "2026-07-03", account: "Our request.", author: "member:nadia", stage: "request" },
    { direction: "received", at: "2026-07-05", account: "Their decision.", author: "member:nadia",
      stage: "denial", follows: 0 },
    { direction: "received", at: "2026-07-06", account: "Another.", author: "member:nadia", stage: "production" }] });
  const { findings } = await checkBundle({ folderName: BAD,
    files: new Map([["bundle.md", bad]]), sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    nowMs: AS_OF, resolveTarget: () => true });
  t("the CATALOG refuses both at C-2.10, each carrying its C-94 code",
    findings.filter((x) => x.check === "C-2.10" && x.code).map((x) => x.code),
    ["DECISION_WITHOUT_OUTCOME", "FOLLOWS_NO_ENTRY"]);
  const p = await promote(NADIA, BAD, bad);
  t("and PROMOTE refuses the bytes", [p.ok, p.reason, (p.findings || []).map((x) => x.check)],
    [false, "CORRESPONDENCE_REFUSED", ["C-2.10", "C-2.10"]]);
}

/* =====================================================================
   5. OVER-STRICTNESS, AND AN ENTRY WITH NO LIFECYCLE KEY.
   ===================================================================== */
console.log("\n--- 5. over-strictness ---");
{
  const plain = await correspond(NADIA, { target: OLD, direction: "sent", at: "2026-07-03",
    account: "Emailed the records request." });
  t("an entry with NO lifecycle parameter records and answers no lifecycle key", [plain.ok, "lifecycle" in plain],
    [true, false]);
  const led = parseFrontmatter(await bytesOf(NADIA, OLD)).data?.correspondence || [];
  t("...and writes NO lifecycle key into the bytes",
    Object.keys(led[0] || {}).filter((k) => ["stage", "follows", "outcome", "exemptions", "due_by", "due_cite"].includes(k)),
    []);
  const nr = await correspond(NADIA, { target: OLD, direction: "no_response", at: "2026-07-20",
    account: "Nothing came by the date the member expected.", follows: "0" });
  t("OVER-STRICTNESS: a non-response naming the entry it awaited lands", nr.ok, true);
  const lc = await lifecycle(OLD);
  t("an entry written with no stage reads 'not stated', never guessed; the non-response follows it",
    (lc?.entries || []).map((e) => [e.stage, e.stage_stated, e.follows, e.due.state]),
    [[null, false, null, "undetermined"], [null, false, 0, "undetermined"]]);
  const ok = (e, prior = [{ direction: "sent", stage: "request" }]) =>
    lifecycleFindings([...prior, e], prior.length).map((x) => x.code);
  t("OVER-STRICTNESS: an unstaged received entry, a request with no follows, none_stated on a decision, an "
    + "appeal of a partial production, and a due date on a received entry all pass",
    [ok({ direction: "received" }), ok({ direction: "sent", stage: "request" }),
     ok({ direction: "received", stage: "denial", follows: 0, outcome: "none_stated" }),
     ok({ direction: "sent", stage: "appeal", follows: 1 },
        [{ direction: "sent", stage: "request" }, { direction: "received", stage: "production", follows: 0, outcome: "partial" }]),
     ok({ direction: "received", stage: "extension_notice", follows: 0, due_by: "2026-09-01", due_cite: CPRA })],
    [[], [], [], [], []]);
  t("a citation with a section sign and spaces, EXACTLY as listed, is on the list (the chain above used it)",
    (await lifecycle(ACT))?.entries?.[0]?.due?.on_list, true);
}

/* =====================================================================
   6. THE CLOSED SETS ARE PUBLISHED, AS THE SAME OBJECTS.
   ===================================================================== */
console.log("\n--- 6. published vocabularies ---");
{
  t("the stages, by direction", CORRESPONDENCE_STAGES, {
    sent: ["request", "fee_waiver_request", "appeal", "court_filing"],
    received: ["acknowledgement", "fee_estimate", "fee_waiver_decision", "extension_notice", "production",
               "denial", "appeal_decision", "court_decision"] });
  t("the outcomes", CORRESPONDENCE_OUTCOMES, ["granted", "denied", "partial", "reversed", "affirmed", "none_stated"]);
  t("op=affordances' VOCABULARIES publishes the SAME objects, not copies",
    [VOCABULARIES.correspondence_stages === CORRESPONDENCE_STAGES,
     VOCABULARIES.correspondence_outcomes === CORRESPONDENCE_OUTCOMES], [true, true]);
}

console.log(`\nd147-records-lifecycle: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
