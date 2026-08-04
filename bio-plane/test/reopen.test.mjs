/* NEGATIVE CONTROL: (run 2026-08-04, each broken ALONE and restored; 57 pass when whole) (a) THE ITEM'S OWN — remove the REASON requirement and the group's disposition is overturned with nothing accounting for it: in src/store.mjs reopen() change `if (!why)` to `if (false)` (NOTE the file's FIRST `if (!why)` is dispose's — reopen's is the one directly under `const why = String(reason ?? "").trim();` inside reopen()) -> 53 pass, 4 FAIL. Headline: "a reopen with no reason is refused before anything moves" got [true,"open"] where [false,"deferred"] was wanted — op=reopen ACCEPTED reason="" and the deferred inquiry is now open. The other three are the cascade (the NO_REASON name gone; the machine-refusal assertion reading the already-reopened state; the inquiry no longer publishing reopen because it is no longer deferred). ONE gate only, unlike conclude's two-sided control, and that is itself the finding: the catalog has no `open`-state entry requirement to break, so nothing downstream would ever notice — this refusal is the only thing between the record and an unaccounted state change. (b) CHORE (2) — put the MAP RULE residual back: in src/store.mjs affordanceFacts, `normalizeType(b.object_type) === "project"` -> `b.object_type === "project"` -> 54 pass, 3 FAIL: the fourth-name rehearsal's legacy-spelled project publishes ["cite"] instead of ["cite","sever"] (its own confirmed edge counted zero) and answers differently from the canonical spelling. (c) CHORE (3) — remove the write-time refusal: in checks/bio-checks.mjs checkInquiryBasis, `if (leg.grade_axis === 'capture' && targetType === 'inquiry') {` -> `if (false) {` -> 53 pass, 4 FAIL at BOTH gates: op=promote ACCEPTS the leg (got [true,null], and the bundle is now open in the store) and the checker finds nothing wrong with the same bytes (got []). Restored after each. */
/* REC-31 chore (1): the REOPEN act, and chores (2) and (3) with it.
 *
 * THE HOLE. `deferred -> open` and `dismissed -> open` have been legal edges in
 * the catalog's own table since REC-10, and no op has ever written them:
 * op=dispose only targets the disposition set. REC-13 turned that from an
 * untidiness into a defect — a deferred inquiry cannot be concluded (it is
 * picked back up first, which is exactly what the edge is for), so a question
 * the group set down was unrecoverable except by hand-editing the document. An
 * act the state machine permits and no caller can perform is the machine lying
 * about what may be done.
 *
 * What this suite holds the item to, each in the direction that fails:
 *
 *   1. THE ACT, through the control plane — a real caller's only route. A named
 *      member reopens a DEFERRED inquiry with an AUTHORED reason; the document
 *      that lands carries the C-4.2 transition, the C-13.2 Session Log entry,
 *      a CLEARED disposition_reason (the authored words survive in the history
 *      where they belong), and AUDITS CLEAN. It then CONCLUDES — the REC-13
 *      hole closed end to end, in one run, on one object.
 *   2. THE REFUSALS, BY NAME, each checked before anything moves: NO_REASON
 *      (the negative control's subject), MACHINE_CANNOT_REOPEN, NOT_SET_DOWN
 *      and ILLEGAL_TRANSITION.
 *   3. NOT_SET_DOWN IS THE SCOPE, and it is doctrine rather than tidiness.
 *      `concluded -> open` is ALSO a legal edge and this act does not write it:
 *      DEC-12 makes reopening a conclusion an EDITION, REC-14 builds that
 *      machinery, and reverting a concluded inquiry here would leave an `open`
 *      question still wearing its conclusion with no edition recorded.
 *   4. ONE MACHINE, THE CATALOG'S, AND NO SECOND EDGE SOURCE. The act is
 *      published from the imported STATES table plus the published DISPOSITIONS
 *      array and nothing else — asserted structurally against the source — and
 *      a LEGACY focus document, deferred, is refused because its own vocabulary
 *      has no `open` state at all.
 *   5. PUBLICATION AND REFUSAL AGREE (DEC-8). Every case op=affordances does not
 *      publish is ATTEMPTED and refused by the store, in the same run.
 *   6. DEC-30: no owner gate, no ballot. An ordinary member reopens what an
 *      administrator dismissed, and the record says it was her.
 *
 *   CHORE (2), the affordanceFacts MAP RULE residual: the project arm consulted
 *   `b.object_type === "project"` raw. Proven by REHEARSING THE FOURTH NAME —
 *   a module tree whose catalog carries one extra alias and whose promote
 *   normalisation is neutered (inquiry.test.mjs block 6's instrument, which is
 *   the only way a legacy-spelled ROW is ever produced).
 *
 *   CHORE (3), DEC-21: a capture-axis grade authored on an INQ- leg has no
 *   referent. Refused at the WRITE and named by the CHECKER — one function,
 *   both gates — while a REPLAYED historical row is still admitted, because
 *   the record has to be able to hold its own past.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, cpSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { checkBundle, STATES } from "../checks/bio-checks.mjs";
import { ACTS, DISPOSITIONS, REOPENABLE_FROM } from "../src/affordances.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const AFF_SRC_PATH = fileURLToPath(new URL("../src/affordances.mjs", import.meta.url));
const STORE_SRC_PATH = fileURLToPath(new URL("../src/store.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec31", MEMBER_TOKEN: "mem-rec31", PROBE_TOKEN: "prb-rec31", VERSION: "test" },
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

/* THE op under test, driven through the CONTROL PLANE, with the literal
   `op=reopen` uninterpolated so coverage credits it there (D-43: op=invitelook
   shipped with a ReferenceError while 1276 store-level assertions passed). */
