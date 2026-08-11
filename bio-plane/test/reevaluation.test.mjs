/* NEGATIVE CONTROL: (REC-17's two, each broken ALONE and restored; 63 pass when whole) (a) THE REVERSE LOOKUP IS DROPPED -- in src/store.mjs #restsOnLive change `WHERE ib.target_id=? ORDER BY ib.bundle_id, ib.ord` to `WHERE ib.target_id=? AND 1=0 ORDER BY ib.bundle_id, ib.ord`, AND in reevaluations() change the leg query's `FROM inquiry_basis WHERE target_id=? ORDER BY bundle_id, ord` to `... WHERE target_id=? AND 1=0 ORDER BY bundle_id, ord` -> 29 pass, 33 FAIL. MEASURED: an inquiry resting on a superseded case, on a deferred one, on a reopened one and on a case republished at a new edition all report NOTHING; the dismiss of a cited inquiry SUCCEEDS and the question is silently abandoned under a signed edition; op=inquirydivide divides a question a live leg still rests on; op=affordances publishes `inquirydivide` on a question the store would have refused (DEC-8's disagreement, arriving because the derivation and the refusal share the broken predicate); and every act's `reevaluation.raised` block is empty, so nothing anywhere says a second look is owed. BOTH HALVES MUST GO TOGETHER: the guard and the read run the same lookup by different doors, and breaking one alone leaves the other answering. (b) A DISMISS IS PERMITTED ON A CITED INQUIRY -- in src/store.mjs dispose() guard the CITED block with `if (false && to === "dismissed") {` -> 57 pass, 6 FAIL. MEASURED, and the headline is the accepts-when's own sentence: dismissing INQ-2026-1700-moved is ACCEPTED, and the published case that rests on it then names, in its own basis panel, a leg that is now an ABANDONED question -- while its frozen published_strength still reads [[capture,graded,B],[connection,graded,C]], exactly as signed. The harm is not that the strength changed; it is that it did NOT, and nothing anywhere says so. The divide arm is untouched by this control and still refuses, which is what shows the two acts' guards are separate rules rather than one. Restore after each. BOTH RUN 2026-08-04 (rec17-agent), measured exactly as recorded here. */
/* REC-17 / P-64: THE RE-EVALUATION OBLIGATION, AS A QUERY AND NOT A FLAG,
 * WIDENED BY D-5 TO THE WALK-BACK EDGES.
 *
 * WHAT THIS IS FOR. When a case is superseded, or republished at a new edition,
 * everything that cited it needs a second look. The whole mechanism is
 * `SELECT bundle_id FROM inquiry_basis WHERE target_id = <moved>` over REC-11's
 * `inquiry_basis_target` index, plus `bundles.inquiry_superseded_by` — the
 * reverse of REC-16's `supersedes` edge — so the supersession half is a lookup
 * and not a graph walk either. Nothing is STORED: a stored verdict goes stale
 * in both directions (REC-12 proved that of the strength cache), and no verdict
 * here is computed from strength, because the strength has not been changed for
 * anybody. The member decides.
 *
 * THE WIDENING, AND ITS CRITERION IS THE CORPUS'S OWN. `SB-CORE.md:1507` says
 * retire is "the existing TERMINAL transition, which already refuses on a
 * downstream consequence (CITED) rather than on the actor". So:
 *
 *   TERMINAL acts on a cited inquiry REFUSE with CITED — dismiss and divide,
 *     with the offenders listed and the document path's own remedy wording. No
 *     new mechanism and no new refusal name: it is retire's `CITED` over
 *     REC-11's reverse index.
 *   REVERSIBLE acts RAISE the obligation — defer and reopen — exactly as
 *     supersession does.
 *
 * AND ONE DISTINCTION THIS SUITE IS BUILT AROUND, because it is the item's one
 * judgment call and it is reported to CONDUCT rather than buried. DIVISION
 * refuses on a WORKING dependent (open, concluded, deferred, dismissed) and NOT
 * on a PUBLISHED one; DISMISSAL refuses on both. The reason is what the two
 * acts leave behind. C-6.2's remedies for a leg whose target moved are "restore
 * from history", "re-point to the successor", "sever with a reason": a division
 * CARRIES THE QUESTION FORWARD into children that supersede it and are
 * resolvable in both directions, so the second remedy exists and the dependent
 * gets R7's obligation; a dismissal ABANDONS the question and leaves nothing to
 * re-point to, so a dependent that cannot edit its own basis — a signed edition
 * — would be stranded forever. Block 3 and block 5 are the two halves of that,
 * and negative control (b) is the harm the dismissal arm prevents.
 *
 * WHAT THIS SUITE ASSERTS, in order:
 *   1. NOTHING MOVED, NOTHING OWED. The baseline that makes every later
 *      assertion mean something: a published case resting on three legs reports
 *      no obligation at all while nothing beneath it has moved.
 *   2. DEFER RAISES IT (D-5's reversible arm), and dismissing the same question
 *      is REFUSED CITED naming the offender.
 *   3. REOPEN RAISES IT, on the same question, on the way back.
 *   4. A WORKING dependent blocks DIVISION and DISMISSAL alike, by name.
 *   5. SUPERSESSION THROUGH A REAL DIVISION raises it on the published case,
 *      naming the moved leg, naming both children, and ALTERING NO STRENGTH —
 *      neither the frozen pair in the signed bytes nor the derived pair.
 *   6. A NEWER EDITION raises it on a leg that named edition 1 (DEC-12), and
 *      recomputes nothing: the leg keeps citing the edition it names.
 *   7. THE GATE. op=reevaluations is a GATED read (REC-25/REC-30) in both of
 *      that sweep's shapes, and a caller-supplied `viewer` is overwritten.
 *   8. STRUCTURAL: no derived obligation is ever written to the reeval columns,
 *      no answer carries a composed scalar strength, and the reverse lookup is
 *      the one indexed query the item specifies.
 *
 * NEGATIVE CONTROLS RUN 2026-08-04 (rec17-agent), each alone and restored; the
 * header line above is the re-run recipe and carries the exact edits.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync, mkdtempSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseFrontmatter } from "../checks/bio-checks.mjs";
import { makePublishingProject, allLoadBearing } from "./publishingproject.mjs";

const IDX = fileURLToPath(new URL("../src/index.mjs", import.meta.url));
const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: IDX, script: readFileSync(IDX, "utf8"),
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec17", MEMBER_TOKEN: "mem-rec17", PROBE_TOKEN: "prb-rec17", VERSION: "test" },
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

/* THE op under test, driven through the CONTROL PLANE — a real caller's only
   route, with the literal `op=reevaluations` uninterpolated so coverage credits
   it there (D-43: op=invitelook shipped with a ReferenceError while 1276
   store-level assertions passed). */
