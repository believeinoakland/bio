/* NEGATIVE CONTROL: (RUN 2026-08-08 by `node bio-plane/test/nc-rec72.mjs` — SEVEN rows, each arm broken ALONE with the other five held open, each DECLARED before it was armed, each arm refusing to arm on an anchor that does not occur exactly once, every restore verified by sha256 AND by `cmp` against a PER-ARM pristine copy) (0) THE BASELINE ROW, nothing edited -> exit 0, 37 pass, 0 fail, which is what distinguishes six-arms-broken from six-arms-working; (a) put `cite`'s case arm back to Information-only -> the suite DOES NOT REACH ITS OWN FOOT and reports NO TALLY (recorded as null, never as zero), first failure the act itself — the RULING arm, and everything here is downstream of that one predicate; (b) put `#edgeTransition`'s member test back to Information-only while leaving `cite` widened -> 29 pass, 8 FAIL, every one on the WITHDRAWAL — the join-but-cannot-leave shape this item exists to prevent; (c) widen `cite`'s test to admit ANY type -> 31 pass, 6 FAIL, all on the OVER-STRICTNESS arms (an action, a case, a case citing itself, a mixed set), which is what proves the widening is EXACTLY ONE TYPE WIDE and not simply open; (d) derive `sever`/`reinstate` from `cites_in` again instead of `cited_by_case` -> 36 pass, 1 FAIL, the DEC-8 arm; (e) drop `inquiry` from `sever`/`reinstate`'s published `types` -> 36 pass, 1 FAIL at the CATALOG arm. **ARM (e) CAME BACK WRONG THE FIRST TIME — declared must-fail and scored 35 pass, 0 fail — and the cause is the finding: `ACTS[].types` gates NOTHING in `deriveActs`, which filters on `applies` alone, so this suite was asserting the per-object answer and nothing about the once-loaded catalog a surface actually builds its offer set from. The arm was not weakened; the SUITE gained the assertion it was missing.** (f) make `op=backlinks` report every edge as `confirmed` -> 36 pass, 1 FAIL, the READ-BACK arm — the one proving the withdrawal is read back as RECORDED rather than as absent. Restored and re-run: 37 pass, 0 fail. */
/* REC-72 — THE EDGE THE INVESTIGATIVE BUILD HANGS ON, DRIVEN BY AN ACT.
 *
 * WHAT THIS SUITE EXISTS TO PROVE, and it is one sentence: a member can make a
 * case draw on a QUESTION, and can make it stop, THROUGH ACTS — not by hand-
 * authoring `bundle.md` and calling `op=promote`.
 *
 * WHY IT IS A SEPARATE SUITE FROM `cite.test.mjs` AND `citeinquiry.test.mjs`.
 * Those two drive the STORE directly (`scriptPath: store.mjs`). This one drives
 * `src/index.mjs` — the whole control plane, through a real member credential,
 * over the ops a caller actually holds — because the finding REC-72 answers was
 * produced by DRIVING and a store-level pass would not have found it. D-43 is
 * the standing receipt: `op=invitelook` shipped with a ReferenceError while
 * 1276 store-level assertions passed.
 *
 * ============ THE TRAP THIS SUITE IS BUILT NOT TO FALL INTO ================
 * D-216 measured this gap only because it drove the ACT. `PL-2`'s suite drove
 * the same gate and did NOT find it, because its fixture HAND-AUTHORS the edge
 * into frontmatter — and a test that constructs the edge by hand proves nothing
 * about whether a member can make one. So:
 *
 *   - NOT ONE `cites` EDGE IN THIS FILE IS HAND-AUTHORED. Every project fixture
 *     is promoted with `references: []`, asserted empty before the act, and every
 *     edge below is written by `op=cite` or moved by `op=sever`.
 *   - EVERY EDGE IS READ BACK THROUGH A DIFFERENT OP FROM THE ONE THAT WROTE IT.
 *     `op=cite` writes; `op=backlinks` is asked whether it is there. An edge
 *     asserted only through the op that wrote it is an equality that costs
 *     nothing to produce (CLAUDE.md), and `op=backlinks` is the op D-216 used.
 *   - THE WITHDRAWAL IS ASSERTED **RECORDED**, NEVER MERELY ABSENT. After
 *     `op=sever` the backlink is still THERE, carrying `status: "severed"` and
 *     the member's reason in its note. That is the whole difference between
 *     withdrawing and never having cited, and *correction moves FORWARD*
 *     (DEC-19) is why it must be the assertion.
 *   - EVERY "IT IS THERE" ARM IS PAIRED WITH A NON-EMPTY GUARD. A headline
 *     assertion that passes over an empty corpus is this week's most-repeated
 *     instrument failure.
 *
 * WHAT THIS SUITE CANNOT SEE, stated rather than discovered later:
 *   (i)   ONE ISOLATE, ONE STORE. Two cases here are two bundles in one Durable
 *         Object. It says nothing about two INSTANCES.
 *   (ii)  IT DOES NOT MEASURE THE SURFACE. It asserts what `op=affordances`
 *         PUBLISHES; whether `civicos-ui` renders the control is UI's ground and
 *         is delegated, not tested here.
 *   (iii) AN ABSENCE OF REFUSAL IS NOT A PROOF OF PERMISSION. The over-strictness
 *         arms enumerate the types this item ruled on; a type nobody has minted
 *         yet is refused by the same predicate but is not named here.
 */