const reopen = async (tok, { target, reason }) =>
  rP(await GET(`op=reopen&token=${tok}`
    + (target !== undefined ? `&target=${encodeURIComponent(target)}` : "")
    + (reason !== undefined ? `&reason=${encodeURIComponent(reason)}` : "")));
const conclude = async (tok, { target, conclusion, falsifier }) =>
  rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`));
const affordances = async (target, tok = "mem-rec31") =>
  await GET(`op=affordances&token=${tok}&target=${encodeURIComponent(target)}`);
const actIds = (r) => (r.result?.acts ?? []).map((a) => a.id).sort();
const imageOf = async (id, tok = "mem-rec31") =>
  (await GET(`op=image&token=${tok}&id=${encodeURIComponent(id)}`)).result?.["bundle.md"];
const stateOf = async (id, tok = "mem-rec31") =>
  ((await GET(`op=list&token=${tok}`)).result || []).find((b) => b.bundle_id === id)?.current_state;
/* `earned` ADDED 2026-08-04 (REC-18): an EARNED grade is computed from the
   record's resolutions and capture rows, so the pure catalog refuses a leg
   claiming one rather than passing it. Read from the plane (op=earnedbasis)
   rather than hand-built, so what the checker is judged against is what the
   write path enforces. */
const errorsOf = async (id, text, earned) => {
  const { findings } = await checkBundle({ folderName: id,
    files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true, earnedRegistry: earned });
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};
const earnedFor = async (id, targets) => rP(await GET(
  `op=earnedbasis&token=mem-rec31&id=${id}${targets ? `&targets=${targets}` : ""}`));

/* ------------------------------------------------------------- documents */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role ?? "supports"}`,
      ...(l.grade !== undefined ? [`    grade: ${l.grade}`] : []),
      ...(l.axis ? [`    grade_axis: ${l.axis}`] : []),
      ...(l.source ? [`    grade_source: ${l.source}`] : []),
      /* REC-18: a hunch announces itself with an author and a date (DEC-15). */
      ...(l.author ? [`    author: ${l.author}`] : []),
      ...(l.date ? [`    date: ${l.date}`] : [])])]
  : [];

const inquiryMd = (id, { question = "Where does the sewer fund transfer basis come from?",
                         state = "open", refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  ...legLines(legs),
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

/* A LEGACY focus document: whole and valid under the contract it was authored
   under, its own heading set and its own state machine — which has no `open`
   state at all, because its open state is spelled `surfaced`. */
const focusMd = (id) => ["---",
  `id: ${id}`, "object_type: focus", "schema: focus@1",
  `title: "Legacy focus ${id}"`, "current_state: surfaced", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: human", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "", "## Statement", "", "The transfer basis is unexplained.", "",
  "## Why It Matters", "", "## Open Questions", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");

const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "criticality: supporting",
  "source:", '  locator: "https://oaklandca.opengov.com/transfer-memo"',
  '  authority: "Oakland OpenGov portal"', '  retrieved: "2026-07-01"',
  "monitoring:", "  enabled: false", "  frequency: none",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

const promote = async (id, md, type, state, tok = "mem-rec31", extra = {}) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base: null, snapKey: `${id}-new`, author: "seed",
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    register: [], ...extra,
  }));
const seed = async (id, md, type, state, tok, extra) => {
  const r = await promote(id, md, type, state, tok, extra);
  if (r.ok === false) throw new Error(`promote ${id}: ${JSON.stringify(r)}`);
  return r;
};

/* NAMED members. Reopening is a named member's assertion, and DEC-30 says any
   contribute holder may make it — so the suite needs a SECOND one who did not
   author the inquiry and did not take the disposition she is overturning.
   Membership Architecture 4.2/4.3: the first two invitations create
   administrators, so nadia and omar are admins and pilar is the ORDINARY
   member, carrying nothing but `contribute`. */
