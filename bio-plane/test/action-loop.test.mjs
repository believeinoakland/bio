/* NEGATIVE CONTROL: (all four RUN 2026-08-05 by rec24-agent, each broken ALONE and restored byte-identical; 79 pass / 0 fail restored) (a) THE SECOND EDGE TABLE, this item's NAMED hazard - in src/store.mjs actionMove() replace the two catalog lookups with a local copy that permits everything from everything (`const legal = ["planned","active","awaiting_response","resolved","abandoned"]` and `const legalFrom = legal`) -> 4 FAIL: "planned -> resolved is refused" (got NO_RESOLUTION, i.e. the move was legal and only the parameter stopped it), the refusal no longer names what the table permits, the structural no-copy pin, and "resolved is TERMINAL" reports ok:true - an action reopened out of a terminal state. (b) C-2.10 CAPTURE-OR-TESTIFY - in checks/bio-checks.mjs correspondenceFindings change `} else if (!sha && !account) {` to `} else if (false) {` -> 1 FAIL: the catalog no longer names an entry that carries NEITHER bytes nor an account. NOTE, and it is the finding worth keeping: this control was run against a first draft of this suite and the draft PASSED, because the op refuses both shapes before the document is ever written and every assertion was on the op. The catalog and the write arms are now asserted separately - a rule enforced in three places needs an assertion at each. (c) DEC-14 OUTCOME/IMPACT - in consequenceState change `if (!evidence.length) {` to `if (false) {` -> 3 FAIL: an impact claim resting on nothing outside our own action reads "established", determined true, and the "not a low score / sequence alone" wording is gone; the claim resting only on the reply OUR OWN ACTION elicited also reads established. (d) DEC-13 SPECIFICITY - in actionBasisFindings change `if (!disclosed.length) {` to `if (false) {` -> 3 FAIL: a request_for_comment naming ZERO inquiries is accepted by the catalog AND by the write (reason undefined where ACTION_BASIS_REFUSED was wanted). */
/* REC-24: THE ACTION LOOP — the plane half of the IMPACTING verb, which had zero
 * reachable processes before this suite existed.
 *
 * BUILD-ORDER.md §2 (REC-24) (a)-(g) is the scope; DEC-13 (the case put to its
 * subject) and DEC-14 (outcome versus impact) are the folded rulings. SB-OUTPUT
 * §4 measured the starting state: "Every node is dashed. The only thing in this
 * diagram that runs today is the creation of the `action` bundle itself."
 *
 * WHAT THIS SUITE HOLDS THE ITEM TO, each in the direction that fails:
 *
 *   1. THE DRIVE, END TO END, THROUGH THE CONTROL PLANE — a real caller's only
 *      route (D-43: op=invitelook shipped with a ReferenceError while 1276
 *      store-level assertions passed). An action rests_on a CONCLUDED finding,
 *      moves to active with an authored reason, records what it SENT as hashed
 *      bytes, records what CAME BACK as a named member's testimony, falls
 *      overdue, and resolves with a valid resolution.
 *   2. THE CLOCK IS DERIVED ON READ. The SAME store and the SAME bytes answer
 *      `overdue: false` at one injected instant and `overdue: true` at another,
 *      with nothing written in between — REC-8's injectable-clock seam, and the
 *      reason a stored overdue flag is a filter and never an answer.
 *   3. THE EDGE TABLE IS THE CATALOG'S. An illegal transition is refused from
 *      the imported table, and op=actionmove holds no copy of it. This is the
 *      NAMED hazard of the item (op=dispose held one until REC-10) and it has
 *      its own negative control.
 *   4. CAPTURE OR TESTIFY IS STRUCTURAL. Neither is refused; both are refused;
 *      an unregistered hash is refused; a non-response carrying bytes is
 *      refused. Enforced at the op, at the catalog and at the write.
 *   5. DEC-13. A request_for_comment NAMES THE SPECIFIC INQUIRIES it disclosed
 *      or is refused by name; its response window is AUTHORED (and its range is
 *      NOT enforced — the GAO precedent is carried as a citation); a
 *      non-response is recorded with its date.
 *   6. DEC-14. A consequence is an OUTCOME by default. An impact claim resting
 *      only on our own action is RECORDED and reads `unproven` — a stated state
 *      on the R1 shape, with grade null and determined false — never a fifth
 *      grade and never a low one. Cite something outside us and it becomes a
 *      claim like any other.
 *   7. (g) `responds_to` HAS A PRODUCER AND A CONSUMER. op=actioncorrespond
 *      writes the edge onto the captured reply; the derived read answers what
 *      responded to this action from one indexed lookup.
 */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkBundle, parseFrontmatter, ACTION_KINDS, ACTION_BASIS_KINDS,
         CORRESPONDENCE_DIRECTIONS, RFC_RESPONSE_WINDOW_PRECEDENT,
         consequenceState } from "../checks/bio-checks.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const STORE_SRC = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
const SCHEMA_SRC = readFileSync(fileURLToPath(new URL("../src/schema.mjs", import.meta.url)), "utf8");
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec24", MEMBER_TOKEN: "mem-rec24", PROBE_TOKEN: "prb-rec24", VERSION: "test" },
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