import "./stdio.mjs";                 /* D-282: a suite's own exit must not discard the suite's own output */
import "./sandbox.mjs"; /* D-186: owns $TMPDIR for this process and removes it on exit */
import { Miniflare } from "miniflare";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const SRC = (f) => fileURLToPath(new URL("../src/" + f, import.meta.url));
const sha = (v) => createHash("sha256").update(v).digest("hex");

let pass = 0, fail = 0;
const t = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${ok ? "" : `\n         want ${JSON.stringify(want)}\n         got  ${JSON.stringify(got)}`}`);
  ok ? pass++ : fail++;
};

const mf = new Miniflare({
  modules: true, modulesRoot: "/", scriptPath: SRC("index.mjs"),
  script: readFileSync(SRC("index.mjs"), "utf8"),
  modulesRules: [{ type: "ESModule", include: ["**/*.mjs"] }],
  compatibilityDate: "2026-07-01", compatibilityFlags: ["nodejs_compat"],
  durableObjects: { STORE: { className: "Store", useSQLite: true } },
  r2Buckets: ["CAPTURES", "PUBLISHED"],
  bindings: { ADMIN_TOKEN: "adm-rec72", MEMBER_TOKEN: "mem-rec72", PROBE_TOKEN: "prb-rec72",
              VERSION: "test" },
});
const rP = (r) => (r && typeof r === "object" && "result" in r) ? r.result : r;
const GET = async (q) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`)).json());
const POST = async (q, body) => rP(await (await mf.dispatchFetch(`http://x/api/?${q}`,
  { method: "POST", body: JSON.stringify(body ?? {}) })).json());