const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-rec31",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");          // the 4.2 two-administrator floor
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member");

const DOC = "INFO-2026-1400-transfer-memo";
const INQ_DEF = "INQ-2026-1400-deferred";
const INQ_DISM = "INQ-2026-1400-dismissed";
const INQ_HELD = "INQ-2026-1400-held";
const INQ_OPEN = "INQ-2026-1400-open";
const INQ_CONCL = "INQ-2026-1400-concluded";
const FOCUS_LEGACY = "FOCUS-2026-1400-legacy";

const withBasis = { refs: [DOC], legs: [{ target: DOC, role: "supports" }] };
const CONCL = "The transfer rests on a 1998 council resolution never rescinded";
const FALS = "A rescinding resolution, or a finance memo naming a different authority";

/* REC-18, 2026-08-04: the document REGISTERS a capture. Block 7 hangs a
   capture-axis grade on this leg, and that grade is now EARNED from the capture
   record — a document with no registered bytes has nothing for the axis to
   measure, so the leg would be refused for a reason that has nothing to do with
   what block 7 is testing. */
await seed(DOC, infoMd(DOC), "information", "collected", "mem-rec31",
  { register: [{ path: "snapshots/memo.bin", sha256: sha(`capture-of-${DOC}`), encoding: "binary", bytes: 10 }] });
for (const id of [INQ_DEF, INQ_DISM, INQ_HELD, INQ_OPEN, INQ_CONCL])
  await seed(id, inquiryMd(id, { question: `What does ${id} rest on?`, ...withBasis }), "inquiry", "open");
await seed(FOCUS_LEGACY, focusMd(FOCUS_LEGACY), "focus", "surfaced");

/* The dispositions are taken through op=dispose — the act that created the
   situation this item exists to reverse — so what is reopened is a real
   disposition with a real authored reason, not a hand-set field. */
const dispose = async (tok, id, to, reason) => {
  const h = rP(await POST(`op=select&token=${tok}&kind=enumerated`, { ids: [id] }));
  return rP(await GET(`op=dispose&token=${tok}&handle=${h.handle}&to=${to}`
    + `&reason=${encodeURIComponent(reason)}`));
};
const DEFER_WHY = "waiting on the audit";
await dispose(NADIA, INQ_DEF, "deferred", DEFER_WHY);
await dispose(NADIA, INQ_DISM, "dismissed", "asked and answered by the 2024 memo");
await dispose(NADIA, INQ_HELD, "deferred", "no capacity this quarter");
await dispose(NADIA, FOCUS_LEGACY, "deferred", "legacy, parked");
await conclude(NADIA, { target: INQ_CONCL, conclusion: CONCL, falsifier: FALS });

/* --------------------------------------------------------- 1. the hole */
console.log("\n--- 1. the hole REC-13 opened: a set-down question that nothing can pick up ---");
{
  t("(fixture) the inquiry is DEFERRED, with the disposing member's reason in the document",
    [await stateOf(INQ_DEF), new RegExp(`^disposition_reason: "${DEFER_WHY}"$`, "m").test(await imageOf(INQ_DEF))],
    ["deferred", true]);
  t("it cannot be concluded — REC-13's refusal, and the reason the reopen edge has to be reachable",
    (await conclude(NADIA, { target: INQ_DEF, conclusion: CONCL, falsifier: FALS })).reason,
    "ILLEGAL_TRANSITION");
  t("the catalog has carried the way back since REC-10: deferred and dismissed BOTH offer `open`",
    [STATES.inquiry.edges.deferred.includes("open"), STATES.inquiry.edges.dismissed.includes("open")],
    [true, true]);
}