/* THE TWO OPS UNDER TEST, driven through the CONTROL PLANE with the op names
   UNINTERPOLATED so coverage credits them where a caller reaches them. */
const actionmove = async (tok, { target, to, reason, resolution }) =>
  rP(await GET(`op=actionmove&token=${tok}`
    + (target !== undefined ? `&target=${encodeURIComponent(target)}` : "")
    + (to !== undefined ? `&to=${encodeURIComponent(to)}` : "")
    + (reason !== undefined ? `&reason=${encodeURIComponent(reason)}` : "")
    + (resolution !== undefined ? `&resolution=${encodeURIComponent(resolution)}` : "")));
const correspond = async (tok, { target, direction, at, medium, party, artifact_sha, account }) =>
  rP(await GET(`op=actioncorrespond&token=${tok}`
    + (target !== undefined ? `&target=${encodeURIComponent(target)}` : "")
    + (direction !== undefined ? `&direction=${encodeURIComponent(direction)}` : "")
    + (at !== undefined ? `&at=${encodeURIComponent(at)}` : "")
    + (medium !== undefined ? `&medium=${encodeURIComponent(medium)}` : "")
    + (party !== undefined ? `&party=${encodeURIComponent(party)}` : "")
    + (artifact_sha !== undefined ? `&artifact_sha=${encodeURIComponent(artifact_sha)}` : "")
    + (account !== undefined ? `&account=${encodeURIComponent(account)}` : "")));
/* The derived read, at a NAMED instant. `now` is an as-of parameter, so two
   reads of the same bytes at two instants is the whole instrument. */
const actionOf = async (tok, id, now) =>
  rP(await GET(`op=projection&token=${tok}&id=${encodeURIComponent(id)}`
    + (now !== undefined ? `&now=${now}` : "")));
const stateOf = async (id, tok) =>
  ((await GET(`op=list&token=${tok}`)).result || []).find((b) => b.bundle_id === id)?.current_state;
/* The catalog's OWN parser, so this suite never invents a second reading of the
   grammar it is testing. */
const fmOf = (text) => parseFrontmatter(text).data || {};
const errorsOf = async (id, text) => {
  const { findings } = await checkBundle({ folderName: id,
    files: new Map([["bundle.md", text]]),
    sha256: async (v) => sha(v), sha512: async () => new Uint8Array(64),
    resolveTarget: () => true });
  return findings.filter((x) => x.severity === "error").map((x) => `${x.check}: ${x.message}`);
};

/* ------------------------------------------------------------- documents */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
/* The response window is a FUTURE date so the derivation is exercised by the
   INJECTED clock and not by the wall — which is the point of an injectable
   clock, and also keeps C-11.1's "silently past-due" arm (a real and separate
   finding about the document) out of this suite's way. */
const DUE = "2026-09-10";
const BEFORE_MS = Date.parse("2026-08-20T00:00:00Z");   // the window is still open
const AFTER_MS = Date.parse("2026-09-20T00:00:00Z");    // the window has closed

const refLines = (targets) => targets.length
  ? ["references:", ...targets.flatMap((x) => [`  - target: ${x}`, "    rel: cites", "    status: confirmed"])]
  : ["references: []"];
const legLines = (legs) => legs.length
  ? ["basis:", ...legs.flatMap((l) => [`  - target: ${l.target}`, `    role: ${l.role}`])]
  : [];

const inquiryMd = (id, { question = "Where does the sewer fund transfer basis come from?",
                         refs = [], legs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "${question}"`, "current_state: open", "prior_state: null",
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
  "## What It Rests On", "", "## Conclusion", "", "## What Would Falsify This", "",
  "## Session Log", "", `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "", "## Review Notes", ""].join("\n");

const infoMd = (id, { title = "A captured document", refs = [] } = {}) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "${title}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");

/* The action. Every field the intake surfaces write plus REC-24's three new
   blocks, so a finding can only be about the subject. */
const actionMd = (id, { kind = "cpra_request", state = "planned", title = "Records request",
                        counterparty = ["counterparty:", "  state: named", "  name: City Clerk"],
                        basis = [], clock = [], consequence = null, refs = [],
                        correspondence = [], resolution = null } = {}) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "${title}"`, `current_state: ${state}`, "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", ...refLines(refs), "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []",
  `action_kind: ${kind}`, "risk_tier: 1",
  ...counterparty,
  ...(resolution ? [`resolution: ${resolution}`] : []),
  ...(basis.length
    ? ["action_basis:", ...basis.flatMap((l) => [`  - target: ${l.target}`, `    kind: ${l.kind}`,
        ...(l.note ? [`    note: "${l.note}"`] : [])])]
    : []),
  ...(clock.length
    ? ["clock:", ...clock.flatMap((c) => [`  - text: ${c.text}`, `    description: ${c.description}`,
        `    date: ${c.date}`, `    basis: ${c.basis}`, `    status: ${c.status}`])]
    : []),
  ...(correspondence.length
    ? ["correspondence:", ...correspondence.flatMap((e) => [`  - direction: ${e.direction}`,
        `    at: ${e.at}`,
        ...(e.party ? [`    party: "${e.party}"`] : []),
        ...(e.artifact_sha ? [`    artifact_sha: ${e.artifact_sha}`] : []),
        ...(e.artifact_bundle_id ? [`    artifact_bundle_id: ${e.artifact_bundle_id}`] : []),
        ...(e.account ? [`    account: "${e.account}"`] : []),
        ...(e.author ? [`    author: ${e.author}`] : [])])]
    : []),
  ...(consequence
    ? ["consequence:", `  claim: ${consequence.claim}`,
       `  description: "${consequence.description}"`, `  at: ${consequence.at}`]
    : []),
  "---", "",
  "## Plan", "", "Ask for the transfer ledger.", "",
  "## Status", "", "## Correspondence", "",
  /* C-13.2: last_updated has moved from created, so the document carries an
     entry accounting for it. Every act below appends its own. */
  "## Session Log", "", `### Session ${LATER} | Formation | nadia`,
  "Trigger: intake", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