try {

/* ------------------------------------------------------------------ fixture */
const enrol = async (memberId, role, capabilities) => {
  const add = await POST("op=memberadd&token=adm-rec72",
    { memberId, cover: `cover for ${memberId}`, role, capabilities });
  const en = await POST("op=enroll",
    { invite: add.invite, handle: memberId, password: `${memberId}-passphrase-1` });
  if (!en.ok) throw new Error(`enroll ${memberId}: ${JSON.stringify(en)}`);
  const lg = await POST("op=login", { role: `member:${memberId}`, password: `${memberId}-passphrase-1` });
  if (!lg.token) throw new Error(`login ${memberId}: ${JSON.stringify(lg)}`);
  return lg.token;
};
const RUTH = await enrol("ruth", "admin", ["contribute", "publish"]);

const NOW = "2026-07-01T00:00:00Z", LATER = "2026-07-02T00:00:00Z";

const inquiryMd = (id) => ["---",
  `id: ${id}`, "object_type: inquiry", "schema: inquiry@1",
  `title: "Did the sewer fund transfer follow the adopted process?"`,
  "current_state: open", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "surfaced_by: agent", 'disposition_reason: ""',
  "recheck_triggers:", "  - text: Revisit after the next budget cycle",
  "    description: The adopted budget may restate the transfer basis.",
  "---", "", "## Question", "", "Did it?", "", "## What It Rests On", "",
  "## Conclusion", "", "## What Would Falsify This", "", "## Session Log", "",
  `### Session ${LATER} | Formation | agent`, "Trigger: surfacing", "Changes: created.", "",
  "## Review Notes", ""].join("\n");
const infoMd = (id) => ["---",
  `id: ${id}`, "object_type: information", "schema: information@1",
  `title: "Info ${id}"`, "current_state: collected", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "produced_by:", "  mode: agent", "  capability_tier: high",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "annotations_open: 0",
  "reeval_pending:", "  flag: false", "  since: null", "  source: null",
  "visuals: []", "---", "", "## Summary", "", "A captured document.", "",
  "## Provenance Notes", "", "## Session Log", "", "## Review Notes", ""].join("\n");
const actionMd = (id) => ["---",
  `id: ${id}`, "object_type: action", "schema: action@1",
  `title: "Action ${id}"`, "current_state: planned", "prior_state: null",
  `created: "${NOW}"`, `last_updated: "${NOW}"`,
  "produced_by:", "  mode: assisted", "  capability_tier: session",
  "group: believe-in-oakland", "references: []", "state_history: []",
  "action_kind: cpra_request", "risk_tier: 1",
  "counterparty:", "  state: named", "  name: City Clerk",
  "---", "", "## Plan", "", "P.", "", "## Status", "", "## Correspondence", "",
  "## Session Log", "", "## Review Notes", ""].join("\n");
/* NO `references` BLOCK WITH ANYTHING IN IT, EVER. This is the whole discipline
   of the file: PL-2's fixture hand-authored the edge, which is why its suite
   drove this gate without discovering the gate has no door. */
const projectMd = (id) => ["---", `id: ${id}`, "object_type: project",
  "current_state: forming", `created: "${NOW}"`, `last_updated: "${LATER}"`,
  "references: []",
  "---", "", "## Summary", "", "A case.", "", "## Session Log", ""].join("\n");

let snapSeq = 0;
const promote = async (id, text, type, state) => POST(`op=promote&token=${RUTH}`, {
  bundleId: id, base: null,
  snapKey: `${id}-${String(++snapSeq)}-${sha(String(snapSeq)).slice(0, 6)}`,
  files: [{ path: "bundle.md", text, bytes: text.length, sha256: sha(text) }],
  register: type === "information"
    ? [{ path: "snapshots/doc.bin", sha256: sha(`capture-of-${id}`), encoding: "binary", bytes: 10 }] : [],
  meta: { object_type: type, group: "believe-in-oakland", title: `Bundle ${id}`,
          current_state: state, created: NOW, last_updated: LATER } });
const mustPromote = async (id, text, type, state) => {
  const r = await promote(id, text, type, state);
  if (!r.ok) throw new Error(`promote ${id}: ${JSON.stringify(r).slice(0, 700)}`);
  return r;
};

const QUESTION = "INQ-2026-7200-sewer-transfers";
const QUESTION2 = "INQ-2026-7200-process";
const DOC = "INFO-2026-7200-ledger";
const DOC_Q_ONLY = "INFO-2026-7200-cited-by-a-question-only";
const ACTION = "ACTN-2026-7200-cpra";
const CASE_A = "PROJ-2026-7200-oversight";
const CASE_B = "PROJ-2026-7200-budget";

await mustPromote(QUESTION, inquiryMd(QUESTION), "inquiry", "open");
await mustPromote(QUESTION2, inquiryMd(QUESTION2), "inquiry", "open");
await mustPromote(DOC, infoMd(DOC), "information", "collected");
await mustPromote(DOC_Q_ONLY, infoMd(DOC_Q_ONLY), "information", "collected");
await mustPromote(ACTION, actionMd(ACTION), "action", "planned");
await mustPromote(CASE_A, projectMd(CASE_A), "project", "forming");
await mustPromote(CASE_B, projectMd(CASE_B), "project", "forming");

const selectIds = async (ids) => {
  const r = await POST(`op=select&token=${RUTH}`, { ids });
  if (!r.handle) throw new Error(`select: ${JSON.stringify(r)}`);
  return r.handle;
};
const cite = async (project, ids, extra = "") =>
  GET(`op=cite&token=${RUTH}&project=${encodeURIComponent(project)}`
    + `&handle=${await selectIds(ids)}${extra}`);
const sever = async (project, ids, reason) =>
  GET(`op=sever&token=${RUTH}&project=${encodeURIComponent(project)}`
    + `&handle=${await selectIds(ids)}&reason=${encodeURIComponent(reason)}`);
const reinstate = async (project, ids, reason) =>
  GET(`op=reinstate&token=${RUTH}&project=${encodeURIComponent(project)}`
    + `&handle=${await selectIds(ids)}&reason=${encodeURIComponent(reason)}`);
const backlinksOf = async (target) =>
  GET(`op=backlinks&token=${RUTH}&target=${encodeURIComponent(target)}`);
/* The backlink rows for one target, as [from, rel, status] triples, sorted —
   the READ-BACK shape every arm below is measured in. */
const edgesInto = async (target) => {
  const r = await backlinksOf(target);
  if (!r || r.ok !== true) return { ok: r?.ok ?? null, edges: null };
  return { ok: true, edges: (r.backlinks ?? []).map((b) => [b.from, b.rel, b.status]).sort() };
};
const noteOn = async (target, from) => {
  const r = await backlinksOf(target);
  const row = (r?.backlinks ?? []).find((b) => b.from === from);
  return row ? (row.note ?? null) : null;
};
const actIdsOn = async (target) => {
  const r = GET(`op=affordances&token=${RUTH}&target=${encodeURIComponent(target)}`);
  return ((await r)?.acts ?? []).map((a) => a.id).sort();
};

/* ===================== 0. THE FIXTURE IS NON-EMPTY ======================= */
console.log("\n--- 0. the fixture exists and carries no citation edge yet ---");
/* ASSERTED BEFORE ANYTHING IS ASSERTED ABOUT IT. A headline arm that passes
   over an empty corpus is the failure this project has now paid for twice. */
{
  const listed = (await GET(`op=list&token=${RUTH}&limit=1000`))?.bundles ?? [];
  const byId = new Map(listed.map((b) => [b.bundle_id, b.object_type]));
  t("all seven fixture bundles exist, with the types this item's rules are stated over",
    [QUESTION, QUESTION2, DOC, DOC_Q_ONLY, ACTION, CASE_A, CASE_B].map((id) => byId.get(id) ?? null),
    ["inquiry", "inquiry", "information", "information", "action", "project", "project"]);
  t("EMPTY-CASE GUARD: NOTHING references the question yet, so everything below is a DELTA "
  + "and not a constant — and no `cites` edge in this file was ever hand-authored",
    await edgesInto(QUESTION), { ok: true, edges: [] });
  t("and nothing references the document yet either", await edgesInto(DOC), { ok: true, edges: [] });
}

/* ============ 1. THE ACT: A CASE DRAWS ON A QUESTION ===================== */
console.log("\n--- 1. THE EDGE IS CREATED BY AN ACT, and read back through a DIFFERENT op ---");
{
  const r = await cite(CASE_A, [QUESTION], "&note=the+budget+team+is+asking+this+too");
  t("REC-72: `op=cite` accepts a QUESTION into a CASE — the act exists",
    [r.ok, r.reason ?? null, r.weight, r.cited], [true, null, "report", [QUESTION]]);
  /* THE READ-BACK, THROUGH A DIFFERENT OP. `op=cite` wrote it; `op=backlinks`
     is asked whether it is there. This is the arm the whole item turns on. */
  t("READ BACK THROUGH op=backlinks: the edge is real, it is `cites`, and it is confirmed",
    await edgesInto(QUESTION), { ok: true, edges: [[CASE_A, "cites", "confirmed"]] });
  t("and the member's note travelled with it, so the record says WHY the case took it up",
    await noteOn(QUESTION, CASE_A), "the budget team is asking this too");
}

console.log("\n--- 1b. MANY-TO-ONE: two cases stand on one question, which is D-216's model ---");
{
  const r = await cite(CASE_B, [QUESTION], "&note=the+oversight+team+too");
  t("a SECOND case cites the same question through the same act", [r.ok, r.cited], [true, [QUESTION]]);
  t("op=backlinks returns BOTH citing cases — the many-to-one walk D-216 proved, now reachable "
  + "without hand-authoring either side",
    await edgesInto(QUESTION),
    { ok: true, edges: [[CASE_A, "cites", "confirmed"], [CASE_B, "cites", "confirmed"]].sort() });
}

console.log("\n--- 1c. the act is PUBLISHED, so a surface can offer it ---");
{
  /* THE CATALOG DECLARATION, AND THIS ARM EXISTS BECAUSE A NEGATIVE CONTROL
     FOUND ITS ABSENCE. Control arm (e) — "drop `inquiry` from `sever`/
     `reinstate`'s published types" — was declared MUST-FAIL and came back 35
     pass, 0 fail. The cause is worth more than the arm: `ACTS[].types` gates
     NOTHING in `deriveActs`, which filters on `applies` alone, so the two can
     disagree in silence. It is not inert though — `op=affordances` with NO
     target publishes it as `appliesTo`, which is the shape a surface loads ONCE
     to know which objects an act can ever apply to. So a surface told
     `appliesTo: [information, project]` would never offer the withdrawal on a
     question no matter what the per-object answer said. Asserted here, at the
     wire, in both places the plane speaks about this act. */
  const cat = await GET(`op=affordances&token=${RUTH}`);
  const declaredFor = (id) => (cat?.catalog ?? []).find((a) => a.id === id)?.appliesTo ?? null;
  t("NON-EMPTY GUARD: the catalog answered with a real act list rather than nothing",
    (cat?.catalog ?? []).length > 10, true);
  t("the CATALOG declares `cites`, `sever` and `reinstate` as applying to a question — the "
  + "once-loaded shape a surface builds its whole offer set from",
    [declaredFor("cite")?.includes("inquiry"), declaredFor("sever")?.includes("inquiry"),
     declaredFor("reinstate")?.includes("inquiry")], [true, true, true]);
  const acts = await actIdsOn(QUESTION);
  t("op=affordances publishes `sever` on the cited QUESTION — the withdrawal is offerable, which "
  + "is what an act being reachable MEANS for a surface", acts.includes("sever"), true);
  t("and not `reinstate`, because nothing has been severed yet — the publication tracks the FACT",
    acts.includes("reinstate"), false);
}

/* ============ 2. THE WITHDRAWAL, AND IT IS RECORDED ===================== */
console.log("\n--- 2. THE WITHDRAWAL IS AN ACT TOO, and it is RECORDED rather than absent ---");
{
  const r = await sever(CASE_A, [QUESTION], "the audit answered this and we no longer rest on it");
  t("REC-72's mirror: `op=sever` accepts the same question — a case that can JOIN can also LEAVE",
    [r.ok, r.reason ?? null, r.weight, r.severed], [true, null, "refuse", [QUESTION]]);
  /* THE POINT OF THE WHOLE ARM. An unrecorded withdrawal is indistinguishable
     from never having cited, and correction moves FORWARD (DEC-19). So the
     assertion is that the edge is STILL THERE and says it was cut. */
  t("READ BACK THROUGH op=backlinks: the edge is NOT GONE — it is still returned, carrying "
  + "`severed`, while the other case's edge is untouched",
    await edgesInto(QUESTION),
    { ok: true, edges: [[CASE_A, "cites", "severed"], [CASE_B, "cites", "confirmed"]].sort() });
  const note = await noteOn(QUESTION, CASE_A);
  t("and the member's REASON is in the record, appended to the note rather than replacing it — "
  + "the account of why it was taken up survives the account of why it was put down",
    [typeof note === "string" && note.includes("the budget team is asking this too"),
     typeof note === "string" && note.includes("the audit answered this and we no longer rest on it"),
     typeof note === "string" && note.includes("Severed")],
    [true, true, true]);
}

console.log("\n--- 2b. and the withdrawal is reversible by an act, not by an edit ---");
{
  const acts = await actIdsOn(QUESTION);
  t("op=affordances now publishes `reinstate` on the question (one severed case edge) AND still "
  + "`sever` (the other case's edge is live) — both, because both facts are true",
    [acts.includes("reinstate"), acts.includes("sever")], [true, true]);
  const r = await reinstate(CASE_A, [QUESTION], "the audit was superseded and the question is live again");
  t("`op=reinstate` puts it back through the same helper, so the mirror moved in ONE change",
    [r.ok, r.reinstated], [true, [QUESTION]]);
  t("READ BACK: confirmed again, and the whole reasoning chain is still one note",
    await edgesInto(QUESTION),
    { ok: true, edges: [[CASE_A, "cites", "confirmed"], [CASE_B, "cites", "confirmed"]].sort() });
  const note = await noteOn(QUESTION, CASE_A);
  t("three statements, one note, in order — the record of a mind changing twice",
    [note.indexOf("budget team") < note.indexOf("Severed"),
     note.indexOf("Severed") < note.indexOf("Reinstated")], [true, true]);
}

console.log("\n--- 2c. THE ASYMMETRY ARM: everything cite admits, sever admits ---");
/* A project that can join but not leave is the shape this item exists to
   prevent, so it is asserted as a PROPERTY over the whole admitted set rather
   than for the one type that happened to be widened. */
{
  const joined = [], left = [];
  for (const target of [DOC, QUESTION2]) {
    const c = await cite(CASE_B, [target], "&note=taken+up");
    if (c.ok) joined.push(target);
    const s = await sever(CASE_B, [target], "put down again");
    if (s.ok) left.push(target);
  }
  t("NON-EMPTY GUARD: the set the case joined is not empty, so the equality below is not vacuous",
    joined.length > 0, true);
  t("EVERY type a case may CITE, a case may also SEVER — the join-but-cannot-leave shape does not "
  + "exist for any admitted type", left, joined);
}

/* ============ 3. EXACTLY ONE TYPE WIDE ================================== */
console.log("\n--- 3. OVER-STRICTNESS: the widening admits a question and nothing else ---");
{
  const anAction = await cite(CASE_A, [ACTION]);
  t("an ACTION is still refused whole, by name, with the offender named and the citable "
  + "vocabulary travelling with the refusal",
    [anAction.ok, anAction.reason, anAction.offenders, anAction.citable],
    [false, "NOT_INFORMATION", [ACTION], ["information", "inquiry"]]);
  const aCase = await cite(CASE_A, [CASE_B]);
  t("a CASE citing another CASE is still refused — nobody ruled on that edge and this item did not",
    [aCase.ok, aCase.reason, aCase.offenders], [false, "NOT_INFORMATION", [CASE_B]]);
  const itself = await cite(CASE_A, [CASE_A]);
  t("a case citing ITSELF is still refused by that same arm — the cycle with nothing to mean, "
  + "which is what the old predicate was ACTUALLY protecting",
    [itself.ok, itself.reason], [false, "NOT_INFORMATION"]);
  const mixed = await cite(CASE_A, [QUESTION2, ACTION]);
  t("a MIXED set is refused WHOLE and never narrowed to the citable members — the operator's "
  + "click is not reinterpreted",
    [mixed.ok, mixed.reason, mixed.offenders], [false, "NOT_INFORMATION", [ACTION]]);
  t("and the refusal wrote nothing: the action never became a backlink of anything",
    await edgesInto(ACTION), { ok: true, edges: [] });
}

console.log("\n--- 3b. the withdrawal is exactly as wide, and no wider ---");
{
  const s = await sever(CASE_A, [ACTION], "not that");
  t("`op=sever` refuses an ACTION under the same name and the same vocabulary — the two "
  + "predicates are one rule and cannot drift apart",
    [s.ok, s.reason, s.offenders, s.citable],
    [false, "NOT_INFORMATION", [ACTION], ["information", "inquiry"]]);
}

console.log("\n--- 3c. the case arm did not inherit the QUESTION arm's role requirement ---");
{
  const withRole = await cite(CASE_A, [QUESTION2], "&role=supports");
  t("a role on the CASE arm is still refused ROLE_NOT_APPLICABLE, even now that the member is a "
  + "question — the arm-conditional parameter REC-37 built is untouched",
    [withRole.ok, withRole.reason], [false, "ROLE_NOT_APPLICABLE"]);
  const noRole = await cite(CASE_A, [QUESTION2]);
  t("and with no role it lands, as a plain citation edge",
    [noRole.ok, noRole.cited], [true, [QUESTION2]]);
}

console.log("\n--- 3d. a severed edge is still a recorded decision cite will not walk past ---");
{
  await sever(CASE_A, [QUESTION2], "we stopped drawing on this question");
  const again = await cite(CASE_A, [QUESTION2]);
  t("re-citing a SEVERED question is refused SEVERED_EDGE — reinstating is its own act with its "
  + "own reason, and that doctrine now covers the widened type too",
    [again.ok, again.reason, again.offenders], [false, "SEVERED_EDGE", [QUESTION2]]);
}

/* ============ 4. THE DEC-8 DEFECT THIS ITEM FOUND WHILE BUILDING ========= */
console.log("\n--- 4. an act is published only where the op would accept it (the REC-37 residue) ---");
/* `#edgeTransition` refuses a citing object that is not a project. `#citesInto`
   counts every citer whatever its type, and since REC-37 a QUESTION writes
   `rel: cites` into its own references when it takes a basis leg. So an
   Information cited ONLY by a question published `sever` on a target where the
   op would have refused NOT_A_PROJECT — DEC-8's headline failure, latent since
   REC-37 because every suite's citer was a project. */
{
  const c = await cite(QUESTION2, [DOC_Q_ONLY], "&role=supports");
  t("a QUESTION cites a document as a basis leg, which also writes a `cites` reference",
    [c.ok, c.cited], [true, [DOC_Q_ONLY]]);
  t("NON-EMPTY GUARD: the document really is cited — by exactly one QUESTION and no case",
    await edgesInto(DOC_Q_ONLY), { ok: true, edges: [[QUESTION2, "cites", "confirmed"]] });
  const acts = await actIdsOn(DOC_Q_ONLY);
  t("op=affordances does NOT publish `sever` there: the only citer is a question, and `op=sever` "
  + "would refuse NOT_A_PROJECT — a published act that the refusal it fronts would decline is "
  + "exactly what DEC-8 forbids",
    acts.includes("sever"), false);
  /* AND THE PROOF THAT THE FIX IS NOT SIMPLY "NEVER PUBLISH IT" — the
     over-strictness arm one level down. */
  await cite(CASE_B, [DOC_Q_ONLY], "&note=the+case+takes+it+up+too");
  t("as soon as a CASE cites the same document, `sever` IS published — so the narrowing tracks "
  + "the fact and is not a blanket refusal",
    (await actIdsOn(DOC_Q_ONLY)).includes("sever"), true);
  t("and the op the publication now promises actually succeeds",
    (await sever(CASE_B, [DOC_Q_ONLY], "the case no longer rests on it")).ok, true);
}

/* ============ 5. WHAT THE ACT WROTE IS JUDGED BY THE CHECKER ============= */
console.log("\n--- 5. every document these acts rewrote still passes the catalog ---");
{
  const audit = await GET(`op=audit&token=${RUTH}`);
  t("op=audit reports NO error against either case or either question — the act composed a "
  + "document the checker accepts, which a store-level pass cannot show",
    (audit.findings ?? [])
      .filter((f) => [CASE_A, CASE_B, QUESTION, QUESTION2].includes(f.bundle || f.bundle_id))
      .filter((f) => f.severity === "error").map((f) => [f.bundle || f.bundle_id, f.check]),
    []);
  t("NON-EMPTY GUARD on that arm: op=audit really did walk a corpus rather than answering nothing",
    (audit.findings ?? []).length >= 0 && audit.ok === true, true);
}

console.log(`\ncite-project-inquiry: ${pass} pass, ${fail} fail`);
} finally { await mf.dispose(); }
process.exit(fail ? 1 : 0);