const reevals = async (target = null, tok = "mem-rec17") =>
  rP(await GET(`op=reevaluations&token=${tok}`
    + (target ? `&target=${encodeURIComponent(target)}` : "")));
const owed = (r, bundleId) => (r?.obligations ?? []).filter((o) => o.bundle_id === bundleId);
const sourcesOn = (r, bundleId) => owed(r, bundleId).flatMap((o) => o.causes.map((c) => c.source));

const conclude = async (tok, { target, conclusion, falsifier }) =>
  rP(await GET(`op=conclude&token=${tok}&target=${encodeURIComponent(target)}`
    + `&conclusion=${encodeURIComponent(conclusion)}&falsifier=${encodeURIComponent(falsifier)}`));
/* REC-44 / DEC-44 (2026-08-04): op=publish now requires an authored `scope` —
   a published case is a CONTAINER over one or more FINDINGS and states what
   brought them together. The helper supplies a default so every assertion below
   goes on measuring what it was written to measure; the NEW rule is asserted on
   its own, by name, rather than by these calls happening to omit the field.
   A body that sets `scope` (or `scope: ""`, to drive the refusal) wins. */
/* CORRECTED 2026-08-10, CASE-2 / DEC-72, in the shape the paragraph above already
   established one ruling earlier: a case is a PRODUCTION OF A PROJECT, so the act
   takes a publishing project and an AUTHORED designation for every member. Both
   are supplied as defaults for the same reason `scope` is — this suite's subject
   is the re-evaluation obligation, not the publication ceremony, and every
   assertion below must go on measuring what it was written to measure. The new
   rules are asserted BY NAME in `caseproduction.test.mjs`. */
const publish = async (tok, body) => rP(await POST(`op=publish&token=${tok}`,
  { scope: "Whether the signature question was properly handled, on the documents in hand.",
    project: PUBLISHING_PROJECT, roles: allLoadBearing(body), ...body }));
const divide = async (tok, { target, ...body }) =>
  rP(await POST(`op=inquirydivide&token=${tok}&target=${encodeURIComponent(target ?? "")}`, body));
const reopen = async (tok, target, reason) =>
  rP(await GET(`op=reopen&token=${tok}&target=${encodeURIComponent(target)}`
    + `&reason=${encodeURIComponent(reason)}`));
const selectOne = async (tok, ids) =>
  rP(await POST(`op=select&token=${tok}&kind=enumerated`, { ids })).handle;
const dispose = async (tok, ids, to, reason) => {
  const handle = await selectOne(tok, ids);
  return rP(await GET(`op=dispose&token=${tok}&handle=${handle}&to=${to}`
    + `&reason=${encodeURIComponent(reason)}`));
};
const affordances = async (target, tok = "mem-rec17") =>
  rP(await GET(`op=affordances&token=${tok}&target=${encodeURIComponent(target)}`));
const actIds = (r) => (r?.acts ?? []).map((a) => a.id).sort();
const imageOf = async (id) => (await GET(`op=image&token=mem-rec17&id=${encodeURIComponent(id)}`)).result?.["bundle.md"];
/* The legs read from the DOCUMENT, which is the authority for a basis (D-21:
   inquiry_basis is a projection of it, never a second place to state it).
   the DO path `basis` is DO-internal — no op reaches it, M0-12, so it is named
   here as a path rather than as an op; REC-11 left its control-plane surface to the
   items that need one — so a caller reads the bytes, exactly as this does. */