const RESPONSE_WINDOW = [{ text: "City response due", date: DUE,
  description: "The window the group gave the City to reply before recording a non-response.",
  basis: "California Public Records Act 7922.535, plus the 30-day extension the group allowed",
  status: "pending" }];

/* ------------------------------------------------------------- the roster */
const enrol = async (memberId, password, role) => {
  const add = rP(await POST("op=memberadd&token=adm-rec24",
    { memberId, cover: `cover for ${memberId}`, role, capabilities: ["contribute"] }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const NADIA = await enrol("nadia", "nadia-passphrase-1", "admin");
await enrol("omar", "omar-passphrase-1", "admin");        // the 4.2 two-administrator floor
const PILAR = await enrol("pilar", "pilar-passphrase-1", "member");

const promote = async (tok, id, text, type, state, base = null, register = []) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `${id}-${base ? "rev" : "new"}-${Math.random().toString(36).slice(2, 6)}`,
    files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
    register,
    meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
  }));

const DOC = "INFO-2026-2400-transfer-memo";
const INQ = "INQ-2026-2400-transfer";
const ACT = "ACTN-2026-2400-records-request";

/* =====================================================================
   1. THE GROUND: a CONCLUDED finding for the action to rest on.
   ===================================================================== */
console.log("--- 1. the ground: a concluded finding ---");
{
  await promote(NADIA, DOC, infoMd(DOC), "information", "collected");
  const text = inquiryMd(INQ, { refs: [DOC], legs: [{ target: DOC, role: "supports" }] });
  t("the inquiry promotes", (await promote(NADIA, INQ, text, "inquiry", "open")).ok, true);
  const c = rP(await GET(`op=conclude&token=${NADIA}&target=${encodeURIComponent(INQ)}`
    + `&conclusion=${encodeURIComponent("The transfer rests on an administrative memo, not an ordinance.")}`
    + `&falsifier=${encodeURIComponent("An ordinance authorizing the transfer.")}`));
  t("it concludes, so the action rests on a FINDING and not on an open question",
    [c.ok, await stateOf(INQ, NADIA)], [true, "concluded"]);
}

/* =====================================================================
   2. THE ACTION, AND ITS BASIS (a). Deliberately inquiry_basis's shape.
   ===================================================================== */
console.log("\n--- 2. the action rests_on the concluded finding (a) ---");
let actSha = null;
{
  const text = actionMd(ACT, {
    refs: [INQ],
    basis: [{ target: INQ, kind: "rests_on", note: "the memo the finding identified is what we are asking for" }],
    clock: RESPONSE_WINDOW });
  t("a conformant action carrying a basis and a clock draws zero errors from the catalog",
    await errorsOf(ACT, text), []);
  const p = await promote(NADIA, ACT, text, "action", "planned");
  t("the action promotes", p.ok, true);
  const a = await actionOf(NADIA, ACT, BEFORE_MS);
  t("the leg reads back from action_basis, in document order, with its kind",
    a.action.basis.map((l) => [l.ord, l.target_id, l.kind]), [[0, INQ, "rests_on"]]);
  t("target_type is denormalised through the catalog's own map, never re-derived by a reader",
    a.action.basis.map((l) => l.target_type), ["inquiry"]);
  t("the table is INDEXED on target_id: which actions rest on this finding is ONE lookup",
    /CREATE INDEX IF NOT EXISTS action_basis_target ON action_basis\(target_id\);/.test(SCHEMA_SRC), true);
  t("the projection columns carry the action's own facts (e)",
    [a.action_kind, a.action_risk_tier, a.action_counterparty_state, a.action_clock_next],
    ["cpra_request", 1, "named", DUE]);
  /* A leg pointing at another ACTION is refused: our own work cited as the
     reason for our own work is the circularity DEC-14 spends its ruling on. */
  const selfish = actionMd("ACTN-2026-2401-selfish", {
    basis: [{ target: ACT, kind: "rests_on" }] });
  t("an action resting on an ACTION is refused by name (DEC-14's circularity, refused as a shape)",
    (await errorsOf("ACTN-2026-2401-selfish", selfish)).some((m) => /is an ACTION/.test(m)), true);
  actSha = (await actionOf(NADIA, ACT, BEFORE_MS)).bundle_sha;
}

/* =====================================================================
   3. op=actionmove (c) — the catalog's edge table, and NO SECOND COPY.
   ===================================================================== */