/* ---------------------------------------------------------- 2. the act */
console.log("\n--- 2. op=reopen: a named member picks it back up, with an AUTHORED reason ---");
const REOPEN_WHY = "the audit landed and it names the transfer";
{
  const r = await reopen(NADIA, { target: INQ_DEF, reason: REOPEN_WHY });
  t("op=reopen succeeds for the named member, reporting the move it made",
    [r.ok, r.from, r.to], [true, "deferred", "open"]);
  t("the ACTOR is server-stamped from the session, never taken from the caller", r.author, "nadia");
  t("the authored reason comes back under `why`, never under `reason` — that name carries refusal CODES here",
    [r.why, r.reason], [REOPEN_WHY, undefined]);
  t("weight is `single`: one question is picked back up at a time, never a set", r.weight, "single");
  t("the projected state moved", await stateOf(INQ_DEF), "open");

  const md = await imageOf(INQ_DEF);
  t("C-4.2: the transition is RECORDED, with prior_state pointing at a history the document carries",
    [/^prior_state: deferred$/m.test(md), /to_state: open/.test(md), /author: nadia/.test(md)],
    [true, true, true]);
  t("the REASON is in the state_history entry — the record's own account of why the disposition stopped holding",
    new RegExp(`blurb: "?${REOPEN_WHY}`).test(md), true);
  t("C-13.2: last_updated moved and a Session Log entry accounts for it, naming who and why",
    [/### Session .* \| Reopened \| nadia/.test(md), md.includes(`Reason: ${REOPEN_WHY}.`)],
    [true, true]);
  t("the disposition_reason is CLEARED: an OPEN inquiry does not go on saying why it was set down",
    /^disposition_reason: ""$/m.test(md), true);
  t("and the words are not lost — dispose's own state_history entry still carries them, forever",
    md.includes(DEFER_WHY), true);
  t("the reopened document audits CLEAN against the catalog", await errorsOf(INQ_DEF, md), []);

  /* The hole closed end to end: the act exists BECAUSE a deferred inquiry
     could not be concluded, so the proof is concluding it. */
  const c = await conclude(NADIA, { target: INQ_DEF, conclusion: CONCL, falsifier: FALS });
  t("and NOW it concludes — the REC-13 hole closed in one run, on one object",
    [c.ok, c.from, c.to], [true, "open", "concluded"]);
}

/* ------------------------------------------------- 3. the other edge, DEC-30 */
console.log("\n--- 3. dismissed -> open, by an ORDINARY member: no owner gate, no ballot (DEC-30) ---");
{
  /* pilar did not author the inquiry, did not take the disposition she is
     overturning, holds no position over it, and no vote was taken. */
  const r = await reopen(PILAR, { target: INQ_DISM, reason: "new documents contradict the 2024 memo" });
  t("an ordinary contribute holder reopens what an ADMINISTRATOR dismissed — disagreement is expressed by acting",
    [r.ok, r.from, r.to, r.author], [true, "dismissed", "open", "pilar"]);
  const md = await imageOf(INQ_DISM);
  t("the act is ATTRIBUTED in both places the record keeps authorship",
    [/author: pilar/.test(md), /### Session .* \| Reopened \| pilar/.test(md)], [true, true]);
  t("and what she wrote audits clean too", await errorsOf(INQ_DISM, md), []);
}

/* --------------------------------------------- 4. the refusals, BY NAME */
console.log("\n--- 4. the refusals, BY NAME, each checked before anything moves ---");
{
  const noReason = await reopen(NADIA, { target: INQ_HELD, reason: "" });
  t("refused BY NAME: NO_REASON — this is the negative control's subject", noReason.reason, "NO_REASON");
  t("a reopen with no reason is refused before anything moves",
    [noReason.ok, await stateOf(INQ_HELD)], [false, "deferred"]);

  const badReason = await reopen(NADIA, { target: INQ_HELD, reason: 'it said "no" in the memo' });
  t("refused BY NAME: BAD_REASON — the restricted frontmatter grammar has no escapes",
    [badReason.ok, badReason.reason], [false, "BAD_REASON"]);

  const machine = await reopen("mem-rec31", { target: INQ_HELD, reason: REOPEN_WHY });
  t("refused BY NAME: MACHINE_CANNOT_REOPEN — a machine may surface and pursue, never overturn the group's disposition",
    machine.reason, "MACHINE_CANNOT_REOPEN");
  t("the machine class REACHES the op and is refused by the store, not hidden from it",
    [machine.ok, await stateOf(INQ_HELD)], [false, "deferred"]);
  t("an ADMIN machine credential is refused identically: it is not a person either",
    (await reopen("adm-rec31", { target: INQ_HELD, reason: REOPEN_WHY })).reason, "MACHINE_CANNOT_REOPEN");

  const alreadyOpen = await reopen(NADIA, { target: INQ_OPEN, reason: REOPEN_WHY });
  /* CORRECTED 2026-08-04 at the REC-31 x REC-14 merge, never exempted: the
     refusal now names REOPENABLE_FROM rather than DISPOSITIONS, because
     `published` joined the set (DEC-12 — a published case reopens for its next
     edition, and reopening does not unpublish). The RULE this asserts is
     unchanged and is the point: the refusal names the set it consulted, and
     that set is the one published array both this op and the act read. */
  t("an OPEN inquiry is refused NOT_SET_DOWN naming the reopenable set — it is already being worked",
    [alreadyOpen.ok, alreadyOpen.reason, alreadyOpen.reopenable], [false, "NOT_SET_DOWN", REOPENABLE_FROM]);

  /* The DEC-12 boundary, and the reason this act is scoped to the disposition
     set rather than to every state offering an `open` edge. */
  const concluded = await reopen(NADIA, { target: INQ_CONCL, reason: "the finding did not hold" });
  t("a CONCLUDED inquiry is refused NOT_SET_DOWN, not ILLEGAL_TRANSITION: the edge IS legal and this is not its act",
    [concluded.ok, concluded.reason, concluded.from], [false, "NOT_SET_DOWN", "concluded"]);
  t("and the refusal says where that act lives — an EDITION (DEC-12), which is REC-14's machinery",
    /EDITION \(DEC-12\)/.test(concluded.detail), true);
  t("the concluded inquiry is untouched: nothing half-ran", await stateOf(INQ_CONCL), "concluded");

  /* THE MAP RULE with teeth. A legacy focus document's ROW says inquiry
     (promote projects the NORMALIZED type) and its state says deferred, so the
     disposition test passes — and its own vocabulary has no `open` state at
     all. The answer must come from vocabFor over the DECLARED spelling. */
  const legacy = await reopen(NADIA, { target: FOCUS_LEGACY, reason: "picking it back up" });
  t("a LEGACY focus document is refused ILLEGAL_TRANSITION: its own machine has no `open`, whatever the row says",
    [legacy.ok, legacy.reason, legacy.object_type], [false, "ILLEGAL_TRANSITION", "focus"]);
  t("and it is untouched — the legacy contract is not rewritten to make an act fit",
    await stateOf(FOCUS_LEGACY), "deferred");

  t("an unknown target is NO_SUCH_BUNDLE",
    (await reopen(NADIA, { target: "INQ-2026-9999-ghost", reason: REOPEN_WHY })).reason, "NO_SUCH_BUNDLE");
  t("an information bundle is NOT_AN_INQUIRY: only an inquiry carries a question to pick back up",
    (await reopen(NADIA, { target: DOC, reason: REOPEN_WHY })).reason, "NOT_AN_INQUIRY");
  t("no target at all is NO_TARGET", (await reopen(NADIA, { reason: REOPEN_WHY })).reason, "NO_TARGET");
}

/* ------------------------- 5. publication and refusal agree (DEC-8) */
console.log("\n--- 5. op=affordances publishes reopen from the ONE edge table — no second edge source ---");
{
  const cat = await GET("op=affordances&token=mem-rec31");
  const pub = cat.result.catalog.find((a) => a.id === "reopen");
  t("the catalogue publishes reopen with its capability, its mode and its weight — composed, not hand-asserted",
    [pub.needs, pub.mode, pub.weight], ["contribute", "session", "single"]);
  t("its rung is NULL: no document assigns reopen one, and RUNGS invents nothing (FW-14's job)",
    pub.rung, null);

  /* CORRECTED 2026-08-04 (REC-37), never exempted: `cite` joins every inquiry's
     published act list, at every state. It was absent because `op=cite` could
     not reach a question in either direction — UI-20's measured gap, and the
     reason the act by which a record becomes a case did not exist. The guard on
     the widened arm is TYPE-only, so the act publishes regardless of state,
     exactly as it already did on a RETIRED information bundle. What each
     assertion below is really about — which STATE-MACHINE acts a question
     offers — is unchanged. */
  /* CORRECTED 2026-08-04 (REC-45), never exempted, and the correction is one
     note for the four assertions below: `inquiryground` joins the published act
     list of every inquiry that RESTS ON SOMETHING and is neither `published`
     nor `divided` — including a question the group has SET DOWN, which is
     `cite`'s own posture and is deliberate: gathering continues on a deferred
     or dismissed question (REC-17), and saying which of the gathered reasons
     stand together is the same kind of act. It is not a state-machine act at
     all — grouping moves no state — so what each assertion below is really
     about, which STATE acts a question offers, is unchanged. */
  t("a DEFERRED inquiry publishes reopen beside dispose", actIds(await affordances(INQ_HELD)),
    ["cite", "dispose", "inquiryground", "reopen"]);
  const dism = "INQ-2026-1400-dismissed-2";
  await seed(dism, inquiryMd(dism, { question: "Does the transfer recur?", ...withBasis }), "inquiry", "open");
  await dispose(NADIA, dism, "dismissed", "duplicate of the main question");
  t("a DISMISSED inquiry publishes it too — both edges, one derivation", actIds(await affordances(dism)),
    ["cite", "dispose", "inquiryground", "reopen"]);   // REC-37/REC-45, 2026-08-04 (see the notes above)
  /* CORRECTED 2026-08-04 (REC-16), never exempted: an open inquiry RESTING ON
     SOMETHING now publishes `inquirydivide` too — dividing is legal from open,
     and it is the act a member reaches for when one leg is holding the whole
     question's strength down. What this assertion exists for is unchanged and
     still holds exactly: `reopen` is NOT among the acts an open inquiry
     publishes, and the store refuses it by the name the publication implies. */
  t("an OPEN inquiry does NOT publish reopen, and the store agrees by name",
    [actIds(await affordances(INQ_OPEN)),
     (await reopen(NADIA, { target: INQ_OPEN, reason: REOPEN_WHY })).reason],
    [["cite", "conclude", "dispose", "inquirydivide", "inquiryground"], "NOT_SET_DOWN"]);   // REC-37/REC-45, 2026-08-04
  /* CORRECTED 2026-08-04 at the REC-31 x REC-14 merge, never exempted: a
     concluded inquiry now publishes `publish` beside `dispose` — REC-14
     landing, and it is the very act this refusal has always pointed at. What
     this assertion exists for is unchanged and still holds: `reopen` is NOT
     among them, and the store refuses it by the name the publication implies.
     CORRECTED AGAIN 2026-08-04 (REC-16), same reason one act along: dividing is
     legal from `concluded` as well as from `open`, so `inquirydivide` joins the
     forward-moving acts here. `reopen` is still not one of them. */
  t("a CONCLUDED inquiry does NOT publish reopen — it publishes the act that moves it forward — and the store agrees",
    [actIds(await affordances(INQ_CONCL)),
     (await reopen(NADIA, { target: INQ_CONCL, reason: REOPEN_WHY })).reason],
    [["cite", "dispose", "inquirydivide", "inquiryground", "publish"], "NOT_SET_DOWN"]);   // REC-37, 2026-08-04: cite joins every inquiry
  t("the deferred LEGACY focus does not publish it either: the derivation asks the DECLARED vocabulary too",
    actIds(await affordances(FOCUS_LEGACY)), ["cite", "dispose"]);   // REC-37, 2026-08-04: cite joins every inquiry
  t("an information bundle never publishes reopen", actIds(await affordances(DOC)).includes("reopen"), false);

  /* NO SECOND EDGE SOURCE, asserted against the source rather than inferred
     from behaviour: the act's condition is the imported edge table (edgesFrom,
     which resolves the catalog's vocabFor) plus the published DISPOSITIONS
     array, and it carries no state literal of its own. A local list of states
     would pass every assertion above on the day it was written and drift the
     day the catalog changed — which is exactly how the op=dispose copy that
     REC-10 removed came to exist. */
  const affSrc = readFileSync(AFF_SRC_PATH, "utf8");
  const reopenEntry = affSrc.slice(affSrc.indexOf(`{ id: "reopen"`),
    affSrc.indexOf("\n", affSrc.indexOf(`edgesFrom(f).includes("open")`)));
  /* CORRECTED 2026-08-04 at the REC-31 x REC-14 merge, never exempted: the
     published FROM set is REOPENABLE_FROM (the disposition set plus
     `published`). The rule is untouched and is what this pins — the act reads
     the IMPORTED edge table and ONE published array, and keeps no state list of
     its own, which is why the third arm still looks for a literal and still
     must not find one. */
  t("the reopen act derives from the IMPORTED edge table and the PUBLISHED reopenable set, and nothing else",
    [/edgesFrom\(f\)\.includes\("open"\)/.test(reopenEntry),
     /REOPENABLE_FROM\.includes\(f\.current_state\)/.test(reopenEntry),
     /\["deferred"|'deferred'/.test(reopenEntry)],
    [true, true, false]);
  t("and the act table itself is the ONE place the act is declared (store.mjs keeps no act list)",
    ACTS.filter((a) => a.id === "reopen").length, 1);
}

/* ------------------------------- 6. chore (2): the MAP RULE residual */
console.log("\n--- 6. chore (2): affordanceFacts' project arm goes through the map (the fourth-name rehearsal) ---");
{
  const storeSrc = readFileSync(STORE_SRC_PATH, "utf8");
  t("the raw consultation is GONE from affordanceFacts: the membership question goes through normalizeType",
    [/normalizeType\(b\.object_type\) === "project"/.test(storeSrc),
     /\n    if \(b\.object_type === "project"\) \{/.test(storeSrc)],
    [true, false]);

  /* THE REHEARSAL. There is no project alias TODAY, so the raw comparison was
     wrong only in principle — and a rule that cannot be exercised is a rule
     nobody is enforcing. So this rehearses the FOURTH NAME: a module tree
     whose catalog carries one extra alias (`dossier` -> project), promoted
     through a build whose promote normalisation is neutered, which is the only
     way a legacy-spelled ROW is ever produced (inquiry.test.mjs block 6's
     instrument, reused). With the residual in place this project's own
     citation edges count ZERO and sever is unpublished on a project that has
     one; through the map they count. */
  const dir = mkdtempSync(join(tmpdir(), "bio-rec31-fourth-name-"));
  try {
    mkdirSync(join(dir, "bio-plane"), { recursive: true });
    cpSync(fileURLToPath(new URL("../src", import.meta.url)), join(dir, "bio-plane/src"), { recursive: true });
    cpSync(fileURLToPath(new URL("../checks", import.meta.url)), join(dir, "bio-plane/checks"), { recursive: true });
    /* index.mjs imports the profile registry from BESIDE the plane (I6's
       topology), so the mirror carries it too rather than the import failing. */
    cpSync(fileURLToPath(new URL("../../docprofile", import.meta.url)), join(dir, "docprofile"), { recursive: true });

    const catPath = join(dir, "bio-plane/checks/bio-checks.mjs");
    const catSrc = readFileSync(catPath, "utf8");
    const patchedCat = catSrc.replace(
      "export const LEGACY_TYPE_ALIASES = { problem: 'inquiry', focus: 'inquiry' };",
      "export const LEGACY_TYPE_ALIASES = { problem: 'inquiry', focus: 'inquiry', dossier: 'project' };");
    const storePath = join(dir, "bio-plane/src/store.mjs");
    const patchedStore = readFileSync(storePath, "utf8").replace(
      "const projectedType = normalizeType(meta.object_type);",
      "const projectedType = meta.object_type;");
    t("the rehearsal's two patches found their sites (markers moved if this fails)",
      [patchedCat !== catSrc, patchedStore.includes("const projectedType = meta.object_type;")],
      [true, true]);
    writeFileSync(catPath, patchedCat);
    writeFileSync(storePath, patchedStore);

    const tmpIdx = join(dir, "bio-plane/src/index.mjs");
    const mf2 = new Miniflare({
      modules: true, modulesRoot: "/", scriptPath: tmpIdx, script: readFileSync(tmpIdx, "utf8"),
      compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
      durableObjects: { STORE: { className: "Store", useSQLite: true } },
      r2Buckets: ["CAPTURES", "PUBLISHED"],
      bindings: { ADMIN_TOKEN: "adm-x", MEMBER_TOKEN: "mem-x", PROBE_TOKEN: "prb-x", VERSION: "test" },
    });
    const G2 = async (q) => (await mf2.dispatchFetch(`http://x/api/?${q}`)).json();
    const P2 = async (q, b) => (await mf2.dispatchFetch(`http://x/api/?${q}`,
      { method: "POST", body: JSON.stringify(b ?? {}) })).json();
    const LEGACY_PROJ = "PROJ-2026-1400-dossier";
    const CITED = "INFO-2026-1400-cited";
    const projMdFor = (id, spelling, cites) => ["---", `id: ${id}`, `object_type: ${spelling}`, "schema: project@1",
      `title: "Legacy dossier"`, "current_state: forming", "prior_state: null",
      `created: "${NOW}"`, `last_updated: "${LATER}"`,
      "produced_by:", "  mode: agent", "  capability_tier: high",
      "group: believe-in-oakland",
      ...(cites ? ["references:", `  - target: ${CITED}`, "    rel: cites", "    status: confirmed"]
                : ["references: []"]),
      "state_history: []", "---", "", "## Thesis Summary", "", "X.", "",
      "## Open Questions", "", "## Ruled Out", "", "## Session Log", "", "## Review Notes", ""].join("\n");
    const mk = async (id, md, type, state) => rP(await P2(`op=promote&token=mem-x`, {
      bundleId: id, base: null, snapKey: `${id}-new`, author: "seed",
      meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
              current_state: state, created: NOW, last_updated: LATER },
      files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }], register: [] }));
    const BARE_PROJ = "PROJ-2026-1400-dossier-bare";
    const CANON_PROJ = "PROJ-2026-1400-canonical";
    await mk(CITED, infoMd(CITED), "information", "collected");
    await mk(LEGACY_PROJ, projMdFor(LEGACY_PROJ, "dossier", true), "dossier", "forming");
    await mk(BARE_PROJ, projMdFor(BARE_PROJ, "dossier", false), "dossier", "forming");
    await mk(CANON_PROJ, projMdFor(CANON_PROJ, "project", true), "project", "forming");
    const actsOf = async (id) => ((await G2(`op=affordances&token=mem-x&target=${id}`)).result?.acts ?? [])
      .map((a) => a.id).sort();
    const aff = await G2(`op=affordances&token=mem-x&target=${LEGACY_PROJ}`);
    t("(rehearsal fixture) the row really does carry the legacy spelling — the state a pre-rename build leaves",
      aff.result.object_type, "dossier");
    t("a LEGACY-SPELLED project takes affordanceFacts' project arm: its own confirmed cites edge is COUNTED, so sever is published",
      (aff.result.acts ?? []).map((a) => a.id).sort(), ["cite", "sever"]);
    t("and the arm read THAT document, not a default: the same legacy spelling with NO edges publishes cite alone",
      await actsOf(BARE_PROJ), ["cite"]);
    t("the canonical spelling answers identically — which is the point of the map: one rule, every name",
      await actsOf(CANON_PROJ), await actsOf(LEGACY_PROJ));
    await mf2.dispose();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/* --------------------------- 7. chore (3): DEC-21, capture has a referent */
console.log("\n--- 7. chore (3): a capture-axis grade on an INQ- leg has no referent (DEC-21) ---");
{
  /* SOURCE CORRECTED 2026-08-04 (REC-18), never exempted. This block is about
     REC-31's rule (a capture-axis grade on an INQ- leg has no referent) and that
     rule is unchanged — what changed is that `grade_source` stopped being a
     label a fixture could pick. `resolution` is now EARNED and is a CONNECTION
     source only, so each probe below names the source its axis actually admits:
     `hunch` for an authored connection grade (DEC-15's only authored source
     above D) and `capture` for the earned capture axis. The BAD probe keeps
     `resolution` deliberately — it is the one whose refusal is being measured,
     and REC-31's finding is the one that must come back. */
  const legTo = (target, axis, source = "resolution", extra = {}) =>
    ({ refs: [DOC, target].filter((x, i, a) => a.indexOf(x) === i),
       legs: [{ target, role: "supports", grade: "B", axis, source, ...extra }] });
  const HUNCH = { author: "casey", date: "2026-08-04" };
  const BAD = "INQ-2026-1400-capture-on-inquiry";
  const badMd = inquiryMd(BAD, { question: "Does the capture axis mean anything here?",
    ...legTo(INQ_OPEN, "capture") });
  const refused = await promote(BAD, badMd, "inquiry", "open");
  t("REFUSED AT THE WRITE: the leg never lands, so nothing downstream has to cope with it",
    [refused.ok, refused.reason], [false, "BASIS_REFUSED"]);
  t("and the refusal NAMES it — the axis has no referent, said in the finding a caller reads",
    (refused.findings ?? []).map((x) => [x.check, /has no referent/.test(x.detail)]),
    [["C-2.8", true]]);
  t("the refused write projected NOTHING: the bundle does not exist", await stateOf(BAD), undefined);
  t("the CHECKER names the same thing on the same bytes — one function, both gates",
    (await errorsOf(BAD, badMd)).filter((e) => /has no referent/.test(e)),
    ["C-2.8: basis[0] states a capture-axis grade on an inquiry leg: capture is a property of an information object (DEC-21) and an inquiry is not one, so this grade has no referent"]);

  /* What is refused is the AXIS, not the leg: an inquiry leg is a perfectly
     gradable edge — on connection, which is what it is an edge of. */
  const OK_CONN = "INQ-2026-1400-connection-on-inquiry";
  const okMd = inquiryMd(OK_CONN, { question: "And on the connection axis?",
    ...legTo(INQ_OPEN, "connection", "hunch", HUNCH) });
  t("the SAME leg graded on CONNECTION lands: a leg to another inquiry is an edge, and edges have connection grades",
    [(await promote(OK_CONN, okMd, "inquiry", "open")).ok,
     await errorsOf(OK_CONN, okMd, await earnedFor(OK_CONN))], [true, []]);
  const OK_CAP = "INQ-2026-1400-capture-on-document";
  const capMd = inquiryMd(OK_CAP, { question: "And a capture grade about a document?",
    ...legTo(DOC, "capture", "capture") });
  t("and a capture grade on an INFO- leg is untouched: capture ranges over documents, which is the whole rule",
    [(await promote(OK_CAP, capMd, "inquiry", "open")).ok,
     await errorsOf(OK_CAP, capMd, await earnedFor(OK_CAP))], [true, []]);

  /* HISTORY IS APPEND-ONLY. The refusal is a WRITE-time gate and the replay
     exemption is deliberate: the record's own past may contain such a row, and
     a plane that could not hold it verbatim would be rewriting history to suit
     a rule made later. This is why REC-12's derivation KEEPS its no-referent
     arm rather than being deleted with the defect. */
  const HIST = "INQ-2026-1400-historical";
  const histMd = inquiryMd(HIST, { question: "A row written before the refusal existed?",
    ...legTo(INQ_OPEN, "capture") });
  t("a REPLAYED revision carrying the same leg is ADMITTED: the record must be able to hold its own past",
    (await promote(HIST, histMd, "inquiry", "open", "mem-rec31", { replay: true })).ok, true);
  const storeSrc = readFileSync(STORE_SRC_PATH, "utf8");
  t("so the derivation's no-referent arm stays, and its comment now points at the refusal instead of at the gap",
    [/const noReferent = axis === "capture" && isInquiry;/.test(storeSrc),
     /checkInquiryBasis now REFUSES the combination at the/.test(storeSrc)],
    [true, true]);
}

await mf.dispose();
console.log(`\nreopen: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