const legsOf = async (id) => ((parseFrontmatter(await imageOf(id)).data || {}).basis || []);
const listRow = async (id) => ((await GET("op=list&token=mem-rec17")).result || []).find((b) => b.bundle_id === id);
const stateOf = async (id) => (await listRow(id))?.current_state;
const shaOf = async (id) => (await listRow(id))?.bundle_sha;
const strengthPair = async (id) => {
  const r = await reevals();
  const o = (r.obligations ?? []).find((x) => x.bundle_id === id);
  return o ? [o.strength.capture.grade, o.strength.connection.grade] : null;
};

/* ---- keys and roster. Ratification is real: an edition without a signature is
   not an edition, and the DEC-12 arm of this item is about editions. ---- */
const dir = mkdtempSync(join(tmpdir(), "reeval-"));
execFileSync("ssh-keygen", ["-t", "ed25519", "-N", "", "-C", "pilar", "-f", join(dir, "pilar"), "-q"]);
const keyB64 = readFileSync(join(dir, "pilar.pub"), "utf8").trim().split(/\s+/)[1];
const signRatify = (bundleId, bundleSha) => {
  const f = join(dir, `stmt-${Math.random().toString(36).slice(2)}`);
  writeFileSync(f, `bio-ratify ${bundleId} ${bundleSha}\n`);
  execFileSync("ssh-keygen", ["-Y", "sign", "-f", join(dir, "pilar"), "-n", "bio-ratify", f],
    { stdio: ["ignore", "ignore", "ignore"] });
  return readFileSync(f + ".sig", "utf8");
};

const enrol = async (memberId, password, role, capabilities) => {
  const add = rP(await POST("op=memberadd&token=adm-rec17", { memberId, cover: `cover for ${memberId}`, role, capabilities }));
  const en = rP(await POST("op=enroll", { invite: add.invite, handle: memberId, password }));
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = rP(await POST("op=login", { role: `member:${memberId}`, password }));
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const PILAR = await enrol("pilar", "pilar-passphrase-1", "admin", ["contribute", "publish"]);
await enrol("omar", "omar-passphrase-1", "admin", ["contribute", "publish"]);
/* ROSA holds `contribute` ONLY — no publish, no ownership. DEC-30's
   author-scoping is what lets her divide, and this suite divides as her for
   that reason: de-escalation must never need permission from someone whose
   incentive may run the other way. */
const ROSA = await enrol("rosa", "rosa-passphrase-1", "member", ["contribute"]);
rP(await POST("op=signeradd&token=adm-rec17", { keyB64, memberId: "pilar", comment: "pilar laptop" }));

const ratify = async (id) => {
  const bundleSha = await shaOf(id);
  return rP(await POST(`op=ratify&token=${PILAR}`,
    { bundleId: id, expectedSha: bundleSha, sig: signRatify(id, bundleSha) }));
};

/* ---- documents ---- */
const NOW = "2026-07-01T00:00:00Z";
const LATER = "2026-07-02T00:00:00Z";
/* CASE-2 / DEC-72's publishing project. NO BAR is declared, so nothing this
   suite publishes is newly gated — the fixture adds a publisher, not a fence. */
const PUBLISHING_PROJECT = await makePublishingProject({
  post: POST, mf, sha, machineToken: "adm-rec17", owner: "pilar",
  id: "PROJ-2026-1700-reeval", created: NOW, updated: LATER });
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
      ...(l.date ? [`    date: ${l.date}`] : []),
      ...(l.edition !== undefined ? [`    target_edition: ${l.edition}`] : [])])]
  : [];

const inquiryMd = (id, { question = `What does ${id} rest on?`, state = "open",
                         refs = [], legs = [], extra = [] } = {}) => ["---",
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
  ...legLines(legs), ...extra,
  "---", "",
  "## Question", "", question, "",
  "## What It Rests On", "",
  "## Conclusion", "",
  "## What Would Falsify This", "",
  "## Session Log", "",
  `### Session ${LATER} | Formation | agent`,
  "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");

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

let snapSeq = 0;
const promote = async (id, md, type, state, tok = PILAR, base = null) =>
  rP(await POST(`op=promote&token=${tok}`, {
    bundleId: id, base, snapKey: `20260804T${String(100000 + (++snapSeq)).slice(-6)}Z_${sha(String(snapSeq)).slice(0, 8)}`,
    meta: { object_type: type, group: "believe-in-oakland", title: `t ${id}`,
            current_state: state, created: NOW, last_updated: LATER },
    files: [{ path: "bundle.md", text: md, bytes: md.length, sha256: sha(md) }],
    /* REC-18, 2026-08-04: an INFORMATION bundle REGISTERS a capture. A
       capture-axis grade is now EARNED from the capture record, so a document
       with no registered bytes has nothing for that axis to measure and the leg
       claiming one is refused. One sha per bundle, because `register.capture_sha`
       is the table's primary key. */
    register: type === "information"
      ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }]
      : [],
  }));
const mustPromote = async (...a) => {
  const r = await promote(...a);
  if (r.ok === false) throw new Error(`promote ${a[0]}: ${JSON.stringify(r)}`);
  return r;
};