console.log("\n--- 3. op=actionmove: planned -> active, with an authored reason (c) ---");
{
  const noReason = await actionmove(NADIA, { target: ACT, to: "active" });
  t("a move with no reason is refused BEFORE anything moves, and the action is still planned",
    [noReason.ok, noReason.reason, await stateOf(ACT, NADIA)], [false, "NO_REASON", "planned"]);
  const bad = await actionmove(NADIA, { target: ACT, to: "resolved", reason: "skipping ahead" });
  t("planned -> resolved is refused: the catalog's table has no such edge",
    [bad.ok, bad.reason, await stateOf(ACT, NADIA)], [false, "ILLEGAL_TRANSITION", "planned"]);
  t("and the refusal NAMES what the table does permit, so a surface renders it rather than computing it",
    bad.legal_from, ["active", "abandoned"]);
  const nonsense = await actionmove(NADIA, { target: ACT, to: "posted", reason: "typo" });
  t("a state outside the vocabulary is refused BAD_TARGET_STATE with the legal set",
    [nonsense.reason, nonsense.legal],
    ["BAD_TARGET_STATE", ["planned", "active", "awaiting_response", "resolved", "abandoned"]]);
  const machine = await actionmove("mem-rec24", { target: ACT, to: "active", reason: "a machine tried" });
  t("a machine credential REACHES the op and is refused BY SHAPE: an action reaches outside this system",
    [machine.ok, machine.reason], [false, "MACHINE_CANNOT_MOVE_ACTION"]);

  const ok = await actionmove(NADIA, { target: ACT, to: "active",
    reason: "the finding is concluded and the records request goes out today" });
  t("planned -> active is accepted, and the ACTOR is server-stamped from the session",
    [ok.ok, ok.from, ok.to, ok.author], [true, "planned", "active", "nadia"]);
  t("the state moved in the record", await stateOf(ACT, NADIA), "active");
  const img = (await GET(`op=image&token=${NADIA}&id=${encodeURIComponent(ACT)}`)).result["bundle.md"];
  t("the document carries the C-4.2 transition and the C-13.2 Session Log entry with the reason",
    [/current_state: active/.test(img), /prior_state: planned/.test(img),
     /to_state: active/.test(img), /Reason: the finding is concluded/.test(img)],
    [true, true, true, true]);
  t("and the moved document still draws zero errors from the catalog: nothing here mints a bundle it rejects",
    await errorsOf(ACT, img), []);

  /* THE NAMED HAZARD. op=dispose held its own copy of the disposition set until
     REC-10 rewired it, and the cost was that a publication and a refusal could
     disagree. This assertion is structural rather than behavioural on purpose:
     a behavioural test passes while a copy exists and agrees. */
  const src = STORE_SRC.slice(STORE_SRC.indexOf("actionMove({ target"),
                               STORE_SRC.indexOf("REC-24 (d): APPENDING ONE ENTRY"));
  t("op=actionmove reads the edge table through vocabFor and holds NO state list of its own",
    [/vocabFor\(STATES,/.test(src),
     /\[\s*"planned"\s*,\s*"active"/.test(src) || /legal\s*=\s*\[/.test(src)],
    [true, false]);
}

/* =====================================================================
   4. op=actioncorrespond (b)(d) — capture or testify, append only.
   ===================================================================== */
console.log("\n--- 4. the correspondence ledger: capture OR testify, never neither, never both (b)(d) ---");
const SENT_BYTES = "PUBLIC RECORDS ACT REQUEST\n\nPlease produce the transfer ledger for FY2025.\n";
const SENT_SHA = sha(SENT_BYTES);
const REPLY_BYTES = "City of Oakland - response to PRA request 2026-118.\nNo responsive records.\n";
const REPLY_SHA = sha(REPLY_BYTES);
const LETTER = "INFO-2026-2400-our-request";
const REPLY_DOC = "INFO-2026-2400-city-reply";
{
  /* The bytes have to be IN THE REGISTER before a ledger entry may name them:
     the register is the trust root and a hash that resolves in it is the whole
     of what "captured, not summarised" means. */
  await promote(NADIA, LETTER, infoMd(LETTER, { title: "Our records request as sent" }),
    "information", "collected", null,
    [{ path: "snapshots/request.txt", sha256: SENT_SHA, bytes: SENT_BYTES.length, encoding: "utf8" }]);

  const neither = await correspond(NADIA, { target: ACT, direction: "sent", at: "2026-08-11" });
  t("an entry with NEITHER bytes nor an account is refused by the op, by name",
    [neither.ok, neither.reason], [false, "NEITHER_CAPTURE_NOR_TESTIMONY"]);
  const both = await correspond(NADIA, { target: ACT, direction: "sent", at: "2026-08-11",
    artifact_sha: SENT_SHA, account: "I emailed the clerk" });
  t("an entry with BOTH is refused: what comes back is CAPTURED, not summarised (DEC-13)",
    [both.ok, both.reason], [false, "CAPTURE_AND_TESTIMONY"]);
  const ghost = await correspond(NADIA, { target: ACT, direction: "sent", at: "2026-08-11",
    artifact_sha: sha("bytes nobody captured") });
  t("a hash that resolves in no register is refused: an equality that costs nothing is not evidence",
    [ghost.ok, ghost.reason], [false, "UNREGISTERED_ARTIFACT"]);
  const anon = await correspond("mem-rec24", { target: ACT, direction: "sent", at: "2026-08-11",
    artifact_sha: SENT_SHA });
  t("a machine credential is refused: on the testimony arm the author IS the evidence",
    [anon.ok, anon.reason], [false, "MACHINE_CANNOT_CORRESPOND"]);

  const sent = await correspond(NADIA, { target: ACT, direction: "sent", at: "2026-08-11",
    medium: "email", party: "City Clerk", artifact_sha: SENT_SHA });
  t("SENT with a hashed artifact is recorded, held as a capture, at ord 0",
    [sent.ok, sent.ord, sent.held_as, sent.author], [true, 0, "capture", "nadia"]);

  /* RECEIVED AS TESTIMONY. The clerk phoned; there are no bytes, and a member's
     dated account is what the record holds. */
  const recv = await correspond(PILAR, { target: ACT, direction: "received", at: "2026-08-25",
    medium: "phone", party: "City Clerk",
    account: "The clerk called to say the request is with the City Attorney and no date was given." });
  t("RECEIVED as testimony is recorded, held as testimony, with the AUTHOR server-stamped",
    [recv.ok, recv.ord, recv.held_as, recv.author], [true, 1, "testimony", "pilar"]);

  /* THE SAME RULE AT THE CATALOG AND AT THE WRITE, tested SEPARATELY from the
     op refusals above — and this is the half a first draft of this suite did
     not have, which is exactly what the negative control found. The op's own
     guards refuse both shapes before anything reaches the document, so breaking
     C-2.10's arm alone left every assertion above green while the catalog
     happily accepted an entry standing for nothing. A rule enforced in three
     places needs an assertion at each, or two of the three are untested. */
  const NEITHER = "ACTN-2026-2411-ledger-neither";
  const neitherDoc = actionMd(NEITHER, { basis: [{ target: INQ, kind: "advances" }], refs: [INQ],
    correspondence: [{ direction: "sent", at: "2026-08-11", party: "City Clerk" }] });
  t("the CATALOG refuses an entry carrying neither bytes nor an account, by name",
    (await errorsOf(NEITHER, neitherDoc)).some((m) => /NEITHER an artifact_sha nor an account/.test(m)), true);
  t("and the WRITE refuses it, so it neither lands nor audits clean",
    (await promote(NADIA, NEITHER, neitherDoc, "action", "planned")).reason, "CORRESPONDENCE_REFUSED");
  const BOTH = "ACTN-2026-2412-ledger-both";
  const bothDoc = actionMd(BOTH, { basis: [{ target: INQ, kind: "advances" }], refs: [INQ],
    correspondence: [{ direction: "received", at: "2026-08-25", artifact_sha: SENT_SHA,
                       account: "and here is my paraphrase of it", author: "nadia" }] });
  t("the CATALOG refuses bytes AND a paraphrase of the same exchange (DEC-13: captured, not summarised)",
    (await errorsOf(BOTH, bothDoc)).some((m) => /BOTH an artifact_sha and an account/.test(m)), true);
  const NOAUTH = "ACTN-2026-2413-ledger-unattributed";
  const noAuthDoc = actionMd(NOAUTH, { basis: [{ target: INQ, kind: "advances" }], refs: [INQ],
    correspondence: [{ direction: "received", at: "2026-08-25", account: "somebody said something" }] });
  t("an account with no author is refused: testimony is somebody's",
    (await errorsOf(NOAUTH, noAuthDoc)).some((m) => /account with no author/.test(m)), true);

  const a = await actionOf(NADIA, ACT, BEFORE_MS);
  t("both entries read back from the correspondence table, in order, with their halves distinct",
    a.action.correspondence.map((e) => [e.ord, e.direction, e.at, e.artifact_sha ? "sha" : "account", e.author]),
    [[0, "sent", "2026-08-11", "sha", "nadia"], [1, "received", "2026-08-25", "account", "pilar"]]);
  t("the captured entry resolves to the bundle its bytes live in, from the register and not from the document",
    a.action.correspondence[0].artifact_bundle_id, LETTER);
  t("APPEND ONLY: the first entry is untouched by the second — a changed entry would itself be a fact",
    a.action.correspondence[0].account, null);
  const img = (await GET(`op=image&token=${NADIA}&id=${encodeURIComponent(ACT)}`)).result["bundle.md"];
  t("the ledger is in the BYTES, and the testimony arm carries no empty artifact_sha",
    [/direction: sent/.test(img), /artifact_sha: /.test(img),
     (img.match(/artifact_sha:/g) || []).length], [true, true, 1]);
  t("the action with a full ledger still draws zero errors from the catalog", await errorsOf(ACT, img), []);
}

/* =====================================================================
   5. THE CLOCK, DERIVED ON READ (f).
   ===================================================================== */
console.log("\n--- 5. the clock: overdue derived ON READ against the injectable clock (f) ---");
{
  const before = await actionOf(NADIA, ACT, BEFORE_MS);
  const after = await actionOf(NADIA, ACT, AFTER_MS);
  t("the SAME bytes read false before the window closes and true after it, with nothing written between",
    [before.action.clock_overdue, after.action.clock_overdue], [false, true]);
  t("both answers name the instant they were computed at, so a reader can check them",
    [before.action.as_of, after.action.as_of],
    [new Date(BEFORE_MS).toISOString(), new Date(AFTER_MS).toISOString()]);
  t("the next pending deadline is the document's own authored date",
    after.action.clock_next, DUE);
  t("the CACHED column is reported beside the derived answer rather than hidden, and they DISAGREE — "
    + "which is exactly the staleness this design accepts on a filter and refuses on an answer",
    [after.action.clock_overdue, after.action.clock_overdue_cached], [true, false]);
  /* DEC-13: the non-response is a dated first-party fact, not an absence. */
  const bytes = await correspond(NADIA, { target: ACT, direction: "no_response", at: DUE,
    artifact_sha: SENT_SHA });
  t("a no_response carrying bytes is refused: nothing arrived, so there is nothing to hash",
    [bytes.ok, bytes.reason], [false, "NO_RESPONSE_HAS_NO_BYTES"]);
  const none = await correspond(NADIA, { target: ACT, direction: "no_response", at: DUE,
    party: "City Clerk", account: "The window closed with no substantive response to the request." });
  t("a NON-RESPONSE is recorded with its date (DEC-13): a refusal to reply is a fact about the body",
    [none.ok, none.direction, none.at, none.held_as], [true, "no_response", DUE, "testimony"]);
}

/* =====================================================================
   6. (g) responds_to: a PRODUCER and a CONSUMER.
   ===================================================================== */
console.log("\n--- 6. responds_to has a producer AND a consumer (g) ---");
{
  await promote(NADIA, REPLY_DOC, infoMd(REPLY_DOC, { title: "City written response" }),
    "information", "collected", null,
    [{ path: "snapshots/reply.pdf", sha256: REPLY_SHA, bytes: REPLY_BYTES.length, encoding: "binary" }]);
  const r = await correspond(NADIA, { target: ACT, direction: "received", at: "2026-09-22",
    medium: "post", party: "City Attorney", artifact_sha: REPLY_SHA });
  t("recording a RECEIVED capture produces the edge on the REPLY, pointing back at the action",
    [r.ok, r.responds_to.bundle_id, r.responds_to.already], [true, REPLY_DOC, false]);
  const replyImg = (await GET(`op=image&token=${NADIA}&id=${encodeURIComponent(REPLY_DOC)}`)).result["bundle.md"];
  t("the edge is in the RESPONDING document's own frontmatter, which is where refs is a projection of",
    [/rel: responds_to/.test(replyImg), new RegExp(`target: ${ACT}`).test(replyImg)], [true, true]);
  const a = await actionOf(NADIA, ACT, AFTER_MS);
  t("the CONSUMER answers what responded to this action, from one indexed lookup",
    a.action.responses, [REPLY_DOC]);
  /* Idempotent: re-recording the same capture does not write the edge twice. */
  const again = await correspond(NADIA, { target: ACT, direction: "received", at: "2026-09-23",
    artifact_sha: REPLY_SHA });
  t("re-recording the same capture does not duplicate the edge", again.responds_to.already, true);
  t("and the consumer still answers ONE response, not two", (await actionOf(NADIA, ACT)).action.responses,
    [REPLY_DOC]);
  /* The relation is GOVERNED and not merely tolerated: REC-16 paid for the
     alternative when `supersedes` sat in the vocabulary with no producer. */
  const bad = infoMd("INFO-2026-2402-mislabelled", { refs: [] })
    .replace("references: []", `references:\n  - target: ${INQ}\n    rel: responds_to\n    status: confirmed`);
  t("a responds_to edge pointing at a QUESTION is refused: it asserts an exchange that never happened",
    (await errorsOf("INFO-2026-2402-mislabelled", bad)).some((m) => /responds_to edge whose target/.test(m)), true);
  t("and the write refuses it too, so it neither lands nor audits clean",
    (await promote(NADIA, "INFO-2026-2402-mislabelled", bad, "information", "collected")).reason,
    "RESPONDS_TO_REFUSED");
}

/* =====================================================================
   7. RESOLVING (c), with a valid resolution.
   ===================================================================== */
console.log("\n--- 7. resolving, with a resolution the catalog accepts (c) ---");
{
  const noRes = await actionmove(NADIA, { target: ACT, to: "resolved", reason: "we are done here" });
  t("resolving with no resolution is refused BEFORE anything moves: C-2.10 requires one",
    [noRes.ok, noRes.reason, noRes.legal, await stateOf(ACT, NADIA)],
    [false, "NO_RESOLUTION", ["complied", "denied", "escalated", "withdrawn"], "active"]);
  const stray = await actionmove(NADIA, { target: ACT, to: "abandoned", reason: "no", resolution: "complied" });
  t("a resolution on a move that is not resolving is refused: it would record an outcome not reached",
    [stray.ok, stray.reason], [false, "RESOLUTION_WITHOUT_RESOLVING"]);
  const ok = await actionmove(NADIA, { target: ACT, to: "resolved",
    reason: "the City produced the ledger and the finding is answered", resolution: "complied" });
  t("active -> resolved with a valid resolution is accepted",
    [ok.ok, ok.to, ok.resolution], [true, "resolved", "complied"]);
  const a = await actionOf(NADIA, ACT, AFTER_MS);
  t("the resolution is projected and the state is terminal",
    [a.current_state, a.action_resolution, a.action.resolution], ["resolved", "complied", "complied"]);
  const img = (await GET(`op=image&token=${NADIA}&id=${encodeURIComponent(ACT)}`)).result["bundle.md"];
  t("the resolved document draws zero errors from the catalog", await errorsOf(ACT, img), []);
  const again = await actionmove(NADIA, { target: ACT, to: "active", reason: "reopening" });
  t("resolved is TERMINAL in the catalog's table, and the op reads that table",
    [again.ok, again.reason], [false, "ILLEGAL_TRANSITION"]);
}

/* =====================================================================
   8. DEC-13: the request_for_comment names WHAT it disclosed.
   ===================================================================== */
console.log("\n--- 8. DEC-13: a request_for_comment names the SPECIFIC inquiries it disclosed ---");
{
  t("request_for_comment is in the published suite, and the suite is the array C-2.10 enforces",
    ACTION_KINDS.includes("request_for_comment"), true);
  const RFC0 = "ACTN-2026-2403-rfc-vague";
  const vague = actionMd(RFC0, { kind: "request_for_comment", title: "Request for comment",
    clock: RESPONSE_WINDOW });
  const errs = await errorsOf(RFC0, vague);
  t("a request_for_comment naming ZERO inquiries is refused BY NAME",
    errs.some((m) => /request_for_comment names ZERO inquiries/.test(m)), true);
  t("the refusal says WHY, in the terms the Columbia review named: without specifics there is nothing to answer",
    errs.some((m) => /nothing to answer/.test(m)), true);
  t("and the WRITE refuses it too, so a vague ask neither lands nor audits clean",
    (await promote(NADIA, RFC0, vague, "action", "planned")).reason, "ACTION_BASIS_REFUSED");

  const RFC1 = "ACTN-2026-2404-rfc-named";
  const named = actionMd(RFC1, { kind: "request_for_comment", title: "Request for comment", refs: [INQ],
    basis: [{ target: INQ, kind: "advances", note: "put to the City as a specific claim, with the memo attached" }],
    clock: RESPONSE_WINDOW });
  t("a request_for_comment that NAMES the inquiry it disclosed is accepted", await errorsOf(RFC1, named), []);
  t("it promotes, and the disclosed question is a ROW rather than a sentence",
    (await promote(NADIA, RFC1, named, "action", "planned")).ok, true);
  const a = await actionOf(NADIA, RFC1, BEFORE_MS);
  t("'we contacted them' and 'we put this claim to them' are now different rows in the record",
    a.action.basis.map((l) => [l.target_id, l.kind]), [[INQ, "advances"]]);

  const RFC2 = "ACTN-2026-2405-rfc-noclock";
  const noWindow = actionMd(RFC2, { kind: "request_for_comment", title: "Request for comment", refs: [INQ],
    basis: [{ target: INQ, kind: "advances" }] });
  t("a request_for_comment with NO authored response window is refused",
    (await errorsOf(RFC2, noWindow)).some((m) => /states the response window/.test(m)), true);
  /* AUTHORED-NESS IS ENFORCED; THE RANGE IS NOT. A 90-day window is the group's
     to give and this record does not second-guess it — the GAO precedent is
     carried as a citation for a surface to show, not as a constant we invented. */
  const RFC3 = "ACTN-2026-2406-rfc-long";
  const longWindow = actionMd(RFC3, { kind: "request_for_comment", title: "Request for comment", refs: [INQ],
    basis: [{ target: INQ, kind: "advances" }],
    clock: [{ text: "Response due", description: "A long window, chosen by the group.",
              date: "2026-12-01", basis: "The group's own decision to allow the holidays",
              status: "pending" }] });
  t("a window OUTSIDE the 7-30 day precedent is accepted: the range is a citation, not a rule",
    await errorsOf(RFC3, longWindow), []);
  t("and the precedent is CARRIED with its source, marked as not enforced",
    [RFC_RESPONSE_WINDOW_PRECEDENT.min_days, RFC_RESPONSE_WINDOW_PRECEDENT.max_days,
     RFC_RESPONSE_WINDOW_PRECEDENT.enforced, /GAO/.test(RFC_RESPONSE_WINDOW_PRECEDENT.source)],
    [7, 30, false, true]);
}

/* =====================================================================
   9. DEC-14: outcome by default; impact needs evidence that is not ours.
   ===================================================================== */
console.log("\n--- 9. DEC-14: an OUTCOME by default, an IMPACT claim held to the standard ---");
{
  const OUT = "ACTN-2026-2407-outcome";
  const outcome = actionMd(OUT, { refs: [INQ], basis: [{ target: INQ, kind: "advances" }],
    consequence: { claim: "outcome", at: "2026-10-01",
      description: "The Council convened a hearing on the transfer on 2026-10-01." } });
  t("an outcome draws no findings: a dated first-party fact about the body, at full strength",
    await errorsOf(OUT, outcome), []);
  t("it promotes", (await promote(NADIA, OUT, outcome, "action", "planned")).ok, true);
  const o = (await actionOf(NADIA, OUT, AFTER_MS)).action.consequence;
  t("and it is RECORDED, determined, with no grade anywhere near it",
    [o.claim, o.state, o.determined, o.grade], ["outcome", "recorded", true, null]);

  /* THE CLAIM THIS RECORD WOULD REFUSE FROM A PUBLIC BODY: impact from sequence
     alone. It LANDS — unproven is not a refusal — and it says what it is. */
  const IMP = "ACTN-2026-2408-impact-bare";
  const bare = actionMd(IMP, { refs: [INQ], basis: [{ target: INQ, kind: "advances" }],
    consequence: { claim: "impact", at: "2026-10-01",
      description: "Our request caused the Council to convene the hearing." } });
  t("an impact claim resting on nothing outside us still LANDS: unproven is a state, not a refusal",
    (await promote(NADIA, IMP, bare, "action", "planned")).ok, true);
  const u = (await actionOf(NADIA, IMP, AFTER_MS)).action.consequence;
  t("and it is recorded UNPROVEN, on the R1 shape: no computed strength, and it names why",
    [u.claim, u.state, u.determined, u.grade, u.evidence], ["impact", "unproven", false, null, []]);
  t("it is RENDERED AS STATED, not graded: the detail says what we have not established",
    [/UNPROVEN/.test(u.detail), /not a low score/.test(u.detail), /sequence alone/.test(u.detail)],
    [true, true, true]);

  /* OUR OWN ELICITED REPLY IS NOT OUTSIDE EVIDENCE. It is excellent evidence
     about the body and no evidence that our asking caused anything. */
  const SELFEV = "ACTN-2026-2409-impact-self";
  const selfEvidenced = actionMd(SELFEV, { refs: [INQ],
    basis: [{ target: INQ, kind: "advances" }],
    consequence: { claim: "impact", at: "2026-10-01",
      description: "Our request caused the City to change its practice." } })
    .replace("---\n\n## Plan", ["correspondence:", "  - direction: received", "    at: 2026-09-22",
      `    artifact_bundle_id: ${REPLY_DOC}`, "    account: \"The City replied in writing.\"",
      "    author: nadia", "---", "", "## Plan"].join("\n"));
  const withOwnLeg = selfEvidenced.replace(`  - target: ${INQ}\n    kind: advances`,
    `  - target: ${INQ}\n    kind: advances\n  - target: ${REPLY_DOC}\n    kind: rests_on`);
  t("an impact claim resting ONLY on the reply our own action elicited reads UNPROVEN",
    consequenceState(fmOf(withOwnLeg)).state, "unproven");
  t("...and names no evidence, because our own action's output is not evidence about our own action",
    consequenceState(fmOf(withOwnLeg)).evidence, []);

  /* CITE SOMETHING OUTSIDE US AND IT BECOMES A CLAIM LIKE ANY OTHER. */
  const PROVEN = "ACTN-2026-2410-impact-proven";
  const MEMO = "INFO-2026-2400-staff-memo";
  await promote(NADIA, MEMO, infoMd(MEMO, { title: "Staff memo naming the group's report" }),
    "information", "collected");
  const proven = actionMd(PROVEN, { refs: [INQ, MEMO],
    basis: [{ target: INQ, kind: "advances" }, { target: MEMO, kind: "rests_on" }],
    consequence: { claim: "impact", at: "2026-10-01",
      description: "The staff memo names our report as the reason for the change." } });
  t("an impact claim resting on a document that is not our own action is ESTABLISHED",
    (await promote(NADIA, PROVEN, proven, "action", "planned")).ok, true);
  const p = (await actionOf(NADIA, PROVEN, AFTER_MS)).action.consequence;
  t("...determined, naming the evidence, and STILL carrying no grade (never a fifth grade)",
    [p.state, p.determined, p.evidence, p.grade], ["established", true, [MEMO], null]);
}

/* =====================================================================
   10. THE VOCABULARIES AND THE FLOOR.
   ===================================================================== */
console.log("\n--- 10. the vocabularies, and the D-113 floor ---");
{
  t("the basis kinds are the closed pair", ACTION_BASIS_KINDS, ["rests_on", "advances"]);
  t("the directions include the one that is easy to leave out (DEC-13)",
    CORRESPONDENCE_DIRECTIONS, ["sent", "received", "no_response"]);
  t("both new tables are named in purge's TABLES list, so a whole-store purge cannot report ALL and leave rows",
    [/"action_basis"/.test(STORE_SRC.slice(STORE_SRC.indexOf("const TABLES = ["))),
     /"correspondence"/.test(STORE_SRC.slice(STORE_SRC.indexOf("const TABLES = [")))],
    [true, true]);
  const st = rP(await GET(`op=stats&token=adm-rec24`));
  t("and both are COUNTED in stats, so a purge can PROVE it took them rather than assert it",
    [typeof st.actionBasis, typeof st.correspondence, st.actionBasis > 0, st.correspondence > 0],
    ["number", "number", true, true]);
  const purged = rP(await GET(
    `op=purge&token=adm-rec24&confirm=bio&bundleId=${encodeURIComponent(ACT)}`));
  t("a per-bundle purge of the action takes its legs and its ledger with it", purged.ok, true);
  const after = rP(await GET(`op=stats&token=adm-rec24`));
  t("...and the counts FALL, measured rather than asserted (D-113)",
    [after.correspondence < st.correspondence, after.actionBasis < st.actionBasis], [true, true]);
}

console.log(`\naction-loop: ${pass} pass, ${fail} fail`);
await mf.dispose();
process.exit(fail ? 1 : 0);