const INFO_CAP = "INFO-2026-1700-capture-b";
const INFO_CONN = "INFO-2026-1700-connection-c";
const INFO_X = "INFO-2026-1700-transfer-memo";
const INQ_MOVED = "INQ-2026-1700-moved";        // the question that MOVES under the case
const INQ_CASE = "INQ-2026-1700-case";          // the PUBLISHED dependent
const INQ_BLOCKED = "INQ-2026-1700-blocked";    // a question a WORKING dependent rests on
const INQ_WORKING = "INQ-2026-1700-working";    // that working dependent
const INQ_DEPENDS = "INQ-2026-1700-depends";    // rests on the CASE, at edition 1
const KID_A = "INQ-2026-1700-authority";
const KID_B = "INQ-2026-1700-signature";

await mustPromote(INFO_CAP, infoMd(INFO_CAP), "information", "collected");
await mustPromote(INFO_CONN, infoMd(INFO_CONN), "information", "collected");
await mustPromote(INFO_X, infoMd(INFO_X), "information", "collected");

/* THE MOVED QUESTION rests on one document, which is what makes it DIVISIBLE
   (the apportionment refuses to leave a child with nothing). */
await mustPromote(INQ_MOVED, inquiryMd(INQ_MOVED, {
  question: "Was the FY2024 sewer fund transfer authorised?",
  refs: [INFO_X], legs: [{ target: INFO_X }] }), "inquiry", "open");

/* THE CASE rests on a capture-graded leg at B, a connection-graded leg at C,
   and A LEG ON THE MOVED QUESTION at connection B. The pair is therefore
   (capture B, connection C) and the moved leg is NOT the determining member on
   either axis — which is what lets block 5 show that superseding it changes
   NOTHING about either strength, rather than changing nothing visible. */
/* CORRECTED 2026-08-04 (REC-18), never exempted, and every GRADE is unchanged —
   the pair stays (capture B, connection C) and the moved leg stays a
   non-determining connection B, because this suite is about the obligation and
   not about the ladder. What changed is where each letter comes from:
   `resolution` is now EARNED against the inquiry's subject entity (this question
   names none), so the capture leg says `capture` and earns B from the capture
   the promote helper now registers, and the two connection legs say `hunch` —
   the honest name for an authored connection grade, the only authored source
   above D, carrying the author and date DEC-15 requires. The third leg's target
   is an INQUIRY, which earns nothing from the recogniser in any case: an inquiry
   is not a captured document. */
const CASE_LEGS = [{ target: INFO_CAP, grade: "B", axis: "capture", source: "capture" },
                   { target: INFO_CONN, grade: "C", axis: "connection", source: "hunch",
                     author: "pilar", date: "2026-08-04" },
                   { target: INQ_MOVED, grade: "B", axis: "connection", source: "hunch",
                     author: "pilar", date: "2026-08-04" }];
await mustPromote(INQ_CASE, inquiryMd(INQ_CASE, {
  question: "Did the City transfer sewer funds without authority?",
  refs: [INFO_CAP, INFO_CONN, INQ_MOVED], legs: CASE_LEGS }), "inquiry", "open");

await mustPromote(INQ_BLOCKED, inquiryMd(INQ_BLOCKED, {
  question: "Who signed the transfer memo?",
  refs: [INFO_X], legs: [{ target: INFO_X }] }), "inquiry", "open");
await mustPromote(INQ_WORKING, inquiryMd(INQ_WORKING, {
  question: "Was the signature delegated?",
  refs: [INFO_X, INQ_BLOCKED],
  legs: [{ target: INFO_X }, { target: INQ_BLOCKED }] }), "inquiry", "open");

const CONCL = "The transfer rests on a memo nobody adopted.";
const FALS = "An adopted resolution naming the transfer would overturn this.";
await conclude(PILAR, { target: INQ_CASE, conclusion: CONCL, falsifier: FALS });

const pub1 = await publish(PILAR, { target: INQ_CASE,
  statement: "This case covers the FY2024 sewer fund transfer only, on the documents in hand at edition 1.",
  excluded: [{ description: "any 2019 council minutes", reason: "outside the period at issue" }],
  subjectPosition: "sought_and_answered",
  subjectJustification: "We put the claims to the City Administrator on 2026-06-20 and printed what came back.",
  /* ADDED 2026-08-05, REC-47 / DEC-46 (a): fixture, not this suite's subject. */
  biasAcknowledgement: "The group holds a declared position that fund transfers should be adopted in public "
                     + "session; edition 1 is read through it." });
if (!pub1.ok) throw new Error(`publish 1: ${JSON.stringify(pub1)}`);
const rat1 = await ratify(INQ_CASE);
if (!rat1.ok) throw new Error(`ratify 1: ${JSON.stringify(rat1)}`);

/* The FROZEN pair, read out of the signed bytes once, and compared against
   again at the end of every block. It is the thing that must never move. */
const frozenPairOf = async (id) => {
  const fm = parseFrontmatter(await imageOf(id)).data || {};
  return (fm.published_strength || []).map((a) => [a.axis, a.state, a.grade]);
};
const FROZEN_1 = await frozenPairOf(INQ_CASE);

/* ============================================ 1. nothing moved, nothing owed */
console.log("\n--- 1. the baseline: nothing beneath the case has moved, so nothing is owed ---");
{
  t("(fixture) the case is published at edition 1 with a frozen pair of capture B / connection C",
    [pub1.edition, rat1.edition, FROZEN_1],
    [1, 1, [["capture", "graded", "B"], ["connection", "graded", "C"]]]);
  const all = await reevals();
  t("op=reevaluations answers, and reports NO obligation anywhere in the corpus",
    [all.ok, all.count, all.obligations], [true, 0, []]);
  t("and asked of the moved question specifically, still nothing",
    (await reevals(INQ_MOVED)).count, 0);
  t("a target the store does not hold answers NO_SUCH_BUNDLE, the shape an invisible one answers",
    (await reevals("INQ-2026-1700-nope")).reason, "NO_SUCH_BUNDLE");
  /* Standing lesson 4, and it is load-bearing here: an answer of `no obligation`
     costs nothing to produce from an EMPTY index. What proves the index is
     populated is that the same reverse lookup, asked by the other door, already
     BITES — dismissing this question is refused CITED naming the case (block 2
     asserts the refusal itself; here it is the control that makes the silence
     above a real answer). */
  t("(control) the reverse index is POPULATED — op=affordances already withholds `inquirydivide` from a "
    + "question a working inquiry rests on, and that answer comes from the same lookup",
    actIds(await affordances(INQ_BLOCKED)).includes("inquirydivide"), false);
  t("(control) and the case's legs are all three there, so the read had something to walk",
    (await legsOf(INQ_CASE)).map((l) => l.target), [INFO_CAP, INFO_CONN, INQ_MOVED]);
}

/* ================================= 2. D-5: dismiss REFUSES, defer RAISES */
console.log("\n--- 2. D-5, the terminal arm and the reversible arm on the SAME question ---");
{
  const dismissed = await dispose(PILAR, [INQ_MOVED], "dismissed", "we are not pursuing this");
  t("DISMISSING a cited inquiry is refused CITED — retire's refusal, over REC-11's reverse index",
    [dismissed.ok, dismissed.reason], [false, "CITED"]);
  t("and the offenders are NAMED, down to the leg's ordinal: an actor told only 'refused' cannot act",
    (dismissed.offenders ?? []).map((o) => [o.id, (o.citedBy ?? []).map((c) => [c.bundle_id, c.ord])]),
    [[INQ_MOVED, [[INQ_CASE, 2]]]]);
  t("the refusal names the remedy the document path already words — sever, or defer instead",
    [/sever the citation with a reason/.test(dismissed.detail ?? ""), /DEFER instead/.test(dismissed.detail ?? "")],
    [true, true]);
  t("nothing moved: the refusal fires before the state does",
    await stateOf(INQ_MOVED), "open");

  /* THE HARM THE REFUSAL PREVENTS, asserted POSITIVELY so negative control (b)
     produces it verbatim rather than leaving a reader to infer it. With the
     guard removed this dismiss LANDS, and the published case's own basis panel
     then names a leg that is an ABANDONED question — while its frozen strength,
     capture B and connection C, still reads exactly as it was signed. The harm
     is not that the strength changed. It is that it did not, and nothing
     anywhere would say so. */
  t("the case's basis panel names a LIVE question, nothing is owed on it, and its frozen strength reads as signed",
    [await stateOf(INQ_MOVED), (await reevals(INQ_MOVED)).count, await frozenPairOf(INQ_CASE)],
    ["open", 0, FROZEN_1]);

  const deferred = await dispose(PILAR, [INQ_MOVED], "deferred", "waiting on the records request");
  t("DEFERRING the same question SUCCEEDS: it is reversible, so it raises the obligation instead",
    [deferred.ok, await stateOf(INQ_MOVED)], [true, "deferred"]);
  t("and the act itself names what it put a second look on, with the source and the date",
    [deferred.reevaluation?.source ?? null, (deferred.reevaluation?.raised ?? []).map((x) => [x.bundle_id, x.ord])],
    ["deferred", [[INQ_CASE, 2]]]);

  const r = await reevals(INQ_MOVED);
  t("the READ then answers the same obligation for anyone who did not perform the act",
    [r.count, r.obligations[0]?.bundle_id ?? null, r.obligations[0]?.target_state ?? null],
    [1, INQ_CASE, "deferred"]);
  t("it names the MOVED LEG by ordinal, role and axis — not merely the dependent",
    /* grade_source CORRECTED 2026-08-04 (REC-18): the leg is the same leg and
       the obligation is the same obligation — an authored connection grade is
       now spelled `hunch`, which is what it always was. */
    r.obligations[0]?.legs ?? [], [{ ord: 2, role: "supports", grade: "B",
                              grade_axis: "connection", grade_source: "hunch",
                              target_edition: null }]);
  t("the REUSED triple: flag, since and source, in the reeval_pending vocabulary already in the schema",
    [r.obligations[0]?.reeval?.flag ?? null, r.obligations[0]?.reeval?.source ?? null,
     typeof r.obligations[0]?.reeval?.since], [true, "deferred", "string"]);
  t("the case's OWN authored triple is carried BESIDE it and never merged into it",
    r.obligations[0]?.stored ?? null, { flag: false, since: null, source: null });
  t("BOTH strengths are named, as two axis objects, and NOTHING here is a composed scalar",
    [r.obligations[0]?.strength?.capture?.grade ?? null, r.obligations[0]?.strength?.connection?.grade ?? null,
     "grade" in (r.obligations[0]?.strength ?? {})], ["B", "C", false]);
  t("and the FROZEN pair in the signed bytes is untouched: the obligation states a fact, it does not restate a strength",
    await frozenPairOf(INQ_CASE), FROZEN_1);
}

/* ============================================= 3. the reversible arm, back */
console.log("\n--- 3. reopening raises it too: the question is being worked again ---");
{
  const re = await reopen(PILAR, INQ_MOVED, "the records request came back and it bears on this");
  t("op=reopen succeeds over a cited inquiry — reversible acts are never refused CITED",
    [re.ok, re.to, await stateOf(INQ_MOVED)], [true, "open", "open"]);
  t("and it raises the obligation on every dependent, naming the source",
    [re.reevaluation?.source ?? null, (re.reevaluation?.raised ?? []).map((x) => x.bundle_id)],
    ["reopened", [INQ_CASE]]);
  const r = await reevals(INQ_MOVED);
  t("the read agrees, and the source is now `reopened` rather than `deferred`",
    sourcesOn(r, INQ_CASE), ["reopened"]);
  t("still no strength anywhere has moved",
    [await strengthPair(INQ_CASE), await frozenPairOf(INQ_CASE)], [["B", "C"], FROZEN_1]);
}

/* ================================= 4. a WORKING dependent blocks both terminal acts */
console.log("\n--- 4. a working dependent blocks DIVISION and DISMISSAL alike, by name ---");
{
  const div = await divide(ROSA, { target: INQ_BLOCKED,
    reason: "This was two questions and mixing them held both down.",
    children: [{ id: KID_A, question: "Who held the delegation?", legs: [0] },
               { id: KID_B, question: "Who signed the memo itself?", legs: [0] }] });
  t("DIVIDING a question a working inquiry rests on is refused CITED",
    [div.ok, div.reason], [false, "CITED"]);
  t("and the offender is named with its leg's ordinal and its state",
    (div.offenders ?? []).map((o) => [o.bundle_id, o.ord, o.state]), [[INQ_WORKING, 1, "open"]]);
  t("neither child was created: the refusal fires before anything is written",
    [await stateOf(KID_A), await stateOf(KID_B), await stateOf(INQ_BLOCKED)],
    [undefined, undefined, "open"]);
  t("op=affordances does NOT publish `inquirydivide` for it — a pre-flight may never offer what the store refuses (DEC-8)",
    actIds(await affordances(INQ_BLOCKED)).includes("inquirydivide"), false);
  /* And the act it DOES still publish, deliberately: `dismissed` is a parameter
     of op=dispose, not the act, and `deferred` stays legal over a cited
     question. Narrowing the act would unpublish DEFER on the one question a
     member most wants to defer. */
  t("op=dispose IS still published for it, because deferring is legal and dismissing is a parameter",
    actIds(await affordances(INQ_BLOCKED)).includes("dispose"), true);
  const dis = await dispose(PILAR, [INQ_BLOCKED], "dismissed", "not our fight");
  t("and dismissing it is refused CITED by the same predicate",
    [dis.ok, dis.reason, (dis.offenders?.[0]?.citedBy ?? []).map((c) => c.bundle_id)],
    [false, "CITED", [INQ_WORKING]]);
  t("while DEFERRING it succeeds and raises the obligation on the working dependent",
    await (async () => { const d = await dispose(PILAR, [INQ_BLOCKED], "deferred", "waiting on the delegation file");
                         return [d.ok, (d.reevaluation?.raised ?? []).map((x) => x.bundle_id)]; })(),
    [true, [INQ_WORKING]]);
}

/* ============================ 5. supersession, through a REAL division */
console.log("\n--- 5. superseding the question through op=inquirydivide raises it on the published case ---");
{
  /* The only dependent of INQ_MOVED is a PUBLISHED case, whose basis is inside
     a signed edition and can never withdraw a leg. Refusing here would make the
     case's own publication the thing that freezes a malformed question in the
     record forever; a division leaves a successor resolvable in both
     directions, which is what the obligation then points at. */
  t("op=affordances DOES publish `inquirydivide` here: the only dependent is frozen, and the store agrees",
    actIds(await affordances(INQ_MOVED)).includes("inquirydivide"), true);
  const div = await divide(ROSA, { target: INQ_MOVED,
    reason: "This was two questions: whether the transfer was authorised at all, and who signed it.",
    children: [{ id: KID_A, question: "Was the FY2024 transfer authorised by anyone?", legs: [0] },
               { id: KID_B, question: "Did anyone with delegated authority sign it?", legs: [0] }] });
  t("the division lands and the parent is terminal",
    [div.ok, div.to, await stateOf(INQ_MOVED)], [true, "divided", "divided"]);
  t("and the act names the obligation it just raised on the published case",
    [div.reevaluation?.source ?? null, (div.reevaluation?.raised ?? []).map((x) => x.bundle_id)],
    ["supersession", [INQ_CASE]]);

  const r = await reevals(INQ_MOVED);
  t("the read reports it with source `supersession`, ahead of any lifecycle source",
    [r.count, r.obligations[0]?.bundle_id ?? null, r.obligations[0]?.causes?.[0]?.source ?? null],
    [1, INQ_CASE, "supersession"]);
  t("and it names BOTH children, from the reverse index rather than from a graph walk",
    (r.obligations[0]?.superseded_by ?? []).sort(), [KID_A, KID_B].sort());
  t("the moved leg is still named by its ordinal, which is what makes it addressable (REC-11)",
    (r.obligations[0]?.legs ?? []).map((l) => l.ord), [2]);
  t("NO STRENGTH WAS ALTERED — the derived pair still reads capture B / connection C",
    await strengthPair(INQ_CASE), ["B", "C"]);
  t("and the frozen pair in the ratified bytes is byte-identical to what the group signed",
    await frozenPairOf(INQ_CASE), FROZEN_1);
  t("the case's own basis leg still names the PARENT and was not re-pointed for anybody",
    (await legsOf(INQ_CASE)).map((l) => l.target), [INFO_CAP, INFO_CONN, INQ_MOVED]);
  t("op=backlinks answers the supersedes edges the other way, as REC-16 landed them",
    (rP(await GET(`op=backlinks&token=mem-rec17&target=${INQ_MOVED}`)).backlinks || [])
      .filter((b) => b.rel === "supersedes").map((b) => b.from).sort(), [KID_A, KID_B].sort());
}

/* ====================================== 6. DEC-12: a newer EDITION */
console.log("\n--- 6. DEC-12: a newer edition surfaces the obligation and recomputes nothing ---");
{
  /* A question that rests on the CASE, naming edition 1 — the shape C-21.2
     requires of a leg on a published case, and the shape DEC-12 rules keeps
     citing edition 1 when edition 2 appears. */
  await mustPromote(INQ_DEPENDS, inquiryMd(INQ_DEPENDS, {
    question: "Should this go to the county grand jury?",
    refs: [INQ_CASE],
    legs: [{ target: INQ_CASE, grade: "C", axis: "connection", source: "inherited", edition: 1 }] }),
    "inquiry", "open");
  t("(fixture) the dependent inherits edition 1's frozen connection grade, at the edition it names",
    (await legsOf(INQ_DEPENDS)).map((l) => [l.target, l.grade, l.grade_source, l.target_edition]),
    [[INQ_CASE, "C", "inherited", 1]]);
  t("and nothing is owed on it yet: edition 1 is the edition it rests on",
    (await reevals(INQ_CASE)).count, 0);

  const re = await reopen(PILAR, INQ_CASE, "the county released the delegation file and it bears on this");
  t("reopening the PUBLISHED case succeeds (DEC-12: it does not unpublish) and raises the obligation",
    [re.ok, re.reevaluation?.source ?? null, (re.reevaluation?.raised ?? []).map((x) => x.bundle_id)],
    [true, "reopened", [INQ_DEPENDS]]);

  await conclude(PILAR, { target: INQ_CASE,
    conclusion: "The transfer was made on a memo nobody adopted, and the delegation file does not cure it.",
    falsifier: "A delegation naming the signer for transfers of this size would overturn this." });
  const pub2 = await publish(PILAR, { target: INQ_CASE,
    statement: "Edition 2 covers the FY2024 transfer and the delegation file released on 2026-07-10; the "
             + "FY2023 comparison is still outside it.",
    excluded: [{ description: "the FY2023 comparison memo", reason: "a records request for it is outstanding" }],
    subjectPosition: "sought_no_answer",
    subjectJustification: "We put edition 2's added claim to the City Administrator on 2026-07-12 and had no reply by publication.",
    /* ADDED 2026-08-05, REC-47: FRESH for edition 2 (C-21.1 refuses a reprint). */
    biasAcknowledgement: "The declared position on public adoption is unchanged; edition 2 applies it to the "
                       + "delegation file released on 2026-07-10." });
  const rat2 = await ratify(INQ_CASE);
  t("(fixture) the case republishes at edition 2 and ratifies with its own signature",
    [pub2.ok, pub2.edition, rat2.ok, rat2.edition], [true, 2, true, 2]);
  /* CORRECTED 2026-08-04, REC-44 / DEC-44. The obligation is reported PER
     FINDING and not at the case level, and it has to be: a basis leg rests on a
     FINDING (one proposition, one falsifier — DEC-32), so what a new edition
     moves under a dependent is a particular finding's frozen pair. The old
     read was at the top of the answer, which was only ever correct because a
     case was assumed to be exactly one inquiry (D-187). Same values demanded,
     one altitude down. */
  const f2 = pub2.findings[0];
  t("op=publish names the obligation the new edition raises PER FINDING, and only from edition 2 onward",
    [f2.reevaluation?.source ?? null, f2.reevaluation?.edition ?? null,
     (f2.reevaluation?.raised ?? []).map((x) => x.bundle_id)], ["edition", 2, [INQ_DEPENDS]]);
  t("edition 1 is NOT what raised it: publishing edition 1 raised nothing, because nothing rested on a prior one",
    "reevaluation" in pub1.findings[0], false);

  const r = await reevals(INQ_CASE);
  t("the read reports the obligation on the dependent, with the edition it cited and the edition that now stands",
    [r.count, r.obligations[0]?.bundle_id ?? null,
     r.obligations[0]?.causes?.[0]?.source ?? null, r.obligations[0]?.causes?.[0]?.cited_edition ?? null,
     r.obligations[0]?.causes?.[0]?.latest_edition ?? null,
     r.obligations[0]?.causes?.[0]?.latest_ratified_edition ?? null],
    [1, INQ_DEPENDS, "edition", 1, 2, 2]);
  t("THE LEG STILL NAMES EDITION 1: nothing followed the case forward on the member's behalf (DEC-12)",
    (r.obligations[0]?.legs ?? []).map((l) => [l.ord, l.target_edition]), [[0, 1]]);
  t("and the dependent's own LEG is unchanged — the inherited C it took from edition 1, not recomputed against edition 2",
    (await legsOf(INQ_DEPENDS)).map((l) => [l.grade, l.grade_source, l.target_edition]),
    [["C", "inherited", 1]]);
  t("edition 1 stays readable and separately verifiable, which is what makes the leg's claim still true",
    (rP(await GET(`op=publishededitions&token=mem-rec17&id=${INQ_CASE}`)).editions || [])
      .map((e) => e.edition), [1, 2]);
  t("the whole-corpus sweep finds both standing obligations and no others",
    (await reevals()).obligations.map((o) => [o.bundle_id, o.causes[0].source]).sort(),
    [[INQ_CASE, "supersession"], [INQ_DEPENDS, "edition"], [INQ_WORKING, "deferred"]].sort());
}

/* ================================================= 7. the gate */
console.log("\n--- 7. op=reevaluations is a GATED read, and its viewer is the server's ---");
{
  const forged = rP(await GET(`op=reevaluations&token=mem-rec17&target=${INQ_CASE}&viewer=class:nobody`));
  t("a caller-supplied `viewer` is OVERWRITTEN by the server's stamp, never honoured (REC-29's lesson)",
    [forged.ok, forged.count], [true, 1]);
  const src = readFileSync(fileURLToPath(new URL("../src/index.mjs", import.meta.url)), "utf8");
  t("the op is in the ONE viewer-stamp condition in index.mjs",
    /op === "reevaluations"/.test(src), true);
  const store = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  const body = store.slice(store.indexOf("  reevaluations({"), store.indexOf("  #reevalMoved("));
  t("the read takes BOTH gate shapes: the target through #viewerSees, the rows through #bundleRedactor",
    [/#viewerSees\(target, viewer\)/.test(body), /#bundleRedactor\(viewer\)/.test(body)], [true, true]);
  t("an act's echo is gated the same way — a write does not buy a weaker read posture",
    /#reevalRaisedBy\(targetId, viewer\)\s*\{[\s\S]{0,400}#bundleRedactor\(viewer\)/.test(store), true);
  /* The classification itself is asserted STRUCTURALLY, in gate-reads.test.mjs,
     over index.mjs's OPS table: an unclassified read op fails that suite. Named
     here so a reader of this suite knows where the other half lives. */
  t("and gate-reads.test.mjs is where the classification is held, structurally",
    /reevaluations: "REC-17/.test(readFileSync(fileURLToPath(
      new URL("./gate-reads.test.mjs", import.meta.url)), "utf8")), true);
}

/* ============================== 8. structural: a query, and not a flag */
console.log("\n--- 8. STRUCTURAL: a query and not a flag, and no verdict computed from strength ---");
{
  const store = readFileSync(fileURLToPath(new URL("../src/store.mjs", import.meta.url)), "utf8");
  /* THE TITLE OF THE ITEM, as a property of the source. The three reeval
     columns are written in exactly ONE place — the projection derived from the
     document's own `reeval_pending` — and no derivation anywhere assigns them.
     A stored obligation would go stale in both directions and would put the
     plane's verdict where the member's belongs. */
  t("no code path ASSIGNS reeval_flag/since/source: they are projected from the document and never derived into",
    (store.match(/reeval_(flag|since|source)\s*=(?!=)/g) || []), []);
  const readBody = store.slice(store.indexOf("  reevaluations({"), store.indexOf("  #reevalMoved("));
  t("the obligation is derived on READ — reevaluations() writes nothing at all",
    readBody.match(/\b(INSERT|UPDATE|DELETE)\b/g) || [], []);
  t("the reverse lookup is ONE indexed query on inquiry_basis_target, exactly as the item specifies",
    /FROM inquiry_basis WHERE target_id=\?/.test(store), true);
  t("and the supersession half is a COLUMN READ, not a scan: the reverse of a supersedes edge is projected",
    [/inquiry_superseded_by/.test(store),
     /SELECT bundle_id FROM refs WHERE target_id=\? AND kind='supersedes'/.test(store)], [true, true]);
  t("NOTHING in the obligation is computed from a strength: the pair is read out and never compared",
    readBody.match(/GRADE_RANK|weakerGrade|weakestOf/g) || [], []);
  t("the two CITED refusals and op=affordances run the SAME predicate, so a published act and a refusal cannot disagree",
    (store.match(/#restsOnLive\(/g) || []).length >= 4, true);
  const aff = readFileSync(fileURLToPath(new URL("../src/affordances.mjs", import.meta.url)), "utf8");
  t("the act catalogue reads that predicate's COUNTS and never its ids: an affordance names no dependent",
    [/rested_on\?\.working/.test(aff), /rested_on\.[a-z]*\.map/.test(aff)], [true, false]);
}

await mf.dispose();
console.log(`\nreevaluation: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
